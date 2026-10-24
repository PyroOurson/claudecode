(() => {
  'use strict';

  const SVG = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const ICON = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const I_UNDO = SVG('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>');
  const I_REDO = SVG('<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>');
  const I_RESET = SVG('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>');
  const I_GRID = SVG('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>');
  const I_BULB = SVG('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>');
  const I_LOCK = SVG('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  const I_BACK = SVG('<path d="M15 5l-7 7 7 7"/>');
  const I_PLUS = SVG('<path d="M12 5v14M5 12h14"/>');
  const I_X = SVG('<path d="M6 6l12 12M18 6L6 18"/>');
  const I_SQ = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3.5"/></svg>';
  const I_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const STAR_P = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';
  const stars = n => [0, 1, 2].map(i => `<svg class="${i < n ? 'on' : ''}" viewBox="0 0 24 24"><path d="${STAR_P}"/></svg>`).join('');

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const stat = (k, v, cls = '') => `<div class="g-stat ${cls}"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeIO = t => { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const back = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const shuf = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return `rgb(${Math.round(lerp(x[0], y[0], t))},${Math.round(lerp(x[1], y[1], t))},${Math.round(lerp(x[2], y[2], t))})`; };
  const shade = (c, t) => t < 0 ? mix(c, '#000000', -t) : mix(c, '#ffffff', t);
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  const reveal = n => { try { n.scrollIntoView({ block: 'nearest' }); } catch (e) {} };
  function press(api, node, sel, fn) {
    api.on(node, 'pointerdown', e => { const b = e.target.closest(sel); if (!b || b.disabled || e.button) return; e.preventDefault(); fn(b, e); });
    api.on(node, 'click', e => { const b = e.target.closest(sel); if (b && !b.disabled && e.detail === 0) fn(b, e); });
  }
  function particles() {
    const list = [];
    return {
      list,
      burst(x, y, n, colors, spd = 180, life = .8, size = 4, grav = 420) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, s = spd * (.3 + Math.random() * .7);
          list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * .35, life: life * (.6 + Math.random() * .4), max: life, c: colors[i % colors.length], r: size * (.6 + Math.random() * .8), g: grav, rot: Math.random() * 6, vr: (Math.random() - .5) * 14, sq: Math.random() < .5 });
        }
      },
      step(dt) {
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.life -= dt;
          if (p.life <= 0) { list[i] = list[list.length - 1]; list.pop(); continue; }
          p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.2; p.rot += p.vr * dt;
        }
      },
      draw(ctx) {
        for (const p of list) {
          ctx.globalAlpha = Math.min(1, p.life / p.max * 2.2);
          ctx.fillStyle = p.c;
          if (p.sq) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r, -p.r * .55, p.r * 2, p.r * 1.1); ctx.restore(); }
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
      }
    };
  }
  const CONFETTI = ['#ff6b6b', '#ffd166', '#06d6a0', '#4cc9f0', '#a06cd5', '#ff9f43'];

  function makeSnd(api) {
    let ac = null, master = null, nbuf = null;
    const ctx = () => {
      if (!ac) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          master = ac.createGain(); master.gain.value = .85; master.connect(ac.destination);
          nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nbuf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; }
      }
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const live = () => !api.muted && ctx();
    const tone = (f, d, type = 'sine', v = .1, f2 = 0, at = 0, atk = .006) => {
      const a = live(); if (!a) return;
      try {
        const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + atk);
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(master); o.start(t); o.stop(t + d + .03);
      } catch (e) {}
    };
    const noise = (d, v, f0, f1, q = 1, at = 0, type = 'bandpass') => {
      const a = live(); if (!a) return;
      try {
        const t = a.currentTime + at, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
        s.buffer = nbuf; s.loop = true; s.playbackRate.value = .8 + Math.random() * .4;
        fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t);
        if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + d);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(v, t + Math.min(.02, d / 3));
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + d + .03);
      } catch (e) {}
    };
    const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
    const PENT = [0, 2, 4, 7, 9];
    const pent = i => 60 + PENT[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);
    const arp = (notes, step = .075, type = 'triangle', v = .09, len = .4) => notes.forEach((n, i) => { tone(NOTE(n), len, type, v, 0, i * step); tone(NOTE(n + 12), len * .7, 'sine', v * .35, 0, i * step); });
    const fanfare = () => { arp([60, 64, 67, 72, 76, 79, 84], .085, 'triangle', .1, .55); tone(NOTE(84), .9, 'sine', .07, 0, .6); tone(NOTE(88), .9, 'sine', .05, 0, .66); };
    return { tone, noise, NOTE, pent, arp, fanfare, live, resume: ctx };
  }

  function makeHub(api, root, cfg) {
    const box = el('div', 'hub');
    root.append(box);
    let cp = 0, view = 'packs';
    const starsOf = pi => { let s = 0, d = 0; for (let i = 0; i < cfg.packs[pi].n; i++) { const o = cfg.info(pi, i); if (o.done) d++; s += o.stars || 0; } return { s, d }; };
    function packs() {
      view = 'packs';
      let tot = 0, totD = 0, all = 0;
      cfg.packs.forEach((p, i) => { const o = starsOf(i); tot += o.s; totD += o.d; all += p.n; });
      const rs = cfg.resume && cfg.resume();
      box.innerHTML = `<div class="hub-h"><div><h2>${cfg.title}</h2><p>${cfg.blurb}</p></div><div class="hub-tot"><b>${totD}</b><span>of ${all} solved</span><i class="stars">${stars(1)}<em>${tot}</em></i></div></div>
        ${rs ? `<button type="button" class="g-btn hub-cont" data-r="1">${rs.label}</button>` : ''}
        <div class="pk-grid">${cfg.packs.map((p, i) => {
          const lock = cfg.packLock ? cfg.packLock(i) : '';
          const o = starsOf(i);
          return `<button type="button" class="pk ${lock ? 'lock' : ''}" data-p="${i}" style="--h:${p.hue}">
            <span class="pk-art">${cfg.packArt ? cfg.packArt(i) : ''}</span>
            <span class="pk-t"><b>${p.name}</b><small>${p.sub}</small></span>
            <span class="pk-bar"><i style="width:${Math.round(o.d / p.n * 100)}%"></i></span>
            <span class="pk-n">${lock ? I_LOCK + lock : `${o.d}/${p.n}`}</span></button>`;
        }).join('')}</div>`;
    }
    function levels(pi) {
      view = 'levels'; cp = pi;
      const p = cfg.packs[pi], o = starsOf(pi);
      let h = `<div class="hub-h lv-h"><button type="button" class="g-btn ghost sm" data-b="1">${I_BACK}Packs</button><div><h2>${p.name}</h2><p>${p.sub}</p></div><div class="hub-tot"><b>${o.d}</b><span>of ${p.n}</span></div></div><div class="lv-grid">`;
      for (let i = 0; i < p.n; i++) {
        const q = cfg.info(pi, i);
        h += `<button type="button" class="lb ${q.done ? 'done' : ''} ${q.locked ? 'lock' : ''} ${q.cur ? 'cur' : ''}" data-l="${i}" ${q.locked ? 'disabled' : ''} style="--i:${i}"><span class="lb-n">${q.locked ? I_LOCK : i + 1}</span>${q.done ? `<span class="lb-s">${stars(q.stars)}</span>` : q.sub ? `<span class="lb-u">${q.sub}</span>` : ''}${q.thumb ? `<span class="lb-t" data-t="${i}"></span>` : ''}</button>`;
      }
      box.innerHTML = h + '</div>';
      if (cfg.thumb) box.querySelectorAll('[data-t]').forEach(s => { const c = cfg.thumb(pi, +s.dataset.t); if (c) s.append(c); });
      const cur = box.querySelector('.lb.cur');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
    api.on(box, 'click', e => {
      const t = e.target.closest('button');
      if (!t || t.disabled) return;
      api.sfx('tap');
      if (t.dataset.r) cfg.resume().go();
      else if (t.dataset.p != null) { if (!t.classList.contains('lock')) { cfg.snd && cfg.snd(); levels(+t.dataset.p); } else api.toast(t.querySelector('.pk-n').textContent.trim()); }
      else if (t.dataset.b) packs();
      else if (t.dataset.l != null) cfg.open(cp, +t.dataset.l);
    });
    packs();
    return {
      el: box,
      show(pi) { box.hidden = false; if (pi != null) levels(pi); else if (view === 'levels') levels(cp); else packs(); reveal(box); },
      hide() { box.hidden = true; box.textContent = ''; },
      packs
    };
  }

  function hubCss(id, a, b) {
    const g = '.gm-' + id;
    return `
${g}{--ac:${a};--ac2:${b};gap:0;justify-content:flex-start;align-items:stretch;padding:6px 0 10px}
${g} [hidden]{display:none!important}
${g} .hub{width:min(820px,100%);margin:0 auto;display:flex;flex-direction:column;gap:14px;animation:gmhub-in .45s var(--ease)}
@keyframes gmhub-in{from{opacity:0;transform:translateY(10px)}}
${g} .hub-h{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
${g} .hub-h h2{margin:0;font:900 26px/1.1 var(--sans);letter-spacing:-.02em;color:var(--ink)}
${g} .hub-h p{margin:4px 0 0;font-weight:700;font-size:13.5px;color:var(--muted);max-width:46ch}
${g} .lv-h{justify-content:flex-start}
${g} .lv-h .hub-tot{margin-left:auto}
${g} .hub-tot{display:flex;align-items:baseline;gap:7px;font-weight:800;color:var(--muted);font-size:13px}
${g} .hub-tot b{font:900 28px/1 var(--sans);color:var(--ac)}
${g} .hub-tot .stars{display:inline-flex;align-items:center;gap:3px;font-style:normal;color:#f5a623}
${g} .hub-tot .stars svg{width:17px;height:17px;fill:#f5a623}
${g} .hub-tot em{font-style:normal;font-weight:900}
${g} .hub-cont{align-self:flex-start;background:var(--ac);border-color:var(--ac)}
${g} .pk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
${g} .pk{position:relative;display:flex;flex-direction:column;gap:9px;padding:12px;border:0;border-radius:20px;background:#fff;box-shadow:0 0 0 1.5px var(--line),0 14px 28px -20px hsl(var(--h) 60% 35% / .6);text-align:left;cursor:pointer;font-family:var(--sans);transition:transform .35s var(--spring),box-shadow .25s}
${g} .pk:hover{transform:translateY(-4px);box-shadow:0 0 0 2px hsl(var(--h) 70% 60%),0 18px 30px -18px hsl(var(--h) 60% 35% / .7)}
${g} .pk:active{transform:scale(.97)}
${g} .pk.lock{opacity:.62}
${g} .pk-art{display:block;height:88px;border-radius:13px;background:linear-gradient(145deg,hsl(var(--h) 80% 90%),hsl(var(--h) 75% 80%));overflow:hidden;position:relative}
${g} .pk-art canvas,${g} .pk-art svg{position:absolute;inset:0;width:100%;height:100%}
${g} .pk-t b{display:block;font:900 17px/1.2 var(--sans);color:var(--ink)}
${g} .pk-t small{display:block;margin-top:2px;font-weight:700;font-size:12px;color:var(--muted)}
${g} .pk-bar{display:block;height:6px;border-radius:9px;background:var(--sunk);overflow:hidden}
${g} .pk-bar i{display:block;height:100%;border-radius:9px;background:hsl(var(--h) 70% 52%);transition:width .6s var(--ease)}
${g} .pk-n{display:flex;align-items:center;gap:6px;font-weight:900;font-size:12.5px;color:var(--muted)}
${g} .pk-n svg{width:14px;height:14px}
${g} .lv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:9px}
${g} .lb{position:relative;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:0;border-radius:16px;background:linear-gradient(#fff,#f2f0fb);box-shadow:inset 0 -3px 0 var(--line-2),0 0 0 1.5px var(--line);font-family:var(--sans);color:var(--ink-2);cursor:pointer;overflow:hidden;transition:transform .3s var(--spring);animation:gmhub-in .4s var(--ease) backwards;animation-delay:calc(var(--i)*12ms)}
${g} .lb:hover{transform:translateY(-3px)}
${g} .lb:active{transform:scale(.94)}
${g} .lb-n{position:relative;z-index:1;font:900 20px/1 var(--sans)}
${g} .lb-n svg{width:18px;height:18px;color:var(--soft)}
${g} .lb-u{position:relative;z-index:1;font-size:10.5px;font-weight:800;color:var(--muted)}
${g} .lb-s{position:relative;z-index:1;display:flex;gap:1px}
${g} .lb-s svg{width:12px;height:12px;fill:#d8d4ea}
${g} .lb-s svg.on{fill:#f5a623}
${g} .lb.done{background:linear-gradient(#eafcf2,#cdf3de);box-shadow:inset 0 -3px 0 #97dcb6,0 0 0 1.5px #bfe9d1;color:#14744a}
${g} .lb.cur{outline:3px solid var(--ac);outline-offset:2px}
${g} .lb.lock{background:var(--sunk);box-shadow:inset 0 -3px 0 var(--line);cursor:default;transform:none}
${g} .lb-t{position:absolute;inset:0;z-index:0}
${g} .lb-t canvas{width:100%;height:100%;display:block;image-rendering:pixelated}
${g} .lb-t~.lb-n,${g} .lb:has(.lb-t) .lb-n{text-shadow:0 1px 3px rgba(0,0,0,.45);color:#fff}
${g} .lb:has(.lb-t){background:#fff}
${g} .top{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px 14px;flex-wrap:wrap;margin:0 auto 10px}
${g} .top .g-hud{gap:2px 18px;justify-content:flex-start}
${g} .top .g-stat{align-items:flex-start;min-width:0}
${g} .top .g-stat .v{font-size:20px}
${g} .hub .g-btn svg,${g} .top .g-btn svg,${g} .tools .g-btn svg{width:17px;height:17px}
${g} .tools{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}
${g} .tools .g-btn{padding:0 14px}
${g} .tools .g-btn .n{min-width:18px;height:18px;padding:0 5px;margin-left:2px;border-radius:9px;background:rgba(0,0,0,.12);font-size:11px;line-height:18px;text-align:center}
${g} .gscreen{width:100%;display:flex;flex-direction:column;align-items:center;animation:gmhub-in .4s var(--ease)}
${g} .g-canvas{box-shadow:0 18px 40px -22px rgba(40,30,90,.7)}
${g} .seg{display:inline-grid;grid-template-columns:1fr 1fr;gap:3px;padding:4px;border-radius:999px;background:var(--sunk)}
${g} .seg button{display:flex;align-items:center;gap:7px;height:34px;padding:0 15px;border:0;border-radius:999px;background:none;font:800 13px/1 var(--sans);color:var(--muted);cursor:pointer;transition:background .2s,color .2s,transform .2s var(--spring)}
${g} .seg button svg{width:15px;height:15px}
${g} .seg button.on{background:#fff;color:#3d4580;box-shadow:0 3px 10px -4px rgba(40,50,120,.5)}
${g} .seg button:active{transform:scale(.94)}
${g} .nm{font:900 15px/1 var(--sans);color:var(--ink);letter-spacing:-.01em}
${g} .nm small{display:block;margin-top:3px;font-size:11.5px;font-weight:800;color:var(--muted);letter-spacing:0}
${g} .tg{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:12.5px;color:var(--muted);cursor:pointer}
${g} .tg input{position:absolute;opacity:0;pointer-events:none}
${g} .tg i{position:relative;width:34px;height:20px;flex:none;border-radius:999px;background:var(--line-2);transition:background .25s}
${g} .tg i::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .3s var(--spring)}
${g} .tg input:checked+i{background:var(--ac)}
${g} .tg input:checked+i::after{transform:translateX(14px)}
${g} .tg input:focus-visible+i{outline:2.5px solid var(--ac);outline-offset:2px}
@media (pointer:coarse){${g} .g-btn.sm{height:40px}}
`;
  }

  function nLineSolve(cells, clue, n) {
    const k = clue.length, W = k + 1;
    const F = new Uint8Array((n + 2) * W);
    for (let i = n + 1; i >= 0; i--) {
      for (let j = k; j >= 0; j--) {
        let ok = 0;
        if (i >= n) ok = j === k ? 1 : 0;
        else {
          if (cells[i] !== 1 && F[(i + 1) * W + j]) ok = 1;
          if (!ok && j < k) {
            const c = clue[j];
            if (i + c <= n && (i + c === n || cells[i + c] !== 1)) {
              let fit = true;
              for (let t = i; t < i + c; t++) if (cells[t] === 2) { fit = false; break; }
              if (fit && F[Math.min(i + c + 1, n + 1) * W + j + 1]) ok = 1;
            }
          }
        }
        F[i * W + j] = ok;
      }
    }
    if (!F[0]) return null;
    const R = new Uint8Array((n + 2) * W), cf = new Uint8Array(n), ce = new Uint8Array(n);
    R[0] = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= k; j++) {
        if (!R[i * W + j]) continue;
        if (cells[i] !== 1 && F[(i + 1) * W + j]) { ce[i] = 1; R[(i + 1) * W + j] = 1; }
        if (j < k) {
          const c = clue[j];
          if (i + c <= n && (i + c === n || cells[i + c] !== 1)) {
            let fit = true;
            for (let t = i; t < i + c; t++) if (cells[t] === 2) { fit = false; break; }
            const nx = Math.min(i + c + 1, n + 1);
            if (fit && F[nx * W + j + 1]) {
              for (let t = i; t < i + c; t++) cf[t] = 1;
              if (i + c < n) ce[i + c] = 1;
              R[nx * W + j + 1] = 1;
            }
          }
        }
      }
    }
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i++) out[i] = cf[i] && !ce[i] ? 1 : ce[i] && !cf[i] ? 2 : cells[i];
    return out;
  }
  function nClues(line, n, at, step) {
    const out = [];
    let run = 0;
    for (let i = 0; i < n; i++) {
      if (line[at + i * step] === 1) run++;
      else if (run) { out.push(run); run = 0; }
    }
    if (run) out.push(run);
    return out;
  }
  function nAllClues(mask, n) {
    const rows = [], cols = [];
    for (let y = 0; y < n; y++) rows.push(nClues(mask, n, y * n, 1));
    for (let x = 0; x < n; x++) cols.push(nClues(mask, n, x, n));
    return { rows, cols };
  }
  function nSolve(cl, n, start) {
    const g = start ? Uint8Array.from(start) : new Uint8Array(n * n);
    const row = new Uint8Array(n), col = new Uint8Array(n);
    let changed = true, guard = 0;
    while (changed && guard++ < 200) {
      changed = false;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) row[x] = g[y * n + x];
        const o = nLineSolve(row, cl.rows[y], n);
        if (!o) return null;
        for (let x = 0; x < n; x++) if (o[x] !== row[x]) { g[y * n + x] = o[x]; changed = true; }
      }
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) col[y] = g[y * n + x];
        const o = nLineSolve(col, cl.cols[x], n);
        if (!o) return null;
        for (let y = 0; y < n; y++) if (o[y] !== col[y]) { g[y * n + x] = o[y]; changed = true; }
      }
    }
    return g;
  }
  const nUnknown = g => { let u = 0; for (let i = 0; i < g.length; i++) if (!g[i]) u++; return u; };

  const N_SPR = [
    ['Heart', ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], { r: '#ee4266' }],
    ['Star', ['..y..', 'yyyyy', '.yyy.', '.y.y.', 'y...y'], { y: '#ffc933' }],
    ['Smiley', ['.yyy.', 'y.y.y', 'yyyyy', 'y.y.y', '.yyy.'], { y: '#ffd23f' }],
    ['House', ['..r..', '.rrr.', 'rrrrr', 'wwbww', 'wwbww'], { r: '#d94f3d', w: '#f3e3c3', b: '#8a5a33' }],
    ['Pine', ['..g..', '.ggg.', 'ggggg', '..b..', '..b..'], { g: '#2f9e5b', b: '#8a5a33' }],
    ['Mushroom', ['.rrr.', 'rwrwr', 'rrrrr', '.sss.', '.sss.'], { r: '#e5383b', w: '#ffffff', s: '#ead2a8' }],
    ['Mug', ['.s.s.', 'bbbbb', 'bbbbb', 'bbbbb', '.bbb.'], { b: '#6f9ceb', s: '#b8c1cc' }],
    ['Fish', ['.....', 'bb.bb', 'bbbbb', 'bb.bb', '.....'], { b: '#3aa6e8' }],
    ['Cat', ['o...o', 'ooooo', 'o.o.o', 'ooooo', '.ooo.'], { o: '#f08a24' }],
    ['Flower', ['.p.p.', '..y..', 'p.y.p', '..g..', '.ggg.'], { p: '#ff6fa5', y: '#ffd23f', g: '#3fb95f' }],
    ['Sailboat', ['..w..', '.ww.b', 'wwwwb', 'bbbbb', '.bbb.'], { w: '#e6dfcb', b: '#2d6fd6' }],
    ['Key', ['.yyy.', '.y.y.', '.yyy.', '..y..', '..yy.'], { y: '#f2b632' }],
    ['Bell', ['..y..', '.yyy.', '.yyy.', 'yyyyy', '..y..'], { y: '#f2b632' }],
    ['Cherries', ['..gg.', '.g..g', 'r.r.r', 'rrrrr', 'rrrrr'], { r: '#d62839', g: '#3fb95f' }],
    ['Ghost', ['.www.', 'wwwww', 'w.w.w', 'wwwww', 'w.w.w'], { w: '#9aa5e8' }],
    ['Arrow', ['..a..', '.aaa.', 'aaaaa', '..a..', '..a..'], { a: '#22b07d' }],
    ['Umbrella', ['.ppp.', 'ppppp', 'p.u.p', '..u..', '.uu..'], { p: '#8e5cf0', u: '#444b66' }],
    ['Moon', ['.yyy.', 'yy...', 'yy...', 'yy...', '.yyy.'], { y: '#f4d35e' }],
    ['Note', ['..nn.', '..n.n', '..n..', 'nnn..', 'nnn..'], { n: '#4a4e8f' }],
    ['Crown', ['y.y.y', 'yyyyy', 'yrygy', 'yyyyy', 'yyyyy'], { y: '#f2b632', r: '#e5383b', g: '#2fb36d' }],
    ['Lollipop', ['.ppp.', 'ppwpp', 'pwpwp', '.ppp.', '..s..'], { p: '#ff6fa5', w: '#ffffff', s: '#b8c1cc' }],
    ['Bug', ['k...k', '.rrr.', 'rkrkr', '.rrr.', 'k...k'], { r: '#e5383b', k: '#2b2d42' }],
    ['Duck', ['.yy..', 'yyy..', '.yyoo', '.yyy.', '.yy..'], { y: '#ffd23f', o: '#f08a24' }],
    ['Rocket', ['..w..', '.wbw.', '.www.', 'rwwwr', '..f..'], { w: '#d3dcee', b: '#4cc9f0', r: '#e5383b', f: '#ff9f1c' }]
  ];
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const inPoly = (pts, x, y) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const segD = (u, v, x0, y0, x1, y1) => {
    const dx = x1 - x0, dy = y1 - y0, l = dx * dx + dy * dy || 1, t = clamp(((u - x0) * dx + (v - y0) * dy) / l, 0, 1);
    return Math.hypot(u - x0 - t * dx, v - y0 - t * dy);
  };
  const N_MOT = [
    ['Heart', (P, r) => { const c = pick(r, ['#ee4266', '#ff5d8f', '#e63946']); P.e(.3, .37, .23, .23, c); P.e(.7, .37, .23, .23, c); P.p([[.07, .46], [.93, .46], [.5, .94]], c); P.e(.27, .3, .07, .06, '#ffc2cf'); }],
    ['Star', (P) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? .24 : .5; pts.push([.5 + Math.cos(a) * d, .54 + Math.sin(a) * d]); } P.p(pts, '#ffc933'); P.e(.5, .52, .1, .1, '#fff0a3'); }],
    ['House', (P, r) => { const w = pick(r, ['#f3e3c3', '#dfe9f7', '#f7d8d0']), rf = pick(r, ['#d94f3d', '#4f6fd9', '#7a4fd9']); P.r(.78, .12, .88, .42, '#9a5b3c'); P.r(.14, .44, .86, .92, w); P.p([[.06, .46], [.5, .1], [.94, .46]], rf); P.r(.42, .62, .58, .92, '#8a5a33'); P.r(.2, .54, .34, .68, '#7cc6f0'); P.r(.66, .54, .8, .68, '#7cc6f0'); }],
    ['Pine', (P) => { P.r(.43, .78, .57, .96, '#8a5a33'); P.p([[.5, .04], [.78, .4], [.22, .4]], '#2f9e5b'); P.p([[.5, .22], [.84, .62], [.16, .62]], '#278a4e'); P.p([[.5, .42], [.92, .84], [.08, .84]], '#1f7a43'); }],
    ['Flower', (P, r) => { const c = pick(r, ['#ff6fa5', '#ff9f43', '#8e7cf0']); P.r(.46, .45, .54, .95, '#3fb95f'); P.e(.3, .78, .16, .07, '#3fb95f'); P.e(.7, .68, .16, .07, '#3fb95f'); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; P.e(.5 + Math.cos(a) * .2, .3 + Math.sin(a) * .2, .13, .13, c); } P.e(.5, .3, .1, .1, '#ffd23f'); }],
    ['Mushroom', (P, r) => { const c = pick(r, ['#e5383b', '#8e5cf0']); P.r(.36, .5, .64, .94, '#ead2a8'); P.e(.5, .5, .46, .4, c); P.r(.02, .5, .98, .6, 0); P.r(.04, .5, .96, .56, c); P.e(.3, .34, .08, .07, '#fff'); P.e(.6, .26, .07, .06, '#fff'); P.e(.74, .44, .06, .05, '#fff'); }],
    ['Fish', (P, r) => { const c = pick(r, ['#3aa6e8', '#ff8c42', '#2fbf8f']); P.e(.46, .5, .36, .24, c); P.p([[.72, .5], [.96, .24], [.96, .76]], shade(c, -.15)); P.e(.3, .44, .05, .05, '#fff'); P.e(.3, .44, .02, .02, '#222'); P.p([[.4, .3], [.5, .14], [.6, .32]], shade(c, -.15)); }],
    ['Cat', (P, r) => { const c = pick(r, ['#f08a24', '#8d99ae', '#5a4a42']); P.p([[.1, .5], [.12, .06], [.4, .26]], c); P.p([[.9, .5], [.88, .06], [.6, .26]], c); P.e(.5, .55, .4, .36, c); P.e(.35, .5, .05, .07, '#222'); P.e(.65, .5, .05, .07, '#222'); P.p([[.45, .62], [.55, .62], [.5, .68]], '#ff8fab'); P.l(.5, .68, .5, .76, .02, '#222'); P.l(.2, .66, .02, .62, .015, '#222'); P.l(.8, .66, .98, .62, .015, '#222'); }],
    ['Apple', (P, r) => { const c = pick(r, ['#e5383b', '#7bc043', '#f4a261']); P.e(.36, .58, .28, .32, c); P.e(.64, .58, .28, .32, c); P.l(.5, .26, .56, .1, .045, '#7a4a28'); P.e(.68, .18, .14, .07, '#3fb95f'); P.e(.3, .5, .05, .09, shade(c, .4)); }],
    ['Sun', (P) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.l(.5 + Math.cos(a) * .34, .5 + Math.sin(a) * .34, .5 + Math.cos(a) * .48, .5 + Math.sin(a) * .48, .08, '#ffb703'); } P.e(.5, .5, .25, .25, '#ffd23f'); }],
    ['Mug', (P, r) => { const c = pick(r, ['#6f9ceb', '#ef6f6c', '#59c19a']); P.e(.7, .55, .17, .2, '#b0b8c4'); P.e(.7, .55, .09, .12, 0); P.r(.16, .3, .68, .84, c); P.e(.42, .84, .26, .08, c); P.e(.42, .3, .26, .05, shade(c, -.2)); P.l(.26, .24, .3, .08, .035, '#d7dce4'); P.l(.5, .22, .46, .06, .035, '#d7dce4'); }],
    ['Rocket', (P) => { P.p([[.5, .04], [.68, .3], [.68, .72], [.32, .72], [.32, .3]], '#d3dcee'); P.p([[.5, .04], [.68, .3], [.32, .3]], '#e5383b'); P.p([[.32, .5], [.12, .78], [.32, .72]], '#e5383b'); P.p([[.68, .5], [.88, .78], [.68, .72]], '#e5383b'); P.e(.5, .46, .1, .1, '#4cc9f0'); P.p([[.38, .72], [.62, .72], [.5, .96]], '#ff9f1c'); }],
    ['Ghost', (P, r) => { const c = pick(r, ['#dfe6f7', '#c9b6ff']); P.e(.5, .4, .34, .32, c); P.r(.16, .4, .84, .86, c); for (let i = 0; i < 3; i++) P.p([[.16 + i * .226, .86], [.27 + i * .226, .7], [.38 + i * .226, .86]], 0); P.e(.38, .38, .06, .08, '#222'); P.e(.62, .38, .06, .08, '#222'); P.e(.5, .56, .05, .06, '#222'); }],
    ['Cactus', (P) => { P.r(.38, .2, .62, .8, '#3fa65b'); P.e(.5, .2, .12, .1, '#3fa65b'); P.r(.12, .42, .38, .52, '#3fa65b'); P.r(.12, .26, .22, .52, '#3fa65b'); P.r(.62, .36, .88, .46, '#3fa65b'); P.r(.78, .2, .88, .46, '#3fa65b'); P.p([[.28, .78], [.72, .78], [.66, .96], [.34, .96]], '#c06a3a'); }],
    ['Butterfly', (P, r) => { const c = pick(r, ['#ff7eb6', '#4cc9f0', '#ffb703']); P.e(.28, .34, .22, .2, c); P.e(.72, .34, .22, .2, c); P.e(.3, .68, .16, .16, shade(c, .2)); P.e(.7, .68, .16, .16, shade(c, .2)); P.r(.46, .24, .54, .8, '#2b2d42'); P.l(.5, .26, .36, .08, .015, '#2b2d42'); P.l(.5, .26, .64, .08, .015, '#2b2d42'); }],
    ['Snowman', (P) => { P.e(.5, .78, .24, .2, '#d9e5fa'); P.e(.5, .5, .18, .16, '#d9e5fa'); P.e(.5, .26, .14, .13, '#d9e5fa'); P.r(.36, .06, .64, .2, '#2b2d42'); P.r(.3, .17, .7, .2, '#2b2d42'); P.p([[.5, .27], [.68, .3], [.5, .32]], '#ff8c42'); P.e(.44, .24, .02, .02, '#222'); P.e(.56, .24, .02, .02, '#222'); P.e(.5, .5, .02, .02, '#222'); P.e(.5, .62, .02, .02, '#222'); }],
    ['Sailboat', (P) => { P.r(.48, .08, .52, .72, '#7a5a3a'); P.p([[.54, .1], [.54, .62], [.86, .62]], '#e6dfcb'); P.p([[.46, .2], [.46, .62], [.18, .62]], '#e5383b'); P.p([[.1, .72], [.9, .72], [.76, .9], [.24, .9]], '#2d6fd6'); }],
    ['Crown', (P) => { P.p([[.08, .78], [.08, .26], [.28, .5], [.5, .16], [.72, .5], [.92, .26], [.92, .78]], '#f2b632'); P.r(.08, .72, .92, .86, '#d99a1f'); P.e(.5, .62, .06, .06, '#e5383b'); P.e(.26, .64, .04, .04, '#2fb36d'); P.e(.74, .64, .04, .04, '#4cc9f0'); }],
    ['Cherries', (P) => { P.l(.3, .66, .52, .1, .03, '#4a7a3a'); P.l(.7, .7, .52, .1, .03, '#4a7a3a'); P.e(.66, .14, .16, .07, '#3fb95f'); P.e(.3, .72, .2, .2, '#d62839'); P.e(.7, .76, .2, .2, '#d62839'); P.e(.24, .66, .04, .05, '#ff9aa7'); P.e(.64, .7, .04, .05, '#ff9aa7'); }],
    ['Duck', (P) => { P.e(.46, .66, .36, .24, '#ffd23f'); P.e(.66, .32, .2, .2, '#ffd23f'); P.p([[.82, .3], [.98, .36], [.82, .42]], '#f08a24'); P.e(.7, .28, .03, .03, '#222'); P.p([[.14, .6], [.02, .5], [.2, .72]], '#ffd23f'); P.e(.42, .68, .14, .09, '#f2b632'); }],
    ['Umbrella', (P, r) => { const c = pick(r, ['#8e5cf0', '#e5383b', '#2d9cdb']); P.e(.5, .46, .44, .38, c); P.r(.0, .46, 1, .9, 0); P.r(.06, .44, .94, .52, c); for (let i = 0; i < 4; i++) P.e(.19 + i * .207, .53, .105, .07, c); P.l(.5, .5, .5, .86, .035, '#444b66'); P.e(.42, .86, .08, .06, 0); P.l(.5, .86, .4, .9, .035, '#444b66'); }],
    ['Gem', (P, r) => { const c = pick(r, ['#4cc9f0', '#ff5d8f', '#7bd88f']); P.p([[.2, .3], [.8, .3], [.96, .46], [.5, .94], [.04, .46]], c); P.p([[.2, .3], [.35, .1], [.65, .1], [.8, .3]], shade(c, .35)); P.p([[.04, .46], [.96, .46], [.5, .94]], shade(c, -.12)); P.l(.5, .3, .5, .46, .02, shade(c, .5)); }],
    ['Ice cream', (P, r) => { const c = pick(r, ['#ff8fab', '#ffd166', '#b5e48c']); P.p([[.28, .5], [.72, .5], [.5, .96]], '#e0b072'); P.e(.5, .4, .26, .22, c); P.e(.5, .22, .16, .15, shade(c, .3)); P.e(.58, .1, .05, .05, '#e5383b'); P.l(.36, .52, .5, .86, .015, '#c68c4c'); P.l(.64, .52, .5, .86, .015, '#c68c4c'); }],
    ['Strawberry', (P) => { P.p([[.16, .3], [.84, .3], [.5, .94]], '#e5383b'); P.e(.5, .34, .36, .2, '#e5383b'); P.p([[.5, .2], [.3, .06], [.4, .26]], '#3fb95f'); P.p([[.5, .2], [.7, .06], [.6, .26]], '#3fb95f'); P.r(.46, .08, .54, .26, '#3fb95f'); [[.36, .42], [.6, .42], [.48, .56], [.36, .62], [.6, .62], [.48, .76]].forEach(p => P.e(p[0], p[1], .025, .035, '#ffe58a')); }],
    ['Balloon', (P, r) => { const c = pick(r, ['#ef476f', '#118ab2', '#ffd166']); P.e(.5, .38, .3, .34, c); P.p([[.44, .7], [.56, .7], [.5, .78]], c); P.e(.38, .26, .06, .09, shade(c, .4)); P.l(.5, .78, .44, .9, .015, '#555'); P.l(.44, .9, .54, .98, .015, '#555'); }],
    ['Penguin', (P) => { P.e(.5, .54, .32, .42, '#2b2d42'); P.e(.5, .62, .2, .3, '#d9e5fa'); P.e(.4, .3, .04, .05, '#fff'); P.e(.6, .3, .04, .05, '#fff'); P.p([[.44, .36], [.56, .36], [.5, .44]], '#ff9f1c'); P.e(.38, .94, .1, .04, '#ff9f1c'); P.e(.62, .94, .1, .04, '#ff9f1c'); }],
    ['Car', (P, r) => { const c = pick(r, ['#e5383b', '#2d9cdb', '#f2b632']); P.p([[.22, .46], [.34, .26], [.66, .26], [.8, .46]], c); P.r(.06, .44, .94, .72, c); P.p([[.3, .44], [.38, .31], [.48, .31], [.48, .44]], '#bfe9ff'); P.p([[.52, .44], [.52, .31], [.62, .31], [.72, .44]], '#bfe9ff'); P.e(.28, .72, .12, .12, '#2b2d42'); P.e(.72, .72, .12, .12, '#2b2d42'); P.e(.28, .72, .05, .05, '#cfd6e4'); P.e(.72, .72, .05, .05, '#cfd6e4'); }],
    ['Robot', (P) => { P.l(.5, .06, .5, .18, .03, '#8d99ae'); P.e(.5, .06, .045, .045, '#e5383b'); P.r(.2, .18, .8, .5, '#9fb3c8'); P.r(.28, .5, .72, .58, '#8d99ae'); P.r(.14, .58, .86, .92, '#7f93aa'); P.e(.36, .32, .07, .07, '#4cc9f0'); P.e(.64, .32, .07, .07, '#4cc9f0'); P.r(.38, .42, .62, .45, '#2b2d42'); P.e(.5, .74, .08, .08, '#ffd23f'); }],
    ['Pumpkin', (P) => { P.e(.28, .6, .26, .32, '#f77f00'); P.e(.72, .6, .26, .32, '#f77f00'); P.e(.5, .6, .24, .34, '#ff9f1c'); P.r(.45, .14, .55, .3, '#4a7a3a'); P.p([[.34, .5], [.44, .5], [.39, .4]], '#2b2d42'); P.p([[.56, .5], [.66, .5], [.61, .4]], '#2b2d42'); P.p([[.34, .68], [.66, .68], [.58, .78], [.5, .7], [.42, .78]], '#2b2d42'); }],
    ['Bell', (P) => { P.e(.5, .48, .3, .32, '#f2b632'); P.r(.2, .46, .8, .74, '#f2b632'); P.r(.12, .7, .88, .8, '#d99a1f'); P.e(.5, .88, .1, .08, '#d99a1f'); P.e(.5, .1, .06, .06, '#d99a1f'); P.e(.38, .38, .05, .1, '#ffe08a'); }],
    ['Moon', (P) => { P.e(.5, .5, .42, .42, '#f4d35e'); P.e(.68, .44, .34, .36, 0); P.e(.84, .2, .035, .035, '#f4d35e'); P.e(.9, .55, .03, .03, '#f4d35e'); P.e(.78, .8, .03, .03, '#f4d35e'); }],
    ['Key', (P) => { P.e(.28, .5, .22, .22, '#f2b632'); P.e(.28, .5, .09, .09, 0); P.r(.46, .46, .94, .55, '#f2b632'); P.r(.74, .5, .8, .74, '#f2b632'); P.r(.86, .5, .92, .66, '#f2b632'); }],
    ['Palm', (P) => { P.p([[.04, .94], [.2, .78], [.8, .78], [.96, .94]], '#f4d35e'); P.p([[.46, .8], [.54, .8], [.58, .3], [.5, .3]], '#8a5a33'); [[-.3, -.05], [-.18, -.2], [.0, -.24], [.18, -.2], [.3, -.05]].forEach(p => P.l(.54, .3, .54 + p[0], .3 + p[1] * .6 + .06, .07, '#2fb36d')); P.e(.5, .31, .04, .04, '#8a5a33'); }],
    ['Cupcake', (P, r) => { const c = pick(r, ['#ff8fab', '#b8f2e6', '#ffd6a5']); P.p([[.16, .52], [.84, .52], [.74, .94], [.26, .94]], '#b5651d'); P.e(.5, .44, .38, .2, c); P.e(.5, .26, .24, .17, shade(c, .15)); P.e(.5, .1, .06, .06, '#e5383b'); P.l(.34, .54, .38, .92, .015, '#8c4b12'); P.l(.5, .54, .5, .92, .015, '#8c4b12'); P.l(.66, .54, .62, .92, .015, '#8c4b12'); }],
    ['Bunny', (P) => { P.e(.36, .2, .09, .22, '#e6dfcb'); P.e(.64, .2, .09, .22, '#e6dfcb'); P.e(.36, .2, .04, .15, '#ffb3c1'); P.e(.64, .2, .04, .15, '#ffb3c1'); P.e(.5, .62, .32, .3, '#e6dfcb'); P.e(.4, .56, .035, .045, '#222'); P.e(.6, .56, .035, .045, '#222'); P.e(.5, .66, .04, .03, '#ff8fab'); P.l(.5, .7, .5, .76, .015, '#aaa'); }],
    ['Invader', (P, r) => { const c = pick(r, ['#4cc9f0', '#7bd88f', '#ff7eb6']); for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) if (r() < .55 || y === 3) { P.r(.1 + x * .1, .1 + y * .1, .2 + x * .1, .2 + y * .1, c); P.r(.8 - x * .1, .1 + y * .1, .9 - x * .1, .2 + y * .1, c); } P.r(.4, .3, .5, .4, c); P.r(.5, .3, .6, .4, c); P.r(.2, .3, .3, .4, 0); P.r(.7, .3, .8, .4, 0); }]
  ];
  function nRaw(n, fn, r) {
    const g = new Uint8Array(n * n), pal = [null], cache = {};
    const col = c => { if (cache[c]) return cache[c]; pal.push(c); return cache[c] = pal.length - 1; };
    const fill = (test, c) => { const k = c === 0 ? 0 : col(c); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (test((x + .5) / n, (y + .5) / n)) g[y * n + x] = k; };
    const P = {
      r: (x0, y0, x1, y1, c) => fill((u, v) => u >= x0 && u <= x1 && v >= y0 && v <= y1, c),
      e: (cx, cy, rx, ry, c) => fill((u, v) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1, c),
      p: (pts, c) => fill((u, v) => inPoly(pts, u, v), c),
      l: (x0, y0, x1, y1, w, c) => fill((u, v) => segD(u, v, x0, y0, x1, y1) <= w / 2, c)
    };
    fn(P, r);
    return { n, g, pal };
  }
  const N_PACKS = [
    { name: 'Tiny', sub: '5 x 5 · warm-up pictures', n: 5, count: 24, hue: 150 },
    { name: 'Small', sub: '8 x 8 · quick pixel art', n: 8, count: 24, hue: 200 },
    { name: 'Classic', sub: '10 x 10 · the standard size', n: 10, count: 30, hue: 260 },
    { name: 'Medium', sub: '15 x 15 · real brain work', n: 15, count: 30, hue: 330 },
    { name: 'Large', sub: '20 x 20 · for the patient', n: 20, count: 24, hue: 20 }
  ];
  function nPicture(pi, li) {
    const P = N_PACKS[pi], n = P.n;
    if (n === 5) {
      const s = N_SPR[li % N_SPR.length], g = new Uint8Array(25), pal = [null], map = {};
      s[1].forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.') return; if (!map[ch]) { pal.push(s[2][ch]); map[ch] = pal.length - 1; } g[y * 5 + x] = map[ch]; }));
      return { n, g, pal, name: s[0] };
    }
    const off = pi * 7;
    const m = N_MOT[(li * 1 + off) % N_MOT.length];
    const pic = nRaw(n, m[1], rng(pi * 1000 + li * 31 + 7));
    pic.name = m[0];
    return pic;
  }
  const nCache = new Map();
  function nPuzzle(pi, li) {
    const key = pi * 100 + li;
    if (nCache.has(key)) return nCache.get(key);
    const pic = nPicture(pi, li), n = pic.n, r = rng(key * 977 + 13);
    const mask = new Uint8Array(n * n), colr = new Uint8Array(n * n);
    for (let i = 0; i < n * n; i++) { mask[i] = pic.g[i] ? 1 : 0; colr[i] = pic.g[i]; }
    let cl = nAllClues(mask, n), sol = nSolve(cl, n), unk = sol ? nUnknown(sol) : 1e9, flips = 0;
    for (let it = 0; it < 600 && unk > 0; it++) {
      const cand = [];
      if (sol) for (let j = 0; j < n * n; j++) if (!sol[j]) cand.push(j);
      const i = cand.length ? cand[Math.floor(r() * cand.length)] : Math.floor(r() * n * n);
      const pm = mask[i], pc = colr[i];
      if (pm) { mask[i] = 0; colr[i] = 0; }
      else {
        const x = i % n, y = (i / n) | 0, cs = [];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < n && yy < n && colr[yy * n + xx]) cs.push(colr[yy * n + xx]);
        }
        if (!cs.length) continue;
        mask[i] = 1; colr[i] = cs[Math.floor(r() * cs.length)];
      }
      const c2 = nAllClues(mask, n), s2 = nSolve(c2, n), u2 = s2 ? nUnknown(s2) : 1e9;
      if (u2 < unk || (u2 === unk && r() < .5)) { cl = c2; sol = s2; unk = u2; flips++; }
      else { mask[i] = pm; colr[i] = pc; }
    }
    const res = { n, mask, colr, pal: pic.pal, name: pic.name, rows: cl.rows, cols: cl.cols, unique: unk === 0, flips, key };
    nCache.set(key, res);
    return res;
  }

  function nThumb(pic, colored) {
    const n = pic.n, c = document.createElement('canvas');
    c.width = n; c.height = n;
    const x = c.getContext('2d');
    for (let i = 0; i < n * n; i++) {
      const k = pic.colr ? pic.colr[i] : pic.g[i];
      if (!k) continue;
      x.fillStyle = colored ? pic.pal[k] : '#3d4580';
      x.fillRect(i % n, (i / n) | 0, 1, 1);
    }
    return c;
  }
  const NONO_CSS = hubCss('nonogram', '#5b6cf0', '#4656d8') + `
.gm-nonogram .pk-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;padding:8px}
.gm-nonogram .g-canvas{background:#fbfaff;border-radius:16px}
`;
  Ameplay.register({
    id: 'nonogram',
    title: 'Nonogram',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' solved',
    width: 860,
    blurb: 'Read the clues, fill the grid and reveal a hidden pixel-art picture in colour.',
    help: 'Drag to fill · <kbd>X</kbd> or right-click to cross · <kbd>F</kbd>/<kbd>M</kbd> switch mode · <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo · <kbd>H</kbd> hint · arrows + <kbd>Space</kbd> on keyboard',
    icon: ICON('<rect x="14" y="14" width="40" height="40" rx="4"/><path d="M14 27h40M14 40h40M27 14v40M40 14v40"/><rect x="28" y="28" width="11" height="11" fill="currentColor"/><rect x="15" y="41" width="12" height="12" fill="currentColor"/><path d="M4 22h6M4 34h6M22 4v6M34 4v6"/>'),
    tint: '#5b6cf0',
    css: NONO_CSS,
    mount(root, api) {
      const snd = makeSnd(api);
      const save = api.load() || {};
      save.done = save.done || {}; save.prog = save.prog || {};
      save.set = Object.assign({ mistakes: false, mode: 1 }, save.set || {});
      const persist = () => api.save(save);
      const keyOf = (p, l) => p * 100 + l;
      const solvedCount = () => Object.keys(save.done).length;
      const packSolved = pi => { let d = 0; for (let i = 0; i < N_PACKS[pi].count; i++) if (save.done[keyOf(pi, i)]) d++; return d; };
      const packs = N_PACKS.map(p => ({ name: p.name, sub: p.sub, n: p.count, hue: p.hue }));
      const nextOpen = () => { for (let p = 0; p < N_PACKS.length; p++) { if (p && packSolved(p - 1) < 6) break; for (let i = 0; i < N_PACKS[p].count; i++) if (!save.done[keyOf(p, i)]) return [p, i]; } return [0, 0]; };

      const hub = makeHub(api, root, {
        title: 'Nonogram', blurb: 'Number clues tell you which cells to fill. Solve a grid to reveal a pixel-art picture.',
        packs,
        packLock: pi => pi && packSolved(pi - 1) < 6 ? `Solve 6 in ${N_PACKS[pi - 1].name}` : '',
        packArt: pi => { const c = nThumb(nPicture(pi, 0), true); return `<img alt="" src="${c.toDataURL()}">`; },
        info: (pi, li) => { const d = save.done[keyOf(pi, li)]; return { done: !!d, stars: d ? d.s : 0, thumb: !!d, sub: save.prog[keyOf(pi, li)] ? 'in progress' : '', cur: save.last && save.last[0] === pi && save.last[1] === li }; },
        thumb: (pi, li) => { const c = nThumb(nPuzzle(pi, li), true); return c; },
        resume: () => { const [p, i] = save.last && !save.done[keyOf(save.last[0], save.last[1])] ? save.last : nextOpen(); return { label: `Continue · ${N_PACKS[p].name} #${i + 1}`, go: () => open(p, i) }; },
        open: (p, i) => open(p, i)
      });

      const scr = el('div', 'gscreen'); scr.hidden = true;
      scr.innerHTML = `<div class="top"><button type="button" class="g-btn ghost sm" data-a="levels">${I_GRID}Levels</button><div class="nm"><span class="ttl">Nonogram</span><small class="sub"></small></div><div class="g-hud">${stat('Time', '0:00', 'tm')}${stat('Done', '0%', 'pc')}${stat('Mistakes', '0', 'ms')}</div></div>`;
      const { canvas, ctx, w: W, h: H, toLocal } = api.canvas(760, 760, scr);
      const tools = el('div', 'tools', `<div class="seg"><button type="button" data-m="1" class="on">${I_SQ}Fill</button><button type="button" data-m="2">${I_X}Cross</button></div>
        <button type="button" class="g-btn ghost sm" data-a="undo">${I_UNDO}Undo</button><button type="button" class="g-btn ghost sm" data-a="redo">${I_REDO}Redo</button><button type="button" class="g-btn ghost sm" data-a="hint">${I_BULB}Hint</button><button type="button" class="g-btn ghost sm" data-a="clear">${I_RESET}Clear</button>
        <label class="tg"><input type="checkbox" data-a="mist"><i></i>Mistakes mode</label>`);
      scr.append(tools); root.append(scr);
      const $ = s => scr.querySelector(s);
      const tmV = $('.tm .v'), pcV = $('.pc .v'), msV = $('.ms'), msVv = $('.ms .v'), ttl = $('.ttl'), sub = $('.sub');
      const mistBox = $('[data-a="mist"]'), undoB = $('[data-a="undo"]'), redoB = $('[data-a="redo"]');
      mistBox.checked = !!save.set.mistakes;

      const fx = particles();
      let pi = 0, li = 0, n = 5, puz, cells, anim, hist = [], redo = [], time = 0, mist = 0, hints = 0, solved = false, winT = -1, shown = false;
      let mode = save.set.mode === 2 ? 2 : 1, cs = 40, ox = 0, oy = 0, rowW = 0, colH = 0, cur = null, hover = null, flash = new Map(), hintCell = null, hintT = 0;
      let rDone = [], cDone = [], rFull = [], cFull = [], stroke = null, drag = null, lineFlash = [], fillCount = 0, saveT = 0;

      function setMode(m) {
        mode = m; save.set.mode = m;
        scr.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', +b.dataset.m === m));
      }
      function layout() {
        const f = Math.max(...puz.rows.map(c => c.reduce((a, v) => a + String(v).length * .34 + .27, 0)), .5);
        const maxC = Math.max(...puz.cols.map(c => c.length), 1);
        const rowU = f + .35, colU = maxC * .62 + .35;
        cs = Math.floor(Math.min(120, (W - 22) / (n + rowU), (H - 22) / (n + colU)));
        rowW = rowU * cs; colH = colU * cs;
        ox = Math.round((W - (rowW + n * cs)) / 2 + rowW); oy = Math.round((H - (colH + n * cs)) / 2 + colH);
        scr.dataset.lay = [ox, oy, cs, n, W].join();
      }
      function lineDone(line, clue) {
        const k = clue.length, d = new Uint8Array(k);
        if (!k) return { d, full: line.every(v => v !== 1) };
        const runs = [];
        for (let i = 0; i < line.length;) { if (line[i] === 1) { let j = i; while (j < line.length && line[j] === 1) j++; runs.push(j - i); i = j; } else i++; }
        const full = runs.length === k && runs.every((v, i) => v === clue[i]);
        if (full) { d.fill(1); return { d, full: true }; }
        let j = 0, p = 0;
        while (j < k && p < line.length) {
          while (p < line.length && line[p] === 2) p++;
          if (p >= line.length || line[p] === 0) break;
          let e = p; while (e < line.length && line[e] === 1) e++;
          if (e - p === clue[j] && (e === line.length || line[e] === 2)) { d[j++] = 1; p = e; } else break;
        }
        j = k - 1; p = line.length - 1;
        while (j >= 0 && p >= 0) {
          while (p >= 0 && line[p] === 2) p--;
          if (p < 0 || line[p] === 0) break;
          let e = p; while (e >= 0 && line[e] === 1) e--;
          if (p - e === clue[j] && (e < 0 || line[e] === 2)) { d[j--] = 1; p = e; } else break;
        }
        return { d, full: false };
      }
      function updateDone(sound) {
        const row = new Uint8Array(n), col = new Uint8Array(n);
        let newly = 0;
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) row[x] = cells[y * n + x];
          const o = lineDone(row, puz.rows[y]);
          if (o.full && !rFull[y]) { newly++; lineFlash.push([0, y, 0]); }
          rFull[y] = o.full; rDone[y] = o.d;
        }
        for (let x = 0; x < n; x++) {
          for (let y = 0; y < n; y++) col[y] = cells[y * n + x];
          const o = lineDone(col, puz.cols[x]);
          if (o.full && !cFull[x]) { newly++; lineFlash.push([1, x, 0]); }
          cFull[x] = o.full; cDone[x] = o.d;
        }
        if (sound && newly) snd.arp([72, 76, 79].slice(0, 2 + Math.min(1, newly)), .05, 'sine', .07, .3);
        fillCount = 0;
        for (let i = 0; i < n * n; i++) if (cells[i] === 1) fillCount++;
      }
      function hud() {
        let need = 0; for (let i = 0; i < n * n; i++) if (puz.mask[i]) need++;
        let ok = 0; for (let i = 0; i < n * n; i++) if (puz.mask[i] && cells[i] === 1) ok++;
        pcV.textContent = Math.round(ok / need * 100) + '%';
        msVv.textContent = mist;
        msV.style.display = save.set.mistakes ? '' : 'none';
        undoB.disabled = !hist.length || solved; redoB.disabled = !redo.length || solved;
        api.score(solvedCount() || '—');
      }
      function open(p, i) {
        pi = p; li = i; puz = nPuzzle(p, i); n = puz.n;
        const pr = save.prog[keyOf(p, i)];
        cells = new Uint8Array(n * n); anim = new Float32Array(n * n).fill(9);
        time = 0; mist = 0; hints = 0;
        if (pr && pr.c && pr.c.length === n * n && !save.done[keyOf(p, i)]) { for (let k = 0; k < n * n; k++) cells[k] = +pr.c[k] || 0; time = pr.t || 0; mist = pr.m || 0; hints = pr.h || 0; }
        hist = []; redo = []; solved = false; winT = -1; shown = false; flash.clear(); lineFlash = []; fx.list.length = 0; hintCell = null; cur = null;
        rFull = new Array(n).fill(false); cFull = new Array(n).fill(false);
        layout(); updateDone(false);
        if (save.done[keyOf(p, i)]) { solved = true; winT = 99; for (let k = 0; k < n * n; k++) cells[k] = puz.mask[k] ? 1 : 0; }
        save.last = [p, i]; persist();
        ttl.textContent = save.done[keyOf(p, i)] ? puz.name : `${N_PACKS[p].name} #${i + 1}`;
        sub.textContent = `${n} x ${n}`;
        hub.hide(); scr.hidden = false; scr.style.animation = 'none'; void scr.offsetWidth; scr.style.animation = ''; reveal(scr);
        hud(); snd.resume();
      }
      function toHub() {
        saveProg(); scr.hidden = true; hub.show(pi);
      }
      function saveProg() {
        if (solved || !cells) return;
        const k = keyOf(pi, li);
        if (cells.some(v => v)) save.prog[k] = { c: Array.from(cells).join(''), t: Math.round(time), m: mist, h: hints }; else delete save.prog[k];
        persist();
      }
      function mistake(i) {
        mist++; flash.set(i, 0);
        snd.tone(150, .22, 'sawtooth', .07, 90); snd.tone(220, .15, 'square', .03, 120);
        hud();
      }
      function setCell(i, v) {
        const prev = cells[i];
        if (prev === v) return false;
        if (save.set.mistakes && v) {
          if (v === 1 && !puz.mask[i]) { mistake(i); if (prev === 2) return false; v = 2; }
          else if (v === 2 && puz.mask[i]) { mistake(i); return false; }
        }
        if (stroke) stroke.push([i, prev, v]);
        cells[i] = v; anim[i] = 0;
        return true;
      }
      function checkWin() {
        for (let i = 0; i < n * n; i++) if ((cells[i] === 1) !== !!puz.mask[i]) return;
        solved = true; winT = 0; shown = false;
        save.prog && delete save.prog[keyOf(pi, li)];
        const pen = mist + hints;
        const stars3 = save.set.mistakes ? (pen === 0 ? 3 : pen <= 2 ? 2 : 1) : (hints === 0 ? 3 : hints <= 2 ? 2 : 1);
        const k = keyOf(pi, li), old = save.done[k];
        save.done[k] = { s: Math.max(old ? old.s : 0, stars3), t: old ? Math.min(old.t, Math.round(time)) : Math.round(time) };
        persist();
        snd.fanfare();
        for (let t = 0; t < 14; t++) api.timeout(() => snd.tone(snd.NOTE(84 + (t * 5) % 12), .25, 'sine', .035, 0), 400 + t * 90);
        api.score(solvedCount()); api.submit(solvedCount());
        const cx = ox + n * cs / 2, cy = oy + n * cs / 2;
        for (let t = 0; t < 4; t++) api.timeout(() => fx.burst(cx + (Math.random() - .5) * n * cs * .7, cy + (Math.random() - .5) * n * cs * .5, 26, CONFETTI, 300, 1.4, 5, 380), 300 + t * 280);
        ttl.textContent = puz.name;
        hud();
        const stars_ = stars3;
        api.timeout(() => {
          if (!solved) return;
          shown = true;
          const nxt = li + 1 < N_PACKS[pi].count ? [pi, li + 1] : (pi + 1 < N_PACKS.length && packSolved(pi) >= 6 ? [pi + 1, 0] : null);
          api.overlay({
            kicker: `${N_PACKS[pi].name} #${li + 1}`, title: `${puz.name}! ${'★'.repeat(stars_)}${'☆'.repeat(3 - stars_)}`,
            text: `${n} x ${n} picture solved in ${clock(time)}.`,
            stats: [['Time', clock(time)], ['Mistakes', save.set.mistakes ? mist : '–'], ['Hints', hints]],
            button: nxt ? 'Next puzzle' : 'Levels', secondary: nxt ? 'Levels' : null,
            onAction: () => nxt ? open(nxt[0], nxt[1]) : toHub(),
            onSecondary: toHub
          });
        }, 3300);
      }
      function endStroke() {
        if (!stroke) return;
        if (stroke.length) { hist.push(stroke); redo = []; if (hist.length > 400) hist.shift(); }
        stroke = null; drag = null;
        updateDone(true); hud(); checkWin(); saveProg();
      }
      function undo() {
        if (solved || !hist.length) return;
        const s = hist.pop();
        for (let k = s.length - 1; k >= 0; k--) { cells[s[k][0]] = s[k][1]; anim[s[k][0]] = 0; }
        redo.push(s); snd.tone(300, .08, 'triangle', .06, 220);
        updateDone(false); hud(); saveProg();
      }
      function redoIt() {
        if (solved || !redo.length) return;
        const s = redo.pop();
        for (const a of s) { cells[a[0]] = a[2]; anim[a[0]] = 0; }
        hist.push(s); snd.tone(300, .08, 'triangle', .06, 400);
        updateDone(false); hud(); saveProg();
      }
      function clearAll() {
        if (solved) return;
        if (!cells.some(v => v)) return;
        const s = []; for (let i = 0; i < n * n; i++) if (cells[i]) s.push([i, cells[i], 0]);
        for (const a of s) { cells[a[0]] = 0; anim[a[0]] = 0; }
        hist.push(s); redo = []; snd.noise(.25, .06, 1800, 300, 1); updateDone(false); hud(); saveProg();
      }
      function hint() {
        if (solved) return;
        const bad = [];
        for (let i = 0; i < n * n; i++) if (cells[i] && (cells[i] === 1) !== !!puz.mask[i]) bad.push(i);
        let target = null, nv = 0;
        if (bad.length) { target = bad[0]; nv = 0; }
        else {
          const known = new Uint8Array(n * n);
          for (let i = 0; i < n * n; i++) known[i] = cells[i] ? cells[i] : 0;
          const g = nSolve({ rows: puz.rows, cols: puz.cols }, n, known);
          const cand = [];
          if (g) for (let i = 0; i < n * n; i++) if (g[i] && g[i] !== cells[i]) cand.push(i);
          const fills = cand.filter(i => g[i] === 1);
          const pool = fills.length ? fills : cand;
          if (!pool.length) { for (let i = 0; i < n * n; i++) if (puz.mask[i] && cells[i] !== 1) pool.push(i); }
          target = pool[Math.floor(Math.random() * pool.length)]; nv = puz.mask[target] ? 1 : 2;
        }
        stroke = [];
        const keep = save.set.mistakes; save.set.mistakes = false;
        setCell(target, nv);
        save.set.mistakes = keep;
        hints++; hintCell = target; hintT = 0;
        snd.arp([79, 84], .07, 'sine', .07, .3);
        endStroke();
      }

      function cellAt(e) {
        const p = toLocal(e), x = Math.floor((p.x - ox) / cs), y = Math.floor((p.y - oy) / cs);
        return x >= 0 && y >= 0 && x < n && y < n ? [x, y] : null;
      }
      function paintAt(x, y) {
        if (!drag) return;
        if (drag.lock === 'r') y = drag.sy; else if (drag.lock === 'c') x = drag.sx;
        else if (x !== drag.sx || y !== drag.sy) { drag.lock = Math.abs(x - drag.sx) >= Math.abs(y - drag.sy) ? 'r' : 'c'; if (drag.lock === 'r') y = drag.sy; else x = drag.sx; }
        if (x === drag.lx && y === drag.ly) return;
        drag.lx = x; drag.ly = y;
        const i = y * n + x, c = cells[i];
        if (drag.val ? c === 0 : c === drag.erase) {
          if (setCell(i, drag.val)) {
            drag.k++;
            if (drag.val === 1) snd.tone(snd.NOTE(snd.pent(drag.k) + 12), .1, 'triangle', .07, 0);
            else if (drag.val === 2) snd.noise(.05, .05, 2600, 1800, 3);
            else snd.noise(.04, .04, 900, 500, 2);
          }
        }
      }
      function down(e) {
        if (solved || winT >= 0 || e.button === 1) return;
        snd.resume();
        const c = cellAt(e);
        if (!c) return;
        e.preventDefault();
        try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
        const want = e.button === 2 || e.ctrlKey || e.metaKey ? (mode === 1 ? 2 : 1) : mode;
        const i = c[1] * n + c[0], val = cells[i] === want ? 0 : want;
        stroke = [];
        drag = { sx: c[0], sy: c[1], lx: c[0], ly: c[1], lock: '', val, erase: want, k: 0 };
        cur = { x: c[0], y: c[1] };
        if (setCell(i, val)) {
          drag.k++;
          if (val === 1) snd.tone(snd.NOTE(snd.pent(0) + 12), .1, 'triangle', .07, 0);
          else if (val === 2) snd.noise(.05, .05, 2600, 1800, 3);
          else snd.noise(.04, .04, 900, 500, 2);
        }
      }
      api.on(canvas, 'pointerdown', down);
      api.on(canvas, 'contextmenu', e => e.preventDefault());
      api.on(canvas, 'pointermove', e => {
        const c = cellAt(e);
        hover = c ? { x: c[0], y: c[1] } : null;
        if (drag && c) paintAt(c[0], c[1]);
      });
      api.on(canvas, 'pointerleave', () => { hover = null; });
      api.on(window, 'pointerup', () => { if (drag) endStroke(); });
      api.on(window, 'pointercancel', () => { if (drag) endStroke(); });

      press(api, scr, '[data-a],[data-m]', b => {
        api.sfx('tap');
        if (b.dataset.m) { setMode(+b.dataset.m); persist(); return; }
        const a = b.dataset.a;
        if (a === 'levels') toHub();
        else if (a === 'undo') undo();
        else if (a === 'redo') redoIt();
        else if (a === 'hint') hint();
        else if (a === 'clear') clearAll();
      });
      api.on(mistBox, 'change', () => { save.set.mistakes = mistBox.checked; persist(); hud(); });
      api.on(window, 'keydown', e => {
        if (scr.hidden || e.repeat && !/Arrow/.test(e.key)) return;
        if (e.target && e.target.tagName === 'INPUT') return;
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redoIt() : undo(); return; }
        if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redoIt(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || solved) return;
        if (k === 'f') setMode(1);
        else if (k === 'm') setMode(mode === 1 ? 2 : 1);
        else if (k === 'u') undo();
        else if (k === 'y') redoIt();
        else if (k === 'h') hint();
        else if (k.startsWith('arrow')) {
          e.preventDefault();
          cur = cur || { x: 0, y: 0 };
          cur = { x: clamp(cur.x + (k === 'arrowright') - (k === 'arrowleft'), 0, n - 1), y: clamp(cur.y + (k === 'arrowdown') - (k === 'arrowup'), 0, n - 1) };
          if (e.shiftKey) { stroke = stroke || []; const i = cur.y * n + cur.x; if (!cells[i]) { setCell(i, mode); } }
        } else if (k === ' ' || k === 'enter' || k === 'x' || k === 'z') {
          e.preventDefault();
          cur = cur || { x: 0, y: 0 };
          const i = cur.y * n + cur.x, want = k === 'x' ? 2 : k === 'z' ? 1 : mode;
          stroke = [];
          setCell(i, cells[i] === want ? 0 : want);
          if (cells[i] === 1) snd.tone(snd.NOTE(snd.pent(2) + 12), .1, 'triangle', .07, 0); else snd.noise(.05, .05, 2600, 1800, 3);
          endStroke();
        }
      });
      api.on(window, 'keyup', e => { if (e.key === 'Shift' && stroke && !drag) endStroke(); });

      function draw(dt) {
        const t = time;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#fbfaff'; ctx.fillRect(0, 0, W, H);
        const wp = winT >= 0 ? winT : -1, lineA = wp < 0 ? 1 : Math.max(0, 1 - (wp - 1.0) / 1.0);
        const fsz = Math.max(8, cs * .52);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
        if (lineA > 0) {
          ctx.globalAlpha = lineA;
          ctx.fillStyle = '#f0f1fc';
          rr(ctx, ox - rowW + 2, oy, rowW - 6, n * cs, 8); ctx.fill();
          rr(ctx, ox, oy - colH + 2, n * cs, colH - 6, 8); ctx.fill();
          if (hover && !drag) { ctx.fillStyle = '#dfe3fb'; ctx.fillRect(ox - rowW + 2, oy + hover.y * cs, rowW - 6, cs); ctx.fillRect(ox + hover.x * cs, oy - colH + 2, cs, colH - 6); }
          if (cur) { ctx.fillStyle = '#d3d9fb'; ctx.fillRect(ox - rowW + 2, oy + cur.y * cs, rowW - 6, cs); ctx.fillRect(ox + cur.x * cs, oy - colH + 2, cs, colH - 6); }
          ctx.font = `800 ${fsz}px "Segoe UI",system-ui,sans-serif`;
          for (let y = 0; y < n; y++) {
            const cl = puz.rows[y];
            let x = ox - cs * .28;
            for (let k = cl.length - 1; k >= 0; k--) {
              const s = String(cl[k]), w = s.length * fsz * .62;
              x -= w / 2; ctx.fillStyle = rDone[y] && rDone[y][k] ? '#b9bdd6' : '#2d3263';
              ctx.fillText(s, x, oy + (y + .54) * cs);
              x -= w / 2 + fsz * .5;
            }
            if (!cl.length) { ctx.fillStyle = '#b9bdd6'; ctx.fillText('0', ox - cs * .5, oy + (y + .54) * cs); }
          }
          for (let xx = 0; xx < n; xx++) {
            const cl = puz.cols[xx];
            let y = oy - cs * .22;
            for (let k = cl.length - 1; k >= 0; k--) {
              ctx.fillStyle = cDone[xx] && cDone[xx][k] ? '#b9bdd6' : '#2d3263';
              y -= fsz * .58;
              ctx.fillText(String(cl[k]), ox + (xx + .5) * cs, y);
              y -= fsz * .58;
            }
            if (!cl.length) { ctx.fillStyle = '#b9bdd6'; ctx.fillText('0', ox + (xx + .5) * cs, oy - cs * .5); }
          }
          ctx.globalAlpha = 1;
        }
        const cx = n / 2 - .5, cy = n / 2 - .5;
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const i = y * n + x, v = cells[i], px = ox + x * cs, py = oy + y * cs;
            let bg = wp >= 0 ? '#f1f3fc' : '#ffffff';
            if (lineA > 0 && ((hover && !drag && (hover.x === x || hover.y === y)) || (cur && (cur.x === x || cur.y === y)))) bg = '#eef0ff';
            ctx.fillStyle = bg; ctx.fillRect(px, py, cs, cs);
            if (v === 1) {
              const a = anim[i] = Math.min(9, anim[i] + dt);
              const s = a < .22 ? .55 + .45 * back(a / .22) : 1, pad = cs * (1 - s) / 2 + (wp >= 0 ? 0 : cs * .07);
              let col = '#3d4580';
              if (wp >= 0) {
                const dl = Math.hypot(x - cx, y - cy) * .07, q = ease((wp - 0.15 - dl) / .55);
                col = mix('#3d4580', puz.pal[puz.colr[i]] || '#3d4580', q);
                if (q > 0 && q < 1) { const b = Math.sin(q * Math.PI) * cs * .08; ctx.fillStyle = col; ctx.fillRect(px - b, py - b, cs + b * 2, cs + b * 2); continue; }
                ctx.fillStyle = col; ctx.fillRect(px, py, cs, cs);
                continue;
              }
              rr(ctx, px + pad, py + pad, cs - pad * 2, cs - pad * 2, cs * .16);
              ctx.fillStyle = col; ctx.fill();
              ctx.fillStyle = 'rgba(255,255,255,.14)'; rr(ctx, px + pad + cs * .06, py + pad + cs * .06, (cs - pad * 2) * .6, (cs - pad * 2) * .22, cs * .08); ctx.fill();
            } else if (v === 2) {
              const a = anim[i] = Math.min(9, anim[i] + dt), s = Math.min(1, a / .14);
              const m = cs * .3;
              ctx.strokeStyle = wp >= 0 ? `rgba(170,176,210,${Math.max(0, 1 - wp * 2)})` : '#9ca3cf'; ctx.lineWidth = Math.max(1.5, cs * .075); ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(px + m, py + m); ctx.lineTo(px + m + (cs - 2 * m) * s, py + m + (cs - 2 * m) * s);
              ctx.moveTo(px + cs - m, py + m); ctx.lineTo(px + cs - m - (cs - 2 * m) * s, py + m + (cs - 2 * m) * s); ctx.stroke();
            } else anim[i] = Math.min(9, anim[i] + dt);
            if (flash.has(i)) {
              const f = flash.get(i) + dt;
              if (f > .6) flash.delete(i); else { flash.set(i, f); ctx.fillStyle = `rgba(239,79,79,${.55 * (1 - f / .6)})`; ctx.fillRect(px, py, cs, cs); }
            }
          }
        }
        if (hintCell != null && (hintT += dt) < 1.6) {
          const x = hintCell % n, y = (hintCell / n) | 0, a = Math.sin(hintT * 9) * .5 + .5;
          ctx.strokeStyle = `rgba(245,166,35,${.35 + a * .6})`; ctx.lineWidth = 3; ctx.strokeRect(ox + x * cs + 1.5, oy + y * cs + 1.5, cs - 3, cs - 3);
        }
        for (let k = lineFlash.length - 1; k >= 0; k--) {
          const f = lineFlash[k]; f[2] += dt;
          if (f[2] > .6) { lineFlash.splice(k, 1); continue; }
          const al = .35 * (1 - f[2] / .6);
          ctx.fillStyle = `rgba(90,200,150,${al})`;
          if (f[0] === 0) ctx.fillRect(ox, oy + f[1] * cs, n * cs, cs); else ctx.fillRect(ox + f[1] * cs, oy, cs, n * cs);
        }
        if (lineA > 0) {
          ctx.globalAlpha = lineA;
          for (let k = 0; k <= n; k++) {
            const strong = k % 5 === 0;
            ctx.strokeStyle = strong ? '#8b92c4' : '#d5d9ee'; ctx.lineWidth = strong ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(ox + k * cs, oy); ctx.lineTo(ox + k * cs, oy + n * cs); ctx.moveTo(ox, oy + k * cs); ctx.lineTo(ox + n * cs, oy + k * cs); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        fx.step(dt); fx.draw(ctx);
      }
      api.loop(dt => {
        if (scr.hidden) return;
        if (!solved && cells && cells.some(v => v)) { time += dt; tmV.textContent = clock(time); saveT += dt; if (saveT > 8) { saveT = 0; saveProg(); } }
        else if (!solved) tmV.textContent = clock(time);
        if (winT >= 0 && winT < 90) winT += dt;
        draw(dt);
      });
      api.on(window, 'pagehide', saveProg);
      return { destroy() { saveProg(); } };
    }
  });

  const F_DATA = {
    5: [
      '0kRRR,00RR,09DL,04LDLDL,0oULLLLUUR',
      '0kRR,0oLUU,01DD,0jUUULL,08LDDLLUUU',
      '0jLLL,00RDD,0cUR,02RRDDL,0oLLLLUUU',
      '06RRR,0nRUUL,0mLU,0iLULLDD,05URRRR',
      '08LL,0jDL,0mLU,0bRD,0kUUUURRRRDDLD',
      '0kUR,0aRU,05URRDD,03DDDLDL,04DDDDL',
      '09LLL,0fDR,0gRDR,0oUL,04LLLLDDRRRR',
      '03RD,0oUULL,0kRRR,0fUUURR,08LLDDRR',
      '04DL,03LL,0bLDDR,00DRRDRD,0eDDLLUL',
      '0kUU,04DD,0nLLUU,06RDD,05URRRDDDRD',
      '04LL,00RD,0hRU,0gURURRDDD,0nLLLUUU',
      '04DD,0oUL,0gUUR,03DDLDDR,0lLUUUURR',
      '00DDD,0kRU,07RD,0cDR,0bUURRRDDDDLL',
      '0oUU,04DLLL,0hLU,0kUUUURRR,0cRDDLL',
      '0kUUU,00RR,0iUL,03DLLDDR,04DDDDLLL',
      '0nUU,0gRU,0oUUUUL,08LULLD,06DLDDRR',
      '04DDD,0oLU,0mULU,0lLUUURR,0cRUULLL',
      '04LL,0gULU,06UL,0oUUULLDD,0dDDLLLU',
      '04DDD,0mLL,07LU,0oLULLL,02RDDLLLUU',
      '0gUU,07RD,0cDR,09ULLLLDDDD,0eDDLLL',
      '0kURU,0lRRU,0hUR,06RRRDDD,04LLLLDD',
      '09LLL,0gUR,0hRDR,0jUL,04LLLLDDDDRR',
      '01DDD,0mUU,0jUUUL,00DDDDR,0oLUUULU',
      '04DD,0jDL,0gUUL,0iUUULLL,0aDDRRUUU',
      '0kUU,05UR,06DD,0hRUU,0lRRRUUUULLDD',
      '00RR,04LD,09DLL,0jLLLUUR,0oLLLLUUU',
      '02RRDD,00RDR,0lRR,08DLLLU,0kURRRRD',
      '0oUU,09UL,06DD,0dLD,0iDLLLUUUURRDR',
      '0kRR,0oLUL,0dULL,0fRUR,0aUURRRRDDD',
      '0cDDLL,01LDD,0bDL,0jUUULL,06RRDDDR',
      '0nLU,0cLD,00DDDDR,0oULUULL,0eUULLL',
      '0fUUU,0gRR,0bUR,0cRUULL,0kRRRRUUUU',
      '00RRR,0iDL,0hLD,0oUULLL,0kUUURRRRU',
      '0kUUU,00RD,0nUUU,0hDL,0gURUURRDDDD',
      '0oLLL,0hURU,0iRU,09ULLLLDD,0kURUUR',
      '0kUU,04DD,0jLUUULL,0oLLLUU,00DRRDD',
      '04LL,01LDD,0kURR,0cRD,0lRRRUUULLLD',
      '09LDD,0kRUU,0fUU,00RD,0eDDLLUUUURR',
      '0oLU,0jUU,07ULLD,0mLLUURU,0gRURUUR',
      '04LLL,0oLL,0fURRRR,09LLLLU,0kRURRR',
      '04DD,0oLLUU,0lLU,0gUURRDDR,03LLLDD',
      '00RR,08LLL,0aDRR,0kRRRUULL,0oUUUUL',
      '0gRDR,0cRR,0iRD,04LLLLD,09LLLDLDDR',
      '0kRR,04DL,01DD,03LDDRRDDL,00DDDRRR',
      '0oLLL,0hRU,0aUR,0kURURUR,00RRRRDDD',
      '04LL,0kUUU,09LD,0iLUULUL,0bDDRRRUU',
      '0hUU,0lLUU,05RDD,00RRRDDD,04DDDDLL',
      '0fRR,0iUL,04DLLL,0eDDLLLL,0bLUURRR',
      '0kRR,0nRU,0fURR,08LLL,00RRRRDDLDLL',
      '0kRRR,0oULL,0aUU,01DRR,02RRDDLLLDL',
      '0kRU,06DRR,0iLD,0nRUUULL,04LLLLDDD',
      '0iUU,03LL,00DRRD,0bDR,0aDDRRRRUUUU',
      '04LL,05DDD,09LD,00RDRDDRRU,0bDDRRR',
      '0kURU,06RD,0nRUU,0aUURRRR,09LDDLDL',
      '0kRRR,0eUU,00DRR,01RRDDLL,0oULLLLU',
      '0oLL,0cLD,0jUUULL,00DDDDR,01DRRDDL',
      '04DDD,0kRR,07DL,00RRRDDDDR,0hLLUUR',
      '0oUU,0kRRR,0aRR,05URRRRD,06RRDDLLL',
      '04LL,0dDDLL,0kUR,0hULLUU,0oUUULLLU',
      '04LD,0cRD,0lUUURU,01LDDDD,09DDDLLU'
    ],
    6: [
      '0sLLL,0fLDL,0dURRRDDL,0vRRRRUU,0hUULLLLLDDDDD',
      '00DDD,09DDR,0sLLUUU,0vRRRRUUULU,0bULLLLDDDDLD',
      '0lUULLDL,05DDLDDLLLD,0wRRRUU,0uUURRU,0aULLLLD',
      '05DD,0sLU,0jUURURRDDDRDDLLL,01LDDDDD,09DLDDLD',
      '0pUUU,0aDL,0qDLLUUUUURR,03RRDDDDDLLU,09LDDRRD',
      '0uUU,0mUU,04RDDDDDLLLLUU,0qUULLUURRR,07RRDDDR',
      '0lDL,0kLD,0aDLLLU,0mDDLLLLUUUUURR,0zUUUUULLDL',
      '0gLD,0oRRUUL,05LLLLLDDDR,0mDLDLLL,0yRUUUULLLL',
      '0zLL,04DDD,0lLUU,0fUULLDDDD,00DDDDDRRURRRUUUU',
      '0cRRR,0vUR,0rULLLDD,0zUUUUULLLLL,06RRRRDDDDLL',
      '0sUUU,0qLUUU,01LD,0fUURRDDDDDL,02DDDRDDLLLUUU',
      '0uUUU,0gUL,0fDRRUUULL,0zLLLLUUUULU,0tLLLUUUUL',
      '0sRU,0hULLD,06DDDDRRRRR,00RDDDDRRURU,05LLLDDD',
      '0uRU,0aDDD,0rUUL,09LLDDRD,0wRRRUUUUULLLLLDDDD',
      '0gDD,0rUL,07RRRUR,0fLLDDR,03LLLDDDDDRRRRRUUUU',
      '0zUUU,09LDDL,06URRRR,0mDDLLLL,05DLDLDDLLLUURU',
      '0bLLL,0pUR,0hLDD,00DDDDDRRU,0nDDLLUUULLUURRRR',
      '0tUULU,0mLUU,07RDD,0zLULLLUU,0xLLLUUUUURRRRRD',
      '08RR,0oURR,0uRURRU,0wRRUUULLLU,0cUURRRRRDDDDD',
      '0gUU,0pUU,07RD,05DDDLDLLU,0lUUULLLDDDDDRRRRRU',
      '0vRRU,07DDD,0qURU,0eURRDDDD,0zUUUUULLLLLDDDDD',
      '0eRRD,0nDLL,0lLDDRRR,0aLLLDDD,0hUULLLLLDDDDDR',
      '0zLL,0mUU,08DLDD,00DDDDDRRUURUU,07URRRRDDDDLL',
      '0dDRR,0fRDDLLL,0aLULLL,0oUUURRD,0uRRRRRUUUUUL',
      '07DDDRR,05DDD,03DD,04DDDDRD,0lLUUULLDDDDDRRRR',
      '06RR,05LD,0bDL,0jDDR,0uUUURRDDRDRRUU,00RRRDDDRD',
      '0yLL,0qLD,0zULLULLLDD,0nUUULLL,06DRRRRD,0aLLLUL',
      '05DDD,0uRR,06RR,04DDDDRD,0eLLDDRRRDR,00RRRDDDLL',
      '05DD,0zLUL,07DDD,0qURU,0eUR,0xLLLUUUUURRRRDDDRD',
      '0uRRR,0zLU,0tUL,0dUURRRR,00DDDDRRRUURRU,0jRUURR',
      '0uRRU,0xRR,0jURR,0mUULLLU,0kRDRRUUUULLL,0pLUUUU',
      '00RR,0rLL,0jRRU,0zUUUUL,05LLDLDL,07LDDDDRRRRUUU',
      '0uUUR,0zLLL,0fDR,07RRRRU,0kULLUURRRR,0gRDDLLLLD',
      '04DD,0qRR,07LU,0mLUUULL,0uUUURRU,05DDDDDLLLLUUR',
      '00RRDR,0zLL,06RDRRRU,03RRDDDL,0tLLULLD,0cDDDRRU',
      '0uUU,09DLD,0qRU,0sUURUU,0nDDLLLLUUULUUR,0aULLDL',
      '05DD,0qULL,03DLL,0uUR,02LLDDRRRDDR,04DDDRDDLLLL',
      '0gLDD,0pUUR,02RRR,0zUUUULLLLU,0vLUUUUU,0mDDLLUU',
      '01DR,0eRU,0sLULLU,0hUULLL,0vLUUUUU,0aDDRDDLLLUL',
      '0zLL,0gUU,0oDRRUUUU,0mLUUULLDD,05DDDDLL,00DDDRD',
      '0zLL,0jUUR,0sRU,05DLLDLD,0uRRURURUR,04LLLLDDDDR',
      '0uRR,0sUUU,02LL,0fDLL,06RRRURRDD,0eLLDDRRRDRRUU',
      '0bLL,07DDL,0kRR,0cUURRRRR,0oRRRRRUULLLU,0zLLLLL',
      '0sLU,06RD,0oDR,0hUULLLLL,0cDRRUR,0pRDRRRUULUULL',
      '0uUU,0cRD,0eRD,0kDLD,00RRRRRDDDDDLLL,06RRRRDDDL',
      '0iRRR,0cRU,0gUL,08DR,0uRRRRRU,06URRRRRDDDLDLLLL',
      '04DD,0pRU,0jURU,0mLUUULLD,0yRUUUUU,00DDDDDRRRUR',
      '0uUU,04RD,0mLU,01DRDDDRRRD,0yLLLUUULUU,02RDRDRD',
      '05DD,0sLUU,00DD,0dUURRRDDDRD,0pRUUUR,0jLDDRRRRR',
      '0uRRR,0mLUL,0cRDR,0yULLLLU,0zUUUUULLLL,0gULLLLU',
      '0zLLUL,09LD,0fDL,0wLUUUU,0mUUULLLLDDDDD,0sRUUUU',
      '0sLLLL,0aDL,09LLD,0lRRUUU,0eDLLUUURRRR,0uRRRRRU',
      '0vUUU,07RD,0gDR,0zULL,0hUULLLLLDDDDD,0aLDDLDDRR',
      '05DDD,0yLU,0gUULLD,0zULULUU,0oDRRUUULU,0pULUUUR',
      '0xRUUU,0oRU,0kUL,0iUUURRRRR,0uRRURUU,0zUUUULLLL',
      '0mUU,0pRU,0eLD,0yULUUULLLU,01RRRRDDDDD,0cDDDRRR',
      '05LL,0uUUU,0qURRU,01RDD,0rRRUUULLD,0zLLLLUUUULU',
      '06RD,0zLL,0bLD,0fDR,05LLLLL,09LDDLD,0hDDLLLDLLUUU',
      '0bLL,00RD,06DR,0wLU,0sRUUL,05LLLDDRDR,0zLLULULLDD',
      '05LLL,0uUU,0jDD,0rRD,0gLLLLUU,0zUULLLDDR,0hULLLLU'
    ],
    7: [
      '1cLUU,0wDL,0zUUURURRRR,16RUUURURR,1aLLUURURRU,07URRRRRRDDDDD',
      '0qLLLD,13LLD,0jLLLLDDDD,1cUUUUULLLLLLDDDDD,06LLLLLL,0vRRDDLL',
      '0pLDLLL,0lRR,14LLLLLD,0yDDLLLLL,0rUULLLLL,06LLLLLLDDRRRRRDDL',
      '08DRD,09RRDDD,0hDD,0uDRRRUUUU,1cLLLLLUUU,15UUUUULLLLLLDDDDDD',
      '16URR,0xUUULL,09DRR,07DDDRRRD,14LUULLLUU,00RRRRRRDDDDDDLLLLL',
      '16RRR,1cLL,09RDR,0xLLLLULUUU,0bRDDLLLULUU,02RRRRDDDDDLLLLLLU',
      '0dLL,09RD,0sDDRRRRRR,06LLLLLDDRDRRURR,0rLDLLLLULUUU,10RRRRRU',
      '16RR,0tUU,13UUUULUL,1cUUUUUULL,00DDDDDRRUU,0cDDDDDLLUUUULULU',
      '0zRR,02LDDDR,0bDLL,0wUL,00DDDDRRRDRRUUUUULLDL,16RRRRRRUUUUUU',
      '06LLLLL,0zRUURRR,0uRR,0sUURRRRR,16RRRRRRUU,11RRRUURUULLLLLLU',
      '0cLL,0pLL,0uLUU,16RRRRRR,0lUUURRRRRRDDDDDLL,0sDRRRURRUULLLUL',
      '11RURUU,13RD,0fDDDDRRR,00RRRRRRDDD,16UUUUURRDDD,1cUULUUULLDD',
      '0wUURU,0fUURR,16RUUURUR,0uDDRRRRUU,0zUUUUU,09RRURRDDDLDDLLUU',
      '05RD,17URRR,0hRDRRDDD,0kLULLLDDR,08DDDRRRRDDLLL,04LLLLDDDDDD',
      '12LU,0tURUU,10LUUUUU,0cDDDDD,0fUURRDDDD,16RRRRUUUUUURRDDDDDD',
      '07RRR,0jDLL,0xDLLL,0eRRRRUR,16UUURRDRR,0tDDRRRRRUUUUUULLLLLL',
      '0uRR,0cDLLLULL,00RRRDR,04RRDDDDDLLLLLULUUR,0zDRRRRRR,0mRRRRD',
      '0dUL,0mUURR,0jDDDLLLLL,0cLULLLLDDDDRRRU,16RRRRRRUUUU,0wUULLD',
      '00DDD,1cULLLUU,0yLL,1bLLLLLUU,0uUURRDRRUUULLLLL,0jULLLLDDDDR',
      '15DLLLU,0pDL,10RUUR,06LLLLLLDDDDDDRR,0tUURRRRDDDL,08RRRRRDDD',
      '0oRU,0kLD,16RRRRRR,0dLLLLLDDD,0hLDDRRRRU,06LLLLLLDDDDDRRRRRR',
      '1cUUUU,0jLD,08RDDD,0vUUURRR,06LLLLLLDDDDDDRRRRRU,0qDLDLLLUUU',
      '00RRRR,0dDLL,13LL,15LULLLU,16UUUUURRRRRUR,1cLLLLLUUUURRDRRRD',
      '19RRU,10UUUUU,0uUURR,03RRRDDDDDD,0vURRUULLLU,0xLDLLDLLUUUUUU',
      '14ULLLU,08DRR,0iUL,0oRRUUULLLD,0sDDRRR,06DDDDDDLLULLLUULUUUR',
      '0rUUU,07DD,10RRRR,0gRD,0fURRRDDDLLU,0mDLDDRRRRRRUULUUUULLLLL',
      '1cLLLLL,15LLLL,0eRR,0bRD,16URURRRRR,0iLULLLU,0sURRRRRRUUULLLLL',
      '1cUU,0mUUU,0xURUUU,05DDLDDDRD,0zDRRRR,03LDDDDLLUUUU,04DLDDDDLL',
      '0wDLLL,06LL,0jLULU,0hLD,0mUURU,01LDDDDRRRURRDD,0cRDDDDDLLLLLLU',
      '06DL,16RUU,13LULUL,0zUUURRRDRRRDDD,07RRRRDRR,00RRRRR,0wRDDLLLU',
      '10RRRRR,0gDL,00RRRRRR,0bRRDDDLLUL,0fLDDRRR,0zDRRRRRR,07RRRDRRD',
      '10UU,01RRRRR,0bRRD,0rLULLUL,00DRDRDDD,14LLUUR,0wRRDDLLLLLLUUUU',
      '1cLLLL,0zUR,0xLULUL,0qULU,0vLULLUUURR,0fURRURRD,06DDDDDLLLLLDL',
      '05DD,0wLLL,10LUUR,0oLU,0eRURRD,07URRRRDDDRDDLLLDLL,06DDDDDDLLL',
      '1cLL,0pLD,11UULLD,0zRU,06LLLLLL,0wRUULLLLL,07RRRRRRDDDDLLLDLLL',
      '0cLLL,0eDDDD,0pLLLD,13LDL,17URURRRDDL,1cUUULULLLLUL,00RRRRRRDD',
      '0cLLLL,16UURU,18RU,0yLD,0fRDRRRR,0lUUURRRRRRDDLLL,15DLLUULLDLD',
      '06LLLLL,00DRRR,0jDRD,0mDDR,1bLULULU,19LLLUUUURRRRURRD,1cULULUL',
      '00RRRR,16UU,0rDDLLL,0pLL,0fRRRRRU,1cLLLLLUUULUURRRRRUR,0qDLLLD',
      '0rUUU,14LUUUU,04LDDDD,02DL,05DDDDRDDLLLULL,0mLDDDRR,0tRUULLUUR',
      '0uUU,0qLU,1bULLLLUUULUU,09RDDDRR,0jULULLLD,05RDDDDDD,1aLLLLUUU',
      '06DLDDD,14LUU,05LDDLL,0vUL,03LLLDDDDDR,12LULUUURR,0kDDDDLLLLLL',
      '1cLL,0iRD,16RRRUUL,0tURRRDR,11LLUUUUURRD,0cLLDLLU,03RRRDDDDDLL',
      '06DDDD,1bLUU,05DLLL,0pLDDD,10UUR,04LLLLDDDDDDRRUU,08DRRRRDDDRD',
      '06DD,13LL,10URRR,0mRUR,0oRUULLLD,0xDDLLLL,1cUUULUUULLLLLDDDDDD',
      '14LLL,0sUR,09RR,0pDRRUUUU,0zRURRUUR,15DLLLLLL,0nULLUU,0qUUULLLLD',
      '16UUU,1cUU,06DL,11UU,0kDLDDD,08RRRDR,0pDDDLLLUUU,12UUULLLUURRRRR',
      '06DDDD,1cULUL,1bLULUL,19LU,17UUUUR,0bDDLL,0hULL,0qUUULLLLLDDDDDD',
      '06DD,05DDDRD,04DD,0pLU,03DLDDDRRRDR,08DDDDDRR,1cLLULL,02LLDDDDDD',
      '00DDDD,16URUU,17RUUUR,14LL,0vRRU,01DDRRRD,09URRRRD,0aRRDRDDDDLLL',
      '17UURUU,1bULUU,1aLLU,12UUUR,03RDRDDD,05RDDDDDD,0eUURRDR,08DDLDDD',
      '06DD,00DD,1cUUULU,05DL,11RUULUUURR,13UUULU,0xDDLLLLUUR,01DDDLDDD',
      '06DDDD,1cULULUUU,1bLU,08DRR,0nLD,0uDL,02LLDDDDDDRRRUUU,0qUUULLDL',
      '0zRRR,14LUL,0xUU,00RRRR,0aDLL,05DLDDLLDLL,0mLUURR,06DDDDDDLLLLLL',
      '1cLLLLL,16URR,0mUR,0nRU,0rLUU,00RRRRRRDD,0sRRRDRRR,0yLLUUULLLLDD',
      '0rDD,0aLL,0lDD,16RUUU,0pDDDLLU,04LLLLDDRRDDRD,0dDLDDDDR,06LDLDLD',
      '06LLLL,00RDRDR,0fDD,10RUR,0xLULL,0qULUL,12RRRUUUUL,1cLLLLLLUUUUU',
      '00DDD,0wLL,0fUURRR,09DR,0aRRU,06DDDDDDLLLL,17URRRRUUU,16UURURRRU',
      '00RRRR,06LDLL,13UU,07RRDD,0uLUUL,0lDDD,14UUULLDDDL,10DRRRRRUUUUU',
      '06LL,0dLLD,1cLL,0kLDD,11UUUULU,0rDDLLUULUUUL,00DDDDDD,0fDDDDRRUU'
    ],
    8: [
      '09DDDD,1bLLDDR,1iRD,0lLD,1kUUUUUUURRRRRRRDDDDLLLDDD,0jDDDDDL,1lURUUUUURRRRDDL',
      '0pUR,19UUL,0qRURRR,1mLLUUUUUUURRR,09RRRURRR,10LLLDDRRDRRRRUUU,0dRRDDLDDDLLULL',
      '1iULL,0oDDDDRRRRRRRUU,1eLUUUULUURR,0kLLDDDRDRR,13UUUULLLL,0eDDDLLLU,09RRRRDDL',
      '1kRRR,0eDDDD,15URUURRD,18URUUULLLLDD,05RRDDDDDDLLU,16DLLUUUUUURRRR,1rLLLULUUU',
      '0zRUUU,0bDD,18LLUUUUL,1rUUUUUUU,15UUULUURRRRRDDDD,19DLLLLLUUU,1kRRRRRRUUUUUUU',
      '1kRUUU,1rLLL,19LLLDD,1nURRRRUUULULLLL,0eLLLLLDDRDRR,0rRRDRD,1cUUUUUURRRRRRRDD',
      '1kRRRRR,07LL,1qRUU,0fLLLULLLLDDDDDDRRRR,1iLULLLLUUUURRD,0rRURRRDDLD,0iDDRRRUR',
      '1iULUU,0lLD,1hLUUL,1eLUURURU,16RDDLLLUUUUUUU,09URRRRRRDDDDDDDLLL,12UUULLLLDLD',
      '1cRR,1rLLLU,1aUUU,0rLUU,0cRRRDDDDDLL,00DDDDDRRURRUULU,07LLLLLLDDDD,1kRRRUURRUUU',
      '00RR,0cRRRDD,0hDRRRD,18LULL,0iULLDDDDRR,0mDDRDDDLLLLLLL,1cRRRRR,07LLLLDDRRDDDRD',
      '1kRRR,1hRUU,0iDR,15URRRUUL,0uLDDLLL,09RRRRDR,0eULLLLLLDDRD,07DDDDDDDLLLULLLLUUU',
      '1kUUUU,0gRDDD,0lDL,1lURR,00RRRRRRRDDDDD,0rDRRDDDRR,0kLLDDDRRDDLL,1jLUUUUULLLLLL',
      '00DDDD,02DRRRR,01DDDDDLDDRRR,16UUURRD,0rDDRRRUU,03RRRRDDLLDDL,1hRRUUU,1dRRRDRRR',
      '00DD,1eUU,0iDR,12DDLLLUURUUL,0hDLDDDD,0lULLLLU,18RUURUUULLLL,0xDDDRRRRRRUUUUUUU',
      '07LL,1kUUUUU,08RDRD,17RU,0mDD,13UUULLD,1iLLLLUURUUUL,00RRRRDDDRDDRRDDLLLLLLUUUU',
      '0dDDD,0sDLLU,0rUL,1iLDLLLLL,16LUUUURR,0kUURRDDDDDLLD,17DLLLUUUUUURRR,07DDDDDDDL',
      '07LLLL,0nLDDD,0kLLDD,0xUU,0vDDDLLUU,1lRRRRRR,0fLLLLLULL,1kURRRRUU,09LDDDDRRRUURRU',
      '06DD,0cLDDDD,0xUR,0aDL,07DDDDDD,00RRRRRDDDRDDDDR,0yDLLUUUUR,18DLLLL,0kDDRDDDLLLLL',
      '1kRRRRR,00DDDDR,0yUL,0jDRRR,0kRR,1cRRRRRRDR,14RRRRRRRD,0hRURRRRRDDDLLLL,09URRRRRR',
      '0tDDDD,0zUUUL,09DR,1eLUU,0gUURRRRRRR,1rUUUUUULLL,1oUULLUULLD,14DDRRRU,1qUUUUULLDD',
      '1rLLLL,15URUUU,07LLLD,0dRRDD,1aLLUU,16RUUURRRD,0pUUURRD,00DDDDDDR,0tDRRDDLLLLLDLL',
      '0eDD,03LLDD,1aULU,0dDLDDL,17LUUUU,15UULUUU,0rUURURRRDDDDDDLL,19LDLLLLUU,1rLLLLLLL',
      '1iUU,15RRU,18UUL,0nUL,0mLU,0gUURRRRRRR,0cDLLDDL,1dRRRRUUURRD,1bDDLLLLLLLUUUURUURR',
      '1rUUUUU,07LLL,0jDD,0yUU,0dDLDDDLLLL,1kRRRRRRUUU,0aLDDDL,1cRRRRRUUURUUR,0oUUURRRDR',
      '07DD,06DDLD,0uRD,0aRD,1fRDRRRUULULLL,1lLUUUUUUU,1nLULUUUUUURRR,0iDDDRRRDR,0rRUURU',
      '1rUUU,04RR,0hDD,0mLDDD,1eRU,1hLUULU,07DLLLLULLL,0sULLDDDLD,0nDLDDDDLLLLLLUUUUUURR',
      '07DLDDD,0xLUUU,0pUU,17LUUUUULL,1dRRDRRRUULUUU,1rUUUUU,0zUUUURRR,0dLDDDDDR,15LDDRR',
      '1kUUU,1rLLL,1eUR,0kLLUL,04RRRDD,0lULLULLLDDR,1aULULLLD,0oRDDDDRRUR,0eDDRDDDLLULUL',
      '07LLL,0fLLLD,0lRR,0aLD,0yDR,11RRD,1rLLULLLLUUURU,0zRDRRDR,0vLLLLUUULLLDDDDDDDRRRR',
      '1rUUU,0eDL,0dLLDLL,0kDRD,10LL,0wDDRRRR,0xDRRRRDDLLLLL,0rLLLUURR,1qUUUURUUULLLLLLL',
      '08RRDDL,14DDRR,0yRD,1gUU,0kRUR,0mDDD,16LULUUR,1rLLLLULL,0cLDDRR,11DDRRUUUUUULLLLLLL',
      '00RRDD,1kUUUUU,08RDDDD,1mRUUU,1rLLL,0nLL,18UR,19RU,0fLLLDDRRRDDDLLL,07LLLLDDDLDDDLD',
      '09RR,07DD,06DDL,04RD,12DL,11LDL,0xUR,1iLLLLLLUUU,03LLLDDRRRRU,1kRRRRRRRUUUULLLLDLDL',
      '1rUU,1qUUL,1cRRRR,16RRURU,0uULLD,0hDR,1kRRRRRU,09RDRDDLLDL,0bRRRRDDDL,07LLLLLLLDDDD',
      '1kUUU,16DRRR,1iULLLU,09DR,0aRU,10URU,05DRD,0pLUUURR,04DDLDLDLDDDRRRRRRUUULL,06RDDDL'
    ],
    9: [
      '08DDDDDD,0fDDDDDD,0jDDDRRU,12URU,0kULLDDDD,27LLLLLLLUURRRRUUUUUL,00RRRRRDDDDDDDLLLL,28ULUUUUUUUL',
      '0zUUULL,0pDLDDRD,1oLLLL,13LU,0uUL,11UUURRRDDD,0gLDLDDDLLLLDDRRRRRR,17RDDDDLLLLLLLLUUUUUUUURRRRRD',
      '0aRRRRRR,0zLDLLLL,0xLLL,20RRRRRRRR,0sRDDRRRRRRU,11DDRRRRRRR,00DDDDDDDRRRRRRRR,01RRRRRRRDDLLLLLLL',
      '0kLDD,0tDRR,17UUULLLULLLL,1hUUUUULLL,27LLLLLLLUUUUUUURRRDR,0uRRDDLLLLDDRRRR,0nRDDDRDR,1kRRRRDRRD',
      '00DDDD,06DRDDLLD,0dDLDDD,1eLUU,1jDRRRRRRUUU,16DDLLLLUUUUUR,28UUUUUUUUL,27LLLLLLLUUURUUUUURRRRDDR',
      '0pLLLLL,1oLLL,15LL,1aUUUURRRRRR,03LLLDDDDDDDD,1cRRRUULLL,04RRRRDDDDDDDDLLLLLLLUU,0yDDDDLLLLLUUUU',
      '00RDRR,09DRR,10RRR,1mDLL,1lLLDL,15DDDRRUUUUUU,0rRRRURURRDDDDD,02RRRRRRDDDDDDDDLLLLLLLL,1iURRRRUURU',
      '28LL,1lLLLD,0wDL,0vLDLL,22RRRURURUUUU,1nURUUULLLLLL,1yRUUUUUULLLLLLLL,00RRRRRRRR,20RURRRUULLLLUURR',
      '1fLLLL,0pDL,0oLDL,0mLD,1qDLLLLLLLUUU,0aDDLDDDDDRRRRRRRR,0iUURRRRRR,1kRRRRRURUUUU,08LDLLLLLDDDRRRRR',
      '08DLLLLL,0aRDRR,0jDRRRRU,18UULLD,1kRRURR,1nRR,0yDLLLLLL,1gRDDLLLLLLLUURR,28LLLLLLLLUUUUUUUURRRRRRR',
      '0pDL,17LLUL,1aDRDRDR,22LU,0rUUURRRR,28LLLUL,0gLDLLLDDRDRRRDR,20UUUURUUURRRRURRRDDDDD,0kDDDRDRRRDRR',
      '1rRRRRR,0hLLLLD,0xDDDLL,15DL,1aRUUR,11UUU,20RRRRRRURUUUU,0kRUURRRRR,27RUUUUUULLLDLDLDDLLLUUUUUURRD',
      '00RRRRRR,09RRR,0iRRRDD,1kURRUR,1lRR,1oUL,08LDLLLDDRRD,0hDDDDDDDLLLLLLLLUUUUUR,0tDLDDDRRRRRRUUUUULL',
      '0aRRRRR,1rRRRRRR,0yLLLLLL,1jUUR,1lRUR,1iUUUUUURRRRRRRRDDDDLDDD,1nRUULLLDLD,0jRRRRRRU,1hDDDLLLLLLLL',
      '20RRRRRR,0gDDDDD,1jRRR,1aRRRRD,0nLD,0wDLLLL,28LULLLLLLLUUUUURR,1zUUUUUUULLL,0sRRUULLL,00RRRRDRRDDDDD',
      '01DDDDDD,1vUU,14RD,1fDLD,0oURRD,0mDLDDDD,0bURRRRRR,00DDDDDDDD,0pDRDDDDDLLLLLL,21URUUUUURURRDDRDRDDDL',
      '20UUUUUU,0bRRR,1xLUUULL,1lLD,0nRUULLLLLL,1oURUUUUU,1uRUULLUUR,1pDDLLLLLLUUUUU,09RDRRRDRRD,08DDDDDDDD',
      '20URUUUU,0vRD,14DR,0uDDDRRRUUU,06LLLLLL,1hUUUUU,28UULUUUULLLL,21RRRRRRU,1xLLLLUUUUUL,1iUUUUURRRRRRRU',
      '09RR,08LLL,1xUUUUL,13ULLLD,1sLUUR,1tUL,11RDRDDRRUUU,0iRRRUULLL,1yUUUUULLLDDDD,20RRRRRRRRUUUUUUULLLLU',
      '00RRRRR,09RRRR,20RRRR,0gDL,16DDD,0iRDDDD,0uDDRD,1lDR,1yUUUULLUURUR,0rDDDDRRUUUUURRDDRDDDDRRRUUUUUUUU',
      '25LUUU,14LLDLD,1cDLDL,11LU,0sUL,1uDLLLUUU,1yULUUUULLL,0fLLLLLL,0kDRRRDDDDRDRRUUUUUUUU,00RRRRRRRDDDDD',
      '00DDDDDD,20URUUUU,1vRRU,0zLLLL,0eRRR,26RUUULLDL,08LLLLDDRRRR,25LLUUUUUUUL,28UUUULLLLD,03LLDDRDDDDDDL',
      '00DDDD,1zLL,01DRD,02RRDD,0cDDLD,1lRURURUUUL,1kURURURU,0gDDDDLDLDLLLLU,28LLLLLLLLUUURUUU,1pRUUUUUULLL',
      '0hLLL,20RRRRRR,1kLLUUUR,1vRURU,1xRDR,14LDLL,1hUULLLLLUULL,08LLLLDDRRRR,11RUULLUURRR,1zULUULLDLDLDLLL',
      '08DDDDDD,28ULUUU,25LLLLU,1dULU,0vUL,0cRRU,06DDLDDDDDLLLULUUUUUU,27LUUUUURUUU,04LLDDDDDRDR,00DDDDDDDD',
      '00DDDDDD,20URU,21RUURUR,24RU,0uURRR,0vRR,23URURUULLLUUURRRR,26RRUULU,0gDDDLDDDR,1bLUUUUURRRRRRRDDDDD',
      '08LLLL,0rDRR,0yDRD,20UUURR,21UUR,1yLULUUL,1lDLD,23RRU,1vUULUULLULUURRRDRRRRR,0zULLLLLLUL,0vRRDDRDRDDLL',
      '00RRRRRR,28LL,1zLLLDL,1hLLLL,08LDLLLL,0hDLLLL,0zDLLL,0jDRDDDDL,11DD,0yLLLDLDDRRRRR,1vLDLLLUUUUUUURRDRD',
      '07DDDDD,1pLUUU,1yLDLLUL,1wUUULULL,06DLLDLL,0wUR,1dDLLDL,1jURRU,12LUUURR,08DDDDDDDDL,05LLLLLDDDDDDDDRRR',
      '28UUU,20UU,00DD,0bDDLLDDR,11RDDLDD,0yUULLL,0cDRRRDD,1nLLU,1dUL,1uRRRUULUULL,1tDRRRRRUUUURUUUULLLLLLLDD'
    ],
    10: [
      '0bDRD,0eDDDD,1hDRRRU,1jURURU,1fUULUUURRRRRD,0zURURRDDDDDDDLLLLL,06RRRDDDDDDDDDLLLLLLLLLUUUUU,0cRDDDLDDLDD,1bDDDLLLLLD',
      '24UUUU,0lURRDDDD,0mDDDDR,09DDDDDDDDD,0qLDDDDDLLLD,2bRRDRRRUUU,1sUUUUURRRDDDDDDDL,14DDDDDRRRR,29UUUUULUUURRRRRRRRDDDDD',
      '0lURRR,0mDRRRDD,0sLD,1kUUU,20UUURRDDRRRUU,09DLLLLDLL,1hDDRRRRRUUUURU,08LLLLLLLLDDDRDDDDDRRRRRRRRUUUU,2rLLLLLLLLLUUUUU',
      '1oRRR,1kLU,1aUULLL,29RRRRRRRRUUU,0rDDDDLLLULLLLU,0uRDRRRUR,12UULLLULLL,0aDRRDR,00RDRRR,2rLLLLLLLLLUURRRRRRRRUUURUUUULLL',
      '0mDRR,1dUUUULLLL,10DRDDRD,17DDDR,2qULU,2dRUUUL,2lLLUUUUUUUURRDRRDDLDDRD,0hRDDDDRDDDD,11ULULLULLLLDDDDDDDDD,16DDDDRRDRRR',
      '26UL,09DLD,1bLUUUU,0eDDL,25LLLLLUUUUUUL,0nUURRDDDDDL,02LLDDRDDDDDDRRRRRRRRD,2qLLLLLLLLUUUUUU,08LDDDRDDLLDLLLUUR,27UUUUU',
      '2rLLLLLL,1mLDL,0iDLDD,0hLDDDD,1qRRRUU,0dLDD,0pDLDDLLLDDD,0fLDLDDLLUUU,13UUULLLLLLLLLDDDDDDDDDRRUURRRRRRU,2bRRRRRRUUUULU',
      '2rLLL,0bDDDDDD,1wRUUL,0iLLLLLLDDDDDDR,0sLLDLD,24LLDLLLLD,2hLLLLDLLLL,1aRURRUUULLLLLLLLLDDDDDDD,1mLLLLUUUR,0nDDDDRRRRDRR',
      '1oUUUUUURR,0iDLDD,29RRR,24ULUURU,1iUULUL,06LDLD,1sLUULULUURRUR,1kRDDDLLULLLUULU,0zURURURRDDDDDDDDD,12DDDDDDLLLLLLLLUURU',
      '2rUUUUUU,09DDL,05LLLLL,25DL,0wLDDDDRRRURURRU,1rLUURUULL,08DLDLDDLLDL,11RDDDLLDLDLLLL,07LDLDDL,0oULLLLDDDDDDDDRRRRRRRRUU',
      '00DDDD,1pRUU,1jURUR,0dDR,0iLDLLDLDDDL,0eRRURRRDDLDDLDLDL,1hUULUUURRR,2hDLLLLLLLLL,13DDLDLDLLLLLLLUURUUUUU,1xDLDLLLLLLLL',
      '2rLLL,0cRRRRR,0mRR,1mDLLL,10DL,0xLDDDDDRR,1sURRRUU,13UUULLLLLLLLDDDDDDDD,26LLLLLUUURURURRRU,12DRDDDDLLLLDLLLLLUUUUUUUUU',
      '2rUUUUUU,00RRRDRR,0iLLDLLL,0vURU,1lLLL,2aRRR,04RRRRRDDLD,2fLULLLLLDDR,1wUULLLLLDLLLDDDD,0bLDDDRRURRRRRU,2lRRRRRUULULLLLLL',
      '01RRRRR,0iDL,0lDDDDDR,12DLDDD,0zLL,21ULU,1hRRD,29RRRRRRRUUU,1sDRRUUULLLLU,0bRDRRRRDR,0dRRRRURRDDDDDDDDDLLLLLLLLLUUUUUUUUU',
      '09DLLLLD,0mRRDRD,1hDLDDR,21RURRD,2nRURU,17RDRRUURR,1mRDDDDLL,0xLDDLDDD,0uUUURRR,08LLLLDLLLDDDLDDDDDRRRRURU,2gUULUURRUULLL',
      '2rLL,2hLLULUU,0lRUR,19DLLD,27LULUULU,23DLLLLUUUUULUUR,1gDDRRUR,0wDRRURURRD,1dUUUULLLLLLLLL,1xULUUUULLLLDLD,2eDLLLLLLUUUUU',
      '0iDDDDDD,0hDDDDD,2pLULU,2aUR,2bRUUR,0cDRRDDL,1gUUR,2qULULUUUUUU,00DDDDDDDDD,0dRRDDDDLLDL,2nLLLLUUUUUUUUURRRRRRRRDDDDDDDDD',
      '09LLLL,0nRDRRR,2eLL,20URU,1gUUR,17RDR,1bRUULLL,19RDRRDDDD,0dLDLDDDDDDRRURURRR,0bLDDDDDDDDRRRRRRRUULL,2rUUUUUUUULLLLLULLLL',
      '1nUU,0aRRRR,16DDD,1vUULLLLD,1wDLLU,1kLDDL,00RRRRRDRRR,2gLLLLLUURU,1xDDDLLLLLLLLLUUUUUUURRDRRRRRRDD,0vDDDDDR,06RRRDDLLLLLL',
      '2iUU,2aURUR,2bRURU,18RUUR,2gLUUUU,1aURUUL,0iDDDDDD,2dRUUULLLUU,0mDDDDLLUUUUUURRRR,1fUUUURRDRD,1zDDRRRRRRRRUUUUUUUUULLLLDL',
      '06LLLLLD,2fLULL,0iDDDDD,0rLDD,0pLLLDD,1qURUU,0zLDDDRR,19DR,0uDDDDDRRRRR,1rDLLUUUUULUU,2iRRRRRRRRUULUUUU,2rUUUUUUUUULLDLLLLL',
      '2rUU,1mUUUU,2fLLLLL,25LL,1vLLUUL,15RRUR,1kRUUUU,0kURRRRRRDDD,0wURRRD,1gLLUURU,1iDDLLLD,1hDLLLDDDRRRRRRRRUUURUUUUUULLLLLLLLL',
      '2rLLL,0uUUURRR,2aUU,16RR,1tRRRUU,0nRRURURRD,0hDLDDDR,0sRUU,2cLUUULLDDD,1bURRDDDD,05LDLLDDRRRDDLDDRRRRDR,2fLLDLLLLLUUUUURUUU',
      '09LL,0bRRRRD,2jRUUUUU,0wRDDDDD,0sDDLLLL,25DDLLU,23RD,1yUUUUUUURR,2qUUUULLLL,03RRRDDDLLULLLDDDDDDLD,11UURRDDDDDDDD,1vLLLDDDL',
      '09DDDDD,26LD,08DLL,1bUUL,10DLLDDL,1hUUUR,0dRRDDL,1vULLDDL,0sDDDDRDDD,00DDDDDDDDDRRRRRRRRU,07LLLLLDDDDDDDRDRRRUU,01DDDDDDDDR',
      '2rUUU,2iRRR,06DD,20LLUU,23UL,0zLLD,0vUURRRU,28RRRUULLUULUUUURRR,07DDDLDLL,2dRUUULLLLUUURRRUU,08DDDDLDDDDDLLLUU,2qUUUURUUUUU',
      '2iUUUUU,09DDDDDD,2kUU,0qLL,0nDRRRD,1iDR,2mUURRDR,2dDRRRU,0bDRDDDDLDDD,2lUUUUURRDRDRDRRDD,0cRRRRRDDDD,1fUULUUURRRRRRRRDDDDDD',
      '01DDD,2gLLLDL,2kUURRU,0dDD,10RD,2cLD,2oRRRUU,09LLLLLLLDDDDDLLDDD,1uRURRUUUULLLLLDDDL,1kULUURRRDD,15LUUUU,1xLDLLLUULLDLLDDDL',
      '0iDLDDLL,0zLDDRR,1lDLLLL,2fUL,2eLUL,16UR,13UUULLLLLLLLL,20RDRDRRRRUUUU,2lLULUURURU,2rUUUUULU,2jLUUUUUUUURRRRRRR,10ULLLLLDDD',
      '09LLLL,2qUUUUU,0mDDDDDDR,2nRRU,0sDL,0rLU,0oDDRDR,1uLDDR,1iLDD,17UUULLDDDDDDD,0hRRDDDDDDDD,24RUUULULUULULLLLDDDDDDDDDRRRRUUU'
    ],
    11: [
      '0kDD,0jDD,21LLUUUL,1aDRDRDRRR,1nULUURRRDDDRR,2pLUURUULLUUULLLLULLDD,00DDDDDDDDDD,04RRRRRRDDDDDD,2sDRRRRRRRRR,2nLLLLULULUUURUU,2eRDDLLLLLLLLULU',
      '2jLLL,0jDLDDDD,1vUUUUR,1nRUUL,00RDRRRRRR,1cLDDRRRUUUU,1wUUURURR,2wRRRRRUUUU,32URRRRURRRRRUUUURUU,0aLLLLLLLL,0bDDDDDDRRRRRRRRUUUURUUR,3cLLLLLLLLL',
      '2rRUU,2pLLLLU,0oRRRRRR,1fLLL,19DR,1xDD,1rUULLLLLL,0mUURRRR,22LULLLLUL,2gUUUUURUURRRRURRRRRDDDDDDDDDLLLLL,3cLLLLLLLLLL,1vRDDDRRUUURRDRRRUUUUUULLL',
      '32RRR,2oUUU,2mRU,12DLDDLL,11UL,0nRDD,2bURUURURUULUL,0xUURRRRRDR,00RRRRRRDR,0yDLDDDDDRRRRDRRRRRRUUUUU,0uLDLDDLDDLLLLUURRUU,09RDDDDLDDDDDLLLLULLLL',
      '2zLLLL,2iLU,0pLDDDRD,1gDDDDL,1yURUUL,10DR,0yDDDRDRRRURUUU,0gRRRDDRDDDDDDDLLLLLLLLL,2gUUUUUUR,0vUULLLLLLLLL,3cUUUUUUUUUU,0bRRRRDRRRDDDDDLDLLLDLLL',
      '2sRRR,2oRRU,1aRUR,1yRURU,1qURRUR,1iDLLD,1vDDRRRRDR,15LLLDLDLD,0lLLLLLLLLLD,0wLLLLLLLLDLDDRDDRRRRDRDRRR,0aLLLLLLLLLLDDDDDDDDDDRRRRRRRRRR,24LDLLUL',
      '3cUUUUU,0zDD,1xLDDDR,2lRUU,2jRDRRRUURUUULUUL,28RUULUUUULL,2rRUUUUUUUR,03LLLDDDDDDDD,21ULUULUURRRDD,0aDDDDLDDDDDD,2aUUULUUUURRRRRDDD,2oDDLLLLLLLL',
      '0aLL,3cUULU,1fUL,1yDR,0oDRDRDRDRD,1aDRDDDDLLLUUR,30DLLLLLLLLL,2wRRRUUURUUUU,1pULULUL,2fUUUUUULLDDDDLDDDLLLD,0hLLLLLDDDDDRDDL,0rRRUULLLLLLLDDDDDD',
      '0mRDDDD,2iRRRD,0zDDDRD,2yLUUL,10DDRR,0bRRDRRDRRR,00RRRDRRRRRRDDDDDDDDD,1cRRDDLLD,1rDDDDDLLLLLLLLUUUUUUU,2vLLLUUR,3cUUUUUUUUUULLLLLL,2nUUUURUULLL',
      '3cUUUU,3bUUU,1hUUUUL,2mLU,27RRUU,1aRDD,37LLLLLUUUU,2yUULULUULUL,0nURRRRRDRDDRD,2sRRRRRDRRUUUURURUUUUU,1lDLDDRRR,21ULUULULLLDLD,1kLUUUUURRRRRRRDRDD',
      '02DDDDDD,0kLLLULL,0tRRDDDL,2oLL,29UUU,11RDRD,20LU,0qLDDDDDLD,2vRRRRRUULL,00RDDDDDDDDDRRURRUR,1gLDDRRRUUUUUULLL,15LLULULLU,2fDDDLLLLLLLLLLUUUUUUUUU',
      '03DDRDR,04DR,05RRR,1rDLLDL,2oUL,2sUURRD,01DDDDRDRR,0tDLDLLLULUUU,2nLLLUULLLU,0lDDDDLDDDDLLLLLLLU,0rRURRDD,1zURRURRUUUUR,00DDDDDDDDDDRRRRRRRRRRUUUU',
      '0cDDD,2yRRRU,2pUR,2wULUURRU,1bDR,1wRD,27DR,12LD,2xURRUURRUUUUUU,2aRRUURRUUUUU,1oURUULLLDLDDLDDDDRRR,1fUUULLLLLD,1gUUUULLLLLLLLDDDDDDDDDDRRRRRRRRRR',
      '0aLLLLLL,0dDDDDD,0pRRR,0vLLDLDLL,2vRRR,2pUL,1hDDLLD,2bULU,1pRR,2aDRRRDRRUUUUUULLDL,1xDLDDDLLUUUUUUUUUU,0wULLLLLLLULLDDDDDDDDD,3cLLLLLLLUURUUULUURR',
      '30UUUUU,26RURU,11DDD,2kRRRUU,00DRR,01RRDRR,04RRRRRD,0vLULLD,0oLLDDD,19URRURRDRRU,2bUURRDDDDLLLLLL,16LDLLLDDDLLDLLD,0aDDDDDDDDDDLLLLLLLLLLUUUURURUR',
      '28URUUU,29RUU,2nLUUU,2cUU,1aLUU,0oUL,0gRRDR,0rRDRRRUUL,1uDDDDRRRRRRRRUUUUUULLLU,1bDLDDDRRRDRR,3cLUUUUUU,0eULLLDDDDDRDDDDRRR,0zRURUURRRRRRDDDDDDDDD',
      '3cUUUU,2zLL,2cLL,1hUUULLL,0uLL,2hURRRUR,0qDLLDD,06RRRRDDDDDLDDDDDLLLLL,1rUULLLUUULLLLL,0dLLDDDDDDDDRRURR,1cLDDLLUUUURRUR,32RRRURRURRRUULLU,1qULLDL',
      '2jUU,1qDR,0fDDDR,1hUUU,0sUR,20DRRRUULUU,06RRRRDDDDDDDDLLLLLLUUULUUUU,2aUURURUURU,13LUUULLLLLDDD,36RRRRRR,1kDDDDDRRURRRRRRR,32UUUUUURUUU,0dDDDDDDDD',
      '00RRRR,08DDL,0hDLLLLL,25RRRU,2dLLLD,1kUR,1oLDDDLLLLD,32RURRRRRURR,1zRUULLLULL,0iULLDLLLLLDDDDDRRUR,34RRRRRRRRUUUUULL,11RRRRRUUU,2yRRUUULLUURRRUUUU',
      '32URRR,2gRRR,25RUUUR,1wURUULLU,29DDRR,30ULUUU,2zLULLUU,20ULUU,0uLLLULL,0hRRRDDLLLD,24UUUUUULLLLLLLLLL,2bRUUURRDDDRDDDLLLLLLLLL,1uUUUUURRDRRDDDDLDL'
    ],
    12: [
      '01DDDDD,0rURRR,1aLD,1mDDLLLU,1xLULLD,0lLLDLLLDDDDDR,0zDDDDDDLLLLLLLL,0bLLLLLLLLLDDDRDDDDLDDRRRRRRRRR,3zLLLLLLLLLLLUUUUUUUUUUU,1eDDLDDDDRRRRRRRRRR,2mLLLLULUUURRRURRUR',
      '0oRR,14RRRRRRDD,1cRDDDDDD,1lLDDDRD,35UUU,3gUUUU,3iLDLLLLLUUUUUU,0cRRRRRRRRRRRU,39LULUUUULLLLLDDDDDD,0aLLLLLLLLLL,10RRRURRRRRRRRDDDDDDDDDLLLLL,3fUUUUURRRDDDDRDRRRUUUULU',
      '0bDDDDDD,1vUUULLLL,3vLULLUL,3lULLD,2tLLUU,2gUUL,3tLLLLUUUUUUUU,0pRDRRRRDDDDDDL,3zUUUULUUUUUUULLLLLLLLLLDDDDDDDDDDD,2hUUULLLDDDDDDR,0dRRRRRRRRDDDDDDL,0wDDDDLDDRRRDDDLLU',
      '0yDDDD,19LDDD,37ULUL,34LULULU,2fULUL,1rRR,0mLDLLLLLLLLDLDDDDDDDD,2pDRDRRRRRRURR,1dRRRRRDDLLDDRDR,3dDRRRRRRRRRR,0kLLLLLLLLD,00RRRRRRRRRRRDDDDDDDLLUUU,12RRRRRDDDDRDRRRDDLL',
      '2dUUUUURRRR,12RDRDRRRD,22DRDDL,1hRRRDDRR,2jLUL,1nULULLDL,19DR,0vLDLL,2mLLDLLLU,0dRRRRRRRRRRD,1eDRDRDDDRRRRRURRUUULL,3aRDDLLLLLLLLLLLUUUUUUUUUUURRRRRRRRRRR,3mLLLLLLLLLUUR',
      '38RUU,32UUUUUU,0hRRD,0uDRRUR,19DDDLDD,1kDLDL,2iLUUR,1jLLUULUL,00DDDDDDDDDDDRRRRR,3bDDLLULLULLLLUUUUU,0eDRDRDDDDDRRRU,3wLLULLLLLUUUUUUUUUURRRRRRRRRRDDDDDDDD,0kRRDDDDDDDDD',
      '3oRU,0oRRRRRRRR,0yLDLLLL,33RRRRR,2fULU,21UURRD,2pLUUUUURRRRDRR,1lLDDLLLDDRRRRD,1aDDLDDLLL,0mLLLLLLLLLL,2dRDRRUUURRRU,3cURRDRRRRRRRRUUUU,3qRRRRRRRRRUUUUUUUUUUULLLLLLLLLLL',
      '3mLLLLLLL,2kLLLU,30RURRRU,2oUR,0rLLUL,0oDR,2fLULLUURRURRU,1kUULLLULLLULL,2tRRRRUULLLULLDL,1iRDRRUUU,3cRRURRRRRRRRUUUUUUUULLLL,17LLDLLDLL,3oRRRRRRRRRRRUUUUUUUUUUULLLLLLLL',
      '0bLLLLL,1yURUU,0nLDDLDDD,2wLLLLL,2qURRRRRU,0xULLLLUL,0gLULLL,0eLLDDDDR,0wDLLLLD,1sRUR,12RDDDRRRURUR,3dRRRRRRRRRUUUURU,20DDDDDRRRRRRRRRRRUUUU,0vLLLLLLDDRDDLDDDRRRRRRRRUULUU',
      '3oRRRRRR,3zULL,0yDDDDDD,19LLLLLLL,1lLLLLLLLD,2xUUULLLL,2eURU,2fRR,1sDRRD,2jUR,3yLLLULLLLLLL,2kDLLLLLLLUUUUUURRRRRRRRUR,0kLLLLLLLLDDDDDDDDRRRRRRR,00RRRRRRRRRRRDDDDDDDDDLLLD',
      '0bDL,3hRRRRRUU,2wULULLD,2iDL,1tURR,1uRRUR,28RURUUL,0vULLLLLLDDDDDDD,3rLLUURUUUUUUU,15LDDDDDDRRRU,0kRDRRDDDDLDLDDL,33UUUUUUURRRDRRU,2nDDDDLLLLLLLULL,3oUUUUUUUUUUURRRRRRRRRR',
      '3oUUUUUU,1mLUULLULLD,3lLUULLL,39UUUU,0uDRRDDD,14UU,26RU,3iLLLLUUUUUUUU,11UUURRRRRRRDRRDD,1jLDLDDRRR,0eRDDDDDDDD,3zUUUUUUUUUUULL,15DLDDDDDRRRDDRRRUUUUUU,3uLLLLLUUUUUUULUUUU',
      '3zLLLLLL,0bLLLLLLL,3dUUURUUUU,0eDRRRRRR,1gDD,2sDLD,1iDRDD,1jRRDDDD,2rLDDDRRUR,37RRRUUUUUUUR,1wDDDLLUULUU,0nLLDDLLLLLLDDDDRRDDRDRRRRRUUUUUUU,0kLLLLLULLDDDDDD,3pLUUUUUUUUUUU',
      '3zLLLLLLL,3nLLLLLL,3oRRRURUR,0bLDDDDDD,2kULLLLDL,31URUUR,1fUR,17RUUL,1sRRRRRDDRD,08RDDDDLLLUUR,38LLULLLDLDLLUUUUUUUUUURRRRR,0nDDDDDDDDLLULLULL,1gRUULLLDDDR,07LDLLLLLDDDDDD',
      '0bLLLLL,3zUUUUUUU,0oRRRDRR,1dDRRRR,31RUU,24RD,2gDRRUUUR,2kDDDL,3cUURUURRDDDRR,0mRDDLDDDDDDDD,3qRRRRRRRUUUUUUUUL,0wLDDRDDLDDDLDLLLLLDL,2cUUUURRDRRRRUULLULLLL,0yLULLLLULLLLL',
      '0dDDDLDDR,2xUUUUU,0kLLLLLLD,2qRURURU,2sRURUUR,12RU,27DDL,1iRUULLLD,1yDDDDLDLLLLLLLL,1sLDLDLDDRRRRRRRUUUUUUURU,3mDLLLLLLLLLLUUUU,0mDDDRDDDDDDD,10UUURRRRRRRRRRRDDD,16LDLLLDL',
      '0mDDD,3yRUUU,2bLULUUU,39LLLULL,2vRRUULUU,2kLLLLU,27LLULUURR,1hRDR,1jURU,0rURRR,1eDDDDDDRRRRRR,2nLDDDLDLLLLLLLLLUUUUUUUUUUURRRRRRRR,3dUUUUUUUUU,35LLUUUUUULUU,0sRRRURRURRDDDDD',
      '0bDD,0aDDDR,1nLDLDLL,1zDLDLDL,2yRU,0kLLLLLDDD,0sRRRRRDDL,1wLULLDD,2kLDLLLLLLU,3zLULLLLLLLLLL,3xLLLLLLLLL,2fUULUUUUURRRRRRRD,1uDDLLUUUURRRR,3nULLLLLLLLLLLUUUUUUUU,2eULUUUUUUL',
      '3oRURRRRR,2oUUUUUUUU,2pUUUUUUUU,3mUUU,38ULLLLLLU,1zULULLL,15RURRRRU,0lLULLLLD,0jLLD,09RRDDD,03DDRDDRRRRRDR,3cURRRRRRRDRRUU,3qRRRRRRRRRUUUUULLDLLLLLL,1wLLLLLUU,28LLLLLLUUUUUU',
      '00RRRRRR,3cDRRR,3dRRRDRR,0zDLDLD,1nDLDLLUU,3jDR,39RD,1eRRRRDDL,1tLDLD,1rLDD,0nLDLDLLDDDDLLLDLLLU,16LLLLLDDD,0bLLDLDLLLLLLL,08LDLLLLLLLDDDDDDDDRRRRRURRRURRRU,2xRRDDDLLULULLDL',
      '3oRRR,01DDDDD,2eDDDR,3mLLLLL,0bLDDDDDD,0eURRRRRR,2vLUUULUL,0tRRRRDDDDDRD,3dLUUUUUUUUUU,2hULULUU,23DDDRDDRRRRRRRU,0sDRRDRDDD,0nDDDDDDDDLLLLLLULU,17RDDDDDR,31UUURUUUURURRRRRRU',
      '3zUUUUU,3oUUUUUUU,3yUUUUULU,0bLLLLLL,1yRUUUL,0pUR,0fDLDDRD,13RURRRRRD,1aDLLULLLD,1gDRDDR,33UUUR,2gDDRRR,2tRRUULU,1iRDRDDDDDLLLLLLUUUUU,0nLLLLLLLULLLLDDDRDDDDDDDDRRRRRRRRUUUU',
      '3zLLLLLLLL,0lLLL,31URRRRRRR,2xULL,0xLLL,1pRRRRRRR,15UULLLDD,0sDDRRUR,1jRUR,0bLLLLLLLLL,3fRRRRRRRRUUUUUUUU,0nLDDDDDDDDLLLLLLLLDDLL,3dLUUURRRRRRURRRUU,00RDDDDRRUU,0cDDDDDRRRRR',
      '3pUUUU,3qUUUUUL,11RRRRDDL,3zLLLLLLU,3nLLLLLU,2lULLU,1kLU,00DDDDRRRR,1uUUURRDRDDL,2hDDLDD,3oUUUUUURRRDD,2yUUUUUUUULLLLLLDLL,0bDDDDDDDDDLLULUL,38LULUULLDDLDDD,03LLDDRRRRURRRRD',
      '00RRRRRRRR,3zUUUUUUUUU,0bLLDLLLL,0cRRRRDRR,0oRRR,3yUUUUUUUU,3dUUUULUUR,1sRDDRRRUU,27UUR,2tDRR,1eDL,2fDDDDRRRRRRUUUUUUUUL,26UULLLDDLDDDDDLLUUUU,0nLDLLLDLLLLLLL,2uRRDDLLLLUUUU',
      '06RRRRR,0lRRD,3lLLLULLL,2wURU,1xLDLDLLL,0vDLDLDLLU,1gUL,15UR,3vRRRUUUUU,0sLLDDDDDLDDDRRRR,0xRDRDDDDDDDD,2fURRRURUR,3uLLLLLLUUUUUUUUUUURRRRRDRRRDDRDRD,21UUUUURRR,32URRRRRDRRU',
      '3oRRR,2iRDRRRRU,2kRR,0bLDDDDD,22LLUUU,1eRUUULL,1kLLLUU,0vDL,2oRRRRUUUUUUUR,3zLLLLLLLULLLL,30RRRRRDRRRRRR,0pLUURRRRRRRRRDD,3bLLLLLULUURRRRRRUUUUU,0qDLDDRRDDLLL,0uURRDDRDDLLLL',
      '0bLDLLLLL,0nDLLLLLL,1lDDDDDD,3cDRRRRRU,1kDDDDDDL,1tDDLDLDD,0pDDDDR,2pRDD,12DD,1jDLDDDLDLD,00RRRRRRRRR,1mDDDDDDDLLLLUURUUU,1rUUULULLDDDDDDDDRD,2dRRURUURR,0fRDDRRRRRRRDDDDDDDD',
      '0bDDD,3mLLLUL,0kDDLD,0jDLLLLDD,38RURUUUL,2lUL,2wULLU,2vLLDLLU,2sULUURUR,24RD,14RRDDL,3aRDDLLLLLULLLLLUUUU,0aDDDDRDDDD,0dDDDDRDDDD,05LLLLLDDDDDDDDDDDRRRRR,1eUUURRRRURRRDDDDLDLD',
      '0cRRDRRR,0uDLLL,3oUUUUUU,0xLDD,19DDLLL,2lDDRD,3lLUUU,3hLULLD,35ULLLUUU,2hLU,0kRRDDDDDLLLDDD,11RDRRRRRUUULLLLULLL,0pLDDRDDDDDDDRRU,04RRRRRRRDDDDDDD,2mDRDDDLLLLLLL,3jLUUUULULLDD',
      '0vRUR,1aDDDDDD,3oUURRRDDL,3yULUUU,3xLLLLL,2eRUUU,3pUR,1wLDDRD,2vLUUU,34DRRR,06LLLLLLDDDDDDDD,2rLLUUUUUUURRRR,22UUURRRRRRRURU,28RUULLLLDDD,1gDDDDRDRRRD,0qRRRRURURRRRDDDDDDDDDDD',
      '3oUUUUUU,0aDDDLDD,09DDLD,08DLDDLDL,07LLLLLLL,1jRDDRD,2kLUULLLU,22URUURRU,0uULLDLL,1eULU,26LLLDDD,2tDRR,2xRUUUURUUUU,3aLLULLULLDD,2pDDDRRRRRRRRRR,1zDDDDDLLLLLLLLLUUULUUULUUURRR',
      '0bDDDDDD,3zLLLLLL,0cRR,0oRRDRDDL,1eLUL,1cDRDRRD,20DRRDD,0rURR,1sRUURRU,3hRUURRUU,2xRD,39LL,1gUURRURRRDDD,3jRRRRUUULLUULLDDLLDDLDDLLLLUUU,0wDDLLDDLLDDLDDLLUU,00RRRRRRRRRRDDDDDD',
      '1zDDDD,0dDDD,2dDDDDRRR,0iRRRRDDLD,0xLLL,13URRDRR,18DLLLLU,3lUU,2uLLUUUR,28LDLLU,1oUUUUURRRR,37URURUULLLD,22RDDDRRRDRRU,3oUUUUURURR,3zULUUUUUURUUUULLLLLLDLLLDDDR,3yLLLLLULLLUUU',
      '3zLLLLLLLL,2pUUUURUU,11LUUURR,0pURRURRR,0tDLDDDDD,2tUUUUR,0mRDDD,19LDDLLDDD,2vRURRRUULL,2jURRR,1lRUULUL,3aLLLLLLLLUUUU,1jULUULLDLDDDDDD,3dULUUUUU,0wLUURRRR,3cDRRURRRRRRRRRUULL',
      '01DDD,0mDDDDDD,0gDD,2yLUU,0tRRRD,1kLULLDLD,1vDLDDR,21RDRDD,2dDRDDR,03RRDRRRRDDDDLD,3zLLLLLLLLLLUU,2jRDDLLLUUUURU,3oUUUUUURRRUUUULU,06RRRRRDDDDDDDDDLL,00DDDDRRUU,3nLLLLLLLUUUUL',
      '0dRDRRUU,1dDDD,0bLLLLL,13RD,1qDRDRD,2eDLD,2rDL,19LLL,3kUUUUU,3jUUU,0fULLLDDDDDDDDDDD,3mUUUUUUUULLLLLDD,0pDRDRDRD,3pURRRRRUUUURU,34RUUUURURRRDDDDDD,3qRRRRRRRRRUUUUUUUUUULLLLLLU',
      '00DDDDD,2dDDDR,12UUU,1aUU,0xDLDL,04DDD,2xLLL,1xLDLL,06LDDDDLD,2gLLUUULUUUU,1vLUUUURUR,2qRRRURRRRU,1lRDDDDDLLLLLLLL,1tDLLUUUUUU,3zLLLLLLL,1pDLDDDDDRRRURRRRRRRRUUUUUUUUUULLDLDLD',
      '0bDDLDDDD,09LDDLL,0iLDLL,0gLLLLDDDD,0pDDDDLD,3oUUURRDD,31DDRRR,3fUUU,3jLUUU,00RRRRRRRD,3vLLULUUUUL,2dRUUURRRRRRRDDDRDDDL,1bDDDDDDDDLLLUURU,0qDRRRRRRRUURU,1rRRRRRDDDLD,2jULLDDD',
      '3yUU,3xUUU,0pRRRRRRR,2nULU,1zUUULLDLL,1aDLDL,1uDLDDL,1hDLDDLDD,1gLDD,3fRURRUU,3uRRUUU,2kLDDDLLDLLLUUUUUUU,1vDRRDRDRDDD,00RRRRRRRRRRR,1kLLULLLLLDDDDDDDD,0nLLLLLLLLLLLDDDDDDDDDD'
    ],
    13: [
      '1wRR,2sLDLLLLLU,2eLDLLL,08LLLLLLLLDDD,4eLLUUUUUUUURURRRRRRRRRRU,1vURRRRRRRRR,35DLLLLLLLUUURRRRURRRDR,0fRRRRRRRURRR,37DDDLLLLLLL,1uDDDDDRRRRRRRRRUUURUUL,0nDLLLLLLLLLU,0oRDDDDDDDDDDDLLLLLLLLLULL',
      '4cRRR,3rDRRRRR,2oLUUURR,2bUR,30LUUUUURRRRDDDLD,2hLDDLLUL,39DRRRRURRDRRRRRD,2wUUUUUUUURRRRRRRRRRRRDDDDDDDLDDLLLLULL,0zRDDLLDD,3zRRRRDRRRRRRRRUUUU,3aUUUUUUUURRRRRRRRRRDDDDLLDD,3cLUUUUUUURRRRRRDR',
      '49UULUUU,3oUUURUUU,3dRUUUURR,4lLULUULUU,33UUL,3sLLLUURUUUURRRR,23DDDRDDD,0eRRRRRRRRRRRDDDDD,1uUUURRRRRRRRRRDDDDDRDDDDDLL,45LLLLLUUUUURUUURRRRRRR,48ULUUUUURURU,0cLLLLLLLLLLLLDDDDDDDDDDDDRRRRRRR',
      '42RUU,2hDDDD,4mLUULULU,3tDRD,20RDRDDDRDDRD,2bDRDDDDDR,0tDRRRRRRDD,40UURUULLUUUUUUU,1oLLLLLDDDDDDLD,36UUUUUULLLLLLULLDDDDDL,2xLDDDDRRRRRUUUULUUURRDRDRD,0iRRRRRRDDDDRDDDDDDD,1sUUUULLLLLLLLLLLDDDDD',
      '40RRRRRRU,3sLLLU,0oLLLLL,2pRRR,1eDL,2uLULLLLL,16LDDDD,21LLLLD,37RUUUUUUUULLLLLLLLLLLL,3lDDDLLL,2hULLULLLLLLDDDRRDRRRRD,3oLUUUUUUUURRRDRRRRRRUR,3bURRDRRRRDRR,36DRDDLLLDLLLLLLLLUUUUUUUUUUURRRRRDRRRR',
      '0cDDDDDDD,0nLLLLLL,0sDDDDD,34UU,1mLL,2pUULLDDD,3jLLLULLUU,3bURUUUUURRRRD,4oLLULLLLLLLLL,2hDDRDDDL,3kDLLLLLULLL,1cLDDLDD,3rLLLLUUUUUUUUURRDRRRRRRRDDLDDDDR,4lLLLLLLLLLUUUUUUUUUUUURRRRRRRRRRRDDDDDLDD',
      '4nUUUUUU,4cRRRRR,3zRRU,14DDDDDD,49LLLULLL,15DRRRRRRRR,2nRDRDRRD,3vUUUL,2pRDR,0oLLLLLLLLLLL,3eLULUURRRRRRRDDDD,00RRRRRRRRRRRRDDLLLLLLLLLLLLDDDDDDDDR,4mLLLLULLLUULUUUURRRRRRRRRU,16RRRRRRRRRDDDDDDDDD',
      '00RDDDDDD,0gDDDDD,11LDLDDDD,0zLDDDD,2yDRRRRRR,3iULUL,33LUL,2nURRRUUU,0jLDDD,0aLLLLLLLLDDDDDD,0cLDLLLLDLDDDLLUUUU,1sDLDDDDDDLLLLLLLLLLLUUUUUUUUUU,4cRRRRRRRRRRRRUUUUUU,31LLULLDDDRRRRRRRRRUUUUUURURUU',
      '00DDDDDDD,4bLLLLLLL,41URUUUUU,17RR,3eUUUU,2tURUU,23UURU,10LLLDDDDDD,1bRDDDDDRRU,3dUUUUURRDDDDDR,3yLLLLLLLLDLDLLUUURUUUUURUURRR,4cUUUURUUUUUUUURRRRRRRRR,1oDDDDDRRRRUUUUUUUUU,4gRRRRRRRR,15UURRRRRRRRRU',
      '0mLLL,16DR,2aDDDR,3hLLULUU,34LUL,2rUUL,1zDR,3qRRRRDRR,0zLLLLLLLDDDDDDDDD,0bDDDDDDDDD,17RRRRRDDDDDDDRRDR,0cDDDDDDDDDD,04LLLLDDDDDDDDDDDDRRRRRR,4oLLLLLULLLLUUUUUURRURRR,3jUUUUUUUUULLLLLDLLLLDDDDDDDDDD',
      '2nURRR,0mLLLLLDD,0nDLL,1dDLLLL,1cLLULL,19LDL,03RRRRRRRRDDDDD,4oLLLLLLLLLLLLUUUUUUUUUUU,2vDDDLLLLLLL,23LLLLLLLUUUULU,4bLLLLLLLLULLUUUUUUUU,00RDDDDDDDDDDDRR,29DDDRRRURRRR,2sRRDDLLLL,0cDDDDDDLLLLDLLLDL',
      '00RR,0cLLLLLL,1eLLDLDLDLL,1rLDLDL,1nLDLLDDR,19RR,34LDLLLLU,4cUUUUUUUUUURRR,2iDLDDDDLLLLLLLLLD,4fRRRRRRRRRUUUU,30RRURRRDDLDLLLLLLUUURUU,0nLLLLLULLDLLL,1uUURRRUU,4dUUUUUURUURRRUURRRRRRUR,12DDDLDLDDDDL',
      '48LLU,18DRDRRU,0uDLDDDDDR,2dRDRRD,2qDRRDRR,3xRUULUUL,2fURRRDD,10LL,1bRD,07RRRRRDDDDL,1qURUULLL,1kDRDRDD,19ULULLLLDDDDDDDDDDRRRRRDRRRRRR,3oRRRRURRDRRDRR,0tLDDDDDDDRRRUULU,4hLLLLLUUUUUUUUUUUURRRRRRDRDDD',
      '00RRRRRDR,10LLD,0qRRRDR,3vLLL,20DDRDDLL,33LUUUUL,3dLULLU,2aLULL,2mLUL,30URUULULLULL,06RRRRRRDDDDLDDD,1hLDDDDDRRDRRRUU,4aUUULUUULUU,25DDDDDDDLLLLLLLLLLLLUUR,0wRURRRRDDLD,40RRRRRRRRRUULUUULUULULLULULLLL',
      '0fDD,40RRR,28DDRD,0hDDDRDR,3fURR,2pURUR,2qRURUUL,1nURRRUU,0mDLLL,00DDDDDDDDD,1mULUURRR,1qDDDDDDLLDLLLUUUUULUL,3sRURRUU,0gDDDLDLDDDDRDRRUUULU,3nLDDRRRRRRRRRRRRUUUUUUUUUUUU,1hUUUURRRRRRRRRRDDDDDDDDDDDLL',
      '0kLLLLLL,4aLLLLL,3aRRU,1cLLLLLLLL,13DR,2sUUULLLLL,1yLLU,1iDLL,2rUULLD,26RD,3kUUUUUUUULLLULLLLLLLL,2xRUURRRDRRU,3hLLLLDLLLD,3xLUUUUUUUULLLLLLLLLLU,09RRRDDDDDDDDDDDDLLLLLLLLLLLLUUUUU,41RRRURRRRUULLLLLUL',
      '00RRRR,48UUUUU,26UURRR,18RRRD,3oUURURRD,30DL,3pRRURUR,3sRU,2qLULLLUL,2dUULL,1uDRD,13RRRRDDRR,0cDDDDDDDDDDDD,49UUUUUUUUUULLLLDLLLLLL,0xRRDDDLDDDDDDLLLLLLLUUU,2kLDDDDDRRRRRRRRRRRUUUUUUUUUUUULLLLLLDLLLLL',
      '4eUUUUUU,0tDD,0nDLLLLL,3uULLLLDDRR,3rRRD,2oRUR,2qRU,32RRRDDR,0mLLLLLDDRRRRRR,4gLUUUUUUULUUUURURRRRRRRRDDDD,31LUURURRRRDD,4dUUUUUUUUUUU,2iDDDDDDLLL,4hRRRURRRUULUUUUULLLLLLD,4cUUUUUUUUUUUURR,37UUURUUUUU',
      '0cDDDDD,2uDDDD,2lURUUUU,1cLLLLDD,30DDRR,22DDD,3vULUUUU,3uLUULU,20DD,4cUUUUUUUUUUUU,41UUULUUUUUUUURRRRRRRRRRDDDDDLDDDDDDLLL,0wRRRRDDLLLLDDLDDDR,0nLLLLLLLLDDDD,42UUUURUUUUUR,4hRRRRRRRUUUUUUL,45LLDLLLUUU',
      '00RRRRRRRR,15RRDR,0nRDDDLDDD,1dUL,1nDDDD,3sLUUUUUL,1iRDDRD,2zRDDDLLU,2mLDDRD,1uULUUURRRRRRR,3uLULUUUUUULULLLLD,0wRDRRDDDDDRD,44RRRRRR,1oDDDDDRDRRUUUUU,1vDLDDDDD,0yURURRRDDDDDDDDDDDDLLLLLLLLLLLLUUUUUUU',
      '0oDDDDDDD,26UUUUUR,3wUUUUU,43LLD,4dUUUURUUU,14URURRRRR,2fDDDDL,1xDDDDR,33ULUUU,4fRRURRRRRRUURUUUUUUUUULLL,00RRRRRRRRDRRDDDLDL,1cULLDLLDDDDDRD,0wLLDDLDDDDDLD,3yDDLLLLLL,3pRRRRURUUULUURU,0tDLDLDDDLDDDDD',
      '37UUUUUUU,0mDDDDLLD,2xRRRDRR,2qRUR,34RU,0fRDRRR,0xDLL,1uDDR,1xLUL,33DRRRUUUUUUUU,2aRUULULLULU,2oLLULU,31RUUUURRUUULLLLULLLLDDD,05RRRRRRRDDDDDDDDDLDLLLLLLLLULLLUUUUURU,3yDDLLLLLLLLLLLLUURR,40RRRRRRRRRR',
      '0eDDDDDDR,3hRRRRU,0tRRR,16RRRDRDR,37LUL,35LUULLU,2qDLLLUUU,2pLUUULLD,24LUULU,10ULLD,1rUUUULLLLL,2xDDDRRRRDRRRRRRR,0hLLDDDDDRDDLDDRRRRDRRRRRR,3cRRRRDRRRRR,4gLLLLUUUUUUUUUUUURRRRRDRRDDRDRDDRR,0cDDDDDDDL',
      '4cRRRR,3zRRRRRD,4oUUUU,3mRRRRR,4iUUR,0eRRRRR,2hUUL,23DLLULLL,2dLDLLLU,22ULLLLLL,08RRRRDDDDDDDLDDDDD,2xUUUUUURRRRRRRRRR,46DRRRUUUUULLL,47RUUULLLLLLLUUURRDR,1eLLLLLLLLLD,3uULLLLLLLLUUUUUUUUURRRRRRRDRRRR',
      '3kLLLLLLL,0bDDD,1rLUU,09LDDD,2tLLU,0vLDDDDDL,29UUU,22DR,44RRRRRRRUUUUUUUUUUU,4eRRRRRRRRRR,23RDDDLLLLLLLLDDLL,2jUUUUUUURRRRRRRDDDD,4cRURRRURRRRRRR,2cUUUUULLLLLDDDDDDDLDDD,18DDDDRRUURURUUURU,0tLDDDDDDDL'
    ],
    14: [
      '5dURUUUL,28DDLDL,2yLDDL,1tLLLLDDD,43RURRDRD,4kLU,24RR,4fLLLUURUUUUUULU,3gUUUUULULLLLLLLL,3eRUUUULULLLLLLDDDDDDDL,14ULLLLLLLLLLLDDDDDD,27DLLLDDLDDRDRR,5cULLLLLLLLLUUUURUUUU,5bLLLLLLLLLUUUUUUUUUUUUURRRRRRRRRRRRRDDDDDDDDDDDDDL',
      '4qUUUUUUU,0fDRR,4rUUU,4iLLULUUUUURU,43RRDR,3eLLLU,2lUUUULLL,4sDLLLLUUUUUUUUU,17LUUURRRRRDDDDLDDD,1cRDDDLDDDRRRRDRD,18DLDDDDDDDD,3tUUUUUUUULLLLLU,07RRRRRDDDDDDDDDDDDLLLLLL,1eDDDDRRUUUUU,0gRRDDLDDDDDRDDDRDDRRRRRRRRUUUUUUUUUUUUU',
      '00RRRRRRRRR,4zUUUUUUU,1tLLDLLLLD,2gRRRRUR,38DRR,39RRDRDR,3rUL,49UUUUUUUUUL,4nDDLLLLLLLLLLLLUUUUUUUUUURRRRURRRRRUURRR,30DDDDDLLLLLLLL,1gLLLLDLLLLDDDDDDDRRRRRRR,1hDLDDLDLLLLLLDDDRRRR,0eRRRRRRRRR,0pDRDDDDDDDDDD,0wLLLLDDDDDDDDDDD',
      '4wRRR,1vDDDDDDL,20RRRDRDDRD,3qURRD,36DRD,3yDRR,2kLD,0wRRRRRRRRRDDDDDDDDD,2lULLLULLLLU,3rDLLLULUULULL,1eRRRRDDDDDDD,0rLLLLLLLLLLLLDDDDDDDDDDDRRRRRRURRRRRDR,4gLULUULUL,0uRDRRRRDRRRDDDLL,5fLLLLLLLLLLLLLUUUUUUUUUUUUURRRRRRRRRRRRR',
      '5fLLL,4wLLLLLLUUU,2oDDDL,22DRDDDR,23RURRRD,26LDLDDRDR,2xRDRD,2kRDR,31DLD,1iUULLLLLLLULLLLL,0iLLLLDDDDDDDDDDDD,1pLLDDDRDDDRRRRRRRR,4mLLLLLLLLLUUULUUUUURRRRRRRRDD,2mRURRDDDDDDDLLLLDLLLLLLLLUUUUUUUUUUURRRRRRRRRRD,06RRRRRRRDDDDLL',
      '4kRU,1gLLLLLLL,4qRUR,27LLLLLLLDD,2yLLLLLDLDD,4hLLUL,4cLUUUUUUUUU,4mUULUUUUUUUULLLLLLLL,46UUUUUULLLLLLLLU,0dDDDDDDDDDDDDLLLLUUULL,00RRRRRRRRRRRRDDDDDDDD,52UUUUUUUUUUUURRDRRRRRRRR,4pDRRRRRRRRRRRR,3zURRRDRRDDLLLL,38RRRRRUULLLLLL',
      '00DDDDDDDDD,0dLLL,15LDDDDDDDD,3tUUUUUUU,0yRRR,38RRRR,1pRDRRR,1rRRR,5eLLLLLLLLLLLUU,4gRRRRDRRRD,12DLLLLLLDDRDRRRRRU,40URRRRRRUU,3dULLLLLU,1jDDDDDDDDLLULLLLLLDLLUUUUUUUUURRURRR,52UUURUUUUUUUUUURRRRRRRRDRRRR,4xLLLLLLLUUUUUUUUUUURR',
      '3xRUUUU,40UUU,3fLUUUURU,1tLLLLD,24RDDDD,42RRRRU,27LDDDD,2lDDD,0dLLLLLLLLLLLLDDDD,2iDDDLDDLLLLLUUU,48DDLLLLLDLLLLLLL,31UURUUULLDLLLLLLDDDRDD,00DDDDDDDRDD,0mLLLLLLDDDDLD,4oRRRRRRURRRRRUURUUURUUUUULLLLDLLLLLLDDDDDDDD,33DDDDDDLLLLL',
      '0dDDDDDDDDD,4zLUUUUU,4bURRRRRRR,3kUUUUUU,0uRDDDDDDDR,38UUU,1bRRRD,3nUUUURU,1rDRDDLD,2jLDDDRRU,50ULUUUUURUUUUUU,32DDDRDDDLLLLULLLLLL,1pLUURRRRRDDD,5aLLLLLLLLUUU,1uUUULLLLLLLLLDDDDDDDD,4pRURRRRRRRUUUUURURUUUUULLLLLLLLLLLDDDDDDDDD',
      '0dDDDDD,4oRRRR,4aRRRRRDR,1gULLLU,0kDLLL,2sDRRRRRRR,1oDDRRRRUULL,25LLU,0tRDRDDDD,1aRRRRRDDDDLLLLL,04LLLLDDDDDR,2cDDDDRRRRRRDRDRRRRUUUU,52RRRRRRRRRRRRUUUUUULUU,43RDRRUUUUUUURUUULLL,0fRRRRURRRRRRRDDDDDDRDDDDDDD,45ULLLLLLLLUUURUULU',
      '5fLLLLLLLLL,52UUUUUU,0fRRRRR,3gDDLLLLLL,3tLLLLLLDLD,29LUULUL,4dUURURRRR,30ULUULULLL,26DLLLLL,24LLLU,2sUUUURRDRRRD,1iUULLLLLDLLLLLLDDD,4fRRRRRRRRUUUUL,54UUUUURURRRRRRDRRUURUULUUL,51LLLLLLLLLLD,2pUUUUUULLLLLLLLLLLLLDDDDDDRDDDDDDD',
      '4uLLLLLLUUR,0jLLLLDDDDD,4iULLLLLD,4bRUULUURU,38RRRRRRD,19DRDDLD,2uRUUU,2wRRRRUUUUL,1dRDRD,1rDRDR,5fLLLLLLLLLLLLL,2jLUUULL,0pLLLLLDLLLLDDDR,3iUUUUUUUUURRRRRRRRRRRRDDDDDDDDDDDLLLUULLLLLLUL,4eRRRDRRRRRRUUUUUUUUUUUU,0zRRRRDDDDDDDDL',
      '4lUUUUUUURU,4kLULLLD,0aLDLDLLLLL,0uDRRRRRR,27DDD,3rLLLL,39RU,1mRRRRRRRUURURUR,2pDDDDDDDLLLL,46UUUUUUURURURU,41LUUURURRDD,08LLLLLLLLDDDDDDD,4fLLUUUUURURRRRDDD,21LDDDDDDDRRRRRUR,52UUUUURUUUUUUURRRRRR,3jDDDDRRRRRRRURRRRUUUUUUURUUU',
      '0qLDDDDL,50UUUUUULLL,0oLLLLLLLL,1dLDLDDL,1bLLL,17DRRRD,4aUUUUURRD,2rDRRRDDLLL,3lLL,2jDDLDLD,42RURURRDDDL,52RRRRRRRRRRRRRUUUUUUUUUU,4oRURRRRRRRURU,39URUURURUR,2uLUULLLUUUUURRRRRRRRRRRRRDDLDDD,4qRRRRRRRRRUUUUULLLUURURUULLLLLLLLLU'
    ]
  };

  const F_COL = ['#ff2d2d', '#16c447', '#2f6bff', '#ffe135', '#ff8f1f', '#25d9f0', '#ff3fd0', '#a3162c', '#b44bf2', '#f4f4f4', '#8d95a3', '#b8f02a', '#d4a86a', '#5a4ff0', '#12b8a0', '#ffa8e6'];
  const F_PACKS = [
    { name: 'Regular', sub: '5 x 5 · easy flows', size: 5, hue: 140 },
    { name: 'Regular', sub: '6 x 6 · a little more room', size: 6, hue: 170 },
    { name: 'Regular', sub: '7 x 7 · things get crowded', size: 7, hue: 200 },
    { name: 'Regular', sub: '8 x 8 · plan ahead', size: 8, hue: 225 },
    { name: 'Regular', sub: '9 x 9 · tangled paths', size: 9, hue: 255 },
    { name: 'Extreme', sub: '10 x 10 · for flow veterans', size: 10, hue: 285 },
    { name: 'Extreme', sub: '11 x 11 · no free cells', size: 11, hue: 315 },
    { name: 'Extreme', sub: '12 x 12 · serious business', size: 12, hue: 340 },
    { name: 'Mania', sub: '13 x 13 · huge boards', size: 13, hue: 10 },
    { name: 'Mania', sub: '14 x 14 · the full grid', size: 14, hue: 35 }
  ].map(p => ({ ...p, name: `${p.name} ${p.size}x${p.size}`, items: (F_DATA[p.size] || []) })).filter(p => p.items.length);
  const fCache = new Map();
  function fPuzzle(pi, li) {
    const key = pi * 1000 + li;
    if (fCache.has(key)) return fCache.get(key);
    const P = F_PACKS[pi], s = P.items[li], W = P.size, paths = [];
    s.split(',').forEach(t => {
      let c = parseInt(t.slice(0, 2), 36);
      const p = [c];
      for (const ch of t.slice(2)) { c += ch === 'U' ? -W : ch === 'D' ? W : ch === 'L' ? -1 : 1; p.push(c); }
      paths.push(p);
    });
    const res = { W, H: W, sol: paths, ends: paths.map(p => [p[0], p[p.length - 1]]) };
    fCache.set(key, res);
    return res;
  }
  function fThumb(pi, li, size) {
    const p = fPuzzle(pi, li), c = document.createElement('canvas'), W = p.W;
    c.width = c.height = size;
    const x = c.getContext('2d'), cs = size / W;
    x.fillStyle = '#0d0d16'; x.fillRect(0, 0, size, size);
    x.lineCap = 'round'; x.lineJoin = 'round';
    p.sol.forEach((path, k) => {
      x.strokeStyle = F_COL[k]; x.lineWidth = cs * .42; x.beginPath();
      path.forEach((i, j) => { const px = (i % W + .5) * cs, py = ((i / W | 0) + .5) * cs; j ? x.lineTo(px, py) : x.moveTo(px, py); });
      x.stroke();
      x.fillStyle = F_COL[k];
      p.ends[k].forEach(i => { x.beginPath(); x.arc((i % W + .5) * cs, ((i / W | 0) + .5) * cs, cs * .3, 0, 7); x.fill(); });
    });
    return c;
  }
  const FLOW_CSS = hubCss('flow-free', '#2f6bff', '#1f54d6') + `
.gm-flow-free .pk-art{background:#0d0d16!important}
.gm-flow-free .pk-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:6px}
.gm-flow-free .g-canvas{background:#0b0b12;border-radius:14px;box-shadow:0 22px 44px -24px rgba(10,10,40,.8),0 0 0 2px #1c1c2c}
.gm-flow-free .lb:has(.lb-t){background:#0d0d16}
.gm-flow-free .lb-t canvas{image-rendering:auto;opacity:.9}
`;
  Ameplay.register({
    id: 'flow-free',
    title: 'Flow Free',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' solved',
    width: 860,
    blurb: 'Connect matching colours with pipes and fill every square of the board. Pipes break when crossed.',
    help: 'Drag from a dot to draw a pipe · cross another pipe to break it · fill the whole board · <kbd>Z</kbd> undo · <kbd>H</kbd> hint · <kbd>R</kbd> restart · keyboard: arrows move, <kbd>Space</kbd> grabs and drops',
    icon: ICON('<circle cx="14" cy="14" r="6" fill="currentColor"/><circle cx="50" cy="50" r="6" fill="currentColor"/><circle cx="50" cy="14" r="6" fill="currentColor"/><circle cx="14" cy="50" r="6" fill="currentColor"/><path d="M14 20v14a10 10 0 0 0 10 10h20"/><path d="M50 20v6a8 8 0 0 1-8 8H30"/>'),
    tint: '#2f6bff',
    css: FLOW_CSS,
    mount(root, api) {
      const snd = makeSnd(api);
      const save = api.load() || {};
      save.done = save.done || {}; save.hints = save.hints == null ? 5 : save.hints; save.earn = save.earn || 0;
      const persist = () => api.save(save);
      const keyOf = (p, l) => p * 1000 + l;
      const solvedCount = () => Object.keys(save.done).length;
      const packDone = pi => { let d = 0; for (let i = 0; i < F_PACKS[pi].items.length; i++) if (save.done[keyOf(pi, i)]) d++; return d; };
      const nextOpen = () => { for (let p = 0; p < F_PACKS.length; p++) { if (p && packDone(p - 1) < 8) break; for (let i = 0; i < F_PACKS[p].items.length; i++) if (!save.done[keyOf(p, i)]) return [p, i]; } return [0, 0]; };
      const starsOf = d => d ? (d.perfect ? 3 : d.m <= d.f * 1.6 ? 2 : 1) : 0;
      const hub = makeHub(api, root, {
        title: 'Flow Free', blurb: 'Join every pair of dots with a pipe. Cover all the squares and do it in as few moves as you can.',
        packs: F_PACKS.map(p => ({ name: p.name, sub: p.sub, n: p.items.length, hue: p.hue })),
        packLock: pi => pi && packDone(pi - 1) < 8 ? `Solve 8 in ${F_PACKS[pi - 1].name}` : '',
        packArt: pi => `<img alt="" src="${fThumb(pi, 0, 160).toDataURL()}">`,
        thumb: (pi, li) => fThumb(pi, li, 120),
        info: (pi, li) => { const d = save.done[keyOf(pi, li)]; return { done: !!d, stars: starsOf(d), thumb: !!d, sub: '', cur: save.last && save.last[0] === pi && save.last[1] === li }; },
        resume: () => { const [p, i] = save.last && !save.done[keyOf(save.last[0], save.last[1])] ? save.last : nextOpen(); return { label: `Continue · ${F_PACKS[p].name} #${i + 1}`, go: () => open(p, i) }; },
        open: (p, i) => open(p, i)
      });

      const scr = el('div', 'gscreen'); scr.hidden = true;
      scr.innerHTML = `<div class="top"><button type="button" class="g-btn ghost sm" data-a="levels">${I_GRID}Levels</button><div class="nm"><span class="ttl">Flow</span><small class="sub"></small></div><div class="g-hud">${stat('Flows', '0/0', 'fl')}${stat('Moves', '0', 'mv')}${stat('Best', '–', 'bs')}${stat('Pipe', '0%', 'pp')}</div></div>`;
      const Z = 720;
      const { canvas, ctx, toLocal } = api.canvas(Z, Z, scr);
      canvas.style.touchAction = 'none';
      const tools = el('div', 'tools', `<button type="button" class="g-btn ghost sm" data-a="undo">${I_UNDO}Undo</button><button type="button" class="g-btn ghost sm" data-a="hint">${I_BULB}Hint<span class="n"></span></button><button type="button" class="g-btn ghost sm" data-a="reset">${I_RESET}Restart</button>`);
      scr.append(tools); root.append(scr);
      const $ = s => scr.querySelector(s);
      const flV = $('.fl .v'), mvV = $('.mv .v'), bsV = $('.bs .v'), ppV = $('.pp .v'), ttl = $('.ttl'), sub = $('.sub'), undoB = $('[data-a="undo"]'), hintN = $('[data-a="hint"] .n');

      const fx = particles();
      let pi = 0, li = 0, P, W, N, cs, paths, owner, vis, dotAt, moves = 0, lastC = -1, hist = [], solved = false, winT = -1, perfect = false;
      let act = -1, pos = null, changed = false, snap = null, rings = [], pulse = [], kb = null, hintFlash = [], time = 0, cutFlash = [], hinted = false;

      const colorOf = c => F_COL[c];
      const complete = c => { const p = paths[c]; return p.length > 1 && dotAt[p[p.length - 1]] === c; };
      const flows = () => { let k = 0; for (let c = 0; c < paths.length; c++) if (complete(c)) k++; return k; };
      const covered = () => { let k = 0; for (let c = 0; c < paths.length; c++) k += paths[c].length; return k; };
      function rebuild() {
        owner.fill(-1);
        paths.forEach((p, c) => p.forEach(i => { owner[i] = c; }));
      }
      function hud() {
        const f = flows(), cv = covered();
        flV.textContent = `${f}/${paths.length}`; mvV.textContent = moves;
        const d = save.done[keyOf(pi, li)];
        bsV.textContent = d ? d.m : '–';
        ppV.textContent = Math.round(cv / N * 100) + '%';
        undoB.disabled = !hist.length || solved;
        hintN.textContent = save.hints;
        api.score(solvedCount() || '—');
      }
      function open(p, i) {
        pi = p; li = i; P = fPuzzle(p, i); W = P.W; N = W * W; cs = Z / W;
        paths = P.ends.map(e => []); owner = new Int8Array(N).fill(-1); vis = paths.map(() => 0); dotAt = new Int8Array(N).fill(-1);
        P.ends.forEach(([a, b], c) => { dotAt[a] = c; dotAt[b] = c; });
        moves = 0; lastC = -1; hist = []; solved = false; winT = -1; perfect = false; hinted = false; act = -1; pos = null; rings = []; pulse = []; hintFlash = []; fx.list.length = 0; kb = null; cutFlash = [];
        save.last = [p, i]; persist();
        ttl.textContent = `${F_PACKS[p].name} · #${i + 1}`;
        sub.textContent = `${P.ends.length} flows`;
        hub.hide(); scr.hidden = false; scr.style.animation = 'none'; void scr.offsetWidth; scr.style.animation = ''; reveal(scr);
        hud(); snd.resume();
      }
      function toHub() { scr.hidden = true; hub.show(pi); }
      const copyPaths = () => paths.map(p => p.slice());
      function begin(cell) {
        if (solved || winT >= 0) return false;
        const c = dotAt[cell] >= 0 ? dotAt[cell] : owner[cell];
        if (c < 0) return false;
        snap = { paths: copyPaths(), moves, lastC };
        changed = false;
        if (dotAt[cell] >= 0) {
          const old = paths[c];
          if (old.length !== 1 || old[0] !== cell) changed = true;
          if (old.length > 1) snd.noise(.08, .04, 1200, 500, 1.5);
          paths[c] = [cell];
          snd.tone(snd.NOTE(snd.pent(c) + 12), .14, 'sine', .08, 0);
          pulse.push({ cell, c, t: 0 });
        } else {
          const idx = paths[c].indexOf(cell);
          if (idx < paths[c].length - 1) { paths[c].length = idx + 1; changed = true; }
        }
        act = c; rebuild(); hud();
        return true;
      }
      function step(nx) {
        const c = act, p = paths[c], head = p[p.length - 1];
        if (p.length > 1 && nx === p[p.length - 2]) { p.pop(); owner[head] = -1; changed = true; snd.tone(snd.NOTE(snd.pent(p.length)), .04, 'sine', .035, 0); return true; }
        if (complete(c)) return false;
        const hx = head % W, hy = (head / W) | 0, nxx = nx % W, nyy = (nx / W) | 0;
        if (Math.abs(hx - nxx) + Math.abs(hy - nyy) !== 1) return false;
        const di = dotAt[nx];
        if (di >= 0 && di !== c) return false;
        if (di === c && nx === p[0]) return false;
        if (owner[nx] === c) {
          const idx = p.indexOf(nx);
          for (let k = idx + 1; k < p.length; k++) owner[p[k]] = -1;
          p.length = idx + 1; changed = true;
          return true;
        }
        if (owner[nx] >= 0) {
          const d = owner[nx], q = paths[d], idx = q.indexOf(nx);
          const cutCells = q.slice(idx);
          for (const i of cutCells) { owner[i] = -1; cutFlash.push({ cell: i, c: d, t: 0 }); }
          q.length = idx;
          snd.noise(.14, .1, 2600, 400, 2); snd.tone(190, .12, 'square', .045, 90);
          fx.burst((nx % W + .5) * cs, ((nx / W | 0) + .5) * cs, 8, [colorOf(d)], 120, .45, 3, 100);
        }
        p.push(nx); owner[nx] = c; changed = true;
        if (di === c) {
          snd.arp([snd.pent(c), snd.pent(c + 2), snd.pent(c + 4)], .05, 'sine', .07, .4);
          rings.push({ cell: nx, c, t: 0 });
          fx.burst((nx % W + .5) * cs, ((nx / W | 0) + .5) * cs, 10, [colorOf(c), '#ffffff'], 150, .6, 3.5, 60);
        } else snd.tone(snd.NOTE(snd.pent(p.length) + 12), .05, 'sine', .04, 0);
        return true;
      }
      function moveTo(cell) {
        if (act < 0) return;
        let guard = 0;
        for (;;) {
          const p = paths[act], head = p[p.length - 1];
          if (head === cell || guard++ > 60) break;
          const hx = head % W, hy = (head / W) | 0, tx = cell % W, ty = (cell / W) | 0, dx = tx - hx, dy = ty - hy;
          let nx;
          const alt = [];
          if (Math.abs(dx) >= Math.abs(dy)) { if (dx) alt.push(head + Math.sign(dx)); if (dy) alt.push(head + Math.sign(dy) * W); }
          else { if (dy) alt.push(head + Math.sign(dy) * W); if (dx) alt.push(head + Math.sign(dx)); }
          let ok = false;
          for (nx of alt) { if (step(nx)) { ok = true; break; } }
          if (!ok) break;
          if (complete(act)) break;
        }
        hud();
      }
      function finish() {
        if (act < 0) return;
        const c = act; act = -1; pos = null; if (kb) kb.drawing = -1;
        if (changed) {
          hist.push(snap); if (hist.length > 100) hist.shift();
          if (paths[c].length > 1) { if (lastC !== c) moves++; lastC = c; }
          if (!complete(c)) snd.tone(220, .08, 'sine', .03, 180);
        }
        snap = null; changed = false;
        hud(); check();
      }
      function check() {
        if (solved) return;
        if (flows() === paths.length && covered() === N) {
          solved = true; winT = 0; perfect = !hinted && moves <= paths.length;
          const k = keyOf(pi, li), old = save.done[k];
          save.done[k] = { m: old ? Math.min(old.m, moves) : moves, f: paths.length, perfect: perfect || (old && old.perfect) || false };
          if (!old) { save.earn++; if (save.earn % 3 === 0) { save.hints = Math.min(12, save.hints + 1); } }
          persist(); hud();
          snd.fanfare(); if (perfect) snd.arp([84, 88, 91, 96], .07, 'sine', .06, .8);
          api.submit(solvedCount());
          for (let t = 0; t < 5; t++) api.timeout(() => fx.burst(Z * (.15 + Math.random() * .7), Z * (.2 + Math.random() * .5), 28, F_COL, 320, 1.4, 5, 380), t * 220);
          api.timeout(() => {
            if (!solved) return;
            const nxt = li + 1 < F_PACKS[pi].items.length ? [pi, li + 1] : (pi + 1 < F_PACKS.length && packDone(pi) >= 8 ? [pi + 1, 0] : null);
            const st = starsOf(save.done[k]);
            api.overlay({
              kicker: `${F_PACKS[pi].name} · #${li + 1}`, title: perfect ? 'Perfect!' : 'Level complete', text: perfect ? 'Every flow drawn in a single move.' : `You need ${paths.length} moves for a perfect.`,
              stats: [['Moves', moves], ['Flows', paths.length], ['Stars', '★'.repeat(st) + '☆'.repeat(3 - st)]],
              button: nxt ? 'Next level' : 'Levels', secondary: nxt ? 'Levels' : null,
              onAction: () => nxt ? open(nxt[0], nxt[1]) : toHub(), onSecondary: toHub
            });
          }, 1900);
        }
      }
      function undo() {
        if (solved || !hist.length) return;
        const s = hist.pop();
        paths = s.paths; moves = s.moves; lastC = s.lastC; rebuild();
        vis = paths.map(p => Math.min(p.length, 1));
        snd.tone(330, .09, 'triangle', .06, 220); hud();
      }
      function reset() {
        if (solved) return;
        if (!paths.some(p => p.length)) return;
        snap = { paths: copyPaths(), moves, lastC };
        hist.push(snap);
        paths = P.ends.map(() => []); rebuild(); moves = 0; lastC = -1; snd.noise(.3, .06, 2000, 300, 1); hud();
      }
      function hint() {
        if (solved || act >= 0) return;
        if (save.hints <= 0) { api.toast('No hints left. Solve more levels to earn another.'); return; }
        const todo = [];
        P.sol.forEach((s, c) => { const p = paths[c]; if (!(p.length === s.length && p.every((v, i) => v === s[i]) || p.length === s.length && p.every((v, i) => v === s[s.length - 1 - i]))) todo.push(c); });
        if (!todo.length) return;
        const c = todo.find(k => paths[k].length < 2) ?? todo[0];
        snap = { paths: copyPaths(), moves, lastC }; hist.push(snap);
        const s = P.sol[c];
        for (const i of s) {
          const d = owner[i];
          if (d >= 0 && d !== c) { const q = paths[d], idx = q.indexOf(i); for (const k of q.slice(idx)) owner[k] = -1; q.length = idx; }
        }
        paths[c].forEach(i => { owner[i] = -1; });
        paths[c] = s.slice(); rebuild();
        save.hints--; persist();
        moves++; lastC = c; hinted = true;
        hintFlash.push({ c, t: 0 });
        snd.arp([79, 84, 88], .06, 'sine', .07, .35);
        hud(); check();
      }

      const cellOf = e => {
        const p = toLocal(e);
        pos = p;
        const x = Math.floor(p.x / cs), y = Math.floor(p.y / cs);
        return x >= 0 && y >= 0 && x < W && y < W ? y * W + x : -1;
      };
      api.on(canvas, 'pointerdown', e => {
        if (e.button) return;
        snd.resume();
        const cell = cellOf(e);
        if (cell < 0) return;
        e.preventDefault();
        try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
        begin(cell);
      });
      api.on(canvas, 'pointermove', e => {
        const cell = cellOf(e);
        if (act >= 0 && cell >= 0) moveTo(cell);
      });
      api.on(window, 'pointerup', finish);
      api.on(window, 'pointercancel', finish);
      press(api, scr, '[data-a]', b => {
        api.sfx('tap');
        const a = b.dataset.a;
        if (a === 'levels') toHub(); else if (a === 'undo') undo(); else if (a === 'hint') hint(); else if (a === 'reset') reset();
      });
      api.on(window, 'keydown', e => {
        if (scr.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'z') { undo(); return; }
        if (k === 'h') { hint(); return; }
        if (k === 'r') { reset(); return; }
        const dirs = { arrowup: -W, arrowdown: W, arrowleft: -1, arrowright: 1, w: -W, s: W, a: -1, d: 1 };
        if (k in dirs) {
          e.preventDefault();
          kb = kb || { cell: Math.floor(N / 2), drawing: -1 };
          const cx = kb.cell % W, cy = (kb.cell / W) | 0;
          const nx = k === 'arrowleft' || k === 'a' ? cx - 1 : k === 'arrowright' || k === 'd' ? cx + 1 : cx, ny = k === 'arrowup' || k === 'w' ? cy - 1 : k === 'arrowdown' || k === 's' ? cy + 1 : cy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= W) return;
          const cell = ny * W + nx;
          if (kb.drawing >= 0 && act >= 0) { moveTo(cell); const h = paths[act]; kb.cell = h[h.length - 1]; if (complete(act)) finish(); }
          else kb.cell = cell;
        } else if (k === ' ' || k === 'enter') {
          e.preventDefault();
          kb = kb || { cell: Math.floor(N / 2), drawing: -1 };
          if (act >= 0) { finish(); kb.drawing = -1; } else if (begin(kb.cell)) kb.drawing = act;
        }
      });

      function drawPath(c, alpha, wid) {
        const p = paths[c];
        if (p.length < 1) return;
        const v = vis[c], full = Math.floor(v), frac = v - full;
        ctx.strokeStyle = colorOf(c); ctx.lineWidth = wid; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha;
        ctx.beginPath();
        const pt = i => [(p[i] % W + .5) * cs, ((p[i] / W | 0) + .5) * cs];
        let a = pt(0); ctx.moveTo(a[0], a[1]);
        const n = Math.min(p.length, Math.max(1, full));
        for (let i = 1; i < n; i++) { a = pt(i); ctx.lineTo(a[0], a[1]); }
        if (n < p.length && frac > 0 && n >= 1) { const b = pt(n), l = pt(n - 1); ctx.lineTo(l[0] + (b[0] - l[0]) * frac, l[1] + (b[1] - l[1]) * frac); }
        else if (p.length === 1) ctx.lineTo(a[0] + .01, a[1]);
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      function draw(dt) {
        time += dt;
        ctx.clearRect(0, 0, Z, Z);
        ctx.fillStyle = '#0b0b12'; ctx.fillRect(0, 0, Z, Z);
        const wp = winT >= 0 ? winT : -1;
        for (let c = 0; c < paths.length; c++) {
          const tgt = paths[c].length;
          vis[c] = vis[c] < tgt ? Math.min(tgt, vis[c] + dt * 80) : tgt;
        }
        for (let c = 0; c < paths.length; c++) {
          const col = colorOf(c);
          ctx.fillStyle = col; ctx.globalAlpha = wp >= 0 ? .28 : .2;
          paths[c].forEach(i => ctx.fillRect((i % W) * cs + 1, ((i / W) | 0) * cs + 1, cs - 2, cs - 2));
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = '#2b2b42'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let k = 0; k <= W; k++) { ctx.moveTo(k * cs, 0); ctx.lineTo(k * cs, Z); ctx.moveTo(0, k * cs); ctx.lineTo(Z, k * cs); }
        ctx.stroke();
        for (const f of cutFlash) { f.t += dt; }
        cutFlash = cutFlash.filter(f => f.t < .4);
        for (const f of cutFlash) { ctx.fillStyle = colorOf(f.c); ctx.globalAlpha = .5 * (1 - f.t / .4); ctx.fillRect((f.cell % W) * cs, ((f.cell / W) | 0) * cs, cs, cs); ctx.globalAlpha = 1; }
        const bounce = wp >= 0 ? 1 + Math.sin(Math.min(wp, .6) / .6 * Math.PI) * .12 : 1;
        for (let c = 0; c < paths.length; c++) {
          const hf = hintFlash.find(h => h.c === c);
          drawPath(c, 1, cs * .34 * bounce * (c === act ? 1.08 : 1));
          if (hf) { ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 22 * (1 - hf.t / .9); drawPath(c, .9 * (1 - hf.t / .9), cs * .34); ctx.restore(); }
        }
        hintFlash.forEach(h => { h.t += dt; }); hintFlash = hintFlash.filter(h => h.t < .9);
        P.ends.forEach(([a, b], c) => {
          const done = complete(c), col = colorOf(c);
          for (const i of [a, b]) {
            const x = (i % W + .5) * cs, y = ((i / W | 0) + .5) * cs;
            const pu = pulse.find(q => q.cell === i);
            let r = cs * .31 * (pu ? 1 + Math.sin(Math.min(1, pu.t / .25) * Math.PI) * .25 : 1);
            if (!done && c !== act) r *= 1 + Math.sin(time * 3 + c) * .03;
            ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = cs * (done ? .3 : .22) + (c === act ? cs * .25 : 0);
            ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
            ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.arc(x - r * .28, y - r * .3, r * .4, 0, 7); ctx.fill();
          }
        });
        pulse.forEach(q => { q.t += dt; }); pulse = pulse.filter(q => q.t < .35);
        for (const r of rings) {
          r.t += dt;
          const x = (r.cell % W + .5) * cs, y = ((r.cell / W | 0) + .5) * cs, k = r.t / .6;
          ctx.strokeStyle = colorOf(r.c); ctx.globalAlpha = Math.max(0, 1 - k); ctx.lineWidth = cs * .08;
          ctx.beginPath(); ctx.arc(x, y, cs * (.3 + k * .9), 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
        }
        rings = rings.filter(r => r.t < .6);
        if (act >= 0 && pos) {
          ctx.fillStyle = colorOf(act); ctx.globalAlpha = .28;
          ctx.beginPath(); ctx.arc(pos.x, pos.y, cs * .8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        }
        if (kb && !scr.hidden) {
          const x = (kb.cell % W) * cs, y = ((kb.cell / W) | 0) * cs;
          ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .55 + Math.sin(time * 6) * .25; ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, cs - 6, cs - 6); ctx.globalAlpha = 1;
        }
        if (wp >= 0 && wp < 1.8) {
          const k = wp / 1.8;
          ctx.fillStyle = `rgba(255,255,255,${.2 * Math.sin(k * Math.PI)})`; ctx.fillRect(0, 0, Z, Z);
        }
        fx.step(dt); fx.draw(ctx);
      }
      api.loop(dt => {
        if (scr.hidden) return;
        if (winT >= 0) winT += dt;
        draw(dt);
      });
      return {};
    }
  });

  const W_COL = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#16a34a', '#14b8a6', '#06b6d4', '#3b82f6', '#4f46e5', '#a855f7', '#ec4899', '#92400e', '#9ca3af', '#f5f5f4'];
  const W_PACKS = [
    { name: 'Droplets', sub: '3-4 colours · 2 spare tubes', k: [3, 4], e: 2, cap: 4, hue: 195 },
    { name: 'Puddles', sub: '4-6 colours · 2 spare tubes', k: [4, 6], e: 2, cap: 4, hue: 175 },
    { name: 'Streams', sub: '6-8 colours · 2 spare tubes', k: [6, 8], e: 2, cap: 4, hue: 215 },
    { name: 'Rivers', sub: '8-10 colours · 2 spare tubes', k: [8, 10], e: 2, cap: 4, hue: 245 },
    { name: 'Lagoons', sub: '8-10 colours · tall tubes', k: [8, 10], e: 2, cap: 5, hue: 275 },
    { name: 'Oceans', sub: '10-12 colours · tall tubes', k: [10, 12], e: 2, cap: 5, hue: 305 },
    { name: 'Abyss', sub: '12-14 colours · maximum chaos', k: [12, 14], e: 2, cap: 4, hue: 335 }
  ].map(p => ({ ...p, n: 20 }));
  const wTopRun = t => { const c = t.charCodeAt(t.length - 1); let n = 1; while (n < t.length && t.charCodeAt(t.length - 1 - n) === c) n++; return n; };
  const wKey = ts => ts.slice().sort().join('|');
  const wDone = (ts, cap) => ts.every(t => !t || (t.length === cap && wTopRun(t) === cap));
  function wMoves(ts, cap) {
    const out = [];
    for (let i = 0; i < ts.length; i++) {
      const a = ts[i];
      if (!a) continue;
      const r = wTopRun(a), c = a[a.length - 1], uni = r === a.length;
      let emptySeen = false;
      for (let j = 0; j < ts.length; j++) {
        if (i === j) continue;
        const b = ts[j];
        if (b.length >= cap) continue;
        if (b) { if (b[b.length - 1] !== c) continue; }
        else { if (uni || emptySeen) continue; emptySeen = true; }
        out.push([i, j, Math.min(r, cap - b.length)]);
      }
    }
    return out;
  }
  function wApply(ts, m) {
    const a = ts[m[0]], c = a[a.length - 1], r = ts.slice();
    r[m[0]] = a.slice(0, a.length - m[2]);
    r[m[1]] = ts[m[1]] + c.repeat(m[2]);
    return r;
  }
  function wHeur(ts, cap) {
    let h = 0;
    const seen = {};
    for (const t of ts) {
      if (!t) continue;
      let b = 1;
      while (b < t.length && t[b] === t[0]) b++;
      h += t.length - b;
      for (const ch of new Set(t)) seen[ch] = (seen[ch] || 0) + 1;
    }
    for (const k in seen) h += (seen[k] - 1) * 1.2;
    return h;
  }
  function wSolve(ts, cap, bfsCap = 20000, bestCap = 60000) {
    if (wDone(ts, cap)) return { path: [], exact: true };
    const start = wKey(ts);
    let seen = new Map([[start, null]]), level = [ts], depth = 0, nodes = 0;
    while (level.length && nodes < bfsCap) {
      const next = [];
      for (const s of level) {
        const sk = wKey(s);
        for (const m of wMoves(s, cap)) {
          const n = wApply(s, m), k = wKey(n);
          if (seen.has(k)) continue;
          seen.set(k, [sk, m]); nodes++;
          if (wDone(n, cap)) {
            const path = [];
            let cur = k;
            while (seen.get(cur)) { const [pk, mm] = seen.get(cur); path.push(mm); cur = pk; }
            return { path: path.reverse(), exact: true };
          }
          next.push(n);
        }
      }
      level = next; depth++;
    }
    seen = new Map([[start, null]]);
    const heap = [[wHeur(ts, cap) * 2.4, 0, ts]];
    const up = i => { while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const down = i => { for (;;) { let l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } };
    let expanded = 0;
    while (heap.length && expanded < bestCap) {
      const top = heap[0], last = heap.pop();
      if (heap.length) { heap[0] = last; down(0); }
      const [, g, s] = top, sk = wKey(s);
      expanded++;
      for (const m of wMoves(s, cap)) {
        const n = wApply(s, m), k = wKey(n);
        if (seen.has(k)) continue;
        seen.set(k, [sk, m]);
        if (wDone(n, cap)) {
          const path = [];
          let cur = k;
          while (seen.get(cur)) { const [pk, mm] = seen.get(cur); path.push(mm); cur = pk; }
          return { path: path.reverse(), exact: false };
        }
        heap.push([g + 1 + wHeur(n, cap) * 2.4, g + 1, n]); up(heap.length - 1);
      }
    }
    return null;
  }
  const wCache = new Map();
  function wLevel(pi, li) {
    const key = pi * 100 + li;
    if (wCache.has(key)) return wCache.get(key);
    const P = W_PACKS[pi], t = P.n > 1 ? li / (P.n - 1) : 0;
    const K = Math.round(P.k[0] + (P.k[1] - P.k[0]) * t), cap = P.cap;
    for (let seed = 1; ; seed++) {
      const r = rng(pi * 7919 + li * 104729 + seed * 31);
      const layers = [];
      for (let c = 0; c < K; c++) for (let q = 0; q < cap; q++) layers.push(c);
      shuf(layers, r);
      const ts = [];
      for (let i = 0; i < K; i++) ts.push(layers.slice(i * cap, i * cap + cap));
      if (ts.some(a => a.every(v => v === a[0]))) continue;
      const str = ts.map(a => a.map(v => String.fromCharCode(97 + v)).join('')).concat(Array(P.e).fill(''));
      const sol = wSolve(str, cap);
      if (!sol) continue;
      const res = { cap, K, tubes: ts, e: P.e, par: sol.path.length, exact: sol.exact, sol: sol.path, seed };
      wCache.set(key, res);
      return res;
    }
  }
  const wStr = tubes => tubes.map(a => a.map(v => String.fromCharCode(97 + v)).join(''));

  function wClip(poly, g, s) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const da = a[0] * g[0] + a[1] * g[1] - s, db = b[0] * g[0] + b[1] * g[1] - s;
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  const wArea = p => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
  const wRect = (w, H) => [[-w / 2, 0], [w / 2, 0], [w / 2, H], [-w / 2, H]];
  function wSurface(w, H, area, ang) {
    const g = [Math.sin(ang), Math.cos(ang)], R = wRect(w, H);
    if (Math.abs(ang) < 1e-4) return { g, s: H - area / w };
    let lo = -(w + H), hi = w + H;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (wArea(wClip(R, g, mid)) > area) lo = mid; else hi = mid;
    }
    return { g, s: (lo + hi) / 2 };
  }
  function wSpill(V, w, H, lh) {
    if (V <= 0) return 1.9;
    const target = V * lh * w, R = wRect(w, H);
    let lo = 0, hi = 1.9;
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) / 2, g = [Math.sin(mid), Math.cos(mid)];
      if (wArea(wClip(R, g, w / 2 * Math.sin(mid))) > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function wRuns(arr) {
    const r = [];
    for (const c of arr) { if (r.length && r[r.length - 1].c === c) r[r.length - 1].h++; else r.push({ c, h: 1 }); }
    return r;
  }
  function wTubePath(ctx, w, H) {
    const r = w / 2;
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(-r, H - r); ctx.arc(0, H - r, r, Math.PI, 0, true); ctx.lineTo(r, 0);
  }
  function wDrawTube(ctx, w, H, lh, bands, ang, eps, o = {}) {
    const r = w / 2;
    ctx.save();
    wTubePath(ctx, w, H); ctx.closePath();
    ctx.fillStyle = 'rgba(190,220,255,.10)'; ctx.fill();
    const V = bands.reduce((s, b) => s + b.h, 0);
    if (V > 0.001) {
      ctx.save();
      ctx.clip();
      const sf = wSurface(w, H, V * lh * w, ang + eps);
      const poly = wClip(wRect(w, H), sf.g, sf.s);
      if (poly.length > 2) {
        ctx.beginPath(); poly.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
        let y = H;
        for (const b of bands) {
          if (b.h <= 0.0005) continue;
          ctx.fillStyle = W_COL[b.c];
          ctx.fillRect(-r - 2, y - b.h * lh - 0.8, w + 4, b.h * lh + 1.6);
          y -= b.h * lh;
        }
        const gr = ctx.createLinearGradient(-r, 0, r, 0);
        gr.addColorStop(0, 'rgba(0,0,0,.30)'); gr.addColorStop(.16, 'rgba(255,255,255,.20)'); gr.addColorStop(.34, 'rgba(255,255,255,0)'); gr.addColorStop(.78, 'rgba(0,0,0,.06)'); gr.addColorStop(1, 'rgba(0,0,0,.34)');
        ctx.fillStyle = gr; ctx.fillRect(-r - 2, -4, w + 4, H + 8);
        const edge = [];
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i], b = poly[(i + 1) % poly.length];
          const da = a[0] * sf.g[0] + a[1] * sf.g[1] - sf.s, db = b[0] * sf.g[0] + b[1] * sf.g[1] - sf.s;
          if (Math.abs(da) < 1e-6 && Math.abs(db) < 1e-6) edge.push([a, b]);
        }
        if (edge.length) {
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(edge[0][0][0], edge[0][0][1]); ctx.lineTo(edge[0][1][0], edge[0][1][1]); ctx.stroke();
        }
      }
      ctx.restore();
    }
    wTubePath(ctx, w, H);
    ctx.strokeStyle = o.glow ? o.glow : 'rgba(235,245,255,.7)'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 18; }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.42)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-r * .55, lh * .35); ctx.lineTo(-r * .55, Math.max(lh * .5, H - r * 1.7)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r * .5, lh * .5); ctx.lineTo(r * .5, lh * 1.6); ctx.stroke();
    rr(ctx, -r - 4, -5, w + 8, 9, 4.5); ctx.fillStyle = 'rgba(235,245,255,.32)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function wPackArt(pi) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 176;
    const x = c.getContext('2d'), P = W_PACKS[pi], n = 5, w = 38, lh = 24, cap = 4, H = cap * lh + 12;
    const r = rng(pi * 77 + 3);
    for (let i = 0; i < n; i++) {
      const cols = shuf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].slice(0, 7 + pi), r);
      const bands = i === n - 1 ? [] : wRuns([cols[i % cols.length], cols[(i + 1) % cols.length], cols[(i + 2) % cols.length], cols[i % cols.length]].slice(0, i === 1 ? 2 : 4));
      x.save(); x.translate(34 + i * 63, 20); wDrawTube(x, w, H, lh, bands, 0, 0); x.restore();
    }
    return c;
  }
  const WATER_CSS = hubCss('water-sort', '#1b9ad8', '#0a7fb8') + `
.gm-water-sort .pk-art{background:linear-gradient(150deg,#1b2658,#35489b)!important}
.gm-water-sort .pk-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:4px}
.gm-water-sort .g-canvas{background:#17214d;border-radius:18px;box-shadow:0 22px 44px -24px rgba(10,20,70,.85),0 0 0 2px #26336b}
.gm-water-sort .tools .g-btn:disabled{opacity:.45}
`;
  Ameplay.register({
    id: 'water-sort',
    title: 'Water Sort',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' solved',
    width: 900,
    blurb: 'Pour liquids between glass tubes until every tube holds a single colour.',
    help: 'Tap a tube, then tap where to pour · only the same colour or an empty tube accepts a pour · <kbd>Z</kbd> undo · <kbd>H</kbd> hint · <kbd>T</kbd> extra tube · <kbd>R</kbd> restart · arrows + <kbd>Space</kbd> on keyboard · digits pick a tube',
    icon: ICON('<path d="M14 8v36a10 10 0 0 0 20 0V8"/><path d="M14 30h20" stroke-width="3.5"/><path d="M40 24l10-4 6 14-10 4z" /><path d="M40 24c-3 6-2 14 4 20"/>'),
    tint: '#1b9ad8',
    css: WATER_CSS,
    mount(root, api) {
      const snd = makeSnd(api);
      const save = api.load() || {};
      save.done = save.done || {};
      const persist = () => api.save(save);
      const keyOf = (p, l) => p * 100 + l;
      const solvedCount = () => Object.keys(save.done).length;
      const packDone = pi => { let d = 0; for (let i = 0; i < W_PACKS[pi].n; i++) if (save.done[keyOf(pi, i)]) d++; return d; };
      const nextOpen = () => { for (let p = 0; p < W_PACKS.length; p++) { if (p && packDone(p - 1) < 6) break; for (let i = 0; i < W_PACKS[p].n; i++) if (!save.done[keyOf(p, i)]) return [p, i]; } return [0, 0]; };
      const hub = makeHub(api, root, {
        title: 'Water Sort', blurb: 'Sort the liquids so every tube holds one colour. Plan your pours and keep the spare tubes free.',
        packs: W_PACKS.map(p => ({ name: p.name, sub: p.sub, n: p.n, hue: p.hue })),
        packLock: pi => pi && packDone(pi - 1) < 6 ? `Solve 6 in ${W_PACKS[pi - 1].name}` : '',
        packArt: pi => `<img alt="" src="${wPackArt(pi).toDataURL()}">`,
        info: (pi, li) => { const d = save.done[keyOf(pi, li)]; return { done: !!d, stars: d ? d.s : 0, sub: '', cur: save.last && save.last[0] === pi && save.last[1] === li }; },
        resume: () => { const [p, i] = save.last && !save.done[keyOf(save.last[0], save.last[1])] ? save.last : nextOpen(); return { label: `Continue · ${W_PACKS[p].name} #${i + 1}`, go: () => open(p, i) }; },
        open: (p, i) => open(p, i)
      });

      const NARROW = window.innerWidth < 640;
      const CW = NARROW ? 560 : 900, CH = NARROW ? 780 : 600;
      const scr = el('div', 'gscreen'); scr.hidden = true;
      scr.innerHTML = `<div class="top"><button type="button" class="g-btn ghost sm" data-a="levels">${I_GRID}Levels</button><div class="nm"><span class="ttl">Water</span><small class="sub"></small></div><div class="g-hud">${stat('Moves', '0', 'mv')}${stat('Par', '0', 'pr')}${stat('Best', '–', 'bs')}</div></div>`;
      const { canvas, ctx, toLocal } = api.canvas(CW, CH, scr);
      canvas.style.touchAction = 'none';
      const tools = el('div', 'tools', `<button type="button" class="g-btn ghost sm" data-a="undo">${I_UNDO}Undo</button><button type="button" class="g-btn ghost sm" data-a="hint">${I_BULB}Hint</button><button type="button" class="g-btn ghost sm" data-a="tube">${I_PLUS}Tube<span class="n">1</span></button><button type="button" class="g-btn ghost sm" data-a="reset">${I_RESET}Restart</button>`);
      scr.append(tools); root.append(scr);
      const $ = s => scr.querySelector(s);
      const mvV = $('.mv .v'), prV = $('.pr .v'), bsV = $('.bs .v'), ttl = $('.ttl'), sub = $('.sub');
      const undoB = $('[data-a="undo"]'), tubeB = $('[data-a="tube"]'), tubeN = $('[data-a="tube"] .n');

      const fx = particles();
      let pi = 0, li = 0, lv, cap = 4, tubes = [], extra = false, moves = 0, hist = [], sel = -1, hov = -1, anims = [], pos = [], lift = [], comp = [], slosh = [], solved = false, winT = -1, hinted = false, kb = null, hintPair = null, hintT = 0, shake = [], time = 0, G = null, bubbles = [];

      const complete = i => { const t = tubes[i]; return t.length === cap && t.every(v => v === t[0]); };
      const busy = i => anims.some(a => a.from === i || a.to === i);
      function geo() {
        const n = tubes.length, maxCols = NARROW ? 5 : 8;
        const rows = Math.ceil(n / maxCols), cols = Math.ceil(n / rows);
        const top = 78, bot = 26, rowH = (CH - top - bot) / rows;
        const slotW = (CW - 30) / cols;
        const lh = clamp((rowH - 54) / cap, 16, rows === 1 ? 84 : 62);
        const th = cap * lh + 16, tw = clamp(Math.min(slotW * .6, lh * 1.1), 24, 84);
        const slots = [];
        for (let i = 0; i < n; i++) {
          const r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), c = i - r * cols;
          const x0 = (CW - inRow * slotW) / 2;
          slots.push({ x: x0 + (c + .5) * slotW, y: top + r * rowH + (rowH - th) / 2 + 8, r });
        }
        return { rows, cols, slotW, lh, th, tw, slots, rowH, top };
      }
      const rate = () => {
        const par = lv.par;
        return !hinted && !extra && moves <= Math.ceil(par * 1.25) ? 3 : moves <= Math.ceil(par * 1.8) ? 2 : 1;
      };
      function hud() {
        mvV.textContent = moves; prV.textContent = lv ? lv.par : 0;
        const d = save.done[keyOf(pi, li)];
        bsV.textContent = d ? d.m : '–';
        undoB.disabled = !hist.length || solved;
        tubeB.disabled = extra || solved;
        tubeN.textContent = extra ? 0 : 1;
        api.score(solvedCount() || '—');
      }
      function open(p, i) {
        pi = p; li = i; lv = wLevel(p, i); cap = lv.cap;
        tubes = lv.tubes.map(a => a.slice()).concat(Array.from({ length: lv.e }, () => []));
        extra = false; moves = 0; hist = []; sel = -1; hov = -1; anims = []; comp = tubes.map(() => -1); slosh = tubes.map(() => ({ t: 9, amp: 0 })); lift = tubes.map(() => 0);
        solved = false; winT = -1; hinted = false; kb = null; hintPair = null; shake = tubes.map(() => 0); fx.list.length = 0; bubbles = [];
        G = geo(); pos = G.slots.map(s => ({ x: s.x, y: s.y, s: 0 }));
        save.last = [p, i]; persist();
        ttl.textContent = `${W_PACKS[p].name} · #${i + 1}`;
        sub.textContent = `${lv.K} colours`;
        hub.hide(); scr.hidden = false; scr.style.animation = 'none'; void scr.offsetWidth; scr.style.animation = ''; reveal(scr);
        hud(); snd.resume();
      }
      function toHub() { scr.hidden = true; hub.show(pi); }
      const legal = (a, b) => {
        if (a === b || !tubes[a].length || tubes[b].length >= cap) return false;
        if (complete(a)) return false;
        const t = tubes[a], u = tubes[b];
        return !u.length || u[u.length - 1] === t[t.length - 1];
      };
      const snapshot = () => ({ tubes: tubes.map(a => a.slice()), extra, moves });
      function settle() {
        if (!anims.length) return;
        const done = anims.slice(); anims = [];
        done.forEach(a => a.end && a.end(true));
      }
      function startPour(a, b) {
        const t = tubes[a], c = t[t.length - 1];
        let r = 1; while (r < t.length && t[t.length - 1 - r] === c) r++;
        const amt = Math.min(r, cap - tubes[b].length);
        hist.push(snapshot()); if (hist.length > 200) hist.shift();
        const srcPre = t.slice(), dstPre = tubes[b].slice();
        for (let k = 0; k < amt; k++) t.pop();
        for (let k = 0; k < amt; k++) tubes[b].push(c);
        moves++;
        hintPair = null;
        let dir = pos[b].x >= pos[a].x ? 1 : -1;
        const ext = G.th * .95, tx = pos[b].x;
        if (dir > 0 ? tx - ext < 6 : tx + ext > CW - 6) { const alt = -dir; if (alt > 0 ? tx - ext >= 6 : tx + ext <= CW - 6) dir = alt; }
        const A = { from: a, to: b, amt, col: c, srcPre, dstPre, dir, t: 0, tA: .24, tB: .36 + .17 * amt, tC: .24, v0: srcPre.length, startLift: lift[a] };
        A.end = instant => {
          slosh[b] = { t: 0, amp: .14 };
          slosh[a] = { t: 0, amp: .05 };
          if (complete(b) && comp[b] < 0) {
            comp[b] = 0;
            const g = tubes.reduce((s, _, k) => s + (complete(k) ? 1 : 0), 0);
            snd.arp([snd.pent(g) + 12, snd.pent(g + 2) + 12, snd.pent(g + 4) + 12], .06, 'sine', .06, .5);
            fx.burst(pos[b].x, pos[b].y + G.th * .3, 16, [W_COL[c], '#ffffff', '#fff3a8'], 190, .8, 3.5, 160);
          }
          if (!anims.length) check();
        };
        anims.push(A); A.pose = pose(A);
        const t0 = A.tA;
        snd.tone(520, .1, 'sine', .05, 700);
        snd.noise(A.tB, .045, 700, 2300, 2.2, t0);
        for (let k = 0; k < Math.floor(A.tB / .075); k++) snd.tone(330 + Math.random() * 380 + k * 18, .07, 'sine', .028, 0, t0 + k * .075 + Math.random() * .03);
        snd.tone(260, .12, 'sine', .06, 150, t0 + A.tB);
        hud();
      }
      function tap(i) {
        if (solved || winT >= 0 || i < 0 || i >= tubes.length) return;
        snd.resume();
        if (sel < 0) {
          if (busy(i)) return;
          if (!tubes[i].length || complete(i)) { shake[i] = .3; snd.tone(150, .09, 'square', .04, 100); return; }
          sel = i; hintPair = hintPair && hintPair[0] === i ? hintPair : null;
          snd.tone(snd.NOTE(snd.pent(i) + 24), .09, 'sine', .07, snd.NOTE(snd.pent(i) + 31));
          return;
        }
        if (sel === i) { sel = -1; snd.tone(snd.NOTE(72), .08, 'sine', .05, snd.NOTE(64)); return; }
        if (busy(i) || busy(sel)) return;
        if (legal(sel, i)) { const a = sel; sel = -1; startPour(a, i); return; }
        shake[i] = .32; snd.tone(140, .12, 'square', .045, 90);
        if (tubes[i].length && !complete(i) && !busy(i)) { sel = i; snd.tone(snd.NOTE(snd.pent(i) + 24), .09, 'sine', .06, 0); }
      }
      function check() {
        if (solved || anims.length) return;
        if (!wDone(wStr(tubes), cap)) return;
        solved = true; winT = 0; sel = -1;
        const s = rate(), k = keyOf(pi, li), old = save.done[k];
        save.done[k] = { m: old ? Math.min(old.m, moves) : moves, s: Math.max(s, old ? old.s : 0), p: lv.par };
        persist(); hud();
        snd.fanfare();
        api.submit(solvedCount());
        for (let t = 0; t < 5; t++) api.timeout(() => fx.burst(CW * (.12 + Math.random() * .76), CH * (.15 + Math.random() * .5), 26, [...W_COL.slice(0, lv.K), '#ffffff'], 320, 1.3, 5, 380), t * 200);
        api.timeout(() => {
          if (!solved) return;
          const nxt = li + 1 < W_PACKS[pi].n ? [pi, li + 1] : (pi + 1 < W_PACKS.length && packDone(pi) >= 6 ? [pi + 1, 0] : null);
          api.overlay({
            kicker: `${W_PACKS[pi].name} · #${li + 1}`, title: s === 3 ? 'Crystal clear!' : 'Sorted!', text: `Par for this level is ${lv.par} pours.`,
            stats: [['Moves', moves], ['Par', lv.par], ['Stars', '★'.repeat(s) + '☆'.repeat(3 - s)]],
            button: nxt ? 'Next level' : 'Levels', secondary: nxt ? 'Levels' : null,
            onAction: () => nxt ? open(nxt[0], nxt[1]) : toHub(), onSecondary: toHub
          });
        }, 2100);
      }
      function undo() {
        settle();
        if (solved || !hist.length) return;
        const s = hist.pop();
        tubes = s.tubes; moves = s.moves;
        extra = s.extra;
        while (pos.length > tubes.length) { pos.pop(); lift.pop(); comp.pop(); slosh.pop(); shake.pop(); }
        comp = tubes.map((_, i) => complete(i) ? 99 : -1);
        sel = -1; hintPair = null;
        snd.tone(330, .09, 'triangle', .06, 220); snd.tone(250, .12, 'sine', .04, 330, .05);
        tubes.forEach((_, i) => { slosh[i] = { t: 0, amp: .08 }; });
        hud();
      }
      function reset() {
        settle();
        if (solved) return;
        if (!hist.length && !extra) return;
        hist.push(snapshot());
        tubes = lv.tubes.map(a => a.slice()).concat(Array.from({ length: lv.e }, () => []));
        extra = false; moves = 0; sel = -1; hintPair = null; hinted = false;
        while (pos.length > tubes.length) { pos.pop(); lift.pop(); comp.pop(); slosh.pop(); shake.pop(); }
        comp = tubes.map(() => -1);
        snd.noise(.35, .06, 2200, 300, 1);
        tubes.forEach((_, i) => { slosh[i] = { t: 0, amp: .1 }; });
        hud();
      }
      function addTube() {
        settle();
        if (extra || solved) return;
        hist.push(snapshot());
        tubes.push([]); extra = true; sel = -1;
        comp.push(-1); slosh.push({ t: 9, amp: 0 }); shake.push(0); lift.push(0);
        G = geo(); pos.push({ x: G.slots[tubes.length - 1].x, y: G.slots[tubes.length - 1].y, s: 0 });
        snd.arp([67, 74], .07, 'sine', .07, .3);
        hud();
      }
      function hint() {
        settle();
        if (solved) return;
        const sol = wSolve(wStr(tubes), cap);
        if (!sol) { api.toast('No way forward from here. Try undo or add a tube.'); return; }
        if (!sol.path.length) return;
        const m = sol.path[0];
        hinted = true; sel = m[0]; hintPair = [m[0], m[1]]; hintT = 2.6;
        snd.arp([79, 84], .06, 'sine', .06, .3);
      }

      api.on(canvas, 'pointerdown', e => {
        if (e.button) return;
        const p = toLocal(e);
        let best = -1, bd = 1e9;
        tubes.forEach((_, i) => {
          const s = G.slots[i], dx = Math.abs(p.x - s.x), dy = p.y - (s.y + G.th / 2);
          if (dx < G.slotW / 2 && Math.abs(dy) < G.rowH / 2 + 10) { const d = dx + Math.abs(dy) * .3; if (d < bd) { bd = d; best = i; } }
        });
        if (best >= 0) { e.preventDefault(); tap(best); }
      });
      api.on(canvas, 'pointermove', e => {
        if (e.pointerType === 'touch') return;
        const p = toLocal(e);
        hov = -1;
        tubes.forEach((_, i) => { const s = G.slots[i]; if (Math.abs(p.x - s.x) < G.slotW / 2 && Math.abs(p.y - (s.y + G.th / 2)) < G.rowH / 2) hov = i; });
      });
      api.on(canvas, 'pointerleave', () => { hov = -1; });
      press(api, scr, '[data-a]', b => {
        api.sfx('tap');
        const a = b.dataset.a;
        if (a === 'levels') toHub(); else if (a === 'undo') undo(); else if (a === 'hint') hint(); else if (a === 'reset') reset(); else if (a === 'tube') addTube();
      });
      api.on(window, 'keydown', e => {
        if (scr.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'z') { undo(); return; }
        if (k === 'h') { hint(); return; }
        if (k === 'r') { reset(); return; }
        if (k === 't') { addTube(); return; }
        if (/^[1-9]$/.test(k)) { tap(+k - 1); return; }
        if (k === '0') { tap(9); return; }
        const mv = { arrowleft: -1, arrowright: 1, arrowup: -G.cols, arrowdown: G.cols, a: -1, d: 1, w: -G.cols, s: G.cols };
        if (k in mv) {
          e.preventDefault();
          kb = kb == null ? Math.max(0, sel) : clamp(kb + mv[k], 0, tubes.length - 1);
        } else if (k === ' ' || k === 'enter') {
          e.preventDefault();
          if (kb == null) kb = 0;
          tap(kb);
        }
      });

      function pose(a) {
        const w = G.tw, H = G.th, lh = G.lh, d = a.dir;
        const T = pos[a.to], S = pos[a.from];
        const lip = { x: T.x - d * w * .2, y: T.y - Math.max(w * .6, 22) };
        const org = ang => ({ x: lip.x - d * w / 2 * Math.cos(ang), y: lip.y - d * w / 2 * Math.sin(ang) });
        const m = .05;
        const v0 = a.v0, vEnd = v0 - a.amt;
        const th0 = wSpill(v0, w, H, lh) + m, thE = wSpill(vEnd, w, H, lh) + m;
        const lf = Math.min(30, G.th * .12) * a.startLift;
        if (a.t < a.tA) {
          const u = easeIO(a.t / a.tA), o1 = org(d * th0);
          return { x: lerp(S.x, o1.x, u), y: lerp(S.y - lf, o1.y, u), ang: d * th0 * u, p: 0, lip, stream: 0 };
        }
        if (a.t < a.tA + a.tB) {
          const p = (a.t - a.tA) / a.tB, V = v0 - a.amt * p, th = wSpill(V, w, H, lh) + m, o = org(d * th);
          return { x: o.x, y: o.y, ang: d * th, p, lip, stream: Math.min(1, p * 9, (1 - p) * 7 + .05) };
        }
        const u = easeIO((a.t - a.tA - a.tB) / a.tC), oE = org(d * thE);
        return { x: lerp(oE.x, S.x, u), y: lerp(oE.y, S.y, u), ang: d * thE * (1 - u), p: 1, lip, stream: 0 };
      }
      function bandsOf(i) {
        const A = anims.find(a => a.from === i), B = anims.find(a => a.to === i);
        if (A) {
          const p = A.pose.p;
          const base = wRuns(A.srcPre.slice(0, A.srcPre.length - A.amt));
          const b = base.concat([{ c: A.col, h: A.amt * (1 - p) }]);
          return b.reduce((r, x) => { if (r.length && r[r.length - 1].c === x.c) r[r.length - 1].h += x.h; else r.push({ ...x }); return r; }, []);
        }
        if (B) {
          const p = B.pose.p, base = wRuns(B.dstPre);
          const b = base.concat([{ c: B.col, h: B.amt * p }]);
          return b.reduce((r, x) => { if (r.length && r[r.length - 1].c === x.c) r[r.length - 1].h += x.h; else r.push({ ...x }); return r; }, []);
        }
        return wRuns(tubes[i]);
      }
      function draw(dt) {
        time += dt;
        G = geo();
        scr.dataset.lay = [CW, ...G.slots.map(q => Math.round(q.x) + ':' + Math.round(q.y + G.th / 2))].join();
        const k = 1 - Math.exp(-dt * 13), kl = 1 - Math.exp(-dt * 18);
        tubes.forEach((_, i) => {
          const s = G.slots[i], p = pos[i];
          p.x += (s.x - p.x) * k; p.y += (s.y - p.y) * k; p.s += (1 - p.s) * k;
          lift[i] += ((sel === i ? 1 : hov === i && !busy(i) ? .28 : 0) - lift[i]) * kl;
          if (shake[i] > 0) shake[i] = Math.max(0, shake[i] - dt);
          if (comp[i] >= 0 && comp[i] < 90) comp[i] += dt;
          slosh[i].t += dt;
        });
        for (const a of anims) {
          a.t += dt;
          a.pose = pose(a);
        }
        for (let q = anims.length - 1; q >= 0; q--) {
          const a = anims[q];
          if (a.t >= a.tA + a.tB + a.tC) { anims.splice(q, 1); a.end(false); }
        }
        if (hintT > 0) { hintT -= dt; if (hintT <= 0) hintPair = null; }
        ctx.clearRect(0, 0, CW, CH);
        const bg = ctx.createLinearGradient(0, 0, 0, CH);
        bg.addColorStop(0, '#1f2c68'); bg.addColorStop(1, '#121a42');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);
        for (let q = 0; q < 14; q++) {
          const x = (q * 173 + 40) % CW, y = (q * 97 + Math.sin(time * .3 + q) * 14 + 60) % CH, r = 26 + (q % 4) * 14;
          const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, 'rgba(120,160,255,.08)'); rg.addColorStop(1, 'rgba(120,160,255,0)');
          ctx.fillStyle = rg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        for (let r = 0; r < G.rows; r++) {
          const y = G.top + r * G.rowH + (G.rowH - G.th) / 2 + 8 + G.th + 5;
          rr(ctx, 14, y, CW - 28, 9, 4.5); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill();
        }
        const order = tubes.map((_, i) => i).sort((a, b) => (busy(a) && anims.find(q => q.from === a) ? 1 : 0) - (busy(b) && anims.find(q => q.from === b) ? 1 : 0));
        const w = G.tw, H = G.th, lh = G.lh;
        for (const i of order) {
          const A = anims.find(q => q.from === i), p = pos[i];
          const sl = slosh[i], eps = sl.amp * Math.sin(sl.t * 17) * Math.exp(-sl.t * 3.4) * (A ? 0 : 1);
          let x = p.x, y = p.y - Math.min(30, H * .12) * lift[i], ang = 0;
          if (A) { x = A.pose.x; y = A.pose.y; ang = A.pose.ang; }
          if (shake[i] > 0) x += Math.sin(shake[i] * 60) * 6 * (shake[i] / .3);
          const scl = p.s;
          if (!A) {
            const sh = ctx.createRadialGradient(p.x, p.y + H + 5, 0, p.x, p.y + H + 5, w * .8);
            sh.addColorStop(0, 'rgba(0,0,0,.4)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.save(); ctx.translate(p.x, p.y + H + 5); ctx.scale(1, .22); ctx.translate(-p.x, -(p.y + H + 5)); ctx.fillStyle = sh; ctx.fillRect(p.x - w, p.y + H + 5 - w, w * 2, w * 2); ctx.restore();
          }
          ctx.save();
          ctx.translate(x, y + (1 - scl) * H * .5); ctx.rotate(ang); ctx.scale(scl, scl);
          if (A) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; }
          let glow = null;
          if (hintPair && hintPair[1] === i) glow = `rgba(255,236,140,${.55 + Math.sin(time * 9) * .35})`;
          else if (comp[i] >= 0 && comp[i] < 1.2) glow = `rgba(255,255,255,${.9 * (1 - comp[i] / 1.2)})`;
          else if (sel === i) glow = 'rgba(255,255,255,.95)';
          wDrawTube(ctx, w, H, lh, bandsOf(i), ang, eps, { glow });
          if (comp[i] >= 0) {
            const t = Math.min(1, comp[i] / .45), cy = lerp(-70, -6, back(t)), col = W_COL[tubes[i][0]];
            ctx.globalAlpha = Math.min(1, t * 3);
            rr(ctx, -w / 2 - 3, cy - 9, w + 6, 15, 6); ctx.fillStyle = shade(col, -.15); ctx.fill();
            rr(ctx, -w / 2 - 3, cy - 9, w + 6, 6, 3); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.restore();
          if (kb === i && !solved) {
            ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .6 + Math.sin(time * 7) * .3;
            ctx.beginPath(); ctx.moveTo(p.x, p.y + H + 12); ctx.lineTo(p.x - 8, p.y + H + 24); ctx.lineTo(p.x + 8, p.y + H + 24); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
          }
          if (winT >= 0 && winT < 2) {
            const ph = Math.max(0, winT * 5 - i * .35);
            if (ph > 0 && ph < 1) { ctx.fillStyle = `rgba(255,255,255,${.4 * Math.sin(ph * Math.PI)})`; ctx.fillRect(p.x - w, p.y - 10, w * 2, H + 20); }
          }
        }
        for (const a of anims) {
          const P = a.pose;
          if (P.stream > 0.02) {
            const T = pos[a.to], tb = bandsOf(a.to), Vt = tb.reduce((s, b) => s + b.h, 0);
            const surf = T.y + H - Vt * lh, sw = w * .19 * P.stream, lx = P.lip.x + a.dir * 1.5;
            const y0 = P.lip.y, y1 = Math.max(y0 + 4, surf);
            const col = W_COL[a.col];
            ctx.save();
            const sg = ctx.createLinearGradient(lx - sw / 2, 0, lx + sw / 2, 0);
            sg.addColorStop(0, shade(col, -.15)); sg.addColorStop(.4, shade(col, .25)); sg.addColorStop(1, shade(col, -.1));
            ctx.fillStyle = sg;
            ctx.beginPath(); ctx.moveTo(lx - sw * .7, y0); ctx.lineTo(lx + sw * .7, y0); ctx.lineTo(lx + sw / 2, y1); ctx.lineTo(lx - sw / 2, y1); ctx.closePath(); ctx.fill();
            ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(lx, y1, sw * .9, sw * .3, 0, 0, 7); ctx.fill();
            ctx.restore();
            if (Math.random() < dt * 60 * .5) fx.burst(lx, y1, 1, [col, '#ffffff'], 70, .35, 2.2, 520);
          }
        }
        fx.step(dt); fx.draw(ctx);
      }
      api.loop(dt => {
        if (scr.hidden) return;
        if (winT >= 0) winT += dt;
        draw(dt);
      });
      return {};
    }
  });

  const U_DATA = [
    '2:bba....fa....faRRcgiid.cg.hd....hdee',
    '2:.h.gg..h.dd..hRRf.bcccf.b..af.beea..',
    '2:.cakk.dcallbd.aRRbjeei..j.fi..ggfihh',
    '2:e....ieg.hhibgcRRfbjcd.f.jcdkf.aadk.',
    '2:ggg......a...RRa..fd.hhhfdbbccfdee..',
    '2:.ggg.....bb...RRi.cddfi.c.ef..hhefaa',
    '3:cclbeekklb..j.RR.ajh..gajhiigaff.ddd',
    '3:k.iiiak..ggaRR.j..bbfj..ddfjce..hhce',
    '3:..lcggbblc..fRRa..fhhaiif.jjed.kk.ed',
    '3:lc.ffflcdd.i.ehRRi.ehb.kg.hbjkgaabjk',
    '3:abbhffam.hkkamRRdljjggdlii.e...cce..',
    '3:e.dddkecc..k.RRg.jhffg.jh.bga.iib.a.',
    '3:..ccee.hlkk.jhlRRaj..bgajiibgaff.ddd',
    '3:hhi.ddc.iffjceRRkj.e.bk.gg.b.....baa',
    '3:...kkkd..hh.d.RR.iffgc.ieegcaj.bbcaj',
    '3:ff.d....kdeel.kRRjlckbbjac.ggga.iihh',
    '3:hhg.kkd.g.ccdRRb.ali.bealiffeal.jjj.',
    '3:a.kbbba.k.ggRRei..hheif.dd.ifc.jj..c',
    '4:jbiiihjbcc.hRRlg..edlg.fedlgkf..aakf',
    '4:bbjj..allhh.aRRe..aggeddff.c.i.kkc.i',
    '4:.cc.kkgiidf.gRRdfeghjj.ebh....b.aaa.',
    '4:bfff..b...aaRRd..hccdekhiijek.ggje..',
    '4:dgg...d..aa.RRc.....c..h.fc..h.feebb',
    '4:...ccc.hh..ejRRd.ejggdffbaklllbakii.',
    '4:..ccc..kke.gdRRe.gdjj.iibahfffbahll.',
    '4:..ddgg.mmmlljecRRajecbkajiibka.hhfff',
    '4:.hcckkgh.diigRRdf.g.jjf.b.e...b.eaaa',
    '4:lee.hhldd.bbc.RRkgci..kgcijj.gaa.fff',
    '4:..eee.hh.i.dbRRi.db.ggaa.j.ccc.j..ff',
    '4:ihhh.aiff..akRRj.dkbbjcd..ejc...egg.',
    '5:iijg..eejg..hRRga.hdk.af.dkccf.d..bb',
    '5:..agg.iiac..RRac.djh.bbdjh.kkkee.ff.',
    '5:..ahhhb.akkdbRR..dejj.g.e.ffgi.cc..i',
    '5:.bbbfjeea.fjRRa...gccd..g..diihh.dkk',
    '5:e..biieggb.deRR..dafchhkafc..k...jjj',
    '5:.i.deeji.d..jRRd.a..bb.ahff...h.ggcc',
    '5:ca.bbbcaefjjRRefd...efd.hi....higg..',
    '5:.hh.a...ddaeRRi..egkif..gkjfcc.kjfbb',
    '5:dffbm.dccbm..geRRakge.lakjj.lakiihhh',
    '5:ff...e.gg.jeRRdbj..kdb..ikcbaaikc.hh',
    '5:cabbbicaeediRR.fdgjk.f.gjk.f.g....hh',
    '5:a..eeeakkd.f.RRd.f.hh.jjgibbb.gi..cc',
    '6:a.gggbajj.ebRRf.e.hhfi..ccdi....di..',
    '6:k..ccck.fiieRRfd.ebhhdggba.....a.jj.',
    '6:...fa....faghRRf.ghcbb...c.ee....dd.',
    '6:b.aiiib.allhRR..kheccdkgejjd.gff.dmm',
    '6:bb.hh.a..iigaRRe.gaffedd.jjcl..kkcl.',
    '6:j.eiiij.effhRR..ahdd.kalgcck.lg..kbb',
    '6:.e..ccfe.giifRRg.h.lbddh.lbkkkjjb.aa',
    '6:..ggafhh.cafRRec...jeckk.jdbb..jdii.',
    '6:.c.f...c.f.iRR.f.ih.bb.gh.eeag..dda.',
    '6:.gg.jjd..ccadhfRRamhfbeamllbe.mkkiii',
    '6:..alllc.a.bbc.RR.idd.e.ifjjekhfggekh',
    '6:bldfffbldeaaRRke.hcckejh.ii.j...gg..',
    '7:..ccjjgg.fe.aRRfedabbhhda.......ii..',
    '7:....f...ggf...RRf.ceddd.ce.a..ce.abb',
    '7:iddae.i..ae.RRga.fbjghhfbjgll..cc.kk',
    '7:..d.hhggd..jRRk.cjeikac.ei.aff.i.abb',
    '7:ddda.....abbcRR..icllffikhjeeekhjgg.',
    '7:.bb.e..dd.ei.cRReihcggg.hc.j.fhaaj.f',
    '6:h.cccah.bffaRRbeg.dd.eg.iije....j...',
    '6:aceebbach.jjRRhg.f...gif.ddgi...kkk.',
    '6:g.cfffg.cdd..RR.aejhhiaejbbi.lkk.i.l',
    '6:giecddgiec..RRec..faa...f..hh.jjbb..',
    '6:ed..cced.ii..RRga..bbga....ghhjjff..',
    '7:..keee..kccjdRRb.jdhhbaafggg..fii...',
    '7:gajjj.ga.bbhRRdkfh.edkfhcedk..cii...',
    '7:jddiigj.bbhgjRReh.c.fekkclf....laaa.',
    '7:...icc...i..RR.ia.edbba.edgg...hh.ff',
    '7:bbl.cc..lhhagRRieagk.ieagkff...ddjjj',
    '7:..aiii..ad..bRRdkhbccdkhejj..geff..g',
    '7:gg.jjac.f..achfRRakh.bd.keebd.klliii',
    '7:.aadgg.hhdk.lRRbk.leebccl..iif.jj..f',
    '7:ee.bb.gghj..RRhjf.ac.jf.ac.dd..iii..',
    '7:...ii....ckkRR.c.dhjabbdhjafffeea.gg',
    '8:.ebff..eb.iiRRb..gjj...gc.hhh.c.ddaa',
    '8:..jii.ffj....RRga..e.ga.hebgddhebcc.',
    '8:...dddc..abbcRRa.kffll.kjhieeejhigg.',
    '8:iggbb.i.eejaidRRjafdlkhhf.lk..ccc...',
    '8:bb.hffajjh..a.RRdka.ggdk...eiicc.e..',
    '8:....fe.dd.fe.cRRf.gchhhigc.a.ig..abb',
    '8:.abbbkla.iiklRRh.gjfdhcgjfdhcg..dee.',
    '8:.ffaiibb.adcRR..dce.gghhe..jj.e.kk..',
    '8:chidddchibbkRR.a.kjllaffj..eee...gg.',
    '8:i..bhhif.bjjifaRRmcca.lmed..lkedgggk',
    '9:..eff.ggeikj.RRikjadbilladb.hh.dcc..',
    '9:kmabggkmabeek..RRj.cllijhc..ifhddd.f',
    '9:hhj.....jiikRR.dakegfda.egfdcc.gbb..',
    '9:j.e.ddj.ec..RRec...aac..hi.ff.higgbb',
    '9:ifabhhifabjjiRR.lm.dcclmed...keggg.k',
    '9:...deej..d..jRRd.a..bb.ahi.ff.higgcc',
    '9:k..jjjk.ebffRReb.hgddb.hg..cci.aa..i',
    '9:..ffdicc..di..RRdi.eaaa..e..hh.ebbgg',
    '9:eei.bbggikf.RR.kf.ac.k.hacdd.h.jjj..',
    '9:jdiii.jd.aa.RRek.ghhek.gfbbb..f..cc.',
    '10:k...jjk.egffRReg..d.ehh.dbccci.baa.i',
    '10:dc.hjjdcah..RRah.beea..bi.....iff.gg',
    '10:..jgggd.j.aedRR.ae...chhiffc..i..cbb',
    '10:acjee.acjd..RRjd.i...bbifff....hhgg.',
    '10:..abbb..adeeRR.df.gccdfkg.jiikhhj...',
    '10:b.eee.baa.igRRd.igccd.....jhh...j.ff',
    '10:beee..b.cdaaRRcdkgjj.dkg..i.hh..iff.',
    '10:.diill.d.aa.RRkgebj.kgebj..gcchh..ff',
    '10:..jj....hkkiRRhdaiegfda.egfdcc.gbb..',
    '10:bhhh..bkkdj.RR.dj.e..dcce.aiigffa..g',
    '11:hfaiiihfadeeRR.dmgllbbmgj.kkk.j..cc.',
    '11:...ff...jchhRRjc.....cd.egiidaeg.bba',
    '11:ij.addij.aefRRgaef..ghh.b.gll.bcckk.',
    '11:..eeecggja.cRRjah.dffahkd..iikbb....',
    '11:..bajjf.baddfRRaie.kg.ie.kg.cc.k..hh',
    '11:cc..hgff..hgbRR.hjbiaaajbi.d.j.i.dee',
    '11:ddgg..lmm.bblRRhkfci.hkfci.jjfcaaeee',
    '11:hd.ggghd.iaaeRRi..ebbff...kjjj..k.cc',
    '11:c..fhhc..f..RR.f.a.bb.gaeiddg.eijjkk',
    '11:ghicc.ghi...RRia.ebffadebjjad.......',
    '12:....ff..hcjjRRhcb.aidcbkaidggk.iee..',
    '12:i.egg.i.echh.RRca..j.caf.jdbbf.jd...',
    '12:ehllddehiij.eRR.jck.aggck.ab..fffb..',
    '12:.gggdakk..daRR.j.fbccj.fb.ijee..i.hh',
    '12:.kkcbb...cffRRdce.a.d.ehaijj.h.iggg.',
    '11:h..ccch.ff.aRRb.gaddbeg...jeii..je..',
    '11:..i.hhffijagkRRjagke.j...ebdd..ebcc.',
    '11:gl.djjgledk.RRedka..ebbaf..hh.fii.cc',
    '11:hicckkhi..g.h.RRgfb.ejjfb.ed..aaad..',
    '11:.ff.e..gg.ehbRR.ehbiccc.bi.a...i.add',
    '12:d.gggkd.jc.kRRjcae.hhcaei.ff..ibb...',
    '12:c..lllcbbeki.RRekiddae.hf.ajjhf...gg',
    '12:cjahh.cja...RRag.b.ddg.bi..g..ieeff.',
    '12:..ghhha.g.ddaRRf..ee.f..kjbbbikj.cci',
    '12:.ee.dh....dh.RR.dhcb.aaacbffjjcbiigg',
    '12:dd.bggll.bk.jeRRkajec..aj.ciia.hhfff',
    '12:.ggg.b..jjdbRRfid..kfihhakci..a.c.ee',
    '12:.eb.cc.eb.iiRRbg..fddg.hflkkkh.ljjaa',
    '13:i.jkhhi.jkff.RRka..e..ag.ebddg.ebcc.',
    '13:hkkkllheeeggRR.afbi..afbi..jddcc.j..',
    '13:.ddffh.aabjhRR.bj.ceelkkc..lggcii...',
    '13:.ccc.g.afiigdafRRkdhfjekbh.jekb..jll',
    '13:...hffgejhaagejRRdgi.mmdbi..ckblllck',
    '13:h.aiiih.adeeRR.d...llbbgjfkkkgjf.cc.',
    '13:gbbb..geedf.RRadfjccad.j..k.iihhk...',
    '13:iddd..igg.haRRc.haeecf....bfkkjjbf..',
    '13:bl.fffblaajhRRdejhccde....keii..kgg.',
    '14:.iii.h.cc..hjb.RRfjbkg.fedkg.fedkgaa',
    '14:f.eeelfddhalRR.ha.ggch.ki.cbbki..jj.',
    '14:chhdd.c..bffRRib...eibkj.eggkj..aa..',
    '14:bb.kkjii.flj.RRfl.ahhdeea..dggacc...',
    '14:cc.ffd.eekidRR.ki.abbjlla..jgga...hh',
    '14:...cc...bfhhRRbf..ddb..gejjj.ge.iiaa',
    '14:.bbb.gii..cg.aRRcg.adh..jfdh..jfdhee',
    '14:..ggffccc..jRRhe.jd.he..dbbeaadiiikk',
    '15:jjj...f..d.efRRdaeikkda.i.chhg..cbbg',
    '15:...bbb..aeejRRadfjgccdf.g.kdii..k.hh',
    '15:ii.aa.ee.jhkRR.jhkfggcddf..cbbf..ll.',
    '15:..kkk.bggd..bRRdjfcc.djfh.aiilh.aeel',
    '15:affc..ajjcb.RRhcb..ih....idgg..id.ee',
    '15:j..dd.j.iaeeRRiagc.hbagc.hbkk..hff..',
    '15:.kkkhj.effhjde.RRid.lc.ibglc.ibglcaa',
    '15:a.fggga.fekkiRRe..ijjddh.lbbbh.lcc..',
    '16:aabbk.gg.ek.iRRe.lijjffli..dcc...dhh',
    '16:h.iii.h..f.gRRjf.g..jfbb.ceea..cdda.',
    '16:.jjjbghee.bghakRRcfakd.cflkd.c.l.dii',
    '16:.ellkk.egaabRRgi.b...if.dccif.d.jjhh',
    '16:..bbb..ggj..RRej....ejiia.fddca.fhhc',
    '16:bbhhl.ii.elgRR.e.gaffcdda..cjja.kk..',
    '16:d.leeed.lcc..RRb..fhhbaafjgggk.jii.k',
    '16:.fhhkk.fdd.eRRba.e..bac.iggac.i..jjj',
    '16:.l.kkk.l.ff.RRjhebggjheba.dhcca.dii.',
    '17:bgkki.bgcfi.RRcfha...jha..dj....djee',
    '17:..cddd..c.ggRRb..aeebfhaikkfh.ijjf..',
    '17:.llee...bggfRRbk.fhhbk..cjiii.cjddaa',
    '17:.gggilhcc.ilhbjRRf.bjk.fedjk.fed.kaa',
    '17:djjig.d.aig.RRafec.hbfec.hbf.k...llk',
    '17:jhhca.jiicagRRfc.g.ef....edbb..edkk.',
    '17:fffia.gddia.gRRi.ehhc..ej.cbblj..kkl',
    '17:lleeidff.bidRR.b..jccaa.j..kggj..khh',
    '18:.kaaff.kcbhhRRcb.ej....ejii.dejgggd.',
    '18:kddgjhk.igjhRRi..mealllmeacc.m.ffbb.',
    '18:..fffklc...klcRRae.bbjaeg.hjiig.hjdd',
    '18:hjggaahjfkiiRRfk..e.fcc.e.ll.d..bb.d',
    '18:.g..ff.g.kkcRRjb.ci.jbaai.jhhhdd..ee',
    '17:bbddicjj.gicRR.g..laahh.l..feelkkf..',
    '17:.ddffall.mmakRR.hakicbh.kicbjjgg.eee',
    '17:.d.bb.ed.hhgeRRf.g..afcc..aiiijja...',
    '17:ajj.i.affki.RRek...dek.h.dbggh.dbcc.',
    '18:.j.ggg.jh.ciRRh.ciddh...keeb.akffb.a',
    '18:.hhhbaiff.baiRRj.dll.j.dk.ejcck.egg.',
    '18:.gccje.gakjeRRakfb..dhfb..dh..ii.h..',
    '18:ajjj..a..hff.RRh....dhggccd.ebkkiieb',
    '18:.hikkk.hi...RRig.ejj.g.efcc.baf.ddba',
    '18:.iffcc.i.dd.bRRg..b.hgeek.hjjak.h..a',
    '19:..eee...caagRRcdigkkjdi.b.jdhhbff...',
    '19:..bcccj.bklljRRk..eiffggeiaaad.hh..d',
    '19:..ceeeffch.gRR.h.g.aa.kkmjjbbdmlliid',
    '19:.iii...ff.ebRRhkebjjhk..a.dkcca.dgg.',
    '19:.iddff.i.ll.RRcbhak.cbhakjj..akggeee',
    '19:b.lllgb..hhgi.RRkficcdkf..adjj..adee',
    '19:k.dllgk.de.g.RReji.cccjiabhh.iabffmm',
    '20:ciffddcihgeeRRhg....hllbk.jj.bk..aa.',
    '20:hjggaahjfkiiRRfk....fccde..llde...bb',
    '20:..ckkk..cbjj.RRb...adll.gadiifghheef',
    '20:..kbbbggk.fcRR.jfcaiij..a.ejdd..e.hh',
    '20:.fff.illbc.iRRbc..gg..ddeaakkmehhjjm',
    '20:..kbbbggk..caRRifcahhif...eidd..e.jj',
    '21:bbb..gdda.igRRaci.kkhc..e.hcffe..jj.',
    '21:.ejggdkejc.dkRRcl.kmmmlf..haafiih.bb',
    '21:hhb..d..b.kd.RR.kjgliiijglfmeeccfmaa',
    '21:jjjb.kgglb.kRRl....ee.ccdaaiihd..ffh',
    '21:.bhhhg.bjf.gRRjf....j.aaeii.kde.cckd',
    '21:c..kkkc.fbeeRRfb.j.agddj.agii...llhh',
    '21:..abbbddac.gRR.cig.kkci.e.hff.e.hjj.',
    '22:hhh...iikl.fRRkl.fddbb.mcaaeemcgg.jj',
    '22:hhhj..kkgjebRRgjeb....iia.dcc.a.d.ff',
    '22:k.eeb.k.gabjRRgacj...dci.hfdci.hfdll',
    '22:.cddbbkc.ajjkRRa....ill.f.iggef.ihhe',
    '22:..cgggmmcd.j.RRd.jhhee.afbbllafii.kk',
    '22:..flllddfm.b.RRm.bii.jjgahhccgaee.kk',
    '22:bbbdk.eeadkiRRad.if..cc.f.j.hh..j.gg',
    '23:l..jgglk.jiilkRRdb.aaadb..eccf..ehhf',
    '23:gfffjjghhdda.RRb.accebii..ekkk..lll.',
    '23:.alldd.a.kcceRRk..e.jgghi.jbbhi.j.ff',
    '23:.iii.a.ggkcajRRkc.j.fkbbl.fddel.hh.e',
    '23:iie..lk.e.mlkbRRmd.bcccd..hgaaffhgjj',
    '23:iii..h.b...h.bgRRdaagf.de.gfjje.cc..',
    '24:.iffcc.ikjmhRRkjmheaabbdegg..d....ll',
    '24:.hhhffjkkggajRRb.accdbee..diii.lll..',
    '24:ggg.ch.i..ch.iRR.addkb.aj.kbeej.kff.',
    '24:ddbg..cebgmmceRR.jaalk.j..lkffhhii..',
    '24:.diiff.dbc.eRRbc.eaa.mmkh.gglkhjj.l.',
    '24:..iccc..iehhfRRe.df.jggd.bj.aa.bllkk',
    '24:.jddmm.jkfheRRkfhecllaabcii..b..gg..',
    '25:hhh.ea.g..ea.g.RRkddc..kf.cbiif.cbjj',
    '25:.llljjheekkahRRb.a.ccbii..dfff..dggg',
    '25:.cccgd.iibgdRRfb....fbkka.h.eea.h.jj',
    '25:hhg.mb.ig.mbeiRR.felll.f..dkccaadkjj',
    '25:gghm..ilhmddilRR.keecb.k..cbff.jjaa.',
    '25:a..hh.a.fjbbRRfj...k.jcc.k.ddeiigg.e',
    '26:g.cccfg..e.fRR.eahkjjeahk.dii.bbd...',
    '26:.eeebf.gh.bf.ghRRaiihk.aj..kccj..dd.',
    '26:c..ejjcmmebkRRd.bkaadfhlgggfhl...ii.',
    '26:.gg.cd.ah.cdeahRRke.fffk..lijjbblimm',
    '25:iiikke...lceRRflc.hhfjjga.bb.ga..ddd',
    '25:..kkkiaadf.iRRdf..hllggbhccjjbee....',
    '26:ggg..jhhek.jRRek.fabbiifa.llcc.ddmm.',
    '26:bii.mablc.ma.lcRRj..hhhj..dfkkeedfgg',
    '26:lhhj..l.gjiiRRgj...effdk.eccdk.bbaa.',
    '26:h.gjj.h.gellRR.e...c.edd.ckkbfiiaabf',
    '27:j.kk..j.fillRRfi...c.idd.chhbeggaabe',
    '27:d...kkd...bbRRefclaaefclhhhgim.jjgim',
    '27:bkkk..b.ggjfRRadjfh.adcchiid.lee...l',
    '27:g..hh.g..fiiRRdf...adfbb.aeelckkjjlc',
    '28:..abbbddacig.RRcige.hcjje.h.ff...kk.',
    '28:.kkkjj.ggaahRRcd.hbbcdeef..lllf..iii',
    '28:jjjkk...e.ccRRe.hdggaahdb...iib..ff.',
    '29:c.jjjicbb..ifRR.lhfddelh..aekkggae..',
    '29:.jjj.laam.clRRmhcf.eehdfgbbid.g..ikk',
    '29:ggghebl..heblRRjk.ffajkd..accd..ii..',
    '29:..efffiie.kbRRdhkba.dhggacch...jj...',
    '30:.bbbf...aafjRR.dlj.ccdl.k.gieek.gihh',
    '30:fff.ll..ic.gRRic.gahheeja.kkdjbbb.d.',
    '30:.gggjjhhid.bRRid.bcc.dlla.ffe.a.kke.',
    '30:eee.mkiiglmkRRglbh..ffbhj..caaj..cdd',
    '31:l.g.hhl.gmjj.RRmkabb.dkafffdci.ee.ci',
    '31:kkkggd..eh.dRReh.f.iillfa.bbj.acccj.',
    '31:.aa.cdhek.cdhekRRgiik..gl..fbblmmfjj',
    '32:iiigg...eh.dRReh.da.jjlla.bbkfccc.kf',
    '32:b..ee.b.chiiRRchmf.aakmfdddklg..jjlg',
    '32:..ghhhkkgj.baRRjebaiije...d.ccffd...',
    '32:.cccfkll.efk.RReai.ggbaid.hbmmd.h.jj',
    '33:..hiiiffhk..aRRke.ajjke...dccbggd..b',
    '33:a.kkbba.h..lRRh..l.eeffgjjjcdgii.cd.',
    '33:.bddhh.bi...RRi..gceekkgcjjamflllamf',
    '33:jjjhhd..ei.dRRei..a.kkgga.bblfccc.lf',
    '34:cccbbeggfa.eRRfa..iddahhikk.j.ll..j.',
    '34:.ejjimceh.imc.hRRkbbhd.kf..dggfllaa.',
    '34:ddd..bcc.ikb.RRikhfeej.hf.ajggllamm.',
    '34:..fh....fhccRR.dkliaadklibbbej..ggej',
    '35:bbbjfhgeejfhg.RRdkiia.dk..amll.ccm..',
    '35:jjj..g...hhgcRRldfcaaldf..bmeekkbmii',
    '35:bbbkgi.ffkgi.RRde.hjjde.h.ammlcca..l',
    '36:...gee..igjjRRifbcdaafbcdkkkmlhh..ml',
    '36:jjjeed..l..dRRl..kaggiikabbfh.cccfh.',
    '36:..ejll..ejbbRR.cghiaacghikkkdm..ffdm',
    '36:mffflbmkkglbRR.gjdeea.jd..aicc...ihh',
    '37:...kcc..hkeeRRhfjdlaafjdlbbbgm..iigm',
    '37:...jcc..kjeeRRkdab.ggdabihhhlfi.mmlf',
    '37:ddd.lbfccjlbfRRj.ieeak.i..akgg.mm.hh',
    '37:heeekihgg.ki.RRjbfllmjbf..mcaadd.c..',
    '38:.kkkcf.aahcfRR.hd.g.eed.g.ijbbllij..',
    '38:iiifjj..lfkkRRlf.cbeeaacb.hhg.dd..g.',
    '38:.bbbheii.fhecRRfj.ckk.j...agddllag..',
    '39:.lllg...hhgdRR.eidbjjei.b.afcckkaf..',
    '39:dcccibdjjgib.RRgkf..mmkf..aheellah..',
    '39:.hhheb.ffiebmRRildmgg.ld..akccjjak..',
    '39:fhhh.ef.jj.eRRcikmbbcikm...allgg.add',
    '40:jjj.ciaa.gciRR.gdmekk.dme.lfbbhhlf..',
    '40:.dddik.hhmikRR.mgcjllfgcj.afbbeea...',
    '40:jjjl..chhl.gcRRmdgaabmd...beefkkii.f',
    '40:bbb.giff..giRR.kelhjjkelh.admmccad..',
    '41:d.lllhdjji.hRRciegbbcaeg...aff.mmkk.',
    '41:.gggbf..kkbfRR.lcjmhhlcjm.idaaeeid..'
  ];

  const U_PACKS = [
    { name: 'Beginner', sub: 'Gentle slides · 2-7 moves', hue: 40 },
    { name: 'Intermediate', sub: 'Plan two steps ahead · 6-12 moves', hue: 28 },
    { name: 'Advanced', sub: 'Traffic jams · 11-18 moves', hue: 14 },
    { name: 'Expert', sub: 'Deep puzzles · 17-26 moves', hue: 350 },
    { name: 'Grandmaster', sub: 'Brutal · up to 41 moves', hue: 320 }
  ].map((p, i) => ({ ...p, n: 60, from: i * 60 }));
  const uParse = s => {
    const [d, g] = s.split(':'), cells = {}, order = ['R'];
    for (let i = 0; i < 36; i++) { const ch = g[i]; if (ch === '.') continue; if (!cells[ch]) { cells[ch] = []; if (ch !== 'R') order.push(ch); } cells[ch].push(i); }
    const bl = order.map(ch => {
      const cs = cells[ch], h = cs.length > 1 ? (cs[1] - cs[0] === 1 ? 1 : 0) : 1;
      return { h, fixed: h ? (cs[0] / 6 | 0) : cs[0] % 6, len: cs.length, pos: h ? cs[0] % 6 : (cs[0] / 6 | 0), red: ch === 'R' };
    });
    return { d: +d, bl };
  };
  const uLevel = (pi, li) => uParse(U_DATA[U_PACKS[pi].from + li]);
  const uOcc = (bl, p, skip = -1) => {
    const o = new Int8Array(36).fill(-1);
    for (let i = 0; i < bl.length; i++) {
      if (i === skip) continue;
      const b = bl[i];
      for (let k = 0; k < b.len; k++) o[b.h ? b.fixed * 6 + p[i] + k : (p[i] + k) * 6 + b.fixed] = i;
    }
    return o;
  };
  function uSolve(bl, start, cap = 800000) {
    const n = bl.length, key = p => { let k = 0; for (let i = 0; i < n; i++) k = k * 6 + p[i]; return k; };
    const seen = new Map([[key(start), null]]);
    let level = [start];
    if (start[0] === 4) return { path: [], states: 1 };
    while (level.length && seen.size < cap) {
      const next = [];
      for (const p of level) {
        const o = uOcc(bl, p), pk = key(p);
        for (let i = 0; i < n; i++) {
          const b = bl[i];
          for (const dir of [-1, 1]) {
            let q = p[i];
            for (;;) {
              const f = dir < 0 ? q - 1 : q + b.len;
              if (f < 0 || f > 5) break;
              if (o[b.h ? b.fixed * 6 + f : f * 6 + b.fixed] >= 0) break;
              q += dir;
              const np = p.slice(); np[i] = q;
              const k = key(np);
              if (seen.has(k)) continue;
              seen.set(k, [pk, i, q]);
              if (i === 0 && q === 4) {
                const path = [];
                let cur = k;
                while (seen.get(cur)) { const [qk, bi, bp] = seen.get(cur); path.push([bi, bp]); cur = qk; }
                return { path: path.reverse(), states: seen.size };
              }
              next.push(np);
            }
          }
        }
      }
      level = next;
    }
    return null;
  }

  const U_WOOD = [['#e9b86c', '#c98e45'], ['#dba85e', '#b97c36'], ['#efc880', '#d09a52'], ['#d29a55', '#ad7032'], ['#e2b06a', '#c0853f'], ['#f0cf8f', '#d6a35d']];
  function uDrawBlock(ctx, x, y, w, h, bi, horiz, red, lifted, glow) {
    const r = Math.min(w, h) * .2;
    ctx.save();
    ctx.shadowColor = `rgba(40,20,0,${lifted ? .5 : .32})`; ctx.shadowBlur = lifted ? 22 : 9; ctx.shadowOffsetY = lifted ? 9 : 4;
    rr(ctx, x, y, w, h, r);
    const g = ctx.createLinearGradient(x, y, x + (horiz ? 0 : w), y + (horiz ? h : 0));
    const [a, b] = red ? ['#f0575c', '#b81f2b'] : U_WOOD[bi % U_WOOD.length];
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5; ctx.strokeStyle = red ? '#7d1019' : '#8a5a26'; ctx.stroke();
    ctx.save();
    rr(ctx, x, y, w, h, r); ctx.clip();
    if (!red) {
      ctx.strokeStyle = 'rgba(110,62,18,.2)'; ctx.lineWidth = 1.4;
      const n = 5;
      for (let k = 0; k < n; k++) {
        const t = (k + .6 + ((bi * 37 + k * 13) % 10) / 20) / (n + .6);
        ctx.beginPath();
        if (horiz) { const yy = y + h * t; ctx.moveTo(x, yy); for (let s = 0; s <= 8; s++) ctx.lineTo(x + w * s / 8, yy + Math.sin(s * .9 + bi + k) * 2.2); }
        else { const xx = x + w * t; ctx.moveTo(xx, y); for (let s = 0; s <= 8; s++) ctx.lineTo(xx + Math.sin(s * .9 + bi + k) * 2.2, y + h * s / 8); }
        ctx.stroke();
      }
    }
    const ins = Math.min(w, h) * .13;
    rr(ctx, x + ins, y + ins, w - ins * 2, h - ins * 2, r * .6);
    ctx.fillStyle = red ? 'rgba(255,255,255,.10)' : 'rgba(255,240,200,.18)'; ctx.fill();
    ctx.strokeStyle = red ? 'rgba(90,0,10,.35)' : 'rgba(110,62,18,.35)'; ctx.lineWidth = 1.8; ctx.stroke();
    const hl = ctx.createLinearGradient(x, y, x, y + h);
    hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(.35, 'rgba(255,255,255,0)'); hl.addColorStop(1, 'rgba(0,0,0,.14)');
    ctx.fillStyle = hl; ctx.fillRect(x, y, w, h);
    ctx.restore();
    if (red) {
      const cx = x + w / 2, cy = y + h / 2, s = Math.min(w, h) * .22;
      ctx.fillStyle = 'rgba(255,255,255,.88)';
      ctx.beginPath(); ctx.moveTo(cx - s * .2, cy - s * .75); ctx.lineTo(cx + s * 1.0, cy); ctx.lineTo(cx - s * .2, cy + s * .75); ctx.lineTo(cx - s * .2, cy + s * .3); ctx.lineTo(cx - s * 1.1, cy + s * .3); ctx.lineTo(cx - s * 1.1, cy - s * .3); ctx.lineTo(cx - s * .2, cy - s * .3); ctx.closePath(); ctx.fill();
    }
    if (glow) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = glow; ctx.lineWidth = 4; ctx.shadowColor = glow; ctx.shadowBlur = 16; ctx.stroke(); }
    ctx.restore();
  }
  function uThumb(lv, size) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), cs = size / 6;
    x.fillStyle = '#e7cfa2'; x.fillRect(0, 0, size, size);
    lv.bl.forEach((b, i) => {
      x.fillStyle = b.red ? '#d9333f' : U_WOOD[i % U_WOOD.length][1];
      const px = (b.h ? b.pos : b.fixed) * cs + 1.5, py = (b.h ? b.fixed : b.pos) * cs + 1.5;
      rr(x, px, py, (b.h ? b.len : 1) * cs - 3, (b.h ? 1 : b.len) * cs - 3, cs * .22); x.fill();
    });
    return c;
  }
  const UNBLOCK_CSS = hubCss('unblock-me', '#c9822f', '#a8671d') + `
.gm-unblock-me .pk-art{background:linear-gradient(145deg,#f3dcae,#e0b673)!important}
.gm-unblock-me .pk-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:4px}
.gm-unblock-me .g-canvas{background:#b98a52;border-radius:18px;box-shadow:0 22px 44px -22px rgba(70,40,10,.8),0 0 0 2px #8a6030}
.gm-unblock-me .lb-t canvas{image-rendering:auto;opacity:.92}
.gm-unblock-me .lb:has(.lb-t){background:#e7cfa2}
.gm-unblock-me .lb-u{color:#7a5328}
`;
  Ameplay.register({
    id: 'unblock-me',
    title: 'Unblock Me',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' solved',
    width: 760,
    blurb: 'Slide the wooden blocks out of the way and free the red block through the exit on the right.',
    help: 'Drag a block along its length · free the red block · fewer moves earn more stars · <kbd>Z</kbd> undo · <kbd>H</kbd> hint · <kbd>R</kbd> restart · keyboard: <kbd>Tab</kbd> picks a block, arrows slide it',
    icon: ICON('<rect x="8" y="8" width="48" height="48" rx="6"/><rect x="14" y="26" width="22" height="12" rx="3" fill="currentColor"/><rect x="40" y="14" width="10" height="22" rx="3"/><rect x="14" y="14" width="22" height="8" rx="3"/><rect x="40" y="42" width="10" height="8" rx="3"/><path d="M58 32h4"/>'),
    tint: '#c9822f',
    css: UNBLOCK_CSS,
    mount(root, api) {
      const snd = makeSnd(api);
      const save = api.load() || {};
      save.done = save.done || {};
      const persist = () => api.save(save);
      const keyOf = (p, l) => p * 100 + l;
      const solvedCount = () => Object.keys(save.done).length;
      const packDone = pi => { let d = 0; for (let i = 0; i < U_PACKS[pi].n; i++) if (save.done[keyOf(pi, i)]) d++; return d; };
      const nextOpen = () => { for (let p = 0; p < U_PACKS.length; p++) { if (p && packDone(p - 1) < 10) break; for (let i = 0; i < U_PACKS[p].n; i++) if (!save.done[keyOf(p, i)]) return [p, i]; } return [0, 0]; };
      const hub = makeHub(api, root, {
        title: 'Unblock Me', blurb: 'Slide the blocks to clear a path for the red one. Every level is solvable, and the minimum move count is shown.',
        packs: U_PACKS.map(p => ({ name: p.name, sub: p.sub, n: p.n, hue: p.hue })),
        packLock: pi => pi && packDone(pi - 1) < 10 ? `Solve 10 in ${U_PACKS[pi - 1].name}` : '',
        packArt: pi => `<img alt="" src="${uThumb(uLevel(pi, 30), 140).toDataURL()}">`,
        thumb: (pi, li) => uThumb(uLevel(pi, li), 96),
        info: (pi, li) => { const d = save.done[keyOf(pi, li)]; return { done: !!d, stars: d ? d.s : 0, thumb: !!d, sub: d ? '' : `${uLevel(pi, li).d} moves`, cur: save.last && save.last[0] === pi && save.last[1] === li }; },
        resume: () => { const [p, i] = save.last && !save.done[keyOf(save.last[0], save.last[1])] ? save.last : nextOpen(); return { label: `Continue · ${U_PACKS[p].name} #${i + 1}`, go: () => open(p, i) }; },
        open: (p, i) => open(p, i)
      });

      const Z = 640, FW = 20, CS = 92, OX = (Z - CS * 6) / 2, OY = (Z - CS * 6) / 2;
      const scr = el('div', 'gscreen'); scr.hidden = true;
      scr.innerHTML = `<div class="top"><button type="button" class="g-btn ghost sm" data-a="levels">${I_GRID}Levels</button><div class="nm"><span class="ttl">Unblock</span><small class="sub"></small></div><div class="g-hud">${stat('Moves', '0', 'mv')}${stat('Min', '0', 'mn')}${stat('Best', '–', 'bs')}</div></div>`;
      const { canvas, ctx, toLocal } = api.canvas(Z, Z, scr);
      canvas.style.touchAction = 'none';
      const tools = el('div', 'tools', `<button type="button" class="g-btn ghost sm" data-a="undo">${I_UNDO}Undo</button><button type="button" class="g-btn ghost sm" data-a="hint">${I_BULB}Hint</button><button type="button" class="g-btn ghost sm" data-a="reset">${I_RESET}Restart</button>`);
      scr.append(tools); root.append(scr);
      const $ = s => scr.querySelector(s);
      const mvV = $('.mv .v'), mnV = $('.mn .v'), bsV = $('.bs .v'), ttl = $('.ttl'), sub = $('.sub'), undoB = $('[data-a="undo"]');

      const fx = particles();
      let pi = 0, li = 0, lv, bl = [], cur = [], vp = [], tgt = [], moves = 0, hist = [], drag = null, solved = false, winT = -1, hinted = false, hintBlk = -1, hintT = 0, hintTo = 0, time = 0, kbSel = -1, kbRun = null, hov = -1, exitT = 0;

      function hud() {
        mvV.textContent = moves; mnV.textContent = lv ? lv.d : 0;
        const d = save.done[keyOf(pi, li)];
        bsV.textContent = d ? d.m : '–';
        undoB.disabled = !hist.length || solved;
        api.score(solvedCount() || '—');
      }
      function open(p, i) {
        pi = p; li = i; lv = uLevel(p, i); bl = lv.bl;
        cur = bl.map(b => b.pos); vp = cur.slice(); tgt = cur.slice();
        moves = 0; hist = []; drag = null; solved = false; winT = -1; hinted = false; hintBlk = -1; kbSel = -1; kbRun = null; hov = -1; exitT = 0; fx.list.length = 0;
        save.last = [p, i]; persist();
        ttl.textContent = `${U_PACKS[p].name} · #${i + 1}`;
        sub.textContent = `${bl.length} blocks`;
        hub.hide(); scr.hidden = false; scr.style.animation = 'none'; void scr.offsetWidth; scr.style.animation = ''; reveal(scr);
        hud(); snd.resume();
      }
      function toHub() { scr.hidden = true; hub.show(pi); }
      const range = i => {
        const b = bl[i], o = uOcc(bl, cur, i);
        let lo = cur[i], hi = cur[i];
        const at = q => o[b.h ? b.fixed * 6 + q : q * 6 + b.fixed];
        while (lo - 1 >= 0 && at(lo - 1) < 0) lo--;
        while (hi + b.len <= 5 && at(hi + b.len) < 0) hi++;
        return [lo, hi];
      };
      const knock = (v = 1) => {
        snd.noise(.09, .08 * v, 500, 160, 1.2, 0, 'lowpass');
        snd.tone(150, .09, 'sine', .09 * v, 70);
        snd.tone(1100, .03, 'triangle', .03 * v, 700);
      };
      function commit(snapPos) {
        hist.push({ cur: snapPos, moves }); if (hist.length > 200) hist.shift();
        moves++; hintBlk = -1;
        hud();
        if (cur[0] === 4) win();
      }
      function win() {
        solved = true; winT = 0; exitT = 0; tgt[0] = 6.4;
        const s = moves <= lv.d && !hinted ? 3 : moves <= Math.ceil(lv.d * 1.5) ? 2 : 1;
        const k = keyOf(pi, li), old = save.done[k];
        save.done[k] = { m: old ? Math.min(old.m, moves) : moves, s: Math.max(s, old ? old.s : 0), d: lv.d };
        persist(); hud();
        snd.noise(.5, .07, 400, 2400, 1.1, .05);
        snd.fanfare();
        api.submit(solvedCount());
        for (let t = 0; t < 4; t++) api.timeout(() => fx.burst(Z * (.2 + Math.random() * .6), Z * (.25 + Math.random() * .4), 26, ['#f0575c', '#f6c453', '#fff3c4', '#e9b86c', '#ffffff'], 320, 1.3, 5, 380), 250 + t * 220);
        api.timeout(() => {
          if (!solved) return;
          const nxt = li + 1 < U_PACKS[pi].n ? [pi, li + 1] : (pi + 1 < U_PACKS.length && packDone(pi) >= 10 ? [pi + 1, 0] : null);
          api.overlay({
            kicker: `${U_PACKS[pi].name} · #${li + 1}`, title: s === 3 ? 'Perfectly freed!' : 'Free at last!', text: moves <= lv.d ? 'You matched the minimum number of moves.' : `The minimum for this puzzle is ${lv.d} moves.`,
            stats: [['Moves', moves], ['Minimum', lv.d], ['Stars', '★'.repeat(s) + '☆'.repeat(3 - s)]],
            button: nxt ? 'Next level' : 'Levels', secondary: nxt ? 'Levels' : null,
            onAction: () => nxt ? open(nxt[0], nxt[1]) : toHub(), onSecondary: toHub
          });
        }, 1900);
      }
      const flushKb = () => { kbRun = null; };
      function undo() {
        flushKb();
        if (solved || !hist.length) return;
        const s = hist.pop();
        cur = s.cur.slice(); tgt = cur.slice(); moves = s.moves; hintBlk = -1;
        snd.tone(330, .09, 'triangle', .06, 220); hud();
      }
      function reset() {
        flushKb();
        if (solved || (!hist.length && !drag)) return;
        hist.push({ cur: cur.slice(), moves });
        cur = bl.map(b => b.pos); tgt = cur.slice(); moves = 0; hintBlk = -1;
        snd.noise(.3, .06, 2000, 300, 1); hud();
      }
      function hint() {
        flushKb();
        if (solved || drag) return;
        const r = uSolve(bl, cur);
        if (!r || !r.path.length) return;
        const [i, q] = r.path[0];
        hinted = true; hintBlk = i; hintTo = q; hintT = 3;
        snd.arp([79, 84], .06, 'sine', .06, .3);
      }
      const blockAt = p => {
        const cx = Math.floor((p.x - OX) / CS), cy = Math.floor((p.y - OY) / CS);
        if (cx < 0 || cy < 0 || cx > 5 || cy > 5) return -1;
        return uOcc(bl, cur)[cy * 6 + cx];
      };
      api.on(canvas, 'pointerdown', e => {
        if (e.button || solved) return;
        snd.resume();
        const p = toLocal(e), i = blockAt(p);
        if (i < 0) return;
        e.preventDefault();
        flushKb();
        try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
        const b = bl[i], ax = b.h ? p.x - OX : p.y - OY;
        const [lo, hi] = range(i);
        drag = { i, lo, hi, grab: ax - vp[i] * CS, start: cur.slice(), last: cur[i] };
        kbSel = i;
        snd.tone(520, .05, 'sine', .04, 600);
      });
      api.on(canvas, 'pointermove', e => {
        const p = toLocal(e);
        if (!drag) { hov = solved ? -1 : blockAt(p); canvas.style.cursor = hov >= 0 ? 'grab' : ''; return; }
        const b = bl[drag.i], ax = b.h ? p.x - OX : p.y - OY;
        const q = clamp((ax - drag.grab) / CS, drag.lo, drag.hi);
        vp[drag.i] = q; tgt[drag.i] = q;
        const n = Math.round(q);
        if (n !== drag.last) { drag.last = n; snd.tone(980 + (n % 3) * 90, .025, 'triangle', .035, 0); }
      });
      const release = () => {
        if (!drag) return;
        const d = drag; drag = null;
        const n = clamp(Math.round(vp[d.i]), d.lo, d.hi);
        cur[d.i] = n; tgt[d.i] = n;
        if (n !== d.start[d.i]) { knock(); commit(d.start); }
        else snd.tone(300, .05, 'sine', .03, 0);
      };
      api.on(window, 'pointerup', release);
      api.on(window, 'pointercancel', release);
      press(api, scr, '[data-a]', b => {
        api.sfx('tap');
        const a = b.dataset.a;
        if (a === 'levels') toHub(); else if (a === 'undo') undo(); else if (a === 'hint') hint(); else if (a === 'reset') reset();
      });
      api.on(window, 'keydown', e => {
        if (scr.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'z') { undo(); return; }
        if (k === 'h') { hint(); return; }
        if (k === 'r') { reset(); return; }
        if (solved) return;
        if (k === 'tab' || k === ' ' || k === 'n') {
          e.preventDefault(); flushKb();
          kbSel = (kbSel + (e.shiftKey ? bl.length - 1 : 1)) % bl.length;
          snd.tone(660, .05, 'sine', .04, 0);
          return;
        }
        const dir = { arrowleft: ['h', -1], arrowright: ['h', 1], arrowup: ['v', -1], arrowdown: ['v', 1], a: ['h', -1], d: ['h', 1], w: ['v', -1], s: ['v', 1] }[k];
        if (!dir) return;
        e.preventDefault();
        if (kbSel < 0) kbSel = 0;
        const i = kbSel;
        if (!!bl[i].h !== (dir[0] === 'h')) {
          snd.tone(140, .08, 'square', .03, 100);
          return;
        }
        const [lo, hi] = range(i), n = clamp(cur[i] + dir[1], lo, hi);
        if (n === cur[i]) { snd.tone(140, .08, 'square', .03, 100); return; }
        if (!kbRun || kbRun.i !== i) { hist.push({ cur: cur.slice(), moves }); moves++; hintBlk = -1; kbRun = { i, t: 0 }; }
        kbRun.t = 0; cur[i] = n; tgt[i] = n;
        snd.tone(980, .03, 'triangle', .04, 0); knock(.5);
        hud();
        if (cur[0] === 4) win();
      });

      function draw(dt) {
        time += dt;
        const k = 1 - Math.exp(-dt * 22);
        for (let i = 0; i < bl.length; i++) {
          if (drag && drag.i === i) continue;
          const d = tgt[i] - vp[i];
          vp[i] = Math.abs(d) < .002 ? tgt[i] : vp[i] + d * (solved && i === 0 ? 1 - Math.exp(-dt * 5) : k);
        }
        if (kbRun && (kbRun.t += dt) > .7) kbRun = null;
        if (hintT > 0) { hintT -= dt; if (hintT <= 0) hintBlk = -1; }
        ctx.clearRect(0, 0, Z, Z);
        const bg = ctx.createLinearGradient(0, 0, Z, Z);
        bg.addColorStop(0, '#c99a60'); bg.addColorStop(1, '#a87a45');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, Z, Z);
        ctx.strokeStyle = 'rgba(90,52,16,.12)'; ctx.lineWidth = 1.5;
        for (let q = 0; q < 26; q++) { const y = q * 26 + 6; ctx.beginPath(); ctx.moveTo(0, y); for (let s = 0; s <= 10; s++) ctx.lineTo(Z * s / 10, y + Math.sin(s * .8 + q) * 3); ctx.stroke(); }
        const bx = OX - FW, by = OY - FW, bw = CS * 6 + FW * 2;
        ctx.save();
        ctx.shadowColor = 'rgba(40,20,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
        rr(ctx, bx, by, bw, bw, 24);
        const fg = ctx.createLinearGradient(bx, by, bx + bw, by + bw);
        fg.addColorStop(0, '#7a4a22'); fg.addColorStop(1, '#4f2d12');
        ctx.fillStyle = fg; ctx.fill();
        ctx.restore();
        rr(ctx, bx + 3, by + 3, bw - 6, bw - 6, 21); ctx.strokeStyle = 'rgba(255,220,160,.25)'; ctx.lineWidth = 2; ctx.stroke();
        const ex = OX + CS * 6, ey = OY + CS * 2;
        ctx.save();
        rr(ctx, OX - 6, OY - 6, CS * 6 + 12, CS * 6 + 12, 12); ctx.fillStyle = '#e8d1a4'; ctx.fill();
        ctx.fillStyle = '#e8d1a4'; ctx.fillRect(ex - 6, ey + 6, FW + 8, CS - 12);
        const fl = ctx.createLinearGradient(0, OY, 0, OY + CS * 6);
        fl.addColorStop(0, 'rgba(255,255,255,.18)'); fl.addColorStop(1, 'rgba(120,70,20,.16)');
        ctx.fillStyle = fl; ctx.fillRect(OX, OY, CS * 6, CS * 6);
        ctx.strokeStyle = 'rgba(120,76,28,.22)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let q = 1; q < 6; q++) { ctx.moveTo(OX + q * CS, OY); ctx.lineTo(OX + q * CS, OY + CS * 6); ctx.moveTo(OX, OY + q * CS); ctx.lineTo(OX + CS * 6, OY + q * CS); }
        ctx.stroke();
        ctx.restore();
        const pulse = .5 + Math.sin(time * 4) * .5;
        ctx.fillStyle = `rgba(255,255,255,${.55 + pulse * .35})`;
        const ax = ex + FW / 2 + 2 + pulse * 3, ay = ey + CS / 2;
        ctx.beginPath(); ctx.moveTo(ax - 7, ay - 12); ctx.lineTo(ax + 8, ay); ctx.lineTo(ax - 7, ay + 12); ctx.closePath(); ctx.fill();
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, Z, Z); ctx.clip();
        const order = bl.map((_, i) => i).sort((a, b) => ((drag && drag.i === a) - (drag && drag.i === b)) || (a === 0) - (b === 0));
        for (const i of order) {
          const b = bl[i], p = vp[i], x = b.h ? OX + p * CS : OX + b.fixed * CS, y = b.h ? OY + b.fixed * CS : OY + p * CS;
          const w = (b.h ? b.len : 1) * CS, h = (b.h ? 1 : b.len) * CS, g = 4;
          const lift = drag && drag.i === i;
          let alpha = 1;
          if (i === 0 && solved && p > 4.2) alpha = clamp(1 - (p - 4.2) / 2, 0, 1);
          ctx.globalAlpha = alpha;
          const glow = hintBlk === i ? `rgba(255,255,255,${.6 + Math.sin(time * 9) * .35})` : (kbSel === i && !solved && !drag ? 'rgba(255,255,255,.55)' : null);
          uDrawBlock(ctx, x + g, y + g, w - g * 2, h - g * 2, i, b.h, b.red, lift || (hov === i && !drag), glow);
          ctx.globalAlpha = 1;
        }
        if (hintBlk >= 0) {
          const b = bl[hintBlk], p = hintTo, a = 0.35 + Math.sin(time * 7) * .2;
          const x = b.h ? OX + p * CS : OX + b.fixed * CS, y = b.h ? OY + b.fixed * CS : OY + p * CS, w = (b.h ? b.len : 1) * CS, h = (b.h ? 1 : b.len) * CS;
          rr(ctx, x + 6, y + 6, w - 12, h - 12, 14);
          ctx.setLineDash([10, 8]); ctx.lineDashOffset = -time * 30; ctx.strokeStyle = `rgba(255,255,255,${.6 + a})`; ctx.lineWidth = 3.5; ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.restore();
        fx.step(dt); fx.draw(ctx);
      }
      api.loop(dt => {
        if (scr.hidden) return;
        if (winT >= 0) winT += dt;
        draw(dt);
      });
      return {};
    }
  });
})();
