  const P4 = ['facing', FACE4], P6 = ['facing', ['north', 'east', 'south', 'west', 'up', 'down']], PAX = ['axis', ['y', 'x', 'z']], PHALF = ['half', ['bottom', 'top']], POPEN = ['open', [false, true]], PPOW = ['powered', [false, true]], PLIT = ['lit', [false, true]];
  const fq = s => sv(s, 'facing');
  const C = (id, tex, o) => blk(id, Object.assign({ tex }, o));
  const pillarTiles = (side, top, bot) => s => {
    const a = sv(s, 'axis');
    if (a === 0) return [side, side, top, bot || top, side, side];
    if (a === 1) return [top, bot || top, [side, 1], [side, 1], [side, 1], [side, 1]];
    return [[side, 1], [side, 1], side, side, top, bot || top];
  };
  const pillar = (id, side, top, o) => blk(id, Object.assign({ props: [PAX], tiles: pillarTiles(side, top, o && o.bot) }, o));
  const facingTiles = (front, side, top, bot) => s => { const q = fq(s), t = [side, side, top, bot || top, side, side]; t[F4FACE[q]] = front; if (bot === 'rot') { t[3] = top; } return t; };
  const slabCB = s => { const v = sv(s, 'type'); return v === 2 ? FULLCB : v === 1 ? [cb(0, 8, 0, 16, 16, 16)] : [cb(0, 0, 0, 16, 8, 16)]; };
  function slab(id, base, o) {
    const tex = o && o.tex || base;
    return blk(id, Object.assign({ props: [['type', ['bottom', 'top', 'double']]], shape: s => sv(s, 'type') === 2 ? 'cube' : 'model', tex, model: s => { const v = sv(s, 'type'); return v === 1 ? [bx(0, 8, 0, 16, 16, 16, tex)] : [bx(0, 0, 0, 16, 8, 16, tex)]; }, coll: slabCB, att: s => sv(s, 'type') === 2 ? 15 : 0, slab: 1 }, o, { tex }));
  }
  const STAIR_SHAPES = ['straight', 'inner_left', 'inner_right', 'outer_left', 'outer_right'];
  function stairBoxes(tex, half, shape, q) {
    let b = [bx(0, 0, 0, 16, 8, 16, tex)];
    if (shape === 0) b.push(bx(0, 8, 0, 16, 16, 8, tex));
    else if (shape === 1) b.push(bx(0, 8, 0, 16, 16, 8, tex), bx(0, 8, 8, 8, 16, 16, tex));
    else if (shape === 2) b.push(bx(0, 8, 0, 16, 16, 8, tex), bx(8, 8, 8, 16, 16, 16, tex));
    else if (shape === 3) b.push(bx(0, 8, 0, 8, 16, 8, tex));
    else b.push(bx(8, 8, 0, 16, 16, 8, tex));
    if (half) b = flipY(b);
    return rotY(b, q);
  }
  function stairCB(half, shape, q) {
    let l = [cb(0, 0, 0, 16, 8, 16)];
    const up = shape === 0 ? [cb(0, 8, 0, 16, 16, 8)] : shape === 1 ? [cb(0, 8, 0, 16, 16, 8), cb(0, 8, 8, 8, 16, 16)] : shape === 2 ? [cb(0, 8, 0, 16, 16, 8), cb(8, 8, 8, 16, 16, 16)] : shape === 3 ? [cb(0, 8, 0, 8, 16, 8)] : [cb(8, 8, 0, 16, 16, 8)];
    l = l.concat(up);
    if (half) l = l.map(c => [c[0], 1 - c[4], c[2], c[3], 1 - c[1], c[5]]);
    return rotCB(l, q);
  }
  const isStair = s => !!TT[STT[s]].stair;
  function stairMask(s, nb) {
    const q = fq(s), h = sv(s, 'half');
    const d = F4D[q], back = nb(d[0], 0, d[1]);
    const take = (dq) => { const e = F4D[dq], n = nb(e[0], 0, e[1]); return !isStair(n) || fq(n) !== q || sv(n, 'half') !== h; };
    if (isStair(back) && sv(back, 'half') === h) { const bq = fq(back); if ((bq & 1) !== (q & 1) && take((bq + 2) & 3)) return bq === ((q + 3) & 3) ? 3 : 4; }
    const fr = nb(-d[0], 0, -d[1]);
    if (isStair(fr) && sv(fr, 'half') === h) { const fq2 = fq(fr); if ((fq2 & 1) !== (q & 1) && take(fq2)) return fq2 === ((q + 3) & 3) ? 1 : 2; }
    return 0;
  }
  function stairs(id, tex, o) {
    return blk(id, Object.assign({ props: [P4, PHALF], shape: 'cmodel', stair: 1, tex, cmask: stairMask, cmodel: (s, m) => stairBoxes(tex, sv(s, 'half'), m, fq(s)), ccoll: (s, m) => stairCB(sv(s, 'half'), m, fq(s)), att: 0 }, o));
  }
  const connSolid = s => FULLT[s] === 1;
  function fenceLike(id, tex, o, kind) {
    const post = kind === 'fence' ? [6, 10] : kind === 'wall' ? [4, 12] : [7, 9];
    const cls = o.cls || kind;
    const conn = (n, dir) => { const t = TT[STT[n]]; if (t.cls === cls || (kind === 'fence' && t.gate) || (kind !== 'fence' && (t.cls === 'pane' || t.cls === 'wall'))) return true; if (kind === 'wall' && t.gate) return true; return connSolid(n); };
    return blk(id, Object.assign({
      shape: 'cmodel', tex, cls, opq: false, att: 0,
      cmask: (s, nb) => { let m = 0; for (let q = 0; q < 4; q++) { const d = F4D[q]; if (conn(nb(d[0], 0, d[1]), q)) m |= 1 << q; } if (kind === 'wall') { const up = nb(0, 1, 0); if (up && SOL[up]) m |= 16; } return m; },
      cmodel: (s, m) => {
        const b = [];
        if (kind === 'fence') {
          b.push(bx(6, 0, 6, 10, 16, 10, tex));
          for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(7, 12, 0, 9, 15, 6, tex), bx(7, 6, 0, 9, 9, 6, tex)], q));
        } else if (kind === 'wall') {
          const straight = (m & 15) === 5 || (m & 15) === 10;
          if (!straight || m & 16) b.push(bx(4, 0, 4, 12, 16, 12, tex));
          for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(5, 0, 0, 11, 14, straight && !(m & 16) ? 8 : 4, tex)], q));
          if (straight && !(m & 16)) { const q = (m & 15) === 5 ? 0 : 1; b.length = 0; b.push(...rotY([bx(5, 0, 0, 11, 14, 16, tex)], q)); }
        } else {
          const ed = o.edge || tex;
          if (!(m & 15)) b.push(bx(7, 0, 7, 9, 16, 9, { side: tex, ud: ed }));
          else {
            b.push(bx(7, 0, 7, 9, 16, 9, { side: tex, ud: ed }, { no: 'ewsn' }));
            for (let q = 0; q < 4; q++) if (m & 1 << q) b.push(...rotY([bx(7, 0, 0, 9, 16, 7, { e: tex, w: tex, u: ed, d: ed, n: null, s: null })], q));
            for (let q = 0; q < 4; q++) if (!(m & 1 << q)) b.push(...rotY([bx(7, 0, 7, 9, 16, 9, { side: null, ud: null, n: tex })], q));
          }
        }
        return b;
      },
      ccoll: (s, m) => {
        const hh = kind === 'pane' ? 16 : 24, l = [cb(post[0], 0, post[0], post[1], hh, post[1])];
        for (let q = 0; q < 4; q++) if (m & 1 << q) l.push(...rotCB([cb(post[0] + (kind === 'wall' ? 1 : 0), 0, 0, post[1] - (kind === 'wall' ? 1 : 0), hh, 8)], q));
        return l;
      }
    }, o));
  }
  const fence = (id, tex, o) => fenceLike(id, tex, Object.assign({ hard: 2, tool: 'axe', snd: 'wood', flam: 1, cls: 'wfence', tags: ['fence'] }, o), 'fence');
  const wall = (id, tex, o) => fenceLike(id, tex, Object.assign({ tags: ['wall'] }, o), 'wall');
  const pane = (id, tex, edge, o) => fenceLike(id, tex, Object.assign({ edge, hard: .3, snd: 'glass', cls: 'pane', drop: null, tab: 'color' }, o), 'pane');
  function gate(id, tex, o) {
    return blk(id, Object.assign({
      props: [P4, POPEN, PPOW, ['in_wall', [false, true]]], shape: 'model', tex, gate: 1, opq: false, att: 0, hard: 2, tool: 'axe', snd: 'wood', flam: 1, use: 'gate',
      model: s => {
        const op = sv(s, 'open'), w = sv(s, 'in_wall') ? -3 : 0, q = fq(s);
        let b = [bx(0, 5 + w, 7, 2, 16 + w, 9, tex), bx(14, 5 + w, 7, 16, 16 + w, 9, tex)];
        if (!op) b.push(bx(6, 6 + w, 7, 8, 15 + w, 9, tex), bx(8, 6 + w, 7, 10, 15 + w, 9, tex), bx(2, 6 + w, 7, 6, 9 + w, 9, tex), bx(2, 12 + w, 7, 6, 15 + w, 9, tex), bx(10, 6 + w, 7, 14, 9 + w, 9, tex), bx(10, 12 + w, 7, 14, 15 + w, 9, tex));
        else b.push(bx(0, 6 + w, 13, 2, 15 + w, 15, tex), bx(14, 6 + w, 13, 16, 15 + w, 15, tex), bx(0, 6 + w, 9, 2, 9 + w, 13, tex), bx(0, 12 + w, 9, 2, 15 + w, 13, tex), bx(14, 6 + w, 9, 16, 9 + w, 13, tex), bx(14, 12 + w, 9, 16, 15 + w, 13, tex));
        return rotY(b, q);
      },
      coll: s => sv(s, 'open') ? [] : rotCB([cb(0, 0, 6, 16, 24, 10)], fq(s)),
      sel: s => rotCB([cb(0, 0, 6, 16, 16, 10)], fq(s))
    }, o));
  }
  function door(id, base, o) {
    const tt = base + '_door_top', tb = base + '_door_bottom';
    return blk(id, Object.assign({
      props: [P4, PHALF, POPEN, ['hinge', ['left', 'right']], PPOW], shape: 'model', opq: false, att: 0, hard: 3, tool: 'axe', snd: 'wood', use: 'door', door: 1, tab: 'build',
      model: s => {
        const q = fq(s), op = sv(s, 'open'), hr = sv(s, 'hinge'), up = sv(s, 'half'), t = up ? tt : tb;
        const r = op ? (hr ? q + 3 : q + 1) : q;
        const mir = (hr ^ op) === 1;
        const uvF = mir ? [16, 0, 0, 16] : [0, 0, 16, 16], uvB = mir ? [0, 0, 16, 16] : [16, 0, 0, 16];
        return rotY([bx(0, 0, 13, 16, 16, 16, t, { uv: { s: uvF, n: uvB, e: [13, 0, 16, 16], w: [13, 0, 16, 16], u: [0, 13, 16, 16], d: [0, 13, 16, 16] } })], r);
      },
      coll: s => { const q = fq(s), op = sv(s, 'open'), hr = sv(s, 'hinge'); return rotCB([cb(0, 0, 13, 16, 16, 16)], op ? (hr ? q + 3 : q + 1) : q); },
      drop: s => sv(s, 'half') ? null : id
    }, o));
  }
  function trapdoor(id, tex, o) {
    return blk(id, Object.assign({
      props: [P4, PHALF, POPEN, PPOW], shape: 'model', opq: false, att: 0, hard: 3, tool: 'axe', snd: 'wood', use: 'trapdoor', tex,
      model: s => { const op = sv(s, 'open'), up = sv(s, 'half'); if (op) return rotY([bx(0, 0, 13, 16, 16, 16, tex, { uv: { e: [13, 0, 16, 16], w: [0, 0, 3, 16], u: [0, 13, 16, 16], d: [0, 0, 16, 3] } })], fq(s)); return [up ? bx(0, 13, 0, 16, 16, 16, tex, { uv: { e: [0, 0, 16, 3], w: [0, 0, 16, 3], s: [0, 0, 16, 3], n: [0, 0, 16, 3] } }) : bx(0, 0, 0, 16, 3, 16, tex, { uv: { e: [0, 13, 16, 16], w: [0, 13, 16, 16], s: [0, 13, 16, 16], n: [0, 13, 16, 16] } })]; },
      coll: s => sv(s, 'open') ? rotCB([cb(0, 0, 13, 16, 16, 16)], fq(s)) : sv(s, 'half') ? [cb(0, 13, 0, 16, 16, 16)] : [cb(0, 0, 0, 16, 3, 16)]
    }, o));
  }
  const BTN_FACE = ['floor', 'wall', 'ceiling'];
  function button(id, tex, o) {
    return blk(id, Object.assign({
      props: [['face', BTN_FACE], P4, PPOW], shape: 'model', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', use: 'button', tex, tab: 'red', attach: 1, redstone: 1,
      model: s => { const p = sv(s, 'powered') ? 1 : 2, f = sv(s, 'face'), q = fq(s); if (f === 1) return rotY([bx(5, 6, 16 - p, 11, 10, 16, tex)], q); if (f === 0) return rotY([bx(5, 0, 6, 11, p, 10, tex)], q); return rotY([bx(5, 16 - p, 6, 11, 16, 10, tex)], q); },
      sel: s => { const f = sv(s, 'face'), q = fq(s); return f === 1 ? rotCB([cb(5, 6, 14, 11, 10, 16)], q) : f === 0 ? rotCB([cb(5, 0, 6, 11, 2, 10)], q) : rotCB([cb(5, 14, 6, 11, 16, 10)], q); }
    }, o));
  }
  function plate(id, tex, o) {
    return blk(id, Object.assign({
      props: [['power', [0, 1]]], shape: 'model', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', tex, tab: 'red', plate: 1, redstone: 1,
      model: s => [bx(1, 0, 1, 15, sv(s, 'power') ? .5 : 1, 15, tex)], sel: s => [cb(1, 0, 1, 15, 1, 15)]
    }, o));
  }
  const crossM = o => Object.assign({ shape: 'cross', opq: false, solid: false, att: 0, hard: 0, snd: 'grass', tab: 'nature', repl: false, plant: 1, sel: () => [cb(2, 0, 2, 14, 13, 14)] }, o);
  const plantB = (id, tex, o) => blk(id, crossM(Object.assign({ tex, icon: tex }, o)));
  function tallPlant(id, base, o) {
    return blk(id, crossM(Object.assign({ props: [PHALF], ctex: s => sv(s, 'half') ? base + '_top' : base + '_bottom', icon: o && o.icon || base + '_top', tall: 1, drop: s => sv(s, 'half') ? null : id }, o)));
  }
  function torchB(id, tex, light, o, wo) {
    const UVT = { uv: { e: [7, 6, 9, 16], w: [7, 6, 9, 16], s: [7, 6, 9, 16], n: [7, 6, 9, 16], u: [7, 6, 9, 8], d: [7, 14, 9, 16] } };
    const tx = s => o.ctexL && !sv(s, 'lit') ? tex + '_off' : tex;
    blk(id, Object.assign({ shape: 'model', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', light, tex, icon: tex, model: s => [bx(7, 0, 7, 9, 10, 9, tx(s), UVT)], sel: () => [cb(6, 0, 6, 10, 10, 10)], tab: 'func', attach: 1, torch: 1 }, o));
    blk('wall_' + id, Object.assign({
      props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', light, tex, item: id, name: title(id), torch: 1, attach: 1,
      model: s => { const B = bx(-1, 3.5, 7, 1, 13.5, 9, tx(s), UVT); B.rx = { ax: 'z', ang: -22.5, o: [0, 3.5, 8] }; return rotY([B], fq(s) + 3); },
      sel: s => rotCB([cb(0, 3, 5.5, 5, 13, 10.5)], fq(s) + 3), drop: id
    }, o, wo || {}, { tab: null, icon: null }));
  }
  const LV = { wood: 0, stone: 1, iron: 2, diamond: 3, netherite: 4 };
  const ore = (id, tex, lvl, o) => C(id, tex, Object.assign({ hard: id.startsWith('deepslate') ? 4.5 : 3, tool: 'pick', req: true, lvl, tab: 'nature', snd: id.startsWith('deepslate') ? 'deepslate' : 'stone' }, o));
  blk('air', { shape: 'none', opq: false, solid: false, att: 0, item: false, repl: true, hard: 0 });
  C('stone', 'stone', { hard: 1.5, tool: 'pick', req: true, drop: 'cobblestone', res: 6 });
  C('granite', 'granite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_granite', 'polished_granite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  C('diorite', 'diorite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_diorite', 'polished_diorite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  C('andesite', 'andesite', { hard: 1.5, tool: 'pick', req: true, res: 6 }); C('polished_andesite', 'polished_andesite', { hard: 1.5, tool: 'pick', req: true, res: 6 });
  blk('grass_block', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'grass_block_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['grass_block_side', 'grass_block_side', 'grass_block_top', 'dirt', 'grass_block_side', 'grass_block_side'], tint: s => sv(s, 'snowy') ? 0 : 1, hard: .6, tool: 'shovel', snd: 'grass', drop: 'dirt', tab: 'nature', icon3: 1 });
  C('dirt', 'dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  C('coarse_dirt', 'coarse_dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  blk('podzol', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'podzol_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['podzol_side', 'podzol_side', 'podzol_top', 'dirt', 'podzol_side', 'podzol_side'], hard: .5, tool: 'shovel', snd: 'gravel', drop: 'dirt', tab: 'nature' });
  C('rooted_dirt', 'rooted_dirt', { hard: .5, tool: 'shovel', snd: 'gravel', tab: 'nature' });
  C('mud', 'mud', { hard: .5, tool: 'shovel', snd: 'mud', tab: 'nature', coll: () => [cb(0, 0, 0, 16, 14, 16)] });
  blk('mycelium', { props: [['snowy', [false, true]]], tiles: s => sv(s, 'snowy') ? ['grass_block_snow', 'grass_block_snow', 'mycelium_top', 'dirt', 'grass_block_snow', 'grass_block_snow'] : ['mycelium_side', 'mycelium_side', 'mycelium_top', 'dirt', 'mycelium_side', 'mycelium_side'], hard: .6, tool: 'shovel', snd: 'grass', drop: 'dirt', tab: 'nature' });
  blk('dirt_path', { shape: 'model', tex: { top: 'dirt_path_top', side: 'dirt_path_side', bottom: 'dirt' }, model: () => [bx(0, 0, 0, 16, 15, 16, { u: 'dirt_path_top', d: 'dirt', side: 'dirt_path_side' })], coll: () => [cb(0, 0, 0, 16, 15, 16)], hard: .65, tool: 'shovel', snd: 'grass', drop: 'dirt', opq: false, att: 0, tab: 'nature' });
  blk('farmland', { props: [['moisture', [0, 1, 2, 3, 4, 5, 6, 7]]], shape: 'model', model: s => [bx(0, 0, 0, 16, 15, 16, { u: sv(s, 'moisture') === 7 ? 'farmland_moist' : 'farmland', d: 'dirt', side: 'dirt' })], coll: () => [cb(0, 0, 0, 16, 15, 16)], hard: .6, tool: 'shovel', snd: 'gravel', drop: 'dirt', opq: false, att: 0, tab: 'nature', icon: null });
  C('cobblestone', 'cobblestone', { hard: 2, tool: 'pick', req: true, res: 6 });
  C('mossy_cobblestone', 'mossy_cobblestone', { hard: 2, tool: 'pick', req: true, res: 6 });
  C('bedrock', 'bedrock', { hard: -1, item: true, tab: 'nature' });
  C('sand', 'sand', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', dust: [219, 207, 163] });
  C('suspicious_sand', 'suspicious_sand_0', { hard: .25, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', drop: null });
  C('red_sand', 'red_sand', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'nature', dust: [169, 88, 33] });
  C('gravel', 'gravel', { hard: .6, tool: 'shovel', snd: 'gravel', grav: 1, tab: 'nature', dust: [128, 124, 123], drop: (s, c) => [[RNG() < (c.fortune ? .25 : .1) && !c.silk ? 'flint' : 'gravel', 1]] });
  C('suspicious_gravel', 'suspicious_gravel_0', { hard: .25, tool: 'shovel', snd: 'gravel', grav: 1, tab: 'nature', drop: null });
  C('clay', 'clay', { hard: .6, tool: 'shovel', snd: 'gravel', tab: 'nature', drop: (s, c) => c.silk ? [['clay', 1]] : [['clay_ball', 4]] });
  ore('coal_ore', 'coal_ore', 0, { drop: (s, c) => c.silk ? [['coal_ore', 1]] : [['coal', 1]], xp: [0, 2] });
  ore('deepslate_coal_ore', 'deepslate_coal_ore', 0, { drop: (s, c) => c.silk ? [['deepslate_coal_ore', 1]] : [['coal', 1]], xp: [0, 2] });
  ore('iron_ore', 'iron_ore', 1, { drop: (s, c) => c.silk ? [['iron_ore', 1]] : [['raw_iron', 1]] });
  ore('deepslate_iron_ore', 'deepslate_iron_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_iron_ore', 1]] : [['raw_iron', 1]] });
  ore('copper_ore', 'copper_ore', 1, { drop: (s, c) => c.silk ? [['copper_ore', 1]] : [['raw_copper', rr(2, 5)]] });
  ore('deepslate_copper_ore', 'deepslate_copper_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_copper_ore', 1]] : [['raw_copper', rr(2, 5)]] });
  ore('gold_ore', 'gold_ore', 2, { drop: (s, c) => c.silk ? [['gold_ore', 1]] : [['raw_gold', 1]] });
  ore('deepslate_gold_ore', 'deepslate_gold_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_gold_ore', 1]] : [['raw_gold', 1]] });
  ore('redstone_ore', 'redstone_ore', 2, { drop: (s, c) => c.silk ? [['redstone_ore', 1]] : [['redstone', rr(4, 5)]], xp: [1, 5] });
  ore('deepslate_redstone_ore', 'deepslate_redstone_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_redstone_ore', 1]] : [['redstone', rr(4, 5)]], xp: [1, 5] });
  ore('emerald_ore', 'emerald_ore', 2, { drop: (s, c) => c.silk ? [['emerald_ore', 1]] : [['emerald', 1]], xp: [3, 7] });
  ore('deepslate_emerald_ore', 'deepslate_emerald_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_emerald_ore', 1]] : [['emerald', 1]], xp: [3, 7] });
  ore('lapis_ore', 'lapis_ore', 1, { drop: (s, c) => c.silk ? [['lapis_ore', 1]] : [['lapis_lazuli', rr(4, 9)]], xp: [2, 5] });
  ore('deepslate_lapis_ore', 'deepslate_lapis_ore', 1, { drop: (s, c) => c.silk ? [['deepslate_lapis_ore', 1]] : [['lapis_lazuli', rr(4, 9)]], xp: [2, 5] });
  ore('diamond_ore', 'diamond_ore', 2, { drop: (s, c) => c.silk ? [['diamond_ore', 1]] : [['diamond', 1]], xp: [3, 7] });
  ore('deepslate_diamond_ore', 'deepslate_diamond_ore', 2, { drop: (s, c) => c.silk ? [['deepslate_diamond_ore', 1]] : [['diamond', 1]], xp: [3, 7] });
  ore('nether_gold_ore', 'nether_gold_ore', 0, { hard: 3, snd: 'netherrack', drop: (s, c) => c.silk ? [['nether_gold_ore', 1]] : [['gold_nugget', rr(2, 6)]], xp: [0, 1] });
  ore('nether_quartz_ore', 'nether_quartz_ore', 0, { hard: 3, snd: 'netherrack', drop: (s, c) => c.silk ? [['nether_quartz_ore', 1]] : [['quartz', 1]], xp: [2, 5] });
  C('ancient_debris', { side: 'ancient_debris_side', top: 'ancient_debris_top' }, { hard: 30, tool: 'pick', req: true, lvl: 3, tab: 'nature', snd: 'metal', res: 1200 });
  const metalB = (id, tex, lvl, o) => C(id, tex, Object.assign({ hard: 5, tool: 'pick', req: true, lvl, snd: 'metal', res: 6 }, o));
  metalB('coal_block', 'coal_block', 0, { snd: 'stone', flam: 1 });
  metalB('raw_iron_block', 'raw_iron_block', 1, { tab: 'nature' }); metalB('raw_copper_block', 'raw_copper_block', 1, { tab: 'nature' }); metalB('raw_gold_block', 'raw_gold_block', 2, { tab: 'nature' });
  metalB('iron_block', 'iron_block', 1); metalB('gold_block', 'gold_block', 2, { hard: 3 }); metalB('redstone_block', 'redstone_block', 0, { tab: 'red', power: 15 });
  metalB('emerald_block', 'emerald_block', 2); metalB('lapis_block', 'lapis_block', 1, { hard: 3, snd: 'stone' }); metalB('diamond_block', 'diamond_block', 2);
  metalB('netherite_block', 'netherite_block', 3, { hard: 50, res: 1200 });
  C('amethyst_block', 'amethyst_block', { hard: 1.5, tool: 'pick', req: true, snd: 'amethyst' });
  C('budding_amethyst', 'budding_amethyst', { hard: 1.5, tool: 'pick', snd: 'amethyst', drop: null, tab: 'nature', tick: 'bud' });
  const bud = (id, h, w, li) => blk(id, { props: [P6], shape: 'model', opq: false, solid: false, att: 0, hard: 1.5, snd: 'amethyst', light: li, tab: 'nature', icon: id, drop: id === 'amethyst_cluster' ? (s, c) => c.silk ? [[id, 1]] : [['amethyst_shard', 4]] : (s, c) => c.silk ? [[id, 1]] : null, model: s => crossBoxes(id, s, h, w), sel: s => budSel(s, h, w), attach: 2 });
  bud('small_amethyst_bud', 3, 4, 1); bud('medium_amethyst_bud', 4, 6, 2); bud('large_amethyst_bud', 5, 7, 4); bud('amethyst_cluster', 7, 8, 5);
  C('calcite', 'calcite', { hard: .75, tool: 'pick', req: true, tab: 'nature' });
  C('tuff', 'tuff', { hard: 1.5, tool: 'pick', req: true, tab: 'nature' });
  C('dripstone_block', 'dripstone_block', { hard: 1.5, tool: 'pick', req: true, tab: 'nature' });
  pillar('deepslate', 'deepslate', 'deepslate_top', { hard: 3, tool: 'pick', req: true, snd: 'deepslate', drop: 'cobbled_deepslate', tab: 'nature' });
  C('cobbled_deepslate', 'cobbled_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('polished_deepslate', 'polished_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('deepslate_bricks', 'deepslate_bricks', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('cracked_deepslate_bricks', 'cracked_deepslate_bricks', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('deepslate_tiles', 'deepslate_tiles', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('cracked_deepslate_tiles', 'cracked_deepslate_tiles', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('chiseled_deepslate', 'chiseled_deepslate', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' });
  C('reinforced_deepslate', { side: 'reinforced_deepslate_side', top: 'reinforced_deepslate_top', bottom: 'reinforced_deepslate_bottom' }, { hard: 55, item: true, drop: null, res: 1200 });
  C('smooth_basalt', 'smooth_basalt', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt', tab: 'nature' });
  const stoneO = { hard: 1.5, tool: 'pick', req: true, res: 6 };
  const slabName = n => n.replace(/s$/, '').replace(/_block$/, '').replace(/bricks$/, 'brick').replace(/tiles$/, 'tile');
  const STONE_FAMS = [
    ['stone', 'stone', 'st sl', stoneO], ['cobblestone', 'cobblestone', 'st sl w', stoneO], ['mossy_cobblestone', 'mossy_cobblestone', 'st sl w', stoneO],
    ['stone_bricks', 'stone_bricks', 'st sl w', stoneO], ['mossy_stone_bricks', 'mossy_stone_bricks', 'st sl w', stoneO],
    ['granite', 'granite', 'st sl w', stoneO], ['polished_granite', 'polished_granite', 'st sl', stoneO], ['diorite', 'diorite', 'st sl w', stoneO], ['polished_diorite', 'polished_diorite', 'st sl', stoneO], ['andesite', 'andesite', 'st sl w', stoneO], ['polished_andesite', 'polished_andesite', 'st sl', stoneO],
    ['cobbled_deepslate', 'cobbled_deepslate', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }], ['polished_deepslate', 'polished_deepslate', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }],
    ['deepslate_bricks', 'deepslate_bricks', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }], ['deepslate_tiles', 'deepslate_tiles', 'st sl w', { hard: 3.5, tool: 'pick', req: true, snd: 'deepslate' }],
    ['tuff', 'tuff', 'st sl w', stoneO], ['polished_tuff', 'polished_tuff', 'st sl w', stoneO], ['tuff_bricks', 'tuff_bricks', 'st sl w', stoneO],
    ['bricks', 'bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, res: 6 }], ['mud_bricks', 'mud_bricks', 'st sl w', { hard: 1.5, tool: 'pick', req: true, snd: 'mud_bricks' }],
    ['resin_bricks', 'resin_bricks', 'st sl w', { hard: 1.5, tool: 'pick', req: true }],
    ['sandstone', { side: 'sandstone', top: 'sandstone_top', bottom: 'sandstone_bottom' }, 'st sl w', { hard: .8, tool: 'pick', req: true }], ['smooth_sandstone', 'sandstone_top', 'st sl', { hard: 2, tool: 'pick', req: true }], ['cut_sandstone', { side: 'cut_sandstone', ud: 'sandstone_top' }, 'sl', { hard: .8, tool: 'pick', req: true }],
    ['red_sandstone', { side: 'red_sandstone', top: 'red_sandstone_top', bottom: 'red_sandstone_bottom' }, 'st sl w', { hard: .8, tool: 'pick', req: true }], ['smooth_red_sandstone', 'red_sandstone_top', 'st sl', { hard: 2, tool: 'pick', req: true }], ['cut_red_sandstone', { side: 'cut_red_sandstone', ud: 'red_sandstone_top' }, 'sl', { hard: .8, tool: 'pick', req: true }],
    ['prismarine', 'prismarine', 'st sl w', stoneO], ['prismarine_bricks', 'prismarine_bricks', 'st sl', stoneO], ['dark_prismarine', 'dark_prismarine', 'st sl', stoneO],
    ['nether_bricks', 'nether_bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }], ['red_nether_bricks', 'red_nether_bricks', 'st sl w', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }],
    ['blackstone', { side: 'blackstone', ud: 'blackstone_top' }, 'st sl w', stoneO], ['polished_blackstone', 'polished_blackstone', 'st sl w', { hard: 2, tool: 'pick', req: true }], ['polished_blackstone_bricks', 'polished_blackstone_bricks', 'st sl w', stoneO],
    ['end_stone_bricks', 'end_stone_bricks', 'st sl w', { hard: 3, tool: 'pick', req: true }], ['purpur_block', 'purpur_block', 'st sl', stoneO],
    ['quartz_block', { side: 'quartz_block_side', top: 'quartz_block_top', bottom: 'quartz_block_bottom' }, 'st sl', { hard: .8, tool: 'pick', req: true }], ['smooth_quartz', 'quartz_block_bottom', 'st sl', { hard: 2, tool: 'pick', req: true }],
    ['cinnabar', 'cinnabar', 'st sl w', stoneO], ['polished_cinnabar', 'polished_cinnabar', 'st sl w', stoneO], ['cinnabar_bricks', 'cinnabar_bricks', 'st sl w', stoneO],
    ['sulfur', 'sulfur', 'st sl w', stoneO], ['polished_sulfur', 'polished_sulfur', 'st sl w', stoneO], ['sulfur_bricks', 'sulfur_bricks', 'st sl w', stoneO]
  ];
  const famBase = {
    stone_bricks: () => C('stone_bricks', 'stone_bricks', stoneO), mossy_stone_bricks: () => C('mossy_stone_bricks', 'mossy_stone_bricks', stoneO),
    polished_tuff: () => C('polished_tuff', 'polished_tuff', stoneO), tuff_bricks: () => C('tuff_bricks', 'tuff_bricks', stoneO),
    bricks: () => C('bricks', 'bricks', { hard: 2, tool: 'pick', req: true, res: 6 }), mud_bricks: () => C('mud_bricks', 'mud_bricks', { hard: 1.5, tool: 'pick', req: true }),
    resin_bricks: () => C('resin_bricks', 'resin_bricks', { hard: 1.5, tool: 'pick', req: true }),
    sandstone: () => C('sandstone', { side: 'sandstone', top: 'sandstone_top', bottom: 'sandstone_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_sandstone: () => C('smooth_sandstone', 'sandstone_top', { hard: 2, tool: 'pick', req: true }), cut_sandstone: () => C('cut_sandstone', { side: 'cut_sandstone', ud: 'sandstone_top' }, { hard: .8, tool: 'pick', req: true }),
    red_sandstone: () => C('red_sandstone', { side: 'red_sandstone', top: 'red_sandstone_top', bottom: 'red_sandstone_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_red_sandstone: () => C('smooth_red_sandstone', 'red_sandstone_top', { hard: 2, tool: 'pick', req: true }), cut_red_sandstone: () => C('cut_red_sandstone', { side: 'cut_red_sandstone', ud: 'red_sandstone_top' }, { hard: .8, tool: 'pick', req: true }),
    prismarine: () => C('prismarine', 'prismarine', stoneO), prismarine_bricks: () => C('prismarine_bricks', 'prismarine_bricks', stoneO), dark_prismarine: () => C('dark_prismarine', 'dark_prismarine', stoneO),
    nether_bricks: () => C('nether_bricks', 'nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }), red_nether_bricks: () => C('red_nether_bricks', 'red_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', res: 6 }),
    blackstone: () => C('blackstone', { side: 'blackstone', ud: 'blackstone_top' }, stoneO), polished_blackstone: () => C('polished_blackstone', 'polished_blackstone', { hard: 2, tool: 'pick', req: true }), polished_blackstone_bricks: () => C('polished_blackstone_bricks', 'polished_blackstone_bricks', stoneO),
    end_stone_bricks: () => C('end_stone_bricks', 'end_stone_bricks', { hard: 3, tool: 'pick', req: true }), purpur_block: () => C('purpur_block', 'purpur_block', stoneO),
    quartz_block: () => C('quartz_block', { side: 'quartz_block_side', top: 'quartz_block_top', bottom: 'quartz_block_bottom' }, { hard: .8, tool: 'pick', req: true }), smooth_quartz: () => C('smooth_quartz', 'quartz_block_bottom', { hard: 2, tool: 'pick', req: true }),
    cinnabar: () => C('cinnabar', 'cinnabar', stoneO), polished_cinnabar: () => C('polished_cinnabar', 'polished_cinnabar', stoneO), cinnabar_bricks: () => C('cinnabar_bricks', 'cinnabar_bricks', stoneO),
    sulfur: () => C('sulfur', 'sulfur', stoneO), polished_sulfur: () => C('polished_sulfur', 'polished_sulfur', stoneO), sulfur_bricks: () => C('sulfur_bricks', 'sulfur_bricks', stoneO)
  };
  for (const [base, tex, set, o] of STONE_FAMS) {
    if (famBase[base]) famBase[base]();
    const nm = slabName(base);
    const extra = Object.assign({}, o, base === 'stone' || base.includes('smooth') ? {} : {});
    if (set.includes('st')) stairs(nm + '_stairs', tex, Object.assign({ drop: undefined }, extra));
    if (set.includes('sl')) slab(nm + '_slab', base, Object.assign({}, extra, { tex }));
    if (set.includes('w')) wall(nm + '_wall', typeof tex === 'string' ? tex : tex.side, Object.assign({}, extra));
    if (base === 'stone_bricks') { C('cracked_stone_bricks', 'cracked_stone_bricks', stoneO); C('chiseled_stone_bricks', 'chiseled_stone_bricks', stoneO); }
    if (base === 'tuff_bricks') { C('chiseled_tuff', { side: 'chiseled_tuff', ud: 'chiseled_tuff_top' }, stoneO); C('chiseled_tuff_bricks', { side: 'chiseled_tuff_bricks', ud: 'chiseled_tuff_bricks_top' }, stoneO); }
    if (base === 'mud_bricks') C('packed_mud', 'packed_mud', { hard: 1, tool: 'pick', snd: 'mud_bricks' });
    if (base === 'resin_bricks') { C('chiseled_resin_bricks', 'chiseled_resin_bricks', { hard: 1.5, tool: 'pick', req: true }); C('resin_block', 'resin_block', { hard: 0, snd: 'resin', tab: 'nature' }); }
    if (base === 'sandstone') C('chiseled_sandstone', { side: 'chiseled_sandstone', ud: 'sandstone_top' }, { hard: .8, tool: 'pick', req: true });
    if (base === 'red_sandstone') C('chiseled_red_sandstone', { side: 'chiseled_red_sandstone', ud: 'red_sandstone_top' }, { hard: .8, tool: 'pick', req: true });
    if (base === 'nether_bricks') { C('cracked_nether_bricks', 'cracked_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks' }); C('chiseled_nether_bricks', 'chiseled_nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks' }); fence('nether_brick_fence', 'nether_bricks', { hard: 2, tool: 'pick', req: true, snd: 'nether_bricks', cls: 'nfence', flam: 0 }); }
    if (base === 'polished_blackstone') { C('chiseled_polished_blackstone', 'chiseled_polished_blackstone', stoneO); }
    if (base === 'polished_blackstone_bricks') { C('cracked_polished_blackstone_bricks', 'cracked_polished_blackstone_bricks', stoneO); C('gilded_blackstone', 'gilded_blackstone', stoneO); }
    if (base === 'purpur_block') pillar('purpur_pillar', 'purpur_pillar', 'purpur_pillar_top', stoneO);
    if (base === 'quartz_block') { C('chiseled_quartz_block', { side: 'chiseled_quartz_block', ud: 'chiseled_quartz_block_top' }, { hard: .8, tool: 'pick', req: true }); C('quartz_bricks', 'quartz_bricks', { hard: .8, tool: 'pick', req: true }); pillar('quartz_pillar', 'quartz_pillar', 'quartz_pillar_top', { hard: .8, tool: 'pick', req: true }); }
    if (base === 'cinnabar_bricks') C('chiseled_cinnabar', 'chiseled_cinnabar', stoneO);
    if (base === 'sulfur_bricks') { C('chiseled_sulfur', 'chiseled_sulfur', stoneO); C('potent_sulfur', 'potent_sulfur', Object.assign({ tab: 'nature' }, stoneO)); }
  }
  C('smooth_stone', 'smooth_stone', { hard: 2, tool: 'pick', req: true, res: 6 });
  slab('smooth_stone_slab', 'smooth_stone', { hard: 2, tool: 'pick', req: true, tex: { side: 'smooth_stone_slab_side', ud: 'smooth_stone' } });
  C('end_stone', 'end_stone', { hard: 3, tool: 'pick', req: true, tab: 'nature' });
  C('netherrack', 'netherrack', { hard: .4, tool: 'pick', req: true, snd: 'netherrack', tab: 'nature' });
  pillar('basalt', 'basalt_side', 'basalt_top', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt', tab: 'nature' });
  pillar('polished_basalt', 'polished_basalt_side', 'polished_basalt_top', { hard: 1.25, tool: 'pick', req: true, snd: 'basalt' });
  C('soul_sand', 'soul_sand', { hard: .5, tool: 'shovel', snd: 'soul', tab: 'nature', coll: () => [cb(0, 0, 0, 16, 14, 16)] });
  C('soul_soil', 'soul_soil', { hard: .5, tool: 'shovel', snd: 'soul', tab: 'nature' });
  C('obsidian', 'obsidian', { hard: 50, tool: 'pick', req: true, lvl: 3, res: 1200, tab: 'nature' });
  C('crying_obsidian', 'crying_obsidian', { hard: 50, tool: 'pick', req: true, lvl: 3, res: 1200, light: 10, tab: 'nature' });
  C('glowstone', 'glowstone', { hard: .3, snd: 'glass', light: 15, opq: true, drop: (s, c) => c.silk ? [['glowstone', 1]] : [['glowstone_dust', rr(2, 4)]], tab: 'nature' });
  C('sea_lantern', 'sea_lantern', { hard: .3, snd: 'glass', light: 15, drop: (s, c) => c.silk ? [['sea_lantern', 1]] : [['prismarine_crystals', rr(2, 3)]], tab: 'func' });
  C('magma_block', 'magma', { hard: .5, tool: 'pick', req: true, light: 3, tab: 'nature', magma: 1 });
  C('shroomlight', 'shroomlight', { hard: 1, tool: 'hoe', light: 15, snd: 'wool', tab: 'nature' });
  pillar('bone_block', 'bone_block_side', 'bone_block_top', { hard: 2, tool: 'pick', req: true, snd: 'bone', tab: 'nature' });
  pillar('hay_block', 'hay_block_side', 'hay_block_top', { hard: .5, tool: 'hoe', snd: 'grass', flam: 1, tab: 'nature', soft: .2 });
  C('dried_kelp_block', { side: 'dried_kelp_side', top: 'dried_kelp_top', bottom: 'dried_kelp_bottom' }, { hard: .5, tool: 'hoe', snd: 'grass', tab: 'build' });
  C('sponge', 'sponge', { hard: .6, tool: 'hoe', snd: 'grass', tab: 'nature', sponge: 1 });
  C('wet_sponge', 'wet_sponge', { hard: .6, tool: 'hoe', snd: 'grass', tab: 'nature' });
  C('moss_block', 'moss_block', { hard: .1, tool: 'hoe', snd: 'moss', tab: 'nature' });
  C('pale_moss_block', 'pale_moss_block', { hard: .1, tool: 'hoe', snd: 'moss', tab: 'nature' });
  const carpet = (id, tex, o) => blk(id, Object.assign({ shape: 'model', tex, opq: false, att: 0, hard: .1, snd: 'wool', model: () => [bx(0, 0, 0, 16, 1, 16, tex)], coll: () => [cb(0, 0, 0, 16, 1, 16)], tab: 'color', flam: 1, attach: 3 }, o));
  carpet('moss_carpet', 'moss_block', { snd: 'moss', tab: 'nature' });
  carpet('pale_moss_carpet', 'pale_moss_block', { snd: 'moss', tab: 'nature' });
  C('melon', { side: 'melon_side', ud: 'melon_top' }, { hard: 1, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['melon', 1]] : [['melon_slice', rr(3, 7)]], tab: 'nature' });
  C('pumpkin', { side: 'pumpkin_side', ud: 'pumpkin_top' }, { hard: 1, tool: 'axe', snd: 'wood', tab: 'nature' });
  blk('carved_pumpkin', { props: [P4], tiles: facingTiles('carved_pumpkin', 'pumpkin_side', 'pumpkin_top'), hard: 1, tool: 'axe', snd: 'wood', tab: 'nature', wear: 'head' });
  blk('jack_o_lantern', { name: "Jack o'Lantern", props: [P4], tiles: facingTiles('jack_o_lantern', 'pumpkin_side', 'pumpkin_top'), hard: 1, tool: 'axe', snd: 'wood', light: 15, tab: 'func' });
  C('snow_block', 'snow', { hard: .2, tool: 'shovel', req: true, snd: 'snow', drop: (s, c) => c.silk ? [['snow_block', 1]] : [['snowball', 4]], tab: 'nature' });
  blk('snow', { name: 'Snow', props: [['layers', [1, 2, 3, 4, 5, 6, 7, 8]]], shape: s => sv(s, 'layers') === 7 ? 'cube' : 'model', tex: 'snow', model: s => [bx(0, 0, 0, 16, (sv(s, 'layers') + 1) * 2, 16, 'snow')], coll: s => sv(s, 'layers') === 0 ? [] : [cb(0, 0, 0, 16, sv(s, 'layers') * 2, 16)], sel: s => [cb(0, 0, 0, 16, (sv(s, 'layers') + 1) * 2, 16)], opq: true, att: s => sv(s, 'layers') === 7 ? 15 : 0, hard: .1, tool: 'shovel', req: true, snd: 'snow', repl: s => sv(s, 'layers') === 0, drop: (s, c) => [['snowball', sv(s, 'layers') + 1]], tab: 'nature', icon: 'snow', attach: 3 });
  C('ice', 'ice', { hard: .5, tool: 'pick', snd: 'glass', opq: false, att: 2, cullSame: 1, trans: 1, slip: .98, drop: null, tab: 'nature' });
  C('packed_ice', 'packed_ice', { hard: .5, tool: 'pick', snd: 'glass', slip: .98, drop: (s, c) => c.silk ? [['packed_ice', 1]] : null, tab: 'nature' });
  C('blue_ice', 'blue_ice', { hard: 2.8, tool: 'pick', snd: 'glass', slip: .989, drop: (s, c) => c.silk ? [['blue_ice', 1]] : null, tab: 'nature' });
  C('powder_snow', 'powder_snow', { hard: .25, snd: 'snow', solid: false, opq: false, att: 1, cullSame: 2, trans: 1, item: 'powder_snow_bucket', drop: null, tab: null, powder: 1 });
  C('glass', 'glass', { hard: .3, snd: 'glass', opq: false, att: 0, cullSame: 3, drop: null, tab: 'color' });
  C('tinted_glass', 'tinted_glass', { hard: .3, snd: 'glass', opq: false, att: 15, cullSame: 4, trans: 1, tab: 'color' });
  pane('glass_pane', 'glass', 'glass_pane_top', {});
  C('slime_block', 'slime_block', { hard: 0, snd: 'slime', opq: false, att: 1, trans: 1, cullSame: 5, tab: 'red', bounce: 1 });
  blk('honey_block', { shape: 'model', tex: { top: 'honey_block_top', side: 'honey_block_side', bottom: 'honey_block_bottom' }, model: () => [bx(1, 1, 1, 15, 15, 15, { u: 'honey_block_top', d: 'honey_block_bottom', side: 'honey_block_side' }), bx(0, 0, 0, 16, 16, 16, { u: 'honey_block_top', d: 'honey_block_bottom', side: 'honey_block_side' })], coll: () => [cb(1, 0, 1, 15, 15, 15)], opq: false, att: 1, trans: 1, hard: 0, snd: 'honey', tab: 'red', sticky: 1 });
  C('honeycomb_block', 'honeycomb_block', { hard: .6, snd: 'coral', tab: 'build' });
  C('target', { side: 'target_side', ud: 'target_top' }, { hard: .5, tool: 'hoe', snd: 'grass', tab: 'red' });
  blk('cobweb', crossM({ tex: 'cobweb', icon: 'cobweb', hard: 4, tool: 'sword', snd: 'stone', drop: (s, c) => c.silk || c.shears ? [['cobweb', 1]] : [['string', 1]], web: 1, plant: 0, sel: () => FULLCB, tab: 'nature' }));
  C('sculk', 'sculk', { hard: .2, tool: 'hoe', snd: 'sculk', tab: 'nature', drop: (s, c) => c.silk ? [['sculk', 1]] : null, xp: [1, 1] });
  C('sculk_catalyst', { top: 'sculk_catalyst_top', side: 'sculk_catalyst_side', bottom: 'sculk_catalyst_bottom' }, { hard: 3, tool: 'hoe', light: 6, snd: 'sculk', tab: 'nature' });
  blk('sculk_sensor', { shape: 'model', model: () => [bx(0, 0, 0, 16, 8, 16, { u: 'sculk_sensor_top', d: 'sculk_sensor_bottom', side: 'sculk_sensor_side' })], coll: () => [cb(0, 0, 0, 16, 8, 16)], opq: false, att: 0, hard: 1.5, tool: 'hoe', light: 1, snd: 'sculk', tab: 'red' });
  blk('sculk_shrieker', { shape: 'model', model: () => [bx(0, 0, 0, 16, 8, 16, { u: 'sculk_shrieker_top', d: 'sculk_shrieker_bottom', side: 'sculk_shrieker_side' })], coll: () => [cb(0, 0, 0, 16, 8, 16)], opq: false, att: 0, hard: 3, tool: 'hoe', snd: 'sculk', tab: 'red' });
  C('mushroom_stem', 'mushroom_stem', { hard: .2, tool: 'axe', snd: 'wood', drop: null, tab: 'nature' });
  C('brown_mushroom_block', 'brown_mushroom_block', { hard: .2, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['brown_mushroom_block', 1]] : RNG() < .2 ? [['brown_mushroom', 1]] : null, tab: 'nature' });
  C('red_mushroom_block', 'red_mushroom_block', { hard: .2, tool: 'axe', snd: 'wood', drop: (s, c) => c.silk ? [['red_mushroom_block', 1]] : RNG() < .2 ? [['red_mushroom', 1]] : null, tab: 'nature' });
  const WOODS = [
    { n: 'oak', leaf: 'foliage', boat: 1 }, { n: 'spruce', leaf: 'spruce', boat: 1 }, { n: 'birch', leaf: 'birch', boat: 1 }, { n: 'jungle', leaf: 'foliage', boat: 1 }, { n: 'acacia', leaf: 'foliage', boat: 1 },
    { n: 'dark_oak', leaf: 'foliage', boat: 1 }, { n: 'mangrove', leaf: 'mangrove', boat: 1, prop: 'mangrove_propagule' }, { n: 'cherry', leaf: 'none', boat: 1, snd: 'cherry' }, { n: 'pale_oak', leaf: 'none', boat: 1 },
    { n: 'poplar', leaf: 'poplar', boat: 1 }, { n: 'bamboo', bamboo: 1, snd: 'bamboo' }, { n: 'crimson', nether: 1, snd: 'nether_wood' }, { n: 'warped', nether: 1, snd: 'nether_wood' }
  ];
  const woodO = (w, o) => Object.assign({ hard: 2, tool: 'axe', snd: w.snd || 'wood', flam: w.nether ? 0 : 1 }, o);
  const signB = (w, pl) => {
    const t = pl;
    blk(w.n + '_sign', woodO(w, { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', opq: false, solid: false, att: 0, hard: 1, tab: 'func', sign: 1, icon: 'i_' + w.n + '_sign', use: 'sign',
      model: s => { const q = Math.round(sv(s, 'rotation') / 4) & 3; return rotY([bx(0, 7, 7, 16, 15, 9, t), bx(7, 0, 7, 9, 7, 9, w.n === 'bamboo' ? 'bamboo_planks' : (w.nether ? 'stripped_' + w.n + '_stem' : w.n + '_log'))], q); }, sel: () => [cb(4, 0, 4, 12, 16, 12)] }));
    blk(w.n + '_wall_sign', woodO(w, { props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 1, item: w.n + '_sign', name: title(w.n + '_sign'), sign: 1, use: 'sign', drop: w.n + '_sign',
      model: s => rotY([bx(0, 4.5, 14, 16, 12.5, 16, t)], fq(s)), sel: s => rotCB([cb(0, 4.5, 14, 16, 12.5, 16)], fq(s)) }));
    blk(w.n + '_hanging_sign', woodO(w, { props: [P4], shape: 'model', opq: false, solid: false, att: 0, hard: 1, tab: 'func', sign: 1, icon: 'i_' + w.n + '_hanging_sign', use: 'sign',
      model: s => rotY([bx(1, 0, 7, 15, 10, 9, 'stripped_' + (w.nether ? w.n + '_stem' : w.n === 'bamboo' ? 'bamboo_block' : w.n + '_log')), bx(3, 10, 8, 4, 16, 8, 'chain', { no: 'ewud' }), bx(12, 10, 8, 13, 16, 8, 'chain', { no: 'ewud' })], fq(s)), sel: () => [cb(1, 0, 7, 15, 10, 9)] }));
  };
  for (const w of WOODS) {
    const n = w.n, pl = n + '_planks', log = w.nether ? n + '_stem' : w.bamboo ? 'bamboo_block' : n + '_log';
    if (w.bamboo) {
      pillar('bamboo_block', 'bamboo_block', 'bamboo_block_top', woodO(w, { tags: ['log'], tab: 'build' }));
      pillar('stripped_bamboo_block', 'stripped_bamboo_block', 'stripped_bamboo_block_top', woodO(w, { tags: ['log'] }));
    } else {
      const top = log + '_top', wood = w.nether ? n + '_hyphae' : n + '_wood';
      pillar(log, log, top, woodO(w, { tags: ['log'], tabs: ['build', 'nature'], strip: 'stripped_' + log }));
      pillar(wood, log, log, woodO(w, { tags: ['log'], strip: 'stripped_' + wood }));
      pillar('stripped_' + log, 'stripped_' + log, 'stripped_' + log + '_top', woodO(w, { tags: ['log'] }));
      pillar('stripped_' + wood, 'stripped_' + log, 'stripped_' + log, woodO(w, { tags: ['log'] }));
    }
    C(pl, pl, woodO(w, { tags: ['planks'] }));
    if (w.bamboo) C('bamboo_mosaic', 'bamboo_mosaic', woodO(w, {}));
    stairs(n + '_stairs', pl, woodO(w, {}));
    slab(n + '_slab', pl, woodO(w, {}));
    if (w.bamboo) { stairs('bamboo_mosaic_stairs', 'bamboo_mosaic', woodO(w, {})); slab('bamboo_mosaic_slab', 'bamboo_mosaic', woodO(w, {})); }
    fence(n + '_fence', w.bamboo ? 'bamboo_fence' : pl, woodO(w, { flam: w.nether ? 0 : 1 }));
    gate(n + '_fence_gate', w.bamboo ? 'bamboo_fence_gate' : pl, woodO(w, {}));
    door(n + '_door', n, woodO(w, { hard: 3, icon: 'i_' + n + '_door' }));
    trapdoor(n + '_trapdoor', n + '_trapdoor', woodO(w, { hard: 3 }));
    plate(n + '_pressure_plate', pl, woodO(w, { hard: .5, plateKind: 'all' }));
    button(n + '_button', pl, woodO(w, { hard: .5, btnTime: 30 }));
    signB(w, pl);
    blk(n + '_shelf', woodO(w, { props: [P4], shape: 'model', opq: false, att: 0, tab: 'func', model: s => rotY([bx(0, 0, 11, 16, 16, 16, n + '_shelf_side', { uv: { n: [0, 0, 16, 16] } }), bx(0, 0, 13, 16, 16, 16, pl, { no: 'ewud' })], fq(s)), coll: s => rotCB([cb(0, 0, 11, 16, 16, 16)], fq(s)) }));
    if (!w.bamboo && !w.nether) {
      const leaves = n === 'poplar' ? ['red_poplar_leaves', 'orange_poplar_leaves', 'yellow_poplar_leaves'] : [n + '_leaves'];
      for (const lf of leaves) {
        const tk = w.leaf === 'foliage' ? 2 : w.leaf === 'spruce' ? 4 : w.leaf === 'birch' ? 5 : w.leaf === 'mangrove' ? 6 : 0;
        blk(lf, { props: [['persistent', [false, true]]], tex: lf, opq: false, att: 1, cullSame: 0, hard: .2, tool: 'hoe', snd: n === 'cherry' ? 'cherry_leaves' : 'grass', tint: tk, tags: ['leaves'], flam: 1, tab: 'nature', leafTex: lf,
          drop: (s, c) => { if (c.silk || c.shears) return [[lf, 1]]; const d = []; const sap = w.prop || (n === 'poplar' ? 'poplar_sapling' : n + '_sapling'); if (RNG() < (n === 'jungle' ? .025 : .05)) d.push([sap, 1]); if (RNG() < .02) d.push(['stick', rr(1, 2)]); if ((n === 'oak' || n === 'dark_oak') && RNG() < .005) d.push(['apple', 1]); return d; } });
      }
      if (n === 'mangrove') {
        blk('mangrove_propagule', crossM({ props: [['stage', [0, 1]]], tex: 'mangrove_propagule', icon: 'mangrove_propagule', sapling: 'mangrove' }));
        blk('mangrove_roots', { tex: 'mangrove_roots_side', tiles: () => ['mangrove_roots_side', 'mangrove_roots_side', 'mangrove_roots_top', 'mangrove_roots_top', 'mangrove_roots_side', 'mangrove_roots_side'], opq: false, att: 1, cullSame: 6, hard: .7, tool: 'axe', snd: 'wood', tab: 'nature' });
        pillar('muddy_mangrove_roots', 'muddy_mangrove_roots_side', 'muddy_mangrove_roots_top', { hard: .7, tool: 'shovel', snd: 'mud', tab: 'nature' });
      } else blk(n + '_sapling', crossM({ props: [['stage', [0, 1]]], tex: n + '_sapling', icon: n + '_sapling', sapling: n, tags: ['sapling'] }));
    }
    if (w.nether) {
      C(n === 'crimson' ? 'nether_wart_block' : 'warped_wart_block', n === 'crimson' ? 'nether_wart_block' : 'warped_wart_block', { hard: 1, tool: 'hoe', snd: 'wart', tab: 'nature' });
      blk(n + '_nylium', { tiles: () => [n + '_nylium_side', n + '_nylium_side', n + '_nylium', 'netherrack', n + '_nylium_side', n + '_nylium_side'], hard: .4, tool: 'pick', req: true, snd: 'nylium', drop: 'netherrack', tab: 'nature' });
      plantB(n + '_fungus', n + '_fungus', { sapling: n });
      plantB(n + '_roots', n + '_roots', {});
    }
  }
  blk('bamboo', { props: [['leaves', ['none', 'small', 'large']]], shape: 'model', tex: 'bamboo_stalk', opq: false, att: 0, hard: 1, tool: 'axe', snd: 'bamboo', tab: 'nature', icon: 'i_bamboo', model: s => { const b = [bx(7, 0, 7, 10, 16, 10, 'bamboo_stalk', { uv: { e: [0, 0, 3, 16], w: [0, 0, 3, 16], s: [0, 0, 3, 16], n: [0, 0, 3, 16], u: [13, 0, 16, 3], d: [13, 0, 16, 3] } })]; const l = sv(s, 'leaves'); if (l) b.push(bx(0, 0, 8, 16, 16, 8, l === 2 ? 'bamboo_large_leaves' : 'bamboo_small_leaves', { no: 'ewud' }), bx(8, 0, 0, 8, 16, 16, l === 2 ? 'bamboo_large_leaves' : 'bamboo_small_leaves', { no: 'udsn' })); return b; }, coll: () => [cb(6.5, 0, 6.5, 9.5, 16, 9.5)], grow: 'bamboo' });
  TN.bamboo.tex = 'bamboo_stalk';
  const FLOWERS = ['dandelion', 'golden_dandelion', 'poppy', 'blue_orchid', 'allium', 'azure_bluet', 'red_tulip', 'orange_tulip', 'white_tulip', 'pink_tulip', 'oxeye_daisy', 'cornflower', 'lily_of_the_valley', 'torchflower', 'wither_rose', 'open_eyeblossom', 'closed_eyeblossom'];
  for (const f of FLOWERS) plantB(f, f, { tags: ['flower'], flower: 1, light: f === 'open_eyeblossom' ? 0 : 0 });
  plantB('short_grass', 'short_grass', { tint: 1, repl: true, drop: (s, c) => c.shears ? [['short_grass', 1]] : RNG() < .125 ? [['wheat_seeds', 1]] : null, offset: 1 });
  plantB('fern', 'fern', { tint: 1, repl: true, drop: (s, c) => c.shears ? [['fern', 1]] : RNG() < .125 ? [['wheat_seeds', 1]] : null, offset: 1 });
  plantB('dead_bush', 'dead_bush', { repl: true, drop: (s, c) => c.shears ? [['dead_bush', 1]] : [['stick', rr(0, 2)]] });
  plantB('bush', 'bush', { tint: 1, repl: true });
  plantB('firefly_bush', 'firefly_bush', { light: 2 });
  plantB('short_dry_grass', 'short_dry_grass', { repl: true, offset: 1 });
  plantB('tall_dry_grass', 'tall_dry_grass', { repl: true, offset: 1 });
  plantB('red_shrub', 'red_shrub', { repl: true, offset: 1 });
  plantB('cactus_flower', 'cactus_flower', {});
  plantB('brown_mushroom', 'brown_mushroom', { light: 1, sel: () => [cb(5, 0, 5, 11, 6, 11)] });
  plantB('red_mushroom', 'red_mushroom', { sel: () => [cb(5, 0, 5, 11, 6, 11)] });
  plantB('sweet_berry_bush', 'sweet_berry_bush_stage3', { props: [['age', [0, 1, 2, 3]]], ctex: s => 'sweet_berry_bush_stage' + sv(s, 'age'), item: 'sweet_berries', def: { age: 3 }, crop: 'berry', drop: s => sv(s, 'age') > 1 ? [['sweet_berries', sv(s, 'age') === 3 ? rr(2, 3) : rr(1, 2)]] : null, hurt: 1 });
  plantB('hanging_roots', 'hanging_roots', { attach: 4 });
  plantB('spore_blossom', 'spore_blossom', { attach: 4 });
  plantB('nether_sprouts', 'nether_sprouts', {});
  plantB('pink_petals', 'pink_petals', { props: [P4, ['flower_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('pink_petals', s), def: { flower_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 3, 16)] });
  plantB('wildflowers', 'wildflowers', { props: [P4, ['flower_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('wildflowers', s), def: { flower_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 3, 16)] });
  plantB('leaf_litter', 'leaf_litter', { props: [P4, ['segment_amount', [1, 2, 3, 4]]], shape: 'model', model: s => petals('leaf_litter', s, 1), def: { segment_amount: 4 }, sel: () => [cb(0, 0, 0, 16, 1, 16)], tint: 0 });
  plantB('pale_hanging_moss', 'pale_hanging_moss', { props: [['tip', [false, true]]], ctex: s => sv(s, 'tip') ? 'pale_hanging_moss_tip' : 'pale_hanging_moss', attach: 4 });
  for (const [id, base] of [['tall_grass', 'tall_grass'], ['large_fern', 'large_fern'], ['sunflower', 'sunflower'], ['lilac', 'lilac'], ['rose_bush', 'rose_bush'], ['peony', 'peony'], ['pitcher_plant', 'pitcher_plant']]) tallPlant(id, base, { tint: id === 'tall_grass' || id === 'large_fern' ? 1 : 0, repl: id === 'tall_grass' || id === 'large_fern', icon: id === 'sunflower' ? 'sunflower_front' : base + '_top', drop: id === 'tall_grass' || id === 'large_fern' ? (s, c) => c.shears ? [[id, 1]] : !sv(s, 'half') && RNG() < .125 ? [['wheat_seeds', 1]] : null : undefined });
  blk('sugar_cane', crossM({ props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], tex: 'sugar_cane', icon: 'i_sugar_cane', tint: 1, crop: 'cane', sel: () => [cb(2, 0, 2, 14, 16, 14)] }));
  blk('cactus', { props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'cactus_side', model: () => [bx(0, 0, 1, 16, 16, 15, { u: null, d: null, s: 'cactus_side', n: 'cactus_side', e: null, w: null }), bx(1, 0, 0, 15, 16, 16, { u: null, d: null, e: 'cactus_side', w: 'cactus_side', s: null, n: null }), bx(0, 0, 0, 16, 16, 16, { u: 'cactus_top', d: 'cactus_bottom', side: null })], coll: () => [cb(1, 0, 1, 15, 15, 15)], opq: false, att: 0, hard: .4, snd: 'wool', tab: 'nature', crop: 'cactus', hurt: 1 });
  blk('vine', { props: [['north', [false, true]], ['east', [false, true]], ['south', [false, true]], ['west', [false, true]], ['up', [false, true]]], shape: 'model', tex: 'vine', icon: 'vine', opq: false, solid: false, att: 0, hard: .2, tool: 'shears', snd: 'vine', tint: 2, repl: true, climb: 1, tab: 'nature', drop: (s, c) => c.shears ? [['vine', 1]] : null, def: { north: true },
    model: s => { const b = []; ['north', 'east', 'south', 'west'].forEach((k, q) => { if (sv(s, k)) b.push(...rotY([bx(0, 0, .8, 16, 16, .8, { side: null, ud: null, s: 'vine', n: 'vine' }, { ti: 1 })], q)); }); if (sv(s, 'up')) b.push(bx(0, 15.2, 0, 16, 15.2, 16, { side: null, u: 'vine', d: 'vine' }, { ti: 1 })); if (!b.length) b.push(bx(0, 0, .8, 16, 16, .8, { side: null, ud: null, s: 'vine', n: 'vine' }, { ti: 1 })); return b; }, sel: () => [cb(0, 0, 0, 16, 16, 1)] });
  blk('glow_lichen', { props: [['face', ['down', 'up', 'north', 'south', 'west', 'east']]], shape: 'model', tex: 'glow_lichen', icon: 'glow_lichen', opq: false, solid: false, att: 0, hard: .2, snd: 'vine', light: 7, repl: true, tab: 'nature', attach: 2, model: s => { const f = sv(s, 'face'); if (f === 0) return [bx(0, .2, 0, 16, .2, 16, { side: null, u: 'glow_lichen', d: 'glow_lichen' })]; if (f === 1) return [bx(0, 15.8, 0, 16, 15.8, 16, { side: null, u: 'glow_lichen', d: 'glow_lichen' })]; return rotY([bx(0, 0, .2, 16, 16, .2, { side: null, ud: null, s: 'glow_lichen', n: 'glow_lichen' })], [0, 2, 3, 1][f - 2]); }, sel: () => [cb(0, 0, 0, 16, 1, 16)] });
  blk('lily_pad', { shape: 'model', tex: 'lily_pad', icon: 'lily_pad', opq: false, att: 0, hard: 0, snd: 'grass', tint: 7, tab: 'nature', model: () => [bx(0, .25, 0, 16, .25, 16, { side: null, u: 'lily_pad', d: 'lily_pad' }, { ti: 1 })], coll: () => [cb(1, 0, 1, 15, 1.5, 15)], onWater: 1 });
  blk('seagrass', crossM({ tex: 'seagrass', icon: 'seagrass', water: 1, drop: (s, c) => c.shears ? [['seagrass', 1]] : null, repl: true }));
  tallPlant('tall_seagrass', 'tall_seagrass', { water: 1, item: false, drop: (s, c) => c.shears ? [['seagrass', 1]] : null, repl: true });
  blk('kelp', crossM({ tex: 'kelp', icon: 'i_kelp', water: 1, item: 'kelp', crop: 'kelp', props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]]] }));
  blk('kelp_plant', crossM({ tex: 'kelp_plant', water: 1, item: 'kelp', drop: 'kelp' }));
  const CORALS = ['tube', 'brain', 'bubble', 'fire', 'horn'];
  for (const c of CORALS) for (const dead of [0, 1]) {
    const p = dead ? 'dead_' + c : c;
    C(p + '_coral_block', p + '_coral_block', { hard: 1.5, tool: 'pick', req: true, snd: 'coral', tab: 'nature', drop: dead ? undefined : (s, cc) => cc.silk ? [[p + '_coral_block', 1]] : [['dead_' + c + '_coral_block', 1]] });
    plantB(p + '_coral', p + '_coral', { water: !dead, drop: (s, cc) => cc.silk ? [[p + '_coral', 1]] : null, snd: 'coral' });
    plantB(p + '_coral_fan', p + '_coral_fan', { water: !dead, shape: 'model', model: () => coralFan(p + '_coral_fan'), drop: (s, cc) => cc.silk ? [[p + '_coral_fan', 1]] : null, snd: 'coral' });
  }
  blk('sea_pickle', { props: [['pickles', [1, 2, 3, 4]]], shape: 'model', tex: 'sea_pickle', icon: 'i_sea_pickle', opq: false, att: 0, hard: 0, snd: 'slime', light: s => (sv(s, 'pickles') + 1) * 3, tab: 'nature', model: s => { const n = sv(s, 'pickles') + 1, pos = [[6, 6], [3, 9], [9, 3], [10, 10]], b = []; for (let i = 0; i < n; i++) { const [x, z] = pos[i]; b.push(bx(x, 0, z, x + 4, 6, z + 4, { side: 'sea_pickle', ud: 'sea_pickle' }, { uv: { e: [0, 4, 4, 10], w: [0, 4, 4, 10], s: [0, 4, 4, 10], n: [0, 4, 4, 10], u: [4, 0, 8, 4], d: [8, 0, 12, 4] } })); } return b; }, coll: () => [cb(6, 0, 6, 10, 6, 10)], drop: s => [['sea_pickle', sv(s, 'pickles') + 1]] });
  blk('pointed_dripstone', crossM({ props: [['vertical_direction', ['down', 'up']]], tex: 'pointed_dripstone_down_tip', ctex: s => sv(s, 'vertical_direction') ? 'pointed_dripstone_up_tip' : 'pointed_dripstone_down_tip', icon: 'i_pointed_dripstone', hard: 1.5, tool: 'pick', snd: 'stone', attach: 5, hurt: 0 }));
  blk('azalea', { shape: 'model', tex: 'azalea_top', icon3: 1, opq: false, att: 0, hard: 0, snd: 'azalea', tab: 'nature', model: () => [bx(0, 8, 0, 16, 16, 16, { u: 'azalea_top', d: 'azalea_top', side: 'azalea_side' }), bx(.8, 0, 8, 15.2, 8, 8, { side: null, ud: null, n: 'azalea_plant', s: 'azalea_plant' }), bx(8, 0, .8, 8, 8, 15.2, { side: null, ud: null, e: 'azalea_plant', w: 'azalea_plant' })], coll: () => [cb(0, 8, 0, 16, 16, 16), cb(6, 0, 6, 10, 8, 10)], sapling: 'azalea' });
  blk('flowering_azalea', { shape: 'model', tex: 'flowering_azalea_top', icon3: 1, opq: false, att: 0, hard: 0, snd: 'azalea', tab: 'nature', model: () => [bx(0, 8, 0, 16, 16, 16, { u: 'flowering_azalea_top', d: 'flowering_azalea_top', side: 'flowering_azalea_side' }), bx(.8, 0, 8, 15.2, 8, 8, { side: null, ud: null, n: 'azalea_plant', s: 'azalea_plant' }), bx(8, 0, .8, 8, 8, 15.2, { side: null, ud: null, e: 'azalea_plant', w: 'azalea_plant' })], coll: () => [cb(0, 8, 0, 16, 16, 16), cb(6, 0, 6, 10, 8, 10)], sapling: 'azalea' });
  blk('azalea_leaves', { props: [['persistent', [false, true]]], tex: 'azalea_leaves', opq: false, att: 1, hard: .2, tool: 'hoe', snd: 'azalea_leaves', tags: ['leaves'], flam: 1, tab: 'nature', leafTex: 'azalea_leaves', drop: (s, c) => c.silk || c.shears ? [['azalea_leaves', 1]] : RNG() < .05 ? [['azalea', 1]] : RNG() < .02 ? [['stick', 1]] : null });
  blk('flowering_azalea_leaves', { props: [['persistent', [false, true]]], tex: 'flowering_azalea_leaves', opq: false, att: 1, hard: .2, tool: 'hoe', snd: 'azalea_leaves', tags: ['leaves'], flam: 1, tab: 'nature', leafTex: 'flowering_azalea_leaves', drop: (s, c) => c.silk || c.shears ? [['flowering_azalea_leaves', 1]] : RNG() < .05 ? [['flowering_azalea', 1]] : null });
  blk('shelf_mushroom', { props: [P4, ['size', ['small', 'large']]], shape: 'model', tex: 'shelf_mushroom', icon: 'shelf_mushroom', opq: false, att: 0, hard: 0, snd: 'fungus', tab: 'nature', attach: 1, bouncy: .75,
    model: s => { const l = sv(s, 'size'); return rotY([l ? bx(1, 6, 8, 15, 9, 16, { u: 'shelf_mushroom_top', d: 'shelf_mushroom_bottom', side: 'shelf_mushroom_side' }) : bx(3, 7, 10, 13, 9, 16, { u: 'shelf_mushroom_top', d: 'shelf_mushroom_bottom', side: 'shelf_mushroom_side' })], fq(s)); },
    coll: s => rotCB([sv(s, 'size') ? cb(1, 6, 8, 15, 9, 16) : cb(3, 7, 10, 13, 9, 16)], fq(s)), drop: s => [['shelf_mushroom', sv(s, 'size') ? 2 : 1]] });
  const cropB = (id, n, texf, o) => blk(id, crossM(Object.assign({ shape: 'crop', props: [['age', Array.from({ length: n }, (_, i) => i)]], ctex: texf, crop: 'farm', maxAge: n - 1, item: false, sel: s => [cb(0, 0, 0, 16, 2 + sv(s, 'age') * 2, 16)], tab: null, snd: 'crop' }, o)));
  cropB('wheat', 8, s => 'wheat_stage' + sv(s, 'age'), { drop: (s, c) => sv(s, 'age') === 7 ? [['wheat', 1], ['wheat_seeds', rr(0, 3)]] : [['wheat_seeds', 1]], seed: 'wheat_seeds' });
  cropB('carrots', 8, s => 'carrots_stage' + [0, 0, 1, 1, 2, 2, 2, 3][sv(s, 'age')], { drop: s => [['carrot', sv(s, 'age') === 7 ? rr(2, 5) : 1]], seed: 'carrot' });
  cropB('potatoes', 8, s => 'potatoes_stage' + [0, 0, 1, 1, 2, 2, 2, 3][sv(s, 'age')], { drop: s => sv(s, 'age') === 7 ? [['potato', rr(2, 5)]].concat(RNG() < .02 ? [['poisonous_potato', 1]] : []) : [['potato', 1]], seed: 'potato' });
  cropB('beetroots', 4, s => 'beetroots_stage' + sv(s, 'age'), { drop: s => sv(s, 'age') === 3 ? [['beetroot', 1], ['beetroot_seeds', rr(1, 4)]] : [['beetroot_seeds', 1]], seed: 'beetroot_seeds' });
  cropB('torchflower_crop', 2, s => 'torchflower_crop_stage' + sv(s, 'age'), { drop: [['torchflower_seeds', 1]], seed: 'torchflower_seeds', shape: 'cross' });
  cropB('nether_wart', 4, s => 'nether_wart_stage' + [0, 1, 1, 2][sv(s, 'age')], { drop: s => [['nether_wart', sv(s, 'age') === 3 ? rr(2, 4) : 1]], seed: 'nether_wart', soil: 'soul_sand', item: 'nether_wart' });
  for (const k of ['pumpkin', 'melon']) {
    blk(k + '_stem', crossM({ props: [['age', [0, 1, 2, 3, 4, 5, 6, 7]]], shape: 'model', tex: 'stem', crop: 'stem', fruit: k, maxAge: 7, item: false, tint: 8, model: s => { const h = (sv(s, 'age') + 1) * 2; return [bx(.8, 0, 8, 15.2, h, 8, { side: null, ud: null, n: 'stem', s: 'stem' }, { ti: 1, uv: { n: [0, 16 - h, 16, 16], s: [0, 16 - h, 16, 16] } }), bx(8, 0, .8, 8, h, 15.2, { side: null, ud: null, e: 'stem', w: 'stem' }, { ti: 1, uv: { e: [0, 16 - h, 16, 16], w: [0, 16 - h, 16, 16] } })]; }, drop: [[k + '_seeds', 1]] }));
    blk('attached_' + k + '_stem', crossM({ props: [P4], shape: 'model', tex: 'attached_stem', item: false, tint: 9, model: s => rotY([bx(8, 0, 0, 8, 16, 16, { side: null, ud: null, e: 'attached_stem', w: 'attached_stem' }, { ti: 1 })], fq(s) + 1), drop: [[k + '_seeds', 1]] }));
  }
  blk('cocoa', { props: [P4, ['age', [0, 1, 2]]], shape: 'model', tex: 'cocoa_stage2', item: 'cocoa_beans', opq: false, att: 0, hard: .2, tool: 'axe', snd: 'wood', crop: 'cocoa', maxAge: 2, attach: 1, model: s => { const a = sv(s, 'age'), w = 4 + a * 2, h = 5 + a * 2, t = 'cocoa_stage' + a; return rotY([bx(8 - w / 2, 12 - h, 15 - w, 8 + w / 2, 12, 15, t, { uv: { e: [11 - w, 4, 11, 4 + h], w: [11 - w, 4, 11, 4 + h], s: [11 - w, 4, 11, 4 + h], n: [11 - w, 4, 11, 4 + h], u: [0, 0, w, w], d: [0, 0, w, w] } })], fq(s) + 2); }, drop: s => [['cocoa_beans', sv(s, 'age') === 2 ? 3 : 1]] });
  blk('water', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'liquid', tex: { still: 'water_still', flow: 'water_flow' }, fluid: 1, opq: false, solid: false, att: 1, hard: -1, repl: true, item: 'water_bucket', drop: null, trans: 1, tint: 3, tab: null });
  blk('lava', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'liquid', tex: { still: 'lava_still', flow: 'lava_flow' }, fluid: 2, opq: false, solid: false, att: 0, light: 15, hard: -1, repl: true, item: 'lava_bucket', drop: null, tab: null });
  blk('fire', { props: [['age', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'fire_0', opq: false, solid: false, att: 0, hard: 0, light: 15, repl: true, item: false, drop: null, fire: 1, model: () => fireBoxes('fire_0', 'fire_1') });
  blk('soul_fire', { shape: 'model', tex: 'soul_fire_0', opq: false, solid: false, att: 0, hard: 0, light: 10, repl: true, item: false, drop: null, fire: 1, model: () => fireBoxes('soul_fire_0', 'soul_fire_1') });
  C('crafting_table', { top: 'crafting_table_top', bottom: 'oak_planks', n: 'crafting_table_front', s: 'crafting_table_side', e: 'crafting_table_side', w: 'crafting_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'craft', flam: 1 });
  for (const [id, tx, sp] of [['furnace', 'furnace', 1], ['blast_furnace', 'blast_furnace', 2], ['smoker', 'smoker', 2]]) {
    blk(id, { props: [P4, PLIT], tiles: s => { const t = id === 'furnace' ? [tx + '_side', tx + '_side', tx + '_top', tx + '_top', tx + '_side', tx + '_side'] : id === 'smoker' ? ['smoker_side', 'smoker_side', 'smoker_top', 'smoker_bottom', 'smoker_side', 'smoker_side'] : ['blast_furnace_side', 'blast_furnace_side', 'blast_furnace_top', 'blast_furnace_top', 'blast_furnace_side', 'blast_furnace_side']; t[F4FACE[fq(s)]] = tx + (sv(s, 'lit') ? '_front_on' : '_front'); return t; }, hard: 3.5, tool: 'pick', req: true, light: s => sv(s, 'lit') ? 13 : 0, tab: 'func', use: 'furnace', fkind: id });
  }
  blk('chest', { props: [P4], shape: 'model', tex: 'chest_side', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'chest', cont: 27, flam: 1, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'chest_top', d: 'chest_bottom', side: 'chest_side', n: 'chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('trapped_chest', { props: [P4], shape: 'model', tex: 'chest_side', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'red', use: 'chest', cont: 27, flam: 1, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'chest_top', d: 'chest_bottom', side: 'chest_side', n: 'trapped_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('ender_chest', { props: [P4], shape: 'model', tex: 'ender_chest_side', icon3: 1, opq: false, att: 0, hard: 22.5, tool: 'pick', req: true, light: 7, tab: 'func', use: 'ender', drop: (s, c) => c.silk ? [['ender_chest', 1]] : [['obsidian', 8]], model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: 'ender_chest_top', d: 'ender_chest_bottom', side: 'ender_chest_side', n: 'ender_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] });
  blk('barrel', { props: [P6, POPEN], tiles: s => { const f = sv(s, 'facing'), top = sv(s, 'open') ? 'barrel_top_open' : 'barrel_top'; if (f === 4) return ['barrel_side', 'barrel_side', top, 'barrel_bottom', 'barrel_side', 'barrel_side']; if (f === 5) return [['barrel_side', 2], ['barrel_side', 2], 'barrel_bottom', top, ['barrel_side', 2], ['barrel_side', 2]]; const t = new Array(6); const fi = F4FACE[f], bi = OPP6[fi]; for (let i = 0; i < 6; i++) t[i] = i === fi ? top : i === bi ? 'barrel_bottom' : (i === 2 || i === 3) ? ['barrel_side', f & 1 ? 1 : 0] : ['barrel_side', 1]; return t; }, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', use: 'chest', cont: 27, flam: 1, place6: 1 });
  C('bookshelf', { side: 'bookshelf', ud: 'oak_planks' }, { hard: 1.5, tool: 'axe', snd: 'wood', flam: 1, tab: 'func', drop: (s, c) => c.silk ? [['bookshelf', 1]] : [['book', 3]] });
  blk('chiseled_bookshelf', { props: [P4], tiles: facingTiles('chiseled_bookshelf_empty', 'chiseled_bookshelf_side', 'chiseled_bookshelf_top'), hard: 1.5, tool: 'axe', snd: 'wood', tab: 'func' });
  blk('enchanting_table', { shape: 'model', tex: 'enchanting_table_top', icon3: 1, opq: false, att: 0, hard: 5, tool: 'pick', req: true, light: 7, tab: 'func', res: 1200, model: () => [bx(0, 0, 0, 16, 12, 16, { u: 'enchanting_table_top', d: 'enchanting_table_bottom', side: 'enchanting_table_side' })], coll: () => [cb(0, 0, 0, 16, 12, 16)], use: 'enchant' });
  for (const [id, dmg] of [['anvil', 0], ['chipped_anvil', 1], ['damaged_anvil', 2]]) blk(id, { props: [P4], shape: 'model', tex: 'anvil', icon3: 1, opq: false, att: 0, hard: 5, tool: 'pick', req: true, snd: 'anvil', grav: 1, tab: 'func', res: 1200, anvil: dmg, model: s => rotY([bx(2, 0, 2, 14, 4, 14, 'anvil'), bx(4, 4, 3, 12, 5, 13, 'anvil'), bx(6, 5, 4, 10, 10, 12, 'anvil'), bx(3, 10, 0, 13, 16, 16, { u: 'anvil_top' + (dmg ? '_' + dmg : ''), side: 'anvil', d: 'anvil' })], fq(s) + 1), coll: s => rotCB([cb(3, 10, 0, 13, 16, 16), cb(2, 0, 2, 14, 10, 14)], fq(s) + 1) });
  blk('grindstone', { props: [['face', BTN_FACE], P4], shape: 'model', tex: 'grindstone_side', icon3: 1, opq: false, att: 0, hard: 2, tool: 'pick', req: true, tab: 'func', model: s => rotY([bx(4, 4, 2, 12, 16, 14, { side: 'grindstone_side', e: 'grindstone_pivot', w: 'grindstone_pivot', u: 'grindstone_round', d: 'grindstone_round' }), bx(2, 0, 6, 4, 13, 10, 'dark_oak_log'), bx(12, 0, 6, 14, 13, 10, 'dark_oak_log')], fq(s)), coll: s => rotCB([cb(2, 0, 2, 14, 16, 14)], fq(s)) });
  C('smithing_table', { top: 'smithing_table_top', bottom: 'smithing_table_bottom', side: 'smithing_table_side', n: 'smithing_table_front', s: 'smithing_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  C('fletching_table', { top: 'fletching_table_top', bottom: 'birch_planks', side: 'fletching_table_side', n: 'fletching_table_front', s: 'fletching_table_front' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  C('cartography_table', { top: 'cartography_table_top', bottom: 'dark_oak_planks', side: 'cartography_table_side1', n: 'cartography_table_side3', s: 'cartography_table_side2' }, { hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('loom', { props: [P4], tiles: facingTiles('loom_front', 'loom_side', 'loom_top', 'loom_bottom'), hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('stonecutter', { props: [P4], shape: 'model', tex: 'stonecutter_side', icon3: 1, opq: false, att: 0, hard: 3.5, tool: 'pick', req: true, tab: 'func', use: 'stonecutter', model: s => rotY([bx(0, 0, 0, 16, 9, 16, { u: 'stonecutter_top', d: 'stonecutter_bottom', side: 'stonecutter_side' }), bx(1, 9, 8, 15, 16, 8, { side: null, ud: null, n: 'stonecutter_saw', s: 'stonecutter_saw' }, { uv: { n: [1, 9, 15, 16], s: [1, 9, 15, 16] } })], fq(s) + 1), coll: () => [cb(0, 0, 0, 16, 9, 16)] });
  blk('lectern', { props: [P4], shape: 'model', tex: 'lectern_sides', icon3: 1, opq: false, att: 0, hard: 2.5, tool: 'axe', snd: 'wood', tab: 'func', model: s => rotY([bx(0, 0, 0, 16, 2, 16, { u: 'lectern_base', d: 'oak_planks', side: 'lectern_base' }), bx(4, 2, 4, 12, 15, 12, { side: 'lectern_sides', n: 'lectern_front', ud: 'oak_planks' }), bx(0, 13, 1, 16, 17, 15, { u: 'lectern_top', d: 'oak_planks', side: 'lectern_sides' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 2, 16), cb(4, 2, 4, 12, 14, 12)] });
  blk('composter', { props: [['level', [0, 1, 2, 3, 4, 5, 6, 7, 8]]], shape: 'model', tex: 'composter_side', icon3: 1, opq: false, att: 0, hard: .6, tool: 'axe', snd: 'wood', tab: 'func', use: 'composter', model: s => { const l = sv(s, 'level'); const b = [bx(0, 0, 0, 16, 2, 16, { u: 'composter_bottom', d: 'composter_bottom', side: 'composter_side' }), bx(0, 2, 0, 2, 16, 16, { side: 'composter_side', u: 'composter_top' }), bx(14, 2, 0, 16, 16, 16, { side: 'composter_side', u: 'composter_top' }), bx(2, 2, 0, 14, 16, 2, { side: 'composter_side', u: 'composter_top' }), bx(2, 2, 14, 14, 16, 16, { side: 'composter_side', u: 'composter_top' })]; if (l) b.push(bx(2, 0, 2, 14, l === 8 ? 15 : 1 + l * 2, 14, { u: l === 8 ? 'composter_ready' : 'composter_compost', side: null, d: null })); return b; }, coll: () => [cb(0, 0, 0, 16, 2, 16), cb(0, 0, 0, 2, 16, 16), cb(14, 0, 0, 16, 16, 16), cb(0, 0, 0, 16, 16, 2), cb(0, 0, 14, 16, 16, 16)] });
  blk('cauldron', { props: [['level', [0, 1, 2, 3]], ['content', ['water', 'lava', 'powder_snow']]], shape: 'model', tex: 'cauldron_side', icon3: 1, opq: false, att: 0, hard: 2, tool: 'pick', req: true, tab: 'func', use: 'cauldron', light: s => sv(s, 'content') === 1 && sv(s, 'level') ? 15 : 0, drop: 'cauldron', model: s => { const l = sv(s, 'level'), ct = sv(s, 'content'); const b = [bx(0, 3, 0, 2, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(14, 3, 0, 16, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(2, 3, 0, 14, 16, 2, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(2, 3, 14, 14, 16, 16, { side: 'cauldron_side', u: 'cauldron_top', d: 'cauldron_inner' }), bx(0, 3, 0, 16, 4, 16, { u: 'cauldron_inner', d: 'cauldron_bottom', side: null }), bx(0, 0, 0, 4, 3, 2, 'cauldron_side'), bx(0, 0, 2, 2, 3, 4, 'cauldron_side'), bx(12, 0, 0, 16, 3, 2, 'cauldron_side'), bx(14, 0, 2, 16, 3, 4, 'cauldron_side'), bx(0, 0, 14, 4, 3, 16, 'cauldron_side'), bx(0, 0, 12, 2, 3, 14, 'cauldron_side'), bx(12, 0, 14, 16, 3, 16, 'cauldron_side'), bx(14, 0, 12, 16, 3, 14, 'cauldron_side')]; if (l) b.push(bx(2, 4, 2, 14, 4 + l * 3 + (l === 3 ? 0 : 0) + 3, 14, { u: ct === 0 ? 'water_still' : ct === 1 ? 'lava_still' : 'powder_snow', side: null, d: null }, { ti: ct === 0 ? 1 : 0 })); return b; }, coll: () => [cb(0, 0, 0, 16, 4, 16), cb(0, 0, 0, 2, 16, 16), cb(14, 0, 0, 16, 16, 16), cb(0, 0, 0, 16, 16, 2), cb(0, 0, 14, 16, 16, 16)], tint: s => sv(s, 'content') === 0 ? 3 : 0 });
  blk('brewing_stand', { shape: 'model', tex: 'brewing_stand', icon: 'i_brewing_stand', opq: false, att: 0, hard: .5, tool: 'pick', req: true, light: 1, tab: 'func', model: () => [bx(7, 0, 7, 9, 14, 9, 'brewing_stand'), bx(9, 0, 5, 15, 2, 11, { all: 'brewing_stand_base' }), bx(2, 0, 1, 8, 2, 7, 'brewing_stand_base'), bx(2, 0, 9, 8, 2, 15, 'brewing_stand_base'), bx(0, 2, 8, 16, 16, 8, { side: null, ud: null, n: 'brewing_stand', s: 'brewing_stand' })], coll: () => [cb(1, 0, 1, 15, 2, 15), cb(7, 0, 7, 9, 14, 9)] });
  blk('beacon', { shape: 'model', tex: 'beacon', icon3: 1, opq: false, att: 0, hard: 3, light: 15, tab: 'func', model: () => [bx(0, 0, 0, 16, 16, 16, 'glass'), bx(2, .1, 2, 14, 3, 14, 'obsidian'), bx(3, 3, 3, 13, 14, 13, 'beacon')], cullSame: 0, coll: () => FULLCB });
  blk('conduit', { shape: 'model', tex: 'conduit', icon3: 1, opq: false, att: 0, hard: 3, tool: 'pick', light: 15, tab: 'func', model: () => [bx(5, 5, 5, 11, 11, 11, 'conduit')], coll: () => [cb(5, 5, 5, 11, 11, 11)] });
  blk('bell', { props: [P4], shape: 'model', tex: 'bell_body', icon: 'i_bell', opq: false, att: 0, hard: 5, tool: 'pick', snd: 'anvil', tab: 'func', model: s => rotY([bx(5, 6, 5, 11, 13, 11, 'bell_body'), bx(4, 4, 4, 12, 6, 12, 'bell_body'), bx(2, 13, 7, 14, 15, 9, 'dark_oak_planks'), bx(0, 0, 6, 2, 16, 10, 'stone'), bx(14, 0, 6, 16, 16, 10, 'stone')], fq(s)), coll: s => rotCB([cb(4, 4, 4, 12, 16, 12), cb(0, 0, 6, 2, 16, 10), cb(14, 0, 6, 16, 16, 10)], fq(s)) });
  for (const [id, tex, li] of [['campfire', 'campfire_fire', 15], ['soul_campfire', 'soul_campfire_fire', 10]]) blk(id, { props: [P4, PLIT], shape: 'model', tex: 'campfire_log', icon: 'i_' + id, opq: false, att: 0, hard: 2, tool: 'axe', snd: 'wood', light: s => sv(s, 'lit') ? li : 0, tab: 'func', def: { lit: true }, drop: (s, c) => c.silk ? [[id, 1]] : id === 'campfire' ? [['charcoal', 2]] : [['soul_soil', 1]], hurt: 1, model: s => { const lit = sv(s, 'lit'), lg = { side: 'campfire_log', ud: 'campfire_log', e: 'campfire_log', w: 'campfire_log' }; const b = [bx(1, 0, 0, 5, 4, 16, lg), bx(11, 0, 0, 15, 4, 16, lg), bx(0, 3, 11, 16, 7, 15, lg), bx(0, 3, 1, 16, 7, 5, lg), bx(5, 0, 0, 11, 1, 16, lit ? 'campfire_log_lit' : 'campfire_log')]; if (lit) b.push(bx(.8, 1, 8, 15.2, 17, 8, { side: null, ud: null, n: tex, s: tex }), bx(8, 1, .8, 8, 17, 15.2, { side: null, ud: null, e: tex, w: tex })); return rotY(b, fq(s)); }, coll: () => [cb(0, 0, 0, 16, 7, 16)] });
  for (const [id, tex, li] of [['lantern', 'lantern', 15], ['soul_lantern', 'soul_lantern', 10], ['copper_lantern', 'copper_lantern', 15]]) blk(id, { props: [['hanging', [false, true]]], shape: 'model', tex, icon: 'i_' + id, opq: false, att: 0, hard: 3.5, tool: 'pick', snd: 'lantern', light: li, tab: 'func', attach: 6, model: s => { const h = sv(s, 'hanging') ? 1 : 0; return [bx(5, h, 5, 11, 7 + h, 11, tex, { uv: { e: [0, 2, 6, 9], w: [0, 2, 6, 9], s: [0, 2, 6, 9], n: [0, 2, 6, 9], u: [0, 9, 6, 15], d: [0, 9, 6, 15] } }), bx(6, 7 + h, 6, 10, 9 + h, 10, tex, { uv: { e: [1, 0, 5, 2], w: [1, 0, 5, 2], s: [1, 0, 5, 2], n: [1, 0, 5, 2], u: [1, 10, 5, 14], d: [1, 10, 5, 14] } })]; }, coll: s => [cb(5, sv(s, 'hanging'), 5, 11, 9 + sv(s, 'hanging'), 11)] });
  torchB('torch', 'torch', 14, {});
  torchB('soul_torch', 'soul_torch', 10, {});
  torchB('copper_torch', 'copper_torch', 14, {});
  torchB('redstone_torch', 'redstone_torch', 7, { redstone: 1, tab: 'red', props: [PLIT], def: { lit: true }, light: s => sv(s, 'lit') ? 7 : 0, rtorch: 1, ctexL: 1 }, { props: [P4, PLIT] });
  blk('end_rod', { props: [P6], shape: 'model', tex: 'end_rod', icon3: 1, opq: false, att: 0, hard: 0, light: 14, tab: 'func', model: s => { const f = sv(s, 'facing'); let b = [bx(7, 1, 7, 9, 16, 9, 'end_rod', { uv: { e: [0, 0, 2, 15], w: [0, 0, 2, 15], s: [0, 0, 2, 15], n: [0, 0, 2, 15], u: [2, 0, 4, 2], d: [2, 0, 4, 2] } }), bx(6, 0, 6, 10, 1, 10, 'end_rod', { uv: { e: [2, 2, 6, 3], w: [2, 2, 6, 3], s: [2, 2, 6, 3], n: [2, 2, 6, 3], u: [2, 2, 6, 6], d: [2, 2, 6, 6] } })]; if (f === 5) b = flipY(b); return b; }, coll: () => [cb(6, 0, 6, 10, 16, 10)] });
  blk('chain', { props: [PAX], shape: 'model', tex: 'chain', icon: 'i_chain', opq: false, att: 0, hard: 5, tool: 'pick', req: true, snd: 'chain', tab: 'build', model: s => { const a = sv(s, 'axis'); const b = [bx(6.5, 0, 8, 9.5, 16, 8, { side: null, ud: null, n: 'chain', s: 'chain' }, { uv: { n: [0, 0, 3, 16], s: [0, 0, 3, 16] } }), bx(8, 0, 6.5, 8, 16, 9.5, { side: null, ud: null, e: 'chain', w: 'chain' }, { uv: { e: [3, 0, 6, 16], w: [3, 0, 6, 16] } })]; if (a === 0) return b; const B = b.map(x => Object.assign({}, x, { rx: { ax: a === 1 ? 'z' : 'x', ang: 90, o: [8, 8, 8] } })); return B; }, coll: s => { const a = sv(s, 'axis'); return [a === 0 ? cb(6.5, 0, 6.5, 9.5, 16, 9.5) : a === 1 ? cb(0, 6.5, 6.5, 16, 9.5, 9.5) : cb(6.5, 6.5, 0, 9.5, 9.5, 16)]; } });
  pane('iron_bars', 'iron_bars', 'iron_bars', { hard: 5, tool: 'pick', req: true, snd: 'metal', drop: undefined, cls: 'pane', tab: 'build' });
  blk('ladder', { props: [P4], shape: 'model', tex: 'ladder', icon: 'ladder', opq: false, solid: true, att: 0, hard: .4, tool: 'axe', snd: 'ladder', climb: 1, tab: 'func', attach: 1, flam: 1, model: s => rotY([bx(0, 0, 15.2, 16, 16, 15.2, { side: null, ud: null, n: 'ladder', s: 'ladder' })], fq(s)), coll: s => rotCB([cb(0, 0, 13, 16, 16, 16)], fq(s)) });
  blk('scaffolding', { props: [['distance', [0, 1, 2, 3, 4, 5, 6, 7]], ['bottom', [false, true]]], shape: 'model', tex: 'scaffolding_side', icon3: 1, opq: false, att: 0, hard: 0, snd: 'scaffold', climb: 1, tab: 'func', flam: 1, model: () => [bx(0, 14, 0, 16, 16, 16, { u: 'scaffolding_top', d: 'scaffolding_bottom', side: 'scaffolding_side' }), bx(0, 0, 0, 2, 14, 2, 'scaffolding_side'), bx(14, 0, 0, 16, 14, 2, 'scaffolding_side'), bx(0, 0, 14, 2, 14, 16, 'scaffolding_side'), bx(14, 0, 14, 16, 14, 16, 'scaffolding_side')], coll: () => [cb(0, 14, 0, 16, 16, 16)], sel: () => FULLCB });
  C('jukebox', { side: 'jukebox_side', top: 'jukebox_top', bottom: 'jukebox_side' }, { hard: 2, tool: 'axe', snd: 'wood', tab: 'func', use: 'jukebox', flam: 1 });
  C('note_block', 'note_block', { hard: .8, tool: 'axe', snd: 'wood', tab: 'red', use: 'note', props: [['note', Array.from({ length: 25 }, (_, i) => i)], PPOW], redstone: 1, flam: 1 });
  blk('flower_pot', { props: [['plant', ['none'].concat(FLOWERS, ['oak_sapling', 'spruce_sapling', 'birch_sapling', 'jungle_sapling', 'acacia_sapling', 'dark_oak_sapling', 'cherry_sapling', 'pale_oak_sapling', 'poplar_sapling', 'fern', 'dead_bush', 'red_mushroom', 'brown_mushroom', 'cactus', 'bamboo', 'azalea', 'crimson_fungus', 'warped_fungus', 'crimson_roots', 'warped_roots', 'mangrove_propagule'])]], shape: 'model', tex: 'flower_pot', icon: 'i_flower_pot', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'func', use: 'pot', model: s => { const p = svn(s, 'plant'), b = [bx(5, 0, 5, 6, 6, 11, 'flower_pot'), bx(10, 0, 5, 11, 6, 11, 'flower_pot'), bx(6, 0, 5, 10, 6, 6, 'flower_pot'), bx(6, 0, 10, 10, 6, 11, 'flower_pot'), bx(6, 0, 6, 10, 4, 10, { u: 'dirt', side: null, d: 'flower_pot' })]; if (p !== 'none') { const tx = p === 'cactus' ? 'cactus_side' : p === 'bamboo' ? 'bamboo_stalk' : p === 'azalea' ? 'azalea_plant' : p; if (p === 'cactus') b.push(bx(6, 4, 6, 10, 15, 10, { side: 'cactus_side', u: 'cactus_top', d: null })); else b.push(bx(2.6, 4, 8, 13.4, 16, 8, { side: null, ud: null, n: tx, s: tx }, { ti: p === 'fern' ? 1 : 0 }), bx(8, 4, 2.6, 8, 16, 13.4, { side: null, ud: null, e: tx, w: tx }, { ti: p === 'fern' ? 1 : 0 })); } return b; }, coll: () => [cb(5, 0, 5, 11, 6, 11)], drop: s => { const p = svn(s, 'plant'); return p === 'none' ? [['flower_pot', 1]] : [['flower_pot', 1], [p, 1]]; } });
  blk('decorated_pot', { props: [P4], shape: 'model', tex: 'decorated_pot_side', icon3: 1, opq: false, att: 0, hard: 0, snd: 'decorated_pot', tab: 'func', model: s => rotY([bx(1, 0, 1, 15, 16, 15, { side: 'decorated_pot_side', u: 'decorated_pot_top', d: 'decorated_pot_bottom' }), bx(4, 16, 4, 12, 20, 12, { side: 'decorated_pot_neck', u: 'decorated_pot_top', d: null })], fq(s)), coll: () => [cb(1, 0, 1, 15, 16, 15)] });
  for (const c of COLORS) {
    const dn = title(c);
    C(c + '_wool', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', tags: ['wool'], color: c });
    stairs(c + '_wool_stairs', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', color: c });
    slab(c + '_wool_slab', c + '_wool', { hard: .8, tool: 'shears', snd: 'wool', flam: 1, tab: 'color', color: c });
    carpet(c + '_carpet', c + '_wool', { color: c });
    C(c + '_terracotta', c + '_terracotta', { hard: 1.25, tool: 'pick', req: true, tab: 'color', color: c });
    blk(c + '_glazed_terracotta', { props: [P4], tiles: s => { const q = fq(s), n = c + '_glazed_terracotta'; return [[n, (q + 1) & 3], [n, (q + 3) & 3], [n, q], [n, (q + 2) & 3], [n, q], [n, (q + 2) & 3]]; }, hard: 1.4, tool: 'pick', req: true, tab: 'color', color: c });
    C(c + '_concrete', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    stairs(c + '_concrete_stairs', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    slab(c + '_concrete_slab', c + '_concrete', { hard: 1.8, tool: 'pick', req: true, tab: 'color', color: c });
    C(c + '_concrete_powder', c + '_concrete_powder', { hard: .5, tool: 'shovel', snd: 'sand', grav: 1, tab: 'color', powder2: c + '_concrete', color: c, dust: DYE[c] });
    C(c + '_stained_glass', c + '_stained_glass', { hard: .3, snd: 'glass', opq: false, att: 0, cullSame: 20 + COLORS.indexOf(c), trans: 1, drop: null, tab: 'color', color: c });
    pane(c + '_stained_glass_pane', c + '_stained_glass', c + '_stained_glass_pane_top', { trans: 1, color: c });
    blk(c + '_bed', { props: [P4, ['part', ['foot', 'head']], ['occupied', [false, true]]], shape: 'model', tex: c + '_wool', icon: 'i_' + c + '_bed', opq: false, att: 0, hard: .2, snd: 'wood', tab: 'func', use: 'bed', bed: 1, color: c, bouncy: .66,
      model: s => { const hd = sv(s, 'part'), t = 'bed_' + c; const top = hd ? t + '_top_head' : t + '_top_foot'; const b = [bx(0, 3, 0, 16, 9, 16, { u: top, d: 'oak_planks', side: hd ? t + '_side_head' : t + '_side_foot', n: hd ? t + '_end' : null, s: hd ? null : t + '_end' })]; b.push(bx(0, 0, hd ? 0 : 13, 3, 3, hd ? 3 : 16, 'bed_leg'), bx(13, 0, hd ? 0 : 13, 16, 3, hd ? 3 : 16, 'bed_leg')); return rotY(b, fq(s)); },
      coll: () => [cb(0, 0, 0, 16, 9, 16)], drop: s => sv(s, 'part') ? null : c + '_bed' });
    blk(c + '_candle', { props: [['candles', [1, 2, 3, 4]], PLIT], shape: 'model', tex: c + '_candle', icon: 'i_' + c + '_candle', opq: false, att: 0, hard: .1, snd: 'candle', tab: 'color', light: s => sv(s, 'lit') ? (sv(s, 'candles') + 1) * 3 : 0, model: s => candleBoxes(c + '_candle', s), sel: () => [cb(5, 0, 5, 11, 7, 11)], drop: s => [[c + '_candle', sv(s, 'candles') + 1]], use: 'candle', color: c });
    blk(c + '_shulker_box', { props: [P6], tex: c + '_shulker_box', tiles: () => ['shulker_' + c + '_side', 'shulker_' + c + '_side', 'shulker_' + c + '_top', 'shulker_' + c + '_bottom', 'shulker_' + c + '_side', 'shulker_' + c + '_side'], hard: 2, tool: 'pick', tab: 'func', use: 'chest', cont: 27, shulker: 1, color: c, stack: 1, place6: 1 });
    blk(c + '_banner', { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'banner_' + c, icon: 'i_' + c + '_banner', opq: false, solid: false, att: 0, hard: 1, tool: 'axe', snd: 'wood', tab: 'color', stack: 16, color: c, model: s => rotY([bx(1, 2, 7.5, 15, 30, 8.5, { side: 'banner_' + c, ud: 'banner_' + c }), bx(7.5, 0, 7.5, 8.5, 31, 8.5, 'banner_pole'), bx(1, 30, 7, 15, 31, 9, 'banner_pole')], Math.round(sv(s, 'rotation') / 4)), sel: () => [cb(4, 0, 4, 12, 16, 12)] });
  }
  blk('candle', { props: [['candles', [1, 2, 3, 4]], PLIT], shape: 'model', tex: 'candle', icon: 'i_candle', opq: false, att: 0, hard: .1, snd: 'candle', tab: 'color', light: s => sv(s, 'lit') ? (sv(s, 'candles') + 1) * 3 : 0, model: s => candleBoxes('candle', s), sel: () => [cb(5, 0, 5, 11, 7, 11)], drop: s => [['candle', sv(s, 'candles') + 1]], use: 'candle' });
  blk('shulker_box', { props: [P6], tex: 'shulker_box', tiles: () => ['shulker_side', 'shulker_side', 'shulker_top', 'shulker_bottom', 'shulker_side', 'shulker_side'], hard: 2, tool: 'pick', tab: 'func', use: 'chest', cont: 27, shulker: 1, stack: 1, place6: 1 });
  C('terracotta', 'terracotta', { hard: 1.25, tool: 'pick', req: true, tab: 'color' });
  blk('cake', { props: [['bites', [0, 1, 2, 3, 4, 5, 6]]], shape: 'model', tex: 'cake_top', icon: 'i_cake', opq: false, att: 0, hard: .5, snd: 'wool', tab: 'food', stack: 1, use: 'cake', drop: null, model: s => { const b = sv(s, 'bites'), x0 = 1 + b * 2; return [bx(x0, 0, 1, 15, 8, 15, { u: 'cake_top', d: 'cake_bottom', side: 'cake_side', w: b ? 'cake_inner' : 'cake_side' })]; }, coll: s => [cb(1 + sv(s, 'bites') * 2, 0, 1, 15, 8, 15)] });
  blk('tnt', { tex: { side: 'tnt_side', top: 'tnt_top', bottom: 'tnt_bottom' }, hard: 0, snd: 'grass', tab: 'red', tnt: 1, use: 'tnt', flam: 1, redstone: 1 });
  blk('redstone_wire', { props: [['power', Array.from({ length: 16 }, (_, i) => i)]], shape: 'cmodel', tex: 'redstone_dust_dot', item: 'redstone', name: 'Redstone Wire', opq: false, solid: false, att: 0, hard: 0, snd: 'stone', tint: 10, wire: 1, redstone: 1, attach: 3, drop: 'redstone',
    cmask: (s, nb) => { let m = 0; for (let q = 0; q < 4; q++) { const d = F4D[q], n = nb(d[0], 0, d[1]); const t = TT[STT[n]]; if (t.wire || t.redstone || t.power || (t.rep && (fq(n) & 1) === (q & 1))) m |= 1 << q; else if (!FULLT[n] && TT[STT[nb(d[0], -1, d[1])]].wire) m |= 1 << q; else if (FULLT[n] && !FULLT[nb(0, 1, 0)] && TT[STT[nb(d[0], 1, d[1])]].wire) m |= 17 << q; } return m; },
    cmodel: (s, m) => { const b = [], c = m & 15; const ln = (q) => rotY([bx(0, .25, 0, 16, .25, 8, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1, uv: { u: [0, 0, 16, 8] }, r: { u: 1 } })], q); const cnt = (c & 1) + (c >> 1 & 1) + (c >> 2 & 1) + (c >> 3 & 1); if (cnt === 0) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_dot', d: null }, { ti: 1 })); return b; } if (c === 5 || c === 1 || c === 4) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1 })); } else if (c === 10 || c === 2 || c === 8) { b.push(bx(0, .25, 0, 16, .25, 16, { side: null, u: 'redstone_dust_line1', d: null }, { ti: 1 })); } else { b.push(bx(4, .25, 4, 12, .25, 12, { side: null, u: 'redstone_dust_dot', d: null }, { ti: 1, uv: { u: [4, 4, 12, 12] } })); for (let q = 0; q < 4; q++) if (c & 1 << q) b.push(...rotY([bx(5, .25, 0, 11, .25, 5, { side: null, u: 'redstone_dust_line0', d: null }, { ti: 1, uv: { u: [5, 0, 11, 5] } })], q)); } for (let q = 0; q < 4; q++) if (m & 16 << q) b.push(...rotY([bx(0, 0, .25, 16, 16, .25, { side: null, ud: null, s: 'redstone_dust_line0', n: null }, { ti: 1 })], q)); return b; },
    sel: () => [cb(0, 0, 0, 16, 1, 16)] });
  blk('lever', { props: [['face', BTN_FACE], P4, PPOW], shape: 'model', tex: 'lever', icon: 'lever', opq: false, solid: false, att: 0, hard: .5, snd: 'wood', use: 'lever', tab: 'red', attach: 1, redstone: 1,
    model: s => { const f = sv(s, 'face'), p = sv(s, 'powered'); let b = [bx(5, 0, 4, 11, 3, 12, 'cobblestone')]; const h = bx(7, 1, 7, 9, 11, 9, 'lever', { uv: { e: [7, 6, 9, 16], w: [7, 6, 9, 16], s: [7, 6, 9, 16], n: [7, 6, 9, 16], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } }); h.rx = { ax: 'x', ang: p ? -45 : 45, o: [8, 1, 8] }; b.push(h); if (f === 1) b = b.map(B => Object.assign({}, B, { rx2: { ax: 'x', ang: 90, o: [8, 8, 8] } })); if (f === 2) b = b.map(B => Object.assign({}, B, { rx2: { ax: 'x', ang: 180, o: [8, 8, 8] } })); return rotY(b, fq(s) + 2); },
    sel: s => { const f = sv(s, 'face'); return f === 0 ? [cb(4, 0, 4, 12, 6, 12)] : f === 2 ? [cb(4, 10, 4, 12, 16, 12)] : rotCB([cb(5, 4, 10, 11, 12, 16)], fq(s)); } });
  button('stone_button', 'stone', { snd: 'stone', btnTime: 20 }); button('polished_blackstone_button', 'polished_blackstone', { snd: 'stone', btnTime: 20 });
  plate('stone_pressure_plate', 'stone', { snd: 'stone', plateKind: 'mob' }); plate('polished_blackstone_pressure_plate', 'polished_blackstone', { snd: 'stone', plateKind: 'mob' });
  plate('light_weighted_pressure_plate', 'gold_block', { snd: 'metal', plateKind: 'light', props: [['power', Array.from({ length: 16 }, (_, i) => i)]] });
  plate('heavy_weighted_pressure_plate', 'iron_block', { snd: 'metal', plateKind: 'heavy', props: [['power', Array.from({ length: 16 }, (_, i) => i)]] });
  blk('redstone_lamp', { props: [PLIT], tiles: s => new Array(6).fill(sv(s, 'lit') ? 'redstone_lamp_on' : 'redstone_lamp'), hard: .3, snd: 'glass', light: s => sv(s, 'lit') ? 15 : 0, tab: 'red', lamp: 1, redstone: 1 });
  blk('repeater', { props: [P4, ['delay', [1, 2, 3, 4]], PPOW, ['locked', [false, true]]], shape: 'model', tex: 'repeater', icon: 'i_repeater', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'red', rep: 1, redstone: 1, attach: 3, use: 'repeater',
    model: s => { const p = sv(s, 'powered'), d = sv(s, 'delay'), t = p ? 'redstone_torch' : 'redstone_torch_off'; return rotY([bx(0, 0, 0, 16, 2, 16, { u: p ? 'repeater_on' : 'repeater', d: 'smooth_stone', side: 'smooth_stone_slab_side' }), bx(7, 2, 2, 9, 7, 4, t, { uv: { e: [7, 6, 9, 11], w: [7, 6, 9, 11], s: [7, 6, 9, 11], n: [7, 6, 9, 11], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } }), bx(7, 2, 6 + d * 2, 9, 7, 8 + d * 2, t, { uv: { e: [7, 6, 9, 11], w: [7, 6, 9, 11], s: [7, 6, 9, 11], n: [7, 6, 9, 11], u: [7, 6, 9, 8], d: [7, 6, 9, 8] } })], fq(s)); },
    coll: () => [cb(0, 0, 0, 16, 2, 16)], light: s => sv(s, 'powered') ? 7 : 0 });
  blk('comparator', { props: [P4, ['mode', ['compare', 'subtract']], PPOW], shape: 'model', tex: 'comparator', icon: 'i_comparator', opq: false, att: 0, hard: 0, snd: 'stone', tab: 'red', redstone: 1, attach: 3, model: s => rotY([bx(0, 0, 0, 16, 2, 16, { u: sv(s, 'powered') ? 'comparator_on' : 'comparator', d: 'smooth_stone', side: 'smooth_stone_slab_side' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 2, 16)] });
  blk('daylight_detector', { props: [['inverted', [false, true]], ['power', Array.from({ length: 16 }, (_, i) => i)]], shape: 'model', tex: 'daylight_detector_top', icon3: 1, opq: false, att: 0, hard: .2, tool: 'axe', snd: 'wood', tab: 'red', redstone: 1, daylight: 1, use: 'daylight', model: s => [bx(0, 0, 0, 16, 6, 16, { u: sv(s, 'inverted') ? 'daylight_detector_inverted_top' : 'daylight_detector_top', d: 'daylight_detector_side', side: 'daylight_detector_side' })], coll: () => [cb(0, 0, 0, 16, 6, 16)], power: s => sv(s, 'power') });
  blk('observer', { props: [P6, PPOW], tiles: s => { const f = sv(s, 'facing'), t = new Array(6).fill('observer_side'); if (f < 4) { t[F4FACE[f]] = 'observer_front'; t[OPP6[F4FACE[f]]] = sv(s, 'powered') ? 'observer_back_on' : 'observer_back'; t[2] = ['observer_top', f]; t[3] = ['observer_top', f]; } else { t[f === 4 ? 2 : 3] = 'observer_front'; t[f === 4 ? 3 : 2] = sv(s, 'powered') ? 'observer_back_on' : 'observer_back'; } return t; }, hard: 3, tool: 'pick', req: true, tab: 'red', redstone: 1, place6: 2 });
  blk('dispenser', { props: [P6], tiles: s => { const f = sv(s, 'facing'), t = ['furnace_side', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side']; if (f < 4) t[F4FACE[f]] = 'dispenser_front'; else { t[f === 4 ? 2 : 3] = 'dispenser_front_vertical'; } return t; }, hard: 3.5, tool: 'pick', req: true, tab: 'red', use: 'chest', cont: 9, redstone: 1, place6: 2 });
  blk('dropper', { props: [P6], tiles: s => { const f = sv(s, 'facing'), t = ['furnace_side', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side']; if (f < 4) t[F4FACE[f]] = 'dropper_front'; else { t[f === 4 ? 2 : 3] = 'dropper_front_vertical'; } return t; }, hard: 3.5, tool: 'pick', req: true, tab: 'red', use: 'chest', cont: 9, redstone: 1, place6: 2 });
  blk('hopper', { props: [['facing', ['down', 'north', 'south', 'west', 'east']]], shape: 'model', tex: 'hopper_outside', icon: 'i_hopper', opq: false, att: 0, hard: 3, tool: 'pick', req: true, snd: 'metal', tab: 'red', use: 'chest', cont: 5, model: () => [bx(0, 10, 0, 16, 11, 16, { u: 'hopper_inside', d: 'hopper_outside', side: 'hopper_outside' }), bx(0, 11, 0, 2, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(14, 11, 0, 16, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(2, 11, 0, 14, 16, 2, { side: 'hopper_outside', u: 'hopper_top' }), bx(2, 11, 14, 14, 16, 16, { side: 'hopper_outside', u: 'hopper_top' }), bx(4, 4, 4, 12, 10, 12, 'hopper_outside'), bx(6, 0, 6, 10, 4, 10, 'hopper_outside')], coll: () => [cb(0, 10, 0, 16, 16, 16), cb(4, 4, 4, 12, 10, 12), cb(6, 0, 6, 10, 4, 10)] });
  for (const id of ['piston', 'sticky_piston']) blk(id, { props: [P6, ['extended', [false, true]]], tiles: s => { const f = sv(s, 'facing'), front = id === 'sticky_piston' ? 'piston_top_sticky' : 'piston_top'; const t = new Array(6); if (f < 4) { const fi = F4FACE[f]; for (let i = 0; i < 6; i++) t[i] = i === fi ? front : i === OPP6[fi] ? 'piston_bottom' : ['piston_side', i === 2 ? (f + 2) & 3 : i === 3 ? (f + 2) & 3 : f & 1 ? (f === 1 ? 3 : 1) : f === 0 ? 2 : 0]; } else for (let i = 0; i < 6; i++) t[i] = i === 2 ? (f === 4 ? front : 'piston_bottom') : i === 3 ? (f === 4 ? 'piston_bottom' : front) : ['piston_side', f === 4 ? 0 : 2]; return t; }, hard: 1.5, tool: 'pick', tab: 'red', redstone: 1, piston: id === 'sticky_piston' ? 2 : 1, place6: 2 });
  blk('tripwire_hook', { props: [P4, PPOW], shape: 'model', tex: 'tripwire_hook', icon: 'tripwire_hook', opq: false, solid: false, att: 0, hard: 0, snd: 'wood', tab: 'red', attach: 1, redstone: 1, model: s => rotY([bx(6, 1, 14, 10, 9, 16, 'oak_planks'), bx(7.5, 5, 6, 8.5, 6, 14, 'tripwire_hook')], fq(s)), sel: s => rotCB([cb(5, 0, 10, 11, 10, 16)], fq(s)) });
  blk('lightning_rod', { props: [P6], shape: 'model', tex: 'lightning_rod', icon3: 1, opq: false, att: 0, hard: 3, tool: 'pick', req: true, snd: 'copper', tab: 'red', model: () => [bx(7, 0, 7, 9, 12, 9, 'lightning_rod', { uv: { e: [0, 4, 2, 16], w: [0, 4, 2, 16], s: [0, 4, 2, 16], n: [0, 4, 2, 16], u: [0, 0, 2, 2], d: [0, 0, 2, 2] } }), bx(6, 12, 6, 10, 16, 10, 'lightning_rod', { uv: { e: [0, 0, 4, 4], w: [0, 0, 4, 4], s: [0, 0, 4, 4], n: [0, 0, 4, 4], u: [0, 0, 4, 4], d: [0, 0, 4, 4] } })], coll: () => [cb(6, 0, 6, 10, 16, 10)] });
  for (const [id, tex] of [['rail', 'rail'], ['powered_rail', 'powered_rail'], ['detector_rail', 'detector_rail'], ['activator_rail', 'activator_rail']]) blk(id, { props: [['shape', id === 'rail' ? ['north_south', 'east_west', 'ascending_east', 'ascending_west', 'ascending_north', 'ascending_south', 'south_east', 'south_west', 'north_west', 'north_east'] : ['north_south', 'east_west', 'ascending_east', 'ascending_west', 'ascending_north', 'ascending_south']], PPOW], shape: 'model', tex, icon: tex, opq: false, solid: false, att: 0, hard: .7, tool: 'pick', snd: 'metal', tab: 'red', rail: 1, attach: 3, model: s => railBoxes(id === 'rail' ? tex : sv(s, 'powered') ? tex + '_on' : tex, sv(s, 'shape'), id === 'rail' ? 'rail_corner' : null), sel: () => [cb(0, 0, 0, 16, 2, 16)] });
  blk('respawn_anchor', { props: [['charges', [0, 1, 2, 3, 4]]], tiles: s => ['respawn_anchor_side' + sv(s, 'charges'), 'respawn_anchor_side' + sv(s, 'charges'), sv(s, 'charges') ? 'respawn_anchor_top' : 'respawn_anchor_top_off', 'respawn_anchor_bottom', 'respawn_anchor_side' + sv(s, 'charges'), 'respawn_anchor_side' + sv(s, 'charges')], hard: 50, tool: 'pick', req: true, lvl: 3, light: s => [0, 3, 7, 11, 15][sv(s, 'charges')], tab: 'func' });
  C('lodestone', { side: 'lodestone_side', ud: 'lodestone_top' }, { hard: 3.5, tool: 'pick', snd: 'lodestone', tab: 'func' });
  blk('spawner', { tex: 'spawner', opq: false, att: 0, cullSame: 7, hard: 5, tool: 'pick', req: true, snd: 'metal', drop: null, xp: [15, 43], tab: 'eggs' });
  blk('trial_spawner', { tex: { side: 'trial_spawner_side', top: 'trial_spawner_top', bottom: 'trial_spawner_bottom' }, opq: false, att: 0, cullSame: 8, hard: 50, tool: 'pick', snd: 'metal', drop: null, tab: 'eggs' });
  blk('vault', { props: [P4], tiles: facingTiles('vault_front', 'vault_side', 'vault_top', 'vault_bottom'), opq: false, att: 0, cullSame: 9, hard: 50, snd: 'metal', drop: null, tab: 'func' });
  blk('crafter', { props: [P6], tiles: () => ['crafter_east', 'crafter_west', 'crafter_top', 'crafter_bottom', 'crafter_south', 'crafter_north'], hard: 1.5, tool: 'pick', req: true, tab: 'red', place6: 2 });
  blk('heavy_core', { shape: 'model', tex: 'heavy_core', icon3: 1, opq: false, att: 0, hard: 10, snd: 'heavy_core', tab: 'func', model: () => [bx(4, 0, 4, 12, 8, 12, 'heavy_core')], coll: () => [cb(4, 0, 4, 12, 8, 12)] });
  blk('end_portal_frame', { props: [P4, ['eye', [false, true]]], shape: 'model', tex: 'end_portal_frame_side', icon3: 1, opq: false, att: 0, hard: -1, light: 1, tab: 'func', model: s => { const b = [bx(0, 0, 0, 16, 13, 16, { u: 'end_portal_frame_top', d: 'end_stone', side: 'end_portal_frame_side' })]; if (sv(s, 'eye')) b.push(bx(4, 13, 4, 12, 16, 12, { u: 'end_portal_frame_eye', side: 'end_portal_frame_eye', d: null }, { uv: { e: [4, 0, 12, 3], w: [4, 0, 12, 3], s: [4, 0, 12, 3], n: [4, 0, 12, 3], u: [4, 4, 12, 12] } })); return rotY(b, fq(s)); }, coll: () => [cb(0, 0, 0, 16, 13, 16)] });
  blk('beehive', { props: [P4, ['honey_level', [0, 1, 2, 3, 4, 5]]], tiles: s => { const t = ['beehive_side', 'beehive_side', 'beehive_end', 'beehive_end', 'beehive_side', 'beehive_side']; t[F4FACE[fq(s)]] = sv(s, 'honey_level') === 5 ? 'beehive_front_honey' : 'beehive_front'; return t; }, hard: .6, tool: 'axe', snd: 'wood', tab: 'func', flam: 1 });
  blk('bee_nest', { props: [P4, ['honey_level', [0, 1, 2, 3, 4, 5]]], tiles: s => { const t = ['bee_nest_side', 'bee_nest_side', 'bee_nest_top', 'bee_nest_bottom', 'bee_nest_side', 'bee_nest_side']; t[F4FACE[fq(s)]] = sv(s, 'honey_level') === 5 ? 'bee_nest_front_honey' : 'bee_nest_front'; return t; }, hard: .3, tool: 'axe', snd: 'wood', tab: 'nature', flam: 1, drop: (s, c) => c.silk ? [['bee_nest', 1]] : null });
  blk('dragon_egg', { shape: 'model', tex: 'dragon_egg', icon3: 1, opq: false, att: 0, hard: 3, light: 1, grav: 1, tab: 'func', model: () => [bx(6, 15, 6, 10, 16, 10, 'dragon_egg'), bx(5, 14, 5, 11, 15, 11, 'dragon_egg'), bx(4, 13, 4, 12, 14, 12, 'dragon_egg'), bx(3, 11, 3, 13, 13, 13, 'dragon_egg'), bx(2, 8, 2, 14, 11, 14, 'dragon_egg'), bx(1, 3, 1, 15, 8, 15, 'dragon_egg'), bx(2, 1, 2, 14, 3, 14, 'dragon_egg'), bx(3, 0, 3, 13, 1, 13, 'dragon_egg')], coll: () => [cb(1, 0, 1, 15, 16, 15)] });
  for (const [id, tex] of [['ochre_froglight', 'ochre_froglight'], ['verdant_froglight', 'verdant_froglight'], ['pearlescent_froglight', 'pearlescent_froglight']]) pillar(id, tex + '_side', tex + '_top', { hard: .3, snd: 'froglight', light: 15, tab: 'nature' });
  blk('creaking_heart', { props: [PAX, ['state', ['uprooted', 'dormant', 'awake']]], tiles: s => { const st = sv(s, 'state'), side = st === 2 ? 'creaking_heart_awake' : st === 1 ? 'creaking_heart_dormant' : 'creaking_heart', top = 'creaking_heart_top'; return pillarTiles(side, top)(s); }, hard: 10, tool: 'axe', snd: 'creaking_heart', tab: 'nature' });
  const COPPER = [['', 'copper_block'], ['exposed_', 'exposed_copper'], ['weathered_', 'weathered_copper'], ['oxidized_', 'oxidized_copper']];
  for (const wax of [0, 1]) for (const [p, tex] of COPPER) {
    const w = wax ? 'waxed_' : '';
    const co = { hard: 3, tool: 'pick', req: true, lvl: 1, snd: 'copper', ox: wax ? -1 : COPPER.findIndex(c => c[0] === p), tab: 'build' };
    C(w + (p ? p + 'copper' : 'copper_block'), tex, co);
    C(w + p + 'chiseled_copper', p + 'chiseled_copper', co);
    C(w + p + 'copper_grate', p + 'copper_grate', Object.assign({}, co, { opq: false, att: 0, cullSame: 30 }));
    C(w + p + 'cut_copper', p + 'cut_copper', co);
    stairs(w + p + 'cut_copper_stairs', p + 'cut_copper', co); slab(w + p + 'cut_copper_slab', p + 'cut_copper', co);
    door(w + p + 'copper_door', p + 'copper', Object.assign({}, co, { tab: 'build', icon: 'i_' + p + 'copper_door' }));
    trapdoor(w + p + 'copper_trapdoor', p + 'copper_trapdoor', Object.assign({}, co));
    blk(w + p + 'copper_bulb', Object.assign({}, co, { props: [PLIT, PPOW], tiles: s => new Array(6).fill(p + 'copper_bulb' + (sv(s, 'lit') ? '_lit' : '') + (sv(s, 'powered') ? '_powered' : '')), light: s => sv(s, 'lit') ? [15, 12, 8, 4][COPPER.findIndex(c => c[0] === p)] : 0, tab: 'red', redstone: 1, bulb: 1 }));
    blk(w + p + 'copper_chest', Object.assign({}, co, { props: [P4], shape: 'model', tex: p + 'copper_chest_side', icon3: 1, opq: false, att: 0, tab: 'func', use: 'chest', cont: 27, model: s => rotY([bx(1, 0, 1, 15, 14, 15, { u: p + 'copper_chest_top', d: p + 'copper_chest_top', side: p + 'copper_chest_side', n: p + 'copper_chest_front' }, { uv: { e: [1, 2, 15, 16], w: [1, 2, 15, 16], s: [1, 2, 15, 16], n: [1, 2, 15, 16], u: [1, 1, 15, 15], d: [1, 1, 15, 15] } })], fq(s)), coll: () => [cb(1, 0, 1, 15, 14, 15)] }));
  }
  door('iron_door', 'iron', { hard: 5, tool: 'pick', req: true, snd: 'metal', use: 'idoor', icon: 'i_iron_door', tab: 'red' });
  trapdoor('iron_trapdoor', 'iron_trapdoor', { hard: 5, tool: 'pick', req: true, snd: 'metal', use: 'idoor', tab: 'red' });
  for (const [id, tex] of [['skeleton_skull', 'skeleton'], ['wither_skeleton_skull', 'wither_skeleton'], ['zombie_head', 'zombie'], ['player_head', 'steve'], ['creeper_head', 'creeper'], ['piglin_head', 'piglin'], ['dragon_head', 'dragon']]) {
    blk(id, { props: [['rotation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]]], shape: 'model', tex: 'head_' + tex + '_front', icon3: 1, opq: false, att: 0, hard: 1, snd: 'stone', tab: 'func', wear: 'head', head: tex, model: s => rotY([bx(4, 0, 4, 12, 8, 12, { u: 'head_' + tex + '_top', d: 'head_' + tex + '_top', side: 'head_' + tex + '_side', n: 'head_' + tex + '_front', s: 'head_' + tex + '_back' })], Math.round(sv(s, 'rotation') / 4)), coll: () => [cb(4, 0, 4, 12, 8, 12)] });
    blk(id.replace(/_(skull|head)$/, '_wall_$1'), { props: [P4], shape: 'model', tex: 'head_' + tex + '_front', opq: false, att: 0, hard: 1, snd: 'stone', item: id, name: title(id), drop: id, head: tex, model: s => rotY([bx(4, 4, 8, 12, 12, 16, { u: 'head_' + tex + '_top', d: 'head_' + tex + '_top', side: 'head_' + tex + '_side', n: 'head_' + tex + '_front', s: 'head_' + tex + '_back' })], fq(s)), coll: s => rotCB([cb(4, 4, 8, 12, 12, 16)], fq(s)) });
  }
  blk('straw_bed', { props: [P4, ['part', ['foot', 'head']]], shape: 'model', tex: 'straw_bed_top', icon: 'i_straw_bed', opq: false, att: 0, hard: .2, tool: 'hoe', snd: 'grass', tab: 'func', use: 'bed', bed: 2, model: s => rotY([bx(0, 0, 0, 16, 5, 16, { u: sv(s, 'part') ? 'straw_bed_top_head' : 'straw_bed_top', d: 'hay_block_top', side: 'straw_bed_side' })], fq(s)), coll: () => [cb(0, 0, 0, 16, 5, 16)], drop: s => sv(s, 'part') ? null : 'straw_bed' });
  blk('light', { props: [['level', Array.from({ length: 16 }, (_, i) => i)]], shape: 'none', opq: false, solid: false, att: 0, hard: -1, light: s => sv(s, 'level'), repl: true, tab: null, icon: 'i_light', def: { level: 15 } });
  blk('barrier', { shape: 'none', opq: false, att: 0, hard: -1, tab: null, icon: 'i_barrier' });
  blk('structure_void', { shape: 'none', opq: false, solid: false, att: 0, hard: 0, tab: null, icon: 'i_structure_void', repl: true });
  C('command_block', { side: 'command_block_side', n: 'command_block_front', s: 'command_block_back', ud: 'command_block_side' }, { hard: -1, tab: null });
  blk('nether_portal', { props: [['axis', ['x', 'z']]], shape: 'model', tex: 'nether_portal', opq: false, solid: false, att: 0, hard: -1, light: 11, trans: 1, item: false, drop: null, model: s => sv(s, 'axis') ? [bx(6, 0, 0, 10, 16, 16, { side: null, ud: null, e: 'nether_portal', w: 'nether_portal' })] : [bx(0, 0, 6, 16, 16, 10, { side: null, ud: null, n: 'nether_portal', s: 'nether_portal' })] });
  function crossBoxes(t, s, h, w) { const f = sv(s, 'facing'); let b = [bx(8 - w, 0, 8, 8 + w, h * 2, 8, { side: null, ud: null, n: t, s: t }, { uv: { n: [8 - w, 16 - h * 2, 8 + w, 16], s: [8 - w, 16 - h * 2, 8 + w, 16] } }), bx(8, 0, 8 - w, 8, h * 2, 8 + w, { side: null, ud: null, e: t, w: t }, { uv: { e: [8 - w, 16 - h * 2, 8 + w, 16], w: [8 - w, 16 - h * 2, 8 + w, 16] } })]; if (f === 5) b = flipY(b); else if (f < 4) b = b.map(B => Object.assign({}, B, { rx: { ax: 'x', ang: 90, o: [8, 8, 8], q: 0 } })), b = rotY(b, f); return b; }
  function budSel(s, h, w) { return [cb(8 - w, 0, 8 - w, 8 + w, h * 2, 8 + w)]; }
  function petals(t, s, flat) { const n = sv(s, 'flower_amount') + 1 || sv(s, 'segment_amount') + 1, b = []; const q = [[0, 0], [8, 0], [8, 8], [0, 8]]; for (let i = 0; i < n; i++) { const [x, z] = q[i]; b.push(bx(x, flat ? .3 : 1.5, z, x + 8, flat ? .3 : 1.5, z + 8, { side: null, u: t, d: t }, { uv: { u: [x, z, x + 8, z + 8], d: [x, z, x + 8, z + 8] } })); } return rotY(b, fq(s)); }
  function coralFan(t) { return [bx(0, 0, 8, 16, 8, 8, { side: null, ud: null, n: t, s: t }, { uv: { n: [0, 8, 16, 16], s: [0, 8, 16, 16] } }), bx(8, 0, 0, 8, 8, 16, { side: null, ud: null, e: t, w: t }, { uv: { e: [0, 8, 16, 16], w: [0, 8, 16, 16] } })]; }
  function fireBoxes(a, b) { return [bx(0, 0, .02, 16, 22.4, .02, { side: null, ud: null, s: a, n: a }), bx(0, 0, 15.98, 16, 22.4, 15.98, { side: null, ud: null, s: b, n: b }), bx(.02, 0, 0, .02, 22.4, 16, { side: null, ud: null, e: a, w: a }), bx(15.98, 0, 0, 15.98, 22.4, 16, { side: null, ud: null, e: b, w: b }), bx(.8, 0, 8, 15.2, 22.4, 8, { side: null, ud: null, n: a, s: a }), bx(8, 0, .8, 8, 22.4, 15.2, { side: null, ud: null, e: b, w: b })]; }
  function candleBoxes(t, s) { const n = sv(s, 'candles') + 1, lit = sv(s, 'lit'), P = [[[7, 7]], [[5, 7], [9, 6]], [[5, 6], [8, 8], [9, 5]], [[5, 5], [9, 5], [5, 8], [8, 8]]][n - 1], b = []; for (const [x, z] of P) { const h = 6; b.push(bx(x, 0, z, x + 2, h, z + 2, t, { uv: { e: [0, 8, 2, 14], w: [0, 8, 2, 14], s: [0, 8, 2, 14], n: [0, 8, 2, 14], u: [0, 6, 2, 8], d: [0, 14, 2, 16] } })); b.push(bx(x + .5, h, z + 1, x + 1.5, h + 1, z + 1, { side: null, ud: null, n: t, s: t }, { uv: { n: [0, 5, 1, 6], s: [0, 5, 1, 6] } })); } return b; }
  function railBoxes(t, shp, corner) {
    const flatB = (tex, r) => [bx(0, 1, 0, 16, 1, 16, { side: null, u: tex, d: tex }, { r: { u: r, d: r } })];
    if (shp === 0) return flatB(t, 0);
    if (shp === 1) return flatB(t, 1);
    if (shp <= 5) { const q = [1, 3, 0, 2][shp - 2]; const B = bx(0, 1, 0, 16, 1, 16, { side: null, u: t, d: t }); B.rx = { ax: 'x', ang: 45, o: [8, 1, 16] }; B.sc = 1.414; return rotY([B], q); }
    const q = [1, 2, 3, 0][shp - 6]; return rotY(flatB(corner, 0), q + 1);
  }
