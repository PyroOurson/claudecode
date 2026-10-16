
(() => {
  'use strict';

  const CFG = {
    HAND: 7, TARGET: 500, PTS_ACTION: 20, PTS_WILD: 50,
    CATCH_DRAW: 2, CHAL_GUILTY: 4, CHAL_FAIL: 6, D2: 2, W4: 4,
    T: { deal: 72, fly: 380, flyDur: 330, draw: 330, drawGap: 135, pass: 650 },
    SLOT_MIN: 47
  };
  const HEX = ['#e8282b', '#fcc916', '#2fa84a', '#1d6fc8'];
  const DEEP = ['#9b1114', '#b48600', '#17702c', '#0f4486'];
  const CN = ['Red', 'Yellow', 'Green', 'Blue'];
  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';

  const DECK = [];
  for (let c = 0; c < 4; c++) { DECK.push([c, 0]); for (let v = 1; v <= 12; v++) DECK.push([c, v], [c, v]); }
  for (let i = 0; i < 4; i++) DECK.push([4, 13]);
  for (let i = 0; i < 4; i++) DECK.push([4, 14]);
  const CC = id => DECK[id][0], CV = id => DECK[id][1];
  const PTS = id => { const v = CV(id); return v < 10 ? v : v < 13 ? CFG.PTS_ACTION : CFG.PTS_WILD; };
  const NAMEV = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild Draw Four'];
  const cardName = id => CV(id) >= 13 ? NAMEV[CV(id)] : CN[CC(id)] + ' ' + NAMEV[CV(id)];

  const RULE_DEF = { chal: false, nobluff: true, stack2: true, stack4: true, mix: false, s70: false, until: true, force: false, jump: false, multi: false, strict: true, pen: 2, timer: 0, hand: 7 };
  const stacking = r => r.stack2 || r.stack4 || r.mix;
  function canPlay(st, hand, id) {
    const v = CV(id), r = st.rules;
    if (st.pend > 0) {
      if (v === 12) return st.pendT === 12 ? !!r.stack2 : !!r.mix;
      if (v === 14) return st.pendT === 14 ? !!r.stack4 : !!r.mix;
      return false;
    }
    if (v === 13) return true;
    if (v === 14) return r.chal || !r.nobluff || !hand.some(x => CC(x) === st.col);
    return CC(id) === st.col || v === CV(st.top);
  }
  const twins = (hand, id) => CV(id) <= 9 ? hand.filter(x => x !== id && CV(x) === CV(id)) : [];

  function Game(o) {
    const R = o.rnd || Math.random, n = o.n, rules = Object.assign({}, RULE_DEF, o.rules);
    const rint = k => Math.floor(R() * k);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const s = { n, scores: Array(n).fill(0), dealer: rint(n), round: 0, deck: [], disc: [], hands: [], col: -1, dir: 1, turn: 0, phase: 'idle', pend: 0, pendT: 0, drawn: -1, called: [], vul: -1, w4: null, tid: 0, winner: -1, champ: -1 };
    let ev = [];
    const E = e => ev.push(e);
    const nxt = (p, k = 1) => ((p + s.dir * k) % n + n) % n;
    const top = () => s.disc[s.disc.length - 1];
    const hasCol = (p, c) => s.hands[p].some(id => CC(id) === c);
    const st = () => ({ pend: s.pend, pendT: s.pendT, col: s.col, top: top(), rules });
    const legal = (p, id) => canPlay(st(), s.hands[p], id);
    const snap = () => s.hands.map(h => h.slice());

    function reshuffle() {
      if (s.disc.length < 2) return false;
      const t = s.disc.pop();
      s.deck = shuffle(s.disc); s.disc = [t];
      E({ k: 'shuf', n: s.deck.length });
      return true;
    }
    function draw(p, k, why) {
      let ids = []; const all = [];
      for (let i = 0; i < k; i++) {
        if (!s.deck.length) {
          if (ids.length) { E({ k: 'draw', p, ids, why, col: s.col }); ids = []; }
          if (!reshuffle()) break;
        }
        const id = s.deck.pop();
        ids.push(id); all.push(id); s.hands[p].push(id);
      }
      if (ids.length) E({ k: 'draw', p, ids, why, col: s.col });
      if (all.length) s.called[p] = false;
      return all;
    }
    function begin(p) {
      s.turn = p; s.phase = 'play'; s.drawn = -1; s.tid++;
      E({ k: 'turn', p });
      if (s.pend > 0 && !s.hands[p].some(id => legal(p, id))) {
        const k = s.pend, t = s.pendT; s.pend = 0; s.pendT = 0;
        draw(p, k, t === 14 ? '+4' : '+2'); E({ k: 'skip', p });
        begin(nxt(p));
      }
    }
    function endRound(w) {
      let pts = 0;
      for (let q = 0; q < n; q++) if (q !== w) for (const id of s.hands[q]) pts += PTS(id);
      s.scores[w] += pts; s.winner = w; s.vul = -1; s.w4 = null; s.pend = 0; s.pendT = 0; s.drawn = -1;
      const done = !o.target || s.scores[w] >= o.target;
      s.phase = done ? 'done' : 'end';
      if (done) s.champ = w;
      E({ k: 'end', w, pts, hands: snap(), scores: s.scores.slice(), done });
    }
    function play(p, id, col, tgt, more) {
      const h = s.hands[p];
      h.splice(h.indexOf(id), 1);
      const v = CV(id), prev = s.col, stacked = s.pend > 0;
      s.disc.push(id);
      s.col = v >= 13 ? col : CC(id);
      E({ k: 'play', p, id, col: s.col });
      for (const x of more || []) { h.splice(h.indexOf(x), 1); s.disc.push(x); s.col = CC(x); E({ k: 'play', p, id: x, col: s.col, multi: 1 }); }
      if (v === 14) s.w4 = { p, prev, guilty: hasCol(p, prev) };
      if (!h.length) {
        if (v === 12 || v === 14) { const k = s.pend + (v === 12 ? CFG.D2 : CFG.W4); s.pend = 0; s.pendT = 0; draw(nxt(p), k, v === 14 ? '+4' : '+2'); }
        return endRound(p);
      }
      if (rules.s70 && v === 7 && tgt >= 0) {
        const t = s.hands[p]; s.hands[p] = s.hands[tgt]; s.hands[tgt] = t;
        s.called[p] = s.hands[p].length === 1; s.called[tgt] = s.hands[tgt].length === 1;
        if (s.vul === tgt) s.vul = -1;
        E({ k: 'swap', a: p, b: tgt, hands: snap() });
      }
      if (rules.s70 && v === 0) {
        const old = s.hands.slice();
        for (let q = 0; q < n; q++) s.hands[nxt(q)] = old[q];
        for (let q = 0; q < n; q++) s.called[q] = s.hands[q].length === 1;
        s.vul = -1;
        E({ k: 'rot', dir: s.dir, hands: snap() });
      }
      if (s.hands[p].length === 1 && !s.called[p]) { s.vul = p; E({ k: 'vul', p }); }
      if (v === 10) { E({ k: 'skip', p: nxt(p) }); begin(nxt(p, 2)); }
      else if (v === 11) {
        s.dir = -s.dir; E({ k: 'rev', dir: s.dir });
        if (n === 2) { E({ k: 'skip', p: nxt(p) }); begin(p); } else begin(nxt(p));
      } else if (v === 12) {
        if (stacking(rules)) { s.pend += CFG.D2; s.pendT = 12; begin(nxt(p)); }
        else { const q = nxt(p); draw(q, CFG.D2, '+2'); E({ k: 'skip', p: q }); begin(nxt(p, 2)); }
      } else if (v === 14) {
        if (rules.chal && !stacked) { s.turn = nxt(p); s.phase = 'chal'; s.drawn = -1; s.tid++; E({ k: 'turn', p: s.turn }); E({ k: 'w4', p, to: s.turn }); }
        else if (stacking(rules)) { s.w4 = null; s.pend += CFG.W4; s.pendT = 14; begin(nxt(p)); }
        else { s.w4 = null; const q = nxt(p); draw(q, CFG.W4, '+4'); E({ k: 'skip', p: q }); begin(nxt(p, 2)); }
      } else begin(nxt(p));
    }
    function challenge(p, y) {
      const w = s.w4; s.w4 = null;
      if (!y) { draw(p, CFG.W4, '+4'); E({ k: 'skip', p }); return begin(nxt(p)); }
      E({ k: 'chal', by: p, v: w.p, guilty: w.guilty, hand: s.hands[w.p].slice() });
      if (w.guilty) { draw(w.p, CFG.CHAL_GUILTY, 'chal'); begin(p); }
      else { draw(p, CFG.CHAL_FAIL, 'chal'); E({ k: 'skip', p }); begin(nxt(p)); }
    }
    function drawAct(p) {
      if (s.pend > 0) { const k = s.pend, t = s.pendT; s.pend = 0; s.pendT = 0; draw(p, k, t === 14 ? '+4' : '+2'); E({ k: 'skip', p }); return begin(nxt(p)); }
      let got, guard = 0;
      do { got = draw(p, 1, 'draw'); } while (rules.until && got.length && !legal(p, got[0]) && ++guard < 120);
      const id = got.length ? got[0] : -1;
      if (id >= 0 && legal(p, id)) { s.phase = 'drawn'; s.drawn = id; s.tid++; E({ k: 'drawn', p, force: !!rules.force }); }
      else begin(nxt(p));
    }
    function closeWin() { if (s.vul >= 0) { s.vul = -1; E({ k: 'safe' }); } }
    const validCol = c => Number.isInteger(c) && c >= 0 && c < 4;
    function okMore(p, id, more) {
      if (!more || !more.length) return true;
      if (!rules.multi || CV(id) > 9 || !Array.isArray(more) || more.length > 7) return false;
      const h = s.hands[p], seen = new Set([id]);
      for (const x of more) { if (!h.includes(x) || seen.has(x) || CV(x) !== CV(id)) return false; seen.add(x); }
      return true;
    }

    const g = {
      s, rules, target: o.target, legal,
      take() { const e = ev; ev = []; return e; },
      deal() {
        s.round++;
        if (s.round > 1) s.dealer = (s.dealer + 1) % n;
        s.deck = shuffle([...Array(DECK.length).keys()]); s.disc = []; s.hands = Array.from({ length: n }, () => []);
        s.dir = 1; s.pend = 0; s.pendT = 0; s.vul = -1; s.w4 = null; s.called = Array(n).fill(false); s.winner = -1; s.drawn = -1;
        for (let k = 0; k < (rules.hand || CFG.HAND); k++) for (let i = 1; i <= n; i++) s.hands[(s.dealer + i) % n].push(s.deck.pop());
        E({ k: 'deal', dealer: s.dealer, hands: snap() });
        let t;
        for (;;) {
          t = s.deck.pop();
          if (CV(t) !== 14) break;
          E({ k: 'flip', id: t, back: true });
          s.deck.push(t); shuffle(s.deck);
        }
        s.disc.push(t);
        const v = CV(t);
        s.col = v === 13 ? -1 : CC(t);
        E({ k: 'flip', id: t });
        const first = (s.dealer + 1) % n;
        if (v === 10) { E({ k: 'skip', p: first }); begin(nxt(first)); }
        else if (v === 11) { s.dir = -1; E({ k: 'rev', dir: -1 }); begin(s.dealer); }
        else if (v === 12) { draw(first, CFG.D2, '+2'); E({ k: 'skip', p: first }); begin(nxt(first)); }
        else if (v === 13) { s.turn = first; s.phase = 'col0'; s.tid++; E({ k: 'turn', p: first }); }
        else begin(first);
      },
      act(p, a) {
        if (!a || !(p >= 0 && p < n)) return false;
        const t = a.t, ph = s.phase;
        if (ph === 'end' || ph === 'done' || ph === 'idle') return false;
        if (t === 'call') {
          const h = s.hands[p].length;
          if (s.vul === p) { s.vul = -1; s.called[p] = true; E({ k: 'call', p, late: true }); return true; }
          if (!rules.strict && (h === 2 || h === 1) && !s.called[p]) { s.called[p] = true; E({ k: 'call', p }); return true; }
          return false;
        }
        if (t === 'catch') {
          if (s.vul !== a.v || a.v === p) return false;
          s.vul = -1; E({ k: 'catch', by: p, v: a.v });
          draw(a.v, rules.pen || CFG.CATCH_DRAW, 'catch');
          return true;
        }
        if (t === 'jump') {
          if (!rules.jump || p === s.turn || !(ph === 'play' || ph === 'drawn')) return false;
          const id = a.id, tp = top();
          if (!s.hands[p].includes(id) || CV(id) >= 13 || CV(tp) >= 13 || CC(id) !== CC(tp) || CV(id) !== CV(tp)) return false;
          if (s.pend > 0 && CV(id) !== 12) return false;
          if (rules.s70 && CV(id) === 7 && s.hands[p].length > 1 && !(a.tgt >= 0 && a.tgt < n && a.tgt !== p)) return false;
          closeWin(); E({ k: 'jump', p });
          s.turn = p; s.drawn = -1;
          play(p, id, -1, rules.s70 && CV(id) === 7 && s.hands[p].length > 1 ? a.tgt : -1, null);
          return true;
        }
        if (p !== s.turn) return false;
        if (t === 'play') {
          const id = a.id;
          if (!(ph === 'play' || ph === 'drawn') || !s.hands[p].includes(id)) return false;
          if (ph === 'drawn' && id !== s.drawn) return false;
          if (!legal(p, id)) return false;
          if (CV(id) >= 13 && !validCol(a.col)) return false;
          const more = ph === 'play' && s.pend === 0 && a.more && a.more.length ? a.more : null;
          if (!okMore(p, id, more)) return false;
          const swap = rules.s70 && CV(id) === 7 && s.hands[p].length > 1 + (more ? more.length : 0);
          if (swap && !(a.tgt >= 0 && a.tgt < n && a.tgt !== p)) return false;
          closeWin(); play(p, id, a.col, swap ? a.tgt : -1, more);
          return true;
        }
        if (t === 'draw') { if (ph !== 'play') return false; closeWin(); drawAct(p); return true; }
        if (t === 'keep') { if (ph !== 'drawn' || rules.force) return false; closeWin(); begin(nxt(p)); return true; }
        if (t === 'chal') { if (ph !== 'chal') return false; closeWin(); challenge(p, !!a.y); return true; }
        if (t === 'col') {
          if (ph !== 'col0' || !validCol(a.col)) return false;
          closeWin(); s.col = a.col; s.phase = 'play'; s.tid++; E({ k: 'col', p, col: a.col });
          return true;
        }
        return false;
      },
      need() { return s.phase === 'end' || s.phase === 'done' ? { k: s.phase, p: -1 } : { k: s.phase, p: s.turn }; },
      view(p) {
        return {
          n, me: p, hand: (s.hands[p] || []).slice(), counts: s.hands.map(h => h.length), top: s.disc.length ? top() : -1,
          col: s.col, dir: s.dir, turn: s.turn, phase: s.phase, pend: s.pend, pendT: s.pendT, drawn: s.turn === p ? s.drawn : -1,
          deck: s.deck.length, scores: s.scores.slice(), called: s.called.slice(), vul: s.vul, dealer: s.dealer,
          round: s.round, w4: s.w4 ? s.w4.p : -1, w4c: s.w4 ? s.w4.prev : -1, tid: s.tid, winner: s.winner, champ: s.champ,
          rules, target: o.target
        };
      }
    };
    return g;
  }

  function filt(e, me) {
    switch (e.k) {
      case 'deal': return { k: 'deal', dealer: e.dealer, counts: e.hands.map(h => h.length), mine: e.hands[me] || [] };
      case 'draw': return { k: 'draw', p: e.p, c: e.ids.length, ids: e.p === me ? e.ids : null, why: e.why, col: e.col };
      case 'chal': return { k: 'chal', by: e.by, v: e.v, guilty: e.guilty, hand: e.by === me ? e.hand : null };
      case 'swap': case 'rot': return { k: e.k, a: e.a, b: e.b, dir: e.dir, counts: e.hands.map(h => h.length), mine: e.hands[me] || [] };
      default: return e;
    }
  }

  const AIP = {
    Easy: { noise: 70, callP: .7, lateP: .3, catchP: .4, catchT: [1500, 3200], bluff: 0, chal: .18, stack: .8, hold: false, think: [900, 1600], jumpP: .15, jumpT: [1300, 2200], smart: false },
    Normal: { noise: 7, callP: .9, lateP: .55, catchP: .7, catchT: [1000, 2100], bluff: .12, chal: .8, stack: 1, hold: false, think: [700, 1300], jumpP: .45, jumpT: [900, 1700], smart: false },
    Hard: { noise: 2, callP: .97, lateP: .85, catchP: .9, catchT: [650, 1350], bluff: .3, chal: .7, stack: 1, hold: true, think: [550, 1050], jumpP: .75, jumpT: [650, 1200], smart: true },
    Expert: { noise: 0, callP: 1, lateP: 1, catchP: 1, catchT: [380, 820], bluff: .35, chal: .52, stack: 1, hold: true, think: [480, 900], jumpP: .95, jumpT: [420, 800], smart: true }
  };

  function aiMove(g, p, P, lacks, R) {
    const s = g.s, n = s.n, h = s.hands[p], rules = g.rules;
    const nx = k => ((p + s.dir * k) % n + n) % n;
    const cnt = s.hands.map(x => x.length), next = nx(1), prev = nx(-1);
    const lk = (lacks && lacks[next]) || [0, 0, 0, 0];
    const unk = [0, 0, 0, 0];
    if (P.smart) {
      const seen = new Uint8Array(DECK.length);
      for (const id of h) seen[id] = 1;
      for (const id of s.disc) seen[id] = 1;
      for (let id = 0; id < DECK.length; id++) if (!seen[id] && CC(id) < 4) unk[CC(id)]++;
    }
    const colScore = (cards, c) => cards.reduce((a, id) => a + (CC(id) === c ? 3 + PTS(id) * .08 : 0), 0);
    const bestCol = cards => {
      let b = 0, bv = -1e9;
      for (let c = 0; c < 4; c++) {
        let v = colScore(cards, c) + lk[c] * (P.smart ? 6 : 2.5) + R() * (P.noise * .1 + .3);
        if (P.smart) { v -= unk[c] * .18; for (let q = 0; q < n; q++) if (q !== p && q !== next && lacks && lacks[q] && lacks[q][c]) v += 1.5; }
        if (v > bv) { bv = v; b = c; }
      }
      return b;
    };
    if (s.phase === 'col0') return { t: 'col', col: bestCol(h) };
    if (s.phase === 'chal') {
      const w = s.w4, pc = w.prev;
      if (P.chal < .3) return { t: 'chal', y: R() < P.chal };
      const known = h.filter(id => CC(id) === pc).length + s.disc.filter(id => CC(id) === pc).length;
      const unknown = Math.max(1, DECK.length - h.length - s.disc.length);
      let pr = 1 - Math.pow(1 - Math.max(0, 25 - known) / unknown, cnt[w.p]);
      if (lacks && lacks[w.p] && lacks[w.p][pc]) pr *= .35;
      return { t: 'chal', y: pr + (R() - .5) * P.noise * .02 > P.chal };
    }
    const tp = { pend: s.pend, pendT: s.pendT, col: s.col, top: s.disc[s.disc.length - 1], rules };
    const hasColNow = h.some(id => CC(id) === s.col);
    const lead = Math.max(...s.scores);
    const threat = q => cnt[q] <= 1 ? 4 : cnt[q] <= 2 ? 3 : cnt[q] <= 3 ? 1.5 : (g.target && lead > 0 && s.scores[q] === lead && lead > g.target * .6) ? 1 : 0;
    const tn = threat(next), tpv = threat(prev);
    let cand = (s.phase === 'drawn' ? [s.drawn] : h).filter(id => canPlay(tp, h, id));
    if (rules.chal && !(s.phase === 'drawn' && rules.force)) cand = cand.filter(id => CV(id) !== 14 || !hasColNow || (R() < P.bluff && (tn >= 1.5 || h.length <= 3)));
    const target7 = () => { let b = -1; for (let q = 0; q < n; q++) if (q !== p && (b < 0 || cnt[q] < cnt[b] || (cnt[q] === cnt[b] && s.scores[q] > s.scores[b]))) b = q; return b; };
    const mk = id => {
      const a = { t: 'play', id };
      let rest = h.filter(x => x !== id);
      if (rules.multi && s.phase === 'play' && !s.pend && CV(id) <= 9) {
        const tw = twins(h, id);
        if (tw.length) {
          const ord = tw.slice().sort((x, y) => (colScore(rest, CC(y)) + lk[CC(y)] * 5) - (colScore(rest, CC(x)) + lk[CC(x)] * 5));
          a.more = ord.reverse();
          rest = rest.filter(x => !a.more.includes(x));
        }
      }
      if (CV(id) >= 13) a.col = bestCol(rest);
      if (rules.s70 && CV(id) === 7 && rest.length) a.tgt = target7();
      return a;
    };
    if (!cand.length) return s.phase === 'drawn' ? { t: 'keep' } : { t: 'draw' };
    if (s.phase === 'drawn') {
      const id = cand[0];
      if (!rules.force && CV(id) >= 13 && h.length > 4 && P.hold && tn < 1.5) return { t: 'keep' };
      return mk(id);
    }
    if (s.pend > 0) return R() < P.stack ? mk(cand.sort((a, b) => CV(a) - CV(b))[0]) : { t: 'draw' };
    if (P.hold && !P.smart && cand.every(id => CV(id) >= 13) && h.length >= 5 && tn < 1.5 && R() < .5) return { t: 'draw' };
    let best = cand[0], bv = -1e9;
    for (const id of cand) {
      const v = CV(id), c = CC(id), rest = h.filter(x => x !== id);
      const tw = rules.multi && v <= 9 ? twins(h, id) : [];
      const col = v >= 13 ? bestCol(rest) : c;
      let sc = PTS(id) * .5 + colScore(rest, col) * 1.2 + lk[col] * 5;
      if (v >= 13) sc -= rest.length > 2 ? 30 + (v === 14 ? 6 : 0) : -10;
      if (v === 10 || v === 12 || v === 14 || (v === 11 && n === 2)) sc += 4 + tn * 14;
      if (v === 12 || v === 14) sc += tn * 6;
      if (v === 11 && n > 2) sc += (tn - tpv) * 10;
      if (rules.s70 && v === 7 && rest.length) sc += (rest.length - Math.min(...cnt.filter((_, q) => q !== p))) * 6;
      if (rules.s70 && v === 0) sc += (rest.length - cnt[prev]) * 4;
      if (v === 14 && rules.chal && hasColNow) sc -= 12;
      sc += tw.length * 9;
      if (P.smart) {
        if (v < 13 && unk[col] < 8) sc += (8 - unk[col]) * 1.2;
        if ((v === 10 || v === 12) && tn < 1.5 && rest.length > 3) sc -= 7;
        if (h.length === 2 && rest.length === 1 && CV(rest[0]) >= 13) sc += 25;
        if (h.length === 2 && v >= 13 && rest.length === 1 && CV(rest[0]) < 13 && canPlay({ pend: 0, col, top: id, rules }, rest, rest[0])) sc += 12;
        if (tn >= 3 && v < 10 && !lk[col]) sc -= 8;
        if (cnt[next] === 1 && (v === 10 || v === 12 || v === 14 || (v === 11 && n === 2))) sc += 40;
      }
      sc += R() * P.noise;
      if (sc > bv) { bv = sc; best = id; }
    }
    return mk(best);
  }

  function determinize(g, p, lacks, R) {
    const s = g.s, n = s.n, seen = new Uint8Array(DECK.length);
    for (const id of s.hands[p]) seen[id] = 1;
    for (const id of s.disc) seen[id] = 1;
    const pool = [];
    for (let id = 0; id < DECK.length; id++) if (!seen[id]) pool.push(id);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const hands = s.hands.map(h => h.slice());
    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      const need = s.hands[q].length, lk = lacks && lacks[q], got = [];
      for (let i = pool.length - 1; i >= 0 && got.length < need; i--) { const c = CC(pool[i]); if (lk && c < 4 && lk[c] && R() < .85) continue; got.push(pool[i]); pool.splice(i, 1); }
      while (got.length < need && pool.length) got.push(pool.pop());
      hands[q] = got;
    }
    const g2 = Game({ n, rules: g.rules, target: 0, rnd: R });
    Object.assign(g2.s, { scores: Array(n).fill(0), dealer: s.dealer, round: s.round, deck: pool, disc: s.disc.slice(), hands, col: s.col, dir: s.dir, turn: s.turn, phase: s.phase, pend: s.pend, pendT: s.pendT, drawn: s.drawn, called: s.called.slice(), vul: -1, w4: s.w4 ? { ...s.w4 } : null, tid: s.tid, winner: -1, champ: -1 });
    return g2;
  }
  function fastMove(g2, q, R) {
    const s = g2.s, h = s.hands[q];
    const mc = () => { const c = [0, 0, 0, 0]; for (const id of h) if (CC(id) < 4) c[CC(id)]++; let b = 0; for (let k = 1; k < 4; k++) if (c[k] > c[b]) b = k; return b; };
    if (s.phase === 'chal') return { t: 'chal', y: false };
    if (s.phase === 'col0') return { t: 'col', col: mc() };
    if (s.phase === 'drawn') return { t: 'play', id: s.drawn, col: mc() };
    let best = -1, bw = -1, bv = -1;
    for (const id of h) {
      if (!g2.legal(q, id)) continue;
      const v = CV(id), w = v >= 13 ? 0 : 1 + (v >= 10 ? .5 : 0) + R() * .8;
      if (w > bv) { bv = w; best = id; }
    }
    if (best < 0) return { t: 'draw' };
    bw = best;
    return { t: 'play', id: bw, col: mc() };
  }
  function rollout(g2, p, R) {
    for (let k = 0; k < 400; k++) {
      const nd = g2.need();
      if (nd.k === 'end' || nd.k === 'done') return g2.s.winner === p ? 1 : 0;
      const q = nd.p, a = fastMove(g2, q, R);
      if (a.t === 'play' && g2.rules.s70 && CV(a.id) === 7) a.tgt = (q + 1) % g2.s.n;
      if (!g2.act(q, a) && !g2.act(q, { t: 'draw' }) && !g2.act(q, { t: 'keep' })) g2.act(q, { t: 'chal', y: false });
      if (g2.s.vul >= 0) g2.act(g2.s.vul, { t: 'call' });
      g2.take();
    }
    return .5;
  }
  function mcSearch(g, p, P, lacks, R) {
    const s = g.s, base = aiMove(g, p, P, lacks, R);
    if (!(s.phase === 'play' || s.phase === 'drawn')) return { base, step() {}, best: () => base };
    const h = s.hands[p], tp = { pend: s.pend, pendT: s.pendT, col: s.col, top: s.disc[s.disc.length - 1], rules: g.rules };
    const pool = s.phase === 'drawn' ? [s.drawn] : h;
    const cands = [base], key = a => a.t + (a.id ?? '') + ':' + (a.col ?? '') + ':' + (a.more ? a.more.join('.') : '') + ':' + (a.tgt ?? '');
    const seenK = new Set([key(base)]);
    const add = a => { const k = key(a); if (!seenK.has(k)) { seenK.add(k); cands.push(a); } };
    for (const id of pool) {
      if (!canPlay(tp, h, id)) continue;
      if (g.rules.chal && CV(id) === 14 && h.some(x => CC(x) === s.col) && P.bluff < .2) continue;
      const a = { t: 'play', id };
      if (g.rules.s70 && CV(id) === 7 && h.length > 1) { let b = -1; for (let q = 0; q < s.n; q++) if (q !== p && (b < 0 || s.hands[q].length < s.hands[b].length)) b = q; a.tgt = b; }
      if (CV(id) >= 13) { for (let c = 0; c < 4; c++) add({ ...a, col: c }); } else add(a);
    }
    if (!(s.phase === 'drawn' && g.rules.force)) add(s.phase === 'drawn' ? { t: 'keep' } : { t: 'draw' });
    const tot = cands.map(() => 0), cnt = cands.map(() => 0);
    let i = 0;
    return {
      base,
      step(ms) {
        if (cands.length < 2) return;
        const t0 = performance.now();
        while (performance.now() - t0 < ms && i < 20000) {
          const ci = i % cands.length; i++;
          const g2 = determinize(g, p, lacks, R);
          if (!g2.act(p, cands[ci])) { tot[ci] -= 99; cnt[ci]++; continue; }
          g2.take();
          tot[ci] += rollout(g2, p, R); cnt[ci]++;
        }
      },
      best() {
        let bi = 0, bv = -1e9;
        cands.forEach((_, k) => { const v = cnt[k] ? tot[k] / cnt[k] + (k === 0 ? .02 : 0) : -1; if (v > bv) { bv = v; bi = k; } });
        return cands[bi];
      }
    };
  }
  function aiMoveMC(g, p, P, lacks, R, ms) { const S = mcSearch(g, p, P, lacks, R); S.step(ms); return S.best(); }
  function cpath(x, w, h, r) { x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, r); }
  function txt(x, s, size, fill, ow, shadow) {
    x.font = `900 ${size}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.save(); x.transform(1, 0, -.13, 1, 0, 0);
    x.lineJoin = 'round';
    const y = size * .05;
    if (shadow) { x.fillStyle = '#121214'; x.lineWidth = ow; x.strokeStyle = '#121214'; x.strokeText(s, size * .05, y + size * .06); x.fillText(s, size * .05, y + size * .06); }
    x.lineWidth = ow; x.strokeStyle = '#121214'; x.strokeText(s, 0, y);
    x.fillStyle = fill; x.fillText(s, 0, y);
    x.restore();
  }
  function skipIco(x, s, fill) {
    const r = s * .3, t = s * .11;
    x.beginPath(); x.arc(0, 0, r, 0, TAU); x.moveTo(-r * .68, -r * .68); x.lineTo(r * .68, r * .68);
    x.lineCap = 'round'; x.lineWidth = t + s * .08; x.strokeStyle = '#121214'; x.stroke();
    x.lineWidth = t; x.strokeStyle = fill; x.stroke();
  }
  function revIco(x, s, fill) {
    const L = s * .62, w = s * .15, hw = s * .2, hl = s * .24;
    x.beginPath();
    for (const a of [Math.PI / 4, Math.PI * 5 / 4]) {
      x.save(); x.rotate(a); x.translate(-s * .15, 0);
      x.moveTo(-w / 2, L / 2); x.lineTo(-w / 2, -L / 2 + hl); x.lineTo(-hw, -L / 2 + hl); x.lineTo(0, -L / 2);
      x.lineTo(hw, -L / 2 + hl); x.lineTo(w / 2, -L / 2 + hl); x.lineTo(w / 2, L / 2); x.closePath();
      x.restore();
    }
    x.lineJoin = 'round'; x.lineWidth = s * .08; x.strokeStyle = '#121214'; x.stroke();
    x.fillStyle = fill; x.fill();
  }
  function minis(x, s, cols, offs, rot) {
    const w = s * .34, h = s * .5;
    cols.forEach((c, i) => {
      x.save(); x.translate(offs[i][0] * s, offs[i][1] * s); x.rotate(rot[i]);
      cpath(x, w, h, w * .14); x.fillStyle = '#fff'; x.fill(); x.lineWidth = s * .035; x.strokeStyle = '#121214'; x.stroke();
      cpath(x, w * .78, h * .82, w * .1); x.fillStyle = HEX[c]; x.fill();
      x.restore();
    });
  }
  function wildOval(x, rx, ry, edge) {
    x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.clip();
    const q = [[0, -1, -1], [3, 1, -1], [1, -1, 1], [2, 1, 1]];
    for (const [c, sx, sy] of q) { x.fillStyle = HEX[c]; x.fillRect(sx < 0 ? -rx : 0, sy < 0 ? -ry : 0, rx, ry); }
    x.restore();
    if (edge) { x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.lineWidth = edge; x.strokeStyle = '#fff'; x.stroke(); }
  }
  function sym(x, v, c, s, big) {
    const fill = big ? (c < 4 ? HEX[c] : '#fff') : '#fff';
    if (v < 10) {
      txt(x, String(v), s, fill, s * (big ? .11 : .2), big);
      if (v === 6 || v === 9) {
        x.beginPath(); x.roundRect(-s * .2 - s * .06, s * .42, s * .36, s * .07, s * .03);
        x.lineWidth = s * (big ? .05 : .1); x.strokeStyle = '#121214'; x.stroke(); x.fillStyle = fill; x.fill();
      }
    } else if (v === 10) skipIco(x, s * (big ? 1.25 : 1.6), fill);
    else if (v === 11) revIco(x, s * (big ? 1.2 : 1.5), fill);
    else if (v === 12) { if (big) minis(x, s * 1.05, [c, c], [[-.11, -.08], [.11, .1]], [-.25, -.25]); else txt(x, '+2', s * .92, '#fff', s * .2); }
    else if (v === 13) { if (!big) { x.save(); x.rotate(.52); wildOval(x, s * .3, s * .46, s * .06); x.restore(); } }
    else if (v === 14) { if (big) minis(x, s * .95, [3, 2, 0, 1], [[-.2, -.04], [-.07, -.15], [.07, .13], [.2, .02]], [-.3, -.3, -.3, -.3]); else txt(x, '+4', s * .92, '#fff', s * .2); }
  }
  function star(x, r1, r2, k) {
    x.beginPath();
    for (let i = 0; i < k * 2; i++) { const a = i * Math.PI / k - Math.PI / 2, r = i % 2 ? r2 : r1; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath();
  }
  function drawCard(x, id, w, h) {
    const r = w * .11, m = w * .068, iw = w - 2 * m, ih = h - 2 * m;
    x.fillStyle = '#fff'; cpath(x, w, h, r); x.fill();
    x.lineWidth = Math.max(.6, w * .012); x.strokeStyle = 'rgba(0,0,0,.3)'; x.stroke();
    const c = id < 0 ? 5 : CC(id), v = id < 0 ? -1 : CV(id);
    cpath(x, iw, ih, r * .7); x.fillStyle = c < 4 ? HEX[c] : '#17171b'; x.fill();
    const g = x.createLinearGradient(0, -ih / 2, 0, ih / 2);
    g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.42, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.2)');
    x.fillStyle = g; x.fill();
    const rx = w * .32, ry = h * .43;
    if (id < 0) {
      const rg = x.createRadialGradient(0, 0, 0, 0, 0, h * .6); rg.addColorStop(0, 'rgba(255,255,255,.1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = rg; cpath(x, iw, ih, r * .7); x.fill();
      x.save(); x.rotate(.52);
      x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fillStyle = HEX[0]; x.fill();
      x.lineWidth = w * .03; x.strokeStyle = '#fff'; x.stroke();
      x.beginPath(); x.ellipse(0, 0, rx * .8, ry * .86, 0, 0, TAU); x.lineWidth = w * .012; x.strokeStyle = 'rgba(0,0,0,.35)'; x.stroke();
      x.restore();
      x.save(); x.rotate(-.12);
      star(x, w * .27, w * .085, 4); x.lineJoin = 'round'; x.lineWidth = w * .05; x.strokeStyle = '#121214'; x.stroke(); x.fillStyle = HEX[1]; x.fill();
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; x.beginPath(); x.arc(Math.cos(a) * w * .16, Math.sin(a) * w * .16, w * .045, 0, TAU); x.fillStyle = HEX[[3, 2, 1, 0][i]]; x.fill(); x.lineWidth = w * .02; x.stroke(); }
      x.restore();
      return;
    }
    x.save(); x.rotate(.52);
    if (c === 4) wildOval(x, rx, ry, w * .03);
    else { x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, TAU); x.fillStyle = '#fff'; x.fill(); }
    x.restore();
    sym(x, v, c, h * .48, true);
    for (const k of [0, 1]) {
      x.save(); if (k) x.rotate(Math.PI); x.translate(-w * .3, -h * .345);
      sym(x, v, c, h * .17, false);
      x.restore();
    }
  }

  const AV = [
    { bg: '#ffcf4a', skin: '#f3c39b', hair: '#3b2416', shirt: '#e8282b', h: 0 },
    { bg: '#7ad3f7', skin: '#c98b5f', hair: '#1c1310', shirt: '#2fa84a', h: 1 },
    { bg: '#ff9db0', skin: '#f6d2b5', hair: '#d9822b', shirt: '#1d6fc8', h: 2 },
    { bg: '#b9a5ff', skin: '#8d5a3b', hair: '#121212', shirt: '#fcc916', h: 3 },
    { bg: '#8ee09a', skin: '#efc19d', hair: '#7a4a24', shirt: '#7a3fd0', h: 1 },
    { bg: '#ffb27a', skin: '#d9a07a', hair: '#2a2a33', shirt: '#14a3a3', h: 0 }
  ];
  function avatar(x, cx, cy, r, i) {
    const a = AV[i % AV.length];
    x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = a.bg; x.fill(); x.clip();
    x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(cx - r * .3, cy - r * .4, r * .6, 0, TAU); x.fill();
    x.fillStyle = a.shirt; x.beginPath(); x.ellipse(cx, cy + r * 1.02, r * .78, r * .52, 0, 0, TAU); x.fill();
    if (a.h === 1 || a.h === 2) { x.fillStyle = a.hair; x.beginPath(); x.ellipse(cx, cy + r * .12, r * .55, r * .62, 0, 0, TAU); x.fill(); }
    x.fillStyle = a.skin; x.beginPath(); x.arc(cx, cy + r * .02, r * .42, 0, TAU); x.fill();
    x.fillStyle = a.hair; x.beginPath();
    if (a.h === 0) { x.arc(cx, cy - r * .06, r * .45, Math.PI * 1.02, Math.PI * 1.98); x.fill(); }
    else if (a.h === 1) { x.arc(cx, cy - r * .1, r * .44, Math.PI * 1.08, Math.PI * 1.92); x.fill(); }
    else if (a.h === 2) { x.arc(cx, cy - r * .05, r * .46, Math.PI, TAU); x.fill(); x.beginPath(); x.arc(cx + r * .3, cy - r * .42, r * .16, 0, TAU); x.fill(); }
    else { for (let k = -2; k <= 2; k++) { x.beginPath(); x.arc(cx + k * r * .17, cy - r * .36, r * .15, 0, TAU); x.fill(); } }
    x.fillStyle = '#1b1b1f';
    x.beginPath(); x.arc(cx - r * .15, cy + r * .02, r * .055, 0, TAU); x.arc(cx + r * .15, cy + r * .02, r * .055, 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,110,110,.45)';
    x.beginPath(); x.arc(cx - r * .26, cy + r * .14, r * .07, 0, TAU); x.arc(cx + r * .26, cy + r * .14, r * .07, 0, TAU); x.fill();
    x.beginPath(); x.arc(cx, cy + r * .1, r * .15, .2 * Math.PI, .8 * Math.PI); x.lineWidth = r * .065; x.lineCap = 'round'; x.strokeStyle = '#1b1b1f'; x.stroke();
    x.restore();
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.lineWidth = Math.max(2, r * .1); x.strokeStyle = '#fff'; x.stroke();
  }

  const ICON_MENU = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
  const CPU_NAMES = ['Rosa', 'Theo', 'Kai', 'Mila', 'Otto', 'Jade'];
  const RULES = `<h3>How to play</h3><div class="lc-rules">
<p><b>Goal:</b> be the first to play every card in your hand. Each player starts with 7 cards.</p>
<p><b>On your turn</b> play one card that matches the top card by <b>colour</b>, <b>number</b> or <b>symbol</b>, or play a Wild. If you can't (or don't want to), tap the deck to draw one card. If the drawn card fits you may play it straight away, otherwise your turn ends.</p>
<p><b>Skip</b> - next player misses a turn. <b>Reverse</b> - play changes direction (with 2 players it works like Skip). <b>Draw Two</b> - next player draws 2 and misses a turn.</p>
<p><b>Wild</b> - choose the next colour. <b>Wild Draw Four</b> - choose the colour, next player draws 4 and misses a turn. With <b>No bluffing</b> on you may only play it when you have no card of the current colour. With <b>Challenges</b> on the next player may challenge: if you were bluffing you draw 4 instead; if not, the challenger draws 6.</p>
<p><b>Stacking</b> - answer a Draw Two with a Draw Two (and +4 with +4, or mixed if that rule is on). The first player who can't stack draws the whole pile.</p>
<p><b>UNO!</b> Tap the button right after you play your second-to-last card. If someone catches you before the next player acts, you draw the penalty.</p>
<p><b>Jump-in</b> (house rule) - if you hold the exact same card as the top card (same colour and symbol), play it out of turn. Play continues from you.</p>
<p><b>Same numbers</b> (house rule) - play several cards with the same number at once, like green 6 + red 6. The last one sets the colour.</p>
<p><b>Scoring:</b> the round winner scores the cards left in everyone else's hands - numbers at face value, Skip/Reverse/Draw Two 20, Wilds 50. First to 500 wins the game.</p>
<p><b>Keys:</b> <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick a card, <kbd>Enter</kbd> play, <kbd>D</kbd> draw, <kbd>K</kbd> keep, <kbd>L</kbd> UNO, <kbd>C</kbd> catch, <kbd>J</kbd> jump in, <kbd>1</kbd>-<kbd>4</kbd> colour.</p></div>`;

  Ameplay.register({
    id: 'last-card',
    title: 'Last Card',
    category: 'Board',
    tint: '#e8282b',
    blurb: 'Match colour or number, shout UNO, and empty your hand first. Dozens of house rules.',
    help: 'Tap a glowing card to play · tap the deck to draw · <kbd>L</kbd> UNO! · <kbd>J</kbd> jump in · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd> · <kbd>D</kbd> draw · house rules in the menu',
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="15" width="26" height="38" rx="4" transform="rotate(-12 22 34)"/><rect x="28" y="11" width="26" height="38" rx="4" transform="rotate(10 41 30)"/><ellipse cx="41" cy="30" rx="7" ry="12" transform="rotate(30 41 30)"/></svg>',
    _t: { Game, aiMove, aiMoveMC, mcSearch, determinize, rollout, AIP, DECK, CC, CV, PTS, canPlay, filt, CFG, drawCard, RULE_DEF, twins },
    css: `
.gm-last-card{gap:0}
.gm-last-card [hidden]{display:none!important}
.gm-last-card .lc-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(10,40,25,.28);touch-action:none;background:#145c32}
.gm-last-card .lc-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-last-card .lc-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff}
.gm-last-card .lc-ui button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-last-card .lc-ico{position:absolute;left:10px;top:10px;width:46px;height:46px;border-radius:15px;border:2px solid rgba(255,255,255,.22);background:rgba(0,0,0,.28);color:#fff;display:grid;place-items:center;padding:0}
.gm-last-card .lc-last{position:absolute;white-space:nowrap;min-width:128px;height:56px;padding:0 14px;border-radius:28px;border:3px solid #fff;background:linear-gradient(#ff5545,#c71b10);color:#ffe14a;font:900 19px var(--sans);font-style:italic;letter-spacing:.3px;text-shadow:0 2px 0 #5a0b05;box-shadow:0 5px 0 #7d1209,0 10px 18px rgba(0,0,0,.35);transform:translate(-50%,-50%)}
.gm-last-card .lc-port .lc-last{min-width:0;height:50px;font-size:16px;padding:0 12px}
.gm-last-card .lc-last:disabled{filter:grayscale(.75) brightness(.75);opacity:.75;cursor:default}
.gm-last-card .lc-last.hot{animation:lc-pulse .55s infinite alternate}
.gm-last-card .lc-last:active:not(:disabled){transform:translate(-50%,-46%)}
@keyframes lc-pulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.09)}}
@keyframes lc-pop{from{transform:translate(-50%,-50%) scale(.6);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
.gm-last-card .lc-keep{position:absolute;min-width:96px;height:48px;border-radius:24px;border:3px solid #fff;background:linear-gradient(#3d4a6b,#232c45);color:#fff;font:900 16px var(--sans);box-shadow:0 4px 0 #11172a;transform:translate(-50%,-50%)}
.gm-last-card .lc-catch{position:absolute;min-width:84px;height:46px;padding:0 12px;border-radius:23px;border:3px solid #121214;background:#fcc916;color:#121214;font:900 16px var(--sans);font-style:italic;box-shadow:0 4px 0 #121214;transform:translate(-50%,-50%);animation:lc-pulse .45s infinite alternate}
.gm-last-card .lc-net{position:absolute;right:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.32);font:800 11px var(--sans)}
.gm-last-card .lc-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-last-card .lc-net.bad i{background:#ff5b4b}
.gm-last-card .lc-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;pointer-events:auto;background:rgba(3,16,9,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-last-card .lc-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-last-card .lc-pane.solid{background:radial-gradient(circle at 50% 38%,var(--lc-f1,#25784a),var(--lc-f2,#0b3720));-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-last-card .lc-box{width:100%;max-width:400px;margin:auto;background:linear-gradient(#26355a,#141c33);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:lc-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes lc-in{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.gm-last-card .lc-box h3{margin:2px 0 8px;font:900 22px var(--sans);letter-spacing:.2px}
.gm-last-card .lc-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.gm-last-card .lc-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#fcc916!important;margin:0 0 2px!important}
.gm-last-card .lc-big{display:block;width:100%;min-height:54px;margin:9px 0;border:0;border-radius:17px;color:#fff;font:900 20px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px}
.gm-last-card .lc-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
.gm-last-card .lc-big.last{outline:3px solid #fff;outline-offset:2px}
.gm-last-card .red{background:linear-gradient(#ff5d4d,#cf2117)}
.gm-last-card .blue{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-last-card .green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-last-card .yellow{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
.gm-last-card .lc-sm{min-height:44px;padding:0 14px;border-radius:14px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.gm-last-card .lc-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-last-card .lc-opt{display:flex;align-items:center;gap:10px;margin:8px 0;text-align:left}
.gm-last-card .lc-opt>span{flex:0 0 34%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.85)}
.gm-last-card .lc-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
.gm-last-card .lc-box.wide{max-width:560px}
.gm-last-card .lc-box.wide .lc-opt{margin:5px 0}
.gm-last-card .lc-box.wide .lc-opt>span{flex-basis:52%}
.gm-last-card .lc-box.wide .lc-seg button{min-height:36px;font-size:13px}
.gm-last-card .lc-sec{margin:14px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:#fcc916!important}
.gm-last-card .lc-tmr{font-variant-numeric:tabular-nums}
.gm-last-card .lc-seg{flex:1;display:flex;gap:5px}
.gm-last-card .lc-seg button{flex:1;min-height:44px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 14px var(--sans);padding:0 4px}
.gm-last-card .lc-seg button.on{background:#fcc916;border-color:#fff;color:#1b1b1f}
.gm-last-card .lc-title{width:100%;max-width:380px;text-align:center;margin-top:auto}
.gm-last-card .lc-logo{font:900 54px/0.92 var(--sans);font-style:italic;letter-spacing:1px;color:#fff;-webkit-text-stroke:2.5px #121214;paint-order:stroke fill;text-shadow:0 5px 0 #121214,0 10px 22px rgba(0,0,0,.4);transform:rotate(-5deg);margin:0 0 6px}
.gm-last-card .lc-logo b{color:#fcc916;font-weight:900}
.gm-last-card .lc-tag{font:800 13px var(--sans);color:rgba(255,255,255,.85);margin:6px 0 8px;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-last-card .lc-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0 6px}
.gm-last-card .lc-cols button{height:74px;border-radius:18px;border:4px solid #fff;font:900 17px var(--sans);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.3);box-shadow:inset 0 -6px 0 rgba(0,0,0,.2),0 6px 14px rgba(0,0,0,.3)}
.gm-last-card .lc-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
.gm-last-card .lc-tbl td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-last-card .lc-tbl td:first-child{text-align:left}
.gm-last-card .lc-tbl tr.win td{color:#fcc916}
.gm-last-card .lc-tbl i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.gm-last-card .lc-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:3px}
.gm-last-card .lc-bar b{display:block;height:100%;background:#fcc916;border-radius:3px}
.gm-last-card .lc-rules{text-align:left;max-height:none}
.gm-last-card .lc-rules p{font:700 13px/1.45 var(--sans)!important}
.gm-last-card .lc-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.gm-last-card .lc-hand{display:flex;justify-content:center;flex-wrap:wrap;gap:3px;margin:6px 0}
.gm-last-card .lc-hand span{display:inline-block;min-width:26px;padding:4px 3px;border-radius:6px;border:2px solid #fff;font:900 12px var(--sans);color:#fff}
.gm-last-card .lc-who{width:62px;height:62px;border-radius:50%;margin:0 auto 6px;border:4px solid #fff}
`,
    mount(root, api) {
      const opt = Object.assign({ mode: 'cpu', cpus: 2, diff: 'Normal', target: CFG.TARGET, felt: 'blue', obots: 0 }, RULE_DEF, api.load() || {});
      if (opt.v !== 2) Object.assign(opt, RULE_DEF, { felt: 'blue', v: 2 });
      if (opt.mode !== 'cpu' && opt.mode !== 'online') opt.mode = 'cpu';
      if (!AIP[opt.diff]) opt.diff = 'Normal';
      const saveOpt = () => api.save(opt);
      const now = () => performance.now();
      const rnd = (a, b) => a + Math.random() * (b - a);
      const lerp = (a, b, t) => a + (b - a) * t;
      const ease = t => 1 - Math.pow(1 - t, 3);

      const wrap = document.createElement('div'); wrap.className = 'lc-wrap';
      const cv = document.createElement('canvas');
      const ui = document.createElement('div'); ui.className = 'lc-ui';
      ui.innerHTML = `<button class="lc-ico" data-u="menu" aria-label="Menu" hidden>${ICON_MENU}</button>
<button class="lc-keep" data-u="keep" hidden>Keep</button>
<button class="lc-last" data-u="last" disabled hidden>UNO!</button>
<button class="lc-catch" data-u="c1" hidden>Catch!</button><button class="lc-catch" data-u="c2" hidden>Catch!</button><button class="lc-catch" data-u="c3" hidden>Catch!</button>
<div class="lc-net" hidden><i></i><span>Online</span></div>
<div class="lc-pane" hidden></div>`;
      wrap.append(cv, ui); root.append(wrap);
      const ctx = cv.getContext('2d');
      const $u = s => ui.querySelector(s);
      const bMenu = $u('[data-u=menu]'), bKeep = $u('[data-u=keep]'), bLast = $u('[data-u=last]'), pane = $u('.lc-pane'), netEl = $u('.lc-net');
      const bCatch = [null, $u('[data-u=c1]'), $u('[data-u=c2]'), $u('[data-u=c3]')];

      let W = 960, H = 600, PORT = null, DPR = 1, L = null, SP = null, feltC = null, scene = 'title';
      const D = { n: 2, hand: [], counts: [0, 0], pile: [], deckN: 108, col: -1, dir: 1, turn: -1, scores: [0, 0], reveal: null, focus: -1, ringRot: 0, spin: 0 };
      const fly = [], fx = [], Q = [];
      let busy = 0, idleDone = true, paused = false, viewer = 0, drag = null, hover = -1;
      const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, cpu: [], human: [], names: [], av: [], diff: 'Normal', lacks: [], cpuTid: -1, lastV: null, awaiting: false, pids: [], players: [], submitted: false, hooked: false, best: false };

      let ac = null, master = null, noise = null;
      function audio() {
        if (api.muted) return null;
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
          const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      }
      function nz(t, dur, f, q, vol, f2) {
        const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
        s.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
      }
      function tn(t, dur, type, f0, f1, vol) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
      }
      function sfx(k) {
        if (!audio()) return;
        const t = ac.currentTime + .005;
        try {
          if (k === 'card') { nz(t, .08, 2600, .8, .45); nz(t, .05, 700, 1, .25); }
          else if (k === 'deal') nz(t, .05, 3400, 1.2, .25);
          else if (k === 'draw') nz(t, .14, 1500, .9, .3, 3800);
          else if (k === 'shuf') for (let i = 0; i < 12; i++) nz(t + i * .035, .05, 2200 + Math.random() * 1800, 1.1, .22);
          else if (k === 'call') [523, 659, 784, 1047].forEach((f, i) => tn(t + i * .065, .17, 'square', f, f, .055));
          else if (k === 'catch') { tn(t, .22, 'sawtooth', 330, 140, .07); tn(t + .14, .3, 'square', 240, 90, .055); }
          else if (k === 'skip') { tn(t, .1, 'square', 440, 300, .05); tn(t + .1, .14, 'square', 300, 180, .05); }
          else if (k === 'rev') { tn(t, .16, 'triangle', 300, 900, .08); tn(t + .16, .16, 'triangle', 900, 300, .08); nz(t, .3, 600, .7, .12, 3000); }
          else if (k === 'wild') [392, 523, 659, 880].forEach((f, i) => tn(t + i * .055, .25, 'triangle', f, f * 1.01, .07));
          else if (k === 'plus') { tn(t, .22, 'triangle', 240, 110, .11); nz(t, .1, 300, .8, .2); }
          else if (k === 'turn') { tn(t, .08, 'sine', 880, 880, .05); tn(t + .08, .12, 'sine', 1320, 1320, .045); }
          else if (k === 'bad') tn(t, .12, 'square', 170, 120, .04);
          else if (k === 'tap') tn(t, .05, 'sine', 600, 600, .04);
          else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * .09, .3, 'triangle', f, f, .08)); tn(t + .5, .7, 'sine', 1047, 1047, .05); }
          else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * .14, .3, 'triangle', f, f * .98, .07));
          else if (k === 'chal') { tn(t, .12, 'square', 660, 660, .05); tn(t + .14, .2, 'square', 880, 880, .05); }
        } catch (e) {}
      }

      function sprites() {
        const cw = L.cw, ch = L.ch, k = DPR * 1.25, pad = Math.ceil(cw * .14), cache = new Map();
        const mk = id => {
          const c = document.createElement('canvas');
          c.width = Math.ceil((cw + pad * 2) * k); c.height = Math.ceil((ch + pad * 2) * k);
          const x = c.getContext('2d'); x.scale(k, k); x.translate(cw / 2 + pad, ch / 2 + pad);
          x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = cw * .09; x.shadowOffsetY = cw * .045;
          x.fillStyle = '#fff'; cpath(x, cw, ch, cw * .11); x.fill();
          x.shadowColor = 'transparent';
          drawCard(x, id, cw, ch);
          return c;
        };
        SP = { pad, get(id) { const key = id < 0 ? -1 : CC(id) * 16 + CV(id); let c = cache.get(key); if (!c) { c = mk(id); cache.set(key, c); } return c; } };
      }
      function felt() {
        const c = document.createElement('canvas'); c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
        const x = c.getContext('2d'); x.scale(DPR, DPR);
        const [a, b, e] = { blue: ['#3487cf', '#1b5597', '#0a2650'], green: ['#33a35b', '#1c6e3c', '#0a3a1f'], red: ['#d0473f', '#962722', '#4a0e0c'], purple: ['#7d58c9', '#4f3591', '#24164a'] }[opt.felt] || ['#3487cf', '#1b5597', '#0a2650'];
        wrap.style.setProperty('--lc-f1', b); wrap.style.setProperty('--lc-f2', e);
        const g = x.createRadialGradient(W / 2, H * .45, 10, W / 2, H * .45, Math.max(W, H) * .78);
        g.addColorStop(0, a); g.addColorStop(.55, b); g.addColorStop(1, e);
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        const t = document.createElement('canvas'); t.width = t.height = 96;
        const tx = t.getContext('2d'), im = tx.createImageData(96, 96);
        for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 22; }
        tx.putImageData(im, 0, 0);
        x.fillStyle = x.createPattern(t, 'repeat'); x.fillRect(0, 0, W, H);
        x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 2;
        x.beginPath(); x.ellipse(W / 2, H * .46, W * .46, H * .4, 0, 0, TAU); x.stroke();
        feltC = c;
      }
      function layout() {
        const P = PORT, n = D.n;
        L = { cw: P ? 64 : 84, ch: P ? 96 : 126, av: P ? 23 : 32 };
        L.ring = P ? { x: 180, y: 282, r: 106 } : { x: 480, y: 262, r: 146 };
        L.deck = { x: L.ring.x - (P ? 50 : 66), y: L.ring.y };
        L.pile = { x: L.ring.x + (P ? 50 : 66), y: L.ring.y };
        L.status = { x: L.ring.x, y: L.ring.y + (P ? 74 : 96) };
        const SEATS = P ? { 2: [[180, 60]], 3: [[92, 66], [268, 66]], 4: [[58, 92], [180, 54], [302, 92]] }
          : { 2: [[480, 64]], 3: [[170, 100], [790, 100]], 4: [[78, 238], [480, 62], [882, 238]] };
        L.seat = [{ x: P ? 30 : 70, y: P ? 418 : 530 }].concat((SEATS[n] || SEATS[2]).map(([x, y]) => ({ x, y })));
        L.fan = L.seat.map((s, r) => {
          if (!r) return s;
          if (P) return { x: s.x, y: s.y + L.av + 50, ang: 0 };
          if (n === 4 && r !== 2) return { x: s.x, y: s.y + 88, ang: 0 };
          return { x: s.x + (s.x > W / 2 ? -100 : 100), y: s.y + 4, ang: 0 };
        });
        L.row = P ? 418 : 0;
        placeUI();
      }
      function fit(force) {
        const port = (root.clientWidth || 800) < 640;
        if (!force && port === PORT) return;
        PORT = port; W = port ? 360 : 960; H = port ? 620 : 600;
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        wrap.classList.toggle('lc-port', port);
        layout(); sprites(); felt();
        D.hand.forEach(e => { e.x = W / 2; e.y = H - 60; });
      }
      const pct = (el, x, y) => { el.style.left = (x / W * 100) + '%'; el.style.top = (y / H * 100) + '%'; };
      function placeUI() {
        if (!L) return;
        if (PORT) { bMenu.style.left = '8px'; bMenu.style.top = `calc(${L.row / H * 100}% - 23px)`; pct(bLast, 278, L.row); pct(bKeep, 112, L.row); }
        else { bMenu.style.left = '10px'; bMenu.style.top = '10px'; pct(bLast, 878, 538); pct(bKeep, 878, 468); }
        for (let r = 1; r < 4; r++) { const s = L.seat[r]; if (s) pct(bCatch[r], s.x, s.y + (PORT ? 6 : 10)); }
      }

      const rel = p => ((p - viewer) % D.n + D.n) % D.n;
      const seatXY = p => L.seat[rel(p)] || L.seat[0];
      const nm = p => {
        if (p < 0) return '';
        if (M.mode === 'pass') return M.names[p];
        if (p === viewer) return 'You';
        return M.names[p] || 'Player';
      };
      const poss = p => p === viewer && M.mode !== 'pass' ? 'Your' : nm(p) + '’s';
      const isCpu = p => !!M.cpu[p];
      const view = () => M.role === 'guest' ? M.lastV : M.eng ? M.eng.view(viewer) : null;
      const isIdle = () => !paused && !Q.length && now() >= busy && !fly.length;
      const handKey = id => CC(id) * 20 + CV(id);
      const sortHand = () => D.hand.sort((a, b) => handKey(a.id) - handKey(b.id) || a.id - b.id);
      function playable(V) {
        if (!V || V.turn !== viewer || !(V.phase === 'play' || V.phase === 'drawn')) return [];
        if (V.phase === 'drawn') return V.drawn >= 0 && canPlay(V, V.hand, V.drawn) ? [V.drawn] : [];
        return V.hand.filter(id => canPlay(V, V.hand, id));
      }
      const canAct = () => scene === 'game' && isIdle() && pane.hidden && !M.awaiting && (() => { const V = view(); return V && V.turn === viewer && (V.phase === 'play' || V.phase === 'drawn'); })();

      function handSlots(cnt) {
        const P = PORT, cw = L.cw, ch = L.ch;
        const avail = P ? W - 14 : 640, step0 = CFG.SLOT_MIN;
        const perRow = Math.max(1, Math.floor((avail - cw) / step0) + 1);
        const rows = Math.max(1, Math.ceil(cnt / perRow));
        const rowStep = rows > 2 ? (P ? 38 : 44) : (P ? 50 : 58);
        const bottom = H - (P ? 6 : 10) - ch / 2;
        const out = [];
        for (let i = 0; i < cnt; i++) {
          const row = Math.floor(i / perRow), inRow = Math.min(perRow, cnt - row * perRow), j = i - row * perRow;
          const step = inRow > 1 ? Math.min(cw * .8, (avail - cw) / (inRow - 1)) : 0;
          const off = j - (inRow - 1) / 2;
          out.push({ x: W / 2 + off * step, y: bottom - (rows - 1 - row) * rowStep + off * off * (P ? .5 : .8), r: off * (P ? .03 : .028) });
        }
        return out;
      }
      function handTop() { const s = handSlots(Math.max(1, D.hand.length)); return Math.min(...s.map(o => o.y)) - L.ch / 2; }
      function hitHand(x, y) {
        for (let i = D.hand.length - 1; i >= 0; i--) {
          const e = D.hand[i];
          if (e.ghost) continue;
          if (Math.abs(x - e.x) < L.cw / 2 && y > e.y - e.lift - L.ch / 2 && y < e.y + L.ch / 2) return e.id;
        }
        return -1;
      }
      const hitDeck = (x, y) => Math.abs(x - L.deck.x) < L.cw / 2 + 6 && Math.abs(y - L.deck.y) < L.ch / 2 + 6;
      const fanPos = p => { const f = L.fan[rel(p)] || L.fan[0]; return { x: f.x, y: f.y, r: 0, s: .42 }; };
      const anchor = (p, dy = 0) => rel(p) ? { x: seatXY(p).x, y: seatXY(p).y + L.av + 30 + dy } : { x: W / 2, y: (PORT ? L.row - 40 : H - 175) + dy };
      const jit = id => ({ id, dx: rnd(-7, 7), dy: rnd(-6, 6), r: rnd(-.38, .38) });

      const pop = (txt, x, y, col, big) => fx.push({ k: 'pop', txt, x, y, col: col || '#fff', t0: now(), dur: 1100, big });
      const bubble = (p, txt) => fx.push({ k: 'bub', p, txt, t0: now(), dur: 1700 });
      const ban = p => fx.push({ k: 'ban', p, t0: now(), dur: 900 });
      function burst(x, y, cols, k = 36, sp = 260) {
        for (let i = 0; i < k; i++) { const a = Math.random() * TAU, v = sp * (.35 + Math.random() * .65); fx.push({ k: 'pt', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, col: cols[i % cols.length], t0: now(), dur: 700 + Math.random() * 500, sz: 3 + Math.random() * 4 }); }
      }
      function confetti() {
        for (let i = 0; i < 110; i++) fx.push({ k: 'pt', x: Math.random() * W, y: -20 - Math.random() * 120, vx: rnd(-40, 40), vy: rnd(80, 220), col: HEX[i % 4], t0: now() + Math.random() * 500, dur: 2600, sz: 4 + Math.random() * 4, conf: true, rot: Math.random() * 6 });
      }

      function launch(o) { o.t0 = now() + (o.delay || 0); o.started = false; fly.push(o); return o; }
      function ghost(id) { const e = { id, x: L.deck.x, y: L.deck.y, r: 0, lift: 0, tx: L.deck.x, ty: L.deck.y, tr: 0, ghost: true }; D.hand.push(e); sortHand(); return e; }
      const handTo = e => () => ({ x: e.tx, y: e.ty, r: e.tr, s: 1 });

      function handle(f) {
        const sp = Q.length > 10 ? .45 : Q.length > 4 ? .75 : 1, T = CFG.T;
        switch (f.k) {
          case 'deal': {
            D.n = f.counts.length; layout();
            D.hand = []; D.counts = Array(D.n).fill(0); D.pile = []; D.deckN = DECK.length; D.col = -1; D.dir = 1; D.turn = -1; D.reveal = null; D.focus = -1;
            if (M.role === 'guest' && !pane.hidden && (pane.dataset.k === 'end' || pane.dataset.k === 'wait')) hidePane();
            const order = [];
            for (let k = 0; k < CFG.HAND; k++) for (let i = 1; i <= D.n; i++) order.push((f.dealer + i) % D.n);
            let mi = 0; const stag = T.deal * sp;
            sfx('shuf');
            order.forEach((p, j) => {
              const mine = p === viewer, id = mine ? f.mine[mi++] : -1;
              let e = null;
              launch({ id, from: { x: L.deck.x, y: L.deck.y, r: 0, s: 1 }, to: mine ? () => e ? { x: e.tx, y: e.ty, r: e.tr, s: 1 } : fanPos(p) : () => fanPos(p), delay: 250 + j * stag, dur: T.flyDur * sp, flip: mine, arc: 24,
                onStart: () => { D.deckN--; sfx('deal'); if (mine) e = ghost(id); },
                onEnd: () => { if (mine) { e.ghost = false; e.x = e.tx; e.y = e.ty; e.r = e.tr; } D.counts[p]++; } });
            });
            return 250 + order.length * stag + T.flyDur * sp;
          }
          case 'flip': {
            const j = jit(f.id); j.r *= .4; j.dx = j.dy = 0;
            launch({ id: f.id, from: { x: L.deck.x, y: L.deck.y, r: 0, s: 1 }, to: () => ({ x: L.pile.x, y: L.pile.y, r: j.r, s: 1 }), dur: 420 * sp, flip: true, arc: 30, onStart: () => { D.deckN--; sfx('card'); },
              onEnd: () => {
                if (f.back) { pop('Back in!', L.pile.x, L.pile.y - 70, '#fff'); launch({ id: f.id, from: { x: L.pile.x, y: L.pile.y, r: j.r, s: 1 }, to: () => ({ x: L.deck.x, y: L.deck.y, r: 0, s: 1 }), delay: 380, dur: 380, flip: true, arc: 30, onEnd: () => { D.deckN++; sfx('shuf'); } }); }
                else { D.pile = [j]; D.col = CV(f.id) === 13 ? -1 : CC(f.id); }
              } });
            return f.back ? 1300 * sp : 520 * sp;
          }
          case 'play': {
            const p = f.p, j = jit(f.id); let from;
            if (p === viewer) {
              const i = D.hand.findIndex(e => e.id === f.id);
              const e = i >= 0 ? D.hand.splice(i, 1)[0] : null;
              from = e ? { x: drag && drag.lift && drag.id === f.id ? drag.x : e.x, y: drag && drag.lift && drag.id === f.id ? drag.y : e.y - e.lift, r: e.r, s: 1 } : { x: W / 2, y: H - 60, r: 0, s: 1 };
              if (drag && drag.id === f.id) drag = null;
            } else { from = fanPos(p); D.counts[p] = Math.max(0, D.counts[p] - 1); }
            if (p === viewer) D.counts[p] = Math.max(0, D.counts[p] - 1);
            D.focus = -1;
            const v = CV(f.id);
            launch({ id: f.id, from, to: () => ({ x: L.pile.x + j.dx, y: L.pile.y + j.dy, r: j.r, s: 1 }), dur: T.fly * sp, flip: p !== viewer, arc: p === viewer ? 40 : 26,
              onEnd: () => {
                D.pile.push(j); if (D.pile.length > 9) D.pile.shift();
                D.col = f.col; sfx('card');
                if (v >= 13) { sfx('wild'); burst(L.pile.x, L.pile.y, v === 14 ? HEX : [HEX[f.col], '#fff', HEX[f.col]], 40); pop(v === 14 ? '+4' : CN[f.col] + '!', L.pile.x, L.pile.y - L.ch * .75, HEX[f.col], v === 14); }
                else if (v === 12) { sfx('plus'); pop('+2', L.pile.x, L.pile.y - L.ch * .75, HEX[f.col], true); }
              } });
            return T.fly * sp + 80;
          }
          case 'draw': {
            const p = f.p, mine = p === viewer;
            const an = anchor(p);
            if (f.why === 'catch') pop('Caught! +2', an.x, an.y, '#fcc916', true);
            else if (f.why !== 'draw') pop('+' + f.c, an.x, an.y, f.why === 'chal' ? '#ff6b5b' : '#fff', true);
            const gap = (f.c > 6 ? 90 : T.drawGap) * sp;
            for (let i = 0; i < f.c; i++) {
              const id = mine && f.ids ? f.ids[i] : -1; let e = null;
              launch({ id, from: { x: L.deck.x, y: L.deck.y, r: 0, s: 1 }, to: mine ? () => e ? { x: e.tx, y: e.ty, r: e.tr, s: 1 } : fanPos(p) : () => fanPos(p), delay: i * gap, dur: T.draw * sp, flip: mine, arc: 26,
                onStart: () => { D.deckN = Math.max(0, D.deckN - 1); sfx('draw'); if (mine) e = ghost(id); },
                onEnd: () => { if (mine && e) { e.ghost = false; e.x = e.tx; e.y = e.ty; e.r = e.tr; } D.counts[p]++; } });
            }
            return (f.c - 1) * gap + T.draw * sp + 40;
          }
          case 'shuf': {
            sfx('shuf');
            const keep = D.pile.slice(-1);
            D.pile.slice(0, -1).slice(-6).forEach((c, i) => launch({ id: -1, from: { x: L.pile.x + c.dx, y: L.pile.y + c.dy, r: c.r, s: 1 }, to: () => ({ x: L.deck.x, y: L.deck.y, r: 0, s: 1 }), delay: i * 50, dur: 320, arc: 20 }));
            D.pile = keep;
            api.timeout(() => { D.deckN = f.n; }, 600);
            pop('Reshuffle', L.deck.x, L.deck.y - L.ch * .7, '#fff');
            return 700 * sp;
          }
          case 'skip': ban(f.p); sfx('skip'); return 420 * sp;
          case 'rev': D.dir = f.dir; D.spin = 1; sfx('rev'); pop('Reverse!', L.ring.x, L.ring.y - L.ring.r - 6, '#fff', true); return 480 * sp;
          case 'col': D.col = f.col; sfx('wild'); burst(L.pile.x, L.pile.y, [HEX[f.col], '#fff'], 30); pop(CN[f.col] + '!', L.pile.x, L.pile.y - L.ch * .75, HEX[f.col], true); return 380 * sp;
          case 'call': bubble(f.p, 'UNO!'); sfx('call'); return 0;
          case 'jump': { const an = anchor(f.p, -10); pop('Jump-in!', an.x, an.y, '#fcc916', true); sfx('chal'); return 240 * sp; }
          case 'catch': sfx('catch'); pop(nm(f.by) + ' caught ' + (f.v === viewer && M.mode !== 'pass' ? 'you' : nm(f.v)) + '!', L.ring.x, L.ring.y - L.ring.r * .55, '#fcc916'); return 260 * sp;
          case 'chal': {
            sfx('chal');
            const an = anchor(f.by, -6); pop('Challenge!', an.x, an.y, '#fff', true);
            api.timeout(() => { pop(f.guilty ? 'Busted!' : 'Clean!', L.ring.x, L.ring.y - L.ring.r * .55, f.guilty ? '#5be27a' : '#ff6b5b', true); sfx(f.guilty ? 'call' : 'catch'); }, 550 * sp);
            if (f.hand) fx.push({ k: 'show', ids: f.hand, who: f.v, t0: now() + 300 * sp, dur: 1900 });
            return (f.hand ? 2100 : 1100) * sp;
          }
          case 'turn': D.turn = f.p; if (f.p === viewer && M.mode !== 'pass') sfx('turn'); return 0;
          case 'swap': case 'rot': {
            const pairs = f.k === 'swap' ? [[f.a, f.b], [f.b, f.a]] : [...Array(D.n).keys()].map(q => [q, ((q + f.dir) % D.n + D.n) % D.n]);
            pairs.forEach(([a, b], i) => { for (let k = 0; k < 4; k++) launch({ id: -1, from: a === viewer ? { x: W / 2 + (k - 2) * 20, y: H - 80, r: 0, s: .8 } : fanPos(a), to: () => b === viewer ? { x: W / 2 + (k - 2) * 20, y: H - 80, r: 0, s: .8 } : fanPos(b), delay: k * 60 + i * 30, dur: 480 * sp, arc: 50 }); });
            sfx('shuf'); pop(f.k === 'swap' ? 'Swap!' : 'Pass hands!', L.ring.x, L.ring.y - L.ring.r * .55, '#fff', true);
            const from = f.k === 'swap' ? (viewer === f.a ? f.b : f.a) : ((viewer - f.dir) % D.n + D.n) % D.n;
            api.timeout(() => {
              D.counts = f.counts.slice();
              if (f.mine) { const fp = rel(from) ? fanPos(from) : { x: W / 2, y: H - 80 }; D.hand = f.mine.map(id => ({ id, x: fp.x, y: fp.y, r: 0, lift: 0, tx: fp.x, ty: fp.y, tr: 0 })); sortHand(); }
            }, 700 * sp);
            return 900 * sp;
          }
          case 'end': {
            D.reveal = f.hands; D.scores = f.scores.slice(); D.turn = -1; D.endPts = f.pts;
            const me = f.w === viewer && M.mode !== 'pass';
            sfx(M.mode === 'pass' || me ? 'win' : 'lose');
            if (me || M.mode === 'pass') confetti();
            pop(M.mode !== 'pass' && f.w === viewer ? 'You win the round!' : nm(f.w) + ' wins the round!', L.ring.x, L.ring.y - L.ring.r * .55, '#fcc916', true);
            if (M.mode === 'cpu' || M.mode === 'online') api.score(f.scores[viewer]);
            return 1700;
          }
          default: return 0;
        }
      }
      function pump() {
        const t = now();
        while (!paused && Q.length && t >= busy) {
          const e = Q.shift(); idleDone = false;
          busy = t + (handle(M.role === 'guest' ? e : filt(e, viewer)) || 0);
        }
        if (!idleDone && isIdle()) { idleDone = true; onIdle(); }
      }

      function syncD(V, hard) {
        if (!V) return;
        if (hard) { D.hand = []; fly.length = 0; }
        const want = V.hand;
        D.hand = D.hand.filter(e => want.includes(e.id));
        D.hand.forEach(e => { e.ghost = false; });
        const sl = handSlots(want.length);
        for (const id of want) if (!D.hand.some(e => e.id === id)) { const s0 = sl[0] || { x: W / 2, y: H - 60, r: 0 }; D.hand.push({ id, x: hard ? s0.x : L.deck.x, y: hard ? s0.y : L.deck.y, r: 0, lift: 0, tx: s0.x, ty: s0.y, tr: 0 }); }
        sortHand();
        if (hard) handSlots(D.hand.length).forEach((s, i) => { const e = D.hand[i]; e.x = e.tx = s.x; e.y = e.ty = s.y; e.r = e.tr = s.r; });
        D.n = V.n; D.counts = V.counts.slice(); D.col = V.col; D.dir = V.dir; D.turn = V.turn; D.deckN = V.deck; D.scores = V.scores.slice();
        if (V.top >= 0 && (!D.pile.length || D.pile[D.pile.length - 1].id !== V.top)) { const j = jit(V.top); D.pile = [j]; }
        if (V.phase !== 'end' && V.phase !== 'done') D.reveal = null;
      }
      function onIdle() {
        const V = view();
        if (!V || scene !== 'game') return;
        syncD(V);
        refreshUI();
        if (V.phase === 'end' || V.phase === 'done') return showEnd();
        if (M.role === 'guest' || !M.eng) return;
        const nd = M.eng.need();
        armTimer();
        if (isCpu(nd.p)) return scheduleCpu(nd.p);
        if (M.mode === 'pass' && nd.p !== viewer && nd.p >= 0) {
          const tok = M.tok, tid = M.eng.s.tid;
          api.timeout(() => { if (tok === M.tok && M.eng.s.tid === tid && isIdle() && pane.hidden) gate(nd.p, false); }, CFG.T.pass);
        }
      }
      function cpuJumps(e) {
        if (!M.eng || !M.eng.rules.jump || CV(e.id) >= 13) return;
        const tok = M.tok, P = AIP[M.diff] || AIP.Normal, s = M.eng.s, at = s.disc.length;
        for (let q = 0; q < s.n; q++) {
          if (!isCpu(q) || q === e.p || Math.random() >= P.jumpP) continue;
          if (!s.hands[q].some(id => CC(id) === CC(e.id) && CV(id) === CV(e.id))) continue;
          api.timeout(() => {
            if (tok !== M.tok || !M.eng || paused || M.eng.s.disc.length !== at || M.eng.s.turn === q) return;
            const t = M.eng.s.disc[M.eng.s.disc.length - 1], id = M.eng.s.hands[q].find(x => CC(x) === CC(t) && CV(x) === CV(t));
            if (id == null) return;
            const a = { t: 'jump', id };
            if (M.eng.rules.s70 && CV(id) === 7) { let b = -1; for (let r = 0; r < s.n; r++) if (r !== q && (b < 0 || s.hands[r].length < s.hands[b].length)) b = r; a.tgt = b; }
            if (M.eng.act(q, a)) { M.cpuTid = -1; flush(); }
          }, rnd(P.jumpT[0], P.jumpT[1]));
        }
      }
      function flush() {
        if (!M.eng) return;
        const es = M.eng.take();
        if (!es.length) return;
        let lastPlay = null;
        for (const e of es) {
          track(e);
          Q.push(e);
          if (e.k === 'vul') onVul(e.p);
          if (e.k === 'play') lastPlay = e;
          if (e.k === 'end') lastPlay = null;
        }
        if (lastPlay) cpuJumps(lastPlay);
        idleDone = false;
        if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es: es.map(e => filt(e, q)), v: M.eng.view(q) }); });
        refreshUI();
      }
      function track(e) {
        const n = D.n;
        if (e.k === 'deal' || e.k === 'swap' || e.k === 'rot') M.lacks = Array.from({ length: e.hands ? e.hands.length : n }, () => [0, 0, 0, 0]);
        else if (e.k === 'draw' && e.why === 'draw' && e.col >= 0 && e.col < 4 && M.lacks[e.p]) M.lacks[e.p][e.col] = 1;
        else if (e.k === 'play' && CC(e.id) < 4 && M.lacks[e.p]) M.lacks[e.p][CC(e.id)] = 0;
      }
      function onVul(v) {
        const tok = M.tok, P = AIP[M.diff] || AIP.Normal;
        for (let p = 0; p < M.cpu.length; p++) {
          if (p === v || !isCpu(p) || Math.random() >= P.catchP) continue;
          api.timeout(() => { if (tok === M.tok && M.eng && M.eng.s.vul === v && M.eng.act(p, { t: 'catch', v })) flush(); }, rnd(P.catchT[0], P.catchT[1]));
        }
        const strict = M.eng && M.eng.rules.strict;
        if (isCpu(v) && Math.random() < (strict ? P.callP : P.lateP)) api.timeout(() => { if (tok === M.tok && M.eng && M.eng.s.vul === v && M.eng.act(v, { t: 'call' })) flush(); }, strict ? rnd(P.catchT[0] * .45, P.catchT[0] * 1.1) : rnd(450, 1700));
      }
      function armTimer() {
        const e = M.eng;
        if (!e || !e.rules.timer) { M.dl = 0; return; }
        const s = e.s, tid = s.tid, p = s.turn, tok = M.tok;
        if (isCpu(p) || s.phase === 'end' || s.phase === 'done' || s.phase === 'idle') { if (M.timerTid !== tid) M.dl = 0; return; }
        if (M.timerTid === tid) return;
        M.timerTid = tid;
        const ms = e.rules.timer * 1000;
        M.dl = now() + ms; M.dlTid = tid;
        if (M.role === 'host') api.net.send({ t: 'tm', tid, ms });
        api.timeout(() => {
          if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
          if (paused) { M.timerTid = -1; return; }
          const ph = M.eng.s.phase, q = M.eng.s.turn, c = Math.floor(Math.random() * 4);
          const a = ph === 'play' ? { t: 'draw' } : ph === 'drawn' ? (M.eng.rules.force ? { t: 'play', id: M.eng.s.drawn, col: c } : { t: 'keep' }) : ph === 'chal' ? { t: 'chal', y: false } : ph === 'col0' ? { t: 'col', col: c } : null;
          if (a && a.t === 'play' && M.eng.rules.s70 && CV(a.id) === 7) a.tgt = (q + 1) % M.eng.s.n;
          if (a && M.eng.act(q, a)) { if (q === viewer) { if (!pane.hidden && pane.dataset.k !== 'menu') hidePane(); api.toast('Time is up'); } M.dl = 0; flush(); }
        }, ms + 80);
      }
      function scheduleCpu(p) {
        const s = M.eng.s, tid = s.tid;
        if (M.cpuTid === tid) return;
        M.cpuTid = tid;
        const tok = M.tok, P = AIP[M.diff] || AIP.Normal;
        const delay = s.phase === 'drawn' ? rnd(420, 760) : s.phase === 'chal' ? rnd(900, 1600) : rnd(P.think[0], P.think[1]);
        const S = M.diff === 'Expert' ? mcSearch(M.eng, p, P, M.lacks, Math.random) : null;
        if (S) { const t0 = now(), chunk = () => { if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid || now() - t0 > delay - 30) return; S.step(9); api.timeout(chunk, 16); }; api.timeout(chunk, 16); }
        api.timeout(() => {
          if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
          const a = S ? S.best() : aiMove(M.eng, p, P, M.lacks, Math.random);
          if (a.t === 'play' && !M.eng.rules.strict && s.hands[p].length === 2 + (a.more ? a.more.length : 0) && !s.called[p] && Math.random() < P.callP) {
            M.eng.act(p, { t: 'call' }); flush();
            api.timeout(() => { if (tok === M.tok && M.eng && M.eng.s.tid === tid) { if (!M.eng.act(p, a)) M.eng.act(p, { t: 'draw' }); flush(); } }, rnd(260, 620));
          } else {
            if (!M.eng.act(p, a) && !M.eng.act(p, { t: 'draw' }) && !M.eng.act(p, { t: 'keep' })) M.eng.act(p, { t: 'chal', y: false });
            flush();
          }
        }, delay);
      }
      function send(a) {
        if (M.role === 'guest') {
          if (a.t !== 'call' && a.t !== 'catch') M.awaiting = true;
          api.net.send({ t: 'act', a }); refreshUI();
          return true;
        }
        if (!M.eng) return false;
        const ok = M.eng.act(viewer, a);
        if (ok) flush();
        return ok;
      }

      function canJump(V, id) {
        return !!(V && V.rules && V.rules.jump && scene === 'game' && pane.hidden && M.gating == null && V.turn !== viewer && (V.phase === 'play' || V.phase === 'drawn') && V.top >= 0 && CV(V.top) < 13 && V.hand.includes(id) && CC(id) === CC(V.top) && CV(id) === CV(V.top) && (!V.pend || CV(id) === 12) && !M.awaiting);
      }
      function tryJump(id) {
        const V = view();
        if (!canJump(V, id)) return false;
        sfx('tap');
        if (V.rules.s70 && CV(id) === 7 && V.hand.length > 1) { pickTarget(V, tgt => send({ t: 'jump', id, tgt })); return true; }
        send({ t: 'jump', id });
        return true;
      }
      function pickMulti(V, id, tw) {
        const group = [id, ...tw], firsts = group.filter(x => canPlay(V, V.hand, x)), opts = [];
        for (let c = 0; c < 4; c++) {
          const ofC = group.filter(x => CC(x) === c);
          if (!ofC.length) continue;
          const f = firsts.find(x => CC(x) !== c) ?? (ofC.length > 1 ? firsts.find(x => CC(x) === c) : undefined);
          if (f === undefined) continue;
          const last = ofC.find(x => x !== f), mid = group.filter(x => x !== f && x !== last);
          opts.push({ c, f, more: [...mid, last] });
        }
        const go = (first, more) => {
          if (V.rules.s70 && CV(first) === 7 && V.hand.length > 1 + more.length) return pickTarget(V, tgt => send({ t: 'play', id: first, more, tgt }));
          send({ t: 'play', id: first, more });
        };
        showPane('multi', `<div class="lc-box"><p class="lc-kick">Same numbers</p><h3>Play ${group.length} × ${NAMEV[CV(id)]}?</h3><p>The last card you put down sets the colour.</p>${opts.map((o, i) => `<button class="lc-big ${['red', 'yellow', 'green', 'blue'][o.c]}" data-a="m${i}">Play all ${group.length}<small>end on ${CN[o.c]}</small></button>`).join('')}<div class="lc-row"><button class="lc-sm" data-a="one">Only ${cardName(id)}</button><button class="lc-sm" data-a="x">Back</button></div></div>`, a => {
          hidePane();
          if (a === 'x') { refreshUI(); return; }
          if (a === 'one') { if (V.rules.s70 && CV(id) === 7 && V.hand.length > 1) return pickTarget(V, tgt => send({ t: 'play', id, tgt })); return send({ t: 'play', id }); }
          const o = opts[+a.slice(1)]; if (o) go(o.f, o.more);
        });
      }
      function tryPlay(id) {
        if (tryJump(id)) return;
        if (!canAct()) return;
        const V = view();
        if (!playable(V).includes(id)) {
          const e = D.hand.find(h => h.id === id); if (e) e.shake = now();
          sfx('bad'); return;
        }
        sfx('tap');
        const v = CV(id);
        if (V.rules.multi && V.phase === 'play' && !V.pend && v <= 9) { const tw = twins(V.hand, id); if (tw.length) return pickMulti(V, id, tw); }
        if (v >= 13) return pickColour(true, col => send({ t: 'play', id, col }));
        if (V.rules.s70 && v === 7 && V.hand.length > 1) return pickTarget(V, tgt => send({ t: 'play', id, tgt }));
        send({ t: 'play', id });
      }
      function tryDraw() {
        if (!canAct()) return;
        const V = view();
        if (V.phase !== 'play') return;
        send({ t: 'draw' });
      }
      function doKeep() { if (canAct() && view().phase === 'drawn') { sfx('tap'); send({ t: 'keep' }); } }
      function doCall() {
        const V = view();
        if (!V || scene !== 'game' || M.gating != null) return;
        if (!((!V.rules.strict && V.counts[viewer] <= 2 && !V.called[viewer]) || V.vul === viewer)) return;
        audio();
        if (M.role === 'guest') { send({ t: 'call' }); return; }
        if (!send({ t: 'call' })) sfx('bad');
      }
      function doCatch(p) {
        const V = view();
        if (!V || scene !== 'game') return;
        audio();
        if (V.vul !== p) { api.toast(V.counts[p] === 1 ? 'Too late - they’re safe' : 'Nothing to catch'); return; }
        send({ t: 'catch', v: p });
      }

      let paneFn = null;
      function showPane(kind, html, fn, cls) {
        pane.className = 'lc-pane' + (cls ? ' ' + cls : '');
        pane.dataset.k = kind; pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0;
        paneFn = fn;
      }
      function hidePane() { pane.hidden = true; pane.innerHTML = ''; pane.dataset.k = ''; paneFn = null; }
      pane.addEventListener('click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneFn || !api.alive) return;
        sfx('tap');
        paneFn(b.dataset.a, b);
      });
      const seg = (k, vals, labels) => `<div class="lc-seg" data-k="${k}">${vals.map((v, i) => `<button data-a="seg" data-v="${v}" class="${String(opt[k]) === String(v) ? 'on' : ''}">${labels ? labels[i] : v}</button>`).join('')}</div>`;
      function segClick(b, again) {
        const k = b.parentNode.dataset.k, raw = b.dataset.v;
        opt[k] = raw === 'true' ? true : raw === 'false' ? false : /^\d+$/.test(raw) ? +raw : raw;
        saveOpt();
        if (k === 'felt') felt();
        again();
      }

      function showTitle() {
        M.tok++; scene = 'title'; paused = false; M.gating = null;
        Q.length = 0; fly.length = 0; fx.length = 0;
        M.mode = opt.mode; M.role = 'local'; M.eng = null;
        hud();
        api.score('—');
        const l = m => opt.mode === m ? ' last' : '';
        showPane('title', `<div class="lc-title"><div class="lc-logo">UN<b>O</b></div><p class="lc-tag">Match the colour or number. Call it at one card.</p>
<button class="lc-big red${l('cpu')}" data-a="m:cpu">vs CPU<small>Play 1-3 computer opponents</small></button>
<button class="lc-big green${l('online')}" data-a="m:online">Online party<small>2-4 players, each on their own device</small></button>
<div class="lc-row"><button class="lc-sm" data-a="house">House rules</button><button class="lc-sm" data-a="rules">How to play</button></div></div>`, a => {
          if (a.startsWith('m:')) { opt.mode = a.slice(2); saveOpt(); setup(); }
          else if (a === 'house') house(showTitle);
          else if (a === 'rules') rules(showTitle);
        }, 'clear');
      }
      function setup() {
        const m = opt.mode;
        const body = m === 'cpu'
          ? `<h3>vs CPU</h3><div class="lc-opt"><span>Opponents</span>${seg('cpus', [1, 2, 3])}</div><div class="lc-opt"><span>CPU skill</span>${seg('diff', ['Easy', 'Normal', 'Hard', 'Expert'])}</div>`
          : `<h3>Online party</h3><div class="lc-opt"><span>Add bots</span>${seg('obots', [0, 1, 2], ['None', '1 bot', '2 bots'])}</div>${+opt.obots ? `<div class="lc-opt"><span>Bot skill</span>${seg('diff', ['Easy', 'Normal', 'Hard', 'Expert'])}</div>` : ''}<p>Party of 2-4 players, each on their own device. Pick the party size in the lobby. Only real players join unless you add bots. The host's house rules are used.</p>`;
        showPane('setup', `<div class="lc-box">${body}<div class="lc-opt"><span>Points to win</span>${seg('target', [0, 100, 200, 500], ['1 round', '100', '200', '500'])}</div>
<button class="lc-big ${m === 'cpu' ? 'red' : 'green'}" data-a="go">${m === 'online' ? 'Create or join a party' : 'Deal!'}</button>
<div class="lc-row"><button class="lc-sm" data-a="house">House rules</button><button class="lc-sm" data-a="back">Back</button></div></div>`, (a, b) => {
          if (a === 'seg') segClick(b, setup);
          else if (a === 'go') { if (m === 'online') startOnline(); else newMatch(); }
          else if (a === 'house') house(setup);
          else if (a === 'back') showTitle();
        });
      }
      function house(back) {
        const OF = [true, false], OL = ['On', 'Off'], o = (k, t, sub) => `<div class="lc-opt"><span>${t}${sub ? `<small>${sub}</small>` : ''}</span>${seg(k, OF, OL)}</div>`;
        const top = pane.scrollTop;
        showPane('house', `<div class="lc-box wide"><h3>House rules</h3>
<p class="lc-sec">Draw cards</p>
${o('stack2', 'Stack Draw Twos', '+2 on +2 passes the pile on')}
${o('stack4', 'Stack Wild Draw Fours', '+4 on +4')}
${o('mix', 'Mix stacks', '+4 on a +2, and +2 on a +4')}
${o('nobluff', 'No bluffing', '+4 only without a card of the colour')}
${o('chal', 'Challenges', 'The victim may challenge a +4')}
<p class="lc-sec">Playing</p>
${o('until', 'Draw until playable')}
${o('force', 'Forced play', 'A drawn card that fits must be played')}
${o('multi', 'Same numbers together', 'Green 6 + red 6 in one go')}
${o('jump', 'Jump-in', 'Play an identical card out of turn')}
${o('s70', '7 swaps, 0 passes hands')}
<p class="lc-sec">UNO call</p>
${o('strict', 'Call after your second-to-last card', 'Off: you may call early')}
<div class="lc-opt"><span>Penalty if caught</span>${seg('pen', [2, 4], ['2 cards', '4 cards'])}</div>
<p class="lc-sec">Table</p>
<div class="lc-opt"><span>Starting cards</span>${seg('hand', [5, 7, 10])}</div>
<div class="lc-opt"><span>Turn timer</span>${seg('timer', [0, 10, 20, 30], ['Off', '10 s', '20 s', '30 s'])}</div>
<div class="lc-opt"><span>Table colour</span>${seg('felt', ['blue', 'green', 'red', 'purple'], ['Blue', 'Green', 'Red', 'Purple'])}</div>
<div class="lc-row"><button class="lc-sm" data-a="reset">Default rules</button></div>
<button class="lc-big yellow" data-a="back">Done</button></div>`, (a, b) => {
          if (a === 'seg') segClick(b, () => house(back));
          else if (a === 'reset') { Object.assign(opt, RULE_DEF, { felt: 'blue' }); saveOpt(); felt(); house(back); }
          else back();
        });
        pane.scrollTop = top;
      }
      function rules(back) { showPane('rules', `<div class="lc-box">${RULES}<button class="lc-big yellow" data-a="back">Got it</button></div>`, () => back()); }
      function menu() {
        if (scene !== 'game') return;
        const online = M.mode === 'online';
        if (!online) paused = true;
        showPane('menu', `<div class="lc-box"><p class="lc-kick">${online ? 'Online' : 'Paused'}</p><h3>Menu</h3>
<button class="lc-big green" data-a="resume">Resume</button>
<button class="lc-big yellow" data-a="rules">How to play</button>
<button class="lc-big red" data-a="quit">${online ? 'Leave game' : 'Quit to title'}</button></div>`, a => {
          if (a === 'resume') { hidePane(); if (M.gating == null) paused = false; idleDone = false; refreshUI(); }
          else if (a === 'rules') rules(menu);
          else if (a === 'quit') { if (online) leaveOnline(); else showTitle(); }
        });
      }
      function pickColour(cancel, fn) {
        showPane('colour', `<div class="lc-box"><h3>Choose a colour</h3><div class="lc-cols">${CN.map((c, i) => `<button data-a="c${i}" style="background:${HEX[i]}${i === 1 ? ';color:#2a1e00;text-shadow:none' : ''}">${c}</button>`).join('')}</div>${cancel ? '<button class="lc-sm" data-a="x">Back</button>' : ''}</div>`, a => {
          if (a === 'x') { hidePane(); refreshUI(); return; }
          hidePane(); fn(+a.slice(1));
        });
      }
      function pickTarget(V, fn) {
        const opts = [...Array(V.n).keys()].filter(q => q !== viewer);
        showPane('target', `<div class="lc-box"><h3>Swap hands with…</h3>${opts.map(q => `<button class="lc-big blue" data-a="t${q}">${nm(q)}<small>${V.counts[q]} card${V.counts[q] === 1 ? '' : 's'}</small></button>`).join('')}<button class="lc-sm" data-a="x">Back</button></div>`, a => {
          hidePane(); if (a === 'x') { refreshUI(); return; } fn(+a.slice(1));
        });
      }
      function chalPane(V) {
        const who = nm(V.w4), pc = V.w4c >= 0 ? CN[V.w4c] : 'matching';
        showPane('chal', `<div class="lc-box"><p class="lc-kick">Wild Draw Four</p><h3>${who} hit you with +4</h3><p>Challenge if you think ${who === 'You' ? 'they' : who} still had a <b style="color:${HEX[V.w4c] || '#fff'}">${pc}</b> card. Right: they draw 4. Wrong: you draw 6.</p>
<div class="lc-row" style="flex-wrap:nowrap;gap:10px"><button class="lc-big yellow" data-a="y">Challenge!</button><button class="lc-big red" data-a="n">Draw 4</button></div></div>`, a => { hidePane(); send({ t: 'chal', y: a === 'y' }); });
      }
      function gate(p, start) {
        paused = true; M.gating = p;
        const s = M.eng.s;
        const ones = [...Array(D.n).keys()].filter(q => q !== p && s.hands[q].length === 1);
        const extra = start ? `Round ${s.round} - ${M.names[p]} starts.` : s.phase === 'chal' ? 'A Wild Draw Four was played on you.' : s.pend ? `Draw Twos are stacked on you (+${s.pend}).` : 'Keep your cards hidden from the others.';
        showPane('pass', `<div class="lc-box"><div class="lc-who" style="background:${AV[M.av[p] % AV.length].bg}"></div><p class="lc-kick">Pass the device</p><h3>${M.names[p]}’s turn</h3><p>${extra}</p>
<button class="lc-big blue" data-a="ready">I’m ${M.names[p]} - show my cards</button>
${ones.map(q => `<div class="lc-row"><button class="lc-sm" data-a="pc${q}">Catch ${M.names[q]}</button><button class="lc-sm" data-a="pl${q}">${M.names[q]}: LAST CARD!</button></div>`).join('')}</div>`, a => {
          if (a === 'ready') {
            hidePane(); M.gating = null; viewer = p; layout();
            if (start) { D.hand = []; D.counts = Array(D.n).fill(0); } else syncD(M.eng.view(p), true);
            paused = false; idleDone = false; refreshUI();
          } else {
            const q = +a.slice(2);
            if (a.startsWith('pc')) { if (M.eng.act(p, { t: 'catch', v: q })) { sfx('catch'); api.toast(`Caught! ${M.names[q]} draws 2`); } else api.toast(`${M.names[q]} already called it`); }
            else { if (M.eng.act(q, { t: 'call' })) { sfx('call'); api.toast(`${M.names[q]} called LAST CARD!`); } else api.toast('Already safe'); }
            if (!start) { M.eng.take(); Q.length = 0; }
            gate(p, start);
          }
        }, 'solid');
      }
      function showEnd() {
        const V = view();
        if (!V || (pane.dataset.k === 'end' && !pane.hidden)) return;
        const done = V.phase === 'done', w = V.winner, online = M.mode === 'online';
        if (done && M.mode === 'cpu' && !M.submitted) { M.submitted = true; M.best = w === 0 ? api.submit(V.scores[0]) : false; }
        const hands = D.reveal || [];
        const rows = [...Array(V.n).keys()].map(p => {
          const left = (hands[p] || []).reduce((a, id) => a + PTS(id), 0);
          return `<tr class="${p === w ? 'win' : ''}"><td><i style="background:${AV[M.av[p] % AV.length].bg}"></i>${nm(p)}</td><td>${p === w ? '+' + (D.endPts || 0) : (hands[p] || []).length + ' cards · ' + left}</td><td>${V.scores[p]}${V.target ? `<div class="lc-bar"><b style="width:${Math.min(100, V.scores[p] / V.target * 100)}%"></b></div>` : ''}</td></tr>`;
        }).join('');
        const me = w === viewer && M.mode !== 'pass';
        const title = done ? (me ? 'You win the game!' : nm(w) + ' wins the game!') : (me ? 'You win the round!' : nm(w) + ' wins the round!');
        const kick = done ? (M.best ? 'New best!' : 'Game over') : `Round ${V.round}`;
        const btns = online
          ? M.role === 'host'
            ? `<button class="lc-big green" data-a="next">${done ? 'Rematch' : 'Next round'}</button><div class="lc-row"><button class="lc-sm" data-a="lobby">Back to lobby</button><button class="lc-sm" data-a="leave">Leave</button></div>`
            : `<p>${done ? 'Waiting for the host to start a rematch…' : 'Waiting for the host to deal the next round…'}</p><div class="lc-row"><button class="lc-sm" data-a="leave">Leave</button></div>`
          : done ? `<button class="lc-big red" data-a="again">Play again</button><div class="lc-row"><button class="lc-sm" data-a="title">Menu</button></div>`
            : `<button class="lc-big green" data-a="next">Next round</button><div class="lc-row"><button class="lc-sm" data-a="title">Quit</button></div>`;
        showPane('end', `<div class="lc-box"><p class="lc-kick">${kick}</p><h3>${title}</h3><table class="lc-tbl"><tr><td style="opacity:.6">Player</td><td style="opacity:.6">${done || V.target ? 'Round' : 'Points'}</td><td style="opacity:.6">Total${V.target ? ' / ' + V.target : ''}</td></tr>${rows}</table>${btns}</div>`, a => {
          if (a === 'next') {
            if (!online) return startRound();
            if (M.role !== 'host' || !M.eng) return;
            if (M.eng.view(0).phase === 'done') newMatch(); else startRound();
          } else if (a === 'again') newMatch();
          else if (a === 'title') showTitle();
          else if (a === 'lobby') startOnline();
          else if (a === 'leave') leaveOnline();
        });
      }
      function hud() {
        const g = scene === 'game';
        bMenu.hidden = !g; bLast.hidden = !g; netEl.hidden = !(g && M.mode === 'online');
        if (!g) { bKeep.hidden = true; for (let r = 1; r < 4; r++) bCatch[r].hidden = true; }
      }
      function refreshUI() {
        hud();
        if (scene !== 'game') return;
        const V = view();
        if (!V) return;
        const live = V.phase !== 'end' && V.phase !== 'done' && M.gating == null;
        const mine = V.counts[viewer];
        bLast.disabled = !(live && ((!V.rules.strict && mine <= 2 && mine > 0 && !V.called[viewer]) || V.vul === viewer));
        bLast.classList.toggle('hot', !bLast.disabled && (V.vul === viewer || (V.turn === viewer && mine === 2)));
        const act = canAct();
        bKeep.hidden = !(act && V.phase === 'drawn' && !V.rules.force);
        for (let r = 1; r < 4; r++) {
          const p = (viewer + r) % D.n;
          bCatch[r].hidden = !(live && r < D.n && V.vul === p && p !== viewer);
        }
        if (live && isIdle() && pane.hidden && !M.awaiting && V.turn === viewer) {
          if (V.phase === 'chal') chalPane(V);
          else if (V.phase === 'col0') pickColour(false, col => send({ t: 'col', col }));
        }
      }

      function seats(n, humans, cpu) {
        M.cpu = Array(n).fill(false); M.human = Array(n).fill(false); M.names = []; M.av = [];
        const pool = CPU_NAMES.slice().sort(() => Math.random() - .5);
        for (let p = 0; p < n; p++) {
          M.human[p] = humans.includes(p); M.cpu[p] = !M.human[p] && cpu;
          M.names[p] = M.mode === 'pass' ? 'Player ' + (p + 1) : M.human[p] ? (M.mode === 'online' && M.players.length ? (M.players.find(x => x.id === M.pids[p]) || {}).name || 'Player' : p === 0 ? 'Host' : 'Guest') : pool.pop();
          M.av[p] = p;
        }
      }
      function newMatch() {
        M.tok++; M.submitted = false; M.best = false; M.cpuTid = -1;
        const online = M.mode === 'online' && M.role === 'host';
        if (!online) { M.mode = opt.mode; M.role = 'local'; }
        M.diff = opt.diff;
        let n, humans;
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
          M.players = live;
          const k = Math.max(1, Math.min(4, live.length));
          n = Math.max(2, Math.min(4, k + (+opt.obots || 0)));
          humans = live.slice(0, k).map((x, i) => Math.round(i * n / k));
          M.pids = Array(n).fill(null); humans.forEach((q, i) => { M.pids[q] = live[i].id; });
        }
        else if (M.mode === 'pass') { n = +opt.humans || 2; humans = [...Array(n).keys()]; }
        else { n = 1 + (+opt.cpus || 1); humans = [0]; }
        seats(n, humans, true);
        const rules = {};
        for (const k of Object.keys(RULE_DEF)) rules[k] = opt[k];
        M.eng = Game({ n, rules, target: +opt.target || 0 });
        M.timerTid = -1; M.dl = 0;
        M.lacks = Array.from({ length: n }, () => [0, 0, 0, 0]);
        D.n = n; viewer = 0; D.scores = Array(n).fill(0);
        if (online) sendSetups();
        api.score(M.mode === 'pass' ? '—' : 0);
        startRound();
      }
      function startRound() {
        hidePane(); scene = 'game'; M.cpuTid = -1;
        Q.length = 0; fly.length = 0; fx.length = 0; busy = 0;
        D.hand = []; D.counts = Array(D.n).fill(0); D.pile = []; D.deckN = DECK.length; D.reveal = null; D.turn = -1;
        layout(); hud();
        M.eng.deal();
        if (M.mode === 'pass') {
          const first = M.eng.need().p;
          flush(); paused = true;
          gate(first, true);
        } else flush();
      }

      function sendSetups() {
        const V0 = M.eng.view(0);
        M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'setup', n: D.n, seat: q, cpu: M.cpu, human: M.human, names: M.names, av: M.av, rules: V0.rules, target: V0.target }); });
      }
      function sendSync(id) {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(id);
        if (q < 0 || !M.human[q]) return;
        const V0 = M.eng.view(q);
        api.net.sendTo(id, { t: 'setup', n: D.n, seat: q, cpu: M.cpu, human: M.human, names: M.names, av: M.av, rules: V0.rules, target: V0.target });
        api.net.sendTo(id, { t: 'ev', es: [], v: V0, sync: 1 });
      }
      function seatToCpu(id) {
        const q = M.pids.indexOf(id);
        if (q < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[q];
        M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (CPU)';
        api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
        api.toast(who + ' left. A CPU takes their seat.');
        idleDone = false; refreshUI();
      }
      function leaveOnline() {
        M.tok++; M.mode = 'cpu'; M.role = 'local'; M.eng = null; M.lastV = null; M.pids = []; M.players = [];
        api.net.close(); showTitle();
      }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToCpu(p.id); });
        api.net.on('rejoin', p => { if (M.mode === 'online' && M.role === 'host' && p) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || !M.role || M.role === 'local') return;
          M.tok++; M.role = 'local'; M.eng = null; M.lastV = null; paused = true; Q.length = 0;
          sfx('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
          showPane('left', `<div class="lc-box"><p class="lc-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="lc-big green" data-a="room">Online lobby</button><button class="lc-big red" data-a="cpu">Play vs CPU</button></div>`, a => {
            paused = false;
            if (a === 'room') startOnline(); else { api.net.close(); opt.mode = 'cpu'; saveOpt(); M.mode = 'cpu'; newMatch(); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || scene !== 'game') return;
          const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== viewer && M.human[q]).length;
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        hidePane(); scene = 'title'; hud(); paused = false;
        Q.length = 0; fly.length = 0; fx.length = 0;
        M.mode = 'online'; M.role = null; M.eng = null; M.lastV = null; opt.mode = 'online'; saveOpt();
        const r = await api.net.room({ title: 'UNO', text: 'A party of 2-4 players, each on their own device. Create a party and share the code, or type a friend’s code to join.', sizes: [2, 3, 4], defaultSize: 4, min: 2, max: 4 });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 4);
        if (r.role === 'host') { viewer = 0; newMatch(); }
        else showPane('wait', `<div class="lc-box"><p class="lc-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal…</p><div class="lc-row"><button class="lc-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === viewer || !M.human[q]) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') { if (M.eng.act(q, d.a)) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q) }); }
        } else {
          if (d.t === 'setup') {
            M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat;
            M.cpu = d.cpu; M.human = d.human; M.names = d.names; M.av = d.av; D.n = d.n; M.lastV = null; M.awaiting = false;
            scene = 'game'; paused = false; Q.length = 0; fly.length = 0; fx.length = 0; busy = 0;
            D.hand = []; D.counts = Array(d.n).fill(0); D.pile = []; D.deckN = DECK.length; D.scores = Array(d.n).fill(0);
            layout(); hidePane(); hud(); api.score(0);
          } else if (M.role !== 'guest') return;
          else if (d.t === 'ev') {
            M.lastV = d.v; M.awaiting = false; idleDone = false;
            if (d.sync) { syncD(d.v, true); D.scores = d.v.scores.slice(); api.score(d.v.scores[viewer]); }
            else Q.push(...d.es);
            refreshUI();
          } else if (d.t === 'seats') { M.cpu = d.cpu; M.human = d.human; M.names = d.names; }
          else if (d.t === 'tm') { M.dl = now() + (+d.ms || 0); M.dlTid = d.tid; }
        }
      }

      const loc = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
      api.on(cv, 'pointerdown', e => {
        audio();
        if (scene !== 'game' || !pane.hidden) return;
        const p = loc(e), id = hitHand(p.x, p.y);
        if (id >= 0) {
          D.focus = id;
          if (e.pointerType === 'mouse') { tryPlay(id); return; }
          drag = { id, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false, lift: false, pid: e.pointerId };
          try { cv.setPointerCapture(e.pointerId); } catch (x) {}
          return;
        }
        if (hitDeck(p.x, p.y)) { tryDraw(); return; }
        D.focus = -1;
      });
      api.on(cv, 'pointermove', e => {
        const p = loc(e);
        if (!drag) {
          if (e.pointerType === 'mouse' && scene === 'game') { hover = hitHand(p.x, p.y); D.focus = hover; cv.style.cursor = hover >= 0 || hitDeck(p.x, p.y) ? 'pointer' : ''; }
          return;
        }
        if (e.pointerId !== drag.pid) return;
        const dx = p.x - drag.x0, dy = p.y - drag.y0;
        if (Math.abs(dx) > 9 || Math.abs(dy) > 9) drag.moved = true;
        drag.x = p.x; drag.y = p.y;
        if (!drag.lift && dy < -28 && Math.abs(dy) > Math.abs(dx) * 1.2 && canAct()) drag.lift = true;
        if (!drag.lift) { const id = hitHand(p.x, Math.min(p.y, H - 20)); if (id >= 0) { drag.id = id; D.focus = id; } }
      });
      const up = e => {
        if (!drag || e.pointerId !== drag.pid) return;
        const d = drag; drag = null;
        if (e.type === 'pointercancel') return;
        if (d.lift) { if (d.y < handTop() - 10) tryPlay(d.id); }
        else if (!d.moved) tryPlay(d.id);
      };
      api.on(cv, 'pointerup', up); api.on(cv, 'pointercancel', up);
      api.on(cv, 'pointerleave', e => { if (e.pointerType === 'mouse' && !drag) { hover = -1; D.focus = -1; } });
      const press = (el, fn) => api.on(el, 'pointerdown', e => { e.preventDefault(); if (!el.disabled && !el.hidden) fn(); });
      press(bLast, doCall); press(bKeep, doKeep);
      for (let r = 1; r < 4; r++) press(bCatch[r], () => doCatch((viewer + r) % D.n));
      api.on(bMenu, 'click', () => { sfx('tap'); menu(); });
      api.on(window, 'keydown', e => {
        if (e.target && e.target.closest && e.target.closest('input,textarea,select')) return;
        if (scene !== 'game') return;
        const k = (e.key || '').toLowerCase();
        if (!pane.hidden) {
          const kind = pane.dataset.k;
          if (kind === 'colour') { const i = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'rygb'.indexOf(k); if (i >= 0 && paneFn) { e.preventDefault(); paneFn('c' + i); } }
          else if (kind === 'chal' && paneFn && (k === 'c' || k === 'y' || k === 'd' || k === 'n')) paneFn(k === 'c' || k === 'y' ? 'y' : 'n');
          else if (kind === 'pass' && paneFn && k === 'enter') { e.preventDefault(); paneFn('ready'); }
          return;
        }
        if (k === 'arrowleft' || k === 'arrowright') {
          e.preventDefault();
          if (!D.hand.length) return;
          const i = D.hand.findIndex(h => h.id === D.focus), d = k === 'arrowleft' ? -1 : 1;
          D.focus = D.hand[i < 0 ? (d > 0 ? 0 : D.hand.length - 1) : (i + d + D.hand.length) % D.hand.length].id;
        } else if (k === 'enter' || k === ' ' || k === 'arrowup') {
          e.preventDefault();
          if (D.focus >= 0) tryPlay(D.focus);
          else { const pl = playable(view()); if (pl.length) D.focus = pl[0]; }
        } else if (k === 'd' || k === 'arrowdown') { e.preventDefault(); tryDraw(); }
        else if (k === 'k') doKeep();
        else if (k === 'l' || k === 'u') doCall();
        else if (k === 'c') { const V = view(); if (V && V.vul >= 0 && V.vul !== viewer) doCatch(V.vul); }
        else if (k === 'j') { const V = view(); const id = V && (V.hand.includes(D.focus) && canJump(V, D.focus) ? D.focus : V.hand.find(x => canJump(V, x))); if (id != null && id >= 0) tryJump(id); }
      });
      api.on(window, 'resize', () => fit(false));

      function card(id, x, y, r, s, sx) {
        const sp = SP.get(id), w = L.cw + SP.pad * 2, h = L.ch + SP.pad * 2;
        ctx.save(); ctx.translate(x, y); if (r) ctx.rotate(r); ctx.scale(s * (sx == null ? 1 : sx), s);
        ctx.drawImage(sp, -w / 2, -h / 2, w, h); ctx.restore();
      }
      function rrect(x, y, w, h, r, fill, stroke, lw) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw || 2; ctx.strokeStyle = stroke; ctx.stroke(); } }
      function label(t, x, y, size, col, align, stroke) {
        ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
        if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = size * .28; ctx.strokeStyle = stroke; ctx.strokeText(t, x, y); }
        ctx.fillStyle = col; ctx.fillText(t, x, y);
      }
      function drawRing(t, dt) {
        const R = L.ring, col = D.col >= 0 ? HEX[D.col] : '#ffffff';
        D.spin = Math.max(0, D.spin - dt * 1.6);
        D.ringRot += D.dir * dt * (.45 + D.spin * 7);
        const gl = ctx.createRadialGradient(R.x, R.y, R.r * .2, R.x, R.y, R.r * 1.25);
        gl.addColorStop(0, col + '55'); gl.addColorStop(.7, col + '22'); gl.addColorStop(1, col + '00');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(R.x, R.y, R.r * 1.25, 0, TAU); ctx.fill();
        ctx.lineWidth = R.r * .1; ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.arc(R.x, R.y, R.r, 0, TAU); ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a0 = D.ringRot + i * TAU / 4, len = TAU / 4 * .66, a1 = a0 + len, w = R.r * .085;
          const tipA = D.dir > 0 ? a1 : a0;
          for (const pass of [0, 1]) {
            ctx.beginPath(); ctx.arc(R.x, R.y, R.r, a0, a1);
            ctx.lineCap = 'round'; ctx.lineWidth = pass ? w : w + 5; ctx.strokeStyle = pass ? col : 'rgba(0,0,0,.35)'; ctx.stroke();
            const hx = R.x + Math.cos(tipA) * R.r, hy = R.y + Math.sin(tipA) * R.r, tg = tipA + D.dir * Math.PI / 2, hl = w * 1.9;
            ctx.beginPath();
            ctx.moveTo(hx + Math.cos(tg) * hl, hy + Math.sin(tg) * hl);
            ctx.lineTo(hx + Math.cos(tipA) * hl * .9, hy + Math.sin(tipA) * hl * .9);
            ctx.lineTo(hx - Math.cos(tipA) * hl * .9, hy - Math.sin(tipA) * hl * .9);
            ctx.closePath(); ctx.lineJoin = 'round';
            if (pass) { ctx.fillStyle = col; ctx.fill(); } else { ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.stroke(); }
          }
        }
      }
      function drawPiles(t, V, myTurn, pl) {
        const n = Math.min(5, Math.ceil(D.deckN / 18));
        for (let i = n - 1; i >= 0; i--) card(-1, L.deck.x - i * 1.5, L.deck.y - i * 1.5, 0, 1);
        if (!D.deckN) rrect(L.deck.x - L.cw / 2, L.deck.y - L.ch / 2, L.cw, L.ch, L.cw * .11, 'rgba(0,0,0,.15)', 'rgba(255,255,255,.3)', 2);
        if (myTurn && V.phase === 'play') {
          const glow = pl.length === 0 || V.pend > 0;
          if (glow) { ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * .006) * .3; rrect(L.deck.x - L.cw / 2 - 6, L.deck.y - L.ch / 2 - 6, L.cw + 12, L.ch + 12, L.cw * .16, null, '#fff36b', 4); ctx.restore(); }
          const tx = V.pend > 0 ? 'Draw ' + V.pend : 'Draw';
          rrect(L.deck.x - 30, L.deck.y + L.ch / 2 - 10, 60, 22, 11, '#fcc916', '#121214', 2);
          label(tx, L.deck.x, L.deck.y + L.ch / 2 + 1, 12, '#121214');
        }
        for (const c of D.pile) card(c.id, L.pile.x + c.dx, L.pile.y + c.dy, c.r, 1);
        if (D.pile.length && D.col >= 0 && CV(D.pile[D.pile.length - 1].id) >= 13) {
          const x = L.pile.x + L.cw * .55, y = L.pile.y - L.ch * .5;
          ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fillStyle = HEX[D.col]; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
        }
        if (V && V.pend > 0) { rrect(L.pile.x - 24, L.pile.y - L.ch / 2 - 30, 48, 24, 12, '#121214', '#fff', 2); label('+' + V.pend, L.pile.x, L.pile.y - L.ch / 2 - 18, 14, '#fcc916'); }
      }
      function drawSeat(p, t) {
        const r = rel(p), s = L.seat[r], av = L.av;
        const on = D.turn === p;
        if (!r) return;
        const f = L.fan[r], cnt = D.counts[p] || 0, rv = D.reveal && D.reveal[p];
        const k = rv ? rv.length : Math.min(cnt, 12), spread = PORT ? 7 : 9;
        for (let i = 0; i < k; i++) {
          const o = i - (k - 1) / 2;
          card(rv ? rv[i] : -1, f.x + o * spread * (rv ? 1.6 : 1), f.y + Math.abs(o) * .6, o * .06, rv ? .5 : .42);
        }
        if (on) {
          ctx.save(); ctx.shadowColor = '#fff36b'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(s.x, s.y, av + 5 + Math.sin(t * .008) * 1.5, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#fff36b'; ctx.stroke(); ctx.restore();
        }
        avatar(ctx, s.x, s.y, av, M.av[p] || 0);
        const bx = s.x + av * .78, by = s.y - av * .72;
        ctx.beginPath(); ctx.arc(bx, by, PORT ? 11 : 13, 0, TAU); ctx.fillStyle = cnt === 1 ? '#e8282b' : '#121214'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
        label(String(cnt), bx, by + .5, PORT ? 12 : 14, '#fff');
        const ny = s.y + av + (PORT ? 11 : 13);
        label(nm(p), s.x, ny, PORT ? 12 : 14, '#fff', 'center', 'rgba(0,0,0,.45)');
        if (M.eng && M.eng.target || (M.lastV && M.lastV.target)) label((D.scores[p] || 0) + ' pts', s.x, ny + (PORT ? 13 : 16), PORT ? 10 : 11, 'rgba(255,255,255,.75)');
        if (isCpu(p) && on && Q.length === 0 && !fly.length && scene === 'game') {
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(s.x - 8 + i * 8, s.y - av - 10, 2.6 + Math.max(0, Math.sin(t * .01 - i)) * 1.4, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); }
        }
      }
      function drawMe(t) {
        const s = L.seat[0], on = D.turn === viewer;
        if (!PORT) {
          if (on) { ctx.save(); ctx.shadowColor = '#fff36b'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(s.x, s.y, L.av + 5, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#fff36b'; ctx.stroke(); ctx.restore(); }
          avatar(ctx, s.x, s.y, L.av, M.av[viewer] || 0);
          label(nm(viewer), s.x, s.y + L.av + 13, 14, '#fff', 'center', 'rgba(0,0,0,.45)');
          if ((M.eng && M.eng.target) || (M.lastV && M.lastV.target)) label((D.scores[viewer] || 0) + ' pts', s.x, s.y + L.av + 29, 11, 'rgba(255,255,255,.75)');
        } else {
          const tx = (M.mode === 'pass' ? M.names[viewer] : 'You') + (((M.eng && M.eng.target) || (M.lastV && M.lastV.target)) ? ' · ' + (D.scores[viewer] || 0) + ' pts' : '');
          if (bKeep.hidden) label(tx, 112, L.row, 12, on ? '#fff36b' : 'rgba(255,255,255,.85)', 'center', 'rgba(0,0,0,.35)');
        }
      }
      function drawHand(t, dt, V, pl) {
        const act = canAct(), set = new Set(act ? pl : []), jset = new Set(V && !act ? V.hand.filter(id => canJump(V, id)) : []);
        const sl = handSlots(D.hand.length), k = 1 - Math.exp(-dt * 14);
        const bluffable = V && V.rules && V.rules.chal && V.hand.some(id => CC(id) === V.col);
        D.hand.forEach((e, i) => {
          const s = sl[i]; e.tx = s.x; e.ty = s.y; e.tr = s.r;
          const lift = (set.has(e.id) ? (PORT ? 12 : 16) : 0) + (D.focus === e.id ? (PORT ? 8 : 12) : 0);
          e.x = lerp(e.x, s.x, k); e.y = lerp(e.y, s.y, k); e.r = lerp(e.r, s.r, k); e.lift = lerp(e.lift || 0, lift, k);
        });
        for (const e of D.hand) {
          if (e.ghost) continue;
          if (drag && drag.lift && drag.id === e.id) continue;
          let x = e.x;
          if (e.shake) { const a = (now() - e.shake) / 300; if (a < 1) x += Math.sin(a * 30) * 6 * (1 - a); else e.shake = 0; }
          const sc = D.focus === e.id ? 1.08 : 1;
          card(e.id, x, e.y - e.lift, e.r, sc);
          if (act && !set.has(e.id)) { ctx.save(); ctx.translate(x, e.y - e.lift); ctx.rotate(e.r); ctx.scale(sc, sc); rrect(-L.cw / 2, -L.ch / 2, L.cw, L.ch, L.cw * .11, 'rgba(0,0,0,.32)'); ctx.restore(); }
          if (jset.has(e.id)) { ctx.save(); ctx.translate(x, e.y - e.lift); ctx.rotate(e.r); ctx.scale(sc, sc); ctx.globalAlpha = .6 + Math.sin(t * .012) * .4; rrect(-L.cw / 2 - 4, -L.ch / 2 - 4, L.cw + 8, L.ch + 8, L.cw * .15, null, '#fcc916', 4); ctx.restore(); }
          if (act && set.has(e.id) && CV(e.id) === 14 && bluffable) {
            const bx = x + L.cw * .38, by = e.y - e.lift - L.ch * .44;
            ctx.beginPath(); ctx.arc(bx, by, 10, 0, TAU); ctx.fillStyle = '#ff5b4b'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
            label('!', bx, by + .5, 13, '#fff');
          }
        }
        if (drag && drag.lift) card(drag.id, drag.x, drag.y, 0, 1.1);
      }
      function drawStatus(t, V, myTurn, pl) {
        if (!V || scene !== 'game') return;
        let tx = '', col = '#fff';
        if (V.phase === 'end' || V.phase === 'done') tx = '';
        else if (M.gating != null) tx = '';
        else if (V.turn === viewer && isIdle()) {
          col = '#fff36b';
          if (V.phase === 'chal') tx = 'Challenge or draw 4?';
          else if (V.phase === 'col0') tx = 'Pick the starting colour';
          else if (V.phase === 'drawn') tx = V.rules.force ? 'Play the card you drew' : 'Play the card you drew, or keep it';
          else if (V.pend > 0) tx = pl.length ? `Stack it or draw ${V.pend}` : `Draw ${V.pend}`;
          else if (!pl.length) tx = 'No match - draw a card';
          else if (D.focus >= 0 && CV(D.focus) === 14 && V.rules.chal && V.hand.some(id => CC(id) === V.col) && pl.includes(D.focus)) tx = 'Bluff! You can be challenged';
          else tx = M.mode === 'pass' ? M.names[viewer] + ', your turn' : 'Your turn';
        } else if (V.turn >= 0) {
          tx = V.phase === 'chal' ? nm(V.turn) + ' decides on +4…' : poss(V.turn) + ' turn';
          if (V.rules.jump && V.hand.some(id => canJump(V, id))) { tx = 'Jump in! Tap your matching card'; col = '#fcc916'; }
        }
        if (tx && M.dl && V.phase !== 'end' && V.phase !== 'done' && (M.dlTid == null || M.dlTid === V.tid)) { const left = Math.ceil((M.dl - now()) / 1000); if (left >= 0) tx += ' · ' + left + 's'; }
        if (!tx) return;
        ctx.font = `900 ${PORT ? 13 : 15}px ${FONT}`;
        const w = ctx.measureText(tx).width + 26, h = PORT ? 26 : 30;
        rrect(L.status.x - w / 2, L.status.y - h / 2, w, h, h / 2, 'rgba(0,0,0,.42)');
        label(tx, L.status.x, L.status.y + 1, PORT ? 13 : 15, col);
      }
      function drawFly(t) {
        for (const f of fly.slice()) {
          if (t < f.t0) continue;
          if (!f.started) { f.started = true; if (f.onStart) f.onStart(); }
          const p = Math.min(1, (t - f.t0) / f.dur), e = ease(p), to = f.to();
          const x = lerp(f.from.x, to.x, e), y = lerp(f.from.y, to.y, e) - Math.sin(p * Math.PI) * (f.arc || 0);
          const r = lerp(f.from.r, to.r, e), s = lerp(f.from.s, to.s, e) * (1 + Math.sin(p * Math.PI) * .08);
          if (f.flip) card(p < .5 ? -1 : f.id, x, y, r, s, Math.max(.02, Math.abs(Math.cos(p * Math.PI))));
          else card(f.id, x, y, r, s);
          if (p >= 1) { fly.splice(fly.indexOf(f), 1); if (f.onEnd) f.onEnd(); }
        }
      }
      function drawFx(t, dt) {
        for (let i = fx.length - 1; i >= 0; i--) {
          const f = fx[i], a = (t - f.t0) / f.dur;
          if (a >= 1) { fx.splice(i, 1); continue; }
          if (a < 0) continue;
          if (f.k === 'pt') {
            f.x += f.vx * dt; f.y += f.vy * dt;
            if (f.conf) { f.vy = Math.min(f.vy + 20 * dt, 240); f.rot += dt * 5; } else { f.vy += 500 * dt; f.vx *= .98; }
            ctx.save(); ctx.globalAlpha = Math.min(1, (1 - a) * 2); ctx.fillStyle = f.col; ctx.translate(f.x, f.y);
            if (f.conf) { ctx.rotate(f.rot); ctx.fillRect(-f.sz / 2, -f.sz, f.sz, f.sz * 2); } else { ctx.beginPath(); ctx.arc(0, 0, f.sz, 0, TAU); ctx.fill(); }
            ctx.restore();
          } else if (f.k === 'pop') {
            const sc = a < .15 ? .5 + a / .15 * .65 : a < .25 ? 1.15 - (a - .15) / .1 * .15 : 1;
            ctx.save(); ctx.globalAlpha = a > .75 ? (1 - a) / .25 : 1; ctx.translate(f.x, f.y - a * 18); ctx.scale(sc, sc);
            label(f.txt, 0, 0, f.big ? (PORT ? 26 : 34) : (PORT ? 16 : 19), f.col, 'center', '#121214');
            ctx.restore();
          } else if (f.k === 'bub') {
            const s = seatXY(f.p), r = rel(f.p), up = !r || (!PORT && D.n === 4 && r !== 2);
            const bx = r ? s.x : (PORT ? 250 : 760), by = r ? (PORT ? s.y + L.av + 30 : (up ? s.y - L.av - 30 : s.y + L.av + 40)) : (PORT ? L.row - 44 : 440);
            const sc = a < .12 ? .4 + a / .12 * .6 : 1;
            ctx.save(); ctx.globalAlpha = a > .8 ? (1 - a) / .2 : 1; ctx.translate(bx, by); ctx.scale(sc, sc); ctx.rotate(-.05);
            ctx.font = `900 ${PORT ? 15 : 18}px ${FONT}`;
            const w = ctx.measureText(f.txt).width + 24, h = PORT ? 30 : 36;
            rrect(-w / 2, -h / 2, w, h, h / 2, '#fcc916', '#121214', 3);
            label(f.txt, 0, 1, PORT ? 15 : 18, '#c71b10');
            ctx.restore();
          } else if (f.k === 'ban') {
            const s = seatXY(f.p), sc = a < .2 ? a / .2 * 1.2 : a < .3 ? 1.2 - (a - .2) : 1;
            ctx.save(); ctx.globalAlpha = a > .7 ? (1 - a) / .3 : 1; ctx.translate(rel(f.p) ? s.x : W / 2, rel(f.p) ? s.y : (PORT ? L.row - 40 : H - 175)); ctx.scale(sc, sc);
            const rr = PORT ? 22 : 30;
            ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.moveTo(-rr * .7, -rr * .7); ctx.lineTo(rr * .7, rr * .7);
            ctx.lineWidth = 10; ctx.strokeStyle = '#121214'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = '#ff4a3d'; ctx.stroke();
            ctx.restore();
          } else if (f.k === 'show') {
            const n = f.ids.length, sp = Math.min(L.cw * .62, (W - 60) / Math.max(1, n));
            ctx.save(); ctx.globalAlpha = a < .1 ? a / .1 : a > .85 ? (1 - a) / .15 : 1;
            rrect(W / 2 - (n * sp + L.cw * .7) / 2 - 10, L.ring.y - L.ch * .62, n * sp + L.cw * .7 + 20, L.ch * 1.24, 16, 'rgba(0,0,0,.55)');
            f.ids.forEach((id, i) => card(id, W / 2 + (i - (n - 1) / 2) * sp, L.ring.y, 0, .7));
            label(nm(f.who) + '’s hand', W / 2, L.ring.y - L.ch * .62 - 14, 14, '#fff', 'center', '#121214');
            ctx.restore();
          }
        }
      }
      function drawTitle(t) {
        const cx = W / 2, cy = PORT ? 138 : 128, ids = [DECK.findIndex(c => c[0] === 0 && c[1] === 7), 105, DECK.findIndex(c => c[0] === 3 && c[1] === 11), DECK.findIndex(c => c[0] === 2 && c[1] === 12), DECK.findIndex(c => c[0] === 1 && c[1] === 10)];
        ctx.save(); ctx.globalAlpha = .9;
        const R = { x: cx, y: cy + 10, r: PORT ? 110 : 140 };
        ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.arc(R.x, R.y, R.r, t * .0004, t * .0004 + TAU * .8); ctx.stroke();
        ctx.restore();
        ids.forEach((id, i) => {
          const o = i - 2, b = Math.sin(t * .002 + i) * 3;
          card(id, cx + o * (PORT ? 34 : 46), cy + Math.abs(o) * 8 + b, o * .2, PORT ? 1.05 : 1);
        });
      }
      let lastT = now();
      api.loop((dtc, t) => {
        const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
        pump();
        ctx.drawImage(feltC, 0, 0, W, H);
        if (scene === 'title') { drawTitle(t); drawFx(t, dt); return; }
        const V = view(), myTurn = !!V && V.turn === viewer && isIdle() && M.gating == null, pl = myTurn ? playable(V) : [];
        drawRing(t, dt);
        drawPiles(t, V, myTurn && canAct(), pl);
        for (let p = 0; p < D.n; p++) drawSeat(p, t);
        if (M.gating == null) { drawMe(t); drawHand(t, dt, V, pl); }
        drawStatus(t, V, myTurn, pl);
        drawFly(t);
        drawFx(t, dt);
      });

      fit(true);
      if (document.fonts && document.fonts.load) document.fonts.load(`900 40px ${FONT}`).then(() => { if (api.alive) sprites(); }, () => {});
      root._lc = { M, D, Q, view, opt, get viewer() { return viewer; }, idle: isIdle, slots: () => D.hand.map(e => ({ id: e.id, x: e.x, y: e.y - e.lift, ghost: !!e.ghost })), deck: () => L.deck, size: () => [W, H], playable: () => playable(view()), pane: () => pane.hidden ? '' : pane.dataset.k, dbg: () => ({ paused, busy: Math.round(busy - now()), q: Q.map(e => e.k), fly: fly.map(f => [Math.round(f.t0 - now()), f.dur, f.started]), idleDone }) };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers['last-card'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="lcc-g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#36a85e"/><stop offset=".6" stop-color="#1c6e3c"/><stop offset="1" stop-color="#0b3a1f"/></radialGradient></defs><rect width="400" height="300" fill="url(#lcc-g)"/><g fill="none" stroke="#fcc916" stroke-width="12" stroke-linecap="round" opacity=".9"><path d="M62 190A150 115 0 0 1 140 52"/><path d="M262 44A150 115 0 0 1 350 140"/><path d="M336 230A150 115 0 0 1 200 278"/></g><g fill="#fcc916"><path d="M142 32l20 24-30 3z"/><path d="M362 130l-6 30-22-22z"/><path d="M188 292l-10-28 28 7z"/></g><g transform="translate(96 172) rotate(-18)"><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#fff"/><rect x="-45" y="-71" width="90" height="142" rx="9" fill="#e8282b"/><ellipse rx="34" ry="66" transform="rotate(30)" fill="#fff"/><text x="4" y="30" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="86" fill="#e8282b" stroke="#121214" stroke-width="8" paint-order="stroke" text-anchor="middle" transform="skewX(-8)">7</text><text x="-30" y="-44" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="24" fill="#fff" stroke="#121214" stroke-width="4" paint-order="stroke" text-anchor="middle">7</text></g><g transform="translate(304 172) rotate(18)"><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#fff"/><rect x="-45" y="-71" width="90" height="142" rx="9" fill="#1d6fc8"/><ellipse rx="34" ry="66" transform="rotate(30)" fill="#fff"/><g transform="rotate(45)" stroke="#121214" stroke-width="6" stroke-linejoin="round" fill="#1d6fc8"><path d="M-22 34V-8h-12l20-30 20 30H-6v42z"/><path d="M22-34V8h12L14 38-6 8H6v-42z"/></g><text x="-30" y="-44" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="24" fill="#fff" stroke="#121214" stroke-width="4" paint-order="stroke" text-anchor="middle"></text></g><g transform="translate(200 150) rotate(-4)"><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="12" fill="#fff"/><rect x="-45" y="-71" width="90" height="142" rx="9" fill="#17171b"/><g transform="rotate(30)"><clipPath id="lcc-o"><ellipse rx="34" ry="66"/></clipPath><g clip-path="url(#lcc-o)"><rect x="-40" y="-70" width="40" height="70" fill="#e8282b"/><rect x="0" y="-70" width="40" height="70" fill="#1d6fc8"/><rect x="-40" y="0" width="40" height="70" fill="#fcc916"/><rect x="0" y="0" width="40" height="70" fill="#2fa84a"/></g><ellipse rx="34" ry="66" fill="none" stroke="#fff" stroke-width="4"/></g><text x="4" y="30" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="54" fill="#fff" stroke="#121214" stroke-width="8" paint-order="stroke" text-anchor="middle" transform="skewX(-8)">+4</text><text x="-30" y="-44" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="24" fill="#fff" stroke="#121214" stroke-width="4" paint-order="stroke" text-anchor="middle">+4</text></g><g fill="#fff"><path d="M260 70l5-14 5 14 14 5-14 5-5 14-5-14-14-5z"/><path d="M120 84l3-9 3 9 9 3-9 3-3 9-3-9-9-3z"/></g></svg>`;
})();

