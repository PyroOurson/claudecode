    let AC = null, master = null, NBUF = null, musicBus = null, musicT = 600, discT = null;
    function ac() {
      if (AC) return AC;
      try {
        const A = window.AudioContext || window.webkitAudioContext; if (!A) return null;
        AC = new A(); master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
        NBUF = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = NBUF.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = RNG() * 2 - 1;
        musicBus = AC.createGain(); const dl = AC.createDelay(), fb = AC.createGain(); dl.delayTime.value = .34; fb.gain.value = .3;
        musicBus.connect(master); musicBus.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);
      } catch (e) { AC = null; }
      return AC;
    }
    const env = (gn, t, a, d, v) => { gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(v, t + a); gn.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
    function nzS(dur, vol, type, f, q, dt, f2, out) {
      const t = AC.currentTime + (dt || 0), s = AC.createBufferSource(), fl = AC.createBiquadFilter(), gn = AC.createGain();
      s.buffer = NBUF; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
      env(gn, t, .004, dur, vol); s.connect(fl); fl.connect(gn); gn.connect(out || master); s.start(t, RNG() * .5); s.stop(t + dur + .05);
    }
    function tnS(type, f0, f1, dur, vol, dt, cut, out) {
      const t = AC.currentTime + (dt || 0), o = AC.createOscillator(), gn = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      env(gn, t, .005, dur, vol);
      if (cut) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); fl.connect(gn); } else o.connect(gn);
      gn.connect(out || master); o.start(t); o.stop(t + dur + .05);
    }
    const MATC = { stone: 's', deepslate: 's', netherrack: 'r', basalt: 's', nether_bricks: 's', copper: 'm', metal: 'm', anvil: 'm', lantern: 'm', chain: 'm', heavy_core: 'm', lodestone: 's', mud_bricks: 's', resin: 'g', wood: 'w', bamboo: 'w', cherry: 'w', nether_wood: 'w', ladder: 'w', scaffold: 'w', grass: 'g', plant: 'g', crop: 'g', vine: 'g', azalea: 'g', moss: 'g', wart: 'g', cherry_leaves: 'g', azalea_leaves: 'g', fungus: 'g', slime: 'q', honey: 'q', gravel: 'r', mud: 'r', soul: 'r', nylium: 'r', sand: 'a', snow: 'a', glass: 'l', amethyst: 'l', froglight: 'l', wool: 'c', candle: 'c', decorated_pot: 's', sculk: 'c', coral: 'c', bone: 's', creaking_heart: 'w' };
    function matSnd(m, kind, pos, v) {
      if (api.muted || !SET.sound || !ac()) return;
      let vol = [.08, .07, .22][kind] * (v ?? 1);
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 16) return; vol *= 1 - d / 16; }
      const c = MATC[m] || 's', dur = [.07, .06, .16][kind], r = .85 + RNG() * .3;
      if (c === 'g') nzS(dur, vol, 'lowpass', 2600 * r, .6);
      else if (c === 'r') { nzS(dur, vol, 'bandpass', 900 * r, .8); if (kind === 2) nzS(dur * .7, vol * .7, 'bandpass', 1400 * r, 1, .05); }
      else if (c === 's') { nzS(dur * .8, vol, 'bandpass', 1900 * r, 1.4); if (kind === 2) tnS('square', 180 * r, 90, .06, vol * .2); }
      else if (c === 'm') { nzS(dur * .6, vol * .8, 'bandpass', 3200 * r, 3); tnS('triangle', 900 * r, 700, dur, vol * .3); }
      else if (c === 'w') { nzS(dur, vol, 'lowpass', 850 * r, 1); tnS('triangle', 150 * r, 80, dur, vol * .7); }
      else if (c === 'a') nzS(dur * 1.3, vol * .8, 'highpass', 1500 * r, .5);
      else if (c === 'c') nzS(dur * 1.2, vol * .7, 'lowpass', 700 * r, .5);
      else if (c === 'q') { tnS('sine', 300 * r, 150, dur * 1.5, vol * .6); nzS(dur, vol * .4, 'lowpass', 600, 1); }
      else if (c === 'l') { if (kind === 2) { nzS(.25, vol, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f * r, f * r * .9, .12, vol * .3, i * .03)); } else nzS(dur, vol, 'bandpass', 2500, 2); }
    }
    function snd(name, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = 1;
      if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 20) return; v = 1 - d / 20; }
      if (pos && NET.role === 'host' && pos !== P) netSend({ t: 'snd', n: name, x: +pos.x.toFixed(1), y: +pos.y.toFixed(1), z: +pos.z.toFixed(1) });
      const r = .9 + RNG() * .2;
      switch (name) {
        case 'hurt': tnS('triangle', 340 * r, 160, .17, .3); nzS(.1, .12, 'bandpass', 700, 1.5); break;
        case 'fall_small': nzS(.12, .22, 'lowpass', 500, .7); tnS('triangle', 260, 140, .12, .2); break;
        case 'fall_big': nzS(.2, .3, 'lowpass', 380, .7); tnS('triangle', 200, 90, .2, .28); break;
        case 'pop': tnS('sine', 900 * r, 1700 * r, .06, .12); break;
        case 'orb': tnS('sine', 1900 * r, 2300 * r, .1, .07); tnS('sine', 2800 * r, 3100, .08, .04, .03); break;
        case 'click': tnS('square', 1500, 1400, .02, .05 * v); nzS(.02, .05 * v, 'highpass', 3000, .5); break;
        case 'pig': tnS('square', 330 * r, 230 * r, .12, .08 * v, 0, 1300); tnS('square', 300 * r, 210 * r, .1, .07 * v, .16, 1300); break;
        case 'pig_hurt': tnS('square', 420 * r, 300 * r, .14, .1 * v, 0, 1600); break;
        case 'pig_death': tnS('square', 380 * r, 140 * r, .4, .1 * v, 0, 1400); break;
        case 'cow': tnS('sawtooth', 135 * r, 104 * r, .9, .15 * v, 0, 600); break;
        case 'cow_hurt': tnS('sawtooth', 180 * r, 130 * r, .3, .15 * v, 0, 700); break;
        case 'cow_death': tnS('sawtooth', 160 * r, 80 * r, .7, .15 * v, 0, 600); break;
        case 'sheep': tnS('sawtooth', 300 * r, 280 * r, .5, .08 * v, 0, 1200); tnS('sine', 7 * r, 7, .5, .0); break;
        case 'sheep_hurt': case 'sheep_death': tnS('sawtooth', 360 * r, 260 * r, .3, .1 * v, 0, 1400); break;
        case 'chicken': tnS('square', 900 * r, 1100 * r, .06, .05 * v, 0, 3000); tnS('square', 1000 * r, 900 * r, .06, .05 * v, .09, 3000); break;
        case 'chicken_hurt': case 'chicken_death': tnS('square', 1200 * r, 700 * r, .12, .07 * v, 0, 3000); break;
        case 'zombie': tnS('sawtooth', 95 * r, 72 * r, .75, .14 * v, 0, 700); tnS('sawtooth', 97 * r, 75 * r, .7, .08 * v, .05, 500); break;
        case 'zombie_hurt': tnS('sawtooth', 150 * r, 90, .25, .16 * v, 0, 900); break;
        case 'zombie_death': tnS('sawtooth', 120 * r, 50, .7, .16 * v, 0, 700); break;
        case 'skeleton': case 'skeleton_hurt': case 'skeleton_death': for (let i = 0; i < 5; i++) nzS(.03, .09 * v, 'bandpass', 2600 * r, 4, i * .05); break;
        case 'creeper_hurt': case 'creeper_death': nzS(.2, .1 * v, 'bandpass', 1200, 1); break;
        case 'creeper': break;
        case 'spider': nzS(.25, .06 * v, 'bandpass', 3500 * r, 3); break;
        case 'spider_hurt': case 'spider_death': nzS(.2, .1 * v, 'bandpass', 2800 * r, 2); tnS('sawtooth', 600, 300, .15, .05 * v); break;
        case 'enderman': tnS('sine', 120 * r, 80, .6, .08 * v); break;
        case 'enderman_hurt': case 'enderman_death': case 'enderman_scream': tnS('sawtooth', 500 * r, 900 * r, .5, .1 * v, 0, 2000); break;
        case 'slime': case 'slime_hurt': case 'slime_death': tnS('sine', 200 * r, 90, .15, .14 * v); break;
        case 'poof': nzS(.3, .14 * v, 'lowpass', 1300, .5); break;
        case 'bow': nzS(.16, .12 * v, 'highpass', 1200, .7, 0, 4000); break;
        case 'arrow_hit': nzS(.08, .14 * v, 'lowpass', 900, 1); break;
        case 'arrow_land': tnS('square', 320, 150, .05, .07 * v); break;
        case 'throw': nzS(.15, .08, 'highpass', 900, .7, 0, 3000); break;
        case 'eat': nzS(.07, .16, 'bandpass', 1500 * r, 1.2); break;
        case 'drink': tnS('sine', 300 * r, 500 * r, .08, .1); break;
        case 'burp': tnS('sawtooth', 120, 70, .25, .14, 0, 500); break;
        case 'splash': nzS(.45, .2, 'lowpass', 1800, .5, 0, 400); break;
        case 'tbreak': tnS('square', 900, 300, .08, .1); nzS(.1, .1, 'highpass', 2500, .5); break;
        case 'levelup': [523, 659, 784, 1047].forEach((f, i) => tnS('sine', f, f, .22, .08, i * .08)); break;
        case 'hit_weak': nzS(.05, .1 * v, 'lowpass', 1000, 1); break;
        case 'hit_strong': nzS(.06, .16 * v, 'lowpass', 900, 1); tnS('triangle', 200, 90, .07, .1 * v); break;
        case 'crit': nzS(.08, .18 * v, 'bandpass', 2400, 1); tnS('triangle', 260, 100, .09, .12 * v); break;
        case 'fuse': nzS(1.4, .1 * v, 'highpass', 3000, .5); break;
        case 'explode': nzS(1.4, .55 * Math.max(.3, v), 'lowpass', 600, .7, 0, 60); tnS('sine', 80, 30, 1, .4 * Math.max(.3, v)); break;
        case 'door_open': case 'door_close': nzS(.12, .13 * v, 'lowpass', 900, 1); tnS('triangle', name === 'door_open' ? 160 : 120, 90, .1, .1 * v); break;
        case 'chest_open': tnS('triangle', 140, 90, .25, .1 * v); nzS(.2, .06 * v, 'lowpass', 800, 1); break;
        case 'chest_close': tnS('triangle', 120, 70, .12, .12 * v); break;
        case 'bucket_fill': case 'bucket_empty': nzS(.3, .15, 'lowpass', 1500, .8, 0, 500); break;
        case 'bucket_fill_lava': case 'bucket_empty_lava': nzS(.4, .15, 'lowpass', 600, .8, 0, 200); break;
        case 'fizz': nzS(.5, .1 * v, 'highpass', 2500, .6); break;
        case 'ignite': nzS(.15, .12, 'highpass', 2000, .8); tnS('square', 2000, 1500, .04, .04); break;
        case 'hoe': case 'shovel': nzS(.12, .14, 'bandpass', 900, .8); break;
        case 'strip': case 'scrape': case 'wax_off': nzS(.18, .14, 'bandpass', 1400, 1.5); break;
        case 'wax_on': nzS(.12, .1, 'lowpass', 1200, .5); break;
        case 'shear': nzS(.08, .12 * v, 'highpass', 3000, 2); nzS(.08, .1 * v, 'highpass', 3500, 2, .08); break;
        case 'milk': nzS(.3, .12, 'lowpass', 1000, .8); break;
        case 'teleport': tnS('sine', 300, 900, .4, .1 * v); break;
        case 'glass_break': nzS(.25, .14 * v, 'highpass', 3000, .7); [2100, 2700, 3400].forEach((f, i) => tnS('sine', f, f * .9, .12, .05 * v, i * .03)); break;
        case 'equip': nzS(.12, .1, 'bandpass', 1800, 1); tnS('triangle', 600, 500, .08, .05); break;
        case 'shield': tnS('triangle', 220, 120, .1, .15); nzS(.08, .12, 'lowpass', 800, 1); break;
        case 'totem': [392, 523, 659, 784].forEach((f, i) => tnS('triangle', f, f, .4, .08, i * .06)); break;
        case 'anvil_land': tnS('square', 600, 580, .4, .1 * v, 0, 3000); break;
        case 'piston_out': case 'piston_in': nzS(.12, .14 * v, 'lowpass', 600, 1); tnS('square', 110, 70, .1, .06 * v); break;
        case 'compost': nzS(.12, .1, 'lowpass', 700, 1); break;
        case 'bottle_fill': tnS('sine', 400, 900, .2, .08); break;
        case 'crossbow_load': tnS('square', 300, 600, .2, .06); break;
        case 'land': nzS(.12, .2, 'lowpass', 420, .7); break;
      }
    }
    const INSTR = { harp: ['sine', 1], bass: ['triangle', .25], snare: ['noise', 1], hat: ['noiseh', 1], basedrum: ['kick', 1], bell: ['sine', 4], flute: ['sine', 2], chime: ['triangle', 4], guitar: ['sawtooth', .5], xylophone: ['triangle', 2], iron_xylophone: ['square', 1], cow_bell: ['square', 2], didgeridoo: ['sawtooth', .25], bit: ['square', 1], banjo: ['sawtooth', 1], pling: ['triangle', 1] };
    function instrFor(s) { const t = TT[STT[s]], id = t.id; if (t.snd === 'wood' || t.snd === 'bamboo' || t.snd === 'cherry') return 'bass'; if (t.snd === 'sand' || id === 'gravel' || id.includes('concrete_powder')) return 'snare'; if (t.snd === 'glass' || id === 'glowstone' || id === 'sea_lantern') return id === 'glowstone' ? 'pling' : 'hat'; if (t.snd === 'stone' || t.snd === 'deepslate' || t.snd === 'netherrack') return 'basedrum'; if (id === 'gold_block') return 'bell'; if (id === 'clay') return 'flute'; if (id === 'packed_ice') return 'chime'; if (t.tags.has('wool')) return 'guitar'; if (id === 'bone_block') return 'xylophone'; if (id === 'iron_block') return 'iron_xylophone'; if (id === 'soul_sand') return 'cow_bell'; if (id === 'pumpkin') return 'didgeridoo'; if (id === 'emerald_block') return 'bit'; if (id === 'hay_block') return 'banjo'; return 'harp'; }
    function noteSnd(n, below, pos) {
      if (api.muted || !SET.sound || !ac()) return;
      let v = .14; if (pos) { const d = Math.hypot(pos.x - P.x, pos.y - P.y, pos.z - P.z); if (d > 48) return; v *= 1 - d / 48; }
      const ins = instrFor(below), [ty, mul] = INSTR[ins], f = 185 * Math.pow(2, (n - 12) / 12) * mul;
      if (ty === 'noise') nzS(.12, v, 'bandpass', 1500 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'noiseh') nzS(.05, v, 'highpass', 6000 * Math.pow(2, (n - 12) / 24), 1); else if (ty === 'kick') tnS('sine', 120 * Math.pow(2, (n - 12) / 24), 40, .2, v * 1.5);
      else { tnS(ty, f, f, .8, v, 0, ty === 'sawtooth' ? 2000 : 0); if (ty === 'sine') tnS('sine', f * 2, f * 2, .5, v * .2); }
    }
    function note(f, dt, v, out) {
      const t0 = AC.currentTime + dt;
      for (const [m, a] of [[1, 1], [2, .3], [3, .1]]) {
        const o = AC.createOscillator(), gn = AC.createGain();
        o.type = 'sine'; o.frequency.value = f * m; gn.gain.setValueAtTime(0.0001, t0); gn.gain.linearRampToValueAtTime(v * a, t0 + .012); gn.gain.exponentialRampToValueAtTime(.0001, t0 + 2.6 / m);
        o.connect(gn); gn.connect(out || musicBus); o.start(t0); o.stop(t0 + 2.7);
      }
    }
    function musicTick() {
      if (!SET.music || api.muted || !AC || (scr !== 'game' && scr !== 'title') || discT) return;
      if (--musicT > 0) return;
      musicT = 20 * (60 + RNG() * 120);
      const sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], base = [261.63, 220, 196, 233.08, 174.61][ri(5)];
      let t = .1, i = 4 + ri(3);
      for (let n = 0; n < 20; n++) {
        i = clamp(i + [-2, -1, -1, 0, 1, 1, 2][ri(7)], 0, sc.length - 1);
        const f = base * 2 ** (sc[i] / 12);
        note(f, t, .05); if (n % 4 === 0) note(f / 2, t, .04); if (n % 8 === 2) note(f * 1.5, t + .3, .025);
        t += [.6, 1.2, 1.2, 1.8, 2.4][ri(5)];
      }
    }
    function playDisc(name, x, y, z) {
      stopDisc(); if (!ac()) return;
      const R = rng(hstr(name)), sc = [0, 3, 5, 7, 10, 12, 15], base = 196 * Math.pow(2, R() * .5);
      const seq = []; let i = 3; for (let n = 0; n < 32; n++) { i = clamp(i + ri(3) - 1, 0, 6); seq.push(base * 2 ** (sc[i] / 12)); }
      let k = 0;
      discT = setInterval(() => { if (!api.alive || api.muted) return; const d = Math.hypot(x - P.x, y - P.y, z - P.z); if (d < 48) note(seq[k % 32], 0, .06 * (1 - d / 48), master); if (k % 4 === 0 && d < 48) note(seq[(k + 2) % 32] / 2, 0, .04 * (1 - d / 48), master); k++; }, 320);
    }
    function stopDisc() { if (discT) { clearInterval(discT); discT = null; } }
