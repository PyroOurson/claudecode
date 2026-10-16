
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const damp = (a, b, k, dt) => b + (a - b) * Math.exp(-k * dt);
  const wrapA = a => ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const ID = 'bean-royale', G = '.gm-' + ID;

  const CFG = {
    step: 1 / 120, gravity: 30, jumpV: 11.5, coyote: 0.1, jumpBuf: 0.14, maxFall: 38,
    runSpeed: 8.2, accelGround: 40, accelAir: 14, decelGround: 36, turnRate: 12,
    diveSpeed: 11.2, diveUp: 4.6, diveAirUp: 3.2, diveSlide: 0.5, getUp: 0.38,
    ragdollMin: 1.2, hitMin: 3.2, hitKnock: 1.15, hitUp: 4.6,
    radius: 0.48, height: 1.55, slopeSlide: 0.85, push: 0.55,
    hexDelay: 1.0, hexDrop: 0.7, respawnDelay: 0.9,
    players: 20, quota: [0.75, 0.67, 0.5],
    camDist: 8.5, camPitch: 0.36, camLook: 1.5, raceTime: 150, hexTime: 90, finalTime: 240,
    slimeDelay: 8, slimeRate: 0.38
  };

  const PAL = ['#ff6fae', '#4fc3ff', '#8be04e', '#ffd23f', '#ff9442', '#a678ff', '#3fe0c5', '#ff5a6e', '#f2efff', '#5b7cff'];
  const PATS = ['Solid', 'Stripes', 'Dots', 'Split', 'Stars'];
  const HATS = ['None', 'Beanie', 'Cat', 'Bunny', 'Party', 'Viking', 'Propeller', 'Chef', 'Antenna', 'Bow', 'Phones'];
  const NA = ['Jelly', 'Wobble', 'Bouncy', 'Squishy', 'Giggle', 'Noodle', 'Puddle', 'Bubble', 'Sprinkle', 'Tumble', 'Fizzy', 'Doodle', 'Marsh', 'Pickle', 'Waffle', 'Gummy'];
  const NB = ['bean', 'bop', 'toes', 'loo', 'kins', 'pants', 'muffin', 'berry', 'nugget', 'zilla', 'face', 'drop', 'bun', 'wig'];
  const botName = used => { for (let i = 0; i < 40; i++) { const n = pick(NA) + pick(NB); if (!used.has(n)) { used.add(n); return n; } } return 'Bean' + used.size; };

  const OL = c => `text-shadow:0 .07em 0 ${c},.05em 0 0 ${c},-.05em 0 0 ${c},0 -.05em 0 ${c},.04em .045em 0 ${c},-.04em .045em 0 ${c},.04em -.04em 0 ${c},-.04em -.04em 0 ${c},0 .14em .12em rgba(20,8,60,.35)`;
  const CSS = `
${G} .stage{position:relative;max-width:100%;border-radius:var(--r);overflow:hidden;container-type:inline-size;touch-action:none;background:#8fd8ff;box-shadow:0 22px 44px -30px rgba(31,29,43,.6);font-family:var(--sans);-webkit-user-select:none;user-select:none;color:#fff}
${G} .stage .g-canvas{border-radius:0;display:block;width:100%;height:100%;background:#8fd8ff}
${G} [hidden]{display:none!important}
${G} .ol{${OL('#2a1660')}}
${G} .hud{position:absolute;inset:0;pointer-events:none;font-size:clamp(11px,1.8cqw,18px)}
${G} .qual{position:absolute;left:50%;top:2.2%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;line-height:1}
${G} .qual b{font-weight:900;font-size:2.6em;letter-spacing:-.02em;font-variant-numeric:tabular-nums;${OL('#2a1660')}}
${G} .qual span{margin-top:.25em;padding:.3em .9em;border-radius:99px;background:linear-gradient(#ff5fb0,#e8358f);font-weight:900;font-size:.82em;letter-spacing:.08em;box-shadow:0 .2em 0 #a01d63}
${G} .qual span.sv{background:linear-gradient(#4fc3ff,#2b8fe0);box-shadow:0 .2em 0 #1a5fa8}
${G} .qual span.fn{background:linear-gradient(#ffd23f,#f2a100);box-shadow:0 .2em 0 #a86a00;color:#5a2d00}
${G} .tl{position:absolute;left:2.2%;top:2.6%;display:flex;flex-direction:column;gap:.3em;align-items:flex-start}
${G} .tl b{font-weight:900;font-size:1.25em;${OL('#2a1660')}}
${G} .chip{padding:.25em .7em;border-radius:99px;background:rgba(42,22,96,.55);font-weight:900;font-size:.75em;letter-spacing:.1em}
${G} .tr{position:absolute;right:2.2%;top:2.4%;display:flex;gap:.5em;align-items:center}
${G} .tm{font-weight:900;font-size:1.6em;font-variant-numeric:tabular-nums;${OL('#2a1660')}}
${G} .pz{pointer-events:auto;width:2.6em;height:2.6em;min-width:40px;min-height:40px;border:0;border-radius:.8em;background:rgba(42,22,96,.55);color:#fff;font:900 1em var(--sans);cursor:pointer;display:grid;place-items:center}
${G} .pz i{display:block;width:.9em;height:1em;border-left:.3em solid #fff;border-right:.3em solid #fff;box-sizing:border-box}
${G} .big{position:absolute;left:0;right:0;top:34%;text-align:center;font-weight:900;font-size:7em;line-height:1;letter-spacing:-.02em;opacity:0;${OL('#2a1660')}}
${G} .big.show{animation:br-pop 1s var(--spring) both}
${G} .big.hold{animation:br-pop2 2.6s var(--spring) both}
${G} .big.q{color:#ffe14d}${G} .big.e{color:#ff5f8f}${G} .big.w{color:#ffe14d}
@keyframes br-pop{0%{opacity:0;transform:scale(2.2)}18%{opacity:1;transform:scale(1)}75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}
@keyframes br-pop2{0%{opacity:0;transform:scale(.3) rotate(-8deg)}12%{opacity:1;transform:scale(1.08) rotate(2deg)}20%{transform:scale(1) rotate(-1deg)}88%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.2)}}
${G} .hint{position:absolute;left:50%;bottom:3%;transform:translateX(-50%);padding:.45em 1em;border-radius:99px;background:rgba(42,22,96,.55);font-weight:800;font-size:.9em;white-space:nowrap;opacity:0;transition:opacity .4s}
${G} .hint.on{opacity:1}
${G} .stage.touch .hint{bottom:auto;top:17%}
${G} .feed{position:absolute;left:2.2%;top:16%;display:flex;flex-direction:column;gap:.3em;align-items:flex-start}
${G} .feed div{padding:.25em .7em;border-radius:99px;background:rgba(42,22,96,.5);font-weight:800;font-size:.8em;animation:br-feed 3s ease both}
${G} .feed div.me{background:rgba(255,95,176,.85)}
@keyframes br-feed{0%{opacity:0;transform:translateX(-1em)}10%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
${G} .scr{position:absolute;inset:0;pointer-events:auto;font-size:clamp(9px,1.8cqw,18px)}
${G} .fbtn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.6em 1.6em;border:0;border-radius:.9em;background:linear-gradient(#ffe866,#ffb81f);color:#3a1c00;font:900 1.35em/1 var(--sans);letter-spacing:.02em;cursor:pointer;box-shadow:0 .28em 0 #c27400,0 .6em 1em rgba(30,10,70,.3);transition:transform .2s var(--spring)}
${G} .fbtn:active{transform:translateY(.15em);box-shadow:0 .1em 0 #c27400}
${G} .fbtn.alt{background:linear-gradient(#ffffff,#dfe6ff);color:#2a1660;box-shadow:0 .28em 0 #8a8fc7,0 .6em 1em rgba(30,10,70,.3)}
${G} .lob{background:radial-gradient(120% 90% at 50% 40%,rgba(255,255,255,0) 40%,rgba(80,30,160,.35))}
${G} .ttl{position:absolute;left:0;right:0;top:4%;text-align:center;font-weight:900;font-size:4.6em;line-height:.9;letter-spacing:-.03em;color:#ffe14d;transform:rotate(-3deg);${OL('#2a1660')}}
${G} .ttl small{display:block;font-size:.3em;letter-spacing:.2em;color:#fff;margin-top:.35em}
${G} .stats{position:absolute;right:2.5%;top:3%;display:flex;flex-direction:column;align-items:flex-end;gap:.3em;font-weight:900}
${G} .stats div{padding:.3em .8em;border-radius:99px;background:rgba(42,22,96,.55);font-size:.9em}
${G} .cust{position:absolute;left:50%;bottom:4%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.6em;width:min(94%,40em)}
${G} .row{display:flex;gap:.45em;flex-wrap:wrap;justify-content:center}
${G} .row.hr{flex-wrap:nowrap;overflow-x:auto;max-width:100%;justify-content:flex-start;padding:.2em .3em .45em;scrollbar-width:thin}
${G} .row.hr .pt{flex:none;font-size:.85em;min-height:32px;padding:.35em .75em}
${G} .big.hold::before{content:"";position:absolute;left:-5%;right:-5%;top:50%;height:1.25em;transform:translateY(-50%) rotate(-3deg);z-index:-1;background:repeating-linear-gradient(115deg,rgba(255,95,176,.92) 0 .5em,rgba(138,92,255,.92) .5em 1em);box-shadow:0 .1em .4em rgba(40,10,90,.35);animation:br-band 2.6s var(--spring) both}
${G} .big.hold.e::before{background:repeating-linear-gradient(115deg,rgba(60,30,110,.92) 0 .5em,rgba(90,40,140,.92) .5em 1em)}
@keyframes br-band{0%{transform:translateY(-50%) rotate(-3deg) scaleX(0)}14%{transform:translateY(-50%) rotate(-3deg) scaleX(1)}88%{opacity:1}100%{opacity:0;transform:translateY(-50%) rotate(-3deg) scaleX(1)}}
${G} .sw{width:2.3em;height:2.3em;min-width:34px;min-height:34px;border-radius:50%;border:.2em solid #fff;cursor:pointer;box-shadow:0 .2em 0 rgba(42,22,96,.5);padding:0}
${G} .sw.on{outline:.22em solid #2a1660;transform:scale(1.15)}
${G} .pt{min-height:36px;padding:.45em .9em;border-radius:99px;border:0;background:rgba(255,255,255,.9);color:#2a1660;font:900 .95em var(--sans);cursor:pointer;box-shadow:0 .2em 0 rgba(42,22,96,.45)}
${G} .pt.on{background:#ff5fb0;color:#fff}
${G} .card{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);padding:1.6em 1em 1.8em;text-align:center;background:linear-gradient(100deg,rgba(255,95,176,.92),rgba(138,92,255,.92));box-shadow:0 .5em 2em rgba(40,10,90,.35);animation:br-card .6s var(--spring) both}
${G} .card .rn{font-weight:900;font-size:1.3em;letter-spacing:.2em;opacity:.95}
${G} .card .nm{font-weight:900;font-size:4.4em;line-height:1;letter-spacing:-.02em;margin:.12em 0 .18em;color:#ffe14d;${OL('#2a1660')}}
${G} .card .ds{font-weight:800;font-size:1.25em;max-width:30em;margin:.5em auto 0}
${G} .card .chip{font-size:1em;background:rgba(42,22,96,.6)}
@keyframes br-card{0%{transform:translateY(-50%) scaleY(0)}100%{transform:translateY(-50%) scaleY(1)}}
${G} .pan{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92%,30em);max-height:94%;overflow:auto;padding:1.4em 1.4em 1.6em;border-radius:1.4em;text-align:center;background:linear-gradient(160deg,#8a5cff,#ff5fb0);box-shadow:0 .4em 0 #4a2390,0 1em 2.4em rgba(30,10,70,.45)}
${G} .pan h3{margin:0 0 .4em;font-weight:900;font-size:3em;line-height:1;color:#ffe14d;${OL('#2a1660')}}
${G} .pan p{margin:.2em 0 .8em;font-weight:800;font-size:1.05em}
${G} .rl{display:flex;flex-direction:column;gap:.35em;margin:.6em 0 1em}
${G} .rl div{display:flex;justify-content:space-between;align-items:center;gap:.6em;padding:.45em .8em;border-radius:.7em;background:rgba(42,22,96,.35);font-weight:800;font-size:1em}
${G} .rl b{padding:.15em .6em;border-radius:99px;font-size:.85em}
${G} .rl b.ok{background:#22c07d}${G} .rl b.no{background:#ff4f7a}${G} .rl b.na{background:rgba(255,255,255,.25)}
${G} .pts{font-weight:900;font-size:2.2em;color:#fff;${OL('#2a1660')}}
${G} .btns{display:flex;gap:.7em;justify-content:center;flex-wrap:wrap}
${G} .tc{position:absolute;inset:0;pointer-events:none}
${G} .joy{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:rgba(255,255,255,.22);box-shadow:inset 0 0 0 3px rgba(255,255,255,.55);opacity:.0;transition:opacity .2s}
${G} .joy.on{opacity:1}
${G} .joy.idle{left:84px;top:calc(100% - 92px);opacity:.45}
${G} .joy i{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 4px 0 rgba(42,22,96,.35)}
${G} .tb{position:absolute;pointer-events:auto;border:0;border-radius:50%;display:grid;place-items:center;font:900 13px var(--sans);color:#fff;touch-action:none;cursor:pointer;${OL('#2a1660')}}
${G} .tb.jp{right:4%;bottom:5%;width:78px;height:78px;background:radial-gradient(circle at 40% 35%,#ffe866,#ffb81f);box-shadow:0 5px 0 #c27400}
${G} .tb.dv{right:calc(4% + 86px);bottom:4%;width:60px;height:60px;background:radial-gradient(circle at 40% 35%,#ff8fc8,#ff4f9e);box-shadow:0 5px 0 #a01d63}
${G} .tb.on{transform:translateY(3px) scale(.95)}
${G} .tb svg{width:46%;height:46%}
`;

  function makeAudio(api) {
    let ctx = null, out = null, mus = null, noiseB = null, musicOn = false, nextT = 0, step = 0;
    const ensure = () => {
      if (ctx) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC(); out = ctx.createGain(); out.gain.value = 0.55; out.connect(ctx.destination);
        mus = ctx.createGain(); mus.gain.value = 0.16; mus.connect(out);
        noiseB = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = noiseB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; }
      return ctx;
    };
    const tone = (f0, f1, dur, type, vol, when = 0, dest = out) => {
      const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (dur, vol, f, q = 1, when = 0, type = 'bandpass', f1 = 0, dest = out) => {
      const t = ctx.currentTime + when, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseB; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.03);
    };
    const S = {
      jump: () => { tone(260, 560, 0.14, 'square', 0.04); tone(520, 900, 0.1, 'sine', 0.05, 0.02); },
      dive: () => noise(0.25, 0.25, 900, 0.8, 0, 'bandpass', 2600),
      land: () => tone(160, 70, 0.09, 'sine', 0.12),
      bonk: () => { tone(220, 60, 0.22, 'triangle', 0.18); tone(900, 1500, 0.12, 'sine', 0.06, 0.03); noise(0.08, 0.2, 400, 1); },
      boing: () => { tone(180, 420, 0.25, 'sine', 0.12); tone(185, 430, 0.25, 'triangle', 0.05); },
      beep: () => tone(660, 660, 0.18, 'square', 0.06),
      go: () => { tone(990, 990, 0.45, 'square', 0.07); tone(1320, 1320, 0.45, 'sine', 0.05); },
      door: () => { noise(0.3, 0.35, 700, 0.7, 0, 'lowpass', 200); tone(140, 50, 0.3, 'triangle', 0.15); },
      crumble: () => noise(0.22, 0.1, 1800, 1.2, 0, 'bandpass', 500),
      splash: () => { noise(0.45, 0.3, 1200, 0.6, 0, 'lowpass', 200); tone(400, 90, 0.35, 'sine', 0.1); },
      qual: () => [523, 659, 784, 1047].forEach((f, i) => { tone(f, f, 0.22, 'square', 0.05, i * 0.09); tone(f * 2, f * 2, 0.2, 'sine', 0.03, i * 0.09); }),
      elim: () => { tone(392, 370, 0.3, 'sawtooth', 0.05); tone(370, 349, 0.3, 'sawtooth', 0.05, 0.32); tone(349, 220, 0.9, 'sawtooth', 0.06, 0.64); },
      win: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.3, 'square', 0.05, i * 0.12)); for (let i = 0; i < 8; i++) tone(2000 + i * 300, 2600 + i * 300, 0.08, 'sine', 0.03, 0.9 + i * 0.05); },
      check: () => { tone(880, 880, 0.08, 'sine', 0.06); tone(1320, 1320, 0.12, 'sine', 0.06, 0.08); },
      tap: () => tone(700, 900, 0.06, 'sine', 0.05)
    };
    const BPM = 124, SIX = 60 / BPM / 4;
    const ROOT = [48, 45, 41, 43], CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
    const LEAD = [76, 0, 79, 0, 81, 79, 76, 0, 72, 0, 74, 0, 76, 0, 0, 0, 72, 0, 76, 0, 81, 0, 79, 76, 0, 0, 74, 0, 72, 0, 0, 0, 69, 0, 72, 0, 77, 0, 76, 0, 74, 72, 0, 0, 69, 0, 72, 0, 71, 0, 74, 0, 79, 0, 77, 0, 74, 0, 71, 0, 67, 0, 0, 0];
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    function sched() {
      if (!ctx) return;
      if (api.muted || !musicOn) { mus.gain.value = 0; return; }
      mus.gain.value = 0.16;
      if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
      while (nextT < ctx.currentTime + 0.3) {
        const w = nextT - ctx.currentTime, s = step % 64, bar = (s / 16) | 0, b = s % 16;
        if (b % 4 === 0) tone(150, 45, 0.16, 'sine', 0.5, w, mus);
        if (b % 4 === 2) noise(0.05, 0.18, 7000, 1, w, 'highpass', 0, mus);
        if (b % 2 === 0) { const m = ROOT[bar] + (b % 4 === 2 ? 12 : 0); tone(mf(m), mf(m), SIX * 1.6, 'triangle', 0.35, w, mus); }
        if (b % 4 === 2) CH[bar].forEach(m => tone(mf(m), mf(m), SIX * 1.2, 'square', 0.05, w, mus));
        if (LEAD[s]) tone(mf(LEAD[s]), mf(LEAD[s]), SIX * 1.8, 'square', 0.09, w, mus);
        nextT += SIX; step++;
      }
    }
    api.interval(sched, 80);
    return {
      play(n) { if (api.muted) return; const c = ensure(); if (!c) return; if (c.state !== 'running') c.resume().catch(() => {}); try { S[n](); } catch (e) {} },
      music(on) { musicOn = on; if (on && !api.muted) { const c = ensure(); if (c && c.state !== 'running') c.resume().catch(() => {}); } },
      close() { musicOn = false; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    };
  }

  Ameplay.register({
    id: ID, title: 'Bean Royale', category: '3D', tint: '#ff5fb0',
    blurb: 'Wobbly jellybean party royale: race, survive and grab the crown.',
    help: '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> run · <kbd>Space</kbd> jump · <kbd>Shift</kbd>/<kbd>Ctrl</kbd> dive · drag mouse to look · <kbd>P</kbd> pause · touch: stick, Jump, Dive',
    better: 'high', width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 26a12 12 0 0 1 24 0v16a12 12 0 0 1-24 0z"/><circle cx="27" cy="27" r="3"/><circle cx="37" cy="27" r="3"/><path d="M20 36l-6 4M44 36l6 4M27 54v4M37 54v4"/></svg>',
    css: CSS,
    mount(root, api) {
      const wrap = document.createElement('div'); wrap.className = 'stage'; root.append(wrap);
      let cleanup = null;
      const narrow = root.clientWidth && root.clientWidth < 560;
      api.gl(narrow ? 600 : 960, narrow ? 900 : 600).then(v => { if (v && api.alive) cleanup = run(root, wrap, api, v); });
      return { destroy() { if (cleanup) cleanup(); } };
    }
  });

  function run(root, wrap, api, V) {
    const { THREE, renderer, canvas, w, h } = V;
    wrap.style.width = canvas.style.width; wrap.style.aspectRatio = canvas.style.aspectRatio;
    canvas.style.width = '100%'; wrap.append(canvas);
    if (COARSE) { const fit = () => { const cw = canvas.clientWidth; if (cw && !document.fullscreenElement) renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * cw / w); }; fit(); api.on(window, 'resize', fit); }
    renderer.toneMappingExposure = 1.0;
    const bin = [], own = x => (bin.push(x), x);
    const col = hex => new THREE.Color(hex).convertSRGBToLinear();
    const audio = makeAudio(api);
    const keys = api.keys;
    let saved = api.load() || {};
    const prefs = { ci: saved.ci ?? 0, pi: saved.pi ?? 1, hi: saved.hi ?? 0, crowns: saved.crowns || 0, shows: saved.shows || 0, best: saved.best || 0 };
    const persist = () => api.save(prefs);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xd8ecff, 110, 420);
    const cam = new THREE.PerspectiveCamera(h > w ? 68 : 58, w / h, 0.1, 1000);
    cam.rotation.order = 'YXZ';
    {
      const g = own(new THREE.SphereGeometry(700, 24, 14)), p = g.attributes.position, cs = [];
      const c0 = col('#ffe3f3'), c1 = col('#a8e1ff'), c2 = col('#58b6ff'), tc = new THREE.Color();
      for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 700, t = clamp(y * 1.4 + 0.08, 0, 1); if (t < 0.35) tc.copy(c0).lerp(c1, t / 0.35); else tc.copy(c1).lerp(c2, (t - 0.35) / 0.65); cs.push(tc.r, tc.g, tc.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
      var sky = new THREE.Mesh(g, own(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
      sky.renderOrder = -1; scene.add(sky);
    }
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b3ff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff2de, 0.9);
    sun.castShadow = true;
    { const SM = COARSE ? 1024 : 2048, sc = sun.shadow.camera; sun.shadow.mapSize.set(SM, SM); sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 160; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04; }
    scene.add(sun, sun.target);
    const SUN_OFF = new THREE.Vector3(-26, 55, 14);
    {
      const sc = document.createElement('canvas'); sc.width = sc.height = 128;
      const sg = sc.getContext('2d'), gr = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,252,225,1)'); gr.addColorStop(0.14, 'rgba(255,244,200,.95)'); gr.addColorStop(0.2, 'rgba(255,236,170,.4)'); gr.addColorStop(1, 'rgba(255,230,170,0)');
      sg.fillStyle = gr; sg.fillRect(0, 0, 128, 128);
      const st = own(new THREE.CanvasTexture(sc)); st.encoding = THREE.sRGBEncoding;
      const sm = own(new THREE.SpriteMaterial({ map: st, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
      var sunSpr = new THREE.Sprite(sm); sunSpr.scale.setScalar(260); sunSpr.renderOrder = -1; scene.add(sunSpr);
    }

    const ctex = (W, H, draw, rep) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      draw(c.getContext('2d'), W, H);
      const t = own(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
      if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    };
    const stripeT = ctex(128, 128, (x, W) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, W);
      x.fillStyle = 'rgba(60,40,120,.06)';
      for (let i = -W; i < W * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 16, 0); x.lineTo(i + 16 - W, W); x.lineTo(i - W, W); x.fill(); }
      const e = 6;
      x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(0, 0, W, e); x.fillRect(0, 0, e, W);
      x.fillStyle = 'rgba(60,30,110,.2)'; x.fillRect(0, W - e, W, e); x.fillRect(W - e, 0, e, W);
      x.fillStyle = 'rgba(60,30,110,.08)'; x.fillRect(e, e, W - 2 * e, 3); x.fillRect(e, e, 3, W - 2 * e);
      x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(W * 0.2, W * 0.2, W * 0.6, W * 0.6);
      x.fillStyle = 'rgba(60,40,120,.09)'; x.fillRect(W * 0.2, W * 0.78, W * 0.6, W * 0.02); x.fillRect(W * 0.78, W * 0.2, W * 0.02, W * 0.6);
      for (const [px, py] of [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]) {
        x.fillStyle = 'rgba(60,30,110,.25)'; x.beginPath(); x.arc(W * px + 1, W * py + 1.5, 3.4, 0, TAU); x.fill();
        x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(W * px, W * py, 3, 0, TAU); x.fill();
      }
    }, true);
    const sideT = ctex(64, 64, (x, W) => {
      const g = x.createLinearGradient(0, 0, 0, W);
      g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.5, 'rgba(255,255,255,.25)'); g.addColorStop(0.62, 'rgba(255,255,255,0.0)'); g.addColorStop(0.78, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.08)');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, W);
      x.fillStyle = 'rgba(40,20,90,.22)'; x.fillRect(0, 0, W, W);
      x.fillStyle = g; x.fillRect(0, 0, W, W);
      x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(0, W * 0.74, W, 3);
      x.fillStyle = 'rgba(40,20,90,.28)'; x.fillRect(0, W * 0.74 + 3, W, 3);
      x.fillStyle = 'rgba(40,20,90,.14)'; x.fillRect(W - 2, 0, 2, W);
    }, true);
    const slimeT = ctex(256, 256, (x, W) => {
      const g = x.createLinearGradient(0, 0, W, W); g.addColorStop(0, '#b44cff'); g.addColorStop(0.5, '#e04fd8'); g.addColorStop(1, '#b44cff');
      x.fillStyle = g; x.fillRect(0, 0, W, W);
      for (let i = 0; i < 46; i++) { const px = Math.random() * W, py = Math.random() * W, r = 6 + Math.random() * 22; x.fillStyle = `rgba(255,${150 + (Math.random() * 80) | 0},245,${0.16 + Math.random() * 0.25})`; for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) { x.beginPath(); x.arc(px + ox, py + oy, r, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1.5; x.beginPath(); x.arc(px + ox - r * 0.1, py + oy - r * 0.1, r * 0.82, Math.PI * 1.05, Math.PI * 1.6); x.stroke(); } }
    }, true);
    slimeT.repeat.set(90, 90);
    const beltT = ctex(64, 128, (x) => {
      x.fillStyle = '#2f3160'; x.fillRect(0, 0, 64, 128);
      for (let y = 0; y < 128; y += 8) { const g = x.createLinearGradient(0, y, 0, y + 8); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(0,0,0,.3)'); x.fillStyle = g; x.fillRect(6, y, 52, 8); }
      x.fillStyle = '#6a6fb8'; x.fillRect(0, 0, 6, 128); x.fillRect(58, 0, 6, 128);
      x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(5, 0, 1, 128); x.fillRect(57, 0, 1, 128);
      for (let y = 8; y < 128; y += 16) { x.fillStyle = '#c9ceff'; x.beginPath(); x.arc(3, y, 1.6, 0, TAU); x.fill(); x.beginPath(); x.arc(61, y, 1.6, 0, TAU); x.fill(); }
      for (let y = 8; y < 128; y += 64) {
        x.fillStyle = 'rgba(255,200,40,.28)'; x.beginPath(); x.moveTo(5, y + 32); x.lineTo(32, y + 3); x.lineTo(59, y + 32); x.lineTo(59, y + 48); x.lineTo(32, y + 19); x.lineTo(5, y + 48); x.fill();
        x.fillStyle = '#ffd23f'; x.beginPath(); x.moveTo(8, y + 30); x.lineTo(32, y + 6); x.lineTo(56, y + 30); x.lineTo(56, y + 44); x.lineTo(32, y + 20); x.lineTo(8, y + 44); x.fill();
        x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(8, y + 30); x.lineTo(32, y + 6); x.lineTo(56, y + 30); x.lineTo(56, y + 33); x.lineTo(32, y + 10); x.lineTo(8, y + 33); x.fill();
      }
    }, true);
    const checkT = ctex(64, 64, (x) => {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) & 1 ? '#2a1660' : '#ffffff'; x.fillRect(i * 8, j * 8, 8, 8); if ((i + j) & 1) { x.fillStyle = 'rgba(255,255,255,.14)'; x.fillRect(i * 8, j * 8, 8, 2); } else { x.fillStyle = 'rgba(40,20,90,.1)'; x.fillRect(i * 8, j * 8 + 6, 8, 2); } }
    }, true);
    const gateT = ctex(64, 64, (x, W) => {
      x.fillStyle = '#ff4fa3'; x.fillRect(0, 0, W, W);
      x.fillStyle = '#ffd23f';
      for (let i = -W; i < W * 2; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 16, 0); x.lineTo(i + 16 - W, W); x.lineTo(i - W, W); x.fill(); }
      const g = x.createLinearGradient(0, 0, 0, W); g.addColorStop(0, 'rgba(255,255,255,.4)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(40,0,70,.3)'); x.fillStyle = g; x.fillRect(0, 0, W, W);
    }, true);
    const boulderT = ctex(128, 64, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff9ccb'); g.addColorStop(1, '#ff5fa6'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(255,255,255,.55)';
      for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(((i + (j & 1) * 0.5) * W) / 8 + 8, 9 + j * 15, 3.4, 0, TAU); x.fill(); }
      x.fillStyle = 'rgba(180,20,90,.18)'; x.fillRect(0, 0, W, 4); x.fillRect(0, H - 4, W, 4);
    }, true);
    const discT = ctex(256, 256, (x) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 12; i++) { x.fillStyle = i & 1 ? 'rgba(60,40,120,.17)' : 'rgba(255,255,255,0)'; x.beginPath(); x.moveTo(128, 128); x.arc(128, 128, 128, (i * TAU) / 12, ((i + 1) * TAU) / 12); x.fill(); }
      const rg = x.createRadialGradient(128, 128, 20, 128, 128, 126); rg.addColorStop(0, 'rgba(255,255,255,.55)'); rg.addColorStop(0.55, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(60,30,110,.22)'); x.fillStyle = rg; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 118, 0, TAU); x.stroke();
      x.strokeStyle = 'rgba(60,40,120,.22)'; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 106, 0, TAU); x.stroke(); x.beginPath(); x.arc(128, 128, 62, 0, TAU); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(128, 128, 20, 0, TAU); x.fill();
      x.fillStyle = 'rgba(60,40,120,.28)'; x.beginPath(); x.arc(128, 128, 11, 0, TAU); x.fill();
    });
    const doorT = ctex(128, 256, (x, W, H) => {
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(60,30,110,.12)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      const panel = (px, py, pw, ph) => { x.fillStyle = 'rgba(60,30,110,.22)'; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(px + 4, py + 4, pw - 8, ph - 8); x.fillStyle = 'rgba(60,30,110,.28)'; x.fillRect(px + 4, py + ph - 7, pw - 8, 3); x.fillRect(px + pw - 7, py + 4, 3, ph - 8); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(px + 4, py + 4, pw - 8, 3); x.fillRect(px + 4, py + 4, 3, ph - 8); };
      panel(14, 150, 100, 92); panel(14, 14, 100, 24);
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 6; x.strokeRect(3, 3, W - 6, H - 6);
      x.strokeStyle = 'rgba(60,30,110,.3)'; x.lineWidth = 3; x.strokeRect(8, 8, W - 16, H - 16);
      x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '900 18px sans-serif'; x.textAlign = 'center'; x.fillText('PUSH', W / 2, 200);
      x.fillStyle = 'rgba(60,30,110,.5)'; x.beginPath(); x.moveTo(W / 2 - 14, 214); x.lineTo(W / 2 + 14, 214); x.lineTo(W / 2, 228); x.fill();
    });
    const bannerT = ctex(1500, 100, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ff7fbf'); g.addColorStop(1, '#ee3c92'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 20; j++) { x.fillStyle = (i + j) & 1 ? '#2a1660' : '#ffffff'; x.fillRect(j * 15, i * 25, 15, 25); x.fillRect(W - 300 + j * 15, i * 25, 15, 25); }
      x.font = '900 78px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
      for (const cx of [W * 0.3, W * 0.5, W * 0.7]) { x.lineWidth = 12; x.strokeStyle = '#2a1660'; x.strokeText('FINISH', cx, H / 2 + 4); x.fillStyle = '#ffe14d'; x.fillText('FINISH', cx, H / 2 + 4); }
    });
    const arrowT = ctex(64, 64, (x, W) => {
      x.clearRect(0, 0, W, W); x.fillStyle = 'rgba(255,255,255,.55)';
      for (const y of [8, 36]) { x.beginPath(); x.moveTo(8, y + 18); x.lineTo(32, y); x.lineTo(56, y + 18); x.lineTo(56, y + 26); x.lineTo(32, y + 8); x.lineTo(8, y + 26); x.fill(); }
    }, true);
    const candyT = ctex(64, 128, (x, W, H) => {
      for (let i = 0; i < 8; i++) { x.fillStyle = i & 1 ? '#ffffff' : '#ffffff'; x.fillRect(0, i * 16, W, 16); x.fillStyle = i & 1 ? 'rgba(60,30,110,.1)' : 'rgba(255,255,255,0)'; x.fillRect(0, i * 16, W, 16); }
      const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(60,30,110,.2)'); g.addColorStop(0.35, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(60,30,110,.3)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }, true);
    const glowT = ctex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
    const starT = ctex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); x.fillStyle = '#fff'; x.beginPath(); for (let k = 0; k < 8; k++) { const r = k & 1 ? 3 : 30, a = (k * Math.PI) / 4; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.fill(); });
    const puffT = ctex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.7, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });

    const mat = (hex, o = {}) => own(new THREE.MeshStandardMaterial({ color: col(hex), roughness: 0.5, metalness: 0, ...o }));
    const MC = new Map();
    const matsFor = hex => {
      if (MC.has(hex)) return MC.get(hex);
      const top = mat(hex, { map: stripeT, roughness: 0.5 }), side = mat(hex, { map: sideT, roughness: 0.55 });
      const a = [side, side, top, side, side, side]; MC.set(hex, a); return a;
    };
    const MAT = {
      white: mat('#ffffff'), ink: mat('#2a1660', { roughness: 0.4 }), foam: mat('#ff4fa3', { roughness: 0.65 }), foam2: mat('#ffd23f', { roughness: 0.65 }),
      metal: mat('#cfd6f5', { roughness: 0.3, metalness: 0.4 }), metal2: mat('#cfd6f5', { roughness: 0.3, metalness: 0.4, side: THREE.DoubleSide }), belt: mat('#ffffff', { map: beltT, roughness: 0.7 }), check: mat('#ffffff', { map: checkT, roughness: 0.6 }),
      slime: own(new THREE.MeshStandardMaterial({ color: 0xffffff, map: slimeT, roughness: 0.22, emissive: col('#8a2bd0'), emissiveIntensity: 0.35 })),
      gold: mat('#ffc83d', { roughness: 0.25, metalness: 0.65, emissive: col('#a86a00'), emissiveIntensity: 0.35 }),
      gem: mat('#ff3d8b', { roughness: 0.15, metalness: 0.2, emissive: col('#80002f'), emissiveIntensity: 0.4 }),
      eye: mat('#ffffff', { roughness: 0.2 }), pupil: mat('#1d1640', { roughness: 0.2 }),
      vc: mat('#ffffff', { vertexColors: true, roughness: 0.45 }), vcg: mat('#ffffff', { vertexColors: true, roughness: 0.16 }), eyes: mat('#ffffff', { vertexColors: true, roughness: 0.1 }),
      goldVC: mat('#ffffff', { vertexColors: true, roughness: 0.22, metalness: 0.65, emissive: col('#a86a00'), emissiveIntensity: 0.32 }),
      gemR: mat('#ff3d6b', { roughness: 0.12, metalness: 0.2, emissive: col('#a00030'), emissiveIntensity: 0.55 }), gemB: mat('#3da6ff', { roughness: 0.12, metalness: 0.2, emissive: col('#0a3d96'), emissiveIntensity: 0.55 }),
      bulb: own(new THREE.MeshBasicMaterial({ vertexColors: true })), gate: mat('#ffffff', { map: gateT, roughness: 0.45 }), velvet: mat('#c01848', { roughness: 0.9 }),
      arrow: own(new THREE.MeshBasicMaterial({ map: arrowT, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })), banner: mat('#ffffff', { map: bannerT, roughness: 0.55 }),
      tileHit: mat('#fff6fb', { emissive: col('#ffffff'), emissiveIntensity: 0.25 }),
      wind: own(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })), candy: mat('#ffffff', { map: candyT, roughness: 0.55 }),
      cloud: own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: col('#b9c9ff'), emissiveIntensity: 0.25 }))
    };
    const UG = { box: own(new THREE.BoxGeometry(1, 1, 1)), sph: own(new THREE.SphereGeometry(1, 16, 12)), cyl: own(new THREE.CylinderGeometry(1, 1, 1, 20)), cone: own(new THREE.ConeGeometry(1, 1, 12)), tor: own(new THREE.TorusGeometry(1, 0.1, 8, 28)) };

    const OBJ = new THREE.Object3D();
    const pr = (g, hex, x, y, z, sx, sy, sz, rx, ry, rz, k) => {
      OBJ.position.set(x, y, z); OBJ.rotation.set(rx || 0, ry || 0, rz || 0); OBJ.scale.set(sx, sy, sz); OBJ.updateMatrix();
      return { g, c: col(hex), m: OBJ.matrix.clone(), k: k == null ? 1 : k };
    };
    const bakeG = (items, keep, amp = 0.2, flat = false) => {
      const P = [], N = [], C = [], I = [];
      let o = 0;
      for (const it of items) {
        const gq = it.g.clone();
        gq.applyMatrix4(it.m);
        const p = gq.attributes.position, n = gq.attributes.normal, ix = gq.index;
        for (let i = 0; i < p.count; i++) {
          const k = it.k * (1 - amp + amp * (n.getY(i) * 0.5 + 0.5));
          P.push(p.getX(i), p.getY(i), p.getZ(i)); N.push(n.getX(i), n.getY(i), n.getZ(i)); C.push(it.c.r * k, it.c.g * k, it.c.b * k);
        }
        for (let i = 0; i < ix.count; i++) I.push(ix.getX(i) + o);
        o += p.count;
        gq.dispose();
      }
      const r = new THREE.BufferGeometry();
      r.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      r.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      r.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
      r.setIndex(I);
      return keep(r);
    };
    const prof = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * (Math.PI / 2); prof.push(new THREE.Vector2(Math.max(0.001, 0.5 * Math.cos(a)), 0.66 + 0.5 * Math.sin(a))); }
    for (let i = 1; i <= 3; i++) { const t = i / 4; prof.push(new THREE.Vector2(0.5 - 0.04 * t + 0.014 * Math.sin(t * Math.PI), 0.66 + 0.43 * t)); }
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * (Math.PI / 2); prof.push(new THREE.Vector2(Math.max(0.001, 0.46 * Math.cos(a)), 1.09 + 0.46 * Math.sin(a))); }
    const bodyGeo = own(new THREE.LatheGeometry(prof, 30));
    { const uv = bodyGeo.attributes.uv, ps = bodyGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setY(i, (ps.getY(i) - 0.16) / 1.39); }
    const EY = 0.36, EZ = 0.4;
    const eyeItems = [];
    for (const sd of [-1, 1]) eyeItems.push(
      pr(UG.sph, '#120a24', sd * 0.15, EY, 0.425, 0.092, 0.142, 0.06, 0, sd * 0.32, 0),
      pr(UG.sph, '#ffffff', sd * 0.128, EY + 0.06, 0.475, 0.034, 0.042, 0.02, 0, sd * 0.32, 0),
      pr(UG.sph, '#ffffff', sd * 0.168, EY - 0.055, 0.474, 0.016, 0.016, 0.012, 0, sd * 0.32, 0)
    );
    const eyesGeo = bakeG(eyeItems, own, 0).translate(0, -EY, -EZ);
    const BG = {
      body: bodyGeo, eyes: eyesGeo, limb: own(new THREE.SphereGeometry(1, 14, 12)),
      glove: bakeG([
        pr(UG.sph, '#ffffff', 0, -0.43, 0, 0.105, 0.1, 0.105),
        pr(UG.cyl, '#ffffff', 0, -0.35, 0, 0.083, 0.045, 0.083, 0, 0, 0, 0.88),
        pr(UG.sph, '#ffffff', 0.04, -0.4, 0.085, 0.045, 0.05, 0.045)
      ], own, 0.25),
      shoe: bakeG([
        pr(UG.sph, '#ffffff', 0, -0.195, 0.09, 0.17, 0.08, 0.235),
        pr(UG.sph, '#e4e7ff', 0, -0.185, 0.2, 0.125, 0.065, 0.1),
        pr(UG.cyl, '#2a1660', 0, -0.255, 0.09, 0.172, 0.028, 0.238),
        pr(UG.sph, '#ff7fbf', 0, -0.15, 0.04, 0.1, 0.03, 0.09)
      ], own, 0.25)
    };
    const HG = [null];
    {
      const H = (items, k) => bakeG(items, own, k == null ? 0.3 : k);
      HG.push(H([pr(UG.sph, '#ff4f6d', 0, 0.56, 0, 0.5, 0.3, 0.5), pr(UG.cyl, '#ffffff', 0, 0.46, 0, 0.495, 0.1, 0.495), pr(UG.sph, '#ffffff', 0, 0.88, 0, 0.11, 0.11, 0.11)]));
      HG.push(H([pr(UG.cone, '#2a1660', -0.24, 0.8, 0.02, 0.15, 0.3, 0.1, 0, 0, 0.38), pr(UG.cone, '#2a1660', 0.24, 0.8, 0.02, 0.15, 0.3, 0.1, 0, 0, -0.38), pr(UG.cone, '#ff9ac8', -0.235, 0.79, 0.06, 0.08, 0.18, 0.04, 0, 0, 0.38), pr(UG.cone, '#ff9ac8', 0.235, 0.79, 0.06, 0.08, 0.18, 0.04, 0, 0, -0.38)]));
      HG.push(H([pr(UG.sph, '#ffffff', -0.14, 1.02, -0.02, 0.085, 0.32, 0.06, 0, 0, 0.16), pr(UG.sph, '#ffffff', 0.14, 1.02, -0.02, 0.085, 0.32, 0.06, 0, 0, -0.16), pr(UG.sph, '#ffb3d1', -0.14, 1.02, 0.03, 0.045, 0.24, 0.02, 0, 0, 0.16), pr(UG.sph, '#ffb3d1', 0.14, 1.02, 0.03, 0.045, 0.24, 0.02, 0, 0, -0.16)]));
      HG.push(H([pr(UG.cone, '#3d9bff', 0.06, 0.98, 0, 0.21, 0.46, 0.21, 0, 0, -0.22), pr(UG.cyl, '#ffd23f', 0.035, 0.8, 0, 0.19, 0.05, 0.19, 0, 0, -0.22), pr(UG.sph, '#ff4fa3', 0.11, 1.21, 0, 0.075, 0.075, 0.075)]));
      HG.push(H([pr(UG.sph, '#b9c2d8', 0, 0.56, 0, 0.505, 0.31, 0.505), pr(UG.cyl, '#8a6a3a', 0, 0.45, 0, 0.5, 0.07, 0.5), pr(UG.cone, '#fff1d6', -0.45, 0.72, 0, 0.08, 0.32, 0.08, 0, 0, 0.95), pr(UG.cone, '#fff1d6', 0.45, 0.72, 0, 0.08, 0.32, 0.08, 0, 0, -0.95)]));
      HG.push(H([pr(UG.sph, '#ffd23f', 0, 0.56, 0, 0.49, 0.29, 0.49), pr(UG.sph, '#ff4f6d', 0, 0.565, 0, 0.495, 0.13, 0.495), pr(UG.cyl, '#2a1660', 0, 0.9, 0, 0.022, 0.14, 0.022), pr(UG.sph, '#2a1660', 0, 0.97, 0, 0.04, 0.03, 0.04)]));
      HG.push(H([pr(UG.cyl, '#ffffff', 0, 0.86, 0, 0.3, 0.32, 0.3), pr(UG.sph, '#ffffff', 0, 1.06, 0, 0.38, 0.2, 0.38), pr(UG.sph, '#f3f3ff', -0.14, 1.1, 0.1, 0.18, 0.14, 0.18), pr(UG.sph, '#f3f3ff', 0.15, 1.08, -0.1, 0.18, 0.14, 0.18), pr(UG.cyl, '#e6e6f6', 0, 0.72, 0, 0.31, 0.06, 0.31)], 0.15));
      HG.push(H([pr(UG.cyl, '#2a1660', 0, 0.95, 0, 0.018, 0.4, 0.018), pr(UG.sph, '#ff3d6b', 0, 1.17, 0, 0.075, 0.075, 0.075)]));
      HG.push(H([pr(UG.cone, '#ff3d6b', -0.15, 0.82, 0.08, 0.11, 0.2, 0.07, 0, 0, Math.PI / 2), pr(UG.cone, '#ff3d6b', 0.15, 0.82, 0.08, 0.11, 0.2, 0.07, 0, 0, -Math.PI / 2), pr(UG.sph, '#ff6f93', 0, 0.82, 0.08, 0.06, 0.06, 0.06)]));
      HG.push(H([pr(UG.tor, '#2a1660', 0, 0.36, 0, 0.5, 0.5, 0.9), pr(UG.cyl, '#3fe0c5', -0.5, 0.2, 0, 0.13, 0.09, 0.13, 0, 0, Math.PI / 2), pr(UG.cyl, '#3fe0c5', 0.5, 0.2, 0, 0.13, 0.09, 0.13, 0, 0, Math.PI / 2)]));
    }
    const propGeo = bakeG([pr(UG.box, '#3d9bff', 0, 0, 0, 0.56, 0.018, 0.09), pr(UG.box, '#ff4fa3', 0, 0, 0, 0.09, 0.018, 0.56)], own, 0.2);
    function setHat(b, hi) {
      if (b.hat) { b.tilt.remove(b.hat); b.hat = null; b.prop = null; }
      b.hi = hi | 0;
      if (!HG[b.hi]) return;
      const m = new THREE.Mesh(HG[b.hi], MAT.vc); m.castShadow = true; b.tilt.add(m); b.hat = m;
      if (HATS[b.hi] === 'Propeller') { const pm = new THREE.Mesh(propGeo, MAT.vc); pm.position.y = 0.99; m.add(pm); b.prop = pm; }
    }
    const accOf = ci => (PAL[ci] === '#f2efff' ? '#ff6fae' : '#ffffff');
    function beanTex(base, acc, pi) {
      return ctex(256, 128, (x, W, H) => {
        const yv = by => (1 - (by - 0.16) / 1.39) * H;
        x.fillStyle = base; x.fillRect(0, 0, W, H);
        x.fillStyle = acc; x.strokeStyle = 'rgba(40,10,80,.22)'; x.lineWidth = 1.4;
        if (pi === 1) { for (let y = 3; y < H; y += 26) { x.fillRect(0, y, W, 13); x.strokeRect(-2, y, W + 4, 13); } }
        else if (pi === 2) { for (let r = 0; r < 8; r++) for (let c = 0; c < 17; c++) { const cx = (c + (r & 1) * 0.5) * 16, cy = r * 17 + 8; x.fillStyle = acc; x.beginPath(); x.arc(cx, cy, 5.6, 0, TAU); x.fill(); x.stroke(); x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(cx - 1.8, cy - 2, 1.8, 0, TAU); x.fill(); } }
        else if (pi === 3) {
          x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, yv(0.8));
          for (let i = W; i >= 0; i -= 4) x.lineTo(i, yv(0.8) + Math.sin(i * 0.2) * 4);
          x.closePath(); x.fill();
          x.fillStyle = 'rgba(40,10,80,.45)'; for (let i = 0; i < W; i += 4) x.fillRect(i, yv(0.8) + Math.sin(i * 0.2) * 4 + 3, 4, 3);
          x.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < W; i += 4) x.fillRect(i, yv(0.8) + Math.sin(i * 0.2) * 4 - 2, 4, 2);
          for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(i * 44 + 22, yv(0.45), 4, 0, TAU); x.fill(); }
        }
        else if (pi === 4) for (let i = 0; i < 14; i++) { const cx = (i * 59) % W + 6, cy = 12 + ((i * 37) % (H - 24)); x.beginPath(); for (let k = 0; k < 10; k++) { const r = k & 1 ? 4 : 10, a = -Math.PI / 2 + (k * Math.PI) / 5; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.62); } x.closePath(); x.fillStyle = acc; x.fill(); x.stroke(); }
        const sh = x.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(0.35, 'rgba(255,255,255,.02)'); sh.addColorStop(0.75, 'rgba(40,0,80,.06)'); sh.addColorStop(1, 'rgba(40,0,80,.26)'); x.fillStyle = sh; x.fillRect(0, 0, W, H);
        if (pi > 0) for (const ox of [0, W]) { const fg = x.createRadialGradient(ox, 48, 8, ox, 48, 46); fg.addColorStop(0, base); fg.addColorStop(0.7, base); fg.addColorStop(1, 'rgba(255,255,255,0)'); x.globalAlpha = 0.92; x.fillStyle = fg; x.fillRect(ox - 50, 0, 100, 100); x.globalAlpha = 1; }
        for (const ox of [0, W]) {
          x.save(); x.translate(ox, 0);
          const fg2 = x.createRadialGradient(0, 44, 6, 0, 44, 44); fg2.addColorStop(0, '#ffe0e6'); fg2.addColorStop(0.8, '#ffc4d2'); fg2.addColorStop(1, '#f6a9bd');
          x.fillStyle = fg2; x.beginPath(); x.ellipse(0, 46, 40, 37, 0, 0, TAU); x.fill();
          x.strokeStyle = 'rgba(60,10,60,.18)'; x.lineWidth = 3; x.stroke();
          x.fillStyle = 'rgba(255,90,140,.4)';
          for (const cs of [-1, 1]) { x.beginPath(); x.ellipse(cs * 27, 60, 8, 5, 0, 0, TAU); x.fill(); }
          x.beginPath(); x.moveTo(-13, 67); x.quadraticCurveTo(0, 90, 13, 67); x.quadraticCurveTo(0, 71, -13, 67); x.closePath();
          x.fillStyle = '#4a1238'; x.fill(); x.save(); x.clip();
          x.fillStyle = '#ff7a9a'; x.beginPath(); x.ellipse(0, 82, 8, 6, 0, 0, TAU); x.fill();
          x.fillStyle = 'rgba(255,255,255,.95)'; x.fillRect(-11, 66, 22, 3);
          x.restore();
          x.strokeStyle = 'rgba(50,20,60,.9)'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-13, 67); x.quadraticCurveTo(0, 90, 13, 67); x.stroke();
          x.restore();
        }
      });
    }
    function skinBean(b, ci, pi, ai) {
      if (b.tex) { b.tex.dispose(); const k = bin.indexOf(b.tex); if (k >= 0) bin.splice(k, 1); }
      b.ci = ci; b.pi = pi; b.tex = beanTex(PAL[ci], ai == null ? accOf(ci) : PAL[ai], pi);
      b.bm.map = b.tex; b.bm.needsUpdate = true; b.lm.color.copy(col(PAL[ci]));
    }
    const rp = new THREE.Vector3();
    function makeBean(name, me) {
      const mesh = new THREE.Group(), tilt = new THREE.Group(); tilt.position.y = 0.78; mesh.add(tilt);
      const bm = own(new THREE.MeshStandardMaterial({ roughness: 0.34 })), lm = own(new THREE.MeshStandardMaterial({ roughness: 0.4 }));
      const body = new THREE.Mesh(BG.body, bm); body.position.y = -0.78; body.castShadow = true; tilt.add(body);
      const eyes = new THREE.Mesh(BG.eyes, MAT.eyes); eyes.position.set(0, EY, EZ); tilt.add(eyes);
      const arms = [], legs = [];
      for (const s of [-1, 1]) {
        const a = new THREE.Group(); a.position.set(s * 0.47, 0.12, 0); tilt.add(a);
        const am = new THREE.Mesh(BG.limb, lm); am.scale.set(0.12, 0.25, 0.12); am.position.set(s * 0.05, -0.18, 0); a.add(am); arms.push(a);
        const gl = new THREE.Mesh(BG.glove, MAT.vc); gl.position.x = s * 0.05; a.add(gl);
        const l = new THREE.Group(); l.position.set(s * 0.2, -0.56, 0); tilt.add(l);
        const lg = new THREE.Mesh(BG.limb, lm); lg.scale.set(0.14, 0.17, 0.16); lg.position.set(0, -0.08, 0.02); l.add(lg); legs.push(l);
        const sh = new THREE.Mesh(BG.shoe, MAT.vc); l.add(sh);
      }
      scene.add(mesh);
      return {
        mesh, tilt, body, eyes, arms, legs, bm, lm, tex: null, name, me, hat: null, prop: null, hi: 0, pp: new THREE.Vector3(),
        p: new THREE.Vector3(), v: new THREE.Vector3(), yaw: 0, state: 'run', t: 0, ground: false, gc: null, gn: new THREE.Vector3(0, 1, 0),
        coyote: 0, jumpBuf: 0, diveReq: false, ix: 0, iz: 0, out: false, fin: false, gone: false, place: 0, cp: 0, respawnT: 0, airT: 0, slide: 0,
        phase: Math.random() * 6, sq: 0, sqV: 0, leanX: 0, leanZ: 0, pvx: 0, pvz: 0, spinAx: new THREE.Vector3(1, 0, 0), spinW: 0, q: new THREE.Quaternion(), blink: Math.random() * 4,
        skill: 1, speedMul: 1, wp: 0, lane: 0, think: 0, stuckT: 0, lastZ: 0, door: null, react: 0, tgt: null, hopT: 0, ci: 0, pi: 0
      };
    }

    function makeFX(n, size, map, op) {
      const g = own(new THREE.BufferGeometry()), pos = new Float32Array(n * 3), cl = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) pos[i * 3 + 1] = -1e4;
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cl, 3));
      const m = own(new THREE.PointsMaterial({ size, map, vertexColors: true, transparent: true, opacity: op, depthWrite: false, sizeAttenuation: true }));
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts);
      const vel = new Float32Array(n * 3), life = new Float32Array(n); let k = 0; const tc = new THREE.Color();
      return {
        mat: m,
        spawn(x, y, z, vx, vy, vz, hex, l) { const i = k; k = (k + 1) % n; pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz; tc.set(hex).convertSRGBToLinear(); cl[i * 3] = tc.r; cl[i * 3 + 1] = tc.g; cl[i * 3 + 2] = tc.b; life[i] = l; },
        update(dt, grav, drag) {
          const f = Math.exp(-drag * dt);
          for (let i = 0; i < n; i++) {
            if (life[i] <= 0) continue;
            life[i] -= dt;
            if (life[i] <= 0) { pos[i * 3 + 1] = -1e4; continue; }
            vel[i * 3 + 1] -= grav * dt; vel[i * 3] *= f; vel[i * 3 + 1] *= f; vel[i * 3 + 2] *= f;
            pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
          }
          g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
        },
        clear() { for (let i = 0; i < n; i++) { life[i] = 0; pos[i * 3 + 1] = -1e4; } g.attributes.position.needsUpdate = true; }
      };
    }
    const confRectT = ctex(32, 32, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(6, 11); x.arcTo(6, 8, 9, 8, 2); x.lineTo(23, 8); x.arcTo(26, 8, 26, 11, 2); x.lineTo(26, 21); x.arcTo(26, 24, 23, 24, 2); x.lineTo(9, 24); x.arcTo(6, 24, 6, 21, 2); x.closePath(); x.fill(); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(6, 17, 20, 7); x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(8, 9, 16, 3); });
    const confDotT = ctex(32, 32, (x) => { const g = x.createRadialGradient(13, 12, 1, 16, 16, 11); g.addColorStop(0, '#fff'); g.addColorStop(0.7, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(16, 16, 11, 0, TAU); x.fill(); });
    const confStarT = ctex(32, 32, (x) => { x.fillStyle = '#fff'; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k & 1 ? 5.2 : 12.5, a = -Math.PI / 2 + (k * Math.PI) / 5; x.lineTo(16 + Math.cos(a) * r, 16.5 + Math.sin(a) * r); } x.closePath(); x.fill(); });
    const confetti = (() => {
      const fx = [makeFX(260, 0.26, confRectT, 1), makeFX(190, 0.3, confStarT, 1), makeFX(150, 0.22, confDotT, 1)];
      for (const f of fx) f.mat.alphaTest = 0.08;
      return { spawn(...a) { fx[(Math.random() * 3) | 0].spawn(...a); }, update(...a) { for (const f of fx) f.update(...a); }, clear() { for (const f of fx) f.clear(); } };
    })();
    const puffs = makeFX(160, 1.4, puffT, 0.9), sparks = makeFX(120, 0.6, glowT, 1);
    const CONF = ['#ff5fb0', '#ffe14d', '#4fc3ff', '#8be04e', '#a678ff', '#ff9442', '#ffffff'];
    const burst = (x, y, z, n, spd) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, e = rnd(0.2, 1.3), s = rnd(0.4, 1) * spd; confetti.spawn(x, y, z, Math.cos(a) * Math.cos(e) * s, Math.sin(e) * s + 3, Math.sin(a) * Math.cos(e) * s, pick(CONF), rnd(1.8, 3.2)); } };
    const poof = (x, y, z, hex = '#ffffff', n = 10) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU; puffs.spawn(x + Math.cos(a) * 0.3, y + rnd(0, 0.6), z + Math.sin(a) * 0.3, Math.cos(a) * rnd(1, 3), rnd(0.5, 2.5), Math.sin(a) * rnd(1, 3), hex, rnd(0.35, 0.6)); } };
    const stars = (x, y, z) => { for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; sparks.spawn(x, y, z, Math.cos(a) * 3, rnd(1, 3), Math.sin(a) * 3, pick(['#ffe14d', '#ffffff', '#ff9ed2']), 0.5); } };

    const slime = new THREE.Mesh(own(new THREE.PlaneGeometry(1600, 1600)), MAT.slime); slime.rotation.x = -Math.PI / 2; slime.position.set(0, -6, 90); scene.add(slime);
    {
      const deco = new THREE.Group(); scene.add(deco);
      const DC = ['#ff8fc8', '#7fd4ff', '#ffe066', '#b49bff', '#7ff0c8', '#ffb37a'];
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU + rnd(-0.1, 0.1), r = rnd(150, 230), x = Math.cos(a) * r, z = 90 + Math.sin(a) * r * 1.2, hgt = rnd(30, 90), rad = rnd(5, 12);
        const t = new THREE.Mesh(UG.cyl, mat(DC[i % 6], { map: candyT, roughness: 0.55 })); t.scale.set(rad, hgt, rad); t.position.set(x, hgt / 2 - 8, z); deco.add(t);
        const cap = new THREE.Mesh(UG.sph, mat(DC[(i + 2) % 6], { roughness: 0.35 })); cap.scale.set(rad * 1.3, rad * 0.72, rad * 1.3); cap.position.set(x, hgt - 8, z); deco.add(cap);
      }
      for (let i = 0; i < 16; i++) {
        const a = rnd(0, TAU), r = rnd(120, 300), cx = Math.cos(a) * r, cz = 90 + Math.sin(a) * r, cy = rnd(40, 110), cl = new THREE.Group();
        for (let k = 0; k < 7; k++) { const s = new THREE.Mesh(UG.sph, MAT.cloud), sz = rnd(5, 12) * (k === 2 || k === 3 ? 1.25 : 1); s.scale.set(sz * 1.3, sz * 0.8, sz); s.position.set(k * 5.5 - 16 + rnd(-2, 2), rnd(-2, 3) + (k === 2 || k === 3 ? 2 : 0), rnd(-4, 4)); cl.add(s); }
        cl.position.set(cx, cy, cz); cl.rotation.y = rnd(0, TAU); deco.add(cl);
      }
      for (let i = 0; i < 6; i++) {
        const tor = new THREE.Mesh(own(new THREE.TorusGeometry(9, 3, 14, 36)), mat(DC[i % 6], { map: candyT, roughness: 0.32 }));
        const a = (i / 6) * TAU + 0.3; tor.position.set(Math.cos(a) * 110, rnd(30, 60), 90 + Math.sin(a) * 140); tor.rotation.set(rnd(0, 3), rnd(0, 3), 0); deco.add(tor);
      }
    }

    let R = null;
    const T0 = new THREE.Vector3(), N0 = new THREE.Vector3(), CP = new THREE.Vector3(), U0 = new THREE.Vector3(), PP = new THREE.Vector3();
    const QE = new THREE.Euler(), QT = new THREE.Quaternion(), QS = new THREE.Quaternion();
    const CELL = 8, ckey = (ix, iz) => (ix + 1000) * 4096 + (iz + 1000);
    function newRound() {
      R = { group: new THREE.Group(), geos: [], mats: [], grid: new Map(), kinCols: [], kins: [], zones: [], anims: [], tiles: [], walls: [], boulders: [], stamp: 0, t: 0, def: null };
      scene.add(R.group);
    }
    function endRound() {
      if (!R) return;
      scene.remove(R.group); R.geos.forEach(g => g.dispose()); R.mats.forEach(m => m.dispose()); R = null;
    }
    function syncCol(c) { c.prev.copy(c.mat); c.mat.copy(c.obj.matrixWorld); c.inv.copy(c.mat).invert(); c.c.setFromMatrixPosition(c.mat); }
    function addCol(obj, type, d, o = {}) {
      const c = { type, obj, hx: d.hx || 0, hy: d.hy || 0, hz: d.hz || 0, r: d.r || 0, hh: d.hh || 0, mat: new THREE.Matrix4(), inv: new THREE.Matrix4(), prev: new THREE.Matrix4(), c: new THREE.Vector3(), br: 0, kin: !!o.kin, hit: !!o.hit, on: true, conv: o.conv || null, spin: o.spin || 0, onTouch: o.onTouch || null, ref: o.ref || null, low: !!o.low, bounce: o.bounce || 0, st: 0, tele: false };
      c.br = type === 'box' ? Math.hypot(c.hx, c.hy, c.hz) : type === 'cyl' ? Math.hypot(c.r, c.hh) : c.r;
      obj.updateWorldMatrix(true, false);
      syncCol(c); c.prev.copy(c.mat);
      if (c.kin) R.kinCols.push(c);
      else {
        const x0 = Math.floor((c.c.x - c.br) / CELL), x1 = Math.floor((c.c.x + c.br) / CELL), z0 = Math.floor((c.c.z - c.br) / CELL), z1 = Math.floor((c.c.z + c.br) / CELL);
        for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const k = ckey(i, j); let a = R.grid.get(k); if (!a) R.grid.set(k, a = []); a.push(c); }
      }
      return c;
    }
    const near = [];
    function gather(x, z, rad) {
      near.length = 0; const st = ++R.stamp;
      const x0 = Math.floor((x - rad) / CELL), x1 = Math.floor((x + rad) / CELL), z0 = Math.floor((z - rad) / CELL), z1 = Math.floor((z + rad) / CELL);
      for (let i = x0; i <= x1; i++) for (let j = z0; j <= z1; j++) { const a = R.grid.get(ckey(i, j)); if (a) for (let k = 0; k < a.length; k++) { const c = a[k]; if (c.st !== st) { c.st = st; near.push(c); } } }
      for (let k = 0; k < R.kinCols.length; k++) near.push(R.kinCols[k]);
    }
    function collideAt(c, x, y, z, r) {
      if (c.type === 'sph') {
        const dx = x - c.c.x, dy = y - c.c.y, dz = z - c.c.z, d2 = dx * dx + dy * dy + dz * dz, rr = r + c.r;
        if (d2 >= rr * rr) return 0;
        const d = Math.sqrt(d2) || 1e-4; N0.set(dx / d, dy / d, dz / d); return rr - d;
      }
      T0.set(x, y, z).applyMatrix4(c.inv);
      let qx, qy, qz;
      if (c.type === 'box') { qx = clamp(T0.x, -c.hx, c.hx); qy = clamp(T0.y, -c.hy, c.hy); qz = clamp(T0.z, -c.hz, c.hz); }
      else { const rad = Math.hypot(T0.x, T0.z), s = rad > c.r ? c.r / rad : 1; qx = T0.x * s; qz = T0.z * s; qy = clamp(T0.y, -c.hh, c.hh); }
      const dx = T0.x - qx, dy = T0.y - qy, dz = T0.z - qz, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= r * r) return 0;
      let depth;
      if (d2 > 1e-10) { const d = Math.sqrt(d2); N0.set(dx / d, dy / d, dz / d); depth = r - d; }
      else if (c.type === 'box') {
        const ax = c.hx - Math.abs(T0.x), ay = c.hy - Math.abs(T0.y), az = c.hz - Math.abs(T0.z);
        if (ay <= ax && ay <= az) { N0.set(0, Math.sign(T0.y) || 1, 0); depth = ay + r; }
        else if (ax <= az) { N0.set(Math.sign(T0.x) || 1, 0, 0); depth = ax + r; }
        else { N0.set(0, 0, Math.sign(T0.z) || 1); depth = az + r; }
      } else {
        const rad = Math.hypot(T0.x, T0.z), ar = c.r - rad, ay = c.hh - Math.abs(T0.y);
        if (ay <= ar) { N0.set(0, Math.sign(T0.y) || 1, 0); depth = ay + r; } else { N0.set(T0.x / (rad || 1), 0, T0.z / (rad || 1)); depth = ar + r; }
      }
      N0.transformDirection(c.mat);
      return depth;
    }
    function pointVel(c, p, out) {
      if (!c.kin) return out.set(0, 0, 0);
      PP.copy(p).applyMatrix4(c.inv).applyMatrix4(c.prev);
      out.subVectors(p, PP).multiplyScalar(1 / CFG.step);
      const l = out.length(); if (l > 30) out.multiplyScalar(30 / l);
      return out;
    }
    const turnTo = (a, b, k) => a + clamp(wrapA(b - a), -k, k);
    function dive(b) {
      const fx = Math.sin(b.yaw), fz = Math.cos(b.yaw), hs = Math.hypot(b.v.x, b.v.z), s = Math.max(CFG.diveSpeed * b.speedMul, hs);
      b.v.x = fx * s; b.v.z = fz * s; b.v.y = b.ground ? CFG.diveUp : Math.max(b.v.y, 0) + CFG.diveAirUp;
      b.state = 'dive'; b.slide = 0; b.ground = false; b.gc = null; b.coyote = 0;
      if (b.me) audio.play('dive');
    }
    let focus = null, ALPHA = 1;
    function knock(b, vx, vy, vz, pw) {
      if (b.state === 'rag' && b.t > CFG.ragdollMin - 0.3) return;
      b.v.set(vx, vy, vz); b.state = 'rag'; b.t = CFG.ragdollMin + Math.min(0.6, pw * 0.03); b.ground = false; b.gc = null;
      b.spinAx.set(rnd(-1, 1), rnd(-0.3, 0.3), rnd(-1, 1)).normalize(); b.spinW = rnd(8, 14);
      stars(b.p.x, b.p.y + 1.5, b.p.z);
      if (b.me || (focus && focus.p.distanceToSquared(b.p) < 150 && Math.random() < 0.6)) audio.play('bonk');
    }
    function stepBean(b, dt) {
      const v = b.v, p = b.p;
      if (b.ground && b.gc) {
        if (b.gc.kin && b.gc.on) { pointVel(b.gc, p, U0); p.addScaledVector(U0, dt); if (b.gc.spin) b.yaw += b.gc.spin * dt; }
        if (b.gc.conv) p.addScaledVector(b.gc.conv, dt);
      }
      const st = b.state, hs = Math.hypot(v.x, v.z);
      if (st === 'run') {
        const sp = CFG.runSpeed * b.speedMul, im = Math.hypot(b.ix, b.iz);
        const acc = b.ground ? (im > 0.05 ? CFG.accelGround : CFG.decelGround) : CFG.accelAir * (im > 0.05 ? 1 : 0.2);
        let dx = b.ix * sp - v.x, dz = b.iz * sp - v.z;
        if (!b.ground && hs > sp) { const k = (v.x * b.ix + v.z * b.iz) / (hs || 1); if (k > 0) { dx += v.x * (1 - sp / hs); dz += v.z * (1 - sp / hs); } }
        const dl = Math.hypot(dx, dz), mx = acc * dt;
        if (dl > mx) { dx *= mx / dl; dz *= mx / dl; }
        v.x += dx; v.z += dz;
        if (im > 0.05) b.yaw = turnTo(b.yaw, Math.atan2(b.ix, b.iz), CFG.turnRate * dt);
        if (b.jumpBuf > 0 && b.coyote > 0) { v.y = Math.max(v.y, 0) + CFG.jumpV; b.coyote = 0; b.jumpBuf = 0; b.ground = false; b.gc = null; b.sqV += 5; if (b.me) audio.play('jump'); }
        if (b.diveReq) dive(b);
      } else if (st === 'dive') {
        if (b.ground) { b.slide += dt; const f = Math.exp(-4.5 * dt); v.x *= f; v.z *= f; if (b.slide > CFG.diveSlide) { b.state = 'getup'; b.t = CFG.getUp; } }
        else { v.x += b.ix * 3 * dt; v.z += b.iz * 3 * dt; }
      } else if (st === 'getup') { b.t -= dt; const f = Math.exp(-9 * dt); v.x *= f; v.z *= f; if (b.t <= 0) b.state = 'run'; }
      else if (st === 'rag') { b.t -= dt; if (b.ground) { const f = Math.exp(-3.2 * dt); v.x *= f; v.z *= f; } if (b.t <= 0 && (b.ground || b.t < -2)) { b.state = 'getup'; b.t = CFG.getUp + 0.15; } }
      b.diveReq = false;
      if (b.ground && b.gn.y < 0.985) { v.x += b.gn.x * CFG.gravity * CFG.slopeSlide * dt; v.z += b.gn.z * CFG.gravity * CFG.slopeSlide * dt; }
      for (let i = 0; i < R.zones.length; i++) { const zn = R.zones[i]; if (zn.on && p.x > zn.x0 && p.x < zn.x1 && p.z > zn.z0 && p.z < zn.z1 && p.y > zn.y0 && p.y < zn.y1) { v.x += zn.fx * dt; v.z += zn.fz * dt; } }
      v.y = Math.max(v.y - CFG.gravity * dt, -CFG.maxFall);
      p.addScaledVector(v, dt);
      const wasG = b.ground; b.ground = false; b.gc = null;
      gather(p.x, p.z, 2.4);
      const r = CFG.radius;
      for (let pass = 0; pass < 2; pass++) for (let s = 0; s < 2; s++) {
        const oy = s === 0 ? r : CFG.height - r;
        for (let i = 0; i < near.length; i++) {
          const c = near[i]; if (!c.on) continue;
          const cy = p.y + oy, ex = c.c.x - p.x, ey = c.c.y - cy, ez = c.c.z - p.z, rr = c.br + r;
          if (ex * ex + ey * ey + ez * ez > rr * rr) continue;
          const dep = collideAt(c, p.x, cy, p.z, r); if (dep <= 0) continue;
          p.addScaledVector(N0, dep);
          if (c.kin) { CP.set(p.x, cy, p.z).addScaledVector(N0, -r); pointVel(c, CP, U0); } else U0.set(0, 0, 0);
          const rel = (v.x - U0.x) * N0.x + (v.y - U0.y) * N0.y + (v.z - U0.z) * N0.z;
          if (rel < 0) { const k = 1 + (b.state === 'rag' ? 0.3 : c.bounce); v.x -= N0.x * rel * k; v.y -= N0.y * rel * k; v.z -= N0.z * rel * k; }
          if (c.hit && pass === 0) { const sp = U0.x * N0.x + U0.y * N0.y + U0.z * N0.z; if (sp > CFG.hitMin) knock(b, U0.x * CFG.hitKnock + N0.x * 2, CFG.hitUp + sp * 0.25, U0.z * CFG.hitKnock + N0.z * 2, sp); }
          if (N0.y > 0.55) { b.ground = true; b.gc = c; b.gn.copy(N0); }
          if (c.onTouch) c.onTouch(b, c, N0.y, rel);
        }
      }
      if (b.ground) {
        if (!wasG && b.airT > 0.3) { b.sqV -= Math.min(7, b.airT * 7); if (b.me) audio.play('land'); }
        b.coyote = CFG.coyote; b.airT = 0;
      } else { b.coyote -= dt; b.airT += dt; }
      b.jumpBuf -= dt;
    }
    function beanPairs(list) {
      const r2 = CFG.radius * 2;
      for (let i = 0; i < list.length; i++) {
        const a = list[i]; if (a.gone || a.respawnT > 0) continue;
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j]; if (b.gone || b.respawnT > 0) continue;
          const dy = a.p.y - b.p.y; if (dy > 1.3 || dy < -1.3) continue;
          const dx = a.p.x - b.p.x, dz = a.p.z - b.p.z, d2 = dx * dx + dz * dz; if (d2 >= r2 * r2 || d2 < 1e-8) continue;
          const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, pen = (r2 - d) * 0.5;
          a.p.x += nx * pen; a.p.z += nz * pen; b.p.x -= nx * pen; b.p.z -= nz * pen;
          const rel = (a.v.x - b.v.x) * nx + (a.v.z - b.v.z) * nz;
          if (rel < 0) { const k = rel * CFG.push; a.v.x -= nx * k; a.v.z -= nz * k; b.v.x += nx * k; b.v.z += nz * k; }
          if (rel < -8) { if (a.state === 'dive' && b.state === 'run') knock(b, -nx * 5, 4, -nz * 5, 3); else if (b.state === 'dive' && a.state === 'run') knock(a, nx * 5, 4, nz * 5, 3); }
        }
      }
    }
    function animBean(b, dt, time) {
      const m = b.mesh;
      if (b.gone || b.respawnT > 0) { m.visible = false; return; }
      m.visible = true; m.position.lerpVectors(b.pp, b.p, ALPHA); m.rotation.y = b.yaw;
      if (b.prop) b.prop.rotation.y += dt * (6 + Math.hypot(b.v.x, b.v.z) * 2.2 + (b.ground ? 0 : 10));
      b.sqV += (-b.sq * 170 - b.sqV * 11) * dt; b.sq += b.sqV * dt;
      const sq = clamp(b.sq, -0.32, 0.32), idt = 1 / Math.max(dt, 1e-3);
      const ax = (b.v.x - b.pvx) * idt, az = (b.v.z - b.pvz) * idt; b.pvx = b.v.x; b.pvz = b.v.z;
      const cy = Math.cos(b.yaw), sy = Math.sin(b.yaw), fa = ax * sy + az * cy, sa = ax * cy - az * sy;
      b.leanX = damp(b.leanX, clamp(fa * 0.012, -0.3, 0.35), 7, dt); b.leanZ = damp(b.leanZ, clamp(sa * 0.01, -0.3, 0.3), 7, dt);
      const hs = Math.hypot(b.v.x, b.v.z), t = b.tilt, A = b.arms, L = b.legs;
      let py = 0.78;
      if (b.state === 'rag') { QT.setFromAxisAngle(b.spinAx, b.spinW * dt); b.q.premultiply(QT); b.spinW = damp(b.spinW, b.ground ? 1 : 9, 2, dt); }
      else {
        if (b.state === 'dive') { QE.set(1.4, 0, 0); py = 0.5; } else if (b.state === 'getup') QE.set(0.2, 0, 0); else QE.set(b.leanX + (b.ground ? Math.min(hs, 8) * 0.025 : 0), 0, b.leanZ);
        QS.setFromEuler(QE); b.q.slerp(QS, 1 - Math.exp(-(b.state === 'getup' ? 9 : 15) * dt));
      }
      t.quaternion.copy(b.q);
      if (b.ground && b.state === 'run' && hs > 0.6) {
        b.phase += dt * (5 + hs * 1.7); const k = Math.min(1, hs / 5), sw = Math.sin(b.phase) * k;
        L[0].rotation.x = sw * 0.9; L[1].rotation.x = -sw * 0.9; A[0].rotation.x = -sw * 0.9; A[1].rotation.x = sw * 0.9; A[0].rotation.z = -0.35; A[1].rotation.z = 0.35;
        py += Math.abs(Math.cos(b.phase)) * 0.07 * k;
      } else if (b.state === 'run' && !b.ground) {
        const f = Math.sin(time * 22) * 0.35; L[0].rotation.x = -0.6; L[1].rotation.x = 0.3; A[0].rotation.x = f; A[1].rotation.x = -f; A[0].rotation.z = -2.5; A[1].rotation.z = 2.5;
      } else if (b.state === 'dive') { A[0].rotation.set(-3, 0, -0.2); A[1].rotation.set(-3, 0, 0.2); L[0].rotation.x = 0.35; L[1].rotation.x = 0.25; }
      else if (b.state === 'rag') { const f = Math.sin(time * 14 + b.phase); A[0].rotation.set(f, 0, -1.4 - f * 0.6); A[1].rotation.set(-f, 0, 1.4 + f * 0.6); L[0].rotation.x = f * 0.8; L[1].rotation.x = -f * 0.8; }
      else { const f = Math.sin(time * 2.4 + b.phase) * 0.06; A[0].rotation.set(0, 0, -0.22 - f); A[1].rotation.set(0, 0, 0.22 + f); L[0].rotation.x = L[1].rotation.x = 0; }
      t.position.y = py;
      t.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
      b.blink -= dt; const e = b.blink < 0.12 ? 0.12 : 1; if (b.blink < 0) b.blink = rnd(2, 5);
      const wide = b.state === 'rag' ? 1.22 : 1;
      b.eyes.scale.set(wide, e * wide, wide);
    }

    function boxGeo(wd, ht, d) {
      const g = new THREE.BoxGeometry(wd, ht, d), uv = g.attributes.uv, S = 0.25, dims = [[d, ht], [d, ht], [wd, d], [wd, d], [wd, ht], [wd, ht]];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] * S, uv.getY(i) * dims[f][1] * S); }
      R.geos.push(g); return g;
    }
    const gg = g => (R.geos.push(g), g);
    function mesh(geo, m, parent, x = 0, y = 0, z = 0, shadow = true) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; (parent || R.group).add(o); return o; }
    function plat(x, y, z, wd, d, hex, o = {}) {
      const th = o.th || 1, m = mesh(boxGeo(wd, th, d), o.mat || matsFor(hex), o.parent, x, y - th / 2, z);
      addCol(m, 'box', { hx: wd / 2, hy: th / 2, hz: d / 2 }, o); return m;
    }
    function block(x, y0, z, wd, ht, d, hex, o = {}) { const m = mesh(boxGeo(wd, ht, d), o.mat || matsFor(hex), o.parent, x, y0 + ht / 2, z); if (!o.nocol) addCol(m, 'box', { hx: wd / 2, hy: ht / 2, hz: d / 2 }, o); return m; }
    function ramp(x, z0, z1, y0, y1, wd, hex, o = {}) {
      const dz = z1 - z0, dy = y1 - y0, len = Math.hypot(dz, dy), a = Math.atan2(dy, dz), th = 1;
      const m = mesh(boxGeo(wd, th, len), o.belt ? beltMats(hex) : matsFor(hex), null, x, (y0 + y1) / 2 - (Math.cos(a) * th) / 2, (z0 + z1) / 2 + (Math.sin(a) * th) / 2);
      m.rotation.x = -a;
      const conv = o.belt ? new THREE.Vector3(0, -Math.sin(a), -Math.cos(a)).multiplyScalar(o.belt) : null;
      addCol(m, 'box', { hx: wd / 2, hy: th / 2, hz: len / 2 }, { ...o, conv }); return m;
    }
    const BM = new Map();
    function beltMats(hex) { if (!BM.has(hex)) { const s = matsFor(hex)[0]; BM.set(hex, [s, s, MAT.belt, s, s, s]); } return BM.get(hex); }
    function belt(x, y, z, wd, d, speed, hex) { return plat(x, y, z, wd, d, hex, { mat: beltMats(hex), conv: new THREE.Vector3(0, 0, -speed) }); }
    function post(x, y0, z, r, ht, hex) { const m = mesh(gg(new THREE.CylinderGeometry(r, r, ht, 16)), matsFor(hex)[2], null, x, y0 + ht / 2, z); addCol(m, 'cyl', { r, hh: ht / 2 }); return m; }
    function kin(obj, fn) { if (!obj.parent) R.group.add(obj); R.kins.push({ obj, fn }); return obj; }

    const DM = new Map();
    const discMats = hex => { if (!DM.has(hex)) { const s = matsFor(hex)[0]; DM.set(hex, [s, mat(hex, { map: discT }), s]); } return DM.get(hex); };
    const HUB = '#7c5cff';
    function sweeper(x, y, z, len, speed, phase = 0) {
      post(x, y, z, 0.75, 1.5, HUB);
      mesh(bakeG([
        pr(UG.cyl, '#ffd23f', 0, 1.52, 0, 0.92, 0.14, 0.92),
        pr(UG.sph, '#ffffff', 0, 1.6, 0, 0.8, 0.52, 0.8),
        pr(UG.tor, '#ff4fa3', 0, 1.56, 0, 0.84, 0.84, 0.84, Math.PI / 2, 0, 0),
        pr(UG.sph, '#ffd23f', 0, 2.05, 0, 0.2, 0.2, 0.2)
      ], gg, 0.25), MAT.vc, null, x, y, z);
      const piv = new THREE.Group(); piv.position.set(x, y + 0.5, z); R.group.add(piv);
      const items = [pr(UG.cyl, '#ff4fa3', 0, 0, 0, 0.26, len, 0.26, 0, 0, Math.PI / 2)];
      for (const sd of [-1, 1]) {
        items.push(pr(UG.sph, '#ffd23f', (sd * len) / 2, 0, 0, 0.36, 0.36, 0.36), pr(UG.sph, '#ffffff', (sd * len) / 2 + sd * 0.1, 0.12, 0.1, 0.1, 0.07, 0.07));
        for (let k = 1; k < 4; k++) items.push(pr(UG.cyl, '#ffffff', (sd * len * k) / 8, 0, 0, 0.285, 0.3, 0.285, 0, 0, Math.PI / 2));
      }
      items.push(pr(UG.cyl, '#ffd23f', 0, 0, 0, 0.62, 0.66, 0.62), pr(UG.sph, '#ffffff', 0, 0.32, 0, 0.4, 0.2, 0.4), pr(UG.tor, '#ff4fa3', 0, 0.2, 0, 0.62, 0.62, 0.62, Math.PI / 2, 0, 0));
      const bar = mesh(bakeG(items, gg, 0.3), MAT.vc, piv);
      addCol(bar, 'box', { hx: len / 2, hy: 0.25, hz: 0.25 }, { kin: true, hit: true, low: true });
      kin(piv, t => { piv.rotation.y = phase + speed * t; });
    }
    function disc(x, y, z, r, speed, hex) {
      const g = new THREE.Group(); g.position.set(x, y, z); R.group.add(g);
      const d = mesh(gg(new THREE.CylinderGeometry(r, r * 0.9, 1, 48)), discMats(hex), g, 0, -0.5, 0);
      addCol(d, 'cyl', { r, hh: 0.5 }, { kin: true, spin: speed });
      const rim = mesh(gg(new THREE.TorusGeometry(r * 0.985, 0.17, 8, 56)), MAT.white, g, 0, -0.02, 0, false); rim.rotation.x = Math.PI / 2;
      mesh(gg(new THREE.SphereGeometry(0.7, 16, 8, 0, TAU, 0, Math.PI / 2)), MAT.foam2, g, 0, 0, 0, false);
      const bg = bakeG([
        pr(UG.cyl, '#ffd23f', 0, 0, 0, 0.5, 0.9, 0.5),
        pr(UG.cyl, '#ffffff', 0, 0.12, 0, 0.53, 0.2, 0.53),
        pr(UG.cyl, '#ff4fa3', 0, -0.2, 0, 0.55, 0.18, 0.55),
        pr(UG.sph, '#ff4fa3', 0, 0.44, 0, 0.47, 0.24, 0.47),
        pr(UG.sph, '#ffffff', -0.12, 0.6, 0.1, 0.1, 0.06, 0.06)
      ], gg, 0.3);
      for (let k = 0; k < 2; k++) { const a = k * Math.PI, b = mesh(bg, MAT.vc, g, Math.cos(a) * r * 0.55, 0.45, Math.sin(a) * r * 0.55); addCol(b, 'cyl', { r: 0.5, hh: 0.45 }, { kin: true }); }
      mesh(gg(new THREE.CylinderGeometry(0.6, 0.2, 14, 8)), matsFor(HUB)[0], null, x, y - 8, z, false);
      kin(g, t => { g.rotation.y = speed * t; });
    }
    function pendulum(x, z, yBase, len, amp, speed, phase, span) {
      const yTop = yBase + len + 1.15, px = span / 2 + 0.9;
      const cap = bakeG([pr(UG.sph, '#ffd23f', 0, 0, 0, 0.62, 0.5, 0.62), pr(UG.tor, '#ffffff', 0, -0.32, 0, 0.5, 0.5, 0.5, Math.PI / 2, 0, 0)], gg, 0.3);
      const foot = bakeG([pr(UG.cyl, '#ffd23f', 0, 0, 0, 0.9, 0.3, 0.9), pr(UG.tor, '#ffffff', 0, 0.15, 0, 0.74, 0.74, 0.74, Math.PI / 2, 0, 0)], gg, 0.3);
      for (const sd of [-1, 1]) {
        mesh(gg(new THREE.CylinderGeometry(0.35, 0.45, yTop - yBase + 5, 12)), matsFor(HUB)[0], null, x + sd * px, (yTop + yBase - 5) / 2, z);
        mesh(cap, MAT.vc, null, x + sd * px, yTop + 0.3, z);
        mesh(foot, MAT.vc, null, x + sd * px, yBase + 0.15, z, false);
      }
      const beam = mesh(gg(new THREE.CylinderGeometry(0.3, 0.3, px * 2 + 0.6, 12)), MAT.metal, null, x, yTop, z); beam.rotation.z = Math.PI / 2;
      const piv = new THREE.Group(); piv.position.set(x, yTop, z); R.group.add(piv);
      mesh(gg(new THREE.CylinderGeometry(0.11, 0.11, len, 10)), MAT.metal, piv, 0, -len / 2, 0);
      mesh(bakeG([pr(UG.sph, '#ffd23f', 0, 0, 0, 0.42, 0.42, 0.42), pr(UG.cyl, '#ffffff', 0, -0.5, 0, 0.2, 0.2, 0.2)], gg, 0.3), MAT.vc, piv, 0, 0, 0, false);
      const head = mesh(gg(new THREE.CylinderGeometry(1.05, 1.05, 2.1, 28)), MAT.foam, piv, 0, -len, 0); head.rotation.z = Math.PI / 2;
      for (const sd of [-1, 1]) { const ring = mesh(gg(new THREE.CylinderGeometry(1.1, 1.1, 0.3, 28)), MAT.foam2, piv, sd * 0.9, -len, 0, false); ring.rotation.z = Math.PI / 2; }
      const tr = [];
      for (const sd of [-1, 1]) tr.push(pr(UG.sph, '#ffd23f', sd * 1.06, 0, 0, 0.13, 0.9, 0.9), pr(UG.sph, '#ffffff', sd * 1.18, 0, 0, 0.06, 0.34, 0.34));
      for (const bx of [-0.35, 0, 0.35]) tr.push(pr(UG.cyl, '#ffffff', bx, 0, 0, 1.075, 0.14, 1.075, 0, 0, Math.PI / 2));
      mesh(bakeG(tr, gg, 0.3), MAT.vc, piv, 0, -len, 0, false);
      addCol(head, 'cyl', { r: 1.05, hh: 1.05 }, { kin: true, hit: true });
      kin(piv, t => { piv.rotation.z = amp * Math.sin(speed * t + phase); });
    }
    function fan(xe, y, zc, dir, zl, push, period, phase) {
      const hx = xe - dir * 1.3, g = new THREE.Group(); g.position.set(hx, y + 1.6, zc); R.group.add(g);
      const house = mesh(gg(new THREE.CylinderGeometry(1.8, 1.8, 1.2, 32, 1, true)), MAT.metal2, g); house.rotation.z = Math.PI / 2;
      const gr = [];
      for (const sx of [-0.6, 0.6]) gr.push(pr(UG.tor, '#e6ebff', sx, 0, 0, 1.78, 1.78, 1.78, 0, Math.PI / 2, 0));
      gr.push(pr(UG.tor, '#ffd23f', 0.6, 0, 0, 1.05, 1.05, 1.05, 0, Math.PI / 2, 0), pr(UG.tor, '#ffd23f', 0.6, 0, 0, 0.5, 0.5, 0.5, 0, Math.PI / 2, 0));
      for (let k = 0; k < 6; k++) gr.push(pr(UG.box, '#e6ebff', 0.6, 0, 0, 0.07, 3.5, 0.07, (k * Math.PI) / 6, 0, 0));
      mesh(bakeG(gr, gg, 0.3), MAT.vc, g, 0, 0, 0, false);
      mesh(gg(new THREE.BoxGeometry(1.4, 1.8, 1.4)), matsFor(HUB), null, hx, y - 0.9, zc);
      mesh(bakeG([pr(UG.cyl, '#ffd23f', 0, 0, 0, 0.9, 0.3, 0.9), pr(UG.tor, '#ffffff', 0, 0.15, 0, 0.8, 0.8, 0.8, Math.PI / 2, 0, 0)], gg, 0.3), MAT.vc, null, hx, y + 0.1, zc, false);
      const blades = new THREE.Group(); g.add(blades);
      const bgeo = bakeG([pr(UG.sph, '#ff4fa3', 0, 0.9, 0, 0.09, 0.82, 0.36, 0, 0.5, 0), pr(UG.sph, '#ffffff', 0, 1.62, 0, 0.1, 0.22, 0.28, 0, 0.5, 0)], gg, 0.3);
      for (let k = 0; k < 3; k++) { const bl = mesh(bgeo, MAT.vc, blades, 0, 0, 0, false); bl.rotation.x = (k * TAU) / 3; }
      mesh(bakeG([pr(UG.sph, '#ffd23f', 0, 0, 0, 0.42, 0.42, 0.42), pr(UG.cone, '#ffffff', 0.45, 0, 0, 0.26, 0.5, 0.26, 0, 0, -Math.PI / 2)], gg, 0.3), MAT.vc, blades, 0, 0, 0, false);
      const lines = [];
      for (let k = 0; k < 6; k++) { const l = mesh(gg(new THREE.BoxGeometry(1.8, 0.07, 0.07)), MAT.wind, null, 0, 0, 0, false); l.userData = { o: Math.random() * 10, y: y + rnd(0.4, 3), z: zc + rnd(-zl / 2, zl / 2) }; lines.push(l); }
      const zn = { x0: dir > 0 ? xe - 1.5 : xe - 14, x1: dir > 0 ? xe + 14 : xe + 1.5, z0: zc - zl / 2, z1: zc + zl / 2, y0: y - 1, y1: y + 4, fx: dir * push, fz: 0, on: false };
      R.zones.push(zn);
      let spin = 0;
      kin(g, (t, dt) => {
        zn.on = ((t + phase) % period) < period * 0.55;
        spin += dt * (zn.on ? 22 : 3); blades.rotation.x = spin;
        for (const l of lines) { const u = l.userData, k = ((t * 9 + u.o) % 10) / 10; l.visible = zn.on; l.position.set(hx + dir * (1 + k * 10), u.y, u.z); }
      });
    }
    function seesaw(x, y, z, wd, len, hex) {
      const piv = new THREE.Group(); piv.position.set(x, y - 0.5, z); R.group.add(piv);
      const pl = mesh(boxGeo(wd, 0.6, len), matsFor(hex), piv, 0, 0.2, 0);
      for (const sd of [-1, 1]) {
        const rail = mesh(gg(new THREE.CylinderGeometry(0.17, 0.17, len, 12)), MAT.white, piv, sd * (wd / 2 - 0.15), 0.52, 0, false);
        rail.rotation.x = Math.PI / 2;
        for (const e of [-1, 1]) mesh(UG.sph, MAT.foam2, piv, sd * (wd / 2 - 0.15), 0.52, (e * len) / 2, false).scale.setScalar(0.24);
      }
      for (const e of [-1, 1]) { const bp = mesh(gg(new THREE.CylinderGeometry(0.3, 0.3, wd - 0.2, 14)), MAT.foam, piv, 0, 0.42, (e * (len - 0.5)) / 2, false); bp.rotation.z = Math.PI / 2; }
      const arr = mesh(gg(new THREE.PlaneGeometry(wd - 1.2, len - 3)), MAT.arrow, piv, 0, 0.505, 0, false); arr.rotation.x = -Math.PI / 2;
      { const uv = arr.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (wd - 1.2) / 3, uv.getY(i) * (len - 3) / 4); }
      mesh(gg(new THREE.CylinderGeometry(0.55, 0.55, wd * 0.5, 16)), MAT.metal, piv, 0, -0.1, 0, false).rotation.z = Math.PI / 2;
      const ful = mesh(gg(new THREE.BoxGeometry(1.3, 1.3, len * 0.8)), matsFor(HUB), null, x, y - 1.6, z); ful.rotation.z = Math.PI / 4;
      mesh(gg(new THREE.CylinderGeometry(0.5, 0.25, 12, 8)), matsFor(HUB)[0], null, x, y - 8, z, false);
      const ss = { th: 0, w: 0, tq: 0 };
      addCol(pl, 'box', { hx: wd / 2, hy: 0.3, hz: len / 2 }, { kin: true, ref: ss, onTouch: (b, c, ny) => { if (ny > 0.55) ss.tq += PP.copy(b.p).applyMatrix4(c.inv).x; } });
      kin(piv, (t, dt) => {
        ss.w += (-ss.tq * 0.45 - ss.th * 2.4 - ss.w * 1.8) * dt; ss.th += ss.w * dt; ss.tq = 0;
        if (Math.abs(ss.th) > 0.36) { ss.th = Math.sign(ss.th) * 0.36; ss.w *= -0.25; }
        piv.rotation.z = ss.th;
      });
    }
    const DOORC = ['#ffe066', '#7ff0c8', '#b49bff', '#ffb37a', '#7fd4ff'];
    const DFM = new Map();
    const doorMats = hex => { if (!DFM.has(hex)) { const f = mat(hex, { map: doorT, roughness: 0.42 }), sd = matsFor(hex)[0]; DFM.set(hex, [sd, sd, sd, sd, f, f]); } return DFM.get(hex); };
    const glassM = mat('#bfeaff', { roughness: 0.05, transparent: true, opacity: 0.72, metalness: 0.1 });
    function doors(z, y, n, real, hex) {
      const dw = 3.6, pw = 0.8, ht = 4, total = n * dw + (n + 1) * pw, x0 = -total / 2;
      for (let i = 0; i <= n; i++) block(x0 + i * (dw + pw) + pw / 2, y, z, pw, ht + 0.8, 1.1, HUB);
      block(0, y + ht, z, total, 0.8, 1.1, HUB);
      const bl = [], BC = ['#ff4fa3', '#ffd23f', '#ffffff', '#4fc3ff'];
      for (let i = 0, nb = Math.floor(total / 0.9); i <= nb; i++) bl.push(pr(UG.sph, BC[i % 4], -total / 2 + 0.3 + i * ((total - 0.6) / nb), 0, 0, 0.16, 0.16, 0.16));
      mesh(bakeG(bl, gg, 0), MAT.bulb, null, 0, y + ht + 0.4, z - 0.6, false);
      const ids = shuffle([...Array(n).keys()]).slice(0, real), wl = { z, doors: [] }, dm = doorMats(hex);
      const hd = bakeG([
        pr(UG.cyl, '#ffd23f', 0, 0, 0, 0.17, 0.06, 0.17, Math.PI / 2, 0, 0),
        pr(UG.cyl, '#ffd23f', -0.2, 0, -0.14, 0.05, 0.4, 0.05, 0, 0, Math.PI / 2),
        pr(UG.sph, '#fff2a8', -0.4, 0, -0.14, 0.11, 0.11, 0.11),
        pr(UG.cyl, '#ffd23f', 0, 0, -0.07, 0.05, 0.14, 0.05, Math.PI / 2, 0, 0)
      ], gg, 0.3);
      const winRing = gg(new THREE.TorusGeometry(0.58, 0.1, 10, 28)), winGlass = gg(new THREE.CylinderGeometry(0.56, 0.56, 0.06, 24));
      for (let i = 0; i < n; i++) {
        const dx = x0 + pw + i * (dw + pw) + dw / 2, hinge = new THREE.Group(); hinge.position.set(dx, y, z + 0.35); R.group.add(hinge);
        const dm2 = mesh(gg(new THREE.BoxGeometry(dw - 0.1, ht - 0.05, 0.7)), dm, hinge, 0, ht / 2, -0.35);
        mesh(winGlass, glassM, hinge, 0, ht * 0.66, -0.7, false).rotation.x = Math.PI / 2;
        mesh(winRing, MAT.white, hinge, 0, ht * 0.66, -0.71, false);
        mesh(hd, MAT.goldVC, hinge, dw / 2 - 0.55, ht * 0.42, -0.72, false);
        const d = { x: dx, real: ids.includes(i), open: false, hinge, a: 0, c: null };
        d.c = addCol(dm2, 'box', { hx: (dw - 0.1) / 2, hy: (ht - 0.05) / 2, hz: 0.35 }, { ref: d, onTouch: doorTouch });
        wl.doors.push(d);
      }
      R.walls.push(wl);
    }
    function doorTouch(b, c, ny, rel) {
      const d = c.ref; if (!d.real || d.open || ny > 0.5 || rel > -0.2) return;
      d.open = true; c.on = false; b.v.z = Math.max(b.v.z, 3);
      if (focus && focus.p.distanceToSquared(b.p) < 400) audio.play('door');
      poof(d.x, 0.3 + d.hinge.position.y, d.hinge.position.z, '#ffffff', 8);
      let t = 0;
      R.anims.push(dt => { t += dt; d.a = Math.min(Math.PI / 2, d.a + dt * (2 + t * 10)); d.hinge.rotation.x = d.a; if (t > 1.6) d.hinge.position.y -= dt * 2; return t < 3.2; });
    }
    function hexLayer(y, rings, hex) {
      const Rh = 1.3;
      const lp = [[0, -0.25], [0.8, -0.25], [0.96, 0.18], [0.92, 0.25], [0.78, 0.25], [0.74, 0.215], [0, 0.215]].map(q => new THREE.Vector2(q[0] * Rh, q[1]));
      const geo = gg(new THREE.LatheGeometry(lp, 6).toNonIndexed());
      geo.computeVertexNormals();
      { const pa = geo.attributes.position, na = geo.attributes.normal, cc = new Float32Array(pa.count * 3);
        for (let i = 0; i < pa.count; i++) {
          const ny = na.getY(i), py = pa.getY(i); let b;
          if (ny > 0.9) b = py > 0.23 ? 1.12 : 0.9;
          else if (ny > 0.1) b = 1.05;
          else if (ny < -0.5) b = 0.5;
          else b = 0.66 + 0.34 * ((py + 0.25) / 0.5);
          cc[i * 3] = cc[i * 3 + 1] = cc[i * 3 + 2] = b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(cc, 3)); }
      const m0 = mat(hex, { roughness: 0.3, emissive: col(hex), emissiveIntensity: 0.12, vertexColors: true });
      R.mats.push(m0);
      for (let q = -rings; q <= rings; q++) for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) {
        const x = Rh * Math.sqrt(3) * (q + r / 2), z = Rh * 1.5 * r;
        const m = mesh(geo, m0, null, x, y - 0.25, z, false);
        const tile = { m, m0, st: 0, t: 0, y, c: null };
        tile.c = addCol(m, 'cyl', { r: Rh * 0.93, hh: 0.25 }, { ref: tile, onTouch: tileTouch });
        R.tiles.push(tile);
      }
    }
    let crumbleT = 0;
    function tileTouch(b, c, ny) {
      const tl = c.ref; if (tl.st !== 0 || ny < 0.55) return;
      tl.st = 1; tl.t = CFG.hexDelay; tl.m.material = MAT.tileHit;
      if (crumbleT <= 0 && focus && Math.abs(focus.p.y - tl.y) < 3 && focus.p.distanceToSquared(b.p) < 80) { audio.play('crumble'); crumbleT = 0.12; }
    }
    function updTiles(dt) {
      crumbleT -= dt;
      for (const tl of R.tiles) {
        if (tl.st === 1) { tl.t -= dt; tl.m.position.y = tl.y - 0.25 + Math.sin(tl.t * 60) * 0.03; if (tl.t <= 0) { tl.st = 2; tl.t = CFG.hexDrop; tl.c.on = false; } }
        else if (tl.st === 2) { tl.t -= dt; tl.m.position.y -= dt * (10 * (CFG.hexDrop - tl.t)); tl.m.scale.setScalar(Math.max(0.05, tl.t / CFG.hexDrop)); if (tl.t <= 0) { tl.st = 3; tl.m.visible = false; } }
      }
    }
    function gate(z, y, wd) {
      const m = mesh(boxGeo(wd, 1.2, 0.4), MAT.gate, null, 0, y + 0.6, z);
      for (const sd of [-1, 1]) { const kn = mesh(UG.sph, MAT.foam2, m, (sd * wd) / 2, 0, 0, false); kn.scale.setScalar(0.52); }
      R.gate = { m, c: addCol(m, 'box', { hx: wd / 2, hy: 0.6, hz: 0.2 }), t: -1 };
      const pc = bakeG([pr(UG.sph, '#ffd23f', 0, 1.55, 0, 0.8, 0.5, 0.8), pr(UG.cyl, '#ffffff', 0, 1.2, 0, 0.62, 0.14, 0.62), pr(UG.sph, '#ff4fa3', 0, 1.95, 0, 0.24, 0.24, 0.24)], gg, 0.3);
      for (const sd of [-1, 1]) { block((sd * (wd + 1)) / 2, y, z, 1, 3, 1, HUB); mesh(pc, MAT.vc, null, (sd * (wd + 1)) / 2, y, z, false); }
    }
    function finish(z, y, wd) {
      const pl = bakeG([pr(UG.box, '#ffd23f', 0, 0.15, 0, 1.8, 0.3, 1.8), pr(UG.box, '#ffffff', 0, 3, 0, 1.55, 0.22, 1.55), pr(UG.box, '#ffd23f', 0, 5.85, 0, 1.8, 0.3, 1.8), pr(UG.sph, '#ffd23f', 0, 6.2, 0, 0.5, 0.5, 0.5)], gg, 0.3);
      for (const sd of [-1, 1]) { block((sd * (wd + 1.4)) / 2, y, z, 1.4, 6, 1.4, '#ff5fb0'); mesh(pl, MAT.vc, null, (sd * (wd + 1.4)) / 2, y, z, false); }
      const top = mesh(gg(new THREE.BoxGeometry(wd + 2.8, 1.4, 1.4)), [MAT.foam, MAT.foam, MAT.foam, MAT.foam, MAT.banner, MAT.banner], null, 0, y + 6.7, z);
      top.castShadow = false;
      const ln = mesh(gg(new THREE.PlaneGeometry(wd, 1.4)), MAT.check, null, 0, y + 0.02, z, false); ln.rotation.x = -Math.PI / 2;
      const bi = [];
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
        const bx = sd * (wd / 2 + 0.7) + rnd(-0.4, 0.4), by = 7.8 + k * 0.9, bz = rnd(-0.3, 0.3), c = CONF[(k + (sd > 0 ? 2 : 0)) % 6];
        bi.push(pr(UG.sph, c, bx, by, bz, 0.55, 0.66, 0.55), pr(UG.cone, c, bx, by - 0.68, bz, 0.1, 0.16, 0.1, Math.PI, 0, 0, 0.8), pr(UG.sph, '#ffffff', bx - 0.18, by + 0.24, bz - 0.3, 0.1, 0.07, 0.05), pr(UG.cyl, '#ffffff', bx, by - 1.3, bz, 0.012, 1.0, 0.012));
      }
      mesh(bakeG(bi, gg, 0.25), MAT.vcg, null, 0, y, z, false);
      const fl = [];
      for (let i = 0, nf = Math.round(wd + 2); i < nf; i++) fl.push(pr(UG.cone, ['#ff4fa3', '#ffd23f', '#4fc3ff', '#8be04e'][i & 3], -(wd + 2.4) / 2 + 0.2 + i * ((wd + 2.4 - 0.4) / (nf - 1)), 0, -0.76, 0.2, 0.42, 0.04, 0, 0, Math.PI));
      mesh(bakeG(fl, gg, 0.1), MAT.vc, null, 0, y + 5.78, z, false);
    }
    function boulders(n, xr, zTop, yTop, zBot, yBot, zEnd, r) {
      const dz = zBot - zTop, dy = yBot - yTop, len = Math.hypot(dz, dy), ux = dz / len, uy = dy / len, sa = -uy;
      const bm = mat('#ffffff', { map: boulderT, roughness: 0.42 }); R.mats.push(bm);
      for (let i = 0; i < n; i++) {
        const g = new THREE.Group(); R.group.add(g);
        const m = mesh(gg(new THREE.SphereGeometry(r, 18, 12)), bm, g);
        for (let k = 0; k < 3; k++) { const band = mesh(gg(new THREE.TorusGeometry(r * 0.98, 0.12, 6, 20)), MAT.foam2, m, 0, 0, 0, false); band.rotation.y = (k * Math.PI) / 3; }
        const bo = { g, m, s: 0, sp: 0, x: 0, wait: 1.5 + i * (5 / n), y: 0, z: 0, vy: 0, c: null };
        bo.c = addCol(m, 'sph', { r }, { kin: true, hit: true });
        const reset = () => { bo.s = 0; bo.sp = 2; bo.x = rnd(-xr, xr); bo.vy = 0; bo.c.tele = true; bo.c.on = false; g.visible = false; };
        reset();
        kin(g, (t, dt) => {
          if (!R.live) return;
          if (bo.wait > 0) { bo.wait -= dt; bo.s = 0; bo.z = zTop; bo.y = yTop + r / Math.max(0.5, Math.abs(ux)); bo.c.tele = true; if (bo.wait <= 0) { bo.c.on = true; g.visible = true; } }
          else {
            bo.sp = Math.min(bo.sp + CFG.gravity * sa * 0.7 * dt, 10);
            bo.s += bo.sp * dt;
            if (bo.s < len) { bo.z = zTop + ux * bo.s; bo.y = yTop + uy * bo.s + r / Math.max(0.5, Math.abs(ux)); }
            else { bo.z -= bo.sp * dt; if (bo.z < zEnd) { bo.vy -= CFG.gravity * dt; bo.y += bo.vy * dt; } else bo.y = yBot + r; if (bo.y < yBot - 25) { reset(); bo.wait = rnd(0.5, 2.5); } }
            m.rotation.x -= (bo.sp * dt) / r;
          }
          g.position.set(bo.x, bo.y, bo.z);
        });
      }
    }
    function makeCrown(x, y, z) {
      const g = new THREE.Group(); g.position.set(x, y, z); R.group.add(g);
      const bp = [[0.4, -0.22], [0.5, -0.22], [0.56, -0.17], [0.58, 0.02], [0.54, 0.2], [0.47, 0.22], [0.43, 0.12], [0.4, 0]].map(q => new THREE.Vector2(q[0], q[1]));
      const items = [{ g: gg(new THREE.LatheGeometry(bp, 28)), c: col('#ffc83d'), m: new THREE.Matrix4(), k: 1 }];
      const gemsR = [], gemsB = [];
      for (let k = 0; k < 5; k++) {
        const a = (k * TAU) / 5, ca = Math.cos(a), sa = Math.sin(a);
        items.push(pr(UG.cone, '#ffc83d', ca * 0.46, 0.5, sa * 0.46, 0.15, 0.58, 0.15), pr(UG.sph, '#fff2a8', ca * 0.46, 0.84, sa * 0.46, 0.085, 0.085, 0.085), pr(UG.sph, '#fff6d8', Math.cos(a + 0.6) * 0.585, 0.0, Math.sin(a + 0.6) * 0.585, 0.05, 0.05, 0.05), pr(UG.sph, '#fff6d8', Math.cos(a + 0.3) * 0.58, 0.14, Math.sin(a + 0.3) * 0.58, 0.04, 0.04, 0.04));
        gemsR.push(pr(UG.sph, '#fff', ca * 0.585, -0.02, sa * 0.585, 0.09, 0.115, 0.06, 0, -a + Math.PI / 2, 0));
        gemsB.push(pr(UG.sph, '#fff', ca * 0.5, 0.64, sa * 0.5, 0.045, 0.045, 0.045));
      }
      items.push(pr(UG.tor, '#ffe27a', 0, 0.2, 0, 0.5, 0.5, 0.5, Math.PI / 2, 0, 0), pr(UG.tor, '#ffe27a', 0, -0.2, 0, 0.5, 0.5, 0.5, Math.PI / 2, 0, 0));
      mesh(bakeG(items, gg, 0.3), MAT.goldVC, g);
      mesh(bakeG(gemsR, gg, 0), MAT.gemR, g, 0, 0, 0, false);
      mesh(bakeG(gemsB, gg, 0), MAT.gemB, g, 0, 0, 0, false);
      const vel = mesh(gg(new THREE.SphereGeometry(0.44, 16, 8, 0, TAU, 0, Math.PI / 2)), MAT.velvet, g, 0, 0.1, 0, false); vel.scale.y = 0.5;
      const gm = own(new THREE.SpriteMaterial({ map: glowT, color: 0xffd84a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      R.mats.push(gm);
      const glow = new THREE.Sprite(gm); glow.scale.setScalar(3.6); g.add(glow);
      const tw = [];
      for (let k = 0; k < 4; k++) {
        const tm = own(new THREE.SpriteMaterial({ map: starT, color: 0xfff2b0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); R.mats.push(tm);
        const sp = new THREE.Sprite(tm), a = (k * TAU) / 4 + 0.4; sp.position.set(Math.cos(a) * 0.7, 0.3 + (k % 2) * 0.5, Math.sin(a) * 0.7); g.add(sp); tw.push(sp);
      }
      kin(g, t => { g.rotation.y = t * 1.4; g.position.y = y + Math.sin(t * 2) * 0.18; tw.forEach((sp, k) => sp.scale.setScalar(Math.max(0.05, 0.9 * Math.abs(Math.sin(t * 3 + k * 1.7))))); });
      return g;
    }

    const PC = { pink: '#ff73b9', blue: '#5cc6ff', yel: '#ffd84a', pur: '#a684ff', mint: '#4fe3b6', org: '#ffa152' };
    function cWhirl() {
      const P = PC;
      plat(0, 0, 6, 20, 16, P.blue); gate(13, 0, 20);
      plat(0, 0, 29, 18, 30, P.pink);
      sweeper(0, 0, 21, 16, 1.3, 0); sweeper(0, 0, 37, 16, -1.3, Math.PI / 2);
      disc(-3, 0, 51, 5.5, 0.6, P.yel); disc(3.5, 0, 62, 5.5, -0.7, P.mint); disc(-2, 0, 73, 5.5, 0.8, P.pur);
      plat(0, 0, 90, 12, 20, P.blue);
      pendulum(0, 85, 0, 6, 0.9, 1.8, 0, 12); pendulum(0, 90.5, 0, 6, 0.9, 2.0, 2.1, 12); pendulum(0, 96, 0, 6, 0.9, 1.7, 4.2, 12);
      plat(0, 0, 102, 9, 4, P.org); belt(0, 0, 112, 9, 16, 2.5, P.org); plat(0, 0, 123, 9, 6, P.org);
      fan(-4.5, 0, 108, 1, 6, 5, 3.4, 0); fan(4.5, 0, 116, -1, 6, 5, 3.4, 1.7);
      seesaw(0, 0, 134, 7, 14, P.yel); seesaw(0, 0, 151, 7, 14, P.mint);
      plat(0, 0, 168, 18, 16, P.blue); finish(165, 0, 18);
      return {
        name: 'Whirl Way', kind: 'race', desc: 'Spin, sweep and swing your way to the finish line!', start: { z: 10, y: 0, w: 18 }, finishZ: 165, topY: 0, killY: -5,
        cps: [{ x: 0, y: 0, z: 2, w: 7, d: 8 }, { x: 0, y: 0, z: 41.5, w: 6, d: 2 }, { x: 0, y: 0, z: 80.5, w: 4, d: 3 }, { x: 0, y: 0, z: 121, w: 3, d: 3 }],
        path: [[0, 14, 6], [0, 30, 6], [0, 43.2, 3, 'j'], [-3, 51, 2], [0, 56.5, 1.5, 'j'], [3.5, 62, 2], [0.8, 67.5, 1.5, 'j'], [-2, 73, 2], [-0.5, 79, 2, 'j'], [0, 86, 4], [0, 99, 3], [0, 112, 2.5], [0, 125.6, 2, 'j'], [0, 134, 0.8], [0, 141.6, 0.8, 'j'], [0, 151, 0.8], [0, 158.6, 1, 'j'], [0, 165, 5, 'd'], [0, 172, 5]],
        time: CFG.raceTime
      };
    }
    function cDoors() {
      const P = PC;
      plat(0, 0, 6, 23, 16, P.blue); gate(13, 0, 23);
      plat(0, 0, 33.5, 23, 39, P.pink); belt(0, 0, 59, 23, 12, 2.6, P.pink); plat(0, 0, 80.5, 23, 31, P.pink);
      doors(24, 0, 5, 3, DOORC[0]); doors(38, 0, 5, 3, DOORC[1]); doors(52, 0, 5, 2, DOORC[2]); doors(66, 0, 5, 2, DOORC[3]); doors(80, 0, 5, 2, DOORC[4]);
      sweeper(0, 0, 73, 12, 1.5, 0);
      ramp(0, 96, 110, 0, 4, 12, P.yel); plat(0, 4, 120, 12, 20, P.pur);
      pendulum(0, 116, 4, 6, 0.9, 1.9, 0, 12); pendulum(0, 124, 4, 6, 0.9, 1.7, 2.5, 12);
      seesaw(0, 4, 138, 7, 14, P.mint);
      plat(0, 4, 155, 18, 16, P.blue); finish(152, 4, 18);
      return {
        name: 'Door Rush', kind: 'race', desc: 'Some doors are real, some are fake. Smash through to the finish!', start: { z: 10, y: 0, w: 20 }, finishZ: 152, topY: 4, killY: -5,
        cps: [{ x: 0, y: 0, z: 2, w: 8, d: 8 }, { x: 0, y: 0, z: 39.5, w: 9, d: 4 }, { x: 0, y: 0, z: 81.5, w: 9, d: 6 }, { x: 0, y: 4, z: 111, w: 4, d: 3 }],
        path: [[0, 14, 8], [0, 24, 0, 'D'], [0, 31, 8], [0, 38, 0, 'D'], [0, 45, 8], [0, 52, 0, 'D'], [0, 59, 7], [0, 66, 0, 'D'], [-4, 73, 2], [0, 80, 0, 'D'], [0, 88, 6], [0, 97, 4], [0, 111, 3], [0, 121, 4], [0, 130.2, 2, 'j'], [0, 138, 0.8], [0, 145.3, 1, 'j'], [0, 152, 5, 'd'], [0, 158, 5]],
        time: CFG.raceTime
      };
    }
    function rails(z0, z1, y0, y1, wd) {
      for (const sx of [-1, 1]) { const x = sx * (wd / 2 - 0.25); if (y0 === y1) block(x, y0, (z0 + z1) / 2, 0.5, 1.4, z1 - z0, HUB); else ramp(x, z0, z1, y0 + 1.4, y1 + 1.4, 0.5, HUB); }
    }
    function cSlime() {
      const P = PC;
      plat(0, 0, 5, 16, 14, P.blue); gate(11, 0, 16);
      ramp(0, 12, 30, 0, 4, 12, P.pink); rails(12, 30, 0, 4, 12);
      plat(0, 4, 38, 14, 16, P.yel); sweeper(0, 4, 38, 12, 1.5, 0); rails(30, 46, 4, 4, 14);
      ramp(0, 46, 62, 4, 8, 7, P.mint); rails(46, 62, 4, 8, 7);
      plat(0, 8, 70, 12, 16, P.pur); sweeper(0, 8, 70, 10.5, -1.7, 1); rails(62, 78, 8, 8, 12);
      ramp(0, 78, 96, 8, 12, 10, P.org, { belt: 2.6 }); rails(78, 96, 8, 12, 10);
      plat(0, 12, 98, 10, 4, P.blue);
      const ST = [[0, 102.6, P.pink], [0, 107.4, P.yel], [0, 112.2, P.mint], [0, 117, P.org]];
      for (const [x, z, c] of ST) { plat(x, 12, z, 4.2, 4.2, c); mesh(gg(new THREE.CylinderGeometry(0.5, 0.3, 14, 8)), matsFor(HUB)[0], null, x, 4, z, false); }
      plat(0, 12, 121.85, 12, 4.3, P.pur);
      ramp(0, 124, 142, 12, 16, 12, P.blue); rails(124, 142, 12, 16, 12);
      boulders(2, 4.5, 142, 16, 124, 12, 119.7, 1.3);
      plat(0, 16, 149, 14, 14, P.yel); sweeper(0, 16, 149, 12, -1.8, 1); rails(142, 156, 16, 16, 14);
      ramp(0, 156, 166, 16, 19, 10, P.pink); rails(156, 166, 16, 19, 10);
      plat(0, 19, 173, 16, 14, P.blue); finish(171, 19, 16);
      return {
        name: 'Slime Rise', kind: 'race', desc: 'The slime is rising! Climb to the top before it swallows you!', start: { z: 8, y: 0, w: 14 }, finishZ: 171, topY: 19, killY: -5,
        slime: { y0: -4, rate: CFG.slimeRate, delay: CFG.slimeDelay }, cps: null,
        path: [[0, 12, 4], [0, 30, 3], [3.6, 37, 1.2], [0, 46, 1.5], [0, 62, 1.5], [3.2, 69, 1], [0, 78, 2], [0, 96, 2], [0, 100.2, 0.4, 'j'], [0, 104.5, 0.4, 'j'], [0, 109.3, 0.4, 'j'], [0, 114.1, 0.4, 'j'], [0, 118.9, 0.4, 'j'], [0, 121, 3], [0, 124, 3], [0, 142, 3], [-3.6, 148, 1.2], [0, 156, 2], [0, 166, 2], [0, 171, 4, 'd'], [0, 176, 4]],
        time: CFG.raceTime
      };
    }
    function cHex() {
      hexLayer(0, 7, '#ff8fc8'); hexLayer(-8, 6, '#7fd4ff'); hexLayer(-16, 6, '#ffe066');
      return { name: 'Hex Drop', kind: 'survival', desc: 'Tiles crumble the moment you touch them. Be one of the last beans standing!', killY: -24, topY: 0, time: CFG.hexTime };
    }
    function cCrown() {
      const P = PC;
      plat(0, 0, 5, 18, 14, P.blue); gate(11, 0, 18);
      ramp(0, 12, 40, 0, 7, 16, P.pink);
      boulders(4, 6, 40, 7, 12, 0, -2, 1.4);
      plat(0, 7, 48, 16, 16, P.yel); sweeper(0, 7, 48, 15, 1.9, 0);
      ramp(0, 56, 76, 7, 13, 12, P.org, { belt: 2.4 });
      plat(0, 13, 85, 14, 18, P.pur);
      pendulum(0, 81, 13, 6, 0.9, 1.8, 0, 14); pendulum(0, 89, 13, 6, 0.9, 2.0, 2.2, 14);
      disc(0, 14.2, 99.5, 4.5, 0.7, P.mint); disc(-4, 15.4, 109, 4, -0.8, P.pink); disc(2, 16.6, 117.5, 4, 0.9, P.yel);
      plat(0, 17.8, 128, 12, 10, P.blue);
      mesh(gg(new THREE.CylinderGeometry(4, 5.5, 26, 16)), matsFor(HUB)[0], null, 0, 17.8 - 1 - 13, 128, false);
      for (const s of [-1, 1]) { const fl = mesh(gg(new THREE.CylinderGeometry(0.15, 0.15, 5, 6)), MAT.metal, null, s * 5.5, 20.3, 132.5); const fg = mesh(gg(new THREE.BoxGeometry(0.1, 1.2, 1.8)), MAT.foam, null, s * 5.5, 22.2, 133.4, false); fl.castShadow = fg.castShadow = false; }
      const crown = makeCrown(0, 20.75, 130);
      return {
        name: 'Crown Peak', kind: 'final', desc: 'Climb to the top of the peak and grab the crown to win the show!', start: { z: 8, y: 0, w: 16 }, topY: 18, killY: -5, crown,
        cps: [{ x: 0, y: 0, z: 2, w: 7, d: 6 }, { x: 0, y: 7, z: 41, w: 6, d: 3 }, { x: 0, y: 13, z: 77, w: 5, d: 3 }],
        path: [[0, 12, 6], [0, 40, 5], [3.8, 46, 1.4], [0, 56, 4], [0, 76, 3], [0, 84, 4], [0, 93.7, 1, 'j'], [0, 99.5, 1.2], [-2, 104.3, 0.8, 'j'], [-4, 109, 1], [-1, 113.3, 0.8, 'j'], [2, 117.5, 1], [1, 121.3, 0.8, 'j'], [0, 127.5, 1.5], [0, 130, 0.2, 'c']],
        time: CFG.finalTime
      };
    }
    const COURSES = { whirl: cWhirl, doors: cDoors, slime: cSlime, hex: cHex, crown: cCrown };

    let phase = 'lobby', phaseT = 0, paused = false, player = null, musicWanted = true, show = null;
    const beans = [];
    const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.append(e); return e; };
    const hud = el('div', 'hud', wrap);
    const qualEl = el('div', 'qual', hud, '<b>0 / 0</b><span>QUALIFIED</span>'), qn = qualEl.firstChild, ql = qualEl.lastChild;
    const tlEl = el('div', 'tl', hud, '<b></b><span class="chip"></span>'), tlName = tlEl.firstChild, tlChip = tlEl.lastChild;
    const trEl = el('div', 'tr', hud, '<span class="tm ol">0:00</span>'), tmEl = trEl.firstChild;
    const pzBtn = el('button', 'pz', trEl, '<i></i>'); pzBtn.setAttribute('aria-label', 'Pause');
    const big = el('div', 'big', hud), hint = el('div', 'hint', hud), feed = el('div', 'feed', hud);
    const tc = el('div', 'tc', wrap), joy = el('div', 'joy idle', tc, '<i></i>'), knob = joy.firstChild;
    const jumpB = el('button', 'tb jp', tc, 'JUMP'), diveB = el('button', 'tb dv', tc, 'DIVE');
    const scr = el('div', 'scr', wrap);
    let lastQ = '', lastTm = '', hintT = 0, touchOn = COARSE;
    function banner(text, cls, hold) { big.className = 'big'; void big.offsetWidth; big.textContent = text; big.className = 'big ' + (hold ? 'hold ' : 'show ') + (cls || ''); }
    function say(text, me) { const d = el('div', me ? 'me' : '', feed, text); while (feed.children.length > 4) feed.firstChild.remove(); api.timeout(() => d.remove(), 3000); }
    function showHint(t, s) { hint.textContent = t; hint.classList.add('on'); hintT = s; }
    const fmtT = s => { s = Math.max(0, Math.ceil(s)); return ((s / 60) | 0) + ':' + String(s % 60).padStart(2, '0'); };

    const camS = { yaw: 0, pitch: CFG.camPitch, tx: 0, ty: 0, tz: 0, shake: 0 };
    const LA = new THREE.Vector3(), LB = new THREE.Vector3(), CA = new THREE.Vector3(), CB = new THREE.Vector3(), T1 = new THREE.Vector3(), T2 = new THREE.Vector3();
    function camSnap(b) { camS.tx = b.p.x; camS.ty = b.p.y + CFG.camLook; camS.tz = b.p.z; }
    function camFollow(b, dt) {
      if (b.respawnT <= 0 && !b.gone) { rp.lerpVectors(b.pp, b.p, ALPHA); camS.tx = damp(camS.tx, rp.x, 10, dt); camS.ty = damp(camS.ty, rp.y + CFG.camLook, 5, dt); camS.tz = damp(camS.tz, rp.z, 10, dt); }
      const cp = Math.cos(camS.pitch), d = CFG.camDist;
      cam.position.set(camS.tx - Math.sin(camS.yaw) * cp * d, camS.ty + Math.sin(camS.pitch) * d, camS.tz - Math.cos(camS.yaw) * cp * d);
      if (camS.shake > 0) { camS.shake -= dt; cam.position.x += rnd(-1, 1) * camS.shake * 0.4; cam.position.y += rnd(-1, 1) * camS.shake * 0.4; }
      cam.lookAt(camS.tx, camS.ty, camS.tz);
    }
    function camIntro(t) {
      const e = t * t * (3 - 2 * t);
      cam.position.lerpVectors(CA, CB, e); cam.position.y += Math.sin(e * Math.PI) * 9; T1.lerpVectors(LA, LB, e); cam.lookAt(T1);
    }

    let joyId = null, camId = null, jx0 = 0, jy0 = 0, lx = 0, ly = 0, locked = false;
    const joyV = { x: 0, y: 0 };
    const inPlay = () => phase === 'play' || phase === 'count' || phase === 'end';
    const scaleOf = () => { const r = wrap.getBoundingClientRect(); return { r, s: r.width / (wrap.offsetWidth || r.width) }; };
    api.on(wrap, 'pointerdown', e => {
      audio.music(musicWanted);
      if (e.target.closest('button') || e.target.closest('.pan') || e.target.closest('.cust')) return;
      if (e.pointerType === 'touch') touchOn = true;
      if (phase === 'intro') { skipIntro(); return; }
      if (phase === 'lobby') { startShow(); return; }
      if (!inPlay() || paused) return;
      const { r, s } = scaleOf(), fx = (e.clientX - r.left) / r.width;
      if (e.pointerType !== 'mouse' && fx < 0.5 && joyId === null) {
        joyId = e.pointerId; jx0 = e.clientX; jy0 = e.clientY;
        joy.style.left = (e.clientX - r.left) / s + 'px'; joy.style.top = (e.clientY - r.top) / s + 'px'; joy.classList.add('on'); joy.classList.remove('idle'); knob.style.transform = '';
      } else if (camId === null) {
        camId = e.pointerId; lx = e.clientX; ly = e.clientY;
        if (e.pointerType === 'mouse' && phase === 'play' && !locked) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {} }
      }
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
    });
    api.on(wrap, 'pointermove', e => {
      if (e.pointerId === joyId) {
        const { s } = scaleOf(); let dx = (e.clientX - jx0) / s, dy = (e.clientY - jy0) / s; const m = Math.hypot(dx, dy), R0 = 50;
        if (m > R0) { dx *= R0 / m; dy *= R0 / m; }
        joyV.x = dx / R0; joyV.y = dy / R0; knob.style.transform = `translate(${dx}px,${dy}px)`;
      } else if (e.pointerId === camId && !locked) {
        const k = e.pointerType === 'mouse' ? 0.0055 : 0.0075;
        camS.yaw -= (e.clientX - lx) * k; camS.pitch = clamp(camS.pitch + (e.clientY - ly) * k * 0.8, -0.15, 1.25); lx = e.clientX; ly = e.clientY;
      }
    });
    const endPtr = e => { if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; joy.classList.remove('on'); joy.classList.add('idle'); joy.style.left = joy.style.top = ''; knob.style.transform = ''; } if (e.pointerId === camId) camId = null; };
    api.on(wrap, 'pointerup', endPtr); api.on(wrap, 'pointercancel', endPtr);
    api.on(document, 'pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
    api.on(document, 'mousemove', e => { if (locked) { camS.yaw -= (e.movementX || 0) * 0.0035; camS.pitch = clamp(camS.pitch + (e.movementY || 0) * 0.0028, -0.15, 1.25); } });
    const unlock = () => { if (locked) { try { document.exitPointerLock(); } catch (err) {} } };
    const tbtn = (b, fn) => {
      api.on(b, 'pointerdown', e => { e.preventDefault(); e.stopPropagation(); touchOn = true; b.classList.add('on'); fn(); });
      for (const t of ['pointerup', 'pointercancel', 'pointerleave']) api.on(b, t, () => b.classList.remove('on'));
    };
    const doJump = () => { if (player && phase === 'play' && !player.gone) player.jumpBuf = CFG.jumpBuf; };
    const doDive = () => { if (player && phase === 'play' && !player.gone && player.state === 'run') player.diveReq = true; };
    tbtn(jumpB, doJump); tbtn(diveB, doDive);
    api.on(pzBtn, 'pointerdown', e => { e.stopPropagation(); e.preventDefault(); setPause(!paused); });
    api.on(window, 'keydown', e => {
      audio.music(musicWanted);
      const c = e.code;
      if (c === 'Tab' || e.metaKey || e.altKey) return;
      if (paused) { if (c === 'Enter' || c === 'Space' || c === 'KeyP') { e.preventDefault(); setPause(false); } return; }
      if (phase === 'lobby') { if (!/^(Shift|Control|Alt|Meta)/.test(c)) { e.preventDefault(); startShow(); } return; }
      if (phase === 'summary') { if (c === 'Enter' || c === 'Space') { e.preventDefault(); startShow(); } return; }
      if (phase === 'intro') { if (c === 'Enter' || c === 'Space') { e.preventDefault(); skipIntro(); } return; }
      if (c === 'KeyP') { setPause(true); return; }
      if (e.repeat) return;
      if (c === 'Space') { e.preventDefault(); doJump(); }
      else if (c === 'ShiftLeft' || c === 'ShiftRight' || c === 'ControlLeft' || c === 'ControlRight' || c === 'KeyC') { e.preventDefault(); doDive(); }
    });
    function playerInput() {
      const b = player; if (!b) return;
      let kx = 0, kz = 0;
      if (phase === 'play' && !b.gone) {
        if (keys.has('KeyW') || keys.has('ArrowUp')) kz += 1;
        if (keys.has('KeyS') || keys.has('ArrowDown')) kz -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) kx += 1;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) kx -= 1;
        kx += joyV.x; kz -= joyV.y;
      }
      const m = Math.hypot(kx, kz); if (m > 1) { kx /= m; kz /= m; }
      const fx = Math.sin(camS.yaw), fz = Math.cos(camS.yaw);
      b.ix = fx * kz - fz * kx; b.iz = fz * kz + fx * kx;
    }
    function setPause(on) {
      if (on && !inPlay()) return;
      paused = on; unlock();
      if (on) {
        scr.style.pointerEvents = 'auto';
        scr.innerHTML = `<div class="pan"><h3>PAUSED</h3><p>${R && R.def ? R.def.name : ''}</p><div class="btns"><button class="fbtn" data-a="res">Resume</button><button class="fbtn alt" data-a="quit">Leave show</button></div></div>`;
      } else { scr.innerHTML = ''; }
    }
    api.on(scr, 'pointerdown', e => {
      const b = e.target.closest('[data-a]'); if (!b || e.button > 0) return;
      e.preventDefault(); e.stopPropagation();
      const a = b.dataset.a; audio.play('tap');
      if (a === 'res') setPause(false);
      else if (a === 'quit') { setPause(false); leaveShow(); }
      else if (a === 'play') startShow();
      else if (a === 'lobby') toLobby();
      else if (a.startsWith('c')) { prefs.ci = +a.slice(1); skinBean(player, prefs.ci, prefs.pi); persist(); markCust(); }
      else if (a.startsWith('p')) { prefs.pi = +a.slice(1); skinBean(player, prefs.ci, prefs.pi); persist(); markCust(); }
      else if (a.startsWith('h')) { prefs.hi = +a.slice(1); setHat(player, prefs.hi); player.sqV += 4; persist(); markCust(); }
    });

    const LOB = new THREE.Vector3(0, 110, -40);
    const lobby = new THREE.Group(); lobby.position.copy(LOB); scene.add(lobby);
    {
      const pd = new THREE.Mesh(own(new THREE.CylinderGeometry(1.6, 1.9, 0.6, 40)), mat('#ff8fc8', { map: discT, roughness: 0.35 })); pd.position.y = -0.3; pd.receiveShadow = true; lobby.add(pd);
      const rim = new THREE.Mesh(own(new THREE.TorusGeometry(1.62, 0.13, 10, 48)), MAT.foam2); rim.rotation.x = Math.PI / 2; lobby.add(rim);
      const base = new THREE.Mesh(own(new THREE.CylinderGeometry(2.4, 2.8, 0.7, 40)), mat('#7c5cff', { map: sideT, roughness: 0.4 })); base.position.y = -0.9; lobby.add(base);
      const step = new THREE.Mesh(own(new THREE.CylinderGeometry(2.05, 2.15, 0.2, 40)), mat('#ffd23f', { roughness: 0.35 })); step.position.y = -0.6; lobby.add(step);
      const bl = [];
      for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU; bl.push(pr(UG.sph, ['#ff4fa3', '#ffd23f', '#ffffff', '#4fc3ff'][i & 3], Math.cos(a) * 2.45, 0, Math.sin(a) * 2.45, 0.075, 0.075, 0.075)); }
      lobby.add(new THREE.Mesh(bakeG(bl, own, 0), MAT.bulb)); lobby.children[lobby.children.length - 1].position.y = -0.62;
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, s2 = new THREE.Mesh(UG.sph, mat(CONF[i % 6], { roughness: 0.25 })); s2.scale.setScalar(0.22); s2.position.set(Math.cos(a) * 2.9, -0.5, Math.sin(a) * 2.9); lobby.add(s2); }
      const beam = new THREE.Mesh(own(new THREE.ConeGeometry(2.3, 6.5, 32, 1, true)), own(new THREE.MeshBasicMaterial({ color: 0xfff4c8, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })));
      beam.position.y = 3.1; lobby.add(beam);
    }
    function markCust() {
      scr.querySelectorAll('.sw').forEach((s, i) => s.classList.toggle('on', i === prefs.ci));
      scr.querySelectorAll('.pt').forEach((s, i) => s.classList.toggle('on', i === prefs.pi));
      scr.querySelectorAll('.ht').forEach((s, i) => s.classList.toggle('on', i === prefs.hi));
    }
    function toLobby() {
      endRound(); phase = 'lobby'; phaseT = 0; paused = false; unlock();
      musicWanted = true; audio.music(true);
      hud.hidden = true; tc.hidden = true; lobby.visible = true;
      for (const b of beans) { b.gone = true; b.mesh.visible = false; }
      player.gone = false; player.p.copy(LOB); player.v.set(0, 0, 0); player.state = 'run'; player.ground = true; player.yaw = 0.4; player.q.identity();
      slime.position.y = -6;
      scr.style.pointerEvents = 'auto';
      scr.innerHTML = `<div class="lob" style="position:absolute;inset:0;pointer-events:none"></div><div class="ttl">FALL<br>GUYS<small>JELLYBEAN PARTY SHOW</small></div>
<div class="stats"><div>CROWNS ${prefs.crowns}</div><div>SHOWS ${prefs.shows}</div>${prefs.best ? `<div>BEST ${prefs.best}</div>` : ''}</div>
<div class="cust"><div class="row">${PAL.map((c, i) => `<button class="sw" data-a="c${i}" style="background:${c}" aria-label="Colour ${i + 1}"></button>`).join('')}</div>
<div class="row">${PATS.map((p, i) => `<button class="pt" data-a="p${i}">${p}</button>`).join('')}</div>
<div class="row hr">${HATS.map((p, i) => `<button class="pt ht" data-a="h${i}">${p}</button>`).join('')}</div>
<button class="fbtn" data-a="play">PLAY</button></div>`;
      markCust();
    }

    const NAMES = { whirl: 'Whirl Way', doors: 'Door Rush', slime: 'Slime Rise', hex: 'Hex Drop', crown: 'Crown Peak' };
    const used = new Set();
    player = makeBean('You', true); skinBean(player, prefs.ci, prefs.pi); setHat(player, prefs.hi); beans.push(player);
    for (let i = 1; i < CFG.players; i++) beans.push(makeBean('', false));
    function rollBots() {
      used.clear();
      for (const b of beans) {
        if (b.me) continue;
        b.name = botName(used); b.skill = rnd(0.45, 1);
        const ci = (Math.random() * PAL.length) | 0; let ai = (Math.random() * PAL.length) | 0; if (ai === ci) ai = (ai + 3) % PAL.length;
        skinBean(b, ci, (Math.random() * PATS.length) | 0, Math.random() < 0.5 ? null : ai);
        setHat(b, Math.random() < 0.65 ? 1 + ((Math.random() * (HATS.length - 1)) | 0) : 0);
      }
    }
    function resetBean(b, x, y, z, yaw) {
      b.p.set(x, y, z); b.pp.copy(b.p); b.v.set(0, 0, 0); b.state = 'run'; b.t = 0; b.ground = false; b.gc = null; b.fin = false; b.gone = false; b.place = 0; b.cp = 0; b.respawnT = 0; b.airT = 0;
      b.yaw = yaw; b.q.identity(); b.jumpBuf = 0; b.diveReq = false; b.ix = b.iz = 0; b.wp = 0; b.lane = rnd(-1, 1); b.lastZ = z; b.stuckT = 0; b.door = null; b.tgt = null; b.hideT = 0; b.pvx = b.pvz = 0; b.think = 0; b.react = 0;
      b.speedMul = b.me ? 1 : clamp(rnd(0.8, 0.93) + b.skill * 0.04, 0.8, 0.96) * (R.def.kind === 'final' ? 0.86 : 1);
    }
    function startShow() {
      if (phase !== 'lobby' && phase !== 'summary') return;
      audio.play('tap'); rollBots();
      show = { rounds: [Math.random() < 0.5 ? 'whirl' : 'doors', 'slime', 'hex', 'crown'], idx: 0, points: 10, log: [], submitted: false, best: false, winner: null };
      for (const b of beans) b.out = false;
      prefs.shows++; persist(); api.score(show.points);
      lobby.visible = false; startRound(0);
    }
    function startRound(i) {
      endRound(); newRound(); confetti.clear();
      show.idx = i;
      const def = COURSES[show.rounds[i]](); R.def = def;
      R.group.updateMatrixWorld(true);
      R.field = beans.filter(b => !b.out);
      const n = R.field.length;
      R.quota = def.kind === 'race' ? Math.max(1, Math.round(n * CFG.quota[Math.min(i, 1)])) : def.kind === 'survival' ? Math.max(2, Math.round(n * CFG.quota[2])) : 1;
      R.qual = 0; R.elim = 0; R.live = false; R.meDone = 0; R.meT = 0; R.time = def.time; R.playT = 0; R.cd = -1;
      for (const b of beans) { b.gone = b.out; b.mesh.visible = !b.out; }
      const order = shuffle(R.field.slice());
      if (def.kind === 'survival') {
        const spots = shuffle(R.tiles.filter(t => t.y === 0 && Math.hypot(t.m.position.x, t.m.position.z) < 7));
        order.forEach((b, k) => { const t = spots[k % spots.length]; resetBean(b, t.m.position.x, 0.1, t.m.position.z, Math.atan2(-t.m.position.x, -t.m.position.z)); });
        CA.set(24, 16, -24); LA.set(0, -6, 0); CB.set(player.p.x * 1.6, 7, player.p.z * 1.6 - 1); LB.set(0, -2, 0);
      } else {
        const s = def.start, sp = Math.min(2.4, s.w / 5);
        order.forEach((b, k) => resetBean(b, ((k % 5) - 2) * sp + rnd(-0.2, 0.2), s.y + 0.05, s.z - Math.floor(k / 5) * 2.2, 0));
        const ez = def.finishZ || 130;
        CA.set(18, def.topY + 22, ez + 14); LA.set(0, def.topY * 0.6, ez * 0.55); CB.set(0, s.y + 5.5, s.z - 10); LB.set(0, s.y + 1.4, s.z + 5);
      }
      slime.position.y = def.slime ? def.slime.y0 : def.killY - 1;
      phase = 'intro'; phaseT = 0; paused = false; unlock();
      hud.hidden = false; tc.hidden = true; musicWanted = true; audio.music(true);
      tlName.textContent = def.name; tlChip.textContent = 'ROUND ' + (i + 1) + (i === 3 ? ' · FINAL' : '');
      lastQ = ''; updQual(); tmEl.textContent = fmtT(def.time); big.className = 'big';
      const kind = def.kind === 'race' ? 'RACE' : def.kind === 'survival' ? 'SURVIVAL' : 'FINAL';
      scr.style.pointerEvents = 'none';
      scr.innerHTML = `<div class="card"><div class="rn">ROUND ${i + 1}</div><div class="nm">${def.name}</div><span class="chip">${kind} · ${def.kind === 'final' ? 'FIRST TO THE CROWN WINS' : def.kind === 'survival' ? R.quota + ' SURVIVE' : R.quota + ' OF ' + n + ' QUALIFY'}</span><div class="ds">${def.desc}</div></div>`;
      focus = player;
      const nmEl = scr.querySelector('.nm');
      if (nmEl) {
        const pool = Object.values(NAMES), fin = def.name;
        let k = 0;
        const spin = () => { if (!nmEl.isConnected || phase !== 'intro') return; if (k < 12) { nmEl.textContent = pool[k % pool.length]; nmEl.style.opacity = '.55'; k++; api.timeout(spin, 55 + k * 9); audio.play('tap'); } else { nmEl.textContent = fin; nmEl.style.opacity = '1'; nmEl.animate([{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.6,.5,1)' }); audio.play('go'); } };
        spin();
      }
    }
    function skipIntro() { if (phase === 'intro' && phaseT > 0.4) phaseT = 99; }
    function toCount() {
      phase = 'count'; phaseT = 0; R.cd = -1; scr.innerHTML = '';
      camS.pitch = CFG.camPitch; camS.yaw = R.def.kind === 'survival' ? Math.atan2(-player.p.x, -player.p.z) : 0;
      camSnap(player); lastTm = '';
      if (show.idx === 0) showHint(touchOn ? 'Left: run  ·  Right: look  ·  JUMP / DIVE' : 'WASD run · Space jump · Shift dive · drag to look', 6);
    }
    function goLive() {
      phase = 'play'; R.live = true;
      if (R.gate) { R.gate.c.on = false; const gm = R.gate.m; R.anims.push(dt => { gm.position.y -= dt * 5; return gm.position.y > -2; }); }
    }
    function endPhase(next) { phase = 'end'; phaseT = 0; R.next = next; unlock(); }
    function updQual() {
      if (!R || !R.def) return;
      const def = R.def; let s, lab, cls = '';
      if (def.kind === 'race') { s = R.qual + ' / ' + R.quota; lab = 'QUALIFIED'; }
      else if (def.kind === 'survival') { s = R.elim + ' / ' + Math.max(0, R.field.length - R.quota); lab = 'ELIMINATED'; cls = 'sv'; }
      else { s = String(R.field.length); lab = 'FINALISTS'; cls = 'fn'; }
      if (s + lab === lastQ) return; lastQ = s + lab; qn.textContent = s; ql.textContent = lab; ql.className = cls;
    }
    function splash(b) { poof(b.p.x, slime.position.y + 0.3, b.p.z, '#ff7be0', 12); if (b.me || (focus && focus.p.distanceToSquared(b.p) < 300)) audio.play('splash'); }
    function respawn(b) {
      const cps = R.def.cps, c = cps[Math.min(b.cp, cps.length - 1)], P = R.def.path;
      b.p.set(c.x + rnd(-c.w, c.w), c.y + 0.1, c.z + rnd(0, c.d)); b.pp.copy(b.p); b.v.set(0, 0, 0); b.state = 'run'; b.ground = false; b.gc = null; b.q.identity(); b.yaw = 0; b.respawnT = 0;
      b.wp = 0; while (b.wp < P.length - 1 && P[b.wp][1] < b.p.z - 0.6) b.wp++;
      b.lastZ = b.p.z; b.stuckT = 0; b.door = null;
      poof(b.p.x, b.p.y + 0.4, b.p.z, '#ffffff', 8);
      if (b.me) audio.play('boing');
    }
    function meQualified(place) {
      R.meDone = 2; R.meT = 0;
      const i = show.idx, pts = R.def.kind === 'race' ? 100 * (i + 1) + Math.max(0, R.quota - place) * 10 : 300;
      show.points += pts; api.score(show.points);
      show.log[i] = { st: 'ok', place };
      banner('QUALIFIED!', 'q', true); audio.play('qual');
    }
    function qualify(b) {
      b.fin = true; R.qual++; b.place = R.qual; b.hideT = 1.5;
      burst(b.p.x, b.p.y + 1.5, b.p.z, b.me ? 90 : 12, b.me ? 9 : 5);
      if (b.me) meQualified(b.place); else if (Math.random() < 0.45) say(b.name + ' qualified');
      updQual();
    }
    function meOut() {
      if (R.meDone) return; R.meDone = 1;
      show.log[show.idx] = { st: 'out' };
      banner('ELIMINATED!', 'e', true); audio.play('elim');
      endPhase('summary');
    }
    function eliminate(b) {
      b.out = true; b.gone = true; R.elim++;
      if (b.me) meOut(); else if (R.def.kind === 'survival') say(b.name + ' eliminated');
      updQual();
    }
    function closeRace() {
      for (const b of R.field) if (!b.fin && !b.out) { b.out = true; if (b.me) { meOut(); } }
      if (phase === 'play') { banner('ROUND OVER!', '', true); endPhase('round'); }
    }
    function resolveRace() {
      const act = R.field.filter(b => !b.fin && !b.out).sort((a, b) => b.p.z - a.p.z);
      for (const b of act) { if (R.qual < R.quota) { b.fin = true; R.qual++; b.place = R.qual; b.gone = true; } else b.out = true; }
      updQual(); banner('ROUND OVER!', '', true); endPhase('round');
    }
    function crownWin(b) {
      R.meDone = b.me ? 3 : 1; show.winner = b.me ? null : b.name;
      const cr = R.def.crown; cr.visible = false; burst(cr.position.x, cr.position.y, cr.position.z, 180, 11);
      if (b.me) { show.points += 1000; api.score(show.points); show.log[show.idx] = { st: 'win' }; prefs.crowns++; persist(); banner('WINNER!', 'w', true); audio.play('win'); b.v.set(0, 9, 0); }
      else { show.log[show.idx] = { st: 'lost' }; banner('ROUND OVER!', 'e', true); audio.play('elim'); say(b.name + ' grabbed the crown!'); }
      endPhase('summary');
    }
    function leaveShow() {
      if (!show || !R) return;
      if (!show.log[show.idx]) show.log[show.idx] = { st: 'out' };
      showSummary();
    }
    function showSummary() {
      phase = 'summary'; phaseT = 0; unlock(); hud.hidden = true; tc.hidden = true; musicWanted = false; audio.music(false);
      if (!show.submitted) { show.submitted = true; show.best = api.submit(show.points); prefs.best = Math.max(prefs.best, show.points); persist(); }
      const won = show.log.some(l => l && l.st === 'win'), lost = show.log.some(l => l && l.st === 'lost');
      const title = won ? 'CROWNED!' : lost ? 'SO CLOSE!' : 'ELIMINATED';
      const sub = won ? 'You won the show and grabbed the crown!' : show.winner ? show.winner + ' grabbed the crown.' : lost ? 'Nobody reached the crown in time.' : 'Knocked out in round ' + (show.idx + 1) + '.';
      const rows = show.rounds.map((k, i) => {
        const l = show.log[i], nm = i <= show.idx ? NAMES[k] : '???';
        const st = !l ? '<b class="na">-</b>' : l.st === 'ok' ? `<b class="ok">QUALIFIED${l.place ? ' #' + l.place : ''}</b>` : l.st === 'win' ? '<b class="ok">WINNER</b>' : '<b class="no">ELIMINATED</b>';
        return `<div><span>${i + 1}. ${nm}</span>${st}</div>`;
      }).join('');
      scr.style.pointerEvents = 'auto';
      scr.innerHTML = `<div class="pan"><h3>${title}</h3><p>${sub}</p><div class="rl">${rows}</div><div class="pts">${show.points} pts</div><p>${show.best ? 'New best show!' : 'Best: ' + prefs.best + ' pts'} · Crowns: ${prefs.crowns}</p><div class="btns"><button class="fbtn" data-a="play">Play again</button><button class="fbtn alt" data-a="lobby">Customize</button></div></div>`;
    }

    function threat(b) {
      for (const c of R.kinCols) {
        if (!c.low || !c.on || Math.abs(c.c.y - b.p.y - 0.5) > 1.2) continue;
        T1.copy(b.p).applyMatrix4(c.inv);
        if (Math.abs(T1.x) > c.hx + 0.4 || Math.abs(T1.z) > 2.4) continue;
        T2.set(T1.x, 0, 0).applyMatrix4(c.mat); pointVel(c, T2, U0);
        if ((b.p.x - T2.x) * U0.x + (b.p.z - T2.z) * U0.z > 0 && Math.abs(T1.z) < 0.9 + Math.hypot(U0.x, U0.z) * 0.13) return true;
      }
      return false;
    }
    function pickDoor(b, wl, not) {
      if (not && !not.real) not.known = true;
      const open = wl.doors.filter(d => d.open);
      if (open.length && Math.random() < 0.35 + b.skill * 0.55) return open.reduce((a, d) => (Math.abs(d.x - b.p.x) < Math.abs(a.x - b.p.x) ? d : a));
      let c = wl.doors.filter(d => d !== not && !(d.known && Math.random() < b.skill));
      if (!c.length) c = wl.doors.filter(d => d !== not);
      return pick(c);
    }
    const LAYERS = [0, -8, -16];
    function hexAI(b, dt) {
      let ly = -16; for (const y of LAYERS) if (b.p.y > y - 2) { ly = y; break; }
      b.think -= dt;
      if (b.think <= 0 || !b.tgt || b.tgt.st !== 0 || b.tgt.y !== ly) {
        b.think = rnd(0.35, 0.9);
        let best = null, bs = -1e9;
        for (const t of R.tiles) { if (t.st !== 0 || t.y !== ly) continue; const d = Math.hypot(t.m.position.x - b.p.x, t.m.position.z - b.p.z), sc = -Math.abs(d - 2.6) - Math.hypot(t.m.position.x, t.m.position.z) * 0.08 + Math.random() * 3 * (1.2 - b.skill); if (sc > bs) { bs = sc; best = t; } }
        b.tgt = best;
      }
      if (b.tgt) { const dx = b.tgt.m.position.x - b.p.x, dz = b.tgt.m.position.z - b.p.z, d = Math.hypot(dx, dz) || 1, th = d > 0.7 ? 0.4 + 0.25 * b.skill : 0.1; b.ix = (dx / d) * th; b.iz = (dz / d) * th; }
      else { b.ix = Math.sin(R.t + b.phase); b.iz = Math.cos(R.t * 0.7 + b.phase); }
      const u = b.ground && b.gc && b.gc.ref && b.gc.ref.st === 1 ? b.gc.ref : null;
      if (u && b.state === 'run' && u.t < 0.75 && Math.random() < 0.02 + b.skill * 0.06) b.jumpBuf = CFG.jumpBuf;
    }
    function botAI(b, dt) {
      if (b.fin || phase !== 'play') { b.ix = b.iz = 0; if (b.fin && b.ground && b.state === 'run' && Math.random() < 0.02) b.jumpBuf = CFG.jumpBuf; return; }
      if (R.def.kind === 'survival') return hexAI(b, dt);
      const P = R.def.path;
      while (b.wp < P.length - 1 && b.p.z >= P[b.wp][1] - 0.6) { b.wp++; b.lane = rnd(-1, 1); }
      const w = P[b.wp], fl = w[3];
      let tx = w[0] + b.lane * w[2], tz = w[1];
      if (fl === 'D') {
        const wl = R.walls.find(q => Math.abs(q.z - w[1]) < 0.6);
        if (wl) {
          if (!b.door || b.door.wl !== wl) b.door = { wl, d: pickDoor(b, wl, null), t: 0 };
          const d = b.door.d; tx = d.x + b.lane * 0.5; tz = w[1] + 3;
          if (Math.abs(b.p.x - d.x) > 1.1 && b.p.z > w[1] - 2) tz = w[1] - 2.5;
          if (!d.open && b.p.z > w[1] - 1.8) { b.door.t += dt; if (b.door.t > 0.3 + (1 - b.skill) * 0.7) { b.door.d = pickDoor(b, wl, d); b.door.t = 0; } }
        }
      }
      let dx = tx - b.p.x, dz = tz - b.p.z; const dl = Math.hypot(dx, dz) || 1;
      dx = dx / dl + Math.sin(R.t * 1.7 + b.phase * 5) * 0.1; dz /= dl;
      const m = Math.hypot(dx, dz) || 1; b.ix = dx / m; b.iz = dz / m;
      if (b.ground && b.state === 'run') {
        if (fl === 'j' && b.p.z > w[1] - 1.5 && (Math.hypot(b.v.x, b.v.z) > 3.5 * b.speedMul || b.p.z > w[1] - 0.4)) b.jumpBuf = CFG.jumpBuf;
        else if (fl === 'c' && Math.hypot(b.p.x - w[0], b.p.z - w[1]) < 1.8 && Math.random() < 0.02 + b.skill * 0.03) b.jumpBuf = CFG.jumpBuf;
        b.react -= dt;
        if (b.react <= 0) { b.react = 0.07; if (threat(b) && Math.random() < 0.3 + b.skill * 0.6) b.jumpBuf = CFG.jumpBuf; }
        if (Math.random() < 0.001) b.jumpBuf = CFG.jumpBuf;
        if (fl === 'd' && b.p.z > w[1] - 3.2) b.diveReq = true;
      }
      b.stuckT += dt;
      if (b.p.z > b.lastZ + 0.6) { b.lastZ = b.p.z; b.stuckT = 0; }
      else if (b.stuckT > 2.2) { b.stuckT = 0.8; b.lane = rnd(-1, 1); b.jumpBuf = CFG.jumpBuf; }
    }

    let acc = 0;
    function fixed(dt) {
      R.t += dt;
      for (const k of R.kins) { k.fn(R.t, dt); k.obj.updateMatrixWorld(true); }
      for (const c of R.kinCols) { syncCol(c); if (c.tele) { c.prev.copy(c.mat); c.tele = false; } }
      if (phase === 'play' || phase === 'end' || phase === 'summary') {
        if (phase === 'play') playerInput(); else player.ix = player.iz = 0;
        for (const b of R.field) if (!b.me && !b.gone) botAI(b, dt);
        for (const b of R.field) if (!b.gone && b.respawnT <= 0) stepBean(b, dt);
        beanPairs(R.field);
        if (R.tiles.length) updTiles(dt);
      }
      for (let i = R.anims.length - 1; i >= 0; i--) if (!R.anims[i](dt)) R.anims.splice(i, 1);
    }
    function logic(dt) {
      if (!R || !show) return;
      const def = R.def;
      if (phase === 'intro') { if (phaseT >= 4.4) toCount(); return; }
      if (phase === 'count') { const k = Math.floor(phaseT); if (k !== R.cd) { R.cd = k; if (k < 3) { banner(String(3 - k)); audio.play('beep'); } else { banner('GO!', 'q'); audio.play('go'); goLive(); } } return; }
      if (phase === 'end') { if (phaseT > 3.6) { if (R.next === 'summary') showSummary(); else startRound(show.idx + 1); } return; }
      if (phase !== 'play') return;
      R.time -= dt; R.playT += dt;
      const tm = fmtT(R.time); if (tm !== lastTm) { lastTm = tm; tmEl.textContent = tm; }
      if (def.slime) slime.position.y = def.slime.y0 + Math.max(0, R.playT - def.slime.delay) * def.slime.rate;
      const killY = def.slime ? slime.position.y - 0.25 : def.killY;
      for (const b of R.field) {
        if (b.gone || b.out) continue;
        if (b.fin) { if (b.hideT > 0 && (b.hideT -= dt) <= 0) { b.gone = true; poof(b.p.x, b.p.y + 0.5, b.p.z, '#ffffff', 10); } continue; }
        if (b.respawnT > 0) { b.respawnT -= dt; if (b.respawnT <= 0) respawn(b); continue; }
        if (def.cps && b.ground) while (b.cp + 1 < def.cps.length && b.p.z >= def.cps[b.cp + 1].z && b.p.y > def.cps[b.cp + 1].y - 1) { b.cp++; if (b.me) { audio.play('check'); say('Checkpoint!', true); } }
        if (b.p.y < killY) {
          splash(b);
          if (def.cps) { b.respawnT = CFG.respawnDelay; if (b.me) camS.shake = 0.3; }
          else { eliminate(b); if (!b.me && def.kind === 'race') say(b.name + ' got slimed'); }
          if (phase !== 'play') return;
          continue;
        }
        if (def.kind === 'race' && b.p.z >= def.finishZ && b.p.y > def.topY - 3) qualify(b);
        else if (def.kind === 'final') { T1.set(b.p.x, b.p.y + 1, b.p.z); if (T1.distanceTo(def.crown.position) < 1.25) { crownWin(b); return; } }
      }
      if (def.kind === 'race') {
        if (R.qual >= R.quota || !R.field.some(b => !b.fin && !b.out) || R.time <= 0) { closeRace(); return; }
        if (R.meDone === 2 && (R.meT += dt) > 3) { resolveRace(); return; }
      } else if (def.kind === 'survival') {
        const alive = R.field.filter(b => !b.out);
        if (alive.length <= R.quota || R.time <= 0) { for (const b of alive) b.fin = true; if (!player.out) meQualified(0); endPhase('round'); return; }
      } else if (R.time <= 0) { show.log[show.idx] = { st: 'lost' }; banner('ROUND OVER!', 'e', true); audio.play('elim'); endPhase('summary'); return; }
      updQual();
    }
    const LOBC = new THREE.Vector3();
    api.loop((dt, time) => {
      const tsec = time / 1000;
      if (!paused) {
        phaseT += dt;
        if (R) { acc += dt; let n = 0; while (acc >= CFG.step && n < 8) { for (const b of beans) b.pp.copy(b.p); fixed(CFG.step); acc -= CFG.step; n++; } if (n >= 8) acc = 0; ALPHA = n ? clamp(acc / CFG.step, 0, 1) : ALPHA; } else ALPHA = 1;
        if (phase === 'lobby' || phase === 'intro') { ALPHA = 1; for (const b of beans) b.pp.copy(b.p); }
        logic(dt);
        if (show && show.log[show.idx] && show.log[show.idx].st === 'win' && Math.random() < dt * 4) burst(camS.tx + rnd(-6, 6), camS.ty + rnd(3, 7), camS.tz + rnd(-6, 6), 25, 5);
        confetti.update(dt, 4, 1.4); puffs.update(dt, -1, 3); sparks.update(dt, 6, 2);
        if (phase === 'lobby') { player.yaw = 0.35 * Math.sin(tsec * 0.8); player.ground = true; if (Math.random() < dt * 0.5) player.sqV += 4; }
        for (const b of beans) animBean(b, dt, tsec);
        beltT.offset.y -= dt * 0.65; slimeT.offset.x += dt * 0.012; slimeT.offset.y += dt * 0.006;
        if (hintT > 0 && (hintT -= dt) <= 0) hint.classList.remove('on');
      }
      tc.hidden = !(touchOn && (phase === 'play' || phase === 'count') && !paused);
      if (touchOn !== wrap.classList.contains('touch')) wrap.classList.toggle('touch', touchOn);
      if (phase === 'lobby') {
        const d = h > w ? 7.4 : 5.6;
        cam.position.set(LOB.x + Math.sin(tsec * 0.25) * 0.8, LOB.y + 1.5, LOB.z + d); LOBC.set(LOB.x, LOB.y + (h > w ? 1.2 : 0.95), LOB.z); cam.lookAt(LOBC);
        sun.target.position.copy(LOB);
      } else {
        if (phase === 'intro') camIntro(Math.min(1, phaseT / 4.4));
        else { if (phase === 'summary') camS.yaw += dt * 0.12; camFollow(player, dt); }
        sun.target.position.set(camS.tx, camS.ty, camS.tz);
        if (phase === 'intro') sun.target.position.copy(T1);
      }
      sun.position.copy(sun.target.position).add(SUN_OFF);
      sky.position.copy(cam.position);
      sunSpr.position.set(cam.position.x - 150, cam.position.y + 140, cam.position.z + 520);
      renderer.render(scene, cam);
    });

    wrap._br = { st: () => ({ phase, idx: show && show.idx, qual: R && R.qual, quota: R && R.quota, elim: R && R.elim, field: R && R.field && R.field.length, p: player.p.toArray().map(v => +v.toFixed(2)), state: player.state, ground: player.ground, yaw: +camS.yaw.toFixed(2), time: R && +R.time.toFixed(1), points: show && show.points, log: show && show.log, bz: R && R.field ? R.field.filter(b => !b.me && !b.out).map(b => (b.fin ? 'F' : '') + (b.p.z | 0) + (b.respawnT > 0 ? 'r' : '') + b.state[0]).slice(0, 19).join(' ') : '' }), tp: (x, y, z) => { player.p.set(x, y, z); player.v.set(0, 0, 0); player.respawnT = 0; }, R: () => R, beans, round: (i, k, n) => { if (n) beans.forEach((b, j) => { b.out = j >= n; }); if (k) show.rounds[i] = k; startRound(i); }, ghost: () => { player.gone = true; } };
    toLobby();
    return () => {
      unlock(); audio.close(); endRound();
      for (const b of beans) if (b.tex) b.tex.dispose();
      bin.forEach(x => { try { x.dispose(); } catch (e) {} });
      MC.clear(); DM.clear(); BM.clear();
    };
  }

  const bean = (x, y, a, c, c2, extra = '', k = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${k})"><ellipse cx="-10" cy="34" rx="7" ry="6" fill="${c2}"/><ellipse cx="10" cy="34" rx="7" ry="6" fill="${c2}"/><rect x="-22" y="-36" width="44" height="72" rx="22" fill="${c}"/>${extra}<path d="M-14 -24a16 16 0 0 1 14-8" stroke="#fff" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-8" cy="-12" rx="6.5" ry="8" fill="#fff"/><ellipse cx="8" cy="-12" rx="6.5" ry="8" fill="#fff"/><circle cx="-7" cy="-10" r="3.6" fill="#1d1640"/><circle cx="9" cy="-10" r="3.6" fill="#1d1640"/></g>`;
  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="brc-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fbcff"/><stop offset=".7" stop-color="#bfe6ff"/><stop offset="1" stop-color="#ffd9f1"/></linearGradient><linearGradient id="brc-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e75ad8"/><stop offset="1" stop-color="#a23ff0"/></linearGradient><radialGradient id="brc-g"><stop offset="0" stop-color="#fff3a8"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#brc-s)"/>
<g fill="#fff" opacity=".9"><ellipse cx="70" cy="60" rx="38" ry="15"/><ellipse cx="96" cy="50" rx="24" ry="14"/><ellipse cx="300" cy="96" rx="34" ry="12"/></g>
<rect x="18" y="90" width="26" height="150" rx="13" fill="#ff8fc8"/><ellipse cx="31" cy="90" rx="22" ry="13" fill="#ffe066"/><rect x="352" y="120" width="30" height="130" rx="15" fill="#b49bff"/><ellipse cx="367" cy="120" rx="24" ry="13" fill="#7ff0c8"/>
<path d="M0 252q25-10 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0V300H0z" fill="url(#brc-l)"/>
<g fill="#ff9be8" opacity=".6"><circle cx="60" cy="275" r="7"/><circle cx="170" cy="284" r="9"/><circle cx="300" cy="272" r="6"/><circle cx="350" cy="288" r="8"/></g>
<path d="M58 196H342L374 238H26z" fill="#7fd4ff"/><path d="M26 238H374V254H26z" fill="#4c9fe0"/>
<path d="M90 206l40 0M160 206l40 0M230 206l40 0M120 224l50 0M210 224l50 0" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="205" cy="226" rx="70" ry="8" fill="#1d1640" opacity=".18"/>
<rect x="196" y="186" width="18" height="34" rx="6" fill="#7c5cff"/>
<g transform="rotate(-14 205 200)"><rect x="70" y="194" width="270" height="14" rx="7" fill="#ff4fa3"/><rect x="62" y="191" width="20" height="20" rx="8" fill="#ffd23f"/><rect x="328" y="191" width="20" height="20" rx="8" fill="#ffd23f"/><rect x="130" y="194" width="9" height="14" fill="#fff"/><rect x="270" y="194" width="9" height="14" fill="#fff"/></g>
<ellipse cx="205" cy="186" rx="13" ry="7" fill="#ffd23f"/>
${bean(160, 118, -8, '#ff6fae', '#ff6fae', '<ellipse cx="-27" cy="-4" rx="7" ry="14" fill="#ff6fae" transform="rotate(40 -27 -4)"/><ellipse cx="27" cy="-4" rx="7" ry="14" fill="#ff6fae" transform="rotate(-40 27 -4)"/>', 1.35)}
<ellipse cx="160" cy="214" rx="28" ry="6" fill="#1d1640" opacity=".2"/>
<path d="M196 150h40M188 166h44M200 182h30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
${bean(292, 168, 72, '#ffd23f', '#ffd23f', '<rect x="-22" y="-8" width="44" height="9" fill="#fff" opacity=".85"/><rect x="-22" y="10" width="44" height="9" fill="#fff" opacity=".85"/>', 1.2)}
${bean(72, 118, -128, '#4fc3ff', '#4fc3ff', '<circle cx="-8" cy="10" r="4" fill="#fff"/><circle cx="9" cy="20" r="4" fill="#fff"/><circle cx="-6" cy="26" r="3.5" fill="#fff"/><circle cx="10" cy="2" r="3.5" fill="#fff"/>', 1.1)}
<g fill="#ffe14d"><path d="M104 84l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z"/><path d="M48 150l3 6 7 1-5 4 1 7-6-4-6 4 1-7-5-4 7-1z"/></g>
<circle cx="330" cy="58" r="44" fill="url(#brc-g)"/>
<g transform="translate(330 60) rotate(8)"><path d="M-30 14L-34-16-16-2 0-24 16-2 34-16 30 14z" fill="#ffc83d"/><rect x="-31" y="10" width="62" height="12" rx="4" fill="#f2a100"/><circle cx="-34" cy="-17" r="5" fill="#ff3d8b"/><circle cx="0" cy="-26" r="5" fill="#ff3d8b"/><circle cx="34" cy="-17" r="5" fill="#ff3d8b"/><circle cx="0" cy="16" r="4" fill="#4fc3ff"/></g>
<g><rect x="240" y="40" width="9" height="5" fill="#ff5fb0" transform="rotate(30 244 42)"/><rect x="270" y="120" width="9" height="5" fill="#8be04e" transform="rotate(-20 274 122)"/><rect x="200" y="60" width="9" height="5" fill="#a678ff" transform="rotate(50 204 62)"/><rect x="370" y="30" width="9" height="5" fill="#4fc3ff"/><rect x="230" y="100" width="8" height="5" fill="#ffe14d" transform="rotate(70 234 102)"/><rect x="300" y="140" width="8" height="5" fill="#ff9442" transform="rotate(15 304 142)"/></g>
</svg>`;
})();

