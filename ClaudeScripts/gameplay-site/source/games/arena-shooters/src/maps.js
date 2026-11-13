  function pix(g, S, base, spots, px, after) {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    let s = 1234567;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const [c, d] of spots) { g.fillStyle = c; for (let i = 0; i < S * S / (px * px) * d; i++) g.fillRect(Math.floor(r() * S / px) * px, Math.floor(r() * S / px) * px, px, px); }
    if (after) after(g, S);
  }

  function building(B, x0, z0, x1, z1, h, m, o) {
    o = o || {};
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, sx = x1 - x0, sz = z1 - z0;
    if (o.arch) {
      const a = o.arch;
      if (a.ax === 'x') {
        const w0 = a.c - a.w / 2, w1 = a.c + a.w / 2;
        B.box((x0 + w0) / 2, 0, cz, w0 - x0, h, sz, m); B.box((w1 + x1) / 2, 0, cz, x1 - w1, h, sz, m); B.box(a.c, a.h, cz, a.w, h - a.h, sz, m);
      } else {
        const w0 = a.c - a.w / 2, w1 = a.c + a.w / 2;
        B.box(cx, 0, (z0 + w0) / 2, sx, h, w0 - z0, m); B.box(cx, 0, (w1 + z1) / 2, sx, h, z1 - w1, m); B.box(cx, a.h, a.c, sx, h - a.h, a.w, m);
      }
    } else B.box(cx, 0, cz, sx, h, sz, m);
    const tr = o.trim || 'trim', rim = o.rim == null ? 0.5 : o.rim;
    if (rim) {
      B.box(cx, h, z0 + 0.15, sx, rim, 0.3, tr); B.box(cx, h, z1 - 0.15, sx, rim, 0.3, tr);
      B.box(x0 + 0.15, h, cz, 0.3, rim, sz - 0.6, tr); B.box(x1 - 0.15, h, cz, 0.3, rim, sz - 0.6, tr);
    }
    if (o.roof) B.box(cx, h - 0.01, cz, sx - 0.6, 0.02, sz - 0.6, o.roof, { nc: 1 });
    if (o.win !== false) {
      const wy = o.wy || [1.4, 3.8], gap = o.wg || 3.2, wm = o.wm || 'glass';
      for (const y of wy) {
        if (y + 1.4 > h - 0.3) continue;
        for (let x = x0 + gap * 0.75; x < x1 - gap * 0.5; x += gap) {
          if (o.arch && o.arch.ax === 'x' && Math.abs(x - o.arch.c) < o.arch.w / 2 + 0.8 && y < o.arch.h + 0.5) continue;
          B.box(x, y, z0 - 0.04, 1.2, 1.4, 0.1, wm, { nc: 1, ns: 1 }); B.box(x, y, z1 + 0.04, 1.2, 1.4, 0.1, wm, { nc: 1, ns: 1 });
          B.box(x, y - 0.12, z0 - 0.1, 1.5, 0.14, 0.22, tr, { nc: 1, ns: 1 }); B.box(x, y - 0.12, z1 + 0.1, 1.5, 0.14, 0.22, tr, { nc: 1, ns: 1 });
        }
        for (let z = z0 + gap * 0.75; z < z1 - gap * 0.5; z += gap) {
          if (o.arch && o.arch.ax === 'z' && Math.abs(z - o.arch.c) < o.arch.w / 2 + 0.8 && y < o.arch.h + 0.5) continue;
          B.box(x0 - 0.04, y, z, 0.1, 1.4, 1.2, wm, { nc: 1, ns: 1 }); B.box(x1 + 0.04, y, z, 0.1, 1.4, 1.2, wm, { nc: 1, ns: 1 });
          B.box(x0 - 0.1, y - 0.12, z, 0.22, 0.14, 1.5, tr, { nc: 1, ns: 1 }); B.box(x1 + 0.1, y - 0.12, z, 0.22, 0.14, 1.5, tr, { nc: 1, ns: 1 });
        }
      }
    }
  }
  const crate = (B, x, y, z, s, m) => B.box(x, y, z, s, s, s, m || 'crate', { uv: s / 1.2 });
