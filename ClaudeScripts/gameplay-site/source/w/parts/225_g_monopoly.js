(() => {
  'use strict';
  const GC = { brown: '#955436', lblue: '#aae0fa', pink: '#d93a96', orange: '#f7941d', red: '#ed1b24', yellow: '#fef200', green: '#1fb25a', dblue: '#0072bb', rail: '#2b2b33', util: '#8c8c96' };
  const GN = { brown: 'Brown', lblue: 'Light blue', pink: 'Pink', orange: 'Orange', red: 'Red', yellow: 'Yellow', green: 'Green', dblue: 'Dark blue', rail: 'Railroads', util: 'Utilities' };
  const GBONUS = { brown: 110, lblue: 190, pink: 290, orange: 440, red: 460, yellow: 450, green: 500, dblue: 420, rail: 170, util: 60 };
  const PR = (n, l, g, price, hc, r) => ({ k: 'prop', n, l, g, price, hc, r });
  const SQ = [
    { k: 'go', n: 'GO', l: ['GO'] },
    PR('Mediterranean Avenue', ['Mediter-', 'ranean', 'Avenue'], 'brown', 60, 50, [2, 10, 30, 90, 160, 250]),
    { k: 'chest', n: 'Community Chest', l: ['Community', 'Chest'] },
    PR('Baltic Avenue', ['Baltic', 'Avenue'], 'brown', 60, 50, [4, 20, 60, 180, 320, 450]),
    { k: 'tax', n: 'Income Tax', l: ['Income', 'Tax'], tax: 200 },
    { k: 'rail', n: 'Reading Railroad', l: ['Reading', 'Railroad'], g: 'rail', price: 200 },
    PR('Oriental Avenue', ['Oriental', 'Avenue'], 'lblue', 100, 50, [6, 30, 90, 270, 400, 550]),
    { k: 'chance', n: 'Chance', l: ['Chance'] },
    PR('Vermont Avenue', ['Vermont', 'Avenue'], 'lblue', 100, 50, [6, 30, 90, 270, 400, 550]),
    PR('Connecticut Avenue', ['Connecticut', 'Avenue'], 'lblue', 120, 50, [8, 40, 100, 300, 450, 600]),
    { k: 'jail', n: 'Jail', l: ['Jail'] },
    PR('St. Charles Place', ['St. Charles', 'Place'], 'pink', 140, 100, [10, 50, 150, 450, 625, 750]),
    { k: 'util', n: 'Electric Company', l: ['Electric', 'Company'], g: 'util', price: 150 },
    PR('States Avenue', ['States', 'Avenue'], 'pink', 140, 100, [10, 50, 150, 450, 625, 750]),
    PR('Virginia Avenue', ['Virginia', 'Avenue'], 'pink', 160, 100, [12, 60, 180, 500, 700, 900]),
    { k: 'rail', n: 'Pennsylvania Railroad', l: ['Pennsylvania', 'Railroad'], g: 'rail', price: 200 },
    PR('St. James Place', ['St. James', 'Place'], 'orange', 180, 100, [14, 70, 200, 550, 750, 950]),
    { k: 'chest', n: 'Community Chest', l: ['Community', 'Chest'] },
    PR('Tennessee Avenue', ['Tennessee', 'Avenue'], 'orange', 180, 100, [14, 70, 200, 550, 750, 950]),
    PR('New York Avenue', ['New York', 'Avenue'], 'orange', 200, 100, [16, 80, 220, 600, 800, 1000]),
    { k: 'fp', n: 'Free Parking', l: ['Free', 'Parking'] },
    PR('Kentucky Avenue', ['Kentucky', 'Avenue'], 'red', 220, 150, [18, 90, 250, 700, 875, 1050]),
    { k: 'chance', n: 'Chance', l: ['Chance'] },
    PR('Indiana Avenue', ['Indiana', 'Avenue'], 'red', 220, 150, [18, 90, 250, 700, 875, 1050]),
    PR('Illinois Avenue', ['Illinois', 'Avenue'], 'red', 240, 150, [20, 100, 300, 750, 925, 1100]),
    { k: 'rail', n: 'B&O Railroad', l: ['B. & O.', 'Railroad'], g: 'rail', price: 200 },
    PR('Atlantic Avenue', ['Atlantic', 'Avenue'], 'yellow', 260, 150, [22, 110, 330, 800, 975, 1150]),
    PR('Ventnor Avenue', ['Ventnor', 'Avenue'], 'yellow', 260, 150, [22, 110, 330, 800, 975, 1150]),
    { k: 'util', n: 'Water Works', l: ['Water', 'Works'], g: 'util', price: 150 },
    PR('Marvin Gardens', ['Marvin', 'Gardens'], 'yellow', 280, 150, [24, 120, 360, 850, 1025, 1200]),
    { k: 'gtj', n: 'Go To Jail', l: ['Go To', 'Jail'] },
    PR('Pacific Avenue', ['Pacific', 'Avenue'], 'green', 300, 200, [26, 130, 390, 900, 1100, 1275]),
    PR('North Carolina Avenue', ['North', 'Carolina', 'Avenue'], 'green', 300, 200, [26, 130, 390, 900, 1100, 1275]),
    { k: 'chest', n: 'Community Chest', l: ['Community', 'Chest'] },
    PR('Pennsylvania Avenue', ['Pennsylvania', 'Avenue'], 'green', 320, 200, [28, 150, 450, 1000, 1200, 1400]),
    { k: 'rail', n: 'Short Line', l: ['Short', 'Line'], g: 'rail', price: 200 },
    { k: 'chance', n: 'Chance', l: ['Chance'] },
    PR('Park Place', ['Park', 'Place'], 'dblue', 350, 200, [35, 175, 500, 1100, 1300, 1500]),
    { k: 'tax', n: 'Luxury Tax', l: ['Luxury', 'Tax'], tax: 100 },
    PR('Boardwalk', ['Board-', 'walk'], 'dblue', 400, 200, [50, 200, 600, 1400, 1700, 2000])
  ];
  const GROUPS = {};
  SQ.forEach((q, i) => { if (q.g) (GROUPS[q.g] = GROUPS[q.g] || []).push(i); });
  const RAILS = GROUPS.rail, UTILS = GROUPS.util;
  const ORDER_G = ['brown', 'lblue', 'pink', 'orange', 'red', 'yellow', 'green', 'dblue', 'rail', 'util'];

  const CHANCE = [
    { t: 'Advance to Boardwalk.', f: 'to', v: 39 },
    { t: 'Advance to GO and collect $200.', f: 'to', v: 0 },
    { t: 'Advance to Illinois Avenue. Collect $200 if you pass GO.', f: 'to', v: 24 },
    { t: 'Advance to St. Charles Place. Collect $200 if you pass GO.', f: 'to', v: 11 },
    { t: 'Advance to the nearest Utility. If it is unowned you may buy it; otherwise roll the dice and pay the owner ten times the roll.', f: 'ut' },
    { t: 'Advance to the nearest Railroad. If it is owned, pay the owner double the normal rent.', f: 'rr' },
    { t: 'Advance to the nearest Railroad. If it is owned, pay the owner double the normal rent.', f: 'rr' },
    { t: 'The bank pays you a dividend of $50.', f: 'cash', v: 50 },
    { t: 'Get Out of Jail Free. Keep this card until you need it or trade it.', f: 'gj' },
    { t: 'Go back 3 spaces.', f: 'back', v: 3 },
    { t: 'Go directly to Jail. Do not pass GO, do not collect $200.', f: 'jail' },
    { t: 'General repairs on all your buildings: pay $25 per house and $100 per hotel.', f: 'rep', h: 25, H: 100 },
    { t: 'Speeding fine. Pay $15.', f: 'cash', v: -15 },
    { t: 'Take a trip to Reading Railroad. Collect $200 if you pass GO.', f: 'to', v: 5 },
    { t: 'You are elected Chairman of the Board. Pay each player $50.', f: 'each', v: -50 },
    { t: 'Your building loan matures. Collect $150.', f: 'cash', v: 150 }
  ];
  const CHEST = [
    { t: 'Advance to GO and collect $200.', f: 'to', v: 0 },
    { t: 'Bank error in your favour. Collect $200.', f: 'cash', v: 200 },
    { t: "Doctor's fee. Pay $50.", f: 'cash', v: -50 },
    { t: 'You sell some stock. Collect $50.', f: 'cash', v: 50 },
    { t: 'Get Out of Jail Free. Keep this card until you need it or trade it.', f: 'gj' },
    { t: 'Go directly to Jail. Do not pass GO, do not collect $200.', f: 'jail' },
    { t: 'Holiday fund matures. Collect $100.', f: 'cash', v: 100 },
    { t: 'Income tax refund. Collect $20.', f: 'cash', v: 20 },
    { t: "It is your birthday. Collect $10 from every player.", f: 'each', v: 10 },
    { t: 'Life insurance matures. Collect $100.', f: 'cash', v: 100 },
    { t: 'Hospital fees. Pay $100.', f: 'cash', v: -100 },
    { t: 'School fees. Pay $50.', f: 'cash', v: -50 },
    { t: 'Consultancy fee. Collect $25.', f: 'cash', v: 25 },
    { t: 'Street repairs: pay $40 per house and $115 per hotel.', f: 'rep', h: 40, H: 115 },
    { t: 'You win second prize in a beauty contest. Collect $10.', f: 'cash', v: 10 },
    { t: 'You inherit $100.', f: 'cash', v: 100 }
  ];
  const DECKS = [CHANCE, CHEST];
  const GJ_ID = [8, 4];

  const shuffle = (R, a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const range = n => Array.from({ length: n }, (_, i) => i);
  const mval = i => SQ[i].price / 2;
  const ucost = i => Math.ceil(SQ[i].price * 0.55);
  const mfee = i => Math.ceil(SQ[i].price * 0.05);
  const ownedBy = (s, p) => { const r = []; for (let i = 0; i < 40; i++) if (s.own[i] === p) r.push(i); return r; };
  const cntG = (s, p, g) => GROUPS[g].reduce((a, i) => a + (s.own[i] === p ? 1 : 0), 0);
  const fullG = (s, p, g) => cntG(s, p, g) === GROUPS[g].length;
  const anyBld = (s, g) => GROUPS[g].some(i => s.hs[i] > 0);
  const anyMort = (s, g) => GROUPS[g].some(i => s.mt[i]);

  function rent(s, sq, dice) {
    const q = SQ[sq], o = s.own[sq];
    if (o < 0 || s.mt[sq]) return 0;
    if (q.k === 'rail') return 25 * Math.pow(2, cntG(s, o, 'rail') - 1);
    if (q.k === 'util') return (cntG(s, o, 'util') === 2 ? 10 : 4) * (dice == null ? 7 : dice);
    const h = s.hs[sq];
    if (h) return q.r[h];
    return fullG(s, o, q.g) ? q.r[0] * 2 : q.r[0];
  }
  function canBuild(s, p, sq) {
    const q = SQ[sq];
    if (q.k !== 'prop' || s.own[sq] !== p || !fullG(s, p, q.g) || anyMort(s, q.g)) return false;
    const h = s.hs[sq];
    if (h >= 5 || P_(s, p).cash < q.hc) return false;
    if (GROUPS[q.g].some(i => s.hs[i] < h)) return false;
    return h < 4 ? s.bh > 0 : s.bH > 0;
  }
  function canSell(s, p, sq) {
    const q = SQ[sq];
    if (q.k !== 'prop' || s.own[sq] !== p || s.hs[sq] <= 0) return false;
    return !GROUPS[q.g].some(i => s.hs[i] > s.hs[sq]);
  }
  function canMort(s, p, sq) {
    const q = SQ[sq];
    return q.price != null && s.own[sq] === p && !s.mt[sq] && !(q.k === 'prop' && anyBld(s, q.g));
  }
  function canUnmort(s, p, sq) {
    return s.own[sq] === p && !!s.mt[sq] && P_(s, p).cash >= ucost(sq);
  }
  function P_(s, p) { return s.P[p]; }
  function liquid(s, p) {
    let t = s.P[p].cash;
    for (const i of ownedBy(s, p)) {
      if (!s.mt[i]) t += mval(i);
      if (s.hs[i]) t += s.hs[i] * SQ[i].hc / 2;
    }
    return t;
  }
  function worth(s, p) {
    let t = s.P[p].cash;
    for (const i of ownedBy(s, p)) { t += SQ[i].price; if (s.hs[i]) t += s.hs[i] * SQ[i].hc; }
    return t;
  }
  function needOf(s) {
    if (s.phase === 'over') return null;
    if (s.trade) return { p: s.trade.to, k: 'trade' };
    switch (s.phase) {
      case 'roll': return { p: s.turn, k: 'roll' };
      case 'buy': return { p: s.buy.p, k: 'buy' };
      case 'auc': return s.auc ? { p: s.auc.cur, k: 'auc' } : null;
      case 'debt': return { p: s.debt.p, k: 'debt' };
      case 'end': return { p: s.turn, k: 'end' };
    }
    return null;
  }
  const manageOK = (s, p) => !s.P[p].out && !s.trade && s.phase !== 'over' && ((['roll', 'end', 'buy'].includes(s.phase) && p === s.turn) || (s.phase === 'debt' && p === s.debt.p) || s.phase === 'auc');
  const canTrade = (s, p) => !s.P[p].out && s.phase !== 'over' && ((!s.trade && (((s.phase === 'roll' || s.phase === 'end') && p === s.turn) || (s.phase === 'debt' && p === s.debt.p))) || (s.trade && s.trade.to === p));
  const tradable = (s, p, sq) => s.own[sq] === p && !(SQ[sq].k === 'prop' && anyBld(s, SQ[sq].g));
  const cleanSide = x => {
    x = x || {};
    const j = Array.isArray(x.j) ? x.j : [0, 0];
    return { c: Math.max(0, Math.floor(+x.c || 0)), p: (Array.isArray(x.p) ? x.p : []).map(Number).filter((v, i, a) => Number.isInteger(v) && v >= 0 && v < 40 && a.indexOf(v) === i), j: [Math.max(0, Math.floor(+j[0] || 0)), Math.max(0, Math.floor(+j[1] || 0))] };
  };
  const sideEmpty = x => !x.c && !x.p.length && !x.j[0] && !x.j[1];
  function tradeOK(s, t) {
    const a = s.P[t.from], b = s.P[t.to];
    if (!a || !b || t.from === t.to || a.out || b.out) return 'Invalid players.';
    if (sideEmpty(t.give) && sideEmpty(t.get)) return 'Nothing is being traded.';
    for (const [side, who] of [[t.give, t.from], [t.get, t.to]]) {
      const pl = s.P[who];
      if (side.c > pl.cash) return pl.nm + ' does not have that much cash.';
      if (side.j[0] > pl.gj[0] || side.j[1] > pl.gj[1]) return pl.nm + ' does not have that card.';
      for (const i of side.p) if (!tradable(s, who, i)) return SQ[i].n + ' cannot be traded (sell its buildings first).';
    }
    const fee = (side) => side.p.reduce((n, i) => n + (s.mt[i] ? mfee(i) : 0), 0);
    if (a.cash - t.give.c + t.get.c < fee(t.get)) return a.nm + ' cannot afford the mortgage fee.';
    if (b.cash - t.get.c + t.give.c < fee(t.give)) return b.nm + ' cannot afford the mortgage fee.';
    return '';
  }

  const mkLog = (s, p, text) => { s.log.push([p, text]); if (s.log.length > 140) s.log.shift(); };

  function fresh(o) {
    const R = Object.assign({ fp: false, go2: false, cash: 1500, auc: true, lv: 1, rounds: 0 }, o.rules);
    const rnd = o.rnd || Math.random;
    const P = [];
    for (let i = 0; i < o.n; i++) P.push({ nm: (o.names && o.names[i]) || 'Player ' + (i + 1), bot: !!(o.bots && o.bots[i]), tok: o.toks && o.toks[i] != null ? o.toks[i] : i, cash: R.cash, pos: 0, jail: 0, jt: 0, gj: [0, 0], out: 0 });
    return {
      n: o.n, R, P, own: Array(40).fill(-1), hs: Array(40).fill(0), mt: Array(40).fill(0), bh: 32, bH: 12,
      turn: Math.floor(rnd() * o.n), phase: 'roll', d: [0, 0], dbl: 0, again: false, pot: 0,
      auc: null, debt: null, buy: null, trade: null, tid: 0, tt: 1, won: -1, order: [], tb: {}, tp: {},
      dk: [shuffle(rnd, range(16)), shuffle(rnd, range(16))], todo: [], log: []
    };
  }

  function Engine(o) {
    const rnd = o.rnd || Math.random;
    const s = o.state || fresh(o);
    const P = s.P;
    let ev = [];
    const snap = () => {
      const c = {};
      for (const k in s) if (k !== 'dk' && k !== 'todo' && k !== 'log') c[k] = s[k];
      return JSON.parse(JSON.stringify(c));
    };
    const emit = (e, lg, lp) => {
      if (!o.nosnap) e.v = snap();
      if (lg) { e.lg = lg; e.lp = lp == null ? -1 : lp; mkLog(s, e.lp, lg); }
      ev.push(e);
      return e;
    };
    const nm = p => P[p].nm;
    const alive = () => range(s.n).filter(i => !P[i].out);
    const money = n => '$' + n;
    const pot = amt => { if (s.R.fp) s.pot += amt; };
    const unshift = (...a) => s.todo.unshift(...a);

    function nextTurn() {
      let i = s.turn;
      do { i = (i + 1) % s.n; } while (P[i].out);
      s.turn = i; s.dbl = 0; s.again = false; s.tt++; s.phase = 'roll'; s.buy = null; s.debt = null;
      if (s.R.rounds && s.tt > s.R.rounds * s.n) return finish(alive().sort((a, b) => worth(s, b) - worth(s, a))[0], true);
      emit({ t: 'turn', p: i });
    }
    function finish(w, byTime) {
      s.phase = 'over'; s.won = w; s.todo = []; s.auc = s.debt = s.buy = s.trade = null;
      emit({ t: 'win', p: w }, byTime ? `${nm(w)} is the richest after the round limit and wins!` : `${nm(w)} wins the game!`, w);
    }
    function checkWin() {
      const a = alive();
      if (a.length <= 1 && s.phase !== 'over') { finish(a[0], false); return true; }
      return s.phase === 'over';
    }

    function startMove(p, sq, dir, n) {
      const pl = P[p], from = pl.pos;
      const to = sq;
      let pg = -1;
      if (dir > 0) { for (let i = 1; i <= n; i++) if ((from + i) % 40 === 0) { pg = i; break; } }
      pl.pos = to;
      if (pg >= 0) {
        const amt = to === 0 && s.R.go2 ? 400 : 200;
        pl.cash += amt;
        emit({ t: 'step', p, from, to, dir, n, pg, amt }, `${nm(p)} passes GO and collects ${money(amt)}`, p);
      } else emit({ t: 'step', p, from, to, dir, n, pg: -1 });
    }
    function doMove(st) {
      s.todo.shift();
      const pl = P[st.p];
      if (st.dir > 0) {
        const n = st.goto != null ? ((st.goto - pl.pos + 40) % 40 || 40) : st.n;
        startMove(st.p, (pl.pos + n) % 40, 1, n);
      } else startMove(st.p, (pl.pos - st.n + 40) % 40, -1, st.n);
    }
    function sendJail(p) {
      const pl = P[p], from = pl.pos;
      pl.pos = 10; pl.jail = 1; pl.jt = 0;
      if (p === s.turn) { s.again = false; }
      s.todo = s.todo.filter(x => !(x.p === p && (x.k === 'land' || x.k === 'move')));
      emit({ t: 'jail', p, from }, `${nm(p)} goes to Jail`, p);
    }
    function drawCard(p, deck) {
      const id = s.dk[deck].shift(), c = DECKS[deck][id];
      emit({ t: 'card', deck, id, p }, `${nm(p)} draws ${deck ? 'Community Chest' : 'Chance'}: ${c.t}`, p);
      if (c.f !== 'gj') s.dk[deck].push(id);
      const pl = P[p];
      switch (c.f) {
        case 'to': unshift({ k: 'move', p, dir: 1, goto: c.v }, { k: 'land', p }); break;
        case 'ut': { const t = UTILS.find(x => x > pl.pos); unshift({ k: 'move', p, dir: 1, goto: t != null ? t : UTILS[0] }, { k: 'land', p, ut: 1 }); break; }
        case 'rr': { const t = RAILS.find(x => x > pl.pos); unshift({ k: 'move', p, dir: 1, goto: t != null ? t : RAILS[0] }, { k: 'land', p, x2: 1 }); break; }
        case 'cash':
          if (c.v > 0) { pl.cash += c.v; emit({ t: 'cash', p, to: p, from: -1, amt: c.v }, null); }
          else unshift({ k: 'pay', p, to: -1, amt: -c.v, why: 'card', fp: 1 });
          break;
        case 'gj': pl.gj[deck]++; break;
        case 'back': unshift({ k: 'move', p, dir: -1, n: c.v }, { k: 'land', p }); break;
        case 'jail': unshift({ k: 'jail', p }); break;
        case 'rep': {
          let a = 0;
          for (const i of ownedBy(s, p)) if (s.hs[i]) a += s.hs[i] === 5 ? c.H : s.hs[i] * c.h;
          if (a > 0) unshift({ k: 'pay', p, to: -1, amt: a, why: 'repairs', fp: 1 });
          break;
        }
        case 'each': {
          const st = [];
          for (const j of alive()) if (j !== p) st.push(c.v < 0 ? { k: 'pay', p, to: j, amt: -c.v, why: 'card' } : { k: 'pay', p: j, to: p, amt: c.v, why: 'card' });
          unshift(...st);
          break;
        }
      }
    }
    function land(st) {
      s.todo.shift();
      const p = st.p, pl = P[p], sq = pl.pos, q = SQ[sq];
      if (q.price != null) {
        const o = s.own[sq];
        if (o < 0) {
          if (pl.cash >= q.price) unshift({ k: 'buy', p, sq });
          else if (s.R.auc) unshift({ k: 'auction', sq, from: p });
        } else if (o !== p && !s.mt[sq]) {
          if (P[o].jail && s.R.jr) return;
          let amt;
          if (q.k === 'util' && st.ut) {
            s.d = [1 + Math.floor(rnd() * 6), 1 + Math.floor(rnd() * 6)];
            emit({ t: 'roll', p, d: s.d.slice() }, `${nm(p)} rolls ${s.d[0]} + ${s.d[1]} for the utility`, p);
            amt = 10 * (s.d[0] + s.d[1]);
          } else amt = rent(s, sq, s.d[0] + s.d[1]) * (st.x2 ? 2 : 1);
          unshift({ k: 'pay', p, to: o, amt, why: 'rent', sq });
        }
      } else if (q.k === 'tax') unshift({ k: 'pay', p, to: -1, amt: q.tax, why: 'tax', fp: 1 });
      else if (q.k === 'gtj') unshift({ k: 'jail', p });
      else if (q.k === 'chance') drawCard(p, 0);
      else if (q.k === 'chest') drawCard(p, 1);
      else if (q.k === 'fp' && s.R.fp && s.pot > 0) {
        const a = s.pot; s.pot = 0; pl.cash += a;
        emit({ t: 'cash', p, to: p, from: -1, amt: a }, `${nm(p)} collects ${money(a)} from Free Parking`, p);
      }
    }
    function doPay(st) {
      const pl = P[st.p];
      if (st.amt <= 0) { s.todo.shift(); return true; }
      if (pl.cash >= st.amt) {
        pl.cash -= st.amt;
        if (st.to >= 0) P[st.to].cash += st.amt; else if (st.fp) pot(st.amt);
        const why = { rent: 'rent', tax: 'tax', card: '', repairs: 'for repairs', jail: 'to get out of jail', fee: 'fee' }[st.why] || '';
        emit({ t: 'cash', p: st.p, to: st.to, from: st.p, amt: st.amt, why: st.why, sq: st.sq }, st.to >= 0 ? `${nm(st.p)} pays ${money(st.amt)} ${st.why === 'rent' ? 'rent ' : ''}to ${nm(st.to)}${st.sq != null ? ' for ' + SQ[st.sq].n : ''}` : `${nm(st.p)} pays ${money(st.amt)} ${why}`.trim(), st.p);
        s.todo.shift();
        return true;
      }
      s.phase = 'debt';
      s.debt = { p: st.p, to: st.to, amt: st.amt, why: st.why };
      emit({ t: 'debt', p: st.p }, `${nm(st.p)} owes ${money(st.amt)}${st.to >= 0 ? ' to ' + nm(st.to) : ''} and must raise cash`, st.p);
      return false;
    }
    function fin() {
      s.todo.shift();
      const pl = P[s.turn];
      s.buy = s.debt = null;
      if (pl.out) return nextTurn();
      s.phase = s.again && !pl.jail ? 'roll' : 'end';
    }
    function pump() {
      if (s.phase === 'over') return;
      s.phase = 'run';
      let guard = 0;
      while (s.todo.length && guard++ < 400 && s.phase !== 'over') {
        const st = s.todo[0];
        let wait = false;
        switch (st.k) {
          case 'move': doMove(st); break;
          case 'land': land(st); break;
          case 'pay': wait = !doPay(st); break;
          case 'buy': s.phase = 'buy'; s.buy = { p: st.p, sq: st.sq }; wait = true; emit({ t: 'offer', p: st.p, sq: st.sq }); break;
          case 'auction': startAuction(st); wait = !!s.auc; break;
          case 'jail': s.todo.shift(); sendJail(st.p); break;
          case 'fin': fin(); wait = true; break;
          default: s.todo.shift();
        }
        if (wait) return;
      }
      if (s.phase === 'run') { s.phase = 'end'; }
    }

    function pickNext(after) {
      const a = s.auc;
      a.cur = -1;
      for (let i = 1; i <= s.n; i++) {
        const j = (after + i) % s.n;
        if (P[j].out || a.out[j] || j === a.who) continue;
        if (P[j].cash <= a.bid) { a.out[j] = 1; continue; }
        a.cur = j; return;
      }
    }
    function startAuction(st) {
      const from = st.from != null ? st.from : s.turn;
      s.auc = { sq: st.sq, bid: 0, who: -1, cur: -1, out: P.map(x => x.out ? 1 : 0), from };
      pickNext(from);
      s.phase = 'auc';
      emit({ t: 'aucs', sq: st.sq }, `Auction: ${SQ[st.sq].n}`);
      if (s.auc.cur < 0) endAuction(false);
    }
    function endAuction(sale) {
      const a = s.auc;
      s.auc = null;
      s.todo.shift();
      if (sale && a.who >= 0) {
        const w = P[a.who];
        w.cash -= a.bid; s.own[a.sq] = a.who;
        let fee = 0;
        if (s.mt[a.sq]) { fee = Math.min(w.cash, mfee(a.sq)); w.cash -= fee; }
        emit({ t: 'buy', p: a.who, sq: a.sq, price: a.bid, auc: 1 }, `${nm(a.who)} wins the auction for ${SQ[a.sq].n} at ${money(a.bid)}${fee ? ' (+' + money(fee) + ' mortgage fee)' : ''}`, a.who);
      } else emit({ t: 'aucx', sq: a.sq }, `Nobody bids on ${SQ[a.sq].n}`);
    }
    function aucAdvance() {
      const a = s.auc;
      pickNext(a.cur >= 0 ? a.cur : a.from);
      if (a.cur < 0) { endAuction(a.who >= 0); pump(); }
    }

    function bankrupt(p, to) {
      const pl = P[p];
      for (const i of ownedBy(s, p)) {
        if (s.hs[i]) { const n = s.hs[i]; pl.cash += n * SQ[i].hc / 2; if (n === 5) s.bH++; else s.bh += n; s.hs[i] = 0; }
      }
      const props = ownedBy(s, p);
      const cards = pl.gj.slice();
      if (to >= 0) {
        const c = P[to];
        c.cash += pl.cash;
        let fee = 0;
        for (const i of props) { s.own[i] = to; if (s.mt[i]) fee += mfee(i); }
        c.cash -= Math.min(c.cash, fee);
        c.gj[0] += cards[0]; c.gj[1] += cards[1];
      } else {
        for (const i of props) { s.own[i] = -1; }
        for (let d = 0; d < 2; d++) for (let k = 0; k < cards[d]; k++) s.dk[d].push(GJ_ID[d]);
      }
      pl.cash = 0; pl.gj = [0, 0]; pl.out = 1; pl.jail = 0;
      s.order.push(p);
      s.todo = s.todo.filter(x => x.p !== p && x.k !== 'auction' && x.k !== 'fin');
      s.debt = null; s.buy = null; s.trade = null;
      if (s.phase === 'buy' || s.phase === 'debt') s.phase = 'run';
      if (s.auc && s.auc.sq != null) s.auc = null;
      emit({ t: 'out', p, to }, to >= 0 ? `${nm(p)} is bankrupt. Everything goes to ${nm(to)}` : `${nm(p)} is bankrupt. The bank auctions the properties`, p);
      if (checkWin()) return;
      if (to < 0) { const au = props.map(i => ({ k: 'auction', sq: i, from: p })); s.todo.unshift(...au); }
      s.todo.push({ k: 'fin', p: s.turn });
      pump();
    }

    function settle() {
      if (s.phase !== 'debt') return;
      const st = s.todo[0];
      if (st && P[st.p].cash >= st.amt) { s.debt = null; pump(); }
    }
    function execTrade(t) {
      const a = P[t.from], b = P[t.to];
      a.cash += t.get.c - t.give.c; b.cash += t.give.c - t.get.c;
      const move = (list, from, to) => list.forEach(i => { s.own[i] = to; if (s.mt[i]) { const f = Math.min(P[to].cash, mfee(i)); P[to].cash -= f; } });
      move(t.give.p, t.from, t.to); move(t.get.p, t.to, t.from);
      for (let d = 0; d < 2; d++) { a.gj[d] += t.get.j[d] - t.give.j[d]; b.gj[d] += t.give.j[d] - t.get.j[d]; }
    }
    const describe = x => {
      const bits = [];
      if (x.c) bits.push(money(x.c));
      x.p.forEach(i => bits.push(SQ[i].n));
      if (x.j[0]) bits.push('Chance jail card');
      if (x.j[1]) bits.push('Chest jail card');
      return bits.length ? bits.join(', ') : 'nothing';
    };

    function doRoll(p) {
      const d = [1 + Math.floor(rnd() * 6), 1 + Math.floor(rnd() * 6)];
      s.d = d;
      const dbl = d[0] === d[1], pl = P[p];
      s.phase = 'run';
      emit({ t: 'roll', p, d: d.slice(), dbl }, `${nm(p)} rolls ${d[0]} + ${d[1]}${dbl ? ' (doubles)' : ''}`, p);
      s.again = false;
      const tot = d[0] + d[1];
      if (pl.jail) {
        if (dbl) {
          pl.jail = 0; pl.jt = 0;
          emit({ t: 'free', p }, `${nm(p)} rolls doubles and leaves Jail`, p);
          s.todo = [{ k: 'move', p, dir: 1, n: tot }, { k: 'land', p }, { k: 'fin', p }];
        } else {
          pl.jt++;
          if (pl.jt >= 3) {
            pl.jail = 0; pl.jt = 0;
            emit({ t: 'free', p }, `${nm(p)} pays the $50 fine after three failed tries`, p);
            s.todo = [{ k: 'pay', p, to: -1, amt: 50, why: 'jail', fp: 1 }, { k: 'move', p, dir: 1, n: tot }, { k: 'land', p }, { k: 'fin', p }];
          } else {
            emit({ t: 'info' }, `${nm(p)} stays in Jail (attempt ${pl.jt} of 3)`, p);
            s.todo = [{ k: 'fin', p }];
          }
        }
      } else if (dbl && s.dbl >= 2) {
        s.dbl++;
        s.todo = [{ k: 'jail', p }, { k: 'fin', p }];
        emit({ t: 'info' }, `${nm(p)} rolled three doubles in a row`, p);
      } else {
        if (dbl) { s.dbl++; s.again = true; }
        s.todo = [{ k: 'move', p, dir: 1, n: tot }, { k: 'land', p }, { k: 'fin', p }];
      }
      pump();
    }

    function dispatch(p, a) {
      const pl = P[p];
      if (!pl || pl.out) return false;
      const ph = s.phase;
      switch (a.a) {
        case 'roll':
          if (ph !== 'roll' || p !== s.turn || s.trade) return false;
          doRoll(p); return true;
        case 'jail':
          if (ph !== 'roll' || p !== s.turn || !pl.jail || s.trade) return false;
          if (a.m === 'pay') {
            if (pl.cash < 50) return false;
            pl.cash -= 50; pot(50); pl.jail = 0; pl.jt = 0;
            emit({ t: 'cash', p, to: -1, from: p, amt: 50, why: 'jail' }, null);
            emit({ t: 'free', p }, `${nm(p)} pays $50 and leaves Jail`, p);
            return true;
          }
          if (a.m === 'card') {
            const d = pl.gj[0] > 0 ? 0 : pl.gj[1] > 0 ? 1 : -1;
            if (d < 0) return false;
            pl.gj[d]--; s.dk[d].push(GJ_ID[d]); pl.jail = 0; pl.jt = 0;
            emit({ t: 'free', p }, `${nm(p)} uses a Get Out of Jail Free card`, p);
            return true;
          }
          return false;
        case 'buy': {
          if (ph !== 'buy' || !s.buy || s.buy.p !== p || s.trade) return false;
          const sq = s.buy.sq, price = SQ[sq].price;
          if (pl.cash < price) return false;
          pl.cash -= price; s.own[sq] = p; s.buy = null; s.phase = 'run'; s.todo.shift();
          emit({ t: 'buy', p, sq, price }, `${nm(p)} buys ${SQ[sq].n} for ${money(price)}`, p);
          pump(); return true;
        }
        case 'decline': {
          if (ph !== 'buy' || !s.buy || s.buy.p !== p || s.trade) return false;
          const sq = s.buy.sq;
          s.buy = null; s.phase = 'run'; s.todo.shift();
          emit({ t: 'info' }, `${nm(p)} declines ${SQ[sq].n}`, p);
          if (s.R.auc) unshift({ k: 'auction', sq, from: p });
          pump(); return true;
        }
        case 'bid': {
          const au = s.auc;
          if (ph !== 'auc' || !au || au.cur !== p || s.trade) return false;
          const amt = Math.floor(+a.amt);
          if (!(amt > au.bid) || amt > pl.cash) return false;
          au.bid = amt; au.who = p;
          emit({ t: 'bid', p, amt }, `${nm(p)} bids ${money(amt)}`, p);
          aucAdvance(); return true;
        }
        case 'pass': {
          const au = s.auc;
          if (ph !== 'auc' || !au || au.cur !== p || s.trade) return false;
          au.out[p] = 1;
          emit({ t: 'info' }, `${nm(p)} passes`, p);
          aucAdvance(); return true;
        }
        case 'end':
          if (ph !== 'end' || p !== s.turn || s.trade) return false;
          nextTurn(); return true;
        case 'build':
          if (!manageOK(s, p) || !canBuild(s, p, a.sq)) return false;
          pl.cash -= SQ[a.sq].hc;
          if (s.hs[a.sq] < 4) { s.bh--; s.hs[a.sq]++; } else { s.bH--; s.bh += 4; s.hs[a.sq] = 5; }
          emit({ t: 'build', p, sq: a.sq }, `${nm(p)} builds a ${s.hs[a.sq] === 5 ? 'hotel' : 'house'} on ${SQ[a.sq].n}`, p);
          return true;
        case 'sell': {
          if (!manageOK(s, p) || !canSell(s, p, a.sq)) return false;
          const hc = SQ[a.sq].hc;
          if (s.hs[a.sq] === 5) {
            const n = Math.min(4, s.bh);
            s.bh -= n; s.bH++; pl.cash += (5 - n) * hc / 2; s.hs[a.sq] = n;
          } else { s.bh++; s.hs[a.sq]--; pl.cash += hc / 2; }
          emit({ t: 'sell', p, sq: a.sq }, `${nm(p)} sells a building on ${SQ[a.sq].n}`, p);
          settle(); return true;
        }
        case 'mort':
          if (!manageOK(s, p) || !canMort(s, p, a.sq)) return false;
          s.mt[a.sq] = 1; pl.cash += mval(a.sq);
          emit({ t: 'mort', p, sq: a.sq }, `${nm(p)} mortgages ${SQ[a.sq].n} for ${money(mval(a.sq))}`, p);
          settle(); return true;
        case 'unmort':
          if (!manageOK(s, p) || !canUnmort(s, p, a.sq)) return false;
          s.mt[a.sq] = 0; pl.cash -= ucost(a.sq);
          emit({ t: 'unmort', p, sq: a.sq }, `${nm(p)} pays ${money(ucost(a.sq))} to lift the mortgage on ${SQ[a.sq].n}`, p);
          return true;
        case 'bankrupt':
          if (!((ph === 'debt' && s.debt.p === p) || ((ph === 'roll' || ph === 'end') && p === s.turn && !s.trade))) return false;
          bankrupt(p, ph === 'debt' ? s.debt.to : -1);
          return true;
        case 'trade': {
          if (!canTrade(s, p)) return false;
          const to = Math.floor(+a.to);
          if (s.trade && s.trade.to !== p) return false;
          if (s.trade && to !== s.trade.from) return false;
          const t = { from: p, to, give: cleanSide(a.give), get: cleanSide(a.get) };
          if (tradeOK(s, t)) return false;
          s.trade = t; s.tp[p] = s.tt;
          emit({ t: 'trade', p, to }, `${nm(p)} offers ${nm(to)}: ${describe(t.give)} for ${describe(t.get)}`, p);
          return true;
        }
        case 'tr-ok': {
          const t = s.trade;
          if (!t || t.to !== p) return false;
          if (tradeOK(s, t)) { s.trade = null; emit({ t: 'info' }, 'The trade is no longer possible', -1); return true; }
          s.trade = null; execTrade(t);
          emit({ t: 'deal', p: t.from, to: t.to }, `${nm(p)} accepts. Trade done: ${nm(t.from)} gives ${describe(t.give)}, ${nm(t.to)} gives ${describe(t.get)}`, p);
          settle(); return true;
        }
        case 'tr-no': {
          const t = s.trade;
          if (!t || t.to !== p) return false;
          s.trade = null; s.tb[t.from + ',' + t.to] = s.tt;
          emit({ t: 'info' }, `${nm(p)} declines the trade`, p);
          return true;
        }
        case 'tr-cancel': {
          const t = s.trade;
          if (!t || t.from !== p) return false;
          s.trade = null;
          emit({ t: 'info' }, `${nm(p)} withdraws the offer`, p);
          return true;
        }
      }
      return false;
    }

    const eng = {
      s, snap,
      need: () => needOf(s),
      take() { const r = ev; ev = []; return r; },
      view: snap,
      start() { emit({ t: 'turn', p: s.turn, first: 1 }, 'The game begins'); emit({ t: 'ph' }); },
      act(p, a) {
        if (!a || s.phase === 'over') return false;
        const ok = dispatch(p, a);
        if (ok) { s.tid++; emit({ t: 'ph' }); }
        return ok;
      },
      setBot(p, v) { P[p].bot = v; },
      touch(lg) { emit({ t: 'info' }, lg); emit({ t: 'ph' }); },
      rename(p, n) { P[p].nm = n; }
    };
    return eng;
  }


  const PRI_N = ['orange', 'red', 'yellow', 'pink', 'green', 'dblue', 'lblue', 'brown'];
  const PRI_H = ['orange', 'red', 'yellow', 'pink', 'lblue', 'green', 'dblue', 'brown'];

  function botKeep(s, p) {
    const lv = s.R.lv;
    if (lv === 0) return 20;
    let dg = 0;
    for (let i = 0; i < 40; i++) if (s.own[i] >= 0 && s.own[i] !== p && !s.mt[i]) dg = Math.max(dg, rent(s, i, 7));
    return Math.min(450, Math.max(lv === 2 ? 70 : 110, dg * (lv === 2 ? 0.7 : 1)));
  }
  function propVal(s, p, sq) {
    const q = SQ[sq], g = q.g, n = GROUPS[g].length;
    const mine = cntG(s, p, g) + (s.own[sq] === p ? 0 : 1);
    let v = q.price;
    if (mine === n) v += GBONUS[g];
    else {
      const ow = GROUPS[g].filter(i => i !== sq).map(i => s.own[i]);
      const o = ow.find(x => x >= 0 && x !== p);
      if (o != null && ow.every(x => x === o)) v += GBONUS[g] * 0.6;
      else if (mine > 1 && n > 2) v += q.price * 0.25 * (mine - 1);
    }
    if (q.k === 'rail') v += 25 * cntG(s, p, 'rail');
    return v;
  }
  function aiBuy(s, p, R) {
    const sq = s.buy.sq, q = SQ[sq], cash = s.P[p].cash, lv = s.R.lv;
    if (lv === 0) return R() < 0.9 ? 'buy' : 'decline';
    const v = propVal(s, p, sq), keep = botKeep(s, p);
    if (v >= q.price * 1.5) return 'buy';
    if (cash - q.price >= keep) return 'buy';
    if (lv === 2 && cash - q.price >= keep * 0.4 && v > q.price * 1.15) return 'buy';
    return 'decline';
  }
  function aiBid(s, p) {
    const a = s.auc, q = SQ[a.sq], cash = s.P[p].cash, lv = s.R.lv;
    let v = lv === 0 ? q.price * 0.8 : propVal(s, p, a.sq) * (lv === 2 ? 1 : 0.9);
    v *= 0.92 + ((p * 37 + a.sq) % 7) / 40;
    if (s.mt[a.sq]) v *= 0.8;
    const max = Math.min(Math.floor(v), cash - (lv === 0 ? 0 : Math.round(botKeep(s, p) * 0.4)));
    if (a.bid >= max || max < 1) return { a: 'pass' };
    const step = a.bid < max * 0.5 ? Math.max(10, Math.round(max / 100) * 10) : 10;
    return { a: 'bid', amt: Math.max(a.bid + 1, Math.min(max, a.bid + step)) };
  }
  function aiBuild(s, p) {
    const lv = s.R.lv, cash = s.P[p].cash;
    if (lv === 0 && cash < 700) return null;
    const keep = lv === 0 ? 150 : botKeep(s, p) + 40;
    const sets = ORDER_G.filter(g => g !== 'rail' && g !== 'util' && fullG(s, p, g) && !anyMort(s, g));
    if (!sets.length) return null;
    const minLv = g => Math.min(...GROUPS[g].map(i => s.hs[i]));
    const cap = sets.some(g => minLv(g) < 3) ? 3 : 5;
    const pri = lv === 2 ? PRI_H : PRI_N;
    sets.sort((a, b) => pri.indexOf(a) - pri.indexOf(b));
    for (const g of sets) {
      if (minLv(g) >= cap) continue;
      const c = GROUPS[g].filter(i => canBuild(s, p, i)).sort((a, b) => s.hs[a] - s.hs[b])[0];
      if (c != null && cash - SQ[c].hc >= keep) return { a: 'build', sq: c };
    }
    return null;
  }
  function aiUnmort(s, p) {
    const keep = botKeep(s, p) + 30, cash = s.P[p].cash;
    const c = ownedBy(s, p).filter(i => s.mt[i] && cash - ucost(i) >= keep);
    if (!c.length) return null;
    c.sort((a, b) => (fullG(s, p, SQ[b].g) ? 1000 : 0) + SQ[b].price - ((fullG(s, p, SQ[a].g) ? 1000 : 0) + SQ[a].price));
    return { a: 'unmort', sq: c[0] };
  }
  function aiJail(s, p) {
    const pl = s.P[p];
    let unowned = 0, hot = 0;
    for (let i = 0; i < 40; i++) { if (SQ[i].price != null && s.own[i] < 0) unowned++; hot += s.hs[i]; }
    if (s.R.lv >= 1 && unowned <= 3 && hot >= 5) return null;
    if (pl.gj[0] + pl.gj[1] > 0) return { a: 'jail', m: 'card' };
    if (pl.cash >= 50 + botKeep(s, p) && unowned >= 3) return { a: 'jail', m: 'pay' };
    return null;
  }
  function aiRaise(s, p) {
    const need = s.debt.amt - s.P[p].cash;
    if (liquid(s, p) < need) return { a: 'bankrupt' };
    const c = [];
    for (const i of ownedBy(s, p)) {
      const q = SQ[i];
      if (canMort(s, p, i)) c.push({ a: { a: 'mort', sq: i }, sc: (q.k === 'prop' && fullG(s, p, q.g) ? 2000 : 0) + q.price + (q.k === 'rail' ? 150 : 0) });
      if (canSell(s, p, i)) c.push({ a: { a: 'sell', sq: i }, sc: 800 + GBONUS[q.g] - s.hs[i] * 10 });
    }
    c.sort((a, b) => a.sc - b.sc);
    return c[0] ? c[0].a : { a: 'bankrupt' };
  }

  function posVal(s, own, who, syn) {
    let v = 0;
    for (let i = 0; i < 40; i++) if (own[i] === who) v += SQ[i].price * (s.mt[i] ? 0.75 : 1);
    if (!syn) return v;
    for (const g of ORDER_G) {
      const mem = GROUPS[g];
      if (mem.every(i => own[i] === who)) v += GBONUS[g];
      else for (let o = 0; o < s.n; o++) if (o !== who && !s.P[o].out && mem.every(i => own[i] === o)) v -= GBONUS[g] * 0.7;
    }
    return v;
  }
  function tradeDelta(s, t, who, syn) {
    const own = s.own.slice();
    t.give.p.forEach(i => { own[i] = t.to; });
    t.get.p.forEach(i => { own[i] = t.from; });
    const me = who === t.from, g = me ? t.give : t.get, r = me ? t.get : t.give;
    const cash = r.c - g.c, jd = r.j[0] + r.j[1] - g.j[0] - g.j[1];
    return posVal(s, own, who, syn) - posVal(s, s.own, who, syn) + cash + 45 * jd;
  }
  function stag(s) {
    let c = 0;
    for (const g of ORDER_G) { const m = GROUPS[g]; if (s.own[m[0]] >= 0 && m.every(i => s.own[i] === s.own[m[0]])) c++; }
    if (!s.mk || c > s.mk.c) s.mk = { c, tt: s.tt }; else s.mk.c = c;
    return Math.max(0, Math.floor((s.tt - s.mk.tt) / (s.n * 10)));
  }
  function aiTradeReply(s, p, R) {
    const t = s.trade, lv = s.R.lv, st = stag(s);
    const d = tradeDelta(s, t, p, lv > 0);
    const gross = t.give.c + t.get.c + t.give.p.concat(t.get.p).reduce((a, i) => a + SQ[i].price, 0);
    if (lv === 0) return d >= -st * 30 && R() < 0.7 + Math.min(.3, st * .1);
    return d >= (lv === 2 ? 35 + gross * 0.04 : 20) - st * (40 + gross * 0.03);
  }
  function aiPropose(s, p, R) {
    const lv = s.R.lv, st = stag(s);
    if (s.trade || s.tp[p] === s.tt) return null;
    if (R() > Math.min(1, (lv === 2 ? 0.8 : lv === 1 ? 0.45 : 0.3) + st * 0.2)) return null;
    const me = s.P[p], keep = botKeep(s, p);
    for (const g of ORDER_G) {
      const mem = GROUPS[g], mine = mem.filter(i => s.own[i] === p);
      if (!mine.length || mine.length === mem.length) continue;
      if (g === 'util') continue;
      const miss = mem.filter(i => s.own[i] !== p), owners = [...new Set(miss.map(i => s.own[i]))];
      if (owners.length !== 1 || owners[0] < 0 || s.P[owners[0]].out) continue;
      const o = owners[0];
      if (miss.some(i => !tradable(s, o, i)) || mine.some(i => !tradable(s, p, i))) continue;
      const tb = s.tb[p + ',' + o];
      if (tb != null && s.tt - tb < s.n * 2 / (1 + st)) continue;
      const gross = miss.reduce((a, i) => a + SQ[i].price, 0);
      const spare = ownedBy(s, p).filter(i => !mem.includes(i) && tradable(s, p, i) && !s.mt[i] && cntG(s, p, SQ[i].g) === 1).sort((a, b) => SQ[a].price - SQ[b].price);
      for (const m of st ? [1, 1.25, 1.5, 1.8, 2.2, 2.8, 3.5] : [1, 1.25, 1.5, 1.8, 2.2]) {
        const target = Math.round(gross * m);
        const c = Math.max(0, Math.min(me.cash - (st ? keep * 0.4 : keep), Math.round(target / 10) * 10));
        const give = { c, p: [], j: [0, 0] };
        let tot = c;
        for (const sp of spare) if (tot < target) { give.p.push(sp); tot += SQ[sp].price; }
        if (tot < gross * 0.9) continue;
        const t = { from: p, to: o, give, get: { c: 0, p: miss, j: [0, 0] } };
        if (tradeOK(s, t)) continue;
        if (tradeDelta(s, t, p, true) > 20 - st * 40 && tradeDelta(s, t, o, true) >= 25 - st * 30) return { a: 'trade', to: o, give, get: t.get };
      }
    }
    return null;
  }

  function aiAct(s, p, R) {
    const nd = needOf(s);
    if (!nd || nd.p !== p) return null;
    const lv = s.R.lv;
    switch (nd.k) {
      case 'buy': return { a: aiBuy(s, p, R) };
      case 'auc': return aiBid(s, p);
      case 'debt': return aiRaise(s, p);
      case 'trade': return { a: aiTradeReply(s, p, R) ? 'tr-ok' : 'tr-no' };
      case 'roll':
      case 'end': {
        const pl = s.P[p];
        if (nd.k === 'roll' && pl.jail) { const j = aiJail(s, p); if (j) return j; }
        const m = (lv > 0 || R() < 0.5 ? aiUnmort(s, p) : null) || aiBuild(s, p) || aiPropose(s, p, R);
        if (m) return m;
        return { a: nd.k === 'roll' ? 'roll' : 'end' };
      }
    }
    return null;
  }
  function autoAct(s, nd) {
    switch (nd.k) {
      case 'roll': return { a: 'roll' };
      case 'buy': return { a: 'decline' };
      case 'auc': return { a: 'pass' };
      case 'end': return { a: 'end' };
      case 'trade': return { a: 'tr-no' };
      case 'debt': return aiRaise(s, nd.p);
    }
    return null;
  }


  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex2rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const shade = (h, k) => {
    const [r, g, b] = hex2rgb(h);
    const f = k < 0 ? v => Math.round(v * (1 + k)) : v => Math.round(v + (255 - v) * k);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function txt(ctx, s, x, y, size, fill, align, weight, stroke) {
    ctx.font = `${weight || 800} ${size}px ${FONT}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    if (stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * .2); ctx.strokeStyle = stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  }
  function fitTxt(ctx, s, x, y, size, maxW, fill, weight) {
    ctx.font = `${weight || 800} ${size}px ${FONT}`;
    const w = ctx.measureText(s).width;
    if (w > maxW) size = size * maxW / w;
    txt(ctx, s, x, y, size, fill, 'center', weight);
  }

  const PCOL = ['#e53935', '#1e88e5', '#2e9e4f', '#fbc02d', '#8e44ad', '#ef6c00'];
  const PCOL_N = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
  const TOKS = ['Car', 'Top hat', 'Scottie', 'Battleship', 'Boot', 'Thimble'];

  function tokBody(ctx, col) {
    const g = ctx.createLinearGradient(-1, -1, 1, 1);
    g.addColorStop(0, shade(col, .55)); g.addColorStop(.45, col); g.addColorStop(1, shade(col, -.45));
    ctx.fillStyle = g; ctx.strokeStyle = shade(col, -.7); ctx.lineWidth = .075; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  }
  const TOKDRAW = [
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.moveTo(-1, .5); ctx.lineTo(-1, .12); ctx.quadraticCurveTo(-1, -.04, -.8, -.08); ctx.lineTo(-.5, -.12); ctx.lineTo(-.3, -.5); ctx.quadraticCurveTo(-.24, -.6, -.1, -.6); ctx.lineTo(.36, -.6); ctx.quadraticCurveTo(.46, -.6, .52, -.5); ctx.lineTo(.7, -.12); ctx.lineTo(.9, -.06); ctx.quadraticCurveTo(1, 0, 1, .15); ctx.lineTo(1, .5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d6efff'; ctx.beginPath(); ctx.moveTo(-.4, -.14); ctx.lineTo(-.24, -.46); ctx.lineTo(.04, -.46); ctx.lineTo(.04, -.14); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(.14, -.14); ctx.lineTo(.14, -.46); ctx.lineTo(.36, -.46); ctx.lineTo(.54, -.14); ctx.closePath(); ctx.fill();
      for (const x of [-.55, .55]) { ctx.fillStyle = '#25252b'; ctx.beginPath(); ctx.arc(x, .52, .28, 0, TAU); ctx.fill(); ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.arc(x, .52, .12, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#fff6b8'; ctx.beginPath(); ctx.arc(.93, .12, .08, 0, TAU); ctx.fill();
    },
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.ellipse(0, .6, 1, .27, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-.55, .6); ctx.lineTo(-.55, -.62); ctx.quadraticCurveTo(-.55, -.84, -.3, -.84); ctx.lineTo(.3, -.84); ctx.quadraticCurveTo(.55, -.84, .55, -.62); ctx.lineTo(.55, .6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1f1f27'; ctx.fillRect(-.55, .22, 1.1, .26);
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-.38, -.7, .12, .8);
    },
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.moveTo(-.92, .05); ctx.quadraticCurveTo(-1.1, -.3, -.95, -.55); ctx.lineWidth = .17; ctx.strokeStyle = shade(col, -.45); ctx.stroke(); ctx.lineWidth = .075;
      tokBody(ctx, col);
      for (const x of [-.65, -.35, .15, .42]) { ctx.beginPath(); ctx.rect(x - .09, .3, .2, .56); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(-.08, .12, .78, .4, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(.35, -.36); ctx.lineTo(.46, -.88); ctx.lineTo(.68, -.42); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(.55, -.2, .38, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(.72, -.18, .34, .24, .1) : ctx.rect(.72, -.18, .34, .24); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#16161c'; ctx.beginPath(); ctx.arc(.64, -.3, .06, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(1.03, -.1, .06, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e9e9ef'; ctx.fillRect(.3, .0, .4, .1);
    },
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.moveTo(-1, .12); ctx.lineTo(1, .12); ctx.lineTo(.74, .62); ctx.lineTo(-.82, .62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-.4, -.3, .8, .42); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-.12, -.72, .3, .42); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b2b33'; ctx.fillRect(-.12, -.76, .3, .12);
      ctx.fillStyle = '#d6efff'; for (const x of [-.3, -.02, .24]) ctx.fillRect(x, -.18, .13, .13);
      ctx.fillStyle = '#44444c'; ctx.fillRect(.5, .0, .5, .09); ctx.fillRect(-.9, .02, .4, .08);
      ctx.strokeStyle = '#7cc6ff'; ctx.lineWidth = .08; ctx.beginPath(); ctx.moveTo(-1, .8); ctx.quadraticCurveTo(-.7, .62, -.4, .8); ctx.quadraticCurveTo(-.1, .98, .2, .8); ctx.quadraticCurveTo(.5, .62, .8, .8); ctx.stroke();
    },
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.moveTo(-.55, -.9); ctx.lineTo(.02, -.9); ctx.lineTo(.02, .06); ctx.quadraticCurveTo(.2, .2, .52, .3); ctx.quadraticCurveTo(1.05, .42, .98, .72); ctx.lineTo(.98, .85); ctx.lineTo(-.55, .85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b2b33'; ctx.fillRect(-.55, .68, 1.53, .17);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-.42, -.82, .1, .8);
      ctx.strokeStyle = '#f3f3f6'; ctx.lineWidth = .06; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-.4 + i * .14, .12 + i * .1); ctx.lineTo(-.12 + i * .16, .06 + i * .1); ctx.stroke(); }
    },
    (ctx, col) => {
      tokBody(ctx, col);
      ctx.beginPath(); ctx.moveTo(-.62, .78); ctx.lineTo(-.72, -.08); ctx.quadraticCurveTo(-.72, -.86, 0, -.86); ctx.quadraticCurveTo(.72, -.86, .72, -.08); ctx.lineTo(.62, .78); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4 - (r === 0 ? 1 : 0); c++) { const x = (c - (r === 0 ? 1 : 1.5)) * .3 + (r % 2 ? .0 : .0), y = -.55 + r * .3; ctx.beginPath(); ctx.arc(x, y, .06, 0, TAU); ctx.fill(); }
      tokBody(ctx, col);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-.78, .64, 1.56, .28, .1) : ctx.rect(-.78, .64, 1.56, .28); ctx.fill(); ctx.stroke();
    }
  ];
  function drawTok(ctx, tok, x, y, sz, col, o) {
    o = o || {};
    const u = sz / 2, sx = o.sx || 1, sy = o.sy || 1, lift = o.lift || 0;
    ctx.save();
    ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y + u * .78, u * 1.0 * (1 - lift / 90), u * .25 * (1 - lift / 90), 0, 0, TAU); ctx.fill();
    if (o.ring) { ctx.strokeStyle = o.ring; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(x, y + u * .78, u * 1.2, u * .34, 0, 0, TAU); ctx.stroke(); }
    ctx.translate(x, y - lift); ctx.translate(0, u * .78); ctx.scale(sx, sy); ctx.translate(0, -u * .78); ctx.scale(u * .94, u * .94);
    TOKDRAW[tok % 6](ctx, col);
    ctx.restore();
  }
  const iconCache = new Map();
  function tokIcon(tok, col, size) {
    const k = tok + col + size;
    if (iconCache.has(k)) return iconCache.get(k);
    const c = document.createElement('canvas'), d = 2;
    c.width = c.height = size * d;
    const ctx = c.getContext('2d');
    ctx.scale(d, d);
    drawTok(ctx, tok, size / 2, size * .42, size * .88, col, { alpha: 1 });
    const url = c.toDataURL();
    iconCache.set(k, url);
    return url;
  }

  function mm(A, B) {
    const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    return R;
  }
  const mv = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
  const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
  const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
  const rotZ = a => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
  const IDM = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const DFACE = {
    1: { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, 6: { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] },
    2: { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, 5: { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    3: { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, 4: { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }
  };
  const DR0 = { 1: IDM, 6: rotY(Math.PI), 2: rotY(-Math.PI / 2), 5: rotY(Math.PI / 2), 3: rotX(Math.PI / 2), 4: rotX(-Math.PI / 2) };
  const DPIP = { 1: [[0, 0]], 2: [[-.5, -.5], [.5, .5]], 3: [[-.5, -.5], [0, 0], [.5, .5]], 4: [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]], 5: [[-.5, -.5], [.5, -.5], [0, 0], [-.5, .5], [.5, .5]], 6: [[-.5, -.5], [-.5, 0], [-.5, .5], [.5, -.5], [.5, 0], [.5, .5]] };
  const DTILT = mm(rotX(-.52), rotY(.5));
  const DLIGHT = (() => { const l = [-.4, .7, .75], n = Math.hypot(...l); return l.map(v => v / n); })();
  function drawDie(ctx, cx, cy, size, M) {
    const sz = size / 2 / 1.3;
    const faces = [];
    for (let f = 1; f <= 6; f++) {
      const F = DFACE[f], n = mv(M, F.n);
      if (n[2] <= 0.02) continue;
      faces.push({ f, F, n, u: mv(M, F.u), v: mv(M, F.v) });
    }
    ctx.save();
    ctx.lineJoin = 'round';
    for (const fc of faces) {
      const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => {
        const p = [fc.n[0] + fc.u[0] * a + fc.v[0] * b, fc.n[1] + fc.u[1] * a + fc.v[1] * b];
        return [cx + p[0] * sz, cy - p[1] * sz];
      });
      const l = fc.n[0] * DLIGHT[0] + fc.n[1] * DLIGHT[1] + fc.n[2] * DLIGHT[2];
      const b = clamp(.62 + .38 * l, .5, 1.04);
      const col = `rgb(${Math.min(255, Math.round(252 * b))},${Math.min(255, Math.round(248 * b))},${Math.min(255, Math.round(238 * b))})`;
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = sz * .34;
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    for (const fc of faces) {
      ctx.save();
      ctx.transform(fc.u[0] * sz, -fc.u[1] * sz, fc.v[0] * sz, -fc.v[1] * sz, cx + fc.n[0] * sz, cy - fc.n[1] * sz);
      ctx.fillStyle = fc.f === 1 ? '#d6281f' : '#1c1d26';
      for (const [a, b] of DPIP[fc.f]) { ctx.beginPath(); ctx.arc(a * 1.18, b * 1.18, fc.f === 1 ? .3 : .21, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
  }

  const B = 620, CR = 90, SW = (B - 2 * CR) / 9;
  const GEO = (() => {
    const out = [];
    for (let i = 0; i < 40; i++) {
      let x, y, w, h, side;
      if (i === 0) { x = B - CR; y = B - CR; w = h = CR; side = -1; }
      else if (i < 10) { x = B - CR - i * SW; y = B - CR; w = SW; h = CR; side = 0; }
      else if (i === 10) { x = 0; y = B - CR; w = h = CR; side = -1; }
      else if (i < 20) { x = 0; y = B - CR - (i - 10) * SW; w = CR; h = SW; side = 1; }
      else if (i === 20) { x = 0; y = 0; w = h = CR; side = -1; }
      else if (i < 30) { x = CR + (i - 21) * SW; y = 0; w = SW; h = CR; side = 2; }
      else if (i === 30) { x = B - CR; y = 0; w = h = CR; side = -1; }
      else { x = B - CR; y = CR + (i - 31) * SW; w = CR; h = SW; side = 3; }
      const ang = side < 0 ? 0 : [0, Math.PI / 2, Math.PI, -Math.PI / 2][side];
      out.push({ x, y, w, h, side, cx: x + w / 2, cy: y + h / 2, ang, lw: side === 1 || side === 3 ? h : w, lh: side === 1 || side === 3 ? w : h });
    }
    return out;
  })();
  const toWorld = (g, lx, ly) => { const c = Math.cos(g.ang), s = Math.sin(g.ang); return [g.cx + lx * c - ly * s, g.cy + lx * s + ly * c]; };
  const BAND = 19;

  function slotLocal(n, k) {
    const L = [
      [[0, 10]],
      [[-10, 10], [10, 10]],
      [[-10, 0], [10, 0], [0, 20]],
      [[-10, 0], [10, 0], [-10, 20], [10, 20]],
      [[-10, -6], [10, -6], [-10, 12], [10, 12], [0, 28]],
      [[-10, -8], [10, -8], [-10, 10], [10, 10], [-10, 28], [10, 28]]
    ];
    return L[Math.min(n, 6) - 1][k];
  }
  function slotPos(i, n, k, jail) {
    const g = GEO[i];
    if (i === 10) {
      const x = g.x, y = g.y;
      if (jail) { const J = [[22, 24], [46, 24], [22, 46], [46, 46], [34, 35], [34, 56]]; return [x + J[k % 6][0], y + J[k % 6][1] - 2]; }
      const V = [[78, 20], [78, 44], [78, 68], [60, 80], [36, 80], [12, 80]];
      return [x + V[k % 6][0], y + V[k % 6][1] - 4];
    }
    if (g.side < 0) {
      const L = [[-17, -4], [17, -4], [-17, 17], [17, 17], [0, 6], [0, 27]];
      const q = L[k % 6];
      return [g.cx + q[0] * (n === 1 ? 0 : 1), g.cy + q[1] * (n === 1 ? 0 : 1) + (n === 1 ? 8 : 0)];
    }
    const q = slotLocal(n, k);
    return toWorld(g, q[0], q[1]);
  }

  function drawHouse(ctx, x, y, s) {
    ctx.fillStyle = '#2f9e44'; ctx.strokeStyle = '#14532d'; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(x - 4.2 * s, y + 4.5 * s); ctx.lineTo(x - 4.2 * s, y - 1 * s); ctx.lineTo(x, y - 5 * s); ctx.lineTo(x + 4.2 * s, y - 1 * s); ctx.lineTo(x + 4.2 * s, y + 4.5 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c8f2d2'; ctx.fillRect(x - 1 * s, y + .8 * s, 2 * s, 3.7 * s);
  }
  function drawHotel(ctx, x, y, s) {
    ctx.fillStyle = '#d62828'; ctx.strokeStyle = '#7a0c0c'; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.moveTo(x - 10 * s, y + 5 * s); ctx.lineTo(x - 10 * s, y - 2 * s); ctx.lineTo(x - 7 * s, y - 5 * s); ctx.lineTo(x + 7 * s, y - 5 * s); ctx.lineTo(x + 10 * s, y - 2 * s); ctx.lineTo(x + 10 * s, y + 5 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd6d6'; for (const dx of [-6, -1.5, 3]) ctx.fillRect(x + dx * s, y - 1.5 * s, 3 * s, 3 * s);
  }
  function iconRail(ctx, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = col; ctx.beginPath(); ctx.rect(-10, -4, 14, 9); ctx.fill(); ctx.beginPath(); ctx.rect(4, -8, 6, 13); ctx.fill(); ctx.beginPath(); ctx.rect(-3, -8, 4, 5); ctx.fill();
    ctx.fillStyle = '#e9e9ef'; ctx.fillRect(6, -6, 3, 4);
    ctx.fillStyle = col; for (const px of [-7, -1, 7]) { ctx.beginPath(); ctx.arc(px, 6.5, 2.6, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function iconBulb(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#ffd43b'; ctx.strokeStyle = '#8a6d00'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -3, 7, Math.PI * .8, Math.PI * .2, false); ctx.lineTo(3, 7); ctx.lineTo(-3, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#7a7a86'; ctx.fillRect(-3, 7, 6, 3); ctx.restore();
  }
  function iconTap(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#3b82c4'; ctx.fillRect(-7, -8, 10, 4); ctx.fillRect(-3, -8, 4, 8); ctx.fillRect(-3, -2, 8, 3);
    ctx.fillStyle = '#7cc6ff'; ctx.beginPath(); ctx.moveTo(3, 4); ctx.quadraticCurveTo(7, 9, 3, 10); ctx.quadraticCurveTo(-1, 9, 3, 4); ctx.fill(); ctx.restore();
  }
  function iconChance(ctx, x, y, s, col) { txt(ctx, '?', x, y, 30 * s, col, 'center', 900); }
  function iconChest(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#3a8fd6'; ctx.strokeStyle = '#17497a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(-11, -3, 22, 12); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-11, -3); ctx.quadraticCurveTo(0, -14, 11, -3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd43b'; ctx.fillRect(-2.5, -2, 5, 6); ctx.restore();
  }
  function iconRing(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#d4a017'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 4, 6, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#7cc6ff'; ctx.strokeStyle = '#2d6a99'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(5, -4); ctx.lineTo(0, 0); ctx.lineTo(-5, -4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  function drawSquare(ctx, i, v, now, D) {
    const g = GEO[i], q = SQ[i];
    if (g.side < 0) return drawCorner(ctx, i, v, now);
    ctx.save();
    ctx.translate(g.cx, g.cy); ctx.rotate(g.ang);
    const lw = g.lw, lh = g.lh, x0 = -lw / 2, y0 = -lh / 2;
    ctx.fillStyle = '#f3f8ef'; ctx.fillRect(x0, y0, lw, lh);
    const own = v ? v.own[i] : -1, mt = v && v.mt[i];
    if (q.k === 'prop') {
      ctx.fillStyle = GC[q.g]; ctx.fillRect(x0, y0, lw, BAND);
      ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = .8; ctx.strokeRect(x0, y0, lw, BAND);
      const h = v ? v.hs[i] : 0;
      const pop = D && D.pop[i] && now - D.pop[i] < 450 ? 1 + .6 * Math.sin((now - D.pop[i]) / 450 * Math.PI) : 1;
      if (h === 5) drawHotel(ctx, 0, y0 + BAND / 2, .85 * pop);
      else for (let k = 0; k < h; k++) drawHouse(ctx, (k - (h - 1) / 2) * 11, y0 + BAND / 2, .95 * pop);
    }
    let ty = y0 + (q.k === 'prop' ? BAND : 0) + 4;
    const fs = q.k === 'prop' || q.k === 'rail' || q.k === 'util' ? 7.6 : 8.2;
    const lines = q.l;
    const ly0 = q.k === 'prop' ? ty + 7 : q.k === 'rail' || q.k === 'util' ? y0 + 12 : y0 + 11;
    const small = D && D.small;
    if (!small || !(q.k === 'prop' || q.k === 'rail' || q.k === 'util')) lines.forEach((ln, k) => fitTxt(ctx, ln.toUpperCase(), 0, ly0 + k * 8.6, fs, lw - 5, '#1b2a22', 800));
    const iy = y0 + lh * .6;
    if (q.k === 'rail') iconRail(ctx, 0, iy + 2, .95, '#25252d');
    else if (q.k === 'util') { if (i === 12) iconBulb(ctx, 0, iy + 2, 1); else iconTap(ctx, 0, iy + 2, 1); }
    else if (q.k === 'chance') iconChance(ctx, 0, y0 + lh * .55, 1.35, i === 7 ? '#f26a1b' : i === 22 ? '#e0382d' : '#2b6cd0');
    else if (q.k === 'chest') iconChest(ctx, 0, y0 + lh * .6, 1.1);
    else if (q.k === 'tax') { if (i === 38) iconRing(ctx, 0, iy + 1, 1.05); else txt(ctx, '$', 0, iy + 2, 24, '#1f8a43', 'center', 900); }
    if (q.price != null) { if (small) txt(ctx, '$' + q.price, 0, y0 + lh * (q.k === 'prop' ? .5 : .82) + (q.k === 'prop' ? 6 : 0), 15, '#1b2a22', 'center', 900); else txt(ctx, '$' + q.price, 0, y0 + lh - 9, 8.6, '#1b2a22', 'center', 900); }
    else if (q.k === 'tax') txt(ctx, 'PAY $' + q.tax, 0, y0 + lh - 9, 8.2, '#1b2a22', 'center', 900);
    if (mt) {
      ctx.fillStyle = 'rgba(70,70,80,.58)'; ctx.fillRect(x0, y0, lw, lh);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, lw, lh); ctx.clip();
      for (let k = -lh; k < lw + lh; k += 7) { ctx.beginPath(); ctx.moveTo(x0 + k, y0 + lh); ctx.lineTo(x0 + k + lh, y0); ctx.stroke(); }
      ctx.restore();
      txt(ctx, 'MORTGAGED', 0, y0 + lh * .5, 7, '#fff', 'center', 900, 'rgba(0,0,0,.6)');
    }
    if (own >= 0) {
      const c = PCOL[own];
      ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
      rrect(ctx, x0 + 2.5, y0 + lh - 6.5, lw - 5, 5, 2.5); ctx.fill(); ctx.stroke();
    }
    ctx.strokeStyle = '#1b3a2a'; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, lw, lh);
    ctx.restore();
  }
  function drawCorner(ctx, i, v, now) {
    const g = GEO[i], x = g.x, y = g.y, S = CR;
    ctx.save();
    ctx.fillStyle = '#f3f8ef'; ctx.fillRect(x, y, S, S);
    if (i === 0) {
      ctx.fillStyle = '#d7261e'; ctx.fillRect(x, y, S, 20);
      txt(ctx, 'COLLECT $200', x + S / 2, y + 10, 9, '#fff', 'center', 900);
      ctx.save(); ctx.translate(x + S / 2, y + S / 2 + 10); ctx.rotate(-.5);
      txt(ctx, 'GO', 0, 0, 38, '#c4180f', 'center', 900, '#fff');
      ctx.fillStyle = '#c4180f'; ctx.beginPath(); ctx.moveTo(-34, 20); ctx.lineTo(-18, 10); ctx.lineTo(-18, 16); ctx.lineTo(30, 16); ctx.lineTo(30, 24); ctx.lineTo(-18, 24); ctx.lineTo(-18, 30); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (i === 10) {
      ctx.fillStyle = '#f7941d'; ctx.fillRect(x + 6, y + 6, 58, 58);
      ctx.strokeStyle = '#1b1b22'; ctx.lineWidth = 1.2; ctx.strokeRect(x + 6, y + 6, 58, 58);
      ctx.strokeStyle = '#1b1b22'; ctx.lineWidth = 2.2;
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + 14 + k * 11, y + 6); ctx.lineTo(x + 14 + k * 11, y + 64); ctx.stroke(); }
      txt(ctx, 'IN JAIL', x + 35, y + 56, 8, '#fff', 'center', 900, '#1b1b22');
      txt(ctx, 'JUST', x + 78, y + 8, 7.5, '#1b2a22', 'center', 900);
      txt(ctx, 'VISITING', x + 45, y + 84, 8, '#1b2a22', 'center', 900);
    } else if (i === 20) {
      ctx.fillStyle = '#d7261e'; ctx.fillRect(x, y + S - 20, S, 20);
      txt(ctx, 'FREE PARKING', x + S / 2, y + S - 10, 9, '#fff', 'center', 900);
      ctx.save(); ctx.translate(x + S / 2, y + S / 2 - 6); ctx.scale(1.15, 1.15);
      ctx.fillStyle = '#e53935'; ctx.strokeStyle = '#7a0c0c'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-22, 12); ctx.lineTo(-22, 0); ctx.quadraticCurveTo(-22, -5, -17, -6); ctx.lineTo(-10, -7); ctx.lineTo(-5, -16); ctx.lineTo(10, -16); ctx.lineTo(16, -7); ctx.quadraticCurveTo(22, -5, 22, 2); ctx.lineTo(22, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d6efff'; ctx.beginPath(); ctx.moveTo(-3, -7); ctx.lineTo(-1, -14); ctx.lineTo(9, -14); ctx.lineTo(13, -7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#222'; for (const px of [-12, 12]) { ctx.beginPath(); ctx.arc(px, 12, 5.5, 0, TAU); ctx.fill(); }
      ctx.restore();
      if (v && v.R.fp && v.pot > 0) txt(ctx, '$' + v.pot, x + S / 2, y + 12, 13, '#1f8a43', 'center', 900, '#fff');
    } else if (i === 30) {
      ctx.fillStyle = '#1e5fbf'; ctx.fillRect(x, y, S, 20);
      txt(ctx, 'GO TO JAIL', x + S / 2, y + 10, 10, '#fff', 'center', 900);
      ctx.save(); ctx.translate(x + S / 2, y + S / 2 + 10);
      ctx.fillStyle = '#1e5fbf'; ctx.strokeStyle = '#0c2f66'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(22, -16); ctx.lineTo(20, 8); ctx.quadraticCurveTo(14, 22, 0, 28); ctx.quadraticCurveTo(-14, 22, -20, 8); ctx.lineTo(-22, -16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd43b'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 13, a = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r + 1); } ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#1b3a2a'; ctx.lineWidth = 1; ctx.strokeRect(x, y, S, S);
    ctx.restore();
  }

  function drawCenter(ctx, v, now) {
    const a = CR, b = B - CR, w = b - a;
    ctx.fillStyle = '#cfe8d3'; ctx.fillRect(a, a, w, w);
    const gr = ctx.createRadialGradient(B / 2, B / 2, 20, B / 2, B / 2, w * .72);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(a, a, w, w);
    ctx.save(); ctx.translate(B / 2, B / 2 - 70);
    const bw = 300, bh = 56;
    ctx.fillStyle = '#d7261e'; ctx.strokeStyle = '#7a0c0c'; ctx.lineWidth = 3;
    rrect(ctx, -bw / 2, -bh / 2, bw, bh, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.5; rrect(ctx, -bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10, 5); ctx.stroke();
    txt(ctx, 'MONOPOLY', 0, 2, 40, '#fff', 'center', 900, '#7a0c0c');
    ctx.restore();
    const deck = (x, y, rot, col, label) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      for (let k = 3; k >= 0; k--) { ctx.fillStyle = k ? '#e8e8ee' : col; ctx.strokeStyle = '#2b2b33'; ctx.lineWidth = 1.2; rrect(ctx, -52 + k * -1.2, -32 - k * 1.4, 104, 64, 6); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; rrect(ctx, -46, -26, 92, 52, 4); ctx.stroke();
      txt(ctx, label, 0, 0, 13, '#fff', 'center', 900, 'rgba(0,0,0,.35)');
      ctx.restore();
    };
    deck(a + 112, a + 84, .72, '#f5821f', 'CHANCE');
    deck(b - 112, b - 84, .72, '#3a8fd6', 'COMMUNITY CHEST');
    if (v && v.R.fp) txt(ctx, 'Jackpot $' + v.pot, B / 2, b - 24, 12, '#1f5a37', 'center', 900);
  }

  function tokenPositions(v, D, now) {
    const pos = [];
    const occ = {};
    v.P.forEach((p, i) => {
      if (p.out) return;
      const key = p.pos === 10 && p.jail ? 'j' : p.pos;
      (occ[key] = occ[key] || []).push(i);
    });
    v.P.forEach((p, i) => {
      if (p.out) { pos[i] = null; return; }
      const an = D.anim && D.anim.p === i ? D.anim : null;
      if (an) {
        const t = clamp((now - an.t0) / an.per, 0, an.n);
        const k = Math.min(an.n - 1, Math.floor(t)), f = t - k;
        const sqA = (an.from + an.dir * k + 80) % 40, sqB = (an.from + an.dir * (k + 1) + 80) % 40;
        const A = [an.jump ? slotPos(an.from, 1, 0, false) : slotPos(sqA, 1, 0, false)];
        const Bp = an.jump ? slotPos(an.to, 1, 0, an.toJail) : slotPos(sqB, 1, 0, false);
        const e = an.jump ? easeInOut(clamp(t / an.n, 0, 1)) : easeOut(f);
        const px = lerp(A[0][0], Bp[0], e), py = lerp(A[0][1], Bp[1], e);
        const hop = an.jump ? Math.sin(clamp(t / an.n, 0, 1) * Math.PI) * 60 : Math.sin(f * Math.PI) * 13;
        pos[i] = { x: px, y: py, lift: hop, sx: an.jump ? 1 : 1 + .08 * Math.sin(f * Math.PI), sy: an.jump ? 1 : 1 - .08 * Math.sin(f * Math.PI) };
        return;
      }
      const key = p.pos === 10 && p.jail ? 'j' : p.pos, list = occ[key];
      const idx = list.indexOf(i);
      const s = slotPos(p.pos, list.length, idx, !!p.jail);
      pos[i] = { x: s[0], y: s[1], lift: 0, sx: 1, sy: 1 };
    });
    return pos;
  }

  function drawStatic(ctx, v, D, now) {
    const bg = ctx.createLinearGradient(0, 0, B, B);
    bg.addColorStop(0, '#d6ebd9'); bg.addColorStop(1, '#c4dfc9');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, B, B);
    drawCenter(ctx, v, now);
    for (let i = 0; i < 40; i++) drawSquare(ctx, i, v, now, D);
    ctx.strokeStyle = '#1b3a2a'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, B - 3, B - 3);
  }
  function drawDynamic(ctx, v, D, now) {
    ctx.save();
    if (D.hover >= 0) { const g = GEO[D.hover]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.strokeRect(g.x + 1.5, g.y + 1.5, g.w - 3, g.h - 3); ctx.strokeStyle = '#ffb703'; ctx.lineWidth = 1.6; ctx.strokeRect(g.x + 1.5, g.y + 1.5, g.w - 3, g.h - 3); }
    for (const k in D.flash) {
      const f = D.flash[k];
      if (now - f.t > 900) continue;
      const g = GEO[k], a = 1 - (now - f.t) / 900;
      ctx.fillStyle = rgba(f.c, .55 * a); ctx.fillRect(g.x, g.y, g.w, g.h);
    }
    if (D.hl) for (const i of D.hl) { const g = GEO[i]; ctx.strokeStyle = 'rgba(255,214,10,' + (.55 + .45 * Math.sin(now / 160)) + ')'; ctx.lineWidth = 3.5; ctx.strokeRect(g.x + 2, g.y + 2, g.w - 4, g.h - 4); }
    if (v) {
      const tp = tokenPositions(v, D, now);
      const order = v.P.map((_, i) => i).filter(i => tp[i]).sort((a, b) => tp[a].y - tp[b].y);
      for (const i of order) {
        const t = tp[i], p = v.P[i];
        drawTok(ctx, p.tok, t.x, t.y, 27, PCOL[i], { lift: t.lift, sx: t.sx, sy: t.sy, ring: v.turn === i && v.phase !== 'over' ? '#fff' : null });
      }
      D.tp = tp;
      drawDiceArea(ctx, v, D, now);
    }
    for (const f of D.fx) {
      const t = (now - f.t0) / f.dur;
      if (t < 0 || t > 1) continue;
      ctx.globalAlpha = t < .15 ? t / .15 : t > .7 ? (1 - t) / .3 : 1;
      txt(ctx, f.s, f.x, f.y - 40 * easeOut(t) - 10, f.size || 17, f.c, 'center', 900, 'rgba(0,0,0,.65)');
      ctx.globalAlpha = 1;
    }
    for (const c of D.conf) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); ctx.restore();
    }
    ctx.restore();
  }

  function drawDiceArea(ctx, v, D, now) {
    const d = D.dice;
    if (!d) return;
    const cx = B / 2, cy = B / 2 + 40;
    const size = 58;
    for (let k = 0; k < 2; k++) {
      const val = d.d[k];
      let t = d.t0 ? clamp((now - d.t0) / d.dur, 0, 1) : 1;
      const e = easeOut(t);
      const tx = cx + (k ? 42 : -42), ty = cy + (k ? 6 : -4);
      const sx = lerp(B + 40, tx, e) + (k ? 0 : 0), sy0 = lerp(cy - 150, ty, easeOut(Math.min(1, t * 1.2)));
      const bounce = Math.abs(Math.sin(t * Math.PI * (2.5 + k * .5))) * 48 * Math.pow(1 - t, 1.4);
      const px = t >= 1 ? tx : sx, py = (t >= 1 ? ty : sy0) - bounce;
      const w = d.spin[k];
      const M = mm(DTILT, mm(mm(rotZ(w[2] * (1 - e)), mm(rotY(w[1] * (1 - e)), rotX(w[0] * (1 - e)))), DR0[val]));
      ctx.fillStyle = 'rgba(0,0,0,' + (.22 - bounce / 400) + ')';
      ctx.beginPath(); ctx.ellipse(tx + 4, ty + size * .52, size * .42 * (1 - bounce / 160), size * .13, 0, 0, TAU); ctx.fill();
      drawDie(ctx, px, py, size, M);
    }
  }


  const BOT_NAMES = ['Rosa', 'Theo', 'Kai', 'Mila', 'Otto', 'Jade', 'Leo', 'Nora', 'Ivy', 'Finn', 'Zoe', 'Hugo'];
  const SPEEDS = [['Slow', 1.6], ['Normal', 1], ['Fast', .55], ['Turbo', .18]];
  const fmtWins = v => v + (v === 1 ? ' win' : ' wins');
  const money = n => '$' + n;
  const ord = i => i + (['st', 'nd', 'rd'][i - 1] || 'th');

  function makeSnd(api) {
    let ac = null, nb = null;
    const ctx = () => {
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        return ac;
      } catch (e) { return null; }
    };
    const tone = (f, d, type, vol, f2, delay) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        const now = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
        o.type = type || 'sine'; o.frequency.setValueAtTime(f, now);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
        g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(vol || .06, now + .012); g.gain.exponentialRampToValueAtTime(.0001, now + d);
        o.connect(g).connect(c.destination); o.start(now); o.stop(now + d + .03);
      } catch (e) {}
    };
    const noise = (d, vol, f, q, delay, f2) => {
      if (api.muted) return;
      const c = ctx(); if (!c) return;
      try {
        if (!nb) { nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        const now = c.currentTime + (delay || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
        s.buffer = nb; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f, now); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + d); fl.Q.value = q || 1;
        g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + .008); g.gain.exponentialRampToValueAtTime(.0001, now + d);
        s.connect(fl).connect(g).connect(c.destination); s.start(now, Math.random() * .5); s.stop(now + d + .03);
      } catch (e) {}
    };
    return {
      unlock: ctx,
      tap: () => tone(520, .05, 'sine', .05),
      rattle: () => { for (let i = 0; i < 9; i++) noise(.05, .11, 1700 + Math.random() * 1500, 3, i * .08); noise(.1, .16, 800, 1.5, .78); },
      step: () => tone(300 + Math.random() * 40, .06, 'triangle', .05, 400),
      cash: () => { tone(1320, .09, 'square', .03); tone(1760, .16, 'square', .03, 0, .07); },
      pay: () => { tone(420, .12, 'triangle', .06, 260); },
      buy: () => [523, 659, 784].forEach((f, i) => tone(f, .16, 'sine', .07, 0, i * .07)),
      card: () => { noise(.09, .12, 3200, 1.2); tone(240, .06, 'triangle', .04); },
      jail: () => { tone(180, .25, 'sawtooth', .05, 90); noise(.15, .14, 1200, 2, .04); tone(900, .3, 'square', .02, 700, .1); },
      build: () => { noise(.05, .18, 900, 2); noise(.05, .18, 1100, 2, .12); tone(660, .12, 'sine', .05, 0, .2); },
      gavel: () => { noise(.06, .2, 600, 2); tone(160, .1, 'triangle', .1, 90); },
      good: () => tone(660, .12, 'sine', .07, 990),
      bad: () => tone(200, .2, 'triangle', .08, 110),
      win: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, .3, 'triangle', .07, 0, i * .11)),
      lose: () => tone(330, .5, 'sine', .07, 140),
      go: () => [392, 523, 659, 784].forEach((f, i) => tone(f, .14, 'sine', .06, 0, i * .06)),
      close: () => { try { if (ac) ac.close(); } catch (e) {} }
    };
  }

  const darkG = g => g === 'brown' || g === 'dblue' || g === 'rail' || g === 'util' || g === 'green' || g === 'pink' || g === 'red';
  function deedHTML(sq, v) {
    const q = SQ[sq], own = v ? v.own[sq] : -1, mt = v && v.mt[sq];
    let st = '';
    if (own >= 0) st = `<div class="mn-dst" style="background:${PCOL[own]}">${mt ? 'Mortgaged · ' : ''}Owned by ${esc(v.P[own].nm)}${q.k === 'prop' && v.hs[sq] ? ' · ' + (v.hs[sq] === 5 ? 'Hotel' : v.hs[sq] + (v.hs[sq] === 1 ? ' house' : ' houses')) : ''}</div>`;
    else if (q.price != null) st = `<div class="mn-dst" style="background:#556">Unowned</div>`;
    if (q.k === 'prop') {
      const fg = darkG(q.g) ? '#fff' : '#111';
      return `<div class="mn-deed"><div class="mn-dh" style="background:${GC[q.g]};color:${fg}"><small>TITLE DEED</small><b>${esc(q.n.toUpperCase())}</b></div><div class="mn-dr"><p>RENT <b>$${q.r[0]}</b></p>${[1, 2, 3, 4].map(h => `<p>With ${h} house${h > 1 ? 's' : ''} <b>$${q.r[h]}</b></p>`).join('')}<p class="mn-hot">With HOTEL <b>$${q.r[5]}</b></p><hr><p>Mortgage value <b>$${q.price / 2}</b></p><p>Houses cost <b>$${q.hc}</b> each</p><p>Hotels cost <b>$${q.hc}</b> + 4 houses</p><small>Owning every lot of a colour doubles the rent on bare lots.</small></div><div class="mn-dp">Price $${q.price}</div>${st}</div>`;
    }
    if (q.k === 'rail') return `<div class="mn-deed"><div class="mn-dh" style="background:#2b2b33;color:#fff"><small>RAILROAD</small><b>${esc(q.n.toUpperCase())}</b></div><div class="mn-dr"><p>RENT <b>$25</b></p><p>If 2 railroads are owned <b>$50</b></p><p>If 3 railroads are owned <b>$100</b></p><p>If 4 railroads are owned <b>$200</b></p><hr><p>Mortgage value <b>$100</b></p></div><div class="mn-dp">Price $200</div>${st}</div>`;
    if (q.k === 'util') return `<div class="mn-deed"><div class="mn-dh" style="background:#8c8c96;color:#fff"><small>UTILITY</small><b>${esc(q.n.toUpperCase())}</b></div><div class="mn-dr"><p>One utility owned: rent is <b>4 x</b> the dice.</p><p>Both utilities owned: rent is <b>10 x</b> the dice.</p><hr><p>Mortgage value <b>$75</b></p></div><div class="mn-dp">Price $150</div>${st}</div>`;
    return `<div class="mn-deed"><div class="mn-dh" style="background:#cfd6cf;color:#111"><b>${esc(q.n.toUpperCase())}</b></div><div class="mn-dr"><p>${q.k === 'tax' ? 'Pay $' + q.tax + ' to the bank.' : q.k === 'go' ? 'Collect $200 each time you pass.' : q.k === 'jail' ? 'Just visiting, or serving time.' : q.k === 'gtj' ? 'Go directly to Jail.' : q.k === 'fp' ? 'A rest stop. With the jackpot rule, collect the pot.' : 'Draw a card.'}</p></div></div>`;
  }
  const chip = (sq, v, extra) => `<span class="mn-chip${v && v.mt[sq] ? ' mt' : ''}" style="--c:${GC[SQ[sq].g]}">${esc(SQ[sq].n)}${extra || ''}</span>`;
  const sideHTML = (x, v) => {
    const bits = [];
    if (x.c) bits.push(`<span class="mn-chip cash">${money(x.c)}</span>`);
    x.p.forEach(i => bits.push(chip(i, v)));
    if (x.j[0]) bits.push(`<span class="mn-chip card">Jail card (Chance) x${x.j[0]}</span>`);
    if (x.j[1]) bits.push(`<span class="mn-chip card">Jail card (Chest) x${x.j[1]}</span>`);
    return bits.length ? bits.join('') : '<span class="mn-none">nothing</span>';
  };

  const mnCss = id => `
.gm-${id}{gap:0}
.gm-${id} [hidden]{display:none!important}
.gm-${id} .mn-wrap{position:relative;max-width:100%;margin:0 auto;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 28% 18%,#21604a,#0e2c21 72%);box-shadow:0 10px 30px rgba(0,0,0,.38);user-select:none;-webkit-user-select:none;font-family:var(--sans);color:#f4f1e6;touch-action:manipulation}
.gm-${id} .mn-stage{position:absolute;left:0;top:0;transform-origin:0 0}
.gm-${id} .mn-cv{position:absolute;display:block;border-radius:4px;box-shadow:0 8px 26px rgba(0,0,0,.55);touch-action:manipulation}
.gm-${id} .mn-side{position:absolute;display:flex;flex-direction:column;gap:8px;min-height:0}
.gm-${id} .mn-bar{display:flex;align-items:center;gap:8px;min-height:38px}
.gm-${id} .mn-status{flex:1;min-width:0;font:900 15px/1.2 var(--sans);color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35)}
.gm-${id} .mn-status small{display:block;font:700 11px var(--sans);opacity:.75;text-shadow:none}
.gm-${id} .mn-ico{flex:0 0 auto;width:38px;height:38px;border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.3);color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;font:900 14px var(--sans)}
.gm-${id} .mn-ico:active{transform:scale(.94)}
.gm-${id} .mn-pls{display:flex;flex-direction:column;gap:5px}
.gm-${id} .mn-port .mn-pls{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.gm-${id} .mn-pl{position:relative;display:grid;grid-template-columns:34px 1fr auto;grid-template-areas:"i n c" "p p p";align-items:center;column-gap:8px;padding:5px 9px 5px 8px;border-radius:10px;background:#f6f1e1;color:#1d2b24;border-left:7px solid var(--pc);cursor:pointer;min-width:0;box-shadow:0 2px 6px rgba(0,0,0,.28)}
.gm-${id} .mn-pl.on{box-shadow:0 0 0 3px #ffd43b,0 4px 14px rgba(255,212,59,.5);transform:translateX(-2px)}
.gm-${id} .mn-port .mn-pl.on{transform:none}
.gm-${id} .mn-pl.out{opacity:.45;filter:grayscale(1)}
.gm-${id} .mn-pl img{grid-area:i;width:34px;height:34px}
.gm-${id} .mn-pn{grid-area:n;min-width:0;font:900 14px/1.15 var(--sans);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-${id} .mn-pn small{display:flex;gap:4px;margin-top:1px;font:800 9.5px var(--sans);color:#556;flex-wrap:wrap}
.gm-${id} .mn-tag{padding:0 5px;border-radius:5px;background:#e3dcc4;color:#4b4630;line-height:14px}
.gm-${id} .mn-tag.hot{background:#d62828;color:#fff}
.gm-${id} .mn-pc{grid-area:c;font:900 16px var(--sans);color:#1b6a3a;font-variant-numeric:tabular-nums}
.gm-${id} .mn-pp{grid-area:p;display:flex;gap:2px;flex-wrap:wrap;margin-top:3px;min-height:0}
.gm-${id} .mn-pp i{display:block;width:9px;height:12px;border-radius:2px;background:var(--c);border:1px solid rgba(0,0,0,.45);position:relative}
.gm-${id} .mn-pp i.mt{opacity:.3}
.gm-${id} .mn-pp i.mt::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 2px,#000 2px 3px)}
.gm-${id} .mn-pp i b{position:absolute;left:0;right:0;bottom:-1px;text-align:center;font:900 7px/7px var(--sans);color:#fff;text-shadow:0 0 2px #000}
.gm-${id} .mn-act{display:flex;flex-direction:column;gap:6px;min-height:94px;justify-content:flex-start}
.gm-${id} .mn-row{display:flex;gap:6px;flex-wrap:wrap}
.gm-${id} .mn-row>*{flex:1}
.gm-${id} .mn-b{min-height:42px;padding:0 12px;border:0;border-radius:12px;color:#fff;font:900 15px/1.1 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.25);box-shadow:inset 0 -4px 0 rgba(0,0,0,.24),0 4px 10px rgba(0,0,0,.3);cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:var(--sans)}
.gm-${id} .mn-b:active{transform:translateY(2px)}
.gm-${id} .mn-b:disabled,.gm-${id} .mn-b.dis{opacity:.4;pointer-events:none}
.gm-${id} .mn-b.big{min-height:54px;font-size:19px}
.gm-${id} .mn-b small{display:block;font:800 11px var(--sans);opacity:.9;text-shadow:none;margin-top:2px}
.gm-${id} .mn-b.red{background:linear-gradient(#ff5d4d,#cf2117)}
.gm-${id} .mn-b.green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-${id} .mn-b.blue{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-${id} .mn-b.gold{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
.gm-${id} .mn-b.gray{background:linear-gradient(#6b7a74,#46544e)}
.gm-${id} .mn-b.sm{min-height:34px;padding:0 10px;font-size:13px;border-radius:10px}
.gm-${id} .mn-hint{font:700 12px/1.35 var(--sans);color:rgba(255,255,255,.78)}
.gm-${id} .mn-log{flex:1;min-height:60px;overflow-y:auto;background:rgba(0,0,0,.28);border-radius:10px;padding:6px 8px;font:700 12px/1.35 var(--sans);color:rgba(255,255,255,.9);scrollbar-width:thin;touch-action:pan-y}
.gm-${id} .mn-log p{margin:0 0 3px;padding-left:12px;position:relative}
.gm-${id} .mn-log p::before{content:"";position:absolute;left:0;top:5px;width:7px;height:7px;border-radius:50%;background:var(--c,#8a9)}
.gm-${id} .mn-sheet{position:absolute;z-index:5;width:310px;padding:12px;border-radius:16px;background:#f6f1e1;color:#1d2b24;box-shadow:0 14px 40px rgba(0,0,0,.6);border:3px solid #1b3a2a;text-align:center;animation:mn-in .2s ease-out}
@keyframes mn-in{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.gm-${id} .mn-sheet h3{margin:0 0 6px;font:900 18px var(--sans)}
.gm-${id} .mn-sheet p{margin:4px 0;font:700 13px/1.35 var(--sans)}
.gm-${id} .mn-sheet .mn-row{margin-top:8px}
.gm-${id} .mn-pane{position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(5,16,12,.66);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-${id} .mn-pane.clear{background:rgba(5,16,12,.3)}
.gm-${id} .mn-box{width:100%;max-width:430px;margin:auto;background:#f6f1e1;color:#1d2b24;border:3px solid #1b3a2a;border-radius:18px;padding:14px 16px;text-align:center;box-shadow:0 18px 44px rgba(0,0,0,.6);animation:mn-in .2s ease-out}
.gm-${id} .mn-box.wide{max-width:640px}
.gm-${id} .mn-box h3{margin:2px 0 8px;font:900 22px var(--sans)}
.gm-${id} .mn-box p{margin:6px 0;font:700 13.5px/1.4 var(--sans)}
.gm-${id} .mn-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#b3261e}
.gm-${id} .mn-logo{font:900 46px/1 var(--sans);letter-spacing:1px;color:#fff;background:#d7261e;display:inline-block;padding:8px 16px;border-radius:8px;border:3px solid #7a0c0c;box-shadow:0 0 0 3px #fff inset;margin:2px 0 8px;text-shadow:2px 2px 0 #7a0c0c}
.gm-${id} .mn-opt{display:flex;align-items:center;gap:10px;margin:7px 0;text-align:left}
.gm-${id} .mn-opt>span{flex:0 0 36%;font:800 13px/1.2 var(--sans)}
.gm-${id} .mn-opt>span small{display:block;font:700 11px/1.25 var(--sans);opacity:.6;margin-top:2px}
.gm-${id} .mn-seg{flex:1;display:flex;gap:5px}
.gm-${id} .mn-seg button{flex:1;min-height:38px;border-radius:10px;border:2px solid #c9bf9f;background:#ebe4cc;color:#1d2b24;font:900 13px var(--sans);padding:0 3px;cursor:pointer}
.gm-${id} .mn-seg button.on{background:#1f8a3a;border-color:#145c27;color:#fff}
.gm-${id} .mn-sec{margin:12px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:#b3261e}
.gm-${id} .mn-toks{display:flex;gap:5px;justify-content:center;margin:6px 0}
.gm-${id} .mn-toks button{width:50px;height:50px;border-radius:12px;border:3px solid #c9bf9f;background:#ebe4cc;padding:2px;cursor:pointer}
.gm-${id} .mn-toks button.on{border-color:#1f8a3a;background:#d5f0da;box-shadow:0 0 0 2px #1f8a3a}
.gm-${id} .mn-toks img{width:100%;height:100%;display:block}
.gm-${id} .mn-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
.gm-${id} .mn-tbl td{padding:6px 4px;border-bottom:1px solid rgba(0,0,0,.12);text-align:right}
.gm-${id} .mn-tbl td:first-child{text-align:left}
.gm-${id} .mn-tbl tr.win td{color:#1b6a3a}
.gm-${id} .mn-tbl img{width:22px;height:22px;vertical-align:middle;margin-right:6px}
.gm-${id} .mn-deed{width:196px;margin:0 auto;background:#fffdf5;color:#111;border:2px solid #111;text-align:center;font-family:var(--sans)}
.gm-${id} .mn-dh{padding:6px 4px;border-bottom:2px solid #111}
.gm-${id} .mn-dh small{display:block;font:800 8px var(--sans);letter-spacing:1px;opacity:.85}
.gm-${id} .mn-dh b{font:900 14px/1.1 var(--sans)}
.gm-${id} .mn-dr{padding:5px 8px}
.gm-${id} .mn-dr p{margin:2px 0!important;font:700 10.5px/1.25 var(--sans)!important;display:flex;justify-content:space-between;gap:6px}
.gm-${id} .mn-dr p.mn-hot{font-weight:900!important}
.gm-${id} .mn-dr hr{border:0;border-top:1px solid #aaa;margin:4px 0}
.gm-${id} .mn-dr small{display:block;font:700 8.5px/1.25 var(--sans);margin-top:3px;color:#444}
.gm-${id} .mn-dp{border-top:2px solid #111;padding:3px;font:900 12px var(--sans)}
.gm-${id} .mn-dst{padding:3px 4px;font:900 11px var(--sans);color:#fff}
.gm-${id} .mn-card{width:250px;margin:0 auto 4px;min-height:150px;padding:16px 14px;border-radius:14px;border:4px solid #1b1b22;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-family:var(--sans);animation:mn-flip .5s ease-out}
@keyframes mn-flip{0%{transform:rotateY(90deg) scale(.8)}100%{transform:none}}
.gm-${id} .mn-card b{font:900 13px var(--sans);letter-spacing:1.5px;text-transform:uppercase}
.gm-${id} .mn-card span{font:800 15px/1.35 var(--sans);color:#111}
.gm-${id} .mn-grp{margin:8px 0;text-align:left;border:2px solid #cfc6a6;border-radius:12px;overflow:hidden;background:#fffdf5}
.gm-${id} .mn-gh{display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--c);color:var(--fg);font:900 12px var(--sans)}
.gm-${id} .mn-gh small{margin-left:auto;font:800 10.5px var(--sans);opacity:.9}
.gm-${id} .mn-pr{display:flex;align-items:center;gap:6px;padding:6px 10px;border-top:1px solid #e1d9bc;font:800 13px var(--sans);flex-wrap:wrap}
.gm-${id} .mn-pr>b{flex:1;min-width:120px;font-weight:900}
.gm-${id} .mn-pr .lv{font:800 11px var(--sans);color:#555}
.gm-${id} .mn-pr .mn-b{min-height:32px;font-size:12px;border-radius:9px;padding:0 9px}
.gm-${id} .mn-chips{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;justify-content:flex-start}
.gm-${id} .mn-chip{display:inline-block;padding:3px 8px;border-radius:8px;background:#fffdf5;border:2px solid var(--c,#999);border-left-width:9px;font:800 11.5px var(--sans);color:#1d2b24;cursor:default;text-align:left}
.gm-${id} .mn-chip.mt{opacity:.55;text-decoration:line-through}
.gm-${id} .mn-chip.cash{--c:#1b6a3a;background:#dff3e4}
.gm-${id} .mn-chip.card{--c:#c9a100;background:#fff3c4}
.gm-${id} button.mn-chip{cursor:pointer}
.gm-${id} button.mn-chip.on{background:#d5f0da;box-shadow:0 0 0 2px #1f8a3a}
.gm-${id} .mn-none{font:700 12px var(--sans);opacity:.5;padding:3px}
.gm-${id} .mn-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left}
.gm-${id} .mn-port .mn-cols{grid-template-columns:1fr}
.gm-${id} .mn-cols h4{margin:0 0 4px;font:900 12px var(--sans);letter-spacing:1px;text-transform:uppercase;color:#b3261e}
.gm-${id} .mn-step{display:flex;align-items:center;gap:4px;margin:4px 0}
.gm-${id} .mn-step b{flex:1;text-align:center;font:900 16px var(--sans);color:#1b6a3a}
.gm-${id} .mn-step button{min-width:38px;min-height:32px;border-radius:8px;border:2px solid #c9bf9f;background:#ebe4cc;font:900 12px var(--sans);cursor:pointer}
.gm-${id} .mn-who{display:flex;gap:6px;justify-content:center;margin:6px 0;flex-wrap:wrap}
.gm-${id} .mn-who button{display:flex;align-items:center;gap:5px;padding:3px 10px 3px 4px;border-radius:999px;border:2px solid #c9bf9f;background:#ebe4cc;font:900 13px var(--sans);cursor:pointer}
.gm-${id} .mn-who button.on{background:#d5f0da;border-color:#1f8a3a}
.gm-${id} .mn-who img{width:26px;height:26px}
.gm-${id} .mn-err{color:#b3261e;font:800 12px var(--sans);min-height:16px}
.gm-${id} .mn-bid{font:900 30px var(--sans);color:#1b6a3a;margin:2px 0}
.gm-${id} .mn-net{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.45);font:800 11px var(--sans);color:#fff}
.gm-${id} .mn-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-${id} .mn-net.bad i{background:#ff5b4b}
.gm-${id} .mn-rules{text-align:left}
.gm-${id} .mn-rules p{font:700 13px/1.45 var(--sans)!important;margin:5px 0!important}
.gm-${id} .mn-dots::after{content:"";animation:mn-dots 1.2s steps(4) infinite}
@keyframes mn-dots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}
.gm-${id} .mn-time{height:5px;border-radius:3px;background:rgba(255,255,255,.2);overflow:hidden;margin-top:3px}
.gm-${id} .mn-time i{display:block;height:100%;background:#ffd43b;width:100%}

.gm-${id} .mn-port .mn-bar{order:1}
.gm-${id} .mn-port .mn-act{order:2;min-height:96px}
.gm-${id} .mn-port .mn-pls{order:3}
.gm-${id} .mn-port .mn-log{order:4}
.gm-${id} .mn-port .mn-pl{grid-template-columns:30px 1fr auto;padding:4px 7px 4px 6px}
.gm-${id} .mn-port .mn-pl img{width:30px;height:30px}
.gm-${id} .mn-deed.mini{width:250px;margin:0 auto 6px}
.gm-${id} .mn-deed.mini .mn-dr{padding:5px 8px}
.gm-${id} .mn-deed.mini .mn-dr p{justify-content:center;font:700 11.5px/1.3 var(--sans)!important}
.gm-${id} .mn-b.w{flex:1}
.gm-${id} .mn-sheet .mn-b{min-height:46px;font-size:17px}
.gm-${id} .mn-box>.mn-b{display:block;width:100%;margin:7px 0}
.gm-${id} .mn-port .mn-logo{font-size:32px;padding:6px 12px}
.gm-${id} .mn-step .mn-bid{flex:1;text-align:center}
.gm-${id} .mn-step.tight button{min-width:34px;padding:0 4px}
.gm-${id} .mn-alert{margin:0 0 8px;padding:8px 10px;border-radius:10px;background:#fde3df;border:2px solid #d62828;color:#7a0c0c;font:800 13px/1.35 var(--sans);text-align:left}
.gm-${id} .mn-pr .mn-b[disabled]{opacity:.35}
.gm-${id} .mn-wrap .mn-sheet .mn-card{width:230px;min-height:120px}
`;


  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ICON_MENU = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
  const ICON_HOME = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-6h4v6"/></svg>';
  const SPD_LBL = ['.6x', '1x', '2x', '5x'];
  const LL = { W: 1000, H: 640, bs: 620, bx: 10, by: 10, sx: 640, sy: 10, sw: 350, sh: 620, port: false, sheetW: 310 };
  const LP = { W: 430, H: 900, bs: 430, bx: 0, by: 0, sx: 8, sy: 438, sw: 414, sh: 454, port: true, sheetW: 268 };

  const sideClean = x => {
    if (!x || typeof x !== 'object') return cleanSide(null);
    return cleanSide({ c: x.c, p: Array.isArray(x.p) ? x.p.slice(0, 40) : [], j: Array.isArray(x.j) ? x.j.slice(0, 2) : [0, 0] });
  };
  function cleanAct(a) {
    if (!a || typeof a !== 'object' || typeof a.a !== 'string') return null;
    const o = { a: a.a }, okSq = v => Number.isInteger(v) && v >= 0 && v < 40;
    switch (a.a) {
      case 'roll': case 'buy': case 'decline': case 'pass': case 'end': case 'bankrupt': case 'tr-ok': case 'tr-no': case 'tr-cancel': return o;
      case 'jail': if (a.m !== 'pay' && a.m !== 'card') return null; o.m = a.m; return o;
      case 'bid': if (!Number.isFinite(+a.amt)) return null; o.amt = Math.floor(+a.amt); return o;
      case 'build': case 'sell': case 'mort': case 'unmort': if (!okSq(a.sq)) return null; o.sq = a.sq; return o;
      case 'trade': if (!Number.isInteger(a.to)) return null; o.to = a.to; o.give = sideClean(a.give); o.get = sideClean(a.get); return o;
    }
    return null;
  }

  const HELP = `<p><b>Goal:</b> be the last player left with money. Buy properties, collect rent, build houses and hotels and bankrupt everyone else.</p>
<p><b>Your turn:</b> roll two dice and move. Doubles give another roll, but three doubles in a row send you to Jail. Passing GO pays $200.</p>
<p><b>Landing:</b> on an unowned property you may buy it at the printed price. If you decline, it goes to auction and everybody can bid, starting from $1. On an owned property you pay rent. Taxes go to the bank. Chance and Community Chest cards do what they say.</p>
<p><b>Rent:</b> owning every lot of a colour doubles the rent on its bare lots. Railroads pay $25, $50, $100 or $200 by how many you own. Utilities pay 4 or 10 times the dice.</p>
<p><b>Building:</b> with a full colour set (and none of it mortgaged) you can build houses, one at a time, evenly across the set. Four houses then a hotel. The bank has 32 houses and 12 hotels, and when they run out nobody can build more.</p>
<p><b>Mortgage:</b> turn a property into cash at half its price. Mortgaged properties collect no rent. Lifting a mortgage costs the loan plus 10%. Buildings must be sold back to the bank for half their cost first.</p>
<p><b>Jail:</b> pay $50, use a Get Out of Jail Free card or roll doubles. After three failed rolls you pay $50 and move. You still collect rent while in Jail.</p>
<p><b>Trading:</b> offer properties, cash and Jail cards to any player on your turn. Properties with buildings cannot be traded. A mortgaged property costs the new owner a 10% fee.</p>
<p><b>Debts:</b> if you cannot pay, raise cash by selling buildings and mortgaging. If you still cannot, you are bankrupt: everything goes to the player you owed, or to the bank, which auctions your properties.</p>
<p><b>Controls:</b> click or tap buttons. Click a square to read its deed. <kbd>Space</kbd> does the main action (roll, buy, end turn, bid), <kbd>M</kbd> properties, <kbd>T</kbd> trade, <kbd>A</kbd> auction instead of buying, <kbd>Esc</kbd> pauses.</p>`;

  function makeApp(root, api) {
    const opt = Object.assign({ n: 4, lv: 1, tok: 0, sp: 1, fp: false, go2: false, cash: 1500, auc: true, rounds: 0, wins: 0, sv: null }, api.load() || {});
    opt.n = clamp(Math.round(opt.n) || 4, 2, 6); opt.lv = clamp(opt.lv | 0, 0, 2); opt.tok = clamp(opt.tok | 0, 0, 5); opt.sp = clamp(opt.sp | 0, 0, SPEEDS.length - 1);
    const saveOpt = () => api.save(opt);
    const snd = makeSnd(api);
    const SP = () => M.ff ? .12 : SPEEDS[opt.sp][1];

    const wrap = el('div', 'mn-wrap'), stage = el('div', 'mn-stage'), cv = el('canvas', 'mn-cv');
    const side = el('div', 'mn-side', `<div class="mn-bar"><button class="mn-ico" data-u="menu" aria-label="Menu">${ICON_MENU}</button><div class="mn-status"></div><button class="mn-ico" data-u="spd" aria-label="Animation speed"></button><button class="mn-ico" data-u="props" aria-label="My properties">${ICON_HOME}</button></div><div class="mn-pls"></div><div class="mn-act"></div><div class="mn-log"></div>`);
    const sheet = el('div', 'mn-sheet'), pane = el('div', 'mn-pane'), netEl = el('div', 'mn-net', '<i></i><span>Online</span>');
    sheet.hidden = pane.hidden = netEl.hidden = true;
    stage.append(cv, side, sheet); wrap.append(stage, pane, netEl); root.append(wrap);
    const elStatus = side.querySelector('.mn-status'), elPls = side.querySelector('.mn-pls'), elAct = side.querySelector('.mn-act'), elLog = side.querySelector('.mn-log');
    const bMenu = side.querySelector('[data-u=menu]'), bSpd = side.querySelector('[data-u=spd]'), bProps = side.querySelector('[data-u=props]');
    const ctx = cv.getContext('2d'), sc = document.createElement('canvas'), sctx = sc.getContext('2d');

    const M = { mode: 'solo', role: 'local', eng: null, pids: [], human: [], players: [], bots: false, size: 0, hooked: false, awaiting: false, ended: false, tok: 0 };
    const D = { v: null, anim: null, dice: null, fx: [], conf: [], pop: {}, flash: {}, hover: -1, hl: null, small: false, tp: null };
    const Q = [], sched = [], shown = [];
    let L = LL, PORT = null, K = 1, DPR = 1, scene = 'title', viewer = 0, clk = 0, busyUntil = 0, paused = false;
    let Vd = null, stDirty = true, uiDirty = true, lastIdle = false, idleDone = true, lastLog = '', pcEls = [];
    let paneK = '', paneH = null, paneBG = null, sheetHTML = '', cardUntil = 0, debtShown = -1, debtPane = false;
    let AU = { sq: -1, bid: -1, amt: 0 }, T = null, PP = -1, botTid = -1, saveTid = -1, awaitTimer = 0;
    const after = (ms, fn) => { sched.push({ at: clk + ms, fn, tok: M.tok }); };
    const isIdle = () => !paused && !Q.length && clk >= busyUntil;
    const nameOf = p => (Vd && Vd.P[p] ? esc(Vd.P[p].nm) : 'Player');

    function showPane(kind, html, handler, cls, bg) {
      pane.className = 'mn-pane' + (cls ? ' ' + cls : '');
      pane.innerHTML = html; pane.hidden = false; paneK = kind; paneH = handler; paneBG = bg || null;
    }
    function hidePane() { pane.hidden = true; pane.innerHTML = ''; paneK = ''; paneH = null; paneBG = null; debtPane = false; }
    const seg = (k, vals, cur) => `<div class="mn-seg" data-k="${k}">${vals.map(([v, l]) => `<button data-v='${JSON.stringify(v)}' class="${v === cur ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    const optRow = (k, label, hint, vals, cur) => `<div class="mn-opt"><span>${label}${hint ? `<small>${hint}</small>` : ''}</span>${seg(k, vals, cur)}</div>`;
    const btn = (a, cls, label, sm, extra) => `<button class="mn-b ${cls}" data-a="${a}"${extra || ''}>${label}${sm ? `<small>${sm}</small>` : ''}</button>`;

    function fit() {
      const port = (root.clientWidth || 900) < 720;
      if (port !== PORT) {
        PORT = port; L = port ? LP : LL; D.small = port;
        wrap.classList.toggle('mn-port', port);
        wrap.style.aspectRatio = `${L.W} / ${L.H}`;
        wrap.style.width = port ? 'min(100%, 560px)' : `min(100%, ${L.W}px, calc((100dvh - var(--goff, 250px)) * ${(L.W / L.H).toFixed(4)}))`;
        stage.style.width = L.W + 'px'; stage.style.height = L.H + 'px';
        cv.style.left = L.bx + 'px'; cv.style.top = L.by + 'px'; cv.style.width = cv.style.height = L.bs + 'px';
        side.style.left = L.sx + 'px'; side.style.top = L.sy + 'px'; side.style.width = L.sw + 'px'; side.style.height = L.sh + 'px';
        sheet.style.width = L.sheetW + 'px'; sheet.style.left = (L.bx + (L.bs - L.sheetW) / 2) + 'px'; sheet.style.top = (L.by + L.bs / 2) + 'px';
      }
      rescale();
    }
    function rescale() {
      const w = wrap.clientWidth;
      if (!w) return;
      K = w / L.W; stage.style.transform = `scale(${K})`;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.max(64, Math.round(L.bs * K * DPR));
      if (cv.width !== px) { cv.width = cv.height = sc.width = sc.height = px; }
      stDirty = true;
      centerSheet();
    }
    function centerSheet() { if (!sheet.hidden) sheet.style.marginTop = (-sheet.offsetHeight / 2) + 'px'; }
    api.on(window, 'resize', fit);
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => fit()); ro.observe(root); ro.observe(wrap); }

    const YV = /(is|has|goes|passes|gives|gets|receives|pays|collects|owes|draws|rolls|buys|bids|declines|uses|mortgages|unmortgages|sells|builds|offers|accepts|withdraws|wins|loses|lands|takes|declares|counters)/.source;
    const youV = v => ({ is: 'are', has: 'have', goes: 'go', passes: 'pass' }[v] || v.replace(/s$/, ''));
    const RY = new RegExp(/\bYou /.source + YV + /\b/.source, 'g'), RA = new RegExp(/ and /.source + YV + /\b/.source, 'g');
    const fixYou = t => { t = t.replace(RY, (m, v) => 'You ' + youV(v)); return /^You /.test(t) ? t.replace(RA, (m, v) => ' and ' + youV(v)) : t; };
    function addLog(text, p) {
      text = fixYou(text);
      lastLog = text;
      const d = el('p', null, esc(text));
      d.style.setProperty('--c', p >= 0 ? PCOL[p] : '#9aa8a0');
      const near = elLog.scrollHeight - elLog.scrollTop - elLog.clientHeight < 40;
      elLog.append(d);
      while (elLog.childNodes.length > 80) elLog.firstChild.remove();
      if (near || elLog.childNodes.length < 3) elLog.scrollTop = elLog.scrollHeight;
    }

    function renderPlayers(V) {
      elPls.innerHTML = V.P.map((p, i) => {
        const props = [];
        for (let s = 0; s < 40; s++) if (V.own[s] === i) props.push(`<i class="${V.mt[s] ? 'mt' : ''}" style="--c:${GC[SQ[s].g]}" data-sq="${s}">${V.hs[s] ? `<b>${V.hs[s] === 5 ? 'H' : V.hs[s]}</b>` : ''}</i>`);
        const tags = [];
        if (i === viewer) tags.push('<span class="mn-tag">You</span>'); else if (p.bot) tags.push('<span class="mn-tag">Bot</span>');
        if (p.out) tags.push('<span class="mn-tag hot">Bankrupt</span>'); else if (p.jail) tags.push('<span class="mn-tag hot">Jail</span>');
        const gj = p.gj[0] + p.gj[1];
        if (gj) tags.push(`<span class="mn-tag">Card x${gj}</span>`);
        return `<div class="mn-pl${V.turn === i && V.phase !== 'over' ? ' on' : ''}${p.out ? ' out' : ''}" data-p="${i}" style="--pc:${PCOL[i]}"><img alt="" src="${tokIcon(p.tok, PCOL[i], 34)}"><div class="mn-pn">${esc(p.nm)}<small>${tags.join('')}</small></div><div class="mn-pc"></div><div class="mn-pp">${props.join('')}</div></div>`;
      }).join('');
      pcEls = [...elPls.querySelectorAll('.mn-pc')];
      pcEls.forEach((e, i) => { if (shown[i] == null) shown[i] = V.P[i].cash; e.textContent = money(Math.round(shown[i])); e._t = shown[i]; });
    }
    function setView(v) {
      Vd = v; D.v = v; stDirty = true; uiDirty = true;
      if (v) renderPlayers(v);
    }
    function resetView(v, lg) {
      Q.length = 0; sched.length = 0; busyUntil = clk; M.tok++;
      D.anim = null; D.fx.length = 0; D.conf.length = 0; D.pop = {}; D.flash = {}; D.hl = null; D.tp = null;
      D.dice = v && v.d && v.d[0] ? { d: v.d.slice(), t0: 0, dur: 1, spin: [[0, 0, 0], [0, 0, 0]] } : null;
      shown.length = 0; cardUntil = 0; sheetHTML = ''; sheet.hidden = true; elLog.innerHTML = ''; lastLog = '';
      AU = { sq: -1, bid: -1, amt: 0 }; botTid = -1; debtShown = -1; M.awaiting = false;
      (lg || []).forEach(l => addLog(l[1], l[0]));
      setView(v);
    }

    function fxAt(p, s, c, size, delay) {
      const t = D.tp && p >= 0 && D.tp[p], x = t ? t.x : B / 2, y = t ? t.y : B / 2;
      let n = 0;
      for (const f of D.fx) if (clk - f.t0 < 700 && Math.abs(f.x - x) < 34 && Math.abs(f.by - y) < 30) n++;
      D.fx.push({ s, x, y: y - n * 17, by: y, t0: clk + (delay || 0), dur: 1100, c, size: size || 17 });
    }
    function burst(n) {
      const cols = ['#e53935', '#1e88e5', '#2e9e4f', '#fbc02d', '#8e44ad', '#ef6c00', '#ffffff'];
      for (let i = 0; i < n; i++) D.conf.push({ x: Math.random() * B, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * 80, vy: 80 + Math.random() * 160, r: Math.random() * TAU, vr: (Math.random() - .5) * 9, s: 6 + Math.random() * 7, c: cols[i % cols.length] });
    }
    const rs = () => [(Math.random() - .5) * 15, (Math.random() - .5) * 15, (Math.random() - .5) * 15];

    function showCard(e) {
      const c = DECKS[e.deck][e.id], col = e.deck ? '#3a8fd6' : '#f5821f';
      const ms = (1450 + c.t.length * 22) * SP();
      cardUntil = clk + ms; sheetHTML = '';
      sheet.className = 'mn-sheet'; sheet.dataset.k = 'card';
      sheet.innerHTML = `<div class="mn-card" style="background:${e.deck ? '#e4f2fc' : '#fff1de'};border-color:${col}"><b style="color:${col}">${e.deck ? 'Community Chest' : 'Chance'}</b><span>${esc(c.t)}</span></div><p>${nameOf(e.p) === 'You' ? 'You draw' : nameOf(e.p) + ' draws'} a card</p>`;
      sheet.hidden = false; centerSheet();
      after(ms, () => { if (cardUntil && clk >= cardUntil - 1) { cardUntil = 0; uiDirty = true; } });
      return ms;
    }

    function onEvent(e) {
      const sp = SP();
      if (e.v) setView(e.v);
      if (e.lg) addLog(e.lg, e.lp);
      const mine = e.p === viewer;
      switch (e.t) {
        case 'roll': {
          const dur = 800 * sp + 180;
          D.dice = { d: e.d.slice(), t0: clk, dur, spin: [rs(), rs()] };
          snd.rattle();
          return dur + 140 * sp;
        }
        case 'step': {
          const per = Math.max(34, 165 * sp), n = e.n;
          D.anim = { p: e.p, from: e.from, to: e.to, dir: e.dir, n, t0: clk, per, jump: false };
          for (let k = 1; k <= n; k++) after(per * k, () => snd.step());
          if (e.pg > 0) {
            fxAt(e.p, '+$' + e.amt, '#7dff9b', 20, per * e.pg);
            after(per * e.pg, () => snd.go());
          }
          after(per * n, () => { if (D.anim && D.anim.p === e.p && D.anim.t0 + per * n <= clk + 1) D.anim = null; });
          return per * n + 100 * sp;
        }
        case 'jail': {
          const dur = 700 * sp + 80;
          D.anim = { p: e.p, from: e.from, to: 10, dir: 1, n: 1, t0: clk, per: dur, jump: true, toJail: true };
          snd.jail(); after(dur, () => { if (D.anim && D.anim.p === e.p) D.anim = null; });
          fxAt(e.p, 'JAIL', '#ffb703', 20, dur);
          return dur + 160 * sp;
        }
        case 'free': snd.good(); fxAt(e.p, 'FREE', '#7dff9b', 18); return 260 * sp;
        case 'cash': {
          const a = '$' + e.amt;
          if (e.to >= 0 && e.from >= 0) { fxAt(e.from, '-' + a, '#ff7a6b'); fxAt(e.to, '+' + a, '#7dff9b'); snd.cash(); }
          else if (e.from >= 0) { fxAt(e.from, '-' + a, '#ff7a6b'); snd.pay(); }
          else if (e.to >= 0) { fxAt(e.to, '+' + a, '#7dff9b'); snd.cash(); }
          return 480 * sp;
        }
        case 'card': snd.card(); return showCard(e);
        case 'buy':
          D.flash[e.sq] = { t: clk, c: PCOL[e.p] };
          fxAt(e.p, '-$' + e.price, '#ff7a6b'); e.auc ? snd.gavel() : snd.buy();
          return 420 * sp;
        case 'aucs': snd.gavel(); return 260 * sp;
        case 'bid': fxAt(e.p, '$' + e.amt, '#ffd43b'); snd.tap(); return 210 * sp;
        case 'aucx': return 240 * sp;
        case 'build': D.pop[e.sq] = clk; snd.build(); return 190 * sp;
        case 'sell': D.pop[e.sq] = clk; snd.pay(); return 160 * sp;
        case 'mort': D.flash[e.sq] = { t: clk, c: '#888888' }; snd.pay(); return 180 * sp;
        case 'unmort': D.flash[e.sq] = { t: clk, c: PCOL[e.p] }; snd.good(); return 180 * sp;
        case 'debt': snd.bad(); return 380 * sp;
        case 'turn':
          if (e.first) return 0;
          if (mine) snd.good();
          return 260 * sp;
        case 'out': snd.lose(); fxAt(e.p, 'BANKRUPT', '#ff5b4b', 22); return 1300 * sp;
        case 'win': burst(90); snd.win(); return 1500 * sp;
        case 'trade': snd.card(); return 220 * sp;
        case 'deal': snd.good(); return 420 * sp;
        case 'info':
          if (e.lg && /declines the trade|no longer possible|withdraws/.test(e.lg)) api.toast(e.lg);
          return 120 * sp;
      }
      return 0;
    }
    function pumpQ() {
      while (!paused && Q.length && clk >= busyUntil) {
        const e = Q.shift();
        busyUntil = clk + (onEvent(e) || 0);
        idleDone = false;
      }
    }
    function runSched() {
      if (paused) return;
      for (let i = 0; i < sched.length; i++) {
        const s = sched[i];
        if (clk >= s.at) { sched.splice(i--, 1); if (s.tok === M.tok) s.fn(); }
      }
    }

    function sqAt(bx, by) {
      for (let i = 0; i < 40; i++) { const g = GEO[i]; if (bx >= g.x && bx < g.x + g.w && by >= g.y && by < g.y + g.h) return i; }
      return -1;
    }
    const boardPt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * B / r.width, (e.clientY - r.top) * B / r.height]; };

    function frame(d) {
      const k = L.bs / B * K * DPR;
      let popOn = false;
      for (const s in D.pop) { if (clk - D.pop[s] < 450) popOn = true; else { delete D.pop[s]; stDirty = true; } }
      if (stDirty || popOn) {
        sctx.setTransform(k, 0, 0, k, 0, 0);
        drawStatic(sctx, Vd, D, clk);
        stDirty = false;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(sc, 0, 0);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      drawDynamic(ctx, Vd, D, clk);
      if (D.fx.length) D.fx = D.fx.filter(f => clk - f.t0 < f.dur);
      if (D.conf.length) {
        for (const c of D.conf) { c.x += c.vx * d; c.y += c.vy * d; c.r += c.vr * d; c.vx += (Math.random() - .5) * 30 * d; }
        D.conf = D.conf.filter(c => c.y < B + 30);
      }
      if (Vd) {
        for (let i = 0; i < pcEls.length; i++) {
          const tgt = Vd.P[i].cash;
          if (shown[i] == null) shown[i] = tgt;
          const df = tgt - shown[i];
          if (df) shown[i] = Math.abs(df) < 1 ? tgt : shown[i] + df * Math.min(1, d * 7);
          if (pcEls[i]._t !== shown[i]) { pcEls[i]._t = shown[i]; pcEls[i].textContent = money(Math.round(shown[i])); }
        }
      }
    }


    function hintFor(V, nd) {
      const me = viewer;
      if (!nd) return '';
      const q = n => esc(SQ[n].n);
      switch (nd.k) {
        case 'roll': return nd.p === me ? (V.P[me].jail ? `In Jail, attempt ${V.P[me].jt + 1} of 3` : V.dbl ? 'Doubles, roll again' : 'Roll the dice') : 'Waiting for the roll';
        case 'buy': return nd.p === me ? `Buy ${q(V.buy.sq)} for ${money(SQ[V.buy.sq].price)}?` : `${nameOf(nd.p)} is deciding on ${q(V.buy.sq)}`;
        case 'auc': return `Auction for ${q(V.auc.sq)}`;
        case 'debt': return nd.p === me ? `You owe ${money(V.debt.amt)}` : `${nameOf(nd.p)} owes ${money(V.debt.amt)}`;
        case 'end': return nd.p === me ? 'Manage, trade or end your turn' : `${nameOf(nd.p)} is finishing the turn`;
        case 'trade': return `${nameOf(V.trade.from)} offered a trade to ${nameOf(V.trade.to)}`;
      }
      return '';
    }

    function setSheet(html) {
      if (cardUntil > clk) return;
      if (sheet.dataset.k === 'card') { sheet.dataset.k = ''; sheetHTML = ''; sheet.hidden = true; }
      if (!html) { if (!sheet.hidden) { sheet.hidden = true; sheet.innerHTML = ''; } sheetHTML = ''; return; }
      if (html === sheetHTML && !sheet.hidden) return;
      sheetHTML = html; sheet.className = 'mn-sheet'; sheet.innerHTML = html; sheet.hidden = false; centerSheet();
    }
    function miniDeed(sq) {
      const q = SQ[sq];
      const head = `<div class="mn-dh" style="background:${GC[q.g]};color:${darkG(q.g) ? '#fff' : '#111'}"><b>${esc(q.n.toUpperCase())}</b></div>`;
      let body;
      if (q.k === 'prop') body = `<p>Rent <b>$${q.r[0]}</b> · full set <b>$${q.r[0] * 2}</b></p><p>1 to 4 houses <b>$${q.r[1]}</b> to <b>$${q.r[4]}</b></p><p>Hotel <b>$${q.r[5]}</b> · house <b>$${q.hc}</b></p>`;
      else if (q.k === 'rail') body = '<p>Rent <b>$25</b>, <b>$50</b>, <b>$100</b>, <b>$200</b></p><p>by railroads owned</p>';
      else body = '<p>Rent <b>4x</b> the dice, or <b>10x</b></p><p>with both utilities</p>';
      return `<div class="mn-deed mini">${head}<div class="mn-dr">${body}</div></div>`;
    }
    function buySheet(V) {
      const sq = V.buy.sq, q = SQ[sq], p = V.buy.p;
      let h = `<h3>${esc(q.n)}</h3>${miniDeed(sq)}<p>Price <b>${money(q.price)}</b></p>`;
      if (p === viewer) h += `<p>You have ${money(V.P[p].cash)}</p><div class="mn-row">${btn('buy', 'green', 'Buy', money(q.price))}${btn('decline', 'gold', V.R.auc ? 'Auction' : 'Pass')}</div>`;
      else h += `<p>${nameOf(p)} is deciding<span class="mn-dots"></span></p>`;
      return h;
    }
    function aucSheet(V) {
      const a = V.auc, q = SQ[a.sq], me = viewer, pl = V.P[me];
      let h = `<h3>Auction</h3>${miniDeed(a.sq)}<div class="mn-bid">${a.bid ? money(a.bid) : 'No bids'}</div>`;
      h += `<p>${a.who >= 0 ? 'High bid by ' + nameOf(a.who) : 'Opening bid is $1'}</p>`;
      if (a.cur === me && !pl.out) {
        if (AU.sq !== a.sq || AU.bid !== a.bid) { AU = { sq: a.sq, bid: a.bid, amt: Math.min(pl.cash, a.bid + 10) }; if (AU.amt <= a.bid) AU.amt = a.bid + 1; }
        const can = AU.amt > a.bid && AU.amt <= pl.cash;
        h += `<div class="mn-step tight"><button data-a="ad" data-d="-10">-10</button><b>${money(AU.amt)}</b><button data-a="ad" data-d="1">+1</button><button data-a="ad" data-d="10">+10</button><button data-a="ad" data-d="50">+50</button></div>`;
        h += `<div class="mn-row">${btn('bid', 'green' + (can ? '' : ' dis'), 'Bid', money(AU.amt))}${btn('pass', 'gray', 'Pass')}</div>`;
      } else if (a.cur >= 0) h += `<p>${nameOf(a.cur)} to bid<span class="mn-dots"></span></p>`;
      return h;
    }

    let lastAct = '';
    function ui() {
      const V = Vd;
      side.hidden = scene !== 'game';
      if (scene !== 'game' || !V) { setSheet(''); elAct.innerHTML = ''; lastAct = ''; return; }
      const idle = isIdle(), me = viewer, nd = needOf(V), pl = V.P[me];
      bSpd.textContent = SPD_LBL[opt.sp];
      D.hl = V.phase === 'buy' && V.buy ? [V.buy.sq] : V.phase === 'auc' && V.auc ? [V.auc.sq] : null;
      const main = V.phase === 'over' ? (V.won === viewer && V.P[V.won].nm === 'You' ? 'You win!' : `${nameOf(V.won)} wins!`) : V.turn === me ? 'Your turn' : nameOf(V.turn) + "'s turn";
      const sub = V.phase === 'over' ? '' : idle ? hintFor(V, nd) : esc(lastLog);
      const stH = `${main}<small>${sub}</small>`;
      if (elStatus._h !== stH) { elStatus._h = stH; elStatus.innerHTML = stH; }
      let h = '';
      if (M.awaiting) h = '<p class="mn-hint">Sending…</p>';
      else if (pl.out && V.phase !== 'over') h = '<p class="mn-hint">You are bankrupt. You can keep watching.</p><div class="mn-row">' + (M.ff ? '' : btn('ff', 'gold sm', 'Fast forward')) + btn('menu', 'gray sm', 'Menu') + '</div>';
      else if (idle && V.phase !== 'over') {
        const row = (...a) => `<div class="mn-row">${a.join('')}</div>`;
        const second = V.turn === me && (V.phase === 'roll' || V.phase === 'end' || V.phase === 'buy') ? row(btn('props', 'gray sm', 'Properties'), canTrade(V, me) ? btn('trade', 'gray sm', 'Trade') : '') : '';
        if (nd && nd.k === 'trade') {
          if (nd.p === me) h = `<p class="mn-hint">${nameOf(V.trade.from)} made you an offer.</p>${btn('reply', 'gold big', 'See the offer')}`;
          else if (V.trade.from === me) h = `<p class="mn-hint">Waiting for ${nameOf(V.trade.to)} to answer…</p>${btn('tcancel', 'gray', 'Withdraw offer')}`;
          else h = `<p class="mn-hint">${nameOf(V.trade.from)} and ${nameOf(V.trade.to)} are negotiating…</p>`;
        } else if (nd && nd.p === me) {
          if (nd.k === 'roll') {
            if (pl.jail) h = btn('roll', 'green big', 'Roll for doubles', `Attempt ${pl.jt + 1} of 3`) + row(btn('jpay', 'gold' + (pl.cash < 50 ? ' dis' : ''), 'Pay $50'), pl.gj[0] + pl.gj[1] ? btn('jcard', 'blue', 'Use card') : '') + second;
            else h = btn('roll', 'green big', V.dbl ? 'Roll again' : 'Roll dice', V.dbl ? 'Doubles' : '') + second;
          } else if (nd.k === 'end') h = btn('end', 'gold big', 'End turn') + second;
          else if (nd.k === 'buy') h = `<p class="mn-hint">Decide on ${esc(SQ[V.buy.sq].n)} in the card.</p>` + second;
          else if (nd.k === 'auc') h = `<p class="mn-hint">Place your bid in the card, or pass.</p>`;
          else if (nd.k === 'debt') h = `<p class="mn-hint">You owe ${money(V.debt.amt)}${V.debt.to >= 0 ? ' to ' + nameOf(V.debt.to) : ''}. You have ${money(pl.cash)}.</p>` + row(btn('props', 'blue', 'Raise cash'), canTrade(V, me) ? btn('trade', 'gray', 'Trade') : '') + btn('bankrupt', 'red sm', 'Declare bankruptcy');
        } else if (nd) h = `<p class="mn-hint">${hintFor(V, nd)}<span class="mn-dots"></span></p>` + (V.phase === 'auc' ? '' : '');
      }
      if (h !== lastAct) { lastAct = h; elAct.innerHTML = h; }
      let sh = '';
      if (idle && V.phase === 'buy' && V.buy) sh = buySheet(V);
      else if (idle && V.phase === 'auc' && V.auc) sh = aucSheet(V);
      setSheet(sh);
      if (paneK === 'props') renderProps();
      if (idle && V.phase !== 'over' && !pl.out) {
        const replyNeed = !!(nd && nd.k === 'trade' && nd.p === me);
        if (replyNeed && !paneK) showReply();
        else if (!replyNeed && paneK === 'reply') hidePane();
        if (V.phase === 'debt' && V.debt.p === me && !paneK && debtShown !== V.tid) { debtShown = V.tid; showProps(me); debtPane = true; }
        else if (paneK === 'props' && debtPane && V.phase !== 'debt') hidePane();
      } else if (idle && paneK === 'reply') hidePane();
      if (V.phase === 'over' && idle && !M.ended) showEnd(V);
    }

    function adjustBid(d) {
      const V = Vd; if (!V || !V.auc) return;
      AU.amt = clamp(AU.amt + d, V.auc.bid + 1, Math.max(V.auc.bid + 1, V.P[viewer].cash));
      uiDirty = true;
    }
    function onAct(a, b) {
      snd.unlock(); snd.tap();
      switch (a) {
        case 'roll': send({ a: 'roll' }); break;
        case 'jpay': send({ a: 'jail', m: 'pay' }); break;
        case 'jcard': send({ a: 'jail', m: 'card' }); break;
        case 'buy': send({ a: 'buy' }); break;
        case 'decline': send({ a: 'decline' }); break;
        case 'end': send({ a: 'end' }); break;
        case 'pass': send({ a: 'pass' }); break;
        case 'bid': send({ a: 'bid', amt: AU.amt }); break;
        case 'ad': adjustBid(+b.dataset.d); break;
        case 'props': showProps(viewer); break;
        case 'trade': openTrade(); break;
        case 'reply': showReply(); break;
        case 'tcancel': send({ a: 'tr-cancel' }); break;
        case 'bankrupt': showBankrupt(); break;
        case 'ff': M.ff = true; uiDirty = true; break;
        case 'menu': showMenu(); break;
      }
    }
    function primary() {
      const V = Vd;
      if (!V || !isIdle() || M.awaiting || paneK) return;
      const nd = needOf(V);
      if (!nd || nd.p !== viewer) return;
      snd.unlock();
      if (nd.k === 'roll') send({ a: 'roll' });
      else if (nd.k === 'end') send({ a: 'end' });
      else if (nd.k === 'buy') send({ a: 'buy' });
      else if (nd.k === 'auc') { if (AU.amt > V.auc.bid && AU.amt <= V.P[viewer].cash) send({ a: 'bid', amt: AU.amt }); }
      else if (nd.k === 'trade') showReply();
      else if (nd.k === 'debt') showProps(viewer);
    }

    function send(a) {
      if (scene !== 'game' || !Vd || !isIdle() || M.awaiting) return false;
      if (M.role === 'guest') {
        M.awaiting = true; uiDirty = true;
        api.net.send({ t: 'act', a });
        clearTimeout(awaitTimer);
        awaitTimer = setTimeout(() => { if (M.awaiting) { M.awaiting = false; uiDirty = true; } }, 4000);
        return true;
      }
      if (!M.eng) return false;
      let ok = false;
      try { ok = M.eng.act(viewer, a); } catch (err) { console.error(err); }
      if (ok) flush();
      return ok;
    }
    function flush() {
      if (!M.eng) return;
      const es = M.eng.take();
      if (!es.length) return;
      for (const e of es) Q.push(e);
      idleDone = false; uiDirty = true;
      if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es }); });
      saveHost();
    }
    const SK = 'gameplay:mnsave';
    function saveHost() {
      if (M.mode !== 'online' || M.role !== 'host' || !M.eng) return;
      try {
        if (M.eng.s.phase === 'over') sessionStorage.removeItem(SK);
        else sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), s: M.eng.s, hum: M.human }));
      } catch (e) {}
    }

    function showProps(p) { PP = p; renderProps(); }
    function renderProps() {
      const V = Vd; if (!V || PP < 0) return;
      const st = paneK === 'props' ? pane.scrollTop : 0;
      const p = PP, pl = V.P[p], mine = p === viewer && !pl.out, can = mine && isIdle() && !M.awaiting && manageOK(V, p);
      const debt = V.phase === 'debt' && V.debt && V.debt.p === p;
      let h = `<div class="mn-box wide"><p class="mn-kick">${mine ? 'Your properties' : 'Properties'}</p><h3>${esc(pl.nm)} · ${money(pl.cash)}</h3>`;
      if (debt) {
        const need = V.debt.amt - pl.cash;
        h += `<div class="mn-alert">${need > 0 ? `You owe ${money(V.debt.amt)} ${V.debt.to >= 0 ? 'to ' + nameOf(V.debt.to) : 'to the bank'}. Raise ${money(need)} more by selling buildings or mortgaging.` : 'You can pay the debt now.'}</div>`;
      }
      let any = false;
      for (const g of ORDER_G) {
        const list = GROUPS[g].filter(i => V.own[i] === p);
        if (!list.length) continue;
        any = true;
        const full = list.length === GROUPS[g].length;
        h += `<div class="mn-grp"><div class="mn-gh" style="--c:${GC[g]};--fg:${darkG(g) ? '#fff' : '#111'}"><b>${GN[g]}</b><small>${full ? 'Full set' : list.length + ' of ' + GROUPS[g].length}</small></div>`;
        for (const i of list) {
          const q = SQ[i], hs = V.hs[i], mt = V.mt[i];
          const lv = mt ? 'Mortgaged' : q.k === 'prop' ? (hs === 5 ? 'Hotel' : hs ? hs + (hs === 1 ? ' house' : ' houses') : 'No buildings') + ' · rent ' + money(rent(V, i, 7)) : q.k === 'rail' ? 'Rent ' + money(rent(V, i)) : 'Rent 4x or 10x dice';
          let bt = '';
          if (mine) {
            if (q.k === 'prop' && full && !anyMort(V, g) && hs < 5) bt += `<button class="mn-b green" data-a="pb" data-i="${i}"${can && canBuild(V, p, i) ? '' : ' disabled'}>Build ${money(q.hc)}</button>`;
            if (hs > 0) bt += `<button class="mn-b gold" data-a="ps" data-i="${i}"${can && canSell(V, p, i) ? '' : ' disabled'}>Sell +${money(q.hc / 2)}</button>`;
            if (mt) bt += `<button class="mn-b blue" data-a="pu" data-i="${i}"${can && canUnmort(V, p, i) ? '' : ' disabled'}>Unmortgage ${money(ucost(i))}</button>`;
            else bt += `<button class="mn-b gray" data-a="pm" data-i="${i}"${can && canMort(V, p, i) ? '' : ' disabled'}>Mortgage +${money(mval(i))}</button>`;
          }
          h += `<div class="mn-pr"><b data-a="pd" data-i="${i}" style="cursor:pointer">${esc(q.n)}</b><span class="lv">${lv}</span>${bt}</div>`;
        }
        h += '</div>';
      }
      if (!any) h += '<p>No properties yet.</p>';
      h += `<p class="mn-note">Bank: ${V.bh} houses and ${V.bH} hotels left. Net worth ${money(worth(V, p))}.${mine && !can && !debt ? ' You can build and mortgage on your turn, in auctions, or when you owe money.' : ''}</p>`;
      h += `<div class="mn-row">${mine && canTrade(V, p) && isIdle() ? btn('ptrade', 'blue', 'Trade') : ''}${debt ? btn('pbk', 'red', 'Declare bankruptcy') : ''}${btn('close', 'gray', 'Close')}</div></div>`;
      showPane('props', h, (a, b) => {
        const i = +b.dataset.i;
        if (a === 'close') hidePane();
        else if (a === 'pd') showDeed(i, 'props');
        else if (a === 'pb') send({ a: 'build', sq: i });
        else if (a === 'ps') send({ a: 'sell', sq: i });
        else if (a === 'pm') send({ a: 'mort', sq: i });
        else if (a === 'pu') send({ a: 'unmort', sq: i });
        else if (a === 'ptrade') { hidePane(); openTrade(); }
        else if (a === 'pbk') showBankrupt();
      }, null, hidePane);
      pane.scrollTop = st;
    }
    function showDeed(sq, back) {
      const close = () => { hidePane(); if (back === 'props') showProps(PP); };
      showPane('deed', `<div class="mn-box" style="max-width:290px">${deedHTML(sq, Vd)}<div class="mn-row" style="margin-top:10px">${btn('close', 'gray', 'Close')}</div></div>`, close, 'clear', close);
    }
    function showBankrupt() {
      const V = Vd; if (!V) return;
      const debt = V.phase === 'debt' && V.debt && V.debt.p === viewer ? V.debt : null;
      showPane('bk', `<div class="mn-box"><p class="mn-kick">Bankruptcy</p><h3>Give up?</h3><p>${debt && debt.to >= 0 ? 'Everything you own goes to ' + nameOf(debt.to) + '.' : 'The bank takes everything and auctions your properties.'}</p><div class="mn-row">${btn('yes', 'red', 'Declare bankruptcy')}${btn('no', 'gray', 'Keep playing')}</div></div>`, a => {
        hidePane();
        if (a === 'yes') send({ a: 'bankrupt' }); else if (debt) showProps(viewer);
      });
    }

    function openTrade(pre) {
      const V = Vd;
      if (!V || !canTrade(V, viewer) || !isIdle() || M.awaiting) return;
      const others = V.P.map((_, i) => i).filter(i => i !== viewer && !V.P[i].out);
      if (!others.length) return;
      T = pre || { to: others[0], give: { c: 0, p: [], j: [0, 0] }, get: { c: 0, p: [], j: [0, 0] }, err: '' };
      renderTrade();
    }
    function renderTrade() {
      const V = Vd, t = T; if (!V || !t) return;
      const st = paneK === 'trade' ? pane.scrollTop : 0;
      const me = viewer, other = t.to;
      const others = V.P.map((_, i) => i).filter(i => i !== me && !V.P[i].out);
      const col = (who, s, key) => {
        const pl = V.P[who];
        let h = `<div class="mn-step"><button data-a="tc" data-s="${key}" data-d="-100">-100</button><button data-a="tc" data-s="${key}" data-d="-10">-10</button><b>${money(s.c)}</b><button data-a="tc" data-s="${key}" data-d="10">+10</button><button data-a="tc" data-s="${key}" data-d="100">+100</button></div><div class="mn-chips">`;
        for (let d = 0; d < 2; d++) if (pl.gj[d]) h += `<button class="mn-chip card${s.j[d] ? ' on' : ''}" data-a="tj" data-s="${key}" data-d="${d}">Jail card (${d ? 'Chest' : 'Chance'}) ${s.j[d]}/${pl.gj[d]}</button>`;
        for (let i = 0; i < 40; i++) {
          if (V.own[i] !== who) continue;
          const ok = tradable(V, who, i);
          h += `<button class="mn-chip${V.mt[i] ? ' mt' : ''}${s.p.includes(i) ? ' on' : ''}" style="--c:${GC[SQ[i].g]}${ok ? '' : ';opacity:.4'}" data-a="tp" data-s="${key}" data-i="${i}"${ok ? '' : ' disabled'}>${esc(SQ[i].n)}</button>`;
        }
        return h + '</div>';
      };
      const h = `<div class="mn-box wide"><p class="mn-kick">Trade</p><h3>Make an offer</h3><div class="mn-who">${others.map(i => `<button data-a="twho" data-i="${i}" class="${i === other ? 'on' : ''}"><img alt="" src="${tokIcon(V.P[i].tok, PCOL[i], 26)}">${esc(V.P[i].nm)}</button>`).join('')}</div><div class="mn-cols"><div><h4>You give</h4>${col(me, t.give, 'give')}</div><div><h4>You get from ${nameOf(other)}</h4>${col(other, t.get, 'get')}</div></div><p class="mn-err">${esc(t.err || '')}</p><div class="mn-row">${btn('tsend', 'green', 'Offer trade')}${btn('tclose', 'gray', 'Cancel')}</div></div>`;
      showPane('trade', h, (a, b) => {
        const key = b.dataset.s, side = key && t[key], i = +b.dataset.i;
        t.err = '';
        if (a === 'tclose') { hidePane(); return; }
        if (a === 'twho') { t.to = i; t.get = { c: 0, p: [], j: [0, 0] }; }
        else if (a === 'tp') { const k = side.p.indexOf(i); if (k >= 0) side.p.splice(k, 1); else side.p.push(i); }
        else if (a === 'tj') { const d = +b.dataset.d, pl = V.P[key === 'give' ? me : t.to]; side.j[d] = (side.j[d] + 1) % (pl.gj[d] + 1); }
        else if (a === 'tc') { const pl = V.P[key === 'give' ? me : t.to]; side.c = clamp(side.c + (+b.dataset.d), 0, pl.cash); }
        else if (a === 'tsend') {
          const o = { a: 'trade', to: t.to, give: { c: t.give.c, p: t.give.p.slice(), j: t.give.j.slice() }, get: { c: t.get.c, p: t.get.p.slice(), j: t.get.j.slice() } };
          const err = tradeOK(V, { from: me, to: o.to, give: cleanSide(o.give), get: cleanSide(o.get) });
          if (err) t.err = err;
          else { hidePane(); send(o); return; }
        }
        renderTrade();
      });
      pane.scrollTop = st;
    }
    function showReply() {
      const V = Vd; if (!V || !V.trade) return;
      const t = V.trade;
      showPane('reply', `<div class="mn-box wide"><p class="mn-kick">Trade offer</p><h3>${nameOf(t.from)} wants to trade</h3><div class="mn-cols"><div><h4>You get</h4><div class="mn-chips">${sideHTML(t.give, V)}</div></div><div><h4>You give</h4><div class="mn-chips">${sideHTML(t.get, V)}</div></div></div><div class="mn-row" style="margin-top:12px">${btn('tr-ok', 'green', 'Accept')}${btn('tr-no', 'red', 'Decline')}${btn('counter', 'blue', 'Counter offer')}</div></div>`, a => {
        if (a === 'counter') {
          const tt = V.trade;
          hidePane();
          T = { to: tt.from, give: { c: tt.get.c, p: tt.get.p.slice(), j: tt.get.j.slice() }, get: { c: tt.give.c, p: tt.give.p.slice(), j: tt.give.j.slice() }, err: '' };
          renderTrade();
          return;
        }
        hidePane(); send({ a });
      });
    }

    function showEnd(V) {
      M.ended = true;
      const alive = V.P.map((_, i) => i).filter(i => !V.P[i].out).sort((a, b) => (b === V.won) - (a === V.won) || worth(V, b) - worth(V, a));
      const rank = alive.concat(V.order.slice().reverse().filter(i => !alive.includes(i)));
      const won = V.won === viewer;
      if (won) { opt.wins = (opt.wins || 0) + 1; saveOpt(); api.score(opt.wins); api.submit(opt.wins); }
      const rows = rank.map((p, i) => `<tr class="${i === 0 ? 'win' : ''}"><td><img alt="" src="${tokIcon(V.P[p].tok, PCOL[p], 22)}">${esc(V.P[p].nm)}${p === viewer ? ' (you)' : ''}</td><td>${ord(i + 1)}</td><td>${V.P[p].out ? 'Bankrupt' : money(worth(V, p))}</td></tr>`).join('');
      const online = M.mode === 'online', host = M.role !== 'guest';
      const byTime = V.R.rounds && V.order.length < V.n - 1;
      showPane('end', `<div class="mn-box"><p class="mn-kick">${byTime ? 'Time is up' : 'Game over'}</p><h3>${won ? 'You win!' : esc(V.P[V.won].nm) + ' wins'}</h3><table class="mn-tbl">${rows}</table><p>Wins: ${opt.wins || 0}</p>${host ? btn('again', 'green big', online ? 'Rematch' : 'Play again') : '<p>Waiting for the host…</p>'}${online && M.role === 'host' ? btn('lobby', 'blue big', 'Back to lobby') : ''}${btn('quit', 'red', online ? 'Leave' : 'Menu')}</div>`, a => {
        if (a === 'again') { if (online) newOnline(); else newSolo(); }
        else if (a === 'lobby') startOnline();
        else if (a === 'quit') { if (online) leaveOnline(); else showTitle(); }
      }, 'clear');
    }

    function optClick(sb) {
      const k = sb.parentNode.dataset.k, v = JSON.parse(sb.dataset.v);
      opt[k] = v; saveOpt(); snd.tap();
      [...sb.parentNode.children].forEach(b => b.classList.toggle('on', b === sb));
      if (k === 'n') { const sub = pane.querySelector('[data-sub]'); if (sub) sub.textContent = `You and ${opt.n - 1} bot${opt.n > 2 ? 's' : ''}`; }
      if (k === 'sp') uiDirty = true;
    }
    api.on(pane, 'click', e => {
      const sb = e.target.closest('.mn-seg button');
      if (sb) { optClick(sb); return; }
      const tk = e.target.closest('[data-tok]');
      if (tk) {
        opt.tok = +tk.dataset.tok; saveOpt(); snd.tap();
        [...tk.parentNode.children].forEach(b => b.classList.toggle('on', b === tk));
        return;
      }
      const b = e.target.closest('[data-a]');
      if (b && paneH) { snd.unlock(); snd.tap(); b.blur(); paneH(b.dataset.a, b); return; }
      if (e.target === pane && paneBG) paneBG();
    });

    function showHow(back) {
      showPane('how', `<div class="mn-box wide"><h3>How to play</h3><div class="mn-rules">${HELP}</div>${btn('done', 'green big', 'Got it')}</div>`, () => back());
    }
    function showRules(back) {
      const h = `<div class="mn-box wide"><p class="mn-kick">Settings</p><h3>House rules</h3>${optRow('cash', 'Starting cash', '', [[1000, '$1000'], [1500, '$1500'], [2000, '$2000']], opt.cash)}${optRow('fp', 'Free Parking jackpot', 'Taxes and fines go to a pot', [[false, 'Off'], [true, 'On']], opt.fp)}${optRow('go2', 'Double GO salary', '$400 when landing on GO', [[false, 'Off'], [true, 'On']], opt.go2)}${optRow('auc', 'Auctions', 'Declined properties are auctioned', [[true, 'On'], [false, 'Off']], opt.auc)}${optRow('rounds', 'Game length', 'Richest player wins at the limit', [[0, 'Endless'], [20, '20 rounds'], [40, '40 rounds']], opt.rounds)}${optRow('sp', 'Animation speed', '', SPEEDS.map((s, i) => [i, s[0]]), opt.sp)}<p class="mn-note">Rules apply to the next game. Online, the host's rules are used.</p>${btn('done', 'green big', 'Done')}</div>`;
      showPane('rules', h, () => back());
    }
    function showTitle() {
      scene = 'title'; paused = false; M.mode = 'solo'; M.role = 'local'; M.eng = null; viewer = 0; netEl.hidden = true;
      resetView(null);
      api.score(opt.wins || 0);
      const sv = opt.sv && opt.sv.s && opt.sv.s.P ? opt.sv.s : null;
      showPane('title', `<div class="mn-box"><div class="mn-logo">MONOPOLY</div><p>Buy, trade and build your way to the last fortune standing.</p>${optRow('n', 'Players', '', [2, 3, 4, 5, 6].map(v => [v, String(v)]), opt.n)}${optRow('lv', 'Bots', '', [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], opt.lv)}<div class="mn-opt"><span>Your token</span></div><div class="mn-toks">${TOKS.map((t, i) => `<button data-tok="${i}" title="${t}" class="${i === opt.tok ? 'on' : ''}"><img alt="${t}" src="${tokIcon(i, PCOL[0], 44)}"></button>`).join('')}</div>${btn('play', 'green big', 'Play vs bots', `<span data-sub>You and ${opt.n - 1} bot${opt.n > 2 ? 's' : ''}</span>`)}${sv ? btn('resume', 'gold big', 'Resume game', `${sv.n} players, turn ${sv.tt}`) : ''}${btn('online', 'blue big', 'Play online', '2 to 6 players, bots can fill empty seats')}<div class="mn-row">${btn('rules', 'gray sm', 'House rules')}${btn('how', 'gray sm', 'How to play')}</div>${opt.wins ? `<p>Wins: ${opt.wins}</p>` : ''}</div>`, a => {
        if (a === 'play') newSolo();
        else if (a === 'resume') resumeSolo();
        else if (a === 'online') startOnline();
        else if (a === 'rules') showRules(showTitle);
        else if (a === 'how') showHow(showTitle);
      });
    }
    function showMenu() {
      if (scene !== 'game') return;
      const online = M.mode === 'online';
      if (!online) paused = true;
      const V = Vd, R = V ? V.R : opt;
      const bots = online && M.role === 'host' ? M.human.map((h, q) => h && q !== viewer && M.pids[q] ? btn('rbot', 'gray sm', 'Replace ' + nameOf(q) + ' with a bot', '', ` data-q="${q}"`) : '').join('') : '';
      showPane('menu', `<div class="mn-box"><p class="mn-kick">Monopoly</p><h3>Menu</h3>${btn('resume', 'green big', 'Resume')}<div class="mn-opt"><span>Animation speed</span>${seg('sp', SPEEDS.map((s, i) => [i, s[0]]), opt.sp)}</div>${bots}<p class="mn-note">Rules: ${money(R.cash)} start${R.fp ? ' · Free Parking jackpot' : ''}${R.go2 ? ' · double GO' : ''}${R.auc ? '' : ' · no auctions'}${R.rounds ? ' · ' + R.rounds + ' rounds' : ''}</p><div class="mn-row">${btn('how', 'gray sm', 'How to play')}${M.role !== 'guest' ? btn('restart', 'gold sm', 'Restart game') : ''}</div>${btn('quit', 'red', online ? 'Leave game' : 'Quit to menu')}</div>`, (a, b) => {
        if (a === 'resume') { hidePane(); paused = false; idleDone = false; uiDirty = true; }
        else if (a === 'how') showHow(showMenu);
        else if (a === 'restart') { hidePane(); paused = false; if (online) newOnline(); else { opt.sv = null; newSolo(); } }
        else if (a === 'rbot') { hidePane(); seatToBot(M.pids[+b.dataset.q]); }
        else if (a === 'quit') { paused = false; if (online) leaveOnline(); else showTitle(); }
      }, null, () => { hidePane(); paused = false; idleDone = false; uiDirty = true; });
    }

    const rulesOf = () => ({ fp: opt.fp, go2: opt.go2, cash: opt.cash, auc: opt.auc, lv: opt.lv, rounds: opt.rounds });
    function beginGame(eng, seat, resume) {
      M.eng = eng; viewer = seat; M.ended = false; M.ff = false; saveTid = -1; botTid = -1; scene = 'game'; paused = false; hidePane();
      resetView(eng.view(), resume ? eng.s.log : null);
      netEl.hidden = M.mode !== 'online';
      api.score(opt.wins || 0);
      if (!resume) eng.start();
      flush();
      idleDone = false; uiDirty = true;
    }
    function newSolo() {
      const n = opt.n, names = ['You'], toks = [opt.tok], bots = [false];
      const pool = BOT_NAMES.slice().sort(() => Math.random() - .5), free = [0, 1, 2, 3, 4, 5].filter(t => t !== opt.tok);
      for (let i = 1; i < n; i++) { names.push(pool.pop()); toks.push(free.shift()); bots.push(true); }
      M.mode = 'solo'; M.role = 'local'; opt.sv = null;
      beginGame(Engine({ n, names, toks, bots, rules: rulesOf() }), 0, false);
    }
    function resumeSolo() {
      if (!opt.sv || !opt.sv.s) return newSolo();
      M.mode = 'solo'; M.role = 'local';
      let eng;
      try { eng = Engine({ state: JSON.parse(JSON.stringify(opt.sv.s)) }); } catch (err) { console.error(err); opt.sv = null; saveOpt(); return newSolo(); }
      beginGame(eng, 0, true);
    }

    function onIdle() {
      if (scene !== 'game' || !Vd || M.role === 'guest' || !M.eng) return;
      const s = M.eng.s;
      if (s.phase === 'over') { if (M.mode === 'solo' && opt.sv) { opt.sv = null; saveOpt(); } return; }
      if (M.mode === 'solo' && saveTid !== s.tid) { saveTid = s.tid; opt.sv = { s }; saveOpt(); }
      const nd = needOf(s);
      if (!nd || !s.P[nd.p].bot || botTid === s.tid) return;
      botTid = s.tid;
      const tok = M.tok, tid = s.tid, p = nd.p;
      const r = nd.k === 'trade' ? [1000, 1500] : nd.k === 'debt' ? [450, 650] : nd.k === 'end' ? [420, 640] : [650, 950];
      after((r[0] + Math.random() * (r[1] - r[0])) * Math.max(.15, SP()), () => {
        if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
        const s2 = M.eng.s, nd2 = needOf(s2);
        if (!nd2 || nd2.p !== p) return;
        let a = null, ok = false;
        try { a = aiAct(s2, p, Math.random); ok = !!(a && M.eng.act(p, a)); } catch (err) { console.error(err); }
        if (!ok) { const f = autoAct(s2, nd2); ok = !!(f && M.eng.act(p, f)); }
        if (!ok) console.error('bot stuck', nd2);
        flush();
      });
    }

    function sendSetups() {
      const v = M.eng.view(), lg = M.eng.s.log.slice(-40);
      M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'setup', seat: q, v, lg }); });
    }
    function newOnline() {
      const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
      M.players = live;
      const k = Math.min(live.length, 6);
      const n = clamp(M.bots ? Math.max(k, M.size || k) : k, 2, 6);
      const names = [], toks = [], bots = [], pool = BOT_NAMES.slice().sort(() => Math.random() - .5);
      M.pids = Array(n).fill(null); M.human = Array(n).fill(false);
      for (let i = 0; i < n; i++) {
        toks.push(i);
        if (i < k) { names.push(live[i].name); bots.push(false); M.pids[i] = live[i].id; M.human[i] = true; }
        else { names.push(pool.pop()); bots.push(true); }
      }
      M.mode = 'online'; M.role = 'host'; opt.sv = null;
      const eng = Engine({ n, names, toks, bots, rules: rulesOf() });
      M.eng = eng; viewer = 0;
      sendSetups();
      beginGame(eng, 0, false);
    }
    function hostStart() {
      let sv = null;
      try {
        const x = JSON.parse(sessionStorage.getItem(SK) || 'null');
        if (x && x.code === api.net.code && x.s && x.s.P && Date.now() - x.at < 432e5 && x.s.phase !== 'over') sv = x;
      } catch (e) {}
      if (!sv) return newOnline();
      const used = {}, map = {};
      for (const g of M.players.slice(1)) {
        const q = sv.hum.findIndex((h, i) => i > 0 && h && !used[i] && sv.s.P[i].nm === g.name);
        if (q < 0) return newOnline();
        used[q] = 1; map[q] = g;
      }
      const left = sv.hum.filter((h, i) => i > 0 && h && !used[i]).length;
      const alive = sv.s.P.filter(x => !x.out).length;
      showPane('resumeq', `<div class="mn-box"><p class="mn-kick">Online</p><h3>Game in progress</h3><p>Saved game: turn ${sv.s.tt}, ${alive} players left.${left ? ' ' + left + ' missing player' + (left > 1 ? 's' : '') + ' will be replaced by bots.' : ''}</p>${btn('go', 'green big', 'Resume game')}${btn('new', 'gold big', 'New game')}${btn('leave', 'gray sm', 'Leave')}</div>`, a => {
        if (a === 'go') resumeOnline(sv, map);
        else if (a === 'new') newOnline();
        else leaveOnline();
      });
    }
    function resumeOnline(sv, map) {
      const eng = Engine({ state: JSON.parse(JSON.stringify(sv.s)) }), st = eng.s, n = st.n;
      M.pids = Array(n).fill(null); M.human = Array(n).fill(false);
      M.pids[0] = M.players[0].id; M.human[0] = true;
      for (let q = 1; q < n; q++) {
        if (!sv.hum[q]) continue;
        if (map[q]) { M.pids[q] = map[q].id; M.human[q] = true; }
        else { eng.setBot(q, true); eng.rename(q, st.P[q].nm.slice(0, 12) + ' (bot)'); }
      }
      M.mode = 'online'; M.role = 'host'; opt.sv = null; M.eng = eng; viewer = 0;
      sendSetups();
      beginGame(eng, 0, true);
      eng.touch('The host is back. Game resumed');
      botTid = -1; flush();
    }
    function seatToBot(id) {
      const q = M.pids.indexOf(id);
      if (q < 0 || M.role !== 'host' || !M.eng || !M.human[q]) return;
      const who = M.eng.s.P[q].nm;
      M.pids[q] = null; M.human[q] = false;
      M.eng.setBot(q, true); M.eng.rename(q, who.slice(0, 12) + ' (bot)');
      M.eng.touch(`${who} left the game. A bot takes over`);
      botTid = -1; flush();
      api.toast(who + ' left. A bot takes over.');
    }
    function leaveOnline() {
      try { sessionStorage.removeItem(SK); } catch (e) {}
      M.tok++; M.mode = 'solo'; M.role = 'local'; M.eng = null; M.pids = []; M.players = [];
      api.net.close(); showTitle();
    }
    function hookNet() {
      if (M.hooked) return;
      M.hooked = true;
      api.net.on('data', onData);
      api.net.on('leave', p => { if (M.mode === 'online' && M.role === 'host' && p) seatToBot(p.id); });
      api.net.on('rejoin', p => {
        if (M.mode !== 'online' || M.role !== 'host' || !M.eng || !p) return;
        const q = M.pids.indexOf(p.id);
        if (q >= 0 && M.human[q]) api.net.sendTo(p.id, { t: 'setup', seat: q, v: M.eng.view(), lg: M.eng.s.log.slice(-40) });
      });
      api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
      api.net.on('close', reason => {
        if (M.mode !== 'online' || M.role === 'local') return;
        M.tok++; M.role = 'local'; M.eng = null; paused = true; Q.length = 0;
        snd.lose();
        const hd = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
        const tx = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the host was lost.';
        showPane('left', `<div class="mn-box"><p class="mn-kick">Online</p><h3>${hd}</h3><p>${tx}</p>${btn('room', 'green big', 'Online lobby')}${btn('solo', 'red', 'Play vs bots')}</div>`, a => {
          paused = false;
          if (a === 'room') startOnline(); else { api.net.close(); M.mode = 'solo'; showTitle(); }
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
      hidePane(); scene = 'title'; paused = false; netEl.hidden = true; Vd = null; D.v = null; elPls.innerHTML = ''; sheet.hidden = true; stDirty = true;
      Q.length = 0; sched.length = 0;
      M.mode = 'online'; M.role = null; M.eng = null;
      const r = await api.net.room({ title: 'Monopoly', sizes: [2, 3, 4, 5, 6], defaultSize: 4, min: 2, max: 6, bots: true });
      if (!api.alive || tok !== M.tok) return;
      if (!r) { M.mode = 'solo'; M.role = 'local'; return showTitle(); }
      M.role = r.role; M.players = r.players.slice(0, 6); M.bots = !!r.bots; M.size = +r.size || r.players.length;
      if (r.role === 'host') hostStart();
      else showPane('wait', `<div class="mn-box"><p class="mn-kick">Online</p><h3>Connected</h3><p>Waiting for the host to start<span class="mn-dots"></span></p><div class="mn-row">${btn('leave', 'gray sm', 'Leave')}</div></div>`, a => { if (a === 'leave') leaveOnline(); });
    }
    function onData(d, from) {
      if (!d || !d.t || !api.alive || M.mode !== 'online') return;
      if (api.net.role === 'host') {
        if (M.role !== 'host' || !M.eng || d.t !== 'act') return;
        const q = M.pids.indexOf(from);
        if (q < 0 || q === viewer || !M.human[q]) return;
        const a = cleanAct(d.a);
        let ok = false;
        if (a) { try { ok = M.eng.act(q, a); } catch (err) { console.error(err); } }
        if (ok) flush(); else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(), sync: 1 });
      } else if (d.t === 'setup') {
        if (!d.v || !Array.isArray(d.v.P)) return;
        M.mode = 'online'; M.role = 'guest'; viewer = d.seat | 0; M.ended = false; M.ff = false; scene = 'game'; paused = false; hidePane();
        resetView(d.v, d.lg); netEl.hidden = false; idleDone = false; api.score(opt.wins || 0);
      } else if (M.role === 'guest' && d.t === 'ev') {
        M.awaiting = false; uiDirty = true; idleDone = false;
        if (d.sync && !Q.length && d.v) { const keep = elLog.innerHTML; setView(d.v); elLog.innerHTML = keep; }
        if (Array.isArray(d.es)) for (const e of d.es) if (e && e.t) Q.push(e);
      }
    }

    api.on(cv, 'click', e => {
      snd.unlock();
      if (!pane.hidden || paused || scene !== 'game') return;
      const [x, y] = boardPt(e), s = sqAt(x, y);
      if (s >= 0) showDeed(s);
    });
    api.on(cv, 'pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const [x, y] = boardPt(e), s = scene === 'game' && pane.hidden ? sqAt(x, y) : -1;
      if (s !== D.hover) { D.hover = s; cv.style.cursor = s >= 0 ? 'pointer' : ''; }
    });
    api.on(cv, 'pointerleave', () => { D.hover = -1; });
    api.on(elPls, 'click', e => {
      if (scene !== 'game' || !pane.hidden) return;
      const i = e.target.closest('i[data-sq]');
      if (i) { showDeed(+i.dataset.sq); return; }
      const pl = e.target.closest('.mn-pl');
      if (pl) showProps(+pl.dataset.p);
    });
    api.on(elAct, 'click', e => { const b = e.target.closest('[data-a]'); if (b) { b.blur(); onAct(b.dataset.a, b); } });
    api.on(sheet, 'click', e => {
      if (sheet.dataset.k === 'card') { cardUntil = 0; busyUntil = Math.min(busyUntil, clk); uiDirty = true; return; }
      const b = e.target.closest('[data-a]');
      if (b) { b.blur(); onAct(b.dataset.a, b); }
    });
    api.on(bMenu, 'click', () => {
      snd.unlock();
      if (paneK === 'menu') { pane.click(); return; }
      if (!pane.hidden) return;
      showMenu();
    });
    api.on(bSpd, 'click', () => { opt.sp = (opt.sp + 1) % SPEEDS.length; saveOpt(); snd.tap(); uiDirty = true; });
    api.on(bProps, 'click', () => { snd.unlock(); if (scene === 'game' && pane.hidden) showProps(viewer); });
    api.on(window, 'keydown', e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Escape' && scene === 'game' && M.mode === 'online') {
        e.preventDefault();
        if (pane.hidden) showMenu(); else if (paneK === 'menu') { hidePane(); idleDone = false; uiDirty = true; } else if (paneBG) paneBG();
        return;
      }
      if (e.code === 'Escape' && !pane.hidden && paneBG) { e.preventDefault(); paneBG(); return; }
      if (scene !== 'game' || paused || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (paneK) return;
      if (k === ' ' || k === 'enter') { e.preventDefault(); primary(); }
      else if (k === 'm' || k === 'p') showProps(viewer);
      else if (k === 't') openTrade();
      else if (k === 'a' && Vd && Vd.phase === 'buy' && Vd.buy.p === viewer && isIdle()) send({ a: 'decline' });
      else if (k === 'e' && Vd && Vd.phase === 'end' && Vd.turn === viewer && isIdle()) send({ a: 'end' });
      else if (k === 'arrowup' && Vd && Vd.phase === 'auc') adjustBid(10);
      else if (k === 'arrowdown' && Vd && Vd.phase === 'auc') adjustBid(-10);
    });

    api.loop(dt => {
      const d = paused ? 0 : dt;
      clk += d * 1000;
      runSched(); pumpQ();
      const idle = isIdle();
      if (idle !== lastIdle || uiDirty) { lastIdle = idle; uiDirty = false; ui(); }
      if (idle && !idleDone && scene === 'game') { idleDone = true; onIdle(); }
      frame(d);
    });
    fit();
    root._mn = {
      M, D, Q, opt, SQ, showCard,
      get V() { return Vd; }, get viewer() { return viewer; }, get scene() { return scene; }, get pane() { return paneK; },
      idle: isIdle, clock: () => clk, send,
      auto() {
        const V = Vd; if (!V || !isIdle()) return false;
        const nd = needOf(V);
        if (!nd || nd.p !== viewer) return false;
        let a = null;
        try { a = aiAct(V, viewer, Math.random); } catch (err) { a = null; }
        return send(a || autoAct(V, nd));
      }
    };
    if (api.net.invite) startOnline(); else showTitle();
    return { destroy() { M.tok++; clearTimeout(awaitTimer); if (ro) ro.disconnect(); snd.close(); } };
  }

  const ICON_MN = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48" rx="4"/><rect x="18" y="18" width="28" height="28"/><path d="M8 18h10M8 28h10M46 18h10M46 28h10M18 8v10M28 8v10M18 46v10M28 46v10"/><path d="M26 36l6-8 6 8z"/></svg>';
  const coverDie = (x, y, r, sz, pips) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="${sz * .2}" fill="#000" opacity=".3" transform="translate(4 6)"/><rect x="${-sz / 2}" y="${-sz / 2}" width="${sz}" height="${sz}" rx="${sz * .2}" fill="#fbfaf5" stroke="#c9c6b8" stroke-width="2"/><g fill="#1d1f2a">${pips.map(q => `<circle cx="${q[0] * sz * .27}" cy="${q[1] * sz * .27}" r="${sz * .09}"/>`).join('')}</g></g>`;
  Ameplay.register({
    id: 'monopoly', title: 'Monopoly', category: 'Board', tint: '#d7261e',
    blurb: 'Buy streets, build houses and hotels, trade and bankrupt your rivals. 2 to 6 players with bots, house rules and online play.',
    help: '<kbd>Space</kbd> roll, buy or end turn · <kbd>A</kbd> auction · <kbd>M</kbd> properties · <kbd>T</kbd> trade · click a square for its deed',
    width: 1000, format: fmtWins, icon: ICON_MN,
    _t: { Engine, aiAct, autoAct, SQ, rent, needOf, GROUPS },
    css: mnCss('monopoly'),
    mount: (root, api) => makeApp(root, api)
  });
  Ameplay.covers['monopoly'] = (() => {
    const bx = 70, by = 10, u = 26, N = 11, S = u * N;
    let s = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mnc-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e7a52"/><stop offset="1" stop-color="#0f4630"/></linearGradient></defs><rect width="400" height="300" fill="url(#mnc-g)"/>`;
    s += `<rect x="${bx - 5}" y="${by - 5}" width="${S + 10}" height="${S + 10}" rx="6" fill="#0c2c20"/><rect x="${bx}" y="${by}" width="${S}" height="${S}" fill="#cfe6d2"/>`;
    const cols = ['#955436', '#aae0fa', '#d93a96', '#f7941d', '#ed1b24', '#fef200', '#1fb25a', '#0072bb'];
    for (let i = 0; i < 10; i++) {
      const k = i + 1;
      s += `<rect x="${bx + k * u}" y="${by}" width="${u}" height="${u}" fill="#e9f3e8" stroke="#2a4a38" stroke-width=".8"/><rect x="${bx + k * u}" y="${by + u - 7}" width="${u}" height="7" fill="${cols[(i * 8 / 10) | 0]}" stroke="#2a4a38" stroke-width=".6"/>`;
      s += `<rect x="${bx + k * u - u}" y="${by + S - u}" width="${u}" height="${u}" fill="#e9f3e8" stroke="#2a4a38" stroke-width=".8"/><rect x="${bx + k * u - u}" y="${by + S - u}" width="${u}" height="7" fill="${cols[7 - ((i * 8 / 10) | 0)]}" stroke="#2a4a38" stroke-width=".6"/>`;
      s += `<rect x="${bx}" y="${by + k * u - u}" width="${u}" height="${u}" fill="#e9f3e8" stroke="#2a4a38" stroke-width=".8"/><rect x="${bx + u - 7}" y="${by + k * u - u}" width="7" height="${u}" fill="${cols[(i * 8 / 10) | 0]}" stroke="#2a4a38" stroke-width=".6"/>`;
      s += `<rect x="${bx + S - u}" y="${by + k * u}" width="${u}" height="${u}" fill="#e9f3e8" stroke="#2a4a38" stroke-width=".8"/><rect x="${bx + S - u}" y="${by + k * u}" width="7" height="${u}" fill="${cols[7 - ((i * 8 / 10) | 0)]}" stroke="#2a4a38" stroke-width=".6"/>`;
    }
    for (const [x, y] of [[0, 0], [10, 0], [0, 10], [10, 10]]) s += `<rect x="${bx + x * u}" y="${by + y * u}" width="${u}" height="${u}" fill="#f6e7c2" stroke="#2a4a38" stroke-width="1"/>`;
    s += `<g transform="translate(${bx + S / 2} ${by + S / 2}) rotate(-35)"><rect x="-96" y="-22" width="192" height="44" fill="#d7261e" stroke="#fff" stroke-width="3"/><text y="12" font-family="Arial Black,Impact,Arial,sans-serif" font-weight="900" font-size="32" fill="#fff" text-anchor="middle" letter-spacing="1">MONOPOLY</text></g>`;
    s += coverDie(338, 226, 12, 54, [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) + coverDie(360, 168, -14, 44, [[-1, -1], [1, 1]]);
    return s + `</svg>`;
  })();

})();
