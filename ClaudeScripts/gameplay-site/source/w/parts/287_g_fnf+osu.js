(() => {
  'use strict';

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const mkRng = seed => {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const pad2 = n => String(n).padStart(2, '0');
  const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + pad2(s % 60); };
  const fmtNum = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const SHARED = {
    get cal() { return clamp(+lsGet('gameplay:fnfosu:cal', 0) || 0, -300, 300); },
    set cal(v) { lsSet('gameplay:fnfosu:cal', clamp(Math.round(v), -300, 300)); },
    get vol() { const v = lsGet('gameplay:fnfosu:vol', .8); return clamp(typeof v === 'number' ? v : .8, 0, 1); },
    set vol(v) { lsSet('gameplay:fnfosu:vol', clamp(v, 0, 1)); }
  };

  const FORM = { a: [800, 1150, 2900], e: [420, 1750, 2600], i: [280, 2200, 2950], o: [460, 820, 2800], u: [330, 720, 2650] };
  const VOX = {
    bubba: { vow: ['a', 'o', 'a', 'e', 'o'], wave: 'sawtooth', fs: .9, vib: 4.6, vd: 16, pan: -.2, gain: 1 },
    ghoul: { vow: ['o', 'u', 'o', 'a', 'u'], wave: 'sawtooth', fs: .82, vib: 6.2, vd: 26, pan: -.15, gain: 1.05, breath: .22 },
    mirage: { vow: ['e', 'i', 'a', 'e', 'i'], wave: 'square', fs: 1.14, vib: 5.2, vd: 8, pan: -.1, gain: .85 },
    zig: { vow: ['e', 'a', 'i', 'o', 'a'], wave: 'sawtooth', fs: 1.06, vib: 5.6, vd: 14, pan: .2, gain: 1 }
  };

  function makeAudio(api, forceCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = forceCtx || new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    const master = ctx.createGain();
    comp.threshold.value = -15; comp.knee.value = 14; comp.ratio.value = 3.5; comp.attack.value = .005; comp.release.value = .2;
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .08;
    master.gain.value = .62;
    comp.connect(lim); lim.connect(master); master.connect(ctx.destination);
    let vol = SHARED.vol, lastMute = null;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const pulses = {};
    const pulse = d => pulses[d] || (pulses[d] = (() => {
      const n = 40, re = new Float32Array(n), im = new Float32Array(n);
      for (let k = 1; k < n; k++) im[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * d);
      return ctx.createPeriodicWave(re, im);
    })());
    const gn = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const fl = (type, f, q) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; };
    const osc = (type, f, t, t1, wave) => {
      const o = ctx.createOscillator();
      if (wave) o.setPeriodicWave(wave); else o.type = type;
      o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t1);
      return o;
    };
    const noise = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = nb; s.start(t, Math.random() * 1.5, dur); return s; };
    const env = (p, t, a, peak, d, sus, hold, r) => {
      const sv = Math.max(peak * sus, .0002), h = Math.max(hold, t + a + d);
      p.setValueAtTime(.0001, t); p.linearRampToValueAtTime(peak, t + a);
      p.exponentialRampToValueAtTime(sv, t + a + d);
      p.setValueAtTime(sv, h); p.exponentialRampToValueAtTime(.0001, h + r);
      return h + r;
    };
    const vib = (o, t, dur, rate, depth, delay) => {
      const l = ctx.createOscillator(), g = ctx.createGain();
      l.frequency.value = rate; g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(0, t + (delay || 0)); g.gain.linearRampToValueAtTime(depth, t + (delay || 0) + .25);
      l.connect(g); g.connect(o.detune); l.start(t); l.stop(t + dur + .3);
    };

    const D = {
      k(t, v, d) {
        const o = osc('sine', 155, t, t + .4), g = gn(0);
        o.frequency.exponentialRampToValueAtTime(44, t + .12);
        g.gain.setValueAtTime(v * .95, t); g.gain.exponentialRampToValueAtTime(.001, t + .3);
        o.connect(g); g.connect(d);
        const n = noise(t, .02), f = fl('bandpass', 2600, 1), g2 = gn(0);
        g2.gain.setValueAtTime(v * .28, t); g2.gain.exponentialRampToValueAtTime(.001, t + .02);
        n.connect(f); f.connect(g2); g2.connect(d);
      },
      s(t, v, d) {
        const n = noise(t, .25), f = fl('highpass', 1400), g = gn(0);
        g.gain.setValueAtTime(v * .55, t); g.gain.exponentialRampToValueAtTime(.001, t + .2);
        n.connect(f); f.connect(g); g.connect(d);
        const o = osc('triangle', 210, t, t + .15), g2 = gn(0);
        o.frequency.exponentialRampToValueAtTime(140, t + .1);
        g2.gain.setValueAtTime(v * .38, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12);
        o.connect(g2); g2.connect(d);
      },
      h(t, v, d) {
        const n = noise(t, .06), f = fl('highpass', 7500), g = gn(0);
        g.gain.setValueAtTime(v * .28, t); g.gain.exponentialRampToValueAtTime(.001, t + .045);
        n.connect(f); f.connect(g); g.connect(d);
      },
      o(t, v, d) {
        const n = noise(t, .4), f = fl('highpass', 6800), g = gn(0);
        g.gain.setValueAtTime(v * .24, t); g.gain.exponentialRampToValueAtTime(.001, t + .26);
        n.connect(f); f.connect(g); g.connect(d);
      },
      c(t, v, d) {
        for (let i = 0; i < 3; i++) {
          const n = noise(t + i * .011, .2), f = fl('bandpass', 1300, .9), g = gn(0), tt = t + i * .011;
          g.gain.setValueAtTime(v * .5, tt); g.gain.exponentialRampToValueAtTime(.001, tt + (i === 2 ? .16 : .02));
          n.connect(f); f.connect(g); g.connect(d);
        }
      },
      t(t, v, d) {
        const o = osc('sine', 190, t, t + .3), g = gn(0);
        o.frequency.exponentialRampToValueAtTime(105, t + .2);
        g.gain.setValueAtTime(v * .65, t); g.gain.exponentialRampToValueAtTime(.001, t + .24);
        o.connect(g); g.connect(d);
      },
      u(t, v, d) {
        const o = osc('sine', 280, t, t + .3), g = gn(0);
        o.frequency.exponentialRampToValueAtTime(150, t + .2);
        g.gain.setValueAtTime(v * .6, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
        o.connect(g); g.connect(d);
      },
      x(t, v, d) {
        const n = noise(t, 1.6), f = fl('highpass', 4800), g = gn(0);
        g.gain.setValueAtTime(v * .38, t); g.gain.exponentialRampToValueAtTime(.001, t + 1.3);
        n.connect(f); f.connect(g); g.connect(d);
      },
      r(t, v, d) {
        const o = osc('square', 1700, t, t + .06), f = fl('bandpass', 1900, 3), g = gn(0);
        g.gain.setValueAtTime(v * .18, t); g.gain.exponentialRampToValueAtTime(.001, t + .04);
        o.connect(f); f.connect(g); g.connect(d);
      }
    };

    const BASS = {
      saw(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .08), o = osc('sawtooth', f0, t, end + .15), lp = fl('lowpass', 1400, 3), g = gn(0);
        lp.frequency.setValueAtTime(2200, t); lp.frequency.exponentialRampToValueAtTime(380, t + .16);
        env(g.gain, t, .005, v * .5, .08, .75, end - .03, .08);
        o.connect(lp); lp.connect(g); g.connect(d);
        const s = osc('sine', f0, t, end + .15), g2 = gn(0);
        env(g2.gain, t, .008, v * .55, .05, .9, end - .03, .08);
        s.connect(g2); g2.connect(d);
      },
      sq(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .08), o = osc('square', f0, t, end + .1), lp = fl('lowpass', 900, 1), g = gn(0);
        env(g.gain, t, .004, v * .36, .06, .7, end - .02, .06);
        o.connect(lp); lp.connect(g); g.connect(d);
        const s = osc('sine', f0, t, end + .1), g2 = gn(0);
        env(g2.gain, t, .006, v * .4, .05, .9, end - .02, .06);
        s.connect(g2); g2.connect(d);
      },
      pluck(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .08), o = osc('triangle', f0, t, end + .3), g = gn(0), o2 = osc('sawtooth', f0, t, end + .3), lp = fl('lowpass', 1200, 1), g2 = gn(0);
        env(g.gain, t, .004, v * .6, .25, .12, t + .25, .12);
        lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(260, t + .22);
        env(g2.gain, t, .004, v * .25, .2, .1, t + .22, .1);
        o.connect(g); g.connect(d); o2.connect(lp); lp.connect(g2); g2.connect(d);
      },
      sub(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .1), o = osc('sine', f0, t, end + .2), g = gn(0), sh = ctx.createWaveShaper();
        const c = new Float32Array(257); for (let i = 0; i < 257; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 1.8); }
        sh.curve = c;
        env(g.gain, t, .02, v * .6, .1, .85, end - .05, .15);
        o.connect(sh); sh.connect(g); g.connect(d);
      }
    };

    const COMP = {
      pad(t, ns, dur, v, d) {
        const end = t + Math.max(dur, .1);
        ns.forEach(m => {
          const f0 = mtof(m);
          [-8, 8].forEach(c => {
            const o = osc('sawtooth', f0, t, end + .4), lp = fl('lowpass', 1500, .5), g = gn(0);
            o.detune.value = c;
            env(g.gain, t, .08, v * .09, .3, .7, end - .04, .3);
            o.connect(lp); lp.connect(g); g.connect(d);
          });
        });
      },
      stab(t, ns, dur, v, d) {
        const end = t + Math.min(Math.max(dur, .06), .36);
        ns.forEach(m => {
          const f0 = mtof(m), o = osc('sawtooth', f0, t, end + .2), o2 = osc('square', f0 * 1.003, t, end + .2), lp = fl('lowpass', 3000, 2), g = gn(0);
          lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + .2);
          env(g.gain, t, .004, v * .12, .1, .35, end - .02, .1);
          o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(d);
        });
      },
      pluck(t, ns, dur, v, d) {
        ns.forEach(m => {
          const f0 = mtof(m), o = osc('triangle', f0, t, t + .7), g = gn(0), o2 = osc('square', f0, t, t + .5), g2 = gn(0), lp = fl('lowpass', 2400, 1);
          env(g.gain, t, .004, v * .26, .35, .08, t + .3, .2);
          lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(500, t + .3);
          env(g2.gain, t, .003, v * .07, .15, .05, t + .15, .1);
          o.connect(g); g.connect(d); o2.connect(lp); lp.connect(g2); g2.connect(d);
        });
      },
      keys(t, ns, dur, v, d) {
        const end = t + Math.max(dur, .2);
        ns.forEach(m => {
          const f0 = mtof(m), car = osc('sine', f0, t, end + .6), mod = osc('sine', f0 * 2, t, end + .6), mg = gn(0), g = gn(0);
          mg.gain.setValueAtTime(f0 * 1.6, t); mg.gain.exponentialRampToValueAtTime(f0 * .08, t + .5);
          mod.connect(mg); mg.connect(car.frequency);
          env(g.gain, t, .004, v * .2, .9, .25, end, .35);
          car.connect(g); g.connect(d);
        });
      },
      organ(t, ns, dur, v, d) {
        const end = t + Math.max(dur, .1);
        ns.forEach(m => {
          const f0 = mtof(m);
          [1, 2, 3, 4].forEach((h, i) => {
            const o = osc('sine', f0 * h, t, end + .12), g = gn(0);
            env(g.gain, t, .012, v * .065 / (i + 1) * 2, .05, .9, end - .02, .1);
            o.connect(g); g.connect(d);
          });
        });
      },
      chip(t, ns, dur, v, d) {
        ns.forEach(m => {
          const f0 = mtof(m), o = osc('square', f0, t, t + .5, pulse(.25)), g = gn(0);
          env(g.gain, t, .003, v * .13, .12, .3, t + Math.min(dur, .3), .06);
          o.connect(g); g.connect(d);
        });
      },
      bell(t, ns, dur, v, d) {
        ns.forEach(m => {
          const f0 = mtof(m), o = osc('sine', f0, t, t + 1.4), o2 = osc('sine', f0 * 3.01, t, t + 1), g = gn(0), g2 = gn(0);
          env(g.gain, t, .003, v * .2, 1.1, .02, t + .5, .3);
          env(g2.gain, t, .002, v * .06, .4, .02, t + .2, .2);
          o.connect(g); g.connect(d); o2.connect(g2); g2.connect(d);
        });
      }
    };

    const LEAD = {
      sq(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .09), o = osc('square', f0, t, end + .1, pulse(.5)), lp = fl('lowpass', 4200, .7), g = gn(0);
        vib(o, t, dur, 5.5, 14, .22);
        env(g.gain, t, .006, v * .24, .06, .75, end - .02, .08);
        o.connect(lp); lp.connect(g); g.connect(d);
      },
      pulse(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .09), o = osc('square', f0, t, end + .1, pulse(.25)), g = gn(0);
        vib(o, t, dur, 5.8, 10, .2);
        env(g.gain, t, .004, v * .26, .05, .7, end - .02, .06);
        o.connect(g); g.connect(d);
      },
      saw(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .09), lp = fl('lowpass', 3600, 1.2), g = gn(0);
        lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(2200, t + .25);
        [-9, 9].forEach(c => { const o = osc('sawtooth', f0, t, end + .15); o.detune.value = c; vib(o, t, dur, 5.2, 12, .25); o.connect(lp); });
        env(g.gain, t, .008, v * .17, .08, .75, end - .03, .1);
        lp.connect(g); g.connect(d);
      },
      synth(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .09), lp = fl('lowpass', 3000, 1), g = gn(0);
        [-14, 0, 14].forEach(c => { const o = osc('sawtooth', f0, t, end + .2); o.detune.value = c; o.connect(lp); });
        lp.frequency.setValueAtTime(4800, t); lp.frequency.exponentialRampToValueAtTime(1800, t + .3);
        env(g.gain, t, .012, v * .15, .1, .7, end - .03, .15);
        lp.connect(g); g.connect(d);
      },
      bell(t, m, dur, v, d) {
        const f0 = mtof(m), o = osc('sine', f0, t, t + 1.6), o2 = osc('sine', f0 * 2.76, t, t + 1), o3 = osc('triangle', f0 * 2, t, t + 1), g = gn(0), g2 = gn(0), g3 = gn(0);
        env(g.gain, t, .003, v * .3, 1.2, .05, t + Math.max(dur * .7, .3), .3);
        env(g2.gain, t, .002, v * .05, .5, .02, t + .15, .2);
        env(g3.gain, t, .003, v * .1, .8, .05, t + .3, .2);
        o.connect(g); g.connect(d); o2.connect(g2); g2.connect(d); o3.connect(g3); g3.connect(d);
      },
      pluck(t, m, dur, v, d) {
        const f0 = mtof(m), o = osc('sawtooth', f0, t, t + .7), lp = fl('lowpass', 3000, 2), g = gn(0), o2 = osc('triangle', f0 * 2, t, t + .6), g2 = gn(0);
        lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(600, t + .35);
        env(g.gain, t, .003, v * .26, .4, .1, t + Math.max(.25, Math.min(dur, .6)), .2);
        env(g2.gain, t, .003, v * .1, .3, .05, t + .2, .1);
        o.connect(lp); lp.connect(g); g.connect(d); o2.connect(g2); g2.connect(d);
      },
      flute(t, m, dur, v, d) {
        const f0 = mtof(m), end = t + Math.max(dur, .1), o = osc('sine', f0, t, end + .15), o2 = osc('triangle', f0 * 2, t, end + .15), g = gn(0), g2 = gn(0);
        vib(o, t, dur, 5, 18, .3); vib(o2, t, dur, 5, 18, .3);
        env(g.gain, t, .04, v * .3, .08, .85, end - .03, .12);
        env(g2.gain, t, .04, v * .06, .08, .85, end - .03, .12);
        o.connect(g); g.connect(d); o2.connect(g2); g2.connect(d);
        const n = noise(t, Math.min(dur, .4) + .1), f = fl('bandpass', f0 * 2, 6), gg = gn(0);
        env(gg.gain, t, .03, v * .05, .1, .3, t + .2, .1);
        n.connect(f); f.connect(gg); gg.connect(d);
      }
    };

    function vox(t, m, dur, v, cfg, idx, d) {
      const f0 = mtof(m), vow = FORM[cfg.vow[idx % cfg.vow.length]], end = t + Math.max(dur, .09);
      const o = ctx.createOscillator(), out = ctx.createGain(), pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.type = cfg.wave;
      o.frequency.setValueAtTime(f0 * .94, t); o.frequency.exponentialRampToValueAtTime(f0, t + .045);
      if (cfg.vd) vib(o, t, dur, cfg.vib, cfg.vd, .18);
      env(out.gain, t, .018, v * cfg.gain, .05, .85, end - .03, .08);
      vow.forEach((f, i) => {
        const bp = fl('bandpass', f * cfg.fs, i === 0 ? 7 : 10), g = gn([3.2, 2, .9][i]);
        o.connect(bp); bp.connect(g); g.connect(out);
      });
      o.start(t); o.stop(end + .15);
      const n = noise(t, .04), hp = fl('highpass', 2800), ng = gn(0);
      ng.gain.setValueAtTime(v * .16, t); ng.gain.exponentialRampToValueAtTime(.001, t + .035);
      n.connect(hp); hp.connect(ng); ng.connect(out);
      if (cfg.breath) {
        const b = noise(t, dur + .1), bf = fl('bandpass', vow[1], 2), bg = gn(0);
        bg.gain.setValueAtTime(v * cfg.breath, t); bg.gain.linearRampToValueAtTime(0, end + .05);
        b.connect(bf); bf.connect(bg); bg.connect(out);
      }
      if (pn) { pn.pan.value = cfg.pan; out.connect(pn); pn.connect(d); } else out.connect(d);
    }

    const S = { timer: 0, sess: null, t0: 0, step: .125, rate: 1, evs: null, i: 0, song: null, o: null, ended: false, bus: null, ve: [0, 0] };
    const sfxBus = ctx.createGain();
    sfxBus.gain.value = .8; sfxBus.connect(comp);
    const mix = { d: .8, b: .9, c: .85, l: 1, x: .8 };

    function fire(e, t, s) {
      const bus = s.bus, st = s.step;
      if (e.k === 'd') { const f = D[e.n]; if (f) f(t, e.v * mix.d * (s.o.drums === false ? 0 : 1), bus.i); }
      else if (e.k === 'b') { if (s.o.bass !== false) BASS[e.i](t, e.m, e.d * st * .95, e.v * mix.b, bus.i); }
      else if (e.k === 'c') { if (s.o.comp !== false) COMP[e.i](t, e.n, e.d * st * .95, e.v * mix.c, bus.i); }
      else if (e.k === 'l') {
        const song = s.song;
        const dst = e.w === 'p' ? bus.p : e.w === 'o' ? bus.o : e.w === 'b' ? null : bus.m;
        const play = (b, who) => {
          if (song.vox) {
            const cfg = VOX[who === 'o' ? song.vox.o : song.vox.p];
            vox(t, e.m + (who === 'o' ? 0 : 0), e.d * st * .92, e.v * mix.l * .95, cfg, e.x, b);
            if (song.inst.dbl) LEAD[song.inst.dbl](t, e.m, e.d * st * .9, e.v * mix.l * .4, b);
          } else LEAD[e.i](t, e.m, e.d * st * .93, e.v * mix.l, b);
        };
        if (e.w === 'b') { play(bus.o, 'o'); play(bus.p, 'p'); }
        else play(dst, e.w);
      }
    }

    function sched() {
      const s = S;
      if (!s.evs) return;
      const hor = ctx.currentTime + .22;
      while (s.i < s.evs.length) {
        const e = s.evs[s.i], t = s.t0 + e.s * s.step;
        if (t >= hor) break;
        s.i++;
        if (t < ctx.currentTime - .05) continue;
        fire(e, Math.max(t, ctx.currentTime), s);
      }
      if (s.o.loop && s.i >= s.evs.length) { s.t0 += (s.song.steps - 4) * s.step; s.i = 0; return; }
      if (!s.ended && s.i >= s.evs.length && ctx.currentTime >= s.t0 + s.endStep * s.step) {
        s.ended = true;
        const f = s.o.onEnd;
        if (f) setTimeout(() => f(), 0);
      }
    }

    function stop(fade) {
      clearInterval(S.timer); S.timer = 0;
      const s = S.sess;
      S.evs = null; S.sess = null; S.ended = true;
      if (s) {
        try { s.gain.cancelScheduledValues(ctx.currentTime); s.gain.setTargetAtTime(0, ctx.currentTime, (fade || .05) / 3); } catch (e) {}
        setTimeout(() => { try { s.disconnect(); } catch (e) {} }, 600);
      }
    }

    function play(song, o) {
      o = o || {};
      stop(.04);
      const sess = ctx.createGain(), bus = {};
      sess.connect(comp);
      ['i', 'o', 'p', 'm'].forEach(k => { bus[k] = ctx.createGain(); bus[k].connect(sess); });
      bus.o.gain.value = bus.p.gain.value = bus.m.gain.value = 1;
      S.sess = sess; S.bus = bus; S.song = song; S.o = o;
      S.rate = o.rate || 1; S.step = song.step / S.rate;
      const from = o.from || 0;
      S.endStep = o.to != null ? o.to : song.steps;
      const lead = o.lead != null ? o.lead : .12;
      S.t0 = ctx.currentTime + lead - from * S.step;
      const evs = song.ev;
      let i = 0;
      if (from > 0) { while (i < evs.length && evs[i].s < from) i++; }
      S.evs = evs; S.i = i; S.ended = false;
      if (o.to != null) { let j = evs.length; while (j > 0 && evs[j - 1].s >= o.to) j--; S.evs = evs.slice(0, j); }
      sched();
      S.timer = setInterval(sched, 25);
      return S.t0;
    }

    return {
      ctx, S, D, fire, play, stop,
      get t0() { return S.t0; },
      get rate() { return S.rate; },
      get playing() { return !!S.evs && !S.ended; },
      bus: () => S.bus,
      now() {
        if (ctx.state !== 'running') return ctx.currentTime;
        let ts;
        try { ts = ctx.getOutputTimestamp(); } catch (e) { return ctx.currentTime; }
        if (!ts || !ts.contextTime || !ts.performanceTime) return ctx.currentTime;
        const t = ts.contextTime + (performance.now() - ts.performanceTime) / 1000, c = ctx.currentTime;
        return Math.abs(t - c) < .3 ? t : c;
      },
      at(perf) {
        const n = this.now();
        if (ctx.state !== 'running') return n;
        let ts;
        try { ts = ctx.getOutputTimestamp(); } catch (e) { return n; }
        if (!ts || !ts.contextTime || !ts.performanceTime) return n;
        const t = ts.contextTime + (perf - ts.performanceTime) / 1000;
        return clamp(t, n - .25, n);
      },
      song() { return (this.now() - S.t0) * S.rate; },
      tick() {
        const m = !!api.muted;
        vol = SHARED.vol;
        const want = (m ? 0 : vol) * .62;
        if (lastMute !== want) { master.gain.setTargetAtTime(want, ctx.currentTime, .02); lastMute = want; }
      },
      restartAt(song, T, rate, o) { const r = rate || 1, from = Math.max(0, Math.ceil((T + .05 * r) / song.step)); return play(song, Object.assign({}, o, { from, lead: Math.max(.02, (from * song.step - T) / r), rate: r })); },
      resume() { try { if (ctx.state !== 'running') return ctx.resume(); } catch (e) {} return Promise.resolve(); },
      suspend() { try { return ctx.suspend(); } catch (e) {} return Promise.resolve(); },
      close() { stop(.01); try { ctx.close(); } catch (e) {} },
      voiceMute(who, on) { const b = S.bus; if (!b || !b[who]) return; b[who].gain.cancelScheduledValues(ctx.currentTime); b[who].gain.setTargetAtTime(on ? 0 : 1, ctx.currentTime, on ? .01 : .02); },
      tone(t, f, dur, vv, type, f2) {
        const o = osc(type || 'sine', f, t, t + dur + .05), g = gn(0);
        if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
        env(g.gain, t, .004, vv, dur * .5, .3, t + dur * .6, dur * .4);
        o.connect(g); g.connect(sfxBus);
      },
      noiseHit(t, dur, f, vv, type) {
        const n = noise(t, dur + .05), b = fl(type || 'bandpass', f, 1.2), g = gn(0);
        g.gain.setValueAtTime(vv, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
        n.connect(b); b.connect(g); g.connect(sfxBus);
      },
      sfx(name, a) {
        const t = ctx.currentTime + .005;
        if (name === 'tick') this.tone(t, 760, .05, .12, 'square');
        else if (name === 'ok') { this.tone(t, 523, .08, .16, 'square'); this.tone(t + .07, 784, .12, .16, 'square'); }
        else if (name === 'back') { this.tone(t, 523, .07, .14, 'square'); this.tone(t + .06, 330, .12, .14, 'square'); }
        else if (name === 'miss') { const f = [150, 120, 100][(Math.random() * 3) | 0]; this.tone(t, f * 1.6, .22, .22, 'sawtooth', f * .7); this.noiseHit(t, .12, 600, .1, 'lowpass'); }
        else if (name === 'fail') { [392, 349, 311, 262].forEach((f, i) => this.tone(t + i * .22, f, .34, .2, 'sawtooth', f * .96)); }
        else if (name === 'win') { [523, 659, 784, 1047].forEach((f, i) => this.tone(t + i * .11, f, .2, .16, 'square')); this.tone(t + .5, 1047, .6, .14, 'triangle'); }
        else if (name === 'beep') this.tone(t, a || 880, .09, .2, 'square');
        else if (name === 'go') { this.tone(t, 1175, .22, .22, 'square'); }
        else if (name === 'hit') { this.tone(t, 320, .07, .35, 'sine', 120); this.noiseHit(t, .035, 3000, .1, 'highpass'); }
        else if (name === 'clap') { this.noiseHit(t, .09, 1500, .22); this.noiseHit(t + .012, .09, 1700, .18); }
        else if (name === 'whistle') this.tone(t, 1600, .1, .1, 'sine', 2100);
        else if (name === 'tickS') this.tone(t, 1480, .04, .13, 'sine');
        else if (name === 'rev') { this.tone(t, 900, .05, .16, 'triangle', 1300); this.noiseHit(t, .05, 2500, .08, 'highpass'); }
        else if (name === 'spin') this.tone(t, 500 + (a || 0) * 40, .06, .1, 'triangle');
        else if (name === 'spinOk') { [660, 880, 1100].forEach((f, i) => this.tone(t + i * .06, f, .1, .14, 'square')); }
        else if (name === 'sbreak') { this.tone(t, 220, .25, .25, 'sawtooth', 70); this.noiseHit(t, .2, 500, .2, 'lowpass'); }
        else if (name === 'sec') { [392, 523, 659].forEach((f, i) => this.tone(t + i * .09, f, .16, .14, 'triangle')); }
        else if (name === 'rank') { [440, 554, 659, 880].forEach((f, i) => this.tone(t + i * .13, f, .26, .15, 'triangle')); }
      },
      slideHum(on) {
        if (on && !S.hum) {
          const o = ctx.createOscillator(), g = gn(0), lp = fl('lowpass', 700, 2);
          o.type = 'sawtooth'; o.frequency.value = 110;
          const l = ctx.createOscillator(), lg = gn(18);
          l.frequency.value = 9; l.connect(lg); lg.connect(o.frequency);
          o.connect(lp); lp.connect(g); g.connect(sfxBus);
          g.gain.setTargetAtTime(.05, ctx.currentTime, .03);
          o.start(); l.start();
          S.hum = { o, l, g };
        } else if (!on && S.hum) {
          const h = S.hum; S.hum = null;
          h.g.gain.setTargetAtTime(0, ctx.currentTime, .03);
          setTimeout(() => { try { h.o.stop(); h.l.stop(); } catch (e) {} }, 250);
        }
      },
      offline(song, rate) {
        const s = { bus: null, song, o: {}, step: song.step / (rate || 1) };
        const sess = ctx.createGain(), bus = {};
        sess.connect(comp);
        ['i', 'o', 'p', 'm'].forEach(k => { bus[k] = ctx.createGain(); bus[k].connect(sess); });
        s.bus = bus;
        song.ev.forEach(e => fire(e, e.s * s.step + .05, s));
      }
    };
  }

  const SCALES = {
    maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10],
    mix: [0, 2, 4, 5, 7, 9, 10], hmin: [0, 2, 3, 5, 7, 8, 11], lyd: [0, 2, 4, 6, 7, 9, 11]
  };
  const DRUMS = {
    none: {},
    half: { k: 'x.......x.......', s: '........x.......', h: 'x.x.x.x.x.x.x.x.' },
    soft: { k: 'x.......x.......', r: '........x.......', h: 'x...x...x...x...' },
    rock: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    rock2: { k: 'x.......x.x..x..', s: '....x.......x..g', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
    funk: { k: 'x..x..x...x..x..', s: '....x..g.g..x..g', h: 'x.xxx.xxx.xxx.xx' },
    four: { k: 'x...x...x...x...', c: '....x.......x...', h: 'x.g.x.g.x.g.x.g.', o: '..x...x...x...x.' },
    dnb: { k: 'x.........x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' },
    dnb2: { k: 'x.........x...x.', s: '....x.......x..g', h: 'x.xxx.xxx.xxx.xx' },
    hiphop: { k: 'x.....x...x.....', s: '........x.......', h: 'x.x.x.x.x.x.x.x.' },
    kickhat: { k: 'x...x...x...x...', h: '..x...x...x...x.' },
    stomp: { k: 'x...x...x...x...', s: '....x.......x...', c: '....x.......x...' },
    fill: { k: 'x.........x.....', s: '........x.x.xxxx', t: '..........x.....', u: '............x...' },
    end: { k: 'x...............', x: 'x...............', s: 'x...............' }
  };
  const BASSP = {
    sub: [[0, 'r', 16]],
    root4: [[0, 'r', 3], [4, 'r', 3], [8, 'r', 3], [12, 'r', 3]],
    eight: [[0, 'r', 2], [2, 'r', 2], [4, 'r', 2], [6, 'r', 2], [8, 'r', 2], [10, 'r', 2], [12, 'r', 2], [14, 'r', 2]],
    oct: [[0, 'r', 2], [2, 'o', 2], [4, 'r', 2], [6, 'o', 2], [8, 'r', 2], [10, 'o', 2], [12, 'r', 2], [14, 'o', 2]],
    off: [[0, 'r', 2], [3, 'r', 1], [6, 'o', 2], [8, 'r', 2], [11, 'r', 1], [14, 'o', 2]],
    funk: [[0, 'r', 3], [3, 'r', 1], [6, 'o', 1], [8, 'r', 3], [10, '5', 1], [12, 'r', 2], [14, 'f', 1], [15, '5', 1]],
    walk: [[0, 'r', 4], [4, 'f', 4], [8, '5', 4], [12, 'f', 4]],
    gallop: [[0, 'r', 1], [1, 'r', 1], [2, 'r', 2], [4, 'r', 1], [5, 'r', 1], [6, 'r', 2], [8, 'r', 1], [9, 'r', 1], [10, 'r', 2], [12, 'r', 1], [13, 'r', 1], [14, 'r', 2]],
    dnb: [[0, 'r', 3], [3, 'r', 1], [6, 'r', 2], [10, 'r', 3], [14, '5', 2]],
    half: [[0, 'r', 6], [8, 'r', 4], [12, '5', 4]]
  };
  const ARPI = [0, 1, 2, 3, 2, 1, 0, 1];
  const COMPP = {
    pad: [[0, 16, -1]],
    half: [[0, 8, -1], [8, 8, -1]],
    stab4: [[0, 3, -1], [4, 3, -1], [8, 3, -1], [12, 3, -1]],
    offs: [[2, 2, -1], [6, 2, -1], [10, 2, -1], [14, 2, -1]],
    synco: [[0, 3, -1], [3, 3, -1], [6, 2, -1], [10, 3, -1], [12, 2, -1]],
    push: [[0, 2, -1], [3, 2, -1], [6, 4, -1], [11, 2, -1], [14, 2, -1]],
    arp8: [0, 2, 4, 6, 8, 10, 12, 14].map((s, i) => [s, 2, ARPI[i]]),
    arp16: Array.from({ length: 16 }, (_, i) => [i, 1, ARPI[i % 8]])
  };
  const FILLV = { k: 1, s: 1, t: 1, u: 1 };

  function parseMel(str) {
    const notes = [];
    let s = 0;
    str.replace(/\|/g, ' ').trim().split(/\s+/).forEach(tok => {
      if (!tok) return;
      const m = /^([1-7.])([#b]?)([\^v]*)(?::(\d+))?(!?)$/.exec(tok);
      if (!m) return;
      const d = m[4] ? +m[4] : 2;
      if (m[1] !== '.') {
        let o = 0;
        for (const c of m[3]) o += c === '^' ? 1 : -1;
        notes.push({ s, d, deg: +m[1] + o * 7, acc: m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, ac: !!m[5] });
      }
      s += d;
    });
    return { notes, len: s };
  }
  function parseChord(sc, tok) {
    const m = /^([1-7])([#b]?)([Mmsda7]*)$/.exec(tok) || ['', '1', '', ''];
    const S = SCALES[sc], d = +m[1] - 1, f = m[3], acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
    const at = k => { const i = d + k; return S[i % 7] + 12 * Math.floor(i / 7); };
    const root = at(0) + acc;
    let third = at(2) + acc, fifth = at(4) + acc, sev = at(6) + acc;
    if (f.includes('M')) { third = root + 4; fifth = root + 7; sev = root + 10; }
    if (f.includes('m')) { third = root + 3; fifth = root + 7; sev = root + 10; }
    if (f.includes('d')) { third = root + 3; fifth = root + 6; }
    if (f.includes('s')) third = root + 5;
    const notes = [root, third, fifth];
    if (f.includes('7')) notes.push(sev);
    if (f.includes('a')) notes.push(root + 14);
    return { root, third, fifth, notes };
  }
  function compileSong(def) {
    const sc = def.scale, S = SCALES[sc];
    const tonic = 60 + ((def.key + 5) % 12) - 5;
    const step = 60 / def.bpm / 4;
    const mot = {};
    Object.keys(def.motifs).forEach(k => { mot[k] = parseMel(def.motifs[k]); });
    const ev = [], lead = [], sections = [], drums = [];
    let at = 0, sylN = { o: 0, p: 0, m: 0 };
    const push = e => ev.push(e);
    const deg2m = (deg, acc) => tonic + S[((deg - 1) % 7 + 7) % 7] + 12 * Math.floor((deg - 1) / 7) + acc;
    def.sec.forEach((row, si) => {
      const L = Object.assign({ prog: '1', drum: 'none', bass: null, comp: null, arp: null, crash: false, fill: false, kiai: false, vel: 1 }, def.L[row[0]]);
      const bars = row[1], who = row[2], motifs = row[3] ? row[3].split(/\s+/) : [], base = at, vel = L.vel;
      const prog = L.prog.split(/\s+/);
      const drumList = Array.isArray(L.drum) ? L.drum : [L.drum];
      const chordAt = (bar, stp) => {
        const tok = prog[bar % prog.length].split('/');
        const n = tok.length, idx = Math.min(n - 1, Math.floor(stp / (16 / n)));
        return parseChord(sc, tok[idx]);
      };
      for (let b = 0; b < bars; b++) {
        const bs = base + b * 16, last = b === bars - 1;
        let dp = DRUMS[drumList[b % drumList.length]] || {};
        if (L.fill && last && bars >= 2) dp = DRUMS.fill;
        if (L.end && last) dp = DRUMS.end;
        Object.keys(dp).forEach(k => {
          const str = dp[k];
          for (let i = 0; i < 16; i++) {
            const ch = str[i];
            if (ch === '.' || !ch) continue;
            const v = (ch === 'X' ? 1 : ch === 'g' ? .35 : .78) * vel;
            push({ s: bs + i, k: 'd', n: k, v });
            if (k === 'k' || k === 's' || k === 'h') drums.push({ s: bs + i, n: k });
          }
        });
        if (L.crash && b === 0 && si > 0) push({ s: bs, k: 'd', n: 'x', v: .8 * vel });
        if (L.bass) {
          BASSP[L.bass].forEach(([st, sym, dur]) => {
            const c = chordAt(b, st), bt = tonic - 24;
            const m = sym === 'r' ? bt + c.root : sym === 'o' ? bt + c.root + 12 : sym === '5' ? bt + c.fifth : sym === 'f' ? bt + c.third : bt + c.root;
            push({ s: bs + st, k: 'b', i: def.inst.bass, m, d: dur, v: (st % 4 === 0 ? 1 : .8) * vel });
          });
        }
        const compLine = (name, kind) => {
          COMPP[name].forEach(([st, dur, idx]) => {
            const c = chordAt(b, st), base0 = tonic - 12;
            let ns;
            if (idx < 0) ns = c.notes.map(n => base0 + n);
            else { const len = c.notes.length, j = idx % len, o = Math.floor(idx / len); ns = [base0 + c.notes[j] + 12 * (o + (kind === 'pluck' || kind === 'chip' || kind === 'bell' ? 1 : 0))]; }
            push({ s: bs + st, k: 'c', i: kind, n: ns, d: dur, v: (idx < 0 ? 1 : .8) * vel });
          });
        };
        if (L.comp) compLine(L.comp, L.ck || def.inst.comp);
        if (L.arp) compLine(L.arp, def.inst.arp);
      }
      let off = 0;
      motifs.forEach(ref => {
        const m = /^([A-Za-z][A-Za-z0-9]*)([+-]\d+)?([\^v]*)$/.exec(ref);
        if (!m || !mot[m[1]]) return;
        const mo = mot[m[1]];
        let sh = m[2] ? +m[2] : 0;
        for (const c of m[3]) sh += c === '^' ? 7 : -7;
        mo.notes.forEach(n => {
          const stp = base + off + n.s;
          if (stp >= base + bars * 16) return;
          const midi = deg2m(n.deg + sh, n.acc), w = who;
          const x = sylN[w === 'b' ? 'p' : w]++;
          const le = { s: stp, k: 'l', i: def.inst.lead, m: midi, d: n.d, v: n.ac ? 1 : .85, w, x, ac: n.ac, sec: si };
          push(le);
          lead.push(le);
        });
        off += Math.ceil(mo.len / 16) * 16;
      });
      sections.push({ n: row[0], si, start: base, end: base + bars * 16, who, kiai: !!L.kiai, hasLead: motifs.length > 0 });
      at += bars * 16;
    });
    ev.sort((a, b) => a.s - b.s);
    const steps = at + 4;
    return { id: def.id, name: def.name, artist: def.artist || 'gameplay', bpm: def.bpm, key: def.key, tonic, scale: sc, step, steps, dur: steps * step, ev, lead, drums, sections, inst: def.inst, vox: def.vox || null, def };
  }

  const SONGDEFS = [];
  const addSong = d => SONGDEFS.push(d);

  addSong({
    id: 'menu', name: 'Funky Menu', bpm: 102, key: 0, scale: 'maj',
    inst: { lead: 'sq', bass: 'sq', comp: 'stab', arp: 'pluck' },
    motifs: {
      M: '5:2 3:2 5:2 1^:4 7:2 .:4 | 6:2 4:2 6:2 1^:4 6:2 .:4',
      N: '4:2 6:2 4:2 6:4 5:2 .:4 | 5:2 7:2 5:2 2^:4 1^:2 .:4'
    },
    L: { m: { prog: '1 6 4 5', drum: 'rock', bass: 'oct', comp: 'stab4', arp: null } },
    sec: [['m', 4, 'm', 'M N'], ['m', 4, 'm', 'M N']]
  });

  addSong({
    id: 'warm-up-jam', name: 'Warm-Up Jam', bpm: 100, key: 0, scale: 'maj', vox: { o: 'bubba', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'pluck', dbl: 'sq' },
    motifs: {
      A: '5:2 5:2 6:2 5:2 3:4 .:4 | 5:2 5:2 6:2 5:2 2:4 .:4',
      B: '3:2 3:2 4:2 3:2 1:4 .:4 | 6v:2 1:2 3:2 1:2 2:6 .:2',
      B2: '3:2 3:2 4:2 3:2 5:4 .:4 | 4:2 3:2 2:2 1:2 1:8',
      H: '5:2 1^:2 1^:4 7:2 6:2 5:4 | 6:2 6:2 5:2 3:2 5:8',
      H2: '6:2 3^:2 3^:4 2^:2 1^:2 7:4 | 6:2 1^:2 6:2 4:2 4:8',
      H3: '6:2 3^:2 3^:4 2^:2 1^:2 7:4 | 6:2 1^:2 2^:2 3^:2 1^:8',
      X: '4:4 4:2 6:2 1^:4 6:4 | 5:4 5:2 7:2 2^:8',
      Y: '3^:4 3^:2 2^:2 1^:4 6:4 | 5:2 6:2 7:2 5:2 5:8'
    },
    L: {
      i: { prog: '1 5', drum: 'half', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 5 6 4', drum: 'rock', bass: 'eight', comp: 'offs' },
      c: { prog: '1 5 6 4', drum: 'rock2', bass: 'oct', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '4 5 6 5', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 5', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['b', 4, 'o', 'X Y'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'sidewalk-strut', name: 'Sidewalk Strut', bpm: 120, key: 2, scale: 'min', vox: { o: 'bubba', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'pluck', dbl: 'sq' },
    motifs: {
      A: '1:2 .:2 1:2 3:2 5:4 3:2 1:2 | 7v:2 .:2 7v:2 1:2 3:4 .:4',
      B: '6v:2 .:2 6v:2 1:2 4:4 3:2 1:2 | 2:2 .:2 2:2 3:2 7:4 .:4',
      B2: '6v:2 .:2 6v:2 1:2 4:4 3:2 1:2 | 2:2 3:2 4:2 5:2 7:4 5:2 3:2',
      H: '5:4 5:2 4:2 3:4 1:4 | 6v:4 1:2 3:2 5:6 .:2',
      H2: '3:4 3:2 4:2 5:4 3:4 | 2:4 3:2 2:2 7v:8',
      H3: '3:4 3:2 4:2 5:4 3:4 | 2:2 2:2 3:2 2:2 1:8',
      X: '4:2 4:2 .:2 4:2 6:4 5:4 | 5:2 5:2 .:2 5:2 7:4 .:4',
      Y: '3:2 3:2 .:2 3:2 5:4 4:4 | 3:2 3:2 .:2 3:2 2:2 1:2 7#v:4'
    },
    L: {
      i: { prog: '1 6', drum: 'kickhat', bass: 'funk', comp: 'offs', vel: .8 },
      v: { prog: '1 1 6 7', drum: 'funk', bass: 'funk', comp: 'synco' },
      c: { prog: '1 6 3 7', drum: 'rock2', bass: 'eight', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '4 7 1 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 6', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A+2 B+2'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'boombox-blitz', name: 'Boombox Blitz', bpm: 140, key: 4, scale: 'min', vox: { o: 'bubba', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'pluck', dbl: 'pulse' },
    motifs: {
      A: '1:2 1:2 .:2 1:2 3:2 .:2 5:4 | 5:2 5:2 .:2 5:2 3:2 .:2 1:4',
      B: '7v:2 7v:2 .:2 7v:2 2:2 .:2 4:4 | 3:2 3:2 .:2 3:2 1:2 .:2 7v:4',
      B2: '7v:2 7v:2 .:2 7v:2 2:2 .:2 4:4 | 3:2 3:2 .:2 5:2 4:2 3:2 2:2 1:2',
      H: '5:4 5:2 6:2 5:2 3:2 1:2 3:2 | 6:4 6:2 5:2 3:6 .:2',
      H2: '7v:4 2:2 4:2 7:6 5:2 | 5:2 3:2 5:2 1^:2 7:4 5:2 3:2',
      H3: '7v:4 2:2 4:2 7:6 5:2 | 5:2 3:2 5:2 3:2 1:8',
      X: '5:4 5:2 3:2 5:4 6:4 | 7:4 7:2 5:2 2^:6 .:2',
      Y: '3^:4 3^:2 2^:2 1^:4 7:4 | 6:2 6:2 5:2 5:2 4#:4 5:4'
    },
    L: {
      i: { prog: '1 7', drum: 'half', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 1 7 6', drum: 'rock', bass: 'gallop', comp: 'offs' },
      c: { prog: '1 6 7 1', drum: 'rock2', bass: 'eight', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '6 7 1 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 7', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A^ B'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'haunted-hotplate', name: 'Haunted Hotplate', bpm: 110, key: 9, scale: 'hmin', vox: { o: 'ghoul', p: 'zig' },
    inst: { lead: 'vox', bass: 'pluck', comp: 'organ', arp: 'bell', dbl: 'flute' },
    motifs: {
      A: '1:4 1:2 2:2 3:4 2:2 1:2 | 7v:4 7v:2 1:2 2:4 1:4',
      B: '4:4 4:2 5:2 6:4 5:2 4:2 | 3:2 4:2 5:4 7:8',
      B2: '4:4 4:2 5:2 6:4 5:2 4:2 | 3:2 2:2 1:4 7v:8',
      H: '1^:4 7:2 6:2 5:4 3:4 | 4:4 6:2 4:2 3:8',
      H2: '4:2 6:2 1^:4 6:2 4:2 6:4 | 5:2 7:2 2^:4 1^:2 7:2 6:2 5:2',
      H3: '4:2 6:2 1^:4 6:2 4:2 6:4 | 5:2 7:2 2^:2 7:2 1^:8',
      X: '1:2 1:2 1:2 .:2 3:2 3:2 3:2 .:2 | 5:2 5:2 5:2 .:2 3:2 2:2 1:4',
      Y: '7:2 7:2 7:2 .:2 2^:2 2^:2 2^:2 .:2 | 1^:2 7:2 6:2 5:2 7:8'
    },
    L: {
      i: { prog: '1 5', drum: 'soft', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 1 4 5', drum: 'rock', bass: 'walk', comp: 'half' },
      c: { prog: '1 6 4 5', drum: 'rock2', bass: 'oct', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '1 1 5 5', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 5', drum: 'soft', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['b', 4, 'o', 'X Y'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'midnight-snack', name: 'Midnight Snack', bpm: 130, key: 6, scale: 'min', vox: { o: 'ghoul', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'organ', arp: 'pluck', dbl: 'pulse' },
    motifs: {
      A: '1:2 .:2 1:2 .:2 3:2 .:2 5:2 .:2 | 6:2 .:2 5:2 .:2 3:2 .:2 1:2 .:2',
      B: '4:2 .:2 4:2 .:2 6:2 .:2 5:2 3:2 | 5:2 .:2 5:2 .:2 7#:4 .:4',
      B2: '4:2 .:2 4:2 .:2 6:2 .:2 5:2 3:2 | 5:2 4:2 3:2 2:2 1:8',
      H: '1^:4 1^:2 7:2 6:4 5:4 | 7:2 7:2 6:2 5:2 3:8',
      H2: '6:4 6:2 1^:2 3^:4 1^:4 | 1^:2 7:2 6:2 5:2 7#:8',
      H3: '6:4 6:2 1^:2 3^:4 1^:4 | 1^:2 7:2 6:2 5:2 1:8',
      X: '4:2 4:2 .:2 6:2 4:2 .:2 3:2 .:2 | 1:2 1:2 .:2 3:2 1:2 .:2 7v:2 .:2',
      Y: '6:2 6:2 .:2 1^:2 6:2 .:2 5:2 .:2 | 5:2 5:2 .:2 7#:2 5:2 .:2 5:4'
    },
    L: {
      i: { prog: '1 4', drum: 'kickhat', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 1 4 5M', drum: 'hiphop', bass: 'funk', comp: 'push' },
      c: { prog: '1 7 6 5M', drum: 'rock2', bass: 'eight', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '4 1 6 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 4', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A+2 B+2'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'skeleton-shuffle', name: 'Skeleton Shuffle', bpm: 150, key: 2, scale: 'min', vox: { o: 'ghoul', p: 'zig' },
    inst: { lead: 'vox', bass: 'pluck', comp: 'organ', arp: 'pluck', dbl: 'pulse' },
    motifs: {
      A: '1:2 3:1 4:1 5:2 3:2 1:2 3:1 4:1 5:2 3:2 | 4:2 6:1 5:1 4:2 2:2 7v:2 1:2 2:2 .:2',
      B: '1:2 3:1 4:1 5:2 6:2 5:2 3:2 1:2 .:2 | 7#v:2 1:2 2:2 3:2 4:2 5:2 7#:4',
      B2: '1:2 3:1 4:1 5:2 6:2 5:2 3:2 1:2 .:2 | 7#v:2 1:2 2:2 3:2 4:2 5:2 1^:4',
      H: '5:2 5:2 6:2 5:2 3:2 1:2 3:2 5:2 | 6:2 6:2 1^:2 6:2 4:2 6:2 5:4',
      H2: '4:2 4:2 5:2 4:2 2:2 4:2 6:2 4:2 | 5:1 6:1 5:1 4:1 3:2 2:2 7#:8',
      H3: '4:2 4:2 5:2 4:2 2:2 4:2 6:2 4:2 | 5:1 6:1 5:1 4:1 3:2 2:2 1:8',
      X: '6:4 6:2 5:2 4:4 5:4 | 4:4 4:2 3:2 2:4 3:4',
      Y: '1:2 1:2 1:2 3:2 5:2 5:2 5:2 .:2 | 7#:2 7#:2 7#:2 2^:2 1^:8'
    },
    L: {
      i: { prog: '1 5M', drum: 'soft', bass: 'half', comp: 'pad', vel: .8 },
      v: { prog: '1 4 1 5M', drum: 'rock', bass: 'walk', comp: 'offs' },
      c: { prog: '1 6 4 5M', drum: 'rock2', bass: 'oct', comp: 'stab4', arp: 'arp8', crash: true, fill: true, kiai: true },
      b: { prog: '6 4 1 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 5M', drum: 'soft', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A^ B'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'neon-overdrive', name: 'Neon Overdrive', bpm: 128, key: 5, scale: 'min', vox: { o: 'mirage', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'chip', dbl: 'saw' },
    motifs: {
      A: '5:2 5:2 1^:2 5:2 3:2 5:2 1^:2 .:2 | 6:2 6:2 1^:2 6:2 4:2 6:2 1^:2 .:2',
      B: '7:2 7:2 3^:2 7:2 5:2 7:2 3^:2 .:2 | 5:2 5:2 7:2 5:2 3:2 2:2 1:4',
      B2: '7:2 7:2 3^:2 7:2 5:2 7:2 3^:2 .:2 | 5:2 5:2 7:2 5:2 3:2 5:2 7:4',
      H: '1^:4 7:2 5:2 1^:4 7:2 5:2 | 7:4 6:2 5:2 7:4 6:2 5:2',
      H2: '6:4 5:2 4:2 6:4 5:2 4:2 | 5:4 4:2 3:2 5:6 .:2',
      H3: '6:4 5:2 4:2 6:4 5:2 4:2 | 5:4 4:2 3:2 1:8',
      X: '6:2 6:2 .:2 6:2 4:2 .:2 6:4 | 7:2 7:2 .:2 7:2 5:2 .:2 7:4',
      Y: '3^:2 3^:2 .:2 3^:2 1^:2 .:2 3^:4 | 5:2 5:2 .:2 7#:2 5:2 .:2 1^:4'
    },
    L: {
      i: { prog: '1 6', drum: 'kickhat', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 6 3 7', drum: 'four', bass: 'off', comp: 'stab4' },
      c: { prog: '1 7 6 7', drum: 'four', bass: 'eight', comp: 'stab4', arp: 'arp16', crash: true, fill: true, kiai: true },
      b: { prog: '6 7 3 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 6', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A B'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'circuit-breaker', name: 'Circuit Breaker', bpm: 150, key: 1, scale: 'min', vox: { o: 'mirage', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'chip', dbl: 'saw' },
    motifs: {
      A: '1:1 1:1 1:2 3:1 3:1 3:2 5:2 3:2 1:2 .:2 | 6:1 6:1 6:2 1^:1 1^:1 1^:2 6:2 5:2 3:2 .:2',
      B: '3:1 3:1 3:2 5:1 5:1 5:2 7:2 5:2 3:2 .:2 | 7v:1 7v:1 7v:2 2:1 2:1 2:2 5:2 2:2 7v:2 .:2',
      B2: '3:1 3:1 3:2 5:1 5:1 5:2 7:2 5:2 3:2 .:2 | 7v:1 7v:1 7v:2 2:1 2:1 2:2 5:2 4:2 3:2 2:2',
      H: '5:4 5:2 3:2 5:4 6:4 | 6:4 6:2 5:2 6:4 1^:4',
      H2: '7:4 7:2 5:2 7:4 3^:4 | 2^:4 2^:2 7:2 2^:4 7:4',
      H3: '7:4 7:2 5:2 7:4 3^:4 | 2^:4 2^:2 7:2 1^:8',
      X: '4:2 4:2 .:2 4:2 6:2 .:2 4:4 | 5:2 5:2 .:2 5:2 7:2 .:2 5:4',
      Y: '6:2 6:2 .:2 6:2 1^:2 .:2 6:4 | 5:2 5:2 .:2 5:2 7#:2 .:2 5:4'
    },
    L: {
      i: { prog: '1 6', drum: 'kickhat', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 6 3 7', drum: 'dnb', bass: 'dnb', comp: 'offs' },
      c: { prog: '1 6 3 7', drum: 'dnb2', bass: 'gallop', comp: 'stab4', arp: 'arp16', crash: true, fill: true, kiai: true },
      b: { prog: '4 5 6 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 6', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A^ B'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  addSong({
    id: 'mirrorball-showdown', name: 'Mirrorball Showdown', bpm: 170, key: 7, scale: 'min', vox: { o: 'mirage', p: 'zig' },
    inst: { lead: 'vox', bass: 'saw', comp: 'stab', arp: 'chip', dbl: 'saw' },
    motifs: {
      A: '1:1 3:1 5:2 3:1 5:1 7:2 5:2 3:2 1:2 .:2 | 6v:1 1:1 3:2 1:1 3:1 5:2 3:2 1:2 6v:2 .:2',
      B: '7v:1 2:1 4:2 2:1 4:1 6:2 4:2 2:2 7v:2 .:2 | 5:2 5:2 7#:2 5:2 2^:2 7#:2 5:4',
      B2: '7v:1 2:1 4:2 2:1 4:1 6:2 4:2 2:2 7v:2 .:2 | 5:2 5:2 7#:2 5:2 2^:2 7#:2 1^:4',
      H: '5:4 5:2 3:2 1:4 3:4 | 3:4 3:2 1:2 6v:4 1:4',
      H2: '4:4 4:2 2:2 7v:4 2:4 | 7#:4 7#:2 5:2 2:4 5:4',
      H3: '4:4 4:2 2:2 7v:4 2:4 | 7#:4 7#:2 5:2 1:8',
      X: '3:2 3:2 .:2 3:2 5:2 .:2 3:4 | 4:2 4:2 .:2 4:2 6:2 .:2 4:4',
      Y: '5:2 5:2 .:2 5:2 3:2 .:2 5:4 | 5:2 5:2 .:2 7#:2 2^:2 .:2 7#:4'
    },
    L: {
      i: { prog: '1 6', drum: 'kickhat', bass: 'sub', comp: 'pad', vel: .8 },
      v: { prog: '1 6 7 5M', drum: 'dnb', bass: 'dnb', comp: 'offs' },
      c: { prog: '1 6 7 5M', drum: 'dnb2', bass: 'gallop', comp: 'stab4', arp: 'arp16', crash: true, fill: true, kiai: true },
      b: { prog: '6 7 1 5M', drum: 'half', bass: 'root4', comp: 'pad' },
      o: { prog: '1 6', drum: 'half', bass: 'sub', comp: 'pad', vel: .8, end: true }
    },
    sec: [['i', 2, 'o', ''], ['v', 4, 'o', 'A B'], ['v', 4, 'p', 'A B2'], ['c', 8, 'b', 'H H2 H H3'], ['v', 4, 'o', 'A B'], ['b', 4, 'p', 'X Y'], ['c', 8, 'b', 'H H2 H H3'], ['o', 2, 'o', '']]
  });

  const OSU_L = (v, c, p, o) => ({
    i: { prog: o, drum: 'soft', bass: 'sub', comp: 'pad', vel: .8 },
    v: Object.assign({ prog: p[0] }, v),
    c: Object.assign({ prog: p[1], crash: true, kiai: true, fill: true }, c),
    k: { prog: p[2] || p[0], drum: 'none', bass: 'sub', comp: 'pad', vel: .7 },
    o: { prog: o, drum: 'soft', bass: 'sub', comp: 'pad', vel: .8, end: true }
  });

  addSong({
    id: 'paper-planes', name: 'Paper Planes at Dawn', bpm: 110, key: 7, scale: 'maj',
    inst: { lead: 'bell', bass: 'pluck', comp: 'keys', arp: 'bell' },
    motifs: {
      A: '3:4 5:2 3:2 1:4 .:4 | 2:4 5:2 2:2 7v:4 .:4',
      A2: '1:4 3:2 1:2 6v:4 .:4 | 1:4 3:2 5:2 3:8',
      B: '6:4 5:2 3:2 6:4 5:4 | 4:4 3:2 1:2 3:8',
      H: '1^:4 7:2 5:2 3^:4 1^:4 | 7:4 5:2 7:2 2^:4 .:4',
      H2: '3^:4 2^:2 1^:2 7:4 5:4 | 1^:4 7:2 5:2 1^:8'
    },
    L: OSU_L({ drum: 'half', bass: 'root4', comp: 'half' }, { drum: 'rock', bass: 'oct', comp: 'stab4', arp: 'arp8' }, ['1 5 6 4', '4 5 6 1', '6 4 1 5'], '1 5'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A A2 A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A A2 A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'cherry-soda', name: 'Cherry Soda Skyline', bpm: 128, key: 9, scale: 'maj',
    inst: { lead: 'saw', bass: 'saw', comp: 'stab', arp: 'pluck' },
    motifs: {
      A: '5:2 5:2 3:2 5:2 1^:4 7:2 5:2 | 5:2 5:2 3:2 5:2 2^:4 1^:2 7:2',
      B: '6:2 6:2 5:2 6:2 3^:4 2^:2 1^:2 | 2^:2 2^:2 1^:2 2^:2 4^:4 2^:4',
      H: '4^:4 3^:2 2^:2 1^:4 5:4 | 5:4 7:2 5:2 7:2 2^:2 5^:4',
      H2: '3^:4 3^:2 2^:2 1^:4 7:4 | 6:2 1^:2 3^:4 2^:2 1^:2 6:4'
    },
    L: OSU_L({ drum: 'rock', bass: 'eight', comp: 'offs' }, { drum: 'four', bass: 'oct', comp: 'stab4', arp: 'arp8' }, ['1 5 6 4', '4 5 3 6', '6 4 1 5'], '1 5'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'pixel-pursuit', name: 'Pixel Pursuit', bpm: 140, key: 4, scale: 'min',
    inst: { lead: 'pulse', bass: 'sq', comp: 'chip', arp: 'chip' },
    motifs: {
      A: '1:2 3:2 5:2 3:2 1:2 3:2 5:2 1^:2 | 7:2 2^:2 4^:2 2^:2 7:2 2^:2 4^:2 2^:2',
      B: '6:2 1^:2 3^:2 1^:2 6:2 1^:2 3^:2 5^:2 | 4^:2 2^:2 7:2 2^:2 4^:4 .:4',
      H: '3^:4 3^:2 2^:2 1^:4 6:4 | 2^:4 2^:2 1^:2 7:4 2^:4',
      H2: '5:2 5:2 3:2 5:2 1^:2 3^:2 5^:4 | 5^:2 4^:2 3^:2 2^:2 1^:8'
    },
    L: OSU_L({ drum: 'rock', bass: 'eight', comp: 'offs' }, { drum: 'rock2', bass: 'gallop', comp: 'stab4', arp: 'arp16' }, ['1 7 6 7', '6 7 1 1', '6 7 1 1'], '1 7'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'midnight-metro', name: 'Midnight Metro', bpm: 118, key: 9, scale: 'min',
    inst: { lead: 'synth', bass: 'saw', comp: 'pad', arp: 'pluck' },
    motifs: {
      A: '5:4 5:2 3:2 5:4 3:4 | 4:4 4:2 3:2 4:4 6:4',
      B: '3^:4 3^:2 1^:2 5:4 3:4 | 2^:4 2^:2 1^:2 7:4 5:4',
      H: '4^:2 4^:2 4^:4 3^:2 2^:2 1^:4 | 7:2 7:2 7:4 6:2 5:2 7:4',
      H2: '1^:2 1^:2 1^:4 7:2 6:2 5:4 | 6:2 7:2 1^:2 3^:2 1^:8'
    },
    L: OSU_L({ drum: 'four', bass: 'eight', comp: 'half', arp: 'arp8' }, { drum: 'four', bass: 'oct', comp: 'stab4', arp: 'arp16', ck: 'stab' }, ['1 6 3 7', '6 7 1 1', '4 5 1 5'], '1 7'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'glass-garden', name: 'Glass Garden', bpm: 90, key: 5, scale: 'maj',
    inst: { lead: 'bell', bass: 'sub', comp: 'keys', arp: 'bell' },
    motifs: {
      A: '3:6 5:2 1^:8 | 7:6 5:2 5:8',
      B: '6:6 5:2 3:8 | 4:6 3:2 1:8',
      H: '4^:6 3^:2 2^:4 1^:4 | 7:6 5:2 7:8',
      H2: '3^:6 2^:2 1^:4 7:4 | 6:4 1^:4 3^:8'
    },
    L: OSU_L({ drum: 'soft', bass: 'half', comp: 'half', arp: 'arp8' }, { drum: 'half', bass: 'root4', comp: 'pad', arp: 'arp8' }, ['1 5 6 4', '4 5 3 6', '6 4 1 5'], '1 5'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'turbo-tangerine', name: 'Turbo Tangerine', bpm: 172, key: 2, scale: 'min',
    inst: { lead: 'saw', bass: 'saw', comp: 'stab', arp: 'chip' },
    motifs: {
      A: '1:2 1:1 3:1 5:2 3:2 1:2 3:1 5:1 1^:2 5:2 | 6:2 6:1 1^:1 5:2 1^:2 6:2 5:1 3:1 1:2 .:2',
      B: '5:2 5:1 7:1 2^:2 7:2 5:2 7:1 2^:1 4^:2 2^:2 | 1^:2 1^:1 5:1 3:2 5:2 1^:2 5:1 3:1 1:2 .:2',
      H: '6:4 6:2 1^:2 3^:4 1^:2 6:2 | 7:4 7:2 2^:2 4^:4 2^:2 7:2',
      H2: '5^:4 5^:2 3^:2 1^:4 5:4 | 5:2 5:2 7#:2 5:2 2^:2 7#:2 5:4'
    },
    L: OSU_L({ drum: 'dnb', bass: 'dnb', comp: 'offs' }, { drum: 'dnb2', bass: 'gallop', comp: 'stab4', arp: 'arp16' }, ['1 6 7 1', '6 7 1 5M', '6 4 1 5M'], '1 6'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A+2 B+2 A B'], ['c', 8, 'm', 'H H2 H H2'], ['v', 8, 'm', 'A B A+2 B+2'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'lanterns-lake', name: 'Lanterns on the Lake', bpm: 100, key: 2, scale: 'maj',
    inst: { lead: 'flute', bass: 'pluck', comp: 'pluck', arp: 'pluck' },
    motifs: {
      A: '5:4 3:2 2:2 1:4 .:4 | 6v:4 1:2 3:2 5:4 .:4',
      B: '5:4 3:2 5:2 1^:6 .:2 | 6:4 5:2 3:2 2:6 .:2',
      H: '1^:4 2^:2 3^:2 5^:4 3^:4 | 2^:4 1^:2 7:2 5:4 .:4',
      H2: '3^:4 2^:2 1^:2 6:6 .:2 | 5:4 6:2 5:2 3:8'
    },
    L: OSU_L({ drum: 'soft', bass: 'root4', comp: 'half', arp: 'arp8' }, { drum: 'half', bass: 'oct', comp: 'stab4', arp: 'arp8' }, ['1 6 4 5', '4 5 1 6', '6 4 1 5'], '1 5'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  addSong({
    id: 'zero-gravity', name: 'Zero Gravity Breakdown', bpm: 180, key: 11, scale: 'min',
    inst: { lead: 'synth', bass: 'saw', comp: 'stab', arp: 'chip' },
    motifs: {
      A: '1:1 1:1 3:2 5:2 3:2 1:2 3:1 5:1 1^:2 .:2 | 6:1 6:1 1^:2 3^:2 1^:2 6:2 1^:1 3^:1 5^:2 .:2',
      B: '7:2 7:1 2^:1 4^:2 2^:2 7:2 2^:1 4^:1 7^:2 .:2 | 1:2 1:1 3:1 5:2 3:2 1:2 5:1 3:1 1^:2 .:2',
      H: '5^:2 5^:2 3^:2 5^:2 1^:4 3^:4 | 1^:2 1^:2 6:2 1^:2 3^:4 1^:4',
      H2: '4^:4 4^:2 2^:2 7:4 2^:4 | 5:4 5:2 7#:2 2^:4 7#:4'
    },
    L: OSU_L({ drum: 'dnb', bass: 'dnb', comp: 'offs' }, { drum: 'dnb2', bass: 'gallop', comp: 'stab4', arp: 'arp16' }, ['1 6 7 1', '1 6 7 5M', '6 7 1 5M'], '1 6'),
    sec: [['i', 2, 'm', ''], ['v', 8, 'm', 'A B A B'], ['c', 8, 'm', 'H H2 H H2'], ['k', 4, 'm', ''], ['v', 8, 'm', 'A+2 B+2 A B'], ['c', 8, 'm', 'H H2 H H2'], ['o', 2, 'm', '']]
  });

  const SONGS = {};
  SONGDEFS.forEach(d => { SONGS[d.id] = compileSong(d); });

  const DIFFS = ['Easy', 'Normal', 'Hard'];
  const LANES = ['L', 'D', 'U', 'R'];
  const LCOL = ['#c64cf2', '#27c4ff', '#3ee64f', '#ff4d5e'];
  const LCOL2 = ['#7f23b0', '#0b84b8', '#1c9a2b', '#b0202e'];

  function fnfChart(song, diff) {
    const R = mkRng(hashStr(song.id) * 7 + diff * 13 + 5);
    const st = song.step;
    const minGap = [4, 2, 1][diff];
    const keep = [];
    let lastS = -99, lastW = '';
    song.lead.forEach(n => {
      const ok = diff === 2 ? true : diff === 1 ? (n.s % 2 === 0 || n.d >= 3) : (n.s % 4 === 0 || n.d >= 4);
      if (!ok) return;
      if (n.s - lastS < minGap && n.s !== lastS) return;
      keep.push(n); lastS = n.s; lastW = n.w;
    });
    const opp = [], ply = [];
    let lane = 1, prev = null;
    const busy = [-1, -1, -1, -1];
    keep.forEach((n, ix) => {
      if (prev !== null) {
        const dm = n.m - prev;
        let step = 0;
        if (dm > 0) step = dm > 4 ? 2 : 1;
        else if (dm < 0) step = dm < -4 ? -2 : -1;
        if (step && R() < .28) step += step > 0 ? 1 : -1;
        let nl = lane + step;
        if (nl > 3) nl = 3 - (nl - 3);
        if (nl < 0) nl = -nl;
        lane = clamp(nl, 0, 3);
      }
      if (busy[lane] >= n.s) lane = (lane + 1) % 4;
      prev = n.m;
      const holdMin = diff === 0 ? 8 : 4;
      const hold = n.d >= holdMin;
      const nxt = keep[ix + 1];
      let lenSteps = n.d;
      if (nxt && nxt.s - n.s < lenSteps + 1) lenSteps = Math.max(0, nxt.s - n.s - 1);
      const len = hold && lenSteps >= 3 ? (lenSteps - .6) * st : 0;
      busy[lane] = len ? n.s + lenSteps : n.s;
      const base = { t: n.s * st, s: n.s, lane, len, m: n.m, w: n.w };
      if (n.w === 'o' || n.w === 'b') opp.push(Object.assign({}, base));
      if (n.w === 'p' || n.w === 'b') ply.push(Object.assign({}, base));
    });
    if (diff === 2) {
      const snares = song.drums.filter(d => d.n === 's');
      const taken = new Set(ply.map(n => n.s));
      const secP = song.sections.filter(s => s.who === 'p' || s.who === 'b');
      snares.forEach(d => {
        const sec = secP.find(s => d.s >= s.start && d.s < s.end);
        if (!sec) return;
        for (let k = -1; k <= 1; k++) if (taken.has(d.s + k)) return;
        const near = ply.filter(n => Math.abs(n.s - d.s) <= 2);
        if (near.length) return;
        const pl = (near[0] ? near[0].lane : (d.s * 7) % 4) % 4;
        ply.push({ t: d.s * st, s: d.s, lane: (pl + 2) % 4, len: 0, m: 0, w: 'x' });
      });
      ply.sort((a, b) => a.t - b.t);
    }
    ply.forEach((n, i) => { n.i = i; });
    return { opp, ply };
  }

  const OUT = '#1c1130';
  const outl = (c, w) => { c.lineWidth = w; c.strokeStyle = OUT; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); };
  const fillOut = (c, col, w) => { c.fillStyle = col; c.fill(); outl(c, w == null ? 6 : w); };
  const ovalP = (c, x, y, rx, ry, rot) => { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, 7); };
  const oval = (c, x, y, rx, ry, col, w, rot) => { ovalP(c, x, y, rx, ry, rot); fillOut(c, col, w); };
  const rrect = (c, x, y, w, h, r, col, lw) => { c.beginPath(); c.roundRect(x, y, w, h, r); fillOut(c, col, lw); };
  const limb = (c, pts, w, col) => {
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.strokeStyle = OUT; c.lineWidth = w + 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.stroke();
  };
  function ik(sx, sy, tx, ty, l1, l2, dir) {
    let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
    const mx = l1 + l2 - .5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    if (d < 8) d = 8;
    const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
    const base = Math.atan2(dy, dx) + dir * a;
    return [sx + Math.cos(base) * l1, sy + Math.sin(base) * l1, sx + dx, sy + dy];
  }
  function eye(c, x, y, rx, ry, look, blink, hurt, iris) {
    if (hurt) {
      c.beginPath(); c.moveTo(x - rx * .7, y - ry * .5); c.lineTo(x + rx * .7, y + ry * .5); c.moveTo(x + rx * .7, y - ry * .5); c.lineTo(x - rx * .7, y + ry * .5); outl(c, 6); return;
    }
    if (blink) { c.beginPath(); c.moveTo(x - rx, y); c.quadraticCurveTo(x, y + ry * .5, x + rx, y); outl(c, 5); return; }
    oval(c, x, y, rx, ry, '#fff', 4);
    oval(c, x + look * rx * .38, y + ry * .08, rx * .5, ry * .62, iris || OUT, 0);
    ovalP(c, x + look * rx * .38 - rx * .12, y - ry * .18, rx * .16, ry * .2); c.fillStyle = '#fff'; c.fill();
  }
  function mouthDraw(c, x, y, w, op, hurt) {
    if (hurt) { c.beginPath(); c.moveTo(x - w * .5, y + w * .15); c.quadraticCurveTo(x, y - w * .2, x + w * .5, y + w * .15); outl(c, 5); return; }
    if (op < .12) { c.beginPath(); c.arc(x, y - w * .22, w * .5, .12 * Math.PI, .88 * Math.PI); outl(c, 5); return; }
    const h = w * .16 + w * .62 * op;
    c.save(); ovalP(c, x, y + h * .35, w * .5, h * .5); c.fillStyle = '#4d0f2c'; c.fill(); c.clip();
    ovalP(c, x, y + h * .85, w * .32, h * .38); c.fillStyle = '#ff6f91'; c.fill();
    c.fillStyle = '#fff'; c.fillRect(x - w * .4, y - h * .2, w * .8, h * .3);
    c.restore();
    ovalP(c, x, y + h * .35, w * .5, h * .5); outl(c, 5);
  }
  function micDraw(c, x, y, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    limb(c, [0, 12, 0, -14], 9, '#2b2540');
    oval(c, 0, -26, 12, 13, '#c9cfdd', 5);
    c.beginPath(); c.arc(-3, -29, 4, 0, 7); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill();
    c.restore();
  }

  const POSE = [
    { hx: 0, hy: 0, hr: 0, by: 0, bx: 0, l: [-32, 44], r: [32, 44], op: 0 },
    { hx: -20, hy: 4, hr: -.24, by: 0, bx: -9, l: [-112, -34], r: [8, -26], op: 1 },
    { hx: 0, hy: 38, hr: 0, by: 28, bx: 0, l: [-40, 100], r: [40, 100], op: 1 },
    { hx: 6, hy: -20, hr: .1, by: -6, bx: 3, l: [-44, -122], r: [44, -122], op: 1 },
    { hx: 20, hy: 4, hr: .24, by: 0, bx: 9, l: [-8, -26], r: [112, -34], op: 1 },
    { hx: -10, hy: 32, hr: -.32, by: 18, bx: -5, l: [-24, 70], r: [24, 70], op: 0 }
  ];
  function poseOf(pose, ph) {
    const k = Math.min(1, ph * 9), e = k * (2 - k), I = POSE[0], P = POSE[pose] || I;
    const m = (a, b) => a + (b - a) * e;
    return { hx: m(0, P.hx), hy: m(0, P.hy), hr: m(0, P.hr), by: m(0, P.by), bx: m(0, P.bx), lx: m(I.l[0], P.l[0]), ly: m(I.l[1], P.l[1]), rx: m(I.r[0], P.r[0]), ry: m(I.r[1], P.r[1]), op: P.op };
  }

  const CHARS = {
    zig: {
      hy: -214, sh: -148, shw: 42, hip: -74, hr: 52,
      legs(c, g) {
        [-1, 1].forEach(s => {
          const fx = s * 26 + g.bx * .5, kx = s * 22 + g.bx * .6, ky = -38 + g.by * .35;
          limb(c, [s * 20 + g.bx, -76 + g.by, kx, ky, fx, -14], 24, '#3f4fae');
          oval(c, fx + s * 6, -10, 27, 15, '#f6f6fb', 6);
          c.beginPath(); c.ellipse(fx + s * 17, -9, 11, 10, 0, -1.2, 1.2); c.fillStyle = '#e8465b'; c.fill();
          c.beginPath(); c.moveTo(fx - 14, -4); c.lineTo(fx + 26, -4); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
        });
      },
      body(c, g) {
        const by = g.by, bx = g.bx;
        c.beginPath(); c.moveTo(-46 + bx, -72 + by); c.lineTo(-42 + bx, -152 + by); c.quadraticCurveTo(bx, -166 + by, 42 + bx, -152 + by); c.lineTo(46 + bx, -72 + by); c.quadraticCurveTo(bx, -62 + by, -46 + bx, -72 + by); fillOut(c, '#ff7b3a', 7);
        rrect(c, -26 + bx, -112 + by, 52, 28, 9, '#ff9a5e', 5);
        c.beginPath(); c.moveTo(-8 + bx, -158 + by); c.lineTo(-10 + bx, -126 + by); c.moveTo(8 + bx, -158 + by); c.lineTo(10 + bx, -122 + by); outl(c, 4);
      },
      arm: '#ff7b3a', hand: '#f6caa4',
      head(c, g) {
        const hr = 52;
        oval(c, -hr + 6, 4, 11, 15, '#f6caa4', 5); oval(c, hr - 6, 4, 11, 15, '#f6caa4', 5);
        oval(c, 0, 0, hr, hr * .94, '#f6caa4', 7);
        c.beginPath(); c.moveTo(-hr - 3, -8); c.quadraticCurveTo(-hr * .8, -hr * 1.2, 0, -hr * 1.18); c.quadraticCurveTo(hr * .8, -hr * 1.2, hr + 3, -8); c.quadraticCurveTo(0, -hr * .38, -hr - 3, -8); fillOut(c, '#1fb6d4', 7);
        c.save(); c.clip();
        c.fillStyle = '#ffd23f'; c.fillRect(-hr - 5, -hr * .72, hr * 2 + 10, 9);
        c.restore();
        c.beginPath(); c.moveTo(-hr - 3, -8); c.quadraticCurveTo(0, -hr * .38, hr + 3, -8); outl(c, 7);
        rrect(c, -hr - 5, -22, hr * 2 + 10, 17, 8, '#14899f', 6);
        oval(c, 0, -hr * 1.22, 12, 12, '#ff7b3a', 5);
        oval(c, -hr * .62, -hr * .1, 11, 6, '#2fd6c0', 0);
        c.beginPath(); c.moveTo(-hr * .55, -hr * .08); c.quadraticCurveTo(-hr * .85, -2, -hr * .98, 4); c.lineTo(-hr * .86, 14); c.quadraticCurveTo(-hr * .62, 0, -hr * .4, 0); fillOut(c, '#2fd6c0', 4);
        const ex = 19, ey = 8;
        eye(c, -ex, ey, 14, 17, g.look, g.blink, g.hurt);
        eye(c, ex, ey, 14, 17, g.look, g.blink, g.hurt);
        c.beginPath(); c.moveTo(-ex - 14, ey - 25 - (g.hurt ? -3 : 0)); c.lineTo(-ex + 10, ey - 25 + (g.hurt ? -4 : 0)); c.moveTo(ex - 10, ey - 25 + (g.hurt ? -4 : 0)); c.lineTo(ex + 14, ey - 25 - (g.hurt ? -3 : 0)); outl(c, 6);
        oval(c, -34, 28, 9, 5, 'rgba(255,90,110,.45)', 0); oval(c, 34, 28, 9, 5, 'rgba(255,90,110,.45)', 0);
        mouthDraw(c, 0, 34, 30, g.open, g.hurt);
      }
    },
    bubba: {
      hy: -222, sh: -140, shw: 50, hip: -70, hr: 70,
      legs(c, g) {
        [-1, 1].forEach(s => {
          const fx = s * 30 + g.bx * .5, ky = -36 + g.by * .35;
          limb(c, [s * 22 + g.bx, -78 + g.by, s * 26 + g.bx * .6, ky, fx, -14], 28, '#ffd23f');
          oval(c, fx + s * 4, -9, 30, 16, '#2b2b4a', 6);
          c.beginPath(); c.moveTo(fx - 22, -5); c.lineTo(fx + 28, -5); c.strokeStyle = '#ff5fa8'; c.lineWidth = 4; c.stroke();
        });
      },
      body(c, g) {
        const by = g.by, bx = g.bx;
        c.beginPath(); c.moveTo(-54 + bx, -76 + by); c.lineTo(-50 + bx, -146 + by); c.quadraticCurveTo(bx, -156 + by, 50 + bx, -146 + by); c.lineTo(54 + bx, -76 + by); c.quadraticCurveTo(bx, -66 + by, -54 + bx, -76 + by); fillOut(c, '#2dc7b8', 7);
        c.save(); c.clip(); c.fillStyle = '#ff5fa8'; c.fillRect(-60 + bx, -120 + by, 120, 14); c.fillRect(-60 + bx, -96 + by, 120, 14); c.restore();
        c.beginPath(); c.moveTo(-54 + bx, -76 + by); c.lineTo(-50 + bx, -146 + by); c.quadraticCurveTo(bx, -156 + by, 50 + bx, -146 + by); c.lineTo(54 + bx, -76 + by); c.quadraticCurveTo(bx, -66 + by, -54 + bx, -76 + by); outl(c, 7);
      },
      arm: '#2dc7b8', hand: '#ffffff',
      head(c, g) {
        const pul = g.pulse;
        c.beginPath(); c.moveTo(-26, -58); c.quadraticCurveTo(-26, -90, 0, -90); c.quadraticCurveTo(26, -90, 26, -58); outl(c, 12);
        c.strokeStyle = '#ffd23f'; c.lineWidth = 6; c.stroke();
        c.beginPath(); c.moveTo(44, -56); c.lineTo(62, -104); outl(c, 6); oval(c, 63, -108, 8, 8, '#ff5fa8', 5);
        rrect(c, -86, -56, 172, 112, 26, '#ff5fa8', 8);
        rrect(c, -74, -44, 148, 88, 20, '#ff86bd', 0);
        [-1, 1].forEach(s => {
          const sx = s * 52, sy = 14, r = 33 + pul * 3.5;
          oval(c, sx, sy, r, r, '#2b2140', 6);
          oval(c, sx, sy, r * .66, r * .66, '#ffd23f', 4);
          oval(c, sx, sy, r * .3 + pul * 2, r * .3 + pul * 2, '#2b2140', 4);
          oval(c, sx, sy, r * .12, r * .12, '#ff5fa8', 0);
        });
        rrect(c, -34, -42, 68, 38, 8, '#2b2140', 5);
        const ex = 15, ey = -23;
        if (g.hurt) { eye(c, -ex, ey, 9, 9, 0, false, true); eye(c, ex, ey, 9, 9, 0, false, true); }
        else {
          [-1, 1].forEach(s => {
            oval(c, s * ex, ey, 11, 11, '#e9ecff', 4);
            oval(c, s * ex + g.look * 3, ey + 1, 5.5, 5.5, '#1c1130', 0);
            if (g.blink) { c.fillStyle = '#2b2140'; c.fillRect(s * ex - 12, ey - 12, 24, 16); }
          });
        }
        const op = g.open;
        rrect(c, -24, 6, 48, 18 + op * 22, 8, op > .12 ? '#14091f' : '#2b2140', 4);
        if (op > .12) { c.fillStyle = '#ff6f91'; c.beginPath(); c.ellipse(0, 6 + 18 + op * 22 - 5, 14, 5, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(-20, 8, 40, 5); }
        else { c.beginPath(); c.moveTo(-16, 15); c.quadraticCurveTo(0, 22, 16, 15); outl(c, 3); c.strokeStyle = '#ff86bd'; c.lineWidth = 3; c.stroke(); }
        for (let i = 0; i < 4; i++) oval(c, -66 + i * 14, 48, 3.5, 3.5, ['#ffd23f', '#27c4ff', '#3ee64f', '#fff'][i], 2);
      }
    },
    ghoul: {
      hy: -200, sh: -122, shw: 56, hip: -40, hr: 62, float: 1,
      legs() { },
      body(c, g) {
        const by = g.by * .5, bx = g.bx, hv = g.hover;
        c.save();
        c.shadowColor = 'rgba(120,255,170,.55)'; c.shadowBlur = 24;
        c.beginPath(); c.moveTo(-78 + bx, -34 + hv);
        c.bezierCurveTo(-96 + bx, -110 + by, -66 + bx, -170 + by, bx, -176 + by);
        c.bezierCurveTo(66 + bx, -170 + by, 96 + bx, -110 + by, 78 + bx, -34 + hv);
        const w = g.wave;
        for (let i = 0; i < 5; i++) { const x0 = 78 - i * 31.2, x1 = 78 - (i + 1) * 31.2; c.quadraticCurveTo((x0 + x1) / 2 + bx, -2 + hv + (i % 2 ? -8 : 10) + Math.sin(w + i) * 5, x1 + bx, -34 + hv + Math.sin(w * 1.3 + i) * 3); }
        c.closePath();
        c.fillStyle = '#ecfff1'; c.fill(); c.restore();
        outl(c, 7);
        c.save(); c.clip(); c.fillStyle = 'rgba(120,230,170,.28)'; c.fillRect(-100, -80 + hv, 200, 80); c.restore();
        oval(c, 0 + bx, -92 + by, 20, 24, 'rgba(120,230,170,.35)', 0);
        c.beginPath(); c.moveTo(-18 + bx, -128 + by); c.lineTo(-6 + bx, -100 + by); c.lineTo(8 + bx, -128 + by); c.strokeStyle = '#8f2d4f'; c.lineWidth = 6; c.lineCap = 'round'; c.stroke();
        rrect(c, -26 + bx, -86 + by, 52, 38, 6, '#fff8e0', 5);
        c.fillStyle = '#c8553d'; c.fillRect(-26 + bx, -76 + by, 52, 6);
      },
      arm: '#ecfff1', hand: '#ecfff1',
      head(c, g) {
        const hr = 60;
        c.save(); c.shadowColor = 'rgba(120,255,170,.6)'; c.shadowBlur = 20;
        oval(c, 0, 0, hr, hr * .96, '#f4fff6', 7); c.restore();
        c.save(); ovalP(c, 0, 0, hr, hr * .96); c.clip();
        c.fillStyle = 'rgba(150,235,185,.3)'; c.fillRect(-hr, 20, hr * 2, 60); c.restore();
        rrect(c, -50, -hr * .98 - 14, 100, 20, 8, '#ffffff', 6);
        [[-32, -hr - 38, 28], [0, -hr - 56, 34], [32, -hr - 38, 28]].forEach(a => oval(c, a[0], a[1], a[2], a[2] * .88, '#ffffff', 6));
        rrect(c, -50, -hr * .98 - 14, 100, 20, 8, '#ffffff', 6);
        c.beginPath(); c.moveTo(-46, -hr + 2); c.lineTo(46, -hr + 2); c.strokeStyle = '#d6dbe8'; c.lineWidth = 4; c.stroke();
        const ex = 22, ey = -10;
        [-1, 1].forEach(s => {
          if (g.hurt) { eye(c, s * ex, ey, 13, 13, 0, false, true); return; }
          oval(c, s * ex, ey, 16, 20, '#1c1130', 6);
          oval(c, s * ex, ey, 11, 15, '#7dff9e', 0);
          oval(c, s * ex + g.look * 4, ey + 2, 6, 9, '#0d3b1f', 0);
          ovalP(c, s * ex - 3, ey - 6, 3.4, 4.6); c.fillStyle = '#fff'; c.fill();
          if (g.blink) { c.fillStyle = '#f4fff6'; c.fillRect(s * ex - 18, ey - 22, 36, 26); c.beginPath(); c.moveTo(s * ex - 14, ey); c.lineTo(s * ex + 14, ey); outl(c, 5); }
        });
        c.beginPath(); c.moveTo(-ex - 14, ey - 28); c.lineTo(-ex + 12, ey - 24 + (g.hurt ? -4 : 0)); c.moveTo(ex - 12, ey - 24 + (g.hurt ? -4 : 0)); c.lineTo(ex + 14, ey - 28); outl(c, 6);
        c.beginPath(); c.moveTo(0, 14); c.bezierCurveTo(-14, 6, -40, 8, -50, 24); c.bezierCurveTo(-44, 34, -22, 28, 0, 22); c.bezierCurveTo(22, 28, 44, 34, 50, 24); c.bezierCurveTo(40, 8, 14, 6, 0, 14); fillOut(c, '#3a2a2a', 5);
        mouthDraw(c, 0, 38, 30, g.open, g.hurt);
      }
    },
    mirage: {
      hy: -222, sh: -148, shw: 44, hip: -76, hr: 52,
      legs(c, g) {
        [-1, 1].forEach(s => {
          const fx = s * 24 + g.bx * .5, ky = -40 + g.by * .35;
          limb(c, [s * 18 + g.bx, -78 + g.by, s * 22 + g.bx * .6, ky, fx, -18], 15, '#cfd5ff');
          oval(c, s * 22 + g.bx * .6, ky, 9, 9, '#6a3df0', 4);
          rrect(c, fx - 22, -22, 44, 20, 8, '#ff3df0', 6);
          rrect(c, fx - 24, -6, 48, 9, 4, '#241545', 4);
        });
      },
      body(c, g) {
        const by = g.by, bx = g.bx;
        c.beginPath(); c.moveTo(-44 + bx, -76 + by); c.lineTo(-52 + bx, -150 + by); c.quadraticCurveTo(bx, -166 + by, 52 + bx, -150 + by); c.lineTo(44 + bx, -76 + by); c.quadraticCurveTo(bx, -66 + by, -44 + bx, -76 + by); fillOut(c, '#6a3df0', 7);
        c.save(); c.clip();
        c.strokeStyle = '#47f0ff'; c.lineWidth = 4; c.shadowColor = '#47f0ff'; c.shadowBlur = 10;
        c.beginPath(); c.moveTo(-30 + bx, -150 + by); c.lineTo(-20 + bx, -76 + by); c.moveTo(30 + bx, -150 + by); c.lineTo(20 + bx, -76 + by); c.moveTo(-40 + bx, -112 + by); c.lineTo(40 + bx, -112 + by); c.stroke();
        c.restore();
        oval(c, bx, -118 + by, 14, 14, '#241545', 5); oval(c, bx, -118 + by, 7, 7, g.led, 0);
        oval(c, -54 + bx, -146 + by, 17, 13, '#ff3df0', 6); oval(c, 54 + bx, -146 + by, 17, 13, '#ff3df0', 6);
      },
      arm: '#cfd5ff', hand: '#47f0ff',
      head(c, g) {
        const hr = 52, t = g.t;
        c.save(); c.shadowColor = '#ff3df0'; c.shadowBlur = 18;
        oval(c, 0, 0, hr, hr, '#d7dcff', 7); c.restore();
        c.save(); ovalP(c, 0, 0, hr, hr); c.clip();
        for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) {
          const x = i * 13 + (j % 2) * 6.5, y = j * 12, sh = ((i * 7 + j * 13 + Math.floor(t * 3)) % 5 + 5) % 5;
          c.fillStyle = ['#e9ecff', '#b8c0ff', '#ffffff', '#c9a9ff', '#a9f6ff'][sh];
          c.fillRect(x - 5.5, y - 5, 11, 10);
        }
        c.strokeStyle = 'rgba(40,20,80,.35)'; c.lineWidth = 1.5;
        for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * 13, -70); c.lineTo(i * 13, 70); c.stroke(); }
        for (let j = -5; j <= 5; j++) { c.beginPath(); c.moveTo(-70, j * 12); c.lineTo(70, j * 12); c.stroke(); }
        const sp = (Math.sin(t * 2.3) + 1) / 2;
        const gr = c.createRadialGradient(-18 + sp * 10, -20, 2, 0, 0, hr); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(60,20,120,.45)');
        c.fillStyle = gr; c.fillRect(-hr, -hr, hr * 2, hr * 2);
        c.restore();
        ovalP(c, 0, 0, hr, hr); outl(c, 7);
        rrect(c, -hr * .86, -14, hr * 1.72, 34, 15, '#1b1038', 6);
        const ey = 3;
        [-1, 1].forEach(s => {
          if (g.hurt) { c.beginPath(); c.moveTo(s * 20 - 8, ey - 6); c.lineTo(s * 20 + 8, ey + 6); c.moveTo(s * 20 + 8, ey - 6); c.lineTo(s * 20 - 8, ey + 6); c.strokeStyle = '#ff4d6d'; c.lineWidth = 5; c.stroke(); return; }
          c.save(); c.shadowColor = '#47f0ff'; c.shadowBlur = 10;
          c.beginPath();
          if (g.blink) { c.moveTo(s * 20 - 11, ey); c.lineTo(s * 20 + 11, ey); }
          else c.arc(s * 20 + g.look * 2, ey + 4, 11, Math.PI * 1.08, Math.PI * 1.92);
          c.strokeStyle = '#47f0ff'; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.restore();
        });
        const op = g.open;
        rrect(c, -20, 26, 40, 11 + op * 16, 6, '#1b1038', 5);
        c.fillStyle = '#ff3df0';
        for (let i = 0; i < 5; i++) { const h = 3 + (op > .12 ? (Math.sin(t * 20 + i * 1.7) * .5 + .5) * 14 * op : 0); c.fillRect(-16 + i * 7, 31 + (11 + op * 16 - 8 - h) / 2, 4.5, h + 1); }
        c.beginPath(); c.arc(0, -20, hr + 9, Math.PI * 1.08, Math.PI * 1.92); c.strokeStyle = OUT; c.lineWidth = 17; c.lineCap = 'round'; c.stroke();
        c.strokeStyle = '#ff3df0'; c.lineWidth = 9; c.stroke();
        oval(c, -hr - 6, 4, 14, 20, '#ff3df0', 6); oval(c, hr + 6, 4, 14, 20, '#ff3df0', 6);
        oval(c, -hr - 6, 4, 6, 10, '#241545', 0); oval(c, hr + 6, 4, 6, 10, '#241545', 0);
      }
    }
  };

  function drawChar(c, id, p) {
    const C = CHARS[id], P = poseOf(p.pose, p.ph), t = p.t;
    const bf = p.beat, bounce = Math.pow(1 - bf, 3) * 7;
    const g = {
      bx: P.bx, by: P.by + (p.pose === 0 ? bounce * .6 : 0), look: p.look || 0, open: p.open || 0, hurt: p.pose === 5,
      blink: ((t * .37 + (p.seed || 0)) % 1) < .035, pulse: Math.pow(1 - bf, 2), t, led: bf < .25 ? '#47f0ff' : '#ff3df0',
      hover: C.float ? Math.sin(t * 2.1 + (p.seed || 0)) * 10 - 10 : 0, wave: t * 3
    };
    c.save();
    c.translate(p.x, p.y); c.scale(p.s * (p.flip ? -1 : 1), p.s);
    c.globalAlpha = p.alpha == null ? 1 : p.alpha;
    c.beginPath(); c.ellipse(0, 2, 62, 11, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill();
    if (C.float) c.translate(0, g.hover);
    C.legs(c, g);
    C.body(c, g);
    const shy = C.sh + g.by, shx = C.shw + g.bx;
    const aL = ik(-shx, shy, -shx + P.lx, shy + P.ly, 50, 48, 1), aR = ik(shx, shy, shx + P.rx, shy + P.ry, 50, 48, -1);
    limb(c, [-shx, shy, aL[0], aL[1], aL[2], aL[3]], 20, C.arm);
    oval(c, aL[2], aL[3], 15, 15, C.hand, 5);
    c.save();
    c.translate(P.hx + g.bx * .6, C.hy + P.hy + g.by * .5); c.rotate(P.hr);
    C.head(c, g);
    c.restore();
    limb(c, [shx, shy, aR[0], aR[1], aR[2], aR[3]], 20, C.arm);
    micDraw(c, aR[2], aR[3] - 4, P.rx > 60 ? .5 : P.rx < -10 ? -.4 : -.1);
    oval(c, aR[2], aR[3], 15, 15, C.hand, 5);
    c.restore();
  }
  function drawIcon(c, id, x, y, size, state, flip) {
    const C = CHARS[id], g = { bx: 0, by: 0, look: flip ? -1 : 1, open: state === 2 ? .6 : 0, hurt: state === 1, blink: false, pulse: 0, t: performance.now() / 1000, led: '#47f0ff', hover: 0, wave: 0 };
    c.save();
    c.translate(x, y); const k = size / (C.hr * 2.5); c.scale(k * (flip ? -1 : 1), k);
    C.head(c, g);
    c.restore();
  }

  function drawMochi(c, x, y, s, t, beat) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const bounce = Math.pow(1 - beat, 3) * 6;
    [[-70, -64, 140, 64, '#3b2d58'], [-60, -128, 120, 64, '#4a3a6b']].forEach(([bx, by, w, h, col], i) => {
      rrect(c, bx, by, w, h, 8, col, 6);
      [0, 1].forEach(j => {
        const cx = bx + w / 2, cy = by + (i === 0 ? 36 : 36), r = i === 0 ? 22 + Math.pow(1 - beat, 2) * 3 : 18 + Math.pow(1 - beat, 2) * 3;
        void j;
        oval(c, cx, cy, r, r, '#1c1130', 4); oval(c, cx, cy, r * .5, r * .5, '#5b4a86', 3);
        oval(c, cx, by + 12, 4, 4, '#ff5fa8', 0);
      });
    });
    c.translate(0, -128 - bounce * .5);
    oval(c, 0, -26, 38, 30, '#ffb347', 6);
    oval(c, 0, -14, 22, 16, '#fff3de', 0);
    c.beginPath(); c.moveTo(34, -22); c.quadraticCurveTo(70, -20 + Math.sin(t * 5) * 8, 62, -60); outl(c, 14); c.strokeStyle = '#ffb347'; c.lineWidth = 8; c.stroke();
    c.save(); c.translate(0, -66 - bounce * .5); c.rotate(Math.sin(t * 4) * .06 + (beat < .5 ? .08 : -.08));
    c.beginPath(); c.moveTo(-34, -6); c.lineTo(-30, -44); c.lineTo(-10, -26); c.closePath(); fillOut(c, '#ffb347', 6);
    c.beginPath(); c.moveTo(34, -6); c.lineTo(30, -44); c.lineTo(10, -26); c.closePath(); fillOut(c, '#ffb347', 6);
    oval(c, 0, 0, 38, 30, '#ffb347', 6);
    oval(c, 0, 8, 20, 14, '#fff3de', 0);
    const bl = ((t * .3) % 1) < .04;
    [-1, 1].forEach(sd => { if (bl) { c.beginPath(); c.moveTo(sd * 15 - 7, -2); c.lineTo(sd * 15 + 7, -2); outl(c, 4); } else { oval(c, sd * 15, -2, 6, 8, '#1c1130', 0); ovalP(c, sd * 15 - 2, -5, 2, 2.4); c.fillStyle = '#fff'; c.fill(); } });
    c.beginPath(); c.moveTo(-5, 7); c.lineTo(5, 7); c.lineTo(0, 12); c.closePath(); c.fillStyle = '#ff7a9a'; c.fill();
    c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(-5, 18, -10, 14); c.moveTo(0, 12); c.quadraticCurveTo(5, 18, 10, 14); outl(c, 3);
    c.beginPath(); c.moveTo(-26, 8); c.lineTo(-48, 4); c.moveTo(-26, 12); c.lineTo(-48, 14); c.moveTo(26, 8); c.lineTo(48, 4); c.moveTo(26, 12); c.lineTo(48, 14); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    c.restore();
    c.restore();
  }

  const STAGE_CACHE = {};
  function rrand(seed) { const r = mkRng(seed); return r; }
  function stageStatic(idx, W, H) {
    const key = idx + ':' + W + 'x' + H;
    if (STAGE_CACHE[key]) return STAGE_CACHE[key];
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), R = rrand(100 + idx);
    const gy = H * .8;
    if (idx === 0) {
      const g = c.createLinearGradient(0, 0, 0, gy);
      g.addColorStop(0, '#2d2368'); g.addColorStop(.45, '#c2477a'); g.addColorStop(1, '#ffae5c');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      const sun = c.createRadialGradient(W * .5, gy * .92, 10, W * .5, gy * .92, W * .38);
      sun.addColorStop(0, 'rgba(255,230,160,.9)'); sun.addColorStop(1, 'rgba(255,170,90,0)');
      c.fillStyle = sun; c.fillRect(0, 0, W, H);
      [['#4e2f78', .52, .1], ['#3a2360', .62, .14], ['#2a184c', .7, .2]].forEach(([col, base, hh], li) => {
        let x = -20;
        while (x < W + 20) {
          const w = (50 + R() * 70) * (W / 1280), h = (hh * H) * (.5 + R() * 1.1);
          c.fillStyle = col; c.fillRect(x, gy * base - h + H * .1, w, gy - gy * base + h);
          if (li > 0) for (let wy = gy * base - h + H * .1 + 10; wy < gy - 20; wy += 22 * (H / 720)) for (let wx = x + 6; wx < x + w - 10; wx += 16 * (W / 1280)) if (R() < .32) { c.fillStyle = R() < .5 ? '#ffd27a' : '#ff9fc4'; c.fillRect(wx, wy, 7 * (W / 1280), 10 * (H / 720)); }
          x += w + 3;
        }
      });
      c.fillStyle = '#25163f'; c.fillRect(0, gy, W, H - gy);
      const sg = c.createLinearGradient(0, gy, 0, H); sg.addColorStop(0, '#3b2561'); sg.addColorStop(1, '#1a0f2e');
      c.fillStyle = sg; c.fillRect(0, gy, W, H - gy);
      c.fillStyle = '#5b3a8c'; c.fillRect(0, gy, W, 6 * (H / 720));
      c.fillStyle = '#8156c4'; c.beginPath(); c.moveTo(W * .12, H * .9); c.lineTo(W * .88, H * .9); c.lineTo(W * .92, gy + 6); c.lineTo(W * .08, gy + 6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2;
      for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(W * (.1 + i * .1), gy + 6); c.lineTo(W * (.05 + i * .1125), H * .9); c.stroke(); }
      [W * .05, W * .95].forEach((sx, i) => {
        for (let k = 0; k < 3; k++) {
          const w = 110 * (W / 1280), h = 120 * (H / 720), x = sx - w / 2, y = gy + 20 - (k + 1) * h * .95;
          c.fillStyle = '#2c1b4a'; c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill(); c.lineWidth = 5; c.strokeStyle = OUT; c.stroke();
        }
        void i;
      });
    } else if (idx === 1) {
      const g = c.createLinearGradient(0, 0, 0, gy);
      g.addColorStop(0, '#080a24'); g.addColorStop(.6, '#241a4a'); g.addColorStop(1, '#3d2a63');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,255,255,${.3 + R() * .7})`; c.fillRect(R() * W, R() * gy * .8, 2, 2); }
      const mx = W * .78, my = H * .22, mr = H * .13;
      const mg = c.createRadialGradient(mx, my, mr * .3, mx, my, mr * 2.4); mg.addColorStop(0, 'rgba(255,240,180,.55)'); mg.addColorStop(1, 'rgba(255,240,180,0)');
      c.fillStyle = mg; c.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
      c.beginPath(); c.arc(mx, my, mr, 0, 7); c.fillStyle = '#ffeeb0'; c.fill();
      c.fillStyle = 'rgba(200,170,110,.5)'; [[-.3, -.2, .22], [.25, .1, .16], [-.1, .35, .12]].forEach(([a, b, r]) => { c.beginPath(); c.arc(mx + a * mr, my + b * mr, r * mr, 0, 7); c.fill(); });
      c.fillStyle = '#150f2e';
      c.beginPath(); c.moveTo(W * .3, gy); c.lineTo(W * .3, gy - H * .22); c.lineTo(W * .34, gy - H * .22); c.lineTo(W * .36, gy - H * .3); c.lineTo(W * .4, gy - H * .22); c.lineTo(W * .5, gy - H * .22); c.lineTo(W * .5, gy - H * .36); c.lineTo(W * .545, gy - H * .44); c.lineTo(W * .59, gy - H * .36); c.lineTo(W * .59, gy - H * .22); c.lineTo(W * .68, gy - H * .22); c.lineTo(W * .68, gy); c.closePath(); c.fill();
      c.fillStyle = '#ffb347';
      [[.33, .14, 36, 50], [.42, .14, 36, 50], [.52, .28, 40, 56], [.52, .14, 40, 50], [.62, .14, 36, 50]].forEach(([a, b, w, h]) => { c.fillRect(W * a, gy - H * b - h * (H / 720) * .9, w * (W / 1280), h * (H / 720) * .8); });
      c.fillStyle = '#0d0a22'; c.fillRect(W * .535, gy - H * .08, 38 * (W / 1280), H * .08);
      c.strokeStyle = '#0b0820'; c.lineWidth = 8 * (W / 1280); c.lineCap = 'round';
      const tx = W * .14;
      c.beginPath(); c.moveTo(tx, gy); c.quadraticCurveTo(tx + 6, gy - H * .22, tx - 8, gy - H * .38); c.moveTo(tx - 2, gy - H * .2); c.lineTo(tx - 50, gy - H * .3); c.moveTo(tx + 2, gy - H * .26); c.lineTo(tx + 44, gy - H * .36); c.moveTo(tx - 8, gy - H * .38); c.lineTo(tx - 30, gy - H * .44); c.stroke();
      const gg = c.createLinearGradient(0, gy, 0, H); gg.addColorStop(0, '#1b3a2c'); gg.addColorStop(1, '#0c1a14');
      c.fillStyle = gg; c.fillRect(0, gy, W, H - gy);
      c.fillStyle = '#1a2a22'; for (let i = 0; i < 6; i++) { const x = W * (.08 + i * .17) + R() * 20, h = 40 * (H / 720) * (.7 + R() * .6); c.beginPath(); c.roundRect(x, gy - h * .55, 34 * (W / 1280), h, [14, 14, 0, 0]); c.fill(); c.strokeStyle = '#0b1510'; c.lineWidth = 3; c.stroke(); }
      c.fillStyle = '#3a2a57'; c.fillRect(0, gy + 4, W, 6 * (H / 720));
      c.fillStyle = '#2a1c42'; c.beginPath(); c.moveTo(W * .1, H * .9); c.lineTo(W * .9, H * .9); c.lineTo(W * .93, gy + 10); c.lineTo(W * .07, gy + 10); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2;
      for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(W * (.1 + i * .1), gy + 10); c.lineTo(W * (.05 + i * .1125), H * .9); c.stroke(); }
    } else {
      const g = c.createLinearGradient(0, 0, 0, gy);
      g.addColorStop(0, '#07041a'); g.addColorStop(.6, '#2a0b52'); g.addColorStop(1, '#6a1b8f');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(255,255,255,${.2 + R() * .8})`; c.fillRect(R() * W, R() * gy * .7, 2, 2); }
      [['#1d0b3d', .5, .3], ['#150830', .58, .4], ['#0c0420', .66, .5]].forEach(([col, base, hh], li) => {
        let x = -10;
        while (x < W + 10) {
          const w = (40 + R() * 60) * (W / 1280), h = (hh * H) * (.3 + R() * 1.0);
          c.fillStyle = col; c.fillRect(x, gy - h, w, h + 4);
          const wcol = ['#47f0ff', '#ff3df0', '#ffe14a', '#7dff9e'][(R() * 4) | 0];
          if (li > 0) for (let wy = gy - h + 8; wy < gy - 10; wy += 20 * (H / 720)) for (let wx = x + 5; wx < x + w - 8; wx += 14 * (W / 1280)) if (R() < .3) { c.fillStyle = wcol; c.globalAlpha = .55 + R() * .4; c.fillRect(wx, wy, 6 * (W / 1280), 8 * (H / 720)); c.globalAlpha = 1; }
          if (R() < .2) { c.fillStyle = col; c.fillRect(x + w / 2 - 2, gy - h - 40 * (H / 720), 4, 40 * (H / 720)); c.fillStyle = '#ff3d5e'; c.fillRect(x + w / 2 - 4, gy - h - 44 * (H / 720), 8, 8); }
          x += w + 2;
        }
      });
      const fg = c.createLinearGradient(0, gy, 0, H); fg.addColorStop(0, '#2a1450'); fg.addColorStop(1, '#0f0720');
      c.fillStyle = fg; c.fillRect(0, gy, W, H - gy);
      c.fillStyle = '#47f0ff'; c.fillRect(0, gy, W, 4 * (H / 720));
      c.strokeStyle = 'rgba(71,240,255,.25)'; c.lineWidth = 2;
      for (let i = 0; i <= 14; i++) { c.beginPath(); c.moveTo(W * .5 + (i - 7) * W * .04, gy + 4); c.lineTo(W * .5 + (i - 7) * W * .16, H); c.stroke(); }
      for (let j = 1; j <= 5; j++) { c.beginPath(); c.moveTo(0, gy + (H - gy) * Math.pow(j / 5, 1.6)); c.lineTo(W, gy + (H - gy) * Math.pow(j / 5, 1.6)); c.stroke(); }
      c.fillStyle = '#1a0f33'; c.fillRect(W * .38, gy - H * .12, W * .24, H * .12);
      c.strokeStyle = '#47f0ff'; c.lineWidth = 3; c.strokeRect(W * .38, gy - H * .12, W * .24, H * .12);
    }
    STAGE_CACHE[key] = cv;
    return cv;
  }
  function drawStage(c, idx, W, H, t, beat, bar, flash) {
    c.drawImage(stageStatic(idx, W, H), 0, 0);
    const gy = H * .8, k = W / 1280, pul = Math.pow(1 - beat, 2);
    if (idx === 0) {
      for (let i = 0; i < 14; i++) {
        const x = W * (i + .5) / 14, y = H * .06 + Math.sin(i * .8 + t) * 6 + (i % 2 ? 14 : 0) * k + 20 * Math.sin(Math.PI * (i + .5) / 14);
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 1, y - 14, 2, 14);
        const col = ['#ffd23f', '#ff5fa8', '#27c4ff', '#3ee64f'][(i + Math.floor(bar * 2)) % 4];
        c.save(); c.shadowColor = col; c.shadowBlur = 14 + pul * 10; c.beginPath(); c.arc(x, y, 7 * k + pul * 2, 0, 7); c.fillStyle = col; c.fill(); c.restore();
      }
      [W * .05, W * .95].forEach(sx => {
        for (let kk = 0; kk < 3; kk++) {
          const w = 110 * k, h = 120 * (H / 720), y = gy + 20 - (kk + 1) * h * .95;
          const r = (26 + pul * 4) * k;
          c.beginPath(); c.arc(sx, y + h * .62, r, 0, 7); c.fillStyle = '#120a22'; c.fill(); c.lineWidth = 4; c.strokeStyle = OUT; c.stroke();
          c.beginPath(); c.arc(sx, y + h * .62, r * .45, 0, 7); c.fillStyle = '#ffd23f'; c.fill();
          c.beginPath(); c.arc(sx, y + h * .2, 9 * k + pul * 2, 0, 7); c.fillStyle = '#120a22'; c.fill(); c.stroke();
          void w;
        }
      });
    } else if (idx === 1) {
      for (let i = 0; i < 5; i++) {
        const x = ((t * (40 + i * 13) + i * 300) % (W + 200)) - 100, y = H * (.12 + i * .06) + Math.sin(t * 2 + i) * 18;
        c.save(); c.translate(x, y); c.scale(k * (1 + i * .1), k * (1 + i * .1));
        const f = Math.sin(t * 14 + i) * .6;
        c.fillStyle = '#0a0720'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-14, -12 - f * 10, -30, -2 + f * 8); c.quadraticCurveTo(-18, 2, -8, 8); c.lineTo(0, 4); c.lineTo(8, 8); c.quadraticCurveTo(18, 2, 30, -2 + f * 8); c.quadraticCurveTo(14, -12 - f * 10, 0, 0); c.fill();
        c.restore();
      }
      for (let i = 0; i < 3; i++) {
        const fy = gy - H * .03 + i * H * .05, off = (t * (14 + i * 6) + i * 200) % W;
        const g = c.createLinearGradient(0, fy - 30, 0, fy + 30); g.addColorStop(0, 'rgba(180,255,220,0)'); g.addColorStop(.5, 'rgba(180,255,220,.14)'); g.addColorStop(1, 'rgba(180,255,220,0)');
        c.fillStyle = g; c.fillRect(-W + off, fy - 30, W * 2, 60);
      }
      if (flash > 0) { c.fillStyle = `rgba(210,220,255,${flash * .5})`; c.fillRect(0, 0, W, H); }
    } else {
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const ox = W * (.2 + i * .12), a = Math.sin(t * 1.3 + i * 1.1) * .5 + (i % 2 ? .25 : -.25);
        const col = ['rgba(71,240,255,', 'rgba(255,61,240,', 'rgba(125,255,158,'][i % 3];
        const g = c.createLinearGradient(ox, gy - H * .1, ox + Math.sin(a) * H, gy - H * .1 - Math.cos(a) * H);
        g.addColorStop(0, col + (.35 + pul * .3) + ')'); g.addColorStop(1, col + '0)');
        c.strokeStyle = g; c.lineWidth = 6 * k + pul * 4; c.beginPath(); c.moveTo(ox, gy - H * .1); c.lineTo(ox + Math.sin(a) * H, gy - H * .1 - Math.cos(a) * H); c.stroke();
      }
      c.restore();
      for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) {
        const fx = W * .04 + i * W * .08, fy = gy + 10 + j * H * .05 * (1 + j * .4), on = ((i + j + Math.floor(bar * 2)) % 3) === 0;
        if (on) { c.fillStyle = ['rgba(71,240,255,.2)', 'rgba(255,61,240,.2)', 'rgba(125,255,158,.2)'][(i + j) % 3]; c.fillRect(fx, fy, W * .06, H * .035); }
      }
    }
    if (flash > 0 && idx !== 1) { c.fillStyle = `rgba(255,255,255,${flash * .25})`; c.fillRect(0, 0, W, H); }
  }

  const WEEKS = [
    { id: 'w1', name: 'Block Party', tag: 'The block is loud tonight', opp: 'bubba', oppName: 'Bubba Boombox', stage: 0, songs: ['warm-up-jam', 'sidewalk-strut', 'boombox-blitz'], col: '#ff5fa8' },
    { id: 'w2', name: 'Spooky Suburb', tag: 'Dinner is served after midnight', opp: 'ghoul', oppName: 'Dr. Ghoulash', stage: 1, songs: ['haunted-hotplate', 'midnight-snack', 'skeleton-shuffle'], col: '#7dff9e' },
    { id: 'w3', name: 'Skyline Rooftop', tag: 'One last battle above the city', opp: 'mirage', oppName: 'Madame Mirage', stage: 2, songs: ['neon-overdrive', 'circuit-breaker', 'mirrorball-showdown'], col: '#47f0ff' }
  ];
  const SONG_WEEK = {};
  WEEKS.forEach((w, wi) => w.songs.forEach(s => { SONG_WEEK[s] = wi; }));


  const JUDGE = [
    { n: 'SICK', ms: 45, sc: 350, hp: 2.3, w: 1, col: '#47f0ff' },
    { n: 'GOOD', ms: 90, sc: 200, hp: 1.4, w: .75, col: '#7dff9e' },
    { n: 'BAD', ms: 135, sc: 100, hp: .5, w: .5, col: '#ffb347' },
    { n: 'SHIT', ms: 160, sc: 50, hp: -1, w: .25, col: '#ff6a5c' }
  ];
  const FNF_RANKS = [[100, 'S+'], [95, 'S'], [90, 'A'], [80, 'B'], [70, 'C'], [60, 'D'], [0, 'F']];
  const rankOf = acc => { for (const r of FNF_RANKS) if (acc >= r[0]) return r[1]; return 'F'; };
  const rankCol = r => ({ 'S+': '#ffe14a', S: '#ffd23f', A: '#7dff9e', B: '#47f0ff', C: '#ffb347', D: '#ff8a5c', F: '#ff4d5e' }[r] || '#fff');

  function calibrator(host, audio, api, o) {
    const gap = .6;
    let alive = true, base = 0, ticks = 0, diffs = [], flash = 0;
    host.innerHTML = `<div class="cal"><h2>Calibration</h2><p>${o.help}</p><div class="cal-dot"><i></i></div><div class="cal-num"><b>0</b> ms</div><div class="cal-hist"><u></u></div><p class="cal-s">Taps: <span>0</span> / 12</p><div class="cal-row"><button class="fo-b sm" data-c="-10">-10</button><button class="fo-b sm" data-c="-1">-1</button><button class="fo-b sm" data-c="+1">+1</button><button class="fo-b sm" data-c="+10">+10</button><button class="fo-b sm" data-c="0">Reset</button></div><div class="cal-row"><button class="fo-b" data-c="apply">Apply measured</button><button class="fo-b ghost" data-c="done">Done</button></div></div>`;
    const num = host.querySelector('.cal-num b'), dot = host.querySelector('.cal-dot i'), hist = host.querySelector('.cal-hist u'), cnt = host.querySelector('.cal-s span');
    const med = () => { if (!diffs.length) return null; const a = diffs.slice().sort((x, y) => x - y); return a[a.length >> 1] * 1000; };
    const show = () => { num.textContent = (SHARED.cal > 0 ? '+' : '') + SHARED.cal; const m = med(); cnt.textContent = Math.min(diffs.length, 12) + ' / 12'; hist.style.left = (50 + clamp((m == null ? 0 : m) / 3, -48, 48)) + '%'; hist.style.opacity = m == null ? 0 : 1; };
    show();
    const sched = () => {
      if (!alive) return;
      const now = audio.ctx.currentTime;
      if (!base) base = now + .6;
      while (base + ticks * gap < now + .6) {
        const t = base + ticks * gap;
        audio.tone(t, ticks % 4 === 0 ? 1320 : 880, .05, .3, 'square');
        ticks++;
      }
    };
    const iv = setInterval(sched, 90); sched();
    const tap = ts => {
      const t = audio.at(ts == null ? performance.now() : ts);
      if (!base || audio.ctx.state !== 'running') return;
      const n = Math.round((t - base) / gap);
      if (n < 1) return;
      const d = t - (base + n * gap);
      if (Math.abs(d) > .24) return;
      diffs.push(d); if (diffs.length > 12) diffs.shift();
      flash = 1; show();
      api.sfx('tap');
    };
    const kd = e => {
      if (!alive || e.repeat) return;
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); tap(e.timeStamp); }
      else if (e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); o.onDone(); }
    };
    const pd = e => { if (!alive) return; if (e.target.closest('.cal-dot')) { e.preventDefault(); tap(e.timeStamp); } };
    const ck = e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      const v = b.dataset.c;
      if (v === 'done') o.onDone();
      else if (v === 'apply') { const m = med(); if (m != null) { SHARED.cal = m; show(); } }
      else if (v === '0') { SHARED.cal = 0; diffs = []; show(); }
      else { SHARED.cal = SHARED.cal + parseInt(v, 10); show(); }
    };
    window.addEventListener('keydown', kd, true);
    host.addEventListener('pointerdown', pd);
    host.addEventListener('click', ck);
    let raf = 0;
    const anim = () => {
      if (!alive) return;
      const ph = ((audio.ctx.currentTime - (base || 0)) / gap) % 1, p = base ? (ph + 1) % 1 : 1;
      dot.style.transform = `scale(${1 + Math.pow(1 - p, 3) * .6 + flash * .2})`;
      dot.style.opacity = .55 + Math.pow(1 - p, 3) * .45;
      flash *= .9;
      raf = requestAnimationFrame(anim);
    };
    raf = requestAnimationFrame(anim);
    return () => { alive = false; clearInterval(iv); cancelAnimationFrame(raf); window.removeEventListener('keydown', kd, true); host.removeEventListener('pointerdown', pd); host.removeEventListener('click', ck); host.innerHTML = ''; };
  }

  const SHARED_CSS = (p, accent) => `
${p} .fo-b{font:900 calc(var(--u)*2.1)/1.1 "Trebuchet MS",system-ui,sans-serif;letter-spacing:.02em;color:#fff;background:linear-gradient(#3a2a63,#241545);border:calc(var(--u)*.28) solid #0f0720;border-radius:calc(var(--u)*1.2);padding:calc(var(--u)*1.1) calc(var(--u)*2.6);cursor:pointer;box-shadow:0 calc(var(--u)*.4) 0 #0f0720,0 0 0 calc(var(--u)*.2) rgba(255,255,255,.06) inset;text-shadow:0 calc(var(--u)*.2) 0 rgba(0,0,0,.5);transition:transform .08s,filter .12s;min-width:calc(var(--u)*14);touch-action:manipulation}
${p} .fo-b:hover,${p} .fo-b.on{filter:brightness(1.25);transform:translateY(calc(var(--u)*-.2))}
${p} .fo-b.on{outline:calc(var(--u)*.3) solid ${accent}}
${p} .fo-b:active{transform:translateY(calc(var(--u)*.2))}
${p} .fo-b.ghost{background:linear-gradient(#2a2340,#1a1530);color:#c9c2ea}
${p} .fo-b.sm{padding:calc(var(--u)*.7) calc(var(--u)*1.4);min-width:0;font-size:calc(var(--u)*1.7)}
${p} .fo-b.pri{background:linear-gradient(${accent},color-mix(in srgb,${accent} 55%,#000))}
${p} .fo-b[disabled],${p} .fo-b.lock{opacity:.4;filter:grayscale(.6);cursor:not-allowed}
${p} .cal{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*1.1);text-align:center;color:#fff;max-width:calc(var(--u)*58)}
${p} .cal h2{margin:0;font:900 calc(var(--u)*3.4)/1 "Trebuchet MS",system-ui,sans-serif}
${p} .cal p{margin:0;font:600 calc(var(--u)*1.7)/1.35 system-ui,sans-serif;color:#d9d3f5}
${p} .cal-dot{width:calc(var(--u)*13);height:calc(var(--u)*13);border-radius:50%;background:radial-gradient(#fff,${accent} 55%,transparent 72%);display:grid;place-items:center;cursor:pointer;touch-action:none}
${p} .cal-dot i{width:calc(var(--u)*7);height:calc(var(--u)*7);border-radius:50%;background:${accent};box-shadow:0 0 calc(var(--u)*3) ${accent}}
${p} .cal-num{font:900 calc(var(--u)*3)/1 "Trebuchet MS",system-ui,sans-serif}
${p} .cal-hist{position:relative;width:calc(var(--u)*40);height:calc(var(--u)*1.2);background:linear-gradient(90deg,#ff4d5e,#ffd23f 30%,#7dff9e 50%,#ffd23f 70%,#ff4d5e);border-radius:99px;opacity:.9}
${p} .cal-hist u{position:absolute;top:-35%;width:calc(var(--u)*.7);height:170%;background:#fff;border-radius:3px;transform:translateX(-50%);transition:left .15s;box-shadow:0 0 calc(var(--u)*1) #000}
${p} .cal-row{display:flex;gap:calc(var(--u)*.9);flex-wrap:wrap;justify-content:center}
`;


  const FNF_DEF_KEYS = [['KeyD', 'ArrowLeft'], ['KeyF', 'ArrowDown'], ['KeyJ', 'ArrowUp'], ['KeyK', 'ArrowRight']];
  const keyName = code => !code ? '-' : ({ ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down', Space: 'Space', Semicolon: ';', Comma: ',', Period: '.', Slash: '/' }[code] || code.replace(/^Key|^Digit/, ''));
  const LANE_ARROW = ['◀', '▼', '▲', '▶'];
  const arrowCache = {};
  function arrowSpr(lane, kind, R) {
    const key = lane + ':' + kind + ':' + R;
    if (arrowCache[key]) return arrowCache[key];
    const S = Math.ceil(R * 2.7), cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const c = cv.getContext('2d');
    c.translate(S / 2, S / 2); c.rotate([-Math.PI / 2, Math.PI, 0, Math.PI / 2][lane]);
    const P = [[0, -.54], [.54, .04], [.23, .04], [.23, .52], [-.23, .52], [-.23, .04], [-.54, .04]];
    const path = () => { c.beginPath(); P.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0] * R, p[1] * R)); c.closePath(); };
    c.lineJoin = 'round';
    if (kind === 0) {
      path(); const g = c.createLinearGradient(0, -R * .5, 0, R * .5); g.addColorStop(0, LCOL[lane]); g.addColorStop(1, LCOL2[lane]); c.fillStyle = g; c.fill();
      c.lineWidth = R * .13; c.strokeStyle = OUT; c.stroke();
      c.save(); path(); c.clip(); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(-R, -R, R * 2, R * .62); c.restore();
      c.lineWidth = R * .045; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-R * .3, -R * .02); c.lineTo(0, -R * .3); c.lineTo(R * .3, -R * .02); c.stroke();
    } else if (kind === 1) {
      path(); c.fillStyle = 'rgba(18,10,36,.55)'; c.fill(); c.lineWidth = R * .1; c.strokeStyle = 'rgba(210,205,240,.72)'; c.stroke();
    } else if (kind === 2) {
      path(); c.fillStyle = LCOL2[lane]; c.fill(); c.lineWidth = R * .1; c.strokeStyle = LCOL[lane]; c.stroke();
    } else {
      c.shadowColor = LCOL[lane]; c.shadowBlur = R * .8;
      path(); c.fillStyle = LCOL[lane]; c.fill(); c.lineWidth = R * .1; c.strokeStyle = '#fff'; c.stroke();
    }
    return arrowCache[key] = cv;
  }

  function txt(c, s, x, y, size, fill, align, lw, font) {
    c.font = `900 ${size}px ${font || '"Trebuchet MS", system-ui, sans-serif'}`;
    c.textAlign = align || 'center'; c.textBaseline = 'middle';
    if (lw !== 0) { c.lineWidth = lw || size * .22; c.lineJoin = 'round'; c.strokeStyle = OUT; c.strokeText(s, x, y); }
    c.fillStyle = fill; c.fillText(s, x, y);
  }

  const FNF_CSS = `
.gm-fnf{touch-action:none;background:#0b0618}
.gm-fnf .fo-wrap{position:relative;container-type:size;background:#0b0618;border-radius:10px;overflow:hidden;user-select:none;-webkit-user-select:none}
.gm-fnf .fo-wrap>canvas{display:block;width:100%!important;height:100%!important;aspect-ratio:auto!important}
.gm-fnf .fo-ui{position:absolute;inset:0;--u:1cqw;font-family:"Trebuchet MS",system-ui,sans-serif;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(var(--u)*1.2);overflow:hidden}
.gm-fnf .por .fo-ui{--u:2.3cqw}
.gm-fnf .fo-ui.off{pointer-events:none}
.gm-fnf .fo-ui.dim{background:rgba(8,4,20,.62);backdrop-filter:blur(3px)}
.gm-fnf .fo-col{display:flex;flex-direction:column;gap:calc(var(--u)*1.1);align-items:stretch}
.gm-fnf .fo-logo{margin:0;text-align:center;font:900 calc(var(--u)*6)/.95 "Trebuchet MS",system-ui,sans-serif;color:#ffd23f;text-shadow:0 calc(var(--u)*.45) 0 #b3401a,0 calc(var(--u)*.9) 0 #1c1130,calc(var(--u)*.3) 0 0 #1c1130,calc(var(--u)*-.3) 0 0 #1c1130;letter-spacing:.01em;transform:rotate(-2deg)}
.gm-fnf .fo-logo b{display:block;color:#ff5fa8;font-size:1.28em;text-shadow:0 calc(var(--u)*.45) 0 #7a1f55,0 calc(var(--u)*.9) 0 #1c1130,calc(var(--u)*.3) 0 0 #1c1130,calc(var(--u)*-.3) 0 0 #1c1130}
.gm-fnf .fo-sub{font:700 calc(var(--u)*1.7)/1.3 system-ui,sans-serif;color:#e7e0ff;text-align:center;text-shadow:0 2px 0 #000}
.gm-fnf .fo-press{font:900 calc(var(--u)*2.4)/1 "Trebuchet MS",system-ui,sans-serif;animation:fo-pulse 1.1s infinite alternate;text-shadow:0 calc(var(--u)*.3) 0 #000}
@keyframes fo-pulse{from{opacity:.45;transform:scale(.97)}to{opacity:1;transform:scale(1.03)}}
.gm-fnf .fo-head{position:absolute;top:calc(var(--u)*1.6);left:0;right:0;text-align:center;font:900 calc(var(--u)*3.2)/1 "Trebuchet MS",system-ui,sans-serif;text-shadow:0 calc(var(--u)*.3) 0 #000,0 0 calc(var(--u)*1.5) rgba(255,95,168,.6)}
.gm-fnf .fo-foot{position:absolute;bottom:calc(var(--u)*1.4);left:0;right:0;display:flex;gap:calc(var(--u)*1);justify-content:center;flex-wrap:wrap}
.gm-fnf .fo-weeks{display:flex;gap:calc(var(--u)*2);align-items:stretch;justify-content:center;margin-top:calc(var(--u)*3)}
.gm-fnf .por .fo-weeks{flex-direction:column;gap:calc(var(--u)*1.2);width:90%}
.gm-fnf .fo-wk{position:relative;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.8);padding:calc(var(--u)*1.8);width:calc(var(--u)*26);border-radius:calc(var(--u)*1.6);border:calc(var(--u)*.3) solid #0f0720;background:linear-gradient(#2d2150,#1a1233);cursor:pointer;text-align:center;box-shadow:0 calc(var(--u)*.5) 0 #0f0720}
.gm-fnf .por .fo-wk{width:auto;flex-direction:row;text-align:left;gap:calc(var(--u)*1.6)}
.gm-fnf .fo-wk.on{outline:calc(var(--u)*.35) solid var(--c);filter:brightness(1.18)}
.gm-fnf .fo-wk.lock{opacity:.45;filter:grayscale(.7);cursor:not-allowed}
.gm-fnf .fo-wk canvas{width:calc(var(--u)*11);height:calc(var(--u)*11);flex:none;display:block}
.gm-fnf .fo-wk h3{margin:0;font:900 calc(var(--u)*2.3)/1.05 "Trebuchet MS",system-ui,sans-serif;color:var(--c)}
.gm-fnf .fo-wk p{margin:0;font:600 calc(var(--u)*1.35)/1.3 system-ui,sans-serif;color:#d6cfee}
.gm-fnf .fo-wk ol{margin:0;padding:0 0 0 calc(var(--u)*2);font:700 calc(var(--u)*1.35)/1.5 system-ui,sans-serif;text-align:left}
.gm-fnf .fo-diffs{display:flex;gap:calc(var(--u)*.9);justify-content:center}
.gm-fnf .fo-diffs .fo-b{min-width:calc(var(--u)*9);padding:calc(var(--u)*.8) calc(var(--u)*1.4);font-size:calc(var(--u)*1.8)}
.gm-fnf .fo-diffs .fo-b.sel{background:linear-gradient(var(--c,#ff5fa8),color-mix(in srgb,var(--c,#ff5fa8) 50%,#000));color:#0f0720;text-shadow:none}
.gm-fnf .fo-free{display:flex;gap:calc(var(--u)*2);width:92%;height:68%;margin-top:calc(var(--u)*3.5);margin-bottom:calc(var(--u)*3)}
.gm-fnf .por .fo-free{flex-direction:column;gap:calc(var(--u)*1);height:78%}
.gm-fnf .fo-list{flex:1.1;display:flex;flex-direction:column;gap:calc(var(--u)*.7);overflow-y:auto;padding:calc(var(--u)*.6);scrollbar-width:thin}
.gm-fnf .fo-list .fo-b{display:flex;justify-content:space-between;align-items:center;text-align:left;padding:calc(var(--u)*.7) calc(var(--u)*1.6);font-size:calc(var(--u)*1.9)}
.gm-fnf .fo-list .fo-b small{font:700 calc(var(--u)*1.2)/1 system-ui,sans-serif;opacity:.8}
.gm-fnf .fo-list .sep{font:900 calc(var(--u)*1.3)/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--c);padding:calc(var(--u)*.5) calc(var(--u)*.4) 0}
.gm-fnf .fo-info{flex:.9;display:flex;flex-direction:column;gap:calc(var(--u)*1.1);align-items:center;justify-content:center;background:rgba(10,6,24,.6);border-radius:calc(var(--u)*1.6);padding:calc(var(--u)*1.6);border:calc(var(--u)*.25) solid #0f0720}
.gm-fnf .fo-info h3{margin:0;font:900 calc(var(--u)*3)/1 "Trebuchet MS",system-ui,sans-serif;text-align:center}
.gm-fnf .fo-info p{margin:0;font:700 calc(var(--u)*1.5)/1.4 system-ui,sans-serif;text-align:center;color:#d9d3f5}
.gm-fnf .fo-rows{display:flex;flex-direction:column;gap:calc(var(--u)*.8);width:min(calc(var(--u)*56),92%);max-height:78%;overflow-y:auto;margin-top:calc(var(--u)*3);padding:calc(var(--u)*.5);scrollbar-width:thin}
.gm-fnf .fo-b.row{display:flex;justify-content:space-between;align-items:center;gap:calc(var(--u)*1.4);padding:calc(var(--u)*.8) calc(var(--u)*1.6);font-size:calc(var(--u)*1.9);text-align:left}
.gm-fnf .fo-b.row .v{display:flex;align-items:center;gap:calc(var(--u)*1);min-width:calc(var(--u)*15);justify-content:flex-end}
.gm-fnf .fo-b.row .v i{font-style:normal;padding:0 calc(var(--u)*.7);opacity:.7;cursor:pointer}
.gm-fnf .fo-b.row .v i:hover{opacity:1}
.gm-fnf .fo-b.row .v b{min-width:calc(var(--u)*7);text-align:center;color:#ffd23f}
.gm-fnf .fo-res{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.9);background:rgba(12,6,28,.82);border:calc(var(--u)*.3) solid #0f0720;border-radius:calc(var(--u)*2);padding:calc(var(--u)*2.2) calc(var(--u)*3.4);box-shadow:0 calc(var(--u)*.8) 0 #0f0720;max-width:92%}
.gm-fnf .fo-res h2{margin:0;font:900 calc(var(--u)*3.4)/1 "Trebuchet MS",system-ui,sans-serif;text-align:center}
.gm-fnf .fo-rank{font:900 calc(var(--u)*13)/1 "Trebuchet MS",system-ui,sans-serif;text-shadow:0 calc(var(--u)*.7) 0 #1c1130,0 0 calc(var(--u)*3) currentColor}
.gm-fnf .fo-grid{display:grid;grid-template-columns:repeat(2,auto);gap:calc(var(--u)*.4) calc(var(--u)*3);font:800 calc(var(--u)*1.8)/1.3 "Trebuchet MS",system-ui,sans-serif}
.gm-fnf .fo-grid span{opacity:.8;text-align:left}
.gm-fnf .fo-grid b{text-align:right}
.gm-fnf .fo-btns{display:flex;gap:calc(var(--u)*1);flex-wrap:wrap;justify-content:center;margin-top:calc(var(--u)*.6)}
.gm-fnf .fo-pause{position:absolute;top:calc(var(--u)*1);right:calc(var(--u)*1);z-index:3;min-width:0!important;padding:calc(var(--u)*.6) calc(var(--u)*1.3)!important;font-size:calc(var(--u)*1.8)!important;opacity:.7}
.gm-fnf .fo-cnt{font:900 calc(var(--u)*14)/1 "Trebuchet MS",system-ui,sans-serif;text-shadow:0 calc(var(--u)*.7) 0 #1c1130}
.gm-fnf .fo-vs{display:flex;gap:calc(var(--u)*3);align-items:center;justify-content:center}
.gm-fnf .fo-vs>div{display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.4);min-width:calc(var(--u)*20)}
.gm-fnf .fo-vs .n{font:900 calc(var(--u)*2.2)/1 "Trebuchet MS",system-ui,sans-serif}
.gm-fnf .fo-vs .s{font:900 calc(var(--u)*4)/1 "Trebuchet MS",system-ui,sans-serif;color:#ffd23f}
.gm-fnf .fo-vs .w{color:#7dff9e!important}
.gm-fnf .fo-key{min-width:calc(var(--u)*9)!important}
.gm-fnf .fo-hint{font:600 calc(var(--u)*1.3)/1.3 system-ui,sans-serif;color:#b9b0dd;text-align:center}
` + SHARED_CSS('.gm-fnf', '#ff5fa8');


  function mountFnf(root, api) {
    const por = innerWidth < innerHeight * .9 && root.clientWidth < 760;
    const W = por ? 540 : 1280, H = por ? 960 : 720;
    const wrap = document.createElement('div');
    wrap.className = 'fo-wrap ' + (por ? 'por' : 'lan');
    wrap.style.width = `min(100%,${W}px,calc((100dvh - var(--goff,250px))*${(W / H).toFixed(4)}))`;
    wrap.style.aspectRatio = W + ' / ' + H;
    root.append(wrap);
    const { canvas, ctx: c, toLocal } = api.canvas(W, H, wrap);
    const ui = document.createElement('div');
    ui.className = 'fo-ui';
    wrap.append(ui);
    const audio = makeAudio(api);
    const sv = Object.assign({ wk: 0, best: {}, o: {} }, api.load() || {});
    const O = Object.assign({ scroll: 1, down: por, ghost: true, hs: false, keys: FNF_DEF_KEYS.map(a => a.slice()) }, sv.o);
    sv.o = O;
    if (!Array.isArray(O.keys) || O.keys.length !== 4) O.keys = FNF_DEF_KEYS.map(a => a.slice());
    const persist = () => api.save(sv);
    let keyLane = {};
    const buildKeys = () => { keyLane = {}; O.keys.forEach((ks, l) => ks.forEach(k => { if (k) keyLane[k] = l; })); };
    buildKeys();

    const LAY = por
      ? { lw: 100, pX: 70, oX: -999, recUp: 500, recDn: 880, chY: 372, chS: .5, stageH: 400, cX: [W * .27, W * .73], hbY: 424, nr: 40 }
      : { lw: 106, pX: W - 36 - 424, oX: 36, recUp: 118, recDn: 622, chY: 636, chS: .86, stageH: H, cX: [W * .37, W * .63], hbY: H - 56, nr: 44 };
    const SPD = (por ? .8 : 1) * 450;

    let S = { scr: 'title', d: {}, wsel: 0, diff: 1, fi: 0, fsel: 0, mode: 'story', gesture: false };
    let G = null, onl = null, calOff = null, calS = SHARED.cal / 1000, capture = null, wired = false;
    let stage = 0, oppId = 'bubba', pop = null;
    const sceneP = { o: { p: 0, t0: -9, until: 0 }, p: { p: 0, t0: -9, until: 0 } };

    function menuMusic() {
      if (!S.gesture) return;
      if (audio.playing && audio.S.song && audio.S.song.id === 'menu') return;
      audio.play(SONGS.menu, { loop: true, lead: .08, rate: 1 });
    }
    function previewSong(id) {
      if (!S.gesture) return;
      const s = SONGS[id], sec = s.sections.find(x => x.kiai) || s.sections[1];
      const from = sec.start, to = Math.min(s.steps, from + 64);
      const go = () => audio.play(s, { from, to, lead: .06, onEnd: () => { if (S.scr === 'free') go(); } });
      go();
    }

    function unlock() {
      if (S.gesture) return;
      S.gesture = true;
      audio.resume();
      if (['title', 'menu', 'story', 'free', 'opts'].includes(S.scr)) menuMusic();
    }

    const drawIcons = () => ui.querySelectorAll('canvas[data-ic]').forEach(cv => { const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); drawIcon(x, cv.dataset.ic, cv.width / 2, cv.height * .56, cv.width * .98, 0, false); });
    const diffChips = () => `<div class="fo-diffs">${DIFFS.map((n, i) => `<button class="fo-b ${S.diff === i ? 'sel' : ''}" data-a="d:${i}">${n}</button>`).join('')}</div>`;
    const bestOf = (id, d) => sv.best[id + ':' + d];
    const rowSt = (label, key, val) => `<div class="fo-b row" data-a="o:${key}:1" data-l="o:${key}:-1" data-r="o:${key}:1"><span>${label}</span><span class="v"><i data-a="o:${key}:-1">&#9664;</i><b>${val}</b><i data-a="o:${key}:1">&#9654;</i></span></div>`;
    const onoff = v => v ? 'On' : 'Off';

    const R = {
      title: () => `<h1 class="fo-logo">FRIDAY NIGHT<b>FUNKIN'</b></h1><div class="fo-press">${por ? 'TAP TO START' : 'PRESS ENTER OR CLICK'}</div><div class="fo-sub">Original songs, original characters. Hit the arrows in time.</div>`,
      menu: () => `<h1 class="fo-logo" style="font-size:calc(var(--u)*${por ? 4 : 4.4});margin-bottom:calc(var(--u)*1)">FRIDAY NIGHT<b>FUNKIN'</b></h1><div class="fo-col" style="min-width:calc(var(--u)*${por ? 28 : 24})"><button class="fo-b pri" data-a="story">Story Mode</button><button class="fo-b" data-a="free">Freeplay</button><button class="fo-b" data-a="online">Online Battle</button><button class="fo-b" data-a="opts">Options</button></div><div class="fo-hint">${por ? 'Tap the four lanes to hit notes' : 'Arrows or D F J K to play, Esc to pause'}</div>`,
      story: () => `<div class="fo-head">Story Mode</div><div class="fo-weeks">${WEEKS.map((w, i) => `<div class="fo-wk ${i > sv.wk ? 'lock' : ''} ${i === S.wsel ? 'on' : ''}" style="--c:${w.col}" data-a="wk:${i}" data-f="wk:${i}"><canvas data-ic="${w.opp}" width="160" height="160"></canvas><div><h3>Week ${i + 1}: ${esc(w.name)}</h3><p>${i > sv.wk ? 'Locked. Clear the previous week.' : esc(w.tag)}</p><ol>${w.songs.map(s => `<li>${esc(SONGS[s].name)}</li>`).join('')}</ol></div></div>`).join('')}</div>${diffChips()}<div class="fo-foot"><button class="fo-b ghost" data-a="back">Back</button><button class="fo-b pri" data-a="storygo">Start week</button></div>`,
      free: () => {
        let h = '<div class="fo-head">Freeplay</div><div class="fo-free"><div class="fo-list">';
        WEEKS.forEach((w, wi) => {
          h += `<div class="sep" style="--c:${w.col}">${esc(w.name)}${wi > sv.wk ? ' (locked)' : ''}</div>`;
          w.songs.forEach(id => { const b = bestOf(id, S.diff); h += `<button class="fo-b ${wi > sv.wk ? 'lock' : ''}" data-a="fp:${id}" data-f="fs:${id}" data-l="dd:-1" data-r="dd:1"><span>${esc(SONGS[id].name)}</span><small>${b ? fmtNum(b.score) : ''}</small></button>`; });
        });
        return h + `</div><div class="fo-info" id="fi"></div></div><div class="fo-foot"><button class="fo-b ghost" data-a="back">Back</button></div>`;
      },
      opts: () => `<div class="fo-head">Options</div><div class="fo-rows">${rowSt('Scroll speed', 'scroll', O.scroll.toFixed(1) + 'x')}${rowSt('Downscroll', 'down', onoff(O.down))}${rowSt('Ghost tapping', 'ghost', onoff(O.ghost))}${rowSt('Hit sound', 'hs', onoff(O.hs))}${rowSt('Volume', 'vol', Math.round(SHARED.vol * 100) + '%')}${rowSt('Audio offset', 'cal', (SHARED.cal > 0 ? '+' : '') + SHARED.cal + ' ms')}<div class="fo-b row" data-a="cal"><span>Calibrate offset</span><span class="v"><b>Tap to the beat</b></span></div><div class="fo-b row" data-a="keys"><span>Key bindings</span><span class="v"><b>${O.keys.map(k => keyName(k[0])).join(' ')}</b></span></div><div class="fo-b row" data-a="reset"><span>Reset progress</span><span class="v"><b>${S.d.rs ? 'Press again' : ''}</b></span></div></div><div class="fo-foot"><button class="fo-b ghost" data-a="back">Back</button></div>`,
      keys: () => `<div class="fo-head">Key bindings</div><div class="fo-rows">${[0, 1, 2, 3].map(l => `<div class="fo-b row"><span>${LANE_ARROW[l]} Lane ${l + 1}</span><span class="v"><button class="fo-b sm fo-key ${capture && capture[0] === l && capture[1] === 0 ? 'on' : ''}" data-a="kb:${l}:0">${capture && capture[0] === l && capture[1] === 0 ? '...' : keyName(O.keys[l][0])}</button><button class="fo-b sm fo-key ${capture && capture[0] === l && capture[1] === 1 ? 'on' : ''}" data-a="kb:${l}:1">${capture && capture[0] === l && capture[1] === 1 ? '...' : keyName(O.keys[l][1])}</button></span></div>`).join('')}</div><div class="fo-hint">Click a key box, then press the new key. Esc cancels.</div><div class="fo-foot"><button class="fo-b ghost" data-a="kdef">Defaults</button><button class="fo-b" data-a="opts">Done</button></div>`,
      cal: () => '<div id="calhost"></div>',
      play: () => (onl ? '' : '<button class="fo-b ghost fo-pause" data-a="pause">II</button>'),
      pause: () => `<div class="fo-res"><h2>Paused</h2><div class="fo-col"><button class="fo-b pri" data-a="resume">Resume</button><button class="fo-b" data-a="restart">Restart song</button><button class="fo-b ghost" data-a="quit">Quit to menu</button></div><div class="fo-hint">Offset ${SHARED.cal > 0 ? '+' : ''}${SHARED.cal} ms (change it in Options)</div></div>`,
      resume: d => `<div class="fo-cnt">${d.n}</div>`,
      res: d => {
        const g = d.g, acc = accOf(g), rk = rankOf(acc), b = bestOf(g.id, g.diff);
        return `<div class="fo-res"><h2>${esc(g.song.name)} <small style="opacity:.6;font-size:.55em">${DIFFS[g.diff]}</small></h2><div class="fo-rank" style="color:${rankCol(rk)}">${rk}</div><div class="fo-grid"><span>Score</span><b>${fmtNum(g.score)}</b><span>Accuracy</span><b>${acc.toFixed(2)}%</b><span>Sick / Good</span><b>${g.cnt[0]} / ${g.cnt[1]}</b><span>Bad / Shit</span><b>${g.cnt[2]} / ${g.cnt[3]}</b><span>Misses</span><b>${g.miss}</b><span>Max combo</span><b>${g.maxCombo}</b>${d.rec ? '<span>Record</span><b style="color:#ffd23f">NEW BEST</b>' : b ? `<span>Best</span><b>${fmtNum(b.score)}</b>` : ''}</div>${d.story ? `<div class="fo-hint">Week total ${fmtNum(d.story.score)}</div>` : ''}<div class="fo-btns">${d.next ? `<button class="fo-b pri" data-a="next">${d.last ? 'Finish week' : 'Next song'}</button>` : '<button class="fo-b pri" data-a="again">Play again</button>'}<button class="fo-b ghost" data-a="quit">${d.next ? 'Quit week' : 'Menu'}</button></div></div>`;
      },
      wkend: d => `<div class="fo-res"><h2>Week ${d.wk + 1} cleared</h2><div class="fo-rank" style="color:${WEEKS[d.wk].col};font-size:calc(var(--u)*6)">${esc(WEEKS[d.wk].name)}</div><div class="fo-grid"><span>Total score</span><b>${fmtNum(d.score)}</b><span>Misses</span><b>${d.miss}</b><span>Difficulty</span><b>${DIFFS[d.diff]}</b></div>${d.wk < 2 && sv.wk > d.wk ? `<div class="fo-hint">Week ${d.wk + 2} unlocked</div>` : ''}<div class="fo-btns"><button class="fo-b pri" data-a="story">Weeks</button><button class="fo-b ghost" data-a="menu">Menu</button></div></div>`,
      over: d => `<div class="fo-res"><h2>You fainted</h2><div class="fo-sub">${esc(d.g.song.name)} on ${DIFFS[d.g.diff]}. The crowd wants an encore.</div><div class="fo-btns"><button class="fo-b pri" data-a="retry">Retry</button><button class="fo-b ghost" data-a="quit">Quit</button></div></div>`,
      oBusy: d => `<div class="fo-res"><h2>${esc(d.t || 'Online Battle')}</h2><div class="fo-sub">${esc(d.s || '')}</div><div class="fo-btns"><button class="fo-b ghost" data-a="oleave">Leave</button></div></div>`,
      oPick: () => {
        const sel = S.osel || 0;
        let h = '<div class="fo-head">Pick the battle song</div><div class="fo-free"><div class="fo-list">';
        WEEKS.forEach(w => { h += `<div class="sep" style="--c:${w.col}">${esc(w.name)}</div>`; w.songs.forEach(id => { h += `<button class="fo-b ${S.osong === id ? 'on' : ''}" data-a="osong:${id}" data-f="fs:${id}" data-l="dd:-1" data-r="dd:1"><span>${esc(SONGS[id].name)}</span><small>${SONGS[id].bpm} BPM</small></button>`; }); });
        void sel;
        return h + `</div><div class="fo-info" id="fi"></div></div><div class="fo-foot"><button class="fo-b ghost" data-a="oleave">Leave</button><button class="fo-b" data-a="olobby">Party lobby</button><button class="fo-b pri" data-a="ogo">Start battle</button></div>`;
      },
      oRes: d => {
        const g = d.g, me = d.me, rv = d.rv, name = d.rvName;
        const win = d.win;
        return `<div class="fo-res"><h2 style="color:${win === 1 ? '#7dff9e' : win === 0 ? '#ffd23f' : '#ff6a5c'}">${win === 1 ? 'You win!' : win === 0 ? 'Draw' : 'You lose'}</h2><div class="fo-vs"><div><span class="n">You</span><span class="s ${win === 1 ? 'w' : ''}">${fmtNum(me.s)}</span><span class="fo-hint">${me.a.toFixed(1)}% - ${me.m} misses${me.d ? ' - fainted' : ''}</span></div><div><span class="n">${esc(name)}</span><span class="s ${win === 2 ? 'w' : ''}">${rv ? fmtNum(rv.s) : '-'}</span><span class="fo-hint">${rv ? rv.a.toFixed(1) + '% - ' + rv.m + ' misses' + (rv.d ? ' - fainted' : '') : esc(d.note || '')}</span></div></div><div class="fo-sub">${esc(g.song.name)} (${DIFFS[g.diff]})${d.note && rv ? ' - ' + esc(d.note) : ''}</div><div class="fo-btns">${onl && onl.role === 'host' ? '<button class="fo-b pri" data-a="orematch">Rematch</button><button class="fo-b" data-a="olobby">Party lobby</button>' : '<button class="fo-b pri" data-a="oback" ' + (d.gone ? '' : 'disabled') + '>' + (d.gone ? 'Party lobby' : 'Waiting for the host') + '</button>'}<button class="fo-b ghost" data-a="oleave">Leave</button></div></div>`;
      }
    };

    function show(name, d) {
      if (calOff) { calOff(); calOff = null; }
      S.scr = name; S.d = d || {}; S.fi = 0;
      ui.className = 'fo-ui' + (name === 'play' ? ' off' : name === 'pause' || name === 'res' || name === 'over' || name === 'resume' || name === 'wkend' || name === 'oRes' || name === 'oBusy' ? ' dim' : '');
      ui.innerHTML = R[name] ? R[name](S.d) : '';
      drawIcons();
      if (name === 'cal') calOff = calibrator(ui.querySelector('#calhost'), audio, api, { help: 'Press Space, Enter or tap the circle on every tick. The median error of your last taps is your offset. Positive means you hit late.', onDone: () => show('opts') });
      if (name === 'free' || name === 'oPick') { const id = name === 'free' ? (S.fsong || WEEKS[0].songs[0]) : (S.osong || WEEKS[0].songs[0]); if (name === 'free') S.fsong = id; else S.osong = id; focusFirst(`[data-f="fs:${id}"]`); infoFor(id); }
      else focusFirst();
    }
    const focusables = () => [...ui.querySelectorAll('.fo-b:not(.lock):not([disabled]):not(.fo-pause), .fo-wk:not(.lock)')].filter(e => !e.closest('.cal'));
    function focusFirst(sel) {
      const list = focusables();
      let i = 0;
      if (sel) { const e = ui.querySelector(sel); if (e) i = Math.max(0, list.indexOf(e)); }
      else { const pri = list.findIndex(e => e.classList.contains('pri')); i = pri > 0 && S.scr !== 'story' ? 0 : 0; }
      setFocus(i, true);
    }
    function setFocus(i, silent) {
      const list = focusables();
      if (!list.length) return;
      S.fi = (i + list.length) % list.length;
      list.forEach((e, k) => e.classList.toggle('on', k === S.fi));
      const el = list[S.fi];
      el.scrollIntoView && el.scrollIntoView({ block: 'nearest' });
      if (!silent && el.dataset.f) act(el.dataset.f, el);
    }

    function infoFor(id) {
      const s = SONGS[id], w = WEEKS[SONG_WEEK[id]], el = ui.querySelector('#fi');
      if (!el) return;
      const b = bestOf(id, S.diff), ch = fnfChart(s, S.diff);
      el.style.setProperty('--c', w.col);
      el.innerHTML = `<canvas data-ic="${w.opp}" width="160" height="160" style="width:calc(var(--u)*10);height:calc(var(--u)*10)"></canvas><h3 style="color:${w.col}">${esc(s.name)}</h3><p>${esc(w.oppName)} - ${s.bpm} BPM - ${fmtTime(s.dur)}<br>${ch.ply.length} notes${b ? ` - best ${fmtNum(b.score)} (${b.rank})` : ''}</p>${diffChips()}${S.scr === 'free' ? '<button class="fo-b pri" data-a="fp:' + id + '">Play</button>' : ''}`;
      el.querySelectorAll('.fo-diffs .fo-b').forEach(e => e.style.setProperty('--c', w.col));
      drawIcons();
      stage = w.stage; oppId = w.opp;
    }

    function act(a, el) {
      const p = a.split(':');
      const k = p[0];
      unlock();
      if (k === 'story') { S.mode = 'story'; show('story'); menuMusic(); }
      else if (k === 'free') { S.mode = 'free'; show('free'); }
      else if (k === 'online') goOnline();
      else if (k === 'opts') { S.d = {}; show('opts'); }
      else if (k === 'back' || k === 'menu') { audio.sfx('back'); show('menu'); menuMusic(); }
      else if (k === 'wk') { const i = +p[1]; if (i > sv.wk) { audio.sfx('miss'); return; } S.wsel = i; stage = WEEKS[i].stage; oppId = WEEKS[i].opp; ui.querySelectorAll('.fo-wk').forEach((e, j) => e.classList.toggle('on', j === i)); if (el && el.dataset.a === a && !el.dataset.f) return; if (el && el === document.activeElement) return; }
      else if (k === 'd') { S.diff = +p[1]; ui.querySelectorAll('.fo-diffs .fo-b').forEach((e, j) => e.classList.toggle('sel', j === S.diff)); audio.sfx('tick'); if (S.scr === 'free' || S.scr === 'oPick') infoFor(S.scr === 'free' ? S.fsong : S.osong); else refreshFreeBest(); }
      else if (k === 'dd') { S.diff = clamp(S.diff + (+p[1]), 0, 2); audio.sfx('tick'); ui.querySelectorAll('.fo-diffs .fo-b').forEach((e, j) => e.classList.toggle('sel', j === S.diff)); if (S.scr === 'free') { infoFor(S.fsong); refreshFreeBest(); } else if (S.scr === 'oPick') infoFor(S.osong); }
      else if (k === 'fs') { const id = p[1]; if (SONG_WEEK[id] > sv.wk && S.scr === 'free') { infoFor(id); S.fsong = id; return; } if (S.scr === 'free') { S.fsong = id; previewSong(id); } else S.osong = id; infoFor(id); }
      else if (k === 'osong') { S.osong = p[1]; infoFor(p[1]); ui.querySelectorAll('.fo-list .fo-b').forEach(e => e.classList.toggle('on', e.dataset.a === a)); }
      else if (k === 'fp') { const id = p[1]; if (S.scr === 'free' && S.fsong !== id) { act('fs:' + id); return; } if (SONG_WEEK[id] > sv.wk) { audio.sfx('miss'); return; } audio.sfx('ok'); S.mode = 'free'; S.fsong = id; beginSong(id, S.diff, { free: true }); }
      else if (k === 'storygo') { if (S.wsel > sv.wk) { audio.sfx('miss'); return; } audio.sfx('ok'); const w = WEEKS[S.wsel]; S.story = { wk: S.wsel, diff: S.diff, i: 0, score: 0, miss: 0 }; beginSong(w.songs[0], S.diff, { story: true }); }
      else if (k === 'o') optStep(p[1], +p[2]);
      else if (k === 'cal') { audio.sfx('ok'); audio.stop(.1); show('cal'); }
      else if (k === 'keys') { capture = null; show('keys'); }
      else if (k === 'kb') { capture = [+p[1], +p[2]]; show('keys'); }
      else if (k === 'kdef') { O.keys = FNF_DEF_KEYS.map(a2 => a2.slice()); buildKeys(); persist(); show('keys'); }
      else if (k === 'reset') { if (S.d.rs) { sv.wk = 0; sv.best = {}; persist(); S.d = {}; audio.sfx('ok'); show('opts'); } else { S.d.rs = 1; show('opts'); } }
      else if (k === 'pause') pauseGame();
      else if (k === 'resume') resumeGame();
      else if (k === 'restart') { audio.sfx('ok'); beginSong(G.id, G.diff, G.opt); }
      else if (k === 'retry') { beginSong(G.id, G.diff, G.opt); }
      else if (k === 'again') beginSong(G.id, G.diff, G.opt);
      else if (k === 'next') nextStorySong();
      else if (k === 'quit') quitGame();
      else if (k === 'ogo') hostGo();
      else if (k === 'orematch') { show('oPick'); }
      else if (k === 'olobby' || k === 'oback') goOnline(true);
      else if (k === 'oleave') leaveOnline();
    }
    const refreshFreeBest = () => { if (S.scr !== 'free') return; ui.querySelectorAll('.fo-list .fo-b').forEach(e => { const id = e.dataset.a.split(':')[1], b = bestOf(id, S.diff), sm = e.querySelector('small'); if (sm) sm.textContent = b ? fmtNum(b.score) : ''; }); };
    function optStep(key, d) {
      if (key === 'scroll') O.scroll = clamp(Math.round((O.scroll + d * .1) * 10) / 10, .5, 1.8);
      else if (key === 'down') O.down = !O.down;
      else if (key === 'ghost') O.ghost = !O.ghost;
      else if (key === 'hs') O.hs = !O.hs;
      else if (key === 'vol') SHARED.vol = clamp(Math.round((SHARED.vol + d * .1) * 10) / 10, 0, 1);
      else if (key === 'cal') SHARED.cal = SHARED.cal + d * 5;
      calS = SHARED.cal / 1000;
      persist(); audio.sfx('tick');
      const i = S.fi; show('opts'); setFocus(i, true);
    }

    const songT = () => (audio.now() - audio.t0) * audio.rate - calS;
    const accOf = g => { const n = g.cnt[0] + g.cnt[1] + g.cnt[2] + g.cnt[3] + g.miss; return n ? 100 * g.wsum / n : 100; };
    const LANE_POSE = [1, 2, 3, 4];

    function beginSong(id, diff, opt) {
      opt = opt || {};
      const song = SONGS[id], ch = fnfChart(song, diff), bs = 60 / song.bpm;
      const w = WEEKS[SONG_WEEK[id]];
      calS = SHARED.cal / 1000;
      stage = w.stage; oppId = w.opp;
      G = {
        id, diff, song, opt, wk: SONG_WEEK[id], opp: ch.opp.map(n => Object.assign({ hit: 0 }, n)), ply: ch.ply.map(n => Object.assign({ st: 0, held: 0, drop: 0 }, n)), oi: 0, pn: 0,
        hp: 50, score: 0, combo: 0, maxCombo: 0, cnt: [0, 0, 0, 0], miss: 0, wsum: 0, state: 'count', paused: false, pops: [], down: [0, 0, 0, 0], conf: [0, 0, 0, 0], oconf: [0, 0, 0, 0], rconf: [0, 0, 0, 0], bs,
        lastT: Math.max(ch.ply.length ? ch.ply[ch.ply.length - 1].t + ch.ply[ch.ply.length - 1].len : 0, song.dur - 1), bump: 0, cdLast: -9, muted: 0, tickAt: 0, flash: 0, online: !!opt.online, rv: { s: 0, h: 50, c: 0, a: 100, m: 0, end: null, pose: 0, t0: -9 }, sentAt: 0, deadAt: 0, t: 0, hint: 0, pids: {}
      };
      sceneP.o.p = 0; sceneP.p.p = 0;
      show('play');
      const t0 = audio.play(song, { lead: 4 * bs + .08, rate: 1 });
      [4, 3, 2, 1].forEach((k, i) => audio.tone(t0 - k * bs, i === 3 ? 1175 : 660, .09, .26, 'square'));
      api.score(0);
    }

    function pauseGame() {
      if (!G || G.paused || (S.scr !== 'play' && S.scr !== 'resume') || G.state === 'dead' || G.state === 'end' || onl) return;
      G.paused = true;
      G.pt = G.t + calS;
      audio.stop(.05);
      show('pause');
    }
    function resumeGame() {
      if (!G || !G.paused) return;
      let n = 3;
      show('resume', { n });
      const tick = () => {
        if (S.scr !== 'resume' || !G || !G.paused) return;
        if (--n <= 0) { G.paused = false; audio.restartAt(G.song, G.pt, 1); if (G.muted) audio.voiceMute('p', true); show('play'); return; }
        const e = ui.querySelector('.fo-cnt'); if (e) e.textContent = n;
        audio.sfx('beep'); api.timeout(tick, 650);
      };
      audio.sfx('beep'); api.timeout(tick, 650);
    }
    function quitGame() {
      audio.stop(.1);
      if (audio.ctx.state !== 'running') audio.resume();
      G = null; S.story = null;
      show('menu'); menuMusic();
    }
    function nextStorySong() {
      const st = S.story, w = WEEKS[st.wk];
      st.i++;
      if (st.i >= w.songs.length) { audio.stop(.1); G = null; S.story = null; show('wkend', { wk: st.wk, score: st.score, miss: st.miss, diff: st.diff }); menuMusic(); return; }
      beginSong(w.songs[st.i], st.diff, { story: true });
    }

    function judgeHit(g, n, diffMs, lane) {
      const ad = Math.abs(diffMs);
      const j = ad <= JUDGE[0].ms ? 0 : ad <= JUDGE[1].ms ? 1 : ad <= JUDGE[2].ms ? 2 : 3;
      n.st = 1; n.j = j;
      g.cnt[j]++; g.wsum += JUDGE[j].w; g.score += JUDGE[j].sc;
      g.hp = clamp(g.hp + JUDGE[j].hp, 0, 100);
      if (j === 3) g.combo = 0; else g.combo++;
      if (g.combo > g.maxCombo) g.maxCombo = g.combo;
      g.pops.push({ t: performance.now(), j, c: g.combo });
      g.conf[lane] = .16;
      if (g.muted) { audio.voiceMute('p', false); g.muted = 0; }
      if (O.hs) audio.sfx('tickS');
      const T = g.t;
      sceneP.p = { p: LANE_POSE[lane], t0: T, until: T + (n.len ? n.len : 0) + .3 };
      if (n.len) { n.held = 1; n.tk = T + .1; }
      if (onl) sendN(lane, j);
    }
    function missNote(g, n, lane) {
      n.st = 2;
      g.miss++; g.combo = 0; g.score -= 10; g.hp = clamp(g.hp - 5, 0, 100);
      g.pops.push({ t: performance.now(), j: 4, c: 0 });
      audio.sfx('miss');
      audio.voiceMute('p', true); g.muted = 1;
      sceneP.p = { p: 5, t0: g.t, until: g.t + .55 };
      if (onl) sendN(lane, 4);
    }
    function press(lane, ts) {
      const g = G;
      if (!g || g.paused || g.state !== 'play' || g.down[lane]) return;
      g.down[lane] = 1;
      const h = (audio.at(ts == null ? performance.now() : ts) - audio.t0) * audio.rate - calS;
      let hit = null;
      for (let i = g.pn; i < g.ply.length; i++) {
        const n = g.ply[i];
        if (n.t > h + .16) break;
        if (n.lane === lane && !n.st && Math.abs(n.t - h) <= .16) { hit = n; break; }
      }
      if (hit) judgeHit(g, hit, (h - hit.t) * 1000, lane);
      else {
        g.conf[lane] = Math.max(g.conf[lane], 0);
        if (!O.ghost) { g.miss++; g.combo = 0; g.score -= 10; g.hp = clamp(g.hp - 2.5, 0, 100); audio.sfx('miss'); audio.voiceMute('p', true); g.muted = 1; g.pops.push({ t: performance.now(), j: 4, c: 0 }); sceneP.p = { p: 5, t0: g.t, until: g.t + .4 }; if (onl) sendN(lane, 4); }
      }
    }
    function release(lane) { if (G) G.down[lane] = 0; }

    function sendN(l, j) { try { api.net.send({ t: 'n', l, j }, true); } catch (e) {} }

    function update(dt) {
      const g = G;
      if (!g || S.scr !== 'play') return;
      if (g.paused) return;
      const T = songT();
      g.t = T;
      for (let l = 0; l < 4; l++) { g.conf[l] = Math.max(0, g.conf[l] - dt); g.oconf[l] = Math.max(0, g.oconf[l] - dt); g.rconf[l] = Math.max(0, g.rconf[l] - dt); }
      g.bump = Math.max(0, g.bump - dt * 2.4);
      g.flash = Math.max(0, g.flash - dt * 2);
      if (g.state === 'count') {
        const k = Math.floor(-T / g.bs);
        if (T >= 0) g.state = 'play';
        g.cd = k;
      }
      if (g.state === 'play' || g.state === 'count') {
        while (g.oi < g.opp.length && g.opp[g.oi].t <= T) {
          const n = g.opp[g.oi++];
          if (!onl) { sceneP.o = { p: LANE_POSE[n.lane], t0: T, until: T + Math.max(.32, n.len) }; g.oconf[n.lane] = Math.max(.12, n.len); }
        }
      }
      if (g.state !== 'play') { drawLatch(T); return; }
      for (let i = g.pn; i < g.ply.length; i++) {
        const n = g.ply[i];
        if (n.t > T) break;
        if (!n.st && T - n.t > .16) missNote(g, n, n.lane);
      }
      while (g.pn < g.ply.length && (g.ply[g.pn].st === 2 || (g.ply[g.pn].st === 1 && !g.ply[g.pn].held))) g.pn++;
      for (let i = g.pn; i < g.ply.length; i++) {
        const n = g.ply[i];
        if (n.t > T) break;
        if (n.st === 1 && n.held) {
          const end = n.t + n.len;
          if (g.down[n.lane]) {
            while (n.tk <= T && n.tk < end) { g.score += 10; g.hp = clamp(g.hp + .5, 0, 100); n.tk += .1; }
            sceneP.p.until = Math.max(sceneP.p.until, T + .18); sceneP.p.p = LANE_POSE[n.lane];
            g.conf[n.lane] = .08;
            if (T >= end - .02) { n.held = 0; g.score += 50; }
          } else if (T < end - .15) {
            n.held = 0; n.drop = 1; g.hp = clamp(g.hp - 2, 0, 100); audio.voiceMute('p', true); g.muted = 1;
          } else n.held = 0;
        }
      }
      while (g.pn < g.ply.length && (g.ply[g.pn].st === 2 || (g.ply[g.pn].st === 1 && !g.ply[g.pn].held))) g.pn++;
      if (g.hp <= 0 && !g.dead) die(g);
      if (g.pn >= g.ply.length && T > g.lastT + .6) finish(g);
      drawLatch(T);
      if (onl && performance.now() - g.sentAt > 250) { g.sentAt = performance.now(); try { api.net.send({ t: 'sc', s: g.score, h: g.hp, c: g.combo, a: accOf(g), m: g.miss }, true); } catch (e) {} }
      if (Math.floor(T) !== g.lastSc) { g.lastSc = Math.floor(T); api.score(g.score); }
    }
    function drawLatch(T) {
      const g = G, b = T / g.bs, f = b - Math.floor(b);
      if (Math.floor(b) !== g.lastBeat) { g.lastBeat = Math.floor(b); if (g.lastBeat % 4 === 0 && g.state === 'play' && g.lastBeat >= 0) g.bump = 1; }
      void f;
    }

    function die(g) {
      g.dead = true;
      if (onl) {
        g.state = 'dead';
        audio.voiceMute('p', true); audio.sfx('fail');
        sceneP.p = { p: 5, t0: g.t, until: 1e9 };
        sendEnd(g, true);
        checkOnlineDone();
        return;
      }
      g.state = 'dead'; g.deadAt = performance.now();
      audio.stop(.35); audio.sfx('fail');
      sceneP.p = { p: 5, t0: g.t, until: 1e9 };
      api.timeout(() => { if (G === g && g.state === 'dead') show('over', { g }); }, 1500);
    }

    function finish(g) {
      if (g.state === 'end') return;
      g.state = 'end';
      const acc = accOf(g), rk = rankOf(acc);
      if (onl) { sendEnd(g, false); audio.stop(.3); checkOnlineDone(); return; }
      audio.stop(.5); audio.sfx('win');
      const key = g.id + ':' + g.diff, b = sv.best[key];
      const rec = !b || g.score > b.score;
      if (rec) sv.best[key] = { score: Math.max(0, g.score), acc: +acc.toFixed(2), rank: rk };
      let d = { g, rec };
      const st = S.story;
      if (st && g.opt.story) {
        st.score += g.score; st.miss += g.miss;
        const last = st.i >= WEEKS[st.wk].songs.length - 1;
        d.story = st; d.next = true; d.last = last;
        if (last) {
          if (st.wk >= sv.wk && st.wk < 2) sv.wk = st.wk + 1;
          api.submit(Math.max(1, st.score));
        }
        persist();
        api.timeout(() => { if (G === g) show('res', d); }, 900);
        return;
      }
      persist();
      api.submit(Math.max(1, g.score));
      api.timeout(() => { if (G === g) show('res', d); }, 900);
    }

    function sendEnd(g, dead) { try { api.net.send({ t: 'end', s: g.score, a: accOf(g), m: g.miss, c: g.maxCombo, d: dead ? 1 : 0 }); } catch (e) {} g.myEnd = { s: g.score, a: accOf(g), m: g.miss, c: g.maxCombo, d: dead ? 1 : 0 }; }
    function checkOnlineDone() {
      const g = G;
      if (!g || !g.online || g.showed) return;
      if (!g.myEnd || (!g.rv.end && !g.gone)) return;
      g.showed = 1;
      const me = g.myEnd, rv = g.rv.end;
      let win = 0;
      if (g.gone || (rv && rv.f)) win = 1;
      else if (me.d && !rv.d) win = 2;
      else if (!me.d && rv.d) win = 1;
      else win = me.s > rv.s ? 1 : me.s < rv.s ? 2 : 0;
      audio.sfx(win === 1 ? 'win' : 'back');
      api.timeout(() => { if (G === g) show('oRes', { g, me, rv: g.gone ? null : rv, win, rvName: onl ? onl.rvName : 'Rival', gone: !!g.gone, note: g.gone ? 'Your rival left the battle.' : rv && rv.f ? 'Your rival reconnected and forfeited.' : '' }); }, 700);
    }

    function hostGo() {
      if (!onl || onl.role !== 'host') return;
      if (!api.net.players || api.net.players.length < 2) { audio.sfx('miss'); return; }
      const id = S.osong || WEEKS[0].songs[0];
      audio.sfx('ok');
      api.net.send({ t: 'go', id, diff: S.diff });
      beginSong(id, S.diff, { online: true });
    }
    async function goOnline(again) {
      unlock();
      audio.stop(.1);
      show('oBusy', { t: 'Online Battle', s: 'Opening party...' });
      onl = onl || {};
      const wasG = G; G = null; void wasG;
      let r;
      try { r = await api.net.room({ title: "Friday Night Funkin'", sizes: [2], defaultSize: 2, min: 2, max: 2 }); } catch (e) { r = null; }
      if (!r) { onl = null; show('menu'); menuMusic(); return; }
      onl = { role: r.role, me: r.id, rvName: 'Rival', phase: 'pick' };
      wireNet();
      const other = r.players.find(p => p.id !== r.id);
      if (other) onl.rvName = other.name;
      if (r.role === 'host') { S.osong = S.osong || WEEKS[0].songs[0]; show('oPick'); } else show('oBusy', { t: 'Online Battle', s: 'Waiting for the host to pick a song...' });
    }
    function wireNet() {
      if (wired) return;
      wired = true;
      const n = api.net;
      n.on('data', (m, from) => {
        if (!m) return;
        const g = G;
        if (m.t === 'go') { if (onl && onl.role === 'guest') beginSong(m.id, m.diff, { online: true }); }
        else if (m.t === 'sc' && g && g.online) { g.rv.s = m.s; g.rv.h = m.h; g.rv.c = m.c; g.rv.a = m.a; g.rv.m = m.m; }
        else if (m.t === 'n' && g && g.online) { g.rconf[m.l] = .16; g.rv.pose = m.j === 4 ? 5 : LANE_POSE[m.l]; g.rv.t0 = g.t; g.rv.j = m.j; g.rv.pt = performance.now(); }
        else if (m.t === 'end' && g && g.online) { g.rv.end = m; g.rv.s = m.s; checkOnlineDone(); }
        else if (m.t === 'forfeit') { show('oBusy', { t: 'Round forfeited', s: 'You reconnected during a round. Waiting for the next one...' }); }
      });
      n.on('leave', () => { if (G && G.online) { G.gone = 1; audio.stop(.2); G.state = 'end'; G.myEnd = G.myEnd || { s: G.score, a: accOf(G), m: G.miss, c: G.maxCombo, d: 0 }; checkOnlineDone(); } else if (onl && onl.role === 'host' && ['oPick', 'oRes'].includes(S.scr)) { if (S.scr === 'oPick') show('oBusy', { t: 'Online Battle', s: 'Your rival left. Waiting in the party lobby...' }); } });
      n.on('rejoin', p => { if (G && G.online && onl && onl.role === 'host') { if (G.rv && !G.rv.end) { G.rv.end = { s: G.rv.s, a: G.rv.a, m: G.rv.m, c: 0, d: 0, f: 1 }; } try { n.sendTo(p.id, { t: 'forfeit' }); } catch (e) {} checkOnlineDone(); } });
      n.on('lobby', () => { if (onl && onl.role === 'guest') goOnline(true); });
      n.on('close', why => {
        if (!onl) return;
        const g = G;
        if (g && g.online) { audio.stop(.1); }
        G = null; onl = null; wired = false;
        show('oBusy', { t: why === 'host-left' ? 'The host left' : why === 'kicked' ? 'Removed from the party' : 'Connection lost', s: 'The party has ended.' });
      });
    }
    function leaveOnline() {
      audio.stop(.1);
      try { api.net.close(); } catch (e) {}
      G = null; onl = null; wired = false;
      show('menu'); menuMusic();
    }

    function drawPlay() {
      const g = G, T = g.t, bs = g.bs, bf = T / bs, beat = bf - Math.floor(bf), bar = bf / 4;
      const st = WEEKS[g.wk].stage, zoom = 1 + g.bump * .025;
      c.save();
      c.translate(W / 2, H * .62); c.scale(zoom, zoom); c.translate(-W / 2, -H * .62);
      scene(st, T, beat, bar, g.state === 'dead' || g.dead);
      c.restore();
      strips();
      hud();
    }
    function charPose(P, T) { return T > P.until ? 0 : P.p; }
    function scene(st, T, beat, bar, dead) {
      const t = performance.now() / 1000;
      c.save();
      if (por) { c.beginPath(); c.rect(0, 0, W, LAY.stageH); c.clip(); }
      drawStage(c, st, W, LAY.stageH, t, beat, bar, G ? G.flash : 0);
      const o = oppId, ps = G ? G : null;
      const w = WEEKS[st];
      if (st === 0) drawMochi(c, W * .5, LAY.chY + (por ? 0 : 0), por ? .42 : .62, t, beat);
      const oP = sceneP.o, pP = sceneP.p;
      const op = charPose(oP, T), pp = charPose(pP, T);
      const mouth = p => p > 0 && p < 5 ? .4 + .45 * Math.abs(Math.sin(t * 16)) : 0;
      if (ps && ps.online) {
        const rv = ps.rv, rp = rv.pose && T - rv.t0 < .35 ? rv.pose : 0;
        drawChar(c, o, { x: LAY.cX[0], y: LAY.chY, s: LAY.chS, pose: rp, ph: T - rv.t0, t, beat, look: 1, open: mouth(rp), seed: 3 });
      } else drawChar(c, o, { x: LAY.cX[0], y: LAY.chY, s: LAY.chS, pose: op, ph: T - oP.t0, t, beat, look: 1, open: mouth(op), seed: 3 });
      drawChar(c, 'zig', { x: LAY.cX[1], y: LAY.chY, s: LAY.chS, pose: dead ? 5 : pp, ph: T - pP.t0, t, beat, look: -1, open: mouth(pp), seed: 7 });
      void w;
      c.restore();
    }
    function strips() {
      const g = G, T = g.t, R0 = LAY.nr, sgn = O.down ? -1 : 1, recY = O.down ? LAY.recDn : LAY.recUp;
      const spd = SPD * O.scroll * (1 + (g.diff - 1) * .22);
      const strip = (x0, notes, down, conf, isOpp, label, from) => {
        const lw = LAY.lw;
        c.save();
        c.fillStyle = 'rgba(8,4,20,.42)'; c.beginPath(); c.roundRect(x0 - 8, por ? LAY.stageH + 52 : 8, lw * 4 + 16, H - (por ? LAY.stageH + 60 : 16), 18); c.fill();
        c.restore();
        for (let l = 0; l < 4; l++) {
          const cx = x0 + lw * l + lw / 2;
          const kind = conf[l] > 0 ? 3 : (!isOpp && g.down[l]) ? 2 : 1;
          const sp = arrowSpr(l, kind, R0);
          c.drawImage(sp, cx - sp.width / 2, recY - sp.height / 2);
        }
        const noteSpr = [0, 1, 2, 3].map(l => arrowSpr(l, 0, R0));
        for (let i = from; i < notes.length; i++) {
          const n = notes[i];
          const y = recY + sgn * (n.t - T) * spd;
          if (sgn > 0 ? y > H + 120 : y < -120) break;
          if (n.st === 1 && !n.held) continue;
          if (isOpp && n.t < T && n.len < .01) continue;
          if (isOpp && n.t + n.len < T) continue;
          const cx = x0 + lw * n.lane + lw / 2;
          const hold = n.len > .01 && (n.st !== 2 || true);
          if (hold) {
            const yh = (n.held || (isOpp && n.t < T)) ? recY : y;
            const ye = recY + sgn * (n.t + n.len - T) * spd;
            const y0 = Math.min(yh, ye), y1 = Math.max(yh, ye), bw = R0 * .5;
            const dead2 = n.st === 2 || n.drop;
            c.save();
            c.globalAlpha = dead2 ? .35 : isOpp ? .75 : 1;
            const gr = c.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
            gr.addColorStop(0, dead2 ? '#555' : LCOL2[n.lane]); gr.addColorStop(.5, dead2 ? '#888' : LCOL[n.lane]); gr.addColorStop(1, dead2 ? '#555' : LCOL2[n.lane]);
            c.fillStyle = gr; c.fillRect(cx - bw / 2, y0, bw, y1 - y0);
            c.lineWidth = 4; c.strokeStyle = OUT; c.strokeRect(cx - bw / 2, y0, bw, y1 - y0);
            if (n.held) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(cx - bw / 2, y0, bw, y1 - y0); }
            c.restore();
          }
          if (!(n.held || (isOpp && n.t < T))) {
            c.save();
            c.globalAlpha = n.st === 2 ? .3 : isOpp ? .85 : 1;
            const sp = noteSpr[n.lane];
            c.drawImage(sp, cx - sp.width / 2, y - sp.height / 2);
            c.restore();
          }
        }
        if (label) txt(c, label, x0 + lw * 2, por ? LAY.stageH + 36 : recY + (O.down ? -70 : 78) - (O.down ? 0 : 0) + (O.down ? 0 : 0), 22, '#e7e0ff');
      };
      if (!por) {
        if (g.online) strip(LAY.oX, [], 0, g.rconf, true, '', 0);
        else strip(LAY.oX, g.opp, 0, g.oconf, true, '', g.oi > 4 ? g.oi - 4 : 0);
      }
      strip(LAY.pX, g.ply, 1, g.conf, false, '', Math.max(0, g.pn - 2));
    }
    function hud() {
      const g = G, T = g.t, w = WEEKS[g.wk];
      const bw = por ? 400 : 460, bx = W / 2 - bw / 2, bh = 22;
      const hbY = por ? LAY.hbY : (O.down ? 36 : LAY.hbY);
      c.save();
      c.fillStyle = OUT; c.beginPath(); c.roundRect(bx - 6, hbY - bh / 2 - 6, bw + 12, bh + 12, 14); c.fill();
      c.fillStyle = w.col; c.beginPath(); c.roundRect(bx, hbY - bh / 2, bw, bh, 9); c.fill();
      const hp = clamp(g.hp, 0, 100) / 100, px = bx + bw * (1 - hp);
      c.fillStyle = '#2fd6c0'; c.beginPath(); c.roundRect(px, hbY - bh / 2, bx + bw - px, bh, 9); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(bx, hbY - bh / 2 + 3, bw, 5);
      c.restore();
      const sz = por ? 70 : 84, ib = Math.pow(1 - ((T / g.bs) % 1 + 1) % 1, 3) * .14;
      drawIcon(c, oppId, px - sz * .38, hbY - 8, sz * (1 + ib), hp > .78 ? 1 : 0, false);
      drawIcon(c, 'zig', px + sz * .38, hbY - 8, sz * (1 + ib), hp < .22 ? 1 : hp > .78 ? 2 : 0, true);
      const acc = accOf(g);
      txt(c, `Score ${fmtNum(g.score)}   Misses ${g.miss}   Accuracy ${acc.toFixed(1)}% (${rankOf(acc)})`, W / 2, hbY + (por ? 38 : 36), por ? 17 : 20, '#fff', 'center', 5);
      if (g.online) {
        const rv = g.rv;
        c.fillStyle = 'rgba(8,4,20,.62)'; c.beginPath(); c.roundRect(por ? 10 : W / 2 - 150, por ? 8 : (O.down ? H - 150 : 76), por ? 190 : 300, por ? 66 : 74, 12); c.fill();
        const rx = por ? 20 : W / 2 - 138, ry = por ? 22 : (O.down ? H - 136 : 90);
        txt(c, onl ? onl.rvName : 'Rival', rx, ry, 17, '#ffb347', 'left', 4);
        txt(c, fmtNum(rv.s), rx + (por ? 168 : 276), ry, 22, '#fff', 'right', 5);
        c.fillStyle = OUT; c.fillRect(rx, ry + 14, por ? 168 : 276, 11); c.fillStyle = '#ffb347'; c.fillRect(rx + 2, ry + 16, (por ? 164 : 272) * clamp(rv.h, 0, 100) / 100, 7);
        txt(c, 'You ' + fmtNum(g.score) + ' ' + (g.score >= rv.s ? '▲' : '▼'), rx, ry + 40, 16, g.score >= rv.s ? '#7dff9e' : '#ff8a8a', 'left', 4);
      }
      const prog = clamp(T / (g.lastT || 1), 0, 1);
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(W * .3, por ? LAY.stageH - 12 : H - 8, W * .4, 5);
      c.fillStyle = w.col; c.fillRect(W * .3, por ? LAY.stageH - 12 : H - 8, W * .4 * prog, 5);
      const nowp = performance.now();
      g.pops = g.pops.filter(p => nowp - p.t < 900);
      const last = g.pops[g.pops.length - 1];
      if (last) {
        const age = (nowp - last.t) / 1000, pj = last.j === 4 ? { n: 'MISS', col: '#ff4d5e' } : JUDGE[last.j];
        const sc = 1 + Math.max(0, .3 - age * 3), al = clamp(1.6 - age * 1.8, 0, 1);
        c.save(); c.globalAlpha = al;
        const cx = por ? W / 2 : LAY.pX + LAY.lw * 2, cy = por ? LAY.stageH + 100 : H * .4 - age * 22;
        c.translate(cx, cy); c.scale(sc, sc);
        txt(c, pj.n + (last.j === 0 ? '!' : ''), 0, 0, por ? 40 : 52, pj.col, 'center', 12);
        if (last.c >= 5) txt(c, last.c + ' combo', 0, por ? 40 : 52, por ? 26 : 32, '#fff', 'center', 8);
        c.restore();
      }
      if (g.state === 'count') {
        const k = Math.floor(-T / g.bs), labels = ['GO!', '1', '2', '3'], ph = ((-T / g.bs) % 1 + 1) % 1, num = k >= 0 && k < 4 ? labels[Math.min(3, k)] : '';
        if (num) { c.save(); c.globalAlpha = clamp(1 - ph * .6, 0, 1); c.translate(W / 2, H * .38); const s2 = 1 + (1 - ph) * .25; c.scale(s2, s2); txt(c, num, 0, 0, por ? 120 : 150, num === 'GO!' ? '#7dff9e' : '#ffd23f', 'center', 20); c.restore(); }
      }
    }
    function drawMenuBG(T) {
      const t = performance.now() / 1000;
      const playing = audio.playing && audio.S.song;
      const sg = playing ? audio.song() : t * 2;
      const bpm = playing ? audio.S.song.bpm : 120, bs = 60 / bpm;
      const sT = playing ? sg * audio.S.song.step : t;
      const bf = sT / bs, beat = bf - Math.floor(bf), bar = bf / 4;
      const st = S.scr === 'story' ? WEEKS[S.wsel].stage : (S.scr === 'free' || S.scr === 'oPick') && (S.fsong || S.osong) ? WEEKS[SONG_WEEK[S.scr === 'free' ? S.fsong : S.osong]].stage : stage;
      const oid = S.scr === 'story' ? WEEKS[S.wsel].opp : oppId;
      c.save();
      c.translate(W / 2, H * .62); const z = 1 + Math.pow(1 - beat, 3) * .01; c.scale(z, z); c.translate(-W / 2, -H * .62);
      drawStage(c, st, W, H, t, beat, bar, 0);
      if (st === 0) drawMochi(c, W * .5, LAY.chY, por ? .5 : .7, t, beat);
      const sing = (Math.floor(bf * 2) % 8);
      const op = sing === 1 ? 1 : sing === 3 ? 3 : sing === 5 ? 2 : 0, pp = sing === 2 ? 2 : sing === 6 ? 4 : 0;
      const ph = (bf * 2) % 1 / 2;
      const cy = por ? H * .62 : LAY.chY + 22;
      drawChar(c, oid, { x: por ? W * .27 : W * .3, y: cy, s: por ? .6 : 1.02, pose: op, ph, t, beat, look: 1, open: op ? .6 : 0, seed: 3 });
      drawChar(c, 'zig', { x: por ? W * .73 : W * .7, y: cy, s: por ? .6 : 1.02, pose: pp, ph, t, beat, look: -1, open: pp ? .6 : 0, seed: 7 });
      c.restore();
      c.fillStyle = 'rgba(6,3,16,' + (S.scr === 'title' ? .12 : .35) + ')'; c.fillRect(0, 0, W, H);
    }

    function render() {
      if (G && S.scr === 'play' || (G && (S.scr === 'pause' || S.scr === 'resume' || S.scr === 'over' || S.scr === 'res' || S.scr === 'oRes' || S.scr === 'wkend'))) { drawPlay(); return; }
      if (S.scr === 'cal') { c.fillStyle = '#120a26'; c.fillRect(0, 0, W, H); return; }
      drawMenuBG();
    }

    api.loop(dt => {
      audio.tick();
      update(dt);
      render();
    });

    const kd = e => {
      if (e.gpSyn && false) return;
      unlock();
      if (capture) {
        e.preventDefault(); e.stopPropagation();
        if (e.code === 'Escape') { capture = null; show('keys'); return; }
        O.keys[capture[0]][capture[1]] = e.code; buildKeys(); persist(); capture = null; show('keys'); return;
      }
      if (S.scr === 'cal') return;
      if (S.scr === 'play') {
        if (e.code === 'Escape') { e.preventDefault(); pauseGame(); return; }
        const l = keyLane[e.code];
        if (l != null) { e.preventDefault(); if (!e.repeat) press(l, e.timeStamp); }
        return;
      }
      if (S.scr === 'pause') { if (e.code === 'Escape') { e.preventDefault(); resumeGame(); return; } }
      if (S.scr === 'title') { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); audio.sfx('ok'); show('menu'); menuMusic(); } return; }
      if (S.scr === 'resume') { e.preventDefault(); return; }
      if (e.code === 'Escape') { e.preventDefault(); if (S.scr === 'menu') return; if (S.scr === 'opts' || S.scr === 'keys') { show(S.scr === 'keys' ? 'opts' : 'menu'); menuMusic(); return; } if (['story', 'free'].includes(S.scr)) { act('back'); return; } if (S.scr === 'oPick') { act('oleave'); return; } return; }
      const list = focusables();
      if (!list.length) return;
      const el = list[S.fi] || list[0];
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); audio.sfx('tick'); setFocus(S.fi + 1); }
      else if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); audio.sfx('tick'); setFocus(S.fi - 1); }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); if (el.dataset.l) act(el.dataset.l, el); else { audio.sfx('tick'); setFocus(S.fi - 1); } }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); if (el.dataset.r) act(el.dataset.r, el); else { audio.sfx('tick'); setFocus(S.fi + 1); } }
      else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) { const a = el.dataset.a; if (a) act(a, el); } }
    };
    const ku = e => { if (S.scr !== 'play') return; const l = keyLane[e.code]; if (l != null) { e.preventDefault(); release(l); } };
    api.on(window, 'keydown', kd, true);
    api.on(window, 'keyup', ku, true);
    api.on(ui, 'click', e => {
      unlock();
      if (S.scr === 'title') { audio.sfx('ok'); show('menu'); menuMusic(); return; }
      const t = e.target.closest('[data-a]');
      if (!t || !ui.contains(t)) return;
      const list = focusables(), i = list.indexOf(t.closest('.fo-b, .fo-wk'));
      if (i >= 0 && t.dataset.a.indexOf('o:') !== 0) { S.fi = i; list.forEach((x, k) => x.classList.toggle('on', k === i)); }
      act(t.dataset.a, t);
    });
    const laneAt = e => { const p = toLocal(e); if (por) return clamp(Math.floor((p.x - LAY.pX) / LAY.lw), 0, 3); const l = Math.floor((p.x - LAY.pX) / LAY.lw); return p.x < LAY.pX - 90 ? -1 : clamp(l, 0, 3); };
    api.on(canvas, 'pointerdown', e => {
      unlock();
      if (S.scr !== 'play' || !G) return;
      e.preventDefault();
      const l = laneAt(e);
      if (l < 0) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      G.pids[e.pointerId] = l;
      press(l, e.timeStamp);
    });
    const up = e => { if (!G) return; const l = G.pids[e.pointerId]; if (l != null) { delete G.pids[e.pointerId]; if (!Object.values(G.pids).includes(l)) release(l); } };
    api.on(canvas, 'pointerup', up);
    api.on(canvas, 'pointercancel', up);
    const autoPause = () => { if (S.scr === 'play' && G && !onl && G.state !== 'dead' && G.state !== 'end') pauseGame(); };
    api.on(window, 'blur', autoPause);
    api.on(document, 'visibilitychange', () => { if (document.hidden) autoPause(); });

    (window.__gpdbg = window.__gpdbg || {}).fnf = { S: () => S, G: () => G, audio, sv, O, act, press, release, show };
    if (api.net.invite) goOnline(); else show('title');
    return {
      destroy() {
        if (calOff) calOff();
        if (onl) { try { api.net.close(); } catch (e) {} }
        audio.close();
      }
    };
  }


  Ameplay.covers.fnf = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fo-sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2368"/><stop offset=".55" stop-color="#c2477a"/><stop offset="1" stop-color="#ffae5c"/></linearGradient><radialGradient id="fo-sn" cx=".5" cy=".62" r=".5"><stop offset="0" stop-color="#ffe6a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffaa5a" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#fo-sk)"/><rect width="400" height="300" fill="url(#fo-sn)"/><g fill="#3a2360"><rect x="10" y="150" width="46" height="100"/><rect x="62" y="124" width="38" height="126"/><rect x="304" y="140" width="44" height="110"/><rect x="354" y="116" width="40" height="134"/></g><g fill="#ffd27a"><rect x="18" y="164" width="7" height="9"/><rect x="34" y="188" width="7" height="9"/><rect x="70" y="140" width="7" height="9"/><rect x="82" y="170" width="7" height="9"/><rect x="314" y="156" width="7" height="9"/><rect x="330" y="186" width="7" height="9"/><rect x="364" y="134" width="7" height="9"/><rect x="376" y="170" width="7" height="9"/></g><rect y="236" width="400" height="64" fill="#2a1a4a"/><rect y="236" width="400" height="5" fill="#8156c4"/><g stroke="#1c1130" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><g transform="translate(112 236)"><ellipse cx="0" cy="2" rx="36" ry="7" fill="rgba(0,0,0,.3)" stroke="none"/><rect x="-24" y="-90" width="48" height="52" rx="10" fill="#2dc7b8"/><rect x="-26" y="-98" width="52" height="12" fill="#ff5fa8" stroke="none"/><path d="M-14 -38V-12M14 -38V-12" stroke="#ffd23f" stroke-width="12"/><ellipse cx="-14" cy="-8" rx="15" ry="8" fill="#2b2b4a"/><ellipse cx="14" cy="-8" rx="15" ry="8" fill="#2b2b4a"/><rect x="-44" y="-160" width="88" height="68" rx="16" fill="#ff5fa8"/><circle cx="-24" cy="-122" r="17" fill="#2b2140"/><circle cx="-24" cy="-122" r="10" fill="#ffd23f"/><circle cx="24" cy="-122" r="17" fill="#2b2140"/><circle cx="24" cy="-122" r="10" fill="#ffd23f"/><rect x="-18" y="-152" width="36" height="20" rx="5" fill="#2b2140"/><rect x="-12" y="-104" width="24" height="12" rx="5" fill="#14091f"/><path d="M-24 -70L-58 -112" stroke="#2dc7b8" stroke-width="12"/></g><g transform="translate(290 236)"><ellipse cx="0" cy="2" rx="34" ry="7" fill="rgba(0,0,0,.3)" stroke="none"/><rect x="-22" y="-96" width="44" height="58" rx="8" fill="#ff7b3a"/><path d="M-12 -38V-16M12 -38V-16" stroke="#3f4fae" stroke-width="12"/><ellipse cx="-12" cy="-10" rx="16" ry="8" fill="#f6f6fb"/><ellipse cx="12" cy="-10" rx="16" ry="8" fill="#f6f6fb"/><circle cx="0" cy="-130" r="38" fill="#f6caa4"/><path d="M-39 -134Q-34 -176 0 -174Q34 -176 39 -134Q0 -150 -39 -134Z" fill="#1fb6d4"/><circle cx="0" cy="-176" r="9" fill="#ff7b3a"/><ellipse cx="-14" cy="-124" rx="9" ry="12" fill="#fff"/><ellipse cx="14" cy="-124" rx="9" ry="12" fill="#fff"/><circle cx="-12" cy="-122" r="4.5" fill="#1c1130" stroke="none"/><circle cx="16" cy="-122" r="4.5" fill="#1c1130" stroke="none"/><ellipse cx="0" cy="-104" rx="12" ry="9" fill="#4d0f2c"/><path d="M22 -78L52 -138" stroke="#ff7b3a" stroke-width="12"/><circle cx="53" cy="-146" r="11" fill="#c9cfdd"/></g></g><g transform="translate(200 40)" stroke="#1c1130" stroke-width="4" stroke-linejoin="round"><g transform="translate(-72 0) rotate(-90)"><path d="M0 -22L22 2L9 2L9 22L-9 22L-9 2L-22 2Z" fill="#c64cf2"/></g><g transform="translate(-24 0) rotate(180)"><path d="M0 -22L22 2L9 2L9 22L-9 22L-9 2L-22 2Z" fill="#27c4ff"/></g><g transform="translate(24 0)"><path d="M0 -22L22 2L9 2L9 22L-9 22L-9 2L-22 2Z" fill="#3ee64f"/></g><g transform="translate(72 0) rotate(90)"><path d="M0 -22L22 2L9 2L9 22L-9 22L-9 2L-22 2Z" fill="#ff4d5e"/></g></g></svg>`;

  (window.__gpdbg = window.__gpdbg || {}).lib = { makeAudio, SONGS, fnfChart };

  Ameplay.register({
    id: 'fnf',
    title: "Friday Night Funkin'",
    category: 'Skill',
    tint: '#ff5fa8',
    blurb: 'Hit the arrows in time to win the rap battle: three weeks of original songs, hold notes, a story mode, freeplay and an online 1v1 battle.',
    help: '<kbd>D</kbd> <kbd>F</kbd> <kbd>J</kbd> <kbd>K</kbd> or <kbd>&larr;</kbd> <kbd>&darr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> hit the arrows (hold for sustain notes) · tap the four lanes on a phone · <kbd>Esc</kbd> pause · calibrate the audio offset in Options',
    better: 'high',
    width: 1040,
    ownPause: true,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 26l8-9 8 9h-5v10h-6V26zM38 38l8 9 8-9h-5V28h-6v10z"/><circle cx="32" cy="12" r="3"/><path d="M26 54h12M10 44h14M40 20h14" opacity=".6"/></svg>',
    css: FNF_CSS,
    mount: mountFnf
  });


  const OSU_SONGS = ['paper-planes', 'cherry-soda', 'pixel-pursuit', 'midnight-metro', 'glass-garden', 'turbo-tangerine', 'lanterns-lake', 'zero-gravity'];
  const OSU_DIFFS = [
    { n: 'Easy', cs: 3.6, ar: 3.5, od: 2, sk: 4, sl: 8, hp: 3, sm: 1.1, grid: 4, gap: 4, fill: 14, fgap: 8, slMin: 6, spMin: 18, ds: 62, mg: .5, dm: 2.3, col: '#8be34f' },
    { n: 'Normal', cs: 4, ar: 5, od: 4, sk: 4, sl: 6, hp: 4, sm: 1.3, grid: 2, gap: 2, fill: 9, fgap: 4, slMin: 6, spMin: 16, ds: 84, mg: .3, dm: 2, col: '#4fc3f7' },
    { n: 'Hard', cs: 4, ar: 7.5, od: 6.5, sk: 5, sl: 5, hp: 5, sm: 1.5, grid: 1, gap: 2, fill: 6, fgap: 3, slMin: 5, spMin: 14, ds: 108, mg: .19, dm: 1.7, col: '#ffb340' },
    { n: 'Insane', cs: 4.2, ar: 9, od: 8, sk: 7, sl: 4, hp: 6, sm: 1.7, grid: 1, gap: 1, fill: 4, fgap: 2, slMin: 4, spMin: 14, ds: 128, mg: .11, dm: 1.3, col: '#ff5f8f' }
  ];
  const OSU_PAL = {
    'paper-planes': 190, 'cherry-soda': 345, 'pixel-pursuit': 130, 'midnight-metro': 250, 'glass-garden': 165, 'turbo-tangerine': 25, 'lanterns-lake': 45, 'zero-gravity': 285
  };
  const hsl = (h, s, l) => `hsl(${((h % 360) + 360) % 360},${s}%,${l}%)`;
  const osuPal = id => { const h = OSU_PAL[id] || 200; return [hsl(h, 85, 62), hsl(h + 75, 85, 62), hsl(h + 150, 80, 64), hsl(h + 215, 85, 66)]; };
  const osuRadius = cs => 54.4 - 4.48 * cs;
  const osuPreempt = ar => ar < 5 ? 1.8 - .12 * ar : ar === 5 ? 1.2 : 1.2 - .15 * (ar - 5);

  function buildPath(p0, ang, L, kind, R) {
    const raw = [];
    if (kind === 0) { raw.push([0, 0], [L, 0]); }
    else if (kind === 1) {
      const phi = .9 + R() * 1.3, rad = L / phi, sg = R() < .5 ? 1 : -1;
      for (let i = 0; i <= 20; i++) { const a = phi * i / 20; raw.push([Math.sin(a) * rad, sg * (1 - Math.cos(a)) * rad]); }
    } else {
      const off = L * (.25 + R() * .2) * (R() < .5 ? 1 : -1);
      for (let i = 0; i <= 24; i++) { const u = i / 24, b0 = (1 - u) ** 3, b1 = 3 * u * (1 - u) ** 2, b2 = 3 * u * u * (1 - u), b3 = u ** 3; raw.push([b1 * L / 3 + b2 * 2 * L / 3 + b3 * L, b1 * off - b2 * off]); }
    }
    let len = 0;
    for (let i = 1; i < raw.length; i++) len += Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]);
    const k = L / len, ca = Math.cos(ang), sa = Math.sin(ang);
    const pts = raw.map(p => [p0[0] + (p[0] * ca - p[1] * sa) * k, p0[1] + (p[0] * sa + p[1] * ca) * k]);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, L: cum[cum.length - 1] };
  }
  const inField = (pts, m) => pts.every(p => p[0] >= m && p[0] <= 512 - m && p[1] >= m && p[1] <= 384 - m);
  function pathAt(path, d) {
    const { pts, cum } = path;
    d = clamp(d, 0, path.L);
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
    const seg = cum[hi] - cum[lo] || 1, f = (d - cum[lo]) / seg;
    return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f];
  }
  const sliderPos = (o, u) => {
    const d = clamp(u, 0, 1) * o.rep, i = Math.min(o.rep - 1, Math.floor(d));
    let f = d - i;
    if (i % 2) f = 1 - f;
    return pathAt(o.path, f * o.path.L);
  };

  const MAPS = {};
  function osuMap(id, di) {
    const key = id + ':' + di;
    if (MAPS[key]) return MAPS[key];
    const song = SONGS[id], D = OSU_DIFFS[di], st = song.step, bs = 60 / song.bpm, R = mkRng(hashStr(id) * 31 + di * 977 + 7);
    const rad = osuRadius(D.cs), pal = osuPal(id);
    const spins = [];
    song.sections.forEach(sc => { if (sc.n === 'k' && sc.end - sc.start >= 32) { const s0 = sc.start + 8, s1 = Math.min(sc.end - 8, s0 + Math.floor(5 / st)); spins.push([s0, s1]); } });
    const inSpin = s => spins.some(p => s >= p[0] - 3 && s <= p[1] + 3);
    const cand = [];
    let lastS = -99;
    song.lead.forEach(n => {
      if (n.s % D.grid !== 0 && !(n.d >= D.slMin && n.s % 2 === 0 && D.grid <= 2)) return;
      if (n.s - lastS < D.gap || (n.s - lastS) * st < D.mg || inSpin(n.s)) return;
      cand.push({ s: n.s, d: n.d, lead: 1 }); lastS = n.s;
    });
    cand.sort((a, b) => a.s - b.s);
    const end = song.steps - 8;
    let lastD = -99;
    song.drums.forEach(h => {
      if (di > 1 || h.n === 'h') return;
      if (h.s < 16 || h.s > end || h.s - lastD < D.fgap || inSpin(h.s)) return;
      let near = 99;
      for (const n of cand) { if (n.s <= h.s && h.s < n.s + n.d) { near = 0; break; } const dd = Math.min(Math.abs(n.s - h.s), Math.abs(n.s + n.d - h.s)); if (dd < near) near = dd; }
      if (near >= D.fill && near * st >= D.mg) { cand.push({ s: h.s, d: 2, lead: 0 }); lastD = h.s; }
    });
    if (di > 1) {
      const ex = new Set();
      song.ev.forEach(e => { if (e.k === 'b' && e.s % 2 === 0) ex.add(e.s); if (di === 3 && e.k === 'c' && e.n.length === 1) ex.add(e.s); });
      song.drums.forEach(h => { if (h.n !== 'h' || di === 3) ex.add(h.s); });
      const xg = di === 2 ? 3 : 2;
      [...ex].sort((a, b) => a - b).forEach(s => {
        if (s < 16 || s > end || inSpin(s)) return;
        for (const n of cand) { if (Math.abs(n.s - s) < xg || Math.abs(n.s - s) * st < D.mg) return; if (n.lead && n.d >= D.slMin && s > n.s && s < n.s + n.d) return; }
        cand.push({ s, d: 2, lead: 0 });
      });
    }
    spins.forEach(p => cand.push({ s: p[0], d: p[1] - p[0], lead: 1, spin: 1 }));
    cand.sort((a, b) => a.s - b.s);
    const cd = [];
    let ek = 0;
    for (let i = 0; i < cand.length; i++) {
      const n = cand[i];
      cd.push(n);
      if (n.spin || n.d >= D.slMin || n.s < 16 || ++ek % D.sk !== 0 || inSpin(n.s + D.sl + 2)) continue;
      n.d = D.sl; n.lead = 1;
      while (i + 1 < cand.length && cand[i + 1].s < n.s + D.sl + 1 && !cand[i + 1].spin) i++;
    }
    cand.length = 0; cd.forEach(n => cand.push(n));
    const objs = [];
    let opp = 0, px = 256, py = 192, ang = R() * 6.283, cnt = 0, combo = 0, ci2 = 0, lastEnd = 0;
    cand.forEach((n, i) => {
      const nx = cand[i + 1], avail = nx ? nx.s - n.s : 16;
      const t = n.s * st;
      let dur = Math.min(n.d, avail - 1);
      const gapB = Math.max(.25, (n.s - (objs.length ? objs[objs.length - 1].es : n.s - 4)) * st / bs);
      const prev = objs[objs.length - 1];
      const isSp = !!n.spin;
      let sl = !isSp && n.lead && dur >= D.slMin;
      if (!sl && !isSp && avail - 1 >= D.slMin && ++opp % 6 === 0) { sl = true; dur = Math.min(avail - 1, Math.max(D.slMin, n.d)); }
      let newC = (n.s % 16 === 0 && (!prev || prev.s !== n.s)) || !prev || (prev.type === 'p') || cnt >= 10;
      if (newC) { cnt = 0; combo = combo + 1; ci2 = (ci2 + 1) % pal.length; }
      cnt++;
      const o = { t, s: n.s, newC, n: cnt, ci: ci2, type: 'c', x: 0, y: 0, ex: 0, ey: 0, et: t, es: n.s };
      if (isSp) {
        o.type = 'p'; o.x = o.ex = 256; o.y = o.ey = 192; o.et = (n.s + n.d) * st; o.es = n.s + n.d; o.cnt = cnt = 0;
        objs.push(o); px = 256; py = 192; return;
      }
      const dist = clamp(gapB * D.ds, rad * D.dm, 260) * (prev && prev.type === 'p' ? 0 : 1);
      let turn = (R() - .5) * 1.5 + (R() < .12 ? (R() < .5 ? 1 : -1) * 1.6 : 0);
      if (gapB <= .5) turn *= .35;
      let a = ang + turn, x = px + Math.cos(a) * dist, y = py + Math.sin(a) * dist;
      const m = rad + 6;
      for (let k = 0; k < 8 && (x < m || x > 512 - m || y < m || y > 384 - m); k++) {
        const toC = Math.atan2(192 - y + (R() - .5) * 120, 256 - x + (R() - .5) * 160);
        a = k < 4 ? toC : a + 1.3; x = px + Math.cos(a) * dist; y = py + Math.sin(a) * dist;
      }
      x = clamp(x, m, 512 - m); y = clamp(y, m, 384 - m);
      for (let k = 0; k < 8; k++) {
        let bad = false;
        for (let q = objs.length - 1; q >= Math.max(0, objs.length - 3); q--) { const pq = objs[q]; if (t - pq.et < 1.4 && Math.hypot(pq.x - x, pq.y - y) < rad * D.dm * .8 && !(pq.type === 'p')) bad = true; }
        if (!bad) break;
        a += 1.1; x = clamp(px + Math.cos(a) * dist, m, 512 - m); y = clamp(py + Math.sin(a) * dist, m, 384 - m);
      }
      ang = a; o.x = x; o.y = y;
      if (sl) {
        const beats = dur * st / bs;
        let L = beats * 100 * D.sm, rep = 1;
        if (L > 230 + D.sm * 40) rep = Math.min(4, Math.ceil(L / (200 + D.sm * 30)));
        const L1 = L / rep;
        let path = null;
        for (let k = 0; k < 10 && !path; k++) {
          const aa = k === 0 ? a + (R() - .5) * 1.2 : R() * 6.283, kind = R() < .35 ? 0 : R() < .6 ? 1 : 2;
          const pth = buildPath([x, y], aa, L1, kind, R);
          if (inField(pth.pts, rad * .6)) { path = pth; ang = aa; }
        }
        if (!path) { const aa = Math.atan2(192 - y, 256 - x); path = buildPath([x, y], aa, Math.min(L1, 150), 0, R); ang = aa; }
        o.type = 's'; o.path = path; o.rep = rep; o.slide = dur * st / rep; o.et = t + dur * st; o.es = n.s + dur;
        o.ticks = [];
        const td = 100 * D.sm;
        for (let i = 0; i < rep; i++) for (let d = td; d < path.L - 12; d += td) o.ticks.push({ t: t + (i + (i % 2 ? 1 - d / path.L : d / path.L)) * o.slide, ix: i, d });
        o.ticks.sort((p, q) => p.t - q.t);
        const e = pathAt(path, rep % 2 ? path.L : 0);
        o.ex = e[0]; o.ey = e[1]; px = e[0]; py = e[1];
        const tail = pathAt(path, path.L);
        if (rep % 2 === 0) { px = x; py = y; } else { px = tail[0]; py = tail[1]; }
      } else { o.ex = x; o.ey = y; px = x; py = y; o.es = n.s; }
      objs.push(o);
    });
    const breaks = [];
    for (let i = 1; i < objs.length; i++) { const g0 = objs[i - 1].et, g1 = objs[i].t; if (g1 - g0 >= 4.2) breaks.push([g0 + .8, g1 - 1.6]); }
    const dens = objs.length / Math.max(30, song.dur), stars = [1.1, 2, 3, 4.2][di] * (.75 + .5 * clamp(dens / [1.4, 2.2, 2.8, 3.6][di], .5, 1.8));
    const first = objs[0].t, last = objs[objs.length - 1].et;
    let play = last - first;
    breaks.forEach(b => { play -= b[1] - b[0]; });
    const map = { id, di, D, song, objs, breaks, stars, first, last, rad, ar: D.ar, od: D.od, cs: D.cs, hp: D.hp, pal, play, nObj: objs.length, bpm: song.bpm, sm: D.sm };
    return MAPS[key] = map;
  }


  const OSU_MODS = [
    { k: 'EZ', n: 'Easy', m: .5, d: 'Bigger circles, slower approach, gentler timing and health.' },
    { k: 'HR', n: 'Hard Rock', m: 1.06, d: 'Flipped map, smaller circles, faster approach, strict timing.' },
    { k: 'DT', n: 'Double Time', m: 1.12, d: 'Song and notes play at 1.5x speed.' },
    { k: 'HD', n: 'Hidden', m: 1.06, d: 'Circles fade out before you hit them.' },
    { k: 'NF', n: 'No Fail', m: .5, d: 'Health cannot run out.' },
    { k: 'AT', n: 'Auto', m: 0, d: 'The computer plays. Scores are not saved.' }
  ];
  const osuGradeCol = g => ({ SS: '#ffd23f', S: '#ffe58a', A: '#7dff9e', B: '#47c8ff', C: '#c58bff', D: '#ff6a5c' }[g] || '#fff');
  const osuAccOf = n => { const t = n[0] + n[1] + n[2] + n[3]; return t ? 100 * (n[0] * 300 + n[1] * 100 + n[2] * 50) / (t * 300) : 100; };
  function osuGrade(n) {
    const t = n[0] + n[1] + n[2] + n[3];
    if (!t) return 'D';
    const p3 = n[0] / t, p5 = n[2] / t, nm = n[3];
    if (n[1] + n[2] + nm === 0) return 'SS';
    if (p3 > .9 && p5 <= .01 && !nm) return 'S';
    if ((p3 > .8 && !nm) || p3 > .9) return 'A';
    if ((p3 > .7 && !nm) || p3 > .8) return 'B';
    return p3 > .6 ? 'C' : 'D';
  }
  const osuModMult = m => OSU_MODS.reduce((a, o) => m[o.k] ? a * o.m : a, 1) || 1;
  const osuModStr = m => OSU_MODS.filter(o => m[o.k]).map(o => o.k).join('') || 'None';
  const osuStarsAdj = (s, m) => s * (m.DT ? 1.4 : 1) * (m.HR ? 1.12 : 1) * (m.EZ ? .85 : 1) * (m.HD ? 1.05 : 1);

  function osuEff(map, mods) {
    const ez = !!mods.EZ, hr = !!mods.HR;
    const f = (v, a, b) => ez ? v * a : hr ? Math.min(10, v * b) : v;
    const cs = f(map.cs, .5, 1.3), ar = f(map.ar, .5, 1.4), od = f(map.od, .5, 1.4), hp = f(map.hp, .5, 1.4);
    return { cs, ar, od, hp, rad: osuRadius(cs), pre: osuPreempt(ar), w3: (80 - 6 * od) / 1000, w1: (140 - 8 * od) / 1000, w5: (200 - 10 * od) / 1000, rate: mods.DT ? 1.5 : 1, flip: hr, drain: .008 + .004 * hp };
  }

  function osuPrep(map, E) {
    const fy = y => E.flip ? 384 - y : y;
    const objs = map.objs.map((o, i) => {
      const q = Object.assign({}, o, { y: fy(o.y), ey: fy(o.ey), hd: 0, done: 0, i });
      if (o.type === 's') {
        q.path = { pts: o.path.pts.map(p => [p[0], fy(p[1])]), cum: o.path.cum, L: o.path.L };
        q.ev = o.ticks.map(k => { const p = pathAt(q.path, k.d); return { t: k.t, k: 't', h: 0, x: p[0], y: p[1] }; });
        for (let r = 1; r < o.rep; r++) { const p = pathAt(q.path, r % 2 ? q.path.L : 0); q.ev.push({ t: o.t + r * o.slide, k: 'r', h: 0, r, x: p[0], y: p[1] }); }
        q.ev.push({ t: Math.max(o.t + .01, o.et - .036), k: 'e', h: 0 });
        q.ev.sort((a, b) => a.t - b.t);
        q.nel = 1 + q.ev.length; q.got = 0; q.ei = 0; q.trk = 0;
        q.pp = new Path2D();
        q.path.pts.forEach((p, k) => q.pp[k ? 'lineTo' : 'moveTo'](p[0], p[1]));
      } else if (o.type === 'p') {
        q.rot = 0; q.fl = 0; q.la = null; q.need = Math.max(2, (o.et - o.t) / E.rate * (1.4 + .22 * E.od)); q.clr = 0;
      }
      return q;
    });
    const breaks = [];
    for (let i = 1; i < objs.length; i++) { const a = objs[i - 1].et, b = objs[i].t; if (b - a >= 4.2) breaks.push([a + .8, b - Math.max(E.pre, 1.4) - .4]); }
    const kiai = map.song.sections.filter(s => s.kiai).map(s => [s.start * map.song.step, s.end * map.song.step]);
    return { objs, breaks, kiai };
  }

  const OSU_CSS = FNF_CSS.replaceAll('.gm-fnf', '.gm-osu').replaceAll('#ff5fa8', '#ff66ab').replaceAll('255,95,168', '255,102,171') + `
.gm-osu .fo-wrap{background:#0a0614}
.gm-osu .fo-wrap.cur{cursor:none}
.gm-osu .fo-logo{transform:none;font-size:calc(var(--u)*10);text-shadow:0 calc(var(--u)*.5) 0 #7a1f55,0 calc(var(--u)*1) 0 #1c1130,calc(var(--u)*.3) 0 0 #1c1130,calc(var(--u)*-.3) 0 0 #1c1130}
.gm-osu .fo-logo b{font-size:1em;color:#fff}
.gm-osu .fo-free{position:absolute;top:calc(var(--u)*6);bottom:calc(var(--u)*7);left:4%;right:4%;width:auto;height:auto;margin:0}
.gm-osu .por .fo-ui{--u:2.6cqw}
.gm-osu .por .fo-rows{max-height:70%;margin-top:calc(var(--u)*2)}
.gm-osu .por .fo-b.row{font-size:calc(var(--u)*1.55);padding:calc(var(--u)*.6) calc(var(--u)*1.2)}
.gm-osu .por .fo-free{top:calc(var(--u)*5);bottom:calc(var(--u)*7.5)}
.gm-osu .por .fo-list{flex:.8}
.gm-osu .por .fo-info{flex:1.2;padding:calc(var(--u)*1);gap:calc(var(--u)*.7)}
.gm-osu .por .fo-info h3{font-size:calc(var(--u)*2.3)}
.gm-osu .por .fo-info p{font-size:calc(var(--u)*1.3)}
.gm-osu .por .os-st div{font-size:calc(var(--u)*1.2);padding:calc(var(--u)*.3)}
.gm-osu .por .os-st b{font-size:calc(var(--u)*1.7)}
.gm-osu .por .fo-diffs .fo-b{min-width:0;padding:calc(var(--u)*.5) calc(var(--u)*1);font-size:calc(var(--u)*1.6)}
.gm-osu .por .os-mods .fo-b{font-size:calc(var(--u)*1.3);padding:calc(var(--u)*.45) calc(var(--u)*1)}
.gm-osu .por .fo-list .fo-b{padding:calc(var(--u)*.6) calc(var(--u)*1.2);font-size:calc(var(--u)*1.7)}
.gm-osu .por .fo-list .fo-b small{font-size:calc(var(--u)*1.1)}
.gm-osu .fo-info{justify-content:flex-start;overflow-y:auto;gap:calc(var(--u)*.9);scrollbar-width:thin}
.gm-osu .fo-info>*{flex:none}
.gm-osu .fo-diffs{flex-wrap:wrap}
.gm-osu .fo-diffs .fo-b{min-width:calc(var(--u)*8)}
.gm-osu .fo-diffs .fo-b small{display:block;font:800 .62em/1 system-ui,sans-serif;opacity:.85;margin-top:calc(var(--u)*.25)}
.gm-osu .os-st{display:grid;grid-template-columns:repeat(4,1fr);gap:calc(var(--u)*.6);width:100%}
.gm-osu .os-st div{background:rgba(255,255,255,.07);border-radius:calc(var(--u)*.8);padding:calc(var(--u)*.5);text-align:center;font:700 calc(var(--u)*1.05)/1.2 system-ui,sans-serif;color:#cfc8ee}
.gm-osu .os-st b{display:block;font:900 calc(var(--u)*1.7)/1.15 "Trebuchet MS",system-ui,sans-serif;color:#fff}
.gm-osu .os-mods{display:flex;flex-wrap:wrap;gap:calc(var(--u)*.6);justify-content:center}
.gm-osu .os-mods .fo-b{min-width:0;padding:calc(var(--u)*.6) calc(var(--u)*1.2);font-size:calc(var(--u)*1.5)}
.gm-osu .fo-list .fo-b.sel{box-shadow:0 calc(var(--u)*.4) 0 #0f0720,0 0 0 calc(var(--u)*.25) #ff66ab inset}
.gm-osu .fo-b.act{background:linear-gradient(#ff66ab,#a8336f);color:#fff}
.gm-osu .fo-pause{top:auto;bottom:calc(var(--u)*1)}
.gm-osu .os-skip{position:absolute;right:calc(var(--u)*1.2);bottom:calc(var(--u)*5);z-index:3;min-width:0!important;padding:calc(var(--u)*.7) calc(var(--u)*1.8)!important;font-size:calc(var(--u)*1.8)!important}
.gm-osu .por .os-skip{bottom:calc(var(--u)*6)}
.gm-osu .os-hist{display:flex;align-items:flex-end;gap:2px;height:calc(var(--u)*4.5);width:calc(var(--u)*40);max-width:100%;border-bottom:2px solid rgba(255,255,255,.35)}
.gm-osu .os-hist i{flex:1;background:#47c8ff;border-radius:2px 2px 0 0;min-height:1px}
.gm-osu .os-hist i.m{background:#7dff9e}
.gm-osu .os-hist i.s{background:#ffb347}
.gm-osu .fo-res .fo-rank{font-size:calc(var(--u)*11)}
`;


  const circCache = {};
  function circSpr(col, R) {
    const key = col + '|' + R;
    if (circCache[key]) return circCache[key];
    const S = Math.ceil(R * 2.6), cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const x = cv.getContext('2d');
    x.translate(S / 2, S / 2);
    x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = R * .25;
    x.beginPath(); x.arc(0, 0, R * .94, 0, 7); x.fillStyle = col; x.fill();
    x.shadowBlur = 0;
    const g = x.createRadialGradient(0, -R * .25, R * .05, 0, 0, R);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.4)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, R * .94, 0, 7); x.fill();
    x.lineWidth = R * .13; x.strokeStyle = '#fff'; x.beginPath(); x.arc(0, 0, R * .9, 0, 7); x.stroke();
    return circCache[key] = cv;
  }
  const OSU_JV = [300, 100, 50];
  const OSU_JC = ['#6fd8ff', '#7dff9e', '#ffb347', '#ff4d5e'];

  function mountOsu(root, api) {
    const por = innerWidth < innerHeight * .9 && root.clientWidth < 760;
    const W = por ? 720 : 960, H = por ? 1040 : 720, SC = por ? 1.36 : 1.5, FX = (W - 512 * SC) / 2, FY = por ? 270 : 72;
    const wrap = document.createElement('div');
    wrap.className = 'fo-wrap ' + (por ? 'por' : 'lan');
    wrap.style.width = `min(100%,${W}px,calc((100dvh - var(--goff,250px))*${(W / H).toFixed(4)}))`;
    wrap.style.aspectRatio = W + ' / ' + H;
    root.append(wrap);
    const { canvas, ctx: c, toLocal } = api.canvas(W, H, wrap);
    const ui = document.createElement('div');
    ui.className = 'fo-ui';
    wrap.append(ui);
    const audio = makeAudio(api);
    const sv = Object.assign({ best: {}, o: {}, sel: 0, di: 1, mods: {} }, api.load() || {});
    const O = Object.assign({ cur: 1, trail: true, fx: true, hs: true }, sv.o);
    sv.o = O;
    if (!sv.mods || typeof sv.mods !== 'object') sv.mods = {};
    sv.sel = clamp(sv.sel | 0, 0, OSU_SONGS.length - 1); sv.di = clamp(sv.di | 0, 0, 3);
    const persist = () => api.save(sv);
    let S = { scr: 'menu', fi: 0, d: {}, gesture: false };
    let G = null, calOff = null, calS = SHARED.cal / 1000;
    const inp = { x: 256, y: 192, kz: 0, kx: 0, m: 0, p: {}, np: 0, touch: 0, seen: 0, off: 1 };
    const px = x => FX + x * SC, py = y => FY + y * SC;
    const down = () => !!(inp.kz || inp.kx || inp.m > 0 || inp.np > 0);
    const curId = () => OSU_SONGS[sv.sel];
    const shapes = Array.from({ length: 18 }, (_, i) => { const r = mkRng(i * 7919 + 11); return { x: r() * W, y: r() * (H + 200), s: 26 + r() * 80, k: i % 3, v: 8 + r() * 20, a: r() * 6.28, w: (r() - .5) * .5 }; });
    const demo = [];
    let demoT = 0;

    function menuMusic() {
      if (!S.gesture) return;
      if (audio.playing && audio.S.song && audio.S.song.id === 'menu') return;
      audio.play(SONGS.menu, { loop: true, lead: .08, rate: 1 });
    }
    function previewSong(id) {
      if (!S.gesture) return;
      const s = SONGS[id], sec = s.sections.find(x => x.kiai) || s.sections[1] || s.sections[0];
      const from = sec.start, to = Math.min(s.steps, from + 96);
      const go = () => audio.play(s, { from, to, lead: .06, onEnd: () => { if (S.scr === 'sel' && curId() === id) go(); } });
      go();
    }
    function unlock() {
      if (S.gesture) return;
      S.gesture = true;
      audio.resume();
      if (['menu', 'opts'].includes(S.scr)) menuMusic();
      else if (S.scr === 'sel') previewSong(curId());
    }

    const diffChips = () => `<div class="fo-diffs">${OSU_DIFFS.map((d, i) => { const m = osuMap(curId(), i); return `<button class="fo-b ${sv.di === i ? 'sel' : ''}" style="--c:${d.col}" data-a="d:${i}">${d.n}<small>${osuStarsAdj(m.stars, sv.mods).toFixed(2)} &#9733;</small></button>`; }).join('')}</div>`;
    const rowSt = (label, key, val) => `<div class="fo-b row" data-a="o:${key}:1" data-l="o:${key}:-1" data-r="o:${key}:1"><span>${label}</span><span class="v"><i data-a="o:${key}:-1">&#9664;</i><b>${val}</b><i data-a="o:${key}:1">&#9654;</i></span></div>`;
    const onoff = v => v ? 'On' : 'Off';
    const bestKey = (id, d) => id + ':' + d;
    const modChips = () => `<div class="os-mods">${OSU_MODS.map(m => `<button class="fo-b sm ${sv.mods[m.k] ? 'act' : ''}" data-a="mod:${m.k}" title="${esc(m.d)}">${m.k}</button>`).join('')}</div>`;

    const R = {
      menu: () => `<h1 class="fo-logo"><b>osu!</b></h1><div class="fo-sub">Click the circles to the beat.<br>Original songs and beatmaps.</div><div class="fo-col" style="min-width:calc(var(--u)*${por ? 28 : 24})"><button class="fo-b pri" data-a="play">Play</button><button class="fo-b" data-a="opts">Options</button></div><div class="fo-hint">${por ? 'Tap the circles. Drag along sliders. Spin on spinners.' : 'Move the mouse, click or press Z / X. Esc pauses.'}</div>`,
      sel: () => {
        let h = '<div class="fo-head">Song select</div><div class="fo-free"><div class="fo-list">';
        OSU_SONGS.forEach(id => { const s = SONGS[id], a = osuMap(id, 0).stars, b = osuMap(id, 3).stars, bs = [3, 2, 1, 0].map(d => sv.best[bestKey(id, d)]).find(Boolean); h += `<button class="fo-b ${id === curId() ? 'sel' : ''}" data-a="sp:${id}" data-f="ss:${id}" data-l="dd:-1" data-r="dd:1"><span>${esc(s.name)}</span><small>${a.toFixed(1)}-${b.toFixed(1)} &#9733;${bs ? ' ' + bs.grade : ''}</small></button>`; });
        return h + `</div><div class="fo-info" id="fi"></div></div><div class="fo-foot"><button class="fo-b ghost" data-a="back">Back</button><button class="fo-b pri" data-a="start">Play</button></div>`;
      },
      opts: () => `<div class="fo-head">Options</div><div class="fo-rows">${rowSt('Volume', 'vol', Math.round(SHARED.vol * 100) + '%')}${rowSt('Audio offset', 'cal', (SHARED.cal > 0 ? '+' : '') + SHARED.cal + ' ms')}<div class="fo-b row" data-a="cal"><span>Calibrate offset</span><span class="v"><b>Tap to the beat</b></span></div>${rowSt('Cursor size', 'cur', O.cur.toFixed(1) + 'x')}${rowSt('Cursor trail', 'trail', onoff(O.trail))}${rowSt('Background effects', 'fx', onoff(O.fx))}${rowSt('Hit sounds', 'hs', onoff(O.hs))}<div class="fo-b row" data-a="reset"><span>Reset records</span><span class="v"><b>${S.d.rs ? 'Press again' : ''}</b></span></div></div><div class="fo-foot"><button class="fo-b ghost" data-a="back">Back</button></div>`,
      cal: () => '<div id="calhost"></div>',
      play: () => '<button class="fo-b ghost fo-pause" data-a="pause">II</button><button class="fo-b pri os-skip" data-a="skip" hidden>Skip</button>',
      pause: () => `<div class="fo-res"><h2>Paused</h2><div class="fo-col"><button class="fo-b pri" data-a="resume">Resume</button><button class="fo-b" data-a="retry">Retry</button><button class="fo-b ghost" data-a="quit">Quit to songs</button></div><div class="fo-hint">Offset ${SHARED.cal > 0 ? '+' : ''}${SHARED.cal} ms (change it in Options)</div></div>`,
      resume: d => `<div class="fo-cnt">${d.n}</div>`,
      fail: d => `<div class="fo-res"><h2 style="color:#ff6a5c">You failed</h2><div class="fo-sub">${esc(d.g.song.name)} (${OSU_DIFFS[d.g.di].n}) at ${Math.round(d.pct)}%. Try No Fail or an easier difficulty.</div><div class="fo-btns"><button class="fo-b pri" data-a="retry">Retry</button><button class="fo-b ghost" data-a="quit">Songs</button></div></div>`,
      res: d => {
        const g = d.g, n = g.n, acc = osuAccOf(n), gr = d.grade, b = sv.best[bestKey(g.id, g.di)];
        const E = g.E, bk = 21, hist = new Array(bk).fill(0);
        g.errs.forEach(e => { hist[clamp(Math.round(e / (E.w5 * 1000) * 10) + 10, 0, 20)]++; });
        const mx = Math.max(1, ...hist);
        const avg = g.errs.length ? g.errs.reduce((a, v) => a + v, 0) / g.errs.length : 0;
        const ur = g.errs.length ? Math.sqrt(g.errs.reduce((a, v) => a + (v - avg) * (v - avg), 0) / g.errs.length) * 10 : 0;
        return `<div class="fo-res"><h2>${esc(g.song.name)} <small style="opacity:.6;font-size:.55em">${OSU_DIFFS[g.di].n}${osuModStr(g.mods) !== 'None' ? ' +' + osuModStr(g.mods) : ''}</small></h2><div class="fo-rank" style="color:${osuGradeCol(gr)}">${gr}</div><div class="fo-grid"><span>Score</span><b>${fmtNum(g.score)}</b><span>Accuracy</span><b>${acc.toFixed(2)}%</b><span>300 / 100</span><b><i style="color:#6fd8ff;font-style:normal">${n[0]}</i> / <i style="color:#7dff9e;font-style:normal">${n[1]}</i></b><span>50 / Miss</span><b><i style="color:#ffb347;font-style:normal">${n[2]}</i> / <i style="color:#ff4d5e;font-style:normal">${n[3]}</i></b><span>Max combo</span><b>${g.maxCombo}x / ${g.totCombo}x</b><span>Avg error / UR</span><b>${avg >= 0 ? '+' : ''}${avg.toFixed(1)} ms / ${ur.toFixed(0)}</b>${d.rec ? '<span>Record</span><b style="color:#ffd23f">NEW BEST</b>' : b ? `<span>Best</span><b>${fmtNum(b.score)} ${b.grade}</b>` : ''}</div><div class="os-hist">${hist.map((v, i) => `<i class="${Math.abs(i - 10) * E.w5 * 100 > E.w1 * 1000 ? 's' : Math.abs(i - 10) * E.w5 * 100 > E.w3 * 1000 ? 'm' : ''}" style="height:${Math.round(100 * v / mx)}%"></i>`).join('')}</div><div class="fo-hint">Hit errors: early on the left, late on the right</div><div class="fo-btns"><button class="fo-b pri" data-a="retry">Retry</button><button class="fo-b ghost" data-a="quit">Songs</button></div></div>`;
      }
    };

    function show(name, d) {
      if (calOff) { calOff(); calOff = null; }
      S.scr = name; S.d = d || {}; S.fi = 0;
      ui.className = 'fo-ui' + (name === 'play' ? ' off' : ['pause', 'res', 'fail', 'resume'].includes(name) ? ' dim' : '');
      wrap.classList.toggle('cur', name === 'play');
      ui.innerHTML = R[name] ? R[name](S.d) : '';
      if (name === 'cal') calOff = calibrator(ui.querySelector('#calhost'), audio, api, { help: 'Press Space, Enter or tap the circle on every tick. The median error of your last taps is your offset. Positive means you hit late.', onDone: () => show('opts') });
      if (name === 'sel') { focusFirst(`[data-f="ss:${curId()}"]`); infoFor(curId()); }
      else focusFirst();
    }
    const focusables = () => [...ui.querySelectorAll('.fo-b:not(.lock):not([disabled]):not(.fo-pause):not(.os-skip)')].filter(e => !e.closest('.cal') && !e.closest('.fo-info'));
    function focusFirst(sel) {
      const list = focusables();
      let i = 0;
      if (sel) { const e = ui.querySelector(sel); if (e) i = Math.max(0, list.indexOf(e)); }
      setFocus(i, true);
    }
    function setFocus(i, silent) {
      const list = focusables();
      if (!list.length) return;
      S.fi = (i + list.length) % list.length;
      list.forEach((e, k) => e.classList.toggle('on', k === S.fi));
      const el = list[S.fi];
      el.scrollIntoView && el.scrollIntoView({ block: 'nearest' });
      if (!silent && el.dataset.f) act(el.dataset.f, el);
    }

    function infoFor(id) {
      const el = ui.querySelector('#fi');
      if (!el) return;
      const s = SONGS[id], m = osuMap(id, sv.di), E = osuEff(m, sv.mods), b = sv.best[bestKey(id, sv.di)];
      const st = osuStarsAdj(m.stars, sv.mods), sl = m.objs.filter(o => o.type === 's').length, sp = m.objs.filter(o => o.type === 'p').length;
      const pr = E.pre / E.rate, arD = pr > 1.2 ? (1.8 - pr) / .12 : 5 + (1.2 - pr) / .15, odD = (80 - E.w3 * 1000 / E.rate) / 6;
      el.style.setProperty('--c', OSU_DIFFS[sv.di].col);
      el.innerHTML = `<h3 style="color:${OSU_DIFFS[sv.di].col}">${esc(s.name)}</h3><p>${Math.round(s.bpm * E.rate)} BPM - ${fmtTime((s.dur) / E.rate)} - ${m.nObj} objects</p>${diffChips()}<div class="os-st"><div><b>${E.cs.toFixed(1)}</b>CS</div><div><b>${arD.toFixed(1)}</b>AR</div><div><b>${odD.toFixed(1)}</b>OD</div><div><b>${E.hp.toFixed(1)}</b>HP</div><div><b>${st.toFixed(2)}</b>Stars</div><div><b>${m.nObj - sl - sp}</b>Circles</div><div><b>${sl}</b>Sliders</div><div><b>${sp}</b>Spinners</div></div>${modChips()}<div class="fo-hint">${b ? `Best ${fmtNum(b.score)} - ${b.grade} - ${b.acc.toFixed(2)}%` : 'No record yet'} - score x${osuModMult(sv.mods).toFixed(2)}</div>`;
      el.querySelectorAll('.fo-diffs .fo-b').forEach(e => e.style.setProperty('--c', OSU_DIFFS[+e.dataset.a.split(':')[1]].col));
    }
    const refreshList = () => { if (S.scr !== 'sel') return; ui.querySelectorAll('.fo-list .fo-b').forEach(e => e.classList.toggle('sel', e.dataset.a === 'sp:' + curId())); };

    function act(a, el) {
      const p = a.split(':'), k = p[0];
      unlock();
      if (k === 'play') { audio.sfx('ok'); show('sel'); previewSong(curId()); }
      else if (k === 'opts') { audio.sfx('ok'); show('opts'); }
      else if (k === 'back') { audio.sfx('back'); audio.stop(.1); show('menu'); menuMusic(); }
      else if (k === 'ss') { const i = OSU_SONGS.indexOf(p[1]); if (i === sv.sel && audio.playing) return; sv.sel = i; persist(); infoFor(p[1]); refreshList(); previewSong(p[1]); }
      else if (k === 'd') { sv.di = +p[1]; persist(); audio.sfx('tick'); infoFor(curId()); }
      else if (k === 'dd') { sv.di = clamp(sv.di + (+p[1]), 0, 3); persist(); audio.sfx('tick'); infoFor(curId()); }
      else if (k === 'mod') {
        const m = p[1];
        sv.mods[m] = !sv.mods[m];
        if (sv.mods[m] && m === 'EZ') sv.mods.HR = false;
        if (sv.mods[m] && m === 'HR') sv.mods.EZ = false;
        persist(); audio.sfx('tick'); infoFor(curId());
      }
      else if (k === 'start') act('sp:' + curId());
      else if (k === 'sp') { if (S.scr === 'sel' && p[1] !== curId()) { act('ss:' + p[1]); return; } sv.sel = OSU_SONGS.indexOf(p[1]); persist(); audio.sfx('ok'); begin(p[1], sv.di); }
      else if (k === 'o') optStep(p[1], +p[2]);
      else if (k === 'cal') { audio.sfx('ok'); audio.stop(.1); show('cal'); }
      else if (k === 'reset') { if (S.d.rs) { sv.best = {}; persist(); S.d = {}; audio.sfx('ok'); show('opts'); } else { S.d.rs = 1; show('opts'); } }
      else if (k === 'pause') pauseGame();
      else if (k === 'resume') resumeGame();
      else if (k === 'skip') skip();
      else if (k === 'retry') begin(G.id, G.di);
      else if (k === 'quit') { audio.stop(.1); G = null; show('sel'); previewSong(curId()); }
    }
    function optStep(key, d) {
      if (key === 'vol') SHARED.vol = clamp(Math.round((SHARED.vol + d * .1) * 10) / 10, 0, 1);
      else if (key === 'cal') SHARED.cal = SHARED.cal + d * 5;
      else if (key === 'cur') O.cur = clamp(Math.round((O.cur + d * .1) * 10) / 10, .5, 2);
      else O[key] = !O[key];
      calS = SHARED.cal / 1000;
      persist(); audio.sfx('tick');
      const i = S.fi; show('opts'); setFocus(i, true);
    }

    const songT = () => (audio.now() - audio.t0) * audio.rate - calS;

    function begin(id, di) {
      const map = osuMap(id, di), mods = Object.assign({}, sv.mods), E = osuEff(map, mods), pr = osuPrep(map, E);
      calS = SHARED.cal / 1000;
      const dm = Math.max(1, Math.round((map.hp + map.od + map.cs + clamp(map.nObj / Math.max(10, map.play) * 8, 0, 16)) / 38 * 5));
      let tc = 0;
      pr.objs.forEach(o => { tc += o.type === 's' ? 1 + o.ev.length + 1 : o.type === 'p' ? 0 : 1; });
      G = {
        id, di, map, song: map.song, mods, E, objs: pr.objs, breaks: pr.breaks, kiai: pr.kiai, pal: map.pal, ai: 0, hi: 0, vi: 0, hp: 1, hpv: 1, minHp: 1, score: 0, combo: 0, maxCombo: 0, totCombo: tc, n: [0, 0, 0, 0],
        errs: [], errT: [], errJ: [], pops: [], bursts: [], trail: [], dm, mm: osuModMult(mods), state: 'play', paused: false, t: -2, lt: -2, cpop: 0, kf: 0, inBreak: 0, bs: 60 / map.song.bpm, hum: 0, auto: !!mods.AT, deadAt: 0, ended: 0, firstT: pr.objs[0].t, lastE: pr.objs[pr.objs.length - 1].et
      };
      inp.kz = inp.kx = 0;
      show('play');
      audio.play(map.song, { lead: 1.2, rate: E.rate });
      api.score(0);
    }
    function skipTarget(g, T) {
      for (const b of g.breaks) if (T >= b[0] - .3 && T < b[1] - 1.5) return b[1];
      const f = g.firstT - g.E.pre - 1;
      return T < f - 2.5 ? f : 0;
    }
    function skip() {
      const g = G;
      if (!g || g.paused || g.state !== 'play') return;
      const tg = skipTarget(g, g.t);
      if (!tg) return;
      audio.stop(.05);
      audio.play(g.song, { from: Math.floor(tg / g.song.step), lead: .05, rate: g.E.rate });
      audio.sfx('sec');
    }
    function pauseGame() {
      if (!G || G.paused || S.scr !== 'play' || G.state !== 'play') return;
      G.paused = true;
      audio.slideHum(false);
      G.pt = G.t + calS;
      audio.stop(.05);
      show('pause');
    }
    function resumeGame() {
      if (!G || !G.paused) return;
      let n = 3;
      show('resume', { n });
      const tick = () => {
        if (S.scr !== 'resume' || !G || !G.paused) return;
        if (--n <= 0) { G.paused = false; audio.restartAt(G.song, G.pt, G.E.rate); G.lt = songT(); show('play'); return; }
        const e = ui.querySelector('.fo-cnt'); if (e) e.textContent = n;
        audio.sfx('beep'); api.timeout(tick, 650);
      };
      audio.sfx('beep'); api.timeout(tick, 650);
    }

    const gainHp = (g, v) => { g.hp = clamp(g.hp + v, 0, 1); };
    const comboUp = g => { g.combo++; if (g.combo > g.maxCombo) g.maxCombo = g.combo; g.cpop = performance.now(); };
    const comboBreak = g => { if (g.combo >= 20) audio.sfx('sbreak'); g.combo = 0; };
    const popAt = (g, x, y, j) => g.pops.push({ x, y, j, t: performance.now() });
    const addJ = (g, base) => { g.score += base + Math.round(base * Math.max(0, g.combo - 1) * g.dm * g.mm / 25); };
    function judge(g, o, j, x, y) {
      g.n[j]++;
      if (j < 3) { addJ(g, OSU_JV[j]); gainHp(g, [.045, .022, .006][j]); } else gainHp(g, -(.06 + .012 * g.E.hp));
      popAt(g, x, y, j);
      o.done = 1;
    }
    function hitHead(g, o, dt) {
      const E = g.E, a = Math.abs(dt), j = a <= E.w3 ? 0 : a <= E.w1 ? 1 : 2;
      o.hd = 1; g.errs.push(dt * 1000); g.errT.push(performance.now()); g.errJ.push(j);
      if (O.hs) audio.sfx('hit');
      g.bursts.push({ x: o.x, y: o.y, ci: o.ci, t: performance.now(), k: 0 });
      comboUp(g);
      if (o.type === 'c') judge(g, o, j, o.x, o.y);
      else { o.got++; g.score += 30; gainHp(g, .012); }
    }
    function missHead(g, o) {
      o.hd = 1;
      g.bursts.push({ x: o.x, y: o.y, ci: o.ci, t: performance.now(), k: 1 });
      comboBreak(g);
      if (o.type === 'c') judge(g, o, 3, o.x, o.y); else gainHp(g, -.02);
    }
    function click(ts) {
      const g = G;
      if (!g || g.paused || g.state !== 'play' || g.auto) return;
      const T = (audio.at(ts == null ? performance.now() : ts) - audio.t0) * audio.rate - calS, E = g.E;
      while (g.hi < g.objs.length && (g.objs[g.hi].type === 'p' || g.objs[g.hi].hd)) g.hi++;
      const o = g.objs[g.hi];
      if (!o) return;
      const dt = T - o.t, rr = E.rad * (inp.touch ? 1.15 : 1);
      if (Math.hypot(inp.x - o.x, inp.y - o.y) > rr) return;
      if (dt < -E.w5) { if (-dt <= E.w5 + .09) missHead(g, o); return; }
      if (dt > E.w5) return;
      hitHead(g, o, dt);
    }

    function autoStep(g, T) {
      while (g.hi < g.objs.length && (g.objs[g.hi].type === 'p' || g.objs[g.hi].hd)) g.hi++;
      let i = g.ai;
      while (i < g.objs.length && g.objs[i].done) i++;
      const o = g.objs[i], pv = i ? g.objs[i - 1] : null;
      if (!o) return;
      if (o.type === 'p' && T >= o.t) { const a = T * 32; inp.x = 256 + Math.cos(a) * 70; inp.y = 192 + Math.sin(a) * 70; return; }
      if (o.type === 's' && T >= o.t) { const bp = sliderPos(o, (T - o.t) / (o.et - o.t)); inp.x = bp[0]; inp.y = bp[1]; if (!o.hd) hitHead(g, o, 0); return; }
      const f = pv ? [pv.ex, pv.ey] : [256, 192], ps = pv ? pv.et : o.t - 1, u = clamp((T - ps) / Math.max(.05, o.t - ps), 0, 1), e = u * u * (3 - 2 * u);
      inp.x = f[0] + (o.x - f[0]) * e; inp.y = f[1] + (o.y - f[1]) * e;
      if (o.type === 'c' && T >= o.t && !o.hd) hitHead(g, o, 0);
    }

    function proc(g, T, dtS) {
      const E = g.E;
      const dn = g.auto || down();
      let trk = 0;
      for (let i = g.ai; i < g.objs.length; i++) {
        const o = g.objs[i];
        if (o.t > T + .6) break;
        if (o.done) continue;
        if (o.type === 'c') { if (!o.hd && T > o.t + E.w5 + .008) missHead(g, o); }
        else if (o.type === 's') {
          if (!o.hd && T > o.t + E.w5 + .008) missHead(g, o);
          if (T >= o.t) {
            const bp = sliderPos(o, clamp((T - o.t) / (o.et - o.t), 0, 1));
            o.bx = bp[0]; o.by = bp[1];
            o.trk = g.auto || (dn && Math.hypot(inp.x - bp[0], inp.y - bp[1]) <= E.rad * (o.trk ? 2.4 : 1.1)) ? 1 : 0;
            if (T < o.et) trk = trk || o.trk;
            while (o.ei < o.ev.length && o.ev[o.ei].t <= T) {
              const e = o.ev[o.ei++];
              e.d = 1;
              if (o.trk) {
                e.h = 1; o.got++; comboUp(g);
                if (e.k === 't') { g.score += 10; gainHp(g, .01); if (O.hs) audio.sfx('tickS'); }
                else { g.score += 30; gainHp(g, .015); if (e.k === 'r' && O.hs) audio.sfx('rev'); }
              } else { comboBreak(g); gainHp(g, -.02); if (e.k !== 'e') g.bursts.push({ x: e.x, y: e.y, ci: o.ci, t: performance.now(), k: 2 }); }
            }
            if (T >= o.et) {
              const fr = o.got / o.nel, j = fr >= 1 ? 0 : fr >= .5 ? 1 : fr > 0 ? 2 : 3;
              judge(g, o, j, o.ex, o.ey);
            }
          }
        } else if (T >= o.t) {
          if (T < o.et) {
            const dx = inp.x - 256, dy = inp.y - 192;
            if (Math.hypot(dx, dy) > 6) {
              const a = Math.atan2(dy, dx);
              if (o.la != null) { let d = a - o.la; if (d > Math.PI) d -= 6.2832; else if (d < -Math.PI) d += 6.2832; o.rot += Math.min(.4, Math.abs(d) / 6.2832); }
              o.la = a;
            }
            while (o.rot >= o.fl + 1) { o.fl++; g.score += o.fl <= o.need ? 100 : 1000; gainHp(g, .008); audio.sfx('spin', o.fl % 8); }
            if (!o.clr && o.rot >= o.need) { o.clr = 1; audio.sfx('spinOk'); }
          } else {
            const fr = o.rot / o.need, j = fr >= 1 ? 0 : fr >= .9 ? 1 : fr >= .75 ? 2 : 3;
            if (j < 3) comboUp(g); else comboBreak(g);
            judge(g, o, j, 256, 250);
          }
        }
      }
      if (trk !== g.hum) { g.hum = trk; audio.slideHum(!!trk); }
      while (g.ai < g.objs.length && g.objs[g.ai].done) g.ai++;
      g.inBreak = g.breaks.some(b => T >= b[0] && T <= b[1]) ? 1 : 0;
      if (T >= g.firstT - .3 && T <= g.lastE && !g.inBreak && !g.auto) gainHp(g, -E.drain * dtS);
    }

    function update(dt) {
      const g = G;
      if (!g || g.paused || (S.scr !== 'play')) return;
      const T = songT();
      g.t = T;
      const dtS = clamp(T - g.lt, 0, .12);
      g.lt = T;
      if (g.state !== 'play') return;
      if (g.auto) autoStep(g, T);
      proc(g, T, dtS);
      if (g.hp < g.minHp) g.minHp = g.hp;
      g.hpv += (g.hp - g.hpv) * Math.min(1, dt * 9);
      const ki = g.kiai.some(r => T >= r[0] && T < r[1]) ? 1 : 0;
      g.kf += (ki - g.kf) * Math.min(1, dt * 3);
      const sk = skipTarget(g, T), sb = ui.querySelector('.os-skip');
      if (sb) sb.hidden = !sk;
      if (g.hp <= 0 && !g.mods.NF && !g.auto) { fail(g); return; }
      if (g.ai >= g.objs.length && T > g.lastE + .9) finish(g);
      if (Math.floor(T) !== g.ls) { g.ls = Math.floor(T); api.score(g.score); }
    }
    function fail(g) {
      g.state = 'dead'; g.deadAt = performance.now();
      audio.slideHum(false); audio.stop(.35); audio.sfx('fail');
      const pct = 100 * clamp((g.t - g.firstT) / Math.max(1, g.lastE - g.firstT), 0, 1);
      api.timeout(() => { if (G === g && g.state === 'dead') show('fail', { g, pct }); }, 1500);
    }
    function finish(g) {
      if (g.state === 'end') return;
      g.state = 'end';
      audio.slideHum(false); audio.stop(.8);
      const gr = osuGrade(g.n), acc = osuAccOf(g.n);
      let rec = false;
      if (!g.auto) {
        const key = bestKey(g.id, g.di), b = sv.best[key];
        rec = !b || g.score > b.score;
        if (rec) sv.best[key] = { score: g.score, acc: +acc.toFixed(2), grade: gr, mods: osuModStr(g.mods), combo: g.maxCombo };
        persist(); api.submit(Math.max(1, g.score));
      }
      audio.sfx(gr === 'D' ? 'back' : 'rank');
      api.timeout(() => { if (G === g) show('res', { g, grade: gr, rec }); }, 1100);
    }

    function drawBG(t, hue, beat, kf) {
      const gr = c.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, `hsl(${hue},40%,${11 + kf * 4}%)`); gr.addColorStop(1, `hsl(${hue + 35},48%,${5 + kf * 3}%)`);
      c.fillStyle = gr; c.fillRect(0, 0, W, H);
      if (!O.fx) return;
      c.lineWidth = 3;
      shapes.forEach(s => {
        const y = ((s.y - t * s.v) % (H + 200) + H + 200) % (H + 200) - 100, sz = s.s * (1 + beat * .07);
        c.save(); c.translate(s.x, y); c.rotate(s.a + t * s.w);
        c.strokeStyle = `hsla(${hue + s.k * 40},75%,66%,${.09 + beat * .06 + kf * .07})`;
        c.beginPath();
        if (s.k === 0) { c.moveTo(0, -sz * .6); c.lineTo(sz * .55, sz * .4); c.lineTo(-sz * .55, sz * .4); c.closePath(); }
        else if (s.k === 1) c.arc(0, 0, sz * .5, 0, 7);
        else c.rect(-sz * .4, -sz * .4, sz * .8, sz * .8);
        c.stroke(); c.restore();
      });
    }
    function drawMenuBG() {
      const t = performance.now() / 1000, id = S.scr === 'sel' || S.scr === 'cal' ? curId() : 'paper-planes';
      const hue = OSU_PAL[id] || 330, ph = (t * 1.9) % 1, pal = osuPal(id);
      drawBG(t, S.scr === 'menu' ? 330 : hue, Math.pow(1 - ph, 3), 0);
      if (t - demoT > .5) { demoT = t; const r = mkRng((t * 977) | 0); demo.push({ x: 90 + r() * 330, y: 60 + r() * 270, t, ci: (r() * 4) | 0, n: demo.length % 4 + 1 }); }
      const R0 = 40 * SC * .8;
      for (let i = demo.length - 1; i >= 0; i--) {
        const d = demo[i], age = t - d.t;
        if (age > 1.6) { demo.splice(i, 1); continue; }
        const x = px(d.x), y = py(d.y);
        c.save();
        if (age < 1.1) {
          c.globalAlpha = clamp(age * 3, 0, 1) * .55;
          const sp = circSpr(pal[d.ci], Math.round(R0));
          c.drawImage(sp, x - sp.width / 2, y - sp.height / 2);
          c.strokeStyle = pal[d.ci]; c.lineWidth = R0 * .09; c.beginPath(); c.arc(x, y, R0 * (1 + 3 * (1 - age / 1.1)), 0, 7); c.stroke();
        } else {
          const b = (age - 1.1) / .5;
          c.globalAlpha = clamp(1 - b, 0, 1) * .5;
          const sp = circSpr(pal[d.ci], Math.round(R0)), s2 = 1 + b * .4;
          c.drawImage(sp, x - sp.width * s2 / 2, y - sp.height * s2 / 2, sp.width * s2, sp.height * s2);
        }
        c.restore();
      }
      c.fillStyle = 'rgba(6,3,16,.28)'; c.fillRect(0, 0, W, H);
    }

    function drawSpin(g, o, T, a) {
      const cx = px(256), cy = py(192), base = 150 * SC, p = clamp(o.rot / o.need, 0, 1.4);
      c.save(); c.globalAlpha = a; c.translate(cx, cy);
      const live = T >= o.t, pr = live ? clamp((T - o.t) / (o.et - o.t), 0, 1) : 0;
      const rg = c.createRadialGradient(0, 0, base * .1, 0, 0, base);
      rg.addColorStop(0, 'rgba(255,255,255,.06)'); rg.addColorStop(1, o.clr ? 'rgba(125,255,158,.22)' : 'rgba(255,255,255,.12)');
      c.fillStyle = rg; c.beginPath(); c.arc(0, 0, base, 0, 7); c.fill();
      c.save(); c.rotate(o.rot * 6.2832); c.lineWidth = 6; c.strokeStyle = o.clr ? '#7dff9e' : '#fff';
      for (let k = 0; k < 8; k++) { c.rotate(.7854); c.beginPath(); c.moveTo(base * .35, 0); c.lineTo(base * .6, 0); c.stroke(); }
      c.restore();
      c.lineWidth = 10; c.strokeStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(0, 0, base * .93, 0, 7); c.stroke();
      c.strokeStyle = o.clr ? '#7dff9e' : g.pal[o.ci]; c.beginPath(); c.arc(0, 0, base * .93, -1.5708, -1.5708 + 6.2832 * Math.min(1, p)); c.stroke();
      c.lineWidth = 5; c.strokeStyle = '#fff'; c.beginPath(); c.arc(0, 0, Math.max(14, base * (1 - pr) * .98), 0, 7); c.stroke();
      c.restore();
      if (live) {
        const rps = o.fl / Math.max(.4, (T - o.t) / g.E.rate);
        txt(c, o.clr ? 'CLEAR!' : 'SPIN!', cx, cy + base * 1.18, por ? 40 : 46, o.clr ? '#7dff9e' : '#fff', 'center', 8);
        txt(c, Math.round(clamp(p, 0, 9.99) * 100) + '%   ' + (rps * 60 | 0) + ' rpm', cx, cy + base * 1.18 + (por ? 40 : 44), por ? 24 : 28, '#e7e0ff', 'center', 6);
      }
    }
    function drawObj(g, o, T, R, hd) {
      const E = g.E, a0 = clamp((T - (o.t - E.pre)) / Math.min(.4, E.pre * .66), 0, 1);
      if (o.type === 'p') { if (T < o.et + .2) drawSpin(g, o, T, T > o.et ? clamp(1 - (T - o.et) / .2, 0, 1) : a0); return; }
      const col = g.pal[o.ci];
      const head = () => {
        if (o.hd) return;
        let a = a0;
        if (hd) a = a0 * (1 - clamp((T - (o.t - E.pre * .6)) / (E.pre * .3), 0, 1));
        if (a <= .01) return;
        const x = px(o.x), y = py(o.y), sp = circSpr(col, Math.round(R));
        c.save(); c.globalAlpha = a;
        c.drawImage(sp, x - sp.width / 2, y - sp.height / 2);
        txt(c, String(o.n), x, y + R * .04, R * 1.0, '#fff', 'center', R * .1);
        if (!hd && T < o.t) {
          const s = 1 + 3 * (1 - clamp((T - (o.t - E.pre)) / E.pre, 0, 1));
          c.globalAlpha = a * .85; c.strokeStyle = col; c.lineWidth = R * .1; c.beginPath(); c.arc(x, y, R * .94 * s, 0, 7); c.stroke();
          c.globalAlpha = a * .5; c.strokeStyle = '#fff'; c.lineWidth = R * .03; c.stroke();
        }
        c.restore();
      };
      if (o.type === 'c') { head(); return; }
      let sa = a0;
      if (hd) sa = a0 * clamp(1 - (T - (o.t - E.pre * .3)) / ((o.et - o.t) + E.pre * .3), 0, 1);
      if (T > o.et) sa *= clamp(1 - (T - o.et) / .2, 0, 1);
      if (sa <= .01) return;
      c.save();
      c.translate(FX, FY); c.scale(SC, SC);
      c.lineCap = c.lineJoin = 'round';
      c.globalAlpha = sa;
      c.lineWidth = E.rad * 2; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke(o.pp);
      c.lineWidth = E.rad * 1.72; c.strokeStyle = '#0d0822'; c.stroke(o.pp);
      c.globalAlpha = sa * .32; c.strokeStyle = col; c.stroke(o.pp);
      c.globalAlpha = sa * .16; c.lineWidth = E.rad * .8; c.stroke(o.pp);
      c.restore();
      c.save(); c.globalAlpha = sa;
      let n1 = 0;
      for (let k = o.ei; k < o.ev.length; k++) {
        const e = o.ev[k];
        if (e.k === 't') { c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(px(e.x), py(e.y), R * .13, 0, 7); c.fill(); }
        else if (e.k === 'r' && !(n1 & (1 << (e.r % 2)))) {
          n1 |= 1 << (e.r % 2);
          const tip = pathAt(o.path, e.r % 2 ? o.path.L - 16 : 16), ang = Math.atan2(py(tip[1]) - py(e.y), px(tip[0]) - px(e.x));
          c.save(); c.translate(px(e.x), py(e.y)); c.rotate(ang); c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = R * .06;
          c.beginPath(); c.moveTo(R * .5, 0); c.lineTo(-R * .35, -R * .42); c.lineTo(-R * .35, R * .42); c.closePath(); c.stroke(); c.fill(); c.restore();
        }
      }
      c.restore();
      if (T >= o.t && T < o.et + .1) {
        const x = px(o.bx != null ? o.bx : o.x), y = py(o.by != null ? o.by : o.y);
        c.save(); c.globalAlpha = sa;
        if (o.trk) { c.fillStyle = 'rgba(255,255,255,.1)'; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = R * .08; c.beginPath(); c.arc(x, y, R * 2.4 * (1 + Math.sin(T * 24) * .015), 0, 7); c.fill(); c.stroke(); }
        const sp = circSpr(col, Math.round(R));
        c.drawImage(sp, x - sp.width / 2, y - sp.height / 2);
        c.restore();
      }
      head();
    }

    function drawPlay() {
      const g = G, T = g.t, bf = T / g.bs, beat = Math.pow(1 - ((bf % 1) + 1) % 1, 3), hue = OSU_PAL[g.id] || 200;
      drawBG(performance.now() / 1000, hue, T > 0 ? beat * .8 : 0, g.kf);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.roundRect(FX - 6, FY - 6, 512 * SC + 12, 384 * SC + 12, 14); c.fill();
      c.strokeStyle = `rgba(255,255,255,${.07 + g.kf * .2})`; c.lineWidth = 3; c.stroke();
      c.save();
      c.beginPath(); c.rect(0, FY - 90, W, 384 * SC + 180); c.clip();
      if (g.state === 'dead') c.translate(Math.sin(performance.now() / 22) * 3 * Math.max(0, 1 - (performance.now() - g.deadAt) / 600), 0);
      const R = g.E.rad * SC, nowP = performance.now();
      let first = g.vi;
      while (first < g.objs.length && g.objs[first].done && g.objs[first].et + .4 < T) first++;
      g.vi = first;
      let last = first;
      while (last < g.objs.length && g.objs[last].t - g.E.pre <= T) last++;
      for (let i = last - 1; i >= first; i--) drawObj(g, g.objs[i], T, R, !!g.mods.HD);
      g.bursts = g.bursts.filter(b => nowP - b.t < 320);
      g.bursts.forEach(b => {
        const age = (nowP - b.t) / 320, x = px(b.x), y = py(b.y);
        c.save();
        if (b.k === 2) { c.globalAlpha = 1 - age; c.fillStyle = '#ff4d5e'; c.beginPath(); c.arc(x, y, R * .16 * (1 + age), 0, 7); c.fill(); }
        else if (b.k === 0) { const sp = circSpr(g.pal[b.ci], Math.round(R)), s = 1 + age * .45; c.globalAlpha = (1 - age) * .9; c.drawImage(sp, x - sp.width * s / 2, y - sp.height * s / 2, sp.width * s, sp.height * s); }
        else { const sp = circSpr(g.pal[b.ci], Math.round(R)), s = 1 - age * .3; c.globalAlpha = (1 - age) * .6; c.filter = 'grayscale(1)'; c.drawImage(sp, x - sp.width * s / 2, y - sp.height * s / 2, sp.width * s, sp.height * s); }
        c.restore();
      });
      g.pops = g.pops.filter(p => nowP - p.t < 650);
      g.pops.forEach(p => {
        const age = (nowP - p.t) / 650, x = px(p.x), y = py(p.y) - R * 1.1 - age * 18;
        c.save(); c.globalAlpha = clamp(1.7 - age * 1.7, 0, 1) * (p.j === 0 ? .8 : 1);
        txt(c, p.j === 3 ? 'X' : String(OSU_JV[p.j]), x, y, (por ? 28 : 30) * (p.j === 0 ? .8 : 1.1) * (1 + Math.max(0, .3 - age * 2)), OSU_JC[p.j], 'center', 7);
        c.restore();
      });
      c.restore();
      if (g.inBreak && T > 0) {
        const b = g.breaks.find(r => T >= r[0] && T <= r[1]);
        if (b) { c.save(); c.globalAlpha = .9; txt(c, 'Break', W / 2, FY + 384 * SC * .45, por ? 60 : 70, '#fff', 'center', 12); txt(c, Math.ceil(b[1] - T + 1.2) + 's', W / 2, FY + 384 * SC * .45 + (por ? 54 : 62), por ? 30 : 34, '#e7e0ff', 'center', 8); c.restore(); }
      }
      cursor(g);
      hud(g, T);
      if (g.state === 'dead') { c.fillStyle = `rgba(255,40,70,${.28 * Math.max(0, 1 - (performance.now() - g.deadAt) / 1400)})`; c.fillRect(0, 0, W, H); }
    }
    function cursor(g) {
      const now = performance.now();
      if (inp.touch && !inp.np && now - inp.seen > 350) return;
      const x = px(inp.x), y = py(inp.y), r = 15 * O.cur * (W / 960) * (down() ? 1.12 : 1);
      if (O.trail) {
        g.trail.push({ x, y, t: now });
        while (g.trail.length && now - g.trail[0].t > 190) g.trail.shift();
        c.save(); c.lineCap = 'round';
        for (let i = 1; i < g.trail.length; i++) { const a = g.trail[i], b = g.trail[i - 1], f = 1 - (now - a.t) / 190; c.globalAlpha = f * .55; c.strokeStyle = '#ff9fd0'; c.lineWidth = r * 1.5 * f; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(a.x, a.y); c.stroke(); }
        c.restore();
      }
      c.save();
      c.shadowColor = '#ff66ab'; c.shadowBlur = r * (down() ? 1.8 : 1);
      c.lineWidth = r * .22; c.strokeStyle = '#fff'; c.fillStyle = 'rgba(255,102,171,.45)';
      c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
      c.shadowBlur = 0; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * .2, 0, 7); c.fill();
      c.restore();
    }
    function hud(g, T) {
      const E = g.E, acc = osuAccOf(g.n), judged = g.n[0] + g.n[1] + g.n[2] + g.n[3], gr = judged ? osuGrade(g.n) : 'SS';
      const bw = por ? W - 56 : 440, bx = 28, by = 30;
      c.save();
      c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.roundRect(bx - 4, by - 4, bw + 8, 26, 13); c.fill();
      const hp = clamp(g.hpv, 0, 1), low = hp < .25 && Math.floor(performance.now() / 160) % 2;
      const gr2 = c.createLinearGradient(bx, 0, bx + bw, 0); gr2.addColorStop(0, '#ff5f6d'); gr2.addColorStop(.35, '#ffd23f'); gr2.addColorStop(1, '#7dff9e');
      c.fillStyle = low ? '#ff2f4a' : gr2; c.beginPath(); c.roundRect(bx, by, Math.max(10, bw * hp), 18, 9); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.roundRect(bx + 2, by + 2, Math.max(6, bw * hp - 4), 5, 3); c.fill();
      const pr = clamp((T - g.firstT) / Math.max(1, g.lastE - g.firstT), 0, 1);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(bx, by + 30, bw, 4); c.fillStyle = '#fff'; c.fillRect(bx, by + 30, bw * pr, 4);
      c.restore();
      txt(c, String(Math.round(g.score)).padStart(8, '0'), W - 28, por ? 106 : 38, por ? 70 : 52, '#fff', 'right', 8);
      txt(c, acc.toFixed(2) + '%', W - 28, por ? 164 : 90, por ? 36 : 30, '#e7e0ff', 'right', 6);
      txt(c, gr, W - 28 - (por ? 200 : 150), por ? 164 : 90, por ? 36 : 30, osuGradeCol(gr), 'right', 6);
      const ms = OSU_MODS.filter(m => g.mods[m.k]).map(m => m.k).join(' ');
      if (ms) txt(c, ms, W - 28, por ? 210 : 128, por ? 26 : 22, '#ffd23f', 'right', 5);
      if (g.auto) txt(c, 'AUTOPLAY', W / 2, por ? 70 : 24, 24, '#6fd8ff', 'center', 6);
      const cp = Math.max(0, 1 - (performance.now() - g.cpop) / 160);
      if (g.combo > 0) txt(c, g.combo + 'x', 30, H - (por ? 44 : 40), (por ? 64 : 60) * (1 + cp * .22), '#fff', 'left', 9);
      const ew = por ? 300 : 340, ex = W / 2, ey = H - (por ? 54 : 36), sc2 = ew / 2 / E.w5;
      c.save();
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(ex - ew / 2, ey - 6, ew, 12);
      c.fillStyle = 'rgba(255,179,71,.55)'; c.fillRect(ex - ew / 2, ey - 6, ew, 12);
      c.fillStyle = 'rgba(125,255,158,.6)'; c.fillRect(ex - E.w1 * sc2, ey - 6, E.w1 * sc2 * 2, 12);
      c.fillStyle = 'rgba(111,216,255,.75)'; c.fillRect(ex - E.w3 * sc2, ey - 6, E.w3 * sc2 * 2, 12);
      const nowP = performance.now();
      for (let i = g.errs.length - 1; i >= 0 && nowP - g.errT[i] < 4000; i--) {
        const al = clamp(1.4 - (nowP - g.errT[i]) / 2800, 0, 1);
        c.globalAlpha = al; c.fillStyle = g.errJ[i] === 0 ? '#e6fbff' : g.errJ[i] === 1 ? '#d6ffe0' : '#ffe2b5';
        c.fillRect(ex + g.errs[i] / 1000 * sc2 - 1.5, ey - 14, 3, 28);
      }
      c.globalAlpha = 1;
      if (g.errs.length) { const n = Math.min(10, g.errs.length); let s2 = 0; for (let i = 1; i <= n; i++) s2 += g.errs[g.errs.length - i]; const mx = ex + s2 / n / 1000 * sc2; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(mx, ey - 8); c.lineTo(mx - 6, ey - 20); c.lineTo(mx + 6, ey - 20); c.closePath(); c.fill(); }
      c.fillStyle = '#fff'; c.fillRect(ex - 1, ey - 10, 2, 20);
      c.restore();
    }

    function render() {
      if (G && ['play', 'pause', 'resume', 'fail', 'res'].includes(S.scr)) { drawPlay(); return; }
      if (S.scr === 'cal') { c.fillStyle = '#120a26'; c.fillRect(0, 0, W, H); return; }
      drawMenuBG();
    }
    api.loop(dt => {
      audio.tick();
      update(dt);
      render();
    });

    const setPos = e => { const p = toLocal(e); inp.x = (p.x - FX) / SC; inp.y = (p.y - FY) / SC; inp.seen = performance.now(); };
    const kd = e => {
      unlock();
      if (S.scr === 'cal') return;
      if (S.scr === 'play') {
        if (e.code === 'Escape') { e.preventDefault(); pauseGame(); return; }
        if (e.code === 'Space') { e.preventDefault(); skip(); return; }
        if (e.code === 'KeyZ' || e.code === 'KeyX') { e.preventDefault(); if (e.repeat) return; inp[e.code === 'KeyZ' ? 'kz' : 'kx'] = 1; inp.touch = 0; click(e.timeStamp); }
        return;
      }
      if (S.scr === 'pause') { if (e.code === 'Escape') { e.preventDefault(); resumeGame(); } return; }
      if (S.scr === 'resume') { e.preventDefault(); return; }
      if (e.code === 'Escape') { e.preventDefault(); if (S.scr === 'menu') return; if (S.scr === 'sel' || S.scr === 'opts') { act('back'); return; } if (S.scr === 'fail' || S.scr === 'res') act('quit'); return; }
      if (S.scr === 'sel' && /^Digit[1-6]$/.test(e.code)) { e.preventDefault(); act('mod:' + OSU_MODS[+e.code.slice(5) - 1].k); return; }
      const list = focusables();
      if (!list.length) return;
      const el = list[S.fi] || list[0];
      if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); audio.sfx('tick'); setFocus(S.fi + 1); }
      else if (e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); audio.sfx('tick'); setFocus(S.fi - 1); }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); if (el.dataset.l) act(el.dataset.l, el); else { audio.sfx('tick'); setFocus(S.fi - 1); } }
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') { e.preventDefault(); if (el.dataset.r) act(el.dataset.r, el); else { audio.sfx('tick'); setFocus(S.fi + 1); } }
      else if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) { const a = el.dataset.a; if (a) act(a, el); } }
    };
    const ku = e => { if (e.code === 'KeyZ') inp.kz = 0; else if (e.code === 'KeyX') inp.kx = 0; };
    api.on(window, 'keydown', kd, true);
    api.on(window, 'keyup', ku, true);
    api.on(ui, 'click', e => {
      unlock();
      const t = e.target.closest('[data-a]');
      if (!t || !ui.contains(t)) return;
      const list = focusables(), i = list.indexOf(t.closest('.fo-b'));
      if (i >= 0 && t.dataset.a.indexOf('o:') !== 0 && !t.dataset.a.startsWith('mod:') && !t.dataset.a.startsWith('d:')) { S.fi = i; list.forEach((x, k) => x.classList.toggle('on', k === i)); }
      act(t.dataset.a, t);
    });
    api.on(canvas, 'contextmenu', e => e.preventDefault());
    api.on(canvas, 'pointermove', e => { inp.touch = e.pointerType === 'touch' ? 1 : 0; setPos(e); });
    api.on(canvas, 'pointerdown', e => {
      unlock();
      if (S.scr !== 'play' || !G) return;
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      inp.touch = e.pointerType === 'touch' ? 1 : 0;
      setPos(e);
      if (inp.touch) { inp.p[e.pointerId] = 1; inp.np = Object.keys(inp.p).length; } else inp.m++;
      click(e.timeStamp);
    });
    const up = e => { if (inp.p[e.pointerId]) { delete inp.p[e.pointerId]; inp.np = Object.keys(inp.p).length; } else if (e.pointerType !== 'touch' && inp.m > 0) inp.m--; };
    api.on(canvas, 'pointerup', up);
    api.on(canvas, 'pointercancel', up);
    const autoPause = () => { inp.kz = inp.kx = 0; inp.m = 0; inp.p = {}; inp.np = 0; if (S.scr === 'play' && G && G.state === 'play') pauseGame(); };
    api.on(window, 'blur', autoPause);
    api.on(document, 'visibilitychange', () => { if (document.hidden) autoPause(); });

    (window.__gpdbg = window.__gpdbg || {}).osu = { S: () => S, G: () => G, audio, sv, O, act, inp, click, show, W, H, SC, FX, FY, songT };
    show('menu');
    return {
      destroy() {
        if (calOff) calOff();
        audio.close();
      }
    };
  }


  Ameplay.covers.osu = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="os-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0f4e"/><stop offset=".6" stop-color="#8a2a82"/><stop offset="1" stop-color="#ff66ab"/></linearGradient><radialGradient id="os-c1" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffc2e0"/><stop offset=".6" stop-color="#ff66ab"/><stop offset="1" stop-color="#b3306f"/></radialGradient><radialGradient id="os-c2" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#c8f2ff"/><stop offset=".6" stop-color="#47c8ff"/><stop offset="1" stop-color="#1f7fb0"/></radialGradient><radialGradient id="os-c3" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d8ffd0"/><stop offset=".6" stop-color="#7dff9e"/><stop offset="1" stop-color="#2f9a52"/></radialGradient></defs><rect width="400" height="300" fill="url(#os-bg)"/><g fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"><path d="M30 60l22 40H8z"/><circle cx="350" cy="50" r="26"/><rect x="330" y="200" width="46" height="46" transform="rotate(20 353 223)"/><circle cx="60" cy="240" r="20"/><path d="M200 20l16 28h-32z"/></g><path d="M200 210C250 150 300 250 340 170" fill="none" stroke="#fff" stroke-width="46" stroke-linecap="round" stroke-opacity=".95"/><path d="M200 210C250 150 300 250 340 170" fill="none" stroke="#1a0b36" stroke-width="40" stroke-linecap="round"/><path d="M200 210C250 150 300 250 340 170" fill="none" stroke="#47c8ff" stroke-opacity=".3" stroke-width="40" stroke-linecap="round"/><circle cx="272" cy="198" r="23" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3"/><circle cx="272" cy="198" r="19" fill="url(#os-c2)" stroke="#fff" stroke-width="4"/><circle cx="200" cy="210" r="23" fill="url(#os-c2)" stroke="#fff" stroke-width="5"/><text x="200" y="219" text-anchor="middle" font-family="Trebuchet MS,Arial" font-weight="900" font-size="26" fill="#fff" stroke="#1c1130" stroke-width="2" paint-order="stroke">2</text><circle cx="110" cy="130" r="64" fill="none" stroke="#fff" stroke-width="5" stroke-opacity=".75"/><circle cx="110" cy="130" r="40" fill="url(#os-c1)" stroke="#fff" stroke-width="7"/><text x="110" y="145" text-anchor="middle" font-family="Trebuchet MS,Arial" font-weight="900" font-size="46" fill="#fff" stroke="#1c1130" stroke-width="3" paint-order="stroke">1</text><circle cx="318" cy="96" r="30" fill="url(#os-c3)" stroke="#fff" stroke-width="5"/><text x="318" y="108" text-anchor="middle" font-family="Trebuchet MS,Arial" font-weight="900" font-size="32" fill="#fff" stroke="#1c1130" stroke-width="2" paint-order="stroke">3</text><circle cx="318" cy="96" r="48" fill="none" stroke="#7dff9e" stroke-width="4" stroke-opacity=".8"/><g transform="translate(150 178)"><circle r="14" fill="#ff66ab" fill-opacity=".5" stroke="#fff" stroke-width="3"/><circle r="3" fill="#fff"/></g></svg>`;

  (window.__gpdbg = window.__gpdbg || {}).olib = { osuMap, osuEff, osuPrep, OSU_SONGS };

  Ameplay.register({
    id: 'osu',
    title: 'osu!',
    category: 'Skill',
    tint: '#ff66ab',
    blurb: 'Click the circles to the beat: sliders, spinners, eight original beatmaps in four difficulties, mods and a hit-error meter.',
    help: 'Move the mouse and click the circles with <kbd>Z</kbd> <kbd>X</kbd> or the mouse buttons · hold and follow sliders · spin the spinners · tap and drag on a phone · <kbd>Space</kbd> skip · <kbd>Esc</kbd> pause · mods EZ HR DT HD NF Auto on song select · calibrate the audio offset in Options',
    better: 'high',
    width: 980,
    ownPause: true,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="11"/><circle cx="24" cy="26" r="19" opacity=".5"/><path d="M36 42c6-2 10 4 16-2" stroke-width="5" opacity=".6"/><circle cx="52" cy="40" r="3"/></svg>',
    css: OSU_CSS,
    mount: mountOsu
  });

})();
