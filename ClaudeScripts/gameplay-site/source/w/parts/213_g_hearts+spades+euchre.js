(() => {
  'use strict';

  const SYM = ['♣', '♦', '♠', '♥'];
  const SNAME = ['Clubs', 'Diamonds', 'Spades', 'Hearts'];
  const SCH = ['C', 'D', 'S', 'H'];
  const cs = c => (c / 13) | 0;
  const cr = c => (c % 13) + 2;
  const mkc = (s, r) => s * 13 + r - 2;
  const RL = r => (r < 11 ? String(r) : 'JQKA'[r - 11]);
  const RN = r => (r < 11 ? String(r) : ['Jack', 'Queen', 'King', 'Ace'][r - 11]);
  const cname = c => RL(cr(c)) + SYM[cs(c)];
  const cfull = c => RN(cr(c)) + ' of ' + SNAME[cs(c)];
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const range = n => Array.from({ length: n }, (_, i) => i);
  const shuf = a => {
    for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  const TAU = Math.PI * 2;
  const QS = mkc(2, 12), JD = mkc(1, 11), C2 = mkc(0, 2);
  const nextSeat = p => (p + 1) % 4;
  const FULL = range(52);

  function dealUnseen(U, caps, ok, fixed) {
    const out = caps.map(() => []), rem = caps.slice();
    const used = new Set();
    if (fixed) for (const [q, c] of fixed) { if (rem[q] > 0 && U.includes(c)) { out[q].push(c); rem[q]--; used.add(c); } }
    const pool = [];
    for (const c of U) if (!used.has(c)) pool.push([c, 0]);
    shuf(pool);
    for (const e of pool) { let n = 0; for (let q = 0; q < caps.length; q++) if (rem[q] > 0 && ok(q, e[0])) n++; e[1] = n; }
    pool.sort((a, b) => a[1] - b[1]);
    for (const [c] of pool) {
      let tot = 0;
      for (let q = 0; q < caps.length; q++) if (rem[q] > 0 && ok(q, c)) tot += rem[q];
      let hard = false;
      if (!tot) { hard = true; for (let q = 0; q < caps.length; q++) tot += rem[q]; }
      if (!tot) break;
      let r = Math.random() * tot, pick = -1;
      for (let q = 0; q < caps.length; q++) {
        if (rem[q] <= 0 || (!hard && !ok(q, c))) continue;
        r -= rem[q];
        if (r < 0) { pick = q; break; }
      }
      if (pick < 0) for (let q = 0; q < caps.length; q++) if (rem[q] > 0) { pick = q; break; }
      out[pick].push(c); rem[pick]--;
    }
    return out;
  }

  function pimc(G, S, me, o) {
    const cands = G.legal(S, me);
    if (cands.length <= 1) return { best: cands[0], close: cands, cands, vals: [0] };
    const t0 = now();
    const tot = new Float64Array(cands.length);
    let cnt = 0;
    for (let it = 0; it < o.n; it++) {
      if (it >= 3 && now() - t0 > o.ms) break;
      const W = G.sample(S, me);
      for (let i = 0; i < cands.length; i++) {
        const T = G.clone(W);
        G.play(T, me, cands[i]);
        let g = 0;
        while (!G.over(T) && g++ < 80) { const p = T.turn; G.play(T, p, G.policy(T, p)); }
        tot[i] += G.util(T, me);
      }
      cnt++;
    }
    let bi = 0;
    for (let i = 1; i < cands.length; i++) if (tot[i] > tot[bi] + 1e-9) bi = i;
    const best = tot[bi] / Math.max(1, cnt);
    const close = [];
    for (let i = 0; i < cands.length; i++) if (tot[i] / Math.max(1, cnt) >= best - (o.eps || 0.0001)) close.push(cands[i]);
    return { best: cands[bi], close, cands, vals: Array.from(tot, v => v / Math.max(1, cnt)) };
  }

  function pickBy(L, f) {
    let b = L[0], bv = f(b);
    for (let i = 1; i < L.length; i++) { const v = f(L[i]); if (v > bv) { bv = v; b = L[i]; } }
    return b;
  }
  const lowest = L => pickBy(L, c => -cr(c));
  const highest = L => pickBy(L, c => cr(c));

  const hsort = (a, b) => a - b;
  const ssort = (a, b) => (SORD_S[cs(a)] - SORD_S[cs(b)]) || (cr(a) - cr(b));
  const SORD_S = [2, 3, 0, 1];


  const HEARTS_DEF = { target: 100, moon: 'add', jd: false, breakQ: false, pass: true };

  function hNew() {
    return { hands: [[], [], [], []], trick: [], lead: 0, turn: 0, tn: 0, played: new Uint8Array(52), vd: new Uint8Array(16), broken: false, pts: [0, 0, 0, 0], hc: [0, 0, 0, 0], cnt: [0, 0, 0, 0], qs: -1, sent: [null, null, null, null], o: HEARTS_DEF };
  }
  function hClone(S) {
    return { hands: S.hands.map(h => h.slice()), trick: S.trick.slice(), lead: S.lead, turn: S.turn, tn: S.tn, played: S.played.slice(), vd: S.vd.slice(), broken: S.broken, pts: S.pts.slice(), hc: S.hc.slice(), cnt: S.cnt.slice(), qs: S.qs, sent: S.sent, o: S.o, pass: S.pass };
  }
  function hLegal(S, p) {
    const h = S.hands[p];
    if (!S.trick.length) {
      if (S.tn === 0) { const i = h.indexOf(C2); if (i >= 0) return [C2]; }
      if (!S.broken) { const nh = h.filter(c => cs(c) !== 3); if (nh.length) return nh; }
      return h.slice();
    }
    const ls = cs(S.trick[0].c);
    const f = h.filter(c => cs(c) === ls);
    if (f.length) return f;
    if (S.tn === 0) { const ok = h.filter(c => cs(c) !== 3 && c !== QS); if (ok.length) return ok; }
    return h.slice();
  }
  function hPlay(S, p, c) {
    const h = S.hands[p];
    h.splice(h.indexOf(c), 1);
    S.played[c] = 1;
    let broke = false;
    if (S.trick.length && cs(c) !== cs(S.trick[0].c)) S.vd[p * 4 + cs(S.trick[0].c)] = 1;
    if (!S.broken && (cs(c) === 3 || (S.o.breakQ && c === QS))) { S.broken = true; broke = true; }
    S.trick.push({ p, c });
    if (S.trick.length < 4) { S.turn = nextSeat(p); return { broke }; }
    const ls = cs(S.trick[0].c);
    let w = S.trick[0], pt = 0, hearts = 0;
    for (const t of S.trick) {
      if (cs(t.c) === ls && cr(t.c) > cr(w.c)) w = t;
      if (cs(t.c) === 3) { pt++; hearts++; }
      if (t.c === QS) pt += 13;
      if (S.o.jd && t.c === JD) pt -= 10;
    }
    S.pts[w.p] += pt; S.hc[w.p] += hearts; S.cnt[w.p]++;
    if (S.trick.some(t => t.c === QS)) S.qs = w.p;
    const cards = S.trick;
    S.trick = []; S.tn++; S.lead = S.turn = w.p;
    return { broke, done: true, w: w.p, pt, cards };
  }
  function hMoon(S) {
    for (let p = 0; p < 4; p++) if (S.hc[p] === 13 && S.qs === p) return p;
    return -1;
  }
  function hDelta(S) {
    const m = hMoon(S);
    if (m < 0) return { d: S.pts.slice(), moon: -1 };
    if (S.o.moon === 'sub') return { d: [0, 1, 2, 3].map(p => (p === m ? -26 : 0)), moon: m };
    return { d: [0, 1, 2, 3].map(p => (p === m ? 0 : 26)), moon: m };
  }
  const hOver = S => S.tn >= 13;

  function hPolicy(S, p) {
    const L = hLegal(S, p);
    if (L.length === 1) return L[0];
    const tl = S.trick.length, h = S.hands[p];
    const qsOut = S.played[QS] || S.trick.some(t => t.c === QS);
    const hasQS = h.includes(QS);
    if (tl === 0) {
      let b = L[0], bv = 1e9;
      for (const c of L) {
        const s = cs(c), r = cr(c);
        let v = r;
        if (s === 3) v += 22;
        if (s === 2 && !qsOut && !hasQS && r >= 13) v += 30;
        if (s === 2 && !qsOut && r === 12) v += 80;
        if (s === 2 && !qsOut && hasQS && r < 12) v -= 6;
        let n = 0; for (const x of h) if (cs(x) === s) n++;
        v += n * 0.15;
        if (v < bv) { bv = v; b = c; }
      }
      return b;
    }
    const ls = cs(S.trick[0].c);
    let cur = S.trick[0];
    let pts = 0;
    for (const t of S.trick) { if (cs(t.c) === ls && cr(t.c) > cr(cur.c)) cur = t; if (cs(t.c) === 3) pts++; if (t.c === QS) pts += 13; }
    const f = L.filter(c => cs(c) === ls);
    if (f.length) {
      const lower = f.filter(c => cr(c) < cr(cur.c));
      if (lower.length) return highest(lower);
      const nq = f.filter(c => c !== QS);
      const pool = nq.length ? nq : f;
      if (tl === 3) return highest(pool);
      return lowest(pool);
    }
    if (L.includes(QS)) return QS;
    const hs = L.filter(c => cs(c) === 3);
    if (hs.length) return highest(hs);
    if (!qsOut && !hasQS) { const sp = L.filter(c => cs(c) === 2 && cr(c) >= 13); if (sp.length) return highest(sp); }
    let b = L[0], bv = -1e9;
    for (const c of L) {
      let n = 0; for (const x of h) if (cs(x) === cs(c)) n++;
      const v = cr(c) * 1.0 - n * 0.8 + (c === JD && S.o.jd ? -50 : 0);
      if (v > bv) { bv = v; b = c; }
    }
    return b;
  }
  function hSample(S, me) {
    const U = [];
    for (let c = 0; c < 52; c++) if (!S.played[c] && !S.hands[me].includes(c) && !S.trick.some(t => t.c === c)) U.push(c);
    const caps = [0, 1, 2, 3].map(q => (q === me ? 0 : S.hands[q].length));
    const fixed = [];
    const sd = S.sent[me];
    if (sd) for (const c of sd.cards) if (!S.played[c] && !S.trick.some(t => t.c === c)) fixed.push([sd.to, c]);
    const out = dealUnseen(U, caps, (q, c) => !S.vd[q * 4 + cs(c)], fixed);
    const W = hClone(S);
    for (let q = 0; q < 4; q++) if (q !== me) W.hands[q] = out[q];
    return W;
  }
  function hUtil(S, me) {
    const { d } = hDelta(S);
    let o = 0;
    for (let q = 0; q < 4; q++) if (q !== me) o += d[q];
    return -d[me] + 0.18 * o / 3;
  }
  const HG = { legal: hLegal, play: hPlay, over: hOver, policy: hPolicy, sample: hSample, clone: hClone, util: hUtil };

  const H_LVL = { Easy: { n: 0, ms: 0 }, Normal: { n: 26, ms: 70 }, Hard: { n: 90, ms: 170 } };
  function hBotPlay(S, p, lvl) {
    const L = hLegal(S, p);
    if (L.length === 1) return L[0];
    const cfg = H_LVL[lvl] || H_LVL.Normal;
    if (!cfg.n) {
      if (Math.random() < 0.12) return L[(Math.random() * L.length) | 0];
      return hPolicy(S, p);
    }
    const r = pimc(HG, S, p, { n: cfg.n, ms: cfg.ms, eps: 0.01 });
    if (r.close.length > 1) {
      const pc = r.close.filter(c => cs(c) !== 3 && c !== QS);
      return (pc.length ? lowest(pc) : lowest(r.close));
    }
    return r.best;
  }

  function hPassCards(h, dir, lvl, S) {
    const bySuit = [[], [], [], []];
    for (const c of h) bySuit[cs(c)].push(c);
    if (lvl === 'Easy') return h.slice().sort((a, b) => cr(b) - cr(a)).slice(0, 3);
    const hasQS = h.includes(QS);
    const lowSp = bySuit[2].filter(c => cr(c) < 12).length;
    const hearts = bySuit[3];
    const topH = hearts.filter(c => cr(c) >= 12).length;
    const aces = h.filter(c => cr(c) >= 13 && cs(c) !== 3).length;
    if (hearts.length >= 6 && topH >= 3 && aces >= 3 && hasQS === false && lvl === 'Hard') {
      return h.slice().sort((a, b) => (cs(a) === 3 ? 1 : 0) - (cs(b) === 3 ? 1 : 0) || cr(a) - cr(b)).slice(0, 3);
    }
    const sc = c => {
      const s = cs(c), r = cr(c);
      let v = r;
      if (c === QS) return lowSp >= 4 ? -2 : 200;
      if (S && S.o && S.o.jd && c === JD) return -20;
      if (s === 2) {
        if (r >= 13) v = hasQS ? 70 : (bySuit[2].length <= 4 ? 90 : 14);
        else v = r - 4;
      } else if (s === 3) {
        v = r >= 11 ? r + 30 : r >= 9 ? r + 6 : r - 8;
        if (hearts.length >= 5) v -= 6;
      } else {
        v = r + 4;
        const n = bySuit[s].length;
        if (n <= 3) v += (4 - n) * 3.5;
        if (n <= 2 && r < 9) v += 5;
      }
      return v;
    };
    return h.slice().sort((a, b) => sc(b) - sc(a)).slice(0, 3);
  }

  function HeartsEngine(opt) {
    const o = Object.assign({}, HEARTS_DEF, opt);
    const S = hNew();
    S.o = o; S.phase = 'new'; S.hno = 0; S.scores = [0, 0, 0, 0]; S.hist = []; S.sel = [null, null, null, null]; S.dir = 3;
    let evs = [];
    const E = (k, d) => { evs.push(Object.assign({ k }, d)); };
    const take = () => { const r = evs; evs = []; return r; };
    const dirOf = n => (o.pass ? n % 4 : 3);
    const toOf = (p, dir) => (p + (dir === 0 ? 1 : dir === 1 ? 3 : 2)) % 4;

    function deal() {
      const d = shuf(FULL.slice());
      const ns = hNew();
      for (let p = 0; p < 4; p++) ns.hands[p] = d.slice(p * 13, p * 13 + 13).sort(hsort);
      Object.assign(S, { hands: ns.hands, trick: [], tn: 0, played: ns.played, vd: ns.vd, broken: false, pts: [0, 0, 0, 0], hc: [0, 0, 0, 0], cnt: [0, 0, 0, 0], qs: -1, sent: [null, null, null, null], sel: [null, null, null, null] });
      S.dir = dirOf(S.hno);
      E('deal', { n: S.hno, dir: S.dir, hands: S.hands.map(h => h.slice()) });
      if (S.dir === 3) startPlay();
      else { S.phase = 'pass'; E('turn', { tk: 'pass', ps: [0, 1, 2, 3] }); }
    }
    function startPlay() {
      S.phase = 'play';
      const l = S.hands.findIndex(h => h.includes(C2));
      S.lead = S.turn = l;
      E('turn', { tk: 'play', p: l });
    }
    function doPass() {
      const moves = [];
      for (let p = 0; p < 4; p++) moves.push({ from: p, to: toOf(p, S.dir), cards: S.sel[p].slice() });
      for (const m of moves) { const h = S.hands[m.from]; for (const c of m.cards) h.splice(h.indexOf(c), 1); }
      for (const m of moves) { S.hands[m.to].push(...m.cards); S.sent[m.from] = { to: m.to, cards: m.cards.slice() }; }
      for (const h of S.hands) h.sort(hsort);
      E('pass', { dir: S.dir, moves });
      startPlay();
    }
    function scoreHand() {
      const { d, moon } = hDelta(S);
      for (let p = 0; p < 4; p++) S.scores[p] += d[p];
      S.hist.push(d.slice());
      let res = null;
      const mx = Math.max(...S.scores);
      if (mx >= o.target) {
        const mn = Math.min(...S.scores);
        const lows = S.scores.map((v, i) => (v === mn ? i : -1)).filter(i => i >= 0);
        if (lows.length === 1) res = lows[0];
      }
      S.phase = res == null ? 'between' : 'over';
      E('hand', { pts: S.pts.slice(), delta: d, moon, scores: S.scores.slice(), tie: mx >= o.target && res == null, n: S.hno });
      if (res != null) {
        const rank = [0, 1, 2, 3].sort((a, b) => S.scores[a] - S.scores[b]);
        E('over', { winner: res, rank, scores: S.scores.slice() });
      }
    }
    const eng = {
      id: 'hearts', o, s: S,
      start() { deal(); return take(); },
      next() { if (S.phase !== 'between') return []; S.hno++; deal(); return take(); },
      need() {
        if (S.phase === 'pass') return [0, 1, 2, 3].filter(p => !S.sel[p]).map(p => ({ p, k: 'pass' }));
        if (S.phase === 'play') return [{ p: S.turn, k: 'play' }];
        return [];
      },
      legal(p) { return S.phase === 'play' && p === S.turn ? hLegal(S, p) : []; },
      act(p, a) {
        if (!a) return null;
        if (S.phase === 'pass' && a.t === 'pass') {
          const cs3 = a.cards;
          if (!Array.isArray(cs3) || cs3.length !== 3 || S.sel[p] || new Set(cs3).size !== 3) return null;
          if (!cs3.every(c => S.hands[p].includes(c))) return null;
          S.sel[p] = cs3.slice();
          E('picked', { p });
          if (S.sel.every(Boolean)) doPass();
          return take();
        }
        if (S.phase === 'play' && a.t === 'play' && p === S.turn && hLegal(S, p).includes(a.c)) {
          const r = hPlay(S, p, a.c);
          E('play', { p, c: a.c });
          if (r.broke) E('broken', {});
          if (r.done) {
            E('trick', { w: r.w, pt: r.pt, cards: r.cards.map(t => ({ p: t.p, c: t.c })) });
            if (hOver(S)) scoreHand();
            else E('turn', { tk: 'play', p: S.turn });
          } else E('turn', { tk: 'play', p: S.turn });
          return take();
        }
        return null;
      },
      bot(p, lvl) {
        if (S.phase === 'pass') return { t: 'pass', cards: hPassCards(S.hands[p], S.dir, lvl, S) };
        return { t: 'play', c: hBotPlay(S, p, lvl) };
      },
      view(p) {
        return { g: 'hearts', phase: S.phase, n: S.hno, dir: S.dir, hand: S.hands[p].slice(), counts: S.hands.map(h => h.length), trick: S.trick.map(t => ({ p: t.p, c: t.c })), turn: S.phase === 'play' ? S.turn : -1, broken: S.broken, scores: S.scores.slice(), hist: S.hist.map(r => r.slice()), pts: S.pts.slice(), cnt: S.cnt.slice(), picked: S.sel.map(Boolean), sel: S.sel[p] ? S.sel[p].slice() : null, tn: S.tn, o };
      },
      filt(e, p) {
        if (e.k === 'deal') return { k: 'deal', n: e.n, dir: e.dir, hand: e.hands[p].slice(), counts: [13, 13, 13, 13] };
        if (e.k === 'pass') return { k: 'pass', dir: e.dir, moves: e.moves.map(m => ({ from: m.from, to: m.to, cards: m.from === p || m.to === p ? m.cards : null })) };
        return e;
      }
    };
    return eng;
  }


  const SPADES_DEF = { target: 500, blind: 'behind', bagPen: true, floor: -200 };

  function sNew() {
    return { hands: [[], [], [], []], trick: [], lead: 0, turn: 0, tn: 0, played: new Uint8Array(52), vd: new Uint8Array(16), broken: false, tw: [0, 0, 0, 0], bid: [null, null, null, null], blind: [false, false, false, false], bags: [0, 0], o: SPADES_DEF };
  }
  function sClone(S) {
    return { hands: S.hands.map(h => h.slice()), trick: S.trick.slice(), lead: S.lead, turn: S.turn, tn: S.tn, played: S.played.slice(), vd: S.vd.slice(), broken: S.broken, tw: S.tw.slice(), bid: S.bid, blind: S.blind, bags: S.bags, score: S.score, o: S.o };
  }
  function sLegal(S, p) {
    const h = S.hands[p];
    if (!S.trick.length) {
      if (!S.broken) { const ns = h.filter(c => cs(c) !== 2); if (ns.length) return ns; }
      return h.slice();
    }
    const ls = cs(S.trick[0].c);
    const f = h.filter(c => cs(c) === ls);
    return f.length ? f : h.slice();
  }
  function sBeats(a, b, ls) {
    const sa = cs(a), sb = cs(b);
    if (sa === 2 && sb !== 2) return true;
    if (sa !== 2 && sb === 2) return false;
    if (sa !== sb) return sa === ls;
    return cr(a) > cr(b);
  }
  function sWinner(trick) {
    const ls = cs(trick[0].c);
    let w = trick[0];
    for (let i = 1; i < trick.length; i++) if (sBeats(trick[i].c, w.c, ls)) w = trick[i];
    return w;
  }
  function sPlay(S, p, c) {
    const h = S.hands[p];
    h.splice(h.indexOf(c), 1);
    S.played[c] = 1;
    let broke = false;
    if (S.trick.length && cs(c) !== cs(S.trick[0].c)) S.vd[p * 4 + cs(S.trick[0].c)] = 1;
    if (!S.broken && cs(c) === 2) { S.broken = true; broke = true; }
    S.trick.push({ p, c });
    if (S.trick.length < 4) { S.turn = nextSeat(p); return { broke }; }
    const w = sWinner(S.trick);
    S.tw[w.p]++;
    const cards = S.trick;
    S.trick = []; S.tn++; S.lead = S.turn = w.p;
    return { broke, done: true, w: w.p, cards };
  }
  const sOver = S => S.tn >= 13;

  function sTeamScore(S, t) {
    const a = t, b = t + 2;
    const T = S.tw[a] + S.tw[b];
    let B = 0, nilPts = 0;
    const nils = [];
    for (const q of [a, b]) {
      if (S.bid[q] === 0) {
        const ok = S.tw[q] === 0;
        nilPts += (S.blind[q] ? 200 : 100) * (ok ? 1 : -1);
        nils.push({ p: q, ok, blind: S.blind[q] });
      } else B += S.bid[q];
    }
    let base = 0, over = 0;
    if (B > 0) { if (T >= B) { base = 10 * B; over = T - B; } else base = -10 * B; }
    else over = T;
    let bags = S.bags[t] + over, pen = 0;
    if (S.o.bagPen) while (bags >= 10) { bags -= 10; pen += 100; }
    return { bid: B, took: T, base, over, nilPts, nils, pen, bags, delta: base + over + nilPts - pen };
  }
  function sUtil(S, me) {
    const t = me & 1;
    const a = sTeamScore(S, t), b = sTeamScore(S, 1 - t);
    return a.delta - b.delta * 0.9;
  }
  function sNeed(S, p) {
    const q = (p + 2) % 4;
    let B = 0;
    for (const x of [p, q]) if (S.bid[x] !== 0) B += S.bid[x];
    return B - (S.tw[p] + S.tw[q]);
  }
  function sPolicy(S, p) {
    const L = sLegal(S, p);
    if (L.length === 1) return L[0];
    const tl = S.trick.length, h = S.hands[p];
    const q = (p + 2) % 4;
    const nilMe = S.bid[p] === 0 && S.tw[p] === 0;
    const partNil = S.bid[q] === 0 && S.tw[q] === 0;
    const need = sNeed(S, p);
    const nbs = [(p + 1) % 4, (p + 3) % 4].filter(x => S.bid[x] === 0 && S.tw[x] === 0);
    const hasPlayedAbove = (s, r) => { for (let x = r + 1; x <= 14; x++) { const c = mkc(s, x); if (!S.played[c] && !h.includes(c) && !S.trick.some(t => t.c === c)) return false; } return true; };
    if (tl === 0) {
      if (nilMe) return lowest(L.filter(c => cs(c) !== 2).length ? L.filter(c => cs(c) !== 2) : L);
      if (nbs.length && !partNil) { const side = L.filter(c => cs(c) !== 2); return lowest(side.length ? side : L); }
      if (need > 0 || partNil) {
        const boss = L.filter(c => cs(c) !== 2 && hasPlayedAbove(cs(c), cr(c)));
        if (boss.length) return highest(boss);
        const sp = L.filter(c => cs(c) === 2 && hasPlayedAbove(2, cr(c)));
        if (sp.length && S.broken) return highest(sp);
        const side = L.filter(c => cs(c) !== 2);
        if (side.length) return lowest(side);
        return highest(L);
      }
      const side = L.filter(c => cs(c) !== 2);
      return lowest(side.length ? side : L);
    }
    const ls = cs(S.trick[0].c);
    let w = S.trick[0];
    for (let i = 1; i < S.trick.length; i++) if (sBeats(S.trick[i].c, w.c, ls)) w = S.trick[i];
    const win = L.filter(c => sBeats(c, w.c, ls));
    const lose = L.filter(c => !sBeats(c, w.c, ls));
    const partWin = w.p === q;
    const last = tl === 3;
    if (nilMe) return lose.length ? highest(lose) : lowest(L);
    if (partWin && partNil && win.length) return lowest(win);
    if (nbs.length && !partNil && !nilMe) { const nb = nbs[0]; if (!S.trick.some(t => t.p === nb) || w.p === nb) return lowest(L); }
    if (partWin && !(last === false && cr(w.c) < 11 && cs(w.c) !== 2 && need > 0 && win.length)) return lowest(L);
    if (need > 0 || (partNil && !partWin)) {
      if (win.length) {
        if (last) return lowest(win);
        const cheap = win.filter(c => cs(c) === cs(w.c) || cs(c) === 2);
        if (cs(L[0]) === ls) { const hi = win.filter(c => cr(c) >= 12 || hasPlayedAbove(cs(c), cr(c))); if (hi.length) return lowest(hi); return lose.length ? lowest(lose) : lowest(win); }
        return lowest(cheap.length ? cheap : win);
      }
      return lowest(L);
    }
    if (lose.length) return highest(lose);
    return lowest(L);
  }
  function sSample(S, me) {
    const U = [];
    for (let c = 0; c < 52; c++) if (!S.played[c] && !S.hands[me].includes(c) && !S.trick.some(t => t.c === c)) U.push(c);
    const caps = [0, 1, 2, 3].map(q => (q === me ? 0 : S.hands[q].length));
    const out = dealUnseen(U, caps, (q, c) => !S.vd[q * 4 + cs(c)], null);
    const W = sClone(S);
    for (let q = 0; q < 4; q++) if (q !== me) W.hands[q] = out[q];
    return W;
  }
  const SG = { legal: sLegal, play: sPlay, over: sOver, policy: sPolicy, sample: sSample, clone: sClone, util: sUtil };
  const BID_OFF = 0.1;
  const S_LVL = { Easy: { n: 0, ms: 0 }, Normal: { n: 20, ms: 70 }, Hard: { n: 70, ms: 170 } };

  function sBotPlay(S, p, lvl) {
    const L = sLegal(S, p);
    if (L.length === 1) return L[0];
    const cfg = S_LVL[lvl] || S_LVL.Normal;
    if (!cfg.n) {
      if (Math.random() < 0.1) return L[(Math.random() * L.length) | 0];
      return sPolicy(S, p);
    }
    const r = pimc(SG, S, p, { n: cfg.n, ms: cfg.ms, eps: 0.4 });
    if (r.close.length > 1 && lvl === 'Hard') {
      const q = (p + 2) % 4;
      if (S.trick.length === 0) {
        const sig = r.close.filter(c => cs(c) !== 2 && S.sig && S.sig[q] && S.sig[q][cs(c)] > 0);
        if (sig.length) return highest(sig);
      }
      const pol = sPolicy(S, p);
      if (r.close.includes(pol)) return pol;
    }
    return r.best;
  }

  function sTricksSim(hand, mode, dealer, n, ms) {
    const rest = FULL.filter(c => !hand.includes(c));
    let tot = 0, cnt = 0, zero = 0;
    const t0 = now();
    for (let i = 0; i < n; i++) {
      if (i >= 8 && now() - t0 > ms) break;
      const d = shuf(rest.slice());
      const S = sNew();
      S.bid = mode === 'nil' ? [0, 13, 13, 13] : [13, 13, 13, 13];
      S.hands = [hand.slice(), d.slice(0, 13), d.slice(13, 26), d.slice(26, 39)];
      S.score = [0, 0];
      S.lead = S.turn = (dealer + 1) % 4;
      const first = S.lead;
      const me = 0;
      const rot = ((me - first) + 4) % 4;
      S.lead = S.turn = first;
      let g = 0;
      while (!sOver(S) && g++ < 80) sPlay(S, S.turn, sPolicy(S, S.turn));
      tot += S.tw[0]; if (S.tw[0] === 0) zero++;
      cnt++;
    }
    return { mean: tot / cnt, zero: zero / cnt };
  }

  function sBotBid(S, p, lvl) {
    const hand = S.hands[p];
    const dealer = S.dealer;
    const ord = ((p - dealer) + 4) % 4;
    const me = p & 1, q = (p + 2) % 4, opp = 1 - me;
    if (lvl === 'Easy') {
      let est = 0;
      for (const c of hand) { const r = cr(c); if (cs(c) === 2) est += r >= 13 ? 1 : r >= 11 ? 0.6 : 0.3; else if (r === 14) est += 0.9; else if (r === 13) est += 0.4; }
      return { n: Math.max(1, Math.round(est)) };
    }
    const sims = lvl === 'Hard' ? 70 : 28;
    const ms = lvl === 'Hard' ? 160 : 70;
    const rot = hand.slice();
    const sim = sTricksSim(rot, 'win', dealer + (4 - p), sims, ms);
    let n = Math.round(sim.mean + BID_OFF);
    n = Math.max(1, Math.min(13, n));
    const spLen = hand.filter(c => cs(c) === 2).length;
    const hi = hand.filter(c => cs(c) === 2 && cr(c) >= 11).length;
    const behind = S.score[opp] - S.score[me];
    const nilOk = S.bid[q] !== 0;
    if (nilOk) {
      const ns = sTricksSim(rot, 'nil', dealer + (4 - p), sims, ms);
      const hc = hand.filter(c => cr(c) >= 12).length, mxs = Math.max(0, ...hand.filter(c => cs(c) === 2).map(cr));
      const need = behind >= 100 ? 0.85 : 0.93;
      if (ns.zero >= need && mxs <= 9 && hc <= 3) return { n: 0 };
      if (behind >= 150 && ns.zero >= 0.8 && mxs <= 10 && hc <= 4) return { n: 0 };
    }
    const pb = S.bid[q];
    if (pb != null && pb > 0 && n + pb > 12) n = Math.max(1, 12 - pb);
    if (S.bags[me] >= 7 && n > 2) n -= 1;
    return { n };
  }
  function sBotBlind(S, p, lvl) {
    if (lvl === 'Easy') return false;
    const me = p & 1, opp = 1 - me;
    const behind = S.score[opp] - S.score[me];
    if (S.bid[(p + 2) % 4] === 0) return false;
    if (S.score[opp] >= S.o.target - 120 && behind >= 200) return Math.random() < 0.6;
    if (behind >= 250) return Math.random() < 0.12;
    return false;
  }

  function SpadesEngine(opt) {
    const o = Object.assign({}, SPADES_DEF, opt);
    const S = sNew();
    S.o = o; S.phase = 'new'; S.hno = 0; S.score = [0, 0]; S.hist = []; S.dealer = 0; S.look = [false, false, false, false]; S.okb = [false, false, false, false]; S.sig = null;
    let evs = [];
    const E = (k, d) => { evs.push(Object.assign({ k }, d)); };
    const take = () => { const r = evs; evs = []; return r; };
    const blindOK = p => {
      const me = p & 1, opp = 1 - me;
      return o.blind === 'any' || (o.blind === 'behind' && S.score[opp] - S.score[me] >= 100);
    };
    function deal() {
      const d = shuf(FULL.slice());
      const ns = sNew();
      for (let p = 0; p < 4; p++) ns.hands[p] = d.slice(p * 13, p * 13 + 13).sort(ssort);
      Object.assign(S, { hands: ns.hands, trick: [], tn: 0, played: ns.played, vd: ns.vd, broken: false, tw: [0, 0, 0, 0], bid: [null, null, null, null], blind: [false, false, false, false] });
      S.bags = S.bags.slice();
      S.bagsStart = S.bags.slice();
      S.okb = [0, 1, 2, 3].map(blindOK);
      S.look = S.okb.map(x => !x);
      S.phase = 'bid';
      S.turn = nextSeat(S.dealer);
      E('deal', { n: S.hno, dealer: S.dealer, hands: S.hands.map(h => h.slice()), okb: S.okb.slice(), look: S.look.slice() });
      E('turn', { tk: 'bid', p: S.turn });
    }
    function advanceBid() {
      if (S.bid.every(b => b != null)) {
        S.phase = 'play';
        S.lead = S.turn = nextSeat(S.dealer);
        E('bids', { bid: S.bid.slice(), blind: S.blind.slice() });
        E('turn', { tk: 'play', p: S.turn });
      } else {
        S.turn = nextSeat(S.turn);
        E('turn', { tk: 'bid', p: S.turn });
      }
    }
    function scoreHand() {
      const r = [sTeamScore(S, 0), sTeamScore(S, 1)];
      for (let t = 0; t < 2; t++) { S.score[t] += r[t].delta; S.bags[t] = r[t].bags; }
      S.hist.push({ r, score: S.score.slice(), bags: S.bags.slice(), dealer: S.dealer });
      let win = -1;
      const s0 = S.score[0], s1 = S.score[1];
      if (s0 >= o.target || s1 >= o.target) { if (s0 > s1) win = 0; else if (s1 > s0) win = 1; }
      else if (s0 <= o.floor || s1 <= o.floor) { if (s0 < s1 && s0 <= o.floor) win = 1; else if (s1 < s0 && s1 <= o.floor) win = 0; }
      S.phase = win < 0 ? 'between' : 'over';
      E('hand', { r, tw: S.tw.slice(), bid: S.bid.slice(), blind: S.blind.slice(), score: S.score.slice(), bags: S.bags.slice(), n: S.hno });
      if (win >= 0) E('over', { winner: win, score: S.score.slice() });
    }
    const eng = {
      id: 'spades', o, s: S,
      start() { deal(); return take(); },
      next() { if (S.phase !== 'between') return []; S.hno++; S.dealer = nextSeat(S.dealer); deal(); return take(); },
      need() {
        if (S.phase === 'bid' || S.phase === 'play') return [{ p: S.turn, k: S.phase }];
        return [];
      },
      legal(p) { return S.phase === 'play' && p === S.turn ? sLegal(S, p) : []; },
      act(p, a) {
        if (!a || p !== S.turn) return null;
        if (S.phase === 'bid') {
          if (S.bid[p] != null) return null;
          if (a.t === 'look') {
            if (S.look[p]) return null;
            S.look[p] = true; E('look', { p });
            E('turn', { tk: 'bid', p });
            return take();
          }
          if (a.t === 'blind') {
            if (S.look[p] || !S.okb[p]) return null;
            S.look[p] = true; S.bid[p] = 0; S.blind[p] = true;
            E('bid', { p, n: 0, blind: true }); E('look', { p });
            advanceBid();
            return take();
          }
          if (a.t === 'bid') {
            const n = a.n | 0;
            if (!S.look[p] || n < 0 || n > 13) return null;
            S.bid[p] = n;
            E('bid', { p, n, blind: false });
            advanceBid();
            return take();
          }
          return null;
        }
        if (S.phase === 'play' && a.t === 'play' && sLegal(S, p).includes(a.c)) {
          const r = sPlay(S, p, a.c);
          E('play', { p, c: a.c });
          if (r.broke) E('broken', {});
          if (r.done) {
            E('trick', { w: r.w, cards: r.cards.map(t => ({ p: t.p, c: t.c })) });
            if (sOver(S)) scoreHand();
            else E('turn', { tk: 'play', p: S.turn });
          } else E('turn', { tk: 'play', p: S.turn });
          return take();
        }
        return null;
      },
      bot(p, lvl) {
        if (S.phase === 'bid') {
          if (!S.look[p]) return sBotBlind(S, p, lvl) ? { t: 'blind' } : { t: 'look' };
          return Object.assign({ t: 'bid' }, sBotBid(S, p, lvl));
        }
        return { t: 'play', c: sBotPlay(S, p, lvl) };
      },
      view(p) {
        return { g: 'spades', phase: S.phase, n: S.hno, dealer: S.dealer, hand: S.hands[p].slice(), counts: S.hands.map(h => h.length), trick: S.trick.map(t => ({ p: t.p, c: t.c })), turn: S.phase === 'bid' || S.phase === 'play' ? S.turn : -1, broken: S.broken, score: S.score.slice(), bags: S.bags.slice(), bid: S.bid.slice(), blind: S.blind.slice(), tw: S.tw.slice(), okb: S.okb.slice(), look: S.look.slice(), hist: S.hist.map(h => ({ r: h.r, score: h.score, bags: h.bags, dealer: h.dealer })), tn: S.tn, o };
      },
      filt(e, p) {
        if (e.k === 'deal') return { k: 'deal', n: e.n, dealer: e.dealer, hand: e.hands[p].slice(), okb: e.okb, look: e.look, counts: [13, 13, 13, 13] };
        return e;
      }
    };
    return eng;
  }


  const EUCHRE_DEF = { target: 5, stick: true, alone: true, noPartner: false };
  const EDECK = [];
  for (let s = 0; s < 4; s++) for (let r = 9; r <= 14; r++) EDECK.push(mkc(s, r));
  const mate = s => (s + 2) % 4;
  const esuit = (c, t) => (cr(c) === 11 && cs(c) === mate(t) ? t : cs(c));
  function estr(c, led, t) {
    const s = cs(c), r = cr(c);
    if (r === 11 && s === t) return 200;
    if (r === 11 && s === mate(t)) return 190;
    if (s === t) return 100 + r;
    if (s === led) return r;
    return 0;
  }
  const esort = t => (a, b) => {
    const ka = (t >= 0 ? (esuit(a, t) === t ? -1 : 0) : 0) * 100 + SORD_E[esuit(a, t)] * 20 + estrK(a, t);
    const kb = (t >= 0 ? (esuit(b, t) === t ? -1 : 0) : 0) * 100 + SORD_E[esuit(b, t)] * 20 + estrK(b, t);
    return ka - kb;
  };
  const SORD_E = [0, 1, 2, 3];
  function estrK(c, t) {
    if (t >= 0 && cr(c) === 11 && cs(c) === t) return -3;
    if (t >= 0 && cr(c) === 11 && cs(c) === mate(t)) return -2;
    return 14 - cr(c);
  }

  function eNew() {
    return { hands: [[], [], [], []], trick: [], lead: 0, turn: 0, tn: 0, played: new Uint8Array(52), vd: new Uint8Array(16), tw: [0, 0, 0, 0], trump: -1, maker: -1, alone: false, out: -1, dealer: 0, o: EUCHRE_DEF, known: [] };
  }
  function eClone(S) {
    return { hands: S.hands.map(h => h.slice()), trick: S.trick.slice(), lead: S.lead, turn: S.turn, tn: S.tn, played: S.played.slice(), vd: S.vd.slice(), tw: S.tw.slice(), trump: S.trump, maker: S.maker, alone: S.alone, out: S.out, dealer: S.dealer, o: S.o, known: S.known };
  }
  const eNext = (S, p) => { let q = nextSeat(p); if (q === S.out) q = nextSeat(q); return q; };
  const eNeed = S => (S.out >= 0 ? 3 : 4);
  function eLegal(S, p) {
    const h = S.hands[p];
    if (!S.trick.length) return h.slice();
    const ls = esuit(S.trick[0].c, S.trump);
    const f = h.filter(c => esuit(c, S.trump) === ls);
    return f.length ? f : h.slice();
  }
  function ePlay(S, p, c) {
    const h = S.hands[p];
    h.splice(h.indexOf(c), 1);
    S.played[c] = 1;
    if (S.trick.length) {
      const ls = esuit(S.trick[0].c, S.trump);
      if (esuit(c, S.trump) !== ls) S.vd[p * 4 + ls] = 1;
    }
    S.trick.push({ p, c });
    if (S.trick.length < eNeed(S)) { S.turn = eNext(S, p); return {}; }
    const ls = esuit(S.trick[0].c, S.trump);
    let w = S.trick[0], wv = estr(w.c, ls, S.trump);
    for (const t of S.trick) { const v = estr(t.c, ls, S.trump); if (v > wv) { wv = v; w = t; } }
    S.tw[w.p]++;
    const cards = S.trick;
    S.trick = []; S.tn++; S.lead = S.turn = w.p;
    return { done: true, w: w.p, cards };
  }
  const eOver = S => S.tn >= 5;
  function eResult(S) {
    const mt = S.maker & 1;
    const mk = S.tw[mt] + S.tw[mt + 2];
    if (mk >= 3) return { team: mt, pts: mk === 5 ? (S.alone ? 4 : 2) : 1, euchre: false, tricks: mk };
    return { team: 1 - mt, pts: 2, euchre: true, tricks: mk };
  }
  function eUtil(S, me) {
    const r = eResult(S);
    return r.team === (me & 1) ? r.pts : -r.pts;
  }

  function ePolicy(S, p) {
    const L = eLegal(S, p);
    if (L.length === 1) return L[0];
    const t = S.trump, tl = S.trick.length;
    const q = (p + 2) % 4;
    const mine = (S.maker & 1) === (p & 1);
    const h = S.hands[p];
    const isT = c => esuit(c, t) === t;
    if (tl === 0) {
      const tr = L.filter(isT);
      const strong = tr.filter(c => estr(c, t, t) >= 190);
      if (mine && tr.length >= 2 && strong.length) return pickBy(tr, c => estr(c, t, t));
      if (mine && tr.length >= 3) return pickBy(tr, c => estr(c, t, t));
      const aces = L.filter(c => !isT(c) && cr(c) === 14);
      if (aces.length) return aces[0];
      const non = L.filter(c => !isT(c));
      if (!mine && non.length) {
        let b = non[0], bv = 1e9;
        for (const c of non) { const n = h.filter(x => esuit(x, t) === cs(c)).length; const v = n * 10 + cr(c); if (v < bv) { bv = v; b = c; } }
        return b;
      }
      if (tr.length && mine) return pickBy(tr, c => estr(c, t, t));
      if (non.length) return lowest(non);
      return lowest(L);
    }
    const ls = esuit(S.trick[0].c, t);
    let w = S.trick[0], wv = estr(w.c, ls, t);
    for (const x of S.trick) { const v = estr(x.c, ls, t); if (v > wv) { wv = v; w = x; } }
    const win = L.filter(c => estr(c, ls, t) > wv);
    const partWin = w.p === q;
    const last = tl === eNeed(S) - 1;
    if (partWin && (last || wv >= 190 || (wv >= 114 && !win.length))) { const lo = L.filter(c => !isT(c)); return lowest(lo.length ? lo : L); }
    if (win.length) {
      if (partWin) { const lo = L.filter(c => estr(c, ls, t) <= wv); if (lo.length && !last) return lowest(lo); }
      return pickBy(win, c => -estr(c, ls, t));
    }
    const lo = L.filter(c => !isT(c));
    return pickBy(lo.length ? lo : L, c => -(estr(c, ls, t) * 20 + cr(c)));
  }
  function eSample(S, me) {
    const U = [];
    const inH = S.hands[me];
    for (const c of EDECK) if (!S.played[c] && !inH.includes(c) && !S.trick.some(t => t.c === c)) U.push(c);
    const caps = [0, 1, 2, 3].map(q => (q === me ? 0 : S.hands[q].length));
    let hid = U.length;
    for (let q = 0; q < 4; q++) hid -= caps[q];
    caps.push(Math.max(0, hid));
    const fixed = [];
    for (const [q, c] of S.known) if (q !== me && !S.played[c] && !S.trick.some(t => t.c === c) && U.includes(c)) fixed.push([q, c]);
    const out = dealUnseen(U, caps, (q, c) => q === 4 || !S.vd[q * 4 + esuit(c, S.trump)], fixed);
    const W = eClone(S);
    for (let q = 0; q < 4; q++) if (q !== me) W.hands[q] = out[q];
    return W;
  }
  const EG = { legal: eLegal, play: ePlay, over: eOver, policy: ePolicy, sample: eSample, clone: eClone, util: eUtil };
  const E_LVL = { Easy: { n: 0, ms: 0 }, Normal: { n: 22, ms: 60 }, Hard: { n: 60, ms: 150 } };

  function eBotPlay(S, p, lvl) {
    const L = eLegal(S, p);
    if (L.length === 1) return L[0];
    const cfg = E_LVL[lvl] || E_LVL.Normal;
    if (!cfg.n) {
      if (Math.random() < 0.1) return L[(Math.random() * L.length) | 0];
      return ePolicy(S, p);
    }
    const r = pimc(EG, S, p, { n: cfg.n, ms: cfg.ms, eps: 0.02 });
    if (r.close.length > 1) {
      const pol = ePolicy(S, p);
      if (r.close.includes(pol)) return pol;
    }
    return r.best;
  }

  function eDiscardPick(h, t) {
    let b = h[0], bv = 1e9;
    for (const c of h) {
      const s = esuit(c, t);
      let v;
      if (s === t) v = 60 + (cr(c) === 11 ? 40 : cr(c));
      else {
        const n = h.filter(x => esuit(x, t) === s).length;
        v = cr(c) + (cr(c) === 14 ? 25 : 0) - (n === 1 ? 6 : 0) + (n >= 3 ? 4 : 0);
      }
      if (v < bv) { bv = v; b = c; }
    }
    return b;
  }

  function eSimCall(S, me, trump, alone, up, n, ms) {
    const dealer = S.dealer;
    const hand = S.hands[me].slice();
    const U = [];
    for (const c of EDECK) if (!hand.includes(c) && c !== up) U.push(c);
    let tot = 0, cnt = 0;
    const t0 = now();
    for (let i = 0; i < n; i++) {
      if (i >= 6 && now() - t0 > ms) break;
      const pool = shuf(U.slice());
      const W = eNew();
      W.o = S.o; W.dealer = dealer; W.trump = trump; W.maker = me; W.alone = alone;
      let k = 0;
      for (let q = 0; q < 4; q++) {
        if (q === me) { W.hands[q] = hand.slice(); continue; }
        W.hands[q] = pool.slice(k, k + 5); k += 5;
      }
      if (S.phase === 'bid1') {
        const d = W.hands[dealer];
        if (!(alone && dealer === mate(me))) {
          d.push(up);
          d.splice(d.indexOf(eDiscardPick(d, trump)), 1);
        }
        if (dealer !== me) W.known = [[dealer, up]];
      }
      if (alone) { W.out = mate(me); W.hands[W.out] = []; }
      let l = nextSeat(dealer);
      if (l === W.out) l = nextSeat(l);
      W.lead = W.turn = l;
      let g = 0;
      while (!eOver(W) && g++ < 40) ePlay(W, W.turn, ePolicy(W, W.turn));
      tot += eUtil(W, me); cnt++;
    }
    return tot / cnt;
  }

  function eBotBid(S, p, lvl) {
    const up = S.up, dealer = S.dealer;
    const h = S.hands[p];
    const me = p & 1;
    const lead = S.o.alone;
    const cfg = lvl === 'Hard' ? { n: 60, ms: 140 } : { n: 24, ms: 60 };
    const press = (S.score[1 - me] >= S.o.target - 1 ? -0.25 : 0) + (S.score[me] >= S.o.target - 1 ? 0.08 : 0);
    if (S.phase === 'bid1') {
      const s = cs(up);
      if (lvl === 'Easy') {
        let v = 0;
        for (const c of h) { if (esuit(c, s) === s) v += cr(c) === 11 ? 2.2 : cr(c) >= 13 ? 1.4 : 1; else if (cr(c) === 14) v += 0.8; }
        if (dealer === p || dealer === mate(p)) v += 0.8; else v -= 0.6;
        return v >= 5 ? { t: 'order', alone: false } : { t: 'pass' };
      }
      const ev = eSimCall(S, p, s, false, up, cfg.n, cfg.ms);
      let evA = -9;
      if (lead && lvl === 'Hard') evA = eSimCall(S, p, s, true, up, cfg.n, cfg.ms);
      const th = 0.22 - press;
      if (Math.max(ev, evA) > th + (S.score[me] >= S.o.target - 2 ? 0.05 : 0)) return { t: 'order', alone: evA > ev + 0.25 && evA > 0.45 };
      return { t: 'pass' };
    }
    const bad = cs(up);
    const stuck = S.o.stick && p === dealer;
    if (lvl === 'Easy') {
      let best = -1, bv = -1;
      for (let s = 0; s < 4; s++) {
        if (s === bad) continue;
        let v = 0;
        for (const c of h) { if (esuit(c, s) === s) v += cr(c) === 11 ? 2.2 : cr(c) >= 13 ? 1.4 : 1; else if (cr(c) === 14) v += 0.8; }
        if (v > bv) { bv = v; best = s; }
      }
      if (bv >= 4.6 || stuck) return { t: 'call', s: best, alone: false };
      return { t: 'pass' };
    }
    let best = -1, bv = -9, ba = false;
    for (let s = 0; s < 4; s++) {
      if (s === bad) continue;
      const ev = eSimCall(S, p, s, false, up, cfg.n, cfg.ms);
      let evA = -9;
      if (lead && lvl === 'Hard' && ev > 0.3) evA = eSimCall(S, p, s, true, up, cfg.n, cfg.ms);
      const m = Math.max(ev, evA);
      if (m > bv) { bv = m; best = s; ba = evA > ev + 0.25 && evA > 0.45; }
    }
    if (bv > 0.1 - press || stuck) return { t: 'call', s: best, alone: ba };
    return { t: 'pass' };
  }

  function EuchreEngine(opt) {
    const o = Object.assign({}, EUCHRE_DEF, opt);
    const S = eNew();
    S.o = o; S.phase = 'new'; S.hno = 0; S.score = [0, 0]; S.hist = []; S.dealer = 0; S.up = -1; S.upS = -1; S.kitty = []; S.passes = 0; S.dis = -1; S.sig = null;
    let evs = [];
    const E = (k, d) => { evs.push(Object.assign({ k }, d)); };
    const take = () => { const r = evs; evs = []; return r; };
    function deal() {
      const d = shuf(EDECK.slice());
      const ns = eNew();
      for (let p = 0; p < 4; p++) ns.hands[p] = d.slice(p * 5, p * 5 + 5);
      Object.assign(S, { hands: ns.hands, trick: [], tn: 0, played: ns.played, vd: ns.vd, tw: [0, 0, 0, 0], trump: -1, maker: -1, alone: false, out: -1, known: [] });
      S.kitty = d.slice(20);
      S.up = S.kitty[0]; S.upS = cs(S.up);
      for (const h of S.hands) h.sort(esort(-1));
      S.phase = 'bid1'; S.passes = 0; S.turn = nextSeat(S.dealer);
      E('deal', { n: S.hno, dealer: S.dealer, hands: S.hands.map(h => h.slice()), up: S.up });
      E('turn', { tk: 'bid1', p: S.turn });
    }
    function startPlay() {
      S.phase = 'play';
      for (const h of S.hands) h.sort(esort(S.trump));
      S.played = new Uint8Array(52);
      if (S.alone) { S.out = mate(S.maker); S.hands[S.out] = []; }
      let l = nextSeat(S.dealer);
      if (l === S.out) l = nextSeat(l);
      S.lead = S.turn = l;
      E('play0', { trump: S.trump, maker: S.maker, alone: S.alone, out: S.out });
      E('turn', { tk: 'play', p: l });
    }
    function setTrump(p, s, alone, round) {
      S.trump = s; S.maker = p; S.alone = !!alone && o.alone;
      E('trump', { p, s, alone: S.alone, round });
      if (round === 1) {
        const d = S.dealer;
        if (S.alone && d === mate(p)) { E('noPick', {}); startPlay(); return; }
        S.hands[d].push(S.up);
        S.known = [[d, S.up]];
        S.phase = 'discard'; S.turn = d;
        E('pickup', { p: d, c: S.up });
        E('turn', { tk: 'discard', p: d });
      } else startPlay();
    }
    function scoreHand() {
      const r = eResult(S);
      S.score[r.team] += r.pts;
      S.hist.push({ maker: S.maker, trump: S.trump, alone: S.alone, team: r.team, pts: r.pts, euchre: r.euchre, tricks: r.tricks, tw: S.tw.slice(), dealer: S.dealer, score: S.score.slice() });
      const win = S.score[r.team] >= o.target ? r.team : -1;
      S.phase = win < 0 ? 'between' : 'over';
      E('hand', { team: r.team, pts: r.pts, euchre: r.euchre, tricks: r.tricks, tw: S.tw.slice(), maker: S.maker, trump: S.trump, alone: S.alone, score: S.score.slice(), n: S.hno });
      if (win >= 0) E('over', { winner: win, score: S.score.slice() });
    }
    const eng = {
      id: 'euchre', o, s: S,
      start() { deal(); return take(); },
      next() { if (S.phase !== 'between') return []; S.hno++; S.dealer = nextSeat(S.dealer); deal(); return take(); },
      need() {
        if (S.phase === 'bid1' || S.phase === 'bid2' || S.phase === 'discard' || S.phase === 'play') return [{ p: S.turn, k: S.phase }];
        return [];
      },
      legal(p) { return S.phase === 'play' && p === S.turn ? eLegal(S, p) : []; },
      act(p, a) {
        if (!a || p !== S.turn) return null;
        if (S.phase === 'bid1') {
          if (a.t === 'pass') {
            S.passes++;
            E('bid', { p, t: 'pass' });
            if (S.passes === 4) {
              S.phase = 'bid2'; S.passes = 0; S.turn = nextSeat(S.dealer);
              E('turndown', { c: S.up });
              E('turn', { tk: 'bid2', p: S.turn });
            } else { S.turn = nextSeat(p); E('turn', { tk: 'bid1', p: S.turn }); }
            return take();
          }
          if (a.t === 'order') {
            E('bid', { p, t: 'order', alone: !!a.alone && o.alone });
            setTrump(p, S.upS, a.alone, 1);
            return take();
          }
          return null;
        }
        if (S.phase === 'bid2') {
          if (a.t === 'pass') {
            if (o.stick && p === S.dealer) return null;
            S.passes++;
            E('bid', { p, t: 'pass' });
            if (S.passes === 4) {
              E('redeal', {});
              S.phase = 'between';
              S.hist.push({ redeal: true, dealer: S.dealer, score: S.score.slice() });
            } else { S.turn = nextSeat(p); E('turn', { tk: 'bid2', p: S.turn }); }
            return take();
          }
          if (a.t === 'call') {
            if (!(a.s >= 0 && a.s < 4) || a.s === S.upS) return null;
            E('bid', { p, t: 'call', s: a.s, alone: !!a.alone && o.alone });
            setTrump(p, a.s, a.alone, 2);
            return take();
          }
          return null;
        }
        if (S.phase === 'discard') {
          if (a.t !== 'discard' || p !== S.dealer || !S.hands[p].includes(a.c)) return null;
          const h = S.hands[p];
          h.splice(h.indexOf(a.c), 1);
          if (a.c === S.up) S.known = [];
          E('discard', { p, c: a.c });
          startPlay();
          return take();
        }
        if (S.phase === 'play' && a.t === 'play' && eLegal(S, p).includes(a.c)) {
          const r = ePlay(S, p, a.c);
          E('play', { p, c: a.c });
          if (r.done) {
            E('trick', { w: r.w, cards: r.cards.map(t => ({ p: t.p, c: t.c })) });
            if (eOver(S)) scoreHand();
            else E('turn', { tk: 'play', p: S.turn });
          } else E('turn', { tk: 'play', p: S.turn });
          return take();
        }
        return null;
      },
      bot(p, lvl) {
        if (S.phase === 'bid1' || S.phase === 'bid2') return eBotBid(S, p, lvl);
        if (S.phase === 'discard') return { t: 'discard', c: eDiscardPick(S.hands[p], S.trump) };
        return { t: 'play', c: eBotPlay(S, p, lvl) };
      },
      view(p) {
        return { g: 'euchre', phase: S.phase, n: S.hno, dealer: S.dealer, hand: S.hands[p].slice(), counts: S.hands.map(h => h.length), trick: S.trick.map(t => ({ p: t.p, c: t.c })), turn: ['bid1', 'bid2', 'discard', 'play'].includes(S.phase) ? S.turn : -1, up: S.up, upS: S.upS, trump: S.trump, maker: S.maker, alone: S.alone, out: S.out, tw: S.tw.slice(), score: S.score.slice(), hist: S.hist.map(h => Object.assign({}, h)), tn: S.tn, passes: S.passes, o };
      },
      filt(e, p) {
        if (e.k === 'deal') return { k: 'deal', n: e.n, dealer: e.dealer, hand: e.hands[p].slice(), up: e.up, counts: [5, 5, 5, 5] };
        if (e.k === 'discard' && e.p !== p) return { k: 'discard', p: e.p, c: -1 };
        return e;
      }
    };
    return eng;
  }


  const CW = 88, CH = 124;
  const INK = ['#1b1e25', '#cf2530', '#1b1e25', '#cf2530'];
  const FONT = '"Nunito","Arial Rounded MT Bold",ui-rounded,system-ui,-apple-system,"Segoe UI",sans-serif';

  function suitPath(x, s, cx, cy, sz) {
    const r = sz / 2;
    x.save(); x.translate(cx, cy); x.scale(r, r);
    x.beginPath();
    if (s === 3) {
      x.moveTo(0, 0.95);
      x.bezierCurveTo(-0.2, 0.7, -1.0, 0.2, -1.0, -0.3);
      x.bezierCurveTo(-1.0, -0.8, -0.3, -1.0, 0, -0.45);
      x.bezierCurveTo(0.3, -1.0, 1.0, -0.8, 1.0, -0.3);
      x.bezierCurveTo(1.0, 0.2, 0.2, 0.7, 0, 0.95);
    } else if (s === 1) {
      x.moveTo(0, -1); x.lineTo(0.64, 0); x.lineTo(0, 1); x.lineTo(-0.64, 0);
    } else if (s === 2) {
      x.moveTo(0, -1);
      x.bezierCurveTo(0.12, -0.55, 1.0, -0.2, 1.0, 0.28);
      x.bezierCurveTo(1.0, 0.76, 0.34, 0.84, 0.1, 0.42);
      x.lineTo(0.34, 0.98); x.lineTo(-0.34, 0.98); x.lineTo(-0.1, 0.42);
      x.bezierCurveTo(-0.34, 0.84, -1.0, 0.76, -1.0, 0.28);
      x.bezierCurveTo(-1.0, -0.2, -0.12, -0.55, 0, -1);
    } else {
      x.arc(0, -0.5, 0.44, 0, TAU);
      x.moveTo(-0.08, 0.1); x.arc(-0.52, 0.18, 0.44, 0, TAU);
      x.moveTo(0.96, 0.18); x.arc(0.52, 0.18, 0.44, 0, TAU);
      x.moveTo(-0.15, 0); x.lineTo(0.15, 0); x.lineTo(0.3, 0.98); x.lineTo(-0.3, 0.98);
    }
    x.closePath();
    x.restore();
  }
  function pip(x, s, cx, cy, sz, flip) {
    x.save();
    if (flip) { x.translate(cx, cy); x.rotate(Math.PI); x.translate(-cx, -cy); }
    x.fillStyle = INK[s];
    suitPath(x, s, cx, cy, sz);
    x.fill('nonzero');
    x.restore();
  }
  function rrPath(x, a, b, w, h, r) {
    x.beginPath();
    x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r);
    x.closePath();
  }
  const L4 = [[.3, .2], [.7, .2], [.3, .8], [.7, .8]], L6 = L4.concat([[.3, .5], [.7, .5]]);
  const L8 = [[.3, .2], [.7, .2], [.3, .4], [.7, .4], [.3, .6], [.7, .6], [.3, .8], [.7, .8]];
  const PIPS = {
    2: [[.5, .2], [.5, .8]], 3: [[.5, .2], [.5, .5], [.5, .8]], 4: L4, 5: L4.concat([[.5, .5]]), 6: L6,
    7: L6.concat([[.5, .35]]), 8: L6.concat([[.5, .35], [.5, .65]]), 9: L8.concat([[.5, .5]]), 10: L8.concat([[.5, .3], [.5, .7]])
  };
  function court(x, r, s, w, h) {
    const col = INK[s], red = s === 1 || s === 3;
    const gold = '#e5b53a', skin = '#f4d3b2', hair = r === 12 ? '#8a4b1f' : '#5a3a1e';
    const main = red ? '#c8323c' : '#2c4f9a', alt = red ? '#2c4f9a' : '#c8323c';
    x.save();
    x.translate(w * 0.5, h * 0.305);
    const u = w / 100 * 1.12;
    x.scale(u, u);
    x.fillStyle = main;
    x.beginPath(); x.moveTo(-26, 26); x.quadraticCurveTo(-24, 8, -9, 6); x.lineTo(9, 6); x.quadraticCurveTo(24, 8, 26, 26); x.closePath(); x.fill();
    x.fillStyle = alt; x.fillRect(-6, 8, 12, 18);
    x.fillStyle = gold; x.fillRect(-26, 21, 52, 3.5);
    x.fillStyle = skin; x.beginPath(); x.ellipse(0, -4, 10, 12, 0, 0, TAU); x.fill();
    x.fillStyle = '#2a2a2a'; x.beginPath(); x.arc(-4, -5, 1.1, 0, TAU); x.arc(4, -5, 1.1, 0, TAU); x.fill();
    x.strokeStyle = '#a5564a'; x.lineWidth = 1; x.beginPath(); x.moveTo(-3, 2); x.quadraticCurveTo(0, 4, 3, 2); x.stroke();
    if (r === 13) {
      x.fillStyle = '#b9b3a8'; x.beginPath(); x.moveTo(-10, -1); x.quadraticCurveTo(0, 22, 10, -1); x.quadraticCurveTo(0, 6, -10, -1); x.fill();
      x.fillStyle = gold; x.beginPath(); x.moveTo(-11, -13); x.lineTo(-13, -26); x.lineTo(-6, -19); x.lineTo(0, -29); x.lineTo(6, -19); x.lineTo(13, -26); x.lineTo(11, -13); x.closePath(); x.fill();
      x.fillStyle = col; x.beginPath(); x.arc(0, -17, 2, 0, TAU); x.fill();
    } else if (r === 12) {
      x.fillStyle = hair; x.beginPath(); x.moveTo(-12, -2); x.quadraticCurveTo(-16, -22, 0, -20); x.quadraticCurveTo(16, -22, 12, -2); x.quadraticCurveTo(14, 12, 8, 16); x.lineTo(10, -4); x.quadraticCurveTo(0, -14, -10, -4); x.lineTo(-8, 16); x.quadraticCurveTo(-14, 12, -12, -2); x.fill();
      x.fillStyle = gold; x.beginPath(); x.moveTo(-9, -15); x.lineTo(-10, -25); x.lineTo(-4, -20); x.lineTo(0, -27); x.lineTo(4, -20); x.lineTo(10, -25); x.lineTo(9, -15); x.closePath(); x.fill();
      x.fillStyle = col; x.beginPath(); x.arc(-5, -19, 1.4, 0, TAU); x.arc(5, -19, 1.4, 0, TAU); x.fill();
    } else {
      x.fillStyle = hair; x.beginPath(); x.moveTo(-11, -4); x.quadraticCurveTo(-13, -14, -4, -14); x.lineTo(8, -14); x.quadraticCurveTo(12, -10, 11, -4); x.quadraticCurveTo(0, -12, -11, -4); x.fill();
      x.fillStyle = alt; x.beginPath(); x.moveTo(-13, -12); x.quadraticCurveTo(0, -30, 14, -12); x.closePath(); x.fill();
      x.fillStyle = gold; x.fillRect(-13, -13, 27, 2.6);
      x.strokeStyle = col; x.lineWidth = 2.4; x.beginPath(); x.moveTo(8, -20); x.quadraticCurveTo(20, -34, 18, -18); x.stroke();
    }
    x.restore();
  }
  function drawFace(x, c, w, h) {
    const s = cs(c), r = cr(c), col = INK[s];
    x.clearRect(0, 0, w, h);
    const pad = 1;
    rrPath(x, pad, pad, w - pad * 2, h - pad * 2, w * 0.085);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f1f1ee');
    x.fillStyle = g; x.fill();
    x.lineWidth = Math.max(1, w * 0.012); x.strokeStyle = '#b8bcc6'; x.stroke();
    x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
    const ix = w * 0.13, iy = h * 0.115;
    const idx = (flip) => {
      x.save();
      if (flip) { x.translate(w / 2, h / 2); x.rotate(Math.PI); x.translate(-w / 2, -h / 2); }
      x.font = `800 ${h * (r === 10 ? 0.15 : 0.18)}px ${FONT}`;
      x.fillStyle = col;
      x.fillText(RL(r), ix, iy);
      pip(x, s, ix, h * 0.245, w * 0.15, false);
      x.restore();
    };
    idx(false); idx(true);
    if (r >= 11 && r <= 13) {
      const fx = w * 0.22, fy = h * 0.14, fw = w * 0.56, fh = h * 0.72;
      x.save();
      rrPath(x, fx, fy, fw, fh, 3);
      const gg = x.createLinearGradient(fx, fy, fx + fw, fy + fh); gg.addColorStop(0, '#fbf3df'); gg.addColorStop(1, '#f2e6c5');
      x.fillStyle = gg; x.fill(); x.lineWidth = Math.max(1, w * 0.014); x.strokeStyle = col; x.stroke();
      x.clip();
      x.save(); x.translate(fx - w * 0.22, fy - h * 0.14 + h * 0.015); court(x, r, s, w, h); x.restore();
      x.save(); x.translate(fx + fw / 2, fy + fh / 2); x.rotate(Math.PI); x.translate(-(fx + fw / 2), -(fy + fh / 2));
      x.translate(fx - w * 0.22, fy - h * 0.14 + h * 0.015); court(x, r, s, w, h); x.restore();
      x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1; x.beginPath(); x.moveTo(fx, fy + fh / 2); x.lineTo(fx + fw, fy + fh / 2); x.stroke();
      pip(x, s, fx + fw * 0.18, fy + fh * 0.2, w * 0.14, false);
      pip(x, s, fx + fw * 0.82, fy + fh * 0.8, w * 0.14, true);
      x.restore();
    } else if (r === 14) {
      pip(x, s, w / 2, h / 2, w * (s === 2 ? 0.58 : 0.5), false);
    } else {
      const ps = w * 0.22;
      for (const [px, py] of PIPS[r]) pip(x, s, w * (0.5 + (px - 0.5) * 0.86), h * (0.07 + py * 0.86), ps, py > 0.5);
    }
  }
  const BACKS = {
    blue: ['#2150b0', '#0f2a73', '#9fb8f0'],
    red: ['#b8262e', '#6a0f16', '#f0a6aa']
  };
  function drawBack(x, w, h, style) {
    const [a, b, l] = BACKS[style] || BACKS.blue;
    x.clearRect(0, 0, w, h);
    rrPath(x, 1, 1, w - 2, h - 2, w * 0.085);
    x.fillStyle = '#fff'; x.fill();
    x.lineWidth = Math.max(1, w * 0.012); x.strokeStyle = '#b8bcc6'; x.stroke();
    const m = w * 0.075;
    x.save();
    rrPath(x, m, m, w - m * 2, h - m * 2, w * 0.05);
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b);
    x.fillStyle = g; x.fill(); x.clip();
    x.strokeStyle = l; x.globalAlpha = 0.42; x.lineWidth = Math.max(1, w * 0.014);
    const st = w * 0.14;
    for (let i = -h; i < w + h; i += st) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke();
      x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke();
    }
    x.globalAlpha = 1;
    x.fillStyle = b; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.29, h * 0.2, 0, 0, TAU); x.fill();
    x.lineWidth = Math.max(1.2, w * 0.02); x.strokeStyle = l; x.stroke();
    x.fillStyle = l; suitPath(x, 3, w / 2, h / 2, w * 0.2); x.fill();
    x.restore();
    rrPath(x, m, m, w - m * 2, h - m * 2, w * 0.05);
    x.lineWidth = Math.max(1, w * 0.016); x.strokeStyle = 'rgba(255,255,255,.85)'; x.stroke();
  }
  const SPR = { k: 2, faces: new Map(), backs: {} };
  function faceUrl(c) {
    let u = SPR.faces.get(c);
    if (!u) {
      const cv = document.createElement('canvas'); cv.width = CW * SPR.k; cv.height = CH * SPR.k;
      const x = cv.getContext('2d'); x.scale(SPR.k, SPR.k);
      drawFace(x, c, CW, CH);
      u = cv.toDataURL('image/png');
      SPR.faces.set(c, u);
    }
    return u;
  }
  function backUrl(style) {
    let u = SPR.backs[style];
    if (!u) {
      const cv = document.createElement('canvas'); cv.width = CW * SPR.k; cv.height = CH * SPR.k;
      const x = cv.getContext('2d'); x.scale(SPR.k, SPR.k);
      drawBack(x, CW, CH, style);
      u = SPR.backs[style] = cv.toDataURL('image/png');
    }
    return u;
  }

  const SKIN = ['#f6d5b8', '#e8b48a', '#c98d62', '#8d5a3b', '#f2c9a5'];
  const HAIR = ['#2b1d12', '#6b3d1a', '#d9a441', '#9c2a1c', '#3b3b44', '#e8e0cf'];
  const AVBG = ['#3d8bd9', '#d9693d', '#4fb06b', '#9a5fd1', '#d9a63d', '#d95a8b', '#3dbdb8', '#7b86a3'];
  const avCache = {};
  function avatarUrl(i) {
    if (avCache[i]) return avCache[i];
    const bg = AVBG[i % 8], skin = SKIN[(i * 3 + 1) % 5], hair = HAIR[(i * 5 + 2) % 6], st = (i * 7 + 1) % 5;
    let h = '';
    if (st === 0) h = `<path d="M18 44 Q18 16 40 16 Q62 16 62 44 Q56 28 40 28 Q24 28 18 44Z" fill="${hair}"/>`;
    else if (st === 1) h = `<path d="M17 52 Q14 14 40 14 Q66 14 63 52 L58 52 Q58 28 40 26 Q22 28 22 52Z" fill="${hair}"/>`;
    else if (st === 2) h = `<path d="M20 40 Q22 14 40 14 Q58 14 60 40 Q50 24 40 24 Q30 24 20 40Z" fill="${hair}"/><circle cx="40" cy="12" r="6" fill="${hair}"/>`;
    else if (st === 3) h = `<path d="M18 36 Q20 12 40 12 Q60 12 62 36 L58 30 Q40 22 22 30Z" fill="${hair}"/><rect x="16" y="30" width="48" height="5" rx="2.5" fill="${AVBG[(i + 3) % 8]}"/>`;
    else h = `<path d="M22 34 Q24 16 40 16 Q56 16 58 34 Q48 24 40 26 Q32 24 22 34Z" fill="${hair}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${bg}"/><path d="M6 80 Q8 56 40 54 Q72 56 74 80Z" fill="${AVBG[(i + 4) % 8]}"/><rect x="34" y="46" width="12" height="10" fill="${skin}"/><ellipse cx="40" cy="36" rx="16" ry="19" fill="${skin}"/>${h}<circle cx="34" cy="37" r="2" fill="#2a2420"/><circle cx="46" cy="37" r="2" fill="#2a2420"/><path d="M34 46 Q40 51 46 46" stroke="#8a4a3c" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    return (avCache[i] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }

  const SND = (() => {
    let ac = null, master = null, noise = null, muted = () => false;
    const ctx = () => {
      if (muted()) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const nz = (t, dur, f, q, vol, f2) => {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.02);
    };
    const tn = (t, dur, type, f0, f1, vol) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    };
    const play = k => {
      if (!ctx()) return;
      const t = ac.currentTime + 0.003;
      try {
        if (k === 'deal') nz(t, 0.045, 3300, 1.2, 0.2);
        else if (k === 'card') { nz(t, 0.07, 2500, 0.9, 0.42); nz(t, 0.05, 620, 1, 0.22); }
        else if (k === 'flip') nz(t, 0.05, 4200, 1.4, 0.16);
        else if (k === 'sel') tn(t, 0.04, 'sine', 700, 760, 0.035);
        else if (k === 'shuf') for (let i = 0; i < 10; i++) nz(t + i * 0.03, 0.05, 2200 + Math.random() * 1800, 1.1, 0.16);
        else if (k === 'sweep') nz(t, 0.28, 900, 0.7, 0.2, 2800);
        else if (k === 'take') { tn(t, 0.18, 'triangle', 330, 200, 0.07); nz(t, 0.08, 500, 1, 0.14); }
        else if (k === 'bid') { tn(t, 0.08, 'sine', 640, 640, 0.05); tn(t + 0.07, 0.1, 'sine', 860, 860, 0.045); }
        else if (k === 'pass') { tn(t, 0.07, 'sine', 500, 420, 0.04); }
        else if (k === 'good') [523, 659, 784].forEach((f, i) => tn(t + i * 0.07, 0.2, 'triangle', f, f, 0.06));
        else if (k === 'bad') { tn(t, 0.22, 'sawtooth', 300, 120, 0.06); tn(t + 0.12, 0.26, 'square', 220, 90, 0.04); }
        else if (k === 'queen') { tn(t, 0.5, 'sawtooth', 130, 70, 0.1); tn(t + 0.05, 0.5, 'square', 98, 60, 0.07); nz(t, 0.25, 300, 0.8, 0.25); }
        else if (k === 'moon') [392, 523, 659, 784, 1047].forEach((f, i) => tn(t + i * 0.1, 0.4, 'triangle', f, f * 1.01, 0.07));
        else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * 0.09, 0.3, 'triangle', f, f, 0.08)); tn(t + 0.5, 0.7, 'sine', 1047, 1047, 0.05); }
        else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * 0.14, 0.3, 'triangle', f, f * 0.98, 0.07));
        else if (k === 'turn') { tn(t, 0.07, 'sine', 880, 880, 0.04); tn(t + 0.07, 0.1, 'sine', 1320, 1320, 0.035); }
        else if (k === 'tick') tn(t, 0.03, 'square', 1500, 1500, 0.02);
      } catch (e) {}
    };
    return { play, setMuted: f => { muted = f; }, close: () => { try { if (ac) ac.close(); } catch (e) {} ac = null; } };
  })();


  const CSS = `
.GM{gap:0}
.GM [hidden]{display:none!important}
.GM .cg-wrap{position:relative;max-width:100%;margin:0 auto;border-radius:18px;overflow:hidden;background:#0b3b21;box-shadow:0 10px 30px rgba(8,30,20,.32);touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;font-family:var(--sans)}
.GM .cg-stage{position:absolute;left:0;top:0;transform-origin:0 0;color:#fff;font-family:var(--sans);overflow:hidden}
.GM .cg-felt{position:absolute;inset:0}
.GM .cg-felt::before{content:'';position:absolute;inset:0;background-image:var(--cg-grain);opacity:.55;mix-blend-mode:overlay}
.GM .cg-felt::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 120px rgba(0,0,0,.42)}
.GM .cg-mark{position:absolute;left:50%;top:50%;width:300px;height:300px;transform:translate(-50%,-50%);opacity:.07;pointer-events:none}
.GM .cg-ring{position:absolute;border:3px solid rgba(255,255,255,.07);border-radius:50%;pointer-events:none}
.GM .cg-card{position:absolute;left:0;top:0;width:88px;height:124px;margin:0;will-change:transform;transition-property:transform,opacity;transition-timing-function:cubic-bezier(.22,.78,.2,1);perspective:900px;touch-action:manipulation;cursor:default}
.GM .cg-card .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .28s ease,translate .14s ease,filter .2s;border-radius:8px}
.GM .cg-card .f,.GM .cg-card .b{position:absolute;inset:0;background-size:100% 100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:8px}
.GM .cg-card .b{transform:rotateY(180deg)}
.GM .cg-card .f{box-shadow:0 2px 6px rgba(0,0,0,.35)}
.GM .cg-card .b{box-shadow:0 2px 6px rgba(0,0,0,.35)}
.GM .cg-card.me::before{content:'';position:absolute;left:0;right:0;top:100%;height:30px}
.GM .cg-card.me.ok{cursor:pointer}
.GM .cg-card.me.ok:hover .in{translate:0 -16px}
.GM .cg-card.shake .in{animation:cg-shk .4s}
@keyframes cg-shk{0%,100%{translate:0 0}20%{translate:-8px 0}40%{translate:8px 0}60%{translate:-5px 0}80%{translate:5px 0}}
.GM .cg-cards{position:absolute;inset:0;z-index:5}
.GM .cg-card.me.ok .in{filter:none}
.GM .cg-card.dim .in{filter:brightness(.62) saturate(.8)}
.GM .cg-card.glow .in{filter:drop-shadow(0 0 7px #ffe14a) drop-shadow(0 0 14px rgba(255,225,74,.7))}
.GM .cg-card.new .in{animation:cg-new 1.4s ease-out}
.GM .cg-card.hint .in{filter:drop-shadow(0 0 8px #5be27a) drop-shadow(0 0 16px #5be27a);animation:cg-hint .6s infinite alternate}
.GM .cg-card.kcur .in{outline:3px solid #fff;outline-offset:-1px}
.GM .cg-card.win .in{filter:drop-shadow(0 0 9px #ffe14a) drop-shadow(0 0 20px rgba(255,225,74,.85))}
@keyframes cg-new{0%{filter:drop-shadow(0 0 10px #5be27a) drop-shadow(0 0 22px #5be27a)}100%{filter:none}}
@keyframes cg-hint{from{translate:0 -6px}to{translate:0 -20px}}
.GM .cg-av{position:absolute;width:132px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;z-index:30}
.GM .cg-av .ph{position:relative;width:54px;height:54px;border-radius:50%;border:3px solid rgba(255,255,255,.9);background:#fff center/cover;box-shadow:0 3px 8px rgba(0,0,0,.4);transition:box-shadow .2s,transform .2s}
.GM .cg-av.turn .ph{box-shadow:0 0 0 4px #ffd84a,0 0 22px #ffd84a;transform:scale(1.08)}
.GM .cg-av .nm{max-width:128px;padding:1px 9px;border-radius:10px;background:rgba(0,0,0,.42);font:800 13px/18px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.GM .cg-av .ch{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;min-height:20px}
.GM .cg-av .ch b{padding:0 7px;border-radius:9px;background:rgba(255,255,255,.92);color:#1b1e25;font:900 11.5px/18px var(--sans);white-space:nowrap}
.GM .cg-av .ch b.r{background:#ffe14a}
.GM .cg-av .ch b.g{background:#5be27a}
.GM .cg-av .ch b.k{background:#1b1e25;color:#fff}
.GM .cg-av.out{opacity:.45}
.GM .cg-av .ch b.x{background:#ff6a5c;color:#fff}
.GM .cg-av .ph .tm{position:absolute;inset:-7px;border-radius:50%}
.GM .cg-bub{position:absolute;z-index:60;transform:translate(-50%,-100%) scale(.85);background:#fff;color:#1b1e25;padding:6px 13px;border-radius:15px;font:900 15px/1.15 var(--sans);box-shadow:0 4px 12px rgba(0,0,0,.35);opacity:0;transition:opacity .15s,transform .15s;pointer-events:none;white-space:nowrap}
.GM .cg-bub.on{opacity:1;transform:translate(-50%,-100%) scale(1)}
.GM .cg-bub::after{content:'';position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#fff}
.GM .cg-bub.red{color:#c3202b}
.GM .cg-hud{position:absolute;inset:0;pointer-events:none;z-index:40}
.GM .cg-hud button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.GM .cg-ib{position:absolute;width:42px;height:42px;border-radius:14px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#fff;display:grid;place-items:center;padding:0;transition:background .15s,transform .1s}
.GM .cg-ib:hover{background:rgba(0,0,0,.5)}
.GM .cg-ib:active{transform:scale(.94)}
.GM .cg-ib svg{width:22px;height:22px;display:block}
.GM .cg-score{position:absolute;pointer-events:auto;cursor:pointer;min-width:132px;padding:6px 10px 7px;border-radius:12px;background:rgba(0,0,0,.34);border:2px solid rgba(255,255,255,.16);font:800 12.5px/1.45 var(--sans);transition:background .15s}
.GM .cg-score:hover{background:rgba(0,0,0,.5)}
.GM .cg-score .r{display:flex;justify-content:space-between;gap:12px;white-space:nowrap}
.GM .cg-score .r span:last-child{font-variant-numeric:tabular-nums}
.GM .cg-score .r.me{color:#ffe14a}
.GM .cg-score .h{font:900 10.5px var(--sans);letter-spacing:1.2px;text-transform:uppercase;opacity:.7;margin-bottom:2px}
.GM .cg-prompt{position:absolute;transform:translate(-50%,-50%);pointer-events:none;overflow:hidden;text-overflow:ellipsis;max-width:92%;padding:6px 16px;border-radius:18px;background:rgba(0,0,0,.45);font:800 15px/1.25 var(--sans);text-align:center;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.4);transition:opacity .2s}
.GM .cg-prompt.hot{background:rgba(255,216,74,.96);color:#2a2000;text-shadow:none}
.GM .cg-prompt:empty{opacity:0}
.GM .cg-prompt.bad{background:rgba(214,48,32,.95)}
.GM .cg-act{position:absolute;pointer-events:none;transform:translate(-50%,-50%);display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;width:max-content;max-width:96%}
.GM .cg-btn{min-width:110px;height:46px;padding:0 20px;border-radius:23px;border:3px solid #fff;background:linear-gradient(#3fa65f,#1f7a3a);color:#fff;font:900 17px var(--sans);box-shadow:0 4px 0 #0e4a22,0 8px 16px rgba(0,0,0,.3);text-shadow:0 1px 0 rgba(0,0,0,.3);transition:transform .08s,filter .15s}
.GM .cg-btn:active:not(:disabled){transform:translateY(3px);box-shadow:0 1px 0 #0e4a22}
.GM .cg-btn:disabled{filter:grayscale(.8) brightness(.8);opacity:.75;cursor:default}
.GM .cg-btn.alt{background:linear-gradient(#4a86e0,#2559ad);box-shadow:0 4px 0 #173a73,0 8px 16px rgba(0,0,0,.3)}
.GM .cg-btn.warn{background:linear-gradient(#e0654a,#b53a22);box-shadow:0 4px 0 #6e2012,0 8px 16px rgba(0,0,0,.3)}
.GM .cg-btn.gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none;box-shadow:0 4px 0 #8a6200,0 8px 16px rgba(0,0,0,.3)}
.GM .cg-btn.sm{min-width:0;height:38px;padding:0 14px;font-size:14px;border-width:2px}
.GM .cg-btn.on{outline:3px solid #ffe14a;outline-offset:2px}
.GM .cg-btn.ghost{background:rgba(255,255,255,.1);box-shadow:none;border-color:rgba(255,255,255,.35)}
.GM .cg-btn i{font-style:normal;font-size:1.15em;margin-right:5px}
.GM .cg-btn i.r{color:#ff5a4d}
.GM .cg-btn.suit{min-width:72px;background:#fff;color:#1b1e25;text-shadow:none;box-shadow:0 4px 0 #9aa0ad,0 8px 16px rgba(0,0,0,.3)}
.GM .cg-btn.suit i{font-size:1.5em;margin:0}
.GM .cg-bids{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;display:grid;grid-template-columns:repeat(7,1fr);gap:7px;padding:10px 12px;border-radius:18px;background:rgba(0,0,0,.5);border:2px solid rgba(255,255,255,.2)}
.GM .cg-bids button{min-width:0;width:48px;height:44px;border-radius:12px;border:2px solid rgba(255,255,255,.4);background:rgba(255,255,255,.12);color:#fff;font:900 18px var(--sans);transition:background .12s,transform .08s}
.GM .cg-bids button:hover{background:rgba(255,255,255,.28)}
.GM .cg-bids button:active{transform:scale(.93)}
.GM .cg-bids button.nil{width:auto;padding:0 12px;background:#1b1e25;border-color:#fff;font-size:15px}
.GM .cg-bids button.kf{outline:3px solid #fff}
.GM .cg-bids button.hint{outline:3px solid #5be27a}
.GM .cg-bids .t{grid-column:1/-1;text-align:center;font:800 13px var(--sans);opacity:.85}
.GM .cg-tog{display:flex;align-items:center;gap:8px;padding:6px 14px;border-radius:16px;background:rgba(0,0,0,.42);font:800 14px var(--sans);cursor:pointer;pointer-events:auto}
.GM .cg-tog i{width:20px;height:20px;border-radius:6px;border:2px solid #fff;display:grid;place-items:center;font-style:normal;font-size:14px;line-height:1}
.GM .cg-tog.on i{background:#ffe14a;color:#2a1e00;border-color:#ffe14a}
.GM .cg-trump{position:absolute;pointer-events:none;padding:5px 12px;border-radius:14px;background:rgba(0,0,0,.4);font:900 14px var(--sans);display:flex;gap:8px;align-items:center;white-space:nowrap}
.GM .cg-trump b{font-size:22px;line-height:1}
.GM .cg-trump b.r{color:#ff6a5c}
.GM .cg-float{position:absolute;z-index:70;transform:translate(-50%,-50%);font:900 26px var(--sans);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.45),0 0 12px rgba(0,0,0,.5);pointer-events:none;animation:cg-fl 1.5s ease-out forwards;white-space:nowrap}
.GM .cg-float.bad{color:#ff7a6b}
.GM .cg-float.good{color:#7dffa0}
@keyframes cg-fl{0%{opacity:0;margin-top:10px;scale:.6}15%{opacity:1;scale:1.15}30%{scale:1}100%{opacity:0;margin-top:-46px}}
.GM .cg-banner{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.7);padding:10px 30px;border-radius:26px;background:linear-gradient(#ffe36a,#f0b400);border:4px solid #fff;color:#3a2600;font:900 30px/1.1 var(--sans);letter-spacing:.5px;box-shadow:0 10px 30px rgba(0,0,0,.5);opacity:0;z-index:80;pointer-events:none;white-space:nowrap;text-align:center}
.GM .cg-banner.on{animation:cg-ban 2.2s ease-out forwards}
.GM .cg-banner.red{background:linear-gradient(#ff7a6b,#d3301e);color:#fff}
.GM .cg-banner.blue{background:linear-gradient(#6aa9ff,#2a62c8);color:#fff}
.GM .cg-banner small{display:block;font:800 15px var(--sans);margin-top:3px;opacity:.85}
@keyframes cg-ban{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}22%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-62%) scale(1)}}
.GM .cg-pane{position:absolute;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(2,14,8,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.GM .cg-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;pointer-events:none}
.GM .cg-pane.clear>*{pointer-events:auto}
.GM .cg-pane.solid{background:radial-gradient(circle at 50% 38%,var(--cg-f1),var(--cg-f3))}
.GM .cg-box{width:100%;max-width:420px;margin:auto;background:linear-gradient(#26355a,#141c33);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 18px 16px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5);animation:cg-in .2s ease-out;max-height:100%;overflow:auto}
.GM .cg-box.wide{max-width:600px}
.GM .cg-box.col{display:flex;flex-direction:column;padding:0;overflow:hidden}
.GM .cg-bh{padding:14px 18px 0}
.GM .cg-scr{flex:1;min-height:0;overflow:auto;padding:0 18px;touch-action:pan-y;overscroll-behavior:contain}
.GM .cg-bf{padding:6px 18px 14px}
.GM .cg-bf .cg-big{max-width:240px;margin:4px auto 0}
@keyframes cg-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.GM .cg-box h3{margin:2px 0 8px;font:900 24px var(--sans);letter-spacing:.2px}
.GM .cg-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.88)}
.GM .cg-kick{font:900 11px var(--sans)!important;letter-spacing:1.5px;text-transform:uppercase;color:#ffd84a!important;margin:0 0 2px!important}
.GM .cg-big{display:block;width:100%;min-height:52px;margin:9px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.GM .cg-big:active{transform:translateY(2px)}
.GM .cg-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
.GM .cg-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.GM .cg-big.blue{background:linear-gradient(#3d8cf0,#1659b5)}
.GM .cg-big.red{background:linear-gradient(#ff5d4d,#cf2117)}
.GM .cg-big.gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
.GM .cg-big.ghost{background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 2px rgba(255,255,255,.28)}
.GM .cg-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px;cursor:pointer}
.GM .cg-sm:hover{background:rgba(255,255,255,.2)}
.GM .cg-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.GM .cg-opt{display:flex;align-items:center;gap:10px;margin:5px 0;text-align:left}
.GM .cg-opt>span{flex:0 0 38%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
.GM .cg-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
.GM .cg-seg{flex:1;display:flex;gap:5px}
.GM .cg-seg button{flex:1;min-height:36px;border-radius:11px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 4px;cursor:pointer}
.GM .cg-seg button.sw{min-height:44px;background-size:cover;background-position:center;border-width:3px}
.GM .cg-seg button.bk,.GM .cg-seg button.bk.on{background-size:auto 90%;background-repeat:no-repeat;background-position:center;background-color:#1d2a4a}
.GM .cg-seg button.sw.on{border-color:#fff;box-shadow:0 0 0 3px #ffd84a}
.GM .cg-seg button.on{background:#ffd84a;border-color:#fff;color:#1b1b1f}
.GM .cg-seg button:disabled{opacity:.45;cursor:default}
.GM .cg-sec{margin:10px 0 0!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:#ffd84a!important}
.GM .cg-logo{display:inline-block;font:900 54px/1 var(--sans);letter-spacing:-1px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.45),0 0 24px rgba(0,0,0,.4)}
.GM .cg-logo .su{display:inline-block;width:.9em;height:.9em;vertical-align:-.1em;margin:0 .06em}
.GM .cg-demo{position:relative;height:110px;margin:6px auto 10px;width:200px}
.GM .cg-demo i{position:absolute;left:67px;top:6px;width:66px;height:93px;background-size:100% 100%;border-radius:7px;transform-origin:50% 140%;box-shadow:0 3px 8px rgba(0,0,0,.4)}
.GM .cg-tag{font:800 14px var(--sans);color:rgba(255,255,255,.88);margin:4px 0 8px}
.GM .cg-title{width:100%;max-width:400px;text-align:center;margin:auto}
.GM .cg-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans);font-variant-numeric:tabular-nums}
.GM .cg-tbl th{padding:5px 4px;font:900 12px var(--sans);color:#ffd84a;border-bottom:2px solid rgba(255,255,255,.25);text-align:right}
.GM .cg-tbl th:first-child,.GM .cg-tbl td:first-child{text-align:left}
.GM .cg-tbl td{padding:5px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.GM .cg-tbl.rk th:nth-child(2),.GM .cg-tbl.rk td:nth-child(2){text-align:left}
.GM .cg-tbl td.lo{color:#7dffa0}
.GM .cg-tbl td.hi{color:#ff9a8e}
.GM .cg-tbl tr.tot td{border-top:2px solid rgba(255,255,255,.35);font-size:16px;color:#ffd84a}
.GM .cg-tbl tr.cur td{opacity:.7;font-style:italic}
.GM .cg-tbl .su{color:#fff}
.GM .cg-tbl small{font:700 11px var(--sans);opacity:.7}
.GM .rd{color:#ff6a5c}
.GM .cg-tbl .su.r{color:#ff6a5c}
.GM .cg-sheet{margin:6px 0}
.GM .cg-rules{text-align:left}
.GM .cg-rules p{font:700 13px/1.45 var(--sans)!important}
.GM .cg-rules h4{margin:12px 0 3px;font:900 12px var(--sans);letter-spacing:1.1px;text-transform:uppercase;color:#ffd84a}
.GM .cg-rules kbd{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:5px;padding:0 5px;font:800 12px var(--sans)}
.GM .cg-who{width:70px;height:70px;border-radius:50%;margin:0 auto 6px;border:4px solid #fff;background:#fff center/cover}
.GM .cg-net{position:absolute;transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.34);font:800 11px var(--sans);z-index:41}
.GM .cg-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.GM .cg-net.bad i{background:#ff5b4b}
.GM .cg-trick-pts{position:absolute;transform:translate(-50%,-50%);font:900 12px var(--sans)}
.GM .cg-dealer{position:absolute;z-index:32;width:24px;height:24px;border-radius:50%;background:#ffd84a;color:#2a1e00;font:900 13px/24px var(--sans);text-align:center;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.4);transform:translate(-50%,-50%);transition:left .4s,top .4s}
.GM .cg-hint-bub{position:absolute;pointer-events:none;z-index:70;padding:5px 12px;border-radius:12px;background:#5be27a;color:#073a15;font:900 13px var(--sans);transform:translate(-50%,-100%)}
.GM.cg-port .cg-prompt{font-size:13px;padding:5px 12px;max-width:200px}
.GM.cg-port .cg-trump{font-size:11px;padding:3px 9px;max-width:128px;white-space:normal;line-height:1.2}
.GM.cg-port .cg-av.me .ph{display:none}
.GM.cg-port .cg-av .ph{width:40px;height:40px;border-width:2px}
.GM.cg-port .cg-av .nm{font-size:11px;line-height:15px;padding:0 7px;max-width:88px}
.GM.cg-port .cg-av{width:96px}
.GM.cg-port .cg-av .ch b{font-size:10px;line-height:15px;padding:0 5px}
.GM.cg-port .cg-btn{min-width:84px;height:42px;font-size:15px;padding:0 14px}
.GM.cg-port .cg-act{max-width:264px;gap:6px}
.GM.cg-port .cg-act .cg-btn.ghost{min-width:62px;padding:0 10px}
.GM.cg-port .cg-act .cg-btn.gold{min-width:92px;padding:0 10px}
.GM.cg-port .cg-tog{padding:6px 9px;gap:5px;font-size:13px}
.GM.cg-port .cg-btn.suit{min-width:58px}
.GM.cg-port .cg-bids{background:rgba(6,14,36,.92);grid-template-columns:repeat(7,1fr);gap:5px;padding:8px}
.GM.cg-port .cg-bids button{width:40px;height:40px;font-size:16px}
.GM.cg-port .cg-box h3{font-size:21px}
.GM.cg-port .cg-logo{font-size:44px}
.GM.cg-port .cg-banner{font-size:22px;padding:8px 18px}
.GM.cg-port .cg-score{font-size:11px;min-width:96px;padding:4px 8px}
`;
  function cssFor(id) { return CSS.replace(/\.GM/g, '.gm-' + id); }


  const BOT_NAMES = ['Anna', 'Boris', 'Chen', 'Dara', 'Eli', 'Fiona', 'Gus', 'Hana', 'Ivan', 'Jade', 'Kofi', 'Lena', 'Mateo', 'Nora', 'Omar', 'Priya'];
  const ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const ICON_BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>';
  const ICON_SCORE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>';
  const suitSvg = (s, sz = 24, col) => `<svg class="su" viewBox="-1.1 -1.1 2.2 2.2" width="${sz}" height="${sz}" style="vertical-align:middle"><path fill="${col || (s === 1 || s === 3 ? '#ff6a5c' : '#fff')}" d="${suitD(s)}"/></svg>`;
  const SUIT_D = {};
  function suitD(s) {
    if (SUIT_D[s]) return SUIT_D[s];
    const rec = { d: '', moveTo(x, y) { this.d += `M${x} ${y}`; }, lineTo(x, y) { this.d += `L${x} ${y}`; }, bezierCurveTo(a, b, c, d, e, f) { this.d += `C${a} ${b} ${c} ${d} ${e} ${f}`; }, arc(cx, cy, r) { this.d += `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; }, closePath() { this.d += 'Z'; }, beginPath() {}, save() {}, restore() {}, translate() {}, scale() {} };
    const x = rec;
    if (s === 3) {
      x.moveTo(0, 0.95); x.bezierCurveTo(-0.2, 0.7, -1.0, 0.2, -1.0, -0.3); x.bezierCurveTo(-1.0, -0.8, -0.3, -1.0, 0, -0.45); x.bezierCurveTo(0.3, -1.0, 1.0, -0.8, 1.0, -0.3); x.bezierCurveTo(1.0, 0.2, 0.2, 0.7, 0, 0.95);
    } else if (s === 1) { x.moveTo(0, -1); x.lineTo(0.64, 0); x.lineTo(0, 1); x.lineTo(-0.64, 0); }
    else if (s === 2) {
      x.moveTo(0, -1); x.bezierCurveTo(0.12, -0.55, 1.0, -0.2, 1.0, 0.28); x.bezierCurveTo(1.0, 0.76, 0.34, 0.84, 0.1, 0.42); x.lineTo(0.34, 0.98); x.lineTo(-0.34, 0.98); x.lineTo(-0.1, 0.42);
      x.bezierCurveTo(-0.34, 0.84, -1.0, 0.76, -1.0, 0.28); x.bezierCurveTo(-1.0, -0.2, -0.12, -0.55, 0, -1);
    } else {
      x.arc(0, -0.5, 0.44); x.arc(-0.52, 0.18, 0.44); x.arc(0.52, 0.18, 0.44); x.moveTo(-0.15, 0); x.lineTo(0.15, 0); x.lineTo(0.3, 0.98); x.lineTo(-0.3, 0.98);
    }
    x.closePath();
    return (SUIT_D[s] = x.d);
  }

  const CFG = {
    hearts: {
      id: 'hearts', title: 'Hearts', Engine: HeartsEngine, defs: HEARTS_DEF, teams: false, mark: 3,
      felts: [['#2f9a58', '#1c6e3c', '#0a3a1f'], ['#3487cf', '#1b5597', '#0a2650'], ['#b04a43', '#7c2723', '#3e0f0d']],
      tag: 'Dodge the hearts and the Queen of Spades.',
      opts: [
        { k: 'target', label: 'Play to', vals: [50, 100, 150], names: ['50', '100', '150'] },
        { k: 'moon', label: 'Shooting the moon', sub: 'When one player takes every point', vals: ['add', 'sub'], names: ['Others +26', 'Me −26'] },
        { k: 'jd', label: 'Jack of Diamonds', sub: 'Worth −10 to whoever takes it', vals: [false, true], names: ['Off', 'On'] },
        { k: 'pass', label: 'Passing', sub: 'Left, right, across, hold', vals: [true, false], names: ['On', 'Off'] },
        { k: 'breakQ', label: 'Queen breaks hearts', vals: [false, true], names: ['No', 'Yes'] }
      ],
      help: 'Click or tap a card to play it. Pick 3 cards to pass, then press Pass. <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> select or play · <kbd>Space</kbd> or <kbd>P</kbd> pass · <kbd>H</kbd> hint · <kbd>T</kbd> score sheet',
      rules: [
        ['Goal', 'Take as few points as possible. Every heart is 1 point and the Queen of Spades is 13. The game ends when someone reaches the target score (100 by default) and the lowest score wins.'],
        ['Passing', 'Each hand starts with passing three cards: left, right, across, then no pass, repeating. Pick three cards and press Pass.'],
        ['Leading', 'The player holding the 2 of clubs leads it. You must follow suit if you can. On the first trick you may not play a heart or the Queen of Spades unless you have nothing else.'],
        ['Breaking hearts', 'Nobody may lead a heart until a heart has been played (broken), unless they hold only hearts.'],
        ['Shooting the moon', 'If one player takes all 13 hearts and the Queen of Spades, they score 0 and everybody else scores 26 (or the shooter scores −26 if you pick that option).'],
        ['Jack of Diamonds', 'With this option, the Jack of Diamonds is worth −10 to whoever wins it.']
      ]
    },
    spades: {
      id: 'spades', title: 'Spades', Engine: SpadesEngine, defs: SPADES_DEF, teams: true, mark: 2,
      felts: [['#2e5fa8', '#1a3a74', '#0a1a3d'], ['#2f9a58', '#1c6e3c', '#0a3a1f'], ['#6a4aa8', '#43287a', '#1e0f40']],
      tag: 'Bid your tricks. Partners win or lose together.',
      opts: [
        { k: 'target', label: 'Play to', vals: [250, 500, 1000], names: ['250', '500', '1000'] },
        { k: 'blind', label: 'Blind nil', sub: 'Bid nil before seeing your cards', vals: ['off', 'behind', 'any'], names: ['Off', 'If 100 behind', 'Always'] },
        { k: 'bagPen', label: 'Bag penalty', sub: '−100 for every 10 bags', vals: [true, false], names: ['On', 'Off'] }
      ],
      help: 'Bid your tricks, then click or tap a card to play it. Nil = 0 tricks. <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · <kbd>H</kbd> hint · <kbd>T</kbd> score sheet',
      rules: [
        ['Teams', 'You and the player across from you (North) are partners against East and West. Spades are always trump.'],
        ['Bidding', 'Everyone bids how many tricks they expect to take. Your team bid is the sum of both bids. Nil (0) wins 100 points if you take no tricks and costs 100 if you take any. Blind nil (bid before looking at your cards) is worth 200.'],
        ['Play', 'The player left of the dealer leads. Follow suit if you can; otherwise you may play any card, including a spade (a trump). Spades cannot be led until a spade has been played (broken), unless you only hold spades.'],
        ['Scoring', 'Make your bid: 10 points per trick bid, plus 1 point per extra trick (a bag). Miss it: lose 10 points per trick bid. Ten bags cost 100 points. Tricks won by a nil bidder count toward the team total.'],
        ['Winning', 'First team to 500 wins (the higher score if both pass it). A team that falls to −200 loses.']
      ]
    },
    euchre: {
      id: 'euchre', title: 'Euchre', Engine: EuchreEngine, defs: EUCHRE_DEF, teams: true, mark: 1,
      felts: [['#9a3a3f', '#6c1d26', '#33080d'], ['#2f9a58', '#1c6e3c', '#0a3a1f'], ['#2e5fa8', '#1a3a74', '#0a1a3d']],
      tag: 'Name trump, take three of five tricks.',
      opts: [
        { k: 'target', label: 'Play to', vals: [3, 5, 7, 10], names: ['3', '5', '7', '10'] },
        { k: 'stick', label: 'Stick the dealer', sub: 'Dealer must name trump if all pass', vals: [true, false], names: ['On', 'Off'] },
        { k: 'alone', label: 'Going alone', vals: [true, false], names: ['On', 'Off'] }
      ],
      help: 'Click a card to play it. Order up, pass or name trump with the buttons. <kbd>P</kbd> pass · <kbd>O</kbd> order up · <kbd>1-4</kbd> name a suit · <kbd>A</kbd> alone · <kbd>H</kbd> hint · <kbd>T</kbd> score sheet',
      rules: [
        ['Cards', 'A 24 card deck: 9, 10, J, Q, K, A in each suit. Two partnerships; you and the player across from you are partners.'],
        ['Bowers', 'The Jack of the trump suit is the right bower, the highest card. The Jack of the same colour is the left bower, second highest, and it counts as a trump. After that: A, K, Q, 10, 9 of trump.'],
        ['Trump', 'The dealer turns up a card. In the first round each player in turn may pass or order it up; the dealer then picks it up and discards a card. If all pass, the card is turned down and, in the second round, players may name any other suit as trump. With stick the dealer on, the dealer must name trump.'],
        ['Going alone', 'The player who names trump may play alone: their partner sits out. Taking all five tricks alone scores 4.'],
        ['Scoring', 'The team that named trump scores 1 for three or four tricks and 2 for all five (a march). If they fail (euchred), the other team scores 2. First to the target (5 here, 10 in the traditional game) wins.']
      ]
    }
  };


  function grainUrl() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 96;
    const x = cv.getContext('2d'), im = x.createImageData(96, 96);
    for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 34; }
    x.putImageData(im, 0, 0);
    return 'url(' + cv.toDataURL('image/png') + ')';
  }

  const GEO = {
    land: {
      W: 960, H: 600, ctr: [480, 292],
      slot: [[480, 362], [410, 292], [480, 222], [550, 292]], ts: 0.8,
      av: [[66, 530], [76, 170], [290, 72], [884, 170]],
      my: { y: 518, step: 52, max: 700, s: 1 },
      fan: { so: 0.5, w: [58, 342], e: [902, 342], n: [584, 50], span: 196, stMax: 26 },
      prompt: 134, act: 428, bids: [480, 300], deal: [480, 292],
      ib: [[10, 10], [58, 10], [106, 10]], scoreR: 10, scoreT: 10, trump: [10, 62], net: [906, 586], tag: [480, 168]
    },
    port: {
      W: 380, H: 650, ctr: [190, 288],
      slot: [[190, 348], [140, 288], [190, 228], [240, 288]], ts: 0.7,
      av: [[190, 414], [48, 222], [190, 46], [332, 222]],
      my: { y: 548, step: 50, max: 300, s: 0.88, rows: [492, 554] },
      fan: { so: 0.42, w: [28, 348], e: [352, 348], n: [190, 128], span: 140, stMax: 22 },
      prompt: 172, act: 364, bids: [190, 322], deal: [190, 288],
      ib: [[8, 8], [52, 8], [96, 8]], scoreR: 8, scoreT: 8, trump: [8, 58], net: [190, 630], tag: [190, 190]
    }
  };

  const BUBBLE_OFF = 52;

  function mountCards(gid, root, api) {
    const C = CFG[gid], isH = gid === 'hearts', isS = gid === 'spades', isE = gid === 'euchre';
    const saved = api.load() || {};
    const opt = Object.assign({ diff: 'Normal', felt: 0, back: 'blue', speed: 1, hints: true, wins: 0, games: 0 }, saved);
    opt.rules = Object.assign({}, C.defs, saved.rules || {});
    if (!['Easy', 'Normal', 'Hard'].includes(opt.diff)) opt.diff = 'Normal';
    if (!(opt.felt >= 0 && opt.felt < 3)) opt.felt = 0;
    if (opt.back !== 'red') opt.back = 'blue';
    if (opt.speed !== 0.55) opt.speed = 1;
    const save = () => api.save(opt);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const SP = () => opt.speed;
    const dur = ms => Math.round(ms * SP());

    const wrap = document.createElement('div'); wrap.className = 'cg-wrap';
    const stage = document.createElement('div'); stage.className = 'cg-stage';
    stage.innerHTML = `<div class="cg-felt"></div><svg class="cg-mark" viewBox="-1.1 -1.1 2.2 2.2"><path fill="#fff" d="${suitD(C.mark)}"/></svg><div class="cg-cards"></div><div class="cg-hud">
<button class="cg-ib" data-u="menu" aria-label="Menu">${ICON_MENU}</button>
<button class="cg-ib" data-u="hint" aria-label="Hint">${ICON_BULB}</button>
<button class="cg-ib" data-u="sheet" aria-label="Score sheet">${ICON_SCORE}</button>
<div class="cg-net" hidden><i></i><span>Online</span></div>
<div class="cg-score" data-u="score"></div>
<div class="cg-trump" hidden></div>
<div class="cg-prompt"></div>
<div class="cg-act"></div>
<div class="cg-bids" hidden></div>
<div class="cg-banner"></div></div><div class="cg-pane" hidden></div>`;
    wrap.append(stage); root.append(wrap);
    wrap.style.setProperty('--cg-grain', grainUrl());
    const q1 = s => stage.querySelector(s);
    const cardsEl = q1('.cg-cards'), hud0 = q1('.cg-hud'), feltEl = q1('.cg-felt'), paneEl = q1('.cg-pane');
    const bMenu = q1('[data-u=menu]'), bHint = q1('[data-u=hint]'), bSheet = q1('[data-u=sheet]');
    const netEl = q1('.cg-net'), scoreEl = q1('.cg-score'), trumpEl = q1('.cg-trump'), promptEl = q1('.cg-prompt'), actEl = q1('.cg-act'), bidsEl = q1('.cg-bids'), banEl = q1('.cg-banner');
    const avEls = [], bubEls = [], dealerEl = document.createElement('div');
    dealerEl.className = 'cg-dealer'; dealerEl.textContent = 'D'; dealerEl.hidden = true; hud0.append(dealerEl);
    for (let i = 0; i < 4; i++) {
      const a = document.createElement('div'); a.className = 'cg-av'; a.innerHTML = '<div class="ph"><div class="tm"></div></div><div class="nm"></div><div class="ch"></div>'; hud0.append(a); avEls.push(a);
      const b = document.createElement('div'); b.className = 'cg-bub'; hud0.append(b); bubEls.push(b);
    }

    let W = 960, H = 600, PORT = null, GE = GEO.land, SC = 1, scene = 'title';
    let viewer = 0, T = 0, busy = 0, idleDone = true, paused = false, lastPT = 'mouse';
    const Q = [], sched = [];
    const D = { hands: [[], [], [], []], trick: [], turn: -1, tk: '', dealer: -1, dir: 3, trump: -1, maker: -1, alone: false, out: -1, up: null, kitty: [], bid: [null, null, null, null], blind: [false, false, false, false], tw: [0, 0, 0, 0], pts: [0, 0, 0, 0], scores: [0, 0, 0, 0], score: [0, 0], bags: [0, 0], hno: 0, broken: false, sel: [], picked: [false, false, false, false], armed: null, kc: -1, alone1: false, phase: '', redeal: false, summary: false, over: null, look: false, sitting: -1, bidFocus: -1, kb: '', kbT: 0, hintCards: [], hintBid: -1 };
    const M = { mode: 'solo', role: 'local', eng: null, human: [true, false, false, false], cpu: [false, true, true, true], names: ['You', 'West', 'North', 'East'], av: [0, 1, 2, 3], pids: [], players: [], V: null, vv: -1, ver: 0, botVer: -1, botAt: 0, pending: false, tok: 0, hooked: false, dl: null, dlVer: -1, bots: false, size: 4, wonCount: false, rules: null, diff: 'Normal', autoSeat: [false, false, false, false], nextAt: 0, hintT: 0, counted: false, sumHand: -1, pk: 0, rk: 0 };
    let paneFn = null, ents = new Set();

    const at = (ms, fn) => { const o = { t: T + ms, fn }; let i = sched.length; while (i > 0 && sched[i - 1].t > o.t) i--; sched.splice(i, 0, o); };
    const hold = ms => { busy = Math.max(busy, T + ms); };
    const sfx = k => { if (!api.muted) SND.play(k); };
    const rel = p => ((p - viewer) % 4 + 4) % 4;
    const absOf = r => (viewer + r) % 4;
    const team = p => p & 1;
    const nm = p => (p < 0 ? '' : p === viewer ? 'You' : M.names[p] || ['You', 'West', 'North', 'East'][rel(p)]);
    const poss = p => (p === viewer ? 'Your' : nm(p) + '’s');
    const isOnline = () => M.mode === 'online';
    const SUITN = ['clubs', 'diamonds', 'spades', 'hearts'];
    const SYMS = ['♣', '♦', '♠', '♥'];
    const sym = s => `<span class="${s === 1 || s === 3 ? 'rd' : ''}">${SYMS[s]}</span>`;

    function geo() { return PORT ? GEO.port : GEO.land; }
    function fit(force) {
      const port = (root.clientWidth || 800) < 640;
      if (!force && port === PORT) return;
      PORT = port; GE = port ? GEO.port : GEO.land; W = GE.W; H = GE.H;
      stage.style.width = W + 'px'; stage.style.height = H + 'px';
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      wrap.style.aspectRatio = `${W} / ${H}`;
      root.classList.toggle('cg-port', port);
      rescale(true); placeHud(); relayoutAll(0);
    }
    function rescale(force) {
      const k = wrap.clientWidth / W;
      if (!k || (!force && Math.abs(k - SC) < 0.001)) return;
      SC = k; stage.style.transform = `scale(${k})`;
    }
    const setPos = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; };
    function placeHud() {
      const g = GE;
      [bMenu, bHint, bSheet].forEach((b, i) => setPos(b, g.ib[i][0], g.ib[i][1]));
      scoreEl.style.right = g.scoreR + 'px'; scoreEl.style.top = g.scoreT + 'px';
      setPos(trumpEl, g.trump[0], g.trump[1]);
      setPos(promptEl, W / 2, g.prompt); setPos(actEl, W / 2, g.act); setPos(bidsEl, g.bids[0], g.bids[1]);
      setPos(netEl, g.net[0], g.net[1]);
      for (let r = 0; r < 4; r++) { const p = absOf(r); setPos(avEls[p], g.av[r][0], g.av[r][1]); setPos(bubEls[p], g.av[r][0], g.av[r][1] - BUBBLE_OFF); }
      placeDealer();
    }
    function placeDealer() {
      if (D.dealer < 0 || isH) { dealerEl.hidden = true; return; }
      const r = rel(D.dealer), a = GE.av[r];
      dealerEl.hidden = false;
      setPos(dealerEl, a[0] + (PORT ? 30 : 36), a[1] - (PORT ? 22 : 26));
    }

    function mk(c) {
      const el = document.createElement('div'); el.className = 'cg-card';
      el.innerHTML = '<div class="in"><div class="f"></div><div class="b"></div></div>';
      const inn = el.firstChild;
      const e = { el, inn, f: inn.firstChild, b: inn.lastChild, c: -1, x: GE.deal[0], y: GE.deal[1], r: 0, s: 0.5, z: 1, lift: 0, up: false, mine: false };
      e.b.style.backgroundImage = `url(${backUrl(opt.back)})`;
      inn.style.transform = 'rotateY(180deg)';
      setFace(e, c);
      el.style.transitionDuration = '0ms';
      el._e = e; ents.add(e); cardsEl.append(el);
      apply(e, 0, 0);
      void el.offsetWidth;
      return e;
    }
    function setFace(e, c) { e.c = c; e.f.style.backgroundImage = c >= 0 ? `url(${faceUrl(c)})` : ''; }
    function flip(e, up, delay) {
      if (e.up === up) return;
      e.up = up;
      const f = () => { e.inn.style.transform = up ? '' : 'rotateY(180deg)'; };
      if (delay > 0) at(delay, f); else f();
    }
    function apply(e, d, dl) {
      const st = e.el.style;
      st.transitionDuration = d + 'ms'; st.transitionDelay = (dl || 0) + 'ms';
      st.transform = `translate(${e.x - 44}px,${e.y + e.lift - 62}px) rotate(${e.r}deg) scale(${e.s})`;
      st.zIndex = e.z;
      e.el.classList.toggle('me', !!e.mine);
    }
    function mv(e, x, y, r, s, d, dl, z) {
      e.x = x; e.y = y; e.r = r; e.s = s; if (z != null) e.z = z;
      apply(e, d, dl);
    }
    function drop(e, d) {
      ents.delete(e);
      if (d > 0) { e.el.style.transitionProperty = 'transform,opacity'; e.el.style.opacity = 0; at(d, () => e.el.remove()); } else e.el.remove();
    }
    function clearTable() {
      for (const e of ents) e.el.remove();
      ents.clear();
      D.hands = [[], [], [], []]; D.trick = []; D.up = null; D.kitty = []; D.sel = []; D.armed = null; D.kc = -1;
    }

    function myPos(i, n) {
      const g = GE.my;
      if (!PORT) {
        const st = Math.min(g.step, g.max / Math.max(1, n - 1)), d = i - (n - 1) / 2;
        return { x: W / 2 + d * st, y: g.y + d * d * (n > 8 ? 0.4 : 0.7), r: d * (n > 8 ? 1.1 : 1.5), s: g.s, z: 10 + i };
      }
      if (n <= 8) {
        const st = Math.min(70, (W - 16 - 88) / Math.max(1, n - 1)), d = i - (n - 1) / 2, s = n <= 6 ? 1 : 0.92;
        return { x: W / 2 + d * st, y: 536 + d * d * 0.6, r: d * 1.4, s, z: 10 + i };
      }
      const n1 = Math.ceil(n / 2), row = i < n1 ? 0 : 1, k = row ? i - n1 : i, cnt = row ? n - n1 : n1;
      const st = Math.min(50, (W - 20 - 88 * g.s) / Math.max(1, cnt - 1)), d = k - (cnt - 1) / 2;
      return { x: W / 2 + d * st, y: g.rows[row], r: 0, s: g.s, z: 10 + i + (row ? 30 : 0) };
    }
    function fanPos(r, i, n) {
      const f = GE.fan, st = Math.min(f.stMax, f.span / Math.max(1, n - 1)), d = i - (n - 1) / 2;
      if (r === 1) return { x: f.w[0], y: f.w[1] + d * st, r: 90, s: f.so, z: 2 + i };
      if (r === 3) return { x: f.e[0], y: f.e[1] + d * st, r: -90, s: f.so, z: 2 + i };
      return { x: f.n[0] + d * st, y: f.n[1], r: 0, s: f.so, z: 2 + i };
    }
    function layoutHand(p, d, stag) {
      const h = D.hands[p], n = h.length, r = rel(p);
      h.forEach((e, i) => {
        const g = r === 0 ? myPos(i, n) : fanPos(r, i, n);
        mv(e, g.x, g.y, g.r, g.s, d, (stag || 0) * i, g.z);
      });
    }
    function trickSlot(p) {
      const s = GE.slot[rel(p)];
      return { x: s[0], y: s[1], s: GE.ts };
    }
    function layoutTrick(d) {
      D.trick.forEach((t, i) => { const s = trickSlot(t.p); mv(t.e, s.x + t.jx, s.y + t.jy, t.jr, s.s, d, 0, 50 + i); });
    }
    function relayoutAll(d) {
      for (let p = 0; p < 4; p++) layoutHand(p, d);
      layoutTrick(d);
      layoutKitty(d);
      for (let r = 0; r < 4; r++) { const p = absOf(r); avEls[p].style.left = GE.av[r][0] + 'px'; avEls[p].style.top = GE.av[r][1] + 'px'; }
    }
    function layoutKitty(d) {
      const c = GE.ctr;
      D.kitty.forEach((e, i) => mv(e, c[0] + i * 0.8 - 1.5, c[1] + i * -1.2 + 1, 0, GE.ts, d, 0, 3 + i));
      if (D.up) mv(D.up, c[0], c[1] - 4, 0, GE.ts, d, 0, 8);
    }
    function takeCard(p, c) {
      const h = D.hands[p];
      let i = c >= 0 ? h.findIndex(e => e.c === c) : -1;
      if (i < 0) i = p === viewer && c >= 0 ? -1 : Math.floor(h.length / 2);
      if (i < 0) return null;
      const e = h.splice(i, 1)[0];
      if (D.armed === e) D.armed = null;
      const k = D.sel.indexOf(e); if (k >= 0) D.sel.splice(k, 1);
      e.lift = 0; e.mine = false;
      return e;
    }
    function sortMine() {
      const cmp = isE ? esort(D.trump) : isS ? ssort : hsort;
      D.hands[viewer].sort((a, b) => cmp(a.c, b.c));
    }

    function say(p, txt, red) {
      const b = bubEls[p];
      b.textContent = txt; b.classList.toggle('red', !!red); b.classList.add('on');
      const my = b._k = (b._k || 0) + 1;
      at(1500, () => { if (b._k === my) b.classList.remove('on'); });
    }
    function floatAt(x, y, txt, cls) {
      const f = document.createElement('div'); f.className = 'cg-float ' + (cls || ''); f.textContent = txt; setPos(f, x, y); hud0.append(f);
      at(1700, () => f.remove());
    }
    function banner(html, cls) {
      banEl.className = 'cg-banner ' + (cls || ''); banEl.innerHTML = html;
      void banEl.offsetWidth; banEl.classList.add('on');
    }
    function toast(t) { api.toast(t); }


    function pump() {
      while (sched.length && sched[0].t <= T) sched.shift().fn();
      while (!paused && Q.length && T >= busy) onEvent(Q.shift());
      if (!paused && !Q.length && T >= busy && !idleDone) { idleDone = true; onIdle(); }
    }
    function onEvent(e) {
      switch (e.k) {
        case 'deal': evDeal(e); break;
        case 'turn': evTurn(e); break;
        case 'picked': D.picked[e.p] = true; chips(); sfx('sel'); hold(dur(140)); break;
        case 'pass': evPass(e); break;
        case 'play': evPlay(e); break;
        case 'broken': evBroken(); break;
        case 'trick': evTrick(e); break;
        case 'hand': evHand(e); break;
        case 'over': D.over = e; break;
        case 'look': evLook(e); break;
        case 'bid': evBid(e); break;
        case 'bids': evBids(e); break;
        case 'turndown': evTurndown(); break;
        case 'trump': evTrump(e); break;
        case 'pickup': evPickup(e); break;
        case 'noPick': evTurndown(); break;
        case 'discard': evDiscard(e); break;
        case 'play0': evPlay0(e); break;
        case 'redeal': evRedeal(); break;
      }
    }

    function dealPos(seat) {
      if (isH || D.dealer < 0) return GE.deal;
      const a = GE.av[rel(D.dealer)];
      return [a[0], a[1]];
    }
    function evDeal(e) {
      clearTable(); hidePane(); banEl.className = 'cg-banner';
      D.hno = e.n; D.dir = e.dir == null ? 3 : e.dir; D.dealer = e.dealer == null ? -1 : e.dealer; D.broken = false;
      D.trump = -1; D.maker = -1; D.alone = false; D.out = -1; D.tw = [0, 0, 0, 0]; D.pts = [0, 0, 0, 0];
      D.bid = [null, null, null, null]; D.blind = [false, false, false, false]; D.picked = [false, false, false, false];
      D.redeal = false; D.summary = false; D.sumE = null; D.over = null; D.alone1 = false; D.turn = -1;
      D.phase = isH ? (D.dir === 3 ? 'play' : 'pass') : isS ? 'bid' : 'bid1';
      D.look = isS ? !!(e.look && e.look[viewer]) : true;
      D.okb = e.okb || null;
      const n = e.hand.length, p0 = D.dealer >= 0 ? nextSeat(D.dealer) : 0, sp = dealPos(), sd = dur(isE ? 46 : 30);
      avEls.forEach(a => a.classList.remove('turn', 'out'));
      placeDealer(); chips(); trumpPill();
      sfx('shuf');
      for (let k = 0; k < n * 4; k++) {
        const seat = (p0 + k) % 4, idx = (k / 4) | 0;
        const mine = seat === viewer;
        const ent = mk(mine ? e.hand[idx] : -1);
        put0(ent, sp[0], sp[1]);
        D.hands[seat].push(ent);
        if (mine) ent.mine = true;
      }
      const cnt = [0, 0, 0, 0];
      for (let k = 0; k < n * 4; k++) {
        const seat = (p0 + k) % 4, idx = cnt[seat]++, ent = D.hands[seat][idx], r = rel(seat);
        const g = r === 0 ? myPos(idx, n) : fanPos(r, idx, n);
        mv(ent, g.x, g.y, g.r, g.s, dur(340), k * sd, g.z);
        if (k % 2 === 0) at(k * sd, () => sfx('deal'));
        if (seat === viewer && D.look) flip(ent, true, k * sd + dur(240));
      }
      let end = n * 4 * sd + dur(420);
      if (isE) {
        const c = GE.ctr;
        for (let i = 0; i < 4; i++) {
          const ent = mk(i === 3 ? e.up : -1);
          put0(ent, sp[0], sp[1]);
          const k = n * 4 + i;
          if (i === 3) { D.up = ent; mv(ent, c[0], c[1] - 4, 0, GE.ts, dur(380), k * sd, 8); flip(ent, true, k * sd + dur(260)); }
          else { D.kitty.push(ent); mv(ent, c[0] + i * 0.8 - 1.5, c[1] - i * 1.2 + 1, 0, GE.ts, dur(380), k * sd, 3 + i); }
        }
        end += 4 * sd + dur(200);
      }
      hold(end);
    }
    function put0(e, x, y) { e.x = x; e.y = y; e.s = 0.5; e.r = 0; apply(e, 0, 0); void e.el.offsetWidth; }
    function evTurn(e) {
      D.tk = e.tk;
      D.turn = e.tk === 'pass' ? -1 : e.p;
      if (e.tk === 'play') D.phase = 'play';
      else if (e.tk === 'bid') D.phase = 'bid';
      else if (e.tk === 'bid1' || e.tk === 'bid2' || e.tk === 'discard') D.phase = e.tk;
      else if (e.tk === 'pass') D.phase = 'pass';
      avEls.forEach((a, i) => a.classList.toggle('turn', i === D.turn));
      hold(dur(40));
    }
    function evPass(e) {
      D.phase = 'play'; D.sel = []; D.armed = null;
      const mine = e.moves.find(m => m.from === viewer), got = e.moves.find(m => m.to === viewer);
      sfx('pass');
      avEls.forEach(a => a.classList.remove('turn'));
      const out = mine.cards.map(c => takeCard(viewer, c)).filter(Boolean);
      const rt = rel(mine.to), tp = fanPos(rt, 6, 13);
      out.forEach((x, i) => { flip(x, false, i * dur(40)); mv(x, tp.x, tp.y, tp.r, tp.s, dur(460), i * dur(70), 60 + i); drop(x, dur(460) + i * dur(70)); });
      layoutHand(viewer, dur(300));
      const fr = rel(got.from), fp = fanPos(fr, 6, 13), ds = D.dir;
      at(dur(520), () => {
        sfx('card');
        const news = got.cards.map((c, i) => {
          const x = mk(c); x.mine = true;
          put0(x, fp.x, fp.y); x.r = fp.r; x.s = fp.s; apply(x, 0, 0); void x.el.offsetWidth;
          D.hands[viewer].push(x);
          return x;
        });
        sortMine();
        layoutHand(viewer, dur(420));
        news.forEach((x, i) => { flip(x, true, dur(200) + i * dur(60)); x.el.classList.add('new'); at(1500, () => x.el.classList.remove('new')); });
      });
      for (let r = 1; r < 4; r++) if (r !== rt && r !== fr) layoutHand(absOf(r), dur(300));
      D.picked = [false, false, false, false];
      chips();
      hold(dur(1250));
    }
    function evPlay(e) {
      const p = e.p;
      let ent = takeCard(p, e.c);
      if (!ent) { ent = mk(e.c); put0(ent, GE.av[rel(p)][0], GE.av[rel(p)][1]); }
      setFace(ent, e.c);
      const s = trickSlot(p), jr = rnd(-7, 7), jx = rnd(-4, 4), jy = rnd(-4, 4);
      D.trick.push({ p, e: ent, jx, jy, jr });
      flip(ent, true, p === viewer ? 0 : dur(70));
      mv(ent, s.x + jx, s.y + jy, jr, s.s, dur(340), 0, 50 + D.trick.length);
      ent.mine = false; ent.el.classList.remove('ok', 'dim', 'hint', 'kcur', 'glow');
      layoutHand(p, dur(260));
      D.armed = null; D.kc = -1;
      sfx('card');
      hold(dur(p === viewer ? 260 : 310));
    }
    function evBroken() {
      D.broken = true; trumpPill();
      floatAt(GE.ctr[0], GE.ctr[1] - 20, isH ? 'Hearts broken' : 'Spades broken', 'bad');
      sfx('bad');
      hold(dur(260));
    }
    function evTrick(e) {
      const w = e.w, cards = D.trick;
      D.trick = [];
      D.tw[w]++;
      if (e.pt != null) D.pts[w] += e.pt;
      const qs = isH && e.cards.some(t => t.c === QS);
      const wa = GE.av[rel(w)];
      at(dur(520), () => { cards.forEach(t => { if (t.p === w) t.e.el.classList.add('win'); }); });
      at(dur(780), () => {
        cards.forEach((t, i) => {
          t.e.el.classList.remove('win');
          mv(t.e, wa[0], wa[1], t.jr + rnd(-12, 12), 0.3, dur(440), i * dur(24), 4);
          drop(t.e, dur(440) + i * dur(24));
        });
        sfx('sweep');
        chips();
        if (isH && e.pt) {
          floatAt(wa[0], wa[1] - 30, (e.pt > 0 ? '+' : '') + e.pt, e.pt > 0 ? 'bad' : 'good');
          if (qs) { sfx('queen'); floatAt(wa[0], wa[1] - 62, 'Queen of Spades!', 'bad'); }
        }
      });
      hold(dur(780) + dur(520));
    }
    function evHand(e) {
      D.phase = 'between'; D.sumE = e; D.summary = true;
      avEls.forEach(a => a.classList.remove('turn'));
      D.turn = -1;
      if (isH) {
        D.scores = e.scores.slice();
        if (e.moon >= 0) { banner(`${esc(nm(e.moon))} shot the moon!<small>${M.rules.moon === 'sub' ? 'Their score drops by 26' : 'Everyone else gets 26'}</small>`, 'red'); sfx('moon'); }
        else sfx(e.delta[viewer] <= Math.min(...e.delta) ? 'good' : 'sweep');
      } else if (isS) {
        D.score = e.score.slice(); D.bags = e.bags.slice();
        const t = viewer & 1;
        sfx(e.r[t].delta >= e.r[1 - t].delta ? 'good' : 'bad');
      } else {
        D.score = e.score.slice();
        const t = viewer & 1;
        banner(e.euchre ? 'Euchred!' : e.pts >= 4 ? 'Lone march!' : e.pts === 2 ? 'March!' : 'Made it', e.team === t ? 'blue' : 'red');
        sfx(e.team === t ? 'good' : 'bad');
      }
      refreshScore(); chips();
      hold(dur(isH && e.moon >= 0 ? 1700 : 900));
    }
    function evLook(e) {
      if (e.p !== viewer) { hold(dur(60)); return; }
      D.look = true;
      D.hands[viewer].forEach((c, i) => flip(c, true, i * dur(28)));
      sfx('flip'); hold(dur(520));
    }
    function evBid(e) {
      if (isS) {
        D.bid[e.p] = e.n; D.blind[e.p] = !!e.blind;
        say(e.p, e.blind ? 'Blind nil!' : e.n === 0 ? 'Nil' : String(e.n), e.n === 0);
        sfx('bid'); chips(); hold(dur(e.p === viewer ? 420 : 700));
        return;
      }
      let t;
      if (e.t === 'pass') t = 'Pass';
      else if (e.t === 'order') t = (e.p === D.dealer ? 'I pick it up' : 'Order it up') + (e.alone ? ', alone!' : '!');
      else t = SUITN[e.s][0].toUpperCase() + SUITN[e.s].slice(1) + (e.alone ? ', alone!' : '!');
      say(e.p, t, e.t === 'call' && (e.s === 1 || e.s === 3));
      sfx(e.t === 'pass' ? 'pass' : 'bid'); hold(dur(e.p === viewer ? 450 : 780));
    }
    function teamBids(bid) {
      const r = [0, 1].map(t => { let n = 0, nil = 0; for (const p of [t, t + 2]) { if (bid[p] === 0) nil++; else n += bid[p] || 0; } return { n, nil }; });
      return r;
    }
    function evBids(e) {
      D.bid = e.bid.slice(); D.blind = e.blind.slice(); D.phase = 'play';
      const tb = teamBids(e.bid), t = viewer & 1;
      const f = x => x.n + (x.nil ? (x.n ? ' + ' : '') + (x.nil > 1 ? '2 nil' : 'nil') : '');
      banner(`Bids<small>Us ${f(tb[t])} · Them ${f(tb[1 - t])}</small>`, 'blue');
      chips(); hold(dur(1100));
    }
    function evTurndown() {
      if (D.up) {
        const u = D.up; D.up = null;
        flip(u, false); D.kitty.push(u);
        at(dur(200), () => setFace(u, -1));
        layoutKitty(dur(380));
        sfx('flip');
      }
      hold(dur(520));
    }
    function trumpPill() {
      let h = '';
      if (isH) h = `<b class="r">♥</b> ${D.broken ? 'Broken' : 'Not broken'}`;
      else if (isS) h = `<b>♠</b> ${D.broken ? 'Broken' : 'Not broken'}`;
      else if (D.trump >= 0) h = `<b class="${D.trump === 1 || D.trump === 3 ? 'r' : ''}">${SYMS[D.trump]}</b> Trump · ${esc(nm(D.maker))}${D.alone ? ' alone' : ''}`;
      else if (D.up) h = `<b class="${cs(D.up.c) === 1 || cs(D.up.c) === 3 ? 'r' : ''}">${SYMS[cs(D.up.c)]}</b> Turned up`;
      else h = '';
      trumpEl.hidden = !h || scene !== 'game'; trumpEl.innerHTML = h;
    }
    function evTrump(e) {
      D.trump = e.s; D.maker = e.p; D.alone = !!e.alone;
      trumpPill(); chips();
      sortMine(); layoutHand(viewer, dur(340));
      const nmS = SUITN[e.s][0].toUpperCase() + SUITN[e.s].slice(1);
      banner(`${SYMS[e.s]} ${nmS} is trump<small>${esc(nm(e.p))}${e.alone ? ' goes alone' : e.p === viewer ? ' called it' : ' called it'}</small>`, e.s === 1 || e.s === 3 ? 'red' : 'blue');
      sfx('good'); hold(dur(900));
    }
    function evPickup(e) {
      const ent = D.up; D.up = null;
      if (!ent) { hold(dur(100)); return; }
      D.hands[e.p].push(ent);
      if (e.p === viewer) { ent.mine = true; sortMine(); }
      else { flip(ent, false, dur(80)); at(dur(280), () => setFace(ent, -1)); }
      layoutHand(e.p, dur(400));
      trumpPill(); sfx('card'); hold(dur(620));
    }
    function evDiscard(e) {
      const ent = takeCard(e.p, e.c);
      if (ent) {
        flip(ent, false);
        if (e.p !== viewer) setFace(ent, -1);
        D.kitty.push(ent);
        layoutKitty(dur(360));
        ent.el.style.opacity = 0.6;
      }
      layoutHand(e.p, dur(300));
      sfx('card'); hold(dur(520));
    }
    function evPlay0(e) {
      D.phase = 'play'; D.alone = !!e.alone;
      D.kitty.forEach(k => drop(k, dur(380))); D.kitty = [];
      if (D.up) { drop(D.up, dur(380)); D.up = null; }
      if (e.alone && e.out >= 0) {
        D.out = e.out;
        const oa = GE.av[rel(e.out)];
        D.hands[e.out].forEach(x => { mv(x, oa[0], oa[1], x.r, 0.3, dur(380), 0, 1); drop(x, dur(380)); });
        D.hands[e.out] = [];
        avEls[e.out].classList.add('out');
        banner(`${esc(nm(e.maker))} ${e.maker === viewer ? 'go' : 'goes'} alone<small>${esc(nm(e.out))} sits out</small>`, 'red');
      }
      trumpPill(); chips();
      hold(dur(e.alone ? 1100 : 500));
    }
    function evRedeal() {
      D.phase = 'between'; D.redeal = true; D.turn = -1;
      avEls.forEach(a => a.classList.remove('turn'));
      banner('Everyone passed<small>Dealing a new hand</small>', 'blue');
      sfx('bad'); hold(dur(1500));
    }

    function chips() {
      for (let p = 0; p < 4; p++) {
        const a = avEls[p];
        a.querySelector('.nm').textContent = nm(p);
        let h = '';
        if (C.teams && p === ((viewer + 2) % 4) && p !== viewer) h += '<b class="k">Partner</b>';
        if (isH) {
          if (D.phase === 'pass' && D.picked[p]) h += '<b class="g">Ready</b>';
          if (D.pts[p]) h += `<b class="${D.pts[p] >= 13 ? 'x' : ''}">${D.pts[p]} pts</b>`;
        } else if (isS) {
          if (D.bid[p] != null) {
            const b = D.bid[p];
            h += `<b class="${b === 0 ? 'k' : ''}">${D.blind[p] ? 'Blind nil' : b === 0 ? 'Nil' : 'Bid ' + b}</b>`;
            if (D.phase === 'play' || D.phase === 'between') h += `<b class="${b > 0 && D.tw[p] >= b ? 'g' : b === 0 && D.tw[p] > 0 ? 'x' : ''}">Took ${D.tw[p]}</b>`;
          }
        } else {
          if (D.maker === p) h += `<b class="r">Maker${D.alone ? ' · alone' : ''}</b>`;
          if (D.out === p) h += '<b class="k">Sitting out</b>';
          else if (D.phase === 'play' && D.trump >= 0 && D.tw[p]) h += `<b class="g">${D.tw[p]} trick${D.tw[p] > 1 ? 's' : ''}</b>`;
        }
        a.querySelector('.ch').innerHTML = h;
      }
    }
    function refreshScore() {
      if (scene !== 'game') { scoreEl.hidden = true; return; }
      scoreEl.hidden = false;
      const R = M.rules || opt.rules;
      let h = '';
      if (isH) {
        h = `<div class="h">Hearts · to ${R.target}</div>` + [0, 1, 2, 3].map(r => { const p = absOf(r); return `<div class="r${p === viewer ? ' me' : ''}"><span>${esc(nm(p))}</span><span>${D.scores[p]}</span></div>`; }).join('');
      } else {
        const t = viewer & 1;
        h = `<div class="h">${C.title} · to ${R.target}</div><div class="r me"><span>Us</span><span>${D.score[t]}</span></div><div class="r"><span>Them</span><span>${D.score[1 - t]}</span></div>`;
        if (isS) {
          const tb = teamBids(D.bid), bidIn = D.bid.every(b => b != null);
          if (bidIn && D.phase !== 'between') h += `<div class="r"><span>Bid</span><span>${tb[t].n + (tb[t].nil ? '+N' : '')} / ${tb[1 - t].n + (tb[1 - t].nil ? '+N' : '')}</span></div>`;
          h += `<div class="r"><span>Bags</span><span>${D.bags[t]} / ${D.bags[1 - t]}</span></div>`;
        } else if (D.trump >= 0 && D.phase !== 'between') {
          h += `<div class="r"><span>Tricks</span><span>${D.tw[t] + D.tw[t + 2]} – ${D.tw[1 - t] + D.tw[3 - t]}</span></div>`;
        }
      }
      scoreEl.innerHTML = h;
    }


    function setPrompt(t, hot) { promptEl.textContent = t; promptEl.classList.toggle('hot', !!hot); }
    function viewFor(q) { const v = M.eng.view(q); v.legal = M.eng.legal(q); return v; }
    function view() {
      if (M.role === 'guest') return M.V;
      if (!M.eng) return null;
      if (M.vv !== M.ver) { M.V = viewFor(viewer); M.vv = M.ver; }
      return M.V;
    }
    const myHand = () => D.hands[viewer];
    const canAct = () => scene === 'game' && !paused && !Q.length && T >= busy && paneEl.hidden && !M.pending && idleDone;

    function feed(evs) {
      if (!evs || !evs.length) return;
      M.ver++;
      for (const e of evs) Q.push(M.eng.filt(e, viewer));
      idleDone = false;
      if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es: evs.map(e => M.eng.filt(e, q)), v: viewFor(q) }); });
    }
    function send(a) {
      if (M.role === 'guest') {
        M.pending = true; const k = ++M.pk;
        api.net.send({ t: 'act', a });
        at(4000, () => { if (M.pending && M.pk === k) { M.pending = false; hud(); } });
        return;
      }
      if (!M.eng) return;
      const ev = M.eng.act(viewer, a);
      if (ev) feed(ev); else sfx('bad');
    }

    function setLift(e, v) { e.lift = v; apply(e, dur(140), 0); }
    function arm(e) { if (D.armed && D.armed !== e) setLift(D.armed, 0); D.armed = e; setLift(e, -26); sfx('sel'); }
    function disarm() { if (D.armed) { setLift(D.armed, 0); D.armed = null; } }
    function toggleSel(e) {
      const i = D.sel.indexOf(e);
      if (i >= 0) { D.sel.splice(i, 1); setLift(e, 0); }
      else {
        if (D.sel.length >= 3) { const o = D.sel.shift(); setLift(o, 0); }
        D.sel.push(e); setLift(e, -26);
      }
      sfx('sel'); hud();
    }
    function confirmCard(e, go) {
      if (lastPT === 'touch' && D.armed !== e) { arm(e); return; }
      go();
    }
    function why(c, V) {
      const L = V.trick;
      if (isH) {
        if (!L.length) return V.tn === 0 ? 'Lead the 2♣' : cs(c) === 3 && !V.broken ? 'Hearts are not broken yet' : 'You cannot play that';
        const ls = cs(L[0].c);
        if (cs(c) !== ls && V.hand.some(x => cs(x) === ls)) return `Follow suit: ${SYMS[ls]}`;
        return 'No hearts or Q♠ on the first trick';
      }
      if (isS) {
        if (!L.length) return 'Spades are not broken yet';
        return `Follow suit: ${SYMS[cs(L[0].c)]}`;
      }
      if (L.length) return `Follow suit: ${SYMS[esuit(L[0].c, V.trump)]}`;
      return 'You cannot play that';
    }
    function reject(e, V) {
      sfx('bad');
      e.el.classList.remove('shake'); void e.el.offsetWidth; e.el.classList.add('shake');
      at(500, () => e.el.classList.remove('shake'));
      setPrompt(why(e.c, V), true);
      promptEl.classList.add('bad');
      const k = ++M.rk;
      at(1400, () => { if (M.rk === k) { promptEl.classList.remove('bad'); if (canAct()) hud(); } });
    }
    function onCard(e) {
      if (!e.mine || !canAct()) return;
      const V = view(); if (!V) return;
      if (isH && V.phase === 'pass') { if (!V.picked[viewer]) toggleSel(e); return; }
      if (V.turn !== viewer) return;
      if (isE && V.phase === 'discard') { confirmCard(e, () => send({ t: 'discard', c: e.c })); return; }
      if (V.phase === 'play') {
        if (!V.legal.includes(e.c)) { reject(e, V); return; }
        confirmCard(e, () => send({ t: 'play', c: e.c }));
      }
    }

    const NAMEOF = s => SUITN[s][0].toUpperCase() + SUITN[s].slice(1);
    function hud() {
      if (scene !== 'game') return;
      chips(); refreshScore(); trumpPill();
      actEl.innerHTML = ''; bidsEl.hidden = true; bidsEl.innerHTML = '';
      const hand = myHand();
      hand.forEach(e => e.el.classList.remove('ok', 'dim', 'hint', 'glow'));
      bHint.hidden = !(M.mode === 'solo' && opt.hints);
      const V = view();
      if (!V || V.phase === 'between' || V.phase === 'over' || V.phase === 'new') { setPrompt('', false); return; }
      const me = viewer, my = V.turn === me, ph = V.phase;
      if (isH && ph === 'pass') {
        if (V.picked[me]) {
          if (V.sel) hand.forEach(e => { if (V.sel.includes(e.c)) { e.el.classList.add('dim'); if (!e.lift) setLift(e, -26); } });
          setPrompt('Waiting for the other players…', false);
          return;
        }
        hand.forEach(e => { e.el.classList.add('ok'); e.el.classList.toggle('glow', D.sel.includes(e)); });
        setPrompt(`Pass 3 cards ${['to the left', 'to the right', 'across'][V.dir]}`, true);
        actEl.innerHTML = `<button class="cg-btn gold" data-a="pass"${D.sel.length === 3 ? '' : ' disabled'}>Pass ${D.sel.length}/3</button>`;
        return;
      }
      if (ph === 'play') {
        if (my) {
          const L = new Set(V.legal);
          hand.forEach(e => e.el.classList.add(L.has(e.c) ? 'ok' : 'dim'));
          let t = 'Your turn';
          if (isH && V.tn === 0 && !V.trick.length) t = 'You lead: play the 2♣';
          else if (!V.trick.length) t = 'Your lead';
          setPrompt(t, true);
        } else setPrompt(V.turn >= 0 ? `${nm(V.turn)} is playing…` : '', false);
        applyKc();
        return;
      }
      if (isS && ph === 'bid') {
        if (!my) { setPrompt(`${nm(V.turn)} is bidding…`, false); return; }
        const t = me & 1;
        if (V.okb[me] && !V.look[me]) {
          const gap = V.score[1 - t] - V.score[t];
          setPrompt(`You are ${gap} points behind`, true);
          actEl.innerHTML = '<button class="cg-btn alt" data-a="look">Look at my cards</button><button class="cg-btn warn" data-a="blind">Blind nil · 200</button>';
          return;
        }
        const pb = V.bid[(me + 2) % 4];
        setPrompt('Your bid', true);
        let g = `<div class="t">Partner ${pb == null ? 'has not bid yet' : pb === 0 ? 'bid nil' : 'bid ' + pb}</div><button class="nil" data-a="bid" data-v="0">Nil</button>`;
        for (let n = 1; n <= 13; n++) g += `<button data-a="bid" data-v="${n}">${n}</button>`;
        bidsEl.innerHTML = g; bidsEl.hidden = false;
        if (D.bidFocus >= 0) { const b = bidsEl.querySelector(`[data-v="${D.bidFocus}"]`); if (b) b.classList.add('kf'); }
        return;
      }
      if (isE) {
        if (ph === 'bid1' || ph === 'bid2') {
          if (!my) { setPrompt(`${nm(V.turn)} is deciding…`, false); return; }
          const al = M.rules.alone ? `<div class="cg-tog${D.alone1 ? ' on' : ''}" data-a="alone"><i>${D.alone1 ? '✓' : ''}</i>Alone</div>` : '';
          if (ph === 'bid1') {
            setPrompt(`Order up the ${PORT ? cname(V.up) : cfull(V.up)}?`, true);
            actEl.innerHTML = `<button class="cg-btn ghost" data-a="epass">Pass</button><button class="cg-btn gold" data-a="order">${V.dealer === me ? 'Pick it up' : 'Order up'}</button>${al}`;
          } else {
            const stuck = M.rules.stick && V.dealer === me;
            setPrompt(stuck ? 'Dealer must name trump' : 'Name trump or pass', true);
            let h = '';
            for (let s = 0; s < 4; s++) if (s !== V.upS) h += `<button class="cg-btn suit" data-a="call" data-v="${s}" aria-label="${NAMEOF(s)}"><i class="${s === 1 || s === 3 ? 'r' : ''}">${SYMS[s]}</i></button>`;
            h += `<button class="cg-btn ghost" data-a="epass"${stuck ? ' disabled' : ''}>Pass</button>${al}`;
            actEl.innerHTML = h;
          }
          return;
        }
        if (ph === 'discard') {
          if (my) { hand.forEach(e => e.el.classList.add('ok')); setPrompt('Discard one card', true); }
          else setPrompt(`${nm(V.turn)} is discarding…`, false);
          applyKc();
        }
      }
    }
    function applyKc() { myHand().forEach((e, i) => e.el.classList.toggle('kcur', i === D.kc)); }

    function doHint() {
      if (M.mode !== 'solo' || !M.eng || !canAct()) return;
      const V = view(); if (!V) return;
      if (!M.eng.need().some(x => x.p === viewer)) return;
      const a = M.eng.bot(viewer, 'Hard');
      sfx('sel');
      const hand = myHand();
      const mark = c => { const e = hand.find(x => x.c === c); if (e) e.el.classList.add('hint'); };
      const btn = s => { const b = stage.querySelector(s); if (b) b.classList.add('hint'); };
      if (a.t === 'pass' && a.cards) { a.cards.forEach(mark); setPrompt('Suggested cards are glowing', true); }
      else if (a.t === 'play' || a.t === 'discard') { mark(a.c); setPrompt('Try the glowing card', true); }
      else if (a.t === 'bid') { btn(`.cg-bids [data-v="${a.n}"]`); setPrompt(`Suggested bid: ${a.n === 0 ? 'Nil' : a.n}`, true); }
      else if (a.t === 'look') { btn('[data-a=look]'); setPrompt('Look at your cards first', true); }
      else if (a.t === 'blind') { btn('[data-a=blind]'); setPrompt('Blind nil is suggested', true); }
      else if (a.t === 'pass') { btn('[data-a=epass]'); setPrompt('Passing looks best', true); }
      else if (a.t === 'order') { btn('[data-a=order]'); setPrompt('Ordering it up looks best', true); }
      else if (a.t === 'call') { btn(`[data-a=call][data-v="${a.s}"]`); setPrompt(`${NAMEOF(a.s)} looks best`, true); }
    }

    function uiAct(a, v, el) {
      if (a === 'alone') { D.alone1 = !D.alone1; sfx('sel'); hud(); return; }
      if (!canAct()) return;
      const V = view(); if (!V) return;
      if (a === 'pass') { if (D.sel.length === 3 && !V.picked[viewer]) send({ t: 'pass', cards: D.sel.map(e => e.c) }); }
      else if (a === 'bid') send({ t: 'bid', n: +v });
      else if (a === 'look') send({ t: 'look' });
      else if (a === 'blind') send({ t: 'blind' });
      else if (a === 'epass') send({ t: 'pass' });
      else if (a === 'order') send({ t: 'order', alone: D.alone1 });
      else if (a === 'call') send({ t: 'call', s: +v, alone: D.alone1 });
    }

    api.on(stage, 'pointerdown', ev => { lastPT = ev.pointerType || 'mouse'; SND.play('tick'); });
    api.on(stage, 'click', ev => {
      const t = ev.target;
      if (t.closest('.cg-pane')) {
        const b = t.closest('[data-a]');
        if (b && !b.disabled && paneFn) { sfx('sel'); paneFn(b.dataset.a, b.dataset.v, b, ev); }
        return;
      }
      const u = t.closest('[data-u]');
      if (u) {
        sfx('sel');
        const k = u.dataset.u;
        if (k === 'menu') menuPane(); else if (k === 'hint') doHint(); else sheetPane();
        return;
      }
      const b = t.closest('[data-a]');
      if (b && !b.disabled) { if (b.dataset.a !== 'alone') sfx('sel'); uiAct(b.dataset.a, b.dataset.v, b); return; }
      const c = t.closest('.cg-card');
      if (c && c._e) { onCard(c._e); return; }
      disarm();
    });

    api.on(window, 'keydown', ev => {
      if (ev.target && ev.target.closest && ev.target.closest('input,textarea,select')) return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey || !api.alive) return;
      const k = (ev.key || '').toLowerCase();
      if (!paneEl.hidden) {
        if (k === 'enter' || k === ' ') { const d = paneEl.querySelector('[data-def]'); if (d) { ev.preventDefault(); d.click(); } }
        return;
      }
      if (scene !== 'game') return;
      if (k === 'm') { ev.preventDefault(); menuPane(); return; }
      if (k === 't') { ev.preventDefault(); sheetPane(); return; }
      if (k === 'h') { ev.preventDefault(); doHint(); return; }
      if (!canAct()) return;
      const V = view(); if (!V) return;
      const hand = myHand();
      if (isS && V.phase === 'bid' && V.turn === viewer && (V.look[viewer] || !V.okb[viewer])) {
        if (/^[0-9]$/.test(k)) {
          ev.preventDefault();
          let n = +k;
          if (D.kb && T - D.kbT < 900 && +(D.kb + k) <= 13) n = +(D.kb + k);
          D.kb = k; D.kbT = T; D.bidFocus = n; hud();
        } else if (k === 'n') { ev.preventDefault(); D.bidFocus = 0; hud(); }
        else if (k === 'arrowleft' || k === 'arrowright') { ev.preventDefault(); const d = k === 'arrowleft' ? -1 : 1; D.bidFocus = D.bidFocus < 0 ? (d > 0 ? 1 : 0) : (D.bidFocus + d + 14) % 14; hud(); }
        else if (k === 'enter' || k === ' ') { ev.preventDefault(); if (D.bidFocus >= 0) { const n = D.bidFocus; D.bidFocus = -1; send({ t: 'bid', n }); } }
        return;
      }
      if (isS && V.phase === 'bid' && V.turn === viewer && V.okb[viewer] && !V.look[viewer]) {
        if (k === 'l' || k === 'enter') { ev.preventDefault(); send({ t: 'look' }); }
        else if (k === 'b') { ev.preventDefault(); send({ t: 'blind' }); }
        return;
      }
      if (isE && (V.phase === 'bid1' || V.phase === 'bid2') && V.turn === viewer) {
        if (k === 'p') { ev.preventDefault(); if (!(V.phase === 'bid2' && M.rules.stick && V.dealer === viewer)) send({ t: 'pass' }); }
        else if (k === 'a') { ev.preventDefault(); D.alone1 = !D.alone1; hud(); }
        else if (k === 'o' && V.phase === 'bid1') { ev.preventDefault(); send({ t: 'order', alone: D.alone1 }); }
        else if (V.phase === 'bid2' && '1234'.includes(k)) {
          const opts = [0, 1, 2, 3].filter(s => s !== V.upS), s = opts[+k - 1];
          if (s != null) { ev.preventDefault(); send({ t: 'call', s, alone: D.alone1 }); }
        }
        return;
      }
      if (k === 'arrowleft' || k === 'arrowright') {
        ev.preventDefault();
        if (!hand.length) return;
        const d = k === 'arrowleft' ? -1 : 1;
        D.kc = D.kc < 0 ? (d > 0 ? 0 : hand.length - 1) : (D.kc + d + hand.length) % hand.length;
        applyKc(); sfx('sel');
      } else if (isH && V.phase === 'pass' && !V.picked[viewer] && (k === 'p' || (k === ' ' && D.sel.length === 3))) {
        ev.preventDefault(); uiAct('pass');
      } else if (k === 'enter' || k === ' ' || k === 'arrowup') {
        ev.preventDefault();
        if (D.kc >= 0 && hand[D.kc]) { const e = hand[D.kc], lp = lastPT; lastPT = 'key'; onCard(e); lastPT = lp; }
        else { D.kc = 0; applyKc(); }
      }
    });


    function showPane(kind, html, cls, fn) {
      paneEl.dataset.k = kind; paneEl.className = 'cg-pane' + (cls ? ' ' + cls : ''); paneEl.innerHTML = html; paneEl.hidden = false; paneEl.scrollTop = 0; paneFn = fn || null;
    }
    function hidePane() {
      if (paneEl.hidden && !paneEl.dataset.k) return;
      paneEl.hidden = true; paneEl.innerHTML = ''; paneEl.dataset.k = ''; paneFn = null;
    }
    const paneKind = () => (paneEl.hidden ? '' : paneEl.dataset.k);
    function resume() {
      hidePane();
      if (isOnline()) return;
      paused = false; idleDone = false;
    }
    function applyFelt() {
      const f = C.felts[opt.felt];
      feltEl.style.background = `radial-gradient(ellipse at 50% 42%, ${f[0]} 0%, ${f[1]} 58%, ${f[2]} 100%)`;
      wrap.style.setProperty('--cg-f1', f[0]); wrap.style.setProperty('--cg-f3', f[2]); wrap.style.background = f[2];
    }
    function applyBack() {
      const u = `url(${backUrl(opt.back)})`;
      for (const e of ents) e.b.style.backgroundImage = u;
    }
    const logoHtml = () => `<span class="cg-logo">${suitSvg(C.mark === 3 ? 2 : C.mark === 2 ? 3 : 1, 44)}${C.title}${suitSvg(C.mark === 3 ? 3 : C.mark === 2 ? 2 : 3, 44)}</span>`;
    const demoCards = () => {
      const cs5 = isE ? [mkc(0, 11), mkc(3, 14), mkc(2, 11), mkc(1, 13), mkc(3, 9)] : isS ? [mkc(2, 14), mkc(2, 13), mkc(3, 12), mkc(0, 14), mkc(2, 11)] : [mkc(3, 14), mkc(3, 12), mkc(2, 12), mkc(0, 2), mkc(3, 5)];
      return `<div class="cg-demo">${cs5.map((c, i) => `<i style="background-image:url(${faceUrl(c)});transform:rotate(${(i - 2) * 13}deg)"></i>`).join('')}</div>`;
    };

    function titlePane() {
      scene = 'title'; paused = false; M.mode = 'solo'; M.role = 'local'; M.eng = null; M.V = null;
      clearTable(); Q.length = 0; sched.length = 0; busy = T; D.dealer = -1; D.over = null;
      avEls.forEach(a => { a.hidden = true; }); dealerEl.hidden = true; trumpEl.hidden = true; scoreEl.hidden = true; actEl.innerHTML = ''; bidsEl.hidden = true; setPrompt('', false); bHint.hidden = true; netEl.hidden = true;
      applyFelt();
      const vs = isH ? 'You against 3 computer players' : 'You and a partner against 2 computer players';
      showPane('title', `<div class="cg-title">${demoCards()}${logoHtml()}<p class="cg-tag">${C.tag}</p>
<button class="cg-big green" data-a="solo" data-def>Play<small>${vs} · ${opt.diff}</small></button>
<button class="cg-big blue" data-a="online">Play online<small>4 seats · friends and bots</small></button>
<div class="cg-row"><button class="cg-sm" data-a="opts">Options</button><button class="cg-sm" data-a="rules">How to play</button></div>
<p class="cg-tag">${opt.wins} win${opt.wins === 1 ? '' : 's'} in ${opt.games} game${opt.games === 1 ? '' : 's'}</p></div>`, 'solid', (a) => {
        if (a === 'solo') { M.mode = 'solo'; newMatch(); }
        else if (a === 'online') startOnline();
        else if (a === 'opts') optsPane('title');
        else if (a === 'rules') rulesPane('title');
      });
    }

    function segHtml(label, sub, grp, key, vals, names, cur, lock) {
      return `<div class="cg-opt"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span><div class="cg-seg">${vals.map((v, i) => `<button class="${v === cur ? 'on' : ''}"${lock ? ' disabled' : ''} data-a="opt" data-g="${grp}" data-k="${key}" data-i="${i}">${names[i]}</button>`).join('')}</div></div>`;
    }
    function optsPane(from) {
      const inGame = scene === 'game', lockRules = inGame && (M.role === 'guest' || false);
      const R = opt.rules;
      let h = `<div class="cg-box wide col"><div class="cg-bh"><p class="cg-kick">${C.title}</p><h3>Options</h3></div><div class="cg-scr">`;
      h += `<p class="cg-sec">Computer players</p>` + segHtml('Difficulty', 'How well the computer plays', 'o', 'diff', ['Easy', 'Normal', 'Hard'], ['Easy', 'Normal', 'Hard'], opt.diff, inGame && isOnline());
      h += `<p class="cg-sec">Table</p>`;
      h += `<div class="cg-opt"><span>Table colour</span><div class="cg-seg">${C.felts.map((f, i) => `<button class="sw${i === opt.felt ? ' on' : ''}" style="background:linear-gradient(${f[0]},${f[2]})" data-a="felt" data-i="${i}" aria-label="Colour ${i + 1}"></button>`).join('')}</div></div>`;
      h += `<div class="cg-opt"><span>Card back</span><div class="cg-seg">${['blue', 'red'].map(b => `<button class="sw bk${b === opt.back ? ' on' : ''}" style="background-image:url(${backUrl(b)})" data-a="back" data-b="${b}" aria-label="${b} back"></button>`).join('')}</div></div>`;
      h += segHtml('Animation speed', '', 'o', 'speed', [1, 0.55], ['Normal', 'Fast'], opt.speed);
      h += segHtml('Hints', 'Lightbulb button, solo only', 'o', 'hints', [true, false], ['On', 'Off'], opt.hints);
      h += `<p class="cg-sec">Rules${inGame ? ' · apply to the next game' : ''}</p>`;
      for (const o of C.opts) h += segHtml(o.label, o.sub || '', 'r', o.k, o.vals, o.names, R[o.k], lockRules);
      h += `</div><div class="cg-bf"><button class="cg-big green" data-a="back" data-def>Done</button></div></div>`;
      const scEl = () => paneEl.querySelector('.cg-scr'), sc = scEl() ? scEl().scrollTop : 0;
      showPane('opts', h, from === 'title' ? 'solid' : '', (a, v, el) => {
        if (a === 'opt') {
          const i = +el.dataset.i, k = el.dataset.k;
          if (el.dataset.g === 'o') { const o = { diff: ['Easy', 'Normal', 'Hard'], speed: [1, 0.55], hints: [true, false] }[k]; opt[k] = o[i]; }
          else { const o = C.opts.find(x => x.k === k); opt.rules[k] = o.vals[i]; }
          save(); optsPane(from); if (scEl()) scEl().scrollTop = sc;
          if (k === 'hints') hud();
        } else if (a === 'felt') { opt.felt = +el.dataset.i; applyFelt(); save(); optsPane(from); if (scEl()) scEl().scrollTop = sc; }
        else if (a === 'back' && el.dataset.b) { opt.back = el.dataset.b; applyBack(); save(); optsPane(from); if (scEl()) scEl().scrollTop = sc; }
        else if (a === 'back') { from === 'title' ? titlePane() : from === 'menu' ? menuPane() : resume(); }
      });
      if (scEl()) scEl().scrollTop = sc;
    }
    function rulesPane(from) {
      let h = `<div class="cg-box wide col cg-rules"><div class="cg-bh"><p class="cg-kick">${C.title}</p><h3>How to play</h3></div><div class="cg-scr">`;
      for (const [t, x] of C.rules) h += `<h4>${t}</h4><p>${x}</p>`;
      h += `<h4>Controls</h4><p>${C.help}</p><p><kbd>M</kbd> menu · <kbd>H</kbd> hint (solo) · <kbd>T</kbd> score sheet</p>`;
      h += `</div><div class="cg-bf"><button class="cg-big green" data-a="back" data-def>Got it</button></div></div>`;
      showPane('rules', h, from === 'title' ? 'solid' : '', () => { from === 'title' ? titlePane() : from === 'menu' ? menuPane() : resume(); });
    }

    function menuPane() {
      if (scene !== 'game') return;
      if (!isOnline()) paused = true;
      let conf = false;
      const online = isOnline(), host = M.role !== 'guest';
      const h = `<div class="cg-box"><p class="cg-kick">${online ? 'Online table' : 'Paused'}</p><h3>${C.title}</h3>
<button class="cg-big green" data-a="resume" data-def>Resume</button>
<button class="cg-big ghost" data-a="sheet">Score sheet</button>
<div class="cg-row"><button class="cg-sm" data-a="opts">Options</button><button class="cg-sm" data-a="rules">How to play</button></div>
${host ? `<button class="cg-big blue" data-a="restart">${online ? 'Restart for everyone' : 'New game'}</button>` : ''}
<button class="cg-big red" data-a="quit">${online ? 'Leave table' : 'Quit to menu'}</button></div>`;
      showPane('menu', h, '', (a, v, el) => {
        if (a === 'resume') resume();
        else if (a === 'sheet') sheetPane('menu');
        else if (a === 'opts') optsPane('menu');
        else if (a === 'rules') rulesPane('menu');
        else if (a === 'restart') {
          if (!conf) { conf = true; el.innerHTML = 'Tap again to restart<small>This ends the current game</small>'; return; }
          paused = false; newMatch();
        } else if (a === 'quit') {
          if (!conf) { conf = true; el.innerHTML = online ? 'Tap again to leave' : 'Tap again to quit<small>This ends the current game</small>'; return; }
          if (online) leaveOnline(); else titlePane();
        }
      });
    }

    const lo = (arr, v) => (v === Math.min(...arr) ? 'lo' : v === Math.max(...arr) && v > 0 ? 'hi' : '');
    function sheetHtml(V) {
      const hist = V ? V.hist : [];
      if (isH) {
        const seats = [0, 1, 2, 3].map(absOf);
        let h = `<table class="cg-tbl"><tr><th>Hand</th>${seats.map(p => `<th>${esc(nm(p))}</th>`).join('')}</tr>`;
        hist.forEach((d, i) => { h += `<tr><td>${i + 1}</td>${seats.map(p => `<td class="${lo(d, d[p])}">${d[p] > 0 ? '+' : ''}${d[p]}</td>`).join('')}</tr>`; });
        const tot = V ? V.scores : [0, 0, 0, 0];
        h += `<tr class="tot"><td>Total</td>${seats.map(p => `<td>${tot[p]}</td>`).join('')}</tr></table>`;
        if (!hist.length) h = '<p>No hands played yet.</p>';
        return h;
      }
      const t = viewer & 1;
      if (isS) {
        let h = `<table class="cg-tbl"><tr><th rowspan="2">Hand</th><th colspan="3" style="text-align:center">Us</th><th colspan="3" style="text-align:center">Them</th></tr><tr><th>Bid</th><th>Took</th><th>Pts</th><th>Bid</th><th>Took</th><th>Pts</th></tr>`;
        hist.forEach((r, i) => {
          const cell = x => `<td>${x.bid}${x.nils.length ? '+' + x.nils.map(n => (n.blind ? 'B' : '') + 'N').join('') : ''}</td><td>${x.took}</td><td class="${x.delta >= 0 ? 'lo' : 'hi'}">${x.delta > 0 ? '+' : ''}${x.delta}</td>`;
          h += `<tr><td>${i + 1}</td>${cell(r.r[t])}${cell(r.r[1 - t])}</tr>`;
        });
        const sc = V ? V.score : [0, 0], bg = V ? V.bags : [0, 0];
        h += `<tr class="tot"><td>Total</td><td colspan="3" style="text-align:center">${sc[t]} <small>(${bg[t]} bags)</small></td><td colspan="3" style="text-align:center">${sc[1 - t]} <small>(${bg[1 - t]} bags)</small></td></tr></table>`;
        if (!hist.length) h = '<p>No hands played yet.</p>';
        return h + '<p>N = nil, BN = blind nil, bags carry over; every 10 bags cost 100.</p>';
      }
      let h = '<table class="cg-tbl"><tr><th>Hand</th><th>Called by</th><th>Trump</th><th>Tricks</th><th>Pts</th><th>Us – Them</th></tr>';
      let n = 0;
      hist.forEach(r => {
        if (r.redeal) { h += '<tr class="cur"><td colspan="6" style="text-align:center">Everyone passed: redeal</td></tr>'; return; }
        n++;
        const mt = r.maker & 1, mk = r.tw[mt] + r.tw[mt + 2];
        h += `<tr><td>${n}</td><td>${esc(nm(r.maker))}${r.alone ? ' (alone)' : ''}</td><td>${sym(r.trump)}</td><td>${mk}</td><td class="${r.team === t ? 'lo' : 'hi'}">${r.team === t ? '+' : '−'}${r.pts}${r.euchre ? ' euchre' : ''}</td><td>${r.score[t]} – ${r.score[1 - t]}</td></tr>`;
      });
      h += `<tr class="tot"><td colspan="5">Score</td><td>${V ? V.score[t] : 0} – ${V ? V.score[1 - t] : 0}</td></tr></table>`;
      if (!hist.length) h = '<p>No hands played yet.</p>';
      return h;
    }
    function sheetPane(from) {
      const V = view(), back = from === 'menu' ? menuPane : (from === 'over' ? showOver : resume);
      const wasPaused = paused;
      if (scene === 'game' && !isOnline() && !from) paused = true;
      showPane('sheet', `<div class="cg-box wide col"><div class="cg-bh"><p class="cg-kick">${C.title}</p><h3>Score sheet</h3></div><div class="cg-scr">${sheetHtml(V)}</div><div class="cg-bf"><button class="cg-big green" data-a="x" data-def>Close</button></div></div>`, '', () => {
        if (from === 'menu') menuPane();
        else if (from === 'over') showOver();
        else if (from === 'summary') showSummary();
        else resume();
      });
    }

    function showSummary() {
      const V = view();
      if (!V || !V.hist.length) return;
      const hist = V.hist, last = hist[hist.length - 1], host = M.role !== 'guest', online = isOnline();
      let body = '', title = '';
      if (isH) {
        const d = last, seats = [0, 1, 2, 3].map(absOf);
        const moon = d.findIndex(x => (M.rules.moon === 'sub' ? x === -26 : x === 0)) >= 0 && (M.rules.moon === 'sub' ? d.some(x => x === -26) : d.filter(x => x === 26).length === 3) ? d.findIndex(x => (M.rules.moon === 'sub' ? x === -26 : x === 0)) : -1;
        title = moon >= 0 ? `${esc(nm(moon))} shot the moon!` : `Hand ${hist.length} complete`;
        body = `<table class="cg-tbl"><tr><th></th><th>Hand</th><th>Total</th></tr>${seats.map(p => `<tr><td>${esc(nm(p))}</td><td class="${lo(d, d[p])}">${d[p] > 0 ? '+' : ''}${d[p]}</td><td>${V.scores[p]}</td></tr>`).join('')}</table><p>First to ${M.rules.target} ends the game; lowest score wins.</p>`;
      } else if (isS) {
        const t = viewer & 1, rs = [last.r[t], last.r[1 - t]];
        title = `Hand ${hist.length} complete`;
        const cellsFor = (f, lbl) => `<tr><td>${lbl}</td>${rs.map((x, i) => `<td>${f(x)}</td>`).join('')}</tr>`;
        const nilTxt = x => x.nils.length ? x.nils.map(n => `${nm(n.p)} ${n.blind ? 'blind ' : ''}nil ${n.ok ? 'made' : 'failed'} (${n.ok ? '+' : '−'}${n.blind ? 200 : 100})`).join('<br>') : '';
        body = `<table class="cg-tbl"><tr><th></th><th>Us</th><th>Them</th></tr>${cellsFor(x => x.bid + ' bid', 'Bid')}${cellsFor(x => x.took + ' taken', 'Tricks')}${cellsFor(x => (x.base > 0 ? '+' : '') + x.base, 'Contract')}${cellsFor(x => '+' + x.over, 'Bags')}${rs.some(x => x.nils.length) ? cellsFor(x => (x.nilPts > 0 ? '+' : '') + x.nilPts, 'Nil') : ''}${rs.some(x => x.pen) ? cellsFor(x => (x.pen ? '−' + x.pen : '0'), 'Bag penalty') : ''}<tr class="tot"><td>Change</td>${rs.map(x => `<td>${x.delta > 0 ? '+' : ''}${x.delta}</td>`).join('')}</tr><tr><td>Score</td>${[V.score[t], V.score[1 - t]].map(x => `<td>${x}</td>`).join('')}</tr></table>${rs.map(nilTxt).filter(Boolean).map(x => `<p>${x}</p>`).join('')}`;
      } else {
        const r = last.redeal ? hist.filter(x => !x.redeal).slice(-1)[0] : last, t = viewer & 1;
        if (!r) return;
        const mk = r.tw[r.maker & 1] + r.tw[(r.maker & 1) + 2];
        title = r.euchre ? 'Euchred!' : r.pts >= 4 ? 'Lone march!' : r.pts === 2 ? 'March!' : 'Hand complete';
        body = `<p>${esc(nm(r.maker))} called ${sym(r.trump)} ${NAMEOF(r.trump)}${r.alone ? ' and went alone' : ''}.</p><p>${r.maker % 2 === t ? 'Your team' : 'The opponents'} took ${mk} trick${mk === 1 ? '' : 's'}.</p><p><b>${r.team === t ? 'Your team scores' : 'The opponents score'} ${r.pts}${r.euchre ? ' (euchre)' : ''}.</b></p><table class="cg-tbl"><tr><th></th><th>Us</th><th>Them</th></tr><tr class="tot"><td>Score</td><td>${V.score[t]}</td><td>${V.score[1 - t]}</td></tr></table>`;
      }
      const cd = online && host ? `<p class="cd" data-cd></p>` : '';
      const btn = host ? `<button class="cg-big green" data-a="next" data-def>Next hand</button>` : '<p>Waiting for the host to deal…</p>';
      M.nextAt = online ? T + 14000 : 0; M.sumHand = V.n;
      showPane('summary', `<div class="cg-box"><p class="cg-kick">${C.title}</p><h3>${title}</h3>${body}${btn}${cd}<div class="cg-row"><button class="cg-sm" data-a="sheet">Score sheet</button></div></div>`, '', a => {
        if (a === 'next') nextHand();
        else if (a === 'sheet') sheetPane('summary');
      });
      if (!online) paused = false;
    }
    function nextHand() {
      if (M.role === 'guest' || !M.eng || M.eng.s.phase !== 'between') return;
      M.nextAt = 0; hidePane();
      feed(M.eng.next());
    }

    function overInfo(V) {
      if (isH) {
        const rank = [0, 1, 2, 3].sort((a, b) => V.scores[a] - V.scores[b] || a - b);
        return { win: rank[0], mine: rank[0] === viewer, rank };
      }
      const t = viewer & 1;
      const w = D.over && D.over.winner != null ? D.over.winner : (V.score[0] >= V.score[1] ? 0 : 1);
      return { win: w, mine: w === t };
    }
    function showOver() {
      const V = view();
      if (!V) return;
      const info = overInfo(V), host = M.role !== 'guest', online = isOnline();
      const t = viewer & 1;
      if (!M.counted) {
        M.counted = true; opt.games++;
        if (info.mine) { opt.wins++; api.submit(opt.wins); }
        save();
        sfx(info.mine ? 'win' : 'lose');
      }
      let head, rows = '';
      if (isH) {
        head = info.mine ? 'You win!' : `${esc(nm(info.win))} wins`;
        rows = `<table class="cg-tbl rk"><tr><th>#</th><th>Player</th><th>Score</th></tr>${info.rank.map((p, i) => `<tr class="${i === 0 ? 'tot' : ''}"><td>${i + 1}</td><td>${esc(nm(p))}</td><td>${V.scores[p]}</td></tr>`).join('')}</table>`;
      } else {
        head = info.mine ? 'Your team wins!' : 'The opponents win';
        const pn = tt => `${esc(nm(tt))} &amp; ${esc(nm(tt + 2))}`;
        const a = absOf(0), b = absOf(1);
        rows = `<table class="cg-tbl"><tr><th>Team</th><th>Score</th></tr><tr class="${info.mine ? 'tot' : ''}"><td>${esc(nm(viewer))} &amp; ${esc(nm((viewer + 2) % 4))}</td><td>${V.score[t]}</td></tr><tr class="${info.mine ? '' : 'tot'}"><td>${esc(nm(absOf(1)))} &amp; ${esc(nm(absOf(3)))}</td><td>${V.score[1 - t]}</td></tr></table>`;
      }
      const wseat = isH ? info.win : (info.mine ? viewer : absOf(1));
      let btns;
      if (online) btns = host ? `<button class="cg-big green" data-a="again" data-def>Rematch</button><button class="cg-big blue" data-a="lobby">Back to lobby</button>` : '<p>Waiting for the host to start a rematch…</p>';
      else btns = `<button class="cg-big green" data-a="again" data-def>Play again</button>`;
      showPane('over', `<div class="cg-box"><div class="cg-who" style="background-image:url(${avatarUrl(M.av[wseat])})"></div><p class="cg-kick">Game over</p><h3>${head}</h3>${rows}${btns}<div class="cg-row"><button class="cg-sm" data-a="sheet">Score sheet</button><button class="cg-sm" data-a="quit">${online ? 'Leave table' : 'Menu'}</button></div><p class="cg-tag">${opt.wins} win${opt.wins === 1 ? '' : 's'} in ${opt.games} games</p></div>`, '', a => {
        if (a === 'again') newMatch();
        else if (a === 'lobby') startOnline();
        else if (a === 'sheet') sheetPane('over');
        else if (a === 'quit') { if (online) leaveOnline(); else titlePane(); }
      });
      api.score(opt.wins);
    }


    const avOf = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 8; };
    function setupAvatars() {
      for (let p = 0; p < 4; p++) {
        const a = avEls[p];
        a.hidden = false; a.classList.remove('turn', 'out'); a.classList.toggle('me', p === viewer);
        a.querySelector('.ph').style.backgroundImage = `url(${avatarUrl(M.av[p] || 0)})`;
      }
    }
    function resetDisplay() {
      clearTable(); Q.length = 0; sched.length = 0; busy = T; idleDone = true; paused = false;
      D.scores = [0, 0, 0, 0]; D.score = [0, 0]; D.bags = [0, 0]; D.hno = 0; D.over = null; D.summary = false; D.sumE = null; D.redeal = false;
      D.dealer = -1; D.trump = -1; D.maker = -1; D.out = -1; D.alone = false; D.alone1 = false; D.tw = [0, 0, 0, 0]; D.pts = [0, 0, 0, 0];
      D.bid = [null, null, null, null]; D.blind = [false, false, false, false]; D.picked = [false, false, false, false]; D.phase = ''; D.broken = false; D.bidFocus = -1;
      M.V = null; M.vv = -1; M.ver = 0; M.botVer = -1; M.pending = false; M.counted = false; M.dl = null; M.nextAt = 0;
      scene = 'game'; hidePane(); fit(true); applyFelt(); setupAvatars(); placeHud();
      bidsEl.hidden = true; actEl.innerHTML = ''; trumpEl.hidden = true; setPrompt('', false);
      netEl.hidden = !isOnline();
      api.score(opt.wins);
      chips(); refreshScore();
    }
    function newMatch() {
      M.tok++;
      const online = isOnline() && M.role === 'host';
      if (!online) { M.mode = 'solo'; M.role = 'local'; }
      M.rules = Object.assign({}, opt.rules); M.diff = opt.diff;
      const pool = shuf(BOT_NAMES.slice()), avs = shuf([0, 1, 2, 3, 4, 5, 6, 7]);
      M.human = [false, false, false, false]; M.cpu = [true, true, true, true]; M.names = []; M.av = []; M.pids = [null, null, null, null];
      viewer = 0;
      if (online) {
        const live = M.players.filter((x, i) => i === 0 || api.net.players.some(q => q.id === x.id && !q.away && q.inGame !== false)).slice(0, 4);
        M.players = live;
        const order = [0, 2, 1, 3];
        live.forEach((pl, i) => { const s = order[i]; M.human[s] = true; M.cpu[s] = false; M.pids[s] = i ? pl.id : null; M.names[s] = pl.name || 'Player'; M.av[s] = avOf(pl.name || 'Player'); });
      } else { M.human[0] = true; M.cpu[0] = false; M.names[0] = 'You'; M.av[0] = 7; }
      let bi = 0;
      for (let s = 0; s < 4; s++) if (!M.human[s]) { M.names[s] = pool[bi]; M.av[s] = avs[bi] === (M.av[0] || -1) ? (avs[bi] + 1) % 8 : avs[bi]; bi++; }
      resetDisplay();
      M.eng = C.Engine(M.rules);
      if (online) sendSetups();
      feed(M.eng.start());
    }
    const setupMsg = q => ({ t: 'setup', seat: q, human: M.human, cpu: M.cpu, names: M.names, av: M.av, rules: M.rules });
    function sendSetups() { M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, setupMsg(q)); }); }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !M.human[q]) return;
      api.net.sendTo(id, setupMsg(q));
      api.net.sendTo(id, { t: 'ev', es: [], v: viewFor(q), sync: 1 });
    }
    function seatToCpu(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const who = M.names[q];
      M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (CPU)';
      M.ver++; M.dl = null;
      api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
      toast(who + ' left. A computer player takes the seat.');
      chips();
    }
    function leaveOnline() {
      M.tok++; M.mode = 'solo'; M.role = 'local'; M.eng = null; M.V = null; M.pids = []; M.players = [];
      api.net.close(); titlePane();
    }
    function syncD(v) {
      Q.length = 0; sched.length = 0; busy = T; hidePane(); clearTable();
      D.hno = v.n; D.phase = v.phase; D.dealer = v.dealer == null ? -1 : v.dealer; D.dir = v.dir == null ? 3 : v.dir; D.broken = !!v.broken;
      D.tw = v.tw ? v.tw.slice() : v.cnt ? v.cnt.slice() : [0, 0, 0, 0];
      D.pts = v.pts ? v.pts.slice() : [0, 0, 0, 0];
      D.scores = v.scores ? v.scores.slice() : [0, 0, 0, 0]; D.score = v.score ? v.score.slice() : [0, 0]; D.bags = v.bags ? v.bags.slice() : [0, 0];
      D.bid = v.bid ? v.bid.slice() : [null, null, null, null]; D.blind = v.blind ? v.blind.slice() : [false, false, false, false];
      D.trump = v.trump == null ? -1 : v.trump; D.maker = v.maker == null ? -1 : v.maker; D.alone = !!v.alone; D.out = v.out == null ? -1 : v.out;
      D.picked = v.picked ? v.picked.slice() : [false, false, false, false];
      D.look = isS ? !!v.look[viewer] : true; D.okb = v.okb || null;
      D.over = v.phase === 'over' ? {} : null; D.summary = v.phase === 'between'; D.redeal = false; D.turn = v.turn; D.sel = [];
      v.hand.forEach(c => { const e = mk(c); e.mine = true; e.up = D.look; e.inn.style.transform = D.look ? '' : 'rotateY(180deg)'; D.hands[viewer].push(e); });
      for (let p = 0; p < 4; p++) if (p !== viewer) for (let i = 0; i < v.counts[p]; i++) D.hands[p].push(mk(-1));
      v.trick.forEach((t, i) => {
        const e = mk(t.c); e.up = true; e.inn.style.transform = '';
        D.trick.push({ p: t.p, e, jx: rnd(-4, 4), jy: rnd(-4, 4), jr: rnd(-7, 7) });
      });
      if (isE) {
        const c = GE.ctr;
        if (v.phase === 'bid1') { const u = mk(v.up); u.up = true; u.inn.style.transform = ''; D.up = u; }
        else if (v.phase === 'bid2') { const u = mk(-1); D.kitty.push(u); }
      }
      avEls.forEach((a, i) => { a.classList.toggle('turn', i === D.turn); a.classList.toggle('out', i === D.out); });
      relayoutAll(0); layoutTrick(0);
      placeDealer(); chips(); refreshScore(); trumpPill();
      idleDone = false; busy = T + 50;
    }
    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (isOnline() && M.role === 'host' && p) seatToCpu(p.id); });
      api.net.on('rejoin', p => { if (isOnline() && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (isOnline() && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (!isOnline() || !M.role || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; M.V = null; Q.length = 0; paused = true;
        sfx('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the table.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        showPane('left', `<div class="cg-box"><p class="cg-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="cg-big green" data-a="room" data-def>Online lobby</button><button class="cg-big red" data-a="cpu">Play against the computer</button></div>`, 'solid', a => {
          paused = false;
          if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'solo'; titlePane(); }
        });
      });
      api.interval(() => {
        if (!isOnline() || scene !== 'game') return;
        const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== viewer && M.human[q]).length;
        netEl.classList.toggle('bad', !on);
        netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    async function startOnline() {
      const tok = ++M.tok;
      hookNet();
      clearTable(); Q.length = 0; sched.length = 0; busy = T; paused = false; scene = 'title';
      avEls.forEach(a => { a.hidden = true; }); dealerEl.hidden = true; trumpEl.hidden = true; scoreEl.hidden = true; actEl.innerHTML = ''; bidsEl.hidden = true; setPrompt('', false); bHint.hidden = true; netEl.hidden = true;
      M.mode = 'online'; M.role = null; M.eng = null; M.V = null;
      applyFelt();
      showPane('wait', '<div class="cg-box"><p class="cg-kick">Online</p><h3>Opening the party…</h3></div>', 'solid', null);
      const r = await api.net.room({ title: C.title, sizes: [4], defaultSize: 4, min: 4, max: 4, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.mode = 'solo'; M.role = 'local'; return titlePane(); }
      M.role = r.role; M.players = r.players.slice(0, 4); M.bots = !!r.bots;
      if (r.role === 'host') newMatch();
      else showPane('wait', '<div class="cg-box"><p class="cg-kick">Online</p><h3>Connected</h3><p>Waiting for the host to deal…</p><div class="cg-row"><button class="cg-sm" data-a="leave">Leave</button></div></div>', 'solid', a => { if (a === 'leave') leaveOnline(); });
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || !isOnline()) return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === viewer || !M.human[q]) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          const ev = M.eng.act(q, d.a);
          if (ev) feed(ev); else api.net.sendTo(from, { t: 'ev', es: [], v: viewFor(q) });
        }
        return;
      }
      if (d.t === 'setup') {
        M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat;
        M.human = d.human; M.cpu = d.cpu; M.names = d.names; M.av = d.av; M.rules = d.rules; M.eng = null;
        resetDisplay();
      } else if (M.role !== 'guest') return;
      else if (d.t === 'ev') {
        M.V = d.v; M.pending = false; M.dl = null; idleDone = false;
        if (d.sync) syncD(d.v); else Q.push(...d.es);
      } else if (d.t === 'seats') { M.cpu = d.cpu; M.human = d.human; M.names = d.names; chips(); }
      else if (d.t === 'tm') M.dl = { p: d.p, at: T + (+d.ms || 0), ms: +d.ms || 45000 };
    }

    function thinkTime(k) {
      const b = k === 'play' ? [620, 1100] : k === 'pass' ? [900, 1400] : k === 'discard' ? [800, 1200] : [900, 1500];
      return dur(rnd(b[0], b[1]));
    }
    function safeAct(p, k) {
      const s = M.eng.s;
      if (k === 'pass') return { t: 'pass', cards: s.hands[p].slice(0, 3) };
      if (k === 'play') return { t: 'play', c: M.eng.legal(p)[0] };
      if (k === 'bid') return s.look[p] ? { t: 'bid', n: 1 } : { t: 'look' };
      if (k === 'bid1') return { t: 'pass' };
      if (k === 'bid2') return M.rules.stick && p === s.dealer ? { t: 'call', s: [0, 1, 2, 3].find(x => x !== s.upS) } : { t: 'pass' };
      return { t: 'discard', c: s.hands[p][0] };
    }
    function actFor(p, k, lvl) {
      let a = null;
      try { a = M.eng.bot(p, lvl); } catch (e) { a = null; }
      let ev = a && M.eng.act(p, a);
      if (!ev) ev = M.eng.act(p, safeAct(p, k));
      return ev;
    }
    function botStep() {
      if (M.role === 'guest' || !M.eng || paused || scene !== 'game' || Q.length || T < busy || !idleDone) return;
      const nd = M.eng.need();
      if (!nd.length) return;
      if (M.botVer !== M.ver) {
        M.botVer = M.ver; M.botAt = T + thinkTime(nd[0].k);
        const hs = nd.filter(x => M.human[x.p]);
        if (isOnline() && hs.length) {
          M.dl = { p: hs.map(x => x.p), at: T + 45000, ms: 45000 };
          api.net.send({ t: 'tm', p: M.dl.p, ms: 45000 });
        } else M.dl = null;
      }
      const cp = nd.filter(x => M.cpu[x.p]);
      if (cp.length && T >= M.botAt) {
        for (const x of cp) { const ev = actFor(x.p, x.k, M.diff); if (ev) feed(ev); }
        return;
      }
      if (M.dl && T >= M.dl.at) {
        M.dl = null;
        for (const x of nd.filter(y => M.human[y.p])) {
          const ev = actFor(x.p, x.k, 'Normal');
          if (ev) feed(ev);
          if (x.p === viewer) toast('Time is up. A card was played for you.');
        }
      }
    }
    function timers() {
      for (let p = 0; p < 4; p++) {
        const tm = avEls[p].querySelector('.tm');
        const left = M.dl && M.dl.p.includes(p) ? M.dl.at - T : -1;
        if (left > 0 && left < 25000) tm.style.background = `conic-gradient(#ffd84a ${Math.round(left / M.dl.ms * 360)}deg, rgba(0,0,0,.35) 0)`;
        else tm.style.background = '';
      }
      if (M.nextAt && M.role !== 'guest') {
        const l = Math.ceil((M.nextAt - T) / 1000), cd = paneEl.querySelector('[data-cd]');
        if (cd) cd.textContent = l > 0 ? `Next hand in ${l}s` : '';
        if (l <= 0 && paneKind() === 'summary' && M.eng && M.eng.s.phase === 'between') nextHand();
      }
    }
    function onIdle() {
      if (scene !== 'game') return;
      hud();
      if (D.over && !M.counted && paneKind() !== 'over') { showOver(); return; }
      if (D.phase === 'between' && D.summary && !D.over && !D.redeal && paneEl.hidden) showSummary();
      if (D.redeal && M.role !== 'guest' && M.eng && M.eng.s.phase === 'between') at(dur(250), () => { if (M.eng && M.eng.s.phase === 'between') feed(M.eng.next()); });
      api.score(opt.wins);
    }

    api.loop(dt => {
      T += dt * 1000;
      pump(); botStep();
      if (isOnline()) timers();
    });
    api.on(window, 'resize', () => { fit(false); rescale(); });
    api.interval(() => { fit(false); rescale(); }, 500);
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => rescale()); ro.observe(wrap); }
    SND.setMuted(() => api.muted);
    applyFelt(); fit(true);
    root._cg = { M, D, Q, opt, view, get T() { return T; }, get viewer() { return viewer; }, get scene() { return scene; }, ents: () => ents, hand: () => myHand().map(e => e.c), pane: () => paneKind(), idle: () => canAct(), geo: () => GE, dbg: () => ({ paused, busy: Math.round(busy - T), q: Q.map(e => e.k), idleDone, ver: M.ver, botVer: M.botVer, sched: sched.length }) };
    api.score(opt.wins);
    if (api.net.invite) startOnline(); else titlePane();
    return { destroy() { M.tok++; if (ro) ro.disconnect(); SND.close(); } };
  }


  const fmtWins = v => v + (v === 1 ? ' win' : ' wins');
  const iconSuit = s => `<svg viewBox="-1.1 -1.1 2.2 2.2" fill="currentColor"><path d="${suitD(s)}"/></svg>`;
  const TINT = { hearts: '#d63a3a', spades: '#2b4f9c', euchre: '#8a2b3a' };
  const BLURB = {
    hearts: 'Dodge the hearts and the Queen of Spades. Pass cards, break hearts or shoot the moon against three computer players.',
    spades: 'Partnership bidding with nil, blind nil and bags. Make your bid with the player across from you.',
    euchre: 'Order up or name trump, play the bowers and go alone. The 24 card partnership game with stick the dealer.'
  };
  ['hearts', 'spades', 'euchre'].forEach(id => {
    const c = CFG[id];
    Ameplay.register({
      id, title: c.title, category: 'Board', tint: TINT[id], blurb: BLURB[id], help: c.help,
      width: 960, format: fmtWins, better: 'high', icon: iconSuit(c.mark),
      css: cssFor(id),
      mount: (root, api) => mountCards(id, root, api)
    });
  });

  const COV_BACK = { hearts: ['#2f9a58', '#0a3a1f'], spades: ['#2e5fa8', '#0a1a3d'], euchre: ['#9a3a3f', '#33080d'] };
  const covCard = (c, x, y, r) => {
    const s = (c / 13) | 0, rk = c % 13 + 2, red = s === 1 || s === 3, col = red ? '#d3202b' : '#1b1e25';
    const lab = rk === 14 ? 'A' : rk === 13 ? 'K' : rk === 12 ? 'Q' : rk === 11 ? 'J' : rk;
    return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-44" y="-62" width="88" height="124" rx="9" fill="#000" opacity=".3" transform="translate(4 6)"/><rect x="-44" y="-62" width="88" height="124" rx="9" fill="#fffefa" stroke="#c9c6b8" stroke-width="2"/><text x="-34" y="-34" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="28" fill="${col}">${lab}</text><g transform="translate(-24 -16) scale(11)" fill="${col}"><path d="${suitD(s)}"/></g><g transform="translate(6 18) scale(26)" fill="${col}"><path d="${suitD(s)}"/></g></g>`;
  };
  const covers = {
    hearts: [[3 * 13 + 12, 150, 168, -22], [2 * 13 + 10, 202, 160, -6], [3 * 13 + 11, 254, 160, 10], [3 * 13 + 7, 304, 170, 24]],
    spades: [[2 * 13 + 12, 150, 168, -22], [2 * 13 + 11, 202, 160, -6], [2 * 13 + 9, 254, 160, 10], [3 * 13 + 12, 304, 170, 24]],
    euchre: [[2 * 13 + 9, 150, 168, -22], [0 * 13 + 9, 202, 160, -6], [3 * 13 + 9, 254, 160, 10], [1 * 13 + 9, 304, 170, 24]]
  };
  ['hearts', 'spades', 'euchre'].forEach(id => {
    const c = CFG[id], f = COV_BACK[id];
    Ameplay.covers[id] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="cvg-${id}" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${f[0]}"/><stop offset="1" stop-color="${f[1]}"/></radialGradient></defs><rect width="400" height="300" fill="url(#cvg-${id})"/><g transform="translate(200 150) scale(120)" fill="#fff" opacity=".07"><path d="${suitD(c.mark)}"/></g>${covers[id].map(a => covCard(...a)).join('')}<text x="200" y="266" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="46" fill="#ffd84a" stroke="#3a2600" stroke-width="7" paint-order="stroke" text-anchor="middle">${c.title}</text></svg>`;
  });
})();
