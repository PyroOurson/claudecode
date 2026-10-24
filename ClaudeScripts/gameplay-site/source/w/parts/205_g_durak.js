
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const FONT = 'Nunito, "Arial Rounded MT Bold", system-ui, sans-serif';
  const SYM = ['♠', '♣', '♥', '♦'];
  const SNAME = ['Spades', 'Clubs', 'Hearts', 'Diamonds'];
  const LOW = { 24: 9, 36: 6, 52: 2 };
  const HAND = 6;
  const CS = id => id >> 4, CV = id => id & 15;
  const rname = v => v <= 10 ? String(v) : 'JQKA'[v - 11];
  const RFULL = v => v <= 10 ? String(v) : ['Jack', 'Queen', 'King', 'Ace'][v - 11];
  const mkDeck = k => { const a = []; for (let s = 0; s < 4; s++) for (let v = LOW[k]; v <= 14; v++) a.push(s * 16 + v); return a; };
  const cname = id => rname(CV(id)) + SYM[CS(id)];
  const beats = (a, d, t) => CS(d) === CS(a) ? CV(d) > CV(a) : CS(d) === t && CS(a) !== t;
  const maxPl = k => Math.min(6, Math.floor((k === 24 ? 24 : k === 52 ? 52 : 36) / HAND));
  const wv = (id, T) => CS(id) === T ? 8 + (CV(id) - 5) * 1.6 : CV(id) - 5;

  const tOn = (V, v) => V.table.some(c => CV(c.a) === v || (c.d >= 0 && CV(c.d) === v));
  const uncV = V => { let k = 0; for (const c of V.table) if (c.d < 0) k++; return k; };
  function canThrowV(V, id) {
    if (!V.hand.includes(id)) return false;
    if (V.phase === 'lead') return V.me === V.att && !V.table.length;
    if (!V.thr.includes(V.me) || !V.table.length) return false;
    return V.table.length < V.limit && uncV(V) + 1 <= V.counts[V.def] && tOn(V, CV(id));
  }
  function nextDefV(V, p) {
    const n = V.n, tm = q => V.rules.teams ? q % 2 : q;
    for (let i = 1; i <= n; i++) {
      const q = (p + i) % n;
      if (V.counts[q] > 0 && (!V.rules.teams || tm(q) !== tm(p))) return q;
    }
    return p;
  }
  function canTransferV(V, id) {
    if (!V.rules.perevod || V.me !== V.def || V.phase !== 'defend' || !V.hand.includes(id) || !V.table.length) return false;
    if (V.table.some(c => c.d >= 0) || CV(id) !== CV(V.table[0].a)) return false;
    const nd = nextDefV(V, V.me);
    return nd !== V.me && V.counts[nd] >= V.table.length + 1 && V.table.length + 1 <= V.cap;
  }
  const beatSlots = (V, id) => { const r = []; V.table.forEach((c, i) => { if (c.d < 0 && beats(c.a, id, V.trump)) r.push(i); }); return r; };

  function Game(o) {
    const R = o.rnd || Math.random, n = o.n, k = o.deck || 36;
    const rules = { deck: k, perevod: !!o.perevod, teams: !!o.teams && n >= 4 && n % 2 === 0, neigh: !!o.neigh, first5: o.first5 !== false };
    const rint = m => Math.floor(R() * m);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rint(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const s = { n, hands: Array.from({ length: n }, () => []), deck: [], trump: 0, tcard: -1, table: [], att: 0, def: 1, phase: 'idle', passed: [], cap: HAND, defStart: 0, outs: [], disc: 0, tid: 0, bouts: 0, durak: -1, loser: -1, game: 0 };
    let ev = [];
    const E = e => ev.push(e);
    const team = p => rules.teams ? p % 2 : p;
    const alive = p => s.hands[p].length > 0;
    const nxt = p => { for (let i = 1; i <= n; i++) { const q = (p + i) % n; if (alive(q)) return q; } return p; };
    const nextDef = p => {
      if (!rules.teams) return nxt(p);
      for (let i = 1; i <= n; i++) { const q = (p + i) % n; if (alive(q) && team(q) !== team(p)) return q; }
      return p;
    };
    const limit = () => Math.min(s.cap, s.defStart);
    const unc = () => { let c = 0; for (const x of s.table) if (x.d < 0) c++; return c; };
    const onTable = v => s.table.some(c => CV(c.a) === v || (c.d >= 0 && CV(c.d) === v));
    const snap = () => s.hands.map(h => h.slice());
    function throwers() {
      if (s.phase === 'lead') return [s.att];
      if (!(s.phase === 'defend' || s.phase === 'throw' || s.phase === 'take')) return [];
      const a = [], nd = rules.neigh ? nxt(s.def) : -1;
      for (let p = 0; p < n; p++) {
        if (p === s.def || !alive(p)) continue;
        if (rules.teams && team(p) === team(s.def)) continue;
        if (rules.neigh && p !== s.att && p !== nd) continue;
        a.push(p);
      }
      return a;
    }
    function canThrow(p, id) {
      if (!s.hands[p].includes(id)) return false;
      if (s.phase === 'lead') return p === s.att && !s.table.length;
      if (!s.table.length || !(s.phase === 'defend' || s.phase === 'throw' || s.phase === 'take')) return false;
      if (p === s.def || !alive(p)) return false;
      if (rules.teams && team(p) === team(s.def)) return false;
      if (rules.neigh && p !== s.att && p !== nxt(s.def)) return false;
      if (s.table.length >= limit() || unc() + 1 > s.hands[s.def].length) return false;
      return onTable(CV(id));
    }
    function canTransfer(p, id) {
      if (!rules.perevod || p !== s.def || s.phase !== 'defend' || !s.table.length || !s.hands[p].includes(id)) return false;
      if (s.table.some(c => c.d >= 0) || CV(id) !== CV(s.table[0].a)) return false;
      const nd = nextDef(p);
      return nd !== p && s.hands[nd].length >= s.table.length + 1 && s.table.length + 1 <= s.cap;
    }
    const pending = () => throwers().filter(p => !s.passed.includes(p) && s.hands[p].some(id => canThrow(p, id)));

    function begin(a) {
      s.att = a; s.def = nextDef(a); s.table = []; s.passed = []; s.phase = 'lead'; s.tid++;
      s.cap = rules.first5 && s.bouts === 0 ? 5 : HAND; s.bouts++;
      s.defStart = s.hands[s.def].length;
      E({ k: 'turn', att: s.att, def: s.def });
    }
    function drawUp() {
      const order = [];
      for (let i = 0; i < n; i++) { const q = (s.att + i) % n; if (q !== s.def) order.push(q); }
      order.push(s.def);
      for (const q of order) {
        const ids = [];
        while (s.hands[q].length < HAND && s.deck.length) { const id = s.deck.pop(); ids.push(id); s.hands[q].push(id); }
        if (ids.length) E({ k: 'draw', p: q, ids, tc: ids.includes(s.tcard) ? s.tcard : -1 });
      }
    }
    function checkOut() {
      if (s.deck.length) return;
      for (let p = 0; p < n; p++) if (!alive(p) && !s.outs.includes(p)) { s.outs.push(p); E({ k: 'out', p, place: s.outs.length }); }
    }
    function isOver() {
      if (s.deck.length) return false;
      const act = [];
      for (let p = 0; p < n; p++) if (alive(p)) act.push(p);
      if (rules.teams) return new Set(act.map(team)).size <= 1;
      return act.length <= 1;
    }
    function finish() {
      const act = [];
      for (let p = 0; p < n; p++) if (alive(p)) act.push(p);
      s.phase = 'over'; s.tid++;
      if (rules.teams) { s.loser = act.length ? team(act[0]) : -1; s.durak = -1; }
      else { s.durak = act.length ? act[0] : -1; s.loser = s.durak; }
      E({ k: 'over', durak: s.durak, loser: s.loser, outs: s.outs.slice(), teams: rules.teams, left: act });
    }
    function after(takeCase) {
      drawUp(); checkOut();
      if (isOver()) return finish();
      const d = s.def;
      begin(takeCase ? nxt(d) : alive(d) ? d : nxt(d));
    }
    function bito() {
      const ids = [];
      for (const c of s.table) { ids.push(c.a); if (c.d >= 0) ids.push(c.d); }
      s.disc += ids.length; s.table = [];
      E({ k: 'bito', ids, att: s.att, def: s.def });
      after(false);
    }
    function pickup() {
      const ids = [];
      for (const c of s.table) { ids.push(c.a); if (c.d >= 0) ids.push(c.d); }
      s.hands[s.def].push(...ids); s.table = [];
      E({ k: 'pickup', p: s.def, ids });
      after(true);
    }
    function settle() {
      if ((s.phase === 'throw' || s.phase === 'take') && !pending().length) return s.phase === 'take' ? pickup() : bito();
    }
    const rm = (p, id) => { const h = s.hands[p]; h.splice(h.indexOf(id), 1); };

    const g = {
      s, rules, canThrow, canTransfer, pending, throwers, limit,
      take() { const e = ev; ev = []; return e; },
      deal(first) {
        s.game++;
        s.deck = shuffle(mkDeck(k)); s.hands = Array.from({ length: n }, () => []); s.table = []; s.outs = []; s.disc = 0; s.bouts = 0; s.durak = -1; s.loser = -1; s.passed = [];
        s.tcard = s.deck[0]; s.trump = CS(s.tcard);
        for (let r = 0; r < HAND; r++) for (let i = 0; i < n; i++) s.hands[i].push(s.deck.pop());
        let owner = -1;
        if (!s.deck.length) for (let p = 0; p < n; p++) if (s.hands[p].includes(s.tcard)) owner = p;
        E({ k: 'deal', hands: snap(), tc: s.tcard, tcOwner: owner, trump: s.trump });
        let a = first >= 0 && first < n ? first : -1, why = 'loser';
        if (a < 0) {
          let best = 99, bp = -1;
          for (let p = 0; p < n; p++) for (const id of s.hands[p]) if (CS(id) === s.trump && CV(id) < best) { best = CV(id); bp = p; }
          why = 'trump';
          if (bp < 0) {
            why = 'low';
            for (let p = 0; p < n; p++) for (const id of s.hands[p]) if (CV(id) < best) { best = CV(id); bp = p; }
          }
          a = bp;
        }
        E({ k: 'first', p: a, why });
        begin(a);
      },
      act(p, a) {
        if (!a || !(p >= 0 && p < n)) return false;
        const t = a.t, ph = s.phase;
        if (ph === 'idle' || ph === 'over') return false;
        if (t === 'atk') {
          if (!canThrow(p, a.id)) return false;
          const slot = s.table.length;
          rm(p, a.id); s.table.push({ a: a.id, d: -1, by: p });
          s.passed = []; if (ph !== 'take') s.phase = 'defend';
          s.tid++;
          E({ k: 'atk', p, id: a.id, slot });
          settle();
          return true;
        }
        if (t === 'def') {
          if (p !== s.def || ph !== 'defend') return false;
          const c = s.table[a.slot];
          if (!c || c.d >= 0 || !s.hands[p].includes(a.id) || !beats(c.a, a.id, s.trump)) return false;
          rm(p, a.id); c.d = a.id; s.tid++;
          E({ k: 'def', p, id: a.id, slot: a.slot });
          if (!unc()) { s.phase = 'throw'; s.passed = []; settle(); }
          return true;
        }
        if (t === 'tr') {
          if (!canTransfer(p, a.id)) return false;
          const nd = nextDef(p), slot = s.table.length;
          rm(p, a.id); s.table.push({ a: a.id, d: -1, by: p });
          s.att = p; s.def = nd; s.defStart = s.hands[nd].length; s.passed = []; s.tid++;
          E({ k: 'tr', p, id: a.id, slot, to: nd });
          return true;
        }
        if (t === 'take') {
          if (p !== s.def || ph !== 'defend') return false;
          s.phase = 'take'; s.passed = []; s.tid++;
          E({ k: 'take', p });
          settle();
          return true;
        }
        if (t === 'pass') {
          if (!(ph === 'throw' || ph === 'take') || !throwers().includes(p) || s.passed.includes(p)) return false;
          s.passed.push(p); s.tid++;
          E({ k: 'pass', p, bito: ph === 'throw' && p === s.att });
          settle();
          return true;
        }
        return false;
      },
      need() {
        const ph = s.phase;
        if (ph === 'over' || ph === 'idle') return { k: ph, ps: [] };
        if (ph === 'lead') return { k: ph, ps: [s.att] };
        if (ph === 'defend') return { k: ph, ps: [s.def] };
        return { k: ph, ps: pending() };
      },
      view(p) {
        return {
          n, me: p, hand: (s.hands[p] || []).slice(), counts: s.hands.map(h => h.length), table: s.table.map(c => ({ a: c.a, d: c.d, by: c.by })),
          deck: s.deck.length, trump: s.trump, tcard: s.tcard, att: s.att, def: s.def, phase: s.phase, passed: s.passed.slice(), disc: s.disc, tid: s.tid,
          outs: s.outs.slice(), cap: s.cap, defStart: s.defStart, limit: limit(), rules, durak: s.durak, loser: s.loser, bouts: s.bouts, game: s.game,
          thr: throwers(), pend: pending()
        };
      }
    };
    return g;
  }

  function filt(e, me) {
    switch (e.k) {
      case 'deal': return { k: 'deal', counts: e.hands.map(h => h.length), mine: e.hands[me] || [], tc: e.tc, tcOwner: e.tcOwner, trump: e.trump };
      case 'draw': return { k: 'draw', p: e.p, c: e.ids.length, ids: e.p === me ? e.ids : null, tc: e.tc };
      default: return e;
    }
  }

  const newMem = n => ({ disc: new Set(), known: Array.from({ length: n }, () => new Set()), plan: null, leadQ: [] });
  function track(mem, e) {
    switch (e.k) {
      case 'deal':
        mem.disc.clear(); mem.known.forEach(x => x.clear()); mem.plan = null; mem.leadQ = [];
        if (e.tcOwner >= 0 && mem.known[e.tcOwner]) mem.known[e.tcOwner].add(e.tc);
        break;
      case 'atk': case 'def': case 'tr': if (mem.known[e.p]) mem.known[e.p].delete(e.id); break;
      case 'pickup': e.ids.forEach(id => mem.known[e.p].add(id)); break;
      case 'bito': e.ids.forEach(id => mem.disc.add(id)); mem.leadQ = []; break;
      case 'draw': if (e.tc >= 0 && mem.known[e.p]) mem.known[e.p].add(e.tc); break;
      case 'turn': mem.leadQ = []; break;
    }
  }

  function matching(hand, atks, T) {
    const m = new Map(), adj = atks.map(x => hand.filter(d => beats(x.a, d, T)));
    const tryA = (i, seen) => {
      for (const d of adj[i]) {
        if (seen.has(d)) continue;
        seen.add(d);
        if (!m.has(d) || tryA(m.get(d), seen)) { m.set(d, i); return true; }
      }
      return false;
    };
    for (let i = 0; i < atks.length; i++) if (!tryA(i, new Set())) return null;
    const out = [];
    m.forEach((i, d) => out.push({ slot: atks[i].slot, id: d }));
    return out;
  }
  function coverPlan(hand, atks, T) {
    const order = atks.slice().sort((x, y) => wv(y.a, T) - wv(x.a, T)), used = new Set(), out = [];
    for (const x of order) {
      let b = -1, bw = 1e9;
      for (const d of hand) if (!used.has(d) && beats(x.a, d, T)) { const w = wv(d, T); if (w < bw) { bw = w; b = d; } }
      if (b < 0) return matching(hand, atks, T);
      used.add(b); out.push({ slot: x.slot, id: b });
    }
    return out;
  }

  const AIP = {
    Easy: { err: .4, cc: false, multi: 0, cheap: 3, thr: .3, tk: 9, tx: 0, txd: 6, mc: false, think: [900, 1700] },
    Normal: { err: .06, cc: false, multi: .5, cheap: 4, thr: .6, tk: 30, tx: 0, txd: 6, mc: false, think: [750, 1400] },
    Hard: { err: 0, cc: true, multi: .85, cheap: 5, thr: .85, tk: 30, tx: 0, txd: 6, mc: false, think: [600, 1150] },
    Expert: { err: 0, cc: true, multi: .85, cheap: 5, thr: .85, tk: 30, tx: 0, txd: 6, mc: true, think: [550, 1000] }
  };

  function aiDefend(V, mem, P, R) {
    const T = V.trump, hand = V.hand, unc = [];
    V.table.forEach((c, i) => { if (c.d < 0) unc.push({ slot: i, a: c.a }); });
    if (mem.plan && mem.plan.b === V.bouts && mem.plan.def === V.me && mem.plan.cnt === V.table.length) {
      const st = mem.plan.list.filter(x => V.table[x.slot] && V.table[x.slot].d < 0 && hand.includes(x.id));
      if (st.length === unc.length && st.length) return { t: 'def', id: st[0].id, slot: st[0].slot };
    }
    mem.plan = null;
    const plan = coverPlan(hand, unc, T);
    const tcs = hand.filter(id => canTransferV(V, id));
    if (P.err && R() < P.err) {
      if (plan && R() < .6) { mem.plan = { b: V.bouts, def: V.me, cnt: V.table.length, list: plan }; return { t: 'def', id: plan[0].id, slot: plan[0].slot }; }
      return { t: 'take' };
    }
    let trId = -1, trW = 1e9;
    for (const id of tcs) { const w = wv(id, T); if (w < trW) { trW = w; trId = id; } }
    if (!plan) return trId >= 0 && (trW < 12 || V.deck === 0) ? { t: 'tr', id: trId } : { t: 'take' };
    const tbl = [];
    V.table.forEach(c => { tbl.push(c.a); if (c.d >= 0) tbl.push(c.d); });
    const late = V.deck === 0 ? 4 : 0;
    let takeCost = 0;
    for (const id of tbl) takeCost += P.tk + late - (CS(id) === T ? wv(id, T) * .55 : Math.max(0, wv(id, T)) * .3);
    let defCost = 0;
    for (const x of plan) defCost += wv(x.id, T);
    if (V.deck > 0 && V.deck <= 4) defCost *= .85;
    if (trId >= 0 && trW < defCost * .85 + 1 && (CS(trId) !== T || defCost > 8)) return { t: 'tr', id: trId };
    const last = hand.length - plan.length <= 0;
    let tsum = 0;
    for (const x of plan) if (CS(x.id) === T) tsum += wv(x.id, T);
    if (!last && P.tx && tsum > P.tx && V.deck > P.txd && tbl.length <= 4) return { t: 'take' };
    if (!last && defCost > takeCost && V.counts[V.att] > 0 && !(V.deck === 0 && hand.length <= plan.length + 1)) return { t: 'take' };
    mem.plan = { b: V.bouts, def: V.me, cnt: V.table.length, list: plan };
    return { t: 'def', id: plan[0].id, slot: plan[0].slot };
  }

  function leadScore(V, mem, P, id, hand) {
    const T = V.trump;
    let sc = wv(id, T);
    const same = hand.filter(x => x !== id && CV(x) === CV(id) && CS(x) !== T).length;
    if (CS(id) !== T) sc -= same * 2.4 * P.multi;
    if (P.cc && mem.known[V.def]) {
      let b = 0;
      mem.known[V.def].forEach(d => { if (beats(id, d, T)) b++; });
      sc += b * 1.1;
      let hasKnown = false;
      mem.known[V.def].forEach(d => { if (CV(d) === CV(id) && CS(d) !== T) hasKnown = true; });
      if (hasKnown) sc += 1;
    }
    if (CS(id) === T && hand.some(x => CS(x) !== T)) sc += 6;
    return sc;
  }
  function aiLead(V, mem, P, R) {
    const hand = V.hand, T = V.trump;
    if (P.err && R() < P.err) return { t: 'atk', id: hand[Math.floor(R() * hand.length)] };
    let best = hand[0], bv = 1e9;
    for (const id of hand) {
      let sc = leadScore(V, mem, P, id, hand) + R() * (P.err ? 1.5 : .25);
      if (V.deck === 0 && CS(id) === T) sc -= 3;
      if (sc < bv) { bv = sc; best = id; }
    }
    mem.leadQ = [];
    if (P.multi && CS(best) !== T && V.counts[V.def] >= 2 && R() < P.multi) {
      const more = hand.filter(x => x !== best && CV(x) === CV(best) && CS(x) !== T);
      mem.leadQ = more.slice(0, Math.min(more.length, 2, V.counts[V.def] - 1, V.limit - 1));
    }
    return { t: 'atk', id: best };
  }
  function aiThrow(V, mem, P, R) {
    const T = V.trump, c = V.hand.filter(id => canThrowV(V, id));
    if (!c.length) return { t: 'pass' };
    c.sort((a, b) => wv(a, T) - wv(b, T));
    const id = c[0], w = wv(id, T), nt = CS(id) !== T;
    if (P.err && R() < P.err) return R() < .5 ? { t: 'atk', id: c[Math.floor(R() * c.length)] } : { t: 'pass' };
    const dc = V.counts[V.def];
    if (V.phase === 'take') {
      const nonT = c.filter(x => CS(x) !== T);
      if (nonT.length) return { t: 'atk', id: nonT[0] };
      if (V.deck === 0 && c.length && V.hand.length <= 2) return { t: 'atk', id };
      return { t: 'pass' };
    }
    if (V.deck === 0) {
      const un = uncV(V);
      if (dc - un <= 1 && V.counts[V.def] <= 3 && !V.hand.every(x => canThrowV(V, x))) return { t: 'pass' };
      if (nt || V.hand.length <= 2) return { t: 'atk', id };
      return { t: 'pass' };
    }
    if (nt && w <= P.cheap && R() < P.thr) {
      if (P.cc && V.hand.length <= 6 && w > 3 && R() < .5) return { t: 'pass' };
      return { t: 'atk', id };
    }
    return { t: 'pass' };
  }
  function aiAct(V, mem, P, R) {
    const me = V.me, ph = V.phase;
    if (ph === 'lead') return me === V.att ? aiLead(V, mem, P, R) : null;
    if (ph === 'defend') {
      if (me === V.def) return aiDefend(V, mem, P, R);
      if (me === V.att && mem.leadQ.length && V.table.every(c => c.d < 0)) {
        mem.leadQ = mem.leadQ.filter(id => V.hand.includes(id));
        const id = mem.leadQ.find(x => canThrowV(V, x));
        if (id != null) { mem.leadQ = mem.leadQ.filter(x => x !== id); return { t: 'atk', id }; }
        mem.leadQ = [];
      }
      return null;
    }
    if ((ph === 'throw' || ph === 'take') && V.pend.includes(me)) return aiThrow(V, mem, P, R);
    return null;
  }

  function qThrow(g, p, R) {
    const s = g.s, T = s.trump, c = s.hands[p].filter(id => g.canThrow(p, id));
    if (!c.length) return { t: 'pass' };
    let b = c[0];
    for (const id of c) if (wv(id, T) < wv(b, T)) b = id;
    const w = wv(b, T), nt = CS(b) !== T;
    if (s.phase === 'take') return nt ? { t: 'atk', id: b } : { t: 'pass' };
    if (s.deck.length === 0) return nt && R() < .85 ? { t: 'atk', id: b } : { t: 'pass' };
    return nt && w <= 4 && R() < .6 ? { t: 'atk', id: b } : { t: 'pass' };
  }
  function qStep(g, R) {
    const s = g.s, T = s.trump, ph = s.phase;
    if (ph === 'over' || ph === 'idle') return false;
    if (ph === 'lead') {
      const h = s.hands[s.att];
      let b = h[0], bw = 1e9;
      for (const id of h) { const w = wv(id, T) + (CS(id) === T ? 6 : 0) - (h.filter(x => CV(x) === CV(id)).length - 1) * 1.5 + R() * .5; if (w < bw) { bw = w; b = id; } }
      return g.act(s.att, { t: 'atk', id: b });
    }
    if (ph === 'defend') {
      const p = s.def, h = s.hands[p], atks = [];
      s.table.forEach((c, i) => { if (c.d < 0) atks.push({ slot: i, a: c.a }); });
      if (g.rules.perevod && !s.table.some(c => c.d >= 0)) {
        let b = -1, bw = 1e9;
        for (const id of h) if (g.canTransfer(p, id) && wv(id, T) < bw) { bw = wv(id, T); b = id; }
        if (b >= 0 && bw < 8) return g.act(p, { t: 'tr', id: b });
      }
      const plan = coverPlan(h, atks, T);
      if (!plan) return g.act(p, { t: 'take' });
      let cost = 0;
      for (const x of plan) cost += wv(x.id, T);
      if (cost > 9 + (s.deck.length === 0 ? 8 : 0) + R() * 3 && h.length > plan.length) return g.act(p, { t: 'take' });
      for (const x of plan) g.act(p, { t: 'def', id: x.id, slot: x.slot });
      return true;
    }
    const ps = g.pending();
    if (!ps.length) return false;
    return g.act(ps[0], qThrow(g, ps[0], R));
  }
  function result(g, p) {
    const s = g.s, T = g.rules.teams;
    if (s.phase !== 'over') return null;
    if (T) return s.loser < 0 ? .5 : s.loser === p % 2 ? 0 : 1;
    return s.durak < 0 ? .5 : s.durak === p ? 0 : 1;
  }
  function rollout(g, p, R) {
    for (let i = 0; i < 700; i++) {
      if (!qStep(g, R)) break;
      g.take();
    }
    const r = result(g, p);
    if (r != null) return r;
    const s = g.s;
    let tot = 0;
    for (let q = 0; q < s.n; q++) tot += s.hands[q].length;
    return Math.max(0, Math.min(1, .5 - (s.hands[p].length - tot / s.n) / 24));
  }
  function determinize(V, mem, R) {
    const n = V.n, T = V.trump, seen = new Set(V.hand);
    mem.disc.forEach(x => seen.add(x));
    V.table.forEach(c => { seen.add(c.a); if (c.d >= 0) seen.add(c.d); });
    const pool = mkDeck(V.rules.deck).filter(id => !seen.has(id) && !(V.deck > 0 && id === V.tcard));
    const hands = Array(n).fill(null);
    hands[V.me] = V.hand.slice();
    for (let q = 0; q < n; q++) {
      if (q === V.me) continue;
      hands[q] = [];
      mem.known[q].forEach(id => {
        const i = pool.indexOf(id);
        if (i >= 0 && hands[q].length < V.counts[q]) { hands[q].push(id); pool.splice(i, 1); }
      });
    }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    for (let q = 0; q < n; q++) {
      if (q === V.me) continue;
      while (hands[q].length < V.counts[q] && pool.length) hands[q].push(pool.pop());
      if (hands[q].length !== V.counts[q]) return null;
    }
    const deck = V.deck > 0 ? [V.tcard, ...pool] : pool;
    if (deck.length !== V.deck) return null;
    const g2 = Game({ n, deck: V.rules.deck, perevod: V.rules.perevod, teams: V.rules.teams, neigh: V.rules.neigh, first5: V.rules.first5, rnd: R });
    Object.assign(g2.s, { hands, deck, trump: T, tcard: V.tcard, table: V.table.map(c => ({ a: c.a, d: c.d, by: c.by })), att: V.att, def: V.def, phase: V.phase, passed: V.passed.slice(), cap: V.cap, defStart: V.defStart, outs: V.outs.slice(), disc: V.disc, tid: V.tid, bouts: Math.max(1, V.bouts), durak: -1, loser: -1 });
    return g2;
  }
  const akey = a => a.t + (a.id != null ? a.id : '') + ':' + (a.slot != null ? a.slot : '');
  function mcCands(V, mem, P, R, base) {
    const T = V.trump, hand = V.hand, out = [base], seen = new Set([akey(base)]);
    const add = a => { const k = akey(a); if (!seen.has(k)) { seen.add(k); out.push(a); } };
    if (V.phase === 'defend' && V.me === V.def) {
      const first = V.table.findIndex(c => c.d < 0);
      const covers = hand.filter(id => beats(V.table[first].a, id, T)).sort((a, b) => wv(a, T) - wv(b, T)).slice(0, 3);
      covers.forEach(id => add({ t: 'def', id, slot: first }));
      add({ t: 'take' });
      hand.filter(id => canTransferV(V, id)).slice(0, 2).forEach(id => add({ t: 'tr', id }));
    } else if (V.phase === 'lead') {
      hand.map(id => ({ id, sc: leadScore(V, mem, P, id, hand) })).sort((a, b) => a.sc - b.sc).slice(0, 4).forEach(x => add({ t: 'atk', id: x.id }));
    } else if (V.phase === 'throw' || V.phase === 'take') {
      add({ t: 'pass' });
      hand.filter(id => canThrowV(V, id)).sort((a, b) => wv(a, T) - wv(b, T)).slice(0, 3).forEach(id => add({ t: 'atk', id }));
    }
    return out;
  }
  function mcSearch(V, mem, P, R) {
    const base = aiAct(V, mem, P, R);
    if (!base || V.phase === 'defend' && V.me !== V.def) return { base, step() {}, best: () => base };
    const cands = mcCands(V, mem, P, R, base);
    if (cands.length < 2) return { base, step() {}, best: () => base };
    const tot = cands.map(() => 0), cnt = cands.map(() => 0);
    let i = 0, bad = 0;
    return {
      base,
      step(ms) {
        const t0 = performance.now();
        while (performance.now() - t0 < ms && i < 6000 && bad < 30) {
          const ci = i % cands.length; i++;
          const g2 = determinize(V, mem, R);
          if (!g2) { bad++; continue; }
          if (!g2.act(V.me, cands[ci])) { tot[ci] -= 1; cnt[ci]++; continue; }
          g2.take();
          tot[ci] += rollout(g2, V.me, R); cnt[ci]++;
        }
      },
      best() {
        let bi = 0, bv = -1e9;
        cands.forEach((_, k) => { const v = cnt[k] ? tot[k] / cnt[k] + (k === 0 ? .03 : 0) : -1; if (v > bv) { bv = v; bi = k; } });
        mem.plan = null;
        return cands[bi];
      }
    };
  }

  const RED = '#d02a2e', BLK = '#1b1c22', GOLD = '#e9b83a', CREAM = '#fbf3dc';
  const scol = s => s >= 2 ? RED : BLK;
  function cpath(x, w, h, r) { x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, r); }

  function heart(x, r, fl) {
    const f = fl ? -1 : 1;
    x.moveTo(0, f * r);
    x.bezierCurveTo(-r * 1.12, f * r * .3, -r * 1.2, -f * r * .78, -r * .58, -f * r * .86);
    x.bezierCurveTo(-r * .28, -f * r * .9, 0, -f * r * .62, 0, -f * r * .36);
    x.bezierCurveTo(0, -f * r * .62, r * .28, -f * r * .9, r * .58, -f * r * .86);
    x.bezierCurveTo(r * 1.2, -f * r * .78, r * 1.12, f * r * .3, 0, f * r);
    x.closePath();
  }
  function suitFill(x, s, r) {
    x.beginPath();
    if (s === 2) { heart(x, r, false); x.fill(); return; }
    if (s === 3) {
      x.moveTo(0, -r * 1.08); x.quadraticCurveTo(r * .18, -r * .4, r * .7, 0); x.quadraticCurveTo(r * .18, r * .4, 0, r * 1.08);
      x.quadraticCurveTo(-r * .18, r * .4, -r * .7, 0); x.quadraticCurveTo(-r * .18, -r * .4, 0, -r * 1.08); x.closePath(); x.fill(); return;
    }
    if (s === 0) {
      heart(x, r * .92, true); x.fill();
      x.beginPath(); x.moveTo(-r * .06, r * .35); x.quadraticCurveTo(-r * .08, r * .75, -r * .4, r * 1.02); x.lineTo(r * .4, r * 1.02); x.quadraticCurveTo(r * .08, r * .75, r * .06, r * .35); x.closePath(); x.fill();
      return;
    }
    x.moveTo(r * .46, -r * .5); x.arc(0, -r * .5, r * .46, 0, TAU);
    x.moveTo(-r * .06, r * .2); x.arc(-r * .52, r * .2, r * .46, 0, TAU);
    x.moveTo(r * .98, r * .2); x.arc(r * .52, r * .2, r * .46, 0, TAU);
    x.moveTo(r * .3, 0); x.arc(0, 0, r * .3, 0, TAU);
    x.fill();
    x.beginPath(); x.moveTo(-r * .07, r * .1); x.quadraticCurveTo(-r * .08, r * .7, -r * .4, r * 1.02); x.lineTo(r * .4, r * 1.02); x.quadraticCurveTo(r * .08, r * .7, r * .07, r * .1); x.closePath(); x.fill();
  }
  function pip(x, s, px, py, r, rot, col) {
    x.save(); x.translate(px, py); if (rot) x.rotate(rot); x.fillStyle = col || scol(s); suitFill(x, s, r); x.restore();
  }
  const LAY = {
    2: [[0, -1], [0, 1]], 3: [[0, -1], [0, 0], [0, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]], 7: [[-1, -1], [1, -1], [0, -.5], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    8: [[-1, -1], [1, -1], [0, -.5], [-1, 0], [1, 0], [0, .5], [-1, 1], [1, 1]],
    9: [[-1, -1], [1, -1], [-1, -.33], [1, -.33], [0, 0], [-1, .33], [1, .33], [-1, 1], [1, 1]],
    10: [[-1, -1], [1, -1], [0, -.67], [-1, -.33], [1, -.33], [-1, .33], [1, .33], [0, .67], [-1, 1], [1, 1]]
  };
  function figure(x, v, s, w, h) {
    const red = s >= 2, c1 = red ? '#c8262c' : '#27479a', pw = w * .26, ph = h * .34, skin = '#f1c9a0';
    x.save();
    x.beginPath(); x.rect(-pw, -ph, pw * 2, ph * 2); x.fillStyle = CREAM; x.fill();
    x.save(); x.clip();
    for (let k = 0; k < 2; k++) {
      x.save(); if (k) x.rotate(Math.PI);
      if (v === 12) { x.fillStyle = '#d9a441'; x.beginPath(); x.ellipse(0, -ph * .56, pw * .46, pw * .56, 0, 0, TAU); x.fill(); }
      x.fillStyle = c1; x.beginPath(); x.moveTo(-pw * 1.02, 0); x.quadraticCurveTo(-pw * .95, -ph * .4, -pw * .34, -ph * .4); x.lineTo(pw * .34, -ph * .4); x.quadraticCurveTo(pw * .95, -ph * .4, pw * 1.02, 0); x.closePath(); x.fill();
      x.strokeStyle = GOLD; x.lineWidth = w * .022; x.lineJoin = 'round';
      x.beginPath(); x.moveTo(-pw * .34, -ph * .4); x.lineTo(0, -ph * .18); x.lineTo(pw * .34, -ph * .4); x.stroke();
      x.beginPath(); x.moveTo(-pw * .98, -ph * .08); x.quadraticCurveTo(0, -ph * .26, pw * .98, -ph * .08); x.stroke();
      x.fillStyle = skin; x.fillRect(-pw * .1, -ph * .46, pw * .2, ph * .08);
      x.beginPath(); x.arc(0, -ph * .6, pw * .3, 0, TAU); x.fill();
      x.fillStyle = '#2a1b12'; x.beginPath(); x.arc(-pw * .1, -ph * .6, pw * .035, 0, TAU); x.arc(pw * .1, -ph * .6, pw * .035, 0, TAU); x.fill();
      if (v === 13) {
        x.fillStyle = '#6b4a2b'; x.beginPath(); x.moveTo(-pw * .3, -ph * .58); x.quadraticCurveTo(0, -ph * .34, pw * .3, -ph * .58); x.quadraticCurveTo(0, -ph * .5, -pw * .3, -ph * .58); x.fill();
      } else {
        x.fillStyle = v === 12 ? '#d9a441' : '#5a3a1f'; x.beginPath(); x.arc(0, -ph * .64, pw * .31, Math.PI, TAU); x.fill();
      }
      if (v === 13 || v === 12) {
        x.fillStyle = GOLD; x.beginPath(); x.moveTo(-pw * .32, -ph * .72); x.lineTo(-pw * .34, -ph * .93); x.lineTo(-pw * .16, -ph * .82); x.lineTo(0, -ph * .97); x.lineTo(pw * .16, -ph * .82); x.lineTo(pw * .34, -ph * .93); x.lineTo(pw * .32, -ph * .72); x.closePath(); x.fill();
        x.strokeStyle = '#a77a14'; x.lineWidth = w * .01; x.stroke();
      } else {
        x.fillStyle = c1; x.beginPath(); x.moveTo(-pw * .34, -ph * .7); x.quadraticCurveTo(0, -ph * .98, pw * .34, -ph * .7); x.closePath(); x.fill();
        x.strokeStyle = GOLD; x.lineWidth = w * .02; x.beginPath(); x.moveTo(pw * .1, -ph * .84); x.quadraticCurveTo(pw * .5, -ph * .95, pw * .62, -ph * .6); x.stroke();
      }
      x.lineCap = 'round'; x.strokeStyle = '#8c8c94'; x.lineWidth = w * .028;
      if (v === 13) { x.beginPath(); x.moveTo(pw * .66, -ph * .06); x.lineTo(pw * .66, -ph * .66); x.stroke(); x.strokeStyle = GOLD; x.beginPath(); x.moveTo(pw * .5, -ph * .2); x.lineTo(pw * .82, -ph * .2); x.stroke(); }
      else if (v === 11) { x.beginPath(); x.moveTo(-pw * .66, -ph * .04); x.lineTo(-pw * .66, -ph * .78); x.stroke(); x.fillStyle = '#b9bcc6'; x.beginPath(); x.moveTo(-pw * .66, -ph * .78); x.lineTo(-pw * .86, -ph * .6); x.lineTo(-pw * .66, -ph * .52); x.fill(); }
      else { x.fillStyle = scol(s); x.beginPath(); x.arc(-pw * .66, -ph * .26, pw * .13, 0, TAU); x.fill(); x.strokeStyle = '#3a8a3a'; x.beginPath(); x.moveTo(-pw * .66, -ph * .13); x.lineTo(-pw * .66, 0); x.stroke(); }
      pip(x, s, pw * .66, -ph * .82, w * .05);
      x.restore();
    }
    x.restore();
    x.lineWidth = w * .016; x.strokeStyle = '#a58840'; x.strokeRect(-pw, -ph, pw * 2, ph * 2);
    x.lineWidth = w * .008; x.beginPath(); x.moveTo(-pw, 0); x.lineTo(pw, 0); x.stroke();
    x.restore();
  }
  function cardFace(x, id, w, h) {
    const s = CS(id), v = CV(id), col = scol(s);
    cpath(x, w, h, w * .09); x.fillStyle = '#fffefa'; x.fill();
    x.lineWidth = Math.max(.6, w * .012); x.strokeStyle = 'rgba(0,0,0,.34)'; x.stroke();
    const tx = -w / 2 + w * .15, ty = -h / 2 + h * .1;
    x.font = `800 ${v === 10 ? w * .23 : w * .28}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col;
    for (let k = 0; k < 2; k++) {
      x.save(); if (k) x.rotate(Math.PI);
      x.fillText(rname(v), tx, ty);
      pip(x, s, tx, ty + w * .21, w * .075);
      x.restore();
    }
    if (v >= 11 && v <= 13) { figure(x, v, s, w, h); return; }
    if (v === 14) {
      pip(x, s, 0, 0, w * (s === 0 ? .28 : .24));
      return;
    }
    const lay = LAY[v] || [], r = w * (v <= 3 ? .115 : .098);
    for (const [cx, cy] of lay) pip(x, s, cx * w * .215, cy * h * .335, r, cy > 0 ? Math.PI : 0);
  }
  function cardBack(x, w, h, style) {
    cpath(x, w, h, w * .09); x.fillStyle = '#fffefa'; x.fill();
    x.lineWidth = Math.max(.6, w * .012); x.strokeStyle = 'rgba(0,0,0,.34)'; x.stroke();
    const m = w * .07, iw = w - m * 2, ih = h - m * 2, red = style === 'red';
    cpath(x, iw, ih, w * .06);
    const g = x.createLinearGradient(0, -ih / 2, 0, ih / 2);
    g.addColorStop(0, red ? '#c4343a' : '#2f55ab'); g.addColorStop(1, red ? '#861a20' : '#1b3478');
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = Math.max(.6, w * .013);
    const st = w * .12;
    for (let o = -h * 1.2; o < h * 1.2; o += st) {
      x.beginPath(); x.moveTo(-w, o - w); x.lineTo(w, o + w); x.stroke();
      x.beginPath(); x.moveTo(-w, o + w); x.lineTo(w, o - w); x.stroke();
    }
    x.restore();
    cpath(x, iw * .8, ih * .84, w * .05); x.lineWidth = Math.max(.7, w * .018); x.strokeStyle = 'rgba(255,255,255,.65)'; x.stroke();
    x.beginPath(); x.ellipse(0, 0, w * .25, h * .2, 0, 0, TAU); x.fillStyle = red ? '#8c1c22' : '#1d3a80'; x.fill(); x.lineWidth = w * .02; x.strokeStyle = '#fff'; x.stroke();
    const rr = w * .075;
    [[0, -h * .09, 0], [w * .12, 0, 2], [0, h * .09, 3], [-w * .12, 0, 1]].forEach(([px, py, s]) => pip(x, s, px, py, rr, 0, '#fff'));
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
  function swordIco(x, s) {
    x.save(); x.rotate(-Math.PI / 4); x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(0, -s * .5); x.lineTo(s * .1, -s * .3); x.lineTo(s * .1, s * .14); x.lineTo(-s * .1, s * .14); x.lineTo(-s * .1, -s * .3); x.closePath(); x.fill();
    x.fillRect(-s * .24, s * .14, s * .48, s * .08); x.fillRect(-s * .05, s * .22, s * .1, s * .2);
    x.restore();
  }
  function shieldIco(x, s) {
    x.fillStyle = '#fff'; x.beginPath();
    x.moveTo(-s * .36, -s * .4); x.lineTo(s * .36, -s * .4); x.lineTo(s * .36, -s * .02); x.quadraticCurveTo(s * .34, s * .32, 0, s * .5); x.quadraticCurveTo(-s * .34, s * .32, -s * .36, -s * .02); x.closePath(); x.fill();
  }

  const ICON_MENU = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
  const CPU_NAMES = ['Ivan', 'Katya', 'Boris', 'Natasha', 'Dmitri', 'Olga', 'Sasha', 'Misha', 'Vera'];
  const FELTS = { green: ['#2f9c5a', '#1b6a3a', '#0a3a1f'], blue: ['#3487cf', '#1b5597', '#0a2650'], red: ['#b83a3a', '#7e2020', '#3c0c0c'], wood: ['#8a5a34', '#5e3a1e', '#2c1a0c'] };
  const RULES = `<h3>How to play</h3><div class="dk-rules">
<p><b>Goal:</b> get rid of all your cards. The last player holding cards is the <b>durak</b> (the fool). Everyone gets 6 cards; the bottom card of the deck sets the <b>trump</b> suit.</p>
<p><b>Attack and defence.</b> The attacker leads a card. The defender must beat it with a higher card of the <b>same suit</b>, or with any <b>trump</b> (a trump can only be beaten by a higher trump). Beat every card on the table.</p>
<p><b>Throwing in.</b> While a bout goes on the attacker, and in the normal game every other player except the defender, may add cards whose <b>rank is already on the table</b>. At most 6 cards (5 in the very first bout), and never more than the defender holds.</p>
<p><b>Bito.</b> When every card is beaten and nobody wants to add more, press <b>Bito</b> (pass): the cards go to the discard pile. Everyone refills to 6 from the deck: the attacker first, the defender last. The defender then attacks next.</p>
<p><b>Take.</b> If you can't or won't beat a card, press <b>Take</b>: the others may still throw in cards for you to pick up, you take the whole table, and the attack moves on to the player after you.</p>
<p><b>Transfer (Perevodnoy).</b> If you haven't beaten anything yet you may pass the attack to the next player by adding a card of the <b>same rank</b>, as long as that player holds enough cards to beat them all. Transfers can chain around the table.</p>
<p><b>Teams.</b> With 4 or 6 players seats alternate between two teams. You only ever fight the other team, teammates never throw in on each other, and a team wins when all of its players are out of cards.</p>
<p><b>Order of play.</b> The player with the lowest trump starts the first game. Later the durak starts. Draws are possible when the last cards leave together.</p>
<p><b>Controls:</b> drag a card onto the table or onto the card it beats, or tap it. With several targets tap the card, then the target. <kbd>&larr;</kbd><kbd>&rarr;</kbd> pick, <kbd>Enter</kbd> play, <kbd>T</kbd> take, <kbd>B</kbd> bito/pass, <kbd>X</kbd> transfer.</p></div>`;

  Ameplay.register({
    id: 'durak',
    title: 'Durak',
    category: 'Board',
    tint: '#1f7a46',
    blurb: 'The classic Russian card game: beat every attack, throw in cards, and don\'t be the last one holding any. Throw-in and transfer variants, teams, online with bots.',
    help: 'Drag a card onto the table or onto the card it beats, or tap it · <kbd>T</kbd> take · <kbd>B</kbd> bito / pass · <kbd>X</kbd> transfer · <kbd>&larr;</kbd><kbd>&rarr;</kbd> + <kbd>Enter</kbd>',
    width: 960,
    better: 'high',
    format: v => v + (v === 1 ? ' win' : ' wins'),
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="14" width="26" height="38" rx="4" transform="rotate(-14 21 33)"/><rect x="30" y="12" width="26" height="38" rx="4" transform="rotate(12 43 31)"/><path d="M43 26c-3-4-8-1-6 3 1 3 6 6 6 6s5-3 6-6c2-4-3-7-6-3z" fill="currentColor"/></svg>',
    _t: { Game, aiAct, mcSearch, newMem, track, AIP, filt, canThrowV, canTransferV, beatSlots, mkDeck, determinize, qStep, rollout, CS, CV, beats, maxPl, cardFace, cardBack },
    css: `
.gm-durak{gap:0}
.gm-durak [hidden]{display:none!important}
.gm-durak .dk-wrap{position:relative;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(10,40,25,.28);touch-action:none;background:#145c32}
.gm-durak .dk-wrap>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gm-durak .dk-ui{position:absolute;inset:0;pointer-events:none;font-family:var(--sans);color:#fff}
.gm-durak .dk-ui button{pointer-events:auto;font-family:var(--sans);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.gm-durak .dk-ico{position:absolute;left:10px;top:10px;width:44px;height:44px;border-radius:14px;border:2px solid rgba(255,255,255,.22);background:rgba(0,0,0,.3);color:#fff;display:grid;place-items:center;padding:0}
.gm-durak .dk-act{position:absolute;white-space:nowrap;min-width:104px;height:50px;padding:0 18px;border-radius:25px;border:3px solid #fff;color:#fff;font:900 18px var(--sans);letter-spacing:.2px;text-shadow:0 2px 0 rgba(0,0,0,.3);transform:translate(-50%,-50%);box-shadow:0 5px 0 rgba(0,0,0,.35),0 10px 18px rgba(0,0,0,.3)}
.gm-durak .dk-port .dk-act{min-width:92px;height:46px;font-size:16px;padding:0 12px}
.gm-durak .dk-act:active{transform:translate(-50%,-46%)}
.gm-durak .dk-take{background:linear-gradient(#ff6a4d,#c92a14)}
.gm-durak .dk-bito{background:linear-gradient(#45c463,#1f8a3a)}
.gm-durak .dk-tr{background:linear-gradient(#4a97f2,#1659b5)}
.gm-durak .dk-act.hot{animation:dk-pulse .55s infinite alternate}
@keyframes dk-pulse{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.07)}}
.gm-durak .dk-net{position:absolute;right:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:rgba(0,0,0,.32);font:800 11px var(--sans)}
.gm-durak .dk-net i{width:8px;height:8px;border-radius:50%;background:#5be27a}
.gm-durak .dk-net.bad i{background:#ff5b4b}
.gm-durak .dk-pane{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;pointer-events:auto;background:rgba(3,16,9,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);overflow:auto;touch-action:pan-y}
.gm-durak .dk-pane.clear{background:transparent;-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-durak .dk-pane.solid{background:radial-gradient(circle at 50% 38%,var(--dk-f1,#25784a),var(--dk-f2,#0b3720));-webkit-backdrop-filter:none;backdrop-filter:none}
.gm-durak .dk-box{width:100%;max-width:410px;margin:auto;background:linear-gradient(#27503a,#122a1d);border:3px solid rgba(255,255,255,.16);border-radius:22px;padding:16px 16px 14px;text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.45);animation:dk-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes dk-in{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}
.gm-durak .dk-box h3{margin:2px 0 8px;font:900 22px var(--sans);letter-spacing:.2px}
.gm-durak .dk-box p{margin:6px 0;font:700 14px/1.4 var(--sans);color:rgba(255,255,255,.86)}
.gm-durak .dk-kick{font:900 11px var(--sans)!important;letter-spacing:1.4px;text-transform:uppercase;color:#f3c64a!important;margin:0 0 2px!important}
.gm-durak .dk-big{display:block;width:100%;min-height:54px;margin:9px 0;border:0;border-radius:17px;color:#fff;font:900 20px/1.05 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.28);box-shadow:inset 0 -5px 0 rgba(0,0,0,.22),0 6px 14px rgba(0,0,0,.3);padding:6px 10px}
.gm-durak .dk-big small{display:block;font:800 12px var(--sans);opacity:.88;text-shadow:none;margin-top:2px}
.gm-durak .dk-big.last{outline:3px solid #fff;outline-offset:2px}
.gm-durak .red{background:linear-gradient(#ff5d4d,#cf2117)}
.gm-durak .blue{background:linear-gradient(#3d8cf0,#1659b5)}
.gm-durak .green{background:linear-gradient(#45c463,#1f8a3a)}
.gm-durak .yellow{background:linear-gradient(#ffd84a,#e6a800);color:#2a1e00;text-shadow:none}
.gm-durak .dk-sm{min-height:44px;padding:0 14px;border-radius:14px;border:2px solid rgba(255,255,255,.28);background:rgba(255,255,255,.1);color:#fff;font:800 14px var(--sans);margin:4px}
.gm-durak .dk-row{display:flex;justify-content:center;flex-wrap:wrap;gap:4px}
.gm-durak .dk-opt{display:flex;align-items:center;gap:10px;margin:8px 0;text-align:left}
.gm-durak .dk-opt>span{flex:0 0 32%;font:800 13px/1.2 var(--sans);color:rgba(255,255,255,.85)}
.gm-durak .dk-opt>span small{display:block;font:700 11px/1.25 var(--sans);color:rgba(255,255,255,.55);margin-top:2px}
.gm-durak .dk-box.wide{max-width:560px}
.gm-durak .dk-box.wide .dk-opt{margin:6px 0}
.gm-durak .dk-box.wide .dk-opt>span{flex-basis:44%}
.gm-durak .dk-seg{flex:1;display:flex;gap:5px;min-width:0}
.gm-durak .dk-port .dk-opt{flex-wrap:wrap;gap:4px}
.gm-durak .dk-port .dk-box.wide .dk-opt>span,.gm-durak .dk-port .dk-opt>span{flex:1 0 100%}
.gm-durak .dk-port .dk-opt>span small{display:inline;margin-left:6px}
.gm-durak .dk-port .dk-seg button{font-size:13px}
.gm-durak .dk-seg button{flex:1;min-width:0;min-height:42px;border-radius:12px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 13px var(--sans);padding:0 2px}
.gm-durak .dk-seg button.on{background:#f3c64a;border-color:#fff;color:#1b1b1f}
.gm-durak .dk-seg button:disabled{opacity:.35}
.gm-durak .dk-sec{margin:14px 0 2px!important;text-align:left;font:900 11px var(--sans)!important;letter-spacing:1.3px;text-transform:uppercase;color:#f3c64a!important}
.gm-durak .dk-title{width:100%;max-width:380px;text-align:center;margin:auto}
.gm-durak .dk-logo{display:inline-block;padding:6px 26px 8px;font:900 54px/1 var(--sans);font-style:italic;letter-spacing:1px;color:#fff;background:linear-gradient(#e63a35,#a3141a);border:4px solid #fff;border-radius:18px;text-shadow:0 3px 0 #5a0b0f;transform:rotate(-4deg);box-shadow:0 8px 0 rgba(0,0,0,.28),0 14px 24px rgba(0,0,0,.4);margin:2px 0 16px}
.gm-durak .dk-logo small{display:block;font:800 12px var(--sans);font-style:normal;letter-spacing:5px;color:#ffe08a;text-shadow:none;margin-top:2px}
.gm-durak .dk-tag{font:800 13px var(--sans);color:rgba(255,255,255,.85);margin:6px 0 8px;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.gm-durak .dk-tbl{width:100%;border-collapse:collapse;margin:8px 0;font:800 14px var(--sans)}
.gm-durak .dk-tbl td{padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.1);text-align:right}
.gm-durak .dk-tbl td:first-child{text-align:left}
.gm-durak .dk-tbl tr.win td{color:#f3c64a}
.gm-durak .dk-tbl tr.fool td{color:#ff8b7b}
.gm-durak .dk-tbl i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid #fff}
.gm-durak .dk-rules{text-align:left}
.gm-durak .dk-rules p{font:700 13px/1.45 var(--sans)!important}
.gm-durak .dk-rules kbd{background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)}
.gm-durak .dk-stamp{display:inline-block;margin:4px 0 8px;padding:4px 16px;border:4px solid #ff5b4b;border-radius:10px;color:#ff5b4b;font:900 30px var(--sans);letter-spacing:3px;transform:rotate(-7deg);text-transform:uppercase}
`,
    mount(root, api) {
      const opt = Object.assign({ mode: 'cpu', bots: 3, diff: 'Normal', deck: 36, variant: 'throw', teams: false, neigh: false, first5: true, timer: 0, felt: 'green', back: 'blue', stats: { w: 0, g: 0, f: 0 } }, api.load() || {});
      if (opt.mode !== 'cpu' && opt.mode !== 'online') opt.mode = 'cpu';
      if (!AIP[opt.diff]) opt.diff = 'Normal';
      if (!LOW[opt.deck]) opt.deck = 36;
      if (!FELTS[opt.felt]) opt.felt = 'green';
      if (!opt.stats || typeof opt.stats !== 'object') opt.stats = { w: 0, g: 0, f: 0 };
      opt.bots = Math.max(1, Math.min(maxPl(opt.deck) - 1, +opt.bots || 3));
      const saveOpt = () => api.save(opt);
      const now = () => performance.now();
      const rnd = (a, b) => a + Math.random() * (b - a);
      const lerp = (a, b, t) => a + (b - a) * t;
      const ease = t => 1 - Math.pow(1 - t, 3);

      const wrap = document.createElement('div'); wrap.className = 'dk-wrap';
      const cv = document.createElement('canvas');
      const ui = document.createElement('div'); ui.className = 'dk-ui';
      ui.innerHTML = `<button class="dk-ico" data-u="menu" aria-label="Menu" hidden>${ICON_MENU}</button>
<button class="dk-act dk-take" data-u="take" hidden>Take</button>
<button class="dk-act dk-bito" data-u="bito" hidden>Bito</button>
<button class="dk-act dk-tr" data-u="tr" hidden>Transfer</button>
<div class="dk-net" hidden><i></i><span>Online</span></div>
<div class="dk-pane" hidden></div>`;
      wrap.append(cv, ui); root.append(wrap);
      const ctx = cv.getContext('2d');
      const $u = s => ui.querySelector(s);
      const bMenu = $u('[data-u=menu]'), bTake = $u('[data-u=take]'), bBito = $u('[data-u=bito]'), bTr = $u('[data-u=tr]'), pane = $u('.dk-pane'), netEl = $u('.dk-net');

      let W = 960, H = 600, PORT = null, DPR = 1, L = null, SP = null, feltC = null, scene = 'title', viewer = 0;
      const D = { n: 2, hand: [], counts: [0, 0], slots: [], deckN: 0, disc: 0, tcard: -1, trump: 0, trumpOn: false, att: -1, def: -1, phase: 'idle', outs: [], teams: false, over: false, spin: 0 };
      const fly = [], fx = [], Q = [];
      let busy = 0, idleDone = true, paused = false, drag = null, hover = -1, sel = null, selTid = -1, focus = -1, hoverSlot = -1;
      const M = { mode: 'cpu', role: 'local', eng: null, tok: 0, cpu: [], human: [], names: [], av: [], diff: 'Normal', mem: newMem(2), sch: new Set(), schTid: -1, lastV: null, awaiting: false, pids: [], players: [], submitted: false, hooked: false, dl: 0, dlTid: -1, timerTid: -1, bots: false, size: 0, teams: false, deck: 36, perevod: false, result: null, nextFirst: -1 };

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
          if (k === 'card') { nz(t, .08, 2400, .8, .5); nz(t, .05, 650, 1, .28); }
          else if (k === 'slap') { nz(t, .06, 1800, .7, .6); nz(t, .09, 420, .9, .4); tn(t, .07, 'triangle', 190, 90, .08); }
          else if (k === 'deal') nz(t, .05, 3400, 1.2, .25);
          else if (k === 'draw') nz(t, .14, 1500, .9, .3, 3800);
          else if (k === 'shuf') for (let i = 0; i < 12; i++) nz(t + i * .035, .05, 2200 + Math.random() * 1800, 1.1, .22);
          else if (k === 'bito') { nz(t, .3, 900, .6, .28, 3200); tn(t + .12, .18, 'sine', 520, 380, .05); }
          else if (k === 'take') { tn(t, .16, 'sawtooth', 300, 140, .06); nz(t + .05, .25, 1200, .7, .22, 400); }
          else if (k === 'tr') { tn(t, .09, 'square', 520, 780, .05); tn(t + .09, .14, 'square', 780, 1040, .05); }
          else if (k === 'turn') { tn(t, .08, 'sine', 880, 880, .05); tn(t + .08, .12, 'sine', 1320, 1320, .045); }
          else if (k === 'pass') tn(t, .07, 'sine', 700, 560, .04);
          else if (k === 'bad') tn(t, .12, 'square', 170, 120, .04);
          else if (k === 'tap') tn(t, .05, 'sine', 600, 600, .04);
          else if (k === 'out') [660, 880, 1100].forEach((f, i) => tn(t + i * .07, .2, 'triangle', f, f, .06));
          else if (k === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tn(t + i * .09, .3, 'triangle', f, f, .08)); tn(t + .5, .7, 'sine', 1047, 1047, .05); }
          else if (k === 'lose') [392, 349, 311, 262].forEach((f, i) => tn(t + i * .14, .3, 'triangle', f, f * .98, .07));
        } catch (e) {}
      }

      function sprites() {
        const cw = L.cw, ch = L.ch, k = DPR * 1.25, pad = Math.ceil(cw * .14), cache = new Map();
        const mk = id => {
          const c = document.createElement('canvas');
          c.width = Math.ceil((cw + pad * 2) * k); c.height = Math.ceil((ch + pad * 2) * k);
          const x = c.getContext('2d'); x.scale(k, k); x.translate(cw / 2 + pad, ch / 2 + pad);
          x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = cw * .08; x.shadowOffsetY = cw * .04;
          cpath(x, cw, ch, cw * .09); x.fillStyle = '#fff'; x.fill();
          x.shadowColor = 'transparent';
          if (id < 0) cardBack(x, cw, ch, opt.back); else cardFace(x, id, cw, ch);
          return c;
        };
        SP = { pad, get(id) { let c = cache.get(id); if (!c) { c = mk(id); cache.set(id, c); } return c; } };
      }
      function felt() {
        const c = document.createElement('canvas'); c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
        const x = c.getContext('2d'); x.scale(DPR, DPR);
        const [a, b, e] = FELTS[opt.felt] || FELTS.green;
        wrap.style.setProperty('--dk-f1', b); wrap.style.setProperty('--dk-f2', e);
        const g = x.createRadialGradient(W / 2, H * .46, 10, W / 2, H * .46, Math.max(W, H) * .78);
        g.addColorStop(0, a); g.addColorStop(.55, b); g.addColorStop(1, e);
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        const t = document.createElement('canvas'); t.width = t.height = 96;
        const tx = t.getContext('2d'), im = tx.createImageData(96, 96);
        for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < .5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 22; }
        tx.putImageData(im, 0, 0);
        x.fillStyle = x.createPattern(t, 'repeat'); x.fillRect(0, 0, W, H);
        x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 2;
        x.beginPath(); x.ellipse(W / 2, H * .5, W * .46, H * .42, 0, 0, TAU); x.stroke();
        x.beginPath(); x.ellipse(W / 2, H * .5, W * .44, H * .4, 0, 0, TAU); x.stroke();
        feltC = c;
      }
      function layout() {
        const P = PORT, n = D.n, m = n - 1;
        L = { cw: P ? 62 : 84, ch: P ? 90 : 120, tw: P ? 56 : 72, th: P ? 81 : 104, av: P ? (n > 4 ? 16 : 19) : (n > 4 ? 26 : 31) };
        L.sc = L.tw / L.cw;
        L.gx = P ? 84 : 124; L.gy1 = P ? 304 : 232; L.gy2 = P ? 404 : 352; L.gc = W / 2;
        L.talon = P ? { x: 36, y: 232 } : { x: 100, y: 412 };
        L.disc = P ? { x: W - 36, y: 232 } : { x: W - 100, y: 412 };
        L.status = P ? { x: W / 2, y: 470 } : { x: W / 2, y: 440 };
        L.row = P ? 508 : 0;
        const SL = { 1: [[480, 62]], 2: [[200, 98], [760, 98]] };
        const SP2 = { 1: [[180, 58]], 2: [[100, 62], [260, 62]], 3: [[56, 84], [180, 52], [304, 84]], 4: [[44, 104], [120, 58], [240, 58], [316, 104]], 5: [[36, 116], [96, 66], [180, 48], [264, 66], [324, 116]] };
        const arc = k => [...Array(k).keys()].map(i => { const a = Math.PI * 1.1 + Math.PI * .8 * i / (k - 1); return [480 + 390 * Math.cos(a), 300 + 240 * Math.sin(a)]; });
        L.seat = [{ x: P ? 32 : 72, y: P ? 508 : 536 }].concat((P ? SP2[m] : (SL[m] || arc(m))).map(([x, y]) => ({ x, y })));
        L.fan = L.seat.map((s, r) => r ? { x: s.x, y: s.y + L.av + (P ? 30 : 56) } : s);
        placeUI(); relayoutSlots(true);
      }
      function fit(force) {
        const port = (root.clientWidth || 800) < 640;
        if (!force && port === PORT) return;
        PORT = port; W = port ? 360 : 960; H = port ? 680 : 600;
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        wrap.style.width = `min(100%, ${W}px, calc((100dvh - var(--goff, 250px)) * ${(W / H).toFixed(4)}))`;
        wrap.style.aspectRatio = `${W} / ${H}`;
        wrap.classList.toggle('dk-port', port);
        layout(); sprites(); felt();
        D.hand.forEach(e => { e.x = W / 2; e.y = H - 60; });
      }
      const pct = (el, x, y) => { el.style.left = (x / W * 100) + '%'; el.style.top = (y / H * 100) + '%'; };
      function placeUI() {
        if (!L) return;
        if (PORT) { bMenu.style.left = '8px'; bMenu.style.top = '8px'; pct(bTake, 100, L.row); pct(bBito, 260, L.row); pct(bTr, 260, L.row); }
        else { bMenu.style.left = '10px'; bMenu.style.top = '10px'; pct(bTake, 872, 536); pct(bBito, 872, 536); pct(bTr, 872, 472); }
      }

      const rel = p => ((p - viewer) % D.n + D.n) % D.n;
      const seatXY = p => L.seat[rel(p)] || L.seat[0];
      const isCpu = p => !!M.cpu[p];
      const nm = p => p < 0 ? '' : p === viewer ? 'You' : M.names[p] || 'Player';
      const poss = p => p === viewer ? 'Your' : nm(p) + '’s';
      const tm = p => D.teams ? p % 2 : -1;
      const view = () => M.role === 'guest' ? M.lastV : M.eng ? M.eng.view(viewer) : null;
      const isIdle = () => !paused && !Q.length && now() >= busy && !fly.length;
      const handKey = id => (CS(id) === D.trump ? 4 : CS(id)) * 20 + CV(id);
      const sortHand = () => D.hand.sort((a, b) => handKey(a.id) - handKey(b.id) || a.id - b.id);
      const canAct = () => scene === 'game' && isIdle() && pane.hidden && !M.awaiting && (() => { const V = view(); return !!V && V.phase !== 'over' && V.phase !== 'idle'; })();
      function playable(V) {
        if (!V) return [];
        if (V.phase === 'defend' && V.def === V.me) return V.hand.filter(id => beatSlots(V, id).length || canTransferV(V, id));
        return V.hand.filter(id => canThrowV(V, id));
      }

      function handSlots(cnt) {
        const P = PORT, cw = L.cw, ch = L.ch;
        const avail = P ? W - 14 : 640, step0 = P ? 36 : 44;
        const perRow = Math.max(1, Math.floor((avail - cw) / step0) + 1);
        const rows = Math.max(1, Math.ceil(cnt / perRow));
        const rowStep = rows > 2 ? (P ? 36 : 40) : (P ? 46 : 54);
        const bottom = H - (P ? 6 : 10) - ch / 2;
        const out = [];
        for (let i = 0; i < cnt; i++) {
          const row = Math.floor(i / perRow), inRow = Math.min(perRow, cnt - row * perRow), j = i - row * perRow;
          const step = inRow > 1 ? Math.min(cw * .72, (avail - cw) / (inRow - 1)) : 0;
          const off = j - (inRow - 1) / 2;
          out.push({ x: W / 2 + off * step, y: bottom - (rows - 1 - row) * rowStep + off * off * (P ? .5 : .7), r: off * (P ? .03 : .026) });
        }
        return out;
      }
      function handTop() { const s = handSlots(Math.max(1, D.hand.length)); return Math.min(...s.map(o => o.y)) - L.ch / 2; }
      function hitHand(x, y) {
        for (let i = D.hand.length - 1; i >= 0; i--) {
          const e = D.hand[i];
          if (e.ghost || (drag && drag.lift && drag.id === e.id)) continue;
          if (Math.abs(x - e.x) < L.cw / 2 && y > e.y - e.lift - L.ch / 2 && y < e.y + L.ch / 2) return e.id;
        }
        return -1;
      }
      function slotXY(i, cnt) {
        const top = cnt <= 3 ? cnt : Math.ceil(cnt / 2), row = i < top ? 0 : 1, inRow = row ? cnt - top : top, col = row ? i - top : i;
        return { x: L.gc + (col - (inRow - 1) / 2) * L.gx, y: cnt <= 3 ? (L.gy1 + L.gy2) / 2 : row ? L.gy2 : L.gy1 };
      }
      const posA = s => ({ x: s.px - L.tw * .1, y: s.py - L.th * .04, r: s.ar || 0, s: L.sc });
      const posD = s => ({ x: s.px + L.tw * .14, y: s.py + L.th * .12, r: .1 + (s.dr || 0), s: L.sc });
      const slotA = i => posA(D.slots[i]), slotD = i => posD(D.slots[i]);
      function hitSlot(x, y, only) {
        let b = -1, bd = 1e9;
        D.slots.forEach((s, i) => {
          if (only && !only.includes(i)) return;
          const dx = Math.abs(x - s.px), dy = Math.abs(y - s.py);
          if (dx < L.tw * .75 && dy < L.th * .7) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; b = i; } }
        });
        return b;
      }
      const fanPos = p => { const f = L.fan[rel(p)] || L.fan[0]; return rel(p) ? { x: f.x, y: f.y, r: 0, s: .42 * (PORT ? .8 : 1) } : { x: W / 2, y: H - 60, r: 0, s: 1 }; };
      const anchor = (p, dy = 0) => rel(p) ? { x: seatXY(p).x, y: seatXY(p).y + L.av + 30 + dy } : { x: W / 2, y: (PORT ? L.row - 40 : H - 175) + dy };
      const jit = () => ({ jr: rnd(-.05, .05) });

      const pop = (txt, x, y, col, big) => fx.push({ k: 'pop', txt, x, y, col: col || '#fff', t0: now(), dur: 1100, big });
      const bubble = (p, txt) => fx.push({ k: 'bub', p, txt, t0: now(), dur: 1500 });
      function burst(x, y, cols, k = 36, sp = 260) {
        for (let i = 0; i < k; i++) { const a = Math.random() * TAU, v = sp * (.35 + Math.random() * .65); fx.push({ k: 'pt', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, col: cols[i % cols.length], t0: now(), dur: 700 + Math.random() * 500, sz: 3 + Math.random() * 4 }); }
      }
      function confetti() {
        const cols = ['#f3c64a', '#e63a35', '#4a97f2', '#45c463', '#fff'];
        for (let i = 0; i < 110; i++) fx.push({ k: 'pt', x: Math.random() * W, y: -20 - Math.random() * 120, vx: rnd(-40, 40), vy: rnd(80, 220), col: cols[i % 5], t0: now() + Math.random() * 500, dur: 2600, sz: 4 + Math.random() * 4, conf: true, rot: Math.random() * 6 });
      }

      function launch(o) { o.t0 = now() + (o.delay || 0); o.started = false; fly.push(o); return o; }
      function ghost(id, from) { const e = { id, x: from.x, y: from.y, r: 0, lift: 0, tx: from.x, ty: from.y, tr: 0, ghost: true }; D.hand.push(e); sortHand(); return e; }
      const talonTop = () => ({ x: L.talon.x, y: L.talon.y, r: 0, s: 1 });
      const trumpPos = () => ({ x: L.talon.x + L.cw * .46, y: L.talon.y, r: Math.PI / 2, s: 1 });
      const discPos = () => ({ x: L.disc.x + rnd(-6, 6), y: L.disc.y + rnd(-6, 6), r: rnd(-.5, .5), s: 1 });
      function relayoutSlots(fresh) {
        const n = D.slots.length;
        D.slots.forEach((s, k) => { const p = slotXY(k, n); s.tx = p.x; s.ty = p.y; if (fresh === true || k === fresh) { s.px = p.x; s.py = p.y; } });
      }
      function ensureSlot(i) {
        if (!D.slots[i]) { D.slots[i] = { a: null, d: null, px: 0, py: 0, ar: rnd(-.05, .05), dr: rnd(-.05, .05) }; relayoutSlots(i); }
        return D.slots[i];
      }
      function takeFromHand(id) {
        const i = D.hand.findIndex(e => e.id === id);
        const e = i >= 0 ? D.hand.splice(i, 1)[0] : null;
        let from = e ? { x: e.x, y: e.y - e.lift, r: e.r, s: 1 } : { x: W / 2, y: H - 60, r: 0, s: 1 };
        if (drag && drag.id === id) { if (drag.lift) from = { x: drag.x, y: drag.y, r: 0, s: 1.1 }; drag = null; }
        return from;
      }

      function handle(f) {
        const sp = Q.length > 10 ? .45 : Q.length > 4 ? .75 : 1;
        switch (f.k) {
          case 'deal': {
            D.n = f.counts.length; D.teams = M.teams; layout();
            D.hand = []; D.counts = Array(D.n).fill(0); D.slots = []; D.deckN = M.deckSize; D.disc = 0; D.trump = f.trump; D.tcard = -1; D.trumpOn = false; D.outs = []; D.over = false; D.att = -1; D.def = -1; D.phase = 'idle';
            sel = null; focus = -1;
            const order = [];
            for (let k = 0; k < HAND; k++) for (let i = 0; i < D.n; i++) order.push(i);
            let mi = 0; const stag = 62 * sp;
            sfx('shuf');
            order.forEach((p, j) => {
              const mine = p === viewer, id = mine ? f.mine[mi++] : -1;
              let e = null;
              launch({ id, from: talonTop(), to: mine ? () => e ? { x: e.tx, y: e.ty, r: e.tr, s: 1 } : fanPos(p) : () => fanPos(p), delay: 300 + j * stag, dur: 320 * sp, flip: mine, arc: 24,
                onStart: () => { D.deckN--; sfx('deal'); if (mine) e = ghost(id, talonTop()); },
                onEnd: () => { if (mine && e) { e.ghost = false; e.x = e.tx; e.y = e.ty; e.r = e.tr; } D.counts[p]++; } });
            });
            const t1 = 300 + order.length * stag + 320 * sp;
            if (f.tcOwner < 0) {
              launch({ id: f.tc, from: talonTop(), to: () => trumpPos(), delay: t1 + 60, dur: 420 * sp, flip: true, arc: 20, onStart: () => { sfx('card'); }, onEnd: () => { D.tcard = f.tc; D.trumpOn = true; } });
            } else {
              api.timeout(() => { D.trumpOn = true; D.deckN = 0; }, t1);
            }
            return t1 + 520 * sp;
          }
          case 'first': {
            const an = anchor(f.p, -6);
            pop(f.why === 'loser' ? nm(f.p) + (f.p === viewer ? ' attack first' : ' attacks first') : f.why === 'trump' ? nm(f.p) + (f.p === viewer ? ' have the lowest trump' : ' has the lowest trump') : nm(f.p) + (f.p === viewer ? ' start' : ' starts'), W / 2, L.status.y - 40, '#f3c64a');
            return 700 * sp;
          }
          case 'turn': {
            D.att = f.att; D.def = f.def; D.spin = 1;
            if (D.slots.length) D.slots.length = 0;
            if (f.def === viewer || f.att === viewer) sfx('turn');
            return 120;
          }
          case 'atk': case 'tr': {
            const p = f.p, mine = p === viewer, sl = ensureSlot(f.slot);
            const from = mine ? takeFromHand(f.id) : fanPos(p);
            if (!mine) D.counts[p] = Math.max(0, D.counts[p] - 1); else D.counts[p] = Math.max(0, D.counts[p] - 1);
            focus = -1;
            if (f.k === 'tr') { D.att = p; D.def = f.to; sfx('tr'); pop('Transfer!', anchor(p, -6).x, anchor(p, -6).y, '#7fc4ff', true); }
            launch({ id: f.id, from, to: () => posA(sl), dur: 320 * sp, flip: !mine, arc: mine ? 36 : 24, onEnd: () => { sl.a = { id: f.id }; sfx('card'); } });
            return (f.k === 'tr' ? 560 : 360) * sp;
          }
          case 'def': {
            const p = f.p, mine = p === viewer, sl = ensureSlot(f.slot);
            const from = mine ? takeFromHand(f.id) : fanPos(p);
            D.counts[p] = Math.max(0, D.counts[p] - 1);
            sel = null; focus = -1;
            launch({ id: f.id, from, to: () => posD(sl), dur: 320 * sp, flip: !mine, arc: mine ? 36 : 24, onEnd: () => { sl.d = { id: f.id }; sfx('slap'); } });
            return 380 * sp;
          }
          case 'take': {
            const an = anchor(f.p, -6); pop('Take!', an.x, an.y, '#ff8b7b', true); sfx('take');
            return 480 * sp;
          }
          case 'pass': {
            if (f.bito) { bubble(f.p, 'Bito!'); sfx('pass'); } else { bubble(f.p, 'Pass'); sfx('pass'); }
            return 180 * sp;
          }
          case 'bito': {
            sfx('bito');
            const cards = [];
            D.slots.forEach((s, i) => { if (s.a) cards.push({ id: s.a.id, from: slotA(i) }); if (s.d) cards.push({ id: s.d.id, from: slotD(i) }); });
            D.slots.length = 0;
            cards.forEach((c, i) => launch({ id: c.id, from: c.from, to: discPos, delay: i * 45, dur: 420 * sp, back: .5, arc: 10, onEnd: () => { D.disc++; } }));
            return (cards.length * 45 + 520) * sp;
          }
          case 'pickup': {
            const p = f.p, mine = p === viewer;
            const cards = [];
            D.slots.forEach((s, i) => { if (s.a) cards.push({ id: s.a.id, from: slotA(i) }); if (s.d) cards.push({ id: s.d.id, from: slotD(i) }); });
            D.slots.length = 0;
            sfx('draw');
            cards.forEach((c, i) => {
              let e = null;
              launch({ id: c.id, from: c.from, to: mine ? () => e ? { x: e.tx, y: e.ty, r: e.tr, s: 1 } : fanPos(p) : () => fanPos(p), delay: i * 70, dur: 440 * sp, back: mine ? 0 : .6, arc: 22,
                onStart: () => { if (mine) e = ghost(c.id, c.from); },
                onEnd: () => { if (mine && e) { e.ghost = false; e.x = e.tx; e.y = e.ty; e.r = e.tr; } D.counts[p]++; } });
            });
            return (cards.length * 70 + 520) * sp;
          }
          case 'draw': {
            const p = f.p, mine = p === viewer, c = f.c ?? f.ids.length;
            const gap = (c > 5 ? 80 : 120) * sp;
            for (let i = 0; i < c; i++) {
              const last = i === c - 1 && f.tc >= 0;
              const id = mine && f.ids ? f.ids[i] : last ? f.tc : -1; let e = null;
              launch({ id, from: last ? trumpPos() : talonTop(), to: mine ? () => e ? { x: e.tx, y: e.ty, r: e.tr, s: 1 } : fanPos(p) : () => fanPos(p), delay: i * gap, dur: 340 * sp, flip: mine && !last, arc: 26,
                onStart: () => { D.deckN = Math.max(0, D.deckN - 1); sfx('draw'); if (last) { D.tcard = -1; D.deckN = 0; } if (mine) e = ghost(id, last ? trumpPos() : talonTop()); },
                onEnd: () => { if (mine && e) { e.ghost = false; e.x = e.tx; e.y = e.ty; e.r = e.tr; } D.counts[p]++; } });
            }
            return ((c - 1) * gap + 360 * sp) + 60;
          }
          case 'out': {
            sfx('out');
            const an = anchor(f.p, -6);
            pop(f.p === viewer ? 'You are out!' : nm(f.p) + ' is out!', an.x, an.y, '#f3c64a', true);
            D.outs = D.outs.concat([f.p]);
            return 650 * sp;
          }
          case 'over': {
            D.over = true; D.att = -1; D.def = -1;
            M.result = f;
            const w = isWin(f);
            sfx(w ? 'win' : 'lose');
            if (w) confetti();
            return 900;
          }
          default: return 0;
        }
      }
      function isWin(f) {
        if (f.teams) return f.loser >= 0 && f.loser !== viewer % 2;
        return f.durak !== viewer;
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
        for (const id of want) if (!D.hand.some(e => e.id === id)) { const s0 = sl[0] || { x: W / 2, y: H - 60, r: 0 }; D.hand.push({ id, x: hard ? s0.x : L.talon.x, y: hard ? s0.y : L.talon.y, r: 0, lift: 0, tx: s0.x, ty: s0.y, tr: 0 }); }
        D.trump = V.trump;
        sortHand();
        if (hard) handSlots(D.hand.length).forEach((s, i) => { const e = D.hand[i]; e.x = e.tx = s.x; e.y = e.ty = s.y; e.r = e.tr = s.r; });
        D.n = V.n; D.counts = V.counts.slice(); D.att = V.att; D.def = V.def; D.deckN = V.deck; D.disc = V.disc; D.outs = V.outs.slice(); D.phase = V.phase; D.teams = !!V.rules.teams;
        D.tcard = V.deck > 0 ? V.tcard : -1; D.trumpOn = true;
        if (V.phase === 'over') { D.att = -1; D.def = -1; D.over = true; }
        while (D.slots.length > V.table.length) D.slots.pop();
        V.table.forEach((c, i) => {
          const s = ensureSlot(i);
          if (!s.a || s.a.id !== c.a) s.a = { id: c.a };
          if (c.d >= 0) { if (!s.d || s.d.id !== c.d) s.d = { id: c.d }; } else s.d = null;
        });
        relayoutSlots(hard ? true : -1);
      }
      function flush() {
        if (!M.eng) return;
        const es = M.eng.take();
        if (!es.length) return;
        for (const e of es) { track(M.mem, e); Q.push(e); }
        idleDone = false;
        if (M.role === 'host') M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, { t: 'ev', es: es.map(e => filt(e, q)), v: M.eng.view(q) }); });
        refreshUI();
      }
      function onIdle() {
        const V = view();
        if (!V || scene !== 'game') return;
        syncD(V);
        refreshUI();
        if (V.phase === 'over') return showEnd();
        if (M.role === 'guest' || !M.eng) return;
        armTimer();
        scheduleBots();
      }

      function scheduleBots() {
        const e = M.eng, s = e.s, tid = s.tid, tok = M.tok, P = AIP[M.diff] || AIP.Normal;
        if (M.schTid !== tid) { M.sch.clear(); M.schTid = tid; }
        const nd = e.need(), list = nd.ps.filter(isCpu);
        if (s.phase === 'defend' && isCpu(s.att) && M.mem.leadQ.length && !s.table.some(c => c.d >= 0)) list.push(s.att);
        list.forEach((p, idx) => {
          const key = tid + ':' + p;
          if (M.sch.has(key)) return;
          M.sch.add(key);
          const follow = s.phase === 'defend' && p === s.att;
          const delay = follow ? rnd(300, 520) : s.phase === 'throw' || s.phase === 'take' ? rnd(P.think[0] * .6, P.think[1] * .85) + idx * 160 : rnd(P.think[0], P.think[1]);
          let S = null;
          if (P.mc && !follow) {
            const V0 = e.view(p);
            S = mcSearch(V0, M.mem, P, Math.random);
            const t0 = now(), chunk = () => { if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid || now() - t0 > delay - 40) return; S.step(6); api.timeout(chunk, 16); };
            api.timeout(chunk, 24);
          }
          api.timeout(() => {
            if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
            if (paused || api.paused) { M.sch.delete(key); api.timeout(() => { if (tok === M.tok) { idleDone = false; } }, 300); return; }
            const V = M.eng.view(p);
            const a = S ? S.best() : aiAct(V, M.mem, P, Math.random);
            if (!a) return;
            if (!M.eng.act(p, a)) {
              if (!(V.phase === 'defend' && V.def === p && M.eng.act(p, { t: 'take' })) && !((V.phase === 'throw' || V.phase === 'take') && M.eng.act(p, { t: 'pass' }))) return;
            }
            flush();
          }, delay);
        });
      }
      function armTimer() {
        const e = M.eng;
        if (!e || !opt.timer) { M.dl = 0; return; }
        const s = e.s, tid = s.tid, tok = M.tok;
        const nd = e.need(), hs = nd.ps.filter(p => !isCpu(p));
        if (!hs.length || s.phase === 'over' || s.phase === 'idle') { M.dl = 0; return; }
        if (M.timerTid === tid) return;
        M.timerTid = tid;
        const ms = opt.timer * 1000;
        M.dl = now() + ms; M.dlTid = tid;
        if (M.role === 'host') api.net.send({ t: 'tm', tid, ms });
        api.timeout(() => {
          if (tok !== M.tok || !M.eng || M.eng.s.tid !== tid) return;
          if (paused || api.paused) { M.timerTid = -1; M.dl = 0; idleDone = false; return; }
          let did = false;
          for (const q of hs) {
            const ph = M.eng.s.phase;
            let a = null;
            if (ph === 'lead') { const h = M.eng.s.hands[q]; a = { t: 'atk', id: h.slice().sort((x, y) => wv(x, M.eng.s.trump) - wv(y, M.eng.s.trump))[0] }; }
            else if (ph === 'defend') a = { t: 'take' };
            else a = { t: 'pass' };
            if (M.eng.act(q, a)) { did = true; if (q === viewer) { if (!pane.hidden && pane.dataset.k !== 'menu') hidePane(); api.toast('Time is up'); } }
          }
          if (did) { M.dl = 0; flush(); }
        }, ms + 80);
      }
      function send(a) {
        if (M.role === 'guest') {
          M.awaiting = true;
          api.net.send({ t: 'act', a }); refreshUI();
          return true;
        }
        if (!M.eng) return false;
        const ok = M.eng.act(viewer, a);
        if (ok) { M.dl = 0; M.timerTid = -1; flush(); }
        return ok;
      }

      function shake(id) { const e = D.hand.find(h => h.id === id); if (e) e.shake = now(); sfx('bad'); }
      function tryCard(id, slotHint) {
        if (!canAct()) return;
        const V = view();
        if (V.phase === 'defend' && V.def === V.me) {
          const slots = beatSlots(V, id), tr = canTransferV(V, id);
          if (!slots.length && !tr) return shake(id);
          if (slotHint != null && slots.includes(slotHint)) { sfx('tap'); return send({ t: 'def', id, slot: slotHint }); }
          if (slots.length === 1 && !tr) { sfx('tap'); return send({ t: 'def', id, slot: slots[0] }); }
          if (!slots.length && tr) { sfx('tap'); return send({ t: 'tr', id }); }
          sel = sel === id ? null : id; selTid = V.tid; sfx('tap'); refreshUI();
          return;
        }
        if (canThrowV(V, id)) { sfx('tap'); return send({ t: 'atk', id }); }
        shake(id);
      }
      function tryTake() {
        if (!canAct()) return;
        const V = view();
        if (V.phase === 'defend' && V.def === V.me) { sfx('tap'); send({ t: 'take' }); }
      }
      function tryPass() {
        if (!canAct()) return;
        const V = view();
        if ((V.phase === 'throw' || V.phase === 'take') && V.pend.includes(V.me)) { sfx('tap'); send({ t: 'pass' }); }
      }
      function tryTransfer() {
        if (!canAct()) return;
        const V = view();
        let id = sel;
        if (id == null || !canTransferV(V, id)) id = V.hand.find(x => canTransferV(V, x));
        if (id != null && canTransferV(V, id)) { sfx('tap'); sel = null; send({ t: 'tr', id }); }
      }

      let paneFn = null;
      function showPane(kind, html, fn, cls) {
        pane.className = 'dk-pane' + (cls ? ' ' + cls : '');
        pane.dataset.k = kind; pane.innerHTML = html; pane.hidden = false; pane.scrollTop = 0;
        paneFn = fn;
      }
      function hidePane() { pane.hidden = true; pane.innerHTML = ''; pane.dataset.k = ''; paneFn = null; }
      pane.addEventListener('click', e => {
        const b = e.target.closest('[data-a]');
        if (!b || !paneFn || !api.alive || b.disabled) return;
        sfx('tap');
        paneFn(b.dataset.a, b);
      });
      const seg = (k, vals, labels, dis) => `<div class="dk-seg" data-k="${k}">${vals.map((v, i) => `<button data-a="seg" data-v="${v}" class="${String(opt[k]) === String(v) ? 'on' : ''}"${dis && dis(v) ? ' disabled' : ''}>${labels ? labels[i] : v}</button>`).join('')}</div>`;
      function segClick(b, again) {
        const k = b.parentNode.dataset.k, raw = b.dataset.v;
        opt[k] = raw === 'true' ? true : raw === 'false' ? false : /^\d+$/.test(raw) ? +raw : raw;
        if (k === 'deck') opt.bots = Math.min(opt.bots, maxPl(opt.deck) - 1);
        saveOpt();
        if (k === 'felt') felt();
        if (k === 'back') { sprites(); }
        again();
      }

      function hud() {
        const g = scene === 'game';
        bMenu.hidden = !g; netEl.hidden = !(g && M.mode === 'online');
        if (!g) { bTake.hidden = true; bBito.hidden = true; bTr.hidden = true; }
      }
      function refreshUI() {
        hud();
        if (scene !== 'game') return;
        const V = view();
        if (!V) return;
        if (selTid !== V.tid) sel = null;
        const act = canAct(), me = V.me;
        const defNow = act && V.phase === 'defend' && V.def === me;
        bTake.hidden = !defNow;
        const passNow = act && (V.phase === 'throw' || V.phase === 'take') && V.pend.includes(me);
        bBito.hidden = !passNow;
        bBito.textContent = V.phase === 'take' ? 'Done' : V.att === me ? 'Bito' : 'Pass';
        bBito.classList.toggle('hot', passNow && V.phase === 'throw');
        bTr.hidden = !(defNow && V.rules.perevod && sel != null && canTransferV(V, sel));
        bTake.classList.toggle('hot', defNow && !playable(V).length);
      }

      function showTitle() {
        M.tok++; scene = 'title'; paused = false;
        Q.length = 0; fly.length = 0; fx.length = 0; D.slots = []; D.hand = [];
        M.mode = opt.mode; M.role = 'local'; M.eng = null;
        hud(); api.score(opt.stats.w || 0);
        const l = m => opt.mode === m ? ' last' : '';
        showPane('title', `<div class="dk-title"><div class="dk-logo">DURAK<small>THE FOOL’S GAME</small></div><p class="dk-tag">Beat every attack. Don’t be the last one holding cards.</p>
<button class="dk-big red${l('cpu')}" data-a="m:cpu">vs Bots<small>Play 1-5 computer opponents</small></button>
<button class="dk-big green${l('online')}" data-a="m:online">Online party<small>2-6 players, bots can fill empty seats</small></button>
<div class="dk-row"><button class="dk-sm" data-a="rules">How to play</button></div>${opt.stats.g ? `<p class="dk-tag">Games ${opt.stats.g} · Won ${opt.stats.w} · Fool ${opt.stats.f}</p>` : ''}</div>`, a => {
          if (a.startsWith('m:')) { opt.mode = a.slice(2); saveOpt(); setup(); }
          else if (a === 'rules') rules(showTitle);
        }, 'clear');
      }
      function setup() {
        const m = opt.mode, mp = maxPl(opt.deck);
        const body = m === 'cpu'
          ? `<h3>vs Bots</h3><div class="dk-opt"><span>Opponents</span>${seg('bots', [1, 2, 3, 4, 5], null, v => v > mp - 1)}</div><div class="dk-opt"><span>Bot skill</span>${seg('diff', ['Easy', 'Normal', 'Hard', 'Expert'])}</div>`
          : `<h3>Online party</h3><div class="dk-opt"><span>Bot skill</span>${seg('diff', ['Easy', 'Normal', 'Hard', 'Expert'])}</div><p>Party of 2-${mp} players. Pick the party size and turn on bots for empty seats in the party screen. The host’s rules are used.</p>`;
        showPane('setup', `<div class="dk-box">${body}
<div class="dk-opt"><span>Variant</span>${seg('variant', ['throw', 'transfer'], ['Throw-in', 'Transfer'])}</div>
<div class="dk-opt"><span>Deck</span>${seg('deck', [24, 36, 52], ['24', '36', '52'])}</div>
<div class="dk-opt"><span>Teams<small>4 or 6 players</small></span>${seg('teams', [false, true], ['Off', 'On'])}</div>
<button class="dk-big ${m === 'cpu' ? 'red' : 'green'}" data-a="go">${m === 'online' ? 'Create or join a party' : 'Deal!'}</button>
<div class="dk-row"><button class="dk-sm" data-a="more">More options</button><button class="dk-sm" data-a="back">Back</button></div></div>`, (a, b) => {
          if (a === 'seg') segClick(b, setup);
          else if (a === 'go') { if (m === 'online') startOnline(); else newMatch(); }
          else if (a === 'more') more(setup);
          else if (a === 'back') showTitle();
        });
      }
      function more(back) {
        const OF = [true, false], OL = ['On', 'Off'];
        const top = pane.scrollTop;
        showPane('more', `<div class="dk-box wide"><h3>More options</h3>
<p class="dk-sec">Rules</p>
<div class="dk-opt"><span>First bout max 5<small>Standard rule</small></span>${seg('first5', OF, OL)}</div>
<div class="dk-opt"><span>Neighbours only<small>Only the attacker and the player after the defender throw in</small></span>${seg('neigh', [false, true], ['Off', 'On'])}</div>
<div class="dk-opt"><span>Turn timer</span>${seg('timer', [0, 20, 40, 60], ['Off', '20 s', '40 s', '60 s'])}</div>
<p class="dk-sec">Table</p>
<div class="dk-opt"><span>Felt</span>${seg('felt', ['green', 'blue', 'red', 'wood'], ['Green', 'Blue', 'Red', 'Wood'])}</div>
<div class="dk-opt"><span>Card back</span>${seg('back', ['blue', 'red'], ['Blue', 'Red'])}</div>
<button class="dk-big yellow" data-a="back">Done</button></div>`, (a, b) => {
          if (a === 'seg') segClick(b, () => more(back));
          else back();
        });
        pane.scrollTop = top;
      }
      function rules(back) { showPane('rules', `<div class="dk-box">${RULES}<button class="dk-big yellow" data-a="back">Got it</button></div>`, () => back()); }
      function menu() {
        if (scene !== 'game') return;
        const online = M.mode === 'online';
        if (!online) paused = true;
        showPane('menu', `<div class="dk-box"><p class="dk-kick">${online ? 'Online' : 'Paused'}</p><h3>Menu</h3>
<button class="dk-big green" data-a="resume">Resume</button>
<button class="dk-big yellow" data-a="rules">How to play</button>
<button class="dk-big red" data-a="quit">${online ? 'Leave game' : 'Quit to title'}</button></div>`, a => {
          if (a === 'resume') { hidePane(); paused = false; idleDone = false; refreshUI(); }
          else if (a === 'rules') rules(menu);
          else if (a === 'quit') { if (online) leaveOnline(); else showTitle(); }
        });
      }
      function showEnd() {
        const V = view();
        if (!V || (pane.dataset.k === 'end' && !pane.hidden)) return;
        if (M.eng && M.role !== 'guest') afterOver();
        const r = M.result || { durak: V.durak, loser: V.loser, teams: V.rules.teams, outs: V.outs, left: [] };
        const online = M.mode === 'online', teams = !!r.teams;
        const win = isWin(r);
        if (!M.submitted) {
          M.submitted = true;
          opt.stats.g++; if (win && !(r.durak < 0 && r.loser < 0)) opt.stats.w++; if (!teams && r.durak === viewer) opt.stats.f++;
          saveOpt(); api.score(opt.stats.w);
          if (win && opt.stats.w > 0) api.submit(opt.stats.w);
        }
        const draw = (teams ? r.loser < 0 : r.durak < 0);
        const order = r.outs.slice();
        for (const p of (r.left || [])) if (!order.includes(p)) order.push(p);
        const rows = order.map((p, i) => {
          const fool = !teams && p === r.durak, lose = teams && r.loser === p % 2 && !draw;
          const place = fool ? 'Durak' : lose ? 'Lost' : (i + 1) + (i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th');
          return `<tr class="${i === 0 && !draw && !fool && !lose ? 'win' : ''}${fool || lose ? ' fool' : ''}"><td><i style="background:${AV[(M.av[p] || 0) % AV.length].bg}"></i>${nm(p)}${teams ? ` · Team ${p % 2 ? 'B' : 'A'}` : ''}</td><td>${place}</td></tr>`;
        }).join('');
        const title = draw ? 'It’s a draw!' : teams ? (win ? 'Your team wins!' : 'Your team lost') : (r.durak === viewer ? 'You are the Durak!' : (nm(r.durak) + ' is the Durak!'));
        const stamp = !teams && r.durak === viewer ? '<div class="dk-stamp">Durak</div>' : '';
        const kick = draw ? 'Draw' : win ? 'You win' : 'Game over';
        const btns = online
          ? M.role === 'host'
            ? `<button class="dk-big green" data-a="again">Rematch</button><div class="dk-row"><button class="dk-sm" data-a="lobby">Back to lobby</button><button class="dk-sm" data-a="leave">Leave</button></div>`
            : `<p>Waiting for the host to start a rematch…</p><div class="dk-row"><button class="dk-sm" data-a="leave">Leave</button></div>`
          : `<button class="dk-big red" data-a="again">Play again</button><div class="dk-row"><button class="dk-sm" data-a="title">Menu</button></div>`;
        showPane('end', `<div class="dk-box"><p class="dk-kick">${kick}</p>${stamp}<h3>${title}</h3><table class="dk-tbl">${rows}</table><p>Won ${opt.stats.w} of ${opt.stats.g} · Fool ${opt.stats.f}</p>${btns}</div>`, a => {
          if (a === 'again') { if (online && M.role !== 'host') return; startGame(M.nextFirst); }
          else if (a === 'title') showTitle();
          else if (a === 'lobby') startOnline();
          else if (a === 'leave') leaveOnline();
        });
      }

      function seats(n, humans) {
        M.cpu = Array(n).fill(false); M.human = Array(n).fill(false); M.names = []; M.av = [];
        const pool = CPU_NAMES.slice().sort(() => Math.random() - .5);
        for (let p = 0; p < n; p++) {
          M.human[p] = humans.includes(p); M.cpu[p] = !M.human[p];
          M.names[p] = M.human[p] ? (M.mode === 'online' && M.players.length ? (M.players.find(x => x.id === M.pids[p]) || {}).name || 'Player' : 'You') : pool.pop();
          M.av[p] = p;
        }
      }
      function newMatch() {
        M.tok++; M.submitted = false; M.nextFirst = -1; M.result = null;
        const online = M.mode === 'online' && M.role === 'host';
        if (!online) { M.mode = 'cpu'; M.role = 'local'; }
        M.diff = opt.diff;
        const mp = maxPl(opt.deck);
        let n, humans;
        if (online) {
          const live = M.players.filter((x, i) => !i || api.net.players.some(q => q.id === x.id && !q.away));
          M.players = live;
          const k = Math.max(1, Math.min(mp, live.length));
          n = Math.max(2, Math.min(mp, M.bots ? Math.max(k, M.size || k) : k));
          const tms = opt.teams && n >= 4 && n % 2 === 0;
          humans = live.slice(0, k).map((x, i) => tms ? i : Math.round(i * n / k));
          M.pids = Array(n).fill(null); humans.forEach((q, i) => { M.pids[q] = live[i].id; });
        } else { n = Math.min(mp, 1 + opt.bots); humans = [0]; }
        seats(n, humans);
        M.teams = !!opt.teams && n >= 4 && n % 2 === 0;
        M.deck = opt.deck; M.perevod = opt.variant === 'transfer'; M.deckSize = opt.deck === 24 ? 24 : opt.deck === 52 ? 52 : 36;
        M.eng = Game({ n, deck: opt.deck, perevod: M.perevod, teams: M.teams, neigh: opt.neigh, first5: opt.first5 });
        D.n = n; viewer = 0;
        if (online) sendSetups();
        startGame(-1);
      }
      function startGame(first) {
        M.tok++; M.submitted = false; M.result = null; M.cpuTid = -1; M.sch.clear(); M.schTid = -1; M.timerTid = -1; M.dl = 0;
        hidePane(); scene = 'game'; paused = false;
        Q.length = 0; fly.length = 0; fx.length = 0; busy = 0; sel = null;
        const n = M.eng.s.n;
        D.n = n; D.teams = M.teams; D.hand = []; D.counts = Array(n).fill(0); D.slots = []; D.deckN = M.deckSize; D.disc = 0; D.outs = []; D.over = false; D.att = -1; D.def = -1; D.tcard = -1; D.trumpOn = false;
        layout(); hud();
        M.mem = newMem(n);
        if (M.mode === 'online' && M.role === 'host') sendSetups();
        M.eng.deal(first);
        flush();
        api.score(opt.stats.w || 0);
      }
      function afterOver() {
        const s = M.eng.s;
        M.nextFirst = M.teams ? (s.loser >= 0 ? s.loser : -1) : s.durak;
      }

      function sendSetups() {
        M.pids.forEach((id, q) => { if (id && q !== viewer && M.human[q]) api.net.sendTo(id, setupMsg(q)); });
      }
      const setupMsg = q => ({ t: 'setup', n: M.eng.s.n, seat: q, cpu: M.cpu, human: M.human, names: M.names, av: M.av, teams: M.teams, deck: M.deck, deckSize: M.deckSize, perevod: M.perevod, timer: opt.timer });
      function sendSync(id) {
        if (M.role !== 'host' || !M.eng) return;
        const q = M.pids.indexOf(id);
        if (q < 0 || !M.human[q]) return;
        api.net.sendTo(id, setupMsg(q));
        api.net.sendTo(id, { t: 'ev', es: [], v: M.eng.view(q), sync: 1 });
      }
      function seatToCpu(id) {
        const q = M.pids.indexOf(id);
        if (q < 0 || M.role !== 'host' || !M.eng) return;
        const who = M.names[q];
        M.pids[q] = null; M.human[q] = false; M.cpu[q] = true; M.names[q] = who + ' (Bot)';
        api.net.send({ t: 'seats', cpu: M.cpu, human: M.human, names: M.names });
        api.toast(who + ' left. A bot takes their seat.');
        M.sch.clear(); M.schTid = -1; M.timerTid = -1;
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
          showPane('left', `<div class="dk-box"><p class="dk-kick">Online</p><h3>${h}</h3><p>${t}</p><button class="dk-big green" data-a="room">Online lobby</button><button class="dk-big red" data-a="cpu">Play vs Bots</button></div>`, a => {
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
        const mp = maxPl(opt.deck);
        const r = await api.net.room({ title: 'Durak', sizes: [...Array(mp - 1).keys()].map(i => i + 2), defaultSize: Math.min(4, mp), min: 2, max: mp, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'cpu'; return showTitle(); }
        M.role = r.role; M.players = r.players.slice(0, 6); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') { viewer = 0; newMatch(); }
        else showPane('wait', `<div class="dk-box"><p class="dk-kick">Online</p><h3>Connected!</h3><p>Waiting for the host to deal…</p><div class="dk-row"><button class="dk-sm" data-a="leave">Leave</button></div></div>`, a => { if (a === 'leave') leaveOnline(); });
      }
      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (M.role !== 'host' || !M.eng) return;
          const q = M.pids.indexOf(from);
          if (q < 0 || q === viewer || !M.human[q]) return;
          if (d.t === 'act' && d.a && typeof d.a === 'object') { if (M.eng.act(q, d.a)) { M.timerTid = -1; flush(); } else api.net.sendTo(from, { t: 'ev', es: [], v: M.eng.view(q) }); }
        } else {
          if (d.t === 'setup') {
            M.tok++; M.mode = 'online'; M.role = 'guest'; viewer = d.seat; M.submitted = false; M.result = null;
            M.cpu = d.cpu; M.human = d.human; M.names = d.names; M.av = d.av; D.n = d.n; M.lastV = null; M.awaiting = false; M.teams = !!d.teams; M.deck = d.deck; M.deckSize = d.deckSize; M.perevod = !!d.perevod; opt.timer = +d.timer || 0;
            scene = 'game'; paused = false; Q.length = 0; fly.length = 0; fx.length = 0; busy = 0; sel = null;
            D.hand = []; D.counts = Array(d.n).fill(0); D.slots = []; D.deckN = d.deckSize; D.disc = 0; D.teams = M.teams; D.outs = []; D.over = false;
            layout(); hidePane(); hud(); api.score(opt.stats.w || 0);
          } else if (M.role !== 'guest') return;
          else if (d.t === 'ev') {
            M.lastV = d.v; M.awaiting = false; idleDone = false;
            if (d.sync) { syncD(d.v, true); }
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
          focus = id;
          drag = { id, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false, lift: false, pid: e.pointerId, type: e.pointerType };
          try { cv.setPointerCapture(e.pointerId); } catch (x) {}
          return;
        }
        const V = view();
        if (sel != null && V) {
          const s = hitSlot(p.x, p.y, beatSlots(V, sel));
          if (s >= 0) { tryCard(sel, s); return; }
          sel = null; refreshUI();
        }
        focus = -1;
      });
      api.on(cv, 'pointermove', e => {
        const p = loc(e);
        if (!drag) {
          if (e.pointerType === 'mouse' && scene === 'game') {
            hover = hitHand(p.x, p.y); if (hover >= 0) focus = hover;
            const V = view();
            cv.style.cursor = hover >= 0 || (sel != null && V && hitSlot(p.x, p.y, beatSlots(V, sel)) >= 0) ? 'pointer' : '';
          }
          return;
        }
        if (e.pointerId !== drag.pid) return;
        const dx = p.x - drag.x0, dy = p.y - drag.y0;
        if (Math.abs(dx) > 9 || Math.abs(dy) > 9) drag.moved = true;
        drag.x = p.x; drag.y = p.y;
        if (!drag.lift && drag.moved && canAct()) {
          const V = view();
          if (V && playable(V).includes(drag.id) && (Math.abs(dy) > 12 || Math.abs(dx) > 18)) { drag.lift = true; sel = null; }
          else if (!drag.lift) { const id = hitHand(p.x, Math.min(p.y, H - 20)); if (id >= 0 && Math.abs(dy) < 12) { drag.id = id; focus = id; } }
        }
        if (drag.lift) {
          const V = view();
          hoverSlot = V && V.phase === 'defend' && V.def === V.me ? hitSlot(p.x, p.y, beatSlots(V, drag.id)) : -1;
        }
      });
      const up = e => {
        if (!drag || e.pointerId !== drag.pid) return;
        const d = drag; hoverSlot = -1;
        if (e.type === 'pointercancel') { drag = null; return; }
        if (d.lift) {
          if (d.y < handTop() - 10) {
            const V = view(), s = V && V.phase === 'defend' && V.def === V.me ? hitSlot(d.x, d.y, beatSlots(V, d.id)) : -1;
            tryCard(d.id, s >= 0 ? s : undefined);
          }
          if (drag === d) drag = null;
        } else { drag = null; if (!d.moved) tryCard(d.id); }
      };
      api.on(cv, 'pointerup', up); api.on(cv, 'pointercancel', up);
      api.on(cv, 'pointerleave', e => { if (e.pointerType === 'mouse' && !drag) { hover = -1; focus = -1; } });
      const press = (el, fn) => api.on(el, 'pointerdown', e => { e.preventDefault(); if (!el.disabled && !el.hidden) fn(); });
      press(bTake, tryTake); press(bBito, tryPass); press(bTr, tryTransfer);
      api.on(bMenu, 'click', () => { sfx('tap'); menu(); });
      api.on(window, 'keydown', e => {
        if (e.target && e.target.closest && e.target.closest('input,textarea,select')) return;
        if (scene !== 'game' || !pane.hidden) return;
        const k = (e.key || '').toLowerCase();
        if (k === 'arrowleft' || k === 'arrowright') {
          e.preventDefault();
          if (!D.hand.length) return;
          const i = D.hand.findIndex(h => h.id === focus), d = k === 'arrowleft' ? -1 : 1;
          focus = D.hand[i < 0 ? (d > 0 ? 0 : D.hand.length - 1) : (i + d + D.hand.length) % D.hand.length].id;
        } else if (k === 'enter' || k === ' ' || k === 'arrowup') {
          e.preventDefault();
          if (focus >= 0 && D.hand.some(h => h.id === focus)) tryCard(focus);
          else { const pl = playable(view()); if (pl.length) focus = pl[0]; }
        } else if (k === 't' || k === 'arrowdown') { e.preventDefault(); tryTake(); }
        else if (k === 'b' || k === 'p') tryPass();
        else if (k === 'x') tryTransfer();
        else if (k === '1' || k === '2' || k === '3' || k === '4' || k === '5' || k === '6') {
          const V = view();
          if (V && sel != null && V.phase === 'defend') { const s = +k - 1; if (beatSlots(V, sel).includes(s)) tryCard(sel, s); }
        }
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
      function glowRect(x, y, w, h, col, a) {
        ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = col; ctx.shadowBlur = 14;
        rrect(x, y, w, h, L.tw * .12, null, col, 4); ctx.restore();
      }

      function actors(V) {
        if (!V || !isIdle()) return [];
        if (V.phase === 'lead') return [V.att];
        if (V.phase === 'defend') return [V.def];
        if (V.phase === 'throw' || V.phase === 'take') return V.pend.slice();
        return [];
      }
      function drawPiles(t, V) {
        const tp = trumpPos();
        const stack = Math.max(0, D.deckN - (D.tcard >= 0 ? 1 : 0));
        if (D.trumpOn && D.tcard >= 0) card(D.tcard, tp.x, tp.y, tp.r, 1);
        const n = Math.min(5, Math.ceil(stack / 8));
        for (let i = n - 1; i >= 0; i--) card(-1, L.talon.x - i * 1.4, L.talon.y - i * 1.4, 0, 1);
        if (D.trumpOn && D.deckN > 0) {
          const bx = L.talon.x, by = L.talon.y;
          if (stack > 0) { ctx.beginPath(); ctx.arc(bx, by, PORT ? 13 : 16, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); label(String(D.deckN), bx, by + 1, PORT ? 13 : 16, '#fff'); }
        }
        if (D.trumpOn && D.deckN === 0) {
          const bx = L.talon.x, by = L.talon.y, r = PORT ? 24 : 32;
          ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
          ctx.save(); ctx.translate(bx, by); ctx.fillStyle = '#fff'; ctx.shadowColor = 'transparent'; pip(ctx, D.trump, 0, 0, r * .62, 0, '#fff'); ctx.restore();
        }
        if (D.disc > 0) {
          const k = Math.min(6, Math.ceil(D.disc / 5));
          for (let i = 0; i < k; i++) card(-1, L.disc.x + ((i * 37) % 11 - 5), L.disc.y + ((i * 53) % 9 - 4), ((i * 29) % 13 - 6) * .05, 1);
          ctx.beginPath(); ctx.arc(L.disc.x, L.disc.y, PORT ? 13 : 16, 0, TAU); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); label(String(D.disc), L.disc.x, L.disc.y + 1, PORT ? 13 : 16, '#fff');
        } else rrect(L.disc.x - L.cw / 2, L.disc.y - L.ch / 2, L.cw, L.ch, L.cw * .11, 'rgba(0,0,0,.14)', 'rgba(255,255,255,.22)', 2);
      }
      function drawTable(t, V) {
        const set = new Set();
        let hot = -1;
        if (drag && drag.lift && V) { beatSlots(V, drag.id).forEach(i => set.add(i)); hot = hoverSlot; }
        else if (sel != null && V && canAct()) beatSlots(V, sel).forEach(i => set.add(i));
        const dropZone = drag && drag.lift && V && !(V.phase === 'defend' && V.def === V.me);
        if (dropZone) {
          const rows = D.slots.length > 3 ? 2 : 1, h = rows * L.th + (rows - 1) * (L.gy2 - L.gy1 - L.th) + 40, cy = rows === 1 ? (L.gy1 + L.gy2) / 2 : (L.gy1 + L.gy2) / 2, w = L.gx * 3 + 20;
          ctx.save(); ctx.globalAlpha = .35 + Math.sin(t * .008) * .12; ctx.setLineDash([10, 8]);
          rrect(L.gc - w / 2, cy - h / 2, w, h, 22, 'rgba(255,255,255,.06)', '#fff', 3); ctx.restore();
        }
        D.slots.forEach((s, i) => {
          if (s.tx != null) { s.px += (s.tx - s.px) * .2; s.py += (s.ty - s.py) * .2; }
          if (set.has(i)) {
            const pulse = .55 + Math.sin(t * .01 + i) * .25 + (i === hot ? .3 : 0);
            glowRect(s.px - L.tw * .6, s.py - L.th * .56, L.tw * 1.2, L.th * 1.12, i === hot ? '#fff36b' : '#8dffa6', Math.min(1, pulse));
          }
          if (s.a) { const p = slotA(i); card(s.a.id, p.x, p.y, p.r, p.s); }
          if (s.d) { const p = slotD(i); card(s.d.id, p.x, p.y, p.r, p.s); }
        });
      }
      const teamCol = p => (p % 2 ? '#ffb347' : '#6ec6ff');
      function badge(x, y, kind, r) {
        ctx.save(); ctx.translate(x, y);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = kind === 'att' ? '#d8301f' : '#1f6fd0'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
        if (kind === 'att') swordIco(ctx, r * 1.5); else shieldIco(ctx, r * 1.4);
        ctx.restore();
      }
      function drawSeat(p, t, act) {
        const r = rel(p), s = L.seat[r], av = L.av;
        const out = D.outs.includes(p), cnt = D.counts[p] || 0;
        const on = act.includes(p);
        if (r) {
          const f = L.fan[r], k = Math.min(cnt, 14), spread = PORT ? 5 : 7, fs = .42 * (PORT ? .8 : 1);
          for (let i = 0; i < k; i++) { const o = i - (k - 1) / 2; card(-1, f.x + o * spread, f.y + Math.abs(o) * .7, o * .05, fs); }
        }
        ctx.save();
        if (out) ctx.globalAlpha = .55;
        if (on) {
          ctx.save(); ctx.shadowColor = '#fff36b'; ctx.shadowBlur = 16;
          ctx.beginPath(); ctx.arc(s.x, s.y, av + 5 + Math.sin(t * .008) * 1.5, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#fff36b'; ctx.stroke(); ctx.restore();
        }
        if (D.teams) { ctx.beginPath(); ctx.arc(s.x, s.y, av + 3, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = teamCol(p); ctx.stroke(); }
        avatar(ctx, s.x, s.y, av, M.av[p] || 0);
        ctx.restore();
        if (D.over === false) {
          if (p === D.att) badge(s.x - av * .8, s.y - av * .72, 'att', PORT ? 10 : 13);
          else if (p === D.def) badge(s.x - av * .8, s.y - av * .72, 'def', PORT ? 10 : 13);
        }
        if (r) {
          const bx = s.x + av * .78, by = s.y - av * .72;
          ctx.beginPath(); ctx.arc(bx, by, PORT ? 10 : 13, 0, TAU); ctx.fillStyle = out ? '#2f7d46' : cnt <= 2 ? '#d8301f' : '#121214'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
          label(out ? '✓' : String(cnt), bx, by + .5, PORT ? 11 : 14, '#fff');
        }
        const ny = s.y + av + (PORT ? 10 : 13);
        if (r || !PORT) label(nm(p), s.x, ny, PORT ? 11 : 14, out ? 'rgba(255,255,255,.65)' : '#fff', 'center', 'rgba(0,0,0,.45)');
        if (r && isCpu(p) && on && scene === 'game') {
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(s.x - 8 + i * 8, s.y - av - 10, 2.6 + Math.max(0, Math.sin(t * .01 - i)) * 1.4, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); }
        }
        if (on && M.dl && M.dlTid === (view() || {}).tid) {
          const left = Math.max(0, (M.dl - now()) / (opt.timer * 1000 || 1));
          ctx.beginPath(); ctx.arc(s.x, s.y, av + 9, -Math.PI / 2, -Math.PI / 2 + TAU * left); ctx.lineWidth = 4; ctx.strokeStyle = left < .25 ? '#ff5b4b' : '#7fe08e'; ctx.stroke();
        }
      }
      function drawHand(t, dt, V, pl, mineAct) {
        const act = canAct(), set = new Set(mineAct ? pl : []);
        const sl = handSlots(D.hand.length), k = 1 - Math.exp(-dt * 14);
        D.hand.forEach((e, i) => {
          const s = sl[i]; if (!s) return;
          e.tx = s.x; e.ty = s.y; e.tr = s.r;
          const lift = (set.has(e.id) ? (PORT ? 10 : 14) : 0) + (focus === e.id ? (PORT ? 8 : 12) : 0) + (sel === e.id ? (PORT ? 16 : 22) : 0);
          e.x = lerp(e.x, s.x, k); e.y = lerp(e.y, s.y, k); e.r = lerp(e.r, s.r, k); e.lift = lerp(e.lift || 0, lift, k);
        });
        for (const e of D.hand) {
          if (e.ghost) continue;
          if (drag && drag.lift && drag.id === e.id) continue;
          let x = e.x;
          if (e.shake) { const a = (now() - e.shake) / 300; if (a < 1) x += Math.sin(a * 30) * 6 * (1 - a); else e.shake = 0; }
          const sc = focus === e.id ? 1.06 : 1;
          card(e.id, x, e.y - e.lift, e.r, sc);
          if (act && mineAct && !set.has(e.id)) { ctx.save(); ctx.translate(x, e.y - e.lift); ctx.rotate(e.r); ctx.scale(sc, sc); rrect(-L.cw / 2, -L.ch / 2, L.cw, L.ch, L.cw * .09, 'rgba(0,0,0,.34)'); ctx.restore(); }
          if (sel === e.id) { ctx.save(); ctx.translate(x, e.y - e.lift); ctx.rotate(e.r); ctx.scale(sc, sc); rrect(-L.cw / 2, -L.ch / 2, L.cw, L.ch, L.cw * .09, null, '#fff36b', 4); ctx.restore(); }
        }
        if (drag && drag.lift) card(drag.id, drag.x, drag.y - (PORT ? 18 : 10), 0, 1.1);
      }
      function drawMe(t, mineAct) {
        const s = L.seat[0], out = D.outs.includes(viewer), av = PORT ? 17 : L.av;
        ctx.save(); if (out) ctx.globalAlpha = .6;
        if (mineAct) { ctx.save(); ctx.shadowColor = '#fff36b'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.arc(s.x, s.y, av + 5 + Math.sin(t * .008) * 1.5, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = '#fff36b'; ctx.stroke(); ctx.restore(); }
        if (D.teams) { ctx.beginPath(); ctx.arc(s.x, s.y, av + 3, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = teamCol(viewer); ctx.stroke(); }
        avatar(ctx, s.x, s.y, av, M.av[viewer] || 0);
        ctx.restore();
        if (!D.over) {
          if (viewer === D.att) badge(s.x - av * .8, s.y - av * .72, 'att', PORT ? 9 : 13);
          else if (viewer === D.def) badge(s.x - av * .8, s.y - av * .72, 'def', PORT ? 9 : 13);
        }
        if (!PORT) label(nm(viewer), s.x, s.y + av + 13, 14, '#fff', 'center', 'rgba(0,0,0,.45)');
        if (out) label('Out', s.x, s.y + av + (PORT ? 10 : 29), 12, '#7fe08e');
      }
      function drawStatus(t, V, act, mineAct) {
        if (!V || scene !== 'game' || !isIdle() || V.phase === 'over' || V.phase === 'idle') return;
        let tx = '', col = '#fff';
        const me = V.me;
        if (D.outs.includes(me)) tx = 'You are out - watching';
        else if (V.phase === 'lead') { tx = V.att === me ? 'Your attack - lead a card' : nm(V.att) + ' attacks'; if (V.att === me) col = '#fff36b'; }
        else if (V.phase === 'defend') {
          if (V.def === me) { col = '#fff36b'; tx = sel != null ? 'Tap a glowing card to beat it' : playable(V).length ? (V.rules.perevod && V.hand.some(x => canTransferV(V, x)) ? 'Beat, transfer or take' : 'Beat the cards or take') : 'Nothing beats it - take'; }
          else tx = nm(V.def) + ' defends';
        } else if (V.phase === 'throw') {
          if (V.pend.includes(me)) { col = '#fff36b'; tx = V.att === me ? 'Throw in more or Bito' : 'Throw in or pass'; }
          else tx = 'Waiting for throw-ins';
        } else if (V.phase === 'take') {
          if (V.def === me) tx = 'You take the cards';
          else if (V.pend.includes(me)) { col = '#fff36b'; tx = 'Add cards for ' + nm(V.def) + ' or Done'; }
          else tx = nm(V.def) + ' takes';
        }
        if (tx && M.dl && M.dlTid === V.tid && act.length) { const left = Math.ceil((M.dl - now()) / 1000); if (left >= 0) tx += ' · ' + left + 's'; }
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
          else if (f.back && p > f.back) card(-1, x, y, r, s);
          else card(f.id, x, y, r, s);
          if (p >= 1) { const i = fly.indexOf(f); if (i >= 0) fly.splice(i, 1); if (f.onEnd) f.onEnd(); }
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
            label(f.txt, 0, 0, f.big ? (PORT ? 24 : 32) : (PORT ? 16 : 19), f.col, 'center', '#121214');
            ctx.restore();
          } else if (f.k === 'bub') {
            const s = seatXY(f.p), r = rel(f.p);
            const bx = r ? s.x : W / 2, by = r ? s.y + L.av + (PORT ? 34 : 70) : (PORT ? L.row - 44 : H - 175);
            const sc = a < .12 ? .4 + a / .12 * .6 : 1;
            ctx.save(); ctx.globalAlpha = a > .8 ? (1 - a) / .2 : 1; ctx.translate(bx, by); ctx.scale(sc, sc); ctx.rotate(-.05);
            ctx.font = `900 ${PORT ? 15 : 18}px ${FONT}`;
            const w = ctx.measureText(f.txt).width + 24, h = PORT ? 30 : 36;
            rrect(-w / 2, -h / 2, w, h, h / 2, '#fcc916', '#121214', 3);
            label(f.txt, 0, 1, PORT ? 15 : 18, '#c71b10');
            ctx.restore();
          }
        }
      }
      function drawTitle(t) {
        const fan = (cx, cy, ids, rot) => ids.forEach((id, i) => { const o = i - (ids.length - 1) / 2; card(id, cx + o * (PORT ? 30 : 42), cy + Math.abs(o) * 9 + Math.sin(t * .002 + i) * 3, o * .22 + rot, PORT ? .9 : 1); });
        const ids = [12 + 2 * 16, 14 + 3 * 16, 11 + 0 * 16, 13 + 1 * 16, 9 + 2 * 16];
        if (PORT) fan(W / 2, 640, ids, 0);
        else { fan(150, 480, ids.slice(0, 4), -.08); fan(W - 150, 480, ids.slice(1), .08); }
      }
      let lastT = now();
      api.loop((dtc, t) => {
        const dt = Math.min(.05, (t - lastT) / 1000); lastT = t;
        pump();
        ctx.drawImage(feltC, 0, 0, W, H);
        if (scene === 'title') { drawTitle(t); drawFx(t, dt); return; }
        const V = view(), act = actors(V), mineAct = !!V && act.includes(V.me) && canAct(), pl = mineAct ? playable(V) : [];
        drawPiles(t, V);
        for (let p = 0; p < D.n; p++) if (p !== viewer) drawSeat(p, t, act);
        drawMe(t, mineAct);
        drawTable(t, V);
        drawHand(t, dt, V, pl, mineAct);
        drawStatus(t, V, act, mineAct);
        drawFly(t);
        drawFx(t, dt);
      });

      fit(true);
      if (document.fonts && document.fonts.load) document.fonts.load(`900 40px ${FONT}`).then(() => { if (api.alive) sprites(); }, () => {});
      root._dk = { M, D, Q, view, opt, get viewer() { return viewer; }, idle: isIdle, slots: () => D.hand.map(e => ({ id: e.id, x: e.x, y: e.y - e.lift, ghost: !!e.ghost })), tbl: () => D.slots.map(s => ({ x: s.px, y: s.py, a: s.a && s.a.id, d: s.d && s.d.id })), btn: () => ({ take: !bTake.hidden, bito: !bBito.hidden, tr: !bTr.hidden }), size: () => [W, H], playable: () => playable(view()), sel: () => sel, beat: id => beatSlots(view(), id), hand: () => D.hand.map(e => e.id), send, hp: () => handTop(), pane: () => pane.hidden ? '' : pane.dataset.k, dbg: () => ({ paused, busy: Math.round(busy - now()), q: Q.map(e => e.k), fly: fly.map(f => [Math.round(f.t0 - now()), f.dur, f.started]), idleDone }) };
      if (api.net.invite) startOnline(); else showTitle();
      return { destroy() { M.tok++; try { if (ac) ac.close(); } catch (e) {} } };
    }
  });

  Ameplay.covers['durak'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="dkc-g" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#2f9c5a"/><stop offset=".6" stop-color="#1b6a3a"/><stop offset="1" stop-color="#0a3a1f"/></radialGradient></defs><rect width="400" height="300" fill="url(#dkc-g)"/><g transform="translate(112 150) rotate(-14)"><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#fff"/><text x="-40" y="-52" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="30" fill="#c8262c">9</text><path d="M0 28c-26-34-52-8-34 18 10 14 34 28 34 28s24-14 34-28c18-26-8-52-34-18z" fill="#c8262c" transform="translate(0 -22) scale(.9)"/></g><g transform="translate(236 140) rotate(8)"><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#fff"/><text x="-42" y="-52" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="30" fill="#1b1b1f">K</text><path d="M0-34c-8 22-38 22-38 44 0 14 14 22 26 18-2 10-6 16-12 20h48c-6-4-10-10-12-20 12 4 26-4 26-18 0-22-30-22-38-44z" fill="#1b1b1f" transform="translate(0 10) scale(.9)"/></g><g transform="translate(322 232) rotate(90)"><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#000" opacity=".25" transform="translate(5 8)"/><rect x="-52" y="-78" width="104" height="156" rx="11" fill="#fff"/><rect x="-44" y="-70" width="88" height="140" rx="7" fill="#c8262c" opacity=".92"/><path d="M0-30l24 30-24 30-24-30z" fill="#fff" opacity=".85"/></g><g transform="translate(96 222) rotate(-4)" fill="none" stroke="#e63a35" stroke-width="7"><rect x="-84" y="-22" width="168" height="44" rx="10" transform="rotate(-4)"/><text x="0" y="12" font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" font-size="34" fill="#e63a35" stroke="none" text-anchor="middle" letter-spacing="3" transform="rotate(-4)">DURAK</text></g></svg>`;
})();
