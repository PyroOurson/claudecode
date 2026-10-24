(() => {
  'use strict';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
  const easeOut = t => 1 - (1 - t) ** 3;
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const now = () => performance.now();
  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[ch]));
  const winsFmt = v => v + (v === 1 ? ' win' : ' wins');
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function grain(x, X, Y, W, H, base, lines, rand, vert, density) {
    x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
    x.fillStyle = base; x.fillRect(X, Y, W, H);
    const L = vert ? H : W, Tk = vert ? W : H, n = Math.round(Tk / (density || 1.5));
    for (let i = 0; i < n; i++) {
      const off = rand() * Tk, amp = .5 + rand() * 2.6, fq = .008 + rand() * .03, ph = rand() * 7;
      x.strokeStyle = lines[rand() * lines.length | 0];
      x.globalAlpha = .05 + rand() * .2; x.lineWidth = .35 + rand() * 1.5;
      x.beginPath();
      for (let a = -6; a <= L + 6; a += 6) {
        const q = off + Math.sin(a * fq + ph) * amp + Math.sin(a * fq * 3.1 + ph * 2) * amp * .35;
        if (vert) { if (a === -6) x.moveTo(X + q, Y + a); else x.lineTo(X + q, Y + a); }
        else if (a === -6) x.moveTo(X + a, Y + q); else x.lineTo(X + a, Y + q);
      }
      x.stroke();
    }
    x.restore();
  }
  function shadowEll(x, cx, cy, rx, ry, a) {
    x.save(); x.translate(cx, cy); x.scale(1, ry / rx);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(.6, `rgba(0,0,0,${a * .5})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore();
  }

  function audioKit(api) {
    let ac = null, nz = null, master = null;
    const ctx = () => {
      if (api.muted) return null;
      try {
        if (!ac) {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          nz = ac.createBuffer(1, ac.sampleRate * .3 | 0, ac.sampleRate);
          const q = nz.getChannelData(0);
          for (let i = 0; i < q.length; i++) q[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / q.length, 5);
          master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination);
        }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      } catch (e) { return null; }
    };
    const burst = (a, t, f, q, v, type) => {
      const s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
      s.buffer = nz; s.playbackRate.value = .8 + Math.random() * .4;
      bp.type = type || 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.value = v;
      s.connect(bp).connect(g).connect(master); s.start(t);
    };
    const tone = (a, t, f, f2, d, v, type) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(master); o.start(t); o.stop(t + d + .03);
    };
    return {
      prime: () => { ctx(); },
      stone(kind, vol) {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .004, v = vol || 1, p = kind === 2 ? 1.12 : 1;
        burst(a, t, 2300 * p, 1.2, .7 * v, 'bandpass');
        burst(a, t, 900 * p, .9, .35 * v, 'bandpass');
        tone(a, t, 520 * p, 300 * p, .09, .16 * v, 'triangle');
        tone(a, t + .004, 1500 * p, 900 * p, .035, .05 * v, 'sine');
      },
      capture(n) {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .03, k = Math.min(6, 1 + n);
        for (let i = 0; i < k; i++) {
          burst(a, t + i * .045 + Math.random() * .015, 1500 + Math.random() * 900, 1.1, .32, 'bandpass');
          tone(a, t + i * .045, 420 + Math.random() * 120, 260, .06, .06, 'triangle');
        }
      },
      pass() {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .01;
        tone(a, t, 660, 0, .35, .06, 'sine'); tone(a, t + .09, 495, 0, .4, .05, 'sine');
      },
      pencil(len) {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .004, n = Math.max(2, Math.min(5, len || 3));
        for (let i = 0; i < n; i++) burst(a, t + i * .028, 5200 + Math.random() * 1800, 2.4, .5, 'highpass');
        burst(a, t, 1100, .8, .18, 'bandpass');
      },
      ping(i, v) {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .004, f = 440 * Math.pow(2, [0, 2, 4, 7, 9, 12, 14, 16][i % 8] / 12);
        tone(a, t, f, 0, .5, .09 * (v || 1), 'sine'); tone(a, t, f * 2.01, 0, .25, .03 * (v || 1), 'sine');
      },
      win() {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .02;
        [0, 4, 7, 12].forEach((s, i) => tone(a, t + i * .1, 392 * Math.pow(2, s / 12), 0, .45, .08, 'sine'));
      },
      lose() {
        const a = ctx(); if (!a) return;
        const t = a.currentTime + .02;
        [0, -3, -7].forEach((s, i) => tone(a, t + i * .14, 330 * Math.pow(2, s / 12), 0, .45, .07, 'triangle'));
      },
      bad() {
        const a = ctx(); if (!a) return;
        tone(a, a.currentTime + .005, 180, 110, .16, .08, 'triangle');
      }
    };
  }

  const kitCss = (p, th) => `
${p}{--bg:${th.bg};--pn:${th.pn};--pn2:${th.pn2};--ink:${th.ink};--mut:${th.mut};--acc:${th.acc};--acc2:${th.acc2};--ln:${th.ln};--good:#4fbf7a;--bad:#e5645a;gap:12px;padding:12px;border-radius:16px;background:var(--bg);color:var(--ink);font-family:var(--sans)}
${p} .main{display:flex;gap:16px;justify-content:center;align-items:stretch;width:100%}
${p} .main>canvas{flex:none;align-self:flex-start;width:min(620px,calc(100% - 244px),calc(100dvh - 190px));min-width:240px;border-radius:12px;background:${th.cv};box-shadow:0 22px 44px -24px rgba(0,0,0,.7),0 4px 10px -4px rgba(0,0,0,.4);cursor:pointer;touch-action:none}
${p} .side{flex:1;max-width:228px;min-width:0;display:flex;flex-direction:column;gap:9px}
${p} .seg{display:flex;flex-wrap:wrap;padding:3px;gap:2px;border-radius:12px;background:var(--pn)}
${p} .seg button{flex:1 1 auto;min-width:0;border:0;background:none;padding:8px 6px;border-radius:9px;font:800 12.5px/1 var(--sans);color:var(--mut);cursor:pointer;white-space:nowrap;transition:background .2s,color .2s,box-shadow .2s}
${p} .seg button:hover{color:var(--ink)}
${p} .seg button.on{background:var(--acc);color:${th.accInk};box-shadow:0 2px 0 var(--acc2)}
${p} .seg button:disabled{opacity:.4;cursor:default}
${p} .fld{display:flex;flex-direction:column;gap:4px}
${p} .fld>label{font-size:10.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);padding-left:4px}
${p} details.setup{border-radius:12px;background:var(--pn);padding:0 8px 8px}
${p} details.setup>summary{cursor:pointer;list-style:none;padding:10px 4px 8px;font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);display:flex;justify-content:space-between;align-items:center}
${p} details.setup>summary::-webkit-details-marker{display:none}
${p} details.setup>summary::after{content:"";width:8px;height:8px;border-right:2px solid var(--mut);border-bottom:2px solid var(--mut);transform:rotate(45deg);margin:-4px 4px 0 0;transition:transform .2s}
${p} details.setup[open]>summary::after{transform:rotate(-135deg);margin-top:3px}
${p} details.setup .seg{background:var(--pn2)}
${p} details.setup .body{display:flex;flex-direction:column;gap:9px}
${p} .pcs{display:flex;flex-direction:column;gap:7px}
${p} .pc{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--pn);border:2px solid transparent;transition:border-color .25s,background .25s}
${p} .pc.on{background:var(--pn2);border-color:var(--acc)}
${p} .pc.out{opacity:.5}
${p} .chip{width:26px;height:26px;border-radius:50%;flex:none;box-shadow:inset 0 -3px 0 rgba(0,0,0,.22),0 2px 5px rgba(0,0,0,.4)}
${p} .pc div{min-width:0;flex:1}
${p} .pc b{display:block;font-weight:900;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${p} .pc small{display:block;min-height:16px;font-size:12px;font-weight:800;color:var(--mut);line-height:1.35}
${p} .pc em{font-style:normal;font:800 18px/1 var(--mono);color:var(--ink)}
${p} .dots{display:none;gap:3px}
${p} .pc.think .dots{display:flex}
${p} .dots i{width:6px;height:6px;border-radius:50%;background:var(--acc);animation:${p.slice(1)}-dot 1s infinite ease-in-out}
${p} .dots i:nth-child(2){animation-delay:.15s}
${p} .dots i:nth-child(3){animation-delay:.3s}
@keyframes ${p.slice(1)}-dot{0%,80%,100%{transform:scale(.5);opacity:.35}40%{transform:none;opacity:1}}
${p} .st{min-height:20px;text-align:center;font-weight:900;font-size:13.5px;line-height:1.35;color:var(--ink)}
${p} .st.win{color:var(--good)}
${p} .st.loss{color:var(--bad)}
${p} .st.warn{color:#ffb347}
${p} .st.turn{align-self:center;padding:4px 14px;border-radius:999px;background:var(--acc);color:${th.accInk};box-shadow:0 3px 0 var(--acc2)}
${p} .sub{min-height:16px;text-align:center;font-size:12px;font-weight:700;color:var(--mut)}
${p} .btns{display:flex;flex-wrap:wrap;gap:6px}
${p} .btns .g-btn{flex:1 1 40%;min-width:0;padding:0 8px;height:36px;font-size:13px;background:var(--acc);color:${th.accInk};border:0;box-shadow:0 3px 0 var(--acc2)}
${p} .btns .g-btn:hover{transform:translateY(-1px);background:var(--acc)}
${p} .btns .g-btn.ghost{background:var(--pn2);color:var(--ink);box-shadow:0 3px 0 rgba(0,0,0,.35)}
${p} .btns .g-btn:disabled{opacity:.4}
${p} .btns .g-btn[hidden]{display:none}
${p} .cn{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:800;color:var(--mut)}
${p} .cn i{width:8px;height:8px;border-radius:50%;background:var(--bad)}
${p} .cn.on i{background:var(--good);box-shadow:0 0 0 3px rgba(79,191,122,.22)}
${p} [hidden]{display:none!important}
@media (max-width:760px){
  ${p} .main{flex-direction:column;align-items:center;gap:12px}
  ${p} .main>canvas{width:min(100%,620px);min-width:0}
  ${p} .side{max-width:none;width:100%}
  ${p} .pcs{flex-direction:row}
  ${p} .pcs .pc{flex:1;min-width:0}
  ${p}{padding:8px}
}
@media (pointer:coarse){${p} .seg button{min-height:40px}${p} .btns .g-btn{height:42px}}`;
  const GO_EMPTY = 0, GO_B = 1, GO_W = 2, GO_WALL = 3;
  function goEngine() {
    const EMPTY = 0, BLK = 1, WHT = 2, WALL = 3;
    let seed = (Math.random() * 4294967296) >>> 0 || 1;
    const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
    const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

    function Pos(n) {
      const w = n + 2, S = w * w, D = [1, -1, w, -w], G = [w + 1, w - 1, 1 - w, -w - 1];
      const b = new Uint8Array(S), mS = new Int32Array(S), mL = new Int32Array(S), stk = new Int32Array(S), gp = new Int32Array(S);
      const el = new Int32Array(n * n), ep = new Int32Array(S).fill(-1), pts = new Int32Array(n * n);
      const seq = new Int32Array(n * n * 4 + 16), cand = new Int32Array(10), mk = new Int32Array(S);
      let st = 0, gn = 0, lastLib = -1, mst = 0;
      for (let r = 0, i = 0; r < n; r++) for (let c = 0; c < n; c++) pts[i++] = (r + 1) * w + c + 1;
      const P = { n, w, S, b, el, ep, pts, seq, ne: 0, ko: -1, last: -1, turn: BLK, caps: [0, 0, 0], num: 0, passes: 0, rec: null, sn: 0, log: false };
      P.pt = (r, c) => (r + 1) * w + c + 1;
      P.row = p => Math.floor(p / w) - 1;
      P.col = p => p % w - 1;
      P.reset = () => {
        b.fill(WALL); ep.fill(-1); P.ne = 0;
        for (let i = 0; i < pts.length; i++) { const p = pts[i]; b[p] = EMPTY; el[P.ne] = p; ep[p] = P.ne++; }
        P.ko = -1; P.last = -1; P.turn = BLK; P.caps = [0, 0, 0]; P.num = 0; P.passes = 0; P.sn = 0;
      };
      P.put = (p, c) => {
        if (b[p] !== EMPTY) return;
        b[p] = c;
        const i = ep[p], q = el[--P.ne];
        el[i] = q; ep[q] = i; ep[p] = -1;
      };
      P.copyFrom = o => {
        b.set(o.b); el.set(o.el); ep.set(o.ep);
        P.ne = o.ne; P.ko = o.ko; P.last = o.last; P.turn = o.turn; P.caps = o.caps.slice(); P.num = o.num; P.passes = o.passes; P.sn = 0;
      };
      P.key = () => b.join('');
      const groupInfo = (p, cap) => {
        const c = b[p];
        st++;
        let sp = 0, lib = 0;
        gn = 0;
        stk[sp++] = p; mS[p] = st;
        while (sp) {
          const q = stk[--sp];
          gp[gn++] = q;
          for (let k = 0; k < 4; k++) {
            const r = q + D[k], v = b[r];
            if (v === EMPTY) { if (mL[r] !== st) { mL[r] = st; lib++; lastLib = r; } }
            else if (v === c && mS[r] !== st) { mS[r] = st; stk[sp++] = r; }
          }
          if (cap && lib >= cap) break;
        }
        return lib;
      };
      P.libs = p => groupInfo(p, 0);
      P.group = p => { groupInfo(p, 0); return Array.from(gp.subarray(0, gn)); };
      P.lastLib = () => lastLib;
      const play = (p, c) => {
        if (b[p] !== EMPTY || p === P.ko) return false;
        const e = 3 - c;
        let cap = 0, cp = -1;
        b[p] = c;
        for (let k = 0; k < 4; k++) {
          const r = p + D[k];
          if (b[r] === e && groupInfo(r, 1) === 0) {
            cap += gn; cp = r;
            for (let i = 0; i < gn; i++) {
              const q = gp[i];
              b[q] = EMPTY; el[P.ne] = q; ep[q] = P.ne++;
              if (P.rec) P.rec.push(q);
            }
          }
        }
        let ec = 0, fr = 0;
        for (let k = 0; k < 4; k++) { const v = b[p + D[k]]; if (v === EMPTY) ec++; else if (v === c) fr++; }
        if (ec === 0 && (!fr || groupInfo(p, 1) === 0)) { b[p] = EMPTY; return false; }
        const i = ep[p], q = el[--P.ne];
        el[i] = q; ep[q] = i; ep[p] = -1;
        P.ko = cap === 1 && fr === 0 && ec === 1 ? cp : -1;
        P.caps[c] += cap; P.turn = e; P.last = p; P.num++; P.passes = 0;
        if (P.sn < seq.length) seq[P.sn++] = (p << 2) | c;
        return true;
      };
      const pass = () => {
        if (P.sn < seq.length) seq[P.sn++] = P.turn;
        P.turn = 3 - P.turn; P.ko = -1; P.last = -1; P.num++; P.passes++;
      };
      P.play = play; P.pass = pass;
      const isEye = (p, c) => {
        for (let k = 0; k < 4; k++) { const v = b[p + D[k]]; if (v !== c && v !== WALL) return false; }
        let bad = 0;
        for (let k = 0; k < 4; k++) { const v = b[p + G[k]]; if (v === WALL) bad++; else if (v === 3 - c) bad++; }
        return bad < 2;
      };
      P.isEye = isEye;
      P.legal = (p, c) => {
        if (b[p] !== EMPTY || p === P.ko) return false;
        for (let k = 0; k < 4; k++) { if (b[p + D[k]] === EMPTY) return true; }
        b[p] = c;
        let ok = false;
        for (let k = 0; k < 4 && !ok; k++) { const r = p + D[k]; if (b[r] === 3 - c && groupInfo(r, 1) === 0) ok = true; }
        if (!ok) ok = groupInfo(p, 1) > 0;
        b[p] = EMPTY;
        return ok;
      };
      const atari = r => {
        let e = 0;
        for (let k = 0; k < 4; k++) if (b[r + D[k]] === EMPTY && ++e > 1) return false;
        return groupInfo(r, 2) === 1;
      };
      const policy = () => {
        const c = P.turn, e = 3 - c, l = P.last;
        if (l >= 0) {
          let nc = 0;
          if (atari(l)) cand[nc++] = lastLib;
          for (let k = 0; k < 4; k++) {
            const r = l + D[k], v = b[r];
            if ((v === e || v === c) && nc < 8 && atari(r)) cand[nc++] = lastLib;
          }
          if (nc && rnd() < 0.9) {
            const s = (rnd() * nc) | 0;
            for (let t = 0; t < nc; t++) {
              const q = cand[(s + t) % nc];
              if (!isEye(q, c) && play(q, c)) return q;
            }
          }
        }
        const ne = P.ne;
        if (!ne) return -1;
        let i = (rnd() * ne) | 0;
        for (let t = 0; t < ne; t++, i = i + 1 === ne ? 0 : i + 1) {
          const p = el[i];
          if (isEye(p, c)) continue;
          if (play(p, c)) return p;
        }
        return -1;
      };
      P.policy = policy;
      const area = own => {
        st++;
        let B = 0, Wc = 0;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i], v = b[p];
          if (v === BLK) { B++; if (own) own[p] = BLK; }
          else if (v === WHT) { Wc++; if (own) own[p] = WHT; }
          else if (mS[p] !== st) {
            let sp = 0, sz = 0, fl = 0;
            stk[sp++] = p; mS[p] = st;
            const first = gn;
            gn = 0;
            while (sp) {
              const q = stk[--sp];
              gp[gn++] = q; sz++;
              for (let k = 0; k < 4; k++) {
                const r = q + D[k], u = b[r];
                if (u === EMPTY) { if (mS[r] !== st) { mS[r] = st; stk[sp++] = r; } }
                else if (u !== WALL) fl |= u;
              }
            }
            if (fl === BLK) B += sz; else if (fl === WHT) Wc += sz;
            if (own) { const o = fl === BLK ? BLK : fl === WHT ? WHT : 0; for (let j = 0; j < gn; j++) own[gp[j]] = o; }
          }
        }
        return B - Wc;
      };
      P.area = area;
      P.playout = maxLen => {
        let ps = 0;
        for (let m = 0; m < maxLen; m++) {
          const p = policy();
          if (p < 0) { pass(); if (++ps >= 2) break; } else ps = 0;
        }
        return area();
      };
      P.mark = () => ++mst;
      P.mk = mk;
      P.init = () => P.reset();
      P.reset();
      return P;
    }

    const prior = (P, p, last) => {
      const n = P.n, r = P.row(p), c = P.col(p), d = Math.min(r, c, n - 1 - r, n - 1 - c);
      let v = d === 0 ? 0.22 : d === 1 ? 0.42 : 0.5;
      if (last >= 0) { const m = Math.abs(P.row(last) - r) + Math.abs(P.col(last) - c); if (m <= 2) v += 0.12; }
      return v;
    };

    function nearStone(P, p, rad) {
      const n = P.n, r = P.row(p), c = P.col(p);
      for (let dr = -rad; dr <= rad; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= n) continue;
        for (let dc = -rad; dc <= rad; dc++) {
          const cc = c + dc;
          if (cc < 0 || cc >= n) continue;
          if (P.b[P.pt(rr, cc)] === GO_B || P.b[P.pt(rr, cc)] === GO_W) return true;
        }
      }
      return false;
    }

    function bookMove(P) {
      const n = P.n, e = n >= 13 ? 3 : 2, f = n - 1 - e, m = (n - 1) >> 1;
      const L = n === 9 ? [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]] : [[e, e], [e, f], [f, e], [f, f], [e, e], [e, f], [f, e], [f, f], [m, m]];
      for (let t = 0; t < 12; t++) {
        const [r, c] = L[(rnd() * L.length) | 0], p = P.pt(r, c);
        if (P.b[p] === EMPTY) return p;
      }
      return -2;
    }

    function terrMask(P, c, maxSize) {
      const m = new Uint8Array(P.S), seen = new Uint8Array(P.S), b = P.b, w = P.w;
      for (let i = 0; i < P.pts.length; i++) {
        const p = P.pts[i];
        if (b[p] !== GO_EMPTY || seen[p]) continue;
        const st = [p], reg = [];
        let fl = 0;
        seen[p] = 1;
        while (st.length) {
          const q = st.pop();
          reg.push(q);
          for (const d of [1, -1, w, -w]) {
            const r = q + d, u = b[r];
            if (u === GO_EMPTY) { if (!seen[r]) { seen[r] = 1; st.push(r); } }
            else if (u !== GO_WALL) fl |= u;
          }
        }
        if (fl === c && reg.length <= maxSize) for (const q of reg) m[q] = 1;
      }
      return m;
    }

    function Search(root, o) {
      const n = root.n, P = Pos(n), me = root.turn, komi = o.komi || 0;
      const sparse = n >= 13;
      const R = { mv: -2, par: null, color: 3 - me, n: 0, w: 0, ch: null, rn: 0, rw: 0, prior: .5 };
      const maxLen = n * n * 2;
      const passOk = !!o.passOk;
      let playouts = 0, t0 = clock(), done = false, wins = 0;
      const expand = (node, last) => {
        const ch = [];
        const c = P.turn, ne = P.ne, tm = o.japanese ? terrMask(P, c, n * 3) : null;
        for (let i = 0; i < ne; i++) {
          const p = P.el[i];
          if (p === P.ko || P.isEye(p, c) || (tm && tm[p])) continue;
          if (sparse && P.num > 0 && !nearStone(P, p, 2)) continue;
          ch.push({ mv: p, par: node, color: c, n: 0, w: 0, ch: null, rn: 0, rw: 0, prior: prior(P, p, last) });
        }
        if (node === R && passOk) ch.push({ mv: -1, par: node, color: c, n: 0, w: 0, ch: null, rn: 0, rw: 0, prior: o.oppPassed ? .62 : .3 });
        node.ch = ch;
      };
      const select = node => {
        const N = node.n + 1, beta = Math.sqrt(400 / (3 * N + 400)), lg = Math.log(N + 1);
        let best = null, bv = -1;
        const ch = node.ch;
        for (let i = 0; i < ch.length; i++) {
          const c = ch[i];
          const q = c.n ? c.w / c.n : c.prior, rq = c.rn ? c.rw / c.rn : q;
          const v = beta * rq + (1 - beta) * q + 0.1 * Math.sqrt(lg / (c.n + 1));
          if (v > bv) { bv = v; best = c; }
        }
        return best;
      };
      const iterate = () => {
        P.copyFrom(root);
        let node = R;
        const path = [R];
        while (node.ch && node.ch.length) {
          const c = select(node);
          if (c.mv === -1) P.pass();
          else if (!P.play(c.mv, P.turn)) {
            const i = node.ch.indexOf(c);
            node.ch.splice(i, 1);
            continue;
          }
          node = c; path.push(c);
        }
        if (!node.ch && (node.n >= 5 || node === R) && P.passes < 2) expand(node, P.last);
        const res = P.playout(maxLen) - komi;
        const winner = res > 0 ? BLK : WHT;
        const SN = P.sn, seq = P.seq;
        for (let i = 0; i < path.length; i++) {
          const nd = path[i];
          nd.n++;
          if (winner === nd.color) nd.w++;
          if (nd.ch && i < 14) {
            const mover = 3 - nd.color, stamp = ++rv.s;
            for (let j = i; j < SN; j++) { const v = seq[j]; if (v >= 4 && (v & 3) === mover) rv.m[v >> 2] = stamp; }
            const win = winner === mover;
            for (let k = 0; k < nd.ch.length; k++) { const c = nd.ch[k]; if (c.mv >= 0 && rv.m[c.mv] === stamp) { c.rn++; if (win) c.rw++; } }
          }
        }
        if (winner === me) wins++;
        playouts++;
      };
      const rv = { s: 0, m: new Int32Array(P.S) };
      const finished = () => playouts >= o.maxPlayouts || clock() - t0 >= o.maxMs;
      const api = {
        step(ms) {
          if (done) return true;
          const s = clock();
          do { for (let k = 0; k < 8; k++) iterate(); } while (clock() - s < ms && !finished());
          if (finished()) done = true;
          return done;
        },
        get playouts() { return playouts; },
        get done() { return done; },
        result() {
          const ch = R.ch || [];
          let best = null, pass = null;
          for (const c of ch) { if (c.mv === -1) pass = c; if (!best || c.n > best.n) best = c; }
          const wr = c => c && c.n ? c.w / c.n : 0;
          let move = best ? best.mv : -1, win = best ? wr(best) : wins / Math.max(1, playouts);
          if (pass && best !== pass && o.oppPassed && pass.n >= 10 && wr(pass) >= wr(best) - 0.04) { move = -1; win = wr(pass); }
          if (o.canResign && playouts >= 300 && win < 0.03 && R.n >= 300) move = -3;
          return { move, winrate: win, visits: best ? best.n : 0, playouts, root: wins / Math.max(1, playouts) };
        }
      };
      return api;
    }

    function quickMove(root, level) {
      const P = Pos(root.n), c = root.turn, e = 3 - c, n = root.n;
      let best = -1, bv = -1e9;
      const T = Pos(n);
      const ne = root.ne;
      for (let i = 0; i < ne; i++) {
        const p = root.el[i];
        if (!root.legal(p, c)) continue;
        if (root.isEye(p, c) && root.num > 0) continue;
        T.copyFrom(root);
        T.play(p, c);
        const caps = T.caps[c] - root.caps[c];
        let v = rnd() * (level ? 1.2 : 4);
        v += caps * 6;
        const l = T.libs(p);
        if (l === 1 && !caps) v -= 7;
        let esc = 0, atk = 0;
        for (const k of [1, -1, root.w, -root.w]) {
          const r = p + k, u = root.b[r];
          if (u === c && root.libs(r) === 1) esc += 3;
          if (u === e) { const ll = root.libs(r); if (ll === 1) atk += 4; else if (ll === 2) atk += 1.2; }
        }
        v += esc + atk;
        const row = root.row(p), col = root.col(p), d = Math.min(row, col, n - 1 - row, n - 1 - col);
        v += d === 0 ? -2.5 : d === 1 ? -0.5 : 0.8;
        if (root.last >= 0) { const m = Math.abs(root.row(root.last) - row) + Math.abs(root.col(root.last) - col); if (m <= 2) v += 1.6; else if (m <= 4) v += 0.5; }
        if (!nearStone(root, p, 2) && root.num > 4) v -= 2;
        if (v > bv) { bv = v; best = p; }
      }
      return best;
    }

    function Estimate(root, o) {
      const n = root.n, P = Pos(n), own = new Uint8Array(root.S), sum = new Int32Array(root.S);
      let count = 0, t0 = clock();
      const total = o.playouts, maxMs = o.maxMs;
      return {
        step(ms) {
          const s = clock();
          while (count < total && clock() - s < ms && clock() - t0 < maxMs) {
            P.copyFrom(root);
            P.playout(n * n * 2);
            P.area(own);
            for (let i = 0; i < P.pts.length; i++) { const p = P.pts[i]; sum[p] += own[p] === BLK ? 1 : own[p] === WHT ? -1 : 0; }
            count++;
          }
          return count >= total || clock() - t0 >= maxMs;
        },
        get count() { return count; },
        dead() {
          const dead = [];
          if (!count) return dead;
          const seen = new Set();
          for (let i = 0; i < root.pts.length; i++) {
            const p = root.pts[i], c = root.b[p];
            if (c !== BLK && c !== WHT || seen.has(p)) continue;
            const g = root.group(p);
            let tot = 0;
            for (const q of g) { seen.add(q); tot += sum[q] / count * (c === BLK ? 1 : -1); }
            if (tot / g.length < -0.3) dead.push(...g);
          }
          return dead;
        }
      };
    }

    const handiPts = (n, k) => {
      const e = n >= 13 ? 3 : 2, f = n - 1 - e, m = (n - 1) >> 1;
      const TR = [e, f], BL = [f, e], BR = [f, f], TL = [e, e], L = [m, e], Rt = [m, f], T = [e, m], Bt = [f, m], C = [m, m];
      const orders = { 2: [TR, BL], 3: [TR, BL, BR], 4: [TR, BL, BR, TL], 5: [TR, BL, BR, TL, C], 6: [TR, BL, BR, TL, L, Rt], 7: [TR, BL, BR, TL, L, Rt, C], 8: [TR, BL, BR, TL, L, Rt, T, Bt], 9: [TR, BL, BR, TL, L, Rt, T, Bt, C] };
      return orders[k] || [];
    };
    const maxHandi = n => n === 9 ? 5 : 9;
    const starPts = n => {
      const e = n >= 13 ? 3 : 2, f = n - 1 - e, m = (n - 1) >> 1;
      if (n === 9) return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];
      return n === 13 ? [[e, e], [e, f], [f, e], [f, f], [m, m]] : [[e, e], [e, m], [e, f], [m, e], [m, m], [m, f], [f, e], [f, m], [f, f]];
    };

    function Game(cfg) {
      const n = cfg.n, P = Pos(n), T = Pos(n), num = new Int16Array(P.S), dead = new Uint8Array(P.S), first = cfg.handi > 1 ? WHT : BLK;
      let moves = [], phase = 'play', res = null, seen = new Set(), done = [false, false, false], handi = [];
      const reset = () => {
        P.reset(); num.fill(0); dead.fill(0); moves = []; phase = 'play'; res = null; seen = new Set(); done = [false, false, false]; handi = [];
        if (cfg.handi > 1) for (const [r, c] of handiPts(n, Math.min(cfg.handi, maxHandi(n)))) { const p = P.pt(r, c); P.put(p, BLK); handi.push(p); }
        P.turn = first;
        seen.add(P.key());
      };
      const legal = p => {
        if (phase !== 'play' || P.b[p] !== EMPTY || p === P.ko) return false;
        T.copyFrom(P);
        if (!T.play(p, P.turn)) return false;
        if (cfg.rules === 'C' && seen.has(T.key())) return false;
        return true;
      };
      const play = p => {
        if (!legal(p)) return null;
        const c = P.turn;
        P.rec = [];
        P.play(p, c);
        const caps = P.rec;
        P.rec = null;
        for (const q of caps) num[q] = 0;
        num[p] = moves.length + 1;
        moves.push(p);
        seen.add(P.key());
        return { color: c, caps, p };
      };
      const pass = () => {
        if (phase !== 'play') return null;
        const c = P.turn;
        moves.push(-1);
        P.pass();
        if (moves.length >= 2 && moves[moves.length - 1] === -1 && moves[moves.length - 2] === -1) { phase = 'mark'; done = [false, false, false]; }
        return { color: c, pass: true, phase };
      };
      const score = () => {
        const b2 = P.b.slice(), w = P.w, terr = new Uint8Array(P.S);
        let deadB = 0, deadW = 0, sB = 0, sW = 0, tB = 0, tW = 0;
        for (let i = 0; i < P.pts.length; i++) {
          const p = P.pts[i];
          if (dead[p] && (b2[p] === GO_B || b2[p] === GO_W)) { if (b2[p] === GO_B) deadB++; else deadW++; b2[p] = 0; }
        }
        const mark = new Uint8Array(P.S);
        for (let i = 0; i < P.pts.length; i++) {
          const p = P.pts[i], v = b2[p];
          if (v === GO_B) sB++;
          else if (v === GO_W) sW++;
          else if (!mark[p]) {
            const st = [p], reg = [];
            let fl = 0;
            mark[p] = 1;
            while (st.length) {
              const q = st.pop();
              reg.push(q);
              for (const d of [1, -1, w, -w]) {
                const r = q + d, u = b2[r];
                if (u === 0) { if (!mark[r]) { mark[r] = 1; st.push(r); } }
                else if (u === GO_B || u === GO_W) fl |= u;
              }
            }
            if (fl === GO_B) { tB += reg.length; for (const q of reg) terr[q] = GO_B; }
            else if (fl === GO_W) { tW += reg.length; for (const q of reg) terr[q] = GO_W; }
          }
        }
        const jp = cfg.rules !== 'C';
        const bt = jp ? tB + P.caps[GO_B] + deadW : sB + tB, wt = (jp ? tW + P.caps[GO_W] + deadB : sW + tW) + cfg.komi;
        return { b: { stones: sB, terr: tB, prisoners: P.caps[GO_B] + deadW, dead: deadB, total: bt }, w: { stones: sW, terr: tW, prisoners: P.caps[GO_W] + deadB, dead: deadW, total: wt }, diff: bt - wt, winner: bt > wt ? GO_B : bt < wt ? GO_W : 0, terr, komi: cfg.komi, rules: cfg.rules };
      };
      const finish = () => {
        const s = score();
        phase = 'over';
        res = { winner: s.winner, by: 'score', diff: s.diff, score: { b: s.b, w: s.w, komi: s.komi, rules: s.rules } };
        return res;
      };
      const toggle = p => {
        const v = P.b[p];
        if (phase !== 'mark' || (v !== GO_B && v !== GO_W)) return false;
        const g = P.group(p), nv = dead[p] ? 0 : 1;
        for (const q of g) dead[q] = nv;
        done = [false, false, false];
        return true;
      };
      const setDead = list => { dead.fill(0); for (const q of list) dead[q] = 1; done = [false, false, false]; };
      const resume = () => { if (phase !== 'mark') return false; phase = 'play'; dead.fill(0); done = [false, false, false]; return true; };
      const resign = c => { phase = 'over'; res = { winner: 3 - c, by: 'resign' }; return res; };
      const rebuild = list => {
        reset();
        for (const p of list) {
          const c = P.turn;
          if (p < 0) { moves.push(-1); P.pass(); }
          else { P.rec = []; P.play(p, c); for (const q of P.rec) num[q] = 0; P.rec = null; num[p] = moves.length + 1; moves.push(p); seen.add(P.key()); }
        }
        if (moves.length >= 2 && moves[moves.length - 1] === -1 && moves[moves.length - 2] === -1) phase = 'mark';
      };
      const undo = k => { const l = moves.slice(0, Math.max(0, moves.length - k)); rebuild(l); };
      const save = () => ({ mv: moves.slice(), phase, dead: Array.from(P.pts).filter(p => dead[p]), done: done.slice(), res: res ? JSON.parse(JSON.stringify(res)) : null });
      const load = s => {
        rebuild(s.mv);
        phase = s.phase; res = s.res; done = s.done.slice();
        dead.fill(0);
        for (const p of s.dead) dead[p] = 1;
      };
      reset();
      return {
        cfg, P, num, dead, first, reset, legal, play, pass, score, finish, toggle, setDead, resume, resign, undo, save, load, rebuild,
        get moves() { return moves; }, get phase() { return phase; }, set phase(v) { phase = v; }, get res() { return res; }, set res(v) { res = v; },
        get done() { return done; }, set done(v) { done = v; }, get handi() { return handi; },
        colorAt: i => (first === BLK ? (i % 2 ? WHT : BLK) : (i % 2 ? BLK : WHT))
      };
    }

    const params = [
      { name: 'Beginner', rank: '25 kyu', playouts: 0, ms: 0 },
      { name: 'Easy', rank: '18 kyu', playouts: 220, ms: 1200 },
      { name: 'Medium', rank: '12 kyu', playouts: 3000, ms: 3000 },
      { name: 'Hard', rank: '7 kyu', playouts: 14000, ms: 6000 },
      { name: 'Expert', rank: '3 kyu', playouts: 60000, ms: 12000 }
    ];

    return { Pos, Game, Search, Estimate, quickMove, bookMove, handiPts, maxHandi, starPts, params, rnd };
  }
  function stoneShell(root, api, S) {
    const saved = api.load() || {};
    const opt = {};
    const fields = [{ key: 'mode', label: '', def: 'ai', opts: () => [['ai', 'vs AI'], ['online', 'Online']] }, ...S.fields];
    const optVal = (f, v) => { const o = f.opts(opt).find(x => String(x[0]) === String(v)); return o ? o[0] : undefined; };
    for (const f of fields) { const v = optVal(f, saved[f.key]); opt[f.key] = v !== undefined ? v : f.def; }
    if (coarse()) root.classList.add('touch');
    const touch = () => root.classList.contains('touch');
    const main = el('div', 'main');
    root.append(main);
    const cv = api.canvas(S.SZ, S.SZ, main), cvs = cv.canvas;
    cvs.style.width = '';
    const side = el('div', 'side');
    main.append(side);
    side.innerHTML = '<div class="seg" data-k="mode" role="radiogroup"></div><div class="cn" hidden><i></i><span></span></div>'
      + '<div class="pcs">' + [0, 1].map(() => '<div class="pc"><i class="chip"></i><div><b></b><small></small></div><span class="dots"><i></i><i></i><i></i></span></div>').join('') + '</div>'
      + '<div class="st" role="status"></div><div class="sub"></div><div class="btns"></div>'
      + '<details class="setup"><summary>Game setup</summary><div class="body"></div></details>';
    const q = s => side.querySelector(s);
    const modeSeg = q('.seg[data-k="mode"]'), cn = q('.cn'), cards = [...side.querySelectorAll('.pc')], stEl = q('.st'), subEl = q('.sub'), btnsEl = q('.btns'), setup = q('details.setup'), body = q('.body');
    if (innerWidth > 760 || root.clientWidth > 700) setup.open = true;
    for (const f of S.fields) {
      const w = el('div', 'fld', `<label>${f.label}</label><div class="seg" data-k="${f.key}" role="radiogroup"></div>`);
      w.dataset.k = f.key;
      body.append(w);
    }
    const N = { role: null, live: false, round: 0, hostColor: 1, myRe: false, theirRe: false, hooked: false, names: {}, tok: 0 };
    let model = null, me = 1, over = false, gen = 0, ai = null, ovUp = false, streak = 0, hover = -1, cursor = -1, drag = null, dirtyF = true, pending = false, sure = false, lastMode = opt.mode, aiInfo = '', started = false;
    const online = () => opt.mode === 'online';
    const guest = () => online() && N.role === 'guest';
    const hostRole = () => online() && N.role === 'host';
    const aiColor = () => 3 - me;
    const send = m => api.net.send(m);
    const sh = {
      api, opt, S, au: S.audio,
      get model() { return model; }, get me() { return me; }, get over() { return over; }, get thinking() { return !!ai; }, get hover() { return hover; }, get cursor() { return cursor; },
      get drag() { return drag; }, get touch() { return touch(); }, get online() { return online(); }, get guest() { return guest(); }, get streak() { return streak; },
      dirty() { dirtyF = true; },
      later(fn, ms) { const g = gen; api.timeout(() => { if (g === gen) fn(); }, ms); },
      status: (t, cls) => { stEl.textContent = t; stEl.className = 'st' + (cls ? ' ' + cls : ''); },
      sub: t => { subEl.textContent = t || ''; },
      act: a => perform(me, a),
      actAs: (c, a) => perform(c, a),
      refresh: () => afterAct(false),
      setPending: v => { pending = v; paintSub(); },
      aiInfo: t => { aiInfo = t; }
    };
    const nameOf = c => {
      if (online()) return N.names[c] || (c === me ? 'You' : 'Opponent');
      return c === me ? 'You' : 'AI · ' + S.aiName(opt);
    };
    const paintSegs = () => {
      for (const f of fields) {
        const seg = f.key === 'mode' ? modeSeg : side.querySelector(`.seg[data-k="${f.key}"]`);
        const list = f.opts(opt);
        if (!list.some(o => String(o[0]) === String(opt[f.key]))) opt[f.key] = list[0][0];
        const sig = list.map(o => o[0] + ':' + o[1]).join('|');
        if (seg.dataset.sig !== sig) { seg.dataset.sig = sig; seg.innerHTML = list.map(([v, t]) => `<button type="button" role="radio" data-v="${v}">${t}</button>`).join(''); }
        seg.querySelectorAll('button').forEach(b => { const on = String(opt[f.key]) === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
        if (f.key !== 'mode') {
          const w = body.querySelector(`.fld[data-k="${f.key}"]`);
          w.hidden = !!(f.when && !f.when(opt)) || (guest() && !f.live);
        }
      }
    };
    const paintSub = () => {
      let t = '';
      if (guest()) t = 'The host picks the game settings';
      else if (pending) t = 'Setup changes apply to the next game';
      else if (ai && aiInfo) t = aiInfo;
      subEl.textContent = t;
    };
    const conn = () => {
      const on = !!N.role && api.net.connected;
      cn.classList.toggle('on', on);
      cn.lastChild.textContent = on ? 'Connected' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '') : N.role ? 'Reconnecting…' : 'Not connected';
    };
    const paintCards = () => {
      if (!model) return;
      const mine = cards[0], theirs = cards[1], t = model.turnColor ? model.turnColor() : 0;
      [[mine, me], [theirs, 3 - me]].forEach(([c, col]) => {
        c.querySelector('b').textContent = nameOf(col);
        c.querySelector('.chip').style.background = S.chip[col];
        c.querySelector('small').innerHTML = S.cardSub(model, col);
        c.classList.toggle('on', !over && t === col);
        c.classList.toggle('think', !over && !!ai && col === aiColor());
      });
    };
    const paintButtons = () => {
      let list;
      if (over) list = online() ? [['rematch', N.myRe ? 'Waiting…' : N.theirRe ? 'Accept rematch' : 'Rematch', { dis: N.myRe || !N.live }], N.role === 'host' ? ['lobby', 'Lobby', {}] : ['leave', 'Leave', { ghost: 1 }]] : [['new', 'New game', {}]];
      else list = S.buttons({ model, me, online: online(), guest: guest(), ai: !online(), sure, thinking: !!ai, live: !online() || N.live, pending });
      if (online() && !over && !N.live) list = [['leave', 'Leave', { ghost: 1 }]];
      btnsEl.innerHTML = list.map(([id, t, o]) => `<button type="button" class="g-btn sm${o && o.ghost ? ' ghost' : ''}" data-b="${id}"${o && o.dis ? ' disabled' : ''}>${t}</button>`).join('');
    };
    const paint = () => {
      paintSegs(); paintSub();
      cn.hidden = !online();
      if (online()) conn();
      paintCards(); paintButtons();
    };
    function setStatus() {
      if (!model || over) return;
      if (online() && !N.live) { sh.status(N.role ? 'Waiting for the host…' : 'Opening the lobby…'); return; }
      const s = S.status(model, { me, online: online(), thinking: !!ai, ai: !online() });
      sh.status(s[0], s[1]);
    }
    function afterAct(initial) {
      if (!model) return;
      setStatus(); paint(); dirtyF = true;
      if (model.phase() === 'over' && !over) { end(); return; }
      if (S.after) S.after(sh, initial);
      if (!online() && !over && !ai && S.aiNeeded(model, aiColor())) startAI();
    }
    function cancelAI() { if (ai) { try { ai.cancel(); } catch (e) {} } ai = null; aiInfo = ''; }
    function startAI() {
      cancelAI();
      const g = gen, col = aiColor();
      ai = S.ai(model, col, opt, a => {
        if (g !== gen || over) return;
        ai = null; aiInfo = '';
        perform(col, a);
        paintCards();
      }, sh);
      paintCards(); setStatus(); paintSub();
    }
    function perform(color, a) {
      if (over || !model) return false;
      if (guest()) { if (!N.live) return false; send({ t: 'act', a }); return true; }
      if (online() && !N.live) return false;
      const r = model.act(color, a);
      if (!r) return false;
      started = true;
      S.fx(sh, r, color, a);
      if (hostRole()) send(snapMsg());
      afterAct(false);
      return true;
    }
    function end() {
      if (over) return;
      over = true; gen++; cancelAI(); drag = null; sure = false;
      const r = S.result(model, me), md = online() ? 'online' : 'ai', mine = r.winner === me, draw = !r.winner;
      let best = false;
      if (md === 'ai') { if (mine) { streak++; best = api.submit(streak); } else if (!draw) streak = 0; api.score(streak); }
      sh.status((draw ? 'Draw' : mine ? 'You win' : (md === 'online' ? nameOf(r.winner) : 'AI') + ' wins') + ' · ' + r.why, mine ? 'win' : draw ? '' : 'loss');
      paint(); dirtyF = true;
      api.timeout(() => S.audio[draw ? 'pass' : mine ? 'win' : 'lose'](), 250);
      const g = gen;
      api.timeout(() => {
        if (g !== gen || !over) return;
        ovUp = true;
        api.overlay({
          kicker: best ? 'New best!' : mine ? 'Victory' : draw ? 'Draw' : 'Defeat',
          title: draw ? 'Draw game' : mine ? 'You win!' : md === 'online' ? esc(nameOf(r.winner)) + ' wins' : 'AI wins',
          text: r.text + (md === 'ai' ? (mine ? ` Win streak: ${winsFmt(streak)}.` : draw ? '' : ' Your win streak resets.') : ''),
          stats: r.stats || [],
          button: md === 'online' ? 'Rematch' : 'Play again',
          onAction: () => { ovUp = false; if (md === 'online') rematch(); else newGame(); },
          secondary: 'View board', onSecondary: () => { ovUp = false; }
        });
      }, r.delay || 1100);
    }
    function pickSide() { return opt.side === 'white' ? 2 : opt.side === 'random' ? 1 + (Math.random() < .5 ? 1 : 0) : 1; }
    function newGame(m) {
      if (!online() && model && !over && started && S.ranked && S.ranked(model)) { if (streak) api.toast('Resigned · streak reset'); streak = 0; }
      cancelAI(); gen++; over = false; ovUp = false; drag = null; hover = -1; sure = false; pending = false; started = false;
      api.hideOverlay();
      model = S.newModel(S.cfgOf(opt));
      me = m || (online() ? 1 : pickSide());
      N.myRe = N.theirRe = false;
      api.score(online() ? '—' : streak);
      if (S.start) S.start(sh);
      afterAct(true);
    }
    function snapMsg() { return { t: 'snap', r: N.round, hc: N.hostColor, cfg: S.cfgOf(opt), m: model.save(), re: [N.myRe, N.theirRe], names: N.names }; }
    function startRound() {
      N.round++; N.live = true;
      N.hostColor = N.round === 1 ? pickSide() : 3 - N.hostColor;
      N.myRe = N.theirRe = false;
      cancelAI(); gen++; over = false; ovUp = false; pending = false; started = false; drag = null; sure = false;
      api.hideOverlay();
      model = S.newModel(S.cfgOf(opt)); me = N.hostColor;
      setNames();
      if (S.start) S.start(sh);
      send(snapMsg());
      afterAct(true);
    }
    function setNames() {
      const pl = api.net.players || [], hn = (pl[0] && pl[0].name) || 'Host', gn = (pl[1] && pl[1].name) || 'Guest';
      N.names = {}; N.names[N.hostColor] = hn; N.names[3 - N.hostColor] = gn;
      if (guest()) { const my = N.names[me]; N.names[me] = my; }
    }
    function onSnap(d) {
      if (!d || !d.cfg) return;
      const fresh = d.r !== N.round || !model;
      if (fresh) {
        cancelAI(); gen++; over = false; ovUp = false; drag = null; sure = false; started = false; hover = -1;
        api.hideOverlay();
        N.round = d.r; N.hostColor = d.hc; me = 3 - d.hc; N.live = true;
        model = S.newModel(d.cfg);
        if (S.start) S.start(sh);
      }
      N.names = d.names || N.names; N.myRe = !!d.re[1]; N.theirRe = !!d.re[0];
      const before = model.count();
      model.load(d.m);
      if (!fresh && model.count() > before) { S.fxLoad(sh, before); started = true; }
      if (over && model.phase() !== 'over') { over = false; ovUp = false; api.hideOverlay(); gen++; }
      afterAct(fresh);
    }
    function rematch() {
      if (!online() || !N.live || !over || N.myRe) return;
      N.myRe = true;
      if (N.role === 'host') { if (N.theirRe) return startRound(); send(snapMsg()); }
      else send({ t: 're' });
      paint();
      sh.status(N.theirRe ? 'Starting…' : 'Waiting for your opponent…');
    }
    function setMode(m) {
      const prev = opt.mode;
      if (prev === 'online' && m !== 'online') { N.role = null; N.live = false; N.tok++; api.net.close(); api.hideOverlay(); }
      opt.mode = m; api.save({ ...opt });
      if (m === 'online') goOnline(prev); else { lastMode = m; newGame(); }
    }
    async function goOnline() {
      hookNet();
      const tok = ++N.tok;
      N.role = null; N.live = false; N.round = 0; N.myRe = N.theirRe = false;
      cancelAI(); gen++; ovUp = false; api.hideOverlay();
      opt.mode = 'online';
      model = S.newModel(S.cfgOf(opt)); me = 1; over = false; started = false;
      paint(); sh.status('Opening the lobby…'); dirtyF = true;
      const r = await api.net.room({ title: S.title, sizes: [2], defaultSize: 2, min: 2, max: 2 });
      if (!api.alive || tok !== N.tok || !online()) return;
      if (!r) return setMode('ai');
      N.role = r.role; N.live = false;
      if (r.role === 'host') { startRound(); }
      else { paint(); sh.status('Connected · waiting for the host…'); send({ t: 'hi' }); }
    }
    function hookNet() {
      if (N.hooked) return;
      N.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !online() || !N.role) return;
        if (N.role === 'host') {
          if (d.t === 'hi') { if (N.live) api.net.sendTo(from, snapMsg()); }
          else if (d.t === 'act') { if (N.live && !over) perform(3 - N.hostColor, d.a); else if (N.live) api.net.sendTo(from, snapMsg()); }
          else if (d.t === 're') { N.theirRe = true; if (over && N.myRe) startRound(); else if (over) { paint(); sh.status('Your opponent wants a rematch', 'turn'); S.audio.pass(); } }
        } else if (d.t === 'snap') onSnap(d);
      });
      api.net.on('leave', () => {
        if (!online() || N.role !== 'host') return;
        N.live = false; cancelAI(); gen++; ovUp = true; N.theirRe = false;
        paint(); sh.status('Your opponent left', 'loss'); S.audio.lose();
        api.overlay({ kicker: 'Online', title: 'Opponent left', text: 'Your opponent left the game.', button: 'Wait for a player', onAction: () => { ovUp = false; goOnline(); }, secondary: 'Play vs AI', onSecondary: () => { ovUp = false; setMode('ai'); } });
      });
      api.net.on('rejoin', p => { if (online() && N.role === 'host' && p && N.live) api.net.sendTo(p.id, snapMsg()); });
      api.net.on('lobby', () => { if (online() && N.role === 'guest') goOnline(); });
      api.net.on('close', reason => {
        if (!online() || N.role !== 'guest') return;
        N.role = null; N.live = false; gen++; cancelAI(); ovUp = true;
        paint(); sh.status('Connection closed', 'loss'); S.audio.lose();
        const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host left, so the game ended.' : 'The connection to the host was lost.';
        api.overlay({ kicker: 'Online', title: reason === 'kicked' ? 'Removed' : reason === 'host-left' ? 'Host left' : 'Connection lost', text: t, button: 'New online game', onAction: () => { ovUp = false; goOnline(); }, secondary: 'Play vs AI', onSecondary: () => { ovUp = false; setMode('ai'); } });
      });
      api.interval(() => { if (online()) { conn(); paintSub(); } }, 1000);
    }
    function onButton(id) {
      S.audio.prime();
      if (id === 'new') { sure = false; newGame(); }
      else if (id === 'leave') setMode('ai');
      else if (id === 'lobby') goOnline();
      else if (id === 'rematch') rematch();
      else if (id === 'undo') { if (!online() && !over && S.undo && S.undo(model, me)) { cancelAI(); gen++; started = true; afterAct(false); } }
      else if (id === 'resign') {
        if (!sure) { sure = true; paintButtons(); const g = gen; api.timeout(() => { if (g === gen && sure) { sure = false; paintButtons(); } }, 2600); return; }
        sure = false; perform(me, { k: 'resign' });
      }
      else if (S.onButton) S.onButton(id, sh);
    }
    side.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    side.addEventListener('click', e => {
      const bt = e.target.closest('button');
      if (!bt) return;
      if (bt.dataset.b) return onButton(bt.dataset.b);
      const key = bt.parentNode.dataset.k;
      if (!key || String(opt[key]) === bt.dataset.v) return;
      S.audio.prime(); api.sfx('tick');
      const f = fields.find(x => x.key === key), val = optVal(f, bt.dataset.v);
      if (key === 'mode') return setMode(val);
      opt[key] = val; api.save({ ...opt });
      if (f.onChange) f.onChange(opt, key);
      if (f.live) { paint(); dirtyF = true; return; }
      if (!model || over || !started || (online() && N.role !== 'host')) { paint(); if (online() && N.role === 'host' && (over || !started) && !N.live) return; if (online()) { pending = true; paint(); } else newGame(); }
      else { pending = true; paint(); api.toast('Applies to the next game'); }
    });
    const mayPlay = () => !!model && !over && !ovUp && !ai && (!online() || N.live) && S.canAct(model, me);
    const toPt = (e, down) => { const p = cv.toLocal(e); return S.pick(p, e.pointerType === 'touch', model); };
    cvs.addEventListener('pointerdown', e => {
      if (e.button > 0 || ovUp || !e.isPrimary) return;
      e.preventDefault(); S.audio.prime();
      cursor = -1;
      const tch = e.pointerType === 'touch';
      const pt = toPt(e, true);
      drag = { id: e.pointerId, pt, touch: tch, moved: false };
      try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
      hover = pt; dirtyF = true;
    });
    cvs.addEventListener('pointermove', e => {
      const pt = toPt(e);
      if (drag && e.pointerId === drag.id) { drag.pt = pt; drag.moved = true; hover = pt; dirtyF = true; }
      else if (e.pointerType !== 'touch' && pt !== hover) { hover = pt; dirtyF = true; }
    });
    cvs.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && !drag) { hover = -1; dirtyF = true; } });
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag, pt = toPt(e);
      drag = null;
      if (e.type === 'pointerup') {
        const p = d.touch ? d.pt : pt;
        if (p >= 0 && !ovUp) clickAt(p);
      }
      if (d.touch) hover = -1;
      dirtyF = true;
    };
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', up);
    function clickAt(pt) {
      if (!model || over) return;
      if (!mayPlay() && !(model.phase() === 'mark' && !ai && (!online() || N.live))) return;
      const a = S.click(model, pt, me, sh);
      if (!a) { if (S.reject) S.reject(sh, pt); return; }
      if (!perform(me, a)) { S.audio.bad(); }
    }
    api.on(window, 'keydown', e => {
      if (ovUp || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) || e.ctrlKey || e.metaKey || e.altKey) return;
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
      if (dir) {
        e.preventDefault();
        cursor = S.step(cursor, dir[0], dir[1], model);
        hover = -1; dirtyF = true;
      } else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') {
        if (cursor < 0 || e.repeat) return;
        e.preventDefault(); clickAt(cursor);
      } else if (e.code === 'KeyU' && !e.repeat) onButton('undo');
      else if (e.code === 'KeyN' && !e.repeat && !online()) onButton('new');
      else if (S.key && S.key(e, sh)) e.preventDefault();
    });
    api.loop(() => {
      if (dirtyF || (S.busy && S.busy(sh))) { dirtyF = false; S.draw(cv.ctx, sh); }
    });
    api.interval(() => { if (ai) { aiInfo = ai.info ? ai.info() : ''; paintSub(); } }, 300);
    return {
      start() { if (api.net.invite) { opt.mode = 'online'; goOnline(); } else newGame(); },
      sh, newGame, setMode
    };
  }
  const BSZ = 640, FACE = { x: 20, y: 12, s: 600 };
  const geo = (n, pad) => {
    const p = pad || 40, span = FACE.s - 2 * p, cell = span / (n - 1);
    return { n, x0: FACE.x + p, y0: FACE.y + p, cell, span };
  };
  const LETTERS = 'ABCDEFGHJKLMNOPQRST';
  const WOOD = {
    kaya: { base: '#e2b565', lines: ['#c58d3f', '#f1cf8c', '#b27a30', '#d8a557'], edge: '#a9772f', edge2: ['#8c5f22', '#c99a52', '#775019'], line: '#33230f', lab: 'rgba(66,42,16,.72)' },
    shin: { base: '#ecc27a', lines: ['#d29d4f', '#f7dca0', '#be8a3d', '#e3b569'], edge: '#b8853a', edge2: ['#946729', '#d2a65f', '#7e5a22'], line: '#2f2111', lab: 'rgba(70,46,18,.7)' }
  };
  function boardTexture(g, hoshi, wood, seed, letters) {
    const d = dprOf(), W = WOOD[wood] || WOOD.kaya, c = cnv(BSZ * d, BSZ * d), x = c.getContext('2d'), rand = rng(seed || 7);
    x.scale(d, d);
    let gr = x.createRadialGradient(BSZ / 2, BSZ / 2, 80, BSZ / 2, BSZ / 2, BSZ * .78);
    gr.addColorStop(0, '#3a332c'); gr.addColorStop(1, '#171411');
    x.fillStyle = gr; x.fillRect(0, 0, BSZ, BSZ);
    x.save(); x.globalAlpha = .08;
    for (let i = 0; i < 60; i++) { x.fillStyle = rand() < .5 ? '#fff' : '#000'; x.fillRect(rand() * BSZ, rand() * BSZ, 40 + rand() * 120, 1); }
    x.restore();
    const F = FACE, T = 14;
    x.save(); x.shadowColor = 'rgba(0,0,0,.65)'; x.shadowBlur = 26; x.shadowOffsetY = 12;
    x.fillStyle = '#000'; rr(x, F.x, F.y + 4, F.s, F.s + T - 4, 5); x.fill(); x.restore();
    grain(x, F.x, F.y + F.s - 4, F.s, T + 4, W.edge, W.edge2, rand, false, 1.2);
    gr = x.createLinearGradient(0, F.y + F.s, 0, F.y + F.s + T);
    gr.addColorStop(0, 'rgba(0,0,0,.08)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
    x.fillStyle = gr; x.fillRect(F.x, F.y + F.s, F.s, T);
    x.save(); rr(x, F.x, F.y, F.s, F.s, 4); x.clip();
    grain(x, F.x, F.y, F.s, F.s, W.base, W.lines, rand, false, 1.3);
    for (let i = 0; i < 7; i++) {
      const yy = F.y + rand() * F.s, hh = 18 + rand() * 60;
      gr = x.createLinearGradient(0, yy, 0, yy + hh);
      gr.addColorStop(0, 'rgba(120,70,20,0)'); gr.addColorStop(.5, `rgba(${rand() < .5 ? '120,70,20' : '255,235,190'},${(.05 + rand() * .07).toFixed(3)})`); gr.addColorStop(1, 'rgba(120,70,20,0)');
      x.fillStyle = gr; x.fillRect(F.x, yy, F.s, hh);
    }
    gr = x.createLinearGradient(F.x, F.y, F.x + F.s, F.y + F.s);
    gr.addColorStop(0, 'rgba(255,255,255,.2)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(60,30,0,.22)');
    x.fillStyle = gr; x.fillRect(F.x, F.y, F.s, F.s);
    gr = x.createRadialGradient(F.x + F.s / 2, F.y + F.s / 2, F.s * .35, F.x + F.s / 2, F.y + F.s / 2, F.s * .75);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(60,30,0,.25)');
    x.fillStyle = gr; x.fillRect(F.x, F.y, F.s, F.s);
    x.restore();
    x.strokeStyle = 'rgba(255,240,200,.5)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(F.x + 3, F.y + F.s - 2); x.lineTo(F.x + 3, F.y + 3); x.lineTo(F.x + F.s - 2, F.y + 3); x.stroke();
    x.strokeStyle = 'rgba(40,20,0,.4)'; x.beginPath(); x.moveTo(F.x + F.s - 1.5, F.y + 3); x.lineTo(F.x + F.s - 1.5, F.y + F.s - 1.5); x.lineTo(F.x + 3, F.y + F.s - 1.5); x.stroke();
    const { n, x0, y0, cell } = g, ax = i => x0 + i * cell, ay = i => y0 + i * cell;
    x.lineCap = 'square';
    x.strokeStyle = W.line;
    for (let i = 0; i < n; i++) {
      const edge = i === 0 || i === n - 1;
      x.lineWidth = edge ? 1.9 : n > 15 ? 1 : 1.2;
      x.beginPath(); x.moveTo(ax(i) + .5, y0 - (edge ? .9 : 0)); x.lineTo(ax(i) + .5, y0 + (n - 1) * cell + (edge ? .9 : 0)); x.stroke();
      x.beginPath(); x.moveTo(x0 - (edge ? .9 : 0), ay(i) + .5); x.lineTo(x0 + (n - 1) * cell + (edge ? .9 : 0), ay(i) + .5); x.stroke();
    }
    x.fillStyle = W.line;
    for (const [r, cc] of hoshi) { x.beginPath(); x.arc(ax(cc) + .5, ay(r) + .5, Math.max(2.6, cell * .1), 0, 7); x.fill(); }
    x.font = `800 ${n > 15 ? 12 : 13}px Nunito, system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = W.lab;
    for (let i = 0; i < n; i++) {
      const l = (letters || LETTERS)[i];
      x.fillText(l, ax(i), F.y + 21); x.fillText(l, ax(i), F.y + F.s - 21);
      x.fillText(String(n - i), F.x + 21, ay(i) + 1); x.fillText(String(n - i), F.x + F.s - 21, ay(i) + 1);
    }
    return c;
  }
  function stoneSprite(kind, black, cell, d) {
    const S = Math.ceil(cell * 1.5 * d), c = cnv(S, S), x = c.getContext('2d'), R = cell * .485 * d, cx = S / 2, cy = S / 2;
    x.save();
    shadowEll(x, cx + R * .1, cy + R * .3, R * 1.12, R * 1.0, black ? .5 : .42);
    x.restore();
    let g;
    if (kind === 'glass') {
      x.fillStyle = black ? '#050507' : '#a9a9b6';
      x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      g = x.createRadialGradient(cx - R * .35, cy - R * .4, R * .05, cx, cy, R);
      if (black) { g.addColorStop(0, '#8a8a99'); g.addColorStop(.28, '#34343c'); g.addColorStop(.7, '#0b0b0e'); g.addColorStop(1, '#000'); }
      else { g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#f2f2f7'); g.addColorStop(.85, '#cfcfda'); g.addColorStop(1, '#9d9dab'); }
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      g = x.createRadialGradient(cx - R * .4, cy - R * .45, 0, cx - R * .4, cy - R * .45, R * .42);
      g.addColorStop(0, `rgba(255,255,255,${black ? .65 : 1})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      x.strokeStyle = black ? 'rgba(255,255,255,.12)' : 'rgba(0,0,40,.12)'; x.lineWidth = d; x.beginPath(); x.arc(cx, cy, R - d * .8, 0, 7); x.stroke();
      return c;
    }
    if (black) {
      g = x.createRadialGradient(cx - R * .32, cy - R * .38, R * .05, cx, cy, R * 1.02);
      g.addColorStop(0, '#55555c'); g.addColorStop(.35, '#26262a'); g.addColorStop(.8, '#0e0e11'); g.addColorStop(1, '#050506');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      g = x.createRadialGradient(cx - R * .38, cy - R * .42, 0, cx - R * .38, cy - R * .42, R * .45);
      g.addColorStop(0, 'rgba(255,255,255,.34)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = d; x.beginPath(); x.arc(cx, cy, R - d, 0, 7); x.stroke();
    } else {
      x.fillStyle = '#b5b0a0'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      g = x.createRadialGradient(cx - R * .3, cy - R * .34, R * .05, cx, cy, R);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#f4f1e7'); g.addColorStop(.9, '#dcd7c8'); g.addColorStop(1, '#bfb9a6');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
      x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.clip();
      x.lineWidth = d * .9;
      for (let i = 1; i <= 4; i++) { x.strokeStyle = `rgba(120,110,85,${(.05 + i * .008).toFixed(3)})`; x.beginPath(); x.arc(cx + R * .12, cy + R * .1, R * (.2 + i * .19), .2 * i, 4.5 + .1 * i); x.stroke(); }
      g = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(70,60,40,.2)');
      x.fillStyle = g; x.fillRect(cx - R, cy - R, R * 2, R * 2);
      x.restore();
      x.strokeStyle = 'rgba(90,80,55,.25)'; x.lineWidth = d; x.beginPath(); x.arc(cx, cy, R - d * .5, 0, 7); x.stroke();
    }
    return c;
  }
  const GO_NAMES = { 1: 'Black', 2: 'White' };
  const GO_CHIP = { 1: 'radial-gradient(circle at 35% 30%,#6a6a72,#1c1c20 55%,#050507)', 2: 'radial-gradient(circle at 35% 30%,#fff,#ece8dc 55%,#b9b3a0)' };
  const GO_THEME = { bg: '#2b241d', pn: '#3a3027', pn2: '#4a3e32', ink: '#f3eadb', mut: '#bdae94', acc: '#d9a441', acc2: '#9c7424', accInk: '#2a1c06', ln: '#5a4a3a', cv: '#201a14' };
  const goCss = kitCss('.gm-go', GO_THEME);

  function goModel(E, cfg) {
    const g = E.Game(cfg);
    const m = {
      g, cfg, aiProposed: false,
      turnColor: () => g.phase === 'play' ? g.P.turn : 0,
      phase: () => g.phase,
      count: () => g.moves.length,
      save: () => g.save(),
      load: s => { g.load(s); },
      act(color, a) {
        if (!a || typeof a !== 'object') return null;
        if (a.k === 'p') {
          if (g.phase !== 'play' || g.P.turn !== color || g.P.b[a.p] !== 0) return null;
          const r = g.play(a.p);
          return r ? { k: 'move', ...r } : null;
        }
        if (a.k === 'pass') {
          if (g.phase !== 'play' || g.P.turn !== color) return null;
          const r = g.pass();
          return r ? { k: 'pass', color, phase: g.phase } : null;
        }
        if (a.k === 'resign') {
          if (g.phase === 'over') return null;
          g.resign(color);
          return { k: 'resign', color };
        }
        if (g.phase !== 'mark') return null;
        if (a.k === 'dead') return g.toggle(a.p) ? { k: 'mark' } : null;
        if (a.k === 'deadset') {
          if (!Array.isArray(a.list) || a.list.length > g.P.pts.length) return null;
          const ok = a.list.filter(p => g.P.b[p] === 1 || g.P.b[p] === 2);
          g.setDead(ok);
          if (a.ai) m.aiProposed = true;
          return { k: 'mark', set: true };
        }
        if (a.k === 'done') {
          g.done[color] = true;
          if (cfg.ai || (g.done[1] && g.done[2])) g.finish();
          return { k: 'done', color };
        }
        if (a.k === 'resume') { m.aiProposed = false; return g.resume() ? { k: 'resume', color } : null; }
        return null;
      }
    };
    return m;
  }

  function mountGo(root, api) {
    const E = goEngine(), au = audioKit(api);
    const texs = {}, sprs = {};
    let snapB = null, pl = {}, capA = [];
    const getTex = n => texs[n] || (texs[n] = boardTexture(geo(n), E.starPts(n), 'kaya', 11 + n));
    const getSpr = cell => {
      const key = Math.round(cell * 10);
      if (!sprs[key]) { const d = dprOf(); sprs[key] = { 1: stoneSprite('slate', true, cell, d), 2: stoneSprite('slate', false, cell, d), s: cell * 1.5 }; }
      return sprs[key];
    };
    const lastPass = g => g.moves.length > 0 && g.moves[g.moves.length - 1] === -1;
    function aiGo(model, col, opt, cb, sh) {
      const g = model.g, n = g.cfg.n, lv = +opt.level, pr = E.params[lv] || E.params[2];
      let dead = false, s = null, est = null, info = '';
      const t0 = now(), tm = api.timeout;
      const root0 = E.Pos(n);
      root0.copyFrom(g.P);
      const done = a => { const wait = Math.max(0, (lv ? 450 : 700) - (now() - t0)); tm(() => { if (!dead) cb(a); }, wait); };
      const toAct = mv => {
        if (mv === -3) return { k: 'resign' };
        if (mv < 0) return { k: 'pass' };
        if (g.legal(mv)) return { k: 'p', p: mv };
        const q = E.quickMove(root0, 1);
        return q >= 0 && g.legal(q) ? { k: 'p', p: q } : { k: 'pass' };
      };
      if (g.phase === 'mark') {
        est = E.Estimate(root0, { playouts: n === 9 ? 700 : n === 13 ? 500 : 350, maxMs: 2200 });
        const tick = () => {
          if (dead) return;
          if (est.step(8)) done({ k: 'deadset', list: est.dead(), ai: true });
          else { info = 'Counting the board…'; tm(tick, 2); }
        };
        tick();
      } else if (lv === 0) {
        const q = E.quickMove(root0, 0);
        done(q >= 0 ? { k: 'p', p: q } : { k: 'pass' });
      } else {
        let stones = 0;
        for (let i = 0; i < g.P.pts.length; i++) if (g.P.b[g.P.pts[i]] > 0) stones++;
        const bk = stones <= 1 && g.moves.length <= 1 ? E.bookMove(root0) : -2;
        if (bk >= 0 && g.legal(bk)) done({ k: 'p', p: bk });
        else {
          const sc = n === 9 ? 1 : n === 13 ? 1.5 : 2.2;
          s = E.Search(root0, { komi: g.cfg.komi, maxPlayouts: Math.round(pr.playouts * (n === 9 ? 1 : n === 13 ? .8 : .5)), maxMs: pr.ms * sc, passOk: g.moves.length >= n, oppPassed: lastPass(g), japanese: g.cfg.rules === 'J', canResign: lv >= 2 && g.moves.length > n * 2 });
          const tick = () => {
            if (dead) return;
            const fin = s.step(7);
            info = 'Thinking… ' + s.playouts.toLocaleString('en-US') + ' playouts';
            if (fin) { const r = s.result(); done(toAct(r.move)); } else tm(tick, 2);
          };
          tick();
        }
      }
      return { cancel() { dead = true; }, info: () => info };
    }
    function runEstimate(sh) {
      const g = sh.model.g, n = g.cfg.n, root0 = E.Pos(n);
      root0.copyFrom(g.P);
      const est = E.Estimate(root0, { playouts: n === 9 ? 700 : 450, maxMs: 2200 });
      const g0 = sh.model;
      sh.status('Counting the board…');
      const tick = () => {
        if (sh.model !== g0 || sh.model.phase() !== 'mark') return;
        if (est.step(8)) sh.act({ k: 'deadset', list: est.dead() });
        else api.timeout(tick, 2);
      };
      tick();
    }
    const canUndo = (g, me) => { for (let k = 1; k <= g.moves.length; k++) if (g.colorAt(g.moves.length - k) === me) return true; return false; };
    const SP = {
      title: 'Go', SZ: BSZ, audio: au,
      fields: [
        { key: 'size', label: 'Board', def: 9, opts: () => [[9, '9×9'], [13, '13×13'], [19, '19×19']], onChange: o => { const mx = E.maxHandi(+o.size); if (o.handi > mx) o.handi = mx; } },
        { key: 'rules', label: 'Scoring', def: 'J', opts: () => [['J', 'Japanese'], ['C', 'Chinese']], onChange: o => { o.komi = o.rules === 'C' ? 7.5 : 6.5; } },
        { key: 'komi', label: 'Komi', def: 6.5, opts: () => [[0.5, '0.5'], [5.5, '5.5'], [6.5, '6.5'], [7.5, '7.5']], when: o => !(o.handi > 1) },
        { key: 'handi', label: 'Handicap', def: 0, opts: o => { const l = [[0, 'None']]; for (let k = 2; k <= E.maxHandi(+o.size); k++) l.push([k, String(k)]); return l; } },
        { key: 'side', label: 'You play', def: 'black', opts: () => [['black', 'Black'], ['white', 'White'], ['random', 'Random']] },
        { key: 'level', label: 'AI strength', def: 2, opts: () => E.params.map((p, i) => [i, p.name]), when: o => o.mode === 'ai' },
        { key: 'nums', label: 'Move numbers', def: 0, opts: () => [[0, 'Off'], [1, 'On']], live: true }
      ],
      chip: GO_CHIP,
      cfgOf: o => ({ n: +o.size, rules: o.rules, komi: o.handi > 1 ? 0.5 : +o.komi, handi: +o.handi, ai: o.mode === 'ai' }),
      newModel: cfg => goModel(E, cfg),
      aiName: o => { const p = E.params[+o.level] || E.params[2]; return p.name + ' (' + p.rank + ')'; },
      ranked: m => m.g.moves.length > 0 && m.g.phase !== 'over',
      canAct: (m, me) => m.g.phase === 'play' && m.g.P.turn === me,
      aiNeeded: (m, col) => (m.g.phase === 'play' && m.g.P.turn === col) || (m.g.phase === 'mark' && !m.aiProposed),
      ai: aiGo,
      undo: (m, me) => {
        const g = m.g;
        for (let k = 1; k <= g.moves.length; k++) if (g.colorAt(g.moves.length - k) === me) { g.undo(k); m.aiProposed = false; return true; }
        return false;
      },
      cardSub: (m, col) => `${GO_NAMES[col]} · captured ${m.g.P.caps[col]}${col === 2 ? ' · komi ' + m.g.cfg.komi : ''}`,
      status(m, c) {
        const g = m.g;
        if (g.phase === 'mark') {
          const s = g.score();
          return ['Mark dead stones, then press Done · B ' + s.b.total + ' · W ' + s.w.total, 'warn'];
        }
        const t = g.P.turn;
        const note = lastPass(g) ? ' · opponent passed' : '';
        if (t === c.me) return ['Your move' + note, 'turn'];
        return [c.online ? 'Waiting for your opponent…' : 'AI is thinking…'];
      },
      buttons(c) {
        const g = c.model.g;
        if (g.phase === 'mark') return [['auto', 'Auto-mark', {}], ['done', g.done[c.me] ? 'Waiting…' : 'Done', { dis: g.done[c.me] }], ['resume', 'Resume play', { ghost: 1 }], c.online ? ['resign', c.sure ? 'Sure?' : 'Resign', { ghost: 1 }] : ['new', 'New game', { ghost: 1 }]];
        const mine = g.P.turn === c.me;
        if (c.online) return [['pass', 'Pass', { dis: !mine }], ['resign', c.sure ? 'Sure?' : 'Resign', { ghost: 1 }]];
        return [['undo', 'Undo', { dis: !canUndo(g, c.me) }], ['pass', 'Pass', { dis: !mine || c.thinking }], ['resign', c.sure ? 'Sure?' : 'Resign', { ghost: 1 }], ['new', 'New game', { ghost: 1 }]];
      },
      onButton(id, sh) {
        if (id === 'pass') sh.act({ k: 'pass' });
        else if (id === 'done') sh.act({ k: 'done' });
        else if (id === 'resume') sh.act({ k: 'resume' });
        else if (id === 'auto') runEstimate(sh);
      },
      key(e, sh) {
        if (e.code === 'KeyP' && !e.repeat) { SP.onButton('pass', sh); return true; }
        return false;
      },
      pick(p, touchMode, m) {
        if (!m) return -1;
        const n = m.cfg.n, G = geo(n);
        let y = p.y;
        if (touchMode) y -= G.cell * 1.5 * clamp01((G.y0 + G.span - p.y) / (G.cell * 3));
        const c = Math.round((p.x - G.x0) / G.cell), r = Math.round((y - G.y0) / G.cell);
        if (c < 0 || c >= n || r < 0 || r >= n) return -1;
        if (Math.hypot(p.x - (G.x0 + c * G.cell), p.y - (G.y0 + r * G.cell)) > G.cell * 1.7 && !touchMode) return -1;
        return m.g.P.pt(r, c);
      },
      step(cur, dx, dy, m) {
        const P = m.g.P, n = P.n;
        if (cur < 0) return P.pt((n - 1) >> 1, (n - 1) >> 1);
        return P.pt(clamp(P.row(cur) + dy, 0, n - 1), clamp(P.col(cur) + dx, 0, n - 1));
      },
      click(m, pt, me) {
        const g = m.g;
        if (g.phase === 'mark') return g.P.b[pt] > 0 ? { k: 'dead', p: pt } : null;
        if (g.phase !== 'play' || g.P.turn !== me) return null;
        return g.legal(pt) ? { k: 'p', p: pt } : null;
      },
      reject(sh, pt) {
        const m = sh.model, g = m.g;
        if (g.phase !== 'play' || g.P.turn !== sh.me || sh.thinking) return;
        const b = g.P.b[pt];
        if (b > 0) return;
        au.bad();
        if (pt === g.P.ko) api.toast('Ko: you cannot retake immediately');
        else if (g.cfg.rules === 'C' && g.P.b[pt] === 0) {
          const T = E.Pos(g.cfg.n); T.copyFrom(g.P);
          if (T.play(pt, g.P.turn)) api.toast('That would repeat an earlier position'); else api.toast('Suicide is not allowed');
        } else api.toast('Suicide is not allowed');
      },
      start(sh) { const g = sh.model.g; snapB = g.P.b.slice(); pl = {}; capA = []; },
      fx(sh, r, color) {
        const g = sh.model.g, t = now();
        if (r.k === 'move') {
          au.stone(color);
          pl[r.p] = t;
          for (let i = 0; i < r.caps.length; i++) capA.push({ p: r.caps[i], c: 3 - color, t0: t + 40 + i * 28 });
          if (r.caps.length) api.timeout(() => au.capture(r.caps.length), 90);
        } else if (r.k === 'pass') { au.pass(); api.toast(GO_NAMES[color] + ' passes'); }
        else if (r.k === 'mark' || r.k === 'done' || r.k === 'resume') api.sfx('tick');
        snapB = g.P.b.slice();
        sh.dirty();
      },
      fxLoad(sh, before) {
        const g = sh.model.g, b = g.P.b, t = now();
        let added = 0, removed = 0;
        if (snapB && snapB.length === b.length) {
          for (let i = 0; i < b.length; i++) {
            if (b[i] > 0 && snapB[i] !== b[i]) { pl[i] = t; added++; }
            else if (b[i] === 0 && snapB[i] > 0) { capA.push({ p: i, c: snapB[i], t0: t + 40 + removed * 28 }); removed++; }
          }
        }
        const lastMv = g.moves[g.moves.length - 1];
        if (added) au.stone(g.colorAt(g.moves.length - 1)); else if (lastMv === -1) { au.pass(); api.toast(GO_NAMES[g.colorAt(g.moves.length - 1)] + ' passes'); }
        if (removed) api.timeout(() => au.capture(removed), 90);
        snapB = b.slice();
        sh.dirty();
      },
      busy(sh) {
        const t = now();
        let any = false;
        for (const k in pl) { if (t - pl[k] > 260) delete pl[k]; else any = true; }
        capA = capA.filter(a => t - a.t0 < 420);
        return any || capA.length > 0;
      },
      result(m, me) {
        const g = m.g, r = g.res, mv = g.moves.length;
        if (r.by === 'resign') {
          const loser = 3 - r.winner;
          return { winner: r.winner, why: GO_NAMES[loser] + ' resigned', text: GO_NAMES[loser] + ' resigned after ' + mv + ' moves.', stats: [['Moves', mv], ['Captured B', g.P.caps[1]], ['Captured W', g.P.caps[2]]], delay: 900 };
        }
        const s = r.score, d = Math.abs(r.diff);
        const fmt = v => Number.isInteger(v) ? v : v.toFixed(1);
        const why = r.winner ? GO_NAMES[r.winner] + ' wins by ' + fmt(d) : 'Jigo';
        const text = (g.cfg.rules === 'C' ? 'Chinese area scoring' : 'Japanese territory scoring') + `: Black ${fmt(s.b.total)}, White ${fmt(s.w.total)} (komi ${s.komi}).`;
        const stats = g.cfg.rules === 'C'
          ? [['Black', fmt(s.b.total)], ['White', fmt(s.w.total)], ['Komi', s.komi]]
          : [['Black', fmt(s.b.total)], ['White', fmt(s.w.total)], ['Territory', s.b.terr + ' / ' + s.w.terr], ['Prisoners', s.b.prisoners + ' / ' + s.w.prisoners]];
        return { winner: r.winner, why, text, stats, delay: 1300 };
      },
      draw(c, sh) {
        const m = sh.model;
        if (!m) return;
        const g = m.g, P = g.P, n = g.cfg.n, G = geo(n), cell = G.cell, sp = getSpr(cell), t = now();
        c.drawImage(getTex(n), 0, 0, BSZ, BSZ);
        const px = p => G.x0 + P.col(p) * cell, py = p => G.y0 + P.row(p) * cell, half = sp.s / 2;
        const put = (p, col, a, sc, ox, oy) => {
          c.globalAlpha = a;
          const x = px(p) + (ox || 0), y = py(p) + (oy || 0), w = sp.s * sc;
          c.drawImage(sp[col], x - w / 2, y - w / 2, w, w);
          c.globalAlpha = 1;
        };
        const jit = p => (((p * 2654435761) >>> 0) / 4294967296 - .5) * .8;
        const marking = g.phase === 'mark' || (g.phase === 'over' && g.res && g.res.by === 'score');
        const sc = marking ? g.score() : null;
        if (sc) {
          for (let i = 0; i < P.pts.length; i++) {
            const p = P.pts[i], o = sc.terr[p];
            if (!o || P.b[p] > 0 && !g.dead[p]) continue;
            const s = cell * .3, x = px(p), y = py(p);
            c.fillStyle = o === 1 ? '#111' : '#f6f2e6'; c.strokeStyle = o === 1 ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.55)'; c.lineWidth = 1.2;
            c.fillRect(x - s / 2, y - s / 2, s, s); c.strokeRect(x - s / 2, y - s / 2, s, s);
          }
        }
        for (const a of capA) {
          if (t < a.t0) { put(a.p, a.c, 1, 1); continue; }
          const k = clamp01((t - a.t0) / 360);
          if (k < 1) put(a.p, a.c, 1 - k, 1 - .3 * easeOut(k), 0, -k * 6);
        }
        for (let i = 0; i < P.pts.length; i++) {
          const p = P.pts[i], v = P.b[p];
          if (!v) continue;
          const dd = g.dead[p] && marking;
          let sc2 = 1, al = 1;
          if (pl[p] != null) { const k = clamp01((t - pl[p]) / 170); sc2 = 1 + .2 * (1 - easeOut(k)); al = .45 + .55 * easeOut(k); }
          put(p, v, dd ? .4 : al, sc2, jit(p), jit(p * 7 + 3));
        }
        if (marking) {
          for (let i = 0; i < P.pts.length; i++) {
            const p = P.pts[i];
            if (P.b[p] > 0 && g.dead[p]) {
              const x = px(p), y = py(p), s = cell * .2;
              c.strokeStyle = P.b[p] === 1 ? '#ffd9d9' : '#a3261c'; c.lineWidth = 2.2; c.lineCap = 'round';
              c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); c.stroke();
            }
          }
        }
        if (+sh.opt.nums) {
          c.font = `800 ${Math.max(9, Math.round(cell * (n > 13 ? .4 : .36)))}px Nunito, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
          for (let i = 0; i < P.pts.length; i++) {
            const p = P.pts[i], v = P.b[p], nm = g.num[p];
            if (!v || !nm) continue;
            c.fillStyle = v === 1 ? '#f1ede2' : '#1c1a17';
            c.fillText(String(nm), px(p) + jit(p), py(p) + jit(p * 7 + 3) + 1);
          }
        }
        const lm = g.moves.length ? g.moves[g.moves.length - 1] : -1;
        if (lm >= 0 && g.phase !== 'mark' && !(+sh.opt.nums)) {
          c.strokeStyle = P.b[lm] === 1 ? '#f3f0e6' : '#202020'; c.lineWidth = Math.max(1.6, cell * .06);
          c.beginPath(); c.arc(px(lm) + jit(lm), py(lm) + jit(lm * 7 + 3), cell * .2, 0, 7); c.stroke();
        } else if (lm >= 0 && g.phase !== 'mark') {
          c.strokeStyle = '#e0473a'; c.lineWidth = 2.2;
          c.beginPath(); c.arc(px(lm), py(lm), cell * .44, 0, 7); c.stroke();
        }
        if (g.phase === 'play' && P.ko >= 0 && P.b[P.ko] === 0) {
          const s = cell * .26;
          c.strokeStyle = '#d8362b'; c.lineWidth = 2.4; c.strokeRect(px(P.ko) - s, py(P.ko) - s, s * 2, s * 2);
        }
        const h = sh.hover;
        if (h >= 0 && !sh.over) {
          if (g.phase === 'play' && P.turn === sh.me && !sh.thinking) {
            if (P.b[h] === 0) {
              const ok = g.legal(h);
              if (ok) put(h, sh.me, .55, 1);
              else if (sh.drag) {
                c.strokeStyle = '#d8362b'; c.lineWidth = 3; c.lineCap = 'round'; const x = px(h), y = py(h), s = cell * .22;
                c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); c.stroke();
              }
            }
          } else if (g.phase === 'mark' && P.b[h] > 0) {
            c.strokeStyle = '#d9a441'; c.lineWidth = 2.2;
            for (const q of P.group(h)) { c.beginPath(); c.arc(px(q), py(q), cell * .5, 0, 7); c.stroke(); }
          }
        }
        if (sh.cursor >= 0) {
          const x = px(sh.cursor), y = py(sh.cursor), s = cell * .5;
          c.save(); c.strokeStyle = '#4aa8ff'; c.lineWidth = 2.6; c.shadowColor = 'rgba(74,168,255,.8)'; c.shadowBlur = 8;
          rr(c, x - s, y - s, s * 2, s * 2, 6); c.stroke(); c.restore();
        }
      }
    };
    stoneShell(root, api, SP).start();
  }
  function gomokuEngine() {
    const N = 15, NN = 225, DR = [0, 1, 1, 1], DC = [1, 0, 1, -1], WIN = 1000000;
    const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const inb = (r, c) => r >= 0 && r < N && c >= 0 && c < N;
    const seg = (b, p, d, c) => {
      const r = (p / N) | 0, cc = p % N;
      let lo = 0, hi = 0;
      while (lo > -5) { const rr = r + DR[d] * (lo - 1), c2 = cc + DC[d] * (lo - 1); if (!inb(rr, c2) || b[rr * N + c2] !== c) break; lo--; }
      while (hi < 5) { const rr = r + DR[d] * (hi + 1), c2 = cc + DC[d] * (hi + 1); if (!inb(rr, c2) || b[rr * N + c2] !== c) break; hi++; }
      return [lo, hi];
    };
    const exactFor = (rule, c) => rule === 'std' || (rule === 'renju' && c === 1);
    const winLine = (b, p, c, rule) => {
      const ex = exactFor(rule, c);
      for (let d = 0; d < 4; d++) {
        const s = seg(b, p, d, c), L = s[1] - s[0] + 1;
        if (ex ? L === 5 : L >= 5) {
          const r = (p / N) | 0, cc = p % N, out = [];
          for (let t = s[0]; t <= s[1]; t++) out.push((r + DR[d] * t) * N + cc + DC[d] * t);
          return out;
        }
      }
      return null;
    };
    const fourList = (b, p, d) => {
      const r = (p / N) | 0, cc = p % N, ts = [];
      for (let t = -4; t <= 4; t++) {
        if (!t) continue;
        const rr = r + DR[d] * t, c2 = cc + DC[d] * t;
        if (!inb(rr, c2)) continue;
        const q = rr * N + c2;
        if (b[q] !== 0) continue;
        b[q] = 1;
        const s = seg(b, q, d, 1);
        if (s[1] - s[0] === 4 && s[0] <= -t && -t <= s[1]) ts.push(t);
        b[q] = 0;
      }
      return ts;
    };
    const openThree = (b, p, d, depth) => {
      const r = (p / N) | 0, cc = p % N;
      for (let t = -4; t <= 4; t++) {
        if (!t) continue;
        const rr = r + DR[d] * t, c2 = cc + DC[d] * t;
        if (!inb(rr, c2)) continue;
        const q = rr * N + c2;
        if (b[q] !== 0) continue;
        b[q] = 1;
        const ts = fourList(b, p, d), open = ts.length === 2 && ts[1] - ts[0] === 5;
        b[q] = 0;
        if (open && !(depth > 0 && forbidden(b, q, depth - 1))) return true;
      }
      return false;
    };
    let fw = '';
    function forbidden(b, p, depth) {
      if (depth === undefined) depth = 2;
      b[p] = 1;
      let res = '';
      let five = false;
      for (let d = 0; d < 4; d++) { const s = seg(b, p, d, 1); if (s[1] - s[0] === 4) five = true; }
      if (!five) {
        let over = false;
        for (let d = 0; d < 4; d++) { const s = seg(b, p, d, 1); if (s[1] - s[0] >= 5) over = true; }
        if (over) res = 'overline';
        else {
          let nf = 0;
          for (let d = 0; d < 4; d++) {
            const ts = fourList(b, p, d);
            nf += ts.length === 2 && ts[1] - ts[0] === 5 ? 1 : ts.length;
          }
          if (nf >= 2) res = 'double-four';
          else {
            let n3 = 0;
            for (let d = 0; d < 4; d++) if (fourList(b, p, d).length === 0 && openThree(b, p, d, depth)) n3++;
            if (n3 >= 2) res = 'double-three';
          }
        }
      }
      b[p] = 0;
      fw = res;
      return !!res;
    }

    function Game(cfg) {
      const rule = cfg.rules, b = new Int8Array(NN), num = new Int16Array(NN);
      let mv = [], res = null, line = null;
      const turn = () => mv.length % 2 === 0 ? 1 : 2;
      const legal = p => {
        if (res || !(p >= 0 && p < NN) || b[p] !== 0) return false;
        if (rule === 'renju' && mv.length === 0) return p === 112;
        if (rule === 'renju' && turn() === 1 && forbidden(b, p)) return false;
        return true;
      };
      const why = p => {
        if (res || !(p >= 0 && p < NN) || b[p] !== 0) return '';
        if (rule === 'renju' && mv.length === 0 && p !== 112) return 'center';
        if (rule === 'renju' && turn() === 1 && forbidden(b, p)) return 'forbidden';
        return '';
      };
      const play = p => {
        if (!legal(p)) return null;
        const c = turn();
        b[p] = c; mv.push(p); num[p] = mv.length;
        const wl = winLine(b, p, c, rule);
        if (wl) { res = { winner: c, by: 'five', line: wl }; line = wl; }
        else if (mv.length >= NN) res = { winner: 0, by: 'full' };
        return { color: c, p, line: wl, draw: !wl && !!res };
      };
      const resign = c => { if (res) return null; res = { winner: 3 - c, by: 'resign' }; return res; };
      const rebuild = list => { b.fill(0); num.fill(0); mv = []; res = null; line = null; for (const p of list) if (!play(p)) break; };
      const undo = k => rebuild(mv.slice(0, Math.max(0, mv.length - k)));
      const forbids = () => {
        const out = [];
        if (rule !== 'renju' || res || turn() !== 1 || !mv.length) return out;
        for (let p = 0; p < NN; p++) if (b[p] === 0 && forbidden(b, p)) out.push(p);
        return out;
      };
      return {
        cfg, b, num, play, legal, why, resign, undo, rebuild, forbids,
        get moves() { return mv; }, get res() { return res; }, set res(v) { res = v; }, get turn() { return turn(); },
        get phase() { return res ? 'over' : 'play'; },
        save: () => ({ mv: mv.slice(), res: res ? JSON.parse(JSON.stringify(res)) : null }),
        load(s) { rebuild(s.mv); if (s.res && !res) res = s.res; if (s.res && s.res.by === 'resign') res = s.res; }
      };
    }

    const W5 = [0, 2, 12, 90, 800, 100000], wv = (kb, kw) => kw === 0 ? W5[kb] : kb === 0 ? -W5[kw] : 0;
    const NB = new Int16Array(4 * NN * 10), WL = [], NEAR = [], CEN = new Int8Array(NN);
    let TF = null, TE = null;
    for (let p = 0; p < NN; p++) {
      const r = (p / N) | 0, c = p % N, nr = [];
      CEN[p] = 7 - Math.max(Math.abs(r - 7), Math.abs(c - 7));
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) if ((dr || dc) && inb(r + dr, c + dc)) nr.push((r + dr) * N + c + dc);
      NEAR.push(Int16Array.from(nr));
      for (let d = 0; d < 4; d++) { let i = 0; for (let k = -5; k <= 5; k++) { if (!k) continue; const rr = r + DR[d] * k, cc = c + DC[d] * k; NB[(d * NN + p) * 10 + i++] = inb(rr, cc) ? rr * N + cc : -1; } }
    }
    for (let p = 0; p < NN; p++) {
      const list = [], r = (p / N) | 0, c = p % N;
      for (let d = 0; d < 4; d++) for (let k = 0; k < 5; k++) {
        const sr = r - DR[d] * k, sc = c - DC[d] * k, er = sr + DR[d] * 4, ec = sc + DC[d] * 4;
        if (inb(sr, sc) && inb(er, ec)) list.push(d * NN + sr * N + sc);
      }
      WL.push(Int16Array.from(list));
    }
    const runOf = (a, i) => { let l = i, r = i; while (l > 0 && a[l - 1] === 1) l--; while (r < 10 && a[r + 1] === 1) r++; return [l, r]; };
    const comps = (a, exact) => {
      const set = [];
      for (let s = 1; s <= 5; s++) {
        let k = 0, e = -1, bad = false;
        for (let i = s; i < s + 5; i++) { if (a[i] === 2) bad = true; else if (a[i] === 1) k++; else e = i; }
        if (bad || k !== 4) continue;
        a[e] = 1;
        const rr = runOf(a, e), ln = rr[1] - rr[0] + 1;
        a[e] = 0;
        if ((exact ? ln === 5 : ln >= 5) && set.indexOf(e) < 0) set.push(e);
      }
      return set.length;
    };
    const classify = (a, exact) => {
      const rr = runOf(a, 5), len = rr[1] - rr[0] + 1;
      if (len >= 5) return exact ? (len === 5 ? 6 : 7) : 6;
      const c0 = comps(a, exact);
      if (c0 >= 2) return 5;
      if (c0 === 1) return 4;
      let best = 0;
      for (let j = 0; j < 11; j++) {
        if (a[j] !== 0) continue;
        a[j] = 1;
        const c1 = comps(a, exact);
        a[j] = 0;
        if (c1 >= 2) return 3;
        if (c1 === 1) best = 2;
      }
      return best;
    };
    const buildTab = exact => {
      const t = new Uint8Array(59049), a = new Array(11).fill(0);
      a[5] = 1;
      for (let code = 0; code < 59049; code++) {
        let x = code;
        for (let i = 0; i < 11; i++) { if (i === 5) continue; a[i] = x % 3; x = (x - a[i]) / 3; }
        t[code] = classify(a, exact);
      }
      return t;
    };
    const B = new Int8Array(NN), near = new Uint8Array(NN), wb = new Uint8Array(4 * NN), ww = new Uint8Array(4 * NN), stack = new Int16Array(NN + 8), Z1 = new Int32Array(3 * NN), Z2 = new Int32Array(3 * NN);
    let zs = 2463534242;
    for (let i = 0; i < 3 * NN; i++) { zs ^= zs << 13; zs >>>= 0; zs ^= zs >>> 17; zs ^= zs << 5; zs >>>= 0; Z1[i] = zs | 0; zs ^= zs << 13; zs >>>= 0; zs ^= zs >>> 17; zs ^= zs << 5; zs >>>= 0; Z2[i] = zs | 0; }
    let turn = 1, ev = 0, h1 = 0, h2 = 0, sp = 0, rule = 'free', nodes = 0, endT = 0, aborted = false, tt = new Map(), vcfD = 0, rnd = Math.random;
    let gF5 = 0, gO4 = 0, gF4 = 0, gO3 = 0, gT3 = 0, gOV = 0;
    const GM = [], GS = [];
    for (let i = 0; i < 64; i++) { GM.push(new Int16Array(NN)); GS.push(new Float64Array(NN)); }
    const reset = rl => {
      B.fill(0); near.fill(0); wb.fill(0); ww.fill(0);
      turn = 1; ev = 0; h1 = 0; h2 = 0; sp = 0; rule = rl; tt = new Map();
      if (!TF) { TF = buildTab(false); TE = buildTab(true); }
    };
    const make = p => {
      const c = turn;
      B[p] = c; h1 ^= Z1[c * NN + p]; h2 ^= Z2[c * NN + p]; stack[sp++] = p;
      const wl = WL[p];
      for (let i = 0; i < wl.length; i++) {
        const w = wl[i], kb = wb[w], kw = ww[w];
        ev -= wv(kb, kw);
        if (c === 1) wb[w] = kb + 1; else ww[w] = kw + 1;
        ev += wv(wb[w], ww[w]);
      }
      const nr = NEAR[p];
      for (let i = 0; i < nr.length; i++) near[nr[i]]++;
      turn = 3 - c;
    };
    const unmake = () => {
      const p = stack[--sp];
      turn = 3 - turn;
      const c = turn;
      B[p] = 0; h1 ^= Z1[c * NN + p]; h2 ^= Z2[c * NN + p];
      const wl = WL[p];
      for (let i = 0; i < wl.length; i++) {
        const w = wl[i], kb = wb[w], kw = ww[w];
        ev -= wv(kb, kw);
        if (c === 1) wb[w] = kb - 1; else ww[w] = kw - 1;
        ev += wv(wb[w], ww[w]);
      }
      const nr = NEAR[p];
      for (let i = 0; i < nr.length; i++) near[nr[i]]--;
    };
    const mval = (p, c) => {
      const T = exactFor(rule, c) ? TE : TF;
      gF5 = gO4 = gF4 = gO3 = gT3 = gOV = 0;
      for (let d = 0; d < 4; d++) {
        const base = (d * NN + p) * 10;
        let code = 0, mul = 1;
        for (let i = 0; i < 10; i++) { const q = NB[base + i], st = q < 0 ? 2 : B[q] === 0 ? 0 : B[q] === c ? 1 : 2; code += st * mul; mul *= 3; }
        const cl = T[code];
        if (cl === 6) gF5++; else if (cl === 5) gO4++; else if (cl === 4) gF4++; else if (cl === 3) gO3++; else if (cl === 2) gT3++; else if (cl === 7) gOV++;
      }
      let pot = 0;
      const wl = WL[p];
      for (let i = 0; i < wl.length; i++) { const w = wl[i]; if (c === 1) { if (ww[w] === 0) pot += 1 + wb[w] * 3; } else if (wb[w] === 0) pot += 1 + ww[w] * 3; }
      if (gF5) return 1e6;
      if (gO4 || gF4 >= 2) return 1e5;
      if (gF4 && gO3) return 5e4;
      if (gO3 >= 2) return 2e4;
      return gF4 * 3000 + gO3 * 1200 + gT3 * 150 + pot + CEN[p];
    };
    const banned = p => rule === 'renju' && turn === 1 && (gO4 || gF4 >= 2 || gO3 >= 2 || gOV) && !gF5 && forbidden(B, p);
    const canFive = c => {
      for (let p = 0; p < NN; p++) if (B[p] === 0 && near[p]) { mval(p, c); if (gF5) return p; }
      return -1;
    };
    const fivesAround = (p, c) => {
      const r = (p / N) | 0, cc = p % N, out = [];
      for (let d = 0; d < 4; d++) for (let t = -4; t <= 4; t++) {
        if (!t) continue;
        const rr = r + DR[d] * t, c2 = cc + DC[d] * t;
        if (!inb(rr, c2)) continue;
        const q = rr * N + c2;
        if (B[q] !== 0 || out.indexOf(q) >= 0) continue;
        mval(q, c);
        if (gF5) out.push(q);
      }
      return out;
    };
    const strongFor = c => {
      for (let z = 0; z < NN; z++) {
        if (B[z] !== 0 || !near[z]) continue;
        if (mval(z, c) >= 1e5) { if (rule === 'renju' && c === 1 && !gF5 && forbidden(B, z)) continue; return true; }
      }
      return false;
    };
    const stopped = () => { if (aborted) return true; if ((++nodes & 511) === 0 && clock() > endT) aborted = true; return aborted; };
    const vcf = (depth, ply) => {
      if (depth <= 0 || stopped()) return false;
      const me = turn, op = 3 - me;
      if (canFive(op) >= 0) return false;
      const M = GM[ply], S = GS[ply];
      let n = 0;
      for (let p = 0; p < NN; p++) {
        if (B[p] !== 0 || !near[p]) continue;
        const a = mval(p, me);
        if (a >= 1e6) return true;
        if (gO4 || gF4) { if (banned(p)) continue; M[n] = p; S[n++] = a; }
      }
      for (let i = 1; i < n; i++) { const m = M[i], s = S[i]; let j = i - 1; while (j >= 0 && S[j] < s) { M[j + 1] = M[j]; S[j + 1] = S[j]; j--; } M[j + 1] = m; S[j + 1] = s; }
      const cand = Array.from(M.subarray(0, n));
      for (let i = 0; i < cand.length; i++) {
        const p = cand[i];
        make(p);
        const fv = fivesAround(p, me);
        let ok = false;
        if (fv.length >= 2) ok = canFive(3 - me) < 0;
        else if (fv.length === 1) {
          if (canFive(3 - me) < 0) {
            const q = fv[0];
            make(q);
            ok = vcf(depth - 2, ply + 1);
            unmake();
          }
        }
        unmake();
        if (ok) return true;
        if (aborted) return false;
      }
      return false;
    };
    const vcfRoot = depth => {
      const me = turn;
      if (canFive(3 - me) >= 0) return -1;
      const list = [];
      for (let p = 0; p < NN; p++) {
        if (B[p] !== 0 || !near[p]) continue;
        const a = mval(p, me);
        if (a >= 1e6) return p;
        if ((gO4 || gF4) && !banned(p)) list.push([a, p]);
      }
      list.sort((x, y) => y[0] - x[0]);
      for (const [, p] of list) {
        make(p);
        const fv = fivesAround(p, me);
        let ok = false;
        if (fv.length >= 2) ok = canFive(3 - me) < 0;
        else if (fv.length === 1 && canFive(3 - me) < 0) { make(fv[0]); ok = vcf(depth - 2, 1); unmake(); }
        unmake();
        if (ok) return p;
        if (aborted) return -1;
      }
      return -1;
    };
    const vct = (depth, ply) => {
      if (depth <= 0 || stopped()) return false;
      const me = turn, op = 3 - me;
      if (canFive(op) >= 0) return false;
      const thr = [], oppS = strongFor(op);
      for (let p = 0; p < NN; p++) {
        if (B[p] !== 0 || !near[p]) continue;
        const a = mval(p, me);
        if (a >= 1e5) { if (banned(p)) continue; return true; }
        if (gF4 || (gO3 && !oppS)) { if (banned(p)) continue; thr.push([a + (gF4 ? 5e4 : 0), p, gF4 > 0]); }
      }
      thr.sort((x, y) => y[0] - x[0]);
      for (let k = 0; k < thr.length && k < 8; k++) {
        const p = thr[k][1], isFour = thr[k][2];
        make(p);
        let ok = false;
        if (isFour) {
          const fv = fivesAround(p, me);
          if (fv.length >= 2) ok = canFive(op) < 0;
          else if (fv.length === 1 && canFive(op) < 0) { make(fv[0]); ok = vct(depth - 2, ply + 1); unmake(); }
        } else {
          const defs = [];
          for (let q = 0; q < NN; q++) {
            if (B[q] !== 0 || !near[q]) continue;
            const dv = mval(q, op) + mval(q, me) * .5;
            defs.push([dv, q]);
          }
          defs.sort((x, y) => y[0] - x[0]);
          let all = true, cnt = 0;
          for (let i = 0; i < defs.length && cnt < 12 && all; i++) {
            const q = defs[i][1];
            make(q);
            cnt++;
            let wins = false;
            if (canFive(me) >= 0) wins = true;
            else {
              if (strongFor(me)) { wins = true; } else {
                let oppFour = false;
                mval(q, op);
                if (gF4 || gO4) oppFour = true;
                if (oppFour) { all = false; }
                else wins = vct(depth - 2, ply + 1);
              }
            }
            unmake();
            if (!wins) all = false;
            if (aborted) { all = false; break; }
          }
          ok = all && cnt > 0;
        }
        unmake();
        if (ok) return true;
        if (aborted) return false;
      }
      return false;
    };
    const vctRoot = depth => {
      const me = turn;
      if (canFive(3 - me) >= 0) return -1;
      const thr = [], oppS = strongFor(3 - me);
      for (let p = 0; p < NN; p++) {
        if (B[p] !== 0 || !near[p]) continue;
        const a = mval(p, me);
        if (a >= 1e5 && !banned(p)) return p;
        if ((gF4 || (gO3 && !oppS)) && !banned(p)) thr.push([a + (gF4 ? 5e4 : 0), p]);
      }
      thr.sort((x, y) => y[0] - x[0]);
      for (let k = 0; k < thr.length && k < 8; k++) {
        const p = thr[k][1];
        make(p);
        const ok = vct(depth - 1, 1);
        unmake();
        if (ok) return p;
        if (aborted) return -1;
      }
      return -1;
    };

    const gen = (me, ply, K, root) => {
      const op = 3 - me, M = GM[ply], S = GS[ply];
      let n = 0, strongP = -1, blocks = [];
      for (let p = 0; p < NN; p++) {
        if (B[p] !== 0 || !near[p]) continue;
        const a = mval(p, me), f5a = gF5, strongA = a >= 1e5, ban = banned(p);
        if (f5a) return { win: true, p };
        const dv = mval(p, op), f5d = gF5;
        if (f5d) { blocks.push(p); continue; }
        if (ban) continue;
        if (strongA && strongP < 0) strongP = p;
        M[n] = p; S[n++] = a + dv * .95;
      }
      if (blocks.length >= 2) return { lose: true };
      if (blocks.length === 0 && strongP >= 0 && !root) return { win: true, p: strongP, quick: true };
      if (blocks.length === 1) {
        const p = blocks[0];
        if (rule === 'renju' && me === 1) { mval(p, me); if (banned(p)) return { lose: true }; }
        M[0] = p; S[0] = 1; return { n: 1 };
      }
      for (let i = 1; i < n; i++) { const m = M[i], s = S[i]; let j = i - 1; while (j >= 0 && S[j] < s) { M[j + 1] = M[j]; S[j + 1] = S[j]; j--; } M[j + 1] = m; S[j + 1] = s; }
      return { n: Math.min(n, K) };
    };
    const leaf = () => (turn === 1 ? ev : -ev) + 25;
    const ab = (d, alpha, beta, ply) => {
      if (stopped()) return 0;
      const me = turn, key = (h1 >>> 0) * 2097152 + (h2 & 2097151), ent = tt.get(key);
      let tm = -1;
      if (ent) {
        tm = ent.m;
        if (ent.d >= d) {
          if (ent.f === 0) return ent.s;
          if (ent.f === 1 && ent.s >= beta) return ent.s;
          if (ent.f === 2 && ent.s <= alpha) return ent.s;
        }
      }
      if (d <= 0) {
        if (vcfD > 0 && ply < 48) {
          const sv = vcfD;
          if (vcf(Math.min(sv, 10), ply)) return WIN - ply;
          if (aborted) return 0;
        }
        return leaf();
      }
      const K = d >= 6 ? 8 : d >= 4 ? 10 : 12, g = gen(me, ply, K, false);
      if (g.win) return WIN - ply - (g.quick ? 2 : 0);
      if (g.lose) return -WIN + ply + 2;
      if (g.n === 0) return 0;
      const M = GM[ply], list = Array.from(M.subarray(0, g.n));
      if (tm >= 0) { const i = list.indexOf(tm); if (i > 0) { list.splice(i, 1); list.unshift(tm); } }
      let best = -Infinity, bm = list[0], flag = 2;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        make(p);
        let s;
        if (i === 0) s = -ab(d - 1, -beta, -alpha, ply + 1);
        else { s = -ab(d - 1, -alpha - 1, -alpha, ply + 1); if (s > alpha && s < beta && !aborted) s = -ab(d - 1, -beta, -alpha, ply + 1); }
        unmake();
        if (aborted) return 0;
        if (s > best) { best = s; bm = p; }
        if (s > alpha) { alpha = s; flag = 0; }
        if (alpha >= beta) { flag = 1; break; }
      }
      if (tt.size < 400000) tt.set(key, { d, f: flag, s: best, m: bm });
      return best;
    };

    const think = (state, cfg) => {
      reset(state.rules);
      for (let i = 0; i < state.moves.length; i++) make(state.moves[i]);
      const me = turn, op = 3 - me, lvl = cfg.level | 0;
      const t0 = clock();
      endT = t0 + (cfg.ms || 500); aborted = false; nodes = 0; vcfD = 0;
      if (state.moves.length === 0) return { move: rule === 'renju' ? 112 : 112 };
      const info = { depth: 0, nodes: 0, how: '' };
      const rcand = () => {
        const out = [];
        for (let p = 0; p < NN; p++) {
          if (B[p] !== 0 || !near[p]) continue;
          const a = mval(p, me), f5 = gF5, ban = banned(p);
          const dv = mval(p, op);
          out.push({ p, a, d: dv, f5, ban, s: a + dv * .95 });
        }
        return out;
      };
      let cs = rcand();
      const mine = cs.find(x => x.f5 && !x.ban);
      if (mine) return { move: mine.p, how: 'five' };
      const blk = cs.filter(x => x.d >= 1e6 && !x.ban);
      const miss = lvl === 0 ? .12 : lvl === 1 ? .04 : 0;
      cs = cs.filter(x => !x.ban);
      if (!cs.length) return { move: -1 };
      if (blk.length && rnd() >= miss) return { move: blk[0].p, how: 'block' };
      cs.sort((x, y) => y.s - x.s);
      if (lvl <= 1) {
        const pickN = lvl === 0 ? 7 : 3, pool = cs.slice(0, pickN);
        const top = pool[0].s;
        const w = pool.map((x, i) => Math.max(.02, (x.s + 50) / (top + 50)) ** (lvl === 0 ? 1 : 3) * (i === 0 ? 1.4 : 1));
        let tot = 0; for (const v of w) tot += v;
        let r = rnd() * tot, k = 0;
        for (; k < pool.length - 1 && r > w[k]; k++) r -= w[k];
        if (lvl === 1 && cs[0].a >= 1e5) return { move: cs[0].p, how: 'open four' };
        return { move: pool[k].p, how: 'pick' };
      }
      if (lvl >= 2 && state.moves.length <= 3) { const pool = cs.slice(0, 4); return { move: pool[(rnd() * pool.length) | 0].p, how: 'opening' }; }
      if (lvl >= 2 && cs[0].a >= 1e5) return { move: cs[0].p, how: 'open four' };
      const maxD = [0, 0, 4, 6, 12][lvl] || 4, vd = [0, 0, 6, 10, 14][lvl] || 6;
      vcfD = 0;
      if (lvl >= 3) {
        const vm = vcfRoot(vd + 2);
        if (vm >= 0) return { move: vm, how: 'vcf' };
        aborted = false;
      } else {
        const vm = vcfRoot(6);
        if (vm >= 0) return { move: vm, how: 'vcf' };
        aborted = false;
      }
      if (lvl >= 3) {
        const save = endT;
        endT = Math.min(save, clock() + (cfg.ms || 500) * .3);
        const vm = vctRoot(lvl === 4 ? 8 : 6);
        endT = save;
        if (vm >= 0 && !aborted) return { move: vm, how: 'vct' };
        aborted = false;
      }
      vcfD = lvl >= 3 ? vd : lvl === 2 ? 6 : 0;
      const rootK = lvl === 2 ? 14 : 18;
      const list = cs.slice(0, rootK).map(x => x.p);
      let best = list[0], bestS = -Infinity;
      const scores = new Map();
      for (let d = 1; d <= maxD; d++) {
        let curBest = -1, curS = -Infinity, alpha = -Infinity;
        const ordered = best >= 0 ? [best, ...list.filter(x => x !== best)] : list;
        let done = true;
        const sc = new Map();
        for (let i = 0; i < ordered.length; i++) {
          const p = ordered[i];
          make(p);
          let s;
          if (winLine(B, p, me, rule)) s = WIN;
          else if (i === 0) s = -ab(d - 1, -WIN * 2, -alpha, 1);
          else { s = -ab(d - 1, -alpha - 1, -alpha, 1); if (s > alpha && !aborted) s = -ab(d - 1, -WIN * 2, -alpha, 1); }
          unmake();
          if (aborted) { done = false; break; }
          sc.set(p, s);
          if (s > curS) { curS = s; curBest = p; }
          if (s > alpha) alpha = s;
        }
        if (done && curBest >= 0) { best = curBest; bestS = curS; info.depth = d; scores.clear(); for (const [k, v] of sc) scores.set(k, v); if (curS >= WIN - 100) break; if (curS <= -WIN + 100) break; }
        else break;
        if (clock() > endT) break;
      }
      info.nodes = nodes;
      if (lvl === 2 && scores.size > 1) {
        const arr = [...scores.entries()].sort((x, y) => y[1] - x[1]);
        if (arr[0][1] < WIN - 100) {
          const pool = arr.filter(x => x[1] >= arr[0][1] - 60).slice(0, 3);
          best = pool[(rnd() * pool.length) | 0][0];
        }
      }
      return { move: best, score: bestS, depth: info.depth, nodes, how: 'search' };
    };

    return { Game, think, forbidden, winLine, N, NN, seg, why: () => fw, setRnd: f => { rnd = f; } };
  }
  const GM_NAMES = { 1: 'Black', 2: 'White' };
  const GM_CHIP = { 1: 'radial-gradient(circle at 35% 30%,#7b7b88,#2a2a30 50%,#050507)', 2: 'radial-gradient(circle at 35% 30%,#fff,#eeeef4 55%,#a6a6b8)' };
  const GM_THEME = { bg: '#1f272b', pn: '#2b363b', pn2: '#394850', ink: '#eef3f2', mut: '#a9bbb8', acc: '#58c2ae', acc2: '#2f8f7d', accInk: '#06231e', ln: '#46585d', cv: '#161c1f' };
  const gomokuCss = kitCss('.gm-gomoku', GM_THEME);
  const GM_LETTERS = 'ABCDEFGHIJKLMNO';
  const GM_HOSHI = [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]];
  const GM_RULES = { free: 'Freestyle', std: 'Standard', renju: 'Renju' };
  const GM_LEVELS = [
    { name: 'Beginner', ms: 60 },
    { name: 'Easy', ms: 120 },
    { name: 'Medium', ms: 600 },
    { name: 'Hard', ms: 2200 },
    { name: 'Expert', ms: 4500 }
  ];
  const gmCoord = p => GM_LETTERS[p % 15] + (15 - ((p / 15) | 0));

  function gomokuModel(E, cfg) {
    const g = E.Game(cfg);
    return {
      g, cfg,
      turnColor: () => g.res ? 0 : g.turn,
      phase: () => g.phase,
      count: () => g.moves.length,
      save: () => g.save(),
      load: s => { g.load(s); },
      act(color, a) {
        if (!a || typeof a !== 'object') return null;
        if (a.k === 'p') {
          if (g.res || g.turn !== color) return null;
          const r = g.play(a.p);
          return r ? { k: 'move', ...r } : null;
        }
        if (a.k === 'resign') {
          if (g.res) return null;
          g.resign(color);
          return { k: 'resign', color };
        }
        return null;
      }
    };
  }

  function mountGomoku(root, api) {
    const E = gomokuEngine(), au = audioKit(api);
    let tex = {}, spr = {}, worker = null, wurl = null, pend = new Map(), seq = 0, pl = {}, winAt = 0, fcache = { n: -1, list: [] };
    const getTex = () => tex.t || (tex.t = boardTexture(geo(15, 36), GM_HOSHI, 'shin', 31, GM_LETTERS));
    const getSpr = cell => {
      const key = Math.round(cell * 10);
      if (!spr[key]) { const d = dprOf(); spr[key] = { 1: stoneSprite('glass', true, cell, d), 2: stoneSprite('glass', false, cell, d), s: cell * 1.5 }; }
      return spr[key];
    };
    const getWorker = () => {
      if (worker !== null) return worker;
      try {
        const src = 'const E=(' + gomokuEngine.toString() + ')();onmessage=e=>{const d=e.data;if(d.warm){E.think({rules:"free",moves:[112,113]},{level:0,ms:1});postMessage({id:0});return}const r=E.think(d.state,d.cfg);postMessage({id:d.id,r});};';
        wurl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        worker = new Worker(wurl);
        worker.onmessage = e => { const f = pend.get(e.data.id); pend.delete(e.data.id); if (f) f(e.data.r); };
        worker.onerror = () => { const w = worker; worker = false; try { w.terminate(); } catch (er) {} const list = [...pend.values()]; pend.clear(); list.forEach(f => f(undefined)); };
        worker.postMessage({ warm: 1 });
      } catch (e) { worker = false; }
      return worker;
    };
    const fallbackMove = g => {
      const near = [];
      for (let p = 0; p < 225; p++) if (g.b[p] === 0 && g.legal(p)) near.push(p);
      let best = near[0], bd = 1e9;
      for (const p of near) { const d = Math.abs((p / 15 | 0) - 7) + Math.abs(p % 15 - 7); if (d < bd) { bd = d; best = p; } }
      return best;
    };
    function aiGomoku(model, col, opt, cb, sh) {
      const g = model.g, lv = +opt.level, lvl = GM_LEVELS[lv] || GM_LEVELS[2], t0 = now(), tok = ++seq;
      let dead = false;
      const state = { rules: g.cfg.rules, moves: g.moves.slice() }, cfg = { level: lv, ms: lvl.ms };
      const done = r => {
        if (dead) return;
        let mv = r && typeof r.move === 'number' ? r.move : -1;
        if (mv < 0 || !g.legal(mv)) mv = fallbackMove(g);
        const wait = Math.max(0, (lv > 1 ? 480 : 620) - (now() - t0));
        api.timeout(() => { if (!dead) cb({ k: 'p', p: mv }); }, wait);
      };
      const w = getWorker();
      if (w) { pend.set(tok, done); w.postMessage({ id: tok, state, cfg }); }
      else api.timeout(() => { if (!dead) done(E.think(state, { level: lv, ms: Math.min(lvl.ms, 400) })); }, 120);
      return { cancel() { dead = true; pend.delete(tok); }, info: () => lv > 1 ? 'Thinking…' : '' };
    }
    const forbList = g => {
      if (g.cfg.rules !== 'renju' || g.res || g.turn !== 1 || !g.moves.length) return [];
      if (fcache.n !== g.moves.length || fcache.g !== g) fcache = { n: g.moves.length, g, list: g.forbids() };
      return fcache.list;
    };
    const SP = {
      title: 'Gomoku', SZ: BSZ, audio: au,
      fields: [
        { key: 'rules', label: 'Rules', def: 'free', opts: () => [['free', 'Freestyle'], ['std', 'Standard'], ['renju', 'Renju']] },
        { key: 'side', label: 'You play', def: 'black', opts: () => [['black', 'Black'], ['white', 'White'], ['random', 'Random']] },
        { key: 'level', label: 'AI strength', def: 2, opts: () => GM_LEVELS.map((l, i) => [i, l.name]), when: o => o.mode === 'ai' },
        { key: 'nums', label: 'Move numbers', def: 0, opts: () => [[0, 'Off'], [1, 'On']], live: true }
      ],
      chip: GM_CHIP,
      cfgOf: o => ({ rules: o.rules }),
      newModel: cfg => gomokuModel(E, cfg),
      aiName: o => (GM_LEVELS[+o.level] || GM_LEVELS[2]).name,
      ranked: m => m.g.moves.length > 0 && !m.g.res,
      canAct: (m, me) => !m.g.res && m.g.turn === me,
      aiNeeded: (m, col) => !m.g.res && m.g.turn === col,
      ai: aiGomoku,
      undo: (m, me) => {
        const g = m.g, k = g.turn === me ? 2 : 1;
        if (g.moves.length < k) return false;
        g.undo(k);
        return true;
      },
      cardSub: (m, col) => { const n = (m.g.moves.length + (col === 1 ? 1 : 0)) >> 1; return `${GM_NAMES[col]} · ${n} stone${n === 1 ? '' : 's'}`; },
      status(m, c) {
        const g = m.g;
        if (g.turn === c.me) return [g.cfg.rules === 'renju' && c.me === 1 ? 'Your move · avoid the marked points' : 'Your move', 'turn'];
        return [c.online ? 'Waiting for your opponent…' : 'AI is thinking…'];
      },
      buttons(c) {
        const g = c.model.g;
        if (c.online) return [['resign', c.sure ? 'Sure?' : 'Resign', { ghost: 1 }]];
        return [['undo', 'Undo', { dis: g.moves.length < (g.turn === c.me ? 2 : 1) }], ['resign', c.sure ? 'Sure?' : 'Resign', { ghost: 1 }], ['new', 'New game', { ghost: 1 }]];
      },
      pick(p, touchMode, m) {
        if (!m) return -1;
        const G = geo(15, 36);
        let y = p.y;
        if (touchMode) y -= G.cell * 1.4 * clamp01((G.y0 + G.span - p.y) / (G.cell * 3));
        const c = Math.round((p.x - G.x0) / G.cell), r = Math.round((y - G.y0) / G.cell);
        if (c < 0 || c >= 15 || r < 0 || r >= 15) return -1;
        if (!touchMode && Math.hypot(p.x - (G.x0 + c * G.cell), p.y - (G.y0 + r * G.cell)) > G.cell * .75) return -1;
        return r * 15 + c;
      },
      step(cur, dx, dy) {
        if (cur < 0) return 112;
        return clamp((cur / 15 | 0) + dy, 0, 14) * 15 + clamp(cur % 15 + dx, 0, 14);
      },
      click(m, pt, me) {
        const g = m.g;
        if (g.res || g.turn !== me) return null;
        return g.legal(pt) ? { k: 'p', p: pt } : null;
      },
      reject(sh, pt) {
        const g = sh.model.g;
        if (g.res || g.turn !== sh.me || sh.thinking || g.b[pt]) return;
        au.bad();
        const w = g.why(pt);
        if (w === 'center') api.toast('Renju: the first move goes in the center');
        else if (w === 'forbidden') api.toast('Forbidden for Black: ' + ({ overline: 'overline', 'double-four': 'double four', 'double-three': 'double three' }[E.why()] || 'restricted point'));
      },
      start(sh) { pl = {}; winAt = 0; fcache = { n: -1, list: [] }; },
      fx(sh, r, color) {
        const t = now();
        if (r.k === 'move') {
          au.stone(color);
          pl[r.p] = t;
          if (r.line) { winAt = t; }
        }
        sh.dirty();
      },
      fxLoad(sh, before) {
        const g = sh.model.g, t = now(), n = g.moves.length;
        for (let i = before; i < n; i++) { pl[g.moves[i]] = t + (i - before) * 120; }
        if (n > before) au.stone(n % 2 ? 1 : 2);
        if (g.res && g.res.line) winAt = t;
        sh.dirty();
      },
      busy(sh) {
        const t = now();
        let any = false;
        for (const k in pl) { if (t - pl[k] > 260) delete pl[k]; else any = true; }
        return any || (winAt > 0 && t - winAt < 3200);
      },
      result(m, me) {
        const g = m.g, r = g.res, mv = g.moves.length;
        const rn = GM_RULES[g.cfg.rules];
        if (r.by === 'resign') {
          const loser = 3 - r.winner;
          return { winner: r.winner, why: GM_NAMES[loser] + ' resigned', text: GM_NAMES[loser] + ' resigned after ' + mv + ' moves.', stats: [['Moves', mv], ['Rules', rn]], delay: 700 };
        }
        if (r.by === 'full') return { winner: 0, why: 'Board full', text: 'The board is full with no winner.', stats: [['Moves', mv], ['Rules', rn]], delay: 700 };
        return { winner: r.winner, why: 'Five in a row', text: GM_NAMES[r.winner] + ' made ' + (g.cfg.rules === 'free' ? 'five or more' : 'exactly five') + ' in a row on move ' + mv + '.', stats: [['Moves', mv], ['Rules', rn], ['Winner', GM_NAMES[r.winner]]], delay: 1500 };
      },
      draw(c, sh) {
        const m = sh.model;
        if (!m) return;
        const g = m.g, G = geo(15, 36), cell = G.cell, sp = getSpr(cell), t = now();
        c.drawImage(getTex(), 0, 0, BSZ, BSZ);
        const px = p => G.x0 + (p % 15) * cell, py = p => G.y0 + ((p / 15) | 0) * cell;
        const put = (p, col, a, sc) => {
          c.globalAlpha = a;
          const w = sp.s * sc;
          c.drawImage(sp[col], px(p) - w / 2, py(p) - w / 2, w, w);
          c.globalAlpha = 1;
        };
        const fl = forbList(g);
        if (fl.length && !sh.over) {
          c.strokeStyle = 'rgba(200,40,30,.85)'; c.lineWidth = 2.2; c.lineCap = 'round';
          const s = cell * .17;
          c.beginPath();
          for (const p of fl) { const x = px(p), y = py(p); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); }
          c.stroke();
        }
        const wl = g.res && g.res.line ? g.res.line : null;
        for (let p = 0; p < 225; p++) {
          const v = g.b[p];
          if (!v) continue;
          let sc = 1, al = 1;
          const t0 = pl[p];
          if (t0 != null) { const k = clamp01((t - t0) / 170); sc = 1 + .22 * (1 - easeOut(k)); al = .4 + .6 * easeOut(k); if (t < t0) { al = 0; } }
          put(p, v, al, sc);
        }
        if (+sh.opt.nums) {
          c.font = `800 ${Math.round(cell * .38)}px Nunito, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
          for (let p = 0; p < 225; p++) {
            const v = g.b[p], nm = g.num[p];
            if (!v || !nm) continue;
            c.fillStyle = v === 1 ? '#f2f2f6' : '#202026';
            c.fillText(String(nm), px(p), py(p) + 1);
          }
        }
        const lm = g.moves.length ? g.moves[g.moves.length - 1] : -1;
        if (lm >= 0 && !wl) {
          c.strokeStyle = g.b[lm] === 1 ? '#7fe0cf' : '#d6402f'; c.lineWidth = 2.2;
          c.beginPath(); c.arc(px(lm), py(lm), cell * .2, 0, 7); c.stroke();
        }
        if (wl) {
          const k = clamp01((t - winAt) / 420), pulse = .5 + .5 * Math.sin((t - winAt) / 160);
          const a = wl[0], z = wl[wl.length - 1];
          c.save();
          c.lineCap = 'round';
          c.strokeStyle = `rgba(255,214,90,${.55 * k})`; c.lineWidth = cell * .34;
          c.beginPath(); c.moveTo(px(a), py(a)); c.lineTo(px(a) + (px(z) - px(a)) * k, py(a) + (py(z) - py(a)) * k); c.stroke();
          c.strokeStyle = '#ffd35a'; c.lineWidth = 3;
          for (const p of wl) { c.globalAlpha = k * (.65 + .35 * (t - winAt < 3000 ? pulse : 1)); c.beginPath(); c.arc(px(p), py(p), cell * .5, 0, 7); c.stroke(); }
          c.restore();
        }
        const h = sh.hover;
        if (h >= 0 && !sh.over && !sh.thinking && g.turn === sh.me && g.b[h] === 0) {
          if (g.legal(h)) put(h, sh.me, .5, 1);
          else if (sh.drag) {
            c.strokeStyle = '#d8362b'; c.lineWidth = 3; c.lineCap = 'round'; const x = px(h), y = py(h), s = cell * .22;
            c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y + s); c.moveTo(x + s, y - s); c.lineTo(x - s, y + s); c.stroke();
          }
        }
        if (sh.cursor >= 0) {
          const x = px(sh.cursor), y = py(sh.cursor), s = cell * .5;
          c.save(); c.strokeStyle = '#ffd35a'; c.lineWidth = 2.6; c.shadowColor = 'rgba(255,211,90,.8)'; c.shadowBlur = 8;
          rr(c, x - s, y - s, s * 2, s * 2, 6); c.stroke(); c.restore();
        }
      }
    };
    stoneShell(root, api, SP).start();
    return { destroy() { pend.clear(); if (worker) { try { worker.terminate(); } catch (e) {} } if (wurl) URL.revokeObjectURL(wurl); } };
  }
  function dotsEngine() {
    const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    let rnd = Math.random;

    function Geo(w, h) {
      const nH = (h + 1) * w, nV = h * (w + 1), E = nH + nV, nB = w * h;
      const bE = [], eB = [], eInfo = [];
      for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) bE.push([r * w + c, (r + 1) * w + c, nH + r * (w + 1) + c, nH + r * (w + 1) + c + 1]);
      for (let r = 0; r <= h; r++) for (let c = 0; c < w; c++) { eB.push([r > 0 ? (r - 1) * w + c : -1, r < h ? r * w + c : -1]); eInfo.push({ h: true, r, c }); }
      for (let r = 0; r < h; r++) for (let c = 0; c <= w; c++) { eB.push([c > 0 ? r * w + c - 1 : -1, c < w ? r * w + c : -1]); eInfo.push({ h: false, r, c }); }
      return { w, h, nH, nV, E, nB, bE, eB, eInfo };
    }
    const geoCache = {};
    const geoOf = (w, h) => geoCache[w + 'x' + h] || (geoCache[w + 'x' + h] = Geo(w, h));

    function Game(cfg) {
      const w = cfg.w, h = cfg.h, np = cfg.np, G = geoOf(w, h), first = cfg.first || 1;
      const edges = new Uint8Array(G.E), own = new Uint8Array(G.nB), cnt = new Uint8Array(G.nB), scores = new Array(np + 1).fill(0);
      let moves = [], turn = first, res = null, drawn = 0, order = new Int16Array(G.E).fill(-1);
      const reset = () => { edges.fill(0); own.fill(0); cnt.fill(0); scores.fill(0); moves = []; turn = first; res = null; drawn = 0; order.fill(-1); };
      const legal = e => !res && e >= 0 && e < G.E && edges[e] === 0;
      const finish = () => {
        let best = -1;
        for (let i = 1; i <= np; i++) if (scores[i] > best) best = scores[i];
        const tops = [];
        for (let i = 1; i <= np; i++) if (scores[i] === best) tops.push(i);
        res = { winner: tops.length === 1 ? tops[0] : 0, tops, scores: scores.slice(), by: 'boxes' };
      };
      const play = (e, seat) => {
        if (!legal(e) || (seat && seat !== turn)) return null;
        const p = turn, got = [];
        edges[e] = p; order[e] = moves.length; drawn++;
        const bs = G.eB[e];
        for (let i = 0; i < 2; i++) {
          const b = bs[i];
          if (b < 0) continue;
          cnt[b]++;
          if (cnt[b] === 4) { own[b] = p; scores[p]++; got.push(b); }
        }
        const again = got.length > 0;
        moves.push({ e, p, got });
        let over = false;
        let sum = 0;
        for (let i = 1; i <= np; i++) sum += scores[i];
        if (sum === G.nB) { finish(); over = true; }
        else if (!again) turn = turn % np + 1;
        return { e, p, got, again, over, turn };
      };
      const rebuild = list => { reset(); for (const m of list) if (!play(m)) break; };
      const undoTo = n => { const l = moves.slice(0, Math.max(0, n)).map(m => m.e); rebuild(l); };
      return {
        cfg, G, edges, own, cnt, scores, play, legal, rebuild, undoTo, reset,
        get moves() { return moves; }, get turn() { return turn; }, get res() { return res; }, get drawn() { return drawn; }, get order() { return order; },
        get phase() { return res ? 'over' : 'play'; },
        save: () => ({ mv: moves.map(m => m.e), res: res ? JSON.parse(JSON.stringify(res)) : null }),
        load(s) { rebuild(s.mv); }
      };
    }

    const sideOK = (cnt, G, e) => { const b = G.eB[e]; return (b[0] < 0 || cnt[b[0]] < 2) && (b[1] < 0 || cnt[b[1]] < 2); };

    const analyze = (G, cnt, edges) => {
      const seen = new Uint8Array(G.nB), chains = [], loops = [];
      const nbrs = b => {
        const out = [];
        for (const e of G.bE[b]) if (edges[e] === 0) { const o = G.eB[e][0] === b ? G.eB[e][1] : G.eB[e][0]; out.push([o, e]); }
        return out;
      };
      let cap = 0;
      for (let b = 0; b < G.nB; b++) if (cnt[b] === 3) cap++;
      for (let b = 0; b < G.nB; b++) {
        if (seen[b] || cnt[b] !== 2) continue;
        const comp = [], st = [b];
        seen[b] = 1;
        let touch = 0;
        while (st.length) {
          const x = st.pop();
          comp.push(x);
          for (const [o] of nbrs(x)) {
            if (o < 0 || cnt[o] !== 2) { touch++; continue; }
            if (!seen[o]) { seen[o] = 1; st.push(o); }
          }
        }
        if (touch === 0) loops.push(comp.length); else chains.push(comp.length);
      }
      return { chains, loops, cap };
    };

    const memo = new Map();
    const compVal = (chains, loops) => {
      const key = chains.slice().sort((a, b) => a - b).join(',') + '|' + loops.slice().sort((a, b) => a - b).join(',');
      if (memo.has(key)) return memo.get(key);
      let best = -1e9;
      if (!chains.length && !loops.length) { memo.set(key, 0); return 0; }
      const tried = new Set();
      for (let i = 0; i < chains.length; i++) {
        const c = chains[i];
        if (tried.has('c' + c)) continue;
        tried.add('c' + c);
        const rest = chains.slice(0, i).concat(chains.slice(i + 1)), v = compVal(rest, loops);
        const take = c + v, decline = c >= 3 ? c - 4 - v : -1e9;
        best = Math.max(best, -Math.max(take, decline));
      }
      for (let i = 0; i < loops.length; i++) {
        const c = loops[i];
        if (tried.has('l' + c)) continue;
        tried.add('l' + c);
        const rest = loops.slice(0, i).concat(loops.slice(i + 1)), v = compVal(chains, rest);
        const take = c + v, decline = c - 8 - v;
        best = Math.max(best, -Math.max(take, decline));
      }
      memo.set(key, best);
      return best;
    };

    function exactSolve(g, limit, deadline) {
      const G = g.G, U = [];
      for (let e = 0; e < G.E; e++) if (g.edges[e] === 0) U.push(e);
      if (U.length > limit) return null;
      const cnt = Uint8Array.from(g.cnt), n = U.length, tt = new Map();
      let nodes = 0, abort = false;
      const full = (1 << n) - 1;
      const rec = (mask, alpha, beta) => {
        if (mask === 0) return 0;
        if ((++nodes & 1023) === 0 && clock() > deadline) abort = true;
        if (abort) return 0;
        const ent = tt.get(mask);
        if (ent !== undefined) {
          if (ent.f === 0) return ent.v;
          if (ent.f === 1 && ent.v >= beta) return ent.v;
          if (ent.f === 2 && ent.v <= alpha) return ent.v;
        }
        const moves = [];
        for (let i = 0; i < n; i++) {
          if (!(mask & (1 << i))) continue;
          const e = U[i], b = G.eB[e];
          let gain = 0, risk = 0;
          for (let k = 0; k < 2; k++) { const x = b[k]; if (x < 0) continue; if (cnt[x] === 3) gain++; else if (cnt[x] === 2) risk++; }
          moves.push([gain > 0 ? 100 + gain : 50 - risk * 10 - (risk > 0 ? 0 : 0), i, gain]);
        }
        moves.sort((a, b) => b[0] - a[0]);
        let best = -1e9, flag = 2, a0 = alpha;
        for (const [, i, gain] of moves) {
          const e = U[i], b = G.eB[e];
          for (let k = 0; k < 2; k++) if (b[k] >= 0) cnt[b[k]]++;
          const nm = mask & ~(1 << i);
          const v = gain > 0 ? gain + rec(nm, alpha - gain, beta - gain) : -rec(nm, -beta, -alpha);
          for (let k = 0; k < 2; k++) if (b[k] >= 0) cnt[b[k]]--;
          if (abort) return 0;
          if (v > best) best = v;
          if (v > alpha) { alpha = v; flag = 0; }
          if (alpha >= beta) { flag = 1; break; }
        }
        if (tt.size < 1500000) tt.set(mask, { v: best, f: flag });
        return best;
      };
      const roots = [];
      for (let i = 0; i < n; i++) {
        const e = U[i], b = G.eB[e];
        let gain = 0;
        for (let k = 0; k < 2; k++) { const x = b[k]; if (x >= 0 && cnt[x] === 3) gain++; }
        roots.push({ i, e, gain });
      }
      let bestE = -1, bestV = -1e9;
      roots.sort((a, b) => b.gain - a.gain);
      for (const r of roots) {
        const b = G.eB[r.e];
        for (let k = 0; k < 2; k++) if (b[k] >= 0) cnt[b[k]]++;
        const nm = full & ~(1 << r.i);
        const v = r.gain > 0 ? r.gain + rec(nm, -1e9, 1e9) : -rec(nm, -1e9, 1e9);
        for (let k = 0; k < 2; k++) if (b[k] >= 0) cnt[b[k]]--;
        if (abort) return null;
        if (v > bestV + (rnd() < .5 ? 0 : 1e-6)) { bestV = v; bestE = r.e; }
      }
      return { e: bestE, v: bestV, nodes };
    }

    const gainOf = (g, e) => { const b = g.G.eB[e]; let k = 0; for (let i = 0; i < 2; i++) if (b[i] >= 0 && g.cnt[b[i]] === 3) k++; return k; };
    const risk = (g, e) => { const b = g.G.eB[e]; let k = 0; for (let i = 0; i < 2; i++) if (b[i] >= 0 && g.cnt[b[i]] === 2) k++; return k; };

    const compInfo = (g, e) => {
      const G = g.G, cnt = g.cnt, edges = g.edges, seen = new Set(), st = [];
      for (const b of G.eB[e]) if (b >= 0 && cnt[b] === 2) { st.push(b); seen.add(b); }
      let touch = 0;
      while (st.length) {
        const x = st.pop();
        for (const ee of G.bE[x]) {
          if (edges[ee] !== 0 || ee === e) continue;
          const o = G.eB[ee][0] === x ? G.eB[ee][1] : G.eB[ee][0];
          if (o < 0 || cnt[o] !== 2) { touch++; continue; }
          if (!seen.has(o)) { seen.add(o); st.push(o); }
        }
      }
      let t2 = 0;
      for (const b of G.eB[e]) if (b < 0 || cnt[b] !== 2) t2++;
      return { size: seen.size, loop: touch === 0 && t2 === 0 };
    };

    const lastPair = g => {
      const G = g.G;
      for (let x = 0; x < G.nB; x++) {
        if (g.cnt[x] !== 3) continue;
        let ex = -1;
        for (const e of G.bE[x]) if (g.edges[e] === 0) ex = e;
        const y = G.eB[ex][0] === x ? G.eB[ex][1] : G.eB[ex][0];
        if (y < 0 || g.cnt[y] !== 2) continue;
        let ey = -1;
        for (const e of G.bE[y]) if (g.edges[e] === 0 && e !== ex) ey = e;
        const z = G.eB[ey][0] === y ? G.eB[ey][1] : G.eB[ey][0];
        if (z >= 0 && g.cnt[z] >= 2) continue;
        return { x, y, ex, ey };
      }
      return null;
    };

    const hasSafe = g => {
      for (let e = 0; e < g.G.E; e++) if (g.edges[e] === 0 && sideOK(g.cnt, g.G, e)) return true;
      return false;
    };

    const think = (state, cfg) => {
      const g = Game(state.cfg);
      for (const e of state.moves) g.play(e);
      const G = g.G, lvl = cfg.level | 0, np = g.cfg.np, t0 = clock(), deadline = t0 + (cfg.ms || 500), left = G.E - g.drawn;
      const all = [];
      for (let e = 0; e < G.E; e++) if (g.edges[e] === 0) all.push(e);
      if (!all.length) return { e: -1 };
      const pick = a => a[(rnd() * a.length) | 0];
      const takers = all.filter(e => gainOf(g, e) > 0);
      const safe = all.filter(e => gainOf(g, e) === 0 && sideOK(g.cnt, G, e) && !(G.eB[e][0] >= 0 && g.cnt[G.eB[e][0]] === 3) && !(G.eB[e][1] >= 0 && g.cnt[G.eB[e][1]] === 3));
      if (lvl === 0) {
        if (takers.length && rnd() < .7) return { e: pick(takers) };
        if (safe.length && rnd() < .45) return { e: pick(safe) };
        return { e: pick(all) };
      }
      if (np === 2 && lvl >= 2) {
        const lim = lvl === 2 ? 13 : lvl === 3 ? 17 : 21;
        if (left <= lim) {
          const r = exactSolve(g, lim, deadline + (lvl === 4 ? 1500 : 0));
          if (r && r.e >= 0) return { e: r.e, how: 'exact', v: r.v };
        }
      }
      if (takers.length) {
        const pair = np === 2 && lvl >= 2 ? lastPair(g) : null;
        const full = takers.filter(e => gainOf(g, e) === 2);
        if (pair) {
          const others = takers.filter(e => e !== pair.ex);
          if (others.length) return { e: full.length ? full[0] : others[0] };
          const sim = Game(g.cfg);
          for (const m of g.moves) sim.play(m.e);
          sim.play(pair.ex); sim.play(pair.ey);
          const a = analyze(G, sim.cnt, sim.edges), v = compVal(a.chains, a.loops);
          if (!hasSafe(sim) && v < -2) return { e: pair.ey, how: 'decline' };
          return { e: pair.ex };
        }
        return { e: full.length ? full[0] : takers[0] };
      }
      if (safe.length) {
        if (lvl <= 1) return { e: pick(safe) };
        if (lvl >= 3 && np === 2 && safe.length <= (lvl === 3 ? 10 : 13)) {
          const best = safeSearch(g, safe, deadline);
          if (best >= 0) return { e: best, how: 'safe' };
        }
        const scored = safe.map(e => {
          const b = G.eB[e];
          let s = 0;
          for (let i = 0; i < 2; i++) if (b[i] >= 0) s += g.cnt[b[i]];
          return [s + rnd() * 1.5, e];
        }).sort((x, y) => x[0] - y[0]);
        return { e: scored[0][1], how: 'quiet' };
      }
      const a = analyze(G, g.cnt, g.edges);
      let bestE = -1, bestV = -1e9;
      for (const e of all) {
        const ci = compInfo(g, e), sz = ci.size, rk = risk(g, e);
        let score;
        if (lvl <= 1 || np > 2) score = -sz + rnd() * .5;
        else {
          const ch = a.chains.slice(), lp = a.loops.slice();
          const arr = ci.loop ? lp : ch, ix = arr.indexOf(sz);
          if (ix < 0) continue;
          arr.splice(ix, 1);
          const v = compVal(ch, lp);
          const canDecline = ci.loop || sz >= 3 || (sz === 2 && rk === 1);
          const take = sz + v, decline = canDecline ? (ci.loop ? sz - 8 - v : sz - 4 - v) : -1e9;
          score = -Math.max(take, decline) + (sz >= 3 && rk === 1 ? .2 : 0) + (sz === 2 && rk === 2 ? .2 : 0) + rnd() * .1;
        }
        if (score > bestV) { bestV = score; bestE = e; }
      }
      if (bestE < 0) bestE = pick(all);
      return { e: bestE, how: 'sac' };
    };

    function safeSearch(g, safe, deadline) {
      const G = g.G, cnt = Uint8Array.from(g.cnt), edges = Uint8Array.from(g.edges), tt = new Map();
      let nodes = 0, abort = false;
      const safeList = () => {
        const out = [];
        for (let e = 0; e < G.E; e++) if (edges[e] === 0 && sideOK(cnt, G, e) && !(G.eB[e][0] >= 0 && cnt[G.eB[e][0]] === 3) && !(G.eB[e][1] >= 0 && cnt[G.eB[e][1]] === 3)) out.push(e);
        return out;
      };
      const key = () => { let s = ''; for (let e = 0; e < G.E; e++) if (edges[e]) s += e + ','; return s; };
      const rec = () => {
        if ((++nodes & 255) === 0 && clock() > deadline) abort = true;
        if (abort) return 0;
        const k = key();
        if (tt.has(k)) return tt.get(k);
        const list = safeList();
        let v;
        if (!list.length) {
          const a = analyze(G, cnt, edges);
          v = compVal(a.chains, a.loops);
        } else {
          v = -1e9;
          for (const e of list) {
            const b = G.eB[e];
            edges[e] = 1; for (let i = 0; i < 2; i++) if (b[i] >= 0) cnt[b[i]]++;
            const r = -rec();
            edges[e] = 0; for (let i = 0; i < 2; i++) if (b[i] >= 0) cnt[b[i]]--;
            if (abort) return 0;
            if (r > v) v = r;
          }
        }
        tt.set(k, v);
        return v;
      };
      let best = -1, bv = -1e9;
      for (const e of safe) {
        const b = G.eB[e];
        edges[e] = 1; for (let i = 0; i < 2; i++) if (b[i] >= 0) cnt[b[i]]++;
        const r = -rec();
        edges[e] = 0; for (let i = 0; i < 2; i++) if (b[i] >= 0) cnt[b[i]]--;
        if (abort) return -1;
        if (r > bv + (rnd() < .5 ? 0 : 1e-6)) { bv = r; best = e; }
      }
      return best;
    }

    return { Game, think, geoOf, analyze, compVal, exactSolve, setRnd: f => { rnd = f; } };
  }
  const DB_PAL = [null,
    { n: 'Blue', c: '#2b59b0', d: '#1b3d80', w: 'rgba(43,89,176,.16)' },
    { n: 'Red', c: '#c23a2d', d: '#8f2519', w: 'rgba(194,58,45,.16)' },
    { n: 'Green', c: '#2b8749', d: '#1c5e32', w: 'rgba(43,135,73,.16)' },
    { n: 'Orange', c: '#d67f12', d: '#9a5a08', w: 'rgba(214,127,18,.18)' }];
  const DB_CHIP = [null, 'radial-gradient(circle at 35% 30%,#7aa2ea,#2b59b0 60%,#1b3d80)', 'radial-gradient(circle at 35% 30%,#f08a7e,#c23a2d 60%,#8f2519)', 'radial-gradient(circle at 35% 30%,#7fd29d,#2b8749 60%,#1c5e32)', 'radial-gradient(circle at 35% 30%,#f7c27a,#d67f12 60%,#9a5a08)'];
  const DB_THEME = { bg: '#26334a', pn: '#33425e', pn2: '#425477', ink: '#f2f5fb', mut: '#aab8d2', acc: '#f2c14e', acc2: '#b8892a', accInk: '#2b1f05', ln: '#4a5d82', cv: '#1b2437' };
  const DB_LEVELS = [{ name: 'Beginner', ms: 40 }, { name: 'Easy', ms: 80 }, { name: 'Medium', ms: 400 }, { name: 'Hard', ms: 1200 }, { name: 'Expert', ms: 2500 }];
  const DB_HELP = 'Click or tap a line between two dots · complete a box to claim it and go again · arrows move the pencil, <kbd>R</kbd> turns it, <kbd>Enter</kbd> draws · <kbd>U</kbd> undo · <kbd>N</kbd> new game';
  const dotsCss = kitCss('.gm-dots-boxes', DB_THEME) + `
.gm-dots-boxes .pcs.q{display:grid;grid-template-columns:1fr 1fr}
.gm-dots-boxes .pc em{min-width:24px;text-align:right}
.gm-dots-boxes .pc.cur{border-color:var(--acc);background:var(--pn2)}
.gm-dots-boxes .pc .chip{width:22px;height:22px}
@media (max-width:760px){.gm-dots-boxes .pcs.q .pc{flex:none}.gm-dots-boxes .pcs:not(.q) .pc{flex:1}}`;

  function mountDots(root, api) {
    const E = dotsEngine(), au = audioKit(api);
    const saved = api.load() || {};
    const F = [
      { key: 'mode', def: 'ai', opts: () => [['ai', 'vs AI'], ['online', 'Online']] },
      { key: 'size', label: 'Grid', def: 4, opts: () => [[3, '3×3'], [4, '4×4'], [5, '5×5'], [6, '6×6']] },
      { key: 'players', label: 'Players', def: 2, opts: o => [[2, '2'], [3, '3'], [4, '4']], when: o => o.mode === 'ai' },
      { key: 'level', label: 'AI strength', def: 2, opts: () => DB_LEVELS.map((l, i) => [i, l.name]), when: o => o.mode === 'ai' },
      { key: 'first', label: 'Who starts', def: 'you', opts: () => [['you', 'You'], ['ai', 'AI'], ['random', 'Random']], when: o => o.mode === 'ai' }
    ];
    const opt = {};
    for (const f of F) { const l = f.opts(opt), v = l.find(x => String(x[0]) === String(saved[f.key])); opt[f.key] = v ? v[0] : f.def; }
    if (coarse()) root.classList.add('touch');
    const main = el('div', 'main');
    root.append(main);
    const SZ = 640, cv = api.canvas(SZ, SZ, main), cvs = cv.canvas;
    cvs.style.width = '';
    const side = el('div', 'side');
    main.append(side);
    side.innerHTML = '<div class="seg" data-k="mode" role="radiogroup"></div><div class="cn" hidden><i></i><span></span></div><div class="pcs"></div><div class="st" role="status"></div><div class="sub"></div><div class="btns"></div>'
      + '<details class="setup"><summary>Game setup</summary><div class="body"></div></details>';
    const q = s => side.querySelector(s);
    const modeSeg = q('.seg[data-k="mode"]'), cn = q('.cn'), pcs = q('.pcs'), stEl = q('.st'), subEl = q('.sub'), btnsEl = q('.btns'), setup = q('details.setup'), body = q('.body');
    if (innerWidth > 760 || root.clientWidth > 700) setup.open = true;
    for (const f of F.slice(1)) {
      const w = el('div', 'fld', `<label>${f.label}</label><div class="seg" data-k="${f.key}" role="radiogroup"></div>`);
      w.dataset.k = f.key;
      body.append(w);
    }
    const N = { role: null, live: false, round: 0, ids: [], re: {}, hooked: false, tok: 0, size: 2, bots: false, players: [] };
    let g = null, seats = [], me = 1, over = false, ai = null, ovUp = false, streak = 0, dirtyF = true, started = false, pending = false, sure = false, gen = 0, hover = -1, cursor = null, drag = null, lastAct = 0, chain = 0, chainP = 0, lastE = -1, lastT = 0;
    let ed = new Float64Array(200).fill(-1e9), bt = new Float64Array(64).fill(-1e9), wob = {}, paper = null, worker = null, wurl = null, pend = new Map(), seq = 0, seed = 1;
    const online = () => opt.mode === 'online';
    const guest = () => online() && N.role === 'guest';
    const hostRole = () => online() && N.role === 'host';
    const send = m => api.net.send(m);
    const kindAI = s => s && (s.k === 'ai' || s.k === 'bot');

    const getWorker = () => {
      if (worker !== null) return worker;
      try {
        const src = 'const E=(' + dotsEngine.toString() + ')();onmessage=e=>{const d=e.data;if(d.warm){postMessage({id:0});return}const r=E.think(d.state,d.cfg);postMessage({id:d.id,r});};';
        wurl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        worker = new Worker(wurl);
        worker.onmessage = e => { const f = pend.get(e.data.id); pend.delete(e.data.id); if (f) f(e.data.r); };
        worker.onerror = () => { const w = worker; worker = false; try { w.terminate(); } catch (er) {} const list = [...pend.values()]; pend.clear(); list.forEach(f => f(undefined)); };
      } catch (e) { worker = false; }
      return worker;
    };

    const paintSegs = () => {
      for (const f of F) {
        const seg = f.key === 'mode' ? modeSeg : side.querySelector(`.seg[data-k="${f.key}"]`);
        const list = f.opts(opt);
        if (!list.some(o => String(o[0]) === String(opt[f.key]))) opt[f.key] = list[0][0];
        const sig = list.map(o => o[0] + ':' + o[1]).join('|');
        if (seg.dataset.sig !== sig) { seg.dataset.sig = sig; seg.innerHTML = list.map(([v, t]) => `<button type="button" role="radio" data-v="${v}">${t}</button>`).join(''); }
        seg.querySelectorAll('button').forEach(b => { const on = String(opt[f.key]) === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
        if (f.key !== 'mode') {
          const w = body.querySelector(`.fld[data-k="${f.key}"]`);
          w.hidden = !!(f.when && !f.when(opt)) || (guest());
        }
      }
    };
    const conn = () => {
      const on = !!N.role && api.net.connected;
      cn.classList.toggle('on', on);
      const hn = seats.filter(s => s && s.k === 'human' && s.id).length;
      cn.lastChild.textContent = on ? (N.role === 'host' ? 'Online · ' + hn + ' players' : 'Connected' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '')) : N.role ? 'Reconnecting…' : 'Not connected';
    };
    const seatName = s => seats[s] ? seats[s].n : DB_PAL[s].n;
    const paintCards = () => {
      if (!g) { pcs.innerHTML = ''; return; }
      const np = g.cfg.np;
      pcs.classList.toggle('q', np > 2);
      if (pcs.children.length !== np) pcs.innerHTML = Array.from({ length: np }, () => '<div class="pc"><i class="chip"></i><div><b></b><small></small></div><em></em></div>').join('');
      for (let s = 1; s <= np; s++) {
        const c = pcs.children[s - 1], st = seats[s] || {};
        c.querySelector('.chip').style.background = DB_CHIP[s];
        c.querySelector('b').textContent = s === me ? (online() ? st.n + ' (you)' : 'You') : st.n;
        const sub = st.k === 'ai' ? DB_LEVELS[+opt.level].name + ' AI' : st.k === 'bot' ? 'Bot' : DB_PAL[s].n;
        c.querySelector('small').textContent = sub;
        c.querySelector('em').textContent = g.scores[s];
        c.classList.toggle('cur', !over && g.turn === s);
        c.classList.toggle('on', !over && g.turn === s);
      }
    };
    const paintButtons = () => {
      let list;
      if (over) list = online() ? [['rematch', N.re[api.net.id] ? 'Waiting…' : 'Rematch', { dis: !!N.re[api.net.id] || !N.live }], N.role === 'host' ? ['lobby', 'Lobby', {}] : ['leave', 'Leave', { ghost: 1 }]] : [['new', 'New game', {}]];
      else if (online()) list = N.live ? [['leave', 'Leave', { ghost: 1 }]] : [['leave', 'Leave', { ghost: 1 }]];
      else list = [['undo', 'Undo', { dis: !canUndo() }], ['new', 'New game', { ghost: 1 }]];
      btnsEl.innerHTML = list.map(([id, t, o]) => `<button type="button" class="g-btn sm${o && o.ghost ? ' ghost' : ''}" data-b="${id}"${o && o.dis ? ' disabled' : ''}>${t}</button>`).join('');
    };
    const paintSub = () => {
      let t = '';
      if (guest()) t = 'The host picks the game settings';
      else if (pending) t = 'Setup changes apply to the next game';
      subEl.textContent = t;
    };
    const setStatus = () => {
      if (!g || over) return;
      if (online() && !N.live) { stEl.textContent = N.role ? 'Waiting for the host…' : 'Opening the lobby…'; stEl.className = 'st'; return; }
      const t = g.turn, mine = t === me, again = g.moves.length && g.moves[g.moves.length - 1].got.length && g.moves[g.moves.length - 1].p === t;
      let txt, cls = '';
      if (mine) { txt = again ? 'Box! Go again' : 'Your turn'; cls = 'turn'; }
      else if (kindAI(seats[t])) txt = (seats[t].k === 'bot' ? seats[t].n : seatName(t)) + (ai ? ' is thinking…' : ' plays…');
      else txt = seatName(t) + "'s turn";
      stEl.textContent = txt; stEl.className = 'st' + (cls ? ' ' + cls : '');
    };
    const paint = () => {
      paintSegs(); paintSub();
      cn.hidden = !online();
      if (online()) conn();
      paintCards(); paintButtons(); setStatus();
    };

    const canUndo = () => {
      if (!g || online() || over) return false;
      let n = g.moves.length;
      while (n > 0 && g.moves[n - 1].p !== me) n--;
      return n > 0;
    };
    const doUndo = () => {
      if (!canUndo()) return;
      let n = g.moves.length;
      while (n > 0 && g.moves[n - 1].p !== me) n--;
      while (n > 0 && g.moves[n - 1].p === me) n--;
      cancelAI(); gen++;
      g.undoTo(n);
      ed.fill(-1e9); bt.fill(-1e9);
      lastE = -1; chain = 0;
      afterAct();
    };

    function fxMove(r, delay) {
      const t = now() + (delay || 0);
      ed[r.e] = t; lastE = r.e; lastT = t;
      chain = chainP === r.p && chain > 0 ? chain : 0;
      api.timeout(() => au.pencil(3), delay || 0);
      for (let i = 0; i < r.got.length; i++) {
        bt[r.got[i]] = t + 200 + i * 130;
        const k = chain + i;
        api.timeout(() => au.ping(Math.min(7, k), .9), (delay || 0) + 200 + i * 130);
      }
      if (r.got.length) { chain += r.got.length; chainP = r.p; } else { chain = 0; chainP = 0; }
    }
    function afterAct() {
      if (!g) return;
      paint(); dirtyF = true;
      if (g.res && !over) { end(); return; }
      lastAct = now();
      maybeAI();
    }
    function cancelAI() { if (ai) { try { ai.cancel(); } catch (e) {} } ai = null; }
    function randomLegal() { const l = []; for (let e = 0; e < g.G.E; e++) if (g.edges[e] === 0) l.push(e); return l[(Math.random() * l.length) | 0]; }
    function maybeAI() {
      if (!g || over || ai || ovUp || guest()) return;
      if (online() && !N.live) return;
      const s = seats[g.turn];
      if (!kindAI(s)) return;
      const tok = ++seq, myGen = gen, seat = g.turn, lvl = +opt.level, t0 = now();
      const state = { cfg: g.cfg, moves: g.moves.map(m => m.e) };
      const cfg = { level: s.k === 'bot' ? 3 : lvl, ms: DB_LEVELS[s.k === 'bot' ? 3 : lvl].ms };
      let dead = false;
      const done = r => {
        if (dead || myGen !== gen) return;
        let e = r && typeof r.e === 'number' ? r.e : -1;
        if (!g.legal(e)) e = randomLegal();
        const gap = Math.max(0, 460 - (now() - lastAct), 520 - (now() - t0));
        api.timeout(() => {
          if (dead || myGen !== gen || over) return;
          ai = null;
          perform(seat, { e });
        }, gap);
      };
      ai = { cancel() { dead = true; pend.delete(tok); }, tok };
      const w = getWorker();
      if (w) { pend.set(tok, done); w.postMessage({ id: tok, state, cfg }); }
      else api.timeout(() => { if (!dead) done(E.think(state, { level: cfg.level, ms: Math.min(cfg.ms, 300) })); }, 60);
      paintCards(); setStatus(); paintSub();
    }
    function perform(seat, a) {
      if (over || !g || !a) return false;
      if (guest()) { if (!N.live) return false; send({ t: 'act', a: { e: a.e } }); return true; }
      if (online() && !N.live) return false;
      if (typeof a.e !== 'number') return false;
      const r = g.play(a.e, seat);
      if (!r) return false;
      started = true;
      fxMove(r);
      if (hostRole()) send(snapMsg());
      afterAct();
      return true;
    }
    function end() {
      if (over) return;
      over = true; gen++; cancelAI(); drag = null; sure = false;
      const r = g.res, np = g.cfg.np, md = online() ? 'online' : 'ai';
      const mine = r.winner === me, draw = r.winner === 0;
      let best = false;
      if (md === 'ai') { if (mine) { streak++; best = api.submit(streak); } else if (!draw) streak = 0; api.score(streak); }
      const order = Array.from({ length: np }, (_, i) => i + 1).sort((a, b) => g.scores[b] - g.scores[a]);
      const scoreLine = order.map(s => seatName(s) + ' ' + g.scores[s]).join(' · ');
      stEl.textContent = (draw ? 'Draw' : mine ? 'You win' : seatName(r.winner) + ' wins') + ' · ' + scoreLine;
      stEl.className = 'st' + (mine ? ' win' : draw ? '' : ' loss');
      paint(); dirtyF = true;
      api.timeout(() => au[draw ? 'pass' : mine ? 'win' : 'lose'](), 600);
      const myGen = gen;
      api.timeout(() => {
        if (myGen !== gen || !over) return;
        ovUp = true;
        const stats = order.map(s => [s === me ? (online() ? seatName(s) : 'You') : seatName(s), g.scores[s]]);
        api.overlay({
          kicker: best ? 'New best!' : mine ? 'Victory' : draw ? 'Draw' : 'Defeat',
          title: draw ? (r.tops.length === np ? 'All square' : 'Tied game') : mine ? 'You win!' : md === 'online' ? esc(seatName(r.winner)) + ' wins' : esc(seatName(r.winner)) + ' wins',
          text: `${g.G.nB} boxes: ` + scoreLine + '.' + (md === 'ai' ? (mine ? ` Win streak: ${winsFmt(streak)}.` : draw ? '' : ' Your win streak resets.') : ''),
          stats,
          button: md === 'online' ? 'Rematch' : 'Play again',
          onAction: () => { ovUp = false; if (md === 'online') rematch(); else newGame(); },
          secondary: 'View board', onSecondary: () => { ovUp = false; }
        });
      }, 1500);
    }

    function makeSeats(np, onl) {
      seats = [null];
      if (!onl) {
        for (let s = 1; s <= np; s++) seats.push(s === me ? { n: 'You', k: 'me', id: null } : { n: DB_PAL[s].n, k: 'ai', id: null });
      }
    }
    function newGame() {
      if (!online() && g && !over && started) { if (streak) api.toast('Resigned · streak reset'); streak = 0; }
      cancelAI(); gen++; over = false; ovUp = false; drag = null; hover = -1; sure = false; pending = false; started = false;
      api.hideOverlay();
      const np = +opt.players, w = +opt.size;
      me = opt.first === 'ai' ? np : opt.first === 'random' ? 1 + ((Math.random() * np) | 0) : 1;
      const first = 1;
      g = E.Game({ w, h: w, np, first });
      makeSeats(np, false);
      resetFx();
      api.score(online() ? '—' : streak);
      cursor = null;
      afterAct();
    }
    function resetFx() { ed = new Float64Array(g.G.E).fill(-1e9); bt = new Float64Array(g.G.nB).fill(-1e9); wob = {}; paper = null; seed = 1 + ((Math.random() * 1e6) | 0); lastE = -1; chain = 0; chainP = 0; }

    function snapMsg() { return { t: 'snap', r: N.round, cfg: g.cfg, m: g.save(), seats: seats.slice(1).map(s => ({ n: s.n, k: s.k, id: s.id })), re: Object.keys(N.re).filter(k => N.re[k]) }; }
    function startRound() {
      N.round++; N.live = true; N.re = {};
      cancelAI(); gen++; over = false; ovUp = false; pending = false; started = false; drag = null; sure = false;
      api.hideOverlay();
      const live = api.net.players || [];
      const pl = N.players.filter(p => p.id === api.net.id || live.some(q => q.id === p.id && !q.away)).slice(0, 4);
      let np = N.bots ? Math.max(2, Math.min(4, Math.max(N.size, pl.length))) : Math.max(2, Math.min(4, pl.length));
      if (np < 2) np = 2;
      seats = [null];
      for (let i = 0; i < np; i++) {
        const p = pl[i];
        if (p) seats.push({ n: p.name || 'Player', k: 'human', id: p.id });
        else seats.push({ n: 'Bot ' + (i + 1), k: 'bot', id: null });
      }
      N.ids = seats.slice(1).map(s => s.id);
      me = Math.max(1, seats.findIndex(s => s && s.id === api.net.id));
      g = E.Game({ w: +opt.size, h: +opt.size, np, first: ((N.round - 1) % np) + 1 });
      resetFx();
      send(snapMsg());
      afterAct();
    }
    function onSnap(d) {
      if (!d || !d.cfg || !d.m) return;
      const fresh = d.r !== N.round || !g || g.cfg.w !== d.cfg.w || g.cfg.np !== d.cfg.np;
      let before = 0;
      if (fresh) {
        cancelAI(); gen++; over = false; ovUp = false; drag = null; started = false; hover = -1;
        api.hideOverlay();
        N.round = d.r; N.live = true;
        g = E.Game(d.cfg);
        resetFx();
      } else before = g.moves.length;
      seats = [null, ...d.seats.map(s => ({ n: s.n, k: s.k, id: s.id }))];
      N.ids = d.seats.map(s => s.id);
      const mi = seats.findIndex(s => s && s.id === api.net.id);
      me = mi > 0 ? mi : me;
      N.re = {}; for (const id of d.re || []) N.re[id] = true;
      g.load(d.m);
      const n = g.moves.length;
      if (!fresh && n > before) {
        const skip = n - before > 8;
        for (let i = before; i < n; i++) { const m = g.moves[i]; if (skip) { ed[m.e] = -1e9; for (const b of m.got) bt[b] = -1e9; } else fxMove({ e: m.e, p: m.p, got: m.got }, (i - before) * 260); }
        started = true;
      } else if (fresh && n > 0) { for (let i = 0; i < n; i++) { ed[g.moves[i].e] = -1e9; for (const b of g.moves[i].got) bt[b] = -1e9; } }
      if (over && !g.res) { over = false; ovUp = false; api.hideOverlay(); gen++; }
      afterAct();
    }
    function rematch() {
      if (!online() || !N.live || !over) return;
      const id = api.net.id;
      if (N.re[id]) return;
      N.re[id] = true;
      if (N.role === 'host') {
        const humans = seats.filter(s => s && s.k === 'human' && s.id && (s.id === id || (api.net.players || []).some(p => p.id === s.id && !p.away)));
        if (humans.every(s => N.re[s.id])) return startRound();
        send(snapMsg());
      } else send({ t: 're' });
      paint();
      stEl.textContent = 'Waiting for the other players…';
    }
    function setMode(m) {
      const prev = opt.mode;
      if (prev === 'online' && m !== 'online') { N.role = null; N.live = false; N.tok++; api.net.close(); api.hideOverlay(); }
      opt.mode = m; api.save({ ...opt });
      if (m === 'online') goOnline(); else newGame();
    }
    async function goOnline() {
      hookNet();
      const tok = ++N.tok;
      N.role = null; N.live = false; N.round = 0; N.re = {};
      cancelAI(); gen++; ovUp = false; api.hideOverlay();
      opt.mode = 'online';
      g = E.Game({ w: +opt.size, h: +opt.size, np: 2, first: 1 }); seats = [null, { n: 'You', k: 'human', id: null }, { n: 'Opponent', k: 'human', id: null }]; me = 1; over = false; started = false;
      resetFx();
      paint(); stEl.textContent = 'Opening the lobby…'; dirtyF = true;
      const r = await api.net.room({ title: 'Dots and Boxes', sizes: [2, 3, 4], defaultSize: 2, min: 2, max: 4, bots: true });
      if (!api.alive || tok !== N.tok || !online()) return;
      if (!r) return setMode('ai');
      N.role = r.role; N.live = false; N.players = (r.players || []).slice(); N.size = +r.size || N.players.length; N.bots = !!r.bots;
      if (r.role === 'host') startRound();
      else { paint(); stEl.textContent = 'Connected · waiting for the host…'; send({ t: 'hi' }); }
    }
    function hookNet() {
      if (N.hooked) return;
      N.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !online() || !N.role) return;
        if (N.role === 'host') {
          if (!g) return;
          if (d.t === 'hi') { if (N.live) api.net.sendTo(from, snapMsg()); }
          else if (d.t === 'act') {
            const seat = N.ids.indexOf(from) + 1;
            if (N.live && !over && seat > 0 && seats[seat] && seats[seat].k === 'human' && d.a && typeof d.a.e === 'number' && perform(seat, { e: d.a.e })) return;
            if (N.live) api.net.sendTo(from, snapMsg());
          } else if (d.t === 're') {
            if (!over || !N.live) return;
            N.re[from] = true;
            const humans = seats.filter(s => s && s.k === 'human' && s.id && (s.id === api.net.id || (api.net.players || []).some(p => p.id === s.id && !p.away)));
            if (humans.every(s => N.re[s.id])) startRound();
            else { send(snapMsg()); paint(); if (N.re[api.net.id]) stEl.textContent = 'Waiting for the other players…'; else { stEl.textContent = 'Your opponent wants a rematch'; stEl.className = 'st turn'; au.pass(); } }
          }
        } else if (d.t === 'snap') onSnap(d);
      });
      api.net.on('leave', p => {
        if (!online() || N.role !== 'host' || !g || !p) return;
        const s = N.ids.indexOf(p.id) + 1;
        if (s <= 0 || !seats[s] || seats[s].k !== 'human') return;
        const who = seats[s].n;
        seats[s] = { n: who + ' (bot)', k: 'bot', id: null };
        N.ids[s - 1] = null;
        delete N.re[p.id];
        api.toast(who + ' left. A bot takes the seat.');
        if (!over) { send(snapMsg()); paint(); maybeAI(); }
        else {
          send(snapMsg()); paint();
          const humans = seats.filter(x => x && x.k === 'human' && x.id);
          if (humans.length && humans.every(x => N.re[x.id])) startRound();
        }
        if (!seats.some((x, i) => i > 0 && x.k === 'human' && x.id && x.id !== api.net.id)) { paint(); }
      });
      api.net.on('rejoin', p => { if (online() && N.role === 'host' && p && N.live && g) api.net.sendTo(p.id, snapMsg()); });
      api.net.on('lobby', () => { if (online() && N.role === 'guest') goOnline(); });
      api.net.on('close', reason => {
        if (!online() || N.role !== 'guest') return;
        N.role = null; N.live = false; gen++; cancelAI(); ovUp = true;
        paint(); stEl.textContent = 'Connection closed'; stEl.className = 'st loss'; au.lose();
        const t = reason === 'kicked' ? 'The host removed you from the game.' : reason === 'host-left' ? 'The host left, so the game ended.' : 'The connection to the host was lost.';
        api.overlay({ kicker: 'Online', title: reason === 'kicked' ? 'Removed' : reason === 'host-left' ? 'Host left' : 'Connection lost', text: t, button: 'New online game', onAction: () => { ovUp = false; goOnline(); }, secondary: 'Play vs AI', onSecondary: () => { ovUp = false; setMode('ai'); } });
      });
      api.interval(() => { if (online()) { conn(); paintSub(); } }, 1000);
    }

    side.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
    side.addEventListener('click', e => {
      const bt0 = e.target.closest('button');
      if (!bt0) return;
      au.prime();
      if (bt0.dataset.b) {
        const id = bt0.dataset.b;
        if (id === 'new') newGame();
        else if (id === 'leave') setMode('ai');
        else if (id === 'lobby') goOnline();
        else if (id === 'rematch') rematch();
        else if (id === 'undo') doUndo();
        return;
      }
      const key = bt0.parentNode.dataset.k;
      if (!key || String(opt[key]) === bt0.dataset.v) return;
      api.sfx('tick');
      const f = F.find(x => x.key === key), val = f.opts(opt).find(o => String(o[0]) === bt0.dataset.v)[0];
      if (key === 'mode') return setMode(val);
      opt[key] = val; api.save({ ...opt });
      if (!g || over || !started || (online() && N.role !== 'host')) { paint(); if (online()) { pending = true; paint(); } else newGame(); }
      else { pending = true; paint(); api.toast('Applies to the next game'); }
    });

    const layout = () => {
      const n = g ? g.cfg.w : 4, m = g ? g.cfg.h : 4, sp = 470 / Math.max(n, m);
      return { sp, ox: (SZ - sp * n) / 2 + 6, oy: (SZ - sp * m) / 2, n, m };
    };
    const dotXY = (L, r, c) => [L.ox + c * L.sp, L.oy + r * L.sp];
    const edgePts = (L, e) => {
      const I = g.G.eInfo[e];
      const a = dotXY(L, I.r, I.c), b = I.h ? dotXY(L, I.r, I.c + 1) : dotXY(L, I.r + 1, I.c);
      return [a[0], a[1], b[0], b[1]];
    };
    const hitEdge = (p, touchMode) => {
      if (!g) return -1;
      const L = layout(), lim = L.sp * (touchMode ? .5 : .32);
      let best = -1, bd = lim;
      for (let e = 0; e < g.G.E; e++) {
        if (g.edges[e]) continue;
        const [x1, y1, x2, y2] = edgePts(L, e), dx = x2 - x1, dy = y2 - y1, t = clamp(((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy), .08, .92);
        const d = Math.hypot(p.x - (x1 + dx * t), p.y - (y1 + dy * t));
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    };
    const mayPlay = () => !!g && !over && !ovUp && !ai && (!online() || N.live) && g.turn === me && seats[me] && !kindAI(seats[me]);
    const toE = (e, tch) => hitEdge(cv.toLocal(e), tch);
    cvs.addEventListener('pointerdown', e => {
      if (e.button > 0 || ovUp || !e.isPrimary) return;
      e.preventDefault(); au.prime();
      cursor = null;
      const tch = e.pointerType === 'touch', ed0 = toE(e, tch);
      drag = { id: e.pointerId, e: ed0, touch: tch };
      try { cvs.setPointerCapture(e.pointerId); } catch (_) {}
      hover = ed0; dirtyF = true;
    });
    cvs.addEventListener('pointermove', e => {
      const x = toE(e, e.pointerType === 'touch');
      if (drag && e.pointerId === drag.id) { drag.e = x; hover = x; dirtyF = true; }
      else if (e.pointerType !== 'touch' && x !== hover) { hover = x; dirtyF = true; }
    });
    cvs.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && !drag) { hover = -1; dirtyF = true; } });
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag, x = d.touch ? d.e : toE(e, false);
      drag = null;
      if (e.type === 'pointerup' && x >= 0 && !ovUp) clickEdge(x);
      if (d.touch) hover = -1;
      dirtyF = true;
    };
    cvs.addEventListener('pointerup', up);
    cvs.addEventListener('pointercancel', up);
    function clickEdge(e) {
      if (!mayPlay()) return;
      if (!g.legal(e)) { au.bad(); return; }
      if (!perform(me, { e })) au.bad();
    }
    const curEdge = () => {
      if (!cursor || !g) return -1;
      const w = g.cfg.w, h = g.cfg.h, G = g.G, { r, c } = cursor;
      const cand = [c < w ? r * w + c : -1, r < h ? G.nH + r * (w + 1) + c : -1, c > 0 ? r * w + c - 1 : -1, r > 0 ? G.nH + (r - 1) * (w + 1) + c : -1];
      return cand[cursor.k];
    };
    const fixCursor = () => {
      const G = g.G, w = g.cfg.w, h = g.cfg.h;
      for (let i = 0; i < 4; i++) {
        const k = (cursor.k + i) % 4, { r, c } = cursor;
        const e = [c < w ? r * w + c : -1, r < h ? G.nH + r * (w + 1) + c : -1, c > 0 ? r * w + c - 1 : -1, r > 0 ? G.nH + (r - 1) * (w + 1) + c : -1][k];
        if (e >= 0 && g.edges[e] === 0) { cursor.k = k; return; }
      }
    };
    api.on(window, 'keydown', e => {
      if (ovUp || !g || (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) || e.ctrlKey || e.metaKey || e.altKey) return;
      const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.code];
      if (dir) {
        e.preventDefault();
        if (!cursor) cursor = { r: 0, c: 0, k: 0 };
        else { cursor.c = clamp(cursor.c + dir[0], 0, g.cfg.w); cursor.r = clamp(cursor.r + dir[1], 0, g.cfg.h); }
        cursor.k = dir[0] > 0 ? 0 : dir[1] > 0 ? 1 : dir[0] < 0 ? 2 : 3;
        fixCursor(); hover = -1; dirtyF = true;
      } else if (e.code === 'KeyR' && !e.repeat) {
        if (!cursor) cursor = { r: 0, c: 0, k: 0 };
        cursor.k = (cursor.k + 1) % 4; fixCursor();
        for (let i = 0; i < 4; i++) { if (curEdge() >= 0 && g.edges[curEdge()] === 0) break; cursor.k = (cursor.k + 1) % 4; }
        e.preventDefault(); dirtyF = true;
      } else if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') && cursor) {
        if (e.repeat) return;
        e.preventDefault();
        const ce = curEdge();
        if (ce >= 0) clickEdge(ce);
        fixCursor(); dirtyF = true;
      } else if (e.code === 'KeyU' && !e.repeat) doUndo();
      else if (e.code === 'KeyN' && !e.repeat && !online()) newGame();
    });

    const paperTex = () => {
      if (paper) return paper;
      const d = dprOf(), c = cnv(SZ * d, SZ * d), x = c.getContext('2d'), rand = rng(77);
      x.scale(d, d);
      let gr = x.createLinearGradient(0, 0, SZ, SZ);
      gr.addColorStop(0, '#fbf6e6'); gr.addColorStop(1, '#f1e9d0');
      x.fillStyle = gr; x.fillRect(0, 0, SZ, SZ);
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(120,100,60,${(rand() * .05).toFixed(3)})`; x.fillRect(rand() * SZ, rand() * SZ, 1 + rand() * 2, 1); }
      x.strokeStyle = 'rgba(80,130,190,.28)'; x.lineWidth = 1;
      for (let y = 30; y < SZ; y += 29) { x.beginPath(); x.moveTo(0, y + .5); x.lineTo(SZ, y + .5); x.stroke(); }
      x.strokeStyle = 'rgba(210,70,60,.45)'; x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(48.5, 0); x.lineTo(48.5, SZ); x.stroke();
      for (let i = 0; i < 6; i++) {
        const y = 60 + i * 104;
        x.fillStyle = 'rgba(50,40,30,.18)'; x.beginPath(); x.arc(20, y, 8.5, 0, 7); x.fill();
        x.fillStyle = '#26334a'; x.beginPath(); x.arc(20, y, 7, 0, 7); x.fill();
        x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(21, y + 1, 6, 0, 7); x.fill();
      }
      gr = x.createRadialGradient(SZ / 2, SZ / 2, SZ * .35, SZ / 2, SZ / 2, SZ * .8);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,60,20,.18)');
      x.fillStyle = gr; x.fillRect(0, 0, SZ, SZ);
      paper = c;
      return c;
    };
    const wobble = (L, e) => {
      let w = wob[e];
      if (!w) { const r = rng(seed * 131 + e * 977 + 13); w = wob[e] = { a: (r() - .5) * 3.2, b: (r() - .5) * 3.2, s: (r() - .5) * 4, t: (r() - .5) * 4, m: (r() - .5) * 3.4 }; }
      return w;
    };
    const strokeEdge = (c, L, e, col, prog, alpha, width) => {
      const [x1, y1, x2, y2] = edgePts(L, e), w = wobble(L, e), dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
      const sx = x1 - ux * w.s + nx * w.a, sy = y1 - uy * w.s + ny * w.a, ex = x2 + ux * w.t + nx * w.b, ey = y2 + uy * w.t + ny * w.b;
      const mx = (sx + ex) / 2 + nx * w.m, my = (sy + ey) / 2 + ny * w.m;
      const steps = 14, k = clamp01(prog);
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (let pass = 0; pass < 2; pass++) {
        c.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps * k, u = 1 - t, px = u * u * sx + 2 * u * t * mx + t * t * ex + (pass ? nx * .9 : 0), py = u * u * sy + 2 * u * t * my + t * t * ey + (pass ? ny * .9 : 0);
          if (i) c.lineTo(px, py); else c.moveTo(px, py);
        }
        c.strokeStyle = col; c.globalAlpha = alpha * (pass ? .45 : .92); c.lineWidth = pass ? width * .6 : width;
        c.stroke();
      }
      c.globalAlpha = 1;
    };
    const drawBox = (c, L, b, s, t) => {
      const r = (b / g.cfg.w) | 0, cc = b % g.cfg.w, x0 = L.ox + cc * L.sp, y0 = L.oy + r * L.sp, k = clamp01((t - bt[b]) / 420);
      if (k <= 0) return;
      const pal = DB_PAL[s], inset = L.sp * .12, rand = rng(b * 31 + seed);
      c.save();
      c.beginPath(); c.rect(x0 + inset * .6, y0 + inset * .6, L.sp - inset * 1.2, L.sp - inset * 1.2); c.clip();
      c.fillStyle = pal.w; c.globalAlpha = easeOut(k); c.fillRect(x0, y0, L.sp, L.sp);
      c.globalAlpha = .55 * easeOut(k); c.strokeStyle = pal.c; c.lineWidth = Math.max(1.1, L.sp * .014);
      const gap = Math.max(5, L.sp * .085), cnt = Math.ceil(L.sp * 2 / gap), lim = Math.floor(cnt * easeOut(k));
      c.beginPath();
      for (let i = 0; i < lim; i++) { const o = i * gap - L.sp * .1; c.moveTo(x0 + o + (rand() - .5) * 2, y0 - 2); c.lineTo(x0 + o - L.sp * 1.05, y0 + L.sp + 2 + (rand() - .5) * 3); }
      c.stroke();
      c.restore();
      const sc = k < 1 ? .5 + .5 * easeOut(k) + .12 * Math.sin(k * Math.PI) : 1;
      c.save();
      c.translate(x0 + L.sp / 2, y0 + L.sp / 2); c.rotate((rand() - .5) * .18); c.scale(sc, sc);
      c.globalAlpha = clamp01(k * 1.6);
      c.fillStyle = pal.d; c.font = `800 ${Math.round(L.sp * .42)}px "Bradley Hand","Segoe Print","Comic Sans MS","Chalkboard SE",cursive`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const nm = (seats[s] && seats[s].n ? seats[s].n : pal.n).trim(), ch = (s === me && !online() ? 'Y' : nm[0] || pal.n[0]).toUpperCase();
      c.fillText(ch, 0, L.sp * .02);
      c.restore();
      c.globalAlpha = 1;
    };
    const draw = () => {
      const c = cv.ctx, t = now();
      c.clearRect(0, 0, SZ, SZ);
      c.drawImage(paperTex(), 0, 0, SZ, SZ);
      if (!g) return;
      const L = layout(), w = g.cfg.w, h = g.cfg.h;
      c.setLineDash([1.5, 7]); c.lineCap = 'round'; c.strokeStyle = 'rgba(60,60,60,.28)'; c.lineWidth = 1.6;
      c.beginPath();
      for (let e = 0; e < g.G.E; e++) { if (g.edges[e]) continue; const [x1, y1, x2, y2] = edgePts(L, e); c.moveTo(x1, y1); c.lineTo(x2, y2); }
      c.stroke(); c.setLineDash([]);
      for (let b = 0; b < g.G.nB; b++) if (g.own[b]) drawBox(c, L, b, g.own[b], t);
      const cap3 = [];
      for (let b = 0; b < g.G.nB; b++) if (g.cnt[b] === 3 && !g.own[b]) cap3.push(b);
      if (cap3.length && !over) {
        c.fillStyle = 'rgba(255,200,60,.17)';
        for (const b of cap3) { const r = (b / w) | 0, cc = b % w; c.fillRect(L.ox + cc * L.sp + 4, L.oy + r * L.sp + 4, L.sp - 8, L.sp - 8); }
      }
      const lw = clamp(L.sp * .052, 2.6, 4.6);
      for (let e = 0; e < g.G.E; e++) {
        const s = g.edges[e];
        if (!s) continue;
        strokeEdge(c, L, e, DB_PAL[s].c, (t - ed[e]) / 210, 1, lw);
      }
      if (lastE >= 0 && g.edges[lastE] && t - lastT < 1400 && !over) {
        const [x1, y1, x2, y2] = edgePts(L, lastE), k = (t - lastT) / 1400;
        c.strokeStyle = DB_PAL[g.edges[lastE]].c; c.globalAlpha = .28 * (1 - k); c.lineWidth = lw * 3.4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.globalAlpha = 1;
      }
      const he = cursor ? curEdge() : hover;
      if (he >= 0 && g.edges[he] === 0 && mayPlay()) {
        strokeEdge(c, L, he, DB_PAL[me].c, 1, cursor ? .8 : .5, lw);
        if (cursor) {
          const [x1, y1, x2, y2] = edgePts(L, he);
          c.strokeStyle = '#ffd35a'; c.lineWidth = 2; c.globalAlpha = .9; c.setLineDash([5, 4]);
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
        }
      }
      const rd = clamp(L.sp * .07, 3.6, 6.4);
      for (let r = 0; r <= h; r++) for (let cc = 0; cc <= w; cc++) {
        const [x, y] = dotXY(L, r, cc), rr2 = rng(r * 17 + cc * 5 + seed)();
        c.fillStyle = '#34312d'; c.beginPath(); c.arc(x + (rr2 - .5) * .8, y, rd, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(x - rd * .3, y - rd * .3, rd * .3, 0, 7); c.fill();
      }
      if (cursor) { const [x, y] = dotXY(L, cursor.r, cursor.c); c.strokeStyle = '#ffd35a'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, y, rd + 4, 0, 7); c.stroke(); }
    };
    const busy = () => {
      const t = now();
      if (lastE >= 0 && t - lastT < 1500) return true;
      if (!g) return false;
      for (let e = 0; e < g.G.E; e++) if (t - ed[e] < 260) return true;
      for (let b = 0; b < g.G.nB; b++) if (t - bt[b] < 600) return true;
      return false;
    };
    api.loop(() => { if (dirtyF || busy()) { dirtyF = false; draw(); } });
    if (api.net.invite) { opt.mode = 'online'; goOnline(); } else newGame();
    return { destroy() { pend.clear(); if (worker) { try { worker.terminate(); } catch (e) {} } if (wurl) URL.revokeObjectURL(wurl); } };
  }
  const GO_HELP = 'Click or tap an intersection · drag on touch to aim · arrows + <kbd>Enter</kbd> · <kbd>P</kbd> pass · <kbd>U</kbd> undo · <kbd>N</kbd> new game';
  Ameplay.register({
    id: 'go',
    title: 'Go',
    category: 'Board',
    blurb: 'Surround territory on a wooden goban with real Go rules and a Monte Carlo AI.',
    help: GO_HELP,
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { goEngine },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20h48M8 44h48M20 8v48M44 8v48"/><circle cx="20" cy="20" r="7" fill="currentColor"/><circle cx="44" cy="44" r="7" fill="var(--bg,#fff)"/><circle cx="44" cy="20" r="2" fill="currentColor"/></svg>',
    css: goCss,
    mount: mountGo
  });
  const GM_HELP = 'Click or tap an intersection · drag on touch to aim · arrows + <kbd>Enter</kbd> · <kbd>U</kbd> undo · <kbd>N</kbd> new game';
  Ameplay.register({
    id: 'gomoku',
    title: 'Gomoku',
    category: 'Board',
    blurb: 'Five in a row on a 15x15 board with freestyle, standard and Renju rules.',
    help: GM_HELP,
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { gomokuEngine },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16h48M8 32h48M8 48h48M16 8v48M32 8v48M48 8v48"/><circle cx="16" cy="48" r="5" fill="currentColor"/><circle cx="24" cy="40" r="0"/><circle cx="32" cy="32" r="5" fill="currentColor"/><circle cx="48" cy="16" r="5" fill="currentColor"/><circle cx="40" cy="24" r="5" fill="var(--bg,#fff)"/><circle cx="24" cy="40" r="5" fill="var(--bg,#fff)"/></svg>',
    css: gomokuCss,
    mount: mountGomoku
  });
  Ameplay.register({
    id: 'dots-boxes',
    title: 'Dots and Boxes',
    category: 'Board',
    blurb: 'Draw lines on a pencil-and-paper grid, close boxes and chain them for extra turns. 2 to 4 players.',
    help: DB_HELP,
    better: 'high',
    format: winsFmt,
    width: 760,
    engine: { dotsEngine },
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 14h36M14 14v36M50 14v36"/><circle cx="14" cy="14" r="3.5" fill="currentColor"/><circle cx="50" cy="14" r="3.5" fill="currentColor"/><circle cx="14" cy="50" r="3.5" fill="currentColor"/><circle cx="50" cy="50" r="3.5" fill="currentColor"/><circle cx="32" cy="14" r="3.5" fill="currentColor"/><circle cx="32" cy="50" r="3.5" fill="currentColor"/></svg>',
    css: dotsCss,
    mount: mountDots
  });
})();
