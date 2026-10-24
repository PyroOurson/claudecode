(() => {
  'use strict';

  const RES = ['brick', 'lumber', 'wool', 'grain', 'ore'];
  const RNAME = ['Brick', 'Lumber', 'Wool', 'Grain', 'Ore'];
  const TNAME = ['Hills', 'Forest', 'Pasture', 'Fields', 'Mountains', 'Desert'];
  const COST = { road: [1, 1, 0, 0, 0], settle: [1, 1, 1, 1, 0], city: [0, 0, 0, 2, 3], dev: [0, 0, 1, 1, 1] };
  const MAXP = { road: 15, settle: 5, city: 4 };
  const DEVN = ['Knight', 'Victory Point', 'Road Building', 'Year of Plenty', 'Monopoly'];
  const DEVDESC = [
    'Move the robber and steal a card. Three played Knights earn Largest Army.',
    'Worth 1 victory point. Kept hidden until you win.',
    'Build 2 roads for free.',
    'Take any 2 resources from the bank.',
    'Name a resource. Every other player gives you all of it.'
  ];
  const PCOL = ['#d8372e', '#2f78dc', '#f2912a', '#f3efe4'];
  const PDARK = ['#7e1712', '#16407f', '#9a540a', '#7d765f'];
  const PNAME = ['Red', 'Blue', 'Orange', 'White'];
  const PIPS = n => n ? 6 - Math.abs(7 - n) : 0;
  const sum = a => a.reduce((x, y) => x + y, 0);
  const SQ3 = Math.sqrt(3);

  const TOPO = (() => {
    const hc = [];
    for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) hc.push([q, r]);
    const H = hc.map(([q, r]) => ({ q, r, x: SQ3 * (q + r / 2), y: 1.5 * r, v: [], nb: [] }));
    const V = [], vk = new Map(), E = [], ek = new Map();
    const vid = (x, y) => {
      const k = Math.round(x * 1000) + ',' + Math.round(y * 1000);
      if (!vk.has(k)) { vk.set(k, V.length); V.push({ x, y, adj: [], e: [], h: [] }); }
      return vk.get(k);
    };
    H.forEach((h, i) => {
      const ids = [];
      for (let k = 0; k < 6; k++) { const a = (-90 + 60 * k) * Math.PI / 180; ids.push(vid(h.x + Math.cos(a), h.y + Math.sin(a))); }
      h.v = ids;
      ids.forEach(v => V[v].h.push(i));
      for (let k = 0; k < 6; k++) {
        const a = Math.min(ids[k], ids[(k + 1) % 6]), b = Math.max(ids[k], ids[(k + 1) % 6]), key = a + '_' + b;
        if (!ek.has(key)) { ek.set(key, E.length); E.push({ a, b, h: [] }); }
        E[ek.get(key)].h.push(i);
      }
    });
    E.forEach((e, i) => { V[e.a].adj.push(e.b); V[e.b].adj.push(e.a); V[e.a].e.push(i); V[e.b].e.push(i); });
    E.forEach(e => { if (e.h.length === 2) { H[e.h[0]].nb.push(e.h[1]); H[e.h[1]].nb.push(e.h[0]); } });
    const mid = i => [(V[E[i].a].x + V[E[i].b].x) / 2, (V[E[i].a].y + V[E[i].b].y) / 2];
    const coast = E.map((e, i) => i).filter(i => E[i].h.length === 1);
    coast.sort((a, b) => Math.atan2(mid(a)[1], mid(a)[0]) - Math.atan2(mid(b)[1], mid(b)[0]));
    const slots = [0, 3, 7, 10, 13, 17, 20, 23, 27];
    const PE = slots.map(i => coast[i]);
    const VPORT = Array(V.length).fill(-1);
    const PS = PE.map((e, k) => {
      const [mx, my] = mid(e), h = H[E[e].h[0]], dx = mx - h.x, dy = my - h.y, d = Math.hypot(dx, dy);
      VPORT[E[e].a] = k; VPORT[E[e].b] = k;
      return { e, x: mx + dx / d * 0.866, y: my + dy / d * 0.866, nx: dx / d, ny: dy / d };
    });
    return { H, V, E, PE, PS, VPORT, coast };
  })();

  const { H: HX, V: VX, E: EX, VPORT } = TOPO;

  function genBoard(R, balanced) {
    const rint = k => Math.floor(R() * k);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const T = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5];
    const NUMS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
    const make = strict => {
      for (let t = 0; t < 6000; t++) {
        const ter = shuffle(T.slice()), nm = shuffle(NUMS.slice()), num = ter.map(x => x === 5 ? 0 : nm.pop());
        let ok = true;
        for (let i = 0; i < 19 && ok; i++) for (const j of HX[i].nb) {
          if (j < i) continue;
          const a = num[i], b = num[j];
          if ((a === 6 || a === 8) && (b === 6 || b === 8)) { ok = false; break; }
          if (strict && a && a === b) { ok = false; break; }
        }
        if (ok && strict) {
          const pt = [0, 0, 0, 0, 0];
          ter.forEach((x, i) => { if (x < 5) pt[x] += PIPS(num[i]); });
          if (Math.max(...pt) - Math.min(...pt) > 7) ok = false;
        }
        if (ok) return ter.map((x, i) => [x, num[i]]);
      }
      return null;
    };
    const hexes = (balanced && make(true)) || make(false);
    return { hexes, ports: shuffle([0, 1, 2, 3, 4, 5, 5, 5, 5]) };
  }

  function canSettle(S, p, v, setup) {
    if (S.vtx[v]) return false;
    for (const w of VX[v].adj) if (S.vtx[w]) return false;
    return setup || VX[v].e.some(e => S.road[e] === p);
  }
  function canRoad(S, p, e, from) {
    if (S.road[e] !== -1) return false;
    const { a, b } = EX[e];
    if (from != null && from >= 0) return a === from || b === from;
    return [a, b].some(v => {
      const bd = S.vtx[v];
      if (bd) return bd.p === p;
      return VX[v].e.some(f => f !== e && S.road[f] === p);
    });
  }
  function roadLen(S, p) {
    const mine = [];
    for (let e = 0; e < EX.length; e++) if (S.road[e] === p) mine.push(e);
    if (!mine.length) return 0;
    const at = new Map();
    mine.forEach(e => { [EX[e].a, EX[e].b].forEach(v => { if (!at.has(v)) at.set(v, []); at.get(v).push(e); }); });
    const used = new Set();
    let best = 0;
    const go = (v, len) => {
      if (len > best) best = len;
      if (len > 0) { const bd = S.vtx[v]; if (bd && bd.p !== p) return; }
      for (const e of at.get(v) || []) {
        if (used.has(e)) continue;
        used.add(e);
        go(EX[e].a === v ? EX[e].b : EX[e].a, len + 1);
        used.delete(e);
      }
    };
    for (const v of at.keys()) go(v, 0);
    return best;
  }
  function ratesFor(S, p) {
    const r = [4, 4, 4, 4, 4];
    for (let v = 0; v < VX.length; v++) {
      const b = S.vtx[v];
      if (!b || b.p !== p || VPORT[v] < 0) continue;
      const t = S.ports[VPORT[v]];
      if (t === 5) { for (let k = 0; k < 5; k++) if (r[k] > 3) r[k] = 3; } else r[t] = 2;
    }
    return r;
  }
  const legalSettle = (S, p, setup) => { const o = []; for (let v = 0; v < VX.length; v++) if (canSettle(S, p, v, setup)) o.push(v); return o; };
  const legalRoad = (S, p, from) => { const o = []; for (let e = 0; e < EX.length; e++) if (canRoad(S, p, e, from)) o.push(e); return o; };
  const hexVictims = (S, h, p) => {
    const o = [];
    HX[h].v.forEach(v => { const b = S.vtx[v]; if (b && b.p !== p && !o.includes(b.p)) o.push(b.p); });
    return o;
  };

  function Game(o) {
    const R = o.rnd || Math.random, n = o.n;
    const rint = k => Math.floor(R() * k);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const bd = o.board || genBoard(R, o.balanced);
    const deck = [];
    [14, 5, 2, 2, 2].forEach((c, t) => { for (let i = 0; i < c; i++) deck.push(t); });
    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    for (let i = n - 1; i >= 0; i--) order.push(i);
    const s = {
      n, goal: o.goal || 10,
      hex: bd.hexes.map(([t, num]) => ({ t, num })), ports: bd.ports,
      robber: bd.hexes.findIndex(h => h[0] === 5),
      bank: [19, 19, 19, 19, 19], deck: shuffle(deck),
      P: Array.from({ length: n }, () => ({ res: [0, 0, 0, 0, 0], dev: [], knights: 0, nroad: 0, nsetl: 0, ncity: 0, vpc: 0 })),
      vtx: Array(VX.length).fill(null), road: Array(EX.length).fill(-1),
      order, si: 0, turn: order[0], phase: 'setup_s', rolled: false, dice: [0, 0], devPlayed: false, tn: 0, tid: 0,
      last: -1, after: 'main', rb: 0, disc: {}, victims: [], trade: null, lr: -1, lrLen: 0, la: -1, winner: -1, err: '',
      ai: Array.from({ length: n }, () => ({ tn: -1, offers: 0, tried: {} }))
    };
    let ev = [];
    const E = e => ev.push(e);
    const total = p => sum(s.P[p].res);
    const pubVp = p => s.P[p].nsetl + 2 * s.P[p].ncity + (s.lr === p ? 2 : 0) + (s.la === p ? 2 : 0);
    const fullVp = p => pubVp(p) + s.P[p].dev.filter(c => c.t === 1).length;
    const bad = m => { s.err = m; return false; };
    const afford = (p, c) => c.every((k, r) => s.P[p].res[r] >= k);
    const pay = (p, c) => c.forEach((k, r) => { s.P[p].res[r] -= k; s.bank[r] += k; });
    const give = (p, r, k) => { s.bank[r] -= k; s.P[p].res[r] += k; };
    const playable = (p, t) => !s.devPlayed && s.P[p].dev.some(c => c.t === t && c.at < s.tn);
    const useDev = (p, t) => {
      const i = s.P[p].dev.findIndex(c => c.t === t && c.at < s.tn);
      s.P[p].dev.splice(i, 1);
      s.devPlayed = true;
      E({ k: 'dev', p, t });
    };

    function updateLR() {
      const L = s.P.map((_, p) => roadLen(s, p)), best = Math.max(...L);
      let h = -1;
      if (best >= 5) {
        const c = [];
        L.forEach((x, i) => { if (x === best) c.push(i); });
        if (s.lr >= 0 && c.includes(s.lr)) h = s.lr; else if (c.length === 1) h = c[0];
      }
      s.lrLen = h >= 0 ? L[h] : 0;
      if (h !== s.lr) { const old = s.lr; s.lr = h; E({ k: 'lr', p: h, from: old, len: best }); }
      return L;
    }
    function checkArmy(p) {
      const k = s.P[p].knights;
      if (k >= 3 && s.la !== p && (s.la < 0 || k > s.P[s.la].knights)) { const old = s.la; s.la = p; E({ k: 'la', p, from: old }); }
    }
    function produce(roll) {
      const owed = Array.from({ length: n }, () => [0, 0, 0, 0, 0]);
      s.hex.forEach((h, i) => {
        if (h.num !== roll || i === s.robber || h.t > 4) return;
        HX[i].v.forEach(v => { const b = s.vtx[v]; if (b) owed[b.p][h.t] += b.c ? 2 : 1; });
      });
      for (let r = 0; r < 5; r++) {
        const who = [];
        for (let p = 0; p < n; p++) if (owed[p][r] > 0) who.push(p);
        if (!who.length) continue;
        const need = who.reduce((a, p) => a + owed[p][r], 0);
        if (s.bank[r] >= need) who.forEach(p => { give(p, r, owed[p][r]); });
        else if (who.length === 1) { const k = s.bank[r]; if (k > 0) { give(who[0], r, k); owed[who[0]][r] = k; } else owed[who[0]][r] = 0; E({ k: 'short', r }); }
        else { who.forEach(p => { owed[p][r] = 0; }); E({ k: 'short', r }); }
      }
      const gains = [];
      for (let p = 0; p < n; p++) for (let r = 0; r < 5; r++) if (owed[p][r] > 0) gains.push([p, r, owed[p][r]]);
      E({ k: 'gain', g: gains, roll });
    }
    function stealFrom(p, v) {
      const hand = s.P[v].res, tot = sum(hand);
      if (!tot) return;
      let x = rint(tot), r = 0;
      while (x >= hand[r]) { x -= hand[r]; r++; }
      hand[r]--; s.P[p].res[r]++;
      E({ k: 'steal', from: v, to: p, r });
    }
    function afterRobber() {
      s.phase = s.after;
      s.victims = [];
    }
    function startRobber(after) {
      s.after = after; s.phase = 'robber';
    }
    function turnStart() {
      s.rolled = false; s.devPlayed = false; s.phase = 'roll';
      E({ k: 'turn', p: s.turn });
    }
    function setupDone() {
      s.tn++; s.turn = s.order[0]; turnStart();
    }

    function handle(p, a) {
      const ph = s.phase, k = a.k, me = s.P[p];
      if (ph === 'discard') {
        if (k !== 'discard') return bad('Waiting for discards.');
        const need = s.disc[p];
        if (!need) return bad('You do not need to discard.');
        const c = a.c;
        if (!Array.isArray(c) || c.length !== 5 || !c.every((x, r) => Number.isInteger(x) && x >= 0 && x <= me.res[r]) || sum(c) !== need) return bad('Discard exactly ' + need + ' cards.');
        c.forEach((x, r) => { me.res[r] -= x; s.bank[r] += x; });
        delete s.disc[p];
        E({ k: 'discard', p, n: need });
        if (!Object.keys(s.disc).length) startRobber('main');
        return true;
      }
      if (k === 'respond' || k === 'counter') {
        const t = s.trade;
        if (!t || p === t.from || ph !== 'main') return bad('No trade to answer.');
        if (t.resp[p] !== 'wait' && !(t.resp[p] === 'ctr' && k === 'counter')) return bad('Already answered.');
        if (k === 'respond') {
          if (a.r === 'yes') {
            if (!t.want.every((x, r) => me.res[r] >= x)) return bad('You do not have those cards.');
            t.resp[p] = 'yes';
          } else t.resp[p] = 'no';
          E({ k: 'resp', p, r: t.resp[p] });
        } else {
          const g = a.give, w = a.want;
          if (!okVec(g) || !okVec(w) || !g.every((x, r) => me.res[r] >= x) || sum(g) < 1 || sum(w) < 1) return bad('Bad counter offer.');
          if (g.some((x, r) => x && w[r])) return bad('Bad counter offer.');
          t.resp[p] = 'ctr'; t.ctr[p] = { give: g.slice(), want: w.slice() };
          E({ k: 'resp', p, r: 'ctr' });
        }
        if (Object.values(t.resp).every(x => x === 'no')) { s.trade = null; E({ k: 'tradeno' }); }
        return true;
      }
      if (p !== s.turn) return bad('Not your turn.');
      switch (ph) {
        case 'setup_s': {
          if (k !== 'settle') return bad('Place a settlement.');
          if (!canSettle(s, p, a.v, true)) return bad('You cannot build there.');
          s.vtx[a.v] = { p, c: 0 }; me.nsetl++; s.last = a.v; s.phase = 'setup_r';
          E({ k: 'build', p, w: 'settle', i: a.v, setup: 1 });
          if (s.si >= n) {
            const got = [];
            VX[a.v].h.forEach(h => { const t = s.hex[h].t; if (t < 5 && s.bank[t] > 0) { give(p, t, 1); got.push([p, t, 1, h]); } });
            E({ k: 'gain', g: got, setup: 1 });
          }
          return true;
        }
        case 'setup_r': {
          if (k !== 'road') return bad('Place a road.');
          if (!canRoad(s, p, a.e, s.last)) return bad('The road must touch your new settlement.');
          s.road[a.e] = p; me.nroad++;
          E({ k: 'build', p, w: 'road', i: a.e, setup: 1 });
          updateLR();
          s.si++;
          if (s.si >= s.order.length) setupDone();
          else { s.turn = s.order[s.si]; s.phase = 'setup_s'; E({ k: 'turn', p: s.turn }); }
          return true;
        }
        case 'roll': case 'main': break;
        case 'robber': {
          if (k !== 'robber') return bad('Move the robber.');
          const h = a.h;
          if (!Number.isInteger(h) || h < 0 || h > 18 || h === s.robber) return bad('Pick another hex.');
          s.robber = h;
          E({ k: 'robber', p, h });
          const vs = hexVictims(s, h, p).filter(v => total(v) > 0);
          if (vs.length === 0) afterRobber();
          else if (vs.length === 1) { stealFrom(p, vs[0]); afterRobber(); }
          else { s.victims = vs; s.phase = 'steal'; }
          return true;
        }
        case 'steal': {
          if (k !== 'steal' || !s.victims.includes(a.v)) return bad('Pick a player to rob.');
          stealFrom(p, a.v); afterRobber();
          return true;
        }
        case 'rb': {
          if (k !== 'road') return bad('Place your free road.');
          if (!canRoad(s, p, a.e)) return bad('You cannot build there.');
          s.road[a.e] = p; me.nroad++; s.rb--;
          E({ k: 'build', p, w: 'road', i: a.e, free: 1 });
          updateLR();
          if (s.rb <= 0 || me.nroad >= MAXP.road || !legalRoad(s, p).length) { s.rb = 0; s.phase = s.after; }
          return true;
        }
        default: return bad('Not now.');
      }
      if (k === 'roll') {
        if (ph !== 'roll') return bad('Already rolled.');
        const d = [rint(6) + 1, rint(6) + 1], t = d[0] + d[1];
        s.dice = d; s.rolled = true;
        E({ k: 'roll', p, d });
        if (t === 7) {
          s.disc = {};
          for (let q = 0; q < n; q++) { const c = total(q); if (c > 7) s.disc[q] = Math.floor(c / 2); }
          if (Object.keys(s.disc).length) { s.phase = 'discard'; s.after = 'main'; E({ k: 'seven', disc: Object.assign({}, s.disc) }); }
          else { E({ k: 'seven', disc: {} }); startRobber('main'); }
        } else { produce(t); s.phase = 'main'; }
        return true;
      }
      if (k === 'knight') {
        if (!playable(p, 0)) return bad('You cannot play a Knight now.');
        useDev(p, 0); me.knights++;
        checkArmy(p);
        startRobber(ph);
        return true;
      }
      if (k === 'rbuild') {
        if (!playable(p, 2)) return bad('You cannot play Road Building now.');
        if (me.nroad >= MAXP.road || !legalRoad(s, p).length) return bad('You have nowhere to build.');
        useDev(p, 2);
        s.after = ph; s.phase = 'rb'; s.rb = Math.min(2, MAXP.road - me.nroad);
        return true;
      }
      if (k === 'plenty') {
        if (!playable(p, 3)) return bad('You cannot play Year of Plenty now.');
        const x = a.a, y = a.b;
        if (!(x >= 0 && x < 5 && y >= 0 && y < 5)) return bad('Pick two resources.');
        const need = [0, 0, 0, 0, 0]; need[x]++; need[y]++;
        if (need.some((c, r) => c > s.bank[r])) return bad('The bank does not have that.');
        useDev(p, 3);
        give(p, x, 1); give(p, y, 1);
        E({ k: 'plenty', p, a: x, b: y });
        return true;
      }
      if (k === 'mono') {
        if (!playable(p, 4)) return bad('You cannot play Monopoly now.');
        const r = a.r;
        if (!(r >= 0 && r < 5)) return bad('Pick a resource.');
        useDev(p, 4);
        let got = 0;
        const from = [];
        for (let q = 0; q < n; q++) if (q !== p && s.P[q].res[r]) { got += s.P[q].res[r]; from.push([q, s.P[q].res[r]]); s.P[p].res[r] += s.P[q].res[r]; s.P[q].res[r] = 0; }
        E({ k: 'mono', p, r, n: got, from });
        return true;
      }
      if (ph !== 'main') return bad('Roll the dice first.');
      switch (k) {
        case 'road': {
          if (me.nroad >= MAXP.road) return bad('No roads left.');
          if (!afford(p, COST.road)) return bad('Not enough resources.');
          if (!canRoad(s, p, a.e)) return bad('You cannot build there.');
          pay(p, COST.road); s.road[a.e] = p; me.nroad++;
          E({ k: 'build', p, w: 'road', i: a.e });
          updateLR();
          return true;
        }
        case 'settle': {
          if (me.nsetl >= MAXP.settle) return bad('No settlements left.');
          if (!afford(p, COST.settle)) return bad('Not enough resources.');
          if (!canSettle(s, p, a.v, false)) return bad('You cannot build there.');
          pay(p, COST.settle); s.vtx[a.v] = { p, c: 0 }; me.nsetl++;
          E({ k: 'build', p, w: 'settle', i: a.v });
          updateLR();
          return true;
        }
        case 'city': {
          const b = s.vtx[a.v];
          if (!b || b.p !== p || b.c) return bad('Pick one of your settlements.');
          if (me.ncity >= MAXP.city) return bad('No cities left.');
          if (!afford(p, COST.city)) return bad('Not enough resources.');
          pay(p, COST.city); b.c = 1; me.nsetl--; me.ncity++;
          E({ k: 'build', p, w: 'city', i: a.v });
          return true;
        }
        case 'buydev': {
          if (!s.deck.length) return bad('No development cards left.');
          if (!afford(p, COST.dev)) return bad('Not enough resources.');
          pay(p, COST.dev);
          const t = s.deck.pop();
          me.dev.push({ t, at: s.tn });
          E({ k: 'buydev', p, t });
          return true;
        }
        case 'bank': {
          const g = a.g, r = a.r, rate = ratesFor(s, p)[g];
          if (!(g >= 0 && g < 5 && r >= 0 && r < 5) || g === r) return bad('Pick two different resources.');
          if (me.res[g] < rate) return bad('You need ' + rate + ' ' + RNAME[g] + '.');
          if (s.bank[r] < 1) return bad('The bank has none of that.');
          me.res[g] -= rate; s.bank[g] += rate; give(p, r, 1);
          E({ k: 'bank', p, g, gn: rate, r });
          return true;
        }
        case 'offer': {
          if (s.trade) return bad('A trade is already open.');
          const g = a.give, w = a.want;
          if (!okVec(g) || !okVec(w) || sum(g) < 1 || sum(w) < 1) return bad('Offer something for something.');
          if (g.some((x, r) => x && w[r])) return bad('You cannot trade a resource for itself.');
          if (!g.every((x, r) => me.res[r] >= x)) return bad('You do not have those cards.');
          const resp = {};
          for (let q = 0; q < n; q++) if (q !== p) resp[q] = w.every((x, r) => s.P[q].res[r] >= x) ? 'wait' : 'no';
          s.trade = { id: ++s.tid, from: p, give: g.slice(), want: w.slice(), resp, ctr: {} };
          E({ k: 'offer', p, give: g.slice(), want: w.slice() });
          if (Object.values(resp).every(x => x === 'no')) { s.trade = null; E({ k: 'tradeno' }); }
          return true;
        }
        case 'confirm': {
          const t = s.trade;
          if (!t || t.from !== p || !t.resp[a.with]) return bad('No such trade.');
          const q = a.with;
          let pg, qg;
          if (t.resp[q] === 'yes') { pg = t.give; qg = t.want; }
          else if (t.resp[q] === 'ctr') { pg = t.ctr[q].want; qg = t.ctr[q].give; }
          else return bad('That player has not accepted.');
          if (!pg.every((x, r) => me.res[r] >= x) || !qg.every((x, r) => s.P[q].res[r] >= x)) { s.trade = null; E({ k: 'tradeno' }); return bad('The cards are no longer there.'); }
          for (let r = 0; r < 5; r++) { me.res[r] += qg[r] - pg[r]; s.P[q].res[r] += pg[r] - qg[r]; }
          E({ k: 'trade', a: p, b: q, ga: pg.slice(), gb: qg.slice() });
          s.trade = null;
          return true;
        }
        case 'cancel': {
          if (!s.trade || s.trade.from !== p) return bad('No trade to cancel.');
          s.trade = null; E({ k: 'cancel', p });
          return true;
        }
        case 'end': {
          if (s.trade) { s.trade = null; E({ k: 'cancel', p }); }
          s.tn++; s.turn = (s.turn + 1) % n; turnStart();
          return true;
        }
      }
      return bad('Unknown action.');
    }
    const okVec = v => Array.isArray(v) && v.length === 5 && v.every(x => Number.isInteger(x) && x >= 0 && x <= 19);

    function checkWin() {
      if (s.phase === 'over' || s.phase.startsWith('setup')) return;
      if (fullVp(s.turn) >= s.goal) { s.phase = 'over'; s.winner = s.turn; s.trade = null; E({ k: 'win', p: s.turn }); }
    }
    function act(p, a) {
      s.err = '';
      if (s.phase === 'over') return bad('The game is over.');
      if (!Number.isInteger(p) || p < 0 || p >= n || !a || typeof a !== 'object') return bad('Bad action.');
      const r = handle(p, a);
      if (r) checkWin();
      return r;
    }
    function flush() { const e = ev; ev = []; return e; }
    function view(q) {
      const L = s.P.map((_, p) => roadLen(s, p)), over = s.phase === 'over';
      const out = {
        n, goal: s.goal, turn: s.turn, phase: s.phase, rolled: s.rolled, dice: s.dice.slice(), robber: s.robber,
        vtx: s.vtx.map(b => b ? [b.p, b.c] : null), road: s.road.slice(), bank: s.bank.slice(), deck: s.deck.length, tn: s.tn,
        ports: s.ports, lr: s.lr, la: s.la, lrLen: s.lrLen, last: s.last, after: s.after, rb: s.rb, victims: s.victims.slice(),
        disc: Object.assign({}, s.disc), devPlayed: s.devPlayed, winner: s.winner,
        trade: s.trade ? JSON.parse(JSON.stringify(s.trade)) : null,
        P: s.P.map((x, i) => ({ c: sum(x.res), d: x.dev.length, kn: x.knights, rl: L[i], vp: pubVp(i), nr: x.nroad, ns: x.nsetl, nc: x.ncity })),
        rates: ratesFor(s, q), q
      };
      if (q >= 0 && q < n) {
        const m = s.P[q];
        out.res = m.res.slice();
        out.dev = m.dev.map(c => ({ t: c.t, ok: c.t !== 1 && c.at < s.tn && !s.devPlayed, nw: c.at >= s.tn }));
        out.vpAll = fullVp(q);
      }
      if (over) out.fin = s.P.map((x, i) => ({ vpc: x.dev.filter(c => c.t === 1).length, tot: fullVp(i), res: x.res.slice() }));
      return out;
    }
    return { s, act, flush, view, total, pubVp, fullVp, playable, ratesOf: p => ratesFor(s, p), err: () => s.err };
  }

  function filt(e, q) {
    if (e.k === 'steal' && e.from !== q && e.to !== q) { const c = Object.assign({}, e); delete c.r; return c; }
    if (e.k === 'buydev' && e.p !== q) { const c = Object.assign({}, e); delete c.t; return c; }
    return e;
  }

  const PIPW = [1.0, 1.0, 0.8, 1.1, 1.1];
  const bestOf = (a, f) => { let b = null, bs = -1e9; a.forEach(x => { const v = f(x); if (v > bs) { bs = v; b = x; } }); return b; };
  const pick = (R, a) => a[Math.floor(R() * a.length)];

  function ownPips(s, p) {
    const have = [0, 0, 0, 0, 0];
    for (let w = 0; w < VX.length; w++) {
      const b = s.vtx[w];
      if (b && b.p === p) VX[w].h.forEach(h => { const t = s.hex[h].t; if (t < 5) have[t] += PIPS(s.hex[h].num) * (b.c ? 2 : 1); });
    }
    return have;
  }
  function vertexScore(s, p, v, have) {
    have = have || ownPips(s, p);
    let sc = 0;
    const mine = have.slice();
    VX[v].h.forEach(h => {
      const t = s.hex[h].t;
      if (t > 4) return;
      const pp = PIPS(s.hex[h].num);
      sc += pp * PIPW[t] * (have[t] ? 1 : 1.35);
      mine[t] += pp;
    });
    sc += mine.filter(x => x > 0).length * 0.7;
    if (mine[0] && mine[1]) sc += 1.5;
    if (mine[3] && mine[4]) sc += 1.5;
    const pt = VPORT[v];
    if (pt >= 0) { const t = s.ports[pt]; sc += t === 5 ? 1 + sum(mine) * 0.08 : mine[t] * 0.45 + 0.4; }
    return sc;
  }
  function expandValue(s, p, v, have, depth) {
    let best = 0;
    for (const w of VX[v].adj) {
      if (s.vtx[w]) continue;
      for (const x of VX[w].adj) {
        if (x === v || s.vtx[x]) continue;
        if (VX[x].adj.some(y => s.vtx[y] || y === v)) continue;
        const sc = vertexScore(s, p, x, have);
        if (sc > best) best = sc;
      }
    }
    return best;
  }
  function aiSetupSettle(s, p, lvl, R) {
    const c = legalSettle(s, p, true), have = ownPips(s, p);
    if (lvl === 'easy') {
      const sorted = c.map(v => [vertexScore(s, p, v, have), v]).sort((a, b) => b[0] - a[0]);
      return { k: 'settle', v: pick(R, sorted.slice(0, 8))[1] };
    }
    const v = bestOf(c, v => vertexScore(s, p, v, have) + (lvl === 'hard' ? expandValue(s, p, v, have) * 0.3 : 0) + R() * (lvl === 'hard' ? 0.3 : 1.2));
    return { k: 'settle', v };
  }
  function aiSetupRoad(s, p, lvl, R) {
    const v = s.last, c = legalRoad(s, p, v), have = ownPips(s, p);
    if (lvl === 'easy') return { k: 'road', e: pick(R, c) };
    const e = bestOf(c, e => {
      const far = EX[e].a === v ? EX[e].b : EX[e].a;
      let best = 0;
      for (const x of VX[far].adj) {
        if (x === v || s.vtx[x]) continue;
        if (VX[x].adj.some(y => s.vtx[y])) continue;
        best = Math.max(best, vertexScore(s, p, x, have));
      }
      return best + R() * 0.4;
    });
    return { k: 'road', e };
  }
  function settleSpots(s, p) {
    const have = ownPips(s, p);
    return legalSettle(s, p, false).map(v => [vertexScore(s, p, v, have), v]).sort((a, b) => b[0] - a[0]);
  }
  function roadChoice(s, p, free) {
    const have = ownPips(s, p), cur = s.lrLen;
    let best = null, bs = -1;
    legalRoad(s, p).forEach(e => {
      let val = 0;
      [EX[e].a, EX[e].b].forEach(x => {
        if (!s.vtx[x] && !VX[x].adj.some(y => s.vtx[y])) val = Math.max(val, vertexScore(s, p, x, have));
        for (const y of VX[x].adj) {
          if (s.vtx[y] || VX[y].adj.some(z => s.vtx[z])) continue;
          if (!s.vtx[x] || s.vtx[x].p === p) val = Math.max(val, vertexScore(s, p, y, have) * 0.55);
        }
      });
      s.road[e] = p;
      const L = roadLen(s, p);
      s.road[e] = -1;
      if (L >= 5 && s.lr !== p && L > cur) val += 6 + L;
      else val += L * 0.12;
      if (val > bs) { bs = val; best = e; }
    });
    return best == null ? null : { e: best, v: bs };
  }
  function goalCost(s, p) {
    const me = s.P[p];
    if (me.nsetl < 5 && settleSpots(s, p).length) return 'settle';
    if (me.nsetl > 0 && me.ncity < 4) return 'city';
    if (me.nroad < 15) { const r = roadChoice(s, p); if (r && r.v > 2) return 'road'; }
    if (s.deck.length) return 'dev';
    return null;
  }
  function handValue(res, cost) {
    let v = 0;
    for (let r = 0; r < 5; r++) v += Math.min(res[r], cost[r]) * 3 + Math.max(0, res[r] - cost[r]) * 0.6;
    return v;
  }
  function mergedNeed(s, p) {
    const g = goalCost(s, p);
    return g ? COST[g] : COST.city;
  }
  function aiDiscard(s, p, k) {
    const res = s.P[p].res.slice(), need = mergedNeed(s, p), out = [0, 0, 0, 0, 0];
    for (let i = 0; i < k; i++) {
      let br = -1, bs = -1e9;
      for (let r = 0; r < 5; r++) if (res[r] > 0) { const sc = res[r] - need[r] * 1.2 + (res[r] > need[r] ? 0.3 : -2); if (sc > bs) { bs = sc; br = r; } }
      res[br]--; out[br]++;
    }
    return { k: 'discard', c: out };
  }
  function aiRobber(s, p, lvl, R) {
    const goal = s.goal, c = [];
    for (let h = 0; h < 19; h++) if (h !== s.robber) c.push(h);
    if (lvl === 'easy') return { k: 'robber', h: pick(R, c) };
    const sc = h => {
      const pp = PIPS(s.hex[h].num);
      let v = 0, any = false;
      HX[h].v.forEach(x => {
        const b = s.vtx[x];
        if (!b) return;
        const w = b.c ? 2 : 1;
        if (b.p === p) v -= w * pp * 1.6;
        else {
          any = true;
          const o = s.P[b.p], tot = sum(o.res);
          const vp = o.nsetl + 2 * o.ncity + (s.lr === b.p ? 2 : 0) + (s.la === b.p ? 2 : 0);
          v += w * pp * (1 + vp / (lvl === 'hard' ? 6 : 12) + (vp >= goal - 3 ? 0.8 : 0)) * (tot ? 1 : 0.35);
        }
      });
      if (s.hex[h].t > 4) v -= 2;
      if (!any) v -= 3;
      return v + R() * 0.3;
    };
    return { k: 'robber', h: bestOf(c, sc) };
  }
  function aiSteal(s, p) {
    const v = bestOf(s.victims, v => sum(s.P[v].res) + s.P[v].nsetl + 2 * s.P[v].ncity);
    return { k: 'steal', v };
  }
  function oppPips(s, p) {
    const o = [0, 0, 0, 0, 0];
    for (let q = 0; q < s.n; q++) if (q !== p) ownPips(s, q).forEach((x, r) => { o[r] += x; });
    return o;
  }
  function aiDev(s, p, lvl, R) {
    const me = s.P[p], pl = t => s.devPlayed ? false : me.dev.some(c => c.t === t && c.at < s.tn);
    if (s.devPlayed || lvl === 'easy' && R() < 0.5) return null;
    if (pl(0)) {
      const myHexOnRobber = HX[s.robber].v.some(v => s.vtx[v] && s.vtx[v].p === p);
      const k = me.knights + 1;
      const armyGain = k >= 3 && s.la !== p && (s.la < 0 || k > s.P[s.la].knights);
      if ((myHexOnRobber && PIPS(s.hex[s.robber].num) >= 3) || armyGain || (s.phase === 'main' && me.dev.filter(c => c.t === 0).length >= 2 && lvl === 'hard')) return { k: 'knight' };
    }
    if (s.phase !== 'main') return null;
    if (pl(2) && me.nroad <= 13 && legalRoad(s, p).length >= 2) {
      const r = roadChoice(s, p);
      if (r && r.v > 3) return { k: 'rbuild' };
    }
    if (pl(4)) {
      const op = oppPips(s, p), need = mergedNeed(s, p);
      const r = bestOf([0, 1, 2, 3, 4], r => op[r] + (need[r] > me.res[r] ? 5 : 0));
      if (op[r] >= 5) return { k: 'mono', r };
    }
    if (pl(3)) {
      const goal = goalCost(s, p);
      if (goal) {
        const cost = COST[goal], short = cost.map((c, r) => Math.max(0, c - me.res[r]));
        const list = [];
        short.forEach((x, r) => { for (let i = 0; i < x; i++) list.push(r); });
        if (list.length && list.length <= 2 || lvl === 'hard' && list.length > 2) {
          while (list.length < 2) list.push(list[0]);
          const a = list[0], b = list[1];
          const need = [0, 0, 0, 0, 0]; need[a]++; need[b]++;
          if (need.every((c, r) => c <= s.bank[r])) return { k: 'plenty', a, b };
        }
      }
    }
    return null;
  }
  function aiTrade(s, p, lvl, cost, R) {
    const me = s.P[p], res = me.res, A = s.ai[p], rates = ratesFor(s, p);
    const short = cost.map((c, r) => Math.max(0, c - res[r])), sur = res.map((x, r) => Math.max(0, x - cost[r]));
    if (!sum(short)) return null;
    const maxOffers = lvl === 'hard' ? 3 : lvl === 'normal' ? 2 : 1;
    if (A.offers < maxOffers && sum(short) <= 2 && (lvl !== 'easy' || R() < 0.4)) {
      for (const r of [0, 1, 2, 3, 4]) {
        if (!short[r]) continue;
        for (const g of [0, 1, 2, 3, 4]) {
          if (g === r || sur[g] < 1) continue;
          const give = [0, 0, 0, 0, 0], want = [0, 0, 0, 0, 0];
          give[g] = 1; want[r] = 1;
          const key = give.join('') + '>' + want.join('');
          if (A.tried[key]) continue;
          A.tried[key] = 1; A.offers++;
          return { k: 'offer', give, want };
        }
      }
    }
    let possible = 0;
    for (let g = 0; g < 5; g++) possible += Math.floor(sur[g] / rates[g]);
    if (possible >= sum(short) && (A.banks | 0) < 8) {
      const r = [0, 1, 2, 3, 4].find(r => short[r] && s.bank[r] > 0);
      let bg = -1;
      for (let g = 0; g < 5; g++) if (sur[g] >= rates[g] && (bg < 0 || sur[g] / rates[g] > sur[bg] / rates[bg])) bg = g;
      if (r != null && bg >= 0) { A.banks = (A.banks | 0) + 1; return { k: 'bank', g: bg, r }; }
    }
    return null;
  }
  function aiMain(s, p, lvl, R) {
    const me = s.P[p], A = s.ai[p];
    if (A.tn !== s.tn) { A.tn = s.tn; A.offers = 0; A.tried = {}; A.banks = 0; }
    const d = aiDev(s, p, lvl, R);
    if (d) return d;
    const aff = c => c.every((x, r) => me.res[r] >= x);
    const cards = sum(me.res);
    const spots = me.nsetl < 5 ? settleSpots(s, p) : [];
    if (spots.length && aff(COST.settle)) return { k: 'settle', v: spots[0][1] };
    if (me.nsetl > 0 && me.ncity < 4 && aff(COST.city)) {
      const have = ownPips(s, p);
      const v = bestOf(VX.map((_, i) => i).filter(i => s.vtx[i] && s.vtx[i].p === p && !s.vtx[i].c), i => vertexScore(s, p, i, have));
      return { k: 'city', v };
    }
    const goal = goalCost(s, p);
    if (goal === 'road' && aff(COST.road) && me.nroad < 15) { const r = roadChoice(s, p); if (r) return { k: 'road', e: r.e }; }
    if (goal === 'dev' && aff(COST.dev) && s.deck.length) return { k: 'buydev' };
    if (goal && !aff(COST[goal])) {
      const t = aiTrade(s, p, lvl, COST[goal], R);
      if (t) return t;
    }
    if (cards >= 6 || lvl === 'hard') {
      if (s.deck.length && aff(COST.dev) && (goal !== 'city' || !aff(COST.city)) && (cards >= 7 || me.res[2] >= 1 && me.res[3] >= 1 && me.res[4] >= 1 && (cards > 5 || lvl === 'hard' && !spots.length))) return { k: 'buydev' };
      if (me.nroad < 15 && aff(COST.road) && cards >= 7) { const r = roadChoice(s, p); if (r && r.v > 1.5) return { k: 'road', e: r.e }; }
    }
    return { k: 'end' };
  }
  function tradeEval(s, q, give, get) {
    const me = s.P[q], cost = mergedNeed(s, q);
    const after = me.res.map((x, r) => x - give[r] + get[r]);
    return handValue(after, cost) - handValue(me.res, cost);
  }
  function aiRespond(s, q, lvl, R) {
    const t = s.trade, me = s.P[q];
    const gives = t.want, gets = t.give;
    if (!gives.every((x, r) => me.res[r] >= x)) return { k: 'respond', r: 'no' };
    const lead = s.P[t.from].nsetl + 2 * s.P[t.from].ncity + (s.lr === t.from ? 2 : 0) + (s.la === t.from ? 2 : 0) + s.P[t.from].vpc;
    if (lvl !== 'easy' && lead >= s.goal - 2) return { k: 'respond', r: 'no' };
    const gain = tradeEval(s, q, gives, gets);
    if (lvl === 'easy') return { k: 'respond', r: gain > 0 && R() < 0.7 ? 'yes' : 'no' };
    if (gain >= (lvl === 'hard' ? 1.2 : 0.4)) return { k: 'respond', r: 'yes' };
    const need = mergedNeed(s, q);
    const wantR = [0, 1, 2, 3, 4].find(r => gets[r] && me.res[r] < need[r]);
    if (wantR != null && lvl !== 'easy') {
      const give = [0, 0, 0, 0, 0], want = [0, 0, 0, 0, 0];
      const g = bestOf([0, 1, 2, 3, 4].filter(r => r !== wantR && !gets[r] && me.res[r] - need[r] >= 1), r => me.res[r] - need[r]);
      if (g != null) {
        give[g] = 1; want[wantR] = 1;
        const key = give.join('') + '>' + want.join('') + t.id;
        const A = s.ai[q];
        if (!A.tried[key]) { A.tried[key] = 1; if (gets.every((x, r) => !want[r] || x >= want[r]) && sum(gets) >= 1) return { k: 'counter', give, want }; }
      }
    }
    return { k: 'respond', r: 'no' };
  }
  function aiProposer(s, p, lvl) {
    const t = s.trade;
    const yes = Object.keys(t.resp).map(Number).filter(q => t.resp[q] === 'yes').sort((a, b) => s.P[a].nsetl + 2 * s.P[a].ncity - s.P[b].nsetl - 2 * s.P[b].ncity);
    if (yes.length) return { k: 'confirm', with: yes[0] };
    const ctr = Object.keys(t.resp).map(Number).filter(q => t.resp[q] === 'ctr');
    for (const q of ctr) {
      const c = t.ctr[q];
      if (c.want.every((x, r) => s.P[p].res[r] >= x) && tradeEval(s, p, c.want, c.give) > 0.3) return { k: 'confirm', with: q };
    }
    if (!Object.values(t.resp).some(x => x === 'wait')) return { k: 'cancel' };
    return null;
  }
  function aiAct(s, p, lvl, R) {
    R = R || Math.random;
    switch (s.phase) {
      case 'setup_s': return p === s.turn ? aiSetupSettle(s, p, lvl, R) : null;
      case 'setup_r': return p === s.turn ? aiSetupRoad(s, p, lvl, R) : null;
      case 'roll': {
        if (p !== s.turn) return null;
        const me = s.P[p];
        if (me.dev.some(c => c.t === 0 && c.at < s.tn) && !s.devPlayed && lvl !== 'easy') {
          const onMine = HX[s.robber].v.some(v => s.vtx[v] && s.vtx[v].p === p);
          if (onMine && PIPS(s.hex[s.robber].num) >= 4) return { k: 'knight' };
        }
        return { k: 'roll' };
      }
      case 'discard': return s.disc[p] ? aiDiscard(s, p, s.disc[p]) : null;
      case 'robber': return p === s.turn ? aiRobber(s, p, lvl, R) : null;
      case 'steal': return p === s.turn ? aiSteal(s, p) : null;
      case 'rb': { if (p !== s.turn) return null; const r = roadChoice(s, p); return { k: 'road', e: r ? r.e : legalRoad(s, p)[0] }; }
      case 'main': {
        if (p === s.turn) return s.trade ? aiProposer(s, p, lvl) : aiMain(s, p, lvl, R);
        if (s.trade && s.trade.resp[p] === 'wait') return aiRespond(s, p, lvl, R);
        return null;
      }
    }
    return null;
  }

  const SC = 56;
  const TCOL = ['#c8602b', '#2d7a3a', '#8cc84f', '#e8c23a', '#8a95a3', '#e9d39a'];
  const RCOL = ['#c9532b', '#2f8a3f', '#8fd14f', '#f0c53a', '#8d98a6'];
  const hexPts = (r, cx, cy) => {
    const o = [];
    for (let k = 0; k < 6; k++) { const a = (-90 + 60 * k) * Math.PI / 180; o.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1)); }
    return o.join(' ');
  };
  const prng = seed => { let a = seed * 2654435761 >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; };

  const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="13" rx="9" ry="2.6" fill="#0d3a1a" opacity=".35"/><rect x="-1.7" y="6" width="3.4" height="7" fill="#5a3b1d"/><path d="M0-18 10-5H-10Z" fill="#1c6630"/><path d="M0-11 12.5 6h-25Z" fill="#25813a"/><path d="M0-18 10-5H3.5Z" fill="#4fb066" opacity=".55"/><path d="M0-11 12.5 6H4Z" fill="#4fb066" opacity=".4"/></g>`;
  const brick = (x, y) => `<g transform="translate(${x} ${y})"><rect width="16" height="8" rx="1.4" fill="#b8472a" stroke="#6e2412" stroke-width=".9"/><rect x="1.2" y="1" width="13.6" height="2.2" rx="1" fill="#e07a52" opacity=".7"/></g>`;
  const sheep = (x, y, s, f) => `<g transform="translate(${x} ${y}) scale(${f ? -s : s} ${s})"><ellipse cx="0" cy="9" rx="9" ry="2.2" fill="#2f6a1a" opacity=".3"/><rect x="-5.5" y="3" width="2" height="6" fill="#33333a"/><rect x="3" y="3" width="2" height="6" fill="#33333a"/><circle cx="-6" cy="-1" r="5.2" fill="#fff"/><circle cx="-1" cy="-4" r="5.6" fill="#fff"/><circle cx="4" cy="-1" r="5.4" fill="#fff"/><circle cx="-1" cy="2" r="5.2" fill="#f1f1f1"/><ellipse cx="9.5" cy="0" rx="3.6" ry="3.9" fill="#3a3a42"/><circle cx="10.6" cy="-1" r=".8" fill="#fff"/></g>`;
  const wheat = (x, y, s) => {
    let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
    for (let i = -2; i <= 2; i++) {
      const bx = i * 5, h = 20 - Math.abs(i) * 2;
      g += `<path d="M${bx * 0.5} 8 ${bx} ${-h + 8}" stroke="#a8761a" stroke-width="1.3" fill="none"/>`;
      for (let k = 0; k < 4; k++) { const yy = -h + 8 + k * 4; g += `<ellipse cx="${bx - 2}" cy="${yy + 1}" rx="1.6" ry="3" fill="#f6d65a" stroke="#a8761a" stroke-width=".5" transform="rotate(-25 ${bx - 2} ${yy + 1})"/><ellipse cx="${bx + 2}" cy="${yy + 1}" rx="1.6" ry="3" fill="#f6d65a" stroke="#a8761a" stroke-width=".5" transform="rotate(25 ${bx + 2} ${yy + 1})"/>`; }
      g += `<ellipse cx="${bx}" cy="${-h + 5}" rx="1.6" ry="3.2" fill="#f6d65a" stroke="#a8761a" stroke-width=".5"/>`;
    }
    return g + '</g>';
  };
  const peak = (x, y, w, h) => `<g transform="translate(${x} ${y})"><path d="M${-w} 0 0 ${-h} ${w} 0Z" fill="#7c8794"/><path d="M0 ${-h} ${w} 0H${w * 0.15}Z" fill="#5f6a77"/><path d="M0 ${-h} ${-w * 0.3} ${-h * 0.62} ${-w * 0.1} ${-h * 0.7} 0 ${-h * 0.55} ${w * 0.14} ${-h * 0.7} ${w * 0.3} ${-h * 0.62}Z" fill="#f4f7fa"/><path d="M0 ${-h} ${w * 0.3} ${-h * 0.62} ${w * 0.14} ${-h * 0.7} 0 ${-h * 0.55}Z" fill="#cfd8e2"/></g>`;

  function terrainArt(t, i) {
    const R = prng(i * 97 + 13), j = (a) => (R() - 0.5) * a;
    let s = '';
    if (t === 1) {
      const P = [[-24, -16], [0, -26], [24, -14], [-32, 6], [-8, -4], [16, 6], [32, 18], [-16, 22], [6, 28]];
      P.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => { s += pine(x + j(6), y + j(5), 0.78 + R() * 0.3); });
    } else if (t === 0) {
      s += `<ellipse cx="-14" cy="26" rx="34" ry="16" fill="#b44e1d"/><ellipse cx="22" cy="18" rx="30" ry="14" fill="#c2601f"/><ellipse cx="-4" cy="-18" rx="34" ry="14" fill="#cf7230" opacity=".7"/>`;
      s += `<path d="M-40 28Q-10 8 18 24T48 20" stroke="#8c3a12" stroke-width="1.6" fill="none" opacity=".6"/>`;
      [[-30, 10], [14, 18], [-6, -24]].forEach(([x, y]) => { s += brick(x + j(4), y) + brick(x + 17 + j(2), y) + brick(x + 8, y - 8); });
      s += brick(26, -10) + brick(-34, -14);
    } else if (t === 2) {
      for (let k = 0; k < 16; k++) { const x = (R() - 0.5) * 80, y = (R() - 0.5) * 80; s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l-2-5m2 5v-6m0 6 2-5" stroke="#4f9a2d" stroke-width="1.3" fill="none" stroke-linecap="round"/>`; }
      s += `<ellipse cx="-4" cy="26" rx="46" ry="12" fill="#6fb23b" opacity=".6"/>`;
      s += sheep(-22, -8, 1, 0) + sheep(18, -16, 0.9, 1) + sheep(8, 20, 1.05, 0) + sheep(-24, 24, 0.8, 1);
    } else if (t === 3) {
      for (let k = -4; k <= 4; k++) s += `<path d="M-50 ${k * 11 + 8}Q0 ${k * 11 - 8} 50 ${k * 11 + 8}" stroke="#c18b1c" stroke-width="2.2" fill="none" opacity=".55"/><path d="M-50 ${k * 11 + 12}Q0 ${k * 11 - 4} 50 ${k * 11 + 12}" stroke="#f9e08a" stroke-width="1.4" fill="none" opacity=".6"/>`;
      s += wheat(-22, 0, 0.95) + wheat(20, -10, 0.85) + wheat(10, 24, 0.9) + wheat(-14, -24, 0.7);
    } else if (t === 4) {
      s += peak(-26, 18, 24, 30) + peak(26, 22, 22, 26) + peak(0, 12, 32, 50) + peak(-4, 36, 16, 16);
    } else {
      s += `<path d="M-50 18Q-26 -6 0 14T50 8V60H-50Z" fill="#dcbf7d" opacity=".8"/><path d="M-50 -10Q-20 -26 8 -8T50 -14" stroke="#c9a85a" stroke-width="2" fill="none" opacity=".7"/><path d="M-44 30Q-14 12 16 30" stroke="#c9a85a" stroke-width="2" fill="none" opacity=".7"/>`;
      s += `<g transform="translate(18 -4)"><rect x="-3" y="-14" width="6" height="26" rx="3" fill="#4b8a3a" stroke="#2c5a22"/><path d="M-3 -2h-5v-7a2.5 2.5 0 0 1 5 0M3 2h5v-8a2.5 2.5 0 0 0-5 0" fill="none" stroke="#2c5a22" stroke-width="4" stroke-linecap="round"/><path d="M-3 -2h-5v-7a2.5 2.5 0 0 1 5 0M3 2h5v-8a2.5 2.5 0 0 0-5 0" fill="none" stroke="#4b8a3a" stroke-width="2.4" stroke-linecap="round"/></g>`;
      s += `<circle cx="-24" cy="-8" r="3" fill="#bfa163"/><circle cx="-14" cy="20" r="2.2" fill="#bfa163"/>`;
    }
    return s;
  }

  function defsSVG() {
    const g = (id, a, b) => `<linearGradient id="ct-g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    return `<defs>${g(0, '#e08a46', '#b24d1c')}${g(1, '#3f9a4a', '#1c5e2b')}${g(2, '#b3e06a', '#7ab945')}${g(3, '#f6d96b', '#dcab2a')}${g(4, '#a9b3be', '#6f7a87')}${g(5, '#f3e1ae', '#dcc080')}
<radialGradient id="ct-sea" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#3f9ac8"/><stop offset="1" stop-color="#1d6a9c"/></radialGradient>
<radialGradient id="ct-tok" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff6dd"/><stop offset="1" stop-color="#e9d7a4"/></radialGradient>
<clipPath id="ct-clip"><polygon points="${hexPts(SC - 1.5, 0, 0)}"/></clipPath>
<filter id="ct-sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".45"/></filter>
<filter id="ct-sh2" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#04182a" flood-opacity=".55"/></filter></defs>`;
  }

  const ICONS = [
    '<rect x="1.5" y="3" width="10.5" height="5.6" rx="1" fill="#d4603a" stroke="#6e2412"/><rect x="13" y="3" width="9.5" height="5.6" rx="1" fill="#d4603a" stroke="#6e2412"/><rect x="1.5" y="9.7" width="5.2" height="5.6" rx="1" fill="#c9532b" stroke="#6e2412"/><rect x="7.8" y="9.7" width="10.5" height="5.6" rx="1" fill="#d4603a" stroke="#6e2412"/><rect x="19.4" y="9.7" width="3.2" height="5.6" rx="1" fill="#c9532b" stroke="#6e2412"/><rect x="1.5" y="16.4" width="10.5" height="5.6" rx="1" fill="#c9532b" stroke="#6e2412"/><rect x="13" y="16.4" width="9.5" height="5.6" rx="1" fill="#d4603a" stroke="#6e2412"/>',
    '<rect x="2" y="12" width="17" height="8" rx="2.5" fill="#8b5a2b" stroke="#4a2c10"/><circle cx="19" cy="16" r="4" fill="#e0b070" stroke="#4a2c10"/><circle cx="19" cy="16" r="2" fill="none" stroke="#9a6a30" stroke-width=".8"/><rect x="4" y="3.5" width="15" height="8" rx="2.5" fill="#9c6a35" stroke="#4a2c10"/><circle cx="19" cy="7.5" r="4" fill="#e8bd80" stroke="#4a2c10"/><circle cx="19" cy="7.5" r="1.8" fill="none" stroke="#9a6a30" stroke-width=".8"/>',
    '<rect x="6" y="18" width="2.2" height="4.5" fill="#3a3a42"/><rect x="14" y="18" width="2.2" height="4.5" fill="#3a3a42"/><circle cx="6" cy="12" r="4.6" fill="#fff" stroke="#8a8a96" stroke-width=".8"/><circle cx="11" cy="8.5" r="5" fill="#fff" stroke="#8a8a96" stroke-width=".8"/><circle cx="16" cy="12" r="4.8" fill="#fff" stroke="#8a8a96" stroke-width=".8"/><circle cx="11" cy="14.5" r="5" fill="#f4f4f4" stroke="#8a8a96" stroke-width=".8"/><ellipse cx="19.5" cy="14" rx="3" ry="3.5" fill="#3a3a42"/>',
    '<path d="M12 22V6" stroke="#9a6a14" stroke-width="1.5"/><g fill="#f4cd4a" stroke="#9a6a14" stroke-width=".7"><ellipse cx="12" cy="3.6" rx="1.8" ry="2.8"/><ellipse cx="8.8" cy="7.5" rx="1.9" ry="3" transform="rotate(-28 8.8 7.5)"/><ellipse cx="15.2" cy="7.5" rx="1.9" ry="3" transform="rotate(28 15.2 7.5)"/><ellipse cx="8.4" cy="12.5" rx="1.9" ry="3" transform="rotate(-28 8.4 12.5)"/><ellipse cx="15.6" cy="12.5" rx="1.9" ry="3" transform="rotate(28 15.6 12.5)"/><ellipse cx="8" cy="17.5" rx="1.9" ry="3" transform="rotate(-28 8 17.5)"/><ellipse cx="16" cy="17.5" rx="1.9" ry="3" transform="rotate(28 16 17.5)"/></g>',
    '<path d="M2 19 5 9l6-5 7 4 4 8-8 4Z" fill="#8f99a6" stroke="#3f4752" stroke-linejoin="round"/><path d="M5 9l6-5 2 8-8 7Z" fill="#b8c1cc"/><path d="M11 4l7 4-5 4Z" fill="#a1abb8"/><path d="M13 12l5-4 4 8-8 4Z" fill="#6f7a87"/><path d="M5 9l8 3 1 11M13 12 11 4" stroke="#3f4752" stroke-width=".7" fill="none"/><path d="M17 3l.8 1.8L19.6 5l-1.8.8L17 7.6l-.8-1.8L14.4 5l1.8-.2Z" fill="#9fe2ff"/>'
  ];
  const ico = (r, z) => `<svg class="ct-i" viewBox="0 0 24 24" width="${z}" height="${z}" aria-hidden="true">${ICONS[r]}</svg>`;

  const DEVICONS = [
    '<path d="M4 13a8 8 0 0 1 16 0v7H4Z" fill="#a7b2c0" stroke="#3b4350" stroke-width="1.2"/><rect x="7" y="12" width="10" height="3.2" rx="1" fill="#2a2f38"/><path d="M12 5V3M9 4c2-3 4-3 6 0" stroke="#c0302a" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M4 13a8 8 0 0 1 4-6.5" stroke="#e7edf4" stroke-width="1.4" fill="none"/>',
    '<path d="M12 2l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 16.5 6.1 19.8l1.3-6.5L2.5 8.8 9.1 8Z" fill="#f4c430" stroke="#a87b05" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 5.2 13.8 9l4 .5" stroke="#fff3b0" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
    '<path d="M3 21 9 3h6l6 18Z" fill="#5d6571" stroke="#2c3138" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 5v3M12 11v3M12 17v3" stroke="#f4d03a" stroke-width="1.8" stroke-linecap="round"/><rect x="2" y="19" width="8" height="3" rx=".8" fill="#c9532b" stroke="#6e2412" stroke-width=".8" transform="rotate(-8 6 20)"/>',
    '<path d="M3 9c8-6 17-2 18 8-8 3-16 0-18-8Z" fill="#c58a45" stroke="#6a3f12" stroke-width="1.2"/><circle cx="17" cy="14" r="3" fill="#e5483a"/><circle cx="14" cy="17.2" r="2.6" fill="#f4cd4a"/><circle cx="19" cy="17.5" r="2.4" fill="#74c24a"/><path d="M5 9c3-1 6-1 9 1" stroke="#e8be80" stroke-width="1.1" fill="none"/>',
    '<ellipse cx="12" cy="18" rx="8" ry="3" fill="#d49a12" stroke="#7a5605" stroke-width="1"/><ellipse cx="12" cy="14.6" rx="8" ry="3" fill="#f2c230" stroke="#7a5605" stroke-width="1"/><ellipse cx="12" cy="11" rx="8" ry="3" fill="#f8d65a" stroke="#7a5605" stroke-width="1"/><ellipse cx="12" cy="7.6" rx="6.4" ry="2.6" fill="#f8d65a" stroke="#7a5605" stroke-width="1"/><path d="M12 4.6v6M10.4 6.2h2.6a1 1 0 0 1 0 1.8h-2" stroke="#7a5605" stroke-width="1" fill="none"/>'
  ];
  const dico = (t, z) => `<svg class="ct-i" viewBox="0 0 24 24" width="${z}" height="${z}" aria-hidden="true">${DEVICONS[t]}</svg>`;
  const UI_ICONS = {
    cards: '<rect x="3" y="6" width="10" height="14" rx="2" fill="#e8eef5" stroke="#5c6a7a" stroke-width="1.2" transform="rotate(-10 8 13)"/><rect x="10" y="4" width="10" height="14" rx="2" fill="#fff" stroke="#5c6a7a" stroke-width="1.2" transform="rotate(8 15 11)"/>',
    dev: '<rect x="4" y="3" width="16" height="18" rx="2.5" fill="#6b4fc4" stroke="#2e1f66" stroke-width="1.2"/><path d="M12 7l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.9-3.4 1.9.7-3.8-2.8-2.6 3.8-.5Z" fill="#ffe27a"/>',
    knight: '<path d="M4 13a8 8 0 0 1 16 0v7H4Z" fill="#a7b2c0" stroke="#3b4350" stroke-width="1.2"/><rect x="7" y="12" width="10" height="3.2" rx="1" fill="#2a2f38"/>',
    road: '<path d="M3 20 9 4h6l6 16Z" fill="#6a717d" stroke="#2c3138" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 6v3M12 12v3M12 18v2" stroke="#f4d03a" stroke-width="1.8" stroke-linecap="round"/>',
    crown: '<path d="M3 18 2 7l5 4 5-7 5 7 5-4-1 11Z" fill="#f4c430" stroke="#a87b05" stroke-width="1.2" stroke-linejoin="round"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3" fill="#aab6c4" stroke="#44505e" stroke-width="1.2"/><circle cx="9" cy="14" r="1.8" fill="#16212c"/><circle cx="15" cy="14" r="1.8" fill="#16212c"/><path d="M12 8V4" stroke="#44505e" stroke-width="1.6"/><circle cx="12" cy="3.4" r="1.6" fill="#e5483a"/>',
    house: '<path d="M4 20V10l8-7 8 7v10Z" fill="currentColor" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/>',
    city: '<path d="M2 21V8l5-4 5 4v3h9v10Z" fill="currentColor" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/>',
    trade: '<path d="M4 9h14l-4-4M20 15H6l4 4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9Z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9Z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    log: '<path d="M5 4h14v16H5Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    help: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.1 1-1.1 1.8M12 17v.1" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
    back: '<path d="M14 6l-6 6 6 6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const ui = (k, z, c) => `<svg class="ct-i" viewBox="0 0 24 24" width="${z}" height="${z}"${c ? ` style="color:${c}"` : ''} aria-hidden="true">${UI_ICONS[k]}</svg>`;

  const dieSVG = (n, col) => {
    const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] }[n] || [];
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="4" y="4" width="92" height="92" rx="20" fill="${col[0]}" stroke="${col[1]}" stroke-width="4"/><rect x="9" y="8" width="82" height="40" rx="16" fill="#fff" opacity=".28"/>${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${col[2]}"/>`).join('')}</svg>`;
  };
  const DICE_COL = [['#f4efe2', '#a89f88', '#b3261e'], ['#f3d247', '#a98a14', '#23201a']];

  function settleSVG(col, dark, city, z) {
    const body = city
      ? `<path d="M-12 8V-6l5.5-6L-1-6V-2H12V8Z" fill="${col}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/><path d="M-12 -6l5.5-6L-1-6" fill="#fff" opacity=".25"/><rect x="-9" y="-3" width="3" height="4" fill="${dark}" opacity=".55"/><rect x="3" y="1" width="3" height="4" fill="${dark}" opacity=".55"/><rect x="7.5" y="1" width="3" height="4" fill="${dark}" opacity=".55"/>`
      : `<path d="M-9 7V-3L0-12 9-3V7Z" fill="${col}" stroke="${dark}" stroke-width="2" stroke-linejoin="round"/><path d="M-9-3 0-12 9-3Z" fill="#fff" opacity=".28"/><rect x="-2.2" y="1" width="4.4" height="6" fill="${dark}" opacity=".55"/>`;
    return `<g transform="scale(${z})" filter="url(#ct-sh)">${body}</g>`;
  }
  const robberSVG = `<g filter="url(#ct-sh2)"><path d="M-8 14Q-9 3-4-3A6 6 0 1 1 4-3Q9 3 8 14Z" fill="#33343c" stroke="#0c0c10" stroke-width="1.6" stroke-linejoin="round"/><path d="M-4-3A6 6 0 0 1 0-10" stroke="#8a8c98" stroke-width="1.4" fill="none" opacity=".7"/><ellipse cx="0" cy="14" rx="9.5" ry="3" fill="#33343c" stroke="#0c0c10" stroke-width="1.4"/></g>`;

  function tokenSVG(num, cx, cy, i) {
    const red = num === 6 || num === 8, n = PIPS(num);
    let dots = '';
    for (let k = 0; k < n; k++) dots += `<circle cx="${(k - (n - 1) / 2) * 4.4}" cy="9.6" r="1.55" fill="${red ? '#c0211a' : '#3b2a14'}"/>`;
    return `<g class="ct-tk" data-h="${i}" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})"><g class="ct-tki"><circle r="17" fill="url(#ct-tok)" stroke="#8a6d3b" stroke-width="1.6" filter="url(#ct-sh)"/><circle r="14.2" fill="none" stroke="#c9b27a" stroke-width=".8"/><text y="${num > 9 ? 3.4 : 3.8}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="700" font-size="${num > 9 ? 15 : 17}" fill="${red ? '#c0211a' : '#2e2112'}">${num}</text>${dots}</g></g>`;
  }

  function boardSVG(hex, ports) {
    let sea = '', land = '', tok = '', pt = '';
    const ring = [];
    for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === 3) ring.push([q, r]);
    ring.forEach(([q, r]) => { sea += `<polygon points="${hexPts(SC - 1, SQ3 * (q + r / 2) * SC, 1.5 * r * SC)}" fill="#2a86b8" stroke="#4aa6d4" stroke-width="1.2" opacity=".55"/>`; });
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    ring.forEach(([q, r]) => { const x = SQ3 * (q + r / 2) * SC, y = 1.5 * r * SC; minx = Math.min(minx, x - SC * 0.87); maxx = Math.max(maxx, x + SC * 0.87); miny = Math.min(miny, y - SC); maxy = Math.max(maxy, y + SC); });
    hex.forEach((h, i) => {
      const H = HX[i], cx = H.x * SC, cy = H.y * SC;
      land += `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})"><polygon points="${hexPts(SC - 1.5, 0, 0)}" fill="url(#ct-g${h.t})"/><g clip-path="url(#ct-clip)">${terrainArt(h.t, i)}</g><polygon points="${hexPts(SC - 1.5, 0, 0)}" fill="none" stroke="#f2e4b8" stroke-width="3" stroke-linejoin="round" opacity=".92"/><polygon points="${hexPts(SC - 3.4, 0, 0)}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1"/></g>`;
      if (h.num) tok += tokenSVG(h.num, cx, cy, i);
    });
    TOPO.PS.forEach((P, k) => {
      const t = ports[k], e = EX[P.e], a = VX[e.a], b = VX[e.b];
      const px = P.x * SC, py = P.y * SC;
      [a, b].forEach(v => { pt += `<line x1="${(v.x * SC).toFixed(1)}" y1="${(v.y * SC).toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#4b3217" stroke-width="5.2" stroke-linecap="round"/><line x1="${(v.x * SC).toFixed(1)}" y1="${(v.y * SC).toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="#c99a5b" stroke-width="3" stroke-linecap="round"/>`; });
      const lab = t === 5 ? '3:1' : '2:1';
      pt += `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})" filter="url(#ct-sh2)"><circle r="19.5" fill="#f4e6c2" stroke="#6e4a1e" stroke-width="2.4"/><circle r="16" fill="${t === 5 ? '#fff7e0' : RCOL[t]}" stroke="#6e4a1e" stroke-width="1" opacity="${t === 5 ? 1 : 0.28}"/>${t === 5 ? `<text y="5.5" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="15" fill="#2a1d0c">${lab}</text><text y="-6" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="6.4" fill="#7a5a2a" letter-spacing=".5">ANY</text>` : `<g transform="translate(-9.5 -15) scale(.8)">${ICONS[t]}</g><text y="12.6" text-anchor="middle" font-family="Georgia,serif" font-weight="800" font-size="11" fill="#2a1d0c">${lab}</text>`}</g>`;
    });
    const vb = [(minx - 6).toFixed(0), (miny - 6).toFixed(0), (maxx - minx + 12).toFixed(0), (maxy - miny + 12).toFixed(0)];
    return { vb, html: defsSVG() + `<g class="ct-sea">${sea}</g><g class="ct-ports">${pt}</g><g class="ct-land">${land}</g><g class="ct-toks">${tok}</g>` };
  }

  const css = () => `
.gm-catan{gap:0;--ct-ink:#eaf2f8;--ct-dim:#9db4c6;--ct-glass:rgba(9,28,46,.82);--ct-line:rgba(255,255,255,.14);--ct-gold:#f4c430}
.gm-catan [hidden]{display:none!important}
.gm-catan button{font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;color:inherit}
.gm-catan .ct-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;background:#0b2238;box-shadow:0 12px 34px rgba(5,22,38,.4);color:var(--ct-ink);font-family:var(--sans);touch-action:manipulation}
.gm-catan .ct-stage{position:absolute;left:0;top:0;transform-origin:0 0;font-size:14px;line-height:1.25}
.gm-catan .ct-i{display:block;flex:none;overflow:visible}
.gm-catan .ct-board{position:absolute;overflow:hidden;background:radial-gradient(ellipse at 50% 46%,#2c86b6 0%,#1d6797 52%,#134a73 100%);border-radius:14px}
.gm-catan .ct-board svg.ct-svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-catan .ct-land .ct-tk{transition:opacity .3s}
.gm-catan .ct-tk.hit .ct-tki circle:first-child{animation:ct-tokhit .9s ease-out}
@keyframes ct-tokhit{0%{stroke:#fff;stroke-width:1.6}30%{stroke:#ffe27a;stroke-width:7}100%{stroke:#8a6d3b;stroke-width:1.6}}
.gm-catan .ct-tk.hit .ct-tki{animation:ct-tokpop .9s ease-out;transform-box:fill-box;transform-origin:center}
@keyframes ct-tokpop{0%{transform:scale(1)}25%{transform:scale(1.35)}100%{transform:scale(1)}}
.gm-catan .ct-pc.pop{animation:ct-pop .42s cubic-bezier(.2,1.5,.4,1) both;transform-box:fill-box;transform-origin:50% 100%}
@keyframes ct-pop{0%{transform:scale(.1);opacity:0}100%{transform:scale(1);opacity:1}}
.gm-catan .ct-rd.pop{animation:ct-rdpop .4s ease-out both}
@keyframes ct-rdpop{0%{stroke-width:0;opacity:0}100%{opacity:1}}
.gm-catan .ct-robber{transition:transform .6s cubic-bezier(.3,1.4,.5,1)}
.gm-catan .ct-hl{cursor:pointer}
.gm-catan .ct-hl .ring{fill:rgba(255,255,255,.28);stroke:#fff;stroke-width:3;animation:ct-hlp 1.1s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
.gm-catan .ct-hl:hover .ring{fill:rgba(255,226,122,.7);stroke:#ffe27a}
@keyframes ct-hlp{from{opacity:.65;transform:scale(.88)}to{opacity:1;transform:scale(1.1)}}
.gm-catan .ct-hl.edge .ring{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;opacity:.78;animation:ct-hle 1s ease-in-out infinite alternate}
.gm-catan .ct-hl.edge:hover .ring{stroke:#ffe27a;opacity:1}
@keyframes ct-hle{from{opacity:.4}to{opacity:.9}}
.gm-catan .ct-hl.hex .ring{fill:rgba(255,255,255,.12);stroke:#fff;stroke-width:4;stroke-dasharray:10 7;animation:none}
.gm-catan .ct-hl.hex:hover .ring{fill:rgba(20,20,26,.45);stroke:#ffe27a}
.gm-catan .ct-ghost{pointer-events:none;opacity:.6}
.gm-catan .ct-glass{background:var(--ct-glass);border:1px solid var(--ct-line);border-radius:14px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.gm-catan .ct-bankbox{position:absolute;padding:6px 6px 5px;display:flex;flex-direction:column;gap:2px;align-items:stretch}
.gm-catan .ct-bankbox b{font:900 9.5px var(--sans);letter-spacing:.14em;color:var(--ct-dim);text-align:center;margin-bottom:1px}
.gm-catan .ct-bankbox span{display:flex;align-items:center;gap:5px;font:800 13px var(--sans);font-variant-numeric:tabular-nums;padding:1px 3px;border-radius:7px}
.gm-catan .ct-bankbox span.low{color:#ff9a8a}
.gm-catan .ct-bankbox span.zero{color:#ff6b57;opacity:.7}
.gm-catan .ct-awards{position:absolute;display:flex;flex-direction:column;gap:5px;width:84px}
.gm-catan .ct-aw{padding:5px 6px;text-align:center;font:800 10px/1.15 var(--sans);letter-spacing:.04em;color:var(--ct-dim)}
.gm-catan .ct-aw b{display:block;font:900 12px var(--sans);color:#fff;letter-spacing:0;margin-top:2px}
.gm-catan .ct-aw .ct-i{margin:0 auto 2px}
.gm-catan .ct-aw.on{border-color:var(--c);box-shadow:0 0 0 1px var(--c),0 0 14px -2px var(--c)}
.gm-catan .ct-dice{position:absolute;display:flex;gap:8px;align-items:center;padding:8px 10px;transition:transform .2s}
.gm-catan .ct-die{width:50px;height:50px;filter:drop-shadow(0 4px 4px rgba(0,0,0,.4))}
.gm-catan .ct-die svg{width:100%;height:100%;display:block}
.gm-catan .ct-die.roll{animation:ct-roll .22s linear infinite}
@keyframes ct-roll{0%{transform:rotate(0) translateY(0)}25%{transform:rotate(90deg) translateY(-8px)}50%{transform:rotate(180deg) translateY(0)}75%{transform:rotate(270deg) translateY(-6px)}100%{transform:rotate(360deg) translateY(0)}}
.gm-catan .ct-die.land{animation:ct-dland .35s cubic-bezier(.2,1.6,.4,1)}
@keyframes ct-dland{0%{transform:scale(1.5) rotate(25deg)}100%{transform:none}}
.gm-catan .ct-sum{min-width:34px;text-align:center;font:900 28px var(--sans);letter-spacing:-.02em}
.gm-catan .ct-sum.seven{color:#ff7a6a}
.gm-catan .ct-side{position:absolute;display:flex;flex-direction:column;gap:7px}
.gm-catan .ct-players{position:absolute;display:flex;flex-direction:column;gap:6px;flex:none}
.gm-catan .ct-pl{position:relative;display:grid;grid-template-columns:46px 1fr auto;grid-template-rows:auto auto;column-gap:10px;align-items:center;padding:7px 10px 7px 8px;border-left:5px solid var(--c);transition:box-shadow .3s,background .3s}
.gm-catan .ct-pl.turn{background:linear-gradient(90deg,rgba(255,255,255,.16),rgba(9,28,46,.82) 70%);box-shadow:0 0 0 2px var(--c),0 6px 18px -6px var(--c)}
.gm-catan .ct-pl.out{opacity:.6}
.gm-catan .ct-av{grid-row:1/3;width:44px;height:44px;border-radius:50%;background:var(--c);border:3px solid var(--d);display:grid;place-items:center;font:900 18px var(--sans);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);position:relative}
.gm-catan .ct-av.w{color:#2d2a22;text-shadow:none}
.gm-catan .ct-av .ct-i{filter:drop-shadow(0 1px 1px rgba(0,0,0,.4))}
.gm-catan .ct-av .dot{position:absolute;right:-3px;bottom:-3px;width:16px;height:16px;border-radius:50%;background:#16293a;border:1.5px solid rgba(255,255,255,.35);display:grid;place-items:center}
.gm-catan .ct-nm{display:flex;align-items:center;gap:6px;font:800 15px var(--sans);min-width:0}
.gm-catan .ct-nm span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-catan .ct-nm em{font:900 9px var(--sans);font-style:normal;letter-spacing:.1em;padding:2px 5px;border-radius:6px;background:rgba(255,255,255,.16);color:#fff}
.gm-catan .ct-nm .think{font:800 11px var(--sans);color:var(--ct-dim)}
.gm-catan .ct-stats{display:flex;gap:9px;align-items:center;font:800 13px var(--sans);font-variant-numeric:tabular-nums;color:#dbe8f2}
.gm-catan .ct-stats span{display:flex;align-items:center;gap:3px}
.gm-catan .ct-stats .lr,.gm-catan .ct-stats .la{padding:1px 5px 1px 3px;border-radius:7px;background:rgba(244,196,48,.18);color:#ffe6a0;font-size:11px}
.gm-catan .ct-vp{grid-row:1/3;grid-column:3;width:42px;height:46px;display:grid;place-items:center;font:900 22px var(--sans);color:#3a2a05;background:linear-gradient(#ffe48a,#e8a915);clip-path:polygon(50% 0,100% 12%,100% 62%,50% 100%,0 62%,0 12%);padding-bottom:3px}
.gm-catan .ct-log{position:absolute;min-height:0;overflow:auto;padding:8px 10px;display:flex;flex-direction:column;gap:3px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent}
.gm-catan .ct-log p{margin:0;font:600 13px/1.35 var(--sans);color:#cfdeea}
.gm-catan .ct-log p b{font-weight:800;color:var(--c,#fff)}
.gm-catan .ct-log p.sys{color:#8fb0c8;font-style:italic}
.gm-catan .ct-log p.big{color:#ffe27a;font-weight:800}
.gm-catan .ct-log p .ct-i{display:inline-block;vertical-align:-4px;margin:0 1px}
.gm-catan .ct-stack>b{position:absolute;top:-8px;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:#0d2236;border:2px solid #fff;color:#fff;font:900 13px/18px var(--sans);text-align:center;z-index:5}
.gm-catan .ct-bar{position:absolute;display:block;border-radius:14px}
.gm-catan .ct-hint{position:absolute;left:14px;right:14px;top:6px;height:24px;display:flex;align-items:center;gap:8px;font:800 15px var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-catan .ct-hint i{width:10px;height:10px;border-radius:50%;background:var(--c,#aaa);flex:none;box-shadow:0 0 0 3px rgba(255,255,255,.12)}
.gm-catan .ct-hint.me i{animation:ct-blink 1s ease-in-out infinite}
@keyframes ct-blink{50%{opacity:.35}}
.gm-catan .ct-hint small{font:700 12px var(--sans);color:var(--ct-dim);margin-left:6px}
.gm-catan .ct-hand{position:absolute;display:flex;gap:6px;align-items:flex-end}
.gm-catan .ct-stack{position:relative;height:68px;flex:none}
.gm-catan .ct-rc{position:absolute;bottom:0;width:50px;height:68px;border-radius:8px;border:2px solid rgba(0,0,0,.35);box-shadow:0 2px 4px rgba(0,0,0,.35),inset 0 0 0 2px rgba(255,255,255,.35);display:grid;place-items:center;transition:transform .2s}
.gm-catan .ct-rc.r0{background:linear-gradient(160deg,#e8855a,#b04526)}
.gm-catan .ct-rc.r1{background:linear-gradient(160deg,#58b062,#25702f)}
.gm-catan .ct-rc.r2{background:linear-gradient(160deg,#c6ec84,#7ec24a)}
.gm-catan .ct-rc.r3{background:linear-gradient(160deg,#f9e07d,#d9a420)}
.gm-catan .ct-rc.r4{background:linear-gradient(160deg,#bfc8d2,#76818e)}
.gm-catan .ct-rc .ct-i{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
.gm-catan .ct-rc b{position:absolute;right:-6px;top:-8px;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:#0d2236;border:2px solid #fff;color:#fff;font:900 13px/18px var(--sans);text-align:center}
.gm-catan .ct-stack:hover .ct-rc:last-child{transform:translateY(-4px)}
.gm-catan .ct-empty{color:var(--ct-dim);font:700 13px var(--sans);align-self:center}
.gm-catan .ct-devs{position:absolute;display:flex;gap:4px;align-items:flex-end}
.gm-catan .ct-dc{position:relative;flex:none;width:46px;height:68px;border-radius:8px;border:2px solid #2e1f66;background:linear-gradient(160deg,#8467da,#4a328f);box-shadow:0 2px 4px rgba(0,0,0,.35),inset 0 0 0 2px rgba(255,255,255,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;color:#fff;transition:transform .2s,filter .2s}
.gm-catan .ct-dc span{font:800 9.5px/1.05 var(--sans);text-align:center;padding:0 2px;text-shadow:0 1px 1px rgba(0,0,0,.5)}
.gm-catan .ct-dc.no{filter:grayscale(.55) brightness(.7)}
.gm-catan .ct-dc.ok{box-shadow:0 0 0 2px #ffe27a,0 0 14px 1px rgba(255,226,122,.6),inset 0 0 0 2px rgba(255,255,255,.28)}
.gm-catan .ct-dc.ok:hover{transform:translateY(-5px)}
.gm-catan .ct-dc.vp{background:linear-gradient(160deg,#e8bb3a,#a8780e);border-color:#6a4a05}
.gm-catan .ct-dc b{position:absolute;left:-5px;top:-8px;min-width:20px;height:20px;padding:0 4px;border-radius:10px;background:#0d2236;border:2px solid #fff;font:900 12px/16px var(--sans);text-align:center}
.gm-catan .ct-dc em{position:absolute;left:-2px;bottom:-2px;font:900 8px var(--sans);font-style:normal;background:#0d2236;color:#ffe27a;padding:1px 4px;border-radius:5px;border:1px solid rgba(255,255,255,.4);letter-spacing:.06em}
.gm-catan .ct-act{position:absolute;display:flex;gap:5px;align-items:stretch;justify-content:flex-start}
.gm-catan .ct-prim{flex:none;width:104px;border:0;border-radius:14px;color:#fff;font:900 17px/1.05 var(--sans);letter-spacing:.2px;text-shadow:0 2px 0 rgba(0,0,0,.28);background:linear-gradient(#3fcf6d,#1f9a46);box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),0 6px 14px rgba(0,0,0,.3);padding:4px 6px}
.gm-catan .ct-prim.end{background:linear-gradient(#f0964a,#d1661a)}
.gm-catan .ct-prim.pulse{animation:ct-pulse .8s ease-in-out infinite alternate}
@keyframes ct-pulse{from{transform:scale(1)}to{transform:scale(1.06)}}
.gm-catan .ct-prim:disabled{filter:grayscale(.8) brightness(.7);animation:none;cursor:default}
.gm-catan .ct-prim:active:not(:disabled){transform:translateY(2px)}
.gm-catan .ct-bb{position:relative;flex:none;width:54px;border-radius:12px;border:2px solid var(--ct-line);background:rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:3px 2px;font:800 11px var(--sans);color:#fff;transition:transform .15s,background .2s,border-color .2s}
.gm-catan .ct-bb:hover:not(:disabled){background:rgba(255,255,255,.18);transform:translateY(-2px)}
.gm-catan .ct-bb.on{border-color:#ffe27a;background:rgba(255,226,122,.22)}
.gm-catan .ct-bb:disabled{opacity:.42;cursor:default}
.gm-catan .ct-bb .cs{display:flex;gap:1.5px;flex-wrap:wrap;justify-content:center;max-width:50px;min-height:7px}
.gm-catan .ct-bb .cs i{width:7px;height:7px;border-radius:2px;border:1px solid rgba(0,0,0,.4)}
.gm-catan .ct-bb .vpb{position:absolute;top:-6px;right:-5px;padding:0 5px;height:16px;border-radius:8px;background:#f4c430;color:#3a2a05;font:900 10px/16px var(--sans)}
.gm-catan .ct-pane{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;padding:14px;background:rgba(5,18,32,.62);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.gm-catan .ct-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none;pointer-events:none}
.gm-catan .ct-pane.clear>*{pointer-events:auto}
.gm-catan .ct-pane.top{align-items:flex-start;padding-top:70px}
.gm-catan .ct-box{width:100%;max-width:560px;max-height:100%;overflow:auto;background:linear-gradient(#1b3a58,#0f2539);border:2px solid rgba(255,255,255,.16);border-radius:20px;padding:18px 20px 16px;text-align:center;box-shadow:0 22px 50px rgba(0,0,0,.5);animation:ct-in .32s cubic-bezier(.2,1.4,.4,1);scrollbar-width:thin}
@keyframes ct-in{from{transform:scale(.92) translateY(10px);opacity:0}to{transform:none;opacity:1}}
.gm-catan .ct-box h3{margin:0 0 6px;font:900 24px var(--sans);letter-spacing:.2px}
.gm-catan .ct-box p{margin:6px 0;font:600 14px/1.45 var(--sans);color:#cfdeea}
.gm-catan .ct-kick{font:900 11px var(--sans)!important;letter-spacing:.16em;text-transform:uppercase;color:#ffe27a!important;margin:0 0 4px!important}
.gm-catan .ct-big{display:block;width:100%;min-height:52px;margin:8px 0;border:0;border-radius:16px;color:#fff;font:900 19px/1.1 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 12px}
.gm-catan .ct-big small{display:block;font:700 12px var(--sans);opacity:.85;text-shadow:none;margin-top:2px}
.gm-catan .ct-big:active{transform:translateY(2px)}
.gm-catan .ct-big.g{background:linear-gradient(#3fcf6d,#1f9a46)}
.gm-catan .ct-big.o{background:linear-gradient(#f0964a,#d1661a)}
.gm-catan .ct-big.b{background:linear-gradient(#4a9af0,#1f62bd)}
.gm-catan .ct-big.x{background:linear-gradient(#5b6b7c,#37424e)}
.gm-catan .ct-big:disabled{filter:grayscale(.8) brightness(.7);cursor:default}
.gm-catan .ct-sm{min-height:40px;padding:0 16px;border-radius:12px;border:2px solid rgba(255,255,255,.26);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:3px}
.gm-catan .ct-sm:hover:not(:disabled){background:rgba(255,255,255,.2)}
.gm-catan .ct-sm:disabled{opacity:.4;cursor:default}
.gm-catan .ct-sm.pri{background:linear-gradient(#3fcf6d,#1f9a46);border-color:transparent}
.gm-catan .ct-sm.dng{background:linear-gradient(#e8604f,#b3281a);border-color:transparent}
.gm-catan .ct-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px;align-items:center}
.gm-catan .ct-opt{display:flex;align-items:center;gap:10px;margin:9px 0;text-align:left}
.gm-catan .ct-opt>span{flex:0 0 31%;font:800 14px/1.2 var(--sans);color:#dbe8f2}
.gm-catan .ct-opt>span small{display:block;font:600 11px var(--sans);color:var(--ct-dim);margin-top:1px}
.gm-catan .ct-seg{flex:1;display:flex;gap:4px}
.gm-catan .ct-seg button{flex:1;min-height:38px;border-radius:10px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);font:800 13px var(--sans);color:#cfdeea;padding:0 4px}
.gm-catan .ct-seg button.on{background:#ffe27a;border-color:#ffe27a;color:#2e2205}
.gm-catan .ct-logo{display:block;margin:0 auto 4px;width:250px;height:64px}
.gm-catan .ct-trade{display:flex;flex-direction:column;gap:8px;margin:10px 0}
.gm-catan .ct-tabs{display:flex;gap:6px;justify-content:center;margin-bottom:8px}
.gm-catan .ct-tabs button{min-height:36px;padding:0 18px;border-radius:18px;border:2px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);font:800 14px var(--sans)}
.gm-catan .ct-tabs button.on{background:#ffe27a;color:#2e2205;border-color:#ffe27a}
.gm-catan .ct-lab{font:900 11px var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ct-dim);text-align:left;margin:2px 2px 0}
.gm-catan .ct-tiles{display:flex;gap:7px;justify-content:center}
.gm-catan .ct-tile{position:relative;width:76px;border-radius:12px;border:2px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 3px 5px;font:800 12px var(--sans)}
.gm-catan .ct-tile.sel{border-color:#ffe27a;background:rgba(255,226,122,.2)}
.gm-catan .ct-tile.dis{opacity:.4}
.gm-catan .ct-tile .have{color:var(--ct-dim);font:700 11px var(--sans)}
.gm-catan .ct-tile .pm{display:flex;align-items:center;gap:4px}
.gm-catan .ct-tile .pm button{width:26px;height:26px;border-radius:50%;border:0;background:rgba(255,255,255,.2);font:900 17px/26px var(--sans);padding:0}
.gm-catan .ct-tile .pm button:disabled{opacity:.3}
.gm-catan .ct-tile .pm b{min-width:18px;font:900 17px var(--sans)}
.gm-catan .ct-tile .rate{font:900 14px var(--sans);color:#ffe27a}
.gm-catan .ct-tp{position:absolute;z-index:12;width:470px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;animation:ct-in .3s cubic-bezier(.2,1.4,.4,1)}
.gm-catan .ct-tp h4{margin:0;font:900 14px var(--sans);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gm-catan .ct-offer{display:flex;align-items:center;justify-content:center;gap:10px}
.gm-catan .ct-chips{display:flex;gap:4px;flex-wrap:wrap;align-items:center;justify-content:center;min-height:30px;padding:3px 6px;border-radius:10px;background:rgba(255,255,255,.08)}
.gm-catan .ct-chip{display:flex;align-items:center;gap:2px;font:900 15px var(--sans);padding:1px 5px 1px 2px;border-radius:7px;background:rgba(0,0,0,.28)}
.gm-catan .ct-arrow{color:var(--ct-dim);font:900 18px var(--sans)}
.gm-catan .ct-resp{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.gm-catan .ct-rp{display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:10px;background:rgba(255,255,255,.08);border-left:4px solid var(--c);font:700 12px var(--sans)}
.gm-catan .ct-rp.yes{background:rgba(63,207,109,.2)}
.gm-catan .ct-rp.no{opacity:.55}
.gm-catan .ct-rp button{min-height:28px;padding:0 10px;border-radius:9px;border:0;font:800 12px var(--sans);background:#3fcf6d;color:#06210f}
.gm-catan .ct-fx{position:absolute;inset:0;pointer-events:none;z-index:25;overflow:hidden}
.gm-catan .ct-fxc{position:absolute;left:0;top:0;width:34px;height:44px;margin:-22px 0 0 -17px;border-radius:6px;border:2px solid rgba(0,0,0,.35);display:grid;place-items:center;box-shadow:0 3px 8px rgba(0,0,0,.4);will-change:transform}
.gm-catan .ct-toast{position:absolute;left:50%;top:14px;z-index:40;transform:translate(-50%,-10px);padding:8px 16px;border-radius:20px;background:rgba(10,24,38,.92);border:1px solid var(--ct-line);font:800 14px var(--sans);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;white-space:nowrap;max-width:94%;overflow:hidden;text-overflow:ellipsis}
.gm-catan .ct-toast.show{opacity:1;transform:translate(-50%,0)}
.gm-catan .ct-net{position:absolute;z-index:11;display:flex;align-items:center;gap:6px;padding:3px 9px;border-radius:12px;background:rgba(0,0,0,.35);font:800 11px var(--sans)}
.gm-catan .ct-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-catan .ct-net.bad i{background:#ff5b4b}
.gm-catan .ct-tools{position:absolute;z-index:11;display:flex;gap:6px}
.gm-catan .ct-ib{width:36px;height:36px;border-radius:11px;border:1.5px solid var(--ct-line);background:rgba(9,28,46,.7);display:grid;place-items:center;padding:0;color:#fff}
.gm-catan .ct-ib:hover{background:rgba(255,255,255,.2)}
.gm-catan .ct-vs{width:100%;border-collapse:collapse;margin:8px 0;font:700 13px var(--sans)}
.gm-catan .ct-vs th{font:900 9.5px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--ct-dim);padding:3px 2px}
.gm-catan .ct-vs td{padding:6px 2px;border-top:1px solid var(--ct-line);text-align:center}
.gm-catan .ct-vs td:first-child{text-align:left;font-weight:800}
.gm-catan .ct-vs tr.win td{background:rgba(244,196,48,.16)}
.gm-catan .ct-vs td.t{font:900 18px var(--sans);color:#ffe27a}
.gm-catan .ct-help{text-align:left;font:600 13px/1.5 var(--sans);color:#cfdeea}
.gm-catan .ct-help h4{margin:10px 0 3px;font:900 14px var(--sans);color:#ffe27a}
.gm-catan .ct-help ul{margin:2px 0 4px;padding-left:18px}
.gm-catan .ct-help kbd{font:800 11px var(--sans);padding:1px 6px;border-radius:5px;background:rgba(255,255,255,.16)}
.gm-catan .ct-costs{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0;justify-content:center}
.gm-catan .ct-costs div{display:flex;align-items:center;gap:5px;font:800 12px var(--sans)}
.gm-catan .ct-pickrow{display:flex;gap:8px;justify-content:center;margin:10px 0}
.gm-catan .ct-pick{width:84px;padding:8px 4px 6px;border-radius:14px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);font:800 12px var(--sans);display:flex;flex-direction:column;align-items:center;gap:4px}
.gm-catan .ct-pick:hover:not(:disabled){background:rgba(255,255,255,.2)}
.gm-catan .ct-pick.sel{border-color:#ffe27a;background:rgba(255,226,122,.22)}
.gm-catan .ct-pick:disabled{opacity:.35}
.gm-catan .ct-vict{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px 0}
.gm-catan .ct-vc{min-width:116px;padding:10px 12px;border-radius:14px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);border-left:6px solid var(--c);display:flex;align-items:center;gap:8px;font:800 14px var(--sans)}
.gm-catan .ct-vc:hover{background:rgba(255,255,255,.2)}
.gm-catan .port .ct-pl{grid-template-columns:30px 1fr;grid-template-rows:auto auto auto;padding:5px 6px 5px 5px;border-left-width:4px;column-gap:6px;row-gap:1px}
.gm-catan .port .ct-av{width:28px;height:28px;font-size:13px;border-width:2px;grid-row:1/3}
.gm-catan .port .ct-nm{font-size:12px;gap:3px}
.gm-catan .port .ct-nm em,.gm-catan .port .ct-nm .think{display:none}
.gm-catan .port .ct-stats{grid-column:1/3;gap:5px;font-size:11px;flex-wrap:nowrap}
.gm-catan .port .ct-stats .lr,.gm-catan .port .ct-stats .la{padding:0 3px;font-size:9px}
.gm-catan .port .ct-vp{position:absolute;right:4px;top:4px;width:28px;height:31px;font-size:15px;grid:none}
.gm-catan .port .ct-players{flex-direction:row;gap:5px}
.gm-catan .port .ct-pl{flex:1;min-width:0}
.gm-catan .port .ct-log{padding:3px 10px;overflow:hidden}
.gm-catan .port .ct-log p{display:none}
.gm-catan .port .ct-log p:last-child{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-catan .port .ct-tp{width:496px}
.gm-catan .port .ct-box{max-width:480px}
.gm-catan .port .ct-tile{width:64px}
.gm-catan .port .ct-tiles{gap:5px}
.gm-catan .ct-aw small{display:block;font:700 9.5px var(--sans);color:var(--ct-dim);margin-top:1px;letter-spacing:0}
.gm-catan .ct-note{font:600 12px var(--sans)!important;color:var(--ct-dim)!important;margin:2px 0!important}
.gm-catan .ct-pick .rate{font:900 14px var(--sans);color:#ffe27a}
.gm-catan .ct-pick .sub{font:700 11px var(--sans);color:var(--ct-dim)}
.gm-catan .ct-dc:hover{z-index:3}
.gm-catan .ct-offer .ct-lab{text-align:center}
.gm-catan .ct-box .ct-log{position:static;display:flex}
.gm-catan .ct-rp b{color:var(--c)}
.gm-catan .ct-tp .ct-row{margin-top:2px}
.gm-catan .port .ct-bb{width:58px}
.gm-catan .port .ct-prim{width:108px}
.gm-catan .port .ct-hint{font-size:16px}
.gm-catan p .ct-chip{display:inline-flex;vertical-align:middle;margin:0 2px}
`;

  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const BOTN = ['Ada', 'Marco', 'Lena', 'Theo', 'Nora', 'Kai', 'Iris', 'Hugo', 'Maya', 'Leo'];
  const LVLN = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
  const sxOf = V => ({ vtx: V.vtx.map(b => b ? { p: b[0], c: b[1] } : null), road: V.road, ports: V.ports });
  const resIco = (r, n, z) => { let s = ''; for (let i = 0; i < Math.min(n, 8); i++) s += ico(r, z || 16); return s; };
  const chips = (v, z) => { const o = []; v.forEach((n, r) => { if (n) o.push(`<span class="ct-chip">${ico(r, z || 20)}${n}</span>`); }); return o.join('') || '<span class="ct-chip">-</span>'; };
  const costDots = c => c.map((n, r) => { let s = ''; for (let i = 0; i < n; i++) s += `<i style="background:${RCOL[r]}"></i>`; return s; }).join('');
  const LOGO = `<svg class="ct-logo" viewBox="0 0 250 64"><defs><linearGradient id="ct-lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset="1" stop-color="#f0a52a"/></linearGradient></defs><g transform="translate(6 6)"><polygon points="26,0 50,13 50,39 26,52 2,39 2,13" fill="#d9822b" stroke="#7a3f0c" stroke-width="3" stroke-linejoin="round"/><polygon points="26,9 41,17 41,35 26,43 11,35 11,17" fill="#2d7a3a" stroke="#14451d" stroke-width="2"/><path d="M26 15l8 7v10H18V22Z" fill="#f3efe4" stroke="#7d765f" stroke-width="1.6" stroke-linejoin="round"/></g><text x="62" y="46" font-family="Georgia,'Times New Roman',serif" font-weight="900" font-size="42" letter-spacing="2" fill="url(#ct-lg)" stroke="#6b3a0a" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">CATAN</text></svg>`;
  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="32,6 54,19 54,45 32,58 10,45 10,19"/><polygon points="32,16 45,23 45,41 32,48 19,41 19,23"/><path d="M32 22l7 6v9H25v-9Z"/></svg>';

  Ameplay.register({
    id: 'catan', title: 'Catan', category: 'Board', tint: '#d9822b',
    blurb: 'Settle the island, trade with rivals and race to 10 victory points. Smart bots, harbours, development cards and online play for 3 to 4.',
    help: 'Click the glowing spots to build &middot; <kbd>Space</kbd> roll / end turn &middot; <kbd>R</kbd> road &middot; <kbd>S</kbd> settlement &middot; <kbd>C</kbd> city &middot; <kbd>D</kbd> development card &middot; <kbd>T</kbd> trade',
    width: 1100,
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: ICON,
    _t: { Game, aiAct, genBoard, roadLen, TOPO, filt, ratesFor, legalSettle, legalRoad, canSettle, canRoad, PIPS },
    css: css(),
    mount(root, api) {
      const sv = Object.assign({ wins: 0, played: 0, opt: {} }, api.load() || {});
      const opt = Object.assign({ n: 4, lvl: 'normal', goal: 10, board: 'random', fast: 0 }, sv.opt);
      const saveAll = () => api.save({ wins: sv.wins, played: sv.played, opt });
      const M = { role: 'local', seat: 0, eng: null, names: [], bot: [], pids: [], players: [], tok: 0, bots: false, size: 4, bt: 0, tt: 0, speed: 1, hooked: false, lvl: 'normal', fails: 0, over: false, started: false };
      const S = { V: null, hex: null, ports: null, prev: { road: [], vtx: [] }, mode: null, dlg: null, tr: null, dc: [0, 0, 0, 0, 0], busy: false, robAt: -1, ghost: null, pend: false, tmark: 0, seenOver: false, logHtml: [], lastTurn: -1, sample: null, K: 1, port: null, ps: [0, 0, 0, 0, 0] };
      const Q = [];

      const wrap = el('div', 'ct-wrap'), stage = el('div', 'ct-stage');
      const boardEl = el('div', 'ct-board'), svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'ct-svg'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      const bankEl = el('div', 'ct-bankbox ct-glass'), awardEl = el('div', 'ct-awards'), diceEl = el('div', 'ct-dice ct-glass');
      boardEl.append(svg, bankEl, awardEl, diceEl);
      const playersEl = el('div', 'ct-players'), logEl = el('div', 'ct-log ct-glass');
      const barEl = el('div', 'ct-bar ct-glass'), hintEl = el('div', 'ct-hint'), handEl = el('div', 'ct-hand'), devEl = el('div', 'ct-devs'), actEl = el('div', 'ct-act');
      barEl.append(hintEl, handEl, devEl, actEl);
      const tpEl = el('div', 'ct-tp ct-glass'), fxEl = el('div', 'ct-fx'), paneEl = el('div', 'ct-pane'), toastEl = el('div', 'ct-toast');
      const netEl = el('div', 'ct-net', '<i></i><span></span>'), toolsEl = el('div', 'ct-tools');
      tpEl.hidden = true; paneEl.hidden = true; netEl.hidden = true;
      toolsEl.innerHTML = `<button class="ct-ib" data-a="log" title="Game log">${ui('log', 20)}</button><button class="ct-ib" data-a="help" title="How to play">${ui('help', 20)}</button><button class="ct-ib" data-a="menu" title="Menu">${ui('menu', 20)}</button>`;
      stage.append(boardEl, playersEl, logEl, barEl, tpEl, netEl, toolsEl, fxEl, paneEl, toastEl);
      wrap.append(stage); root.append(wrap);

      const LAY = {
        land: { W: 1100, H: 664, board: [0, 0, 780, 552], players: [790, 0, 310, 290], log: [790, 296, 310, 256], bar: [0, 560, 1100, 104], bank: [8, 8], awards: [696, 56], dice: [10, 464], tools: [668, 8], net: [96, 10], tp: [150, 0], hint: [14, 6], hand: [14, 32, 380, 70], devs: [400, 32, 186, 70], act: [592, 28, 410, 72] },
        port: { W: 520, H: 930, board: [0, 92, 520, 540], players: [0, 0, 520, 86], log: [0, 636, 520, 28], bar: [0, 668, 520, 262], bank: [6, 6], awards: [432, 52], dice: [8, 456], tools: [388, 6], net: [96, 8], tp: [12, 0], hint: [14, 6], hand: [10, 34, 500, 72], devs: [10, 112, 500, 68], act: [8, 184, 504, 72] }
      };
      const place = (e, [x, y, w, h]) => { e.style.left = x + 'px'; e.style.top = y + 'px'; if (w != null) { e.style.width = w + 'px'; e.style.height = h + 'px'; } };
      function applyLayout(port) {
        const L = port ? LAY.port : LAY.land;
        stage.className = 'ct-stage ' + (port ? 'port' : 'land');
        stage.style.width = L.W + 'px'; stage.style.height = L.H + 'px';
        place(boardEl, L.board); place(playersEl, L.players); place(logEl, L.log); place(barEl, L.bar);
        const off = (e, [x, y]) => { e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.right = 'auto'; e.style.bottom = 'auto'; };
        off(bankEl, L.bank); off(awardEl, L.awards); off(diceEl, L.dice); off(toolsEl, [L.tools[0] + L.board[0], L.tools[1] + L.board[1]]); off(netEl, [L.net[0] + L.board[0], L.net[1] + L.board[1]]);
        place(hintEl, [L.hint[0], L.hint[1]]); hintEl.style.width = (L.bar[2] - 28) + 'px'; hintEl.style.right = 'auto';
        place(handEl, L.hand); place(devEl, L.devs); place(actEl, L.act);
        tpEl.style.left = L.tp[0] + 'px'; tpEl.style.bottom = (L.H - L.bar[1] + 8) + 'px'; tpEl.style.top = 'auto';
        wrap.style.aspectRatio = L.W + ' / ' + L.H;
        wrap.style.width = `min(100%, ${port ? 560 : L.W}px, calc((100dvh - var(--goff, 250px)) * ${(L.W / L.H).toFixed(4)}))`;
        S.port = port;
      }
      function fit() {
        const port = (root.clientWidth || 1000) < 720;
        if (port !== S.port) applyLayout(port);
        const L = port ? LAY.port : LAY.land, w = wrap.clientWidth;
        if (!w) return;
        S.K = w / L.W;
        stage.style.transform = `scale(${S.K})`;
      }
      api.on(window, 'resize', fit);
      let ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(() => fit()); ro.observe(root); ro.observe(wrap); }

      const gL = {};
      function buildBoard(hex, ports) {
        const b = boardSVG(hex.map(([t, num]) => ({ t, num })), ports);
        svg.setAttribute('viewBox', b.vb.join(' '));
        svg.innerHTML = b.html + '<g class="ct-roads"></g><g class="ct-blds"></g><g class="ct-rob"></g><g class="ct-gh"></g><g class="ct-hls"></g>';
        ['roads', 'blds', 'rob', 'gh', 'hls'].forEach(k => { gL[k] = svg.querySelector('.ct-' + k); });
        const rb = document.createElementNS(NS, 'g');
        rb.setAttribute('class', 'ct-robber'); rb.innerHTML = robberSVG;
        gL.rob.append(rb); gL.robber = rb;
        S.prev = { road: [], vtx: [] }; S.robAt = -1; S.sig = '';
      }
      const vp = v => [VX[v].x * SC, VX[v].y * SC];
      const robPos = h => [HX[h].x * SC - 15, HX[h].y * SC + 13];
      function roadSVG(e, p, cls) {
        const [x1, y1] = vp(EX[e].a), [x2, y2] = vp(EX[e].b), dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, c0 = 11;
        const a = [x1 + ux * c0, y1 + uy * c0], b = [x2 - ux * c0, y2 - uy * c0];
        const ln = (w, col, o) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${o || ''}/>`;
        return `<g class="ct-rd ${cls || ''}" filter="url(#ct-sh)">${ln(11, PDARK[p])}${ln(7, PCOL[p])}${ln(2, '#fff', ' opacity=".35" transform="translate(0 -1.5)"')}</g>`;
      }
      function pieceSVG(v, p, c, cls, wrapCls) {
        const [x, y] = vp(v);
        return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" class="${wrapCls || ''}"><g class="ct-pc ${cls || ''}">${settleSVG(PCOL[p], PDARK[p], c, c ? 1.2 : 1.12)}</g></g>`;
      }
      function drawBoard(V) {
        const pr = S.prev, sig = V.road.join('') + '|' + V.vtx.map(b => b ? b[0] + '' + b[1] : '-').join('');
        if (sig !== S.sig) {
          S.sig = sig;
          let rd = '', bl = '';
          for (let e = 0; e < EX.length; e++) if (V.road[e] >= 0) rd += roadSVG(e, V.road[e], pr.road[e] === V.road[e] ? '' : 'pop');
          for (let v = 0; v < VX.length; v++) {
            const b = V.vtx[v];
            if (!b) continue;
            const o = pr.vtx[v];
            bl += pieceSVG(v, b[0], b[1], !o || o[1] !== b[1] ? 'pop' : '');
          }
          gL.roads.innerHTML = rd; gL.blds.innerHTML = bl;
          S.prev = { road: V.road.slice(), vtx: V.vtx.map(b => b ? b.slice() : null) };
        }
        const [rx, ry] = robPos(V.robber);
        if (S.robAt < 0) { gL.robber.style.transition = 'none'; gL.robber.style.transform = `translate(${rx}px,${ry}px)`; void gL.robber.getBoundingClientRect(); gL.robber.style.transition = ''; }
        else if (S.robAt !== V.robber) gL.robber.style.transform = `translate(${rx}px,${ry}px)`;
        S.robAt = V.robber;
      }
      function targets(V) {
        if (!V || V.turn !== V.q || S.busy || Q.length || S.pend || M.over) return null;
        const q = V.q, Sx = sxOf(V);
        if (V.phase === 'setup_s') return { k: 'v', ids: legalSettle(Sx, q, true), a: id => ({ k: 'settle', v: id }) };
        if (V.phase === 'setup_r') return { k: 'e', ids: legalRoad(Sx, q, V.last), a: id => ({ k: 'road', e: id }) };
        if (V.phase === 'robber') return { k: 'h', ids: HX.map((_, i) => i).filter(i => i !== V.robber), a: id => ({ k: 'robber', h: id }) };
        if (V.phase === 'rb') return { k: 'e', ids: legalRoad(Sx, q), a: id => ({ k: 'road', e: id }) };
        if (V.phase === 'main' && S.mode === 'road') return { k: 'e', ids: legalRoad(Sx, q), a: id => ({ k: 'road', e: id }), once: 1 };
        if (V.phase === 'main' && S.mode === 'settle') return { k: 'v', ids: legalSettle(Sx, q, false), a: id => ({ k: 'settle', v: id }), once: 1 };
        if (V.phase === 'main' && S.mode === 'city') return { k: 'v', ids: VX.map((_, i) => i).filter(i => V.vtx[i] && V.vtx[i][0] === q && !V.vtx[i][1]), a: id => ({ k: 'city', v: id }), once: 1 };
        return null;
      }
      function drawHL(V) {
        const T = targets(V);
        if (!T) { gL.gh.innerHTML = ''; gL.hls.innerHTML = ''; gL.hls._h = ''; gL.hls._T = null; return; }
        let h = '';
        T.ids.forEach(id => {
          if (T.k === 'v') { const [x, y] = vp(id); h += `<g class="ct-hl" data-v="${id}"><circle class="ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="24" fill="transparent"/></g>`; }
          else if (T.k === 'e') { const [x1, y1] = vp(EX[id].a), [x2, y2] = vp(EX[id].b); h += `<g class="ct-hl edge" data-e="${id}"><line class="ring" x1="${(x1 + (x2 - x1) * 0.2).toFixed(1)}" y1="${(y1 + (y2 - y1) * 0.2).toFixed(1)}" x2="${(x1 + (x2 - x1) * 0.8).toFixed(1)}" y2="${(y1 + (y2 - y1) * 0.8).toFixed(1)}"/><line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="transparent" stroke-width="30" stroke-linecap="round"/></g>`; }
          else h += `<g class="ct-hl hex" data-h="${id}"><polygon class="ring" points="${hexPts(SC - 8, HX[id].x * SC, HX[id].y * SC)}"/></g>`;
        });
        gL.hls._T = T;
        if (gL.hls._h !== h) { gL.hls._h = h; gL.hls.innerHTML = h; gL.gh.innerHTML = ''; }
      }
      function ghost(kind, id, V) {
        gL.gh.innerHTML = '';
        const q = V.q;
        if (kind === 'v') gL.gh.innerHTML = pieceSVG(id, q, S.mode === 'city' ? 1 : 0, '', 'ct-ghost');
        else if (kind === 'e') gL.gh.innerHTML = `<g class="ct-ghost">${roadSVG(id, q)}</g>`;
      }
      function onBoardClick(e) {
        const g = e.target.closest('[data-v],[data-e],[data-h]'), T = gL.hls._T;
        if (!g || !T) return;
        const id = +(g.dataset.v ?? g.dataset.e ?? g.dataset.h);
        if (!T.ids.includes(id)) return;
        const a = T.a(id);
        if (T.once) S.mode = null;
        humanAct(a);
      }
      api.on(svg, 'click', onBoardClick);
      api.on(svg, 'pointerover', e => {
        const g = e.target.closest('[data-v],[data-e]'), V = S.V;
        if (!g || !V) return;
        if (g.dataset.v != null) ghost('v', +g.dataset.v, V); else ghost('e', +g.dataset.e, V);
      });
      api.on(svg, 'pointerout', e => { if (e.target.closest('[data-v],[data-e]')) gL.gh.innerHTML = ''; });

      const nameOf = p => esc(M.names[p] || PNAME[p] || 'Player');
      const nmB = p => `<b style="--c:${PCOL[p] === '#f3efe4' ? '#ffffff' : PCOL[p]}">${nameOf(p)}</b>`;
      function addLog(html, cls) {
        const p = el('p', cls || '', html), near = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 50;
        logEl.append(p);
        while (logEl.childNodes.length > 140) logEl.firstChild.remove();
        if (near || logEl.childNodes.length < 4) logEl.scrollTop = logEl.scrollHeight;
      }
      let toastT = 0;
      function toast(m) {
        toastEl.textContent = m; toastEl.classList.add('show');
        clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2300);
      }

      let ac = null;
      function aud() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
      function tone(f, d, type, vol, f2, delay) {
        if (api.muted) return;
        const c = aud();
        if (!c) return;
        const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .04);
      }
      function noise(d, vol, f, delay) {
        if (api.muted) return;
        const c = aud();
        if (!c) return;
        const t = c.currentTime + (delay || 0), n = Math.max(1, Math.floor(c.sampleRate * d)), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
        for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
        s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = f; g.gain.value = vol;
        s.connect(fl).connect(g).connect(c.destination); s.start(t);
      }
      const SND = {
        dice() { for (let i = 0; i < 9; i++) noise(.05, .1, 1400 + Math.random() * 2000, i * .075); },
        place() { tone(210, .15, 'triangle', .15, 80); noise(.05, .08, 900, .01); },
        road() { tone(320, .09, 'triangle', .11, 170); noise(.04, .06, 1200); },
        city() { tone(160, .2, 'triangle', .15, 70); tone(320, .14, 'triangle', .1, null, .08); noise(.06, .08, 700); },
        card() { noise(.05, .09, 2600); },
        coin() { tone(1046, .07, 'sine', .07); tone(1568, .15, 'sine', .07, null, .07); },
        robber() { tone(130, .5, 'sawtooth', .07, 55); },
        turn() { tone(587, .1, 'sine', .06); tone(880, .16, 'sine', .06, null, .09); },
        win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', .09, null, i * .13)); },
        lose() { tone(300, .5, 'sine', .07, 120); },
        err() { tone(150, .14, 'square', .045); },
        dev() { tone(500, .1, 'triangle', .08, 800); tone(800, .14, 'triangle', .08, null, .1); },
        gain() { noise(.05, .07, 3000); noise(.05, .06, 3400, .09); }
      };
      const snd = k => { try { SND[k](); } catch (e) {} };

      const stagePt = (x, y) => { const r = stage.getBoundingClientRect(); return [(x - r.left) / S.K, (y - r.top) / S.K]; };
      const hexPt = h => {
        try { const pt = svg.createSVGPoint(); pt.x = HX[h].x * SC; pt.y = HX[h].y * SC; const p = pt.matrixTransform(svg.getScreenCTM()); return stagePt(p.x, p.y); } catch (e) { return [300, 250]; }
      };
      const elPt = e => { const r = e.getBoundingClientRect(); return stagePt(r.left + r.width / 2, r.top + r.height / 2); };
      const anchor = p => {
        if (p === M.seat) { const c = handEl.querySelector('.ct-stack') || handEl; return elPt(c); }
        const e = playersEl.querySelector(`[data-p="${p}"] .ct-av`);
        return e ? elPt(e) : [900, 100];
      };
      function fly(a, b, r, delay, dur) {
        if (!a || !b || !fxEl.animate) return;
        const c = el('div', 'ct-fxc r' + r, r >= 0 ? ico(r, 24) : '');
        if (r < 0) c.style.background = 'linear-gradient(160deg,#4a76a8,#244566)';
        c.className = 'ct-fxc' + (r >= 0 ? ' ct-rc r' + r : '');
        c.style.cssText += ';position:absolute;width:34px;height:44px;margin:-22px 0 0 -17px;left:0;top:0;bottom:auto;opacity:0';
        fxEl.append(c);
        const d = (dur || 850) * M.speed, dl = (delay || 0) * M.speed;
        const an = c.animate([
          { transform: `translate(${a[0]}px,${a[1]}px) scale(.4) rotate(-10deg)`, opacity: 0 },
          { transform: `translate(${a[0]}px,${a[1] - 16}px) scale(1.1) rotate(0deg)`, opacity: 1, offset: .22 },
          { transform: `translate(${b[0]}px,${b[1]}px) scale(.55) rotate(8deg)`, opacity: .9 }
        ], { duration: Math.max(60, d), delay: dl, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'both' });
        an.onfinish = () => c.remove();
        if (S.K && M.speed < 1) setTimeout(() => c.remove(), d + dl + 100);
      }
      function flyGains(e, V) {
        let i = 0;
        e.g.forEach(([p, r, n, hh]) => {
          let src = [];
          if (hh != null) src = [hh];
          else S.hex.forEach(([t, num], h) => { if (num === e.roll && t === r && h !== V.robber) HX[h].v.forEach(v => { const b = V.vtx[v]; if (b && b[0] === p) for (let k = 0; k < (b[1] ? 2 : 1); k++) src.push(h); }); });
          src.slice(0, Math.max(1, n)).forEach(h => fly(hexPt(h), anchor(p), r, (i++) * 80, 850));
        });
      }
      function hitTokens(roll) {
        svg.querySelectorAll('.ct-tk').forEach(t => { const h = +t.dataset.h; if (S.hex[h][1] === roll && S.V && S.V.robber !== h) { t.classList.add('hit'); setTimeout(() => t.classList.remove('hit'), 1000); } });
      }

      const lrTxt = e => e.p >= 0 ? `${nmB(e.p)} claimed <b>Longest Road</b> (${e.len})` : 'Longest Road is unclaimed';
      const WHAT = { road: 'a road', settle: 'a settlement', city: 'a city' };
      function playEv(e, V) {
        const q = V.q;
        switch (e.k) {
          case 'roll': {
            addLog(`${nmB(e.p)} rolled <b>${e.d[0] + e.d[1]}</b> (${e.d[0]} + ${e.d[1]})`);
            return 0;
          }
          case 'gain': {
            if (e.g.length === 0 && !e.setup) { addLog('Nobody collects resources.', 'sys'); return 200; }
            const by = {};
            e.g.forEach(([p, r, n]) => { (by[p] = by[p] || []).push(resIco(r, n, 17)); });
            Object.keys(by).forEach(p => addLog(`${nmB(+p)} received ${by[p].join('')}`));
            if (e.roll) hitTokens(e.roll);
            flyGains(e, V); snd('gain');
            return 1000;
          }
          case 'short': addLog(`The bank has run out of ${RNAME[e.r]}.`, 'sys'); return 100;
          case 'seven': {
            snd('robber');
            const ks = Object.keys(e.disc);
            addLog(ks.length ? `Seven! ${ks.map(k => nameOf(+k) + ' (' + e.disc[k] + ')').join(', ')} must discard.` : 'Seven! The robber is on the move.', 'big');
            return 500;
          }
          case 'discard': addLog(`${nmB(e.p)} discarded ${e.n} cards`); snd('card'); fly(anchor(e.p), elPt(bankEl), -1, 0, 600); return 400;
          case 'robber': addLog(`${nmB(e.p)} moved the robber to ${TNAME[S.hex[e.h][0]].toLowerCase()}${S.hex[e.h][1] ? ' (' + S.hex[e.h][1] + ')' : ''}`); snd('robber'); return 650;
          case 'steal': {
            addLog(`${nmB(e.to)} stole ${e.r != null ? ico(e.r, 17) : 'a card'} from ${nmB(e.from)}`);
            snd('card'); fly(anchor(e.from), anchor(e.to), e.r != null ? e.r : -1, 0, 700);
            return 800;
          }
          case 'build': {
            addLog(`${nmB(e.p)} ${e.setup ? 'placed' : e.free ? 'built (free)' : 'built'} ${WHAT[e.w]}`);
            snd(e.w === 'city' ? 'city' : e.w === 'road' ? 'road' : 'place');
            return e.setup ? 260 : 420;
          }
          case 'buydev': {
            addLog(`${nmB(e.p)} bought a development card` + (e.t != null ? ` (<b>${DEVN[e.t]}</b>)` : ''));
            snd('dev'); fly(elPt(bankEl), anchor(e.p), -1, 0, 600);
            return 500;
          }
          case 'dev': addLog(`${nmB(e.p)} played <b>${DEVN[e.t]}</b>`, 'big'); snd('dev'); return 450;
          case 'plenty': addLog(`${nmB(e.p)} took ${ico(e.a, 17)}${ico(e.b, 17)} from the bank`); snd('gain'); fly(elPt(bankEl), anchor(e.p), e.a, 0); fly(elPt(bankEl), anchor(e.p), e.b, 120); return 700;
          case 'mono': {
            addLog(`${nmB(e.p)} took ${e.n} ${resIco(e.r, e.n, 17)} with Monopoly`);
            snd('gain'); e.from.forEach(([q2, n], i) => { for (let k = 0; k < Math.min(n, 3); k++) fly(anchor(q2), anchor(e.p), e.r, i * 120 + k * 60); });
            return 900;
          }
          case 'bank': {
            addLog(`${nmB(e.p)} traded ${e.gn} ${resIco(e.g, e.gn, 17)} for ${ico(e.r, 17)} with the bank`);
            snd('coin'); for (let k = 0; k < e.gn; k++) fly(anchor(e.p), elPt(bankEl), e.g, k * 70, 600); fly(elPt(bankEl), anchor(e.p), e.r, 300, 600);
            return 800;
          }
          case 'offer': addLog(`${nmB(e.p)} offers ${chips(e.give, 16)} for ${chips(e.want, 16)}`); snd('card'); return 150;
          case 'resp': return 80;
          case 'trade': {
            addLog(`${nmB(e.a)} traded ${chips(e.ga, 16)} for ${chips(e.gb, 16)} with ${nmB(e.b)}`, 'big');
            snd('coin');
            e.ga.forEach((n, r) => { for (let k = 0; k < Math.min(n, 3); k++) fly(anchor(e.a), anchor(e.b), r, k * 90, 700); });
            e.gb.forEach((n, r) => { for (let k = 0; k < Math.min(n, 3); k++) fly(anchor(e.b), anchor(e.a), r, 120 + k * 90, 700); });
            return 900;
          }
          case 'tradeno': addLog('Nobody accepted the trade.', 'sys'); return 150;
          case 'cancel': addLog(`${nmB(e.p)} withdrew the trade offer`, 'sys'); return 100;
          case 'lr': addLog(lrTxt(e), 'big'); if (e.p >= 0) snd('dev'); return 400;
          case 'la': addLog(`${nmB(e.p)} claimed <b>Largest Army</b>`, 'big'); snd('dev'); return 400;
          case 'turn': {
            if (V.phase !== 'setup_s' && V.phase !== 'setup_r') addLog(`${nmB(e.p)}'s turn`, 'sys'); else addLog(`${nmB(e.p)} places a starting settlement`, 'sys');
            if (e.p === q && V.phase === 'roll') snd('turn');
            return 120;
          }
          case 'win': {
            addLog(`${nmB(e.p)} wins the game!`, 'big');
            if (e.p === q) { snd('win'); sv.wins++; api.submit(sv.wins); saveAll(); } else snd('lose');
            return 900;
          }
        }
        return 0;
      }

      function showDice(d, rolling) {
        const sum2 = d ? d[0] + d[1] : 0;
        diceEl.style.opacity = d ? '1' : '.45';
        diceEl.innerHTML = `<div class="ct-die${rolling ? ' roll' : ''}">${dieSVG(d ? d[0] : 1, DICE_COL[0])}</div><div class="ct-die${rolling ? ' roll' : ''}">${dieSVG(d ? d[1] : 1, DICE_COL[1])}</div><div class="ct-sum${sum2 === 7 ? ' seven' : ''}">${d && !rolling ? sum2 : ''}</div>`;
        if (d && !rolling) diceEl.querySelectorAll('.ct-die').forEach(x => x.classList.add('land'));
      }
      function rollAnim(d, done) {
        snd('dice');
        const t0 = performance.now();
        let id = 0;
        const tick = () => {
          const f = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
          showDice(f, true);
          if ((performance.now() - t0) / M.speed < 760 && api.alive) id = setTimeout(tick, 70 * M.speed + 10); else { showDice(d, false); setTimeout(done, 260 * M.speed); }
        };
        tick();
        return () => clearTimeout(id);
      }

      function pump() {
        if (S.busy) return;
        const it = Q.shift();
        if (!it) return;
        S.busy = true;
        const roll = it.ev.find(e => e.k === 'roll');
        const go = () => {
          if (!api.alive || it.tok !== M.tok) return;
          const V = it.v;
          S.V = V;
          let dur = 80;
          if (!roll) showDice(V.dice[0] ? V.dice : null, false);
          for (const e of it.ev) dur = Math.max(dur, playEv(e, V));
          renderAll();
          api.timeout(() => { if (it.tok !== M.tok) return; S.busy = false; if (Q.length) pump(); else { renderAll(); botKick(); } }, dur * M.speed);
        };
        if (roll && !it.sync) rollAnim(roll.d, go); else go();
      }

      function broadcast(ev) {
        const e = M.eng;
        Q.push({ v: e.view(M.seat), ev: ev.map(x => filt(x, M.seat)), tok: M.tok });
        if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== M.seat) api.net.sendTo(id, { t: 'st', v: e.view(q), ev: ev.map(x => filt(x, q)) }); });
        pump();
      }
      function perform(p, a) {
        const ok = M.eng.act(p, a);
        if (!ok) { const id = M.pids[p]; if (id && p !== M.seat) api.net.sendTo(id, { t: 'err', m: M.eng.err() }); return false; }
        broadcast(M.eng.flush());
        const t = M.eng.s.trade, tok = M.tok;
        if (t && M.bot[t.from] && t.id !== M.tid) {
          M.tid = t.id;
          const id = t.id;
          api.timeout(() => {
            const T = M.eng && tok === M.tok && M.eng.s.trade;
            if (T && T.id === id) Object.keys(T.resp).forEach(q => { if (T.resp[q] === 'wait' && !M.bot[q]) perform(+q, { k: 'respond', r: 'no' }); });
          }, 30000);
        }
        schedule(a.k === 'roll' ? 800 : a.k === 'end' ? 450 : a.k === 'respond' || a.k === 'counter' ? 800 : 640);
        return true;
      }
      function humanAct(a) {
        if (S.busy || Q.length || S.pend || M.over) return false;
        if (M.role === 'guest') {
          S.pend = true; api.net.send({ t: 'act', a });
          api.timeout(() => { if (S.pend) { S.pend = false; renderAll(); } }, 2500);
          renderAll();
          return true;
        }
        if (!perform(M.seat, a)) { snd('err'); toast(M.eng.err()); }
        return true;
      }

      function schedule(ms) {
        if (M.role === 'guest' || !M.eng) return;
        clearTimeout(M.bt);
        M.bt = setTimeout(botTick, Math.max(20, (ms == null ? 600 : ms) * M.speed));
      }
      const botKick = () => { if (!M.bt) schedule(300); };
      function botTick() {
        M.bt = 0;
        if (!api.alive || !M.eng || M.role === 'guest') return;
        const s = M.eng.s;
        if (s.phase === 'over') return;
        if (S.busy || Q.length || document.querySelector('.g-pause') || (document.hidden && M.role === 'local')) return schedule(300);
        const order = [s.turn];
        for (let i = 0; i < s.n; i++) if (i !== s.turn) order.push(i);
        for (const p of order) {
          if (!M.bot[p]) continue;
          const a = aiAct(s, p, M.lvl, Math.random);
          if (!a) continue;
          if (!perform(p, a)) {
            M.fails++;
            console.error('[catan] bot action failed', p, JSON.stringify(a), M.eng.err());
            const fb = s.phase === 'main' && p === s.turn ? { k: 'end' } : s.phase === 'discard' ? aiDiscard(s, p, s.disc[p]) : null;
            if (fb) perform(p, fb);
            else if (M.fails < 5) schedule(500);
          }
          return;
        }
      }

      function seatName(i) { return M.names[i]; }
      function setupMsg(q) { return { t: 'setup', seat: q, n: M.names.length, names: M.names, bot: M.bot, hexes: S.hex, ports: S.ports, goal: M.eng.s.goal, lvl: M.lvl }; }
      function sendSetups() { M.pids.forEach((id, q) => { if (id && q !== M.seat) api.net.sendTo(id, setupMsg(q)); }); }
      function resetUi() {
        Q.length = 0; S.busy = false; S.V = null; S.mode = null; S.dlg = null; S.tr = null; S.seenOver = false; S.pend = false; M.over = false; M.fails = 0; M.tid = 0;
        S.dc = [0, 0, 0, 0, 0]; logEl.innerHTML = ''; fxEl.innerHTML = ''; clearTimeout(M.bt); M.bt = 0; showDice(null, false);
      }
      function newGame() {
        M.tok++;
        resetUi();
        M.speed = opt.fast ? .4 : .8;
        const n = M.names.length;
        M.eng = Game({ n, goal: opt.goal, balanced: opt.board === 'balanced' });
        S.hex = M.eng.s.hex.map(h => [h.t, h.num]); S.ports = M.eng.s.ports.slice();
        buildBoard(S.hex, S.ports);
        if (M.role === 'host') sendSetups();
        M.started = true; sv.played++; saveAll();
        addLog(`New game: first to ${opt.goal} victory points wins.`, 'sys');
        api.score(0);
        broadcast([{ k: 'turn', p: M.eng.s.turn }]);
        schedule(900);
      }
      function startLocal() {
        M.tok++; M.role = 'local'; M.seat = 0; M.lvl = opt.lvl;
        try { api.net.close(); } catch (e) {}
        const pool = BOTN.slice().sort(() => Math.random() - 0.5);
        M.names = ['You']; M.bot = [false]; M.pids = [null];
        for (let i = 1; i < opt.n; i++) { M.names.push(pool.pop()); M.bot.push(true); M.pids.push(null); }
        newGame();
      }
      function hostStart() {
        const live = M.players.filter((p, i) => !i || api.net.players.some(x => x.id === p.id));
        const k = Math.min(4, live.length), n = Math.max(3, Math.min(4, M.bots ? Math.max(k, M.size) : k));
        const pool = BOTN.slice().sort(() => Math.random() - 0.5);
        M.names = []; M.bot = []; M.pids = [];
        for (let i = 0; i < n; i++) {
          if (i < k) { M.names.push(live[i].name || 'Player'); M.bot.push(false); M.pids.push(i ? live[i].id : null); }
          else { M.names.push(pool.pop()); M.bot.push(true); M.pids.push(null); }
        }
        M.players = live; M.role = 'host'; M.seat = 0; M.lvl = opt.lvl;
        newGame();
      }
      function seatToBot(id) {
        const q = M.pids.indexOf(id);
        if (q < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[q];
        M.pids[q] = null; M.bot[q] = true; M.names[q] = who + ' (Bot)';
        M.pids.forEach((pid, i) => { if (pid && i !== M.seat) api.net.sendTo(pid, { t: 'seats', names: M.names, bot: M.bot }); });
        toast(who + ' left. A bot takes the seat.');
        addLog(`${esc(who)} left the game. A bot takes over.`, 'sys');
        renderAll(); schedule(400);
      }
      function sendSync(id) {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(id);
        if (q < 0) return;
        api.net.sendTo(id, setupMsg(q));
        api.net.sendTo(id, { t: 'st', v: M.eng.view(q), ev: [], sync: 1 });
      }
      function leaveOnline() {
        M.tok++; M.role = 'local'; M.eng = null; M.pids = []; M.players = [];
        try { api.net.close(); } catch (e) {}
        resetUi(); showMenu('title');
      }
      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => { if (M.role === 'host' && p) seatToBot(p.id); });
        api.net.on('rejoin', p => { if (M.role === 'host' && p) sendSync(p.id); });
        api.net.on('lobby', () => { if (M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.role !== 'guest' && M.role !== 'host') return;
          M.tok++; const was = M.role; M.role = 'local'; M.eng = null; Q.length = 0; S.busy = false;
          snd('lose');
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host ended the game.' : 'The connection to the party was lost.';
          S.dlg = { k: 'left', h, t }; renderAll();
        });
        api.interval(() => {
          if (!api.online || !M.started) { netEl.hidden = true; return; }
          const on = api.net.connected || M.role === 'host';
          netEl.hidden = false; netEl.classList.toggle('bad', !on);
          const hn = M.pids.filter((id, q) => id && q !== M.seat).length;
          netEl.lastChild.textContent = !on ? 'Reconnecting...' : M.role === 'host' ? 'Online - ' + (hn + 1) + ' players' : 'Online' + (api.net.rtt ? ' - ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        resetUi(); M.eng = null; M.started = false; M.role = null;
        S.dlg = { k: 'lobby' }; renderAll();
        const r = await api.net.room({ title: 'Catan', sizes: [3, 4], defaultSize: 4, min: 3, max: 4, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.role = 'local'; showMenu('title'); return; }
        M.role = r.role; M.players = r.players.slice(0, 4); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') { S.dlg = null; hostStart(); }
        else { S.dlg = { k: 'wait' }; renderAll(); }
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive) return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === M.seat || M.bot[q]) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') {
            if (!perform(q, d.a)) api.net.sendTo(from, { t: 'st', v: M.eng.view(q), ev: [], sync: 1 });
          }
          return;
        }
        if (d.t === 'setup') {
          M.tok++; M.role = 'guest'; M.seat = d.seat; M.names = d.names; M.bot = d.bot; M.lvl = d.lvl; M.started = true;
          resetUi(); M.over = false; M.speed = opt.fast ? .4 : .8;
          S.hex = d.hexes; S.ports = d.ports; buildBoard(S.hex, S.ports);
          opt.goal = d.goal;
          addLog(`New game: first to ${d.goal} victory points wins.`, 'sys');
        } else if (M.role !== 'guest') return;
        else if (d.t === 'st') {
          S.pend = false;
          Q.push({ v: d.v, ev: d.ev || [], sync: !!d.sync, tok: M.tok });
          pump();
        } else if (d.t === 'err') { S.pend = false; snd('err'); toast(String(d.m || 'Not allowed.')); renderAll(); }
        else if (d.t === 'seats') { M.names = d.names; M.bot = d.bot; renderAll(); }
      }

      const setH = (e, h) => { if (e._h !== h) { e._h = h; e.innerHTML = h; } };
      const idle = () => !S.busy && !Q.length && !S.pend && !M.over;
      const sum5 = v => v.reduce((a, b) => a + b, 0);
      const zero = () => [0, 0, 0, 0, 0];
      let paneShown = false;
      const DEVSHORT = ['Knight', 'VP card', 'Roads', 'Plenty', 'Mono'];

      function renderPlayers(V) {
        let h = '';
        for (let p = 0; p < V.n; p++) {
          const P = V.P[p], me = p === V.q, col = PCOL[p];
          const vpv = V.fin ? V.fin[p].tot : me && V.vpAll != null ? V.vpAll : P.vp;
          const cards = me && V.res ? sum5(V.res) : P.c;
          const think = M.bot[p] && V.turn === p && V.phase !== 'over' ? '<span class="think">thinking...</span>' : '';
          h += `<div class="ct-pl ct-glass${V.turn === p && V.phase !== 'over' ? ' turn' : ''}" data-p="${p}" style="--c:${col};--d:${PDARK[p]}"><div class="ct-av${col === '#f3efe4' ? ' w' : ''}">${esc((M.names[p] || '?').charAt(0).toUpperCase())}${M.bot[p] ? `<span class="dot">${ui('bot', 11)}</span>` : ''}</div><div class="ct-nm"><span>${nameOf(p)}</span>${me ? '<em>YOU</em>' : ''}${think}</div><div class="ct-stats"><span title="Resource cards">${ui('cards', 15)}${cards}</span><span title="Development cards">${ui('dev', 15)}${P.d}</span><span title="Knights played">${ui('knight', 15)}${P.kn}</span><span title="Longest road">${ui('road', 15)}${P.rl}</span>${V.lr === p ? `<span class="lr">${ui('crown', 13)}LR</span>` : ''}${V.la === p ? `<span class="la">${ui('crown', 13)}LA</span>` : ''}</div><div class="ct-vp">${vpv}</div></div>`;
        }
        setH(playersEl, h);
      }
      function renderBank(V) {
        setH(bankEl, '<b>BANK</b>' + V.bank.map((n, r) => `<span class="${n === 0 ? 'zero' : n <= 3 ? 'low' : ''}" title="${RNAME[r]}">${ico(r, 17)}${n}</span>`).join('') + `<span title="Development cards left">${ui('dev', 17)}${V.deck}</span>`);
      }
      function renderAwards(V) {
        const aw = (label, p, sub, icon) => `<div class="ct-aw ct-glass${p >= 0 ? ' on' : ''}"${p >= 0 ? ` style="--c:${PCOL[p]}"` : ''}>${icon}${label}<b>${p >= 0 ? nameOf(p) : 'Nobody'}</b><small>${sub}</small></div>`;
        setH(awardEl, aw('LONGEST ROAD', V.lr, V.lr >= 0 ? V.lrLen + ' roads' : '5+ needed', ui('road', 22)) + aw('LARGEST ARMY', V.la, V.la >= 0 ? V.P[V.la].kn + ' knights' : '3+ needed', ui('knight', 22)));
      }
      function renderHand(V) {
        const res = V.res || zero(), kinds = res.filter(n => n > 0).length;
        if (!kinds) return setH(handEl, '<span class="ct-empty">No resource cards yet</span>');
        const g = kinds >= 4 ? 7 : 12, mx = kinds >= 4 ? 4 : 5;
        let h = '';
        res.forEach((n, r) => {
          if (!n) return;
          const k = Math.min(n, mx);
          let cs = '';
          for (let i = 0; i < k; i++) cs += `<div class="ct-rc r${r}" style="left:${i * g}px">${ico(r, 26)}</div>`;
          h += `<div class="ct-stack" style="width:${50 + (k - 1) * g}px" title="${RNAME[r]}">${cs}<b style="left:${50 + (k - 1) * g - 12}px;right:auto">${n}</b></div>`;
        });
        setH(handEl, h);
      }
      function renderDev(V) {
        const g = {};
        (V.dev || []).forEach(c => { const x = g[c.t] || (g[c.t] = { n: 0, ok: 0, nw: 0 }); x.n++; if (c.ok) x.ok++; if (c.nw) x.nw++; });
        const ts = Object.keys(g).map(Number), can = V.turn === V.q && (V.phase === 'roll' || V.phase === 'main') && idle();
        const avail = S.port ? 500 : 186, tot = ts.length * 46 + Math.max(0, ts.length - 1) * 4, ov = ts.length > 1 && tot > avail ? Math.ceil((tot - avail) / (ts.length - 1)) : 0;
        setH(devEl, ts.map((t, i) => {
          const x = g[t], ok = can && x.ok > 0;
          return `<button class="ct-dc${t === 1 ? ' vp' : ok ? ' ok' : ' no'}" style="${i && ov ? `margin-left:-${ov}px;` : ''}" data-a="dev" data-t="${t}" title="${DEVN[t]}: ${DEVDESC[t]}">${dico(t, 24)}<span>${DEVSHORT[t]}</span>${x.n > 1 ? `<b>${x.n}</b>` : ''}${x.nw === x.n && t !== 1 ? '<em>NEW</em>' : ''}</button>`;
        }).join(''));
      }
      function canBuild(V) {
        const q = V.q, mine = V.turn === q && V.phase === 'main' && idle(), res = V.res || zero(), P = V.P[q], Sx = sxOf(V);
        const aff = c => c.every((k, r) => res[r] >= k);
        return {
          road: mine && aff(COST.road) && P.nr < MAXP.road && legalRoad(Sx, q).length > 0,
          settle: mine && aff(COST.settle) && P.ns < MAXP.settle && legalSettle(Sx, q, false).length > 0,
          city: mine && aff(COST.city) && P.nc < MAXP.city && P.ns > 0,
          dev: mine && aff(COST.dev) && V.deck > 0,
          trade: mine && !V.trade
        };
      }
      function renderAct(V) {
        const q = V.q, mine = V.turn === q, ok = canBuild(V), col = PCOL[q];
        let lab = 'WAIT', cls = '', dis = true, a = '';
        if (V.phase === 'over') lab = 'GAME<br>OVER';
        else if (mine) {
          if (V.phase === 'roll') { lab = 'ROLL<br>DICE'; cls = ' pulse'; dis = !idle(); a = 'roll'; }
          else if (V.phase === 'main') { lab = 'END<br>TURN'; cls = ' end'; dis = !idle(); a = 'end'; }
          else lab = { setup_s: 'PLACE<br>HOUSE', setup_r: 'PLACE<br>ROAD', robber: 'MOVE<br>ROBBER', steal: 'STEAL', rb: 'FREE<br>ROADS', discard: V.disc[q] ? 'DISCARD' : 'WAIT' }[V.phase] || 'WAIT';
        } else if (V.phase === 'discard' && V.disc[q]) lab = 'DISCARD';
        const B = [['road', 'Road', ui('road', 22), COST.road, ''], ['settle', 'House', ui('house', 22, col), COST.settle, '+1'], ['city', 'City', ui('city', 22, col), COST.city, '+1'], ['dev', 'Card', ui('dev', 22), COST.dev, ''], ['trade', 'Trade', ui('trade', 22), null, '']];
        setH(actEl, `<button class="ct-prim${cls}" data-a="${a || 'x'}"${dis ? ' disabled' : ''}>${lab}</button>` + B.map(([k, n, ic, c, vpb]) => `<button class="ct-bb${S.mode === k ? ' on' : ''}" data-a="b" data-k="${k}"${ok[k] ? '' : ' disabled'} title="${k === 'dev' ? 'Buy a development card' : k === 'trade' ? 'Trade with players or the bank' : 'Build a ' + n.toLowerCase()}">${vpb ? `<span class="vpb">${vpb}</span>` : ''}${ic}<span>${n}</span><span class="cs">${c ? costDots(c) : ''}</span></button>`).join(''));
      }
      function hintText(V) {
        const q = V.q, t = V.turn, nm = nameOf(t), mine = t === q;
        const sub = s => s ? `<small>${s}</small>` : '';
        switch (V.phase) {
          case 'setup_s': return mine ? 'Place a settlement' + sub('Click a glowing spot') : `${nm} is placing a settlement`;
          case 'setup_r': return mine ? 'Now place a road next to it' : `${nm} is placing a road`;
          case 'roll': return mine ? 'Your turn: roll the dice' : `${nm} is rolling`;
          case 'main':
            if (!mine) return `${nm}'s turn`;
            if (S.mode) return { road: 'Pick a spot for the road', settle: 'Pick a spot for the settlement', city: 'Pick a settlement to upgrade' }[S.mode] + sub('click the button again to cancel');
            return 'Your turn' + sub(V.trade ? 'trade offer open' : 'build, trade or end your turn');
          case 'discard': {
            const need = V.disc[q];
            if (need) return `Discard ${need} cards`;
            return 'Waiting for ' + Object.keys(V.disc).map(k => nameOf(+k)).join(', ') + ' to discard';
          }
          case 'robber': return mine ? 'Move the robber' + sub('click a hex') : `${nm} is moving the robber`;
          case 'steal': return mine ? 'Choose a player to rob' : `${nm} is choosing a victim`;
          case 'rb': return mine ? `Place a free road (${V.rb} left)` : `${nm} is building roads`;
          case 'over': return `${nameOf(V.winner)} wins the game`;
        }
        return '';
      }
      function renderHint(V) {
        const t = V.phase === 'over' ? V.winner : V.turn;
        hintEl.style.setProperty('--c', PCOL[t]);
        hintEl.className = 'ct-hint' + (V.turn === V.q && V.phase !== 'over' ? ' me' : '');
        setH(hintEl, '<i></i><span>' + hintText(V) + '</span>');
      }
      function renderTP(V) {
        const t = V.trade;
        if (!t || V.phase !== 'main' || S.dlg || paneShown) { tpEl.hidden = true; return; }
        const q = V.q, from = t.from, st = t.resp[q];
        if (q !== from && st === 'no') { tpEl.hidden = true; return; }
        let h = `<h4><span style="color:${PCOL[from] === '#f3efe4' ? '#fff' : PCOL[from]}">${nameOf(from)}</span> ${q === from ? 'your offer' : 'offers a trade'}</h4><div class="ct-offer"><div><div class="ct-lab">gives</div><div class="ct-chips">${chips(t.give, 22)}</div></div><span class="ct-arrow">${ui('trade', 22)}</span><div><div class="ct-lab">wants</div><div class="ct-chips">${chips(t.want, 22)}</div></div></div>`;
        if (q === from) {
          h += '<div class="ct-resp">' + Object.keys(t.resp).map(k => {
            const p = +k, r = t.resp[k], c = PCOL[p] === '#f3efe4' ? '#fff' : PCOL[p];
            if (r === 'yes') return `<div class="ct-rp yes" style="--c:${c}"><b>${nameOf(p)}</b> accepts<button data-a="tpc" data-w="${p}">Trade</button></div>`;
            if (r === 'ctr') return `<div class="ct-rp" style="--c:${c}"><b>${nameOf(p)}</b> offers ${chips(t.ctr[k].give, 16)} for ${chips(t.ctr[k].want, 16)}<button data-a="tpc" data-w="${p}">Accept</button></div>`;
            if (r === 'no') return `<div class="ct-rp no" style="--c:${c}"><b>${nameOf(p)}</b> declined</div>`;
            return `<div class="ct-rp" style="--c:${c}"><b>${nameOf(p)}</b> thinking...</div>`;
          }).join('') + '</div><div class="ct-row"><button class="ct-sm dng" data-a="tpx">Cancel offer</button></div>';
        } else if (st === 'wait') {
          const can = t.want.every((n, r) => (V.res[r] || 0) >= n);
          h += `<div class="ct-row"><button class="ct-sm pri" data-a="tpy"${can ? '' : ' disabled'}>Accept</button><button class="ct-sm" data-a="tpk">Counter offer</button><button class="ct-sm dng" data-a="tpn">Decline</button></div>`;
        } else h += `<p class="ct-note">${st === 'yes' ? 'You accepted. Waiting for ' + nameOf(from) + '...' : 'You made a counter offer. Waiting for ' + nameOf(from) + '...'}</p>`;
        tpEl.hidden = false;
        setH(tpEl, h);
      }

      const rtile = (r, inner, cls) => `<div class="ct-tile${cls || ''}">${ico(r, 30)}${inner}</div>`;
      function editor(V) {
        const T = S.tr, res = V.res;
        const row = (lab, kind, vec, other, lim) => `<div class="ct-lab">${lab}</div><div class="ct-tiles">${[0, 1, 2, 3, 4].map(r => rtile(r, `<span class="have">${kind === 'g' ? 'have ' + res[r] : RNAME[r]}</span><div class="pm"><button data-a="dec" data-s="${kind}" data-r="${r}"${vec[r] ? '' : ' disabled'}>-</button><b>${vec[r]}</b><button data-a="inc" data-s="${kind}" data-r="${r}"${vec[r] >= lim(r) || other[r] ? ' disabled' : ''}>+</button></div>`, (vec[r] ? ' sel' : '') + (other[r] ? ' dis' : ''))).join('')}</div>`;
        return row('You give', 'g', T.give, T.want, r => res[r]) + row('You get', 'w', T.want, T.give, () => 9);
      }
      function tradeHtml(V) {
        const T = S.tr, res = V.res, q = V.q;
        let h = `<div class="ct-box"><p class="ct-kick">Trade</p><div class="ct-tabs"><button data-a="tab" data-v="p"${T.tab === 'p' ? ' class="on"' : ''}>With players</button><button data-a="tab" data-v="b"${T.tab === 'b' ? ' class="on"' : ''}>With the bank</button></div>`;
        if (T.tab === 'p') {
          const ok = sum5(T.give) > 0 && sum5(T.want) > 0;
          h += `<div class="ct-trade">${editor(V)}</div><p class="ct-note">Players without the cards decline by themselves.</p><div class="ct-row"><button class="ct-sm pri" data-a="offer"${ok ? '' : ' disabled'}>Send offer</button><button class="ct-sm" data-a="close">Close</button></div></div>`;
        } else {
          h += `<div class="ct-lab">You give (harbour rates)</div><div class="ct-pickrow">${[0, 1, 2, 3, 4].map(r => `<button class="ct-pick${T.bg === r ? ' sel' : ''}" data-a="bg" data-r="${r}"${res[r] >= V.rates[r] ? '' : ' disabled'}>${ico(r, 30)}<span class="rate">${V.rates[r]}:1</span><span class="sub">have ${res[r]}</span></button>`).join('')}</div>`;
          h += `<div class="ct-lab">You get 1</div><div class="ct-pickrow">${[0, 1, 2, 3, 4].map(r => `<button class="ct-pick${T.br === r ? ' sel' : ''}" data-a="br" data-r="${r}"${V.bank[r] > 0 && T.bg !== r ? '' : ' disabled'}>${ico(r, 30)}<span class="sub">bank ${V.bank[r]}</span></button>`).join('')}</div>`;
          const ok = T.bg >= 0 && T.br >= 0 && T.bg !== T.br && res[T.bg] >= V.rates[T.bg];
          h += `<div class="ct-row"><button class="ct-sm pri" data-a="bank"${ok ? '' : ' disabled'}>${ok ? `Trade ${V.rates[T.bg]} ${RNAME[T.bg]} for 1 ${RNAME[T.br]}` : 'Pick two resources'}</button><button class="ct-sm" data-a="close">Close</button></div></div>`;
        }
        return h;
      }
      function counterHtml(V) {
        const t = V.trade;
        if (!t) return null;
        const ok = sum5(S.tr.give) > 0 && sum5(S.tr.want) > 0;
        return `<div class="ct-box"><p class="ct-kick">Counter offer</p><p>${nameOf(t.from)} offered ${chips(t.give, 18)} for ${chips(t.want, 18)}</p><div class="ct-trade">${editor(V)}</div><div class="ct-row"><button class="ct-sm pri" data-a="ctr"${ok ? '' : ' disabled'}>Send counter</button><button class="ct-sm" data-a="close">Back</button></div></div>`;
      }
      function discardHtml(V) {
        const need = V.disc[V.q], got = sum5(S.dc), res = V.res;
        return `<div class="ct-box"><p class="ct-kick">Seven rolled</p><h3>Discard ${need} cards</h3><p>You hold more than 7 cards. Choose ${need} to give back (${got} / ${need}).</p><div class="ct-tiles">${[0, 1, 2, 3, 4].map(r => res[r] || S.dc[r] ? rtile(r, `<span class="have">have ${res[r]}</span><div class="pm"><button data-a="dec" data-s="d" data-r="${r}"${S.dc[r] ? '' : ' disabled'}>-</button><b>${S.dc[r]}</b><button data-a="inc" data-s="d" data-r="${r}"${S.dc[r] < res[r] && got < need ? '' : ' disabled'}>+</button></div>`, S.dc[r] ? ' sel' : '') : '').join('')}</div><button class="ct-big o" data-a="dcgo"${got === need ? '' : ' disabled'}>Discard</button></div>`;
      }
      function stealHtml(V) {
        return `<div class="ct-box"><p class="ct-kick">Robber</p><h3>Steal from</h3><div class="ct-vict">${V.victims.map(v => `<button class="ct-vc" style="--c:${PCOL[v]}" data-a="steal" data-v="${v}"><b>${nameOf(v)}</b><span class="ct-chip">${ui('cards', 18)}${V.P[v].c}</span></button>`).join('')}</div></div>`;
      }
      function plentyHtml(V) {
        const pl = S.tr.pl;
        return `<div class="ct-box"><p class="ct-kick">Year of Plenty</p><h3>Take 2 resources</h3><div class="ct-pickrow">${[0, 1, 2, 3, 4].map(r => `<button class="ct-pick" data-a="pl" data-r="${r}"${V.bank[r] - pl.filter(x => x === r).length > 0 ? '' : ' disabled'}>${ico(r, 30)}<span class="sub">bank ${V.bank[r]}</span></button>`).join('')}</div><div class="ct-chips" style="min-height:40px">${pl.length ? pl.map(r => ico(r, 30)).join('') : '<span class="ct-empty">Pick two cards</span>'}</div><div class="ct-row" style="margin-top:10px"><button class="ct-sm pri" data-a="plgo"${pl.length === 2 ? '' : ' disabled'}>Take cards</button><button class="ct-sm" data-a="plclr">Clear</button><button class="ct-sm" data-a="close">Cancel</button></div></div>`;
      }
      function monoHtml() {
        return `<div class="ct-box"><p class="ct-kick">Monopoly</p><h3>Name a resource</h3><p>Every other player gives you all of their cards of that kind.</p><div class="ct-pickrow">${[0, 1, 2, 3, 4].map(r => `<button class="ct-pick" data-a="mono" data-r="${r}">${ico(r, 34)}<span>${RNAME[r]}</span></button>`).join('')}</div><div class="ct-row"><button class="ct-sm" data-a="close">Cancel</button></div></div>`;
      }
      function overHtml(V) {
        const rows = V.fin ? V.P.map((P, p) => `<tr class="${p === V.winner ? 'win' : ''}"><td style="color:${PCOL[p] === '#f3efe4' ? '#fff' : PCOL[p]}">${nameOf(p)}${p === V.q ? ' (you)' : ''}</td><td>${P.ns}</td><td>${P.nc}</td><td>${V.lr === p ? 2 : 0}</td><td>${V.la === p ? 2 : 0}</td><td>${V.fin[p].vpc}</td><td class="t">${V.fin[p].tot}</td></tr>`).join('') : '';
        const w = V.winner === V.q;
        let b;
        if (M.role === 'guest') b = '<p>Waiting for the host to start a rematch...</p><div class="ct-row"><button class="ct-sm" data-a="view">View board</button><button class="ct-sm dng" data-a="leave">Leave</button></div>';
        else if (M.role === 'host') b = '<button class="ct-big g" data-a="rematch">Rematch</button><div class="ct-row"><button class="ct-sm" data-a="view">View board</button><button class="ct-sm" data-a="room">Back to lobby</button><button class="ct-sm dng" data-a="leave">Leave</button></div>';
        else b = '<button class="ct-big g" data-a="play">Play again</button><div class="ct-row"><button class="ct-sm" data-a="view">View board</button><button class="ct-sm" data-a="menu2">Main menu</button></div>';
        return `<div class="ct-box"><p class="ct-kick">${w ? 'Victory' : 'Game over'}</p><h3>${w ? 'You win!' : nameOf(V.winner) + ' wins'}</h3><table class="ct-vs"><tr><th></th><th>Towns</th><th>Cities</th><th>Road</th><th>Army</th><th>VP cards</th><th>Total</th></tr>${rows}</table>${b}</div>`;
      }
      function menuHtml() {
        const seg = (k, vals, labs) => `<div class="ct-seg">${vals.map((v, i) => `<button data-a="opt" data-k="${k}" data-v="${v}"${opt[k] === v ? ' class="on"' : ''}>${labs[i]}</button>`).join('')}</div>`;
        return `<div class="ct-box">${LOGO}<p>Settle the island, trade with rivals, first to ${opt.goal} points wins.</p><div class="ct-opt"><span>Players<small>you + bots</small></span>${seg('n', [3, 4], ['3', '4'])}</div><div class="ct-opt"><span>Bots<small>skill level</small></span>${seg('lvl', ['easy', 'normal', 'hard'], ['Easy', 'Normal', 'Hard'])}</div><div class="ct-opt"><span>Win at<small>victory points</small></span>${seg('goal', [8, 10, 12], ['8', '10', '12'])}</div><div class="ct-opt"><span>Board<small>layout</small></span>${seg('board', ['random', 'balanced'], ['Random', 'Balanced'])}</div><div class="ct-opt"><span>Speed<small>bot pace</small></span>${seg('fast', [0, 1], ['Normal', 'Fast'])}</div><button class="ct-big g" data-a="play">Play vs bots<small>${sv.played ? sv.wins + ' wins in ' + sv.played + ' games' : 'quick game'}</small></button><button class="ct-big b" data-a="online">Play online<small>3 to 4 players, bots can fill seats</small></button><div class="ct-row"><button class="ct-sm" data-a="help">How to play</button></div></div>`;
      }
      function pmenuHtml() {
        const on = M.role === 'guest' ? '' : M.role === 'host' ? '<button class="ct-big o" data-a="rematch">Restart game</button>' : '<button class="ct-big o" data-a="play">New game</button>';
        return `<div class="ct-box"><p class="ct-kick">Paused</p><h3>Menu</h3><button class="ct-big g" data-a="close">Resume</button>${on}<div class="ct-row"><button class="ct-sm" data-a="help">How to play</button><button class="ct-sm dng" data-a="${M.role === 'local' ? 'menu2' : 'leave'}">${M.role === 'local' ? 'Main menu' : 'Leave game'}</button></div></div>`;
      }
      function helpHtml() {
        const c = (k, n, ic) => `<div>${ic}<span>${n}</span>${costDots(COST[k])}</div>`;
        return `<div class="ct-box"><h3>How to play</h3><div class="ct-help"><h4>Goal</h4>Be the first to reach ${opt.goal} victory points. Settlements give 1, cities 2, Longest Road (5+ roads in a row) 2, Largest Army (3+ knights) 2, and each Victory Point card 1.<h4>Your turn</h4><ul><li>Roll the dice. Every settlement next to a hex with that number collects its resource (cities collect 2).</li><li>Then trade and build in any order, and end your turn.</li><li>A 7 makes players with more than 7 cards discard half, and you move the robber and steal a card.</li></ul><h4>Building</h4><div class="ct-costs">${c('road', 'Road', ui('road', 18))}${c('settle', 'Settlement', ui('house', 18, '#fff'))}${c('city', 'City', ui('city', 18, '#fff'))}${c('dev', 'Dev card', ui('dev', 18))}</div><ul><li>A settlement must be at least 2 steps from any other settlement and connect to your road.</li><li>Cities replace your settlements.</li></ul><h4>Trading</h4><ul><li>Offer cards to the other players, or trade with the bank at 4:1 (3:1 or 2:1 with a harbour).</li></ul><h4>Controls</h4><kbd>Space</kbd> roll / end turn &middot; <kbd>R</kbd> road &middot; <kbd>S</kbd> settlement &middot; <kbd>C</kbd> city &middot; <kbd>D</kbd> dev card &middot; <kbd>T</kbd> trade &middot; <kbd>Esc</kbd> cancel</div><div class="ct-row" style="margin-top:12px"><button class="ct-sm pri" data-a="close">Got it</button></div></div>`;
      }
      function logHtml() { return `<div class="ct-box"><h3>Game log</h3><div class="ct-log" style="max-height:340px;text-align:left;background:none;border:0;padding:0">${logEl.innerHTML}</div><div class="ct-row" style="margin-top:10px"><button class="ct-sm" data-a="close">Close</button></div></div>`; }
      function boxMsg(kick, h, t, b) { return `<div class="ct-box"><p class="ct-kick">${kick}</p><h3>${h}</h3><p>${t}</p>${b || ''}</div>`; }

      function paneContent(V) {
        const d = S.dlg;
        if (d) {
          switch (d.k) {
            case 'menu': return [menuHtml(), ''];
            case 'pmenu': return [pmenuHtml(), ''];
            case 'help': return [helpHtml(), ''];
            case 'log': return [logHtml(), ''];
            case 'lobby': return [boxMsg('Online', 'Opening lobby', 'Setting up your party...', '<button class="ct-sm" data-a="leave">Cancel</button>'), ''];
            case 'wait': return [boxMsg('Online', 'Connected', 'Waiting for the host to deal...', '<button class="ct-sm" data-a="leave">Leave</button>'), ''];
            case 'left': return [boxMsg('Online', d.h, d.t, '<button class="ct-big b" data-a="online">Online lobby</button><button class="ct-big g" data-a="play">Play vs bots</button><button class="ct-sm" data-a="menu2">Main menu</button>'), ''];
          }
          if (!V) return null;
          if (d.k === 'trade') return [tradeHtml(V), ''];
          if (d.k === 'counter') { const h = counterHtml(V); return h ? [h, ''] : null; }
          if (d.k === 'plenty') return [plentyHtml(V), ''];
          if (d.k === 'mono') return [monoHtml(), ''];
          return null;
        }
        if (!V || S.busy || Q.length) return null;
        if (V.phase === 'discard' && V.disc[V.q]) return [discardHtml(V), ''];
        if (V.phase === 'steal' && V.turn === V.q) return [stealHtml(V), ' clear top'];
        if (V.phase === 'over' && !S.seenOver) return [overHtml(V), ''];
        return null;
      }
      function renderPane(V) {
        const c = paneContent(V);
        paneShown = !!c;
        paneEl.hidden = !c;
        if (c) { paneEl.className = 'ct-pane' + c[1]; setH(paneEl, c[0]); } else paneEl._h = '';
      }

      function renderAll() {
        if (!api.alive) return;
        if (!gL.robber) preview();
        const V = S.V;
        M.over = !!V && V.phase === 'over';
        if (V && S.mode && !(V.turn === V.q && V.phase === 'main' && canBuild(V)[S.mode])) S.mode = null;
        if (!V || V.phase !== 'discard') S.dc = zero();
        gL.robber.style.display = V ? '' : 'none';
        if (V) {
          drawBoard(V); drawHL(V);
          renderPlayers(V); renderBank(V); renderAwards(V); renderHand(V); renderDev(V); renderAct(V); renderHint(V);
        } else {
          gL.roads.innerHTML = ''; gL.blds.innerHTML = ''; S.prev = { road: [], vtx: [] }; S.sig = ''; S.robAt = -1;
          drawHL(null);
          [playersEl, bankEl, awardEl, handEl, devEl, actEl, hintEl].forEach(e => setH(e, ''));
          tpEl.hidden = true;
        }
        renderPane(V);
        if (V) renderTP(V);
        toolsEl.firstChild.hidden = !V;
      }

      function preview() { const b = genBoard(Math.random, false); S.hex = b.hexes; S.ports = b.ports; buildBoard(S.hex, S.ports); }
      function toMenu() {
        M.tok++; clearTimeout(M.bt); M.bt = 0; M.eng = null; M.started = false; M.role = 'local';
        try { api.net.close(); } catch (e) {}
        resetUi();
        S.V = null;
        preview();
        S.dlg = { k: 'menu' };
        renderAll();
      }
      const showMenu = toMenu;

      function openTrade() {
        S.tr = { tab: 'p', give: zero(), want: zero(), bg: -1, br: -1, pl: [] };
        S.dlg = { k: 'trade' }; S.mode = null; renderAll();
      }
      function setMode(k) {
        const V = S.V;
        if (!V || !canBuild(V)[k]) return;
        S.mode = S.mode === k ? null : k;
        renderAll();
      }
      function why(V, k) {
        if (V.turn !== V.q) return 'It is not your turn.';
        if (V.phase !== 'main') return 'Roll the dice first.';
        return 'You cannot do that right now.';
      }
      function playDev(V, t) {
        const c = (V.dev || []).filter(x => x.t === t);
        if (t === 1) return toast('Victory Point cards stay hidden until you win.');
        if (V.turn !== V.q || (V.phase !== 'roll' && V.phase !== 'main')) return toast('Play development cards on your own turn.');
        if (V.devPlayed) return toast('Only one development card per turn.');
        if (!c.some(x => x.ok)) return toast('You cannot play a card on the turn you bought it.');
        if (!idle()) return;
        if (t === 0) humanAct({ k: 'knight' });
        else if (t === 2) humanAct({ k: 'rbuild' });
        else if (t === 3) { S.tr = { pl: [] }; S.dlg = { k: 'plenty' }; renderAll(); }
        else { S.dlg = { k: 'mono' }; renderAll(); }
      }
      function closeDlg() { if (S.dlg && ['menu', 'lobby', 'wait', 'left'].indexOf(S.dlg.k) < 0) { S.dlg = null; renderAll(); } }
      function onAct(a, d) {
        const V = S.V, r = +d.r;
        switch (a) {
          case 'log': S.dlg = { k: 'log' }; renderAll(); break;
          case 'help': S.dlg = { k: 'help', back: S.dlg }; renderAll(); break;
          case 'menu': S.dlg = S.dlg && S.dlg.k === 'pmenu' ? null : V ? { k: 'pmenu' } : S.dlg; renderAll(); break;
          case 'close': if (S.dlg && S.dlg.k === 'help' && S.dlg.back) { S.dlg = S.dlg.back; renderAll(); } else closeDlg(); break;
          case 'roll': humanAct({ k: 'roll' }); break;
          case 'end': S.mode = null; humanAct({ k: 'end' }); break;
          case 'b':
            if (!V) break;
            if (d.k === 'dev') { if (humanAct({ k: 'buydev' })) renderAll(); }
            else if (d.k === 'trade') openTrade();
            else setMode(d.k);
            break;
          case 'dev': if (V) playDev(V, +d.t); break;
          case 'tpy': humanAct({ k: 'respond', r: 'yes' }); break;
          case 'tpn': humanAct({ k: 'respond', r: 'no' }); break;
          case 'tpk': {
            const t = V && V.trade;
            if (!t) break;
            S.tr = { tab: 'p', give: t.want.map((n, i) => Math.min(n, V.res[i])), want: t.give.slice(), bg: -1, br: -1, pl: [] };
            for (let i = 0; i < 5; i++) if (S.tr.give[i] && S.tr.want[i]) S.tr.want[i] = 0;
            S.dlg = { k: 'counter' }; renderAll(); break;
          }
          case 'tpc': humanAct({ k: 'confirm', with: +d.w }); break;
          case 'tpx': humanAct({ k: 'cancel' }); break;
          case 'tab': S.tr.tab = d.v; renderAll(); break;
          case 'inc': case 'dec': {
            const v = d.s === 'g' ? S.tr.give : d.s === 'w' ? S.tr.want : S.dc;
            v[r] = Math.max(0, v[r] + (a === 'inc' ? 1 : -1));
            renderAll(); break;
          }
          case 'offer': if (humanAct({ k: 'offer', give: S.tr.give.slice(), want: S.tr.want.slice() })) { S.dlg = null; renderAll(); } break;
          case 'ctr': if (humanAct({ k: 'counter', give: S.tr.give.slice(), want: S.tr.want.slice() })) { S.dlg = null; renderAll(); } break;
          case 'bg': S.tr.bg = r; if (S.tr.br === r) S.tr.br = -1; renderAll(); break;
          case 'br': S.tr.br = r; renderAll(); break;
          case 'bank': if (humanAct({ k: 'bank', g: S.tr.bg, r: S.tr.br })) { S.tr.br = -1; renderAll(); } break;
          case 'dcgo': if (humanAct({ k: 'discard', c: S.dc.slice() })) { S.dc = zero(); renderAll(); } break;
          case 'steal': humanAct({ k: 'steal', v: +d.v }); break;
          case 'pl': if (S.tr.pl.length >= 2) S.tr.pl = []; S.tr.pl.push(r); renderAll(); break;
          case 'plclr': S.tr.pl = []; renderAll(); break;
          case 'plgo': if (humanAct({ k: 'plenty', a: S.tr.pl[0], b: S.tr.pl[1] })) { S.dlg = null; renderAll(); } break;
          case 'mono': if (humanAct({ k: 'mono', r })) { S.dlg = null; renderAll(); } break;
          case 'view': S.seenOver = true; renderAll(); break;
          case 'opt': opt[d.k] = d.k === 'n' || d.k === 'goal' || d.k === 'fast' ? +d.v : d.v; saveAll(); renderAll(); break;
          case 'play': S.dlg = null; startLocal(); break;
          case 'online': startOnline(); break;
          case 'room': startOnline(); break;
          case 'rematch': S.dlg = null; hostStart(); break;
          case 'menu2': toMenu(); break;
          case 'leave': if (M.role === 'host' || M.role === 'guest' || api.online) leaveOnline(); else toMenu(); break;
        }
      }
      api.on(stage, 'click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || b.disabled) return;
        const bt = e.target.closest('button');
        if (bt) bt.blur();
        onAct(b.dataset.a, b.dataset);
      });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || !api.alive) return;
        const t = e.target;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        if (document.querySelector('.g-pause')) return;
        const V = S.V;
        if (e.key === 'Escape') {
          if (S.mode) { S.mode = null; renderAll(); e.preventDefault(); }
          else if (S.dlg && ['menu', 'lobby', 'wait', 'left'].indexOf(S.dlg.k) < 0) { if (S.dlg.k === 'help' && S.dlg.back) S.dlg = S.dlg.back; else S.dlg = null; renderAll(); e.preventDefault(); }
          else if (api.online && V && !S.dlg && !paneShown) { S.dlg = { k: 'pmenu' }; renderAll(); e.preventDefault(); }
          return;
        }
        if (!V || S.dlg || paneShown || !idle() || V.turn !== V.q) return;
        const k = e.key.toLowerCase();
        if (k === ' ' || k === 'enter') {
          if (V.phase === 'roll') humanAct({ k: 'roll' });
          else if (V.phase === 'main') { S.mode = null; humanAct({ k: 'end' }); }
          else return;
        } else if (V.phase === 'main' && (k === 'r' || k === 's' || k === 'c')) setMode({ r: 'road', s: 'settle', c: 'city' }[k]);
        else if (V.phase === 'main' && k === 'd') { if (canBuild(V).dev) humanAct({ k: 'buydev' }); else return toast('You cannot buy a development card.'); }
        else if (V.phase === 'main' && k === 't') { if (canBuild(V).trade) openTrade(); }
        else return;
        e.preventDefault();
      });
      api.on(toolsEl, 'pointerdown', e => aud());

      root._ct = { api, M, S, Q, opt, renderAll, perform, humanAct, broadcast, schedule };
      showDice(null, false);
      fit();
      if (api.net.invite) startOnline(); else showMenu();
      return { destroy() { M.tok++; clearTimeout(M.bt); clearTimeout(toastT); if (ro) ro.disconnect(); try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers['catan'] = (() => {
    const S0 = 46, cx = 200, cy = 174, ax = [[0, 0], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
    const T = [4, 3, 1, 2, 0, 1, 3], N = [0, 8, 6, 5, 9, 4, 10];
    let s = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ctcv-g" cx="50%" cy="48%" r="70%"><stop offset="0" stop-color="#2f90c2"/><stop offset="1" stop-color="#0f3f66"/></radialGradient></defs><rect width="400" height="300" fill="url(#ctcv-g)"/>`;
    ax.forEach(([q, r], i) => {
      const x = cx + SQ3 * (q + r / 2) * S0, y = cy + 1.5 * r * S0;
      s += `<polygon points="${hexPts(S0 - 1.5, x, y)}" fill="${TCOL[T[i]]}" stroke="#f1e2b4" stroke-width="3" stroke-linejoin="round"/>`;
      if (N[i]) s += `<circle cx="${x}" cy="${y}" r="15" fill="#f4e9cc" stroke="#8a6d3b" stroke-width="1.6"/><text x="${x}" y="${y + 6}" font-family="Georgia,serif" font-weight="900" font-size="${N[i] === 6 || N[i] === 8 ? 19 : 17}" fill="${N[i] === 6 || N[i] === 8 ? '#c0281c' : '#2a2418'}" text-anchor="middle">${N[i]}</text>`;
    });
    const hs = (x, y, c, d) => `<g transform="translate(${x} ${y}) scale(1.9)">${settleSVG(c, d, 0, 1)}</g>`;
    s += hs(cx - 24, cy - 40, PCOL[0], PDARK[0]) + hs(cx + 46, cy + 18, PCOL[1], PDARK[1]) + hs(cx - 52, cy + 52, PCOL[2], PDARK[2]);
    s += `<path d="M${cx - 24} ${cy - 30}L${cx + 3} ${cy - 15}" stroke="${PDARK[0]}" stroke-width="10" stroke-linecap="round"/><path d="M${cx - 24} ${cy - 30}L${cx + 3} ${cy - 15}" stroke="${PCOL[0]}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<text x="200" y="52" font-family="Georgia,'Times New Roman',serif" font-weight="900" font-size="54" letter-spacing="4" text-anchor="middle" fill="#ffd45a" stroke="#6b3a0a" stroke-width="5" paint-order="stroke" stroke-linejoin="round">CATAN</text></svg>`;
    return s;
  })();

})();
