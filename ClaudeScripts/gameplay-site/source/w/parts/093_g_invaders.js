
(() => {
  'use strict';

  const CFG = {
    W: 224, H: 256, HZ: 60,
    ROWS: 5, COLS: 11, CELL: 16, REF_X: 24, START_Y: [0x78, 0x60, 0x50, 0x48, 0x48, 0x48, 0x40, 0x40, 0x40],
    RACK_DX: 2, LAST_DX_RIGHT: 3, RACK_DROP: 8, EDGE_L: 9, EDGE_R: 211,
    ROW_PTS: [10, 10, 20, 20, 30],
    PLAYER_Y: 216, PLAYER_MIN: 16, PLAYER_MAX: 195, PLAYER_SPEED: 1, PLAYER_START: 24,
    SHOT_SPEED: 4, SHOT_TOP: 40, SHOT_EXPLODE: 16,
    ASHOT_SPEED: 4, ASHOT_FAST: 5, ASHOT_FAST_BELOW: 9,
    RELOAD_SCORE: [200, 1000, 2000, 3000], RELOAD_RATE: [0x30, 0x10, 0x0b, 0x08, 0x07],
    COL_FIRE: [1, 7, 1, 1, 1, 4, 11, 1, 6, 3, 1, 1, 11, 9, 2, 8, 2, 11, 4, 7, 10],
    FLEET_KEY: [50, 43, 36, 28, 22, 17, 13, 10, 8, 7, 6, 5, 4, 3, 2, 1],
    FLEET_DELAY: [52, 46, 39, 34, 28, 24, 21, 19, 16, 14, 13, 12, 11, 9, 7, 5],
    ALIEN_EXPLODE: 16,
    SAUCER_TIME: 0x600, SAUCER_MIN_ALIENS: 8, SAUCER_Y: 40, SAUCER_DX: 2,
    SAUCER_PTS: [10, 5, 5, 10, 15, 10, 10, 5, 30, 10, 10, 10, 5, 15, 10],
    SHIELD_X: [32, 77, 122, 167], SHIELD_Y: 192, GROUND_Y: 239,
    EXTRA_LIFE: 1500, LIVES: 3, INVADE_Y: 216,
    PLAYER_BLOW: 60, RESPAWN: 70, PLAY_PLAYER: 130
  };

  const FONT = {
    '0': 'ehjlphe', '1': '4c4444e', '2': 'eh1248v', '3': 'v2421he', '4': '26aiv22', '5': 'vgu11he', '6': '68guhhe', '7': 'v124888', '8': 'ehhehhe', '9': 'ehhf12c',
    A: 'ehhvhhh', B: 'uhhuhhu', C: 'ehggghe', D: 'uhhhhhu', E: 'vgguggv', F: 'vgguggg', G: 'ehgnhhf', H: 'hhhvhhh', I: 'e44444e', J: '72222ic', K: 'hikokih',
    L: 'ggggggv', M: 'hrllhhh', N: 'hhpljhh', O: 'ehhhhhe', P: 'uhhuggg', Q: 'ehhhlid', R: 'uhhukih', S: 'fgge11u', T: 'v444444', U: 'hhhhhhe', V: 'hhhhha4',
    W: 'hhhllrh', X: 'hha4ahh', Y: 'hha4444', Z: 'v1248gv', '!': '4444404', '-': '000v000', '"': 'aa00000', '.': '00000cc', '<': '248g842', '>': '8421248',
    '=': '00v0v00', '?': 'eh12404', '/': '11248gg', ':': '0cc0cc0', ' ': '0000000', "'": '4400000', '*': '0level0'
  };
  const B32 = '0123456789abcdefghijklmnopqrstuv';

  const ALIENS = [
    [['...######...', '.##########.', '###.####.###', '############', '.##.####.##.', '..##....##..', '.##..##..##.', '##........##'],
      ['...######...', '.##########.', '###.####.###', '############', '.##.####.##.', '.##......##.', '##..####..##', '.#........#.']],
    [['#...###...#', '..#######..', '.##.###.##.', '###########', '#.###.###.#', '..#.....#..', '.#.#...#.#.', '#.........#'],
      ['.#..###..#.', '..#######..', '.##.###.##.', '###########', '#.###.###.#', '..#.....#..', '..#.....#..', '.#.#...#.#.']],
    [['#..##..#', '.######.', '##.##.##', '########', '.##..##.', '..#..#..', '.#....#.', '#......#'],
      ['.#.##.#.', '.######.', '##.##.##', '########', '.##..##.', '.#....#.', '..#..#..', '..#..#..']]
  ];
  const ROW_TYPE = [0, 0, 1, 1, 2];
  const PLAYER = ['......#......', '.....###.....', '..#########..', '.###########.', '#############', '##.#######.##', '#############', '.###.###.###.'];
  const PBLOW = [['....#...#.......', '.#.....#...#....', '...##.#..#......', '..#.####.##..#..', '.###########.#..', '#.###########.#.', '.##.#######.#.#.', '#.#############.'],
    ['..#......#..#...', '.....#.#........', '#..#.##....#....', '...######..#.#..', '..#.#######.....', '.###########.#..', '#############.#.', '.##.########.##.']];
  const SAUCER = ['.....######.....', '...##########...', '..############..', '.##.##.##.##.##.', '################', '..###..##..###..', '...#........#...'];
  const AEXPLO = ['....#...#....', '.#...#.#...#.', '..#.......#..', '...#.....#...', '##.........##', '...#.....#...', '..#.#...#.#..', '.#...#.#...#.'];
  const PSHOT_BLAST = ['#..#...#', '..####..', '.######.', '#######.', '.#######', '.######.', '..####.#', '#..#..#.'];
  const ASHOT_BLAST = ['..#...', '#..#.#', '.####.', '#####.', '.####.', '#.##.#', '..#..#', '.#..#.'];
  const SHIELD = ['....##############....', '...################...', '..##################..', '.####################.', '######################', '######################', '######################', '######################', '######################', '######################', '######################', '######################', '#######........#######', '######..........######', '#####............#####', '#####............#####'];
  const ASHOTS = [
    [['.#.', '.#.', '.##', '.#.', '##.', '.#.', '.#.'], ['.#.', '.#.', '.#.', '###', '.#.', '.#.', '.#.'], ['.#.', '##.', '.#.', '.##', '.#.', '##.', '.#.'], ['.#.', '.#.', '.#.', '###', '.#.', '.#.', '.#.']],
    [0, 1, 2, 3].map(k => [0, 1, 2, 3, 4, 5, 6].map(r => r === 1 + k ? '###' : '.#.')),
    [0, 1, 2, 3].map(k => [0, 1, 2, 3, 4, 5, 6].map(r => ['.#.', '#..', '.#.', '..#'][(r + k) & 3]))
  ];
  const BLAST_DOWN = ['.#.#.', '#.#.#', '.###.', '##.##', '.###.', '#.#.#'];

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; };
  const sprite = (rows, col = '#ffffff') => {
    const [c, x] = mk(rows[0].length, rows.length);
    x.fillStyle = col;
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, j, 1, 1); });
    return c;
  };
  const maskOf = rows => rows.map(r => [...r].map(ch => ch === '#' ? 1 : 0));

  Ameplay.register({
    id: 'invaders',
    title: 'Invaders',
    category: 'Action',
    tint: '#20d040',
    better: 'high',
    width: 520,
    blurb: 'Hold the line as a marching alien fleet creeps ever closer.',
    help: '<kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> move · <kbd>Space</kbd> fire · <kbd>P</kbd> pause · touch: buttons, or drag and tap',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20l-5-7M42 20l5-7"/><rect x="13" y="20" width="38" height="22" rx="10"/><circle cx="25" cy="30" r="3"/><circle cx="39" cy="30" r="3"/><path d="M19 42l-5 8M28 42v7M36 42v7M45 42l5 8"/></svg>',
    css: `.gm-invaders{gap:10px}
.gm-invaders .g-canvas{background:#000;image-rendering:pixelated}
.gm-invaders .iv-pad{display:none;width:100%;max-width:440px;justify-content:space-between;gap:10px;touch-action:none}
.gm-invaders.touch .iv-pad{display:flex}
@media (pointer:coarse){.gm-invaders .iv-pad{display:flex}}
.gm-invaders .iv-pad div{display:flex;gap:10px}
.gm-invaders .iv-pad button{width:66px;height:54px;padding:0;border:0;border-radius:14px;background:linear-gradient(#2a2a2a,#121212);box-shadow:0 4px 0 #000;color:#3cff5a;display:grid;place-items:center;touch-action:none;-webkit-tap-highlight-color:transparent;font:900 15px Nunito,system-ui,sans-serif;letter-spacing:.06em}
.gm-invaders .iv-pad button.fire{width:110px;color:#ff4a4a}
.gm-invaders .iv-pad button.on{transform:translateY(3px);box-shadow:0 1px 0 #000;background:#333}
.gm-invaders .iv-pad svg{width:26px;height:26px}`,
    mount(root, api) {
      const { W, H } = CFG, STEP = 1 / CFG.HZ;
      const view = api.canvas(W * 2, H * 2);
      const canvas = view.canvas, vctx = view.ctx;
      const [low, g] = mk(W, H);
      const [mid, mctx] = mk(1, 1);
      const [shc, shx] = mk(W, 16);
      const shImg = shx.createImageData(W, 16);

      const fontC = (() => {
        const chars = Object.keys(FONT), [c, x] = mk(chars.length * 8, 8), idx = {};
        x.fillStyle = '#fff';
        chars.forEach((ch, k) => { idx[ch] = k; for (let r = 0; r < 7; r++) { const b = B32.indexOf(FONT[ch][r]); for (let i = 0; i < 5; i++) if (b & (16 >> i)) x.fillRect(k * 8 + i, r, 1, 1); } });
        return { c, idx };
      })();
      const S = {
        alien: ALIENS.map(t => t.map(f => sprite(f))), player: sprite(PLAYER), pblow: PBLOW.map(f => sprite(f)), saucer: sprite(SAUCER),
        aexplo: sprite(AEXPLO), pblast: sprite(PSHOT_BLAST), ablast: sprite(ASHOT_BLAST), ashot: ASHOTS.map(t => t.map(f => sprite(f))), down: sprite(BLAST_DOWN)
      };
      const AW = ALIENS.map(t => t[0][0].length), AM = ALIENS.map(t => t.map(maskOf));
      const PM = maskOf(PLAYER), PBM = maskOf(PSHOT_BLAST), ABM = maskOf(ASHOT_BLAST), SHM = maskOf(SHIELD);

      let ac = null, master = null, noise = null, ufoO = null, ufoG = null, ufoL = null;
      function audio() {
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .4; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          ufoO = ac.createOscillator(); ufoO.type = 'square'; ufoO.frequency.value = 700;
          ufoL = ac.createOscillator(); ufoL.frequency.value = 7; const lg = ac.createGain(); lg.gain.value = 260; ufoL.connect(lg); lg.connect(ufoO.frequency);
          const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
          ufoG = ac.createGain(); ufoG.gain.value = 0; ufoO.connect(lp); lp.connect(ufoG); ufoG.connect(master); ufoO.start(); ufoL.start();
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function tone(t, dur, type, f0, f1, vol) {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0005, t + dur);
        o.connect(gn); gn.connect(master); o.start(t); o.stop(t + dur + .02);
      }
      function hiss(t, dur, f0, f1, vol, type = 'bandpass', q = 1) {
        const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain();
        s.buffer = noise; f.type = type; f.Q.value = q;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
        gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0005, t + dur);
        s.connect(f); f.connect(gn); gn.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
      }
      const FLEET_HZ = [61.7, 55, 49, 46.2];
      function sfx(name, arg) {
        if (api.muted || !ac) return;
        const t = ac.currentTime + .004;
        if (name === 'fleet') { const f = FLEET_HZ[arg]; tone(t, .12, 'square', f, f * .92, .5); tone(t, .1, 'triangle', f * 2, f * 1.8, .35); }
        else if (name === 'shoot') { hiss(t, .26, 5200, 900, .5, 'bandpass', .8); tone(t, .18, 'square', 1500, 300, .05); }
        else if (name === 'kill') { hiss(t, .22, 2600, 300, .7, 'bandpass', 1.2); tone(t, .16, 'square', 480, 90, .12); }
        else if (name === 'die') { hiss(t, 1.1, 1800, 80, .9, 'lowpass', .5); tone(t, .9, 'sawtooth', 160, 40, .12); }
        else if (name === 'ufohit') { for (let i = 0; i < 8; i++) tone(t + i * .1, .09, 'square', 1250 - (i & 1) * 380, 900 - (i & 1) * 300, .07); }
        else if (name === 'life') { for (let i = 0; i < 6; i++) tone(t + i * .16, .1, 'square', 1320, 1320, .06); }
        else if (name === 'ashot') hiss(t, .1, 900, 300, .25, 'lowpass', .7);
      }
      function ufoSound(on) {
        if (!ac) return;
        ufoG.gain.setTargetAtTime(on && !api.muted ? .05 : 0, ac.currentTime, .02);
      }

      const players = [];
      let mode = 'title', modeT = 0, frame = 0, nPlayers = 1, cur = 0, paused = false, submitted = false;
      let hi = api.best || 0, P = null;
      const pl = { x: CFG.PLAYER_START, alive: true, blowT: 0 };
      const shot = { on: false, x: 0, y: 0, exT: 0, ex: 0, ey: 0, exRed: false };
      const ashots = [0, 1, 2].map(k => ({ k, on: false, x: 0, y: 0, steps: 0, frame: 0, exT: 0, ex: 0, ey: 0, exGround: false }));
      const saucer = { on: false, x: 0, dx: 0, hitT: 0, pts: 0, hx: 0, timer: CFG.SAUCER_TIME };
      let plungerIdx = 0, squigIdx = 6, fleetNote = 0, fleetT = 0, alienExT = 0, aex = 0, aey = 0, fireGrace = 0, drawIn = 0;
      let touchUI = matchMedia('(pointer: coarse)').matches;
      const held = { l: false, r: false };
      let dragX = null;

      function newPlayer() {
        return { score: 0, lives: CFG.LIVES, round: 0, extra: false, shots: 0, rack: null, shield: null, ground: null, over: false };
      }
      function newRack(P) {
        const startY = P.round === 0 ? CFG.START_Y[0] : CFG.START_Y[1 + (P.round - 1) % 8];
        const n = CFG.ROWS * CFG.COLS, R = { x: new Int16Array(n), y: new Int16Array(n), alive: new Uint8Array(n).fill(1), fr: new Uint8Array(n), count: n, cursor: 0, dx: CFG.RACK_DX, dy: 0, flip: 0, hitEdge: false };
        for (let r = 0; r < CFG.ROWS; r++) for (let c = 0; c < CFG.COLS; c++) {
          const i = r * CFG.COLS + c;
          R.x[i] = CFG.REF_X + c * CFG.CELL; R.y[i] = 248 - startY - r * CFG.CELL;
        }
        P.rack = R;
        P.shield = new Uint8Array(W * 16);
        for (const sx of CFG.SHIELD_X) for (let j = 0; j < 16; j++) for (let i = 0; i < 22; i++) if (SHM[j][i]) P.shield[j * W + sx + i] = 1;
        P.ground = P.ground || new Uint8Array(W).fill(1);
        P.shots = 0;
        shieldDirty = true;
      }
      let shieldDirty = true;

      function addScore(v) {
        P.score += v;
        if (!P.extra && P.score >= CFG.EXTRA_LIFE) { P.extra = true; P.lives++; sfx('life'); }
        if (P.score > hi) hi = P.score;
        api.score(players.length > 1 ? Math.max(players[0].score, players[1].score) : P.score);
      }

      function startGame(n) {
        audio();
        nPlayers = n; players.length = 0;
        for (let i = 0; i < n; i++) { const p = newPlayer(); players.push(p); P = p; newRack(p); }
        cur = 0; P = players[0]; submitted = false; api.score(0);
        beginTurn();
      }
      function beginTurn() {
        mode = 'playplayer'; modeT = CFG.PLAY_PLAYER;
        pl.x = CFG.PLAYER_START; pl.alive = true; pl.blowT = 0;
        shot.on = false; shot.exT = 0;
        for (const a of ashots) { a.on = false; a.exT = 0; a.steps = 0; }
        saucer.on = false; saucer.hitT = 0; saucer.timer = CFG.SAUCER_TIME; ufoSound(false);
        alienExT = 0; fleetT = 0; shieldDirty = true;
      }
      function reloadRate() {
        for (let i = 0; i < CFG.RELOAD_SCORE.length; i++) if (P.score < CFG.RELOAD_SCORE[i]) return CFG.RELOAD_RATE[i];
        return CFG.RELOAD_RATE[4];
      }
      function fleetDelay() {
        const n = P.rack.count;
        for (let i = 0; i < CFG.FLEET_KEY.length; i++) if (CFG.FLEET_KEY[i] <= n) return CFG.FLEET_DELAY[i];
        return 5;
      }

      function stepRack() {
        const R = P.rack;
        if (alienExT > 0 || R.count === 0) return;
        let guard = 0;
        while (!R.alive[R.cursor] && guard++ < 60) advanceCursor(R);
        const i = R.cursor;
        R.x[i] += R.dy ? 0 : R.dx; R.y[i] += R.dy; R.fr[i] = R.flip;
        const t = ROW_TYPE[(i / CFG.COLS) | 0], ax = R.x[i];
        if ((R.dx > 0 && ax + 14 >= CFG.EDGE_R) || (R.dx < 0 && ax + 1 <= CFG.EDGE_L)) R.hitEdge = true;
        erodeShield(i, t);
        if (R.y[i] + 8 >= CFG.INVADE_Y + 1 && pl.alive) invaded();
        advanceCursor(R);
      }
      function advanceCursor(R) {
        R.cursor++;
        if (R.cursor >= R.alive.length) {
          R.cursor = 0; R.flip ^= 1;
          if (R.dy) { R.dy = 0; }
          else if (R.hitEdge) { R.dy = CFG.RACK_DROP; R.dx = -Math.sign(R.dx) * CFG.RACK_DX; }
          R.hitEdge = false;
          if (R.count === 1 && R.dx > 0) R.dx = CFG.LAST_DX_RIGHT; else if (R.dx > 0) R.dx = CFG.RACK_DX;
        }
      }
      function erodeShield(i, t) {
        const R = P.rack, y0 = R.y[i] - CFG.SHIELD_Y;
        if (y0 > 15 || y0 < -8) return;
        const ox = R.x[i] + ((CFG.CELL - AW[t]) >> 1);
        for (let j = 0; j < 8; j++) {
          const yy = y0 + j;
          if (yy < 0 || yy > 15) continue;
          for (let k = 0; k < AW[t]; k++) { const xx = ox + k; if (xx >= 0 && xx < W && P.shield[yy * W + xx]) { P.shield[yy * W + xx] = 0; shieldDirty = true; } }
        }
      }
      function alienBox(i) {
        const t = ROW_TYPE[(i / CFG.COLS) | 0], R = P.rack;
        return [R.x[i] + ((CFG.CELL - AW[t]) >> 1), R.y[i], AW[t], t];
      }
      function shieldAt(x, y) { const yy = y - CFG.SHIELD_Y; return x >= 0 && x < W && yy >= 0 && yy < 16 && P.shield[yy * W + x]; }
      function blast(mask, x0, y0) {
        for (let j = 0; j < mask.length; j++) for (let i = 0; i < mask[j].length; i++) {
          if (!mask[j][i]) continue;
          const x = x0 + i, yy = y0 + j - CFG.SHIELD_Y;
          if (x >= 0 && x < W && yy >= 0 && yy < 16) P.shield[yy * W + x] = 0;
        }
        shieldDirty = true;
      }

      function fire() {
        if (mode !== 'play' || paused || !pl.alive || shot.on || shot.exT > 0) return;
        shot.on = true; shot.x = pl.x + 6; shot.y = CFG.PLAYER_Y - 4;
        P.shots++;
        sfx('shoot');
      }
      function stepShot() {
        if (shot.exT > 0) { shot.exT--; return; }
        if (!shot.on) return;
        for (let s = 0; s < CFG.SHOT_SPEED; s++) {
          shot.y--;
          const x = shot.x, y = shot.y;
          if (y <= CFG.SHOT_TOP) { explodeShot(x - 3, CFG.SHOT_TOP - 2, true); return; }
          if (shieldAt(x, y)) { blast(PBM, x - 4, y - 5); explodeShot(-99, 0, false); shot.exT = 4; return; }
          const R = P.rack;
          for (let i = 0; i < R.alive.length; i++) {
            if (!R.alive[i]) continue;
            const [ax, ay, aw] = alienBox(i);
            if (x >= ax && x < ax + aw && y >= ay && y < ay + 8) { killAlien(i); return; }
          }
          if (saucer.on && x >= saucer.x && x < saucer.x + 16 && y >= CFG.SAUCER_Y && y < CFG.SAUCER_Y + 7) { hitSaucer(); return; }
          for (const a of ashots) if (a.on && x >= a.x - 1 && x <= a.x + 3 && y >= a.y && y < a.y + 8) { a.on = false; a.exT = 6; a.ex = a.x - 1; a.ey = a.y; a.exGround = false; explodeShot(x - 3, y - 4, false); return; }
        }
      }
      function explodeShot(x, y, red) { shot.on = false; shot.exT = CFG.SHOT_EXPLODE; shot.ex = x; shot.ey = y; shot.exRed = red; }
      function killAlien(i) {
        const R = P.rack, [ax, ay, , t] = alienBox(i);
        R.alive[i] = 0; R.count--;
        shot.on = false;
        alienExT = CFG.ALIEN_EXPLODE; aex = ax + ((AW[t] - 13) >> 1); aey = ay;
        addScore(CFG.ROW_PTS[(i / CFG.COLS) | 0]);
        sfx('kill');
        if (R.count === 1 && R.dx > 0) R.dx = CFG.LAST_DX_RIGHT;
      }
      function hitSaucer() {
        shot.on = false;
        saucer.pts = CFG.SAUCER_PTS[P.shots % 15] * 10;
        saucer.on = false; saucer.hitT = 90; saucer.hx = saucer.x;
        addScore(saucer.pts);
        ufoSound(false); sfx('ufohit');
      }

      function lowestIn(col) {
        const R = P.rack;
        for (let r = 0; r < CFG.ROWS; r++) { const i = r * CFG.COLS + col; if (R.alive[i]) return i; }
        return -1;
      }
      function stepAlienShot(a) {
        if (a.exT > 0) { a.exT--; return; }
        if (a.on) {
          a.steps++; a.frame = (a.frame + 1) & 3;
          const sp = P.rack.count < CFG.ASHOT_FAST_BELOW ? CFG.ASHOT_FAST : CFG.ASHOT_SPEED;
          for (let s = 0; s < sp; s++) {
            a.y++;
            const bx = a.x, by = a.y + 7;
            for (let k = 0; k < 3; k++) if (shieldAt(bx + k, by)) { blast(ABM, bx - 1, by - 2); endAShot(a, bx - 1, by - 2, false); return; }
            if (pl.alive && by >= CFG.PLAYER_Y && by < CFG.PLAYER_Y + 8) {
              for (let k = 0; k < 3; k++) { const px = bx + k - pl.x; if (px >= 0 && px < 13 && PM[by - CFG.PLAYER_Y][px]) { endAShot(a, bx, by, false); killPlayer(); return; } }
            }
            if (by >= CFG.GROUND_Y - 1) {
              for (let k = -1; k <= 3; k++) if (bx + k >= 0 && bx + k < W && (k === 1 || Math.random() < .5)) P.ground[bx + k] = 0;
              endAShot(a, bx - 1, CFG.GROUND_Y - 7, true); return;
            }
          }
          return;
        }
        if (mode !== 'play' || !pl.alive || fireGrace > 0) return;
        if (a.k === 2 && saucer.on) return;
        if (a.k === 1 && P.rack.count === 1) return;
        const rr = reloadRate();
        for (const o of ashots) if (o !== a && o.on && o.steps <= rr) return;
        let col;
        if (a.k === 0) {
          let best = -1, bd = 1e9;
          for (let c = 0; c < CFG.COLS; c++) {
            const i = lowestIn(c);
            if (i < 0) continue;
            const d = Math.abs(P.rack.x[i] + 8 - (pl.x + 6));
            if (d < bd) { bd = d; best = c; }
          }
          col = best;
        } else if (a.k === 1) { col = CFG.COL_FIRE[plungerIdx] - 1; plungerIdx = (plungerIdx + 1) % 16; }
        else { col = CFG.COL_FIRE[squigIdx] - 1; squigIdx = squigIdx >= 20 ? 6 : squigIdx + 1; }
        const i = col < 0 ? -1 : lowestIn(col);
        if (i < 0) return;
        a.on = true; a.steps = 0; a.frame = 0;
        a.x = P.rack.x[i] + 7; a.y = P.rack.y[i] + 8;
        if (a.y + 7 > CFG.GROUND_Y) a.on = false;
      }
      function endAShot(a, x, y, ground) { a.on = false; a.exT = 6; a.ex = x; a.ey = y; a.exGround = ground; }

      function stepSaucer() {
        if (saucer.hitT > 0) { saucer.hitT--; if (!saucer.hitT) saucer.timer = CFG.SAUCER_TIME; return; }
        if (saucer.on) {
          saucer.x += saucer.dx;
          if (saucer.x < 8 || saucer.x > W - 24) { saucer.on = false; saucer.timer = CFG.SAUCER_TIME; ufoSound(false); }
          return;
        }
        if (saucer.timer > 0) return;
        if (P.rack.count < CFG.SAUCER_MIN_ALIENS || ashots[2].on) return;
        saucer.on = true;
        if (P.shots & 1) { saucer.x = 8; saucer.dx = CFG.SAUCER_DX; } else { saucer.x = W - 24; saucer.dx = -CFG.SAUCER_DX; }
        ufoSound(true);
      }

      function killPlayer() {
        pl.alive = false; pl.blowT = CFG.PLAYER_BLOW + CFG.RESPAWN; shot.on = false;
        for (const a of ashots) a.on = false;
        saucer.on = false; ufoSound(false);
        sfx('die');
      }
      function invaded() {
        P.lives = 1;
        killPlayer();
      }
      function afterDeath() {
        P.lives--;
        const others = players.filter(p => p !== P && p.lives > 0);
        if (P.lives <= 0) {
          P.over = true;
          if (others.length) { mode = 'pover'; modeT = 150; return; }
          return gameOver();
        }
        if (others.length) { cur = players.indexOf(others[0]); P = others[0]; beginTurn(); return; }
        pl.alive = true; pl.x = CFG.PLAYER_START; fireGrace = 30;
      }
      function gameOver() {
        mode = 'over'; modeT = 300; ufoSound(false);
        if (!submitted) { submitted = true; api.submit(Math.max(...players.map(p => p.score))); }
      }

      function playTick() {
        if (!pl.alive) {
          if (--pl.blowT <= 0) afterDeath();
          return;
        }
        if (fireGrace > 0) fireGrace--;
        const left = held.l || keys.has('ArrowLeft') || keys.has('KeyA'), right = held.r || keys.has('ArrowRight') || keys.has('KeyD');
        let mv = (right ? 1 : 0) - (left ? 1 : 0);
        if (dragX !== null && !mv) mv = dragX > pl.x + 7 ? 1 : dragX < pl.x + 5 ? -1 : 0;
        pl.x = Math.max(CFG.PLAYER_MIN, Math.min(CFG.PLAYER_MAX, pl.x + mv * CFG.PLAYER_SPEED));
        if (alienExT > 0) alienExT--;
        stepRack();
        if (!pl.alive || mode !== 'play') return;
        stepShot();
        const a = ashots[frame % 3];
        stepAlienShot(a);
        if (frame % 3 === 2) stepSaucer();
        if (saucer.timer > 0) saucer.timer--;
        if (++fleetT >= fleetDelay()) { fleetT = 0; sfx('fleet', fleetNote); fleetNote = (fleetNote + 1) & 3; }
        if (P.rack.count === 0 && alienExT === 0 && !shot.on) { mode = 'cleared'; modeT = 90; }
      }

      function tick() {
        frame++;
        if (ac && (frame & 7) === 0) ufoSound(saucer.on && mode === 'play' && !paused);
        if (paused) return;
        if (mode === 'title') { modeT++; return; }
        if (mode === 'playplayer') {
          if (--modeT <= 0) { mode = 'drawin'; drawIn = 0; }
          return;
        }
        if (mode === 'drawin') {
          drawIn++;
          if (drawIn >= 56) { mode = 'play'; fireGrace = 40; }
          return;
        }
        if (mode === 'play') {
          playTick();
          return;
        }
        if (mode === 'cleared') {
          if (shot.exT > 0) shot.exT--;
          if (--modeT <= 0) { P.round++; newRack(P); beginTurn(); mode = 'drawin'; drawIn = 0; }
          return;
        }
        if (mode === 'pover') { if (--modeT <= 0) { const o = players.find(p => p.lives > 0); cur = players.indexOf(o); P = o; beginTurn(); } return; }
        if (mode === 'over') { if (--modeT <= 0) { mode = 'title'; modeT = 0; } }
      }

      function text(s, x, y) {
        s = String(s);
        for (let i = 0; i < s.length; i++) { const k = fontC.idx[s[i]]; if (k !== undefined && s[i] !== ' ') g.drawImage(fontC.c, k * 8, 0, 8, 8, x + i * 8, y, 8, 8); }
      }
      const pad4 = v => String(v % 10000).padStart(4, '0');
      function drawHeader() {
        text('SCORE<1> HI-SCORE', 8, 8);
        const blink = (mode === 'playplayer') && ((frame >> 3) & 1);
        if (players[0] && !(blink && cur === 0)) text(pad4(players[0].score), 24, 24);
        else if (!players[0]) text('0000', 24, 24);
        text(pad4(hi), 88, 24);
      }
      function drawFooter() {
        for (let x = 0; x < W; x++) if (!P || P.ground[x]) g.fillRect(x, CFG.GROUND_Y, 1, 1);
        if (P && mode !== 'title') {
          text(String(Math.max(0, P.lives)), 8, 241);
          for (let i = 0; i < Math.min(P.lives - 1, 5); i++) g.drawImage(S.player, 24 + i * 16, 241);
        }
        text('CREDIT 00', 136, 241);
      }
      function drawShields() {
        if (shieldDirty) {
          const d = shImg.data;
          for (let i = 0; i < W * 16; i++) { const v = P.shield[i] ? 255 : 0; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = v; }
          shx.putImageData(shImg, 0, 0);
          shieldDirty = false;
        }
        g.drawImage(shc, 0, CFG.SHIELD_Y);
      }
      function drawRack(limit) {
        const R = P.rack;
        for (let i = 0; i < R.alive.length && i < limit; i++) {
          if (!R.alive[i]) continue;
          const t = ROW_TYPE[(i / CFG.COLS) | 0];
          g.drawImage(S.alien[t][R.fr[i]], R.x[i] + ((CFG.CELL - AW[t]) >> 1), R.y[i]);
        }
      }
      function drawPlay() {
        drawShields();
        drawRack(mode === 'drawin' ? drawIn : 99);
        if (alienExT > 0) g.drawImage(S.aexplo, aex, aey);
        if (saucer.on) g.drawImage(S.saucer, saucer.x, CFG.SAUCER_Y);
        if (saucer.hitT > 0) { if (saucer.hitT > 66) g.drawImage(S.aexplo, saucer.hx + 1, CFG.SAUCER_Y); else text(String(saucer.pts), saucer.hx - (saucer.pts >= 100 ? 4 : 0), CFG.SAUCER_Y); }
        if (pl.alive) g.drawImage(S.player, pl.x, CFG.PLAYER_Y);
        else if (pl.blowT > CFG.RESPAWN) g.drawImage(S.pblow[(pl.blowT >> 2) & 1], pl.x - 1, CFG.PLAYER_Y);
        if (shot.on) g.fillRect(shot.x, shot.y, 1, 4);
        if (shot.exT > 0 && shot.ex > -50) g.drawImage(S.pblast, shot.ex, shot.ey);
        for (const a of ashots) {
          if (a.on) g.drawImage(S.ashot[a.k][a.frame], a.x, a.y);
          else if (a.exT > 0) g.drawImage(a.exGround ? S.down : S.ablast, a.ex, a.ey);
        }
      }
      function drawTitle() {
        const t = modeT;
        const type = (s, x, y, start) => { const n = Math.max(0, Math.min(s.length, ((t - start) / 6) | 0)); text(s.slice(0, n), x, y); };
        type('PLAY', 96, 64, 10);
        type('INVADERS', 80, 88, 40);
        if (t > 100) {
          text('*SCORE ADVANCE TABLE*', 28, 112);
          g.drawImage(S.saucer, 60, 128);
          g.drawImage(S.alien[2][(t >> 5) & 1], 64, 144);
          g.drawImage(S.alien[1][(t >> 5) & 1], 63, 160);
          g.drawImage(S.alien[0][(t >> 5) & 1], 62, 176);
          type('=? MYSTERY', 80, 128, 120);
          type('=30 POINTS', 80, 144, 190);
          type('=20 POINTS', 80, 160, 260);
          type('=10 POINTS', 80, 176, 330);
        }
        if (t > 120) {
          text('1 PLAYER', 88, 204);
          if ((frame >> 5) & 1) text(touchUI ? 'TAP TO START' : 'PUSH SPACE', touchUI ? 72 : 80, 222);
        }
      }
      function draw() {
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#fff';
        drawHeader();
        if (mode === 'title') drawTitle();
        else {
          if (P) {
            if (mode !== 'playplayer' && mode !== 'pover') drawPlay();
            if (mode === 'playplayer') text('PLAY PLAYER<' + (cur + 1) + '>', 56, 112);
            if (mode === 'pover' || (mode === 'over' && nPlayers === 2)) text('GAME OVER PLAYER<' + (players.indexOf(P) + 1) + '>', 24, 112 + (mode === 'over' ? 16 : 0));
            if (mode === 'over') { const s = 'GAME OVER'; text(s.slice(0, Math.min(9, ((300 - modeT) / 6) | 0)), 72, 48); }
            if (paused) text('PAUSED', 88, 112);
          }
        }
        g.fillStyle = '#fff';
        drawFooter();
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = '#ff3a3a'; g.fillRect(0, 32, W, 32);
        g.fillStyle = '#2dff4a'; g.fillRect(0, 184, W, 56); g.fillRect(0, 240, 136, 16);
        g.globalCompositeOperation = 'source-over';
      }

      function present() {
        const r = canvas.getBoundingClientRect();
        if (!r.width) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        const tw = Math.max(1, Math.round(r.width * dpr)), th = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== tw || canvas.height !== th) { canvas.width = tw; canvas.height = th; }
        vctx.setTransform(1, 0, 0, 1, 0, 0);
        const k = Math.ceil(tw / W);
        if (tw % W === 0 || tw >= W * 4) { vctx.imageSmoothingEnabled = false; vctx.drawImage(low, 0, 0, tw, th); return; }
        if (mid.width !== W * k) { mid.width = W * k; mid.height = H * k; }
        mctx.imageSmoothingEnabled = false;
        mctx.drawImage(low, 0, 0, W * k, H * k);
        vctx.imageSmoothingEnabled = true; vctx.imageSmoothingQuality = 'high';
        vctx.drawImage(mid, 0, 0, tw, th);
      }

      const keys = api.keys;
      const padEl = document.createElement('div');
      padEl.className = 'iv-pad';
      const arrow = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
      const mkBtn = (html, cls, down, up) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = cls; b.innerHTML = html;
        const off = () => { b.classList.remove('on'); if (up) up(); };
        b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} b.classList.add('on'); audio(); down(); });
        b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
        b.addEventListener('contextmenu', e => e.preventDefault());
        return b;
      };
      const grp = document.createElement('div');
      grp.append(mkBtn(arrow('M15 5l-7 7 7 7'), '', () => { held.l = true; }, () => { held.l = false; }),
        mkBtn(arrow('M9 5l7 7-7 7'), '', () => { held.r = true; }, () => { held.r = false; }));
      padEl.append(grp, mkBtn('FIRE', 'fire', () => { if (!startInput()) fire(); }));
      root.append(padEl);
      if (touchUI) root.classList.add('touch');

      function startInput() {
        if (mode === 'title') { if (modeT < 120) { modeT = 400; return true; } startGame(1); return true; }
        if (mode === 'over' && modeT < 240) { mode = 'title'; modeT = 400; return true; }
        return false;
      }
      api.on(window, 'keydown', e => {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        audio();
        const c = e.code;
        if (c === 'Space' || c.startsWith('Arrow')) e.preventDefault();
        if (e.repeat) return;
        if (c === 'Digit1' || c === 'Numpad1') { if (mode === 'title') startGame(1); return; }
        if (c === 'KeyP' && mode !== 'title' && mode !== 'over') { paused = !paused; return; }
        if (c === 'Space' || c === 'Enter' || c === 'NumpadEnter' || c === 'ArrowUp' || c === 'KeyW') { if (!startInput()) fire(); }
      });
      const local = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      let dragId = null;
      api.on(canvas, 'pointerdown', e => {
        if (e.pointerType === 'touch' && !touchUI) { touchUI = true; root.classList.add('touch'); }
        audio();
        const p = local(e);
        if (mode === 'title') {
          startInput(); return;
        }
        if (startInput()) return;
        if (p.y < 32 && mode !== 'over') { paused = !paused; return; }
        dragId = e.pointerId; dragX = p.x;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
        fire();
      });
      api.on(canvas, 'pointermove', e => { if (e.pointerId === dragId) dragX = local(e).x; });
      const dragEnd = e => { if (e.pointerId === dragId) { dragId = null; dragX = null; } };
      api.on(canvas, 'pointerup', dragEnd);
      api.on(canvas, 'pointercancel', dragEnd);

      let acc = 0;
      api.score(0);
      api.loop(dt => {
        acc += dt;
        while (acc >= STEP - .0005) { tick(); acc -= STEP; }
        draw();
        present();
      });

      root.__iv = {
        get: () => ({ mode, modeT, cur, n: players.length, players: players.map(p => ({ score: p.score, lives: p.lives, round: p.round, shots: p.shots, count: p.rack.count })), pl: { ...pl }, shot: { ...shot }, ashots: ashots.map(a => ({ on: a.on, x: a.x, y: a.y })), saucer: { ...saucer }, rackY: P ? Math.max(...Array.from(P.rack.y).filter((_, i) => P.rack.alive[i])) : 0 }),
        killAll: keep => { const R = P.rack; let k = R.count - (keep || 0); for (let i = 0; i < R.alive.length && k > 0; i++) if (R.alive[i]) { R.alive[i] = 0; R.count--; k--; } },
        set: o => { if (o.saucerTimer !== undefined) saucer.timer = o.saucerTimer; if (o.shots !== undefined) P.shots = o.shots; if (o.lives) P.lives = o.lives; if (o.x !== undefined) pl.x = o.x; if (o.rackDown) for (let i = 0; i < P.rack.y.length; i++) P.rack.y[i] += o.rackDown; },
        saucerPts: n => CFG.SAUCER_PTS[n % 15] * 10
      };

      return {
        destroy() {
          delete root.__iv;
          if (ac) { try { ufoO.stop(); ufoL.stop(); } catch (e) {} try { const p = ac.close(); if (p && p.catch) p.catch(() => {}); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers['invaders'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ivc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140c35"/><stop offset="1" stop-color="#05040f"/></linearGradient><radialGradient id="ivc-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff5050" stop-opacity=".55"/><stop offset="1" stop-color="#ff5050" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#ivc-bg)"/><g fill="#fff" opacity=".5"><rect x="24" y="30" width="3" height="3"/><rect x="372" y="150" width="3" height="3"/><rect x="18" y="190" width="3" height="3"/><rect x="360" y="40" width="3" height="3"/><rect x="300" y="196" width="3" height="3"/></g><ellipse cx="292" cy="32" rx="56" ry="22" fill="url(#ivc-glow)"/><path d="M280 18h24v4h-24zM272 22h40v4h-40zM268 26h48v4h-48zM264 30h8v4h-8zM276 30h8v4h-8zM288 30h8v4h-8zM300 30h8v4h-8zM312 30h8v4h-8zM260 34h64v4h-64zM268 38h12v4h-12zM288 38h8v4h-8zM304 38h12v4h-12zM272 42h4v4h-4zM308 42h4v4h-4z" fill="#ff4b4b"/><g><path d="M48 58h4v4h-4zM60 58h8v4h-8zM76 58h4v4h-4zM52 62h24v4h-24zM48 66h8v4h-8zM60 66h8v4h-8zM72 66h8v4h-8zM48 70h32v4h-32zM52 74h8v4h-8zM68 74h8v4h-8zM56 78h4v4h-4zM68 78h4v4h-4zM52 82h4v4h-4zM72 82h4v4h-4zM48 86h4v4h-4zM76 86h4v4h-4z" fill="#ffffff"/><path d="M104 58h4v4h-4zM116 58h8v4h-8zM132 58h4v4h-4zM108 62h24v4h-24zM104 66h8v4h-8zM116 66h8v4h-8zM128 66h8v4h-8zM104 70h32v4h-32zM108 74h8v4h-8zM124 74h8v4h-8zM112 78h4v4h-4zM124 78h4v4h-4zM108 82h4v4h-4zM128 82h4v4h-4zM104 86h4v4h-4zM132 86h4v4h-4z" fill="#ffffff"/><path d="M160 58h4v4h-4zM172 58h8v4h-8zM188 58h4v4h-4zM164 62h24v4h-24zM160 66h8v4h-8zM172 66h8v4h-8zM184 66h8v4h-8zM160 70h32v4h-32zM164 74h8v4h-8zM180 74h8v4h-8zM168 78h4v4h-4zM180 78h4v4h-4zM164 82h4v4h-4zM184 82h4v4h-4zM160 86h4v4h-4zM188 86h4v4h-4z" fill="#ffffff"/><path d="M216 58h4v4h-4zM228 58h8v4h-8zM244 58h4v4h-4zM220 62h24v4h-24zM216 66h8v4h-8zM228 66h8v4h-8zM240 66h8v4h-8zM216 70h32v4h-32zM220 74h8v4h-8zM236 74h8v4h-8zM224 78h4v4h-4zM236 78h4v4h-4zM220 82h4v4h-4zM240 82h4v4h-4zM216 86h4v4h-4zM244 86h4v4h-4z" fill="#ffffff"/><path d="M272 58h4v4h-4zM284 58h8v4h-8zM300 58h4v4h-4zM276 62h24v4h-24zM272 66h8v4h-8zM284 66h8v4h-8zM296 66h8v4h-8zM272 70h32v4h-32zM276 74h8v4h-8zM292 74h8v4h-8zM280 78h4v4h-4zM292 78h4v4h-4zM276 82h4v4h-4zM296 82h4v4h-4zM272 86h4v4h-4zM300 86h4v4h-4z" fill="#ffffff"/><path d="M328 58h4v4h-4zM340 58h8v4h-8zM356 58h4v4h-4zM332 62h24v4h-24zM328 66h8v4h-8zM340 66h8v4h-8zM352 66h8v4h-8zM328 70h32v4h-32zM332 74h8v4h-8zM348 74h8v4h-8zM336 78h4v4h-4zM348 78h4v4h-4zM332 82h4v4h-4zM352 82h4v4h-4zM328 86h4v4h-4zM356 86h4v4h-4z" fill="#ffffff"/><path d="M42 92h4v4h-4zM58 92h12v4h-12zM82 92h4v4h-4zM50 96h28v4h-28zM46 100h8v4h-8zM58 100h12v4h-12zM74 100h8v4h-8zM42 104h44v4h-44zM42 108h4v4h-4zM50 108h12v4h-12zM66 108h12v4h-12zM82 108h4v4h-4zM50 112h4v4h-4zM74 112h4v4h-4zM46 116h4v4h-4zM54 116h4v4h-4zM70 116h4v4h-4zM78 116h4v4h-4zM42 120h4v4h-4zM82 120h4v4h-4z" fill="#ffffff"/><path d="M98 92h4v4h-4zM114 92h12v4h-12zM138 92h4v4h-4zM106 96h28v4h-28zM102 100h8v4h-8zM114 100h12v4h-12zM130 100h8v4h-8zM98 104h44v4h-44zM98 108h4v4h-4zM106 108h12v4h-12zM122 108h12v4h-12zM138 108h4v4h-4zM106 112h4v4h-4zM130 112h4v4h-4zM102 116h4v4h-4zM110 116h4v4h-4zM126 116h4v4h-4zM134 116h4v4h-4zM98 120h4v4h-4zM138 120h4v4h-4z" fill="#ffffff"/><path d="M154 92h4v4h-4zM170 92h12v4h-12zM194 92h4v4h-4zM162 96h28v4h-28zM158 100h8v4h-8zM170 100h12v4h-12zM186 100h8v4h-8zM154 104h44v4h-44zM154 108h4v4h-4zM162 108h12v4h-12zM178 108h12v4h-12zM194 108h4v4h-4zM162 112h4v4h-4zM186 112h4v4h-4zM158 116h4v4h-4zM166 116h4v4h-4zM182 116h4v4h-4zM190 116h4v4h-4zM154 120h4v4h-4zM194 120h4v4h-4z" fill="#ffffff"/><path d="M210 92h4v4h-4zM226 92h12v4h-12zM250 92h4v4h-4zM218 96h28v4h-28zM214 100h8v4h-8zM226 100h12v4h-12zM242 100h8v4h-8zM210 104h44v4h-44zM210 108h4v4h-4zM218 108h12v4h-12zM234 108h12v4h-12zM250 108h4v4h-4zM218 112h4v4h-4zM242 112h4v4h-4zM214 116h4v4h-4zM222 116h4v4h-4zM238 116h4v4h-4zM246 116h4v4h-4zM210 120h4v4h-4zM250 120h4v4h-4z" fill="#ffffff"/><path d="M266 92h4v4h-4zM282 92h12v4h-12zM306 92h4v4h-4zM274 96h28v4h-28zM270 100h8v4h-8zM282 100h12v4h-12zM298 100h8v4h-8zM266 104h44v4h-44zM266 108h4v4h-4zM274 108h12v4h-12zM290 108h12v4h-12zM306 108h4v4h-4zM274 112h4v4h-4zM298 112h4v4h-4zM270 116h4v4h-4zM278 116h4v4h-4zM294 116h4v4h-4zM302 116h4v4h-4zM266 120h4v4h-4zM306 120h4v4h-4z" fill="#ffffff"/><path d="M322 92h4v4h-4zM338 92h12v4h-12zM362 92h4v4h-4zM330 96h28v4h-28zM326 100h8v4h-8zM338 100h12v4h-12zM354 100h8v4h-8zM322 104h44v4h-44zM322 108h4v4h-4zM330 108h12v4h-12zM346 108h12v4h-12zM362 108h4v4h-4zM330 112h4v4h-4zM354 112h4v4h-4zM326 116h4v4h-4zM334 116h4v4h-4zM350 116h4v4h-4zM358 116h4v4h-4zM322 120h4v4h-4zM362 120h4v4h-4z" fill="#ffffff"/><path d="M42 126h4v4h-4zM58 126h12v4h-12zM82 126h4v4h-4zM50 130h28v4h-28zM46 134h8v4h-8zM58 134h12v4h-12zM74 134h8v4h-8zM42 138h44v4h-44zM42 142h4v4h-4zM50 142h12v4h-12zM66 142h12v4h-12zM82 142h4v4h-4zM50 146h4v4h-4zM74 146h4v4h-4zM46 150h4v4h-4zM54 150h4v4h-4zM70 150h4v4h-4zM78 150h4v4h-4zM42 154h4v4h-4zM82 154h4v4h-4z" fill="#e9e6ff"/><path d="M98 126h4v4h-4zM114 126h12v4h-12zM138 126h4v4h-4zM106 130h28v4h-28zM102 134h8v4h-8zM114 134h12v4h-12zM130 134h8v4h-8zM98 138h44v4h-44zM98 142h4v4h-4zM106 142h12v4h-12zM122 142h12v4h-12zM138 142h4v4h-4zM106 146h4v4h-4zM130 146h4v4h-4zM102 150h4v4h-4zM110 150h4v4h-4zM126 150h4v4h-4zM134 150h4v4h-4zM98 154h4v4h-4zM138 154h4v4h-4z" fill="#e9e6ff"/><path d="M154 126h4v4h-4zM170 126h12v4h-12zM194 126h4v4h-4zM162 130h28v4h-28zM158 134h8v4h-8zM170 134h12v4h-12zM186 134h8v4h-8zM154 138h44v4h-44zM154 142h4v4h-4zM162 142h12v4h-12zM178 142h12v4h-12zM194 142h4v4h-4zM162 146h4v4h-4zM186 146h4v4h-4zM158 150h4v4h-4zM166 150h4v4h-4zM182 150h4v4h-4zM190 150h4v4h-4zM154 154h4v4h-4zM194 154h4v4h-4z" fill="#e9e6ff"/><path d="M266 126h4v4h-4zM282 126h12v4h-12zM306 126h4v4h-4zM274 130h28v4h-28zM270 134h8v4h-8zM282 134h12v4h-12zM298 134h8v4h-8zM266 138h44v4h-44zM266 142h4v4h-4zM274 142h12v4h-12zM290 142h12v4h-12zM306 142h4v4h-4zM274 146h4v4h-4zM298 146h4v4h-4zM270 150h4v4h-4zM278 150h4v4h-4zM294 150h4v4h-4zM302 150h4v4h-4zM266 154h4v4h-4zM306 154h4v4h-4z" fill="#e9e6ff"/><path d="M322 126h4v4h-4zM338 126h12v4h-12zM362 126h4v4h-4zM330 130h28v4h-28zM326 134h8v4h-8zM338 134h12v4h-12zM354 134h8v4h-8zM322 138h44v4h-44zM322 142h4v4h-4zM330 142h12v4h-12zM346 142h12v4h-12zM362 142h4v4h-4zM330 146h4v4h-4zM354 146h4v4h-4zM326 150h4v4h-4zM334 150h4v4h-4zM350 150h4v4h-4zM358 150h4v4h-4zM322 154h4v4h-4zM362 154h4v4h-4z" fill="#e9e6ff"/><path d="M52 160h24v4h-24zM44 164h40v4h-40zM40 168h12v4h-12zM56 168h16v4h-16zM76 168h12v4h-12zM40 172h48v4h-48zM44 176h8v4h-8zM56 176h16v4h-16zM76 176h8v4h-8zM48 180h8v4h-8zM72 180h8v4h-8zM44 184h8v4h-8zM60 184h8v4h-8zM76 184h8v4h-8zM40 188h8v4h-8zM80 188h8v4h-8z" fill="#e9e6ff"/><path d="M108 160h24v4h-24zM100 164h40v4h-40zM96 168h12v4h-12zM112 168h16v4h-16zM132 168h12v4h-12zM96 172h48v4h-48zM100 176h8v4h-8zM112 176h16v4h-16zM132 176h8v4h-8zM104 180h8v4h-8zM128 180h8v4h-8zM100 184h8v4h-8zM116 184h8v4h-8zM132 184h8v4h-8zM96 188h8v4h-8zM136 188h8v4h-8z" fill="#e9e6ff"/><path d="M164 160h24v4h-24zM156 164h40v4h-40zM152 168h12v4h-12zM168 168h16v4h-16zM188 168h12v4h-12zM152 172h48v4h-48zM156 176h8v4h-8zM168 176h16v4h-16zM188 176h8v4h-8zM160 180h8v4h-8zM184 180h8v4h-8zM156 184h8v4h-8zM172 184h8v4h-8zM188 184h8v4h-8zM152 188h8v4h-8zM192 188h8v4h-8z" fill="#e9e6ff"/><path d="M220 160h24v4h-24zM212 164h40v4h-40zM208 168h12v4h-12zM224 168h16v4h-16zM244 168h12v4h-12zM208 172h48v4h-48zM212 176h8v4h-8zM224 176h16v4h-16zM244 176h8v4h-8zM216 180h8v4h-8zM240 180h8v4h-8zM212 184h8v4h-8zM228 184h8v4h-8zM244 184h8v4h-8zM208 188h8v4h-8zM248 188h8v4h-8z" fill="#e9e6ff"/><path d="M276 160h24v4h-24zM268 164h40v4h-40zM264 168h12v4h-12zM280 168h16v4h-16zM300 168h12v4h-12zM264 172h48v4h-48zM268 176h8v4h-8zM280 176h16v4h-16zM300 176h8v4h-8zM272 180h8v4h-8zM296 180h8v4h-8zM268 184h8v4h-8zM284 184h8v4h-8zM300 184h8v4h-8zM264 188h8v4h-8zM304 188h8v4h-8z" fill="#e9e6ff"/><path d="M332 160h24v4h-24zM324 164h40v4h-40zM320 168h12v4h-12zM336 168h16v4h-16zM356 168h12v4h-12zM320 172h48v4h-48zM324 176h8v4h-8zM336 176h16v4h-16zM356 176h8v4h-8zM328 180h8v4h-8zM352 180h8v4h-8zM324 184h8v4h-8zM340 184h8v4h-8zM356 184h8v4h-8zM320 188h8v4h-8zM360 188h8v4h-8z" fill="#e9e6ff"/></g><circle cx="232" cy="142" r="28" fill="#ffe46b" opacity=".22"/><path d="M222 126h4v4h-4zM238 126h4v4h-4zM210 130h4v4h-4zM226 130h4v4h-4zM234 130h4v4h-4zM250 130h4v4h-4zM214 134h4v4h-4zM246 134h4v4h-4zM218 138h4v4h-4zM242 138h4v4h-4zM206 142h8v4h-8zM250 142h8v4h-8zM218 146h4v4h-4zM242 146h4v4h-4zM214 150h4v4h-4zM222 150h4v4h-4zM238 150h4v4h-4zM246 150h4v4h-4zM210 154h4v4h-4zM226 154h4v4h-4zM234 154h4v4h-4zM250 154h4v4h-4z" fill="#ffe46b"/><path d="M150 172l6 6-6 6 6 6-6 6" stroke="#fff" stroke-width="4" fill="none"/><path d="M300 176v24m-6-16h12" stroke="#fff" stroke-width="4"/><rect x="0" y="200" width="400" height="100" fill="#36e05a" opacity=".07"/><path d="M10 246v-26q0-12 12-12h48q12 0 12 12v26h-20v-10q0-8-8-8h-16q-8 0-8 8v10z" fill="#36e05a"/><path d="M96 246v-26q0-12 12-12h48q12 0 12 12v26h-20v-10q0-8-8-8h-16q-8 0-8 8v10z" fill="#36e05a"/><path d="M262 246v-26q0-12 12-12h48q12 0 12 12v26h-20v-10q0-8-8-8h-16q-8 0-8 8v10z" fill="#36e05a"/><path d="M348 246v-26q0-12 12-12h48q12 0 12 12v26h-20v-10q0-8-8-8h-16q-8 0-8 8v10z" fill="#36e05a"/><path d="M116 208h10v6h-10zM134 210h6v6h-6zM280 208h8v8h-8z" fill="#0c0820"/><rect x="230" y="160" width="4" height="88" fill="#b9ffc6" opacity=".85"/><path d="M230 250h4v4h-4zM226 254h12v4h-12zM214 258h36v4h-36zM210 262h44v4h-44zM206 266h52v4h-52zM206 270h8v4h-8zM218 270h28v4h-28zM250 270h8v4h-8zM206 274h52v4h-52zM210 278h12v4h-12zM226 278h12v4h-12zM242 278h12v4h-12z" fill="#36e05a"/><rect x="0" y="286" width="400" height="4" fill="#36e05a"/></svg>`;
})();

