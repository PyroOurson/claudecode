
(() => {
  'use strict';
  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const SZ = 560, FR = 24, SQ = 64, INF = 1e9, WIN = 100000;
  const now = () => performance.now();
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
  const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
  const winsFmt = v => v + (v === 1 ? ' win' : ' wins');
  const HELP = 'Tap or drag pieces · arrows + <kbd>Enter</kbd> · <kbd>U</kbd> undo · <kbd>N</kbd> new game';

  function deepen(T, ms, o, make, unmake, ab) {
    if (!ms.length) return null;
    if (o.blunder && Math.random() < o.blunder) return ms[Math.random() * ms.length | 0];
    T.t0 = now(); T.stop = false; T.nodes = 0; T.depth = 0; T.max = o.nodes || 6e6;
    const rs = ms.map(() => 0);
    let best = ms[0];
    for (let d = 1; d <= o.depth; d++) {
      T.tl = d <= o.minDepth ? (o.cap || 1450) : o.time; T.rootD = d;
      let alpha = -INF, cur = null, curV = -INF;
      for (let i = 0; i < ms.length; i++) {
        make(ms[i]);
        let v = -ab(d - 1, -INF, o.noise ? INF : -alpha, 1);
        unmake();
        if (T.stop) break;
        if (o.noise) v += (Math.random() - .5) * o.noise;
        rs[i] = v;
        if (v > curV) { curV = v; cur = ms[i]; if (v > alpha) alpha = v; }
      }
      if (T.stop) { if (cur !== null && !o.noise) best = cur; break; }
      best = cur; T.depth = d; T.score = curV;
      const idx = ms.map((_, i) => i).sort((a, c) => rs[c] - rs[a]), m2 = idx.map(i => ms[i]), r2 = idx.map(i => rs[i]);
      for (let i = 0; i < ms.length; i++) { ms[i] = m2[i]; rs[i] = r2[i]; }
      if (Math.abs(curV) > WIN / 2) break;
    }
    return best;
  }

  function chessCore() {
    const INF = 1e9, WIN = 100000, now = () => performance.now();
    const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const CV = [0, 100, 320, 330, 500, 900, 0], PHASE = [0, 0, 1, 1, 2, 4, 0];
    const KN = [-33, -31, -18, -14, 14, 18, 31, 33], KG = [-17, -16, -15, -1, 1, 15, 16, 17], DG = [-17, -15, 15, 17], OR = [-16, -1, 1, 16];
    const CM = new Uint8Array(128).fill(15); CM[0] = 13; CM[7] = 14; CM[4] = 12; CM[112] = 7; CM[119] = 11; CM[116] = 3;
    const PST = [null,
      [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
      [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
      [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
      [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
      [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20]];
    const K_MID = [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20];
    const K_END = [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50];
    const PASSED = [0, 10, 14, 22, 38, 62, 95, 0];
    const TBL = [];
    for (let p = -5; p <= 5; p++) {
      const t = new Int16Array(128);
      if (p) for (let sq = 0; sq < 120; sq++) { if (sq & 0x88) { sq += 7; continue; } const a = Math.abs(p), r = sq >> 4, f = sq & 7; t[sq] = Math.sign(p) * (CV[a] + PST[a][p > 0 ? (7 - r) * 8 + f : r * 8 + f]); }
      TBL[p + 6] = t;
    }
    const ktab = raw => { const w = new Int16Array(128), b = new Int16Array(128); for (let sq = 0; sq < 120; sq++) { if (sq & 0x88) { sq += 7; continue; } w[sq] = raw[(7 - (sq >> 4)) * 8 + (sq & 7)]; b[sq] = raw[(sq >> 4) * 8 + (sq & 7)]; } return [w, b]; };
    const [KMW, KMB] = ktab(K_MID), [KEW, KEB] = ktab(K_END);
    const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const FILES = 'abcdefgh', PCH = 'kqrbnp.PNBRQK';
    const sqName = sq => FILES[sq & 7] + ((sq >> 4) + 1);
    const ZA = new Int32Array(13 * 128), ZB = new Int32Array(13 * 128), ZCA = new Int32Array(16), ZCB = new Int32Array(16), ZEA = new Int32Array(128), ZEB = new Int32Array(128);
    const zr = rng(918273645), R32 = () => (zr() * 4294967296) | 0;
    for (let i = 0; i < ZA.length; i++) { ZA[i] = R32(); ZB[i] = R32(); }
    for (let i = 0; i < 16; i++) { ZCA[i] = R32(); ZCB[i] = R32(); }
    for (let i = 0; i < 128; i++) { ZEA[i] = R32(); ZEB[i] = R32(); }
    const ZSA = R32(), ZSB = R32();
    const BOOK = [
      'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3',
      'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1 f6e4 d2d4 e4d6 b5c6 d7c6 d4e5 d6f5',
      'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6 e1g1 e8g8',
      'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8e7 e1g1 e8g8 f1e1 d7d6',
      'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4 c5b4 c2c3 b4a5 d2d4',
      'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4 g8f6 d4c6 b7c6 e4e5 d8e7',
      'e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4 d2d4 d6d5 f1d3',
      'e2e4 e7e5 b1c3 g8f6 f2f4 d7d5 f4e5 f6e4 g1f3',
      'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6 c1e3 e7e5 d4b3 c8e6',
      'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6 c1e3 f8g7 f2f3 e8g8 d1d2 b8c6',
      'e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 d7d6 c1g5 e7e6',
      'e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 b8c6 b1c3 d8c7 c1e3 a7a6',
      'e2e4 c7c5 c2c3 g8f6 e4e5 f6d5 d2d4 c5d4 g1f3 b8c6',
      'e2e4 c7c5 b1c3 b8c6 g2g3 g7g6 f1g2 f8g7 d2d3 d7d6',
      'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5 f8e7 e4e5 f6d7 g5e7 d8e7',
      'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 a2a3',
      'e2e4 e7e6 d2d4 d7d5 b1d2 g8f6 e4e5 f6d7 f1d3 c7c5 c2c3',
      'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6 h2h4 h7h6 g1f3 b8d7',
      'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5 g1f3 e7e6 f1e2 c6c5',
      'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5 d2d4 g8f6 g1f3 c8f5 f1c4 e7e6',
      'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6 g1f3 f8g7 f1e2 e8g8 e1g1',
      'e2e4 g7g6 d2d4 f8g7 b1c3 d7d6 g1f3 g8f6',
      'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8 g1f3 h7h6 g5h4 b7b6',
      'd2d4 d7d5 c2c4 d5c4 g1f3 g8f6 e2e3 e7e6 f1c4 c7c5 e1g1 a7a6',
      'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5 e2e3 e7e6',
      'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 e2e3 c8f5 b1c3 e7e6',
      'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8 f1e2 e7e5 e1g1 b8c6',
      'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5 g1f3 c7c5',
      'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 d1c2 e8g8 a2a3 b4c3 c2c3',
      'd2d4 g8f6 c2c4 e7e6 g1f3 b7b6 g2g3 c8b7 f1g2 f8e7 e1g1 e8g8',
      'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5 c4d5 f6d5 e2e4 d5c3 b2c3 f8g7 g1f3 c7c5',
      'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2 f8e7 g1f3 e8g8 e1g1 d5c4',
      'd2d4 g8f6 c2c4 c7c5 d4d5 e7e6 b1c3 e6d5 c4d5 d7d6 e2e4 g7g6',
      'd2d4 d7d5 c1f4 g8f6 e2e3 e7e6 g1f3 c7c5 c2c3 b8c6 b1d2',
      'd2d4 g8f6 c1f4 d7d5 e2e3 c7c5 c2c3 b8c6 g1f3',
      'd2d4 f7f5 g2g3 g8f6 f1g2 e7e6 g1f3 f8e7 e1g1 e8g8 c2c4 d7d6',
      'd2d4 d7d5 g1f3 g8f6 c2c4 e7e6 b1c3 c7c6 e2e3 b8d7',
      'c2c4 e7e5 b1c3 g8f6 g1f3 b8c6 g2g3 d7d5 c4d5 f6d5 f1g2 d5b6',
      'c2c4 c7c5 g1f3 g8f6 b1c3 b8c6 g2g3 g7g6 f1g2 f8g7 e1g1 e8g8',
      'c2c4 g8f6 b1c3 e7e6 e2e4 d7d5 e4e5 d5d4',
      'g1f3 d7d5 g2g3 g8f6 f1g2 e7e6 e1g1 f8e7 d2d3 e8g8 b1d2 c7c5',
      'g1f3 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 d2d4 e8g8'
    ].map(l => l.split(' '));
    const uciSq = s => (s.charCodeAt(1) - 49) * 16 + s.charCodeAt(0) - 97;

    function chessEngine() {
      const b = new Int8Array(128);
      let side = 1, cast = 0, ep = -1, half = 0, kw = 4, kb = 116, sp = 0, hA = 0, hB = 0;
      const U = 4096, uM = new Int32Array(U), uC = new Int8Array(U), uCa = new Uint8Array(U), uEp = new Int16Array(U), uH = new Int16Array(U), uHA = new Int32Array(U), uHB = new Int32Array(U);
      const T = {}, killers = new Int32Array(512), histT = new Int32Array(128 * 128), MB = [], SB = [];
      for (let i = 0; i < 160; i++) { MB.push([]); SB.push([]); }
      const TS = 1 << 19, TMASK = TS - 1, TK = new Int32Array(TS), TV = new Int32Array(TS), TMv = new Int32Array(TS), TD = new Int8Array(TS), TF = new Int8Array(TS);
      const game = [];

      function rehash() {
        hA = 0; hB = 0;
        for (let sq = 0; sq < 120; sq++) { if (sq & 0x88) { sq += 7; continue; } if (b[sq]) { const z = (b[sq] + 6) * 128 + sq; hA ^= ZA[z]; hB ^= ZB[z]; } }
        hA ^= ZCA[cast]; hB ^= ZCB[cast];
        if (ep >= 0) { hA ^= ZEA[ep]; hB ^= ZEB[ep]; }
        if (side < 0) { hA ^= ZSA; hB ^= ZSB; }
      }
      function load(fen) {
        b.fill(0); sp = 0; game.length = 0;
        const [pl, sd, cs = '-', e = '-', hm = '0'] = fen.trim().split(/\s+/);
        let r = 7, f = 0;
        for (const ch of pl) {
          if (ch === '/') { r--; f = 0; } else if (ch >= '1' && ch <= '8') f += +ch;
          else { const t = 'pnbrqk'.indexOf(ch.toLowerCase()) + 1, sq = r * 16 + f, w = ch < 'a'; b[sq] = w ? t : -t; if (t === 6) { if (w) kw = sq; else kb = sq; } f++; }
        }
        side = sd === 'b' ? -1 : 1;
        cast = (cs.includes('K') ? 1 : 0) | (cs.includes('Q') ? 2 : 0) | (cs.includes('k') ? 4 : 0) | (cs.includes('q') ? 8 : 0);
        ep = e !== '-' ? e.charCodeAt(0) - 97 + (e.charCodeAt(1) - 49) * 16 : -1;
        half = +hm || 0;
        rehash();
      }
      function attacked(sq, by) {
        const pd = sq - 16 * by;
        if (!((pd - 1) & 0x88) && b[pd - 1] === by) return true;
        if (!((pd + 1) & 0x88) && b[pd + 1] === by) return true;
        for (let i = 0; i < 8; i++) { const s = sq + KN[i]; if (!(s & 0x88) && b[s] === 2 * by) return true; }
        for (let i = 0; i < 8; i++) { const s = sq + KG[i]; if (!(s & 0x88) && b[s] === 6 * by) return true; }
        for (let i = 0; i < 4; i++) { const d = DG[i]; let s = sq + d; while (!(s & 0x88)) { const q = b[s]; if (q) { if (q === 3 * by || q === 5 * by) return true; break; } s += d; } }
        for (let i = 0; i < 4; i++) { const d = OR[i]; let s = sq + d; while (!(s & 0x88)) { const q = b[s]; if (q) { if (q === 4 * by || q === 5 * by) return true; break; } s += d; } }
        return false;
      }
      function gen(out, caps) {
        const us = side;
        for (let sq = 0; sq < 120; sq++) {
          if (sq & 0x88) { sq += 7; continue; }
          const p = b[sq] * us;
          if (p <= 0) continue;
          if (p === 1) {
            const dir = 16 * us, r = sq >> 4, promo = us === 1 ? r === 6 : r === 1, one = sq + dir;
            if (!b[one]) {
              if (promo) { out.push(sq | one << 7 | 5 << 14); if (!caps) for (let z = 4; z >= 2; z--) out.push(sq | one << 7 | z << 14); }
              else if (!caps) { out.push(sq | one << 7); if ((us === 1 ? r === 1 : r === 6) && !b[one + dir]) out.push(sq | (one + dir) << 7 | 1 << 17); }
            }
            for (let k = -1; k <= 1; k += 2) {
              const to = one + k;
              if (to & 0x88) continue;
              const q = b[to];
              if (q * us < 0) {
                if (promo) { out.push(sq | to << 7 | 5 << 14); if (!caps) for (let z = 4; z >= 2; z--) out.push(sq | to << 7 | z << 14); }
                else out.push(sq | to << 7);
              } else if (to === ep && !q) out.push(sq | to << 7 | 2 << 17);
            }
          } else if (p === 2 || p === 6) {
            const D = p === 2 ? KN : KG;
            for (let i = 0; i < 8; i++) {
              const to = sq + D[i];
              if (to & 0x88) continue;
              const q = b[to] * us;
              if (q > 0 || (caps && !q)) continue;
              out.push(sq | to << 7);
            }
            if (p === 6 && !caps) {
              if (us === 1 && sq === 4) {
                if ((cast & 1) && !b[5] && !b[6] && b[7] === 4 && !attacked(4, -1) && !attacked(5, -1)) out.push(4 | 6 << 7 | 3 << 17);
                if ((cast & 2) && !b[3] && !b[2] && !b[1] && b[0] === 4 && !attacked(4, -1) && !attacked(3, -1)) out.push(4 | 2 << 7 | 3 << 17);
              } else if (us === -1 && sq === 116) {
                if ((cast & 4) && !b[117] && !b[118] && b[119] === -4 && !attacked(116, 1) && !attacked(117, 1)) out.push(116 | 118 << 7 | 3 << 17);
                if ((cast & 8) && !b[115] && !b[114] && !b[113] && b[112] === -4 && !attacked(116, 1) && !attacked(115, 1)) out.push(116 | 114 << 7 | 3 << 17);
              }
            }
          } else {
            const D = p === 3 ? DG : p === 4 ? OR : KG, nd = p === 5 ? 8 : 4;
            for (let i = 0; i < nd; i++) {
              const d = D[i];
              let to = sq + d;
              while (!(to & 0x88)) {
                const q = b[to] * us;
                if (q > 0) break;
                if (q < 0) { out.push(sq | to << 7); break; }
                if (!caps) out.push(sq | to << 7);
                to += d;
              }
            }
          }
        }
      }
      function make(m) {
        const from = m & 127, to = m >> 7 & 127, pr = m >> 14 & 7, fl = m >> 17, p = b[from], np = pr ? pr * side : p;
        let cap = b[to];
        uM[sp] = m; uCa[sp] = cast; uEp[sp] = ep; uH[sp] = half; uHA[sp] = hA; uHB[sp] = hB;
        let z = (p + 6) * 128 + from; hA ^= ZA[z]; hB ^= ZB[z];
        z = (np + 6) * 128 + to; hA ^= ZA[z]; hB ^= ZB[z];
        if (cap) { z = (cap + 6) * 128 + to; hA ^= ZA[z]; hB ^= ZB[z]; }
        b[to] = np; b[from] = 0;
        if (fl === 2) { const cs = to - 16 * side; cap = b[cs]; z = (cap + 6) * 128 + cs; hA ^= ZA[z]; hB ^= ZB[z]; b[cs] = 0; }
        else if (fl === 3) {
          const rf = to > from ? from + 3 : from - 4, rt = to > from ? from + 1 : from - 1, rk = b[rf];
          z = (rk + 6) * 128 + rf; hA ^= ZA[z]; hB ^= ZB[z]; z = (rk + 6) * 128 + rt; hA ^= ZA[z]; hB ^= ZB[z];
          b[rt] = rk; b[rf] = 0;
        }
        uC[sp++] = cap;
        if (p === 6) kw = to; else if (p === -6) kb = to;
        if (ep >= 0) { hA ^= ZEA[ep]; hB ^= ZEB[ep]; }
        ep = fl === 1 ? from + 16 * side : -1;
        if (ep >= 0) { hA ^= ZEA[ep]; hB ^= ZEB[ep]; }
        half = p === 1 || p === -1 || cap ? 0 : half + 1;
        hA ^= ZCA[cast]; hB ^= ZCB[cast];
        cast &= CM[from] & CM[to];
        hA ^= ZCA[cast] ^ ZSA; hB ^= ZCB[cast] ^ ZSB;
        side = -side;
      }
      function unmake() {
        const m = uM[--sp], from = m & 127, to = m >> 7 & 127, pr = m >> 14 & 7, fl = m >> 17;
        side = -side;
        const p = pr ? side : b[to];
        b[from] = p;
        if (fl === 2) { b[to] = 0; b[to - 16 * side] = uC[sp]; }
        else {
          b[to] = uC[sp];
          if (fl === 3) { if (to > from) { b[from + 3] = b[from + 1]; b[from + 1] = 0; } else { b[from - 4] = b[from - 1]; b[from - 1] = 0; } }
        }
        if (p === 6) kw = from; else if (p === -6) kb = from;
        cast = uCa[sp]; ep = uEp[sp]; half = uH[sp]; hA = uHA[sp]; hB = uHB[sp];
      }
      function makeNull() {
        uM[sp] = 0; uCa[sp] = cast; uEp[sp] = ep; uH[sp] = half; uHA[sp] = hA; uHB[sp] = hB; uC[sp++] = 0;
        if (ep >= 0) { hA ^= ZEA[ep]; hB ^= ZEB[ep]; ep = -1; }
        hA ^= ZSA; hB ^= ZSB; half = 0; side = -side;
      }
      function unmakeNull() { sp--; side = -side; ep = uEp[sp]; half = uH[sp]; hA = uHA[sp]; hB = uHB[sp]; }
      const inCheck = () => attacked(side === 1 ? kw : kb, -side);
      const illegal = () => attacked(side === 1 ? kb : kw, side);
      function legal() {
        const ms = [], out = [];
        gen(ms, false);
        for (const m of ms) { make(m); if (!illegal()) out.push(m); unmake(); }
        return out;
      }
      function perft(d) {
        if (!d) return 1;
        const ms = [];
        gen(ms, false);
        let n = 0;
        for (const m of ms) { make(m); if (!illegal()) n += d === 1 ? 1 : perft(d - 1); unmake(); }
        return n;
      }
      const wpf = new Int8Array(8), bpf = new Int8Array(8), wMin = new Int8Array(8), wMax = new Int8Array(8), bMin = new Int8Array(8), bMax = new Int8Array(8);
      function evaluate() {
        let s = 0, ph = 0, mw = 0, mb = 0, wb = 0, bbp = 0;
        wpf.fill(0); bpf.fill(0); wMin.fill(9); bMin.fill(9); wMax.fill(-1); bMax.fill(-1);
        for (let sq = 0; sq < 120; sq++) {
          if (sq & 0x88) { sq += 7; continue; }
          const p = b[sq];
          if (!p || p === 6 || p === -6) continue;
          s += TBL[p + 6][sq];
          const f = sq & 7, r = sq >> 4;
          if (p > 0) { ph += PHASE[p]; mw += CV[p]; if (p === 3) wb++; if (p === 1) { wpf[f]++; if (r < wMin[f]) wMin[f] = r; if (r > wMax[f]) wMax[f] = r; } }
          else { ph += PHASE[-p]; mb += CV[-p]; if (p === -3) bbp++; if (p === -1) { bpf[f]++; if (r < bMin[f]) bMin[f] = r; if (r > bMax[f]) bMax[f] = r; } }
        }
        if (ph > 24) ph = 24;
        const eg = 24 - ph;
        s += ((KMW[kw] - KMB[kb]) * ph + (KEW[kw] - KEB[kb]) * eg) / 24 | 0;
        if (wb >= 2) s += 30;
        if (bbp >= 2) s -= 30;
        for (let f = 0; f < 8; f++) {
          if (wpf[f] > 1) s -= 12 * (wpf[f] - 1);
          if (bpf[f] > 1) s += 12 * (bpf[f] - 1);
          const lw = f > 0 ? wpf[f - 1] : 0, rw = f < 7 ? wpf[f + 1] : 0, lb = f > 0 ? bpf[f - 1] : 0, rb = f < 7 ? bpf[f + 1] : 0;
          if (wpf[f] && !lw && !rw) s -= 11 * wpf[f];
          if (bpf[f] && !lb && !rb) s += 11 * bpf[f];
          if (wpf[f]) {
            const r = wMax[f]; let free = true;
            for (let g = Math.max(0, f - 1); g <= Math.min(7, f + 1) && free; g++) if (bpf[g] && bMax[g] > r) free = false;
            if (free) s += (PASSED[r] * (12 + eg)) / 24 | 0;
          }
          if (bpf[f]) {
            const r = bMin[f]; let free = true;
            for (let g = Math.max(0, f - 1); g <= Math.min(7, f + 1) && free; g++) if (wpf[g] && wMin[g] < r) free = false;
            if (free) s -= (PASSED[7 - r] * (12 + eg)) / 24 | 0;
          }
        }
        for (let sq = 0; sq < 120; sq++) {
          if (sq & 0x88) { sq += 7; continue; }
          const p = b[sq];
          if (p === 4 || p === -4) {
            const f = sq & 7, own = p > 0 ? wpf[f] : bpf[f], opp = p > 0 ? bpf[f] : wpf[f];
            const v = !own ? (!opp ? 18 : 9) : 0;
            s += p > 0 ? v : -v;
          }
        }
        if (ph > 8) {
          const shield = (k, dir, pawn) => { let n = 0; const f = k & 7; for (let df = -1; df <= 1; df++) { const ff = f + df; if (ff < 0 || ff > 7) continue; const s1 = k + dir + df, s2 = k + 2 * dir + df; if (!(s1 & 0x88) && b[s1] === pawn) n += 2; else if (!(s2 & 0x88) && b[s2] === pawn) n += 1; } return n; };
          const kwf = kw & 7, kbf = kb & 7;
          let ks = 0;
          if ((kwf <= 2 || kwf >= 5) && (kw >> 4) <= 1) ks += shield(kw, 16, 1) * 6;
          if ((kbf <= 2 || kbf >= 5) && (kb >> 4) >= 6) ks -= shield(kb, -16, -1) * 6;
          s += (ks * ph) / 24 | 0;
        }
        if (ph < 10 && Math.abs(mw - mb) >= 200) {
          const w = mw > mb ? 1 : -1, lk = w === 1 ? kb : kw, lf = lk & 7, lr = lk >> 4;
          const kd = Math.abs((kw & 7) - (kb & 7)) + Math.abs((kw >> 4) - (kb >> 4));
          s += w * ((Math.max(3 - lf, lf - 4) + Math.max(3 - lr, lr - 4)) * 12 + (14 - kd) * 5);
        }
        return s * side + 10;
      }
      function key() {
        let s = '';
        for (let sq = 0; sq < 120; sq++) { if (sq & 0x88) { sq += 7; continue; } s += PCH[b[sq] + 6]; }
        let e = '-';
        if (ep >= 0) { const ps = ep - 16 * side; if (b[ps - 1] === side || b[ps + 1] === side) e = ep; }
        return s + side + cast + e;
      }
      function insufficient() {
        let minors = 0, knights = 0, bc = 0;
        for (let sq = 0; sq < 120; sq++) {
          if (sq & 0x88) { sq += 7; continue; }
          const p = Math.abs(b[sq]);
          if (!p || p === 6) continue;
          if (p === 1 || p === 4 || p === 5) return false;
          minors++;
          if (p === 2) knights++; else bc |= 1 << (((sq >> 4) + (sq & 7)) & 1);
        }
        return minors <= 1 || (!knights && bc !== 3);
      }
      function san(m, ms) {
        const from = m & 127, to = m >> 7 & 127, pr = m >> 14 & 7, fl = m >> 17, p = Math.abs(b[from]);
        let s;
        if (fl === 3) s = to > from ? 'O-O' : 'O-O-O';
        else {
          const cap = b[to] || fl === 2;
          if (p === 1) s = (cap ? FILES[from & 7] + 'x' : '') + sqName(to) + (pr ? '=' + ' PNBRQ'[pr] : '');
          else {
            let amb = false, sameF = false, sameR = false;
            for (const o of ms) {
              const f2 = o & 127;
              if (f2 !== from && (o >> 7 & 127) === to && Math.abs(b[f2]) === p) { amb = true; if ((f2 & 7) === (from & 7)) sameF = true; if (f2 >> 4 === from >> 4) sameR = true; }
            }
            s = ' PNBRQK'[p] + (amb ? (!sameF ? FILES[from & 7] : !sameR ? String((from >> 4) + 1) : sqName(from)) : '') + (cap ? 'x' : '') + sqName(to);
          }
        }
        make(m);
        if (inCheck()) s += legal().length ? '+' : '#';
        unmake();
        return s;
      }
      function order(ms, ss, ply, ttm) {
        ss.length = ms.length;
        for (let i = 0; i < ms.length; i++) {
          const m = ms[i], from = m & 127, to = m >> 7 & 127, cap = b[to];
          ss[i] = m === ttm ? 4e6 : cap ? 1e6 + CV[cap < 0 ? -cap : cap] * 10 - (b[from] < 0 ? -b[from] : b[from])
            : m >> 14 & 7 ? 9e5 + (m >> 14 & 7) : m >> 17 === 2 ? 1e6 + 999
              : m === killers[ply * 2] ? 8e5 : m === killers[ply * 2 + 1] ? 7e5 : histT[from * 128 + to];
        }
      }
      function pick(ms, ss, i) {
        let bi = i, bv = ss[i];
        for (let j = i + 1; j < ms.length; j++) if (ss[j] > bv) { bv = ss[j]; bi = j; }
        if (bi !== i) { const tm = ms[i]; ms[i] = ms[bi]; ms[bi] = tm; const ts = ss[i]; ss[i] = ss[bi]; ss[bi] = ts; }
        return ms[i];
      }
      const tick = () => { if ((++T.nodes & 1023) === 0 && (now() - T.t0 > T.tl || T.nodes > T.max)) T.stop = true; return T.stop; };
      function rep() {
        for (let i = sp - 4; i >= 0 && i >= sp - half; i -= 2) if (uHA[i] === hA && uHB[i] === hB) return true;
        return false;
      }
      const hasPieces = s => { for (let sq = 0; sq < 120; sq++) { if (sq & 0x88) { sq += 7; continue; } const p = b[sq] * s; if (p > 1 && p < 6) return true; } return false; };
      function qs(alpha, beta, ply) {
        if (tick()) return 0;
        const sp0 = evaluate();
        if (sp0 >= beta || ply > 120) return sp0;
        if (sp0 > alpha) alpha = sp0;
        const ms = MB[ply], ss = SB[ply];
        ms.length = 0; gen(ms, true); order(ms, ss, ply, 0);
        for (let i = 0; i < ms.length; i++) {
          const m = pick(ms, ss, i), cp = b[m >> 7 & 127];
          if (cp && sp0 + CV[cp < 0 ? -cp : cp] + 200 < alpha && !(m >> 14 & 7)) continue;
          make(m);
          if (illegal()) { unmake(); continue; }
          const v = -qs(-beta, -alpha, ply + 1);
          unmake();
          if (T.stop) return 0;
          if (v >= beta) return v;
          if (v > alpha) alpha = v;
        }
        return alpha;
      }
      function ab(d, alpha, beta, ply, nullOk) {
        if (tick()) return 0;
        if (ply && (half >= 100 || rep())) return 0;
        const chk = inCheck();
        if (chk && ply < 2 * T.rootD + 6) d++;
        if (d <= 0 || ply > 120) return qs(alpha, beta, ply);
        const ti = hA & TMASK;
        let ttm = 0;
        if (TK[ti] === hB) {
          ttm = TMv[ti];
          if (ply && TD[ti] >= d) {
            let v = TV[ti];
            if (v > WIN / 2) v -= ply; else if (v < -WIN / 2) v += ply;
            const f = TF[ti];
            if (f === 0 || (f === 1 && v >= beta) || (f === 2 && v <= alpha)) return v;
          }
        }
        const pv = beta - alpha > 1;
        if (!pv && !chk && nullOk && d >= 3 && Math.abs(beta) < WIN / 2 && hasPieces(side)) {
          const st = evaluate();
          if (st >= beta) {
            makeNull();
            const v = -ab(d - 1 - (d > 6 ? 3 : 2), -beta, -beta + 1, ply + 1, false);
            unmakeNull();
            if (T.stop) return 0;
            if (v >= beta) return beta;
          }
        }
        const ms = MB[ply], ss = SB[ply];
        ms.length = 0; gen(ms, false); order(ms, ss, ply, ttm);
        let n = 0, best = -INF, bm = 0;
        const a0 = alpha;
        for (let i = 0; i < ms.length; i++) {
          const m = pick(ms, ss, i);
          make(m);
          if (illegal()) { unmake(); continue; }
          n++;
          const quiet = !uC[sp - 1] && !(m >> 14 & 7), gc = inCheck();
          let v;
          if (n === 1) v = -ab(d - 1, -beta, -alpha, ply + 1, true);
          else {
            const r = d >= 3 && n > 3 && quiet && !chk && !gc ? (n > 9 ? 2 : 1) : 0;
            v = -ab(d - 1 - r, -alpha - 1, -alpha, ply + 1, true);
            if (v > alpha && r) v = -ab(d - 1, -alpha - 1, -alpha, ply + 1, true);
            if (v > alpha && v < beta) v = -ab(d - 1, -beta, -alpha, ply + 1, true);
          }
          unmake();
          if (T.stop) return 0;
          if (v > best) {
            best = v; bm = m;
            if (v > alpha) {
              alpha = v;
              if (v >= beta) {
                if (quiet) {
                  if (killers[ply * 2] !== m) { killers[ply * 2 + 1] = killers[ply * 2]; killers[ply * 2] = m; }
                  const hi = (m & 127) * 128 + (m >> 7 & 127);
                  histT[hi] = Math.min(6e5, histT[hi] + d * d);
                }
                break;
              }
            }
          }
        }
        if (!n) return chk ? -WIN + ply : 0;
        if (TK[ti] !== hB || TD[ti] <= d) {
          TK[ti] = hB; TD[ti] = d; TMv[ti] = bm;
          TV[ti] = best > WIN / 2 ? best + ply : best < -WIN / 2 ? best - ply : best;
          TF[ti] = best >= beta ? 1 : best > a0 ? 0 : 2;
        }
        return best;
      }
      function bookMove(ms) {
        const opts = [];
        for (const line of BOOK) {
          if (line.length <= game.length) continue;
          let ok = true;
          for (let i = 0; i < game.length && ok; i++) if (line[i] !== game[i]) ok = false;
          if (ok) opts.push(line[game.length]);
        }
        while (opts.length) {
          const i = Math.random() * opts.length | 0, u = opts[i], f = uciSq(u.slice(0, 2)), t = uciSq(u.slice(2, 4));
          const m = ms.find(x => (x & 127) === f && (x >> 7 & 127) === t && !(x >> 14 & 7));
          if (m) return m;
          opts.splice(i, 1);
        }
        return 0;
      }
      function think(o) {
        killers.fill(0);
        for (let i = 0; i < histT.length; i++) histT[i] >>= 2;
        const ms = legal();
        if (!ms.length) return null;
        if (o.book) { const bm = bookMove(ms); if (bm) { T.depth = 0; T.book = true; return bm; } }
        T.book = false;
        if (ms.length === 1) return ms[0];
        if (o.blunder && Math.random() < o.blunder) return ms[Math.random() * ms.length | 0];
        T.t0 = now(); T.stop = false; T.nodes = 0; T.depth = 0; T.tl = o.time; T.max = o.nodes || 4e7;
        const ss = [], ti = hA & TMASK;
        order(ms, ss, 0, TK[ti] === hB ? TMv[ti] : 0);
        const idx = ms.map((_, i) => i).sort((a, c) => ss[c] - ss[a]), root = idx.map(i => ms[i]), rs = root.map(() => -INF);
        let best = root[0];
        for (let d = 1; d <= o.depth; d++) {
          let alpha = -INF, cur = 0, curV = -INF, done = 0;
          T.rootD = d;
          for (let i = 0; i < root.length; i++) {
            make(root[i]);
            let v;
            if (o.noise) v = -ab(d - 1, -INF, INF, 1, true);
            else if (i === 0) v = -ab(d - 1, -INF, -alpha, 1, true);
            else { v = -ab(d - 1, -alpha - 1, -alpha, 1, true); if (v > alpha && !T.stop) v = -ab(d - 1, -INF, -alpha, 1, true); }
            unmake();
            if (T.stop) break;
            done++;
            if (o.noise) v += (Math.random() - .5) * 2 * o.noise;
            rs[i] = v;
            if (v > curV) { curV = v; cur = root[i]; if (v > alpha) alpha = v; }
          }
          if (T.stop) { if (cur && !o.noise && done && cur !== root[0] && curV > rs[0] - 1e6) best = cur; break; }
          best = cur; T.depth = d; T.score = curV;
          const bi = root.indexOf(cur);
          if (bi > 0) { root.splice(bi, 1); root.unshift(cur); const v = rs.splice(bi, 1)[0]; rs.unshift(v); }
          if (Math.abs(curV) > WIN / 2 && !o.noise) break;
          if (now() - T.t0 > T.tl * .55) break;
        }
        return best;
      }
      function push(m) { game.push(sqName(m & 127) + sqName(m >> 7 & 127) + (m >> 14 & 7 ? 'qrbn'[5 - (m >> 14 & 7)] : '')); make(m); }
      function pop() { game.pop(); unmake(); }
      load(START);
      return { load, perft, legal, make: push, unmake: pop, inCheck, key, san, insufficient, think, evaluate, T, at: sq => b[sq], king: s => s === 1 ? kw : kb, get side() { return side; }, get half() { return half; } };
    }
    return { chessEngine, START, FILES, sqName };
  }
  const { chessEngine, START, FILES, sqName } = chessCore();

  const CK_DR = [-1, -1, 1, 1], CK_DC = [-1, 1, -1, 1];
  const ckNum = sq => (sq >> 3) * 4 + ((sq & 7) >> 1) + 1;
  function checkersEngine() {
    const b = new Int8Array(64), stack = [], T = {};
    let side = 1, quiet = 0;
    function reset() {
      b.fill(0); stack.length = 0; side = 1; quiet = 0;
      for (let i = 0; i < 64; i++) if (((i >> 3) + (i & 7)) & 1) { if (i >> 3 < 3) b[i] = -1; else if (i >> 3 > 4) b[i] = 1; }
    }
    function jumps(i, p, path, capd, out) {
      const r = i >> 3, c = i & 7, king = p === 2 || p === -2, fwd = p > 0 ? -1 : 1;
      let any = false;
      for (let k = 0; k < 4; k++) {
        const dr = CK_DR[k], dc = CK_DC[k];
        if (!king && dr !== fwd) continue;
        const r2 = r + 2 * dr, c2 = c + 2 * dc;
        if (r2 < 0 || r2 > 7 || c2 < 0 || c2 > 7) continue;
        const m = i + dr * 8 + dc, to = r2 * 8 + c2;
        if (b[m] * p >= 0 || b[to] || capd.includes(m)) continue;
        any = true;
        path.push(to); capd.push(m);
        if (!king && (r2 === 0 || r2 === 7)) out.push({ path: path.slice(), caps: capd.slice() });
        else jumps(to, p, path, capd, out);
        path.pop(); capd.pop();
      }
      if (!any && capd.length) out.push({ path: path.slice(), caps: capd.slice() });
    }
    function moves() {
      const caps = [], quiets = [];
      for (let i = 0; i < 64; i++) {
        const p = b[i];
        if (p * side <= 0) continue;
        b[i] = 0; jumps(i, p, [i], [], caps); b[i] = p;
        if (caps.length) continue;
        const r = i >> 3, c = i & 7, king = p === 2 || p === -2, fwd = p > 0 ? -1 : 1;
        for (let k = 0; k < 4; k++) {
          if (!king && CK_DR[k] !== fwd) continue;
          const r2 = r + CK_DR[k], c2 = c + CK_DC[k];
          if (r2 < 0 || r2 > 7 || c2 < 0 || c2 > 7 || b[r2 * 8 + c2]) continue;
          quiets.push({ path: [i, r2 * 8 + c2], caps: [] });
        }
      }
      return caps.length ? caps : quiets;
    }
    function make(mv) {
      const from = mv.path[0], to = mv.path[mv.path.length - 1], p = b[from];
      stack.push(mv, p, mv.caps.map(s => b[s]), quiet);
      b[from] = 0;
      for (const s of mv.caps) b[s] = 0;
      b[to] = p === 1 && to >> 3 === 0 ? 2 : p === -1 && to >> 3 === 7 ? -2 : p;
      quiet = mv.caps.length || p === 1 || p === -1 ? 0 : quiet + 1;
      side = -side;
    }
    function unmake() {
      const q = stack.pop(), cv = stack.pop(), p = stack.pop(), mv = stack.pop();
      b[mv.path[mv.path.length - 1]] = 0; b[mv.path[0]] = p;
      mv.caps.forEach((s, k) => { b[s] = cv[k]; });
      quiet = q; side = -side;
    }
    const ADV = [0, 2, 4, 6, 9, 13, 18, 0];
    function evaluate() {
      let s = 0, red = 0, wht = 0, mr = 0, mw = 0;
      for (let i = 0; i < 64; i++) {
        const p = b[i];
        if (!p) continue;
        const r = i >> 3, c = i & 7, cen = (c > 1 && c < 6 && r > 1 && r < 6) ? 4 : 0;
        if (p === 1) { red++; mr += 100; s += 100 + ADV[7 - r] + (r === 7 ? 8 : 0) + cen; }
        else if (p === -1) { wht++; mw += 100; s -= 100 + ADV[r] + (r === 0 ? 8 : 0) + cen; }
        else {
          const v = 160 + 10 - (Math.abs(r - 3.5) + Math.abs(c - 3.5)) * 2;
          if (p > 0) { red++; mr += 160; s += v; } else { wht++; mw += 160; s -= v; }
        }
      }
      const diff = mr - mw;
      if (diff) {
        s += diff * (24 - red - wht) / 40;
        if (red + wht <= 10) {
          const w = diff > 0 ? 1 : -1;
          for (let i = 0; i < 64; i++) {
            if (b[i] !== 2 * w) continue;
            let md = 14;
            for (let j = 0; j < 64; j++) if (b[j] * w < 0) md = Math.min(md, Math.max(Math.abs((i >> 3) - (j >> 3)), Math.abs((i & 7) - (j & 7))));
            s -= w * md * 3;
          }
        }
      }
      return s * side;
    }
    function ab(d, alpha, beta, ply) {
      if ((++T.nodes & 511) === 0 && (now() - T.t0 > T.tl || T.nodes > T.max)) T.stop = true;
      if (T.stop) return 0;
      const ms = moves();
      if (!ms.length) return -WIN + ply;
      if (quiet >= 80) return 0;
      const capt = ms[0].caps.length > 0;
      if ((d <= 0 && !capt) || ply > 48) return evaluate();
      if (capt && ms.length > 1) ms.sort((a, c) => c.caps.length - a.caps.length);
      let best = -INF;
      for (const m of ms) {
        make(m);
        const v = -ab(d - 1, -beta, -alpha, ply + 1);
        unmake();
        if (T.stop) return 0;
        if (v > best) { best = v; if (v > alpha) { alpha = v; if (v >= beta) break; } }
      }
      return best;
    }
    const think = o => deepen(T, moves(), o, make, unmake, ab);
    const snap = () => ({ b: b.slice(), side, quiet });
    const restore = s => { b.set(s.b); side = s.side; quiet = s.quiet; stack.length = 0; };
    reset();
    return { reset, moves, make, unmake, think, snap, restore, evaluate, T, at: i => b[i], set: (i, v) => { b[i] = v; }, get side() { return side; }, set side(v) { side = v; }, get quiet() { return quiet; } };
  }

  const RV_DR = [-1, -1, -1, 0, 0, 1, 1, 1], RV_DC = [-1, 0, 1, -1, 1, -1, 0, 1];
  const RW = [100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, -1, -1, -1, -1, -2, 10, 5, -2, -1, -1, -1, -1, -2, 5, 5, -2, -1, -1, -1, -1, -2, 5, 10, -2, -1, -1, -1, -1, -2, 10, -20, -50, -2, -2, -2, -2, -50, -20, 100, -20, 10, 5, 5, 10, -20, 100];
  const CORN = [[0, 9, 1, 8], [7, 14, 6, 15], [56, 49, 57, 48], [63, 54, 62, 55]];
  const rvName = i => FILES[i & 7] + ((i >> 3) + 1);
  function reversiEngine() {
    const b = new Int8Array(64), stack = [], T = {};
    let side = 1;
    function reset() { b.fill(0); b[27] = b[36] = -1; b[28] = b[35] = 1; side = 1; stack.length = 0; }
    function flips(i, s, out) {
      if (b[i]) return 0;
      const r = i >> 3, c = i & 7;
      let n = 0;
      for (let k = 0; k < 8; k++) {
        const dr = RV_DR[k], dc = RV_DC[k];
        let rr = r + dr, cc = c + dc, cnt = 0;
        while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === -s) { rr += dr; cc += dc; cnt++; }
        if (cnt && rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === s) {
          n += cnt;
          if (out) for (let j = 1; j <= cnt; j++) out.push((r + dr * j) * 8 + c + dc * j);
        }
      }
      return n;
    }
    function moves(s = side) { const out = []; for (let i = 0; i < 64; i++) if (!b[i] && flips(i, s, null)) out.push(i); return out; }
    function make(i) {
      if (i < 0) { stack.push(-1, null); side = -side; return null; }
      const fl = [];
      flips(i, side, fl);
      b[i] = side;
      for (const f of fl) b[f] = side;
      stack.push(i, fl);
      side = -side;
      return fl;
    }
    function unmake() {
      const fl = stack.pop(), i = stack.pop();
      side = -side;
      if (i < 0) return;
      b[i] = 0;
      for (const f of fl) b[f] = -side;
    }
    function count(s) { let n = 0; for (let i = 0; i < 64; i++) if (b[i] === s) n++; return n; }
    function evaluate(mm) {
      let s = 0;
      for (let i = 0; i < 64; i++) if (b[i]) s += b[i] * RW[i];
      for (const [c, x, c1, c2] of CORN) if (b[c]) s -= b[x] * RW[x] + b[c1] * RW[c1] + b[c2] * RW[c2];
      const om = moves(-side).length;
      return s * side + (mm - om) * 7;
    }
    function ab(d, alpha, beta, ply) {
      if ((++T.nodes & 511) === 0 && (now() - T.t0 > T.tl || T.nodes > T.max)) T.stop = true;
      if (T.stop) return 0;
      const ms = moves(side);
      if (!ms.length) {
        if (!moves(-side).length) { const df = count(side) - count(-side); return df > 0 ? WIN + df : df < 0 ? -WIN + df : 0; }
        make(-1);
        const v = -ab(d, -beta, -alpha, ply + 1);
        unmake();
        return v;
      }
      if (d <= 0) return evaluate(ms.length);
      ms.sort((a, c) => RW[c] - RW[a]);
      let best = -INF;
      for (const m of ms) {
        make(m);
        const v = -ab(d - 1, -beta, -alpha, ply + 1);
        unmake();
        if (T.stop) return 0;
        if (v > best) { best = v; if (v > alpha) { alpha = v; if (v >= beta) break; } }
      }
      return best;
    }
    const think = o => deepen(T, moves(side).sort((a, c) => RW[c] - RW[a]), o, make, unmake, ab);
    const snap = () => ({ b: b.slice(), side });
    const restore = s => { b.set(s.b); side = s.side; stack.length = 0; };
    reset();
    return { reset, moves, make, unmake, count, think, snap, restore, T, at: i => b[i], get side() { return side; } };
  }

  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function shadowEll(x, cx, cy, rx, ry, a) {
    x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore();
  }
  function grain(x, X, Y, W, H, base, lines, rand, vert) {
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    const L = vert ? H : W, Tk = vert ? W : H, n = Math.round(Tk / 1.5);
    for (let i = 0; i < n; i++) {
      const off = rand() * Tk, amp = .5 + rand() * 2.6, fq = .01 + rand() * .03, ph = rand() * 7;
      x.strokeStyle = lines[rand() * lines.length | 0];
      x.globalAlpha = .05 + rand() * .17; x.lineWidth = .35 + rand() * 1.4;
      x.beginPath();
      for (let a = -6; a <= L + 6; a += 5) {
        const q = off + Math.sin(a * fq + ph) * amp + Math.sin(a * fq * 3.1 + ph * 2) * amp * .35;
        if (vert) { if (a === -6) x.moveTo(X + q, Y + a); else x.lineTo(X + q, Y + a); }
        else if (a === -6) x.moveTo(X + a, Y + q); else x.lineTo(X + a, Y + q);
      }
      x.stroke();
    }
    x.restore();
  }
  const FRAME = ['#4a2b17', ['#2b170a', '#6b4125', '#1f1007', '#7a4b2a']];
  function frameTex(seed, squares, labels) {
    const d = dprOf(), c = cnv(SZ * d, SZ * d), x = c.getContext('2d'), rand = rng(seed);
    x.scale(d, d);
    grain(x, 0, 0, SZ, SZ, FRAME[0], FRAME[1], rand, false);
    let g = x.createLinearGradient(0, 0, SZ, SZ);
    g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
    x.fillStyle = g; x.fillRect(0, 0, SZ, SZ);
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1.5; x.strokeRect(1.5, 1.5, SZ - 3, SZ - 3);
    x.strokeStyle = 'rgba(255,214,150,.28)'; x.lineWidth = 1; x.strokeRect(FR - 5.5, FR - 5.5, 8 * SQ + 11, 8 * SQ + 11);
    squares(x, rand, d);
    x.save(); x.beginPath(); x.rect(FR, FR, 8 * SQ, 8 * SQ); x.clip();
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 10 * d; x.strokeStyle = 'rgba(0,0,0,.85)'; x.lineWidth = 8; x.strokeRect(FR - 4, FR - 4, 8 * SQ + 8, 8 * SQ + 8);
    x.restore();
    g = x.createLinearGradient(FR, FR, FR + 8 * SQ, FR + 8 * SQ);
    g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.42, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.1)');
    x.fillStyle = g; x.fillRect(FR, FR, 8 * SQ, 8 * SQ);
    if (labels) {
      x.font = '800 11px Nunito, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(255,230,190,.78)';
      labels(x);
    }
    return c;
  }
  const woodSquares = (light, dark) => (x, rand) => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const dk = (r + c) & 1, t = dk ? dark : light;
      grain(x, FR + c * SQ, FR + r * SQ, SQ, SQ, t[0], t[1], rand, !!dk);
      x.fillStyle = `rgba(${rand() < .5 ? '255,255,255' : '0,0,0'},${(rand() * .07).toFixed(3)})`;
      x.fillRect(FR + c * SQ, FR + r * SQ, SQ, SQ);
    }
  };

  function crown(x, cx, cy) {
    const p = new Path2D(`M${cx - 15} ${cy + 8}L${cx - 18} ${cy - 8}L${cx - 8} ${cy - 1}L${cx} ${cy - 13}L${cx + 8} ${cy - 1}L${cx + 18} ${cy - 8}L${cx + 15} ${cy + 8}Z`);
    const g = x.createLinearGradient(0, cy - 13, 0, cy + 9);
    g.addColorStop(0, '#fff4b8'); g.addColorStop(.5, '#f6c234'); g.addColorStop(1, '#c27d0b');
    x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#6e4204'; x.stroke(p);
    x.fillStyle = g; x.fill(p);
    x.fillStyle = '#ffe9a0';
    for (const [dx, dy] of [[-18, -8], [0, -13], [18, -8]]) { x.beginPath(); x.arc(cx + dx, cy + dy, 2.6, 0, 7); x.fill(); }
    x.fillStyle = '#c0392b'; x.beginPath(); x.arc(cx, cy + 3, 2.4, 0, 7); x.fill();
  }
  function checkerSprite(red, king, S) {
    const c = cnv(S, S), x = c.getContext('2d');
    const P = red ? { e: '#6e130f', a: '#ff9a86', m: '#de3b33', z: '#981c17' } : { e: '#8f7a55', a: '#ffffff', m: '#f2e8d0', z: '#c4ae84' };
    x.scale(S / 100, S / 100);
    shadowEll(x, 52, king ? 64 : 60, 41, 13, .45);
    const disc = oy => {
      const body = () => { x.beginPath(); x.arc(50, 52 + oy, 37, 0, 7); x.fill(); };
      x.fillStyle = P.e; body();
      let g = x.createLinearGradient(13, 0, 87, 0);
      g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(.33, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
      x.fillStyle = g; body();
      g = x.createRadialGradient(39, 34 + oy, 3, 50, 46 + oy, 40);
      g.addColorStop(0, P.a); g.addColorStop(.45, P.m); g.addColorStop(1, P.z);
      x.fillStyle = g; x.beginPath(); x.arc(50, 46 + oy, 37, 0, 7); x.fill();
      x.lineWidth = 2.2;
      for (const [r, s] of [[30, 'rgba(0,0,0,.22)'], [28, 'rgba(255,255,255,.3)'], [20, 'rgba(0,0,0,.16)'], [18.5, 'rgba(255,255,255,.24)']]) { x.strokeStyle = s; x.beginPath(); x.arc(50, 46 + oy, r, 0, 7); x.stroke(); }
      g = x.createRadialGradient(38, 32 + oy, 1, 38, 32 + oy, 20);
      g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(50, 46 + oy, 37, 0, 7); x.fill();
    };
    if (king) { disc(7); disc(-4); crown(x, 50, 43); } else disc(0);
    return c;
  }
  function discSprite(black, S) {
    const c = cnv(S, S), x = c.getContext('2d');
    x.scale(S / 100, S / 100);
    shadowEll(x, 52, 60, 43, 14, .45);
    x.fillStyle = black ? '#050507' : '#8f8f9b';
    x.beginPath(); x.arc(50, 53, 40, 0, 7); x.fill();
    let g = x.createRadialGradient(37, 33, 3, 50, 48, 44);
    if (black) { g.addColorStop(0, '#6a6a75'); g.addColorStop(.5, '#25252b'); g.addColorStop(1, '#0a0a0c'); }
    else { g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#f1f1f5'); g.addColorStop(1, '#c4c4ce'); }
    x.fillStyle = g; x.beginPath(); x.arc(50, 48, 40, 0, 7); x.fill();
    x.strokeStyle = black ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'; x.lineWidth = 2;
    x.beginPath(); x.arc(50, 48, 33, 0, 7); x.stroke();
    g = x.createRadialGradient(37, 32, 1, 37, 32, 22);
    g.addColorStop(0, `rgba(255,255,255,${black ? .4 : .95})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(50, 48, 40, 0, 7); x.fill();
    return c;
  }
  function feltTex() {
    return frameTex(11, (x, rand, d) => {
      const g = x.createRadialGradient(SZ / 2, SZ / 2, 30, SZ / 2, SZ / 2, SZ * .72);
      g.addColorStop(0, '#2fa364'); g.addColorStop(1, '#176a3d');
      x.fillStyle = g; x.fillRect(FR, FR, 8 * SQ, 8 * SQ);
      const px = Math.round(FR * d), pw = Math.round(8 * SQ * d), id = x.getImageData(px, px, pw, pw), a = id.data;
      for (let i = 0; i < a.length; i += 4) { const n = (rand() - .5) * 26; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
      x.putImageData(id, px, px);
      for (let i = 0; i <= 8; i++) {
        const p = FR + i * SQ;
        x.fillStyle = 'rgba(4,36,18,.6)'; x.fillRect(p - 1, FR, 2, 8 * SQ); x.fillRect(FR, p - 1, 8 * SQ, 2);
        x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(p + 1, FR, 1, 8 * SQ); x.fillRect(FR, p + 1, 8 * SQ, 1);
      }
      x.fillStyle = 'rgba(4,36,18,.75)';
      for (const [cx, cy] of [[2, 2], [6, 2], [2, 6], [6, 6]]) { x.beginPath(); x.arc(FR + cx * SQ, FR + cy * SQ, 4, 0, 7); x.fill(); }
    }, x => { for (let i = 0; i < 8; i++) { x.fillText(FILES[i], FR + i * SQ + SQ / 2, SZ - FR / 2 + 1); x.fillText(String(i + 1), FR / 2, FR + i * SQ + SQ / 2); } });
  }

  const kitCss = p => `
${p}{gap:12px}
${p} .main{display:flex;gap:16px;justify-content:center;align-items:stretch;width:100%}
${p} .main>canvas{flex:none;align-self:flex-start;width:min(560px,calc(100% - 200px),calc(100dvh - 250px));min-width:240px;border-radius:14px;background:#3a2213;box-shadow:0 22px 44px -24px rgba(31,29,43,.7),0 4px 10px -4px rgba(31,29,43,.3);cursor:pointer}
${p} .side{flex:1;max-width:184px;min-width:0;display:flex;flex-direction:column;gap:8px}
${p} .seg{display:flex;padding:3px;border-radius:999px;background:var(--sunk)}
${p} .seg button{flex:1;min-width:0;border:0;background:none;padding:8px 4px;border-radius:999px;font:800 12.5px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 10px -4px rgba(31,29,43,.3)}
${p} .pcs{display:flex;flex-direction:column;gap:8px}
${p} .pc{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;background:var(--sunk);border:2px solid transparent;transition:border-color .25s,background .25s,box-shadow .25s}
${p} .pc.on{background:#fff;border-color:var(--accent);box-shadow:0 8px 18px -12px rgba(108,92,231,.9)}
${p} .chip{width:26px;height:26px;border-radius:50%;flex:none;box-shadow:inset 0 -3px 0 rgba(0,0,0,.22),0 2px 5px rgba(0,0,0,.3)}
${p} .pc div{min-width:0;flex:1}
${p} .pc b{display:block;font-weight:900;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .pc small{display:flex;flex-wrap:wrap;align-items:center;min-height:17px;font-size:12px;font-weight:800;color:var(--muted);line-height:1.35}
${p} .pc small img{width:17px;height:17px;margin-right:-4px}
${p} .pc small em{font-style:normal;margin-left:7px;color:var(--good)}
${p} .dots{display:none;gap:3px}
${p} .pc.think .dots{display:flex}
${p} .dots i{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:${p.slice(1)}-dot 1s infinite ease-in-out}
${p} .dots i:nth-child(2){animation-delay:.15s}
${p} .dots i:nth-child(3){animation-delay:.3s}
@keyframes ${p.slice(1)}-dot{0%,80%,100%{transform:scale(.5);opacity:.35}40%{transform:none;opacity:1}}
${p} .st{min-height:20px;text-align:center;font-weight:900;font-size:13.5px;line-height:1.35;color:var(--ink-2)}
${p} .st.win{color:var(--good)}
${p} .st.loss{color:var(--bad)}
${p} .st.warn{color:#e2711d}
${p} .hist{flex:1 1 0px;min-height:70px;overflow:auto;padding:8px 10px;border-radius:14px;background:var(--sunk);font:700 12.5px/1.7 var(--mono);color:var(--ink-2);scrollbar-width:thin}
${p} .hist p{margin:0;display:flex;gap:6px}
${p} .hist em{font-style:normal;color:var(--soft);min-width:26px}
${p} .hist span{flex:1;min-width:0;white-space:nowrap}
${p} .hist .cur{color:var(--accent)}
${p} .hist .none{color:var(--soft);font-family:var(--sans)}
${p} .btns{display:flex;gap:6px}
${p} .btns .g-btn{flex:1;min-width:0;padding:0 8px}
${p} [hidden]{display:none!important}
${p} .seg button.tb{display:none}
${p}.touch .seg button.tb{display:block}
${p} .elo{display:flex;flex-direction:column;gap:4px;padding:8px 10px 6px;border-radius:14px;background:var(--sunk)}
${p} .elo-h{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:11.5px;font-weight:800;color:var(--muted)}
${p} .elo-h b{font-size:12.5px;font-weight:900;color:var(--ink);white-space:nowrap}
${p} .elo input{width:100%;accent-color:var(--accent);margin:2px 0;cursor:pointer}
${p} .elo-s{display:flex;justify-content:space-between;font-size:9.5px;font-weight:800;color:var(--soft)}
${p} .elo-s i{font-style:normal}
${p} .cn{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:800;color:var(--muted)}
${p} .cn i{width:8px;height:8px;border-radius:50%;background:var(--bad)}
${p} .cn.on i{background:var(--good);box-shadow:0 0 0 3px rgba(34,176,125,.2)}
${p} .st.turn{align-self:center;padding:4px 14px;border-radius:999px;background:var(--accent);color:#fff;box-shadow:0 6px 14px -8px rgba(108,92,231,.9)}
${p} .p2bar{display:none}
${p}.tbl .p2bar{display:flex;align-items:center;gap:8px;padding:5px 16px 5px 6px;border-radius:999px;background:var(--sunk);font-weight:900;font-size:14px;color:var(--ink-2);transform:rotate(180deg)}
${p}.tbl .p2bar.on{background:var(--accent);color:#fff;box-shadow:0 6px 14px -8px rgba(108,92,231,.9)}
${p}.tbl .p2bar .chip{width:22px;height:22px}
${p}.tbl .pc.ai{transform:rotate(180deg)}
@media (max-width:760px){
  ${p} .main{flex-direction:column;align-items:center;gap:12px}
  ${p} .main>canvas{width:min(100%,560px);min-width:0}
  ${p} .side{max-width:none;width:100%;flex-flow:row wrap}
  ${p} .side>*{flex:1 1 100%;min-width:0}
  ${p} .side>.seg[data-k="diff"],${p} .side>.seg[data-k="side"]{flex-basis:40%}
  ${p} .side>.st{flex:1 1 0;align-self:center}
  ${p} .side>.st.turn{flex:0 1 auto;margin:0 auto}
  ${p} .pcs{flex-direction:row}
  ${p} .pcs .pc{flex:1;min-width:0}
  ${p} .hist{flex:none;min-height:0;max-height:60px}
}
@media (pointer:coarse){${p} .side{gap:6px}${p} .seg{padding:1px}${p} .seg button{min-height:40px}${p} .btns .g-btn{height:40px}}`;

  const MODE_TXT = { CPU: 'vs CPU', '2P': '2 Players', Online: 'Online' };
  function kit(root, api, o) {
    const saved = api.load() || {}, S = o.sides;
    if (matchMedia('(pointer: coarse)').matches) root.classList.add('touch');
    const touch = () => root.classList.contains('touch');
    const segs = [{ key: 'mode', opts: ['CPU', 'Online'], txt: MODE_TXT }, ...(o.elo ? [] : [{ key: 'diff', opts: DIFFS, only: 'CPU' }]), ...(o.segs || [])], opt = {};
    for (const s of segs) opt[s.key] = s.opts.includes(saved[s.key]) ? saved[s.key] : s.key === 'diff' ? 'Normal' : s.opts[0];
    opt.view = 'Fixed';
    if (o.elo) opt.elo = Number.isFinite(saved.elo) ? Math.max(400, Math.min(2400, Math.round(saved.elo / 50) * 50)) : 1200;
    const main = el('div', 'main'), p2 = el('div', 'p2bar', '<i class="chip"></i><b></b>');
    root.append(p2, main);
    const cv = api.canvas(SZ, SZ, main), cvs = cv.canvas;
    cvs.style.width = '';
    const side = el('div', 'side', segs.map(s => `<div class="seg" data-k="${s.key}"${s.only ? ` data-only="${s.only}"` : ''} role="radiogroup">${s.opts.map(v => `<button role="radio" data-v="${v}"${v === 'Table' ? ' class="tb"' : ''}>${(s.txt && s.txt[v]) || v}</button>`).join('')}</div>`).join('')
      + '<div class="cn" hidden><i></i><span></span></div>'
      + `<div class="pcs">${['ai', 'you'].map(w => `<div class="pc ${w}"><i class="chip"></i><div><b></b><small></small></div><span class="dots"><i></i><i></i><i></i></span></div>`).join('')}</div>`
      + '<div class="st" role="status"></div><div class="hist"></div><div class="btns"><button class="g-btn ghost sm"></button><button class="g-btn sm"></button></div>');
    main.append(side);
    if (o.elo) {
      const ew = el('div', 'elo', `<div class="elo-h"><span>AI strength</span><b></b></div><input type="range" min="400" max="2400" step="50" aria-label="AI strength in Elo"><div class="elo-s"><i>400</i><i>Beginner</i><i>Club</i><i>Master</i><i>2400</i></div>`);
      ew.dataset.only = 'CPU';
      side.children[0].after(ew);
      const rg = ew.querySelector('input'), lb = ew.querySelector('b');
      const show = () => { lb.textContent = opt.elo + ' Elo · ' + o.elo(opt.elo); };
      rg.value = opt.elo; show();
      rg.addEventListener('input', () => { opt.elo = +rg.value; show(); paint(); });
      rg.addEventListener('change', () => { api.save({ ...opt }); api.sfx('tick'); });
      rg.addEventListener('keydown', e => e.stopPropagation());
    }
    const q = s => side.querySelector(s), pc = { ai: q('.pc.ai'), you: q('.pc.you') }, stEl = q('.st'), histEl = q('.hist'), cn = q('.cn'), [b1, b2] = q('.btns').children;
    const N = { role: null, live: false, round: 0, mine: false, theirs: false, myRe: false, theirRe: false, sure: false, hooked: false };
    let streak = 0, over = false, gen = 0, dirtyF = true, cursor = null, ovUp = false, drag = null, me = 1, toMove = 1, canUndo = false, cur = '';
    const online = () => opt.mode === 'Online';
    const label = s => opt.mode === '2P' ? S[s][0] : s === me ? 'You' : online() ? 'Friend' : 'AI';
    const card = s => s === me ? pc.you : pc.ai;
    const tbl = () => opt.mode === '2P' && opt.view === 'Table' && touch();
    const send = m => api.net.send(m);
    const status = (t, cls) => { stEl.textContent = t; stEl.className = 'st' + (cls ? ' ' + cls : ''); };
    const turn = (s, think) => { pc.you.classList.toggle('on', s === me); pc.ai.classList.toggle('on', s === -me); pc.ai.classList.toggle('think', !!think); };
    const conn = () => { const on = !!N.role && api.net.connected; cn.classList.toggle('on', on); cn.lastChild.textContent = on ? 'Connected' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : N.role ? 'Connection lost' : 'Not connected'; };
    const paint = () => {
      side.querySelectorAll('.elo').forEach(sg => { sg.hidden = sg.dataset.only !== opt.mode; });
      side.querySelectorAll('.seg').forEach(sg => {
        sg.hidden = !!sg.dataset.only && sg.dataset.only !== opt.mode;
        sg.querySelectorAll('button').forEach(bt => { const on = opt[sg.dataset.k] === bt.dataset.v; bt.classList.toggle('on', on); bt.setAttribute('aria-checked', String(on)); });
      });
      pc.you.querySelector('b').textContent = label(me);
      pc.ai.querySelector('b').textContent = opt.mode === 'CPU' ? 'AI · ' + (o.elo ? opt.elo : opt.diff) : label(-me);
      pc.you.firstChild.style.background = S[me][1]; pc.ai.firstChild.style.background = S[-me][1]; p2.firstChild.style.background = S[-1][1];
      cn.hidden = !online();
      if (online()) conn();
      root.classList.toggle('tbl', tbl());
    };
    function btns() {
      let a, b;
      if (!online()) { a = ['Undo', 'undo', !canUndo || over]; b = ['New game', 'new']; }
      else if (!N.live) { a = ['vs CPU', 'leave']; b = ['New room', 'room']; }
      else if (over) { a = ['Leave', 'leave']; b = [N.myRe ? 'Waiting…' : 'Rematch', 're', N.myRe]; }
      else if (N.theirs) { a = ['Decline', 'dec']; b = ['Accept draw', 'acc']; }
      else { a = N.role === 'host' && !o.ply() ? ['Swap sides', 'swap'] : [N.mine ? 'Draw offered' : 'Offer draw', 'offer', N.mine]; b = [N.sure ? 'Tap to confirm' : 'Resign', 'resign']; }
      [[b1, a], [b2, b]].forEach(([bt, [t, act, dis]]) => { bt.textContent = t; bt.dataset.b = act; bt.disabled = !!dis; });
    }
    function turnTo(s, note) {
      toMove = s;
      if (opt.mode === 'CPU' && s !== me) { o.ai(); btns(); return; }
      turn(s);
      const nt = note ? ' · ' + note : '';
      if (opt.mode === 'CPU') status('Your move' + nt, note ? 'warn' : '');
      else if (online()) status(!N.live ? 'Not connected' : s === me ? 'Your move' + nt : 'Waiting for your friend…', N.live && s === me ? 'turn' : '');
      else {
        const t = tbl();
        if (t && s === -1) status(S[-1][0] + ' to move'); else status((t ? 'Your move' : S[s][0] + ' to move') + nt, 'turn');
        p2.lastChild.textContent = s === -1 ? 'Your move' + nt : S[1][0] + ' to move';
        p2.classList.toggle('on', s === -1);
        if (o.flip) { if (opt.view !== 'Flip') o.flip(false); else api.timeout(() => { if (opt.mode === '2P' && opt.view === 'Flip') o.flip(toMove === -1); }, 450); }
      }
      btns();
    }
    function end(w, why, stats) {
      if (over) return;
      over = true; gen++; drag = null; N.mine = N.theirs = N.sure = false;
      const md = opt.mode, res = !w ? 'draw' : md === '2P' ? 'two' : w === me ? 'win' : 'loss', who = w ? (res === 'two' ? S[w][0] : label(w)) : '';
      let best = false;
      if (md === 'CPU') { if (res === 'win') { streak++; best = api.submit(streak); } else if (res === 'loss') streak = 0; api.score(streak); }
      turn(null); p2.classList.remove('on');
      status((res === 'win' ? 'You win' : res === 'draw' ? 'Draw' : who + ' wins') + ' · ' + why, res === 'win' ? 'win' : res === 'loss' ? 'loss' : '');
      p2.lastChild.textContent = res === 'draw' ? 'Draw' : who + ' wins';
      btns();
      api.timeout(() => api.sfx(res === 'loss' ? 'lose' : res === 'draw' ? 'pop' : 'win'), 200);
      const g = gen;
      api.timeout(() => {
        if (g !== gen) return;
        ovUp = true;
        api.overlay({
          kicker: best ? 'New best!' : res === 'win' ? 'Victory' : res === 'loss' ? 'Defeat' : res === 'two' ? '2 Players' : 'Draw',
          title: res === 'win' ? 'You win!' : res === 'loss' ? (md === 'CPU' ? 'AI wins' : 'Your friend wins') : res === 'two' ? who + ' wins!' : 'Draw game',
          text: why + '.' + (md !== 'CPU' ? '' : res === 'win' ? ` Win streak: ${winsFmt(streak)}.` : res === 'loss' ? ' Your win streak resets.' : ' Your win streak is safe.'),
          stats: md === 'CPU' ? [...stats, ['Streak', streak]] : stats,
          button: md === 'Online' ? 'Rematch' : 'Play again', onAction: () => { ovUp = false; if (online()) rematch(); else newGame(); },
          secondary: 'View board', onSecondary: () => { ovUp = false; }
        });
      }, 1300);
    }
    function newGame(m) {
      if (cur === 'CPU' && !over && o.started()) { if (streak) api.toast('Resigned · streak reset'); streak = 0; }
      cur = opt.mode; over = false; gen++; drag = null; ovUp = false;
      api.hideOverlay();
      me = m != null ? m : opt.mode === 'CPU' && o.cpuSide ? o.cpuSide() : 1;
      N.mine = N.theirs = N.myRe = N.theirRe = N.sure = false;
      api.score(opt.mode === 'CPU' ? streak : '—');
      paint();
      if (o.flip) o.flip(opt.mode !== '2P' && me === -1);
      o.newGame(me);
      dirtyF = true;
    }
    function setMode(m) {
      const prev = opt.mode;
      if (prev === 'Online') { N.role = null; N.live = false; api.net.close(); }
      opt.mode = m; api.save({ ...opt });
      if (m === 'Online') goOnline(prev); else newGame();
    }
    async function goOnline(prev) {
      if (!N.hooked) hookNet();
      N.role = null; N.live = false; N.round = 0;
      newGame(1);
      const role = await api.net.lobby({ title: 'Play ' + o.title + ' online' });
      if (!api.alive || !online()) return;
      if (!role) return setMode(prev && prev !== 'Online' ? prev : 'CPU');
      N.role = role; paint();
      status(role === 'host' ? 'Your friend joined · starting…' : 'Connected · waiting for the host…');
      if (role === 'guest') send({ t: 'hi' });
    }
    function hookNet() {
      N.hooked = true;
      api.net.on('data', onData);
      api.net.on('close', () => {
        if (!online() || !N.role) return;
        N.role = null; N.live = false; over = true; gen++; drag = null; ovUp = true;
        turn(null); status('Your friend left', 'loss'); btns(); paint(); api.sfx('lose');
        api.overlay({ kicker: 'Online', title: 'Your friend left', text: 'The connection to your friend was lost.', button: 'New room', onAction: () => { ovUp = false; goOnline('CPU'); }, secondary: 'Play vs CPU', onSecondary: () => { ovUp = false; setMode('CPU'); } });
      });
      api.interval(() => { if (online()) conn(); }, 1000);
    }
    const sync = () => ({ t: 'sync', r: N.round, me: -me, ms: o.list() });
    function startRound() {
      N.round++; N.live = true;
      const hs = N.round % 2 ? 1 : -1;
      send({ t: 'new', r: N.round, me: -hs });
      newGame(hs);
    }
    function rematch() {
      if (!online() || !N.live || !over || N.myRe) return;
      N.myRe = true; send({ t: 're' });
      if (N.role === 'host' && N.theirRe) return startRound();
      status(N.theirRe ? 'Starting…' : 'Waiting for your friend…'); btns();
    }
    function onData(d) {
      if (!online() || !N.role || !d) return;
      const host = N.role === 'host';
      if (d.t === 'hi') { if (host) { if (N.live) send(sync()); else startRound(); } }
      else if (d.t === 'new' || d.t === 'sync') { if (!host) { N.round = d.r; N.live = true; newGame(d.me); if (d.ms) o.load(d.ms); } }
      else if (d.t === 'sync?') { if (host) send(sync()); }
      else if (d.t === 'mv') { if (d.r === N.round && N.live && !over && !o.remote(d.n, d.m)) send(host ? sync() : { t: 'sync?' }); }
      else if (d.t === 'resign') { if (N.live) end(me, 'Your friend resigned'); }
      else if (d.t === 'draw?') { if (N.live && !over) { N.theirs = true; status('Your friend offers a draw', 'warn'); api.sfx('pop'); btns(); } }
      else if (d.t === 'draw-') { if (N.mine && !over) { N.mine = false; api.toast('Draw declined'); btns(); } }
      else if (d.t === 'draw!') { if (host && N.mine && !over) { send({ t: 'end', w: 0, why: 'Draw agreed' }); end(0, 'Draw agreed'); } }
      else if (d.t === 'end') { if (!host) end(d.w, d.why); }
      else if (d.t === 're') { if (N.live) N.theirRe = true; if (N.live && over) { if (host && N.myRe) startRound(); else { status(N.myRe ? 'Starting…' : 'Your friend wants a rematch', 'turn'); api.sfx('pop'); btns(); } } }
    }
    const undo = () => { if (!online() && canUndo && !over && !ovUp) o.undo(); };
    function act(a) {
      if (a === 'undo') undo();
      else if (a === 'new') newGame();
      else if (a === 'room') goOnline('CPU');
      else if (a === 'leave') setMode('CPU');
      else if (a === 're') rematch();
      else if (!N.live || over) return;
      else if (a === 'swap') { if (N.role === 'host' && !o.ply()) startRound(); }
      else if (a === 'offer') { N.mine = true; send({ t: 'draw?' }); api.toast('Draw offered'); btns(); }
      else if (a === 'dec') { N.theirs = false; send({ t: 'draw-' }); turnTo(toMove); }
      else if (a === 'acc') { N.theirs = false; if (N.role === 'host') { send({ t: 'end', w: 0, why: 'Draw agreed' }); end(0, 'Draw agreed'); } else { send({ t: 'draw!' }); status('Draw accepted…'); btns(); } }
      else if (a === 'resign') {
        if (!N.sure) { N.sure = true; btns(); const g = gen; api.timeout(() => { if (g === gen && N.sure) { N.sure = false; btns(); } }, 2500); return; }
        send({ t: 'resign' }); end(-me, 'You resigned');
      }
    }
    root.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !touch()) { root.classList.add('touch'); paint(); } }, true);
    side.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    side.addEventListener('click', e => {
      const bt = e.target.closest('button');
      if (!bt) return;
      if (bt.dataset.b) return act(bt.dataset.b);
      const key = bt.parentNode.dataset.k;
      if (!key || opt[key] === bt.dataset.v) return;
      api.sfx('tick');
      if (key === 'mode') return setMode(bt.dataset.v);
      opt[key] = bt.dataset.v;
      api.save({ ...opt }); paint();
      if (o.keep && o.keep.includes(key)) { if (o.onOpt) o.onOpt(key); }
      else if (key !== 'diff') newGame();
    });
    const cellAt = (x, y) => { const c = Math.floor((x - FR) / SQ), r = Math.floor((y - FR) / SQ); return c >= 0 && c < 8 && r >= 0 && r < 8 ? { c, r } : null; };
    cvs.addEventListener('pointerdown', e => {
      if (e.button > 0 || ovUp || !e.isPrimary) return;
      e.preventDefault();
      cursor = null;
      const p = cv.toLocal(e), cell = cellAt(p.x, p.y), r = o.down(cell);
      drag = r && cell ? { id: e.pointerId, cell, x: p.x, y: p.y, x0: p.x, y0: p.y, moved: false, again: r === 2 } : null;
      if (drag) try { cvs.setPointerCapture(e.pointerId); } catch (_) {   }
      dirtyF = true;
    });
    cvs.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = cv.toLocal(e);
      drag.x = p.x; drag.y = p.y;
      if (!drag.moved && Math.hypot(p.x - drag.x0, p.y - drag.y0) > 7) drag.moved = true;
      if (drag.moved) dirtyF = true;
    });
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag, p = cv.toLocal(e);
      drag = null;
      if (e.type === 'pointerup') {
        if (d.moved) o.drop(cellAt(p.x, p.y), d);
        else if (d.again) o.down(null);
      } else if (d.moved) o.drop(null, d);
      dirtyF = true;
    };
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', up);
    api.on(window, 'keydown', e => {
      if (ovUp || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return;
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
      if (dir) {
        e.preventDefault();
        cursor = cursor ? { c: Math.max(0, Math.min(7, cursor.c + dir[0])), r: Math.max(0, Math.min(7, cursor.r + dir[1])) } : { c: 4, r: 5 };
        dirtyF = true;
      } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') {
        if (!cursor || e.repeat) return;
        e.preventDefault();
        o.down(cursor); dirtyF = true;
      } else if (e.code === 'KeyU' && !e.repeat) undo();
      else if (e.code === 'KeyN' && !e.repeat && !online()) newGame();
    });
    api.loop(() => { if (dirtyF || o.busy()) { dirtyF = false; o.draw(); } });
    const k = {
      ctx: cv.ctx, opt, turnTo, end, status, turn, label,
      get over() { return over; }, get drag() { return drag; }, get me() { return me; }, get mode() { return opt.mode; },
      local: s => opt.mode === '2P' || (s === me && (opt.mode === 'CPU' || N.live)),
      has(s) { const l = label(s); return l === 'You' ? 'You have' : (l === 'AI' ? 'The AI' : l === 'Friend' ? 'Your friend' : l) + ' has'; },
      moved(n, m, remote) { if (online() && N.live && (!remote || N.role === 'host')) send({ t: 'mv', r: N.round, n, m }); },
      dirty() { dirtyF = true; },
      bump() { gen++; },
      later(fn, ms) { const g = gen; api.timeout(() => { if (g === gen && !over) fn(); }, ms); },
      info(s, html) { card(s).querySelector('small').innerHTML = html; },
      setUndo(v) { canUndo = !!v; btns(); },
      hist(list) {
        let h = '';
        for (let i = 0; i < list.length; i += 2) h += `<p><em>${i / 2 + 1}.</em><span${i === list.length - 1 ? ' class="cur"' : ''}>${list[i]}</span><span${i + 1 === list.length - 1 ? ' class="cur"' : ''}>${list[i + 1] || ''}</span></p>`;
        histEl.innerHTML = h || '<p class="none">No moves yet</p>';
        histEl.scrollTop = histEl.scrollHeight;
      },
      drawCursor() {
        if (!cursor) return;
        const c = cv.ctx;
        c.save(); c.lineWidth = 4; c.strokeStyle = '#6c5ce7'; c.shadowColor = 'rgba(108,92,231,.7)'; c.shadowBlur = 10;
        rr(c, FR + cursor.c * SQ + 3, FR + cursor.r * SQ + 3, SQ - 6, SQ - 6, 9); c.stroke(); c.restore();
      },
      shade(x, y, col) { cv.ctx.fillStyle = col; cv.ctx.fillRect(x, y, SQ, SQ); },
      dot(x, y, cap) {
        const c = cv.ctx;
        if (cap) { c.lineWidth = 5; c.strokeStyle = 'rgba(20,16,10,.32)'; c.beginPath(); c.arc(x + SQ / 2, y + SQ / 2, SQ / 2 - 5, 0, 7); c.stroke(); }
        else { c.fillStyle = 'rgba(20,16,10,.28)'; c.beginPath(); c.arc(x + SQ / 2, y + SQ / 2, SQ * .15, 0, 7); c.fill(); }
      },
      start() { if (api.net.invite || online()) { opt.mode = 'Online'; goOnline('CPU'); } else newGame(); }
    };
    return k;
  }

  const lathe = pts => {
    const all = [...pts.map(([y, r]) => [50 - r, y]), ...pts.slice().reverse().map(([y, r]) => [50 + r, y])];
    let d = `M${all[0][0].toFixed(2)} ${all[0][1]}`;
    for (let i = 1; i < all.length - 1; i++) { const [x1, y1] = all[i], [x2, y2] = all[i + 1]; d += `Q${x1.toFixed(2)} ${y1} ${((x1 + x2) / 2).toFixed(2)} ${(y1 + y2) / 2}`; }
    const z = all[all.length - 1];
    return d + `L${z[0].toFixed(2)} ${z[1]}Z`;
  };
  const BASE = w => [[93.5, w], [91, w + .6], [89, w - .4], [87.2, w - 3.6], [85.8, w - 4], [84, w - 6.6], [82, w - 8.6]];
  const STAUNTON = {
    1: { body: [lathe([...BASE(25), [78, 13.5], [72, 10.6], [66, 9.2], [61.5, 8.8], [60.2, 13.8], [58.6, 14.6], [57, 13.2], [55.6, 9.6], [54.4, 8.6]]), circ(50, 43.5, 12.4)], rings: [[86.5, 21.2], [59.4, 14.2]] },
    2: {
      body: [lathe([...BASE(28), [80.4, 19.6]]), 'M30.5 81C29.5 73.5 31.5 67.5 36.5 62C38.5 59.5 39.5 58 39 56.5C35.5 58 30.5 59 27 58C23 57 20 55.5 19 52.5C18 49.5 19.5 46.5 22 44L30.5 34C33.5 30 36.5 26.5 39 24.5L38 15L44 20.3L46.5 13.2L51 19.8C59.5 20.3 66.5 25 70.5 33C75 42 76 53 74 64C73 70 72 75.5 71.5 81Z'],
      det: ['M51.5 21C60.5 23 66.5 29 69.5 37', 'M57.5 23.5C64.5 28.5 68.5 35.5 71 44.5', 'M61.5 29C67.5 36 71 45.5 72 55.5', 'M39 56.5C42.5 52 46.5 49 47.5 44', 'M19.5 52.5Q23.5 53.5 26.5 52', 'M30.5 34.5Q34 37 38 36.5'],
      dots: [ell(36.5, 32.5, 2.7, 1.9), ell(24, 49.3, 1.7, 1.2)], rings: [[86.5, 24.2]]
    },
    3: {
      body: [lathe([...BASE(26), [78, 15], [72, 11.8], [64, 9.6], [56.5, 8.8], [55, 13.6], [53.4, 14.3], [52, 12.8], [50.6, 9.4]]), 'M41.6 51C34 42.5 35 29.5 50 17.2C65 29.5 66 42.5 58.4 51Z', circ(50, 13.2, 4.6)],
      thick: ['M56.8 25.5L47.2 37.2'], rings: [[86.5, 22.2], [54.6, 14]]
    },
    4: {
      body: [lathe([...BASE(28), [78, 17.2], [72, 15.6], [62, 14.6], [51, 14.8], [48.4, 17.6], [46.6, 19.6], [45, 20]]), 'M30.2 45.5L29 21H37.4V26H45.6V21H54.4V26H62.6V21H71L69.8 45.5Z'],
      det: ['M30 31.5H70'], rings: [[86.5, 24.2], [47.4, 19.4]]
    },
    5: {
      body: [lathe([...BASE(29), [79, 17.6], [72, 13.4], [62, 10.8], [55, 10.2], [53.4, 15.2], [51.8, 16], [50.2, 14.4], [48.4, 11]]), 'M39.4 49.5C37.6 41 34.6 32.5 31 23.5L37.8 29.8L41.6 19.4L46.2 28.8L50 17L53.8 28.8L58.4 19.4L62.2 29.8L69 23.5C65.4 32.5 62.4 41 60.6 49.5Z', circ(31, 22.4, 3.3), circ(41.6, 18.6, 3.3), circ(58.4, 18.6, 3.3), circ(69, 22.4, 3.3), 'M47.6 17.5V12.5H52.4V17.5Z', circ(50, 10.2, 4.4)],
      det: ['M37.6 41.5Q50 44.5 62.4 41.5'], rings: [[86.5, 25.2], [53, 15.6], [48.6, 11.6]]
    },
    6: {
      body: [lathe([...BASE(30), [79, 18.6], [72, 14.4], [62, 11.6], [55, 11.2], [53.4, 16.2], [51.8, 17], [50.2, 15.4], [48.4, 12]]), 'M38.8 49.5C35.4 41.5 33.4 34 34.8 26.5H65.2C66.6 34 64.6 41.5 61.2 49.5Z', 'M35.2 27C38.6 19.5 61.4 19.5 64.8 27Z', 'M47.3 2.5H52.7V7.6H57.6V12.8H52.7V20H47.3V12.8H42.4V7.6H47.3Z'],
      det: ['M36.2 38Q50 41.5 63.8 38'], rings: [[86.5, 26.2], [53, 16.6], [48.6, 12.6], [26.6, 15.4]]
    }
  };
  const WOODS = {
    w: { base: '#e7cd9b', stops: [[0, '#a37a45'], [.16, '#d9b47c'], [.36, '#fff0cf'], [.5, '#f1d9a8'], [.78, '#c99b5f'], [1, '#7f5a2c']], grain: ['rgba(140,90,35,.22)', 'rgba(170,115,50,.16)', 'rgba(255,245,215,.25)'], line: '#4a3317', det: 'rgba(95,62,25,.55)', eye: '#3a2510', spec: .55 },
    b: { base: '#2b1d16', stops: [[0, '#080504'], [.18, '#2e1f18'], [.36, '#6a4f41'], [.5, '#3c2a21'], [.78, '#1a110d'], [1, '#050302']], grain: ['rgba(255,215,180,.07)', 'rgba(120,70,40,.18)', 'rgba(0,0,0,.25)'], line: '#030201', det: 'rgba(255,225,190,.2)', eye: '#e8d4b0', spec: .32 }
  };
  function stauntonSprite(t, white, S) {
    const def = STAUNTON[t], c = cnv(S, S), x = c.getContext('2d'), pal = white ? WOODS.w : WOODS.b, P = def.body.map(s => new Path2D(s)), rand = rng(t * 31 + (white ? 7 : 3));
    x.scale(S / 100, S / 100);
    x.fillStyle = pal.base; P.forEach(p => x.fill(p));
    x.globalCompositeOperation = 'source-atop';
    let g = x.createLinearGradient(t === 2 ? 16 : 20, 0, t === 2 ? 80 : 80, 0);
    pal.stops.forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g; x.fillRect(0, 0, 100, 100);
    for (let i = 0; i < 46; i++) {
      const x0 = 14 + rand() * 72, amp = .6 + rand() * 1.8, ph = rand() * 7;
      x.strokeStyle = pal.grain[i % pal.grain.length]; x.lineWidth = .3 + rand() * .9;
      x.beginPath();
      for (let y = 0; y <= 100; y += 4) { const xx = x0 + Math.sin(y * .07 + ph) * amp + (y - 50) * (t === 2 ? .12 : 0); if (y) x.lineTo(xx, y); else x.moveTo(xx, y); }
      x.stroke();
    }
    g = x.createLinearGradient(0, 0, 0, 100);
    g.addColorStop(0, 'rgba(255,255,255,.16)'); g.addColorStop(.55, 'rgba(255,255,255,0)'); g.addColorStop(.88, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
    x.fillStyle = g; x.fillRect(0, 0, 100, 100);
    g = x.createLinearGradient(34, 0, 46, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${pal.spec})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 100, 100);
    for (const [y, r] of def.rings || []) {
      x.lineWidth = 1.1;
      x.strokeStyle = white ? 'rgba(80,50,20,.5)' : 'rgba(0,0,0,.7)';
      x.beginPath(); x.ellipse(50, y, r, r * .2, 0, .05, Math.PI - .05); x.stroke();
      x.strokeStyle = white ? 'rgba(255,248,225,.75)' : 'rgba(255,220,190,.22)';
      x.beginPath(); x.ellipse(50, y - 1.1, r * .96, r * .19, 0, .15, Math.PI - .15); x.stroke();
    }
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = pal.det; x.lineWidth = 1.3;
    (def.det || []).forEach(s => x.stroke(new Path2D(s)));
    x.strokeStyle = pal.line; x.lineWidth = 2.8;
    (def.thick || []).forEach(s => x.stroke(new Path2D(s)));
    x.fillStyle = pal.eye;
    (def.dots || []).forEach(s => x.fill(new Path2D(s)));
    x.globalCompositeOperation = 'destination-over';
    x.strokeStyle = pal.line; x.lineWidth = 3.4;
    P.forEach(p => x.stroke(p));
    shadowEll(x, 53, 92, 34, 6.5, .42);
    return c;
  }
  const marbleSquares = (light, dark) => (x, rand, d) => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const dk = (r + c) & 1, t = dk ? dark : light, X = FR + c * SQ, Y = FR + r * SQ;
      x.save(); x.beginPath(); x.rect(X, Y, SQ, SQ); x.clip();
      const g = x.createLinearGradient(X, Y, X + SQ, Y + SQ);
      g.addColorStop(0, t[0]); g.addColorStop(1, t[1]);
      x.fillStyle = g; x.fillRect(X, Y, SQ, SQ);
      for (let k = 0; k < 5; k++) {
        const bx = X + rand() * SQ, by = Y + rand() * SQ, br = 10 + rand() * 26, cg = x.createRadialGradient(bx, by, 0, bx, by, br);
        cg.addColorStop(0, rand() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.08)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = cg; x.fillRect(X, Y, SQ, SQ);
      }
      for (let k = 0; k < 4; k++) {
        x.strokeStyle = t[2]; x.globalAlpha = .05 + rand() * .11; x.lineWidth = .5 + rand() * 1.8;
        x.beginPath();
        let px = X + rand() * SQ, py = Y - 4;
        x.moveTo(px, py);
        for (let s2 = 0; s2 < 6; s2++) { const nx = px + (rand() - .35) * 22, ny = py + 6 + rand() * 14; x.quadraticCurveTo(px + (rand() - .5) * 18, (py + ny) / 2, nx, ny); px = nx; py = ny; }
        x.stroke();
      }
      x.globalAlpha = 1;
      for (let k = 0; k < 40; k++) { x.fillStyle = rand() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'; x.fillRect(X + rand() * SQ, Y + rand() * SQ, 1.2, 1.2); }
      const sh = x.createLinearGradient(X, Y, X, Y + SQ);
      sh.addColorStop(0, 'rgba(255,255,255,.1)'); sh.addColorStop(1, 'rgba(0,0,0,.06)');
      x.fillStyle = sh; x.fillRect(X, Y, SQ, SQ);
      x.restore();
    }
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1;
    for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(FR + i * SQ, FR); x.lineTo(FR + i * SQ, FR + 8 * SQ); x.moveTo(FR, FR + i * SQ); x.lineTo(FR + 8 * SQ, FR + i * SQ); x.stroke(); }
  };
  const flatSquares = (light, dark) => (x, rand) => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const X = FR + c * SQ, Y = FR + r * SQ;
      x.fillStyle = (r + c) & 1 ? dark : light; x.fillRect(X, Y, SQ, SQ);
      for (let k = 0; k < 30; k++) { x.fillStyle = rand() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; x.fillRect(X + rand() * SQ, Y + rand() * SQ, 1.5, 1.5); }
    }
  };
  const BOARDS = {
    Wood: woodSquares(['#e6c99a', ['#cfa66c', '#f6e0bb', '#ba8c55']], ['#8b5a33', ['#5f3a1b', '#a26e42', '#4b2b10']]),
    Marble: marbleSquares(['#f2efe8', '#d9d4ca', '#7d776d'], ['#4d5a58', '#2f3a39', '#c9d2cf']),
    Green: flatSquares('#eeeed2', '#769656')
  };
  const ELO_PTS = [[400, 1, 320, .3, 250], [800, 2, 160, .12, 350], [1200, 3, 70, .045, 500], [1600, 4, 28, .012, 800], [2000, 7, 9, 0, 1400], [2400, 40, 0, 0, 2600]];
  function eloCfg(e) {
    let i = 0;
    while (i < ELO_PTS.length - 2 && e > ELO_PTS[i + 1][0]) i++;
    const a = ELO_PTS[i], b = ELO_PTS[i + 1], t = Math.max(0, Math.min(1, (e - a[0]) / (b[0] - a[0]))), L = k => a[k] + (b[k] - a[k]) * t;
    return { depth: Math.round(L(1)), noise: L(2), blunder: L(3), time: L(4), book: e >= 900 };
  }
  const eloName = e => e < 700 ? 'Beginner' : e < 1100 ? 'Casual' : e < 1500 ? 'Club' : e < 1900 ? 'Strong' : e < 2200 ? 'Expert' : 'Master';
  const CHIP_W = 'radial-gradient(circle at 35% 30%,#fff,#efe5d0 55%,#a38d68)', CHIP_B = 'radial-gradient(circle at 35% 30%,#77707f,#2e2a33 55%,#0b0a0d)';
  const MAT = [0, 1, 3, 3, 5, 9, 0];

  function mountChess(root, api) {
    const E = chessEngine(), d = dprOf(), spr = {}, img = {}, texs = [null, null];
    for (let t = 1; t <= 6; t++) { spr[t] = stauntonSprite(t, true, Math.round(SQ * d * 1.25)); spr[-t] = stauntonSprite(t, false, Math.round(SQ * d * 1.25)); }
    const imgOf = p => img[p] || (img[p] = spr[p].toDataURL());
    let flip = false, hist = [], keys = [], sel = -1, targets = [], legalNow = [], promo = null, anims = [], last = null, thinking = false, aiTok = 0, worker = null, wurl = '';
    const pend = new Map();
    let ac = null, nz = null;
    const audio = () => {
      if (api.muted) return null;
      try {
        if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); nz = ac.createBuffer(1, ac.sampleRate * .25 | 0, ac.sampleRate); const q = nz.getChannelData(0); for (let i = 0; i < q.length; i++) q[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / q.length, 6); }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      } catch (e) { return null; }
    };
    const clack = (cap, chk) => {
      const a = audio(); if (!a) return;
      const t = a.currentTime + .005;
      const hit = (dt, f, v) => { const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); s.buffer = nz; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.6; g.gain.value = v; s.connect(bp).connect(g).connect(a.destination); s.start(t + dt); };
      const thump = (dt, f, v) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(f, t + dt); o.frequency.exponentialRampToValueAtTime(f * .55, t + dt + .08); g.gain.setValueAtTime(v, t + dt); g.gain.exponentialRampToValueAtTime(.0001, t + dt + .1); o.connect(g).connect(a.destination); o.start(t + dt); o.stop(t + dt + .12); };
      hit(0, 1900, .5); thump(0, 210, .22);
      if (cap) { hit(.045, 1300, .55); thump(.045, 160, .25); }
      if (chk) { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = 880; g.gain.setValueAtTime(.0001, t + .08); g.gain.exponentialRampToValueAtTime(.06, t + .1); g.gain.exponentialRampToValueAtTime(.0001, t + .45); o.connect(g).connect(a.destination); o.start(t + .08); o.stop(t + .5); }
    };
    const getWorker = () => {
      if (worker !== null) return worker;
      try {
        const src = 'const C=(' + chessCore.toString() + ')(),E=C.chessEngine();onmessage=e=>{const d=e.data;E.load(C.START);for(const m of d.moves)E.make(m);const m=E.think(d.cfg);postMessage({id:d.id,m,depth:E.T.depth,book:!!E.T.book});};';
        wurl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        worker = new Worker(wurl);
        worker.onmessage = e => { const f = pend.get(e.data.id); pend.delete(e.data.id); if (f) f(e.data.m); };
        worker.onerror = () => { const w = worker; worker = false; try { w.terminate(); } catch (er) {} const list = [...pend.values()]; pend.clear(); list.forEach(f => f(undefined)); };
      } catch (e) { worker = false; }
      return worker;
    };
    const k = kit(root, api, {
      title: 'Chess', elo: eloName, keep: ['board'], onOpt: () => { texs[0] = texs[1] = null; k.dirty(); },
      segs: [{ key: 'side', opts: ['White', 'Black'], only: 'CPU', txt: { White: 'Play White', Black: 'Play Black' } }, { key: 'board', opts: ['Wood', 'Marble', 'Green'] }],
      sides: { 1: ['White', CHIP_W], '-1': ['Black', CHIP_B] }, cpuSide: () => k.opt.side === 'Black' ? -1 : 1,
      flip: f => { if (flip !== f) { flip = f; k.dirty(); } },
      newGame, undo, draw, down, drop, remote, load, ai: aiTurn, ply: () => hist.length, list: () => hist.map(h => h.m),
      busy: () => anims.length > 0, started: () => hist.some(h => h.by === k.me)
    });
    const ctx = k.ctx, hide = new Uint8Array(128);
    const sx = sq => FR + (flip ? 7 - (sq & 7) : sq & 7) * SQ;
    const sy = sq => FR + (flip ? sq >> 4 : 7 - (sq >> 4)) * SQ;
    const sqOf = cell => flip ? cell.r * 16 + 7 - cell.c : (7 - cell.r) * 16 + cell.c;
    const myTurn = () => !k.over && !thinking && k.local(E.side);
    const makeTex = () => frameTex(7, BOARDS[k.opt.board] || BOARDS.Wood, x => {
      for (let i = 0; i < 8; i++) { x.fillText(FILES[flip ? 7 - i : i], FR + i * SQ + SQ / 2, SZ - FR / 2 + 1); x.fillText(String(flip ? i + 1 : 8 - i), FR / 2, FR + i * SQ + SQ / 2); }
    });
    const tex = () => texs[+flip] || (texs[+flip] = makeTex());

    function newGame(me) {
      E.load(START); aiTok++;
      hist = []; keys = [E.key()]; sel = -1; targets = []; promo = null; anims = []; last = null; thinking = false;
      k.turnTo(E.side, k.mode === 'CPU' ? 'you play ' + (me === 1 ? 'White' : 'Black') : '');
      refresh();
    }
    function refresh() {
      k.hist(hist.map(h => h.san));
      const caps = s => hist.filter(h => h.by === s && h.cap).map(h => h.cap).sort((a, b) => Math.abs(b) - Math.abs(a));
      const w = caps(1), b = caps(-1), sum = a => a.reduce((t, p) => t + MAT[Math.abs(p)], 0), diff = sum(w) - sum(b);
      const html = (a, adv) => a.map(p => `<img src="${imgOf(p)}" alt="">`).join('') + (adv > 0 ? `<em>+${adv}</em>` : '') || 'No captures';
      k.info(1, html(w, diff));
      k.info(-1, html(b, -diff));
      k.setUndo(k.mode === '2P' ? hist.length > 0 : hist.some(h => h.by === k.me));
      k.dirty();
    }
    function aiTurn() {
      thinking = true; k.turn(-k.me, true); k.status('AI is thinking…');
      const tok = ++aiTok, t0 = now(), cfg = eloCfg(k.opt.elo), moves = hist.map(h => h.m);
      const done = m => {
        if (tok !== aiTok || !thinking || k.over) return;
        if (m === undefined) { k.later(() => { if (tok === aiTok && thinking) done(E.think(cfg)); }, 30); return; }
        api.timeout(() => {
          if (tok !== aiTok || !thinking || k.over) return;
          thinking = false;
          if (m && E.legal().includes(m)) play(m, null);
        }, Math.max(0, 420 - (now() - t0)));
      };
      const w = getWorker();
      if (w) { pend.set(tok, done); w.postMessage({ id: tok, moves, cfg }); }
      else k.later(() => { if (tok === aiTok && thinking) done(E.think(cfg)); }, 120);
    }
    function play(m, dr, remote, quiet) {
      const from = m & 127, to = m >> 7 & 127, fl = m >> 17, by = E.side, p = E.at(from), san = E.san(m, E.legal()), n = hist.length;
      const capSq = fl === 2 ? to - 16 * by : to, cap = E.at(capSq);
      E.make(m);
      if (!quiet) {
        const t0 = now(), dur = dr ? 110 : k.local(by) ? 200 : 300;
        if (cap) anims.push({ p: cap, x0: sx(capSq), y0: sy(capSq), x1: sx(capSq), y1: sy(capSq), t0: t0 + dur * .55, d: 170, fade: true });
        anims.push({ p, x0: dr ? dr.x - SQ / 2 : sx(from), y0: dr ? dr.y - SQ * .7 : sy(from), x1: sx(to), y1: sy(to), t0, d: dur, hide: to });
        if (fl === 3) { const rf = to > from ? from + 3 : from - 4, rt = to > from ? from + 1 : from - 1; anims.push({ p: 4 * by, x0: sx(rf), y0: sy(rf), x1: sx(rt), y1: sy(rt), t0: t0 + 70, d: dur + 40, hide: rt }); }
        clack(!!cap, /[+#]/.test(san));
      }
      hist.push({ m, san, by, cap });
      keys.push(E.key());
      last = { from, to }; sel = -1; targets = []; promo = null;
      k.moved(n, m, remote);
      if (!checkEnd(by)) k.turnTo(E.side, E.inCheck() ? 'check!' : '');
      refresh();
    }
    function checkEnd(by) {
      let w = null, why = '';
      if (!E.legal().length) { if (E.inCheck()) { w = by; why = 'Checkmate'; } else { w = 0; why = 'Stalemate'; } }
      else if (E.half >= 100) { w = 0; why = '50-move rule'; }
      else if (E.insufficient()) { w = 0; why = 'Insufficient material'; }
      else { const kk = keys[keys.length - 1]; if (keys.filter(x => x === kk).length >= 3) { w = 0; why = 'Threefold repetition'; } }
      if (w === null) return false;
      k.end(w, why, [['Moves', Math.ceil(hist.length / 2)]]);
      return true;
    }
    function remote(n, m) {
      if (n < hist.length) return hist[n].m === m;
      if (n !== hist.length || thinking || k.local(E.side) || !E.legal().includes(m)) return false;
      play(m, null, true);
      return true;
    }
    function load(list) {
      for (const m of list) { if (k.over || !E.legal().includes(m)) break; play(m, null, true, true); }
    }
    function undo() {
      const two = k.mode === '2P';
      if (k.over || k.mode === 'Online' || !(two ? hist.length : hist.some(h => h.by === k.me))) return;
      k.bump(); thinking = false; aiTok++;
      while (hist.length) { const h = hist.pop(); keys.pop(); E.unmake(); if (two || h.by === k.me) break; }
      const lh = hist[hist.length - 1];
      last = lh ? { from: lh.m & 127, to: lh.m >> 7 & 127 } : null;
      sel = -1; targets = []; promo = null; anims = [];
      api.sfx('tick');
      k.turnTo(E.side);
      if (!two) k.status('Move taken back');
      refresh();
    }
    function select(sq) {
      sel = sq; legalNow = E.legal();
      targets = [...new Set(legalNow.filter(m => (m & 127) === sq).map(m => m >> 7 & 127))];
      api.sfx('tick');
    }
    function moveTo(sq, dr) {
      const ms = legalNow.filter(m => (m & 127) === sel && (m >> 7 & 127) === sq);
      if (!ms.length) return;
      if (ms.length > 1) { promo = { ms, sq }; k.dirty(); return; }
      play(ms[0], dr);
    }
    function down(cell) {
      if (promo) {
        const pr = promo, top = sy(pr.sq) < SZ / 2, i = cell ? (top ? cell.r : 7 - cell.r) : -1;
        promo = null;
        if (cell && FR + cell.c * SQ === sx(pr.sq) && i >= 0 && i < 4 && myTurn()) play(pr.ms.find(m => (m >> 14 & 7) === 5 - i), null);
        k.dirty();
        return 0;
      }
      if (!cell || !myTurn()) { sel = -1; targets = []; return 0; }
      const sq = sqOf(cell);
      if (sel >= 0 && targets.includes(sq)) { moveTo(sq, null); return 0; }
      const p = E.at(sq);
      if (p && Math.sign(p) === E.side) { const again = sq === sel; select(sq); return again ? 2 : 1; }
      sel = -1; targets = [];
      return 0;
    }
    function drop(cell, dr) {
      if (sel < 0 || !myTurn()) return;
      const sq = cell ? sqOf(cell) : -1;
      if (targets.includes(sq)) moveTo(sq, dr);
      else anims.push({ p: E.at(sel), x0: dr.x - SQ / 2, y0: dr.y - SQ * .7, x1: sx(sel), y1: sy(sel), t0: now(), d: 150, hide: sel });
    }
    function drawPiece(p, x, y, s, a) {
      if (a < 1) ctx.globalAlpha = a;
      const z = SQ * (s || 1) * 1.1;
      ctx.drawImage(spr[p], x + SQ / 2 - z / 2, y + SQ / 2 - z * .53, z, z);
      ctx.globalAlpha = 1;
    }
    function draw() {
      const t = now();
      ctx.drawImage(tex(), 0, 0, SZ, SZ);
      if (last) { k.shade(sx(last.from), sy(last.from), 'rgba(255,214,70,.36)'); k.shade(sx(last.to), sy(last.to), 'rgba(255,214,70,.5)'); }
      if (sel >= 0) k.shade(sx(sel), sy(sel), 'rgba(110,200,80,.5)');
      if (E.inCheck()) {
        const kq = E.king(E.side), cx = sx(kq) + SQ / 2, cy = sy(kq) + SQ / 2, g = ctx.createRadialGradient(cx, cy, 4, cx, cy, SQ * .62);
        g.addColorStop(0, 'rgba(255,30,30,.95)'); g.addColorStop(.55, 'rgba(255,40,40,.5)'); g.addColorStop(1, 'rgba(255,40,40,0)');
        ctx.fillStyle = g; ctx.fillRect(sx(kq), sy(kq), SQ, SQ);
      }
      const dg = k.drag && k.drag.moved && sel >= 0 ? k.drag : null;
      hide.fill(0);
      for (const a of anims) if (a.hide != null) hide[a.hide] = 1;
      if (dg) hide[sel] = 1;
      for (const q of targets) if (E.at(q)) k.dot(sx(q), sy(q), true);
      for (let sq = 0; sq < 120; sq++) {
        if (sq & 0x88) { sq += 7; continue; }
        const p = E.at(sq);
        if (p && !hide[sq]) drawPiece(p, sx(sq), sy(sq), 1, 1);
      }
      if (dg) {
        const p = E.at(sel);
        if (p) drawPiece(p, sx(sel), sy(sel), 1, .3);
        const hc = { c: Math.floor((dg.x - FR) / SQ), r: Math.floor((dg.y - FR) / SQ) };
        if (hc.c >= 0 && hc.c < 8 && hc.r >= 0 && hc.r < 8 && targets.includes(sqOf(hc))) { ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.strokeRect(FR + hc.c * SQ + 2, FR + hc.r * SQ + 2, SQ - 4, SQ - 4); }
      }
      for (const q of targets) if (!E.at(q)) k.dot(sx(q), sy(q), false);
      let done = 0;
      for (const a of anims) {
        const u = clamp01((t - a.t0) / a.d);
        if (a.fade) drawPiece(a.p, a.x0, a.y0, 1 - u * .25, 1 - u);
        else { const e = easeIO(u); drawPiece(a.p, a.x0 + (a.x1 - a.x0) * e, a.y0 + (a.y1 - a.y0) * e, 1 + Math.sin(u * Math.PI) * .08, 1); }
        if (u >= 1) { a.done = 1; done++; }
      }
      if (done) anims = anims.filter(a => !a.done);
      if (dg) drawPiece(E.at(sel), dg.x - SQ / 2, dg.y - SQ * .7, 1.15, 1);
      if (promo) {
        ctx.fillStyle = 'rgba(24,16,8,.5)'; ctx.fillRect(0, 0, SZ, SZ);
        const x = sx(promo.sq), top = sy(promo.sq) < SZ / 2;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.fillStyle = '#fffaf0'; rr(ctx, x + 2, FR + (top ? 0 : 4 * SQ) + 2, SQ - 4, SQ * 4 - 4, 14); ctx.fill(); ctx.restore();
        [5, 4, 3, 2].forEach((tp, i) => drawPiece(tp * E.side, x, FR + (top ? i : 7 - i) * SQ + 2, .92, 1));
      }
      k.drawCursor();
    }
    k.start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (api.alive) { texs[0] = texs[1] = null; k.dirty(); } });
    return { destroy() { aiTok++; if (worker) { try { worker.terminate(); } catch (e) {} } if (wurl) URL.revokeObjectURL(wurl); if (ac) { try { ac.close(); } catch (e) {} } } };
  }

  const CK_AI = { Easy: { depth: 2, minDepth: 2, time: 300, noise: 70, blunder: .1 }, Normal: { depth: 5, minDepth: 4, time: 700, noise: 10 }, Hard: { depth: 30, minDepth: 6, time: 1000, cap: 1450 } };
  function mountCheckers(root, api) {
    const E = checkersEngine(), d = dprOf();
    const spr = { 1: checkerSprite(true, false, SQ * d * 1.2), 2: checkerSprite(true, true, SQ * d * 1.2), '-1': checkerSprite(false, false, SQ * d * 1.2), '-2': checkerSprite(false, true, SQ * d * 1.2) };
    const tex = frameTex(23, woodSquares(['#ecd7a8', ['#d2b47c', '#f8e9c8', '#c19f63']], ['#2e6a47', ['#1f5136', '#3d8059', '#173f29']]));
    let hist = [], sel = -1, cands = [], anims = [], last = null, thinking = false, forced = [], all = [], flip = false;
    const k = kit(root, api, {
      title: 'Checkers', sides: { 1: ['Red', 'radial-gradient(circle at 35% 30%,#ff9a86,#de3b33 55%,#7c1a14)'], '-1': ['White', 'radial-gradient(circle at 35% 30%,#fff,#f2e8d0 55%,#a89470)'] },
      flip: f => { if (flip !== f) { flip = f; k.dirty(); } },
      newGame, undo, draw, down, drop, remote, load, ai: aiTurn, ply: () => hist.length, list: () => hist.map(h => h.enc),
      busy: () => anims.length > 0 || forced.length > 0, started: () => hist.some(h => h.by === k.me)
    });
    const ctx = k.ctx, hide = new Uint8Array(64);
    const X = i => FR + (flip ? 7 - (i & 7) : i & 7) * SQ, Y = i => FR + (flip ? 7 - (i >> 3) : i >> 3) * SQ;
    const at = cell => flip ? (7 - cell.r) * 8 + 7 - cell.c : cell.r * 8 + cell.c;
    const myTurn = () => !k.over && !thinking && k.local(E.side);

    function newGame() {
      E.reset();
      hist = []; sel = -1; cands = []; anims = []; last = null; thinking = false;
      k.turnTo(E.side, k.mode === 'CPU' ? 'red goes first' : '');
      refresh();
    }
    function refresh() {
      k.hist(hist.map(h => h.txt));
      const tally = s => { let n = 0, kg = 0; for (let i = 0; i < 64; i++) if (E.at(i) * s > 0) { n++; if (Math.abs(E.at(i)) === 2) kg++; } return `${n} piece${n === 1 ? '' : 's'}${kg ? ` · ${kg} king${kg === 1 ? '' : 's'}` : ''}`; };
      k.info(1, tally(1)); k.info(-1, tally(-1));
      all = myTurn() ? E.moves() : [];
      forced = all.length && all[0].caps.length ? [...new Set(all.map(m => m.path[0]))] : [];
      k.setUndo(k.mode === '2P' ? hist.length > 0 : hist.some(h => h.by === k.me));
      k.dirty();
    }
    function aiTurn() {
      thinking = true; k.turn(-k.me, true); k.status('AI is thinking…');
      k.later(() => {
        const m = E.think(CK_AI[k.opt.diff]);
        thinking = false;
        if (m) play(m, null);
      }, 420);
    }
    function play(mv, dr, remote, quiet) {
      const by = E.side, p = E.at(mv.path[0]), capv = mv.caps.map(s => E.at(s)), snap = E.snap(), n = hist.length, enc = mv.path.join('.');
      E.make(mv);
      if (!quiet) {
        const t0 = now(), seg = dr ? 120 : k.local(by) ? 170 : 230;
        const pts = mv.path.map(s => [X(s), Y(s)]);
        if (dr) pts[0] = [dr.x - SQ / 2, dr.y - SQ * .7];
        anims.push({ p, pts, t0, seg, hide: mv.path[mv.path.length - 1], jump: mv.caps.length > 0 });
        mv.caps.forEach((s, i) => anims.unshift({ p: capv[i], x: X(s), y: Y(s), t0: t0 + seg * (i + .55), d: 200, fade: true }));
        api.sfx(mv.caps.length ? 'hit' : 'tap');
        if (Math.abs(E.at(mv.path[mv.path.length - 1])) === 2 && Math.abs(p) === 1) api.timeout(() => api.sfx('good'), seg * (pts.length - 1));
      }
      hist.push({ by, snap, enc, txt: mv.path.map(ckNum).join(mv.caps.length ? 'x' : '-') });
      last = mv.path.slice(); sel = -1; cands = [];
      k.moved(n, enc, remote);
      const ms = E.moves();
      if (!ms.length) k.end(by, k.has(E.side) + ' no moves left', stats());
      else if (E.quiet >= 80) k.end(0, '40 moves without a capture', stats());
      else k.turnTo(E.side, ms[0].caps.length ? 'you must capture' : '');
      refresh();
    }
    function stats() { let a = 0, b = 0; for (let i = 0; i < 64; i++) { if (E.at(i) > 0) a++; else if (E.at(i) < 0) b++; } const me = k.me; return [[k.label(me), me === 1 ? a : b], [k.label(-me), me === 1 ? b : a]]; }
    function remote(n, enc) {
      if (n < hist.length) return hist[n].enc === enc;
      if (n !== hist.length || thinking || k.local(E.side)) return false;
      const mv = E.moves().find(m => m.path.join('.') === enc);
      if (!mv) return false;
      play(mv, null, true);
      return true;
    }
    function load(list) {
      for (const enc of list) { const mv = !k.over && E.moves().find(m => m.path.join('.') === enc); if (!mv) break; play(mv, null, true, true); }
    }
    function undo() {
      const two = k.mode === '2P';
      if (k.over || k.mode === 'Online' || !(two ? hist.length : hist.some(h => h.by === k.me))) return;
      k.bump(); thinking = false;
      let h;
      while (hist.length) { h = hist.pop(); if (two || h.by === k.me) break; }
      E.restore(h.snap);
      last = null; sel = -1; cands = []; anims = [];
      api.sfx('tick');
      k.turnTo(E.side);
      if (!two) k.status('Move taken back');
      refresh();
    }
    function down(cell) {
      if (!cell || !myTurn()) { sel = -1; cands = []; return 0; }
      const sq = at(cell);
      if (sel >= 0) { const c = cands.filter(m => m.path[m.path.length - 1] === sq); if (c.length) { play(c.sort((a, b) => b.caps.length - a.caps.length)[0], null); return 0; } }
      if (E.at(sq) * E.side > 0) {
        const mine = all.filter(m => m.path[0] === sq);
        if (!mine.length) { k.status(forced.length ? 'You must capture · pick a glowing piece' : 'That piece cannot move', 'warn'); api.sfx('bad'); sel = -1; cands = []; return 0; }
        const again = sq === sel;
        sel = sq; cands = mine; api.sfx('tick');
        return again ? 2 : 1;
      }
      sel = -1; cands = [];
      return 0;
    }
    function drop(cell, dr) {
      if (sel < 0 || !myTurn()) return;
      const sq = cell ? at(cell) : -1, c = cands.filter(m => m.path[m.path.length - 1] === sq);
      if (c.length) play(c.sort((a, b) => b.caps.length - a.caps.length)[0], dr);
      else anims.push({ p: E.at(sel), pts: [[dr.x - SQ / 2, dr.y - SQ * .7], [X(sel), Y(sel)]], t0: now(), seg: 150, hide: sel });
    }
    function piece(p, x, y, s, a, lift) {
      const z = SQ * 1.08 * s;
      if (a < 1) ctx.globalAlpha = a;
      ctx.drawImage(spr[p], x + SQ / 2 - z / 2, y + SQ / 2 - z / 2 - (lift || 0), z, z);
      ctx.globalAlpha = 1;
    }
    function draw() {
      const t = now();
      ctx.drawImage(tex, 0, 0, SZ, SZ);
      if (last) for (const s of [last[0], last[last.length - 1]]) k.shade(X(s), Y(s), 'rgba(255,214,70,.3)');
      if (sel >= 0) k.shade(X(sel), Y(sel), 'rgba(140,220,110,.4)');
      if (forced.length && sel < 0) {
        const a = .55 + Math.sin(t / 200) * .3;
        ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,214,64,${a})`;
        for (const s of forced) { ctx.beginPath(); ctx.arc(X(s) + SQ / 2, Y(s) + SQ / 2, SQ * .46, 0, 7); ctx.stroke(); }
      }
      const dg = k.drag && k.drag.moved && sel >= 0 ? k.drag : null;
      hide.fill(0);
      for (const a of anims) if (a.hide != null) hide[a.hide] = 1;
      if (dg) hide[sel] = 1;
      for (let i = 0; i < 64; i++) { const p = E.at(i); if (p && !hide[i]) piece(p, X(i), Y(i), 1, 1); }
      if (dg) piece(E.at(sel), X(sel), Y(sel), 1, .3);
      for (const m of cands) {
        if (m.caps.length) {
          ctx.save(); ctx.setLineDash([3, 7]); ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,240,200,.75)';
          ctx.beginPath(); m.path.forEach((s, i) => { const px = X(s) + SQ / 2, py = Y(s) + SQ / 2; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }); ctx.stroke(); ctx.restore();
        }
        const e = m.path[m.path.length - 1];
        ctx.fillStyle = 'rgba(255,240,200,.55)'; ctx.beginPath(); ctx.arc(X(e) + SQ / 2, Y(e) + SQ / 2, SQ * .16, 0, 7); ctx.fill();
      }
      let done = 0;
      for (const a of anims) {
        if (a.fade) { const u = clamp01((t - a.t0) / a.d); piece(a.p, a.x, a.y, 1 + u * .15, 1 - u); if (u >= 1) { a.done = 1; done++; } continue; }
        const n = a.pts.length - 1, u = clamp01((t - a.t0) / (a.seg * n)), f = Math.min(n - 1e-9, u * n), i = Math.floor(f), e = easeIO(f - i);
        const [x0, y0] = a.pts[i], [x1, y1] = a.pts[i + 1];
        piece(a.p, x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, 1 + Math.sin(e * Math.PI) * (a.jump ? .14 : .05), 1, a.jump ? Math.sin(e * Math.PI) * 10 : 0);
        if (u >= 1) { a.done = 1; done++; }
      }
      if (done) anims = anims.filter(a => !a.done);
      if (dg) piece(E.at(sel), dg.x - SQ / 2, dg.y - SQ * .7, 1.12, 1);
      k.drawCursor();
    }
    k.start();
  }

  const RV_AI = { Easy: { depth: 1, minDepth: 1, time: 200, noise: 80, blunder: .1 }, Normal: { depth: 3, minDepth: 3, time: 600, noise: 8 }, Hard: { depth: 30, minDepth: 4, time: 950, cap: 1450 } };
  function mountReversi(root, api) {
    const E = reversiEngine(), d = dprOf();
    const spr = { 1: discSprite(true, SQ * d * 1.2), '-1': discSprite(false, SQ * d * 1.2) };
    const tex = feltTex();
    const flipAt = new Float64Array(64), dropAt = new Float64Array(64).fill(-1e9);
    let hist = [], last = -1, thinking = false, legal = [], animEnd = 0;
    const k = kit(root, api, {
      title: 'Reversi', sides: { 1: ['Black', 'radial-gradient(circle at 35% 30%,#6a6a75,#25252b 55%,#050507)'], '-1': ['White', 'radial-gradient(circle at 35% 30%,#fff,#f1f1f5 55%,#9d9da8)'] },
      newGame, undo, draw, down, drop: () => {}, remote, load, ai: aiTurn, ply: () => hist.length, list: () => hist.map(h => h.enc),
      busy: () => now() < animEnd, started: () => hist.some(h => h.by === k.me && !h.pass)
    });
    const ctx = k.ctx;
    const X = i => FR + (i & 7) * SQ, Y = i => FR + (i >> 3) * SQ;
    const myTurn = () => !k.over && !thinking && k.local(E.side);

    function newGame() {
      E.reset();
      hist = []; last = -1; thinking = false; animEnd = 0; flipAt.fill(-1e9); dropAt.fill(-1e9);
      k.turnTo(E.side, k.mode === 'CPU' ? 'black goes first' : '');
      refresh();
    }
    function refresh() {
      k.hist(hist.map(h => h.txt));
      const a = E.count(1), b = E.count(-1);
      k.info(1, `${a} disc${a === 1 ? '' : 's'}`); k.info(-1, `${b} disc${b === 1 ? '' : 's'}`);
      legal = myTurn() ? E.moves(E.side) : [];
      k.setUndo(hist.some(h => !h.pass && (k.mode === '2P' || h.by === k.me)));
      k.dirty();
    }
    function aiTurn() {
      thinking = true; k.turn(-k.me, true); k.status('AI is thinking…');
      k.later(() => {
        const m = E.think(RV_AI[k.opt.diff]);
        thinking = false;
        if (m !== null) play(m);
      }, Math.max(420, animEnd - now() + 120));
    }
    function play(i, remote, quiet) {
      const by = E.side, n = hist.length, snap = E.snap(), fl = E.make(i), t0 = now();
      if (!quiet) {
        dropAt[i] = t0;
        for (const f of fl) flipAt[f] = t0 + 80 + Math.max(Math.abs((f >> 3) - (i >> 3)), Math.abs((f & 7) - (i & 7))) * 70;
        animEnd = Math.max(t0 + 260, ...fl.map(f => flipAt[f] + 340));
        api.sfx('pop');
        api.timeout(() => api.sfx('tick'), 160);
      }
      hist.push({ by, snap, i, enc: i, txt: rvName(i) });
      last = i;
      k.moved(n, i, remote);
      after(quiet);
    }
    function after(quiet) {
      if (!E.moves(E.side).length) {
        if (!E.moves(-E.side).length) {
          const me = k.me, a = E.count(me), b = E.count(-me);
          k.end(a > b ? me : a < b ? -me : 0, `Final count ${a}–${b}`, [[k.label(me), a], [k.label(-me), b]]);
          refresh();
          return;
        }
        if (!quiet) api.toast(k.has(E.side) + ' no legal moves · pass');
        hist.push({ by: E.side, pass: true, txt: 'pass', enc: -1 });
        E.make(-1);
      }
      k.turnTo(E.side);
      refresh();
    }
    function remote(n, i) {
      if (n < hist.length) return hist[n].enc === i;
      if (n !== hist.length || thinking || k.local(E.side) || !E.moves(E.side).includes(i)) return false;
      play(i, true);
      return true;
    }
    function load(list) {
      for (const i of list) { if (i < 0) continue; if (k.over || !E.moves(E.side).includes(i)) break; play(i, true, true); }
    }
    function undo() {
      const two = k.mode === '2P';
      if (k.over || k.mode === 'Online' || !hist.some(h => !h.pass && (two || h.by === k.me))) return;
      k.bump(); thinking = false;
      let h;
      while (hist.length) { h = hist.pop(); if (!h.pass && (two || h.by === k.me)) break; }
      E.restore(h.snap);
      const lh = [...hist].reverse().find(x => !x.pass);
      last = lh ? lh.i : -1;
      flipAt.fill(-1e9); dropAt.fill(-1e9); animEnd = 0;
      api.sfx('tick');
      k.turnTo(E.side);
      if (!two) k.status('Move taken back');
      refresh();
    }
    function down(cell) {
      if (!cell || !myTurn()) return 0;
      const i = cell.r * 8 + cell.c;
      if (legal.includes(i)) play(i);
      else if (!E.at(i)) { api.sfx('bad'); k.status('Not a legal move · try a dot', 'warn'); }
      return 0;
    }
    function draw() {
      const t = now();
      ctx.drawImage(tex, 0, 0, SZ, SZ);
      if (last >= 0) k.shade(X(last), Y(last), 'rgba(255,230,120,.16)');
      if (legal.length && t > animEnd - 150) {
        for (const i of legal) {
          const cx = X(i) + SQ / 2, cy = Y(i) + SQ / 2;
          ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.beginPath(); ctx.arc(cx, cy, SQ * .13, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, SQ * .13, 0, 7); ctx.stroke();
        }
      }
      for (let i = 0; i < 64; i++) {
        const v = E.at(i);
        if (!v) continue;
        const cx = X(i) + SQ / 2, cy = Y(i) + SQ / 2, z = SQ * 1.04;
        const du = clamp01((t - dropAt[i]) / 220), fu = clamp01((t - flipAt[i]) / 340);
        ctx.save(); ctx.translate(cx, cy);
        if (du < 1) { const s = 1.35 - .35 * easeIO(du); ctx.globalAlpha = Math.min(1, du * 2.5); ctx.scale(s, s); ctx.drawImage(spr[v], -z / 2, -z / 2, z, z); }
        else if (fu < 1) {
          const sx = Math.max(.04, Math.abs(Math.cos(fu * Math.PI))), lift = Math.sin(fu * Math.PI);
          ctx.translate(0, -lift * 8); ctx.scale(sx, 1 + lift * .08);
          ctx.drawImage(spr[fu < .5 ? -v : v], -z / 2, -z / 2, z, z);
        } else ctx.drawImage(spr[v], -z / 2, -z / 2, z, z);
        ctx.restore();
      }
      if (last >= 0 && t > dropAt[last] + 220) { ctx.fillStyle = '#ff5a4f'; ctx.beginPath(); ctx.arc(X(last) + SQ / 2, Y(last) + SQ / 2 - 3, 4.5, 0, 7); ctx.fill(); }
      k.drawCursor();
    }
    k.start();
  }

  Ameplay.register({
    id: 'chess',
    title: 'Chess',
    category: 'Board',
    blurb: 'Outwit a sharp chess AI with full rules, from opening to mate.',
    help: HELP,
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { chessEngine, START },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 56h28M21 50h22"/><path d="M23 50c0-7 3-12 8-16-4 1-9 2-12-1-2-2-1-5 1-7 4-4 7-9 9-14l1-6 4 5c9 2 14 10 14 22 0 6-1 11-2 17"/><circle cx="30" cy="20" r="1.6" fill="currentColor"/></svg>',
    css: kitCss('.gm-chess'),
    mount: mountChess
  });
  Ameplay.register({
    id: 'checkers',
    title: 'Checkers',
    category: 'Board',
    blurb: 'Jump, chain captures and crown kings against a crafty AI.',
    help: HELP,
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { checkersEngine },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="32" cy="44" rx="20" ry="8"/><path d="M12 44v-7M52 44v-7"/><ellipse cx="32" cy="36" rx="20" ry="8"/><path d="M24 35l-2-11 6 5 4-8 4 8 6-5-2 11z"/></svg>',
    css: kitCss('.gm-checkers'),
    mount: mountCheckers
  });
  Ameplay.register({
    id: 'reversi',
    title: 'Reversi',
    category: 'Board',
    blurb: 'Flank and flip discs to own the board in classic Othello.',
    help: 'Tap a dot to place a disc · arrows + <kbd>Enter</kbd> · <kbd>U</kbd> undo · <kbd>N</kbd> new game',
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { reversiEngine },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="48" height="48" rx="8"/><circle cx="23" cy="23" r="8"/><circle cx="41" cy="23" r="8" fill="currentColor"/><circle cx="23" cy="41" r="8" fill="currentColor"/><circle cx="41" cy="41" r="8"/></svg>',
    css: kitCss('.gm-reversi'),
    mount: mountReversi
  });
})();

