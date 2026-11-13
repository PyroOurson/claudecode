function lsSound(api) {
  let ac = null, mg = null, nb = null;
  const ctx = () => {
    if (api.muted) return null;
    try {
      if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); mg = ac.createGain(); mg.gain.value = .9; mg.connect(ac.destination); }
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    } catch (e) { return null; }
  };
  const tone = (f, d, type, v, t0, f2) => {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + (t0 || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .08, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(mg); o.start(t); o.stop(t + d + .05);
  };
  const noise = (d, v, f, t0, f2) => {
    const c = ctx(); if (!c) return;
    if (!nb) { const n = Math.floor(c.sampleRate * 1.5); nb = c.createBuffer(1, n, c.sampleRate); const a = nb.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (t0 || 0);
    s.buffer = nb; fl.type = 'lowpass'; fl.frequency.setValueAtTime(f || 900, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .12, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(fl).connect(g).connect(mg); s.start(t); s.stop(t + d + .05);
  };
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
  return {
    tap() { tone(660, .05, 'triangle', .04); },
    key() { tone(1400 + Math.random() * 200, .018, 'square', .008); },
    tick(urgent) { tone(urgent ? 1180 : 880, .05, 'square', urgent ? .035 : .02); },
    count(go) { tone(go ? 988 : 659, go ? .22 : .12, 'triangle', .06); },
    no() { tone(196, .16, 'sawtooth', .045); tone(147, .2, 'sawtooth', .035, .07); },
    rude() { tone(130, .25, 'square', .04); },
    lock() { tone(740, .08, 'triangle', .06); tone(1110, .12, 'triangle', .05, .06); },
    tier(i) {
      const n = 2 + i;
      for (let k = 0; k < n; k++) tone(NOTES[Math.min(NOTES.length - 1, k + (i > 2 ? 1 : 0))], .22 + k * .02, 'triangle', .05, k * .075);
      if (i >= 5) { tone(2093, .6, 'sine', .04, n * .075); tone(1568, .7, 'sine', .03, n * .075 + .05); }
    },
    burn(i) { noise(.7 + i * .15, .1 + i * .02, 500, 0, 120); tone(70, .6 + i * .1, 'sine', .07, 0, 45); },
    miss() { tone(392, .18, 'triangle', .05); tone(311, .24, 'triangle', .045, .14); tone(233, .34, 'triangle', .04, .3); },
    pass() { tone(330, .14, 'triangle', .04); tone(262, .2, 'triangle', .035, .1); },
    milestone() { tone(1568, .4, 'sine', .035); tone(2093, .5, 'sine', .025, .08); },
    fanfare() { [523.25, 659.25, 783.99, 1046.5].forEach((f, k) => tone(f, .35, 'triangle', .055, k * .11)); tone(1046.5, .8, 'sine', .04, .5); },
    win() { [659.25, 783.99, 987.77, 1318.5].forEach((f, k) => tone(f, .3, 'square', .03, k * .1)); },
    lose() { [440, 392, 349.23, 293.66].forEach((f, k) => tone(f, .3, 'triangle', .045, k * .13)); },
    fuel() { tone(523.25, .12, 'sine', .05); tone(1046.5, .2, 'sine', .05, .1); },
    close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
  };
}
