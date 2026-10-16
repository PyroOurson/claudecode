
  function mkAudio(api) {
    let ctx = null, master = null, sfx = null, mus = null, nb = null, jetN = null, musOn = false, nextT = 0, step16 = 0;
    const AC = window.AudioContext || window.webkitAudioContext;
    function ensure() {
      if (!AC) return false;
      if (!ctx) {
        try {
          ctx = new AC();
          master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
          sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(master);
          mus = ctx.createGain(); mus.gain.value = 0; mus.connect(master);
          const n = ctx.sampleRate; nb = ctx.createBuffer(1, n, n); const d = nb.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ctx = null; return false; }
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return true;
    }
    function tone(type, f0, f1, t, dur, vol, out, attack) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out || sfx); o.start(t); o.stop(t + dur + 0.02);
    }
    function noise(t, dur, vol, ftype, f0, f1, q, out) {
      const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = ftype || 'lowpass'; f.frequency.setValueAtTime(f0 || 1000, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out || sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
    }
    const S = {
      coin: t => { tone('sine', 1568, 1568, t, 0.07, 0.16); tone('sine', 2093, 2093, t + 0.05, 0.14, 0.14); },
      jump: t => { tone('triangle', 260, 620, t, 0.16, 0.18); noise(t, 0.16, 0.08, 'bandpass', 900, 2600, 1.2); },
      roll: t => { noise(t, 0.3, 0.2, 'lowpass', 1800, 300, 1); tone('sine', 220, 110, t, 0.2, 0.1); },
      lane: t => noise(t, 0.09, 0.06, 'bandpass', 1500, 3000, 1.5),
      land: t => tone('sine', 120, 60, t, 0.1, 0.18),
      land_hard: t => { tone('sine', 110, 45, t, 0.16, 0.28); noise(t, 0.1, 0.1, 'lowpass', 600, 200); },
      bump: t => { tone('square', 160, 70, t, 0.18, 0.12); noise(t, 0.15, 0.2, 'lowpass', 900, 200); },
      crash: t => { noise(t, 0.6, 0.45, 'lowpass', 2500, 120); tone('sine', 90, 30, t, 0.5, 0.45); tone('square', 300, 80, t, 0.25, 0.08); },
      caught: t => { for (let i = 0; i < 6; i++) tone('sine', 2800, 2600, t + i * 0.07, 0.06, 0.08); },
      pu: t => { [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, t + i * 0.06, 0.16, 0.16)); },
      key: t => { [1318, 1760, 2637].forEach((f, i) => tone('sine', f, f, t + i * 0.07, 0.3, 0.12)); },
      mbox: t => { [392, 523, 659, 784, 1046].forEach((f, i) => tone('square', f, f, t + i * 0.05, 0.12, 0.06)); },
      board_on: t => { tone('sawtooth', 200, 900, t, 0.35, 0.08); tone('sine', 400, 1600, t, 0.35, 0.12); },
      board_break: t => { noise(t, 0.4, 0.4, 'highpass', 800, 3000, 0.8); tone('square', 600, 90, t, 0.3, 0.1); },
      board_end: t => tone('sine', 900, 300, t, 0.3, 0.08),
      horn: t => { for (const f of [311, 370]) tone('sawtooth', f, f * 0.98, t, 0.75, 0.035, null, 0.05); },
      jet_end: t => tone('sine', 700, 200, t, 0.4, 0.1),
      mission: t => { [784, 988, 1175, 1568].forEach((f, i) => tone('triangle', f, f, t + i * 0.09, 0.25, 0.14)); },
      ui: t => tone('sine', 880, 1200, t, 0.06, 0.1),
      buy: t => { tone('sine', 1046, 1046, t, 0.08, 0.12); tone('sine', 1568, 1568, t + 0.07, 0.18, 0.12); }
    };
    const BASS = [43, 0, 0, 43, 0, 0, 46, 0, 41, 0, 0, 41, 0, 38, 0, 0];
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    function schedule() {
      const spb = 60 / 96 / 4;
      while (nextT < ctx.currentTime + 0.15) {
        const t = nextT, k = step16 % 16, bar = (step16 >> 4) % 4;
        if (k === 0 || k === 7 || k === 10) { tone('sine', 140, 45, t, 0.22, 0.42, mus); }
        if (k === 4 || k === 12) { noise(t, 0.16, 0.32, 'bandpass', 1800, 900, 0.7, mus); tone('triangle', 220, 140, t, 0.08, 0.12, mus); }
        if (k % 2 === 0) noise(t, 0.04, k % 4 === 2 ? 0.12 : 0.06, 'highpass', 7000, 0, 1, mus);
        const bn = BASS[k]; if (bn) tone('square', midi(bn + (bar === 3 ? 2 : 0)), midi(bn + (bar === 3 ? 2 : 0)), t, spb * 1.8, 0.07, mus, 0.01);
        if (k === 0 && bar % 2 === 0) [67, 70, 74].forEach(n => tone('triangle', midi(n), midi(n), t, spb * 6, 0.02, mus, 0.02));
        nextT += spb; step16++;
      }
    }
    return {
      unlock() { if (!api.muted) ensure(); },
      play(name) { if (api.muted || !S[name] || !ensure() || ctx.state === 'closed') return; try { S[name](ctx.currentTime + 0.005); } catch (e) {} },
      music(on) { musOn = on; },
      jet(on) {
        if (!ctx) return;
        if (on && !jetN && !api.muted) {
          const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = ctx.createGain(); g.gain.value = 0.12;
          s.connect(f); f.connect(g); g.connect(sfx); s.start(); jetN = { s, g };
        } else if (!on && jetN) { try { jetN.g.gain.setTargetAtTime(0, ctx.currentTime, 0.08); jetN.s.stop(ctx.currentTime + 0.3); } catch (e) {} jetN = null; }
      },
      tick() {
        if (!ctx || ctx.state !== 'running') return;
        if (api.muted) { if (jetN) this.jet(false); mus.gain.value = 0; return; }
        const target = musOn ? 0.55 : 0;
        mus.gain.value += (target - mus.gain.value) * 0.05;
        if (mus.gain.value > 0.01) { if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05; schedule(); }
      },
      close() { try { if (jetN) jetN.s.stop(); } catch (e) {} try { ctx && ctx.close(); } catch (e) {} ctx = null; }
    };
  }
