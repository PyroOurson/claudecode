(() => {
'use strict';
const GENRES = ['Action', 'Arcade', 'Racing', 'Runner', 'Puzzle', 'Sports', 'Board', 'Brain', 'Skill', 'Strategy'];
const GENRE_NAME = { Board: 'Board & Cards', Strategy: 'Strategy & Idle' };
const GENRE_KW = {
  Action: 'action fight fighting combat battle enemies survive survival',
  Arcade: 'arcade classic retro score highscore',
  Racing: 'race racing speed track',
  Runner: 'run running runner endless dodge obstacles jump',
  Puzzle: 'puzzle logic solve think',
  Sports: 'sport sports ball match',
  Board: 'board card cards tabletop turn classic',
  Brain: 'brain memory quiz trivia words mental maths knowledge',
  Skill: 'skill reflex reflexes timing aim accuracy fast reaction',
  Strategy: 'strategy idle incremental tower defense manage resource upgrade'
};
const PL_KW = {
  s: 'solo single player alone',
  o: 'online multiplayer friend friends party room code remote lobby',
  4: '3 4 three four player players party lobby',
  6: '3 4 6 three four six player players party lobby',
  8: '3 4 6 8 three four six eight player players party lobby'
};
const STOP = new Set(['the', 'a', 'an', 'of', 'game', 'games', 'play', 'free', 'to', 'and', 'for', 'i', 'want']);
const CAT_TINT = { Action: '#d62828', Arcade: '#ff6b6b', Racing: '#3a86ff', Runner: '#ff7a59', Puzzle: '#4361ee', Sports: '#2a9d8f', Board: '#495057', Brain: '#06a77d', Skill: '#e08a00', Strategy: '#a8641c' };
const POPULAR = ['blockcraft-3d', 'dash-cube', 'sky-runner', 'slither', 'road-hopper', 'flap-bird', 'rocket-soccer', 'brick-bros'];
const FGROUPS = [
  { key: 'f', name: 'Favourites', opts: [['fav', 'My favourites']] },
  { key: 'g', name: 'Genre', opts: GENRES.map(k => [k, GENRE_NAME[k] || k]) },
  { key: 'p', name: 'Players', opts: [['s', 'Solo'], ['o', 'Online']] },
  { key: 'v', name: 'Look', opts: [['3d', '3D'], ['2d', '2D']] },
  { key: 'c', name: 'Controls', opts: [['kb', 'Keyboard'], ['tp', 'Mouse or touch']] },
  { key: 't', name: 'Length', opts: [['q', 'Quick'], ['m', 'Medium'], ['l', 'Long']] }
];
const SORTS = [['rel', 'Best match'], ['rec', 'Popular'], ['az', 'A to Z'], ['new', 'Newest'], ['played', 'Most played'], ['short', 'Shortest']];
const PATH_MODE = /(^|\.)(web\.app|firebaseapp\.com)$/i.test(location.hostname) || (() => { try { return sessionStorage.getItem('gameplay:paths') === '1'; } catch (e) { return false; } })();
const PAUSE = { on: false };
(() => { try { if (localStorage.getItem('gameplay:reset') !== '4') { const keep = k => k === 'gameplay:consent' || k === 'gameplay:lang' || k.indexOf('gameplay:gate') === 0 || k.indexOf('sb-') === 0; let o = {}; try { o = JSON.parse(localStorage.getItem('gameplay:v1') || '{}') || {}; } catch (e) {} const prefs = o.prefs; Object.keys(localStorage).forEach(k => { if (!keep(k)) localStorage.removeItem(k); }); localStorage.setItem('gameplay:v1', JSON.stringify(prefs ? { prefs } : {})); localStorage.setItem('gameplay:reset', '4'); try { indexedDB.deleteDatabase('gameplay-minecraft'); } catch (e) {} } } catch (e) {} })();
const SUPABASE_DIRECT = 'https://uafouyvtcijptspjbsqf.supabase.co';
const SUPABASE_RELAYS = ['https://gameplay-api.vitalang.net'];
const SUPABASE_URL = (typeof window.__gpSbUrl === 'string' && /^https:\/\//.test(window.__gpSbUrl) && window.__gpSbUrl) || SUPABASE_DIRECT;
const SBN = (() => {
  const K = 'gameplay:sb';
  const all = (window.__gpSbOnly ? [SUPABASE_URL] : [SUPABASE_URL, SUPABASE_DIRECT].concat(SUPABASE_RELAYS)).filter((x, i, a) => x && a.indexOf(x) === i);
  let best = SUPABASE_URL, wsB = null;
  const bad = {}, wsBad = {}, fresh = (m, b, ms) => (m[b] || 0) > Date.now() - ms;
  const strip = u => { u = String(u).replace(/^ws(s?):/, 'http$1:'); for (const b of all) if (u === b || u.indexOf(b + '/') === 0 || u.indexOf(b + '?') === 0) return u.slice(b.length); return null; };
  const order = () => [best].concat(all.filter(b => b !== best).sort((a, c) => (bad[a] || 0) - (bad[c] || 0)));
  const good = b => { delete bad[b]; window.__gpSbDown = false; if (best === b) return; best = b; try { sessionStorage.setItem(K, b); } catch (e) {} };
  const page = r => /text\/html/i.test(r.headers.get('content-type') || '');
  async function viaFetch(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : null;
    const path = url == null ? null : strip(url);
    if (path == null) return fetch(input, init);
    const o = Object.assign({}, init || {}), outer = o.signal;
    let last = null;
    for (const b of order()) {
      if (outer && outer.aborted) throw outer.reason || new DOMException('Aborted', 'AbortError');
      const ctl = new AbortController(), stop = () => ctl.abort(outer.reason);
      if (outer) outer.addEventListener('abort', stop, { once: true });
      const tm = setTimeout(() => ctl.abort(new DOMException('Timed out', 'TimeoutError')), b === best ? 15000 : 12000);
      try {
        const r = await fetch(b + path, Object.assign({}, o, { signal: ctl.signal }));
        if (page(r)) { bad[b] = Date.now(); last = new TypeError('The network answered with a web page'); continue; }
        good(b);
        return r;
      } catch (e) {
        if (outer && outer.aborted) throw e;
        bad[b] = Date.now(); last = e;
      } finally { clearTimeout(tm); if (outer) outer.removeEventListener('abort', stop); }
    }
    throw last || new TypeError('Failed to fetch');
  }
  const wsPick = () => (wsB && !fresh(wsBad, wsB, 60000)) ? wsB : (order().find(b => !fresh(wsBad, b, 60000)) || order()[0]);
  const WS = window.WebSocket ? class extends WebSocket {
    constructor(url, protocols) {
      const path = strip(url), b = path == null ? null : wsPick();
      if (protocols === undefined) super(b ? b.replace(/^http/, 'ws') + path : url); else super(b ? b.replace(/^http/, 'ws') + path : url, protocols);
      if (!b) return;
      let open = false;
      this.addEventListener('open', () => { open = true; wsB = b; delete wsBad[b]; });
      this.addEventListener('close', () => { if (!open) { wsBad[b] = Date.now(); if (wsB === b) wsB = null; } });
    }
  } : undefined;
  return { fetch: viaFetch, WS, best: () => best, ws: () => wsB, all: () => all.slice(), url: p => best + p };
})();
const GOOGLE_CLIENT_ID = '114405851703-b6u2jan6mapjucijipcecr6g8nbgf73s.apps.googleusercontent.com';
const SUPABASE_ANON_KEY = 'sb_publishable_Lry5e9J350lXelAUPHU1rg_3YYvTuAf';
const SUPABASE_JS_FILE = 'supabase-js-2.117.2.js';
const SUPABASE_JS = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js', 'https://unpkg.com/@supabase/supabase-js@2.117.2/dist/umd/supabase.js'];
const SUPABASE_SRI = 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';
const ROWS = [
  ["blockcraft-3d", "Minecraft", "Action,Strategy", "s", 30, "sandbox survival build building mine mining craft crafting blocks voxel creative world zombies", "rh"],
  ["dash-cube", "Geometry Dash", "Arcade,Runner,Skill", "s", 5, "rhythm music beat jump cube platformer neon levels fly ship", "rh"],
  ["sky-runner", "Subway Surfers", "Runner,Arcade", "s", 5, "endless runner train trains surf subway rail graffiti guard dodge coins hoverboard", "rh"],
  ["road-hopper", "Crossy Road", "Runner,Arcade", "s", 5, "hop hopper chicken cross crossing road traffic river frog frogger endless voxel", "r"],
  ["slither", "Slither.io", "Arcade,Action", "s", 8, "snake worm io multiplayer grow eat orbs battle bots", "rh"],
  ["flap-bird", "Flappy Bird", "Arcade,Skill", "s", 2, "flappy flap pipes tap fly flying bird one button hard", "r"],
  ["brick-bros", "Super Mario Bros.", "Runner,Arcade,Action", "s", 20, "mario platformer platform side scroller jump stomp plumber coins levels nintendo bros luigi", "r"],
  ["rocket-soccer", "Rocket League", "Sports,Racing,Action", "so6", 10, "soccer football car cars rocket boost ball goal drive driving vehicle vehicles octane dominus fennec aerial demo 1v1 2v2 3v3 rl", "rh"],
  ["slope-3d", "Slope", "Runner,Arcade,Skill", "s", 3, "ball roll rolling slope run endless neon downhill dodge", "rn"],
  ["tunnel-run", "Tunnel Rush", "Runner,Arcade", "s", 8, "tunnel rush endless runner tiles space wall levels power cells", "rn"],
  ["paper-land", "Paper.io", "Arcade,Strategy", "s", 5, "paper io territory land claim trail capture area", "r"],
  ["cell-feast", "Agar.io", "Arcade,Strategy", "s", 8, "agar io cell cells blob eat grow split bots leaderboard", "r"],
  ["hole-city", "Hole.io", "Arcade", "s", 3, "hole io swallow city eat grow black hole", "rn"],
  ["garden-defense", "Plants vs. Zombies", "Strategy,Action", "s", 15, "plants zombies pvz tower defense lawn garden peashooter sunflower shoot shooting", "r"],
  ["bean-royale", "Fall Guys", "Arcade,Racing,Action", "s", 8, "fall guys bean jellybean party royale obstacle course race crown battle", "rn"],
  ["hoop-flop", "Basket Random", "Sports,Arcade", "so", 5, "basket random basketball hoops ragdoll dunk ball two player 2v2 versus", "r"],
  ["maze-tanks", "Tank Trouble", "Action,Arcade", "so8", 8, "tank trouble tanks maze bullets bounce duel shooting versus", "r"],
  ["last-card", "UNO", "Board", "so8", 10, "uno cards card game match colour color number pass play", "r"],
  ["moto-stunts", "Moto X3M", "Racing,Skill", "s", 15, "moto x3m bike motorcycle motorbike dirt trial trials stunt stunts flip desert car", "r"],
  ["cookie-baker", "Cookie Clicker", "Strategy", "s", 30, "cookie clicker idle incremental grandma bake baking upgrades", "r"],
  ["block-roll", "Bloxorz", "Puzzle", "s", 15, "bloxorz block roll rolling tiles hole stages puzzle", "rn"],
  ["sea-battle", "Battleship", "Board,Strategy", "so", 10, "battleship ships sea naval fleet sink warships grid", "r"],
  ["snake", "Snake", "Arcade", "s", 5, "snake apple apples grow classic nokia eat", ""],
  ["highway-3d", "Traffic Racer", "Racing,Arcade", "s", 5, "traffic highway racer car cars drive driving speed vehicle overtake road", "r"],
  ["tetra", "Tetris", "Puzzle,Arcade", "s", 10, "tetris blocks falling tetrominoes lines clear stack tetra", "r"],
  ["2048", "2048", "Puzzle,Brain", "s", 8, "2048 numbers tiles merge slide swipe math", ""],
  ["pool", "8 Ball Pool", "Sports,Board", "so", 10, "pool 8 ball billiards snooker cue table balls", "r"],
  ["helix-3d", "Helix Jump", "Arcade,Skill", "s", 3, "helix jump tower ball bounce drop spiral stack", "r"],
  ["dino-run", "Chrome Dino", "Runner,Arcade", "s", 3, "dino dinosaur chrome offline t-rex runner cactus jump endless", "r"],
  ["reaction", "Reaction", "Skill", "s", 1, "reaction time reflex speed test green light human benchmark fast", ""],
  ["chess", "Chess", "Board,Brain", "so", 20, "chess king queen pawn checkmate ai computer strategy", ""],
  ["minesweeper", "Minesweeper", "Puzzle,Brain", "s", 5, "minesweeper mines flag bombs grid logic", ""],
  ["hoops-3d", "Hoops 3D", "Sports,Skill", "s", 2, "hoops basketball shoot shooting free throw dunk ball swish", ""],
  ["fruit-slice", "Fruit Ninja", "Action,Arcade,Skill", "s", 3, "fruit ninja slice slicing swipe blade bombs combos", "r"],
  ["word-guess", "Wordle", "Brain,Puzzle", "s", 3, "wordle word words letters guess five letter daily spelling vocabulary", "r"],
  ["sky-pilot", "Sky Pilot", "Arcade,Skill", "s", 5, "plane flying fly pilot rings islands aircraft flight airplane", ""],
  ["tanks-3d", "Tank Arena", "Action", "s", 8, "tank tanks arena shooting shoot waves battle drive cannon", ""],
  ["bubble-pop", "Bubble Shooter", "Puzzle,Arcade", "s", 8, "bubble shooter bubbles pop match colour color shoot shooting bust", "r"],
  ["pairs", "Pairs", "Brain", "s", 3, "pairs memory match matching cards concentration flip", ""],
  ["target-range-3d", "Target Range", "Skill,Sports", "s", 2, "target range shooting shoot gun aim clay pigeons skeet shooter pop-up", ""],
  ["breakout", "Breakout", "Arcade", "s", 5, "breakout brick bricks paddle ball arkanoid wall", ""],
  ["penalty-3d", "Penalty Kick", "Sports,Skill", "s", 3, "penalty kick football soccer goal keeper goalkeeper shootout shoot", ""],
  ["stack", "Stack", "Skill,Arcade", "s", 2, "stack tower blocks drop slab timing build", ""],
  ["sudoku", "Sudoku", "Puzzle,Brain", "s", 15, "sudoku numbers grid logic nine", ""],
  ["marble-3d", "Marble Roll", "Puzzle,Arcade", "s", 5, "marble ball roll rolling course flag platforms 3d labyrinth", ""],
  ["trivia", "Trivia", "Brain", "s", 5, "trivia quiz questions general knowledge facts answers", ""],
  ["invaders", "Space Invaders", "Action,Arcade", "s", 8, "space invaders aliens shoot shooting fleet classic retro", "r"],
  ["aim", "Aim Trainer", "Skill", "s", 1, "aim trainer accuracy mouse targets clicking fps practice shooting", ""],
  ["maze-3d", "Maze Escape 3D", "Puzzle,Arcade", "s", 10, "maze escape labyrinth keys 3d first person torch stone", ""],
  ["connect-four", "Connect Four", "Board", "so", 5, "connect four 4 in a row discs drop strategy", ""],
  ["gem-swap", "Bejeweled", "Puzzle", "s", 10, "bejeweled gems jewels match three candy crush swap", "r"],
  ["asteroids-3d", "Asteroid Field", "Action,Arcade", "s", 5, "asteroid field space starfighter ship shooting shoot rocks fly 3d", ""],
  ["cube-3d", "Rubik's Cube", "Puzzle,Brain", "s", 15, "rubiks rubik cube twist scramble solve 3d speedcube", ""],
  ["solitaire", "Solitaire", "Board", "s", 10, "solitaire klondike cards card patience", ""],
  ["perfect-stop", "Perfect Stop", "Skill", "s", 2, "perfect stop timing marker precision accuracy", ""],
  ["piano-tiles", "Piano Tiles", "Skill,Arcade", "s", 2, "piano tiles music rhythm tap black tiles song", ""],
  ["math-sprint", "Math Sprint", "Brain,Skill", "s", 2, "math maths mental arithmetic numbers sums quick calculation quiz", ""],
  ["whack", "Whack-a-Mole", "Skill,Arcade", "s", 2, "whack a mole moles bop hit hammer reflex", ""],
  ["air-hockey", "Air Hockey", "Sports,Arcade", "so", 3, "air hockey puck table mallet versus two player sport", ""],
  ["typing", "Typing Test", "Skill,Brain", "s", 2, "typing test words per minute wpm keyboard speed type", ""],
  ["maze-muncher", "Pac-Man", "Arcade", "s", 8, "pac man pacman ghosts dots maze muncher eat munch", "r"],
  ["rhythm", "Pulse", "Skill,Arcade", "s", 3, "pulse rhythm music notes beat guitar hero keys lanes", ""],
  ["checkers", "Checkers", "Board", "so", 10, "checkers draughts jump capture kings classic", ""],
  ["pong", "Pong", "Arcade,Sports", "so", 3, "pong paddle ball tennis classic retro versus", ""],
  ["tictactoe", "Tic-Tac-Toe", "Board", "so", 2, "tic tac toe noughts crosses xo three in a row", ""],
  ["archery", "Archery", "Sports,Skill", "s", 5, "archery bow arrow arrows target aim shoot shooting wind", ""],
  ["sequence", "Sequence", "Brain", "s", 3, "sequence simon says memory pattern pads colours repeat", ""],
  ["pinball", "Pinball", "Arcade", "s", 8, "pinball flippers bumpers ball table plunger ramp", ""],
  ["slide", "Slide 15", "Puzzle", "s", 5, "slide sliding puzzle fifteen 15 tiles numbers", ""],
  ["box-pusher", "Sokoban", "Puzzle", "s", 15, "sokoban box pusher crates warehouse push boxes logic", "r"],
  ["number-memory", "Number Memory", "Brain", "s", 3, "number memory digits remember recall test human benchmark", ""],
  ["reversi", "Reversi", "Board", "so", 10, "reversi othello discs flip flank strategy board", ""],
  ["pipe-connect", "Pipe Mania", "Puzzle", "s", 8, "pipe pipes water connect plumbing rotate flow tank drain mania", "r"],
  ["knife-throw", "Knife Hit", "Skill,Arcade", "s", 3, "knife hit throw throwing log spinning blades stick", "r"],
  ["cps-test", "CPS Test", "Skill", "s", 1, "cps clicks per second click speed test clicker fast", ""],
  ["chimp-test", "Chimp Test", "Brain", "s", 3, "chimp test memory numbers sequence human benchmark smarter", ""],
  ["hangman", "Hangman", "Brain", "s", 5, "hangman word guess letters spelling vocabulary", ""],
  ["true-false", "True or False", "Brain", "s", 3, "true false quiz facts trivia questions", ""]
];
const NEWEST = ["slope-3d", "tunnel-run", "rocket-soccer", "hole-city", "bean-royale", "block-roll", "flap-bird", "slither", "cell-feast", "paper-land", "brick-bros", "garden-defense", "last-card", "maze-tanks", "hoop-flop", "sea-battle", "moto-stunts", "cookie-baker", "blockcraft-3d", "asteroids-3d", "cube-3d", "tanks-3d", "maze-3d", "target-range-3d", "penalty-3d", "hoops-3d", "sky-pilot", "highway-3d", "marble-3d", "helix-3d", "road-hopper", "sky-runner", "true-false", "hangman", "solitaire", "reversi", "checkers", "chess", "sudoku", "pipe-connect", "box-pusher", "gem-swap", "bubble-pop", "tetra", "chimp-test", "fruit-slice", "cps-test", "piano-tiles", "pool", "archery", "air-hockey", "pinball", "maze-muncher", "invaders", "knife-throw", "dash-cube", "dino-run", "typing", "word-guess", "math-sprint", "trivia", "number-memory", "sequence", "pairs", "connect-four", "tictactoe", "slide", "minesweeper", "2048", "pong", "breakout", "snake", "rhythm", "stack", "perfect-stop", "whack", "aim", "reaction"];
const STAT = {"block-roll": "Stages", "tunnel-run": "Distance", "reaction": "Last", "minesweeper": "Time", "sudoku": "Time", "solitaire": "Time", "marble-3d": "Time", "maze-3d": "Time", "slide": "Moves", "cube-3d": "Moves", "pairs": "Moves", "chess": "Wins", "checkers": "Wins", "reversi": "Wins", "connect-four": "Wins", "tictactoe": "Wins", "pool": "Wins", "word-guess": "Streak", "hangman": "Streak", "true-false": "Streak", "moto-stunts": "Stars", "garden-defense": "Stage", "paper-land": "Territory", "slither": "Length", "cell-feast": "Mass", "highway-3d": "Distance", "dash-cube": "Progress", "sea-battle": "Shots", "chimp-test": "Level", "piano-tiles": "Tiles"};
const DELETED = new Set(["demon-halls", "night-survivors", "fire-water", "bomb-blast", "marble-chain", "clicker", "glide", "jetpack", "sky-jump", "lights-out", "deep-miner", "fling-birds", "candy-rope", "racer", "shooter", "hill-climb", "golf", "asteroids", "bowling-3d", "kart-circuit", "tower-defense", "stick-bridge"]);
const TINT = { reaction: '#ff6b6b', snake: '#4cc38a', '2048': '#f5a623', racer: '#5b8def', 'perfect-stop': '#a06cd5', pairs: '#ff8fab', trivia: '#ffd166', aim: '#ef476f', golf: '#7bd389', minesweeper: '#8d99ae', shooter: '#3d348b', stack: '#ff9f68', sequence: '#06d6a0', 'math-sprint': '#118ab2', whack: '#9bc53d', breakout: '#e76f51', tictactoe: '#48cae4', typing: '#6d597a', glide: '#90e0ef', rhythm: '#7209b7', 'word-guess': '#6aaa64', slide: '#f28482', pong: '#2b2d42', 'connect-four': '#4361ee', 'number-memory': '#f72585', clicker: '#e9c46a', 'lights-out': '#22223b',
  'sky-runner': '#ff7a59', 'road-hopper': '#7ed957', 'helix-3d': '#ff4d8d', 'highway-3d': '#3a86ff', 'sky-pilot': '#4cc9f0', 'marble-3d': '#9b5de5', 'hoops-3d': '#f77f00', 'bowling-3d': '#8338ec', 'penalty-3d': '#2a9d8f', 'maze-3d': '#577590', 'target-range-3d': '#d62828', 'tanks-3d': '#6a994e', 'cube-3d': '#ffbe0b', 'asteroids-3d': '#14213d', 'blockcraft-3d': '#52b788',
  'dino-run': '#f4a261', 'sky-jump': '#a2d2ff', 'dash-cube': '#00b4d8', jetpack: '#fb5607', 'stick-bridge': '#6d6875', asteroids: '#1b263b', invaders: '#240046', 'maze-muncher': '#023e8a', pinball: '#c1121f', 'tower-defense': '#588157', 'fruit-slice': '#ff006e', 'hill-climb': '#f6bd60', 'kart-circuit': '#ef233c', pool: '#1b4332', 'air-hockey': '#00a6fb', archery: '#bc6c25', 'knife-throw': '#9d4edd', 'piano-tiles': '#212529', tetra: '#5e60ce', 'bubble-pop': '#48bfe3', 'gem-swap': '#b5179e', 'box-pusher': '#b08968', 'pipe-connect': '#0096c7', chess: '#495057', checkers: '#9e2a2b', reversi: '#2d6a4f', solitaire: '#386641', sudoku: '#4895ef', 'cps-test': '#ff595e', 'chimp-test': '#8ac926', hangman: '#ffca3a', 'true-false': '#1982c4', 'deep-miner': '#6f4518' };
const C = Object.freeze({
  bg: '#ffffff', surface: '#ffffff', sunk: '#f3f4f7', sunk2: '#e9ebf0', line: '#e6e8ee', line2: '#d4d8e0',
  ink: '#1f1d2b', ink2: '#3d3a4d', muted: '#6e6c80', soft: '#a3a1b3',
  accent: '#6c5ce7', good: '#22b07d', bad: '#ef4f4f',
  tones: ['#fff3d6', '#ffe1a1', '#ffc86e', '#ffaa4d', '#ff8a3d', '#f6663a', '#e3463f', '#c53352', '#8e2a63', '#4a1f5c'],
  hues: ['#ef5350', '#ffa726', '#26b37a', '#3d8bfd', '#a855f7', '#6c5ce7']
});
const KEY = 'gameplay:v1';
let S = null;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!S || typeof S !== 'object') S = {};
S.best = S.best || {}; S.plays = S.plays || {}; S.recent = Array.isArray(S.recent) ? S.recent : []; S.muted = !!S.muted;
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

(() => {
  const rr = function (x, y, w, h, r) {
    const a = Array.isArray(r) ? r : [r == null ? 0 : r], v = q => typeof q === 'number' ? q : (q && q.x) || 0;
    let tl, tr, br, bl;
    if (a.length === 1) tl = tr = br = bl = v(a[0]);
    else if (a.length === 2) { tl = br = v(a[0]); tr = bl = v(a[1]); }
    else if (a.length === 3) { tl = v(a[0]); tr = bl = v(a[1]); br = v(a[2]); }
    else { tl = v(a[0]); tr = v(a[1]); br = v(a[2]); bl = v(a[3]); }
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    const m = Math.min(w, h) / 2;
    tl = Math.min(tl, m); tr = Math.min(tr, m); br = Math.min(br, m); bl = Math.min(bl, m);
    this.moveTo(x + tl, y);
    this.arcTo(x + w, y, x + w, y + h, tr);
    this.arcTo(x + w, y + h, x, y + h, br);
    this.arcTo(x, y + h, x, y, bl);
    this.arcTo(x, y, x + w, y, tl);
    this.closePath();
  };
  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = rr;
  if (window.Path2D && !Path2D.prototype.roundRect) Path2D.prototype.roundRect = rr;
  if (!Element.prototype.requestPointerLock) Element.prototype.requestPointerLock = function () {
    setTimeout(() => document.dispatchEvent(new Event('pointerlockerror')), 0);
    const p = Promise.reject(new Error('Pointer lock is not supported')); p.catch(() => {}); return p;
  };
  if (!document.exitPointerLock) document.exitPointerLock = () => {};
  try { if (!navigator.vibrate) navigator.vibrate = () => false; } catch (e) {}
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    const live = new Set();
    const Tracked = function (...a) { const c = new AC(...a); live.add(c); return c; };
    Tracked.prototype = AC.prototype;
    window.AudioContext = Tracked; window.webkitAudioContext = Tracked;
    const unlock = () => live.forEach(c => { if (c.state === 'closed') live.delete(c); else if (c.state !== 'running') c.resume().catch(() => {}); });
    ['pointerdown', 'touchend', 'keydown', 'click'].forEach(t => addEventListener(t, unlock, { capture: true, passive: true }));
  }
})();

const games = [], byId = new Map();
const Ameplay = window.Ameplay = {
  colors: C,
  covers: {},
  shots: {},
  register(g) {
    if (!g || typeof g.id !== 'string' || (typeof g.mount !== 'function' && !g.lazy)) return console.warn('[gameplay] invalid game', g);
    if (DELETED.has(g.id)) return;
    const old = byId.get(g.id);
    if (g.tint && !TINT[g.id]) TINT[g.id] = g.tint;
    if (g.category === '3D') g.is3d = true;
    const m = INFO.get(g.id) || { id: g.id, name: g.title, genres: ['Arcade'], pl: 's', mins: 5, kw: '', remake: false, hot: false, fresh: false, rank: 999 };
    m.stat = STAT[g.id] || null;
    g.oldTitle = g.title; g.title = m.name; g.info = m; g.category = m.genres[0];
    if (old && old.lazy && !g.lazy) return lazyLanded(old, g);
    if (old) games.splice(games.indexOf(old), 1);
    games.push(g); byId.set(g.id, g);
  }
};

const TONES = { tap: [520, .05, 'sine', .05], tick: [1200, .025, 'square', .015], good: [660, .12, 'sine', .07, 990], bad: [200, .2, 'triangle', .08, 110], win: [523, .35, 'sine', .07, 1046], lose: [330, .4, 'sine', .07, 140], hit: [140, .08, 'triangle', .1, 70], pop: [880, .06, 'sine', .05, 440] };
let ac = null;
function sfx(name) {
  const t = TONES[name];
  if (S.muted || !t) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const [f, d, type, vol, f2] = t, now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
    g.gain.setValueAtTime(.0001, now);
    g.gain.exponentialRampToValueAtTime(vol, now + .01);
    g.gain.exponentialRampToValueAtTime(.0001, now + d);
    o.connect(g).connect(ac.destination); o.start(now); o.stop(now + d + .03);
  } catch (e) {}
}

const $ = s => document.querySelector(s);
const frame = $('#frame'), toastEl = $('#toast'), gamebox = $('#gamebox');
const BASE_TITLE = document.title, BASE_DESC = document.querySelector('meta[name="description"]').getAttribute('content');
const fmt = (g, v) => v == null ? '—' : g.format ? g.format(v) : String(v);
const isField = el => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
let cur = null, ov = null, toastTimer = 0;

function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}
function setBest(g, bump) {
  const b = $('#pBest'); b.textContent = fmt(g, S.best[g.id]);
  if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
}

const glSet = new Set();
let fsScale = 1, fsT = [0, 0], fitRaf = 0, fitTimer = 0;
const c2Set = new Set();
const gpBudget = () => Math.max(2.4e6, (screen.width || 1920) * (screen.height || 1080) * Math.pow(window.devicePixelRatio || 1, 2) * 1.05);
function applyGlScale(s) {
  const want = Math.max(1, Math.min(4, (window.devicePixelRatio || 1) * Math.max(1, s))), B = gpBudget();
  glSet.forEach(e => {
    try {
      const { renderer, THREE } = e, v = renderer.getSize(new THREE.Vector2());
      let pr = Math.min(want, Math.sqrt(B / Math.max(1, v.x * v.y)));
      if (e.cap) pr = Math.min(pr, e.cap);
      if (Math.abs(renderer.getPixelRatio() - pr) < 0.01) return;
      e.own = true; renderer.setPixelRatio(pr); renderer.setSize(v.x, v.y, false); e.own = false;
    } catch (x) { e.own = false; }
  });
  c2Set.forEach(e => { try { gpRaster(e, Math.min(want, Math.sqrt(B / Math.max(1, e.w * e.h)))); } catch (x) {} });
}
const GP_CTX = ['fillStyle', 'strokeStyle', 'font', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'imageSmoothingEnabled', 'imageSmoothingQuality', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'direction', 'letterSpacing', 'filter', 'lineDashOffset'];
function gpRaster(e, d, force) {
  if (e.manual && !force) return;
  d = force ? d : Math.round(d * 20) / 20;
  if (Math.abs(e.d - d) < 0.05 && !force) return;
  e.busy = true;
  try { gpRaster2(e, d); } finally { e.busy = false; }
}
function gpRaster2(e, d) {
  const c = e.canvas, ctx = e.ctx, st = {};
  GP_CTX.forEach(k => { if (k in ctx) st[k] = ctx[k]; });
  const dash = ctx.getLineDash ? ctx.getLineDash() : null, m = ctx.getTransform(), tmp = document.createElement('canvas');
  tmp.width = c.width; tmp.height = c.height;
  if (c.width && c.height) tmp.getContext('2d').drawImage(c, 0, 0);
  c.width = Math.round(e.w * d); c.height = Math.round(e.h * d);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  if (tmp.width && tmp.height) ctx.drawImage(tmp, 0, 0, c.width, c.height);
  GP_CTX.forEach(k => { if (k in st) { try { ctx[k] = st[k]; } catch (x) {} } });
  if (dash && ctx.setLineDash) ctx.setLineDash(dash);
  const k = d / e.d;
  ctx.setTransform(m.a * k, m.b * k, m.c * k, m.d * k, m.e * k, m.f * k);
  e.d = d;
}
const shortQuery = window.matchMedia ? matchMedia('(max-height: 520px) and (orientation: landscape)') : { matches: false };
const stageMode = () => gamebox.classList.contains('fs') ? 'fs' : (view === 'game' && gamebox.classList.contains('theater')) ? 'theater' : 'off';
function fitStage() {
  const mode = stageMode();
  const frameEl = document.getElementById('frame'), st = document.getElementById('stage');
  gpFill(mode === 'fs', frameEl, st);
  if (mode === 'off') {
    st.style.background = '';
    if (fsScale !== 1) { frameEl.style.transform = ''; fsScale = 1; fsT = [0, 0]; applyGlScale(1); }
    if (st.style.height) st.style.height = '';
    return;
  }
  const root = frameEl.querySelector('.g-root');
  if (!root || !frameEl.offsetWidth) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const el of root.children) {
    if (!el.offsetWidth || !el.offsetHeight) continue;
    const pos = getComputedStyle(el).position;
    if (pos === 'absolute' || pos === 'fixed') continue;
    x0 = Math.min(x0, el.offsetLeft); y0 = Math.min(y0, el.offsetTop);
    x1 = Math.max(x1, el.offsetLeft + el.offsetWidth); y1 = Math.max(y1, el.offsetTop + el.offsetHeight);
  }
  if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = root.offsetWidth; y1 = root.offsetHeight; }
  const cx = root.offsetLeft + x0, cy = root.offsetTop + y0, cw = Math.max(1, x1 - x0), ch = Math.max(1, y1 - y0);
  const sw = st.clientWidth;
  let s, sh;
  if (mode === 'fs') {
    sh = st.clientHeight;
    const pad = root.querySelector('canvas') ? 0 : 20;
    if (gpHud(frameEl, cw, ch)) { requestAnimationFrame(fitStage); return; }
    s = Math.max(0.3, Math.min((sw - pad * 2) / cw, (sh - pad * 2) / ch, 8));
    gpEdge(root, st);
  } else {
    const pad = 12, bar = gamebox.querySelector('.play-bar');
    const short = shortQuery.matches;
    const availH = short ? Math.max(150, innerHeight - (bar ? bar.offsetHeight : 50) - 2) : Math.max(380, innerHeight - 64 - 8 - (bar ? bar.offsetHeight : 60) - 30);
    const minS = short ? 0.3 : root.querySelector('canvas') ? 0.55 : 1;
    s = Math.max(minS, Math.min((sw - pad * 2) / cw, (availH - pad * 2) / ch, 2.4));
    sh = short ? availH : Math.max(440, Math.ceil(ch * s + pad * 2));
    if (st.style.height !== sh + 'px') st.style.height = sh + 'px';
  }
  const fl = (sw - frameEl.offsetWidth) / 2, ft = (sh - frameEl.offsetHeight) / 2;
  let tx = (sw - cw * s) / 2 - fl - cx * s, ty = (sh - ch * s) / 2 - ft - cy * s;
  if (Math.abs(s - 1) < 0.001) { tx = Math.round(tx); ty = Math.round(ty); }
  if (fsScale !== 1 && Math.abs(s / fsScale - 1) < 0.03 && Math.abs(tx - fsT[0]) < 10 && Math.abs(ty - fsT[1]) < 10) return;
  frameEl.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  fsScale = s; fsT = [tx, ty]; applyGlScale(s);
}
const queueFit = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitStage); };
function startFitTimer() { clearInterval(fitTimer); fitTimer = setInterval(() => { if (stageMode() !== 'off' && !document.hidden) fitStage(); }, 1500); }
function gpMain(frameEl) {
  let best = null;
  glSet.forEach(e => { if (e.canvas && frameEl.contains(e.canvas) && (!best || e.w0 * e.h0 > best.w0 * best.h0)) best = e; });
  return best;
}
function gpFill(on, frameEl, st) {
  const e = gpMain(frameEl);
  if (!e) return;
  if (e.noFill) on = false;
  let w = e.w0, h = e.h0;
  if (on) {
    const A = st.clientWidth / Math.max(1, st.clientHeight), a = e.w0 / e.h0;
    if (Math.abs(A - a) > 0.01) { if (A > a) w = Math.round(e.h0 * A); else h = Math.round(e.w0 / A); }
  }
  if (w === e.cw && h === e.ch && e.fill === on) return;
  e.cw = w; e.ch = h; e.fill = on;
  try { e.own = true; e.renderer.setSize(w, h, false); } catch (x) {} e.own = false;
  e.canvas.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
  e.canvas.style.aspectRatio = `${w} / ${h}`;
  if (on && w > e.w0) { if (frameEl.dataset.fw == null) frameEl.dataset.fw = frameEl.style.getPropertyValue('--fw'); frameEl.style.setProperty('--fw', w + 'px'); }
  else if (frameEl.dataset.fw != null) { frameEl.style.setProperty('--fw', frameEl.dataset.fw); delete frameEl.dataset.fw; }
  fsScale = 0;
  if (on && (w !== e.w0 || h !== e.h0)) {
    const r = e.canvas.offsetWidth / Math.max(1, e.canvas.offsetHeight);
    if (Math.abs(r / (w / h) - 1) > 0.03) { e.noFill = true; gpFill(false, frameEl, st); }
  }
}
function gpHud(frameEl, cw, ch) {
  const e = gpMain(frameEl);
  if (!e || !e.fill || e.noFill) return false;
  if (Math.abs(e.canvas.offsetWidth / cw - 1) < 0.03 && Math.abs(e.canvas.offsetHeight / ch - 1) < 0.03) return false;
  e.noFill = true;
  gpFill(false, frameEl, document.getElementById('stage'));
  return true;
}
function gpEdge(root, st) {
  let col = '';
  const c = root.querySelector('canvas');
  if (c && !gpMain(document.getElementById('frame'))) {
    try { if (c.width && c.height) { const t = gpEdge.t || (gpEdge.t = document.createElement('canvas')); t.width = 2; t.height = 1; const x = t.getContext('2d', { willReadFrequently: true }), y = Math.floor(c.height / 2); x.clearRect(0, 0, 2, 1); x.drawImage(c, 0, y, 1, 1, 0, 0, 1, 1); x.drawImage(c, c.width - 1, y, 1, 1, 1, 0, 1, 1); const d = x.getImageData(0, 0, 2, 1).data; if (d[3] > 200 && d[7] > 200) col = `rgb(${(d[0] + d[4]) >> 1},${(d[1] + d[5]) >> 1},${(d[2] + d[6]) >> 1})`; } } catch (x) {}
  }
  if (!col) { const b = getComputedStyle(root).backgroundColor; if (b && !/rgba\(\s*0,\s*0,\s*0,\s*0\)|transparent/.test(b)) col = b; }
  st.style.background = col || '#000';
}

const libP = {};
const libUrl = n => (PATH_MODE ? location.origin + '/' : new URL('.', location.href).href) + 'gameplay/' + n;
function loadLib(name, urls) {
  if (window[name]) return Promise.resolve(window[name]);
  return libP[name] || (libP[name] = new Promise((res, rej) => {
    const tryAt = i => {
      if (i >= urls.length) { delete libP[name]; rej(new Error(name + ' failed to load')); return; }
      const s = document.createElement('script');
      s.src = urls[i]; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => window[name] ? res(window[name]) : tryAt(i + 1);
      s.onerror = () => { s.remove(); tryAt(i + 1); };
      document.head.append(s);
    };
    tryAt(0);
  }));
}
const loadThree = () => loadLib('THREE', [libUrl('three-r128.min.js'), 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', 'https://unpkg.com/three@0.128.0/build/three.min.js']);
let invite = null;
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const loadPeer = () => loadLib('Peer', [libUrl('peerjs-1.5.4.min.js'), 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js']);
function netErr(e) {
  const t = e && e.type;
  if (t === 'peer-unavailable') return 'Room not found. Check the code and try again.';
  if (t === 'room-full') return 'That room already has two players.';
  if (t === 'browser-incompatible') return 'This browser can’t play online.';
  if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed' || t === 'load') return 'Can’t reach the online server. Check your internet connection.';
  return 'Connection failed. Try again.';
}
const NET_DARK = '--gl-page:#0f0d1c;--gl-card:#1a1730;--gl-band:#221e3d;--gl-line:#2d2850;--gl-fg:#f1efff;--gl-muted:#9f9cc0;--gl-accent:#8f5cf2;--gl-accent-ink:#ffffff;--gl-accent-soft:#2f2556;--gl-danger:#ff6b80;--gl-danger-soft:#3a1e2c;--gl-live:#3ad596;--gl-live-soft:#143328;--gl-chip:#2a2548;--gl-shadow:0 24px 60px rgba(0,0,0,.55);--gl-veil:rgba(4,3,12,.66);color-scheme:dark';
const NET_CSS = `.g-lobby{position:absolute;inset:0;z-index:200;display:flex;overflow:hidden;opacity:0;transition:opacity .22s ease;text-align:left;border-radius:inherit;--gl-page:#ebe8f7;--gl-card:#ffffff;--gl-band:#f4f1ff;--gl-line:#ece9f6;--gl-fg:#17142b;--gl-muted:#8a87a3;--gl-accent:#7b3aed;--gl-accent-ink:#ffffff;--gl-accent-soft:#efe9ff;--gl-danger:#e5384f;--gl-danger-soft:#fdecef;--gl-live:#16a561;--gl-live-soft:#e8f8ef;--gl-chip:#f0eff5;--gl-shadow:0 24px 60px rgba(60,30,140,.18);--gl-veil:rgba(23,20,43,.5);--gl-font:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:var(--gl-veil);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:var(--gl-fg);font:400 16px/1.4 var(--gl-font);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;text-size-adjust:100%;user-select:text;-webkit-user-select:text;touch-action:manipulation;cursor:default}
.g-lobby.gl-fixed{position:fixed}
.g-lobby.gl-on{opacity:1}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .g-lobby{${NET_DARK}}}
:root[data-theme="dark"] .g-lobby{${NET_DARK}}
.g-lobby *{box-sizing:border-box}
.g-lobby button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0;margin:0;-webkit-tap-highlight-color:transparent}
.g-lobby button:disabled{cursor:default}
.g-lobby svg{display:block;stroke:currentColor;fill:none;stroke-linecap:round;stroke-linejoin:round}
.g-lobby :focus-visible{outline:2px solid var(--gl-accent);outline-offset:2px}
.g-lobby .gl-card{margin:auto;flex:none;width:1040px;background:var(--gl-card);border-radius:32px;box-shadow:var(--gl-shadow);overflow:hidden;display:flex;flex-direction:column;outline:0;transform:translateY(10px) scale(.97);transition:transform .28s cubic-bezier(.2,.8,.2,1)}
.g-lobby.gl-on .gl-card{transform:none}
.g-lobby .gl-head{flex:none;background:var(--gl-band);padding:36px 40px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
.g-lobby .gl-head h1{grid-column:2;grid-row:1;margin:0;max-width:520px;font-size:46px;line-height:1.1;font-weight:800;letter-spacing:-.03em;text-align:center;color:var(--gl-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-leave{grid-column:1;grid-row:1;justify-self:start;display:flex;align-items:center;gap:6px;height:40px;padding:0 14px 0 8px;margin-left:-8px;border-radius:12px;color:var(--gl-muted);font-weight:600;font-size:16px;transition:background .15s,color .15s}
.g-lobby .gl-leave:hover{color:var(--gl-fg);background:var(--gl-card)}
.g-lobby .gl-leave svg{width:18px;height:18px;stroke-width:2.2}
.g-lobby .gl-code{grid-column:3;grid-row:1;justify-self:end;min-width:0}
.g-lobby .gl-code small{display:block;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--gl-muted);margin:0 0 8px}
.g-lobby .gl-codebox{display:flex;align-items:center;justify-content:space-between;gap:16px;background:var(--gl-card);border-radius:16px;padding:12px 12px 12px 20px;min-width:230px;min-height:62px}
.g-lobby .gl-codebox b{font-size:28px;font-weight:800;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:var(--gl-fg);min-width:3.4em;white-space:nowrap}
.g-lobby .gl-codebox b.gl-pend{color:var(--gl-muted);animation:glpulse 1.4s ease-in-out infinite}
.g-lobby .gl-tools{display:flex;align-items:center;gap:8px;flex:none}
.g-lobby .gl-hide{display:flex;align-items:center;gap:8px;height:38px;padding:0 6px;color:var(--gl-accent);font-weight:600;font-size:16px}
.g-lobby .gl-hide svg{width:20px;height:20px;stroke-width:1.8}
.g-lobby .gl-tools button:disabled{opacity:.4}
.g-lobby .gl-body{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 1px var(--glc,330px);gap:0 40px;padding:36px 40px 40px}
.g-lobby .gl-rule{background:var(--gl-line)}
.g-lobby .gl-sec{display:flex;flex-direction:column;min-width:0;min-height:0}
.g-lobby .gl-sec-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px;min-height:32px;flex:none}
.g-lobby .gl-sec-h h2{margin:0;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-.02em;color:var(--gl-fg);white-space:nowrap}
.g-lobby .gl-pill{position:relative;display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--gl-muted);background:var(--gl-chip);border-radius:99px;padding:6px 14px;font-variant-numeric:tabular-nums;white-space:nowrap;flex:none}
.g-lobby .gl-pill.gl-pick{padding-right:10px;cursor:pointer;color:var(--gl-accent);background:var(--gl-accent-soft);transition:transform .12s}
.g-lobby .gl-pill.gl-pick:hover{transform:scale(1.04)}
.g-lobby .gl-pill select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px;border:0;margin:0;-webkit-appearance:none;appearance:none}
.g-lobby .gl-pill svg{width:14px;height:14px;stroke-width:2.4}
.g-lobby .gl-pill.gl-live{color:var(--gl-live);background:var(--gl-live-soft);gap:7px;padding:4px 12px}
.g-lobby .gl-pill.gl-live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gl-live)}
.g-lobby .gl-players{list-style:none;margin:0;padding:0;flex:1 1 auto;min-height:calc(var(--rows,4) * 71px);overflow-y:auto;overscroll-behavior:contain}
.g-lobby.gl-fixh .gl-players{min-height:0}
.g-lobby .gl-pl{display:flex;align-items:center;gap:14px;height:71px;padding:14px 0;border-bottom:1px solid var(--gl-line)}
.g-lobby .gl-new{animation:glin .3s ease both}
.g-lobby .gl-pl.gl-away{opacity:.55}
.g-lobby .gl-av{width:42px;height:42px;border-radius:12px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:15px;display:grid;place-items:center;flex:none}
.g-lobby .gl-av svg{width:22px;height:22px;stroke-width:1.8}
.g-lobby .gl-pl.gl-lead .gl-av{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-pl.gl-seat .gl-av{background:none;border:1.5px dashed var(--gl-line);color:var(--gl-muted)}
.g-lobby .gl-pl.gl-seat.gl-botseat .gl-av{border-style:solid;background:var(--gl-chip)}
.g-lobby .gl-pl.gl-seat .gl-who b{color:var(--gl-muted);font-weight:500}
.g-lobby .gl-who{flex:1;min-width:0}
.g-lobby .gl-who b{display:flex;align-items:center;gap:8px;font-weight:600;font-size:17px;line-height:1.4;color:var(--gl-fg);min-width:0}
.g-lobby .gl-who b i{font-style:normal;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-who>span{display:block;color:var(--gl-muted);font-size:14px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.g-lobby .gl-rn{display:flex;align-items:center;gap:6px;min-width:0;max-width:100%;border-radius:8px;font-weight:600}
.g-lobby .gl-rn svg{width:14px;height:14px;stroke-width:2;color:var(--gl-muted);opacity:.7;flex:none}
.g-lobby .gl-rn:hover svg{opacity:1;color:var(--gl-accent)}
.g-lobby .gl-rnin{width:100%;max-width:220px;height:30px;border:1px solid var(--gl-accent);border-radius:8px;padding:0 8px;font:600 16px var(--gl-font);color:var(--gl-fg);background:var(--gl-card);outline:0;margin:0}
.g-lobby .gl-badge{flex:none;font-size:11px;font-weight:700;letter-spacing:.05em;line-height:1.5;background:var(--gl-accent);color:var(--gl-accent-ink);border-radius:99px;padding:1px 9px}
.g-lobby .gl-sq{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;transition:transform .12s}
.g-lobby button.gl-sq:hover:not(:disabled){transform:scale(1.08)}
.g-lobby button.gl-sq:active:not(:disabled){transform:scale(.94)}
.g-lobby .gl-sq svg{width:19px;height:19px;stroke-width:1.8}
.g-lobby .gl-crown{background:var(--gl-accent-soft);color:var(--gl-accent)}
.g-lobby .gl-pl.gl-lead .gl-crown{background:var(--gl-accent);color:var(--gl-accent-ink)}
.g-lobby .gl-kick{background:var(--gl-danger-soft);color:var(--gl-danger)}
.g-lobby .gl-ph{visibility:hidden}
.g-lobby .gl-bots{flex:none;display:flex;align-items:center;gap:14px;padding-top:16px;min-height:0}
.g-lobby .gl-bots:empty{display:none}
.g-lobby .gl-bots .gl-who b{font-size:16px}
.g-lobby .gl-bots .gl-who b i{white-space:normal;line-height:1.25}
.g-lobby .gl-sw{position:relative;flex:none;width:48px;height:28px;border-radius:99px;background:var(--gl-chip);border:1px solid var(--gl-line);transition:background .2s,border-color .2s}
.g-lobby .gl-sw::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.g-lobby .gl-sw[aria-checked="true"]{background:var(--gl-accent);border-color:var(--gl-accent)}
.g-lobby .gl-sw[aria-checked="true"]::after{transform:translateX(20px)}
.g-lobby .gl-sw:disabled{opacity:.55}
.g-lobby .gl-msgs{flex:1 1 0;min-height:140px;contain:size;display:flex;flex-direction:column;gap:18px;overflow-y:auto;overscroll-behavior:contain;padding-bottom:16px}
.g-lobby .gl-msgs>*{flex:none}
.g-lobby .gl-m b{font-weight:700;color:var(--gl-fg);overflow-wrap:anywhere}
.g-lobby .gl-m time{margin-left:8px;color:var(--gl-muted);font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}
.g-lobby .gl-m p{margin:3px 0 0;color:var(--gl-muted);overflow-wrap:anywhere}
.g-lobby .gl-m.gl-sys p{margin:0;font-size:14px;font-weight:500}
.g-lobby .gl-m.gl-sys time{margin-left:0}
.g-lobby .gl-empty{margin:0;color:var(--gl-muted);font-size:15px}
.g-lobby .gl-send{display:flex;align-items:center;gap:8px;border:1px solid var(--gl-line);border-radius:14px;padding:6px 6px 6px 18px;background:var(--gl-card);flex:none;margin:0}
.g-lobby .gl-send:focus-within,.g-lobby .gl-join:focus-within{border-color:var(--gl-accent)}
.g-lobby .gl-send input,.g-lobby .gl-join input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;color:var(--gl-fg);height:36px;padding:0;margin:0;box-shadow:none;border-radius:0}
.g-lobby .gl-send input::placeholder,.g-lobby .gl-join input::placeholder{color:var(--gl-muted);opacity:1;letter-spacing:0;font-weight:400;text-transform:none}
.g-lobby .gl-send.gl-slow{border-color:var(--gl-danger)}
.g-lobby .gl-go{width:42px;height:42px;border-radius:11px;background:var(--gl-accent);color:var(--gl-accent-ink);display:grid;place-items:center;flex:none;transition:transform .12s}
.g-lobby .gl-go:active{transform:scale(.92)}
.g-lobby .gl-go svg{width:20px;height:20px;stroke-width:2.2}
.g-lobby .gl-foot{flex:none;background:var(--gl-band);padding:44px 40px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:20px}
.g-lobby .gl-join{grid-column:1;justify-self:start;display:flex;align-items:center;gap:6px;width:250px;max-width:100%;border:1px solid var(--gl-line);border-radius:14px;padding:5px 5px 5px 16px;background:var(--gl-card);margin:0;transition:border-color .15s}
.g-lobby .gl-join input{font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.g-lobby .gl-join.gl-bad{border-color:var(--gl-danger)}
.g-lobby .gl-jbtn{flex:none;height:38px;padding:0 14px;border-radius:10px;background:var(--gl-accent-soft);color:var(--gl-accent);font-weight:700;font-size:15px;transition:transform .12s}
.g-lobby .gl-jbtn:active{transform:scale(.95)}
.g-lobby .gl-act{grid-column:2;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.g-lobby .gl-hint{grid-column:3;justify-self:end;margin:0;max-width:100%;font-size:14px;font-weight:500;color:var(--gl-muted);text-align:right}
.g-lobby .gl-hint.gl-bad{color:var(--gl-danger);font-weight:600}
.g-lobby .gl-play{display:flex;align-items:center;justify-content:center;gap:10px;min-width:330px;height:62px;padding:0 28px;border-radius:16px;background:var(--gl-accent);color:var(--gl-accent-ink);font-size:19px;font-weight:700;box-shadow:0 12px 28px rgba(123,58,237,.38);transition:transform .12s,opacity .2s,box-shadow .2s;white-space:nowrap}
.g-lobby .gl-play:hover:not(:disabled){transform:translateY(-2px)}
.g-lobby .gl-play:active:not(:disabled){transform:scale(.97)}
.g-lobby .gl-play:disabled{opacity:.45;box-shadow:none}
.g-lobby .gl-play.gl-ghost{background:var(--gl-card);color:var(--gl-accent);box-shadow:none}
.g-lobby .gl-play svg{width:20px;height:20px;stroke-width:2}
.g-lobby .gl-wait{display:flex;align-items:center;justify-content:center;gap:12px;min-width:330px;max-width:100%;min-height:62px;padding:10px 28px;border-radius:16px;background:var(--gl-card);color:var(--gl-muted);font-size:17px;font-weight:600;text-align:center}
.g-lobby .gl-wait::before{content:"";flex:none;width:9px;height:9px;border-radius:50%;background:var(--gl-accent);animation:glpulse 1.4s ease-in-out infinite}
.g-lobby .gl-center{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;padding:20px;text-align:center}
.g-lobby .gl-msg{margin:0;font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:var(--gl-fg);text-align:center;overflow-wrap:anywhere}
.g-lobby .gl-txt{margin:12px auto 0;max-width:520px;color:var(--gl-muted);text-align:center;font-size:17px}
.g-lobby.gl-cmp .gl-head{padding:18px 32px}
.g-lobby.gl-cmp .gl-head h1{font-size:36px}
.g-lobby.gl-cmp .gl-code small{margin-bottom:5px}
.g-lobby.gl-cmp .gl-codebox{min-height:52px;padding:7px 8px 7px 18px}
.g-lobby.gl-cmp .gl-codebox b{font-size:24px}
.g-lobby.gl-cmp .gl-body{padding:22px 32px 22px}
.g-lobby.gl-cmp .gl-sec-h{margin-bottom:10px}
.g-lobby.gl-cmp .gl-players{min-height:calc(var(--rows,4) * 58px)}
.g-lobby.gl-cmp.gl-fixh .gl-players{min-height:0}
.g-lobby.gl-cmp .gl-pl{height:58px;padding:8px 0}
.g-lobby.gl-cmp .gl-av{width:38px;height:38px}
.g-lobby.gl-cmp .gl-bots{padding-top:10px}
.g-lobby.gl-cmp .gl-msgs{gap:12px}
.g-lobby.gl-cmp .gl-foot{padding:16px 32px}
.g-lobby.gl-cmp .gl-play,.g-lobby.gl-cmp .gl-wait{height:54px;min-height:54px;min-width:290px}
.g-lobby.gl-mid .gl-play,.g-lobby.gl-mid .gl-wait{min-width:220px}
.g-lobby.gl-mid .gl-head{grid-template-columns:auto minmax(0,1fr) auto}
.g-lobby.gl-mid .gl-head h1{font-size:36px;max-width:100%}
.g-lobby.gl-mid .gl-codebox{min-width:0}
.g-lobby.gl-mid .gl-foot{grid-template-columns:minmax(220px,1fr) auto minmax(0,1fr);gap:16px}
.g-lobby.gl-mid .gl-join{width:220px}
.g-lobby.gl-stack{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.g-lobby.gl-stack .gl-card{margin:0 auto auto;border-radius:24px}
.g-lobby.gl-stack .gl-head{grid-template-columns:minmax(0,1fr);justify-items:center;padding:12px 16px 20px;gap:10px}
.g-lobby.gl-stack .gl-head h1{grid-column:1;grid-row:2;font-size:30px;max-width:100%}
.g-lobby.gl-stack .gl-leave{grid-column:1;grid-row:1}
.g-lobby.gl-stack .gl-code{grid-column:1;grid-row:3;justify-self:center;text-align:center;max-width:100%}
.g-lobby.gl-stack .gl-codebox{text-align:left;min-width:0;min-height:54px;padding:8px 8px 8px 16px;gap:10px}
.g-lobby.gl-stack .gl-codebox b{font-size:24px}
.g-lobby.gl-stack .gl-body{display:contents}
.g-lobby.gl-stack .gl-body>.gl-rule{display:none}
.g-lobby.gl-stack .gl-plsec{order:1;padding:20px 16px 18px}
.g-lobby.gl-stack .gl-sec-h{margin-bottom:8px}
.g-lobby.gl-stack .gl-players{min-height:0;overflow:visible;flex:none}
.g-lobby.gl-stack .gl-pl{height:60px;padding:9px 0;gap:12px}
.g-lobby.gl-stack .gl-av{width:38px;height:38px}
.g-lobby.gl-stack .gl-foot{order:2;display:flex;flex-direction:column;align-items:stretch;gap:12px;padding:18px 16px}
.g-lobby.gl-stack .gl-act{order:-1;align-items:stretch}
.g-lobby.gl-stack .gl-play,.g-lobby.gl-stack .gl-wait{min-width:0;width:100%;height:54px;min-height:54px}
.g-lobby.gl-stack .gl-hint{order:-1;text-align:center;justify-self:auto}
.g-lobby.gl-stack .gl-hint:empty{display:none}
.g-lobby.gl-stack .gl-join{width:100%}
.g-lobby.gl-stack .gl-chat{order:3;height:320px;padding:20px 16px 16px}
.g-lobby.gl-stack .gl-msgs{overscroll-behavior:auto}
.g-lobby.gl-stack .gl-center{order:1;min-height:200px}
.g-lobby.gl-stack .gl-msg{font-size:24px}
@keyframes glspin{to{transform:rotate(360deg)}}
@keyframes glpulse{50%{opacity:.3;transform:scale(.75)}}
@keyframes glin{from{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){.g-lobby,.g-lobby *{transition:none!important;animation:none!important}}`;
const NET_I = {
  crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 21h14"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.5A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4-.8M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L11.6 6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  pen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 13v1M15 13v1M9.5 17h5"/><circle cx="12" cy="3.5" r=".5"/></svg>'
};
const netEsc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => '&#' + c.charCodeAt(0) + ';');
const netName = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>&"'`\\\u202a-\u202e\u2066-\u2069]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
const netMsg = s => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
const netUid = () => Array.from({ length: 10 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('').toLowerCase();
const netLs = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; };
const netProfile = () => { try { const p = JSON.parse(netLs('gameplay:profile') || 'null'); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; } catch (e) { return {}; } };
const netLoadName = () => { const p = netProfile(); return netName(p.username) || netName(p.displayName) || netName(netLs('gameplay:netname')); };
const netSaveName = n => { n = netName(n); if (n) netLs('gameplay:netname', n); };
const netGuest = () => { let n = netName(netLs('gameplay:netguest')); if (!n) { n = 'Player ' + (1000 + Math.floor(Math.random() * 9000)); netLs('gameplay:netguest', n); } return n; };
const netT = s => { try { return window.gpI18n && typeof gpI18n.t === 'function' ? gpI18n.t(s) || s : s; } catch (e) { return s; } };
const netInit = n => {
  const w = String(n || '').trim().split(/\s+/).filter(Boolean).map(x => Array.from(x));
  if (!w.length) return '?';
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2).join('')).toUpperCase();
};
const netHm = t => { const d = new Date(t), p = x => (x < 10 ? '0' : '') + x; return p(d.getHours()) + ':' + p(d.getMinutes()); };
const netTrack = (ev, p) => { try { if (typeof Ameplay !== 'undefined' && Ameplay.analytics && typeof Ameplay.analytics.track === 'function') Ameplay.analytics.track(ev, p); } catch (e) {} };
const netSizes = o => {
  const mn = Math.max(2, Math.min(8, Math.round(+o.min) || 2));
  let s = (Array.isArray(o.sizes) ? o.sizes : []).map(n => Math.round(+n)).filter(n => n >= 2 && n <= 8);
  if (!s.length) { const mx = Math.max(mn, Math.min(8, Math.round(+o.max) || 4)); for (let i = mn; i <= mx; i++) s.push(i); }
  if (+o.max >= 2) { const f = s.filter(n => n <= +o.max); if (f.length) s = f; }
  s = [...new Set(s)].sort((a, b) => a - b);
  const f = s.filter(n => n >= mn);
  s = f.length ? f : [s[s.length - 1]];
  const min = Math.min(mn, s[0]);
  const d = Math.round(+o.defaultSize);
  return { sizes: s, min, def: s.indexOf(d) >= 0 ? d : s[s.length - 1] };
};
const NET_TURN = 'staticauth.openrelay.metered.ca', NET_TURN_KEY = 'openrelayprojectsecret';
let netIceC = null;
const netIce = () => {
  if (netIceC && Date.now() - netIceC.t < 6 * 3600e3) return netIceC.p;
  const p = (async () => {
    const ice = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }];
    try {
      const te = new TextEncoder(), user = (Math.floor(Date.now() / 1000) + 86400) + ':gameplay';
      const k = await crypto.subtle.importKey('raw', te.encode(NET_TURN_KEY), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
      const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, te.encode(user)));
      ice.push({ urls: ['turn:' + NET_TURN + ':80', 'turn:' + NET_TURN + ':80?transport=tcp', 'turn:' + NET_TURN + ':443', 'turns:' + NET_TURN + ':443?transport=tcp'], username: user, credential: btoa(String.fromCharCode.apply(null, sig)) });
    } catch (e) {}
    return ice;
  })();
  netIceC = { t: Date.now(), p };
  return p;
};
const NET_SOFT = ['network', 'server-error', 'socket-error', 'socket-closed', 'load'];
const netWhy = (e, code) => {
  const t = e && e.type;
  if (t === 'peer-unavailable') return code ? netT('Party {code} not found. Check the code and try again.').replace('{code}', code) : netT('Party not found. Check the code and try again.');
  if (t === 'ice') return netT('Could not connect to the other player. A school, office or mobile network may be blocking game connections. Try again, or switch networks (for example Wi-Fi instead of mobile data).');
  if (t === 'timeout') return netT('The other player did not answer. Try again.');
  if (t === 'load') return netT('Could not load the online player. Check your internet connection and try again.');
  if (NET_SOFT.indexOf(t) >= 0) return netT('Can’t reach the online server right now (it may be busy or blocked on this network). Try again in a moment.');
  return netT(netErr(e));
};
const netTe = new TextEncoder();
function makeNet(g, add) {
  const ls = {};
  const emit = (t, ...a) => (ls[t] || []).slice().forEach(f => { try { f(...a); } catch (e) { console.error(e); } });
  let peer = null, conn = null, hb = 0, lastRx = 0, gen = 0, mode = null, note = null, ckId = 0;
  const now = () => performance.now();
  const pid = code => 'gameplay-' + g.id + '-' + code;
  const sleepMs = ms => new Promise(r => setTimeout(r, ms));
  const wait = (p, ms, type) => new Promise((res, rej) => {
    const t = setTimeout(() => rej({ type }), ms);
    p(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
  });
  const tx = (c, m, s, b) => {
    if (!c || !c.open) return false;
    const dc = c.dataChannel;
    try {
      if (!dc || dc.readyState !== 'open' || c.serialization !== 'json') { c.send(m); return true; }
      if (s == null) s = JSON.stringify(m);
      if (s.length < 16000) { if (!b) b = netTe.encode(s); if (b.byteLength < 16000) { dc.send(b); return true; } }
      const id = ++ckId, n = Math.ceil(s.length / 2500);
      for (let i = 0; i < n; i++) dc.send(netTe.encode(JSON.stringify({ __ck: [id, i, n, s.slice(i * 2500, i * 2500 + 2500)] })));
      return true;
    } catch (e) { return false; }
  };
  const unck = (c, d) => {
    if (!d || typeof d !== 'object' || !Array.isArray(d.__ck)) return d;
    const [id, i, n, part] = d.__ck;
    if (typeof part !== 'string' || !(n > 0 && n < 4000) || !(i >= 0 && i < n)) return null;
    let e = c.__ck;
    if (!e || e.id !== id) e = c.__ck = { id, n, got: 0, p: [] };
    if (e.p[i] == null) { e.p[i] = part; e.got++; }
    if (e.got < e.n) return null;
    c.__ck = null;
    try { return JSON.parse(e.p.join('')); } catch (x) { return null; }
  };
  const fastOpen = (c, deliver) => {
    if (c.__f || !c.peerConnection) return;
    let ch;
    try { ch = c.peerConnection.createDataChannel('gpf', { negotiated: true, id: 7, ordered: false, maxRetransmits: 0 }); } catch (e) { return; }
    const f = c.__f = { ch, ok: false, sq: 0, rq: 0 };
    ch.onmessage = e => {
      if (typeof e.data !== 'string') return;
      let d;
      try { d = JSON.parse(e.data); } catch (x) { return; }
      if (!Array.isArray(d)) return;
      f.ok = true;
      const q = d[0];
      if (!(q > f.rq) || !d[1] || typeof d[1] !== 'object') return;
      f.rq = q;
      deliver(d[1]);
    };
    ch.onopen = () => fastHi(c);
    c.on('close', () => { try { ch.close(); } catch (e) {} });
  };
  const fastHi = c => { const f = c && c.__f; if (f && !f.ok && f.ch.readyState === 'open') { try { f.ch.send('[0]'); } catch (e) {} } };
  const fastTx = (c, s) => {
    const f = c && c.__f;
    if (!f || !f.ok || f.ch.readyState !== 'open' || s.length > 15000) return false;
    if (f.ch.bufferedAmount > 65536) return true;
    try { f.ch.send('[' + (++f.sq) + ',' + s + ']'); return true; } catch (e) { return false; }
  };
  const ping = (c, t) => { fastHi(c); if (!fastTx(c, '{"__hb":' + t + '}')) tx(c, { __hb: t }); };
  const pong = (c, d, fast) => { if (fast) fastTx(c, '{"__hr":' + (+d.__hb || 0) + '}'); else tx(c, { __hr: d.__hb }); };
  const drop = () => {
    if (!conn) return;
    conn = null; clearInterval(hb);
    emit('close');
  };
  const attach = c => {
    conn = c; lastRx = now();
    const inn = (d, fast) => {
      if (conn !== c) return;
      lastRx = now();
      if (d && d.__hb) { pong(c, d, fast); return; }
      if (d && d.__hr) { net.rtt = Math.round(now() - d.__hr); return; }
      if (d && d.__hey) { if (net.role === 'host') tx(c, { __hi: 1 }); return; }
      if (d && (d.__hi || d.__full)) return;
      emit('data', d);
    };
    c.on('data', d0 => { const d = unck(c, d0); if (d !== null) inn(d, false); });
    fastOpen(c, d => inn(d, true));
    c.on('close', () => { if (conn === c) drop(); });
    c.on('error', () => { if (conn === c) drop(); });
    clearInterval(hb);
    let last = now();
    hb = setInterval(() => {
      if (conn !== c) return clearInterval(hb);
      const t = now();
      if (t - last > 2500) lastRx = Math.max(lastRx, t - 1000);
      last = t;
      ping(c, t);
      if (t - lastRx > 6000) drop();
    }, 1000);
    emit('open', net.role);
  };
  const keep = p => {
    let n = 0, next = 0;
    p.on('open', () => { n = 0; next = 0; });
    const t = setInterval(() => {
      if (p.destroyed) return clearInterval(t);
      if (!p.disconnected) { n = 0; return; }
      const tm = now();
      if (tm < next) return;
      next = tm + Math.min(30000, 1500 * Math.pow(2, n++));
      try { p.reconnect(); } catch (e) {}
    }, 1000);
  };
  const newPeer = async (id, my) => {
    let Peer;
    try { Peer = await loadPeer(); } catch (e) { try { Peer = await loadPeer(); } catch (x) { throw { type: 'load' }; } }
    const config = { iceServers: await netIce(), sdpSemantics: 'unified-plan' };
    let last = null;
    for (let i = 0; i < 3; i++) {
      if (i) {
        if (note) note(netT('Server busy, trying again ({n}/3)…').replace('{n}', i + 1));
        await sleepMs(1500 * i);
      }
      if (my != null && my !== gen) throw { type: 'cancel' };
      const p = new Peer(id, { debug: 0, config });
      try { await wait((res, rej) => { p.on('open', res); p.on('error', rej); }, 10000, 'network'); }
      catch (e) { try { p.destroy(); } catch (x) {} last = e; if (!e || NET_SOFT.indexOf(e.type) < 0) throw e; continue; }
      p.on('error', e => emit('error', e));
      keep(p);
      return p;
    }
    throw last || { type: 'network' };
  };
  const dial1 = (p, code, my, hello, done) => new Promise((res, rej) => {
    if (!p || p.destroyed) return rej({ type: 'network' });
    let c, settled = false, t = 0, ext = false, rs = 0;
    const ice = () => { const pc = c && c.peerConnection; return pc ? pc.iceConnectionState : 'new'; };
    const why = () => { const s = ice(); return s === 'checking' || s === 'failed' || s === 'disconnected' ? 'ice' : s === 'connected' || s === 'completed' ? 'timeout' : 'peer-unavailable'; };
    const fin = (e, v) => {
      if (settled) return;
      settled = true; clearTimeout(t); clearInterval(rs);
      try { p.off('error', onErr); } catch (x) {}
      if (e) { try { if (c) c.close(); } catch (x) {} rej(e); } else res(v);
    };
    const onErr = e => fin(e && e.type === 'peer-unavailable' ? e : e && e.type ? e : { type: 'network' });
    const tick = () => { if (!ext && ice() === 'checking') { ext = true; t = setTimeout(tick, 10000); return; } fin({ type: why() }); };
    t = setTimeout(tick, 12000);
    p.on('error', onErr);
    try { c = p.connect(pid(code), { reliable: true, serialization: 'json' }); } catch (e) { return fin({ type: 'network' }); }
    if (!c) return fin({ type: 'network' });
    c.on('open', () => {
      const say = () => { if (!settled) tx(c, hello || { __hey: 1 }); };
      say(); rs = setInterval(say, 1000);
    });
    c.on('error', e => { if (e && e.type === 'negotiation-failed') fin({ type: 'ice' }); });
    c.on('data', d => {
      if (settled) return;
      if (my !== gen) return fin({ type: 'cancel' });
      const r = done(d);
      if (r === true) fin(null, c);
      else if (r) fin(r);
    });
    c.on('close', () => fin({ type: why() }));
  });
  const dial = async (p, code, my, hello, done) => {
    try { return await dial1(p, code, my, hello, done); }
    catch (e) { if (e && e.type === 'timeout' && hello && my === gen && p && !p.destroyed) return dial1(p, code, my, hello, done); throw e; }
  };
  const rm = { me: null, key: null, name: '', hostId: null, list: [], guests: new Map(), seq: 0, min: 2, max: 4, sizes: [2, 3, 4], state: 'lobby', conn: null, lastRx: 0, hb: 0, ui: null, busy: false, reconn: false, pendingGo: null, inGame: false, leader: null, chat: [], rate: new Map(), compat: false, compatO: null, tick: 0, lastTick: 0, bots: false, botsOk: false, renamed: false };
  const leaderId = () => {
    if (net.role === 'host') return rm.leader && (rm.leader === rm.me || rm.guests.has(rm.leader)) ? rm.leader : rm.me;
    return rm.leader || rm.hostId;
  };
  const pubOf = gs => ({ id: gs.id, name: gs.name, host: false });
  const hostPlayers = () => {
    const L = leaderId();
    return [{ id: rm.me, name: rm.name, host: true, leader: L === rm.me, ping: 0, away: false, inGame: true }].concat([...rm.guests.values()].sort((a, b) => a.seq - b.seq).map(gs => ({ id: gs.id, name: gs.name, host: false, leader: L === gs.id, ping: gs.rtt, away: gs.away, inGame: gs.inGame })));
  };
  const uniqueName = (nm, skip) => {
    nm = netName(nm) || 'Player';
    const taken = new Set(hostPlayers().filter(p => p.id !== skip).map(p => p.name.toLowerCase()));
    if (!taken.has(nm.toLowerCase())) return nm;
    for (let i = 2; i < 99; i++) { const t = nm.slice(0, 13) + ' ' + i; if (!taken.has(t.toLowerCase())) return t; }
    return nm;
  };
  const cleanList = l => Array.isArray(l) ? l.slice(0, 8).filter(p => p && typeof p.id === 'string').map(p => ({ id: p.id.slice(0, 16), name: netName(p.name) || 'Player', host: !!p.host, leader: !!p.leader, ping: Math.max(0, Math.min(9999, +p.ping || 0)), away: !!p.away, inGame: !!p.inGame })) : [];
  const cleanSizes = l => Array.isArray(l) ? l.map(n => Math.round(+n)).filter(n => n >= 2 && n <= 8).slice(0, 7) : [];
  const cleanMsg = m => m && typeof m === 'object' ? { i: typeof m.i === 'string' ? m.i.slice(0, 16) : '', n: netName(m.n), x: netMsg(m.x), k: m.s && typeof m.k === 'string' ? netMsg(m.k).slice(0, 60) : '', a: netName(m.a), t: +m.t || Date.now(), s: m.s ? 1 : 0 } : null;
  const cleanChat = l => Array.isArray(l) ? l.slice(-100).map(cleanMsg).filter(m => m && m.x) : [];
  const txAll = m => {
    if (!rm.guests.size) return;
    const s = JSON.stringify(m), b = s.length < 16000 ? netTe.encode(s) : null;
    rm.guests.forEach(gs => tx(gs.conn, m, s, b));
  };
  const pushList = () => {
    rm.list = hostPlayers();
    const m = { __pl: rm.list, busy: rm.state === 'game', min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk };
    txAll(m);
    if (rm.ui) rm.ui.update();
  };
  const chatAdd = m => {
    rm.chat.push(m);
    if (rm.chat.length > 100) rm.chat.splice(0, rm.chat.length - 100);
    txAll({ __cm: m });
    if (rm.ui) rm.ui.chat();
  };
  const sysLine = (k, a = '') => chatAdd({ i: '', n: '', x: netMsg(k.replace('{name}', a)), k, a, t: Date.now(), s: 1 });
  const chatFrom = (id, nm, x) => {
    x = netMsg(x);
    if (!x) return;
    const t = Date.now(), r = (rm.rate.get(id) || []).filter(v => t - v < 5000);
    rm.rate.set(id, r);
    if (r.length >= 5) return;
    r.push(t);
    chatAdd({ i: id, n: nm, x, t, s: 0 });
  };
  const welOf = gs => ({ __wel: { id: gs.id, host: rm.me, code: net.code, busy: rm.state === 'game', inGame: gs.inGame, min: rm.min, max: rm.max, sizes: rm.sizes, leader: leaderId(), bots: rm.bots, canBots: rm.botsOk, chat: rm.chat } });
  const removeGuest = (id, why) => {
    const gs = rm.guests.get(id);
    if (!gs) return;
    rm.guests.delete(id); clearTimeout(gs.gt); rm.rate.delete(id);
    const c = gs.conn; gs.conn = null;
    if (c) { if (why === 'kick') tx(c, { __kick: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, why === 'kick' ? 400 : 0); }
    emit('leave', pubOf(gs));
    if (rm.compat && rm.state === 'game' && gs.inGame) emit('close');
    sysLine(why === 'kick' ? '{name} was removed from the party' : '{name} left the party', gs.name);
    if (rm.leader === id) { rm.leader = rm.me; sysLine('{name} is now the host', rm.name); }
    pushList();
  };
  const setLeader = id => {
    const p = hostPlayers().find(q => q.id === id && !q.away);
    if (!p || leaderId() === id) return;
    rm.leader = id;
    sysLine('{name} is now the host', p.name);
    if (id === rm.me && !rm.ui) toast('You are now the host');
    pushList();
  };
  const setSize = n => {
    n = Math.round(+n);
    if (rm.sizes.indexOf(n) < 0 || n < hostPlayers().length || n === rm.max || rm.state === 'game') return;
    rm.max = n;
    pushList();
  };
  const setBots = v => {
    v = !!v;
    if (!rm.botsOk || rm.state === 'game' || rm.bots === v) return;
    rm.bots = v;
    sysLine(v ? 'Bots will fill the empty seats' : 'Bots are off');
    pushList();
  };
  const ctl = (a, id, n) => {
    if (a === 'kick') { if (typeof id === 'string' && rm.guests.has(id)) removeGuest(id, 'kick'); }
    else if (a === 'lead') { if (typeof id === 'string') setLeader(id); }
    else if (a === 'size') setSize(n);
    else if (a === 'bots') setBots(n);
    else if (a === 'play') { if (rm.ui && rm.ui.play) rm.ui.play(); }
  };
  const leadAct = (a, id, n) => {
    if (mode !== 'room' || leaderId() !== rm.me) return;
    if (net.role === 'host') ctl(a, id, n); else tx(rm.conn, { __ctl: { a, id, n } });
  };
  const goAway = gs => {
    if (gs.away) return;
    const c = gs.conn; gs.conn = null; gs.away = true;
    try { if (c) c.close(); } catch (e) {}
    clearTimeout(gs.gt);
    gs.gt = setTimeout(() => removeGuest(gs.id, 'lost'), 12000);
    pushList();
  };
  const hostIn = (gid, c, d, fast) => {
    const gs = rm.guests.get(gid);
    if (!gs || gs.conn !== c) return;
    gs.lastRx = now();
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { gs.rtt = Math.round(now() - d.__hr); return; }
    if (d.__hello) { if (!fast) tx(c, welOf(gs)); return; }
    if (fast) { if (gs.inGame && rm.state === 'game') emit('data', d, gid); return; }
    if (d.__bye) { removeGuest(gid, 'left'); return; }
    if (d.__name) { const n2 = uniqueName(d.__name, gid); if (n2 !== gs.name) { gs.name = n2; pushList(); } return; }
    if (d.__chat) { chatFrom(gid, gs.name, d.__chat); return; }
    if (d.__ctl) { const k = d.__ctl; if (k && typeof k === 'object' && leaderId() === gid) ctl(String(k.a || ''), k.id, k.n); return; }
    if (d.__hi || d.__wel || d.__pl || d.__go || d.__lob || d.__cm) return;
    if (gs.inGame && rm.state === 'game') emit('data', d, gid);
  };
  const hostConn = (c, my) => {
    let gid = null;
    const kill = setTimeout(() => { if (!gid) { try { c.close(); } catch (e) {} } }, 15000);
    c.on('open', () => fastOpen(c, d => { if (gid && my === gen) hostIn(gid, c, d, true); }));
    c.on('data', d0 => {
      const d = unck(c, d0);
      if (my !== gen || !d || typeof d !== 'object') return;
      if (!gid) {
        const h = d.__hello;
        if (!h || typeof h.id !== 'string' || typeof h.key !== 'string') return;
        clearTimeout(kill);
        const id = h.id.slice(0, 16), old = rm.guests.get(id);
        if (old) {
          if (old.key !== h.key) { tx(c, { __full: 1, why: 'id' }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
          const prev = old.conn; gid = id;
          old.conn = c; old.lastRx = now(); old.away = false; clearTimeout(old.gt);
          if (prev && prev !== c) { try { prev.close(); } catch (e) {} }
          tx(c, welOf(old));
          if (old.inGame && rm.state === 'game') emit('rejoin', pubOf(old));
          pushList();
          return;
        }
        if (rm.guests.size + 1 >= rm.max) { tx(c, { __full: 1 }); setTimeout(() => { try { c.close(); } catch (e) {} }, 400); return; }
        gid = id;
        const gs = { id, key: h.key, name: uniqueName(h.name), conn: c, lastRx: now(), rtt: 0, inGame: false, away: false, gt: 0, seq: ++rm.seq };
        rm.guests.set(id, gs);
        tx(c, welOf(gs));
        emit('join', pubOf(gs));
        if (rm.state === 'game' && !rm.ui) toast(gs.name + ' is waiting in the lobby');
        sysLine('{name} joined the party', gs.name);
        pushList();
        return;
      }
      hostIn(gid, c, d, false);
    });
    const gone = () => { const gs = gid && rm.guests.get(gid); if (gs && gs.conn === c) goAway(gs); };
    c.on('close', gone);
    c.on('error', gone);
  };
  const hostTick = () => {
    const t = now(), stall = t - (rm.lastTick || t) > 2500;
    rm.lastTick = t;
    let mx = 0;
    rm.guests.forEach(gs => {
      if (!gs.conn) return;
      if (stall) gs.lastRx = Math.max(gs.lastRx, t - 1000);
      if (!gs.conn.open || t - gs.lastRx > 7000) return goAway(gs);
      ping(gs.conn, t);
      if (gs.inGame || rm.state !== 'game') mx = Math.max(mx, gs.rtt || 0);
    });
    net.rtt = mx;
    if (++rm.tick % 3 === 0) pushList();
  };
  const guestEnd = reason => {
    if (mode !== 'room' || net.role !== 'guest') return;
    const wasGame = rm.state === 'game' && rm.inGame;
    net.closeReason = reason;
    shut(false);
    if (rm.ui) rm.ui.ended(reason);
    if (wasGame || !rm.ui) emit('close', reason);
  };
  const guestData = (c, d, fast) => {
    if (c !== rm.conn || !d || typeof d !== 'object') return;
    rm.lastRx = now();
    if (d.__hb) { pong(c, d, fast); return; }
    if (d.__hr) { net.rtt = Math.round(now() - d.__hr); return; }
    if (fast) { if (rm.state === 'game' && rm.inGame) emit('data', d, rm.hostId); return; }
    if (d.__pl) {
      rm.list = cleanList(d.__pl); rm.busy = !!d.busy;
      if (+d.min) rm.min = +d.min;
      if (+d.max) rm.max = +d.max;
      const s = cleanSizes(d.sizes); if (s.length) rm.sizes = s;
      rm.bots = !!d.bots; rm.botsOk = !!d.canBots;
      const L = typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId;
      if (L !== rm.leader) { const was = rm.leader; rm.leader = L; if (was && L === rm.me && !rm.ui) toast('You are now the host'); }
      if (rm.ui) rm.ui.update();
      return;
    }
    if (d.__cm) {
      const m = cleanMsg(d.__cm);
      if (m && m.x) { rm.chat.push(m); if (rm.chat.length > 100) rm.chat.splice(0, rm.chat.length - 100); if (rm.ui) rm.ui.chat(); }
      return;
    }
    if (d.__go) {
      rm.state = 'game'; rm.inGame = true; rm.busy = true;
      const players = cleanList(d.__go).map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.leader }));
      const r = { role: 'guest', id: rm.me, players, size: Math.round(+d.size) || players.length, leader: typeof d.leader === 'string' ? d.leader.slice(0, 16) : rm.hostId, bots: !!d.bots };
      if (rm.ui) rm.ui.finish(r);
      else rm.pendingGo = r;
      return;
    }
    if (d.__lob) {
      rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null;
      emit('lobby');
      if (rm.compat && !(ls.lobby || []).length && !rm.ui) net.lobby(rm.compatO || {});
      return;
    }
    if (d.__kick) { guestEnd('kicked'); return; }
    if (d.__end) { guestEnd('host-left'); return; }
    if (d.__wel || d.__full || d.__hi || d.__ch) return;
    if (rm.state === 'game' && rm.inGame) emit('data', d, rm.hostId);
  };
  const guestConnect = async (code, my) => {
    let w = null;
    const c = await dial(peer, code, my, { __hello: { id: rm.me, key: rm.key, name: rm.name } }, d => {
      if (d && d.__full) return { type: d.why === 'id' ? 'network' : 'room-full' };
      if (d && d.__wel) { w = d.__wel; return true; }
      return false;
    });
    return { c, w };
  };
  const guestAttach = (c, w) => {
    rm.conn = c; rm.lastRx = now(); rm.reconn = false;
    rm.hostId = typeof w.host === 'string' ? w.host.slice(0, 16) : 'host';
    rm.busy = !!w.busy;
    if (+w.min) rm.min = +w.min;
    if (+w.max) rm.max = +w.max;
    const s = cleanSizes(w.sizes); if (s.length) rm.sizes = s;
    rm.bots = !!w.bots; rm.botsOk = !!w.canBots;
    rm.leader = typeof w.leader === 'string' ? w.leader.slice(0, 16) : rm.hostId;
    if (Array.isArray(w.chat)) rm.chat = cleanChat(w.chat);
    c.on('data', d0 => { const d = unck(c, d0); if (d !== null) guestData(c, d, false); });
    fastOpen(c, d => guestData(c, d, true));
    const gone = () => { if (rm.conn === c) guestLost(); };
    c.on('close', gone);
    c.on('error', gone);
    clearInterval(rm.hb);
    let last = now();
    rm.hb = setInterval(() => {
      if (rm.conn !== c) return;
      const t = now();
      if (t - last > 2500) rm.lastRx = Math.max(rm.lastRx, t - 1000);
      last = t;
      if (!c.open || t - rm.lastRx > 7000) return guestLost();
      ping(c, t);
    }, 1000);
    if (rm.ui) rm.ui.chat();
  };
  const guestLost = async () => {
    const c = rm.conn;
    if (!c || rm.reconn) return;
    rm.conn = null; rm.reconn = true; clearInterval(rm.hb);
    try { c.close(); } catch (e) {}
    if (rm.ui) rm.ui.update();
    const my = gen, code = net.code, t0 = now();
    while (my === gen && now() - t0 < 16000) {
      await new Promise(r => setTimeout(r, 1500));
      if (my !== gen) return;
      try {
        if (!peer || peer.destroyed) { const p = await newPeer(undefined, my); if (my !== gen) { p.destroy(); return; } peer = p; }
        else if (peer.disconnected) { try { peer.reconnect(); } catch (e) {} await new Promise(r => setTimeout(r, 1500)); }
        const { c: c2, w } = await guestConnect(code, my);
        if (my !== gen) { try { c2.close(); } catch (e) {} return; }
        if (rm.state === 'game' && rm.inGame && !w.inGame) { guestAttach(c2, w); guestEnd('lost'); return; }
        guestAttach(c2, w);
        if (rm.ui) rm.ui.update();
        return;
      } catch (e) {}
    }
    if (my === gen) guestEnd('lost');
  };
  const shut = polite => {
    gen++; clearInterval(hb); clearInterval(rm.hb);
    const c = conn, p = peer, gc = rm.conn, gs = [...rm.guests.values()], wasHost = mode === 'room' && net.role === 'host';
    conn = null; peer = null; rm.conn = null; rm.reconn = false;
    gs.forEach(x => clearTimeout(x.gt)); rm.guests.clear();
    let delay = 0;
    if (polite && mode === 'room') {
      if (wasHost) gs.forEach(x => { if (tx(x.conn, { __end: 1 })) delay = 350; });
      else if (tx(gc, { __bye: 1 })) delay = 350;
    }
    const bye = () => {
      try { if (c) c.close(); } catch (e) {}
      try { if (gc) gc.close(); } catch (e) {}
      gs.forEach(x => { try { if (x.conn) x.conn.close(); } catch (e) {} });
      try { if (p) p.destroy(); } catch (e) {}
    };
    if (delay) setTimeout(bye, delay); else bye();
    net.role = null; net.code = null; mode = null; net.rtt = 0;
    rm.list = []; rm.state = 'lobby'; rm.inGame = false; rm.busy = false; rm.pendingGo = null; rm.leader = null; rm.chat = []; rm.rate.clear();
  };
  const roomHost = async () => {
    shut(true);
    const my = gen;
    for (let i = 0; i < 5; i++) {
      const code = Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
      let p;
      try { p = await newPeer(pid(code), my); } catch (e) { if (e && e.type === 'unavailable-id') continue; throw e; }
      if (my !== gen) { p.destroy(); return null; }
      peer = p; net.code = code; net.role = 'host'; mode = 'room';
      rm.me = netUid(); rm.state = 'lobby'; rm.guests.clear(); rm.tick = 0; rm.lastTick = 0; rm.hostId = rm.me; rm.leader = rm.me; rm.chat = []; net.closeReason = null;
      p.on('connection', c => hostConn(c, my));
      clearInterval(rm.hb);
      rm.hb = setInterval(() => { if (my === gen) hostTick(); }, 1000);
      pushList();
      return code;
    }
    throw { type: 'network' };
  };
  const roomJoin = async code => {
    shut(true);
    const my = gen;
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const p = await newPeer(undefined, my);
    if (my !== gen) { p.destroy(); return false; }
    peer = p;
    rm.me = netUid(); rm.key = netUid() + netUid(); rm.state = 'lobby'; rm.inGame = false; rm.list = []; rm.leader = null; rm.chat = []; net.closeReason = null;
    let r;
    try { r = await guestConnect(code, my); } catch (e) { if (my === gen) shut(false); throw e; }
    if (my !== gen) { try { r.c.close(); } catch (e) {} return false; }
    if (invite && invite.id === g.id) invite = null;
    net.code = code; net.role = 'guest'; mode = 'room';
    guestAttach(r.c, r.w);
    return true;
  };
  const roomUi = (o, compat) => {
    if (!document.getElementById('g-lobby-css')) {
      const s = document.createElement('style'); s.id = 'g-lobby-css'; s.textContent = NET_CSS; document.head.append(s);
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'; document.head.append(l);
    }
    if (rm.ui) rm.ui.finish(null, true);
    o = o && typeof o === 'object' ? o : {};
    const cfg = netSizes(o);
    rm.compat = !!compat; rm.compatO = compat ? o : null;
    if (mode !== 'room') { rm.name = (rm.renamed && rm.name) || netLoadName() || netName(o.name) || netGuest(); rm.botsOk = !!o.bots && !compat; rm.bots = false; }
    if (mode === 'room' && net.role === 'guest' && rm.pendingGo) {
      const r = rm.pendingGo; rm.pendingGo = null;
      if (rm.compat) emit('open', 'guest');
      return Promise.resolve(r);
    }
    return new Promise(resolve => {
      const el = document.createElement('div');
      el.className = 'g-lobby';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', (g.title || 'Online') + ' party');
      const box = () => { const r = document.querySelector('.g-root.gm-' + g.id); return r && r.isConnected ? r : null; };
      const place = () => { const r = box(), p = r || document.fullscreenElement || document.body; el.classList.toggle('gl-fixed', !r); if (el.parentNode !== p) p.append(el); return p; };
      place(); void el.offsetWidth; el.classList.add('gl-on');
      let note0 = '', done = false, screen = '', phase = '', err = '', again = null, op = 0, pick = 0, hidden = netLs('gameplay:hidecode') === '1', sent = [], cache = {}, playT = 0, slowT = 0, editing = false, lastFit = '', rows = 0, seen = new Set(), chatN = 0, flashT = 0, flashM = '';
      const saved = Math.round(+netLs('gameplay:partysize:' + g.id));
      pick = cfg.sizes.indexOf(saved) >= 0 ? saved : cfg.def;
      const fit = () => {
        const c = !done && el.querySelector('.gl-card');
        if (!c) return;
        const p = place(), vp = el.classList.contains('gl-fixed');
        const W = vp ? innerWidth : p.clientWidth, H = vp ? innerHeight : p.clientHeight;
        if (!W || !H) return;
        const k = vp ? 1 : (p.getBoundingClientRect().width / W) || 1, Wv = W * k, Hv = H * k;
        lastFit = [W, H, k.toFixed(3), screen, rows].join();
        const stack = Wv < 600 || Hv < 340;
        el.classList.toggle('gl-stack', stack);
        el.classList.remove('gl-cmp', 'gl-fixh', 'gl-mid');
        c.style.zoom = ''; c.style.width = ''; c.style.height = '';
        if (stack) {
          const pv = 10, sv = Math.min(1, (Wv - pv * 2) / 340), s = sv / k;
          el.style.padding = (pv / k) + 'px';
          c.style.width = ((W - pv * 2 / k) / s) + 'px'; c.style.zoom = String(s);
          return;
        }
        const pv = 16, av = Wv - pv * 2, bw = Math.min(1040, Math.max(760, av)), aw = av / bw, ah = Hv - pv * 2;
        el.style.padding = (pv / k) + 'px';
        el.classList.toggle('gl-mid', bw < 900);
        el.style.setProperty('--glc', (bw >= 960 ? 330 : Math.round(.36 * (bw - 80))) + 'px');
        c.style.width = bw + 'px';
        let h = c.offsetHeight;
        if (Math.min(1, aw) * h > ah * 1.02 || ah / h < .9) { el.classList.add('gl-cmp'); h = c.offsetHeight; }
        const sv = Math.min(1, aw, Math.max(.62, ah / h));
        if (h * sv > ah + 1) { el.classList.add('gl-fixh'); c.style.height = (ah / sv) + 'px'; }
        c.style.zoom = String(sv / k);
      };
      const tick = setInterval(() => {
        if (done || document.hidden) return;
        const p = el.parentNode;
        if (!p || !el.isConnected) return place(), fit();
        const vp = el.classList.contains('gl-fixed'), W = vp ? innerWidth : p.clientWidth, H = vp ? innerHeight : p.clientHeight, k = vp ? 1 : (p.getBoundingClientRect().width / (W || 1)) || 1;
        if ([W, H, k.toFixed(3), screen, rows].join() !== lastFit || (!vp && !box())) fit();
      }, 400);
      const onFs = () => { setTimeout(fit, 60); setTimeout(fit, 450); };
      const guard = e => { if (!el.contains(e.target)) e.stopPropagation(); };
      window.addEventListener('resize', onFs);
      window.addEventListener('keydown', guard, true);
      window.addEventListener('keyup', guard, true);
      document.addEventListener('fullscreenchange', onFs);
      const ui = {};
      const finish = (r, keep) => {
        if (done) return;
        done = true; note = null; clearTimeout(playT); clearTimeout(slowT); clearTimeout(flashT); clearInterval(tick);
        window.removeEventListener('resize', onFs);
        window.removeEventListener('keydown', guard, true);
        window.removeEventListener('keyup', guard, true);
        document.removeEventListener('fullscreenchange', onFs);
        if (rm.ui === ui) rm.ui = null;
        el.classList.remove('gl-on'); el.style.pointerEvents = 'none';
        setTimeout(() => el.remove(), 300);
        if (r === null && !keep) shut(true);
        if (r && rm.compat) emit('open', r.role);
        resolve(r);
      };
      const T = netT;
      const ready = () => phase === 'ready' && mode === 'room';
      const shareLbl = T(navigator.share ? 'Share invite link' : 'Copy invite link');
      const eye = () => `<svg viewBox="0 0 24 24" aria-hidden="true">${hidden ? NET_I.eyeOff : NET_I.eye}</svg><span>${T(hidden ? 'Show' : 'Hide')}</span>`;
      const codeHtml = () => {
        const c = ready() ? net.code : phase === 'joining' || phase === 'error' && again && again.code ? (again && again.code) || '' : '';
        const on = ready();
        return `<small>${T('Party code')}</small><div class="gl-codebox"><b class="gl-codetxt${on ? '' : ' gl-pend'}">${on && hidden ? '••••' : c ? netEsc(c) : '····'}</b><span class="gl-tools"><button class="gl-hide" type="button" data-n="hide" aria-pressed="${hidden}" aria-label="${T(hidden ? 'Show party code' : 'Hide party code')}"${on ? '' : ' disabled'}>${eye()}</button><button class="gl-sq gl-crown" type="button" data-n="share" title="${shareLbl}" aria-label="${shareLbl}"${on ? '' : ' disabled'}>${NET_I.link}</button></span></div>`;
      };
      const head = (lbl, code) => `<header class="gl-head"><button class="gl-leave" type="button" data-n="back">${NET_I.back}<span>${T(lbl)}</span></button><h1>${netEsc(g.title || o.title || 'Online party')}</h1>${code ? '<div class="gl-code"></div>' : ''}</header>`;
      const joinForm = () => `<form class="gl-join" autocomplete="off"><input class="gl-code-in" maxlength="4" placeholder="${T('Join with a code')}" aria-label="${T('Join with a code')}" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="go"><button class="gl-jbtn" type="submit">${T('Join')}</button></form>`;
      const row = (p, lead, amLead) => {
        const isL = p.id === lead, me = p.id === rm.me, nm = netEsc(p.name);
        let sub = T(isL ? 'Party leader' : 'Member') + (me ? ' · ' + T('You') : '');
        if (p.away) sub += ' · ' + T('Reconnecting…');
        else if (rm.busy && !p.inGame) sub += ' · ' + T('Waiting');
        else if (rm.busy) sub += ' · ' + T('In game');
        let b = '';
        if (amLead && ready()) {
          b = isL ? `<span class="gl-sq gl-crown" title="${T('Party leader')}">${NET_I.crown}</span>` : `<button class="gl-sq gl-crown" type="button" data-n="lead" data-id="${netEsc(p.id)}" title="${T('Make host')}" aria-label="${T('Make host')}: ${nm}"${p.away ? ' disabled' : ''}>${NET_I.crown}</button>`;
          b += me || p.host ? '<span class="gl-sq gl-ph"></span>' : `<button class="gl-sq gl-kick" type="button" data-n="kick" data-id="${netEsc(p.id)}" title="${T('Remove')}" aria-label="${T('Remove')}: ${nm}">${NET_I.x}</button>`;
        } else if (isL) b = `<span class="gl-sq gl-crown" title="${T('Party leader')}">${NET_I.crown}</span>`;
        const name = me && editing ? `<input class="gl-rnin" maxlength="16" value="${nm}" aria-label="${T('Your name')}" autocomplete="off" spellcheck="false" enterkeyhint="done">` : me ? `<button class="gl-rn" type="button" data-n="rename" title="${T('Change your name')}"><i>${nm}</i>${NET_I.pen}</button>` : `<i>${nm}</i>`;
        const nw = !seen.has(p.id);
        return `<li class="gl-pl${nw ? ' gl-new' : ''}${isL ? ' gl-lead' : ''}${p.away ? ' gl-away' : ''}"><span class="gl-av" aria-hidden="true">${netEsc(netInit(p.name))}</span><div class="gl-who"><b>${name}${isL ? '<span class="gl-badge">HOST</span>' : ''}</b><span>${sub}</span></div>${b}</li>`;
      };
      const seat = () => `<li class="gl-pl gl-seat${rm.bots ? ' gl-botseat' : ''}"><span class="gl-av" aria-hidden="true">${rm.bots ? NET_I.bot : NET_I.plus}</span><div class="gl-who"><b><i>${T(rm.bots ? 'Bot' : 'Empty seat')}</i></b><span>${T(rm.bots ? 'A bot plays this seat' : 'Waiting for a player…')}</span></div></li>`;
      const put = (k, sel, html) => {
        if (cache[k] === html) return false;
        const x = el.querySelector(sel);
        if (!x) return false;
        cache[k] = html;
        const a = document.activeElement, keepIn = a && a.classList && a.classList.contains('gl-rnin') && x.contains(a) ? [a.value, a.selectionStart, a.selectionEnd] : null;
        x.innerHTML = html;
        if (keepIn) { const n = x.querySelector('.gl-rnin'); if (n) { n.value = keepIn[0]; try { n.focus({ preventScroll: true }); n.setSelectionRange(keepIn[1], keepIn[2]); } catch (e) {} } }
        return true;
      };
      const show = s => {
        screen = s; note = null; cache = {}; editing = false;
        if (s === 'lobby') {
          el.innerHTML = `<div class="gl-card gl-lob" tabindex="-1">${head('Leave', true)}<div class="gl-body"><section class="gl-sec gl-plsec" aria-label="${T('Players')}"><div class="gl-sec-h"><h2>${T('Players')}</h2><span class="gl-cnt"></span></div><ul class="gl-players"></ul><div class="gl-bots"></div></section><div class="gl-rule"></div><section class="gl-sec gl-chat" aria-label="${T('Live chat')}"><div class="gl-sec-h"><h2>${T('Live chat')}</h2><span class="gl-pill gl-live">${T('Live')}</span></div><div class="gl-msgs" role="log" aria-live="polite"></div><form class="gl-send" autocomplete="off"><input class="gl-chat-in" maxlength="200" placeholder="${T('Type a message...')}" autocomplete="off" enterkeyhint="send" aria-label="${T('Message')}"><button class="gl-go" type="submit" aria-label="${T('Send')}">${NET_I.send}</button></form></section></div><footer class="gl-foot">${joinForm()}<div class="gl-act"></div><p class="gl-hint" role="status"></p></footer></div>`;
          ui.update(); ui.chat(true);
        } else if (s === 'ended') {
          el.innerHTML = `<div class="gl-card" tabindex="-1">${head('Close')}<div class="gl-body"><div class="gl-center"><p class="gl-msg">${netEsc(ui.endMsg[0])}</p><p class="gl-txt">${netEsc(ui.endMsg[1])}</p></div></div><footer class="gl-foot">${joinForm()}<div class="gl-act"><button class="gl-play" type="button" data-n="new">${NET_I.plus}${T('New party')}</button></div><p class="gl-hint"></p></footer></div>`;
        }
        const c = el.querySelector('.gl-card');
        fit();
        if (!el.contains(document.activeElement)) { try { c.focus({ preventScroll: true }); } catch (e) {} }
      };
      ui.finish = finish;
      ui.update = () => {
        if (done || screen !== 'lobby') return;
        const jn = phase === 'joining' || (phase === 'error' && !!(again && again.code));
        const on = ready(), lead = on ? leaderId() : rm.me, amLead = on ? lead === rm.me : !jn;
        const L = on ? rm.list : jn ? [] : [{ id: rm.me, name: rm.name, host: true, leader: true }];
        const size = on ? rm.max : pick, n = L.filter(p => !p.away).length;
        put('code', '.gl-code', codeHtml());
        let pl = L.map(p => row(p, lead, amLead)).join('');
        if (jn) pl = `<li class="gl-pl gl-seat"><span class="gl-av" aria-hidden="true">${phase === 'error' ? NET_I.x : NET_I.plus}</span><div class="gl-who"><b><i>${netEsc(phase === 'error' ? T('Party {code}').replace('{code}', again.code) : T('Joining party…'))}</i></b><span>${netEsc(T(phase === 'error' ? 'Could not join this party' : 'Connecting to the party…'))}</span></div></li>`;
        else for (let i = L.length; i < size; i++) pl += seat();
        if (put('pl', '.gl-players', pl)) L.forEach(p => seen.add(p.id));
        const nr = Math.max(size, L.length, 1);
        if (nr !== rows) { rows = nr; el.style.setProperty('--rows', String(nr)); fit(); }
        const jt = netEsc(T('{n} / {m} joined').replace('{n}', L.length).replace('{m}', size));
        const opts = amLead && !rm.busy && !rm.reconn && !jn ? (on ? rm.sizes : cfg.sizes).filter(s => s >= L.length) : [];
        put('cnt', '.gl-cnt', opts.length > 1 ? `<label class="gl-pill gl-pick">${jt}${NET_I.down}<select data-n="sizesel" aria-label="${T('Party size')}">${opts.map(s => `<option value="${s}"${s === size ? ' selected' : ''}>${T('{n} players').replace('{n}', s)}</option>`).join('')}</select></label>` : `<span class="gl-pill">${jt}</span>`);
        const botsOk = on ? rm.botsOk : !jn && rm.botsOk;
        put('bots', '.gl-bots', botsOk ? `<span class="gl-av" aria-hidden="true">${NET_I.bot}</span><div class="gl-who"><b><i>${T('Fill empty seats with bots')}</i></b><span>${T(!amLead ? (rm.bots ? 'On · set by the host' : 'Off · set by the host') : rm.bots ? 'Bots play the empty seats' : 'Only real players play')}</span></div><button class="gl-sw" type="button" role="switch" data-n="bots" aria-checked="${rm.bots}" aria-label="${T('Fill empty seats with bots')}"${amLead && !rm.busy && !rm.reconn ? '' : ' disabled'}></button>` : '');
        const need = rm.bots ? 1 : on ? rm.min : cfg.min;
        let f, hint = '', bad = false;
        if (phase === 'creating') { f = `<div class="gl-wait" role="status">${T('Creating party…')}</div>`; hint = note0 || ''; }
        else if (phase === 'joining') { f = `<div class="gl-wait" role="status">${netEsc(T('Joining party {code}…').replace('{code}', (again && again.code) || ''))}</div>`; hint = note0 || ''; }
        else if (phase === 'error') { f = `<button class="gl-play" type="button" data-n="retry">${T('Try again')}</button>${again && again.code ? `<button class="gl-play gl-ghost" type="button" data-n="new">${T('Create my own party')}</button>` : ''}`; hint = err; bad = true; }
        else if (amLead) {
          const blocked = rm.busy && net.role !== 'host';
          hint = rm.reconn ? T('Connection lost. Reconnecting…') : blocked ? T('A game is in progress. You can start when it ends.') : n < need ? T(need - n > 1 ? 'Waiting for {n} more players…' : 'Waiting for 1 more player…').replace('{n}', need - n) : '';
          f = `<button class="gl-play" type="button" data-n="play"${n < need || blocked || rm.reconn ? ' disabled' : ''}>${NET_I.play}${T('Play')}</button>`;
        } else f = `<div class="gl-wait" role="status">${T(rm.reconn ? 'Connection lost. Reconnecting…' : rm.busy ? 'A game is in progress. You will join the next one.' : 'Waiting for the host…')}</div>`;
        put('ft', '.gl-act', f);
        const h = el.querySelector('.gl-hint');
        if (flashM) { hint = flashM; bad = false; }
        if (h && h.textContent !== hint) h.textContent = hint;
        if (h) h.classList.toggle('gl-bad', bad);
      };
      ui.chat = force => {
        if (done || screen !== 'lobby') return;
        const bx = el.querySelector('.gl-msgs');
        if (!bx) return;
        const stick = force === true || bx.scrollTop + bx.clientHeight >= bx.scrollHeight - 40;
        const n0 = force === true ? rm.chat.length : chatN;
        chatN = rm.chat.length;
        bx.innerHTML = rm.chat.length ? rm.chat.map((m, i) => m.s ? `<div class="gl-m gl-sys${i >= n0 ? ' gl-new' : ''}"><p>${netEsc(m.k ? T(m.k).replace('{name}', m.a) : m.x)} · <time>${netHm(m.t)}</time></p></div>` : `<div class="gl-m${m.i === rm.me ? ' gl-me' : ''}${i >= n0 ? ' gl-new' : ''}"><b>${netEsc(m.n)}</b><time>${netHm(m.t)}</time><p>${netEsc(m.x)}</p></div>`).join('') : `<p class="gl-empty">${T('No messages yet. Say hi!')}</p>`;
        if (stick) bx.scrollTop = bx.scrollHeight;
      };
      ui.flash = m => { flashM = m; clearTimeout(flashT); flashT = setTimeout(() => { flashM = ''; ui.update(); }, 2600); ui.update(); };
      ui.endMsg = ['', ''];
      ui.ended = reason => {
        if (done) return;
        const k = reason === 'kicked', h = reason === 'host-left';
        ui.endMsg = [T(k ? 'You were removed from the party' : h ? 'The party was closed' : 'Lost connection to the party'), T(k ? 'The host removed you from this party. Start a new party or join another one with a code.' : h ? 'The host left, so the party ended. Start a new party or join another one with a code.' : 'Check your internet connection, then join the party again.')];
        show('ended');
      };
      rm.ui = ui;
      const canRetry = e => { const t = e && e.type; return t === 'ice' || t === 'timeout' || t === 'peer-unavailable' || NET_SOFT.indexOf(t) >= 0; };
      const fail = (m, fn) => { phase = 'error'; err = m; again = fn; if (screen !== 'lobby') show('lobby'); else { cache = {}; ui.update(); } };
      const hosting = async () => {
        const my = ++op;
        phase = 'creating'; err = ''; again = null; note0 = '';
        note = t => { if (!done && my === op) { note0 = t; ui.update(); } };
        show('lobby');
        try {
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes;
          const code = await roomHost();
          if (done || my !== op || !code) return;
          note = null; note0 = '';
          rm.min = cfg.min; rm.max = pick; rm.sizes = cfg.sizes; phase = 'ready'; cache = {};
          pushList();
          netTrack('party_create', { game: g.id, size: pick });
        } catch (e) { if (!done && my === op && !(e && e.type === 'cancel')) { note = null; fail(netWhy(e), hosting); } }
      };
      const joining = async code => {
        code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!/^[A-Z0-9]{4}$/.test(code)) { const f = el.querySelector('.gl-join'), i = f && f.querySelector('input'); if (f) { f.classList.add('gl-bad'); try { i.focus({ preventScroll: true }); } catch (e) {} } return; }
        if (ready() && code === net.code) { const i = el.querySelector('.gl-code-in'); if (i) i.value = ''; return; }
        const my = ++op, fn = () => joining(code);
        fn.code = code;
        phase = 'joining'; err = ''; again = fn; note0 = '';
        note = t => { if (!done && my === op) { note0 = t; ui.update(); } };
        rm.botsOk = false; rm.bots = false;
        if (screen !== 'lobby') show('lobby'); else { cache = {}; ui.update(); }
        try {
          const ok = await roomJoin(code);
          if (done || my !== op || !ok) return;
          note = null; note0 = ''; phase = 'ready'; cache = {};
          el.querySelectorAll('.gl-code-in').forEach(i => { i.value = ''; });
          netTrack('party_join', { game: g.id });
          ui.update(); ui.chat(true); fit();
        } catch (e) {
          const t = e && e.type;
          if (done || my !== op || t === 'cancel') return;
          note = null;
          fail(t === 'room-full' ? T('Party {code} is full.').replace('{code}', code) : netWhy(e, code), canRetry(e) ? fn : Object.assign(() => joining(code), { code }));
        }
      };
      const fresh = () => { rm.botsOk = !!o.bots && !rm.compat; rm.bots = false; rows = 0; hosting(); };
      const play = () => {
        if (done || screen !== 'lobby' || net.role !== 'host' || mode !== 'room' || rm.state === 'game') return;
        const players = hostPlayers().filter(p => !p.away);
        if (players.length < (rm.bots ? 1 : rm.min)) return;
        rm.state = 'game';
        const ids = new Set(players.map(p => p.id));
        rm.guests.forEach(gs => { gs.inGame = ids.has(gs.id); });
        const lead = leaderId(), bots = !!(rm.botsOk && rm.bots);
        const out = players.map(p => ({ id: p.id, name: p.name, host: p.host, leader: p.id === lead }));
        rm.guests.forEach(gs => { if (gs.inGame) tx(gs.conn, { __go: out, size: rm.max, leader: lead, bots }); });
        pushList();
        netTrack('party_play', { game: g.id, players: out.length, size: rm.max, bots });
        finish({ role: 'host', id: rm.me, players: out, size: rm.max, leader: lead, bots });
      };
      ui.play = play;
      const toggleHide = () => {
        hidden = !hidden; netLs('gameplay:hidecode', hidden ? '1' : null);
        cache.code = ''; ui.update();
      };
      const slow = i => {
        const f = i.closest('.gl-send');
        f.classList.add('gl-slow'); i.placeholder = T('Slow down a little…');
        clearTimeout(slowT); slowT = setTimeout(() => { f.classList.remove('gl-slow'); i.placeholder = T('Type a message...'); }, 2500);
      };
      const sendChat = () => {
        const i = el.querySelector('.gl-chat-in');
        if (!i) return;
        const v = netMsg(i.value);
        if (!v || !ready() || (net.role === 'guest' && !rm.conn)) return;
        const t = Date.now();
        sent = sent.filter(x => t - x < 5000);
        if (sent.length >= 5) return slow(i);
        sent.push(t); i.value = '';
        if (net.role === 'host') chatFrom(rm.me, rm.name, v); else tx(rm.conn, { __chat: v });
      };
      const rename = v => {
        editing = false;
        v = netName(v);
        if (v && v !== rm.name) {
          netSaveName(v); rm.renamed = true;
          if (ready() && net.role === 'host') { rm.name = uniqueName(v, rm.me); pushList(); }
          else { rm.name = v; if (ready()) tx(rm.conn, { __name: v }); }
        }
        cache.pl = ''; ui.update();
      };
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-n]');
        if (!b || done || b.disabled || b.tagName === 'SELECT') return;
        const n = b.dataset.n;
        sfx('tap');
        if (n === 'back') finish(null);
        else if (n === 'new') { op++; shut(true); fresh(); }
        else if (n === 'retry' && again) again();
        else if (n === 'share') shareLink();
        else if (n === 'hide') toggleHide();
        else if (n === 'rename') { editing = true; cache.pl = ''; ui.update(); const i = el.querySelector('.gl-rnin'); if (i) { try { i.focus({ preventScroll: true }); i.select(); } catch (x) {} } }
        else if (n === 'kick' || n === 'lead') leadAct(n, b.dataset.id);
        else if (n === 'bots') { if (ready()) leadAct('bots', null, !rm.bots); else { rm.bots = !rm.bots; ui.update(); } }
        else if (n === 'play') {
          if (net.role === 'host') return leadAct('play');
          leadAct('play'); b.disabled = true; cache.ft = '';
          clearTimeout(playT); playT = setTimeout(() => ui.update(), 3000);
        }
      });
      el.addEventListener('submit', e => {
        e.preventDefault();
        if (e.target.matches('.gl-send')) sendChat();
        else if (e.target.matches('.gl-join')) joining(e.target.querySelector('input').value);
      });
      ['keydown', 'keyup', 'keypress', 'pointerdown', 'pointermove', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'wheel', 'contextmenu'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
      el.addEventListener('keydown', e => {
        if (!e.target.matches('.gl-rnin')) return;
        if (e.key === 'Enter') { e.preventDefault(); rename(e.target.value); }
        else if (e.key === 'Escape') { e.preventDefault(); editing = false; cache.pl = ''; ui.update(); }
      });
      el.addEventListener('focusout', e => { if (editing && e.target.matches('.gl-rnin')) { const v = e.target.value; setTimeout(() => { if (editing && !done) rename(v); }, 0); } });
      el.addEventListener('input', e => {
        if (e.target.matches('.gl-code-in')) { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); e.target.closest('.gl-join').classList.remove('gl-bad'); }
      });
      el.addEventListener('change', e => {
        if (!e.target.matches('select[data-n=sizesel]')) return;
        const v = Math.round(+e.target.value);
        netLs('gameplay:partysize:' + g.id, String(v));
        if (ready()) leadAct('size', null, v); else if (cfg.sizes.indexOf(v) >= 0) { pick = v; rm.max = v; ui.update(); }
      });
      add(() => finish(null, true));
      if (mode === 'room' && net.role === 'host' && peer && !peer.destroyed) {
        rm.min = cfg.min; rm.sizes = cfg.sizes; rm.state = 'lobby'; phase = 'ready';
        if (cfg.sizes.indexOf(rm.max) < 0) rm.max = cfg.sizes.find(s => s >= rm.guests.size + 1) || cfg.sizes[cfg.sizes.length - 1];
        rm.guests.forEach(gs => { gs.inGame = false; tx(gs.conn, { __lob: 1 }); });
        pushList();
        show('lobby');
      } else if (mode === 'room' && net.role === 'guest' && (rm.conn || rm.reconn)) { phase = 'ready'; show('lobby'); }
      else if (net.invite && !invite.host) joining(net.invite);
      else { if (invite && invite.host && invite.id === g.id) invite = null; hosting(); }
      loadPeer().catch(() => {}); netIce();
    });
  };
  const net = {
    role: null, code: null, rtt: 0, closeReason: null,
    get id() { return mode === 'room' ? rm.me : null; },
    get players() { return mode === 'room' ? rm.list.map(p => Object.assign({}, p)) : []; },
    get leader() { return mode === 'room' ? leaderId() : null; },
    get size() { return mode === 'room' ? rm.max : mode === 'pair' ? 2 : null; },
    get bots() { return mode === 'room' && rm.botsOk && rm.bots; },
    get connected() {
      if (mode === 'room') {
        if (net.role !== 'host') return !!(rm.conn && rm.conn.open);
        if (rm.compat) return [...rm.guests.values()].some(gs => gs.conn && gs.conn.open);
        return !!(peer && !peer.destroyed);
      }
      return !!(conn && conn.open);
    },
    get invite() { return invite && invite.id === g.id ? invite.host ? 'NEW' : invite.code : null; },
    on(t, fn) { (ls[t] = ls[t] || []).push(fn); const off = () => { ls[t] = (ls[t] || []).filter(f => f !== fn); }; add(off); return off; },
    send(msg, fast) {
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return; }
      if (s === undefined) return;
      let b = null;
      const one = c => { if (fast && fastTx(c, s)) return; if (!b && s.length < 16000) b = netTe.encode(s); tx(c, msg, s, b); };
      if (mode === 'room') {
        if (net.role === 'host') rm.guests.forEach(gs => { if (gs.inGame) one(gs.conn); });
        else one(rm.conn);
        return;
      }
      one(conn);
    },
    sendTo(id, msg, fast) {
      if (mode !== 'room') return net.send(msg, fast);
      const c = net.role === 'host' ? (rm.guests.get(id) || {}).conn : id === rm.hostId ? rm.conn : null;
      if (!c) return false;
      let s;
      try { s = JSON.stringify(msg); } catch (e) { return false; }
      return (fast && fastTx(c, s)) || tx(c, msg, s);
    },
    kick(id) { if (mode === 'room' && net.role === 'host') removeGuest(id, 'kick'); },
    link(code = net.code) { return location.origin + (PATH_MODE ? '/' : location.pathname + '#/') + g.id + '/' + code; },
    close() { shut(true); },
    async host() {
      shut(true);
      const my = gen;
      for (let i = 0; i < 4; i++) {
        const code = Array.from({ length: 4 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
        let p;
        try { p = await newPeer(pid(code), my); } catch (e) { if (e && e.type === 'unavailable-id') continue; throw e; }
        if (my !== gen) { p.destroy(); return null; }
        peer = p; net.code = code; net.role = 'host'; mode = 'pair';
        p.on('connection', c => c.on('open', () => {
          if (conn || my !== gen) { try { c.send({ __full: 1 }); } catch (e) {} setTimeout(() => c.close(), 400); return; }
          try { c.send({ __hi: 1 }); } catch (e) {}
          attach(c);
        }));
        return code;
      }
      throw { type: 'network' };
    },
    async join(code) {
      shut(true);
      const my = gen;
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const p = await newPeer(undefined, my);
      if (my !== gen) { p.destroy(); return false; }
      peer = p;
      let c;
      try { c = await dial(p, code, my, null, d => d && d.__hi ? true : d && d.__full ? { type: 'room-full' } : false); }
      catch (e) { if (my === gen) shut(false); throw e; }
      if (my !== gen) { try { c.close(); } catch (e) {} return false; }
      if (invite && invite.id === g.id) invite = null;
      net.code = code; net.role = 'guest'; mode = 'pair';
      attach(c);
      return true;
    },
    lobby(o = {}) { return roomUi(Object.assign({}, o, { sizes: [2], min: 2, max: 2, defaultSize: 2 }), true).then(r => r ? r.role : null); },
    room(o = {}) { return roomUi(o, false); }
  };
  const say = m => { if (rm.ui && rm.ui.flash) rm.ui.flash(netT(m)); else toast(m); };
  const shareLink = () => {
    const url = net.link();
    const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => say('Invite link copied'), () => say(url)); else say(url); };
    if (navigator.share) navigator.share({ title: g.title + ' on gameplay', text: `Join my ${g.title} party on gameplay! Party code ${net.code}`, url }).catch(e => { if (!e || e.name !== 'AbortError') copy(); });
    else copy();
  };
  const onHide = () => { if (mode) shut(true); };
  window.addEventListener('pagehide', onHide);
  add(() => window.removeEventListener('pagehide', onHide));
  add(() => shut(true));
  return net;
}
function makeApi(g, root) {
  const fns = [], add = f => fns.push(f);
  let alive = true, keys = null, net = null;
  const api = {
    root, colors: C, sfx, toast,
    get alive() { return alive; },
    get paused() { return PAUSE.on; },
    get online() { return !!(net && (net.connected || net.role)); },
    get muted() { return S.muted; },
    get net() { return net || (net = gpNetWrap(g, makeNet(g, add))); },
    get best() { return S.best[g.id] ?? null; },
    score(v) { if (alive) $('#pScore').textContent = typeof v === 'number' ? fmt(g, v) : (v ?? '—'); },
    label(t) { if (alive) $('#pScoreK').textContent = t; },
    submit(v) {
      if (!alive || typeof v !== 'number' || !isFinite(v) || !(v > 0)) return false;
      const b = S.best[g.id];
      if (b != null && (g.better === 'low' ? v >= b : v <= b)) return false;
      S.best[g.id] = v; save(); setBest(g, true); toast('New best · ' + fmt(g, v)); track('record', { game: g.id });
      return true;
    },
    overlay(o = {}) {
      api.hideOverlay();
      const el = document.createElement('div');
      el.className = 'g-overlay';
      const stats = o.stats && o.stats.length ? `<div class="g-ov-stats">${o.stats.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : '';
      el.innerHTML = `<div class="g-ov-card">${o.kicker ? `<p class="g-ov-kicker">${o.kicker}</p>` : ''}${o.title ? `<h3 class="g-ov-title">${o.title}</h3>` : ''}${o.text ? `<p class="g-ov-text">${o.text}</p>` : ''}${stats}<div class="g-ov-btns">${o.button === null ? '' : `<button class="g-btn" data-a="1">${o.button || 'Play'}</button>`}${o.secondary ? `<button class="g-btn ghost" data-a="2">${o.secondary}</button>` : ''}</div></div>`;
      el.addEventListener('click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !alive) return;
        api.hideOverlay(); sfx('tap'); frame.focus({ preventScroll: true });
        const fn = b.dataset.a === '1' ? o.onAction : o.onSecondary;
        if (fn) fn();
      });
      frame.append(el); void el.offsetWidth; el.classList.add('show');
      ov = { el, at: performance.now(), fire: () => { const b = el.querySelector('[data-a="1"]'); if (b) b.click(); } };
      return api.hideOverlay;
    },
    hideOverlay() {
      if (!ov) return;
      const { el } = ov; ov = null;
      el.classList.remove('show'); el.style.pointerEvents = 'none';
      setTimeout(() => el.remove(), 400);
    },
    on(t, type, fn, opt) { t.addEventListener(type, fn, opt); add(() => t.removeEventListener(type, fn, opt)); },
    timeout(fn, ms) { const id = setTimeout(() => alive && fn(), ms); add(() => clearTimeout(id)); return id; },
    interval(fn, ms) { const id = setInterval(() => alive && fn(), ms); add(() => clearInterval(id)); return id; },
    loop(fn) {
      let on = true, last = performance.now(), id = 0;
      const step = t => {
        if (!on || !alive) return;
        if (PAUSE.on) { last = t; id = requestAnimationFrame(step); return; }
        const dt = Math.min(.05, Math.max(0, (t - last) / 1000)); last = t;
        fn(dt, t);
        if (on) id = requestAnimationFrame(step);
      };
      id = requestAnimationFrame(step);
      const stop = () => { on = false; cancelAnimationFrame(id); };
      add(stop); return stop;
    },
    canvas(w, h, parent = root) {
      const c = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.className = 'g-canvas';
      c.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
      c.style.aspectRatio = `${w} / ${h}`;
      const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parent.append(c);
      const c2e = { canvas: c, ctx, w, h, d: dpr, d0: dpr, busy: false, manual: false };
      ['setTransform', 'resetTransform', 'getImageData', 'putImageData'].forEach(k => {
        const f = ctx[k];
        if (typeof f !== 'function') return;
        ctx[k] = function () { if (!c2e.busy && !c2e.manual) { c2e.manual = true; if (Math.abs(c2e.d - c2e.d0) > 0.01) gpRaster(c2e, c2e.d0, true); } return f.apply(ctx, arguments); };
      });
      c2Set.add(c2e); add(() => c2Set.delete(c2e));
      if (fsScale !== 1) applyGlScale(fsScale);
      const toLocal = e => {
        const r = c.getBoundingClientRect(), p = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
        return { x: (p.clientX - r.left) * w / r.width, y: (p.clientY - r.top) * h / r.height };
      };
      return { canvas: c, ctx, w, h, toLocal };
    },
    async gl(w = 960, h = 600, opts = {}) {
      const wait = document.createElement('div');
      wait.className = 'g-loading'; wait.innerHTML = '<i></i><span>Loading 3D…</span>';
      root.append(wait);
      let THREE;
      try { THREE = await loadThree(); }
      catch (e) {
        wait.remove();
        if (alive) api.overlay({ kicker: 'Connection needed', title: 'Couldn’t load 3D', text: 'The 3D engine is downloaded the first time you play a 3D game. Check your internet connection and try again.', button: 'Retry', onAction: restartCurrent });
        return null;
      }
      wait.remove();
      if (!alive) return null;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', ...opts });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
      renderer.setSize(w, h, false);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const c = renderer.domElement;
      c.className = 'g-canvas';
      c.style.width = `min(100%, ${w}px, calc((100dvh - var(--goff, 250px)) * ${(w / h).toFixed(4)}))`;
      c.style.aspectRatio = `${w} / ${h}`;
      root.append(c);
      add(() => { try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} c.remove(); });
      const glEntry = { renderer, THREE, canvas: c, w0: w, h0: h, cw: w, ch: h, own: false, cap: 0, fill: false };
      const spr = renderer.setPixelRatio.bind(renderer), rnd = renderer.render.bind(renderer);
      renderer.setPixelRatio = v => { if (!glEntry.own) glEntry.cap = v < (window.devicePixelRatio || 1) * 0.98 ? v : 0; return spr(v); };
      renderer.render = (sc, cam) => {
        if (cam && cam.isPerspectiveCamera && (glEntry.fill || cam.userData.gpA)) {
          const a = glEntry.cw / glEntry.ch, b = cam.userData.gpA || glEntry.w0 / glEntry.h0;
          if (Math.abs(cam.aspect - b) < 2e-3 && Math.abs(cam.aspect - a) > 1e-4) { cam.aspect = a; cam.updateProjectionMatrix(); }
          if (Math.abs(cam.aspect - a) < 1e-4) cam.userData.gpA = a;
        }
        return rnd(sc, cam);
      };
      glSet.add(glEntry); add(() => glSet.delete(glEntry));
      if (fsScale !== 1) applyGlScale(fsScale);
      const toLocal = e => {
        const r = c.getBoundingClientRect(), p = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
        return { x: (p.clientX - r.left) * w / r.width, y: (p.clientY - r.top) * h / r.height, nx: ((p.clientX - r.left) / r.width) * 2 - 1, ny: -((p.clientY - r.top) / r.height) * 2 + 1 };
      };
      return { THREE, renderer, canvas: c, w, h, toLocal };
    },
    swipe(fn, el = root) {
      let sx = 0, sy = 0, id = null;
      el.style.touchAction = 'none';
      api.on(el, 'pointerdown', e => { sx = e.clientX; sy = e.clientY; id = e.pointerId; });
      api.on(el, 'pointerup', e => {
        if (id !== e.pointerId) return;
        id = null;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
    },
    get keys() {
      if (!keys) {
        keys = new Set();
        api.on(window, 'keydown', e => keys.add(e.code));
        api.on(window, 'keyup', e => keys.delete(e.code));
        api.on(window, 'blur', () => keys.clear());
      }
      return keys;
    },
    load() { try { return JSON.parse(localStorage.getItem('gameplay:save:' + g.id)); } catch (e) { return null; } },
    save(data) { try { localStorage.setItem('gameplay:save:' + g.id, JSON.stringify(data)); } catch (e) {} }
  };
  add(() => { ov = null; });
  return { api, add, kill() { alive = false; while (fns.length) { try { fns.pop()(); } catch (e) { console.error(e); } } } };
}

const LEGAL = {
  terms: ['Terms of Service', `<p>These Terms of Service (the "Terms") constitute a legally binding agreement between you and the operator of gameplay (the "Operator", "we", "us" or "our") governing your access to and use of the gameplay website, its subdomains, mirrors and associated application programming interfaces, together with every game, feature, account facility, social function, communication channel and related service made available through it (collectively, the "Service"). Please read these Terms carefully and in their entirety before accessing or using the Service. They contain important provisions regarding intellectual property, acceptable conduct, the handling of infringement notices, disclaimers of warranties, limitations of liability, indemnification obligations, governing law and the resolution of disputes.</p>
<p>By accessing, browsing, playing, creating an account on, or otherwise using any part of the Service, you acknowledge that you have read, understood and agree to be bound by these Terms, by our Privacy Policy and by our Cookie Policy, each of which is incorporated into these Terms by reference. If you do not agree with any provision of these Terms, you are not authorised to use the Service and must immediately cease all access to it.</p>

<h2>1. Definitions and Interpretation</h2>
<p>In these Terms, unless the context requires otherwise, the following expressions have the meanings set out below:</p>
<ul>
<li><b>"Account"</b> means a registered user profile created on the Service, whether by means of an email address and password or by means of a supported third-party identity provider such as Google.</li>
<li><b>"Content"</b> means any software, code, games, levels, graphics, images, animations, audio, music, sound effects, text, typefaces, interfaces, layouts, designs, data, compilations and other materials of any kind.</li>
<li><b>"Operator Content"</b> means all Content made available through the Service by or on behalf of the Operator, including the source code, object code, architecture and visual design of the Service and of the games it hosts, excluding User Content and Third-Party Materials.</li>
<li><b>"User Content"</b> means any Content that you or another user submits, uploads, transmits, publishes or otherwise makes available through the Service, including usernames, display names, chat messages, direct messages, images, support requests, feedback and game ratings.</li>
<li><b>"Third-Party Materials"</b> means Content, names, trademarks, services, software libraries, fonts, data or other materials owned or controlled by persons other than the Operator.</li>
<li><b>"Rights Holder"</b> means any natural or legal person who owns, controls or is authorised to act on behalf of the owner of a copyright, trademark, design right, database right or other intellectual property right.</li>
<li><b>"Applicable Law"</b> means all laws, statutes, regulations, ordinances, codes and binding decisions of any competent authority that apply to you, to the Operator or to the Service, including, where relevant, the laws of the Principality of Monaco, the law of the European Union and the national law of the place where you reside.</li>
</ul>
<p>Headings are included for convenience only and do not affect interpretation. Words in the singular include the plural and vice versa. The words "including", "include" and "in particular" are illustrative and do not limit the generality of the preceding words. A reference to a statute or regulation includes any amendment, consolidation, re-enactment or replacement of it from time to time.</p>

<h2>2. Eligibility and Capacity</h2>
<p>The Service is intended for a general audience. You may use the Service only if you are legally capable of entering into a binding contract under Applicable Law or, where you lack such capacity, only with the knowledge, consent and supervision of a parent or legal guardian who agrees to these Terms on your behalf and accepts responsibility for your conduct.</p>
<p>If you are under the age of thirteen (13), or under the minimum age of digital consent applicable in your country of residence (which may be as high as sixteen (16) within the European Union), you must not create an Account, communicate with other users or provide any personal information through the Service without verifiable parental consent. Parents and guardians are responsible for supervising the online activities of minors in their care and for determining whether the Service, including its online multiplayer and messaging features, is appropriate for them.</p>
<p>Parents and guardians are encouraged to make use of the controls offered by operating systems, browsers and network providers to restrict access to online communication features, to discuss safe online behaviour with minors, and to contact the Operator if they believe that a child has provided personal information without appropriate consent. Upon verification of such a request, the Operator will take reasonable steps to delete the relevant Account and associated personal data.</p>
<p>You represent and warrant that you are not prohibited from receiving or using the Service under Applicable Law, that you are not located in, or ordinarily resident in, a territory subject to comprehensive economic sanctions, and that you are not designated on any governmental list of prohibited or restricted parties.</p>

<h2>3. Description of the Service</h2>
<p>gameplay is a free-to-access, browser-based entertainment platform offering a curated catalogue of casual games that run directly in a web browser without installation. Many of the games available on the Service are independently developed recreations, adaptations, parodies or homages inspired by the general gameplay concepts, genres and mechanics of well-known video games. The Service may also include original games, experimental prototypes, multiplayer modes, leaderboards, personal statistics, cloud saving, friends lists, direct messaging, presence indicators, game ratings, support ticketing and related community features.</p>
<p>The Operator may, in its sole discretion and without prior notice, add, modify, suspend, replace or permanently discontinue any game, feature, functionality or portion of the Service, temporarily or permanently, for any reason, including technical, legal, commercial or security considerations, or in response to a request from a Rights Holder. You acknowledge that the Service is provided as a hobby project on a non-commercial basis and that no specific game, feature or level of availability is guaranteed.</p>
<p>The Operator endeavours to make the Service usable by the widest possible audience, including people with disabilities, and offers settings such as reduced motion, theme selection, configurable controls and keyboard navigation. Because many games rely on fast reactions, precise timing or visual cues, certain games may not be fully accessible to every user. Suggestions for improving accessibility are welcome and may be submitted through the contact details below.</p>
<p>Access to certain versions or environments of the Service may be restricted by a site-wide access password. Such a password is confidential and is provided for the sole purpose of controlled access. You must not publish, distribute, sell or otherwise disclose any access password, and you must not attempt to bypass, disable or circumvent any access control, encryption or authentication mechanism protecting the Service.</p>

<h2>4. Accounts, Registration and Security</h2>
<p>Many features of the Service are available without registration. To use certain features, including cloud synchronisation of records and saved progress, friends, direct messaging and support requests, you must create an Account. You may register using an email address and password or by authenticating through Google. Upon registration you are required to select a unique username before you can continue to use the Service. You agree to provide accurate, current and complete information during registration and to keep such information up to date.</p>
<p>You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your Account, whether or not authorised by you. You must notify us without undue delay at the contact address set out below if you become aware of any unauthorised use of your Account or any other breach of security. The Operator will not be liable for any loss or damage arising from your failure to safeguard your credentials.</p>
<p>Your username and display name must not: (a) impersonate any person, brand, organisation, public figure or member of the Operator's staff; (b) infringe the trademark, copyright or other rights of any third party; (c) contain obscene, hateful, discriminatory, harassing, sexually explicit or violent language; (d) contain personal data such as a telephone number, home address or email address; or (e) be misleading as to your identity or affiliation. The Operator reserves the right to reclaim, modify, reset or refuse any username at any time, including where a Rights Holder asserts a legitimate claim to it.</p>
<p>Accounts are personal and non-transferable. You may not sell, rent, lend, share, trade or otherwise transfer your Account or any access to it to any other person. You may delete your Account at any time from the account settings within the Service. Deletion is permanent and results in the removal of your profile, records, saved progress, friends, messages and associated data from our active systems, subject to the retention periods described in our Privacy Policy.</p>

<h2>5. Licence to Use the Service</h2>
<p>Subject to your continuing compliance with these Terms, the Operator grants you a limited, personal, revocable, non-exclusive, non-transferable and non-sublicensable licence to access and use the Service, through a supported web browser, solely for your own private, non-commercial entertainment purposes. This licence does not include any right to: (a) resell or make commercial use of the Service or any Operator Content; (b) collect, compile or exploit any game listings, descriptions, images or data; (c) make any derivative use of the Service or its Content; (d) download, copy or store any Content other than through temporary caching performed automatically by your browser in the ordinary course of use; or (e) use any data mining, robots, crawlers, scrapers or similar data gathering and extraction tools.</p>
<p>All rights not expressly granted to you in these Terms are reserved by the Operator and its licensors. Any unauthorised use of the Service automatically terminates the licence granted in this Section without prejudice to any other remedy available to the Operator.</p>

<h2>6. Acceptable Use and Prohibited Conduct</h2>
<p>You agree to use the Service only for lawful purposes and in accordance with these Terms. Without limiting the foregoing, you shall not, and shall not attempt to, encourage or assist any other person to:</p>
<ul>
<li>copy, reproduce, republish, frame, mirror, scrape, archive, decompile, disassemble, reverse engineer, deobfuscate or otherwise attempt to derive the source code, encryption keys, algorithms or underlying structure of the Service or any game, except to the limited extent that such restriction is expressly prohibited by Applicable Law;</li>
<li>extract, redistribute, re-host or embed any game, asset or file from the Service on any other website, application, platform or medium;</li>
<li>circumvent, disable, tamper with or otherwise interfere with any security feature, access password, encryption, rate limit, content protection or technical measure of the Service;</li>
<li>introduce viruses, trojan horses, worms, logic bombs, ransomware or any other malicious or technologically harmful material;</li>
<li>launch or participate in any denial-of-service attack, flood, spam campaign or other activity that imposes an unreasonable or disproportionately large load on our infrastructure or that of our service providers;</li>
<li>use cheats, exploits, automation software, bots, macros, modified clients or any unauthorised third-party software to gain an unfair advantage, manipulate leaderboards, falsify records or alter the outcome of any game;</li>
<li>harass, threaten, stalk, bully, intimidate, defame, dox or abuse any other user, or solicit personal information from minors;</li>
<li>transmit any content that is unlawful, obscene, pornographic, hateful, discriminatory, extremist, violent, deceptive or that promotes illegal activity or self-harm;</li>
<li>infringe, misappropriate or violate the intellectual property rights, privacy rights, publicity rights or other rights of any person;</li>
<li>impersonate the Operator, any member of its staff or any other person, or misrepresent your affiliation with any person or entity;</li>
<li>use the Service for any commercial solicitation, advertising, pyramid scheme, chain letter, phishing or fraudulent purpose;</li>
<li>access or attempt to access any Account, system, database or network to which you have not been granted access, or probe, scan or test the vulnerability of the Service without our prior written authorisation; or</li>
<li>use the Service in any manner that could damage, disable, overburden, impair or bring into disrepute the Service or the Operator.</li>
</ul>
<p>If you believe that you have discovered a security vulnerability, you are encouraged to report it responsibly and privately to the contact address below. Good-faith security research that complies with this paragraph, avoids privacy violations and service degradation, and is not publicly disclosed before we have had a reasonable opportunity to remediate it, will not be pursued by the Operator.</p>

<h2>7. Online Play, Communications and Community Features</h2>
<p>Certain games permit real-time multiplayer sessions with other users by means of party codes and peer-to-peer connections. To establish such connections, your browser communicates with signalling and relay infrastructure operated by third parties, and the other participants in a session may be able to see your chosen name, your in-game actions and messages, and technical connection information such as your IP address. You acknowledge that peer-to-peer communication inherently involves the exchange of such information between participants.</p>
<p>The Service may also provide friends lists, presence indicators showing whether you are online and which game you are playing, direct messaging including the exchange of images and game invitations, and support ticketing. You are solely responsible for all communications you send and for any personal information you choose to disclose. Do not share passwords, financial details, home addresses or other sensitive personal information with other users. The Operator does not pre-screen communications but reserves the right, without any obligation, to monitor, review, retain, remove or disclose any communication where reasonably necessary to enforce these Terms, protect users, comply with Applicable Law or respond to lawful requests from public authorities.</p>
<p>You may block, remove or decline to interact with other users using the tools provided. Abuse may be reported through the support function within the Service or by email. The Operator will review reports in a timely, diligent, non-arbitrary and objective manner and may take the enforcement measures described in Section 11.</p>

<h2>8. User Content</h2>
<p>You retain any ownership rights you may have in your User Content. By submitting, posting or transmitting User Content through the Service, you grant the Operator a worldwide, non-exclusive, royalty-free, fully paid-up, transferable and sublicensable licence to host, store, cache, reproduce, transmit, display, format, adapt for technical purposes and distribute such User Content, solely to the extent necessary to operate, provide, secure, maintain and improve the Service and to enforce these Terms. This licence ends when your User Content is deleted from our systems, save for copies retained in backups for a limited period or where retention is required by law.</p>
<p>You represent and warrant that: (a) you own or have obtained all rights, licences, consents and permissions necessary to submit your User Content and to grant the licence above; (b) your User Content does not infringe, misappropriate or violate any intellectual property right, privacy right, publicity right or other right of any third party; and (c) your User Content complies with these Terms and with Applicable Law. You must not upload images or other material in which you do not hold the necessary rights, including screenshots of copyrighted works where such use is not permitted by Applicable Law.</p>
<p>The Operator does not endorse any User Content and expressly disclaims all liability in connection with User Content. Opinions expressed by users are solely those of their authors.</p>

<h2>9. Feedback and Game Ratings</h2>
<p>If you provide any suggestions, ideas, bug reports, enhancement requests, ratings or other feedback concerning the Service ("Feedback"), you grant the Operator a perpetual, irrevocable, worldwide, royalty-free licence to use, exploit and incorporate such Feedback into the Service or any other product or service without any obligation of attribution, confidentiality or compensation. Game ratings you submit, such as a thumbs up or thumbs down, may be aggregated and used to rank, recommend, improve or remove games.</p>

<h2>10. Records, Saved Progress and Virtual Items</h2>
<p>The Service may store best scores, play counts, time played, settings, saved game progress, constructed worlds and similar data locally in your browser and, where you are signed in, synchronise such data with your Account. Data stored only in your browser may be lost if you clear your browser data, use private browsing, change device or uninstall your browser. The Operator does not guarantee the preservation, integrity or recoverability of any record or saved progress and shall have no liability for its loss or corruption.</p>
<p>Any scores, statistics, levels, achievements, cosmetic items, experience points, passes or other in-game items or progress have no monetary value, cannot be redeemed for cash or any other consideration, cannot be transferred or traded, and do not constitute personal property. The Operator may reset, modify or remove any such items or progress, for example to correct errors, address cheating or rebalance a game.</p>

<h2>11. Moderation, Suspension and Enforcement</h2>
<p>The Operator may, at its discretion and having regard to the severity, frequency and impact of the conduct concerned, take any of the following measures where it reasonably believes that you have breached these Terms or Applicable Law, or that your conduct creates risk for other users, the Operator or third parties: issue a warning; remove or restrict the visibility of User Content; reset or change your username or display name; restrict access to specific features such as messaging or multiplayer; suspend your Account for a defined period; permanently terminate your Account; reset records; or refer the matter to the competent authorities.</p>
<p>Where reasonably practicable and lawful, the Operator will inform you of a restriction, the reasons for it and any available means of contesting it. You may request a review of any decision affecting your Account by contacting us at the address below, providing your username and an explanation. Records of administrative actions are maintained for accountability and audit purposes.</p>

<h2>12. Intellectual Property of the Operator</h2>
<p>The Service and all Operator Content, including without limitation its software, source code, compiled code, encryption and build tooling, game engines, physics and camera implementations, user interfaces, layouts, visual design, original artwork, original audio, text, selection, coordination and arrangement, are owned by or licensed to the Operator and are protected by copyright, database rights, design rights, trade dress, trademark and other intellectual property laws and international treaties, including the Berne Convention for the Protection of Literary and Artistic Works and the Agreement on Trade-Related Aspects of Intellectual Property Rights.</p>
<p>The name "gameplay", its logo and associated marks and trade dress are identifiers of the Operator. You may not use them in connection with any product or service that is not provided by the Operator, in any manner likely to cause confusion, or in any manner that disparages or discredits the Operator, without our prior written consent.</p>
<p>Certain components of the Service incorporate open-source software, libraries and fonts that are licensed under their respective open-source licences. Your use of such components is governed by the terms of those licences, which prevail over these Terms to the extent of any conflict in respect of those components.</p>

<h2>13. Third-Party Intellectual Property, Trademarks and Non-Affiliation</h2>
<p>gameplay is an independent, fan-operated project. It is not affiliated with, associated with, authorised by, endorsed by, sponsored by or in any way officially connected with any of the developers, publishers, licensors or owners of the original video games, board games, card games, characters or brands that may have inspired games available on the Service, nor with any of their subsidiaries or affiliates.</p>
<p>All product names, game titles, character names, logos, brands and trademarks referred to on the Service are the property of their respective owners and are used solely for identification, descriptive and comparative purposes, in order to indicate the genre or the game that inspired a particular recreation. Such use does not imply any endorsement, partnership or sponsorship. By way of illustration only, and without limitation: Minecraft is a trademark of Mojang Synergies AB and Microsoft Corporation; Tetris is a trademark of The Tetris Company, LLC; Rocket League is a trademark of Psyonix LLC and Epic Games, Inc.; Fall Guys is a trademark of Epic Games, Inc.; Subway Surfers is a trademark of SYBO ApS; Geometry Dash is a trademark of RobTop Games AB; Super Mario Bros. is a trademark of Nintendo Co., Ltd.; UNO is a trademark of Mattel, Inc.; Plants vs. Zombies is a trademark of Electronic Arts Inc.; Agar.io and 8 Ball Pool are trademarks of Miniclip SA; Paper.io, Hole.io and Helix Jump are trademarks of Voodoo SAS; and Crossy Road is a trademark of Hipster Whale Pty Ltd.</p>
<p>Games on the Service are independently implemented and do not, to the Operator's knowledge, incorporate the original source code of the works that inspired them. Where any Third-Party Materials are nonetheless present, they are used in good faith in the belief that such use is authorised, licensed, de minimis or permitted under Applicable Law, including applicable exceptions and limitations for quotation, parody, caricature, pastiche, criticism, review or fair use. The Operator respects the intellectual property rights of others and expects its users to do the same. Any Rights Holder who disagrees with the presence or presentation of any material on the Service is invited to use the procedure in Section 14, and the Operator undertakes to address legitimate concerns expeditiously, including by renaming, modifying or removing the material concerned.</p>

<h2>14. Copyright and Intellectual Property Complaints (Notice and Takedown)</h2>
<p>The Operator responds to clear notices of alleged infringement that comply with Applicable Law, including the notice-and-action mechanism of the European Union Digital Services Act (Regulation (EU) 2022/2065) and, to the extent applicable, the notice requirements of the United States Digital Millennium Copyright Act (17 U.S.C. § 512). Notices must be sent by email to <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a> with the subject line "Intellectual Property Notice" and should contain:</p>
<ul>
<li>the physical or electronic signature of the Rights Holder or of a person authorised to act on its behalf;</li>
<li>identification of the copyrighted work, trademark or other right claimed to have been infringed, or, if multiple works are covered by a single notice, a representative list of such works;</li>
<li>identification of the material claimed to be infringing, together with information reasonably sufficient to permit us to locate it, preferably the exact URL or game name;</li>
<li>a sufficiently substantiated explanation of the reasons why the material is considered to be infringing or otherwise unlawful;</li>
<li>your full name, postal address, telephone number and email address;</li>
<li>a statement that you have a good-faith belief that the use of the material in the manner complained of is not authorised by the Rights Holder, its agent or the law; and</li>
<li>a statement that the information in the notice is accurate and complete and, where the DMCA applies, a statement under penalty of perjury that you are the Rights Holder or authorised to act on its behalf.</li>
</ul>
<p>Upon receipt of a complete and valid notice, the Operator will acknowledge receipt without undue delay, review the notice in a timely, diligent and objective manner and, where appropriate, remove, disable access to, rename or modify the material concerned. Where material provided by a user is removed, the Operator will, where possible, inform the user who provided it and the reasons for the decision.</p>
<p><b>Counter-notification.</b> If you believe that User Content you submitted was removed or disabled as a result of a mistake or misidentification, you may submit a counter-notification containing your signature, identification of the material and its former location, a statement in good faith that it was removed by mistake or misidentification, your name, address and telephone number, and your consent to the jurisdiction of the competent courts. The Operator may restore the material where permitted by Applicable Law.</p>
<p><b>Repeat infringers.</b> The Operator will, in appropriate circumstances and at its discretion, suspend or terminate the Accounts of users who are found to have repeatedly infringed the intellectual property rights of others. The Operator may also suspend the processing of notices submitted by persons who frequently submit manifestly unfounded notices.</p>
<p><b>Misrepresentation.</b> Please be aware that any person who knowingly and materially misrepresents that material is infringing, or that material was removed by mistake, may be liable for damages, including costs and legal fees, under Applicable Law. If you are unsure whether material infringes your rights, we recommend that you seek legal advice before submitting a notice.</p>

<h2>15. Third-Party Services and Links</h2>
<p>The Service relies on and may link to third-party services, including hosting, database, authentication, content delivery, font delivery, geolocation and real-time communication providers, and identity providers such as Google. The Operator does not control and is not responsible for the availability, content, accuracy, privacy practices or terms of any third-party service. Your use of any third-party service is at your own risk and subject to the terms and policies of that third party. The inclusion of any link does not imply endorsement.</p>

<h2>16. Advertising, Sponsorship and Commercial Changes</h2>
<p>The Service is currently provided free of charge and without paid advertising. The Operator reserves the right to introduce advertising, sponsorships, optional purchases, donations or other monetisation in the future. Any such introduction will be accompanied by appropriate updates to these Terms, the Privacy Policy and the Cookie Policy, and any processing of personal data for advertising purposes will take place only on a lawful basis, including your prior consent where required. Where paid features are introduced, any statutory rights you have as a consumer, including any right of withdrawal, will be respected.</p>

<h2>17. Availability, Maintenance and Modification</h2>
<p>The Operator does not guarantee that the Service or any game will be available at all times, without interruption, at any particular speed or on any particular device or browser. The Service may be temporarily unavailable due to maintenance, updates, failures of third-party infrastructure, security incidents, maintenance modes or events beyond our reasonable control. The Operator may impose limits on certain features, restrict access to parts of the Service, or require minimum browser capabilities without notice or liability.</p>
<p>From time to time the Operator may make available experimental, preview, beta or test features, games or environments ("Beta Features"). Beta Features are provided for evaluation purposes only, may be incomplete, unstable or insecure, may be changed or withdrawn at any time, and may result in the loss of data or progress. Your use of Beta Features is entirely at your own risk, and the disclaimers and limitations in Sections 18 and 19 apply to them with particular force.</p>
<p>The Operator may use automated systems to protect the integrity of the Service, for example rate limits that restrict the number of requests, messages or votes that may be submitted within a given period, validation rules that reject malformed or abusive data, and integrity checks that flag implausible scores. Such systems do not produce legal effects concerning you and may be reviewed by a human administrator on request.</p>

<h2>18. Disclaimer of Warranties</h2>
<p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE AND ALL CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE. THE OPERATOR EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY AND NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. WITHOUT LIMITATION, THE OPERATOR DOES NOT WARRANT THAT THE SERVICE WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT ANY DATA WILL BE PRESERVED.</p>
<p>Some games involve rapid flashing lights, patterns or motion. A small proportion of people may experience seizures or other symptoms when exposed to such stimuli. If you or anyone in your household has a history of epilepsy or photosensitivity, consult a medical professional before playing, and stop playing immediately if you experience dizziness, altered vision, involuntary movements, disorientation or discomfort. Take regular breaks and maintain a healthy posture.</p>

<h2>19. Limitation of Liability</h2>
<p>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE OPERATOR, ITS CONTRIBUTORS, ADMINISTRATORS, LICENSORS OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, GOODWILL, DATA, RECORDS, SAVED PROGRESS, OPPORTUNITY OR ANTICIPATED SAVINGS, WHETHER ARISING IN CONTRACT, TORT (INCLUDING NEGLIGENCE), BREACH OF STATUTORY DUTY OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. BECAUSE THE SERVICE IS PROVIDED FREE OF CHARGE, THE AGGREGATE LIABILITY OF THE OPERATOR ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF FIFTY EUROS (EUR 50) OR THE AMOUNT YOU PAID TO THE OPERATOR, IF ANY, IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
<p>Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, for gross negligence or wilful misconduct, or for any other liability that cannot be excluded or limited under Applicable Law. If you are a consumer, you benefit from any mandatory provisions of the law of your country of residence, and nothing in these Terms affects your statutory rights as a consumer.</p>

<h2>20. Indemnification</h2>
<p>To the extent permitted by Applicable Law, you agree to defend, indemnify and hold harmless the Operator and its contributors, administrators, licensors and service providers from and against any and all claims, demands, actions, liabilities, losses, damages, judgments, settlements, penalties, costs and expenses, including reasonable legal fees, arising out of or relating to: (a) your User Content; (b) your use or misuse of the Service; (c) your breach of these Terms; (d) your violation of any Applicable Law; or (e) your infringement of any intellectual property or other right of any third party. The Operator reserves the right to assume the exclusive defence and control of any matter subject to indemnification, in which case you agree to cooperate with our defence.</p>

<h2>21. Term and Termination</h2>
<p>These Terms remain in full force and effect while you use the Service. You may terminate them at any time by ceasing to use the Service and, if you have an Account, by deleting it. The Operator may suspend or terminate your access to all or part of the Service, with or without notice, if you breach these Terms, if required by law or by a Rights Holder's legitimate claim, or if the Service is discontinued. Upon termination, the licence granted to you ends immediately. Sections 8 (to the extent of retained copies), 9, 10, 12, 13, 14, 18, 19, 20, 22, 23 and any other provisions which by their nature are intended to survive shall survive termination.</p>

<h2>22. Governing Law and Dispute Resolution</h2>
<p>These Terms and any dispute or claim, including non-contractual disputes or claims, arising out of or in connection with them or their subject matter or formation, shall be governed by and construed in accordance with the laws of the Principality of Monaco, without regard to its conflict-of-laws principles. Subject to the following paragraph, the courts of the Principality of Monaco shall have exclusive jurisdiction to settle any such dispute or claim.</p>
<p>If you are a consumer habitually resident in the European Union, the European Economic Area, the United Kingdom, Switzerland or another jurisdiction whose mandatory law so provides, you will benefit from any mandatory protections of the law of your country of residence, and you may bring proceedings in the courts of your country of residence. Before initiating any formal proceedings, you agree to first contact the Operator and attempt in good faith to resolve the dispute informally for a period of at least thirty (30) days. Nothing in this Section prevents either party from seeking urgent interim or injunctive relief from any competent court.</p>

<h2>23. Changes to These Terms</h2>
<p>The Operator may revise these Terms from time to time to reflect changes to the Service, to our business, to Applicable Law or to industry practice. The "Last updated" date at the top of this page indicates when the Terms were last modified. Where changes are material, we will take reasonable steps to bring them to your attention, for example by displaying a notice on the Service or contacting you by email if you have an Account. Your continued use of the Service after revised Terms take effect constitutes your acceptance of them. If you do not agree to the revised Terms, you must stop using the Service and may delete your Account.</p>

<h2>24. General Provisions</h2>
<p><b>Entire agreement.</b> These Terms, together with the Privacy Policy, the Cookie Policy and any supplemental terms presented to you within the Service, constitute the entire agreement between you and the Operator concerning the Service and supersede all prior agreements and understandings.</p>
<p><b>Severability.</b> If any provision of these Terms is held to be invalid, illegal or unenforceable by a court of competent jurisdiction, that provision shall be enforced to the maximum extent permissible, and the remaining provisions shall continue in full force and effect.</p>
<p><b>No waiver.</b> No failure or delay by the Operator in exercising any right or remedy shall operate as a waiver of it, nor shall any single or partial exercise preclude any further exercise of that or any other right or remedy.</p>
<p><b>Assignment.</b> You may not assign, delegate or transfer any of your rights or obligations under these Terms without our prior written consent. The Operator may assign or transfer these Terms, in whole or in part, including in connection with a transfer of the Service, provided that your rights as a consumer are not prejudiced.</p>
<p><b>Force majeure.</b> The Operator shall not be liable for any failure or delay in performance caused by events beyond its reasonable control, including natural disasters, pandemics, war, terrorism, civil unrest, labour disputes, governmental action, failures of public or private telecommunications networks, power outages, cyber-attacks or failures of third-party service providers.</p>
<p><b>No third-party beneficiaries.</b> Except as expressly provided, these Terms do not confer any rights or remedies on any person other than you and the Operator.</p>
<p><b>Language.</b> These Terms are drafted in the English language. Any translation is provided for convenience only. In the event of any inconsistency between the English version and a translation, the English version shall prevail to the extent permitted by Applicable Law.</p>
<p><b>Notices.</b> The Operator may provide notices to you through the Service, by email to the address associated with your Account, or by posting on the Service. You may provide notices to the Operator by email to the contact address below.</p>
<p><b>Relationship.</b> Nothing in these Terms creates any partnership, joint venture, employment, agency or fiduciary relationship between you and the Operator.</p>
<p><b>Electronic communications.</b> By using the Service, you consent to receiving communications from the Operator electronically, including by email and by notices displayed within the Service, and you agree that all agreements, notices, disclosures and other communications provided electronically satisfy any legal requirement that such communications be in writing, to the extent permitted by Applicable Law.</p>
<p><b>Export control and sanctions.</b> You shall comply with all applicable export control, import and economic sanctions laws and regulations in connection with your use of the Service and shall not use the Service in violation of any such laws or for the benefit of any sanctioned person or territory.</p>
<p><b>Limitation period.</b> To the extent permitted by Applicable Law, any claim arising out of or relating to these Terms or the Service must be commenced within one (1) year after the cause of action accrues; otherwise, such claim is permanently barred. This paragraph does not apply to consumers where mandatory law provides for a longer limitation period.</p>
<p><b>Interpretation against the drafter.</b> These Terms shall be interpreted fairly in accordance with their plain meaning, and no rule of construction requiring ambiguities to be resolved against the drafting party shall apply, save where mandatory consumer protection law provides otherwise.</p>

<h2>25. Contact</h2>
<p>For any question concerning these Terms, for intellectual property notices, counter-notifications, abuse reports, security disclosures, appeals against moderation decisions or any other enquiry, please contact the Operator at <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>. This address also serves as the single point of contact for users and for authorities for the purposes of Articles 11 and 12 of Regulation (EU) 2022/2065. Communications may be sent in English or French.</p>`],
  privacy: ['Privacy Policy', `<p>This Privacy Policy describes how the operator of gameplay (the "Operator", "we", "us" or "our") collects, uses, discloses, retains and otherwise processes personal data in connection with the gameplay website, its games, account facilities, social features and related services (collectively, the "Service"), and explains the rights and choices available to you. We are committed to processing personal data lawfully, fairly and transparently, in accordance with the principles of purpose limitation, data minimisation, accuracy, storage limitation, integrity, confidentiality and accountability.</p>
<p>This Policy is designed to satisfy the transparency requirements of Articles 12 to 14 of Regulation (EU) 2016/679 (the "General Data Protection Regulation" or "GDPR"), of the Monegasque Law No. 1.565 of 3 December 2024 relating to the protection of personal data, of the United Kingdom GDPR and Data Protection Act 2018, of the Swiss Federal Act on Data Protection, and, to the extent applicable, of the privacy laws of the states of the United States of America, including the California Consumer Privacy Act as amended by the California Privacy Rights Act. It should be read together with our Terms of Service and our Cookie Policy.</p>

<h2>1. Summary of Key Points</h2>
<ul>
<li>You can play without creating an account. In that case, your records, settings and saved progress are stored in your own browser.</li>
<li>If you create an account, we store your account details, profile, records, saved progress and social data in our database, hosted in the European Union.</li>
<li>Usage analytics, including device characteristics, approximate location and gameplay telemetry, are collected only if you consent through the cookie banner. You may consent permanently or for the current session only, and you may withdraw consent at any time.</li>
<li>We do not sell your personal data, we do not share it for cross-context behavioural advertising, and the Service currently displays no advertising.</li>
<li>We do not store your IP address in our analytics, and we do not use your data for automated decision-making producing legal or similarly significant effects.</li>
<li>You have rights of access, rectification, erasure, restriction, portability and objection, as well as the right to withdraw consent and to lodge a complaint with a supervisory authority.</li>
</ul>

<h2>2. Controller and Contact Details</h2>
<p>The controller responsible for the processing of personal data described in this Policy is the operator of gameplay, an independent, non-commercial project established in the Principality of Monaco. You may contact the controller regarding any matter relating to this Policy or to the processing of your personal data by email at <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>. Given the scale and nature of the processing, the Operator has not appointed a data protection officer; requests are handled directly by the controller. Where the Operator is required to designate a representative in the European Union or the United Kingdom, the identity of such representative will be published in this section.</p>

<h2>3. Scope of this Policy</h2>
<p>This Policy applies to personal data processed when you visit or use the Service through any device or browser, create or use an Account, participate in online multiplayer sessions, use social and messaging features, submit support requests, rate games, or otherwise interact with us. It does not apply to the processing of personal data by third-party services that you access through links or that operate independently of us, such as Google when you manage your Google account, which are governed by their own privacy policies.</p>

<h2>4. Definitions</h2>
<p>"Personal data" means any information relating to an identified or identifiable natural person. "Processing" means any operation performed on personal data, such as collection, recording, organisation, storage, adaptation, retrieval, consultation, use, disclosure, combination, restriction, erasure or destruction. "Processor" means a person or entity that processes personal data on behalf of the controller. "Pseudonymous identifier" means an identifier, such as a randomly generated session identifier, that does not by itself reveal your identity. Other capitalised terms have the meanings given in the Terms of Service.</p>

<h2>5. Categories of Personal Data We Process</h2>
<p><b>5.1 Data stored on your device without an account.</b> When you use the Service without an Account, the following information is stored locally in your browser and is not transmitted to our servers: best scores, play counts, time played per game and per day, recently played and favourite games, preferences such as theme, language, sound, thumbnails, reduced motion and custom controls, the username and display name you choose locally, saved game progress, constructed worlds in sandbox games, the keyboard keys used in each game for control hints, your cookie choice, your game ratings, and, on access-controlled versions of the Service, the cryptographic unlock state and the number of failed password attempts. Details of each storage item are set out in the Cookie Policy.</p>
<p><b>5.2 Account data.</b> If you register, we process your email address; your username and display name; your authentication method; if you sign in with Google, the name, email address and profile picture link provided by Google; the date of creation and of last sign-in of your Account; your role and status (for example whether the Account is locked and the reason and duration of any restriction); and your password, which is processed exclusively by our authentication provider and stored only as a salted cryptographic hash that cannot be read by anyone, including the Operator.</p>
<p><b>5.3 Gameplay and synchronisation data.</b> For signed-in users, we process the best score, number of plays, time played and date of last play for each game, saved game progress, favourite games and technical batch identifiers used to synchronise your browser with your Account reliably.</p>
<p><b>5.4 Social and communication data.</b> For signed-in users who use social features, we process friend requests and friendships; presence information indicating whether you are online, which game you are playing and whether you have chosen to hide your status from friends; direct messages exchanged with other users, including text, images you upload, game invitations and read receipts; and the time at which these events occur. Direct message images are stored in private storage and are delivered to the intended recipient only through time-limited signed links.</p>
<p><b>5.5 Online multiplayer data.</b> When you take part in a multiplayer session, the name you enter, your in-game actions and any messages exchanged within the session are transmitted directly to the other participants. Connection metadata, including IP addresses, is processed by the signalling and relay infrastructure necessary to establish peer-to-peer connections. The Operator does not store the content of multiplayer chat.</p>
<p><b>5.6 Support and moderation data.</b> If you submit a support ticket, we process its subject, the messages exchanged, their timestamps and status. If an administrator takes an action concerning your Account, such as changing your username, adjusting your role, locking or unlocking your Account or resetting a password, a record of the action, its author, its target and relevant details is kept in an administrative audit log.</p>
<p><b>5.7 Game ratings.</b> If you rate a game with a thumbs up or thumbs down, we store the game, the rating, the time and, if you are signed in, your Account identifier. Ratings submitted without an Account are stored without any identifier.</p>
<p><b>5.8 Analytics data (only with your consent).</b> If, and only if, you consent to analytics, we collect usage events linked to a random session identifier and a random device identifier and, if you are signed in, to your Account. These events may include:</p>
<ul>
<li><b>Navigation and interaction:</b> pages and views visited and time spent on each, the page from which you left the Service, how far you scrolled the home page, which game cards were displayed on screen and which were clicked together with their position, searches and filters used, settings changed, repeated rapid clicks in one location ("rage clicks") and clicks that produced no visible effect ("dead clicks"), identified by the type of interface element concerned;</li>
<li><b>Gameplay telemetry:</b> games opened, launched and played, playing time, loading time, final scores, level, wave or stage reached at the end of a round, number of rounds, whether a game was left within the first thirty seconds, frame rate statistics, the type of input used (keyboard, mouse, touch or controller), controls you rebind, and, for the Rocket League-inspired game, match results and statistics such as goals, assists, saves, shots, demolitions, boost consumed, match length and opponent difficulty;</li>
<li><b>Device and software characteristics:</b> device type, operating system and version, browser and version, device model where reported by the browser, processor architecture and number of cores, approximate device memory, graphics processor model, support for graphics technologies, screen size, viewport, pixel density, refresh rate, keyboard layout, controller model, preferred languages, whether the Service runs as an installed application, and whether an advertising blocker is active;</li>
<li><b>Network and approximate location:</b> time zone and local time, connection type, estimated bandwidth and latency, data-saver preference, country, region and city, internet service provider and autonomous system number, and an indicator of whether your network appears to belong to a data centre or virtual private network. Approximate location and provider are derived from your IP address by the GeoJS service at the request of your browser; your IP address is not stored by us in connection with analytics. A country code may additionally be derived by our hosting infrastructure from request headers;</li>
<li><b>Performance and reliability:</b> page speed metrics known as Core Web Vitals (largest contentful paint, interaction to next paint, cumulative layout shift, first contentful paint and time to first byte), error messages and their location in our code, and the time at which updates were installed;</li>
<li><b>Advertising measurement:</b> should advertising be introduced in the future, impressions, clicks and revenue attributable to advertising placements, which will be collected only on a lawful basis.</li>
</ul>
<p><b>5.9 Technical and security data.</b> Our hosting, database and content delivery providers necessarily process your IP address, browser user agent, request timestamps and similar technical information in order to deliver the Service, protect it against abuse and maintain server logs. Rate-limiting mechanisms process a one-way hash of your IP address for a short period to prevent abuse. Administrators may record periodic counts of the number of users online.</p>
<p><b>5.10 Special categories of data.</b> We do not intentionally collect special categories of personal data, such as data revealing racial or ethnic origin, political opinions, religious beliefs, health or sexual orientation, nor data relating to criminal convictions. Please do not include such information in usernames, messages or support requests.</p>

<h2>6. Sources of Personal Data</h2>
<p>We obtain personal data directly from you when you register, configure your profile, communicate or submit requests; automatically from your device and browser when you use the Service and, where applicable, have consented to analytics; from Google when you choose to sign in with Google; from GeoJS, which returns approximate location and network information derived from your IP address to your browser; and from other users, for example when they send you a friend request or a message.</p>

<h2>7. Account Lifecycle in Detail</h2>
<p><b>Registration.</b> When you register with an email address, our authentication provider sends a confirmation message to verify that you control the address. Until the address is confirmed, certain features may be unavailable. When you register through Google, Google authenticates you and provides us with your email address, name and profile picture link in accordance with the permissions you grant on Google's consent screen; we never receive your Google password. In both cases you must select a unique username before using the Service, so that other users can identify you without seeing your email address.</p>
<p><b>Sign-in and sessions.</b> Signing in creates a session token and a refresh token stored in your browser, which allow you to remain signed in across visits. These tokens are transmitted only to our authentication provider over encrypted connections. Signing out removes them from your browser. Administrators may revoke active sessions where necessary for security, for example after a password reset.</p>
<p><b>Password reset and email change.</b> If you request a password reset or change your email address, a time-limited link is sent to the relevant address. We process the request metadata, such as the time and type of request, in order to complete the operation and to protect against abuse. Requests may be rate-limited.</p>
<p><b>Account deletion.</b> When you delete your Account, your profile, records, saved progress, favourites, friendships, friend requests, direct messages and their images, support tickets and synchronisation data are erased from our active database, your analytics events are dissociated from your Account so that they can no longer be attributed to you, and your game ratings are dissociated from your Account. Administrators may also process requests for deletion submitted by email. Deletion cannot be undone.</p>

<h2>8. How Analytics Work</h2>
<p>When analytics are enabled, events are first recorded in your browser and then transmitted to our database in small batches, typically every thirty seconds and when you leave the page, using encrypted connections. Each event carries a random session identifier, which is regenerated after thirty minutes of inactivity, and a random device identifier, which allows us to recognise returning visitors without knowing who they are. Neither identifier is derived from your name, email address, hardware serial numbers or any fingerprinting technique. If you chose consent for the current session only, both identifiers and any queued events are held in session storage and disappear when the tab is closed.</p>
<p>Events are validated on arrival: their names and fields must match expected formats and sizes, and our database applies per-session and per-network rate limits to prevent flooding. Free-text values are truncated. Events are then aggregated into statistics, such as the number of active players per day, the share of players using a given browser version, the median loading time of a game or the proportion of visitors who return after seven days, which are displayed to administrators in a dashboard. Individual-level analytics are consulted only where necessary, for example to investigate a reported bug, and lists of individual players appear in the dashboard only for signed-in users who have consented to analytics, for purposes such as identifying regular players who may have stopped visiting.</p>
<p>We use analytics to determine which games are enjoyed and should be improved, featured or removed; to detect games that load slowly, run at low frame rates on particular devices or crash; to choose default controls and keyboard layouts; to understand at what point players abandon a game; to arrange the home page so that games are easier to find; to plan server capacity and the hours at which maintenance is least disruptive; to prioritise translations; and to filter automated or abusive traffic from our statistics.</p>

<h2>9. Approximate Location Lookup</h2>
<p>If you consent to analytics, once per browser session your browser sends a request to the GeoJS service, which observes the IP address from which the request originates and returns an estimate of your country, region, city, time zone, internet service provider and autonomous system number. Your browser removes the IP address and coordinates from the response and transmits only the remaining fields to our database. The estimate is cached in your browser's session storage for the remainder of the session and is erased when the tab is closed. Location derived from IP addresses is approximate, may be inaccurate, and is never used to determine your precise location or street address. GeoJS processes your IP address as an independent service provider in accordance with its own terms.</p>
<p>To flag traffic that may originate from data centres or virtual private networks, your browser compares the name of your internet service provider with a list of hosting and VPN providers and compares the time zone reported by your device with the time zone associated with your IP address. The resulting indicator is used solely to improve the accuracy of our statistics and does not restrict your access to the Service.</p>

<h2>10. Online Multiplayer and Peer-to-Peer Connections</h2>
<p>Peer-to-peer technologies such as WebRTC allow browsers to exchange game data directly with low latency. To establish a connection, browsers exchange network candidates, which include IP addresses, through a signalling service and, where a direct connection is not possible, relay traffic through TURN servers. Consequently, other participants in a multiplayer session and the providers of these services may be able to observe your IP address. If you prefer not to expose your IP address to other players, you should not participate in online multiplayer sessions or should use the network protections available to you. Party codes are short-lived identifiers and should be shared only with people you wish to play with.</p>

<h2>11. Purposes and Legal Bases of Processing</h2>
<table><thead><tr><th>Purpose</th><th>Data concerned</th><th>Legal basis</th></tr></thead><tbody>
<tr><td>Providing the Service and its games, storing local records and settings</td><td>Data stored on your device, technical data</td><td>Performance of a contract (Art. 6(1)(b) GDPR) and strictly necessary storage exempt from consent</td></tr>
<tr><td>Creating and administering your Account, authentication and account security</td><td>Account data, technical and security data</td><td>Performance of a contract</td></tr>
<tr><td>Synchronising records and saved progress across devices</td><td>Gameplay and synchronisation data</td><td>Performance of a contract</td></tr>
<tr><td>Providing friends, presence, direct messaging and multiplayer features</td><td>Social, communication and multiplayer data</td><td>Performance of a contract</td></tr>
<tr><td>Responding to support requests and exercising data subject rights</td><td>Support data, account data</td><td>Performance of a contract and compliance with a legal obligation (Art. 6(1)(c))</td></tr>
<tr><td>Moderation, enforcement of the Terms, prevention of fraud, cheating, abuse and security incidents</td><td>Account, social, moderation, technical and security data</td><td>Legitimate interests (Art. 6(1)(f)) in maintaining a safe and fair Service</td></tr>
<tr><td>Recording game ratings to rank and improve games</td><td>Game ratings</td><td>Legitimate interests and performance of a contract</td></tr>
<tr><td>Analytics, performance measurement, debugging, product improvement and capacity planning</td><td>Analytics data</td><td>Consent (Art. 6(1)(a) GDPR and Art. 5(3) of Directive 2002/58/EC)</td></tr>
<tr><td>Advertising measurement, if introduced</td><td>Advertising measurement data</td><td>Consent</td></tr>
<tr><td>Compliance with legal obligations, responding to lawful requests and establishing, exercising or defending legal claims, including intellectual property claims</td><td>Any relevant data</td><td>Legal obligation and legitimate interests</td></tr>
</tbody></table>
<p>Where we rely on legitimate interests, we have carried out a balancing test and concluded that our interests are not overridden by your interests, rights and freedoms, taking into account your reasonable expectations, the limited nature of the data and the safeguards in place. You may request details of this assessment and you have the right to object as described in the section entitled "Your Rights".</p>

<h2>12. Consent and How to Withdraw It</h2>
<p>When you first visit the Service, a banner invites you to accept our Terms and Privacy Policy and to choose among three options: <b>Accept all</b>, which enables analytics until you change your choice; <b>Only for this session</b>, which enables analytics only until you close the browser tab, after which nothing is retained for your next visit and you are asked again; and <b>Only essentials</b>, which limits processing to what is strictly necessary for the Service to function. Analytics events generated before you make a choice are held temporarily in memory and are transmitted only if you subsequently consent; otherwise they are discarded.</p>
<p>You may withdraw or modify your consent at any time through the Cookie settings available on every page of the Service. Withdrawal does not affect the lawfulness of processing carried out before withdrawal. When you select Only essentials, locally queued analytics events and the random device identifier are deleted from your browser.</p>

<h2>13. Recipients and Processors</h2>
<p>We do not sell, rent or trade personal data. We disclose personal data only to the following categories of recipients, each of which is bound by appropriate contractual, technical and organisational safeguards:</p>
<ul>
<li><b>Supabase, Inc.</b>, which provides our database, authentication, file storage, real-time messaging and transactional email services, with data hosted in the European Union;</li>
<li><b>Google LLC and Google Ireland Limited</b>, which provide website hosting through Firebase Hosting, font delivery through Google Fonts and, if you choose it, sign-in with Google;</li>
<li><b>GeoJS</b>, which, at the request of your browser and only if you consent to analytics, returns approximate location and network information derived from your IP address;</li>
<li><b>Content delivery networks</b>, including cdnjs (operated by Cloudflare, Inc.) and jsDelivr, from which your browser downloads software libraries such as the three-dimensional rendering engine and networking library;</li>
<li><b>PeerJS and providers of STUN and TURN servers</b>, which facilitate the establishment of peer-to-peer connections for online multiplayer games;</li>
<li><b>Other users</b>, who can see your username, display name, presence and the content you share with them, but never your email address;</li>
<li><b>Administrators of the Service</b>, who have access to account, moderation, support and aggregated analytics data strictly to the extent necessary to operate and protect the Service; and</li>
<li><b>Public authorities, courts, Rights Holders and professional advisers</b>, where disclosure is required by law, necessary to establish, exercise or defend legal claims, or necessary to protect the rights, property or safety of the Operator, users or others.</li>
</ul>
<p>In the event of a reorganisation, transfer or discontinuation of the Service, personal data may be transferred to a successor that agrees to honour this Policy, and you will be informed in advance where required by law.</p>

<h2>14. International Transfers</h2>
<p>Our primary database is hosted in the European Union. Certain service providers, including Google, Cloudflare, GeoJS and connection infrastructure providers, may process personal data in the United States or other countries outside the European Economic Area and the Principality of Monaco. Where such transfers occur, they are based on an adequacy decision of the European Commission, including the EU-U.S. Data Privacy Framework for certified recipients, or on appropriate safeguards such as the Standard Contractual Clauses adopted by the European Commission, supplemented where necessary by additional technical measures such as encryption in transit. You may obtain further information on these safeguards by contacting us.</p>

<h2>15. Retention Periods</h2>
<table><thead><tr><th>Data</th><th>Retention</th></tr></thead><tbody>
<tr><td>Data stored in your browser</td><td>Until you clear it, delete your Account data in Settings, or clear your browser storage; session storage is erased when you close the tab</td></tr>
<tr><td>Account, profile, records, saved progress, favourites and friends</td><td>For as long as your Account exists; deleted upon deletion of your Account</td></tr>
<tr><td>Direct messages and images</td><td>For as long as both participating Accounts exist; deleted upon deletion of the Account concerned</td></tr>
<tr><td>Support tickets</td><td>For as long as your Account exists, then deleted</td></tr>
<tr><td>Synchronisation batch identifiers</td><td>Sixty (60) days</td></tr>
<tr><td>Analytics events</td><td>Two (2) years from collection, after which they are automatically deleted; upon Account deletion, the link between events and your Account is removed</td></tr>
<tr><td>Online-user counts</td><td>Two (2) years</td></tr>
<tr><td>Rate-limiting counters based on hashed IP addresses</td><td>Approximately three (3) hours</td></tr>
<tr><td>Game ratings</td><td>Retained in aggregate; ratings linked to an Account are dissociated from it upon Account deletion</td></tr>
<tr><td>Administrative audit log</td><td>For as long as necessary for accountability, security and the defence of legal claims</td></tr>
<tr><td>Server logs held by hosting providers</td><td>In accordance with the retention policies of those providers, typically a few days to a few months</td></tr>
</tbody></table>
<p>Backups may persist for a limited period after deletion from active systems and are overwritten in the ordinary course. Where we are required to retain data for longer to comply with a legal obligation or to establish, exercise or defend legal claims, we will retain it only for that purpose and duration.</p>

<h2>16. Your Rights</h2>
<p>Subject to the conditions and exceptions provided by Applicable Law, you have the following rights in relation to your personal data:</p>
<ul>
<li><b>Right of access</b> to obtain confirmation as to whether we process your personal data and a copy of it, together with information about the processing;</li>
<li><b>Right to rectification</b> of inaccurate or incomplete data;</li>
<li><b>Right to erasure</b> ("right to be forgotten") where, among other grounds, the data is no longer necessary, you withdraw consent or you object to processing;</li>
<li><b>Right to restriction</b> of processing while a dispute about accuracy or lawfulness is resolved;</li>
<li><b>Right to data portability</b> to receive data you provided in a structured, commonly used and machine-readable format and to transmit it to another controller;</li>
<li><b>Right to object</b> at any time, on grounds relating to your particular situation, to processing based on legitimate interests;</li>
<li><b>Right to withdraw consent</b> at any time, without affecting prior lawful processing;</li>
<li><b>Right not to be subject to a decision based solely on automated processing</b> that produces legal or similarly significant effects; we do not carry out such processing; and</li>
<li><b>Right to define directives</b> regarding the retention, erasure and communication of your personal data after your death, where provided by Applicable Law.</li>
</ul>
<p>Several of these rights can be exercised directly within the Service: <b>Download my data</b> in the privacy settings provides a machine-readable export of the data held in your browser and, if you are signed in, the data associated with your Account, including your analytics events; <b>Delete my account</b> in the account settings permanently erases your Account; and Cookie settings allows you to withdraw consent. For any other request, contact us by email. We may need to verify your identity before responding. We will respond without undue delay and in any event within one (1) month of receipt, which may be extended by two (2) further months where necessary taking into account the complexity and number of requests, in which case we will inform you. Requests are free of charge unless manifestly unfounded or excessive.</p>

<h2>17. Right to Lodge a Complaint</h2>
<p>If you consider that the processing of your personal data infringes Applicable Law, you have the right to lodge a complaint with a supervisory authority, in particular in the State in which you habitually reside, work or where the alleged infringement took place. In the Principality of Monaco, the competent authority is the Autorité de protection des données personnelles (APDP). In France, it is the Commission nationale de l'informatique et des libertés (CNIL). A list of the supervisory authorities of the European Economic Area is published by the European Data Protection Board. We would, however, appreciate the opportunity to address your concerns before you approach an authority.</p>

<h2>18. Information for Residents of the United States</h2>
<p>In the preceding twelve (12) months we have collected the following categories of personal information within the meaning of the California Consumer Privacy Act: identifiers (such as email address, username and pseudonymous identifiers); internet or other electronic network activity information (such as interactions with the Service); approximate geolocation (only with consent); and inferences limited to aggregated statistics. These categories are collected from the sources and for the business purposes described above and are disclosed to the service providers listed in the section entitled "Recipients and Processors". We do not sell personal information, we do not share personal information for cross-context behavioural advertising, and we do not use or disclose sensitive personal information for purposes requiring a right to limit. California residents and residents of other states with comprehensive privacy laws have the right to know, access, correct and delete their personal information, the right to opt out of sale or sharing, and the right not to be discriminated against for exercising their rights. Requests may be submitted by email and may be made through an authorised agent with appropriate proof of authority.</p>

<h2>19. Global Privacy Control and Do Not Track</h2>
<p>Because we do not sell or share personal information for advertising and analytics are collected only with your affirmative consent, a Global Privacy Control signal or Do Not Track header does not change our current practices. If we introduce advertising in the future, we will honour Global Privacy Control signals as a valid opt-out request where required by law.</p>

<h2>20. Children</h2>
<p>The Service is designed for a general audience and is not directed primarily at children. We do not knowingly collect personal data through Accounts from children under the age of thirteen (13), or under the age of digital consent applicable in their country of residence, without verifiable parental consent. Analytics are collected only with consent given through the cookie banner, and we encourage parents and guardians to make this choice on behalf of young children. If you believe that we have collected personal data from a child without appropriate consent, please contact us and we will promptly delete it.</p>

<h2>21. Security</h2>
<p>We implement appropriate technical and organisational measures designed to protect personal data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure or access, having regard to the state of the art, the costs of implementation and the nature, scope, context and purposes of the processing. These measures include encryption of data in transit using Transport Layer Security; row-level security policies ensuring that users can access only their own data; hashing of passwords by our authentication provider; time-limited signed links for private images; input validation and size limits; rate limiting; restriction of administrative functions to authorised administrators with audit logging; encryption of access-controlled versions of the Service; and minimisation of the data we collect. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. In the event of a personal data breach likely to result in a risk to your rights and freedoms, we will notify the competent supervisory authority and, where required, affected individuals, in accordance with Applicable Law.</p>

<h2>22. Requests from Public Authorities and Rights Holders</h2>
<p>We may disclose personal data to public authorities, including law enforcement and judicial authorities, only where we are legally required to do so by a valid order, warrant, subpoena or equivalent legal process, or where we believe in good faith that disclosure is necessary to prevent imminent harm to a person. We review each request for legal validity and proportionality, disclose only the minimum data necessary and, where legally permitted, inform the affected user. Where a Rights Holder submits a notice of alleged infringement concerning User Content, we may share with the Rights Holder only the information necessary to process the notice, and we may share the substance of the notice with the user concerned.</p>

<h2>23. Data Protection by Design and by Default</h2>
<p>The Service has been designed to operate fully without an Account and without analytics, so that the default experience involves the least possible processing of personal data. Records and settings remain in your browser unless you sign in. Analytics are disabled until you make an affirmative choice, and the session-only option allows you to contribute statistics without being recognised on future visits. We avoid collecting free-text data where structured data suffices, we truncate text fields, we do not record screen contents or session recordings, we do not record what you type other than search queries entered in the game search box, we do not use browser fingerprinting to identify you, and we do not store IP addresses in our analytics. Administrative access is restricted to authorised individuals and every administrative action affecting an Account is recorded in an audit log.</p>
<p>Before introducing new processing activities that may present a high risk to individuals, such as large-scale profiling or the processing of children's data for new purposes, we assess the necessity and proportionality of the processing and, where required by law, carry out a data protection impact assessment.</p>

<h2>24. Personal Data Breaches</h2>
<p>We maintain procedures to detect, investigate and respond to security incidents. Where a personal data breach occurs, we will contain it, assess the risks to the individuals concerned, document the facts, effects and remedial action taken and, where the breach is likely to result in a risk to the rights and freedoms of natural persons, notify the competent supervisory authority without undue delay and, where feasible, not later than seventy-two (72) hours after having become aware of it. Where the breach is likely to result in a high risk, we will also inform the affected individuals in clear and plain language, describing the likely consequences and the measures taken or proposed.</p>

<h2>25. Aggregated and De-identified Information</h2>
<p>We may create, use and disclose aggregated or de-identified information that cannot reasonably be used to identify you, such as the total number of players of a game, the distribution of operating systems among visitors or the average session length. Such information is not personal data, and we may use it for any lawful purpose, including publishing general statistics about the Service. We will not attempt to re-identify de-identified information.</p>

<h2>26. Information Concerning Other People</h2>
<p>If you provide information about another person, for example by mentioning them in a message or support request, you must ensure that you are entitled to do so. If you are not a user of the Service and believe that we hold personal data about you, for example because a user has sent us information about you, you may exercise your rights by contacting us as described above.</p>
<h2>27. Your Responsibilities</h2>
<p>You are responsible for the information you choose to share with other users through usernames, display names, messages, images and multiplayer sessions. Content you send to another user cannot be withdrawn from that user's device once received. Please exercise caution and do not share sensitive information.</p>

<h2>28. Accuracy of Data</h2>
<p>We take reasonable steps to ensure that the personal data we process is accurate and kept up to date. You can review and correct your username, display name and email address at any time in your account settings. Because analytics data is generated automatically from your device and network, certain values, such as approximate location, device model or connection speed, may be estimates and may not accurately reflect your circumstances; such values are used only in aggregate statistics.</p>
<h2>29. Access-Controlled Versions of the Service</h2>
<p>Certain versions of the Service are protected by a site-wide access password. When you enter the password, the verification is performed in your browser using cryptographic techniques: your browser retrieves an encrypted key from our database and attempts to decrypt it with the password you entered. The password itself is never transmitted to or stored on our servers. If decryption succeeds, the resulting key is stored in your browser so that you are not asked again; the number of failed attempts is also stored locally to limit brute-force attempts. Clearing your browser storage removes this information.</p>
<h2>30. Third-Party Websites and Services</h2>
<p>The Service may contain links to third-party websites or allow you to interact with third-party services, such as Google when you sign in. When you follow such links or use such services, the third party may collect information about you in accordance with its own privacy policy, over which we have no control. We encourage you to review the privacy policies of every website and service you visit.</p>
<h2>31. Accountability and Records</h2>
<p>We maintain internal documentation describing our processing activities, the categories of data and recipients, retention periods and security measures, and we review this Policy and our practices periodically and whenever we introduce new features. Our database schema, access policies and retention routines are maintained under version control, enabling us to demonstrate compliance with the principles set out in this Policy.</p>
<h2>32. Language of this Policy</h2>
<p>This Policy is drafted in English. Any translation is provided for convenience only. In the event of any inconsistency between the English version and a translation, the English version shall prevail to the extent permitted by Applicable Law.</p>
<h2>33. Changes to this Policy</h2>
<p>We may update this Policy from time to time to reflect changes in our processing activities, the Service or Applicable Law. The "Last updated" date at the top of this page indicates the latest revision. Where changes are material, in particular where we intend to process personal data for a new purpose requiring consent, we will inform you through the Service and, where required, request your renewed consent before the new processing begins.</p>

<h2>34. Contact</h2>
<p>For any question, request or complaint regarding this Policy or our processing of your personal data, please contact the controller at <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>. Please indicate "Privacy" in the subject line and, where your request concerns an Account, your username, so that we may locate and verify the relevant data.</p>`],
  cookies: ['Cookie Policy', `<p>This Cookie Policy explains how the operator of gameplay (the "Operator", "we", "us" or "our") uses cookies and similar technologies, including browser local storage, session storage, IndexedDB, in-memory identifiers and requests to third-party resources (collectively, "Storage Technologies"), when you access or use the gameplay website, its games and related services (the "Service"). It describes what these technologies are, which ones we use, the purposes for which we use them, how long they persist, the legal basis on which we rely and the choices available to you. This Policy should be read together with our Privacy Policy, which contains further information about the personal data processed through Storage Technologies, and with our Terms of Service.</p>

<h2>1. Summary</h2>
<ul>
<li>The Service does not place any advertising cookies, cross-site tracking cookies or third-party marketing pixels.</li>
<li>Most storage used by the Service is strictly necessary to provide the games and features you request, such as keeping your records, saved progress, settings and sign-in session, and does not require your consent.</li>
<li>Analytics storage and the associated measurement are activated only if you select Accept all or Only for this session in our consent banner. If you select Only essentials, no analytics storage is used.</li>
<li>You can change your choice at any time using the Cookie settings link available on every page, and you can delete all stored data through your browser settings.</li>
</ul>

<h2>2. What Are Cookies and Similar Technologies?</h2>
<p><b>Cookies</b> are small text files placed on your device by a website you visit. They are sent back to the originating website on each subsequent request, or to another website that recognises them, and are widely used to make websites work, to work more efficiently and to provide information to the owners of the site. Cookies may be "first-party", set by the website you are visiting, or "third-party", set by a domain other than the one you are visiting. They may be "session" cookies, which expire when you close your browser, or "persistent" cookies, which remain until they expire or are deleted.</p>
<p><b>Web Storage</b> comprises two mechanisms provided by modern browsers. <b>Local storage</b> allows a website to store key-value data in your browser that persists across sessions until it is deleted by the website, by you or by your browser. <b>Session storage</b> operates in the same manner but is limited to a single browser tab and is erased automatically when that tab is closed. Unlike cookies, web storage is not transmitted automatically to servers with each request; it is read only by code running on the website that created it.</p>
<p><b>IndexedDB</b> is a browser database that allows websites to store larger structured data, such as saved game worlds, on your device.</p>
<p><b>Third-party resources</b> are files, such as fonts, scripts or data, that your browser retrieves from servers operated by third parties when you load a web page. Such requests necessarily disclose technical information, such as your IP address and browser user agent, to the third party, even if no cookie is set.</p>
<p>In this Policy, references to "cookies" include all of these Storage Technologies unless the context indicates otherwise.</p>

<h2>3. Definitions</h2>
<p>For the purposes of this Policy: "device" means any computer, telephone, tablet, console or other equipment used to access the Service; "browser" means the software used to access the Service, including any installed web application; "consent" means any freely given, specific, informed and unambiguous indication of your wishes by which you signify agreement to the use of Storage Technologies for a given purpose; "strictly necessary" refers to storage or access without which the service explicitly requested by you could not be provided; "first-party" refers to Storage Technologies created by code served from the domain of the Service; and "third-party" refers to Storage Technologies or requests associated with a domain other than that of the Service. Capitalised terms not defined in this Policy have the meanings given in the Terms of Service or the Privacy Policy.</p>

<h2>4. Legal Framework</h2>
<p>The storage of information, or the gaining of access to information already stored, on your device is governed in the European Union by Article 5(3) of Directive 2002/58/EC (the "ePrivacy Directive") as transposed into national law, in the United Kingdom by the Privacy and Electronic Communications Regulations 2003, and in the Principality of Monaco by the applicable provisions of Law No. 1.565 of 3 December 2024 relating to the protection of personal data. Under these rules, storage and access require your prior, free, specific, informed and unambiguous consent, except where they are strictly necessary for the provision of an information society service explicitly requested by you or for the sole purpose of carrying out the transmission of a communication. Where Storage Technologies involve the processing of personal data, the General Data Protection Regulation and the corresponding national laws also apply. In designing our consent mechanism, we have had regard to the guidelines and recommendations published by the European Data Protection Board and by supervisory authorities such as the French Commission nationale de l'informatique et des libertés.</p>

<h2>5. Categories of Storage Technologies We Use</h2>
<p><b>Strictly necessary.</b> These technologies are essential for the Service to function and to provide the features you explicitly request. They enable core functionality such as remembering your best scores and saved progress, keeping you signed in, applying your settings, remembering your consent choice, synchronising your records with your Account, protecting the Service against abuse and, on access-controlled versions, remembering that you have entered the correct access password. Because they are strictly necessary, they do not require your consent. You can block or delete them through your browser settings, but parts of the Service will then not work properly, and your records and saved progress may be lost.</p>
<p><b>Functional and preference.</b> These technologies remember choices you make in order to provide enhanced and more personal features, such as your interface language, favourite games, the games you have rated, controls you have customised, notices you have dismissed and the latest changes you have seen. They are set only in response to an action or preference expressed by you and are used exclusively to provide the functionality you have requested; accordingly, we treat them as strictly necessary for the service you have requested.</p>
<p><b>Analytics and performance.</b> These technologies allow us to count visits, measure how the Service and its games are used and how they perform on different devices and networks, and identify problems, so that we can improve the Service. They are used only with your consent. They include a random device identifier, a random session identifier, a temporary queue of analytics events awaiting transmission, a session-scoped cache of approximate location data and a session-scoped marker indicating that device characteristics have already been transmitted during the current session.</p>
<p><b>Advertising and marketing.</b> The Service does not currently use any advertising, retargeting, social media or marketing cookies or similar technologies, and does not allow any third party to place such technologies through the Service. Should we decide to introduce advertising in the future, we will update this Policy, offer a separate and specific choice, and will not activate any advertising technology without your prior consent where consent is required.</p>

<h2>6. Detailed Inventory</h2>
<p>The following table lists every Storage Technology placed or read by the Service on your device, its purpose, its category, its type and its duration. Items are first-party unless otherwise stated. Items prefixed with "gameplay:" are created by the Service; the item prefixed with "sb-" is created by the authentication library provided by our database and authentication provider.</p>
<table><thead><tr><th>Name</th><th>Purpose</th><th>Category</th><th>Type and duration</th></tr></thead><tbody>
<tr><td><code>gameplay:v1</code></td><td>Stores your best scores, play counts, time played, daily play history, recently played games, the date of your first visit, mute state and preferences such as theme, reduced motion, thumbnails and custom control profiles</td><td>Strictly necessary</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:save:&lt;game&gt;</code></td><td>Stores saved progress for each game that supports saving</td><td>Strictly necessary</td><td>Local storage; persistent until deleted</td></tr>
<tr><td>IndexedDB databases created by sandbox games</td><td>Store worlds and structures you build in sandbox games</td><td>Strictly necessary</td><td>IndexedDB; persistent until deleted</td></tr>
<tr><td><code>gameplay:profile</code></td><td>Stores the username and display name shown in the Service</td><td>Strictly necessary</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:consent</code></td><td>Records your consent choice, its level and the time it was given, so that we do not ask you again on every page</td><td>Strictly necessary</td><td>Local storage, persistent until changed; or session storage until the tab is closed if you chose Only for this session</td></tr>
<tr><td><code>sb-gameplay-auth</code></td><td>Holds your sign-in session and refresh token so that you remain signed in to your Account</td><td>Strictly necessary</td><td>Local storage; persistent until you sign out or the session expires</td></tr>
<tr><td><code>gameplay:sync</code></td><td>Records which records and saved progress have already been synchronised with your Account, to avoid duplication</td><td>Strictly necessary</td><td>Local storage; persistent until you sign out or delete it</td></tr>
<tr><td><code>gameplay:authback</code></td><td>Remembers the page you were on when you started signing in with Google so that you can be returned to it</td><td>Strictly necessary</td><td>Session storage; erased after sign-in or when the tab is closed</td></tr>
<tr><td><code>gameplay:gate</code>, <code>gpgate</code></td><td>On access-controlled versions only, stores the decryption key obtained after you enter the correct access password and the number of failed attempts, to prevent brute-force attacks</td><td>Strictly necessary</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:reset</code></td><td>Marks that a one-time storage migration has been completed after an update of the Service</td><td>Strictly necessary</td><td>Local storage; persistent</td></tr>
<tr><td><code>gameplay:paths</code></td><td>Remembers the technical address format used by the current deployment</td><td>Strictly necessary</td><td>Session storage; erased when the tab is closed</td></tr>
<tr><td><code>gameplay:site</code>, <code>gameplay:sitehide</code></td><td>Cache site-wide notices and status flags, such as maintenance information, and remember notices you have dismissed</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:lang</code></td><td>Stores your chosen interface language</td><td>Functional</td><td>Local storage; persistent until changed</td></tr>
<tr><td><code>gameplay:favs</code></td><td>Stores the games you have marked as favourites</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:votes</code></td><td>Remembers the games you have rated so that you are not asked again</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:keys</code></td><td>Remembers which keys you have used in each game in order to display relevant control hints; never transmitted</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:seen</code></td><td>Remembers the latest change log entries you have seen</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:known</code></td><td>Remembers friends already known to your browser so that you are notified of new friend activity only once</td><td>Functional</td><td>Local storage; persistent until deleted</td></tr>
<tr><td><code>gameplay:sid</code></td><td>Random session identifier used to group analytics events belonging to the same visit; renewed after thirty minutes of inactivity</td><td>Analytics</td><td>Session storage; erased when the tab is closed</td></tr>
<tr><td><code>gameplay:vid</code></td><td>Random device identifier used to recognise returning visitors in aggregate statistics</td><td>Analytics</td><td>Local storage, persistent until consent is withdrawn or storage cleared; session storage only if you chose Only for this session</td></tr>
<tr><td><code>gameplay:analytics</code></td><td>Temporary queue of analytics events awaiting transmission to our database</td><td>Analytics</td><td>Local storage, or session storage if you chose Only for this session; entries are removed once transmitted</td></tr>
<tr><td><code>gameplay:geo</code></td><td>Caches the approximate location and network information returned by the GeoJS service for the current session, without the IP address</td><td>Analytics</td><td>Session storage; erased when the tab is closed</td></tr>
<tr><td><code>gameplay:env</code></td><td>Records that device and network characteristics have already been transmitted during the current session</td><td>Analytics</td><td>Session storage; erased when the tab is closed</td></tr>
</tbody></table>
<p>The Service does not set any HTTP cookies of its own. Our hosting and authentication providers may set technical cookies on their own domains strictly necessary for security and load balancing, for example during the Google sign-in flow on Google's domains, which are governed by those providers' policies.</p>

<h2>7. How the Strictly Necessary Storage Works in Practice</h2>
<p><b>Records and statistics.</b> Each time you play a game, the Service updates the play count, time played and, where applicable, best score for that game in <code>gameplay:v1</code>. Time is accumulated only while the browser tab is visible and the game is not paused, so that the figures reflect actual play. The same item stores a rolling history of daily play for up to sixty days, used to display your personal statistics, and the date of your first visit, used to determine whether you are a new or returning player for the purposes of the interface.</p>
<p><b>Saved progress.</b> Games that support saving write their state to a dedicated item named after the game. Sandbox games that allow you to construct worlds may use IndexedDB because the volume of data exceeds what is practical for web storage. Without this storage, your progress would be lost whenever you close the game.</p>
<p><b>Sign-in session.</b> When you sign in, the authentication library stores an access token, which expires after a short period, and a refresh token, which allows a new access token to be obtained without asking for your password again. These tokens are bound to your Account and are transmitted only to our authentication provider over encrypted connections. They are removed when you sign out.</p>
<p><b>Synchronisation.</b> When you are signed in, the Service compares the records stored in your browser with those stored in your Account and transmits only the differences. <code>gameplay:sync</code> records the baseline already synchronised and the identifiers of pending batches, so that interrupted transmissions can be safely retried without counting the same play twice.</p>
<p><b>Consent record.</b> <code>gameplay:consent</code> contains a version number, whether analytics are enabled, the level of your choice and a timestamp. It contains no identifier and is never transmitted to us; it exists solely so that your choice is respected.</p>
<p><b>Access protection.</b> On access-controlled versions of the Service, the content of the Service is encrypted, and the decryption key is obtained in your browser only after the correct access password has been entered. Storing the key locally avoids requiring the password on every visit, and storing the number of failed attempts allows the Service to block repeated guessing.</p>

<h2>8. Assessment of the Strictly Necessary Exemption</h2>
<p>We have assessed each Storage Technology classified as strictly necessary or functional against the criteria developed by European supervisory authorities. In each case: the storage serves a purpose directly linked to a feature you have explicitly requested, such as playing a game, saving progress, signing in, choosing a language or marking a favourite; the storage is limited to what is required for that purpose; the data is not used for any other purpose, in particular not for analytics, profiling or advertising; the data is not shared with third parties, save for the transmission of your own records to your own Account at your request; and the storage persists no longer than necessary, being removable at any time by you. Where a single item could serve both a necessary purpose and a measurement purpose, we have separated the purposes into distinct items so that measurement occurs only with consent.</p>

<h2>9. Third-Party Resources</h2>
<p>When you load the Service, your browser may retrieve resources from the following third parties. These requests are necessary to display the Service or to provide the feature you request, and the Service does not permit these third parties to place cookies through it. Each third party nonetheless receives technical information inherent to any internet request, such as your IP address, the time of the request and your browser user agent, which it processes in accordance with its own policies.</p>
<table><thead><tr><th>Provider</th><th>Resource or function</th><th>When</th></tr></thead><tbody>
<tr><td>Google (Firebase Hosting)</td><td>Delivery of the website files</td><td>Every visit</td></tr>
<tr><td>Google Fonts</td><td>Typefaces used by the interface</td><td>Every visit</td></tr>
<tr><td>cdnjs (Cloudflare) and jsDelivr</td><td>Software libraries, such as the three-dimensional rendering engine and the peer-to-peer networking library</td><td>When a game requiring them is opened</td></tr>
<tr><td>Supabase</td><td>Database, authentication, file storage, real-time presence and messaging, and receipt of analytics events</td><td>When accounts, social features, site notices or analytics are used</td></tr>
<tr><td>Google (Sign-In)</td><td>Authentication with your Google account</td><td>Only if you choose to sign in with Google</td></tr>
<tr><td>GeoJS</td><td>Approximate location and network lookup based on your IP address</td><td>Once per session, only if you consented to analytics</td></tr>
<tr><td>PeerJS and STUN/TURN providers</td><td>Establishment of peer-to-peer connections for online multiplayer</td><td>Only when you join or host an online session</td></tr>
</tbody></table>

<h2>10. Third-Party Requests in Detail</h2>
<p><b>Website hosting.</b> The files that make up the Service are delivered by Firebase Hosting, a service of Google. When your browser requests these files, Google's infrastructure processes your IP address, the requested address, the time of the request and your browser user agent in order to deliver the content through its global content delivery network and to protect it against attacks. Standard server logs may be retained by Google for operational and security purposes.</p>
<p><b>Fonts.</b> The interface uses typefaces provided by Google Fonts. Your browser downloads the font files directly from Google's servers, which receive your IP address and browser information. Google states that requests to the Google Fonts service are not used to create user profiles and do not involve cookies.</p>
<p><b>Software libraries.</b> Certain games rely on open-source libraries, such as a three-dimensional rendering engine and a peer-to-peer networking library, which are downloaded from the public content delivery networks cdnjs, operated by Cloudflare, and jsDelivr. These networks receive the technical information inherent in the request. The Service requests specific, fixed versions of each library.</p>
<p><b>Database and real-time services.</b> When you use accounts, friends, messaging, site notices, game ratings or, with your consent, analytics, your browser communicates with Supabase over encrypted connections, including persistent real-time connections used to deliver messages and presence information instantly. Supabase processes your IP address and request metadata as our processor and hosts our database in the European Union.</p>
<p><b>Sign in with Google.</b> If you choose to sign in with Google, you are redirected to Google's sign-in pages, where Google may use its own cookies in accordance with its policies to authenticate you and protect your account. Google then returns you to the Service with the information you agreed to share.</p>
<p><b>Location lookup.</b> If you have consented to analytics, your browser sends a single request per session to GeoJS, which uses your IP address to estimate your approximate location and network provider and returns the result to your browser. No cookie is set, and the IP address returned in the response is discarded by your browser before any data is transmitted to us.</p>
<p><b>Online multiplayer.</b> When you host or join an online session, your browser connects to a signalling server provided by the PeerJS service and may use STUN and TURN servers to discover network routes and relay traffic. These services and the other participants may observe your IP address, as explained in the Privacy Policy.</p>

<h2>11. Your Consent Choices</h2>
<p>When you first visit the Service, a banner informs you about our use of Storage Technologies and invites you to agree to the Terms of Service and Privacy Policy and to select one of the following options:</p>
<ul>
<li><b>Accept all</b>: enables analytics Storage Technologies and measurement for this and future visits until you change your choice.</li>
<li><b>Only for this session</b>: enables analytics Storage Technologies and measurement only until you close the browser tab. All analytics storage is held in session storage and is erased when the tab is closed, and the banner is shown again on your next visit.</li>
<li><b>Only essentials</b>: limits Storage Technologies to those that are strictly necessary or functional as described above. No analytics measurement takes place, and any analytics data previously queued in your browser is deleted.</li>
</ul>
<p>The options are presented with equal prominence, and the Service remains fully usable whichever option you select. Your choice is recorded in <code>gameplay:consent</code> so that it can be respected on subsequent visits and so that we can demonstrate that consent was obtained. Consent is valid for a maximum of thirteen (13) months, after which we may ask you again. Analytics events generated before you make a choice are held in memory only and are discarded unless you consent.</p>
<p>You can change your choice at any time: <button class="btn2" type="button" data-cookieset>Cookie settings</button></p>
<p>Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal. Data already transmitted to our database is retained and deleted in accordance with the Privacy Policy, and you may request its erasure by exercising your rights as described there.</p>

<h2>12. Lifecycle of Your Consent</h2>
<p>The consent banner is displayed on your first visit, whenever no valid consent record is present, for example after you have cleared your browser data or used a new browser, after a choice made for a single session has expired, and when your previous choice is more than thirteen (13) months old. Until you make a choice, no analytics data leaves your device. Agreeing to the Terms of Service and Privacy Policy is required in order to close the banner, but it does not by itself constitute consent to analytics; analytics consent is expressed only by selecting Accept all or Only for this session.</p>
<p>When you select Accept all, the consent record is written to local storage, analytics events held in memory since the start of your visit are added to the queue for transmission, and device and location characteristics are recorded once for the session. When you select Only for this session, the same occurs, but every analytics item, including the consent record itself, is written to session storage and is therefore erased when the tab closes. When you select Only essentials, the consent record is written to local storage, events held in memory are discarded, any queued analytics events in your browser are deleted, and the device identifier is removed.</p>
<p>You may revisit your choice at any time through Cookie settings, which allows you to switch analytics on or off. Each change replaces the previous consent record and takes effect immediately.</p>

<h2>13. Managing Storage Through Your Browser</h2>
<p>In addition to our consent tool, most browsers allow you to view, manage, delete and block cookies and site data. Please note that deleting site data for the Service will remove your locally stored records, saved progress, settings and sign-in session, and that blocking strictly necessary storage will prevent parts of the Service from working. Instructions are available from the following browser providers:</p>
<ul>
<li><b>Google Chrome:</b> Settings, Privacy and security, Third-party cookies or Site settings, View permissions and data stored across sites.</li>
<li><b>Mozilla Firefox:</b> Settings, Privacy and Security, Cookies and Site Data, Manage Data.</li>
<li><b>Apple Safari:</b> Settings or Preferences, Privacy, Manage Website Data.</li>
<li><b>Microsoft Edge:</b> Settings, Cookies and site permissions, Manage and delete cookies and site data.</li>
<li><b>Mobile browsers:</b> consult the settings of your browser or operating system, typically under Privacy or Site settings.</li>
</ul>
<p>Private or incognito browsing modes generally erase all site data when the private window is closed. You may also use the Download my data and data deletion tools available in the privacy settings of the Service to export or erase data associated with your browser and Account.</p>

<h2>14. Consequences of Refusing or Deleting Storage</h2>
<table><thead><tr><th>If you block or delete</th><th>Consequence</th></tr></thead><tbody>
<tr><td>Records and settings storage</td><td>Best scores, play counts, time played, preferences and custom controls are reset; the Service behaves as on a first visit</td></tr>
<tr><td>Saved progress and game databases</td><td>Saved games and constructed worlds stored only in your browser are permanently lost</td></tr>
<tr><td>Sign-in session</td><td>You are signed out and must sign in again; data synchronised to your Account is not affected</td></tr>
<tr><td>Consent record</td><td>The consent banner is displayed again</td></tr>
<tr><td>Access unlock</td><td>On access-controlled versions, you must enter the access password again</td></tr>
<tr><td>Functional preferences</td><td>Your language, favourites, ratings, dismissed notices and similar preferences are forgotten</td></tr>
<tr><td>Analytics storage</td><td>No effect on functionality; you are counted as a new visitor if you consent again</td></tr>
</tbody></table>

<h2>15. Analytics Measurement in Detail</h2>
<p>If you consent to analytics, the Service records usage events describing your interaction with the Service and its games, as detailed in the Privacy Policy, and places them in a queue in your browser. The queue is transmitted to our database at regular intervals, typically every thirty seconds, and when you leave or hide the page, after which transmitted entries are removed from your browser. If transmission fails, for example because you are offline, entries remain in the queue and are retried later, subject to a maximum number of queued entries beyond which the oldest entries are discarded.</p>
<p>Once per session, the Service also records characteristics of your device, browser and network, and requests an approximate location estimate from the GeoJS service, as described in the Privacy Policy. The markers <code>gameplay:env</code> and <code>gameplay:geo</code> prevent these operations from being repeated during the same session and are erased when you close the tab.</p>
<p>The random identifiers used for analytics are generated by your browser from random numbers and the current time. They do not contain or derive from any information about you, your device or your network, and they cannot be used to identify you outside the Service. They are not shared with any third party for advertising or any other purpose. If you withdraw consent, the device identifier is deleted from your browser, and any new consent will result in a new identifier.</p>
<p>The Service does not use third-party analytics products, tag managers, session replay tools, heatmap scripts or advertising measurement scripts. All analytics are processed by the Operator's own code and stored in the Operator's own database.</p>

<h2>16. Interaction Between Storage and Accounts</h2>
<p>Signing in does not by itself enable analytics; your consent choice applies equally whether or not you are signed in. If you are signed in and have consented to analytics, analytics events are additionally associated with your Account identifier, which allows statistics such as retention and streaks to be computed for registered players and enables the inclusion of your analytics events in the export provided by the Download my data function. If you sign out, locally stored records remain in your browser unless you delete them. If you sign in on a different device, your records and saved progress are retrieved from your Account and stored in the browser of that device.</p>

<h2>17. Multiple Devices, Browsers and Profiles</h2>
<p>Storage Technologies are specific to each browser, browser profile and device. Your consent choice, preferences and locally stored records on one browser do not apply to another browser or device, and you may be asked for your consent separately on each. Deleting site data on one device does not affect the data stored on other devices or in your Account.</p>

<h2>18. Storage Limits and Automatic Removal</h2>
<p>Browsers impose limits on the amount of data each website may store, and some browsers may automatically remove data from websites that have not been visited for an extended period or when the device runs low on storage space. In particular, certain browsers delete script-writable storage for websites with which you have not interacted for a number of days. The Service cannot prevent such removal. If you wish to preserve your records and saved progress reliably, we recommend creating an Account so that they are synchronised to our database, or regularly exporting your data.</p>

<h2>19. Security of Stored Data</h2>
<p>Data stored in your browser is accessible to code running on the Service's domain and to anyone with access to your device or browser profile. Do not use the Service on shared devices without signing out and clearing site data afterwards. The Service applies a strict separation between its own storage and that of third-party resources, does not allow third-party scripts to read its storage, and validates data read from storage before use to protect against corruption. Session tokens are transmitted only over encrypted connections.</p>

<h2>20. Children</h2>
<p>Because analytics Storage Technologies are activated only following an affirmative choice in the consent banner, parents and guardians are encouraged to make that choice on behalf of young children or to select Only essentials. Strictly necessary storage used to save the progress of a child's games involves no transmission of data to the Operator unless an Account is created.</p>

<h2>21. Global Privacy Control and Do Not Track</h2>
<p>Because the Service does not use advertising or cross-site tracking technologies and activates analytics only upon your affirmative consent, Global Privacy Control signals and Do Not Track headers do not currently change the operation of the Service. Should we introduce technologies to which such signals are relevant, we will honour them as required by Applicable Law.</p>

<h2>22. Future Advertising Technologies</h2>
<p>If advertising is introduced on the Service in the future, any advertising technologies will be subject to a separate consent request distinct from analytics, presented before any such technology is activated. Where required, we will implement an industry-standard consent management framework capable of transmitting your choices to advertising partners, publish the list of such partners and the purposes for which they process data, and allow you to accept or refuse each purpose and partner individually. Advertising technologies will not be activated for users who select Only essentials. We may measure the presence of content-blocking software as part of analytics, with your consent, solely to understand the proportion of visitors for whom advertising would not be displayed.</p>

<h2>23. Language</h2>
<p>This Policy is drafted in English. Any translation is provided for convenience only. In the event of any inconsistency between the English version and a translation, the English version shall prevail to the extent permitted by Applicable Law.</p>
<h2>24. Installed Application Mode</h2>
<p>If you add the Service to your home screen or install it as a web application, it continues to use the same Storage Technologies described in this Policy, within the storage space your browser allocates to the installed application. On some platforms, installed applications and the browser maintain separate storage, in which case your records, preferences and consent choice may need to be established separately in each. Uninstalling the application may delete its stored data.</p>
<h2>25. Purposes for Which Storage Is Never Used</h2>
<p>We do not use Storage Technologies, or any information read from your device, to: build advertising profiles or segments; infer sensitive characteristics such as health, religion, political opinions or sexual orientation; determine your creditworthiness, eligibility for services or any matter producing legal effects; sell or license data to data brokers; synchronise identifiers with advertising networks or other websites ("cookie syncing"); or identify you across devices other than through an Account you have created and signed in to yourself.</p>
<h2>26. Retention and Proof of Consent</h2>
<p>To demonstrate that consent was validly obtained, the consent record stored in your browser includes the time at which you made your choice and the version of the consent mechanism. Where you have consented to analytics, a consent event recording the level of consent chosen is also transmitted with your analytics data and is retained for the same period as other analytics events, namely two (2) years. If you refuse analytics, no record of your refusal is transmitted to us; your choice is stored only in your browser.</p>
<h2>27. Your Rights</h2>
<p>To the extent that Storage Technologies involve the processing of personal data, you benefit from the rights described in the Privacy Policy, including the rights of access, rectification, erasure, restriction, portability and objection, and the right to withdraw consent at any time. You may exercise these rights by using the tools available within the Service or by contacting us at the address below. You also have the right to lodge a complaint with a supervisory authority, such as the Autorité de protection des données personnelles in the Principality of Monaco, the Commission nationale de l'informatique et des libertés in France, or the supervisory authority of your place of habitual residence, work or alleged infringement.</p>
<h2>28. Accessibility of this Policy</h2>
<p>We aim to present this Policy in a clear and accessible format. It is available at any time through the legal pages of the Service, the Cookie settings and the consent banner, and it can be read with assistive technologies such as screen readers. If you require this Policy in an alternative format or have difficulty understanding any part of it, please contact us and we will endeavour to assist you.</p>
<h2>29. Illustrative Examples</h2>
<p><b>First visit without consent.</b> You open the Service for the first time and select Only essentials. The Service writes your consent record and, as you play, updates your records and settings in your browser. No analytics event, device characteristic or location estimate is transmitted to us. Requests to our hosting provider, font provider and, where a game requires them, content delivery networks occur as necessary to display the Service.</p>
<p><b>Visit with consent for a single session.</b> You select Only for this session and play two games. Your browser records events such as the games launched, their loading time, your final scores and the frame rate achieved, transmits them in batches together with a session identifier and a device identifier held in session storage, and requests an approximate location estimate once. When you close the tab, the consent record, identifiers, location cache and any untransmitted events are erased. On your next visit, the banner is displayed again and you are counted as a new visitor if you consent.</p>
<p><b>Signed-in player with full consent.</b> You select Accept all and sign in to your Account. Your records are synchronised with your Account, enabling you to continue on another device, and your analytics events are associated with your Account so that features such as streak statistics can be computed and so that your events are included when you download your data. If you later select Only essentials in Cookie settings, analytics stops immediately, the device identifier and queued events are deleted from your browser, and previously transmitted events are retained and deleted in accordance with the Privacy Policy unless you request their earlier erasure.</p>
<h2>30. Frequently Asked Questions</h2>
<p><b>Does the Service track me across other websites?</b> No. The Service does not use third-party cookies, advertising identifiers, social media pixels or any technology designed to follow you across websites.</p>
<p><b>Can I use the Service without accepting analytics?</b> Yes. Every game and feature is available regardless of your analytics choice.</p>
<p><b>Why does the Service ask me again after I chose Only for this session?</b> Because that option is designed to apply only to the visit during which you made it. Nothing is remembered once you close the tab, including your choice.</p>
<p><b>Do you use browser fingerprinting?</b> No. Although, with your consent, we record characteristics of your device such as its operating system, graphics processor and screen refresh rate in order to improve game performance, we do not combine these characteristics into a fingerprint to identify or recognise you, and recognition of returning visitors relies exclusively on the random device identifier described above.</p>
<p><b>How can I see what is stored?</b> Most browsers allow you to inspect site storage through their developer tools, and the Download my data function in the privacy settings of the Service provides an export of the data associated with your browser and, if you are signed in, your Account.</p>
<h2>31. Changes to this Policy</h2>
<p>We may update this Cookie Policy to reflect changes in the Storage Technologies we use, in the Service or in Applicable Law. The "Last updated" date at the top of this page indicates the latest revision. Where we introduce new categories of non-essential Storage Technologies, we will request your consent before using them.</p>

<h2>32. Contact</h2>
<p>If you have any question about this Cookie Policy or our use of Storage Technologies, please contact us at <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`]
};
const INFO = new Map();
ROWS.forEach((r, i) => INFO.set(r[0], { id: r[0], name: r[1], genres: r[2].split(','), pl: r[3], mins: r[4], kw: r[5], remake: r[6].includes('r'), hot: r[6].includes('h'), fresh: r[6].includes('n'), rank: i }));
const NEWEST_RANK = new Map(NEWEST.map((id, i) => [id, i]));
const KEYS_RE = /[←↑→↓]|\bwasd\b|\bw a s d\b|\bspace\b|\bshift\b|\bkeys?\b|\barrows?\b|\bd f j k\b|\bq w e\b|\btype\b|\btyping\b|\bpress\b|\benter\b/i;
const gname = k => GENRE_NAME[k] || k;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bucket = m => m <= 3 ? 'q' : m <= 12 ? 'm' : 'l';
const onlineMax = pl => pl.includes('o') ? +((pl.match(/\d+/) || ['2'])[0]) : 0;
const playersText = pl => { const n = onlineMax(pl); return n ? (pl.includes('s') ? 'Solo · Online up to ' + n : 'Online up to ' + n) : 'Solo'; };
S.time = S.time && typeof S.time === 'object' ? S.time : {};
S.daily = S.daily && typeof S.daily === 'object' ? S.daily : {};
S.last = S.last && typeof S.last === 'object' ? S.last : {};
S.prefs = S.prefs && typeof S.prefs === 'object' ? S.prefs : {};
if (!S.since) { S.since = Date.now(); save(); }

const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const toks = s => { const n = norm(s); return n ? n.split(' ') : []; };
function stem(w) {
  if (w.length <= 3 || /^\d/.test(w)) return w;
  let s = w;
  if (s.length > 4 && s.endsWith('ing')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ers')) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.length > 4 && s.endsWith('er')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
  else if (s.length > 4 && s.endsWith('es')) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  if (s.length > 3 && s[s.length - 1] === s[s.length - 2] && !/(ss|ll|ff|zz)$/.test(s)) s = s.slice(0, -1);
  if (s.length > 3 && s.endsWith('e')) s = s.slice(0, -1);
  return s;
}
function dist(a, b) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 2) return 3;
  let p2 = null, p1 = Array.from({ length: lb + 1 }, (_, j) => j);
  for (let i = 1; i <= la; i++) {
    const cur = [i];
    for (let j = 1; j <= lb; j++) {
      let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      cur[j] = v;
    }
    p2 = p1; p1 = cur;
  }
  return p1[lb];
}
function matchTok(q, t, exactOnly, allowPrefix) {
  if (t === q) return 1;
  if (exactOnly) return 0;
  if (q.length >= 2 && allowPrefix && t.startsWith(q)) return q.length >= 4 ? .85 : .6;
  if (q.length < 4) return 0;
  if (t.length >= 4 && t.includes(q)) return .6;
  const d = dist(q, t);
  if (d <= (q.length >= 7 ? 2 : 1)) return d === 1 ? .6 : .5;
  if (t.length > q.length && dist(q, t.slice(0, q.length)) <= 1) return .5;
  return 0;
}
const uniq = a => [...new Set(a)];
function buildIndex() {
  games.forEach(g => {
    const m = g.info;
    const forms = s => { const t = toks(s); return uniq(t.concat(t.map(stem))); };
    const players = [...m.pl].map(c => PL_KW[c] || '').join(' ') + (g.is3d ? ' 3d three dimensional' : ' 2d') + (m.remake ? ' remake clone version like famous' : '');
    const help = String(g.help || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    g.fields = [
      { w: 10, t: forms(m.name + ' ' + g.oldTitle + ' ' + g.id.replace(/-/g, ' ')) },
      { w: 6, t: forms(m.kw) },
      { w: 5, t: forms(m.genres.map(k => gname(k) + ' ' + GENRE_KW[k]).join(' ')) },
      { w: 4, t: forms(players) },
      { w: 1.5, t: forms(g.blurb || '') },
      { w: 1, t: forms(help) }
    ];
    g.kb = KEYS_RE.test(help);
  });
}
function runSearch(qt, pool, allowPrefix) {
  const scores = new Map(), misses = new Map();
  pool.forEach(g => {
    let total = 0, hit = 0, miss = 0;
    qt.forEach(raw => {
      let best = 0;
      const st = stem(raw);
      g.fields.forEach(f => {
        for (const t of f.t) {
          let s = matchTok(raw, t, false, allowPrefix);
          if (st !== raw) s = Math.max(s, matchTok(st, t, true, false) * .95);
          if (s * f.w > best) best = s * f.w;
        }
      });
      if (best > 0) { total += best; hit++; } else miss++;
    });
    if (hit) { scores.set(g, total); misses.set(g, miss); }
  });
  return { scores, misses };
}
function search(q, pool) {
  const full = norm(q);
  const pre = g => norm(g.info.name).startsWith(full);
  const alpha = l => l.slice().sort((x, y) => x.title.localeCompare(y.title, 'en', { sensitivity: 'base' }));
  if (full.length < 3) {
    const list = alpha(pool.filter(pre)), scores = new Map();
    list.forEach((g, i) => scores.set(g, 1000 - i * .01));
    return { list, partial: false, scores };
  }
  const qt = toks(q).filter(t => !STOP.has(t));
  if (!qt.length) return { list: pool, partial: false, scores: null };
  let r = runSearch(qt, pool, qt.every(t => t.length >= 4 || false) || qt.length > 1 && qt[qt.length - 1].length >= 4);
  let list = [...r.scores.keys()].filter(g => r.misses.get(g) === 0);
  if (!list.length) { r = runSearch(qt, pool, true); list = [...r.scores.keys()].filter(g => r.misses.get(g) === 0); }
  let partial = false;
  if (!list.length && qt.length > 1) { list = [...r.scores.keys()]; partial = list.length > 0; }
  const scores = r.scores;
  list.forEach(g => {
    const nm = norm(g.info.name), old = norm(g.oldTitle);
    if (nm === full || old === full) scores.set(g, scores.get(g) + 40);
    else if (nm.startsWith(full) || old.startsWith(full)) scores.set(g, scores.get(g) + 12);
  });
  const head = alpha(list.filter(pre));
  head.forEach((g, i) => scores.set(g, 1000 - i * .01));
  let rest = list.filter(g => !pre(g));
  if (rest.length > 6) {
    const top = Math.max(...rest.map(g => scores.get(g)));
    rest = rest.filter(g => scores.get(g) >= top * .2);
  }
  list = head.concat(rest);
  return { list, partial, scores };
}

const state = { q: '', f: new Set(), g: new Set(), p: new Set(), t: new Set(), v: new Set(), c: new Set(), sort: '' };
const FKEYS = ['f', 'g', 'p', 't', 'v', 'c'];
function resetState() { state.q = ''; FKEYS.forEach(k => state[k].clear()); state.sort = ''; }
const activeCount = () => FKEYS.reduce((n, k) => n + state[k].size, 0);
const defSort = () => state.q.trim() ? 'rel' : 'rec';
const nFilters = () => activeCount() + (state.sort && state.sort !== defSort() ? 1 : 0);
function passes(g) {
  const m = g.info;
  if (state.f.size && !fvHas(g.id)) return false;
  if (state.g.size && !m.genres.some(x => state.g.has(x))) return false;
  if (state.p.size && ![...state.p].some(c => m.pl.includes(c))) return false;
  if (state.t.size && !state.t.has(bucket(m.mins))) return false;
  if (state.v.size && !state.v.has(g.is3d ? '3d' : '2d')) return false;
  if (state.c.size && !state.c.has(g.kb ? 'kb' : 'tp') && !(state.c.has('kb') && g.kb)) return false;
  return true;
}
function compute() {
  const q = state.q.trim();
  let list = games.filter(passes), partial = false, scores = null;
  if (q) ({ list, partial, scores } = search(q, list));
  const sort = state.sort || defSort();
  const byRank = (a, b) => a.info.rank - b.info.rank;
  const cmp = {
    rel: (a, b) => ((scores && scores.get(b)) || 0) - ((scores && scores.get(a)) || 0) || byRank(a, b),
    rec: byRank,
    az: (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
    new: (a, b) => (NEWEST_RANK.get(a.id) ?? 999) - (NEWEST_RANK.get(b.id) ?? 999) || byRank(a, b),
    played: (a, b) => (S.plays[b.id] || 0) - (S.plays[a.id] || 0) || byRank(a, b),
    short: (a, b) => a.info.mins - b.info.mins || byRank(a, b)
  }[sort] || byRank;
  list = list.slice().sort(cmp);
  return { list, partial, q, sort };
}

const LEGAL_KEYS = ['terms', 'privacy', 'cookies'];
const href = (id, code) => PATH_MODE ? '/' + id + (code ? '/' + code : '') : '#/' + id + (code ? '/' + code : '');
const legalHref = k => (PATH_MODE ? '/' : '#/') + k;
function stateQuery() {
  const p = new URLSearchParams();
  if (state.q.trim()) p.set('q', state.q.trim());
  FKEYS.forEach(k => { if (state[k].size) p.set(k, [...state[k]].join(',')); });
  if (state.sort) p.set('s', state.sort);
  const s = p.toString();
  return s ? '?' + s : '';
}
const homeHref = () => (PATH_MODE ? '/' : '#/') + stateQuery();
function parseLocation() {
  let path, query;
  if (PATH_MODE) {
    path = location.pathname.replace(/^\/+|\/+$/g, '');
    query = location.search;
    if (!path && /^#\/[\w-]/.test(location.hash)) { path = location.hash.slice(2); const i = path.indexOf('?'); if (i >= 0) { query = path.slice(i); path = path.slice(0, i); } }
  } else {
    const h = location.hash.replace(/^#\/?/, '');
    const i = h.indexOf('?');
    path = (i < 0 ? h : h.slice(0, i)).replace(/\/+$/, '');
    query = i < 0 ? '' : h.slice(i);
  }
  if (LEGAL_KEYS.includes(path)) return { legal: path };
  if (path === 'admin') return { admin: true };
  const m = /^([\w-]+)(?:\/([A-Za-z0-9]{4}))?$/.exec(path);
  if (m && m[1] !== 'all' && byId.get(m[1])) return { game: byId.get(m[1]), code: m[2] || null };
  const p = new URLSearchParams(query);
  const st = { q: p.get('q') || '', sort: p.get('s') || '' };
  FKEYS.forEach(k => { st[k] = (p.get(k) || '').split(',').filter(Boolean); });
  return { game: null, state: st, toAll: location.hash === '#all' || path === 'all', missing: m && m[1] !== 'all' ? m[1] : null };
}
function applyLocState(st) {
  state.q = st.q; state.sort = SORTS.some(x => x[0] === st.sort) ? st.sort : '';
  FKEYS.forEach(k => { const ok = (FGROUPS.find(x => x.key === k) || { opts: [] }).opts.map(o => o[0]); state[k] = new Set(st[k].filter(v => ok.includes(v))); });
  $('#q').value = state.q;
}
function syncUrl(replace = true) {
  const url = homeHref();
  const same = PATH_MODE ? location.pathname + location.search === url : location.hash === url;
  if (same) return;
  if (PATH_MODE || replace) history[replace ? 'replaceState' : 'pushState'](null, '', url);
  else location.hash = url;
}
function go(url, replace) {
  if (PATH_MODE) { history[replace ? 'replaceState' : 'pushState'](null, '', url); route(replace ? undefined : false); return; }
  if (replace) { history.replaceState(null, '', url); route(); return; }
  if (location.hash === url) route(); else { progNav = true; location.hash = url; }
}

const LZ = { key: null, kp: null, dir: '', root: '', raw: {}, code: {}, packs: [], packOf: {}, pk: {}, done: new Set(), io: null };
const BLANK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10"/>');
const lzB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const lzUrl = (f, ext) => LZ.root + LZ.dir + f + ext;
function lzFetch(f) {
  if (LZ.raw[f]) return LZ.raw[f];
  const get = () => fetch(lzUrl(f, '.bin')).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); });
  const pre = window.__gpPre && window.__gpPre[f];
  if (pre) delete window.__gpPre[f];
  return LZ.raw[f] = (pre ? pre.catch(get) : get()).catch(e => { delete LZ.raw[f]; throw e; });
}
async function lzPlain(buf) {
  if (!LZ.kp) LZ.kp = crypto.subtle.importKey('raw', lzB64(LZ.key), 'AES-GCM', false, ['decrypt']);
  const u = new Uint8Array(buf);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, await LZ.kp, u.subarray(12));
  return new Response(new Blob([pt]).stream().pipeThrough(new DecompressionStream('gzip')));
}
const lzOpen = buf => lzPlain(buf).then(r => r.text());
const lzOpenBuf = buf => lzPlain(buf).then(r => r.arrayBuffer());
function lzRun(f) {
  if (LZ.code[f]) return LZ.code[f];
  const p = LZ.key ? lzFetch(f).then(lzOpen).then(txt => { const s = document.createElement('script'); s.textContent = txt; document.head.append(s); s.remove(); }) : new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = lzUrl(f, '.js'); s.async = true;
    s.onload = () => { s.remove(); res(); };
    s.onerror = () => { s.remove(); rej(new Error('script failed')); };
    document.head.append(s);
  });
  return LZ.code[f] = p.catch(e => { delete LZ.code[f]; delete LZ.raw[f]; throw e; });
}
function need(g) {
  if (g.mount) return Promise.resolve(g);
  return lzRun(g.lazy).then(() => { const r = byId.get(g.id); if (!r || !r.mount) { delete LZ.code[g.lazy]; throw new Error('game did not register'); } return r; });
}
function lzPrefetch(g) {
  if (!g || g.mount || !g.lazy || LZ.code[g.lazy]) return;
  if (LZ.key) lzFetch(g.lazy).catch(() => {});
  else if (!LZ.raw[g.lazy]) LZ.raw[g.lazy] = fetch(lzUrl(g.lazy, '.js')).catch(() => { delete LZ.raw[g.lazy]; });
}
function lazyLanded(old, g) {
  if (old.fields) { g.fields = old.fields; g.kb = old.kb; }
  ['cv', 'cvx', 'cvt', 'cc'].forEach(k => { if (old[k] && !g[k]) g[k] = old[k]; });
  const i = games.indexOf(old);
  if (i >= 0) games[i] = g; else games.push(g);
  byId.set(g.id, g);
  if (g.css && g.css.trim()) { const st = document.createElement('style'); st.textContent = g.css; document.head.append(st); }
}
function setImgs(id, u) {
  document.querySelectorAll('img[data-cv="' + id + '"]').forEach(im => { im.removeAttribute('data-cv'); im.src = u; });
}
function lzPack(i) {
  if (LZ.pk[i]) return LZ.pk[i];
  const pk = LZ.packs[i];
  const p = (LZ.key ? lzFetch(pk.f).then(lzOpen) : fetch(lzUrl(pk.f, '.json')).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })).then(t => {
    const d = JSON.parse(t);
    Object.keys(d.c || {}).forEach(id => { if (!Ameplay.covers[id]) Ameplay.covers[id] = d.c[id]; });
    Object.keys(d.s || {}).forEach(id => { if (!Ameplay.shots[id]) Ameplay.shots[id] = d.s[id]; });
    pk.ids.forEach(id => { LZ.done.add(id); const g = byId.get(id); if (g && !g.cv) { coverCache.delete(id); setImgs(id, coverUrl(g)); } });
    delete LZ.raw[pk.f];
  });
  return LZ.pk[i] = p.catch(e => { delete LZ.pk[i]; throw e; });
}
const CV = { url: {}, p: {}, bad: {}, q: [], n: 0 };
function cvWant(id, hi) {
  const g = byId.get(id);
  if (!g || !g.cv || CV.url[id] || CV.p[id] || CV.bad[id]) return;
  const at = CV.q.indexOf(id);
  if (at >= 0) { if (!hi) return; CV.q.splice(at, 1); }
  if (hi) CV.q.unshift(id); else CV.q.push(id);
  cvPump();
}
function cvPump() {
  while (CV.n < 6 && CV.q.length) {
    const id = CV.q.shift(), g = byId.get(id);
    if (!g || !g.cv) continue;
    CV.n++;
    CV.p[id] = lzFetch(g.cv).then(lzOpenBuf).then(buf => {
      delete LZ.raw[g.cv];
      const u = URL.createObjectURL(new Blob([buf], { type: g.cvt || 'image/webp' }));
      CV.url[id] = u; coverCache.delete(id); setImgs(id, u);
    }, e => {
      CV.bad[id] = 1; coverCache.delete(id); setImgs(id, coverUrl(g));
    }).finally(() => { delete CV.p[id]; CV.n--; cvPump(); });
  }
}
const lzCover = (id, hi) => { const g = byId.get(id); if (g && g.cv) { cvWant(id, hi); return; } const i = LZ.packOf[id]; if (i != null && !LZ.done.has(id)) lzPack(i).catch(() => {}); };
function lzScan(now) {
  const imgs = document.querySelectorAll('img[data-cv]');
  if (!imgs.length) return;
  const wait = now === true ? null : pend;
  if (wait) need(wait).then(() => lzScan(true), () => lzScan(true));
  if (!LZ.io && window.IntersectionObserver) LZ.io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { LZ.io.unobserve(e.target); if (e.target.dataset.cv) lzCover(e.target.dataset.cv); } }), { rootMargin: '500px 0px' });
  imgs.forEach(im => { if (im.closest('#pThumb')) lzCover(im.dataset.cv, true); else if (wait) return; else if (!LZ.io || im.closest('.rail') || im.getAttribute('fetchpriority') === 'high') lzCover(im.dataset.cv); else LZ.io.observe(im); });
}
function lzIdle(now) {
  if (now !== true && pend) { need(pend).then(() => lzIdle(true), () => lzIdle(true)); return; }
  const later = fn => window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 800);
  const rest = LZ.packs.map((p, i) => i).filter(i => !LZ.pk[i]);
  if (rest.length && rest.length <= 6) later(function step() { const i = rest.shift(); if (i == null) return; (LZ.pk[i] || lzPack(i)).then(() => later(step), () => {}); });
  let budget = 600000;
  S.recent.slice(0, 2).map(id => byId.get(id)).forEach(g => { if (g && !g.mount && g.lazy && (g.size || 0) <= budget) { budget -= g.size || 0; later(() => lzPrefetch(g)); } });
}
Ameplay.lazy = d => {
  LZ.key = typeof d.k === 'string' && d.k.length > 20 ? d.k : null;
  LZ.dir = d.dir || '';
  LZ.root = PATH_MODE ? location.origin + '/' : new URL('.', location.href).href;
  (d.packs || []).forEach((p, i) => { LZ.packs.push(p); p.ids.forEach(id => { LZ.packOf[id] = i; }); });
  (d.games || []).forEach(g => Ameplay.register(g));
};

const coverCache = new Map();
function svgCover(g) {
  let svg = Ameplay.covers[g.id];
  if (!svg) {
    const icon = (g.icon || '').replace('<svg', '<svg x="135" y="85" width="130" height="130"');
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${TINT[g.id] || '#6c5ce7'}"/><circle cx="200" cy="150" r="96" fill="#fff" opacity=".16"/><g style="color:#fff">${icon}</g></svg>`;
  }
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function coverUrl(g) {
  if (coverCache.has(g.id)) return coverCache.get(g.id);
  let url;
  if (g.cv && !CV.bad[g.id]) {
    if (CV.url[g.id]) url = CV.url[g.id];
    else if (!LZ.key) url = lzUrl(g.cv, '.' + (g.cvx || 'webp'));
    else return BLANK;
  } else {
    if (LZ.packOf[g.id] != null && !LZ.done.has(g.id) && !Ameplay.shots[g.id] && !Ameplay.covers[g.id]) return BLANK;
    const shot = Ameplay.shots[g.id];
    if (shot) {
      try {
        const bin = atob(shot.slice(shot.indexOf(',') + 1)), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        url = URL.createObjectURL(new Blob([bytes], { type: shot.slice(5, shot.indexOf(';')) }));
      } catch (e) { url = shot; }
    } else url = svgCover(g);
  }
  coverCache.set(g.id, url);
  return url;
}
const thumbsOn = () => S.prefs.thumbs !== false;
const tint = g => g.cc || TINT[g.id] || '#6c5ce7';
const img = (g, pri) => { if (!thumbsOn()) return ''; const u = coverUrl(g); return `<img src="${u}"${u === BLANK ? ` data-cv="${g.id}"` : ''} alt="" width="16" height="10"${pri ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async" draggable="false">`; };
let sel = null;
const card = (g, src, i) => `<a class="card${sel === g.id && src === 'grid' ? ' sel' : ''}${sfOff(g.id) ? ' off' : ''}" href="${href(g.id)}" data-id="${g.id}" data-src="${src}" style="--c:${tint(g)};--i:${i || 0}"><div class="art">${img(g, i != null && i < 10)}${sfOff(g.id) ? '<span class="offb">Temporarily unavailable</span>' : ''}</div>${fvBtn(g.id)}<div class="name">${esc(g.title)}</div></a>`;
const srow = g => `<a class="srow${sel === g.id ? ' sel' : ''}" href="${href(g.id)}" data-id="${g.id}" data-src="side" ><span class="n">${esc(g.title)}</span></a>`;
function related(g) {
  const mine = new Set(g.info.genres);
  const scored = games.filter(x => x !== g).map(x => {
    const shared = x.info.genres.filter(k => mine.has(k)).length;
    const uni = new Set([...mine, ...x.info.genres]).size;
    let s = shared / uni * 10;
    if (x.is3d === g.is3d) s += 1.2;
    if (x.info.pl === g.info.pl) s += 1.2;
    if (bucket(x.info.mins) === bucket(g.info.mins)) s += .8;
    if (x.info.remake && g.info.remake) s += .5;
    const kw = new Set(toks(g.info.kw)), ov = toks(x.info.kw).filter(w => kw.has(w) && w.length > 3).length;
    s += Math.min(ov, 4) * .5;
    return [s - x.info.rank / 400, x];
  });
  return scored.sort((a, b) => b[0] - a[0]).map(x => x[1]);
}

const SB = { on: !!(SUPABASE_URL && SUPABASE_ANON_KEY), c: null, p: null, lib: null, user: null, session: null, prof: null, syncing: false, again: false, fail: 0, t: 0, loud: false, mode: 'in', choosing: false, view: 'main' };
const AN_KEY = 'gameplay:analytics', CK_KEY = 'gameplay:consent', AN_MAX = 2000;
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
let consent = null;
try { consent = JSON.parse(localStorage.getItem(CK_KEY) || sessionStorage.getItem(CK_KEY)); } catch (e) {}
if (!consent || typeof consent !== 'object' || consent.v !== 2 || !(Date.now() - (+consent.at || 0) < 395 * 864e5)) consent = null;
const anOk = () => !!(consent && consent.analytics);
const ckStore = () => consent && consent.level === 'session' ? sessionStorage : localStorage;
let anQ = [];
try { anQ = JSON.parse(ckStore().getItem(AN_KEY)) || []; } catch (e) {}
if (!Array.isArray(anQ)) anQ = [];
if (!anOk()) anQ = [];
let anHold = [], anT = 0, anErr = 0, anBusy = false;
const SID = (() => { try { const o = JSON.parse(sessionStorage.getItem('gameplay:sid')); if (o && o.id && Date.now() - o.t < 30 * 60e3) return o.id; } catch (e) {} return rid(); })();
const T0 = Date.now();
function anSave() { try { if (anOk()) ckStore().setItem(AN_KEY, JSON.stringify(anQ)); } catch (e) { anQ.splice(0, Math.ceil(anQ.length / 4)); } }
function anClean(p) {
  const o = {};
  Object.keys(p).slice(0, 24).forEach(k => {
    const v = p[k];
    if (v == null) return;
    if (typeof v === 'number') o[k] = isFinite(v) ? Math.round(v * 100) / 100 : null;
    else if (typeof v === 'boolean') o[k] = v;
    else if (typeof v === 'string') o[k] = v.slice(0, 160);
    else if (Array.isArray(v)) o[k] = v.slice(0, 40).map(x => typeof x === 'number' ? (isFinite(x) ? Math.round(x * 100) / 100 : null) : typeof x === 'boolean' ? x : String(x).slice(0, 80));
  });
  return o;
}
function track(e, p) {
  if (typeof e !== 'string' || !e) return;
  const ev = { e: e.slice(0, 40), t: Date.now(), s: SID };
  if (SB.user) { ev.u = SB.user.id; if (e === 'game_play' || e === 'game_time' || e === 'record') syNudge(); }
  if (p && typeof p === 'object') ev.p = anClean(p);
  try { sessionStorage.setItem('gameplay:sid', JSON.stringify({ id: SID, t: Date.now() })); } catch (x) {}
  if (!consent) { if (anHold.length < 400) anHold.push(ev); return; }
  if (!anOk()) return;
  anQ.push(ev);
  if (anQ.length > AN_MAX) anQ.splice(0, anQ.length - AN_MAX);
  clearTimeout(anT); anT = setTimeout(anSave, 500);
}
async function anFlush() {
  const A = Ameplay.analytics;
  if (!anOk() || anBusy || !anQ.length || typeof A.sink !== 'function') return false;
  const batch = anQ.slice(0, 250), set = new Set(batch);
  anBusy = true;
  try { await A.sink(batch.map(x => Object.assign({}, x))); anQ = anQ.filter(x => !set.has(x)); anSave(); return true; }
  catch (e) { return false; }
  finally { anBusy = false; }
}
function device() {
  const ua = navigator.userAgent || '', coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  const w = screen.width || innerWidth, h = screen.height || innerHeight, small = Math.min(w, h);
  const type = /iPad|Tablet/i.test(ua) || (coarse && small >= 600) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'tablet' : coarse || /Mobi|Android|iPhone/i.test(ua) ? 'phone' : 'desktop';
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'other';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'other';
  return { type, os, browser, touch: coarse, sw: w, sh: h, vw: innerWidth, vh: innerHeight, dpr: Math.round((devicePixelRatio || 1) * 100) / 100, lang: (navigator.language || '').slice(0, 12), standalone: !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches) };
}
function anReport() {
  const ev = anQ.slice(), by = {}, gm = {}, searches = {}, filters = {}, errors = [], parties = [], sessions = new Set(), dev = {};
  const G = id => gm[id] || (gm[id] = { game: id, clicks: 0, opens: 0, launches: 0, plays: 0, seconds: 0 });
  ev.forEach(x => {
    by[x.e] = (by[x.e] || 0) + 1; sessions.add(x.s);
    const p = x.p || {};
    if (x.e === 'tile_click' && p.game) G(p.game).clicks++;
    if (x.e === 'game_open' && p.game) G(p.game).opens++;
    if (x.e === 'game_launch' && p.game) G(p.game).launches++;
    if (x.e === 'game_play' && p.game) G(p.game).plays++;
    if (x.e === 'game_time' && p.game) G(p.game).seconds += p.sec || 0;
    if (x.e === 'search' && p.q) searches[p.q] = (searches[p.q] || 0) + 1;
    if (x.e === 'filter') { const k = p.k + ':' + p.v; filters[k] = (filters[k] || 0) + (p.on ? 1 : 0); }
    if (x.e === 'error') errors.push(p);
    if (x.e === 'online_party') parties.push(p);
    if (x.e === 'session' && p.type) dev[p.type] = (dev[p.type] || 0) + 1;
  });
  const out = { consent: consent ? (anOk() ? 'accepted' : 'rejected') : 'not chosen', queued: ev.length, held: anHold.length, sessions: sessions.size, events: by, games: Object.values(gm).sort((a, b) => b.seconds - a.seconds || b.opens - a.opens), searches, filters, devices: dev, parties, errors };
  try {
    console.group('gameplay analytics');
    console.log('consent:', out.consent, '| queued events:', out.queued, '| sessions:', out.sessions, '| sink:', typeof Ameplay.analytics.sink === 'function' ? 'set' : 'none');
    console.table(by);
    if (out.games.length) console.table(out.games);
    if (Object.keys(searches).length) console.table(searches);
    if (Object.keys(filters).length) console.table(filters);
    if (Object.keys(dev).length) console.table(dev);
    if (parties.length) console.table(parties);
    if (errors.length) console.table(errors);
    console.groupEnd();
  } catch (e) {}
  return out;
}
Ameplay.analytics = {
  sink: null,
  track,
  flush: anFlush,
  report: anReport,
  events: () => anQ.map(x => Object.assign({}, x)),
  clear() { anQ = []; anHold = []; try { localStorage.removeItem(AN_KEY); } catch (e) {} },
  get consent() { return consent ? { analytics: anOk(), at: consent.at } : null; },
  get session() { return SID; }
};
function setConsent(an, lv) {
  consent = { v: 2, analytics: !!an, level: lv || (an ? 'all' : 'essential'), terms: true, at: Date.now() };
  try { [localStorage, sessionStorage].forEach(st => { st.removeItem(CK_KEY); st.removeItem(AN_KEY); }); if (lv === 'session') localStorage.removeItem(VIDK); ckStore().setItem(CK_KEY, JSON.stringify(consent)); } catch (e) {}
  if (an) { anQ = anQ.concat(anHold); anHold = []; track('consent', { analytics: true, level: consent.level }); anSave(); setTimeout(trEnv, 500); }
  else { anQ = []; anHold = []; try { if (SB.on) localStorage.removeItem(VIDK); } catch (e) {} }
  $('#ckbar').hidden = true;
  document.documentElement.classList.remove('ck-open');
  syncSwitches();
}
const TT = { g: null, since: 0, acc: 0 };
const ttRunning = () => !!(cur && !PAUSE.on && document.visibilityState !== 'hidden');
const dayKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function ttAccrue() {
  const now = performance.now();
  if (TT.g && TT.since) TT.acc += Math.min(600, (now - TT.since) / 1000);
  TT.since = TT.g && ttRunning() ? now : 0;
}
function ttCommit(final) {
  ttAccrue();
  const id = TT.g, sec = TT.acc;
  if (!id || sec < .5) return;
  TT.acc = 0;
  S.time[id] = (S.time[id] || 0) + sec;
  const k = dayKey(), d = S.daily[k] || (S.daily[k] = { s: 0, p: 0 });
  d.s += sec;
  const keys = Object.keys(S.daily).sort();
  while (keys.length > 60) delete S.daily[keys.shift()];
  save();
  TT.sec = (TT.sec || 0) + sec;
  if (final && TT.sec >= 1) { track('game_time', { game: id, sec: Math.round(TT.sec) }); TT.sec = 0; }
}
function ttSync() {
  const id = cur ? cur.g.id : null;
  if (id !== TT.g) { ttCommit(true); TT.g = id; TT.acc = 0; TT.sec = 0; TT.since = 0; }
  ttAccrue();
}
let clickSrc = null, searchT = 0, errN = 0;

function start(g) {
  frame.textContent = '';
  const root = document.createElement('div');
  root.className = 'g-root gm-' + g.id;
  frame.append(root);
  $('#pScore').textContent = '—'; $('#pScoreK').textContent = g.info.stat || 'Score'; setBest(g);
  setPause(false);
  const ctl = makeApi(g, root);
  cur = { g, api: ctl.api, kill: ctl.kill, counted: cur ? cur.counted : false };
  trStart(g, ctl);
  ttSync();
  const mark = e => {
    if (!cur || cur.g !== g || cur.counted) return;
    if (e && e.type === 'keydown' && (isField(e.target) || (e.target.closest && !e.target.closest('.g-root') && e.target.closest('.top, .side, .modal, .menu, .ckbar')))) return;
    markPlayed(g);
  };
  ctl.api.on(frame, 'pointerdown', mark, true);
  ctl.api.on(window, 'keydown', mark, true);
  const fail = e => { console.error('[gameplay]', g.id, e); track('error', { game: g.id, where: 'mount', msg: String(e && e.message || e) }); if (ctl.api.alive) root.innerHTML = '<p class="g-muted">This game hit an error and could not start.</p>'; };
  const hook = r => {
    if (!r || typeof r.destroy !== 'function') return;
    if (ctl.api.alive) ctl.add(() => r.destroy());
    else { try { r.destroy(); } catch (e) {} }
  };
  try {
    const inst = g.mount(root, ctl.api);
    if (inst && typeof inst.then === 'function') inst.then(hook, fail); else hook(inst);
  } catch (e) { fail(e); }
  frame.focus({ preventScroll: true });
  [60, 400, 1200, 2800].forEach(ms => setTimeout(queueFit, ms));
}
function markPlayed(g) {
  if (!cur || cur.g !== g || cur.counted) return;
  cur.counted = true;
  S.plays[g.id] = (S.plays[g.id] || 0) + 1;
  S.last[g.id] = Date.now();
  S.recent = [g.id, ...S.recent.filter(id => id !== g.id)].slice(0, 8);
  const k = dayKey(), d = S.daily[k] || (S.daily[k] = { s: 0, p: 0 });
  d.p++;
  save();
  track('game_play', { game: g.id, n: S.plays[g.id] });
}
let pauseEl = null;
function setPause(on) {
  if (PAUSE.on === on && (on ? pauseEl : !pauseEl)) return;
  PAUSE.on = on;
  ttSync();
  if (pauseEl) { const p = pauseEl; pauseEl = null; p.classList.remove('show'); p.style.pointerEvents = 'none'; setTimeout(() => p.remove(), 300); }
  if (!on) { frame.focus({ preventScroll: true }); return; }
  dispatchEvent(new Event('blur'));
  const el = document.createElement('div');
  el.className = 'g-overlay g-pause';
  el.innerHTML = '<div class="g-ov-card"><h3 class="g-ov-title">Paused</h3><div class="g-ov-btns"><button class="g-btn" data-p="r">Resume</button><button class="g-btn ghost" data-p="s">Restart</button><button class="g-btn ghost" data-p="x">All games</button></div></div>';
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-p]');
    if (!b) return;
    sfx('tap');
    if (b.dataset.p === 'r') setPause(false);
    else if (b.dataset.p === 's') { setPause(false); restartCurrent(); }
    else { setPause(false); const a = document.querySelector('.am-back'); if (a) a.click(); }
  });
  frame.append(el); void el.offsetWidth; el.classList.add('show');
  pauseEl = el;
}
const canPause = () => !!(cur && !cur.g.ownPause && !(cur.api && cur.api.online));
function restartCurrent() {
  if (!cur) return;
  const g = cur.g;
  if (TR.g) TR.g.why = 'restart';
  cur.kill();
  frame.classList.remove('swap'); void frame.offsetWidth; frame.classList.add('swap');
  start(g);
}
const canon = $('#canon'), metaDesc = $('#metaDesc');
function setHead(title, desc, path) {
  document.title = title;
  if (metaDesc) metaDesc.setAttribute('content', desc);
  document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(m => m.setAttribute('content', title));
  document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]').forEach(m => m.setAttribute('content', desc));
  if (canon && /^https?:/.test(location.protocol) && PATH_MODE) { canon.setAttribute('href', location.origin + path); document.querySelectorAll('meta[property="og:url"]').forEach(m => m.setAttribute('content', location.origin + path)); }
}
let pend = null;
function waitStart(g) {
  pend = g;
  frame.textContent = '';
  $('#pScore').textContent = '—'; setBest(g);
  const t0 = performance.now();
  const box = document.createElement('div');
  box.style.cssText = 'position:relative;width:min(100%,' + (g.width || 880) + 'px);aspect-ratio:16/10;max-height:calc(100dvh - var(--goff, 250px));margin:0 auto';
  frame.append(box);
  const t = setTimeout(() => { if (pend !== g || !box.isConnected) return; const el = document.createElement('div'); el.className = 'g-loading pg-sk'; el.innerHTML = '<i></i><span>Loading…</span>'; box.append(el); }, 200);
  need(g).then(r => {
    clearTimeout(t);
    if (pend !== g) return;
    pend = null; start(r); markSide();
    track('game_launch', { game: g.id, ms: Math.round(performance.now() - t0), lazy: true });
  }, e => {
    clearTimeout(t);
    if (pend !== g) return;
    console.warn('[gameplay]', g.id, e);
    track('error', { game: g.id, where: 'load', msg: String(e && e.message || e) });
    frame.textContent = '';
    const el = document.createElement('div');
    el.className = 'g-overlay';
    el.innerHTML = '<div class="g-ov-card"><h3 class="g-ov-title">Couldn’t load the game</h3><p class="g-ov-text">Check your connection and try again.</p><div class="g-ov-btns"><button class="g-btn" data-a="1">Retry</button></div></div>';
    el.addEventListener('click', ev => { if (ev.target.closest('[data-a]') && pend === g) { sfx('tap'); waitStart(g); } });
    frame.append(el); void el.offsetWidth; el.classList.add('show');
  });
}
function openGame(g) {
  if (cur && cur.g === g) return;
  if (pend && pend.id === g.id) return;
  if (cur) { cur.kill(); cur = null; ttSync(); }
  pend = null;
  track('game_open', { game: g.id, src: clickSrc || 'link' });
  adSeen(g.id);
  rtTrack();
  clickSrc = null;
  setHead(g.title + ' — play free online | gameplay', g.title + ' on gameplay: ' + (g.blurb || '') + ' Free to play in your browser, no download.', '/' + g.id);
  $('#pTitle').textContent = g.title;
  $('#pSub').textContent = gname(g.info.genres[0]) + ' · ' + playersText(g.info.pl);
  $('#pScoreK').textContent = g.info.stat || 'Score';
  $('#pThumb').innerHTML = img(g, true); $('#pThumb').style.setProperty('--c', tint(g));
  fvBar(g);
  gamebox.style.setProperty('--fw', (g.width || 880) + 'px');
  $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join('');
  showView('game');
  if (!$('#slist').children.length) renderResults();
  scrollTo({ top: 0, behavior: 'instant' });
  gamebox.classList.remove('enter'); void gamebox.offsetWidth; gamebox.classList.add('enter');
  syncTheater();
  if (shortQuery.matches) requestAnimationFrame(toStage);
  SF.og = null;
  if (sfBlocked(g)) sfOffFrame(g); else if (g.mount) { start(g); track('game_launch', { game: g.id, ms: 0, lazy: false }); } else waitStart(g);
  markSide();
  lzScan();
}
function closeGame() {
  const was = !!(cur || pend);
  pend = null;
  if (!was) return;
  setPause(false);
  if (cur) { cur.kill(); cur = null; }
  ttSync();
  if (gamebox.classList.contains('fs')) fsExit();
  frame.textContent = '';
  $('#stage').style.height = '';
  frame.style.transform = '';
  setHead(BASE_TITLE, BASE_DESC, '/');
  rtTrack();
}

let view = '', homeY = 0;
function showView(v) {
  closeAll();
  document.body.classList.toggle('in-game', v === 'game');
  if (view === v) return false;
  trView(view);
  if (view === 'home') homeY = scrollY;
  view = v;
  ['home', 'game', 'legal', 'admin'].forEach(k => { $('#v' + k[0].toUpperCase() + k.slice(1)).hidden = k !== v; });
  if (v !== 'home' && !$('#slist').children.length) { lastList = compute().list; renderSide(lastList); markSide(); }
  track('view', { v });
  return true;
}

function filterLabel(k, v) {
  const gr = FGROUPS.find(x => x.key === k), o = gr && gr.opts.find(x => x[0] === v);
  return o ? o[1] : v;
}
function renderPanel() {
  const sorts = SORTS.filter(s => s[0] !== 'rel' || state.q.trim());
  const cs = state.sort || defSort();
  $('#fgroups').innerHTML = FGROUPS.map(gr => `<div class="fg"><h4>${gr.name}</h4><div class="chips">${gr.opts.map(o => `<button class="chip" type="button" data-f="${gr.key}" data-v="${o[0]}" aria-pressed="${state[gr.key].has(o[0])}">${esc(o[1])}</button>`).join('')}</div></div>`).join('')
    + `<div class="fg"><h4>Sort by</h4><div class="chips">${sorts.map(s => `<button class="chip" type="button" data-sort="${s[0]}" aria-pressed="${s[0] === cs}">${s[1]}</button>`).join('')}</div></div>`;
}
function fbtnState() {
  const n = nFilters(), fc = $('#fcount');
  fc.hidden = !n; fc.textContent = n;
  $('#fbtn').classList.toggle('on', n > 0 && openK !== 'filters');
}
function recentList() { return S.recent.map(id => byId.get(id)).filter(Boolean).slice(0, 5); }
function renderSide(list) {
  const sl = $('#slist'), sy = sl.firstChild ? sl.scrollTop : 0;
  sl.innerHTML = list.map(srow).join('');
  if (sy) sl.scrollTop = sy;
  $('#scount').textContent = list.length;
  const g = sel && byId.get(sel), p = $('#play');
  p.disabled = !g; p.textContent = g ? 'Play ' + g.title : 'Select a game';
}
let lastList = [];
function renderResults() {
  const { list, partial, q, sort } = compute();
  lastList = list;
  const n = list.length, filt = activeCount() > 0;
  $('#title').textContent = filt || q ? 'Results' : 'All games';
  $('#count').textContent = n + (n === 1 ? ' game' : ' games') + (partial ? ', partial matches' : '');
  $('#grid').innerHTML = list.map((g, i) => card(g, 'grid', i)).join('');
  $('#grid').hidden = !n; $('#empty').hidden = n > 0;
  $('#continue').hidden = !!(filt || q) || !recentList().length;
  $('#favs').hidden = !!(filt || q) || !FV.ids.some(id => byId.has(id));
  const chips = [];
  FKEYS.forEach(k => state[k].forEach(v => chips.push(`<button class="chip" type="button" data-x="${k}:${v}" aria-label="Remove ${esc(filterLabel(k, v))}">${esc(filterLabel(k, v))} &times;</button>`)));
  if (state.sort && state.sort !== defSort()) { const s = SORTS.find(x => x[0] === state.sort); chips.push(`<button class="chip" type="button" data-x="s:" aria-label="Reset sort">${esc(s ? s[1] : state.sort)} &times;</button>`); }
  $('#active').innerHTML = chips.join(''); $('#active').hidden = !chips.length;
  $('#apply').textContent = 'Show ' + n + (n === 1 ? ' game' : ' games');
  renderPanel(); fbtnState();
  renderSide(list);
  markSide();
  lzScan();
}
function renderHome() {
  const rec = recentList();
  $('#rail').innerHTML = rec.map((g, i) => card(g, 'rail', i)).join('');
  renderResults();
  fvRail();
}
function renderChrome() {
  $('#q').placeholder = `Search ${games.length} games`;
  document.querySelectorAll('[data-legal]').forEach(a => a.setAttribute('href', legalHref(a.dataset.legal)));
  $('#about').textContent = 'gameplay, ' + games.length + ' games';
}
function markSide() {
  const on = view === 'game' ? (cur ? cur.g.id : pend ? pend.id : null) : sel;
  document.querySelectorAll('#slist .srow').forEach(a => a.classList.toggle('sel', a.dataset.id === on));
  document.querySelectorAll('#grid .card').forEach(a => a.classList.toggle('sel', view === 'home' && a.dataset.id === sel));
}
function select(id, scroll) {
  sel = id;
  const g = byId.get(id), p = $('#play');
  p.disabled = !g; p.textContent = g ? 'Play ' + g.title : 'Select a game';
  markSide();
  if (scroll === 'grid') { const el = document.querySelector('#grid [data-id="' + id + '"]'); if (el) el.scrollIntoView({ block: 'center', behavior: S.prefs.motion ? 'instant' : 'smooth' }); }
}
function toAll(smooth) { requestAnimationFrame(() => $('#all').scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })); }
function changeState(mut, o = {}) {
  mut();
  if (view !== 'home') { go(homeHref(), false); return; }
  syncUrl(true);
  renderResults();
  if (o.scroll) toAll(true);
}
function toggleFilter(k, v) {
  let on = false;
  changeState(() => { if (state[k].has(v)) state[k].delete(v); else { state[k].add(v); on = true; } });
  track('filter', { k, v, on, n: lastList.length });
}

function openLegal(k) {
  closeGame();
  showView('legal');
  const d = LEGAL[k];
  $('#doc').innerHTML = `<h1>${d[0]}</h1><p class="upd">Last updated 18 October 2026</p>${d[1]}`;
  document.querySelectorAll('.ltabs a').forEach(a => a.setAttribute('aria-current', a.dataset.legal === k ? 'page' : 'false'));
  setHead(d[0] + ' | gameplay', d[0] + ' for gameplay.', '/' + k);
  scrollTo({ top: 0, behavior: 'instant' });
}

const MENUS = { filters: ['#fpanel', '#fbtn'], friends: ['#fmodal', '#abtn'], profile: ['#pmenu', '#pbtn'], settings: ['#smenu', '#sbtn'], mprofile: ['#prmodal'], mstats: ['#stmodal'], msettings: ['#semodal'], msignout: ['#sgmodal'], cookies: ['#ckmodal'], mauth: ['#aumodal'], msupport: ['#tkmodal'] };
let openK = null;
const motionOK = () => !S.prefs.motion && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
function vis(el, on) {
  clearTimeout(el._vt);
  if (on) { el.classList.remove('out'); el.hidden = false; return; }
  if (el.hidden) return;
  if (!motionOK()) { el.classList.remove('out'); el.hidden = true; return; }
  el.classList.add('out');
  el._vt = setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, 170);
}
function countUp(box) {
  const els = box ? [...box.querySelectorAll('[data-n]')] : [];
  if (!els.length || !motionOK()) return;
  const f = el => el.dataset.f === 'd' ? fmtDur : el.dataset.f === 'l' ? x => Math.round(x).toLocaleString(adLang()) : x => String(Math.round(x));
  const t0 = performance.now() + 80, D = 700;
  els.forEach(el => { el.textContent = f(el)(0); });
  const step = t => {
    let more = false;
    els.forEach((el, i) => {
      if (!el.isConnected) return;
      const k = Math.max(0, Math.min(1, (t - t0 - Math.min(i, 8) * 60) / D)), s = f(el)(+el.dataset.n * (1 - Math.pow(1 - k, 3)));
      if (el.textContent !== s) el.textContent = s;
      if (k < 1) more = true;
    });
    if (more) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function setOpen(k) {
  if (auLocked() && (openK === 'mauth' || k !== 'mauth')) { if (openK !== 'mauth') auGate(); return; }
  openK = openK === k ? null : k;
  Object.keys(MENUS).forEach(m => { const on = m === openK; const el = $(MENUS[m][0]); if (el) vis(el, on); if (MENUS[m][1]) $(MENUS[m][1]).setAttribute('aria-expanded', String(on)); });
  const modal = !!openK && /modal/.test(MENUS[openK][0]);
  document.body.classList.toggle('modal-open', modal);
  if (openK && (modal || openK === 'filters') && cur && !PAUSE.on && canPause()) setPause(true);
  if (openK) track('ui', { open: openK });
  if (openK === 'mprofile') fillProfile();
  if (openK === 'mstats') renderStats();
  if (openK === 'profile' || openK === 'msettings') renderProfileBits();
  if (openK === 'friends') renderFriends();
  if (openK === 'cookies') { const b = $('#ckan'); b.classList.toggle('on', consent ? anOk() : true); b.setAttribute('aria-checked', String(b.classList.contains('on'))); }
  if (openK === 'filters') renderPanel();
  if (openK === 'mauth') auShow();
  if (openK === 'msupport') adSupport();
  fbtnState();
  ckPlace();
}
function closeAll() { if (openK) setOpen(openK); }
function showPane(p) {
  document.querySelectorAll('.pane').forEach(x => { const on = x.dataset.pane === p; if (on && !x.hidden && !x.closest('[hidden]')) { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; } x.hidden = !on; });
  document.querySelectorAll('#snav button').forEach(b => b.setAttribute('aria-current', String(b.dataset.p === p)));
}

const PKEY = 'gameplay:profile';
function getProfile() { try { const o = JSON.parse(localStorage.getItem(PKEY)); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
function setProfile(patch) {
  const o = Object.assign(getProfile(), patch);
  try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch (e) {}
  renderProfileBits();
  track('profile', { fields: Object.keys(patch).join(',') });
}
const USER_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
function renderProfileBits() {
  const p = getProfile(), un = String(p.username || '').trim(), dn = String(p.displayName || '').trim(), name = dn || un;
  document.querySelectorAll('[data-pic]').forEach(el => { if (name) el.textContent = name[0].toUpperCase(); else el.innerHTML = USER_ICON; });
  document.querySelectorAll('[data-pname]').forEach(el => { el.textContent = name || 'Guest'; });
  document.querySelectorAll('[data-psub]').forEach(el => { el.textContent = un ? '@' + un : SB.user ? SB.user.email || 'Signed in' : 'Not signed in'; });
  document.querySelectorAll('[data-pun]').forEach(el => { el.textContent = un ? '@' + un : 'No username yet'; });
}
function fillProfile() {
  renderProfileBits();
  const p = Object.assign({}, getProfile());
  if (SB.user) p.username = SB.prof && SB.prof.username || '';
  $('#pcun').textContent = p.username ? '@' + p.username : 'No username yet';
  $('#pcsince').textContent = 'Player since ' + new Date(S.since).toLocaleDateString('en', { month: 'long', year: 'numeric' });
  $('#pcg').textContent = $('#pcg').dataset.n = Object.keys(S.plays).filter(id => byId.has(id)).length;
  $('#pcr').textContent = $('#pcr').dataset.n = Object.keys(S.best).filter(id => byId.has(id)).length;
  countUp($('#prmodal'));
  $('#un').value = p.username || '';
  $('#dn').value = p.displayName || '';
  $('#unedit').textContent = p.username ? 'Change' : 'Choose';
  say('unnote', ''); say('dnnote', '');
}
function say(id, m, ok) { const n = $('#' + id); n.textContent = m; n.className = 'note' + (ok ? ' ok' : ''); }
let unStep = 1, unPending = '';
function unClose() { if (SB.user && SB.prof && !SB.prof.username) return; const m = $('#unmodal'); m.hidden = true; m.classList.remove('un-must'); }
function renderFriends() { frOpen(); }
const fmtDur = s => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + 'h ' + m + 'm' : m ? m + 'm' : s + 's'; };
function ago(t) {
  if (!t) return '—';
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 864e5);
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'Last week' : new Date(t).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
function renderStats() {
  if (SB.user && !SY.at && !SB.fail) { $('#stbody').innerHTML = '<div class="tiles" aria-hidden="true">' + '<div class="tile"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-blk"></i><i class="sk sk-blk2"></i>'; return; }
  const ids = Object.keys(S.plays).filter(id => byId.has(id));
  const plays = ids.reduce((n, id) => n + S.plays[id], 0), time = Object.keys(S.time).filter(id => byId.has(id)).reduce((n, id) => n + S.time[id], 0);
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const wk = days.map(d => S.daily[dayKey(d)] || { s: 0, p: 0 }), wkS = wk.reduce((n, x) => n + x.s, 0), wkP = wk.reduce((n, x) => n + x.p, 0);
  const played = Object.keys(S.daily).filter(k => S.daily[k].s > 0 || S.daily[k].p > 0);
  let streak = 0;
  for (let i = 0; i < 400; i++) { const d = new Date(); d.setDate(d.getDate() - i); const x = S.daily[dayKey(d)]; if (x && (x.s > 0 || x.p > 0)) streak++; else if (i > 0) break; }
  const max = Math.max(1, ...wk.map(x => x.s));
  const top = Object.keys(S.time).filter(id => byId.has(id) && S.time[id] >= 1).sort((a, b) => S.time[b] - S.time[a]).slice(0, 5);
  const tmax = top.length ? S.time[top[0]] : 1;
  const recs = Object.keys(S.best).filter(id => byId.has(id)).sort((a, b) => (S.last[b] || 0) - (S.last[a] || 0));
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  $('#stbody').innerHTML = `<div class="tiles"><div class="tile" style="--i:0"><small>Games played</small><b data-n="${plays}">${plays}</b><em>+${wkP} this week</em></div><div class="tile" style="--i:1"><small>Time played</small><b data-n="${Math.round(time)}" data-f="d">${fmtDur(time)}</b><em>+${fmtDur(wkS)} this week</em></div><div class="tile" style="--i:2"><small>Records</small><b data-n="${recs.length}">${recs.length}</b><em>in ${ids.length} ${ids.length === 1 ? 'game' : 'games'} played</em></div><div class="tile" style="--i:3"><small>Days played</small><b data-n="${played.length}">${played.length}</b><em>Current streak: ${streak}</em></div></div>
<div class="two"><div class="grp"><h4>Playtime this week</h4><div class="wk">${wk.map((x, i) => `<div${i === 6 ? ' class="hi"' : ''} style="--i:${i}"><i style="height:${Math.round(x.s / max * 100)}%"></i>${DN[days[i].getDay()]}</div>`).join('')}</div></div>
<div class="grp"><h4>Most played</h4>${top.length ? `<div class="tg">${top.map((id, i) => `<div style="--i:${i}"><b>${esc(byId.get(id).title)}</b><i style="--w:${Math.max(4, Math.round(S.time[id] / tmax * 100))}%"></i><span>${fmtDur(S.time[id])}</span></div>`).join('')}</div>` : '<div class="nofr">No games played yet</div>'}</div></div>
<div class="grp"><h4>Personal records</h4>${recs.length ? `<div class="tw"><table class="rec"><thead><tr><th>Game</th><th>Best</th><th>Played</th><th>Last</th></tr></thead><tbody>${recs.map((id, i) => { const g = byId.get(id); return `<tr style="--i:${Math.min(i, 14)}"><td>${esc(g.title)}</td><td>${esc(fmt(g, S.best[id]))}</td><td>${S.plays[id] || 0}</td><td>${ago(S.last[id])}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="nofr">No records yet</div>'}</div>`;
  countUp($('#stbody'));
}

function applyTheme() {
  const t = S.prefs.theme || 'light', r = document.documentElement;
  if (t === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t);
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
  const dark = t === 'dark' || (t === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#12101f' : '#f6f4ff');
}
function swVal(k) {
  if (k === 'sound') return !S.muted;
  if (k === 'analytics') return anOk();
  if (k === 'thumbs') return thumbsOn();
  if (k === 'motion') return !!S.prefs.motion;
  if (k === 'p_game') return S.prefs.p_game !== false;
  if (k === 'n_inv' || k === 'n_req' || k === 'n_msg' || k === 'n_game') return S.prefs[k] !== false;
  return !!S.prefs[k];
}
function syncSwitches() {
  document.querySelectorAll('[data-sw]').forEach(b => { const on = swVal(b.dataset.sw); b.classList.toggle('on', on); if (b.getAttribute('role') === 'switch') b.setAttribute('aria-checked', String(on)); });
  document.querySelectorAll('[data-sel]').forEach(s => { if (S.prefs[s.dataset.sel]) s.value = S.prefs[s.dataset.sel]; });
}
function setSwitch(k) {
  const v = !swVal(k);
  if (k === 'sound') { setMuted(!v); if (v) sfx('tap'); }
  else if (k === 'analytics') setConsent(v);
  else {
    S.prefs[k] = v; save(); if (k === 'p_game') rtTrack();
    if (k === 'motion') document.documentElement.classList.toggle('rm', v);
    if (k === 'thumbs') { document.documentElement.classList.toggle('nothumb', !v); coverCache.clear(); if (view === 'home') renderHome(); else if (cur || pend) { const g = (cur && cur.g) || pend; $('#pThumb').innerHTML = img(g, true); $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join(''); renderSide(lastList); } }
  }
  track('setting', { k, v });
  syncSwitches();
}
function setMuted(m) {
  S.muted = m; save();
  document.querySelectorAll('[data-sound]').forEach(b => b.setAttribute('aria-pressed', String(!m)));
  syncSwitches();
}
function resetRecords() {
  S.best = {}; S.plays = {}; S.recent = []; S.time = {}; S.daily = {}; S.last = {}; save();
  if (SB.on) { SY.base = { p: {}, t: {}, b: {} }; SY.pend = null; SY.saves = {}; sySave(); }
  games.forEach(g => { try { localStorage.removeItem('gameplay:save:' + g.id); } catch (e) {} });
  if (view === 'home') renderHome(); else if (cur) setBest(cur.g);
}
function downloadData(extra) {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gameplay:') && k !== 'gameplay:gate') { const v = localStorage.getItem(k); try { out[k] = JSON.parse(v); } catch (e) { out[k] = v; } } } } catch (e) {}
  if (extra) out.account = extra;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
  a.download = 'gameplay-data-' + dayKey() + '.json';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function deleteData() {
  try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('gameplay:') && k !== 'gameplay:gate') ks.push(k); } ks.forEach(k => localStorage.removeItem(k)); } catch (e) {}
  try { sessionStorage.removeItem('gameplay:sid'); } catch (e) {}
  if (SB.on) { try { [SB_STORE, SB_STORE + '-code-verifier', SB_STORE + '-user'].forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  S = { best: {}, plays: {}, recent: [], muted: false };
  setTimeout(() => location.reload(), 600);
}

let fromPop = false, progNav = false, navFromHome = false;
function route() {
  const pop = fromPop; fromPop = false;
  const loc = parseLocation();
  if (loc.legal) return openLegal(loc.legal);
  if (auLocked() && (loc.game || loc.admin)) { SB.blk = 1; closeGame(); showView('home'); renderHome(); auGate(); return; }
  if (loc.admin) return adRoute();
  if (loc.game) {
    const g = loc.game;
    if (view !== 'game') navFromHome = view === 'home' && !pop; else if (!(cur && cur.g === g) && !(pend && pend.id === g.id)) navFromHome = false;
    if (loc.code) { invite = { id: g.id, code: loc.code.toUpperCase() }; history.replaceState(null, '', href(g.id)); if (cur && cur.g === g) return restartCurrent(); }
    return openGame(g);
  }
  const wasGame = view === 'game';
  closeGame();
  const changed = showView('home');
  applyLocState(loc.state);
  if (loc.missing) { history.replaceState(null, '', homeHref()); toast('That game is not available any more'); track('error', { where: 'route', msg: 'missing game', game: loc.missing }); }
  renderHome();
  if (changed && motionOK()) { const gr = $('#grid'); gr.classList.remove('anim'); void gr.offsetWidth; gr.classList.add('anim'); clearTimeout(gr._at); gr._at = setTimeout(() => gr.classList.remove('anim'), 1400); }
  setHead(BASE_TITLE, BASE_DESC, '/');
  if (loc.toAll) toAll(!changed);
  else scrollTo({ top: changed && wasGame && pop ? homeY : 0, behavior: 'instant' });
}
const wideQuery = window.matchMedia ? window.matchMedia('(min-width: 900px)') : { matches: true };
const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement || null;
function fsEnter() {
  track('fullscreen', { game: cur ? cur.g.id : pend ? pend.id : null });
  const rq = gamebox.requestFullscreen || gamebox.webkitRequestFullscreen;
  if (rq && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    try { const r = rq.call(gamebox, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => { gamebox.classList.add('pfs'); fsSync(); }); return; } catch (e) {}
  }
  gamebox.classList.add('pfs'); fsSync();
}
function fsExit() {
  if (gamebox.classList.contains('pfs')) { gamebox.classList.remove('pfs'); fsSync(); return; }
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  if (fsEl() && ex) { try { const r = ex.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
}
function fsSync() {
  const on = fsEl() === gamebox || gamebox.classList.contains('pfs');
  if (on === gamebox.classList.contains('fs')) return;
  gamebox.classList.toggle('fs', on); gamebox.classList.remove('fs-ui');
  document.body.classList.toggle('fs-on', on);
  soPlace();
  document.querySelectorAll('[data-fs]').forEach(b => { b.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen'); b.title = on ? 'Exit fullscreen' : 'Fullscreen'; });
  clearInterval(fitTimer);
  frame.classList.add('no-anim');
  if (on) { frame.style.transform = ''; fsScale = 1; fsT = [0, 0]; requestAnimationFrame(() => requestAnimationFrame(() => { fitStage(); frame.classList.remove('no-anim'); })); fitTimer = setInterval(() => { if (!document.hidden) fitStage(); }, 1500); }
  else { $('#stage').style.height = ''; frame.style.transform = ''; fsScale = 1; fsT = [0, 0]; applyGlScale(1); requestAnimationFrame(() => { frame.classList.remove('no-anim'); startFitTimer(); queueFit(); }); }
  frame.focus({ preventScroll: true });
}
const toStage = () => { let y = 0; for (let el = gamebox; el; el = el.offsetParent) y += el.offsetTop; scrollTo({ top: Math.max(0, y), behavior: 'instant' }); };
function syncTheater() {
  const on = S.theater !== false;
  gamebox.classList.toggle('theater', (on && wideQuery.matches) || shortQuery.matches);
  document.querySelectorAll('[data-theater]').forEach(b => b.setAttribute('aria-pressed', String(on)));
  queueFit();
}

function boot() {
  const rank = g => g.info.rank;
  games.sort((a, b) => rank(a) - rank(b));
  const css = games.map(g => g.css || '').join('\n');
  if (css.trim()) { const st = document.createElement('style'); st.textContent = css; document.head.append(st); }
  buildIndex();
  renderChrome(); setMuted(S.muted); applyTheme(); renderProfileBits(); syncSwitches();
  document.documentElement.classList.toggle('rm', !!S.prefs.motion);
  document.documentElement.classList.toggle('nothumb', !thumbsOn());
  if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', applyTheme); }
  history.scrollRestoration = 'manual';
  if (!consent) $('#ckbar').hidden = false;
  const dv = device();
  let ref = '';
  try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
  track('session', Object.assign(dv, { ref: ref === location.hostname ? '' : ref, returning: Date.now() - S.since > 864e5, gated: !!LZ.key, path: PATH_MODE, games: games.length }));
  addEventListener('error', e => { if (errN++ > 20) return; track('error', { where: 'window', msg: String(e.message || '').slice(0, 160), src: String(e.filename || '').split('/').pop().slice(0, 40), line: e.lineno || 0, game: cur ? cur.g.id : null }); });
  addEventListener('unhandledrejection', e => { if (errN++ > 20) return; const r = e.reason; track('error', { where: 'promise', msg: String(r && r.message || r).slice(0, 160), game: cur ? cur.g.id : null }); });
  document.addEventListener('visibilitychange', () => { ttSync(); if (document.visibilityState === 'hidden') { trHidden(); ttCommit(true); anSave(); anFlush(); } });
  addEventListener('pagehide', () => { trEnd(); ttCommit(true); track('session_end', { sec: Math.round((Date.now() - T0) / 1000) }); anSave(); anFlush(); });
  setInterval(() => { if (cur) ttCommit(false); }, 15000);
  setInterval(anFlush, 30000);

  const q = $('#q');
  q.addEventListener('input', () => {
    changeState(() => { state.q = q.value; state.sort = state.sort === 'rel' && !q.value.trim() ? '' : state.sort; });
    const top = $('#all').getBoundingClientRect().top + scrollY - 70;
    if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    clearTimeout(searchT);
    const v = norm(q.value);
    if (v) searchT = setTimeout(() => track('search', { q: v.slice(0, 60), n: lastList.length }), 900);
  });
  q.addEventListener('focus', () => { if (openK === 'filters' || openK === 'profile' || openK === 'settings') closeAll(); });
  ['keydown', 'keyup'].forEach(t => q.addEventListener(t, e => e.stopPropagation()));
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('#grid .card'); if (first && state.q.trim()) { clickSrc = 'search'; track('search_go', { q: norm(state.q).slice(0, 60), game: first.dataset.id }); go(first.getAttribute('href'), false); q.blur(); } }
    if (e.key === 'Escape') { q.value = ''; changeState(() => { state.q = ''; }); q.blur(); }
  });
  document.querySelectorAll('.modal, .menu, .ckbar').forEach(el => ['keydown', 'keyup'].forEach(t => el.addEventListener(t, e => { if (e.key !== 'Escape') e.stopPropagation(); })));
  let warmT = 0;
  const warm = e => {
    const a = e.target.closest && e.target.closest('[data-id]'), h = a && byId.get(a.dataset.id);
    if (h && h.is3d) loadThree().catch(() => {});
    clearTimeout(warmT);
    if (h && !h.mount) { if (e.type === 'mouseover') warmT = setTimeout(() => lzPrefetch(h), 80); else lzPrefetch(h); }
  };
  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm, { passive: true });
  ['fbtn', 'abtn', 'sbtn', 'pbtn'].forEach((id, i) => $('#' + id).addEventListener('click', e => { e.stopPropagation(); setOpen(['filters', 'friends', 'settings', 'profile'][i]); }));
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('.g-root')) { if (openK) closeAll(); return; }
    if (openK && !t.closest('.menu, .mc, [data-go], [data-cookieset], [data-legal], #unmodal')) { const was = openK; closeAll(); if (!/modal/.test(MENUS[was][0]) && t.closest('a[href], button')) { e.preventDefault(); return; } }
    if (t.closest('.am-back') && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); if (navFromHome) history.back(); else go(homeHref(), false); return; }
    const lg = t.closest('[data-legal]');
    if (lg && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); if (openK) closeAll(); if (!$('#unmodal').hidden) unClose(); go(legalHref(lg.dataset.legal), false); return; }
    if (t.closest('[data-cookieset]')) { e.stopPropagation(); if (openK !== 'cookies') setOpen('cookies'); return; }
    const ck = t.closest('[data-ck]');
    if (ck) { const k = ck.dataset.ck; setConsent(k === 'accept' ? true : k === 'reject' ? false : $('#ckan').classList.contains('on')); if (openK === 'cookies') closeAll(); toast('Cookie choice saved'); return; }
    const gob = t.closest('[data-go]');
    if (gob) { e.stopPropagation(); const k = gob.dataset.go; if (openK !== k) setOpen(k); if (gob.dataset.pane) showPane(gob.dataset.pane); return; }
    if (t.closest('[data-close]')) { closeAll(); return; }
    const ckb = t.closest('#ckan');
    if (ckb) { e.stopPropagation(); ckb.classList.toggle('on'); ckb.setAttribute('aria-checked', String(ckb.classList.contains('on'))); return; }
    const sw = t.closest('[data-sw]');
    if (sw) { e.stopPropagation(); setSwitch(sw.dataset.sw); return; }
    if (t.closest('#snd')) { setSwitch('sound'); return; }
    const sg = t.closest('.seg button');
    if (sg) { e.stopPropagation(); S.prefs.theme = sg.dataset.t; save(); applyTheme(); track('setting', { k: 'theme', v: sg.dataset.t }); return; }
    const soon = t.closest('[data-soon]');
    if (soon) { toast(soon.dataset.soon + ' is coming soon'); track('soon', { what: soon.dataset.soon }); return; }
    const a = t.closest('a[href]');
    const tile = t.closest('a[data-id]');
    if (tile && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      const src = tile.dataset.src || 'link', id = tile.dataset.id;
      const pos = [...tile.parentNode.children].indexOf(tile);
      if (src === 'side' && view === 'home') { e.preventDefault(); track('tile_click', { game: id, src, pos, select: true }); select(id, 'grid'); return; }
      track('tile_click', { game: id, src, pos });
      clickSrc = src;
    }
    if (a && PATH_MODE && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== '_blank' && !a.hasAttribute('download')) {
      const u = a.getAttribute('href');
      if (u === '#' || a.hasAttribute('data-home')) { e.preventDefault(); resetState(); $('#q').value = ''; sel = null; go('/', false); return; }
      if (u.startsWith('/')) { e.preventDefault(); const gm = a.dataset.genre; if (gm) { resetState(); state.g.add(gm); go(homeHref(), false); toAll(false); } else go(u, false); return; }
    }
    if (a && !PATH_MODE && a.hasAttribute('data-home')) { e.preventDefault(); resetState(); $('#q').value = ''; sel = null; go('#/', false); return; }
    const fb = t.closest('[data-f]');
    if (fb) { e.stopPropagation(); toggleFilter(fb.dataset.f, fb.dataset.v); return; }
    const sb = t.closest('[data-sort]');
    if (sb) { e.stopPropagation(); const v = sb.dataset.sort; changeState(() => { state.sort = v === defSort() ? '' : v; }); track('sort', { v }); return; }
    const x = t.closest('[data-x]');
    if (x) { const [k, v] = x.dataset.x.split(':'); if (k === 's') changeState(() => { state.sort = ''; }); else toggleFilter(k, v); return; }
    if (a && !PATH_MODE && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && a.target !== '_blank') { const u = a.getAttribute('href'); if (u && u[0] === '#' && u !== location.hash) progNav = true; }
  });
  $('#slist').addEventListener('dblclick', e => { const r = e.target.closest('.srow'); if (r && view === 'home') { clickSrc = 'side'; go(href(r.dataset.id), false); } });
  $('#play').addEventListener('click', () => { if (sel && byId.get(sel)) { clickSrc = 'side_play'; go(href(sel), false); } });
  $('#clear').addEventListener('click', e => { e.stopPropagation(); changeState(() => { FKEYS.forEach(k => state[k].clear()); state.sort = ''; }); track('filter_clear', {}); });
  $('#apply').addEventListener('click', e => { e.stopPropagation(); closeAll(); });
  $('#reset').addEventListener('click', () => { changeState(() => { resetState(); $('#q').value = ''; }); });
  $('#snav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showPane(b.dataset.p); });
  showPane('account');
  document.querySelectorAll('.sech').forEach(b => b.addEventListener('click', () => { const g = $('#' + b.dataset.sec), c = g.classList.toggle('collapsed'); b.setAttribute('aria-expanded', String(!c)); }));
  document.querySelectorAll('[data-sel]').forEach(s => s.addEventListener('change', () => { S.prefs[s.dataset.sel] = s.value; save(); track('setting', { k: s.dataset.sel, v: s.value }); rtTrack(); }));
  $('#dnsave').addEventListener('click', () => { const v = $('#dn').value.trim().replace(/\s+/g, ' '); if (!v) { say('dnnote', 'Enter a display name.'); return; } if (SB.user) { auDisplayName(v.slice(0, 24)); return; } setProfile({ displayName: v.slice(0, 24) }); say('dnnote', 'Display name saved.', 1); });
  $('#dn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#dnsave').click(); } });
  $('#unedit').addEventListener('click', () => { unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true; $('#unt').textContent = $('#un').value ? 'Change username' : 'Choose a username'; $('#uncont').textContent = 'Continue'; $('#unew').value = $('#un').value; say('unerr', ''); $('#unmodal').hidden = false; $('#unew').focus(); $('#unew').select(); });
  $('#uncont').addEventListener('click', () => {
    if (SB.user) { auUsername(); return; }
    if (unStep === 1) {
      const v = $('#unew').value.trim();
      if (!/^[A-Za-z0-9_.-]{3,20}$/.test(v)) { say('unerr', 'Use 3 to 20 letters, numbers, dots, dashes or underscores.'); return; }
      if (v === $('#un').value) { say('unerr', 'That is already your username.'); return; }
      if (!$('#un').value) { setProfile({ username: v }); fillProfile(); say('unnote', 'Username saved.', 1); unClose(); return; }
      unPending = v; $('#uno').textContent = $('#un').value; $('#unn').textContent = v;
      $('#un1').hidden = true; $('#un2').hidden = false; $('#unt').textContent = 'Are you sure?'; $('#uncont').textContent = 'Yes, change it'; unStep = 2;
    } else { setProfile({ username: unPending }); fillProfile(); say('unnote', 'Username changed.', 1); unClose(); }
  });
  $('#uncancel').addEventListener('click', unClose);
  $('#unew').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#uncont').click(); } });
  $('#unmodal').addEventListener('click', e => { e.stopPropagation(); if (e.target === e.currentTarget || e.target.closest('[data-unclose]')) unClose(); });
  $('#dosignout').addEventListener('click', () => { closeAll(); if (SB.user) { auSignOut(); return; } toast('Accounts are coming soon.'); track('soon', { what: 'sign_out' }); });
  $('#delc').addEventListener('input', e => { $('#delbtn').disabled = e.target.value !== 'DELETE'; });
  $('#delbtn').addEventListener('click', () => { say('delnote', 'Your data was deleted. Reloading…', 1); deleteData(); });
  $('#dl').addEventListener('click', async () => { let extra = null; if (SB.user) { say('datanote', 'Preparing your file…'); try { extra = await sbRest('rpc/export_my_data', { method: 'POST', body: {} }); } catch (e) { extra = { error: 'Could not download your account data. Try again later.' }; } } downloadData(extra); say('datanote', 'Your data file was downloaded.', 1); track('data_download', {}); });
  $('#rr').addEventListener('click', () => { const b = $('#rr'); if (b.dataset.c) { b.textContent = 'Reset'; delete b.dataset.c; b.classList.remove('dangerfill'); if (SB.user) { say('datanote', 'Resetting…'); auResetCloud().then(() => { resetRecords(); say('datanote', 'Your records were reset on this device and in your account.', 1); }, () => say('datanote', 'Could not reset your account records. Check your connection and try again.')); } else { resetRecords(); say('datanote', 'Your records were reset.', 1); } track('records_reset', {}); } else { b.dataset.c = '1'; b.textContent = 'Click again to confirm'; b.classList.add('dangerfill'); } });
  document.querySelectorAll('[data-sound]').forEach(b => b.addEventListener('click', () => { setMuted(!S.muted); b.blur(); if (!S.muted) sfx('tap'); }));
  const th = $('[data-theater]');
  th.addEventListener('click', () => { th.blur(); S.theater = S.theater === false; save(); syncTheater(); track('setting', { k: 'theater', v: S.theater }); });
  if (wideQuery.addEventListener) { wideQuery.addEventListener('change', syncTheater); shortQuery.addEventListener('change', () => { syncTheater(); if (shortQuery.matches && view === 'game') toStage(); }); }
  document.querySelectorAll('[data-fs]').forEach(b => b.addEventListener('click', () => { b.blur(); if (gamebox.classList.contains('fs')) fsExit(); else fsEnter(); }));
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => { if (!fsEl() && gamebox.classList.contains('pfs')) return; fsSync(); }));
  let fsUiT = 0;
  gamebox.addEventListener('pointermove', e => { if (!gamebox.classList.contains('fs') || e.pointerType === 'touch') return; if (!gamebox.classList.contains('fs-ui')) gamebox.classList.add('fs-ui'); clearTimeout(fsUiT); fsUiT = setTimeout(() => gamebox.classList.remove('fs-ui'), 2200); }, { passive: true });
  addEventListener('resize', queueFit);
  if (window.ResizeObserver) new ResizeObserver(() => { if (stageMode() !== 'off') queueFit(); }).observe(frame);
  startFitTimer();
  $('#pRestart').addEventListener('click', e => { e.currentTarget.blur(); restartCurrent(); track('restart', { game: cur ? cur.g.id : null }); });
  addEventListener('storage', e => { if (e.key === PKEY) renderProfileBits(); });
  addEventListener('keyup', e => { if (PAUSE.on && !isField(e.target) && !openK) e.stopImmediatePropagation(); }, true);
  const unmodal = $('#unmodal');
  addEventListener('keydown', e => {
    if (!unmodal.hidden) { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); unClose(); } return; }
    if (openK) { if (e.key === 'Escape' && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); closeAll(); } return; }
    if (e.key === 'Escape' && gamebox.classList.contains('pfs')) { e.preventDefault(); e.stopImmediatePropagation(); fsExit(); return; }
    if (e.key === '/' && !isField(e.target) && !cur && !pend && view === 'home') { e.preventDefault(); q.focus(); return; }
    if (!cur && !pend) return;
    if (PAUSE.on) {
      if (isField(e.target)) return;
      if (e.target.closest && e.target.closest('.g-pause') && (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab')) return;
      e.stopImmediatePropagation();
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) setPause(false); }
      return;
    }
    if (e.key === 'Escape' && !e.repeat && !isField(e.target) && canPause()) { e.preventDefault(); e.stopImmediatePropagation(); setPause(true); track('pause', { game: cur.g.id }); return; }
    if (ov && (e.key === 'Enter' || e.key === ' ') && !isField(e.target) && !(e.target.closest && e.target.closest('.top, .side, .play-bar, .ckbar'))) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat && performance.now() - ov.at > 600) ov.fire();
      return;
    }
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isField(e.target)) e.preventDefault();
  }, true);
  if (PATH_MODE) addEventListener('popstate', () => { fromPop = true; route(); });
  else addEventListener('hashchange', () => { fromPop = !progNav; progNav = false; route(); });
  if (PATH_MODE && !location.pathname.replace(/\//g, '') && /^#\/[\w-]/.test(location.hash)) history.replaceState(null, '', '/' + location.hash.slice(2));
  route();
  lzIdle();
  auBoot();
  adBoot();
  soBoot();
  inBoot();
  trBoot();
  siteBoot();
  if (S.recent.some(id => byId.get(id) && byId.get(id).is3d)) { const warmUp = () => loadThree().catch(() => {}); if (window.requestIdleCallback) requestIdleCallback(warmUp, { timeout: 4000 }); else setTimeout(warmUp, 1500); }
}

function gpNetWrap(g, net) {
  if (!net || typeof net !== 'object' || net.__gpt) return net;
  try {
    ['room', 'lobby'].forEach(k => {
      const f = net[k];
      if (typeof f !== 'function') return;
      net[k] = function (...a) {
        const r = f.apply(this, a);
        if (r && typeof r.then === 'function') r.then(v => { if (!v) return; const pl = v.players; track('online_party', { game: g.id, kind: k, role: typeof v === 'string' ? v : v.role || null, size: v.size || (k === 'lobby' ? 2 : null), players: Array.isArray(pl) ? pl.length : typeof pl === 'number' ? pl : null }); }, () => {});
        return r;
      };
    });
    net.__gpt = 1;
  } catch (e) {}
  return net;
}

['load', 'error'].forEach(t => document.addEventListener(t, e => { const m = e.target; if (m && m.tagName === 'IMG') m.classList.add('ld'); }, true));
const SB_STORE = 'sb-gameplay-auth', SYK = 'gameplay:sync', VIDK = 'gameplay:vid', SAVE_P = 'gameplay:save:';
const UN_RE = /^[a-z0-9_.]{3,20}$/, GID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sbBase = () => PATH_MODE ? location.origin + '/' : location.origin + location.pathname;
const sbRedirect = kind => sbBase() + '?gpauth=' + kind;
const SB_RET = (() => {
  if (!SB.on) return null;
  try {
    const u = new URL(location.href), q = u.searchParams;
    if (!q.has('gpauth')) return null;
    const hp = new URLSearchParams(/^#[a-z_]+=/.test(location.hash) ? location.hash.slice(1) : '');
    const r = { kind: q.get('gpauth'), code: q.get('code'), err: q.get('error_description') || q.get('error') || hp.get('error_description') || hp.get('error') };
    ['gpauth', 'code', 'error', 'error_code', 'error_description', 'state'].forEach(k => q.delete(k));
    let back = null;
    try { back = sessionStorage.getItem('gameplay:authback'); sessionStorage.removeItem('gameplay:authback'); } catch (e) {}
    const qs = q.toString();
    let url = u.pathname + (qs ? '?' + qs : '') + (hp.toString() ? '' : u.hash);
    if (back && back.charAt(0) === '/' && back.charAt(1) !== '/' && (PATH_MODE || back.split('#')[0].split('?')[0] === u.pathname)) url = back;
    history.replaceState(null, '', url);
    return r;
  } catch (e) { return null; }
})();
const syNew = () => ({ base: { p: {}, t: {}, b: {} }, saves: {}, pend: null, uid: null, at: 0 });
let SY = syNew();
if (SB.on) { try { const o = JSON.parse(localStorage.getItem(SYK)); if (o && typeof o === 'object' && o.base && typeof o.base === 'object') { SY = Object.assign(syNew(), o); ['p', 't', 'b'].forEach(k => { if (!SY.base[k] || typeof SY.base[k] !== 'object') SY.base[k] = {}; }); if (!SY.saves || typeof SY.saves !== 'object') SY.saves = {}; } } catch (e) {} }
function sySave() { if (!SB.on) return; try { localStorage.setItem(SYK, JSON.stringify(SY)); } catch (e) {} }
const syNum = v => typeof v === 'number' && isFinite(v) ? v : 0;
const syUuid = () => {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
};
function syHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + '.' + s.length; }
const utf8Len = s => { try { return new TextEncoder().encode(s).length; } catch (e) { return s.length * 3; } };
const sbHasSession = () => { try { return !!localStorage.getItem(SB_STORE); } catch (e) { return false; } };
const sbTok = () => { const s = SB.session; return s && s.access_token && (!s.expires_at || s.expires_at * 1000 > Date.now() + 20000) ? s.access_token : null; };

function sbLib() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  if (SB.lib) return SB.lib;
  return SB.lib = new Promise((res, rej) => {
    const urls = [libUrl(SUPABASE_JS_FILE)].concat(SUPABASE_JS);
    const tryAt = i => {
      if (i >= urls.length) { SB.lib = null; rej(new Error('Sign-in could not load')); return; }
      const s = document.createElement('script');
      s.src = urls[i]; s.async = true; s.crossOrigin = 'anonymous';
      if (SUPABASE_SRI) s.integrity = SUPABASE_SRI;
      s.onload = () => { if (window.supabase && window.supabase.createClient) res(window.supabase); else { s.remove(); tryAt(i + 1); } };
      s.onerror = () => { s.remove(); tryAt(i + 1); };
      document.head.append(s);
    };
    tryAt(0);
  });
}
function sbClient() {
  if (SB.p) return SB.p;
  const p = SB.p = sbLib().then(lib => {
    if (!SB.c) {
      SB.c = lib.createClient(SBN.best(), SUPABASE_ANON_KEY, { global: { fetch: SBN.fetch }, realtime: SBN.WS ? { transport: SBN.WS } : {}, auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: SB_STORE } });
      SB.c.auth.onAuthStateChange((ev, s) => setTimeout(() => auSession(ev, s), 0));
    }
    return SB.c;
  });
  p.catch(() => { if (SB.p === p) SB.p = null; });
  return p;
}
async function sbRest(path, o = {}) {
  let tok = null;
  if (o.auth !== false && SB.c) {
    if (o.keep) tok = sbTok();
    else { try { const r = await SB.c.auth.getSession(); tok = r && r.data && r.data.session ? r.data.session.access_token : null; } catch (e) { tok = sbTok(); } }
  }
  const h = { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Accept: 'application/json' };
  if (tok) h.Authorization = 'Bearer ' + tok;
  else if (/^eyJ/.test(SUPABASE_ANON_KEY)) h.Authorization = 'Bearer ' + SUPABASE_ANON_KEY;
  if (o.prefer) h.Prefer = o.prefer;
  const body = o.body === undefined ? undefined : JSON.stringify(o.body);
  const r = await SBN.fetch(SBN.url('/rest/v1/' + path), { method: o.method || 'GET', headers: h, body, keepalive: !!o.keep && (!body || body.length < 60000), credentials: 'omit', cache: 'no-store' });
  if (!r.ok) {
    let j = null;
    try { j = await r.json(); } catch (e) {}
    const err = new Error((j && (j.message || j.msg || j.error)) || 'HTTP ' + r.status);
    err.status = r.status; err.code = j && j.code;
    throw err;
  }
  if (r.status === 204) return null;
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

function sbVid() {
  try {
    const st = ckStore();
    let v = st.getItem(VIDK);
    if (!/^[a-z0-9]{4,40}$/.test(v || '')) { v = (rid() + rid()).replace(/[^a-z0-9]/g, '').slice(0, 32); st.setItem(VIDK, v); }
    return v;
  } catch (e) { return null; }
}
function sbRow(x, uid, vid, dv) {
  const p = x.p && typeof x.p === 'object' && !Array.isArray(x.p) ? x.p : {};
  const js = JSON.stringify(p);
  const props = utf8Len(js) + 4 * Object.keys(p).length > 3600 ? { truncated: true, keys: Object.keys(p).slice(0, 24).join(',').slice(0, 300) } : p;
  const sid = String(x.s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);
  const ev = String(x.e || '').toLowerCase().replace(/[^a-z0-9_]+/g, '_').slice(0, 40);
  if (sid.length < 4 || !ev) return null;
  const t = syNum(x.t), at = t > 0 && t < 8.6e15 ? t : Date.now();
  return { client_at: new Date(at).toISOString(), session_id: sid, visitor_id: vid, user_id: uid && x.u === uid ? uid : null, event: ev, game_id: typeof p.game === 'string' && GID_RE.test(p.game) ? p.game : null, props, device: dv };
}
async function sbSink(batch) {
  const uid = SB.user && sbTok() ? SB.user.id : null;
  const vid = sbVid(), dv = device().type;
  const rows = batch.map(x => sbRow(x, uid, vid, dv)).filter(Boolean);
  if (!rows.length) return;
  try { await sbRest('analytics_events', { method: 'POST', body: rows, prefer: 'return=minimal', auth: !!uid, keep: true }); }
  catch (e) { if (e.status === 400 || e.status === 409 || e.status === 413 || e.status === 422) return; throw e; }
}

function syRows() {
  const B = SY.base, rows = [];
  new Set([...Object.keys(S.plays), ...Object.keys(S.time), ...Object.keys(S.best)]).forEach(id => {
    if (!GID_RE.test(id)) return;
    const dp = Math.max(0, Math.floor(syNum(S.plays[id]) - syNum(B.p[id])));
    const dt = Math.max(0, Math.floor((syNum(S.time[id]) - syNum(B.t[id])) * 10) / 10);
    const b = S.best[id], nb = typeof b === 'number' && isFinite(b) && Math.abs(b) < 1e15 && b !== B.b[id] ? b : null;
    if (!dp && dt < 1 && nb == null) return;
    const g = byId.get(id), last = syNum(S.last[id]);
    rows.push({ game_id: id, plays: Math.min(dp, 100000), seconds: Math.min(dt, 604800), best: nb, better: g && g.better === 'low' ? 'low' : 'high', last_played: last > 0 ? new Date(Math.min(last, Date.now())).toISOString() : null });
  });
  return rows.slice(0, 300);
}
function syAck(pend) {
  const B = SY.base;
  (pend.rows || []).forEach(r => {
    B.p[r.game_id] = syNum(B.p[r.game_id]) + syNum(r.plays);
    B.t[r.game_id] = syNum(B.t[r.game_id]) + syNum(r.seconds);
    if (r.best != null) B.b[r.game_id] = r.best;
  });
}
function syApply(sent, rows) {
  const B = SY.base, sentBy = {}, srv = {};
  sent.forEach(r => { sentBy[r.game_id] = r; });
  rows.forEach(r => { if (r && typeof r.game_id === 'string' && GID_RE.test(r.game_id)) srv[r.game_id] = r; });
  const ids = new Set([...Object.keys(S.plays), ...Object.keys(S.time), ...Object.keys(S.best), ...Object.keys(B.p), ...Object.keys(B.t), ...Object.keys(B.b), ...Object.keys(srv)]);
  ids.forEach(id => {
    const r = srv[id], s = sentBy[id] || {};
    const sp = r ? syNum(r.plays) : 0, st = r ? syNum(r.seconds_played) : 0;
    const up = Math.max(0, syNum(S.plays[id]) - syNum(B.p[id]) - syNum(s.plays));
    const ut = Math.max(0, syNum(S.time[id]) - syNum(B.t[id]) - syNum(s.seconds));
    if (sp + up > 0) S.plays[id] = sp + up; else delete S.plays[id];
    if (st + ut > 0) S.time[id] = st + ut; else delete S.time[id];
    if (sp) B.p[id] = sp; else delete B.p[id];
    if (st) B.t[id] = st; else delete B.t[id];
    const lb = S.best[id], rb = r && typeof r.best_score === 'number' ? r.best_score : null;
    const g = byId.get(id), low = r ? r.best_better === 'low' : !!(g && g.better === 'low');
    const unsent = typeof lb === 'number' && lb !== B.b[id] && lb !== s.best;
    if (rb != null) { S.best[id] = unsent ? (low ? Math.min(lb, rb) : Math.max(lb, rb)) : rb; B.b[id] = rb; }
    else { if (!unsent) delete S.best[id]; delete B.b[id]; }
    if (r && r.last_played) { const t = Date.parse(r.last_played); if (t && t > syNum(S.last[id])) S.last[id] = t; }
  });
  const keep = id => S.plays[id] || S.time[id] || S.best[id] != null;
  S.recent = uniq(S.recent.concat(Object.keys(S.last).filter(id => S.last[id]))).filter(id => keep(id) && byId.has(id)).sort((a, b) => syNum(S.last[b]) - syNum(S.last[a])).slice(0, 8);
  save();
}
function syLocalSaves() {
  const out = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(SAVE_P)) { const id = k.slice(SAVE_P.length); if (GID_RE.test(id)) out[id] = localStorage.getItem(k); } } } catch (e) {}
  return out;
}
function syUpBody(uid, ids, loc) {
  const body = [], M = SY.saves;
  ids.forEach(id => {
    const s = loc[id];
    let data;
    try { data = JSON.parse(s); } catch (e) { return; }
    if (data === null || data === undefined) return;
    if (utf8Len(s) > 240000) { M[id] = Object.assign(M[id] || {}, { big: syHash(s) }); return; }
    body.push({ user_id: uid, game_id: id, data });
  });
  return body;
}
function sySavesKeep(uid) {
  const loc = syLocalSaves(), M = SY.saves;
  const ids = Object.keys(loc).filter(id => { const h = syHash(loc[id]), m = M[id]; return !(m && (m.h === h || m.big === h)); });
  const body = syUpBody(uid, ids, loc);
  if (!body.length || JSON.stringify(body).length > 50000) return;
  sbRest('game_saves?on_conflict=user_id,game_id', { method: 'POST', body, prefer: 'resolution=merge-duplicates,return=minimal', keep: true }).catch(() => {});
}
async function sySaves(uid) {
  const loc = syLocalSaves(), M = SY.saves, now = Date.now();
  Object.keys(loc).forEach(id => {
    const h = syHash(loc[id]), m = M[id];
    if (!m) M[id] = { h: '', at: 0, d: syNum(S.last[id]) || 1 };
    else if (m.h === h) m.d = 0;
    else if (!m.d) m.d = now;
  });
  const remote = await sbRest('game_saves?select=game_id,updated_at');
  if (!SB.user || SB.user.id !== uid) return;
  const R = {};
  (remote || []).forEach(r => { const t = Date.parse(r.updated_at); if (r && GID_RE.test(r.game_id) && t) R[r.game_id] = t; });
  const up = [], down = [];
  new Set([...Object.keys(loc), ...Object.keys(R), ...Object.keys(M)]).forEach(id => {
    const m = M[id], has = id in loc, h = has ? syHash(loc[id]) : '', r = R[id];
    if (has && m && m.big === h) return;
    const dirty = has && (!m || m.h !== h), rnew = !!r && (!m || r > syNum(m.at) + 1);
    if (dirty && rnew) { const lt = (m && m.d) || syNum(S.last[id]); (lt >= r ? up : down).push(id); }
    else if (dirty) up.push(id);
    else if (rnew) down.push(id);
    else if (!r && m && m.at && has && !dirty && !(cur && cur.g.id === id)) { try { localStorage.removeItem(SAVE_P + id); } catch (e) {} delete M[id]; }
    else if (!r && !has && m) delete M[id];
  });
  const dl = down.filter(id => !(cur && cur.g.id === id));
  if (dl.length) {
    const rows = await sbRest('game_saves?select=game_id,data,updated_at&game_id=in.(' + dl.join(',') + ')');
    (rows || []).forEach(r => {
      if (!r || !GID_RE.test(r.game_id)) return;
      const s = JSON.stringify(r.data);
      try { localStorage.setItem(SAVE_P + r.game_id, s); } catch (e) { return; }
      M[r.game_id] = { h: syHash(s), at: Date.parse(r.updated_at) || now, d: 0 };
    });
  }
  const body = syUpBody(uid, up, loc);
  for (let i = 0; i < body.length; i += 20) {
    const part = body.slice(i, i + 20);
    const res = await sbRest('game_saves?on_conflict=user_id,game_id&select=game_id,updated_at', { method: 'POST', body: part, prefer: 'resolution=merge-duplicates,return=representation' });
    (res || []).forEach(r => { if (r && loc[r.game_id] != null) M[r.game_id] = { h: syHash(loc[r.game_id]), at: Date.parse(r.updated_at) || now, d: 0 }; });
  }
}
function syRefresh(before) {
  if (JSON.stringify(S.recent) !== before && view === 'home' && !cur && !pend) renderHome();
  if (cur) setBest(cur.g);
  if (openK === 'mstats') renderStats();
  if (openK === 'mprofile') { $('#pcg').textContent = Object.keys(S.plays).filter(id => byId.has(id)).length; $('#pcr').textContent = Object.keys(S.best).filter(id => byId.has(id)).length; }
}
function syNudge(ms = 4000) { if (!SB.user) return; clearTimeout(SB.t); SB.t = setTimeout(() => sySync(), ms); }
async function sySync(o = {}) {
  if (!SB.user || !SB.c) return;
  if (SB.syncing) { SB.again = true; return; }
  const uid = SB.user.id;
  if (o.keep && !sbTok()) return;
  SB.syncing = true; clearTimeout(SB.t);
  const before = JSON.stringify(S.recent);
  try {
    if (cur && !o.keep) ttCommit(false);
    if (SY.uid !== uid) { if (SY.pend && SY.pend.uid !== uid) syAck(SY.pend); SY.pend = null; SY.uid = uid; SY.saves = {}; SY.at = 0; }
    if (!SY.pend) { const rows = syRows(); if (rows.length) SY.pend = { id: syUuid(), uid, rows }; }
    sySave();
    if (o.keep) {
      sySavesKeep(uid);
      if (!SY.pend) return;
    }
    const sent = SY.pend;
    const res = await sbRest('rpc/sync_game_stats', { method: 'POST', body: { p_batch: sent ? sent.id : null, p_rows: sent ? sent.rows : [] }, keep: !!o.keep });
    if (!SB.user || SB.user.id !== uid) return;
    syApply(sent ? sent.rows : [], Array.isArray(res) ? res : []);
    if (SY.pend === sent) SY.pend = null;
    sySave();
    if (!o.keep) await sySaves(uid);
    SY.at = Date.now(); SB.fail = 0; sySave();
    syRefresh(before);
  } catch (e) {
    SB.fail = Math.min(SB.fail + 1, 6);
    sySave();
    if (SB.user && !o.keep) { clearTimeout(SB.t); SB.t = setTimeout(() => sySync(), 5000 * Math.pow(2, SB.fail)); }
  } finally {
    SB.syncing = false;
    if (SB.again) { SB.again = false; syNudge(1500); }
    if (openK === 'mstats' && $('#stbody .sk')) renderStats();
    auSyncNote();
  }
}

const auState = () => !SB.on ? 'off' : SB.user ? 'in' : 'out';
const auT = s => window.gpI18n ? gpI18n.t(s) : s;
const auLocked = () => SB.on && !SB.user && !SB.guest;
const auCoarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
function auMsg(id, m, kind) { const n = $('#' + id); if (!n) return; const set = () => { n.textContent = m || ''; n.className = 'note' + (kind ? ' ' + kind : ''); }; if (n.closest('#aucard') && (n.textContent || '') !== (m || '')) auMorph(set); else set(); }
function auShake(el) { if (!el) return; el.classList.remove('au-shake'); void el.offsetWidth; el.classList.add('au-shake'); }
function auErrText(e) {
  const m = String(e && (e.message || e.error_description || e) || ''), c = String(e && e.code || '');
  if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Wrong email, username or password.';
  if (c === 'email_not_confirmed' || /email not confirmed/i.test(m)) return 'Confirm your email first: type the code we sent you.';
  if (c === 'user_already_exists' || /already registered|already exists/i.test(m)) return 'An account with this email already exists. Log in instead.';
  if (c === 'same_password' || /different from the old/i.test(m)) return 'Choose a password that is different from your current one.';
  if (c === 'weak_password' || /password should/i.test(m)) return 'Choose a stronger password: at least 8 characters.';
  if (c === 'email_address_invalid' || /invalid format|email address .* is invalid/i.test(m)) return 'This email address is not valid.';
  if (c === 'email_exists' || /email address has already been registered/i.test(m)) return 'Another account already uses this email.';
  if (c === 'otp_expired' || /expired|link is invalid/i.test(m)) return 'This link has expired or was already used. Ask for a new one.';
  if (c === 'over_email_send_rate_limit' || /email rate limit|after \d+ seconds/i.test(m)) return 'Too many emails were sent. Wait a minute and try again.';
  if (/rate limit|too many|429/i.test(m + c) || (e && e.status === 429)) return 'Too many attempts. Wait a few minutes and try again.';
  if (/not authorized|email_address_not_authorized/i.test(m + ' ' + c)) return 'We cannot send emails to this address yet. Try again later.';
  if (c === 'provider_disabled' || /provider is not enabled|unsupported provider/i.test(m)) return 'This sign-in method is not available yet.';
  if (/access_denied|cancel/i.test(m)) return 'Sign-in was cancelled.';
  if (/failed to fetch|networkerror|load failed|could not load|network/i.test(m)) return 'Cannot reach the sign-in service. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}
function auSyncNote() {
  const el = $('#ausync');
  if (!el || !SB.user) return;
  el.textContent = SB.fail ? 'Waiting for a connection. Your progress is kept on this device until then.' : SY.at ? auT('Records and saves synced {t}.').replace('{t}', new Date(SY.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Your records and saves are kept in your account.';
}
function auRender() {
  const st = auState();
  document.querySelectorAll('[data-au]').forEach(el => { el.hidden = !el.dataset.au.split(' ').includes(st); });
  if (SB.user) {
    const u = SB.user, am = u.app_metadata || {}, provs = Array.isArray(am.providers) ? am.providers : [am.provider || 'email'];
    $('#auwho').textContent = u.email || 'Signed in';
    $('#auvia').textContent = provs.includes('google') ? (provs.includes('email') ? 'Google and email password' : 'Signed in with Google') : 'Signed in with email';
    if (document.activeElement !== $('#auem2')) $('#auem2').value = u.email || '';
    $('#aupwl').textContent = provs.includes('email') ? 'New password' : 'Set a password';
    auSyncNote();
  }
  renderProfileBits();
  if (openK === 'friends') frOpen();
}
function auGoogleUi() {
  const ok = !!(SB.on && !(SB.set && SB.set.external && SB.set.external.google === false));
  if (ok && gisWanted()) gisPaint();
  document.querySelectorAll('[data-auth="google"]').forEach(b => { if (!b.classList.contains('is-busy')) b.disabled = !ok; b.title = ok ? '' : 'Coming soon'; const em = b.querySelector('em'); if (em) em.hidden = ok; if (b.classList.contains('btn2')) b.textContent = ok ? 'Continue' : 'Coming soon'; });
}
function auSettings() {
  if (!SB.on || SB.set) return;
  if (!SB.gs) SB.gs = SBN.fetch(SBN.url('/auth/v1/settings'), { headers: { apikey: SUPABASE_ANON_KEY }, credentials: 'omit', cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(j => { SB.gs = null; if (j && j.external) { SB.set = j; auGoogleUi(); } });
}
const AU_ORD = ['in', 'up', 'reset', 'check', 'newpass', 'wait'], AU_E = 'cubic-bezier(.22,.8,.2,1)';
const auKey = v => v === 'main' ? (SB.mode === 'up' ? 'up' : 'in') : v;
const auNote = () => SB.view === 'main' ? (SB.mode === 'up' ? 'auupnote' : 'aunote') : { reset: 'arnote', newpass: 'annote', check: 'acnote' }[SB.view] || 'aunote';
function auSettle() {
  const c = $('#aucard');
  if (!c) return;
  clearTimeout(SB.mt);
  c.getAnimations().forEach(a => a.cancel());
  c.querySelectorAll('.au-v').forEach(v => { v.getAnimations().forEach(a => a.cancel()); if (v.classList.contains('au-out')) { v.hidden = true; v.classList.remove('au-out'); v.style.top = ''; } });
  c.classList.remove('au-morph');
}
function auMorph(fn) {
  const c = $('#aucard');
  if (!c || openK !== 'mauth' || !motionOK() || c.classList.contains('au-morph')) { fn(); return; }
  const h0 = c.offsetHeight;
  fn();
  const h1 = c.offsetHeight;
  if (Math.abs(h1 - h0) < 2) return;
  c.classList.add('au-morph');
  const a = c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 240, easing: AU_E });
  a.onfinish = a.oncancel = () => c.classList.remove('au-morph');
}
function auView(v) {
  SB.view = v;
  const k = auKey(v), c = $('#aucard');
  const from = c.querySelector('.au-v:not([hidden]):not(.au-out)'), to = c.querySelector('[data-auview="' + k + '"]');
  document.querySelectorAll('#aumodal .au-eye[aria-pressed="true"]').forEach(b => auEye(b, true));
  if (from !== to) {
    if (c.classList.contains('au-morph') || c.querySelector('.au-out')) auSettle();
    const anim = !!from && motionOK() && openK === 'mauth' && !$('#aumodal').hidden;
    const h0 = anim ? c.offsetHeight : 0, top = anim ? from.offsetTop : 0;
    c.querySelectorAll('.au-v').forEach(el => { el.hidden = el !== to; });
    if (anim) {
      const h1 = c.offsetHeight, d = AU_ORD.indexOf(k) > AU_ORD.indexOf(from.dataset.auview) ? 1 : -1;
      from.hidden = false; from.classList.add('au-out'); from.style.top = top + 'px';
      c.classList.add('au-morph');
      c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 320, easing: AU_E });
      from.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + (-d * 26) + 'px)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
      to.animate([{ opacity: 0, transform: 'translateX(' + (d * 26) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 290, delay: 60, easing: AU_E, fill: 'backwards' });
      SB.mt = setTimeout(auSettle, 360);
    }
  }
  auResendTick();
}
function auFocus() {
  const f = { newpass: '#anpass', reset: '#aremail', check: '#accode', main: SB.mode === 'up' ? '#auupemail' : '#auemail' }[SB.view], n = f && $(f);
  if (n && SB.on && !auCoarse() && openK === 'mauth') n.focus({ preventScroll: true });
}
function auDown() {
  let n = $('#audown');
  clearTimeout(SB.dt);
  if (!window.__gpSbDown || SB.user) {
    if (n) n.hidden = true;
    SB.df = 0;
    if (SB.guest && !SB.user) { SB.guest = false; if (cur || pend) { closeGame(); showView('home'); renderHome(); } toast('The sign-in service works again: log in or create an account to keep playing.'); auGate(); }
    return;
  }
  if (!SB.guest) {
    if (!n) {
      n = document.createElement('div'); n.id = 'audown'; n.className = 'au-off au-dn'; n.setAttribute('role', 'status');
      n.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><div><b>Cannot reach the sign-in service from this network yet.</b><span>It keeps trying in the background. If it lasts, </span><a target="_blank" rel="noopener">run a connection check</a><button class="btn2 au-gst" type="button" hidden>Play without an account for now</button></div>';
      n.querySelector('a').href = PATH_MODE ? '/check' : 'gameplay/check.html';
      n.querySelector('button').addEventListener('click', auGuest);
      $('#auoff').after(n);
    }
    n.hidden = false;
    n.querySelector('button').hidden = (SB.df || 0) < 2;
  }
  SB.dt = setTimeout(() => SBN.fetch(SBN.url('/auth/v1/health'), { headers: { apikey: SUPABASE_ANON_KEY }, cache: 'no-store', credentials: 'omit' }).catch(() => {}).then(() => { if (window.__gpSbDown) SB.df = (SB.df || 0) + 1; auSettings(); auDown(); }), SB.guest ? 20000 : 8000);
}
function auGuest() {
  if (!window.__gpSbDown || SB.user) return;
  SB.guest = true;
  track('auth', { act: 'guest' });
  closeAll();
  toast('You can play without an account until the sign-in service can be reached. Then you will need to log in.');
  auDown();
}
function auShow() {
  $('#auoff').hidden = SB.on;
  auDown();
  if (SB.on) { sbClient().catch(() => {}); auSettings(); if (gisWanted()) requestAnimationFrame(() => gisPaint()); }
  ['aunote', 'auupnote', 'arnote', 'annote', 'acnote'].forEach(id => auMsg(id, ''));
  document.querySelectorAll('#aumodal .au-err').forEach(e => auFieldErr(e.closest('.fld').querySelector('input'), ''));
  auView(['newpass', 'reset', 'check', 'wait'].includes(SB.view) ? SB.view : 'main');
  auBusy(false);
  setTimeout(auFocus, 80);
}
function auOpen(v, msg, kind, mode) {
  if (mode) SB.mode = mode;
  if (openK !== 'mauth') { SB.view = v; setOpen('mauth'); } else auView(v);
  if (msg) auMsg(auNote(), msg, kind);
}
function auBusy(on) {
  const m = $('#aumodal');
  document.querySelectorAll('#aumodal .au-card button, #aumodal .au-card input').forEach(b => { b.disabled = on || (!SB.on && !b.closest('[data-aumode]')); });
  m.classList.toggle('au-busy', !!on);
  m.querySelectorAll('.au-go.is-busy').forEach(b => b.classList.remove('is-busy'));
  const v = m.querySelector('.au-v:not([hidden]):not(.au-out)'), g = v && v.querySelector('.au-go');
  if (on && g) { g.classList.add('is-busy'); g.setAttribute('aria-busy', 'true'); } else m.querySelectorAll('.au-go[aria-busy]').forEach(b => b.removeAttribute('aria-busy'));
  if (!on) { auGoogleUi(); auResendTick(); }
}
function auFieldErr(inp, m) {
  if (!inp) return;
  const f = inp.closest('.fld');
  let e = f && f.querySelector('.au-err');
  if (!m && !e && !inp.hasAttribute('aria-invalid')) return;
  auMorph(() => {
    if (!m) { if (e) e.remove(); inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); return; }
    if (!e) { e = document.createElement('div'); e.className = 'au-err'; e.id = inp.id + '-err'; f.append(e); }
    e.textContent = m;
    inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', e.id);
  });
}
function auBad(id, m) {
  const n = $('#' + id);
  if (!n) return;
  auFieldErr(n, m);
  auShake(n.closest('.fld') || n);
  n.focus({ preventScroll: true });
}
function auGate() {
  if (!auLocked() || openK === 'mauth') return;
  if (openK) { const k = openK; openK = null; const el = $(MENUS[k][0]); if (el) vis(el, false); }
  const w = SB.rt || (!SB.chk && sbHasSession());
  if (w && !SB.gw) { SB.gw = 1; setTimeout(auGate, 250); return; }
  SB.view = w ? 'wait' : 'main';
  if (SB.view === 'main') SB.mode = SB.mode === 'up' ? 'up' : 'in';
  setOpen('mauth');
  clearTimeout(SB.gt);
  if (SB.view === 'wait') SB.gt = setTimeout(() => { if (auLocked() && openK === 'mauth' && SB.view === 'wait') { SB.rt = false; SB.chk = true; auView('main'); } }, 12000);
}
function auWait(on) {
  clearTimeout(SB.wt);
  document.documentElement.classList.toggle('au-wait', !!on);
  if (on) SB.wt = setTimeout(() => auWait(false), 10000);
}
async function auGoogle(b) {
  if (!SB.on) return;
  if (gisWanted()) { gisPaint(); return; }
  const inModal = openK === 'mauth';
  if (b) { b.classList.add('is-busy'); b.disabled = true; }
  if (inModal) auMsg(auNote(), '');
  try {
    try { sessionStorage.setItem('gameplay:authback', location.pathname + location.search + location.hash); } catch (e) {}
    const c = await sbClient();
    track('auth', { act: 'google' });
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: sbRedirect('google'), queryParams: { prompt: 'select_account' } } });
    if (error) throw error;
    setTimeout(() => { if (b) { b.classList.remove('is-busy'); auGoogleUi(); } }, 8000);
  } catch (e) {
    if (b) { b.classList.remove('is-busy'); auGoogleUi(); }
    if (inModal) auMsg(auNote(), auErrText(e), 'bad'); else toast(auErrText(e));
  }
}
const GIS = { p: null, n: '', on: false };
const gisWanted = () => !!(SB.on && SBN.best() !== SUPABASE_DIRECT && GOOGLE_CLIENT_ID && !(SB.set && SB.set.external && SB.set.external.google === false));
function gisLib() {
  if (window.google && google.accounts && google.accounts.id) return Promise.resolve(google.accounts.id);
  if (GIS.p) return GIS.p;
  return GIS.p = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = () => window.google && google.accounts && google.accounts.id ? res(google.accounts.id) : rej(new Error('Google sign-in could not load'));
    s.onerror = () => { s.remove(); GIS.p = null; rej(new Error('Google sign-in could not load')); };
    document.head.append(s);
  });
}
async function gisNonce() {
  const raw = rid() + rid() + rid() + rid();
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)));
  GIS.n = raw;
  return Array.from(h, b => b.toString(16).padStart(2, '0')).join('');
}
async function gisInit() {
  const id = await gisLib();
  id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: gisDone, nonce: await gisNonce(), ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, itp_support: true, context: 'signin' });
  GIS.on = true;
  return id;
}
async function gisPaint() {
  if (!gisWanted()) return;
  let id;
  try { id = GIS.on ? google.accounts.id : await gisInit(); } catch (e) { return; }
  document.querySelectorAll('[data-auth="google"]').forEach(b => {
    let w = b.nextElementSibling;
    if (!w || !w.classList.contains('au-gis')) { w = document.createElement('div'); w.className = 'au-gis' + (b.classList.contains('btn2') ? ' au-gis-s' : ''); b.after(w); }
    const wd = b.classList.contains('btn2') ? 200 : Math.round(Math.min(400, Math.max(200, (b.parentElement && b.parentElement.clientWidth) || b.offsetWidth || 340)));
    if (w.dataset.w === String(wd) && w.firstChild) { b.style.display = 'none'; return; }
    w.dataset.w = String(wd); w.textContent = '';
    try { id.renderButton(w, { type: 'standard', theme: 'outline', size: b.classList.contains('btn2') ? 'medium' : 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'center', width: wd }); b.style.display = 'none'; }
    catch (e) { w.remove(); b.style.display = ''; }
  });
}
async function gisDone(r) {
  const inModal = openK === 'mauth';
  if (inModal) auMsg(auNote(), '');
  auWait(true);
  try {
    if (!r || !r.credential) throw new Error('Google sign-in was cancelled');
    const c = await sbClient();
    track('auth', { act: 'google', via: 'relay' });
    SB.loud = true;
    const { error } = await c.auth.signInWithIdToken({ provider: 'google', token: r.credential, nonce: GIS.n });
    if (error) throw error;
  } catch (e) {
    SB.loud = false;
    auWait(false);
    if (inModal) auMsg(auNote(), auErrText(e), 'bad'); else toast(auErrText(e));
  }
  try { google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: gisDone, nonce: await gisNonce(), ux_mode: 'popup', auto_select: false, itp_support: true, context: 'signin' }); } catch (e) {}
}
const AU_REQ = [['8+ characters', v => v.length >= 8], ['1 letter', v => /\p{L}/u.test(v)], ['1 number', v => /\d/.test(v)]];
const auPwOk = v => AU_REQ.every(r => r[1](v));
function auReqs(inp) {
  const box = inp && document.querySelector('.au-reqs[data-for="' + inp.id + '"]');
  if (!box) return;
  [...box.children].forEach((el, i) => { const ok = AU_REQ[i][1](inp.value), was = el.classList.contains('ok'); el.classList.toggle('ok', ok); el.classList.toggle('pop', ok && !was); });
}
function auUserCheck() {
  clearTimeout(SB.ut);
  const inp = $('#auuser'), un = inp.value.trim();
  if (!SB.on || !un || !UN_RE.test(un) || /^\.|\.$|\.\./.test(un)) return;
  SB.ut = setTimeout(async () => {
    try {
      const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: un }, auth: false });
      if (inp.value.trim() !== un) return;
      auFieldErr(inp, free ? '' : 'That username is taken or not allowed. Try another one.');
    } catch (e) {}
  }, 350);
}
async function auLogin() {
  if (!SB.on) return;
  const id = $('#auemail').value.trim(), pw = $('#aupass').value;
  auMsg('aunote', '');
  if (!id) return auBad('auemail', 'Enter your email or username.');
  if (id.includes('@') && !EMAIL_RE.test(id)) return auBad('auemail', 'Enter a valid email address.');
  if (!pw) return auBad('aupass', 'Enter your password.');
  auBusy(true);
  let email = id;
  try {
    const c = await sbClient();
    if (!id.includes('@')) {
      const un = id.toLowerCase().replace(/^@/, '');
      email = UN_RE.test(un) ? await sbRest('rpc/login_email', { method: 'POST', body: { p_login: un, p_password: pw }, auth: false }) : null;
      if (!email) throw { code: 'invalid_credentials' };
    }
    SB.loud = true;
    const r = await c.auth.signInWithPassword({ email, password: pw });
    if (r.error) throw r.error;
    track('auth', { act: 'signin', by: id.includes('@') ? 'email' : 'username' });
    auWait(true);
    $('#aupass').value = ''; closeAll();
  } catch (e) {
    SB.loud = false;
    if (e && (e.code === 'email_not_confirmed' || /email not confirmed/i.test(e.message || ''))) { auCheck(email, 'signup', false); auMsg('acnote', 'Confirm your email first: type the code we sent you, or send a new one.', 'bad'); }
    else auMsg('aunote', auErrText(e), 'bad');
  }
  finally { auBusy(false); }
}
async function auSignup() {
  if (!SB.on) return;
  const id = $('#auupemail').value.trim(), id2 = $('#auupemail2').value.trim(), pw = $('#auuppass').value;
  const un = $('#auuser').value.trim().toLowerCase().replace(/^@/, '');
  auMsg('auupnote', '');
  if (!EMAIL_RE.test(id)) return auBad('auupemail', 'Enter a valid email address.');
  if (id.toLowerCase() !== id2.toLowerCase()) return auBad('auupemail2', 'The two email addresses do not match.');
  if (!UN_RE.test(un) || /^\.|\.$|\.\./.test(un)) return auBad('auuser', 'Choose a username: 3 to 20 lowercase letters, numbers, dots or underscores.');
  if (!auPwOk(pw)) return auBad('auuppass', 'Use at least 8 characters with 1 letter and 1 number.');
  auBusy(true);
  try {
    const c = await sbClient();
    const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: un }, auth: false });
    if (!free) { auBusy(false); auBad('auuser', 'That username is taken or not allowed. Try another one.'); return; }
    const lp = getProfile(), data = { username: un };
    if (lp.displayName) data.display_name = String(lp.displayName).slice(0, 32);
    SB.loud = true;
    const r = await c.auth.signUp({ email: id, password: pw, options: { emailRedirectTo: sbRedirect('signup'), data } });
    if (r.error) throw r.error;
    const u = r.data && r.data.user;
    if (u && Array.isArray(u.identities) && !u.identities.length) throw { code: 'user_already_exists' };
    track('auth', { act: 'signup' });
    $('#auuppass').value = ''; auReqs($('#auuppass'));
    if (r.data && r.data.session) { auWait(true); closeAll(); return; }
    SB.loud = false;
    auCheck(id, 'signup', true);
  } catch (e) { SB.loud = false; auMsg('auupnote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
function auCheck(email, kind, fresh) {
  const back = $('#auckback');
  SB.cmail = email; SB.ck = kind; SB.otpAt = fresh ? Date.now() : 0;
  if (fresh) SB.rsAt = Date.now() + 60000;
  $('#aucmail').textContent = email; $('#accode').value = ''; auMsg('acnote', '');
  document.querySelectorAll('#aumodal [data-cv]').forEach(e => { e.hidden = e.dataset.cv !== kind; });
  if (kind === 'recovery') { back.removeAttribute('data-aumode'); back.dataset.auv = 'reset'; }
  else { back.removeAttribute('data-auv'); back.dataset.aumode = SB.mode === 'up' ? 'up' : 'in'; }
  auView('check'); setTimeout(auFocus, 120);
}
function auResendTick() {
  clearTimeout(SB.rsT);
  const b = $('#auresend'), left = Math.ceil((syNum(SB.rsAt) - Date.now()) / 1000);
  if (!b || b.classList.contains('is-busy')) return;
  const s = b.firstElementChild;
  if (left > 0 && SB.view === 'check') { b.disabled = true; s.textContent = auT('Resend code in {n} s').replace('{n}', left); SB.rsT = setTimeout(auResendTick, 1000); }
  else { b.disabled = !SB.on; s.textContent = 'Resend code'; }
}
async function auResend() {
  if (!SB.on || !SB.cmail || syNum(SB.rsAt) > Date.now()) return;
  const b = $('#auresend');
  b.disabled = true; b.classList.add('is-busy'); auMsg('acnote', '');
  try {
    const c = await sbClient();
    const { error } = SB.ck === 'recovery' ? await c.auth.resetPasswordForEmail(SB.cmail, { redirectTo: sbRedirect('recovery') }) : await c.auth.resend({ type: 'signup', email: SB.cmail, options: { emailRedirectTo: sbRedirect('signup') } });
    if (error) throw error;
    SB.rsAt = Date.now() + 60000; SB.otpAt = Date.now(); $('#accode').value = '';
    track('auth', { act: 'resend' });
    auMsg('acnote', 'Sent again. Use the code in the newest email: the old code no longer works.', 'ok');
  } catch (e) { auMsg('acnote', auErrText(e), 'bad'); }
  finally { b.classList.remove('is-busy'); auResendTick(); }
}
async function auVerify() {
  if (!SB.on || !SB.cmail) return;
  const code = $('#accode').value.replace(/\D/g, '');
  auMsg('acnote', '');
  if (code.length !== 6) return auBad('accode', 'Type the 6-digit code from the email.');
  auBusy(true);
  let bad = '';
  try {
    const c = await sbClient();
    const rec = SB.ck === 'recovery';
    SB.loud = !rec; SB.rec = rec;
    const { error } = await c.auth.verifyOtp({ email: SB.cmail, token: code, type: rec ? 'recovery' : 'signup' });
    if (error) throw error;
    track('auth', { act: 'verify', kind: rec ? 'recovery' : 'signup' });
    $('#accode').value = '';
    if (rec) { SB.rec = false; $('#anuser').value = SB.cmail; auView('newpass'); setTimeout(auFocus, 120); }
    else { auWait(true); closeAll(); }
  } catch (e) {
    SB.loud = false; SB.rec = false;
    const m = String(e && (e.message || e) || ''), k = String(e && e.code || '');
    if (k === 'otp_expired' || /expired|invalid/i.test(m)) {
      bad = !SB.otpAt ? 'This code is wrong or has expired. Check the newest email, or click Resend code.' : Date.now() - SB.otpAt > 3600000 ? 'This code has expired. Click Resend code to get a new one.' : 'Wrong code. Check the newest email and try again.';
    } else auMsg('acnote', auErrText(e), 'bad');
  }
  finally { auBusy(false); if (bad) auBad('accode', bad); }
}
async function auReset() {
  if (!SB.on) return;
  const email = $('#aremail').value.trim();
  auMsg('arnote', '');
  if (!EMAIL_RE.test(email)) return auBad('aremail', 'Enter a valid email address.');
  auBusy(true);
  try {
    const c = await sbClient();
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: sbRedirect('recovery') });
    if (error) throw error;
    track('auth', { act: 'reset' });
    auCheck(email, 'recovery', true);
    auMsg('acnote', 'If an account uses this email, we sent it a code.', 'ok');
  } catch (e) { auMsg('arnote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auNewPass() {
  if (!SB.on) return;
  const pw = $('#anpass').value;
  auMsg('annote', '');
  if (!auPwOk(pw)) return auBad('anpass', 'Use at least 8 characters with 1 letter and 1 number.');
  if (pw !== $('#anpass2').value) return auBad('anpass2', 'The two passwords are not the same.');
  auBusy(true);
  try {
    const c = await sbClient();
    const { error } = await c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#anpass').value = ''; $('#anpass2').value = ''; auReqs($('#anpass')); SB.view = 'main';
    auMsg('annote', 'Password saved. You are logged in.', 'ok');
    setTimeout(() => { if (openK === 'mauth') closeAll(); }, 1400);
  } catch (e) { auMsg('annote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auChangeEmail() {
  const email = $('#auem2').value.trim();
  if (!EMAIL_RE.test(email)) { auMsg('auemnote', 'Enter a valid email address.', 'bad'); return; }
  if (SB.user && email.toLowerCase() === String(SB.user.email || '').toLowerCase()) { auMsg('auemnote', 'That is already your email address.', 'bad'); return; }
  const b = $('#auemsave'); b.disabled = true; b.classList.add('is-busy'); auMsg('auemnote', 'Sending…');
  try {
    const { error } = await SB.c.auth.updateUser({ email }, { emailRedirectTo: sbRedirect('email') });
    if (error) throw error;
    auMsg('auemnote', 'Check your inbox: open the link we sent to confirm the change. You may get a link at your old address too.', 'ok');
  } catch (e) { auMsg('auemnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auChangePass() {
  const pw = $('#aupw2').value;
  if (pw.length < 8) { auMsg('aupwnote', 'Use at least 8 characters.', 'bad'); return; }
  const b = $('#aupwsave'); b.disabled = true; b.classList.add('is-busy'); auMsg('aupwnote', 'Saving…');
  try {
    const { error } = await SB.c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#aupw2').value = '';
    auMsg('aupwnote', 'Password saved.', 'ok');
  } catch (e) { auMsg('aupwnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auSignOut() {
  if (!SB.c) return;
  toast('Signing out…');
  try { await Promise.race([sySync(), new Promise(r => setTimeout(r, 4000))]); } catch (e) {}
  try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
  track('auth', { act: 'signout' });
  toast('Signed out.');
}
async function auDeleteAccount() {
  const b = $('#adelbtn'); b.disabled = true; b.classList.add('is-busy'); auMsg('adelnote', 'Deleting your account…');
  try {
    const r = await sbRest('rpc/delete_my_account', { method: 'POST', body: {} });
    SY = syNew(); sySave();
    try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
    $('#adelc').value = ''; b.classList.remove('is-busy');
    auMsg('adelnote', '');
    closeAll();
    toast(r === 'requested' ? 'Your account will be deleted.' : 'Your account was deleted.');
  } catch (e) { auMsg('adelnote', 'Could not delete your account. Check your connection and try again.', 'bad'); b.disabled = false; b.classList.remove('is-busy'); }
}
async function auResetCloud() {
  const uid = SB.user.id;
  await sbRest('game_stats?user_id=eq.' + uid, { method: 'DELETE' });
  await sbRest('game_saves?user_id=eq.' + uid, { method: 'DELETE' });
  SY.base = { p: {}, t: {}, b: {} }; SY.pend = null; SY.saves = {}; sySave();
}
const AU_SEL = 'id,username,display_name,avatar_url,created_at';
async function auLoadProfile() {
  const uid = SB.user.id;
  let rows = await sbRest('profiles?select=' + AU_SEL + '&id=eq.' + uid);
  let p = rows && rows[0];
  if (!p) {
    const m = SB.user.user_metadata || {}, dn = String(m.full_name || m.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 32);
    try { rows = await sbRest('profiles?select=' + AU_SEL, { method: 'POST', body: { id: uid, display_name: dn || null }, prefer: 'return=representation' }); }
    catch (e) { rows = await sbRest('profiles?select=' + AU_SEL + '&id=eq.' + uid); }
    p = rows && rows[0];
  }
  if (!p || !SB.user || SB.user.id !== uid) return;
  SB.prof = p;
  const loc = getProfile();
  if (!p.display_name && loc.displayName) {
    try { const r = await sbRest('profiles?id=eq.' + uid + '&select=' + AU_SEL, { method: 'PATCH', body: { display_name: String(loc.displayName).slice(0, 32) }, prefer: 'return=representation' }); if (r && r[0]) SB.prof = r[0]; } catch (e) {}
  }
  auToLocal();
  const t = Date.parse(p.created_at);
  if (t && t < syNum(S.since)) { S.since = t; save(); }
}
function auToLocal() {
  const p = SB.prof;
  if (!p) return;
  const loc = getProfile(), o = Object.assign({}, loc);
  if (p.username) o.username = p.username;
  if (p.display_name) o.displayName = p.display_name;
  if (o.username !== loc.username || o.displayName !== loc.displayName) { try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch (e) {} }
  renderProfileBits();
}
function auChoose() {
  if (!SB.user || !SB.prof || SB.prof.username || !$('#unmodal').hidden) return;
  SB.choosing = true;
  unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true;
  $('#unt').textContent = 'Choose a username'; $('#uncont').textContent = 'Save';
  $('#unmodal').classList.add('un-must');
  const sug = String(getProfile().username || '').toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20);
  $('#unew').value = UN_RE.test(sug) ? sug : '';
  $('label[for="unew"]').textContent = 'Username';
  auMsg('unerr', 'Friends find you by your username: 3 to 20 lowercase letters, numbers, dots or underscores.');
  $('#unmodal').hidden = false;
  if (!auCoarse()) $('#unew').focus();
}
async function auUsername() {
  const raw = unStep === 2 ? unPending : $('#unew').value.trim().toLowerCase();
  if (!UN_RE.test(raw) || /^\.|\.$|\.\./.test(raw)) { auMsg('unerr', 'Use 3 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); return; }
  const old = SB.prof && SB.prof.username;
  if (raw === old) { auMsg('unerr', 'That is already your username.', 'bad'); return; }
  if (unStep === 1 && old) {
    unPending = raw; $('#uno').textContent = old; $('#unn').textContent = raw;
    $('#un1').hidden = true; $('#un2').hidden = false; $('#unt').textContent = 'Are you sure?'; $('#uncont').textContent = 'Yes, change it'; unStep = 2;
    return;
  }
  const b = $('#uncont'), back = m => { unStep = 1; $('#un1').hidden = false; $('#un2').hidden = true; $('#unt').textContent = old ? 'Change username' : 'Choose a username'; $('#uncont').textContent = old ? 'Continue' : 'Save'; auMsg('unerr', m, 'bad'); };
  b.disabled = true; b.classList.add('is-busy');
  try {
    const free = await sbRest('rpc/username_available', { method: 'POST', body: { p_name: raw } });
    if (!free) { back('That username is taken or not allowed. Try another one.'); return; }
    const r = await sbRest('profiles?id=eq.' + SB.user.id + '&select=' + AU_SEL, { method: 'PATCH', body: { username: raw }, prefer: 'return=representation' });
    if (r && r[0]) SB.prof = r[0]; else if (SB.prof) SB.prof.username = raw;
    setProfile({ username: raw });
    SB.choosing = false;
    unClose();
    if (openK === 'mprofile') fillProfile();
    say('unnote', old ? 'Username changed.' : 'Username saved.', 1);
    if (!old) toast('Welcome, @' + raw);
  } catch (e) {
    back(e.code === '23505' ? 'That username is taken. Try another one.' : e.code === '23514' ? 'That username is not allowed.' : 'Could not save. Check your connection and try again.');
  } finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auDisplayName(v) {
  const b = $('#dnsave'); b.disabled = true; b.classList.add('is-busy');
  try {
    const r = await sbRest('profiles?id=eq.' + SB.user.id + '&select=' + AU_SEL, { method: 'PATCH', body: { display_name: v }, prefer: 'return=representation' });
    if (r && r[0]) SB.prof = r[0];
    setProfile({ displayName: v });
    say('dnnote', 'Display name saved.', 1);
  } catch (e) { say('dnnote', 'Could not save. Check your connection and try again.'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function auSignedIn(ev) {
  const uid = SB.user.id, loud = SB.loud;
  SB.loud = false;
  SB.prof = null;
  FR.list = FR.req = null;
  auRender();
  if (openK === 'mauth' && SB.view !== 'newpass' && !SB.rec) closeAll();
  if (SB.blk && openK !== 'mauth') { SB.blk = 0; route(); }
  try { await auLoadProfile(); } catch (e) {}
  auWait(false);
  if (!SB.user || SB.user.id !== uid) return;
  auRender();
  adCheck();
  soStart();
  siteSignedIn();
  if (loud) toast(auT('Logged in as {name}').replace('{name}', SB.prof && SB.prof.username ? '@' + SB.prof.username : SB.user.email || 'you'));
  sySync();
  if (SB.prof && !SB.prof.username) setTimeout(auChoose, loud ? 400 : 0);
}
function auSignedOut() {
  SB.prof = null; SB.fail = 0;
  FR.list = FR.req = FR.res = null; FR.rq = '';
  clearTimeout(SB.t);
  if (SB.choosing && !$('#unmodal').hidden) unClose();
  SB.choosing = false;
  adSignedOut();
  soStop();
  siteSignedOut();
  auWait(false);
  auRender();
  if (cur || pend || view === 'game') go(homeHref(), true);
  SB.mode = 'in'; auGate();
}
function auSession(ev, s) {
  SB.session = s || null;
  const u = s && s.user || null, was = SB.user;
  if (u && was && u.id === was.id) { SB.user = u; if (ev === 'USER_UPDATED') auRender(); return; }
  SB.chk = true;
  if (!u) { auWait(false); if (openK === 'mauth' && SB.view === 'wait' && !SB.rt) auView('main'); }
  if (!u && !was) { auRender(); return; }
  SB.user = u;
  if (u) auSignedIn(ev); else auSignedOut();
}
async function auReturn() {
  const r = SB_RET;
  if (!r) return;
  if (r.err) { auOpen(r.kind === 'recovery' ? 'reset' : 'main', auErrText({ message: r.err }), 'bad', 'in'); return; }
  if (!r.code) return;
  SB.loud = r.kind !== 'recovery' && r.kind !== 'email';
  SB.rec = r.kind === 'recovery'; SB.rt = true;
  let error = null;
  try { const x = await SB.c.auth.exchangeCodeForSession(r.code); error = x.error; } catch (e) { error = e; }
  SB.rec = false; SB.rt = false;
  if (error) {
    SB.loud = false;
    auOpen(r.kind === 'recovery' ? 'reset' : 'main', r.kind === 'signup' ? 'Your email is probably confirmed already. Log in with your email or username and your password.' : r.kind === 'recovery' ? 'This link has expired or was opened in another browser. Ask for a new one.' : r.kind === 'email' ? 'Open the link in the browser where you are logged in, or log in again.' : 'Sign-in did not finish. Please try again.', 'bad', 'in');
    return;
  }
  track('auth', { act: 'return', kind: String(r.kind || '').slice(0, 12) });
  if (r.kind === 'recovery') { const em = SB.session && SB.session.user && SB.session.user.email; if (em) $('#anuser').value = em; auOpen('newpass'); }
  else { if (openK === 'mauth' && SB.view === 'wait') closeAll(); if (r.kind === 'email') toast('Your email address was updated'); }
}
const EYE = '<button class="au-eye" type="button" aria-label="Show password" aria-pressed="false"><svg viewBox="0 0 24 24"><g class="o"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></g><path class="c" d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg></button>';
function auEye(b, off) {
  const i = b.parentNode.querySelector('input'), on = !off && b.getAttribute('aria-pressed') !== 'true';
  i.type = on ? 'text' : 'password';
  b.setAttribute('aria-pressed', String(on));
  b.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
}
function lgOpen(k) {
  const d = LEGAL[k];
  if (!d) return;
  $('#lgt').textContent = d[0];
  $('#lgdoc').innerHTML = `<h1>${d[0]}</h1>${d[1]}`;
  const s = $('#lgsheet');
  s.hidden = false; s.scrollTop = 0;
  $('#lgback').focus({ preventScroll: true });
  track('ui', { open: 'legal_sheet', doc: k });
}
function lgClose() { $('#lgsheet').hidden = true; const f = !$('#ckbar').hidden ? $('#ckterms') : null; if (f && !f.closest('[hidden]') && !auCoarse()) f.focus({ preventScroll: true }); }
function ckPlace() {
  const ck = $('#ckbar'), inl = openK === 'mauth' && !ck.hidden && innerWidth <= 1140, w = $('#aumodal .au-wrap');
  if (inl === ck.classList.contains('ck-inline')) return;
  ck.classList.toggle('ck-inline', inl);
  if (inl) w.insertBefore(ck, w.querySelector('.au-foot')); else document.body.insertBefore(ck, $('#lgsheet'));
}
function ckChoose(k) {
  if (!$('#ckterms').checked) { auMsg('cknote', 'Tick the box first to agree to the Terms of Use and the Privacy Policy.', 'bad'); const a = $('#ckagree'); a.classList.add('ck-want'); auShake(a); $('#ckterms').focus({ preventScroll: true }); return; }
  const ck = $('#ckbar');
  if (motionOK() && !ck.classList.contains('ck-bye')) { ck.classList.add('ck-bye'); setTimeout(() => { ck.classList.remove('ck-bye'); setConsent(k !== 'essential', k); }, 220); }
  else setConsent(k !== 'essential', k);
  toast(k === 'all' ? 'Thanks! Cookie choice saved' : k === 'session' ? 'Saved for this visit only' : 'Cookie choice saved');
}
const FR = { q: '', seq: 0, t: 0, list: null, req: null, res: null, rq: '', rres: [] };
const SK_ROWS = '<div class="frow sk-row" aria-hidden="true"><i class="sk sk-pic"></i><div class="fr-n"><i class="sk sk-l1"></i><i class="sk sk-l2"></i></div></div>'.repeat(3);
function frRow(p, acts, hl) {
  const un = p.username || '', dn = p.display_name || un, n = Math.min(hl || 0, un.length);
  const u = n ? `<mark>${esc(un.slice(0, n))}</mark>${esc(un.slice(n))}` : esc(un);
  return `<div class="frow" role="listitem"><span class="pic">${esc((dn || '?').charAt(0).toUpperCase())}</span><div class="fr-n"><b>${esc(dn)}</b><span>@${u}</span></div><div class="fr-a">${acts}</div></div>`;
}
function frFill(box, rows, empty) {
  const old = new Set([...box.children].map(n => n.dataset.k));
  const t = document.createElement('template');
  t.innerHTML = rows.length ? rows.map(r => r[1]).join('') : empty;
  const nodes = [...t.content.children];
  if (rows.length) nodes.forEach((n, i) => { n.dataset.k = rows[i][0]; if (!old.has(rows[i][0])) { n.classList.add('fr-in'); n.style.setProperty('--i', Math.min(i, 12)); } });
  box.replaceChildren(...nodes);
}
function frDraw() {
  const q = FR.q, fl = FR.list || [], rq = FR.req || [];
  const isF = new Set(fl.map(x => x.username)), inc = new Map(), out = new Map();
  rq.forEach(r => (r.direction === 'incoming' ? inc : out).set(r.username, r));
  const searching = q.length >= 2;
  $('#g-res').hidden = !searching;
  if (searching) {
    const res = FR.res;
    $('#res-h').textContent = res == null ? auT('Searching…') : res.length >= 20 ? auT('{n}+ players').replace('{n}', 20) : res.length === 1 ? auT('1 player') : res.length ? auT('{n} players').replace('{n}', res.length) : auT('Players');
    if (!res) $('#fres').innerHTML = SK_ROWS;
    else frFill($('#fres'), res.map(p => [p.username, frRow(p, isF.has(p.username) ? '<span class="fr-tag">Friend</span>' : inc.has(p.username) ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+inc.get(p.username).id}">Accept</button>` : out.has(p.username) ? '<span class="fr-tag">Requested</span>' : `<button class="btn2 pri" type="button" data-fr="add" data-un="${esc(p.username)}">Add friend</button>`, q.length)]), `<div class="nofr">${esc(auT('No player has a username starting with “{q}”.').replace('{q}', q))}</div>`);
  }
  $('#g-req').hidden = searching || !rq.length;
  $('#req-n').textContent = rq.length;
  frFill($('#req-l'), rq.slice().sort((a, b) => (a.direction === 'incoming' ? 0 : 1) - (b.direction === 'incoming' ? 0 : 1)).map(r => ['r' + r.id, frRow(r, r.direction === 'incoming' ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+r.id}">Accept</button><button class="btn2" type="button" data-fr="decline" data-id="${+r.id}">Decline</button>` : `<span class="fr-tag">Sent</span><button class="btn2" type="button" data-fr="cancel" data-id="${+r.id}">Cancel</button>`)]), '');
  $('#g-fr').hidden = searching;
  $('#fr-n').textContent = fl.length;
  const fo = f => (soOn(f.friend_id) ? 2 : 0) + (DM.inbox.some(c => c.other_id === f.friend_id && c.unread) ? 1 : 0);
  frFill($('#fr-l'), fl.slice().sort((a, b) => fo(b) - fo(a)).map(f => ['f' + f.friend_id + (FR.open === f.friend_id ? 'o' : ''), soFriendRow(f)]), FR.list ? '<div class="nofr">No friends yet. Type a username above to find someone.</div>' : SK_ROWS);
  const pcf = $('#pcf'); if (pcf && FR.list) pcf.textContent = fl.length;
}
async function frLoad() {
  if (!SB.user) return;
  try {
    const [f, r] = await Promise.all([sbRest('rpc/my_friends', { method: 'POST', body: {} }), sbRest('rpc/my_friend_requests', { method: 'POST', body: {} })]);
    if (!SB.user) return;
    FR.list = Array.isArray(f) ? f : []; FR.req = Array.isArray(r) ? r : [];
    frDraw();
  } catch (e) { auMsg('anote', 'Could not load your friends. Check your connection and try again.', 'bad'); }
}
function frOpen() {
  const st = auState(), ok = st === 'in', inp = $('#fname');
  $('#frgate').hidden = ok;
  inp.disabled = !ok;
  if (!ok) {
    ['g-res', 'g-req', 'g-fr'].forEach(id => { $('#' + id).hidden = true; });
    $('#frgt').textContent = st === 'off' ? 'Friends are coming soon' : 'Log in to add friends';
    $('#frgs').textContent = st === 'off' ? 'Accounts are not switched on yet. Then you can find players by their username and add them as friends.' : 'Create a free account or log in, then find players by their username.';
    return;
  }
  FR.q = inp.value.trim().toLowerCase().replace(/^@/, '');
  frDraw(); frLoad();
  if (FR.q.length >= 2) frSearch();
  if (!auCoarse()) setTimeout(() => { if (openK === 'friends') inp.focus({ preventScroll: true }); }, 60);
}
function frInput() {
  const q = $('#fname').value.trim().toLowerCase().replace(/^@/, '');
  FR.q = q; auMsg('anote', '');
  clearTimeout(FR.t);
  if (q.length < 2) { FR.seq++; FR.res = null; frDraw(); if (q.length === 1) auMsg('anote', 'Type at least 2 letters.'); return; }
  if (!/^[a-z0-9_.]+$/.test(q)) { FR.seq++; FR.res = []; frDraw(); return; }
  if (FR.rq && q.startsWith(FR.rq) && FR.rres.length < 20) { FR.seq++; FR.res = FR.rres.filter(p => p.username.startsWith(q)); frDraw(); return; }
  if (FR.res) FR.res = FR.res.filter(p => p.username.startsWith(q));
  frDraw();
  FR.t = setTimeout(frSearch, 150);
}
async function frSearch() {
  const q = FR.q, my = ++FR.seq;
  if (!SB.user || q.length < 2) return;
  try {
    const r = await sbRest('rpc/search_profiles', { method: 'POST', body: { prefix: q } });
    if (my !== FR.seq) return;
    FR.rq = q; FR.rres = Array.isArray(r) ? r : []; FR.res = FR.rres;
    frDraw();
  } catch (e) { if (my === FR.seq) auMsg('anote', /too many/i.test(e.message || '') ? 'Too many searches. Wait a moment and try again.' : 'Could not search. Check your connection and try again.', 'bad'); }
}
async function frAct(k, b) {
  if (!SB.user) return;
  if (k === 'remove' && !b.dataset.c) { b.dataset.c = '1'; b.textContent = 'Click again to remove'; b.classList.add('dangerfill'); setTimeout(() => { if (b.isConnected) { delete b.dataset.c; b.textContent = 'Remove'; b.classList.remove('dangerfill'); } }, 4000); return; }
  b.disabled = true; b.classList.add('is-busy');
  const id = b.dataset.id, name = (b.closest('.frow').querySelector('.fr-n span') || {}).textContent || '';
  try {
    if (k === 'add') {
      const r = await sbRest('rpc/send_friend_request', { method: 'POST', body: { p_username: b.dataset.un } });
      toast(r === 'accepted' ? auT('You are now friends with {u}').replace('{u}', name) : r === 'sent' ? auT('Friend request sent to {u}').replace('{u}', name) : r === 'already_friends' ? 'You are already friends' : 'That player was not found');
      track('friend', { act: 'request', r: String(r || '') });
      FR.nudge = b.dataset.un;
    } else if (k === 'accept' || k === 'decline') {
      const rq = (FR.req || []).find(x => x.id === +id); if (rq && k === 'accept') FR.nudgeId = rq.other_id;
      const r = await sbRest('rpc/respond_friend_request', { method: 'POST', body: { p_id: +id, p_accept: k === 'accept' } });
      if (r === 'accepted') toast(auT('You are now friends with {u}').replace('{u}', name));
      track('friend', { act: k });
    } else if (k === 'cancel') {
      await sbRest('friend_requests?id=eq.' + (+id), { method: 'DELETE' });
      track('friend', { act: 'cancel' });
    } else if (k === 'remove') {
      await sbRest('rpc/remove_friend', { method: 'POST', body: { p_friend: id } });
      toast(auT('{u} was removed from your friends').replace('{u}', name));
      track('friend', { act: 'remove' });
    }
    await frLoad();
    if (FR.nudge) { const un = FR.nudge, o = (FR.req || []).find(x => x.username === un) || (FR.list || []).find(x => x.username === un); FR.nudge = null; if (o) rtSend(o.other_id || o.friend_id, { t: 'fr' }); }
    if (FR.nudgeId) { rtSend(FR.nudgeId, { t: 'fr' }); FR.nudgeId = null; }
    ntBadge();
  } catch (e) { b.disabled = false; b.classList.remove('is-busy'); auMsg('anote', 'Could not update. Check your connection and try again.', 'bad'); }
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const s = document.getElementById('lgsheet');
  if (s && !s.hidden) { e.preventDefault(); e.stopImmediatePropagation(); lgClose(); }
}, true);
function auBoot() {
  const ck = $('#ckbar'), ls = $('#lgsheet'), am = $('#aumodal'), fm = $('#fmodal');
  ck.addEventListener('click', e => {
    e.stopPropagation();
    const lg = e.target.closest('[data-aulegal]');
    if (lg) { e.preventDefault(); lgOpen(lg.dataset.aulegal); return; }
    const b = e.target.closest('[data-ckc]');
    if (b) ckChoose(b.dataset.ckc);
  });
  $('#ckterms').addEventListener('change', () => auMsg('cknote', ''));
  ls.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target === ls || e.target.closest('#lgback')) { lgClose(); return; }
    const lg = e.target.closest('[data-aulegal], [data-legal]');
    if (lg) { e.preventDefault(); lgOpen(lg.dataset.aulegal || lg.dataset.legal); }
  });
  ['keydown', 'keyup'].forEach(t => ls.addEventListener(t, e => { if (e.key !== 'Escape') e.stopPropagation(); }));
  const ckFit = () => { if (!ck.hidden) document.documentElement.style.setProperty('--ckh', (ck.offsetHeight + (innerWidth <= 600 ? 16 : 28)) + 'px'); };
  if (!ck.hidden) { document.documentElement.classList.add('ck-open'); ckFit(); if (window.ResizeObserver) new ResizeObserver(ckFit).observe(ck); else addEventListener('resize', ckFit); }
  addEventListener('resize', ckPlace);
  const req = AU_REQ.map(r => `<span class="au-req"><svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="5"/><path class="x" d="M3.5 3.5l3 3M6.5 3.5l-3 3"/><path class="k" d="M3 5.2l1.4 1.4L7.1 3.8"/></svg><span>${r[0]}</span></span>`).join('');
  document.querySelectorAll('#aumodal .au-reqs').forEach(b => { b.innerHTML = req; auReqs($('#' + b.dataset.for)); });
  document.querySelectorAll('#aumodal .au-pw').forEach(w => w.insertAdjacentHTML('beforeend', EYE));
  am.addEventListener('mousedown', e => { if (e.target.closest('.au-eye')) e.preventDefault(); });
  am.addEventListener('click', e => {
    const t = e.target, lg = t.closest('[data-aulegal]');
    if (lg) { e.preventDefault(); e.stopPropagation(); lgOpen(lg.dataset.aulegal); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const md = t.closest('[data-aumode]');
    if (md) { if (SB.mode !== md.dataset.aumode || SB.view !== 'main') { SB.mode = md.dataset.aumode; auMsg(SB.mode === 'up' ? 'auupnote' : 'aunote', ''); auView('main'); setTimeout(auFocus, 120); } return; }
  });
  $('#auform').addEventListener('submit', e => { e.preventDefault(); auLogin(); });
  $('#auupform').addEventListener('submit', e => { e.preventDefault(); auSignup(); });
  $('#aurform').addEventListener('submit', e => { e.preventDefault(); auReset(); });
  $('#anform').addEventListener('submit', e => { e.preventDefault(); auNewPass(); });
  $('#auresend').addEventListener('click', auResend);
  $('#acform').addEventListener('submit', e => { e.preventDefault(); auVerify(); });
  $('#accode').addEventListener('input', e => { const v = e.target.value, n = v.replace(/\D/g, '').slice(0, 6); if (n !== v) e.target.value = n; if (n.length === 6 && !$('#aumodal').classList.contains('au-busy')) auVerify(); });
  $('#auforgot').addEventListener('click', () => { const v = $('#auemail').value.trim(); if (v.includes('@')) $('#aremail').value = v; auMsg('arnote', ''); auView('reset'); setTimeout(auFocus, 120); });
  $('#auuser').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; auUserCheck(); });
  $('#auuser').addEventListener('blur', e => { const v = e.target.value.trim(); if (v && (!UN_RE.test(v) || /^\.|\.$|\.\./.test(v))) auFieldErr(e.target, 'Use 3 to 20 lowercase letters, numbers, dots or underscores.'); });
  $('#auupemail2').addEventListener('blur', e => { const a = $('#auupemail').value.trim(), b = e.target.value.trim(); if (a && b && a.toLowerCase() !== b.toLowerCase()) auFieldErr(e.target, 'The two email addresses do not match.'); });
  am.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { const f = i.closest('.fld'); if (f) { f.classList.remove('au-shake'); if (i.id !== 'auuser') auFieldErr(i, ''); else if (f.querySelector('.au-err')) auFieldErr(i, ''); } if (i.closest('.au-pw')) auReqs(i); }));
  fm.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'fname') { e.preventDefault(); e.stopPropagation(); clearTimeout(FR.t); frSearch(); } }, true);
  fm.addEventListener('input', e => { if (e.target.id === 'fname') { e.stopPropagation(); frInput(); } }, true);
  fm.addEventListener('click', e => { const b = e.target.closest('[data-fr]'); if (b) { e.stopPropagation(); frAct(b.dataset.fr, b); } });
  document.addEventListener('click', e => {
    const t = e.target;
    const g = t.closest && t.closest('[data-auth="google"]');
    if (g) { e.preventDefault(); if (!g.disabled) auGoogle(g); return; }
    const v = t.closest && t.closest('[data-auv]');
    if (v) { if (v.dataset.auv === 'main') SB.mode = 'in'; auView(v.dataset.auv); auMsg(auNote(), ''); setTimeout(auFocus, 120); return; }
  });
  auGoogleUi();
  if (SB.on) {
    Ameplay.analytics.sink = sbSink;
    [[$('#delc').closest('.scard').querySelector('p'), ' You will also be signed out on this device.', 'Type DELETE'], [$('#dl').closest('.srw').querySelector('small'), ' Includes your account data.'], [$('#rr').closest('.srw').querySelector('small'), ' Your account records are cleared too.']].forEach(([el, t, before]) => { if (!el) return; const sp = document.createElement('span'); sp.dataset.au = 'in'; sp.hidden = true; sp.textContent = t; const n = before && [...el.childNodes].find(x => x.nodeType === 3 && x.nodeValue.includes(before)); if (n) { const i = n.nodeValue.indexOf(before); const rest = n.splitText(i); el.insertBefore(sp, rest); sp.textContent = t.trim() + ' '; } else el.append(sp); });
    $('#auemsave').addEventListener('click', auChangeEmail);
    $('#aupwsave').addEventListener('click', auChangePass);
    $('#auem2').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); auChangeEmail(); } });
    $('#aupw2').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); auChangePass(); } });
    $('#aunow').addEventListener('click', () => { $('#ausync').textContent = 'Syncing…'; sySync(); });
    $('#adelc').addEventListener('input', e => { $('#adelbtn').disabled = e.target.value !== 'DELETE'; });
    $('#adelbtn').addEventListener('click', () => { if ($('#adelc').value === 'DELETE' && SB.user) auDeleteAccount(); });
    $('#unmodal').addEventListener('click', e => { if (e.target === e.currentTarget || e.target.closest('[data-unclose]')) SB.choosing = false; });
    $('#uncancel').addEventListener('click', () => { SB.choosing = false; });
    $('#unedit').addEventListener('click', () => { $('label[for="unew"]').textContent = 'New username'; if (SB.user) $('#uncont').textContent = SB.prof && SB.prof.username ? 'Continue' : 'Save'; });
    addEventListener('online', () => { if (SB.user) sySync(); });
    document.addEventListener('visibilitychange', () => { if (!SB.user) return; if (document.visibilityState === 'hidden') sySync({ keep: true }); else if (Date.now() - syNum(SY.at) > 180000) sySync(); });
    addEventListener('pagehide', () => { if (SB.user) sySync({ keep: true }); });
    setInterval(() => { if (SB.user && cur && document.visibilityState !== 'hidden') sySync(); }, 120000);
    if (SB_RET && SB_RET.code) SB.rt = true;
    if (!sbHasSession() && !SB.rt) SB.chk = true;
    if (SB_RET || sbHasSession()) sbClient().then(() => auReturn()).catch(() => { auWait(false); SB.rt = false; SB.chk = true; if (openK === 'mauth') auOpen('main', 'Sign-in could not load. Check your connection and reload the page.', 'bad', 'in'); else toast('Sign-in could not load. Check your connection and reload the page.'); });
    auSettings();
  }
  try { localStorage.removeItem('gameplay:guest'); sessionStorage.removeItem('gameplay:guest'); } catch (e) {}
  auRender();
  auGate();
}
Ameplay.account = {
  get enabled() { return SB.on; },
  get signedIn() { return !!SB.user; },
  get id() { return SB.user ? SB.user.id : null; },
  get username() { return SB.prof && SB.prof.username || null; },
  signIn() { auOpen('main', '', '', 'in'); },
  sync() { return sySync(); }
};

const AD = { role: null, locked: false, reason: null, until: null, ut: 0, uti: 0, at: 0, game: null, gat: 0, users: null, q: '', f: 'all', sort: ['created_at', -1], sel: null, tab: 'users', wait: 0, busy: false };
const adHref = () => (PATH_MODE ? '/' : '#/') + 'admin';
const adIsAdmin = () => (AD.role === 'admin' || AD.role === 'owner') && !AD.locked;
const adIsOwner = () => AD.role === 'owner' && !AD.locked;
const adStaff = u => u.role === 'admin' || u.role === 'owner';
const adRpc = (f, b) => sbRest('rpc/' + f, { method: 'POST', body: b || {} });
const adLang = () => window.gpI18n ? gpI18n.lang : 'en';
const AD_ICO = {
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  chev: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'
};
const AD_SI = {
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/></svg>',
  cake: '<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="10" rx="2"/><path d="M3 15c3 0 3-2 6-2s3 2 6 2 3-2 6-2M12 10V6M12 3v.5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  rocket: '<svg viewBox="0 0 24 24"><path d="M5 15c-1.5 1.3-2 4-2 6 2 0 4.7-.5 6-2M9 15l-3-3 7-7c2-2 5-2 8-2 0 3 0 6-2 8l-7 7z"/><circle cx="15" cy="9" r="1.5"/></svg>',
  bug: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="13" rx="5"/><path d="M12 11v9M3 13h4M17 13h4M4 7l3 2M20 7l-3 2M4 19l3-2M20 19l-3-2M9 7a3 3 0 0 1 6 0"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a4 4 0 0 0 4 4M16 6h4a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/></svg>',
  timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4M9 2h6"/></svg>'
};
function adAgo(t) {
  const d = Date.parse(t);
  if (!d) return auT('Never');
  const s = (d - Date.now()) / 1000, a = Math.abs(s);
  const [n, u] = a < 60 ? [s, 'second'] : a < 3600 ? [s / 60, 'minute'] : a < 86400 ? [s / 3600, 'hour'] : a < 2592000 ? [s / 86400, 'day'] : a < 31536000 ? [s / 2592000, 'month'] : [s / 31536000, 'year'];
  try { return new Intl.RelativeTimeFormat(adLang(), { numeric: 'auto' }).format(Math.round(n), u); } catch (e) { return new Date(d).toLocaleString(); }
}
function adDate(t, full) {
  const d = Date.parse(t);
  if (!d) return auT('Never');
  try { return new Date(d).toLocaleString(adLang(), full ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }); } catch (e) { return new Date(d).toLocaleString(); }
}
function adLangName(c) {
  if (!c) return '—';
  try { const n = new Intl.DisplayNames([adLang()], { type: 'language' }).of(c); return n ? n.charAt(0).toUpperCase() + n.slice(1) : c; } catch (e) { return c; }
}
const adGame = id => id ? (byId.get(id) ? byId.get(id).title : id) : '—';
const adCv = (id, c) => { const g = byId.get(id); if (!g || !thumbsOn()) return `<span class="${c} adcv0" style="--c:${esc(TINT[id] || 'var(--accent)')}">${esc(adGame(id).charAt(0))}</span>`; const u = coverUrl(g); if (u === BLANK) lzCover(id); return `<img class="${c}" src="${u}"${u === BLANK ? ` data-cv="${esc(id)}"` : ''} alt="" decoding="async" draggable="false">`; };
const adProv = u => (u.providers && u.providers.length ? u.providers : ['email']).map(p => p === 'google' ? 'Google' : p === 'email' ? auT('Email') : p).join(' + ');
const adPill = (t, k) => `<span class="adm-pill${k ? ' ' + k : ''}">${esc(auT(t))}</span>`;
const adRole = u => u.role === 'owner' ? adPill('Owner', 'acc') : u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User');
const adErr = e => { const m = String(e && e.message || ''); return /admins only/i.test(m) ? 'Admins only' : /change an owner/i.test(m) ? 'Only an owner can change an owner.' : /at least one owner/i.test(m) ? 'There must be at least one owner' : /owners only|owner can do/i.test(m) ? 'Only an owner can do this.' : /at least one admin/i.test(m) ? 'There must be at least one admin' : /own account/i.test(m) ? 'You cannot lock your own account' : /at least 8/i.test(m) ? 'Use at least 8 characters.' : /at most 72/i.test(m) ? 'Use at most 72 characters.' : /not found/i.test(m) ? 'Not found. Refresh and try again.' : /too many/i.test(m) ? 'Too many messages. Wait a minute and try again.' : /account locked/i.test(m) ? 'Your account is locked.' : /end time/i.test(m) ? 'Pick an end time in the future.' : /write a subject/i.test(m) ? 'Write a subject.' : /write a message/i.test(m) ? 'Write a message.' : 'Could not update. Check your connection and try again.'; };

function adStatus(s) {
  const was = adIsAdmin(), wl = AD.locked;
  AD.role = s ? s.role : null; AD.locked = !!(s && s.locked); AD.reason = s && s.locked_reason || null; AD.until = AD.locked && s.locked_until || null; AD.at = Date.now();
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = !adIsAdmin(); });
  document.querySelectorAll('[data-owner]').forEach(el => { el.hidden = !adIsOwner(); });
  clearTimeout(AD.ut);
  if (AD.locked && AD.until) { const d = Date.parse(AD.until) - Date.now(); AD.ut = setTimeout(adCheck, d > 0 ? Math.min(d + 1500, 3600000) : 30000); }
  if (AD.locked !== wl || AD.locked) adBlock(AD.locked);
  sfPaint();
  if (view === 'admin') { if (adIsAdmin()) { if (!was || !AD.users) adEnter(); } else adBounce(); }
}
async function adCheck(game) {
  if (!SB.user) return;
  const uid = SB.user.id;
  try {
    const r = await adRpc('touch_presence', { p_lang: adLang(), p_game: game || (cur ? cur.g.id : null) });
    if (!SB.user || SB.user.id !== uid) return;
    if (AD.del && Array.isArray(r) && !r.length) { AD.del = false; toast(auT('This account was deleted')); auSignOut(); return; }
    AD.del = false;
    adStatus(Array.isArray(r) ? r[0] : null);
  } catch (e) { if (view === 'admin' && !AD.at) adBounce(); }
}
function adSeen(id) {
  if (!SB.user || (AD.game === id && Date.now() - AD.gat < 60000)) return;
  AD.game = id; AD.gat = Date.now();
  adCheck(id);
}
function adSignedOut() {
  AD.role = null; AD.at = 0; AD.users = null; AD.sel = null; AD.until = null; clearTimeout(AD.ut);
  document.querySelectorAll('[data-admin], [data-owner]').forEach(el => { el.hidden = true; });
  if (AD.locked) { AD.locked = false; adBlock(false); }
  document.querySelectorAll('.tk').forEach(b => { if (b._tk) { b._tk.list = null; b._tk.cur = null; } });
  if (view === 'admin') adBounce();
}

function adBlock(on) {
  const el = $('#adblock');
  document.documentElement.classList.toggle('ad-locked', on);
  sfLock();
  clearInterval(AD.uti);
  if (on) {
    adUntil(); AD.uti = setInterval(adUntil, 30000);
    if (openK) closeAll();
    if (!$('#unmodal').hidden) unClose();
    if (view !== 'home' || cur || pend) go(homeHref(), true);
    $('#adbrt').textContent = AD.reason || '';
    $('#adbr').hidden = !AD.reason;
    if (el.hidden) { el.hidden = false; const b = tkBox($('#tkb'), 'user'); tkLoad(b); }
  } else el.hidden = true;
}

function adUntil() {
  const t = $('#adbut');
  if (!t) return;
  t.textContent = AD.until ? auT('{d} ({r})').replace('{d}', adDate(AD.until, 1)).replace('{r}', adAgo(AD.until)) : auT('Permanent');
  $('#adbu').classList.toggle('perm', !AD.until);
}
const adLeft = u => u.locked_until ? auT('ends {t}').replace('{t}', adAgo(u.locked_until)) : auT('Permanent');
function adBounce() {
  if (view !== 'admin') return;
  clearTimeout(AD.wait);
  toast('Admins only');
  go(homeHref(), true);
}
function adRoute() {
  closeGame();
  showView('admin');
  setHead(auT('Admin dashboard') + ' | gameplay', 'gameplay admin dashboard.', '/admin');
  scrollTo({ top: 0, behavior: 'instant' });
  if (!SB.on) return adBounce();
  if (!SB.user) {
    if (!sbHasSession()) return adBounce();
    clearTimeout(AD.wait); AD.wait = setTimeout(() => { if (view === 'admin' && !adIsAdmin()) adBounce(); }, 9000);
    return;
  }
  if (adIsAdmin() && Date.now() - AD.at < 60000) adEnter(); else adCheck();
}
async function adEnter() {
  clearTimeout(AD.wait);
  ST.anim = 2; AD.anim = true;
  adTab(AD.tab);
  await adLoad();
  tkLoad(tkBox($('#tka'), 'admin'));
  setTimeout(stSample, 15000);
}
async function adLoad() {
  if (!adIsAdmin() || AD.busy) return;
  AD.busy = true;
  $('#adref').classList.add('spin');
  if (!AD.users) { $('#adt tbody').innerHTML = ('<tr aria-hidden="true">' + '<td><i class="sk sk-td"></i></td>'.repeat(AD_COLS.length) + '</tr>').repeat(7); $('#adtiles').innerHTML = '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(6); }
  try {
    const r = await adRpc('admin_list_users');
    AD.users = Array.isArray(r) ? r : [];
    adTiles(AD.anim); adDraw(AD.anim); AD.anim = false;
    if (AD.sel) { const u = AD.users.find(x => x.id === AD.sel); if (u) adPanel(u, true); }
  } catch (e) {
    if (/admins only/i.test(e.message || '')) { AD.role = 'user'; adStatus({ role: 'user', locked: false }); return; }
    $('#adt tbody').innerHTML = `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
  } finally { AD.busy = false; $('#adref').classList.remove('spin'); }
}
function adTiles(an) {
  const U = AD.users || [], now = Date.now(), tk = ($('#tka')._tk || {}).list || [];
  const open = tk.filter(t => t.status === 'open').length;
  const T = [['Accounts', U.length], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length], ['Active today', U.filter(u => now - Date.parse(u.last_seen || 0) < 864e5).length], ['Admins', U.filter(adStaff).length], ['Locked', U.filter(u => u.locked).length], ['Open tickets', open]];
  const box = $('#adtiles'), old = box.querySelectorAll('b[data-n]');
  if (!an && old.length === T.length) T.forEach(([, n], i) => { if (old[i].dataset.n !== String(n)) { old[i].dataset.n = n; old[i].textContent = stN(n); } });
  else { box.innerHTML = T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${n}" data-f="l">${stN(n)}</b></div>`).join(''); countUp(box); }
  const tn = $('#adtn'); tn.textContent = open || ''; tn.hidden = !open;
}
const adPw = u => u.has_password ? adPill('Set · hidden', 'ok') : adPill('None · Google only');
const adHrs = sec => { const m = Math.round((+sec || 0) / 60); return m < 60 ? m + ' min' : (m / 60).toFixed(m < 600 ? 1 : 0) + ' h'; };
const adDot = () => `<span class="adm-dot" title="${esc(auT('Online now'))}"></span>`;
const AD_COLS = [
  ['id', 'User id', u => `${adDot(u)}<code title="${esc(u.id)}">${esc(u.id.slice(0, 8))}</code>`],
  ['email', 'Email', u => esc(u.email || '—')],
  ['username', 'Username', u => u.username ? '@' + esc(u.username) : '<span class="adm-mut">—</span>'],
  ['display_name', 'Display name', u => esc(u.display_name || '—')],
  ['last_sign_in_at', 'Last log in', u => `<span title="${esc(adDate(u.last_sign_in_at, 1))}">${esc(adAgo(u.last_sign_in_at))}</span>`],
  ['last_seen', 'Last used website', u => `<span class="ls-on">${adPill('Online now', 'ok')}</span><span class="ls-off" title="${esc(adDate(u.last_seen, 1))}">${esc(adAgo(u.last_seen))}</span>`],
  ['providers', 'Log in method', u => esc(adProv(u))],
  ['created_at', 'Account created', u => `<span title="${esc(adDate(u.created_at, 1))}">${esc(adDate(u.created_at))}</span>`],
  ['has_password', 'Password', adPw],
  ['fav_game', 'Favourite game', u => esc(adGame(u.fav_game))],
  ['friends', 'Friends', u => String(+u.friends || 0)],
  ['role', 'Role', adRole],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span><small class="adm-left">${esc(adLeft(u))}</small>` : adPill('No')]
];
function adHead() {
  $('#adt thead').innerHTML = '<tr>' + AD_COLS.map(([k, l]) => k ? `<th><button type="button" data-adsort="${k}" aria-sort="${AD.sort[0] === k ? (AD.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button></th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>';
}
function adSortVal(u, k) {
  const v = k === 'providers' ? adProv(u) : u[k];
  if (k === 'last_seen' && RT.pres[u.id]) return Date.now() + 1;
  if (/_at$|last_seen/.test(k)) return Date.parse(v) || 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  return v == null ? '' : String(v).toLowerCase();
}
function adRows() {
  const q = AD.q.trim().toLowerCase().replace(/^@/, ''), f = AD.f, now = Date.now(), [k, d] = AD.sort;
  return (AD.users || []).filter(u => {
    if (q && ![u.id, u.email, u.username, u.display_name].some(x => x && String(x).toLowerCase().includes(q))) return false;
    if (f === 'admin') return adStaff(u);
    if (f === 'locked') return u.locked;
    if (f === 'unconfirmed') return !u.email_confirmed;
    if (f === 'google' || f === 'email') return (u.providers || []).includes(f);
    if (f === 'active') return now - Date.parse(u.last_seen || 0) < 6048e5;
    if (f === 'online') return !!RT.pres[u.id];
    return true;
  }).sort((a, b) => { const x = adSortVal(a, k), y = adSortVal(b, k); const ex = x === '' || x === 0, ey = y === '' || y === 0; if (ex !== ey) return ex ? 1 : -1; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function adDraw(an) {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  tb.classList.toggle('an', !!an);
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  tb.innerHTML = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${u.id === AD.sel ? 'sel' : ''}${RT.pres[u.id] ? ' on' : ''}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${AD_COLS.length}" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
}
const AD_TABS = ['users', 'tickets', 'stats', 'log', 'site'];
function adTab(t) {
  const was = AD.tab, tabs = $('#adtabs'), o = $('#ad' + was), fade = was !== t && view === 'admin' && !o.hidden && motionOK(), top = fade ? o.offsetTop : 0;
  AD.tab = t;
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
  if (was !== t) tabs.parentNode.dataset.dir = AD_TABS.indexOf(t) < AD_TABS.indexOf(was) ? 'l' : 'r';
  if (t === 'stats' && was !== t) ST.anim = 2;
  AD_TABS.forEach(k => {
    const s = $('#ad' + k);
    clearTimeout(s._xt); s.classList.remove('adx'); s.style.top = '';
    if (k === t) s.hidden = false;
    else if (k === was && fade) { s.style.top = top + 'px'; s.classList.add('adx'); s._xt = setTimeout(() => { s.hidden = true; s.classList.remove('adx'); s.style.top = ''; }, 180); }
    else s.hidden = true;
  });
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
  if (t === 'stats') { stShell(); if (INS.sub === 'ins') insLoad(false); else stLoad(); }
  if (t === 'log') alLoad();
  if (t === 'site') sfaDraw();
}
function adLiveTxt(u) {
  const pr = RT.pres[u.id];
  if (!pr) return `<span class="adm-mut">${esc(auT('Offline'))} · ${esc(auT('last seen {t}').replace('{t}', adAgo(u.last_seen)))}</span>`;
  return `<span class="adm-dot"></span><b>${esc(auT('Online now'))}</b> · ${esc(pr.g ? auT('playing {g}').replace('{g}', adGame(pr.g)) : auT('browsing'))}`;
}
function adPanel(u, keep) {
  AD.sel = u.id;
  const p = $('#adpanel'), me = SB.user && SB.user.id === u.id, name = u.display_name || u.username || u.email || '?';
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  const tr = document.querySelector(`#adt tr[data-uid="${CSS.escape(u.id)}"]`); if (tr) tr.classList.add('sel');
  $('#adppic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').textContent = [u.username ? '@' + u.username : '', u.email || ''].filter(Boolean).join(' · ');
  $('#adpp').innerHTML = adRole(u) + (u.locked ? adPill('Locked', 'bad') + adPill(adLeft(u), 'bad') : '') + (u.email_confirmed ? adPill('Email confirmed', 'ok') : adPill('Email not confirmed', 'warn')) + (me ? adPill('You', 'acc') : '');
  $('#adplive').innerHTML = adLiveTxt(u);
  $('#adpq').innerHTML = [['Time played', adHrs(u.seconds_played), 'clock'], ['Plays', stN(u.plays), 'play'], ['Friends', stN(u.friends), 'users'], ['Favourite game', adGame(u.fav_game), 'star'], ['Account created', adAgo(u.created_at), 'cake'], ['Last seen', RT.pres[u.id] ? auT('Online now') : adAgo(u.last_seen), 'eye']].map(([k, v, i], n) => `<div style="--i:${n}">${AD_SI[i]}<small>${esc(auT(k))}</small><b title="${esc(v)}">${esc(v)}</b></div>`).join('');
  const F = [['User id', `<code>${esc(u.id)}</code>`], ['Email', esc(u.email || '—')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Log in method', esc(adProv(u))], ['Account created', esc(adDate(u.created_at, 1))], ['Password', adPw(u)], ['Favourite game', esc(adGame(u.fav_game))], ['Friends', String(+u.friends || 0)], ['Role', adRole(u)], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Locked', u.locked ? adPill('Locked', 'bad') + ` <span class="adm-mut">${esc(u.locked_until ? auT('until {d}').replace('{d}', adDate(u.locked_until, 1)) : auT('Permanent'))}</span>` + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))]];
  $('#adpdl').innerHTML = F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join('');
  const prot = u.role === 'owner' && !adIsOwner(), rl = adStaff(u) && !adIsOwner();
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); b.disabled = rl; adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = (me && !u.locked) || prot;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked; $('#adld').hidden = u.locked; $('#adldl').hidden = u.locked;
  const lt = $('#adlt'); lt.hidden = !u.locked; lt.textContent = u.locked ? (u.locked_until ? auT('Locked until {d} ({r}).').replace('{d}', adDate(u.locked_until, 1)).replace('{r}', adAgo(u.locked_until)) : auT('Locked with no end date.')) : '';
  ['adpwb', 'adrst', 'adunb', 'addelb'].forEach(id => adUnconfirm($('#' + id)));
  $('#adrst').disabled = !u.email || prot;
  $('#adpwb').disabled = prot; $('#adunb').disabled = prot;
  $('#adpwt').textContent = auT(u.has_password ? 'Hidden (hashed). Passwords are stored as one-way hashes, so nobody can see them.' : 'This account has no password: it signs in with Google.');
  $('#addelb').disabled = !!me || adStaff(u);
  if (!keep) {
    ['adprn', 'adpwn', 'adln', 'adrstn', 'adunn', 'addeln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = ''; $('#addel').value = ''; $('#adun').value = u.username || '';
    if (me) { auMsg('adln', 'You cannot lock your own account'); auMsg('addeln', 'You cannot delete your own account here.'); }
    else if (adStaff(u)) auMsg('addeln', 'Make this admin a regular user first.');
    if (prot) auMsg('adprn', 'Only an owner can change an owner.'); else if (rl) auMsg('adprn', 'Only an owner can change the role of an admin.');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
    adGames(u);
    alHist(u);
    const was = p.hidden;
    vis(p, true);
    p.classList.remove('swap'); void p.offsetWidth; if (!was) p.classList.add('swap');
    requestAnimationFrame(() => p.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' }));
    if (was && !auCoarse()) p.focus({ preventScroll: true });
  }
}
async function adGames(u) {
  const box = $('#adpg');
  box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i><i class="sk sk-td"></i>';
  try {
    const r = await adRpc('admin_user_games', { p_uid: u.id });
    if (AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [], max = Math.max(1, ...L.map(g => +g.seconds_played || 0));
    box.innerHTML = L.length ? L.map((g, i) => `<div class="apc-g" style="--i:${Math.min(i, 12)};--c:${esc(TINT[g.game_id] || 'var(--accent)')}">${adCv(g.game_id, 'apc-gi')}<span class="apc-gn">${esc(adGame(g.game_id))}</span><b>${esc(adHrs(g.seconds_played))}</b><i><s style="width:${Math.max(2, Math.round(100 * (+g.seconds_played || 0) / max))}%"></s></i><small>${esc(auT('{n} plays').replace('{n}', +g.plays || 0))}${g.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', g.best_score)) : ''}${g.last_played ? ' · ' + esc(adAgo(g.last_played)) : ''}</small></div>`).join('') : `<div class="adm-mut apc-none">${esc(auT('No games played yet.'))}</div>`;
  } catch (e) { box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
}
function adPanelClose() {
  const p = $('#adpanel');
  if (p.hidden) return;
  const tr = document.querySelector('#adt tr.sel');
  AD.sel = null;
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  vis(p, false);
  if (tr && p.contains(document.activeElement)) tr.focus({ preventScroll: true });
}
function adUnconfirm(b) { if (b && b.dataset.c) { delete b.dataset.c; b.textContent = b.dataset.l; b.classList.remove('dangerfill'); } }
function adConfirm(b) {
  if (b.dataset.c) { adUnconfirm(b); return true; }
  b.dataset.l = b.textContent; b.dataset.c = '1';
  b.textContent = auT('Click again to confirm'); b.classList.add('dangerfill');
  clearTimeout(b._ct); b._ct = setTimeout(() => adUnconfirm(b), 4000);
  return false;
}
const adCur = () => (AD.users || []).find(x => x.id === AD.sel);
async function adAct(k, b) {
  const u = adCur();
  if (!u || b.disabled) return;
  if (k === 'role') {
    const r = b.dataset.adrole;
    if (r === u.role) return;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adprn', '');
    try { await adRpc('admin_set_role', { p_uid: u.id, p_role: r }); u.role = r; auMsg('adprn', r === 'owner' ? 'This user is now an owner.' : r === 'admin' ? 'This user is now an admin.' : 'This user is now a regular user.', 'ok'); track('admin', { act: 'role' }); rtSend(u.id, { t: 'status' }); if (SB.user && u.id === SB.user.id) { adCheck(); if (r === 'user') return; } }
    catch (e) { auMsg('adprn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'pw') {
    const pw = $('#adpw').value;
    if (pw.length < 8) { auMsg('adpwn', 'Use at least 8 characters.', 'bad'); auShake($('#adpw').closest('.au-pw')); return; }
    if (utf8Len(pw) > 72) { auMsg('adpwn', 'Use at most 72 characters.', 'bad'); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adpwn', '');
    try { const r = await adRpc('admin_set_password', { p_uid: u.id, p_password: pw }); $('#adpw').value = ''; auMsg('adpwn', r === 'signed_out' ? 'New password saved. They were signed out on their devices.' : 'New password saved.', 'ok'); track('admin', { act: 'password' }); alHist(u); }
    catch (e) { auMsg('adpwn', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'reset') {
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adrstn', '');
    try { const c = await sbClient(); const { error } = await c.auth.resetPasswordForEmail(u.email, { redirectTo: sbRedirect('recovery') }); if (error) throw error; auMsg('adrstn', auT('Sent to {e}. They get a 6-digit code to choose a new password.').replace('{e}', u.email), 'ok'); track('admin', { act: 'reset' }); await adRpc('admin_log_reset', { p_uid: u.id }).catch(() => {}); alHist(u); }
    catch (e) { auMsg('adrstn', auErrText(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'un') {
    const v = $('#adun').value.trim().toLowerCase().replace(/^@/, '');
    if (v === (u.username || '')) return;
    if (!UN_RE.test(v) || /^\.|\.$|\.\./.test(v)) { auMsg('adunn', 'Use 3 to 20 lowercase letters, numbers, dots or underscores.', 'bad'); auShake($('#adun')); return; }
    b.disabled = true; b.classList.add('is-busy'); auMsg('adunn', '');
    try { u.username = await adRpc('admin_set_username', { p_uid: u.id, p_name: v }); auMsg('adunn', 'Username saved.', 'ok'); track('admin', { act: 'username' }); rtSend(u.id, { t: 'profile' }); }
    catch (e) { auMsg('adunn', /taken/i.test(e.message || '') ? 'That username is taken.' : /not allowed/i.test(e.message || '') ? 'That username is not allowed.' : adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  } else if (k === 'del') {
    const t = $('#addel').value.trim().toLowerCase().replace(/^@/, '');
    if (!t || (t !== String(u.username || '').toLowerCase() && t !== String(u.email || '').toLowerCase())) { auMsg('addeln', 'Type the username or email exactly to confirm.', 'bad'); auShake($('#addel')); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('addeln', '');
    try {
      await adRpc('admin_delete_user', { p_uid: u.id });
      track('admin', { act: 'delete' });
      rtSend(u.id, { t: 'deleted' });
      AD.users = (AD.users || []).filter(x => x.id !== u.id);
      adPanelClose(); adTiles(); adDraw(); toast(auT('Account deleted'));
    } catch (e) { auMsg('addeln', /regular user first/i.test(e.message || '') ? 'Make this admin a regular user first.' : /own account/i.test(e.message || '') ? 'You cannot delete your own account here.' : adErr(e), 'bad'); b.disabled = false; b.classList.remove('is-busy'); }
    return;
  } else if (k === 'lock') {
    const on = !u.locked;
    if (!adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); auMsg('adln', '');
    const hrs = +$('#adld').value || 0, until = on && hrs ? new Date(Date.now() + hrs * 3600e3).toISOString() : null;
    try {
      if (on) await adRpc('admin_lock_until', { p_uid: u.id, p_reason: $('#adlr').value, p_until: until }); else await adRpc('admin_lock', { p_uid: u.id, p_locked: false, p_reason: null });
      u.locked = on; u.locked_until = until; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null;
      auMsg('adln', on ? (until ? auT('Account locked until {d}. They only see the blocked page until then.').replace('{d}', adDate(until, 1)) : 'Account locked. They now only see the blocked page.') : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock', hrs }); rtSend(u.id, { t: 'status' });
    }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
  adTiles(); adDraw(); adPanel(u, true);
  alHist(u);
  adLoad();
}

const AL = { list: [], more: false, busy: false, seq: 0 };
const alWho = (un, dn, id) => un ? '@' + un : dn || (id ? id.slice(0, 8) : '');
const AL_T = { role_owner: '{a} made {t} an owner', role_admin: '{a} made {t} an admin', role_user: '{a} made {t} a regular user', username: '{a} changed the username of {t} to {n}', lock_until: '{a} locked {t} until {d}', lock: '{a} locked {t} with no end date', unlock: '{a} unlocked {t}', expire: 'The lock on {t} ended', password: '{a} set a new password for {t}', reset_email: '{a} sent a password reset email to {t}', delete_user: '{a} deleted the account of {t}', ticket_delete: '{a} deleted a ticket from {t}', ticket_reply: '{a} replied to a ticket from {t}', ticket_closed: '{a} closed a ticket from {t}', ticket_open: '{a} reopened a ticket from {t}', site: '{a} changed the site switches', site_password: '{a} changed the site password' };
function alSite(d) {
  const a = d.after || {}, b = d.before || {}, out = [], ga = new Set(a.disabled_games || []), gb = new Set(b.disabled_games || []);
  if (!!a.maintenance !== !!b.maintenance) out.push(auT(a.maintenance ? 'Maintenance mode on' : 'Maintenance mode off'));
  if ((a.banner || '') !== (b.banner || '')) out.push(a.banner ? auT('Announcement: {b}').replace('{b}', a.banner) : auT('Announcement removed'));
  const on = [...ga].filter(x => !gb.has(x)), off = [...gb].filter(x => !ga.has(x));
  if (on.length) out.push(auT('Turned off: {g}').replace('{g}', on.map(adGame).join(', ')));
  if (off.length) out.push(auT('Turned back on: {g}').replace('{g}', off.map(adGame).join(', ')));
  return out.length ? out.join(' · ') : auT('Messages updated');
}
function alRow(x, i) {
  const d = x.detail || {}, k = x.action === 'role' ? 'role_' + (d.to === 'owner' || d.to === 'admin' ? d.to : 'user') : x.action === 'lock' && d.until ? 'lock_until' : x.action === 'ticket_status' ? (d.status === 'closed' ? 'ticket_closed' : 'ticket_open') : x.action;
  const a = alWho(x.admin_username, x.admin_display, x.admin_id) || auT('An admin'), t = alWho(x.target_username, x.target_display, null) || (d.username ? '@' + d.username : d.display_name) || (x.target_user ? auT('a deleted account') : '');
  const tt = x.target_user && (AD.users || []).some(u => u.id === x.target_user) ? `<button type="button" class="al-u" data-alu="${esc(x.target_user)}">${esc(t)}</button>` : `<b>${esc(t)}</b>`;
  const txt = esc(auT(AL_T[k] || '{a} did something ({x})')).replace('{a}', `<b>${esc(a)}</b>`).replace('{t}', tt).replace('{n}', `<b>@${esc(d.to || '')}</b>`).replace('{d}', esc(adDate(d.until, 1))).replace('{x}', esc(x.action));
  const ex = x.action === 'lock' && d.reason ? auT('Reason: {r}').replace('{r}', d.reason) : /^ticket_/.test(x.action) && d.subject ? '“' + d.subject + '”' : x.action === 'site' ? alSite(d) : x.action === 'username' && d.from ? auT('Was @{u}').replace('{u}', d.from) : '';
  const ic = { lock: AD_ICO.lock, unlock: AD_ICO.lock, expire: AD_SI.clock, delete_user: AD_ICO.trash, ticket_delete: AD_ICO.trash, site: SF_ICO.tool, site_password: AD_ICO.lock, ticket_reply: AD_ICO.send, ticket_status: AD_ICO.send, password: AD_SI.eye, reset_email: AD_SI.eye, role: AD_SI.star, username: AD_SI.users }[x.action] || AD_SI.clock;
  return `<div class="al-r al-${esc(x.action)}" style="--i:${Math.min(i, 14)}"><span class="al-i">${ic}</span><div class="al-t"><span>${txt}</span>${ex ? `<em>${esc(ex)}</em>` : ''}<small title="${esc(adDate(x.at, 1))}">${esc(adAgo(x.at))} · ${esc(adDate(x.at, 1))}</small></div></div>`;
}
async function alLoad(more) {
  if (!adIsAdmin() || AL.busy) return;
  AL.busy = true;
  const box = $('#adlog');
  if (!more && !AL.list.length) box.innerHTML = '<div class="st-card">' + '<i class="sk sk-td"></i>'.repeat(6) + '</div>';
  try {
    const r = await adRpc('admin_log_list', { p_limit: 50, p_before: more && AL.list.length ? AL.list[AL.list.length - 1].id : null, p_target: null });
    const L = Array.isArray(r) ? r : [];
    AL.list = more ? AL.list.concat(L) : L; AL.more = L.length === 50;
    box.innerHTML = `<div class="st-card al-card"><div class="sx-ch"><div><h3>${esc(auT('Admin log'))}</h3><p class="sx-note">${esc(auT('Every change made by an admin, newest first.'))}</p></div></div><div class="al-list" translate="no">${AL.list.length ? AL.list.map(alRow).join('') : `<div class="adm-empty">${esc(auT('Nothing here yet.'))}</div>`}</div>${AL.more ? `<button class="btn2 al-more" type="button" data-almore>${esc(auT('Show more'))}</button>` : ''}</div>`;
  } catch (e) { if (!AL.list.length) box.innerHTML = `<div class="adm-empty">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
  finally { AL.busy = false; }
}
async function alHist(u) {
  const box = $('#adph'), n = ++AL.seq;
  if (!box) return;
  if (!box.children.length || box.dataset.u !== u.id) box.innerHTML = '<i class="sk sk-td"></i><i class="sk sk-td"></i>';
  box.dataset.u = u.id;
  try {
    const r = await adRpc('admin_log_list', { p_limit: 20, p_before: null, p_target: u.id });
    if (n !== AL.seq || AD.sel !== u.id) return;
    const L = Array.isArray(r) ? r : [];
    box.innerHTML = L.length ? L.map(alRow).join('') : `<div class="adm-mut apc-none">${esc(auT('No admin changes for this player yet.'))}</div>`;
  } catch (e) { if (n === AL.seq) box.innerHTML = `<div class="adm-mut">${esc(auT('Could not load. Check your connection and try again.'))}</div>`; }
}

const sfaLocal = iso => { const t = Date.parse(iso || ''); if (!t) return ''; const d = new Date(t); return new Date(t - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
function sfaDraw() {
  const d = SF.d || {}, box = $('#adsite'), off = new Set(d.disabled_games || []);
  box.innerHTML = `<div class="sfa">
  <div class="st-card sfa-c"><div class="sfa-row"><div><h3>${esc(auT('Maintenance mode'))}</h3><p class="sx-note">${esc(auT('Players see a maintenance page. Admins can still use the site.'))}</p></div><button class="sw${d.maintenance ? ' on' : ''}" type="button" role="switch" id="sfam" aria-checked="${!!d.maintenance}" aria-label="${esc(auT('Maintenance mode'))}"></button></div>
   <label class="apc-l" for="sfamm">${esc(auT('Message on the maintenance page (optional)'))}</label><textarea id="sfamm" maxlength="500" rows="2" placeholder="${esc(auT('We are making the site better. Please come back in a little while.'))}">${esc(d.maintenance_msg || '')}</textarea></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Announcement banner'))}</h3><p class="sx-note">${esc(auT('Shown at the top of the site for everyone. Leave it empty to hide it.'))}</p>
   <textarea id="sfab" maxlength="300" rows="2">${esc(d.banner || '')}</textarea>
   <div class="sfa-2"><label class="apc-l">${esc(auT('Style'))}<select id="sfal"><option value="info"${d.banner_level !== 'warning' ? ' selected' : ''}>${esc(auT('Info'))}</option><option value="warning"${d.banner_level === 'warning' ? ' selected' : ''}>${esc(auT('Warning'))}</option></select></label><label class="apc-l">${esc(auT('Ends (optional)'))}<input type="datetime-local" id="sfau" value="${esc(sfaLocal(d.banner_until))}"></label></div></div>
  <div class="st-card sfa-c"><h3>${esc(auT('Turned off games'))}</h3><p class="sx-note">${esc(auT('These games show as temporarily unavailable and cannot be started.'))}</p>
   <label class="search sfa-q"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="sfaq" type="search" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" aria-label="${esc(auT('Search games'))}"></label>
   <div class="sfa-g" id="sfag" translate="no">${games.slice().sort((a, b) => (off.has(b.id) - off.has(a.id)) || a.title.localeCompare(b.title)).map(g => `<button type="button" class="chip" data-sfg="${esc(g.id)}" aria-pressed="${off.has(g.id)}">${esc(g.title)}</button>`).join('')}</div>
   <label class="apc-l" for="sfadm">${esc(auT('Message for turned off games (optional)'))}</label><textarea id="sfadm" maxlength="300" rows="2" placeholder="${esc(auT('This game is being fixed. Try again a bit later.'))}">${esc(d.disabled_msg || '')}</textarea></div>
  <div class="sfa-f"><div class="note" id="sfan" role="status"></div><button class="btn2 pri" type="button" id="sfas">${esc(auT('Save and publish'))}</button></div>${adIsOwner() ? `
  <div class="st-card sfa-c" id="sfpw"><h3>${esc(auT('Site password'))}</h3><p class="sx-note">${esc(auT('The password everyone types to open the site. Only owners can see and change this.'))}</p>
   <div class="sfa-2"><div><label class="apc-l" for="sfp1">${esc(auT('New password'))}</label><div class="au-pw"><input id="sfp1" type="password" autocomplete="new-password" maxlength="200" spellcheck="false">${EYE}</div></div><div><label class="apc-l" for="sfp2">${esc(auT('Confirm password'))}</label><div class="au-pw"><input id="sfp2" type="password" autocomplete="new-password" maxlength="200" spellcheck="false">${EYE}</div></div></div>
   <div class="sfa-f"><div class="note" id="sfpn" role="status"></div><button class="btn2 pri" type="button" id="sfps">${esc(auT('Save password'))}</button></div></div>` : ''}</div>`;
}
const gpEnc = u => btoa(String.fromCharCode.apply(null, u));
async function gpKek(pw, s, n) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.importKey('raw', await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: s, iterations: n, hash: 'SHA-256' }, base, 256), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function gpSlot(pw, k) {
  const s = crypto.getRandomValues(new Uint8Array(16)), i = crypto.getRandomValues(new Uint8Array(12)), n = 310000;
  const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: i }, await gpKek(pw, s, n), k));
  const o = { v: 1, s: gpEnc(s), n, i: gpEnc(i), c: gpEnc(c) };
  const back = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: lzB64(o.i) }, await gpKek(pw, lzB64(o.s), o.n), lzB64(o.c)));
  if (back.length !== k.length || back.some((x, j) => x !== k[j])) throw new Error('Slot check failed');
  return o;
}
async function sfpSave(b) {
  const a = $('#sfp1').value, c = $('#sfp2').value;
  if (a.length < 6) { auMsg('sfpn', 'Use at least 6 characters.', 'bad'); auShake($('#sfp1').closest('.au-pw')); return; }
  if (a !== c) { auMsg('sfpn', 'The two passwords do not match.', 'bad'); auShake($('#sfp2').closest('.au-pw')); return; }
  if (!LZ.key) { auMsg('sfpn', 'This copy of the site is not password protected.', 'bad'); return; }
  if (!adConfirm(b)) return;
  b.disabled = true; b.classList.add('is-busy'); auMsg('sfpn', '');
  try {
    await adRpc('owner_set_gate', { p_slot: await gpSlot(a, lzB64(LZ.key)) });
    $('#sfp1').value = ''; $('#sfp2').value = '';
    auMsg('sfpn', 'Site password changed. Everyone needs the new password; devices that already unlocked this version stay unlocked.', 'ok');
    track('admin', { act: 'gate' });
    AL.list = [];
  } catch (e) { auMsg('sfpn', adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function sfaSave(b) {
  const v = id => $('#' + id).value, au = v('sfau'), until = au ? new Date(au) : null;
  if (until && !(until.getTime() > Date.now())) { auMsg('sfan', 'Pick an end time in the future.', 'bad'); auShake($('#sfau')); return; }
  const flags = { maintenance: $('#sfam').classList.contains('on'), maintenance_msg: v('sfamm'), banner: v('sfab'), banner_level: v('sfal'), banner_until: until ? until.toISOString() : null, disabled_games: [...document.querySelectorAll('#sfag [aria-pressed="true"]')].map(x => x.dataset.sfg), disabled_msg: v('sfadm') };
  b.disabled = true; b.classList.add('is-busy'); auMsg('sfan', '');
  try {
    const r = await adRpc('admin_set_site_flags', { p_flags: flags });
    if (r && typeof r === 'object') { SF.d = r; try { localStorage.setItem(SF_KEY, JSON.stringify(r)); } catch (e) {} }
    sfPaint(); sfNudge();
    auMsg('sfan', 'Saved. Every open tab updates right away.', 'ok');
    track('admin', { act: 'site' });
    AL.list = [];
  } catch (e) { auMsg('sfan', adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}

const ST = { d: null, at: 0, busy: false, days: 30, game: null, ci: -1, anim: 2, ps: 0, ch: {}, lv: new Set() };
const stN = v => (+v || 0).toLocaleString(adLang());
const stH = v => { const n = +v || 0; return (n < 10 ? n.toFixed(1) : stN(Math.round(n))) + ' h'; };
const stDay = (t, o) => { const d = Date.parse(String(t).slice(0, 10) + 'T12:00:00'); try { return new Date(d).toLocaleDateString(adLang(), o || { day: 'numeric', month: 'short' }); } catch (e) { return String(t).slice(0, 10); } };
const stNice = (v, int) => { if (!(v > 0)) return int ? 2 : 1; if (int && v <= 5) return Math.max(2, Math.ceil(v / 2) * 2); const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const ST_DEV = { desktop: 'Desktop', phone: 'Phone', tablet: 'Tablet', unknown: 'Unknown' }, ST_DK = { desktop: 0, phone: 1, tablet: 2, unknown: 'o' };
function stShell() {
  const box = $('#adstats');
  if (!$('#stov')) box.innerHTML = `<div class="adm-tabs ins-sub" role="tablist" aria-label="${esc(auT('Stats sections'))}"><button type="button" role="tab" data-stsub="ov">${esc(auT('Overview'))}</button><button type="button" role="tab" data-stsub="ins">${esc(auT('Player data'))}</button><i></i></div><div id="stov"></div><div id="insv"></div>`;
  box.querySelector('.ins-sub').dataset.m = INS.sub === 'ins' ? 'tickets' : 'users';
  box.querySelectorAll('[data-stsub]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.stsub === INS.sub)));
  $('#stov').hidden = INS.sub === 'ins'; $('#insv').hidden = INS.sub !== 'ins';
  return $('#stov');
}
async function stLoad(force) {
  if (!adIsAdmin() || ST.busy) return;
  if (!force && ST.d && Date.now() - ST.at < 20000) { stDraw(); return; }
  ST.busy = true;
  const box = $('#adstats'), el = stShell();
  if (ST.anim || !ST.d) box.classList.add('sx-busy');
  if (!ST.d) el.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  try {
    ST.d = await adRpc('admin_stats_v2', { p_days: ST.days }).catch(e => { if (/admins only/i.test(e.message || '')) throw e; return adRpc('admin_stats'); });
    ST.at = Date.now(); stDraw();
  } catch (e) { if (!ST.d) el.innerHTML = `<div class="adm-empty">${esc(auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { ST.busy = false; box.classList.remove('sx-busy'); }
}
function stSample() {
  if (view !== 'admin' || !adIsAdmin() || document.visibilityState === 'hidden' || Date.now() - ST.ps < 295000) return;
  ST.ps = Date.now();
  adRpc('admin_presence_sample', { p_online: Object.keys(RT.pres).length }).catch(() => {});
}
function stLive() {
  const box = $('#stlive');
  if (!box) return;
  const P = Object.entries(RT.pres), by = {};
  P.forEach(([, p]) => { const k = p.g || ''; by[k] = (by[k] || 0) + 1; });
  const top = Object.entries(by).filter(([k]) => k).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $('#stln').textContent = P.length;
  const seen = ST.lv;
  ST.lv = new Set(P.map(([id]) => id));
  box.innerHTML = P.length ? P.sort((a, b) => (b[1].g ? 1 : 0) - (a[1].g ? 1 : 0)).map(([id, p]) => {
    const u = (AD.users || []).find(x => x.id === id), name = (u && (u.display_name || u.username || u.email)) || id.slice(0, 8);
    return `<button class="st-on${seen.has(id) ? '' : ' nw'}" type="button" data-stu="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot on"></i></span><span><b>${esc(name)}</b><small>${esc(u && u.username ? '@' + u.username : '')}${p.h ? ' · ' + esc(auT('hidden from friends')) : ''}</small></span><em>${esc(p.g ? adGame(p.g) : auT('Browsing'))}</em></button>`;
  }).join('') : `<div class="adm-mut sx-nobody">${esc(auT('Nobody is online right now.'))}</div>`;
  $('#stlg').innerHTML = top.map(([g, n]) => `<span class="adm-pill acc">${esc(adGame(g))} · ${n}</span>`).join('');
}
function stSeries() {
  const D = ST.d || {};
  if (Array.isArray(D.series)) return D.series;
  const S = new Map((D.signups || []).map(s => [String(s.day).slice(0, 10), +s.signups || 0]));
  return (D.daily || []).map(d => ({ day: d.day, active: d.active_players, signed_in: d.signed_in_players, sessions: d.sessions, launches: d.game_launches, hours: d.hours_played, signups: S.get(String(d.day).slice(0, 10)) || 0, peak: null }));
}
function stPath(pts, base) {
  let d = '', a = '', seg = [];
  const flush = () => { if (!seg.length) return; d += 'M' + seg.map(p => p.join(',')).join('L'); a += 'M' + seg[0][0] + ',' + base + 'L' + seg.map(p => p.join(',')).join('L') + 'L' + seg[seg.length - 1][0] + ',' + base + 'Z'; seg = []; };
  pts.forEach(p => { if (p) seg.push(p); else flush(); });
  flush();
  return [d, a];
}
function stChart(id, title, rows, keys, o) {
  const W = 600, H = 150, n = rows.length, bar = o.type === 'bar', fmt = o.fmt || stN;
  const vals = keys.map(k => rows.map(r => r[k.k] == null ? null : +r[k.k] || 0));
  const all = vals.flat().filter(v => v != null), max = stNice(Math.max(0, ...all), !o.dec);
  ST.ch[id] = { rows, keys, vals, max, bar, fmt };
  const main = vals[0].filter(v => v != null), kv = o.agg === 'max' ? Math.max(0, ...main) : o.agg === 'avg' ? main.reduce((s, v) => s + v, 0) / Math.max(1, main.length) : main.reduce((s, v) => s + v, 0);
  const kl = o.agg === 'max' ? 'Highest' : o.agg === 'avg' ? 'Daily average' : 'Total';
  const X = i => bar ? (i + .5) * W / n : n > 1 ? i * W / (n - 1) : W / 2, Y = v => +(H - H * v / max).toFixed(1);
  let g = [0, .5, 1].map(f => `<line class="sx-gl" x1="0" x2="${W}" y1="${H * f}" y2="${H * f}"/>`).join('');
  const sd = (Math.min(25, 420 / Math.max(1, n))).toFixed(1);
  if (bar && n) { const bw = W / n * (n > 40 ? .78 : .64); g += vals[0].map((v, i) => { const h = Math.max(v ? 2 : 0, H * (v || 0) / max); return `<rect data-i="${i}" style="--i:${i}" x="${(X(i) - bw / 2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}"/>`; }).join(''); }
  else g += vals.map((vs, s) => { const [d, a] = stPath(vs.map((v, i) => v == null ? null : [+X(i).toFixed(1), Y(v)]), H); return (s ? '' : `<path class="sx-a" d="${a}" fill="url(#sxg-${id})"/>`) + `<path class="sx-l sx-s${s}" d="${d}"/>`; }).join('');
  const lab = v => o.dec ? fmt(v) : stN(v);
  const xl = n ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, A) => A.indexOf(v) === i).map(i => `<span style="left:${(100 * X(i) / W).toFixed(2)}%">${esc(stDay(rows[i].day))}</span>`).join('') : '';
  return `<div class="st-card sx-c${o.wide ? ' sx-wide' : ''}" style="--i:${o.i || 0}">
   <div class="sx-ch"><div><h3>${esc(auT(title))}</h3>${o.note ? `<p class="sx-note">${esc(auT(o.note))}</p>` : ''}</div><div class="sx-kpi"><b${!o.dec && Number.isInteger(kv) ? ` data-n="${kv}" data-f="l"` : ''}>${esc(o.dec ? fmt(kv) : stN(Math.round(kv * 10) / 10))}</b><small>${esc(auT(kl))}</small></div></div>
   ${keys.length > 1 ? `<div class="sx-leg">${keys.map((k, s) => `<span><i class="sx-s${s}"></i>${esc(auT(k.l))}</span>`).join('')}</div>` : ''}
   <div class="sx-plot"><div class="sx-y" aria-hidden="true"><span>${esc(lab(max))}</span><span>${esc(lab(max / 2))}</span><span>0</span></div>
    <div class="sx-area" data-ch="${id}">
     <div class="sx-w${ST.anim && !bar ? ' an' : ''}"><svg class="sx-svg${bar ? ' sx-bars' : ''}${ST.anim ? ' an' : ''}" style="--sd:${sd}ms" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(auT(title))}"><defs><linearGradient id="sxg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sx0);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--sx0);stop-opacity:0"/></linearGradient></defs>${g}</svg></div>
     <div class="sx-ov" aria-hidden="true"><i class="sx-x"></i>${bar ? '' : keys.map((k, s) => `<i class="sx-dot sx-s${s}"></i>`).join('')}<div class="sx-tip"></div></div>
     <div class="sx-xl" aria-hidden="true">${xl}</div>
    </div>
   </div>
  </div>`;
}
function stHover(a, e) {
  const c = ST.ch[a.dataset.ch];
  if (!c || !c.rows.length) return;
  const r = a.querySelector('svg').getBoundingClientRect(), n = c.rows.length, f = (e.clientX - r.left) / r.width;
  if (f < 0 || f > 1) { stUnhover(a); return; }
  const i = c.bar ? Math.min(n - 1, Math.floor(f * n)) : Math.round(f * (n - 1)), xp = c.bar ? (i + .5) / n : n > 1 ? i / (n - 1) : .5;
  a.classList.add('hov');
  a.querySelector('.sx-x').style.left = (xp * 100) + '%';
  a.querySelectorAll('.sx-dot').forEach((d, s) => { const v = c.vals[s][i]; d.hidden = v == null; d.style.left = (xp * 100) + '%'; d.style.top = (100 - 100 * (v || 0) / c.max) + '%'; });
  a.querySelectorAll('rect.on').forEach(x => x.classList.remove('on'));
  if (c.bar) { const b = a.querySelector(`rect[data-i="${i}"]`); if (b) b.classList.add('on'); }
  const t = a.querySelector('.sx-tip');
  t.innerHTML = `<small>${esc(stDay(c.rows[i].day, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))}</small>` + c.keys.map((k, s) => `<span>${c.keys.length > 1 ? `<i class="sx-s${s}"></i>` : ''}${esc(auT(k.l))}<b>${c.vals[s][i] == null ? esc(auT('No data')) : esc(c.fmt(c.vals[s][i]))}</b></span>`).join('');
  t.style.left = (xp * 100) + '%';
  t.style.transform = `translateX(${xp < .18 ? -6 : xp > .82 ? -94 : -50}%)`;
}
function stUnhover(a) { a.classList.remove('hov'); a.querySelectorAll('rect.on').forEach(x => x.classList.remove('on')); }
function stDonut() {
  const D = ST.d || {}, H = D.game_hours || null;
  const src = H ? Object.entries(H).map(([id, h]) => [id, +h || 0]) : stGames().map(g => [g.game_id, +g.hours || 0]);
  const L = src.filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]), tot = L.reduce((s, x) => s + x[1], 0);
  if (!tot) return `<div class="adm-mut sx-empty">${esc(auT('No data yet.'))}</div>`;
  const top = L.slice(0, 5), rest = L.slice(5).reduce((s, x) => s + x[1], 0);
  if (rest > 0) top.push(['', rest]);
  let off = 0;
  const ms = 7, gap = top.length > 1 ? .8 : 0;
  const segs = top.map(([id, h], s) => { const p = 100 * h / tot, len = Math.max(.01, p - gap), c = `<circle class="sx-seg sx-k${id ? s : 'o'}" data-seg="${s}" cx="21" cy="21" r="15.915" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(25 - off).toFixed(2)}" style="--d:${Math.round(off * ms)}ms;--t:${Math.max(90, Math.round(p * ms))}ms"><title>${esc(id ? adGame(id) : auT('Other games'))}: ${esc(stH(h))} (${Math.round(p)}%)</title></circle>`; off += p; return c; }).join('');
  ST.dn = top.map(([id, h]) => ({ n: id ? adGame(id) : auT('Other games'), h, p: Math.round(100 * h / tot) }));
  return `<div class="sx-dn"><div class="sx-ring"><svg viewBox="0 0 42 42" class="${ST.anim ? 'an' : ''}" role="img" aria-label="${esc(auT('Share of playtime'))}"><circle class="sx-track" cx="21" cy="21" r="15.915"/>${segs}</svg><div class="sx-dc" data-h="${esc(`<b>${esc(stH(tot))}</b><small>${esc(auT('Hours played'))}</small>`)}"><b>${esc(stH(tot))}</b><small>${esc(auT('Hours played'))}</small></div></div>
   <div class="sx-dl">${top.map(([id, h], s) => `<div class="sx-dr" data-seg="${s}"><i class="sx-k${id ? s : 'o'}"></i><span>${esc(id ? adGame(id) : auT('Other games'))}</span><b>${Math.round(100 * h / tot)}%</b><small>${esc(stH(h))}</small></div>`).join('')}</div></div>`;
}
function stSeg(dn, s) {
  const k = s ? s.dataset.seg : null, d = k != null && ST.dn ? ST.dn[+k] : null, c = dn.querySelector('.sx-dc');
  dn.querySelectorAll('[data-seg]').forEach(x => x.classList.toggle('dim', k != null && x.dataset.seg !== k));
  c.innerHTML = d ? `<b>${d.p}%</b><small>${esc(d.n)}</small>` : c.dataset.h;
}
function stDevices() {
  const D = ST.d || {}, by = {};
  (D.device_split || D.devices || []).forEach(d => { const k = ST_DEV[d.device] ? d.device : 'unknown'; by[k] = (by[k] || 0) + (+d.sessions || 0); });
  const L = Object.entries(by).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]), tot = L.reduce((s, x) => s + x[1], 0);
  if (!tot) return `<div class="adm-mut sx-empty">${esc(auT('No data yet.'))}</div>`;
  const DI = { desktop: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>', phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>', tablet: '<svg viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>', unknown: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01"/></svg>' };
  return `<div class="sx-stack" aria-hidden="true">${L.map(([k, n]) => `<i class="sx-k${ST_DK[k]}" style="flex:${n}"></i>`).join('')}</div><div class="sx-dv">${L.map(([k, n], s) => `<div class="sx-dvr" style="--i:${s}"><span class="sx-dvi sx-k${ST_DK[k]}">${DI[k]}</span><span>${esc(auT(ST_DEV[k]))}</span><b>${Math.round(100 * n / tot)}%</b><small>${esc(auT('{n} sessions').replace('{n}', stN(n)))}</small></div>`).join('')}</div>`;
}
function stGames() {
  const D = ST.d || {}, M = new Map((D.games || []).map(g => [g.game_id, g]));
  const all = games.map(g => g.id).concat([...M.keys()].filter(id => !byId.has(id)));
  return [...new Set(all)].map(id => Object.assign({ game_id: id, launches: 0, plays: 0, players: 0, launches_7d: 0, hours: 0, hours_7d: 0, avg_min: 0, errors: 0, errors_7d: 0, accounts: 0 }, M.get(id) || {}));
}
function stHealth(g) {
  if (+g.errors_7d >= Math.max(3, (+g.launches_7d || 0) / 2)) return adPill('Broken?', 'bad');
  if (+g.errors_7d > 0) return adPill('Some errors', 'warn');
  if (!+g.launches && !+g.plays) return adPill('Not played yet');
  return adPill('Working', 'ok');
}
function stSpark(a, an) {
  if (!a || !a.length) return '';
  const max = Math.max(1, ...a), n = a.length, W = 120, H = 34, X = i => n > 1 ? i * W / (n - 1) : W / 2, P = a.map((v, i) => [+X(i).toFixed(1), +(H - 2 - (H - 4) * v / max).toFixed(1)]), [d, ar] = stPath(P, H);
  return `<div class="sx-w${an ? ' an' : ''}"><svg class="sx-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="sx-a" d="${ar}"/><path class="sx-l sx-s0" d="${d}"/></svg></div>`;
}
function stOpts(q) {
  q = (q || '').trim().toLowerCase();
  const M = new Map(stGames().map(g => [g.game_id, g]));
  return stGames().map(g => ({ id: g.game_id, t: adGame(g.game_id), l: +g.launches || 0 })).filter(o => !q || o.t.toLowerCase().includes(q) || o.id.includes(q)).sort((a, b) => (q ? (b.t.toLowerCase().startsWith(q) ? 1 : 0) - (a.t.toLowerCase().startsWith(q) ? 1 : 0) : 0) || b.l - a.l || a.t.localeCompare(b.t)).slice(0, 60).map(o => Object.assign(o, { g: M.get(o.id) }));
}
function stCombo(open) {
  const inp = $('#stgq'), ul = $('#stgl');
  if (!inp) return;
  if (!open) { ul.hidden = true; inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); ST.ci = -1; return; }
  const q = inp.dataset.typed === '1' ? inp.value : '', O = stOpts(q), ql = q.trim().toLowerCase();
  ST.opts = O;
  if (ST.ci >= O.length) ST.ci = O.length - 1;
  const hl = t => { const i = ql ? t.toLowerCase().indexOf(ql) : -1; return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + ql.length)) + '</mark>' + esc(t.slice(i + ql.length)); };
  ul.innerHTML = O.length ? O.map((o, i) => `<li role="option" id="stgo${i}" data-g="${esc(o.id)}" aria-selected="${o.id === ST.game}" class="${i === ST.ci ? 'act' : ''}">${adCv(o.id, 'sx-cv')}<span translate="no">${hl(o.t)}</span><small>${esc(auT('{n} launches').replace('{n}', stN(o.l)))}</small></li>`).join('') : `<li class="sx-cbn" role="presentation">${esc(auT('No games match.'))}</li>`;
  ul.hidden = false; inp.setAttribute('aria-expanded', 'true');
  if (ST.ci >= 0) { inp.setAttribute('aria-activedescendant', 'stgo' + ST.ci); const a = $('#stgo' + ST.ci); if (a) a.scrollIntoView({ block: 'nearest' }); } else inp.removeAttribute('aria-activedescendant');
}
function stPick(id) {
  ST.game = id;
  const inp = $('#stgq');
  if (inp) { inp.value = adGame(id); inp.dataset.typed = ''; }
  stCombo(false);
  stGameCard(true);
}
function stGameCard(an) {
  const box = $('#stgd');
  if (!box) return;
  if (!motionOK()) an = 0;
  box.classList.toggle('sx-gp', an === true);
  const g = stGames().find(x => x.game_id === ST.game);
  if (!g) { box.innerHTML = ''; return; }
  const D = ST.d || {}, sp = (D.game_days || {})[g.game_id], gm = byId.get(g.game_id), tint = TINT[g.game_id] || 'var(--accent)';
  const P = (D.players || []).filter(p => p.game_id === g.game_id).sort((a, b) => (+b.seconds_played || 0) - (+a.seconds_played || 0)).slice(0, 5);
  const spSum = sp ? sp.reduce((s, v) => s + (+v || 0), 0) : null;
  const C = [
    ['Launches', stN(g.launches), 'rocket', spSum != null ? `${stSpark(sp, an)}<small>${esc(auT('{n} in the last {d} days').replace('{n}', stN(spSum)).replace('{d}', ST.days))}</small>` : `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.launches_7d)))}</small>`, 'sx-gw', g.launches],
    ['Players', stN(g.players), 'users', '', '', g.players],
    ['Rounds played', stN(g.plays), 'play', '', '', g.plays],
    ['Hours played', stH(g.hours), 'clock', `<small>${esc(auT('{n} in the last 7 days').replace('{n}', stH(g.hours_7d)))}</small>`],
    ['Avg minutes per visit', (+g.avg_min || 0).toFixed(1), 'timer'],
    ['Accounts with records', stN(g.accounts), 'save', '', '', g.accounts],
    ['Errors', stN(g.errors), 'bug', `<span class="sx-hp">${stHealth(g)}</span><small>${esc(auT('{n} in the last 7 days').replace('{n}', stN(g.errors_7d)))}</small>`, +g.errors_7d ? 'sx-gbad' : '', g.errors],
    ['Last launch', g.last_launch ? adAgo(g.last_launch) : auT('Never'), 'eye', g.last_launch ? `<small>${esc(adDate(g.last_launch, 1))}</small>` : '', 'sx-gw']
  ];
  box.innerHTML = `<div class="sx-gh2" style="--c:${esc(tint)}"><span class="sx-gt">${adCv(g.game_id, '')}</span><div><b translate="no">${esc(adGame(g.game_id))}</b><span><code>${esc(g.game_id)}</code>${gm && gm.info ? `<small>${esc(gm.info.genres.join(' · '))}</small>` : ''}</span></div>${gm ? `<a class="btn2" href="${esc(href(g.game_id))}" data-stopen="${esc(g.game_id)}">${esc(auT('Open game'))}</a>` : ''}</div>
   <div class="sx-gc">${C.map(([k, v, ic, x, cl, n], i) => `<div class="sx-gk ${cl || ''}" style="--i:${i}"><span class="sx-gki">${AD_SI[ic]}</span><small>${esc(auT(k))}</small><b${Number.isInteger(+n) && n !== '' && n != null ? ` data-n="${+n}" data-f="l"` : ''}>${esc(v)}</b>${x || ''}</div>`).join('')}</div>
   <div class="sx-g2">
    <div class="sx-gb"><h4>${esc(auT('Last error'))}</h4>${g.last_error ? `<div class="sx-err"><code translate="no">${esc(String(g.last_error).slice(0, 400))}</code><small>${esc(g.last_error_at ? adAgo(g.last_error_at) : '')}</small></div>` : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div>
    <div class="sx-gb"><h4>${esc(auT('Top players'))}</h4>${P.length ? `<div class="sx-tp">${P.map((p, i) => `<button type="button" class="sx-tpr" data-stu="${esc(p.user_id)}"><span class="sx-rk">${i + 1}</span><span class="pic">${esc((p.display_name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.display_name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) + ' · ' : ''}${esc(auT('{n} plays').replace('{n}', +p.plays || 0))}${p.best_score != null ? ' · ' + esc(auT('best {s}').replace('{s}', p.best_score)) : ''}</small></span><em>${esc(adHrs(p.seconds_played))}</em></button>`).join('')}</div>` : `<div class="adm-mut">${esc(auT('No games played yet.'))}</div>`}</div>
   </div>`;
  if (an) countUp(box);
}
function stReveal(box) {
  const C = [...box.querySelectorAll('.sx-c, .st-grid > .st-card')];
  if (!window.IntersectionObserver) { C.forEach(countUp); return; }
  if (ST.io) ST.io.disconnect();
  ST.io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; ST.io.unobserve(e.target); e.target.classList.remove('sx-wait'); countUp(e.target); }), { threshold: .25 });
  C.forEach(c => { c.classList.add('sx-wait'); ST.io.observe(c); });
}
function stDraw() {
  const D = ST.d || {}, O = D.overview || {}, box = $('#adstats'), el = stShell(), S = stSeries(), days = D.series ? ST.days : S.length;
  const T = [['Active 7 days', O.active_7d], ['Active 30 days', O.active_30d]];
  const ER = D.errors || [], DV = D.devices || [], SQ = D.searches || [], RE = D.retention || [];
  const peakOk = S.some(r => r.peak != null);
  if (!ST.game || !stGames().some(g => g.game_id === ST.game)) ST.game = (stGames().slice().sort((a, b) => (+b.launches || 0) - (+a.launches || 0))[0] || {}).game_id || null;
  const keep = document.activeElement && document.activeElement.id === 'stgq', an = motionOK() ? ST.anim : 0;
  ST.anim = an;
  ST.ch = {};
  box.classList.toggle('sx-q', !an); box.classList.toggle('sx-r', an === 1);
  el.innerHTML = `
  <div class="st-top"><div class="st-card st-livec"><div class="st-h"><h3><i class="adm-dot"></i>${esc(auT('Live now'))}</h3><b class="st-big" id="stln">0</b></div><div class="st-lg" id="stlg"></div><div class="st-live" id="stlive"></div></div>
  <div class="tiles adm-tiles st-tiles">${T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${+n || 0}" data-f="l">${stN(n)}</b></div>`).join('')}</div></div>
  <div class="sx-bar"><h3>${esc(auT('Trends'))}</h3><div class="sx-rng" role="group" aria-label="${esc(auT('Time range'))}">${[7, 30, 90].map(d => `<button type="button" data-strng="${d}" aria-pressed="${d === ST.days}">${esc(auT('{n} days').replace('{n}', d))}</button>`).join('')}</div></div>
  ${stChart('act', 'Active players per day', S, [{ k: 'active', l: 'Active players' }, { k: 'signed_in', l: 'Signed in' }], { agg: 'avg', wide: true })}
  <div class="sx-grid">
   ${peakOk ? stChart('peak', 'Peak online per day', S, [{ k: 'peak', l: 'Peak online' }], { agg: 'max', i: 1, note: 'Most people online at the same time' }) : stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 1, note: 'Peak online starts recording while an admin has this page open' })}
   ${peakOk ? stChart('ses', 'Sessions per day', S, [{ k: 'sessions', l: 'Sessions' }], { agg: 'sum', i: 2 }) : ''}
   ${stChart('hrs', 'Hours played per day', S, [{ k: 'hours', l: 'Hours played' }], { agg: 'sum', dec: true, fmt: stH, i: 3 })}
   ${stChart('new', 'New accounts per day', S, [{ k: 'signups', l: 'New accounts' }], { agg: 'sum', type: 'bar', i: 4 })}
   ${stChart('lch', 'Game launches per day', S, [{ k: 'launches', l: 'Game launches' }], { agg: 'sum', type: 'bar', i: 5 })}
   <div class="st-card sx-c" style="--i:6"><div class="sx-ch"><div><h3>${esc(auT('Share of playtime'))}</h3><p class="sx-note">${esc(D.game_hours ? auT('Last {n} days').replace('{n}', days) : auT('All time'))}</p></div></div>${stDonut()}</div>
  </div>
  <div class="st-card sx-gm"><div class="sx-gh"><h3>${esc(auT('Games'))}</h3>
   <div class="sx-cb"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="stgq" role="combobox" aria-expanded="false" aria-controls="stgl" aria-autocomplete="list" aria-label="${esc(auT('Choose a game'))}" placeholder="${esc(auT('Search games'))}" autocomplete="off" spellcheck="false" value="${esc(ST.game ? adGame(ST.game) : '')}"><button type="button" class="sx-cbt" data-stcb tabindex="-1" aria-label="${esc(auT('Show all games'))}">${AD_ICO.chev}</button><ul id="stgl" role="listbox" aria-label="${esc(auT('Games'))}" hidden></ul></div>
  </div><div id="stgd"></div></div>
  <div class="st-grid">
   <div class="st-card"><h3>${esc(auT('Devices'))}</h3>${stDevices()}<div class="st-list sx-dvl">${DV.slice(0, 6).map(d => `<div class="st-kv"><span>${esc([auT(ST_DEV[d.device] || d.device || ''), d.os, d.browser].filter(Boolean).join(' · '))}</span><b>${stN(d.sessions)}</b></div>`).join('')}</div></div>
   <div class="st-card"><h3>${esc(auT('Recent errors'))}</h3><div class="st-list">${ER.length ? ER.slice(0, 30).map(e => `<div class="st-err"><b>${esc(adGame(e.game_id))}</b><span>${esc(e.message || '')}</span><small>${esc(e.place || '')} · ${esc(e.device || '')} · ${esc(adAgo(e.created_at))}</small></div>`).join('') : `<div class="adm-mut">${esc(auT('No errors. Everything works.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Top searches'))}</h3><div class="st-list">${SQ.length ? SQ.map(s => `<div class="st-kv"><span>${esc(s.query)}${+s.with_no_results ? ` <span class="adm-pill warn">${esc(auT('no result'))}</span>` : ''}</span><b>${stN(s.searches)}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
   <div class="st-card"><h3>${esc(auT('Players coming back'))}</h3><div class="st-list">${RE.length ? RE.map(r => `<div class="st-kv"><span>${esc(adDate(r.cohort_day))} · ${esc(auT('{n} new').replace('{n}', r.new_players))}</span><b>${esc(auT('next day {a}% · week {b}%').replace('{a}', r.day1_pct).replace('{b}', r.back_within_7d_pct))}</b></div>`).join('') : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div></div>
  </div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}. Refreshes every 30 seconds; the live list updates instantly.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  if (an === 2) countUp(el.querySelector('.st-top'));
  if (an) stReveal(el);
  stGameCard(an); stLive();
  if (keep) $('#stgq').focus({ preventScroll: true });
  ST.anim = 0;
}
function stBoot() {
  const box = $('#adstats');
  box.addEventListener('click', e => {
    const sb = e.target.closest('[data-stsub]');
    if (sb) { if (sb.dataset.stsub !== INS.sub) { INS.sub = sb.dataset.stsub; ST.anim = 2; stShell(); adConfetti(e); if (INS.sub === 'ins') insLoad(false); else stLoad(); } return; }
    const rg = e.target.closest('[data-insrng]');
    if (rg) { const d = +rg.dataset.insrng; if (d !== INS.days) { INS.days = d; box.querySelectorAll('[data-insrng]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.insrng === d))); adConfetti(e); insLoad(true); } return; }
    const r = e.target.closest('[data-strng]');
    if (r) { const d = +r.dataset.strng; if (d === ST.days) return; ST.days = d; ST.anim = 1; adConfetti(e); box.querySelectorAll('[data-strng]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.strng === d))); stLoad(true); return; }
    if (e.target.closest('[data-stcb]')) { const inp = $('#stgq'); if ($('#stgl').hidden) { inp.dataset.typed = ''; inp.focus(); stCombo(true); } else stCombo(false); return; }
    const o = e.target.closest('#stgl [data-g]');
    if (o) { if (o.dataset.g !== ST.game) adConfetti(e); stPick(o.dataset.g); return; }
    const u = e.target.closest('[data-stu]');
    if (u) { const x = (AD.users || []).find(y => y.id === u.dataset.stu); if (x) { adTab('users'); adPanel(x); } return; }
    const g = e.target.closest('[data-stopen]');
    if (g) { e.preventDefault(); go(href(g.dataset.stopen), false); }
  });
  box.addEventListener('mousedown', e => { if (e.target.closest('#stgl, [data-stcb]')) e.preventDefault(); });
  box.addEventListener('input', e => { if (e.target.id === 'stgq') { e.target.dataset.typed = '1'; ST.ci = e.target.value.trim() ? 0 : -1; stCombo(true); } });
  box.addEventListener('focusin', e => { if (e.target.id === 'stgq') { e.target.select(); stCombo(true); } });
  box.addEventListener('focusout', e => { if (e.target.id === 'stgq') setTimeout(() => { if (document.activeElement !== e.target) { stCombo(false); if (ST.game) e.target.value = adGame(ST.game); e.target.dataset.typed = ''; } }, 120); });
  box.addEventListener('keydown', e => {
    if (e.target.id !== 'stgq') return;
    const ul = $('#stgl'), n = (ST.opts || []).length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (ul.hidden) { stCombo(true); return; } if (!n) return; ST.ci = e.key === 'ArrowDown' ? (ST.ci + 1) % n : (ST.ci - 1 + n) % n; stCombo(true); }
    else if (e.key === 'Enter') { e.preventDefault(); const o = (ST.opts || [])[Math.max(0, ST.ci)]; if (!ul.hidden && o) { if (o.id !== ST.game) adConfetti(e); stPick(o.id); e.target.blur(); } }
    else if (e.key === 'Escape') { if (!ul.hidden) { e.preventDefault(); e.stopPropagation(); stCombo(false); e.target.value = ST.game ? adGame(ST.game) : ''; e.target.dataset.typed = ''; } }
    else if (e.key === 'Home' || e.key === 'End') { if (!ul.hidden && n && e.target.dataset.typed !== '1') { e.preventDefault(); ST.ci = e.key === 'Home' ? 0 : n - 1; stCombo(true); } }
  });
  box.addEventListener('pointermove', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerdown', e => { const a = e.target.closest('.sx-area'); if (a) stHover(a, e); });
  box.addEventListener('pointerout', e => { const a = e.target.closest('.sx-area'); if (a && !a.contains(e.relatedTarget)) stUnhover(a); });
  box.addEventListener('pointerover', e => { const dn = e.target.closest('.sx-dn'); if (dn) stSeg(dn, e.target.closest('[data-seg]')); });
  box.addEventListener('pointerout', e => { const dn = e.target.closest('.sx-dn'); if (dn && !dn.contains(e.relatedTarget)) stSeg(dn, null); });
  setInterval(() => { if (view !== 'admin' || AD.tab !== 'stats' || document.visibilityState !== 'visible') return; if (INS.sub === 'ins') { if (Date.now() - INS.at > 120000) insLoad(true); } else if (!(document.activeElement && document.activeElement.id === 'stgq')) stLoad(true); }, 30000);
  setInterval(stSample, 60000);
}

function adConfetti(e) {
  if (!motionOK()) return;
  const cv = document.createElement('canvas'), x = cv.getContext('2d'), d = devicePixelRatio || 1, W = innerWidth, H = innerHeight;
  if (!x) return;
  cv.className = 'adcf'; cv.width = W * d; cv.height = H * d; x.scale(d, d);
  document.body.append(cv);
  const el = e && e.target && e.target.closest ? e.target.closest('button, li') || e.target : null, bb = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  const ox = e && e.clientX ? e.clientX : bb ? bb.left + bb.width / 2 : W / 2, oy = e && e.clientY ? e.clientY : bb ? bb.top + bb.height / 2 : H / 3;
  const C = ['#6c5ce7', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#3aa0ff'];
  const P = Array.from({ length: 70 }, () => { const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, s = 5 + Math.random() * 7; return { x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: C[Math.random() * C.length | 0] }; });
  const t0 = performance.now();
  (function f(t) {
    const k = (t - t0) / 1300;
    x.clearRect(0, 0, W, H);
    if (k >= 1) { cv.remove(); return; }
    x.globalAlpha = 1 - k * k;
    P.forEach(p => { p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); x.restore(); });
    requestAnimationFrame(f);
  })(t0);
}

const INS = { d: null, days: 30, busy: false, sub: 'ov', at: 0 };
const insPct = (a, b) => b ? Math.round(100 * a / b) : 0;
const insShare = o => o && o.n ? insPct(o.yes, o.n) + '%' : '—';
const insMs = v => v == null ? '—' : v >= 1000 ? (v / 1000).toFixed(1) + ' s' : Math.round(v) + ' ms';
const insVit = (k, v) => { const T = { lcp: [2500, 4000], inp: [200, 500], cls: [.1, .25], fcp: [1800, 3000], ttfb: [800, 1800] }[k]; if (v == null) return '<span class="adm-mut">—</span>'; const c = v <= T[0] ? 'ok' : v <= T[1] ? 'warn' : 'bad'; return `<span class="adm-pill ${c}">${esc(k === 'cls' ? String(v) : insMs(v))}</span>`; };
const insCountry = c => { try { return new Intl.DisplayNames([adLang()], { type: 'region' }).of(c) || c; } catch (e) { return c; } };
function insBars(title, rows, o) {
  o = o || {};
  const R = (rows || []).filter(r => r && r.n > 0), max = Math.max(1, ...R.map(r => +r.n || 0)), tot = R.reduce((s, r) => s + (+r.n || 0), 0);
  return `<div class="st-card ins-c"><h3>${esc(auT(title))}</h3>${o.note ? `<p class="sx-note">${esc(auT(o.note))}</p>` : ''}${R.length ? `<div class="ins-bars">${R.map((r, i) => `<div class="ins-b" style="--i:${Math.min(i, 14)}"><span class="ins-bk" translate="no" title="${esc(String(r.k))}">${o.fmt ? o.fmt(r.k) : esc(r.k)}</span><i><s style="width:${(100 * r.n / max).toFixed(1)}%"></s></i><b>${o.val ? esc(o.val(r)) : `${stN(r.n)}<small>${insPct(r.n, tot)}%</small>`}</b></div>`).join('')}</div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>`;
}
function insTiles(T) { return `<div class="tiles adm-tiles st-tiles ins-tiles">${T.map(([k, v, n, s], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b${Number.isInteger(n) ? ` data-n="${n}" data-f="l"` : ''}>${esc(v)}</b>${s ? `<small class="ins-ts">${esc(auT(s))}</small>` : ''}</div>`).join('')}</div>`; }
function insHeat(H) {
  const M = {}, max = Math.max(.01, ...(H || []).map(x => +x.v || 0));
  (H || []).forEach(x => { M[x.d + '-' + x.h] = +x.v || 0; });
  const day = d => { try { return new Date(2024, 0, 1 + d).toLocaleDateString(adLang(), { weekday: 'short' }); } catch (e) { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d]; } };
  let h = '<div class="ins-hm" role="img" aria-label="' + esc(auT('Hours played by local day and hour')) + '"><span></span>';
  for (let c = 0; c < 24; c++) h += `<span class="ins-hh">${c % 3 ? '' : c}</span>`;
  for (let d = 0; d < 7; d++) { h += `<span class="ins-hd">${esc(day(d))}</span>`; for (let c = 0; c < 24; c++) { const v = M[d + '-' + c] || 0; h += `<i style="--a:${(v / max).toFixed(3)};--i:${d * 24 + c}" title="${esc(day(d) + ' ' + c + ':00 · ' + stH(v))}"></i>`; } }
  return h + '</div>';
}
function insDraw(an) {
  const box = $('#insv');
  if (!box) return;
  if (!motionOK()) an = false;
  const D = INS.d || {}, G = D.geo || {}, V = D.dev || {}, B = D.behaviour || {}, R = D.retention || {}, RL = D.rl || {}, A = D.ads || {}, C = D.coverage || {};
  const coh = d => (R.cohort || []).find(x => x.d === d) || {}, F = R.funnel || {}, S = R.streaks || {}, sc = B.scroll || {}, all = RL.all || {};
  const rng = `<div class="sx-bar"><h3>${esc(auT('Player data'))}</h3><div class="sx-rng" role="group" aria-label="${esc(auT('Time range'))}">${[7, 30, 90].map(d => `<button type="button" data-insrng="${d}" aria-pressed="${d === INS.days}">${esc(auT('{n} days').replace('{n}', d))}</button>`).join('')}</div></div>`;
  const cov = `<p class="adm-mut ins-cov">${esc(auT('{a} of {b} sessions shared device details and {c} shared location. Only visitors who accepted cookies are counted.').replace('{a}', stN(C.dev)).replace('{b}', stN(C.sessions)).replace('{c}', stN(C.geo)))}</p>`;
  const games = (D.games || []).slice(0, 60), votes = new Map((D.votes || []).map(v => [v.id, v]));
  const inMain = g => { const I = [['Keyboard', g.ik], ['Mouse', g.im], ['Touch', g.it], ['Controller', g.ip]].sort((a, b) => b[1] - a[1]); const t = I.reduce((s, x) => s + (+x[1] || 0), 0); return t ? I.filter(x => x[1] > 0).slice(0, 2).map(x => auT(x[0]) + ' ' + insPct(x[1], t) + '%').join(' · ') : '—'; };
  const gRows = games.map((g, i) => { const vt = votes.get(g.id) || g.votes || {}, s = g.scores || {}, l = g.load || {}; return `<tr style="--i:${Math.min(i, 14)}"><td><span class="ins-gn">${adCv(g.id, 'ins-cv')}<span translate="no">${esc(adGame(g.id))}</span></span></td><td>${stN(g.n)}</td><td>${g.n ? `<span class="adm-pill ${insPct(g.early, g.n) > 40 ? 'bad' : insPct(g.early, g.n) > 20 ? 'warn' : 'ok'}">${insPct(g.early, g.n)}%</span>` : '—'}</td><td>${g.sec != null ? esc(adHrs(g.sec)) : '—'}</td><td>${g.fps != null ? `<b>${g.fps}</b> <span class="adm-mut">/ ${g.fps_low != null ? g.fps_low : '—'}</span>` : '—'}</td><td>${l.n ? esc(insMs(l.p50)) + ' <span class="adm-mut">/ ' + esc(insMs(l.p90)) + '</span>' : '—'}</td><td>${s.n ? `<b>${esc(stN(s.p50))}</b> <span class="adm-mut">${esc(stN(s.p25))}–${esc(stN(s.p75))} · ${esc(auT('max {n}').replace('{n}', stN(s.max)))}</span>` : '—'}</td><td>${g.lv_n ? `${esc(String(g.lv_avg))} <span class="adm-mut">/ ${esc(String(g.lv_max))}</span>` : '—'}</td><td>${esc(inMain(g))}</td><td>${vt.up || vt.down ? `<span class="ins-vt"><b>▲ ${vt.up | 0}</b> <span>▼ ${vt.down | 0}</span></span>` : '—'}</td></tr>`; }).join('');
  const user = (p, x) => `<button type="button" class="sx-tpr" data-stu="${esc(p.id)}"><span class="pic">${esc((p.name || p.username || '?').charAt(0).toUpperCase())}</span><span class="sx-tpn"><b translate="no">${esc(p.name || p.username || '—')}</b><small>${p.username ? '@' + esc(p.username) : ''}</small></span><em>${esc(x)}</em></button>`;
  const slots = (B.slots || []).filter(s => s.src !== 'side').sort((a, b) => a.pos - b.pos || a.src.localeCompare(b.src)).slice(0, 16);
  const funnel = [['Visited', F.visited], ['Launched a game', F.launched], ['Played 1 minute', F.played], ['Created an account', F.account], ['Came back another day', F.returned]];
  const dau = +R.dau || 0, mau = +R.mau || 0;
  box.classList.toggle('sx-q', !an);
  if (an) $('#adstats').classList.remove('sx-q', 'sx-r');
  box.innerHTML = rng + cov + `
  <h2 class="ins-h">${esc(auT('Retention'))}</h2>
  ${insTiles([['Stickiness (daily ÷ monthly)', mau ? insPct(dau, mau) + '%' : '—', null, 'Above 20% is good'], ['Back next day', coh(1).eligible ? insPct(coh(1).back, coh(1).eligible) + '%' : '—'], ['Back after 7 days', coh(7).eligible ? insPct(coh(7).back, coh(7).eligible) + '%' : '—'], ['Back after 30 days', coh(30).eligible ? insPct(coh(30).back, coh(30).eligible) + '%' : '—'], ['At risk of leaving', stN(R.churn_all), +R.churn_all || 0, 'Regulars gone 14+ days'], ['On a streak now', stN(S.active), +S.active || 0, S.avg_cur ? auT('average {n} days').replace('{n}', S.avg_cur) : '']])}
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Funnel'))}</h3><p class="sx-note">${esc(auT('New visitors in this period'))}</p><div class="ins-fun">${funnel.map(([k, n], i) => `<div class="ins-fs" style="--i:${i};--w:${funnel[0][1] ? Math.max(2, 100 * (+n || 0) / funnel[0][1]).toFixed(1) : 0}%"><span>${esc(auT(k))}</span><b>${stN(n)}</b><small>${i ? insPct(n, funnel[0][1]) + '%' : ''}</small></div>`).join('')}</div></div>
   ${insBars('Longest streak (days in a row)', [['1 day', S.b1], ['2–3 days', S.b3], ['4–7 days', S.b7], ['8–14 days', S.b14], ['15+ days', S.b15]].map(([k, n]) => ({ k: auT(k), n: +n || 0 })))}
   <div class="st-card ins-c"><h3>${esc(auT('Top current streaks'))}</h3>${(R.top_streaks || []).length ? `<div class="sx-tp">${R.top_streaks.map(p => user(p, auT('{n} days').replace('{n}', p.cur))).join('')}</div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   <div class="st-card ins-c"><h3>${esc(auT('Players at risk of leaving'))}</h3><p class="sx-note">${esc(auT('Played 3+ days in the last 60, gone for 14+ days'))}</p>${(R.churn || []).length ? `<div class="sx-tp ins-scroll">${R.churn.map(p => user(p, auT('{d} days · {h} h · {t}').replace('{d}', p.days).replace('{h}', p.hours).replace('{t}', adAgo(p.last)))).join('')}</div>` : `<div class="adm-mut">${esc(auT('Nobody right now.'))}</div>`}</div>
  </div>
  <h2 class="ins-h">${esc(auT('Games'))}</h2>
  <div class="st-card"><p class="sx-note">${esc(auT('Per game session: quits under 30 seconds, average session, frames per second (average / worst 10%), load time (median / slowest 10%), final scores (median, middle half, best), level reached at the end (average / highest), main input, thumbs.'))}</p><div class="adm-tw"><table class="adm-t st-t ins-t"><thead><tr>${['Game', 'Sessions', 'Quit < 30 s', 'Avg session', 'FPS', 'Load', 'Scores', 'Level', 'Input', 'Votes'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody class="${an ? 'an' : ''}">${gRows || `<tr><td colspan="10" class="adm-empty">${esc(auT('No data yet.'))}</td></tr>`}</tbody></table></div></div>
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Rocket League matches'))}</h3>${all.n ? `<div class="ins-kv"><span>${esc(auT('Matches'))}</span><b>${stN(all.n)}</b><span>${esc(auT('Win rate'))}</span><b>${insPct(all.wins, all.n)}%</b><span>${esc(auT('Goals / assists / saves / shots per match'))}</span><b>${all.goals} / ${all.assists} / ${all.saves} / ${all.shots}</b><span>${esc(auT('Boost used per match'))}</span><b>${stN(all.boost)}</b><span>${esc(auT('Demos per match'))}</span><b>${all.demos}</b><span>${esc(auT('MVP'))}</span><b>${insPct(all.mvp, all.n)}%</b><span>${esc(auT('Overtime'))}</span><b>${insPct(all.ot, all.n)}%</b></div><div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Bot level', 'Matches', 'Win rate', 'Goal margin'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${(RL.by_diff || []).map(r => `<tr><td>${esc(auT(r.diff))}</td><td>${stN(r.n)}</td><td>${insPct(r.wins, r.n)}%</td><td>${r.margin > 0 ? '+' : ''}${esc(String(r.margin))}</td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No matches yet.'))}</div>`}</div>
   ${insBars('Controls players rebind', (D.rebinds || []).map(r => ({ k: `${adGame(r.game)} · ${r.dev === 'pad' ? auT('Controller') : auT('Keyboard')} · ${r.act}${r.to ? ' → ' + r.to : ''}`, n: r.n })), { val: r => stN(r.n) })}
  </div>
  <h2 class="ins-h">${esc(auT('Clicks and behaviour'))}</h2>
  <div class="ins-grid">
   <div class="st-card ins-c"><h3>${esc(auT('Click rate per slot'))}</h3><p class="sx-note">${esc(auT('A card counts as seen when half of it is on screen for 1 second'))}</p>${slots.length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Where', 'Slot', 'Seen', 'Clicks', 'Click rate'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${slots.map(s => `<tr><td>${esc(auT(s.src === 'grid' ? 'Grid' : s.src === 'rail' ? 'Row' : s.src))}</td><td>#${s.pos + 1}</td><td>${stN(s.imp)}</td><td>${stN(s.clk)}</td><td><b>${s.imp ? (100 * s.clk / s.imp).toFixed(1) : 0}%</b></td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   ${insBars('Click rate per game', (B.ctr || []).slice(0, 15).map(r => ({ k: r.id, n: r.imp ? 100 * r.clk / r.imp : 0.0001, imp: r.imp, clk: r.clk })).sort((a, b) => b.n - a.n), { fmt: id => adCv(id, 'ins-cv') + esc(adGame(id)), val: r => (r.imp ? (100 * r.clk / r.imp).toFixed(1) : 0) + '% · ' + stN(r.imp) })}
   ${insBars('How far people scroll the home page', [['Under 25%', sc.b25], ['25–50%', sc.b50], ['50–75%', sc.b75], ['75–90%', sc.b90], ['90–100%', sc.b100]].map(([k, n]) => ({ k: auT(k), n: +n || 0 })), { note: sc.n ? auT('Average {n}%').replace('{n}', sc.avg) : '' })}
   <div class="st-card ins-c"><h3>${esc(auT('Time on each page and exits'))}</h3>${(B.pages || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Page', 'Visits', 'Avg time', 'Left the site here'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${B.pages.map(p => `<tr><td>${esc(auT({ home: 'Home', game: 'Game', legal: 'Legal pages', admin: 'Admin' }[p.v] || p.v))}</td><td>${stN(p.n)}</td><td>${esc(adHrs(p.sec))}</td><td>${stN(p.exits)} <span class="adm-mut">${insPct(p.exits, p.n)}%</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
   ${insBars('Rage clicks (3 fast clicks in one spot)', B.rage, { val: r => stN(r.n) })}
   ${insBars('Dead clicks (nothing happened)', B.dead, { val: r => stN(r.n) })}
  </div>
  <h2 class="ins-h">${esc(auT('Speed'))}</h2>
  <div class="st-card"><p class="sx-note">${esc(auT('Web Vitals, 75th percentile (what Google uses for ranking). Green is good.'))}</p>${(D.vitals || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Device', 'Visits', 'LCP (main content)', 'INP (reaction)', 'CLS (layout jumps)', 'FCP (first paint)', 'TTFB (server)'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${D.vitals.map(v => `<tr><td>${esc(auT(ST_DEV[v.device] || v.device))}</td><td>${stN(v.n)}</td><td>${insVit('lcp', v.lcp)}</td><td>${insVit('inp', v.inp)}</td><td>${insVit('cls', v.cls)}</td><td>${insVit('fcp', v.fcp)}</td><td>${insVit('ttfb', v.ttfb)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
  <h2 class="ins-h">${esc(auT('Where players are'))}</h2>
  ${insTiles([['Behind a VPN or datacenter', insShare(G.vpn)], ['Datacenter networks', insShare(G.dc)], ['Data saver on', insShare(G.save)], ['Median download speed', G.speed && G.speed.dl != null ? G.speed.dl + ' Mb/s' : '—'], ['Median latency', G.speed && G.speed.rtt != null ? G.speed.rtt + ' ms' : '—']])}
  <div class="st-card ins-c"><h3>${esc(auT('When people play, in their own time'))}</h3><p class="sx-note">${esc(auT('Hours played by local weekday and hour'))}</p>${(G.hours || []).length ? insHeat(G.hours) : `<div class="adm-mut">${esc(auT('No data yet.'))}</div>`}</div>
  <div class="ins-grid">
   ${insBars('Countries', G.countries, { fmt: c => esc(insCountry(c)) + ' <span class="adm-mut">' + esc(c) + '</span>' })}
   ${insBars('Regions', G.regions)}
   ${insBars('Cities', G.cities)}
   ${insBars('Internet providers', G.isps)}
   ${insBars('Connection speed class', G.net)}
   ${insBars('Connection type', G.ctype)}
   ${insBars('Time zones', G.tz)}
  </div>
  <h2 class="ins-h">${esc(auT('Devices'))}</h2>
  ${insTiles([['WebGL 2 support', insShare(V.gl2)], ['WebGPU support', insShare(V.wgpu)], ['Ad blocker on', insShare(A.adblock)]])}
  <div class="ins-grid">
   ${insBars('Operating system versions', V.os)}
   ${insBars('Browser versions', V.browsers)}
   ${insBars('Phone models', V.models)}
   ${insBars('Graphics cards', V.gpus)}
   ${insBars('CPU cores', V.cores)}
   ${insBars('Memory (GB)', V.mem)}
   ${insBars('Screen refresh rate (Hz)', V.hz)}
   ${insBars('Keyboard layouts', V.kb, { fmt: k => esc(String(k).toUpperCase()) })}
   ${insBars('Controllers', V.pads)}
   ${insBars('Controller models', V.pad_ids)}
   ${insBars('CPU architecture', V.arch)}
   ${insBars('Main browser language', V.langs)}
  </div>
  <h2 class="ins-h">${esc(auT('Ads'))}</h2>
  <div class="st-card">${(A.slots || []).length ? `<div class="adm-tw"><table class="adm-t st-t"><thead><tr>${['Slot', 'Impressions', 'Clicks', 'Click rate', 'Revenue (USD)', 'Per 1,000 views'].map(h => `<th><span>${esc(auT(h))}</span></th>`).join('')}</tr></thead><tbody>${A.slots.map(s => `<tr><td>${esc(s.slot)}</td><td>${stN(s.imp)}</td><td>${stN(s.clk)}</td><td>${s.imp ? (100 * s.clk / s.imp).toFixed(2) : 0}%</td><td>${(+s.usd || 0).toFixed(2)}</td><td>${s.imp ? (1000 * s.usd / s.imp).toFixed(2) : '—'}</td></tr>`).join('')}</tbody></table></div>` : `<p class="adm-mut">${esc(auT('No ads on the site yet. Ad blocker use is measured already; impressions, clicks and revenue start counting as soon as an ad slot calls Ameplay.ads.watch(element, slot).'))}</p>`}</div>
  <p class="adm-mut st-at">${esc(auT('Updated {t}.').replace('{t}', new Date(D.at || Date.now()).toLocaleTimeString()))}</p>`;
  if (an) countUp(box);
}
async function insLoad(force) {
  if (!adIsAdmin() || INS.busy) return;
  const box = $('#insv');
  if (!force && INS.d && Date.now() - INS.at < 60000) { insDraw(!!ST.anim); ST.anim = 0; return; }
  INS.busy = true;
  if (!INS.d) box.innerHTML = '<div class="tiles adm-tiles">' + '<div class="tile" aria-hidden="true"><i class="sk sk-tile"></i><i class="sk sk-num"></i></div>'.repeat(4) + '</div><i class="sk sk-chart"></i><i class="sk sk-chart"></i>';
  box.classList.add('sx-busy');
  try { INS.d = await adRpc('admin_insights', { p_days: INS.days }); INS.at = Date.now(); insDraw(!INS.drawn || !!ST.anim); INS.drawn = true; ST.anim = 0; }
  catch (e) { box.innerHTML = `<div class="adm-empty">${esc(/admin_insights|function|404|PGRST/i.test(e.message || '') ? auT('The insights database update is not installed yet. Run round8_insights.sql in the Supabase SQL editor.') : auT('Could not load the stats. Check your connection and try again.'))}</div>`; }
  finally { INS.busy = false; box.classList.remove('sx-busy'); }
}

function tkBox(el, mode) {
  if (el._tk) return el;
  el._tk = { mode, list: null, cur: null, n: 0, sig: '', compose: false };
  el.classList.add('tk');
  el.dataset.mode = mode;
  el.innerHTML = `<div class="tk-side">${mode === 'user' ? `<form class="tk-new" novalidate hidden><div class="fld"><label>${esc(auT('Subject'))}</label><input class="tk-subj-in" maxlength="120" autocomplete="off"></div><div class="fld"><label>${esc(auT('Message'))}</label><textarea class="tk-body-in" maxlength="2000" rows="4"></textarea></div><div class="tk-row"><button class="btn2 tk-cancel" type="button" data-tk="cancel">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="submit">${esc(auT('Send ticket'))}</button></div></form><button class="btn2 pri tk-open" type="button" data-tk="new">${esc(auT('New ticket'))}</button>` : ''}<div class="tk-list" role="list"></div></div><div class="tk-main" hidden><div class="tk-h"><button class="back" type="button" data-tk="back">${AD_ICO.back}${esc(auT('All tickets'))}</button><div class="tk-ht"><b class="tk-subj" translate="no"></b><span class="tk-meta"></span></div><button class="btn2 tk-tog" type="button" data-tk="toggle"></button>${mode === 'admin' ? `<button class="btn2 danger tk-del" type="button" data-tk="del">${esc(auT('Delete ticket'))}</button>` : ''}</div><div class="tk-msgs" translate="no" aria-live="polite"></div><form class="tk-comp" novalidate><textarea maxlength="2000" rows="2" placeholder="${esc(auT('Write a message'))}"></textarea><button class="btn2 pri" type="submit" aria-label="${esc(auT('Send'))}">${AD_ICO.send}<span>${esc(auT('Send'))}</span></button></form></div><div class="note tk-note" role="status"></div>`;
  el.addEventListener('click', e => { const b = e.target.closest('[data-tk]'); if (b) { e.stopPropagation(); tkAct(el, b.dataset.tk, b); } });
  el.addEventListener('submit', e => { e.preventDefault(); if (e.target.classList.contains('tk-new')) tkCreate(el); else tkSend(el); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.tagName === 'TEXTAREA') { e.preventDefault(); e.target.form.requestSubmit(); } });
  return el;
}
const tkNote = (el, m, k) => { const n = el.querySelector('.tk-note'); n.textContent = m ? auT(m) : ''; n.className = 'note tk-note' + (k ? ' ' + k : ''); };
async function tkLoad(el) {
  const T = el._tk;
  if (!SB.user || (T.mode === 'admin' && !adIsAdmin())) return;
  if (!T.list) el.querySelector('.tk-list').innerHTML = '<i class="sk sk-tk" aria-hidden="true"></i>'.repeat(4);
  try {
    const r = await adRpc(T.mode === 'admin' ? 'admin_tickets' : 'my_tickets');
    T.list = Array.isArray(r) ? r : [];
    tkList(el);
    if (T.mode === 'admin' && view === 'admin') adTiles();
  } catch (e) { if (!T.list) el.querySelector('.tk-list').innerHTML = `<div class="adm-empty">${esc(auT('Could not load the tickets. Check your connection and try again.'))}</div>`; }
}
function tkList(el) {
  const T = el._tk, L = T.list || [], adm = T.mode === 'admin';
  const nf = el.querySelector('.tk-new'), ob = el.querySelector('.tk-open');
  if (nf) { const show = T.compose || !L.length; nf.hidden = !show; ob.hidden = show; nf.querySelector('.tk-cancel').hidden = !L.length; }
  el.querySelector('.tk-list').innerHTML = L.length ? L.map((t, i) => {
    const who = adm ? (t.username ? '@' + t.username : t.email || '') : '';
    const flag = t.status === 'open' ? (adm ? (!t.last_admin ? adPill('Needs a reply', 'warn') : '') : (t.last_admin ? adPill('New reply', 'acc') : '')) : '';
    return `<button type="button" class="tk-item${t.id === T.cur ? ' on' : ''}" data-tk="open" data-id="${+t.id}" role="listitem" style="--i:${Math.min(i, 12)}"><span class="tk-it"><b translate="no">${esc(t.subject)}</b>${t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')}</span><span class="tk-is">${who ? `<span translate="no">${esc(who)}</span>` : ''}${adm && t.locked ? adPill('Locked', 'bad') : ''}${flag}<span>${esc(adAgo(t.updated_at))}</span><span>${esc(auT(t.messages === 1 ? '1 message' : '{n} messages').replace('{n}', +t.messages))}</span></span></button>`;
  }).join('') : adm ? `<div class="adm-empty">${esc(auT('No tickets yet.'))}</div>` : '';
}
function tkShow(el, main) {
  el.classList.toggle('tk-in', main);
  el.querySelector('.tk-main').hidden = !main;
  if (el._tk.mode === 'user') el.querySelector('.tk-side').hidden = main;
}
async function tkOpen(el, id) {
  const T = el._tk;
  T.cur = id; T.sig = '';
  const t = (T.list || []).find(x => x.id === id);
  el.querySelector('.tk-subj').textContent = t ? t.subject : '';
  el.querySelector('.tk-msgs').innerHTML = '<i class="sk sk-msg" aria-hidden="true"></i>'.repeat(4);
  tkHead(el);
  tkShow(el, true); tkNote(el, '');
  el.querySelectorAll('.tk-item').forEach(b => b.classList.toggle('on', +b.dataset.id === id));
  await tkThread(el);
  if (!auCoarse()) el.querySelector('.tk-comp textarea').focus({ preventScroll: true });
}
function tkHead(el) {
  const T = el._tk, t = (T.list || []).find(x => x.id === T.cur);
  if (!t) return;
  el.querySelector('.tk-meta').innerHTML = (T.mode === 'admin' ? `<span translate="no">${esc(t.username ? '@' + t.username : t.email || '')}</span>` : '') + (t.status === 'open' ? adPill('Open', 'ok') : adPill('Closed')) + `<span>${esc(auT('Opened {d}').replace('{d}', adDate(t.created_at)))}</span>`;
  const b = el.querySelector('.tk-tog');
  b.textContent = auT(t.status === 'open' ? 'Close ticket' : 'Reopen');
  adUnconfirm(el.querySelector('.tk-del'));
}
async function tkThread(el) {
  const T = el._tk, id = T.cur;
  if (!id || !SB.user) return;
  try {
    const r = await adRpc('ticket_thread', { p_ticket: id });
    if (T.cur !== id) return;
    const ms = Array.isArray(r) ? r : [], sig = ms.length + ':' + (ms.length ? ms[ms.length - 1].id : 0);
    if (sig === T.sig) return;
    const box = el.querySelector('.tk-msgs'), near = !T.sig || box.scrollHeight - box.scrollTop - box.clientHeight < 80, old = T.sig ? +T.sig.split(':')[0] : ms.length;
    T.sig = sig;
    box.innerHTML = ms.map((m, i) => {
      const who = m.mine ? auT('You') : m.is_admin ? (T.mode === 'admin' && m.author ? auT('Admin') + ' · @' + m.author : auT('Admin')) : T.mode === 'admin' ? (m.author ? '@' + m.author : auT('User')) : auT('You');
      return `<div class="tk-m${m.mine ? ' me' : ''}${m.is_admin ? ' tk-adm' : ''}${i >= old ? ' new' : ''}"><div class="tk-b">${esc(m.body)}</div><span class="tk-w">${esc(who)} · ${esc(adAgo(m.created_at))}</span></div>`;
    }).join('');
    if (near) box.scrollTop = box.scrollHeight;
  } catch (e) { tkNote(el, 'Could not load the messages. Check your connection and try again.', 'bad'); }
}
async function tkSend(el) {
  const T = el._tk, ta = el.querySelector('.tk-comp textarea'), b = el.querySelector('.tk-comp button'), v = ta.value.trim();
  if (!v || !T.cur) { auShake(ta); return; }
  b.disabled = true; b.classList.add('is-busy'); tkNote(el, '');
  try {
    await adRpc('ticket_send', { p_ticket: T.cur, p_body: v });
    ta.value = '';
    track('ticket', { act: 'send', admin: T.mode === 'admin' });
    await tkThread(el);
    await tkLoad(el); tkHead(el);
  } catch (e) { tkNote(el, adErr(e), 'bad'); }
  finally { b.disabled = false; b.classList.remove('is-busy'); }
}
async function tkCreate(el) {
  const f = el.querySelector('.tk-new'), s = f.querySelector('.tk-subj-in'), m = f.querySelector('.tk-body-in'), b = f.querySelector('[type=submit]');
  if (!s.value.trim()) { tkNote(el, 'Write a subject.', 'bad'); auShake(s.closest('.fld')); return; }
  if (!m.value.trim()) { tkNote(el, 'Write a message.', 'bad'); auShake(m.closest('.fld')); return; }
  b.disabled = true; tkNote(el, 'Sending…');
  try {
    const id = await adRpc('ticket_create', { p_subject: s.value, p_body: m.value });
    s.value = ''; m.value = ''; el._tk.compose = false;
    track('ticket', { act: 'create' });
    tkNote(el, '');
    await tkLoad(el);
    tkOpen(el, +id);
  } catch (e) { tkNote(el, adErr(e) === 'Too many messages. Wait a minute and try again.' ? 'Too many tickets. Wait a while and try again.' : adErr(e), 'bad'); }
  finally { b.disabled = false; }
}
async function tkAct(el, k, b) {
  const T = el._tk;
  if (k === 'new') { T.compose = true; tkList(el); if (!auCoarse()) el.querySelector('.tk-subj-in').focus(); return; }
  if (k === 'cancel') { T.compose = false; tkNote(el, ''); tkList(el); return; }
  if (k === 'open') { tkOpen(el, +b.dataset.id); return; }
  if (k === 'back') { T.cur = null; tkShow(el, false); tkNote(el, ''); tkList(el); tkLoad(el); return; }
  if (k === 'del') {
    const id = T.cur;
    if (!id || T.mode !== 'admin' || !adConfirm(b)) return;
    b.disabled = true; b.classList.add('is-busy'); tkNote(el, '');
    try {
      await adRpc('admin_delete_ticket', { p_ticket: id });
      track('ticket', { act: 'delete', admin: true });
      T.list = (T.list || []).filter(x => x.id !== id);
      if (T.cur === id) { T.cur = null; T.sig = ''; tkShow(el, false); }
      tkList(el); tkNote(el, 'Ticket deleted.', 'ok'); toast(auT('Ticket deleted.'));
      if (view === 'admin') adTiles();
      tkLoad(el);
    } catch (e) { tkNote(el, adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
    return;
  }
  if (k === 'toggle') {
    const t = (T.list || []).find(x => x.id === T.cur);
    if (!t) return;
    b.disabled = true;
    try { const s = await adRpc('ticket_set_status', { p_ticket: t.id, p_status: t.status === 'open' ? 'closed' : 'open' }); t.status = s; tkHead(el); tkList(el); track('ticket', { act: s }); tkLoad(el); }
    catch (e) { tkNote(el, adErr(e), 'bad'); }
    finally { b.disabled = false; b.classList.remove('is-busy'); }
  }
}
function adSupport() {
  if (!SB.user) { closeAll(); auOpen('main', '', '', 'in'); return; }
  const el = tkBox($('#tks'), 'user');
  tkLoad(el);
}

addEventListener('keydown', e => {
  if (!AD.locked) return;
  const s = document.getElementById('lgsheet');
  if (s && !s.hidden) return;
  e.stopImmediatePropagation();
}, true);
function adBoot() {
  $('#adbout').addEventListener('click', () => { auSignOut(); });
  document.addEventListener('click', e => {
    const t = e.target;
    const ag = t.closest && t.closest('[data-adgo]');
    if (ag) { e.preventDefault(); closeAll(); AD.tab = ag.dataset.adgo || 'users'; if (view === 'admin') adTab(AD.tab); else go(adHref(), false); }
  });
  const va = $('#vAdmin');
  va.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-adsort]');
    if (s) { const k = s.dataset.adsort; AD.sort = AD.sort[0] === k ? [k, -AD.sort[1]] : [k, /_at$|last_seen|friends|email_confirmed|locked|role|has_password/.test(k) ? -1 : 1]; adDraw(); return; }
    const tb = t.closest('[data-adtab]');
    if (tb) { adTab(tb.dataset.adtab); return; }
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); if (AD.tab === 'stats') { if (INS.sub === 'ins') insLoad(true); else stLoad(true); } if (AD.tab === 'log') alLoad(); if (AD.tab === 'site') sfLoad(true).then(sfaDraw); return; }
    if (t.closest('[data-almore]')) { alLoad(true); return; }
    const alu = t.closest('[data-alu]');
    if (alu) { const x = (AD.users || []).find(y => y.id === alu.dataset.alu); if (x) { adTab('users'); adPanel(x); } return; }
    const sg = t.closest('[data-sfg]');
    if (sg) { sg.setAttribute('aria-pressed', String(sg.getAttribute('aria-pressed') !== 'true')); return; }
    const sm = t.closest('#sfam');
    if (sm) { sm.classList.toggle('on'); sm.setAttribute('aria-checked', String(sm.classList.contains('on'))); return; }
    if (t.closest('#sfas')) { sfaSave(t.closest('#sfas')); return; }
    if (t.closest('#sfps')) { sfpSave(t.closest('#sfps')); return; }
    if (t.closest('#adpclose')) { adPanelClose(); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const a = t.closest('[data-adact]');
    if (a) { adAct(a.dataset.adact, a); return; }
    const tr = t.closest('#adt tbody tr[data-uid]');
    if (tr) { const u = (AD.users || []).find(x => x.id === tr.dataset.uid); if (u) adPanel(u); }
  });
  va.addEventListener('keydown', e => {
    if (e.key === 'Escape' && AD.tab === 'users' && !$('#adpanel').hidden) { e.preventDefault(); e.stopPropagation(); adPanelClose(); return; }
    const tr = e.target.closest && e.target.closest('#adt tbody tr[data-uid]');
    if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click(); }
  });
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const T = AD_TABS, i = T.indexOf(AD.tab); adTab(T[(i + (e.key === 'ArrowRight' ? 1 : T.length - 1)) % T.length]); $('#adtabs [aria-selected="true"]').focus(); } });
  stBoot();
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adsite').addEventListener('input', e => { if (e.target.id !== 'sfaq') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('#sfag [data-sfg]').forEach(c => { c.hidden = !!q && !c.textContent.toLowerCase().includes(q) && !c.dataset.sfg.includes(q); }); });
  $('#adf').addEventListener('change', e => { AD.f = e.target.value; adDraw(); });
  $('#adpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#adpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('pw', $('#adpwb')); } });
  $('#adun').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; });
  $('#adun').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('un', $('#adunb')); } });
  setInterval(() => {
    if (!SB.user || document.visibilityState === 'hidden') return;
    document.querySelectorAll('.tk').forEach(el => { if (!el._tk || el.closest('[hidden]')) return; if (el._tk.cur) tkThread(el); if (++el._tk.n % 5 === 0) tkLoad(el); });
  }, 6000);
  setInterval(() => { if (SB.user && document.visibilityState !== 'hidden') adCheck(); }, 180000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible' && Date.now() - AD.at > 60000) adCheck(); });
}

const RT = { me: null, ch: null, on: null, pres: {}, seen: false, tt: 0 };
const SO_ICO = {
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pad: '<svg viewBox="0 0 24 24"><path d="M7 8h10a5 5 0 0 1 4.6 7l-.6 1.4a2.5 2.5 0 0 1-4.3.4L15 15H9l-1.7 1.8a2.5 2.5 0 0 1-4.3-.4L2.4 15A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3M16 12h.01M18 11h.01"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  min: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  add: '<svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 12.5-4.3M19 14v6M16 17h6"/></svg>',
  join: '<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5M15 12H3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>',
  find: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>'
};
const soName = id => { const f = (FR.list || []).find(x => x.friend_id === id); return f ? (f.display_name || f.username || '?') : auT('A friend'); };
const soFriend = id => (FR.list || []).find(x => x.friend_id === id) || null;
const soOn = id => { const p = RT.pres[id]; return p && !p.h ? p : null; };
const soParty = () => { try { if (cur && cur.api && cur.api.online) { const n = cur.api.net; if (n && n.code) return { game: cur.g.id, code: String(n.code).toUpperCase() }; } } catch (e) {} return null; };
const soGameName = id => id ? (byId.get(id) ? byId.get(id).title : id) : '';
const soCan = id => { const g = id && byId.get(id); return !!(g && g.info && onlineMax(g.info.pl) > 0); };
const SO = { pend: null, want: null, act: Date.now(), away: false, party: false, ty: {}, tyAt: 0, tyT: 0, v: 'list', last: null, q: '', pt: 0, key: '', gk: '' };
const soIdle = () => Date.now() - SO.act > 300000 || document.visibilityState === 'hidden' && Date.now() - SO.act > 60000;
const soDot = on => on ? on.a ? ' away' : ' on' : '';

function rtStart() {
  if (!SB.c || !SB.user || RT.me === SB.user.id) return;
  rtStop();
  const me = RT.me = SB.user.id;
  try {
    RT.ch = SB.c.channel('u:' + me).on('broadcast', { event: 'n' }, m => rtNudge(m && m.payload || {})).subscribe();
    RT.on = SB.c.channel('online', { config: { presence: { key: me } } }).on('presence', { event: 'sync' }, rtSync).subscribe(s => { if (s === 'SUBSCRIBED') rtTrack(true); });
  } catch (e) {}
}
function rtStop() {
  try { if (RT.ch) SB.c.removeChannel(RT.ch); if (RT.on) SB.c.removeChannel(RT.on); } catch (e) {}
  RT.ch = RT.on = RT.me = null; RT.seen = false; RT.pres = {};
  soLive();
}
function rtTrack(now) {
  clearTimeout(RT.tt);
  if (!RT.on) return;
  RT.tt = setTimeout(() => {
    if (!RT.on || !SB.user) return;
    const P = S.prefs, hide = P.p_status === 'Nobody', g = P.p_game === false || !cur ? null : cur.g.id, pa = soParty();
    SO.away = soIdle(); SO.party = !!(g && pa && pa.game === g);
    RT.on.track(hide ? { h: 1 } : { g, t: Date.now(), a: SO.away ? 1 : 0, p: SO.party ? 1 : 0 }).catch(() => {});
  }, now ? 0 : 400);
}
function rtSync() {
  const s = RT.on ? RT.on.presenceState() : {}, prev = RT.pres, P = {};
  for (const k in s) { const a = s[k]; if (a && a.length) P[k] = a[a.length - 1]; }
  RT.pres = P;
  if (RT.seen && S.prefs.n_on) (FR.list || []).forEach(f => { const id = f.friend_id; if (P[id] && !P[id].h && !(prev[id] && !prev[id].h)) ntPush({ k: 'online', from: id, t: auT('{u} is online').replace('{u}', soName(id)), b: P[id].g ? auT('Playing {g}').replace('{g}', soGameName(P[id].g)) : '', a: { type: 'chat', uid: id } }); });
  RT.seen = true;
  soLive();
}
function rtSend(uid, p) {
  if (!SB.c || !uid) return Promise.resolve();
  return new Promise(res => {
    let done = false;
    const ch = SB.c.channel('u:' + uid);
    const fin = () => { if (done) return; done = true; try { SB.c.removeChannel(ch); } catch (e) {} res(); };
    try { ch.subscribe(s => { if (s === 'SUBSCRIBED') ch.send({ type: 'broadcast', event: 'n', payload: p }).then(fin, fin); else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') fin(); }); } catch (e) { fin(); }
    setTimeout(fin, 6000);
  });
}
function rtNudge(p) {
  const t = p && p.t;
  if (t === 'status') adCheck();
  else if (t === 'deleted') { AD.del = true; adCheck(); }
  else if (t === 'profile') auLoadProfile().then(() => { auRender(); renderProfileBits(); }).catch(() => {});
  else if (t === 'dm') dmPoll();
  else if (t === 'fr') frNudge();
  else if (t === 'ty' || t === 'rd') {
    const f = typeof p.f === 'string' ? p.f : '';
    if (!soFriend(f)) return;
    if (t === 'rd') { if (DM.open === f) dmSeenSync(); return; }
    SO.ty[f] = Date.now() + 6000;
    soTyDraw(); soList();
  }
}

function soStatus(id) {
  const on = soOn(id);
  if (!on) return auT('Offline');
  const g = on.g ? soGameName(on.g) : '';
  if (on.p && g) return auT('In a party · {g}').replace('{g}', g);
  if (g) return on.a ? auT('Away · {g}').replace('{g}', g) : auT('Playing {g}').replace('{g}', g);
  return on.a ? auT('Away') : auT('Online');
}
function soLive() {
  const n = Object.keys(RT.pres).filter(k => !RT.pres[k].h).length, pill = $('#onl');
  if (pill) { pill.hidden = !SB.user || !n; pill.querySelector('b').textContent = n; pill.title = auT(n === 1 ? '1 player online' : '{n} players online').replace('{n}', n); }
  const by = {};
  Object.values(RT.pres).forEach(p => { if (p.g && !p.h) by[p.g] = (by[p.g] || 0) + 1; });
  document.querySelectorAll('#grid [data-id]').forEach(el => {
    const c = by[el.dataset.id] || 0;
    let b = el.querySelector('.livepill');
    if (!c) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('span'); b.className = 'livepill'; b.setAttribute('translate', 'no'); (el.querySelector('.art') || el).append(b); }
    b.textContent = auT('{n} playing').replace('{n}', c);
  });
  if (openK === 'friends' && FR.list) frDraw();
  if (DM.open) dmHead();
  soList(); soDockSync();
  if (view === 'admin') {
    document.querySelectorAll('#adt tbody tr[data-uid]').forEach(tr => tr.classList.toggle('on', !!RT.pres[tr.dataset.uid]));
    const u = adCur(); if (u && !$('#adpanel').hidden) $('#adplive').innerHTML = adLiveTxt(u);
    if (AD.tab === 'stats') stLive();
  }
}

const NT = { list: [], key: '' };
function ntLoad() {
  NT.key = SB.user ? 'gameplay:notifs:' + SB.user.id : 'gameplay:notifs';
  try { NT.list = JSON.parse(localStorage.getItem(NT.key) || '[]') || []; } catch (e) { NT.list = []; }
  ntBadge();
}
function ntSave() { try { localStorage.setItem(NT.key, JSON.stringify(NT.list.slice(0, 60))); } catch (e) {} }
function ntBadge() {
  const n = NT.list.filter(x => !x.r).length, b = $('#nbtn em');
  if (b) { b.textContent = n > 9 ? '9+' : n; b.hidden = !n; }
  const fb = $('#abtn em'), u = DM.unread + (FR.req || []).filter(r => r.direction === 'incoming').length;
  if (fb) { fb.textContent = u > 9 ? '9+' : u; fb.hidden = !u; }
  const db = $('#sodl em');
  if (db) { db.textContent = DM.unread > 9 ? '9+' : DM.unread; db.hidden = !DM.unread; $('#sodl').classList.toggle('so-hot', !!DM.unread); }
  soDockSync();
}
function ntPush(n) {
  n.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  n.at = Date.now(); n.r = false;
  NT.list.unshift(n);
  NT.list = NT.list.slice(0, 60);
  ntSave(); ntBadge();
  if (openK === 'notifs') ntDraw();
  ntToast(n);
}
function ntIcon(k) { return k === 'dm' ? SO_ICO.chat : k === 'image' ? SO_ICO.img : k === 'invite' || k === 'join' ? SO_ICO.pad : k === 'game' ? SO_ICO.star : SO_ICO.user; }
function ntActLabel(n) { const a = n.a || {}; return a.type === 'join' ? 'Join' : a.type === 'invite' ? 'Invite' : a.type === 'chat' ? (n.k === 'online' ? 'Say hi' : 'Reply') : a.type === 'game' ? 'Play' : a.type === 'friends' ? 'Open' : ''; }
function ntToast(n) {
  let box = $('#ntst');
  if (!box) { box = document.createElement('div'); box.id = 'ntst'; box.className = 'ntst'; box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  if (AD.locked) return;
  const host = soHostEl();
  if (box.parentNode !== host) host.append(box);
  sfx('pop');
  const el = document.createElement('div'), lab = ntActLabel(n);
  el.className = 'nt';
  el.dataset.k = n.k;
  el.innerHTML = `<span class="nt-i">${ntIcon(n.k)}</span><div class="nt-t"><b translate="no">${esc(n.t)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}</div>${lab ? `<button class="btn2 pri" type="button" data-nt="go">${esc(auT(lab))}</button>` : ''}<button class="x" type="button" data-nt="x" aria-label="${esc(auT('Close'))}">${SO_ICO.x}</button>`;
  const kill = () => { if (!el.isConnected) return; el.classList.add('out'); setTimeout(() => el.remove(), motionOK() ? 220 : 0); };
  let t = setTimeout(kill, n.k === 'invite' || n.k === 'join' ? 25000 : 7000);
  el.addEventListener('mouseenter', () => clearTimeout(t));
  el.addEventListener('mouseleave', () => { t = setTimeout(kill, 4000); });
  el.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('[data-nt]'); if (b && b.dataset.nt === 'x') { kill(); return; } ntRead(n.id); ntAct(n); kill(); });
  box.append(el);
  while (box.children.length > 4) box.firstElementChild.remove();
}
function ntRead(id) { const n = NT.list.find(x => x.id === id); if (n && !n.r) { n.r = true; ntSave(); ntBadge(); } }
async function ntAct(n) {
  const a = n.a || {};
  if (a.type === 'chat') dmOpen(a.uid);
  else if (a.type === 'join') { closeAll(); go(href(a.game, a.code), false); toast(auT('Joining the party…')); }
  else if (a.type === 'invite') soInvite(a.uid, soCan(a.game) ? a.game : null);
  else if (a.type === 'game') { closeAll(); go(href(a.game), false); }
  else if (a.type === 'friends') { if (openK !== 'friends') setOpen('friends'); }
}
function ntDraw() {
  const box = $('#nlist');
  if (!box) return;
  box.innerHTML = NT.list.length ? NT.list.map(n => `<button class="nrow${n.r ? '' : ' new'}" type="button" data-nid="${esc(n.id)}"><span class="nt-i">${ntIcon(n.k)}</span><span class="nt-t"><b translate="no">${esc(n.t)}</b>${n.b ? `<span translate="no">${esc(n.b)}</span>` : ''}<small>${esc(adAgo(new Date(n.at).toISOString()))}</small></span></button>`).join('') : `<div class="nofr">${esc(auT('No notifications yet.'))}</div>`;
}

const DM = { inbox: [], last: {}, open: null, msgs: [], urls: new Map(), unread: 0, first: true, t: 0, busy: false, prev: null };
async function dmPoll() {
  if (!SB.user) return;
  let r;
  try { r = await adRpc('dm_inbox'); } catch (e) { return; }
  if (!SB.user) return;
  const L = Array.isArray(r) ? r : [];
  L.forEach(c => {
    const was = DM.last[c.other_id] || 0, fresh = !DM.first && !c.last_mine && c.last_id > was;
    DM.last[c.other_id] = c.last_id;
    if (!fresh) return;
    delete SO.ty[c.other_id];
    if (soAuto(c)) return;
    if (!(DM.open === c.other_id && document.visibilityState === 'visible')) dmNotify(c);
  });
  DM.first = false; DM.inbox = L;
  DM.unread = L.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0);
  ntBadge();
  if (openK === 'friends' && FR.list) frDraw();
  soList();
  if (DM.open) dmThread();
}
function soAuto(c) {
  const m = c.last_meta || {}, id = c.other_id;
  if (c.last_kind === 'invite' && SO.want && SO.want.id === id && Date.now() - SO.want.t < 180000 && m.game && m.code) {
    SO.want = null;
    dmClose(); closeAll();
    go(href(m.game, m.code), false);
    toast(auT('{u} let you in. Joining the party…').replace('{u}', soName(id)));
    return true;
  }
  if (c.last_kind === 'join') {
    const p = soParty();
    if (!p || S.prefs.p_inv === 'Nobody') return false;
    dmSend(id, 'invite', null, p).then(() => ntPush({ k: 'join', from: id, t: auT('{u} is joining your party').replace('{u}', soName(id)), b: soGameName(p.game) + ' · ' + auT('Code {c}').replace('{c}', p.code), a: { type: 'chat', uid: id } })).catch(() => dmNotify(c));
    return true;
  }
  return false;
}
function dmNotify(c) {
  const name = soName(c.other_id), m = c.last_meta || {}, P = S.prefs;
  if (c.last_kind === 'invite') { if (P.n_inv === false || P.p_inv === 'Nobody') return; ntPush({ k: 'invite', from: c.other_id, t: auT('{u} invited you to play').replace('{u}', name), b: soGameName(m.game), a: { type: 'join', game: m.game, code: m.code, uid: c.other_id } }); }
  else if (c.last_kind === 'join') { if (P.n_inv === false || P.p_inv === 'Nobody') return; ntPush({ k: 'join', from: c.other_id, t: auT('{u} wants to join your party').replace('{u}', name), b: soGameName(m.game), a: { type: 'invite', game: m.game, uid: c.other_id } }); }
  else { if (P.n_msg === false) return; ntPush({ k: c.last_kind === 'image' ? 'image' : 'dm', from: c.other_id, t: name, b: c.last_kind === 'image' ? auT('Sent a picture') : String(c.last_body || '').slice(0, 140), a: { type: 'chat', uid: c.other_id } }); }
}
async function dmSend(uid, kind, body, meta) {
  const id = await adRpc('dm_send', { p_to: uid, p_kind: kind, p_body: body || null, p_meta: meta || {} });
  rtSend(uid, { t: 'dm' });
  track('dm', { act: kind });
  if (DM.open === uid) dmThread();
  else dmPoll();
  return id;
}

function soHostEl() { return document.fullscreenElement || (gamebox.classList.contains('pfs') ? gamebox : document.body); }
function soPlace() {
  const h = soHostEl();
  ['#sodl', '#chat', '#ntst', '#soLight'].forEach(s => { const el = $(s); if (el && el.parentNode !== h) h.append(el); });
}
function soDockSync() {
  const b = $('#sodl');
  if (!b) return;
  b.hidden = !SB.user || !!AD.locked;
  const n = (FR.list || []).filter(f => soOn(f.friend_id)).length, o = b.querySelector('.so-dlo');
  o.hidden = !n; o.querySelector('b').textContent = n;
  b.setAttribute('aria-label', auT('Chat') + (DM.unread ? ' · ' + auT('{n} unread').replace('{n}', DM.unread) : '') + (n ? ' · ' + auT('{n} friends online').replace('{n}', n) : ''));
}
function soSave() { if (!SO.key) return; const el = $('#chat'); try { localStorage.setItem(SO.key, JSON.stringify({ o: !!(el && !el.hidden), v: SO.v, u: SO.last })); } catch (e) {} }
function soView(v) {
  SO.v = v;
  const el = soChatEl();
  el.classList.toggle('so-v-list', v === 'list'); el.classList.toggle('so-v-conv', v === 'conv');
  el.setAttribute('aria-label', v === 'list' ? auT('Chats') : auT('Chat with {u}').replace('{u}', soName(DM.open)));
}
function soShow(on) {
  const el = soChatEl(), b = $('#sodl');
  if (on) { soPlace(); vis(el, true); document.body.classList.add('chat-open'); }
  else { vis(el, false); document.body.classList.remove('chat-open'); }
  if (b) b.setAttribute('aria-expanded', String(on));
}
function soDock() {
  const el = soChatEl();
  if (!el.hidden) { dmClose(); return; }
  closeAll();
  if (SO.v === 'conv' && SO.last && soFriend(SO.last)) { dmOpen(SO.last); return; }
  soView('list'); soShow(true); soList(); soSave();
  if (!FR.list) frLoad().then(soList);
  if (!auCoarse()) el.querySelector('.so-sr input').focus({ preventScroll: true });
}
function dmBack() {
  clearInterval(DM.t); DM.open = null;
  soPick(false); soView('list'); soList(); soSave(); dmPoll();
  DM.unread = DM.inbox.reduce((n, c) => n + (+c.unread || 0), 0); ntBadge();
  const i = $('#chat .so-sr input'); if (i && !auCoarse()) i.focus({ preventScroll: true });
}
function soChatEl() {
  let el = $('#chat');
  if (el) return el;
  el = document.createElement('aside');
  el.id = 'chat'; el.className = 'chat so-v-list'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', auT('Chats'));
  const xb = `<button class="x" type="button" data-ch="close" aria-label="${esc(auT('Minimize chat'))}" title="${esc(auT('Minimize chat'))}">${SO_ICO.min}</button>`;
  el.innerHTML = `<div class="so-lv"><div class="ch-h so-lh"><span class="so-li">${SO_ICO.chat}</span><div class="ch-n"><b>${esc(auT('Chats'))}</b><span class="ch-s so-lc"></span></div><button class="x" type="button" data-ch="find" aria-label="${esc(auT('Add friends'))}" title="${esc(auT('Add friends'))}">${SO_ICO.add}</button>${xb}</div><label class="so-sr">${SO_ICO.find}<input type="search" placeholder="${esc(auT('Search friends'))}" aria-label="${esc(auT('Search friends'))}" autocomplete="off" spellcheck="false" maxlength="40"></label><div class="so-fl"></div></div>` +
    `<div class="so-cv"><div class="ch-h"><button class="x so-bk" type="button" data-ch="back" aria-label="${esc(auT('Back to chats'))}" title="${esc(auT('Back to chats'))}">${SO_ICO.back}<em hidden></em></button><span class="pic"></span><div class="ch-n"><b translate="no"></b><span class="ch-s"></span></div>${xb}</div><div class="ch-acts"></div><div class="ch-m" translate="no" aria-live="polite"></div><div class="so-ty" aria-live="polite" hidden></div><div class="note ch-note" role="status"></div><form class="ch-f" novalidate><button class="ch-ib" type="button" data-ch="img" aria-label="${esc(auT('Send a picture'))}" title="${esc(auT('Send a picture'))}">${SO_ICO.img}</button><input type="file" accept="image/*" hidden><textarea rows="1" maxlength="2000" aria-label="${esc(auT('Message'))}"></textarea><button class="ch-sb" type="submit" aria-label="${esc(auT('Send'))}">${SO_ICO.send}</button></form>` +
    `<div class="so-pk" hidden><div class="ch-h"><button class="x" type="button" data-ch="pkx" aria-label="${esc(auT('Back'))}">${SO_ICO.back}</button><div class="ch-n"><b class="so-pt"></b><span class="ch-s">${esc(auT('A party starts and your invite goes out with the code.'))}</span></div></div><div class="so-pl"></div></div></div>`;
  document.body.append(el);
  const ta = el.querySelector('textarea'), fi = el.querySelector('input[type=file]'), sr = el.querySelector('.so-sr input');
  el.addEventListener('click', e => { const b = e.target.closest('[data-ch]'); if (b) { e.stopPropagation(); dmAct(b.dataset.ch, b); } const im = e.target.closest('.ch-pic img'); if (im && im.src) soLight(im.src); });
  el.addEventListener('submit', e => { e.preventDefault(); dmSendText(); });
  el.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); if (!el.querySelector('.so-pk').hidden) soPick(false); else { dmClose(); const b = $('#sodl'); if (b && !b.hidden) b.focus({ preventScroll: true }); } return; }
    if (e.key === 'Enter' && !e.shiftKey && e.target === ta) { e.preventDefault(); dmSendText(); }
    if (e.key === 'ArrowDown' && e.target === sr) { e.preventDefault(); const f = el.querySelector('.so-fl [data-ch="so"]'); if (f) f.focus(); }
  });
  el.addEventListener('keyup', e => e.stopPropagation());
  ta.addEventListener('input', () => {
    ta.style.height = 'auto'; ta.style.height = Math.min(120, ta.scrollHeight) + 'px';
    if (ta.value.trim() && DM.open && SB.user && Date.now() - SO.tyAt > 3000) { SO.tyAt = Date.now(); rtSend(DM.open, { t: 'ty', f: SB.user.id }); }
  });
  ta.addEventListener('paste', e => { const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => /^image\//.test(x.type)); if (f) { e.preventDefault(); dmImage(f); } });
  sr.addEventListener('input', () => { SO.q = sr.value.trim().toLowerCase().replace(/^@/, ''); soList(); });
  fi.addEventListener('change', () => { const f = fi.files && fi.files[0]; fi.value = ''; if (f) dmImage(f); });
  el.addEventListener('dragover', e => { if (DM.open) { e.preventDefault(); el.classList.add('so-drop'); } });
  el.addEventListener('dragleave', e => { if (!el.contains(e.relatedTarget)) el.classList.remove('so-drop'); });
  el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('so-drop'); const f = [...(e.dataTransfer && e.dataTransfer.files || [])].find(x => /^image\//.test(x.type)); if (f && DM.open) dmImage(f); });
  return el;
}
function soPreview(c) {
  const m = c.last_meta || {}, k = c.last_kind;
  const s = k === 'image' ? auT('Picture') : k === 'invite' ? auT('Party invite · {g}').replace('{g}', soGameName(m.game)) : k === 'join' ? auT('Asked to join · {g}').replace('{g}', soGameName(m.game)) : String(c.last_body || '').split('\n')[0];
  return c.last_mine ? auT('You: {m}').replace('{m}', s) : s;
}
function soWhen(t) {
  const d = new Date(t), n = new Date();
  if (isNaN(d)) return '';
  if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (n - d < 6 * 864e5) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function soDay(t) {
  const d = new Date(t), n = new Date(), y = new Date(n - 864e5);
  if (d.toDateString() === n.toDateString()) return auT('Today');
  if (d.toDateString() === y.toDateString()) return auT('Yesterday');
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: d.getFullYear() === n.getFullYear() ? undefined : 'numeric' });
}
function soList() {
  const el = $('#chat');
  if (!el || el.hidden || SO.v !== 'list') return;
  const box = el.querySelector('.so-fl'), q = SO.q, all = FR.list;
  const req = (FR.req || []).filter(r => r.direction === 'incoming').length;
  const on = (all || []).filter(f => soOn(f.friend_id)).length;
  el.querySelector('.so-lc').textContent = all ? auT('{n} online').replace('{n}', on) + ' · ' + auT(all.length === 1 ? '1 friend' : '{n} friends').replace('{n}', all.length) : '';
  if (!all) { box.innerHTML = '<i class="sk sk-row"></i>'.repeat(3); return; }
  const conv = id => DM.inbox.find(c => c.other_id === id);
  const at = f => { const c = conv(f.friend_id); return c ? Date.parse(c.last_at) || 0 : 0; };
  const un = f => { const c = conv(f.friend_id); return c ? +c.unread || 0 : 0; };
  const rank = f => { const o = soOn(f.friend_id); return o ? (o.p ? 3 : o.g ? 2 : 1) - (o.a ? 1.5 : 0) : 0; };
  const L = all.filter(f => !q || (f.username || '').includes(q) || (f.display_name || '').toLowerCase().includes(q));
  const srt = (a, b) => (un(b) > 0) - (un(a) > 0) || rank(b) - rank(a) || at(b) - at(a) || (a.display_name || a.username || '').localeCompare(b.display_name || b.username || '');
  const A = L.filter(f => soOn(f.friend_id)).sort(srt), B = L.filter(f => !soOn(f.friend_id)).sort(srt);
  const row = f => {
    const id = f.friend_id, o = soOn(id), c = conv(id), n = c ? +c.unread || 0 : 0, name = f.display_name || f.username || '?', ty = SO.ty[id] > Date.now();
    const pv = ty ? `<span class="so-pv so-typ">${esc(auT('typing…'))}</span>` : c ? `<span class="so-pv">${esc(soPreview(c))}</span>` : `<span class="so-pv">@${esc(f.username || '')}</span>`;
    return `<button class="so-fr${n ? ' un' : ''}${o ? '' : ' off'}" type="button" data-ch="so" data-id="${esc(id)}" aria-label="${esc(name + ', ' + soStatus(id) + (n ? ', ' + auT('{n} unread').replace('{n}', n) : ''))}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(o)}"></i></span><span class="so-ft"><span class="so-fn"><b translate="no">${esc(name)}</b>${c ? `<time>${esc(soWhen(c.last_at))}</time>` : ''}</span><small class="so-st${o ? o.a ? ' aw' : ' on' : ''}">${esc(soStatus(id))}</small><span class="so-fn2" translate="no">${pv}${n ? `<em>${n > 9 ? '9+' : n}</em>` : ''}</span></span></button>`;
  };
  const sec = (t, a) => a.length ? `<div class="so-sh">${esc(t)} — ${a.length}</div>` + a.map(row).join('') : '';
  let h = req ? `<button class="so-req" type="button" data-ch="find">${SO_ICO.add}<span>${esc(auT(req === 1 ? '1 friend request' : '{n} friend requests').replace('{n}', req))}</span></button>` : '';
  if (!all.length) h += `<div class="so-empty">${SO_ICO.user}<b>${esc(auT('No friends yet'))}</b><span>${esc(auT('Add friends to chat and play together.'))}</span><button class="btn2 pri" type="button" data-ch="find">${esc(auT('Find friends'))}</button></div>`;
  else if (!L.length) h += `<div class="so-empty"><span>${esc(auT('No friend matches “{q}”.').replace('{q}', q))}</span></div>`;
  else h += sec(auT('Online'), A) + sec(auT('Offline'), B);
  const f = document.activeElement && document.activeElement.closest && document.activeElement.closest('.so-fr'), fid = f && f.dataset.id;
  box.innerHTML = h;
  if (fid) { const g = box.querySelector(`.so-fr[data-id="${CSS.escape(fid)}"]`); if (g) g.focus({ preventScroll: true }); }
}
async function dmOpen(uid) {
  if (!SB.user || !uid) return;
  if (!FR.list) await frLoad();
  if (!soFriend(uid)) { toast(auT('You can only chat with friends')); return; }
  const el = soChatEl();
  if (openK) closeAll();
  if (DM.open !== uid) { DM.open = uid; DM.msgs = []; DM.prev = null; el.querySelector('.ch-m').innerHTML = '<i class="sk sk-msg"></i>'.repeat(3); el.querySelector('textarea').value = ''; soPick(false); }
  SO.last = uid;
  soView('conv'); dmHead(); auMsg2(''); soTyDraw();
  soShow(true); soSave();
  DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === uid ? 0 : +c.unread || 0), 0); ntBadge();
  await dmThread();
  if (!auCoarse() && DM.open === uid) el.querySelector('textarea').focus({ preventScroll: true });
  clearInterval(DM.t); DM.t = setInterval(() => { if (DM.open && document.visibilityState === 'visible') dmThread(); }, 5000);
}
function dmClose() {
  const el = $('#chat');
  clearInterval(DM.t); DM.open = null;
  if (el) soShow(false);
  soSave();
}
function auMsg2(m, k) { const n = document.querySelector('#chat .ch-note'); if (n) { n.textContent = m ? auT(m) : ''; n.className = 'note ch-note' + (k ? ' ' + k : ''); } }
function soSaid(id, m, k) { if (DM.open === id && $('#chat') && !$('#chat').hidden) auMsg2(m, k); else toast(m); }
function soActs(id) {
  const f = soFriend(id), name = f ? (f.display_name || f.username || '?') : '', on = soOn(id), party = soParty(), mine = cur && soCan(cur.g.id) ? cur.g.id : null;
  const inv = party ? { k: 'invite', i: SO_ICO.pad, t: auT('Invite to my party · {g}').replace('{g}', soGameName(party.game)) } : mine ? { k: 'invite', i: SO_ICO.pad, t: auT('Invite to {g}').replace('{g}', soGameName(mine)) } : { k: 'pick', i: SO_ICO.pad, t: auT('Invite to play…') };
  let j;
  if (!on) j = { t: auT('Join'), why: auT('{u} is offline. You can still send an invite.').replace('{u}', name) };
  else if (on.g && on.p) j = { t: auT('Join party · {g}').replace('{g}', soGameName(on.g)) };
  else if (on.g && soCan(on.g)) j = { t: auT('Ask to join · {g}').replace('{g}', soGameName(on.g)) };
  else if (on.g) j = { t: auT('Join'), why: auT('{g} has no online mode. Invite {u} to a game that does.').replace('{g}', soGameName(on.g)).replace('{u}', name) };
  else j = { t: auT('Join'), why: auT('{u} is not in a game right now. Invite them instead.').replace('{u}', name) };
  j.k = 'join'; j.i = SO_ICO.join;
  return on && on.g && on.p ? [j, inv] : [inv, j];
}
function soActsHtml(id, at) {
  const A = soActs(id), why = A.map(a => a.why).filter(Boolean)[0];
  return A.map((a, i) => `<button class="btn2${!i ? ' pri' : ''}${a.why ? ' so-dis' : ''}" type="button" ${at}="${a.k}" data-id="${esc(id)}"${a.why ? ` aria-disabled="true" title="${esc(a.why)}"` : ''}>${a.i}<span>${esc(a.t)}</span></button>`).join('') + (why ? `<small class="so-why">${esc(why)}</small>` : '');
}
async function soDo(k, id, b) {
  if (b && b.getAttribute('aria-disabled') === 'true') { soSaid(id, b.title); return; }
  if (k === 'chat') { closeAll(); dmOpen(id); }
  else if (k === 'pick') { closeAll(); await dmOpen(id); soPick(true); }
  else if (k === 'invite') { if (b) b.disabled = true; await soInvite(id, null); if (b) b.disabled = false; }
  else if (k === 'join') { if (b) b.disabled = true; await soJoin(id); if (b) b.disabled = false; }
}
async function soInvite(id, game) {
  const p = soParty();
  if (p && (!game || game === p.game)) {
    try { await dmSend(id, 'invite', null, p); soSaid(id, auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code), 'ok'); }
    catch (e) { soSaid(id, auT('Could not send. Check your connection and try again.'), 'bad'); }
    return;
  }
  game = game || (cur && soCan(cur.g.id) ? cur.g.id : null);
  if (!game) { if (DM.open !== id) await dmOpen(id); soPick(true); return; }
  soHost(game, id);
}
function soHost(game, id) {
  if (SO.pend && SO.pend.game === game) SO.pend.ids.add(id); else SO.pend = { game, ids: new Set([id]) };
  SO.pend.t = Date.now();
  const here = cur && cur.g.id === game;
  toast(auT('Starting a {g} party. Your invite goes out as soon as it is ready.').replace('{g}', soGameName(game)));
  if (!(here && cur.api && cur.api.online)) {
    invite = { id: game, code: null, host: true };
    soPick(false);
    dmClose();
    closeAll();
    if (here) restartCurrent(); else go(href(game), false);
  }
  clearInterval(SO.pt); SO.pt = setInterval(soPendTick, 500);
}
async function soPendTick() {
  const P = SO.pend;
  if (!P) { clearInterval(SO.pt); return; }
  const p = soParty();
  if (p && p.game === P.game) {
    SO.pend = null; clearInterval(SO.pt);
    rtTrack(true);
    for (const id of P.ids) {
      try { await dmSend(id, 'invite', null, p); toast(auT('Invite sent to {u}. They join with code {c}.').replace('{u}', soName(id)).replace('{c}', p.code)); }
      catch (e) { toast(auT('Could not send the invite to {u}. Try again.').replace('{u}', soName(id))); }
    }
    return;
  }
  const away = Date.now() - P.t > 4000 && !(cur && cur.g.id === P.game) && !(pend && pend.id === P.game);
  if (away || Date.now() - P.t > 120000) {
    SO.pend = null; clearInterval(SO.pt);
    if (invite && invite.host) invite = null;
    if (!away) toast(auT('The party did not start, so the invite was not sent. Try again.'));
  }
}
async function soJoin(id) {
  const on = soOn(id);
  if (!on || !on.g) return;
  try { await dmSend(id, 'join', null, { game: on.g }); }
  catch (e) { soSaid(id, auT('Could not send. Check your connection and try again.'), 'bad'); return; }
  SO.want = { id, t: Date.now() };
  soSaid(id, on.p ? auT('Asked {u} to let you in. You join as soon as they accept.').replace('{u}', soName(id)) : auT('Request sent. {u} gets a notification and can start a party for you.').replace('{u}', soName(id)), 'ok');
}
function soPick(on) {
  const el = $('#chat');
  if (!el) return;
  const pk = el.querySelector('.so-pk');
  if (!on) { pk.hidden = true; return; }
  const L = games.filter(g => soCan(g.id)).sort((a, b) => (b === (cur && cur.g)) - (a === (cur && cur.g)) || a.title.localeCompare(b.title));
  pk.querySelector('.so-pt').textContent = auT('Play with {u}').replace('{u}', soName(DM.open));
  pk.querySelector('.so-pl').innerHTML = L.map(g => `<button class="so-gm" type="button" data-ch="pk" data-g="${esc(g.id)}"><span class="so-gi" style="background:${esc(tint(g))}">${img(g) || esc(g.title.charAt(0))}</span><span class="so-ft"><b>${esc(g.title)}</b><small>${esc(auT(playersText(g.info.pl)))}</small></span>${SO_ICO.pad}</button>`).join('');
  pk.hidden = false;
  const f = pk.querySelector('.so-gm'); if (f) f.focus({ preventScroll: true });
}
function dmHead() {
  const el = $('#chat'), uid = DM.open, f = soFriend(uid);
  if (!el || !uid || !f) return;
  const name = f.display_name || f.username || '?', on = soOn(uid);
  el.querySelector('.so-cv .pic').innerHTML = `${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(on)}"></i>`;
  el.querySelector('.so-cv .ch-n b').textContent = name;
  el.querySelector('.so-cv .ch-s').innerHTML = `<span class="so-st${on ? on.a ? ' aw' : ' on' : ''}">${esc(soStatus(uid))}</span><span class="so-un">@${esc(f.username || '')}</span>`;
  el.querySelector('.ch-acts').innerHTML = soActsHtml(uid, 'data-ch');
  el.querySelector('textarea').placeholder = auT('Message {u}').replace('{u}', '@' + (f.username || name));
  const o = DM.inbox.reduce((n, c) => n + (c.other_id === uid ? 0 : +c.unread || 0), 0), bk = el.querySelector('.so-bk em');
  bk.textContent = o > 9 ? '9+' : o; bk.hidden = !o;
}
function soTyDraw() {
  const t = $('#chat .so-ty');
  if (!t) return;
  clearTimeout(SO.tyT);
  const on = DM.open && SO.ty[DM.open] > Date.now();
  t.hidden = !on;
  if (on) { t.innerHTML = `<i></i><i></i><i></i><span>${esc(auT('{u} is typing…').replace('{u}', soName(DM.open)))}</span>`; SO.tyT = setTimeout(() => { soTyDraw(); soList(); }, SO.ty[DM.open] - Date.now() + 50); }
}
function soSeen() {
  const box = $('#chat .ch-m');
  if (!box) return;
  const s = box.querySelector('.so-seen'); if (s) s.remove();
  const L = DM.msgs[DM.msgs.length - 1];
  if (L && L.mine && L.read_at) box.insertAdjacentHTML('beforeend', `<div class="so-seen">${esc(auT('Seen'))}</div>`);
}
async function dmSeenSync() {
  const uid = DM.open, M = DM.msgs.filter(m => m.mine && !m.read_at);
  if (!uid || !M.length) return;
  try { const r = await adRpc('dm_thread', { p_with: uid, p_after: M[0].id - 1 }); if (DM.open !== uid) return; (Array.isArray(r) ? r : []).forEach(x => { const m = DM.msgs.find(y => y.id === x.id); if (m && x.read_at) m.read_at = x.read_at; }); soSeen(); } catch (e) {}
}
async function dmThread() {
  const uid = DM.open;
  if (!uid || DM.busy) return;
  DM.busy = true;
  try {
    const after = DM.msgs.length ? DM.msgs[DM.msgs.length - 1].id : 0;
    const r = await adRpc('dm_thread', { p_with: uid, p_after: after });
    if (DM.open !== uid) return;
    const add = Array.isArray(r) ? r : [];
    const box = $('#chat .ch-m'), first = !after;
    if (first) { box.innerHTML = ''; DM.prev = null; }
    if (!add.length) { if (first) box.innerHTML = `<div class="ch-empty">${SO_ICO.chat}<span>${esc(auT('Say hi! Messages are only seen by the two of you.'))}</span></div>`; return; }
    const near = first || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const em = box.querySelector('.ch-empty'); if (em) em.remove();
    const un = first ? add.findIndex(m => !m.mine && !m.read_at) : -1;
    DM.msgs.push(...add);
    box.insertAdjacentHTML('beforeend', add.map((m, i) => {
      const p = DM.prev;
      let s = '';
      if (!p || new Date(p.created_at).toDateString() !== new Date(m.created_at).toDateString()) s += `<div class="so-sep so-day"><span>${esc(soDay(m.created_at))}</span></div>`;
      if (i === un && i > 0) s += `<div class="so-sep so-new" id="soNew"><span>${esc(auT('New messages'))}</span></div>`;
      const card = k => k === 'invite' || k === 'join';
      const grp = !s && p && p.mine === m.mine && !card(p.kind) && !card(m.kind) && Date.parse(m.created_at) - Date.parse(p.created_at) < 300000;
      DM.prev = m;
      return s + dmRow(m, !first, grp);
    }).join(''));
    box.querySelectorAll('img[data-path]:not([src])').forEach(dmImg);
    soSeen();
    const nw = first && box.querySelector('#soNew');
    if (nw) box.scrollTop = Math.max(0, nw.offsetTop - 12);
    else if (near || add.some(m => m.mine)) box.scrollTop = box.scrollHeight;
    if (!first && add.some(m => !m.mine)) { delete SO.ty[uid]; soTyDraw(); sfx('pop'); }
    if (add.some(m => !m.mine && !m.read_at)) {
      await adRpc('dm_read', { p_with: uid }).catch(() => {});
      rtSend(uid, { t: 'rd', f: SB.user.id });
      const c = DM.inbox.find(x => x.other_id === uid); if (c) c.unread = 0;
      DM.unread = DM.inbox.reduce((n, c) => n + (c.other_id === DM.open ? 0 : +c.unread || 0), 0); ntBadge();
    }
  } catch (e) { auMsg2('Could not load the messages. Check your connection and try again.', 'bad'); }
  finally { DM.busy = false; }
}
function dmRow(m, anim, grp) {
  const d = new Date(m.created_at), hm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const cls = 'ch-r' + (m.mine ? ' me' : '') + (anim ? ' new' : '') + (grp ? ' so-g' : ''), t = grp ? '' : `<small>${esc(hm)}</small>`, g = m.meta || {}, name = soName(DM.open), tt = ` title="${esc(d.toLocaleString())}"`;
  if (m.kind === 'image') return `<div class="${cls}"${tt}><div class="ch-pic"><img data-path="${esc(g.path || '')}" alt="${esc(auT('Picture'))}" width="${+g.w || 320}" height="${+g.h || 240}" loading="lazy"></div>${t}</div>`;
  if (m.kind === 'invite') return `<div class="${cls}"${tt}><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You invited {u} to your party').replace('{u}', name) : auT('{u} invited you to their party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))} · ${esc(auT('Code {c}').replace('{c}', g.code || ''))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="go" data-g="${esc(g.game || '')}" data-c="${esc(g.code || '')}">${esc(auT('Join'))}</button>`}</div>${t}</div>`;
  if (m.kind === 'join') return `<div class="${cls}"${tt}><div class="ch-card">${SO_ICO.pad}<div><b>${esc(m.mine ? auT('You asked to join {u}').replace('{u}', name) : auT('{u} wants to join your party').replace('{u}', name))}</b><span>${esc(soGameName(g.game))}</span></div>${m.mine ? '' : `<button class="btn2 pri" type="button" data-ch="invite" data-g="${esc(g.game || '')}">${esc(auT('Invite'))}</button>`}</div>${t}</div>`;
  return `<div class="${cls}"${tt}><div class="ch-b">${esc(m.body || '')}</div>${t}</div>`;
}
async function dmImg(img) {
  const p = img.dataset.path;
  if (!p) return;
  if (DM.urls.has(p)) { img.src = DM.urls.get(p); return; }
  try {
    const c = await sbClient();
    const { data, error } = await c.storage.from('dm').createSignedUrl(p, 3600);
    if (error || !data) throw error;
    DM.urls.set(p, data.signedUrl);
    img.src = data.signedUrl;
  } catch (e) { img.alt = auT('Picture not available'); img.classList.add('bad'); }
}
async function dmSendText() {
  const el = $('#chat'), ta = el.querySelector('textarea'), v = ta.value.trim(), uid = DM.open;
  if (!v || !uid) return;
  ta.value = ''; ta.style.height = 'auto'; auMsg2(''); SO.tyAt = 0;
  try { await dmSend(uid, 'text', v); }
  catch (e) { ta.value = v; auMsg2(/too many/i.test(e.message || '') ? 'Too many messages. Wait a minute and try again.' : /not friends/i.test(e.message || '') ? 'You are no longer friends.' : /locked/i.test(e.message || '') ? 'Your account is locked.' : 'Could not send. Check your connection and try again.', 'bad'); }
}
async function dmImage(file) {
  const uid = DM.open;
  if (!uid || !SB.user) return;
  if (file.size > 25e6) { auMsg2('That picture is too big. Pick one under 25 MB.', 'bad'); return; }
  auMsg2('Sending the picture…');
  try {
    let blob = file, ext = 'gif', w = 0, h = 0;
    const bm = await createImageBitmap(file);
    w = bm.width; h = bm.height;
    if (file.type !== 'image/gif' || file.size > 3e6) {
      const k = Math.min(1, 1600 / Math.max(w, h)), cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      cv.getContext('2d').drawImage(bm, 0, 0, cw, ch);
      blob = await new Promise(r => cv.toBlob(r, 'image/webp', .85));
      if (!blob || blob.type !== 'image/webp') blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', .85));
      ext = blob.type === 'image/webp' ? 'webp' : 'jpg'; w = cw; h = ch;
    }
    bm.close && bm.close();
    const path = SB.user.id + '/' + uid + '/' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)) + '.' + ext;
    const c = await sbClient();
    const { error } = await c.storage.from('dm').upload(path, blob, { contentType: blob.type || 'image/' + ext, upsert: false });
    if (error) throw error;
    await dmSend(uid, 'image', null, { path, w, h });
    auMsg2('');
  } catch (e) { auMsg2('Could not send the picture. Try another one.', 'bad'); }
}
async function dmAct(k, b) {
  const uid = DM.open;
  if (k === 'close') { dmClose(); const l = $('#sodl'); if (l && !l.hidden) l.focus({ preventScroll: true }); return; }
  if (k === 'back') { dmBack(); return; }
  if (k === 'so') { dmOpen(b.dataset.id); return; }
  if (k === 'find') { dmClose(); setOpen('friends'); return; }
  if (k === 'img') { $('#chat input[type=file]').click(); return; }
  if (k === 'pkx') { soPick(false); return; }
  if (k === 'go') { dmClose(); closeAll(); go(href(b.dataset.g, b.dataset.c), false); toast(auT('Joining the party…')); return; }
  if (!uid) return;
  if (k === 'pk') { soHost(b.dataset.g, uid); return; }
  if (k === 'invite' && b.dataset.g && !b.dataset.id) { b.disabled = true; await soInvite(uid, soCan(b.dataset.g) ? b.dataset.g : null); b.disabled = false; return; }
  if (k === 'invite' || k === 'pick' || k === 'join') { await soDo(k, uid, b); if (DM.open === uid) dmHead(); }
}
function soLight(src) {
  let lb = $('#soLight');
  if (!lb) { lb = document.createElement('div'); lb.id = 'soLight'; lb.className = 'solight'; lb.innerHTML = '<img alt="">'; lb.addEventListener('click', () => vis(lb, false)); document.body.append(lb); }
  soPlace();
  lb.querySelector('img').src = src; vis(lb, true);
}

function soFriendRow(f) {
  const id = f.friend_id, on = soOn(id), open = FR.open === id, c = DM.inbox.find(x => x.other_id === id), un = c ? +c.unread || 0 : 0;
  const name = f.display_name || f.username || '?';
  const x = open ? `<div class="fr-x"><button class="btn2" type="button" data-fr="chat" data-id="${esc(id)}">${SO_ICO.chat}<span>${esc(auT('Chat'))}</span></button>${soActsHtml(id, 'data-fr')}<button class="btn2" type="button" data-fr="remove" data-id="${esc(id)}">${esc(auT('Remove'))}</button></div>` : '';
  return `<div class="frow fr-f${open ? ' open' : ''}" role="listitem" tabindex="0" data-frc="${esc(id)}"><span class="pic">${esc(name.charAt(0).toUpperCase())}<i class="fr-dot${soDot(on)}"></i></span><div class="fr-n"><b>${esc(name)}</b><span>@${esc(f.username || '')}</span><em class="fr-st${on ? on.a ? ' aw' : ' on' : ''}">${esc(soStatus(id))}</em></div><div class="fr-a">${un ? `<span class="fr-un">${un > 9 ? '9+' : un}</span>` : ''}<button class="btn2 icon2" type="button" data-fr="chat" data-id="${esc(id)}" aria-label="${esc(auT('Chat'))}">${SO_ICO.chat}</button></div>${x}</div>`;
}
async function soFrAct(k, b) {
  if (!['chat', 'invite', 'pick', 'join'].includes(k)) return false;
  const id = b.dataset.id;
  if (b.getAttribute('aria-disabled') === 'true') { toast(b.title); return true; }
  await soDo(k, id, b);
  if (openK === 'friends' && FR.list) frDraw();
  return true;
}
async function frNudge() {
  const old = new Set((FR.req || []).filter(r => r.direction === 'incoming').map(r => r.id)), oldF = new Set((FR.list || []).map(f => f.friend_id)), had = !!FR.list;
  await frLoad();
  soList();
  if (!had) return;
  (FR.req || []).filter(r => r.direction === 'incoming' && !old.has(r.id)).forEach(r => { if (S.prefs.n_req !== false) ntPush({ k: 'fr', from: r.other_id, t: auT('{u} sent you a friend request').replace('{u}', r.display_name || r.username), b: '@' + r.username, a: { type: 'friends' } }); });
  (FR.list || []).filter(f => !oldF.has(f.friend_id)).forEach(f => ntPush({ k: 'fr', from: f.friend_id, t: auT('You are now friends with {u}').replace('{u}', f.display_name || f.username), b: '@' + f.username, a: { type: 'chat', uid: f.friend_id } }));
  ntBadge();
  rtSync();
}
function soNewGames() {
  const ids = games.map(g => g.id);
  let known = null;
  try { known = JSON.parse(localStorage.getItem('gameplay:known') || 'null'); } catch (e) {}
  try { localStorage.setItem('gameplay:known', JSON.stringify(ids)); } catch (e) {}
  if (!Array.isArray(known) || S.prefs.n_game === false) return;
  const K = new Set(known), fresh = ids.filter(id => !K.has(id));
  fresh.slice(0, 3).forEach(id => ntPush({ k: 'game', t: auT('New game: {g}').replace('{g}', soGameName(id)), b: auT('Just added. Be the first to set a record!'), a: { type: 'game', game: id } }));
  if (fresh.length > 3) ntPush({ k: 'game', t: auT('{n} new games').replace('{n}', fresh.length), b: auT('Check the home page to see them all.'), a: {} });
}
function soStart() {
  ntLoad();
  if (!SB.user) return;
  rtStart();
  DM.first = true; DM.last = {};
  SO.key = 'gameplay:dock:' + SB.user.id;
  let st = null;
  try { st = JSON.parse(localStorage.getItem(SO.key) || 'null'); } catch (e) {}
  if (st) { SO.v = st.v === 'conv' ? 'conv' : 'list'; SO.last = typeof st.u === 'string' ? st.u : null; }
  soDockSync();
  frLoad().then(() => {
    ntBadge(); rtSync();
    if (st && st.o && !auCoarse() && matchMedia('(min-width:761px)').matches && $('#chat') && $('#chat').hidden) { if (SO.v === 'conv' && soFriend(SO.last)) dmOpen(SO.last); else { soView('list'); soShow(true); soList(); } }
  });
  dmPoll();
}
function soStop() {
  rtStop(); dmClose();
  DM.inbox = []; DM.unread = 0; DM.msgs = []; DM.last = {}; DM.urls.clear();
  SO.pend = SO.want = null; SO.last = null; SO.v = 'list'; SO.key = ''; SO.ty = {}; clearInterval(SO.pt);
  ntLoad();
  soDockSync();
}
function soBoot() {
  MENUS.notifs = ['#nmenu', '#nbtn'];
  const right = document.querySelector('#top .right');
  right.insertAdjacentHTML('afterbegin', `<span class="onl" id="onl" hidden translate="no"><i></i><b>0</b> ${esc(auT('online'))}</span><button class="icon" id="nbtn" type="button" aria-label="${esc(auT('Notifications'))}" aria-haspopup="true" aria-expanded="false" aria-controls="nmenu">${SO_ICO.bell}<em hidden></em></button>`);
  $('#abtn').insertAdjacentHTML('beforeend', '<em hidden></em>');
  right.insertAdjacentHTML('beforeend', `<div class="menu r nmenu" id="nmenu" hidden><div class="nm-h"><b>${esc(auT('Notifications'))}</b><button class="au-link" type="button" id="nall">${esc(auT('Mark all as read'))}</button></div><div class="nlist" id="nlist"></div></div>`);
  document.body.insertAdjacentHTML('beforeend', `<button class="so-dl" id="sodl" type="button" hidden aria-expanded="false" aria-controls="chat">${SO_ICO.chat}<span class="so-dlt">${esc(auT('Chat'))}</span><span class="so-dlo" hidden translate="no"><i></i><b>0</b></span><em hidden></em></button>`);
  $('#sodl').addEventListener('click', e => { e.stopPropagation(); soDock(); });
  $('#nbtn').addEventListener('click', e => { e.stopPropagation(); setOpen('notifs'); if (openK === 'notifs') ntDraw(); });
  $('#nall').addEventListener('click', e => { e.stopPropagation(); NT.list.forEach(n => { n.r = true; }); ntSave(); ntBadge(); ntDraw(); });
  $('#nlist').addEventListener('click', e => { const b = e.target.closest('[data-nid]'); if (!b) return; const n = NT.list.find(x => x.id === b.dataset.nid); if (!n) return; ntRead(n.id); closeAll(); ntAct(n); });
  $('#fr-l').addEventListener('click', async e => {
    const b = e.target.closest('[data-fr]');
    if (b && ['chat', 'invite', 'pick', 'join'].includes(b.dataset.fr)) { e.stopPropagation(); await soFrAct(b.dataset.fr, b); return; }
    if (b) return;
    const r = e.target.closest('[data-frc]');
    if (r) { e.stopPropagation(); FR.open = FR.open === r.dataset.frc ? null : r.dataset.frc; frDraw(); }
  }, true);
  $('#fr-l').addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('[data-frc]'); if (r && e.target === r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); r.click(); } });
  setInterval(() => { if (SB.user && document.visibilityState === 'visible') dmPoll(); }, 30000);
  setInterval(() => {
    if (!SB.user) return;
    const pa = soParty(), k = (cur ? cur.g.id : '') + '|' + (pa ? pa.code : '');
    if (k !== SO.gk) { SO.gk = k; if (DM.open) dmHead(); if (openK === 'friends' && FR.list) frDraw(); rtTrack(true); }
    else if (RT.on && soIdle() !== SO.away) rtTrack(true);
  }, 1000);
  const act = () => { SO.act = Date.now(); if (SO.away && RT.on) { SO.away = false; rtTrack(true); } };
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'pointermove'].forEach(t => addEventListener(t, act, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible') { act(); dmPoll(); rtTrack(); } });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => setTimeout(soPlace, 0)));
  new MutationObserver(() => { const c = $('#chat'); if (document.body.classList.contains('modal-open') && c && !c.hidden && !c.classList.contains('out')) dmClose(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  ntLoad();
  setTimeout(soNewGames, 3000);
}

const IN = { used: {}, pads: {}, held: {}, raf: 0, cap: null, tab: 'kb', seen: false, hint: 0 };
const IN_PAD = [['b0', 'A'], ['b1', 'B'], ['b2', 'X'], ['b3', 'Y'], ['b4', 'LB'], ['b5', 'RB'], ['b6', 'LT'], ['b7', 'RT'], ['b8', 'Back'], ['b9', 'Start'], ['b10', 'Left stick press'], ['b11', 'Right stick press'], ['b12', 'D-pad up'], ['b13', 'D-pad down'], ['b14', 'D-pad left'], ['b15', 'D-pad right'], ['ly-', 'Left stick up'], ['ly+', 'Left stick down'], ['lx-', 'Left stick left'], ['lx+', 'Left stick right'], ['ry-', 'Right stick up'], ['ry+', 'Right stick down'], ['rx-', 'Right stick left'], ['rx+', 'Right stick right']];
const IN_DEF = { b0: 'Space', b1: 'KeyX', b2: 'KeyZ', b3: 'KeyC', b4: 'KeyQ', b5: 'KeyE', b6: 'ShiftLeft', b7: 'Enter', b9: 'Escape', b12: 'ArrowUp', b13: 'ArrowDown', b14: 'ArrowLeft', b15: 'ArrowRight', 'ly-': 'ArrowUp', 'ly+': 'ArrowDown', 'lx-': 'ArrowLeft', 'lx+': 'ArrowRight' };
const IN_GAME = {
  'rocket-soccer': { b0: 'Space', b1: 'ShiftLeft', b2: 'KeyX', b3: 'KeyC', b4: 'KeyQ', b5: 'KeyE', b6: 'KeyS', b7: 'KeyW', b9: 'Escape', b12: 'ArrowUp', b13: 'ArrowDown', b14: 'ArrowLeft', b15: 'ArrowRight', 'ly-': 'KeyW', 'ly+': 'KeyS', 'lx-': 'KeyA', 'lx+': 'KeyD' },
  'blockcraft-3d': { b0: 'Space', b1: 'ShiftLeft', b4: 'KeyQ', b5: 'KeyE', b9: 'Escape', 'ly-': 'KeyW', 'ly+': 'KeyS', 'lx-': 'KeyA', 'lx+': 'KeyD' }
};
const IN_KEYS = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], Backspace: ['Backspace', 8], ShiftLeft: ['Shift', 16], ShiftRight: ['Shift', 16], ControlLeft: ['Control', 17], ControlRight: ['Control', 17], AltLeft: ['Alt', 18], AltRight: ['Alt', 18], ArrowUp: ['ArrowUp', 38], ArrowDown: ['ArrowDown', 40], ArrowLeft: ['ArrowLeft', 37], ArrowRight: ['ArrowRight', 39], Minus: ['-', 189], Equal: ['=', 187], Comma: [',', 188], Period: ['.', 190], Slash: ['/', 191], Semicolon: [';', 186], Quote: ["'", 222], BracketLeft: ['[', 219], BracketRight: [']', 221], Backslash: ['\\', 220], Backquote: ['`', 192] };
function inInfo(code) {
  if (IN_KEYS[code]) return IN_KEYS[code];
  let m = /^Key([A-Z])$/.exec(code); if (m) return [m[1].toLowerCase(), m[1].charCodeAt(0)];
  m = /^Digit(\d)$/.exec(code); if (m) return [m[1], 48 + +m[1]];
  m = /^Numpad(\d)$/.exec(code); if (m) return [m[1], 96 + +m[1]];
  m = /^F(\d+)$/.exec(code); if (m) return [code, 111 + +m[1]];
  return [code, 0];
}
function inName(code) {
  if (!code) return auT('None');
  const N = { Space: 'Space', Enter: 'Enter', Escape: 'Esc', ShiftLeft: 'Left Shift', ShiftRight: 'Right Shift', ControlLeft: 'Left Ctrl', ControlRight: 'Right Ctrl', AltLeft: 'Left Alt', AltRight: 'Right Alt', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Backspace: 'Backspace', Tab: 'Tab' };
  if (N[code]) return N[code];
  const i = inInfo(code);
  return /^Key|^Digit/.test(code) ? i[0].toUpperCase() : code.replace(/^Numpad/, 'Num ');
}
const inGid = () => cur ? cur.g.id : null;
function inProf(id) {
  S.prefs.ctl = S.prefs.ctl && typeof S.prefs.ctl === 'object' ? S.prefs.ctl : {};
  const p = S.prefs.ctl[id] = S.prefs.ctl[id] || {};
  p.k = p.k || {}; p.p = p.p || {};
  return p;
}
function inPadMap(id) { const p = inProf(id).p, d = IN_GAME[id] || IN_DEF, m = {}; IN_PAD.forEach(([k]) => { m[k] = k in p ? p[k] : (d[k] || ''); }); return m; }
function inKeyMap(id) { const k = inProf(id).k, m = {}; Object.keys(k).forEach(from => { m[from] = k[from]; }); return m; }
const inTyping = t => !!(t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], .chat, .modal, .menu'));
function inTarget() { const a = document.activeElement; return a && a !== document.body && a.closest && a.closest('.g-root') ? a : (document.querySelector('#frame .g-root') || document.body); }
function inSend(type, code, rep) {
  const i = inInfo(code);
  const ev = new KeyboardEvent(type, { code, key: i[0], bubbles: true, cancelable: true, repeat: !!rep, shiftKey: /^Shift/.test(code) && type === 'keydown', ctrlKey: /^Control/.test(code) && type === 'keydown', altKey: /^Alt/.test(code) && type === 'keydown' });
  try { Object.defineProperty(ev, 'keyCode', { get: () => i[1] }); Object.defineProperty(ev, 'which', { get: () => i[1] }); } catch (e) {}
  ev.gpSyn = true;
  inTarget().dispatchEvent(ev);
}
function inLearn(e) {
  const id = inGid();
  if (!id || !e.code) return;
  const u = IN.used[id] = IN.used[id] || new Set();
  if (!u.has(e.code)) { u.add(e.code); try { const L = JSON.parse(localStorage.getItem('gameplay:keys') || '{}'); L[id] = [...u]; localStorage.setItem('gameplay:keys', JSON.stringify(L)); } catch (x) {} }
}
function inUsed(id) {
  let L = {};
  try { L = JSON.parse(localStorage.getItem('gameplay:keys') || '{}') || {}; } catch (e) {}
  const s = new Set([...(L[id] || []), ...(IN.used[id] ? [...IN.used[id]] : [])]);
  Object.values(inPadMap(id)).forEach(c => { if (c) s.add(c); });
  Object.values(inKeyMap(id)).forEach(c => { if (c) s.add(c); });
  return [...s].filter(c => c && c !== 'Escape').sort((a, b) => inName(a).localeCompare(inName(b)));
}
function inKey(e) {
  if (e.gpSyn || !cur || AD.locked) return;
  if (IN.cap) { e.preventDefault(); e.stopImmediatePropagation(); if (e.type === 'keydown') inCaptured(e.code); return; }
  if (inTyping(e.target) || openK) return;
  const m = inKeyMap(cur.g.id);
  if (e.type === 'keydown') setTimeout(() => { if (e.defaultPrevented && !(e.code in m)) inLearn(e); }, 0);
  if (!(e.code in m)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const to = m[e.code];
  if (to) inSend(e.type, to, e.repeat);
}
function inPadPoll() {
  IN.raf = 0;
  const P = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (!P.length) return;
  const id = inGid(), map = id ? inPadMap(id) : null, now = {};
  P.forEach(gp => {
    const b = i => gp.buttons[i] && (gp.buttons[i].pressed || gp.buttons[i].value > .4);
    for (let i = 0; i < Math.min(16, gp.buttons.length); i++) if (b(i)) now['b' + i] = 1;
    const ax = (i, n) => { const v = gp.axes[i] || 0; if (v < -.4) now[n + '-'] = 1; else if (v > .4) now[n + '+'] = 1; };
    ax(0, 'lx'); ax(1, 'ly'); ax(2, 'rx'); ax(3, 'ry');
  });
  if (map && !openK && !AD.locked) {
    const want = {};
    Object.keys(now).forEach(k => { const c = map[k]; if (c) want[c] = (want[c] || 0) + 1; });
    Object.keys(IN.held).forEach(c => { if (!want[c]) { inSend('keyup', c); delete IN.held[c]; } });
    Object.keys(want).forEach(c => { if (!IN.held[c]) { IN.held[c] = 1; inSend('keydown', c); } });
  } else inRelease();
  IN.pads = now;
  if (!$('#ctlmodal').hidden) inLive(now);
  IN.raf = requestAnimationFrame(inPadPoll);
}
function inRelease() { Object.keys(IN.held).forEach(c => inSend('keyup', c)); IN.held = {}; }
function inPadStart() { if (!IN.raf) IN.raf = requestAnimationFrame(inPadPoll); }
function inOpen() {
  const id = inGid();
  if (!id) return;
  if (gamebox.classList.contains('fs')) fsExit();
  inDraw();
  if (openK !== 'mctl') setOpen('mctl');
}
function inDraw() {
  const id = inGid(), box = $('#ctlbody');
  if (!id || !box) return;
  const g = byId.get(id), P = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  $('#ctlt').textContent = auT('Controls · {g}').replace('{g}', g ? g.title : id);
  const tabs = `<div class="adm-tabs ctl-tabs" data-m="${IN.tab === 'kb' ? 'users' : 'tickets'}"><button type="button" data-ct="kb" aria-selected="${IN.tab === 'kb'}">${esc(auT('Keyboard'))}</button><button type="button" data-ct="pad" aria-selected="${IN.tab === 'pad'}">${esc(auT('Controller'))}</button><i></i></div>`;
  if (IN.tab === 'kb') {
    const km = inKeyMap(id), used = inUsed(id);
    box.innerHTML = tabs + `<p class="ctl-p">${esc(auT('Pick a key the game uses, then press the key you want to use instead. Keys the game uses appear here after you play it for a moment.'))}</p><div class="ctl-l">${used.length ? used.map(c => { const from = Object.keys(km).find(k => km[k] === c && k !== c); return `<div class="ctl-r"><span class="ctl-a"><kbd>${esc(inName(c))}</kbd><small>${esc(auT('game key'))}</small></span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg><button class="btn2${IN.cap && IN.cap.to === c ? ' cap' : ''}" type="button" data-kb="${esc(c)}">${IN.cap && IN.cap.to === c ? esc(auT('Press a key…')) : `<kbd>${esc(inName(from || c))}</kbd>`}</button>${from ? `<button class="x" type="button" data-kbr="${esc(c)}" aria-label="${esc(auT('Reset'))}">${SO_ICO.x}</button>` : '<span class="x"></span>'}</div>`; }).join('') : `<div class="adm-mut">${esc(auT('Play the game for a moment, then come back: the keys it uses will show up here.'))}</div>`}</div><div class="ctl-f"><button class="btn2" type="button" data-kbadd>${esc(auT('Add a game key'))}</button><button class="btn2" type="button" data-kbclear>${esc(auT('Reset keyboard'))}</button></div>`;
  } else {
    const pm = inPadMap(id);
    box.innerHTML = tabs + `<p class="ctl-p" id="ctlpad">${esc(P.length ? auT('Connected: {n}').replace('{n}', P[0].id.replace(/\(.*?\)/g, '').trim().slice(0, 60)) : auT('Connect a controller (USB or Bluetooth) and press any button.'))}</p><div class="ctl-l">${IN_PAD.map(([k, n]) => `<div class="ctl-r" data-pk="${k}"><span class="ctl-a"><b>${esc(auT(n))}</b></span><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg><button class="btn2${IN.cap && IN.cap.pk === k ? ' cap' : ''}" type="button" data-pb="${k}">${IN.cap && IN.cap.pk === k ? esc(auT('Press a key…')) : `<kbd>${esc(inName(pm[k]))}</kbd>`}</button><button class="x" type="button" data-pbn="${k}" aria-label="${esc(auT('None'))}">${SO_ICO.x}</button></div>`).join('')}</div><div class="ctl-f"><button class="btn2" type="button" data-pbclear>${esc(auT('Reset controller'))}</button></div>`;
  }
}
function inLive(now) { document.querySelectorAll('#ctlbody [data-pk]').forEach(r => r.classList.toggle('on', !!now[r.dataset.pk])); const t = $('#ctlpad'); if (t && Object.keys(now).length && !IN.seen) { IN.seen = true; inDraw(); } }
function inCaptured(code, pk) {
  const c = IN.cap, id = inGid();
  IN.cap = null;
  if (!c || !id) { inDraw(); return; }
  const p = inProf(id);
  if (c.add) { if (code && code !== 'Escape') { (IN.used[id] = IN.used[id] || new Set()).add(code); inLearn({ code }); } }
  else if (c.to && code && code !== 'Escape') { Object.keys(p.k).forEach(k => { if (p.k[k] === c.to) delete p.k[k]; }); if (code !== c.to) { p.k[code] = c.to; p.k[c.to] = p.k[c.to] || ''; } else delete p.k[c.to]; Object.keys(p.k).forEach(k => { if (p.k[k] === '' && !Object.values(p.k).includes(k)) delete p.k[k]; }); }
  else if (c.pk && code && code !== 'Escape') p.p[c.pk] = code;
  if (!c.add && code && code !== 'Escape') track('rebind', { game: id, dev: c.pk ? 'pad' : 'key', act: String(c.to || c.pk), to: code });
  save(); inDraw();
}
function inBoot() {
  addEventListener('keydown', inKey, true);
  addEventListener('keyup', inKey, true);
  addEventListener('gamepadconnected', e => { inPadStart(); if (Date.now() - IN.hint > 60000) { IN.hint = Date.now(); toast(auT('Controller connected')); } if (openK === 'mctl') inDraw(); });
  addEventListener('gamepaddisconnected', () => { inRelease(); if (openK === 'mctl') inDraw(); });
  addEventListener('blur', inRelease);
  MENUS.mctl = ['#ctlmodal'];
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="ctlmodal" hidden role="dialog" aria-modal="true" aria-labelledby="ctlt"><div class="mc"><div class="mh"><h3 id="ctlt">${esc(auT('Controls'))}</h3><button class="x" type="button" data-close aria-label="${esc(auT('Close'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="mb" id="ctlbody"></div></div></div>`);
  const rb = $('#pRestart');
  if (rb) rb.insertAdjacentHTML('beforebegin', `<button class="icon" type="button" id="pCtl" title="${esc(auT('Controls'))}" aria-label="${esc(auT('Change controls'))}">${SO_ICO.pad}</button>`);
  $('#pCtl').addEventListener('click', e => { e.stopPropagation(); inOpen(); });
  $('#ctlmodal').addEventListener('click', e => {
    const t = e.target;
    if (t === e.currentTarget || t.closest('[data-close]')) { IN.cap = null; closeAll(); return; }
    e.stopPropagation();
    const id = inGid(); if (!id) return;
    const p = inProf(id), b = x => t.closest(x);
    if (b('[data-ct]')) { IN.tab = b('[data-ct]').dataset.ct; IN.cap = null; inDraw(); return; }
    if (b('[data-kb]')) { IN.cap = { to: b('[data-kb]').dataset.kb }; inDraw(); return; }
    if (b('[data-kbr]')) { const to = b('[data-kbr]').dataset.kbr; Object.keys(p.k).forEach(k => { if (p.k[k] === to || k === to) delete p.k[k]; }); save(); inDraw(); return; }
    if (b('[data-kbadd]')) { IN.cap = { add: true }; b('[data-kbadd]').textContent = auT('Press the game key…'); b('[data-kbadd]').classList.add('cap'); return; }
    if (b('[data-kbclear]')) { p.k = {}; track('rebind', { game: inGid(), dev: 'key', act: 'reset' }); save(); inDraw(); return; }
    if (b('[data-pb]')) { IN.cap = { pk: b('[data-pb]').dataset.pb }; inDraw(); return; }
    if (b('[data-pbn]')) { p.p[b('[data-pbn]').dataset.pbn] = ''; save(); inDraw(); return; }
    if (b('[data-pbclear]')) { p.p = {}; track('rebind', { game: inGid(), dev: 'pad', act: 'reset' }); save(); inDraw(); return; }
  });
  if (navigator.getGamepads && [...navigator.getGamepads()].some(Boolean)) inPadStart();
}

const TR = { g: null, v0: 0, sy: 0, impQ: [], io: null, clicks: [], dw: 0, vit: { cls: 0, inp: 0, lcp: null }, vsent: false, pads: new Set(), kb: '', env: 0, asked: new Set() };
const TR_DC = /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|ovh|hetzner|linode|akamai|vultr|choopa|oracle|contabo|leaseweb|m247|datacamp|cdn77|scaleway|alibaba|tencent|hostinger|ionos|psychz|zenlayer|packethub|tzulo|quadranet|nordvpn|expressvpn|proton|mullvad|surfshark|private internet|cyberghost|ipvanish|hide\.me|windscribe|cloudflare|fastly|gcore|constant company|hostwinds|kamatera|clouvider|serverius|worldstream|hivelocity|colocrossing/i;
const trPadKind = id => /054c|sony|playstation|dualsense|dualshock/i.test(id) ? 'PlayStation' : /045e|xbox|xinput/i.test(id) ? 'Xbox' : /057e|nintendo|switch|joy-con/i.test(id) ? 'Switch' : /8bitdo/i.test(id) ? '8BitDo' : /046d|logitech/i.test(id) ? 'Logitech' : 'Other';
const trSel = el => { const a = el.closest('[id],[data-id],a,button,[role="button"]') || el, t = a.tagName.toLowerCase(); return (t + (a.id ? '#' + a.id : a.dataset && a.dataset.id ? '[' + a.dataset.id + ']' : typeof a.className === 'string' && a.className.trim() ? '.' + a.className.trim().split(/\s+/)[0] : '') + (a !== el ? ' ' + el.tagName.toLowerCase() : '')).slice(0, 80); };
const trTo = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);
const trOff = tz => { try { const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName'); return p ? p.value : ''; } catch (e) { return ''; } };
const trKbOf = (q, y, w) => q === 'a' ? 'azerty' : y === 'z' ? 'qwertz' : q === "'" ? 'dvorak' : q === 'q' && w === 'w' && y === 'y' ? 'qwerty' : '';
const trVotes = () => { try { return JSON.parse(localStorage.getItem('gameplay:votes')) || {}; } catch (e) { return {}; } };

function trStart(g, ctl) {
  const A = ctl.api, G = { g, t0: performance.now(), why: 'exit', rounds: 0, sc: [], last: null, lv: null, fr: 0, ft: 0, fs: [], inp: { k: 0, m: 0, t: 0, p: 0 }, on: {} };
  if (TR.g) trEnd1(TR.g);
  TR.g = G;
  const sc = A.score, sb = A.submit, ov = A.overlay;
  A.score = v => { if (typeof v === 'number' && isFinite(v)) G.last = v; return sc(v); };
  A.submit = v => { if (typeof v === 'number' && isFinite(v) && G.sc.length < 40) G.sc.push(v); return sb(v); };
  A.overlay = (o = {}) => { const r = ov(o); if (o && o.stats && o.stats.length) trRound(G, o); return r; };
  A.on(window, 'keydown', e => { if (!isField(e.target)) G.on.k = 1; }, true);
  A.on(frame, 'pointerdown', e => { G.on[e.pointerType === 'touch' || e.pointerType === 'pen' ? 't' : 'm'] = 1; }, true);
  ctl.add(() => trEnd1(G));
  let last = 0, s0 = 0, n = 0, k = 0;
  const step = t => {
    if (TR.g !== G) return;
    requestAnimationFrame(step);
    if (PAUSE.on || document.visibilityState !== 'visible') { last = 0; return; }
    if (!last || t - last > 1000) { last = s0 = t; n = 0; return; }
    G.fr++; G.ft += t - last; last = t; n++;
    if (++k % 10 === 0 && navigator.getGamepads) { for (const p of navigator.getGamepads()) if (p && (p.buttons.some(b => b.pressed) || p.axes.some(a => Math.abs(a) > .5))) { G.on.p = 1; break; } }
    if (t - s0 >= 1000) {
      if (t - G.t0 > 3000 && G.fs.length < 7200) G.fs.push(n * 1000 / (t - s0));
      for (const x in G.on) G.inp[x]++;
      G.on = {}; n = 0; s0 = t;
    }
  };
  requestAnimationFrame(step);
}
function trRound(G, o) {
  G.rounds++;
  for (const [k, v] of o.stats) {
    if (!/^(level|wave|stage|floor|round|lap)s?\b/i.test(String(k))) continue;
    const n = parseFloat(String(v).replace(/<[^>]*>/g, '').replace(/[^\d.-]/g, ''));
    if (isFinite(n) && (G.lv == null || n > G.lv)) G.lv = n;
  }
  const id = G.g.id, card = frame.querySelector('.g-overlay:last-child .g-ov-card');
  if (!card || TR.asked.has(id) || trVotes()[id]) return;
  TR.asked.add(id);
  const box = document.createElement('div');
  box.className = 'g-vote';
  box.innerHTML = `<span>${esc(auT('Enjoying {g}?').replace('{g}', G.g.title))}</span><button type="button" data-gv="1" aria-label="${esc(auT('I like it'))}"><svg viewBox="0 0 24 24"><path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7"/></svg></button><button type="button" data-gv="-1" aria-label="${esc(auT('Not for me'))}"><svg viewBox="0 0 24 24"><path d="M17 13V4h3v9zM17 13l-4 8a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2l2-7a2 2 0 0 1 2-1h10"/></svg></button>`;
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-gv]');
    e.stopPropagation();
    if (!b) return;
    trVote(id, +b.dataset.gv);
    box.innerHTML = `<span>${esc(auT('Thanks for the feedback!'))}</span>`;
    frame.focus({ preventScroll: true });
  });
  card.append(box);
}
function trVote(id, v) {
  const V = trVotes();
  V[id] = v;
  try { localStorage.setItem('gameplay:votes', JSON.stringify(V)); } catch (e) {}
  if (SB.on) sbRest('rpc/vote_game', { method: 'POST', body: { p_game: id, p_vote: v }, auth: !!SB.user }).catch(() => {});
}
function trEnd1(G) {
  if (TR.g !== G) return;
  TR.g = null;
  const fs = G.fs.slice().sort((a, b) => a - b), I = G.inp;
  track('game_quit', { game: G.g.id, sec: Math.round((performance.now() - G.t0) / 1000), why: G.why, rounds: G.rounds, sc: G.sc, last: G.last, lv: G.lv, fps: G.ft ? G.fr * 1000 / G.ft : null, fpsmin: fs.length ? fs[0] : null, fps5: fs.length ? fs[Math.floor(fs.length * .05)] : null, ik: I.k, im: I.m, it: I.t, ip: I.p });
}
function trView(from) {
  const now = performance.now();
  if (from) track('page_time', { v: from, sec: Math.round((now - TR.v0) / 1000) });
  if (from === 'home') trScroll();
  TR.v0 = now;
}
function trScroll() {
  if (TR.sy > 0) track('scroll', { v: 'home', pct: Math.min(100, Math.round(TR.sy / 5) * 5) });
  TR.sy = 0;
}
function trImpFlush() { while (TR.impQ.length) track('impr', { l: TR.impQ.splice(0, 40) }); }
function trImpScan() {
  if (!window.IntersectionObserver) return;
  if (!TR.io) TR.io = new IntersectionObserver(es => es.forEach(e => {
    const el = e.target;
    if (!e.isIntersecting) { clearTimeout(el._it); return; }
    el._it = setTimeout(() => { if (!el.isConnected) return; TR.io.unobserve(el); TR.impQ.push(el.dataset.id + '|' + el.dataset.src + '|' + [...el.parentNode.children].indexOf(el)); if (TR.impQ.length >= 40) trImpFlush(); }, 1000);
  }), { threshold: .5 });
  document.querySelectorAll('a[data-id][data-src]:not([data-imp])').forEach(el => { el.dataset.imp = '1'; TR.io.observe(el); });
}
function trDead(t) {
  if (TR.dw || !window.MutationObserver) return;
  const href = location.href, sy = scrollY;
  let hit = false;
  const mo = new MutationObserver(() => { hit = true; });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  TR.dw = setTimeout(() => { mo.disconnect(); TR.dw = 0; if (!hit && location.href === href && Math.abs(scrollY - sy) < 2) track('dead', { t: trSel(t), v: view }); }, 900);
}
function trVitalsSend() {
  if (TR.vsent) return;
  TR.vsent = true;
  const n = performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null, f = performance.getEntriesByName ? performance.getEntriesByName('first-contentful-paint')[0] : null;
  track('vitals', { lcp: TR.vit.lcp, cls: Math.round(TR.vit.cls * 1000) / 1000, inp: TR.vit.inp || null, fcp: f ? f.startTime : null, ttfb: n ? n.responseStart : null, load: n && n.loadEventEnd ? n.loadEventEnd : null, v: view });
}
function trHz() {
  return new Promise(r => {
    if (document.visibilityState !== 'visible') { r(null); return; }
    const t = [];
    const f = x => {
      t.push(x);
      if (t.length < 61) { requestAnimationFrame(f); return; }
      const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b), hz = 1000 / d[d.length >> 1];
      r([30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 360].reduce((a, b) => Math.abs(b - hz) < Math.abs(a - hz) ? b : a));
    };
    requestAnimationFrame(f);
  });
}
async function trGeo() {
  try { const c = JSON.parse(sessionStorage.getItem('gameplay:geo')); if (c) return c; } catch (e) {}
  try {
    const j = await (await fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })).json();
    const org = String(j.organization_name || j.organization || '').replace(/^AS\d+\s*/, '');
    const o = { cc: String(j.country_code || '').slice(0, 2).toUpperCase(), country: j.country || '', region: j.region || '', city: j.city || '', isp: org, asn: +j.asn || +(String(j.organization || '').match(/^AS(\d+)/) || [])[1] || null, gtz: j.timezone || '' };
    try { sessionStorage.setItem('gameplay:geo', JSON.stringify(o)); } catch (e) {}
    return o;
  } catch (e) { return null; }
}
function trGpu() {
  try {
    const c = document.createElement('canvas'), gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return '';
    const x = /Firefox\//.test(navigator.userAgent) ? null : gl.getExtension('WEBGL_debug_renderer_info');
    const r = String(gl.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    const lc = gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
    return r.replace(/^ANGLE \((.*)\)$/, '$1').replace(/,? ?(Direct3D|D3D|OpenGL|Vulkan|Metal).*$/i, '').replace(/ \(0x[0-9a-f]+\)/gi, '').replace(/^[^,]{2,24}, (?=.*\S)/, '').trim().slice(0, 100);
  } catch (e) { return ''; }
}
function trOs(hi) {
  const ua = navigator.userAgent, d = device().os, pv = hi && hi.platformVersion ? String(hi.platformVersion) : '';
  let m;
  if (d === 'Windows') { const v = parseInt(pv, 10); return v >= 13 ? 'Windows 11' : v > 0 ? 'Windows 10' : (m = ua.match(/Windows NT ([\d.]+)/)) ? 'Windows ' + ({ '10.0': '10 or 11', '6.3': '8.1', '6.2': '8', '6.1': '7' }[m[1]] || m[1]) : 'Windows'; }
  if (d === 'Android') return 'Android ' + (pv ? pv.split('.')[0] : (m = ua.match(/Android (\d+)/)) ? m[1] : '');
  if ((m = ua.match(/(?:iPhone|iPad|CPU) OS (\d+)_(\d+)/))) return 'iOS ' + m[1] + '.' + m[2];
  if (d === 'iOS') return (m = ua.match(/Version\/(\d+\.\d+)/)) ? 'iPadOS ' + m[1] : 'iPadOS';
  if (d === 'macOS') return 'macOS' + (pv ? ' ' + pv.split('.').slice(0, 2).join('.') : (m = ua.match(/Mac OS X (\d+)[_.](\d+)/)) ? ' ' + m[1] + '.' + m[2] : '');
  return d;
}
function trBr(hi) {
  const b = device().browser, ua = navigator.userAgent, want = { Chrome: 'Google Chrome', Edge: 'Microsoft Edge', Opera: 'Opera' }[b];
  const fv = hi && hi.fullVersionList && want ? hi.fullVersionList.find(x => x.brand === want) : null;
  if (fv) return b + ' ' + String(fv.version).split('.')[0];
  const m = ua.match(b === 'Firefox' ? /Firefox\/(\d+)/ : b === 'Safari' ? /Version\/(\d+(?:\.\d+)?)/ : b === 'Samsung' ? /SamsungBrowser\/(\d+)/ : b === 'Edge' ? /Edg\/(\d+)/ : b === 'Opera' ? /OPR\/(\d+)/ : /Chrome\/(\d+)/);
  return b + (m ? ' ' + m[1] : '');
}
function trAdb() {
  return new Promise(r => {
    const b = document.createElement('div');
    b.className = 'adsbox ad-banner ad-unit pub_300x250 text-ad';
    b.style.cssText = 'position:absolute;left:-999px;top:0;width:10px;height:10px';
    b.innerHTML = '&nbsp;';
    document.body.append(b);
    setTimeout(() => { const s = getComputedStyle(b); r(!b.offsetHeight || s.display === 'none' || s.visibility === 'hidden'); b.remove(); }, 400);
  });
}
async function trEnv() {
  if (!anOk() || TR.env) return;
  TR.env = 1;
  try { if (sessionStorage.getItem('gameplay:env') === SID) return; sessionStorage.setItem('gameplay:env', SID); } catch (e) {}
  const ud = navigator.userAgentData, c = navigator.connection || {}, now = new Date(), tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();
  const [hi, kbm, geo, hz, adb] = await Promise.all([
    trTo(ud && ud.getHighEntropyValues ? ud.getHighEntropyValues(['platformVersion', 'model', 'architecture', 'bitness', 'fullVersionList']).catch(() => null) : Promise.resolve(null), 2000),
    trTo(navigator.keyboard && navigator.keyboard.getLayoutMap ? navigator.keyboard.getLayoutMap().catch(() => null) : Promise.resolve(null), 2000),
    trTo(trGeo(), 6000), trTo(trHz(), 4000), trTo(trAdb(), 2000)
  ]);
  if (kbm && !TR.kb) TR.kb = trKbOf(kbm.get('KeyQ'), kbm.get('KeyY'), kbm.get('KeyW'));
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean).map(p => trPadKind(p.id)) : [];
  track('env_dev', { osv: trOs(hi), brv: trBr(hi), model: hi && hi.model ? hi.model : null, arch: hi && hi.architecture ? hi.architecture + (hi.bitness ? '-' + hi.bitness : '') : null, cores: navigator.hardwareConcurrency || null, mem: navigator.deviceMemory || null, gpu: trGpu() || null, gl2: 'WebGL2RenderingContext' in window, wgpu: 'gpu' in navigator, hz, kb: TR.kb || null, pads, adb, langs: (navigator.languages || []).slice(0, 6) });
  const g = geo || {}, dc = TR_DC.test(g.isp || ''), tzm = !!(g.gtz && tz && g.gtz !== tz && trOff(g.gtz) !== trOff(tz));
  track('env_geo', { tz, off: -now.getTimezoneOffset(), lh: now.getHours(), wd: now.getDay(), net: c.effectiveType || null, ctype: c.type || null, dl: c.downlink != null ? c.downlink : null, rtt: c.rtt != null ? c.rtt : null, save: c.saveData != null ? !!c.saveData : null, cc: g.cc || null, country: g.country || null, region: g.region || null, city: g.city || null, isp: g.isp || null, asn: g.asn || null, dc, tzm, vpn: dc || tzm });
}
function trHidden() { trImpFlush(); trVitalsSend(); }
function trEnd() {
  if (TR.g) { TR.g.why = 'close'; trEnd1(TR.g); }
  trScroll(); trImpFlush(); trVitalsSend();
  track('page_time', { v: view, sec: Math.round((performance.now() - TR.v0) / 1000), exit: true });
}
function trBoot() {
  TR.v0 = performance.now();
  const ob = (type, fn, o) => { try { new PerformanceObserver(l => l.getEntries().forEach(fn)).observe(Object.assign({ type, buffered: true }, o)); } catch (e) {} };
  ob('layout-shift', e => { if (!e.hadRecentInput) TR.vit.cls += e.value; });
  ob('largest-contentful-paint', e => { TR.vit.lcp = e.startTime; });
  ob('event', e => { if (e.interactionId) TR.vit.inp = Math.max(TR.vit.inp, e.duration); }, { durationThreshold: 40 });
  addEventListener('scroll', () => { if (view !== 'home') return; const h = document.documentElement.scrollHeight; if (h > 0) TR.sy = Math.max(TR.sy, 100 * (scrollY + innerHeight) / h); }, { passive: true });
  document.addEventListener('click', e => {
    const t = e.target;
    if (!(t instanceof Element) || t.closest('.g-root, input, textarea, select, [contenteditable]')) return;
    const now = performance.now(), x = e.clientX, y = e.clientY;
    TR.clicks = TR.clicks.filter(c => now - c.t < 800 && Math.hypot(c.x - x, c.y - y) < 30);
    TR.clicks.push({ t: now, x, y });
    if (TR.clicks.length === 3) track('rage', { t: trSel(t), v: view });
    if (getComputedStyle(t).cursor === 'pointer' || t.closest('a, button, [role="button"], img, label')) trDead(t);
  }, true);
  addEventListener('keydown', e => {
    if (TR.kb || !e.key || e.key.length !== 1 || !/^Key[QWYZA]$/.test(e.code)) return;
    const k = e.key.toLowerCase(), c = e.code;
    const l = (c === 'KeyQ' && k === 'a') || (c === 'KeyA' && k === 'q') || (c === 'KeyW' && k === 'z') ? 'azerty' : (c === 'KeyY' && k === 'z') || (c === 'KeyZ' && k === 'y') ? 'qwertz' : (c === 'KeyY' && k === 'y') || (c === 'KeyZ' && k === 'z') ? 'qwerty' : '';
    if (l) { TR.kb = l; if (TR.env) track('kb', { kb: l }); }
  }, true);
  addEventListener('gamepadconnected', e => {
    const id = String(e.gamepad && e.gamepad.id || '');
    if (!id || TR.pads.has(id)) return;
    TR.pads.add(id);
    track('pad', { kind: trPadKind(id), id: id.replace(/\s*\(.*?\)\s*/g, ' ').trim().slice(0, 60) || trPadKind(id), map: e.gamepad.mapping || '' });
  });
  let mt = 0;
  if (window.MutationObserver) new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(trImpScan, 400); }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  trImpScan();
  setInterval(trImpFlush, 30000);
  if (anOk()) setTimeout(trEnv, 1500);
}
Ameplay.ads = {
  watch(el, slot, net) {
    if (!el || !window.IntersectionObserver) return;
    let t = 0;
    const io = new IntersectionObserver(es => es.forEach(e => { clearTimeout(t); if (e.isIntersecting) t = setTimeout(() => { io.disconnect(); track('ad_impression', { slot: String(slot || ''), net: String(net || '') }); }, 1000); }), { threshold: .5 });
    io.observe(el);
    el.addEventListener('click', () => track('ad_click', { slot: String(slot || ''), net: String(net || '') }), true);
  },
  revenue(slot, usd, net) { track('ad_revenue', { slot: String(slot || ''), net: String(net || ''), usd: +usd || 0 }); }
};

const CHANGELOG = [
  { v: 6, date: '2026-10-17', items: [
    'Tap the heart on any game to add it to your favourites. They show up in their own row on the home page and in the Favourites filter, and follow your account to every device.',
    'A chat button now sits at the bottom right of every page, so you can talk with friends while you play.',
    'Party invites really work now: your friend gets the invite and joins your party in one tap.',
    'See when a friend is typing, and when they have seen your message.',
    'Rocket League got a big upgrade: better graphics, boost, cars, goal effects, camera and ball physics.',
    'Announcements from the team now show at the top of the site, and a game that is being fixed shows as temporarily unavailable instead of breaking.',
    'When the site updates while you are playing, a small bar tells you a new version is ready, and this What\'s new panel shows you what changed.'
  ] }
];

const FV_KEY = 'gameplay:favs', FV_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const FV = { ids: [], uid: null, at: 0, q: Promise.resolve() };
const FV_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.5 3.3 4.3 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"/></svg>';
const fvRead = k => { try { const a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? [...new Set(a.filter(x => typeof x === 'string' && FV_RE.test(x)))] : []; } catch (e) { return []; } };
const fvKey = () => FV.uid ? FV_KEY + ':' + FV.uid : FV_KEY;
const fvHas = id => FV.ids.includes(id);
const fvBtn = (id, cls) => `<button class="fav${cls ? ' ' + cls : ''}" type="button" data-fav="${id}" aria-pressed="${fvHas(id)}" aria-label="${fvHas(id) ? 'Remove from favourites' : 'Add to favourites'}">${FV_ICO}</button>`;
(() => { let uid = null; try { const s = JSON.parse(localStorage.getItem(SB_STORE) || 'null'); uid = s && s.user && s.user.id || null; } catch (e) {} if (SB.on && uid) FV.uid = uid; FV.ids = fvRead(fvKey()); })();
function fvStore() { try { localStorage.setItem(fvKey(), JSON.stringify(FV.ids)); } catch (e) {} }
function fvPaint() {
  document.querySelectorAll('[data-fav]').forEach(b => { const on = fvHas(b.dataset.fav); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', auT(on ? 'Remove from favourites' : 'Add to favourites')); b.title = auT(on ? 'Remove from favourites' : 'Add to favourites'); });
  if (view === 'home') { fvRail(); if (state.f.size) renderResults(); }
}
function fvRail() {
  const L = FV.ids.map(id => byId.get(id)).filter(Boolean).slice(0, 10), sec = $('#favs');
  sec.hidden = !L.length || !!(activeCount() || state.q.trim());
  $('#favrail').innerHTML = L.map((g, i) => card(g, 'fav', i)).join('');
  lzScan();
}
function fvToggle(id) {
  if (!byId.get(id)) return;
  const on = !fvHas(id), uid = FV.uid;
  FV.ids = on ? [id, ...FV.ids.filter(x => x !== id)] : FV.ids.filter(x => x !== id);
  fvStore(); fvPaint();
  toast(auT(on ? 'Added to favourites' : 'Removed from favourites'));
  track('favourite', { game: id, on });
  if (!uid || !SB.user || SB.user.id !== uid) return;
  FV.q = FV.q.then(async () => {
    try {
      if (on) await sbRest('favourites', { method: 'POST', body: [{ user_id: uid, game_id: id }], prefer: 'resolution=ignore-duplicates,return=minimal' });
      else await sbRest('favourites?user_id=eq.' + uid + '&game_id=eq.' + encodeURIComponent(id), { method: 'DELETE', prefer: 'return=minimal' });
    } catch (e) {
      if (FV.uid !== uid) return;
      FV.ids = on ? FV.ids.filter(x => x !== id) : [id, ...FV.ids.filter(x => x !== id)];
      fvStore(); fvPaint();
      toast(auT('Could not save your favourite. Check your connection and try again.'));
    }
  });
}
async function fvSync() {
  const uid = SB.user && SB.user.id;
  if (!uid) return;
  const guest = FV_KEY === fvKey() ? FV.ids.slice() : fvRead(FV_KEY);
  if (FV.uid !== uid) { FV.uid = uid; FV.ids = fvRead(fvKey()); }
  FV.ids = [...new Set(guest.concat(FV.ids))];
  fvStore(); fvPaint();
  FV.at = Date.now();
  try {
    if (guest.length) { await sbRest('favourites', { method: 'POST', body: guest.map(g => ({ user_id: uid, game_id: g })), prefer: 'resolution=ignore-duplicates,return=minimal' }); try { localStorage.removeItem(FV_KEY); } catch (e) {} }
    await FV.q;
    const r = await sbRest('favourites?select=game_id&order=created_at.desc&limit=300');
    if (!SB.user || SB.user.id !== uid || !Array.isArray(r)) return;
    FV.ids = r.map(x => x.game_id).filter(x => FV_RE.test(x));
    fvStore(); fvPaint();
  } catch (e) {}
}
function fvBar(g) { const b = $('#pFav'); b.dataset.fav = g.id; fvPaint(); }

const SF = { d: null, at: 0, ch: null, peek: false, shown: false, off: new Set(), gk: null, og: null };
const SF_KEY = 'gameplay:site', SF_HIDE = 'gameplay:sitehide';
try { const o = JSON.parse(localStorage.getItem(SF_KEY) || 'null'); if (o && typeof o === 'object') { SF.d = o; SF.off = new Set(Array.isArray(o.disabled_games) ? o.disabled_games : []); } } catch (e) {}
const sfOff = id => SF.off.has(id);
const sfBlocked = g => !!g && sfOff(g.id) && !adIsAdmin();
const SF_ICO = {
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  warning: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20zM12 10v4M12 17h.01"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 0-5-5L13 5zM3 21l6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>'
};
async function sfLoad(force) {
  if (!SB.on || (!force && Date.now() - SF.at < 15000)) return;
  SF.at = Date.now();
  try {
    const d = await sbRest('rpc/get_site_flags', { method: 'POST', body: {} });
    if (!d || typeof d !== 'object' || Array.isArray(d)) return;
    SF.d = d;
    try { localStorage.setItem(SF_KEY, JSON.stringify(d)); } catch (e) {}
    sfPaint();
  } catch (e) {}
}
function sfRt() {
  if (SF.ch || !SB.c) return;
  try { SF.ch = SB.c.channel('site').on('broadcast', { event: 'n' }, () => sfLoad(true)).subscribe(); } catch (e) {}
}
function sfNudge() {
  sfRt();
  try { if (SF.ch) SF.ch.send({ type: 'broadcast', event: 'n', payload: { t: Date.now() } }).catch(() => {}); } catch (e) {}
}
function sfLock() { const on = SF.shown || !!AD.locked; ['top', 'side', 'main'].forEach(id => { const n = document.getElementById(id); if (n) n.inert = on; }); }
function sfOffFrame(g) {
  SF.og = g;
  frame.textContent = '';
  const el = document.createElement('div');
  el.className = 'g-overlay sf-off';
  el.innerHTML = `<div class="g-ov-card"><span class="sf-offi">${SF_ICO.tool}</span><h3 class="g-ov-title">${esc(auT('Temporarily unavailable'))}</h3><p class="g-ov-text"${SF.d && SF.d.disabled_msg ? ' translate="no"' : ''}>${esc(SF.d && SF.d.disabled_msg || auT('This game is being fixed. Try again a bit later.'))}</p><div class="g-ov-btns"><button class="g-btn" type="button" data-sfback>${esc(auT('All games'))}</button></div></div>`;
  el.addEventListener('click', e => { if (e.target.closest('[data-sfback]')) { const a = document.querySelector('.am-back'); if (a) a.click(); } });
  const box = document.createElement('div');
  box.style.cssText = 'position:relative;width:min(100%,' + (g.width || 880) + 'px);aspect-ratio:16/10;min-height:340px;max-height:calc(100dvh - var(--goff, 250px));margin:0 auto';
  box.append(el); frame.append(box); void el.offsetWidth; el.classList.add('show');
}
function sfPaint() {
  const bar = $('#sfbar');
  if (!bar) return;
  const d = SF.d || {}, adm = adIsAdmin(), now = Date.now();
  const until = Date.parse(d.banner_until || '') || 0, txt = d.banner && (!until || until > now) ? String(d.banner) : '';
  let hid = '';
  try { hid = localStorage.getItem(SF_HIDE) || ''; } catch (e) {}
  const lv = d.banner_level === 'warning' ? 'warning' : 'info', showB = !!txt && hid !== syHash(txt), showM = !!d.maintenance && adm;
  bar.innerHTML = (showM ? `<div class="sfb sfb-adm">${SF_ICO.tool}<span>${esc(auT('Maintenance mode is on. Players see the maintenance page.'))}</span><button class="btn2" type="button" data-adgo="site">${esc(auT('Site switches'))}</button></div>` : '') + (showB ? `<div class="sfb sfb-${lv}" role="status">${SF_ICO[lv]}<span translate="no">${esc(txt)}</span><button class="x" type="button" data-sfhide aria-label="${esc(auT('Hide announcement'))}">${SF_ICO.x}</button></div>` : '');
  bar.hidden = !showB && !showM;
  clearTimeout(SF.bt);
  if (showB && until) SF.bt = setTimeout(sfPaint, Math.min(until - now + 500, 3600000));
  const m = !!d.maintenance && !adm && !(SB.user && !AD.at) && !SF.peek, el = $('#sfmaint');
  if (m !== SF.shown) {
    SF.shown = m;
    if (m) {
      if (openK && openK !== 'mauth') closeAll();
      if (cur || pend || view !== 'home') go(homeHref(), true);
      el.hidden = false;
    } else el.hidden = true;
    sfLock();
  }
  if (m) {
    const mm = $('#sfmm');
    mm.textContent = d.maintenance_msg || auT('We are making the site better. Please come back in a little while.');
    if (d.maintenance_msg) mm.setAttribute('translate', 'no'); else mm.removeAttribute('translate');
    $('#sfmin').hidden = !!SB.user || !SB.on;
  }
  const off = new Set(Array.isArray(d.disabled_games) ? d.disabled_games.filter(x => typeof x === 'string') : []), k = [...off].sort().join(',') + '|' + adm;
  if (k !== SF.gk) {
    const first = SF.gk == null;
    SF.off = off; SF.gk = k;
    if (!first) {
      if (view === 'home') renderHome();
      else if (view === 'game') { const g = (cur && cur.g) || pend || SF.og; if (g) { $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join(''); lzScan(); } }
    }
  }
  if (cur && sfBlocked(cur.g)) { const g = cur.g; setPause(false); cur.kill(); cur = null; ttSync(); sfOffFrame(g); }
  else if (pend && sfBlocked(pend)) { const g = pend; pend = null; sfOffFrame(g); }
  else if (SF.og && view === 'game' && !cur && !pend && !sfBlocked(SF.og)) { const g = SF.og, loc = parseLocation(); SF.og = null; if (loc.game && loc.game.id === g.id) { if (g.mount) start(g); else waitStart(g); } }
}

const CL_KEY = 'gameplay:seen', CL_NEW = Date.now() - (+S.since || 0) < 15000;
const CL = { open: false, t: 0, done: false };
const clTop = () => CHANGELOG.reduce((m, c) => Math.max(m, c.v), 0);
const clSeen = () => { try { return +localStorage.getItem(CL_KEY) || 0; } catch (e) { return 0; } };
function clMark(remote) {
  const v = clTop();
  try { localStorage.setItem(CL_KEY, String(v)); } catch (e) {}
  if (remote && SB.user) sbRest('profiles?id=eq.' + SB.user.id, { method: 'PATCH', body: { seen_version: v }, prefer: 'return=minimal' }).catch(() => {});
}
function clDay(s) { try { return new Date(String(s).slice(0, 10) + 'T12:00:00').toLocaleDateString(adLang(), { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return String(s).slice(0, 10); } }
function clOpen() {
  clearTimeout(CL.t); CL.done = true;
  const L = CHANGELOG.slice().sort((a, b) => b.v - a.v);
  $('#clpb').innerHTML = L.map((c, i) => `<section class="clp-s" style="--i:${i}"><h4>${esc(clDay(c.date))}${i === 0 ? `<em>${esc(auT('New'))}</em>` : ''}</h4><ul>${c.items.map((t, j) => `<li style="--j:${j}">${esc(auT(t))}</li>`).join('')}</ul></section>`).join('');
  const el = $('#clp');
  vis(el, true); CL.open = true;
  el.querySelector('.clp-card').scrollTop = 0;
  if (!auCoarse()) setTimeout(() => { const b = el.querySelector('.clp-f .btn2'); if (b && CL.open) b.focus({ preventScroll: true }); }, 60);
}
function clClose() {
  if (!CL.open) return;
  CL.open = false;
  vis($('#clp'), false);
  clMark(true);
}
function clAuto(seenRemote) {
  if (CL.done || CL.open) return;
  const top = clTop();
  if (clSeen() >= top) { CL.done = true; if (seenRemote !== undefined && (+seenRemote || 0) < top) clMark(true); return; }
  if (seenRemote != null && +seenRemote >= top) { CL.done = true; clMark(false); return; }
  if (CL_NEW && !clSeen()) { CL.done = true; clMark(false); return; }
  clOpen();
}

const UP = { base: null, at: 0, busy: false, shown: false };
const upUrl = () => PATH_MODE ? location.origin + '/' : location.origin + location.pathname;
async function upSig() {
  let r = await fetch(upUrl(), { method: 'HEAD', cache: 'no-store', credentials: 'omit' });
  const h = r.ok ? (r.headers.get('etag') || r.headers.get('last-modified')) : null;
  if (h) return 'h:' + h;
  r = await fetch(upUrl(), { cache: 'no-store', credentials: 'omit' });
  return r.ok ? 't:' + syHash(await r.text()) : null;
}
async function upCheck(force) {
  if (UP.busy || UP.shown || !/^https?:$/.test(location.protocol) || (!force && Date.now() - UP.at < 60000)) return;
  UP.busy = true; UP.at = Date.now();
  try { const s = await upSig(); if (s) { if (UP.base == null) UP.base = s; else if (s !== UP.base) upShow(); } } catch (e) {}
  finally { UP.busy = false; }
}
function upShow() {
  UP.shown = true;
  const el = $('#upbar');
  vis(el, true);
  track('update_ready', {});
}

function siteBoot() {
  document.body.insertAdjacentHTML('afterbegin', '<div class="sfbar" id="sfbar" hidden></div>');
  document.body.insertAdjacentHTML('beforeend', `<div class="adblock sfm" id="sfmaint" hidden role="dialog" aria-modal="true" aria-labelledby="sfmt"><div class="adb-wrap"><div class="adb-brand"><span class="logo"><svg viewBox="0 0 16 16"><path d="M2 1.5v13l12-6.5z"/></svg></span><span>gameplay</span></div><div class="adb-card"><span class="adb-ico sfm-ico">${SF_ICO.tool}</span><h3 id="sfmt">${esc(auT('We will be right back'))}</h3><p class="adb-sub" id="sfmm"></p><p class="adb-sub sfm-s">${esc(auT('This page refreshes by itself when the site is back.'))}</p><button class="btn2" type="button" id="sfmin" hidden>${esc(auT('Admin? Log in'))}</button></div></div></div>
<div class="clp" id="clp" hidden role="dialog" aria-modal="true" aria-labelledby="clpt"><div class="clp-card"><div class="clp-h"><span class="clp-ico">${SF_ICO.spark}</span><div><h3 id="clpt">${esc(auT('What\'s new'))}</h3><p>${esc(auT('The latest changes to gameplay'))}</p></div><button class="x" type="button" data-clx aria-label="${esc(auT('Close'))}">${SF_ICO.x}</button></div><div class="clp-b" id="clpb"></div><div class="clp-f"><button class="btn2 pri" type="button" data-clx>${esc(auT('Got it'))}</button></div></div></div>
<div class="upbar" id="upbar" hidden role="status"><span>${SF_ICO.spark}</span><b>${esc(auT('A new version is ready.'))}</b><button class="btn2 pri" type="button" id="upgo">${esc(auT('Reload'))}</button><button class="x" type="button" id="upx" aria-label="${esc(auT('Later'))}">${SF_ICO.x}</button></div>`);
  document.addEventListener('click', e => {
    const t = e.target, f = t.closest && t.closest('[data-fav]');
    if (f) { e.preventDefault(); e.stopPropagation(); if (f.dataset.fav) fvToggle(f.dataset.fav); return; }
    if (t.closest && t.closest('[data-sfhide]')) { e.stopPropagation(); const txt = SF.d && SF.d.banner || ''; try { localStorage.setItem(SF_HIDE, syHash(String(txt))); } catch (x) {} sfPaint(); }
  }, true);
  $('#clp').addEventListener('click', e => { e.stopPropagation(); if (e.target === e.currentTarget || e.target.closest('[data-clx]')) clClose(); });
  $('#upgo').addEventListener('click', () => location.reload());
  $('#upx').addEventListener('click', e => { e.stopPropagation(); vis($('#upbar'), false); });
  $('#sfmin').addEventListener('click', e => { e.stopPropagation(); SF.peek = true; sfPaint(); auOpen('main', '', '', 'in'); });
  $('#clopen').addEventListener('click', e => { e.stopPropagation(); closeAll(); clOpen(); });
  addEventListener('keydown', e => { if (!CL.open) return; if (e.key === 'Escape') { e.preventDefault(); clClose(); } e.stopImmediatePropagation(); }, true);
  const wake = () => { if (document.visibilityState === 'hidden') return; sfLoad(); upCheck(); if (SB.user && Date.now() - FV.at > 60000) fvSync(); };
  document.addEventListener('visibilitychange', wake);
  addEventListener('focus', wake);
  setInterval(() => { if (document.visibilityState !== 'hidden') { sfLoad(true); upCheck(true); } }, 300000);
  setInterval(() => { if (SF.shown) sfLoad(true); }, 60000);
  setTimeout(() => upCheck(true), 4000);
  sfPaint(); sfLoad(true);
  if (SB.on) sbClient().then(() => sfRt()).catch(() => {});
  setInterval(() => { if (!SF.ch && !SF.shown && document.visibilityState !== 'hidden') sfLoad(true); }, 60000);
  if (SB.on && sbHasSession()) CL.t = setTimeout(() => clAuto(), 8000);
  else CL.t = setTimeout(() => clAuto(), 1200);
  Ameplay.debug.site = { check: () => upCheck(true), load: () => sfLoad(true), flags: () => SF.d, favs: () => FV.ids.slice(), route: () => ({ api: SB.on ? SBN.best() : 'none', live: SBN.ws(), routes: SBN.all(), accounts: SB.on }) };
}
async function siteSignedIn() {
  const uid = SB.user.id;
  SF.peek = false;
  sfRt(); sfLoad(); fvSync();
  if (CL.done || CL.open) return;
  let sv = null;
  try { const r = await sbRest('profiles?select=seen_version&id=eq.' + uid); sv = r && r[0] ? r[0].seen_version : null; } catch (e) {}
  if (!SB.user || SB.user.id !== uid) return;
  clAuto(sv);
}
function siteSignedOut() { FV.uid = null; FV.ids = fvRead(FV_KEY); fvPaint(); sfPaint(); }

Ameplay.debug = { open: id => go(href(id), false), close: () => go(PATH_MODE ? '/' : '#/', false), games, fire: () => ov && ov.fire(), state, compute, q: t => { const o = state.q; state.q = t; const r = compute().list.map(g => g.id); state.q = o; return r; }, info: INFO, fit: () => fitStage(), pause: () => PAUSE.on };
document.addEventListener('DOMContentLoaded', boot);
})();

(() => {
const LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt'], NAMES = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' }, LKEY = 'gameplay:lang';
const R = [
["Owner", "Propriétaire", "Propietario", "Inhaber", "Proprietario", "Proprietário"],
["This user is now an owner.", "Cet utilisateur est maintenant propriétaire.", "Este usuario ahora es propietario.", "Dieser Benutzer ist jetzt Inhaber.", "Questo utente ora è proprietario.", "Este utilizador é agora proprietário."],
["Only an owner can change an owner.", "Seul un propriétaire peut modifier un propriétaire.", "Solo un propietario puede cambiar a un propietario.", "Nur ein Inhaber kann einen Inhaber ändern.", "Solo un proprietario può modificare un proprietario.", "Só um proprietário pode alterar um proprietário."],
["Only an owner can change the role of an admin.", "Seul un propriétaire peut changer le rôle d’un admin.", "Solo un propietario puede cambiar el rol de un administrador.", "Nur ein Inhaber kann die Rolle eines Admins ändern.", "Solo un proprietario può cambiare il ruolo di un admin.", "Só um proprietário pode alterar o papel de um administrador."],
["Only an owner can do this.", "Seul un propriétaire peut faire ça.", "Solo un propietario puede hacer esto.", "Das kann nur ein Inhaber.", "Solo un proprietario può farlo.", "Só um proprietário pode fazer isto."],
["There must be at least one owner", "Il doit rester au moins un propriétaire", "Debe haber al menos un propietario", "Es muss mindestens einen Inhaber geben", "Deve esserci almeno un proprietario", "Tem de existir pelo menos um proprietário"],
["{a} made {t} an owner", "{a} a nommé {t} propriétaire", "{a} hizo propietario a {t}", "{a} hat {t} zum Inhaber gemacht", "{a} ha reso {t} proprietario", "{a} tornou {t} proprietário"],
["{a} changed the site password", "{a} a changé le mot de passe du site", "{a} cambió la contraseña del sitio", "{a} hat das Seitenpasswort geändert", "{a} ha cambiato la password del sito", "{a} alterou a palavra-passe do site"],
["Site password", "Mot de passe du site", "Contraseña del sitio", "Seitenpasswort", "Password del sito", "Palavra-passe do site"],
["The password everyone types to open the site. Only owners can see and change this.", "Le mot de passe que tout le monde tape pour ouvrir le site. Seuls les propriétaires peuvent voir et modifier ceci.", "La contraseña que todos escriben para abrir el sitio. Solo los propietarios pueden ver y cambiar esto.", "Das Passwort, das alle eingeben, um die Seite zu öffnen. Nur Inhaber können das sehen und ändern.", "La password che tutti digitano per aprire il sito. Solo i proprietari possono vederla e cambiarla.", "A palavra-passe que todos escrevem para abrir o site. Só os proprietários podem ver e alterar isto."],
["Use at least 6 characters.", "Utilise au moins 6 caractères.", "Usa al menos 6 caracteres.", "Verwende mindestens 6 Zeichen.", "Usa almeno 6 caratteri.", "Usa pelo menos 6 caracteres."],
["The two passwords do not match.", "Les deux mots de passe ne correspondent pas.", "Las dos contraseñas no coinciden.", "Die beiden Passwörter stimmen nicht überein.", "Le due password non corrispondono.", "As duas palavras-passe não coincidem."],
["This copy of the site is not password protected.", "Cette copie du site n’est pas protégée par un mot de passe.", "Esta copia del sitio no está protegida con contraseña.", "Diese Kopie der Seite ist nicht passwortgeschützt.", "Questa copia del sito non è protetta da password.", "Esta cópia do site não está protegida por palavra-passe."],
["Site password changed. Everyone needs the new password; devices that already unlocked this version stay unlocked.", "Mot de passe du site changé. Tout le monde a besoin du nouveau mot de passe ; les appareils qui ont déjà déverrouillé cette version restent déverrouillés.", "Contraseña del sitio cambiada. Todos necesitan la nueva contraseña; los dispositivos que ya desbloquearon esta versión siguen desbloqueados.", "Seitenpasswort geändert. Alle brauchen das neue Passwort; Geräte, die diese Version schon entsperrt haben, bleiben entsperrt.", "Password del sito cambiata. Tutti hanno bisogno della nuova password; i dispositivi che hanno già sbloccato questa versione restano sbloccati.", "Palavra-passe do site alterada. Todos precisam da nova palavra-passe; os dispositivos que já desbloquearam esta versão continuam desbloqueados."],
["Tap the heart on any game to add it to your favourites. They show up in their own row on the home page and in the Favourites filter, and follow your account to every device.", "Touche le cœur d’un jeu pour l’ajouter à tes favoris. Ils apparaissent dans leur propre rangée sur l’accueil et dans le filtre Favoris, et suivent ton compte sur tous tes appareils.", "Toca el corazón de cualquier juego para añadirlo a tus favoritos. Aparecen en su propia fila en la página de inicio y en el filtro Favoritos, y siguen a tu cuenta en todos tus dispositivos.", "Tippe bei einem Spiel auf das Herz, um es zu deinen Favoriten hinzuzufügen. Sie erscheinen in einer eigenen Reihe auf der Startseite und im Favoriten-Filter und folgen deinem Konto auf jedes Gerät.", "Tocca il cuore di un gioco per aggiungerlo ai preferiti. Compaiono in una riga tutta loro nella home e nel filtro Preferiti, e seguono il tuo account su ogni dispositivo.", "Toca no coração de qualquer jogo para o adicionar aos favoritos. Aparecem numa fila própria na página inicial e no filtro Favoritos, e acompanham a tua conta em todos os dispositivos."],
["A chat button now sits at the bottom right of every page, so you can talk with friends while you play.", "Un bouton de discussion se trouve maintenant en bas à droite de chaque page, pour parler avec tes amis pendant que tu joues.", "Ahora hay un botón de chat abajo a la derecha en todas las páginas, para hablar con tus amigos mientras juegas.", "Unten rechts auf jeder Seite gibt es jetzt einen Chat-Button, damit du beim Spielen mit Freunden schreiben kannst.", "Ora c’è un pulsante della chat in basso a destra in ogni pagina, così puoi parlare con gli amici mentre giochi.", "Agora há um botão de conversa no canto inferior direito de todas as páginas, para falares com amigos enquanto jogas."],
["Party invites really work now: your friend gets the invite and joins your party in one tap.", "Les invitations de groupe fonctionnent vraiment : ton ami reçoit l’invitation et rejoint ton groupe en un geste.", "Las invitaciones de grupo ya funcionan de verdad: tu amigo recibe la invitación y se une a tu grupo con un toque.", "Party-Einladungen funktionieren jetzt richtig: Dein Freund bekommt die Einladung und tritt deiner Gruppe mit einem Tipp bei.", "Gli inviti al gruppo ora funzionano davvero: il tuo amico riceve l’invito ed entra nel tuo gruppo con un tocco.", "Os convites de grupo funcionam mesmo: o teu amigo recebe o convite e entra no teu grupo com um toque."],
["See when a friend is typing, and when they have seen your message.", "Vois quand un ami est en train d’écrire, et quand il a vu ton message.", "Mira cuándo un amigo está escribiendo y cuándo ha visto tu mensaje.", "Sieh, wann ein Freund gerade schreibt und wann er deine Nachricht gesehen hat.", "Vedi quando un amico sta scrivendo e quando ha visto il tuo messaggio.", "Vê quando um amigo está a escrever e quando viu a tua mensagem."],
["Rocket League got a big upgrade: better graphics, boost, cars, goal effects, camera and ball physics.", "Rocket League a reçu une grosse mise à jour : meilleurs graphismes, boost, voitures, effets de but, caméra et physique du ballon.", "Rocket League recibió una gran mejora: mejores gráficos, turbo, coches, efectos de gol, cámara y física del balón.", "Rocket League hat ein großes Upgrade bekommen: bessere Grafik, Boost, Autos, Toreffekte, Kamera und Ballphysik.", "Rocket League ha ricevuto un grande aggiornamento: grafica migliore, boost, auto, effetti del gol, telecamera e fisica della palla.", "O Rocket League recebeu uma grande melhoria: melhores gráficos, boost, carros, efeitos de golo, câmara e física da bola."],
["Announcements from the team now show at the top of the site, and a game that is being fixed shows as temporarily unavailable instead of breaking.", "Les annonces de l’équipe s’affichent maintenant en haut du site, et un jeu en cours de réparation s’affiche comme temporairement indisponible au lieu de planter.", "Los avisos del equipo ahora aparecen arriba del sitio, y un juego que se está arreglando aparece como no disponible temporalmente en lugar de fallar.", "Ankündigungen des Teams erscheinen jetzt oben auf der Seite, und ein Spiel, das gerade repariert wird, wird als vorübergehend nicht verfügbar angezeigt, statt abzustürzen.", "Gli annunci del team ora compaiono in cima al sito, e un gioco in riparazione appare come temporaneamente non disponibile invece di bloccarsi.", "Os avisos da equipa aparecem agora no topo do site, e um jogo que está a ser corrigido aparece como temporariamente indisponível em vez de falhar."],
["When the site updates while you are playing, a small bar tells you a new version is ready, and this What's new panel shows you what changed.", "Quand le site est mis à jour pendant que tu joues, une petite barre te prévient qu’une nouvelle version est prête, et ce panneau Nouveautés te montre ce qui a changé.", "Cuando el sitio se actualiza mientras juegas, una pequeña barra te avisa de que hay una nueva versión, y este panel de Novedades te muestra qué ha cambiado.", "Wenn die Seite aktualisiert wird, während du spielst, zeigt dir eine kleine Leiste, dass eine neue Version bereit ist, und dieses Neuigkeiten-Fenster zeigt dir, was sich geändert hat.", "Quando il sito si aggiorna mentre giochi, una piccola barra ti avvisa che è pronta una nuova versione, e questo pannello Novità ti mostra cosa è cambiato.", "Quando o site é atualizado enquanto jogas, uma pequena barra avisa-te de que há uma nova versão pronta, e este painel de Novidades mostra-te o que mudou."],
["Remove from favourites", "Retirer des favoris", "Quitar de favoritos", "Aus Favoriten entfernen", "Rimuovi dai preferiti", "Remover dos favoritos"],
["Add to favourites", "Ajouter aux favoris", "Añadir a favoritos", "Zu Favoriten hinzufügen", "Aggiungi ai preferiti", "Adicionar aos favoritos"],
["Added to favourites", "Ajouté aux favoris", "Añadido a favoritos", "Zu Favoriten hinzugefügt", "Aggiunto ai preferiti", "Adicionado aos favoritos"],
["Removed from favourites", "Retiré des favoris", "Quitado de favoritos", "Aus Favoriten entfernt", "Rimosso dai preferiti", "Removido dos favoritos"],
["Could not save your favourite. Check your connection and try again.", "Impossible d’enregistrer ton favori. Vérifie ta connexion et réessaie.", "No se pudo guardar tu favorito. Revisa tu conexión e inténtalo de nuevo.", "Dein Favorit konnte nicht gespeichert werden. Prüfe deine Verbindung und versuch es erneut.", "Impossibile salvare il preferito. Controlla la connessione e riprova.", "Não foi possível guardar o favorito. Verifica a ligação e tenta de novo."],
["Temporarily unavailable", "Temporairement indisponible", "No disponible temporalmente", "Vorübergehend nicht verfügbar", "Temporaneamente non disponibile", "Temporariamente indisponível"],
["This game is being fixed. Try again a bit later.", "Ce jeu est en cours de réparation. Réessaie un peu plus tard.", "Estamos arreglando este juego. Vuelve a intentarlo un poco más tarde.", "Dieses Spiel wird gerade repariert. Versuch es etwas später noch einmal.", "Stiamo sistemando questo gioco. Riprova un po’ più tardi.", "Este jogo está a ser corrigido. Tenta de novo daqui a pouco."],
["Maintenance mode is on. Players see the maintenance page.", "Le mode maintenance est activé. Les joueurs voient la page de maintenance.", "El modo mantenimiento está activado. Los jugadores ven la página de mantenimiento.", "Der Wartungsmodus ist an. Spieler sehen die Wartungsseite.", "La modalità manutenzione è attiva. I giocatori vedono la pagina di manutenzione.", "O modo de manutenção está ligado. Os jogadores veem a página de manutenção."],
["Site switches", "Réglages du site", "Ajustes del sitio", "Seiten-Schalter", "Interruttori del sito", "Interruptores do site"],
["Hide announcement", "Masquer l’annonce", "Ocultar aviso", "Ankündigung ausblenden", "Nascondi annuncio", "Ocultar aviso"],
["We are making the site better. Please come back in a little while.", "Nous améliorons le site. Reviens dans un petit moment.", "Estamos mejorando el sitio. Vuelve dentro de un rato.", "Wir machen die Seite besser. Schau bitte in Kürze wieder vorbei.", "Stiamo migliorando il sito. Torna tra un po’.", "Estamos a melhorar o site. Volta daqui a pouco."],
["New", "Nouveau", "Nuevo", "Neu", "Nuovo", "Novo"],
["What's new", "Nouveautés", "Novedades", "Neuigkeiten", "Novità", "Novidades"],
["The latest changes to gameplay", "Les derniers changements de gameplay", "Los últimos cambios en gameplay", "Die neuesten Änderungen an gameplay", "Le ultime novità di gameplay", "As últimas alterações ao gameplay"],
["Got it", "Compris", "Entendido", "Verstanden", "Ho capito", "Entendido"],
["A new version is ready.", "Une nouvelle version est prête.", "Hay una nueva versión lista.", "Eine neue Version ist bereit.", "È pronta una nuova versione.", "Há uma nova versão pronta."],
["Reload", "Recharger", "Recargar", "Neu laden", "Ricarica", "Recarregar"],
["Later", "Plus tard", "Más tarde", "Später", "Più tardi", "Mais tarde"],
["We will be right back", "On revient très vite", "Volvemos enseguida", "Wir sind gleich zurück", "Torniamo subito", "Voltamos já"],
["This page refreshes by itself when the site is back.", "Cette page se met à jour toute seule quand le site revient.", "Esta página se actualiza sola cuando el sitio vuelva.", "Diese Seite aktualisiert sich von selbst, sobald die Seite wieder da ist.", "Questa pagina si aggiorna da sola quando il sito torna attivo.", "Esta página atualiza-se sozinha quando o site voltar."],
["Admin? Log in", "Admin ? Connecte-toi", "¿Admin? Inicia sesión", "Admin? Anmelden", "Admin? Accedi", "Admin? Inicia sessão"],
["Favourites", "Favoris", "Favoritos", "Favoriten", "Preferiti", "Favoritos"],
["My favourites", "Mes favoris", "Mis favoritos", "Meine Favoriten", "I miei preferiti", "Os meus favoritos"],
["Log", "Journal", "Registro", "Protokoll", "Registro", "Registo"],
["How long", "Durée", "Duración", "Dauer", "Durata", "Duração"],
["1 hour", "1 heure", "1 hora", "1 Stunde", "1 ora", "1 hora"],
["24 hours", "24 heures", "24 horas", "24 Stunden", "24 ore", "24 horas"],
["7 days", "7 jours", "7 días", "7 Tage", "7 giorni", "7 dias"],
["30 days", "30 jours", "30 días", "30 Tage", "30 giorni", "30 dias"],
["Permanent", "Permanent", "Permanente", "Dauerhaft", "Permanente", "Permanente"],
["History", "Historique", "Historial", "Verlauf", "Cronologia", "Histórico"],
["Lock ends", "Fin du blocage", "Fin del bloqueo", "Sperre endet", "Fine del blocco", "Fim do bloqueio"],
["Pick an end time in the future.", "Choisis une date de fin dans le futur.", "Elige una hora de fin en el futuro.", "Wähle ein Ende in der Zukunft.", "Scegli una fine nel futuro.", "Escolhe uma hora de fim no futuro."],
["ends {t}", "se termine {t}", "termina {t}", "endet {t}", "termina {t}", "termina {t}"],
["until {d}", "jusqu’au {d}", "hasta el {d}", "bis {d}", "fino al {d}", "até {d}"],
["Locked until {d} ({r}).", "Bloqué jusqu’au {d} ({r}).", "Bloqueado hasta el {d} ({r}).", "Gesperrt bis {d} ({r}).", "Bloccato fino al {d} ({r}).", "Bloqueado até {d} ({r})."],
["Locked with no end date.", "Bloqué sans date de fin.", "Bloqueado sin fecha de fin.", "Gesperrt ohne Enddatum.", "Bloccato senza data di fine.", "Bloqueado sem data de fim."],
["Account locked until {d}. They only see the blocked page until then.", "Compte bloqué jusqu’au {d}. La personne ne voit que la page de blocage d’ici là.", "Cuenta bloqueada hasta el {d}. Hasta entonces solo ve la página de bloqueo.", "Konto gesperrt bis {d}. Bis dahin sieht die Person nur die Sperrseite.", "Account bloccato fino al {d}. Fino ad allora vede solo la pagina di blocco.", "Conta bloqueada até {d}. Até lá só vê a página de bloqueio."],
["{a} made {t} an admin", "{a} a nommé {t} admin", "{a} hizo admin a {t}", "{a} hat {t} zum Admin gemacht", "{a} ha reso {t} admin", "{a} tornou {t} admin"],
["{a} made {t} a regular user", "{a} a remis {t} en utilisateur normal", "{a} hizo a {t} usuario normal", "{a} hat {t} zum normalen Nutzer gemacht", "{a} ha reso {t} un utente normale", "{a} tornou {t} um utilizador normal"],
["{a} changed the username of {t} to {n}", "{a} a changé le nom d’utilisateur de {t} en {n}", "{a} cambió el nombre de usuario de {t} a {n}", "{a} hat den Benutzernamen von {t} in {n} geändert", "{a} ha cambiato il nome utente di {t} in {n}", "{a} mudou o nome de utilizador de {t} para {n}"],
["{a} locked {t} until {d}", "{a} a bloqué {t} jusqu’au {d}", "{a} bloqueó a {t} hasta el {d}", "{a} hat {t} bis {d} gesperrt", "{a} ha bloccato {t} fino al {d}", "{a} bloqueou {t} até {d}"],
["{a} locked {t} with no end date", "{a} a bloqué {t} sans date de fin", "{a} bloqueó a {t} sin fecha de fin", "{a} hat {t} ohne Enddatum gesperrt", "{a} ha bloccato {t} senza data di fine", "{a} bloqueou {t} sem data de fim"],
["{a} unlocked {t}", "{a} a débloqué {t}", "{a} desbloqueó a {t}", "{a} hat {t} entsperrt", "{a} ha sbloccato {t}", "{a} desbloqueou {t}"],
["The lock on {t} ended", "Le blocage de {t} est terminé", "Terminó el bloqueo de {t}", "Die Sperre von {t} ist abgelaufen", "Il blocco di {t} è terminato", "O bloqueio de {t} terminou"],
["{a} set a new password for {t}", "{a} a défini un nouveau mot de passe pour {t}", "{a} puso una nueva contraseña a {t}", "{a} hat ein neues Passwort für {t} festgelegt", "{a} ha impostato una nuova password per {t}", "{a} definiu uma nova palavra-passe para {t}"],
["{a} sent a password reset email to {t}", "{a} a envoyé un e-mail de réinitialisation du mot de passe à {t}", "{a} envió un correo para restablecer la contraseña a {t}", "{a} hat {t} eine E-Mail zum Zurücksetzen des Passworts geschickt", "{a} ha inviato a {t} un’email per reimpostare la password", "{a} enviou a {t} um email para repor a palavra-passe"],
["{a} deleted the account of {t}", "{a} a supprimé le compte de {t}", "{a} eliminó la cuenta de {t}", "{a} hat das Konto von {t} gelöscht", "{a} ha eliminato l’account di {t}", "{a} eliminou a conta de {t}"],
["{a} deleted a ticket from {t}", "{a} a supprimé un ticket de {t}", "{a} eliminó un ticket de {t}", "{a} hat ein Ticket von {t} gelöscht", "{a} ha eliminato un ticket di {t}", "{a} eliminou um pedido de {t}"],
["{a} replied to a ticket from {t}", "{a} a répondu à un ticket de {t}", "{a} respondió a un ticket de {t}", "{a} hat auf ein Ticket von {t} geantwortet", "{a} ha risposto a un ticket di {t}", "{a} respondeu a um pedido de {t}"],
["{a} closed a ticket from {t}", "{a} a fermé un ticket de {t}", "{a} cerró un ticket de {t}", "{a} hat ein Ticket von {t} geschlossen", "{a} ha chiuso un ticket di {t}", "{a} fechou um pedido de {t}"],
["{a} reopened a ticket from {t}", "{a} a rouvert un ticket de {t}", "{a} reabrió un ticket de {t}", "{a} hat ein Ticket von {t} wieder geöffnet", "{a} ha riaperto un ticket di {t}", "{a} reabriu um pedido de {t}"],
["{a} changed the site switches", "{a} a modifié les réglages du site", "{a} cambió los ajustes del sitio", "{a} hat die Seiten-Schalter geändert", "{a} ha cambiato gli interruttori del sito", "{a} alterou os interruptores do site"],
["{a} did something ({x})", "{a} a fait une action ({x})", "{a} hizo una acción ({x})", "{a} hat etwas getan ({x})", "{a} ha fatto un’azione ({x})", "{a} fez uma ação ({x})"],
["Maintenance mode on", "Mode maintenance activé", "Modo mantenimiento activado", "Wartungsmodus an", "Modalità manutenzione attiva", "Modo de manutenção ligado"],
["Maintenance mode off", "Mode maintenance désactivé", "Modo mantenimiento desactivado", "Wartungsmodus aus", "Modalità manutenzione disattivata", "Modo de manutenção desligado"],
["Announcement: {b}", "Annonce : {b}", "Aviso: {b}", "Ankündigung: {b}", "Annuncio: {b}", "Aviso: {b}"],
["Announcement removed", "Annonce retirée", "Aviso quitado", "Ankündigung entfernt", "Annuncio rimosso", "Aviso removido"],
["Turned off: {g}", "Désactivés : {g}", "Desactivados: {g}", "Ausgeschaltet: {g}", "Disattivati: {g}", "Desligados: {g}"],
["Turned back on: {g}", "Réactivés : {g}", "Reactivados: {g}", "Wieder eingeschaltet: {g}", "Riattivati: {g}", "Religados: {g}"],
["Messages updated", "Messages mis à jour", "Mensajes actualizados", "Texte aktualisiert", "Messaggi aggiornati", "Mensagens atualizadas"],
["An admin", "Un admin", "Un admin", "Ein Admin", "Un admin", "Um admin"],
["a deleted account", "un compte supprimé", "una cuenta eliminada", "ein gelöschtes Konto", "un account eliminato", "uma conta eliminada"],
["Reason: {r}", "Raison : {r}", "Motivo: {r}", "Grund: {r}", "Motivo: {r}", "Motivo: {r}"],
["Was @{u}", "Avant : @{u}", "Antes: @{u}", "Vorher: @{u}", "Prima: @{u}", "Antes: @{u}"],
["Admin log", "Journal des admins", "Registro de admins", "Admin-Protokoll", "Registro admin", "Registo dos admins"],
["Every change made by an admin, newest first.", "Chaque changement fait par un admin, du plus récent au plus ancien.", "Cada cambio hecho por un admin, del más reciente al más antiguo.", "Jede Änderung durch einen Admin, die neueste zuerst.", "Ogni modifica fatta da un admin, dalla più recente.", "Cada alteração feita por um admin, da mais recente para a mais antiga."],
["Nothing here yet.", "Rien pour l’instant.", "Aún no hay nada.", "Noch nichts da.", "Ancora niente qui.", "Ainda não há nada."],
["Show more", "Afficher plus", "Mostrar más", "Mehr anzeigen", "Mostra altro", "Mostrar mais"],
["No admin changes for this player yet.", "Aucun changement d’admin pour ce joueur pour l’instant.", "Aún no hay cambios de admins para este jugador.", "Noch keine Admin-Änderungen für diesen Spieler.", "Ancora nessuna modifica admin per questo giocatore.", "Ainda não há alterações de admins para este jogador."],
["Maintenance mode", "Mode maintenance", "Modo mantenimiento", "Wartungsmodus", "Modalità manutenzione", "Modo de manutenção"],
["Players see a maintenance page. Admins can still use the site.", "Les joueurs voient une page de maintenance. Les admins peuvent toujours utiliser le site.", "Los jugadores ven una página de mantenimiento. Los admins pueden seguir usando el sitio.", "Spieler sehen eine Wartungsseite. Admins können die Seite weiter nutzen.", "I giocatori vedono una pagina di manutenzione. Gli admin possono ancora usare il sito.", "Os jogadores veem uma página de manutenção. Os admins podem continuar a usar o site."],
["Message on the maintenance page (optional)", "Message sur la page de maintenance (facultatif)", "Mensaje en la página de mantenimiento (opcional)", "Text auf der Wartungsseite (optional)", "Messaggio nella pagina di manutenzione (facoltativo)", "Mensagem na página de manutenção (opcional)"],
["Announcement banner", "Bannière d’annonce", "Banner de aviso", "Ankündigungsbanner", "Banner degli annunci", "Faixa de aviso"],
["Shown at the top of the site for everyone. Leave it empty to hide it.", "Affichée en haut du site pour tout le monde. Laisse vide pour la masquer.", "Se muestra arriba del sitio para todos. Déjalo vacío para ocultarlo.", "Wird für alle oben auf der Seite angezeigt. Leer lassen, um es auszublenden.", "Mostrato in cima al sito per tutti. Lascialo vuoto per nasconderlo.", "Aparece no topo do site para todos. Deixa vazio para o ocultar."],
["Style", "Style", "Estilo", "Stil", "Stile", "Estilo"],
["Info", "Info", "Info", "Info", "Info", "Info"],
["Warning", "Avertissement", "Advertencia", "Warnung", "Avviso", "Aviso"],
["Ends (optional)", "Fin (facultatif)", "Termina (opcional)", "Endet (optional)", "Fine (facoltativo)", "Termina (opcional)"],
["Turned off games", "Jeux désactivés", "Juegos desactivados", "Ausgeschaltete Spiele", "Giochi disattivati", "Jogos desligados"],
["These games show as temporarily unavailable and cannot be started.", "Ces jeux s’affichent comme temporairement indisponibles et ne peuvent pas être lancés.", "Estos juegos aparecen como no disponibles temporalmente y no se pueden iniciar.", "Diese Spiele werden als vorübergehend nicht verfügbar angezeigt und lassen sich nicht starten.", "Questi giochi appaiono come temporaneamente non disponibili e non si possono avviare.", "Estes jogos aparecem como temporariamente indisponíveis e não podem ser iniciados."],
["Message for turned off games (optional)", "Message pour les jeux désactivés (facultatif)", "Mensaje para los juegos desactivados (opcional)", "Text für ausgeschaltete Spiele (optional)", "Messaggio per i giochi disattivati (facoltativo)", "Mensagem para os jogos desligados (opcional)"],
["Save and publish", "Enregistrer et publier", "Guardar y publicar", "Speichern und veröffentlichen", "Salva e pubblica", "Guardar e publicar"],
["Saved. Every open tab updates right away.", "Enregistré. Tous les onglets ouverts se mettent à jour tout de suite.", "Guardado. Todas las pestañas abiertas se actualizan al instante.", "Gespeichert. Alle offenen Tabs werden sofort aktualisiert.", "Salvato. Tutte le schede aperte si aggiornano subito.", "Guardado. Todos os separadores abertos atualizam-se logo."],
["A party starts and your invite goes out with the code.", "Une partie en groupe démarre et ton invitation part avec le code.", "Se crea una partida en grupo y tu invitación sale con el código.", "Eine Party startet und deine Einladung geht mit dem Code raus.", "Parte un party e il tuo invito viene inviato con il codice.", "Uma party começa e o teu convite sai com o código."],
["Add friends", "Ajouter des amis", "Añadir amigos", "Freunde hinzufügen", "Aggiungi amici", "Adicionar amigos"],
["Add friends to chat and play together.", "Ajoute des amis pour discuter et jouer ensemble.", "Añade amigos para chatear y jugar juntos.", "Füge Freunde hinzu, um zu chatten und zusammen zu spielen.", "Aggiungi amici per chattare e giocare insieme.", "Adiciona amigos para conversar e jogar juntos."],
["All time", "Depuis le début", "Desde siempre", "Gesamt", "Da sempre", "Desde sempre"],
["Asked to join · {g}", "A demandé à rejoindre · {g}", "Pidió unirse · {g}", "Möchte beitreten · {g}", "Ha chiesto di unirsi · {g}", "Pediu para entrar · {g}"],
["Asked {u} to let you in. You join as soon as they accept.", "Demande envoyée à {u}. Tu rejoins dès que la personne accepte.", "Le pediste a {u} que te deje entrar. Te unirás en cuanto acepte.", "{u} wurde gefragt, dich reinzulassen. Du trittst bei, sobald angenommen wird.", "Hai chiesto a {u} di farti entrare. Entri appena accetta.", "Pediste a {u} para te deixar entrar. Entras assim que aceitar."],
["Away", "Absent", "Ausente", "Abwesend", "Assente", "Ausente"],
["Away · {g}", "Absent · {g}", "Ausente · {g}", "Abwesend · {g}", "Assente · {g}", "Ausente · {g}"],
["Back to chats", "Retour aux discussions", "Volver a los chats", "Zurück zu den Chats", "Torna alle chat", "Voltar às conversas"],
["Chat with {u}", "Discuter avec {u}", "Chatear con {u}", "Mit {u} chatten", "Chatta con {u}", "Conversar com {u}"],
["Chats", "Discussions", "Chats", "Chats", "Chat", "Conversas"],
["Choose a game", "Choisir un jeu", "Elige un juego", "Spiel auswählen", "Scegli un gioco", "Escolhe um jogo"],
["Close player card", "Fermer la fiche joueur", "Cerrar ficha del jugador", "Spielerkarte schließen", "Chiudi scheda giocatore", "Fechar ficha do jogador"],
["Could not send the invite to {u}. Try again.", "Impossible d’envoyer l’invitation à {u}. Réessaie.", "No se pudo enviar la invitación a {u}. Inténtalo de nuevo.", "Die Einladung an {u} konnte nicht gesendet werden. Versuch es erneut.", "Impossibile inviare l’invito a {u}. Riprova.", "Não foi possível enviar o convite a {u}. Tenta de novo."],
["Daily average", "Moyenne par jour", "Media diaria", "Tagesdurchschnitt", "Media giornaliera", "Média diária"],
["Danger zone", "Zone dangereuse", "Zona de peligro", "Gefahrenzone", "Zona pericolosa", "Zona de perigo"],
["Delete ticket", "Supprimer le ticket", "Eliminar ticket", "Ticket löschen", "Elimina ticket", "Eliminar ticket"],
["Find friends", "Trouver des amis", "Buscar amigos", "Freunde finden", "Trova amici", "Encontrar amigos"],
["In a party · {g}", "En groupe · {g}", "En grupo · {g}", "In einer Party · {g}", "In un party · {g}", "Numa party · {g}"],
["Invite sent to {u}. They join with code {c}.", "Invitation envoyée à {u}. Code pour rejoindre : {c}.", "Invitación enviada a {u}. Se une con el código {c}.", "Einladung an {u} gesendet. Beitritt mit Code {c}.", "Invito inviato a {u}. Entra con il codice {c}.", "Convite enviado a {u}. Entra com o código {c}."],
["Invite to play…", "Inviter à jouer…", "Invitar a jugar…", "Zum Spielen einladen…", "Invita a giocare…", "Convidar para jogar…"],
["Invite to {g}", "Inviter sur {g}", "Invitar a {g}", "Zu {g} einladen", "Invita a {g}", "Convidar para {g}"],
["Join party · {g}", "Rejoindre le groupe · {g}", "Unirse al grupo · {g}", "Party beitreten · {g}", "Entra nel party · {g}", "Entrar na party · {g}"],
["Last {n} days", "{n} derniers jours", "Últimos {n} días", "Letzte {n} Tage", "Ultimi {n} giorni", "Últimos {n} dias"],
["Minimize chat", "Réduire la discussion", "Minimizar chat", "Chat minimieren", "Riduci chat", "Minimizar conversa"],
["New messages", "Nouveaux messages", "Mensajes nuevos", "Neue Nachrichten", "Nuovi messaggi", "Novas mensagens"],
["No data", "Aucune donnée", "Sin datos", "Keine Daten", "Nessun dato", "Sem dados"],
["No friend matches “{q}”.", "Aucun ami ne correspond à « {q} ».", "Ningún amigo coincide con «{q}».", "Kein Freund passt zu „{q}“.", "Nessun amico corrisponde a «{q}».", "Nenhum amigo corresponde a «{q}»."],
["No games match.", "Aucun jeu ne correspond.", "Ningún juego coincide.", "Kein Spiel passt.", "Nessun gioco corrisponde.", "Nenhum jogo corresponde."],
["Open game", "Ouvrir le jeu", "Abrir juego", "Spiel öffnen", "Apri gioco", "Abrir jogo"],
["Other games", "Autres jeux", "Otros juegos", "Andere Spiele", "Altri giochi", "Outros jogos"],
["Party invite · {g}", "Invitation de groupe · {g}", "Invitación de grupo · {g}", "Party-Einladung · {g}", "Invito al party · {g}", "Convite para party · {g}"],
["Play with {u}", "Jouer avec {u}", "Jugar con {u}", "Mit {u} spielen", "Gioca con {u}", "Jogar com {u}"],
["Request sent. {u} gets a notification and can start a party for you.", "Demande envoyée. {u} reçoit une notification et peut lancer un groupe pour toi.", "Solicitud enviada. {u} recibe un aviso y puede crear un grupo para ti.", "Anfrage gesendet. {u} bekommt eine Benachrichtigung und kann eine Party für dich starten.", "Richiesta inviata. {u} riceve una notifica e può avviare un party per te.", "Pedido enviado. {u} recebe uma notificação e pode começar uma party para ti."],
["Search friends", "Rechercher des amis", "Buscar amigos", "Freunde suchen", "Cerca amici", "Pesquisar amigos"],
["Seen", "Vu", "Visto", "Gesehen", "Visto", "Visto"],
["Share of playtime", "Part du temps de jeu", "Reparto del tiempo de juego", "Anteil an der Spielzeit", "Quota del tempo di gioco", "Parte do tempo de jogo"],
["Show all games", "Afficher tous les jeux", "Mostrar todos los juegos", "Alle Spiele anzeigen", "Mostra tutti i giochi", "Mostrar todos os jogos"],
["Starting a {g} party. Your invite goes out as soon as it is ready.", "Lancement d’un groupe sur {g}. Ton invitation part dès qu’il est prêt.", "Creando un grupo de {g}. Tu invitación sale en cuanto esté listo.", "Eine {g}-Party wird gestartet. Deine Einladung geht raus, sobald sie bereit ist.", "Avvio di un party di {g}. Il tuo invito parte appena è pronto.", "A começar uma party de {g}. O teu convite sai assim que estiver pronta."],
["The party did not start, so the invite was not sent. Try again.", "Le groupe n’a pas démarré, l’invitation n’a donc pas été envoyée. Réessaie.", "El grupo no se inició, así que la invitación no se envió. Inténtalo de nuevo.", "Die Party ist nicht gestartet, daher wurde die Einladung nicht gesendet. Versuch es erneut.", "Il party non è partito, quindi l’invito non è stato inviato. Riprova.", "A party não começou, por isso o convite não foi enviado. Tenta de novo."],
["Ticket deleted.", "Ticket supprimé.", "Ticket eliminado.", "Ticket gelöscht.", "Ticket eliminato.", "Ticket eliminado."],
["Time range", "Période", "Periodo", "Zeitraum", "Periodo", "Período"],
["Top players", "Meilleurs joueurs", "Mejores jugadores", "Top-Spieler", "Migliori giocatori", "Melhores jogadores"],
["Trends", "Tendances", "Tendencias", "Trends", "Tendenze", "Tendências"],
["You: {m}", "Toi : {m}", "Tú: {m}", "Du: {m}", "Tu: {m}", "Tu: {m}"],
["typing…", "écrit…", "escribiendo…", "schreibt…", "sta scrivendo…", "a escrever…"],
["{g} has no online mode. Invite {u} to a game that does.", "{g} n’a pas de mode en ligne. Invite {u} sur un jeu qui en a un.", "{g} no tiene modo en línea. Invita a {u} a un juego que lo tenga.", "{g} hat keinen Online-Modus. Lade {u} zu einem Spiel mit Online-Modus ein.", "{g} non ha la modalità online. Invita {u} a un gioco che ce l’ha.", "{g} não tem modo online. Convida {u} para um jogo que tenha."],
["{n} days", "{n} jours", "{n} días", "{n} Tage", "{n} giorni", "{n} dias"],
["{n} friends online", "{n} amis en ligne", "{n} amigos en línea", "{n} Freunde online", "{n} amici online", "{n} amigos online"],
["{n} in the last 7 days", "{n} ces 7 derniers jours", "{n} en los últimos 7 días", "{n} in den letzten 7 Tagen", "{n} negli ultimi 7 giorni", "{n} nos últimos 7 dias"],
["{n} in the last {d} days", "{n} ces {d} derniers jours", "{n} en los últimos {d} días", "{n} in den letzten {d} Tagen", "{n} negli ultimi {d} giorni", "{n} nos últimos {d} dias"],
["{n} launches", "{n} lancements", "{n} inicios", "{n} Starts", "{n} avvii", "{n} inícios"],
["{n} online", "{n} en ligne", "{n} en línea", "{n} online", "{n} online", "{n} online"],
["{n} sessions", "{n} sessions", "{n} sesiones", "{n} Sitzungen", "{n} sessioni", "{n} sessões"],
["{n} unread", "{n} non lus", "{n} sin leer", "{n} ungelesen", "{n} non letti", "{n} por ler"],
["{u} is joining your party", "{u} rejoint ton groupe", "{u} se está uniendo a tu grupo", "{u} tritt deiner Party bei", "{u} sta entrando nel tuo party", "{u} está a entrar na tua party"],
["{u} is not in a game right now. Invite them instead.", "{u} n’est pas en jeu en ce moment. Invite-le plutôt.", "{u} no está jugando ahora. Mejor invítale.", "{u} spielt gerade nicht. Lade stattdessen ein.", "{u} non è in gioco ora. Invitalo invece.", "{u} não está a jogar agora. Convida em vez disso."],
["{u} is offline. You can still send an invite.", "{u} est hors ligne. Tu peux quand même envoyer une invitation.", "{u} está desconectado. Aún puedes enviar una invitación.", "{u} ist offline. Du kannst trotzdem eine Einladung senden.", "{u} è offline. Puoi comunque inviare un invito.", "{u} está offline. Ainda podes enviar um convite."],
["{u} is typing…", "{u} écrit…", "{u} está escribiendo…", "{u} schreibt…", "{u} sta scrivendo…", "{u} está a escrever…"],
["{u} let you in. Joining the party…", "{u} t’a accepté. Connexion au groupe…", "{u} te dejó entrar. Uniéndote al grupo…", "{u} hat dich reingelassen. Party wird betreten…", "{u} ti ha fatto entrare. Ingresso nel party…", "{u} deixou-te entrar. A entrar na party…"],
["Last seen", "Vu pour la dernière fois", "Última vez visto", "Zuletzt gesehen", "Ultimo accesso", "Visto pela última vez"],
["Desktop", "Ordinateur", "Ordenador", "Computer", "Computer", "Computador"],
["Phone", "Téléphone", "Teléfono", "Telefon", "Telefono", "Telemóvel"],
["Tablet", "Tablette", "Tableta", "Tablet", "Tablet", "Tablet"],
["Unknown", "Inconnu", "Desconocido", "Unbekannt", "Sconosciuto", "Desconhecido"],
["Highest", "Maximum", "Máximo", "Höchstwert", "Massimo", "Máximo"],
["Errors", "Erreurs", "Errores", "Fehler", "Errori", "Erros"],
["Last launch", "Dernier lancement", "Último inicio", "Letzter Start", "Ultimo avvio", "Último início"],
["Active players", "Joueurs actifs", "Jugadores activos", "Aktive Spieler", "Giocatori attivi", "Jogadores ativos"],
["Peak online per day", "Pic en ligne par jour", "Pico en línea por día", "Online-Spitze pro Tag", "Picco online al giorno", "Pico online por dia"],
["Peak online", "Pic en ligne", "Pico en línea", "Online-Spitze", "Picco online", "Pico online"],
["Most people online at the same time", "Le plus de personnes en ligne en même temps", "Máximo de personas en línea a la vez", "Die meisten gleichzeitig online", "Massimo di persone online contemporaneamente", "Mais pessoas online ao mesmo tempo"],
["Sessions per day", "Sessions par jour", "Sesiones por día", "Sitzungen pro Tag", "Sessioni al giorno", "Sessões por dia"],
["Sessions", "Sessions", "Sesiones", "Sitzungen", "Sessioni", "Sessões"],
["Peak online starts recording while an admin has this page open", "Le pic en ligne s’enregistre tant qu’un admin a cette page ouverte", "El pico en línea se registra mientras un admin tenga esta página abierta", "Die Online-Spitze wird erfasst, solange ein Admin diese Seite offen hat", "Il picco online viene registrato mentre un admin ha questa pagina aperta", "O pico online é registado enquanto um admin tiver esta página aberta"],
["New accounts", "Nouveaux comptes", "Cuentas nuevas", "Neue Konten", "Nuovi account", "Novas contas"],
["Game launches per day", "Lancements de jeux par jour", "Inicios de juegos por día", "Spielstarts pro Tag", "Avvii di giochi al giorno", "Inícios de jogos por dia"],
["Game launches", "Lancements de jeux", "Inicios de juegos", "Spielstarts", "Avvii di giochi", "Inícios de jogos"],
["1 friend request", "1 demande d’ami", "1 solicitud de amistad", "1 Freundschaftsanfrage", "1 richiesta di amicizia", "1 pedido de amizade"],
["{n} friend requests", "{n} demandes d’ami", "{n} solicitudes de amistad", "{n} Freundschaftsanfragen", "{n} richieste di amicizia", "{n} pedidos de amizade"],
["1 friend", "1 ami", "1 amigo", "1 Freund", "1 amico", "1 amigo"],
["{n} friends", "{n} amis", "{n} amigos", "{n} Freunde", "{n} amici", "{n} amigos"],
["Device split", "Répartition par appareil", "Reparto por dispositivo", "Geräteverteilung", "Ripartizione per dispositivo", "Distribuição por dispositivo"],
["Online up to 2", "En ligne jusqu’à 2", "En línea hasta 2", "Online bis zu 2", "Online fino a 2", "Online até 2"],
["Solo · Online up to 2", "Solo · En ligne jusqu’à 2", "Solo · En línea hasta 2", "Solo · Online bis zu 2", "Solo · Online fino a 2", "Solo · Online até 2"],
["Online up to 3", "En ligne jusqu’à 3", "En línea hasta 3", "Online bis zu 3", "Online fino a 3", "Online até 3"],
["Solo · Online up to 3", "Solo · En ligne jusqu’à 3", "Solo · En línea hasta 3", "Solo · Online bis zu 3", "Solo · Online fino a 3", "Solo · Online até 3"],
["Online up to 4", "En ligne jusqu’à 4", "En línea hasta 4", "Online bis zu 4", "Online fino a 4", "Online até 4"],
["Solo · Online up to 4", "Solo · En ligne jusqu’à 4", "Solo · En línea hasta 4", "Solo · Online bis zu 4", "Solo · Online fino a 4", "Solo · Online até 4"],
["Online up to 5", "En ligne jusqu’à 5", "En línea hasta 5", "Online bis zu 5", "Online fino a 5", "Online até 5"],
["Solo · Online up to 5", "Solo · En ligne jusqu’à 5", "Solo · En línea hasta 5", "Solo · Online bis zu 5", "Solo · Online fino a 5", "Solo · Online até 5"],
["Online up to 6", "En ligne jusqu’à 6", "En línea hasta 6", "Online bis zu 6", "Online fino a 6", "Online até 6"],
["Solo · Online up to 6", "Solo · En ligne jusqu’à 6", "Solo · En línea hasta 6", "Solo · Online bis zu 6", "Solo · Online fino a 6", "Solo · Online até 6"],
["Online up to 7", "En ligne jusqu’à 7", "En línea hasta 7", "Online bis zu 7", "Online fino a 7", "Online até 7"],
["Solo · Online up to 7", "Solo · En ligne jusqu’à 7", "Solo · En línea hasta 7", "Solo · Online bis zu 7", "Solo · Online fino a 7", "Solo · Online até 7"],
["Online up to 8", "En ligne jusqu’à 8", "En línea hasta 8", "Online bis zu 8", "Online fino a 8", "Online até 8"],
["Solo · Online up to 8", "Solo · En ligne jusqu’à 8", "Solo · En línea hasta 8", "Solo · Online bis zu 8", "Solo · Online fino a 8", "Solo · Online até 8"],
["Online up to 9", "En ligne jusqu’à 9", "En línea hasta 9", "Online bis zu 9", "Online fino a 9", "Online até 9"],
["Solo · Online up to 9", "Solo · En ligne jusqu’à 9", "Solo · En línea hasta 9", "Solo · Online bis zu 9", "Solo · Online fino a 9", "Solo · Online até 9"],
["Online up to 10", "En ligne jusqu’à 10", "En línea hasta 10", "Online bis zu 10", "Online fino a 10", "Online até 10"],
["Solo · Online up to 10", "Solo · En ligne jusqu’à 10", "Solo · En línea hasta 10", "Solo · Online bis zu 10", "Solo · Online fino a 10", "Solo · Online até 10"],
["Online up to 11", "En ligne jusqu’à 11", "En línea hasta 11", "Online bis zu 11", "Online fino a 11", "Online até 11"],
["Solo · Online up to 11", "Solo · En ligne jusqu’à 11", "Solo · En línea hasta 11", "Solo · Online bis zu 11", "Solo · Online fino a 11", "Solo · Online até 11"],
["Online up to 12", "En ligne jusqu’à 12", "En línea hasta 12", "Online bis zu 12", "Online fino a 12", "Online até 12"],
["Solo · Online up to 12", "Solo · En ligne jusqu’à 12", "Solo · En línea hasta 12", "Solo · Online bis zu 12", "Solo · Online fino a 12", "Solo · Online até 12"],
["gameplay home", "Accueil gameplay", "Inicio de gameplay", "gameplay-Startseite", "Home di gameplay", "Início do gameplay"],
["Friends", "Amis", "Amigos", "Freunde", "Amici", "Amigos"],
["Settings", "Paramètres", "Ajustes", "Einstellungen", "Impostazioni", "Configurações"],
["Your account", "Votre compte", "Tu cuenta", "Dein Konto", "Il tuo account", "Sua conta"],
["Profile", "Profil", "Perfil", "Profil", "Profilo", "Perfil"],
["Stats", "Statistiques", "Estadísticas", "Statistiken", "Statistiche", "Estatísticas"],
["Sign in", "Se connecter", "Iniciar sesión", "Anmelden", "Accedi", "Entrar"],
["Sign out", "Se déconnecter", "Cerrar sesión", "Abmelden", "Esci", "Sair"],
["All settings", "Tous les paramètres", "Todos los ajustes", "Alle Einstellungen", "Tutte le impostazioni", "Todas as configurações"],
["Theme", "Thème", "Tema", "Design", "Tema", "Tema"],
["Auto", "Auto", "Auto", "Auto", "Auto", "Auto"],
["Light", "Clair", "Claro", "Hell", "Chiaro", "Claro"],
["Dark", "Sombre", "Oscuro", "Dunkel", "Scuro", "Escuro"],
["Language", "Langue", "Idioma", "Sprache", "Lingua", "Idioma"],
["Controls and shortcuts", "Commandes et raccourcis", "Controles y atajos", "Steuerung und Tastenkürzel", "Comandi e scorciatoie", "Controles e atalhos"],
["Sound effects", "Effets sonores", "Efectos de sonido", "Soundeffekte", "Effetti sonori", "Efeitos sonoros"],
["Terms and privacy", "Conditions et confidentialité", "Términos y privacidad", "AGB und Datenschutz", "Termini e privacy", "Termos e privacidade"],
["Help center", "Centre d’aide", "Centro de ayuda", "Hilfe-Center", "Centro assistenza", "Central de ajuda"],
["Games list", "Liste des jeux", "Lista de juegos", "Spieleliste", "Elenco dei giochi", "Lista de jogos"],
["Games", "Jeux", "Juegos", "Spiele", "Giochi", "Jogos"],
["Select a game", "Choisissez un jeu", "Elige un juego", "Wähle ein Spiel", "Scegli un gioco", "Escolha um jogo"],
["Continue playing", "Continuer à jouer", "Seguir jugando", "Weiterspielen", "Continua a giocare", "Continuar jogando"],
["All games", "Tous les jeux", "Todos los juegos", "Alle Spiele", "Tutti i giochi", "Todos os jogos"],
["Results", "Résultats", "Resultados", "Ergebnisse", "Risultati", "Resultados"],
["Search games", "Rechercher des jeux", "Buscar juegos", "Spiele suchen", "Cerca giochi", "Pesquisar jogos"],
["Filters", "Filtres", "Filtros", "Filter", "Filtri", "Filtros"],
["Clear all", "Tout effacer", "Borrar todo", "Alle löschen", "Cancella tutto", "Limpar tudo"],
["Show games", "Voir les jeux", "Ver juegos", "Spiele zeigen", "Mostra giochi", "Ver jogos"],
["Random game", "Jeu au hasard", "Juego aleatorio", "Zufälliges Spiel", "Gioco a caso", "Jogo aleatório"],
["No games match", "Aucun jeu ne correspond", "Ningún juego coincide", "Keine passenden Spiele", "Nessun gioco trovato", "Nenhum jogo encontrado"],
["Try a different word or remove a filter.", "Essayez un autre mot ou retirez un filtre.", "Prueba otra palabra o quita un filtro.", "Versuche ein anderes Wort oder entferne einen Filter.", "Prova un’altra parola o rimuovi un filtro.", "Tente outra palavra ou remova um filtro."],
["Clear filters", "Effacer les filtres", "Borrar filtros", "Filter löschen", "Cancella filtri", "Limpar filtros"],
["Reset sort", "Réinitialiser le tri", "Restablecer orden", "Sortierung zurücksetzen", "Ripristina ordinamento", "Redefinir ordem"],
["Sort by", "Trier par", "Ordenar por", "Sortieren nach", "Ordina per", "Ordenar por"],
["Genre", "Genre", "Género", "Genre", "Genere", "Gênero"],
["Players", "Joueurs", "Jugadores", "Spieler", "Giocatori", "Jogadores"],
["Look", "Style", "Estilo", "Grafik", "Grafica", "Visual"],
["Controls", "Commandes", "Controles", "Steuerung", "Comandi", "Controles"],
["Length", "Durée", "Duración", "Dauer", "Durata", "Duração"],
["Solo", "Solo", "Individual", "Solo", "Singolo", "Solo"],
["Online", "En ligne", "En línea", "Online", "Online", "Online"],
["Offline", "Hors ligne", "Desconectado", "Offline", "Offline", "Offline"],
["Keyboard", "Clavier", "Teclado", "Tastatur", "Tastiera", "Teclado"],
["Mouse or touch", "Souris ou tactile", "Ratón o táctil", "Maus oder Touch", "Mouse o touch", "Mouse ou toque"],
["Keyboard or touch", "Clavier ou tactile", "Teclado o táctil", "Tastatur oder Touch", "Tastiera o touch", "Teclado ou toque"],
["Quick", "Rapide", "Rápido", "Kurz", "Breve", "Rápido"],
["Medium", "Moyen", "Medio", "Mittel", "Media", "Médio"],
["Long", "Long", "Largo", "Lang", "Lunga", "Longo"],
["Best match", "Pertinence", "Más relevante", "Beste Treffer", "Più pertinenti", "Mais relevantes"],
["Popular", "Populaires", "Populares", "Beliebt", "Popolari", "Populares"],
["A to Z", "De A à Z", "De la A a la Z", "A bis Z", "Dalla A alla Z", "De A a Z"],
["Newest", "Nouveautés", "Más nuevos", "Neueste", "Più recenti", "Mais novos"],
["Most played", "Les plus joués", "Más jugados", "Meistgespielt", "Più giocati", "Mais jogados"],
["Shortest", "Les plus courts", "Más cortos", "Kürzeste", "Più brevi", "Mais curtos"],
["Action", "Action", "Acción", "Action", "Azione", "Ação"],
["Arcade", "Arcade", "Arcade", "Arcade", "Arcade", "Arcade"],
["Racing", "Course", "Carreras", "Rennen", "Corse", "Corrida"],
["Runner", "Course infinie", "Carrera infinita", "Endlos-Runner", "Corsa infinita", "Corrida infinita"],
["Puzzle", "Réflexion", "Puzles", "Puzzle", "Rompicapo", "Quebra-cabeça"],
["Sports", "Sport", "Deportes", "Sport", "Sport", "Esportes"],
["Board & Cards", "Plateau et cartes", "Mesa y cartas", "Brett & Karten", "Tavolo e carte", "Tabuleiro e cartas"],
["Board", "Plateau", "Mesa", "Brettspiele", "Tavolo", "Tabuleiro"],
["Brain", "Cerveau", "Mente", "Denksport", "Mente", "Mente"],
["Skill", "Adresse", "Habilidad", "Geschick", "Abilità", "Habilidade"],
["Strategy & Idle", "Stratégie et idle", "Estrategia e idle", "Strategie & Idle", "Strategia e idle", "Estratégia e idle"],
["Strategy", "Stratégie", "Estrategia", "Strategie", "Strategia", "Estratégia"],
["3D", "3D", "3D", "3D", "3D", "3D"],
["Back to all games", "Retour à tous les jeux", "Volver a todos los juegos", "Zurück zu allen Spielen", "Torna a tutti i giochi", "Voltar para todos os jogos"],
["Score", "Score", "Puntos", "Punkte", "Punti", "Pontos"],
["Best", "Record", "Récord", "Rekord", "Record", "Recorde"],
["Restart", "Recommencer", "Reiniciar", "Neustart", "Ricomincia", "Reiniciar"],
["Restart game", "Recommencer la partie", "Reiniciar la partida", "Spiel neu starten", "Ricomincia la partita", "Reiniciar o jogo"],
["Sound", "Son", "Sonido", "Ton", "Audio", "Som"],
["Toggle sound", "Activer ou couper le son", "Activar o silenciar el sonido", "Ton ein/aus", "Attiva o disattiva l’audio", "Ativar ou desativar o som"],
["Large view", "Grand format", "Vista grande", "Große Ansicht", "Vista grande", "Visão ampliada"],
["Toggle large view", "Activer ou désactiver le grand format", "Activar o desactivar la vista grande", "Große Ansicht ein/aus", "Attiva o disattiva la vista grande", "Ativar ou desativar a visão ampliada"],
["Fullscreen", "Plein écran", "Pantalla completa", "Vollbild", "Schermo intero", "Tela cheia"],
["Toggle fullscreen", "Activer ou quitter le plein écran", "Activar o salir de pantalla completa", "Vollbild ein/aus", "Attiva o esci dallo schermo intero", "Ativar ou sair da tela cheia"],
["Exit fullscreen", "Quitter le plein écran", "Salir de pantalla completa", "Vollbild beenden", "Esci dallo schermo intero", "Sair da tela cheia"],
["About", "À propos", "Acerca de", "Über", "Info", "Sobre"],
["More like this", "Dans le même genre", "Más como este", "Ähnliche Spiele", "Altri simili", "Mais como este"],
["Not played yet", "Pas encore joué", "Aún no jugado", "Noch nicht gespielt", "Non ancora giocato", "Ainda não jogado"],
["Back to games", "Retour aux jeux", "Volver a los juegos", "Zurück zu den Spielen", "Torna ai giochi", "Voltar aos jogos"],
["Legal documents", "Documents juridiques", "Documentos legales", "Rechtliche Dokumente", "Documenti legali", "Documentos legais"],
["Terms of Service", "Conditions d’utilisation", "Términos del servicio", "Nutzungsbedingungen", "Termini di servizio", "Termos de Serviço"],
["Terms of Use", "Conditions d’utilisation", "Términos de uso", "Nutzungsbedingungen", "Termini d’uso", "Termos de Uso"],
["Privacy Policy", "Politique de confidentialité", "Política de privacidad", "Datenschutzerklärung", "Politica sulla privacy", "Política de Privacidade"],
["Cookie Policy", "Politique relative aux cookies", "Política de cookies", "Cookie-Richtlinie", "Politica sui cookie", "Política de Cookies"],
["Terms", "Conditions", "Términos", "AGB", "Termini", "Termos"],
["Privacy", "Confidentialité", "Privacidad", "Datenschutz", "Privacy", "Privacidade"],
["Cookies", "Cookies", "Cookies", "Cookies", "Cookie", "Cookies"],
["Cookie settings", "Paramètres des cookies", "Configuración de cookies", "Cookie-Einstellungen", "Impostazioni dei cookie", "Configurações de cookies"],
["Fan-made remakes. Not affiliated with the original games or their publishers.", "Remakes faits par des fans. Sans lien avec les jeux originaux ni leurs éditeurs.", "Remakes hechos por fans. Sin relación con los juegos originales ni sus editores.", "Fan-Remakes. Nicht mit den Originalspielen oder ihren Publishern verbunden.", "Remake fatti dai fan. Non affiliati ai giochi originali né ai loro editori.", "Remakes feitos por fãs. Sem vínculo com os jogos originais ou suas editoras."],
["Back", "Retour", "Volver", "Zurück", "Indietro", "Voltar"],
["Search friends or type a username", "Cherchez un ami ou tapez un nom d’utilisateur", "Busca amigos o escribe un nombre de usuario", "Freunde suchen oder Benutzernamen eingeben", "Cerca amici o scrivi un nome utente", "Procure amigos ou digite um nome de usuário"],
["No friends yet", "Pas encore d’amis", "Aún no tienes amigos", "Noch keine Freunde", "Ancora nessun amico", "Nenhum amigo ainda"],
["Friend requests are coming soon.", "Les demandes d’ami arrivent bientôt.", "Las solicitudes de amistad llegarán pronto.", "Freundschaftsanfragen kommen bald.", "Le richieste di amicizia arriveranno presto.", "Os pedidos de amizade chegam em breve."],
["Records", "Records", "Récords", "Rekorde", "Record", "Recordes"],
["Friend ID", "ID d’ami", "ID de amigo", "Freundes-ID", "ID amico", "ID de amigo"],
["Coming soon", "Bientôt disponible", "Muy pronto", "Kommt bald", "In arrivo", "Em breve"],
["Coming soon.", "Bientôt disponible.", "Muy pronto.", "Kommt bald.", "In arrivo.", "Em breve."],
["Copy", "Copier", "Copiar", "Kopieren", "Copia", "Copiar"],
["Username", "Nom d’utilisateur", "Nombre de usuario", "Benutzername", "Nome utente", "Nome de usuário"],
["Change", "Modifier", "Cambiar", "Ändern", "Cambia", "Alterar"],
["Choose", "Choisir", "Elegir", "Wählen", "Scegli", "Escolher"],
["Display name", "Nom affiché", "Nombre visible", "Anzeigename", "Nome visualizzato", "Nome de exibição"],
["Save", "Enregistrer", "Guardar", "Speichern", "Salva", "Salvar"],
["Guest", "Invité", "Invitado", "Gast", "Ospite", "Convidado"],
["Playing as a guest", "Vous jouez en invité", "Juegas como invitado", "Du spielst als Gast", "Stai giocando come ospite", "Jogando como convidado"],
["No username yet", "Pas encore de nom d’utilisateur", "Aún sin nombre de usuario", "Noch kein Benutzername", "Nessun nome utente", "Ainda sem nome de usuário"],
["Enter a display name.", "Saisissez un nom affiché.", "Escribe un nombre visible.", "Gib einen Anzeigenamen ein.", "Inserisci un nome visualizzato.", "Digite um nome de exibição."],
["Display name saved.", "Nom affiché enregistré.", "Nombre visible guardado.", "Anzeigename gespeichert.", "Nome visualizzato salvato.", "Nome de exibição salvo."],
["Change username", "Modifier le nom d’utilisateur", "Cambiar nombre de usuario", "Benutzernamen ändern", "Cambia nome utente", "Alterar nome de usuário"],
["Choose a username", "Choisissez un nom d’utilisateur", "Elige un nombre de usuario", "Wähle einen Benutzernamen", "Scegli un nome utente", "Escolha um nome de usuário"],
["New username", "Nouveau nom d’utilisateur", "Nuevo nombre de usuario", "Neuer Benutzername", "Nuovo nome utente", "Novo nome de usuário"],
["Change your username from", "Changer votre nom d’utilisateur de", "¿Cambiar tu nombre de usuario de", "Benutzernamen ändern von", "Cambiare il nome utente da", "Alterar seu nome de usuário de"],
["to", "en", "a", "zu", "a", "para"],
["Cancel", "Annuler", "Cancelar", "Abbrechen", "Annulla", "Cancelar"],
["Continue", "Continuer", "Continuar", "Weiter", "Continua", "Continuar"],
["Are you sure?", "Vous êtes sûr ?", "¿Seguro?", "Bist du sicher?", "Sei sicuro?", "Tem certeza?"],
["Yes, change it", "Oui, le changer", "Sí, cambiarlo", "Ja, ändern", "Sì, cambialo", "Sim, alterar"],
["Use 3 to 20 letters, numbers, dots, dashes or underscores.", "Utilisez 3 à 20 lettres, chiffres, points, tirets ou tirets bas.", "Usa de 3 a 20 letras, números, puntos, guiones o guiones bajos.", "Verwende 3 bis 20 Buchstaben, Ziffern, Punkte, Bindestriche oder Unterstriche.", "Usa da 3 a 20 lettere, numeri, punti, trattini o trattini bassi.", "Use de 3 a 20 letras, números, pontos, hifens ou sublinhados."],
["That is already your username.", "C’est déjà votre nom d’utilisateur.", "Ese ya es tu nombre de usuario.", "Das ist bereits dein Benutzername.", "È già il tuo nome utente.", "Esse já é seu nome de usuário."],
["Username saved.", "Nom d’utilisateur enregistré.", "Nombre de usuario guardado.", "Benutzername gespeichert.", "Nome utente salvato.", "Nome de usuário salvo."],
["Username changed.", "Nom d’utilisateur modifié.", "Nombre de usuario cambiado.", "Benutzername geändert.", "Nome utente cambiato.", "Nome de usuário alterado."],
["Close", "Fermer", "Cerrar", "Schließen", "Chiudi", "Fechar"],
["Settings sections", "Sections des paramètres", "Secciones de ajustes", "Einstellungsbereiche", "Sezioni delle impostazioni", "Seções de configurações"],
["Account", "Compte", "Cuenta", "Konto", "Account", "Conta"],
["Appearance and language", "Apparence et langue", "Apariencia e idioma", "Darstellung und Sprache", "Aspetto e lingua", "Aparência e idioma"],
["Notifications", "Notifications", "Notificaciones", "Benachrichtigungen", "Notifiche", "Notificações"],
["Privacy and data", "Confidentialité et données", "Privacidad y datos", "Datenschutz und Daten", "Privacy e dati", "Privacidade e dados"],
["Help and legal", "Aide et mentions légales", "Ayuda e información legal", "Hilfe und Rechtliches", "Assistenza e note legali", "Ajuda e informações legais"],
["Edit profile", "Modifier le profil", "Editar perfil", "Profil bearbeiten", "Modifica profilo", "Editar perfil"],
["Signed in", "Connecté", "Sesión iniciada", "Angemeldet", "Accesso eseguito", "Conectado"],
["Sync", "Synchronisation", "Sincronización", "Synchronisierung", "Sincronizzazione", "Sincronização"],
["Your records and saves are kept in your account.", "Vos records et sauvegardes sont conservés dans votre compte.", "Tus récords y partidas guardadas se conservan en tu cuenta.", "Deine Rekorde und Spielstände werden in deinem Konto gespeichert.", "I tuoi record e salvataggi sono conservati nel tuo account.", "Seus recordes e jogos salvos ficam guardados na sua conta."],
["Sync now", "Synchroniser", "Sincronizar ahora", "Jetzt synchronisieren", "Sincronizza ora", "Sincronizar agora"],
["Syncing…", "Synchronisation…", "Sincronizando…", "Wird synchronisiert…", "Sincronizzazione…", "Sincronizando…"],
["Email and password", "E-mail et mot de passe", "Correo y contraseña", "E-Mail und Passwort", "Email e password", "E-mail e senha"],
["Email address", "Adresse e-mail", "Correo electrónico", "E-Mail-Adresse", "Indirizzo email", "Endereço de e-mail"],
["New password", "Nouveau mot de passe", "Nueva contraseña", "Neues Passwort", "Nuova password", "Nova senha"],
["Set a password", "Définir un mot de passe", "Crear una contraseña", "Passwort festlegen", "Imposta una password", "Definir uma senha"],
["At least 8 characters", "Au moins 8 caractères", "Al menos 8 caracteres", "Mindestens 8 Zeichen", "Almeno 8 caratteri", "Pelo menos 8 caracteres"],
["Optional. Keep your profile, records and saves on every device.", "Facultatif. Retrouvez votre profil, vos records et vos sauvegardes sur tous vos appareils.", "Opcional. Conserva tu perfil, récords y partidas en todos tus dispositivos.", "Optional. Behalte dein Profil, deine Rekorde und Spielstände auf allen Geräten.", "Facoltativo. Ritrova profilo, record e salvataggi su ogni dispositivo.", "Opcional. Mantenha seu perfil, recordes e jogos salvos em todos os dispositivos."],
["Google", "Google", "Google", "Google", "Google", "Google"],
["Use your Google account.", "Utilisez votre compte Google.", "Usa tu cuenta de Google.", "Nutze dein Google-Konto.", "Usa il tuo account Google.", "Use sua conta do Google."],
["Email", "E-mail", "Correo", "E-Mail", "Email", "E-mail"],
["Sign in or create an account with your email.", "Connectez-vous ou créez un compte avec votre e-mail.", "Inicia sesión o crea una cuenta con tu correo.", "Melde dich an oder erstelle ein Konto mit deiner E-Mail.", "Accedi o crea un account con la tua email.", "Entre ou crie uma conta com seu e-mail."],
["Use email", "Utiliser l’e-mail", "Usar correo", "E-Mail nutzen", "Usa l’email", "Usar e-mail"],
["This device", "Cet appareil", "Este dispositivo", "Dieses Gerät", "Questo dispositivo", "Este dispositivo"],
["Without an account your data stays in this browser.", "Sans compte, vos données restent dans ce navigateur.", "Sin cuenta, tus datos se quedan en este navegador.", "Ohne Konto bleiben deine Daten in diesem Browser.", "Senza account i tuoi dati restano in questo browser.", "Sem conta, seus dados ficam neste navegador."],
["Current", "Actuel", "Actual", "Aktuell", "Attuale", "Atual"],
["Keep your profile and records on every device.", "Retrouvez votre profil et vos records sur tous vos appareils.", "Conserva tu perfil y récords en todos tus dispositivos.", "Behalte dein Profil und deine Rekorde auf allen Geräten.", "Ritrova profilo e record su ogni dispositivo.", "Mantenha seu perfil e recordes em todos os dispositivos."],
["Connect", "Connecter", "Conectar", "Verbinden", "Collega", "Conectar"],
["Google sign-in", "La connexion Google", "El inicio de sesión con Google", "Google-Anmeldung", "L’accesso con Google", "O login com Google"],
["Your data is saved in this browser.", "Vos données sont enregistrées dans ce navigateur.", "Tus datos se guardan en este navegador.", "Deine Daten werden in diesem Browser gespeichert.", "I tuoi dati sono salvati in questo browser.", "Seus dados são salvos neste navegador."],
["Delete my data", "Supprimer mes données", "Borrar mis datos", "Meine Daten löschen", "Elimina i miei dati", "Excluir meus dados"],
["Removes your profile, records, saves and settings from this browser. Type DELETE to confirm.", "Supprime votre profil, vos records, vos sauvegardes et vos paramètres de ce navigateur. Tapez DELETE pour confirmer.", "Borra tu perfil, récords, partidas guardadas y ajustes de este navegador. Escribe DELETE para confirmar.", "Entfernt dein Profil, deine Rekorde, Spielstände und Einstellungen aus diesem Browser. Gib DELETE ein, um zu bestätigen.", "Rimuove profilo, record, salvataggi e impostazioni da questo browser. Scrivi DELETE per confermare.", "Remove seu perfil, recordes, jogos salvos e configurações deste navegador. Digite DELETE para confirmar."],
["Removes your profile, records, saves and settings from this browser.", "Supprime votre profil, vos records, vos sauvegardes et vos paramètres de ce navigateur.", "Borra tu perfil, récords, partidas guardadas y ajustes de este navegador.", "Entfernt dein Profil, deine Rekorde, Spielstände und Einstellungen aus diesem Browser.", "Rimuove profilo, record, salvataggi e impostazioni da questo browser.", "Remove seu perfil, recordes, jogos salvos e configurações deste navegador."],
["Type DELETE to confirm.", "Tapez DELETE pour confirmer.", "Escribe DELETE para confirmar.", "Gib DELETE ein, um zu bestätigen.", "Scrivi DELETE per confermare.", "Digite DELETE para confirmar."],
["Type DELETE to confirm", "Tapez DELETE pour confirmer", "Escribe DELETE para confirmar", "Gib DELETE ein, um zu bestätigen", "Scrivi DELETE per confermare", "Digite DELETE para confirmar"],
["Delete", "Supprimer", "Borrar", "Löschen", "Elimina", "Excluir"],
["Your data was deleted. Reloading…", "Vos données ont été supprimées. Rechargement…", "Tus datos se borraron. Recargando…", "Deine Daten wurden gelöscht. Wird neu geladen…", "I tuoi dati sono stati eliminati. Ricaricamento…", "Seus dados foram excluídos. Recarregando…"],
["Delete my account", "Supprimer mon compte", "Eliminar mi cuenta", "Mein Konto löschen", "Elimina il mio account", "Excluir minha conta"],
["Deletes your account, profile, records, saves and friends from our database. What is saved in this browser stays. Type DELETE to confirm.", "Supprime votre compte, votre profil, vos records, vos sauvegardes et vos amis de notre base de données. Ce qui est enregistré dans ce navigateur reste. Tapez DELETE pour confirmer.", "Elimina tu cuenta, perfil, récords, partidas guardadas y amigos de nuestra base de datos. Lo guardado en este navegador se queda. Escribe DELETE para confirmar.", "Löscht dein Konto, Profil, deine Rekorde, Spielstände und Freunde aus unserer Datenbank. Was in diesem Browser gespeichert ist, bleibt erhalten. Gib DELETE ein, um zu bestätigen.", "Elimina account, profilo, record, salvataggi e amici dal nostro database. Ciò che è salvato in questo browser resta. Scrivi DELETE per confermare.", "Exclui sua conta, perfil, recordes, jogos salvos e amigos do nosso banco de dados. O que está salvo neste navegador permanece. Digite DELETE para confirmar."],
["Deletes your account, profile, records, saves and friends from our database. What is saved in this browser stays.", "Supprime votre compte, votre profil, vos records, vos sauvegardes et vos amis de notre base de données. Ce qui est enregistré dans ce navigateur reste.", "Elimina tu cuenta, perfil, récords, partidas guardadas y amigos de nuestra base de datos. Lo guardado en este navegador se queda.", "Löscht dein Konto, Profil, deine Rekorde, Spielstände und Freunde aus unserer Datenbank. Was in diesem Browser gespeichert ist, bleibt erhalten.", "Elimina account, profilo, record, salvataggi e amici dal nostro database. Ciò che è salvato in questo browser resta.", "Exclui sua conta, perfil, recordes, jogos salvos e amigos do nosso banco de dados. O que está salvo neste navegador permanece."],
["Delete account", "Supprimer le compte", "Eliminar cuenta", "Konto löschen", "Elimina account", "Excluir conta"],
["Auto follows your device.", "Auto suit votre appareil.", "Auto sigue tu dispositivo.", "Auto folgt deinem Gerät.", "Auto segue il tuo dispositivo.", "Auto segue seu dispositivo."],
["Changes the text of the site right away.", "Change immédiatement la langue du site.", "Cambia el idioma del sitio al instante.", "Ändert die Sprache der Seite sofort.", "Cambia subito la lingua del sito.", "Muda o idioma do site na hora."],
["More languages are coming soon.", "D’autres langues arrivent bientôt.", "Pronto habrá más idiomas.", "Weitere Sprachen folgen bald.", "Altre lingue in arrivo.", "Mais idiomas em breve."],
["Reduce motion", "Réduire les animations", "Reducir animaciones", "Bewegung reduzieren", "Riduci animazioni", "Reduzir animações"],
["Turn off hover movement and transitions.", "Désactive les mouvements au survol et les transitions.", "Desactiva el movimiento al pasar el cursor y las transiciones.", "Schaltet Hover-Bewegungen und Übergänge aus.", "Disattiva i movimenti al passaggio del mouse e le transizioni.", "Desativa o movimento ao passar o mouse e as transições."],
["Show game thumbnails", "Afficher les vignettes des jeux", "Mostrar miniaturas de juegos", "Spielvorschaubilder anzeigen", "Mostra le miniature dei giochi", "Mostrar miniaturas dos jogos"],
["Hide them to load the page faster.", "Masquez-les pour charger la page plus vite.", "Ocúltalas para que la página cargue más rápido.", "Ausblenden, damit die Seite schneller lädt.", "Nascondile per caricare la pagina più in fretta.", "Oculte-as para carregar a página mais rápido."],
["Clicks, wins and game sounds.", "Clics, victoires et sons des jeux.", "Clics, victorias y sonidos de juego.", "Klicks, Siege und Spielgeräusche.", "Clic, vittorie e suoni dei giochi.", "Cliques, vitórias e sons dos jogos."],
["In the app", "Dans l’application", "En la aplicación", "In der App", "Nell’app", "No app"],
["Coming soon with accounts.", "Bientôt disponible avec les comptes.", "Llegará pronto con las cuentas.", "Kommt bald mit den Konten.", "In arrivo con gli account.", "Em breve com as contas."],
["Party invites", "Invitations de groupe", "Invitaciones de grupo", "Gruppeneinladungen", "Inviti al gruppo", "Convites de grupo"],
["When a friend invites you to play.", "Quand un ami vous invite à jouer.", "Cuando un amigo te invita a jugar.", "Wenn dich ein Freund zum Spielen einlädt.", "Quando un amico ti invita a giocare.", "Quando um amigo convida você para jogar."],
["Friend requests", "Demandes d’ami", "Solicitudes de amistad", "Freundschaftsanfragen", "Richieste di amicizia", "Pedidos de amizade"],
["When someone adds you.", "Quand quelqu’un vous ajoute.", "Cuando alguien te agrega.", "Wenn dich jemand hinzufügt.", "Quando qualcuno ti aggiunge.", "Quando alguém adiciona você."],
["Friends coming online", "Amis qui se connectent", "Amigos que se conectan", "Freunde kommen online", "Amici che si connettono", "Amigos ficando online"],
["Friends online", "Amis en ligne", "Amigos en línea", "Freunde online", "Amici online", "Amigos online"],
["Only for your favourite friends.", "Seulement pour vos amis favoris.", "Solo para tus amigos favoritos.", "Nur für deine Lieblingsfreunde.", "Solo per i tuoi amici preferiti.", "Só para seus amigos favoritos."],
["New games", "Nouveaux jeux", "Juegos nuevos", "Neue Spiele", "Nuovi giochi", "Jogos novos"],
["New games email", "E-mail des nouveaux jeux", "Correo de juegos nuevos", "E-Mail zu neuen Spielen", "Email sui nuovi giochi", "E-mail de jogos novos"],
["A short email when new games are added.", "Un court e-mail quand de nouveaux jeux arrivent.", "Un correo breve cuando se añaden juegos nuevos.", "Eine kurze E-Mail, wenn neue Spiele dazukommen.", "Una breve email quando arrivano nuovi giochi.", "Um e-mail curto quando novos jogos forem adicionados."],
["Weekly summary", "Résumé hebdomadaire", "Resumen semanal", "Wochenübersicht", "Riepilogo settimanale", "Resumo semanal"],
["Your playtime and records.", "Votre temps de jeu et vos records.", "Tu tiempo de juego y tus récords.", "Deine Spielzeit und Rekorde.", "Il tuo tempo di gioco e i tuoi record.", "Seu tempo de jogo e seus recordes."],
["Who can see and reach you", "Qui peut vous voir et vous contacter", "Quién puede verte y contactarte", "Wer dich sehen und erreichen kann", "Chi può vederti e contattarti", "Quem pode ver e contatar você"],
["Online status", "Statut en ligne", "Estado en línea", "Online-Status", "Stato online", "Status online"],
["Who can see when you are online.", "Qui peut voir quand vous êtes en ligne.", "Quién puede ver cuándo estás en línea.", "Wer sehen kann, wann du online bist.", "Chi può vedere quando sei online.", "Quem pode ver quando você está online."],
["Everyone", "Tout le monde", "Todos", "Alle", "Tutti", "Todos"],
["Nobody", "Personne", "Nadie", "Niemand", "Nessuno", "Ninguém"],
["Friends of friends", "Amis d’amis", "Amigos de amigos", "Freunde von Freunden", "Amici di amici", "Amigos de amigos"],
["Show what I am playing", "Montrer à quoi je joue", "Mostrar a qué estoy jugando", "Zeigen, was ich spiele", "Mostra a cosa sto giocando", "Mostrar o que estou jogando"],
["Show current game", "Montrer le jeu en cours", "Mostrar el juego actual", "Aktuelles Spiel zeigen", "Mostra il gioco attuale", "Mostrar o jogo atual"],
["Friends see your current game.", "Vos amis voient votre jeu en cours.", "Tus amigos ven tu juego actual.", "Freunde sehen dein aktuelles Spiel.", "Gli amici vedono il tuo gioco attuale.", "Seus amigos veem seu jogo atual."],
["Party invites from", "Invitations de groupe de", "Invitaciones de grupo de", "Gruppeneinladungen von", "Inviti al gruppo da", "Convites de grupo de"],
["Who can invite you to a party.", "Qui peut vous inviter dans un groupe.", "Quién puede invitarte a un grupo.", "Wer dich in eine Gruppe einladen kann.", "Chi può invitarti in un gruppo.", "Quem pode convidar você para um grupo."],
["Friend requests from", "Demandes d’ami de", "Solicitudes de amistad de", "Freundschaftsanfragen von", "Richieste di amicizia da", "Pedidos de amizade de"],
["Who can send you a request.", "Qui peut vous envoyer une demande.", "Quién puede enviarte una solicitud.", "Wer dir eine Anfrage senden kann.", "Chi può inviarti una richiesta.", "Quem pode enviar um pedido para você."],
["Your data", "Vos données", "Tus datos", "Deine Daten", "I tuoi dati", "Seus dados"],
["Download my data", "Télécharger mes données", "Descargar mis datos", "Meine Daten herunterladen", "Scarica i miei dati", "Baixar meus dados"],
["A file with your profile, records and settings.", "Un fichier avec votre profil, vos records et vos paramètres.", "Un archivo con tu perfil, récords y ajustes.", "Eine Datei mit deinem Profil, deinen Rekorden und Einstellungen.", "Un file con profilo, record e impostazioni.", "Um arquivo com seu perfil, recordes e configurações."],
["Download", "Télécharger", "Descargar", "Herunterladen", "Scarica", "Baixar"],
["Analytics cookies", "Cookies de mesure d’audience", "Cookies de análisis", "Analyse-Cookies", "Cookie di analisi", "Cookies de análise"],
["Help us see which games people play.", "Aidez-nous à voir à quels jeux les gens jouent.", "Ayúdanos a ver a qué juegos juega la gente.", "Hilf uns zu sehen, welche Spiele gespielt werden.", "Aiutaci a capire a quali giochi si gioca.", "Ajude-nos a ver quais jogos as pessoas jogam."],
["Change what this site may store.", "Choisissez ce que ce site peut enregistrer.", "Cambia lo que este sitio puede guardar.", "Ändere, was diese Seite speichern darf.", "Cambia ciò che questo sito può salvare.", "Altere o que este site pode armazenar."],
["Open", "Ouvrir", "Abrir", "Öffnen", "Apri", "Abrir"],
["Reset my records", "Réinitialiser mes records", "Restablecer mis récords", "Meine Rekorde zurücksetzen", "Azzera i miei record", "Redefinir meus recordes"],
["Clears best scores, play counts and saved games. This cannot be undone.", "Efface les meilleurs scores, le nombre de parties et les sauvegardes. Action irréversible.", "Borra las mejores puntuaciones, las partidas jugadas y las guardadas. No se puede deshacer.", "Löscht Bestwerte, Spielzähler und gespeicherte Spiele. Das lässt sich nicht rückgängig machen.", "Cancella i punteggi migliori, il numero di partite e i salvataggi. Non si può annullare.", "Apaga os melhores placares, a contagem de partidas e os jogos salvos. Não pode ser desfeito."],
["Clears best scores, play counts and saved games.", "Efface les meilleurs scores, le nombre de parties et les sauvegardes.", "Borra las mejores puntuaciones, las partidas jugadas y las guardadas.", "Löscht Bestwerte, Spielzähler und gespeicherte Spiele.", "Cancella i punteggi migliori, il numero di partite e i salvataggi.", "Apaga os melhores placares, a contagem de partidas e os jogos salvos."],
["This cannot be undone.", "Action irréversible.", "No se puede deshacer.", "Das lässt sich nicht rückgängig machen.", "Non si può annullare.", "Não pode ser desfeito."],
["Reset", "Réinitialiser", "Restablecer", "Zurücksetzen", "Azzera", "Redefinir"],
["Click again to confirm", "Cliquez à nouveau pour confirmer", "Haz clic de nuevo para confirmar", "Zum Bestätigen erneut klicken", "Clicca di nuovo per confermare", "Clique de novo para confirmar"],
["Resetting…", "Réinitialisation…", "Restableciendo…", "Wird zurückgesetzt…", "Azzeramento…", "Redefinindo…"],
["Your records were reset.", "Vos records ont été réinitialisés.", "Tus récords se restablecieron.", "Deine Rekorde wurden zurückgesetzt.", "I tuoi record sono stati azzerati.", "Seus recordes foram redefinidos."],
["Your records were reset on this device and in your account.", "Vos records ont été réinitialisés sur cet appareil et dans votre compte.", "Tus récords se restablecieron en este dispositivo y en tu cuenta.", "Deine Rekorde wurden auf diesem Gerät und in deinem Konto zurückgesetzt.", "I tuoi record sono stati azzerati su questo dispositivo e nel tuo account.", "Seus recordes foram redefinidos neste dispositivo e na sua conta."],
["Could not reset your account records. Check your connection and try again.", "Impossible de réinitialiser les records de votre compte. Vérifiez votre connexion et réessayez.", "No se pudieron restablecer los récords de tu cuenta. Revisa tu conexión e inténtalo de nuevo.", "Die Rekorde deines Kontos konnten nicht zurückgesetzt werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile azzerare i record del tuo account. Controlla la connessione e riprova.", "Não foi possível redefinir os recordes da sua conta. Verifique sua conexão e tente de novo."],
["Preparing your file…", "Préparation de votre fichier…", "Preparando tu archivo…", "Deine Datei wird vorbereitet…", "Preparazione del file…", "Preparando seu arquivo…"],
["Your data file was downloaded.", "Votre fichier de données a été téléchargé.", "Se descargó tu archivo de datos.", "Deine Datendatei wurde heruntergeladen.", "Il file dei tuoi dati è stato scaricato.", "Seu arquivo de dados foi baixado."],
["Could not download your account data. Try again later.", "Impossible de télécharger les données de votre compte. Réessayez plus tard.", "No se pudieron descargar los datos de tu cuenta. Inténtalo más tarde.", "Die Daten deines Kontos konnten nicht heruntergeladen werden. Versuche es später erneut.", "Impossibile scaricare i dati del tuo account. Riprova più tardi.", "Não foi possível baixar os dados da sua conta. Tente mais tarde."],
["Site", "Site", "Sitio", "Seite", "Sito", "Site"],
["Focus search", "Aller à la recherche", "Ir a la búsqueda", "Zur Suche springen", "Vai alla ricerca", "Ir para a pesquisa"],
["Close window or menu", "Fermer la fenêtre ou le menu", "Cerrar ventana o menú", "Fenster oder Menü schließen", "Chiudi finestra o menu", "Fechar janela ou menu"],
["In games", "Dans les jeux", "En los juegos", "In Spielen", "Nei giochi", "Nos jogos"],
["Move", "Se déplacer", "Moverse", "Bewegen", "Muoversi", "Mover"],
["or arrows", "ou flèches", "o flechas", "oder Pfeiltasten", "o frecce", "ou setas"],
["Pause", "Pause", "Pausa", "Pause", "Pausa", "Pausar"],
["Fullscreen and exit", "Plein écran et sortie", "Pantalla completa y salir", "Vollbild und Beenden", "Schermo intero e uscita", "Tela cheia e sair"],
["Documents", "Documents", "Documentos", "Dokumente", "Documenti", "Documentos"],
["Help", "Aide", "Ayuda", "Hilfe", "Assistenza", "Ajuda"],
["Contact support", "Contacter l’assistance", "Contactar con soporte", "Support kontaktieren", "Contatta l’assistenza", "Falar com o suporte"],
["Write to us", "Nous écrire", "Escríbenos", "Schreib uns", "Scrivici", "Fale conosco"],
["Support", "L’assistance", "El soporte", "Der Support", "L’assistenza", "O suporte"],
["Report a bug or a player", "Signaler un bug ou un joueur", "Reportar un error o a un jugador", "Fehler oder Spieler melden", "Segnala un bug o un giocatore", "Denunciar um bug ou um jogador"],
["Report", "Signaler", "Reportar", "Melden", "Segnala", "Denunciar"],
["Reports", "Les signalements", "Los reportes", "Meldungen", "Le segnalazioni", "As denúncias"],
["Sign out?", "Se déconnecter ?", "¿Cerrar sesión?", "Abmelden?", "Vuoi uscire?", "Sair?"],
["You can sign back in any time. Your records stay saved.", "Vous pouvez vous reconnecter à tout moment. Vos records restent enregistrés.", "Puedes volver a iniciar sesión cuando quieras. Tus récords siguen guardados.", "Du kannst dich jederzeit wieder anmelden. Deine Rekorde bleiben gespeichert.", "Puoi accedere di nuovo quando vuoi. I tuoi record restano salvati.", "Você pode entrar de novo quando quiser. Seus recordes continuam salvos."],
["Accounts are coming soon. You are playing as a guest.", "Les comptes arrivent bientôt. Vous jouez en invité.", "Las cuentas llegarán pronto. Juegas como invitado.", "Konten kommen bald. Du spielst als Gast.", "Gli account arriveranno presto. Stai giocando come ospite.", "As contas chegam em breve. Você está jogando como convidado."],
["Essential", "Essentiels", "Esenciales", "Notwendig", "Essenziali", "Essenciais"],
["Your records, saves, settings and this choice. Always on.", "Vos records, sauvegardes, paramètres et ce choix. Toujours actifs.", "Tus récords, partidas guardadas, ajustes y esta elección. Siempre activas.", "Deine Rekorde, Spielstände, Einstellungen und diese Auswahl. Immer aktiv.", "Record, salvataggi, impostazioni e questa scelta. Sempre attivi.", "Seus recordes, jogos salvos, configurações e esta escolha. Sempre ativos."],
["Analytics", "Mesure d’audience", "Análisis", "Analyse", "Analisi", "Análise"],
["Anonymous counts of which games are played and for how long.", "Statistiques anonymes des jeux joués et du temps passé.", "Recuento anónimo de qué juegos se juegan y durante cuánto tiempo.", "Anonyme Zählung, welche Spiele wie lange gespielt werden.", "Conteggi anonimi di quali giochi vengono giocati e per quanto tempo.", "Contagem anônima de quais jogos são jogados e por quanto tempo."],
["Reject non-essential", "Refuser le non essentiel", "Rechazar las no esenciales", "Nicht notwendige ablehnen", "Rifiuta i non essenziali", "Recusar os não essenciais"],
["We store your records and settings in this browser. With your OK we also count which games are played, anonymously.", "Nous enregistrons vos records et paramètres dans ce navigateur. Avec votre accord, nous comptons aussi anonymement les jeux joués.", "Guardamos tus récords y ajustes en este navegador. Con tu permiso también contamos de forma anónima qué juegos se juegan.", "Wir speichern deine Rekorde und Einstellungen in diesem Browser. Mit deiner Zustimmung zählen wir außerdem anonym, welche Spiele gespielt werden.", "Salviamo record e impostazioni in questo browser. Con il tuo consenso contiamo anche, in forma anonima, quali giochi vengono giocati.", "Guardamos seus recordes e configurações neste navegador. Com sua permissão, também contamos de forma anônima quais jogos são jogados."],
["Accept", "Accepter", "Aceptar", "Akzeptieren", "Accetta", "Aceitar"],
["Cookie choice saved", "Choix des cookies enregistré", "Preferencia de cookies guardada", "Cookie-Auswahl gespeichert", "Scelta sui cookie salvata", "Escolha de cookies salva"],
["That game is not available any more", "Ce jeu n’est plus disponible", "Ese juego ya no está disponible", "Dieses Spiel ist nicht mehr verfügbar", "Questo gioco non è più disponibile", "Esse jogo não está mais disponível"],
["Loading…", "Chargement…", "Cargando…", "Wird geladen…", "Caricamento…", "Carregando…"],
["Loading", "Chargement", "Cargando", "Wird geladen", "Caricamento", "Carregando"],
["Loading 3D…", "Chargement de la 3D…", "Cargando 3D…", "3D wird geladen…", "Caricamento 3D…", "Carregando 3D…"],
["Couldn’t load the game", "Impossible de charger le jeu", "No se pudo cargar el juego", "Das Spiel konnte nicht geladen werden", "Impossibile caricare il gioco", "Não foi possível carregar o jogo"],
["Check your connection and try again.", "Vérifiez votre connexion et réessayez.", "Revisa tu conexión e inténtalo de nuevo.", "Prüfe deine Verbindung und versuche es erneut.", "Controlla la connessione e riprova.", "Verifique sua conexão e tente de novo."],
["Retry", "Réessayer", "Reintentar", "Erneut versuchen", "Riprova", "Tentar de novo"],
["This game hit an error and could not start.", "Ce jeu a rencontré une erreur et n’a pas pu démarrer.", "Este juego tuvo un error y no pudo iniciarse.", "Dieses Spiel hatte einen Fehler und konnte nicht starten.", "Questo gioco ha avuto un errore e non è partito.", "Este jogo teve um erro e não pôde iniciar."],
["Connection needed", "Connexion requise", "Se necesita conexión", "Verbindung nötig", "Connessione necessaria", "Conexão necessária"],
["Couldn’t load 3D", "Impossible de charger la 3D", "No se pudo cargar el 3D", "3D konnte nicht geladen werden", "Impossibile caricare il 3D", "Não foi possível carregar o 3D"],
["The 3D engine is downloaded the first time you play a 3D game. Check your internet connection and try again.", "Le moteur 3D est téléchargé la première fois que vous jouez à un jeu 3D. Vérifiez votre connexion internet et réessayez.", "El motor 3D se descarga la primera vez que juegas a un juego 3D. Revisa tu conexión a internet e inténtalo de nuevo.", "Die 3D-Engine wird beim ersten 3D-Spiel heruntergeladen. Prüfe deine Internetverbindung und versuche es erneut.", "Il motore 3D viene scaricato la prima volta che giochi a un gioco 3D. Controlla la connessione a internet e riprova.", "O motor 3D é baixado na primeira vez que você joga um jogo 3D. Verifique sua conexão com a internet e tente de novo."],
["Games played", "Parties jouées", "Partidas jugadas", "Gespielte Partien", "Partite giocate", "Partidas jogadas"],
["Time played", "Temps de jeu", "Tiempo jugado", "Spielzeit", "Tempo di gioco", "Tempo jogado"],
["Days played", "Jours de jeu", "Días jugados", "Spieltage", "Giorni di gioco", "Dias jogados"],
["Playtime this week", "Temps de jeu cette semaine", "Tiempo de juego esta semana", "Spielzeit diese Woche", "Tempo di gioco questa settimana", "Tempo de jogo nesta semana"],
["No games played yet", "Aucun jeu joué pour l’instant", "Aún no has jugado", "Noch keine Spiele gespielt", "Nessun gioco ancora", "Nenhum jogo jogado ainda"],
["Personal records", "Records personnels", "Récords personales", "Persönliche Rekorde", "Record personali", "Recordes pessoais"],
["Game", "Jeu", "Juego", "Spiel", "Gioco", "Jogo"],
["Played", "Parties", "Partidas", "Gespielt", "Partite", "Partidas"],
["Last", "Dernière", "Última", "Zuletzt", "Ultima", "Última"],
["No records yet", "Pas encore de records", "Aún no hay récords", "Noch keine Rekorde", "Ancora nessun record", "Nenhum recorde ainda"],
["Today", "Aujourd’hui", "Hoy", "Heute", "Oggi", "Hoje"],
["Yesterday", "Hier", "Ayer", "Gestern", "Ieri", "Ontem"],
["Last week", "La semaine dernière", "La semana pasada", "Letzte Woche", "La settimana scorsa", "Semana passada"],
["Sun", "dim.", "dom", "So", "dom", "dom"],
["Mon", "lun.", "lun", "Mo", "lun", "seg"],
["Tue", "mar.", "mar", "Di", "mar", "ter"],
["Wed", "mer.", "mié", "Mi", "mer", "qua"],
["Thu", "jeu.", "jue", "Do", "gio", "qui"],
["Fri", "ven.", "vie", "Fr", "ven", "sex"],
["Sat", "sam.", "sáb", "Sa", "sab", "sáb"],
["Stages", "Étapes", "Etapas", "Etappen", "Tappe", "Etapas"],
["Levels", "Niveaux", "Niveles", "Level", "Livelli", "Níveis"],
["Time", "Temps", "Tiempo", "Zeit", "Tempo", "Tempo"],
["Moves", "Coups", "Movimientos", "Züge", "Mosse", "Jogadas"],
["Wins", "Victoires", "Victorias", "Siege", "Vittorie", "Vitórias"],
["Streak", "Série", "Racha", "Serie", "Serie", "Sequência"],
["Stars", "Étoiles", "Estrellas", "Sterne", "Stelle", "Estrelas"],
["Stage", "Étape", "Etapa", "Etappe", "Tappa", "Etapa"],
["Territory", "Territoire", "Territorio", "Gebiet", "Territorio", "Território"],
["Mass", "Masse", "Masa", "Masse", "Massa", "Massa"],
["Distance", "Distance", "Distancia", "Distanz", "Distanza", "Distância"],
["Progress", "Progression", "Progreso", "Fortschritt", "Progresso", "Progresso"],
["Shots", "Tirs", "Disparos", "Schüsse", "Colpi", "Tiros"],
["Level", "Niveau", "Nivel", "Level", "Livello", "Nível"],
["Tiles", "Tuiles", "Fichas", "Kacheln", "Tessere", "Peças"],
["#pScoreK|Length", "Longueur", "Longitud", "Länge", "Lunghezza", "Comprimento"],
["#pScoreK|Last", "Dernier", "Último", "Letzter", "Ultimo", "Último"],
["2D", "2D", "2D", "2D", "2D", "2D"],
["DELETE", "DELETE", "DELETE", "DELETE", "DELETE", "DELETE"],
["Space", "Espace", "Espacio", "Leertaste", "Spazio", "Espaço"],
["Continue with Google", "Continuer avec Google", "Continuar con Google", "Weiter mit Google", "Continua con Google", "Continuar com o Google"],
["or with email", "ou avec un e-mail", "o con correo", "oder mit E-Mail", "oppure con l’email", "ou com e-mail"],
["or", "ou", "o", "oder", "oppure", "ou"],
["Password", "Mot de passe", "Contraseña", "Passwort", "Password", "Senha"],
["Forgot password?", "Mot de passe oublié ?", "¿Olvidaste tu contraseña?", "Passwort vergessen?", "Password dimenticata?", "Esqueceu a senha?"],
["Create an account", "Créer un compte", "Crear una cuenta", "Konto erstellen", "Crea un account", "Criar uma conta"],
["Create account", "Créer un compte", "Crear cuenta", "Konto erstellen", "Crea account", "Criar conta"],
["I already have an account", "J’ai déjà un compte", "Ya tengo una cuenta", "Ich habe schon ein Konto", "Ho già un account", "Já tenho uma conta"],
["Type the email of your account. We will send you a 6-digit code to choose a new password.", "Saisissez l’e-mail de votre compte. Nous vous enverrons un code à 6 chiffres pour choisir un nouveau mot de passe.", "Escribe el correo de tu cuenta. Te enviaremos un código de 6 dígitos para elegir una contraseña nueva.", "Gib die E-Mail deines Kontos ein. Wir schicken dir einen 6-stelligen Code, um ein neues Passwort festzulegen.", "Inserisci l’email del tuo account. Ti invieremo un codice di 6 cifre per scegliere una nuova password.", "Digite o e-mail da sua conta. Enviaremos um código de 6 dígitos para escolher uma nova senha."],
["Send code", "Envoyer le code", "Enviar código", "Code senden", "Invia codice", "Enviar código"],
["Back to sign in", "Retour à la connexion", "Volver a iniciar sesión", "Zurück zur Anmeldung", "Torna all’accesso", "Voltar para entrar"],
["Back to log in", "Retour à la connexion", "Volver a iniciar sesión", "Zurück zur Anmeldung", "Torna all’accesso", "Voltar para entrar"],
["Choose a new password for your account.", "Choisissez un nouveau mot de passe pour votre compte.", "Elige una contraseña nueva para tu cuenta.", "Wähle ein neues Passwort für dein Konto.", "Scegli una nuova password per il tuo account.", "Escolha uma nova senha para sua conta."],
["Save password", "Enregistrer le mot de passe", "Guardar contraseña", "Passwort speichern", "Salva password", "Salvar senha"],
["By continuing you agree to the", "En continuant, vous acceptez les", "Al continuar aceptas los", "Mit dem Fortfahren akzeptierst du die", "Continuando accetti i", "Ao continuar, você aceita os"],
["and the", "et la", "y la", "und die", "e la", "e a"],
["Reset password", "Réinitialiser le mot de passe", "Restablecer contraseña", "Passwort zurücksetzen", "Reimposta password", "Redefinir senha"],
["Wrong email or password.", "E-mail ou mot de passe incorrect.", "Correo o contraseña incorrectos.", "Falsche E-Mail oder falsches Passwort.", "Email o password errata.", "E-mail ou senha incorretos."],
["Confirm your email first: type the code we sent you.", "Confirmez d’abord votre e-mail : saisissez le code que nous vous avons envoyé.", "Confirma primero tu correo: escribe el código que te enviamos.", "Bestätige zuerst deine E-Mail: Gib den Code ein, den wir dir geschickt haben.", "Prima conferma la tua email: inserisci il codice che ti abbiamo inviato.", "Confirme seu e-mail primeiro: digite o código que enviamos."],
["An account with this email already exists. Sign in instead.", "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.", "Ya existe una cuenta con este correo. Inicia sesión.", "Mit dieser E-Mail gibt es schon ein Konto. Melde dich stattdessen an.", "Esiste già un account con questa email. Accedi.", "Já existe uma conta com este e-mail. Entre nela."],
["Choose a password that is different from your current one.", "Choisissez un mot de passe différent de l’actuel.", "Elige una contraseña distinta de la actual.", "Wähle ein anderes Passwort als dein aktuelles.", "Scegli una password diversa da quella attuale.", "Escolha uma senha diferente da atual."],
["Choose a stronger password: at least 8 characters.", "Choisissez un mot de passe plus solide : au moins 8 caractères.", "Elige una contraseña más segura: al menos 8 caracteres.", "Wähle ein stärkeres Passwort: mindestens 8 Zeichen.", "Scegli una password più sicura: almeno 8 caratteri.", "Escolha uma senha mais forte: pelo menos 8 caracteres."],
["This email address is not valid.", "Cette adresse e-mail n’est pas valide.", "Este correo no es válido.", "Diese E-Mail-Adresse ist ungültig.", "Questo indirizzo email non è valido.", "Este endereço de e-mail não é válido."],
["Another account already uses this email.", "Un autre compte utilise déjà cet e-mail.", "Otra cuenta ya usa este correo.", "Ein anderes Konto nutzt diese E-Mail bereits.", "Un altro account usa già questa email.", "Outra conta já usa este e-mail."],
["Too many attempts. Wait a few minutes and try again.", "Trop de tentatives. Attendez quelques minutes et réessayez.", "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.", "Zu viele Versuche. Warte ein paar Minuten und versuche es erneut.", "Troppi tentativi. Aspetta qualche minuto e riprova.", "Muitas tentativas. Aguarde alguns minutos e tente de novo."],
["We cannot send emails to this address yet. Please use Continue with Google for now.", "Nous ne pouvons pas encore envoyer d’e-mails à cette adresse. Utilisez Continuer avec Google pour l’instant.", "Aún no podemos enviar correos a esta dirección. Por ahora usa Continuar con Google.", "An diese Adresse können wir noch keine E-Mails senden. Nutze vorerst Weiter mit Google.", "Non possiamo ancora inviare email a questo indirizzo. Per ora usa Continua con Google.", "Ainda não podemos enviar e-mails para este endereço. Por enquanto, use Continuar com o Google."],
["Too many emails were sent in the last hour. Try again later or use Continue with Google.", "Trop d’e-mails ont été envoyés dans l’heure. Réessayez plus tard ou utilisez Continuer avec Google.", "Se enviaron demasiados correos en la última hora. Inténtalo más tarde o usa Continuar con Google.", "In der letzten Stunde wurden zu viele E-Mails gesendet. Versuche es später erneut oder nutze Weiter mit Google.", "Sono state inviate troppe email nell’ultima ora. Riprova più tardi o usa Continua con Google.", "Muitos e-mails foram enviados na última hora. Tente mais tarde ou use Continuar com o Google."],
["This sign-in method is not available yet.", "Ce mode de connexion n’est pas encore disponible.", "Este método de inicio de sesión aún no está disponible.", "Diese Anmeldemethode ist noch nicht verfügbar.", "Questo metodo di accesso non è ancora disponibile.", "Este método de login ainda não está disponível."],
["Sign-in was cancelled.", "La connexion a été annulée.", "Se canceló el inicio de sesión.", "Die Anmeldung wurde abgebrochen.", "L’accesso è stato annullato.", "O login foi cancelado."],
["Cannot reach the sign-in service. Check your connection and try again.", "Impossible de joindre le service de connexion. Vérifiez votre connexion et réessayez.", "No se puede contactar con el servicio de inicio de sesión. Revisa tu conexión e inténtalo de nuevo.", "Der Anmeldedienst ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.", "Impossibile raggiungere il servizio di accesso. Controlla la connessione e riprova.", "Não foi possível acessar o serviço de login. Verifique sua conexão e tente de novo."],
["Something went wrong. Please try again.", "Un problème est survenu. Veuillez réessayer.", "Algo salió mal. Inténtalo de nuevo.", "Etwas ist schiefgelaufen. Bitte versuche es erneut.", "Qualcosa è andato storto. Riprova.", "Algo deu errado. Tente de novo."],
["Waiting for a connection. Your progress is kept on this device until then.", "En attente de connexion. Votre progression est conservée sur cet appareil en attendant.", "Esperando conexión. Tu progreso se guarda en este dispositivo mientras tanto.", "Warte auf eine Verbindung. Dein Fortschritt bleibt bis dahin auf diesem Gerät.", "In attesa di connessione. Nel frattempo i tuoi progressi restano su questo dispositivo.", "Aguardando conexão. Seu progresso fica neste dispositivo até lá."],
["Google and email password", "Google et mot de passe e-mail", "Google y contraseña de correo", "Google und E-Mail-Passwort", "Google e password email", "Google e senha de e-mail"],
["Signed in with Google", "Connecté avec Google", "Sesión iniciada con Google", "Mit Google angemeldet", "Accesso con Google", "Conectado com o Google"],
["Signed in with email", "Connecté avec un e-mail", "Sesión iniciada con correo", "Mit E-Mail angemeldet", "Accesso con email", "Conectado com e-mail"],
["Opening Google…", "Ouverture de Google…", "Abriendo Google…", "Google wird geöffnet…", "Apertura di Google…", "Abrindo o Google…"],
["Enter a valid email address.", "Saisissez une adresse e-mail valide.", "Escribe un correo válido.", "Gib eine gültige E-Mail-Adresse ein.", "Inserisci un indirizzo email valido.", "Digite um endereço de e-mail válido."],
["Use at least 8 characters for your password.", "Utilisez au moins 8 caractères pour votre mot de passe.", "Usa al menos 8 caracteres para tu contraseña.", "Dein Passwort braucht mindestens 8 Zeichen.", "Usa almeno 8 caratteri per la password.", "Use pelo menos 8 caracteres na sua senha."],
["Enter your password.", "Saisissez votre mot de passe.", "Escribe tu contraseña.", "Gib dein Passwort ein.", "Inserisci la password.", "Digite sua senha."],
["Creating your account…", "Création de votre compte…", "Creando tu cuenta…", "Dein Konto wird erstellt…", "Creazione dell’account…", "Criando sua conta…"],
["Signing in…", "Connexion…", "Iniciando sesión…", "Anmeldung…", "Accesso in corso…", "Entrando…"],
["Sending…", "Envoi…", "Enviando…", "Wird gesendet…", "Invio…", "Enviando…"],
["If an account uses this email, we sent it a link to choose a new password.", "Si un compte utilise cet e-mail, nous lui avons envoyé un lien pour choisir un nouveau mot de passe.", "Si alguna cuenta usa este correo, le enviamos un enlace para elegir una contraseña nueva.", "Falls ein Konto diese E-Mail nutzt, haben wir einen Link zum Festlegen eines neuen Passworts geschickt.", "Se un account usa questa email, gli abbiamo inviato un link per scegliere una nuova password.", "Se alguma conta usa este e-mail, enviamos um link para escolher uma nova senha."],
["Use at least 8 characters.", "Utilisez au moins 8 caractères.", "Usa al menos 8 caracteres.", "Verwende mindestens 8 Zeichen.", "Usa almeno 8 caratteri.", "Use pelo menos 8 caracteres."],
["Saving…", "Enregistrement…", "Guardando…", "Wird gespeichert…", "Salvataggio…", "Salvando…"],
["Password saved. You are signed in.", "Mot de passe enregistré. Vous êtes connecté.", "Contraseña guardada. Has iniciado sesión.", "Passwort gespeichert. Du bist angemeldet.", "Password salvata. Hai effettuato l’accesso.", "Senha salva. Você está conectado."],
["That is already your email address.", "C’est déjà votre adresse e-mail.", "Ese ya es tu correo.", "Das ist bereits deine E-Mail-Adresse.", "È già il tuo indirizzo email.", "Esse já é seu endereço de e-mail."],
["Check your inbox: open the link we sent to confirm the change. You may get a link at your old address too.", "Consultez votre boîte de réception : ouvrez le lien envoyé pour confirmer le changement. Vous recevrez peut-être aussi un lien à votre ancienne adresse.", "Revisa tu bandeja de entrada: abre el enlace que enviamos para confirmar el cambio. Puede que también recibas un enlace en tu dirección anterior.", "Sieh in dein Postfach: Öffne den Link, um die Änderung zu bestätigen. Eventuell bekommst du auch einen Link an deine alte Adresse.", "Controlla la posta: apri il link che abbiamo inviato per confermare la modifica. Potresti ricevere un link anche al vecchio indirizzo.", "Confira sua caixa de entrada: abra o link que enviamos para confirmar a alteração. Você também pode receber um link no endereço antigo."],
["Password saved.", "Mot de passe enregistré.", "Contraseña guardada.", "Passwort gespeichert.", "Password salvata.", "Senha salva."],
["Signing out…", "Déconnexion…", "Cerrando sesión…", "Abmeldung…", "Uscita in corso…", "Saindo…"],
["Signed out. You are playing as a guest.", "Déconnecté. Vous jouez en invité.", "Sesión cerrada. Juegas como invitado.", "Abgemeldet. Du spielst als Gast.", "Disconnesso. Stai giocando come ospite.", "Você saiu. Está jogando como convidado."],
["Deleting your account…", "Suppression de votre compte…", "Eliminando tu cuenta…", "Dein Konto wird gelöscht…", "Eliminazione dell’account…", "Excluindo sua conta…"],
["Your account will be deleted. You are now playing as a guest.", "Votre compte va être supprimé. Vous jouez maintenant en invité.", "Tu cuenta se eliminará. Ahora juegas como invitado.", "Dein Konto wird gelöscht. Du spielst jetzt als Gast.", "Il tuo account verrà eliminato. Ora stai giocando come ospite.", "Sua conta será excluída. Agora você está jogando como convidado."],
["Your account was deleted. You are now playing as a guest.", "Votre compte a été supprimé. Vous jouez maintenant en invité.", "Tu cuenta se eliminó. Ahora juegas como invitado.", "Dein Konto wurde gelöscht. Du spielst jetzt als Gast.", "Il tuo account è stato eliminato. Ora stai giocando come ospite.", "Sua conta foi excluída. Agora você está jogando como convidado."],
["Could not delete your account. Check your connection and try again.", "Impossible de supprimer votre compte. Vérifiez votre connexion et réessayez.", "No se pudo eliminar tu cuenta. Revisa tu conexión e inténtalo de nuevo.", "Dein Konto konnte nicht gelöscht werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile eliminare l’account. Controlla la connessione e riprova.", "Não foi possível excluir sua conta. Verifique sua conexão e tente de novo."],
["Friends find you by your username: 3 to 20 lowercase letters, numbers, dots or underscores.", "Vos amis vous trouvent grâce à votre nom d’utilisateur : 3 à 20 lettres minuscules, chiffres, points ou tirets bas.", "Tus amigos te encuentran por tu nombre de usuario: de 3 a 20 letras minúsculas, números, puntos o guiones bajos.", "Freunde finden dich über deinen Benutzernamen: 3 bis 20 Kleinbuchstaben, Ziffern, Punkte oder Unterstriche.", "Gli amici ti trovano con il nome utente: da 3 a 20 lettere minuscole, numeri, punti o trattini bassi.", "Seus amigos encontram você pelo nome de usuário: de 3 a 20 letras minúsculas, números, pontos ou sublinhados."],
["Use 3 to 20 lowercase letters, numbers, dots or underscores.", "Utilisez 3 à 20 lettres minuscules, chiffres, points ou tirets bas.", "Usa de 3 a 20 letras minúsculas, números, puntos o guiones bajos.", "Verwende 3 bis 20 Kleinbuchstaben, Ziffern, Punkte oder Unterstriche.", "Usa da 3 a 20 lettere minuscole, numeri, punti o trattini bassi.", "Use de 3 a 20 letras minúsculas, números, pontos ou sublinhados."],
["That username is taken or not allowed. Try another one.", "Ce nom d’utilisateur est déjà pris ou interdit. Essayez-en un autre.", "Ese nombre de usuario está ocupado o no está permitido. Prueba otro.", "Dieser Benutzername ist vergeben oder nicht erlaubt. Versuche einen anderen.", "Questo nome utente è già preso o non è consentito. Provane un altro.", "Esse nome de usuário já está em uso ou não é permitido. Tente outro."],
["That username is taken. Try another one.", "Ce nom d’utilisateur est déjà pris. Essayez-en un autre.", "Ese nombre de usuario está ocupado. Prueba otro.", "Dieser Benutzername ist vergeben. Versuche einen anderen.", "Questo nome utente è già preso. Provane un altro.", "Esse nome de usuário já está em uso. Tente outro."],
["That username is not allowed.", "Ce nom d’utilisateur n’est pas autorisé.", "Ese nombre de usuario no está permitido.", "Dieser Benutzername ist nicht erlaubt.", "Questo nome utente non è consentito.", "Esse nome de usuário não é permitido."],
["Could not save. Check your connection and try again.", "Impossible d’enregistrer. Vérifiez votre connexion et réessayez.", "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.", "Speichern fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.", "Impossibile salvare. Controlla la connessione e riprova.", "Não foi possível salvar. Verifique sua conexão e tente de novo."],
["Your email is probably confirmed already. Sign in with your email and password.", "Votre e-mail est sans doute déjà confirmé. Connectez-vous avec votre e-mail et votre mot de passe.", "Probablemente tu correo ya está confirmado. Inicia sesión con tu correo y contraseña.", "Deine E-Mail ist wahrscheinlich schon bestätigt. Melde dich mit E-Mail und Passwort an.", "Probabilmente la tua email è già confermata. Accedi con email e password.", "Seu e-mail provavelmente já está confirmado. Entre com seu e-mail e senha."],
["This link has expired or was opened in another browser. Ask for a new one.", "Ce lien a expiré ou a été ouvert dans un autre navigateur. Demandez-en un nouveau.", "Este enlace caducó o se abrió en otro navegador. Pide uno nuevo.", "Dieser Link ist abgelaufen oder wurde in einem anderen Browser geöffnet. Fordere einen neuen an.", "Questo link è scaduto o è stato aperto in un altro browser. Richiedine uno nuovo.", "Este link expirou ou foi aberto em outro navegador. Peça um novo."],
["Open the link in the browser where you are signed in, or sign in again.", "Ouvrez le lien dans le navigateur où vous êtes connecté, ou reconnectez-vous.", "Abre el enlace en el navegador donde iniciaste sesión, o vuelve a iniciar sesión.", "Öffne den Link in dem Browser, in dem du angemeldet bist, oder melde dich erneut an.", "Apri il link nel browser in cui hai effettuato l’accesso, oppure accedi di nuovo.", "Abra o link no navegador em que você está conectado ou entre de novo."],
["Sign-in did not finish. Please try again.", "La connexion n’a pas abouti. Veuillez réessayer.", "El inicio de sesión no terminó. Inténtalo de nuevo.", "Die Anmeldung wurde nicht abgeschlossen. Bitte versuche es erneut.", "L’accesso non è stato completato. Riprova.", "O login não foi concluído. Tente de novo."],
["Your email address was updated", "Votre adresse e-mail a été mise à jour", "Tu correo se actualizó", "Deine E-Mail-Adresse wurde aktualisiert", "Il tuo indirizzo email è stato aggiornato", "Seu endereço de e-mail foi atualizado"],
["Sign-in could not load. Check your connection and reload the page.", "La connexion n’a pas pu se charger. Vérifiez votre connexion et rechargez la page.", "No se pudo cargar el inicio de sesión. Revisa tu conexión y recarga la página.", "Die Anmeldung konnte nicht geladen werden. Prüfe deine Verbindung und lade die Seite neu.", "Impossibile caricare l’accesso. Controlla la connessione e ricarica la pagina.", "Não foi possível carregar o login. Verifique sua conexão e recarregue a página."],
["You will also be signed out on this device.", "Vous serez aussi déconnecté sur cet appareil.", "También se cerrará tu sesión en este dispositivo.", "Du wirst auch auf diesem Gerät abgemeldet.", "Verrai disconnesso anche su questo dispositivo.", "Você também sairá neste dispositivo."],
["Includes your account data.", "Inclut les données de votre compte.", "Incluye los datos de tu cuenta.", "Enthält die Daten deines Kontos.", "Include i dati del tuo account.", "Inclui os dados da sua conta."],
["Your account records are cleared too.", "Les records de votre compte sont aussi effacés.", "También se borran los récords de tu cuenta.", "Die Rekorde deines Kontos werden ebenfalls gelöscht.", "Vengono cancellati anche i record del tuo account.", "Os recordes da sua conta também são apagados."],
["Log in", "Se connecter", "Iniciar sesión", "Anmelden", "Accedi", "Entrar"],
["Sign up", "S’inscrire", "Registrarse", "Registrieren", "Registrati", "Cadastrar-se"],
["Log in or sign up", "Connexion ou inscription", "Inicia sesión o regístrate", "Anmelden oder registrieren", "Accedi o registrati", "Entre ou cadastre-se"],
["Log in or create an account.", "Connectez-vous ou créez un compte.", "Inicia sesión o crea una cuenta.", "Melde dich an oder erstelle ein Konto.", "Accedi o crea un account.", "Entre ou crie uma conta."],
["Log in or sign up with email, or with Google.", "Connectez-vous ou inscrivez-vous avec un e-mail ou avec Google.", "Inicia sesión o regístrate con tu correo o con Google.", "Melde dich mit E-Mail oder Google an oder registriere dich.", "Accedi o registrati con l’email o con Google.", "Entre ou cadastre-se com e-mail ou com o Google."],
["Log in to keep your records and saves on every device.", "Connectez-vous pour retrouver vos records et sauvegardes sur tous vos appareils.", "Inicia sesión para conservar tus récords y partidas en todos tus dispositivos.", "Melde dich an, um deine Rekorde und Spielstände auf allen Geräten zu behalten.", "Accedi per ritrovare record e salvataggi su ogni dispositivo.", "Entre para manter seus recordes e jogos salvos em todos os dispositivos."],
["Keep your records and saves on every device and add friends.", "Retrouvez vos records et sauvegardes sur tous vos appareils et ajoutez des amis.", "Conserva tus récords y partidas en todos tus dispositivos y añade amigos.", "Behalte deine Rekorde und Spielstände auf allen Geräten und füge Freunde hinzu.", "Ritrova record e salvataggi su ogni dispositivo e aggiungi amici.", "Mantenha seus recordes e jogos salvos em todos os dispositivos e adicione amigos."],
["Welcome back", "Bon retour", "Hola de nuevo", "Willkommen zurück", "Bentornato", "Bem-vindo de volta"],
["Create your account", "Créez votre compte", "Crea tu cuenta", "Erstelle dein Konto", "Crea il tuo account", "Crie sua conta"],
["Email or username", "E-mail ou nom d’utilisateur", "Correo o nombre de usuario", "E-Mail oder Benutzername", "Email o nome utente", "E-mail ou nome de usuário"],
["Enter your email or username.", "Saisissez votre e-mail ou votre nom d’utilisateur.", "Escribe tu correo o tu nombre de usuario.", "Gib deine E-Mail oder deinen Benutzernamen ein.", "Inserisci la tua email o il tuo nome utente.", "Digite seu e-mail ou nome de usuário."],
["Confirm password", "Confirmer le mot de passe", "Confirmar contraseña", "Passwort bestätigen", "Conferma password", "Confirmar senha"],
["Confirm new password", "Confirmer le nouveau mot de passe", "Confirmar nueva contraseña", "Neues Passwort bestätigen", "Conferma la nuova password", "Confirmar nova senha"],
["Show password", "Afficher le mot de passe", "Mostrar contraseña", "Passwort anzeigen", "Mostra password", "Mostrar senha"],
["Hide password", "Masquer le mot de passe", "Ocultar contraseña", "Passwort verbergen", "Nascondi password", "Ocultar senha"],
["The two passwords are not the same.", "Les deux mots de passe ne sont pas identiques.", "Las dos contraseñas no coinciden.", "Die beiden Passwörter stimmen nicht überein.", "Le due password non coincidono.", "As duas senhas não são iguais."],
["3 to 20 lowercase letters, numbers, dots or underscores. Friends find you by it.", "3 à 20 lettres minuscules, chiffres, points ou tirets bas. Vos amis vous trouvent grâce à lui.", "De 3 a 20 letras minúsculas, números, puntos o guiones bajos. Tus amigos te encuentran con él.", "3 bis 20 Kleinbuchstaben, Ziffern, Punkte oder Unterstriche. Freunde finden dich darüber.", "Da 3 a 20 lettere minuscole, numeri, punti o trattini bassi. Gli amici ti trovano così.", "De 3 a 20 letras minúsculas, números, pontos ou sublinhados. Seus amigos encontram você por ele."],
["Choose a username: 3 to 20 lowercase letters, numbers, dots or underscores.", "Choisissez un nom d’utilisateur : 3 à 20 lettres minuscules, chiffres, points ou tirets bas.", "Elige un nombre de usuario: de 3 a 20 letras minúsculas, números, puntos o guiones bajos.", "Wähle einen Benutzernamen: 3 bis 20 Kleinbuchstaben, Ziffern, Punkte oder Unterstriche.", "Scegli un nome utente: da 3 a 20 lettere minuscole, numeri, punti o trattini bassi.", "Escolha um nome de usuário: de 3 a 20 letras minúsculas, números, pontos ou sublinhados."],
["e.g. dedpoul", "ex. dedpoul", "p. ej. dedpoul", "z. B. dedpoul", "es. dedpoul", "ex.: dedpoul"],
["I agree to the", "J’accepte les", "Acepto los", "Ich akzeptiere die", "Accetto i", "Concordo com os"],
["Tick the box first to agree to the Terms of Use and the Privacy Policy.", "Cochez d’abord la case pour accepter les Conditions d’utilisation et la Politique de confidentialité.", "Marca primero la casilla para aceptar los Términos de uso y la Política de privacidad.", "Setze zuerst das Häkchen, um den Nutzungsbedingungen und der Datenschutzerklärung zuzustimmen.", "Spunta prima la casella per accettare i Termini d’uso e la Politica sulla privacy.", "Marque primeiro a caixa para aceitar os Termos de Uso e a Política de Privacidade."],
["Tick the box to agree to the Terms of Use and the Privacy Policy.", "Cochez la case pour accepter les Conditions d’utilisation et la Politique de confidentialité.", "Marca la casilla para aceptar los Términos de uso y la Política de privacidad.", "Setze das Häkchen, um den Nutzungsbedingungen und der Datenschutzerklärung zuzustimmen.", "Spunta la casella per accettare i Termini d’uso e la Politica sulla privacy.", "Marque a caixa para aceitar os Termos de Uso e a Política de Privacidade."],
["Continue as guest", "Continuer en invité", "Continuar como invitado", "Als Gast fortfahren", "Continua come ospite", "Continuar como convidado"],
["Play as a guest", "Jouer en invité", "Jugar como invitado", "Als Gast spielen", "Gioca come ospite", "Jogar como convidado"],
["You can still play every game as a guest. Your records and saves stay in this browser.", "Vous pouvez toujours jouer à tous les jeux en invité. Vos records et sauvegardes restent dans ce navigateur.", "Puedes seguir jugando a todos los juegos como invitado. Tus récords y partidas se quedan en este navegador.", "Du kannst weiterhin alle Spiele als Gast spielen. Deine Rekorde und Spielstände bleiben in diesem Browser.", "Puoi comunque giocare a tutti i giochi come ospite. Record e salvataggi restano in questo browser.", "Você ainda pode jogar todos os jogos como convidado. Seus recordes e jogos salvos ficam neste navegador."],
["Cannot reach the sign-in service from this network yet.", "Le service de connexion est injoignable depuis ce réseau pour le moment.", "No se puede acceder al servicio de inicio de sesión desde esta red por ahora.", "Der Anmeldedienst ist von diesem Netzwerk aus noch nicht erreichbar.", "Il servizio di accesso non è ancora raggiungibile da questa rete.", "O serviço de início de sessão ainda não está acessível a partir desta rede."],
["It keeps trying in the background. If it lasts, ", "Il réessaie en arrière-plan. Si cela dure, ", "Sigue intentándolo en segundo plano. Si continúa, ", "Es wird im Hintergrund weiter versucht. Wenn es anhält, ", "Continua a riprovare in background. Se dura, ", "Continua a tentar em segundo plano. Se persistir, "],
["Play without an account for now", "Jouer sans compte pour le moment", "Jugar sin cuenta por ahora", "Vorerst ohne Konto spielen", "Gioca senza account per ora", "Jogar sem conta por agora"],
["You can play without an account until the sign-in service can be reached. Then you will need to log in.", "Vous pouvez jouer sans compte jusqu’à ce que le service de connexion soit joignable. Ensuite, il faudra vous connecter.", "Puedes jugar sin cuenta hasta que se pueda acceder al servicio de inicio de sesión. Después tendrás que iniciar sesión.", "Du kannst ohne Konto spielen, bis der Anmeldedienst erreichbar ist. Danach musst du dich anmelden.", "Puoi giocare senza account finché il servizio di accesso non è raggiungibile. Poi dovrai accedere.", "Pode jogar sem conta até o serviço de início de sessão estar acessível. Depois terá de iniciar sessão."],
["The sign-in service works again: log in or create an account to keep playing.", "Le service de connexion fonctionne à nouveau : connectez-vous ou créez un compte pour continuer à jouer.", "El servicio de inicio de sesión vuelve a funcionar: inicia sesión o crea una cuenta para seguir jugando.", "Der Anmeldedienst funktioniert wieder: Melde dich an oder erstelle ein Konto, um weiterzuspielen.", "Il servizio di accesso funziona di nuovo: accedi o crea un account per continuare a giocare.", "O serviço de início de sessão voltou a funcionar: inicie sessão ou crie uma conta para continuar a jogar."],
["Made by Gabriel Courtin", "Créé par Gabriel Courtin", "Creado por Gabriel Courtin", "Erstellt von Gabriel Courtin", "Creato da Gabriel Courtin", "Criado por Gabriel Courtin"],
["run a connection check", "lancez un test de connexion", "haz una prueba de conexión", "starte einen Verbindungstest", "esegui un test di connessione", "faça um teste de ligação"],
["Run a connection check", "Lancer un test de connexion", "Hacer una prueba de conexión", "Verbindungstest starten", "Esegui un test di connessione", "Fazer um teste de ligação"],
["Accounts are not switched on yet", "Les comptes ne sont pas encore activés", "Las cuentas aún no están activadas", "Konten sind noch nicht aktiviert", "Gli account non sono ancora attivi", "As contas ainda não estão ativadas"],
["Accounts are not switched on yet. Soon you can keep your profile, records and saves on every device.", "Les comptes ne sont pas encore activés. Bientôt, vous retrouverez votre profil, vos records et vos sauvegardes sur tous vos appareils.", "Las cuentas aún no están activadas. Pronto podrás conservar tu perfil, récords y partidas en todos tus dispositivos.", "Konten sind noch nicht aktiviert. Bald kannst du dein Profil, deine Rekorde und Spielstände auf allen Geräten behalten.", "Gli account non sono ancora attivi. Presto potrai ritrovare profilo, record e salvataggi su ogni dispositivo.", "As contas ainda não estão ativadas. Em breve você poderá manter seu perfil, recordes e jogos salvos em todos os dispositivos."],
["Accounts are not switched on yet. Then you can find players by their username and add them as friends.", "Les comptes ne sont pas encore activés. Vous pourrez alors trouver des joueurs par leur nom d’utilisateur et les ajouter en amis.", "Las cuentas aún no están activadas. Entonces podrás buscar jugadores por su nombre de usuario y añadirlos como amigos.", "Konten sind noch nicht aktiviert. Dann kannst du Spieler über ihren Benutzernamen finden und als Freunde hinzufügen.", "Gli account non sono ancora attivi. Allora potrai trovare i giocatori con il loro nome utente e aggiungerli come amici.", "As contas ainda não estão ativadas. Depois você poderá encontrar jogadores pelo nome de usuário e adicioná-los como amigos."],
["Check your inbox", "Consultez votre boîte de réception", "Revisa tu bandeja de entrada", "Sieh in dein Postfach", "Controlla la posta", "Confira sua caixa de entrada"],
["We sent a 6-digit code to", "Nous avons envoyé un code à 6 chiffres à", "Enviamos un código de 6 dígitos a", "Wir haben einen 6-stelligen Code geschickt an", "Abbiamo inviato un codice di 6 cifre a", "Enviamos um código de 6 dígitos para"],
["Type it below to confirm your account.", "Saisissez-le ci-dessous pour confirmer votre compte.", "Escríbelo abajo para confirmar tu cuenta.", "Gib ihn unten ein, um dein Konto zu bestätigen.", "Inseriscilo qui sotto per confermare il tuo account.", "Digite-o abaixo para confirmar sua conta."],
["No code? Check your spam folder,", "Pas de code ? Vérifiez vos spams,", "¿No te llega el código? Revisa la carpeta de spam,", "Kein Code? Sieh im Spam-Ordner nach,", "Nessun codice? Controlla lo spam,", "Não chegou o código? Confira a pasta de spam,"],
["use a different email", "utilisez une autre adresse", "usa otro correo", "nutze eine andere E-Mail", "usa un’altra email", "use outro e-mail"],
["Resend code", "Renvoyer le code", "Reenviar código", "Code erneut senden", "Invia di nuovo il codice", "Reenviar código"],
["Sent again. Use the code in the newest email: the old code no longer works.", "Renvoyé. Utilisez le code du dernier e-mail : l’ancien code ne fonctionne plus.", "Enviado de nuevo. Usa el código del correo más reciente: el anterior ya no funciona.", "Erneut gesendet. Nutze den Code aus der neuesten E-Mail: Der alte Code gilt nicht mehr.", "Inviato di nuovo. Usa il codice dell’email più recente: quello vecchio non funziona più.", "Enviado de novo. Use o código do e-mail mais recente: o código antigo não funciona mais."],
["Reset your password", "Réinitialisez votre mot de passe", "Restablece tu contraseña", "Setze dein Passwort zurück", "Reimposta la password", "Redefina sua senha"],
["Choose a new password", "Choisissez un nouveau mot de passe", "Elige una contraseña nueva", "Wähle ein neues Passwort", "Scegli una nuova password", "Escolha uma nova senha"],
["If an account uses this email, we sent it a code.", "Si un compte utilise cet e-mail, nous lui avons envoyé un code.", "Si alguna cuenta usa este correo, le enviamos un código.", "Falls ein Konto diese E-Mail nutzt, haben wir ihm einen Code geschickt.", "Se un account usa questa email, gli abbiamo inviato un codice.", "Se alguma conta usa este e-mail, enviamos um código para ela."],
["An account with this email already exists. Log in instead.", "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.", "Ya existe una cuenta con este correo. Inicia sesión.", "Mit dieser E-Mail gibt es schon ein Konto. Melde dich stattdessen an.", "Esiste già un account con questa email. Accedi.", "Já existe uma conta com este e-mail. Entre nela."],
["Wrong email, username or password.", "E-mail, nom d’utilisateur ou mot de passe incorrect.", "Correo, nombre de usuario o contraseña incorrectos.", "Falsche E-Mail, falscher Benutzername oder falsches Passwort.", "Email, nome utente o password errati.", "E-mail, nome de usuário ou senha incorretos."],
["Confirm your email first: type the code we sent you, or send a new one.", "Confirmez d’abord votre e-mail : saisissez le code envoyé, ou demandez-en un nouveau.", "Confirma primero tu correo: escribe el código que te enviamos o pide uno nuevo.", "Bestätige zuerst deine E-Mail: Gib den Code ein, den wir dir geschickt haben, oder fordere einen neuen an.", "Prima conferma la tua email: inserisci il codice che ti abbiamo inviato, oppure richiedine uno nuovo.", "Confirme seu e-mail primeiro: digite o código que enviamos ou peça um novo."],
["Too many emails were sent. Wait a minute and try again.", "Trop d’e-mails envoyés. Attendez une minute et réessayez.", "Se enviaron demasiados correos. Espera un minuto e inténtalo de nuevo.", "Es wurden zu viele E-Mails gesendet. Warte eine Minute und versuche es erneut.", "Sono state inviate troppe email. Aspetta un minuto e riprova.", "Muitos e-mails foram enviados. Aguarde um minuto e tente de novo."],
["We cannot send emails to this address yet. Try again later.", "Nous ne pouvons pas encore envoyer d’e-mails à cette adresse. Réessayez plus tard.", "Aún no podemos enviar correos a esta dirección. Inténtalo más tarde.", "An diese Adresse können wir noch keine E-Mails senden. Versuche es später erneut.", "Non possiamo ancora inviare email a questo indirizzo. Riprova più tardi.", "Ainda não podemos enviar e-mails para este endereço. Tente mais tarde."],
["Logging in…", "Connexion…", "Iniciando sesión…", "Anmeldung…", "Accesso in corso…", "Entrando…"],
["Password saved. You are logged in.", "Mot de passe enregistré. Vous êtes connecté.", "Contraseña guardada. Has iniciado sesión.", "Passwort gespeichert. Du bist angemeldet.", "Password salvata. Hai effettuato l’accesso.", "Senha salva. Você está conectado."],
["Open the link in the browser where you are logged in, or log in again.", "Ouvrez le lien dans le navigateur où vous êtes connecté, ou reconnectez-vous.", "Abre el enlace en el navegador donde iniciaste sesión, o vuelve a iniciar sesión.", "Öffne den Link in dem Browser, in dem du angemeldet bist, oder melde dich erneut an.", "Apri il link nel browser in cui hai effettuato l’accesso, oppure accedi di nuovo.", "Abra o link no navegador em que você está conectado ou entre de novo."],
["This link has expired or was already used. Ask for a new one.", "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.", "Este enlace caducó o ya se usó. Pide uno nuevo.", "Dieser Link ist abgelaufen oder wurde schon benutzt. Fordere einen neuen an.", "Questo link è scaduto o è già stato usato. Richiedine uno nuovo.", "Este link expirou ou já foi usado. Peça um novo."],
["Your email is confirmed. Welcome!", "Votre e-mail est confirmé. Bienvenue !", "Tu correo está confirmado. ¡Bienvenido!", "Deine E-Mail ist bestätigt. Willkommen!", "La tua email è confermata. Benvenuto!", "Seu e-mail está confirmado. Bem-vindo!"],
["Your email is probably confirmed already. Log in with your email or username and your password.", "Votre e-mail est sans doute déjà confirmé. Connectez-vous avec votre e-mail ou votre nom d’utilisateur et votre mot de passe.", "Probablemente tu correo ya está confirmado. Inicia sesión con tu correo o nombre de usuario y tu contraseña.", "Deine E-Mail ist wahrscheinlich schon bestätigt. Melde dich mit E-Mail oder Benutzernamen und Passwort an.", "Probabilmente la tua email è già confermata. Accedi con email o nome utente e password.", "Seu e-mail provavelmente já está confirmado. Entre com seu e-mail ou nome de usuário e sua senha."],
["Cookies and terms", "Cookies et conditions", "Cookies y términos", "Cookies und Bedingungen", "Cookie e termini", "Cookies e termos"],
["We keep your records, saves and settings in this browser so the site works. With your OK we also count which games are played, to make the site better. No ads, nothing is sold.", "Nous gardons vos records, sauvegardes et paramètres dans ce navigateur pour que le site fonctionne. Avec votre accord, nous comptons aussi les jeux joués pour améliorer le site. Pas de publicité, rien n’est vendu.", "Guardamos tus récords, partidas y ajustes en este navegador para que el sitio funcione. Con tu permiso también contamos qué juegos se juegan para mejorar el sitio. Sin anuncios, no se vende nada.", "Wir speichern deine Rekorde, Spielstände und Einstellungen in diesem Browser, damit die Seite funktioniert. Mit deiner Zustimmung zählen wir außerdem, welche Spiele gespielt werden, um die Seite zu verbessern. Keine Werbung, nichts wird verkauft.", "Conserviamo record, salvataggi e impostazioni in questo browser per far funzionare il sito. Con il tuo consenso contiamo anche quali giochi vengono giocati, per migliorare il sito. Niente pubblicità, non vendiamo nulla.", "Guardamos seus recordes, jogos salvos e configurações neste navegador para o site funcionar. Com sua permissão, também contamos quais jogos são jogados para melhorar o site. Sem anúncios, nada é vendido."],
["Accept all", "Tout accepter", "Aceptar todo", "Alle akzeptieren", "Accetta tutto", "Aceitar tudo"],
["Only essentials", "Essentiels uniquement", "Solo esenciales", "Nur notwendige", "Solo essenziali", "Só essenciais"],
["Decline", "Refuser", "Rechazar", "Ablehnen", "Rifiuta", "Recusar"],
["Enjoying {g}?", "Vous aimez {g} ?", "¿Te gusta {g}?", "Gefällt dir {g}?", "Ti piace {g}?", "Estás a gostar de {g}?"],
["I like it", "J’aime", "Me gusta", "Gefällt mir", "Mi piace", "Gosto"],
["Not for me", "Pas pour moi", "No es para mí", "Nicht mein Ding", "Non fa per me", "Não é para mim"],
["Thanks for the feedback!", "Merci pour votre avis !", "¡Gracias por tu opinión!", "Danke für dein Feedback!", "Grazie per il feedback!", "Obrigado pela opinião!"],
["Only for this session", "Seulement pour cette session", "Solo para esta sesión", "Nur für diese Sitzung", "Solo per questa sessione", "Só nesta sessão"],
["Saved for this visit only", "Enregistré pour cette visite uniquement", "Guardado solo para esta visita", "Nur für diesen Besuch gespeichert", "Salvato solo per questa visita", "Guardado só para esta visita"],
["Read the", "Lisez la", "Lee la", "Lies die", "Leggi la", "Leia a"],
[". You can change your choice any time in Cookie settings.", ". Vous pouvez modifier votre choix à tout moment dans Paramètres des cookies.", ". Puedes cambiar tu elección cuando quieras en Configuración de cookies.", ". Du kannst deine Wahl jederzeit in den Cookie-Einstellungen ändern.", ". Puoi cambiare la tua scelta in qualsiasi momento in Impostazioni dei cookie.", ". Você pode mudar sua escolha a qualquer momento em Configurações de cookies."],
["Thanks! Cookie choice saved", "Merci ! Choix des cookies enregistré", "¡Gracias! Preferencia de cookies guardada", "Danke! Cookie-Auswahl gespeichert", "Grazie! Scelta sui cookie salvata", "Obrigado! Escolha de cookies salva"],
["Find players by username", "Trouver des joueurs par nom d’utilisateur", "Buscar jugadores por nombre de usuario", "Spieler nach Benutzername suchen", "Trova giocatori per nome utente", "Encontrar jogadores pelo nome de usuário"],
["Requests", "Demandes", "Solicitudes", "Anfragen", "Richieste", "Pedidos"],
["Friend", "Ami", "Amigo", "Freund", "Amico", "Amigo"],
["Friends are coming soon", "Les amis arrivent bientôt", "Los amigos llegarán pronto", "Freunde kommen bald", "Gli amici arriveranno presto", "Amigos chegam em breve"],
["Log in to add friends", "Connectez-vous pour ajouter des amis", "Inicia sesión para añadir amigos", "Melde dich an, um Freunde hinzuzufügen", "Accedi per aggiungere amici", "Entre para adicionar amigos"],
["Create a free account or log in, then find players by their username.", "Créez un compte gratuit ou connectez-vous, puis trouvez des joueurs par leur nom d’utilisateur.", "Crea una cuenta gratis o inicia sesión y busca jugadores por su nombre de usuario.", "Erstelle ein kostenloses Konto oder melde dich an und finde Spieler über ihren Benutzernamen.", "Crea un account gratuito o accedi, poi trova i giocatori con il loro nome utente.", "Crie uma conta grátis ou entre e encontre jogadores pelo nome de usuário."],
["Type at least 2 letters.", "Tapez au moins 2 lettres.", "Escribe al menos 2 letras.", "Gib mindestens 2 Buchstaben ein.", "Scrivi almeno 2 lettere.", "Digite pelo menos 2 letras."],
["Searching…", "Recherche…", "Buscando…", "Suche…", "Ricerca…", "Pesquisando…"],
["That player was not found", "Ce joueur est introuvable", "No se encontró a ese jugador", "Dieser Spieler wurde nicht gefunden", "Giocatore non trovato", "Esse jogador não foi encontrado"],
["You are already friends", "Vous êtes déjà amis", "Ya sois amigos", "Ihr seid schon befreundet", "Siete già amici", "Vocês já são amigos"],
["Requested", "Demandé", "Solicitado", "Angefragt", "Richiesto", "Solicitado"],
["Sent", "Envoyée", "Enviada", "Gesendet", "Inviata", "Enviado"],
["Remove", "Retirer", "Quitar", "Entfernen", "Rimuovi", "Remover"],
["Click again to remove", "Cliquez à nouveau pour retirer", "Haz clic de nuevo para quitar", "Zum Entfernen erneut klicken", "Clicca di nuovo per rimuovere", "Clique de novo para remover"],
["Too many searches. Wait a moment and try again.", "Trop de recherches. Attendez un instant et réessayez.", "Demasiadas búsquedas. Espera un momento e inténtalo de nuevo.", "Zu viele Suchen. Warte kurz und versuche es erneut.", "Troppe ricerche. Aspetta un attimo e riprova.", "Muitas pesquisas. Aguarde um momento e tente de novo."],
["Could not search. Check your connection and try again.", "Recherche impossible. Vérifiez votre connexion et réessayez.", "No se pudo buscar. Revisa tu conexión e inténtalo de nuevo.", "Suche fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.", "Impossibile cercare. Controlla la connessione e riprova.", "Não foi possível pesquisar. Verifique sua conexão e tente de novo."],
["Could not load your friends. Check your connection and try again.", "Impossible de charger vos amis. Vérifiez votre connexion et réessayez.", "No se pudieron cargar tus amigos. Revisa tu conexión e inténtalo de nuevo.", "Deine Freunde konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare i tuoi amici. Controlla la connessione e riprova.", "Não foi possível carregar seus amigos. Verifique sua conexão e tente de novo."],
["Could not update. Check your connection and try again.", "Mise à jour impossible. Vérifiez votre connexion et réessayez.", "No se pudo actualizar. Revisa tu conexión e inténtalo de nuevo.", "Aktualisierung fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.", "Impossibile aggiornare. Controlla la connessione e riprova.", "Não foi possível atualizar. Verifique sua conexão e tente de novo."],
["Free to play in your browser, no download.", "Gratuit dans votre navigateur, sans téléchargement.", "Gratis en tu navegador, sin descargas.", "Kostenlos im Browser spielbar, ohne Download.", "Gratis nel browser, senza download.", "Grátis no navegador, sem download."],
["Records and saves synced {t}.", "Records et sauvegardes synchronisés à {t}.", "Récords y partidas sincronizados a las {t}.", "Rekorde und Spielstände um {t} synchronisiert.", "Record e salvataggi sincronizzati alle {t}.", "Recordes e jogos salvos sincronizados às {t}."],
["Confirmation code", "Code de confirmation", "Código de confirmación", "Bestätigungscode", "Codice di conferma", "Código de confirmação"],
["Confirm", "Confirmer", "Confirmar", "Bestätigen", "Conferma", "Confirmar"],
["Type the 6-digit code from the email.", "Saisissez le code à 6 chiffres reçu par e-mail.", "Escribe el código de 6 dígitos del correo.", "Gib den 6-stelligen Code aus der E-Mail ein.", "Inserisci il codice di 6 cifre dell’email.", "Digite o código de 6 dígitos do e-mail."],
["Wrong code. Check the newest email and try again.", "Code incorrect. Vérifiez le dernier e-mail et réessayez.", "Código incorrecto. Revisa el correo más reciente e inténtalo de nuevo.", "Falscher Code. Sieh in der neuesten E-Mail nach und versuche es erneut.", "Codice errato. Controlla l’email più recente e riprova.", "Código incorreto. Confira o e-mail mais recente e tente de novo."],
["This code has expired. Click Resend code to get a new one.", "Ce code a expiré. Cliquez sur Renvoyer le code pour en recevoir un nouveau.", "Este código ha caducado. Pulsa Reenviar código para recibir uno nuevo.", "Dieser Code ist abgelaufen. Klicke auf Code erneut senden, um einen neuen zu bekommen.", "Questo codice è scaduto. Clicca su Invia di nuovo il codice per riceverne uno nuovo.", "Este código expirou. Clique em Reenviar código para receber um novo."],
["This code is wrong or has expired. Check the newest email, or click Resend code.", "Ce code est incorrect ou a expiré. Vérifiez le dernier e-mail, ou cliquez sur Renvoyer le code.", "Este código es incorrecto o ha caducado. Revisa el correo más reciente o pulsa Reenviar código.", "Dieser Code ist falsch oder abgelaufen. Sieh in der neuesten E-Mail nach oder klicke auf Code erneut senden.", "Questo codice è errato o scaduto. Controlla l’email più recente, oppure clicca su Invia di nuovo il codice.", "Este código está incorreto ou expirou. Confira o e-mail mais recente ou clique em Reenviar código."],
["Type it below to choose a new password.", "Saisissez-le ci-dessous pour choisir un nouveau mot de passe.", "Escríbelo abajo para elegir una contraseña nueva.", "Gib ihn unten ein, um ein neues Passwort festzulegen.", "Inseriscilo qui sotto per scegliere una nuova password.", "Digite-o abaixo para escolher uma nova senha."],
["Send us a message. Replies show up in Support.", "Envoyez-nous un message. Les réponses s’affichent dans Assistance.", "Envíanos un mensaje. Las respuestas aparecen en Soporte.", "Schreib uns eine Nachricht. Antworten erscheinen unter Support.", "Inviaci un messaggio. Le risposte compaiono in Assistenza.", "Envie uma mensagem para nós. As respostas aparecem em Suporte."],
["Open a support ticket and tell us what happened.", "Ouvrez un ticket et racontez-nous ce qui s’est passé.", "Abre un ticket de soporte y cuéntanos qué pasó.", "Öffne ein Support-Ticket und erzähl uns, was passiert ist.", "Apri un ticket di assistenza e raccontaci cosa è successo.", "Abra um chamado de suporte e conte o que aconteceu."],
["Resend code in {n} s", "Renvoyer le code dans {n} s", "Reenviar código en {n} s", "Code erneut senden in {n} s", "Invia di nuovo il codice tra {n} s", "Reenviar código em {n} s"],
["A friend", "Un ami", "Un amigo", "Ein Freund", "Un amico", "Um amigo"],
["Account deleted", "Compte supprimé", "Cuenta eliminada", "Konto gelöscht", "Account eliminato", "Conta excluída"],
["Accounts with records", "Comptes avec des records", "Cuentas con récords", "Konten mit Rekorden", "Account con record", "Contas com recordes"],
["Active players per day", "Joueurs actifs par jour", "Jugadores activos por día", "Aktive Spieler pro Tag", "Giocatori attivi al giorno", "Jogadores ativos por dia"],
["Add a game key", "Ajouter une touche du jeu", "Añadir una tecla del juego", "Spieltaste hinzufügen", "Aggiungi un tasto del gioco", "Adicionar uma tecla do jogo"],
["Admin stats", "Statistiques admin", "Estadísticas de administración", "Admin-Statistiken", "Statistiche admin", "Estatísticas de administração"],
["All details", "Tous les détails", "Todos los detalles", "Alle Details", "Tutti i dettagli", "Todos os detalhes"],
["Ask to join their party", "Demander à rejoindre son groupe", "Pedir unirte a su grupo", "Beitritt zur Gruppe anfragen", "Chiedi di entrare nel suo gruppo", "Pedir para entrar no grupo"],
["Ask to join · {g}", "Demander à rejoindre · {g}", "Pedir unirte · {g}", "Beitritt anfragen · {g}", "Chiedi di entrare · {g}", "Pedir para entrar · {g}"],
["Avg minutes per visit", "Minutes moy. par visite", "Minutos medios por visita", "Ø Minuten pro Besuch", "Minuti medi per visita", "Minutos médios por visita"],
["Broken?", "Cassé ?", "¿Roto?", "Kaputt?", "Rotto?", "Quebrado?"],
["Browsing", "Navigue sur le site", "Navegando", "Surft", "Sta navigando", "Navegando"],
["browsing", "navigue sur le site", "navegando", "surft", "sta navigando", "navegando"],
["Change controls", "Modifier les commandes", "Cambiar controles", "Steuerung ändern", "Cambia comandi", "Mudar controles"],
["Chat", "Discuter", "Chatear", "Chatten", "Chatta", "Conversar"],
["Check the home page to see them all.", "Allez sur l’accueil pour tous les voir.", "Mira la página de inicio para verlos todos.", "Sieh auf der Startseite nach, um alle zu sehen.", "Vai alla home per vederli tutti.", "Veja a página inicial para conferir todos."],
["Code {c}", "Code {c}", "Código {c}", "Code {c}", "Codice {c}", "Código {c}"],
["Connect a controller (USB or Bluetooth) and press any button.", "Branchez une manette (USB ou Bluetooth) et appuyez sur n’importe quel bouton.", "Conecta un mando (USB o Bluetooth) y pulsa cualquier botón.", "Verbinde einen Controller (USB oder Bluetooth) und drücke eine beliebige Taste.", "Collega un controller (USB o Bluetooth) e premi un tasto qualsiasi.", "Conecte um controle (USB ou Bluetooth) e aperte qualquer botão."],
["Connected: {n}", "Connectée : {n}", "Conectado: {n}", "Verbunden: {n}", "Collegato: {n}", "Conectado: {n}"],
["Controller", "Manette", "Mando", "Controller", "Controller", "Controle"],
["Controller connected", "Manette connectée", "Mando conectado", "Controller verbunden", "Controller collegato", "Controle conectado"],
["Controls · {g}", "Commandes · {g}", "Controles · {g}", "Steuerung · {g}", "Comandi · {g}", "Controles · {g}"],
["Could not load the stats. Check your connection and try again.", "Impossible de charger les statistiques. Vérifiez votre connexion et réessayez.", "No se pudieron cargar las estadísticas. Revisa tu conexión e inténtalo de nuevo.", "Die Statistiken konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare le statistiche. Controlla la connessione e riprova.", "Não foi possível carregar as estatísticas. Verifique sua conexão e tente de novo."],
["Could not load. Check your connection and try again.", "Chargement impossible. Vérifiez votre connexion et réessayez.", "No se pudo cargar. Revisa tu conexión e inténtalo de nuevo.", "Laden fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare. Controlla la connessione e riprova.", "Não foi possível carregar. Verifique sua conexão e tente de novo."],
["Could not send the picture. Try another one.", "Impossible d’envoyer l’image. Essayez-en une autre.", "No se pudo enviar la imagen. Prueba con otra.", "Das Bild konnte nicht gesendet werden. Versuche ein anderes.", "Impossibile inviare l’immagine. Provane un’altra.", "Não foi possível enviar a imagem. Tente outra."],
["Could not send. Check your connection and try again.", "Envoi impossible. Vérifiez votre connexion et réessayez.", "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.", "Senden fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.", "Impossibile inviare. Controlla la connessione e riprova.", "Não foi possível enviar. Verifique sua conexão e tente de novo."],
["D-pad up", "Croix haut", "Cruceta arriba", "Steuerkreuz oben", "Croce direzionale su", "Direcional cima"],
["D-pad down", "Croix bas", "Cruceta abajo", "Steuerkreuz unten", "Croce direzionale giù", "Direcional baixo"],
["D-pad left", "Croix gauche", "Cruceta izquierda", "Steuerkreuz links", "Croce direzionale sinistra", "Direcional esquerda"],
["D-pad right", "Croix droite", "Cruceta derecha", "Steuerkreuz rechts", "Croce direzionale destra", "Direcional direita"],
["Left stick up", "Stick gauche haut", "Stick izquierdo arriba", "Linker Stick oben", "Levetta sinistra su", "Analógico esquerdo cima"],
["Left stick down", "Stick gauche bas", "Stick izquierdo abajo", "Linker Stick unten", "Levetta sinistra giù", "Analógico esquerdo baixo"],
["Left stick left", "Stick gauche à gauche", "Stick izquierdo izquierda", "Linker Stick links", "Levetta sinistra a sinistra", "Analógico esquerdo esquerda"],
["Left stick right", "Stick gauche à droite", "Stick izquierdo derecha", "Linker Stick rechts", "Levetta sinistra a destra", "Analógico esquerdo direita"],
["Left stick press", "Clic stick gauche", "Pulsar stick izquierdo", "Linken Stick drücken", "Pressione levetta sinistra", "Apertar analógico esquerdo"],
["Right stick up", "Stick droit haut", "Stick derecho arriba", "Rechter Stick oben", "Levetta destra su", "Analógico direito cima"],
["Right stick down", "Stick droit bas", "Stick derecho abajo", "Rechter Stick unten", "Levetta destra giù", "Analógico direito baixo"],
["Right stick left", "Stick droit à gauche", "Stick derecho izquierda", "Rechter Stick links", "Levetta destra a sinistra", "Analógico direito esquerda"],
["Right stick right", "Stick droit à droite", "Stick derecho derecha", "Rechter Stick rechts", "Levetta destra a destra", "Analógico direito direita"],
["Right stick press", "Clic stick droit", "Pulsar stick derecho", "Rechten Stick drücken", "Pressione levetta destra", "Apertar analógico direito"],
["Left Shift", "Maj gauche", "Mayús izq.", "Umschalt links", "Maiusc sinistro", "Shift esquerdo"],
["Right Shift", "Maj droite", "Mayús der.", "Umschalt rechts", "Maiusc destro", "Shift direito"],
["Left Ctrl", "Ctrl gauche", "Ctrl izq.", "Strg links", "Ctrl sinistro", "Ctrl esquerdo"],
["Right Ctrl", "Ctrl droite", "Ctrl der.", "Strg rechts", "Ctrl destro", "Ctrl direito"],
["Left Alt", "Alt gauche", "Alt izq.", "Alt links", "Alt sinistro", "Alt esquerdo"],
["Right Alt", "Alt droite", "Alt der.", "Alt rechts", "Alt destro", "Alt direito"],
["Backspace", "Retour arrière", "Retroceso", "Rücktaste", "Backspace", "Backspace"],
["game key", "touche du jeu", "tecla del juego", "Spieltaste", "tasto del gioco", "tecla do jogo"],
["Delete account forever", "Supprimer le compte définitivement", "Eliminar la cuenta para siempre", "Konto endgültig löschen", "Elimina l’account per sempre", "Excluir a conta para sempre"],
["Deletes the account, profile, records, saves, friends and messages for good. This cannot be undone.", "Supprime définitivement le compte, le profil, les records, les sauvegardes, les amis et les messages. Cette action est irréversible.", "Elimina para siempre la cuenta, el perfil, los récords, las partidas guardadas, los amigos y los mensajes. No se puede deshacer.", "Löscht Konto, Profil, Rekorde, Spielstände, Freunde und Nachrichten endgültig. Das kann nicht rückgängig gemacht werden.", "Elimina per sempre account, profilo, record, salvataggi, amici e messaggi. Non si può annullare.", "Exclui para sempre a conta, o perfil, os recordes, os jogos salvos, os amigos e as mensagens. Isso não pode ser desfeito."],
["Devices", "Appareils", "Dispositivos", "Geräte", "Dispositivi", "Dispositivos"],
["Errors 7 days", "Erreurs 7 jours", "Errores 7 días", "Fehler 7 Tage", "Errori 7 giorni", "Erros 7 dias"],
["Games played at least once", "Jeux joués au moins une fois", "Juegos jugados al menos una vez", "Mindestens einmal gespielte Spiele", "Giochi giocati almeno una volta", "Jogos jogados pelo menos uma vez"],
["Games with errors (7 days)", "Jeux avec des erreurs (7 jours)", "Juegos con errores (7 días)", "Spiele mit Fehlern (7 Tage)", "Giochi con errori (7 giorni)", "Jogos com erros (7 dias)"],
["Hidden (hashed). Passwords are stored as one-way hashes, so nobody can see them.", "Masqué (haché). Les mots de passe sont stockés sous forme de hachage à sens unique : personne ne peut les voir.", "Oculta (cifrada con hash). Las contraseñas se guardan como hash de un solo sentido, así que nadie puede verlas.", "Verborgen (gehasht). Passwörter werden als Einweg-Hash gespeichert, niemand kann sie sehen.", "Nascosta (hash). Le password sono salvate come hash a senso unico, quindi nessuno può vederle.", "Oculta (hash). As senhas são guardadas como hash de sentido único, então ninguém pode vê-las."],
["Hours 7 days", "Heures 7 jours", "Horas 7 días", "Stunden 7 Tage", "Ore 7 giorni", "Horas 7 dias"],
["Hours played", "Heures jouées", "Horas jugadas", "Gespielte Stunden", "Ore giocate", "Horas jogadas"],
["Hours played per day", "Heures jouées par jour", "Horas jugadas por día", "Gespielte Stunden pro Tag", "Ore giocate al giorno", "Horas jogadas por dia"],
["Hours played 7 days", "Heures jouées 7 jours", "Horas jugadas 7 días", "Gespielte Stunden 7 Tage", "Ore giocate 7 giorni", "Horas jogadas 7 dias"],
["Invite", "Inviter", "Invitar", "Einladen", "Invita", "Convidar"],
["Invite sent", "Invitation envoyée", "Invitación enviada", "Einladung gesendet", "Invito inviato", "Convite enviado"],
["Invite sent.", "Invitation envoyée.", "Invitación enviada.", "Einladung gesendet.", "Invito inviato.", "Convite enviado."],
["Invite sent to {u}", "Invitation envoyée à {u}", "Invitación enviada a {u}", "Einladung an {u} gesendet", "Invito inviato a {u}", "Convite enviado para {u}"],
["Invite to my party", "Inviter dans mon groupe", "Invitar a mi grupo", "In meine Gruppe einladen", "Invita nel mio gruppo", "Convidar para meu grupo"],
["Invite to my party · {g}", "Inviter dans mon groupe · {g}", "Invitar a mi grupo · {g}", "In meine Gruppe einladen · {g}", "Invita nel mio gruppo · {g}", "Convidar para meu grupo · {g}"],
["Joining the party…", "Connexion au groupe…", "Uniéndote al grupo…", "Trete der Gruppe bei…", "Ingresso nel gruppo…", "Entrando no grupo…"],
["Just added. Be the first to set a record!", "Tout juste ajouté. Soyez le premier à établir un record !", "Recién añadido. ¡Sé el primero en marcar un récord!", "Gerade hinzugefügt. Stell als Erster einen Rekord auf!", "Appena aggiunto. Sii il primo a fare un record!", "Acabou de chegar. Seja o primeiro a bater um recorde!"],
["Last error", "Dernière erreur", "Último error", "Letzter Fehler", "Ultimo errore", "Último erro"],
["Last played", "Dernière partie", "Última partida", "Zuletzt gespielt", "Ultima partita", "Última partida"],
["Launches", "Lancements", "Inicios", "Starts", "Avvii", "Inícios"],
["Launches 7 days", "Lancements 7 jours", "Inicios 7 días", "Starts 7 Tage", "Avvii 7 giorni", "Inícios 7 dias"],
["Game launches 7 days", "Lancements de jeux 7 jours", "Inicios de juegos 7 días", "Spielstarts 7 Tage", "Avvii di giochi 7 giorni", "Inícios de jogos 7 dias"],
["Live now", "En direct", "En directo", "Jetzt live", "Live ora", "Ao vivo agora"],
["Online now", "En ligne maintenant", "En línea ahora", "Jetzt online", "Online ora", "Online agora"],
["Make this admin a regular user first.", "Faites d’abord de cet admin un utilisateur normal.", "Primero convierte a este administrador en usuario normal.", "Mach diesen Admin zuerst zu einem normalen Benutzer.", "Prima rendi questo admin un utente normale.", "Primeiro transforme este administrador em usuário comum."],
["Mark all as read", "Tout marquer comme lu", "Marcar todo como leído", "Alle als gelesen markieren", "Segna tutto come letto", "Marcar tudo como lido"],
["Message {u}", "Message à {u}", "Mensaje para {u}", "Nachricht an {u}", "Messaggio a {u}", "Mensagem para {u}"],
["Messages", "Messages", "Mensajes", "Nachrichten", "Messaggi", "Mensagens"],
["New accounts per day", "Nouveaux comptes par jour", "Cuentas nuevas por día", "Neue Konten pro Tag", "Nuovi account al giorno", "Novas contas por dia"],
["New accounts 7 days", "Nouveaux comptes 7 jours", "Cuentas nuevas 7 días", "Neue Konten 7 Tage", "Nuovi account 7 giorni", "Novas contas 7 dias"],
["Active 7 days", "Actifs 7 jours", "Activos 7 días", "Aktiv 7 Tage", "Attivi 7 giorni", "Ativos 7 dias"],
["Active 30 days", "Actifs 30 jours", "Activos 30 días", "Aktiv 30 Tage", "Attivi 30 giorni", "Ativos 30 dias"],
["Events recorded", "Événements enregistrés", "Eventos registrados", "Erfasste Ereignisse", "Eventi registrati", "Eventos registrados"],
["New game: {g}", "Nouveau jeu : {g}", "Nuevo juego: {g}", "Neues Spiel: {g}", "Nuovo gioco: {g}", "Novo jogo: {g}"],
["No data yet.", "Pas encore de données.", "Aún no hay datos.", "Noch keine Daten.", "Ancora nessun dato.", "Ainda não há dados."],
["No errors. Everything works.", "Aucune erreur. Tout fonctionne.", "Sin errores. Todo funciona.", "Keine Fehler. Alles funktioniert.", "Nessun errore. Funziona tutto.", "Nenhum erro. Tudo funciona."],
["No games played yet.", "Aucun jeu joué pour l’instant.", "Aún no se ha jugado a ningún juego.", "Noch keine Spiele gespielt.", "Nessun gioco giocato finora.", "Nenhum jogo jogado ainda."],
["No notifications yet.", "Pas encore de notifications.", "Aún no hay notificaciones.", "Noch keine Benachrichtigungen.", "Ancora nessuna notifica.", "Nenhuma notificação ainda."],
["Nobody is online right now.", "Personne n’est en ligne pour l’instant.", "No hay nadie en línea ahora mismo.", "Gerade ist niemand online.", "Al momento nessuno è online.", "Ninguém está online agora."],
["None", "Aucune", "Ninguna", "Keine", "Nessuno", "Nenhuma"],
["None · Google only", "Aucun · Google uniquement", "Ninguna · solo Google", "Keins · nur Google", "Nessuna · solo Google", "Nenhuma · só Google"],
["Set · hidden", "Défini · masqué", "Establecida · oculta", "Festgelegt · verborgen", "Impostata · nascosta", "Definida · oculta"],
["Only friends can invite you. Choose Nobody to stop invite pop-ups.", "Seuls vos amis peuvent vous inviter. Choisissez Personne pour ne plus recevoir d’invitations.", "Solo tus amigos pueden invitarte. Elige Nadie para dejar de recibir invitaciones.", "Nur Freunde können dich einladen. Wähle Niemand, um keine Einladungs-Pop-ups mehr zu bekommen.", "Solo gli amici possono invitarti. Scegli Nessuno per non ricevere più inviti.", "Só amigos podem convidar você. Escolha Ninguém para parar os pop-ups de convite."],
["Open online play in a game first", "Lancez d’abord une partie en ligne", "Primero abre el modo en línea de un juego", "Öffne zuerst den Online-Modus eines Spiels", "Prima apri la modalità online di un gioco", "Primeiro abra o modo online de um jogo"],
["Open online play in a game first, then invite your friend.", "Lancez d’abord une partie en ligne, puis invitez votre ami.", "Primero abre el modo en línea de un juego y luego invita a tu amigo.", "Öffne zuerst den Online-Modus eines Spiels und lade dann deinen Freund ein.", "Prima apri la modalità online di un gioco, poi invita il tuo amico.", "Primeiro abra o modo online de um jogo e depois convide seu amigo."],
["Or set a new password yourself:", "Ou définissez vous-même un nouveau mot de passe :", "O establece tú mismo una contraseña nueva:", "Oder lege selbst ein neues Passwort fest:", "Oppure imposta tu una nuova password:", "Ou defina você mesmo uma nova senha:"],
["Pick a key the game uses, then press the key you want to use instead. Keys the game uses appear here after you play it for a moment.", "Choisissez une touche du jeu, puis appuyez sur la touche que vous voulez utiliser à la place. Les touches du jeu apparaissent ici après quelques instants de jeu.", "Elige una tecla del juego y pulsa la tecla que quieras usar en su lugar. Las teclas del juego aparecen aquí después de jugar un rato.", "Wähle eine Taste des Spiels und drücke dann die Taste, die du stattdessen nutzen willst. Die Tasten des Spiels erscheinen hier, nachdem du kurz gespielt hast.", "Scegli un tasto del gioco, poi premi il tasto che vuoi usare al suo posto. I tasti del gioco compaiono qui dopo che ci hai giocato un po’.", "Escolha uma tecla do jogo e aperte a tecla que você quer usar no lugar dela. As teclas do jogo aparecem aqui depois que você joga um pouco."],
["Play the game for a moment, then come back: the keys it uses will show up here.", "Jouez un moment, puis revenez : les touches du jeu s’afficheront ici.", "Juega un rato y vuelve: aquí aparecerán las teclas que usa.", "Spiel kurz und komm dann zurück: Die Tasten des Spiels erscheinen dann hier.", "Gioca un po’, poi torna qui: compariranno i tasti che usa.", "Jogue um pouco e volte: as teclas que ele usa vão aparecer aqui."],
["Press a key…", "Appuyez sur une touche…", "Pulsa una tecla…", "Drücke eine Taste…", "Premi un tasto…", "Aperte uma tecla…"],
["Press the game key…", "Appuyez sur la touche du jeu…", "Pulsa la tecla del juego…", "Drücke die Spieltaste…", "Premi il tasto del gioco…", "Aperte a tecla do jogo…"],
["Reset controller", "Réinitialiser la manette", "Restablecer mando", "Controller zurücksetzen", "Ripristina controller", "Redefinir controle"],
["Reset keyboard", "Réinitialiser le clavier", "Restablecer teclado", "Tastatur zurücksetzen", "Ripristina tastiera", "Redefinir teclado"],
["Picture", "Image", "Imagen", "Bild", "Immagine", "Imagem"],
["Picture not available", "Image indisponible", "Imagen no disponible", "Bild nicht verfügbar", "Immagine non disponibile", "Imagem indisponível"],
["Player", "Joueur", "Jugador", "Spieler", "Giocatore", "Jogador"],
["Players coming back", "Joueurs qui reviennent", "Jugadores que vuelven", "Wiederkehrende Spieler", "Giocatori che tornano", "Jogadores que voltam"],
["Playing {g}", "Joue à {g}", "Jugando a {g}", "Spielt {g}", "Sta giocando a {g}", "Jogando {g}"],
["playing {g}", "joue à {g}", "jugando a {g}", "spielt {g}", "sta giocando a {g}", "jogando {g}"],
["Plays", "Parties", "Partidas", "Runden", "Partite", "Partidas"],
["Recent errors", "Erreurs récentes", "Errores recientes", "Letzte Fehler", "Errori recenti", "Erros recentes"],
["Reply", "Répondre", "Responder", "Antworten", "Rispondi", "Responder"],
["Request sent to {u}", "Demande envoyée à {u}", "Solicitud enviada a {u}", "Anfrage an {u} gesendet", "Richiesta inviata a {u}", "Pedido enviado para {u}"],
["Request sent. You will get an invite when they accept.", "Demande envoyée. Vous recevrez une invitation dès qu’elle sera acceptée.", "Solicitud enviada. Recibirás una invitación cuando la acepte.", "Anfrage gesendet. Du bekommst eine Einladung, sobald sie angenommen wird.", "Richiesta inviata. Riceverai un invito quando la accetta.", "Pedido enviado. Você vai receber um convite quando aceitarem."],
["Rounds played", "Manches jouées", "Rondas jugadas", "Gespielte Runden", "Round giocati", "Rodadas jogadas"],
["Say hi", "Dire bonjour", "Saludar", "Hallo sagen", "Saluta", "Dizer oi"],
["Say hi! Messages are only seen by the two of you.", "Dites bonjour ! Seuls vous deux voyez ces messages.", "¡Saluda! Solo vosotros dos veis los mensajes.", "Sag Hallo! Nur ihr beide seht die Nachrichten.", "Saluta! Solo voi due vedete i messaggi.", "Diga oi! Só vocês dois veem as mensagens."],
["Send a picture", "Envoyer une image", "Enviar una imagen", "Bild senden", "Invia un’immagine", "Enviar uma imagem"],
["Sending the picture…", "Envoi de l’image…", "Enviando la imagen…", "Bild wird gesendet…", "Invio dell’immagine…", "Enviando a imagem…"],
["Sent a picture", "A envoyé une image", "Envió una imagen", "Hat ein Bild gesendet", "Ha inviato un’immagine", "Enviou uma imagem"],
["Send password reset email", "Envoyer l’e-mail de réinitialisation", "Enviar correo para restablecer la contraseña", "E-Mail zum Zurücksetzen des Passworts senden", "Invia email di reimpostazione password", "Enviar e-mail de redefinição de senha"],
["Sent to {e}. They get a 6-digit code to choose a new password.", "Envoyé à {e}. La personne recevra un code à 6 chiffres pour choisir un nouveau mot de passe.", "Enviado a {e}. Recibirá un código de 6 dígitos para elegir una contraseña nueva.", "An {e} gesendet. Die Person bekommt einen 6-stelligen Code, um ein neues Passwort festzulegen.", "Inviata a {e}. Riceverà un codice di 6 cifre per scegliere una nuova password.", "Enviado para {e}. A pessoa recebe um código de 6 dígitos para escolher uma nova senha."],
["Shown in the corner of the screen and in the bell menu.", "Affichées dans le coin de l’écran et dans le menu de la cloche.", "Se muestran en la esquina de la pantalla y en el menú de la campana.", "Werden in der Bildschirmecke und im Glockenmenü angezeigt.", "Mostrate nell’angolo dello schermo e nel menu della campanella.", "Aparecem no canto da tela e no menu do sino."],
["Some errors", "Quelques erreurs", "Algunos errores", "Einige Fehler", "Alcuni errori", "Alguns erros"],
["Working", "Fonctionne", "Funciona", "Funktioniert", "Funziona", "Funcionando"],
["Status", "Statut", "Estado", "Status", "Stato", "Status"],
["That picture is too big. Pick one under 25 MB.", "Cette image est trop lourde. Choisissez-en une de moins de 25 Mo.", "Esa imagen es demasiado grande. Elige una de menos de 25 MB.", "Das Bild ist zu groß. Wähle eins unter 25 MB.", "L’immagine è troppo grande. Scegline una sotto i 25 MB.", "Essa imagem é grande demais. Escolha uma com menos de 25 MB."],
["That username is taken.", "Ce nom d’utilisateur est déjà pris.", "Ese nombre de usuario está ocupado.", "Dieser Benutzername ist vergeben.", "Questo nome utente è già preso.", "Esse nome de usuário já está em uso."],
["They are not playing right now", "Ne joue pas en ce moment", "No está jugando ahora", "Spielt gerade nicht", "Non sta giocando adesso", "Não está jogando agora"],
["This account has no password: it signs in with Google.", "Ce compte n’a pas de mot de passe : il se connecte avec Google.", "Esta cuenta no tiene contraseña: inicia sesión con Google.", "Dieses Konto hat kein Passwort: Es meldet sich mit Google an.", "Questo account non ha password: accede con Google.", "Esta conta não tem senha: ela entra com o Google."],
["This account was deleted", "Ce compte a été supprimé", "Esta cuenta se ha eliminado", "Dieses Konto wurde gelöscht", "Questo account è stato eliminato", "Esta conta foi excluída"],
["Time played per player", "Temps de jeu par joueur", "Tiempo jugado por jugador", "Spielzeit pro Spieler", "Tempo di gioco per giocatore", "Tempo jogado por jogador"],
["Top searches", "Recherches populaires", "Búsquedas más frecuentes", "Häufigste Suchen", "Ricerche più frequenti", "Pesquisas mais feitas"],
["Type the username or email exactly to confirm.", "Saisissez exactement le nom d’utilisateur ou l’e-mail pour confirmer.", "Escribe exactamente el nombre de usuario o el correo para confirmar.", "Gib zur Bestätigung genau den Benutzernamen oder die E-Mail ein.", "Inserisci esattamente il nome utente o l’email per confermare.", "Digite exatamente o nome de usuário ou o e-mail para confirmar."],
["Type the username or email to confirm", "Saisissez le nom d’utilisateur ou l’e-mail pour confirmer", "Escribe el nombre de usuario o el correo para confirmar", "Gib zur Bestätigung den Benutzernamen oder die E-Mail ein", "Inserisci il nome utente o l’email per confermare", "Digite o nome de usuário ou o e-mail para confirmar"],
["Updated {t}. Refreshes every 30 seconds; the live list updates instantly.", "Mis à jour à {t}. Actualisation toutes les 30 secondes ; la liste en direct se met à jour instantanément.", "Actualizado a las {t}. Se actualiza cada 30 segundos; la lista en directo, al instante.", "Aktualisiert um {t}. Wird alle 30 Sekunden aktualisiert, die Live-Liste sofort.", "Aggiornato alle {t}. Si aggiorna ogni 30 secondi; l’elenco live si aggiorna subito.", "Atualizado às {t}. Atualiza a cada 30 segundos; a lista ao vivo atualiza na hora."],
["When a friend invites you to play or asks to join you.", "Quand un ami vous invite à jouer ou demande à vous rejoindre.", "Cuando un amigo te invita a jugar o pide unirse a ti.", "Wenn ein Freund dich zum Spielen einlädt oder dir beitreten will.", "Quando un amico ti invita a giocare o chiede di unirsi a te.", "Quando um amigo convida você para jogar ou pede para entrar com você."],
["When a friend opens the site.", "Quand un ami ouvre le site.", "Cuando un amigo abre el sitio.", "Wenn ein Freund die Seite öffnet.", "Quando un amico apre il sito.", "Quando um amigo abre o site."],
["When a friend sends you a message or a picture.", "Quand un ami vous envoie un message ou une image.", "Cuando un amigo te envía un mensaje o una imagen.", "Wenn ein Freund dir eine Nachricht oder ein Bild schickt.", "Quando un amico ti invia un messaggio o un’immagine.", "Quando um amigo envia uma mensagem ou uma imagem para você."],
["When new games are added to the site.", "Quand de nouveaux jeux sont ajoutés au site.", "Cuando se añaden juegos nuevos al sitio.", "Wenn neue Spiele zur Seite hinzugefügt werden.", "Quando vengono aggiunti nuovi giochi al sito.", "Quando novos jogos são adicionados ao site."],
["You asked to join {u}", "Vous avez demandé à rejoindre {u}", "Pediste unirte a {u}", "Du hast {u} um Beitritt gebeten", "Hai chiesto di unirti a {u}", "Você pediu para entrar com {u}"],
["You can only chat with friends", "Vous ne pouvez discuter qu’avec vos amis", "Solo puedes chatear con amigos", "Du kannst nur mit Freunden chatten", "Puoi chattare solo con gli amici", "Você só pode conversar com amigos"],
["You cannot delete your own account here.", "Vous ne pouvez pas supprimer votre propre compte ici.", "No puedes eliminar tu propia cuenta aquí.", "Du kannst dein eigenes Konto hier nicht löschen.", "Non puoi eliminare il tuo account da qui.", "Você não pode excluir sua própria conta aqui."],
["You invited {u} to your party", "Vous avez invité {u} dans votre groupe", "Invitaste a {u} a tu grupo", "Du hast {u} in deine Gruppe eingeladen", "Hai invitato {u} nel tuo gruppo", "Você convidou {u} para o seu grupo"],
["You are no longer friends.", "Vous n’êtes plus amis.", "Ya no sois amigos.", "Ihr seid nicht mehr befreundet.", "Non siete più amici.", "Vocês não são mais amigos."],
["Your friends see a green dot when you are online.", "Vos amis voient un point vert quand vous êtes en ligne.", "Tus amigos ven un punto verde cuando estás en línea.", "Deine Freunde sehen einen grünen Punkt, wenn du online bist.", "I tuoi amici vedono un pallino verde quando sei online.", "Seus amigos veem um ponto verde quando você está online."],
["best {s}", "record {s}", "récord {s}", "Rekord {s}", "record {s}", "recorde {s}"],
["last seen {t}", "vu {t}", "visto {t}", "zuletzt gesehen {t}", "visto {t}", "visto {t}"],
["max {n}", "max {n}", "máx. {n}", "max. {n}", "max {n}", "máx. {n}"],
["next day {a}% · week {b}%", "lendemain {a} % · semaine {b} %", "día siguiente {a}% · semana {b}%", "nächster Tag {a} % · Woche {b} %", "giorno dopo {a}% · settimana {b}%", "dia seguinte {a}% · semana {b}%"],
["hidden from friends", "masqué aux amis", "oculto a los amigos", "für Freunde verborgen", "nascosto agli amici", "oculto dos amigos"],
["no result", "aucun résultat", "sin resultados", "kein Ergebnis", "nessun risultato", "sem resultado"],
["online", "en ligne", "en línea", "online", "online", "online"],
["1 player online", "1 joueur en ligne", "1 jugador en línea", "1 Spieler online", "1 giocatore online", "1 jogador online"],
["{n} players online", "{n} joueurs en ligne", "{n} jugadores en línea", "{n} Spieler online", "{n} giocatori online", "{n} jogadores online"],
["{n} new", "{n} nouveaux", "{n} nuevos", "{n} neu", "{n} nuovi", "{n} novos"],
["{n} new games", "{n} nouveaux jeux", "{n} juegos nuevos", "{n} neue Spiele", "{n} nuovi giochi", "{n} jogos novos"],
["{n} playing", "{n} en jeu", "{n} jugando", "{n} spielen", "{n} in gioco", "{n} jogando"],
["{n} plays", "{n} parties", "{n} partidas", "{n} Runden", "{n} partite", "{n} partidas"],
["{u} invited you to play", "{u} vous invite à jouer", "{u} te invitó a jugar", "{u} hat dich zum Spielen eingeladen", "{u} ti ha invitato a giocare", "{u} convidou você para jogar"],
["{u} invited you to their party", "{u} vous a invité dans son groupe", "{u} te invitó a su grupo", "{u} hat dich in die Gruppe eingeladen", "{u} ti ha invitato nel suo gruppo", "{u} convidou você para o grupo"],
["{u} is online", "{u} est en ligne", "{u} está en línea", "{u} ist online", "{u} è online", "{u} está online"],
["{u} sent you a friend request", "{u} vous a envoyé une demande d’ami", "{u} te envió una solicitud de amistad", "{u} hat dir eine Freundschaftsanfrage geschickt", "{u} ti ha inviato una richiesta di amicizia", "{u} enviou um pedido de amizade"],
["{u} wants to join your party", "{u} veut rejoindre votre groupe", "{u} quiere unirse a tu grupo", "{u} möchte deiner Gruppe beitreten", "{u} vuole entrare nel tuo gruppo", "{u} quer entrar no seu grupo"],
["Logged in as {name}", "Connecté en tant que {name}", "Sesión iniciada como {name}", "Angemeldet als {name}", "Accesso eseguito come {name}", "Conectado como {name}"],
["{n}+ players", "{n}+ joueurs", "{n}+ jugadores", "{n}+ Spieler", "{n}+ giocatori", "{n}+ jogadores"],
["1 player", "1 joueur", "1 jugador", "1 Spieler", "1 giocatore", "1 jogador"],
["No player has a username starting with “{q}”.", "Aucun joueur n’a de nom d’utilisateur commençant par « {q} ».", "Ningún jugador tiene un nombre de usuario que empiece por «{q}».", "Kein Spieler hat einen Benutzernamen, der mit „{q}“ beginnt.", "Nessun giocatore ha un nome utente che inizia con «{q}».", "Nenhum jogador tem nome de usuário começando com “{q}”."],
["You are now friends with {u}", "Vous êtes maintenant ami avec {u}", "Ahora eres amigo de {u}", "Du bist jetzt mit {u} befreundet", "Ora sei amico di {u}", "Agora você é amigo de {u}"],
["Friend request sent to {u}", "Demande d’ami envoyée à {u}", "Solicitud de amistad enviada a {u}", "Freundschaftsanfrage an {u} gesendet", "Richiesta di amicizia inviata a {u}", "Pedido de amizade enviado para {u}"],
["{u} was removed from your friends", "{u} a été retiré de vos amis", "{u} se eliminó de tus amigos", "{u} wurde aus deinen Freunden entfernt", "{u} è stato rimosso dai tuoi amici", "{u} foi removido dos seus amigos"],
["These terms apply when you use gameplay, a free website of browser games. By playing on the site you agree to them. If you do not agree, please do not use the site.", "Ces conditions s’appliquent lorsque vous utilisez gameplay, un site gratuit de jeux par navigateur. En jouant sur le site, vous les acceptez. Si vous n’êtes pas d’accord, merci de ne pas utiliser le site.", "Estos términos se aplican cuando usas gameplay, un sitio web gratuito de juegos para el navegador. Al jugar en el sitio los aceptas. Si no estás de acuerdo, no uses el sitio.", "Diese Bedingungen gelten, wenn du gameplay nutzt, eine kostenlose Website mit Browserspielen. Wenn du auf der Seite spielst, stimmst du ihnen zu. Wenn du nicht einverstanden bist, nutze die Seite bitte nicht.", "Questi termini si applicano quando usi gameplay, un sito gratuito di giochi per browser. Giocando sul sito li accetti. Se non sei d’accordo, non usare il sito.", "Estes termos se aplicam quando você usa o gameplay, um site gratuito de jogos de navegador. Ao jogar no site, você os aceita. Se não concordar, não use o site."],
["1. What gameplay is", "1. Ce qu’est gameplay", "1. Qué es gameplay", "1. Was gameplay ist", "1. Che cos’è gameplay", "1. O que é o gameplay"],
["gameplay is a fan-made, non-commercial hobby project. Most games are remakes inspired by well-known games. gameplay is not affiliated with, endorsed by or sponsored by the creators, publishers or owners of the original games. Game names are used only to say which game a remake is inspired by. All trademarks and original works belong to their owners.", "gameplay est un projet de loisir non commercial, créé par des fans. La plupart des jeux sont des remakes inspirés de jeux connus. gameplay n’est ni affilié, ni approuvé, ni sponsorisé par les créateurs, éditeurs ou propriétaires des jeux originaux. Les noms des jeux servent uniquement à indiquer de quel jeu un remake s’inspire. Toutes les marques et œuvres originales appartiennent à leurs propriétaires.", "gameplay es un proyecto aficionado, hecho por fans y sin fines comerciales. La mayoría de los juegos son remakes inspirados en juegos conocidos. gameplay no está afiliado, respaldado ni patrocinado por los creadores, editores o propietarios de los juegos originales. Los nombres de los juegos solo se usan para indicar en qué juego se inspira cada remake. Todas las marcas y obras originales pertenecen a sus propietarios.", "gameplay ist ein nicht kommerzielles Hobbyprojekt von Fans. Die meisten Spiele sind Remakes, die von bekannten Spielen inspiriert sind. gameplay ist nicht mit den Entwicklern, Publishern oder Rechteinhabern der Originalspiele verbunden und wird von ihnen weder unterstützt noch gesponsert. Spielnamen werden nur genannt, um zu zeigen, von welchem Spiel ein Remake inspiriert ist. Alle Marken und Originalwerke gehören ihren Inhabern.", "gameplay è un progetto amatoriale, creato da fan e senza scopo di lucro. La maggior parte dei giochi sono remake ispirati a giochi famosi. gameplay non è affiliato, approvato né sponsorizzato dai creatori, editori o proprietari dei giochi originali. I nomi dei giochi servono solo a indicare a quale gioco si ispira un remake. Tutti i marchi e le opere originali appartengono ai rispettivi proprietari.", "O gameplay é um projeto amador, feito por fãs e sem fins comerciais. A maioria dos jogos são remakes inspirados em jogos conhecidos. O gameplay não é afiliado, endossado nem patrocinado pelos criadores, editoras ou donos dos jogos originais. Os nomes dos jogos são usados apenas para indicar em qual jogo cada remake se inspira. Todas as marcas e obras originais pertencem aos seus donos."],
["2. Using the site", "2. Utilisation du site", "2. Uso del sitio", "2. Nutzung der Seite", "2. Uso del sito", "2. Uso do site"],
["The site is free and for personal, non-commercial use.", "Le site est gratuit et réservé à un usage personnel et non commercial.", "El sitio es gratuito y para uso personal, no comercial.", "Die Seite ist kostenlos und für die private, nicht kommerzielle Nutzung bestimmt.", "Il sito è gratuito e destinato a un uso personale e non commerciale.", "O site é gratuito e para uso pessoal, não comercial."],
["Do not try to break, overload, copy at scale or misuse the site, and do not use it to cheat or harm other players.", "N’essayez pas de casser, surcharger, copier en masse ou détourner le site, et ne l’utilisez pas pour tricher ou nuire à d’autres joueurs.", "No intentes romper, sobrecargar, copiar a gran escala ni hacer un mal uso del sitio, y no lo uses para hacer trampas ni perjudicar a otros jugadores.", "Versuche nicht, die Seite zu beschädigen, zu überlasten, in großem Umfang zu kopieren oder zu missbrauchen, und nutze sie nicht, um zu schummeln oder anderen Spielern zu schaden.", "Non cercare di danneggiare, sovraccaricare, copiare su larga scala o usare in modo improprio il sito, e non usarlo per barare o danneggiare altri giocatori.", "Não tente quebrar, sobrecarregar, copiar em massa ou usar o site de forma indevida, e não o use para trapacear ou prejudicar outros jogadores."],
["Some versions of the site are protected by a password. Do not share it publicly.", "Certaines versions du site sont protégées par un mot de passe. Ne le partagez pas publiquement.", "Algunas versiones del sitio están protegidas con contraseña. No la compartas públicamente.", "Einige Versionen der Seite sind durch ein Passwort geschützt. Teile es nicht öffentlich.", "Alcune versioni del sito sono protette da password. Non condividerla pubblicamente.", "Algumas versões do site são protegidas por senha. Não a compartilhe publicamente."],
["3. Online play", "3. Jeu en ligne", "3. Juego en línea", "3. Online spielen", "3. Gioco online", "3. Jogo online"],
["Online games connect you directly to the other players in your party using a party code. Be respectful: no harassment, hate, threats, spam or sharing other people's personal information. Do not share your own personal details in names or chat. The host of a party can remove players, and you can leave a party at any time.", "Les jeux en ligne vous connectent directement aux autres joueurs de votre groupe grâce à un code de groupe. Soyez respectueux : pas de harcèlement, de haine, de menaces, de spam ni de partage des informations personnelles d’autrui. Ne partagez pas vos propres informations personnelles dans les noms ou le chat. L’hôte d’un groupe peut retirer des joueurs, et vous pouvez quitter un groupe à tout moment.", "Los juegos en línea te conectan directamente con los demás jugadores de tu grupo mediante un código de grupo. Sé respetuoso: nada de acoso, odio, amenazas, spam ni compartir información personal de otras personas. No compartas tus propios datos personales en nombres ni en el chat. El anfitrión de un grupo puede expulsar jugadores y tú puedes salir de un grupo en cualquier momento.", "Online-Spiele verbinden dich über einen Gruppencode direkt mit den anderen Spielern deiner Gruppe. Sei respektvoll: keine Belästigung, kein Hass, keine Drohungen, kein Spam und keine Weitergabe persönlicher Daten anderer. Teile keine eigenen persönlichen Daten in Namen oder im Chat. Der Host einer Gruppe kann Spieler entfernen, und du kannst eine Gruppe jederzeit verlassen.", "I giochi online ti collegano direttamente agli altri giocatori del tuo gruppo tramite un codice gruppo. Sii rispettoso: niente molestie, odio, minacce, spam o condivisione di informazioni personali altrui. Non condividere i tuoi dati personali nei nomi o in chat. L’host di un gruppo può rimuovere giocatori e tu puoi lasciare un gruppo in qualsiasi momento.", "Os jogos online conectam você diretamente aos outros jogadores do seu grupo usando um código de grupo. Seja respeitoso: nada de assédio, ódio, ameaças, spam ou compartilhamento de informações pessoais de outras pessoas. Não compartilhe seus próprios dados pessoais em nomes ou no chat. O anfitrião de um grupo pode remover jogadores, e você pode sair de um grupo a qualquer momento."],
["4. Names and messages", "4. Noms et messages", "4. Nombres y mensajes", "4. Namen und Nachrichten", "4. Nomi e messaggi", "4. Nomes e mensagens"],
["Your username, display name and chat messages must not be offensive, misleading or impersonate someone else. We may block names or content that break these terms.", "Votre nom d’utilisateur, votre nom affiché et vos messages de chat ne doivent pas être offensants, trompeurs ni usurper l’identité de quelqu’un. Nous pouvons bloquer les noms ou contenus qui enfreignent ces conditions.", "Tu nombre de usuario, tu nombre visible y tus mensajes de chat no deben ser ofensivos, engañosos ni suplantar a otra persona. Podemos bloquear nombres o contenidos que incumplan estos términos.", "Dein Benutzername, dein Anzeigename und deine Chatnachrichten dürfen nicht beleidigend oder irreführend sein und niemanden nachahmen. Wir können Namen oder Inhalte sperren, die gegen diese Bedingungen verstoßen.", "Il tuo nome utente, il nome visualizzato e i messaggi in chat non devono essere offensivi, ingannevoli né impersonare altre persone. Possiamo bloccare nomi o contenuti che violano questi termini.", "Seu nome de usuário, nome de exibição e mensagens de chat não podem ser ofensivos, enganosos nem se passar por outra pessoa. Podemos bloquear nomes ou conteúdos que violem estes termos."],
["5. Accounts", "5. Comptes", "5. Cuentas", "5. Konten", "5. Account", "5. Contas"],
["Today you play without an account and your data stays in your browser. We plan to add optional sign-in with Google. When we do, these terms will be updated.", "Pour l’instant, vous jouez sans compte et vos données restent dans votre navigateur. Nous prévoyons d’ajouter une connexion facultative avec Google. Ces conditions seront alors mises à jour.", "Hoy juegas sin cuenta y tus datos se quedan en tu navegador. Tenemos previsto añadir un inicio de sesión opcional con Google. Cuando lo hagamos, actualizaremos estos términos.", "Derzeit spielst du ohne Konto und deine Daten bleiben in deinem Browser. Wir planen eine optionale Anmeldung mit Google. Dann werden diese Bedingungen aktualisiert.", "Oggi giochi senza account e i tuoi dati restano nel browser. Prevediamo di aggiungere un accesso facoltativo con Google. Quando succederà, questi termini verranno aggiornati.", "Hoje você joga sem conta e seus dados ficam no seu navegador. Planejamos adicionar um login opcional com o Google. Quando isso acontecer, estes termos serão atualizados."],
["An account is optional. You can sign in with Google or with an email address and a password. Keep your password safe and do not share your account. You can delete your account at any time in Settings, Account. We may suspend accounts that break these terms.", "Un compte est facultatif. Vous pouvez vous connecter avec Google ou avec une adresse e-mail et un mot de passe. Gardez votre mot de passe en sécurité et ne partagez pas votre compte. Vous pouvez supprimer votre compte à tout moment dans Paramètres, Compte. Nous pouvons suspendre les comptes qui enfreignent ces conditions.", "Tener una cuenta es opcional. Puedes iniciar sesión con Google o con un correo y una contraseña. Mantén tu contraseña a salvo y no compartas tu cuenta. Puedes eliminar tu cuenta cuando quieras en Ajustes, Cuenta. Podemos suspender las cuentas que incumplan estos términos.", "Ein Konto ist optional. Du kannst dich mit Google oder mit E-Mail-Adresse und Passwort anmelden. Halte dein Passwort geheim und teile dein Konto nicht. Du kannst dein Konto jederzeit unter Einstellungen, Konto löschen. Wir können Konten sperren, die gegen diese Bedingungen verstoßen.", "L’account è facoltativo. Puoi accedere con Google oppure con un indirizzo email e una password. Tieni al sicuro la password e non condividere l’account. Puoi eliminare l’account in qualsiasi momento in Impostazioni, Account. Possiamo sospendere gli account che violano questi termini.", "Ter uma conta é opcional. Você pode entrar com o Google ou com um endereço de e-mail e uma senha. Mantenha sua senha segura e não compartilhe sua conta. Você pode excluir sua conta a qualquer momento em Configurações, Conta. Podemos suspender contas que violem estes termos."],
["6. Your data on this device", "6. Vos données sur cet appareil", "6. Tus datos en este dispositivo", "6. Deine Daten auf diesem Gerät", "6. I tuoi dati su questo dispositivo", "6. Seus dados neste dispositivo"],
["Records, saves and settings are kept in your browser. Clearing your browser data, using private browsing or switching devices can remove them. We cannot restore data that was stored only on your device.", "Les records, sauvegardes et paramètres sont conservés dans votre navigateur. Effacer les données du navigateur, utiliser la navigation privée ou changer d’appareil peut les supprimer. Nous ne pouvons pas restaurer des données stockées uniquement sur votre appareil.", "Los récords, partidas guardadas y ajustes se guardan en tu navegador. Borrar los datos del navegador, usar la navegación privada o cambiar de dispositivo puede eliminarlos. No podemos recuperar datos que solo estaban guardados en tu dispositivo.", "Rekorde, Spielstände und Einstellungen werden in deinem Browser gespeichert. Wenn du Browserdaten löschst, privat surfst oder das Gerät wechselst, können sie verloren gehen. Daten, die nur auf deinem Gerät gespeichert waren, können wir nicht wiederherstellen.", "Record, salvataggi e impostazioni sono conservati nel browser. Cancellare i dati del browser, usare la navigazione privata o cambiare dispositivo può eliminarli. Non possiamo ripristinare dati salvati solo sul tuo dispositivo.", "Recordes, jogos salvos e configurações ficam no seu navegador. Limpar os dados do navegador, usar a navegação privada ou trocar de dispositivo pode apagá-los. Não podemos restaurar dados que estavam salvos apenas no seu dispositivo."],
["Records, saves and settings are kept in your browser. If you sign in, your records and saves are also copied to your account. Clearing your browser data, using private browsing or switching devices can remove them. We cannot restore data that was stored only on your device.", "Les records, sauvegardes et paramètres sont conservés dans votre navigateur. Si vous vous connectez, vos records et sauvegardes sont aussi copiés dans votre compte. Effacer les données du navigateur, utiliser la navigation privée ou changer d’appareil peut les supprimer. Nous ne pouvons pas restaurer des données stockées uniquement sur votre appareil.", "Los récords, partidas guardadas y ajustes se guardan en tu navegador. Si inicias sesión, tus récords y partidas también se copian en tu cuenta. Borrar los datos del navegador, usar la navegación privada o cambiar de dispositivo puede eliminarlos. No podemos recuperar datos que solo estaban guardados en tu dispositivo.", "Rekorde, Spielstände und Einstellungen werden in deinem Browser gespeichert. Wenn du angemeldet bist, werden deine Rekorde und Spielstände auch in dein Konto kopiert. Wenn du Browserdaten löschst, privat surfst oder das Gerät wechselst, können sie verloren gehen. Daten, die nur auf deinem Gerät gespeichert waren, können wir nicht wiederherstellen.", "Record, salvataggi e impostazioni sono conservati nel browser. Se accedi, record e salvataggi vengono copiati anche nel tuo account. Cancellare i dati del browser, usare la navigazione privata o cambiare dispositivo può eliminarli. Non possiamo ripristinare dati salvati solo sul tuo dispositivo.", "Recordes, jogos salvos e configurações ficam no seu navegador. Se você entrar, seus recordes e jogos salvos também são copiados para sua conta. Limpar os dados do navegador, usar a navegação privada ou trocar de dispositivo pode apagá-los. Não podemos restaurar dados que estavam salvos apenas no seu dispositivo."],
["7. No warranty", "7. Absence de garantie", "7. Sin garantía", "7. Keine Gewährleistung", "7. Nessuna garanzia", "7. Sem garantia"],
["The site is provided \"as is\" and \"as available\". Games can change, move or be removed at any time, and the site may sometimes be unavailable or contain bugs.", "Le site est fourni « tel quel » et « selon disponibilité ». Les jeux peuvent changer, être déplacés ou supprimés à tout moment, et le site peut parfois être indisponible ou contenir des bugs.", "El sitio se ofrece «tal cual» y «según disponibilidad». Los juegos pueden cambiar, moverse o eliminarse en cualquier momento, y el sitio puede no estar disponible a veces o contener errores.", "Die Seite wird „wie besehen“ und „wie verfügbar“ bereitgestellt. Spiele können sich jederzeit ändern, verschoben oder entfernt werden, und die Seite kann manchmal nicht erreichbar sein oder Fehler enthalten.", "Il sito è fornito «così com’è» e «come disponibile». I giochi possono cambiare, essere spostati o rimossi in qualsiasi momento e il sito può a volte non essere disponibile o contenere bug.", "O site é fornecido “no estado em que se encontra” e “conforme disponível”. Os jogos podem mudar, ser movidos ou removidos a qualquer momento, e o site pode às vezes ficar indisponível ou ter bugs."],
["8. Liability", "8. Responsabilité", "8. Responsabilidad", "8. Haftung", "8. Responsabilità", "8. Responsabilidade"],
["To the extent the law allows, the people who run gameplay are not liable for indirect or consequential losses, or for loss of data, arising from your use of the site. Nothing in these terms limits liability that cannot be limited by law.", "Dans les limites permises par la loi, les personnes qui gèrent gameplay ne sont pas responsables des pertes indirectes ou consécutives, ni des pertes de données, liées à votre utilisation du site. Rien dans ces conditions ne limite une responsabilité qui ne peut pas être limitée par la loi.", "En la medida en que la ley lo permita, las personas que gestionan gameplay no son responsables de pérdidas indirectas o derivadas, ni de pérdidas de datos, que resulten de tu uso del sitio. Nada en estos términos limita la responsabilidad que la ley no permite limitar.", "Soweit gesetzlich zulässig, haften die Betreiber von gameplay nicht für indirekte Schäden, Folgeschäden oder Datenverluste, die durch die Nutzung der Seite entstehen. Nichts in diesen Bedingungen beschränkt eine Haftung, die gesetzlich nicht beschränkt werden kann.", "Nei limiti consentiti dalla legge, chi gestisce gameplay non è responsabile di perdite indirette o consequenziali, né della perdita di dati, derivanti dall’uso del sito. Nulla in questi termini limita una responsabilità che per legge non può essere limitata.", "Na medida em que a lei permitir, as pessoas que administram o gameplay não são responsáveis por perdas indiretas ou consequentes, nem por perda de dados, decorrentes do seu uso do site. Nada nestes termos limita uma responsabilidade que a lei não permita limitar."],
["9. Rights holders", "9. Titulaires de droits", "9. Titulares de derechos", "9. Rechteinhaber", "9. Titolari dei diritti", "9. Titulares de direitos"],
["If you own the rights to a game, name or artwork and want something changed or removed, contact us and we will act promptly.", "Si vous détenez les droits d’un jeu, d’un nom ou d’une illustration et souhaitez qu’un élément soit modifié ou retiré, contactez-nous et nous agirons rapidement.", "Si tienes los derechos de un juego, nombre o ilustración y quieres que se cambie o retire algo, contáctanos y actuaremos con rapidez.", "Wenn du die Rechte an einem Spiel, Namen oder Kunstwerk besitzt und etwas geändert oder entfernt haben möchtest, kontaktiere uns und wir handeln umgehend.", "Se possiedi i diritti di un gioco, di un nome o di un’opera grafica e vuoi che qualcosa venga modificato o rimosso, contattaci e interverremo rapidamente.", "Se você detém os direitos de um jogo, nome ou arte e quer que algo seja alterado ou removido, fale conosco e agiremos rapidamente."],
["10. Changes", "10. Modifications", "10. Cambios", "10. Änderungen", "10. Modifiche", "10. Alterações"],
["We may update these terms. The date at the top shows the latest version. If you keep using the site after a change, the new terms apply.", "Nous pouvons mettre à jour ces conditions. La date en haut indique la dernière version. Si vous continuez à utiliser le site après une modification, les nouvelles conditions s’appliquent.", "Podemos actualizar estos términos. La fecha de arriba indica la última versión. Si sigues usando el sitio después de un cambio, se aplican los nuevos términos.", "Wir können diese Bedingungen aktualisieren. Das Datum oben zeigt die neueste Version. Wenn du die Seite nach einer Änderung weiter nutzt, gelten die neuen Bedingungen.", "Possiamo aggiornare questi termini. La data in alto indica l’ultima versione. Se continui a usare il sito dopo una modifica, si applicano i nuovi termini.", "Podemos atualizar estes termos. A data no topo mostra a versão mais recente. Se você continuar usando o site após uma alteração, os novos termos se aplicam."],
["11. Contact", "11. Contact", "11. Contacto", "11. Kontakt", "11. Contatti", "11. Contato"],
["Questions, requests about your data, or a rights holder asking for a change: email", "Questions, demandes concernant vos données ou titulaire de droits souhaitant une modification : écrivez à", "Preguntas, solicitudes sobre tus datos o titulares de derechos que pidan un cambio: escribe a", "Fragen, Anfragen zu deinen Daten oder Rechteinhaber, die eine Änderung wünschen: E-Mail an", "Domande, richieste sui tuoi dati o titolari dei diritti che chiedono una modifica: scrivi a", "Dúvidas, pedidos sobre seus dados ou titulares de direitos pedindo uma alteração: escreva para"],
["In short: you do not need an account, there are no ads, we do not sell data, and what the site remembers about you is stored in your own browser.", "En bref : vous n’avez pas besoin de compte, il n’y a pas de publicité, nous ne vendons pas de données, et ce que le site retient de vous est stocké dans votre propre navigateur.", "En resumen: no necesitas cuenta, no hay anuncios, no vendemos datos y lo que el sitio recuerda de ti se guarda en tu propio navegador.", "Kurz gesagt: Du brauchst kein Konto, es gibt keine Werbung, wir verkaufen keine Daten, und was die Seite über dich speichert, liegt in deinem eigenen Browser.", "In breve: non ti serve un account, non ci sono pubblicità, non vendiamo dati e ciò che il sito ricorda di te è salvato nel tuo browser.", "Em resumo: você não precisa de conta, não há anúncios, não vendemos dados e o que o site lembra sobre você fica salvo no seu próprio navegador."],
["In short: you do not need an account, there are no ads and we do not sell data. Without an account, what the site remembers about you is stored in your own browser. If you sign in, your profile, records and saves are also kept in our database so you can use them on every device.", "En bref : vous n’avez pas besoin de compte, il n’y a pas de publicité et nous ne vendons pas de données. Sans compte, ce que le site retient de vous est stocké dans votre propre navigateur. Si vous vous connectez, votre profil, vos records et vos sauvegardes sont aussi conservés dans notre base de données pour que vous les retrouviez sur tous vos appareils.", "En resumen: no necesitas cuenta, no hay anuncios y no vendemos datos. Sin cuenta, lo que el sitio recuerda de ti se guarda en tu propio navegador. Si inicias sesión, tu perfil, récords y partidas guardadas también se conservan en nuestra base de datos para que puedas usarlos en todos tus dispositivos.", "Kurz gesagt: Du brauchst kein Konto, es gibt keine Werbung und wir verkaufen keine Daten. Ohne Konto liegt, was die Seite über dich speichert, in deinem eigenen Browser. Wenn du dich anmeldest, werden dein Profil, deine Rekorde und Spielstände auch in unserer Datenbank gespeichert, damit du sie auf allen Geräten nutzen kannst.", "In breve: non ti serve un account, non ci sono pubblicità e non vendiamo dati. Senza account, ciò che il sito ricorda di te è salvato nel tuo browser. Se accedi, profilo, record e salvataggi sono conservati anche nel nostro database, così puoi usarli su ogni dispositivo.", "Em resumo: você não precisa de conta, não há anúncios e não vendemos dados. Sem conta, o que o site lembra sobre você fica salvo no seu próprio navegador. Se você entrar, seu perfil, recordes e jogos salvos também ficam no nosso banco de dados para você usá-los em todos os dispositivos."],
["What is stored on your device", "Ce qui est stocké sur votre appareil", "Qué se guarda en tu dispositivo", "Was auf deinem Gerät gespeichert wird", "Cosa viene salvato sul tuo dispositivo", "O que fica salvo no seu dispositivo"],
["Name", "Nom", "Nombre", "Name", "Nome", "Nome"],
["What it holds", "Contenu", "Qué contiene", "Inhalt", "Contenuto", "O que contém"],
["Kind", "Type", "Tipo", "Art", "Tipo", "Tipo"],
["Best scores, play counts, time played, recently played games and settings such as theme and sound", "Meilleurs scores, nombre de parties, temps de jeu, jeux récents et paramètres comme le thème et le son", "Mejores puntuaciones, partidas jugadas, tiempo de juego, juegos recientes y ajustes como el tema y el sonido", "Bestwerte, Spielzähler, Spielzeit, zuletzt gespielte Spiele und Einstellungen wie Design und Ton", "Punteggi migliori, numero di partite, tempo di gioco, giochi recenti e impostazioni come tema e audio", "Melhores placares, contagem de partidas, tempo jogado, jogos recentes e configurações como tema e som"],
["Saved progress for games that support it", "Progression sauvegardée des jeux qui le permettent", "Progreso guardado de los juegos que lo permiten", "Gespeicherter Fortschritt für Spiele, die das unterstützen", "Progressi salvati per i giochi che lo supportano", "Progresso salvo dos jogos que permitem"],
["The username and display name you choose", "Le nom d’utilisateur et le nom affiché que vous choisissez", "El nombre de usuario y el nombre visible que elijas", "Der Benutzername und Anzeigename, den du wählst", "Il nome utente e il nome visualizzato che scegli", "O nome de usuário e o nome de exibição que você escolher"],
["Your cookie choice", "Votre choix concernant les cookies", "Tu elección sobre las cookies", "Deine Cookie-Auswahl", "La tua scelta sui cookie", "Sua escolha sobre cookies"],
["Password unlock and wrong attempts, only on the password-protected version", "Déverrouillage par mot de passe et tentatives erronées, uniquement sur la version protégée par mot de passe", "Desbloqueo con contraseña e intentos fallidos, solo en la versión protegida con contraseña", "Passwort-Entsperrung und Fehlversuche, nur in der passwortgeschützten Version", "Sblocco con password e tentativi errati, solo nella versione protetta da password", "Desbloqueio por senha e tentativas erradas, apenas na versão protegida por senha"],
["Usage events and a random session ID, only if you accept analytics", "Événements d’utilisation et un identifiant de session aléatoire, seulement si vous acceptez la mesure d’audience", "Eventos de uso y un ID de sesión aleatorio, solo si aceptas el análisis", "Nutzungsereignisse und eine zufällige Sitzungs-ID, nur wenn du der Analyse zustimmst", "Eventi di utilizzo e un ID di sessione casuale, solo se accetti l’analisi", "Eventos de uso e um ID de sessão aleatório, só se você aceitar a análise"],
["Your sign-in session and what was already copied to your account, only if you sign in", "Votre session de connexion et ce qui a déjà été copié dans votre compte, seulement si vous vous connectez", "Tu sesión iniciada y lo que ya se copió en tu cuenta, solo si inicias sesión", "Deine Anmeldesitzung und was bereits in dein Konto kopiert wurde, nur wenn du dich anmeldest", "La tua sessione di accesso e ciò che è già stato copiato nel tuo account, solo se accedi", "Sua sessão de login e o que já foi copiado para sua conta, só se você entrar"],
["Usage events, a random session ID and a random device ID, only if you accept analytics", "Événements d’utilisation, un identifiant de session et un identifiant d’appareil aléatoires, seulement si vous acceptez la mesure d’audience", "Eventos de uso, un ID de sesión aleatorio y un ID de dispositivo aleatorio, solo si aceptas el análisis", "Nutzungsereignisse, eine zufällige Sitzungs-ID und eine zufällige Geräte-ID, nur wenn du der Analyse zustimmst", "Eventi di utilizzo, un ID di sessione casuale e un ID dispositivo casuale, solo se accetti l’analisi", "Eventos de uso, um ID de sessão aleatório e um ID de dispositivo aleatório, só se você aceitar a análise"],
["Only if you accept analytics, the site records events such as which games are opened and clicked, how long they are played (only while the tab is visible and the game is not paused), searches typed in the search box, filters used, online parties started, errors, and basic device information: device type (phone, tablet or computer), operating system and browser family, screen size and language. Events are linked to a random session ID, not to your name or email.", "Seulement si vous acceptez la mesure d’audience, le site enregistre des événements comme les jeux ouverts et cliqués, leur durée de jeu (uniquement quand l’onglet est visible et que le jeu n’est pas en pause), les recherches tapées dans la barre de recherche, les filtres utilisés, les groupes en ligne lancés, les erreurs et des informations de base sur l’appareil : type d’appareil (téléphone, tablette ou ordinateur), système d’exploitation et famille de navigateur, taille d’écran et langue. Les événements sont liés à un identifiant de session aléatoire, pas à votre nom ni à votre e-mail.", "Solo si aceptas el análisis, el sitio registra eventos como qué juegos se abren y se pulsan, cuánto tiempo se juegan (solo mientras la pestaña está visible y el juego no está en pausa), las búsquedas escritas en el buscador, los filtros usados, los grupos en línea creados, los errores e información básica del dispositivo: tipo de dispositivo (teléfono, tableta u ordenador), sistema operativo y familia de navegador, tamaño de pantalla e idioma. Los eventos se vinculan a un ID de sesión aleatorio, no a tu nombre ni a tu correo.", "Nur wenn du der Analyse zustimmst, erfasst die Seite Ereignisse wie geöffnete und angeklickte Spiele, wie lange sie gespielt werden (nur solange der Tab sichtbar und das Spiel nicht pausiert ist), Suchbegriffe im Suchfeld, genutzte Filter, gestartete Online-Gruppen, Fehler und grundlegende Geräteinformationen: Gerätetyp (Handy, Tablet oder Computer), Betriebssystem und Browserfamilie, Bildschirmgröße und Sprache. Die Ereignisse sind mit einer zufälligen Sitzungs-ID verknüpft, nicht mit deinem Namen oder deiner E-Mail.", "Solo se accetti l’analisi, il sito registra eventi come quali giochi vengono aperti e cliccati, per quanto tempo si gioca (solo mentre la scheda è visibile e il gioco non è in pausa), le ricerche scritte nella casella di ricerca, i filtri usati, i gruppi online avviati, gli errori e informazioni di base sul dispositivo: tipo di dispositivo (telefono, tablet o computer), sistema operativo e famiglia di browser, dimensioni dello schermo e lingua. Gli eventi sono collegati a un ID di sessione casuale, non al tuo nome o alla tua email.", "Só se você aceitar a análise, o site registra eventos como quais jogos são abertos e clicados, por quanto tempo são jogados (só enquanto a aba está visível e o jogo não está pausado), as pesquisas digitadas na busca, os filtros usados, os grupos online iniciados, os erros e informações básicas do dispositivo: tipo de dispositivo (celular, tablet ou computador), sistema operacional e família do navegador, tamanho da tela e idioma. Os eventos ficam ligados a um ID de sessão aleatório, não ao seu nome nem ao seu e-mail."],
["Only if you accept analytics, the site records events such as which games are opened and clicked, how long they are played (only while the tab is visible and the game is not paused), searches typed in the search box, filters used, online parties started, errors, and basic device information: device type (phone, tablet or computer), operating system and browser family, screen size and language. Events are linked to a random session ID and a random device ID, so we can count returning players. If you are signed in, they are also linked to your account. They are not linked to your name or email.", "Seulement si vous acceptez la mesure d’audience, le site enregistre des événements comme les jeux ouverts et cliqués, leur durée de jeu (uniquement quand l’onglet est visible et que le jeu n’est pas en pause), les recherches tapées dans la barre de recherche, les filtres utilisés, les groupes en ligne lancés, les erreurs et des informations de base sur l’appareil : type d’appareil (téléphone, tablette ou ordinateur), système d’exploitation et famille de navigateur, taille d’écran et langue. Les événements sont liés à un identifiant de session et à un identifiant d’appareil aléatoires, pour compter les joueurs qui reviennent. Si vous êtes connecté, ils sont aussi liés à votre compte. Ils ne sont pas liés à votre nom ni à votre e-mail.", "Solo si aceptas el análisis, el sitio registra eventos como qué juegos se abren y se pulsan, cuánto tiempo se juegan (solo mientras la pestaña está visible y el juego no está en pausa), las búsquedas escritas en el buscador, los filtros usados, los grupos en línea creados, los errores e información básica del dispositivo: tipo de dispositivo (teléfono, tableta u ordenador), sistema operativo y familia de navegador, tamaño de pantalla e idioma. Los eventos se vinculan a un ID de sesión aleatorio y a un ID de dispositivo aleatorio, para contar a los jugadores que vuelven. Si iniciaste sesión, también se vinculan a tu cuenta. No se vinculan a tu nombre ni a tu correo.", "Nur wenn du der Analyse zustimmst, erfasst die Seite Ereignisse wie geöffnete und angeklickte Spiele, wie lange sie gespielt werden (nur solange der Tab sichtbar und das Spiel nicht pausiert ist), Suchbegriffe im Suchfeld, genutzte Filter, gestartete Online-Gruppen, Fehler und grundlegende Geräteinformationen: Gerätetyp (Handy, Tablet oder Computer), Betriebssystem und Browserfamilie, Bildschirmgröße und Sprache. Die Ereignisse sind mit einer zufälligen Sitzungs-ID und einer zufälligen Geräte-ID verknüpft, damit wir wiederkehrende Spieler zählen können. Wenn du angemeldet bist, sind sie auch mit deinem Konto verknüpft. Mit deinem Namen oder deiner E-Mail sind sie nicht verknüpft.", "Solo se accetti l’analisi, il sito registra eventi come quali giochi vengono aperti e cliccati, per quanto tempo si gioca (solo mentre la scheda è visibile e il gioco non è in pausa), le ricerche scritte nella casella di ricerca, i filtri usati, i gruppi online avviati, gli errori e informazioni di base sul dispositivo: tipo di dispositivo (telefono, tablet o computer), sistema operativo e famiglia di browser, dimensioni dello schermo e lingua. Gli eventi sono collegati a un ID di sessione casuale e a un ID dispositivo casuale, per contare i giocatori che tornano. Se hai effettuato l’accesso, sono collegati anche al tuo account. Non sono collegati al tuo nome o alla tua email.", "Só se você aceitar a análise, o site registra eventos como quais jogos são abertos e clicados, por quanto tempo são jogados (só enquanto a aba está visível e o jogo não está pausado), as pesquisas digitadas na busca, os filtros usados, os grupos online iniciados, os erros e informações básicas do dispositivo: tipo de dispositivo (celular, tablet ou computador), sistema operacional e família do navegador, tamanho da tela e idioma. Os eventos ficam ligados a um ID de sessão aleatório e a um ID de dispositivo aleatório, para contarmos os jogadores que voltam. Se você estiver conectado, eles também ficam ligados à sua conta. Não ficam ligados ao seu nome nem ao seu e-mail."],
["Right now these events stay in your browser and are not sent anywhere. We plan to send them to our own database (hosted on Supabase) to learn which games people enjoy. We will update this policy before that starts. If you reject analytics, nothing is recorded.", "Pour l’instant, ces événements restent dans votre navigateur et ne sont envoyés nulle part. Nous prévoyons de les envoyer vers notre propre base de données (hébergée chez Supabase) pour savoir quels jeux plaisent. Nous mettrons cette politique à jour avant que cela commence. Si vous refusez la mesure d’audience, rien n’est enregistré.", "Por ahora estos eventos se quedan en tu navegador y no se envían a ningún sitio. Tenemos previsto enviarlos a nuestra propia base de datos (alojada en Supabase) para saber qué juegos gustan más. Actualizaremos esta política antes de empezar. Si rechazas el análisis, no se registra nada.", "Derzeit bleiben diese Ereignisse in deinem Browser und werden nirgendwohin gesendet. Wir planen, sie an unsere eigene Datenbank (gehostet bei Supabase) zu senden, um zu erfahren, welche Spiele beliebt sind. Vorher aktualisieren wir diese Erklärung. Wenn du die Analyse ablehnst, wird nichts erfasst.", "Per ora questi eventi restano nel browser e non vengono inviati da nessuna parte. Prevediamo di inviarli al nostro database (ospitato su Supabase) per capire quali giochi piacciono. Aggiorneremo questa informativa prima di iniziare. Se rifiuti l’analisi, non viene registrato nulla.", "Por enquanto, esses eventos ficam no seu navegador e não são enviados para lugar nenhum. Planejamos enviá-los ao nosso próprio banco de dados (hospedado no Supabase) para saber quais jogos as pessoas curtem. Atualizaremos esta política antes disso começar. Se você recusar a análise, nada é registrado."],
["These events are sent to our database, hosted by Supabase in the European Union, and are used only to learn which games people enjoy and to fix bugs. They are deleted after two years. If you reject analytics, nothing is recorded or sent.", "Ces événements sont envoyés vers notre base de données, hébergée par Supabase dans l’Union européenne, et servent uniquement à savoir quels jeux plaisent et à corriger les bugs. Ils sont supprimés au bout de deux ans. Si vous refusez la mesure d’audience, rien n’est enregistré ni envoyé.", "Estos eventos se envían a nuestra base de datos, alojada por Supabase en la Unión Europea, y solo se usan para saber qué juegos gustan y para corregir errores. Se eliminan a los dos años. Si rechazas el análisis, no se registra ni se envía nada.", "Diese Ereignisse werden an unsere Datenbank gesendet, die Supabase in der Europäischen Union hostet, und nur genutzt, um zu erfahren, welche Spiele beliebt sind, und um Fehler zu beheben. Sie werden nach zwei Jahren gelöscht. Wenn du die Analyse ablehnst, wird nichts erfasst oder gesendet.", "Questi eventi vengono inviati al nostro database, ospitato da Supabase nell’Unione europea, e servono solo a capire quali giochi piacciono e a correggere i bug. Vengono eliminati dopo due anni. Se rifiuti l’analisi, non viene registrato né inviato nulla.", "Esses eventos são enviados ao nosso banco de dados, hospedado pelo Supabase na União Europeia, e são usados só para saber quais jogos as pessoas curtem e para corrigir bugs. Eles são apagados após dois anos. Se você recusar a análise, nada é registrado nem enviado."],
["Online play", "Jeu en ligne", "Juego en línea", "Online spielen", "Gioco online", "Jogo online"],
["Online games connect players directly using WebRTC. To find each other, browsers use the PeerJS connection service and connection helper (STUN and TURN) servers. Players in your party see the name you enter and your chat messages. As with any direct connection, the other players and these services can see your IP address. We do not store chat messages.", "Les jeux en ligne connectent les joueurs directement grâce à WebRTC. Pour se trouver, les navigateurs utilisent le service de connexion PeerJS et des serveurs d’aide à la connexion (STUN et TURN). Les joueurs de votre groupe voient le nom que vous saisissez et vos messages de chat. Comme pour toute connexion directe, les autres joueurs et ces services peuvent voir votre adresse IP. Nous ne stockons pas les messages de chat.", "Los juegos en línea conectan a los jugadores directamente mediante WebRTC. Para encontrarse, los navegadores usan el servicio de conexión PeerJS y servidores de ayuda a la conexión (STUN y TURN). Los jugadores de tu grupo ven el nombre que escribes y tus mensajes de chat. Como en cualquier conexión directa, los demás jugadores y estos servicios pueden ver tu dirección IP. No guardamos los mensajes de chat.", "Online-Spiele verbinden Spieler direkt über WebRTC. Um sich zu finden, nutzen die Browser den Verbindungsdienst PeerJS und Verbindungshilfe-Server (STUN und TURN). Die Spieler deiner Gruppe sehen den Namen, den du eingibst, und deine Chatnachrichten. Wie bei jeder direkten Verbindung können die anderen Spieler und diese Dienste deine IP-Adresse sehen. Wir speichern keine Chatnachrichten.", "I giochi online collegano i giocatori direttamente tramite WebRTC. Per trovarsi, i browser usano il servizio di connessione PeerJS e server di supporto alla connessione (STUN e TURN). I giocatori del tuo gruppo vedono il nome che inserisci e i tuoi messaggi in chat. Come in ogni connessione diretta, gli altri giocatori e questi servizi possono vedere il tuo indirizzo IP. Non conserviamo i messaggi della chat.", "Os jogos online conectam os jogadores diretamente usando WebRTC. Para se encontrarem, os navegadores usam o serviço de conexão PeerJS e servidores auxiliares de conexão (STUN e TURN). Os jogadores do seu grupo veem o nome que você digita e suas mensagens de chat. Como em qualquer conexão direta, os outros jogadores e esses serviços podem ver seu endereço IP. Não guardamos mensagens de chat."],
["Other services", "Autres services", "Otros servicios", "Weitere Dienste", "Altri servizi", "Outros serviços"],
["Firebase Hosting (Google) delivers the website and may keep standard server logs, such as IP address and time of request.", "Firebase Hosting (Google) diffuse le site et peut conserver des journaux de serveur standard, comme l’adresse IP et l’heure de la requête.", "Firebase Hosting (Google) sirve el sitio web y puede guardar registros de servidor estándar, como la dirección IP y la hora de la solicitud.", "Firebase Hosting (Google) stellt die Website bereit und kann übliche Serverprotokolle speichern, etwa IP-Adresse und Zeitpunkt der Anfrage.", "Firebase Hosting (Google) distribuisce il sito e può conservare i normali log del server, come indirizzo IP e ora della richiesta.", "O Firebase Hosting (Google) entrega o site e pode manter registros padrão do servidor, como endereço IP e horário da solicitação."],
["Google Fonts provides the fonts. Your browser downloads them from Google, which receives your IP address.", "Google Fonts fournit les polices. Votre navigateur les télécharge depuis Google, qui reçoit votre adresse IP.", "Google Fonts proporciona las fuentes. Tu navegador las descarga de Google, que recibe tu dirección IP.", "Google Fonts liefert die Schriftarten. Dein Browser lädt sie von Google herunter, das dabei deine IP-Adresse erhält.", "Google Fonts fornisce i caratteri. Il tuo browser li scarica da Google, che riceve il tuo indirizzo IP.", "O Google Fonts fornece as fontes. Seu navegador as baixa do Google, que recebe seu endereço IP."],
["The 3D engine and the networking library are downloaded from public content delivery networks (cdnjs and jsDelivr).", "Le moteur 3D et la bibliothèque réseau sont téléchargés depuis des réseaux publics de diffusion de contenu (cdnjs et jsDelivr).", "El motor 3D y la biblioteca de red se descargan de redes públicas de distribución de contenido (cdnjs y jsDelivr).", "Die 3D-Engine und die Netzwerkbibliothek werden aus öffentlichen Content-Delivery-Netzwerken (cdnjs und jsDelivr) geladen.", "Il motore 3D e la libreria di rete vengono scaricati da reti pubbliche di distribuzione di contenuti (cdnjs e jsDelivr).", "O motor 3D e a biblioteca de rede são baixados de redes públicas de distribuição de conteúdo (cdnjs e jsDelivr)."],
["Supabase hosts our database and the sign-in service in the European Union. It receives your IP address when your browser contacts it.", "Supabase héberge notre base de données et le service de connexion dans l’Union européenne. Il reçoit votre adresse IP quand votre navigateur le contacte.", "Supabase aloja nuestra base de datos y el servicio de inicio de sesión en la Unión Europea. Recibe tu dirección IP cuando tu navegador se conecta.", "Supabase hostet unsere Datenbank und den Anmeldedienst in der Europäischen Union. Es erhält deine IP-Adresse, wenn dein Browser es kontaktiert.", "Supabase ospita il nostro database e il servizio di accesso nell’Unione europea. Riceve il tuo indirizzo IP quando il browser lo contatta.", "O Supabase hospeda nosso banco de dados e o serviço de login na União Europeia. Ele recebe seu endereço IP quando seu navegador o contata."],
["If you sign in with Google, Google tells us your email address, your name and a link to your profile picture.", "Si vous vous connectez avec Google, Google nous communique votre adresse e-mail, votre nom et un lien vers votre photo de profil.", "Si inicias sesión con Google, Google nos facilita tu correo, tu nombre y un enlace a tu foto de perfil.", "Wenn du dich mit Google anmeldest, teilt uns Google deine E-Mail-Adresse, deinen Namen und einen Link zu deinem Profilbild mit.", "Se accedi con Google, Google ci comunica il tuo indirizzo email, il tuo nome e un link alla tua foto profilo.", "Se você entrar com o Google, o Google nos informa seu e-mail, seu nome e um link para sua foto de perfil."],
["Accounts, coming later", "Comptes, bientôt", "Cuentas, más adelante", "Konten, später", "Account, in arrivo", "Contas, em breve"],
["We plan to add optional sign-in with Google, with profiles, friends and records stored in our database on Supabase. Signing in will stay optional. When it launches, this policy will explain exactly what is stored, for how long and why.", "Nous prévoyons d’ajouter une connexion facultative avec Google, avec des profils, des amis et des records stockés dans notre base de données chez Supabase. La connexion restera facultative. À son lancement, cette politique expliquera précisément ce qui est stocké, pour combien de temps et pourquoi.", "Tenemos previsto añadir un inicio de sesión opcional con Google, con perfiles, amigos y récords guardados en nuestra base de datos en Supabase. Iniciar sesión seguirá siendo opcional. Cuando llegue, esta política explicará exactamente qué se guarda, durante cuánto tiempo y por qué.", "Wir planen eine optionale Anmeldung mit Google, mit Profilen, Freunden und Rekorden in unserer Datenbank bei Supabase. Die Anmeldung bleibt optional. Zum Start erklärt diese Erklärung genau, was wie lange und warum gespeichert wird.", "Prevediamo di aggiungere un accesso facoltativo con Google, con profili, amici e record salvati nel nostro database su Supabase. L’accesso resterà facoltativo. Al lancio, questa informativa spiegherà esattamente cosa viene salvato, per quanto tempo e perché.", "Planejamos adicionar um login opcional com o Google, com perfis, amigos e recordes guardados no nosso banco de dados no Supabase. Entrar continuará sendo opcional. No lançamento, esta política vai explicar exatamente o que é guardado, por quanto tempo e por quê."],
["Accounts", "Comptes", "Cuentas", "Konten", "Account", "Contas"],
["Signing in is optional. If you create an account, our database on Supabase (European Union) stores your email address; your username and display name; and, if you use Google, your name and the link to your Google profile picture; your best scores, play counts, time played and saved progress; and, later, your friends. Passwords are handled by Supabase Auth: they are stored only as a secure hash and nobody, including us, can read them. Emails about your account (confirmation, password reset, email change) are sent by Supabase. We keep this data until you delete your account in Settings, Account, which removes it from our database.", "La connexion est facultative. Si vous créez un compte, notre base de données chez Supabase (Union européenne) stocke votre adresse e-mail ; votre nom d’utilisateur et votre nom affiché ; et, si vous utilisez Google, votre nom et le lien vers votre photo de profil Google ; vos meilleurs scores, nombres de parties, temps de jeu et progression sauvegardée ; et, plus tard, vos amis. Les mots de passe sont gérés par Supabase Auth : ils sont stockés uniquement sous forme de hachage sécurisé et personne, nous compris, ne peut les lire. Les e-mails liés à votre compte (confirmation, réinitialisation du mot de passe, changement d’e-mail) sont envoyés par Supabase. Nous conservons ces données jusqu’à ce que vous supprimiez votre compte dans Paramètres, Compte, ce qui les efface de notre base de données.", "Iniciar sesión es opcional. Si creas una cuenta, nuestra base de datos en Supabase (Unión Europea) guarda tu correo; tu nombre de usuario y tu nombre visible; y, si usas Google, tu nombre y el enlace a tu foto de perfil de Google; tus mejores puntuaciones, partidas jugadas, tiempo de juego y progreso guardado; y, más adelante, tus amigos. Las contraseñas las gestiona Supabase Auth: solo se guardan como un hash seguro y nadie, ni siquiera nosotros, puede leerlas. Los correos sobre tu cuenta (confirmación, restablecimiento de contraseña, cambio de correo) los envía Supabase. Conservamos estos datos hasta que elimines tu cuenta en Ajustes, Cuenta, lo que los borra de nuestra base de datos.", "Die Anmeldung ist optional. Wenn du ein Konto erstellst, speichert unsere Datenbank bei Supabase (Europäische Union) deine E-Mail-Adresse; deinen Benutzernamen und Anzeigenamen; und, wenn du Google nutzt, deinen Namen und den Link zu deinem Google-Profilbild; deine Bestwerte, Spielzähler, Spielzeit und gespeicherten Fortschritt; und später deine Freunde. Passwörter verwaltet Supabase Auth: Sie werden nur als sicherer Hash gespeichert und niemand, auch wir nicht, kann sie lesen. E-Mails zu deinem Konto (Bestätigung, Passwort zurücksetzen, E-Mail-Änderung) verschickt Supabase. Wir speichern diese Daten, bis du dein Konto unter Einstellungen, Konto löschst, wodurch sie aus unserer Datenbank entfernt werden.", "L’accesso è facoltativo. Se crei un account, il nostro database su Supabase (Unione europea) conserva il tuo indirizzo email; il nome utente e il nome visualizzato; e, se usi Google, il tuo nome e il link alla tua foto profilo Google; i tuoi punteggi migliori, il numero di partite, il tempo di gioco e i progressi salvati; e, in futuro, i tuoi amici. Le password sono gestite da Supabase Auth: vengono salvate solo come hash sicuro e nessuno, nemmeno noi, può leggerle. Le email sul tuo account (conferma, reimpostazione della password, cambio email) sono inviate da Supabase. Conserviamo questi dati finché non elimini l’account in Impostazioni, Account, operazione che li rimuove dal nostro database.", "Entrar é opcional. Se você criar uma conta, nosso banco de dados no Supabase (União Europeia) guarda seu e-mail; seu nome de usuário e nome de exibição; e, se você usar o Google, seu nome e o link para sua foto de perfil do Google; seus melhores placares, contagem de partidas, tempo jogado e progresso salvo; e, mais tarde, seus amigos. As senhas são tratadas pelo Supabase Auth: são guardadas apenas como um hash seguro e ninguém, nem nós, consegue lê-las. Os e-mails sobre sua conta (confirmação, redefinição de senha, troca de e-mail) são enviados pelo Supabase. Guardamos esses dados até você excluir sua conta em Configurações, Conta, o que os remove do nosso banco de dados."],
["Your choices", "Vos choix", "Tus opciones", "Deine Wahlmöglichkeiten", "Le tue scelte", "Suas escolhas"],
["Change your cookie choice at any time in Cookie settings.", "Modifiez votre choix concernant les cookies à tout moment dans Paramètres des cookies.", "Cambia tu elección sobre las cookies cuando quieras en Configuración de cookies.", "Ändere deine Cookie-Auswahl jederzeit unter Cookie-Einstellungen.", "Cambia la tua scelta sui cookie in qualsiasi momento in Impostazioni dei cookie.", "Altere sua escolha de cookies a qualquer momento em Configurações de cookies."],
["Download your data in Settings, Privacy and data.", "Téléchargez vos données dans Paramètres, Confidentialité et données.", "Descarga tus datos en Ajustes, Privacidad y datos.", "Lade deine Daten unter Einstellungen, Datenschutz und Daten herunter.", "Scarica i tuoi dati in Impostazioni, Privacy e dati.", "Baixe seus dados em Configurações, Privacidade e dados."],
["Delete it in Settings, Account, or by clearing this site's data in your browser.", "Supprimez-les dans Paramètres, Compte, ou en effaçant les données de ce site dans votre navigateur.", "Bórralos en Ajustes, Cuenta, o borrando los datos de este sitio en tu navegador.", "Lösche sie unter Einstellungen, Konto oder indem du die Daten dieser Seite in deinem Browser löschst.", "Eliminali in Impostazioni, Account, oppure cancellando i dati di questo sito nel browser.", "Exclua-os em Configurações, Conta, ou limpando os dados deste site no seu navegador."],
["Depending on where you live, you may have rights to access, correct, delete or object to the use of your personal data. Because today we hold no personal data on our servers, most requests can be handled directly in your browser with the tools above.", "Selon votre lieu de résidence, vous pouvez avoir le droit d’accéder à vos données personnelles, de les corriger, de les supprimer ou de vous opposer à leur utilisation. Comme nous ne détenons aujourd’hui aucune donnée personnelle sur nos serveurs, la plupart des demandes peuvent être traitées directement dans votre navigateur avec les outils ci-dessus.", "Según dónde vivas, puedes tener derecho a acceder, corregir, borrar u oponerte al uso de tus datos personales. Como hoy no guardamos datos personales en nuestros servidores, la mayoría de las solicitudes se pueden resolver directamente en tu navegador con las herramientas de arriba.", "Je nach Wohnort hast du möglicherweise das Recht, auf deine personenbezogenen Daten zuzugreifen, sie zu berichtigen, zu löschen oder ihrer Nutzung zu widersprechen. Da wir derzeit keine personenbezogenen Daten auf unseren Servern speichern, lassen sich die meisten Anfragen direkt in deinem Browser mit den Werkzeugen oben erledigen.", "A seconda di dove vivi, potresti avere il diritto di accedere, correggere, cancellare i tuoi dati personali o opporti al loro uso. Poiché oggi non conserviamo dati personali sui nostri server, la maggior parte delle richieste si può gestire direttamente nel browser con gli strumenti qui sopra.", "Dependendo de onde você mora, pode ter direito a acessar, corrigir, excluir ou se opor ao uso dos seus dados pessoais. Como hoje não guardamos dados pessoais nos nossos servidores, a maioria dos pedidos pode ser resolvida diretamente no seu navegador com as ferramentas acima."],
["Depending on where you live, you may have rights to access, correct, delete or object to the use of your personal data. If you are signed in, Download my data also includes what your account stores, and Delete my account in Settings, Account removes it from our database. For anything else, email us.", "Selon votre lieu de résidence, vous pouvez avoir le droit d’accéder à vos données personnelles, de les corriger, de les supprimer ou de vous opposer à leur utilisation. Si vous êtes connecté, Télécharger mes données inclut aussi ce que votre compte stocke, et Supprimer mon compte dans Paramètres, Compte l’efface de notre base de données. Pour toute autre demande, écrivez-nous.", "Según dónde vivas, puedes tener derecho a acceder, corregir, borrar u oponerte al uso de tus datos personales. Si iniciaste sesión, Descargar mis datos también incluye lo que guarda tu cuenta, y Eliminar mi cuenta en Ajustes, Cuenta lo borra de nuestra base de datos. Para cualquier otra cosa, escríbenos.", "Je nach Wohnort hast du möglicherweise das Recht, auf deine personenbezogenen Daten zuzugreifen, sie zu berichtigen, zu löschen oder ihrer Nutzung zu widersprechen. Wenn du angemeldet bist, enthält Meine Daten herunterladen auch, was dein Konto speichert, und Mein Konto löschen unter Einstellungen, Konto entfernt es aus unserer Datenbank. Für alles andere schreib uns eine E-Mail.", "A seconda di dove vivi, potresti avere il diritto di accedere, correggere, cancellare i tuoi dati personali o opporti al loro uso. Se hai effettuato l’accesso, Scarica i miei dati include anche ciò che conserva il tuo account, ed Elimina il mio account in Impostazioni, Account lo rimuove dal nostro database. Per tutto il resto, scrivici.", "Dependendo de onde você mora, pode ter direito a acessar, corrigir, excluir ou se opor ao uso dos seus dados pessoais. Se você estiver conectado, Baixar meus dados também inclui o que sua conta guarda, e Excluir minha conta em Configurações, Conta remove tudo do nosso banco de dados. Para qualquer outra coisa, escreva para nós."],
["Children", "Enfants", "Menores", "Kinder", "Minori", "Crianças"],
["The site is meant for a general audience. Children under 13, or under the age of digital consent in their country, should ask a parent or guardian before playing online with others.", "Le site s’adresse à un public général. Les enfants de moins de 13 ans, ou n’ayant pas l’âge du consentement numérique dans leur pays, doivent demander à un parent ou tuteur avant de jouer en ligne avec d’autres.", "El sitio está pensado para todo el público. Los menores de 13 años, o de la edad de consentimiento digital de su país, deben pedir permiso a un padre, madre o tutor antes de jugar en línea con otras personas.", "Die Seite richtet sich an ein allgemeines Publikum. Kinder unter 13 Jahren oder unter dem digitalen Mindestalter ihres Landes sollten vor dem Online-Spielen mit anderen ihre Eltern oder Erziehungsberechtigten fragen.", "Il sito è pensato per un pubblico generale. I minori di 13 anni, o sotto l’età del consenso digitale nel loro paese, devono chiedere a un genitore o tutore prima di giocare online con altri.", "O site é voltado ao público em geral. Crianças com menos de 13 anos, ou abaixo da idade de consentimento digital do seu país, devem pedir a um responsável antes de jogar online com outras pessoas."],
["Changes", "Modifications", "Cambios", "Änderungen", "Modifiche", "Alterações"],
["We will update this policy when the site changes, in particular before analytics are sent to a server or accounts are introduced. The date at the top shows the latest version.", "Nous mettrons cette politique à jour quand le site évoluera, notamment avant que les données de mesure d’audience soient envoyées à un serveur ou que les comptes arrivent. La date en haut indique la dernière version.", "Actualizaremos esta política cuando cambie el sitio, sobre todo antes de enviar datos de análisis a un servidor o de introducir cuentas. La fecha de arriba indica la última versión.", "Wir aktualisieren diese Erklärung, wenn sich die Seite ändert, insbesondere bevor Analysedaten an einen Server gesendet oder Konten eingeführt werden. Das Datum oben zeigt die neueste Version.", "Aggiorneremo questa informativa quando il sito cambierà, in particolare prima che i dati di analisi vengano inviati a un server o che arrivino gli account. La data in alto indica l’ultima versione.", "Atualizaremos esta política quando o site mudar, especialmente antes de os dados de análise serem enviados a um servidor ou de as contas serem lançadas. A data no topo mostra a versão mais recente."],
["Contact", "Contact", "Contacto", "Kontakt", "Contatti", "Contato"],
["This policy explains the cookies and similar browser storage (local storage and session storage) used by gameplay.", "Cette politique explique les cookies et le stockage similaire du navigateur (stockage local et stockage de session) utilisés par gameplay.", "Esta política explica las cookies y el almacenamiento similar del navegador (almacenamiento local y de sesión) que usa gameplay.", "Diese Richtlinie erklärt die Cookies und ähnlichen Browserspeicher (Local Storage und Session Storage), die gameplay verwendet.", "Questa informativa spiega i cookie e le memorie simili del browser (local storage e session storage) usati da gameplay.", "Esta política explica os cookies e o armazenamento semelhante do navegador (armazenamento local e de sessão) usados pelo gameplay."],
["These make the site work and are always on: your records, saves, profile, settings, your cookie choice and, on the password-protected version, the password unlock. They stay in your browser and are never used to track you.", "Ils font fonctionner le site et sont toujours actifs : vos records, sauvegardes, profil, paramètres, votre choix concernant les cookies et, sur la version protégée, le déverrouillage par mot de passe. Ils restent dans votre navigateur et ne servent jamais à vous suivre.", "Hacen que el sitio funcione y siempre están activas: tus récords, partidas guardadas, perfil, ajustes, tu elección sobre las cookies y, en la versión protegida con contraseña, el desbloqueo. Se quedan en tu navegador y nunca se usan para rastrearte.", "Sie lassen die Seite funktionieren und sind immer aktiv: deine Rekorde, Spielstände, dein Profil, deine Einstellungen, deine Cookie-Auswahl und in der passwortgeschützten Version die Passwort-Entsperrung. Sie bleiben in deinem Browser und werden nie zum Tracking genutzt.", "Fanno funzionare il sito e sono sempre attivi: record, salvataggi, profilo, impostazioni, la tua scelta sui cookie e, nella versione protetta da password, lo sblocco con password. Restano nel browser e non vengono mai usati per tracciarti.", "Eles fazem o site funcionar e estão sempre ativos: seus recordes, jogos salvos, perfil, configurações, sua escolha de cookies e, na versão protegida por senha, o desbloqueio por senha. Ficam no seu navegador e nunca são usados para rastrear você."],
["These make the site work and are always on: your records, saves, profile, settings, your cookie choice and, on the password-protected version, the password unlock. If you sign in, your sign-in session (", "Ils font fonctionner le site et sont toujours actifs : vos records, sauvegardes, profil, paramètres, votre choix concernant les cookies et, sur la version protégée, le déverrouillage par mot de passe. Si vous vous connectez, votre session de connexion (", "Hacen que el sitio funcione y siempre están activas: tus récords, partidas guardadas, perfil, ajustes, tu elección sobre las cookies y, en la versión protegida con contraseña, el desbloqueo. Si inicias sesión, también se guarda tu sesión (", "Sie lassen die Seite funktionieren und sind immer aktiv: deine Rekorde, Spielstände, dein Profil, deine Einstellungen, deine Cookie-Auswahl und in der passwortgeschützten Version die Passwort-Entsperrung. Wenn du dich anmeldest, wird auch deine Anmeldesitzung (", "Fanno funzionare il sito e sono sempre attivi: record, salvataggi, profilo, impostazioni, la tua scelta sui cookie e, nella versione protetta da password, lo sblocco con password. Se accedi, viene salvata anche la tua sessione di accesso (", "Eles fazem o site funcionar e estão sempre ativos: seus recordes, jogos salvos, perfil, configurações, sua escolha de cookies e, na versão protegida por senha, o desbloqueio por senha. Se você entrar, sua sessão de login ("],
[") is stored too. They are never used to track you.", ") est aussi stockée. Ils ne servent jamais à vous suivre.", "). Nunca se usan para rastrearte.", ") gespeichert. Sie werden nie zum Tracking genutzt.", "). Non vengono mai usati per tracciarti.", ") também é guardada. Eles nunca são usados para rastrear você."],
["Analytics (optional)", "Mesure d’audience (facultative)", "Análisis (opcional)", "Analyse (optional)", "Analisi (facoltativa)", "Análise (opcional)"],
["If you accept, the site stores anonymous usage events, such as games opened, time played, searches and filters, with a random session ID (", "Si vous acceptez, le site stocke des événements d’utilisation anonymes, comme les jeux ouverts, le temps de jeu, les recherches et les filtres, avec un identifiant de session aléatoire (", "Si aceptas, el sitio guarda eventos de uso anónimos, como juegos abiertos, tiempo de juego, búsquedas y filtros, con un ID de sesión aleatorio (", "Wenn du zustimmst, speichert die Seite anonyme Nutzungsereignisse wie geöffnete Spiele, Spielzeit, Suchen und Filter mit einer zufälligen Sitzungs-ID (", "Se accetti, il sito salva eventi di utilizzo anonimi, come giochi aperti, tempo di gioco, ricerche e filtri, con un ID di sessione casuale (", "Se você aceitar, o site guarda eventos de uso anônimos, como jogos abertos, tempo jogado, pesquisas e filtros, com um ID de sessão aleatório ("],
["). They help us understand which games people play. For now they stay on your device. Rejecting analytics turns this off and deletes what was stored.", "). Ils nous aident à comprendre à quels jeux les gens jouent. Pour l’instant, ils restent sur votre appareil. Refuser la mesure d’audience la désactive et supprime ce qui a été stocké.", "). Nos ayudan a entender a qué juegos juega la gente. Por ahora se quedan en tu dispositivo. Rechazar el análisis lo desactiva y borra lo guardado.", "). Sie helfen uns zu verstehen, welche Spiele gespielt werden. Vorerst bleiben sie auf deinem Gerät. Wenn du die Analyse ablehnst, wird sie ausgeschaltet und das Gespeicherte gelöscht.", "). Ci aiutano a capire a quali giochi si gioca. Per ora restano sul tuo dispositivo. Rifiutare l’analisi la disattiva ed elimina ciò che era stato salvato.", "). Eles nos ajudam a entender quais jogos as pessoas jogam. Por enquanto ficam no seu dispositivo. Recusar a análise a desativa e apaga o que foi guardado."],
["If you accept, the site stores anonymous usage events, such as games opened, time played, searches and filters, with a random session ID and a random device ID (", "Si vous acceptez, le site stocke des événements d’utilisation anonymes, comme les jeux ouverts, le temps de jeu, les recherches et les filtres, avec un identifiant de session et un identifiant d’appareil aléatoires (", "Si aceptas, el sitio guarda eventos de uso anónimos, como juegos abiertos, tiempo de juego, búsquedas y filtros, con un ID de sesión aleatorio y un ID de dispositivo aleatorio (", "Wenn du zustimmst, speichert die Seite anonyme Nutzungsereignisse wie geöffnete Spiele, Spielzeit, Suchen und Filter mit einer zufälligen Sitzungs-ID und einer zufälligen Geräte-ID (", "Se accetti, il sito salva eventi di utilizzo anonimi, come giochi aperti, tempo di gioco, ricerche e filtri, con un ID di sessione casuale e un ID dispositivo casuale (", "Se você aceitar, o site guarda eventos de uso anônimos, como jogos abertos, tempo jogado, pesquisas e filtros, com um ID de sessão aleatório e um ID de dispositivo aleatório ("],
["). They help us understand which games people play and are sent to our database on Supabase in the European Union. Rejecting analytics turns this off and deletes what was stored.", "). Ils nous aident à comprendre à quels jeux les gens jouent et sont envoyés vers notre base de données chez Supabase dans l’Union européenne. Refuser la mesure d’audience la désactive et supprime ce qui a été stocké.", "). Nos ayudan a entender a qué juegos juega la gente y se envían a nuestra base de datos en Supabase, en la Unión Europea. Rechazar el análisis lo desactiva y borra lo guardado.", "). Sie helfen uns zu verstehen, welche Spiele gespielt werden, und werden an unsere Datenbank bei Supabase in der Europäischen Union gesendet. Wenn du die Analyse ablehnst, wird sie ausgeschaltet und das Gespeicherte gelöscht.", "). Ci aiutano a capire a quali giochi si gioca e vengono inviati al nostro database su Supabase nell’Unione europea. Rifiutare l’analisi la disattiva ed elimina ciò che era stato salvato.", "). Eles nos ajudam a entender quais jogos as pessoas jogam e são enviados ao nosso banco de dados no Supabase, na União Europeia. Recusar a análise a desativa e apaga o que foi guardado."],
["No advertising cookies", "Pas de cookies publicitaires", "Sin cookies publicitarias", "Keine Werbe-Cookies", "Nessun cookie pubblicitario", "Sem cookies de publicidade"],
["gameplay does not use advertising or cross-site tracking cookies.", "gameplay n’utilise pas de cookies publicitaires ni de suivi entre sites.", "gameplay no usa cookies publicitarias ni de rastreo entre sitios.", "gameplay verwendet keine Werbe- oder seitenübergreifenden Tracking-Cookies.", "gameplay non usa cookie pubblicitari né di tracciamento tra siti.", "O gameplay não usa cookies de publicidade nem de rastreamento entre sites."],
["Third parties", "Tiers", "Terceros", "Drittanbieter", "Terze parti", "Terceiros"],
["Fonts, the 3D engine and the networking library are loaded from Google Fonts, cdnjs and jsDelivr, and online games use the PeerJS service. These services receive your IP address when your browser contacts them, but gameplay does not let them set cookies through the site.", "Les polices, le moteur 3D et la bibliothèque réseau sont chargés depuis Google Fonts, cdnjs et jsDelivr, et les jeux en ligne utilisent le service PeerJS. Ces services reçoivent votre adresse IP quand votre navigateur les contacte, mais gameplay ne les laisse pas déposer de cookies via le site.", "Las fuentes, el motor 3D y la biblioteca de red se cargan desde Google Fonts, cdnjs y jsDelivr, y los juegos en línea usan el servicio PeerJS. Estos servicios reciben tu dirección IP cuando tu navegador los contacta, pero gameplay no les permite poner cookies a través del sitio.", "Schriftarten, die 3D-Engine und die Netzwerkbibliothek werden von Google Fonts, cdnjs und jsDelivr geladen, und Online-Spiele nutzen den Dienst PeerJS. Diese Dienste erhalten deine IP-Adresse, wenn dein Browser sie kontaktiert, aber gameplay erlaubt ihnen nicht, über die Seite Cookies zu setzen.", "I caratteri, il motore 3D e la libreria di rete vengono caricati da Google Fonts, cdnjs e jsDelivr, e i giochi online usano il servizio PeerJS. Questi servizi ricevono il tuo indirizzo IP quando il browser li contatta, ma gameplay non permette loro di impostare cookie tramite il sito.", "As fontes, o motor 3D e a biblioteca de rede são carregados do Google Fonts, cdnjs e jsDelivr, e os jogos online usam o serviço PeerJS. Esses serviços recebem seu endereço IP quando seu navegador os contata, mas o gameplay não permite que definam cookies pelo site."],
["Fonts, the 3D engine and the networking library are loaded from Google Fonts, cdnjs and jsDelivr, online games use the PeerJS service, and accounts and analytics use Supabase. These services receive your IP address when your browser contacts them, but gameplay does not let them set cookies through the site.", "Les polices, le moteur 3D et la bibliothèque réseau sont chargés depuis Google Fonts, cdnjs et jsDelivr, les jeux en ligne utilisent le service PeerJS, et les comptes et la mesure d’audience utilisent Supabase. Ces services reçoivent votre adresse IP quand votre navigateur les contacte, mais gameplay ne les laisse pas déposer de cookies via le site.", "Las fuentes, el motor 3D y la biblioteca de red se cargan desde Google Fonts, cdnjs y jsDelivr, los juegos en línea usan el servicio PeerJS, y las cuentas y el análisis usan Supabase. Estos servicios reciben tu dirección IP cuando tu navegador los contacta, pero gameplay no les permite poner cookies a través del sitio.", "Schriftarten, die 3D-Engine und die Netzwerkbibliothek werden von Google Fonts, cdnjs und jsDelivr geladen, Online-Spiele nutzen den Dienst PeerJS, und Konten und Analyse nutzen Supabase. Diese Dienste erhalten deine IP-Adresse, wenn dein Browser sie kontaktiert, aber gameplay erlaubt ihnen nicht, über die Seite Cookies zu setzen.", "I caratteri, il motore 3D e la libreria di rete vengono caricati da Google Fonts, cdnjs e jsDelivr, i giochi online usano il servizio PeerJS, e account e analisi usano Supabase. Questi servizi ricevono il tuo indirizzo IP quando il browser li contatta, ma gameplay non permette loro di impostare cookie tramite il sito.", "As fontes, o motor 3D e a biblioteca de rede são carregados do Google Fonts, cdnjs e jsDelivr, os jogos online usam o serviço PeerJS, e as contas e a análise usam o Supabase. Esses serviços recebem seu endereço IP quando seu navegador os contata, mas o gameplay não permite que definam cookies pelo site."],
["Your choice", "Votre choix", "Tu elección", "Deine Wahl", "La tua scelta", "Sua escolha"],
["You can change your choice at any time:", "Vous pouvez modifier votre choix à tout moment :", "Puedes cambiar tu elección cuando quieras:", "Du kannst deine Wahl jederzeit ändern:", "Puoi cambiare la tua scelta in qualsiasi momento:", "Você pode mudar sua escolha a qualquer momento:"],
["You can also delete all site data in your browser settings.", "Vous pouvez aussi supprimer toutes les données du site dans les paramètres de votre navigateur.", "También puedes borrar todos los datos del sitio en los ajustes de tu navegador.", "Du kannst auch alle Daten der Seite in deinen Browsereinstellungen löschen.", "Puoi anche eliminare tutti i dati del sito nelle impostazioni del browser.", "Você também pode apagar todos os dados do site nas configurações do navegador."],
["Signing in is optional. If you create an account, our database on Supabase (European Union) stores your email address; your username and display name; and, if you use Google, your name and the link to your Google profile picture; your best scores, play counts, time played and saved progress; and your friends and friend requests. Other signed-in players can find you by your username and see your username and display name, never your email. Passwords are handled by Supabase Auth: they are stored only as a secure hash and nobody, including us, can read them. Emails about your account (confirmation, password reset, email change) are sent by Supabase. We keep this data until you delete your account in Settings, Account, which removes it from our database.", "La connexion est facultative. Si vous créez un compte, notre base de données chez Supabase (Union européenne) stocke votre adresse e-mail ; votre nom d’utilisateur et votre nom affiché ; et, si vous utilisez Google, votre nom et le lien vers votre photo de profil Google ; vos meilleurs scores, nombres de parties, temps de jeu et progression sauvegardée ; ainsi que vos amis et demandes d’ami. Les autres joueurs connectés peuvent vous trouver par votre nom d’utilisateur et voir votre nom d’utilisateur et votre nom affiché, jamais votre e-mail. Les mots de passe sont gérés par Supabase Auth : ils sont stockés uniquement sous forme de hachage sécurisé et personne, nous compris, ne peut les lire. Les e-mails liés à votre compte (confirmation, réinitialisation du mot de passe, changement d’e-mail) sont envoyés par Supabase. Nous conservons ces données jusqu’à ce que vous supprimiez votre compte dans Paramètres, Compte, ce qui les efface de notre base de données.", "Iniciar sesión es opcional. Si creas una cuenta, nuestra base de datos en Supabase (Unión Europea) guarda tu correo; tu nombre de usuario y tu nombre visible; y, si usas Google, tu nombre y el enlace a tu foto de perfil de Google; tus mejores puntuaciones, partidas jugadas, tiempo de juego y progreso guardado; y tus amigos y solicitudes de amistad. Otros jugadores con sesión iniciada pueden encontrarte por tu nombre de usuario y ver tu nombre de usuario y tu nombre visible, nunca tu correo. Las contraseñas las gestiona Supabase Auth: solo se guardan como un hash seguro y nadie, ni siquiera nosotros, puede leerlas. Los correos sobre tu cuenta (confirmación, restablecimiento de contraseña, cambio de correo) los envía Supabase. Conservamos estos datos hasta que elimines tu cuenta en Ajustes, Cuenta, lo que los borra de nuestra base de datos.", "Die Anmeldung ist optional. Wenn du ein Konto erstellst, speichert unsere Datenbank bei Supabase (Europäische Union) deine E-Mail-Adresse; deinen Benutzernamen und Anzeigenamen; und, wenn du Google nutzt, deinen Namen und den Link zu deinem Google-Profilbild; deine Bestwerte, Spielzähler, Spielzeit und gespeicherten Fortschritt; sowie deine Freunde und Freundschaftsanfragen. Andere angemeldete Spieler können dich über deinen Benutzernamen finden und deinen Benutzernamen und Anzeigenamen sehen, nie deine E-Mail. Passwörter verwaltet Supabase Auth: Sie werden nur als sicherer Hash gespeichert und niemand, auch wir nicht, kann sie lesen. E-Mails zu deinem Konto (Bestätigung, Passwort zurücksetzen, E-Mail-Änderung) verschickt Supabase. Wir speichern diese Daten, bis du dein Konto unter Einstellungen, Konto löschst, wodurch sie aus unserer Datenbank entfernt werden.", "L’accesso è facoltativo. Se crei un account, il nostro database su Supabase (Unione europea) conserva il tuo indirizzo email; il nome utente e il nome visualizzato; e, se usi Google, il tuo nome e il link alla tua foto profilo Google; i tuoi punteggi migliori, il numero di partite, il tempo di gioco e i progressi salvati; e i tuoi amici e le richieste di amicizia. Gli altri giocatori che hanno effettuato l’accesso possono trovarti con il tuo nome utente e vedere nome utente e nome visualizzato, mai la tua email. Le password sono gestite da Supabase Auth: vengono salvate solo come hash sicuro e nessuno, nemmeno noi, può leggerle. Le email sul tuo account (conferma, reimpostazione della password, cambio email) sono inviate da Supabase. Conserviamo questi dati finché non elimini l’account in Impostazioni, Account, operazione che li rimuove dal nostro database.", "Entrar é opcional. Se você criar uma conta, nosso banco de dados no Supabase (União Europeia) guarda seu e-mail; seu nome de usuário e nome de exibição; e, se você usar o Google, seu nome e o link para sua foto de perfil do Google; seus melhores placares, contagem de partidas, tempo jogado e progresso salvo; e seus amigos e pedidos de amizade. Outros jogadores conectados podem encontrar você pelo nome de usuário e ver seu nome de usuário e nome de exibição, nunca seu e-mail. As senhas são tratadas pelo Supabase Auth: são guardadas apenas como um hash seguro e ninguém, nem nós, consegue lê-las. Os e-mails sobre sua conta (confirmação, redefinição de senha, troca de e-mail) são enviados pelo Supabase. Guardamos esses dados até você excluir sua conta em Configurações, Conta, o que os remove do nosso banco de dados."],
["Play", "Jouer", "Jugar", "Spielen", "Gioca", "Jogar"],
["Play again", "Rejouer", "Jugar de nuevo", "Nochmal spielen", "Gioca ancora", "Jogar de novo"],
["Paused", "En pause", "En pausa", "Pausiert", "In pausa", "Pausado"],
["Resume", "Reprendre", "Continuar", "Fortsetzen", "Riprendi", "Continuar"],
["Game over", "Partie terminée", "Fin de la partida", "Spiel vorbei", "Partita finita", "Fim de jogo"],
["Game Over", "Partie terminée", "Fin de la partida", "Spiel vorbei", "Partita finita", "Fim de jogo"],
["Try again", "Réessayer", "Inténtalo de nuevo", "Nochmal versuchen", "Riprova", "Tentar de novo"],
["Next level", "Niveau suivant", "Siguiente nivel", "Nächstes Level", "Livello successivo", "Próximo nível"],
["Menu", "Menu", "Menú", "Menü", "Menu", "Menu"],
["Back to menu", "Retour au menu", "Volver al menú", "Zurück zum Menü", "Torna al menu", "Voltar ao menu"],
["Rematch", "Revanche", "Revancha", "Revanche", "Rivincita", "Revanche"],
["Leave", "Quitter", "Salir", "Verlassen", "Esci", "Sair"],
["Change mode", "Changer de mode", "Cambiar de modo", "Modus wechseln", "Cambia modalità", "Mudar de modo"],
["Modes", "Modes", "Modos", "Modi", "Modalità", "Modos"],
["Free play", "Jeu libre", "Juego libre", "Freies Spiel", "Gioco libero", "Jogo livre"],
["Your friend left", "Votre ami est parti", "Tu amigo se fue", "Dein Freund ist gegangen", "Il tuo amico è uscito", "Seu amigo saiu"],
["The connection to your friend was lost.", "La connexion avec votre ami a été perdue.", "Se perdió la conexión con tu amigo.", "Die Verbindung zu deinem Freund wurde unterbrochen.", "La connessione con il tuo amico si è interrotta.", "A conexão com seu amigo caiu."],
["Waiting for your friend to tap Rematch…", "En attente de votre ami pour la revanche…", "Esperando a que tu amigo pulse Revancha…", "Warte, bis dein Freund Revanche tippt…", "In attesa che il tuo amico tocchi Rivincita…", "Aguardando seu amigo tocar em Revanche…"],
["New room", "Nouveau salon", "Nueva sala", "Neuer Raum", "Nuova stanza", "Nova sala"],
["3D unavailable", "3D indisponible", "3D no disponible", "3D nicht verfügbar", "3D non disponibile", "3D indisponível"],
["WebGL unavailable", "WebGL indisponible", "WebGL no disponible", "WebGL nicht verfügbar", "WebGL non disponibile", "WebGL indisponível"],
["This game needs WebGL. Try enabling hardware acceleration or another browser.", "Ce jeu a besoin de WebGL. Activez l’accélération matérielle ou essayez un autre navigateur.", "Este juego necesita WebGL. Activa la aceleración por hardware o prueba otro navegador.", "Dieses Spiel braucht WebGL. Aktiviere die Hardwarebeschleunigung oder nutze einen anderen Browser.", "Questo gioco richiede WebGL. Attiva l’accelerazione hardware o prova un altro browser.", "Este jogo precisa de WebGL. Ative a aceleração de hardware ou tente outro navegador."],
["This game needs WebGL, which your browser could not start.", "Ce jeu a besoin de WebGL, que votre navigateur n’a pas pu démarrer.", "Este juego necesita WebGL, y tu navegador no pudo iniciarlo.", "Dieses Spiel braucht WebGL, das dein Browser nicht starten konnte.", "Questo gioco richiede WebGL, che il tuo browser non è riuscito ad avviare.", "Este jogo precisa de WebGL, que seu navegador não conseguiu iniciar."],
["Take a breather.", "Faites une pause.", "Tómate un respiro.", "Atme kurz durch.", "Prenditi una pausa.", "Respire um pouco."],
["Start", "Commencer", "Empezar", "Start", "Inizia", "Começar"],
["You win!", "Vous avez gagné !", "¡Has ganado!", "Du hast gewonnen!", "Hai vinto!", "Você venceu!"],
["You lose", "Vous avez perdu", "Has perdido", "Du hast verloren", "Hai perso", "Você perdeu"],
["You won!", "Vous avez gagné !", "¡Has ganado!", "Du hast gewonnen!", "Hai vinto!", "Você venceu!"],
["You lost", "Vous avez perdu", "Has perdido", "Du hast verloren", "Hai perso", "Você perdeu"],
["Draw", "Match nul", "Empate", "Unentschieden", "Pareggio", "Empate"],
["New best!", "Nouveau record !", "¡Nuevo récord!", "Neuer Rekord!", "Nuovo record!", "Novo recorde!"],
["New record!", "Nouveau record !", "¡Nuevo récord!", "Neuer Rekord!", "Nuovo record!", "Novo recorde!"],
["Time's up", "Temps écoulé", "Se acabó el tiempo", "Zeit ist um", "Tempo scaduto", "Acabou o tempo"],
["Time’s up", "Temps écoulé", "Se acabó el tiempo", "Zeit ist um", "Tempo scaduto", "Acabou o tempo"],
["Memory", "Mémoire", "Memoria", "Gedächtnis", "Memoria", "Memória"],
["Timing", "Timing", "Sincronía", "Timing", "Tempismo", "Tempo certo"],
["Reflex", "Réflexes", "Reflejos", "Reflexe", "Riflessi", "Reflexos"],
["Pulse", "Pulsation", "Pulso", "Puls", "Pulsazione", "Pulso"],
["Sequence", "Séquence", "Secuencia", "Sequenz", "Sequenza", "Sequência"],
["Next word", "Mot suivant", "Siguiente palabra", "Nächstes Wort", "Parola successiva", "Próxima palavra"],
["New puzzle", "Nouvelle grille", "Nuevo puzle", "Neues Rätsel", "Nuovo rompicapo", "Novo quebra-cabeça"],
["Full time", "Fin du match", "Final del partido", "Abpfiff", "Fine partita", "Fim de jogo"],
["Board clear!", "Plateau vidé !", "¡Tablero limpio!", "Brett leer!", "Tabellone ripulito!", "Tabuleiro limpo!"],
["All pairs found", "Toutes les paires trouvées", "Todas las parejas encontradas", "Alle Paare gefunden", "Tutte le coppie trovate", "Todos os pares encontrados"],
["Sweet!", "Génial !", "¡Genial!", "Super!", "Fantastico!", "Demais!"],
["Range closed", "Stand fermé", "Galería cerrada", "Schießstand geschlossen", "Poligono chiuso", "Estande fechado"],
["Tank destroyed", "Tank détruit", "Tanque destruido", "Panzer zerstört", "Carro armato distrutto", "Tanque destruído"],
["Topped out", "Plus de place", "Sin espacio", "Oben angestoßen", "Spazio esaurito", "Sem espaço"],
["The ceiling got you", "Le plafond vous a eu", "El techo te atrapó", "Die Decke hat dich erwischt", "Il soffitto ti ha preso", "O teto pegou você"],
["Next up: more rows", "Ensuite : plus de rangées", "A continuación: más filas", "Als Nächstes: mehr Reihen", "Prossimamente: più righe", "A seguir: mais fileiras"],
["The clock is stopped. Resume to keep shooting.", "Le chrono est arrêté. Reprenez pour continuer à tirer.", "El reloj está parado. Continúa para seguir disparando.", "Die Uhr ist angehalten. Setze fort, um weiterzuschießen.", "Il cronometro è fermo. Riprendi per continuare a sparare.", "O relógio está parado. Continue para seguir atirando."],
["The song picks up one second before where you left it.", "La musique reprend une seconde avant l’endroit où vous l’avez laissée.", "La canción sigue un segundo antes de donde la dejaste.", "Der Song startet eine Sekunde vor der Stelle, an der du aufgehört hast.", "La canzone riparte un secondo prima del punto in cui l’hai lasciata.", "A música volta um segundo antes de onde você parou."],
["Losses", "Défaites", "Derrotas", "Niederlagen", "Sconfitte", "Derrotas"],
["Accuracy", "Précision", "Precisión", "Genauigkeit", "Precisione", "Precisão"],
["Coins", "Pièces", "Monedas", "Münzen", "Monete", "Moedas"],
["Kills", "Éliminations", "Eliminaciones", "Abschüsse", "Uccisioni", "Abates"],
["Lines", "Lignes", "Líneas", "Reihen", "Righe", "Linhas"],
["Round", "Manche", "Ronda", "Runde", "Round", "Rodada"],
["Rounds", "Manches", "Rondas", "Runden", "Round", "Rodadas"],
["Total", "Total", "Total", "Gesamt", "Totale", "Total"],
["Combo", "Combo", "Combo", "Kombo", "Combo", "Combo"],
["Speed", "Vitesse", "Velocidad", "Tempo", "Velocità", "Velocidade"],
["Points", "Points", "Puntos", "Punkte", "Punti", "Pontos"],
["Goals", "Buts", "Goles", "Tore", "Gol", "Gols"],
["Lives", "Vies", "Vidas", "Leben", "Vite", "Vidas"],
["Height", "Hauteur", "Altura", "Höhe", "Altezza", "Altura"],
["Words", "Mots", "Palabras", "Wörter", "Parole", "Palavras"],
["Average", "Moyenne", "Media", "Durchschnitt", "Media", "Média"],
["Party code", "Code du groupe", "Código del grupo", "Gruppencode", "Codice gruppo", "Código do grupo"],
["Show party code", "Afficher le code du groupe", "Mostrar código del grupo", "Gruppencode zeigen", "Mostra codice gruppo", "Mostrar código do grupo"],
["Hide party code", "Masquer le code du groupe", "Ocultar código del grupo", "Gruppencode verbergen", "Nascondi codice gruppo", "Ocultar código do grupo"],
["Show", "Afficher", "Mostrar", "Zeigen", "Mostra", "Mostrar"],
["Hide", "Masquer", "Ocultar", "Verbergen", "Nascondi", "Ocultar"],
["Share invite link", "Partager le lien d’invitation", "Compartir enlace de invitación", "Einladungslink teilen", "Condividi link d’invito", "Compartilhar link de convite"],
["Copy invite link", "Copier le lien d’invitation", "Copiar enlace de invitación", "Einladungslink kopieren", "Copia link d’invito", "Copiar link de convite"],
["Invite link copied", "Lien d’invitation copié", "Enlace de invitación copiado", "Einladungslink kopiert", "Link d’invito copiato", "Link de convite copiado"],
["Join with a code", "Saisir un code", "Usar un código", "Code eingeben", "Usa un codice", "Usar um código"],
["Join", "Rejoindre", "Unirse", "Beitreten", "Entra", "Entrar"],
["Party leader", "Chef du groupe", "Líder del grupo", "Gruppenleiter", "Capo del gruppo", "Líder do grupo"],
["Member", "Membre", "Miembro", "Mitglied", "Membro", "Membro"],
["You", "Vous", "Tú", "Du", "Tu", "Você"],
["Waiting", "En attente", "Esperando", "Wartet", "In attesa", "Aguardando"],
["In game", "En jeu", "En partida", "Im Spiel", "In partita", "Em jogo"],
["Make host", "Nommer hôte", "Hacer anfitrión", "Zum Host machen", "Rendi host", "Tornar anfitrião"],
["Your name", "Votre nom", "Tu nombre", "Dein Name", "Il tuo nome", "Seu nome"],
["Change your name", "Changer votre nom", "Cambiar tu nombre", "Namen ändern", "Cambia il tuo nome", "Mudar seu nome"],
["Online party", "Groupe en ligne", "Grupo en línea", "Online-Gruppe", "Gruppo online", "Grupo online"],
["Party size", "Taille du groupe", "Tamaño del grupo", "Gruppengröße", "Dimensione del gruppo", "Tamanho do grupo"],
["{n} players", "{n} joueurs", "{n} jugadores", "{n} Spieler", "{n} giocatori", "{n} jogadores"],
["{n} / {m} joined", "{n} / {m} présents", "{n} / {m} unidos", "{n} / {m} dabei", "{n} / {m} presenti", "{n} / {m} entraram"],
["Fill empty seats with bots", "Remplir les places vides avec des bots", "Llenar los huecos con bots", "Freie Plätze mit Bots füllen", "Riempi i posti vuoti con i bot", "Preencher vagas com bots"],
["On · set by the host", "Activé · choisi par l’hôte", "Activado · lo elige el anfitrión", "An · vom Host festgelegt", "Attivo · scelto dall’host", "Ligado · definido pelo anfitrião"],
["Off · set by the host", "Désactivé · choisi par l’hôte", "Desactivado · lo elige el anfitrión", "Aus · vom Host festgelegt", "Disattivo · scelto dall’host", "Desligado · definido pelo anfitrião"],
["Bots play the empty seats", "Des bots occupent les places vides", "Los bots ocupan los huecos", "Bots spielen auf den freien Plätzen", "I bot occupano i posti vuoti", "Bots ocupam as vagas"],
["Only real players play", "Seulement de vrais joueurs", "Solo juegan jugadores reales", "Nur echte Spieler spielen", "Giocano solo giocatori veri", "Só jogadores reais jogam"],
["Bots are off", "Bots désactivés", "Bots desactivados", "Bots sind aus", "Bot disattivati", "Bots desligados"],
["Bots will fill the empty seats", "Des bots rempliront les places vides", "Los bots llenarán los huecos", "Bots füllen die freien Plätze", "I bot riempiranno i posti vuoti", "Bots vão preencher as vagas"],
["Bot", "Bot", "Bot", "Bot", "Bot", "Bot"],
["Empty seat", "Place libre", "Hueco libre", "Freier Platz", "Posto libero", "Vaga livre"],
["A bot plays this seat", "Un bot occupe cette place", "Un bot ocupa este hueco", "Ein Bot spielt auf diesem Platz", "Un bot occupa questo posto", "Um bot ocupa esta vaga"],
["Waiting for a player…", "En attente d’un joueur…", "Esperando a un jugador…", "Warte auf einen Spieler…", "In attesa di un giocatore…", "Aguardando um jogador…"],
["Waiting for the host…", "En attente de l’hôte…", "Esperando al anfitrión…", "Warte auf den Host…", "In attesa dell’host…", "Aguardando o anfitrião…"],
["A game is in progress. You will join the next one.", "Une partie est en cours. Vous rejoindrez la suivante.", "Hay una partida en curso. Te unirás a la siguiente.", "Ein Spiel läuft gerade. Du steigst beim nächsten ein.", "C’è una partita in corso. Entrerai nella prossima.", "Há uma partida em andamento. Você entra na próxima."],
["A game is in progress. You can start when it ends.", "Une partie est en cours. Vous pourrez lancer quand elle sera finie.", "Hay una partida en curso. Podrás empezar cuando termine.", "Ein Spiel läuft gerade. Du kannst starten, wenn es vorbei ist.", "C’è una partita in corso. Potrai iniziare quando finisce.", "Há uma partida em andamento. Você pode começar quando ela acabar."],
["Waiting for 1 more player…", "En attente d’un joueur de plus…", "Falta 1 jugador…", "Warte auf 1 weiteren Spieler…", "In attesa di 1 altro giocatore…", "Aguardando mais 1 jogador…"],
["Waiting for {n} more players…", "En attente de {n} joueurs de plus…", "Faltan {n} jugadores…", "Warte auf {n} weitere Spieler…", "In attesa di altri {n} giocatori…", "Aguardando mais {n} jogadores…"],
["Live chat", "Chat en direct", "Chat en vivo", "Live-Chat", "Chat dal vivo", "Chat ao vivo"],
["Live", "En direct", "En vivo", "Live", "Live", "Ao vivo"],
["Message", "Message", "Mensaje", "Nachricht", "Messaggio", "Mensagem"],
["Send", "Envoyer", "Enviar", "Senden", "Invia", "Enviar"],
["No messages yet. Say hi!", "Pas encore de messages. Dites bonjour !", "Aún no hay mensajes. ¡Saluda!", "Noch keine Nachrichten. Sag Hallo!", "Ancora nessun messaggio. Saluta!", "Nenhuma mensagem ainda. Diga oi!"],
["Type a message...", "Écrivez un message…", "Escribe un mensaje…", "Nachricht schreiben…", "Scrivi un messaggio…", "Digite uma mensagem…"],
["Type a message…", "Écrivez un message…", "Escribe un mensaje…", "Nachricht schreiben…", "Scrivi un messaggio…", "Digite uma mensagem…"],
["Slow down a little…", "Doucement…", "Más despacio…", "Etwas langsamer…", "Rallenta un po’…", "Vá mais devagar…"],
["{name} joined the party", "{name} a rejoint le groupe", "{name} se unió al grupo", "{name} ist der Gruppe beigetreten", "{name} è entrato nel gruppo", "{name} entrou no grupo"],
["{name} left the party", "{name} a quitté le groupe", "{name} salió del grupo", "{name} hat die Gruppe verlassen", "{name} ha lasciato il gruppo", "{name} saiu do grupo"],
["{name} was removed from the party", "{name} a été retiré du groupe", "{name} fue expulsado del grupo", "{name} wurde aus der Gruppe entfernt", "{name} è stato rimosso dal gruppo", "{name} foi removido do grupo"],
["{name} is now the host", "{name} est maintenant l’hôte", "{name} es ahora el anfitrión", "{name} ist jetzt der Host", "{name} ora è l’host", "{name} agora é o anfitrião"],
["You are now the host", "Vous êtes maintenant l’hôte", "Ahora eres el anfitrión", "Du bist jetzt der Host", "Ora sei l’host", "Agora você é o anfitrião"],
["Party {code}", "Groupe {code}", "Grupo {code}", "Gruppe {code}", "Gruppo {code}", "Grupo {code}"],
["Party {code} is full.", "Le groupe {code} est complet.", "El grupo {code} está lleno.", "Gruppe {code} ist voll.", "Il gruppo {code} è pieno.", "O grupo {code} está cheio."],
["Party {code} not found. Check the code and try again.", "Groupe {code} introuvable. Vérifiez le code et réessayez.", "No se encontró el grupo {code}. Revisa el código e inténtalo de nuevo.", "Gruppe {code} nicht gefunden. Prüfe den Code und versuche es erneut.", "Gruppo {code} non trovato. Controlla il codice e riprova.", "Grupo {code} não encontrado. Confira o código e tente de novo."],
["Party not found. Check the code and try again.", "Groupe introuvable. Vérifiez le code et réessayez.", "No se encontró el grupo. Revisa el código e inténtalo de nuevo.", "Gruppe nicht gefunden. Prüfe den Code und versuche es erneut.", "Gruppo non trovato. Controlla il codice e riprova.", "Grupo não encontrado. Confira o código e tente de novo."],
["Joining party {code}…", "Connexion au groupe {code}…", "Uniéndote al grupo {code}…", "Trete Gruppe {code} bei…", "Ingresso nel gruppo {code}…", "Entrando no grupo {code}…"],
["Joining party…", "Connexion au groupe…", "Uniéndote al grupo…", "Trete der Gruppe bei…", "Ingresso nel gruppo…", "Entrando no grupo…"],
["Creating party…", "Création du groupe…", "Creando grupo…", "Gruppe wird erstellt…", "Creazione del gruppo…", "Criando grupo…"],
["Connecting to the party…", "Connexion au groupe…", "Conectando con el grupo…", "Verbindung zur Gruppe…", "Connessione al gruppo…", "Conectando ao grupo…"],
["Could not join this party", "Impossible de rejoindre ce groupe", "No se pudo entrar en este grupo", "Beitritt zur Gruppe fehlgeschlagen", "Impossibile entrare in questo gruppo", "Não foi possível entrar neste grupo"],
["New party", "Nouveau groupe", "Nuevo grupo", "Neue Gruppe", "Nuovo gruppo", "Novo grupo"],
["Create my own party", "Créer mon propre groupe", "Crear mi propio grupo", "Eigene Gruppe erstellen", "Crea il mio gruppo", "Criar meu próprio grupo"],
["Server busy, trying again ({n}/3)…", "Serveur occupé, nouvel essai ({n}/3)…", "Servidor ocupado, reintentando ({n}/3)…", "Server ausgelastet, neuer Versuch ({n}/3)…", "Server occupato, nuovo tentativo ({n}/3)…", "Servidor ocupado, tentando de novo ({n}/3)…"],
["Connection lost. Reconnecting…", "Connexion perdue. Reconnexion…", "Se perdió la conexión. Reconectando…", "Verbindung verloren. Verbinde neu…", "Connessione persa. Riconnessione…", "Conexão perdida. Reconectando…"],
["Reconnecting…", "Reconnexion…", "Reconectando…", "Verbinde neu…", "Riconnessione…", "Reconectando…"],
["Can’t reach the online server right now (it may be busy or blocked on this network). Try again in a moment.", "Impossible de joindre le serveur en ligne pour l’instant (il est peut-être occupé ou bloqué sur ce réseau). Réessayez dans un moment.", "Ahora no se puede contactar con el servidor en línea (puede estar ocupado o bloqueado en esta red). Inténtalo de nuevo en un momento.", "Der Online-Server ist gerade nicht erreichbar (vielleicht ausgelastet oder in diesem Netz gesperrt). Versuche es gleich noch einmal.", "Al momento non si raggiunge il server online (potrebbe essere occupato o bloccato su questa rete). Riprova tra poco.", "Não foi possível acessar o servidor online agora (ele pode estar ocupado ou bloqueado nesta rede). Tente de novo daqui a pouco."],
["Could not connect to the other player. A school, office or mobile network may be blocking game connections. Try again, or switch networks (for example Wi-Fi instead of mobile data).", "Impossible de se connecter à l’autre joueur. Un réseau d’école, de bureau ou mobile bloque peut-être les connexions de jeu. Réessayez ou changez de réseau (par exemple le Wi-Fi au lieu des données mobiles).", "No se pudo conectar con el otro jugador. Puede que una red escolar, de oficina o móvil bloquee las conexiones de juego. Inténtalo de nuevo o cambia de red (por ejemplo, Wi-Fi en lugar de datos móviles).", "Keine Verbindung zum anderen Spieler. Ein Schul-, Büro- oder Mobilfunknetz blockiert vielleicht Spielverbindungen. Versuche es erneut oder wechsle das Netz (zum Beispiel WLAN statt mobiler Daten).", "Impossibile collegarsi all’altro giocatore. Una rete scolastica, aziendale o mobile potrebbe bloccare le connessioni di gioco. Riprova o cambia rete (per esempio Wi-Fi invece dei dati mobili).", "Não foi possível conectar ao outro jogador. Uma rede de escola, escritório ou celular pode estar bloqueando conexões de jogo. Tente de novo ou troque de rede (por exemplo, Wi-Fi em vez de dados móveis)."],
["Could not load the online player. Check your internet connection and try again.", "Impossible de charger le module en ligne. Vérifiez votre connexion internet et réessayez.", "No se pudo cargar el módulo en línea. Revisa tu conexión a internet e inténtalo de nuevo.", "Das Online-Modul konnte nicht geladen werden. Prüfe deine Internetverbindung und versuche es erneut.", "Impossibile caricare il modulo online. Controlla la connessione a internet e riprova.", "Não foi possível carregar o módulo online. Verifique sua conexão com a internet e tente de novo."],
["The other player did not answer. Try again.", "L’autre joueur n’a pas répondu. Réessayez.", "El otro jugador no respondió. Inténtalo de nuevo.", "Der andere Spieler hat nicht geantwortet. Versuche es erneut.", "L’altro giocatore non ha risposto. Riprova.", "O outro jogador não respondeu. Tente de novo."],
["You were removed from the party", "Vous avez été retiré du groupe", "Te expulsaron del grupo", "Du wurdest aus der Gruppe entfernt", "Sei stato rimosso dal gruppo", "Você foi removido do grupo"],
["The party was closed", "Le groupe a été fermé", "El grupo se cerró", "Die Gruppe wurde geschlossen", "Il gruppo è stato chiuso", "O grupo foi fechado"],
["Lost connection to the party", "Connexion au groupe perdue", "Se perdió la conexión con el grupo", "Verbindung zur Gruppe verloren", "Connessione al gruppo persa", "A conexão com o grupo caiu"],
["The host removed you from this party. Start a new party or join another one with a code.", "L’hôte vous a retiré de ce groupe. Créez un nouveau groupe ou rejoignez-en un autre avec un code.", "El anfitrión te expulsó de este grupo. Crea un grupo nuevo o únete a otro con un código.", "Der Host hat dich aus dieser Gruppe entfernt. Starte eine neue Gruppe oder tritt mit einem Code einer anderen bei.", "L’host ti ha rimosso da questo gruppo. Crea un nuovo gruppo o entra in un altro con un codice.", "O anfitrião removeu você deste grupo. Crie um novo grupo ou entre em outro com um código."],
["The host left, so the party ended. Start a new party or join another one with a code.", "L’hôte est parti, le groupe est donc terminé. Créez un nouveau groupe ou rejoignez-en un autre avec un code.", "El anfitrión se fue, así que el grupo terminó. Crea un grupo nuevo o únete a otro con un código.", "Der Host ist gegangen, deshalb wurde die Gruppe beendet. Starte eine neue Gruppe oder tritt mit einem Code einer anderen bei.", "L’host è uscito, quindi il gruppo è terminato. Crea un nuovo gruppo o entra in un altro con un codice.", "O anfitrião saiu, então o grupo acabou. Crie um novo grupo ou entre em outro com um código."],
["Check your internet connection, then join the party again.", "Vérifiez votre connexion internet, puis rejoignez à nouveau le groupe.", "Revisa tu conexión a internet y vuelve a unirte al grupo.", "Prüfe deine Internetverbindung und tritt der Gruppe dann erneut bei.", "Controlla la connessione a internet, poi rientra nel gruppo.", "Verifique sua conexão com a internet e entre no grupo de novo."],
["Play online", "Jouer en ligne", "Jugar en línea", "Online spielen", "Gioca online", "Jogar online"],
["HOST", "HÔTE", "ANFITRIÓN", "HOST", "HOST", "ANFITRIÃO"],
["Room not found. Check the code and try again.", "Salon introuvable. Vérifiez le code et réessayez.", "No se encontró la sala. Revisa el código e inténtalo de nuevo.", "Raum nicht gefunden. Prüfe den Code und versuche es erneut.", "Stanza non trovata. Controlla il codice e riprova.", "Sala não encontrada. Confira o código e tente de novo."],
["That room already has two players.", "Ce salon a déjà deux joueurs.", "Esa sala ya tiene dos jugadores.", "Dieser Raum hat schon zwei Spieler.", "Questa stanza ha già due giocatori.", "Essa sala já tem dois jogadores."],
["This browser can’t play online.", "Ce navigateur ne peut pas jouer en ligne.", "Este navegador no puede jugar en línea.", "Mit diesem Browser kannst du nicht online spielen.", "Questo browser non può giocare online.", "Este navegador não pode jogar online."],
["Can’t reach the online server. Check your internet connection.", "Impossible de joindre le serveur en ligne. Vérifiez votre connexion internet.", "No se puede contactar con el servidor en línea. Revisa tu conexión a internet.", "Der Online-Server ist nicht erreichbar. Prüfe deine Internetverbindung.", "Impossibile raggiungere il server online. Controlla la connessione a internet.", "Não foi possível acessar o servidor online. Verifique sua conexão com a internet."],
["Connection failed. Try again.", "La connexion a échoué. Réessayez.", "La conexión falló. Inténtalo de nuevo.", "Verbindung fehlgeschlagen. Versuche es erneut.", "Connessione non riuscita. Riprova.", "A conexão falhou. Tente de novo."],
["Dashboard", "Tableau de bord", "Panel", "Dashboard", "Dashboard", "Painel"],
["Admin dashboard", "Tableau de bord admin", "Panel de administración", "Admin-Dashboard", "Dashboard admin", "Painel de administração"],
["Refresh", "Actualiser", "Actualizar", "Aktualisieren", "Aggiorna", "Atualizar"],
["Dashboard sections", "Sections du tableau de bord", "Secciones del panel", "Dashboard-Bereiche", "Sezioni della dashboard", "Secções do painel"],
["Users", "Utilisateurs", "Usuarios", "Benutzer", "Utenti", "Utilizadores"],
["Tickets", "Tickets", "Tickets", "Tickets", "Ticket", "Pedidos"],
["Search by email, username, name or id", "Rechercher par e-mail, nom d'utilisateur, nom ou id", "Buscar por correo, nombre de usuario, nombre o id", "Nach E-Mail, Benutzername, Name oder ID suchen", "Cerca per email, nome utente, nome o id", "Pesquisar por email, nome de utilizador, nome ou id"],
["Search users", "Rechercher des utilisateurs", "Buscar usuarios", "Benutzer suchen", "Cerca utenti", "Pesquisar utilizadores"],
["Filter users", "Filtrer les utilisateurs", "Filtrar usuarios", "Benutzer filtern", "Filtra utenti", "Filtrar utilizadores"],
["All users", "Tous les utilisateurs", "Todos los usuarios", "Alle Benutzer", "Tutti gli utenti", "Todos os utilizadores"],
["Admins", "Admins", "Administradores", "Admins", "Admin", "Administradores"],
["Locked", "Bloqué", "Bloqueado", "Gesperrt", "Bloccato", "Bloqueado"],
["Email not confirmed", "E-mail non confirmé", "Correo sin confirmar", "E-Mail nicht bestätigt", "Email non confermata", "Email não confirmado"],
["Active in the last 7 days", "Actifs ces 7 derniers jours", "Activos en los últimos 7 días", "In den letzten 7 Tagen aktiv", "Attivi negli ultimi 7 giorni", "Ativos nos últimos 7 dias"],
["Role", "Rôle", "Rol", "Rolle", "Ruolo", "Função"],
["User", "Utilisateur", "Usuario", "Benutzer", "Utente", "Utilizador"],
["Admin", "Admin", "Administrador", "Admin", "Admin", "Administrador"],
["Hidden (hashed). Passwords are stored as one-way hashes, so nobody can see them. You can set a new one.", "Masqué (haché). Les mots de passe sont stockés sous forme de hachage à sens unique : personne ne peut les voir. Vous pouvez en définir un nouveau.", "Oculta (cifrada con hash). Las contraseñas se guardan como hash de un solo sentido, así que nadie puede verlas. Puedes poner una nueva.", "Verborgen (gehasht). Passwörter werden als Einweg-Hash gespeichert, niemand kann sie sehen. Du kannst ein neues festlegen.", "Nascosta (hash). Le password sono salvate come hash a senso unico, quindi nessuno può vederle. Puoi impostarne una nuova.", "Oculta (hash). As palavras-passe são guardadas como hash de sentido único, por isso ninguém as pode ver. Pode definir uma nova."],
["New password, at least 8 characters", "Nouveau mot de passe, 8 caractères minimum", "Nueva contraseña, al menos 8 caracteres", "Neues Passwort, mindestens 8 Zeichen", "Nuova password, almeno 8 caratteri", "Nova palavra-passe, pelo menos 8 caracteres"],
["Set new password", "Définir un nouveau mot de passe", "Poner nueva contraseña", "Neues Passwort festlegen", "Imposta nuova password", "Definir nova palavra-passe"],
["Access", "Accès", "Acceso", "Zugang", "Accesso", "Acesso"],
["Reason shown to the user (optional)", "Raison montrée à l'utilisateur (facultatif)", "Motivo que verá el usuario (opcional)", "Grund, den der Benutzer sieht (optional)", "Motivo mostrato all'utente (facoltativo)", "Motivo mostrado ao utilizador (opcional)"],
["Lock account", "Bloquer le compte", "Bloquear cuenta", "Konto sperren", "Blocca account", "Bloquear conta"],
["Unlock account", "Débloquer le compte", "Desbloquear cuenta", "Konto entsperren", "Sblocca account", "Desbloquear conta"],
["A question, a problem with your account or a game? Open a ticket and the admins will reply here.", "Une question, un problème avec votre compte ou un jeu ? Ouvrez un ticket et les admins vous répondront ici.", "¿Una pregunta, un problema con tu cuenta o con un juego? Abre un ticket y los administradores te responderán aquí.", "Eine Frage, ein Problem mit deinem Konto oder einem Spiel? Öffne ein Ticket, die Admins antworten hier.", "Una domanda, un problema con il tuo account o con un gioco? Apri un ticket e gli admin ti risponderanno qui.", "Uma pergunta, um problema com a sua conta ou com um jogo? Abra um pedido e os administradores respondem aqui."],
["The admin has blocked you out of this website", "L'administrateur vous a bloqué l'accès à ce site", "El administrador te ha bloqueado el acceso a este sitio", "Der Admin hat dich von dieser Website ausgesperrt", "L'amministratore ti ha bloccato l'accesso a questo sito", "O administrador bloqueou o seu acesso a este site"],
["You cannot play or use your account for now.", "Vous ne pouvez pas jouer ni utiliser votre compte pour le moment.", "Por ahora no puedes jugar ni usar tu cuenta.", "Du kannst vorerst nicht spielen und dein Konto nicht nutzen.", "Per ora non puoi giocare né usare il tuo account.", "Por agora não pode jogar nem usar a sua conta."],
["Reason", "Raison", "Motivo", "Grund", "Motivo", "Motivo"],
["Think this is a mistake? Open a ticket to talk with the admins. Their replies show up here.", "Vous pensez que c'est une erreur ? Ouvrez un ticket pour parler aux admins. Leurs réponses s'affichent ici.", "¿Crees que es un error? Abre un ticket para hablar con los administradores. Sus respuestas aparecen aquí.", "Hältst du das für einen Fehler? Öffne ein Ticket, um mit den Admins zu schreiben. Ihre Antworten erscheinen hier.", "Pensi che sia un errore? Apri un ticket per parlare con gli admin. Le loro risposte compaiono qui.", "Acha que é um erro? Abra um pedido para falar com os administradores. As respostas aparecem aqui."],
["Never", "Jamais", "Nunca", "Nie", "Mai", "Nunca"],
["Yes", "Oui", "Sí", "Ja", "Sì", "Sim"],
["No", "Non", "No", "Nein", "No", "Não"],
["Hidden (hashed)", "Masqué (haché)", "Oculta (hash)", "Verborgen (gehasht)", "Nascosta (hash)", "Oculta (hash)"],
["User id", "Id utilisateur", "Id de usuario", "Benutzer-ID", "Id utente", "Id do utilizador"],
["Account created", "Compte créé", "Cuenta creada", "Konto erstellt", "Account creato", "Conta criada"],
["Last log in", "Dernière connexion", "Último inicio de sesión", "Letzte Anmeldung", "Ultimo accesso", "Último início de sessão"],
["Last used website", "Dernière visite du site", "Último uso del sitio", "Zuletzt auf der Website", "Ultimo uso del sito", "Última utilização do site"],
["Log in method", "Méthode de connexion", "Método de inicio de sesión", "Anmeldemethode", "Metodo di accesso", "Método de início de sessão"],
["Email confirmed", "E-mail confirmé", "Correo confirmado", "E-Mail bestätigt", "Email confermata", "Email confirmado"],
["Favourite game", "Jeu préféré", "Juego favorito", "Lieblingsspiel", "Gioco preferito", "Jogo favorito"],
["Last game opened", "Dernier jeu ouvert", "Último juego abierto", "Zuletzt geöffnetes Spiel", "Ultimo gioco aperto", "Último jogo aberto"],
["New this week", "Nouveaux cette semaine", "Nuevos esta semana", "Neu diese Woche", "Nuovi questa settimana", "Novos esta semana"],
["Active today", "Actifs aujourd'hui", "Activos hoy", "Heute aktiv", "Attivi oggi", "Ativos hoje"],
["Open tickets", "Tickets ouverts", "Tickets abiertos", "Offene Tickets", "Ticket aperti", "Pedidos abertos"],
["{n} of {t} users", "{n} sur {t} utilisateurs", "{n} de {t} usuarios", "{n} von {t} Benutzern", "{n} di {t} utenti", "{n} de {t} utilizadores"],
["No users match.", "Aucun utilisateur ne correspond.", "Ningún usuario coincide.", "Kein Benutzer passt.", "Nessun utente corrisponde.", "Nenhum utilizador corresponde."],
["Could not load the users. Check your connection and try again.", "Impossible de charger les utilisateurs. Vérifiez votre connexion et réessayez.", "No se pudieron cargar los usuarios. Revisa tu conexión e inténtalo de nuevo.", "Die Benutzer konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare gli utenti. Controlla la connessione e riprova.", "Não foi possível carregar os utilizadores. Verifique a ligação e tente novamente."],
["Admins only", "Réservé aux admins", "Solo para administradores", "Nur für Admins", "Solo per gli admin", "Apenas para administradores"],
["You cannot lock your own account", "Vous ne pouvez pas bloquer votre propre compte", "No puedes bloquear tu propia cuenta", "Du kannst dein eigenes Konto nicht sperren", "Non puoi bloccare il tuo account", "Não pode bloquear a sua própria conta"],
["This user is now an admin.", "Cet utilisateur est maintenant admin.", "Este usuario ahora es administrador.", "Dieser Benutzer ist jetzt Admin.", "Questo utente ora è admin.", "Este utilizador é agora administrador."],
["This user is now a regular user.", "Cet utilisateur est maintenant un utilisateur normal.", "Este usuario ahora es un usuario normal.", "Dieser Benutzer ist jetzt ein normaler Benutzer.", "Questo utente ora è un utente normale.", "Este utilizador é agora um utilizador normal."],
["Use at most 72 characters.", "Utilisez 72 caractères au maximum.", "Usa como máximo 72 caracteres.", "Verwende höchstens 72 Zeichen.", "Usa al massimo 72 caratteri.", "Use no máximo 72 caracteres."],
["New password saved. They were signed out on their devices.", "Nouveau mot de passe enregistré. L'utilisateur a été déconnecté de ses appareils.", "Nueva contraseña guardada. Se ha cerrado su sesión en sus dispositivos.", "Neues Passwort gespeichert. Der Benutzer wurde auf seinen Geräten abgemeldet.", "Nuova password salvata. L'utente è stato disconnesso dai suoi dispositivi.", "Nova palavra-passe guardada. A sessão foi terminada nos dispositivos do utilizador."],
["New password saved.", "Nouveau mot de passe enregistré.", "Nueva contraseña guardada.", "Neues Passwort gespeichert.", "Nuova password salvata.", "Nova palavra-passe guardada."],
["Account locked. They now only see the blocked page.", "Compte bloqué. L'utilisateur ne voit plus que la page de blocage.", "Cuenta bloqueada. Ahora solo ve la página de bloqueo.", "Konto gesperrt. Der Benutzer sieht nur noch die Sperrseite.", "Account bloccato. Ora l'utente vede solo la pagina di blocco.", "Conta bloqueada. O utilizador agora só vê a página de bloqueio."],
["Account unlocked.", "Compte débloqué.", "Cuenta desbloqueada.", "Konto entsperrt.", "Account sbloccato.", "Conta desbloqueada."],
["There must be at least one admin", "Il doit rester au moins un admin", "Debe haber al menos un administrador", "Es muss mindestens einen Admin geben", "Deve esserci almeno un admin", "Tem de existir pelo menos um administrador"],
["Not found. Refresh and try again.", "Introuvable. Actualisez et réessayez.", "No encontrado. Actualiza e inténtalo de nuevo.", "Nicht gefunden. Aktualisiere und versuche es erneut.", "Non trovato. Aggiorna e riprova.", "Não encontrado. Atualize e tente novamente."],
["Too many messages. Wait a minute and try again.", "Trop de messages. Attendez une minute et réessayez.", "Demasiados mensajes. Espera un minuto e inténtalo de nuevo.", "Zu viele Nachrichten. Warte eine Minute und versuche es erneut.", "Troppi messaggi. Aspetta un minuto e riprova.", "Demasiadas mensagens. Aguarde um minuto e tente novamente."],
["Your account is locked.", "Votre compte est bloqué.", "Tu cuenta está bloqueada.", "Dein Konto ist gesperrt.", "Il tuo account è bloccato.", "A sua conta está bloqueada."],
["Write a subject.", "Écrivez un sujet.", "Escribe un asunto.", "Gib einen Betreff ein.", "Scrivi un oggetto.", "Escreva um assunto."],
["Write a message.", "Écrivez un message.", "Escribe un mensaje.", "Schreibe eine Nachricht.", "Scrivi un messaggio.", "Escreva uma mensagem."],
["Too many tickets. Wait a while and try again.", "Trop de tickets. Patientez un peu et réessayez.", "Demasiados tickets. Espera un rato e inténtalo de nuevo.", "Zu viele Tickets. Warte etwas und versuche es erneut.", "Troppi ticket. Aspetta un po' e riprova.", "Demasiados pedidos. Aguarde um pouco e tente novamente."],
["Subject", "Sujet", "Asunto", "Betreff", "Oggetto", "Assunto"],
["Send ticket", "Envoyer le ticket", "Enviar ticket", "Ticket senden", "Invia ticket", "Enviar pedido"],
["New ticket", "Nouveau ticket", "Nuevo ticket", "Neues Ticket", "Nuovo ticket", "Novo pedido"],
["All tickets", "Tous les tickets", "Todos los tickets", "Alle Tickets", "Tutti i ticket", "Todos os pedidos"],
["Write a message", "Écrire un message", "Escribe un mensaje", "Nachricht schreiben", "Scrivi un messaggio", "Escreva uma mensagem"],
["Could not load the tickets. Check your connection and try again.", "Impossible de charger les tickets. Vérifiez votre connexion et réessayez.", "No se pudieron cargar los tickets. Revisa tu conexión e inténtalo de nuevo.", "Die Tickets konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare i ticket. Controlla la connessione e riprova.", "Não foi possível carregar os pedidos. Verifique a ligação e tente novamente."],
["Could not load the messages. Check your connection and try again.", "Impossible de charger les messages. Vérifiez votre connexion et réessayez.", "No se pudieron cargar los mensajes. Revisa tu conexión e inténtalo de nuevo.", "Die Nachrichten konnten nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.", "Impossibile caricare i messaggi. Controlla la connessione e riprova.", "Não foi possível carregar as mensagens. Verifique a ligação e tente novamente."],
["Needs a reply", "À répondre", "Pendiente de respuesta", "Antwort nötig", "Da rispondere", "Aguarda resposta"],
["New reply", "Nouvelle réponse", "Nueva respuesta", "Neue Antwort", "Nuova risposta", "Nova resposta"],
["Closed", "Fermé", "Cerrado", "Geschlossen", "Chiuso", "Fechado"],
["1 message", "1 message", "1 mensaje", "1 Nachricht", "1 messaggio", "1 mensagem"],
["{n} messages", "{n} messages", "{n} mensajes", "{n} Nachrichten", "{n} messaggi", "{n} mensagens"],
["No tickets yet.", "Aucun ticket pour l'instant.", "Todavía no hay tickets.", "Noch keine Tickets.", "Ancora nessun ticket.", "Ainda não há pedidos."],
["Opened {d}", "Ouvert le {d}", "Abierto el {d}", "Geöffnet am {d}", "Aperto il {d}", "Aberto a {d}"],
["Close ticket", "Fermer le ticket", "Cerrar ticket", "Ticket schließen", "Chiudi ticket", "Fechar pedido"],
["Reopen", "Rouvrir", "Reabrir", "Wieder öffnen", "Riapri", "Reabrir"],
["Welcome back.", "Bon retour.", "Hola de nuevo.", "Willkommen zurück.", "Bentornato.", "Bem-vindo de volta."],
["Make it your game.", "Fais-en ton jeu.", "Hazlo tu juego.", "Mach es zu deinem Spiel.", "Rendilo il tuo gioco.", "Faz dele o teu jogo."],
["Create an account to keep your records and saves on every device.", "Crée un compte pour garder tes records et tes sauvegardes sur tous tes appareils.", "Crea una cuenta para conservar tus récords y partidas guardadas en todos tus dispositivos.", "Erstelle ein Konto, um deine Rekorde und Spielstände auf jedem Gerät zu behalten.", "Crea un account per avere record e salvataggi su ogni dispositivo.", "Cria uma conta para guardares os teus recordes e jogos guardados em todos os dispositivos."],
["Enter your email or username", "Saisis ton e-mail ou ton nom d’utilisateur", "Escribe tu correo o nombre de usuario", "E-Mail oder Benutzername eingeben", "Inserisci la tua email o il nome utente", "Escreve o teu e-mail ou nome de utilizador"],
["Enter your password", "Saisis ton mot de passe", "Escribe tu contraseña", "Passwort eingeben", "Inserisci la password", "Escreve a tua palavra-passe"],
["Confirm Email", "Confirme l’e-mail", "Confirma el correo", "E-Mail bestätigen", "Conferma email", "Confirma o e-mail"],
["Choose your player name", "Choisis ton nom de joueur", "Elige tu nombre de jugador", "Wähle deinen Spielernamen", "Scegli il tuo nome giocatore", "Escolhe o teu nome de jogador"],
["Create a password", "Crée un mot de passe", "Crea una contraseña", "Passwort erstellen", "Crea una password", "Cria uma palavra-passe"],
["Enter your email again", "Saisis à nouveau ton e-mail", "Vuelve a escribir tu correo", "E-Mail erneut eingeben", "Inserisci di nuovo la tua email", "Escreve outra vez o teu e-mail"],
["Enter your password again", "Saisis à nouveau ton mot de passe", "Vuelve a escribir tu contraseña", "Passwort erneut eingeben", "Inserisci di nuovo la password", "Escreve outra vez a tua palavra-passe"],
["Don't have an account?", "Pas encore de compte ?", "¿No tienes cuenta?", "Noch kein Konto?", "Non hai un account?", "Não tens conta?"],
["Already have an account?", "Tu as déjà un compte ?", "¿Ya tienes cuenta?", "Du hast schon ein Konto?", "Hai già un account?", "Já tens conta?"],
["8+ characters", "8+ caractères", "8+ caracteres", "8+ Zeichen", "8+ caratteri", "8+ caracteres"],
["1 letter", "1 lettre", "1 letra", "1 Buchstabe", "1 lettera", "1 letra"],
["1 number", "1 chiffre", "1 número", "1 Zahl", "1 numero", "1 número"],
["done", "fait", "listo", "erfüllt", "fatto", "feito"],
["missing", "manquant", "falta", "fehlt", "manca", "falta"],
["Pick a password you do not use on other sites.", "Choisis un mot de passe que tu n’utilises pas sur d’autres sites.", "Elige una contraseña que no uses en otros sitios.", "Wähle ein Passwort, das du nirgendwo sonst verwendest.", "Scegli una password che non usi su altri siti.", "Escolhe uma palavra-passe que não uses noutros sites."],
["Signing you in…", "Connexion en cours…", "Iniciando sesión…", "Du wirst angemeldet…", "Accesso in corso…", "A iniciar sessão…"],
["By continuing, you agree to our", "En continuant, tu acceptes nos", "Al continuar, aceptas nuestros", "Wenn du fortfährst, akzeptierst du unsere", "Continuando, accetti i nostri", "Ao continuar, aceitas os nossos"],
["The two email addresses do not match.", "Les deux adresses e-mail ne correspondent pas.", "Los dos correos no coinciden.", "Die beiden E-Mail-Adressen stimmen nicht überein.", "I due indirizzi email non corrispondono.", "Os dois endereços de e-mail não coincidem."],
["Use at least 8 characters with 1 letter and 1 number.", "Utilise au moins 8 caractères, dont 1 lettre et 1 chiffre.", "Usa al menos 8 caracteres con 1 letra y 1 número.", "Verwende mindestens 8 Zeichen mit 1 Buchstaben und 1 Zahl.", "Usa almeno 8 caratteri con 1 lettera e 1 numero.", "Usa pelo menos 8 caracteres com 1 letra e 1 número."],
["and", "et", "y", "und", "e", "e"],
["Signed out.", "Déconnecté.", "Sesión cerrada.", "Abgemeldet.", "Disconnesso.", "Sessão terminada."],
["Your account will be deleted.", "Ton compte va être supprimé.", "Tu cuenta se eliminará.", "Dein Konto wird gelöscht.", "Il tuo account verrà eliminato.", "A tua conta vai ser eliminada."],
["Your account was deleted.", "Ton compte a été supprimé.", "Tu cuenta se ha eliminado.", "Dein Konto wurde gelöscht.", "Il tuo account è stato eliminato.", "A tua conta foi eliminada."],
["Not signed in", "Non connecté", "Sin iniciar sesión", "Nicht angemeldet", "Non connesso", "Sem sessão iniciada"],
["Accounts are coming soon.", "Les comptes arrivent bientôt.", "Las cuentas llegarán pronto.", "Konten kommen bald.", "Gli account arriveranno presto.", "As contas chegam em breve."]
];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const idf = (o, d) => { try { return new Intl.DateTimeFormat(LANGS[li], o).format(d); } catch (e) { return ''; } };
const monYear = m => idf({ month: 'long', year: 'numeric' }, new Date(+m[2], MON.indexOf(m[1]), 1));
const monDay = m => idf({ month: 'short', day: 'numeric' }, new Date(2026, MON.findIndex(x => x.startsWith(m[1])), +m[2]));
const dayMonYear = m => idf({ day: 'numeric', month: 'long', year: 'numeric' }, new Date(+m[3], MON.indexOf(m[2]), +m[1]));
const pl = (n, one, many) => +n === 1 ? one : many;
const P = [
  [/^Play (.+)$/, 'Jouer à $1', 'Jugar a $1', '$1 spielen', 'Gioca a $1', 'Jogar $1'],
  [/^Search (\d+) games$/, 'Rechercher parmi $1 jeux', 'Buscar entre $1 juegos', '$1 Spiele durchsuchen', 'Cerca tra $1 giochi', 'Pesquisar entre $1 jogos'],
  [/^(\d+) games?(, partial matches)?$/, m => m[1] + pl(m[1], ' jeu', ' jeux') + (m[2] ? ', résultats partiels' : ''), m => m[1] + pl(m[1], ' juego', ' juegos') + (m[2] ? ', coincidencias parciales' : ''), m => m[1] + pl(m[1], ' Spiel', ' Spiele') + (m[2] ? ', teilweise Treffer' : ''), m => m[1] + pl(m[1], ' gioco', ' giochi') + (m[2] ? ', risultati parziali' : ''), m => m[1] + pl(m[1], ' jogo', ' jogos') + (m[2] ? ', resultados parciais' : '')],
  [/^Show (\d+) games?$/, m => 'Voir ' + m[1] + pl(m[1], ' jeu', ' jeux'), m => 'Ver ' + m[1] + pl(m[1], ' juego', ' juegos'), m => m[1] + pl(m[1], ' Spiel', ' Spiele') + ' zeigen', m => 'Mostra ' + m[1] + pl(m[1], ' gioco', ' giochi'), m => 'Ver ' + m[1] + pl(m[1], ' jogo', ' jogos')],
  [/^Remove (.+)$/, 'Retirer $t1', 'Quitar $t1', '$t1 entfernen', 'Rimuovi $t1', 'Remover $t1'],
  [/^Played (\d+)×$/, 'Joué $1 fois', 'Jugado $1 veces', '$1× gespielt', 'Giocato $1 volte', 'Jogado $1 vezes'],
  [/^gameplay, (\d+) games$/, 'gameplay, $1 jeux', 'gameplay, $1 juegos', 'gameplay, $1 Spiele', 'gameplay, $1 giochi', 'gameplay, $1 jogos'],
  [/^Player since ([A-Z][a-z]+) (\d{4})$/, m => 'Joueur depuis ' + monYear(m), m => 'Jugador desde ' + monYear(m), m => 'Spieler seit ' + monYear(m), m => 'Giocatore da ' + monYear(m), m => 'Jogador desde ' + monYear(m)],
  [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})$/, monDay, monDay, monDay, monDay, monDay],
  [/^Last updated (\d{1,2}) ([A-Z][a-z]+) (\d{4})$/, m => 'Dernière mise à jour : ' + dayMonYear(m), m => 'Última actualización: ' + dayMonYear(m), m => 'Zuletzt aktualisiert: ' + dayMonYear(m), m => 'Ultimo aggiornamento: ' + dayMonYear(m), m => 'Última atualização: ' + dayMonYear(m)],
  [/^\+(.+) this week$/, '+$1 cette semaine', '+$1 esta semana', '+$1 diese Woche', '+$1 questa settimana', '+$1 esta semana'],
  [/^in (\d+) games? played$/, m => 'sur ' + m[1] + pl(m[1], ' jeu joué', ' jeux joués'), m => 'en ' + m[1] + pl(m[1], ' juego jugado', ' juegos jugados'), m => 'in ' + m[1] + pl(m[1], ' gespieltem Spiel', ' gespielten Spielen'), m => 'in ' + m[1] + pl(m[1], ' gioco giocato', ' giochi giocati'), m => 'em ' + m[1] + pl(m[1], ' jogo jogado', ' jogos jogados')],
  [/^Current streak: (\d+)$/, 'Série actuelle : $1', 'Racha actual: $1', 'Aktuelle Serie: $1', 'Serie attuale: $1', 'Sequência atual: $1'],
  [/^(\d+) days ago$/, 'Il y a $1 jours', 'Hace $1 días', 'Vor $1 Tagen', '$1 giorni fa', 'Há $1 dias'],
  [/^Online up to (\d+)$/, 'En ligne jusqu’à $1', 'En línea hasta $1', 'Online bis $1', 'Online fino a $1', 'Online até $1'],
  [/^(.+) is coming soon$/, '$t1 : bientôt disponible', '$t1: muy pronto', '$t1 kommt bald', '$t1: in arrivo', '$t1: em breve'],
  [/^Signed in as (.+)$/, 'Connecté en tant que $1', 'Sesión iniciada como $1', 'Angemeldet als $1', 'Accesso eseguito come $1', 'Conectado como $1'],
  [/^Welcome, (.+)$/, 'Bienvenue, $1', 'Bienvenido, $1', 'Willkommen, $1', 'Benvenuto, $1', 'Bem-vindo, $1'],
  [/^Almost done: open the link we sent to (.+) to confirm your account\.$/, 'Presque fini : ouvrez le lien envoyé à $1 pour confirmer votre compte.', 'Casi listo: abre el enlace que enviamos a $1 para confirmar tu cuenta.', 'Fast geschafft: Öffne den Link, den wir an $1 geschickt haben, um dein Konto zu bestätigen.', 'Quasi fatto: apri il link che abbiamo inviato a $1 per confermare il tuo account.', 'Quase lá: abra o link que enviamos para $1 para confirmar sua conta.'],
  [/^Records and saves synced (.+)\.$/, 'Records et sauvegardes synchronisés à $1.', 'Récords y partidas sincronizados a las $1.', 'Rekorde und Spielstände um $1 synchronisiert.', 'Record e salvataggi sincronizzati alle $1.', 'Recordes e jogos salvos sincronizados às $1.'],
  [/^(.+) — play free online \| gameplay$/, '$1 — jouer gratuitement en ligne | gameplay', '$1 — juega gratis en línea | gameplay', '$1 — kostenlos online spielen | gameplay', '$1 — gioca gratis online | gameplay', '$1 — jogue grátis online | gameplay'],
  [/^gameplay — (\d+) free browser games$/, 'gameplay — $1 jeux gratuits dans le navigateur', 'gameplay — $1 juegos gratis en el navegador', 'gameplay — $1 kostenlose Browserspiele', 'gameplay — $1 giochi gratis nel browser', 'gameplay — $1 jogos grátis no navegador'],
  [/^(.+) \| gameplay$/, '$t1 | gameplay', '$t1 | gameplay', '$t1 | gameplay', '$t1 | gameplay', '$t1 | gameplay'],
  [/^New best · (.+)$/, 'Nouveau record · $1', 'Nuevo récord · $1', 'Neuer Rekord · $1', 'Nuovo record · $1', 'Novo recorde · $1'],
  [/^(.+) is waiting in the lobby$/, '$1 attend dans le salon', '$1 está esperando en la sala', '$1 wartet in der Lobby', '$1 è in attesa nella lobby', '$1 está esperando no lobby'],
  [/^(.+) party$/, 'Groupe $t1', 'Grupo de $t1', '$t1-Gruppe', 'Gruppo $t1', 'Grupo de $t1'],
];
let lang = 'en';
try { const v = localStorage.getItem(LKEY); if (NAMES[v]) lang = v; } catch (e) {}
let li = LANGS.indexOf(lang), D = null, titles = null, frameEl = null, on = false;
const C = new Map(), TN = new WeakMap(), AN = new WeakMap(), DEEP = new Set(), SH = new WeakSet();
const sp = s => s.replace(/\s+/g, ' ').trim();
const ABC = /[A-Za-z]/;
const SKIP = 'script,style,code,kbd,textarea,svg,#langsel,.card .name,.srow .n,#pTitle,[data-pname],#uno,#unn,#auwho,[translate="no"]';
const PARTY = '.g-lobby,.g-net,.g-party,.g-loading,[data-i18n]';
const ATTRS = ['placeholder', 'aria-label', 'title'], PH = new Set(['Guest', 'Space']);
function isTitle(s) {
  if (!titles) { const g = window.Ameplay && Ameplay.debug && Ameplay.debug.games; if (!g || !g.length) return false; titles = new Set(); g.forEach(x => { titles.add(x.title); if (x.oldTitle) titles.add(x.oldTitle); }); }
  return titles.has(s);
}
function dict() {
  if (!D) { D = new Map(); if (li > 0) R.forEach(r => { if (r[li]) D.set(r[0], r[li]); }); }
  return D;
}
function tx(n) {
  if (C.has(n)) return C.get(n);
  let v = dict().get(n);
  if (v === undefined) {
    v = null;
    for (const p of P) {
      const m = p[0].exec(n);
      if (!m) continue;
      const x = p[li];
      if (x == null) break;
      v = typeof x === 'function' ? x(m) : x.replace(/\$(t?)(\d)/g, (_, k, i) => k ? T(m[i] || '') : m[i] || '');
      break;
    }
    if (v == null && n.includes(' · ')) { const a = n.split(' · '), b = a.map(x => isTitle(x) ? null : tx(x)); if (b.some(x => x != null)) v = b.map((x, i) => x == null ? a[i] : x).join(' · '); }
  }
  if (C.size > 5000) C.clear();
  C.set(n, v);
  return v;
}
function T(s, o) {
  let v = s;
  if (li > 0 && typeof s === 'string' && ABC.test(s)) { const n = sp(s); if (!isTitle(n)) { const x = tx(n); if (x != null) v = x; } }
  return o && typeof v === 'string' ? v.replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m) : v;
}
function txt(n) {
  const v = n.nodeValue, r = TN.get(n), en = r && v === r.o ? r.e : v;
  let o = en;
  if (li > 0 && ABC.test(en)) {
    const p = n.parentElement, c = sp(en);
    if (p && (PH.has(c) || !p.closest(SKIP))) {
      if (!isTitle(c)) {
        const t = (p.id && dict().get('#' + p.id + '|' + c)) || tx(c);
        if (t != null) { o = en.match(/^\s*/)[0] + t + en.match(/\s*$/)[0]; if (p.tagName === 'OPTION' && !p.hasAttribute('value')) p.setAttribute('value', c); }
      }
    }
  }
  if (o === en) { if (r) TN.delete(n); } else TN.set(n, { e: en, o });
  if (v !== o) n.nodeValue = o;
}
function att(el, a) {
  const v = el.getAttribute(a);
  if (v == null) return;
  let m = AN.get(el);
  const r = m && m[a], en = r && v === r.o ? r.e : v;
  let o = en;
  if (li > 0 && ABC.test(en) && !el.closest('[translate="no"]')) { const c = sp(en); if (!isTitle(c)) { const t = tx(c); if (t != null) o = t; } }
  if (o === en) { if (r) delete m[a]; } else { if (!m) AN.set(el, m = {}); m[a] = { e: en, o }; }
  if (v !== o) el.setAttribute(a, o);
}
function ats(el) { ATTRS.forEach(a => att(el, a)); if (el.tagName === 'INPUT' && el.readOnly) att(el, 'value'); }
function walk(x) {
  if (x.nodeType === 3) { txt(x); return; }
  if (x.nodeType !== 1) return;
  const w = document.createTreeWalker(x, 4);
  let n;
  while ((n = w.nextNode())) txt(n);
  ats(x);
  x.querySelectorAll('[placeholder],[aria-label],[title],input[readonly][value]').forEach(ats);
}
const mo = new MutationObserver(rs => {
  for (const r of rs) {
    const t = r.target;
    if (r.type === 'childList') {
      if (SH.has(t)) { const gr = t.classList.contains('g-root'); r.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (gr) { if (n.matches(PARTY)) deep(n); } else cover(n); }); }
      else r.addedNodes.forEach(walk);
    } else if (r.type === 'characterData') txt(t);
    else att(t, r.attributeName);
  }
  mo.takeRecords();
});
const OPT = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat('value') };
function deep(el) {
  if (DEEP.size > 80) DEEP.forEach(x => { if (!x.isConnected) DEEP.delete(x); });
  if (!DEEP.has(el)) { DEEP.add(el); mo.observe(el, OPT); }
  walk(el);
}
function shallow(el) { if (!SH.has(el)) { SH.add(el); mo.observe(el, { childList: true }); } }
function cover(el) {
  if (el.nodeType !== 1 || /^(SCRIPT|STYLE|LINK|CANVAS|NOSCRIPT|TEMPLATE|IMG|VIDEO|AUDIO)$/.test(el.tagName)) return;
  if (el.classList.contains('g-root')) { shallow(el); for (const c of el.children) if (c.matches(PARTY)) deep(c); return; }
  if (frameEl && el.contains(frameEl)) { shallow(el); for (const c of el.children) cover(c); return; }
  deep(el);
}
function ui() {
  const s = document.getElementById('langsel');
  if (s && s.value !== lang) s.value = lang;
  const m = document.querySelector('#smenu [data-pane="appearance"] small');
  if (m && m.textContent !== NAMES[lang]) m.textContent = NAMES[lang];
}
function apply(l) {
  if (!NAMES[l]) l = 'en';
  const changed = l !== lang;
  lang = l; li = LANGS.indexOf(l); D = null; C.clear();
  document.documentElement.lang = l;
  if (on) { DEEP.forEach(el => { if (el.isConnected) walk(el); else DEEP.delete(el); }); mo.takeRecords(); ui(); }
  return changed;
}
function set(l) {
  if (!NAMES[l]) l = 'en';
  try { localStorage.setItem(LKEY, l); } catch (e) {}
  if (apply(l) && window.Ameplay && Ameplay.analytics) Ameplay.analytics.track('setting', { k: 'lang', v: l });
}
function start() {
  if (on) return;
  on = true;
  frameEl = document.getElementById('frame');
  document.documentElement.lang = lang;
  const tl = document.querySelector('title');
  if (tl) deep(tl);
  shallow(document.body);
  for (const c of document.body.children) cover(c);
  mo.takeRecords();
  ui();
  document.addEventListener('change', e => { if (e.target && e.target.id === 'langsel') set(e.target.value); });
  addEventListener('storage', e => { if (e.key === LKEY) apply(NAMES[e.newValue] ? e.newValue : 'en'); });
}
function scan() {
  const vals = [...dict().values()], rev = new Set(vals), rre = vals.filter(x => x.includes('{')).map(x => new RegExp('^' + x.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\w+\}/g, '.+') + '$'));
  const out = new Set(), keep = v => rev.has(v) || (v.includes(' · ') && v.split(' · ').every(x => keep(x))) || rre.some(r => r.test(v)) || !ABC.test(v) || isTitle(v) || tx(v) != null || /^[\d hms]+$|@|^gameplay$/.test(v) || Object.values(NAMES).includes(v);
  DEEP.forEach(el => {
    if (!el.isConnected) return;
    const w = document.createTreeWalker(el, 4);
    let n;
    while ((n = w.nextNode())) { const r = TN.get(n), v = sp(n.nodeValue); if ((r && n.nodeValue === r.o) || keep(v) || (n.parentElement && n.parentElement.closest(SKIP))) continue; out.add(v); }
    [el, ...el.querySelectorAll('[placeholder],[aria-label],[title]')].forEach(x => ATTRS.forEach(a => { const v = x.getAttribute && x.getAttribute(a), m = AN.get(x); if (v && !(m && m[a] && m[a].o === v) && !keep(sp(v)) && !x.closest('[translate="no"]')) out.add('@' + a + ' ' + sp(v)); }));
  });
  return [...out];
}
window.gpI18n = { get lang() { return lang; }, set, t: T, names: NAMES, scan };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
