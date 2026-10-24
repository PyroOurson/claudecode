(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const DEF = { decks: 6, h17: false, pay: 1.5, surr: true, das: true, rsa: false, dbl: 'any', maxHands: 4, min: 5, start: 1000, ins: true };
  const CHIPS = [1, 5, 25, 100, 500, 1000];
  const BOTN = ['Marco', 'Elena', 'Viktor', 'Sofia', 'Dmitri', 'Chloe', 'Hugo', 'Mei', 'Rafa', 'Ingrid', 'Tariq', 'Lucia'];
  const PRI = [3, 2, 4, 1, 5, 0];
  const STYLES = ['basic', 'basic', 'cautious', 'loose'];
  const BET_MS = 22000, TURN_MS = 20000, INS_MS = 14000;
  const ACTS = ['hit', 'stand', 'double', 'split', 'surrender'];

  const pv = f => { const r = f % 13; return r === 0 ? 11 : r > 9 ? 10 : r + 1; };
  function tot(fs) {
    let t = 0, a = 0;
    for (const f of fs) { const v = pv(f); t += v; if (v === 11) a++; }
    while (t > 21 && a) { t -= 10; a--; }
    return { t, soft: a > 0 };
  }
  const money = v => '$' + (Number.isInteger(v) ? v.toLocaleString('en-US') : v.toFixed(2));

  const put = (r, i, c) => r.slice(0, i) + c + r.slice(i + 1);
  function hardRow(t, R) {
    if (t <= 8) return 'HHHHHHHHHH';
    if (t >= 18) return 'SSSSSSSSSS';
    let r = ['HDDDDHHHHH', 'DDDDDDDDHH', R.h17 ? 'DDDDDDDDDD' : 'DDDDDDDDDH', 'HHSSSHHHHH', 'SSSSSHHHHH', 'SSSSSHHHHH', 'SSSSSHHHHH', 'SSSSSHHHHH', 'SSSSSSSSSS'][t - 9];
    if (t === 15) { r = put(r, 8, 'R'); if (R.h17) r = put(r, 9, 'R'); }
    if (t === 16) r = put(put(put(r, 7, 'R'), 8, 'R'), 9, 'R');
    if (t === 17 && R.h17) r = put(r, 9, 'r');
    return r;
  }
  function softRow(t, R) {
    if (t >= 20) return 'SSSSSSSSSS';
    if (t === 19) return R.h17 ? 'SSSSdSSSSS' : 'SSSSSSSSSS';
    if (t === 18) return R.h17 ? 'dddddSSHHH' : 'SddddSSHHH';
    return { 12: 'HHHHHHHHHH', 13: 'HHHDDHHHHH', 14: 'HHHDDHHHHH', 15: 'HHDDDHHHHH', 16: 'HHDDDHHHHH', 17: 'HDDDDHHHHH' }[t];
  }
  function pairRow(v, R) {
    if (v === 11 || v === 8) return 'PPPPPPPPPP';
    if (v === 10 || v === 5) return null;
    if (v === 9) return 'PPPPPSPPSS';
    if (v === 7) return 'PPPPPPHHHH';
    if (v === 6) return R.das ? 'PPPPPHHHHH' : 'HPPPPHHHHH';
    if (v === 4) return R.das ? 'HHHPPHHHHH' : null;
    return R.das ? 'PPPPPPHHHH' : 'HHPPPPHHHH';
  }
  function advice(fs, upF, R, can) {
    const u = pv(upF) - 2, v = tot(fs);
    if (fs.length === 2 && can.split && pv(fs[0]) === pv(fs[1])) {
      const pr = pairRow(pv(fs[0]), R);
      if (pr && pr[u] === 'P') return 'split';
    }
    const c = (v.soft ? softRow(v.t, R) : hardRow(v.t, R))[u];
    if (c === 'H') return 'hit';
    if (c === 'S') return 'stand';
    if (c === 'D') return can.dbl ? 'double' : 'hit';
    if (c === 'd') return can.dbl ? 'double' : 'stand';
    if (c === 'R') return can.surr ? 'surrender' : 'hit';
    return can.surr ? 'surrender' : 'stand';
  }

  function legalHand(fs, h, nh, bank, R, ph) {
    const L = {};
    if (ph !== 'play' || h.done) return L;
    const v = tot(fs), two = fs.length === 2, pair = two && pv(fs[0]) === pv(fs[1]);
    L.stand = true;
    if (h.aces) {
      L.split = pair && pv(fs[0]) === 11 && R.rsa && nh < R.maxHands && bank >= h.bet;
      return L;
    }
    L.hit = v.t < 21;
    const rng = R.dbl === '9-11' ? v.t >= 9 && v.t <= 11 && !v.soft : R.dbl === '10-11' ? v.t >= 10 && v.t <= 11 && !v.soft : true;
    L.dbl = two && bank >= h.bet && rng && (!h.split || R.das);
    L.split = pair && nh < R.maxHands && bank >= h.bet;
    L.surr = !!R.surr && two && nh === 1 && !h.split;
    return L;
  }

  function Table(o) {
    const R = o.rnd || Math.random;
    const rules = Object.assign({}, DEF, o.rules);
    if (!rules.max) rules.max = rules.min * 200;
    const online = !!o.online, sp = o.speed || 1;
    const s = { ph: 'idle', rd: 0, shoe: [], pos: 0, cut: 0, disc: 0, need: false, seats: Array(6).fill(null), dl: [], hole: true, turn: null, tl: 0, lk: false };
    let clock = 0, tid = 0, cn = 0, evs = [], dirty = false, tBet = 0, tTurn = 0, tIns = 0;
    const timers = [];
    const later = (fn, ms, raw) => { const t = { at: clock + (raw ? ms : ms * sp), id: ++tid, fn }; timers.push(t); return t.id; };
    const cancel = id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); };
    const E = e => { evs.push(e); dirty = true; };
    const change = () => { dirty = true; };
    const r2 = x => Math.round(x * 100) / 100;
    const fc = cs => cs.map(c => c.f);
    const hv = h => tot(fc(h.cards));
    const sd = i => s.seats[i];
    const left = () => s.shoe.length - s.pos;
    const rint = k => Math.floor(R() * k);

    function shuffle() {
      const n = rules.decks * 52, a = new Array(n);
      for (let i = 0; i < n; i++) a[i] = i % 52;
      for (let i = n - 1; i > 0; i--) { const j = rint(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
      const pen = rules.decks === 1 ? .55 : rules.decks === 2 ? .68 : .75;
      s.shoe = a; s.pos = 1; s.disc = 1; s.need = false;
      s.cut = Math.max(Math.floor(n * .3), Math.floor(n * (pen - .04 + R() * .08)));
      E({ k: 'shuf' });
    }
    function draw() {
      if (s.pos >= s.shoe.length) shuffle();
      return { n: ++cn, f: s.shoe[s.pos++] };
    }

    function mkSeat(i, p) {
      s.seats[i] = Object.assign({ kind: 'bot', pid: null, name: 'Bot', bank: rules.start, bet: 0, last: 0, hist: [], ready: false, ins: 0, inr: '', ans: null, hands: [], style: 'basic', sit: false, tmo: 0, rebuys: 0 }, p);
      change();
    }

    function chip(x, v) {
      if (s.ph !== 'bet' || x.ready || CHIPS.indexOf(v) < 0) return false;
      if (x.bank < v || x.bet + v > rules.max) return false;
      x.bank = r2(x.bank - v); x.bet = r2(x.bet + v); x.hist.push(v);
      E({ k: 'chip', s: s.seats.indexOf(x) });
      return true;
    }
    function undo(x) {
      if (s.ph !== 'bet' || x.ready || !x.hist.length) return false;
      const v = x.hist.pop(); x.bank = r2(x.bank + v); x.bet = r2(x.bet - v);
      E({ k: 'chip', s: s.seats.indexOf(x), u: 1 });
      return true;
    }
    function clear(x) {
      if (s.ph !== 'bet' || x.ready || !x.bet) return false;
      x.bank = r2(x.bank + x.bet); x.bet = 0; x.hist = [];
      return true;
    }
    function setBet(x, amt) {
      x.bank = r2(x.bank + x.bet); x.bet = 0; x.hist = [];
      amt = Math.min(amt, rules.max, x.bank);
      for (let k = CHIPS.length - 1; k >= 0; k--) { while (amt >= CHIPS[k] - 1e-9) { x.bank = r2(x.bank - CHIPS[k]); x.bet = r2(x.bet + CHIPS[k]); x.hist.push(CHIPS[k]); amt = r2(amt - CHIPS[k]); } }
      if (x.bet < rules.min) { x.bank = r2(x.bank + x.bet); x.bet = 0; x.hist = []; return false; }
      E({ k: 'chip', s: s.seats.indexOf(x) });
      return true;
    }
    function rebet(x) {
      if (s.ph !== 'bet' || x.ready || !x.last) return false;
      return setBet(x, x.last);
    }
    function x2(x) {
      if (s.ph !== 'bet' || x.ready || !x.bet) return false;
      const b = x.bet, ok = setBet(x, b * 2);
      if (!ok || x.bet === b) { setBet(x, b); return false; }
      return true;
    }
    function ready(x) {
      if (s.ph !== 'bet' || x.ready || x.bet < rules.min) return false;
      x.ready = true; E({ k: 'rdy', s: s.seats.indexOf(x) });
      later(maybeDeal, 150);
      return true;
    }
    function sit(x) {
      if (s.ph !== 'bet' || x.ready) return false;
      clear(x); x.ready = true; x.sit = true;
      later(maybeDeal, 150);
      return true;
    }
    function rebuy(x) {
      if (s.ph !== 'bet' || x.ready || x.bank + x.bet >= rules.min) return false;
      x.bank = r2(x.bank + x.bet); x.bet = 0; x.hist = [];
      x.bank = rules.start; x.rebuys++; E({ k: 'rebuy', s: s.seats.indexOf(x) });
      return true;
    }

    function botBet(i) {
      const x = sd(i);
      if (s.ph !== 'bet' || !x || x.kind !== 'bot' || x.ready) return;
      if (x.bank < rules.min) { x.bank = rules.start; x.rebuys++; }
      const mult = x.style === 'cautious' ? [1, 1, 2] : x.style === 'loose' ? [4, 10, 20, 8] : [2, 4, 5, 4];
      let amt = rules.min * mult[rint(mult.length)];
      amt = Math.min(rules.max, Math.max(rules.min, Math.floor(Math.min(amt, x.bank * .25) / rules.min) * rules.min), x.bank);
      if (!setBet(x, amt)) { x.ready = true; x.sit = true; } else { x.ready = true; E({ k: 'rdy', s: i }); }
      change();
      later(maybeDeal, 100);
    }

    function armBet() {
      cancel(tBet); s.tl = 0;
      if (online) { s.tl = clock + BET_MS; tBet = later(expireBet, BET_MS, true); }
      change();
    }
    function expireBet() {
      if (s.ph !== 'bet') return;
      s.seats.forEach(x => {
        if (!x || x.ready) return;
        if (x.bet >= rules.min) { x.ready = true; E({ k: 'rdy', s: s.seats.indexOf(x) }); }
        else { clear(x); x.ready = true; x.sit = true; }
      });
      maybeDeal();
      if (s.ph === 'bet') armBet();
    }
    function maybeDeal() {
      if (s.ph !== 'bet') return;
      let any = false;
      for (const x of s.seats) { if (!x) continue; if (!x.ready) return; if (x.bet >= rules.min) any = true; }
      if (any) startDeal();
    }

    function startBetting() {
      s.ph = 'shuf';
      if (s.pos >= s.cut) s.need = true;
      const open = () => {
        s.ph = 'bet'; s.rd++; s.turn = null; s.dl = []; s.hole = true; s.lk = false;
        s.seats.forEach((x, i) => {
          if (!x) return;
          x.hands = []; x.ins = 0; x.inr = ''; x.ans = null; x.ready = false; x.sit = false; x.hist = []; x.bet = 0;
          if (x.kind === 'bot') { if (x.bank < rules.min) { x.bank = rules.start; x.rebuys++; } later(() => botBet(i), 500 + R() * 1500); }
        });
        armBet();
        change();
      };
      s.turn = null; s.tl = 0;
      if (s.need || !s.shoe.length) { s.dl = []; s.seats.forEach(x => { if (x) { x.hands = []; x.ins = 0; } }); shuffle(); change(); later(open, 2800); }
      else { s.disc = s.pos; open(); }
    }

    function startDeal() {
      cancel(tBet); s.tl = 0;
      const act = [];
      s.seats.forEach((x, i) => { if (x && x.bet >= rules.min) act.push(i); });
      if (!act.length) return;
      if (left() < 14 + act.length * 8) { shuffle(); }
      s.ph = 'deal'; s.lk = true;
      act.forEach(i => { const x = sd(i); x.last = x.bet; x.hands = [{ cards: [], bet: x.bet, done: false, st: '', res: '', net: 0, split: false, aces: false, dbl: false }]; x.bet = 0; x.hist = []; });
      const order = act.concat(['D'], act, ['H']);
      let k = 0;
      const step = () => {
        const w = order[k++];
        if (w === 'D' || w === 'H') s.dl.push(draw()); else sd(w).hands[0].cards.push(draw());
        E({ k: 'deal' }); change();
        if (k < order.length) later(step, 330); else later(afterDeal, 600);
      };
      step();
    }

    function afterDeal() {
      s.seats.forEach(x => { if (x) x.hands.forEach(h => { if (h.cards.length === 2 && hv(h).t === 21) { h.st = 'bj'; h.done = true; } }); });
      if (rules.ins && pv(s.dl[0].f) === 11) startIns(); else peek();
    }

    function startIns() {
      s.ph = 'ins'; s.lk = false;
      s.seats.forEach((x, i) => {
        if (!x || !x.hands.length) return;
        x.ans = null;
        if (x.kind === 'bot') later(() => { if (s.ph === 'ins' && x.ans === null) insAns(i, x, x.style === 'loose' && R() < .35 && x.hands[0].st !== 'bj'); }, 500 + R() * 700);
      });
      cancel(tIns); s.tl = 0;
      if (online) { s.tl = clock + INS_MS; tIns = later(() => { s.seats.forEach((x, i) => { if (x && x.hands.length && x.ans === null) insAns(i, x, false); }); flush(); }, INS_MS, true); }
      change();
      later(checkIns, 50);
    }
    function insAns(i, x, yes) {
      if (s.ph !== 'ins' || !x.hands.length || x.ans !== null) return false;
      const h = x.hands[0];
      if (yes) {
        if (h.st === 'bj') { h.st = 'even'; h.done = true; }
        else {
          const st = Math.floor(h.bet / 2);
          if (!st || x.bank < st) return false;
          x.bank = r2(x.bank - st); x.ins = st;
        }
      }
      x.ans = !!yes; E({ k: 'ins', s: i, v: !!yes });
      checkIns();
      return true;
    }
    function checkIns() {
      if (s.ph !== 'ins') return;
      if (s.seats.some(x => x && x.hands.length && x.ans === null)) return;
      s.ph = 'peek'; cancel(tIns); s.tl = 0;
      later(peek, 700);
    }

    function peek() {
      s.ph = 'peek'; s.tl = 0; change();
      if (pv(s.dl[0].f) < 10) return later(startPlay, 250);
      E({ k: 'peek' }); change();
      later(() => {
        if (tot(fc(s.dl)).t === 21) {
          s.hole = false; E({ k: 'flip' });
          s.seats.forEach((x, i) => { if (x && x.ins) { x.bank = r2(x.bank + x.ins * 3); x.inr = 'win'; E({ k: 'insw', s: i, net: x.ins * 2 }); } });
          change();
          later(settle, 1100);
        } else {
          s.seats.forEach((x, i) => { if (x && x.ins) { x.inr = 'lose'; E({ k: 'insl', s: i }); } });
          E({ k: 'nobj' }); change();
          later(startPlay, 900);
        }
      }, 1500);
    }

    function nextHand(i0, j0) {
      for (let i = i0; i < 6; i++) {
        const x = sd(i);
        if (!x) continue;
        for (let j = i === i0 ? j0 : 0; j < x.hands.length; j++) if (!x.hands[j].done) return [i, j];
      }
      return null;
    }
    function startPlay() { s.ph = 'play'; go(nextHand(0, 0)); }
    function go(t) {
      cancel(tTurn);
      if (!t) { s.turn = null; s.tl = 0; s.lk = true; change(); later(dealerPlay, 450); return; }
      s.turn = { s: t[0], h: t[1] }; s.lk = true; s.tl = 0; change();
      const i = t[0], j = t[1], x = sd(i), h = x.hands[j];
      if (h.cards.length < 2) later(() => { h.cards.push(draw()); E({ k: 'deal' }); afterCard(i, j); change(); }, 350);
      else later(armTurn, 250);
    }
    function armTurn() {
      if (s.ph !== 'play' || !s.turn) return;
      const x = sd(s.turn.s);
      s.lk = false; cancel(tTurn); s.tl = 0;
      if (x.kind === 'bot') tTurn = later(botMove, 650 + R() * 650);
      else if (online) { s.tl = clock + TURN_MS; tTurn = later(turnOut, TURN_MS, true); }
      change();
    }
    function turnOut() {
      if (s.ph !== 'play' || !s.turn) return;
      const i = s.turn.s, x = sd(i);
      if (!x || x.kind !== 'human') return;
      const t = x.tmo + 1;
      s.lk = false; play(i, 'stand'); x.tmo = t;
    }
    function afterCard(i, j) {
      const x = sd(i), h = x.hands[j], t = hv(h).t;
      const nx = d => later(() => go(nextHand(i, j + 1)), d);
      if (t > 21) { h.done = true; h.st = 'bust'; E({ k: 'bust', s: i, h: j }); nx(1000); }
      else if (t === 21) { h.done = true; h.st = '21'; nx(750); }
      else if (h.dbl) { h.done = true; h.st = 'dbl'; nx(850); }
      else if (h.aces && !(h.cards.length === 2 && pv(h.cards[0].f) === 11 && pv(h.cards[1].f) === 11 && rules.rsa && x.hands.length < rules.maxHands && x.bank >= h.bet)) { h.done = true; h.st = 'stand'; nx(750); }
      else later(armTurn, 450);
    }

    function legal(x, h) {
      return legalHand(fc(h.cards), h, x.hands.length, x.bank, rules, s.ph);
    }
    function play(i, k) {
      if (s.ph !== 'play' || !s.turn || s.turn.s !== i || s.lk) return false;
      const x = sd(i), j = s.turn.h, h = x.hands[j], L = legal(x, h);
      if (k === 'hit' && !L.hit || k === 'stand' && !L.stand || k === 'double' && !L.dbl || k === 'split' && !L.split || k === 'surrender' && !L.surr) return false;
      cancel(tTurn); s.tl = 0; s.lk = true; x.tmo = 0;
      const nx = d => later(() => go(nextHand(i, j + 1)), d);
      if (k === 'stand') { h.done = true; h.st = 'stand'; E({ k: 'stand', s: i, h: j }); nx(350); }
      else if (k === 'surrender') { h.done = true; h.st = 'surr'; E({ k: 'surr', s: i, h: j }); nx(700); }
      else if (k === 'hit') { h.cards.push(draw()); E({ k: 'deal' }); afterCard(i, j); }
      else if (k === 'double') {
        x.bank = r2(x.bank - h.bet); h.bet = r2(h.bet * 2); h.dbl = true; E({ k: 'dbl', s: i, h: j });
        later(() => { h.cards.push(draw()); E({ k: 'deal' }); afterCard(i, j); change(); }, 450);
      } else if (k === 'split') {
        const ace = pv(h.cards[0].f) === 11;
        x.bank = r2(x.bank - h.bet);
        const nh = { cards: [h.cards.pop()], bet: h.bet, done: false, st: '', res: '', net: 0, split: true, aces: ace, dbl: false };
        h.split = true; h.aces = ace;
        x.hands.splice(j + 1, 0, nh);
        E({ k: 'split', s: i, h: j });
        later(() => { h.cards.push(draw()); E({ k: 'deal' }); afterCard(i, j); change(); }, 600);
      }
      change();
      return true;
    }

    function botChoice(x, h) {
      const L = legal(x, h), fs = fc(h.cards), up = s.dl[0].f;
      const can = { dbl: !!L.dbl, split: !!L.split, surr: !!L.surr };
      if (x.style === 'cautious') {
        can.dbl = false; can.surr = false;
        const pa = fs.length === 2 && pv(fs[0]) === pv(fs[1]) && (pv(fs[0]) === 11 || pv(fs[0]) === 8);
        can.split = can.split && pa;
      }
      let a = advice(fs, up, rules, can);
      if (x.style === 'loose' && a === 'stand' && tot(fs).t <= 16 && R() < .12 && L.hit) a = 'hit';
      if (x.style === 'loose' && a === 'hit' && L.dbl && tot(fs).t >= 9 && tot(fs).t <= 11 && R() < .6) a = 'double';
      if (a === 'split' && !L.split) a = 'hit';
      if (a === 'double' && !L.dbl) a = L.hit ? 'hit' : 'stand';
      if (a === 'hit' && !L.hit) a = 'stand';
      if (a === 'surrender' && !L.surr) a = 'stand';
      return a;
    }
    function botMove() {
      if (s.ph !== 'play' || !s.turn) return;
      const i = s.turn.s, x = sd(i);
      if (!x || x.kind !== 'bot') return;
      const h = x.hands[s.turn.h];
      s.lk = false;
      if (!play(i, botChoice(x, h))) play(i, 'stand');
    }

    function dealerPlay() {
      s.ph = 'dealer'; s.turn = null; s.tl = 0; s.hole = false; E({ k: 'flip' }); change();
      const live = s.seats.some(x => x && x.hands.some(h => h.st !== 'bust' && h.st !== 'surr' && h.st !== 'bj' && h.st !== 'even'));
      const more = () => { const v = tot(fc(s.dl)); return v.t < 17 || (v.t === 17 && v.soft && rules.h17); };
      const stepD = () => {
        if (live && more()) { s.dl.push(draw()); E({ k: 'deal' }); change(); later(stepD, 750); }
        else later(settle, 750);
      };
      later(stepD, 900);
    }

    function settle() {
      s.ph = 'pay'; s.turn = null; s.tl = 0; s.hole = false;
      const dv = tot(fc(s.dl)), dbj = s.dl.length === 2 && dv.t === 21, dbust = dv.t > 21;
      s.seats.forEach((x, i) => {
        if (!x) return;
        x.hands.forEach((h, j) => {
          const t = hv(h).t;
          let ret = 0, r;
          if (h.st === 'surr') { r = 'surr'; ret = r2(h.bet / 2); }
          else if (h.st === 'even') { r = 'even'; ret = h.bet * 2; }
          else if (h.st === 'bj') { if (dbj) { r = 'push'; ret = h.bet; } else { r = 'bj'; ret = r2(h.bet * (1 + rules.pay)); } }
          else if (t > 21) r = 'bust';
          else if (dbj) r = 'lose';
          else if (dbust || t > dv.t) { r = 'win'; ret = h.bet * 2; }
          else if (t === dv.t) { r = 'push'; ret = h.bet; }
          else r = 'lose';
          h.res = r; h.net = r2(ret - h.bet);
          x.bank = r2(x.bank + ret);
          E({ k: 'res', s: i, h: j, r, net: h.net });
        });
      });
      change();
      later(startBetting, online ? 3600 : 2800);
    }

    function toBot(i) {
      const x = sd(i);
      if (!x || x.kind === 'bot') return;
      x.kind = 'bot'; x.pid = null; x.style = 'basic'; x.name = x.name.slice(0, 11) + ' (CPU)';
      E({ k: 'bot', s: i });
      if (s.ph === 'bet' && !x.ready) later(() => botBet(i), 500);
      else if (s.ph === 'ins' && x.hands.length && x.ans === null) insAns(i, x, false);
      else if (s.ph === 'play' && s.turn && s.turn.s === i) { cancel(tTurn); armTurn(); }
      change();
    }

    function act(i, k, v) {
      const x = sd(i);
      if (!x) return false;
      let ok = false;
      if (k === 'chip') ok = chip(x, +v);
      else if (k === 'undo') ok = undo(x);
      else if (k === 'clr') ok = clear(x);
      else if (k === 'rebet') ok = rebet(x);
      else if (k === 'x2') ok = x2(x);
      else if (k === 'deal') ok = ready(x);
      else if (k === 'sit') ok = sit(x);
      else if (k === 'rebuy') ok = rebuy(x);
      else if (k === 'ins') ok = insAns(i, x, !!v);
      else if (ACTS.indexOf(k) >= 0) ok = play(i, k);
      if (ok) change();
      flush();
      return ok;
    }

    function snap() {
      const pk = (c, hid) => c.n * 64 + (hid ? 63 : c.f);
      return {
        ph: s.ph, rd: s.rd, lk: s.lk ? 1 : 0,
        tl: s.tl ? Math.max(0, Math.round(s.tl - clock)) : 0,
        d: s.dl.map((c, i) => pk(c, s.hole && i === 1)),
        t: s.turn ? [s.turn.s, s.turn.h] : null,
        sh: [left(), s.shoe.length, Math.max(0, s.cut - s.pos), s.disc],
        s: s.seats.map(x => x && {
          h: x.kind === 'human' ? 1 : 0, nm: x.name, bk: x.bank, bt: x.bet, rd: x.ready ? 1 : 0, sit: x.sit ? 1 : 0,
          ins: x.ins, inr: x.inr, an: x.ans === null ? -1 : x.ans ? 1 : 0, l: x.last,
          hs: x.hands.map(h => ({ c: h.cards.map(c => pk(c, false)), b: h.bet, st: h.st, r: h.res, nt: h.net, d: h.dbl ? 1 : 0, sp: h.split ? 1 : 0, ac: h.aces ? 1 : 0, dn: h.done ? 1 : 0 }))
        })
      };
    }
    function flush() {
      if (!dirty) return;
      dirty = false;
      const e = evs; evs = [];
      if (o.onChange) o.onChange(snap(), e);
    }
    function tick(dt) {
      clock += dt;
      for (;;) {
        let k = -1;
        for (let i = 0; i < timers.length; i++) if (timers[i].at <= clock && (k < 0 || timers[i].at < timers[k].at)) k = i;
        if (k < 0) break;
        timers.splice(k, 1)[0].fn();
      }
      flush();
    }
    function start() { startBetting(); flush(); }
    function resetBanks() { s.seats.forEach(x => { if (x) { x.bank = rules.start; x.bet = 0; x.hist = []; x.rebuys = 0; } }); change(); }

    return { s, rules, seat: mkSeat, toBot, act, tick, start, snap, flush, resetBanks, legalNow: i => { const x = sd(i); return s.turn && s.turn.s === i ? legal(x, x.hands[s.turn.h]) : {}; } };
  }

  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const CWB = 64, CHB = 90;
  const RK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suitCol = st => st === 1 || st === 2 ? '#c4161c' : '#15171c';
  const CHC = {
    1: ['#ecebe4', '#7f93ad', '#222', '#b3b1a4'], 5: ['#cf352c', '#fff', '#fff', '#8a1f19'], 25: ['#17934f', '#fff', '#fff', '#0b5f33'],
    100: ['#2a2b30', '#fff', '#fff', '#0f1013'], 500: ['#7a3aae', '#fff', '#fff', '#4a1f72'], 1000: ['#e5b01d', '#fff', '#3a2a00', '#9b7507']
  };
  const chipLab = v => v >= 1000 ? v / 1000 + 'K' : String(v);
  const PIPS = {
    1: [[0, 0]], 2: [[0, -1], [0, 1]], 3: [[0, -1], [0, 0], [0, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    7: [[-1, -1], [1, -1], [0, -.5], [-1, 0], [1, 0], [-1, 1], [1, 1]], 8: [[-1, -1], [1, -1], [0, -.5], [-1, 0], [1, 0], [0, .5], [-1, 1], [1, 1]],
    9: [[-1, -1], [1, -1], [-1, -1 / 3], [1, -1 / 3], [0, 0], [-1, 1 / 3], [1, 1 / 3], [-1, 1], [1, 1]],
    10: [[-1, -1], [1, -1], [0, -2 / 3], [-1, -1 / 3], [1, -1 / 3], [-1, 1 / 3], [1, 1 / 3], [0, 2 / 3], [-1, 1], [1, 1]]
  };

  function suitPath(c, st, s) {
    c.beginPath();
    if (st === 1) {
      c.moveTo(0, s * .95);
      c.bezierCurveTo(-s * 1.3, s * .1, -s * 1.05, -s * .95, 0, -s * .4);
      c.bezierCurveTo(s * 1.05, -s * .95, s * 1.3, s * .1, 0, s * .95);
    } else if (st === 2) {
      c.moveTo(0, -s);
      c.quadraticCurveTo(s * .3, -s * .3, s * .72, 0);
      c.quadraticCurveTo(s * .3, s * .3, 0, s);
      c.quadraticCurveTo(-s * .3, s * .3, -s * .72, 0);
      c.quadraticCurveTo(-s * .3, -s * .3, 0, -s);
    } else if (st === 0) {
      c.moveTo(0, -s * .95);
      c.bezierCurveTo(-s * 1.3, -s * .1, -s * 1.05, s * .95, 0, s * .4);
      c.bezierCurveTo(s * 1.05, s * .95, s * 1.3, -s * .1, 0, -s * .95);
      c.moveTo(0, s * .15); c.lineTo(-s * .42, s); c.lineTo(s * .42, s); c.closePath();
    } else {
      c.moveTo(s * .46, -s * .5); c.arc(0, -s * .5, s * .46, 0, TAU);
      c.moveTo(-s * .09, s * .2); c.arc(-s * .55, s * .2, s * .46, 0, TAU);
      c.moveTo(s * 1.01, s * .2); c.arc(s * .55, s * .2, s * .46, 0, TAU);
      c.moveTo(0, -s * .1); c.lineTo(-s * .38, s); c.lineTo(s * .38, s); c.closePath();
    }
  }
  function suitAt(c, st, x, y, s, flip) {
    c.save(); c.translate(x, y); if (flip) c.rotate(Math.PI);
    suitPath(c, st, s); c.fillStyle = suitCol(st); c.fill();
    c.restore();
  }

  function makeFace(f, sc) {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(CWB * sc); cv.height = Math.ceil(CHB * sc);
    const c = cv.getContext('2d');
    c.scale(sc, sc);
    const r = f % 13, st = (f / 13) | 0, col = suitCol(st);
    c.beginPath(); c.roundRect(.5, .5, CWB - 1, CHB - 1, 6);
    c.fillStyle = '#fbfaf5'; c.fill();
    c.lineWidth = 1; c.strokeStyle = 'rgba(30,30,30,.55)'; c.stroke();
    c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle';
    const lab = RK[r];
    const idx = (flip) => {
      c.save();
      if (flip) { c.translate(CWB, CHB); c.rotate(Math.PI); }
      c.font = `700 ${lab.length > 1 ? 14 : 17}px ${SERIF}`;
      c.fillStyle = col; c.fillText(lab, 9.5, 14);
      suitAt(c, st, 9.5, 27, 5.2, false);
      c.restore();
    };
    idx(false); idx(true);
    if (r === 0) {
      suitAt(c, st, 32, 45, 17, false);
    } else if (r < 10) {
      const pp = PIPS[r];
      for (const [px, py] of pp) suitAt(c, st, 32 + px * 12.5, 45 + py * 25, 8.6, py > 0);
    } else {
      c.beginPath(); c.roundRect(15, 17, 34, 56, 3);
      const g = c.createLinearGradient(15, 17, 49, 73);
      g.addColorStop(0, '#f6ecc9'); g.addColorStop(1, '#e8d9a6');
      c.fillStyle = g; c.fill(); c.lineWidth = 1.2; c.strokeStyle = col; c.stroke();
      c.beginPath(); c.moveTo(15, 45); c.lineTo(49, 45); c.lineWidth = .8; c.globalAlpha = .45; c.stroke(); c.globalAlpha = 1;
      c.fillStyle = col;
      if (r !== 10) {
        c.beginPath();
        c.moveTo(21, 31); c.lineTo(24, 21.5); c.lineTo(28, 27.5); c.lineTo(32, 20.5); c.lineTo(36, 27.5); c.lineTo(40, 21.5); c.lineTo(43, 31); c.closePath();
        c.fillStyle = '#d9a517'; c.fill(); c.lineWidth = .8; c.strokeStyle = '#7a5a07'; c.stroke();
      } else {
        c.beginPath(); c.moveTo(22, 30); c.quadraticCurveTo(32, 14, 43, 30); c.quadraticCurveTo(32, 25, 22, 30);
        c.fillStyle = '#d9a517'; c.fill(); c.lineWidth = .8; c.strokeStyle = '#7a5a07'; c.stroke();
      }
      c.fillStyle = col; c.font = `700 28px ${SERIF}`; c.fillText(lab, 32, 46);
      suitAt(c, st, 23, 62.5, 5, false); suitAt(c, st, 41, 28, 5, true);
    }
    return cv;
  }
  function makeBack(sc) {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(CWB * sc); cv.height = Math.ceil(CHB * sc);
    const c = cv.getContext('2d');
    c.scale(sc, sc);
    c.beginPath(); c.roundRect(.5, .5, CWB - 1, CHB - 1, 6); c.fillStyle = '#fbfaf5'; c.fill();
    c.lineWidth = 1; c.strokeStyle = 'rgba(30,30,30,.55)'; c.stroke();
    c.save();
    c.beginPath(); c.roundRect(4.5, 4.5, CWB - 9, CHB - 9, 3.5); c.clip();
    const g = c.createLinearGradient(0, 0, CWB, CHB);
    g.addColorStop(0, '#9c1530'); g.addColorStop(.5, '#7a0f26'); g.addColorStop(1, '#5c0a1c');
    c.fillStyle = g; c.fillRect(0, 0, CWB, CHB);
    c.strokeStyle = 'rgba(255,215,150,.28)'; c.lineWidth = .9;
    for (let i = -CHB; i < CWB + CHB; i += 7) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + CHB, CHB); c.stroke();
      c.beginPath(); c.moveTo(i + CHB, 0); c.lineTo(i, CHB); c.stroke();
    }
    c.restore();
    c.lineWidth = 1.2; c.strokeStyle = '#e8c477';
    c.beginPath(); c.roundRect(7.5, 7.5, CWB - 15, CHB - 15, 2.5); c.stroke();
    c.save(); c.translate(32, 45);
    c.beginPath(); c.ellipse(0, 0, 15, 22, 0, 0, TAU); c.fillStyle = '#5c0a1c'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(0, 0, 10, 16, 0, 0, TAU); c.strokeStyle = 'rgba(232,196,119,.7)'; c.lineWidth = .8; c.stroke();
    suitAt(c, 0, 0, 0, 7.5, false);
    c.restore();
    c.save(); c.fillStyle = '#e8c477'; c.font = `700 7px ${SERIF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.restore();
    return cv;
  }

  function chipDraw(c, x, y, rx, ry, v, label) {
    const [m, n, tc, side] = CHC[v], th = ry * .6;
    c.fillStyle = side;
    c.beginPath(); c.ellipse(x, y + th, rx, ry, 0, 0, TAU); c.fill();
    c.fillRect(x - rx, y, rx * 2, th);
    c.fillStyle = m; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
    c.fillStyle = n;
    for (let i = 0; i < 8; i++) {
      const a0 = i * TAU / 8 - .2, a1 = a0 + .4;
      c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.ellipse(x, y, rx * .8, ry * .8, 0, a1, a0, true); c.closePath(); c.fill();
    }
    c.strokeStyle = n; c.globalAlpha = .75; c.lineWidth = Math.max(.7, rx * .05);
    c.beginPath(); c.ellipse(x, y, rx * .64, ry * .64, 0, 0, TAU); c.stroke();
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .8;
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.stroke();
    if (label) {
      c.save(); c.translate(x, y); c.scale(1, ry / rx);
      c.fillStyle = tc; c.font = `800 ${rx * (label.length > 2 ? .62 : .78)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(label, 0, rx * .04);
      c.restore();
    }
  }
  function chipsOf(amount) {
    const out = [];
    let a = Math.round(amount * 100) / 100;
    for (let k = CHIPS.length - 1; k >= 0; k--) { while (a >= CHIPS[k] - 1e-9 && out.length < 400) { out.push(CHIPS[k]); a = Math.round((a - CHIPS[k]) * 100) / 100; } }
    if (a > 0.004 && !out.length) out.push(1);
    return out;
  }
  function stackDraw(c, x, y, amount, rx, ry) {
    const L = chipsOf(amount);
    if (!L.length) return;
    const groups = [];
    for (const v of L) { const g = groups.find(q => q.v === v); if (g) g.n++; else groups.push({ v, n: 1 }); }
    let cols;
    if (groups.length <= 3) cols = groups.map(g => Array(Math.min(g.n, 9)).fill(g.v));
    else { cols = [[], [], []]; L.slice(0, 24).forEach((v, i) => cols[Math.floor(i / 8)].push(v)); cols = cols.filter(q => q.length); }
    const sp = rx * 1.9, x0 = x - (cols.length - 1) * sp / 2;
    const dh = ry * .46;
    cols.forEach((col, ci) => {
      const cx = x0 + ci * sp, cy = y + (ci % 2 ? ry * .35 : 0);
      for (let i = 0; i < col.length; i++) chipDraw(c, cx, cy - i * dh, rx, ry, col[i], i === col.length - 1 ? chipLab(col[i]) : null);
    });
  }
  function hue(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; return h; }
  function arcText(c, text, cx, cy, r, mid, font, fill, space) {
    c.font = font; c.fillStyle = fill; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const ws = [...text].map(ch => c.measureText(ch).width + space);
    const sum = ws.reduce((a, b) => a + b, 0) - space;
    let a = mid + sum / (2 * r);
    [...text].forEach((ch, i) => {
      const w = ws[i] - space, th = a - (w / 2) / r;
      c.save(); c.translate(cx + r * Math.cos(th), cy + r * Math.sin(th)); c.rotate(th - Math.PI / 2);
      c.fillText(ch, 0, 0); c.restore();
      a -= ws[i] / r;
    });
  }

  const ICON_MENU = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const ICON_BULB = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>';

  const CSS = `
.gm-blackjack{gap:0}
.gm-blackjack [hidden]{display:none!important}
.gm-blackjack .bj-wrap{--u:calc(var(--s,1)*1px);position:relative;max-width:100%;border-radius:18px;overflow:hidden;background:#0b0705;box-shadow:0 10px 30px rgba(0,0,0,.4);touch-action:manipulation;-webkit-user-select:none;user-select:none}
.gm-blackjack .bj-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-blackjack .bj-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans,system-ui);color:#fff}
.gm-blackjack .bj-ui button{pointer-events:auto;font-family:var(--sans,system-ui);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-blackjack .bj-top{position:absolute;left:calc(10*var(--u));right:calc(10*var(--u));top:calc(10*var(--u));display:flex;align-items:center;gap:calc(8*var(--u))}
.gm-blackjack .bj-ib{height:max(34px,calc(40*var(--u)));min-width:max(34px,calc(40*var(--u)));padding:0 calc(11*var(--u));border-radius:calc(12*var(--u));border:1px solid rgba(255,255,255,.24);background:rgba(10,8,6,.58);color:#fff;font:800 max(11px,calc(13*var(--u))) var(--sans,system-ui);display:inline-flex;align-items:center;justify-content:center;gap:calc(6*var(--u))}
.gm-blackjack .bj-ib.on{background:linear-gradient(#ffd45e,#e0a21a);color:#2a1c00;border-color:#fff3c2}
.gm-blackjack .bj-net{margin-left:auto;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:12px;background:rgba(0,0,0,.4);font:800 max(10px,calc(12*var(--u))) var(--sans,system-ui)}
.gm-blackjack .bj-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-blackjack .bj-net.bad i{background:#ff5b4b}
.gm-blackjack .bj-msg{position:absolute;left:50%;transform:translateX(-50%);max-width:88%;padding:calc(6*var(--u)) calc(16*var(--u));border-radius:999px;background:rgba(8,10,8,.66);border:1px solid rgba(255,230,160,.35);font:800 max(12px,calc(16*var(--u))) var(--sans,system-ui);text-align:center;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff4d0}
.gm-blackjack .bj-port .bj-msg{white-space:normal;font-size:max(11px,calc(14*var(--u)));line-height:1.2;padding:calc(4*var(--u)) calc(12*var(--u));border-radius:calc(14*var(--u));max-width:84%}
.gm-blackjack .bj-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:calc(12*var(--u));padding:0 calc(14*var(--u)) calc(4*var(--u));background:linear-gradient(transparent,rgba(0,0,0,.55) 38%)}
.gm-blackjack .bj-bank{flex:0 0 calc(172*var(--u));display:flex;flex-direction:column;gap:1px;font:800 max(10px,calc(12*var(--u))) var(--sans,system-ui);color:rgba(255,236,190,.78);letter-spacing:.6px;text-transform:uppercase}
.gm-blackjack .bj-bank b{font:900 max(17px,calc(26*var(--u))) var(--sans,system-ui);color:#ffe28a;letter-spacing:0;text-transform:none;font-variant-numeric:tabular-nums}
.gm-blackjack .bj-bank .bj-k2 b{font-size:max(12px,calc(15*var(--u)));color:#fff}
.gm-blackjack .bj-main{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(5*var(--u))}
.gm-blackjack .bj-g{display:flex;align-items:center;justify-content:center;gap:calc(8*var(--u));flex-wrap:wrap}
.gm-blackjack .bj-g.chips{gap:calc(7*var(--u))}
.gm-blackjack .bj-btn{min-height:max(36px,calc(46*var(--u)));padding:0 calc(16*var(--u));border-radius:calc(14*var(--u));border:2px solid rgba(255,255,255,.3);background:linear-gradient(#3d4252,#222633);color:#fff;font:800 max(12px,calc(16*var(--u))) var(--sans,system-ui);box-shadow:0 calc(3*var(--u)) 0 rgba(0,0,0,.5);white-space:nowrap}
.gm-blackjack .bj-btn small{display:block;font:700 max(9px,calc(11*var(--u))) var(--sans,system-ui);opacity:.8;margin-top:-2px}
.gm-blackjack .bj-btn.gold{background:linear-gradient(#ffd45e,#e0a21a);border-color:#fff3c2;color:#2a1c00}
.gm-blackjack .bj-btn.green{background:linear-gradient(#45c463,#1f8a3a);border-color:#c9ffd6}
.gm-blackjack .bj-btn.red{background:linear-gradient(#ee5a4a,#b3261a);border-color:#ffd0ca}
.gm-blackjack .bj-btn.blue{background:linear-gradient(#4b8ff0,#1d55b3);border-color:#cfe3ff}
.gm-blackjack .bj-btn:disabled{opacity:.36;cursor:default;box-shadow:none}
.gm-blackjack .bj-btn:active:not(:disabled){transform:translateY(calc(2*var(--u)));box-shadow:0 calc(1*var(--u)) 0 rgba(0,0,0,.5)}
.gm-blackjack .bj-btn.rec{animation:bj-rec .8s infinite alternate;border-color:#9bffb0}
@keyframes bj-rec{from{box-shadow:0 0 0 0 rgba(120,255,160,0),0 3px 0 rgba(0,0,0,.5)}to{box-shadow:0 0 14px 4px rgba(120,255,160,.9),0 3px 0 rgba(0,0,0,.5)}}
.gm-blackjack .bj-chip{--c:#cf352c;--n:#fff;--t:#fff;width:calc(54*var(--u));height:calc(54*var(--u));min-width:36px;min-height:36px;border-radius:50%;border:0;padding:0;position:relative;background:repeating-conic-gradient(var(--n) 0 14deg,var(--c) 0 45deg);box-shadow:0 calc(3*var(--u)) 0 rgba(0,0,0,.55),0 calc(7*var(--u)) calc(10*var(--u)) rgba(0,0,0,.4);transition:transform .08s}
.gm-blackjack .bj-chip::before{content:'';position:absolute;inset:13%;border-radius:50%;background:var(--c);border:max(1px,calc(2*var(--u))) dashed var(--n)}
.gm-blackjack .bj-chip i{position:absolute;inset:0;display:grid;place-items:center;font:900 max(10px,calc(15*var(--u))) var(--sans,system-ui);font-style:normal;color:var(--t);z-index:1;text-shadow:0 1px 0 rgba(0,0,0,.35)}
.gm-blackjack .bj-chip:hover:not(:disabled){transform:translateY(calc(-4*var(--u)))}
.gm-blackjack .bj-chip:active:not(:disabled){transform:translateY(0) scale(.94)}
.gm-blackjack .bj-chip:disabled{filter:grayscale(.85) brightness(.55);cursor:default}
.gm-blackjack .bj-chip.c1{--c:#ecebe4;--n:#7f93ad;--t:#222}
.gm-blackjack .bj-chip.c5{--c:#cf352c}
.gm-blackjack .bj-chip.c25{--c:#17934f}
.gm-blackjack .bj-chip.c100{--c:#2a2b30}
.gm-blackjack .bj-chip.c500{--c:#7a3aae}
.gm-blackjack .bj-chip.c1000{--c:#e5b01d;--t:#3a2a00}
.gm-blackjack .bj-hint{font:800 max(11px,calc(14*var(--u))) var(--sans,system-ui);color:#aaffbc;background:rgba(0,30,10,.6);border:1px solid rgba(140,255,170,.4);border-radius:999px;padding:calc(2*var(--u)) calc(12*var(--u));white-space:nowrap}
.gm-blackjack .bj-wait{font:800 max(12px,calc(15*var(--u))) var(--sans,system-ui);color:#fff4d0;text-align:center}
.gm-blackjack .bj-port .bj-bar{flex-direction:column;justify-content:center;gap:calc(3*var(--u));padding:calc(2*var(--u)) calc(8*var(--u)) calc(4*var(--u))}
.gm-blackjack .bj-port .bj-bank{flex:none;flex-direction:row;align-items:baseline;gap:calc(12*var(--u))}
.gm-blackjack .bj-port .bj-main{flex:none;width:100%}
.gm-blackjack .bj-port .bj-chip{width:calc(46*var(--u));height:calc(46*var(--u))}
.gm-blackjack .bj-port .bj-btn{padding:0 calc(8*var(--u));font-size:max(11px,calc(14*var(--u)));min-height:max(36px,calc(42*var(--u)))}
.gm-blackjack .bj-port .bj-g{gap:calc(5*var(--u))}
.gm-blackjack .bj-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;pointer-events:auto;background:rgba(4,10,7,.68);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-blackjack .bj-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-blackjack .bj-box{width:100%;max-width:420px;margin:auto;background:linear-gradient(#25301f,#101a12);border:2px solid rgba(255,225,150,.35);border-radius:22px;padding:18px 18px 16px;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.55);animation:bj-in .3s cubic-bezier(.2,1.3,.4,1)}
.gm-blackjack .bj-box.wide{max-width:560px}
@keyframes bj-in{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-blackjack .bj-box h3{margin:2px 0 8px;font:900 22px var(--sans,system-ui);letter-spacing:.2px;color:#ffe9b0}
.gm-blackjack .bj-box p{margin:6px 0;font:700 14px/1.45 var(--sans,system-ui);color:rgba(255,255,255,.88)}
.gm-blackjack .bj-kick{font:900 11px var(--sans,system-ui)!important;letter-spacing:1.5px;text-transform:uppercase;color:#f0c24a!important;margin:0 0 2px!important}
.gm-blackjack .bj-logo{font:900 italic 46px/1 ${SERIF};letter-spacing:1px;margin:4px 0 2px;background:linear-gradient(#fff3c2,#e6b341 55%,#a8741a);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 3px 0 rgba(0,0,0,.55))}
.gm-blackjack .bj-sub{font:800 12px var(--sans,system-ui)!important;letter-spacing:3px;text-transform:uppercase;color:#cfe8d3!important;margin:0 0 14px!important}
.gm-blackjack .bj-big{display:block;width:100%;min-height:52px;margin:9px 0;border:2px solid rgba(255,255,255,.4);border-radius:16px;color:#fff;font:900 19px/1.1 var(--sans,system-ui);text-shadow:0 2px 0 rgba(0,0,0,.3);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px;cursor:pointer}
.gm-blackjack .bj-big small{display:block;font:700 12px var(--sans,system-ui);opacity:.88;text-shadow:none;margin-top:2px}
.gm-blackjack .bj-big.gold{background:linear-gradient(#ffd45e,#e0a21a);color:#2a1c00;text-shadow:none;border-color:#fff3c2}
.gm-blackjack .bj-big.green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-blackjack .bj-big.blue{background:linear-gradient(#4b8ff0,#1d55b3)}
.gm-blackjack .bj-big.gray{background:linear-gradient(#59607a,#343a4f)}
.gm-blackjack .bj-big.red{background:linear-gradient(#ee5a4a,#b3261a)}
.gm-blackjack .bj-sm{min-height:42px;padding:0 14px;border-radius:13px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans,system-ui);margin:4px;cursor:pointer}
.gm-blackjack .bj-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-blackjack .bj-opt{display:flex;align-items:center;gap:10px;margin:8px 0;text-align:left}
.gm-blackjack .bj-opt>span{flex:0 0 34%;font:800 13px/1.2 var(--sans,system-ui);color:rgba(255,255,255,.88)}
.gm-blackjack .bj-seg{flex:1;display:flex;gap:4px;flex-wrap:wrap}
.gm-blackjack .bj-seg button{flex:1;min-width:38px;min-height:38px;border-radius:11px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans,system-ui);padding:0 6px;cursor:pointer}
.gm-blackjack .bj-seg button.on{background:#f0c24a;border-color:#fff;color:#1b1b1f}
.gm-blackjack .bj-seg button:disabled{opacity:.4;cursor:default}
.gm-blackjack .bj-sec{margin:14px 0 2px!important;text-align:left;font:900 11px var(--sans,system-ui)!important;letter-spacing:1.3px;text-transform:uppercase;color:#f0c24a!important}
.gm-blackjack .bj-rules{text-align:left}
.gm-blackjack .bj-rules p{font:700 13px/1.45 var(--sans,system-ui)!important}
.gm-blackjack .bj-rules kbd{background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:4px;padding:0 5px;font:800 12px var(--sans,system-ui)}
.gm-blackjack .bj-st{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:10px 0}
.gm-blackjack .bj-st div{background:rgba(255,255,255,.07);border-radius:10px;padding:6px 2px}
.gm-blackjack .bj-st b{display:block;font:900 18px var(--sans,system-ui);color:#ffe28a}
.gm-blackjack .bj-st span{font:700 10px var(--sans,system-ui);text-transform:uppercase;letter-spacing:.6px;color:rgba(255,255,255,.7)}
.gm-blackjack .bj-chart{overflow-x:auto;margin:6px 0}
.gm-blackjack .bj-chart table{border-collapse:collapse;margin:0 auto;font:800 11px var(--sans,system-ui)}
.gm-blackjack .bj-chart th,.gm-blackjack .bj-chart td{width:26px;height:22px;text-align:center;border:1px solid rgba(0,0,0,.35);padding:0}
.gm-blackjack .bj-chart th{background:rgba(255,255,255,.1);color:#ffe9b0}
.gm-blackjack .bj-chart th.l{width:44px}
.gm-blackjack .bj-chart td.H{background:#c94b3c}
.gm-blackjack .bj-chart td.S{background:#e8c84a;color:#2a1c00}
.gm-blackjack .bj-chart td.D{background:#3d8fe0}
.gm-blackjack .bj-chart td.d{background:#5bb3b3;color:#062222}
.gm-blackjack .bj-chart td.P{background:#3aa65a}
.gm-blackjack .bj-chart td.R{background:#9a63c4}
.gm-blackjack .bj-leg{display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;font:700 11px var(--sans,system-ui);color:rgba(255,255,255,.8);margin:6px 0}
.gm-blackjack .bj-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:4px;vertical-align:-2px}
`;

  const HELP = '<kbd>H</kbd> hit · <kbd>S</kbd> stand · <kbd>D</kbd> double · <kbd>P</kbd> split · <kbd>R</kbd> surrender · <kbd>Y</kbd>/<kbd>N</kbd> insurance · <kbd>1</kbd>-<kbd>6</kbd> chips · <kbd>Space</kbd> deal · <kbd>B</kbd> rebet · <kbd>T</kbd> strategy hint';

  const SET = [
    ['decks', 'Decks in the shoe', [[1, '1'], [2, '2'], [4, '4'], [6, '6'], [8, '8']]],
    ['h17', 'Dealer on soft 17', [[false, 'Stands'], [true, 'Hits']]],
    ['pay', 'Blackjack pays', [[1.5, '3 to 2'], [1.2, '6 to 5']]],
    ['dbl', 'Double down on', [['any', 'Any two cards'], ['9-11', '9 to 11'], ['10-11', '10 or 11']]],
    ['das', 'Double after split', [[true, 'Yes'], [false, 'No']]],
    ['surr', 'Late surrender', [[true, 'Yes'], [false, 'No']]],
    ['rsa', 'Re-split aces', [[false, 'No'], [true, 'Yes']]],
    ['min', 'Table minimum', [[5, '$5'], [10, '$10'], [25, '$25'], [100, '$100']]],
    ['start', 'Starting bankroll', [[500, '$500'], [1000, '$1,000'], [5000, '$5K'], [10000, '$10K']]],
    ['bots', 'Bots at the table (solo)', [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']]],
    ['fast', 'Dealing speed', [[false, 'Normal'], [true, 'Fast']]]
  ];
  const HS = [1, .86, .74, .66], HP = [0, 86, 68, 58];
  const ALABEL = { hit: 'Hit', stand: 'Stand', double: 'Double down', split: 'Split', surrender: 'Surrender' };

  Ameplay.register({
    id: 'blackjack',
    title: 'Blackjack',
    category: 'Board',
    tint: '#12703f',
    blurb: 'A full casino blackjack table: hole card and peek, split, double, insurance, surrender, a multi-deck shoe with cut card, and up to six players online.',
    help: HELP,
    better: 'high',
    width: 1000,
    format: v => '$' + Math.round(v).toLocaleString('en-US'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="26" height="38" rx="4" transform="rotate(-12 21 31)"/><rect x="26" y="10" width="26" height="38" rx="4" transform="rotate(10 39 29)"/><path d="M39 22l5 7-5 3-5-3z"/><ellipse cx="46" cy="50" rx="11" ry="6"/><ellipse cx="46" cy="46" rx="11" ry="6"/></svg>',
    css: CSS,
    _t: { Table, advice, tot, legalHand, hardRow, softRow, pairRow, chipsOf },
    mount(root, api) {
      const SV = Object.assign({ bank: 0 }, api.load() || {});
      SV.st = Object.assign({ h: 0, w: 0, l: 0, p: 0, b: 0 }, SV.st || {});
      const OP = Object.assign({ decks: 6, h17: false, pay: 1.5, surr: true, das: true, rsa: false, dbl: 'any', min: 5, start: 1000, bots: 2, hint: false, fast: false }, SV.op || {});
      const persist = () => { SV.op = OP; api.save(SV); };
      const rulesOf = () => ({ decks: OP.decks, h17: OP.h17, pay: OP.pay, surr: OP.surr, das: OP.das, rsa: OP.rsa, dbl: OP.dbl, min: OP.min, start: OP.start });
      const now = () => performance.now();

      const wrap = document.createElement('div'); wrap.className = 'bj-wrap';
      const cv = document.createElement('canvas');
      cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Blackjack table');
      const ui = document.createElement('div'); ui.className = 'bj-ui';
      ui.innerHTML = `<div class="bj-top"><button class="bj-ib" data-u="menu" aria-label="Menu">${ICON_MENU}</button><button class="bj-ib" data-u="hint" aria-pressed="false" aria-label="Basic strategy hint">${ICON_BULB}<span>Hint</span></button><div class="bj-net" hidden><i></i><span>Online</span></div></div>
<div class="bj-msg" aria-live="polite"></div>
<div class="bj-bar"><div class="bj-bank"><span>Bankroll</span><b data-u="bank">$0</b><span class="bj-k2">Bet <b data-u="bet">$0</b></span></div>
<div class="bj-main">
<div class="bj-hint" hidden><span></span></div>
<div class="bj-g chips" data-g="chips">${CHIPS.map(v => `<button class="bj-chip c${v}" data-chip="${v}" aria-label="Add $${v}"><i>${chipLab(v)}</i></button>`).join('')}</div>
<div class="bj-g" data-g="bet"><button class="bj-btn" data-a="clr">Clear</button><button class="bj-btn" data-a="rebet">Rebet</button><button class="bj-btn" data-a="x2">x2</button><button class="bj-btn gold" data-a="deal">Deal</button><button class="bj-btn" data-a="sit">Sit out</button></div>
<div class="bj-g" data-g="play"><button class="bj-btn green" data-a="hit">Hit</button><button class="bj-btn red" data-a="stand">Stand</button><button class="bj-btn blue" data-a="double">Double</button><button class="bj-btn gold" data-a="split">Split</button><button class="bj-btn" data-a="surrender">Surrender</button></div>
<div class="bj-g" data-g="ins"><button class="bj-btn gold" data-a="insy">Insurance</button><button class="bj-btn" data-a="insn">No thanks</button></div>
<div class="bj-g" data-g="rebuy"><span class="bj-wait">You are out of chips</span><button class="bj-btn gold" data-a="rebuy">Rebuy</button></div>
<div class="bj-wait" data-g="wait"></div>
</div></div>
<div class="bj-pane" hidden></div>`;
      wrap.append(cv, ui); root.append(wrap);
      const ctx = cv.getContext('2d');
      const $u = s => ui.querySelector(s);
      const pane = $u('.bj-pane'), msgEl = $u('.bj-msg'), barEl = $u('.bj-bar'), netEl = $u('.bj-net'), hintEl = $u('.bj-hint'), hintTx = hintEl.firstChild;
      const bankEl = $u('[data-u=bank]'), betEl = $u('[data-u=bet]'), hintBtn = $u('[data-u=hint]');
      const grp = {};
      ui.querySelectorAll('[data-g]').forEach(g => { grp[g.dataset.g] = g; });
      const btn = {};
      ui.querySelectorAll('[data-a]').forEach(b => { btn[b.dataset.a] = b; });
      const chipBtn = Array.from(ui.querySelectorAll('[data-chip]'));

      let ac = null, master = null, noise = null;
      function audio() {
        if (api.muted) return null;
        if (!ac) {
          const A = window.AudioContext || window.webkitAudioContext;
          if (!A) return null;
          try { ac = new A(); } catch (e) { return null; }
          master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate >> 1, ac.sampleRate);
          const d = noise.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
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
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
      }
      const snd = {
        deal() { if (!audio()) return; const t = ac.currentTime; nz(t, .1, 2600, .7, .55, 900); nz(t + .07, .03, 1400, 2, .25); },
        flip() { if (!audio()) return; const t = ac.currentTime; nz(t, .07, 3200, 1, .45, 1300); nz(t + .08, .05, 1900, 1.4, .3); },
        chip() { if (!audio()) return; const t = ac.currentTime; nz(t, .035, 5200, 3, .5); tn(t, .05, 'square', 2300, 1700, .03); nz(t + .045, .03, 4300, 3, .35); tn(t + .045, .05, 'square', 2000, 1500, .025); },
        click() { if (!audio()) return; const t = ac.currentTime; tn(t, .03, 'square', 900, 650, .025); },
        shuffle() { if (!audio()) return; const t = ac.currentTime; for (let i = 0; i < 26; i++) nz(t + i * .085, .06, 1500 + Math.random() * 1500, .8, .22 + (i % 3) * .06, 700); },
        peek() { if (!audio()) return; const t = ac.currentTime; nz(t, .12, 1800, 1, .3, 900); },
        win() { if (!audio()) return; const t = ac.currentTime; [523, 659, 784].forEach((f, i) => tn(t + i * .09, .3, 'sine', f, f, .08)); snd.chip(); },
        bj() { if (!audio()) return; const t = ac.currentTime; [523, 659, 784, 1046, 1318].forEach((f, i) => { tn(t + i * .08, .5, 'sine', f, f, .075); tn(t + i * .08, .4, 'triangle', f / 2, f / 2, .04); }); },
        lose() { if (!audio()) return; const t = ac.currentTime; tn(t, .38, 'triangle', 300, 120, .09); },
        bust() { if (!audio()) return; const t = ac.currentTime; tn(t, .3, 'sawtooth', 240, 90, .05); tn(t + .12, .3, 'triangle', 180, 70, .07); },
        push() { if (!audio()) return; const t = ac.currentTime; tn(t, .22, 'sine', 440, 440, .06); tn(t + .12, .22, 'sine', 440, 440, .05); }
      };

      const M = { mode: 'none', eng: null, me: -1, rules: null, pids: [], tok: 0, hooked: false, size: 4, bots: false, players: [] };
      let S = null, SAT = 0, G = null, DPR = 1, PORT = null, bgC = null, scl = 0;
      const sprites = new Map();
      const DC = new Map(), PILES = [], FXT = [], SPK = [], RS = new Map(), DISP = [];
      let TG = [], peekT = 0, shufT = 0, lastMsg = '', paneK = '', paneH = null, lastHint = '', sentBank = -1;

      const RU = () => M.rules || DEF2();
      const DEF2 = () => Object.assign({ maxHands: 4, ins: true, max: OP.min * 200 }, rulesOf());

      function mkGeo(port) {
        const g = port
          ? { port, W: 400, H: 720, cx: 200, cy: 36, rail: [198, 546], felt: [184, 532], sr: [152, 418], sa: 28, k: .62, hd: 47, dy: 104, bar: 592, tcy: 98, tr: [112, 134, 158], shoe: [338, 76], tray: [64, 76], chipr: [200, 56], msg: 138, pw: 70, pf: 9.5 }
          : { port, W: 1000, H: 720, cx: 500, cy: 56, rail: [498, 548], felt: [484, 522], sr: [395, 440], sa: 26, k: 1, hd: 76, dy: 142, bar: 600, tcy: 56, tr: [214, 240, 270], shoe: [782, 96], tray: [218, 96], chipr: [500, 78], msg: 196, pw: 112, pf: 11.5 };
        g.dealer = [g.cx, g.dy]; g.dstep = CWB * g.k * .8;
        g.seat = []; g.ins = [];
        for (let i = 0; i < 6; i++) {
          const a = (2.5 - i) * g.sa * Math.PI / 180;
          g.seat.push({ a, x: g.cx + g.sr[0] * Math.sin(a), y: g.cy + g.sr[1] * Math.cos(a) });
          g.ins.push(port ? { x: g.cx + g.sr[0] * Math.sin(a) + (a > 0 ? 28 : -28), y: g.cy + g.sr[1] * Math.cos(a) + 6 } : { x: g.cx + g.tr[2] * Math.sin(a * .86), y: g.tcy + g.tr[2] * Math.cos(a * .86) });
        }
        return g;
      }
      function hl(i, j, nh, cnt) {
        const p = G.seat[i], ux = -Math.sin(p.a), uy = -Math.cos(p.a);
        const s = G.k * HS[nh - 1], ox = (j - (nh - 1) / 2) * HP[nh - 1] * G.k;
        const hx = p.x + ux * G.hd + ox, hy = p.y + uy * G.hd;
        const sx = 24 * s, sy = 11 * s, cx = [], cy = [];
        for (let m = 0; m < cnt; m++) { cx.push(hx + (m - (cnt - 1) / 2) * sx); cy.push(hy - (m - (cnt - 1) / 2) * sy); }
        return { cx, cy, s, bx: p.x + ox, by: p.y, hx, hy, px: hx, py: hy - CHB * s / 2 - Math.max(0, cnt - 1) / 2 * sy - 12 * G.k };
      }
      const jit = n => (((n * 2654435761) >>> 0) % 1000 / 1000 - .5) * .09;
      function retarget() {
        TG = [];
        if (!S || !G) return;
        const dN = S.d.length;
        S.d.forEach((c, i) => TG.push({ n: c >> 6, f: c & 63, x: G.dealer[0] + (i - (dN - 1) / 2) * G.dstep, y: G.dealer[1], s: G.k, r: jit(c >> 6) }));
        S.s.forEach((x, i) => {
          if (!x) return;
          x.hs.forEach((h, j) => {
            const L = hl(i, j, x.hs.length, h.c.length);
            h.c.forEach((c, m) => TG.push({ n: c >> 6, f: c & 63, x: L.cx[m], y: L.cy[m], s: L.s, r: jit(c >> 6) }));
          });
        });
      }
      const faceSpr = f => {
        let s = sprites.get(f);
        if (!s) { s = makeFace(f, DPR * G.k); sprites.set(f, s); }
        return s;
      };
      const backSpr = () => {
        let s = sprites.get('b');
        if (!s) { s = makeBack(DPR * G.k); sprites.set('b', s); }
        return s;
      };

      function paintBG() {
        const W = G.W, H = G.H, k = G.k, cx = G.cx, cy = G.cy;
        bgC = document.createElement('canvas'); bgC.width = Math.round(W * DPR); bgC.height = Math.round(H * DPR);
        const c = bgC.getContext('2d'); c.scale(DPR, DPR);
        const rg = c.createRadialGradient(W / 2, H * .4, 40, W / 2, H * .4, W * .75);
        rg.addColorStop(0, '#33201a'); rg.addColorStop(1, '#0a0605');
        c.fillStyle = rg; c.fillRect(0, 0, W, H);
        c.save(); c.globalAlpha = .06; c.strokeStyle = '#d9b36a'; c.lineWidth = 1;
        for (let i = -H; i < W + H; i += 30) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + H, H); c.stroke(); c.beginPath(); c.moveTo(i + H, 0); c.lineTo(i, H); c.stroke(); }
        c.restore();
        const ty = cy - 14 * k;
        c.fillStyle = '#12141a';
        c.beginPath(); c.moveTo(cx - 190 * k, ty + 6); c.quadraticCurveTo(cx - 170 * k, ty - 34 * k, cx - 80 * k, ty - 40 * k); c.lineTo(cx + 80 * k, ty - 40 * k); c.quadraticCurveTo(cx + 170 * k, ty - 34 * k, cx + 190 * k, ty + 6); c.closePath(); c.fill();
        c.fillStyle = '#7a1424';
        c.beginPath(); c.moveTo(cx - 52 * k, ty - 40 * k); c.lineTo(cx - 30 * k, ty + 6); c.lineTo(cx, ty - 14 * k); c.lineTo(cx, ty - 40 * k); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(cx + 52 * k, ty - 40 * k); c.lineTo(cx + 30 * k, ty + 6); c.lineTo(cx, ty - 14 * k); c.lineTo(cx, ty - 40 * k); c.closePath(); c.fill();
        c.fillStyle = '#f3efe4';
        c.beginPath(); c.moveTo(cx - 24 * k, ty - 40 * k); c.lineTo(cx + 24 * k, ty - 40 * k); c.lineTo(cx, ty + 6); c.closePath(); c.fill();
        c.fillStyle = '#c8202c';
        c.beginPath(); c.moveTo(cx, ty - 22 * k); c.lineTo(cx - 13 * k, ty - 30 * k); c.lineTo(cx - 13 * k, ty - 14 * k); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(cx, ty - 22 * k); c.lineTo(cx + 13 * k, ty - 30 * k); c.lineTo(cx + 13 * k, ty - 14 * k); c.closePath(); c.fill();
        c.fillStyle = '#a01822'; c.beginPath(); c.arc(cx, ty - 22 * k, 3.6 * k, 0, TAU); c.fill();
        const tagW = 52 * k, tagH = 16 * k;
        c.fillStyle = '#e1b84c'; c.beginPath(); c.roundRect(cx + 78 * k, ty - 20 * k, tagW, tagH, 3 * k); c.fill();
        c.fillStyle = '#3a2a00'; c.font = `800 ${Math.max(8, 9.5 * k)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DEALER', cx + 78 * k + tagW / 2, ty - 20 * k + tagH / 2 + 1);
        const half = (rx, ry, up) => { c.beginPath(); c.moveTo(cx - rx, cy - up); c.lineTo(cx + rx, cy - up); c.lineTo(cx + rx, cy); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); c.closePath(); };
        c.save();
        c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
        half(G.rail[0], G.rail[1], 14 * k);
        const wg = c.createLinearGradient(cx - G.rail[0], 0, cx + G.rail[0], 0);
        wg.addColorStop(0, '#4f2f14'); wg.addColorStop(.2, '#a06a34'); wg.addColorStop(.5, '#7a4a21'); wg.addColorStop(.8, '#a06a34'); wg.addColorStop(1, '#4f2f14');
        c.fillStyle = wg; c.fill();
        c.restore();
        half(G.rail[0], G.rail[1], 14 * k);
        const vg = c.createLinearGradient(0, cy, 0, cy + G.rail[1]);
        vg.addColorStop(0, 'rgba(255,255,255,.14)'); vg.addColorStop(.5, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
        c.fillStyle = vg; c.fill();
        c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,225,170,.35)'; c.stroke();
        half(G.rail[0] - 13 * k, G.rail[1] - 13 * k, 7 * k);
        c.fillStyle = '#1b110c'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a251a'; c.stroke();
        half(G.felt[0], G.felt[1], 0);
        const fg = c.createRadialGradient(cx, cy + G.felt[1] * .42, G.felt[1] * .05, cx, cy + G.felt[1] * .42, G.felt[1] * 1.05);
        fg.addColorStop(0, '#2fa05e'); fg.addColorStop(.55, '#17703d'); fg.addColorStop(1, '#0a3f22');
        c.fillStyle = fg; c.fill();
        c.save(); half(G.felt[0], G.felt[1], 0); c.clip();
        let sd = 7;
        const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        for (let i = 0; i < 4200; i++) { c.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.07)'; c.fillRect(rnd() * W, cy + rnd() * G.felt[1], 1 + rnd() * 1.4, 1 + rnd() * 1.4); }
        const sh = c.createLinearGradient(0, cy, 0, cy + 60 * k); sh.addColorStop(0, 'rgba(0,0,0,.4)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = sh; c.fillRect(0, cy, W, 60 * k);
        c.restore();
        const gold = 'rgba(244,218,150,.88)', gold2 = 'rgba(244,218,150,.5)';
        c.lineWidth = Math.max(1.2, 2 * k); c.strokeStyle = gold2;
        c.beginPath(); c.ellipse(cx, cy, G.felt[0] - 15 * k, G.felt[1] - 15 * k, 0, 0, Math.PI); c.stroke();
        const R0 = RU();
        arcText(c, 'BLACKJACK PAYS ' + (R0.pay === 1.2 ? '6 TO 5' : '3 TO 2'), cx, G.tcy, G.tr[0], Math.PI / 2, `900 ${Math.round(30 * Math.max(k, .62) * (G.port ? .86 : 1))}px ${SERIF}`, '#f5dc92', G.port ? 2.2 : 4);
        arcText(c, 'Dealer must ' + (R0.h17 ? 'hit' : 'stand on') + ' soft 17', cx, G.tcy, G.tr[1], Math.PI / 2, `italic 700 ${Math.round(21 * Math.max(k, .62) * (G.port ? .88 : 1))}px ${SERIF}`, '#e9e3cb', G.port ? .8 : 1.6);
        const ri = G.tr[2], bw = 15 * Math.max(k, .7), span = G.port ? .85 : 1.05;
        c.strokeStyle = gold; c.lineWidth = Math.max(1.2, 1.8 * k);
        if (!G.port) for (const rr of [ri - bw, ri + bw]) { c.beginPath(); c.arc(cx, G.tcy, rr, Math.PI / 2 - span, Math.PI / 2 + span); c.stroke(); }
        if (!G.port) for (const sg of [-1, 1]) { const a = Math.PI / 2 + sg * span; c.beginPath(); c.moveTo(cx + (ri - bw) * Math.cos(a), G.tcy + (ri - bw) * Math.sin(a)); c.lineTo(cx + (ri + bw) * Math.cos(a), G.tcy + (ri + bw) * Math.sin(a)); c.stroke(); }
        arcText(c, 'INSURANCE PAYS 2 TO 1', cx, G.tcy, ri + (G.port ? 0 : 5 * Math.max(k, .7)), Math.PI / 2, `800 ${Math.round(15 * Math.max(k, .72))}px ${FONT}`, gold, G.port ? 1.4 : 3.2);
        for (let i = 0; i < 6; i++) {
          const p = G.seat[i], r = 31 * k;
          c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fillStyle = 'rgba(0,0,0,.14)'; c.fill();
          c.lineWidth = Math.max(1.4, 2.2 * k); c.strokeStyle = gold; c.stroke();
          c.beginPath(); c.arc(p.x, p.y, r - 5 * k, 0, TAU); c.lineWidth = 1; c.strokeStyle = gold2; c.stroke();
        }
        const rw = 296 * k, rh = 34 * k, rx0 = G.chipr[0] - rw / 2, ry0 = G.chipr[1] - rh / 2;
        const mg = c.createLinearGradient(0, ry0, 0, ry0 + rh); mg.addColorStop(0, '#6c6f78'); mg.addColorStop(.5, '#2c2e35'); mg.addColorStop(1, '#17181c');
        c.fillStyle = mg; c.beginPath(); c.roundRect(rx0, ry0, rw, rh, 8 * k); c.fill();
        c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,.3)'; c.stroke();
        CHIPS.forEach((v, i) => {
          const sx = rx0 + 26 * k + i * (rw - 52 * k) / 5;
          for (let q = 0; q < 4; q++) chipDraw(c, sx, ry0 + rh * .62 - q * 3.4 * k, 15 * k, 5.6 * k, v, null);
        });
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(rx0 + 4, ry0 + rh * .6, rw - 8, rh * .4);
        hl0 = null;
      }
      let hl0 = null;

      function fit(force) {
        const port = (root.clientWidth || 800) < 640;
        if (!force && port === PORT && G) return;
        PORT = port; G = mkGeo(port);
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(G.W * DPR); cv.height = Math.round(G.H * DPR);
        wrap.style.width = `min(100%, ${G.W}px, calc((100dvh - var(--goff, 250px)) * ${(G.W / G.H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${G.W} / ${G.H}`;
        wrap.classList.toggle('bj-port', port);
        barEl.style.height = ((G.H - G.bar) / G.H * 100).toFixed(2) + '%';
        msgEl.style.top = (G.msg / G.H * 100).toFixed(2) + '%';
        sprites.clear(); paintBG(); retarget(); scl = 0;
        DC.forEach(o => { o.x = G.shoe[0]; o.y = G.shoe[1]; });
      }
      function rescale() {
        const w = wrap.clientWidth;
        if (!w || w === scl) return;
        scl = w; wrap.style.setProperty('--s', (w / G.W).toFixed(4));
      }

      function stepCards(t, dt) {
        const a = 1 - Math.exp(-dt * 11), seen = new Set();
        for (const g of TG) {
          seen.add(g.n);
          let o = DC.get(g.n);
          if (!o) { o = { x: G.shoe[0] - 8 * G.k, y: G.shoe[1] + 4, s: g.s * .85, r: -.6, f: g.f, fl: 0, gone: 0 }; DC.set(g.n, o); }
          o.gone = 0;
          o.x += (g.x - o.x) * a; o.y += (g.y - o.y) * a; o.s += (g.s - o.s) * a; o.r += (g.r - o.r) * a;
          if (o.f === 63 && g.f !== 63) o.fl = t;
          o.f = g.f; o.n = g.n;
        }
        let k = 0;
        for (const [n, o] of DC) {
          if (seen.has(n)) continue;
          if (!o.gone) o.gone = t + (k++) * 45;
          if (t >= o.gone) {
            const b = 1 - Math.exp(-dt * 9);
            o.x += (G.tray[0] - o.x) * b; o.y += (G.tray[1] - o.y) * b; o.s += (G.k * .5 - o.s) * b; o.r += (.45 - o.r) * b;
            if (t - o.gone > 700) DC.delete(n);
          }
        }
      }
      function drawCard(o, t, hole) {
        const w = CWB * o.s, h = CHB * o.s;
        let face = o.f !== 63, sx = 1, lift = 0;
        if (o.fl) { const p = Math.min(1, (t - o.fl) / 380); sx = Math.abs(Math.cos(p * Math.PI)); face = p >= .5; lift = Math.sin(p * Math.PI); if (p >= 1) o.fl = 0; }
        ctx.save();
        if (hole && peekT && t - peekT < 1500 && o.f === 63) {
          const p = Math.sin(Math.min(1, (t - peekT) / 1500) * Math.PI);
          ctx.translate(o.x - w / 2, o.y + h / 2); ctx.rotate(-.5 * p);
          ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.roundRect(3, -h + 4, w, h, 6 * o.s); ctx.fill();
          ctx.drawImage(backSpr(), 0, -h, w, h);
          ctx.restore();
          return;
        }
        ctx.translate(o.x, o.y - lift * 10 * G.k); ctx.rotate(o.r);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.roundRect(-w * sx / 2 + 2.5 * G.k, -h / 2 + 3.5 * G.k, w * sx, h, 6 * o.s); ctx.fill();
        const z = 1 + lift * .07;
        ctx.scale(Math.max(.03, sx) * z, z);
        ctx.drawImage(face ? faceSpr(o.f) : backSpr(), -w / 2, -h / 2, w, h);
        ctx.restore();
      }
      function pill(x, y, text, bg, fg, size, bd) {
        const f = Math.max(9, size);
        ctx.font = `800 ${f}px ${FONT}`;
        const w = ctx.measureText(text).width + f * 1.3, h = f * 1.65;
        ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
        ctx.fillStyle = bg; ctx.fill();
        if (bd) { ctx.lineWidth = 1.4; ctx.strokeStyle = bd; ctx.stroke(); }
        ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1);
      }
      function outText(text, x, y, size, fill, weight) {
        ctx.font = `${weight || 900} ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(2, size * .22); ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y); ctx.fillStyle = fill; ctx.fillText(text, x, y);
      }
      const RESC = { win: ['WIN', '#1e9d4d', '#fff'], bj: ['BLACKJACK', '#e8b520', '#2a1c00'], even: ['EVEN MONEY', '#e8b520', '#2a1c00'], push: ['PUSH', '#6b7385', '#fff'], lose: ['LOSE', '#b3261a', '#fff'], bust: ['BUST', '#b3261a', '#fff'], surr: ['SURRENDER', '#6b7385', '#fff'] };
      function handLabel(h) {
        const fs = h.c.map(c => c & 63), v = tot(fs);
        if (h.r) return RESC[h.r];
        if (h.st === 'bj') return ['BLACKJACK', '#e8b520', '#2a1c00'];
        if (v.t > 21) return ['BUST', '#b3261a', '#fff'];
        if (h.st === 'surr') return RESC.surr;
        const txt = v.soft && v.t < 21 ? 'Soft ' + v.t : String(v.t);
        return [txt, 'rgba(8,10,8,.82)', '#fff'];
      }
      const money2 = v => money(Math.round(v * 100) / 100);

      function drawShoe(t) {
        const k = G.k, x = G.shoe[0], y = G.shoe[1], w = 96 * k, h = 58 * k;
        const sh = S ? S.sh : [0, 1, 0, 0];
        const full = !S ? 1 : sh[1] ? sh[0] / sh[1] : 0;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 4, y - h / 2 + 7, w, h, 10 * k); ctx.fill();
        const bg = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); bg.addColorStop(0, '#3a3d46'); bg.addColorStop(.5, '#17181d'); bg.addColorStop(1, '#0c0d10');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 10 * k); ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
        const wx = x - w / 2 + 9 * k, wy = y - h / 2 + 9 * k, ww = w - 18 * k, wh = h - 22 * k;
        ctx.fillStyle = '#07080a'; ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 4 * k); ctx.fill();
        const fw = ww * Math.max(0, Math.min(1, full));
        if (fw > 0.5) {
          const sg = ctx.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, '#f4f1e8'); sg.addColorStop(1, '#bdb8a8');
          ctx.fillStyle = sg; ctx.fillRect(wx, wy + 2, fw, wh - 4);
          ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
          ctx.beginPath(); for (let i = 3; i < fw; i += 3) { ctx.moveTo(wx + i, wy + 2); ctx.lineTo(wx + i, wy + wh - 2); } ctx.stroke();
          if (S && sh[1] && sh[2] > 0 && sh[2] < sh[0]) {
            const cxp = wx + ww * (sh[2] / sh[1]);
            ctx.fillStyle = '#f2c230'; ctx.fillRect(cxp - 1.5 * k, wy, 3 * k, wh);
          }
        }
        ctx.fillStyle = '#e1b84c'; ctx.fillRect(x - w / 2 + 6 * k, y + h / 2 - 11 * k, w - 12 * k, 3 * k);
        ctx.font = `900 ${Math.max(7, 8.5 * k)}px ${FONT}`; ctx.fillStyle = '#e1b84c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('SHOE', x, y + h / 2 - 4.5 * k);
        ctx.fillStyle = '#0a0b0e'; ctx.fillRect(x - w / 2 - 3, y - 4 * k, 5, 12 * k);
        ctx.restore();
      }
      function drawTray() {
        const k = G.k, x = G.tray[0], y = G.tray[1], w = 100 * k, h = 58 * k;
        const sh = S ? S.sh : [0, 1, 0, 0], decks = Math.max(1, sh[1] / 52);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 3, y - h / 2 + 6, w, h, 8 * k); ctx.fill();
        ctx.fillStyle = 'rgba(160,190,200,.18)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 8 * k); ctx.fill();
        const fr = Math.min(1, sh[3] / (decks * 52 * .85)), bh = (h - 18 * k) * fr;
        if (bh > 1) {
          const gx = x - w / 2 + 8 * k, gw = w - 16 * k, gy = y + h / 2 - 8 * k - bh;
          const g = ctx.createLinearGradient(gx, 0, gx + gw, 0); g.addColorStop(0, '#d9d4c4'); g.addColorStop(.5, '#faf8f0'); g.addColorStop(1, '#cfc9b6');
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(gx, gy, gw, bh, 2 * k); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 3; i < bh; i += 3) { ctx.moveTo(gx, gy + i); ctx.lineTo(gx + gw, gy + i); } ctx.stroke();
        }
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(210,235,245,.6)'; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, 8 * k); ctx.stroke();
        ctx.fillStyle = 'rgba(210,235,245,.28)'; ctx.fillRect(x - w / 2 + 2, y + h / 2 - 22 * k, w - 4, 20 * k);
        ctx.font = `900 ${Math.max(7, 8.5 * k)}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('DISCARDS', x, y - h / 2 - 8 * k);
        ctx.restore();
      }
      function drawShuffle(t) {
        if (!shufT) return;
        const u = (t - shufT) / 2700;
        if (u > 1.1) { shufT = 0; return; }
        for (let i = 0; i < 18; i++) {
          const p = (u * 2700 - i * 70) / 750;
          if (p < 0 || p > 1) continue;
          const e = p * p * (3 - 2 * p);
          const x = G.tray[0] + (G.shoe[0] - G.tray[0]) * e, y = G.tray[1] + (G.shoe[1] - G.tray[1]) * e - Math.sin(p * Math.PI) * 60 * G.k - (i % 3) * 5;
          const w = CWB * G.k * .55, h = CHB * G.k * .55;
          ctx.save(); ctx.translate(x, y); ctx.rotate((e - .5) * 1.1 + (i % 2 ? .3 : -.3));
          ctx.drawImage(backSpr(), -w / 2, -h / 2, w, h);
          ctx.restore();
        }
      }

      function pileXY(p, t) {
        const u = t - p.t0, P = p.pts;
        if (u <= P[0][2]) return [P[0][0], P[0][1]];
        for (let i = 1; i < P.length; i++) {
          if (u <= P[i][2]) {
            const q = (u - P[i - 1][2]) / Math.max(1, P[i][2] - P[i - 1][2]), e = q * q * (3 - 2 * q);
            return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * e, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * e - Math.sin(q * Math.PI) * 8 * G.k];
          }
        }
        const L = P[P.length - 1];
        return [L[0], L[1]];
      }
      function addPile(a, pts, delay, end, fade) {
        if (a <= 0) return;
        PILES.push({ a, pts, t0: now() + delay, end, fade });
      }
      function drawPiles(t) {
        for (let i = PILES.length - 1; i >= 0; i--) {
          const p = PILES[i], u = t - p.t0;
          if (u > p.end) { PILES.splice(i, 1); continue; }
          if (u < 0) continue;
          const [x, y] = pileXY(p, t);
          ctx.save();
          if (p.fade && u > p.end - 220) ctx.globalAlpha = Math.max(0, (p.end - u) / 220);
          stackDraw(ctx, x, y, p.a, 15 * G.k, 7.2 * G.k);
          ctx.restore();
        }
      }
      function fxText(text, x, y, color, size, delay, dur) {
        FXT.push({ text, x, y, color, size, t0: now() + (delay || 0), dur: dur || 1500 });
      }
      function drawFx(t, dt) {
        for (let i = FXT.length - 1; i >= 0; i--) {
          const f = FXT[i], u = (t - f.t0) / f.dur;
          if (u > 1) { FXT.splice(i, 1); continue; }
          if (u < 0) continue;
          ctx.save(); ctx.globalAlpha = u < .1 ? u / .1 : u > .7 ? (1 - u) / .3 : 1;
          const pop = u < .15 ? .7 + u / .15 * .4 : 1.1 - Math.min(.1, (u - .15) * .5);
          ctx.translate(f.x, f.y - u * 34 * G.k); ctx.scale(pop, pop);
          outText(f.text, 0, 0, f.size, f.color);
          ctx.restore();
        }
        for (let i = SPK.length - 1; i >= 0; i--) {
          const s = SPK[i];
          s.life -= dt; if (s.life <= 0) { SPK.splice(i, 1); continue; }
          s.vy += 260 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.a += s.va * dt;
          ctx.save(); ctx.globalAlpha = Math.min(1, s.life * 2); ctx.translate(s.x, s.y); ctx.rotate(s.a);
          ctx.fillStyle = s.c; ctx.fillRect(-s.w / 2, -s.w / 4, s.w, s.w / 2);
          ctx.restore();
        }
      }
      function burst(x, y, n) {
        const cols = ['#ffd45e', '#fff3c2', '#ff8a3d', '#7dffa8', '#6bb6ff', '#ff6b8b'];
        for (let i = 0; i < n; i++) {
          const a = Math.random() * TAU, v = 90 + Math.random() * 230;
          SPK.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, a: 0, va: (Math.random() - .5) * 12, w: (4 + Math.random() * 5) * G.k, c: cols[i % cols.length], life: .9 + Math.random() * .8 });
        }
      }
      function dispBank(i, target, t, dt) {
        let d = DISP[i];
        if (!d) d = DISP[i] = { v: target, hold: 0 };
        if (t > d.hold) { const df = target - d.v; d.v = Math.abs(df) < .5 ? target : d.v + df * (1 - Math.exp(-dt * 7)); }
        return d.v;
      }

      if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(r || 0, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };

      const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
      const ease = q => q * q * (3 - 2 * q);
      const handLoc = (i, j) => { const x = S.s[i], h = x.hs[j]; return hl(i, j, x.hs.length, h.c.length); };
      const hobj = h => ({ bet: h.b, done: !!h.dn, aces: !!h.ac, split: !!h.sp });

      function plate(i) {
        const p = G.seat[i], w = G.pw, h = G.pf * 3.5;
        return { x: Math.max(w / 2 + 4, Math.min(G.W - w / 2 - 4, p.x)), y: p.y + 31 * G.k + h / 2 + 5 * G.k, w, h };
      }
      function fitStr(s, maxW) {
        if (ctx.measureText(s).width <= maxW) return s;
        while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
        return s + '…';
      }
      function stackAt(key, i, bx, by, t) {
        const r = RS.get(key);
        if (!r) return [bx, by, 1];
        const u = t - r.t0;
        if (r.dest === 'rack') {
          const q = ease(clamp01((u - 1000) / 650));
          return [bx + (G.chipr[0] - bx) * q, by + (G.chipr[1] - by) * q, u > 1500 ? clamp01((1650 - u) / 150) : 1];
        }
        const P = plate(i), q = ease(clamp01((u - 1400) / 600));
        return [bx + (P.x - bx) * q, by + (P.y - by) * q, u > 1900 ? clamp01((2000 - u) / 100) : 1];
      }
      function amt(x, y, v, a) {
        if (!(v > 0) || a < .5) return;
        outText(money2(v), x, y, Math.max(10, 11.5 * Math.max(G.k, .8)), '#fff', 800);
      }
      function drawStacks(t) {
        const k = G.k, rx = 15 * k, ry = 7.2 * k;
        S.s.forEach((x, i) => {
          if (!x) return;
          const p = G.seat[i];
          if (!x.hs.length && x.bt > 0) {
            stackDraw(ctx, p.x, p.y, x.bt, rx, ry);
            amt(p.x, p.y + 17 * k, x.bt, 1);
          }
          x.hs.forEach((h, j) => {
            const L = hl(i, j, x.hs.length, h.c.length), q = stackAt(i + '.' + j, i, L.bx, L.by, t);
            if (q[2] <= 0) return;
            ctx.globalAlpha = q[2];
            stackDraw(ctx, q[0], q[1], h.b, rx, ry);
            ctx.globalAlpha = 1;
            amt(q[0], q[1] + 17 * k, h.b, q[2]);
          });
        });
      }
      function drawIns() {
        const k = G.k;
        S.s.forEach((x, i) => {
          if (!x || !(x.ins > 0) || x.inr === 'lose') return;
          const q = G.ins[i];
          stackDraw(ctx, q.x, q.y, x.ins, 12.9 * k, 6.2 * k);
          amt(q.x, q.y + 15 * k, x.ins, 1);
        });
      }
      function drawMarks(t) {
        const k = G.k, f = G.pf;
        if (S.d.length && S.ph !== 'bet' && S.ph !== 'shuf') {
          const vis = S.d.filter(c => (c & 63) !== 63).map(c => c & 63), v = tot(vis), hidden = vis.length < S.d.length;
          let tx, bg = 'rgba(8,10,8,.82)', fg = '#fff';
          if (hidden) tx = String(v.t);
          else if (v.t > 21) { tx = 'BUST'; bg = '#b3261a'; }
          else if (vis.length === 2 && v.t === 21) { tx = 'BLACKJACK'; bg = '#e8b520'; fg = '#2a1c00'; }
          else tx = v.soft && v.t < 21 ? 'Soft ' + v.t : String(v.t);
          pill(G.dealer[0] + (S.d.length - 1) / 2 * G.dstep + CWB * k / 2 + 46 * k, G.dealer[1], tx, bg, fg, f + 1);
        }
        S.s.forEach((x, i) => {
          if (!x) return;
          const n = x.hs.length;
          x.hs.forEach((h, j) => {
            const L = hl(i, j, n, h.c.length);
            if (S.ph === 'play' && S.t && S.t[0] === i && S.t[1] === j) {
              const w = CWB * L.s + (h.c.length - 1) * 24 * L.s + 14 * k, hh = CHB * L.s + (h.c.length - 1) * 11 * L.s + 14 * k;
              ctx.save();
              ctx.globalAlpha = .65 + .35 * Math.sin(t * .006);
              ctx.lineWidth = Math.max(2, 3 * k); ctx.strokeStyle = '#ffe28a'; ctx.shadowColor = '#ffd45e'; ctx.shadowBlur = 14;
              ctx.beginPath(); ctx.roundRect(L.hx - w / 2, L.hy - hh / 2, w, hh, 10 * k); ctx.stroke();
              ctx.restore();
            }
            if (!h.c.length) return;
            let lab = handLabel(h);
            if (n > 1 || G.port) {
              const sh = { WIN: 'WIN', BLACKJACK: 'BJ', 'EVEN MONEY': 'EVEN', PUSH: 'PUSH', LOSE: 'LOSE', BUST: 'BUST', SURRENDER: 'SURR' };
              if (sh[lab[0]] && n > 1) lab = [sh[lab[0]], lab[1], lab[2]];
              else if (n > 1) lab = [lab[0].replace('Soft ', ''), lab[1], lab[2]];
            }
            pill(L.px, L.py, lab[0], lab[1], lab[2], f * (n > 2 ? .88 : 1));
          });
        });
      }
      function drawPlate(i, t, dt) {
        const x = S.s[i], P = plate(i), me = i === M.me, k = G.k, f = G.pf;
        const turn = S.ph === 'play' && S.t && S.t[0] === i;
        const bv = dispBank(i, x.bk, t, dt);
        if (me) setBank(bv);
        ctx.save();
        ctx.beginPath(); ctx.roundRect(P.x - P.w / 2, P.y - P.h / 2, P.w, P.h, 9 * k);
        ctx.fillStyle = me ? 'rgba(48,32,6,.92)' : 'rgba(8,10,8,.84)'; ctx.fill();
        ctx.lineWidth = turn ? 2.6 : 1.5;
        ctx.strokeStyle = turn ? '#ffe28a' : me ? 'rgba(255,214,110,.9)' : 'rgba(255,255,255,.24)';
        if (turn) { ctx.shadowColor = '#ffd45e'; ctx.shadowBlur = 12; }
        ctx.stroke(); ctx.shadowBlur = 0;
        const lx = P.x - P.w / 2 + f * .85;
        ctx.fillStyle = `hsl(${hue(x.nm)},62%,56%)`; ctx.beginPath(); ctx.arc(lx, P.y - f * .72, f * .36, 0, TAU); ctx.fill();
        let tag = '';
        if (S.ph === 'bet') tag = x.sit ? 'OUT' : x.rd ? 'READY' : '';
        else if (S.ph === 'ins' && x.hs.length) tag = x.an === 1 ? 'INS' : x.an === 0 ? 'NO' : '...';
        ctx.font = `800 ${f * .72}px ${FONT}`;
        const tw = tag ? ctx.measureText(tag).width + f * .3 : 0;
        ctx.font = `800 ${f}px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = x.h ? '#fff' : '#cdd6cf';
        ctx.fillText(fitStr(x.nm, P.w - f * 2.3 - tw), lx + f * .62, P.y - f * .72);
        if (tag) { ctx.font = `800 ${f * .72}px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = tag === 'READY' || tag === 'INS' ? '#7dffa8' : '#f0c24a'; ctx.fillText(tag, P.x + P.w / 2 - f * .5, P.y - f * .72); }
        ctx.font = `900 ${f + 1.5}px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe28a';
        ctx.fillText(money(Math.round(bv)), P.x, P.y + f * .82);
        if (S.tl) {
          let on = false, tot0 = 0;
          if (S.ph === 'play') { on = turn && x.h; tot0 = TURN_MS; }
          else if (S.ph === 'bet') { on = x.h && !x.rd && !x.sit; tot0 = BET_MS; }
          else if (S.ph === 'ins') { on = x.h && x.hs.length && x.an === -1; tot0 = INS_MS; }
          if (on) {
            const fr = clamp01((SAT + S.tl - t) / tot0), bw = P.w - 14 * k;
            ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(P.x - bw / 2, P.y + P.h / 2 - 5 * k, bw, 3 * k);
            ctx.fillStyle = fr < .25 ? '#ff5b4b' : '#7dffa8'; ctx.fillRect(P.x - bw / 2, P.y + P.h / 2 - 5 * k, bw * fr, 3 * k);
          }
        }
        ctx.restore();
      }
      let lastBank = null;
      function setBank(v) {
        const r = Math.round(v);
        if (r === lastBank) return;
        lastBank = r; bankEl.textContent = money(r); api.score(r);
      }

      function render(t, dt) {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.drawImage(bgC, 0, 0, G.W, G.H);
        drawShoe(t); drawTray();
        stepCards(t, dt);
        if (S) drawStacks(t);
        const hn = S && S.d.length > 1 && (S.d[1] & 63) === 63 ? S.d[1] >> 6 : -1;
        const list = Array.from(DC.values()).sort((a, b) => a.n - b.n);
        for (const o of list) drawCard(o, t, o.n === hn);
        if (S) {
          drawMarks(t); drawIns();
          for (let i = 0; i < 6; i++) if (S.s[i]) drawPlate(i, t, dt);
        }
        drawShuffle(t); drawPiles(t); drawFx(t, dt);
      }

      function decision() {
        if (!S || S.ph !== 'play' || !S.t || S.t[0] !== M.me || S.lk) return null;
        const x = S.s[M.me], h = x.hs[S.t[1]];
        if (!h) return null;
        const fs = h.c.map(c => c & 63);
        return { fs, h, x, L: legalHand(fs, hobj(h), x.hs.length, x.bk, RU(), 'play') };
      }
      function status() {
        if (M.mode === 'none' || !S) return '';
        const x = S.s[M.me], R = RU(), rem = S.tl ? Math.max(0, Math.ceil((SAT + S.tl - now()) / 1000)) : 0, sec = rem ? ' · ' + rem + 's' : '';
        if (!x) return 'Spectating';
        switch (S.ph) {
          case 'shuf': return 'Shuffling the shoe';
          case 'bet': return x.sit ? 'Sitting out this round' : x.rd ? 'Waiting for the table' + sec : (x.bt ? 'Press Deal when ready' : 'Place your bet · minimum ' + money(R.min)) + sec;
          case 'deal': return 'Dealing';
          case 'ins': return x.hs.length && x.an === -1 ? (x.hs[0].st === 'bj' ? 'Even money? Pays 1 to 1 now' : 'Insurance? Pays 2 to 1') + sec : 'Dealer shows an Ace';
          case 'peek': return 'Dealer checks for blackjack';
          case 'play': {
            if (!S.t) return '';
            const o = S.s[S.t[0]], mine = S.t[0] === M.me;
            return mine ? (x.hs.length > 1 ? `Your turn · hand ${S.t[1] + 1} of ${x.hs.length}` : 'Your turn') + sec : `${o.nm}'s turn`;
          }
          case 'dealer': return 'Dealer plays';
          case 'pay': {
            if (!x.hs.length) return 'Next round soon';
            let net = x.hs.reduce((a, h) => a + h.nt, 0) + (x.inr === 'win' ? 2 * x.ins : x.inr === 'lose' ? -x.ins : 0);
            net = Math.round(net * 100) / 100;
            const dv = tot(S.d.map(c => c & 63)), dn = dv.t > 21 ? ' · Dealer busts' : S.d.length === 2 && dv.t === 21 ? ' · Dealer blackjack' : '';
            const bj = x.hs.some(h => h.r === 'bj') ? 'Blackjack! ' : '';
            return bj + (net > 0 ? 'You win ' + money2(net) : net < 0 ? 'You lose ' + money2(-net) : 'Push') + dn + (S.sh[2] === 0 ? ' · Cut card reached' : '');
          }
        }
        return '';
      }
      let lastStatus = '';
      function updStatus() {
        const s = status();
        if (s === lastStatus) return;
        lastStatus = s; msgEl.textContent = s; msgEl.hidden = !s;
      }
      function refreshUI() {
        const x = S && M.me >= 0 ? S.s[M.me] : null, R = RU();
        barEl.hidden = !x;
        netEl.hidden = !(M.mode === 'host' || M.mode === 'guest');
        hintBtn.classList.toggle('on', !!OP.hint); hintBtn.setAttribute('aria-pressed', OP.hint ? 'true' : 'false');
        if (!x) { hintEl.hidden = true; return; }
        const ph = S.ph, dec = decision();
        let vis = '', wt = '';
        if (ph === 'bet') {
          if (x.sit) wt = 'Sitting out this round';
          else if (!x.rd) vis = x.bk + x.bt < R.min ? 'rebuy' : 'chips bet';
          else wt = 'Bet placed';
        } else if (ph === 'ins' && x.hs.length && x.an === -1) vis = 'ins';
        else if (ph === 'play' && dec) vis = 'play';
        const vs = vis.split(' ');
        for (const k in grp) grp[k].hidden = k === 'wait' ? !wt : vs.indexOf(k) < 0;
        grp.wait.textContent = wt;
        betEl.textContent = money2(x.bt || x.hs.reduce((a, h) => a + h.b, 0));
        if (vs.indexOf('chips') >= 0) chipBtn.forEach(b => { const v = +b.dataset.chip; b.disabled = v > x.bk + 1e-9 || x.bt + v > R.max; });
        if (vs.indexOf('bet') >= 0) {
          btn.clr.disabled = x.bt <= 0;
          btn.rebet.disabled = !(x.l > 0) || x.bk + x.bt < R.min;
          btn.rebet.textContent = x.l > 0 ? 'Rebet ' + money(x.l) : 'Rebet';
          btn.x2.disabled = x.bt <= 0 || x.bk < x.bt;
          btn.deal.disabled = x.bt < R.min;
        }
        let rec = '', ht = '';
        if (vis === 'play') {
          const L = dec.L;
          btn.hit.disabled = !L.hit; btn.stand.disabled = !L.stand; btn.double.disabled = !L.dbl; btn.split.disabled = !L.split; btn.surrender.disabled = !L.surr;
          btn.surrender.hidden = !R.surr;
          if (OP.hint) { const a = advice(dec.fs, S.d[0] & 63, R, { dbl: !!L.dbl, split: !!L.split, surr: !!L.surr }); rec = a; ht = ALABEL[a]; }
        } else if (vis === 'ins') {
          const bj = x.hs[0].st === 'bj', st = Math.floor(x.hs[0].b / 2);
          btn.insy.textContent = bj ? 'Even money' : 'Insurance ' + money(st);
          btn.insy.disabled = !bj && (st < 1 || x.bk < st);
          if (OP.hint) { rec = 'insn'; ht = 'No ' + (bj ? 'even money' : 'insurance'); }
        }
        for (const k of ['hit', 'stand', 'double', 'split', 'surrender', 'insn']) btn[k].classList.toggle('rec', rec === k);
        hintEl.hidden = !ht; hintTx.textContent = 'Basic strategy: ' + ht;
        if (M.mode === 'solo' && ph === 'bet' && !x.rd && x.bk + x.bt < R.min && pane.hidden && M.overRd !== S.rd) { M.overRd = S.rd; over(); }
        updStatus();
      }

      function bump(r) {
        const st = SV.st; st.h++;
        if (r === 'win' || r === 'bj' || r === 'even') st.w++; else if (r === 'lose' || r === 'bust' || r === 'surr') st.l++; else st.p++;
        if (r === 'bj') st.b++;
      }
      let lastChipSnd = 0;
      function onEv(e) {
        const t = now(), mine = e.s === M.me, k = Math.max(G.k, .75), rack = G.chipr;
        switch (e.k) {
          case 'shuf': shufT = t; snd.shuffle(); break;
          case 'chip': if (t - lastChipSnd > 30) { lastChipSnd = t; if (e.u) snd.click(); else snd.chip(); } break;
          case 'deal': snd.deal(); break;
          case 'flip': snd.flip(); break;
          case 'peek': peekT = t; snd.peek(); break;
          case 'nobj': fxText('No blackjack', G.dealer[0] - 130 * G.k, G.dealer[1], '#fff', 19 * k); break;
          case 'ins': if (e.v) { snd.chip(); const q = G.ins[e.s]; fxText('Insured', q.x, q.y - 20 * G.k, '#ffe28a', 15 * k); } break;
          case 'insw': { const q = G.ins[e.s], P = plate(e.s); fxText('+' + money2(e.net), q.x, q.y - 20 * G.k, '#7dffa8', 17 * k); addPile(e.net, [[rack[0], rack[1], 0], [q.x + 24 * G.k, q.y, 650], [q.x + 24 * G.k, q.y, 1300], [P.x, P.y, 1900]], 0, 1900, true); DISP[e.s] && (DISP[e.s].hold = t + 2000); if (mine) snd.win(); break; }
          case 'insl': { const q = G.ins[e.s], x = S.s[e.s]; fxText('Insurance lost', q.x, q.y - 20 * G.k, '#ff8a7a', 14 * k); if (x) addPile(x.ins, [[q.x, q.y, 0], [rack[0], rack[1], 750]], 300, 800, true); break; }
          case 'bust': { const L = handLoc(e.s, e.h); fxText('BUST', L.px, L.py - 22 * G.k, '#ff6b5b', 22 * k); snd.bust(); break; }
          case 'surr': { const L = handLoc(e.s, e.h); fxText('SURRENDER', L.px, L.py - 22 * G.k, '#dfe3ee', 17 * k); snd.click(); break; }
          case 'dbl': { const L = handLoc(e.s, e.h); fxText('DOUBLE', L.px, L.py - 22 * G.k, '#8fc2ff', 20 * k); snd.chip(); break; }
          case 'split': { const L = handLoc(e.s, e.h); fxText('SPLIT', L.px, L.py - 22 * G.k, '#ffd45e', 20 * k); snd.chip(); break; }
          case 'res': {
            const x = S.s[e.s], h = x && x.hs[e.h];
            if (!h) break;
            const L = handLoc(e.s, e.h), P = plate(e.s), win = e.net > 0, back = e.r === 'push';
            RS.set(e.s + '.' + e.h, { t0: t, dest: win || back ? 'plate' : 'rack' });
            if (win) addPile(e.net, [[rack[0], rack[1], 0], [L.bx + 30 * G.k, L.by + 4 * G.k, 650], [L.bx + 30 * G.k, L.by + 4 * G.k, 1400], [P.x, P.y, 2000]], 0, 2000, true);
            else if (e.r === 'surr') addPile(h.b / 2, [[rack[0], rack[1], 0], [P.x, P.y, 600]], 1700, 600, true);
            const txt = win ? '+' + money2(e.net) : back ? 'PUSH' : '-' + money2(-e.net);
            fxText(txt, L.px, L.py - 24 * G.k, win ? '#7dffa8' : back ? '#dfe3ee' : '#ff8a7a', 20 * k, 150);
            if (!DISP[e.s]) DISP[e.s] = { v: x.bk - e.net, hold: 0 };
            DISP[e.s].hold = t + 2000;
            if (mine) {
              bump(e.r);
              const r = e.r;
              api.timeout(() => { if (r === 'bj') { snd.bj(); burst(L.px, L.py, 46); } else if (win) { snd.win(); if (e.net >= 100) burst(L.px, L.py, 20); } else if (r === 'push') snd.push(); else if (r !== 'bust') snd.lose(); }, 350);
              if (e.net !== 0) api.timeout(() => snd.chip(), 700);
            }
            break;
          }
          case 'rebuy': if (S.s[e.s]) api.toast(S.s[e.s].nm + ' rebuys'); break;
          case 'bot': if (S.s[e.s]) api.toast(S.s[e.s].nm.replace(' (CPU)', '') + ' left. A bot takes the seat'); break;
        }
      }
      function applySnap(sn, ev) {
        const prev = S;
        S = sn; SAT = now();
        if (!prev || sn.ph === 'bet' && prev.ph !== 'bet') RS.clear();
        retarget();
        for (const e of ev) onEv(e);
        if (sn.ph === 'pay' && (!prev || prev.ph !== 'pay')) {
          const x = sn.s[M.me];
          if (x && M.mode === 'solo') {
            SV.bank = x.bk; SV.peak = Math.max(SV.peak || 0, x.bk);
            if (!M.rb && x.bk - OP.start > 0) api.submit(x.bk - OP.start);
          }
          persist();
        }
        refreshUI();
      }
      function hostChange(sn, ev) {
        applySnap(sn, ev);
        if (M.mode === 'host') api.net.send({ t: 'st', s: sn, e: ev });
      }
      function doAct(k, v) {
        if (!S || M.mode === 'none' || M.me < 0) return false;
        if (M.mode === 'guest') { api.net.send({ t: 'a', k, v }); if (k === 'undo' || k === 'clr') snd.click(); return true; }
        if (!M.eng) return false;
        if (k === 'rebuy') M.rb++;
        const ok = M.eng.act(M.me, k, v);
        if (!ok && k !== 'rebuy') snd.click();
        return ok;
      }
      function barAct(a) {
        if (a === 'insy') doAct('ins', true);
        else if (a === 'insn') doAct('ins', false);
        else doAct(a);
      }

      function resetView() {
        S = null; TG = []; DC.clear(); PILES.length = 0; FXT.length = 0; SPK.length = 0; RS.clear(); DISP.length = 0;
        shufT = 0; peekT = 0; lastStatus = ''; lastBank = null; M.overRd = 0;
      }
      function leaveNet() {
        if (M.mode === 'host' || M.mode === 'guest') { try { api.net.close(); } catch (e) {} }
      }
      function toTitle() {
        M.tok++; leaveNet();
        M.mode = 'none'; M.eng = null; M.me = -1; M.menu = false; M.rules = null;
        resetView(); paintBG(); refreshUI(); updStatus(); api.score('—');
        showTitle();
      }
      function buildEngine(online) {
        const tb = Table({ rules: rulesOf(), online, speed: OP.fast ? .55 : 1, onChange: hostChange });
        M.eng = tb; M.rules = tb.rules; M.rb = 0;
        return tb;
      }
      function startSolo(fresh) {
        M.tok++; leaveNet(); hidePane();
        const tb = buildEngine(false);
        M.mode = 'solo'; M.me = PRI[0]; M.menu = false;
        const bank = !fresh && SV.bank >= OP.min ? SV.bank : OP.start;
        tb.seat(M.me, { kind: 'human', name: 'You', bank });
        const nm = BOTN.slice().sort(() => Math.random() - .5);
        for (let i = 0; i < OP.bots; i++) tb.seat(PRI[i + 1], { kind: 'bot', name: nm[i], style: STYLES[i % STYLES.length], bank: Math.max(OP.min * 6, Math.round(OP.start * (.5 + Math.random() * 1.2) / 5) * 5) });
        resetView(); paintBG(); api.label('Bankroll');
        tb.start();
      }

      function showPane(kind, html, fn, cls) {
        pane.className = 'bj-pane' + (cls ? ' ' + cls : '');
        pane.dataset.k = kind; pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0; paneFn = fn;
      }
      function hidePane() { pane.hidden = true; pane.innerHTML = ''; pane.dataset.k = ''; paneFn = null; M.menu = false; }
      let paneFn = null;
      api.on(pane, 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneFn || !api.alive) return;
        snd.click();
        paneFn(b.dataset.a, b);
      });
      const parseV = raw => raw === 'true' ? true : raw === 'false' ? false : /^\d+(\.\d+)?$/.test(raw) ? +raw : raw;
      const segHtml = (k, vals) => `<div class="bj-seg" data-k="${k}">${vals.map(([v, l]) => `<button data-a="seg" data-v="${v}" class="${String(OP[k]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
      const setHint = v => { OP.hint = !!v; persist(); refreshUI(); };

      function showTitle() {
        const can = SV.bank >= OP.min;
        showPane('title', `<div class="bj-box"><p class="bj-kick">Casino table</p><div class="bj-logo">Blackjack</div><p class="bj-sub">Beat the dealer to 21</p>
${can ? `<button class="bj-big gold" data-a="solo">Continue<small>Bankroll ${money(Math.round(SV.bank))} · ${OP.bots} bot${OP.bots === 1 ? '' : 's'}</small></button><button class="bj-big blue" data-a="fresh">New table<small>Start with ${money(OP.start)}</small></button>` : `<button class="bj-big gold" data-a="fresh">Play at the table<small>Start with ${money(OP.start)} · ${OP.bots} bot${OP.bots === 1 ? '' : 's'}</small></button>`}
<button class="bj-big green" data-a="online">Play online<small>Up to 6 players, one dealer</small></button>
<div class="bj-row"><button class="bj-sm" data-a="settings">Settings</button><button class="bj-sm" data-a="rules">How to play</button><button class="bj-sm" data-a="chart">Strategy</button><button class="bj-sm" data-a="stats">Stats</button></div></div>`, a => {
          if (a === 'solo') startSolo(false);
          else if (a === 'fresh') startSolo(true);
          else if (a === 'online') startOnline();
          else if (a === 'settings') settings(showTitle);
          else if (a === 'rules') rules(showTitle);
          else if (a === 'chart') chart(showTitle);
          else if (a === 'stats') stats(showTitle);
        });
      }
      function settings(back) {
        const top = pane.scrollTop;
        const rows = SET.concat([['hint', 'Basic strategy hint', [[false, 'Off'], [true, 'On']]]]);
        showPane('settings', `<div class="bj-box wide"><h3>Table settings</h3>${rows.map(([k, l, v]) => `<div class="bj-opt"><span>${l}</span>${segHtml(k, v)}</div>`).join('')}<p>Rule changes apply when you sit at a new table.</p><button class="bj-big gold" data-a="back">Done</button></div>`, (a, b) => {
          if (a === 'seg') {
            const k = b.parentNode.dataset.k;
            OP[k] = parseV(b.dataset.v); persist();
            if (k === 'hint') refreshUI();
            settings(back);
          } else back();
        });
        pane.scrollTop = top;
      }
      function rules(back) {
        const R = RU();
        showPane('rules', `<div class="bj-box wide bj-rules"><h3>How to play</h3>
<p>Get closer to 21 than the dealer without going over. Cards 2 to 10 count face value, J Q K count 10, an Ace counts 1 or 11.</p>
<p class="bj-sec">Your options</p>
<p><b>Hit</b> takes a card. <b>Stand</b> keeps your hand. <b>Double</b> doubles your bet for exactly one more card${R.dbl === 'any' ? '' : ' (only on ' + R.dbl + ')'}${R.das ? ', also after a split' : ''}. <b>Split</b> a pair into two hands with a matching bet, up to ${R.maxHands} hands; split Aces get one card each${R.rsa ? '' : ' and cannot be re-split'}. <b>Surrender</b> ${R.surr ? 'as your first decision to take back half your bet' : 'is not offered at this table'}.</p>
<p class="bj-sec">The dealer</p>
<p>The dealer takes one card face up and one face down, and ${R.h17 ? 'hits' : 'stands on'} soft 17. With an Ace or a ten showing, the dealer peeks for blackjack before you play.</p>
<p class="bj-sec">Payouts</p>
<p>Blackjack pays ${R.pay === 1.5 ? '3 to 2' : '6 to 5'}. Wins pay 1 to 1. A push returns your bet. Insurance (half your bet, offered against a dealer Ace) pays 2 to 1. With a blackjack you can take even money, paid 1 to 1 at once.</p>
<p class="bj-sec">The shoe</p>
<p>${R.decks} deck${R.decks > 1 ? 's' : ''} in the shoe. When the cut card is reached the shoe is reshuffled before the next round.</p>
<p class="bj-sec">Online</p>
<p>Up to six players share one dealer, each with their own seat, bankroll and bets. Everyone acts in seat order; a bot takes over if a player leaves.</p>
<p class="bj-sec">Keys</p><p>${HELP}</p>
<button class="bj-big gold" data-a="back">Got it</button></div>`, () => back());
      }
      function chart(back) {
        const R = rulesOf(), up = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
        const L = { H: ['H', 'H'], S: ['S', 'S'], D: ['D', 'D'], d: ['Ds', 'd'], P: ['P', 'P'], R: ['Rh', 'R'], r: ['Rs', 'R'] };
        const cell = c => { const q = L[c]; return q ? `<td class="${q[1]}">${q[0]}</td>` : '<td></td>'; };
        const head = `<tr><th class="l"></th>${up.map(u => `<th>${u}</th>`).join('')}</tr>`;
        const hard = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(t => `<tr><th class="l">${t === 8 ? '8-' : t === 17 ? '17+' : t}</th>${hardRow(t, R).split('').map(cell).join('')}</tr>`).join('');
        const soft = [13, 14, 15, 16, 17, 18, 19, 20].map(t => `<tr><th class="l">A,${t - 11}</th>${softRow(t, R).split('').map(cell).join('')}</tr>`).join('');
        const pairs = [[2, '2,2'], [3, '3,3'], [4, '4,4'], [6, '6,6'], [7, '7,7'], [8, '8,8'], [9, '9,9'], [11, 'A,A']].map(([v, n]) => { const r = pairRow(v, R); return r ? `<tr><th class="l">${n}</th>${r.split('').map(c => c === 'P' ? cell('P') : '<td></td>').join('')}</tr>` : ''; }).join('');
        showPane('chart', `<div class="bj-box wide"><h3>Basic strategy</h3><p>${R.decks} decks · dealer ${R.h17 ? 'hits' : 'stands on'} soft 17 · double after split ${R.das ? 'allowed' : 'not allowed'} · late surrender ${R.surr ? 'allowed' : 'not allowed'}</p>
<p class="bj-sec">Hard totals (dealer card across the top)</p><div class="bj-chart"><table>${head}${hard}</table></div>
<p class="bj-sec">Soft totals</p><div class="bj-chart"><table>${head}${soft}</table></div>
<p class="bj-sec">Pairs (P = split, blank = play it as a hard total)</p><div class="bj-chart"><table>${head}${pairs}</table></div>
<div class="bj-leg"><span><i style="background:#c94b3c"></i>H hit</span><span><i style="background:#e8c84a"></i>S stand</span><span><i style="background:#3d8fe0"></i>D double, else hit</span><span><i style="background:#5bb3b3"></i>Ds double, else stand</span><span><i style="background:#3aa65a"></i>P split</span><span><i style="background:#9a63c4"></i>Rh/Rs surrender, else hit/stand</span></div>
<button class="bj-big gold" data-a="back">Got it</button></div>`, () => back());
      }
      function stats(back) {
        const st = SV.st, wr = st.h ? Math.round(st.w / st.h * 100) : 0;
        showPane('stats', `<div class="bj-box"><h3>Your stats</h3><div class="bj-st"><div><b>${st.h}</b><span>Hands</span></div><div><b>${st.w}</b><span>Won</span></div><div><b>${st.l}</b><span>Lost</span></div><div><b>${st.p}</b><span>Push</span></div><div><b>${st.b}</b><span>Blackjacks</span></div></div>
<p>Win rate ${wr}%${SV.peak ? ' · Peak bankroll ' + money(Math.round(SV.peak)) : ''}</p>
<button class="bj-big gold" data-a="back">Back</button><button class="bj-sm" data-a="reset">Reset stats</button></div>`, a => {
          if (a === 'reset') { SV.st = { h: 0, w: 0, l: 0, p: 0, b: 0 }; SV.peak = 0; persist(); stats(back); } else back();
        });
      }
      function over() {
        const st = SV.st;
        showPane('over', `<div class="bj-box"><p class="bj-kick">Game over</p><h3>You are out of chips</h3><p>${st.h} hands played · ${st.w} won${SV.peak ? ' · peak ' + money(Math.round(SV.peak)) : ''}</p>
<button class="bj-big gold" data-a="rebuy">Rebuy ${money(OP.start)}<small>Sit back down at the table</small></button><button class="bj-big gray" data-a="quit">Quit to title</button></div>`, a => {
          if (a === 'rebuy') { hidePane(); doAct('rebuy'); } else toTitle();
        });
      }
      function menu() {
        if (M.mode === 'none') return;
        const on = M.mode === 'host' || M.mode === 'guest', solo = M.mode === 'solo';
        if (solo) M.menu = true;
        const lead = M.mode === 'host';
        showPane('menu', `<div class="bj-box"><p class="bj-kick">${on ? 'Online' : 'Paused'}</p><h3>Menu</h3>
<button class="bj-big green" data-a="resume">Resume</button>
<div class="bj-row"><button class="bj-sm" data-a="rules">How to play</button><button class="bj-sm" data-a="chart">Strategy</button><button class="bj-sm" data-a="stats">Stats</button>${solo ? '<button class="bj-sm" data-a="settings">Settings</button>' : ''}</div>
${solo ? '<button class="bj-big blue" data-a="new">New table<small>Fresh shoe and bankroll</small></button>' : ''}
${lead ? '<button class="bj-big blue" data-a="reset">Reset all bankrolls<small>Everyone back to the starting stack</small></button><button class="bj-big gold" data-a="lobby">Back to lobby<small>Rematch or change the party</small></button>' : ''}
<button class="bj-big red" data-a="quit">${on ? (lead ? 'Close the table' : 'Leave table') : 'Quit to title'}</button></div>`, a => {
          if (a === 'resume') hidePane();
          else if (a === 'rules') rules(menu);
          else if (a === 'chart') chart(menu);
          else if (a === 'stats') stats(menu);
          else if (a === 'settings') settings(menu);
          else if (a === 'new') startSolo(true);
          else if (a === 'reset') { hidePane(); M.eng.resetBanks(); M.eng.flush(); }
          else if (a === 'lobby') startOnline();
          else if (a === 'quit') toTitle();
        });
      }

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => {
          if (M.mode !== 'host' || !p || !M.eng) return;
          const i = M.pids.indexOf(p.id);
          if (i < 0) return;
          M.pids[i] = null; M.eng.toBot(i); M.eng.flush();
        });
        api.net.on('rejoin', p => {
          if (M.mode !== 'host' || !p || !M.eng) return;
          const i = M.pids.indexOf(p.id);
          if (i < 0) return;
          api.net.sendTo(p.id, { t: 'setup', me: i, rules: M.rules });
          api.net.sendTo(p.id, { t: 'st', s: M.eng.snap(), e: [] });
        });
        api.net.on('lobby', () => { if (M.mode === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'guest') return;
          M.tok++; M.mode = 'none'; M.eng = null; M.me = -1;
          snd.lose();
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the table.' : reason === 'host-left' ? 'The host closed the table.' : 'The connection to the host was lost.';
          resetView(); refreshUI(); updStatus();
          showPane('left', `<div class="bj-box"><p class="bj-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="bj-big green" data-a="room">Online lobby</button><button class="bj-big gold" data-a="solo">Play solo</button></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); startSolo(false); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'host' && M.mode !== 'guest') return;
          const on = api.net.connected, n = S ? S.s.filter(x => x && x.h).length : 0;
          netEl.classList.toggle('bad', !on);
          netEl.lastChild.textContent = !on ? 'Reconnecting…' : M.mode === 'host' ? 'Online · ' + n + ' player' + (n === 1 ? '' : 's') : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }
      async function startOnline() {
        const tok = ++M.tok;
        hookNet(); hidePane();
        M.mode = 'lobby'; M.eng = null; M.me = -1; M.menu = false; resetView(); refreshUI(); updStatus(); api.score('—');
        const r = await api.net.room({ title: 'Blackjack', sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { toTitle(); return; }
        if (r.role === 'host') {
          const tb = buildEngine(true), ps = r.players.slice(0, 6);
          M.mode = 'host'; M.pids = Array(6).fill(null); M.me = PRI[0];
          ps.forEach((p, i) => { M.pids[PRI[i]] = p.id; tb.seat(PRI[i], { kind: 'human', pid: p.id, name: p.name, bank: tb.rules.start }); });
          if (r.bots) {
            const nm = BOTN.slice().sort(() => Math.random() - .5);
            for (let i = ps.length; i < Math.min(6, r.size); i++) tb.seat(PRI[i], { kind: 'bot', name: nm[i], style: STYLES[i % STYLES.length], bank: tb.rules.start });
          }
          resetView(); paintBG(); api.label('Bankroll');
          ps.forEach((p, i) => { if (i) api.net.sendTo(p.id, { t: 'setup', me: PRI[i], rules: tb.rules }); });
          tb.start();
        } else {
          M.mode = 'guest'; M.rules = null;
          showPane('wait', `<div class="bj-box"><p class="bj-kick">Online</p><h3>Connected</h3><p>Waiting for the host to deal…</p><button class="bj-sm" data-a="leave">Leave</button></div>`, a => { if (a === 'leave') toTitle(); });
        }
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive) return;
        if (api.net.role === 'host') {
          if (M.mode !== 'host' || !M.eng || d.t !== 'a' || typeof d.k !== 'string') return;
          const i = M.pids.indexOf(from), x = i >= 0 ? M.eng.s.seats[i] : null;
          if (!x || x.kind !== 'human') return;
          if (!M.eng.act(i, d.k, d.v)) api.net.sendTo(from, { t: 'st', s: M.eng.snap(), e: [] });
        } else if (M.mode === 'guest') {
          if (d.t === 'setup' && d.rules) {
            M.tok++; M.me = +d.me; M.rules = d.rules; resetView(); paintBG(); hidePane(); api.label('Bankroll'); refreshUI();
          } else if (d.t === 'st' && d.s && M.me >= 0 && Array.isArray(d.s.s)) applySnap(d.s, Array.isArray(d.e) ? d.e : []);
        }
      }

      api.on(ui, 'pointerdown', e => {
        const b = e.target.closest('button');
        if (!b || b.disabled || pane.contains(b)) return;
        if (b.dataset.u === 'menu') { e.preventDefault(); snd.click(); menu(); }
        else if (b.dataset.u === 'hint') { e.preventDefault(); snd.click(); setHint(!OP.hint); }
        else if (b.dataset.chip) { e.preventDefault(); doAct('chip', +b.dataset.chip); }
        else if (b.dataset.a) { e.preventDefault(); barAct(b.dataset.a); }
      });
      api.on(ui, 'click', e => {
        if (e.detail !== 0) return;
        const b = e.target.closest('button');
        if (!b || b.disabled || pane.contains(b)) return;
        if (b.dataset.u === 'menu') menu();
        else if (b.dataset.u === 'hint') setHint(!OP.hint);
        else if (b.dataset.chip) doAct('chip', +b.dataset.chip);
        else if (b.dataset.a) barAct(b.dataset.a);
      });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat && e.key !== 'Backspace') return;
        const tg = e.target;
        if (tg && tg.closest && tg.closest('input,textarea,select')) return;
        if (!pane.hidden || !S || M.me < 0) return;
        const k = (e.key || '').toLowerCase();
        if (tg && tg.tagName === 'BUTTON' && (k === 'enter' || k === ' ')) return;
        const x = S.s[M.me];
        if (!x) return;
        let used = true;
        if (k >= '1' && k <= '6') doAct('chip', CHIPS[+k - 1]);
        else if (k === ' ' || k === 'enter') { if (S.ph === 'bet') doAct(x.bt >= RU().min ? 'deal' : 'rebet'); }
        else if (k === 'backspace') doAct('undo');
        else if (k === 'b') doAct('rebet');
        else if (k === 'x') doAct('x2');
        else if (k === 'c') doAct('clr');
        else if (k === 'h') doAct('hit');
        else if (k === 's') doAct('stand');
        else if (k === 'd') doAct('double');
        else if (k === 'p') doAct('split');
        else if (k === 'r') doAct('surrender');
        else if (k === 'y') doAct('ins', true);
        else if (k === 'n') doAct('ins', false);
        else if (k === 't') { snd.click(); setHint(!OP.hint); }
        else used = false;
        if (used) e.preventDefault();
      });
      api.on(window, 'resize', () => { fit(false); rescale(); });
      const dtors = [];
      if (window.ResizeObserver) { const ro = new ResizeObserver(() => { fit(false); rescale(); }); ro.observe(root); dtors.push(() => ro.disconnect()); }

      let lastTick = now();
      api.interval(() => {
        const t = now(), dt = Math.min(M.mode === 'host' ? 2000 : 500, t - lastTick);
        lastTick = t;
        if (!M.eng || api.paused || M.menu) return;
        M.eng.tick(dt);
      }, 40);
      let frame = 0;
      api.loop((dtc, t) => {
        if (!G || !bgC) return;
        if (++frame % 20 === 0) rescale();
        render(t, Math.min(.05, dtc));
        updStatus();
      });

      api.label('Bankroll'); api.score('—');
      fit(true); rescale(); refreshUI();
      if (document.fonts && document.fonts.load) document.fonts.load(`900 40px ${FONT}`).then(() => { if (api.alive) { sprites.clear(); } }, () => {});
      root._bj = { M, get S() { return S; }, OP, SV, doAct, get G() { return G; }, DC };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { dtors.forEach(f => { try { f(); } catch (e) {} }); try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers.blackjack = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="bjc-f" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#2fa05e"/><stop offset=".6" stop-color="#17703d"/><stop offset="1" stop-color="#0a3f22"/></radialGradient><linearGradient id="bjc-w" x1="0" x2="1"><stop offset="0" stop-color="#4f2f14"/><stop offset=".5" stop-color="#a06a34"/><stop offset="1" stop-color="#4f2f14"/></linearGradient><linearGradient id="bjc-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b110c"/><stop offset="1" stop-color="#0a0605"/></linearGradient></defs><rect width="400" height="300" fill="url(#bjc-b)"/><path d="M-6 52H406V120A206 206 0 0 1 -6 120Z" fill="url(#bjc-w)"/><path d="M8 52H392V118A192 192 0 0 1 8 118Z" fill="url(#bjc-f)"/><path d="M30 52H370V116A170 170 0 0 1 30 116Z" fill="none" stroke="#f4da96" stroke-opacity=".55" stroke-width="2"/><path id="bjc-a" d="M92 150A108 108 0 0 0 308 150" fill="none"/><text font-family="Georgia,serif" font-weight="900" font-size="15" letter-spacing="2" fill="#f5dc92"><textPath href="#bjc-a" startOffset="50%" text-anchor="middle">BLACKJACK PAYS 3 TO 2</textPath></text><g stroke="#f4da96" stroke-opacity=".85" stroke-width="2" fill="rgba(0,0,0,.14)"><circle cx="80" cy="176" r="19"/><circle cx="140" cy="214" r="19"/><circle cx="200" cy="226" r="19"/><circle cx="260" cy="214" r="19"/><circle cx="320" cy="176" r="19"/></g><g transform="translate(168 70) rotate(-8)"><rect width="48" height="68" rx="5" fill="#fbfaf5" stroke="#999"/><text x="7" y="20" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#15171c">K</text><path d="M24 36c-6-9-14-2-8 6l8 8 8-8c6-8-2-15-8-6z" fill="#15171c" transform="translate(0 1) scale(1)"/></g><g transform="translate(206 66) rotate(7)"><rect width="48" height="68" rx="5" fill="#fbfaf5" stroke="#999"/><text x="7" y="20" font-family="Georgia,serif" font-weight="700" font-size="17" fill="#c4161c">A</text><path d="M24 54c-14-10-16-18-9-22 4-2 8 0 9 4 1-4 5-6 9-4 7 4 5 12-9 22z" fill="#c4161c" transform="translate(0 -6)"/></g><g transform="translate(110 140) rotate(-6)"><rect width="42" height="60" rx="5" fill="#fbfaf5" stroke="#999"/><text x="6" y="18" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#15171c">10</text></g><g transform="translate(146 136) rotate(5)"><rect width="42" height="60" rx="5" fill="#fbfaf5" stroke="#999"/><text x="6" y="18" font-family="Georgia,serif" font-weight="700" font-size="15" fill="#c4161c">A</text></g><g><ellipse cx="260" cy="206" rx="17" ry="7" fill="#7a1c14"/><ellipse cx="260" cy="201" rx="17" ry="7" fill="#cf352c"/><ellipse cx="260" cy="196" rx="17" ry="7" fill="#cf352c" stroke="#fff" stroke-opacity=".7" stroke-dasharray="3 4"/><ellipse cx="260" cy="190" rx="17" ry="7" fill="#17934f"/><ellipse cx="260" cy="190" rx="11" ry="4.4" fill="none" stroke="#fff" stroke-opacity=".8" stroke-dasharray="3 3"/></g><g><ellipse cx="320" cy="168" rx="17" ry="7" fill="#1a1a1e"/><ellipse cx="320" cy="162" rx="17" ry="7" fill="#2a2b30" stroke="#e5b01d" stroke-dasharray="3 4"/></g><rect x="300" y="12" width="64" height="24" rx="5" fill="#2c2e35" stroke="#fff" stroke-opacity=".3"/><rect x="306" y="17" width="52" height="8" rx="2" fill="#f4f1e8"/><rect x="342" y="17" width="3" height="8" fill="#f2c230"/><rect x="40" y="14" width="56" height="24" rx="5" fill="#fff" fill-opacity=".14" stroke="#d2ebf5" stroke-opacity=".6"/></svg>`;
})();
