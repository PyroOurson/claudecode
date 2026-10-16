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
  { key: 'g', name: 'Genre', opts: GENRES.map(k => [k, GENRE_NAME[k] || k]) },
  { key: 'p', name: 'Players', opts: [['s', 'Solo'], ['o', 'Online']] },
  { key: 'v', name: 'Look', opts: [['3d', '3D'], ['2d', '2D']] },
  { key: 'c', name: 'Controls', opts: [['kb', 'Keyboard'], ['tp', 'Mouse or touch']] },
  { key: 't', name: 'Length', opts: [['q', 'Quick'], ['m', 'Medium'], ['l', 'Long']] }
];
const SORTS = [['rel', 'Best match'], ['rec', 'Popular'], ['az', 'A to Z'], ['new', 'Newest'], ['played', 'Most played'], ['short', 'Shortest']];
const PATH_MODE = /(^|\.)(web\.app|firebaseapp\.com)$/i.test(location.hostname) || (() => { try { return sessionStorage.getItem('gameplay:paths') === '1'; } catch (e) { return false; } })();
const PAUSE = { on: false };
(() => { try { if (localStorage.getItem('gameplay:reset') !== '2') { localStorage.removeItem('gameplay:profile'); localStorage.removeItem('gameplay:analytics'); localStorage.removeItem('gameplay:sid'); const o = JSON.parse(localStorage.getItem('gameplay:v1') || '{}') || {}; o.best = {}; o.plays = {}; o.recent = []; o.time = {}; localStorage.setItem('gameplay:v1', JSON.stringify(o)); localStorage.setItem('gameplay:reset', '2'); } } catch (e) {} })();
const SUPABASE_URL = 'https://uafouyvtcijptspjbsqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Lry5e9J350lXelAUPHU1rg_3YYvTuAf';
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
function applyGlScale(s) {
  const pr = Math.min(2.5, Math.min(window.devicePixelRatio || 1, 2) * Math.max(1, s));
  glSet.forEach(({ renderer, THREE }) => {
    try {
      if (Math.abs(renderer.getPixelRatio() - pr) < 0.01) return;
      const v = renderer.getSize(new THREE.Vector2());
      renderer.setPixelRatio(pr); renderer.setSize(v.x, v.y, false);
    } catch (e) {}
  });
}
const shortQuery = window.matchMedia ? matchMedia('(max-height: 520px) and (orientation: landscape)') : { matches: false };
const stageMode = () => gamebox.classList.contains('fs') ? 'fs' : (view === 'game' && gamebox.classList.contains('theater')) ? 'theater' : 'off';
function fitStage() {
  const mode = stageMode();
  const frameEl = document.getElementById('frame'), st = document.getElementById('stage');
  if (mode === 'off') {
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
    s = Math.max(0.3, Math.min((sw - pad * 2) / cw, (sh - pad * 2) / ch, 4));
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
function startFitTimer() { clearInterval(fitTimer); fitTimer = setInterval(() => { if (stageMode() !== 'off') fitStage(); }, 1500); }

const libP = {};
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
const loadThree = () => loadLib('THREE', ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', 'https://unpkg.com/three@0.128.0/build/three.min.js']);
let invite = null;
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const loadPeer = () => loadLib('Peer', ['https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js', 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js']);
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
        if (done) return;
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
      else if (net.invite) joining(net.invite);
      else hosting();
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
    get invite() { return invite && invite.id === g.id ? invite.code : null; },
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
      const glEntry = { renderer, THREE };
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

const state = { q: '', g: new Set(), p: new Set(), t: new Set(), v: new Set(), c: new Set(), sort: '' };
const FKEYS = ['g', 'p', 't', 'v', 'c'];
function resetState() { state.q = ''; FKEYS.forEach(k => state[k].clear()); state.sort = ''; }
const activeCount = () => FKEYS.reduce((n, k) => n + state[k].size, 0);
const defSort = () => state.q.trim() ? 'rel' : 'rec';
const nFilters = () => activeCount() + (state.sort && state.sort !== defSort() ? 1 : 0);
function passes(g) {
  const m = g.info;
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
  imgs.forEach(im => { if (im.closest('#pThumb')) lzCover(im.dataset.cv, true); else if (wait) return; else if (!LZ.io || im.closest('.rail')) lzCover(im.dataset.cv); else LZ.io.observe(im); });
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
const card = (g, src, i) => `<a class="card${sel === g.id && src === 'grid' ? ' sel' : ''}" href="${href(g.id)}" data-id="${g.id}" data-src="${src}" style="--c:${tint(g)};--i:${i || 0}"><div class="art">${img(g, i != null && i < 10)}</div><div class="name">${esc(g.title)}</div></a>`;
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
try { consent = JSON.parse(localStorage.getItem(CK_KEY)); } catch (e) {}
if (!consent || typeof consent !== 'object' || consent.v !== 2) consent = null;
const anOk = () => !!(consent && consent.analytics);
let anQ = [];
try { anQ = JSON.parse(localStorage.getItem(AN_KEY)) || []; } catch (e) {}
if (!Array.isArray(anQ)) anQ = [];
if (!anOk()) anQ = [];
let anHold = [], anT = 0, anErr = 0, anBusy = false;
const SID = (() => { try { const o = JSON.parse(sessionStorage.getItem('gameplay:sid')); if (o && o.id && Date.now() - o.t < 30 * 60e3) return o.id; } catch (e) {} return rid(); })();
const T0 = Date.now();
function anSave() { try { if (anOk()) localStorage.setItem(AN_KEY, JSON.stringify(anQ)); } catch (e) { anQ.splice(0, Math.ceil(anQ.length / 4)); } }
function anClean(p) {
  const o = {};
  Object.keys(p).slice(0, 24).forEach(k => {
    const v = p[k];
    if (v == null) return;
    if (typeof v === 'number') o[k] = isFinite(v) ? Math.round(v * 100) / 100 : null;
    else if (typeof v === 'boolean') o[k] = v;
    else if (typeof v === 'string') o[k] = v.slice(0, 160);
    else if (Array.isArray(v)) o[k] = v.slice(0, 12).map(x => typeof x === 'object' ? String(x) : x);
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
  try { localStorage.setItem(CK_KEY, JSON.stringify(consent)); } catch (e) {}
  if (an) { anQ = anQ.concat(anHold); anHold = []; track('consent', { analytics: true }); anSave(); }
  else { anQ = []; anHold = []; try { localStorage.removeItem(AN_KEY); if (SB.on) localStorage.removeItem(VIDK); } catch (e) {} }
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
  const g = cur.g; cur.kill();
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
  const t = setTimeout(() => { if (pend !== g || !box.isConnected) return; const el = document.createElement('div'); el.className = 'g-loading'; el.innerHTML = '<i></i><span>Loading…</span>'; box.append(el); }, 200);
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
  clickSrc = null;
  setHead(g.title + ' — play free online | gameplay', g.title + ' on gameplay: ' + (g.blurb || '') + ' Free to play in your browser, no download.', '/' + g.id);
  $('#pTitle').textContent = g.title;
  $('#pSub').textContent = gname(g.info.genres[0]) + ' · ' + playersText(g.info.pl);
  $('#pScoreK').textContent = g.info.stat || 'Score';
  $('#pThumb').innerHTML = img(g, true); $('#pThumb').style.setProperty('--c', tint(g));
  gamebox.style.setProperty('--fw', (g.width || 880) + 'px');
  $('#more').innerHTML = related(g).slice(0, 10).map(x => card(x, 'more')).join('');
  showView('game');
  if (!$('#slist').children.length) renderResults();
  scrollTo({ top: 0, behavior: 'instant' });
  gamebox.classList.remove('enter'); void gamebox.offsetWidth; gamebox.classList.add('enter');
  syncTheater();
  if (shortQuery.matches) requestAnimationFrame(toStage);
  if (g.mount) { start(g); track('game_launch', { game: g.id, ms: 0, lazy: false }); } else waitStart(g);
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
}

let view = '', homeY = 0;
function showView(v) {
  closeAll();
  document.body.classList.toggle('in-game', v === 'game');
  if (view === v) return false;
  if (view === 'home') homeY = scrollY;
  view = v;
  ['home', 'game', 'legal', 'admin'].forEach(k => { const el = $('#v' + k[0].toUpperCase() + k.slice(1)); el.hidden = k !== v; if (k === v) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; } });
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
  const sl = $('#slist'), sy = sl.scrollTop;
  sl.innerHTML = list.map(srow).join('');
  sl.scrollTop = sy;
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

const LEGAL = {
  terms: ['Terms of Service', `<p>These terms apply when you use gameplay, a free website of browser games. By playing on the site you agree to them. If you do not agree, please do not use the site.</p>
<h2>1. What gameplay is</h2><p>gameplay is a fan-made, non-commercial hobby project. Most games are remakes inspired by well-known games. gameplay is not affiliated with, endorsed by or sponsored by the creators, publishers or owners of the original games. Game names are used only to say which game a remake is inspired by. All trademarks and original works belong to their owners.</p>
<h2>2. Using the site</h2><ul><li>The site is free and for personal, non-commercial use.</li><li>Do not try to break, overload, copy at scale or misuse the site, and do not use it to cheat or harm other players.</li><li>Some versions of the site are protected by a password. Do not share it publicly.</li></ul>
<h2>3. Online play</h2><p>Online games connect you directly to the other players in your party using a party code. Be respectful: no harassment, hate, threats, spam or sharing other people's personal information. Do not share your own personal details in names or chat. The host of a party can remove players, and you can leave a party at any time.</p>
<h2>4. Names and messages</h2><p>Your username, display name and chat messages must not be offensive, misleading or impersonate someone else. We may block names or content that break these terms.</p>
<h2>5. Accounts</h2><p>Today you play without an account and your data stays in your browser. We plan to add optional sign-in with Google. When we do, these terms will be updated.</p>
<h2>6. Your data on this device</h2><p>Records, saves and settings are kept in your browser. Clearing your browser data, using private browsing or switching devices can remove them. We cannot restore data that was stored only on your device.</p>
<h2>7. No warranty</h2><p>The site is provided "as is" and "as available". Games can change, move or be removed at any time, and the site may sometimes be unavailable or contain bugs.</p>
<h2>8. Liability</h2><p>To the extent the law allows, the people who run gameplay are not liable for indirect or consequential losses, or for loss of data, arising from your use of the site. Nothing in these terms limits liability that cannot be limited by law.</p>
<h2>9. Rights holders</h2><p>If you own the rights to a game, name or artwork and want something changed or removed, contact us and we will act promptly.</p>
<h2>10. Changes</h2><p>We may update these terms. The date at the top shows the latest version. If you keep using the site after a change, the new terms apply.</p>
<h2>11. Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`],
  privacy: ['Privacy Policy', `<p>In short: you do not need an account, there are no ads, we do not sell data, and what the site remembers about you is stored in your own browser.</p>
<h2>What is stored on your device</h2><table><thead><tr><th>Name</th><th>What it holds</th><th>Kind</th></tr></thead><tbody>
<tr><td><code>gameplay:v1</code></td><td>Best scores, play counts, time played, recently played games and settings such as theme and sound</td><td>Essential</td></tr>
<tr><td><code>gameplay:save:…</code></td><td>Saved progress for games that support it</td><td>Essential</td></tr>
<tr><td><code>gameplay:profile</code></td><td>The username and display name you choose</td><td>Essential</td></tr>
<tr><td><code>gameplay:consent</code></td><td>Your cookie choice</td><td>Essential</td></tr>
<tr><td><code>gameplay:gate</code>, <code>gpgate</code></td><td>Password unlock and wrong attempts, only on the password-protected version</td><td>Essential</td></tr>
<tr><td><code>gameplay:analytics</code>, <code>gameplay:sid</code></td><td>Usage events and a random session ID, only if you accept analytics</td><td>Analytics</td></tr>
</tbody></table>
<h2>Analytics</h2><p>Only if you accept analytics, the site records events such as which games are opened and clicked, how long they are played (only while the tab is visible and the game is not paused), searches typed in the search box, filters used, online parties started, errors, and basic device information: device type (phone, tablet or computer), operating system and browser family, screen size and language. Events are linked to a random session ID, not to your name or email.</p><p>Right now these events stay in your browser and are not sent anywhere. We plan to send them to our own database (hosted on Supabase) to learn which games people enjoy. We will update this policy before that starts. If you reject analytics, nothing is recorded.</p>
<h2>Online play</h2><p>Online games connect players directly using WebRTC. To find each other, browsers use the PeerJS connection service and connection helper (STUN and TURN) servers. Players in your party see the name you enter and your chat messages. As with any direct connection, the other players and these services can see your IP address. We do not store chat messages.</p>
<h2>Other services</h2><ul><li>Firebase Hosting (Google) delivers the website and may keep standard server logs, such as IP address and time of request.</li><li>Google Fonts provides the fonts. Your browser downloads them from Google, which receives your IP address.</li><li>The 3D engine and the networking library are downloaded from public content delivery networks (cdnjs and jsDelivr).</li></ul>
<h2>Accounts, coming later</h2><p>We plan to add optional sign-in with Google, with profiles, friends and records stored in our database on Supabase. Signing in will stay optional. When it launches, this policy will explain exactly what is stored, for how long and why.</p>
<h2>Your choices</h2><ul><li>Change your cookie choice at any time in Cookie settings.</li><li>Download your data in Settings, Privacy and data.</li><li>Delete it in Settings, Account, or by clearing this site's data in your browser.</li></ul><p>Depending on where you live, you may have rights to access, correct, delete or object to the use of your personal data. Because today we hold no personal data on our servers, most requests can be handled directly in your browser with the tools above.</p>
<h2>Children</h2><p>The site is meant for a general audience. Children under 13, or under the age of digital consent in their country, should ask a parent or guardian before playing online with others.</p>
<h2>Changes</h2><p>We will update this policy when the site changes, in particular before analytics are sent to a server or accounts are introduced. The date at the top shows the latest version.</p>
<h2>Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`],
  cookies: ['Cookie Policy', `<p>This policy explains the cookies and similar browser storage (local storage and session storage) used by gameplay.</p>
<h2>Essential</h2><p>These make the site work and are always on: your records, saves, profile, settings, your cookie choice and, on the password-protected version, the password unlock. They stay in your browser and are never used to track you.</p>
<h2>Analytics (optional)</h2><p>If you accept, the site stores anonymous usage events, such as games opened, time played, searches and filters, with a random session ID (<code>gameplay:analytics</code>, <code>gameplay:sid</code>). They help us understand which games people play. For now they stay on your device. Rejecting analytics turns this off and deletes what was stored.</p>
<h2>No advertising cookies</h2><p>gameplay does not use advertising or cross-site tracking cookies.</p>
<h2>Third parties</h2><p>Fonts, the 3D engine and the networking library are loaded from Google Fonts, cdnjs and jsDelivr, and online games use the PeerJS service. These services receive your IP address when your browser contacts them, but gameplay does not let them set cookies through the site.</p>
<h2>Your choice</h2><p>You can change your choice at any time: <button class="btn2" type="button" data-cookieset>Cookie settings</button></p><p>You can also delete all site data in your browser settings.</p>
<h2>Contact</h2><p>Questions, requests about your data, or a rights holder asking for a change: email <a href="mailto:gabriel06401@gmail.com">gabriel06401@gmail.com</a>.</p>`]
};
function openLegal(k) {
  closeGame();
  showView('legal');
  const d = LEGAL[k];
  $('#doc').innerHTML = `<h1>${d[0]}</h1><p class="upd">Last updated 16 October 2026</p>${d[1]}`;
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
  const els = [...box.querySelectorAll('[data-n]')];
  if (!els.length || !motionOK()) return;
  const f = el => el.dataset.f === 'd' ? fmtDur : x => String(Math.round(x));
  const t0 = performance.now() + 120, D = 900;
  els.forEach(el => { el.textContent = f(el)(0); });
  const step = t => {
    const k = Math.max(0, Math.min(1, (t - t0) / D)), e = 1 - Math.pow(1 - k, 3);
    els.forEach(el => { if (el.isConnected) el.textContent = f(el)(+el.dataset.n * e); });
    if (k < 1 && els[0].isConnected) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function setOpen(k) {
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
}
function closeAll() { if (openK) setOpen(openK); }
function showPane(p) {
  document.querySelectorAll('.pane').forEach(x => { const on = x.dataset.pane === p; if (on && !x.hidden) { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; } x.hidden = !on; });
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
  document.querySelectorAll('[data-psub]').forEach(el => { el.textContent = un ? '@' + un : SB.user ? SB.user.email || 'Signed in' : 'Playing as a guest'; });
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
function unClose() { $('#unmodal').hidden = true; }
function renderFriends() { frOpen(); }
const fmtDur = s => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? h + 'h ' + m + 'm' : m ? m + 'm' : s + 's'; };
function ago(t) {
  if (!t) return '—';
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(t).setHours(0, 0, 0, 0)) / 864e5);
  return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? d + ' days ago' : d < 14 ? 'Last week' : new Date(t).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
function renderStats() {
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
  if (k === 'n_inv' || k === 'n_req') return S.prefs[k] !== false;
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
    S.prefs[k] = v; save();
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
  document.querySelectorAll('[data-fs]').forEach(b => { b.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen'); b.title = on ? 'Exit fullscreen' : 'Fullscreen'; });
  clearInterval(fitTimer);
  frame.classList.add('no-anim');
  if (on) { frame.style.transform = ''; fsScale = 1; fsT = [0, 0]; requestAnimationFrame(() => requestAnimationFrame(() => { fitStage(); frame.classList.remove('no-anim'); })); fitTimer = setInterval(fitStage, 1500); }
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
  document.addEventListener('visibilitychange', () => { ttSync(); if (document.visibilityState === 'hidden') { ttCommit(true); anSave(); anFlush(); } });
  addEventListener('pagehide', () => { ttCommit(true); track('session_end', { sec: Math.round((Date.now() - T0) / 1000) }); anSave(); anFlush(); });
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
  document.querySelectorAll('[data-sel]').forEach(s => s.addEventListener('change', () => { S.prefs[s.dataset.sel] = s.value; save(); track('setting', { k: s.dataset.sel, v: s.value }); }));
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
  $('#dosignout').addEventListener('click', () => { closeAll(); if (SB.user) { auSignOut(); return; } toast('Accounts are coming soon. You are playing as a guest.'); track('soon', { what: 'sign_out' }); });
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
    const tryAt = i => {
      if (i >= SUPABASE_JS.length) { SB.lib = null; rej(new Error('Sign-in could not load')); return; }
      const s = document.createElement('script');
      s.src = SUPABASE_JS[i]; s.async = true; s.crossOrigin = 'anonymous';
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
      SB.c = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: SB_STORE } });
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
  const r = await fetch(SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path, { method: o.method || 'GET', headers: h, body, keepalive: !!o.keep && (!body || body.length < 60000), credentials: 'omit', cache: 'no-store' });
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
    let v = localStorage.getItem(VIDK);
    if (!/^[a-z0-9]{4,40}$/.test(v || '')) { v = (rid() + rid()).replace(/[^a-z0-9]/g, '').slice(0, 32); localStorage.setItem(VIDK, v); }
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
    auSyncNote();
  }
}

const auState = () => !SB.on ? 'off' : SB.user ? 'in' : 'out';
const auT = s => window.gpI18n ? gpI18n.t(s) : s;
const GUEST_K = 'gameplay:guest';
const auCoarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
function auMsg(id, m, kind) { const n = $('#' + id); if (!n) return; n.textContent = m || ''; n.className = 'note' + (kind ? ' ' + kind : ''); }
function auShake(el) { if (!el) return; el.classList.remove('au-shake'); void el.offsetWidth; el.classList.add('au-shake'); }
function auErrText(e) {
  const m = String(e && (e.message || e.error_description || e) || ''), c = String(e && e.code || '');
  if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'Wrong email, username or password.';
  if (c === 'email_not_confirmed' || /email not confirmed/i.test(m)) return 'Confirm your email first: open the link we sent you.';
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
  const ok = !!(SB.on && SB.set && SB.set.external && SB.set.external.google);
  document.querySelectorAll('[data-auth="google"]').forEach(b => { b.disabled = !ok; b.title = ok ? '' : 'Coming soon'; if (b.classList.contains('btn2')) b.textContent = ok ? 'Continue' : 'Coming soon'; });
  $('#ausoon').hidden = ok;
}
function auSettings() {
  if (!SB.on || SB.set) return;
  if (!SB.gs) SB.gs = fetch(SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/settings', { headers: { apikey: SUPABASE_ANON_KEY }, credentials: 'omit', cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null).then(j => { SB.gs = null; if (j && j.external) { SB.set = j; auGoogleUi(); } });
}
function auView(v) {
  SB.view = v;
  const up = SB.mode === 'up';
  document.querySelectorAll('[data-auview]').forEach(el => { const on = el.dataset.auview === v; if (on && el.hidden) { el.classList.remove('au-in'); void el.offsetWidth; el.classList.add('au-in'); } el.hidden = !on; });
  const tabs = $('#autabs');
  tabs.hidden = v !== 'main'; tabs.dataset.m = SB.mode;
  tabs.querySelectorAll('[data-aumode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.aumode === SB.mode)));
  document.querySelectorAll('#auform [data-up]').forEach(el => { el.hidden = !up; });
  $('#aut').textContent = up ? 'Create your account' : 'Welcome back';
  $('#ausub').textContent = up ? 'Keep your records and saves on every device and add friends.' : 'Log in to keep your records and saves on every device.';
  $('#auel').textContent = up ? 'Email' : 'Email or username';
  const em = $('#auemail');
  em.type = up ? 'email' : 'text'; em.autocomplete = up ? 'email' : 'username'; em.inputMode = up ? 'email' : 'text';
  $('#aupass').autocomplete = up ? 'new-password' : 'current-password';
  $('#aupass').placeholder = up ? 'At least 8 characters' : '';
  $('#augo').textContent = up ? 'Create account' : 'Log in';
  $('#auforgot').hidden = up;
  $('#aumodal .au-legal').hidden = (up && v === 'main') || v === 'newpass';
  $('#aumodal .au-guest').hidden = v === 'newpass' || !!SB.user;
  document.querySelectorAll('#aumodal .au-eye[aria-pressed="true"]').forEach(b => auEye(b, true));
  auResendTick();
}
function auShow() {
  $('#auoff').hidden = SB.on;
  if (SB.on) { sbClient().catch(() => {}); auSettings(); }
  ['aunote', 'arnote', 'annote', 'acnote'].forEach(id => auMsg(id, ''));
  auView(['newpass', 'reset', 'check'].includes(SB.view) ? SB.view : 'main');
  auBusy(false);
  setTimeout(() => { const f = { newpass: '#anpass', reset: '#aremail', main: SB.mode === 'up' ? '#auuser' : '#auemail' }[SB.view]; const n = f && $(f); if (n && SB.on && !auCoarse() && openK === 'mauth') n.focus({ preventScroll: true }); }, 80);
}
function auOpen(v, msg, kind, mode) {
  SB.view = v;
  if (mode) SB.mode = mode;
  if (openK !== 'mauth') setOpen('mauth'); else auView(v);
  if (msg) auMsg(v === 'reset' ? 'arnote' : v === 'newpass' ? 'annote' : v === 'check' ? 'acnote' : 'aunote', msg, kind);
}
function auBusy(on, sel) {
  document.querySelectorAll(sel || '#aumodal .au-card button, #aumodal .au-card input').forEach(b => { b.disabled = on || (!SB.on && !b.closest('#autabs, [data-auguest]')); });
  $('#aumodal').classList.toggle('au-busy', !!on && !sel);
  if (!on) { auGoogleUi(); auResendTick(); }
}
function auBad(id, m) { auMsg('aunote', m, 'bad'); const n = $('#' + id); if (!n) return; auShake(n.closest('.fld, .au-chk') || n); if (!auCoarse() || id !== 'auterms') n.focus({ preventScroll: true }); }
function auGuest() {
  try { (SB.on ? localStorage : sessionStorage).setItem(GUEST_K, '1'); } catch (e) {}
  track('auth', { act: 'guest' });
  if (openK === 'mauth') closeAll();
}
function auFirst() {
  let seen = false;
  try { seen = !!(localStorage.getItem(GUEST_K) || sessionStorage.getItem(GUEST_K)); } catch (e) {}
  if (seen || SB_RET || sbHasSession() || openK || view === 'legal') return;
  SB.mode = 'up'; SB.view = 'main';
  setOpen('mauth');
}
async function auGoogle() {
  if (!SB.on) return;
  const inModal = openK === 'mauth';
  if (inModal) auMsg('aunote', 'Opening Google…');
  try {
    try { sessionStorage.setItem('gameplay:authback', location.pathname + location.search + location.hash); } catch (e) {}
    const c = await sbClient();
    track('auth', { act: 'google' });
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: sbRedirect('google'), queryParams: { prompt: 'select_account' } } });
    if (error) throw error;
  } catch (e) {
    if (inModal) auMsg('aunote', auErrText(e), 'bad'); else toast(auErrText(e));
  }
}
async function auSubmit() {
  if (!SB.on) return;
  const up = SB.mode === 'up', id = $('#auemail').value.trim(), pw = $('#aupass').value;
  if (up) {
    const un = $('#auuser').value.trim().toLowerCase().replace(/^@/, '');
    if (!UN_RE.test(un) || /^\.|\.$|\.\./.test(un)) return auBad('auuser', 'Choose a username: 3 to 20 lowercase letters, numbers, dots or underscores.');
    if (!EMAIL_RE.test(id)) return auBad('auemail', 'Enter a valid email address.');
    if (pw.length < 8) return auBad('aupass', 'Use at least 8 characters for your password.');
    if (pw !== $('#aupass2').value) return auBad('aupass2', 'The two passwords are not the same.');
    if (!$('#auterms').checked) return auBad('auterms', 'Tick the box to agree to the Terms of Use and the Privacy Policy.');
    auBusy(true); auMsg('aunote', 'Creating your account…');
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
      $('#aupass').value = ''; $('#aupass2').value = '';
      if (r.data && r.data.session) { closeAll(); return; }
      SB.loud = false; SB.cmail = id; SB.rsAt = Date.now() + 60000;
      $('#aucmail').textContent = id;
      auView('check'); auMsg('aunote', '');
    } catch (e) { SB.loud = false; auMsg('aunote', auErrText(e), 'bad'); }
    finally { auBusy(false); }
    return;
  }
  if (!id) return auBad('auemail', 'Enter your email or username.');
  if (id.includes('@') && !EMAIL_RE.test(id)) return auBad('auemail', 'Enter a valid email address.');
  if (!pw) return auBad('aupass', 'Enter your password.');
  auBusy(true); auMsg('aunote', 'Logging in…');
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
    $('#aupass').value = ''; closeAll();
  } catch (e) {
    SB.loud = false;
    if (e && (e.code === 'email_not_confirmed' || /email not confirmed/i.test(e.message || ''))) { SB.cmail = email; $('#aucmail').textContent = email; auView('check'); auMsg('acnote', 'Confirm your email first: open the link we sent you, or send a new one.', 'bad'); }
    else auMsg('aunote', auErrText(e), 'bad');
  }
  finally { auBusy(false); }
}
function auResendTick() {
  clearTimeout(SB.rsT);
  const b = $('#auresend'), left = Math.ceil((syNum(SB.rsAt) - Date.now()) / 1000);
  if (!b) return;
  if (left > 0 && SB.view === 'check') { b.disabled = true; b.textContent = auT('Resend email in {n} s').replace('{n}', left); SB.rsT = setTimeout(auResendTick, 1000); }
  else { b.disabled = !SB.on; b.textContent = 'Resend email'; }
}
async function auResend() {
  if (!SB.on || !SB.cmail || syNum(SB.rsAt) > Date.now()) return;
  $('#auresend').disabled = true; auMsg('acnote', 'Sending…');
  try {
    const c = await sbClient();
    const { error } = await c.auth.resend({ type: 'signup', email: SB.cmail, options: { emailRedirectTo: sbRedirect('signup') } });
    if (error) throw error;
    SB.rsAt = Date.now() + 60000;
    track('auth', { act: 'resend' });
    auMsg('acnote', 'Sent again. Use the newest email: it replaces the old link.', 'ok');
  } catch (e) { auMsg('acnote', auErrText(e), 'bad'); }
  finally { auResendTick(); }
}
async function auReset() {
  if (!SB.on) return;
  const email = $('#aremail').value.trim();
  if (!EMAIL_RE.test(email)) { auMsg('arnote', 'Enter a valid email address.', 'bad'); auShake($('#aremail').closest('.fld')); return; }
  auBusy(true); auMsg('arnote', 'Sending…');
  try {
    const c = await sbClient();
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: sbRedirect('recovery') });
    if (error) throw error;
    track('auth', { act: 'reset' });
    auMsg('arnote', 'Check your inbox. If an account uses this email, we sent it a link to choose a new password.', 'ok');
  } catch (e) { auMsg('arnote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auNewPass() {
  if (!SB.on) return;
  const pw = $('#anpass').value;
  if (pw.length < 8) { auMsg('annote', 'Use at least 8 characters.', 'bad'); auShake($('#anpass').closest('.fld')); return; }
  if (pw !== $('#anpass2').value) { auMsg('annote', 'The two passwords are not the same.', 'bad'); auShake($('#anpass2').closest('.fld')); return; }
  auBusy(true); auMsg('annote', 'Saving…');
  try {
    const c = await sbClient();
    const { error } = await c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#anpass').value = ''; $('#anpass2').value = ''; SB.view = 'main';
    auMsg('annote', 'Password saved. You are logged in.', 'ok');
    setTimeout(() => { if (openK === 'mauth') closeAll(); }, 1400);
  } catch (e) { auMsg('annote', auErrText(e), 'bad'); }
  finally { auBusy(false); }
}
async function auChangeEmail() {
  const email = $('#auem2').value.trim();
  if (!EMAIL_RE.test(email)) { auMsg('auemnote', 'Enter a valid email address.', 'bad'); return; }
  if (SB.user && email.toLowerCase() === String(SB.user.email || '').toLowerCase()) { auMsg('auemnote', 'That is already your email address.', 'bad'); return; }
  const b = $('#auemsave'); b.disabled = true; auMsg('auemnote', 'Sending…');
  try {
    const { error } = await SB.c.auth.updateUser({ email }, { emailRedirectTo: sbRedirect('email') });
    if (error) throw error;
    auMsg('auemnote', 'Check your inbox: open the link we sent to confirm the change. You may get a link at your old address too.', 'ok');
  } catch (e) { auMsg('auemnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; }
}
async function auChangePass() {
  const pw = $('#aupw2').value;
  if (pw.length < 8) { auMsg('aupwnote', 'Use at least 8 characters.', 'bad'); return; }
  const b = $('#aupwsave'); b.disabled = true; auMsg('aupwnote', 'Saving…');
  try {
    const { error } = await SB.c.auth.updateUser({ password: pw });
    if (error) throw error;
    $('#aupw2').value = '';
    auMsg('aupwnote', 'Password saved.', 'ok');
  } catch (e) { auMsg('aupwnote', auErrText(e), 'bad'); }
  finally { b.disabled = false; }
}
async function auSignOut() {
  if (!SB.c) return;
  toast('Signing out…');
  try { await Promise.race([sySync(), new Promise(r => setTimeout(r, 4000))]); } catch (e) {}
  try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
  track('auth', { act: 'signout' });
  toast('Signed out. You are playing as a guest.');
}
async function auDeleteAccount() {
  const b = $('#adelbtn'); b.disabled = true; auMsg('adelnote', 'Deleting your account…');
  try {
    const r = await sbRest('rpc/delete_my_account', { method: 'POST', body: {} });
    SY = syNew(); sySave();
    try { await SB.c.auth.signOut({ scope: 'local' }); } catch (e) {}
    $('#adelc').value = '';
    auMsg('adelnote', '');
    closeAll();
    toast(r === 'requested' ? 'Your account will be deleted. You are now playing as a guest.' : 'Your account was deleted. You are now playing as a guest.');
  } catch (e) { auMsg('adelnote', 'Could not delete your account. Check your connection and try again.', 'bad'); b.disabled = false; }
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
  b.disabled = true;
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
  } finally { b.disabled = false; }
}
async function auDisplayName(v) {
  const b = $('#dnsave'); b.disabled = true;
  try {
    const r = await sbRest('profiles?id=eq.' + SB.user.id + '&select=' + AU_SEL, { method: 'PATCH', body: { display_name: v }, prefer: 'return=representation' });
    if (r && r[0]) SB.prof = r[0];
    setProfile({ displayName: v });
    say('dnnote', 'Display name saved.', 1);
  } catch (e) { say('dnnote', 'Could not save. Check your connection and try again.'); }
  finally { b.disabled = false; }
}
async function auSignedIn(ev) {
  const uid = SB.user.id, loud = SB.loud;
  SB.loud = false;
  SB.prof = null;
  FR.list = FR.req = null;
  auRender();
  if (openK === 'mauth' && SB.view !== 'newpass') closeAll();
  try { await auLoadProfile(); } catch (e) {}
  if (!SB.user || SB.user.id !== uid) return;
  auRender();
  adCheck();
  if (loud) toast(auT('Logged in as {name}').replace('{name}', SB.prof && SB.prof.username ? '@' + SB.prof.username : SB.user.email || 'you'));
  sySync();
  if (loud && SB.prof && !SB.prof.username) setTimeout(auChoose, 400);
}
function auSignedOut() {
  SB.prof = null; SB.fail = 0;
  FR.list = FR.req = FR.res = null; FR.rq = '';
  clearTimeout(SB.t);
  if (SB.choosing && !$('#unmodal').hidden) unClose();
  SB.choosing = false;
  adSignedOut();
  auRender();
}
function auSession(ev, s) {
  SB.session = s || null;
  const u = s && s.user || null, was = SB.user;
  if (u && was && u.id === was.id) { SB.user = u; if (ev === 'USER_UPDATED') auRender(); return; }
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
  let error = null;
  try { const x = await SB.c.auth.exchangeCodeForSession(r.code); error = x.error; } catch (e) { error = e; }
  if (error) {
    SB.loud = false;
    auOpen(r.kind === 'recovery' ? 'reset' : 'main', r.kind === 'signup' ? 'Your email is probably confirmed already. Log in with your email or username and your password.' : r.kind === 'recovery' ? 'This link has expired or was opened in another browser. Ask for a new one.' : r.kind === 'email' ? 'Open the link in the browser where you are logged in, or log in again.' : 'Sign-in did not finish. Please try again.', 'bad', 'in');
    return;
  }
  track('auth', { act: 'return', kind: String(r.kind || '').slice(0, 12) });
  if (r.kind === 'recovery') { const em = SB.session && SB.session.user && SB.session.user.email; if (em) $('#anuser').value = em; auOpen('newpass'); }
  else if (r.kind === 'email') toast('Your email address was updated');
}
function auPatchLegal() {
  const lp = (k, a, b) => { if (LEGAL[k] && LEGAL[k][1].includes(a)) LEGAL[k][1] = LEGAL[k][1].replace(a, b); };
  lp('terms', '<p>Today you play without an account and your data stays in your browser. We plan to add optional sign-in with Google. When we do, these terms will be updated.</p>', '<p>An account is optional. You can sign in with Google or with an email address and a password. Keep your password safe and do not share your account. You can delete your account at any time in Settings, Account. We may suspend accounts that break these terms.</p>');
  lp('terms', '<p>Records, saves and settings are kept in your browser.', '<p>Records, saves and settings are kept in your browser. If you sign in, your records and saves are also copied to your account.');
  lp('privacy', '<p>In short: you do not need an account, there are no ads, we do not sell data, and what the site remembers about you is stored in your own browser.</p>', '<p>In short: you do not need an account, there are no ads and we do not sell data. Without an account, what the site remembers about you is stored in your own browser. If you sign in, your profile, records and saves are also kept in our database so you can use them on every device.</p>');
  lp('privacy', '<tr><td><code>gameplay:analytics</code>, <code>gameplay:sid</code></td><td>Usage events and a random session ID, only if you accept analytics</td><td>Analytics</td></tr>', '<tr><td><code>sb-gameplay-auth</code>, <code>gameplay:sync</code></td><td>Your sign-in session and what was already copied to your account, only if you sign in</td><td>Essential</td></tr>\n<tr><td><code>gameplay:analytics</code>, <code>gameplay:sid</code>, <code>gameplay:vid</code></td><td>Usage events, a random session ID and a random device ID, only if you accept analytics</td><td>Analytics</td></tr>');
  lp('privacy', 'Events are linked to a random session ID, not to your name or email.</p><p>Right now these events stay in your browser and are not sent anywhere. We plan to send them to our own database (hosted on Supabase) to learn which games people enjoy. We will update this policy before that starts. If you reject analytics, nothing is recorded.</p>', 'Events are linked to a random session ID and a random device ID, so we can count returning players. If you are signed in, they are also linked to your account. They are not linked to your name or email.</p><p>These events are sent to our database, hosted by Supabase in the European Union, and are used only to learn which games people enjoy and to fix bugs. They are deleted after two years. If you reject analytics, nothing is recorded or sent.</p>');
  lp('privacy', '<li>Firebase Hosting (Google)', '<li>Supabase hosts our database and the sign-in service in the European Union. It receives your IP address when your browser contacts it.</li><li>If you sign in with Google, Google tells us your email address, your name and a link to your profile picture.</li><li>Firebase Hosting (Google)');
  LEGAL.privacy[1] = LEGAL.privacy[1].replace(/<h2>Accounts, coming later<\/h2><p>[^<]*<\/p>/, '<h2>Accounts</h2><p>Signing in is optional. If you create an account, our database on Supabase (European Union) stores your email address; your username and display name; and, if you use Google, your name and the link to your Google profile picture; your best scores, play counts, time played and saved progress; and your friends and friend requests. Other signed-in players can find you by your username and see your username and display name, never your email. Passwords are handled by Supabase Auth: they are stored only as a secure hash and nobody, including us, can read them. Emails about your account (confirmation, password reset, email change) are sent by Supabase. We keep this data until you delete your account in Settings, Account, which removes it from our database.</p>');
  lp('privacy', 'Because today we hold no personal data on our servers, most requests can be handled directly in your browser with the tools above.', 'If you are signed in, Download my data also includes what your account stores, and Delete my account in Settings, Account removes it from our database. For anything else, email us.');
  lp('cookies', 'They stay in your browser and are never used to track you.', 'If you sign in, your sign-in session (<code>sb-gameplay-auth</code>) is stored too. They are never used to track you.');
  lp('cookies', 'with a random session ID (<code>gameplay:analytics</code>, <code>gameplay:sid</code>). They help us understand which games people play. For now they stay on your device.', 'with a random session ID and a random device ID (<code>gameplay:analytics</code>, <code>gameplay:sid</code>, <code>gameplay:vid</code>). They help us understand which games people play and are sent to our database on Supabase in the European Union.');
  lp('cookies', 'and online games use the PeerJS service.', 'online games use the PeerJS service, and accounts and analytics use Supabase.');
}
if (SB.on) auPatchLegal();
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
function lgClose() { $('#lgsheet').hidden = true; const f = !$('#ckbar').hidden ? $('#ckterms') : openK === 'mauth' ? $('#auterms') : null; if (f && !f.closest('[hidden]') && !auCoarse()) f.focus({ preventScroll: true }); }
function ckChoose(k) {
  if (!$('#ckterms').checked) { auMsg('cknote', 'Tick the box first to agree to the Terms of Use and the Privacy Policy.', 'bad'); auShake($('#ckagree')); $('#ckterms').focus({ preventScroll: true }); return; }
  setConsent(k === 'all', k);
  toast(k === 'all' ? 'Thanks! Cookie choice saved' : 'Cookie choice saved');
}
const FR = { q: '', seq: 0, t: 0, list: null, req: null, res: null, rq: '', rres: [] };
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
    if (res) frFill($('#fres'), res.map(p => [p.username, frRow(p, isF.has(p.username) ? '<span class="fr-tag">Friend</span>' : inc.has(p.username) ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+inc.get(p.username).id}">Accept</button>` : out.has(p.username) ? '<span class="fr-tag">Requested</span>' : `<button class="btn2 pri" type="button" data-fr="add" data-un="${esc(p.username)}">Add friend</button>`, q.length)]), `<div class="nofr">${esc(auT('No player has a username starting with “{q}”.').replace('{q}', q))}</div>`);
  }
  $('#g-req').hidden = searching || !rq.length;
  $('#req-n').textContent = rq.length;
  frFill($('#req-l'), rq.slice().sort((a, b) => (a.direction === 'incoming' ? 0 : 1) - (b.direction === 'incoming' ? 0 : 1)).map(r => ['r' + r.id, frRow(r, r.direction === 'incoming' ? `<button class="btn2 pri" type="button" data-fr="accept" data-id="${+r.id}">Accept</button><button class="btn2" type="button" data-fr="decline" data-id="${+r.id}">Decline</button>` : `<span class="fr-tag">Sent</span><button class="btn2" type="button" data-fr="cancel" data-id="${+r.id}">Cancel</button>`)]), '');
  $('#g-fr').hidden = searching;
  $('#fr-n').textContent = fl.length;
  frFill($('#fr-l'), fl.map(f => ['f' + f.friend_id, frRow(f, `<button class="btn2" type="button" data-fr="remove" data-id="${esc(f.friend_id)}">Remove</button>`)]), `<div class="nofr">${FR.list ? 'No friends yet. Type a username above to find someone.' : 'Loading…'}</div>`);
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
  if (FR.res) { FR.res = FR.res.filter(p => p.username.startsWith(q)); frDraw(); }
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
  b.disabled = true;
  const id = b.dataset.id, name = (b.closest('.frow').querySelector('.fr-n span') || {}).textContent || '';
  try {
    if (k === 'add') {
      const r = await sbRest('rpc/send_friend_request', { method: 'POST', body: { p_username: b.dataset.un } });
      toast(r === 'accepted' ? auT('You are now friends with {u}').replace('{u}', name) : r === 'sent' ? auT('Friend request sent to {u}').replace('{u}', name) : r === 'already_friends' ? 'You are already friends' : 'That player was not found');
      track('friend', { act: 'request', r: String(r || '') });
    } else if (k === 'accept' || k === 'decline') {
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
  } catch (e) { b.disabled = false; auMsg('anote', 'Could not update. Check your connection and try again.', 'bad'); }
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const s = document.getElementById('lgsheet'), c = document.getElementById('ckbar');
  if (s && !s.hidden) { e.preventDefault(); e.stopImmediatePropagation(); lgClose(); return; }
  if (c && !c.hidden) e.stopImmediatePropagation();
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
  if (!ck.hidden) document.documentElement.classList.add('ck-open');
  document.querySelectorAll('#aumodal .au-pw').forEach(w => w.insertAdjacentHTML('beforeend', EYE));
  am.addEventListener('mousedown', e => { if (e.target.closest('.au-eye')) e.preventDefault(); });
  am.addEventListener('click', e => {
    const t = e.target, lg = t.closest('[data-aulegal]');
    if (lg) { e.preventDefault(); e.stopPropagation(); lgOpen(lg.dataset.aulegal); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const md = t.closest('[data-aumode]');
    if (md) { if (SB.mode !== md.dataset.aumode) { SB.mode = md.dataset.aumode; auMsg('aunote', ''); auView('main'); } return; }
    if (t.closest('[data-auguest]')) { e.stopPropagation(); auGuest(); }
  });
  $('#autabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); SB.mode = SB.mode === 'up' ? 'in' : 'up'; auView('main'); $('#autabs [aria-selected="true"]').focus(); } });
  $('#auform').addEventListener('submit', e => { e.preventDefault(); auSubmit(); });
  $('#aurform').addEventListener('submit', e => { e.preventDefault(); auReset(); });
  $('#anform').addEventListener('submit', e => { e.preventDefault(); auNewPass(); });
  $('#auresend').addEventListener('click', auResend);
  $('#auforgot').addEventListener('click', () => { const v = $('#auemail').value.trim(); if (v.includes('@')) $('#aremail').value = v; auView('reset'); auMsg('arnote', ''); if (!auCoarse()) $('#aremail').focus(); });
  $('#auuser').addEventListener('input', e => { const v = e.target.value, n = v.toLowerCase().replace(/[^a-z0-9_.]/g, ''); if (n !== v) e.target.value = n; });
  am.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { const f = i.closest('.fld, .au-chk'); if (f) f.classList.remove('au-shake'); }));
  fm.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'fname') { e.preventDefault(); e.stopPropagation(); clearTimeout(FR.t); frSearch(); } }, true);
  fm.addEventListener('input', e => { if (e.target.id === 'fname') { e.stopPropagation(); frInput(); } }, true);
  fm.addEventListener('click', e => { const b = e.target.closest('[data-fr]'); if (b) { e.stopPropagation(); frAct(b.dataset.fr, b); } });
  document.addEventListener('click', e => {
    const t = e.target;
    const g = t.closest && t.closest('[data-auth="google"]');
    if (g) { e.preventDefault(); auGoogle(); return; }
    const v = t.closest && t.closest('[data-auv]');
    if (v) { auView(v.dataset.auv); auMsg('aunote', ''); return; }
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
    if (SB_RET || sbHasSession()) sbClient().then(() => auReturn()).catch(() => { if (SB_RET) toast('Sign-in could not load. Check your connection and reload the page.'); });
    auSettings();
  }
  auRender();
  auFirst();
}
Ameplay.account = {
  get enabled() { return SB.on; },
  get signedIn() { return !!SB.user; },
  get id() { return SB.user ? SB.user.id : null; },
  get username() { return SB.prof && SB.prof.username || null; },
  signIn() { auOpen('main', '', '', 'in'); },
  sync() { return sySync(); }
};

const AD = { role: null, locked: false, reason: null, at: 0, game: null, gat: 0, users: null, q: '', f: 'all', sort: ['created_at', -1], sel: null, tab: 'users', wait: 0, busy: false };
const adHref = () => (PATH_MODE ? '/' : '#/') + 'admin';
const adIsAdmin = () => AD.role === 'admin' && !AD.locked;
const adRpc = (f, b) => sbRest('rpc/' + f, { method: 'POST', body: b || {} });
const adLang = () => window.gpI18n ? gpI18n.lang : 'en';
const AD_ICO = {
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>'
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
const adProv = u => (u.providers && u.providers.length ? u.providers : ['email']).map(p => p === 'google' ? 'Google' : p === 'email' ? auT('Email') : p).join(' + ');
const adPill = (t, k) => `<span class="adm-pill${k ? ' ' + k : ''}">${esc(auT(t))}</span>`;
const adErr = e => { const m = String(e && e.message || ''); return /admins only/i.test(m) ? 'Admins only' : /at least one admin/i.test(m) ? 'There must be at least one admin' : /own account/i.test(m) ? 'You cannot lock your own account' : /at least 8/i.test(m) ? 'Use at least 8 characters.' : /at most 72/i.test(m) ? 'Use at most 72 characters.' : /not found/i.test(m) ? 'Not found. Refresh and try again.' : /too many/i.test(m) ? 'Too many messages. Wait a minute and try again.' : /account locked/i.test(m) ? 'Your account is locked.' : /write a subject/i.test(m) ? 'Write a subject.' : /write a message/i.test(m) ? 'Write a message.' : 'Could not update. Check your connection and try again.'; };

function adStatus(s) {
  const was = adIsAdmin(), wl = AD.locked;
  AD.role = s ? s.role : null; AD.locked = !!(s && s.locked); AD.reason = s && s.locked_reason || null; AD.at = Date.now();
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = !adIsAdmin(); });
  if (AD.locked !== wl || AD.locked) adBlock(AD.locked);
  if (view === 'admin') { if (adIsAdmin()) { if (!was || !AD.users) adEnter(); } else adBounce(); }
}
async function adCheck(game) {
  if (!SB.user) return;
  const uid = SB.user.id;
  try {
    const r = await adRpc('touch_presence', { p_lang: adLang(), p_game: game || (cur ? cur.g.id : null) });
    if (!SB.user || SB.user.id !== uid) return;
    adStatus(Array.isArray(r) ? r[0] : null);
  } catch (e) { if (view === 'admin' && !AD.at) adBounce(); }
}
function adSeen(id) {
  if (!SB.user || (AD.game === id && Date.now() - AD.gat < 60000)) return;
  AD.game = id; AD.gat = Date.now();
  adCheck(id);
}
function adSignedOut() {
  AD.role = null; AD.at = 0; AD.users = null; AD.sel = null;
  document.querySelectorAll('[data-admin]').forEach(el => { el.hidden = true; });
  if (AD.locked) { AD.locked = false; adBlock(false); }
  document.querySelectorAll('.tk').forEach(b => { if (b._tk) { b._tk.list = null; b._tk.cur = null; } });
  if (view === 'admin') adBounce();
}

function adBlock(on) {
  const el = $('#adblock');
  document.documentElement.classList.toggle('ad-locked', on);
  ['top', 'side', 'main'].forEach(id => { const n = document.getElementById(id); if (n) n.inert = on; });
  if (on) {
    if (openK) closeAll();
    if (!$('#unmodal').hidden) unClose();
    if (view !== 'home' || cur || pend) go(homeHref(), true);
    $('#adbrt').textContent = AD.reason || '';
    $('#adbr').hidden = !AD.reason;
    if (el.hidden) { el.hidden = false; const b = tkBox($('#tkb'), 'user'); tkLoad(b); }
  } else el.hidden = true;
}

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
  adTab(AD.tab);
  await adLoad();
  tkLoad(tkBox($('#tka'), 'admin'));
}
async function adLoad() {
  if (!adIsAdmin() || AD.busy) return;
  AD.busy = true;
  $('#adref').classList.add('spin');
  if (!AD.users) $('#adt tbody').innerHTML = `<tr><td colspan="15" class="adm-empty">${esc(auT('Loading…'))}</td></tr>`;
  try {
    const r = await adRpc('admin_list_users');
    AD.users = Array.isArray(r) ? r : [];
    adTiles(); adDraw();
    if (AD.sel) { const u = AD.users.find(x => x.id === AD.sel); if (u) adPanel(u, true); }
  } catch (e) {
    if (/admins only/i.test(e.message || '')) { AD.role = 'user'; adStatus({ role: 'user', locked: false }); return; }
    $('#adt tbody').innerHTML = `<tr><td colspan="15" class="adm-empty">${esc(auT('Could not load the users. Check your connection and try again.'))}</td></tr>`;
  } finally { AD.busy = false; $('#adref').classList.remove('spin'); }
}
function adTiles() {
  const U = AD.users || [], now = Date.now(), tk = ($('#tka')._tk || {}).list || [];
  const open = tk.filter(t => t.status === 'open').length;
  const T = [['Accounts', U.length], ['New this week', U.filter(u => now - Date.parse(u.created_at) < 6048e5).length], ['Active today', U.filter(u => now - Date.parse(u.last_seen || 0) < 864e5).length], ['Admins', U.filter(u => u.role === 'admin').length], ['Locked', U.filter(u => u.locked).length], ['Open tickets', open]];
  const box = $('#adtiles');
  box.innerHTML = T.map(([k, n], i) => `<div class="tile" style="--i:${i}"><small>${esc(auT(k))}</small><b data-n="${n}">${n}</b></div>`).join('');
  countUp(box);
  const tn = $('#adtn'); tn.textContent = open || ''; tn.hidden = !open;
}
const AD_COLS = [
  ['id', 'User id', u => `<code title="${esc(u.id)}">${esc(u.id.slice(0, 8))}</code>`],
  ['created_at', 'Account created', u => `<span title="${esc(adDate(u.created_at, 1))}">${esc(adDate(u.created_at))}</span>`],
  ['last_sign_in_at', 'Last log in', u => `<span title="${esc(adDate(u.last_sign_in_at, 1))}">${esc(adAgo(u.last_sign_in_at))}</span>`],
  ['last_seen', 'Last used website', u => `<span title="${esc(adDate(u.last_seen, 1))}">${esc(adAgo(u.last_seen))}</span>`],
  ['providers', 'Log in method', u => esc(adProv(u))],
  ['email_confirmed', 'Email confirmed', u => u.email_confirmed ? adPill('Yes', 'ok') : adPill('No', 'warn')],
  ['last_lang', 'Language', u => esc(adLangName(u.last_lang))],
  ['', 'Password', () => `<span class="adm-mut">${esc(auT('Hidden (hashed)'))}</span>`],
  ['role', 'Role', u => u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')],
  ['email', 'Email', u => esc(u.email || '—')],
  ['username', 'Username', u => u.username ? '@' + esc(u.username) : '<span class="adm-mut">—</span>'],
  ['display_name', 'Display name', u => esc(u.display_name || '—')],
  ['friends', 'Friends', u => String(+u.friends || 0)],
  ['fav_game', 'Favourite game', u => esc(adGame(u.fav_game))],
  ['locked', 'Locked', u => u.locked ? `<span title="${esc(u.locked_reason || '')}">${adPill('Locked', 'bad')}</span>` : adPill('No')]
];
function adHead() {
  $('#adt thead').innerHTML = '<tr>' + AD_COLS.map(([k, l]) => k ? `<th><button type="button" data-adsort="${k}" aria-sort="${AD.sort[0] === k ? (AD.sort[1] > 0 ? 'ascending' : 'descending') : 'none'}">${esc(auT(l))}<i></i></button></th>` : `<th><span>${esc(auT(l))}</span></th>`).join('') + '</tr>';
}
function adSortVal(u, k) {
  const v = k === 'providers' ? adProv(u) : u[k];
  if (/_at$|last_seen/.test(k)) return Date.parse(v) || 0;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return v;
  return v == null ? '' : String(v).toLowerCase();
}
function adRows() {
  const q = AD.q.trim().toLowerCase().replace(/^@/, ''), f = AD.f, now = Date.now(), [k, d] = AD.sort;
  return (AD.users || []).filter(u => {
    if (q && ![u.id, u.email, u.username, u.display_name].some(x => x && String(x).toLowerCase().includes(q))) return false;
    if (f === 'admin') return u.role === 'admin';
    if (f === 'locked') return u.locked;
    if (f === 'unconfirmed') return !u.email_confirmed;
    if (f === 'google' || f === 'email') return (u.providers || []).includes(f);
    if (f === 'active') return now - Date.parse(u.last_seen || 0) < 6048e5;
    return true;
  }).sort((a, b) => { const x = adSortVal(a, k), y = adSortVal(b, k); const ex = x === '' || x === 0, ey = y === '' || y === 0; if (ex !== ey) return ex ? 1 : -1; return (x < y ? -1 : x > y ? 1 : 0) * d; });
}
function adDraw() {
  adHead();
  const rows = adRows(), tb = $('#adt tbody');
  $('#adcount').textContent = auT('{n} of {t} users').replace('{n}', rows.length).replace('{t}', (AD.users || []).length);
  tb.innerHTML = rows.length ? rows.map((u, i) => `<tr tabindex="0" data-uid="${esc(u.id)}" class="${u.id === AD.sel ? 'sel' : ''}" style="--i:${Math.min(i, 14)}">${AD_COLS.map(c => `<td>${c[2](u)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="15" class="adm-empty">${esc(auT('No users match.'))}</td></tr>`;
}
function adTab(t) {
  AD.tab = t;
  const tabs = $('#adtabs');
  tabs.dataset.m = t;
  tabs.querySelectorAll('[data-adtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.adtab === t)));
  $('#adusers').hidden = t !== 'users'; $('#adtickets').hidden = t !== 'tickets';
  if (t === 'tickets') tkLoad(tkBox($('#tka'), 'admin'));
}
function adPanel(u, keep) {
  AD.sel = u.id;
  const p = $('#adpanel'), me = SB.user && SB.user.id === u.id, name = u.display_name || u.username || u.email || '?';
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  const tr = document.querySelector(`#adt tr[data-uid="${CSS.escape(u.id)}"]`); if (tr) tr.classList.add('sel');
  p.querySelector('.pic').textContent = name.charAt(0).toUpperCase();
  $('#adpn').textContent = name;
  $('#adpu').textContent = u.username ? '@' + u.username : u.email || '';
  const F = [['User id', `<code>${esc(u.id)}</code>`], ['Email', esc(u.email || '—')], ['Email confirmed', u.email_confirmed ? esc(adDate(u.email_confirmed_at, 1)) : adPill('No', 'warn')], ['Username', u.username ? '@' + esc(u.username) : '—'], ['Display name', esc(u.display_name || '—')], ['Role', u.role === 'admin' ? adPill('Admin', 'acc') : adPill('User')], ['Account created', esc(adDate(u.created_at, 1))], ['Last log in', esc(adDate(u.last_sign_in_at, 1))], ['Last used website', esc(adDate(u.last_seen, 1))], ['Last game opened', esc(adGame(u.last_game))], ['Language', esc(adLangName(u.last_lang))], ['Log in method', esc(adProv(u))], ['Friends', String(+u.friends || 0)], ['Favourite game', esc(adGame(u.fav_game))], ['Password', `<span class="adm-mut">${esc(auT('Hidden (hashed)'))}</span>`], ['Locked', u.locked ? adPill('Locked', 'bad') + (u.locked_reason ? `<div class="adm-why">${esc(u.locked_reason)}</div>` : '') : adPill('No')]];
  $('#adpdl').innerHTML = F.map(([k, v]) => `<div><dt>${esc(auT(k))}</dt><dd>${v}</dd></div>`).join('');
  p.querySelectorAll('[data-adrole]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.adrole === u.role)); adUnconfirm(b); });
  const lb = $('#adlock');
  adUnconfirm(lb);
  lb.textContent = auT(u.locked ? 'Unlock account' : 'Lock account');
  lb.className = 'btn2 ' + (u.locked ? 'pri' : 'danger');
  lb.disabled = me && !u.locked;
  $('#adlr').hidden = u.locked; $('#adlrl').hidden = u.locked;
  adUnconfirm($('#adpwb'));
  if (!keep) {
    ['adprn', 'adpwn', 'adln'].forEach(id => auMsg(id, ''));
    $('#adpw').value = ''; $('#adlr').value = '';
    if (me) auMsg('adln', 'You cannot lock your own account');
    $('#adpw').type = 'password';
    const eye = p.querySelector('.au-eye'); if (eye) auEye(eye, true);
  }
  if (p.hidden) { p.hidden = false; $('#adpback').hidden = false; p.scrollTop = 0; if (!auCoarse()) $('#adpclose').focus({ preventScroll: true }); }
}
function adPanelClose() {
  const p = $('#adpanel');
  if (p.hidden) return;
  AD.sel = null;
  document.querySelectorAll('#adt tr.sel').forEach(r => r.classList.remove('sel'));
  vis(p, false); vis($('#adpback'), false);
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
    b.disabled = true; auMsg('adprn', 'Saving…');
    try { await adRpc('admin_set_role', { p_uid: u.id, p_role: r }); u.role = r; auMsg('adprn', r === 'admin' ? 'This user is now an admin.' : 'This user is now a regular user.', 'ok'); track('admin', { act: 'role' }); if (SB.user && u.id === SB.user.id && r !== 'admin') { adCheck(); return; } }
    catch (e) { auMsg('adprn', adErr(e), 'bad'); }
    finally { b.disabled = false; }
  } else if (k === 'pw') {
    const pw = $('#adpw').value;
    if (pw.length < 8) { auMsg('adpwn', 'Use at least 8 characters.', 'bad'); auShake($('#adpw').closest('.au-pw')); return; }
    if (utf8Len(pw) > 72) { auMsg('adpwn', 'Use at most 72 characters.', 'bad'); return; }
    if (!adConfirm(b)) return;
    b.disabled = true; auMsg('adpwn', 'Saving…');
    try { const r = await adRpc('admin_set_password', { p_uid: u.id, p_password: pw }); $('#adpw').value = ''; auMsg('adpwn', r === 'signed_out' ? 'New password saved. They were signed out on their devices.' : 'New password saved.', 'ok'); track('admin', { act: 'password' }); }
    catch (e) { auMsg('adpwn', adErr(e), 'bad'); }
    finally { b.disabled = false; }
    return;
  } else if (k === 'lock') {
    const on = !u.locked;
    if (!adConfirm(b)) return;
    b.disabled = true; auMsg('adln', 'Saving…');
    try { await adRpc('admin_lock', { p_uid: u.id, p_locked: on, p_reason: on ? $('#adlr').value : null }); u.locked = on; u.locked_reason = on ? (String($('#adlr').value).replace(/\s+/g, ' ').trim().slice(0, 500) || null) : null; auMsg('adln', on ? 'Account locked. They now only see the blocked page.' : 'Account unlocked.', 'ok'); track('admin', { act: on ? 'lock' : 'unlock' }); }
    catch (e) { auMsg('adln', adErr(e), 'bad'); }
    finally { b.disabled = false; }
  }
  adTiles(); adDraw(); adPanel(u, true);
  adLoad();
}

function tkBox(el, mode) {
  if (el._tk) return el;
  el._tk = { mode, list: null, cur: null, n: 0, sig: '', compose: false };
  el.classList.add('tk');
  el.dataset.mode = mode;
  el.innerHTML = `<div class="tk-side">${mode === 'user' ? `<form class="tk-new" novalidate hidden><div class="fld"><label>${esc(auT('Subject'))}</label><input class="tk-subj-in" maxlength="120" autocomplete="off"></div><div class="fld"><label>${esc(auT('Message'))}</label><textarea class="tk-body-in" maxlength="2000" rows="4"></textarea></div><div class="tk-row"><button class="btn2 tk-cancel" type="button" data-tk="cancel">${esc(auT('Cancel'))}</button><button class="btn2 pri" type="submit">${esc(auT('Send ticket'))}</button></div></form><button class="btn2 pri tk-open" type="button" data-tk="new">${esc(auT('New ticket'))}</button>` : ''}<div class="tk-list" role="list"></div></div><div class="tk-main" hidden><div class="tk-h"><button class="back" type="button" data-tk="back">${AD_ICO.back}${esc(auT('All tickets'))}</button><div class="tk-ht"><b class="tk-subj" translate="no"></b><span class="tk-meta"></span></div><button class="btn2 tk-tog" type="button" data-tk="toggle"></button></div><div class="tk-msgs" translate="no" aria-live="polite"></div><form class="tk-comp" novalidate><textarea maxlength="2000" rows="2" placeholder="${esc(auT('Write a message'))}"></textarea><button class="btn2 pri" type="submit" aria-label="${esc(auT('Send'))}">${AD_ICO.send}<span>${esc(auT('Send'))}</span></button></form></div><div class="note tk-note" role="status"></div>`;
  el.addEventListener('click', e => { const b = e.target.closest('[data-tk]'); if (b) { e.stopPropagation(); tkAct(el, b.dataset.tk, b); } });
  el.addEventListener('submit', e => { e.preventDefault(); if (e.target.classList.contains('tk-new')) tkCreate(el); else tkSend(el); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.tagName === 'TEXTAREA') { e.preventDefault(); e.target.form.requestSubmit(); } });
  return el;
}
const tkNote = (el, m, k) => { const n = el.querySelector('.tk-note'); n.textContent = m ? auT(m) : ''; n.className = 'note tk-note' + (k ? ' ' + k : ''); };
async function tkLoad(el) {
  const T = el._tk;
  if (!SB.user || (T.mode === 'admin' && !adIsAdmin())) return;
  if (!T.list) el.querySelector('.tk-list').innerHTML = `<div class="adm-empty">${esc(auT('Loading…'))}</div>`;
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
  el.querySelector('.tk-msgs').innerHTML = `<div class="adm-empty">${esc(auT('Loading…'))}</div>`;
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
  b.disabled = true; tkNote(el, '');
  try {
    await adRpc('ticket_send', { p_ticket: T.cur, p_body: v });
    ta.value = '';
    track('ticket', { act: 'send', admin: T.mode === 'admin' });
    await tkThread(el);
    await tkLoad(el); tkHead(el);
  } catch (e) { tkNote(el, adErr(e), 'bad'); }
  finally { b.disabled = false; }
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
  if (k === 'toggle') {
    const t = (T.list || []).find(x => x.id === T.cur);
    if (!t) return;
    b.disabled = true;
    try { const s = await adRpc('ticket_set_status', { p_ticket: t.id, p_status: t.status === 'open' ? 'closed' : 'open' }); t.status = s; tkHead(el); tkList(el); track('ticket', { act: s }); tkLoad(el); }
    catch (e) { tkNote(el, adErr(e), 'bad'); }
    finally { b.disabled = false; }
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
    if (t.closest && t.closest('[data-adgo]')) { e.preventDefault(); closeAll(); go(adHref(), false); }
  });
  const va = $('#vAdmin');
  va.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-adsort]');
    if (s) { const k = s.dataset.adsort; AD.sort = AD.sort[0] === k ? [k, -AD.sort[1]] : [k, /_at$|last_seen|friends|email_confirmed|locked|role/.test(k) ? -1 : 1]; adDraw(); return; }
    const tb = t.closest('[data-adtab]');
    if (tb) { adTab(tb.dataset.adtab); return; }
    if (t.closest('#adref')) { adLoad(); tkLoad(tkBox($('#tka'), 'admin')); return; }
    if (t.closest('#adpback') || t.closest('#adpclose')) { adPanelClose(); return; }
    const eye = t.closest('.au-eye');
    if (eye) { auEye(eye); return; }
    const a = t.closest('[data-adact]');
    if (a) { adAct(a.dataset.adact, a); return; }
    const tr = t.closest('#adt tbody tr[data-uid]');
    if (tr) { const u = (AD.users || []).find(x => x.id === tr.dataset.uid); if (u) adPanel(u); }
  });
  va.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#adpanel').hidden) { e.preventDefault(); e.stopPropagation(); adPanelClose(); return; }
    const tr = e.target.closest && e.target.closest('#adt tbody tr[data-uid]');
    if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tr.click(); }
  });
  $('#adtabs').addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); adTab(AD.tab === 'users' ? 'tickets' : 'users'); $('#adtabs [aria-selected="true"]').focus(); } });
  $('#adq').addEventListener('input', e => { AD.q = e.target.value; adDraw(); });
  $('#adf').addEventListener('change', e => { AD.f = e.target.value; adDraw(); });
  $('#adpw').parentNode.insertAdjacentHTML('beforeend', EYE);
  $('#adpw').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); adAct('pw', $('#adpwb')); } });
  setInterval(() => {
    if (!SB.user || document.visibilityState === 'hidden') return;
    document.querySelectorAll('.tk').forEach(el => { if (!el._tk || el.closest('[hidden]')) return; if (el._tk.cur) tkThread(el); if (++el._tk.n % 5 === 0) tkLoad(el); });
  }, 6000);
  setInterval(() => { if (SB.user && document.visibilityState !== 'hidden') adCheck(); }, 180000);
  document.addEventListener('visibilitychange', () => { if (SB.user && document.visibilityState === 'visible' && Date.now() - AD.at > 60000) adCheck(); });
}

Ameplay.debug = { open: id => go(href(id), false), close: () => go(PATH_MODE ? '/' : '#/', false), games, fire: () => ov && ov.fire(), state, compute, q: t => { const o = state.q; state.q = t; const r = compute().list.map(g => g.id); state.q = o; return r; }, info: INFO, fit: () => fitStage(), pause: () => PAUSE.on };
document.addEventListener('DOMContentLoaded', boot);
})();

(() => {
const LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt'], NAMES = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' }, LKEY = 'gameplay:lang';
const R = [
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
["Type the email of your account. We will send you a link to choose a new password.", "Saisissez l’e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.", "Escribe el correo de tu cuenta. Te enviaremos un enlace para elegir una contraseña nueva.", "Gib die E-Mail deines Kontos ein. Wir schicken dir einen Link, um ein neues Passwort zu wählen.", "Scrivi l’email del tuo account. Ti invieremo un link per scegliere una nuova password.", "Digite o e-mail da sua conta. Enviaremos um link para você escolher uma nova senha."],
["Send link", "Envoyer le lien", "Enviar enlace", "Link senden", "Invia link", "Enviar link"],
["Back to sign in", "Retour à la connexion", "Volver a iniciar sesión", "Zurück zur Anmeldung", "Torna all’accesso", "Voltar para entrar"],
["Back to log in", "Retour à la connexion", "Volver a iniciar sesión", "Zurück zur Anmeldung", "Torna all’accesso", "Voltar para entrar"],
["Choose a new password for your account.", "Choisissez un nouveau mot de passe pour votre compte.", "Elige una contraseña nueva para tu cuenta.", "Wähle ein neues Passwort für dein Konto.", "Scegli una nuova password per il tuo account.", "Escolha uma nova senha para sua conta."],
["Save password", "Enregistrer le mot de passe", "Guardar contraseña", "Passwort speichern", "Salva password", "Salvar senha"],
["By continuing you agree to the", "En continuant, vous acceptez les", "Al continuar aceptas los", "Mit dem Fortfahren akzeptierst du die", "Continuando accetti i", "Ao continuar, você aceita os"],
["and the", "et la", "y la", "und die", "e la", "e a"],
["Reset password", "Réinitialiser le mot de passe", "Restablecer contraseña", "Passwort zurücksetzen", "Reimposta password", "Redefinir senha"],
["Wrong email or password.", "E-mail ou mot de passe incorrect.", "Correo o contraseña incorrectos.", "Falsche E-Mail oder falsches Passwort.", "Email o password errata.", "E-mail ou senha incorretos."],
["Confirm your email first: open the link we sent you.", "Confirmez d’abord votre e-mail : ouvrez le lien que nous vous avons envoyé.", "Confirma primero tu correo: abre el enlace que te enviamos.", "Bestätige zuerst deine E-Mail: Öffne den Link, den wir dir geschickt haben.", "Prima conferma la tua email: apri il link che ti abbiamo inviato.", "Confirme seu e-mail primeiro: abra o link que enviamos."],
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
["Accounts are not switched on yet", "Les comptes ne sont pas encore activés", "Las cuentas aún no están activadas", "Konten sind noch nicht aktiviert", "Gli account non sono ancora attivi", "As contas ainda não estão ativadas"],
["Accounts are not switched on yet. Soon you can keep your profile, records and saves on every device.", "Les comptes ne sont pas encore activés. Bientôt, vous retrouverez votre profil, vos records et vos sauvegardes sur tous vos appareils.", "Las cuentas aún no están activadas. Pronto podrás conservar tu perfil, récords y partidas en todos tus dispositivos.", "Konten sind noch nicht aktiviert. Bald kannst du dein Profil, deine Rekorde und Spielstände auf allen Geräten behalten.", "Gli account non sono ancora attivi. Presto potrai ritrovare profilo, record e salvataggi su ogni dispositivo.", "As contas ainda não estão ativadas. Em breve você poderá manter seu perfil, recordes e jogos salvos em todos os dispositivos."],
["Accounts are not switched on yet. Then you can find players by their username and add them as friends.", "Les comptes ne sont pas encore activés. Vous pourrez alors trouver des joueurs par leur nom d’utilisateur et les ajouter en amis.", "Las cuentas aún no están activadas. Entonces podrás buscar jugadores por su nombre de usuario y añadirlos como amigos.", "Konten sind noch nicht aktiviert. Dann kannst du Spieler über ihren Benutzernamen finden und als Freunde hinzufügen.", "Gli account non sono ancora attivi. Allora potrai trovare i giocatori con il loro nome utente e aggiungerli come amici.", "As contas ainda não estão ativadas. Depois você poderá encontrar jogadores pelo nome de usuário e adicioná-los como amigos."],
["Check your inbox", "Consultez votre boîte de réception", "Revisa tu bandeja de entrada", "Sieh in dein Postfach", "Controlla la posta", "Confira sua caixa de entrada"],
["We sent a link to", "Nous avons envoyé un lien à", "Enviamos un enlace a", "Wir haben einen Link geschickt an", "Abbiamo inviato un link a", "Enviamos um link para"],
[". Open it to confirm your account. You can close this page: the link signs you in.", ". Ouvrez-le pour confirmer votre compte. Vous pouvez fermer cette page : le lien vous connecte.", ". Ábrelo para confirmar tu cuenta. Puedes cerrar esta página: el enlace inicia tu sesión.", ". Öffne ihn, um dein Konto zu bestätigen. Du kannst diese Seite schließen: Der Link meldet dich an.", ". Aprilo per confermare il tuo account. Puoi chiudere questa pagina: il link ti fa accedere.", ". Abra-o para confirmar sua conta. Você pode fechar esta página: o link faz seu login."],
["No email? Check your spam folder, or", "Pas d’e-mail ? Vérifiez vos spams, ou", "¿No te llega? Revisa la carpeta de spam, o", "Keine E-Mail? Sieh im Spam-Ordner nach oder", "Nessuna email? Controlla lo spam, oppure", "Não chegou? Confira a pasta de spam, ou"],
["use a different email", "utilisez une autre adresse", "usa otro correo", "nutze eine andere E-Mail", "usa un’altra email", "use outro e-mail"],
["Resend email", "Renvoyer l’e-mail", "Reenviar correo", "E-Mail erneut senden", "Invia di nuovo l’email", "Reenviar e-mail"],
["Sent again. Use the newest email: it replaces the old link.", "Renvoyé. Utilisez l’e-mail le plus récent : il remplace l’ancien lien.", "Enviado de nuevo. Usa el correo más reciente: sustituye al enlace anterior.", "Erneut gesendet. Nutze die neueste E-Mail: Sie ersetzt den alten Link.", "Inviata di nuovo. Usa l’email più recente: sostituisce il vecchio link.", "Enviado de novo. Use o e-mail mais recente: ele substitui o link antigo."],
["Reset your password", "Réinitialisez votre mot de passe", "Restablece tu contraseña", "Setze dein Passwort zurück", "Reimposta la password", "Redefina sua senha"],
["Choose a new password", "Choisissez un nouveau mot de passe", "Elige una contraseña nueva", "Wähle ein neues Passwort", "Scegli una nuova password", "Escolha uma nova senha"],
["Check your inbox. If an account uses this email, we sent it a link to choose a new password.", "Consultez votre boîte de réception. Si un compte utilise cet e-mail, nous lui avons envoyé un lien pour choisir un nouveau mot de passe.", "Revisa tu bandeja de entrada. Si alguna cuenta usa este correo, le enviamos un enlace para elegir una contraseña nueva.", "Sieh in dein Postfach. Falls ein Konto diese E-Mail nutzt, haben wir einen Link zum Festlegen eines neuen Passworts geschickt.", "Controlla la posta. Se un account usa questa email, gli abbiamo inviato un link per scegliere una nuova password.", "Confira sua caixa de entrada. Se alguma conta usa este e-mail, enviamos um link para escolher uma nova senha."],
["An account with this email already exists. Log in instead.", "Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.", "Ya existe una cuenta con este correo. Inicia sesión.", "Mit dieser E-Mail gibt es schon ein Konto. Melde dich stattdessen an.", "Esiste già un account con questa email. Accedi.", "Já existe uma conta com este e-mail. Entre nela."],
["Wrong email, username or password.", "E-mail, nom d’utilisateur ou mot de passe incorrect.", "Correo, nombre de usuario o contraseña incorrectos.", "Falsche E-Mail, falscher Benutzername oder falsches Passwort.", "Email, nome utente o password errati.", "E-mail, nome de usuário ou senha incorretos."],
["Confirm your email first: open the link we sent you, or send a new one.", "Confirmez d’abord votre e-mail : ouvrez le lien envoyé, ou demandez-en un nouveau.", "Confirma primero tu correo: abre el enlace que te enviamos o pide uno nuevo.", "Bestätige zuerst deine E-Mail: Öffne den Link, den wir dir geschickt haben, oder fordere einen neuen an.", "Prima conferma la tua email: apri il link che ti abbiamo inviato o richiedine uno nuovo.", "Confirme seu e-mail primeiro: abra o link que enviamos ou peça um novo."],
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
["Resend email in {n} s", "Renvoyer l’e-mail dans {n} s", "Reenviar correo en {n} s", "E-Mail erneut senden in {n} s", "Invia di nuovo tra {n} s", "Reenviar e-mail em {n} s"],
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
["Reopen", "Rouvrir", "Reabrir", "Wieder öffnen", "Riapri", "Reabrir"]
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
