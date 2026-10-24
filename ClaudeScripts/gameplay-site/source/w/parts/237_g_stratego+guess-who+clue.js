(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeIO = t => { t = clamp(t, 0, 1); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function mkAudio(api) {
    let ac = null, nb = null;
    const ctx = () => {
      try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
      return ac;
    };
    const tone = (f, d, type = 'sine', v = .07, f2, at = 0) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .04);
      } catch (e) {}
    };
    const noise = (d, v = .1, f = 1200, at = 0, type = 'lowpass') => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        if (!nb) { nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        const t = c.currentTime + at, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
        s.buffer = nb; s.loop = true; fl.type = type; fl.frequency.value = f;
        g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        s.connect(fl).connect(g).connect(c.destination); s.start(t); s.stop(t + d + .05);
      } catch (e) {}
    };
    return { tone, noise, unlock: ctx };
  }

  function mkNetHooks(api, H) {
    const offs = [];
    const add = (t, f) => offs.push(api.net.on(t, f));
    add('data', H.data);
    add('leave', H.leave);
    add('rejoin', H.rejoin);
    add('lobby', H.lobby);
    add('close', H.close);
    return () => offs.forEach(f => { try { f(); } catch (e) {} });
  }

  const hsKey = id => 'gameplay:ng:' + id;
  function hsSave(id, code, d) { try { sessionStorage.setItem(hsKey(id), JSON.stringify({ code, at: Date.now(), d })); } catch (e) {} }
  function hsClear(id) { try { sessionStorage.removeItem(hsKey(id)); } catch (e) {} }
  function hsLoad(id, code) { try { const x = JSON.parse(sessionStorage.getItem(hsKey(id)) || 'null'); if (x && code && x.code === code && Date.now() - x.at < 432e5 && x.d) return x.d; } catch (e) {} return null; }
  function mkHs(api, id) {
    let code = null;
    const cur = () => { try { if (api.net.code) code = api.net.code; } catch (e) {} return code; };
    return { save: d => { const c = cur(); if (c) hsSave(id, c, d); }, load: () => hsLoad(id, cur()), clear: () => hsClear(id) };
  }
  const hsPane = (kick, line) => `<div class="bx-box"><p class="bx-kick">${kick}</p><h3>Game in progress</h3><p>${line}</p><button class="bx-btn" data-a="resume">Resume game</button><button class="bx-btn alt" data-a="new">New game</button></div>`;

  const BASE_CSS = `
.gm-@ [hidden]{display:none!important}
.gm-@{gap:10px;font-family:var(--sans);color:#1d2230}
.gm-@ button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-@ .bx-pane{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;padding:12px;overflow:auto;background:rgba(14,18,30,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);border-radius:inherit}
.gm-@ .bx-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;pointer-events:none}
.gm-@ .bx-pane.clear>*{pointer-events:auto}
.gm-@ .bx-box{width:100%;max-width:430px;margin:auto;background:linear-gradient(#fff,#f2f3fa);border:2px solid rgba(255,255,255,.7);border-radius:20px;padding:18px 18px 16px;text-align:center;box-shadow:0 20px 50px rgba(5,8,25,.5);animation:bx-in .32s cubic-bezier(.2,1.4,.4,1)}
.gm-@ .bx-box.wide{max-width:600px}
@keyframes bx-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-@ .bx-kick{margin:0 0 4px;font:900 11px var(--sans);letter-spacing:1.5px;text-transform:uppercase;color:var(--accent,#6c5ce7)}
.gm-@ .bx-box h3{margin:2px 0 8px;font:900 24px/1.1 var(--sans);letter-spacing:-.02em}
.gm-@ .bx-box p{margin:6px 0;font:600 14px/1.45 var(--sans);color:#4a5068}
.gm-@ .bx-btn{display:block;width:100%;min-height:48px;margin:8px 0;border:0;border-radius:14px;background:var(--bx,#6c5ce7);color:#fff;font:800 16px/1.1 var(--sans);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),0 6px 14px rgba(20,20,60,.22);padding:6px 12px}
.gm-@ .bx-btn small{display:block;font:700 12px var(--sans);opacity:.85;margin-top:2px}
.gm-@ .bx-btn.alt{background:#fff;color:#2a2f45;border:2px solid #d5d8e8;box-shadow:none}
.gm-@ .bx-btn.sm{display:inline-block;width:auto;min-height:40px;padding:0 16px;font-size:14px;margin:4px}
.gm-@ .bx-btn:disabled{opacity:.4;pointer-events:none}
.gm-@ .bx-btn:active{transform:scale(.97)}
.gm-@ .bx-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-@ .bx-seg{display:flex;gap:5px;margin:6px 0}
.gm-@ .bx-seg button{flex:1;min-height:42px;border-radius:12px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 14px var(--sans);padding:0 4px}
.gm-@ .bx-seg button.on{background:var(--bx,#6c5ce7);border-color:var(--bx,#6c5ce7);color:#fff}
.gm-@ .bx-lbl{text-align:left;margin:10px 0 0;font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#6b7190}
.gm-@ .bx-rules{text-align:left;max-height:56vh;overflow:auto;padding-right:4px}
.gm-@ .bx-rules p{font:600 13px/1.5 var(--sans)}
.gm-@ kbd{display:inline-block;padding:1px 6px;border-radius:5px;border:1px solid #c9cde0;background:#f4f5fb;font:700 11px var(--sans);color:#333}
.gm-@ .bx-net{position:absolute;right:8px;top:8px;z-index:5;display:flex;align-items:center;gap:6px;padding:3px 9px;border-radius:12px;background:rgba(10,14,30,.55);color:#fff;font:800 11px var(--sans)}
.gm-@ .bx-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-@ .bx-net.bad i{background:#ff5b4b}
`;

  const ST_NAMES = ['Flag', 'Spy', 'Scout', 'Miner', 'Sergeant', 'Lieutenant', 'Captain', 'Major', 'Colonel', 'General', 'Marshal', 'Bomb'];
  const ST_COUNT = [1, 1, 8, 5, 4, 4, 4, 3, 2, 1, 1, 6];
  const ST_CH = 'FS23456789XB';
  const ST_LBL = ['', 'S', '2', '3', '4', '5', '6', '7', '8', '9', '10', ''];
  const ST_VAL = [0, 6, 2.5, 6, 3.5, 4.5, 6, 9, 13, 20, 30, 3];
  const ST_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const ST_LAKE = new Set();
  [4, 5].forEach(r => [2, 3, 6, 7].forEach(c => ST_LAKE.add(r * 10 + c)));

  function stFight(a, d) {
    if (d === 0) return 'w';
    if (d === 11) return a === 3 ? 'w' : 'l';
    if (a === 1 && d === 10) return 'w';
    return a > d ? 'w' : a < d ? 'l' : 't';
  }

  const stRot = i => 99 - i;
  const stOwn = (p, i) => p === 0 ? 60 + i : 39 - i;

  const ST_STYLES = {
    balanced: { F: 3, B: 2.3, S: 2, 2: .6, 3: 1.8, 4: 1.2, 5: 1.4, 6: 1.3, 7: 1, 8: .9, 9: 1, X: 1.1 },
    defensive: { F: 3, B: 2.8, S: 2.4, 2: 1.2, 3: 2.2, 4: 1.7, 5: 1.9, 6: 2, 7: 1.8, 8: 2, 9: 2.2, X: 2.4 },
    aggressive: { F: 3, B: 1.7, S: 1.6, 2: .3, 3: 1.4, 4: .8, 5: .9, 6: .6, 7: .4, 8: .2, 9: .1, X: .1 },
    bluffer: { F: 3, B: 1.3, S: 2.6, 2: .9, 3: 2.2, 4: .3, 5: .4, 6: .8, 7: 1.5, 8: 2.2, 9: 2.6, X: 3 }
  };

  function stGen(style) {
    const pf = ST_STYLES[style] || ST_STYLES.balanced;
    for (let tries = 0; tries < 40; tries++) {
      const g = Array(40).fill(-1), free = new Set([...Array(40).keys()]);
      const put = (i, r) => { g[i] = r; free.delete(i); };
      const corner = style === 'defensive' && Math.random() < .7;
      const fc = corner ? (Math.random() < .5 ? 0 : 9) : style === 'bluffer' ? 1 + rnd(8) : rnd(10);
      const fi = 30 + fc;
      put(fi, 0);
      const guard = [];
      if (fc > 0) guard.push(fi - 1);
      if (fc < 9) guard.push(fi + 1);
      guard.push(fi - 10);
      shuffle(guard);
      const wantG = style === 'defensive' ? 3 : style === 'aggressive' ? 1 : style === 'bluffer' ? 2 : 2 + rnd(2);
      let bombs = 6;
      for (let k = 0; k < guard.length && k < wantG && bombs > 0; k++) { if (free.has(guard[k])) { put(guard[k], 11); bombs--; } }
      const rest = [];
      ST_COUNT.forEach((n, r) => { if (r === 0) return; const m = r === 11 ? bombs : n; for (let i = 0; i < m; i++) rest.push(r); });
      shuffle(rest);
      rest.sort((a, b) => (a === 11 ? 1 : 0) - (b === 11 ? 1 : 0));
      for (const r of rest) {
        const pref = pf[ST_CH[r]] ?? 1.5;
        let best = -1, bc = 1e9;
        for (const i of free) {
          const row = Math.floor(i / 10), col = i % 10;
          let c = Math.abs(row - pref) + Math.random() * 1.5;
          if (r === 2 && (col === 0 || col === 9)) c += .2;
          if (r === 11 && row === 0 && style !== 'bluffer') c += 1.5;
          if (c < bc) { bc = c; best = i; }
        }
        put(best, r);
      }
      let mov = 0;
      for (let c = 0; c < 10; c++) if (g[c] > 0 && g[c] < 11) mov++;
      if (mov >= 4) return g;
    }
    return stGen('balanced');
  }

  function stSetupOk(g) {
    if (!g || g.length !== 40) return false;
    const n = Array(12).fill(0);
    for (const r of g) { if (!(r >= 0 && r < 12)) return false; n[r]++; }
    return n.every((x, r) => x === ST_COUNT[r]);
  }

  function stNew(s0, s1) {
    const cells = Array(100).fill(null), ids = shuffle([...Array(80).keys()]);
    let k = 0;
    [s0, s1].forEach((s, p) => {
      for (let i = 0; i < 40; i++) cells[stOwn(p, i)] = { id: ids[k++], o: p, r: s[i], rev: false, mv: false };
    });
    const g = { cells, turn: 0, over: false, winner: -1, draw: false, reason: '', rep: [null, null], lost: [Array(12).fill(0), Array(12).fill(0)], last: null, moves: 0 };
    stCheckEnd(g, -1);
    return g;
  }

  function stMovesRaw(cells, o) {
    const out = [];
    for (let i = 0; i < 100; i++) {
      const p = cells[i];
      if (!p || p.o !== o || p.r === 0 || p.r === 11) continue;
      const r0 = (i / 10) | 0, c0 = i % 10;
      for (let d = 0; d < 4; d++) {
        let r = r0 + ST_DIRS[d][0], c = c0 + ST_DIRS[d][1];
        while (r >= 0 && r < 10 && c >= 0 && c < 10) {
          const j = r * 10 + c;
          if (ST_LAKE.has(j)) break;
          const q = cells[j];
          if (q) { if (q.o !== o) out.push([i, j]); break; }
          out.push([i, j]);
          if (p.r !== 2) break;
          r += ST_DIRS[d][0]; c += ST_DIRS[d][1];
        }
      }
    }
    return out;
  }

  function stMoves(g, o) {
    const all = stMovesRaw(g.cells, o), rp = g.rep && g.rep[o];
    if (!rp) return all;
    return all.filter(m => {
      const p = g.cells[m[0]];
      return !(rp.id === p.id && rp.n >= 3 && !g.cells[m[1]] && m[0] === rp.to && m[1] === rp.from);
    });
  }

  function stCheckEnd(g, mover) {
    const a = stMoves(g, g.turn).length, b = stMoves(g, g.turn ^ 1).length;
    if (mover >= 0 && g.flagTaken) { g.over = true; g.winner = mover; g.reason = 'flag'; return; }
    if (a === 0 && b === 0) { g.over = true; g.draw = true; g.winner = -1; g.reason = 'draw'; }
    else if (a === 0) { g.over = true; g.winner = g.turn ^ 1; g.reason = 'stuck'; }
  }

  function stApply(g, m) {
    const [a, b] = m, p = g.cells[a], q = g.cells[b], evs = [];
    const dist = stDist(a, b);
    if (!q) {
      p.mv = true;
      if (dist > 1) p.rev = true;
      g.cells[a] = null; g.cells[b] = p;
      const rp = g.rep[p.o];
      if (rp && rp.id === p.id && a === rp.to && b === rp.from) g.rep[p.o] = { id: p.id, from: a, to: b, n: rp.n + 1 };
      else g.rep[p.o] = { id: p.id, from: a, to: b, n: 1 };
      evs.push({ k: 'm', from: a, to: b, id: p.id, o: p.o, r: dist > 1 ? p.r : -1, far: dist > 1 });
    } else {
      p.rev = true; q.rev = true; p.mv = true;
      const res = stFight(p.r, q.r);
      g.rep[p.o] = null;
      evs.push({ k: 'b', from: a, to: b, a: { id: p.id, r: p.r, o: p.o }, d: { id: q.id, r: q.r, o: q.o }, res, far: dist > 1 });
      g.cells[a] = null;
      if (res === 'w') { g.lost[q.o][q.r]++; g.cells[b] = p; if (q.r === 0) g.flagTaken = true; }
      else if (res === 'l') g.lost[p.o][p.r]++;
      else { g.lost[p.o][p.r]++; g.lost[q.o][q.r]++; g.cells[b] = null; }
    }
    g.last = [a, b]; g.moves++;
    const mover = g.turn;
    g.turn ^= 1;
    stCheckEnd(g, mover);
    return evs;
  }

  function stView(g, p) {
    const full = g.over;
    return {
      cells: g.cells.map(c => c && { id: c.id, o: c.o, r: (c.o === p || c.rev || full) ? c.r : -1, mv: c.mv, rev: c.rev }),
      turn: g.turn, over: g.over, winner: g.winner, draw: g.draw, reason: g.reason,
      lost: g.lost.map(a => a.slice()), last: g.last && g.last.slice(), moves: g.moves, rep: g.rep.map(r => r && { ...r })
    };
  }

  function stPoolCounts(view, owner) {
    const n = ST_COUNT.slice();
    for (let r = 0; r < 12; r++) n[r] -= view.lost[owner][r];
    for (const c of view.cells) if (c && c.o === owner && c.rev) n[c.r]--;
    return n;
  }

  function stSampleWorld(view, me) {
    const en = me ^ 1, pool = ST_COUNT.slice();
    for (let r = 0; r < 12; r++) pool[r] -= view.lost[en][r];
    const un = [], mv = [], out = new Array(100).fill(-1);
    view.cells.forEach((c, i) => {
      if (!c || c.o !== en) return;
      if (c.r >= 0) { pool[c.r]--; out[i] = c.r; }
      else (c.mv ? mv : un).push(i);
    });
    const depth = i => en === 0 ? Math.floor(i / 10) - 6 : 3 - Math.floor(i / 10);
    const free = un.slice();
    const takeW = fn => {
      let tot = 0; const ws = free.map(i => { const w = fn(i); tot += w; return w; });
      let x = Math.random() * tot, k = 0;
      while (k < free.length - 1 && x > ws[k]) { x -= ws[k]; k++; }
      return free.splice(k, 1)[0];
    };
    let fpos = -1;
    if (pool[0] > 0 && free.length) { fpos = takeW(i => [.3, .6, 1.5, 4][clamp(depth(i), 0, 3)]); out[fpos] = 0; pool[0]--; }
    for (let k = 0; k < pool[11] && free.length; k++) {
      const i = takeW(i2 => {
        let w = [.5, 1, 1.4, 1.2][clamp(depth(i2), 0, 3)];
        if (fpos >= 0 && Math.abs(i2 - fpos) <= 10 && (Math.abs(i2 - fpos) === 10 || Math.abs(i2 - fpos) === 1)) w += 4;
        return w;
      });
      out[i] = 11;
    }
    pool[11] = 0;
    const rest = [];
    pool.forEach((n, r) => { if (r !== 0) for (let k = 0; k < Math.max(0, n); k++) rest.push(r); });
    shuffle(rest);
    const slots = free.concat(mv);
    shuffle(slots);
    slots.forEach(i => { let r = rest.pop(); if (r === undefined) r = 3; out[i] = r; });
    mv.forEach(i => { if (out[i] === 11 || out[i] === 0) out[i] = 3 + rnd(5); });
    return out;
  }

  function stFlagProb(view, me) {
    const en = me ^ 1, pool = stPoolCounts(view, en), P = new Array(100).fill(0);
    if (pool[0] <= 0) return P;
    let tot = 0;
    view.cells.forEach((c, i) => {
      if (!c || c.o !== en || c.r >= 0 || c.mv) return;
      const d = en === 0 ? Math.floor(i / 10) - 6 : 3 - Math.floor(i / 10);
      P[i] = [.3, .6, 1.5, 4][clamp(d, 0, 3)]; tot += P[i];
    });
    if (tot > 0) for (let i = 0; i < 100; i++) P[i] /= tot;
    return P;
  }

  const stDist = (a, b) => Math.abs(((a / 10) | 0) - ((b / 10) | 0)) + Math.abs(a % 10 - b % 10);

  function stOutcome(a, d) {
    const res = stFight(a, d);
    return res === 'w' ? ST_VAL[d] : res === 'l' ? -ST_VAL[a] : ST_VAL[d] - ST_VAL[a];
  }

  const ST_LEVEL = {
    easy: { K: 3, noise: 2.6, rnd: .22, bluff: .02, flag: .6 },
    normal: { K: 16, noise: .5, rnd: .02, bluff: .12, flag: 1 },
    hard: { K: 48, noise: .18, rnd: 0, bluff: .24, flag: 1.2, deep: .4 }
  };

  function stAI(view, me, level, mem) {
    const L = ST_LEVEL[level] || ST_LEVEL.normal, en = me ^ 1;
    const g = { cells: view.cells, rep: view.rep || [null, null] };
    const moves = stMoves(g, me);
    if (!moves.length) return null;
    if (Math.random() < L.rnd) return pick(moves);
    const myPool = stPoolCounts(view, me);
    const belTot = [0, 0];
    const bel = [Array(12).fill(0), Array(12).fill(0)];
    for (let e = 1; e <= 10; e++) for (let mvd = 0; mvd < 2; mvd++) {
      let tot = 0, sum = 0;
      for (let r = 0; r < 12; r++) {
        if (mvd && (r === 0 || r === 11)) continue;
        const n = Math.max(0, myPool[r]);
        tot += n; sum += n * stOutcome(e, r);
      }
      bel[mvd][e] = tot ? sum / tot : 0;
      belTot[mvd] = tot;
    }
    const fp = stFlagProb(view, me);
    const frontRow = i => me === 0 ? 9 - Math.floor(i / 10) : Math.floor(i / 10);
    mem = mem || {};
    const score = new Array(moves.length).fill(0);
    const worlds = [];
    for (let k = 0; k < L.K; k++) worlds.push(stSampleWorld(view, me));
    for (const w of worlds) {
      const rk = i => { const c = view.cells[i]; return c.o === me || c.r >= 0 ? c.r : w[i]; };
      moves.forEach((m, mi) => {
        const [a, b] = m, pa = view.cells[a], qb = view.cells[b];
        let v = 0;
        const sim = new Array(100);
        for (let i = 0; i < 100; i++) { const c = view.cells[i]; sim[i] = c ? { o: c.o, r: rk(i), rev: c.rev, mv: c.mv } : null; }
        const at = sim[a];
        if (qb) {
          const d = sim[b], res = stFight(at.r, d.r);
          if (res === 'w') { v += ST_VAL[d.r]; sim[b] = at; sim[a] = null; at.rev = true; at.mv = true; }
          else if (res === 'l') { v -= ST_VAL[at.r]; sim[a] = null; d.rev = true; }
          else { v += ST_VAL[d.r] - ST_VAL[at.r]; sim[a] = null; sim[b] = null; }
        } else {
          sim[b] = at; sim[a] = null; at.mv = true;
        }
        let bestE = -1e9, bestReal = 0, bestMove = null;
        const em = stMovesRaw(sim, en);
        for (const e of em) {
          const x = sim[e[0]], y = sim[e[1]];
          let sc, real = 0;
          if (y) {
            if (!y.rev) {
              const mvd = y.mv ? 1 : 0;
              sc = belTot[mvd] ? bel[mvd][x.r] : 0;
              sc -= .25;
            } else sc = stOutcome(x.r, y.r);
            real = stOutcome(x.r, y.r);
          } else {
            sc = .02 * (en === 0 ? 9 - Math.floor(e[1] / 10) : Math.floor(e[1] / 10)) * .1;
            real = 0;
          }
          if (sc > bestE) { bestE = sc; bestReal = real; bestMove = e; }
        }
        v -= bestReal;
        if (L.deep && bestMove) {
          const [ea, eb] = bestMove, x = sim[ea], y = sim[eb];
          if (y) {
            const res = stFight(x.r, y.r);
            if (res === 'w') { sim[eb] = x; sim[ea] = null; } else if (res === 'l') sim[ea] = null; else { sim[ea] = null; sim[eb] = null; }
          } else { sim[eb] = x; sim[ea] = null; }
          let best3 = 0;
          for (const f of stMovesRaw(sim, me)) {
            const t = sim[f[1]];
            if (!t) continue;
            const o3 = stOutcome(sim[f[0]].r, t.r);
            if (o3 > best3) best3 = o3;
          }
          v += best3 * L.deep;
        }
        score[mi] += v;
      });
    }
    for (let mi = 0; mi < moves.length; mi++) score[mi] /= worlds.length;
    const decoy = mem.decoy;
    moves.forEach((m, mi) => {
      const [a, b] = m, p = view.cells[a], q = view.cells[b];
      let s = score[mi];
      const ra = frontRow(a), rb = frontRow(b);
      s += (rb - ra) * (p.r === 2 ? .05 : .09) * (p.r >= 9 && !p.rev ? .6 : 1);
      if (q) {
        if (q.r < 0) {
          s += 1.1;
          if (!q.mv) s += fp[b] * 60 * L.flag + (p.r === 3 ? 1.6 : 0);
          if (!p.rev) s -= ST_VAL[p.r] * (p.r >= 9 ? .16 : .05);
          if (p.r === 1) s -= 4;
        }
      } else if (!p.rev && p.r === 2 && stDist(a, b) > 1) s -= .25;
      if (view.last && view.last[1] === a && view.last[0] === b && !q) s -= .35;
      let near = 0;
      view.cells.forEach((c, i) => {
        if (!c || c.o !== en || c.r < 0) return;
        const da = stDist(a, i), db = stDist(b, i);
        if (stFight(p.r, c.r) === 'w' && c.r > 0) near += (da - db) * ST_VAL[c.r] * .045;
        else if (p.r === 1 && c.r === 10) near += (da - db) * .6;
      });
      if (!q) s += Math.max(-1, Math.min(1.6, near));
      if (p.r === 3 && !q) {
        let bd = 99;
        view.cells.forEach((c, i) => { if (c && c.o === en && c.r < 0 && !c.mv) { const dd = stDist(b, i); if (dd < bd) bd = dd; } });
        const ec = view.cells.filter(c => c && c.o === en && c.r !== 0 && c.r !== 11 && (c.mv || c.r >= 0)).length;
        if (ec < 8) s += (10 - bd) * .04 * L.flag;
      }
      if (decoy != null && p.id === decoy && !p.rev && !q) {
        s += (rb - ra) * .5;
        let danger = 0;
        for (const e of stMovesRaw(view.cells, en)) if (e[1] === b && view.cells[e[0]].r >= 0 && view.cells[e[0]].r > p.r) danger = 1;
        if (danger) s -= 3;
        else view.cells.forEach(c => { if (c && c.o === en && c.r >= 4 && c.r <= 9) s += .08; });
      }
      s += (Math.random() - .5) * L.noise * 2;
      score[mi] = s;
    });
    if (!mem.decoy || !view.cells.some(c => c && c.id === mem.decoy) || (mem.decoyT && mem.decoyT < view.moves - 40)) {
      mem.decoy = null;
      if (Math.random() < L.bluff) {
        const cands = view.cells.filter(c => c && c.o === me && !c.rev && c.r >= 4 && c.r <= 6);
        if (cands.length) { mem.decoy = pick(cands).id; mem.decoyT = view.moves; }
      }
    }
    let bi = 0;
    for (let i = 1; i < moves.length; i++) if (score[i] > score[bi]) bi = i;
    return moves[bi];
  }

  const ST_TEAM = [
    { top: '#ea5a4c', mid: '#c8352b', bot: '#8e1c16', edge: '#5e100c', hi: '#ff9a8c', ink: '#7a1812' },
    { top: '#5b97ee', mid: '#3369c9', bot: '#1d4296', edge: '#102a66', hi: '#a5c8ff', ink: '#16367c' }
  ];

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function star(c, cx, cy, R, r, rot = -Math.PI / 2) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rot + i * Math.PI / 5, d = i % 2 ? r : R;
      c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * d, cy + Math.sin(a) * d);
    }
    c.closePath();
  }

  function stIcon(c, r) {
    const gold = '#e2b02c', goldD = '#6d4f0a', ink = '#2f3a24';
    c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
    if (r === 0) {
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(-8, -15); c.lineTo(-8, 16); c.stroke();
      c.fillStyle = '#d4352b'; c.strokeStyle = '#7d1612'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-7, -15); c.bezierCurveTo(-1, -19, 5, -10, 14, -14); c.lineTo(14, -1); c.bezierCurveTo(5, 3, -1, -6, -7, -2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.85)'; star(c, 3, -8, 3.6, 1.5); c.fill();
    } else if (r === 11) {
      const g = c.createRadialGradient(-3, 0, 1, 0, 3, 12);
      g.addColorStop(0, '#6b6f7a'); g.addColorStop(1, '#14161b');
      c.fillStyle = g; c.beginPath(); c.arc(0, 4, 11, 0, TAU); c.fill();
      c.fillStyle = '#2a2d35'; rr(c, -4, -10, 8, 6, 2); c.fill();
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -10); c.quadraticCurveTo(5, -16, 10, -13); c.stroke();
      c.fillStyle = '#ffb400'; star(c, 11, -14, 5, 2); c.fill();
      c.fillStyle = '#ff4a1c'; star(c, 11, -14, 2.6, 1.1); c.fill();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-4, 0, 3.2, 2, -.7, 0, TAU); c.fill();
    } else if (r === 1) {
      c.fillStyle = '#26262e'; c.beginPath(); c.ellipse(0, -4, 16, 4.5, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-8, -5); c.quadraticCurveTo(-9, -15, -3, -15); c.quadraticCurveTo(0, -13, 3, -15); c.quadraticCurveTo(9, -15, 8, -5); c.closePath(); c.fill();
      c.fillStyle = '#b0392e'; c.fillRect(-8, -8, 16, 3);
      c.fillStyle = '#1b1b22'; rr(c, -12, 2, 24, 8, 3.5); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-5.5, 6, 3, 1.6, 0, 0, TAU); c.ellipse(5.5, 6, 3, 1.6, 0, 0, TAU); c.fill();
      c.fillStyle = '#1b1b22'; c.beginPath(); c.arc(-5.5, 6, 1, 0, TAU); c.arc(5.5, 6, 1, 0, TAU); c.fill();
      c.strokeStyle = '#26262e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, 13); c.quadraticCurveTo(0, 17, 6, 13); c.stroke();
    } else if (r === 2) {
      c.fillStyle = '#3a4150'; rr(c, -15, -4, 11, 20, 4); c.fill(); rr(c, 4, -4, 11, 20, 4); c.fill();
      rr(c, -12, -11, 5, 9, 2); c.fill(); rr(c, 7, -11, 5, 9, 2); c.fill();
      c.fillStyle = '#4b5365'; rr(c, -5.5, 0, 11, 6, 2); c.fill();
      c.fillStyle = '#6fc3ff'; c.beginPath(); c.arc(-9.5, 14, 3.6, 0, TAU); c.arc(9.5, 14, 3.6, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(-10.5, 13, 1.2, 0, TAU); c.arc(8.5, 13, 1.2, 0, TAU); c.fill();
    } else if (r === 3) {
      c.strokeStyle = '#7a4f24'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 17); c.stroke();
      c.fillStyle = '#9ba3b3'; c.strokeStyle = '#3d4352'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(-12, -14, 0, -14); c.quadraticCurveTo(12, -14, 16, 0); c.lineTo(12, -1); c.quadraticCurveTo(8, -9, 0, -9); c.quadraticCurveTo(-8, -9, -12, -1); c.closePath(); c.fill(); c.stroke();
    } else if (r === 4) {
      c.strokeStyle = ink; c.lineWidth = 3.6;
      for (let k = 0; k < 3; k++) { const y0 = -11 + k * 8; c.beginPath(); c.moveTo(-12, y0 + 9); c.lineTo(0, y0); c.lineTo(12, y0 + 9); c.stroke(); }
    } else if (r === 5) {
      c.fillStyle = gold; c.strokeStyle = goldD; c.lineWidth = 1.5; rr(c, -12, -4, 24, 8, 2); c.fill(); c.stroke();
    } else if (r === 6) {
      c.fillStyle = gold; c.strokeStyle = goldD; c.lineWidth = 1.5;
      rr(c, -12, -10, 24, 7, 2); c.fill(); c.stroke(); rr(c, -12, 3, 24, 7, 2); c.fill(); c.stroke();
    } else if (r === 7) {
      c.fillStyle = gold; c.strokeStyle = goldD; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(0, -16); c.bezierCurveTo(13, -9, 13, 6, 0, 15); c.bezierCurveTo(-13, 6, -13, -9, 0, -16); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -13); c.lineTo(0, 17); c.moveTo(0, -4); c.lineTo(6, -9); c.moveTo(0, -4); c.lineTo(-6, -9); c.moveTo(0, 4); c.lineTo(6, -1); c.moveTo(0, 4); c.lineTo(-6, -1); c.stroke();
    } else if (r === 8) {
      c.fillStyle = '#6b5a3e'; c.strokeStyle = '#2f2616'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(-3, -4); c.quadraticCurveTo(-12, -16, -18, -9); c.quadraticCurveTo(-14, -3, -17, 3); c.quadraticCurveTo(-9, 2, -3, 8); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(3, -4); c.quadraticCurveTo(12, -16, 18, -9); c.quadraticCurveTo(14, -3, 17, 3); c.quadraticCurveTo(9, 2, 3, 8); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#e8d9b0'; c.beginPath(); c.ellipse(0, 3, 4.5, 11, 0, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -9, 4, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = gold; c.beginPath(); c.moveTo(3, -9); c.lineTo(8, -7); c.lineTo(3, -6.5); c.closePath(); c.fill();
    } else if (r === 9) {
      c.fillStyle = gold; c.strokeStyle = goldD; c.lineWidth = 1.2;
      [[0, -7, 7.5], [-10, 7, 7], [10, 7, 7]].forEach(([x, y, R]) => { star(c, x, y, R, R * .42); c.fill(); c.stroke(); });
    } else if (r === 10) {
      c.fillStyle = gold; c.strokeStyle = goldD; c.lineWidth = 1.1;
      [[-14, 6], [-7, -3], [0, -8], [7, -3], [14, 6]].forEach(([x, y], i) => { const R = i === 2 ? 6.8 : 5.4; star(c, x, y, R, R * .42); c.fill(); c.stroke(); });
      c.strokeStyle = ink; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 14, 7, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    }
    c.restore();
  }

  function stPaintPiece(c, o, r, S, o2) {
    const T = ST_TEAM[o], k = S / 64;
    c.save(); c.scale(k, k);
    c.fillStyle = 'rgba(0,0,0,.28)'; rr(c, 5, 10, 56, 52, 9); c.fill();
    c.fillStyle = T.edge; rr(c, 3, 8, 58, 54, 9); c.fill();
    const g = c.createLinearGradient(0, 3, 0, 56);
    g.addColorStop(0, T.top); g.addColorStop(.45, T.mid); g.addColorStop(1, T.bot);
    c.fillStyle = g; rr(c, 3, 3, 58, 54, 9); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.42)'; c.lineWidth = 1.6; rr(c, 4.5, 4.5, 55, 51, 8); c.stroke();
    if (r < 0) {
      c.fillStyle = 'rgba(0,0,0,.14)'; rr(c, 10, 10, 44, 40, 6); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.26)'; c.lineWidth = 1.4; rr(c, 10, 10, 44, 40, 6); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.22)'; star(c, 32, 30.5, 13, 5.4); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 1.4; c.beginPath(); c.arc(32, 30.5, 16, 0, TAU); c.stroke();
    } else {
      const lg = c.createLinearGradient(0, 9, 0, 49);
      lg.addColorStop(0, '#fbf6e6'); lg.addColorStop(1, '#e9dfc2');
      c.fillStyle = lg; rr(c, 8.5, 8.5, 47, 42, 6); c.fill();
      c.strokeStyle = T.ink; c.globalAlpha = .55; c.lineWidth = 1.2; rr(c, 8.5, 8.5, 47, 42, 6); c.stroke(); c.globalAlpha = 1;
      c.save(); c.translate(33, 32); c.scale(.74, .74); stIcon(c, r); c.restore();
      const lb = ST_LBL[r];
      if (lb) {
        c.font = '900 14px "Trebuchet MS",Arial,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
        c.lineWidth = 3; c.strokeStyle = 'rgba(251,246,230,.9)'; c.strokeText(lb, 12, 11);
        c.fillStyle = T.ink; c.fillText(lb, 12, 11);
      }
    }
    c.restore();
  }

  const stSprites = new Map();
  function stSprite(o, r, S) {
    const key = o + ':' + r + ':' + S;
    let cv = stSprites.get(key);
    if (cv) return cv;
    cv = document.createElement('canvas');
    cv.width = cv.height = S;
    stPaintPiece(cv.getContext('2d'), o, r, S);
    stSprites.set(key, cv);
    return cv;
  }
  const stChipUrl = (o, r) => stSprite(o, r, 80).toDataURL();

  function stPaintBoard(W, cell, X0, Y0) {
    const cv = document.createElement('canvas'), k = 2;
    cv.width = W * k; cv.height = W * k;
    const c = cv.getContext('2d'); c.scale(k, k);
    const bw = cell * 10;
    const wg = c.createLinearGradient(0, 0, W, W);
    wg.addColorStop(0, '#7c5430'); wg.addColorStop(.5, '#5e3f21'); wg.addColorStop(1, '#6f4a29');
    c.fillStyle = wg; rr(c, 0, 0, W, W, 18); c.fill();
    c.globalAlpha = .08;
    for (let i = 0; i < 90; i++) {
      c.strokeStyle = i % 2 ? '#000' : '#fff'; c.lineWidth = .8;
      const y = (i * 53.7) % W;
      c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 5, W * .6, y - 6, W, y + 2); c.stroke();
    }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 2; rr(c, 2, 2, W - 4, W - 4, 17); c.stroke();
    c.fillStyle = '#2f1d0e'; rr(c, X0 - 7, Y0 - 7, bw + 14, bw + 14, 8); c.fill();
    const fg = c.createLinearGradient(X0, Y0, X0 + bw, Y0 + bw);
    fg.addColorStop(0, '#b4c984'); fg.addColorStop(.5, '#9db66d'); fg.addColorStop(1, '#a8bf78');
    c.fillStyle = fg; c.fillRect(X0, Y0, bw, bw);
    let seed = 7;
    const rn = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 1500; i++) {
      c.fillStyle = rn() < .5 ? 'rgba(60,90,30,.14)' : 'rgba(255,255,220,.16)';
      c.fillRect(X0 + rn() * bw, Y0 + rn() * bw, 1.6, 1.6);
    }
    for (let r = 0; r < 10; r++) for (let q = 0; q < 10; q++) {
      if ((r + q) % 2) { c.fillStyle = 'rgba(40,70,20,.07)'; c.fillRect(X0 + q * cell, Y0 + r * cell, cell, cell); }
    }
    c.strokeStyle = 'rgba(40,60,20,.55)'; c.lineWidth = 1.5;
    for (let i = 0; i <= 10; i++) {
      c.beginPath(); c.moveTo(X0 + i * cell, Y0); c.lineTo(X0 + i * cell, Y0 + bw); c.moveTo(X0, Y0 + i * cell); c.lineTo(X0 + bw, Y0 + i * cell); c.stroke();
    }
    [[2, 4], [6, 4]].forEach(([q, r]) => {
      const x = X0 + q * cell, y = Y0 + r * cell, w = cell * 2, h = cell * 2;
      c.fillStyle = '#6b8a4a'; rr(c, x - 3, y - 3, w + 6, h + 6, 18); c.fill();
      const wgr = c.createLinearGradient(x, y, x + w, y + h);
      wgr.addColorStop(0, '#5fbdf0'); wgr.addColorStop(.5, '#2b86cf'); wgr.addColorStop(1, '#1d63ab');
      c.fillStyle = wgr; rr(c, x + 2, y + 2, w - 4, h - 4, 15); c.fill();
      c.save(); rr(c, x + 2, y + 2, w - 4, h - 4, 15); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.6;
      for (let i = 0; i < 9; i++) {
        const yy = y + 12 + i * (h - 20) / 8, ph = i * 1.7;
        c.beginPath();
        for (let t = 0; t <= 1.001; t += .05) { const xx = x + 6 + t * (w - 12), y2 = yy + Math.sin(t * 9 + ph) * 3; c[t ? 'lineTo' : 'moveTo'](xx, y2); }
        c.stroke();
      }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; rr(c, x + 2, y + 2, w - 4, h - 4, 15); c.stroke();
    });
    return cv;
  }

  const ST_CSS = BASE_CSS.replace(/@/g, 'stratego') + `
.gm-stratego{--bx:#c8352b;--accent:#c8352b}
.gm-stratego .st-wrap{width:100%;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start}
.gm-stratego .st-bd{position:relative;flex:1 1 380px;max-width:660px;min-width:0;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(40,22,6,.35);background:#5e3f21}
.gm-stratego .st-bd canvas{display:block;width:100%;height:auto;border-radius:0;background:#5e3f21;touch-action:none}
.gm-stratego .st-side{flex:0 1 250px;min-width:230px;display:flex;flex-direction:column;gap:10px}
.gm-stratego .st-card{background:#fff;border:1px solid #e3e5f0;border-radius:16px;padding:10px 12px;box-shadow:0 4px 14px rgba(30,30,70,.07)}
.gm-stratego .st-stat{display:flex;align-items:center;gap:10px;font:800 15px/1.2 var(--sans)}
.gm-stratego .st-stat i{flex:none;width:14px;height:14px;border-radius:50%;background:#c8352b;box-shadow:0 0 0 3px rgba(200,53,43,.2)}
.gm-stratego .st-stat i.b{background:#3369c9;box-shadow:0 0 0 3px rgba(51,105,201,.2)}
.gm-stratego .st-stat small{display:block;font:600 12px/1.3 var(--sans);color:#6b7190;margin-top:2px}
.gm-stratego .st-h{margin:0 0 6px;font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#6b7190}
.gm-stratego .st-tray{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.gm-stratego .st-chip{position:relative;padding:0;border:2px solid transparent;border-radius:10px;background:#f3f4fa;aspect-ratio:1;touch-action:none;display:block}
.gm-stratego .st-chip img{width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none}
.gm-stratego .st-chip b{position:absolute;right:-3px;top:-5px;min-width:19px;height:19px;border-radius:10px;background:#2a2f45;color:#fff;font:800 11px/19px var(--sans);text-align:center;padding:0 4px}
.gm-stratego .st-chip.on{border-color:#e2b02c;background:#fff6d6}
.gm-stratego .st-chip.zero{opacity:.3}
.gm-stratego .st-row{display:flex;flex-wrap:wrap;gap:6px}
.gm-stratego .st-b{flex:1 1 auto;min-height:38px;padding:0 12px;border-radius:11px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 13px var(--sans)}
.gm-stratego .st-b.p{background:#c8352b;border-color:#c8352b;color:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
.gm-stratego .st-b:disabled{opacity:.4;pointer-events:none}
.gm-stratego .st-b.on{border-color:#e2b02c;background:#fff6d6}
.gm-stratego .st-caps{display:flex;flex-wrap:wrap;gap:3px;min-height:26px}
.gm-stratego .st-cap{position:relative;width:30px;height:30px}
.gm-stratego .st-cap img{width:100%;height:100%;display:block}
.gm-stratego .st-cap b{position:absolute;right:-2px;bottom:-3px;min-width:14px;height:14px;border-radius:7px;background:#2a2f45;color:#fff;font:800 9px/14px var(--sans);text-align:center}
.gm-stratego .st-log{max-height:120px;overflow:auto;font:600 12px/1.45 var(--sans);color:#3d4360}
.gm-stratego .st-log div{padding:1px 0;border-bottom:1px dashed #eceef6}
.gm-stratego .st-log div:first-child{font-weight:800;color:#1d2230}
.gm-stratego .st-logo{display:flex;justify-content:center;gap:0;margin:2px 0 6px}
.gm-stratego .st-logo img{width:54px;height:54px;margin:0 -4px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))}
.gm-stratego .st-rk{display:grid;grid-template-columns:34px 1fr auto;gap:6px 8px;align-items:center;text-align:left;font:600 12.5px/1.3 var(--sans)}
.gm-stratego .st-rk img{width:34px;height:34px}
.gm-stratego .st-rk em{font-style:normal;font-weight:800;color:#6b7190}
@media(max-width:700px){.gm-stratego .st-side{flex:1 1 100%}.gm-stratego .st-tray{grid-template-columns:repeat(6,1fr)}}
`;

  const ST_HELP = `<div class="bx-rules">
<p><b>Goal.</b> Capture the enemy Flag, or leave your opponent with no piece that can move.</p>
<p><b>Setup.</b> Place all 40 pieces in your four rows by dragging them from the tray (or tap a piece, then tap a square). Presets and Random fill the board for you. The enemy cannot see what your pieces are.</p>
<p><b>Moving.</b> Red moves first. Move one piece one square up, down, left or right per turn. Pieces cannot enter the two lakes or jump over pieces. Bombs and the Flag never move. <b>Scouts (2)</b> move any distance in a straight line and may attack at the end of the move.</p>
<p><b>Attacking.</b> Move onto an enemy piece. Both pieces are revealed. The higher rank wins and takes the square, equal ranks are both removed. The Marshal (10) is the strongest, then General (9), Colonel (8), Major (7), Captain (6), Lieutenant (5), Sergeant (4), Miner (3), Scout (2), Spy (S).</p>
<p><b>Special pieces.</b> The <b>Spy</b> beats the Marshal only when the Spy attacks. A <b>Bomb</b> destroys any attacker except a <b>Miner</b>, which defuses it. Anything that attacks the Flag captures it.</p>
<p><b>Two-square rule.</b> You may not move the same piece back and forth between the same two squares more than three times in a row.</p>
<p><b>Controls.</b> Click or drag a piece, then click or drop it on a highlighted square. Keyboard: arrow keys move the cursor, <kbd>Enter</kbd> selects or moves. In setup: <kbd>2</kbd>-<kbd>9</kbd>, <kbd>0</kbd> (Marshal), <kbd>S</kbd>, <kbd>B</kbd>, <kbd>F</kbd> place a piece, <kbd>Delete</kbd> removes it.</p></div>`;

  const ST_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="13" width="20" height="26" rx="4"/><rect x="35" y="25" width="20" height="26" rx="4"/><path d="M19 22l2 5h5l-4 3 1.5 5-4.5-3-4.5 3 1.5-5-4-3h5zM45 36a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM45 36v-3"/></svg>';

  Ameplay.register({
    id: 'stratego',
    title: 'Stratego',
    category: 'Board',
    tint: '#c8352b',
    blurb: 'Hide your army, bluff, and capture the enemy flag. Ten ranks, bombs and a lot of nerve.',
    help: '<kbd>Drag</kbd> pieces to deploy · click a piece then a green square to move · scouts slide any distance · the Spy beats the Marshal only when attacking · miners defuse bombs · <kbd>Enter</kbd> selects with the keyboard',
    width: 940,
    format: v => v + ' pts',
    icon: ST_ICON,
    _t: { stGen, stSetupOk, stNew, stMoves, stApply, stView, stAI, stFight },
    css: ST_CSS,
    mount(root, api) {
      const au = mkAudio(api);
      const sv = api.load() || {};
      const opt = { diff: ['easy', 'normal', 'hard'].includes(sv.diff) ? sv.diff : 'normal', mine: stSetupOk(sv.mine) ? sv.mine : null, fast: !!sv.fast, mode: sv.mode === 'online' ? 'online' : 'cpu' };
      const save = () => api.save({ diff: opt.diff, mine: opt.mine, fast: opt.fast, mode: opt.mode });
      const W = 660, CELL = 62, X0 = 20, Y0 = 20;

      const wrap = mk('div', 'st-wrap');
      const bd = mk('div', 'st-bd');
      const side = mk('div', 'st-side');
      wrap.append(bd, side); root.append(wrap);
      const { canvas, ctx, toLocal } = api.canvas(W, W, bd);
      canvas.style.borderRadius = '0';
      const netEl = mk('div', 'bx-net', '<i></i><span>Online</span>'); netEl.hidden = true; root.append(netEl);
      const pane = mk('div', 'bx-pane'); pane.hidden = true; root.append(pane);
      const bgc = stPaintBoard(W, CELL, X0, Y0);

      const M = {
        mode: 'cpu', role: 'local', phase: 'menu', me: 0, g: null, V: null, names: ['You', 'CPU'], tok: 0, mem: {},
        ready: [false, false], rematch: [false, false], log: [], aiPending: false, players: [], hooked: false, left: false, scored: false
      };
      const S = { cells: Array(40).fill(-1), hand: null, drag: null, hover: -1, cursor: 66 };
      const D = { cells: Array(100).fill(null), q: [], cur: null, sel: -1, targets: [], fx: [], final: null, banner: null, shake: 0, overlay: 0, cursor: -1 };
      let paneCb = null, killNet = null;
      const now = () => performance.now();
      const spd = () => opt.fast ? .55 : 1;

      const scr = i => { let r = (i / 10) | 0, c = i % 10; if (M.me === 1) { r = 9 - r; c = 9 - c; } return [X0 + c * CELL, Y0 + r * CELL]; };
      const sAt = (x, y) => {
        const c = Math.floor((x - X0) / CELL), r = Math.floor((y - Y0) / CELL);
        if (c < 0 || c > 9 || r < 0 || r > 9 || x < X0 || y < Y0) return -1;
        return r * 10 + c;
      };
      const wAt = (x, y) => { const s = sAt(x, y); if (s < 0) return -1; let r = (s / 10) | 0, c = s % 10; if (M.me === 1) { r = 9 - r; c = 9 - c; } return r * 10 + c; };

      function showPane(html, cb, cls) {
        pane.className = 'bx-pane' + (cls ? ' ' + cls : ''); pane.innerHTML = html; pane.hidden = false; paneCb = cb || null;
      }
      function hidePane() { pane.hidden = true; paneCb = null; pane.innerHTML = ''; }
      api.on(pane, 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneCb) return;
        au.unlock(); au.tone(520, .05, 'sine', .05);
        paneCb(b.dataset.a, b);
      });

      const sfx = {
        step: () => { au.tone(300, .06, 'triangle', .06, 200); au.noise(.05, .04, 900); },
        slide: () => { au.noise(.18, .05, 700); },
        clash: () => { au.tone(900, .22, 'square', .05, 300); au.tone(1350, .18, 'triangle', .04, 500, .02); au.noise(.12, .12, 2500, 0, 'highpass'); },
        flip: () => { au.tone(500, .08, 'sine', .05, 800); },
        win: () => { au.tone(520, .12, 'triangle', .06); au.tone(780, .16, 'triangle', .06, 0, .1); },
        lose: () => { au.tone(300, .3, 'sawtooth', .05, 110); au.noise(.2, .08, 600); },
        boom: () => { au.noise(.9, .3, 600); au.tone(120, .6, 'sine', .15, 40); },
        fanfare: () => { [523, 659, 784, 1046].forEach((f, i) => au.tone(f, .3, 'triangle', .07, 0, i * .13)); },
        defeat: () => { [392, 330, 262, 196].forEach((f, i) => au.tone(f, .35, 'sawtooth', .05, 0, i * .17)); },
        tick: () => au.tone(1100, .03, 'square', .02),
        place: () => au.tone(260, .05, 'triangle', .07, 180)
      };

      function ownCount(r) { let n = 0; for (const x of S.cells) if (x === r) n++; return n; }
      function placed() { let n = 0; for (const x of S.cells) if (x >= 0) n++; return n; }
      function setSetup(arr) { S.cells = arr.slice(); S.hand = null; S.drag = null; }

      function fromView(V) { return V.cells.map(c => c && { id: c.id, o: c.o, r: c.r, rev: c.rev, mv: c.mv }); }

      function clearBoardState() { D.q.length = 0; D.cur = null; D.sel = -1; D.targets = []; D.fx.length = 0; D.final = null; D.banner = null; D.overlay = 0; }

      function viewGame() { return M.V ? { cells: M.V.cells, rep: M.V.rep } : null; }
      const busy = () => !!D.cur || D.q.length > 0;
      
      function myMoves() {
        const g = viewGame();
        return g ? stMoves(g, M.me) : [];
      }
      function select(i) {
        D.sel = i; D.targets = [];
        if (i < 0) return;
        D.targets = myMoves().filter(m => m[0] === i).map(m => m[1]);
        if (!D.targets.length) { D.sel = -1; return false; }
        sfx.tick();
        return true;
      }

      function logAdd(s) { M.log.unshift(s); if (M.log.length > 40) M.log.pop(); }
      function describe(ev) {
        const mine = o => o === M.me;
        const nm = o => mine(o) ? 'Your' : 'Enemy';
        if (ev.k === 'm') return ev.far ? `${nm(ev.o)} Scout slides ${Math.max(Math.abs(((ev.from / 10) | 0) - ((ev.to / 10) | 0)), Math.abs(ev.from % 10 - ev.to % 10))} squares.` : null;
        const A = ST_NAMES[ev.a.r], Dn = ST_NAMES[ev.d.r];
        const res = ev.res === 'w' ? (ev.d.r === 0 ? 'captures the Flag!' : ev.d.r === 11 ? 'defuses the Bomb' : `wins`) : ev.res === 'l' ? (ev.d.r === 11 ? 'is blown up' : 'loses') : 'both are removed';
        return `${nm(ev.a.o)} ${A} attacks ${nm(ev.d.o).toLowerCase()} ${Dn}: ${res}`;
      }

      function pushEvents(evs, V) {
        evs.forEach(ev => D.q.push(ev));
        D.final = V; M.V = V;
        D.sel = -1; D.targets = [];
        renderSide();
      }

      function applyEv(ev) {
        if (ev.k === 'm') {
          const p = D.cells[ev.from];
          if (p) { if (ev.r >= 0) { p.r = ev.r; p.rev = true; } p.mv = true; D.cells[ev.to] = p; D.cells[ev.from] = null; }
        } else {
          const p = D.cells[ev.from], q = D.cells[ev.to];
          if (p) { p.r = ev.a.r; p.rev = true; p.mv = true; }
          if (q) { q.r = ev.d.r; q.rev = true; }
          D.cells[ev.from] = null;
          if (ev.res === 'w') D.cells[ev.to] = p; else if (ev.res === 't') D.cells[ev.to] = null;
        }
      }

      function burst(x, y, n, cols, sp = 220, life = 800, size = 5) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU, v = sp * (.3 + Math.random());
          D.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, t0: now(), life: life * (.6 + Math.random() * .6), col: pick(cols), size: size * (.5 + Math.random()), g: 380, spin: Math.random() * 6 });
        }
      }

      function startNext(t) {
        const ev = D.q.shift();
        if (ev.k === 'm') {
          const dist = Math.max(Math.abs(((ev.from / 10) | 0) - ((ev.to / 10) | 0)), Math.abs(ev.from % 10 - ev.to % 10));
          D.cur = { ev, t0: t, dur: Math.min(560, 200 + 55 * dist) * spd(), kind: 'm', piece: D.cells[ev.from] };
          D.cells[ev.from] = null;
          if (dist > 1) sfx.slide(); else sfx.step();
        } else {
          const a = D.cells[ev.from], d = D.cells[ev.to];
          D.cells[ev.from] = null;
          D.cur = { ev, t0: t, dur: 2600 * spd(), kind: 'b', a, d, sp: spd(), stage: 0, shaken: false };
        }
      }

      function finishCur() {
        const c = D.cur; D.cur = null;
        const ev = c.ev;
        if (c.kind === 'm') { c.piece.mv = true; if (ev.r >= 0) { c.piece.r = ev.r; c.piece.rev = true; } D.cells[ev.to] = c.piece; }
        else {
          const p = c.a, q = c.d;
          p.r = ev.a.r; p.rev = true; p.mv = true; q.r = ev.d.r; q.rev = true;
          if (ev.res === 'w') D.cells[ev.to] = p; else if (ev.res === 'l') D.cells[ev.to] = q; else D.cells[ev.to] = null;
          D.overlay = 0;
        }
        const d = describe(ev); if (d) logAdd(d);
        renderSide();
      }

      function afterIdle() {
        if (!D.final) return;
        D.cells = fromView(D.final);
        const V = D.final; D.final = null;
        renderSide();
        if (V.over) endGame(V);
      }

      function endGame(V) {
        if (M.phase === 'over') return;
        M.phase = 'over';
        const win = V.winner === M.me, draw = V.draw;
        D.banner = { t0: now(), text: draw ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT', win, draw };
        if (draw) { sfx.win(); } else if (win) { sfx.fanfare(); } else sfx.defeat();
        let lostMine = 0, caps = 0;
        V.lost[M.me].forEach(n => lostMine += n); V.lost[M.me ^ 1].forEach(n => caps += n);
        let pts = 0;
        if (win && M.mode === 'cpu') {
          pts = Math.round(((40 - lostMine) * 10 + Math.max(0, 400 - V.moves)) * ({ easy: .5, normal: 1, hard: 1.5 }[opt.diff]));
          if (!M.scored) { M.scored = true; api.submit(pts); }
        }
        api.score(caps);
        const why = V.reason === 'flag' ? (win ? 'You captured the enemy flag.' : 'Your flag was captured.') : V.reason === 'stuck' ? (win ? 'The enemy has no pieces that can move.' : 'You have no pieces that can move.') : V.reason === 'resign' ? (win ? 'Your opponent resigned.' : 'You resigned.') : V.reason === 'left' ? 'Your opponent left the game.' : 'Neither side can move.';
        api.timeout(() => {
          if (M.phase !== 'over') return;
          const online = M.mode === 'online';
          showPane(`<div class="bx-box"><p class="bx-kick">${draw ? 'Draw' : win ? 'Victory' : 'Defeat'}</p><h3>${draw ? 'Stalemate' : win ? 'You win!' : 'You lose'}</h3><p>${why}</p>
<p>Moves ${V.moves} · captured ${caps} · lost ${lostMine}${pts ? ` · <b>${pts} pts</b>` : ''}</p>
${online ? `<button class="bx-btn" data-a="${M.left ? 'cpu' : 'rematch'}">${M.left ? 'Play vs computer' : M.rematch[M.me] ? 'Waiting for opponent…' : 'Rematch'}</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button>` : `<button class="bx-btn" data-a="again">Play again</button><button class="bx-btn alt" data-a="menu">Menu</button>`}
<button class="bx-btn alt sm" data-a="look">Look at the board</button></div>`, a => {
            if (a === 'again') { hidePane(); beginSetup(); }
            else if (a === 'menu') showMenu();
            else if (a === 'look') { hidePane(); lookBar(); }
            else if (a === 'rematch') rematch();
            else if (a === 'cpu') { leaveOnline(); M.mode = 'cpu'; beginSetup(); }
            else if (a === 'lobby') toLobby();
          }, V.winner === M.me ? '' : '');
        }, 1600);
      }

      function lookBar() {
        showPane(`<div class="bx-row" style="position:absolute;left:0;right:0;bottom:8px;justify-content:center"><button class="bx-btn sm" data-a="back">Results</button></div>`, a => { if (a === 'back') { hidePane(); endGameRepane(); } }, 'clear');
      }
      function endGameRepane() { const V = M.V; M.phase = 'play'; endGame(V); }

      function doMove(p, m) {
        const g = M.g;
        if (!g || g.over || g.turn !== p || !stMoves(g, p).some(x => x[0] === m[0] && x[1] === m[1])) return false;
        const evs = stApply(g, m);
        if (g.over) g.reason = g.reason || '';
        pushEvents(evs, stView(g, M.me));
        if (M.mode === 'online' && M.role === 'host') api.net.send({ t: 'ev', evs, v: stView(g, 1) });
        return true;
      }

      function humanMove(m) {
        if (M.mode === 'online' && M.role === 'guest') {
          api.net.send({ t: 'mv', m });
          D.sel = -1; D.targets = []; M.pending = true;
          return;
        }
        doMove(M.me, m);
      }

      function maybeAI() {
        if (M.mode !== 'cpu' || M.phase !== 'play' || !M.g || M.g.over || M.g.turn !== 1 || busy() || M.aiPending) return;
        M.aiPending = true; const tok = M.tok;
        api.timeout(() => {
          M.aiPending = false;
          if (tok !== M.tok || M.phase !== 'play' || !M.g || M.g.over || M.g.turn !== 1) return;
          if (busy()) return;
          const m = stAI(stView(M.g, 1), 1, opt.diff, M.mem);
          if (m) doMove(1, m);
        }, (450 + rnd(500)) * spd());
      }

      function newSession() {
        M.tok++; M.g = null; M.V = null; M.mem = {}; M.log = []; M.aiPending = false; M.scored = false; M.left = false; M.pending = false;
        M.ready = [false, false]; M.rematch = [false, false];
        clearBoardState(); D.cells = Array(100).fill(null);
      }

      function beginSetup() {
        newSession();
        M.phase = 'setup'; M.mode = M.mode === 'online' ? 'online' : 'cpu';
        if (M.mode !== 'online') { M.role = 'local'; M.me = 0; M.names = ['You', 'CPU']; }
        setSetup(opt.mine || stGen('balanced'));
        api.score(0);
        hidePane(); renderSide();
      }

      function startBattle() {
        if (placed() !== 40) return;
        opt.mine = S.cells.slice(); save();
        if (M.mode === 'cpu') {
          const ai = stGen(pick(['balanced', 'balanced', 'defensive', 'aggressive', 'bluffer']));
          const mine = S.cells.slice();
          M.g = stNew(mine, ai); M.me = 0;
          M.V = stView(M.g, 0); D.cells = fromView(M.V);
          M.phase = 'play'; M.log = []; logAdd('Battle begins. Red moves first.');
          D.banner = { t0: now(), text: 'BATTLE', win: true, small: true };
          sfx.fanfare(); renderSide();
          return;
        }
        M.ready[M.me] = true;
        if (M.role === 'guest') api.net.send({ t: 'setup', s: S.cells.slice() });
        else { M.hostSetup = S.cells.slice(); tryStartOnline(); }
        renderSide();
      }

      function tryStartOnline() {
        if (M.role !== 'host' || !M.hostSetup || !M.guestSetup) return;
        M.g = stNew(M.hostSetup, M.guestSetup); M.me = 0;
        M.V = stView(M.g, 0); D.cells = fromView(M.V);
        M.phase = 'play'; M.log = []; logAdd('Battle begins. Red moves first.');
        D.banner = { t0: now(), text: 'BATTLE', win: true, small: true };
        sfx.fanfare(); hidePane();
        api.net.send({ t: 'go', v: stView(M.g, 1) });
        renderSide();
      }

      function menuHtml() {
        const imgs = [[0, 10], [1, -1], [0, 11], [1, 9], [0, 0]].map(([o, r]) => `<img src="${stChipUrl(o, r)}" alt="">`).join('');
        return `<div class="bx-box"><div class="st-logo">${imgs}</div><p class="bx-kick">Strategy</p><h3>Stratego</h3><p>Hide your army, bluff, and capture the enemy flag.</p>
<div class="bx-lbl">Computer level</div><div class="bx-seg" data-seg="diff">${['easy', 'normal', 'hard'].map(d => `<button data-a="d:${d}" class="${opt.diff === d ? 'on' : ''}">${d[0].toUpperCase() + d.slice(1)}</button>`).join('')}</div>
<button class="bx-btn" data-a="cpu">Play vs computer<small>You are Red and move first</small></button>
<button class="bx-btn" data-a="online">Play online<small>1 vs 1 with a friend</small></button>
<div class="bx-row"><button class="bx-btn alt sm" data-a="help">How to play</button><button class="bx-btn alt sm" data-a="fast">Battle speed: ${opt.fast ? 'Fast' : 'Normal'}</button></div></div>`;
      }
      function showMenu() {
        M.tok++; M.phase = 'menu';
        if (M.mode === 'online') leaveOnline(true);
        clearBoardState(); D.cells = Array(100).fill(null); M.V = null; M.g = null;
        renderSide();
        showPane(menuHtml(), menuAct);
      }
      function menuAct(a) {
        if (a.startsWith('d:')) { opt.diff = a.slice(2); save(); showPane(menuHtml(), menuAct); }
        else if (a === 'cpu') { M.mode = 'cpu'; opt.mode = 'cpu'; save(); beginSetup(); }
        else if (a === 'online') startOnline();
        else if (a === 'fast') { opt.fast = !opt.fast; save(); showPane(menuHtml(), menuAct); }
        else if (a === 'help') showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Stratego</h3>${ST_HELP}${rankTable()}<button class="bx-btn" data-a="back">Back</button></div>`, () => showPane(menuHtml(), menuAct));
      }
      function rankTable() {
        const rows = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 11, 0].map(r => `<img src="${stChipUrl(0, r)}" alt=""><span><b>${ST_NAMES[r]}</b> ${r === 1 ? 'beats the Marshal when it attacks' : r === 2 ? 'moves any distance' : r === 3 ? 'defuses bombs' : r === 11 ? 'immovable, destroys attackers' : r === 0 ? 'capture it to win' : ''}</span><em>x${ST_COUNT[r]}</em>`).join('');
        return `<div class="bx-lbl">The army (${40} pieces)</div><div class="st-rk" style="margin-bottom:8px">${rows}</div>`;
      }

      function statusText() {
        if (M.phase === 'setup') {
          if (M.mode === 'online' && M.ready[M.me]) return ['Ready', 'Waiting for your opponent to finish deploying.'];
          return ['Deploy your army', `${placed()} / 40 placed. Drag pieces into the highlighted rows.`];
        }
        if (M.phase === 'play' || M.phase === 'over') {
          if (M.phase === 'over' || (M.V && M.V.over)) return ['Game over', ''];
          const mine = M.V && M.V.turn === M.me;
          if (busy()) return [mine ? 'Resolving…' : 'Resolving…', ''];
          return mine ? ['Your move', 'Pick a piece, then a highlighted square.'] : [M.mode === 'cpu' ? 'CPU is thinking…' : `${esc(M.names[M.me ^ 1])} is thinking…`, ''];
        }
        return ['', ''];
      }

      function capsHtml(lostArr, o) {
        const out = [];
        for (let r = 10; r >= 0; r--) if (r < 12 && lostArr[r]) out.push(`<div class="st-cap"><img src="${stChipUrl(o, r)}" alt="${ST_NAMES[r]}"><b>${lostArr[r]}</b></div>`);
        if (lostArr[11]) out.push(`<div class="st-cap"><img src="${stChipUrl(o, 11)}" alt="Bomb"><b>${lostArr[11]}</b></div>`);
        return out.join('') || '<span style="font:600 12px var(--sans);color:#9aa0bb">None yet</span>';
      }

      function renderSide() {
        const [h, sub] = statusText();
        const turnCls = M.phase === 'play' && M.V ? (M.V.turn === 0 ? '' : 'b') : (M.me === 0 ? '' : 'b');
        let html = '';
        if (M.phase === 'menu') { side.innerHTML = ''; return; }
        html += `<div class="st-card"><div class="st-stat"><i class="${turnCls}"></i><div>${h}<small>${sub}</small></div></div></div>`;
        if (M.phase === 'setup') {
          const rem = r => ST_COUNT[r] - ownCount(r);
          const chips = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 11, 0].map(r => `<button class="st-chip ${rem(r) <= 0 ? 'zero' : ''} ${S.hand && S.hand.r === r && S.hand.from < 0 ? 'on' : ''}" data-r="${r}" title="${ST_NAMES[r]} (${rem(r)} left)"><img src="${stChipUrl(M.me, r)}" alt="${ST_NAMES[r]}"><b>${rem(r)}</b></button>`).join('');
          const locked = M.mode === 'online' && M.ready[M.me];
          html += `<div class="st-card"><div class="st-h">Your pieces</div><div class="st-tray">${chips}</div></div>
<div class="st-card"><div class="st-h">Setups</div><div class="st-row">${['balanced', 'defensive', 'aggressive', 'bluffer'].map(s => `<button class="st-b" data-s="${s}" ${locked ? 'disabled' : ''}>${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}<button class="st-b" data-s="random" ${locked ? 'disabled' : ''}>Random</button>${opt.mine ? `<button class="st-b" data-s="mine" ${locked ? 'disabled' : ''}>My last</button>` : ''}<button class="st-b" data-s="clear" ${locked ? 'disabled' : ''}>Clear</button></div></div>
<div class="st-card"><div class="st-row"><button class="st-b p" data-s="go" ${placed() === 40 && !locked ? '' : 'disabled'}>${locked ? 'Waiting…' : 'Start the battle'}</button><button class="st-b" data-s="menu">Leave</button></div></div>`;
        } else if (M.V) {
          const V = M.V, en = M.me ^ 1;
          html += `<div class="st-card"><div class="st-h">You captured</div><div class="st-caps">${capsHtml(V.lost[en], en)}</div><div class="st-h" style="margin-top:8px">You lost</div><div class="st-caps">${capsHtml(V.lost[M.me], M.me)}</div></div>
<div class="st-card"><div class="st-h">Log</div><div class="st-log">${M.log.map(l => `<div>${esc(l)}</div>`).join('')}</div></div>
<div class="st-card"><div class="st-row"><button class="st-b" data-s="speed">${opt.fast ? 'Fast battles' : 'Normal battles'}</button><button class="st-b" data-s="help">Rules</button><button class="st-b" data-s="resign" ${M.phase === 'over' ? 'disabled' : ''}>Resign</button></div></div>`;
        }
        side.innerHTML = html;
      }

      api.on(side, 'click', e => {
        au.unlock();
        const chip = e.target.closest('.st-chip');
        if (chip && M.phase === 'setup') return;
        const b = e.target.closest('[data-s]');
        if (!b) return;
        const s = b.dataset.s;
        if (M.phase === 'setup') {
          if (['balanced', 'defensive', 'aggressive', 'bluffer'].includes(s)) { setSetup(stGen(s)); sfx.place(); }
          else if (s === 'random') { setSetup(stGen(pick(['balanced', 'defensive', 'aggressive', 'bluffer']))); sfx.place(); }
          else if (s === 'mine' && opt.mine) { setSetup(opt.mine); sfx.place(); }
          else if (s === 'clear') { setSetup(Array(40).fill(-1)); }
          else if (s === 'go') startBattle();
          else if (s === 'menu') { if (M.mode === 'online') leaveOnline(false); showMenu(); }
          renderSide();
        } else {
          if (s === 'speed') { opt.fast = !opt.fast; save(); renderSide(); }
          else if (s === 'help') { const prev = pane.innerHTML, cb = paneCb, cls = pane.className; showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Stratego</h3>${ST_HELP}<button class="bx-btn" data-a="back">Back</button></div>`, () => { if (prev && cls.indexOf('clear') < 0 && M.phase === 'over') { pane.className = cls; pane.innerHTML = prev; pane.hidden = false; paneCb = cb; } else hidePane(); }); }
          else if (s === 'resign') {
            showPane(`<div class="bx-box"><h3>Resign?</h3><p>You will lose this game.</p><button class="bx-btn" data-a="yes">Resign</button><button class="bx-btn alt" data-a="no">Keep playing</button></div>`, a => { hidePane(); if (a === 'yes') resign(); });
          }
        }
      });

      function resign() {
        if (M.phase !== 'play') return;
        if (M.mode === 'online' && M.role === 'guest') { api.net.send({ t: 'resign' }); return; }
        const g = M.g; if (!g || g.over) return;
        g.over = true; g.winner = M.me ^ 1; g.reason = 'resign';
        pushEvents([], stView(g, M.me));
        if (M.mode === 'online') api.net.send({ t: 'ev', evs: [], v: stView(g, 1) });
      }

      function startDragFromChip(e, r) {
        if (M.phase !== 'setup' || (M.mode === 'online' && M.ready[M.me])) return;
        if (ST_COUNT[r] - ownCount(r) <= 0) return;
        const p = toLocal(e);
        S.drag = { r, from: -1, x: p.x, y: p.y, moved: false, sx: e.clientX, sy: e.clientY };
        window.addEventListener('pointermove', dragMove); window.addEventListener('pointerup', dragUp, { once: true });
        e.preventDefault();
      }
      api.on(side, 'pointerdown', e => {
        const chip = e.target.closest('.st-chip');
        if (!chip || M.phase !== 'setup') return;
        au.unlock();
        startDragFromChip(e, +chip.dataset.r);
      });
      function dragMove(e) {
        if (!S.drag) return;
        const p = toLocal(e);
        S.drag.x = p.x; S.drag.y = p.y;
        if (Math.abs(e.clientX - S.drag.sx) + Math.abs(e.clientY - S.drag.sy) > 6) S.drag.moved = true;
      }
      function zoneIdx(x, y) {
        const s = sAt(x, y);
        if (s < 0) return -1;
        const r = (s / 10) | 0;
        return r >= 6 ? (r - 6) * 10 + s % 10 : -1;
      }
      function dragUp(e) {
        window.removeEventListener('pointermove', dragMove);
        const d = S.drag; S.drag = null;
        if (!d) return;
        const p = toLocal(e), k = zoneIdx(p.x, p.y);
        if (!d.moved) {
          if (d.from < 0) { S.hand = S.hand && S.hand.r === d.r && S.hand.from < 0 ? null : { r: d.r, from: -1 }; }
          else { S.hand = S.hand && S.hand.from === d.from ? null : { r: d.r, from: d.from }; }
          renderSide(); return;
        }
        S.hand = null;
        dropPiece(d, k);
        renderSide();
      }
      function dropPiece(d, k) {
        if (k < 0) { if (d.from >= 0) { S.cells[d.from] = -1; sfx.tick(); } return; }
        if (d.from >= 0) { const t = S.cells[k]; S.cells[k] = d.r; S.cells[d.from] = t; }
        else S.cells[k] = d.r;
        sfx.place();
      }

      function setupClick(x, y, e) {
        const k = zoneIdx(x, y);
        if (S.hand) {
          const h = S.hand; S.hand = null;
          if (k < 0) { if (h.from >= 0) S.cells[h.from] = -1; }
          else if (h.from === k) { }
          else if (h.from >= 0) { const t = S.cells[k]; S.cells[k] = h.r; S.cells[h.from] = t; sfx.place(); }
          else { S.cells[k] = h.r; sfx.place(); }
          renderSide(); return true;
        }
        return false;
      }

      api.on(canvas, 'pointerdown', e => {
        au.unlock();
        const p = toLocal(e);
        if (M.phase === 'setup') {
          if (M.mode === 'online' && M.ready[M.me]) return;
          if (setupClick(p.x, p.y, e)) return;
          const k = zoneIdx(p.x, p.y);
          if (k >= 0 && S.cells[k] >= 0) {
            S.drag = { r: S.cells[k], from: k, x: p.x, y: p.y, moved: false, sx: e.clientX, sy: e.clientY };
            window.addEventListener('pointermove', dragMove); window.addEventListener('pointerup', dragUp, { once: true });
          }
          return;
        }
        if (M.phase !== 'play' || busy() || !M.V || M.V.over || M.V.turn !== M.me || !pane.hidden) return;
        if (D.banner && !D.banner.small) return;
        const i = wAt(p.x, p.y);
        if (i < 0) { select(-1); return; }
        if (D.sel >= 0 && D.targets.includes(i)) { humanMove([D.sel, i]); return; }
        const c = M.V.cells[i];
        if (c && c.o === M.me) {
          if (D.sel === i) { select(-1); return; }
          if (select(i) !== false && D.sel === i) {
            D.drag = { from: i, x: p.x, y: p.y, moved: false, sx: e.clientX, sy: e.clientY };
            const mv = ev => { if (!D.drag) return; const q = toLocal(ev); D.drag.x = q.x; D.drag.y = q.y; if (Math.abs(ev.clientX - D.drag.sx) + Math.abs(ev.clientY - D.drag.sy) > 8) D.drag.moved = true; };
            const up = ev => {
              window.removeEventListener('pointermove', mv);
              const d = D.drag; D.drag = null;
              if (d && d.moved) { const q = toLocal(ev), j = wAt(q.x, q.y); if (D.targets.includes(j)) humanMove([d.from, j]); }
            };
            window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up, { once: true });
          }
        } else select(-1);
      });
      api.on(canvas, 'pointermove', e => {
        const p = toLocal(e);
        S.hover = M.phase === 'setup' ? zoneIdx(p.x, p.y) : -1;
        D.hover = wAt(p.x, p.y);
        if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; }
      });
      api.on(canvas, 'pointerleave', () => { S.hover = -1; D.hover = -1; });

      api.on(window, 'keydown', e => {
        if (!root.isConnected || !pane.hidden) return;
        const k = e.key;
        if (M.phase === 'setup') {
          if (M.mode === 'online' && M.ready[M.me]) return;
          const mv = { ArrowUp: -10, ArrowDown: 10, ArrowLeft: -1, ArrowRight: 1 }[k];
          if (mv) { let c = S.cursor + mv; if (c >= 0 && c < 100 && (c / 10 | 0) >= 6) S.cursor = c; e.preventDefault(); return; }
          const kz = S.cursor - 60;
          const m = { S: 1, s: 1, B: 11, b: 11, F: 0, f: 0, X: 10, x: 10, 0: 10 }[k] ?? (/^[2-9]$/.test(k) ? +k : undefined);
          if (m !== undefined && kz >= 0 && kz < 40) {
            const old = S.cells[kz];
            if (old !== m && ST_COUNT[m] - ownCount(m) > 0) { S.cells[kz] = m; sfx.place(); renderSide(); }
            e.preventDefault();
          } else if ((k === 'Delete' || k === 'Backspace') && kz >= 0) { S.cells[kz] = -1; renderSide(); e.preventDefault(); }
          else if (k === 'r' || k === 'R') { setSetup(stGen(pick(['balanced', 'defensive', 'aggressive', 'bluffer']))); renderSide(); }
          else if (k === 'Enter' && placed() === 40) startBattle();
          return;
        }
        if (M.phase === 'play' && M.V && !busy() && M.V.turn === M.me) {
          const mv = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -1, ArrowRight: 1 };
          if (k in mv) {
            if (D.cursor < 0) D.cursor = 65;
            let r = (D.cursor / 10) | 0, c = D.cursor % 10;
            if (k === 'ArrowUp') r--; else if (k === 'ArrowDown') r++; else if (k === 'ArrowLeft') c--; else c++;
            r = clamp(r, 0, 9); c = clamp(c, 0, 9);
            D.cursor = r * 10 + c; e.preventDefault();
          } else if (k === 'Enter' || k === ' ') {
            const i = D.cursor;
            if (i < 0) return;
            if (D.sel >= 0 && D.targets.includes(i)) humanMove([D.sel, i]);
            else if (M.V.cells[i] && M.V.cells[i].o === M.me) select(i); else select(-1);
            e.preventDefault();
          } else if (k === 'Escape') select(-1);
        }
      });

      function drawPiece(o, r, x, y, scale = 1, alpha = 1, sx = 1) {
        const sp = stSprite(o, r, 128), s = CELL * scale;
        ctx.save();
        if (alpha !== 1) ctx.globalAlpha = alpha;
        ctx.translate(x + CELL / 2, y + CELL / 2);
        ctx.scale(sx, 1);
        ctx.drawImage(sp, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
      function drawBig(o, r, cx, cy, size, sx = 1, alpha = 1, rot = 0) {
        const sp = stSprite(o, r, 128);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sx, 1);
        ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
        ctx.drawImage(sp, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      const cx = i => scr(i)[0] + CELL / 2, cy = i => scr(i)[1] + CELL / 2;

      function drawBattle(c, t) {
        const ev = c.ev, el = (t - c.t0) / c.sp;
        const a = c.a, d = c.d;
        const [fx, fy] = scr(ev.from), [tx, ty] = scr(ev.to);
        const slideEnd = 320;
        if (el < slideEnd) {
          const k = easeIO(el / slideEnd) * (ev.far ? .85 : .78);
          drawPiece(a.o, a.r, lerp(fx, tx, k), lerp(fy, ty, k), 1.05);
          D.cells[ev.to] = d; return;
        }
        D.cells[ev.to] = null;
        const e2 = el - slideEnd;
        const oa = clamp(e2 / 260, 0, 1) * (el > 2150 ? clamp(1 - (el - 2150) / 330, 0, 1) : 1);
        D.overlay = oa;
        ctx.save(); ctx.globalAlpha = oa * .72; ctx.fillStyle = '#0b0f1c'; ctx.fillRect(0, 0, W, W); ctx.restore();
        const size = 170, mid = W / 2;
        const ax0 = -size, dx0 = W + size;
        const inT = ease(clamp(e2 / 380, 0, 1));
        let ax = lerp(ax0, mid - 118, inT), dxp = lerp(dx0, mid + 118, inT);
        const clashT = clamp((e2 - 560) / 300, 0, 1);
        if (e2 > 560 && e2 < 860) { const bump = Math.sin(clashT * Math.PI); ax += bump * 66; dxp -= bump * 66; }
        if (!c.clashed && e2 > 700) { c.clashed = true; sfx.clash(); burst(mid, W / 2, 26, ['#ffe27a', '#fff', '#ffb347'], 330, 700, 4); D.shake = now(); }
        const flipA = a.rev0 === undefined ? (a.rev0 = !!(a.r >= 0 && a.rev)) : a.rev0;
        const flipD = d.rev0 === undefined ? (d.rev0 = !!(d.r >= 0 && d.rev)) : d.rev0;
        const known = (x, f) => f;
        const ta = clamp((e2 - 900) / 260, 0, 1), td = clamp((e2 - 1150) / 260, 0, 1);
        const showA = known(a, flipA) || ta >= .5, showD = known(d, flipD) || td >= .5;
        const sxA = flipA ? 1 : Math.abs(Math.cos(ta * Math.PI)), sxD = flipD ? 1 : Math.abs(Math.cos(td * Math.PI));
        if (!c.fa && !flipA && ta > 0) { c.fa = 1; sfx.flip(); }
        if (!c.fd && !flipD && td > 0) { c.fd = 1; sfx.flip(); }
        const ra = showA ? ev.a.r : -1, rd = showD ? ev.d.r : -1;
        const resT = e2 - 1500;
        let aAlpha = 1, dAlpha = 1, aRot = 0, dRot = 0, aDy = 0, dDy = 0;
        if (resT > 0 && !c.resolved) {
          c.resolved = true;
          const loseA = ev.res === 'l' || ev.res === 't', loseD = ev.res === 'w' || ev.res === 't';
          if (ev.d.r === 11 && ev.res === 'l') { sfx.boom(); burst(ax + size, W / 2, 50, ['#ff7a1a', '#ffd23f', '#ff4a1c', '#444'], 420, 1100, 8); D.shake = now(); }
          else if (ev.d.r === 11 && ev.res === 'w') { sfx.win(); burst(dxp, W / 2, 24, ['#9fe', '#fff', '#8cf'], 200, 900, 4); }
          else if (ev.d.r === 0) { sfx.fanfare(); burst(dxp, W / 2, 60, ['#ffe27a', '#ff5a4a', '#5aa0ff', '#7dff9a'], 420, 1400, 6); }
          else {
            if (loseA) burst(ax, W / 2, 20, [ST_TEAM[ev.a.o].mid, ST_TEAM[ev.a.o].top, '#ddd'], 300, 900, 8);
            if (loseD) burst(dxp, W / 2, 20, [ST_TEAM[ev.d.o].mid, ST_TEAM[ev.d.o].top, '#ddd'], 300, 900, 8);
            if (loseA || loseD) { (ev.a.o === M.me ? (loseA ? sfx.lose : sfx.win) : (loseD ? sfx.lose : sfx.win))(); }
          }
          c.out = { loseA: ev.res === 'l' || ev.res === 't', loseD: ev.res === 'w' || ev.res === 't' };
        }
        if (c.out && resT > 0) {
          const k = clamp(resT / 380, 0, 1);
          if (c.out.loseA) { aAlpha = 1 - k; aRot = -k * .6; aDy = k * 40; }
          if (c.out.loseD) { dAlpha = 1 - k; dRot = k * .6; dDy = k * 40; }
          if (!c.out.loseA) aDy = -Math.sin(k * Math.PI) * 14;
          if (!c.out.loseD) dDy = -Math.sin(k * Math.PI) * 14;
        }
        const lbl = ST_NAMES[ev.a.r] + ' (' + (ST_LBL[ev.a.r] || ST_NAMES[ev.a.r][0]) + ')';
        const mineA = ev.a.o === M.me;
        ctx.save();
        ctx.font = '900 16px "Trebuchet MS",Arial,sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#fff'; ctx.globalAlpha = oa;
        ctx.fillText(mineA ? 'YOUR ATTACK' : 'ENEMY ATTACK', ax, W / 2 - size / 2 - 22);
        ctx.fillText(mineA ? 'DEFENDER' : 'YOUR DEFENDER', dxp, W / 2 - size / 2 - 22);
        ctx.restore();
        if (aAlpha > .01) drawBig(ev.a.o, ra, ax, W / 2 + aDy, size, sxA, aAlpha * oa, aRot);
        if (dAlpha > .01) drawBig(ev.d.o, rd, dxp, W / 2 + dDy, size, sxD, dAlpha * oa, dRot);
        if (e2 > 1200 && e2 < 1500 + 700 && ra >= 0 && rd >= 0 || (resT > -300 && resT < 900 && ra >= 0 && rd >= 0)) {
          const txt = resultText(ev), tt = clamp((e2 - 1300) / 260, 0, 1);
          ctx.save(); ctx.globalAlpha = oa * tt; ctx.textAlign = 'center';
          ctx.font = '900 30px "Trebuchet MS",Arial,sans-serif'; ctx.lineWidth = 7; ctx.strokeStyle = '#111'; ctx.strokeText(txt, mid, W / 2 + size / 2 + 56); ctx.fillStyle = '#ffe27a'; ctx.fillText(txt, mid, W / 2 + size / 2 + 56);
          ctx.restore();
        }
        if (el > 2330) {
          if (ev.res === 'w') { const k = easeIO((el - 2330) / 220); const [px, py] = [lerp(lerp(fx, tx, .8), tx, k), lerp(lerp(fy, ty, .8), ty, k)]; drawPiece(a.o, a.r, px, py, 1.05); }
        }
      }

      function resultText(ev) {
        const A = ST_NAMES[ev.a.r], Dn = ST_NAMES[ev.d.r];
        if (ev.d.r === 0) return 'FLAG CAPTURED!';
        if (ev.d.r === 11) return ev.res === 'w' ? 'Bomb defused!' : 'BOOM! ' + A + ' destroyed';
        if (ev.a.r === 1 && ev.d.r === 10 && ev.res === 'w') return 'The Spy assassinates the Marshal!';
        if (ev.res === 't') return A + ' and ' + Dn + ' fall together';
        return ev.res === 'w' ? A + ' defeats ' + Dn : A + ' falls to ' + Dn;
      }

      function frame(t, dt) {
        if (D.cur) {
          const c = D.cur;
          if (c.kind === 'b') {
            if (c.skip && !c.skipped) { c.skipped = true; c.t0 -= Math.max(0, 2330 * c.sp - (t - c.t0)); }
            if ((t - c.t0) / c.sp > 2560) finishCur();
          } else if (t - c.t0 >= c.dur) finishCur();
        }
        if (!D.cur && D.q.length) startNext(t);
        if (!D.cur && !D.q.length && D.final) afterIdle();

        ctx.save();
        if (D.shake && t - D.shake < 380) { const k = 1 - (t - D.shake) / 380; ctx.translate((Math.random() - .5) * 10 * k, (Math.random() - .5) * 10 * k); }
        ctx.drawImage(bgc, 0, 0, W, W);
        const showTurn = M.phase === 'play' && M.V && !M.V.over && M.V.turn === M.me && !busy() && pane.hidden;

        if (M.phase === 'setup') drawSetup(t);
        else if (M.phase === 'play' || M.phase === 'over') {
          if (M.V && M.V.last && M.phase !== 'setup') {
            ctx.fillStyle = 'rgba(255,230,120,.26)';
            M.V.last.forEach(i => { const [x, y] = scr(i); ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2); });
          }
          if (D.sel >= 0) { const [x, y] = scr(D.sel); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); }
          const pulse = .5 + .5 * Math.sin(t / 220);
          D.targets.forEach(j => {
            const [x, y] = scr(j), en = D.cells[j];
            if (en) { ctx.strokeStyle = `rgba(255,70,50,${.6 + .4 * pulse})`; ctx.lineWidth = 4; ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6); }
            else { ctx.fillStyle = `rgba(40,160,60,${.55 + .25 * pulse})`; ctx.beginPath(); ctx.arc(x + CELL / 2, y + CELL / 2, 9 + pulse * 2, 0, TAU); ctx.fill(); }
          });
          for (let i = 0; i < 100; i++) {
            const c = D.cells[i];
            if (!c) continue;
            if (D.drag && D.drag.moved && D.drag.from === i) continue;
            const [x, y] = scr(i);
            const mine = c.o === M.me;
            const dim = M.phase === 'over' && !(M.V && M.V.over);
            drawPiece(c.o, c.r, x, y, mine && D.sel === i ? 1.06 : 1, dim ? .8 : 1);
            if (!mine && c.mv && c.r < 0) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x + CELL - 9, y + 10, 3, 0, TAU); ctx.fill(); }
            if (showTurn && mine && D.sel < 0 && D.hover === i && myMoves().some(m => m[0] === i)) { ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6); }
          }
          if (D.cur && D.cur.kind === 'm') {
            const c = D.cur, k = easeIO((t - c.t0) / c.dur), [fx, fy] = scr(c.ev.from), [tx, ty] = scr(c.ev.to);
            drawPiece(c.piece.o, c.piece.r, lerp(fx, tx, k), lerp(fy, ty, k) - Math.sin(k * Math.PI) * (c.ev.far ? 3 : 7), 1.06);
          }
          if (D.drag && D.drag.moved && D.cells[D.drag.from]) {
            const c = D.cells[D.drag.from]; drawPiece(c.o, c.r, D.drag.x - CELL / 2, D.drag.y - CELL / 2 - 6, 1.12, .95);
          }
          if (D.cursor >= 0 && showTurn) { const [x, y] = scr(D.cursor); ctx.strokeStyle = '#fff'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3); ctx.setLineDash([]); }
          if (D.cur && D.cur.kind === 'b') drawBattle(D.cur, t);
        }
        for (let i = D.fx.length - 1; i >= 0; i--) {
          const f = D.fx[i], a = (t - f.t0) / f.life;
          if (a >= 1) { D.fx.splice(i, 1); continue; }
          const el = (t - f.t0) / 1000;
          const x = f.x + f.vx * el, y = f.y + f.vy * el + .5 * f.g * el * el;
          ctx.save(); ctx.globalAlpha = 1 - a; ctx.translate(x, y); ctx.rotate(f.spin * el * 4); ctx.fillStyle = f.col;
          ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size * .7);
          ctx.restore();
        }
        if (D.banner) {
          const b = D.banner, e = t - b.t0, life = b.small ? 1400 : 99999;
          if (e > life) D.banner = null;
          else {
            const k = ease(e / 380), a = b.small ? Math.min(1, (life - e) / 400) : 1;
            ctx.save(); ctx.globalAlpha = a;
            if (!b.small) { ctx.fillStyle = 'rgba(8,10,20,.45)'; ctx.fillRect(0, 0, W, W); }
            ctx.translate(W / 2, W / 2); ctx.scale(.6 + .4 * k, .6 + .4 * k);
            ctx.font = `900 ${b.small ? 64 : 92}px "Trebuchet MS",Arial,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.lineWidth = 12; ctx.strokeStyle = '#111'; ctx.strokeText(b.text, 0, 0);
            ctx.fillStyle = b.draw ? '#ddd' : b.win ? '#ffd23f' : '#ff5a4a'; ctx.fillText(b.text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
        if (M.phase === 'play' && M.mode === 'cpu') maybeAI();
      }

      function drawSetup(t) {
        const me = M.me, en = me ^ 1;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
          const x = X0 + c * CELL, y = Y0 + r * CELL;
          drawPiece(en, -1, x, y, 1, M.mode === 'cpu' || M.ready[en] ? .9 : .28);
        }
        ctx.fillStyle = 'rgba(255,230,120,.18)'; ctx.fillRect(X0, Y0 + 6 * CELL, 10 * CELL, 4 * CELL);
        ctx.strokeStyle = 'rgba(255,214,70,.9)'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.strokeRect(X0 + 1.5, Y0 + 6 * CELL + 1.5, 10 * CELL - 3, 4 * CELL - 3); ctx.setLineDash([]);
        for (let k = 0; k < 40; k++) {
          const r = S.cells[k];
          const x = X0 + (k % 10) * CELL, y = Y0 + (6 + ((k / 10) | 0)) * CELL;
          if (r < 0) continue;
          if (S.drag && S.drag.from === k && S.drag.moved) continue;
          drawPiece(me, r, x, y, 1, 1);
          if (S.hand && S.hand.from === k) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); }
        }
        if (S.hover >= 0 && (S.drag && S.drag.moved || S.hand)) {
          const x = X0 + (S.hover % 10) * CELL, y = Y0 + (6 + ((S.hover / 10) | 0)) * CELL;
          ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(x, y, CELL, CELL);
        }
        if (!S.drag) {
          const x = X0 + (S.cursor % 10) * CELL, y = Y0 + ((S.cursor / 10) | 0) * CELL;
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4); ctx.setLineDash([]);
        }
        if (S.drag && S.drag.moved) drawPiece(me, S.drag.r, S.drag.x - CELL / 2, S.drag.y - CELL / 2 - 8, 1.15, .95);
      }
      api.on(canvas, 'click', () => { if (D.cur && D.cur.kind === 'b') D.cur.skip = true; });

      function leaveOnline(silent) {
        HS.clear();
        if (killNet) { killNet(); killNet = null; }
        M.hooked = false;
        try { api.net.close(); } catch (e) {}
        M.mode = 'cpu'; M.role = 'local'; M.me = 0; netEl.hidden = true;
        opt.mode = 'cpu'; save();
      }
      function toLobby() {
        M.tok++;
        if (M.role === 'host') { startOnline(true); } else startOnline(true);
      }
      function rematch() {
        if (M.rematch[M.me]) return;
        M.rematch[M.me] = true;
        if (M.role === 'guest') api.net.send({ t: 'rm' }); else { api.net.send({ t: 'rm' }); checkRematch(); }
        showPane(`<div class="bx-box"><h3>Rematch requested</h3><p>Waiting for ${esc(M.names[M.me ^ 1])}…</p><button class="bx-btn alt" data-a="lobby">Back to lobby</button></div>`, a => { if (a === 'lobby') toLobby(); });
      }
      function checkRematch() {
        if (M.role !== 'host' || !(M.rematch[0] && M.rematch[1])) return;
        beginSetup();
        api.net.send({ t: 'again' });
        M.hostSetup = null; M.guestSetup = null;
      }

      const HS = mkHs(api, 'stratego');
      function saveHost() {
        if (M.mode !== 'online' || M.role !== 'host') return;
        if (M.phase === 'play' && M.g && !M.g.over) HS.save({ g: M.g });
        else if (M.phase === 'over') HS.clear();
      }
      function offerResume(sv, pl) {
        showPane(hsPane('Online', `Saved game: move ${sv.g.moves}.`), a => {
          if (a === 'new') { HS.clear(); hidePane(); return; }
          M.g = sv.g; M.me = 0; M.V = stView(M.g, 0); D.cells = fromView(M.V); D.q.length = 0; D.cur = null; D.final = null;
          M.phase = 'play'; M.log = []; M.rematch = [false, false]; M.hostSetup = null; M.guestSetup = null; M.pending = false;
          hidePane(); logAdd('Game resumed.'); renderSide();
          api.timeout(() => { if (M.mode === 'online' && M.role === 'host' && M.g && pl[1]) api.net.sendTo(pl[1].id, { t: 'snap', phase: 'play', v: stView(M.g, 1), names: M.names, rm: M.rematch }); }, 500);
        });
      }

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        killNet = mkNetHooks(api, {
          data: onData,
          leave: p => {
            if (M.mode !== 'online' || M.role !== 'host' || M.phase === 'menu') return;
            M.left = true;
            if (M.phase === 'play' && M.g && !M.g.over) {
              M.g.over = true; M.g.winner = 0; M.g.reason = 'left';
              pushEvents([], stView(M.g, 0));
            } else if (M.phase === 'setup' || M.phase === 'over') {
              showPane(`<div class="bx-box"><p class="bx-kick">Online</p><h3>Opponent left</h3><p>${esc(M.names[1])} left the game.</p><button class="bx-btn" data-a="cpu">Play vs computer</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button></div>`, a => { if (a === 'cpu') { leaveOnline(); M.mode = 'cpu'; beginSetup(); } else toLobby(); });
            }
          },
          rejoin: p => {
            if (M.mode !== 'online' || M.role !== 'host' || !p) return;
            api.net.sendTo(p.id, { t: 'snap', phase: M.phase, v: M.g ? stView(M.g, 1) : null, s: M.guestSetup || null, hostReady: !!M.hostSetup, names: M.names, rm: M.rematch });
          },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') startOnline(true); },
          close: reason => {
            if (M.mode !== 'online' || M.role !== 'guest') return;
            M.tok++;
            sfx.lose();
            const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            showPane(`<div class="bx-box"><p class="bx-kick">Online</p><h3>${h}</h3><p>The game cannot continue.</p><button class="bx-btn" data-a="room">Online lobby</button><button class="bx-btn alt" data-a="cpu">Play vs computer</button></div>`, a => { if (a === 'room') startOnline(true); else { leaveOnline(); M.mode = 'cpu'; beginSetup(); } });
          }
        });
        api.interval(() => {
          if (M.mode !== 'online') { netEl.hidden = true; return; }
          netEl.hidden = false;
          const on = api.net.connected;
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · host' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }

      async function startOnline(again) {
        M.tok++; const tok = M.tok;
        hookNet();
        M.mode = 'online'; M.role = null; opt.mode = 'online'; save();
        clearBoardState(); M.phase = 'menu'; M.V = null; M.g = null; renderSide();
        hidePane();
        const r = await api.net.room({ title: 'Stratego', sizes: [2], defaultSize: 2, min: 2, max: 2 });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { leaveOnline(); return showMenu(); }
        M.role = r.role;
        const pl = r.players || [];
        M.names = [pl[0] ? pl[0].name : 'Host', pl[1] ? pl[1].name : 'Guest'];
        M.me = r.role === 'host' ? 0 : 1;
        M.hostSetup = null; M.guestSetup = null;
        beginSetup();
        M.mode = 'online'; M.role = r.role; M.me = r.role === 'host' ? 0 : 1; M.names = [pl[0] ? pl[0].name : 'Host', pl[1] ? pl[1].name : 'Guest'];
        renderSide();
        if (r.role === 'host' && pl.length > 1) { const sv = HS.load(); if (sv && sv.g && sv.g.cells) offerResume(sv, pl); }
      }

      function validMove(m) { return Array.isArray(m) && m.length === 2 && m.every(x => Number.isInteger(x) && x >= 0 && x < 100); }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (M.role === 'host') {
          if (d.t === 'setup') {
            if (M.phase !== 'setup' || M.guestSetup || !stSetupOk(d.s)) return;
            M.guestSetup = d.s.slice(); M.ready[1] = true;
            renderSide();
            if (M.hostSetup) tryStartOnline(); else api.net.sendTo(from, { t: 'opp' });
          } else if (d.t === 'mv') {
            if (M.phase !== 'play' || !M.g || !validMove(d.m)) return;
            if (busy()) { api.net.sendTo(from, { t: 'ev', evs: [], v: stView(M.g, 1), sync: 1 }); return; }
            if (!doMove(1, d.m)) api.net.sendTo(from, { t: 'ev', evs: [], v: stView(M.g, 1), sync: 1 });
          } else if (d.t === 'resign') {
            if (M.phase !== 'play' || !M.g || M.g.over) return;
            M.g.over = true; M.g.winner = 0; M.g.reason = 'resign';
            const v = stView(M.g, 1);
            pushEvents([], stView(M.g, 0)); api.net.send({ t: 'ev', evs: [], v });
          } else if (d.t === 'rm') { M.rematch[1] = true; if (M.phase === 'over') { api.toast(M.names[1] + ' wants a rematch'); } checkRematch(); }
        } else {
          if (d.t === 'opp') { M.ready[0] = true; renderSide(); }
          else if (d.t === 'go') {
            M.phase = 'play'; M.log = []; logAdd('Battle begins. Red moves first.');
            M.V = d.v; D.cells = fromView(d.v); D.final = null; D.q.length = 0; D.cur = null;
            D.banner = { t0: now(), text: 'BATTLE', win: true, small: true };
            hidePane(); sfx.fanfare(); renderSide();
          } else if (d.t === 'ev') {
            if (M.phase !== 'play' && !(M.phase === 'over' && false)) { }
            M.pending = false;
            if (d.sync || (!d.evs.length && !d.v.over)) { D.q.length = 0; D.cur = null; D.cells = fromView(d.v); M.V = d.v; renderSide(); return; }
            pushEvents(d.evs, d.v);
          } else if (d.t === 'again') { beginSetup(); M.mode = 'online'; M.role = 'guest'; M.me = 1; renderSide(); }
          else if (d.t === 'rm') { M.rematch[0] = true; if (M.phase === 'over') api.toast(M.names[0] + ' wants a rematch'); }
          else if (d.t === 'snap') {
            M.names = d.names || M.names; M.rematch = d.rm || M.rematch;
            if (d.phase === 'play' || d.phase === 'over') {
              M.phase = d.phase === 'over' ? 'over' : 'play'; M.V = d.v; D.cells = fromView(d.v); D.q.length = 0; D.cur = null; D.final = null;
              hidePane(); renderSide();
              if (d.v.over) { M.phase = 'play'; endGame(d.v); }
            } else if (d.phase === 'setup') {
              M.phase = 'setup'; if (d.s) { setSetup(d.s); M.ready[1] = true; } M.ready[0] = !!d.hostReady; hidePane(); renderSide();
            }
          }
        }
      }

      api.interval(saveHost, 1000);
      window.addEventListener('pagehide', saveHost);
      api.loop((dt, t) => frame(t, dt));
      renderSide();
      if (api.net.invite) startOnline(); else showMenu();
      root._st = { M, S, D, opt, myMoves, busy };
      return { destroy() { window.removeEventListener('pagehide', saveHost); M.tok++; if (killNet) killNet(); window.removeEventListener('pointermove', dragMove); } };
    }
  });

  const GW_SKIN = ['#fde0c8', '#f4c7a0', '#dfa676', '#b97b50', '#8a5636'];
  const GW_SHADE = ['#eeb99a', '#e0a67c', '#c98a58', '#9c6338', '#6f4226'];
  const GW_HAIR = { black: '#201a1d', brown: '#6a3d1e', blonde: '#e9c25a', red: '#c44f1f', white: '#e6e4ea', none: '#000' };
  const GW_HAIR_D = { black: '#0e0b0d', brown: '#4a2910', blonde: '#c49b36', red: '#97360f', white: '#bdbac4', none: '#000' };
  const GW_EYE = { blue: '#3a8fe0', brown: '#6b3a1c', green: '#3fa05a' };
  const GW_HATS = ['#d8423a', '#2f6fb8', '#3c9a5a', '#e0a31f', '#7a4fb5'];

  const GW_CAST = [
    ['Ada', 'f', 'brown', 'long', 'green', 1, '#e0629a', '#cfe8ff', 'er'],
    ['Ben', 'm', 'black', 'short', 'brown', 3, '#3b6ea8', '#ffe9c7', ''],
    ['Cleo', 'f', 'black', 'curly', 'brown', 4, '#e1a423', '#d8f2dd', 'e'],
    ['Dex', 'm', 'red', 'short', 'blue', 0, '#4c9b59', '#ffd9d9', 'gm'],
    ['Eli', 'm', 'none', 'bald', 'blue', 0, '#8a5a9b', '#e6e6ff', 'nk'],
    ['Fay', 'f', 'blonde', 'short', 'blue', 0, '#e9697a', '#e2f6ff', 'r'],
    ['Gus', 'm', 'brown', 'curly', 'brown', 2, '#d08a2c', '#fff2c6', 'b'],
    ['Hana', 'f', 'black', 'long', 'brown', 2, '#c43d4b', '#dff4ec', 'g'],
    ['Ivan', 'm', 'blonde', 'short', 'green', 0, '#2d4a7a', '#ffe0d0', 'bk'],
    ['Jade', 'f', 'red', 'curly', 'green', 1, '#2f8a7a', '#f9e2ff', 'er'],
    ['Kai', 'm', 'black', 'short', 'brown', 3, '#7a7a8c', '#e0f0ff', 'hn'],
    ['Lena', 'f', 'white', 'long', 'blue', 0, '#6b5bd3', '#ffeedd', 'g'],
    ['Milo', 'm', 'brown', 'short', 'blue', 1, '#c25b3b', '#d9f1ff', 'h'],
    ['Nora', 'f', 'blonde', 'long', 'brown', 1, '#3c9a9a', '#fff0d6', 'h'],
    ['Omar', 'm', 'black', 'curly', 'brown', 4, '#2c6b4a', '#fff6d6', 'bm'],
    ['Pia', 'f', 'brown', 'short', 'green', 2, '#d4577b', '#dff0ff', 'r'],
    ['Quin', 'm', 'red', 'long', 'brown', 0, '#7d6b3a', '#e8f6e8', 'm'],
    ['Rosa', 'f', 'black', 'short', 'brown', 3, '#b8442f', '#fdeedd', 'ge'],
    ['Seth', 'm', 'none', 'bald', 'brown', 2, '#35557c', '#ecf0ff', 'bn'],
    ['Tess', 'f', 'red', 'short', 'blue', 0, '#4f7f3f', '#fde5ef', 'rk'],
    ['Uma', 'f', 'white', 'curly', 'green', 1, '#8a4f9a', '#e3f3ff', 'g'],
    ['Vic', 'm', 'white', 'short', 'blue', 0, '#555d6b', '#fff3dc', 'mn'],
    ['Wren', 'm', 'blonde', 'curly', 'blue', 0, '#2e8b9a', '#ffe8e0', 'h'],
    ['Zed', 'm', 'none', 'bald', 'green', 3, '#5a3a7a', '#e8ffe8', 'gk']
  ].map(a => ({ name: a[0], sex: a[1], hair: a[2], style: a[3], eyes: a[4], skin: a[5], shirt: a[6], bg: a[7], g: a[8].includes('g'), h: a[8].includes('h'), b: a[8].includes('b'), m: a[8].includes('m'), n: a[8].includes('n'), e: a[8].includes('e'), r: a[8].includes('r'), k: a[8].includes('k') }));

  const GW_Q = [];
  (() => {
    const add = (id, cat, label, text, test) => GW_Q.push({ id, cat, label, text, test });
    add('sex:f', 'Gender', 'Woman', 'Is your person a woman?', c => c.sex === 'f');
    add('sex:m', 'Gender', 'Man', 'Is your person a man?', c => c.sex === 'm');
    [['black', 'Black'], ['brown', 'Brown'], ['blonde', 'Blonde'], ['red', 'Red'], ['white', 'White']].forEach(([k, n]) => add('hc:' + k, 'Hair colour', n, `Does your person have ${k} hair?`, c => c.hair === k));
    add('hc:none', 'Hair colour', 'Bald', 'Is your person bald?', c => c.hair === 'none');
    [['long', 'Long'], ['short', 'Short'], ['curly', 'Curly']].forEach(([k, n]) => add('hs:' + k, 'Hair style', n, `Does your person have ${k} hair?`, c => c.style === k));
    [['blue', 'Blue'], ['brown', 'Brown'], ['green', 'Green']].forEach(([k, n]) => add('ey:' + k, 'Eyes', n, `Does your person have ${k} eyes?`, c => c.eyes === k));
    add('f:g', 'Accessories', 'Glasses', 'Does your person wear glasses?', c => c.g);
    add('f:h', 'Accessories', 'Hat', 'Does your person wear a hat?', c => c.h);
    add('f:e', 'Accessories', 'Earrings', 'Does your person wear earrings?', c => c.e);
    add('f:b', 'Face', 'Beard', 'Does your person have a beard?', c => c.b);
    add('f:m', 'Face', 'Moustache', 'Does your person have a moustache?', c => c.m);
    add('f:fh', 'Face', 'Facial hair', 'Does your person have facial hair?', c => c.b || c.m);
    add('f:n', 'Face', 'Big nose', 'Does your person have a big nose?', c => c.n);
    add('f:r', 'Face', 'Rosy cheeks', 'Does your person have rosy cheeks?', c => c.r);
    add('f:k', 'Face', 'Bushy brows', 'Does your person have bushy eyebrows?', c => c.k);
  })();
  const GW_CATS = ['Gender', 'Hair colour', 'Hair style', 'Eyes', 'Accessories', 'Face'];
  const gwQ = id => GW_Q.find(q => q.id === id);

  const GW_PARSE = [
    ['sex:f', /\b(woman|women|female|girl|lady|she|her)\b/],
    ['sex:m', /\b(man|male|boy|guy|gentleman|he|his)\b/],
    ['hc:none', /\b(bald|hairless|no hair)\b/],
    ['hs:long', /\blong\b/],
    ['hs:short', /\bshort\b/],
    ['hs:curly', /\b(curly|curls|curl|wavy)\b/],
    ['f:g', /\b(glasses|spectacles|eyeglasses|specs)\b/],
    ['f:h', /\b(hat|cap|beanie|fedora)\b/],
    ['f:e', /\b(earring|earrings)\b/],
    ['f:fh', /\bfacial hair\b/],
    ['f:b', /\bbeard\b/],
    ['f:m', /\b(moustache|mustache|stache)\b/],
    ['f:n', /\b(nose|big nose)\b/],
    ['f:r', /\b(rosy|cheeks|blush|blushing)\b/],
    ['f:k', /\b(eyebrow|eyebrows|brows|bushy)\b/]
  ];
  const GW_COLORS = [['black', /\b(black|dark)\b/], ['brown', /\b(brown|brunette)\b/], ['blonde', /\b(blonde|blond|yellow)\b/], ['red', /\b(red|ginger|redhead)\b/], ['white', /\b(white|grey|gray|silver)\b/], ['blue', /\bblue\b/], ['green', /\bgreen\b/]];

  function gwParse(text) {
    const s = String(text || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return { err: 'Type a question about the person.' };
    const hits = new Set();
    for (const [id, re] of GW_PARSE) if (re.test(s)) hits.add(id);
    if (hits.has('f:fh') || hits.has('f:b') || hits.has('f:m')) { if (hits.has('f:fh')) { hits.delete('f:b'); hits.delete('f:m'); } }
    if (hits.has('sex:f')) hits.delete('sex:m');
    const eyes = /\beyes?\b/.test(s);
    for (const [k, re] of GW_COLORS) {
      if (!re.test(s)) continue;
      if (k === 'blue') hits.add('ey:blue');
      else if (k === 'green') hits.add('ey:green');
      else if (eyes && k === 'brown') hits.add('ey:brown');
      else if (!eyes && !(k === 'black' && /\bdark\b/.test(s) && false)) hits.add('hc:' + k);
    }
    if (hits.has('hc:none') && hits.size > 1) hits.delete('hc:none');
    let ids = [...hits];
    if (ids.length > 1 && ids.some(i => i.startsWith('sex:'))) ids = ids.filter(i => !i.startsWith('sex:'));
    if (!ids.length) return { err: "I only understand questions about the faces: gender, hair, eyes, glasses, hat, beard, moustache, nose, cheeks, eyebrows or earrings." };
    if (ids.length > 1) return { err: 'Ask about one feature at a time.' };
    return { q: ids[0] };
  }

  function gwFace(c, uid) {
    const sk = GW_SKIN[c.skin], sh = GW_SHADE[c.skin], hc = GW_HAIR[c.hair], hd = GW_HAIR_D[c.hair], ec = GW_EYE[c.eyes];
    const female = c.sex === 'f', bald = c.style === 'bald';
    const hatc = GW_HATS[(c.name.charCodeAt(0) + c.name.length) % GW_HATS.length];
    const brow = bald || c.hair === 'none' ? '#3a2f2a' : c.hair === 'white' ? '#9a98a2' : hd;
    let back = '', front = '';
    if (c.style === 'long') back = `<path d="M20 52C14 26 30 10 50 10C70 10 86 26 80 52L84 104L16 104Z" fill="${hc}"/><path d="M20 52C18 70 20 90 16 104" stroke="${hd}" stroke-width="1.5" fill="none" opacity=".5"/>`;
    if (c.style === 'curly') {
      let cs = '';
      [[24, 40, 11], [18, 56, 11], [24, 72, 10], [76, 40, 11], [82, 56, 11], [76, 72, 10], [36, 20, 12], [50, 15, 13], [64, 20, 12]].forEach(([x, y, r]) => { cs += `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}"/>`; });
      back = cs;
    }
    if (c.style === 'short') front = `<path d="M22 52C17 26 33 12 50 12C67 12 83 26 78 52C75 40 70 34 62 32C58 36 42 36 38 32C30 34 25 40 22 52Z" fill="${hc}"/><path d="M30 24C38 16 62 16 70 24" stroke="${hd}" stroke-width="1.6" fill="none" opacity=".45"/>`;
    if (c.style === 'long') front = `<path d="M22 54C17 26 33 11 50 11C67 11 83 26 78 54C77 42 72 33 62 31C54 38 40 37 31 33C25 38 23 46 22 54Z" fill="${hc}"/><path d="M34 22C42 15 60 15 68 22" stroke="${hd}" stroke-width="1.6" fill="none" opacity=".45"/>`;
    if (c.style === 'curly') {
      let cs = '';
      [[30, 33, 10], [40, 27, 10], [50, 25, 10], [60, 27, 10], [70, 33, 10], [24, 44, 8], [76, 44, 8]].forEach(([x, y, r]) => { cs += `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}"/>`; });
      front = cs + `<path d="M28 40C36 32 64 32 72 40" stroke="${hd}" stroke-width="1.2" fill="none" opacity=".35"/>`;
    }
    const ears = `<ellipse cx="23.5" cy="56" rx="5" ry="8" fill="${sk}"/><ellipse cx="76.5" cy="56" rx="5" ry="8" fill="${sk}"/><path d="M22 54Q24 56 22 60M78 54Q76 56 78 60" stroke="${sh}" stroke-width="1.2" fill="none"/>`;
    const ear = c.e ? `<circle cx="23" cy="67" r="3.2" fill="#f5c542" stroke="#b7861a" stroke-width=".8"/><circle cx="77" cy="67" r="3.2" fill="#f5c542" stroke="#b7861a" stroke-width=".8"/>` : '';
    const shirt = `<path d="M4 120C8 100 28 94 50 94C72 94 92 100 96 120Z" fill="${c.shirt}"/><path d="M36 95L50 112L64 95" fill="${sk}" stroke="${sh}" stroke-width="1"/><path d="M36 95L50 112L64 95" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="3"/>`;
    const neck = `<rect x="41" y="78" width="18" height="20" fill="${sh}"/><path d="M41 90Q50 98 59 90V98H41Z" fill="${sh}"/>`;
    const head = `<ellipse cx="50" cy="54" rx="27" ry="31" fill="${sk}"/><ellipse cx="50" cy="54" rx="27" ry="31" fill="none" stroke="${sh}" stroke-width="1.2" opacity=".6"/>`;
    const baldShine = bald ? `<path d="M34 30C42 22 58 22 66 30" stroke="rgba(255,255,255,.55)" stroke-width="3" stroke-linecap="round" fill="none"/>` : '';
    const bw = c.k ? 4.4 : 2.4;
    const brows = `<path d="M30 43Q38 ${c.k ? 38 : 40} 45 43" stroke="${brow}" stroke-width="${bw}" stroke-linecap="round" fill="none"/><path d="M55 43Q62 ${c.k ? 38 : 40} 70 43" stroke="${brow}" stroke-width="${bw}" stroke-linecap="round" fill="none"/>`;
    const eye = x => `<ellipse cx="${x}" cy="51" rx="6.2" ry="4.4" fill="#fff" stroke="${sh}" stroke-width=".8"/><circle cx="${x}" cy="51" r="3.4" fill="${ec}"/><circle cx="${x}" cy="51" r="1.5" fill="#111"/><circle cx="${x - 1.2}" cy="49.8" r=".9" fill="#fff"/>${female ? `<path d="M${x - 6.4} 49.6L${x - 8} 47.8M${x + 6.4} 49.6L${x + 8} 47.8M${x} 46.6L${x} 44.6" stroke="#2b2022" stroke-width="1" stroke-linecap="round"/>` : ''}`;
    const eyes = eye(38) + eye(62);
    const glasses = c.g ? `<g fill="rgba(180,220,255,.28)" stroke="#2a2d38" stroke-width="2"><circle cx="38" cy="51" r="9.5"/><circle cx="62" cy="51" r="9.5"/></g><path d="M47.5 50Q50 48 52.5 50M28.5 49L22 47M71.5 49L78 47" stroke="#2a2d38" stroke-width="2" fill="none"/>` : '';
    const nose = c.n ? `<path d="M50 50C45 62 42 68 47 71C49 72 51 72 53 71C58 68 55 62 50 50Z" fill="${sh}" opacity=".9"/><path d="M45 70Q50 74 55 70" stroke="${sh}" stroke-width="1.4" fill="none"/>` : `<path d="M50 54C48 61 47 64 50 66C53 64 52 61 50 54Z" fill="${sh}" opacity=".75"/>`;
    const cheeks = c.r ? `<circle cx="30" cy="64" r="5.6" fill="#f2828a" opacity=".6"/><circle cx="70" cy="64" r="5.6" fill="#f2828a" opacity=".6"/>` : '';
    const beard = c.b ? `<path d="M24 60C24 86 36 98 50 98C64 98 76 86 76 60C73 78 64 84 50 84C36 84 27 78 24 60Z" fill="${hc}"/><path d="M30 80C40 90 60 90 70 80" stroke="${hd}" stroke-width="1.4" fill="none" opacity=".5"/>` : '';
    const stache = c.m ? `<path d="M34 70C40 64 47 66 50 69C53 66 60 64 66 70C60 75 54 73 50 72C46 73 40 75 34 70Z" fill="${hc}"/>` : '';
    const lips = female ? `<path d="M42 76Q46 73 50 75Q54 73 58 76Q50 83 42 76Z" fill="#d9486e"/>` : `<path d="M42 76Q50 82 58 76" stroke="#8c3b3b" stroke-width="2" stroke-linecap="round" fill="none"/>`;
    const mouth = c.b || c.m ? `<path d="M43 77Q50 82 57 77" stroke="#6b2a2a" stroke-width="2" stroke-linecap="round" fill="none"/>` : lips;
    let hat = '';
    if (c.h) {
      const hi = (c.name.charCodeAt(0) + c.name.length) % 2;
      hat = hi ? `<path d="M19 36C18 8 82 8 81 36C70 30 30 30 19 36Z" fill="${hatc}"/><path d="M17 38Q50 28 83 38Q83 44 50 40Q17 44 17 38Z" fill="${hatc}" stroke="rgba(0,0,0,.25)" stroke-width="1"/><path d="M24 25C36 14 64 14 76 25" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>`
        : `<path d="M21 38C20 12 80 12 79 38Z" fill="${hatc}"/><path d="M19 38C30 33 70 33 81 38Q82 42 50 42Q18 42 19 38Z" fill="rgba(0,0,0,.2)"/><path d="M20 36L12 42Q50 48 88 42L80 36Z" fill="${hatc}" stroke="rgba(0,0,0,.25)" stroke-width="1"/><rect x="21" y="28" width="58" height="5" fill="rgba(255,255,255,.4)"/>`;
    }
    return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><rect width="100" height="120" fill="${c.bg}"/><circle cx="50" cy="60" r="46" fill="rgba(255,255,255,.55)"/>${back}${shirt}${neck}${ears}${ear}${head}${baldShine}${cheeks}${front}${brows}${eyes}${glasses}${nose}${beard}${stache}${mouth}${hat}</svg>`;
  }

  function gwCands(hist, by) {
    let c = GW_CAST.map((x, i) => i);
    hist.forEach(h => { if (h.by === by && h.q) { const q = gwQ(h.q); if (q) c = c.filter(i => !!q.test(GW_CAST[i]) === !!h.a); } });
    return c;
  }

  function gwAI(hist, me, level, memo) {
    const cands = gwCands(hist, me), n = cands.length;
    const asked = new Set(hist.filter(h => h.by === me && h.q).map(h => h.q));
    const nh = gwCands(hist, me ^ 1).length;
    const L = { easy: { noise: .5, guess: 3 }, normal: { noise: .14, guess: 2 }, hard: { noise: 0, guess: 2 } }[level] || { noise: .14, guess: 2 };
    if (n <= 1) return { guess: cands[0] ?? rnd(24) };
    if (level === 'easy' && n <= L.guess && Math.random() < .6) return { guess: pick(cands) };
    if (level === 'normal' && n === 2 && (nh <= 2 || Math.random() < .2)) return { guess: pick(cands) };
    if (level === 'hard' && n === 2 && nh <= 1) return { guess: pick(cands) };
    if (level === 'hard' && nh <= 1 && n > 1) return { guess: pick(cands) };
    const opts = [];
    GW_Q.forEach(q => {
      if (asked.has(q.id)) return;
      let y = 0;
      cands.forEach(i => { if (q.test(GW_CAST[i])) y++; });
      if (y === 0 || y === n) return;
      const exp = (y * y + (n - y) * (n - y)) / n;
      opts.push({ q: q.id, s: exp * (1 + (Math.random() - .5) * L.noise * 2) + (level === 'easy' ? Math.random() * n * .6 : 0) });
    });
    if (!opts.length) return { guess: pick(cands) };
    opts.sort((a, b) => a.s - b.s);
    return { q: opts[0].q };
  }

  const GW_CSS = BASE_CSS.replace(/@/g, 'guess-who') + `
.gm-guess-who{--bx:#1c58b8;--accent:#1c58b8}
.gm-guess-who .gw-wrap{width:100%;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start}
.gm-guess-who .gw-case{position:relative;flex:1 1 400px;max-width:640px;min-width:0;border-radius:18px;padding:12px 12px 14px;background:linear-gradient(160deg,#2f6fd0,#173f86);box-shadow:0 12px 30px rgba(15,35,90,.4),inset 0 2px 0 rgba(255,255,255,.3);border:3px solid #0f2c63}
.gm-guess-who .gw-logo{display:flex;justify-content:center;align-items:center;gap:8px;margin:0 0 8px;font:900 24px/1 "Trebuchet MS",var(--sans);letter-spacing:1px;color:#ffd23f;text-shadow:0 2px 0 #7a4b00,0 4px 8px rgba(0,0,0,.35);font-style:italic}
.gm-guess-who .gw-logo span{display:inline-block;padding:2px 10px;border-radius:12px;background:#d8423a;color:#fff;text-shadow:0 2px 0 #7a1a14;transform:rotate(-3deg)}
.gm-guess-who .gw-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;background:#0d2552;padding:8px;border-radius:12px;box-shadow:inset 0 3px 8px rgba(0,0,0,.6)}
.gm-guess-who .gw-c{position:relative;display:block;padding:0;border:0;background:#112d63;border-radius:9px;aspect-ratio:100/138;perspective:700px;min-width:0;box-shadow:inset 0 -6px 0 #091b3e}
.gm-guess-who .gw-in{position:absolute;inset:0;transform-origin:50% 100%;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.45,1.45,.5,1)}
.gm-guess-who .gw-c.down .gw-in{transform:rotateX(-93deg)}
.gm-guess-who .gw-f,.gm-guess-who .gw-bk{position:absolute;inset:0;border-radius:9px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.gm-guess-who .gw-f{background:#fff;border:3px solid #fff;display:flex;flex-direction:column;box-shadow:0 2px 0 rgba(0,0,0,.25)}
.gm-guess-who .gw-f svg{display:block;width:100%;flex:1 1 auto;min-height:0}
.gm-guess-who .gw-f b{flex:none;display:block;padding:2px 0 3px;font:800 clamp(9px,1.6vw,13px)/1.1 var(--sans);text-align:center;color:#fff;background:#d8423a;letter-spacing:.3px}
.gm-guess-who .gw-bk{transform:rotateX(180deg);background:repeating-linear-gradient(45deg,#2b66c9 0 6px,#2459b3 6px 12px);border:2px solid #0f2c63}
.gm-guess-who .gw-c.sel .gw-f{box-shadow:0 0 0 3px #ffd23f,0 0 14px 4px rgba(255,210,63,.8)}
.gm-guess-who .gw-c.secret .gw-f{box-shadow:0 0 0 3px #3ddc84,0 0 14px 4px rgba(61,220,132,.75)}
.gm-guess-who .gw-c.wrong .gw-f{box-shadow:0 0 0 3px #ff5a4a,0 0 14px 4px rgba(255,90,74,.75)}
.gm-guess-who .gw-c:focus-visible{outline:3px solid #fff;outline-offset:2px}
.gm-guess-who .gw-c.pop .gw-in{animation:gw-pop .5s}
@keyframes gw-pop{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}
.gm-guess-who .gw-bubble{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%) scale(.6);z-index:4;pointer-events:none;opacity:0;text-align:center;padding:14px 30px;border-radius:24px;border:4px solid #fff;color:#fff;font:900 clamp(34px,7vw,58px)/1 "Trebuchet MS",var(--sans);text-shadow:0 3px 0 rgba(0,0,0,.3);box-shadow:0 14px 36px rgba(0,0,0,.5)}
.gm-guess-who .gw-bubble small{display:block;margin-bottom:6px;font:800 14px/1.3 var(--sans);text-shadow:none;max-width:22em}
.gm-guess-who .gw-bubble.y{background:linear-gradient(#3fd27a,#1b9a52)}
.gm-guess-who .gw-bubble.n{background:linear-gradient(#ff6b5a,#c8332a)}
.gm-guess-who .gw-bubble.show{animation:gw-bub 1.7s ease both}
@keyframes gw-bub{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}22%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-56%) scale(1)}}
.gm-guess-who .gw-side{flex:0 1 300px;min-width:250px;display:flex;flex-direction:column;gap:10px}
.gm-guess-who .gw-card{background:#fff;border:1px solid #e3e5f0;border-radius:16px;padding:10px 12px;box-shadow:0 4px 14px rgba(30,30,70,.07)}
.gm-guess-who .gw-stat{display:flex;align-items:center;gap:10px;font:800 15px/1.25 var(--sans)}
.gm-guess-who .gw-stat i{flex:none;width:14px;height:14px;border-radius:50%;background:#3ddc84;box-shadow:0 0 0 3px rgba(61,220,132,.25)}
.gm-guess-who .gw-stat i.w{background:#e0a31f;box-shadow:0 0 0 3px rgba(224,163,31,.25)}
.gm-guess-who .gw-stat small{display:block;font:600 12px/1.3 var(--sans);color:#6b7190}
.gm-guess-who .gw-h{margin:0 0 6px;font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#6b7190}
.gm-guess-who .gw-mine{display:flex;gap:10px;align-items:center}
.gm-guess-who .gw-mine .gw-mf{flex:none;width:58px;height:80px;border-radius:8px;overflow:hidden;border:3px solid #d8423a;background:#fff}
.gm-guess-who .gw-mine .gw-mf svg{display:block;width:100%;height:100%}
.gm-guess-who .gw-mine b{font:900 17px var(--sans)}
.gm-guess-who .gw-mine small{display:block;font:600 12px/1.3 var(--sans);color:#6b7190}
.gm-guess-who .gw-tabs{display:flex;gap:6px;margin-bottom:8px}
.gm-guess-who .gw-tabs button{flex:1;min-height:38px;border-radius:11px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 13px var(--sans)}
.gm-guess-who .gw-tabs button.on{background:#1c58b8;border-color:#1c58b8;color:#fff}
.gm-guess-who .gw-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px}
.gm-guess-who .gw-chips button{min-height:34px;padding:0 11px;border-radius:17px;border:2px solid #d5d8e8;background:#f7f8fd;color:#2a2f45;font:700 12.5px var(--sans)}
.gm-guess-who .gw-chips button.on{background:#ffd23f;border-color:#e0a31f;color:#3a2a00}
.gm-guess-who .gw-chips.cats button.on{background:#1c58b8;border-color:#1c58b8;color:#fff}
.gm-guess-who .gw-q{margin:6px 0;padding:8px 10px;border-radius:12px;background:#eef3ff;font:800 14px/1.3 var(--sans);color:#173f86;min-height:20px}
.gm-guess-who .gw-go{display:block;width:100%;min-height:42px;border:0;border-radius:12px;background:#1c58b8;color:#fff;font:800 14px var(--sans);box-shadow:inset 0 -3px 0 rgba(0,0,0,.22);margin-top:4px}
.gm-guess-who .gw-go.red{background:#d8423a}
.gm-guess-who .gw-go:disabled{opacity:.4;pointer-events:none}
.gm-guess-who .gw-type{display:flex;gap:6px;margin-top:8px}
.gm-guess-who .gw-type input{flex:1;min-width:0;height:40px;padding:0 12px;border-radius:11px;border:2px solid #d5d8e8;background:#fff;color:#1d2230;font:600 14px var(--sans)}
.gm-guess-who .gw-type input:focus{outline:none;border-color:#1c58b8}
.gm-guess-who .gw-type button{flex:none;width:44px;height:40px;border-radius:11px;border:0;background:#1c58b8;color:#fff;font:900 16px var(--sans)}
.gm-guess-who .gw-err{margin:4px 0 0;font:700 12px/1.35 var(--sans);color:#c8332a;min-height:0}
.gm-guess-who .gw-log{max-height:190px;overflow:auto;font:600 12.5px/1.4 var(--sans);color:#3d4360}
.gm-guess-who .gw-log div{padding:4px 0;border-bottom:1px dashed #eceef6}
.gm-guess-who .gw-log b.y{color:#1b9a52}.gm-guess-who .gw-log b.n{color:#c8332a}
.gm-guess-who .gw-log em{font-style:normal;font-weight:800;color:#1c58b8}
.gm-guess-who .gw-row{display:flex;gap:6px;flex-wrap:wrap}
.gm-guess-who .gw-sm{flex:1 1 auto;min-height:36px;padding:0 10px;border-radius:10px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 12.5px var(--sans)}
.gm-guess-who .gw-sm.on{border-color:#1c58b8;background:#e8f0ff}
.gm-guess-who .gw-big{display:flex;gap:14px;justify-content:center;margin:10px 0}
.gm-guess-who .gw-big div{width:96px}
.gm-guess-who .gw-big .gw-bf{width:96px;height:132px;border-radius:10px;overflow:hidden;border:3px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,.3);background:#fff}
.gm-guess-who .gw-big svg{display:block;width:100%;height:100%}
.gm-guess-who .gw-big small{display:block;margin-top:4px;font:800 12px var(--sans);color:#4a5068}
.gm-guess-who .gw-big small b{display:block;font-size:14px;color:#1d2230}
@media(max-width:700px){.gm-guess-who .gw-side{flex:1 1 100%}.gm-guess-who .gw-grid{gap:4px;padding:5px}.gm-guess-who .gw-logo{font-size:18px}}
`;

  const GW_HELP = `<div class="bx-rules">
<p><b>Goal.</b> Work out which of the 24 people your opponent secretly picked before they work out yours.</p>
<p><b>Setup.</b> Each player secretly picks one person. All 24 faces start standing up on your board.</p>
<p><b>Your turn.</b> Ask one yes/no question about your opponent's person, for example "Does your person wear glasses?". Choose it from the menus or type it. The answer is automatic and always honest. Then flip down the faces that cannot be the answer: tap a face to flap it down or back up. Auto-flip can do it for you.</p>
<p><b>Final guess.</b> Instead of asking, you may guess a person. A correct guess wins the game. A wrong guess loses immediately.</p>
<p><b>Tips.</b> The best questions split the remaining faces in half. A hat or glasses question rarely helps once only a few faces remain.</p></div>`;

  const GW_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="8" width="44" height="48" rx="6"/><circle cx="32" cy="27" r="9"/><path d="M26 25h-3M41 25h-3M28 31q4 3 8 0M16 52q4-12 16-12t16 12"/></svg>';

  Ameplay.register({
    id: 'guess-who',
    title: 'Guess Who',
    category: 'Board',
    tint: '#1c58b8',
    blurb: 'Flip down faces, ask the right questions and pin down your rival’s secret person first.',
    help: 'Pick a secret person · ask a question from the menus or type one · tap faces to flip them down · use <kbd>Guess</kbd> for the final answer (a wrong guess loses!)',
    width: 940,
    format: v => v + ' pts',
    icon: GW_ICON,
    _t: { gwCands, gwAI, gwParse, GW_CAST, GW_Q },
    css: GW_CSS,
    mount(root, api) {
      const au = mkAudio(api);
      const sv = api.load() || {};
      const opt = { diff: ['easy', 'normal', 'hard'].includes(sv.diff) ? sv.diff : 'normal', auto: sv.auto !== false, fast: !!sv.fast };
      const save = () => api.save(opt);
      const faces = GW_CAST.map(gwFace);
      const wrap = mk('div', 'gw-wrap');
      const cs = mk('div', 'gw-case', '<div class="gw-logo"><span>GUESS</span>WHO?</div>');
      const grid = mk('div', 'gw-grid');
      const bubble = mk('div', 'gw-bubble');
      cs.append(grid, bubble);
      const side = mk('div', 'gw-side');
      wrap.append(cs, side); root.append(wrap);
      const netEl = mk('div', 'bx-net', '<i></i><span>Online</span>'); netEl.hidden = true; root.append(netEl);
      const pane = mk('div', 'bx-pane'); pane.hidden = true; root.append(pane);
      let paneCb = null, killNet = null;
      const cards = GW_CAST.map((c, i) => {
        const b = mk('button', 'gw-c');
        b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', c.name);
        b.innerHTML = `<span class="gw-in"><span class="gw-f">${faces[i]}<b>${c.name}</b></span><span class="gw-bk"></span></span>`;
        grid.append(b);
        return b;
      });

      const M = { mode: 'cpu', role: 'local', phase: 'menu', me: 0, sec: [-1, -1], turn: 0, hist: [], down: new Set(), tab: 'ask', cat: 'Gender', pickQ: null, guessSel: -1, mySel: -1, names: ['You', 'CPU'], tok: 0, ready: [false, false], rematch: [false, false], err: '', busy: false, hooked: false, scored: false, typed: '' };
      const now = () => performance.now();

      function showPane(html, cb, cls) { pane.className = 'bx-pane' + (cls ? ' ' + cls : ''); pane.innerHTML = html; pane.hidden = false; paneCb = cb || null; }
      function hidePane() { pane.hidden = true; paneCb = null; pane.innerHTML = ''; }
      api.on(pane, 'click', e => { const b = e.target.closest('[data-a]'); if (!b || !paneCb) return; au.unlock(); au.tone(520, .05, 'sine', .05); paneCb(b.dataset.a, b); });

      const sfx = {
        flap: () => { au.noise(.09, .06, 900); au.tone(260, .08, 'triangle', .04, 120); },
        yes: () => { au.tone(660, .12, 'sine', .07); au.tone(990, .18, 'sine', .07, 0, .1); },
        no: () => { au.tone(260, .2, 'sawtooth', .05, 150); },
        win: () => { [523, 659, 784, 1046].forEach((f, i) => au.tone(f, .3, 'triangle', .07, 0, i * .12)); },
        lose: () => { [392, 330, 262, 196].forEach((f, i) => au.tone(f, .35, 'sawtooth', .05, 0, i * .16)); },
        pick: () => au.tone(700, .06, 'triangle', .06)
      };

      function renderBoard() {
        cards.forEach((b, i) => {
          b.classList.toggle('down', M.down.has(i));
          b.classList.toggle('sel', (M.phase === 'pick' && M.mySel === i) || (M.phase === 'play' && M.tab === 'guess' && M.guessSel === i));
        });
      }

      function flap(i, down) {
        if (down) M.down.add(i); else M.down.delete(i);
        cards[i].classList.toggle('down', down);
        sfx.flap();
      }

      function bubbleShow(a, text) {
        bubble.className = 'gw-bubble ' + (a ? 'y' : 'n');
        bubble.innerHTML = `${text ? `<small>${esc(text)}</small>` : ''}${a ? 'YES' : 'NO'}`;
        void bubble.offsetWidth; bubble.classList.add('show');
        (a ? sfx.yes : sfx.no)();
      }

      function statusLine() {
        if (M.phase === 'pick') return M.mode === 'online' && M.ready[M.me] ? ['Ready', 'Waiting for your opponent to choose.', 1] : ['Choose your person', 'Tap a face, then confirm. Your opponent has to find it.', 0];
        if (M.phase === 'play') {
          if (M.turn === M.me) return ['Your turn', M.tab === 'guess' ? 'Tap a face on the board to guess it.' : 'Ask a question, or make your final guess.', 0];
          return [M.mode === 'cpu' ? 'CPU is thinking…' : `${esc(M.names[M.turn])} is thinking…`, 'Flip down faces on your board while you wait.', 1];
        }
        if (M.phase === 'over') return ['Game over', '', 1];
        return ['', '', 0];
      }

      function histHtml() {
        if (!M.hist.length) return '<div>No questions yet.</div>';
        return M.hist.slice().reverse().map(h => {
          const who = h.by === M.me ? 'You' : M.mode === 'cpu' ? 'CPU' : esc(M.names[h.by]);
          if (h.guess != null) return `<div><em>${who}</em> guessed ${esc(GW_CAST[h.guess].name)}: <b class="${h.ok ? 'y' : 'n'}">${h.ok ? 'Correct!' : 'Wrong'}</b></div>`;
          const q = gwQ(h.q);
          return `<div><em>${who}</em> ${esc(h.text || q.text)} <b class="${h.a ? 'y' : 'n'}">${h.a ? 'Yes' : 'No'}</b></div>`;
        }).join('');
      }

      function renderSide() {
        if (M.phase === 'menu') { side.innerHTML = ''; return; }
        const [h, sub, w] = statusLine();
        let html = `<div class="gw-card"><div class="gw-stat"><i class="${w ? 'w' : ''}"></i><div>${h}<small>${sub}</small></div></div></div>`;
        if (M.phase === 'pick') {
          const sel = M.mySel;
          html += `<div class="gw-card"><div class="gw-h">Your secret person</div><div class="gw-mine">${sel >= 0 ? `<div class="gw-mf">${faces[sel]}</div><div><b>${GW_CAST[sel].name}</b><small>Your opponent has to guess this one.</small></div>` : '<div><small>Tap a face on the board.</small></div>'}</div>
<div class="gw-row" style="margin-top:8px"><button class="gw-sm" data-s="rand" ${M.ready[M.me] ? 'disabled' : ''}>Random</button><button class="gw-sm" data-s="menu">Leave</button></div>
<button class="gw-go" data-s="ok" ${sel < 0 || (M.mode === 'online' && M.ready[M.me]) ? 'disabled' : ''}>${M.mode === 'online' && M.ready[M.me] ? 'Waiting…' : 'Confirm'}</button></div>`;
        } else if (M.phase === 'play' || M.phase === 'over') {
          const my = M.sec[M.me] >= 0 ? M.sec[M.me] : M.mySel;
          html += `<div class="gw-card"><div class="gw-h">Your person</div><div class="gw-mine"><div class="gw-mf">${faces[my]}</div><div><b>${GW_CAST[my].name}</b><small>${[...M.down].length} faces flipped down</small></div></div></div>`;
          if (M.phase === 'play') {
            const mine = M.turn === M.me && !M.busy;
            html += `<div class="gw-card"><div class="gw-tabs"><button data-s="tab:ask" class="${M.tab === 'ask' ? 'on' : ''}">Ask a question</button><button data-s="tab:guess" class="${M.tab === 'guess' ? 'on' : ''}">Final guess</button></div>`;
            if (M.tab === 'ask') {
              html += `<div class="gw-chips cats">${GW_CATS.map(c => `<button data-s="cat:${c}" class="${M.cat === c ? 'on' : ''}">${c}</button>`).join('')}</div>
<div class="gw-chips">${GW_Q.filter(q => q.cat === M.cat).map(q => `<button data-s="q:${q.id}" class="${M.pickQ === q.id ? 'on' : ''}" ${M.hist.some(h => h.by === M.me && h.q === q.id) ? 'style="opacity:.45"' : ''}>${q.label}</button>`).join('')}</div>
<div class="gw-q">${M.pickQ ? esc(gwQ(M.pickQ).text) : 'Pick an option above, or type your own question.'}</div>
<button class="gw-go" data-s="ask" ${mine && M.pickQ && !M.hist.some(h => h.by === M.me && h.q === M.pickQ) ? '' : 'disabled'}>Ask</button>
<div class="gw-type"><input type="text" maxlength="80" placeholder="Or type: does she wear glasses?" value="${esc(M.typed)}" ${mine ? '' : 'disabled'}><button data-s="type" ${mine ? '' : 'disabled'} aria-label="Ask">&rarr;</button></div><div class="gw-err">${esc(M.err)}</div>`;
            } else {
              const g = M.guessSel;
              html += `<p style="margin:2px 0 8px;font:600 13px/1.4 var(--sans);color:#4a5068">Tap a face on the board. A wrong guess loses the game!</p><div class="gw-q">${g >= 0 ? `Is it <b>${GW_CAST[g].name}</b>?` : 'No face selected.'}</div><button class="gw-go red" data-s="guess" ${mine && g >= 0 ? '' : 'disabled'}>Guess ${g >= 0 ? GW_CAST[g].name : ''}</button>`;
            }
            html += '</div>';
          }
          html += `<div class="gw-card"><div class="gw-h">Questions asked</div><div class="gw-log">${histHtml()}</div></div>
<div class="gw-card"><div class="gw-row"><button class="gw-sm ${opt.auto ? 'on' : ''}" data-s="auto">Auto-flip: ${opt.auto ? 'On' : 'Off'}</button><button class="gw-sm" data-s="reset">Stand all up</button><button class="gw-sm" data-s="help">Rules</button>${M.phase === 'play' ? '<button class="gw-sm" data-s="resign">Resign</button>' : ''}</div></div>`;
        }
        side.innerHTML = html;
        const inp = side.querySelector('.gw-type input');
        if (inp) { inp.addEventListener('input', () => { M.typed = inp.value; }); inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); typedAsk(); } }); }
      }

      function typedAsk() {
        if (M.phase !== 'play' || M.turn !== M.me || M.busy) return;
        const r = gwParse(M.typed);
        if (r.err) { M.err = r.err; renderSide(); return; }
        M.err = '';
        if (M.hist.some(h => h.by === M.me && h.q === r.q)) { M.err = 'You already asked that one.'; renderSide(); return; }
        M.pickQ = r.q; M.typed = '';
        askQ(r.q);
      }

      api.on(side, 'click', e => {
        au.unlock();
        const b = e.target.closest('[data-s]');
        if (!b) return;
        const s = b.dataset.s;
        if (s.startsWith('tab:')) { M.tab = s.slice(4); M.guessSel = -1; renderBoard(); renderSide(); }
        else if (s.startsWith('cat:')) { M.cat = s.slice(4); renderSide(); }
        else if (s.startsWith('q:')) { M.pickQ = s.slice(2); M.err = ''; renderSide(); }
        else if (s === 'ask') { if (M.pickQ) askQ(M.pickQ); }
        else if (s === 'type') typedAsk();
        else if (s === 'guess') { if (M.guessSel >= 0) doGuess(M.guessSel); }
        else if (s === 'auto') { opt.auto = !opt.auto; save(); renderSide(); }
        else if (s === 'reset') { [...M.down].forEach(i => flap(i, false)); renderSide(); }
        else if (s === 'help') showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Guess Who</h3>${GW_HELP}<button class="bx-btn" data-a="x">Back</button></div>`, () => hidePane());
        else if (s === 'resign') showPane(`<div class="bx-box"><h3>Resign?</h3><p>You will lose this game.</p><button class="bx-btn" data-a="y">Resign</button><button class="bx-btn alt" data-a="n">Keep playing</button></div>`, a => { hidePane(); if (a === 'y') resign(); });
        else if (s === 'rand') { M.mySel = rnd(24); sfx.pick(); renderBoard(); renderSide(); }
        else if (s === 'ok') confirmPick();
        else if (s === 'menu') { if (M.mode === 'online') leaveOnline(); showMenu(); }
      });

      api.on(grid, 'click', e => {
        au.unlock();
        const b = e.target.closest('.gw-c');
        if (!b) return;
        const i = +b.dataset.i;
        if (M.phase === 'pick') {
          if (M.mode === 'online' && M.ready[M.me]) return;
          M.mySel = i; sfx.pick(); renderBoard(); renderSide();
        } else if (M.phase === 'play' || M.phase === 'over') {
          if (M.phase === 'play' && M.tab === 'guess' && M.turn === M.me && !M.busy) { M.guessSel = i; sfx.pick(); renderBoard(); renderSide(); }
          else if (M.phase === 'play') { flap(i, !M.down.has(i)); renderSide(); }
        }
      });

      function menuHtml() {
        return `<div class="bx-box"><p class="bx-kick">Mystery</p><h3>Guess Who?</h3><p>Pick a secret person, ask yes/no questions, flip down the faces that don't fit and be the first to name your rival's person.</p>
<div class="bx-lbl">Computer level</div><div class="bx-seg">${['easy', 'normal', 'hard'].map(d => `<button data-a="d:${d}" class="${opt.diff === d ? 'on' : ''}">${d[0].toUpperCase() + d.slice(1)}</button>`).join('')}</div>
<button class="bx-btn" data-a="cpu">Play vs computer</button>
<button class="bx-btn" data-a="online">Play online<small>1 vs 1 with a friend</small></button>
<div class="bx-row"><button class="bx-btn alt sm" data-a="help">How to play</button><button class="bx-btn alt sm" data-a="auto">Auto-flip: ${opt.auto ? 'On' : 'Off'}</button></div></div>`;
      }
      function showMenu() {
        M.tok++; M.phase = 'menu'; M.mode = 'cpu'; M.role = 'local';
        M.down.clear(); renderBoard(); renderSide();
        showPane(menuHtml(), menuAct);
      }
      function menuAct(a) {
        if (a.startsWith('d:')) { opt.diff = a.slice(2); save(); showPane(menuHtml(), menuAct); }
        else if (a === 'cpu') { M.mode = 'cpu'; beginPick(); }
        else if (a === 'online') startOnline();
        else if (a === 'auto') { opt.auto = !opt.auto; save(); showPane(menuHtml(), menuAct); }
        else if (a === 'help') showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Guess Who</h3>${GW_HELP}<button class="bx-btn" data-a="x">Back</button></div>`, () => showPane(menuHtml(), menuAct));
      }

      function newSession() {
        M.tok++; M.sec = [-1, -1]; M.hist = []; M.down.clear(); M.mySel = -1; M.guessSel = -1; M.tab = 'ask'; M.pickQ = null; M.err = ''; M.typed = '';
        M.ready = [false, false]; M.rematch = [false, false]; M.busy = false; M.scored = false; M.turn = 0;
        cards.forEach(c => c.classList.remove('secret', 'wrong', 'sel'));
        bubble.className = 'gw-bubble';
      }
      function beginPick() {
        newSession();
        M.phase = 'pick';
        if (M.mode !== 'online') { M.role = 'local'; M.me = 0; M.names = ['You', 'CPU']; }
        api.score(0);
        hidePane(); renderBoard(); renderSide();
      }

      function confirmPick() {
        if (M.mySel < 0) return;
        if (M.mode === 'cpu') {
          M.sec[0] = M.mySel; M.sec[1] = rnd(24);
          startPlay(rnd(2));
          return;
        }
        M.ready[M.me] = true;
        if (M.role === 'guest') api.net.send({ t: 'pick', i: M.mySel });
        else { M.sec[0] = M.mySel; tryStartOnline(); }
        renderSide();
      }
      function tryStartOnline() {
        if (M.role !== 'host' || M.sec[0] < 0 || M.sec[1] < 0) return;
        const first = rnd(2);
        api.net.send({ t: 'start', first });
        startPlay(first);
      }
      function startPlay(first) {
        M.phase = 'play'; M.turn = first; M.hist = []; M.down.clear(); M.mySel = M.sec[M.me] >= 0 ? M.sec[M.me] : M.mySel;
        hidePane(); renderBoard(); renderSide();
        api.toast(first === M.me ? 'You go first' : (M.mode === 'cpu' ? 'CPU goes first' : esc(M.names[first]) + ' goes first'));
        nextTurn();
      }

      function answerFor(asker, qid) {
        const target = GW_CAST[M.sec[asker ^ 1]];
        return !!gwQ(qid).test(target);
      }

      function askQ(qid) {
        if (M.phase !== 'play' || M.turn !== M.me || M.busy) return;
        if (M.hist.some(h => h.by === M.me && h.q === qid)) { M.err = 'You already asked that one.'; renderSide(); return; }
        if (M.mode === 'online' && M.role === 'guest') { M.busy = true; api.net.send({ t: 'ask', q: qid }); renderSide(); return; }
        qaEvent(M.me, qid, answerFor(M.me, qid));
      }

      function qaEvent(by, qid, a) {
        const h = { by, q: qid, a: !!a };
        M.hist.push(h);
        if (M.mode === 'online' && M.role === 'host') api.net.send({ t: 'qa', by, q: qid, a: !!a, turn: by ^ 1 });
        showQA(h, by ^ 1);
      }
      function showQA(h, nextTurn) {
        M.busy = true; M.pickQ = null; M.err = '';
        const q = gwQ(h.q);
        bubbleShow(h.a, (h.by === M.me ? 'You ask: ' : (M.mode === 'cpu' ? 'CPU asks: ' : esc(M.names[h.by]) + ' asks: ')) + q.text);
        renderSide();
        const tok = M.tok;
        api.timeout(() => {
          if (tok !== M.tok) return;
          if (h.by === M.me && opt.auto) {
            const out = [];
            GW_CAST.forEach((c, i) => { if (!!q.test(c) !== h.a && !M.down.has(i)) out.push(i); });
            out.forEach((i, k) => api.timeout(() => { if (tok === M.tok) flap(i, true); }, k * 70));
            api.timeout(() => { if (tok === M.tok) { M.busy = false; M.turn = nextTurn; renderSide(); nextTurn_(); } }, out.length * 70 + 650);
          } else { M.busy = false; M.turn = nextTurn; renderSide(); nextTurn_(); }
        }, 1500 / (opt.fast ? 2 : 1));
      }
      const nextTurn_ = () => nextTurn();
      function nextTurn() {
        if (M.phase !== 'play') return;
        renderSide();
        if (M.mode === 'cpu' && M.turn === 1 && !M.busy) {
          const tok = M.tok;
          M.busy = true; renderSide();
          api.timeout(() => {
            if (tok !== M.tok || M.phase !== 'play') return;
            M.busy = false;
            const d = gwAI(M.hist, 1, opt.diff);
            if (d.guess != null) { cpuGuess(d.guess); return; }
            qaEvent(1, d.q, answerFor(1, d.q));
          }, 900 + rnd(800));
        }
      }
      function cpuGuess(i) { finishGuess(1, i); }

      function doGuess(i) {
        if (M.phase !== 'play' || M.turn !== M.me || M.busy) return;
        if (M.mode === 'online' && M.role === 'guest') { M.busy = true; api.net.send({ t: 'guess', i }); renderSide(); return; }
        finishGuess(M.me, i);
      }
      function finishGuess(by, i) {
        const ok = i === M.sec[by ^ 1];
        const win = ok ? by : by ^ 1;
        M.hist.push({ by, guess: i, ok });
        if (M.mode === 'online' && M.role === 'host') api.net.send({ t: 'end', by, i, ok, win, sec: M.sec.slice() });
        endGame(win, by, i, ok, '');
      }
      function resign() {
        if (M.phase !== 'play') return;
        if (M.mode === 'online' && M.role === 'guest') { api.net.send({ t: 'resign' }); return; }
        const win = M.me ^ 1;
        if (M.mode === 'online') api.net.send({ t: 'end', by: -1, i: -1, ok: false, win, sec: M.sec.slice(), why: 'resign' });
        endGame(win, -1, -1, false, 'resign');
      }

      function endGame(win, by, i, ok, why) {
        if (M.phase === 'over') return;
        M.phase = 'over'; M.busy = false;
        const mine = win === M.me;
        cards.forEach((c, k) => {
          c.classList.remove('down');
          if (k === M.sec[M.me ^ 1]) c.classList.add('secret');
          if (by >= 0 && !ok && k === i) { c.classList.remove('secret'); c.classList.add('wrong'); }
        });
        M.down.clear();
        (mine ? sfx.win : sfx.lose)();
        let pts = 0;
        if (mine && M.mode === 'cpu') {
          const asked = M.hist.filter(h => h.by === 0 && h.q).length;
          pts = Math.round(Math.max(50, 400 - asked * 25) * ({ easy: .5, normal: 1, hard: 1.5 }[opt.diff]));
          if (!M.scored) { M.scored = true; api.submit(pts); }
        }
        api.score(pts);
        renderSide();
        const theirName = GW_CAST[M.sec[M.me ^ 1]], myName = GW_CAST[M.sec[M.me]];
        const reason = why === 'resign' ? (mine ? 'Your opponent resigned.' : 'You resigned.') : why === 'left' ? 'Your opponent left the game.' : by === M.me ? (ok ? `You guessed ${theirName.name} correctly!` : `You guessed ${GW_CAST[i].name}, but it was ${theirName.name}.`) : (ok ? `${M.mode === 'cpu' ? 'The CPU' : esc(M.names[by])} guessed ${myName.name}.` : `${M.mode === 'cpu' ? 'The CPU' : esc(M.names[by])} guessed ${GW_CAST[i].name} and was wrong.`);
        const online = M.mode === 'online';
        const result = () => {
          if (M.phase !== 'over') return;
          showPane(`<div class="bx-box"><p class="bx-kick">${mine ? 'Victory' : 'Defeat'}</p><h3>${mine ? 'You win!' : 'You lose'}</h3><p>${reason}</p>
<div class="gw-big"><div><div class="gw-bf">${faces[M.sec[M.me ^ 1]]}</div><small>Their person<b>${theirName.name}</b></small></div><div><div class="gw-bf">${faces[M.sec[M.me]]}</div><small>Your person<b>${myName.name}</b></small></div></div>
${pts ? `<p><b>${pts} pts</b></p>` : ''}
${online && why === 'left' ? `<button class="bx-btn" data-a="cpu">Play vs computer</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button>` : online ? `<button class="bx-btn" data-a="rematch">${M.rematch[M.me] ? 'Waiting for opponent…' : 'Rematch'}</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button>` : `<button class="bx-btn" data-a="again">Play again</button><button class="bx-btn alt" data-a="menu">Menu</button>`}
<button class="bx-btn alt sm" data-a="look">Look at the board</button></div>`, a => {
            if (a === 'again') { hidePane(); beginPick(); }
            else if (a === 'menu') showMenu();
            else if (a === 'look') showPane('<div class="bx-row" style="position:absolute;left:0;right:0;bottom:8px;justify-content:center"><button class="bx-btn sm" data-a="back">Results</button></div>', result, 'clear');
            else if (a === 'rematch') rematch();
            else if (a === 'cpu') { leaveOnline(); M.mode = 'cpu'; beginPick(); }
            else if (a === 'lobby') startOnline();
          });
        };
        api.timeout(result, 1300);
      }

      function leaveOnline() {
        HS.clear();
        if (killNet) { killNet(); killNet = null; }
        M.hooked = false;
        try { api.net.close(); } catch (e) {}
        M.mode = 'cpu'; M.role = 'local'; M.me = 0; netEl.hidden = true;
      }
      function rematch() {
        if (M.rematch[M.me]) return;
        M.rematch[M.me] = true;
        api.net.send({ t: 'rm' });
        showPane(`<div class="bx-box"><h3>Rematch requested</h3><p>Waiting for ${esc(M.names[M.me ^ 1])}…</p><button class="bx-btn alt" data-a="lobby">Back to lobby</button></div>`, a => { if (a === 'lobby') startOnline(); });
        checkRematch();
      }
      function checkRematch() {
        if (M.role !== 'host' || !(M.rematch[0] && M.rematch[1])) return;
        beginPick(); M.mode = 'online';
        api.net.send({ t: 'again' });
      }

      function snapFor() {
        return { phase: M.phase, hist: M.hist, turn: M.turn, sec: M.phase === 'over' ? M.sec : null, mine: M.sec[1], hostReady: M.sec[0] >= 0, names: M.names, rm: M.rematch };
      }

      const HS = mkHs(api, 'guess-who');
      function saveHost() {
        if (M.mode !== 'online' || M.role !== 'host') return;
        if (M.phase === 'play') HS.save({ sec: M.sec, hist: M.hist, turn: M.turn, down: [...M.down] });
        else if (M.phase === 'over') HS.clear();
      }
      function offerResume(sv, pl) {
        showPane(hsPane('Online', `Saved game: ${sv.hist.length} question${sv.hist.length === 1 ? '' : 's'} asked.`), a => {
          if (a === 'new') { HS.clear(); hidePane(); return; }
          M.sec = sv.sec.slice(); M.hist = sv.hist; M.mySel = M.sec[0]; M.down = new Set(sv.down); M.busy = false; M.rematch = [false, false];
          M.turn = M.hist.length ? M.hist[M.hist.length - 1].by ^ 1 : sv.turn; M.phase = 'play';
          hidePane(); renderBoard(); renderSide();
          api.toast('Game resumed');
          api.timeout(() => { if (M.mode === 'online' && M.role === 'host' && pl[1]) api.net.sendTo(pl[1].id, { t: 'snap', ...snapFor() }); }, 500);
        });
      }

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        killNet = mkNetHooks(api, {
          data: onData,
          leave: () => {
            if (M.mode !== 'online' || M.role !== 'host' || M.phase === 'menu') return;
            if (M.phase === 'play') { api.net.send({ t: 'end', by: -1, i: -1, ok: false, win: 0, sec: M.sec.slice(), why: 'left' }); endGame(0, -1, -1, false, 'left'); }
            else showPane(`<div class="bx-box"><p class="bx-kick">Online</p><h3>Opponent left</h3><p>${esc(M.names[1])} left the game.</p><button class="bx-btn" data-a="cpu">Play vs computer</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button></div>`, a => { if (a === 'cpu') { leaveOnline(); M.mode = 'cpu'; beginPick(); } else startOnline(); });
          },
          rejoin: p => {
            if (M.mode !== 'online' || M.role !== 'host' || !p) return;
            api.net.sendTo(p.id, { t: 'snap', ...snapFor() });
          },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') { M.keepDown = M.phase === 'play' ? [...M.down] : null; startOnline(); } },
          close: reason => {
            if (M.mode !== 'online' || M.role !== 'guest') return;
            M.tok++; sfx.lose();
            const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            showPane(`<div class="bx-box"><p class="bx-kick">Online</p><h3>${h}</h3><p>The game cannot continue.</p><button class="bx-btn" data-a="room">Online lobby</button><button class="bx-btn alt" data-a="cpu">Play vs computer</button></div>`, a => { if (a === 'room') startOnline(); else { leaveOnline(); M.mode = 'cpu'; beginPick(); } });
          }
        });
        api.interval(saveHost, 1000);
        window.addEventListener('pagehide', saveHost);
        api.interval(() => {
          if (M.mode !== 'online') { netEl.hidden = true; return; }
          netEl.hidden = false;
          const on = api.net.connected;
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · host' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }

      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        M.mode = 'online'; M.role = null; M.phase = 'menu'; M.down.clear(); renderBoard(); renderSide(); hidePane();
        const r = await api.net.room({ title: 'Guess Who', sizes: [2], defaultSize: 2, min: 2, max: 2 });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { leaveOnline(); return showMenu(); }
        const pl = r.players || [];
        beginPick();
        M.mode = 'online'; M.role = r.role; M.me = r.role === 'host' ? 0 : 1;
        M.names = [pl[0] ? pl[0].name : 'Host', pl[1] ? pl[1].name : 'Guest'];
        renderSide();
        if (r.role === 'host' && pl.length > 1) { const sv = HS.load(); if (sv && sv.sec && sv.hist) offerResume(sv, pl); }
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (M.role === 'host') {
          if (d.t === 'pick') {
            if (M.phase !== 'pick' || M.sec[1] >= 0 || !Number.isInteger(d.i) || d.i < 0 || d.i > 23) return;
            M.sec[1] = d.i; M.ready[1] = true;
            api.net.sendTo(from, { t: 'ok' });
            if (M.sec[0] >= 0) tryStartOnline(); else { api.toast(esc(M.names[1]) + ' is ready'); }
            renderSide();
          } else if (d.t === 'ask') {
            if (M.phase !== 'play' || M.turn !== 1 || M.busy || !gwQ(d.q) || M.hist.some(h => h.by === 1 && h.q === d.q)) { api.net.sendTo(from, { t: 'snap', ...snapFor(), mine: M.sec[1] }); return; }
            qaEvent(1, d.q, answerFor(1, d.q));
          } else if (d.t === 'guess') {
            if (M.phase !== 'play' || M.turn !== 1 || M.busy || !Number.isInteger(d.i) || d.i < 0 || d.i > 23) return;
            finishGuess(1, d.i);
          } else if (d.t === 'resign') {
            if (M.phase !== 'play') return;
            api.net.send({ t: 'end', by: -1, i: -1, ok: false, win: 0, sec: M.sec.slice(), why: 'resign' });
            endGame(0, -1, -1, false, 'resign');
          } else if (d.t === 'rm') { M.rematch[1] = true; if (M.phase === 'over') api.toast(esc(M.names[1]) + ' wants a rematch'); checkRematch(); }
        } else {
          if (d.t === 'start') { startPlay(d.first); }
          else if (d.t === 'qa') {
            if (!gwQ(d.q)) return;
            const h = { by: d.by, q: d.q, a: !!d.a };
            M.hist.push(h); M.busy = false;
            showQA(h, d.turn);
          } else if (d.t === 'end') {
            M.sec = d.sec.slice();
            if (d.by >= 0) M.hist.push({ by: d.by, guess: d.i, ok: d.ok });
            endGame(d.win, d.by, d.i, d.ok, d.why || '');
          } else if (d.t === 'ok') { renderSide(); }
          else if (d.t === 'again') { beginPick(); M.mode = 'online'; M.role = 'guest'; M.me = 1; renderSide(); }
          else if (d.t === 'rm') { M.rematch[0] = true; if (M.phase === 'over') api.toast(esc(M.names[0]) + ' wants a rematch'); }
          else if (d.t === 'snap') {
            M.names = d.names || M.names; M.rematch = d.rm || M.rematch; M.busy = false;
            if (d.phase === 'play' || d.phase === 'over') {
              M.sec = [-1, d.mine ?? -1]; M.mySel = d.mine ?? M.mySel; M.hist = d.hist || []; M.turn = d.turn; M.phase = 'play'; if (M.keepDown) { M.down = new Set(M.keepDown); M.keepDown = null; }
              hidePane(); renderBoard(); renderSide();
              if (d.phase === 'over' && d.sec) { M.sec = d.sec; endGame(M.hist.length && M.hist[M.hist.length - 1].ok === true ? M.hist[M.hist.length - 1].by : (M.hist.length ? M.hist[M.hist.length - 1].by ^ 1 : 0), -1, -1, false, ''); }
            } else {
              M.phase = 'pick'; if (d.mine >= 0) { M.mySel = d.mine; M.ready[1] = true; }
              hidePane(); renderBoard(); renderSide();
            }
          }
        }
      }

      renderSide();
      if (api.net.invite) startOnline(); else showMenu();
      root._gw = { M, opt };
      return { destroy() { window.removeEventListener('pagehide', saveHost); M.tok++; if (killNet) killNet(); } };
    }
  });

  const CL_W = 24, CL_H = 25;
  const CL_SUS = [
    { n: 'Miss Scarlett', s: 'Scarlett', c: '#d8352f', d: '#8f1d1a', st: [16, 0] },
    { n: 'Colonel Mustard', s: 'Mustard', c: '#e8b820', d: '#946d06', st: [23, 8] },
    { n: 'Mrs. White', s: 'White', c: '#f3f1ea', d: '#a29fb0', st: [16, 24] },
    { n: 'Mr. Green', s: 'Green', c: '#2f9e5a', d: '#176b38', st: [7, 24] },
    { n: 'Mrs. Peacock', s: 'Peacock', c: '#2f72d6', d: '#16438c', st: [0, 18] },
    { n: 'Professor Plum', s: 'Plum', c: '#8f45b8', d: '#55227c', st: [0, 5] }
  ];
  const CL_WEP = ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench'];
  const CL_RM = [
    { n: 'Study', r: [0, 0, 6, 3], d: [[6, 4], [7, 1]], pass: 8, col: '#8a5a3a', col2: '#6d4228' },
    { n: 'Hall', r: [9, 0, 14, 6], d: [[8, 4], [11, 7], [12, 7]], pass: -1, col: '#b8934a', col2: '#8f6e2c' },
    { n: 'Lounge', r: [17, 0, 23, 5], d: [[17, 6], [16, 2]], pass: 6, col: '#b04a42', col2: '#82312b' },
    { n: 'Library', r: [0, 7, 5, 11], d: [[6, 9], [3, 6]], pass: -1, col: '#6f5a8f', col2: '#4f3d6d' },
    { n: 'Dining Room', r: [16, 9, 23, 14], d: [[15, 11], [16, 8], [20, 15]], pass: -1, col: '#c5782f', col2: '#97541a' },
    { n: 'Billiard Room', r: [0, 13, 5, 17], d: [[6, 15], [3, 12], [3, 18]], pass: -1, col: '#2f8456', col2: '#1d5e3a' },
    { n: 'Conservatory', r: [0, 20, 5, 24], d: [[4, 19]], pass: 2, col: '#58a86a', col2: '#3a7e4b' },
    { n: 'Ballroom', r: [8, 18, 15, 24], d: [[9, 17], [14, 17], [7, 21], [16, 21]], pass: -1, col: '#c78fc4', col2: '#9a5f98' },
    { n: 'Kitchen', r: [18, 19, 23, 24], d: [[19, 18]], pass: 0, col: '#5f8ab8', col2: '#3f6794' }
  ];
  const CL_CELLAR = [9, 8, 14, 14];
  const CL_CARDS = CL_SUS.map(s => s.n).concat(CL_WEP, CL_RM.map(r => r.n));
  const clCat = c => c < 6 ? 0 : c < 12 ? 1 : 2;
  const CL_CAT_LO = [0, 6, 12], CL_CAT_HI = [6, 12, 21];
  const CL_KIND = new Int8Array(CL_W * CL_H).fill(-1);
  CL_RM.forEach((m, i) => { for (let r = m.r[1]; r <= m.r[3]; r++) for (let c = m.r[0]; c <= m.r[2]; c++) CL_KIND[r * CL_W + c] = i; });
  for (let r = CL_CELLAR[1]; r <= CL_CELLAR[3]; r++) for (let c = CL_CELLAR[0]; c <= CL_CELLAR[2]; c++) CL_KIND[r * CL_W + c] = 9;
  const CL_DOOR = new Map();
  CL_RM.forEach((m, i) => m.d.forEach(([c, r]) => CL_DOOR.set(r * CL_W + c, i)));
  const CL_NB = [];
  for (let id = 0; id < CL_W * CL_H; id++) {
    const a = [];
    if (CL_KIND[id] === -1) {
      const c = id % CL_W, r = (id / CL_W) | 0;
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dc, dr]) => {
        const x = c + dc, y = r + dr;
        if (x >= 0 && y >= 0 && x < CL_W && y < CL_H && CL_KIND[y * CL_W + x] === -1) a.push(y * CL_W + x);
      });
    }
    CL_NB.push(a);
  }
  const CL_ROOM_POS = ri => 1000 + ri;
  const clPosName = p => p >= 1000 ? CL_RM[p - 1000].n : 'the corridor';

  let CL_DIST = null;
  function clDist() {
    if (CL_DIST) return CL_DIST;
    CL_DIST = CL_RM.map(m => {
      const d = new Int16Array(CL_W * CL_H).fill(999), q = [];
      m.d.forEach(([c, r]) => { d[r * CL_W + c] = 0; q.push(r * CL_W + c); });
      for (let h = 0; h < q.length; h++) for (const nb of CL_NB[q[h]]) if (d[nb] === 999) { d[nb] = d[q[h]] + 1; q.push(nb); }
      return d;
    });
    return CL_DIST;
  }

  function clReach(V, seat) {
    const ch = V.seats[seat].ch, from = V.pawn[ch], roll = V.roll || 0;
    const blocked = new Set();
    V.pawn.forEach((p, i) => { if (i !== ch && p < 1000) blocked.add(p); });
    const dist = new Map(), prev = new Map(), q = [], res = new Map();
    const startRoom = from >= 1000 ? from - 1000 : -1;
    const push = (cell, d, pr) => { if (dist.has(cell) || blocked.has(cell)) return; dist.set(cell, d); prev.set(cell, pr); q.push(cell); };
    if (startRoom >= 0) CL_RM[startRoom].d.forEach(([c, r]) => push(r * CL_W + c, 1, -1));
    else { dist.set(from, 0); prev.set(from, -1); q.push(from); }
    const pathTo = c => { const p = []; for (let x = c; x !== -1; x = prev.get(x)) p.push(x); return p.reverse(); };
    for (let h = 0; h < q.length; h++) {
      const c = q[h], d = dist.get(c);
      if (d > roll) continue;
      if (d >= 1 && c !== from) res.set(c, pathTo(c));
      const dr = CL_DOOR.get(c);
      if (dr !== undefined && dr !== startRoom && d + 1 <= roll && !res.has(1000 + dr)) res.set(1000 + dr, pathTo(c).concat(1000 + dr));
      if (d >= roll) continue;
      for (const nb of CL_NB[c]) push(nb, d + 1, c);
    }
    return res;
  }

  function clNew(spec) {
    const seats = spec.slice().sort((a, b) => a.ch - b.ch).map(s => ({ ch: s.ch, bot: !!s.bot, lvl: s.lvl || 'normal', name: s.name || CL_SUS[s.ch].n, uid: s.uid == null ? null : s.uid, alive: true, hand: [] }));
    const n = seats.length;
    const sus = shuffle([0, 1, 2, 3, 4, 5]), wep = shuffle([6, 7, 8, 9, 10, 11]), rm = shuffle([12, 13, 14, 15, 16, 17, 18, 19, 20]);
    const env = [sus[0], wep[0], rm[0]];
    shuffle([...sus.slice(1), ...wep.slice(1), ...rm.slice(1)]).forEach((c, i) => seats[i % n].hand.push(c));
    seats.forEach(s => s.hand.sort((a, b) => a - b));
    return {
      n, seats, env, pawn: CL_SUS.map(s => s.st[1] * CL_W + s.st[0]), weap: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 6),
      turn: 0, ph: 'start', roll: 0, dice: [0, 0], pulled: Array(n).fill(false), canSug: false, did: false, pend: null, evs: [], fx: [], winner: -1, over: false, why: '', ver: 0, turns: 0
    };
  }

  const clNext = (G, from) => { for (let i = 1; i <= G.n; i++) { const s = (from + i) % G.n; if (G.seats[s].alive) return s; } return from; };

  function clView(G, p) {
    return {
      n: G.n, me: p, seats: G.seats.map(s => ({ ch: s.ch, bot: s.bot, alive: s.alive, hs: s.hand.length, name: s.name, uid: s.uid })),
      hand: G.seats[p].hand.slice(), pawn: G.pawn.slice(), weap: G.weap.slice(), turn: G.turn, ph: G.ph, roll: G.roll, dice: G.dice.slice(),
      pulled: G.pulled.slice(), canSug: G.canSug, did: G.did, over: G.over, winner: G.winner, why: G.why, env: G.over ? G.env.slice() : null, ver: G.ver, turns: G.turns,
      pend: G.pend && G.pend.q === p ? { by: G.pend.by, s: G.pend.s, w: G.pend.w, r: G.pend.r, q: G.pend.q, m: G.pend.m.slice() } : G.pend ? { by: G.pend.by, s: G.pend.s, w: G.pend.w, r: G.pend.r, q: G.pend.q } : null,
      evs: G.evs.map(e => e.k === 'sug' && e.by !== p ? { ...e, card: undefined } : e)
    };
  }

  function clRoomOf(G, seat) { const p = G.pawn[G.seats[seat].ch]; return p >= 1000 ? p - 1000 : -1; }

  function clResolveShow(G) {
    const pd = G.pend, cs = [pd.s, pd.w, pd.r];
    while (pd.i < pd.order.length) {
      const q = pd.order[pd.i], m = G.seats[q].hand.filter(c => cs.includes(c));
      if (!m.length) { pd.skip.push(q); pd.i++; continue; }
      if (m.length === 1) return clFinishShow(G, q, m[0]);
      pd.q = q; pd.m = m; G.ph = 'show';
      return false;
    }
    return clFinishShow(G, -1, -1);
  }
  function clFinishShow(G, q, card) {
    const pd = G.pend;
    G.evs.push({ k: 'sug', by: pd.by, s: pd.s, w: pd.w, r: pd.r, skip: pd.skip.slice(), showed: q, card: q >= 0 ? card : undefined });
    G.pend = null; G.ph = 'post'; G.canSug = false; G.did = true; G.ver++;
    return { done: true, q, card };
  }

  function clAct(G, seat, a) {
    if (G.over) return false;
    const me = G.seats[seat];
    if (a.t === 'show') {
      if (G.ph !== 'show' || !G.pend || G.pend.q !== seat || !G.pend.m.includes(a.c)) return false;
      clFinishShow(G, seat, a.c); G.ver++; return true;
    }
    if (seat !== G.turn || G.ph === 'show') return false;
    if (a.t === 'roll') {
      if (G.ph !== 'start') return false;
      const d1 = 1 + rnd(6), d2 = 1 + rnd(6);
      G.dice = [d1, d2]; G.roll = d1 + d2; G.pulled[seat] = false;
      G.evs.push({ k: 'roll', by: seat, a: d1, b: d2 });
      G.fx.push({ k: 'dice', a: d1, b: d2 });
      const V = { seats: G.seats, pawn: G.pawn, roll: G.roll };
      if (clReach(V, seat).size) G.ph = 'move'; else { G.ph = 'post'; G.canSug = false; G.evs.push({ k: 'stuck', by: seat }); }
      G.ver++; return true;
    }
    if (a.t === 'pass') {
      const ri = clRoomOf(G, seat);
      if (G.ph !== 'start' || ri < 0 || CL_RM[ri].pass < 0) return false;
      const to = CL_RM[ri].pass;
      G.pawn[me.ch] = 1000 + to; G.pulled[seat] = false;
      G.fx.push({ k: 'mv', ch: me.ch, path: [1000 + ri, 1000 + to], pass: true });
      G.evs.push({ k: 'pass', by: seat, to });
      G.ph = 'post'; G.canSug = true; G.ver++; return true;
    }
    if (a.t === 'stay') {
      const ri = clRoomOf(G, seat);
      if (G.ph !== 'start' || ri < 0 || !G.pulled[seat]) return false;
      G.pulled[seat] = false; G.ph = 'post'; G.canSug = true; G.ver++; return true;
    }
    if (a.t === 'move') {
      if (G.ph !== 'move') return false;
      const res = clReach({ seats: G.seats, pawn: G.pawn, roll: G.roll }, seat), path = res.get(a.to);
      if (!path) return false;
      G.pawn[me.ch] = a.to;
      G.fx.push({ k: 'mv', ch: me.ch, path });
      G.evs.push({ k: 'move', by: seat, to: a.to });
      G.ph = 'post'; G.canSug = a.to >= 1000; G.ver++; return true;
    }
    if (a.t === 'sug') {
      const ri = clRoomOf(G, seat);
      if (G.ph !== 'post' || !G.canSug || G.did || ri < 0) return false;
      if (!(a.s >= 0 && a.s < 6 && a.w >= 6 && a.w < 12)) return false;
      const sc = a.s;
      const old = G.pawn[sc];
      if (old !== 1000 + ri) {
        G.pawn[sc] = 1000 + ri;
        G.fx.push({ k: 'mv', ch: sc, path: [old, 1000 + ri], pull: true });
        const sSeat = G.seats.findIndex(s => s.ch === sc);
        if (sSeat >= 0 && sSeat !== seat) G.pulled[sSeat] = true;
      }
      const wi = a.w - 6;
      G.fx.push({ k: 'wp', w: wi, from: G.weap[wi], to: ri });
      G.weap[wi] = ri;
      const order = []; for (let i = 1; i < G.n; i++) order.push((seat + i) % G.n);
      G.pend = { by: seat, s: sc, w: a.w, r: 12 + ri, order, i: 0, skip: [], q: -1, m: [] };
      G.fx.push({ k: 'sug', by: seat, s: sc, w: a.w, r: 12 + ri });
      G.ph = 'show';
      clResolveShow(G);
      G.ver++;
      return true;
    }
    if (a.t === 'acc') {
      if (!(a.s >= 0 && a.s < 6 && a.w >= 6 && a.w < 12 && a.r >= 12 && a.r < 21)) return false;
      const ok = a.s === G.env[0] && a.w === G.env[1] && a.r === G.env[2];
      G.evs.push({ k: 'acc', by: seat, s: a.s, w: a.w, r: a.r, ok });
      G.fx.push({ k: 'acc', by: seat, ok });
      if (ok) { G.over = true; G.winner = seat; G.why = 'solved'; G.ph = 'over'; }
      else {
        me.alive = false;
        G.evs.push({ k: 'out', by: seat });
        if (G.seats.filter(s => s.alive).length <= 1) {
          const w = G.seats.findIndex(s => s.alive);
          G.over = true; G.winner = w; G.why = 'last'; G.ph = 'over';
        } else clTurnEnd(G);
      }
      G.ver++; return true;
    }
    if (a.t === 'end') {
      if (G.ph !== 'post') return false;
      clTurnEnd(G); G.ver++; return true;
    }
    return false;
  }
  function clTurnEnd(G) {
    G.turn = clNext(G, G.turn); G.ph = 'start'; G.roll = 0; G.canSug = false; G.did = false; G.turns++;
  }

  function clKnow(V) {
    const n = V.n, me = V.me;
    const has = Array.from({ length: n }, () => new Int8Array(21).fill(-1)), env = new Int8Array(21).fill(-1), cl = [];
    const hs = V.seats.map(s => s.hs);
    for (let c = 0; c < 21; c++) has[me][c] = 0;
    V.hand.forEach(c => { for (let p = 0; p < n; p++) has[p][c] = p === me ? 1 : 0; env[c] = 0; });
    V.evs.forEach(e => {
      if (e.k !== 'sug') return;
      const cs = [e.s, e.w, e.r];
      e.skip.forEach(q => cs.forEach(c => { if (has[q][c] === -1) has[q][c] = 0; }));
      if (e.showed >= 0) {
        if (e.card !== undefined) { for (let p = 0; p < n; p++) has[p][e.card] = p === e.showed ? 1 : 0; }
        else if (e.showed !== me) cl.push({ p: e.showed, cs });
      }
    });
    const K = { n, me, has, env, cl, hs };
    clProp(K);
    return K;
  }
  function clProp(K) {
    const { n, has, env, hs } = K;
    let ch = true, guard = 0;
    const set = (p, c, v) => { if (has[p][c] !== v) { has[p][c] = v; ch = true; } };
    while (ch && guard++ < 60) {
      ch = false;
      for (let c = 0; c < 21; c++) {
        let holder = -1, none = 0;
        for (let p = 0; p < n; p++) { if (has[p][c] === 1) holder = p; else if (has[p][c] === 0) none++; }
        if (holder >= 0) { for (let p = 0; p < n; p++) if (p !== holder) set(p, c, 0); if (env[c] !== 0) { env[c] = 0; ch = true; } }
        else if (none === n && env[c] !== 1) { env[c] = 1; ch = true; }
      }
      for (let p = 0; p < n; p++) {
        let one = 0, unk = 0;
        for (let c = 0; c < 21; c++) { if (has[p][c] === 1) one++; else if (has[p][c] === -1) unk++; }
        if (one >= hs[p] && unk) { for (let c = 0; c < 21; c++) if (has[p][c] === -1) set(p, c, 0); }
        else if (one + unk === hs[p] && unk) { for (let c = 0; c < 21; c++) if (has[p][c] === -1) set(p, c, 1); }
      }
      K.cl = K.cl.map(x => {
        if (x.cs.some(c => has[x.p][c] === 1)) return null;
        const r = x.cs.filter(c => has[x.p][c] !== 0);
        if (r.length === 1) { set(x.p, r[0], 1); return null; }
        return r.length ? { p: x.p, cs: r } : null;
      }).filter(Boolean);
      for (let k = 0; k < 3; k++) {
        let known = -1, open = [];
        for (let c = CL_CAT_LO[k]; c < CL_CAT_HI[k]; c++) { if (env[c] === 1) known = c; if (env[c] !== 0) open.push(c); }
        if (known < 0 && open.length === 1) { env[open[0]] = 1; ch = true; known = open[0]; }
        if (known >= 0) for (let c = CL_CAT_LO[k]; c < CL_CAT_HI[k]; c++) if (c !== known && env[c] !== 0) { env[c] = 0; ch = true; }
      }
    }
  }
  const clSolved = K => { const s = []; for (let k = 0; k < 3; k++) { let f = -1; for (let c = CL_CAT_LO[k]; c < CL_CAT_HI[k]; c++) if (K.env[c] === 1) f = c; if (f < 0) return null; s.push(f); } return s; };

  function clSample(K, N) {
    const { n, has, env, cl, hs } = K;
    const known = new Int8Array(21).fill(-1), cap0 = hs.slice();
    for (let c = 0; c < 21; c++) { for (let p = 0; p < n; p++) if (has[p][c] === 1) { known[c] = p; cap0[p]--; } if (env[c] === 1) known[c] = -2; }
    const catHas = [0, 1, 2].map(k => { for (let c = CL_CAT_LO[k]; c < CL_CAT_HI[k]; c++) if (known[c] === -2) return true; return false; });
    const pe = new Float64Array(21), tri = new Map();
    const hold = new Int8Array(21), cp = new Int16Array(n);
    let ok = 0, tries = 0;
    while (ok < N && tries < N * 8) {
      tries++;
      hold.set(known); for (let p = 0; p < n; p++) cp[p] = cap0[p];
      let fail = false;
      const ord = shuffle(cl.map((x, i) => i));
      for (const i of ord) {
        const { p, cs } = cl[i];
        if (cs.some(c => hold[c] === p)) continue;
        const cand = cs.filter(c => hold[c] === -1 && has[p][c] !== 0);
        if (!cand.length || cp[p] <= 0) { fail = true; break; }
        const c = pick(cand); hold[c] = p; cp[p]--;
      }
      if (fail) continue;
      for (let k = 0; k < 3 && !fail; k++) {
        if (catHas[k]) continue;
        const cand = [];
        for (let c = CL_CAT_LO[k]; c < CL_CAT_HI[k]; c++) if (hold[c] === -1 && env[c] !== 0) cand.push(c);
        if (!cand.length) fail = true; else hold[pick(cand)] = -2;
      }
      if (fail) continue;
      const rest = []; for (let c = 0; c < 21; c++) if (hold[c] === -1) rest.push(c);
      shuffle(rest);
      for (const c of rest) {
        let tot = 0; for (let p = 0; p < n; p++) if (cp[p] > 0 && has[p][c] !== 0) tot += cp[p];
        if (!tot) { fail = true; break; }
        let r = Math.random() * tot, sel = -1;
        for (let p = 0; p < n; p++) if (cp[p] > 0 && has[p][c] !== 0) { r -= cp[p]; if (r <= 0) { sel = p; break; } }
        if (sel < 0) for (let p = 0; p < n; p++) if (cp[p] > 0 && has[p][c] !== 0) sel = p;
        hold[c] = sel; cp[sel]--;
      }
      if (fail) continue;
      ok++;
      const t = [];
      for (let c = 0; c < 21; c++) if (hold[c] === -2) { pe[c]++; t.push(c); }
      const key = t.join(','); tri.set(key, (tri.get(key) || 0) + 1);
    }
    if (!ok) {
      for (let c = 0; c < 21; c++) pe[c] = env[c] === 1 ? 1 : env[c] === 0 ? 0 : 1 / 6;
      return { ok: 0, pe, top: null, topP: 0 };
    }
    for (let c = 0; c < 21; c++) pe[c] /= ok;
    let best = null, bn = 0;
    tri.forEach((v, k) => { if (v > bn) { bn = v; best = k; } });
    return { ok, pe, top: best.split(',').map(Number), topP: bn / ok };
  }

  const CL_LVL = {
    easy: { N: 50, thr: .995, rnd: .5, bluff: 0, mv: .4 },
    normal: { N: 110, thr: .88, rnd: .12, bluff: .08, mv: .08 },
    hard: { N: 220, thr: .8, rnd: 0, bluff: .12, mv: 0 }
  };

  function clBot(V, level, mem) {
    const L = CL_LVL[level] || CL_LVL.normal, me = V.me, K = clKnow(V);
    const mine = new Set(V.hand);
    const pos = V.pawn[V.seats[me].ch], ri = pos >= 1000 ? pos - 1000 : -1;
    const P = () => clSample(K, L.N);
    const resolved = c => { for (let p = 0; p < K.n; p++) if (K.has[p][c] === 1) return true; return false; };
    const roomVal = (r, pe) => { const c = 12 + r; if (K.env[c] === 1) return .12; if (!resolved(c)) return .55 + pe[c]; return .32; };
    const accuse = pr => {
      const s = clSolved(K);
      if (s) return { t: 'acc', s: s[0], w: s[1], r: s[2] };
      if (pr.top && pr.topP >= L.thr) return { t: 'acc', s: pr.top[0], w: pr.top[1], r: pr.top[2] };
      return null;
    };
    if (V.ph === 'show') {
      const seen = (mem.shown && mem.shown[V.pend.by]) || new Set();
      const m = V.pend.m, pre = m.filter(c => seen.has(c));
      const c = pre.length ? pick(pre) : pick(m);
      mem.shown = mem.shown || {}; (mem.shown[V.pend.by] = mem.shown[V.pend.by] || new Set()).add(c);
      return { t: 'show', c };
    }
    if (V.ph === 'start') {
      const pr = P(), a = accuse(pr);
      if (a) return a;
      if (ri >= 0 && CL_RM[ri].pass >= 0) {
        const to = CL_RM[ri].pass;
        if (roomVal(to, pr.pe) > roomVal(ri, pr.pe) + .25 && !(V.pulled[me] && roomVal(ri, pr.pe) > .5)) return { t: 'pass' };
      }
      if (ri >= 0 && V.pulled[me] && roomVal(ri, pr.pe) >= .45) return { t: 'stay' };
      return { t: 'roll' };
    }
    if (V.ph === 'move') {
      const pr = P(), res = clReach(V, me), D = clDist();
      let best = null, bs = -1e9;
      res.forEach((path, to) => {
        let s;
        if (to >= 1000) s = 100 * roomVal(to - 1000, pr.pe) + 5 - path.length * .2 + Math.random() * 3;
        else {
          let m = 1e9;
          for (let r = 0; r < 9; r++) { const v = D[r][to] - 7 * roomVal(r, pr.pe); if (v < m) m = v; }
          s = -m - 20 + Math.random() * 2;
        }
        if (s > bs) { bs = s; best = to; }
      });
      if (Math.random() < L.mv) best = pick([...res.keys()]);
      return { t: 'move', to: best };
    }
    if (V.ph === 'post') {
      if (V.canSug && !V.did && ri >= 0) {
        const pr = P();
        const sc = (c, rng) => { if (mine.has(c)) return -1; if (resolved(c)) return .01 + Math.random() * .01; const p = pr.pe[c]; return p * (1 - p) + .04 + Math.random() * (rng ? .5 : .02); };
        const choose = (lo, hi) => {
          let b = lo, bs = -9;
          for (let c = lo; c < hi; c++) { const s = sc(c, Math.random() < L.rnd); if (s > bs) { bs = s; b = c; } }
          if (bs < 0 || Math.random() < L.bluff) { const own = V.hand.filter(c => c >= lo && c < hi); if (own.length && (bs < .02 || Math.random() < L.bluff)) b = pick(own); }
          return b;
        };
        return { t: 'sug', s: choose(0, 6), w: choose(6, 12) };
      }
      const pr = P(), a = accuse(pr);
      if (a) return a;
      return { t: 'end' };
    }
    return null;
  }

  const CL_ICO = [
    c => `<ellipse cx="20" cy="36" rx="12" ry="3" fill="rgba(0,0,0,.18)"/><path d="M8 35c0-10 5-14 12-14s12 4 12 14z" fill="${c.c}" stroke="${c.d}" stroke-width="1.6"/><circle cx="20" cy="13" r="8" fill="${c.c}" stroke="${c.d}" stroke-width="1.6"/><ellipse cx="17" cy="10" rx="3" ry="2" fill="#fff" opacity=".5"/><text x="20" y="33" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="10" fill="${c.c === '#f3f1ea' || c.c === '#e8b820' ? c.d : '#fff'}">${c.s[0]}</text>`
  ];
  const CL_WICO = [
    '<ellipse cx="20" cy="34" rx="9" ry="3" fill="#b98a2e"/><rect x="17.5" y="14" width="5" height="19" rx="1.5" fill="#e6c25a"/><rect x="15" y="12" width="10" height="3" rx="1.5" fill="#c9a03c"/><path d="M20 2c4 4 4 7 0 9c-4-2-4-5 0-9z" fill="#ff9a2a"/><path d="M20 5c2 2 2 4 0 5c-2-1-2-3 0-5z" fill="#ffe27a"/>',
    '<path d="M20 2l4 20h-8z" fill="#cfd5de" stroke="#7d8796" stroke-width="1.2"/><path d="M20 3v19" stroke="#fff" stroke-width="1" opacity=".7"/><rect x="11" y="22" width="18" height="4" rx="2" fill="#8a5a2a"/><rect x="17.5" y="26" width="5" height="9" rx="2" fill="#5c3a1c"/><circle cx="20" cy="37" r="2.4" fill="#c9a03c"/>',
    '<g transform="rotate(-35 20 20)"><rect x="4" y="15" width="32" height="10" rx="3" fill="#8e98a6" stroke="#566070" stroke-width="1.2"/><rect x="4" y="15" width="32" height="3.5" rx="2" fill="#c6ced9" opacity=".7"/><rect x="2" y="13.5" width="5" height="13" rx="2" fill="#6b7686"/><rect x="33" y="13.5" width="5" height="13" rx="2" fill="#6b7686"/></g>',
    '<rect x="4" y="12" width="26" height="6" rx="2" fill="#5b6270"/><circle cx="25" cy="16" r="6" fill="#7a8394" stroke="#3b414d" stroke-width="1.2"/><circle cx="25" cy="16" r="2" fill="#3b414d"/><path d="M26 20l8 14-6 2-6-12z" fill="#7a4a24" stroke="#4a2a12" stroke-width="1"/><path d="M12 18v5h5" fill="none" stroke="#3b414d" stroke-width="1.5"/>',
    '<path d="M8 28c-4-8 4-20 14-18s12 12 4 18-18 6-18 0 8-14 16-12" fill="none" stroke="#a97c3c" stroke-width="4" stroke-linecap="round"/><path d="M8 28c-4-8 4-20 14-18s12 12 4 18-18 6-18 0 8-14 16-12" fill="none" stroke="#e0bd7c" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4"/>',
    '<g transform="rotate(40 20 20)"><rect x="17" y="12" width="6" height="26" rx="3" fill="#8a94a4" stroke="#566070"/><path d="M12 3h6v7h4V3h6v10a6 6 0 0 1-4 5.6H16A6 6 0 0 1 12 13z" fill="#aab3c0" stroke="#566070" stroke-width="1.2"/></g>'
  ];
  const clBooks = () => { let s = ''; const cols = ['#c0392b', '#2e86c1', '#27ae60', '#d4ac0d', '#8e44ad', '#e67e22']; for (let r = 0; r < 3; r++) { let x = 6; for (let i = 0; i < 6; i++) { const w = 3 + (i * 7 + r * 3) % 3; s += `<rect x="${x}" y="${7 + r * 10}" width="${w}" height="8" fill="${cols[(i + r * 2) % 6]}"/>`; x += w + 1; } } return s; };
  const CL_RICO = [
    '<path d="M4 10q8-3 16 2q8-5 16-2v22q-8-3-16 2q-8-5-16-2z" fill="#f3e6c4" stroke="#6d4228" stroke-width="1.6"/><path d="M20 12v22" stroke="#6d4228" stroke-width="1.6"/><path d="M8 16q5-1 9 1M8 21q5-1 9 1M23 17q5-2 9-1M23 22q5-2 9-1" stroke="#9c7a56" stroke-width="1.2" fill="none"/>',
    '<path d="M8 36V16a12 12 0 0 1 24 0v20z" fill="#8a5a2c" stroke="#4a2c10" stroke-width="1.6"/><path d="M13 36V17a7 7 0 0 1 14 0v19z" fill="#a8723a"/><circle cx="24" cy="26" r="1.6" fill="#f2d377"/>',
    '<rect x="6" y="14" width="28" height="12" rx="4" fill="#b04a42" stroke="#6b1f1a" stroke-width="1.5"/><rect x="3" y="18" width="7" height="14" rx="3" fill="#c25a50" stroke="#6b1f1a" stroke-width="1.5"/><rect x="30" y="18" width="7" height="14" rx="3" fill="#c25a50" stroke="#6b1f1a" stroke-width="1.5"/><rect x="8" y="24" width="24" height="9" rx="3" fill="#cf6a5f" stroke="#6b1f1a" stroke-width="1.5"/>',
    '<rect x="4" y="4" width="32" height="32" rx="2" fill="#6f4b2a" stroke="#3d2711" stroke-width="1.5"/><path d="M4 16h32M4 26h32" stroke="#3d2711" stroke-width="1.5"/>' + clBooks(),
    '<circle cx="20" cy="20" r="11" fill="#fff" stroke="#9aa3b5" stroke-width="1.6"/><circle cx="20" cy="20" r="7" fill="none" stroke="#c9cfdc" stroke-width="1.2"/><path d="M4 8v26M2 8v7M6 8v7" stroke="#8d96a8" stroke-width="1.6" fill="none"/><path d="M36 8c3 4 3 14 0 16v10" stroke="#8d96a8" stroke-width="2" fill="none"/>',
    '<circle cx="20" cy="21" r="14" fill="#222a36"/><circle cx="20" cy="21" r="7.5" fill="#fff"/><text x="20" y="25" text-anchor="middle" font-size="11" font-weight="900" fill="#222a36" font-family="Arial">8</text><ellipse cx="14" cy="12" rx="4" ry="2.5" fill="#fff" opacity=".35"/>',
    '<path d="M12 38h16l-2-10H14z" fill="#b8653a" stroke="#6c3a1c" stroke-width="1.4"/><path d="M20 28V10" stroke="#2f7a3f" stroke-width="2.4"/><path d="M20 22c-8 0-12-6-12-12c8 0 12 4 12 12zM20 18c8 0 12-6 12-12c-8 0-12 4-12 12z" fill="#4fb26a" stroke="#2a7a40" stroke-width="1.3"/>',
    '<path d="M15 30V9l16-3v21" fill="none" stroke="#5a2d73" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="11.5" cy="31" rx="5.5" ry="4" fill="#7b3fa3" stroke="#5a2d73" stroke-width="1.4"/><ellipse cx="27.5" cy="28" rx="5.5" ry="4" fill="#7b3fa3" stroke="#5a2d73" stroke-width="1.4"/>',
    '<rect x="8" y="16" width="24" height="16" rx="3" fill="#8f99aa" stroke="#4a5262" stroke-width="1.5"/><rect x="6" y="12" width="28" height="5" rx="2.5" fill="#aab3c3" stroke="#4a5262" stroke-width="1.5"/><path d="M8 22h-5M32 22h5" stroke="#4a5262" stroke-width="3" stroke-linecap="round"/><path d="M15 8q2-3 0-6M21 8q2-3 0-6M27 8q2-3 0-6" stroke="#cbd2de" stroke-width="1.6" fill="none"/>'
  ];
  function clIconSvg(c, sz) {
    const body = c < 6 ? CL_ICO[0](CL_SUS[c]) : c < 12 ? CL_WICO[c - 6] : CL_RICO[c - 12];
    return `<svg viewBox="0 0 40 40" width="${sz || 40}" height="${sz || 40}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }
  const CL_IMG = {};
  function clImg(c) {
    if (CL_IMG[c]) return CL_IMG[c];
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clIconSvg(c, 80));
    return (CL_IMG[c] = im);
  }
  const clCardHtml = (c, cls, extra) => {
    const col = c < 6 ? CL_SUS[c].c : c < 12 ? '#8e98a6' : CL_RM[c - 12].col;
    return `<span class="cl-cd ${cls || ''}" style="--cc:${col}">${clIconSvg(c, 34)}<b>${esc(CL_CARDS[c])}</b>${extra || ''}</span>`;
  };

  function clPaintBoard(CELL, PAD) {
    const W = CL_W * CELL + PAD * 2, H = CL_H * CELL + PAD * 2;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    let g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#6e4122'); g.addColorStop(.5, '#8b5a2c'); g.addColorStop(1, '#4b2a12');
    x.fillStyle = g; rr(x, 0, 0, W, H, 16); x.fill();
    x.save(); rr(x, 0, 0, W, H, 16); x.clip();
    for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(${Math.random() < .5 ? '30,12,0' : '255,220,170'},${.04 + Math.random() * .06})`; x.lineWidth = 1 + Math.random() * 2; const y = Math.random() * H; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(W * .3, y + (Math.random() - .5) * 14, W * .7, y + (Math.random() - .5) * 14, W, y); x.stroke(); }
    x.restore();
    x.strokeStyle = '#d4a94a'; x.lineWidth = 2; rr(x, PAD - 6, PAD - 6, W - PAD * 2 + 12, H - PAD * 2 + 12, 6); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 3; rr(x, PAD - 9, PAD - 9, W - PAD * 2 + 18, H - PAD * 2 + 18, 8); x.stroke();
    x.fillStyle = '#2b3a2e'; x.fillRect(PAD, PAD, CL_W * CELL, CL_H * CELL);
    const px = c => PAD + c * CELL, py = r => PAD + r * CELL;
    for (let r = 0; r < CL_H; r++) for (let c = 0; c < CL_W; c++) {
      if (CL_KIND[r * CL_W + c] !== -1) continue;
      x.fillStyle = (r + c) & 1 ? '#efe1b8' : '#e7d6a6';
      x.fillRect(px(c), py(r), CELL, CELL);
      x.strokeStyle = 'rgba(110,88,40,.55)'; x.lineWidth = 1; x.strokeRect(px(c) + .5, py(r) + .5, CELL - 1, CELL - 1);
    }
    CL_SUS.forEach(s => {
      const c = s.st[0], r = s.st[1];
      x.fillStyle = s.c; x.fillRect(px(c) + 1, py(r) + 1, CELL - 2, CELL - 2);
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(px(c) + 1, py(r) + CELL - 6, CELL - 2, 5);
      x.strokeStyle = s.d; x.lineWidth = 2; x.strokeRect(px(c) + 1.5, py(r) + 1.5, CELL - 3, CELL - 3);
    });
    CL_RM.forEach((m, i) => {
      const x0 = px(m.r[0]), y0 = py(m.r[1]), w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
      g = x.createLinearGradient(x0, y0, x0 + w, y0 + h); g.addColorStop(0, m.col); g.addColorStop(1, m.col2);
      x.fillStyle = g; x.fillRect(x0, y0, w, h);
      x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip();
      if (i === 0 || i === 3 || i === 4) {
        for (let yy = y0; yy < y0 + h; yy += 9) { x.fillStyle = (((yy - y0) / 9) | 0) & 1 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.06)'; x.fillRect(x0, yy, w, 9); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(x0, yy, w, 1); }
        for (let yy = y0; yy < y0 + h; yy += 9) { const off = ((((yy - y0) / 9) | 0) * 37) % 60; for (let xx = x0 + off; xx < x0 + w; xx += 60) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(xx, yy, 1, 9); } }
      } else if (i === 1 || i === 7 || i === 8 || i === 6) {
        const s = i === 7 ? 16 : 13;
        for (let yy = 0; yy * s < h; yy++) for (let xx = 0; xx * s < w; xx++) { if ((xx + yy) & 1) { x.fillStyle = i === 1 ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.14)'; x.fillRect(x0 + xx * s, y0 + yy * s, s, s); } else { x.fillStyle = 'rgba(0,0,0,.10)'; x.fillRect(x0 + xx * s, y0 + yy * s, s, s); } }
      } else {
        x.strokeStyle = 'rgba(255,225,150,.55)'; x.lineWidth = 2; x.setLineDash([6, 4]); x.strokeRect(x0 + 6, y0 + 6, w - 12, h - 12); x.setLineDash([]);
        for (let yy = y0 + 10; yy < y0 + h - 10; yy += 12) for (let xx = x0 + 10 + (((yy - y0) / 12 | 0) & 1) * 6; xx < x0 + w - 10; xx += 12) { x.fillStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.arc(xx, yy, 1.6, 0, TAU); x.fill(); }
      }
      g = x.createLinearGradient(x0, y0, x0, y0 + 14); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(x0, y0, w, 14);
      g = x.createLinearGradient(x0, y0, x0 + 12, y0); g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(x0, y0, 12, h);
      x.restore();
      x.strokeStyle = '#2d1a0a'; x.lineWidth = 4; x.strokeRect(x0, y0, w, h);
      x.strokeStyle = 'rgba(255,230,170,.5)'; x.lineWidth = 1; x.strokeRect(x0 + 2.5, y0 + 2.5, w - 5, h - 5);
      x.save();
      x.font = `900 ${Math.round(CELL * .46)}px Georgia,"Times New Roman",serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 4; x.shadowOffsetY = 1;
      x.fillStyle = '#fff4d4';
      const name = m.n.toUpperCase();
      if (x.letterSpacing !== undefined) x.letterSpacing = '1px';
      x.fillText(name, x0 + w / 2, y0 + CELL * .55);
      x.restore();
    });
    CL_RM.forEach((m, i) => {
      m.d.forEach(([c, r]) => {
        const id = r * CL_W + c;
        let dx = 0, dy = 0;
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([a, b]) => { const xx = c + a, yy = r + b; if (xx >= 0 && yy >= 0 && xx < CL_W && yy < CL_H && CL_KIND[yy * CL_W + xx] === i) { dx = a; dy = b; } });
        x.fillStyle = 'rgba(214,160,40,.55)'; x.fillRect(px(c) + 1, py(r) + 1, CELL - 2, CELL - 2);
        const cx = px(c) + CELL / 2, cy = py(r) + CELL / 2;
        x.fillStyle = '#6d3c14';
        x.beginPath(); x.moveTo(cx + dx * CELL * .28 - dy * CELL * .2, cy + dy * CELL * .28 + dx * CELL * .2); x.lineTo(cx + dx * CELL * .28 + dy * CELL * .2, cy + dy * CELL * .28 - dx * CELL * .2); x.lineTo(cx + dx * CELL * .02, cy + dy * CELL * .02); x.closePath(); x.fill();
        const ex = cx + dx * CELL / 2, ey = cy + dy * CELL / 2;
        x.save(); x.translate(ex, ey); if (dx) x.rotate(Math.PI / 2);
        x.fillStyle = '#f2dc9a'; x.strokeStyle = '#4a2a0c'; x.lineWidth = 2;
        rr(x, -CELL * .38, -3.5, CELL * .76, 7, 2); x.fill(); x.stroke();
        x.fillStyle = '#c9972e'; x.beginPath(); x.arc(CELL * .24, 0, 1.8, 0, TAU); x.fill();
        x.restore();
      });
      if (m.pass >= 0) {
        const x0 = px(m.r[0]), y0 = py(m.r[1]), w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
        const left = m.r[0] === 0, top = m.r[1] === 0;
        const cx = left ? x0 + 15 : x0 + w - 15, cy = top ? y0 + 15 : y0 + h - 15;
        x.save(); x.translate(cx, cy);
        x.fillStyle = '#1b1208'; x.strokeStyle = '#f2d377'; x.lineWidth = 1.5;
        x.beginPath(); x.arc(0, 0, 10.5, 0, TAU); x.fill(); x.stroke();
        const t = CL_RM[m.pass], ang = Math.atan2((t.r[1] + t.r[3]) / 2 - (m.r[1] + m.r[3]) / 2, (t.r[0] + t.r[2]) / 2 - (m.r[0] + m.r[2]) / 2);
        x.rotate(ang); x.strokeStyle = '#f2d377'; x.fillStyle = '#f2d377'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(-6, 0); x.lineTo(5, 0); x.stroke();
        x.beginPath(); x.moveTo(8, 0); x.lineTo(2, -4.5); x.lineTo(2, 4.5); x.closePath(); x.fill();
        x.restore();
      }
    });
    const cx0 = px(CL_CELLAR[0]), cy0 = py(CL_CELLAR[1]), cw = (CL_CELLAR[2] - CL_CELLAR[0] + 1) * CELL, ch = (CL_CELLAR[3] - CL_CELLAR[1] + 1) * CELL;
    g = x.createRadialGradient(cx0 + cw / 2, cy0 + ch / 2, 10, cx0 + cw / 2, cy0 + ch / 2, cw * .75);
    g.addColorStop(0, '#34425a'); g.addColorStop(1, '#141a28');
    x.fillStyle = g; x.fillRect(cx0, cy0, cw, ch);
    x.strokeStyle = '#d4a94a'; x.lineWidth = 3; x.strokeRect(cx0 + 4, cy0 + 4, cw - 8, ch - 8);
    x.strokeStyle = 'rgba(212,169,74,.4)'; x.lineWidth = 1; x.strokeRect(cx0 + 9, cy0 + 9, cw - 18, ch - 18);
    x.strokeStyle = '#05070c'; x.lineWidth = 4; x.strokeRect(cx0, cy0, cw, ch);
    x.save(); x.translate(cx0 + cw / 2, cy0 + ch / 2 + CELL * 1.5);
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 8; x.shadowOffsetY = 3;
    x.fillStyle = '#f4ecd2'; rr(x, -CELL * 1.15, -CELL * .72, CELL * 2.3, CELL * 1.44, 4); x.fill();
    x.shadowColor = 'transparent';
    x.strokeStyle = '#b09a68'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-CELL * 1.15, -CELL * .72); x.lineTo(0, CELL * .1); x.lineTo(CELL * 1.15, -CELL * .72); x.stroke();
    x.beginPath(); x.moveTo(-CELL * 1.15, CELL * .72); x.lineTo(-CELL * .35, 0); x.moveTo(CELL * 1.15, CELL * .72); x.lineTo(CELL * .35, 0); x.stroke();
    x.fillStyle = '#b3282a'; x.beginPath(); x.arc(0, CELL * .1, CELL * .26, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(-CELL * .08, CELL * .02, CELL * .08, 0, TAU); x.fill();
    x.restore();
    x.save(); x.font = `900 ${Math.round(CELL * .5)}px Georgia,serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#e9cf88'; x.shadowColor = 'rgba(0,0,0,.7)'; x.shadowBlur = 4;
    if (x.letterSpacing !== undefined) x.letterSpacing = '3px';
    x.fillText('CASE FILE', cx0 + cw / 2, cy0 + CELL * 1.2); x.restore();
    return cv;
  }

  function clPawn(c, cx, cy, R, ch, lift) {
    const s = CL_SUS[ch];
    c.save();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(cx, cy + R * .95, R * .85, R * .3, 0, 0, TAU); c.fill();
    cy -= lift || 0;
    let g = c.createLinearGradient(cx - R, cy, cx + R, cy);
    g.addColorStop(0, s.c); g.addColorStop(.45, s.c); g.addColorStop(1, s.d);
    c.fillStyle = g; c.strokeStyle = s.d; c.lineWidth = Math.max(1.5, R * .14);
    c.beginPath(); c.moveTo(cx - R * .8, cy + R * .95); c.quadraticCurveTo(cx - R * .75, cy + R * .1, cx - R * .22, cy - R * .12); c.lineTo(cx + R * .22, cy - R * .12); c.quadraticCurveTo(cx + R * .75, cy + R * .1, cx + R * .8, cy + R * .95); c.closePath(); c.fill(); c.stroke();
    g = c.createRadialGradient(cx - R * .15, cy - R * .6, R * .05, cx, cy - R * .5, R * .5);
    g.addColorStop(0, '#fff'); g.addColorStop(.25, s.c); g.addColorStop(1, s.d);
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy - R * .5, R * .46, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(cx - R * .38, cy + R * .3, R * .1, R * .35, .2, 0, TAU); c.fill();
    c.restore();
  }

  function clDie(c, x, y, s, v, rot) {
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 8; c.shadowOffsetY = 4;
    const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, '#fff'); g.addColorStop(1, '#dcdfe8');
    c.fillStyle = g; rr(c, -s / 2, -s / 2, s, s, s * .2); c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = '#9aa0b4'; c.lineWidth = 1.5; c.stroke();
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    c.fillStyle = '#1d2230';
    (P[v] || []).forEach(([a, b]) => { c.beginPath(); c.arc(a * s * .26, b * s * .26, s * .08, 0, TAU); c.fill(); });
    c.restore();
  }

  const CL_CSS = BASE_CSS.replace(/@/g, 'clue') + `
.gm-clue{--bx:#8a2535;--accent:#8a2535}
.gm-clue .cl-wrap{width:100%;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start}
.gm-clue .cl-bd{position:relative;flex:1 1 440px;max-width:680px;min-width:0;display:flex;justify-content:center;align-items:flex-start}
.gm-clue .cl-bd canvas{display:block;border-radius:16px;box-shadow:0 12px 30px rgba(40,22,6,.4);touch-action:manipulation}
.gm-clue .cl-side{flex:0 1 340px;min-width:260px;display:flex;flex-direction:column;gap:10px}
.gm-clue .cl-card{background:#fff;border:1px solid #e3e5f0;border-radius:16px;padding:10px 12px;box-shadow:0 4px 14px rgba(30,30,70,.07)}
.gm-clue .cl-stat{display:flex;align-items:center;gap:10px;font:800 15px/1.25 var(--sans)}
.gm-clue .cl-stat i{flex:none;width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 3px rgba(0,0,0,.08);border:2px solid rgba(0,0,0,.25)}
.gm-clue .cl-stat small{display:block;font:600 12px/1.3 var(--sans);color:#6b7190}
.gm-clue .cl-h{margin:0 0 6px;font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#6b7190;display:flex;justify-content:space-between;align-items:center}
.gm-clue .cl-seats{display:flex;flex-direction:column;gap:3px}
.gm-clue .cl-seat{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:9px;font:700 12.5px var(--sans);color:#2a2f45}
.gm-clue .cl-seat.turn{background:#fff3d2;box-shadow:inset 0 0 0 2px #e2b02c}
.gm-clue .cl-seat.out{opacity:.45;text-decoration:line-through}
.gm-clue .cl-seat i{flex:none;width:14px;height:14px;border-radius:50%;border:2px solid rgba(0,0,0,.3)}
.gm-clue .cl-seat span{margin-left:auto;font:700 11px var(--sans);color:#6b7190}
.gm-clue .cl-acts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.gm-clue .cl-b{min-height:42px;padding:0 10px;border-radius:12px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 13.5px var(--sans)}
.gm-clue .cl-b.p{background:#8a2535;border-color:#8a2535;color:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.22)}
.gm-clue .cl-b.r{background:#fff1f0;border-color:#e08a82;color:#a8281d}
.gm-clue .cl-b.w{grid-column:1/-1}
.gm-clue .cl-b:disabled{opacity:.38;pointer-events:none}
.gm-clue .cl-hand{display:flex;flex-wrap:wrap;gap:5px}
.gm-clue .cl-cd{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 4px;border-radius:10px;background:#fbfaf4;border:2px solid var(--cc,#bbb);font:800 12px/1.15 var(--sans);color:#2a2f45;text-align:left}
.gm-clue .cl-cd svg{flex:none}
.gm-clue .cl-cd b{font-weight:800}
.gm-clue button.cl-cd{cursor:pointer}
.gm-clue button.cl-cd.on{background:#ffe9a6;box-shadow:0 0 0 3px rgba(226,176,44,.55)}
.gm-clue .cl-tabs{display:flex;gap:6px;margin-bottom:8px}
.gm-clue .cl-tabs button{flex:1;min-height:36px;border-radius:10px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 13px var(--sans)}
.gm-clue .cl-tabs button.on{background:#8a2535;border-color:#8a2535;color:#fff}
.gm-clue .cl-nb{overflow:auto;max-height:330px}
.gm-clue .cl-nb table{width:100%;border-collapse:collapse;font:700 11.5px var(--sans);color:#2a2f45}
.gm-clue .cl-nb th{position:sticky;top:0;background:#fff;padding:3px 2px;font:900 10px var(--sans);color:#6b7190;z-index:1}
.gm-clue .cl-nb th i{display:block;margin:0 auto 1px;width:12px;height:12px;border-radius:50%;border:2px solid rgba(0,0,0,.3)}
.gm-clue .cl-nb td{padding:0;border-bottom:1px solid #eceef6;text-align:center;height:24px}
.gm-clue .cl-nb td.n{text-align:left;padding-left:4px;white-space:nowrap}
.gm-clue .cl-nb td.n svg{vertical-align:middle;margin-right:3px}
.gm-clue .cl-nb tr.sec td{background:#f1f2f9;font:900 10px var(--sans);letter-spacing:1px;text-transform:uppercase;color:#6b7190;height:18px;text-align:left;padding-left:5px}
.gm-clue .cl-nb td.k{cursor:pointer;min-width:26px}
.gm-clue .cl-nb td.k:hover{background:#fff6d6}
.gm-clue .cl-nb td.y{color:#1b9a52;font-weight:900}
.gm-clue .cl-nb td.x{color:#c8332a;opacity:.7}
.gm-clue .cl-nb td.m{color:#3369c9;font-style:italic;opacity:.8}
.gm-clue .cl-nb tr.mine td.n{opacity:.55}
.gm-clue .cl-nb td.case{background:#fff3d2;font-weight:900;color:#a8281d}
.gm-clue .cl-nb td.case.y{background:#ffdc7a}
.gm-clue .cl-log{max-height:330px;overflow:auto;font:600 12.5px/1.4 var(--sans);color:#3d4360}
.gm-clue .cl-log div{padding:4px 0;border-bottom:1px dashed #eceef6}
.gm-clue .cl-log em{font-style:normal;font-weight:800}
.gm-clue .cl-log .pr{color:#8a2535}
.gm-clue .cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:6px 0}
.gm-clue .cl-grid button.cl-cd{width:100%}
.gm-clue .cl-sol{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}
.gm-clue .cl-big{display:flex;flex-direction:column;align-items:center;gap:4px;width:104px;padding:10px 6px;border-radius:12px;border:3px solid var(--cc,#999);background:#fffdf4;font:800 12px/1.2 var(--sans);box-shadow:0 6px 14px rgba(0,0,0,.2)}
.gm-clue .cl-big.rev{animation:cl-flip .7s both}
@keyframes cl-flip{0%{transform:rotateY(90deg) scale(.8);opacity:0}100%{transform:none;opacity:1}}
.gm-clue .cl-lbl{text-align:left;margin:8px 0 2px;font:900 11px var(--sans);letter-spacing:1.2px;text-transform:uppercase;color:#6b7190}
.gm-clue .cl-warn{margin:6px 0;padding:6px 10px;border-radius:10px;background:#fff1f0;color:#a8281d;font:700 12.5px/1.4 var(--sans)}
.gm-clue .cl-seg{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}
.gm-clue .cl-seg button{flex:1 0 auto;min-height:40px;border-radius:12px;border:2px solid #d5d8e8;background:#fff;color:#2a2f45;font:800 13.5px var(--sans);padding:0 10px;display:flex;align-items:center;justify-content:center;gap:6px}
.gm-clue .cl-seg button.on{background:#8a2535;border-color:#8a2535;color:#fff}
.gm-clue .cl-seg button i{width:14px;height:14px;border-radius:50%;border:2px solid rgba(0,0,0,.3)}
@media(max-width:700px){.gm-clue .cl-side{flex:1 1 100%}.gm-clue .cl-nb,.gm-clue .cl-log{max-height:260px}}
`;

  const CL_HELP = `<div class="bx-rules">
<p><b>Goal.</b> A murder was committed. Find out WHO did it, with WHAT weapon and in WHICH room, before the other detectives do.</p>
<p><b>Setup.</b> One suspect, one weapon and one room are sealed in the case file. The other 18 cards are dealt to the players. Your cards are innocent: nobody in your hand can be part of the solution.</p>
<p><b>Your turn.</b> Roll the dice and move up to that many squares along the corridors. Enter a room through one of its doors (rooms end your move, you cannot cross them). The corner rooms have secret passages: use one instead of rolling to jump to the opposite corner room.</p>
<p><b>Suggest.</b> In a room, suggest a suspect and a weapon. The suspect and the weapon are moved into the room. Clockwise from you, the first player holding one of the three named cards must secretly show you one of them. Everybody sees who showed a card, but only you see which one. A suspect moved by a suggestion may stay in that room next turn and suggest again.</p>
<p><b>Notebook.</b> Your detective notebook fills in automatically with everything that is certain, and you can mark your own hunches by clicking a square.</p>
<p><b>Accuse.</b> When you are sure, accuse: name any suspect, weapon and room. If the case file matches, you win. If not, you are out of the game. You stay on the board and still show cards for the others.</p>
<p><b>Keys.</b> <kbd>R</kbd> roll, <kbd>S</kbd> suggest or stay, <kbd>A</kbd> accuse, <kbd>E</kbd> end turn, <kbd>N</kbd> notebook, <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick a square, <kbd>Enter</kbd> move.</p></div>`;

  const CL_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="27" cy="27" r="14"/><path d="M37 37l15 15"/><path d="M22 28l4 4 8-9"/></svg>';

  Ameplay.register({
    id: 'clue',
    title: 'Clue',
    category: 'Board',
    tint: '#8a2535',
    blurb: 'Who did it, with what, and where? Roll, move, suggest, deduce and name the culprit before the other detectives.',
    help: '<kbd>R</kbd> roll · click a glowing square or room to move · <kbd>S</kbd> suggest · <kbd>A</kbd> accuse · your notebook fills itself in · a wrong accusation knocks you out',
    width: 1060,
    format: v => v + ' pts',
    icon: CL_ICON,
    _t: { clNew, clAct, clView, clBot, clKnow, clSample, clReach },
    css: CL_CSS,
    mount(root, api) {
      const au = mkAudio(api);
      const sv = api.load() || {};
      const opt = { diff: ['easy', 'normal', 'hard'].includes(sv.diff) ? sv.diff : 'normal', opp: clamp(sv.opp | 0 || 3, 2, 5), ch: sv.ch >= 0 && sv.ch < 6 ? sv.ch | 0 : 0, fast: !!sv.fast };
      const save = () => api.save(opt);
      const CELL = 26, PAD = 16, W = CL_W * CELL + PAD * 2, H = CL_H * CELL + PAD * 2;
      const wrap = mk('div', 'cl-wrap'), bd = mk('div', 'cl-bd'), side = mk('div', 'cl-side');
      wrap.append(bd, side); root.append(wrap);
      const { canvas, ctx, toLocal } = api.canvas(W, H, bd);
      const board = clPaintBoard(CELL, PAD);
      const netEl = mk('div', 'bx-net', '<i></i><span>Online</span>'); netEl.hidden = true; root.append(netEl);
      const pane = mk('div', 'bx-pane'); pane.hidden = true; root.append(pane);
      let paneCb = null, killNet = null;
      const M = { mode: 'cpu', role: 'local', phase: 'menu', G: null, V: null, K: null, me: 0, tab: 'nb', notes: {}, tok: 0, pt: 0, rm: new Set(), away: {}, mem: [], hooked: false, scored: false, dests: null, dl: [], sel: -1, hover: -1, dlg: null, shown: 0, evN: 0, revealed: 0 };
      const D = { anim: {}, wanim: {}, tokXY: {}, wepXY: {}, dice: { a: 1, b: 1, t0: -1e9, on: false }, busyUntil: 0, flash: [], ring: 0 };
      const now = () => performance.now();
      const spd = () => opt.fast ? .5 : 1;
      const sg = ch => CL_SUS[ch];
      const nmOf = (V, i) => { const s = V.seats[i]; return `<em style="color:${sg(s.ch).d}">${sg(s.ch).n}</em>`; };

      function showPane(html, cb, cls) { pane.className = 'bx-pane' + (cls ? ' ' + cls : ''); pane.innerHTML = html; pane.hidden = false; paneCb = cb || null; }
      function hidePane() { pane.hidden = true; paneCb = null; pane.innerHTML = ''; M.dlg = null; }
      api.on(pane, 'click', e => { const b = e.target.closest('[data-a]'); if (!b || !paneCb) return; au.unlock(); au.tone(520, .05, 'sine', .05); paneCb(b.dataset.a, b); });

      const sfx = {
        dice: () => { for (let i = 0; i < 7; i++) { au.noise(.05, .09, 1800 + Math.random() * 800, i * .08, 'bandpass'); au.tone(180 + Math.random() * 120, .04, 'square', .02, 0, i * .08); } },
        step: () => au.tone(330 + Math.random() * 50, .05, 'triangle', .05, 220),
        door: () => { au.noise(.28, .06, 500); au.tone(120, .25, 'sawtooth', .03, 90); },
        sug: () => { au.tone(392, .12, 'triangle', .06); au.tone(523, .2, 'triangle', .06, 0, .1); },
        reveal: () => { au.tone(784, .12, 'sine', .07); au.tone(1175, .3, 'sine', .07, 0, .1); },
        pass: () => { au.noise(.35, .05, 700); au.tone(200, .4, 'sine', .05, 700); },
        acc: () => { for (let i = 0; i < 6; i++) au.tone(110, .12, 'square', .05, 0, i * .09); },
        win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => au.tone(f, .3, 'triangle', .07, 0, i * .11)),
        lose: () => [392, 330, 262, 196].forEach((f, i) => au.tone(f, .35, 'sawtooth', .05, 0, i * .16)),
        tick: () => au.tone(880, .05, 'sine', .05)
      };

      const slotMaps = V => {
        const tp = {}, wp = {}, tl = Array.from({ length: 9 }, () => []), wl = Array.from({ length: 9 }, () => []);
        V.pawn.forEach((p, ch) => { if (p >= 1000) tl[p - 1000].push(ch); });
        V.weap.forEach((r, wi) => wl[r].push(wi));
        CL_RM.forEach((m, ri) => {
          const x0 = PAD + m.r[0] * CELL, y0 = PAD + m.r[1] * CELL, w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
          const lay = (list, sp, y, up, out) => {
            const per = Math.max(1, Math.floor((w - 14) / sp));
            list.forEach((it, k) => {
              const row = (k / per) | 0, col = k % per, cnt = Math.min(per, list.length - row * per);
              out[it] = [x0 + w / 2 + (col - (cnt - 1) / 2) * sp, up ? y - row * sp * .85 : y + row * sp * .9];
            });
          };
          lay(tl[ri], CELL * .88, y0 + CELL * 1.95, false, tp);
          lay(wl[ri], CELL * .74, y0 + h - CELL * .62, true, wp);
        });
        return { tp, wp };
      };
      const posXY = (V, sl, ch) => { const p = V.pawn[ch]; return p >= 1000 ? sl.tp[ch] : [PAD + (p % CL_W) * CELL + CELL / 2, PAD + ((p / CL_W) | 0) * CELL + CELL / 2]; };

      function startAnim(V, sl, ch, path, kind) {
        const from = D.tokXY[ch] || posXY(V, sl, ch);
        const to = posXY(V, sl, ch);
        const pts = [from];
        if (kind === 'step') path.forEach((p, i) => { if (i === path.length - 1) pts.push(to); else if (p < 1000) pts.push([PAD + (p % CL_W) * CELL + CELL / 2, PAD + ((p / CL_W) | 0) * CELL + CELL / 2]); });
        else pts.push(to);
        let len = 0; const seg = [];
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); len += d; }
        const dur = kind === 'step' ? clamp(len / CELL * 105, 260, 1600) : 750;
        D.anim[ch] = { pts, seg, len: Math.max(1, len), t0: now(), dur: dur * spd(), kind, last: -1 };
        D.busyUntil = Math.max(D.busyUntil, now() + dur * spd());
      }
      function animPos(a, t) {
        const p = clamp((t - a.t0) / a.dur, 0, 1);
        if (p >= 1) return null;
        const e = a.kind === 'step' ? p : easeIO(p);
        let d = e * a.len, i = 0;
        while (i < a.seg.length - 1 && d > a.seg[i]) { d -= a.seg[i]; i++; }
        const k = a.seg[i] ? clamp(d / a.seg[i], 0, 1) : 1;
        const x = lerp(a.pts[i][0], a.pts[i + 1][0], k), y = lerp(a.pts[i][1], a.pts[i + 1][1], k);
        const lift = a.kind === 'step' ? Math.abs(Math.sin(e * a.len / CELL * Math.PI)) * 5 : Math.sin(p * Math.PI) * 26;
        return { x, y, lift, step: a.kind === 'step' ? Math.floor(e * a.len / CELL) : 0, p };
      }

      const history = () => M.V ? M.V.evs : [];
      function pName(c) { return esc(CL_CARDS[c]); }
      function evHtml(e, V) {
        const w = e.by != null ? nmOf(V, e.by) : '';
        if (e.k === 'roll') return `${w} rolled <b>${e.a + e.b}</b>.`;
        if (e.k === 'move') return e.to >= 1000 ? `${w} entered the ${CL_RM[e.to - 1000].n}.` : `${w} moved.`;
        if (e.k === 'pass') return `${w} took the secret passage to the ${CL_RM[e.to].n}.`;
        if (e.k === 'stuck') return `${w} is boxed in and cannot move.`;
        if (e.k === 'sug') {
          let r = `${w} suggests <b>${pName(e.s)}</b> with the <b>${pName(e.w)}</b> in the <b>${pName(e.r)}</b>.`;
          if (e.showed < 0) r += ' <span class="pr">Nobody could disprove it!</span>';
          else if (e.by === V.me) r += ` <span class="pr">${nmOf(V, e.showed)} showed you <b>${pName(e.card)}</b>.</span>`;
          else r += ` <span class="pr">${nmOf(V, e.showed)} showed a card${e.showed === V.me ? ' (yours)' : ''}.</span>`;
          return r;
        }
        if (e.k === 'acc') return `${w} accuses <b>${pName(e.s)}</b>, <b>${pName(e.w)}</b>, <b>${pName(e.r)}</b>: <b>${e.ok ? 'CORRECT!' : 'wrong, out of the game.'}</b>`;
        if (e.k === 'left') return `${w} left; a bot takes over.`;
        return '';
      }

      function renderNotebook() {
        const V = M.V, K = M.K;
        if (!V || !K) return '';
        let h = '<div class="cl-nb"><table><thead><tr><th></th>';
        V.seats.forEach((s, i) => { h += `<th title="${esc(sg(s.ch).n)}"><i style="background:${sg(s.ch).c}"></i>${i === V.me ? 'You' : sg(s.ch).s.slice(0, 3)}</th>`; });
        h += '<th>Case</th></tr></thead><tbody>';
        const secs = ['Suspects', 'Weapons', 'Rooms'];
        for (let c = 0; c < 21; c++) {
          if (c === 0 || c === 6 || c === 12) h += `<tr class="sec"><td colspan="${V.n + 2}">${secs[clCat(c)]}</td></tr>`;
          const mine = V.hand.includes(c);
          h += `<tr class="${mine ? 'mine' : ''}"><td class="n">${clIconSvg(c, 20)}${esc(CL_CARDS[c])}</td>`;
          for (let p = 0; p < V.n; p++) {
            const a = K.has[p][c], note = M.notes[c + ',' + p] || '';
            let cl = 'k', t = '';
            if (a === 1) { cl += ' y'; t = '&#10003;'; } else if (a === 0) { cl += ' x'; t = '&#10005;'; }
            else if (note) { cl += ' m'; t = note === 'v' ? '&#10003;' : note === 'x' ? '&#10005;' : '?'; }
            h += `<td class="${cl}" data-c="${c}" data-p="${p}">${t}</td>`;
          }
          const ev = K.env[c];
          h += `<td class="case ${ev === 1 ? 'y' : ''}">${ev === 1 ? '&#9733;' : ev === 0 ? '' : ''}</td></tr>`;
        }
        return h + '</tbody></table></div>';
      }
      function renderLog() {
        const V = M.V; if (!V) return '';
        const items = V.evs.filter(e => e.k !== 'move' || e.to >= 1000).slice(-60).reverse().map(e => `<div>${evHtml(e, V)}</div>`).join('');
        return `<div class="cl-log">${items || '<div>The game is afoot.</div>'}</div>`;
      }

      function statusLine(V) {
        if (V.over) return [sg(V.seats[V.winner].ch).c, 'Case closed', `${sg(V.seats[V.winner].ch).n} solved it.`];
        const t = V.turn, s = V.seats[t], isMe = t === V.me;
        const who = isMe ? 'Your turn' : `${sg(s.ch).n}'s turn`;
        const col = sg(s.ch).c;
        if (V.ph === 'show') {
          const q = V.pend.q;
          return [col, q === V.me ? 'Show a card' : `${sg(V.seats[q].ch).s} must show a card`, q === V.me ? 'Pick which card to reveal in secret.' : `${sg(V.seats[V.pend.by].ch).s} made a suggestion.`];
        }
        if (!V.seats[V.me].alive && isMe) return [col, who, ''];
        const hints = { start: isMe ? 'Roll the dice, or accuse if you are sure.' : 'Rolling soon…', move: isMe ? `Rolled ${V.roll}. Pick a glowing square or room.` : `Rolled ${V.roll}…`, post: isMe ? (V.canSug && !V.did ? 'Make a suggestion, or end your turn.' : 'Accuse, or end your turn.') : 'Thinking…' };
        return [col, who, hints[V.ph] || ''];
      }

      function renderSide() {
        const V = M.V;
        if (!V || M.phase === 'menu') { side.innerHTML = ''; return; }
        const [col, h, sub] = statusLine(V);
        const mt = V.turn === V.me && V.ph !== 'show' && !V.over && V.seats[V.me].alive;
        const pos = V.pawn[V.seats[V.me].ch], ri = pos >= 1000 ? pos - 1000 : -1;
        let acts = '';
        if (mt) {
          if (V.ph === 'start') {
            acts += '<button class="cl-b p w" data-s="roll">Roll dice <kbd>R</kbd></button>';
            if (ri >= 0 && CL_RM[ri].pass >= 0) acts += `<button class="cl-b w" data-s="pass">Secret passage to ${CL_RM[ri].n}</button>`.replace(CL_RM[ri].n, CL_RM[CL_RM[ri].pass].n);
            if (ri >= 0 && V.pulled[V.me]) acts += '<button class="cl-b w" data-s="stay">Stay and suggest <kbd>S</kbd></button>';
          } else if (V.ph === 'move') acts += `<button class="cl-b w" disabled>Pick a glowing square</button>`;
          else if (V.ph === 'post') {
            acts += `<button class="cl-b p" data-s="sug" ${V.canSug && !V.did ? '' : 'disabled'}>Suggest <kbd>S</kbd></button><button class="cl-b" data-s="end">End turn <kbd>E</kbd></button>`;
          }
          acts += '<button class="cl-b r w" data-s="acc">Make an accusation <kbd>A</kbd></button>';
        }
        let seats = V.seats.map((s, i) => `<div class="cl-seat ${i === V.turn && !V.over ? 'turn' : ''} ${s.alive ? '' : 'out'}"><i style="background:${sg(s.ch).c}"></i>${esc(sg(s.ch).n)}${i === V.me ? ' (you)' : ''}<span>${s.bot ? 'bot' : esc(s.name && s.name !== sg(s.ch).n ? s.name : 'player')} · ${s.hs} cards</span></div>`).join('');
        side.innerHTML = `<div class="cl-card"><div class="cl-stat"><i style="background:${col}"></i><div>${h}<small>${sub}</small></div></div></div>
${acts ? `<div class="cl-card"><div class="cl-acts">${acts}</div></div>` : ''}
<div class="cl-card"><div class="cl-h">Your cards</div><div class="cl-hand">${V.hand.map(c => clCardHtml(c)).join('')}</div></div>
<div class="cl-card"><div class="cl-tabs"><button data-s="tab:nb" class="${M.tab === 'nb' ? 'on' : ''}">Notebook</button><button data-s="tab:log" class="${M.tab === 'log' ? 'on' : ''}">Log</button><button data-s="tab:pl" class="${M.tab === 'pl' ? 'on' : ''}">Players</button></div>
${M.tab === 'nb' ? renderNotebook() : M.tab === 'log' ? renderLog() : `<div class="cl-seats">${seats}</div>`}</div>
<div class="cl-card"><div class="cl-acts"><button class="cl-b" data-s="help">Rules</button><button class="cl-b" data-s="quit">Leave game</button></div></div>`;
      }

      api.on(side, 'click', e => {
        au.unlock();
        const td = e.target.closest('td.k');
        if (td && M.V) {
          const k = td.dataset.c + ',' + td.dataset.p, cyc = ['', '?', 'x', 'v'];
          M.notes[k] = cyc[(cyc.indexOf(M.notes[k] || '') + 1) % 4]; renderSide(); return;
        }
        const b = e.target.closest('[data-s]');
        if (!b) return;
        const s = b.dataset.s;
        if (s.startsWith('tab:')) { M.tab = s.slice(4); renderSide(); }
        else if (s === 'roll') act({ t: 'roll' });
        else if (s === 'pass') act({ t: 'pass' });
        else if (s === 'stay') act({ t: 'stay' });
        else if (s === 'end') act({ t: 'end' });
        else if (s === 'sug') dlgSug();
        else if (s === 'acc') dlgAcc();
        else if (s === 'help') showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Clue</h3>${CL_HELP}<button class="bx-btn" data-a="x">Back</button></div>`, () => hidePane());
        else if (s === 'quit') showPane(`<div class="bx-box"><h3>Leave the game?</h3><p>${M.mode === 'online' ? 'A bot will take your seat.' : 'Your progress will be lost.'}</p><button class="bx-btn" data-a="y">Leave</button><button class="bx-btn alt" data-a="n">Keep playing</button></div>`, a => { hidePane(); if (a === 'y') { if (M.mode === 'online') leaveOnline(); showMenu(); } });
      });

      function chipHtml(c, a, on) {
        const col = c < 6 ? CL_SUS[c].c : c < 12 ? '#8e98a6' : CL_RM[c - 12].col;
        return `<button type="button" class="cl-cd ${on ? 'on' : ''}" style="--cc:${col}" data-a="${a}">${clIconSvg(c, 30)}<b>${esc(CL_CARDS[c])}</b></button>`;
      }
      function dlgSug() {
        const V = M.V, pos = V.pawn[V.seats[V.me].ch];
        if (!(V.turn === V.me && V.ph === 'post' && V.canSug && !V.did && pos >= 1000)) return;
        M.dlg = { kind: 'sug', s: -1, w: -1 };
        drawDlg();
      }
      function dlgAcc() {
        const V = M.V;
        if (!(V.turn === V.me && V.ph !== 'show' && !V.over)) return;
        M.dlg = { kind: 'acc', s: -1, w: -1, r: -1 };
        drawDlg();
      }
      function drawDlg() {
        const d = M.dlg, V = M.V;
        if (!d) return;
        const pos = V.pawn[V.seats[V.me].ch];
        const sus = [0, 1, 2, 3, 4, 5].map(c => chipHtml(c, 's:' + c, d.s === c)).join('');
        const wep = [6, 7, 8, 9, 10, 11].map(c => chipHtml(c, 'w:' + c, d.w === c)).join('');
        let body;
        if (d.kind === 'sug') {
          const rc = 12 + pos - 1000;
          body = `<p class="bx-kick">Suggestion</p><h3>In the ${CL_RM[pos - 1000].n}</h3><p>Name a suspect and a weapon. They will be moved into the room.</p><div class="cl-lbl">Suspect</div><div class="cl-grid">${sus}</div><div class="cl-lbl">Weapon</div><div class="cl-grid">${wep}</div><div class="cl-lbl">Room</div><div class="cl-grid">${chipHtml(rc, 'x', true)}</div>
<button class="bx-btn" data-a="go" ${d.s >= 0 && d.w >= 0 ? '' : 'disabled'}>Make the suggestion</button><button class="bx-btn alt" data-a="cancel">Cancel</button>`;
        } else {
          const rm = [12, 13, 14, 15, 16, 17, 18, 19, 20].map(c => chipHtml(c, 'r:' + c, d.r === c)).join('');
          body = `<p class="bx-kick">Accusation</p><h3>Who did it?</h3><div class="cl-warn">A wrong accusation knocks you out of the game.</div><div class="cl-lbl">Suspect</div><div class="cl-grid">${sus}</div><div class="cl-lbl">Weapon</div><div class="cl-grid">${wep}</div><div class="cl-lbl">Room</div><div class="cl-grid">${rm}</div>
<button class="bx-btn" data-a="go" ${d.s >= 0 && d.w >= 0 && d.r >= 0 ? '' : 'disabled'}>Accuse</button><button class="bx-btn alt" data-a="cancel">Cancel</button>`;
        }
        const st = pane.scrollTop;
        showPane(`<div class="bx-box wide">${body}</div>`, a => {
          if (a === 'cancel') return hidePane();
          if (a === 'go') {
            const x = M.dlg; hidePane();
            if (x.kind === 'sug') act({ t: 'sug', s: x.s, w: x.w }); else act({ t: 'acc', s: x.s, w: x.w, r: x.r });
            return;
          }
          if (a === 'x') return;
          const [k, v] = a.split(':'); M.dlg[k] = +v; drawDlg();
        });
        pane.scrollTop = st;
      }
      function dlgShow() {
        const V = M.V, pd = V.pend;
        if (!pd || pd.q !== V.me || !pd.m) return;
        showPane(`<div class="bx-box"><p class="bx-kick">Disprove</p><h3>${sg(V.seats[pd.by].ch).n} suggests</h3><p><b>${pName(pd.s)}</b> with the <b>${pName(pd.w)}</b> in the <b>${pName(pd.r)}</b>.</p><p>You hold more than one of these. Choose the card to show, in secret.</p><div class="cl-grid">${pd.m.map(c => chipHtml(c, 'c:' + c, false)).join('')}</div></div>`, a => { hidePane(); act({ t: 'show', c: +a.slice(2) }); });
      }

      function act(a) {
        if (!M.V || M.V.over) return;
        if (M.mode === 'online' && M.role === 'guest') { api.net.send({ t: 'a', a }); return; }
        doAct(M.me, a);
      }
      function doAct(seat, a) {
        const G = M.G; if (!G) return false;
        const ok = clAct(G, seat, a);
        if (ok) publish();
        return ok;
      }
      function publish(first) {
        const G = M.G, fx = G.fx; G.fx = [];
        if (M.mode === 'online' && M.role === 'host') G.seats.forEach((s, i) => { if (s.uid != null && !s.bot && i !== M.me) api.net.sendTo(s.uid, { t: 'v', v: clView(G, i), fx, nw: !!first }); });
        onView(clView(G, M.me), fx, first);
        pump();
      }
      function pump() {
        const G = M.G;
        if (!G || G.over || M.role === 'guest') return;
        const seat = G.ph === 'show' ? G.pend.q : G.turn, s = G.seats[seat];
        if (!s.bot) return;
        const tk = ++M.pt, mt = M.tok;
        const quick = opt.fast || !G.seats[M.me].alive;
        const delay = Math.max(quick ? 200 : 650 * (G.ph === 'show' ? .8 : 1), D.busyUntil - now() + (quick ? 80 : 380));
        api.timeout(() => {
          if (tk !== M.pt || mt !== M.tok || !M.G || M.G.over) return;
          const V = clView(M.G, seat);
          const a = clBot(V, M.G.seats[seat].lvl, M.mem[seat] || (M.mem[seat] = {}));
          if (!a || !doAct(seat, a)) { if (!doAct(seat, { t: 'end' })) doAct(seat, { t: 'roll' }); }
        }, delay);
      }

      function onView(V, fx, first) {
        const prev = M.V;
        if (first || !prev || V.evs.length < prev.evs.length) { M.notes = {}; M.evN = first || !prev ? V.evs.length : 0; M.revealed = 0; D.anim = {}; D.wanim = {}; D.tokXY = {}; D.wepXY = {}; D.dice.on = false; }
        M.V = V; M.me = V.me; M.K = clKnow(V);
        const sl = slotMaps(V);
        fx.forEach(f => {
          if (f.k === 'dice') { D.dice = { a: f.a, b: f.b, t0: now(), on: true }; sfx.dice(); D.busyUntil = Math.max(D.busyUntil, now() + 900 * spd()); }
          else if (f.k === 'mv') { startAnim(V, sl, f.ch, f.path, f.pass || f.pull ? 'jump' : 'step'); if (f.pass) sfx.pass(); else if (f.path[f.path.length - 1] >= 1000) setTimeout(() => sfx.door(), 150); }
          else if (f.k === 'wp') { D.wanim[f.w] = { t0: now() + 150, dur: 700 * spd(), from: D.wepXY[f.w] }; D.busyUntil = Math.max(D.busyUntil, now() + 900 * spd()); }
          else if (f.k === 'sug') { sfx.sug(); D.flash.push({ ri: f.r - 12, t0: now() }); D.busyUntil = Math.max(D.busyUntil, now() + 1100 * spd()); }
          else if (f.k === 'acc') { sfx.acc(); D.busyUntil = Math.max(D.busyUntil, now() + 900); }
        });
        for (let i = M.evN; i < V.evs.length; i++) {
          const e = V.evs[i];
          if (e.k === 'sug' && e.by === V.me && e.showed >= 0 && M.revealed <= i) {
            M.revealed = i + 1;
            const who = sg(V.seats[e.showed].ch).n, tok = M.tok;
            api.timeout(() => { if (tok !== M.tok || !M.V || M.V.over || !pane.hidden) return; sfx.reveal(); showPane(`<div class="bx-box"><p class="bx-kick">Evidence</p><h3>${who} shows you</h3><div class="cl-sol"><div class="cl-big rev" style="--cc:${e.card < 6 ? CL_SUS[e.card].c : e.card < 12 ? '#8e98a6' : CL_RM[e.card - 12].col}">${clIconSvg(e.card, 64)}<span>${pName(e.card)}</span></div></div><p>This card is not part of the solution. Your notebook has been updated.</p><button class="bx-btn" data-a="ok">Got it</button></div>`, () => hidePane()); }, 1100 * spd());
          } else if (e.k === 'sug' && e.showed < 0 && e.by === V.me) api.toast('Nobody could disprove that!');
          else if (e.k === 'sug' && e.by !== V.me && e.showed === V.me) api.toast('You showed a card');
          if (e.k === 'out' && e.by === V.me) { const tok = M.tok; api.timeout(() => { if (tok === M.tok && M.V && !M.V.over && pane.hidden) showPane(`<div class="bx-box"><p class="bx-kick">Out</p><h3>Wrong accusation</h3><p>You are out of the game, but you stay at the table and still show cards when needed.</p><button class="bx-btn" data-a="w">Keep watching</button><button class="bx-btn alt" data-a="q">Leave</button></div>`, a => { hidePane(); if (a === 'q') { if (M.mode === 'online') leaveOnline(); showMenu(); } }); }, 1300); sfx.lose(); }
        }
        M.evN = V.evs.length;
        M.dests = null; M.dl = []; M.sel = -1;
        if (V.ph === 'move' && V.turn === V.me && V.seats[V.me].alive) {
          M.dests = clReach(V, V.me);
          M.dl = [...M.dests.keys()].sort((a, b) => (b >= 1000) - (a >= 1000) || a - b);
          M.sel = 0;
        }
        if (V.over) endGame(); else if (pane.hidden && !M.dlg) { if (V.ph === 'show' && V.pend && V.pend.q === V.me) dlgShow(); }
        else if (!pane.hidden && V.ph === 'show' && V.pend && V.pend.q === V.me && !M.dlg) dlgShow();
        renderSide();
      }

      function endGame() {
        const V = M.V;
        if (M.phase === 'over') return;
        M.phase = 'over';
        const mine = V.winner === V.me;
        (mine ? sfx.win : sfx.lose)();
        let pts = 0;
        if (M.mode === 'cpu') {
          if (mine && !M.scored) { M.scored = true; pts = Math.max(100, Math.round((1000 - V.turns * 9) * ({ easy: .6, normal: 1, hard: 1.4 }[opt.diff]) * (1 + (V.n - 3) * .12))); api.submit(pts); }
          api.score(pts);
        }
        const tok = M.tok, wn = sg(V.seats[V.winner].ch).n;
        const online = M.mode === 'online';
        const reason = V.why === 'last' ? `${wn} is the last detective standing.` : V.winner === V.me ? 'You cracked the case!' : `${wn} cracked the case.`;
        const result = () => {
          if (tok !== M.tok || !M.V || !M.V.over) return;
          const e = V.env || [0, 6, 12];
          showPane(`<div class="bx-box wide"><p class="bx-kick">${mine ? 'Victory' : 'Case closed'}</p><h3>${mine ? 'You solved it!' : `${wn} wins`}</h3><p>${reason}</p>
<div class="cl-lbl" style="text-align:center">The solution</div><div class="cl-sol">${e.map((c, i) => `<div class="cl-big rev" style="animation-delay:${i * .35}s;--cc:${c < 6 ? CL_SUS[c].c : c < 12 ? '#8e98a6' : CL_RM[c - 12].col}">${clIconSvg(c, 56)}<span>${pName(c)}</span></div>`).join('')}</div>
${pts ? `<p><b>${pts} pts</b></p>` : ''}
${online ? `<button class="bx-btn" data-a="rematch">${M.rm.has(api.net.id) ? 'Waiting for the others…' : 'Rematch'}</button><button class="bx-btn alt" data-a="lobby">Back to lobby</button>` : `<button class="bx-btn" data-a="again">Play again</button><button class="bx-btn alt" data-a="menu">Menu</button>`}
<button class="bx-btn alt sm" data-a="look">Look at the board</button></div>`, a => {
            if (a === 'again') startSolo();
            else if (a === 'menu') showMenu();
            else if (a === 'look') showPane('<div class="bx-row" style="position:absolute;left:0;right:0;bottom:8px;justify-content:center"><button class="bx-btn sm" data-a="b">Results</button></div>', result, 'clear');
            else if (a === 'rematch') rematch();
            else if (a === 'lobby') startOnline();
          });
        };
        api.timeout(result, V.evs.length && V.evs[V.evs.length - 1].k === 'acc' ? 1500 : 600);
      }

      function menuHtml() {
        return `<div class="bx-box"><p class="bx-kick">Mystery</p><h3>Clue</h3><p>Someone did it, somewhere, with something. Question the other detectives, fill in your notebook and name the culprit first.</p>
<div class="bx-lbl">Your suspect</div><div class="cl-seg">${CL_SUS.map((s, i) => `<button data-a="c:${i}" class="${opt.ch === i ? 'on' : ''}"><i style="background:${s.c}"></i>${s.s}</button>`).join('')}</div>
<div class="bx-lbl">Opponents</div><div class="bx-seg">${[2, 3, 4, 5].map(n => `<button data-a="o:${n}" class="${opt.opp === n ? 'on' : ''}">${n}</button>`).join('')}</div>
<div class="bx-lbl">Computer level</div><div class="bx-seg">${['easy', 'normal', 'hard'].map(d => `<button data-a="d:${d}" class="${opt.diff === d ? 'on' : ''}">${d[0].toUpperCase() + d.slice(1)}</button>`).join('')}</div>
<button class="bx-btn" data-a="cpu">Play vs computer</button>
<button class="bx-btn" data-a="online">Play online<small>3 to 6 detectives, bots fill empty seats</small></button>
<div class="bx-row"><button class="bx-btn alt sm" data-a="help">How to play</button><button class="bx-btn alt sm" data-a="fast">Bot speed: ${opt.fast ? 'Fast' : 'Normal'}</button></div></div>`;
      }
      function showMenu() {
        M.tok++; M.pt++; M.phase = 'menu'; M.mode = 'cpu'; M.role = 'local'; M.G = null; M.V = null; M.K = null;
        D.anim = {}; D.wanim = {}; D.tokXY = {}; D.wepXY = {}; D.dice.on = false;
        renderSide();
        showPane(menuHtml(), menuAct);
      }
      function menuAct(a) {
        if (a.startsWith('c:')) { opt.ch = +a.slice(2); save(); showPane(menuHtml(), menuAct); }
        else if (a.startsWith('o:')) { opt.opp = +a.slice(2); save(); showPane(menuHtml(), menuAct); }
        else if (a.startsWith('d:')) { opt.diff = a.slice(2); save(); showPane(menuHtml(), menuAct); }
        else if (a === 'fast') { opt.fast = !opt.fast; save(); showPane(menuHtml(), menuAct); }
        else if (a === 'cpu') startSolo();
        else if (a === 'online') startOnline();
        else if (a === 'help') showPane(`<div class="bx-box wide"><p class="bx-kick">Rules</p><h3>How to play Clue</h3>${CL_HELP}<button class="bx-btn" data-a="x">Back</button></div>`, () => showPane(menuHtml(), menuAct));
      }

      function resetGameState() {
        M.tok++; M.pt++; M.phase = 'play'; M.scored = false; M.notes = {}; M.evN = 0; M.revealed = 0; M.rm = new Set(); M.away = {}; M.tab = 'nb';
        D.anim = {}; D.wanim = {}; D.tokXY = {}; D.wepXY = {}; D.dice = { a: 1, b: 1, t0: -1e9, on: false }; D.flash = []; D.busyUntil = 0;
        api.score(0);
      }
      function startSolo() {
        resetGameState(); M.mode = 'cpu'; M.role = 'local';
        const others = shuffle([0, 1, 2, 3, 4, 5].filter(c => c !== opt.ch)).slice(0, opt.opp);
        const spec = [{ ch: opt.ch, name: 'You' }].concat(others.map(c => ({ ch: c, bot: true, lvl: opt.diff })));
        M.G = clNew(spec);
        M.me = M.G.seats.findIndex(s => s.ch === opt.ch);
        M.mem = M.G.seats.map(() => ({}));
        hidePane();
        D.tokXY = {};
        publish(true);
        if (M.G.turn === M.me) api.toast('You go first');
      }

      function dealOnline(humans) {
        resetGameState(); M.mode = 'online'; M.role = 'host';
        const size = Math.max(3, Math.min(6, M.size || humans.length)), n = Math.max(size, humans.length);
        const chs = shuffle([0, 1, 2, 3, 4, 5]).slice(0, n);
        const spec = chs.map((ch, i) => i < humans.length ? { ch, uid: humans[i].id, name: humans[i].name } : { ch, bot: true, lvl: opt.diff });
        M.G = clNew(spec);
        M.me = M.G.seats.findIndex(s => s.uid === api.net.id);
        M.mem = M.G.seats.map(() => ({}));
        hidePane();
        publish(true);
      }

      const HS = mkHs(api, 'clue');
      function saveHost() {
        if (M.mode !== 'online' || M.role !== 'host' || !M.G) return;
        if (!M.G.over) HS.save({ G: M.G });
        else HS.clear();
      }
      function offerResume(sv, pl) {
        const G = sv.G, hum = G.seats.filter(s => s.uid != null && !s.bot).length;
        showPane(hsPane('Online', `Saved game: turn ${G.turns + 1}, ${G.seats.filter(s => s.alive).length} detectives left. ${hum > pl.length ? 'Missing players are replaced by bots.' : ''}`), a => {
          if (a === 'new') { HS.clear(); dealOnline(pl.map(p => ({ id: p.id, name: p.name }))); return; }
          const used = new Set();
          G.seats.forEach(s => {
            if (s.uid == null || s.bot) return;
            const p = pl.find(q => q.id === s.uid && !used.has(q.id)) || pl.find(q => q.name === s.name && !used.has(q.id));
            if (p) { used.add(p.id); s.uid = p.id; } else { s.bot = true; s.lvl = opt.diff; }
          });
          resetGameState(); M.mode = 'online'; M.role = 'host';
          M.G = G; G.fx = []; G.ver++;
          M.me = G.seats.findIndex(s => s.uid === api.net.id);
          M.mem = G.seats.map(() => ({}));
          hidePane(); publish(true);
          api.toast('Game resumed');
        });
      }

      function leaveOnline() {
        HS.clear();
        if (killNet) { killNet(); killNet = null; }
        M.hooked = false; M.tok++; M.pt++;
        try { api.net.close(); } catch (e) {}
        M.mode = 'cpu'; M.role = 'local'; netEl.hidden = true;
      }
      function rematch() {
        if (M.rm.has(api.net.id)) return;
        M.rm.add(api.net.id);
        if (M.role === 'guest') api.net.send({ t: 'rm' });
        showPane(`<div class="bx-box"><h3>Rematch requested</h3><p>Waiting for the other detectives…</p><button class="bx-btn alt" data-a="lobby">Back to lobby</button></div>`, a => { if (a === 'lobby') startOnline(); });
        checkRematch();
      }
      function checkRematch() {
        if (M.role !== 'host' || !M.G || !M.G.over) return;
        const hum = M.G.seats.filter(s => s.uid != null && !s.bot);
        if (hum.every(s => s.uid === api.net.id ? M.rm.has(api.net.id) : M.rm.has(s.uid)) && M.rm.has(api.net.id)) dealOnline(hum.map(s => ({ id: s.uid, name: s.name })));
      }

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        killNet = mkNetHooks(api, {
          data: onData,
          leave: p => {
            if (M.mode !== 'online' || M.role !== 'host' || !M.G || !p) return;
            const i = M.G.seats.findIndex(s => s.uid === p.id);
            if (i < 0 || M.G.seats[i].bot) return;
            M.away[p.id] = true;
            const tok = M.tok;
            api.timeout(() => {
              if (tok !== M.tok || !M.away[p.id] || !M.G) return;
              const s = M.G.seats[i];
              if (s.bot) return;
              s.bot = true; s.lvl = opt.diff; M.mem[i] = {};
              if (!M.G.over) { M.G.evs.push({ k: 'left', by: i }); M.G.ver++; }
              if (M.G.over) { checkRematch(); renderSide(); } else publish();
            }, 9000);
          },
          rejoin: p => {
            if (M.mode !== 'online' || M.role !== 'host' || !M.G || !p) return;
            const i = M.G.seats.findIndex(s => s.uid === p.id);
            delete M.away[p.id];
            if (i < 0) return;
            if (M.G.seats[i].bot) api.net.sendTo(p.id, { t: 'out' });
            else api.net.sendTo(p.id, { t: 'v', v: clView(M.G, i), fx: [], nw: true });
          },
          lobby: () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); },
          close: reason => {
            if (M.mode !== 'online' || M.role !== 'guest') return;
            M.tok++; sfx.lose();
            const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
            showPane(`<div class="bx-box"><p class="bx-kick">Online</p><h3>${h}</h3><p>The game cannot continue.</p><button class="bx-btn" data-a="room">Online lobby</button><button class="bx-btn alt" data-a="cpu">Play vs computer</button></div>`, a => { if (a === 'room') startOnline(); else { leaveOnline(); showMenu(); } });
          }
        });
        api.interval(() => {
          if (M.mode !== 'online') { netEl.hidden = true; return; }
          netEl.hidden = false;
          const on = api.net.connected;
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · host' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }

      async function startOnline() {
        M.tok++; M.pt++; const tok = M.tok;
        hookNet();
        M.mode = 'online'; M.role = null; M.phase = 'menu'; M.G = null; M.V = null; renderSide(); hidePane();
        const r = await api.net.room({ title: 'Clue', sizes: [3, 4, 5, 6], defaultSize: 4, min: 3, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { leaveOnline(); return showMenu(); }
        resetGameState(); M.mode = 'online'; M.role = r.role; M.size = r.bots ? r.size : (r.players || []).length;
        if (r.role === 'host') {
          const pl = r.players || [], sv = HS.load();
          if (sv && sv.G && sv.G.seats && !sv.G.over) offerResume(sv, pl); else dealOnline(pl.map(p => ({ id: p.id, name: p.name })));
        }
        else showPane('<div class="bx-box"><p class="bx-kick">Online</p><h3>Dealing the cards…</h3><p>Waiting for the host.</p></div>', null);
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (M.role === 'host') {
          if (d.t === 'a' && d.a && M.G) {
            const i = M.G.seats.findIndex(s => s.uid === from && !s.bot);
            if (i < 0) return;
            const a = { t: String(d.a.t) };
            ['s', 'w', 'r', 'c', 'to'].forEach(k => { if (Number.isInteger(d.a[k])) a[k] = d.a[k]; });
            if (!doAct(i, a)) api.net.sendTo(from, { t: 'v', v: clView(M.G, i), fx: [] });
          } else if (d.t === 'rm') { M.rm.add(from); if (M.G && M.G.over) { api.toast('A detective wants a rematch'); checkRematch(); } }
        } else {
          if (d.t === 'v' && d.v) {
            if (d.nw) { M.phase = 'play'; hidePane(); }
            if (M.phase === 'menu') M.phase = 'play';
            if (M.phase === 'over' && !d.v.over) { M.phase = 'play'; M.rm = new Set(); hidePane(); }
            onView(d.v, d.fx || [], !!d.nw);
            if (d.nw && !pane.hidden && !M.dlg) hidePane();
            if (d.nw) resetGuestRound();
          } else if (d.t === 'out') {
            M.tok++;
            showPane('<div class="bx-box"><p class="bx-kick">Online</p><h3>A bot took your seat</h3><p>You were away for too long.</p><button class="bx-btn" data-a="room">Online lobby</button></div>', () => startOnline());
          }
        }
      }
      function resetGuestRound() { M.scored = false; M.rm = new Set(); if (M.phase === 'over') M.phase = 'play'; }

      api.on(canvas, 'pointermove', e => {
        const p = toLocal(e), c = Math.floor((p.x - PAD) / CELL), r = Math.floor((p.y - PAD) / CELL);
        M.hover = c >= 0 && r >= 0 && c < CL_W && r < CL_H ? posAt(r * CL_W + c) : -1;
        canvas.style.cursor = M.dests && M.dests.has(M.hover) ? 'pointer' : 'default';
      });
      api.on(canvas, 'pointerleave', () => { M.hover = -1; });
      const posAt = id => { const k = CL_KIND[id]; return k >= 0 && k < 9 ? 1000 + k : k === 9 ? -1 : id; };
      api.on(canvas, 'click', e => {
        au.unlock();
        if (!M.dests) return;
        const p = toLocal(e), c = Math.floor((p.x - PAD) / CELL), r = Math.floor((p.y - PAD) / CELL);
        if (c < 0 || r < 0 || c >= CL_W || r >= CL_H) return;
        const pos = posAt(r * CL_W + c);
        if (M.dests.has(pos)) { M.dests = null; act({ t: 'move', to: pos }); }
      });
      api.on(window, 'keydown', e => {
        if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        const V = M.V;
        if (!pane.hidden) { if (e.key === 'Escape' && M.dlg) hidePane(); return; }
        if (!V || M.phase !== 'play') return;
        const k = e.key.toLowerCase();
        const mt = V.turn === V.me && V.ph !== 'show' && !V.over && V.seats[V.me].alive;
        if (k === 'n') { M.tab = M.tab === 'nb' ? 'log' : 'nb'; renderSide(); return; }
        if (!mt) return;
        if (k === 'r' && V.ph === 'start') act({ t: 'roll' });
        else if (k === 'e' && V.ph === 'post') act({ t: 'end' });
        else if (k === 'a') dlgAcc();
        else if (k === 's') { if (V.ph === 'start' && V.pulled[V.me]) act({ t: 'stay' }); else dlgSug(); }
        else if (M.dests && M.dl.length && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) { M.sel = (M.sel + 1) % M.dl.length; e.preventDefault(); }
        else if (M.dests && M.dl.length && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) { M.sel = (M.sel + M.dl.length - 1) % M.dl.length; e.preventDefault(); }
        else if (M.dests && e.key === 'Enter' && M.sel >= 0) { const to = M.dl[M.sel]; M.dests = null; act({ t: 'move', to }); e.preventDefault(); }
      });

      function frame(t) {
        const V = M.V, c = ctx;
        c.clearRect(0, 0, W, H);
        c.drawImage(board, 0, 0);
        if (!V) return;
        CL_RM.forEach((m, i) => {
          const im = clImg(12 + i);
          if (!im.complete || !im.naturalWidth) return;
          const x0 = PAD + m.r[0] * CELL, y0 = PAD + m.r[1] * CELL, w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
          const s = Math.min(w, h) * .62;
          c.globalAlpha = .17; c.drawImage(im, x0 + w / 2 - s / 2, y0 + h / 2 - s / 2 + CELL * .35, s, s); c.globalAlpha = 1;
        });
        const sl = slotMaps(V);
        D.flash = D.flash.filter(f => t - f.t0 < 1400);
        D.flash.forEach(f => {
          const m = CL_RM[f.ri], k = (t - f.t0) / 1400, x0 = PAD + m.r[0] * CELL, y0 = PAD + m.r[1] * CELL, w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
          c.save(); c.globalAlpha = (1 - k) * .55; c.fillStyle = '#fff3b0'; c.fillRect(x0, y0, w, h);
          c.globalAlpha = 1 - k; c.strokeStyle = '#ffd23f'; c.lineWidth = 5; c.strokeRect(x0 - 2, y0 - 2, w + 4, h + 4); c.restore();
        });
        const pulse = .5 + .5 * Math.sin(t / 220);
        if (M.dests) {
          const hov = M.hover, selp = M.sel >= 0 ? M.dl[M.sel] : -2;
          M.dests.forEach((path, pos) => {
            const on = pos === hov || pos === selp;
            if (pos >= 1000) {
              const m = CL_RM[pos - 1000], x0 = PAD + m.r[0] * CELL, y0 = PAD + m.r[1] * CELL, w = (m.r[2] - m.r[0] + 1) * CELL, h = (m.r[3] - m.r[1] + 1) * CELL;
              c.save(); c.globalAlpha = (on ? .38 : .16) + pulse * .1; c.fillStyle = '#ffe27a'; c.fillRect(x0, y0, w, h);
              c.globalAlpha = 1; c.strokeStyle = on ? '#fff' : '#ffd23f'; c.lineWidth = 3 + pulse * 2; c.strokeRect(x0 + 2, y0 + 2, w - 4, h - 4); c.restore();
            } else {
              const x0 = PAD + (pos % CL_W) * CELL, y0 = PAD + ((pos / CL_W) | 0) * CELL;
              c.save(); c.globalAlpha = (on ? .85 : .5) + pulse * .15; c.fillStyle = '#ffcf3a'; c.fillRect(x0 + 1, y0 + 1, CELL - 2, CELL - 2);
              c.globalAlpha = 1; c.strokeStyle = on ? '#fff' : '#b87d00'; c.lineWidth = on ? 3 : 1.5; c.strokeRect(x0 + 2, y0 + 2, CELL - 4, CELL - 4); c.restore();
            }
          });
          const hp = M.dests.get(hov) || (selp >= 0 && M.dests.get(selp));
          if (hp) {
            c.save(); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.setLineDash([6, 5]); c.lineDashOffset = -t / 40; c.beginPath();
            const start = posXY(V, sl, V.seats[V.me].ch);
            c.moveTo(start[0], start[1]);
            hp.forEach(p => { if (p < 1000) c.lineTo(PAD + (p % CL_W) * CELL + CELL / 2, PAD + ((p / CL_W) | 0) * CELL + CELL / 2); else { const q = sl.tp[V.seats[V.me].ch] || [PAD + CL_RM[p - 1000].r[0] * CELL + CELL, PAD + CL_RM[p - 1000].r[1] * CELL + CELL]; const m = CL_RM[p - 1000]; c.lineTo(PAD + (m.r[0] + m.r[2] + 1) / 2 * CELL, PAD + (m.r[1] + m.r[3] + 1) / 2 * CELL); } });
            c.stroke(); c.restore();
          }
        }
        for (let wi = 0; wi < 6; wi++) {
          let xy = sl.wp[wi]; if (!xy) continue;
          const wa = D.wanim[wi];
          let x = xy[0], y = xy[1], lift = 0;
          if (wa && wa.from) {
            const p = clamp((t - wa.t0) / wa.dur, 0, 1);
            if (t < wa.t0) { x = wa.from[0]; y = wa.from[1]; } else if (p < 1) { const e = easeIO(p); x = lerp(wa.from[0], xy[0], e); y = lerp(wa.from[1], xy[1], e); lift = Math.sin(p * Math.PI) * 20; } else delete D.wanim[wi];
          } else if (wa) delete D.wanim[wi];
          D.wepXY[wi] = [x, y];
          const im = clImg(6 + wi);
          c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x, y + 9, 9, 3.2, 0, 0, TAU); c.fill();
          if (im.complete && im.naturalWidth) c.drawImage(im, x - 12, y - 12 - lift, 24, 24);
        }
        const order = [0, 1, 2, 3, 4, 5].map(ch => {
          const a = D.anim[ch], ap = a ? animPos(a, t) : null;
          if (a && !ap) delete D.anim[ch];
          const xy = ap ? [ap.x, ap.y] : posXY(V, sl, ch);
          if (a && ap && a.kind === 'step' && ap.step !== a.last) { a.last = ap.step; sfx.step(); }
          D.tokXY[ch] = xy;
          return { ch, x: xy[0], y: xy[1], lift: ap ? ap.lift : 0 };
        }).sort((a, b) => a.y - b.y);
        const turnCh = V.over ? -1 : V.seats[V.turn].ch;
        order.forEach(o => {
          const inRoom = V.pawn[o.ch] >= 1000;
          const R = inRoom ? CELL * .36 : CELL * .4;
          if (o.ch === turnCh) {
            c.save(); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.globalAlpha = .55 + pulse * .45;
            c.beginPath(); c.ellipse(o.x, o.y + R * .95, R * (1.2 + pulse * .25), R * .5, 0, 0, TAU); c.stroke(); c.restore();
          }
          clPawn(c, o.x, o.y - R * .1, R, o.ch, o.lift);
          const si = V.seats.findIndex(s => s.ch === o.ch);
          if (si === V.me) {
            c.save(); c.font = '900 9px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.8)'; c.lineWidth = 3;
            c.strokeText('YOU', o.x, o.y - R * 1.7 - o.lift); c.fillText('YOU', o.x, o.y - R * 1.7 - o.lift); c.restore();
          } else if (si >= 0 && !V.seats[si].alive) {
            c.save(); c.strokeStyle = '#c8332a'; c.lineWidth = 3; c.beginPath(); c.moveTo(o.x - 7, o.y - 9); c.lineTo(o.x + 7, o.y + 5); c.moveTo(o.x + 7, o.y - 9); c.lineTo(o.x - 7, o.y + 5); c.stroke(); c.restore();
          }
        });
        const cx = PAD + 11.5 * CELL, cy = PAD + 10.6 * CELL;
        if (D.dice.on || V.roll) {
          const el = t - D.dice.t0, roll = el < 900;
          let a = D.dice.a, b = D.dice.b;
          if (!D.dice.on && V.roll) { a = V.dice[0] || 1; b = V.dice[1] || 1; }
          let ox = 0, oy = 0, r1 = 0, r2 = 0;
          if (roll && D.dice.on) {
            if (el < 780) { a = 1 + (Math.floor(t / 70) % 6); b = 1 + (Math.floor(t / 55 + 2) % 6); }
            const k = 1 - el / 900;
            ox = Math.sin(el / 40) * 5 * k; oy = -Math.abs(Math.sin(el / 120)) * 26 * k; r1 = Math.sin(el / 60) * .8 * k; r2 = -Math.sin(el / 70) * .8 * k;
          }
          clDie(c, cx - 26 + ox, cy + oy, 40, a, r1); clDie(c, cx + 26 - ox, cy + oy, 40, b, r2);
          if (!roll && V.ph !== 'start') { c.save(); c.font = '900 13px Georgia,serif'; c.textAlign = 'center'; c.fillStyle = '#e9cf88'; c.shadowColor = '#000'; c.shadowBlur = 4; c.fillText(`${sg(V.seats[V.turn].ch).s} rolled ${a + b}`, cx, cy + 36); c.restore(); }
        }
      }
      api.interval(saveHost, 1000);
      window.addEventListener('pagehide', saveHost);
      api.loop((dt, t) => frame(performance.now()));
      renderSide();
      if (api.net.invite) startOnline(); else showMenu();
      root._cl = { M, D, opt, CELL, PAD, act, T: { clBot, clKnow, clReach, clSample, clView, clAct } };
      return { destroy() { window.removeEventListener('pagehide', saveHost); M.tok++; M.pt++; if (killNet) killNet(); } };
    }
  });

  (() => {
    const tile = (x, y, w, h, c, d, ch) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}"/><rect x="${x}" y="${y + h - 5}" width="${w}" height="5" rx="3" fill="${d}"/><text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="${h * .5}" fill="#fff">${ch}</text>`;
    let t = '';
    const R = ['10', '9', '8', '7', '6', '5', '4', '3'], B = ['2', '3', 'S', 'B', '5', '4', '1', 'F'];
    for (let i = 0; i < 8; i++) {
      t += tile(32 + i * 42, 38, 36, 40, '#b8352f', '#7d1f1b', R[i]);
      t += tile(32 + i * 42, 222, 36, 40, '#2a5db5', '#183a78', B[i]);
    }
    Ameplay.covers['stratego'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="stc-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5a2b"/><stop offset="1" stop-color="#5a3a18"/></linearGradient><linearGradient id="stc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb85a"/><stop offset="1" stop-color="#4f8a3a"/></linearGradient><linearGradient id="stc-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc2ef"/><stop offset="1" stop-color="#2a86c6"/></linearGradient></defs><rect width="400" height="300" fill="url(#stc-w)"/><rect x="18" y="18" width="364" height="264" rx="10" fill="url(#stc-g)"/><g fill="#3d7330" opacity=".35"><path d="M18 90h364v1M18 142h364v1M18 194h364v1" stroke="#2f5a25" stroke-width="1"/></g><rect x="92" y="102" width="82" height="96" rx="12" fill="url(#stc-l)" stroke="#e8d8a6" stroke-width="4"/><rect x="226" y="102" width="82" height="96" rx="12" fill="url(#stc-l)" stroke="#e8d8a6" stroke-width="4"/><path d="M100 128q10-8 20 0t20 0t20 0M100 150q10-8 20 0t20 0t20 0M100 172q10-8 20 0t20 0t20 0M234 128q10-8 20 0t20 0t20 0M234 150q10-8 20 0t20 0t20 0M234 172q10-8 20 0t20 0t20 0" fill="none" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>${t}<g transform="translate(200 150)"><circle r="30" fill="#ffd23f" stroke="#7a4b00" stroke-width="4"/><path d="M-12 12L-12 -14L0 -4L12 -14L12 12Z" fill="#7a4b00"/></g></svg>`;

    const F = [0, 3, 5, 8, 9, 14], px = 29, py = 80, cw = 52, ch = 78, gap = 6;
    let g = '';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
      const i = r * 6 + c, x = px + c * (cw + gap), y = py + r * (ch + 8);
      const down = (i === 4 || i === 7);
      g += down
        ? `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="#0b1f46"/><rect x="${x}" y="${y + ch - 9}" width="${cw}" height="9" rx="3" fill="#2b66c9"/>`
        : `<svg x="${x}" y="${y}" width="${cw}" height="${ch - 14}" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice">${gwFace(GW_CAST[F[i % 6] + (r ? 6 : 0)]).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg><rect x="${x}" y="${y + ch - 14}" width="${cw}" height="14" fill="#d8423a"/><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="none" stroke="#fff" stroke-width="3"/>`;
    }
    Ameplay.covers['guess-who'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gwc-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6fd0"/><stop offset="1" stop-color="#173f86"/></linearGradient></defs><rect width="400" height="300" fill="url(#gwc-b)"/><rect x="8" y="8" width="384" height="284" rx="14" fill="none" stroke="#0f2c63" stroke-width="4"/><g transform="rotate(-3 200 36)"><rect x="96" y="14" width="96" height="40" rx="12" fill="#d8423a"/><text x="144" y="44" text-anchor="middle" font-family="Trebuchet MS,Arial" font-weight="900" font-style="italic" font-size="28" fill="#fff">GUESS</text></g><text x="208" y="46" font-family="Trebuchet MS,Arial" font-weight="900" font-style="italic" font-size="32" fill="#ffd23f">WHO?</text>${g}<g transform="translate(334 268) rotate(8)"><rect x="-26" y="-20" width="70" height="40" rx="14" fill="#fff"/><path d="M-6 20l-6 12l16-12z" fill="#fff"/><text x="9" y="9" text-anchor="middle" font-family="Trebuchet MS,Arial" font-weight="900" font-size="28" fill="#d8423a">?</text></g></svg>`;
  })();

  (() => {
    const s = 10.4, bx = 18, by = 20;
    let b = `<rect x="${bx - 4}" y="${by - 4}" width="${24 * s + 8}" height="${25 * s + 8}" rx="6" fill="#6e4122" stroke="#d4a94a" stroke-width="2"/><rect x="${bx}" y="${by}" width="${24 * s}" height="${25 * s}" fill="#e9d9aa"/>`;
    CL_RM.forEach(m => { b += `<rect x="${bx + m.r[0] * s}" y="${by + m.r[1] * s}" width="${(m.r[2] - m.r[0] + 1) * s}" height="${(m.r[3] - m.r[1] + 1) * s}" fill="${m.col}" stroke="#2d1a0a" stroke-width="1.6"/>`; });
    b += `<rect x="${bx + 9 * s}" y="${by + 8 * s}" width="${6 * s}" height="${7 * s}" fill="#1c2436" stroke="#d4a94a" stroke-width="1.4"/><rect x="${bx + 10.3 * s}" y="${by + 10.6 * s}" width="${3.4 * s}" height="${2.2 * s}" rx="1" fill="#f4ecd2"/><circle cx="${bx + 12 * s}" cy="${by + 11.8 * s}" r="${.6 * s}" fill="#b3282a"/>`;
    CL_SUS.forEach(p => { b += `<circle cx="${bx + (p.st[0] + .5) * s}" cy="${by + (p.st[1] + .5) * s}" r="${s * .62}" fill="${p.c}" stroke="${p.d}" stroke-width="1.4"/>`; });
    Ameplay.covers['clue'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="clc-b" cx=".7" cy=".4" r=".9"><stop offset="0" stop-color="#4a1520"/><stop offset="1" stop-color="#170608"/></radialGradient><radialGradient id="clc-g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e8f4ff" stop-opacity=".85"/><stop offset="1" stop-color="#8fb4d8" stop-opacity=".35"/></radialGradient></defs><rect width="400" height="300" fill="url(#clc-b)"/>${b}<g transform="translate(305 128)"><circle r="62" fill="url(#clc-g)" stroke="#d4a94a" stroke-width="9"/><circle r="62" fill="none" stroke="#6e4122" stroke-width="3" transform="scale(1.08)"/><path d="M44 44L92 92" stroke="#6e4122" stroke-width="17" stroke-linecap="round"/><path d="M44 44L92 92" stroke="#d4a94a" stroke-width="5" stroke-linecap="round"/><svg x="-34" y="-36" width="68" height="68" viewBox="0 0 40 40">${CL_ICO[0](CL_SUS[0])}</svg><path d="M-40-30a52 52 0 0 1 40-24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g><svg x="262" y="214" width="46" height="46" viewBox="0 0 40 40">${CL_WICO[1]}</svg><svg x="318" y="226" width="42" height="42" viewBox="0 0 40 40">${CL_WICO[4]}</svg></svg>`;
  })();

})();
