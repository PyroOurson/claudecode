(() => {
  'use strict';

  const RN = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];
  const RP = ['Twos', 'Threes', 'Fours', 'Fives', 'Sixes', 'Sevens', 'Eights', 'Nines', 'Tens', 'Jacks', 'Queens', 'Kings', 'Aces'];
  const RL = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const SUITS = ['♠', '♥', '♦', '♣'];
  const HN = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];
  const TAU = Math.PI * 2;
  const rk = c => c % 13 + 2, su = c => (c / 13) | 0;
  const rn = r => RN[r - 2], rp = r => RP[r - 2];
  const cstr = c => RL[rk(c) - 2] + SUITS[su(c)];

  const LEVELS = [[10, 20], [15, 30], [25, 50], [50, 100], [75, 150], [100, 200], [150, 300], [200, 400], [300, 600], [400, 800], [600, 1200], [800, 1600], [1000, 2000], [1500, 3000], [2000, 4000], [3000, 6000], [5000, 10000]];
  const blindsAt = l => {
    if (l < LEVELS.length) return LEVELS[l];
    const k = Math.pow(1.5, l - LEVELS.length + 1), b = LEVELS[LEVELS.length - 1];
    return [Math.round(b[0] * k / 100) * 100, Math.round(b[1] * k / 100) * 100];
  };
  const unitOf = bb => Math.max(1, Math.pow(10, Math.floor(Math.log10(bb / 2))));

  function straightHi(m) {
    if (m & 16384) m |= 2;
    for (let h = 14; h >= 5; h--) { const need = 31 << (h - 4); if ((m & need) === need) return h; }
    return 0;
  }
  const pack = a => { let v = 0; for (let i = 0; i < 5; i++) v = v << 4 | (a[i] || 0); return v; };
  function score(cs) {
    const cnt = new Array(15).fill(0), sc = [0, 0, 0, 0], sm = [0, 0, 0, 0];
    let mask = 0;
    for (let i = 0; i < cs.length; i++) { const c = cs[i], r = c % 13 + 2, s = (c / 13) | 0; cnt[r]++; sc[s]++; sm[s] |= 1 << r; mask |= 1 << r; }
    let fs = -1;
    for (let s = 0; s < 4; s++) if (sc[s] >= 5) fs = s;
    if (fs >= 0) { const h = straightHi(sm[fs]); if (h) return 8 << 20 | h << 16; }
    const q = [], t = [], p = [], k = [];
    for (let r = 14; r >= 2; r--) { const c = cnt[r]; if (c === 4) q.push(r); else if (c === 3) t.push(r); else if (c === 2) p.push(r); else if (c === 1) k.push(r); }
    if (q.length) return 7 << 20 | q[0] << 16 | Math.max(...t, ...p, ...k, 0) << 12;
    if (t.length && (t.length > 1 || p.length)) return 6 << 20 | t[0] << 16 | Math.max(t[1] || 0, p[0] || 0) << 12;
    if (fs >= 0) { const f = []; for (let r = 14; r >= 2; r--) if (sm[fs] >> r & 1) f.push(r); return 5 << 20 | pack(f); }
    const sh = straightHi(mask);
    if (sh) return 4 << 20 | sh << 16;
    if (t.length) { const o = p.concat(k).sort((a, b) => b - a); return 3 << 20 | t[0] << 16 | (o[0] || 0) << 12 | (o[1] || 0) << 8; }
    if (p.length > 1) return 2 << 20 | p[0] << 16 | p[1] << 12 | Math.max(p[2] || 0, k[0] || 0) << 8;
    if (p.length) return 1 << 20 | p[0] << 16 | (k[0] || 0) << 12 | (k[1] || 0) << 8 | (k[2] || 0) << 4;
    return pack(k);
  }
  const cat = sc => sc >> 20;
  function describe(sc, kick) {
    const c = sc >> 20, a = sc >> 16 & 15, b = sc >> 12 & 15, d = sc >> 8 & 15;
    const k = r => kick && r ? ', ' + rn(r) + ' kicker' : '';
    if (c === 8) return a === 14 ? 'Royal Flush' : 'Straight Flush, ' + rn(a) + ' high';
    if (c === 7) return 'Four of a Kind, ' + rp(a) + k(b);
    if (c === 6) return 'Full House, ' + rp(a) + ' full of ' + rp(b);
    if (c === 5) return 'Flush, ' + rn(a) + ' high';
    if (c === 4) return 'Straight, ' + rn(a) + ' high';
    if (c === 3) return 'Three of a Kind, ' + rp(a) + k(b);
    if (c === 2) return 'Two Pair, ' + rp(a) + ' and ' + rp(b) + k(d);
    if (c === 1) return 'Pair of ' + rp(a) + k(b);
    return 'High Card, ' + rn(sc >> 16 & 15 || sc >> 16) + (kick && b ? ', ' + rn(b) + ' kicker' : '');
  }
  const shortName = sc => {
    const c = sc >> 20;
    return c === 8 && (sc >> 16 & 15) === 14 ? 'Royal Flush' : HN[c];
  };
  function best5(cs) {
    if (cs.length <= 5) return cs.slice();
    let bs = -1, bc = null;
    const n = cs.length;
    for (let a = 0; a < n - 4; a++) for (let b = a + 1; b < n - 3; b++) for (let c = b + 1; c < n - 2; c++) for (let d = c + 1; d < n - 1; d++) for (let e = d + 1; e < n; e++) {
      const h = [cs[a], cs[b], cs[c], cs[d], cs[e]], v = score(h);
      if (v > bs) { bs = v; bc = h; }
    }
    return bc;
  }

  function chen(a, b) {
    const x = rk(a), y = rk(b), hi = Math.max(x, y), lo = Math.min(x, y);
    let p = hi === 14 ? 10 : hi === 13 ? 8 : hi === 12 ? 7 : hi === 11 ? 6 : hi / 2;
    if (hi === lo) return Math.max(5, Math.ceil(p * 2));
    if (su(a) === su(b)) p += 2;
    const gap = hi - lo - 1;
    p -= gap === 0 ? 0 : gap === 1 ? 1 : gap === 2 ? 2 : gap === 3 ? 4 : 5;
    if (gap <= 1 && hi < 12) p += 1;
    return Math.ceil(p);
  }

  function equity(hole, board, nOpp, sims, R, accept) {
    const used = new Array(52).fill(false);
    hole.forEach(c => { used[c] = true; });
    board.forEach(c => { used[c] = true; });
    const left = [];
    for (let i = 0; i < 52; i++) if (!used[i]) left.push(i);
    const need = 5 - board.length, m = left.length;
    let win = 0;
    for (let s = 0; s < sims; s++) {
      const take = need + nOpp * 2;
      for (let i = 0; i < take; i++) { const j = i + ((R() * (m - i)) | 0), t = left[i]; left[i] = left[j]; left[j] = t; }
      if (accept) {
        for (let o = 0; o < nOpp; o++) {
          const i0 = need + o * 2;
          for (let tr = 0; tr < 8 && !accept(left[i0], left[i0 + 1]); tr++) {
            const j = take + ((R() * (m - take)) | 0), k = take + ((R() * (m - take)) | 0);
            if (j === k) continue;
            const t0 = left[i0], t1 = left[i0 + 1];
            left[i0] = left[j]; left[i0 + 1] = left[k]; left[j] = t0; left[k] = t1;
          }
        }
      }
      const full = board.concat(left.slice(0, need));
      const me = score(hole.concat(full));
      let bestO = -1, ties = 0;
      for (let o = 0; o < nOpp; o++) {
        const v = score([left[need + o * 2], left[need + o * 2 + 1]].concat(full));
        if (v > bestO) { bestO = v; ties = 1; } else if (v === bestO) ties++;
      }
      if (me > bestO) win += 1; else if (me === bestO) win += 1 / (ties + 1);
    }
    return win / sims;
  }

  function Engine(o) {
    const R = o.rng || Math.random, n = o.n, cash = o.mode === 'cash';
    const F = v => Array(n).fill(v);
    const s = {
      n, cash, stack: o.stacks.slice(), bet: F(0), tot: F(0), fold: F(false), allin: F(false), in: F(false), out: F(false),
      acted: F(false), actedAt: F(-1), hole: F(null), shown: F(false), board: [], deck: [], button: -1, sb: -1, bb: -1,
      cur: 0, minR: 0, turn: -1, street: 0, phase: 'wait', hand: 0, level: o.level || 0, hpl: o.hpl || 0, fixed: o.blinds || null,
      sbA: 0, bbA: 0, pot: 0, lastAgg: -1, raises: 0, buyin: o.buyin || 0, buyins: F(1), start: o.stacks.slice(), places: [], stats: F(0).map(() => ({ won: 0, hands: 0, best: 0, bestName: '', big: 0 })), winner: -1
    };
    let ev = [];
    const E = e => { ev.push(e); };
    const take = () => { const e = ev; ev = []; return e; };
    const setBlinds = () => { const b = s.fixed || blindsAt(s.level); s.sbA = b[0]; s.bbA = b[1]; };
    setBlinds();
    const nxt = (i, f) => { for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (f(j)) return j; } return -1; };
    const alive = i => !s.out[i] && s.stack[i] > 0;
    const live = i => s.in[i] && !s.fold[i];
    const needs = i => live(i) && !s.allin[i] && (!s.acted[i] || s.bet[i] < s.cur);
    const nLive = () => { let c = 0; for (let i = 0; i < n; i++) if (live(i)) c++; return c; };
    const nActable = () => { let c = 0; for (let i = 0; i < n; i++) if (live(i) && !s.allin[i]) c++; return c; };
    const potTotal = () => s.pot + s.bet.reduce((a, b) => a + b, 0);
    const unit = () => unitOf(s.bbA);

    function legal(p) {
      const call = Math.min(s.cur - s.bet[p], s.stack[p]), maxTo = s.bet[p] + s.stack[p];
      let others = 0;
      for (let i = 0; i < n; i++) if (i !== p && live(i) && !s.allin[i]) others++;
      const can = others > 0 && s.stack[p] > s.cur - s.bet[p] && (!s.acted[p] || s.cur - s.actedAt[p] >= s.minR);
      const min = Math.min(maxTo, s.cur + s.minR);
      return { call, check: s.cur === s.bet[p], raise: can, min, max: maxTo, pot: potTotal(), cur: s.cur, bb: s.bbA, unit: unit() };
    }
    function askTurn(q) {
      s.turn = q;
      E({ k: 'turn', p: q, lg: legal(q) });
    }
    function startHand() {
      const al = [];
      for (let i = 0; i < n; i++) if (alive(i)) al.push(i);
      if (al.length < 2) { s.phase = 'over'; return false; }
      s.hand++;
      if (s.hpl && s.hand > 1 && (s.hand - 1) % s.hpl === 0 && !s.fixed) { s.level++; setBlinds(); E({ k: 'level', level: s.level, sb: s.sbA, bb: s.bbA }); }
      for (let i = 0; i < n; i++) { s.bet[i] = 0; s.tot[i] = 0; s.fold[i] = false; s.allin[i] = false; s.acted[i] = false; s.actedAt[i] = -1; s.hole[i] = null; s.shown[i] = false; s.in[i] = al.includes(i); }
      s.board = []; s.pot = 0; s.sp = []; s.street = 0; s.lastAgg = -1; s.raises = 0;
      s.button = s.button < 0 ? al[(R() * al.length) | 0] : nxt(s.button, alive);
      if (al.length === 2) { s.sb = s.button; s.bb = nxt(s.sb, alive); } else { s.sb = nxt(s.button, alive); s.bb = nxt(s.sb, alive); }
      const d = [];
      for (let i = 0; i < 52; i++) d.push(i);
      for (let i = 51; i > 0; i--) { const j = (R() * (i + 1)) | 0, t = d[i]; d[i] = d[j]; d[j] = t; }
      s.deck = d;
      const order = [];
      for (let k = 0, p = s.sb; k < al.length; k++, p = nxt(p, alive)) order.push(p);
      order.forEach(p => { s.hole[p] = []; });
      for (let r = 0; r < 2; r++) order.forEach(p => { s.hole[p].push(s.deck.pop()); });
      const stacks0 = s.stack.slice();
      E({ k: 'hand', hand: s.hand, button: s.button, sb: s.sb, bb: s.bb, sbA: s.sbA, bbA: s.bbA, level: s.level, stacks: stacks0, in: s.in.slice(), order });
      E({ k: 'deal', order, hole: s.hole.map(h => h && h.slice()) });
      s.al = al.length;
      al.forEach(p => { s.stats[p].hands++; });
      const post = (p, amt, kind) => {
        const a = Math.min(amt, s.stack[p]);
        s.stack[p] -= a; s.bet[p] = a; s.tot[p] = a;
        if (!s.stack[p]) s.allin[p] = true;
        E({ k: 'blind', p, amt: a, kind, allin: s.allin[p] });
      };
      post(s.sb, s.sbA, 'sb'); post(s.bb, s.bbA, 'bb');
      s.cur = s.bbA; s.minR = s.bbA; s.phase = 'bet';
      advance(s.bb);
      return true;
    }
    function advance(from) {
      if (nLive() === 1) return finish();
      const q = nxt(from, needs);
      if (q >= 0 && !(nActable() < 2 && s.bet[q] >= s.cur)) { askTurn(q); return; }
      endRound();
    }
    function collect() {
      let hi = 0, hp = -1, second = 0;
      for (let i = 0; i < n; i++) { if (s.bet[i] > hi) { second = hi; hi = s.bet[i]; hp = i; } else if (s.bet[i] > second) second = s.bet[i]; }
      if (hp >= 0 && hi > second) {
        const back = hi - second;
        s.bet[hp] -= back; s.tot[hp] -= back; s.stack[hp] += back; if (s.stack[hp] > 0) s.allin[hp] = false;
        E({ k: 'return', p: hp, amt: back });
      }
      const bets = s.bet.slice();
      const sum = bets.reduce((a, b) => a + b, 0);
      s.pot += sum; s.bet.fill(0);
      s.sp = s.pot > 0 ? pots().map(p => p.amt) : [];
      E({ k: 'collect', bets, pot: s.pot, sp: s.sp.slice() });
    }
    function endRound() {
      s.turn = -1;
      collect();
      if (s.street === 3) return showdown();
      if (nActable() < 2) return runout();
      nextStreet();
    }
    function dealStreet() {
      s.street++;
      s.deck.pop();
      const c = [];
      for (let i = 0, k = s.street === 1 ? 3 : 1; i < k; i++) c.push(s.deck.pop());
      s.board.push(...c);
      E({ k: 'board', st: s.street, cards: c, pot: s.pot });
    }
    function nextStreet() {
      dealStreet();
      s.cur = 0; s.minR = s.bbA; s.raises = 0; s.lastAgg = -1;
      for (let i = 0; i < n; i++) { s.acted[i] = false; s.actedAt[i] = -1; }
      advance(s.button);
    }
    function reveal(list) {
      const out = [];
      list.forEach(p => {
        if (s.shown[p]) return;
        s.shown[p] = true;
        out.push({ p, cards: s.hole[p].slice() });
      });
      if (out.length) E({ k: 'reveal', list: out });
    }
    function showOrder() {
      const first = s.lastAgg >= 0 && live(s.lastAgg) ? s.lastAgg : nxt(s.button, live);
      const o = [];
      for (let k = 0, p = first; k < n; k++, p = (p + 1) % n) if (live(p)) o.push(p);
      return o;
    }
    function runout() {
      reveal(showOrder());
      while (s.street < 3) dealStreet();
      showdown();
    }
    function pots() {
      const lv = [];
      for (let i = 0; i < n; i++) if (live(i) && !lv.includes(s.tot[i])) lv.push(s.tot[i]);
      lv.sort((a, b) => a - b);
      const out = [];
      let prev = 0;
      lv.forEach(L => {
        let amt = 0;
        for (let i = 0; i < n; i++) if (s.in[i]) amt += Math.max(0, Math.min(s.tot[i], L) - prev);
        const el = [];
        for (let i = 0; i < n; i++) if (live(i) && s.tot[i] >= L) el.push(i);
        if (amt > 0) out.push({ amt, el });
        prev = L;
      });
      let extra = 0;
      for (let i = 0; i < n; i++) if (s.in[i]) extra += Math.max(0, s.tot[i] - prev);
      if (extra && out.length) out[out.length - 1].amt += extra;
      const m = [];
      out.forEach(p => {
        const l = m[m.length - 1];
        if (l && l.el.length === p.el.length && l.el.every((x, i) => x === p.el[i])) l.amt += p.amt; else m.push(p);
      });
      return m;
    }
    function showdown() {
      reveal(showOrder());
      const ps = pots(), sc = [];
      for (let i = 0; i < n; i++) if (live(i)) sc[i] = score(s.hole[i].concat(s.board));
      payout(ps, sc);
    }
    function finish() {
      s.turn = -1;
      collect();
      const w = s.in.findIndex((x, i) => live(i));
      payout([{ amt: s.pot, el: [w] }], null);
    }
    function payout(ps, sc) {
      const wins = [];
      ps.forEach((pt, idx) => {
        let b = -1, ws = [];
        pt.el.forEach(i => { const v = sc ? sc[i] : 0; if (v > b) { b = v; ws = [i]; } else if (v === b) ws.push(i); });
        const order = [];
        for (let k = 1, p = s.button; k <= n; k++) { p = (p + 1) % n; if (ws.includes(p)) order.push(p); }
        const share = Math.floor(pt.amt / order.length);
        let rem = pt.amt - share * order.length;
        order.forEach(p => {
          const amt = share + (rem-- > 0 ? 1 : 0);
          s.stack[p] += amt;
          const e = { k: 'win', p, amt, pot: idx, pots: ps.length, split: order.length > 1, main: idx === 0 };
          if (sc) {
            e.score = sc[p]; e.name = describe(sc[p], true); e.short = shortName(sc[p]); e.best = best5(s.hole[p].concat(s.board));
            e.fold = false;
            if (sc[p] > s.stats[p].best) { s.stats[p].best = sc[p]; s.stats[p].bestName = describe(sc[p], false); }
          } else e.fold = true;
          s.stats[p].won += amt;
          if (amt > s.stats[p].big) s.stats[p].big = amt;
          wins.push(e);
          E(e);
        });
      });
      s.phase = 'between'; s.turn = -1; s.pot = 0;
      const gone = [];
      for (let i = 0; i < n; i++) if (s.in[i] && s.stack[i] === 0) gone.push(i);
      E({ k: 'end', stacks: s.stack.slice() });
      if (!cash) {
        gone.sort((a, b) => s.start[b] - s.start[a] || b - a);
        let surv = 0;
        for (let i = 0; i < n; i++) if (!s.out[i] && s.stack[i] > 0) surv++;
        gone.forEach((p, k) => { s.out[p] = true; const place = surv + 1 + k; s.places[p] = place; E({ k: 'bust', p, place }); });
        s.start = s.stack.slice();
        if (surv === 1) {
          const w = s.stack.findIndex((v, i) => !s.out[i] && v > 0);
          s.winner = w; s.places[w] = 1; s.phase = 'over';
          E({ k: 'over', winner: w, places: s.places.slice() });
        }
      } else gone.forEach(p => { E({ k: 'bust', p, place: 0 }); });
    }
    function act(p, a) {
      if (s.phase !== 'bet' || p !== s.turn || !a) return false;
      const lg = legal(p);
      let kind = a.k, to = Math.floor(+a.to);
      if (kind === 'allin') { kind = 'raise'; to = lg.max; }
      if (kind === 'check' && !lg.check) return false;
      if (kind === 'call' && lg.check) kind = 'check';
      if (kind === 'raise') {
        if (!isFinite(to)) return false;
        to = Math.min(to, lg.max);
        if (to <= s.cur) { if (lg.max > s.cur) return false; kind = 'call'; }
        else if (!lg.raise) return false;
        else if (to < lg.min && to < lg.max) to = lg.min;
      }
      if (kind !== 'fold' && kind !== 'check' && kind !== 'call' && kind !== 'raise') return false;
      const info = { k: 'act', p, a: kind };
      if (kind === 'fold') s.fold[p] = true;
      else if (kind === 'call') {
        const amt = Math.min(s.cur - s.bet[p], s.stack[p]);
        s.stack[p] -= amt; s.bet[p] += amt; s.tot[p] += amt; info.amt = amt; info.to = s.bet[p];
      } else if (kind === 'raise') {
        const prev = s.cur, add = to - s.bet[p], inc = to - prev;
        s.stack[p] -= add; s.bet[p] = to; s.tot[p] += add;
        info.amt = add; info.to = to; info.a = prev === 0 ? 'bet' : 'raise';
        if (inc >= s.minR) s.minR = inc;
        s.cur = to; s.lastAgg = p; s.raises++;
      }
      if (kind !== 'fold' && !s.stack[p]) { s.allin[p] = true; info.allin = true; }
      s.acted[p] = true; s.actedAt[p] = s.cur;
      info.pot = potTotal();
      E(info);
      advance(p);
      return true;
    }
    function rebuy(p) {
      if (!cash) return false;
      s.stack[p] = s.buyin; s.out[p] = false; s.buyins[p]++;
      E({ k: 'rebuy', p, amt: s.buyin });
      return true;
    }
    function leave(p) {
      s.out[p] = true;
    }
    function view(q) {
      return {
        n, hand: s.hand, button: s.button, sb: s.sb, bb: s.bb, sbA: s.sbA, bbA: s.bbA, level: s.level, street: s.street, phase: s.phase,
        board: s.board.slice(), cur: s.cur, turn: s.turn, pot: s.pot, sp: (s.sp || []).slice(), in: s.in.slice(), stack: s.stack.slice(), bet: s.bet.slice(), fold: s.fold.slice(), allin: s.allin.slice(), out: s.out.slice(),
        hole: s.hole.map((h, i) => h && (i === q || s.shown[i]) ? h.slice() : h ? [-1, -1] : null), lg: s.turn >= 0 && s.phase === 'bet' ? legal(s.turn) : null, places: s.places.slice(), buyins: s.buyins.slice()
      };
    }
    const filt = (e, q) => {
      if (e.k !== 'deal') return e;
      return { k: 'deal', order: e.order, hole: e.hole.map((h, i) => h ? (i === q ? h.slice() : [-1, -1]) : null) };
    };
    function info(p) {
      const lg = legal(p), posn = [];
      let k = 0;
      for (let q = s.button, c = 0; c < n; c++) { q = (q + 1) % n; if (s.in[q]) posn.push(q); }
      const idx = posn.indexOf(p), tot = posn.length;
      const late = tot <= 3 ? idx >= tot - 1 || p === s.button : idx >= tot - 2;
      return { lg, hole: s.hole[p], board: s.board, street: s.street, nOpp: nLive() - 1, nPlay: nLive(), raises: s.raises, pot: potTotal(), stack: s.stack[p], bet: s.bet[p], late, early: !late && idx < Math.max(1, tot / 3), blind: p === s.sb || p === s.bb, bb: s.bbA, sb: s.sbA, unit: unit(), cur: s.cur, hu: s.al === 2 };
    }
    return { s, startHand, act, rebuy, leave, view, legal, info, take, filt, potTotal, live, alive };
  }

  function botDecide(I, prof, R) {
    const lg = I.lg, call = lg.call, bb = I.bb, h = I.hole;
    const sk = prof.skill, tight = prof.tight, aggr = prof.aggr, bluff = prof.bluff;
    const rnd = R();
    const round = v => Math.max(lg.min, Math.min(lg.max, Math.round(v / I.unit) * I.unit));
    const raiseTo = to => {
      if (!lg.raise) return call > 0 ? { k: 'call' } : { k: 'check' };
      to = Math.round(to / I.unit) * I.unit;
      if (to >= lg.max - bb || to > lg.max) to = lg.max;
      return { k: 'raise', to: Math.max(Math.min(lg.min, lg.max), Math.min(lg.max, to)) };
    };
    const fold = () => lg.check ? { k: 'check' } : { k: 'fold' };
    const callIt = () => lg.check ? { k: 'check' } : { k: 'call' };
    const canR = lg.raise;
    const effBB = (I.stack + I.bet) / bb;
    if (I.street === 0) {
      const c = chen(h[0], h[1]);
      const loosen = (9 - Math.min(9, I.nPlay)) * .35 + (I.hu ? 1.5 : 0);
      const posAdj = I.late ? 1.4 : I.early ? -1 : 0;
      const tAdj = (tight - .5) * 5 + (sk === 0 ? -1.6 : sk === 2 ? -1.5 : 0);
      const openT = 7.2 + tAdj - posAdj - loosen;
      const facing = call > 0 && I.raises > 0;
      const costBB = call / bb;
      if (effBB <= 12) {
        const shoveT = 7.4 + tAdj * .6 - loosen * .7 - (12 - effBB) * .2 + (facing ? 1.6 + Math.min(3, costBB / 6) : 0);
        if (c >= shoveT && canR) return { k: 'allin' };
        if (c >= shoveT && !canR && call > 0) return { k: 'call' };
        if (!facing && call <= bb && c >= shoveT - 2.5 && sk > 0) return callIt();
        return fold();
      }
      if (!facing) {
        if (c >= openT && canR) {
          const limpers = Math.max(0, Math.round((I.pot - I.sb - bb) / bb));
          const to = bb * (2.2 + rnd * 1.1 + (aggr > .6 ? .4 : 0)) + limpers * bb;
          return raiseTo(I.hu ? Math.max(to * .85, bb * 2.2) : to);
        }
        if (I.late && sk > 0 && canR && rnd < bluff * .35 + (aggr * .06)) return raiseTo(bb * (2.4 + rnd));
        if (lg.check) return { k: 'check' };
        const limpT = openT - 2.4 - (sk === 0 ? 2 : 0);
        if (c >= limpT && call <= bb && (sk === 0 || rnd < .55 - aggr * .3)) return { k: 'call' };
        return fold();
      }
      const raiseT = 10.8 + tAdj * .5 + (I.raises > 1 ? 2 : 0) - (sk === 0 ? 0 : 0) + (sk === 0 ? 2.5 : 0);
      const callT = openT + 1.2 + Math.min(5, Math.max(0, costBB - 3) * .45) + Math.min(4, call / Math.max(1, I.stack + I.bet) * 7) + (I.raises > 1 ? 1.5 : 0) - (sk === 0 ? 3 : 0);
      if (c >= raiseT && canR && rnd < .55 + aggr * .45) return raiseTo(lg.cur * (2.7 + rnd * .8) + (I.raises > 1 ? 0 : 0));
      if (canR && sk === 2 && c >= 6 && I.raises === 1 && rnd < bluff * .22 && costBB < 8) return raiseTo(lg.cur * 3);
      if (c >= callT) return { k: 'call' };
      if (sk === 0 && rnd < .22 && costBB < 6) return { k: 'call' };
      return fold();
    }
    const nOpp = Math.max(1, I.nOpp);
    const sims = sk === 0 ? 40 : sk === 1 ? 70 : 340;
    const faced = call > 0;
    const strict = faced ? Math.min(.9, .3 + call / I.pot * .7 + (I.street - 1) * .08) : 0;
    const bd = I.board;
    const accept = sk === 2 && faced ? (a, b) => R() > strict || score([a, b].concat(bd)) >> 20 > 0 : null;
    let eq = equity(h, bd, nOpp, sims, R, accept);
    if (sk === 0) eq += (R() - .5) * .3;
    else if (sk === 1) { eq += (R() - .5) * .16; if (faced) eq -= .02 * nOpp; }
    const pot = I.pot;
    const need = call / (pot + call);
    const potFrac = f => round(lg.cur + f * (pot + call));
    const commit = (I.stack - call) < pot * .45;
    const dead = I.board.length === 5;
    const vThr = (sk === 2 ? .52 : .6) + .045 * (nOpp - 1) - aggr * .08;
    if (!faced) {
      if (!canR) return { k: 'check' };
      if (eq > vThr && !(eq > .9 && rnd < .22 && !dead)) {
        const f = eq > .85 ? .6 + rnd * .4 : eq > .72 ? .5 + rnd * .25 : .33 + rnd * .3;
        const to = potFrac(f);
        return raiseTo(commit && eq > .7 ? lg.max : to);
      }
      const draw = !dead && eq > .26 && eq < .5;
      const bp = sk === 0 ? 0 : bluff * (nOpp === 1 ? .55 : .2) * (I.late ? 1.3 : .8) + (draw ? .12 + aggr * .1 : 0);
      if (eq < .5 && rnd < bp * (sk === 1 ? .5 : 1)) return raiseTo(potFrac(.45 + rnd * .3));
      if (sk === 0 && eq > .5 && rnd < .35) return raiseTo(potFrac(.3));
      return { k: 'check' };
    }
    const margin = sk === 0 ? -.12 : sk === 1 ? .03 : .015;
    const implied = !dead && sk === 2 && eq > .2 ? .035 : 0;
    const strong = eq > .78 - aggr * .06;
    if (strong && canR && rnd < .5 + aggr * .45) {
      const to = lg.cur + (pot + call) * (.55 + rnd * .5);
      return raiseTo(commit ? lg.max : to);
    }
    if (eq + implied > need + margin || (sk === 0 && rnd < .26 && call < pot * .7)) return { k: 'call' };
    if (sk === 2 && canR && eq < .3 && !dead && rnd < bluff * .12 && call < pot * .8) return raiseTo(lg.cur + (pot + call) * .8);
    return { k: 'fold' };
  }

  const BOTS = [
    ['Ace Mallory', .75, .35, .12], ['Big Tony', .25, .8, .5], ['Luna Vega', .55, .55, .3], ['Doc Holliday', .85, .25, .05],
    ['Mad Max', .12, .9, .7], ['Sofia R.', .6, .65, .25], ['Cowboy Jim', .4, .45, .2], ['Kenji', .7, .5, .35],
    ['Lady Luck', .3, .35, .15], ['Vinnie', .5, .85, .55], ['Professor P', .8, .6, .3], ['Rosa', .45, .4, .22]
  ];
  const SKILLN = ['Easy', 'Normal', 'Hard'];

  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const SUITC = ['#14161c', '#d4202c', '#d4202c', '#14161c'];
  const SUITC4 = ['#14161c', '#d4202c', '#1f62c9', '#1f8a3c'];
  const rr = (x, X, Y, w, h, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };

  function suitPath(x, s, cx, cy, z) {
    x.beginPath();
    if (s === 1) {
      x.moveTo(cx, cy + z * .95);
      x.bezierCurveTo(cx - z * 1.35, cy + z * .1, cx - z * 1.05, cy - z * .95, cx, cy - z * .3);
      x.bezierCurveTo(cx + z * 1.05, cy - z * .95, cx + z * 1.35, cy + z * .1, cx, cy + z * .95);
    } else if (s === 2) {
      x.moveTo(cx, cy - z * 1.1); x.quadraticCurveTo(cx + z * .35, cy - z * .35, cx + z * .85, cy);
      x.quadraticCurveTo(cx + z * .35, cy + z * .35, cx, cy + z * 1.1);
      x.quadraticCurveTo(cx - z * .35, cy + z * .35, cx - z * .85, cy);
      x.quadraticCurveTo(cx - z * .35, cy - z * .35, cx, cy - z * 1.1);
    } else if (s === 0) {
      x.moveTo(cx, cy - z * 1.05);
      x.bezierCurveTo(cx + z * .2, cy - z * .55, cx + z * 1.3, cy - z * .1, cx + z * 1.1, cy + z * .5);
      x.bezierCurveTo(cx + z * .95, cy + z * .95, cx + z * .3, cy + z * .85, cx + z * .12, cy + z * .5);
      x.quadraticCurveTo(cx + z * .12, cy + z * .85, cx + z * .5, cy + z * 1.05);
      x.lineTo(cx - z * .5, cy + z * 1.05);
      x.quadraticCurveTo(cx - z * .12, cy + z * .85, cx - z * .12, cy + z * .5);
      x.bezierCurveTo(cx - z * .3, cy + z * .85, cx - z * .95, cy + z * .95, cx - z * 1.1, cy + z * .5);
      x.bezierCurveTo(cx - z * 1.3, cy - z * .1, cx - z * .2, cy - z * .55, cx, cy - z * 1.05);
    } else {
      const r = z * .46;
      x.arc(cx, cy - z * .5, r, 0, TAU);
      x.moveTo(cx - z * .52 + r, cy + z * .22); x.arc(cx - z * .52, cy + z * .22, r, 0, TAU);
      x.moveTo(cx + z * .52 + r, cy + z * .22); x.arc(cx + z * .52, cy + z * .22, r, 0, TAU);
      x.moveTo(cx, cy); x.lineTo(cx - z * .16, cy + z * 1.05); x.lineTo(cx + z * .16, cy + z * 1.05); x.closePath();
      x.rect(cx - z * .5, cy - z * .12, z, z * .55);
    }
  }
  const PIPS = {
    2: [[50, 26], [50, 114, 1]], 3: [[50, 26], [50, 70], [50, 114, 1]],
    4: [[32, 26], [68, 26], [32, 114, 1], [68, 114, 1]], 5: [[32, 26], [68, 26], [50, 70], [32, 114, 1], [68, 114, 1]],
    6: [[32, 26], [68, 26], [32, 70], [68, 70], [32, 114, 1], [68, 114, 1]], 7: [[32, 26], [68, 26], [50, 48], [32, 70], [68, 70], [32, 114, 1], [68, 114, 1]],
    8: [[32, 26], [68, 26], [50, 48], [32, 70], [68, 70], [50, 92, 1], [32, 114, 1], [68, 114, 1]],
    9: [[32, 26], [68, 26], [32, 56], [68, 56], [50, 70], [32, 84, 1], [68, 84, 1], [32, 114, 1], [68, 114, 1]],
    10: [[32, 26], [68, 26], [50, 41], [32, 56], [68, 56], [32, 84, 1], [68, 84, 1], [50, 99, 1], [32, 114, 1], [68, 114, 1]]
  };
  function bust(x, r, col) {
    x.save();
    x.fillStyle = col; x.beginPath(); x.moveTo(-26, 34); x.quadraticCurveTo(-26, 12, -9, 9); x.lineTo(9, 9); x.quadraticCurveTo(26, 12, 26, 34); x.closePath(); x.fill();
    x.fillStyle = '#f4c542'; x.fillRect(-26, 28, 52, 4); x.fillRect(-3, 9, 6, 25);
    x.fillStyle = '#f6d3b0'; x.fillRect(-4, 4, 8, 8);
    x.beginPath(); x.arc(0, -4, 10, 0, TAU); x.fill();
    x.fillStyle = '#2a2a33'; x.fillRect(-4, -5, 2, 2.4); x.fillRect(2, -5, 2, 2.4);
    x.strokeStyle = '#b05b5b'; x.lineWidth = 1; x.beginPath(); x.moveTo(-3, 1); x.quadraticCurveTo(0, 3, 3, 1); x.stroke();
    if (r === 13) {
      x.fillStyle = '#7a4a1d'; x.beginPath(); x.moveTo(-10, -2); x.lineTo(-10, 6); x.quadraticCurveTo(0, 14, 10, 6); x.lineTo(10, -2); x.quadraticCurveTo(0, 5, -10, -2); x.fill();
      x.fillStyle = '#f4c542'; x.beginPath(); x.moveTo(-11, -10); x.lineTo(-11, -22); x.lineTo(-5, -15); x.lineTo(0, -24); x.lineTo(5, -15); x.lineTo(11, -22); x.lineTo(11, -10); x.closePath(); x.fill();
      x.fillStyle = '#d4202c'; x.beginPath(); x.arc(0, -13, 2, 0, TAU); x.fill();
    } else if (r === 12) {
      x.fillStyle = '#8c5a2b'; x.beginPath(); x.moveTo(-11, -4); x.quadraticCurveTo(-14, 14, -8, 20); x.lineTo(-7, 4); x.lineTo(7, 4); x.lineTo(8, 20); x.quadraticCurveTo(14, 14, 11, -4); x.quadraticCurveTo(0, -20, -11, -4); x.fill();
      x.fillStyle = '#f4c542'; x.beginPath(); x.moveTo(-8, -11); x.lineTo(-6, -19); x.lineTo(-2, -14); x.lineTo(0, -21); x.lineTo(2, -14); x.lineTo(6, -19); x.lineTo(8, -11); x.closePath(); x.fill();
      x.fillStyle = '#f6d3b0'; x.beginPath(); x.arc(0, -4, 8.5, 0, TAU); x.fill();
      x.fillStyle = '#2a2a33'; x.fillRect(-4, -5, 2, 2.4); x.fillRect(2, -5, 2, 2.4);
    } else {
      x.fillStyle = '#3b2a1a'; x.beginPath(); x.moveTo(-11, -3); x.quadraticCurveTo(-12, -16, 0, -15); x.quadraticCurveTo(12, -16, 11, -3); x.quadraticCurveTo(6, -8, 0, -8); x.quadraticCurveTo(-6, -8, -11, -3); x.fill();
      x.fillStyle = col; x.beginPath(); x.moveTo(-12, -9); x.lineTo(12, -9); x.lineTo(10, -14); x.quadraticCurveTo(0, -20, -10, -14); x.closePath(); x.fill();
      x.fillStyle = '#f4c542'; x.beginPath(); x.moveTo(8, -13); x.quadraticCurveTo(20, -26, 22, -14); x.quadraticCurveTo(15, -18, 11, -10); x.fill();
    }
    x.restore();
  }
  function drawFace(x, id, w, h, four) {
    const r = rk(id), s = su(id), col = (four ? SUITC4 : SUITC)[s], k = w / 100;
    x.save(); x.scale(k, k);
    const H0 = 140;
    const g = x.createLinearGradient(0, 0, 100, H0); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#eef0f4');
    x.fillStyle = g; rr(x, 0, 0, 100, H0, 9); x.fill();
    x.strokeStyle = 'rgba(40,46,60,.28)'; x.lineWidth = 1.2; rr(x, .6, .6, 98.8, H0 - 1.2, 8.6); x.stroke();
    x.fillStyle = col;
    const lab = RL[r - 2], big = lab.length > 1;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    const corner = () => {
      x.font = `800 ${big ? 25 : 30}px ${FONT}`; x.fillText(lab, 15, 21);
      x.save(); suitPath(x, s, 15, 48, 8.2); x.fill(); x.restore();
    };
    corner();
    x.save(); x.translate(100, H0); x.rotate(Math.PI); corner(); x.restore();
    if (r <= 10) {
      (PIPS[r] || []).forEach(([px, py, fl]) => {
        x.save(); x.translate(px + (px === 50 ? 0 : px < 50 ? 3 : -3), py * (H0 / 140));
        if (fl) x.rotate(Math.PI);
        suitPath(x, s, 0, 0, r === 10 || r === 9 ? 10.5 : 12); x.fill(); x.restore();
      });
    } else if (r === 14) {
      suitPath(x, s, 50, 70, 29); x.fill();
      if (s === 0) { x.fillStyle = '#fff'; x.beginPath(); x.arc(50, 66, 3, 0, TAU); x.fill(); }
    } else {
      x.save();
      x.fillStyle = '#fbf3da'; rr(x, 24, 18, 52, 104, 4); x.fill();
      x.strokeStyle = col; x.lineWidth = 1.6; rr(x, 24, 18, 52, 104, 4); x.stroke();
      x.beginPath(); x.rect(24, 18, 52, 104); x.clip();
      const fig = col === '#14161c' ? '#2b3a66' : col;
      x.save(); x.translate(50, 53); bust(x, r, r === 12 ? '#a8267b' : fig === '#2b3a66' ? '#2b5aa8' : fig); x.restore();
      x.save(); x.translate(50, 87); x.rotate(Math.PI); bust(x, r, r === 12 ? '#a8267b' : fig === '#2b3a66' ? '#2b5aa8' : fig); x.restore();
      x.strokeStyle = col; x.globalAlpha = .55; x.beginPath(); x.moveTo(24, 70); x.lineTo(76, 70); x.stroke(); x.globalAlpha = 1;
      x.fillStyle = col; suitPath(x, s, 36, 70, 5.5); x.fill(); suitPath(x, s, 64, 70, 5.5); x.fill();
      x.restore();
    }
    x.restore();
  }
  function drawBack(x, w, h, hue) {
    const k = w / 100, H0 = 140;
    x.save(); x.scale(k, k);
    x.fillStyle = '#fff'; rr(x, 0, 0, 100, H0, 9); x.fill();
    const g = x.createLinearGradient(0, 0, 100, H0); g.addColorStop(0, hue[0]); g.addColorStop(1, hue[1]);
    x.fillStyle = g; rr(x, 5, 5, 90, H0 - 10, 5); x.fill();
    x.save(); rr(x, 5, 5, 90, H0 - 10, 5); x.clip();
    x.strokeStyle = 'rgba(255,255,255,.26)'; x.lineWidth = 1.3;
    for (let i = -14; i < 22; i++) { x.beginPath(); x.moveTo(5 + i * 9, 5); x.lineTo(5 + i * 9 + H0, 5 + H0); x.stroke(); x.beginPath(); x.moveTo(5 + i * 9 + H0, 5); x.lineTo(5 + i * 9, 5 + H0); x.stroke(); }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.6; rr(x, 9, 9, 82, H0 - 18, 3); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.88)'; x.beginPath(); x.ellipse(50, H0 / 2, 17, 24, 0, 0, TAU); x.fill();
    x.fillStyle = hue[1]; suitPath(x, 0, 50, H0 / 2, 13); x.fill();
    x.strokeStyle = 'rgba(30,40,70,.35)'; x.lineWidth = 1.1; rr(x, .6, .6, 98.8, H0 - 1.2, 8.6); x.stroke();
    x.restore();
  }

  const CHIPS = [[1, '#ecedf0', '#7c8aa5'], [5, '#d93636', '#ffe3e3'], [25, '#23924d', '#d9f5e3'], [100, '#23272f', '#c8ccd8'], [500, '#7a3fc4', '#eadcff'], [1000, '#f0b02a', '#fff4d0'], [5000, '#e0609f', '#ffe0ef'], [25000, '#2b9bd6', '#d8f1ff'], [100000, '#8a8f99', '#ffffff']];
  function drawChip(x, cx, cy, r, d) {
    const [, c1, c2] = d;
    x.save(); x.translate(cx, cy);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.ellipse(0, r * .22, r, r * .55, 0, 0, TAU); x.fill();
    x.fillStyle = c1; x.beginPath(); x.ellipse(0, 0, r, r * .62, 0, 0, TAU); x.fill();
    x.save(); x.beginPath(); x.ellipse(0, 0, r, r * .62, 0, 0, TAU); x.clip();
    x.fillStyle = c2;
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; x.beginPath(); x.ellipse(Math.cos(a) * r * .86, Math.sin(a) * r * .53, r * .2, r * .13, a, 0, TAU); x.fill(); }
    x.restore();
    x.strokeStyle = c2; x.lineWidth = Math.max(.8, r * .08); x.beginPath(); x.ellipse(0, 0, r * .66, r * .41, 0, 0, TAU); x.stroke();
    x.fillStyle = 'rgba(255,255,255,.16)'; x.beginPath(); x.ellipse(-r * .1, -r * .12, r * .5, r * .22, 0, 0, TAU); x.fill();
    x.restore();
  }
  function breakdown(amt, cap) {
    const out = [];
    let left = Math.max(0, Math.floor(amt)), total = 0;
    for (let i = CHIPS.length - 1; i >= 0 && left > 0; i--) {
      const v = CHIPS[i][0], c = Math.floor(left / v);
      if (c > 0) { out.push([i, c]); left -= c * v; total += c; }
    }
    if (total > cap) {
      const f = cap / total;
      out.forEach(o => { o[1] = Math.max(1, Math.round(o[1] * f)); });
    }
    return out;
  }
  function drawPile(x, px, py, amt, r, cols) {
    const bd = breakdown(amt, 14);
    if (!bd.length) return { w: 0, h: 0 };
    const stacks = [];
    bd.forEach(([i, c]) => {
      while (c > 0) { const t = Math.min(c, 6); stacks.push([i, t]); c -= t; }
    });
    const m = Math.min(stacks.length, cols || 3), sp = r * 1.7;
    const sel = stacks.slice(0, m);
    let hmax = 0;
    sel.forEach(([i, c], k) => {
      const sx = px + (k - (m - 1) / 2) * sp, lift = (k % 2) * r * .22;
      for (let j = 0; j < c; j++) drawChip(x, sx, py - lift - j * r * .3, r, CHIPS[i]);
      hmax = Math.max(hmax, c * r * .3);
    });
    return { w: m * sp, h: hmax };
  }

  const AV_SKIN = ['#f6d3b0', '#e8b98a', '#c98d5f', '#a06a42', '#7a4a2d'];
  const AV_HAIR = ['#2b1d12', '#5a3a1e', '#a56a2a', '#e1c36a', '#9b9ea6', '#1d1d24', '#b3392b'];
  const AV_BG = [['#58a6ff', '#2457b8'], ['#ff8f5a', '#c4491a'], ['#6dd89a', '#1f8a54'], ['#c58bff', '#6a35c4'], ['#ffd45a', '#c4881a'], ['#ff7aa8', '#b8285e'], ['#5ee0d8', '#188a96'], ['#a9b4cf', '#546189']];
  function drawAvatar(x, s, i) {
    const k = s / 64, sk = AV_SKIN[(i * 3 + 1) % 5], hair = AV_HAIR[(i * 5 + 2) % 7], bg = AV_BG[i % 8], st = (i * 7 + 3) % 6;
    x.save(); x.scale(k, k);
    x.beginPath(); x.arc(32, 32, 32, 0, TAU); x.clip();
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const shirt = ['#27304a', '#8a2433', '#2d6a4f', '#d9d9e3', '#3a3a44', '#b8863a'][(i * 2 + 1) % 6];
    x.fillStyle = shirt; x.beginPath(); x.moveTo(6, 70); x.quadraticCurveTo(8, 46, 32, 44); x.quadraticCurveTo(56, 46, 58, 70); x.fill();
    x.fillStyle = sk; x.fillRect(27, 36, 10, 12);
    if (st === 1 || st === 4) { x.fillStyle = hair; x.beginPath(); x.ellipse(32, 30, 17, 19, 0, 0, TAU); x.fill(); x.fillRect(15, 28, 6, 24); x.fillRect(43, 28, 6, 24); }
    x.fillStyle = sk; x.beginPath(); x.ellipse(32, 28, 13, 15, 0, 0, TAU); x.fill();
    x.fillStyle = hair;
    if (st === 0 || st === 3) { x.beginPath(); x.ellipse(32, 17, 14, 8, 0, Math.PI, TAU); x.fill(); x.fillRect(18, 16, 28, 5); }
    else if (st === 1 || st === 4) { x.beginPath(); x.ellipse(32, 17, 14.5, 8, 0, Math.PI, TAU); x.fill(); x.fillRect(19, 15, 10, 7); }
    else if (st === 2) { x.beginPath(); x.arc(32, 25, 14, Math.PI * 1.1, Math.PI * 1.9); x.fill(); x.beginPath(); x.arc(32, 8, 6, 0, TAU); x.fill(); }
    else { x.fillStyle = ['#d62f2f', '#2f6fd6', '#1e1e24'][i % 3]; x.beginPath(); x.ellipse(32, 17, 15, 8, 0, Math.PI, TAU); x.fill(); x.fillRect(14, 16, 36, 4); x.fillRect(18, 19, 34, 3); }
    x.fillStyle = '#23232b'; x.beginPath(); x.arc(26.5, 29, 1.9, 0, TAU); x.arc(37.5, 29, 1.9, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(120,50,50,.9)'; x.lineWidth = 1.6; x.lineCap = 'round'; x.beginPath(); x.moveTo(27, 37); x.quadraticCurveTo(32, 40.5, 37, 37); x.stroke();
    if (i % 5 === 2) { x.strokeStyle = '#1b1b22'; x.lineWidth = 1.5; x.strokeRect(21.5, 25.5, 9, 7); x.strokeRect(33.5, 25.5, 9, 7); x.beginPath(); x.moveTo(30.5, 28); x.lineTo(33.5, 28); x.stroke(); }
    x.restore();
  }

  const FELTS = {
    green: ['#2f9a58', '#1b6a3a', '#0b3a20', '#6b3d1c'],
    blue: ['#2f7fc2', '#1b5594', '#0a2850', '#3a2a24'],
    red: ['#c4433d', '#8e2420', '#4a0f0d', '#2a2b33'],
    purple: ['#7a56c6', '#4c3490', '#241549', '#2d2a38']
  };
  const SPOT = ['#1b1e26', '#fff'];
  const fmtN = v => Math.round(v).toLocaleString('en-US');
  const fmtK = v => v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : v >= 1e4 ? (v / 1e3).toFixed(v >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'k' : fmtN(v);
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => '&#' + c.charCodeAt(0) + ';');
  const handStr = (a, b) => cstr(a) + ' ' + cstr(b);

  const STAKES = [[5, 10], [10, 20], [25, 50], [100, 200]];
  const LVSEG = [[0, 'Fixed'], [12, 'Slow'], [8, 'Normal'], [4, 'Turbo']];
  const ICON_MENU = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const ICON_HIST = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 10h16M4 15h10M4 20h7"/></svg>';

  function mountPoker(root, api) {
    const opt = Object.assign({ mode: 'sng', bots: 5, skill: 'Mixed', stack: 1500, lv: 8, stakes: 1, buyin: 100, hands: 50, timer: 30, fast: false, four: false, felt: 'green', hint: true, v: 1 }, api.load() || {});
    opt.bots = Math.max(1, Math.min(7, +opt.bots || 5));
    if (!FELTS[opt.felt]) opt.felt = 'green';
    if (!STAKES[opt.stakes]) opt.stakes = 1;
    const saveOpt = () => api.save(opt);
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

    const wrap = document.createElement('div'); wrap.className = 'pk-wrap';
    const cv = document.createElement('canvas');
    const ui = document.createElement('div'); ui.className = 'pk-ui';
    ui.innerHTML = `<button class="pk-ico pk-menu" data-u="menu" aria-label="Menu" hidden>${ICON_MENU}</button>
<button class="pk-ico pk-hist" data-u="hist" aria-label="Hand history" hidden>${ICON_HIST}</button>
<div class="pk-net" hidden><i></i><span>Online</span></div>
<div class="pk-ctl" hidden>
<div class="pk-pre" hidden><label><input type="checkbox" data-p="cf"><span>Check / Fold</span></label><label><input type="checkbox" data-p="ca"><span>Call any</span></label></div>
<div class="pk-act" hidden>
<div class="pk-q"><button data-q="min">Min</button><button data-q=".5">&frac12; Pot</button><button data-q=".75">&frac34; Pot</button><button data-q="1">Pot</button><button data-q="max">All-in</button></div>
<div class="pk-sl"><button data-s="-" aria-label="Less">&minus;</button><input type="range" class="pk-rng" min="0" max="100" step="1" aria-label="Bet size"><button data-s="+" aria-label="More">+</button><input type="text" class="pk-amt" inputmode="numeric" aria-label="Amount" autocomplete="off"></div>
<div class="pk-btns"><button class="pk-b fold" data-c="fold">Fold</button><button class="pk-b call" data-c="call">Call</button><button class="pk-b raise" data-c="raise">Raise</button></div>
</div>
<div class="pk-wait" hidden></div>
</div>
<div class="pk-pane" hidden></div>`;
    wrap.append(cv, ui); root.append(wrap);
    const ctx = cv.getContext('2d');
    const $u = s => ui.querySelector(s);
    const bMenu = $u('[data-u=menu]'), bHist = $u('[data-u=hist]'), pane = $u('.pk-pane'), netEl = $u('.pk-net'), ctl = $u('.pk-ctl');
    const ctlPre = $u('.pk-pre'), ctlAct = $u('.pk-act'), ctlWait = $u('.pk-wait'), rng = $u('.pk-rng'), amt = $u('.pk-amt');
    const bFold = $u('[data-c=fold]'), bCall = $u('[data-c=call]'), bRaise = $u('[data-c=raise]');

    let W = 960, H = 600, PORT = false, DPR = 1, L = null, scene = 'title', T = 0, busy = 0, paused = false, viewer = 0, tableC = null;
    const D = { n: 2, seats: [], board: [], pot: 0, button: -1, bpos: null, turn: -1, lg: null, tm: 0, tleft: 0, hand: 0, level: 0, sbA: 0, bbA: 0, hl: null, pots: null, awd: -1, awdT: 0, hist: [], hint: '', mode: 'sng', bust: false, banner: null, live: false, limit: 0, hpl: 0 };
    const Q = [], fly = [], fx = [];
    const M = { mode: 'sng', role: 'local', eng: null, tok: 0, bot: [], hum: [], pids: [], names: [], prof: [], av: [], think: 0, plan: null, nextAt: 0, hooked: false, players: [], size: 0, bots: false, rebuyWait: false, over: false, res: null, lastO: null, started: 0 };
    const SPD = () => {
      const v = D.seats[viewer];
      if (M.role === 'local' && M.mode === 'sng' && v && v.out) return .25;
      return (opt.fast ? .55 : 1) * (v && v.fold && D.live ? .6 : 1);
    };
    let pre = null, tsel = 0, ctlSig = '', lastTick = 0;

    let ac = null, master = null, noise = null;
    function audio() {
      if (api.muted) return null;
      if (!ac) {
        const A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ac = new A(); } catch (e) { return null; }
        master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
        noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    }
    function nz(t, dur, f, q, vol, f2) {
      const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = noise; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + dur); bp.Q.value = q;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(bp); bp.connect(g); g.connect(master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
    }
    function tn(t, dur, type, f0, f1, vol) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
    }
    function sfx(k, n) {
      if (!audio()) return;
      const t = ac.currentTime + .004;
      try {
        if (k === 'deal') { nz(t, .07, 3200, 1.1, .3); nz(t + .01, .04, 900, 1, .15); }
        else if (k === 'flip') nz(t, .1, 1800, .8, .28, 3600);
        else if (k === 'shuf') for (let i = 0; i < 14; i++) nz(t + i * .04, .05, 2000 + Math.random() * 2000, 1.1, .2);
        else if (k === 'chip') { const m = Math.min(5, n || 2); for (let i = 0; i < m; i++) { const u = t + i * .045 + Math.random() * .015; tn(u, .09, 'triangle', 2400 + Math.random() * 900, 1500, .05); nz(u, .05, 4200, 2, .1); } }
        else if (k === 'pot') { for (let i = 0; i < 7; i++) { const u = t + i * .05; tn(u, .1, 'triangle', 2200 + Math.random() * 1100, 1400, .045); nz(u, .05, 4000, 2, .08); } }
        else if (k === 'check') { nz(t, .06, 500, 2, .35); nz(t + .1, .06, 450, 2, .3); }
        else if (k === 'fold') nz(t, .16, 1400, .7, .22, 500);
        else if (k === 'allin') { for (let i = 0; i < 10; i++) { const u = t + i * .04; tn(u, .1, 'triangle', 2000 + Math.random() * 1500, 1300, .05); nz(u, .05, 4200, 2, .09); } tn(t, .4, 'sawtooth', 110, 160, .05); }
        else if (k === 'turn') { tn(t, .08, 'sine', 880, 880, .05); tn(t + .09, .13, 'sine', 1320, 1320, .045); }
        else if (k === 'tick') tn(t, .04, 'square', 1300, 1300, .03);
        else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * .09, .3, 'triangle', f, f, .08)); tn(t + .5, .7, 'sine', 1047, 1047, .05); }
        else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * .15, .3, 'triangle', f, f * .98, .07));
        else if (k === 'bell') { tn(t, .6, 'sine', 1568, 1568, .06); tn(t, .6, 'sine', 2349, 2349, .03); }
        else if (k === 'tap') tn(t, .05, 'sine', 600, 600, .04);
      } catch (e) {}
    }

    let CS = null;
    const cardW = cls => cls === 'H' ? L.hw : cls === 'B' ? L.bw : cls === 'X' ? L.cw * 1.4 : L.cw;
    function spr(cls, id) {
      if (!CS) CS = new Map();
      const key = cls + ':' + id;
      let c = CS.get(key);
      if (c) return c;
      const w = cardW(cls), h = w * 1.4, k = DPR * 1.5, pad = Math.ceil(w * .1);
      c = document.createElement('canvas');
      c.width = Math.ceil((w + pad * 2) * k); c.height = Math.ceil((h + pad * 2) * k);
      const x = c.getContext('2d'); x.scale(k, k); x.translate(pad, pad);
      x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = w * .09; x.shadowOffsetY = w * .035;
      x.fillStyle = '#fff'; rr(x, 0, 0, w, h, w * .09); x.fill();
      x.shadowColor = 'transparent';
      x.save(); x.scale(w / 100, w / 100);
      if (id < 0) drawBack(x, 100, 140, id === -2 ? ['#b8262c', '#7a1318'] : ['#2b5fc4', '#173a85']);
      else drawFace(x, id, 100, 140, opt.four);
      x.restore();
      c = { c, pad, w, h, k };
      CS.set(key, c);
      return c;
    }
    let AVS = null;
    function avSpr(i) {
      if (!AVS) AVS = new Map();
      const s = Math.ceil(L.AR * 2 * DPR * 1.5) + 2, key = i + ':' + s;
      let c = AVS.get(key);
      if (!c) { c = document.createElement('canvas'); c.width = c.height = s; drawAvatar(c.getContext('2d'), s, i); AVS.set(key, c); }
      return c;
    }
    function card(cls, id, x, y, o) {
      o = o || {};
      const f = id < 0 ? 0 : o.flip == null ? 1 : o.flip;
      const sx = f > 0 && f < 1 ? Math.abs(Math.cos(f * Math.PI)) : 1, sc = o.sc || 1;
      const s = f > .5 ? spr(cls, id) : spr(cls, id < 0 && o.red ? -2 : -1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
      if (o.alpha != null) ctx.globalAlpha = o.alpha;
      ctx.scale(Math.max(.02, sx) * sc, sc);
      if (o.dim) ctx.filter = 'brightness(.5)';
      ctx.drawImage(s.c, -s.w / 2 - s.pad, -s.h / 2 - s.pad, s.w + s.pad * 2, s.h + s.pad * 2);
      ctx.filter = 'none';
      if (o.glow) {
        ctx.strokeStyle = '#ffd34a'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(255,211,74,.95)'; ctx.shadowBlur = 14 * o.glow;
        rr(ctx, -s.w / 2, -s.h / 2, s.w, s.h, s.w * .09); ctx.stroke(); ctx.shadowBlur = 0;
      }
      ctx.restore();
    }

    function layout() {
      const P = PORT, n = Math.max(2, D.n);
      const cx = W / 2, cy = P ? 258 : 287, rx = P ? 130 : 352, ry = P ? 172 : 172, ax = P ? 148 : 410, ay = P ? 200 : 197;
      const AR = n > 6 ? (P ? 17 : 23) : (P ? 19 : 27);
      L = { P, n, cx, cy, rx, ry, AR, cw: P ? 27 : 38, bw: P ? 42 : 60, hw: P ? 56 : 74, pw: P ? 74 : 112, ph: P ? 30 : 38, seat: [] };
      for (let r = 0; r < n; r++) {
        const a = Math.PI / 2 + r * TAU / n, c = Math.cos(a), s = Math.sin(a);
        L.seat.push({ x: cx + ax * c, y: cy + ay * s, bx: r === 0 && !P ? cx - 135 : cx + rx * .6 * c, by: cy + ry * (r === 0 ? (P ? .43 : .6) : .56) * s, c, s });
      }
      L.board = { y: cy + (P ? 8 : 16), gap: P ? 5 : 9 };
      L.pot = { x: cx, y: cy - (P ? 54 : 52) };
      L.deck = { x: cx + (P ? 62 : 150), y: cy - (P ? 110 : 124) };
      CS = null; AVS = null;
    }
    const rel = p => ((p - viewer) % D.n + D.n) % D.n;
    const seatPos = p => L.seat[rel(p)];
    const bslot = i => ({ x: L.cx + (i - 2) * (L.bw + L.board.gap), y: L.board.y });
    const holePos = (p, i) => {
      const s = seatPos(p), r = rel(p);
      if (r === 0) return { x: s.x + (i ? 1 : -1) * L.hw * .55, y: s.y - L.AR - L.hw * .7 + 6, rot: (i ? 1 : -1) * .08 };
      return { x: s.x + (i ? 1 : -1) * L.cw * .55, y: s.y - L.AR * .5 - L.cw * .45, rot: (i ? 1 : -1) * .2 };
    };

    function feltBG() {
      const c = document.createElement('canvas'); c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
      const x = c.getContext('2d'); x.scale(DPR, DPR);
      const [f1, f2, f3, rail] = FELTS[opt.felt];
      const bg = x.createRadialGradient(W / 2, H * .45, 40, W / 2, H * .45, Math.max(W, H) * .8);
      bg.addColorStop(0, '#222733'); bg.addColorStop(1, '#07080c');
      x.fillStyle = bg; x.fillRect(0, 0, W, H);
      const cx = L.cx, cy = L.cy, rx = L.rx, ry = L.ry;
      x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.ellipse(cx, cy + 14, rx + 34, ry + 34, 0, 0, TAU); x.fill();
      const rg = x.createLinearGradient(0, cy - ry - 30, 0, cy + ry + 30);
      rg.addColorStop(0, '#ffffff22'); rg.addColorStop(.1, rail); rg.addColorStop(.9, '#00000099'); rg.addColorStop(1, '#000');
      x.fillStyle = rail; x.beginPath(); x.ellipse(cx, cy, rx + 26, ry + 26, 0, 0, TAU); x.fill();
      x.fillStyle = rg; x.beginPath(); x.ellipse(cx, cy, rx + 26, ry + 26, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 2; x.beginPath(); x.ellipse(cx, cy, rx + 25, ry + 25, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      x.fillStyle = '#16181f'; x.beginPath(); x.ellipse(cx, cy, rx + 8, ry + 8, 0, 0, TAU); x.fill();
      const fg = x.createRadialGradient(cx, cy - ry * .1, 20, cx, cy, rx * 1.05);
      fg.addColorStop(0, f1); fg.addColorStop(.6, f2); fg.addColorStop(1, f3);
      x.fillStyle = fg; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill();
      const t = document.createElement('canvas'); t.width = t.height = 96;
      const tx = t.getContext('2d'), im = tx.createImageData(96, 96);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 20; }
      tx.putImageData(im, 0, 0);
      x.save(); x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.clip(); x.fillStyle = x.createPattern(t, 'repeat'); x.fillRect(0, 0, W, H); x.restore();
      x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 1.6; x.setLineDash([2, 7]); x.beginPath(); x.ellipse(cx, cy, rx * .9, ry * .86, 0, 0, TAU); x.stroke(); x.setLineDash([]);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 3; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.11)'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `900 ${PORT ? 17 : 26}px ${FONT}`; x.fillText("TEXAS HOLD'EM", cx, cy + (PORT ? 88 : 96));
      x.font = `800 ${PORT ? 9 : 12}px ${FONT}`; x.fillText('NO LIMIT', cx, cy + (PORT ? 104 : 117));
      tableC = c;
    }
    function fit(force) {
      const port = (root.clientWidth || 800) < 640;
      if (!force && port === PORT) return;
      PORT = port; W = port ? 360 : 960; H = port ? 640 : 600;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
      wrap.style.aspectRatio = `${W} / ${H}`;
      wrap.classList.toggle('pk-port', port);
      layout(); feltBG();
      if (D.seats.length && D.button >= 0) moveButton(D.button, true);
    }

    const mkSeat = p => ({ name: M.names[p] || 'Player', av: M.av[p] == null ? p : M.av[p], bot: !!M.bot[p], stack: 0, bet: 0, in: false, fold: false, allin: false, out: false, cards: [-1, -1], land: 0, flipAt: [Infinity, Infinity], lastA: '', lastT: -9, win: 0, place: 0, tag: '', reveal: false, gone: false });
    function resetD(n) {
      D.n = n; D.seats = []; for (let p = 0; p < n; p++) D.seats.push(mkSeat(p));
      D.board = []; D.pot = 0; D.button = -1; D.bpos = null; D.turn = -1; D.lg = null; D.tm = 0; D.hand = 0; D.hl = null; D.pots = null; D.awd = -1; D.hist = []; D.hint = ''; D.bust = false; D.banner = null;
      layout(); feltBG();
    }
    const potTotal = () => D.pot + D.seats.reduce((a, s) => a + s.bet, 0);

    const sched = [];
    const later = (sec, fn) => { sched.push({ t: T + sec, fn }); };
    const tickerL = [];
    const logH = (txt, hd) => {
      D.hist.push({ t: txt, h: !!hd });
      if (D.hist.length > 500) D.hist.shift();
      tickerL.push({ t: txt, t0: T, h: !!hd });
      if (tickerL.length > 6) tickerL.shift();
    };
    const nm = p => p === viewer && M.role !== 'spec' ? 'You' : (D.seats[p] ? D.seats[p].name : 'Player');
    const verb = (p, a, b) => p === viewer ? a : b;

    function moveButton(p, snap) {
      D.button = p;
      const s = seatPos(p), tx = btnTarget(s);
      if (snap || !D.bpos) D.bpos = { x: tx.x, y: tx.y, fx: tx.x, fy: tx.y, tx: tx.x, ty: tx.y, t0: T, dur: 0 };
      else D.bpos = { x: D.bpos.x, y: D.bpos.y, fx: D.bpos.x, fy: D.bpos.y, tx: tx.x, ty: tx.y, t0: T, dur: .5 };
    }
    function btnTarget(s) {
      if (Math.abs(s.s) > .9) return { x: s.x + (s.s > 0 ? -1 : 1) * (L.AR + 16), y: s.y + (s.s > 0 ? -4 : 6) };
      return { x: s.x - s.c * (L.AR + 20), y: s.y - s.s * 6 };
    }
    function chipFly(from, to, amount, delay, dur, land) {
      fly.push({ k: 'chip', amt: amount, x0: from.x, y0: from.y, x1: to.x, y1: to.y, t0: T + delay, dur, land, arc: 16 });
    }
    function cardFly(from, to, id, delay, dur, o) {
      fly.push(Object.assign({ k: 'card', id, x0: from.x, y0: from.y, x1: to.x, y1: to.y, t0: T + delay, dur, land: null, cls: 'S', rot0: 0, rot1: 0 }, o));
    }
    const betSpot = p => { const s = seatPos(p); return { x: s.bx, y: s.by }; };
    const stackSpot = p => { const s = seatPos(p); return { x: s.x, y: s.y + L.AR * .6 }; };
    function floatTxt(x, y, txt, col, size, dur) {
      fx.push({ x, y, txt, col, size: size || 18, t0: T, dur: dur || 1.5 });
    }
    function updHint() {
      D.hint = '';
      if (!opt.hint) return;
      const S = D.seats[viewer];
      if (!S || !S.in || S.fold || S.cards[0] < 0 || S.cards[1] < 0 || S.land < 2) return;
      const all = S.cards.concat(D.board.map(b => b.id));
      if (all.length >= 5) D.hint = describe(score(all), false);
      else { const a = rk(S.cards[0]), b = rk(S.cards[1]); D.hint = a === b ? 'Pair of ' + rp(a) : rn(Math.max(a, b)) + '-' + rn(Math.min(a, b)) + (su(S.cards[0]) === su(S.cards[1]) ? ' suited' : ''); }
    }

    function handle(e) {
      const sp = SPD(), S = e.p != null ? D.seats[e.p] : null;
      switch (e.k) {
        case 'hand': {
          D.live = true; D.hand = e.hand; D.level = e.level; D.sbA = e.sbA; D.bbA = e.bbA; D.hl = null; D.pots = null; D.awd = -1; D.board = []; D.pot = 0; D.hint = ''; pre = null; D.turn = -1; D.lg = null; D.sb = e.sb; D.bb = e.bb;
          D.seats.forEach((s, p) => { Object.assign(s, { stack: e.stacks[p], bet: 0, in: !!e.in[p], fold: false, allin: false, cards: [-1, -1], land: 0, flipAt: [Infinity, Infinity], lastA: '', win: 0, reveal: false, tag: '' }); });
          fly.length = 0; fx.length = 0;
          moveButton(e.button, D.hand === 1);
          logH('Hand #' + e.hand + ' · blinds ' + fmtN(e.sbA) + '/' + fmtN(e.bbA), true);
          logH('Dealer: ' + nm(e.button).replace('You', 'You'));
          sfx('shuf'); setScore();
          return .6 * sp;
        }
        case 'deal': {
          const gap = .085 * sp;
          let k = 0;
          for (let r = 0; r < 2; r++) e.order.forEach(p => {
            const s = D.seats[p], id = e.hole[p] ? e.hole[p][r] : -1, hp = holePos(p, r);
            cardFly(L.deck, hp, -1, k * gap, .3 * sp, { cls: p === viewer ? 'H' : 'S', rot1: hp.rot, land: () => {
              s.cards[r] = id; s.land = r + 1; sfx('deal');
              if (r === 1 && p === viewer && id >= 0) { s.flipAt = [T + .12, T + .26]; later(.12, () => sfx('flip')); later(.6, updHint); }
            } });
            k++;
          });
          return k * gap + .45 * sp;
        }
        case 'blind': {
          S.stack -= e.amt; S.allin = e.allin;
          const spot = betSpot(e.p);
          chipFly(stackSpot(e.p), spot, e.amt, 0, .32 * sp, () => { S.bet += e.amt; sfx('chip', 2); });
          logH(nm(e.p) + ' ' + verb(e.p, 'post', 'posts') + ' the ' + (e.kind === 'sb' ? 'small' : 'big') + ' blind ' + fmtN(e.amt) + (e.allin ? ' (all-in)' : ''));
          return .4 * sp;
        }
        case 'turn':
          D.turn = e.p; D.lg = e.lg; D.tm = e.tm || 0; D.tleft = D.tm; M.think = -1; M.plan = null;
          if (e.p === viewer) {
            sfx('turn'); try { navigator.vibrate && navigator.vibrate(30); } catch (x) {}
            if (pre) { const pa = pre; later(.45, () => { if (D.turn !== viewer || !D.lg) return; if (pa === 'cf') doAct(D.lg.check ? { k: 'check' } : { k: 'fold' }); else doAct({ k: D.lg.check ? 'check' : 'call' }); }); }
          }
          if (M.role !== 'guest' && M.bot[e.p]) planBot(e.p);
          return 0;
        case 'act': {
          D.turn = -1; D.lg = null;
          const a = e.a;
          S.lastT = T;
          S.lastA = e.allin ? 'All-in' : a === 'fold' ? 'Fold' : a === 'check' ? 'Check' : a === 'call' ? 'Call' : a === 'bet' ? 'Bet' : 'Raise';
          let txt, dur = .45;
          if (a === 'fold') {
            S.fold = true;
            const c0 = holePos(e.p, 0), c1 = holePos(e.p, 1), cls = e.p === viewer ? 'H' : 'S';
            if (S.land) { cardFly(c0, L.deck, S.cards[0], 0, .4, { cls, rot0: c0.rot, rot1: -.4, fade: true, flip0: S.cards[0] >= 0 ? 1 : 0 }); cardFly(c1, L.deck, S.cards[1], .05, .4, { cls, rot0: c1.rot, rot1: .5, fade: true, flip0: S.cards[1] >= 0 ? 1 : 0 }); }
            S.cards = [-1, -1]; S.land = 0; sfx('fold');
            txt = verb(e.p, 'fold', 'folds'); dur = .4;
            if (e.p === viewer) D.hint = '';
          } else if (a === 'check') { sfx('check'); txt = verb(e.p, 'check', 'checks'); dur = .35; }
          else {
            S.stack -= e.amt; S.allin = !!e.allin;
            chipFly(stackSpot(e.p), betSpot(e.p), e.amt, 0, .34 * sp, () => { S.bet += e.amt; });
            sfx(e.allin ? 'allin' : 'chip', Math.ceil(Math.log10(e.amt + 10)));
            txt = a === 'call' ? verb(e.p, 'call', 'calls') + ' ' + fmtN(e.amt) : a === 'bet' ? verb(e.p, 'bet', 'bets') + ' ' + fmtN(e.amt) : verb(e.p, 'raise', 'raises') + ' to ' + fmtN(e.to);
            if (e.allin) txt += ' and ' + verb(e.p, 'are', 'is') + ' all-in';
            dur = .55;
          }
          logH(nm(e.p) + ' ' + txt);
          return dur * sp;
        }
        case 'return': {
          S.bet -= e.amt;
          chipFly(betSpot(e.p), stackSpot(e.p), e.amt, .05, .4 * sp, () => { S.stack += e.amt; sfx('chip', 2); });
          logH('Uncalled bet of ' + fmtN(e.amt) + ' returned to ' + nm(e.p));
          return .5 * sp;
        }
        case 'collect': {
          let any = 0;
          D.seats.forEach((s, p) => {
            s.lastA = '';
            if (s.bet > 0) { const b = s.bet; s.bet = 0; any++; chipFly(betSpot(p), L.pot, b, any * .03, .42 * sp, () => { D.pot += b; }); }
          });
          pre = null; D.pots = e.sp && e.sp.length > 1 ? e.sp.slice() : null;
          later(.6 * sp, () => { if (e.pot != null && Math.abs(D.pot - e.pot) > 0 && !fly.some(f => f.k === 'chip' && f.t1)) D.pot = Math.max(D.pot, e.pot); });
          if (any) sfx('pot');
          return any ? .6 * sp : .05;
        }
        case 'board': {
          const base = D.board.length;
          e.cards.forEach((id, i) => {
            const slot = bslot(base + i);
            cardFly(L.deck, slot, -1, i * .13 * sp, .32 * sp, { cls: 'B', land: () => { D.board.push({ id, at: T }); sfx('flip'); updHint(); } });
          });
          logH(['', 'Flop', 'Turn', 'River'][e.st] + ': ' + e.cards.map(cstr).join(' ') + (e.st > 1 ? '   [' + D.board.map(x => cstr(x.id)).concat(e.cards.map(cstr)).join(' ') + ']' : ''), false);
          return (e.cards.length * .13 + .55) * sp;
        }
        case 'reveal': {
          e.list.forEach((r, i) => {
            const s = D.seats[r.p];
            later(i * .4 * sp, () => { s.cards = r.cards.slice(); s.land = 2; s.reveal = true; s.flipAt = [T, T + .08]; sfx('flip'); });
            const all = r.cards.concat(D.board.map(b => b.id));
            logH(nm(r.p) + ' ' + verb(r.p, 'show', 'shows') + ' ' + handStr(r.cards[0], r.cards[1]) + (all.length >= 7 ? ' (' + describe(score(all), false) + ')' : ''));
          });
          return (e.list.length * .4 + .35) * sp;
        }
        case 'win': {
          D.live = false;
          const showdown = !e.fold;
          const ps = potSpot(e.pot), pi = e.pot;
          if (D.pots) { D.awd = pi; D.awdT = T; }
          later(.55 * sp, () => { D.pot = Math.max(0, D.pot - e.amt); if (D.pots) D.pots[pi] = Math.max(0, D.pots[pi] - e.amt); });
          chipFly(ps, stackSpot(e.p), e.amt, .55 * sp, .6 * sp, () => { S.stack += e.amt; sfx('pot'); });
          S.win = T + .35;
          if (showdown) { D.hl = new Set(e.best); S.tag = e.short; }
          const wp = seatPos(e.p), wr = rel(e.p);
          floatTxt(wr === 0 ? wp.x - (L.P ? 78 : 140) : L.P ? clamp(wp.x, 44, W - 44) : wp.x - wp.c * (L.AR + 56), wr === 0 ? wp.y - 56 : L.P ? wp.y + L.AR + L.ph + 24 : wp.y - wp.s * (L.AR + 80), '+' + fmtN(e.amt), '#ffd34a', L.P ? 17 : 22, 2);
          const pn = e.pots > 1 ? (e.main ? ' the main pot' : ' side pot ' + e.pot) : ' the pot';
          logH(nm(e.p) + ' ' + (e.split ? verb(e.p, 'split', 'splits') : verb(e.p, 'win', 'wins')) + ' ' + fmtN(e.amt) + (e.pots > 1 || e.split ? ' from' + pn : '') + (showdown ? ' with ' + e.name : ''), false);
          if (e.p === viewer) sfx('win');
          return (showdown ? 2.1 : 1.2) * sp;
        }
        case 'end':
          D.seats.forEach((s, p) => { s.stack = e.stacks[p]; });
          D.pot = 0; D.pots = null; D.awd = -1; D.bust = false; setScore();
          M.nextAt = T + 1.6 * sp;
          return .15;
        case 'bust': {
          S.out = true; S.place = e.place;
          logH(e.place ? nm(e.p) + ' ' + verb(e.p, 'finish', 'finishes') + ' in ' + ordinal(e.place) + ' place' : nm(e.p) + ' ' + verb(e.p, 'are', 'is') + ' out of chips');
          if (e.p === viewer && M.mode === 'sng') { M.myPlace = e.place; later(.9 * sp, () => { if (scene === 'game' && !M.over) showBust(e.place); }); sfx('lose'); }
          return .5 * sp;
        }
        case 'level':
          D.level = e.level; D.sbA = e.sb; D.bbA = e.bb;
          D.banner = { t: 'Blinds up', s: fmtN(e.sb) + ' / ' + fmtN(e.bb), t0: T, dur: 2.2 };
          logH('Blinds are now ' + fmtN(e.sb) + '/' + fmtN(e.bb), true); sfx('bell');
          return .9 * sp;
        case 'rebuy':
          S.stack = e.amt; S.out = false; S.place = 0;
          logH(nm(e.p) + ' ' + verb(e.p, 'rebuy', 'rebuys') + ' for ' + fmtN(e.amt));
          return .3;
        case 'over':
          M.over = true; M.res = e;
          later(1.4 * sp, () => { if (scene === 'game') showEnd(e); });
          return .6 * sp;
      }
      return 0;
    }
    function setScore() { const s = D.seats[viewer]; if (s) api.score(s.stack); }
    function pump() {
      while (Q.length && T >= busy) {
        const e = Q.shift();
        try { busy = T + handle(e); } catch (x) { console.error(x); }
      }
    }
    const isIdle = () => !Q.length && T >= busy && !fly.length;

    function drawHUD() {
      const P = L.P, x0 = P ? 56 : 66;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = `900 ${P ? 12 : 15}px ${FONT}`;
      ctx.fillText('Blinds ' + fmtK(D.sbA) + ' / ' + fmtK(D.bbA), x0, P ? 18 : 22);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `800 ${P ? 10 : 12}px ${FONT}`;
      let sub;
      const left = D.hpl ? D.hpl - ((D.hand - 1) % D.hpl) : 0;
      if (D.hpl && D.mode === 'sng') sub = P ? 'Lvl ' + (D.level + 1) + ' · ' + left + ' left' : 'Level ' + (D.level + 1) + ' · next in ' + left + (left === 1 ? ' hand' : ' hands');
      else if (D.mode === 'sng') sub = 'Fixed blinds';
      else sub = P ? 'Cash' + (D.limit ? ' · ' + D.hand + '/' + D.limit : '') : 'Cash game' + (D.limit ? ' · hand ' + D.hand + ' of ' + D.limit : '');
      ctx.fillText(sub, x0, P ? 33 : 40);
      ctx.textAlign = 'right';
      const alive = D.seats.filter(s => !s.out).length;
      ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = `900 ${P ? 12 : 15}px ${FONT}`;
      ctx.fillText('Hand #' + D.hand, W - 12, P ? 18 : 22);
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = `800 ${P ? 10 : 12}px ${FONT}`;
      ctx.fillText(D.mode === 'sng' ? alive + (alive === 1 ? ' player left' : ' players left') : D.n + ' players', W - 12, P ? 33 : 40);
    }
    function pill(x, y, w, h, fill, stroke) {
      rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    function potSpot(i) {
      const k = D.pots ? D.pots.length : 1;
      if (k < 2) return L.pot;
      const g = Math.min(L.P ? 66 : 100, (W - 40) / k);
      return { x: L.pot.x + (i - (k - 1) / 2) * g, y: L.pot.y - 8 };
    }
    function drawPots() {
      const P = L.P;
      D.pots.forEach((a, i) => {
        if (a <= 0) return;
        const sp = potSpot(i), win = i === D.awd && T - D.awdT < 2.2, py = sp.y + (P ? 10 : 12);
        drawPile(ctx, sp.x, sp.y - 7, a, P ? 7 : 9, 2);
        ctx.font = `900 ${P ? 11 : 13}px ${FONT}`;
        const t = fmtN(a), w = Math.max(P ? 46 : 58, ctx.measureText(t).width + 14);
        pill(sp.x, py, w, P ? 26 : 32, 'rgba(0,0,0,.58)', win ? '#ffd34a' : 'rgba(255,255,255,.2)');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = win ? '#ffd34a' : '#9fd9b4'; ctx.font = `900 ${P ? 7 : 8}px ${FONT}`; ctx.fillText(i ? 'SIDE ' + i : 'MAIN', sp.x, py - (P ? 6 : 7.5));
        ctx.fillStyle = '#fff'; ctx.font = `900 ${P ? 11 : 13}px ${FONT}`; ctx.fillText(t, sp.x, py + (P ? 4.5 : 5));
      });
    }
    function drawPot() {
      const total = potTotal();
      if (total <= 0) return;
      if (D.pots) return drawPots();
      const P = L.P, p = L.pot;
      ctx.font = `900 ${P ? 12 : 15}px ${FONT}`;
      const txt = 'Pot ' + fmtN(total), w = ctx.measureText(txt).width + 24;
      pill(p.x, p.y, w, P ? 22 : 28, 'rgba(0,0,0,.5)', 'rgba(255,255,255,.18)');
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, p.x, p.y + 1);
      if (D.pot > 0) drawPile(ctx, p.x - w / 2 - (P ? 16 : 22), p.y + (P ? 4 : 6), D.pot, P ? 8 : 11, 3);
    }
    function drawDeck() {
      const d = L.deck;
      for (let i = 0; i < 3; i++) card('S', -1, d.x - i * 1.4, d.y - i * 1.6, {});
    }
    function drawBoard() {
      for (let i = 0; i < 5; i++) {
        const sl = bslot(i), b = D.board[i], w = L.bw, h = w * 1.4;
        if (!b) {
          ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); rr(ctx, sl.x - w / 2, sl.y - h / 2, w, h, w * .1); ctx.stroke(); ctx.setLineDash([]);
        } else {
          const f = clamp((T - b.at) / .42, 0, 1), hl = D.hl;
          card('B', b.id, sl.x, sl.y, { flip: f, glow: hl && hl.has(b.id) ? .7 + .3 * Math.sin(T * 5) : 0, dim: !!hl && !hl.has(b.id) });
        }
      }
    }
    function drawBets() {
      D.seats.forEach((s, p) => {
        if (s.bet <= 0) return;
        const sp = betSpot(p), r = L.P ? 7.5 : 10;
        drawPile(ctx, sp.x, sp.y, s.bet, r, 3);
        ctx.font = `900 ${L.P ? 10 : 13}px ${FONT}`;
        const t = fmtK(s.bet), w = ctx.measureText(t).width + 12;
        pill(sp.x, sp.y + (L.P ? 14 : 19), w, L.P ? 15 : 19, 'rgba(0,0,0,.55)');
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, sp.x, sp.y + (L.P ? 15 : 20));
      });
    }
    const LBL = { 'Fold': ['#6c7385', '#fff'], 'Check': ['#2f9d57', '#fff'], 'Call': ['#2f7fd0', '#fff'], 'Bet': ['#e8912a', '#1a1204'], 'Raise': ['#e8912a', '#1a1204'], 'All-in': ['#d83a3a', '#fff'], 'Small blind': ['#3b6fd0', '#fff'], 'Big blind': ['#e8912a', '#1a1204'] };
    function fitText(t, w) {
      if (ctx.measureText(t).width <= w) return t;
      while (t.length > 2 && ctx.measureText(t + '…').width > w) t = t.slice(0, -1);
      return t + '…';
    }
    function drawSeat(p) {
      const S = D.seats[p], s = seatPos(p), r = rel(p), P = L.P, AR = L.AR * (r === 0 ? 1.06 : 1);
      const inH = S.in && !S.fold && D.hand > 0;
      const dim = S.out ? .38 : (D.hand > 0 && !S.in) ? .5 : S.fold ? .55 : 1;
      const x = s.x, y = s.y;
      if (r !== 0 && inH && S.land) {
        const showF = S.reveal;
        for (let i = 0; i < 2; i++) {
          if (i >= S.land) continue;
          if (showF) {
            const hp = { x: x + (i ? 1 : -1) * L.cw * .72, y: Math.max(L.cw * .98 + 4, y - AR - L.cw * .62), rot: (i ? 1 : -1) * .1 };
            const f = clamp((T - S.flipAt[i]) / .35, 0, 1);
            card('X', S.cards[i], hp.x, hp.y, { flip: f, rot: hp.rot, glow: D.hl && D.hl.has(S.cards[i]) ? .7 + .3 * Math.sin(T * 5) : 0, dim: !!D.hl && !D.hl.has(S.cards[i]) });
          } else { const hp = holePos(p, i); card('S', -1, hp.x, hp.y, { rot: hp.rot }); }
        }
      }
      ctx.save(); ctx.globalAlpha = dim;
      const pw = L.pw, ph = L.ph, py = y + AR + 12 + ph * .2;
      const turn = D.turn === p && scene === 'game', winning = S.win && T >= S.win && T < S.win + 4;
      if (turn || winning) { ctx.shadowColor = winning ? 'rgba(255,211,74,.9)' : 'rgba(255,255,255,.6)'; ctx.shadowBlur = 14 + 4 * Math.sin(T * 6); }
      rr(ctx, x - pw / 2, py - ph / 2, pw, ph, ph * .32);
      const pg = ctx.createLinearGradient(0, py - ph / 2, 0, py + ph / 2); pg.addColorStop(0, '#2c3140'); pg.addColorStop(1, '#14161d');
      ctx.fillStyle = pg; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 2; ctx.strokeStyle = winning ? '#ffd34a' : turn ? '#fff' : r === 0 ? '#59d98a' : 'rgba(255,255,255,.2)'; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lab = S.lastA && T - S.lastT < 1.9 && S.in && !S.out ? S.lastA : '';
      ctx.font = `800 ${P ? 10 : 13}px ${FONT}`;
      if (winning && S.tag) {
        ctx.fillStyle = '#ffd34a'; ctx.font = `900 ${P ? 9 : 12}px ${FONT}`; ctx.fillText(fitText(S.tag, pw - 8), x, py - ph * .2);
      } else if (lab && LBL[lab]) {
        const c = LBL[lab], tw = Math.min(pw - 10, ctx.measureText(lab).width + 14);
        pill(x, py - ph * .2, tw, ph * .42, c[0]); ctx.fillStyle = c[1]; ctx.font = `900 ${P ? 9 : 11}px ${FONT}`; ctx.fillText(lab, x, py - ph * .2 + .5);
      } else { ctx.fillStyle = '#fff'; ctx.fillText(fitText(r === 0 && M.role !== 'spec' ? 'You' : S.name, pw - 10), x, py - ph * .2); }
      ctx.font = `900 ${P ? 11 : 15}px ${FONT}`;
      if (S.out) { ctx.fillStyle = '#9aa0b0'; ctx.fillText(S.place ? ordinal(S.place) + ' place' : 'OUT', x, py + ph * .24); }
      else if (S.allin && S.stack === 0 && inH) { ctx.fillStyle = '#ff6a5a'; ctx.fillText('ALL-IN', x, py + ph * .24); }
      else { ctx.fillStyle = '#ffd34a'; ctx.fillText(fmtK(S.stack), x, py + ph * .24); }
      const av = avSpr(S.av);
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, AR, 0, TAU); ctx.clip();
      ctx.drawImage(av, x - AR, y - AR, AR * 2, AR * 2);
      if (S.out) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(x - AR, y - AR, AR * 2, AR * 2); }
      ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = winning ? '#ffd34a' : r === 0 ? '#59d98a' : 'rgba(255,255,255,.85)';
      ctx.beginPath(); ctx.arc(x, y, AR, 0, TAU); ctx.stroke();
      if (turn) {
        const frac = D.tm > 0 ? clamp(D.tleft / D.tm, 0, 1) : 1;
        ctx.lineWidth = 4; ctx.lineCap = 'round';
        if (D.tm > 0 && !S.bot) {
          ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x, y, AR + 5, 0, TAU); ctx.stroke();
          ctx.strokeStyle = frac > .5 ? '#59d98a' : frac > .25 ? '#ffd34a' : '#ff5a4a';
          ctx.beginPath(); ctx.arc(x, y, AR + 5, -Math.PI / 2, -Math.PI / 2 + TAU * frac); ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -T * 22;
          ctx.beginPath(); ctx.arc(x, y, AR + 5, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.lineCap = 'butt';
      }
      if (D.hand > 0 && S.in && !S.out) {
        const m = p === D.bb ? ['BB', '#e8912a', '#1a1204'] : p === D.sb && D.n > 2 ? ['SB', '#3b6fd0', '#fff'] : null;
        if (m) {
          const mx = x - AR * .85, my = y + AR * .72, mr = P ? 7 : 9;
          ctx.fillStyle = m[1]; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = m[2]; ctx.font = `900 ${P ? 7 : 9}px ${FONT}`; ctx.fillText(m[0], mx, my + .5);
        }
      }
      ctx.restore();
    }
    function drawHero() {
      const S = D.seats[viewer];
      if (!S || !S.in || S.fold || !S.land || D.hand < 1 || S.out) return;
      for (let i = 0; i < 2; i++) {
        if (i >= S.land) continue;
        const hp = holePos(viewer, i), id = S.cards[i], f = id >= 0 ? clamp((T - S.flipAt[i]) / .34, 0, 1) : 0;
        const hl = D.hl;
        card('H', id, hp.x, hp.y, { rot: hp.rot, flip: f, glow: hl && id >= 0 && hl.has(id) ? .7 + .3 * Math.sin(T * 5) : 0, dim: !!hl && id >= 0 && !hl.has(id) });
      }
      if (D.hint && S.land === 2) {
        const hp = holePos(viewer, 1), P = L.P;
        ctx.font = `900 ${P ? 10 : 13}px ${FONT}`;
        const w = ctx.measureText(D.hint).width + 18, sp = seatPos(viewer);
        const x = P ? sp.x - L.pw / 2 - w / 2 - 4 : Math.min(hp.x + L.hw * .5 + w / 2 + 4, W - w / 2 - 6), y = P ? sp.y + L.AR + 12 + L.ph * .2 : hp.y + L.hw * .45;
        pill(x, y, w, P ? 18 : 23, 'rgba(0,0,0,.62)', 'rgba(255,211,74,.55)');
        ctx.fillStyle = '#ffe9a0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(D.hint, x, y + .5);
      }
    }
    function drawButton() {
      const b = D.bpos;
      if (!b || D.hand < 1) return;
      const k = b.dur ? ease((T - b.t0) / b.dur) : 1;
      const x = lerp(b.fx, b.tx, k), y = lerp(b.fy, b.ty, k), r = L.P ? 10 : 13;
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 3, r, r * .85, 0, 0, TAU); ctx.fill();
      const g = ctx.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(1, '#cfd3dc');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8c93a6'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#1a1c24'; ctx.font = `900 ${r * 1.1}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('D', x, y + .5);
    }
    function drawFly() {
      for (let i = fly.length - 1; i >= 0; i--) {
        const f = fly[i], t = (T - f.t0) / f.dur;
        if (t < 0) continue;
        if (t >= 1) { fly.splice(i, 1); if (f.land) { try { f.land(); } catch (e) { console.error(e); } } continue; }
        const k = ease(t), x = lerp(f.x0, f.x1, k), y = lerp(f.y0, f.y1, k) - Math.sin(t * Math.PI) * (f.arc || 0);
        if (f.k === 'chip') {
          drawPile(ctx, x, y, Math.min(f.amt, 3000), L.P ? 7.5 : 10, 2);
        } else {
          card(f.cls, f.id, x, y, { rot: lerp(f.rot0, f.rot1, k), alpha: f.fade ? 1 - t : 1, flip: f.flip0 != null ? f.flip0 : undefined, sc: f.fade ? 1 - t * .3 : 1 });
        }
      }
    }
    function drawFx() {
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i], t = (T - f.t0) / f.dur;
        if (t >= 1) { fx.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = t < .7 ? 1 : 1 - (t - .7) / .3;
        ctx.font = `900 ${f.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(f.txt, f.x, f.y - t * 26);
        ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, f.y - t * 26); ctx.restore();
      }
      const b = D.banner;
      if (b) {
        const t = (T - b.t0) / b.dur;
        if (t >= 1) D.banner = null;
        else {
          const a = t < .15 ? t / .15 : t > .8 ? (1 - t) / .2 : 1, sc = 1 + (1 - Math.min(1, t * 6)) * .3;
          ctx.save(); ctx.globalAlpha = a; ctx.translate(L.cx, L.cy - (L.P ? 100 : 108)); ctx.scale(sc, sc);
          pill(0, 0, L.P ? 220 : 300, L.P ? 54 : 70, 'rgba(10,12,18,.82)', '#ffd34a');
          ctx.fillStyle = '#ffd34a'; ctx.font = `900 ${L.P ? 18 : 24}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.t, 0, L.P ? -8 : -11);
          ctx.fillStyle = '#fff'; ctx.font = `900 ${L.P ? 15 : 20}px ${FONT}`; ctx.fillText(b.s, 0, L.P ? 12 : 16);
          ctx.restore();
        }
      }
    }
    function drawTicker() {
      const P = L.P;
      ctx.textBaseline = 'middle';
      const n = P ? 1 : 4, lines = tickerL.filter(l => T - l.t0 < 14).slice(-n);
      lines.forEach((l, i) => {
        const age = T - l.t0, a = clamp(1 - (age - 8) / 6, 0, 1) * (P ? 1 : .55 + .45 * (i + 1) / lines.length);
        ctx.globalAlpha = a; ctx.textAlign = P ? 'center' : 'left';
        ctx.font = `${l.h ? 900 : 700} ${P ? 10.5 : 13}px ${FONT}`;
        const y = P ? 519 : H - 14 - (lines.length - 1 - i) * 17, x = P ? W / 2 : 14, mw = P ? W - 16 : 400;
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(l.t, x, y, mw);
        ctx.fillStyle = l.h ? '#ffd34a' : '#fff'; ctx.fillText(l.t, x, y, mw);
      });
      ctx.globalAlpha = 1;
    }
    function drawTitleArt() {
      const cx = L.cx, cy = L.cy - 150;
      [12, 11, 10, 9, 8].forEach((id, i) => {
        const o = i - 2, bob = Math.sin(T * 1.6 + i * .8) * 4;
        card('H', id, cx + o * (L.P ? 36 : 54), cy + Math.abs(o) * 9 + bob, { rot: o * .17, flip: 1 });
      });
      drawPile(ctx, cx - (L.P ? 100 : 170), cy + (L.P ? 60 : 70), 3600, L.P ? 11 : 15, 3);
      drawPile(ctx, cx + (L.P ? 100 : 170), cy + (L.P ? 60 : 70), 1750, L.P ? 11 : 15, 3);
    }

    function update(dt) {
      T += dt;
      for (let i = sched.length - 1; i >= 0; i--) if (T >= sched[i].t) { const s = sched.splice(i, 1)[0]; try { s.fn(); } catch (e) { console.error(e); } }
      if (D.turn >= 0 && D.tm > 0 && scene === 'game') {
        const was = Math.ceil(D.tleft);
        D.tleft -= dt;
        if (D.turn === viewer && Math.ceil(D.tleft) !== was && D.tleft > 0 && D.tleft <= 5) sfx('tick');
      }
    }
    function drawAll() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.drawImage(tableC, 0, 0, W, H);
      if (scene === 'title') { drawTitleArt(); return; }
      if (!D.seats.length) return;
      drawHUD(); drawPot(); drawDeck(); drawBoard(); drawBets();
      for (let p = 0; p < D.n; p++) if (rel(p) !== 0) drawSeat(p);
      drawSeat(viewer);
      drawButton(); drawHero(); drawFly(); drawFx(); drawTicker();
    }

    const prof = (sk, b) => ({ skill: sk, tight: b[1], aggr: b[2], bluff: b[3] });
    const isHuman = q => M.hum[q] && !M.bot[q];
    function summary() {
      const s = M.eng.s;
      return { stats: s.stats.map(x => ({ won: x.won, hands: x.hands, best: x.bestName, big: x.big })), stack: s.stack.slice(), buyins: s.buyins.slice(), buy: s.buyin, hands: s.hand };
    }
    function netAll(msg) {
      if (M.role !== 'host') return;
      M.pids.forEach((id, q) => { if (id && q !== viewer && isHuman(q)) api.net.sendTo(id, typeof msg === 'function' ? msg(q) : msg); });
    }
    function flush() {
      if (!M.eng) return;
      const es = M.eng.take();
      if (!es.length) return;
      for (const e of es) {
        if (e.k === 'turn' && !M.bot[e.p] && opt.timer > 0) e.tm = opt.timer;
        if (e.k === 'over') Object.assign(e, summary());
        Q.push(e);
      }
      netAll(q => ({ t: 'ev', es: es.map(e => M.eng.filt(e, q)) }));
    }
    function emitOver() {
      const e = Object.assign({ k: 'over', winner: -1, places: [], cash: true }, summary());
      M.eng.s.phase = 'over';
      Q.push(e);
      netAll({ t: 'ev', es: [e] });
    }
    function planBot(p) {
      if (!M.eng) return;
      const I = M.eng.info(p), pr = M.prof[p];
      let a;
      try { a = botDecide(I, pr, Math.random); } catch (x) { console.error(x); a = I.lg.check ? { k: 'check' } : { k: 'fold' }; }
      const big = a.k === 'allin' || (a.k === 'raise' && a.to >= I.lg.max * .6) || (a.k === 'fold' && !I.lg.check && I.lg.call > I.pot * .4);
      const th = (pr.skill === 0 ? rand(.5, 1.2) : rand(.4, 1)) + (big ? rand(.3, .8) : 0) + (I.street ? rand(0, .4) : 0);
      M.plan = { p, at: T + th * SPD(), a };
    }
    function botAct(p) {
      const e = M.eng, a = M.plan.a;
      M.plan = null;
      if (!e.act(p, a)) { const lg = e.legal(p); e.act(p, lg.check ? { k: 'check' } : { k: 'fold' }); }
      flush();
    }
    function timeoutAct(p) {
      const e = M.eng, lg = e.legal(p);
      D.tleft = 99;
      e.act(p, lg.check ? { k: 'check' } : { k: 'fold' });
      if (p === viewer) api.toast('Time is up');
      flush();
    }
    function control() {
      if (!M.eng || M.role === 'guest' || scene !== 'game' || M.over || !isIdle()) return;
      const e = M.eng, s = e.s;
      if (s.phase === 'bet' && s.turn >= 0) {
        const p = s.turn;
        if (M.bot[p]) { if (M.plan && M.plan.p === p && T >= M.plan.at) botAct(p); else if (!M.plan && D.turn === p) planBot(p); }
        else if (D.turn === p && D.tm > 0 && D.tleft <= (p === viewer ? 0 : -1.5)) timeoutAct(p);
        return;
      }
      if (s.phase === 'between' && T >= M.nextAt && !M.rebuyWait) afterHand();
    }
    function afterHand() {
      const e = M.eng, s = e.s;
      if (s.phase === 'over') return;
      if (M.mode === 'cash') {
        if (D.limit && s.hand >= D.limit) { emitOver(); return; }
        let need = false;
        for (let p = 0; p < s.n; p++) {
          if (s.stack[p] > 0) continue;
          if (p === viewer && M.role !== 'spec') need = true; else e.rebuy(p);
        }
        flush();
        if (need) { M.rebuyWait = true; showRebuy(); return; }
      }
      if (!e.startHand()) { flush(); return; }
      flush();
    }
    function doAct(a) {
      if (D.turn !== viewer || !D.lg) return false;
      const lg = D.lg;
      D.lg = null; pre = null;
      if (M.role === 'guest') { api.net.send({ t: 'act', a: { k: a.k, to: a.to } }); return true; }
      if (!M.eng.act(viewer, a)) { D.lg = lg; return false; }
      flush();
      return true;
    }

    function pickSkills(k) {
      if (opt.skill === 'Easy') return Array(k).fill(0);
      if (opt.skill === 'Normal') return Array(k).fill(1);
      if (opt.skill === 'Hard') return Array(k).fill(2);
      const base = [1, 0, 2, 1, 2, 0, 1].slice(0, k);
      while (base.length < k) base.push(1);
      return base.sort(() => Math.random() - .5);
    }
    function newGame(online) {
      M.tok++; M.over = false; M.res = null; M.plan = null; M.rebuyWait = false; M.myPlace = 0; M.nextAt = 0;
      const sng = opt.mode === 'sng';
      let n, hseat = [0], live = null;
      if (online) {
        live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
        if (!live.length) live = M.players.slice(0, 1);
        const k = Math.min(8, live.length);
        live = live.slice(0, k);
        n = Math.max(2, Math.min(8, M.bots ? Math.max(k, M.size || k) : k));
        hseat = live.map((x, i) => Math.round(i * n / k));
        M.pids = Array(n).fill(null); hseat.forEach((q, i) => { M.pids[q] = live[i].id; });
        M.role = 'host';
      } else { n = 1 + opt.bots; M.role = 'local'; M.pids = []; }
      M.mode = opt.mode;
      M.hum = Array(n).fill(false); M.bot = Array(n).fill(false); M.names = []; M.av = []; M.prof = [];
      const pool = BOTS.slice().sort(() => Math.random() - .5), sk = pickSkills(n);
      let bi = 0;
      for (let p = 0; p < n; p++) {
        const hi = hseat.indexOf(p);
        if (hi >= 0) { M.hum[p] = true; M.names[p] = online ? live[hi].name : 'You'; M.av[p] = p; }
        else { const b = pool[bi++ % pool.length]; M.bot[p] = true; M.names[p] = b[0]; M.av[p] = 8 + BOTS.indexOf(b); M.prof[p] = prof(sk[p], b); }
      }
      const bbC = STAKES[opt.stakes][1];
      const chips = sng ? opt.stack : opt.buyin * bbC;
      M.eng = Engine({ n, stacks: Array(n).fill(chips), mode: opt.mode, hpl: sng ? opt.lv : 0, blinds: sng ? null : STAKES[opt.stakes].slice(), buyin: chips });
      viewer = 0;
      Q.length = 0; fly.length = 0; fx.length = 0; sched.length = 0; tickerL.length = 0; busy = T; pre = null;
      resetD(n);
      D.mode = opt.mode; D.hpl = sng ? opt.lv : 0; D.limit = sng ? 0 : opt.hands; D.sbA = M.eng.s.sbA; D.bbA = M.eng.s.bbA;
      D.seats.forEach((s, p) => { s.stack = chips; });
      scene = 'game'; paused = false; hidePane();
      api.label('Chips'); api.score(chips);
      if (online) netAll(q => setupMsg(q));
      logH(sng ? 'Sit & Go · ' + n + ' players · ' + fmtN(chips) + ' chips' : 'Cash game · blinds ' + fmtN(STAKES[opt.stakes][0]) + '/' + fmtN(bbC), true);
      M.eng.startHand();
      flush();
    }
    function setupMsg(q) {
      return { t: 'setup', n: D.n, seat: q, names: M.names, av: M.av, bot: M.bot, mode: M.mode, hpl: D.hpl, limit: D.limit, sb: D.sbA, bb: D.bbA, chips: D.seats[0] ? M.eng.s.stack[q] : 0 };
    }
    function syncMsg(q) {
      return { t: 'ev', es: [], sync: 1, v: M.eng.view(q), tl: D.tleft, tm: D.tm };
    }
    function syncD(v, m) {
      Q.length = 0; fly.length = 0; fx.length = 0; sched.length = 0; busy = T;
      D.hand = v.hand; D.level = v.level; D.sbA = v.sbA; D.bbA = v.bbA; D.sb = v.sb; D.bb = v.bb; D.hl = null; pre = null;
      D.board = v.board.map(id => ({ id, at: -9 }));
      D.pot = v.pot; D.pots = v.sp && v.sp.length > 1 ? v.sp.slice() : null; D.awd = -1;
      const betting = v.phase === 'bet';
      D.turn = betting ? v.turn : -1; D.lg = betting ? v.lg : null; D.tm = m && m.tm || 0; D.tleft = m && m.tl || 0;
      D.live = betting;
      D.seats.forEach((s, p) => {
        const h = v.hole[p] && betting && !v.fold[p] ? v.hole[p] : null;
        Object.assign(s, { stack: v.stack[p], bet: v.bet[p], in: v.in[p], fold: v.fold[p], allin: v.allin[p], out: v.out[p], place: v.places[p] || 0, cards: h ? h.slice() : [-1, -1], land: h ? 2 : 0, flipAt: h ? [0, 0] : [Infinity, Infinity], reveal: !!h && p !== viewer && h[0] >= 0, lastA: '', win: 0, tag: '' });
      });
      if (v.button >= 0) moveButton(v.button, true);
      updHint(); setScore();
    }
    function seatToBot(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng) return;
      const b = BOTS[(Math.random() * BOTS.length) | 0];
      M.pids[q] = null; M.hum[q] = false; M.bot[q] = true; M.prof[q] = prof(1, b);
      M.names[q] = M.names[q] + ' (bot)';
      D.seats[q].bot = true; D.seats[q].name = M.names[q];
      netAll({ t: 'seats', bot: M.bot, names: M.names });
      api.toast(M.names[q].replace(' (bot)', '') + ' left. A bot takes the seat.');
      logH(M.names[q].replace(' (bot)', '') + ' left the table', false);
      if (M.eng.s.phase === 'bet' && M.eng.s.turn === q && D.turn === q) planBot(q);
    }
    function sendSync(id) {
      if (M.role !== 'host' || !M.eng) return;
      const q = M.pids.indexOf(id);
      if (q < 0 || !isHuman(q)) return;
      api.net.sendTo(id, setupMsg(q));
      api.net.sendTo(id, syncMsg(q));
    }
    function leaveOnline() {
      M.tok++; M.role = 'local'; M.eng = null; M.pids = []; M.players = [];
      api.net.close(); showTitle();
    }
    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.online && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => { if (M.online && M.role === 'host' && p) sendSync(p.id); });
      api.net.on('lobby', () => { if (M.online && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (!M.online || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; paused = true; Q.length = 0; M.over = true;
        sfx('lose');
        const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const t = reason === 'kicked' ? 'The host removed you from the table.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        showPane('left', `<div class="pk-box"><p class="pk-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="pk-big green" data-a="room">Online lobby</button><button class="pk-big blue" data-a="solo">Play offline</button></div>`, a => {
          paused = false;
          if (a === 'room') startOnline(); else { api.net.close(); M.online = false; showTitle(); }
        });
      });
      api.interval(() => {
        if (!M.online || scene !== 'game') { netEl.hidden = true; return; }
        netEl.hidden = false;
        const on = api.net.connected, hn = M.pids.filter((id, q) => id && q !== viewer && isHuman(q)).length;
        netEl.classList.toggle('bad', !on);
        netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.role === 'host' ? 'Online · ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
      }, 1000);
    }
    async function startOnline() {
      M.tok++; const tok = M.tok;
      hookNet();
      hidePane(); scene = 'title'; paused = false; Q.length = 0; fly.length = 0; fx.length = 0; M.over = false;
      M.online = true; M.role = null; M.eng = null; netEl.hidden = true; ctl.hidden = true;
      const r = await api.net.room({ title: "Texas Hold'em Poker", sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 6, min: 2, max: 8, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.online = false; M.role = 'local'; return showTitle(); }
      M.role = r.role; M.players = r.players.slice(0, 8); M.bots = !!r.bots; M.size = +r.size || r.players.length;
      if (r.role === 'host') newGame(true);
      else showPane('wait', `<div class="pk-box"><p class="pk-kick">Online</p><h3>Connected</h3><p>Waiting for the host to deal…</p><div class="pk-row"><button class="pk-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || !M.online) return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === viewer || !isHuman(q)) return;
        if (d.t === 'act' && d.a && typeof d.a === 'object') {
          const a = { k: String(d.a.k), to: +d.a.to };
          if (M.eng.act(q, a)) flush(); else api.net.sendTo(from, syncMsg(q));
        }
      } else if (d.t === 'setup') {
        M.tok++; M.online = true; M.role = 'guest'; M.over = false; viewer = d.seat; M.mode = d.mode;
        M.names = d.names; M.av = d.av; M.bot = d.bot; M.hum = []; M.pids = [];
        Q.length = 0; fly.length = 0; fx.length = 0; sched.length = 0; tickerL.length = 0; busy = T; pre = null;
        resetD(d.n);
        D.mode = d.mode; D.hpl = d.hpl; D.limit = d.limit; D.sbA = d.sb; D.bbA = d.bb;
        D.seats.forEach(s => { s.stack = d.chips; });
        scene = 'game'; paused = false; hidePane(); api.label('Chips'); api.score(d.chips);
      } else if (M.role !== 'guest') return;
      else if (d.t === 'ev') {
        if (d.sync) syncD(d.v, d); else Q.push(...d.es);
      } else if (d.t === 'seats') {
        M.bot = d.bot; M.names = d.names;
        D.seats.forEach((s, p) => { s.bot = !!d.bot[p]; s.name = d.names[p]; });
      }
    }

    function showEnd(e) {
      M.over = true;
      const n = D.n, me = viewer, cash = !!e.cash || M.mode === 'cash';
      let rows = [];
      for (let p = 0; p < n; p++) {
        const st = e.stats ? e.stats[p] : { won: 0, hands: 0, best: '', big: 0 };
        const net = e.stack ? e.stack[p] - e.buyins[p] * e.buy : 0;
        rows.push({ p, st, net, place: e.places && e.places[p] || 0, chips: e.stack ? e.stack[p] : 0 });
      }
      rows.sort((a, b) => cash ? b.net - a.net : (a.place || 99) - (b.place || 99));
      const mine = rows.find(r => r.p === me), rank = rows.indexOf(mine) + 1;
      const won = !cash && mine && mine.place === 1;
      let head, sub;
      if (cash) {
        head = mine && mine.net >= 0 ? 'You finished ahead' : 'Session over';
        sub = e.hands + (e.hands === 1 ? ' hand' : ' hands') + ' played · you ' + (mine && mine.net >= 0 ? 'won ' : 'lost ') + fmtN(Math.abs(mine ? mine.net : 0)) + ' chips';
      } else { head = won ? 'You win the table!' : 'You finished ' + ordinal(mine ? mine.place : n); sub = e.hands + (e.hands === 1 ? ' hand' : ' hands') + ' played'; }
      if (won) sfx('win');
      const pts = !cash && mine ? (n - mine.place) * 100 + (won ? 100 : 0) : 0;
      if (M.role === 'local' && pts > 0) api.submit(pts);
      const body = rows.map((r, i) => `<tr class="${r.p === me ? 'me' : ''}"><td>${cash ? i + 1 : ordinal(r.place || n)}</td><td>${esc(D.seats[r.p].name)}</td><td>${cash ? (r.net >= 0 ? '+' : '−') + fmtN(Math.abs(r.net)) : fmtN(r.st.big)}</td><td>${esc(r.st.best || '—')}</td></tr>`).join('');
      const btns = M.role === 'local'
        ? `<button class="pk-big green" data-a="again">Play again</button><div class="pk-row"><button class="pk-sm" data-a="menu">Main menu</button></div>`
        : M.role === 'host'
          ? `<button class="pk-big green" data-a="again">Rematch</button><div class="pk-row"><button class="pk-sm" data-a="lobby">Back to lobby</button><button class="pk-sm" data-a="leave">Leave</button></div>`
          : `<p>Waiting for the host to start a rematch…</p><div class="pk-row"><button class="pk-sm" data-a="lobby">Back to lobby</button><button class="pk-sm" data-a="leave">Leave</button></div>`;
      showPane('end', `<div class="pk-box wide"><p class="pk-kick">${cash ? 'Cash game' : 'Sit & Go'}</p><h3>${head}</h3><p>${sub}${pts ? ' · ' + pts + ' pts' : ''}</p><div class="pk-tw"><table class="pk-tbl"><tr><th></th><th>Player</th><th>${cash ? 'Net' : 'Biggest pot'}</th><th>Best hand</th></tr>${body}</table></div>${btns}</div>`, a => {
        if (a === 'again') { if (M.role === 'host') newGame(true); else newGame(false); }
        else if (a === 'menu') showTitle();
        else if (a === 'lobby') startOnline();
        else if (a === 'leave') leaveOnline();
      }, 'dim');
    }
    function showBust(place) {
      const n = D.n;
      const btns = M.role === 'local'
        ? `<button class="pk-big blue" data-a="watch">Keep watching</button><button class="pk-big green" data-a="again">New game</button><div class="pk-row"><button class="pk-sm" data-a="menu">Main menu</button></div>`
        : `<button class="pk-big blue" data-a="watch">Keep watching</button><div class="pk-row"><button class="pk-sm" data-a="leave">Leave</button></div>`;
      showPane('bust', `<div class="pk-box"><p class="pk-kick">Eliminated</p><h3>You finished ${ordinal(place)}</h3><p>${place} of ${n} players.</p>${btns}</div>`, a => {
        if (a === 'watch') hidePane();
        else if (a === 'again') newGame(false);
        else if (a === 'menu') showTitle();
        else if (a === 'leave') leaveOnline();
      });
    }
    function showRebuy() {
      const amt = M.eng.s.buyin;
      showPane('rebuy', `<div class="pk-box"><p class="pk-kick">Cash game</p><h3>Out of chips</h3><p>Buy back in for ${fmtN(amt)} chips?</p><button class="pk-big green" data-a="rebuy">Rebuy ${fmtN(amt)}</button><div class="pk-row"><button class="pk-sm" data-a="leave">Leave table</button></div></div>`, a => {
        M.rebuyWait = false; hidePane();
        if (a === 'rebuy') { M.eng.rebuy(viewer); flush(); M.nextAt = T + .3; }
        else if (M.role === 'local') emitOver();
        else leaveOnline();
      });
    }

    let paneFn = null;
    function showPane(kind, html, fn, cls) {
      const same = !pane.hidden && pane.dataset.k === kind;
      pane.className = 'pk-pane' + (cls ? ' ' + cls : '');
      pane.dataset.k = kind; pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0;
      if (same) { const bx = pane.querySelector('.pk-box'); if (bx) bx.style.animation = 'none'; }
      paneFn = fn; ctlSig = '';
    }
    function hidePane() { pane.hidden = true; pane.innerHTML = ''; pane.dataset.k = ''; paneFn = null; ctlSig = ''; }
    api.on(pane, 'click', e => {
      const b = e.target.closest('[data-a]');
      if (!b || !paneFn || !api.alive) return;
      sfx('tap'); audio();
      paneFn(b.dataset.a, b);
    });

    const seg = (k, vals, labels) => `<div class="pk-seg" data-k="${k}">${vals.map((v, i) => `<button data-a="seg" data-v="${v}" class="${String(opt[k]) === String(v) ? 'on' : ''}">${labels ? labels[i] : v}</button>`).join('')}</div>`;
    const orow = (t, s, c) => `<div class="pk-opt"><span>${t}${s ? `<small>${s}</small>` : ''}</span>${c}</div>`;
    function segClick(b) {
      const k = b.parentNode.dataset.k, cur = opt[k], raw = b.dataset.v;
      opt[k] = typeof cur === 'number' ? +raw : typeof cur === 'boolean' ? raw === 'true' : raw;
      saveOpt();
      if (k === 'felt') feltBG();
      if (k === 'four') CS = null;
      return k;
    }
    const sumLine = () => {
      const sng = opt.mode === 'sng';
      return (sng ? 'Sit & Go' : 'Cash game') + ' · ' + (opt.bots + 1) + ' players · ' + opt.skill + ' bots · ' + (sng ? fmtN(opt.stack) + ' chips' : fmtN(STAKES[opt.stakes][0]) + '/' + fmtN(STAKES[opt.stakes][1]) + ' blinds');
    };
    function showTitle() {
      scene = 'title'; paused = false; M.online = false; M.role = 'local'; M.eng = null; M.over = false; M.tok++;
      Q.length = 0; fly.length = 0; fx.length = 0; sched.length = 0; resetD(2); D.seats = [];
      netEl.hidden = true; ctl.hidden = true; api.score('—'); api.label('Chips');
      showPane('title', `<div class="pk-box tbox"><div class="pk-logo"><span>TEXAS</span><b>HOLD'EM</b><small>POKER</small></div><p class="pk-sum">${sumLine()}</p><button class="pk-big green" data-a="play">Play</button><button class="pk-big blue" data-a="online">Play online</button><div class="pk-row"><button class="pk-sm" data-a="setup">Game setup</button><button class="pk-sm" data-a="help">How to play</button></div></div>`, a => {
        if (a === 'play') newGame(false);
        else if (a === 'online') startOnline();
        else if (a === 'setup') setupPane();
        else if (a === 'help') helpPane();
      }, 'low');
    }
    const back = () => { if (scene === 'game') menu(); else showTitle(); };
    function setupPane() {
      const game = scene !== 'game', sng = opt.mode === 'sng';
      const tbl = `<p class="pk-sec">Table</p>`
        + orow('Turn timer', 'Auto-fold when it runs out', seg('timer', [0, 15, 30, 60], ['Off', '15s', '30s', '60s']))
        + orow('Felt', '', seg('felt', ['green', 'blue', 'red', 'purple'], ['Green', 'Blue', 'Red', 'Purple']))
        + orow('Cards', 'Four colour suits are easier to read', seg('four', ['false', 'true'], ['Classic', '4 colours']))
        + orow('Dealing', '', seg('fast', ['false', 'true'], ['Normal', 'Fast']))
        + orow('Hand hint', 'Shows your current hand', seg('hint', ['true', 'false'], ['On', 'Off']));
      const gm = game ? `<p class="pk-sec">Game</p>`
        + orow('Format', '', seg('mode', ['sng', 'cash'], ['Sit & Go', 'Cash game']))
        + orow('Opponents', 'Online: set by the party size', seg('bots', [1, 2, 3, 4, 5, 6, 7]))
        + orow('Bot skill', 'Mixed seats a range of styles', seg('skill', ['Easy', 'Normal', 'Hard', 'Mixed']))
        + (sng
          ? orow('Starting chips', '', seg('stack', [1000, 1500, 3000, 5000], ['1,000', '1,500', '3,000', '5,000']))
            + orow('Blind levels', 'Hands per level', seg('lv', [0, 12, 8, 4], ['Fixed', 'Slow', 'Normal', 'Turbo']))
          : orow('Stakes', 'Small / big blind', seg('stakes', [0, 1, 2, 3], STAKES.map(s => s[0] + '/' + s[1])))
            + orow('Buy-in', 'In big blinds', seg('buyin', [50, 100, 200], ['50 BB', '100 BB', '200 BB']))
            + orow('Session length', 'Hands to play', seg('hands', [25, 50, 100, 0], ['25', '50', '100', '∞']))) : '';
      showPane('setup', `<div class="pk-box wide"><p class="pk-kick">${game ? 'Game setup' : 'Table settings'}</p>${gm}${tbl}<button class="pk-big green" data-a="back">${game ? 'Done' : 'Back'}</button></div>`, (a, b) => {
        if (a === 'back') { back(); return; }
        if (a === 'seg') { const k = segClick(b); const st = pane.scrollTop; setupPane(); pane.scrollTop = st; if (k === 'hint') updHint(); }
      }, 'scroll');
    }
    function helpPane() {
      const S = ['<i class="b">♠</i>', '<i class="r">♥</i>', '<i class="r">♦</i>', '<i class="b">♣</i>'];
      const hands = [['Royal Flush', 'A K Q J 10, one suit'], ['Straight Flush', 'Five in a row, one suit'], ['Four of a Kind', 'Four cards of one rank'], ['Full House', 'Three of a kind plus a pair'], ['Flush', 'Five cards of one suit'], ['Straight', 'Five in a row'], ['Three of a Kind', 'Three cards of one rank'], ['Two Pair', 'Two different pairs'], ['One Pair', 'Two cards of one rank'], ['High Card', 'Nothing else; highest card plays']];
      showPane('help', `<div class="pk-box wide pk-help"><p class="pk-kick">How to play</p><h3>Texas Hold'em</h3>
<p>Each player gets two private cards. Five shared cards come face up: the flop (3), the turn and the river. Make the best five-card hand from any of the seven, or make everyone else fold.</p>
<p>The dealer button moves left each hand. The two players after it post the small and big blind. Betting runs preflop, on the flop, the turn and the river. You can fold, check (if nobody bet), call, or bet and raise. A raise must be at least the size of the last bet or raise. If you cannot cover a bet you can go all-in; the extra chips go into side pots that you cannot win.</p>
<p><b>Sit &amp; Go:</b> everyone starts with the same chips and the blinds go up on a schedule. Last player standing wins. <b>Cash game:</b> fixed blinds, rebuy when you bust, play a set number of hands.</p>
<p class="pk-sec">Hand ranking, best first</p>
<ol class="pk-rank">${hands.map(h => `<li><b>${h[0]}</b><span>${h[1]}</span></li>`).join('')}</ol>
<p>Ties are broken by the highest kickers. Equal hands split the pot.</p>
<p class="pk-sec">Controls</p>
<p><kbd>F</kbd> fold · <kbd>C</kbd> check or call · <kbd>R</kbd> or <kbd>Enter</kbd> bet or raise · <kbd>A</kbd> all-in · <kbd>&uarr;</kbd><kbd>&darr;</kbd> change the bet · <kbd>1</kbd>-<kbd>4</kbd> &frac12; pot, &frac34; pot, pot, all-in · <kbd>H</kbd> hand history · <kbd>M</kbd> menu. On a phone, tap the buttons and drag the slider. Tick Check/Fold or Call any to act in advance.</p>
<button class="pk-big green" data-a="back">Back</button></div>`, a => { if (a === 'back') back(); }, 'scroll');
    }
    function histPane() {
      const rows = D.hist.slice(-160).map(h => `<p class="${h.h ? 'hd' : ''}">${esc(h.t)}</p>`).join('') || '<p>No hands played yet.</p>';
      showPane('hist', `<div class="pk-box wide"><p class="pk-kick">Hand history</p><div class="pk-hl">${rows}</div><button class="pk-big green" data-a="back">Back</button></div>`, a => { if (a === 'back') back(); }, 'scroll');
      const hl = pane.querySelector('.pk-hl'); if (hl) hl.scrollTop = hl.scrollHeight;
    }
    function menu() {
      if (M.role === 'local') paused = true;
      showPane('menu', `<div class="pk-box"><p class="pk-kick">Menu</p><h3>${M.role === 'local' ? 'Paused' : 'Table menu'}</h3><button class="pk-big green" data-a="resume">Resume</button><button class="pk-big blue" data-a="hist">Hand history</button><div class="pk-row"><button class="pk-sm" data-a="set">Table settings</button><button class="pk-sm" data-a="help">How to play</button></div><button class="pk-big red" data-a="leave">${M.role === 'local' ? 'Leave table' : 'Leave game'}</button></div>`, a => {
        if (a === 'resume') { paused = false; hidePane(); }
        else if (a === 'hist') histPane();
        else if (a === 'set') setupPane();
        else if (a === 'help') helpPane();
        else if (a === 'leave') { if (M.role === 'local') { if (M.mode === 'cash' && M.eng && M.eng.s.hand > 0) { paused = false; hidePane(); emitOver(); } else showTitle(); } else leaveOnline(); }
      });
    }
    function showHist() { if (M.role === 'local') paused = true; histPane(); }
    api.on(bMenu, 'click', () => { sfx('tap'); audio(); menu(); });
    api.on(bHist, 'click', () => { sfx('tap'); showHist(); });

    let sel = 0, lgKey = '';
    const snap = v => {
      const lg = D.lg; if (!lg) return v;
      const u = lg.unit;
      v = Math.round(v / u) * u;
      if (v >= lg.max - u / 2) v = lg.max;
      return clamp(v, Math.min(lg.min, lg.max), lg.max);
    };
    function setSel(v) {
      const lg = D.lg; if (!lg) return;
      sel = snap(v);
      rng.value = sel;
      if (document.activeElement !== amt) amt.value = sel;
      bRaise.innerHTML = (sel >= lg.max ? 'All-in' : lg.cur === 0 ? 'Bet' : 'Raise to') + '<small>' + fmtN(sel) + '</small>';
    }
    function rebuildAct() {
      const lg = D.lg, S = D.seats[viewer];
      bFold.disabled = lg.check;
      bCall.innerHTML = lg.check ? 'Check' : 'Call<small>' + fmtN(lg.call) + (lg.call >= S.stack ? ' · all-in' : '') + '</small>';
      const fixed = lg.min >= lg.max;
      bRaise.hidden = !lg.raise;
      ctlAct.classList.toggle('noraise', !lg.raise);
      ctlAct.querySelector('.pk-q').hidden = !lg.raise || fixed;
      ctlAct.querySelector('.pk-sl').hidden = !lg.raise || fixed;
      rng.min = lg.min; rng.max = lg.max; rng.step = 1;
      const key = [lg.call, lg.min, lg.max, lg.pot].join(',');
      if (key !== lgKey) { lgKey = key; sel = lg.min; }
      setSel(sel);
    }
    function syncCtl() {
      const g = scene === 'game' && pane.hidden;
      bMenu.hidden = bHist.hidden = !g;
      const S = D.seats[viewer];
      const inHand = g && D.live && S && S.in && !S.fold && !S.out && S.land >= 2;
      const myTurn = !!inHand && D.turn === viewer && !!D.lg;
      const canPre = !!inHand && !myTurn && !S.allin;
      let wt = '';
      if (g && S && !myTurn && !canPre && D.live && S.in && !S.out) wt = S.fold ? 'You folded' : S.allin ? 'You are all-in' : '';
      const lg = D.lg;
      const sig = [g, myTurn, canPre, wt, pre, lg ? [lg.call, lg.min, lg.max, lg.raise, lg.check, lg.pot].join() : '', S ? S.stack : 0].join('|');
      if (sig === ctlSig) return;
      ctlSig = sig;
      ctl.hidden = !(myTurn || canPre || wt);
      ctlAct.hidden = !myTurn; ctlPre.hidden = !canPre; ctlWait.hidden = !wt; ctlWait.textContent = wt;
      if (canPre) ctlPre.querySelectorAll('input').forEach(i => { i.checked = pre === i.dataset.p; });
      if (myTurn) rebuildAct();
    }
    const qval = f => {
      const lg = D.lg;
      return f === 'min' ? lg.min : f === 'max' ? lg.max : lg.cur + (+f) * (lg.pot + lg.call);
    };
    ctlPre.querySelectorAll('input').forEach(i => api.on(i, 'change', () => {
      pre = i.checked ? i.dataset.p : null; sfx('tap');
      ctlPre.querySelectorAll('input').forEach(o => { if (o !== i) o.checked = false; });
    }));
    api.on(ctlAct, 'click', e => {
      const b = e.target.closest('button');
      if (!b || b.disabled || !D.lg) return;
      audio();
      if (b.dataset.q) { setSel(qval(b.dataset.q)); sfx('tap'); return; }
      if (b.dataset.s) { const u = D.lg.unit * (e.shiftKey ? 10 : 1); setSel(sel + (b.dataset.s === '+' ? u : -u)); sfx('tap'); return; }
      const c = b.dataset.c;
      if (c === 'fold') doAct({ k: 'fold' });
      else if (c === 'call') doAct({ k: D.lg.check ? 'check' : 'call' });
      else if (c === 'raise') doAct(sel >= D.lg.max ? { k: 'allin' } : { k: 'raise', to: sel });
    });
    api.on(rng, 'input', () => { setSel(+rng.value); });
    api.on(rng, 'change', () => rng.blur());
    const applyAmt = () => { const v = parseFloat(String(amt.value).replace(/[^\d.]/g, '')); if (isFinite(v) && D.lg) setSel(v); else setSel(sel); };
    api.on(amt, 'change', applyAmt);
    api.on(amt, 'focus', () => { try { amt.select(); } catch (e) {} });
    api.on(amt, 'blur', () => { if (D.lg) amt.value = sel; });
    api.on(window, 'keydown', e => {
      const t = e.target;
      if (t === amt) { if (e.key === 'Enter') { e.preventDefault(); applyAmt(); amt.blur(); } return; }
      if (t && t.closest && t.closest('textarea,select')) return;
      if (e.ctrlKey || e.metaKey || e.altKey || scene !== 'game') return;
      const k = (e.key || '').toLowerCase();
      if (!pane.hidden) return;
      if (k === 'm') { e.preventDefault(); menu(); return; }
      if (k === 'h') { e.preventDefault(); showHist(); return; }
      if (D.turn !== viewer || !D.lg || ctlAct.hidden) return;
      const lg = D.lg;
      if (k === 'f') { e.preventDefault(); if (!lg.check) doAct({ k: 'fold' }); }
      else if (k === 'c' || k === ' ') { e.preventDefault(); doAct({ k: lg.check ? 'check' : 'call' }); }
      else if (k === 'r' || k === 'enter') { e.preventDefault(); if (lg.raise) doAct(sel >= lg.max ? { k: 'allin' } : { k: 'raise', to: sel }); }
      else if (k === 'a') { e.preventDefault(); if (lg.raise) doAct({ k: 'allin' }); else doAct({ k: lg.check ? 'check' : 'call' }); }
      else if (k === 'arrowup' || k === 'arrowright') { e.preventDefault(); if (lg.raise) setSel(sel + lg.unit * (e.shiftKey ? 10 : 1)); }
      else if (k === 'arrowdown' || k === 'arrowleft') { e.preventDefault(); if (lg.raise) setSel(sel - lg.unit * (e.shiftKey ? 10 : 1)); }
      else if (k >= '1' && k <= '4' && lg.raise) { e.preventDefault(); setSel(qval(['.5', '.75', '1', 'max'][+k - 1])); }
    });

    let lastRW = 0;
    function setU() { wrap.style.setProperty('--u', clamp(wrap.clientWidth / W, .62, 1.4).toFixed(3)); }
    api.on(window, 'resize', () => { fit(false); setU(); });
    api.loop(dt => {
      const rw = root.clientWidth;
      if (rw !== lastRW) { lastRW = rw; fit(false); setU(); }
      if (!paused) { update(dt); pump(); control(); }
      drawAll();
      syncCtl();
    });
    fit(true); setU();
    if (document.fonts && document.fonts.load) document.fonts.load(`900 40px ${FONT}`).then(() => { if (api.alive) { CS = null; AVS = null; feltBG(); } }, () => {});
    root._pk = { M, D, Q, opt, get viewer() { return viewer; }, get scene() { return scene; }, doAct, eng: () => M.eng, idle: isIdle, fly, T: () => T, pane: () => pane.hidden ? '' : pane.dataset.k, newGame, showTitle, startOnline, planBot, setSel, get paused() { return paused; } };
    if (api.net.invite) startOnline(); else showTitle();
    return { destroy() { M.tok++; try { if (ac) ac.close(); } catch (e) {} } };
  }

  Ameplay.register({
    id: 'poker',
    title: "Texas Hold'em Poker",
    category: 'Board',
    tint: '#1b7a45',
    blurb: "No-limit Texas Hold'em at a real poker table: blinds, side pots, bluffs and all-ins against bots of every skill, or online with up to 8 players.",
    help: '<kbd>F</kbd> fold · <kbd>C</kbd> check / call · <kbd>R</kbd> or <kbd>Enter</kbd> bet / raise · <kbd>A</kbd> all-in · <kbd>&uarr;</kbd><kbd>&darr;</kbd> bet size · <kbd>1</kbd>-<kbd>4</kbd> quick bets · <kbd>H</kbd> history · <kbd>M</kbd> menu',
    width: 960,
    better: 'high',
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="12" width="24" height="34" rx="4" transform="rotate(-12 21 29)"/><rect x="29" y="12" width="24" height="34" rx="4" transform="rotate(10 41 29)"/><ellipse cx="32" cy="50" rx="13" ry="5"/><path d="M19 50v4c0 2.8 5.8 5 13 5s13-2.2 13-5v-4"/></svg>',
    _t: { score, describe, best5, Engine, botDecide, chen, equity },
    css: `
.gm-poker{gap:0}
.gm-poker [hidden]{display:none!important}
.gm-poker .pk-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(8,30,18,.32);touch-action:manipulation;background:#0b0d12;-webkit-user-select:none;user-select:none}
.gm-poker .pk-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-poker .pk-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff}
.gm-poker .pk-ui button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-poker .pk-ico{position:absolute;left:calc(var(--u,1)*10px);top:calc(var(--u,1)*10px);width:calc(var(--u,1)*40px);height:calc(var(--u,1)*40px);border-radius:calc(var(--u,1)*13px);border:2px solid rgba(255,255,255,.22);background:rgba(0,0,0,.35);color:#fff;display:grid;place-items:center;padding:0}
.gm-poker .pk-ico svg{width:55%;height:55%}
.gm-poker .pk-ico:hover{background:rgba(0,0,0,.55)}
.gm-poker .pk-hist{left:auto;right:calc(var(--u,1)*10px);top:calc(var(--u,1)*54px);width:calc(var(--u,1)*34px);height:calc(var(--u,1)*34px);border-radius:calc(var(--u,1)*11px)}
.gm-poker .pk-port .pk-hist{top:calc(var(--u,1)*44px)}
.gm-poker .pk-net{position:absolute;left:50%;top:calc(var(--u,1)*8px);transform:translateX(-50%);display:flex;align-items:center;gap:6px;padding:3px 10px;border-radius:12px;background:rgba(0,0,0,.4);font:800 calc(var(--u,1)*11px) var(--sans);white-space:nowrap}
.gm-poker .pk-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-poker .pk-net.bad i{background:#ff5b4b}
.gm-poker .pk-ctl{position:absolute;right:calc(var(--u,1)*66px);bottom:calc(var(--u,1)*8px);width:calc(var(--u,1)*330px);display:flex;flex-direction:column;gap:calc(var(--u,1)*4px)}
.gm-poker .pk-port .pk-ctl{left:calc(var(--u,1)*8px);right:calc(var(--u,1)*8px);bottom:calc(var(--u,1)*6px);width:auto}
.gm-poker .pk-act{display:flex;flex-direction:column;gap:calc(var(--u,1)*4px)}
.gm-poker .pk-q{display:flex;gap:calc(var(--u,1)*4px)}
.gm-poker .pk-q button{flex:1;height:calc(var(--u,1)*25px);padding:0 2px;border-radius:calc(var(--u,1)*9px);border:1.5px solid rgba(255,255,255,.28);background:rgba(10,14,22,.78);color:#fff;font:800 calc(var(--u,1)*11px) var(--sans);white-space:nowrap}
.gm-poker .pk-q button:hover{background:rgba(40,52,78,.92)}
.gm-poker .pk-q button:active{transform:translateY(1px)}
.gm-poker .pk-sl{display:flex;align-items:center;gap:calc(var(--u,1)*6px);height:calc(var(--u,1)*30px);padding:0 calc(var(--u,1)*6px);border-radius:calc(var(--u,1)*15px);background:rgba(10,14,22,.78);border:1.5px solid rgba(255,255,255,.2)}
.gm-poker .pk-sl button{flex:0 0 auto;width:calc(var(--u,1)*24px);height:calc(var(--u,1)*24px);border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font:900 calc(var(--u,1)*16px)/1 var(--sans);padding:0}
.gm-poker .pk-amt{flex:0 0 auto;width:calc(var(--u,1)*70px);height:calc(var(--u,1)*22px);border-radius:calc(var(--u,1)*8px);border:1.5px solid rgba(255,255,255,.25);background:rgba(0,0,0,.45);color:#ffe9a0;font:900 calc(var(--u,1)*13px) var(--sans);text-align:center;padding:0;pointer-events:auto;min-width:0}
.gm-poker .pk-rng{flex:1;min-width:0;height:calc(var(--u,1)*22px);margin:0;pointer-events:auto;-webkit-appearance:none;appearance:none;background:transparent;touch-action:pan-y}
.gm-poker .pk-rng::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(90deg,#ffd34a,#e8912a)}
.gm-poker .pk-rng::-moz-range-track{height:6px;border-radius:3px;background:linear-gradient(90deg,#ffd34a,#e8912a)}
.gm-poker .pk-rng::-webkit-slider-thumb{-webkit-appearance:none;width:calc(var(--u,1)*20px);height:calc(var(--u,1)*20px);margin-top:calc(var(--u,1)*-7px);border-radius:50%;background:#fff;border:3px solid #e8912a;box-shadow:0 2px 6px rgba(0,0,0,.5)}
.gm-poker .pk-rng::-moz-range-thumb{width:calc(var(--u,1)*14px);height:calc(var(--u,1)*14px);border-radius:50%;background:#fff;border:3px solid #e8912a}
.gm-poker .pk-btns{display:flex;gap:calc(var(--u,1)*6px)}
.gm-poker .pk-b{flex:1;height:calc(var(--u,1)*46px);border-radius:calc(var(--u,1)*14px);border:2px solid rgba(255,255,255,.35);color:#fff;font:900 calc(var(--u,1)*17px)/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.3);box-shadow:inset 0 -5px 0 rgba(0,0,0,.25),0 4px 10px rgba(0,0,0,.4);padding:0 4px}
.gm-poker .pk-b small{display:block;font:800 calc(var(--u,1)*12px) var(--sans);opacity:.92;margin-top:1px;text-shadow:none}
.gm-poker .pk-b.fold{background:linear-gradient(#f26a5a,#b8261a)}
.gm-poker .pk-b.call{background:linear-gradient(#4aa0f2,#1d5fb8)}
.gm-poker .pk-b.raise{background:linear-gradient(#ffb347,#d9791a);color:#2a1700}
.gm-poker .pk-b.raise small{color:#2a1700}
.gm-poker .pk-b:disabled{filter:grayscale(.8) brightness(.55);cursor:default}
.gm-poker .pk-b:active:not(:disabled){transform:translateY(2px);box-shadow:inset 0 -2px 0 rgba(0,0,0,.25)}
.gm-poker .pk-act.noraise .pk-b{flex:1}
.gm-poker .pk-pre{display:flex;gap:calc(var(--u,1)*6px);justify-content:flex-end}
.gm-poker .pk-pre label{pointer-events:auto;display:flex;align-items:center;gap:6px;height:calc(var(--u,1)*32px);padding:0 calc(var(--u,1)*12px);border-radius:calc(var(--u,1)*16px);background:rgba(10,14,22,.8);border:1.5px solid rgba(255,255,255,.25);font:800 calc(var(--u,1)*12px) var(--sans);cursor:pointer}
.gm-poker .pk-pre input{width:calc(var(--u,1)*16px);height:calc(var(--u,1)*16px);accent-color:#ffd34a;margin:0}
.gm-poker .pk-wait{align-self:flex-end;padding:calc(var(--u,1)*6px) calc(var(--u,1)*14px);border-radius:calc(var(--u,1)*16px);background:rgba(10,14,22,.78);font:800 calc(var(--u,1)*12px) var(--sans);color:rgba(255,255,255,.85)}
.gm-poker .pk-pane{position:absolute;inset:0;display:flex;padding:12px;background:rgba(6,9,16,.58);backdrop-filter:blur(3px);overflow:auto;pointer-events:auto;z-index:5;color:#fff;-webkit-user-select:text;user-select:text}
.gm-poker .pk-pane.low{background:linear-gradient(rgba(6,9,16,0) 15%,rgba(6,9,16,.78));backdrop-filter:none;align-items:flex-end}
.gm-poker .pk-pane.dim{background:rgba(6,9,16,.72)}
.gm-poker .pk-box{width:100%;max-width:400px;margin:auto;background:linear-gradient(#222a3d,#12172a);border:2px solid rgba(255,255,255,.14);border-radius:20px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.5);animation:pk-in .3s cubic-bezier(.2,1.4,.4,1)}
.gm-poker .pk-box.wide{max-width:560px}
.gm-poker .pk-box.tbox{background:linear-gradient(rgba(34,42,61,.92),rgba(18,23,42,.94));margin-bottom:0}
@keyframes pk-in{from{transform:translateY(10px) scale(.96);opacity:0}to{transform:none;opacity:1}}
.gm-poker .pk-box h3{margin:2px 0 8px;font:900 22px var(--sans)}
.gm-poker .pk-box p{margin:6px 0;font:700 14px/1.45 var(--sans);color:rgba(255,255,255,.86)}
.gm-poker .pk-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#ffd34a!important;margin:0 0 2px!important}
.gm-poker .pk-sec{margin:14px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:#ffd34a!important}
.gm-poker .pk-big{display:block;width:100%;min-height:52px;margin:9px 0;border:0;border-radius:16px;color:#fff;font:900 20px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px}
.gm-poker .pk-big:active{transform:translateY(2px)}
.gm-poker .pk-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-poker .pk-big.blue{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-poker .pk-big.red{background:linear-gradient(#f26a5a,#b8261a)}
.gm-poker .pk-sm{min-height:44px;padding:0 16px;border-radius:14px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.gm-poker .pk-sm:hover{background:rgba(255,255,255,.18)}
.gm-poker .pk-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-poker .pk-logo{display:flex;flex-direction:column;align-items:center;line-height:.95;margin:0 0 6px}
.gm-poker .pk-logo span{font:900 20px var(--sans);letter-spacing:7px;color:#ffd34a;padding-left:7px}
.gm-poker .pk-logo b{font:900 46px var(--sans);letter-spacing:-1px;color:#fff;text-shadow:0 3px 0 #0b3a20,0 5px 14px rgba(0,0,0,.5)}
.gm-poker .pk-logo small{font:900 15px var(--sans);letter-spacing:9px;color:#59d98a;padding-left:9px;margin-top:2px}
.gm-poker .pk-sum{font:800 13px var(--sans)!important;color:rgba(255,255,255,.7)!important;margin:4px 0 8px!important}
.gm-poker .pk-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
.gm-poker .pk-opt>span{flex:0 0 34%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.88)}
.gm-poker .pk-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.52);margin-top:2px}
.gm-poker .pk-seg{flex:1;display:flex;gap:5px}
.gm-poker .pk-seg button{flex:1;min-height:38px;border-radius:11px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 3px}
.gm-poker .pk-seg button.on{background:#ffd34a;border-color:#fff;color:#1b1b1f}
.gm-poker .pk-pane.scroll .pk-box{margin:auto}
.gm-poker .pk-tw{overflow-x:auto;margin:8px 0}
.gm-poker .pk-tbl{width:100%;border-collapse:collapse;font:800 13px var(--sans)}
.gm-poker .pk-tbl th{font:900 11px var(--sans);letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.5);text-align:left;padding:4px}
.gm-poker .pk-tbl td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:left}
.gm-poker .pk-tbl td:nth-child(3){text-align:right}
.gm-poker .pk-tbl tr.me td{color:#ffd34a}
.gm-poker .pk-help p,.gm-poker .pk-help ol{text-align:left}
.gm-poker .pk-help p{font:700 13px/1.5 var(--sans)}
.gm-poker .pk-rank{margin:6px 0;padding:0 0 0 22px;font:700 13px var(--sans)}
.gm-poker .pk-rank li{margin:3px 0;color:rgba(255,255,255,.9)}
.gm-poker .pk-rank li b{display:inline-block;min-width:130px}
.gm-poker .pk-rank li span{color:rgba(255,255,255,.58);font-weight:700}
.gm-poker .pk-help kbd,.gm-poker .pk-box kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.gm-poker .pk-hl{max-height:min(52vh,340px);overflow:auto;text-align:left;margin:8px 0;padding:6px 10px;background:rgba(0,0,0,.28);border-radius:12px}
.gm-poker .pk-hl p{margin:0!important;padding:2px 0;font:700 12.5px/1.4 var(--sans)!important;color:rgba(255,255,255,.82)!important}
.gm-poker .pk-hl p.hd{margin-top:8px!important;color:#ffd34a!important;font-weight:900!important}
.gm-poker i.b,.gm-poker i.r{font-style:normal}
.gm-poker i.r{color:#ff6a6a}
.gm-poker .pk-port .pk-box h3{font-size:20px}
.gm-poker .pk-port .pk-opt{flex-direction:column;align-items:stretch;gap:4px}
.gm-poker .pk-port .pk-opt>span{flex:none}
.gm-poker .pk-port .pk-logo b{font-size:40px}
.gm-poker .pk-port .pk-rank li b{min-width:112px}
`,
    mount: mountPoker
  });

  Ameplay.covers['poker'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="pkc-f" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#2f9a58"/><stop offset=".6" stop-color="#1b6a3a"/><stop offset="1" stop-color="#0b3a20"/></radialGradient><radialGradient id="pkc-b" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#222733"/><stop offset="1" stop-color="#07080c"/></radialGradient><linearGradient id="pkc-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4f26"/><stop offset="1" stop-color="#4a2810"/></linearGradient></defs><rect width="400" height="300" fill="url(#pkc-b)"/><ellipse cx="200" cy="160" rx="190" ry="118" fill="url(#pkc-r)"/><ellipse cx="200" cy="160" rx="176" ry="106" fill="url(#pkc-f)"/><ellipse cx="200" cy="160" rx="158" ry="92" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="2" stroke-dasharray="2 7"/><g transform="translate(142 150) rotate(-14)"><rect x="-30" y="-44" width="60" height="88" rx="6" fill="#000" opacity=".3" transform="translate(3 5)"/><rect x="-30" y="-44" width="60" height="88" rx="6" fill="#fff"/><text x="-22" y="-24" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="22" fill="#14161c">A</text><path d="M0 -14C-3 -4-22 0-22 14c0 8 6 12 12 12 4 0 7-2 8-4-1 6-3 10-6 12h16c-3-2-5-6-6-12 1 2 4 4 8 4 6 0 12-4 12-12 0-14-19-18-22-28z" fill="#14161c" transform="translate(0 4) scale(.8)"/></g><g transform="translate(206 146) rotate(8)"><rect x="-30" y="-44" width="60" height="88" rx="6" fill="#000" opacity=".3" transform="translate(3 5)"/><rect x="-30" y="-44" width="60" height="88" rx="6" fill="#fff"/><text x="-22" y="-24" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="22" fill="#d4202c">K</text><path d="M0 28C-30 8-30-14-14-14c8 0 12 5 14 10 2-5 6-10 14-10 16 0 16 22-14 42z" fill="#d4202c" transform="translate(0 -6) scale(.8)"/></g><g transform="translate(300 214)"><ellipse cx="0" cy="8" rx="22" ry="12" fill="#000" opacity=".35"/><ellipse cx="0" cy="0" rx="22" ry="12" fill="#d93636"/><ellipse cx="0" cy="-5" rx="22" ry="12" fill="#d93636"/><ellipse cx="0" cy="-10" rx="22" ry="12" fill="#d93636"/><ellipse cx="0" cy="-10" rx="14" ry="7.5" fill="none" stroke="#ffe3e3" stroke-width="2"/><g fill="#ffe3e3"><ellipse cx="-19" cy="-10" rx="3" ry="2"/><ellipse cx="19" cy="-10" rx="3" ry="2"/><ellipse cx="0" cy="-21" rx="3" ry="1.6"/></g></g><g transform="translate(96 220)"><ellipse cx="0" cy="8" rx="22" ry="12" fill="#000" opacity=".35"/><ellipse cx="0" cy="0" rx="22" ry="12" fill="#23272f"/><ellipse cx="0" cy="-5" rx="22" ry="12" fill="#23272f"/><ellipse cx="0" cy="-10" rx="22" ry="12" fill="#23272f"/><ellipse cx="0" cy="-15" rx="22" ry="12" fill="#23272f"/><ellipse cx="0" cy="-15" rx="14" ry="7.5" fill="none" stroke="#c8ccd8" stroke-width="2"/><g fill="#c8ccd8"><ellipse cx="-19" cy="-15" rx="3" ry="2"/><ellipse cx="19" cy="-15" rx="3" ry="2"/></g></g><g transform="translate(262 100)"><ellipse cx="0" cy="3" rx="14" ry="8" fill="#000" opacity=".35"/><circle r="13" fill="#fff" stroke="#8c93a6" stroke-width="2"/><text y="5" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="15" fill="#1a1c24">D</text></g></svg>`;
})();
