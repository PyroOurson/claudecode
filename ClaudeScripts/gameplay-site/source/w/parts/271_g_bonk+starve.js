(() => {
  'use strict';
{
const BK_ID = 'bonk';
const PH = (() => {
  const SLOP = .3, BETA = .2, BMAX = 100, BTHR = 90, ITER = 10;
  let UID = 1;
  let SI = 0;

  function area(p) {
    let s = 0;
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return s / 2;
  }

  function body(o) {
    const b = {
      id: UID++, kind: o.kind || 0, x: o.x || 0, y: o.y || 0, a: o.a || 0, vx: 0, vy: 0, w: 0,
      r: o.r || 0, e: o.e == null ? .3 : o.e, f: o.f == null ? .4 : o.f,
      cat: o.cat == null ? 1 : o.cat, mask: o.mask == null ? 0xffff : o.mask,
      sensor: !!o.sensor, dth: !!o.dth, damp: o.damp || 0, adamp: o.adamp || 0, gs: o.gs == null ? 1 : o.gs,
      im: 0, ii: 0, im0: 0, ii0: 0, mv: o.mv || null, data: o.data || null, touch: -9, tnx: 0, tny: 0,
      lp: null, ln: null, wv: null, wn: null, fixedRot: !!o.fixedRot, dead: false, ax0: 0, ay0: 0, aa0: 0,
      x0: 0, y0: 0, a0: 0, box: [0, 0, 0, 0], im1: 0
    };
    if (o.pts) {
      let pts = o.pts.map(p => [p[0], p[1]]);
      if (area(pts) < 0) pts.reverse();
      const A = area(pts);
      if (b.kind === 2) {
        let cx = 0, cy = 0;
        for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], c = p[0] * q[1] - q[0] * p[1]; cx += (p[0] + q[0]) * c; cy += (p[1] + q[1]) * c; }
        cx /= 6 * A; cy /= 6 * A;
        pts = pts.map(p => [p[0] - cx, p[1] - cy]);
        const cs = Math.cos(b.a), sn = Math.sin(b.a);
        b.x += cx * cs - cy * sn; b.y += cx * sn + cy * cs;
        let num = 0, den = 0;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i], q = pts[(i + 1) % pts.length], c = Math.abs(p[0] * q[1] - q[0] * p[1]);
          num += c * (p[0] * p[0] + p[0] * q[0] + q[0] * q[0] + p[1] * p[1] + p[1] * q[1] + q[1] * q[1]);
          den += c;
        }
        const d = o.density == null ? 1 : o.density, m = d * A;
        b.im = 1 / m; b.ii = b.fixedRot ? 0 : 1 / (d * num / 12);
      }
      b.lp = pts.map(p => ({ x: p[0], y: p[1] }));
      b.ln = pts.map((p, i) => { const q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return { x: dy / l, y: -dx / l }; });
      b.wv = b.lp.map(() => ({ x: 0, y: 0 }));
      b.wn = b.ln.map(() => ({ x: 0, y: 0 }));
    } else if (b.kind === 2) {
      const d = o.density == null ? 1 : o.density, m = d * Math.PI * b.r * b.r;
      b.im = 1 / m; b.ii = b.fixedRot ? 0 : 2 / (m * b.r * b.r);
    }
    b.im0 = b.im; b.ii0 = b.ii;
    xform(b);
    return b;
  }

  function xform(b) {
    if (b.r && !b.lp) { b.box[0] = b.x - b.r; b.box[1] = b.y - b.r; b.box[2] = b.x + b.r; b.box[3] = b.y + b.r; return; }
    const c = Math.cos(b.a), s = Math.sin(b.a);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i < b.lp.length; i++) {
      const p = b.lp[i], v = b.wv[i], n = b.ln[i], m = b.wn[i];
      v.x = b.x + c * p.x - s * p.y; v.y = b.y + s * p.x + c * p.y;
      m.x = c * n.x - s * n.y; m.y = s * n.x + c * n.y;
      if (v.x < x0) x0 = v.x; if (v.x > x1) x1 = v.x; if (v.y < y0) y0 = v.y; if (v.y > y1) y1 = v.y;
    }
    b.box[0] = x0; b.box[1] = y0; b.box[2] = x1; b.box[3] = y1;
  }

  function circCirc(A, B) {
    const dx = B.x - A.x, dy = B.y - A.y, rr = A.r + B.r, d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr) return null;
    const d = Math.sqrt(d2), nx = d > 1e-6 ? dx / d : 0, ny = d > 1e-6 ? dy / d : -1;
    return { nx, ny, pts: [{ x: A.x + nx * A.r, y: A.y + ny * A.r, pen: rr - d, id: 0 }] };
  }

  function circPoly(C, P) {
    const cx = C.x, cy = C.y, r = C.r, wv = P.wv, wn = P.wn, n = wv.length;
    let best = -1e9, bi = 0;
    for (let i = 0; i < n; i++) {
      const s = wn[i].x * (cx - wv[i].x) + wn[i].y * (cy - wv[i].y);
      if (s > r) return null;
      if (s > best) { best = s; bi = i; }
    }
    const v1 = wv[bi], v2 = wv[(bi + 1) % n];
    const ex = v2.x - v1.x, ey = v2.y - v1.y;
    const u1 = (cx - v1.x) * ex + (cy - v1.y) * ey, u2 = -((cx - v2.x) * ex + (cy - v2.y) * ey);
    let nx, ny, pen, px, py;
    if (best > 1e-6 && (u1 <= 0 || u2 <= 0)) {
      const v = u1 <= 0 ? v1 : v2, dx = cx - v.x, dy = cy - v.y, d = Math.hypot(dx, dy);
      if (d > r) return null;
      nx = d > 1e-6 ? dx / d : wn[bi].x; ny = d > 1e-6 ? dy / d : wn[bi].y;
      pen = r - d; px = v.x; py = v.y;
    } else {
      nx = wn[bi].x; ny = wn[bi].y; pen = r - best;
      px = cx - nx * best; py = cy - ny * best;
    }
    return { nx: -nx, ny: -ny, pts: [{ x: px, y: py, pen, id: bi }] };
  }

  function sepEdge(A, B) {
    let best = -1e9;
    const av = A.wv, an = A.wn, bv = B.wv;
    for (let i = 0; i < av.length; i++) {
      const nx = an[i].x, ny = an[i].y, vx = av[i].x, vy = av[i].y;
      let s = 1e9;
      for (let j = 0; j < bv.length; j++) { const d = nx * (bv[j].x - vx) + ny * (bv[j].y - vy); if (d < s) s = d; }
      if (s > best) { best = s; SI = i; }
    }
    return best;
  }

  function polyPoly(A, B) {
    const sa = sepEdge(A, B), ia = SI;
    if (sa > 0) return null;
    const sb = sepEdge(B, A), ib = SI;
    if (sb > 0) return null;
    let R, I, ri, flip;
    if (sb > sa + .0005) { R = B; I = A; ri = ib; flip = true; } else { R = A; I = B; ri = ia; flip = false; }
    const rn = R.wn[ri];
    let ii = 0, md = 1e9;
    for (let i = 0; i < I.wn.length; i++) { const d = rn.x * I.wn[i].x + rn.y * I.wn[i].y; if (d < md) { md = d; ii = i; } }
    const p1 = I.wv[ii], p2 = I.wv[(ii + 1) % I.wv.length];
    const r1 = R.wv[ri], r2 = R.wv[(ri + 1) % R.wv.length];
    let tx = r2.x - r1.x, ty = r2.y - r1.y;
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let q1 = { x: p1.x, y: p1.y }, q2 = { x: p2.x, y: p2.y };
    const o1 = tx * r1.x + ty * r1.y, o2 = tx * r2.x + ty * r2.y;
    let d1 = tx * q1.x + ty * q1.y - o1, d2 = tx * q2.x + ty * q2.y - o1;
    if (d1 < 0 && d2 < 0) return null;
    if (d1 < 0) { const k = d1 / (d1 - d2); q1 = { x: q1.x + (q2.x - q1.x) * k, y: q1.y + (q2.y - q1.y) * k }; }
    else if (d2 < 0) { const k = d2 / (d2 - d1); q2 = { x: q2.x + (q1.x - q2.x) * k, y: q2.y + (q1.y - q2.y) * k }; }
    d1 = tx * q1.x + ty * q1.y - o2; d2 = tx * q2.x + ty * q2.y - o2;
    if (d1 > 0 && d2 > 0) return null;
    if (d1 > 0) { const k = d1 / (d1 - d2); q1 = { x: q1.x + (q2.x - q1.x) * k, y: q1.y + (q2.y - q1.y) * k }; }
    else if (d2 > 0) { const k = d2 / (d2 - d1); q2 = { x: q2.x + (q1.x - q2.x) * k, y: q2.y + (q1.y - q2.y) * k }; }
    const pts = [];
    const s1 = rn.x * (q1.x - r1.x) + rn.y * (q1.y - r1.y), s2 = rn.x * (q2.x - r1.x) + rn.y * (q2.y - r1.y);
    if (s1 <= .01) pts.push({ x: q1.x, y: q1.y, pen: -s1, id: ri * 64 + ii * 8 + 1 });
    if (s2 <= .01) pts.push({ x: q2.x, y: q2.y, pen: -s2, id: ri * 64 + ii * 8 + 2 });
    if (!pts.length) return null;
    return flip ? { nx: -rn.x, ny: -rn.y, pts } : { nx: rn.x, ny: rn.y, pts };
  }

  function collide(A, B) {
    if (A.lp) {
      if (B.lp) return polyPoly(A, B);
      const m = circPoly(B, A);
      if (m) { m.nx = -m.nx; m.ny = -m.ny; }
      return m;
    }
    return B.lp ? circPoly(A, B) : circCirc(A, B);
  }

  function World(o = {}) {
    const W = {
      bodies: [], joints: [], gx: 0, gy: o.gy == null ? 1000 : o.gy, t: 0, frame: 0,
      cache: new Map(), hits: [], touchHits: [], over: [], contacts: []
    };

    W.add = b => { W.bodies.push(b); return b; };
    W.remove = b => {
      const i = W.bodies.indexOf(b);
      if (i >= 0) W.bodies.splice(i, 1);
      b.dead = true;
      W.joints = W.joints.filter(j => j.a !== b && j.b !== b);
    };
    W.addJoint = j => { W.joints.push(j); return j; };
    W.removeJoint = j => { const i = W.joints.indexOf(j); if (i >= 0) W.joints.splice(i, 1); };

    function pairOk(A, B) {
      if (!(A.im || B.im)) return false;
      if (!((A.cat & B.mask) && (B.cat & A.mask))) return false;
      const a = A.box, b = B.box;
      return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
    }

    W.step = h => {
      const bs = W.bodies, n = bs.length;
      W.frame++;
      W.over = [];
      for (let i = 0; i < n; i++) {
        const b = bs[i];
        if (b.kind === 1 && b.mv) {
          const p = b.mv(W.t + h);
          b.vx = (p.x - b.x) / h; b.vy = (p.y - b.y) / h;
          let da = p.a - b.a; b.w = da / h;
          b.tx = p.x; b.ty = p.y; b.ta = p.a;
        } else if (b.kind === 2) {
          b.vy += W.gy * b.gs * h;
          if (b.damp) { const k = 1 / (1 + b.damp * h); b.vx *= k; b.vy *= k; }
          if (b.adamp) b.w *= 1 / (1 + b.adamp * h);
          if (b.pre) b.pre(b, h);
        }
      }
      const cons = [];
      for (let i = 0; i < n; i++) {
        const A = bs[i];
        for (let j = i + 1; j < n; j++) {
          const B = bs[j];
          if (!pairOk(A, B)) continue;
          const m = collide(A, B);
          if (!m) continue;
          if (A.sensor || B.sensor) { W.over.push(A.sensor ? { s: A, b: B } : { s: B, b: A }); continue; }
          cons.push({ A, B, m, key: A.id + ':' + B.id });
        }
      }
      const next = new Map();
      for (const c of cons) {
        const { A, B, m } = c;
        const nx = m.nx, ny = m.ny, tx = -ny, ty = nx;
        const mu = Math.sqrt(A.f * B.f), e = A.e * B.e;
        c.mu = mu;
        for (const p of m.pts) {
          p.rax = p.x - A.x; p.ray = p.y - A.y; p.rbx = p.x - B.x; p.rby = p.y - B.y;
          const rnA = p.rax * ny - p.ray * nx, rnB = p.rbx * ny - p.rby * nx;
          const rtA = p.rax * ty - p.ray * tx, rtB = p.rbx * ty - p.rby * tx;
          const k = A.im + B.im + A.ii * rnA * rnA + B.ii * rnB * rnB;
          const kt = A.im + B.im + A.ii * rtA * rtA + B.ii * rtB * rtB;
          p.mn = k > 0 ? 1 / k : 0; p.mt = kt > 0 ? 1 / kt : 0;
          const vax = A.vx - A.w * p.ray, vay = A.vy + A.w * p.rax, vbx = B.vx - B.w * p.rby, vby = B.vy + B.w * p.rbx;
          const vn = (vbx - vax) * nx + (vby - vay) * ny;
          p.bounce = vn < -BTHR ? -e * vn : 0;
          p.bias = Math.min(BMAX, Math.max(0, p.pen - SLOP) * BETA / h);
          const prev = W.cache.get(c.key + ':' + p.id);
          p.jn = prev ? prev[0] : 0; p.jt = prev ? prev[1] : 0;
          if (!prev && vn < -BTHR * .6) W.hits.push({ x: p.x, y: p.y, v: -vn, a: A, b: B });
          if (A.cat & 2) { A.touch = W.frame; A.tnx = -nx; A.tny = -ny; }
          if (B.cat & 2) { B.touch = W.frame; B.tnx = nx; B.tny = ny; }
          if (A.dth && B.cat & 2) B.dthHit = true;
          if (B.dth && A.cat & 2) A.dthHit = true;
          const jx = p.jn * nx + p.jt * tx, jy = p.jn * ny + p.jt * ty;
          A.vx -= A.im * jx; A.vy -= A.im * jy; A.w -= A.ii * (p.rax * jy - p.ray * jx);
          B.vx += B.im * jx; B.vy += B.im * jy; B.w += B.ii * (p.rbx * jy - p.rby * jx);
        }
      }
      for (const j of W.joints) if (j.pre) j.pre(j, h);
      for (let it = 0; it < ITER; it++) {
        for (const j of W.joints) j.solve(j, h);
        for (const c of cons) {
          const { A, B, m } = c, nx = m.nx, ny = m.ny, tx = -ny, ty = nx;
          for (const p of m.pts) {
            let vax = A.vx - A.w * p.ray, vay = A.vy + A.w * p.rax, vbx = B.vx - B.w * p.rby, vby = B.vy + B.w * p.rbx;
            const vt = (vbx - vax) * tx + (vby - vay) * ty;
            let dt = -vt * p.mt;
            const mx = c.mu * p.jn, jt0 = p.jt;
            p.jt = Math.max(-mx, Math.min(mx, jt0 + dt)); dt = p.jt - jt0;
            let jx = dt * tx, jy = dt * ty;
            A.vx -= A.im * jx; A.vy -= A.im * jy; A.w -= A.ii * (p.rax * jy - p.ray * jx);
            B.vx += B.im * jx; B.vy += B.im * jy; B.w += B.ii * (p.rbx * jy - p.rby * jx);
            vax = A.vx - A.w * p.ray; vay = A.vy + A.w * p.rax; vbx = B.vx - B.w * p.rby; vby = B.vy + B.w * p.rbx;
            const vn = (vbx - vax) * nx + (vby - vay) * ny;
            const target = Math.max(p.bias, p.bounce);
            let dn = (target - vn) * p.mn;
            const jn0 = p.jn;
            p.jn = Math.max(0, jn0 + dn); dn = p.jn - jn0;
            jx = dn * nx; jy = dn * ny;
            A.vx -= A.im * jx; A.vy -= A.im * jy; A.w -= A.ii * (p.rax * jy - p.ray * jx);
            B.vx += B.im * jx; B.vy += B.im * jy; B.w += B.ii * (p.rbx * jy - p.rby * jx);
          }
        }
      }
      for (const c of cons) for (const p of c.m.pts) next.set(c.key + ':' + p.id, [p.jn, p.jt]);
      W.cache = next;
      for (let i = 0; i < n; i++) {
        const b = bs[i];
        if (b.kind === 2) {
          b.x += b.vx * h; b.y += b.vy * h; b.a += b.w * h;
        } else if (b.kind === 1 && b.mv) {
          b.x = b.tx; b.y = b.ty; b.a = b.ta;
        }
        xform(b);
      }
      W.t += h;
    };

    W.ray = (x0, y0, dx, dy, maxT, ok) => {
      let best = null;
      for (const b of W.bodies) {
        if (ok && !ok(b)) continue;
        let t = null, nx = 0, ny = 0;
        if (b.lp) {
          const bx = b.box;
          if (bx[2] < Math.min(x0, x0 + dx * maxT) || bx[0] > Math.max(x0, x0 + dx * maxT) || bx[3] < Math.min(y0, y0 + dy * maxT) || bx[1] > Math.max(y0, y0 + dy * maxT)) continue;
          let lo = 0, hi = maxT, hitN = null, inside = true;
          for (let i = 0; i < b.wv.length; i++) {
            const n = b.wn[i], v = b.wv[i];
            const num = n.x * (v.x - x0) + n.y * (v.y - y0), den = n.x * dx + n.y * dy;
            if (Math.abs(den) < 1e-9) { if (num < 0) { inside = false; lo = 1e9; break; } continue; }
            const tt = num / den;
            if (den < 0) { if (tt > lo) { lo = tt; hitN = n; } }
            else if (tt < hi) hi = tt;
            if (lo > hi) break;
          }
          if (lo <= hi && lo < 1e8 && hitN) { t = lo; nx = hitN.x; ny = hitN.y; }
        } else {
          const fx = x0 - b.x, fy = y0 - b.y, a = dx * dx + dy * dy, bb = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - b.r * b.r;
          const disc = bb * bb - 4 * a * c;
          if (disc >= 0 && c > 0) {
            const tt = (-bb - Math.sqrt(disc)) / (2 * a);
            if (tt >= 0 && tt <= maxT) { t = tt; const px = x0 + dx * tt - b.x, py = y0 + dy * tt - b.y, l = Math.hypot(px, py) || 1; nx = px / l; ny = py / l; }
          }
        }
        if (t != null && t >= 0 && (!best || t < best.t)) best = { t, b, nx, ny, x: x0 + dx * t, y: y0 + dy * t };
      }
      return best;
    };

    W.pointIn = (x, y, ok) => {
      for (const b of W.bodies) {
        if (ok && !ok(b)) continue;
        if (x < b.box[0] || x > b.box[2] || y < b.box[1] || y > b.box[3]) continue;
        if (b.lp) {
          let inn = true;
          for (let i = 0; i < b.wv.length; i++) if (b.wn[i].x * (x - b.wv[i].x) + b.wn[i].y * (y - b.wv[i].y) > 0) { inn = false; break; }
          if (inn) return b;
        } else if ((x - b.x) ** 2 + (y - b.y) ** 2 <= b.r * b.r) return b;
      }
      return null;
    };
    return W;
  }

  function pin(a, b, wx, wy) {
    const A = a, B = b;
    const ca = Math.cos(A.a), sa = Math.sin(A.a), dx = wx - A.x, dy = wy - A.y;
    const la = { x: ca * dx + sa * dy, y: -sa * dx + ca * dy };
    let lb;
    if (B) { const cb = Math.cos(B.a), sb = Math.sin(B.a), ex = wx - B.x, ey = wy - B.y; lb = { x: cb * ex + sb * ey, y: -sb * ex + cb * ey }; }
    else lb = { x: wx, y: wy };
    return {
      a: A, b: B || null, la, lb, jx: 0, jy: 0,
      pre(j, h) {
        const a = j.a, b = j.b;
        const ca = Math.cos(a.a), sa = Math.sin(a.a);
        j.rax = ca * j.la.x - sa * j.la.y; j.ray = sa * j.la.x + ca * j.la.y;
        if (b) { const cb = Math.cos(b.a), sb = Math.sin(b.a); j.rbx = cb * j.lb.x - sb * j.lb.y; j.rby = sb * j.lb.x + cb * j.lb.y; }
        else { j.rbx = 0; j.rby = 0; }
        const bx = b ? b.x : 0, by = b ? b.y : 0, ibm = b ? b.im : 0, ibi = b ? b.ii : 0;
        const k11 = a.im + ibm + a.ii * j.ray * j.ray + ibi * j.rby * j.rby;
        const k12 = -a.ii * j.rax * j.ray - ibi * j.rbx * j.rby;
        const k22 = a.im + ibm + a.ii * j.rax * j.rax + ibi * j.rbx * j.rbx;
        const det = k11 * k22 - k12 * k12;
        j.i11 = det ? k22 / det : 0; j.i12 = det ? -k12 / det : 0; j.i22 = det ? k11 / det : 0;
        const px = (b ? b.x + j.rbx : j.lb.x) - (a.x + j.rax), py = (b ? b.y + j.rby : j.lb.y) - (a.y + j.ray);
        j.bx = px * .2 / h; j.by = py * .2 / h;
        void bx; void by;
        a.vx -= a.im * j.jx; a.vy -= a.im * j.jy; a.w -= a.ii * (j.rax * j.jy - j.ray * j.jx);
        if (b) { b.vx += b.im * j.jx; b.vy += b.im * j.jy; b.w += b.ii * (j.rbx * j.jy - j.rby * j.jx); }
      },
      solve(j) {
        const a = j.a, b = j.b;
        const vax = a.vx - a.w * j.ray, vay = a.vy + a.w * j.rax;
        const vbx = b ? b.vx - b.w * j.rby : 0, vby = b ? b.vy + b.w * j.rbx : 0;
        const cx = vbx - vax + j.bx, cy = vby - vay + j.by;
        const ix = -(j.i11 * cx + j.i12 * cy), iy = -(j.i12 * cx + j.i22 * cy);
        j.jx += ix; j.jy += iy;
        a.vx -= a.im * ix; a.vy -= a.im * iy; a.w -= a.ii * (j.rax * iy - j.ray * ix);
        if (b) { b.vx += b.im * ix; b.vy += b.im * iy; b.w += b.ii * (j.rbx * iy - j.rby * ix); }
      }
    };
  }

  function rope(a, la, b, lb, len) {
    return {
      a, b, la, lb, len, j: 0, rope: true,
      pre(j, h) {
        const a = j.a, b = j.b, ca = Math.cos(a.a), sa = Math.sin(a.a);
        j.rax = ca * j.la.x - sa * j.la.y; j.ray = sa * j.la.x + ca * j.la.y;
        if (b.kind === 0 && !b.mv) { j.rbx = 0; j.rby = 0; j.px = j.lb.x; j.py = j.lb.y; }
        else { const cb = Math.cos(b.a), sb = Math.sin(b.a); j.rbx = cb * j.lb.x - sb * j.lb.y; j.rby = sb * j.lb.x + cb * j.lb.y; j.px = b.x + j.rbx; j.py = b.y + j.rby; }
        const dx = j.px - (a.x + j.rax), dy = j.py - (a.y + j.ray), d = Math.hypot(dx, dy) || 1;
        j.nx = dx / d; j.ny = dy / d; j.d = d;
        const rnA = j.rax * j.ny - j.ray * j.nx, rnB = j.rbx * j.ny - j.rby * j.nx;
        const k = a.im + b.im + a.ii * rnA * rnA + b.ii * rnB * rnB;
        j.m = k ? 1 / k : 0;
        j.bias = Math.max(0, d - j.len) * .15 / h;
        j.slack = d < j.len;
        if (j.slack) { j.j = 0; return; }
        const ix = j.j * j.nx, iy = j.j * j.ny;
        a.vx += a.im * ix; a.vy += a.im * iy; a.w += a.ii * (j.rax * iy - j.ray * ix);
        b.vx -= b.im * ix; b.vy -= b.im * iy; b.w -= b.ii * (j.rbx * iy - j.rby * ix);
      },
      solve(j) {
        if (j.slack) return;
        const a = j.a, b = j.b;
        const vax = a.vx - a.w * j.ray, vay = a.vy + a.w * j.rax, vbx = b.vx - b.w * j.rby, vby = b.vy + b.w * j.rbx;
        const vn = (vax - vbx) * j.nx + (vay - vby) * j.ny;
        let d = -(vn - j.bias) * j.m;
        const j0 = j.j;
        j.j = Math.max(0, j0 + d); d = j.j - j0;
        const ix = d * j.nx, iy = d * j.ny;
        a.vx += a.im * ix; a.vy += a.im * iy; a.w += a.ii * (j.rax * iy - j.ray * ix);
        b.vx -= b.im * ix; b.vy -= b.im * iy; b.w -= b.ii * (j.rbx * iy - j.rby * ix);
      }
    };
  }

  function anchor(b, wx, wy) {
    if (b.kind === 0 && !b.mv) return { x: wx, y: wy };
    const c = Math.cos(b.a), s = Math.sin(b.a), dx = wx - b.x, dy = wy - b.y;
    return { x: c * dx + s * dy, y: -s * dx + c * dy };
  }

  return { body, World, pin, rope, xform, anchor };
})();

const PR = 14, BR = 22, MARGIN = 100;
const MODES = [
  { name: 'Classic', desc: 'Knock everyone else off the map. Last ball standing scores.' },
  { name: 'Arrows', desc: 'Aim with the mouse and shoot arrows that bonk your rivals away.' },
  { name: 'Grapple', desc: 'Throw a grappling hook at walls and rivals, swing and bonk.' },
  { name: 'Football', desc: 'Two teams, one big ball. Push it into the other goal.' }
];
const PAL = {
  sky: { bg: ['#6fb7ee', '#bfe3fb'], fill: '#7a5c3d', edge: '#3b2a1a', top: '#9bc76a' },
  dusk: { bg: ['#2b1f4f', '#8a4b8f'], fill: '#4b4570', edge: '#1b1633', top: '#b6a8f0' },
  night: { bg: ['#0f1a2e', '#264063'], fill: '#56677f', edge: '#0b1220', top: '#9fc3e8' },
  mint: { bg: ['#1f5f5b', '#58b9a5'], fill: '#2f7f74', edge: '#0e3a35', top: '#a8f0d4' },
  sand: { bg: ['#d99a4e', '#f6d79b'], fill: '#a8703a', edge: '#5c3414', top: '#f1c27d' },
  ice: { bg: ['#7fb2d8', '#e1f1fb'], fill: '#a9d3ea', edge: '#3d6c8c', top: '#f4fbff' },
  slate: { bg: ['#2a2d3a', '#4b5068'], fill: '#6b708a', edge: '#171926', top: '#c9cde6' },
  grass: { bg: ['#4aa0d8', '#a6dcef'], fill: '#6d4c2f', edge: '#2d1d10', top: '#58b84a' },
  fire: { bg: ['#3a0f10', '#b3401e'], fill: '#5d3a33', edge: '#200808', top: '#ff9a52' },
  pitch: { bg: ['#1f7a3a', '#2fa04d'], fill: '#3c4a5c', edge: '#141b24', top: '#cfe1f2' }
};
const rc = (x, y, w, h, a, o) => Object.assign({ x, y, a: a || 0, w, h, pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], t: 's' }, o || {});
const pg = (x, y, pts, o) => Object.assign({ x, y, a: 0, pts, t: 's' }, o || {});
const ci = (x, y, r, o) => Object.assign({ x, y, r, t: 's' }, o || {});
const sp = (...a) => a.map(p => [p[0], p[1]]);
const top = (x, y, w, h) => y - h / 2 - PR - 2;

function bridge(ax, ay, bx, by, n, th, sag) {
  const L = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    L.push([ax + (bx - ax) * u, ay + (by - ay) * u + sag * 4 * u * (1 - u)]);
  }
  return { chain: L, th };
}

const MAPS = [
  {
    name: 'Simple 1', pal: 'sky', m: [0, 1, 2],
    shapes: [rc(365, 380, 440, 26, 0, { grass: 1 }), rc(75, 290, 110, 20, 0, { grass: 1 }), rc(655, 290, 110, 20, 0, { grass: 1 })],
    spawns: sp([185, 350], [245, 350], [305, 350], [365, 350], [425, 350], [485, 350], [545, 350], [75, 262], [655, 262])
  },
  {
    name: 'Twin Islands', pal: 'grass', m: [0, 1, 2],
    shapes: [rc(190, 380, 250, 26, 0, { grass: 1 }), rc(540, 380, 250, 26, 0, { grass: 1 }), rc(365, 270, 90, 16, 0, { grass: 1 })],
    spawns: sp([110, 350], [170, 350], [230, 350], [470, 350], [530, 350], [590, 350], [650, 350], [365, 242], [130, 350])
  },
  {
    name: 'Archipelago', pal: 'mint', m: [0, 1, 2],
    shapes: [rc(130, 370, 150, 20, -.08), rc(365, 425, 170, 20), rc(605, 360, 150, 20, .08), rc(250, 245, 130, 18), rc(485, 235, 130, 18), rc(365, 330, 70, 14)],
    spawns: sp([120, 343], [380, 396], [610, 333], [250, 220], [485, 210], [330, 396], [150, 345], [575, 335], [365, 304])
  },
  {
    name: 'Bounce Pit', pal: 'dusk', m: [0, 1, 2], g: .85,
    shapes: [rc(365, 485, 730, 40, 0, { t: 'b' }), rc(170, 330, 160, 18), rc(560, 330, 160, 18), rc(365, 225, 130, 16), rc(35, 400, 70, 16, 0, { t: 'b' }), rc(695, 400, 70, 16, 0, { t: 'b' })],
    spawns: sp([130, 302], [210, 302], [520, 302], [600, 302], [335, 197], [395, 197], [365, 440], [300, 440], [430, 440])
  },
  {
    name: 'Spinner', pal: 'night', m: [0, 1, 2],
    shapes: [rc(365, 445, 300, 24), rc(70, 390, 120, 16), rc(660, 390, 120, 16), rc(365, 330, 290, 14, 0, { mv: { k: 'rot', w: 1.5 } }), ci(365, 330, 16, { t: 's' })],
    spawns: sp([300, 415], [430, 415], [365, 415], [70, 362], [660, 362], [95, 362], [635, 362], [250, 415], [480, 415])
  },
  {
    name: 'Sky Rails', pal: 'sky', m: [0, 1, 2],
    shapes: [
      rc(365, 440, 190, 22, 0, { grass: 1 }),
      rc(250, 360, 150, 18, 0, { mv: { k: 'osc', dx: 140, dy: 0, T: 5.2, ph: 0 } }),
      rc(480, 290, 150, 18, 0, { mv: { k: 'osc', dx: -140, dy: 0, T: 5.2, ph: 0 } }),
      rc(365, 190, 100, 16, 0, { mv: { k: 'osc', dx: 0, dy: 50, T: 3.4, ph: 0 } }),
      rc(60, 300, 90, 16), rc(670, 300, 90, 16)
    ],
    spawns: sp([330, 410], [400, 410], [60, 272], [670, 272], [365, 410], [90, 272], [640, 272], [300, 410], [430, 410])
  },
  {
    name: 'Death Walls', pal: 'fire', m: [0, 1, 2],
    shapes: [rc(365, 410, 520, 26), rc(70, 300, 22, 360, 0, { t: 'd' }), rc(660, 300, 22, 360, 0, { t: 'd' }), rc(365, 105, 520, 22, 0, { t: 'd' }), rc(365, 300, 160, 16), rc(210, 230, 90, 14), rc(520, 230, 90, 14)],
    spawns: sp([160, 380], [230, 380], [300, 380], [430, 380], [500, 380], [570, 380], [365, 272], [210, 202], [520, 202])
  },
  {
    name: 'Seesaw', pal: 'sand', m: [0, 1, 2],
    shapes: [
      rc(365, 380, 380, 16, 0, { kind: 2, pin: [365, 380], dens: 1.4 }),
      rc(190, 450, 70, 24), rc(540, 450, 70, 24), ci(365, 380, 12, { t: 'g' }),
      rc(55, 320, 110, 16), rc(675, 320, 110, 16), rc(365, 230, 110, 14)
    ],
    spawns: sp([260, 350], [470, 350], [55, 292], [675, 292], [365, 202], [320, 350], [415, 350], [90, 292], [640, 292])
  },
  {
    name: 'Ice Rink', pal: 'ice', m: [0, 1, 2],
    shapes: [rc(365, 400, 560, 24, 0, { t: 'i' }), rc(120, 290, 110, 16, 0, { t: 'i' }), rc(610, 290, 110, 16, 0, { t: 'i' }), rc(365, 330, 40, 40, 0), rc(365, 200, 100, 14, 0, { t: 'i' })],
    spawns: sp([150, 372], [215, 372], [280, 372], [450, 372], [515, 372], [580, 372], [120, 262], [610, 262], [365, 172])
  },
  {
    name: 'The Funnel', pal: 'slate', m: [0, 1, 2],
    shapes: [pg(0, 0, sp([40, 170], [60, 150], [320, 360], [300, 385])), pg(0, 0, sp([690, 170], [670, 150], [410, 360], [430, 385])), rc(365, 440, 110, 18, 0, { t: 'b' }), rc(365, 250, 70, 14)],
    spawns: sp([90, 135], [150, 168], [210, 205], [640, 135], [580, 168], [520, 205], [365, 222], [275, 275], [455, 275])
  },
  {
    name: 'Pillars', pal: 'fire', m: [0, 1, 2],
    shapes: [
      rc(365, 492, 740, 24, 0, { t: 'd' }),
      rc(110, 420, 60, 300, 0, { top: 'b' }), rc(260, 400, 60, 340, 0, { top: 'b' }), rc(470, 400, 60, 340, 0, { top: 'b' }), rc(620, 420, 60, 300, 0, { top: 'b' }),
      rc(365, 260, 110, 14)
    ],
    spawns: sp([110, 260], [260, 230], [470, 230], [620, 260], [365, 232], [160, 260], [570, 260], [310, 230], [420, 230])
  },
  {
    name: 'Windmill', pal: 'dusk', m: [0, 1, 2],
    shapes: [
      rc(365, 440, 40, 130), rc(100, 370, 160, 18), rc(630, 370, 160, 18),
      rc(365, 300, 300, 12, 0, { mv: { k: 'rot', w: .9, ph: 0 } }), rc(365, 300, 12, 300, 0, { mv: { k: 'rot', w: .9, ph: 0 } }),
      ci(365, 300, 18, { t: 's' }), rc(365, 480, 300, 24)
    ],
    spawns: sp([100, 342], [160, 342], [630, 342], [570, 342], [60, 342], [670, 342], [330, 452], [400, 452], [365, 452])
  },
  {
    name: 'Rope Bridge', pal: 'grass', m: [0, 1, 2],
    shapes: [rc(80, 400, 160, 220, 0, { grass: 1 }), rc(650, 400, 160, 220, 0, { grass: 1 }), rc(365, 160, 120, 16, 0, { mv: { k: 'osc', dx: 130, dy: 0, T: 6 } })],
    chains: [bridge(160, 292, 570, 292, 7, 10, 34)],
    spawns: sp([50, 270], [110, 270], [650, 270], [600, 270], [80, 270], [680, 270], [130, 270], [620, 270], [365, 135])
  },
  {
    name: 'Phantom Floor', pal: 'night', m: [0, 1, 2],
    shapes: [rc(150, 380, 200, 22), rc(365, 380, 200, 22, 0, { t: 'g' }), rc(580, 380, 200, 22), rc(365, 290, 110, 16), rc(160, 250, 90, 14, 0, { t: 'g' }), rc(570, 250, 90, 14, 0, { t: 'g' })],
    spawns: sp([110, 350], [170, 350], [540, 350], [610, 350], [365, 262], [140, 350], [590, 350], [330, 262], [400, 262])
  },
  {
    name: 'Bumper Arena', pal: 'mint', m: [0, 1, 2], g: .95,
    shapes: [rc(365, 440, 520, 20), ci(220, 330, 30, { t: 'b' }), ci(510, 330, 30, { t: 'b' }), ci(365, 395, 26, { t: 'b' }), rc(110, 320, 90, 14), rc(620, 320, 90, 14), ci(365, 240, 22, { t: 'b' })],
    spawns: sp([150, 412], [300, 412], [430, 412], [580, 412], [110, 292], [620, 292], [365, 330], [200, 412], [530, 412])
  },
  {
    name: 'Open Plains', pal: 'grass', m: [1], g: .9,
    shapes: [rc(365, 410, 640, 24, 0, { grass: 1 }), rc(140, 300, 110, 16, 0, { grass: 1 }), rc(590, 300, 110, 16, 0, { grass: 1 }), rc(365, 215, 100, 16, 0, { grass: 1 }), rc(365, 330, 20, 70)],
    spawns: sp([90, 380], [200, 380], [290, 380], [440, 380], [530, 380], [640, 380], [140, 272], [590, 272], [365, 187])
  },
  {
    name: 'Ceiling Garden', pal: 'mint', m: [2], g: .9,
    shapes: [
      rc(140, 110, 130, 18), rc(365, 80, 170, 18), rc(590, 110, 130, 18), rc(250, 210, 80, 16), rc(480, 210, 80, 16),
      rc(365, 330, 140, 16), rc(100, 400, 120, 16), rc(630, 400, 120, 16), rc(365, 450, 80, 14, 0, { t: 'b' })
    ],
    spawns: sp([100, 372], [630, 372], [365, 302], [250, 182], [480, 182], [140, 82], [590, 82], [330, 302], [400, 302])
  },
  {
    name: 'Cliffside', pal: 'sand', m: [0, 1, 2],
    shapes: [pg(0, 0, sp([0, 330], [300, 330], [330, 360], [330, 500], [0, 500])), pg(0, 0, sp([730, 250], [450, 250], [420, 280], [420, 500], [730, 500])), rc(375, 170, 100, 16, 0, { mv: { k: 'osc', dx: 0, dy: 70, T: 4 } })],
    spawns: sp([60, 300], [130, 300], [200, 300], [270, 300], [500, 220], [570, 220], [640, 220], [690, 220], [375, 142])
  },
  {
    name: 'Pitch', pal: 'pitch', m: [3], fb: 1, W: 900, H: 440, g: .8,
    shapes: [rc(450, 430, 900, 40), rc(450, 10, 900, 40), rc(5, 230, 10, 440), rc(895, 230, 10, 440), rc(35, 262, 70, 12), rc(865, 262, 70, 12)],
    goals: [{ team: 0, x: 40, y: 339, w: 60, h: 142 }, { team: 1, x: 860, y: 339, w: 60, h: 142 }],
    ball: [450, 300],
    ts: [sp([330, 380], [270, 380], [210, 380], [150, 380]), sp([570, 380], [630, 380], [690, 380], [750, 380])]
  },
  {
    name: 'Mini Pitch', pal: 'night', m: [3], fb: 1, W: 700, H: 440, g: .8,
    shapes: [rc(350, 430, 700, 40), rc(350, 10, 700, 40), rc(5, 230, 10, 440), rc(695, 230, 10, 440), rc(35, 262, 70, 12), rc(665, 262, 70, 12), rc(350, 340, 18, 140, 0, { top: 'b' })],
    goals: [{ team: 0, x: 40, y: 339, w: 60, h: 142 }, { team: 1, x: 660, y: 339, w: 60, h: 142 }],
    ball: [350, 250],
    ts: [sp([270, 380], [220, 380], [170, 380], [120, 380]), sp([430, 380], [480, 380], [530, 380], [580, 380])]
  },
  {
    name: 'Bumper Cup', pal: 'dusk', m: [3], fb: 1, W: 900, H: 440, g: .8,
    shapes: [
      rc(450, 430, 900, 40), rc(450, 10, 900, 40), rc(5, 230, 10, 440), rc(895, 230, 10, 440), rc(35, 262, 70, 12), rc(865, 262, 70, 12),
      ci(450, 240, 28, { t: 'b' }), ci(300, 170, 18, { t: 'b' }), ci(600, 170, 18, { t: 'b' }), rc(450, 395, 120, 14, 0, { t: 'b' }),
      rc(250, 300, 90, 14), rc(650, 300, 90, 14)
    ],
    goals: [{ team: 0, x: 40, y: 339, w: 60, h: 142 }, { team: 1, x: 860, y: 339, w: 60, h: 142 }],
    ball: [450, 120],
    ts: [sp([330, 380], [250, 380], [170, 380], [110, 380]), sp([570, 380], [650, 380], [730, 380], [790, 380])]
  }
];
MAPS.forEach(m => { m.W = m.W || 730; m.H = m.H || 500; m.g = m.g || 1; if (m.fb) m.spawns = m.ts[0].concat(m.ts[1]); });

function mapsFor(mode) { return MAPS.map((m, i) => i).filter(i => MAPS[i].m.includes(mode)); }

function posePart(s, t) {
  const mv = s.mv;
  if (!mv) return { x: s.x, y: s.y, a: s.a };
  if (mv.k === 'rot') return { x: s.x, y: s.y, a: s.a + mv.w * t + (mv.ph || 0) };
  const k = Math.sin(t * Math.PI * 2 / mv.T + (mv.ph || 0));
  return { x: s.x + mv.dx * k, y: s.y + mv.dy * k, a: s.a };
}

const PCOL = ['#e8524a', '#3f8fe0', '#4fc26a', '#f4c030', '#a566dc', '#f08a30', '#28c4c4', '#ee66b0'];
const TCOL = ['#e5483f', '#3b7fe0'];
const BOT_NAMES = ['Bonkbot', 'Roller', 'Pinball', 'Dizzy', 'Orbit', 'Bumper', 'Wobble', 'Marble'];
const FS = 1 / 60, SUBS = 2, JUMP = 345, ARROW_V = 760, HOOK_R = 460, KICK_V = 460;
const COUNT_T = 2.4, REND_T = 2.6, SHRINK_AT = 38;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

function makeArena(cfg) {
  const A = {
    cfg, mode: cfg.mode, players: [], phase: 'idle', pt: 0, clock: 0, round: 0, map: -1, world: null, ghosts: [], parts: [], arrows: [], ball: null, dyn: [],
    ev: [], acc: 0, shrink: 0, play: 0, winner: -1, matchWinner: -1, scores: [], R: rng(cfg.seed || 1), ticks: 0, mapOrder: [], frozenWt: 0, rend: '', aid: 0
  };
  const fb = cfg.mode === 3;
  cfg.players.forEach((pl, i) => {
    A.players.push({
      i, name: pl.name, col: pl.col || PCOL[i % PCOL.length], team: fb ? (pl.team == null ? i % 2 : pl.team) : -1, bot: !!pl.bot, skill: pl.skill == null ? 1 : pl.skill,
      body: null, alive: false, heavy: false, inp: { l: 0, r: 0, u: 0, d: 0, h: 0, a: 0, ax: 0, ay: 0 }, cd: 0, jcd: 0, hook: null, hookHeld: false, score: 0, kick: 0, diedAt: 0, wasA: 0, resp: 0,
      bs: { t: 0, tx: 0, ty: 0, hold: 0, tg: -1 }
    });
  });
  A.scores = fb ? [0, 0] : A.players.map(() => 0);
  const pool = mapsFor(cfg.mode);

  function pickMap() {
    if (cfg.map >= 0 && MAPS[cfg.map] && MAPS[cfg.map].m.includes(cfg.mode)) return cfg.map;
    if (!A.mapOrder.length) { A.mapOrder = pool.slice(); for (let i = A.mapOrder.length - 1; i > 0; i--) { const j = Math.floor(A.R() * (i + 1)); [A.mapOrder[i], A.mapOrder[j]] = [A.mapOrder[j], A.mapOrder[i]]; } }
    return A.mapOrder.pop();
  }

  function build(mi) {
    const M = MAPS[mi];
    const w = PH.World({ gy: 1000 * M.g });
    A.world = w; A.ghosts = []; A.parts = []; A.dyn = []; A.arrows = []; A.ball = null; A.map = mi;
    for (const s of M.shapes) {
      if (s.t === 'g') { A.ghosts.push(s); continue; }
      const kind = s.kind || (s.mv ? 1 : 0), pose = posePart(s, 0);
      const e = s.t === 'b' ? 1.5 : s.t === 'i' ? .35 : .75, f = s.t === 'i' ? .015 : .5;
      const b = PH.body({ kind, x: pose.x, y: pose.y, a: pose.a, pts: s.pts, r: s.r, e, f, cat: 1, dth: s.t === 'd', mv: s.mv ? (t => posePart(s, t)) : null, density: s.dens, adamp: kind === 2 ? .3 : 0 });
      w.add(b);
      A.parts.push({ s, b });
      if (kind === 2) A.dyn.push(b);
      if (s.pin) w.addJoint(PH.pin(b, null, s.pin[0], s.pin[1]));
      if (s.top === 'b') {
        const cap = PH.body({ kind: 0, x: s.x, y: s.y - s.h / 2 + 5, pts: [[-s.w / 2, -5], [s.w / 2, -5], [s.w / 2, 5], [-s.w / 2, 5]], e: 1.5, f: .4, cat: 1 });
        w.add(cap); A.parts.push({ s: Object.assign({}, rc(s.x, s.y - s.h / 2 + 5, s.w, 10, 0, { t: 'b' })), b: cap });
      }
    }
    for (const ch of M.chains || []) {
      const L = ch.chain, planks = [];
      for (let i = 0; i < L.length - 1; i++) {
        const a = L[i], c = L[i + 1], len = Math.hypot(c[0] - a[0], c[1] - a[1]) + 3;
        const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
        const b = PH.body({ kind: 2, x: (a[0] + c[0]) / 2, y: (a[1] + c[1]) / 2, a: ang, pts: [[-len / 2, -ch.th / 2], [len / 2, -ch.th / 2], [len / 2, ch.th / 2], [-len / 2, ch.th / 2]], e: .2, f: .7, cat: 16, mask: 2 | 4 | 8, density: .5, adamp: 1.5, damp: .3 });
        w.add(b); planks.push(b); A.dyn.push(b);
        A.parts.push({ s: { x: 0, y: 0, a: 0, w: len, h: ch.th, pts: [[-len / 2, -ch.th / 2], [len / 2, -ch.th / 2], [len / 2, ch.th / 2], [-len / 2, ch.th / 2]], t: 's', plank: 1 }, b });
      }
      w.addJoint(PH.pin(planks[0], null, L[0][0], L[0][1]));
      for (let i = 0; i < planks.length - 1; i++) w.addJoint(PH.pin(planks[i], planks[i + 1], L[i + 1][0], L[i + 1][1]));
      w.addJoint(PH.pin(planks[planks.length - 1], null, L[L.length - 1][0], L[L.length - 1][1]));
    }
    if (M.fb) {
      const bl = PH.body({ kind: 2, x: M.ball[0], y: M.ball[1], r: BR, e: .95, f: .25, cat: 8, mask: 1 | 2 | 16, damp: .1, adamp: .25, density: .55 });
      w.add(bl); A.ball = bl;
    }
  }

  function setHeavy(p, on) {
    if (p.heavy === on || !p.body) return;
    p.heavy = on;
    const b = p.body;
    b.im = on ? b.im0 / 3.4 : b.im0; b.ii = on ? b.ii0 / 3.4 : b.ii0;
    b.f = on ? .8 : .45;
  }

  function spawnPoint(p, k) {
    const M = MAPS[A.map];
    if (M.fb) {
      const mem = A.players.filter(q => q.team === p.team), idx = mem.indexOf(p), L = M.ts[p.team];
      return L[idx % L.length];
    }
    return M.spawns[k % M.spawns.length];
  }

  function place() {
    const M = MAPS[A.map], w = A.world;
    const order = M.spawns.map((_, i) => i);
    if (!M.fb) for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(A.R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    A.players.forEach((p, i) => {
      const pt = spawnPoint(p, order[i % order.length]);
      p.heavy = false;
      p.body = PH.body({ kind: 2, x: pt[0], y: pt[1], r: PR, e: .9, f: .45, cat: 2, mask: 0xffff, damp: .05, adamp: .6, density: 1, data: p });
      w.add(p.body);
      p.alive = true; p.hook = null; p.cd = 0; p.jcd = 0; p.kick = 0; p.hookHeld = false; p.resp = 0; p.diedAt = 0; p.bs.t = 0;
      p.ox = pt[0]; p.oy = pt[1]; p.oa = 0;
    });
  }

  A.newRound = () => {
    const mi = pickMap();
    build(mi);
    place();
    A.round++; A.phase = 'count'; A.pt = A.round === 1 && cfg.first ? COUNT_T + .8 : COUNT_T; A.play = 0; A.shrink = 0; A.winner = -1; A.rend = '';
    A.ev.push({ k: 'round', map: mi, rd: A.round });
  };

  A.start = (sc, rd) => { A.round = rd || 0; A.scores = sc && sc.length ? sc.slice() : fb ? [0, 0] : A.players.map(() => 0); A.players.forEach(p => { p.score = 0; }); A.matchWinner = -1; A.mapOrder = []; A.newRound(); };

  function kill(p, why) {
    if (!p.alive) return;
    p.alive = false; p.diedAt = A.clock;
    A.ev.push({ k: 'die', i: p.i, x: p.body.x, y: p.body.y, vx: p.body.vx, vy: p.body.vy, col: p.col, why });
    dropHook(p);
    A.world.remove(p.body);
    p.body.dead = true;
  }

  function dropHook(p) {
    if (p.hook) { A.world.removeJoint(p.hook.j); p.hook = null; }
  }

  function solidOk(self) { return b => b !== self && !b.sensor && (b.cat & (1 | 2 | 8 | 16)) && !b.arrow; }

  function doHook(p) {
    const b = p.body, dx = p.inp.ax - b.x, dy = p.inp.ay - b.y, d = Math.hypot(dx, dy) || 1;
    const h = A.world.ray(b.x, b.y, dx / d, dy / d, HOOK_R, solidOk(b));
    if (!h) { A.ev.push({ k: 'hook', i: p.i, x: b.x + dx / d * HOOK_R, y: b.y + dy / d * HOOK_R, ok: 0 }); return; }
    const tb = h.b, len = Math.max(30, Math.hypot(h.x - b.x, h.y - b.y));
    const j = PH.rope(b, { x: 0, y: 0 }, tb, PH.anchor(tb, h.x, h.y), len);
    A.world.addJoint(j);
    p.hook = { j, tb, len };
    A.ev.push({ k: 'hook', i: p.i, x: h.x, y: h.y, ok: 1 });
  }

  function shootArrow(p) {
    const b = p.body, dx = p.inp.ax - b.x, dy = p.inp.ay - b.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const ar = PH.body({
      kind: 2, x: b.x + ux * (PR + 15), y: b.y + uy * (PR + 15), a: Math.atan2(uy, ux), pts: [[-14, -2.2], [14, -2.2], [14, 2.2], [-14, 2.2]],
      e: .2, f: .2, cat: 4, mask: 1 | 2 | 8, density: .42, gs: .3, fixedRot: true, dth: !!cfg.deadly
    });
    ar.vx = ux * ARROW_V + b.vx * .35; ar.vy = uy * ARROW_V + b.vy * .35;
    ar.id = ++A.aid; ar.arrow = true; ar.owner = p.i; ar.born = A.play; ar.hitf = false; ar.pre = (q) => { if (!q.hitf) q.a = Math.atan2(q.vy, q.vx); };
    A.world.add(ar); A.arrows.push(ar);
    b.vx -= ux * 55; b.vy -= uy * 55;
    A.ev.push({ k: 'shoot', i: p.i, x: ar.x, y: ar.y });
  }

  function drive(p, dt) {
    const b = p.body, inp = p.inp;
    const hv = !!inp.h;
    setHeavy(p, hv);
    const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
    const acc = hv ? 520 : 1450, vmax = hv ? 210 : 340;
    if (dir) {
      const v = b.vx * dir;
      if (v < vmax) b.vx += dir * Math.min(acc * dt, vmax - v);
      b.w += dir * (hv ? 4 : 11) * dt * 4;
    }
    if (inp.d) b.vy += 800 * dt;
    if (hv) b.vy += 1200 * dt;
    p.jcd -= dt;
    if (inp.u && p.jcd <= 0 && A.world.frame - b.touch <= 6) {
      let nx = b.tnx, ny = b.tny - 1;
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const J = hv ? JUMP * .6 : JUMP;
      b.vx += nx * J * .8; b.vy = Math.min(b.vy, 0) + ny * J;
      p.jcd = .22;
      A.ev.push({ k: 'jump', i: p.i, x: b.x, y: b.y + PR });
    }
    p.cd -= dt; p.kick -= dt;
    const mode = A.mode;
    if (mode === 1) {
      if (inp.a && p.cd <= 0) { p.cd = .62; shootArrow(p); }
    } else if (mode === 2) {
      if (inp.a && !p.hookHeld && !p.hook && p.cd <= 0) { p.hookHeld = true; doHook(p); }
      if (!inp.a) { p.hookHeld = false; if (p.hook) { dropHook(p); p.cd = .2; } }
      if (p.hook) {
        if (inp.d) p.hook.j.len = Math.max(36, p.hook.j.len - 170 * dt);
        if (p.hook.tb.dead) dropHook(p);
      }
    } else if (mode === 3) {
      if (inp.a && p.cd <= 0) {
        p.cd = .38; p.kick = .16;
        const ball = A.ball;
        if (ball) {
          const dx = ball.x - b.x, dy = ball.y - b.y, d = Math.hypot(dx, dy);
          if (d < PR + BR + 20) {
            const k = d || 1;
            ball.vx += dx / k * KICK_V; ball.vy += dy / k * KICK_V - 40;
            b.vx -= dx / k * 60; b.vy -= dy / k * 60;
            A.ev.push({ k: 'kick', x: ball.x, y: ball.y });
          }
        }
        A.ev.push({ k: 'swing', i: p.i });
      }
    }
  }

  function killBox() {
    const M = MAPS[A.map];
    return { x0: -MARGIN + A.shrink, x1: M.W + MARGIN - A.shrink, y0: -320, y1: M.H + MARGIN - A.shrink };
  }

  function endRound(win, label) {
    A.winner = win; A.phase = 'rend'; A.pt = REND_T; A.rend = label || '';
    if (A.mode === 3) { A.scores[win]++; }
    else if (win >= 0) { A.scores[win]++; A.players[win].score = A.scores[win]; }
    const T = cfg.target;
    let mw = -1;
    for (let i = 0; i < A.scores.length; i++) if (A.scores[i] >= T) { if (mw < 0 || A.scores[i] > A.scores[mw]) mw = i; }
    A.ev.push({ k: 'rend', win, scores: A.scores.slice(), mw });
    if (mw >= 0) { A.matchWinner = mw; A.pt = REND_T + .6; }
  }

  function tickPlay(dt) {
    const w = A.world, M = MAPS[A.map];
    A.play += dt;
    if (A.mode !== 3 && A.play > SHRINK_AT) A.shrink = Math.min(400, (A.play - SHRINK_AT) * 11);
    for (const p of A.players) {
      if (!p.alive) continue;
      if (p.bot) botThink(A, p, dt);
      drive(p, dt);
    }
    for (const ar of A.arrows) { if (ar.hitf && !ar.dying) { ar.dying = A.play + .09; } }
    for (let s = 0; s < SUBS; s++) w.step(dt / SUBS);
    for (const h of w.hits) {
      const ar = h.a.arrow ? h.a : h.b.arrow ? h.b : null;
      if (ar) ar.hitf = true;
      if (h.v > 120) A.ev.push({ k: 'hit', x: h.x, y: h.y, v: h.v, fb: h.a === A.ball || h.b === A.ball, ar: !!ar });
    }
    w.hits = [];
    for (const ar of A.arrows) {
      if (ar.dying && A.play >= ar.dying || A.play - ar.born > 3.2 || ar.y > M.H + 300 || ar.x < -400 || ar.x > M.W + 400) { w.remove(ar); ar.gone = true; }
    }
    A.arrows = A.arrows.filter(a => !a.gone);
    const kb = killBox();
    for (const p of A.players) {
      if (!p.alive) continue;
      const b = p.body;
      if (b.dthHit) { b.dthHit = false; if (A.mode === 3) { respawn(p, 1.4); continue; } kill(p, 'death'); continue; }
      if (b.x < kb.x0 || b.x > kb.x1 || b.y < kb.y0 || b.y > kb.y1) {
        if (A.mode === 3) { respawn(p, 1.4); continue; }
        kill(p, 'out');
      }
      if (p.hook && p.hook.tb.dead) dropHook(p);
    }
    if (A.mode === 3) tickFootball(dt);
    else {
      const alive = A.players.filter(p => p.alive);
      if (alive.length <= 1 && A.players.length > 1) {
        if (alive.length === 1) endRound(alive[0].i, 'win');
        else {
          const last = A.players.slice().sort((a, b) => b.diedAt - a.diedAt)[0];
          endRound(last.i, 'win');
        }
      }
    }
  }

  function respawn(p, delay) {
    const b = p.body, pt = spawnPoint(p, p.i);
    dropHook(p);
    setHeavy(p, false);
    b.x = pt[0]; b.y = pt[1]; b.vx = 0; b.vy = 0; b.w = 0; b.a = 0; PH.xform(b);
    p.ox = b.x; p.oy = b.y;
    A.ev.push({ k: 'respawn', x: b.x, y: b.y, col: p.col });
  }

  function tickFootball(dt) {
    const bl = A.ball, M = MAPS[A.map];
    if (!bl) return;
    for (let t = 0; t < 2; t++) {
      const g = M.goals[t];
      if (Math.abs(bl.x - g.x) < g.w / 2 && Math.abs(bl.y - g.y) < g.h / 2 + 4) {
        const win = 1 - t;
        A.ev.push({ k: 'goal', team: win, x: bl.x, y: bl.y });
        endRound(win, 'goal');
        return;
      }
    }
    if (bl.x < -80 || bl.x > M.W + 80 || bl.y < -200 || bl.y > M.H + 120) { bl.x = M.ball[0]; bl.y = M.ball[1]; bl.vx = 0; bl.vy = 0; bl.w = 0; }
  }

  A.tick = () => {
    const dt = FS;
    A.clock += dt * 1000; A.ticks++;
    const w = A.world;
    if (w) {
      for (const p of A.players) if (p.body) { p.ox = p.body.x; p.oy = p.body.y; p.oa = p.body.a; }
      if (A.ball) { A.ball.ox = A.ball.x; A.ball.oy = A.ball.y; A.ball.oa = A.ball.a; }
      for (const b of A.dyn) { b.ox = b.x; b.oy = b.y; b.oa = b.a; }
      for (const b of A.arrows) { b.ox = b.x; b.oy = b.y; b.oa = b.a; }
    }
    if (A.phase === 'count') {
      A.pt -= dt;
      for (const p of A.players) if (p.bot && p.alive) p.bs.t = 0;
      if (A.pt <= 0) { A.phase = 'play'; A.ev.push({ k: 'go' }); }
    } else if (A.phase === 'play') tickPlay(dt);
    else if (A.phase === 'rend') {
      A.pt -= dt;
      if (A.mode === 3 && w) { for (let s = 0; s < SUBS; s++) w.step(dt / SUBS); w.hits = []; }
      else if (w) { for (const p of A.players) if (p.alive && p.bot) { p.inp.l = p.inp.r = p.inp.u = p.inp.a = 0; } for (const p of A.players) if (p.alive) drive(p, dt); for (let s = 0; s < SUBS; s++) w.step(dt / SUBS); w.hits = []; }
      if (A.pt <= 0) {
        if (A.matchWinner >= 0) { A.phase = 'mend'; A.ev.push({ k: 'mend', mw: A.matchWinner }); }
        else A.newRound();
      }
    }
  };

  A.advance = dt => {
    A.acc += dt;
    let n = 0;
    while (A.acc >= FS && n < 5) { A.acc -= FS; n++; A.tick(); }
    if (n === 5) A.acc = 0;
    return A.acc / FS;
  };

  A.drain = () => { const e = A.ev; A.ev = []; return e; };
  return A;
}

function botThink(A, p, dt) {
  botCore(A, p, dt);
  if (A.mode === 2) {
    const bs = p.bs;
    if (p.hook) bs.ht = (bs.ht || 0) + dt; else bs.ht = 0;
    bs.nh = Math.max(0, (bs.nh || 0) - dt);
    if (bs.ht > 1.15) { bs.nh = 1.1; bs.ht = 0; }
    if (bs.nh > 0) p.inp.a = 0;
  }
}

function botCore(A, p, dt) {
  const b = p.body, s = p.skill, inp = p.inp, M = MAPS[A.map], bs = p.bs;
  bs.t -= dt;
  const R = A.R;
  if (bs.t > 0) { return; }
  const dtb = [.2, .12, .06][s] * (.7 + R() * .6);
  bs.t = dtb;
  if ((inp.l || inp.r) && Math.abs(b.vx) < 30 && A.phase === 'play') bs.stuck = (bs.stuck || 0) + dtb; else bs.stuck = 0;
  const stuckJump = bs.stuck > .35;
  if (stuckJump) bs.stuck = 0;
  inp.l = inp.r = inp.u = inp.d = inp.h = inp.a = 0;
  const w = A.world;
  if (A.mode === 3) { botFoot(A, p); if (stuckJump) inp.u = 1; return; }
  let foe = null, fd = 1e9;
  for (const q of A.players) { if (q === p || !q.alive) continue; const d = Math.hypot(q.body.x - b.x, q.body.y - b.y); if (d < fd) { fd = d; foe = q; } }
  const ok = bb => bb !== b && !bb.sensor && bb.cat === 1;
  const look = b.vx * .5;
  const gd = w.ray(b.x + look, b.y, 0, 1, 230, ok);
  const gh = w.ray(b.x, b.y, 0, 1, 230, ok);
  const grounded = A.world.frame - b.touch <= 6;
  let danger = !gd || !gh;
  const kb = { x0: -MARGIN + A.shrink, x1: M.W + MARGIN - A.shrink };
  if (b.x < 20 + A.shrink * .8 || b.x > M.W - 20 - A.shrink * .8) danger = true;
  if (danger) {
    let best = null, bd = 1e9;
    for (const sp of M.spawns) {
      const d = Math.hypot(sp[0] - b.x, (sp[1] - b.y) * (sp[1] < b.y ? 1.6 : .8));
      if (d < bd && sp[0] > kb.x0 + 60 && sp[0] < kb.x1 - 60) { bd = d; best = sp; }
    }
    if (!best) best = [M.W / 2, M.H / 2];
    const dx = best[0] - b.x;
    if (Math.abs(dx) > 8) { if (dx > 0) inp.r = 1; else inp.l = 1; }
    if (best[1] < b.y - 20 && grounded) inp.u = 1;
    if (best[1] < b.y - 80 && Math.abs(dx) < 60 && R() < .5) inp.u = 1;
    if (A.mode === 2) {
      const tx = best[0] + (R() - .5) * 60, ty = Math.min(best[1] - 90, b.y - 120);
      inp.ax = tx; inp.ay = ty;
      if (!p.hook && b.vy > -50) inp.a = 1;
      if (p.hook && Math.hypot(p.hook.j.px - b.x, p.hook.j.py - b.y) > 20) inp.a = 1;
      if (p.hook) { inp.d = 1; }
    } else if (A.mode === 1 && foe && fd < 450 && R() < .3) { inp.ax = foe.body.x; inp.ay = foe.body.y; inp.a = 1; }
    if (A.mode === 1 && foe && !inp.a) { inp.ax = foe.body.x; inp.ay = foe.body.y; }
    return;
  }
  if (A.mode === 2 && p.hook) { inp.a = R() < .35 ? 1 : 0; }
  if (!foe) return;
  const fx = foe.body.x, fy = foe.body.y, cx = M.W / 2;
  const outDir = fx >= cx ? 1 : -1;
  let tx = fx - outDir * (PR * 2 + 4) * (s === 0 ? .6 : 1);
  if (Math.abs(fx - cx) < 60) tx = fx + (b.x < fx ? -1 : 1) * 10;
  if (A.mode === 1) {
    const dd = Math.abs(fx - b.x);
    const vx = foe.body.vx, vy = foe.body.vy;
    const tt = Math.min(1, Math.hypot(fx - b.x, fy - b.y) / ARROW_V);
    const err = [.32, .14, .05][s];
    inp.ax = fx + vx * tt * .85 + (R() - .5) * err * 300 * tt;
    inp.ay = fy + vy * tt * .85 - 150 * tt * tt + (R() - .5) * err * 300 * tt;
    const blocked = w.ray(b.x, b.y, (fx - b.x) / (fd || 1), (fy - b.y) / (fd || 1), fd - PR, bb => bb.cat === 1 && !bb.sensor);
    if (fd < 560 && (!blocked || s === 0) && R() < [.4, .6, .85][s]) inp.a = 1;
    if (dd < 130 && fd < 150) { tx = b.x > fx ? b.x + 90 : b.x - 90; }
    else tx = fx - outDir * 160;
    if (b.x < kb.x0 + 140) tx = b.x + 80; if (b.x > kb.x1 - 140) tx = b.x - 80;
    if (Math.abs(tx - b.x) > 24) { if (tx > b.x) inp.r = 1; else inp.l = 1; }
    if (R() < .12 && grounded) inp.u = 1;
    return;
  }
  const dx = tx - b.x;
  if (stuckJump) inp.u = 1;
  if (Math.abs(dx) > 6) { if (dx > 0) inp.r = 1; else inp.l = 1; }
  if (grounded && (fy < b.y - 50 || R() < [.04, .07, .1][s])) inp.u = 1;
  if (fd < 62 + s * 8) {
    const closing = (foe.body.x - b.x) * (b.vx) > 0;
    if (R() < [.35, .55, .8][s] && (closing || s === 2)) inp.h = 1;
    if (foe.heavy && s > 0 && fd < 80) { inp.l = inp.r = 0; if (R() < .6) { if (b.x > foe.body.x) inp.r = 1; else inp.l = 1; } }
  }
  if (fy > b.y + 20 && fd < 100 && s > 0) inp.d = 1;
  if (A.mode === 2) {
    inp.ax = fx; inp.ay = fy;
    if (!p.hook && fd < 380 && fd > 90 && R() < .5) inp.a = 1;
    else if (p.hook) { inp.a = fd > 60 ? 1 : 0; inp.d = 1; }
  }
}

function botFoot(A, p) {
  const b = p.body, inp = p.inp, M = MAPS[A.map], bl = A.ball, s = p.skill, R = A.R;
  if (!bl) return;
  const dir = p.team === 0 ? 1 : -1;
  const mem = A.players.filter(q => q.team === p.team), idx = mem.indexOf(p);
  const keeper = mem.length >= 2 && idx === mem.length - 1;
  const ownGoal = M.goals[p.team];
  const bx = bl.x, by = bl.y;
  let tx;
  const behind = (b.x - bx) * dir < -4;
  if (keeper && (bx - ownGoal.x) * dir > 260) {
    tx = ownGoal.x + dir * 90;
    if (Math.abs(by - b.y) < 70) tx = ownGoal.x + dir * 110;
  } else {
    const aim = Math.atan2(M.goals[1 - p.team].y - by, M.goals[1 - p.team].x - bx);
    tx = bx - Math.cos(aim) * (PR + BR + 6);
    if (!behind) tx = bx - dir * (PR + BR + 40);
    else if (Math.abs(b.x - tx) < 40) tx = bx;
  }
  const dx = tx - b.x;
  const spd = Math.abs(dx);
  if (spd > 8) { if (dx > 0) inp.r = 1; else inp.l = 1; }
  const grounded = A.world.frame - b.touch <= 6;
  const dist = Math.hypot(bx - b.x, by - b.y);
  if (grounded && by < b.y - 30 && Math.abs(bx - b.x) < 90 && R() < .6) inp.u = 1;
  if (grounded && !behind && dist < 80 && by < b.y - 10 && R() < .3) inp.u = 1;
  if (dist < PR + BR + 18 && behind !== false) {
    const gdx = M.goals[1 - p.team].x - bx;
    if (gdx * dir > 0 || s === 0) inp.a = 1;
    if (R() < [.3, .45, .6][s]) inp.h = 1;
  }
  if (A.phase !== 'play') { inp.l = inp.r = inp.u = inp.a = inp.h = 0; }
}

const CW = 960, CH = 600;
const partCache = {};

function renderParts(mi) {
  if (partCache[mi]) return partCache[mi];
  const M = MAPS[mi], L = [];
  let dyn = 0;
  for (const s of M.shapes) {
    if (s.t === 'g') { L.push({ s, ghost: 1, dyn: -1 }); continue; }
    const k = s.kind || (s.mv ? 1 : 0);
    L.push({ s, dyn: k === 2 ? dyn++ : -1 });
    if (s.top === 'b') L.push({ s: rc(s.x, s.y - s.h / 2 + 5, s.w, 10, 0, { t: 'b' }), dyn: -1 });
  }
  for (const ch of M.chains || []) {
    for (let i = 0; i < ch.chain.length - 1; i++) {
      const a = ch.chain[i], c = ch.chain[i + 1], len = Math.hypot(c[0] - a[0], c[1] - a[1]) + 3;
      L.push({ s: { w: len, h: ch.th, pts: [[-len / 2, -ch.th / 2], [len / 2, -ch.th / 2], [len / 2, ch.th / 2], [-len / 2, ch.th / 2]], t: 's', plank: 1, x: 0, y: 0, a: 0 }, dyn: dyn++ });
    }
  }
  partCache[mi] = L;
  return L;
}

function mixc(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round((pa >> 16) * (1 - k) + (pb >> 16) * k), g = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k), bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

function camFor(mi, cw, ch) {
  const M = MAPS[mi], pad = 46;
  const sc = Math.min((cw - 20) / (M.W + pad), (ch - 20) / (M.H + pad));
  return { sc, ox: (cw - M.W * sc) / 2, oy: (ch - M.H * sc) / 2 + (M.fb ? 8 : 0) };
}

function drawBack(ctx, mi, cw, ch, cam, tm) {
  const M = MAPS[mi], P = PAL[M.pal];
  const g = ctx.createLinearGradient(0, 0, 0, ch);
  g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
  ctx.save();
  if (M.pal === 'sky' || M.pal === 'grass') {
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 5; i++) {
      const x = ((i * 233 + tm * (6 + i * 2)) % (cw + 200)) - 100, y = 60 + (i * 97) % 280;
      for (const [dx, dy, r] of [[0, 0, 26], [28, 6, 20], [-26, 8, 18], [8, -14, 20]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill(); }
    }
  } else if (M.pal === 'night' || M.pal === 'dusk' || M.pal === 'slate') {
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 46; i++) { const x = (i * 211.7) % cw, y = (i * 137.3) % (ch * .8), r = (i % 3) * .5 + .6; ctx.globalAlpha = .4 + .4 * Math.sin(tm * 1.3 + i); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (M.pal !== 'slate') { ctx.fillStyle = 'rgba(255,248,220,.9)'; ctx.beginPath(); ctx.arc(cw * .82, 90, 28, 0, 7); ctx.fill(); ctx.fillStyle = P.bg[0]; ctx.beginPath(); ctx.arc(cw * .82 + 10, 84, 25, 0, 7); ctx.fill(); }
  } else if (M.pal === 'ice') {
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 40; i++) { const x = (i * 97.3 + Math.sin(tm + i) * 14) % cw, y = (i * 61.1 + tm * (20 + i % 7 * 4)) % ch; ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 3, 0, 7); ctx.fill(); }
  } else if (M.pal === 'fire') {
    for (let i = 0; i < 26; i++) { const x = (i * 83.7) % cw, y = ch - ((tm * (24 + i % 5 * 8) + i * 53) % ch); ctx.fillStyle = 'rgba(255,' + (140 + i % 4 * 25) + ',60,' + (.2 + (y / ch) * .5) + ')'; ctx.beginPath(); ctx.arc(x + Math.sin(tm + i) * 10, y, 1.5 + i % 3, 0, 7); ctx.fill(); }
  } else if (M.pal === 'mint' || M.pal === 'sand') {
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 190 - 60, ch); ctx.lineTo(i * 190 + 60, 0); ctx.lineTo(i * 190 + 120, 0); ctx.lineTo(i * 190 + 10, ch); ctx.fill(); }
  } else if (M.pal === 'pitch') {
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; ctx.fillRect(i * cw / 12, 0, cw / 12, ch); }
  }
  ctx.restore();
  if (M.fb) {
    ctx.save();
    ctx.translate(cam.ox, cam.oy); ctx.scale(cam.sc, cam.sc);
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(M.W / 2, 30); ctx.lineTo(M.W / 2, M.H - 30); ctx.stroke();
    ctx.beginPath(); ctx.arc(M.W / 2, M.H / 2 + 10, 64, 0, 7); ctx.stroke();
    ctx.restore();
  }
}

function pathPoly(ctx, s, pose) {
  const c = Math.cos(pose.a), sn = Math.sin(pose.a);
  ctx.beginPath();
  s.pts.forEach((p, i) => { const x = pose.x + c * p[0] - sn * p[1], y = pose.y + sn * p[0] + c * p[1]; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.closePath();
}

function drawPart(ctx, pt, pose, P, tm) {
  const s = pt.s;
  const t = s.t;
  ctx.save();
  ctx.lineJoin = 'round';
  if (s.r) {
    ctx.beginPath(); ctx.arc(pose.x, pose.y, s.r, 0, 7);
    if (t === 'g') { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.stroke(); }
    else if (t === 'b') { ctx.fillStyle = '#45e08a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#146b3a'; ctx.stroke(); ctx.beginPath(); ctx.arc(pose.x, pose.y, s.r * (.45 + .1 * Math.sin(tm * 6)), 0, 7); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); }
    else { ctx.fillStyle = P.fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = P.edge; ctx.stroke(); ctx.beginPath(); ctx.arc(pose.x - s.r * .3, pose.y - s.r * .3, s.r * .35, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill(); }
    ctx.restore();
    return;
  }
  pathPoly(ctx, s, pose);
  if (t === 'g') {
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fill();
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    return;
  }
  let fill = P.fill, edge = P.edge;
  if (t === 'b') { fill = '#45e08a'; edge = '#146b3a'; }
  else if (t === 'i') { fill = '#bfe9fb'; edge = '#4c8fb4'; }
  else if (t === 'd') { fill = '#d83a3a'; edge = '#5a0c0c'; }
  else if (s.plank) { fill = '#a77a46'; edge = '#4a3015'; }
  ctx.fillStyle = fill; ctx.fill();
  ctx.save(); ctx.clip();
  const b = polyBox(s, pose);
  if (t === 's' && !s.plank) {
    const g = ctx.createLinearGradient(0, b[1], 0, b[3]);
    g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = g; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
    if (s.grass) {
      ctx.translate(pose.x, pose.y); ctx.rotate(pose.a);
      ctx.fillStyle = P.top; ctx.fillRect(-s.w / 2 - 2, -s.h / 2 - 2, s.w + 4, 9);
      ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-s.w / 2 - 2, -s.h / 2 + 7, s.w + 4, 2);
    }
  } else if (t === 'd') {
    ctx.fillStyle = '#5a0c0c';
    for (let x = b[0] - (b[3] - b[1]); x < b[2] + 20; x += 18) { ctx.beginPath(); ctx.moveTo(x, b[3]); ctx.lineTo(x + 8, b[3]); ctx.lineTo(x + 8 + (b[3] - b[1]), b[1]); ctx.lineTo(x + (b[3] - b[1]), b[1]); ctx.fill(); }
  } else if (t === 'b') {
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    const k = (Math.sin(tm * 6) + 1) / 2;
    ctx.globalAlpha = .5 + .3 * k;
    for (let x = b[0]; x < b[2]; x += 20) ctx.fillRect(x, b[1] + 1, 8, 3);
  } else if (t === 'i') {
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(b[0], b[1], b[2] - b[0], 4);
    ctx.globalAlpha = .5; ctx.fillStyle = '#fff';
    for (let x = b[0] + 10; x < b[2]; x += 44) { ctx.beginPath(); ctx.moveTo(x, b[3]); ctx.lineTo(x + 12, b[3]); ctx.lineTo(x + 30, b[1]); ctx.lineTo(x + 18, b[1]); ctx.fill(); }
  }
  ctx.restore();
  pathPoly(ctx, s, pose);
  ctx.lineWidth = 3; ctx.strokeStyle = edge; ctx.stroke();
  ctx.restore();
}

function polyBox(s, pose) {
  const c = Math.cos(pose.a), sn = Math.sin(pose.a);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of s.pts) { const x = pose.x + c * p[0] - sn * p[1], y = pose.y + sn * p[0] + c * p[1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}

function partPose(pt, v) {
  if (pt.dyn >= 0 && v.dy && v.dy[pt.dyn]) { const d = v.dy[pt.dyn]; return { x: d[0], y: d[1], a: d[2] }; }
  if (pt.dyn >= 0) return { x: pt.s.x, y: pt.s.y, a: pt.s.a };
  return posePart(pt.s, v.wt);
}

function drawBall(ctx, x, y, a, r, col, heavy, ringCol) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  const base = heavy ? mixc(col, '#1a1a22', .62) : col;
  const g = ctx.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r);
  g.addColorStop(0, mixc(base, '#ffffff', .5)); g.addColorStop(.5, base); g.addColorStop(1, mixc(base, '#000000', .28));
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7);
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = heavy ? 3.4 : 2.4; ctx.strokeStyle = heavy ? '#000' : '#14141c'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r - 1.5, 0);
  ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(r * .46, 0, r * .17, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
  if (heavy) { ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); }
  ctx.restore();
  if (ringCol) { ctx.beginPath(); ctx.arc(x, y, r + 3.5, 0, 7); ctx.strokeStyle = ringCol; ctx.lineWidth = 2.6; ctx.stroke(); }
}

function drawFootball(ctx, x, y, a, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const g = ctx.createRadialGradient(-r * .3, -r * .35, 2, 0, 0, r);
  g.addColorStop(0, '#fff'); g.addColorStop(1, '#cdd3dc');
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#20242c';
  const pent = (px, py, rr) => { ctx.beginPath(); for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + i * 1.2566; ctx.lineTo(px + Math.cos(an) * rr, py + Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); };
  pent(0, 0, r * .36);
  for (let i = 0; i < 5; i++) { const an = i * 1.2566 + .3; pent(Math.cos(an) * r * .88, Math.sin(an) * r * .88, r * .22); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.lineWidth = 2.6; ctx.strokeStyle = '#14141c'; ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx, x, y, a, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.strokeStyle = '#14141c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(13, 0); ctx.stroke();
  ctx.strokeStyle = col || '#f2e2b3'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(13, 0); ctx.stroke();
  ctx.fillStyle = '#14141c';
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(9, -5); ctx.lineTo(9, 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(10.5, -3); ctx.lineTo(10.5, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col || '#ff5a4a';
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-19, -4.5); ctx.lineTo(-11, -4.5); ctx.lineTo(-8, 0); ctx.lineTo(-11, 4.5); ctx.lineTo(-19, 4.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function makeFx() {
  const ps = [], rings = [];
  return {
    ps, rings, shake: 0,
    burst(x, y, col, n, sp, life, size) {
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.3 + Math.random() * .7); ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, t: life, col, size: size * (.5 + Math.random() * .6), g: 400 }); }
    },
    ring(x, y, col, r1, life) { rings.push({ x, y, col, r1, life, t: life }); },
    update(dt) {
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.t -= dt; if (p.t <= 0) { ps.splice(i, 1); continue; } p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      for (let i = rings.length - 1; i >= 0; i--) { rings[i].t -= dt; if (rings[i].t <= 0) rings.splice(i, 1); }
      this.shake = Math.max(0, this.shake - dt * 30);
    },
    draw(ctx) {
      for (const p of ps) { ctx.globalAlpha = Math.max(0, p.t / p.life); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); }
      for (const r of rings) { const k = 1 - r.t / r.life; ctx.globalAlpha = (1 - k) * .8; ctx.strokeStyle = r.col; ctx.lineWidth = 4 * (1 - k) + 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r1 * (.3 + k), 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
  };
}

function drawScene(ctx, v, fx, UI) {
  const mi = v.map, M = MAPS[mi], P = PAL[M.pal];
  const cam = camFor(mi, CW, CH);
  UI.cam = cam;
  const tm = performance.now() / 1000;
  drawBack(ctx, mi, CW, CH, cam, tm);
  ctx.save();
  const sh = fx.shake;
  ctx.translate(cam.ox + (sh ? (Math.random() - .5) * sh : 0), cam.oy + (sh ? (Math.random() - .5) * sh : 0));
  ctx.scale(cam.sc, cam.sc);
  if (!M.fb) {
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    const kx0 = -MARGIN + v.shrink, kx1 = M.W + MARGIN - v.shrink, ky1 = M.H + MARGIN - v.shrink;
    ctx.save();
    ctx.beginPath(); ctx.rect(-900, -900, 3000, 3000); ctx.rect(0, 0, M.W, M.H);
    ctx.fill('evenodd');
    ctx.restore();
    if (v.shrink > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(220,40,40,.28)';
      ctx.beginPath(); ctx.rect(-900, -900, 3000, 3000); ctx.rect(kx0, -900, kx1 - kx0, ky1 + 900);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(255,70,70,.8)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
      ctx.strokeRect(kx0, -200, kx1 - kx0, ky1 + 200);
      ctx.restore();
    }
  } else {
    for (let t = 0; t < 2; t++) {
      const g = M.goals[t];
      ctx.fillStyle = mixc(TCOL[t], '#ffffff', .0); ctx.globalAlpha = .22;
      ctx.fillRect(g.x - g.w / 2, g.y - g.h / 2, g.w, g.h);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(g.x - g.w / 2 + i * g.w / 6, g.y - g.h / 2); ctx.lineTo(g.x - g.w / 2 + i * g.w / 6, g.y + g.h / 2); ctx.stroke(); }
      for (let i = 0; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(g.x - g.w / 2, g.y - g.h / 2 + i * g.h / 6); ctx.lineTo(g.x + g.w / 2, g.y - g.h / 2 + i * g.h / 6); ctx.stroke(); }
    }
  }
  const parts = renderParts(mi);
  for (const pt of parts) if (pt.ghost) drawPart(ctx, pt, partPose(pt, v), P, tm);
  for (const pt of parts) if (!pt.ghost) drawPart(ctx, pt, partPose(pt, v), P, tm);
  for (const pt of parts) {
    if (pt.s.pin) { ctx.beginPath(); ctx.arc(pt.s.pin[0], pt.s.pin[1], 6, 0, 7); ctx.fillStyle = '#e0e0e0'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#222'; ctx.stroke(); }
  }
  for (const ch of M.chains || []) for (const p of [ch.chain[0], ch.chain[ch.chain.length - 1]]) { ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 7); ctx.fillStyle = '#ddd'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#222'; ctx.stroke(); }
  for (const p of v.pl) {
    if (p.alive && p.hook) {
      ctx.strokeStyle = '#14141c'; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.hook[0], p.hook[1]); ctx.stroke();
      ctx.strokeStyle = mixc(p.col, '#ffffff', .4); ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.hook[0], p.hook[1], 4.5, 0, 7); ctx.fillStyle = '#e8e8e8'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#14141c'; ctx.stroke();
    }
  }
  if (v.bl) drawFootball(ctx, v.bl[0], v.bl[1], v.bl[2], BR);
  for (const a of v.ar) drawArrow(ctx, a[0], a[1], a[2], null);
  for (const p of v.pl) {
    if (!p.alive) continue;
    const ring = M.fb ? TCOL[p.team] : null;
    drawBall(ctx, p.x, p.y, p.a, PR, p.col, p.heavy, ring);
    if (p.kick > 0) { ctx.beginPath(); ctx.arc(p.x, p.y, PR + 9, 0, 7); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.stroke(); }
  }
  fx.draw(ctx);
  ctx.font = '800 ' + (11.5 * Math.min(1.7, 1 + ((UI.hs || 1) - 1) * .6)) + 'px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  for (const p of v.pl) {
    if (!p.alive) continue;
    const y = p.y - PR - 8;
    ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,12,24,.85)';
    ctx.strokeText(p.name, p.x, y);
    ctx.fillStyle = p.me ? '#ffe680' : '#fff';
    ctx.fillText(p.name, p.x, y);
    if (p.me && v.phase === 'count') { ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.moveTo(p.x - 5, y - 16); ctx.lineTo(p.x + 5, y - 16); ctx.lineTo(p.x, y - 9); ctx.fill(); }
  }
  ctx.restore();
  drawHud(ctx, v, UI, cam);
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function outText(ctx, s, x, y, fill, stroke, lw) {
  ctx.lineWidth = lw || 5; ctx.strokeStyle = stroke || 'rgba(10,12,24,.9)'; ctx.lineJoin = 'round';
  ctx.strokeText(s, x, y); ctx.fillStyle = fill; ctx.fillText(s, x, y);
}

function drawHud(ctx, v, UI, cam) {
  const M = MAPS[v.map], fb = M.fb, hs = UI.hs || 1, W = CW / hs, H = CH / hs;
  ctx.save();
  ctx.scale(hs, hs);
  ctx.textBaseline = 'alphabetic';
  if (fb) {
    const cx = W / 2, y = 34;
    rrect(ctx, cx - 120, y - 24, 240, 40, 12); ctx.fillStyle = 'rgba(8,12,28,.72)'; ctx.fill();
    ctx.font = '900 26px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = TCOL[0]; ctx.fillText(String(v.scores[0]), cx - 70, y + 7);
    ctx.fillStyle = TCOL[1]; ctx.fillText(String(v.scores[1]), cx + 70, y + 7);
    ctx.fillStyle = '#fff'; ctx.font = '900 14px system-ui, sans-serif'; ctx.fillText('FIRST TO ' + v.target, cx, y + 5);
    ctx.font = '800 10px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.fillText('RED', cx - 70, y - 13); ctx.fillText('BLUE', cx + 70, y - 13);
  } else {
    const rows = v.pl.map((p, i) => ({ p, s: v.scores[i] }));
    const rh = 22, x = 12, y = 12;
    const w = 168, h = rows.length * rh + 26;
    rrect(ctx, x, y, w, h, 10); ctx.fillStyle = 'rgba(8,12,28,.62)'; ctx.fill();
    ctx.font = '800 10px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText('FIRST TO ' + v.target, x + 10, y + 16);
    rows.forEach((r, i) => {
      const yy = y + 22 + i * rh;
      ctx.globalAlpha = r.p.alive || v.phase === 'count' ? 1 : .45;
      ctx.beginPath(); ctx.arc(x + 17, yy + 11, 6.5, 0, 7); ctx.fillStyle = r.p.col; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#000'; ctx.stroke();
      ctx.font = '800 12.5px system-ui, sans-serif'; ctx.fillStyle = r.p.me ? '#ffe680' : '#fff';
      ctx.fillText(r.p.name.length > 11 ? r.p.name.slice(0, 10) + '.' : r.p.name, x + 30, yy + 15);
      ctx.textAlign = 'right'; ctx.font = '900 14px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(String(r.s), x + w - 10, yy + 15); ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    });
  }
  ctx.textAlign = 'center';
  ctx.font = '800 11px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.7)';
  const lbl = 'ROUND ' + v.round + '  ·  ' + M.name.toUpperCase();
  if (fb) ctx.fillText(lbl, W / 2, 66); else ctx.fillText(lbl, W / 2, 20);
  const ph = v.phase;
  if (ph === 'count') {
    const n = Math.ceil(v.pt);
    if (v.pt > 0) {
      ctx.font = '900 86px system-ui, sans-serif';
      const k = 1 - (v.pt - Math.floor(v.pt));
      ctx.save(); ctx.translate(W / 2, H / 2 - 10); ctx.scale(1 + k * .25, 1 + k * .25);
      ctx.globalAlpha = Math.max(0, Math.min(1, v.pt * 2.5));
      outText(ctx, n > 3 ? 'GET READY' : String(n), 0, 30, '#fff', 'rgba(20,30,70,.9)', 10);
      ctx.restore();
    }
  } else if (ph === 'play' && v.play < .7) {
    ctx.font = '900 70px system-ui, sans-serif';
    ctx.globalAlpha = 1 - v.play / .7;
    outText(ctx, 'GO!', W / 2, H / 2 + 20, '#ffe680', 'rgba(60,30,0,.9)', 10);
    ctx.globalAlpha = 1;
  } else if (ph === 'rend' || ph === 'mend') {
    let txt = '', col = '#fff';
    if (fb) { if (v.win >= 0) { txt = 'GOAL!'; col = TCOL[v.win]; } }
    else if (v.win >= 0 && v.pl[v.win]) { txt = v.pl[v.win].name + ' wins the round'; col = v.pl[v.win].col; }
    else txt = 'Draw';
    ctx.font = '900 44px system-ui, sans-serif';
    outText(ctx, txt, W / 2, H / 2 - 10, mixc(col, '#ffffff', .25), 'rgba(10,14,30,.92)', 9);
    if (fb && v.win >= 0) { ctx.font = '800 20px system-ui, sans-serif'; outText(ctx, (v.win === 0 ? 'RED' : 'BLUE') + ' scores', W / 2, H / 2 + 26, '#fff', 'rgba(10,14,30,.92)', 6); }
  }
  if (v.shrink > 0 && ph === 'play') {
    ctx.font = '900 20px system-ui, sans-serif';
    ctx.globalAlpha = .6 + .4 * Math.sin(performance.now() / 160);
    outText(ctx, 'THE ARENA IS CLOSING IN', W / 2, H - 22, '#ff8a80', 'rgba(40,0,0,.9)', 6);
    ctx.globalAlpha = 1;
  }
  const me = UI.me >= 0 ? v.pl[UI.me] : null;
  ctx.scale(1 / hs, 1 / hs);
  if (me && me.alive && (v.mode === 1 || v.mode === 2) && UI.aim && !UI.touch) {
    const ax = UI.aim.x * cam.sc + cam.ox, ay = UI.aim.y * cam.sc + cam.oy;
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ax, ay, 9, 0, 7); ctx.moveTo(ax - 15, ay); ctx.lineTo(ax - 4, ay); ctx.moveTo(ax + 4, ay); ctx.lineTo(ax + 15, ay); ctx.moveTo(ax, ay - 15); ctx.lineTo(ax, ay - 4); ctx.moveTo(ax, ay + 4); ctx.lineTo(ax, ay + 15); ctx.stroke();
    const mx = me.x * cam.sc + cam.ox, my = me.y * cam.sc + cam.oy;
    ctx.setLineDash([3, 7]); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ax, ay); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.scale(hs, hs);
  if (me && !me.alive && ph === 'play' && !fb) {
    ctx.font = '800 14px system-ui, sans-serif';
    outText(ctx, 'You are out. Watching the rest of the round…', W / 2, H - 20, '#fff', 'rgba(10,14,30,.9)', 5);
  }
  if (UI.hint > 0 && ph !== 'mend') {
    ctx.globalAlpha = Math.min(1, UI.hint);
    ctx.font = '700 12px system-ui, sans-serif'; ctx.textAlign = 'center';
    outText(ctx, UI.hintText, W / 2, H - 8, '#fff', 'rgba(10,14,30,.9)', 4);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawPreview(cv, mi) {
  const ctx = cv.getContext('2d'), M = MAPS[mi], P = PAL[M.pal];
  const w = cv.width, h = cv.height;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const sc = Math.min(w / (M.W + 20), h / (M.H + 20));
  ctx.save();
  ctx.translate((w - M.W * sc) / 2, (h - M.H * sc) / 2); ctx.scale(sc, sc);
  const v = { wt: 0, dy: null };
  for (const pt of renderParts(mi)) drawPart(ctx, pt, partPose(pt, v), P, 0);
  ctx.restore();
}

const BK_CSS = `.gm-bonk{gap:0}
.gm-bonk .bk-wrap{position:relative;width:min(100%,960px,calc((100dvh - var(--goff,250px))*1.6));margin:0 auto;border-radius:var(--r);overflow:hidden;background:#101830;box-shadow:0 0 0 1px var(--line);touch-action:none;-webkit-user-select:none;user-select:none}
.gm-bonk .bk-wrap canvas{display:block;width:100% !important;height:auto;aspect-ratio:960/600;border-radius:0;background:#101830;cursor:crosshair}
.gm-bonk .bk-ui{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(8,14,36,.74);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);overflow:auto;font-family:var(--sans);color:#fff}
.gm-bonk .bk-ui[hidden]{display:none}
.gm-bonk .bk-card{width:100%;max-width:760px;margin:auto;text-align:center}
.gm-bonk .bk-logo{display:inline-flex;align-items:center;gap:10px;font:900 italic clamp(34px,7vw,58px)/1 var(--sans);letter-spacing:-.02em;color:#fff;text-shadow:0 4px 0 #1b3a8a,0 0 24px rgba(90,140,255,.55)}
.gm-bonk .bk-logo i{display:inline-block;width:.8em;height:.8em;border-radius:50%;background:radial-gradient(circle at 32% 30%,#fff 0,#ffd95a 22%,#f08a30 70%,#a04a10);box-shadow:0 0 0 3px #14141c;animation:bkbob 1.6s ease-in-out infinite}
.gm-bonk .bk-logo span{color:#ffd95a}
@keyframes bkbob{50%{transform:translateY(-8px) rotate(30deg)}}
.gm-bonk .bk-tag{margin:4px 0 12px;font-weight:800;font-size:14px;color:#b9c8f5}
.gm-bonk .bk-modes{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.gm-bonk .bk-mode{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 6px;border:2px solid #2d4284;border-radius:14px;background:#15234f;color:#fff;cursor:pointer;font-family:var(--sans);transition:transform .12s,border-color .12s,background .12s}
.gm-bonk .bk-mode:hover{transform:translateY(-2px);border-color:#6f93ff}
.gm-bonk .bk-mode.on{border-color:#ffd95a;background:#233a80;box-shadow:0 0 0 3px rgba(255,217,90,.25)}
.gm-bonk .bk-mode canvas{width:52px;height:34px;border-radius:6px}
.gm-bonk .bk-mode b{font-size:14px;font-weight:900}
.gm-bonk .bk-desc{margin:8px 0 2px;min-height:34px;font-weight:700;font-size:12.5px;color:#c7d3fb}
.gm-bonk .bk-opts{display:flex;flex-direction:column;gap:7px;margin-top:6px;align-items:center}
.gm-bonk .bk-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;width:100%}
.gm-bonk .bk-row>span{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:#8ea3e6;min-width:70px;text-align:right}
.gm-bonk .bk-seg{display:inline-flex;flex-wrap:wrap;justify-content:center;background:#0d1638;border-radius:999px;padding:3px}
.gm-bonk .bk-seg button{border:0;background:none;font:800 12.5px var(--sans);color:#9fb2ee;padding:6px 11px;border-radius:999px;cursor:pointer;min-height:32px}
.gm-bonk .bk-seg button.on{background:#ffd95a;color:#1b1b2e}
.gm-bonk .bk-maps{display:flex;gap:6px;overflow-x:auto;max-width:100%;padding:3px;scrollbar-width:thin}
.gm-bonk .bk-map{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;border:2px solid transparent;border-radius:10px;background:#0d1638;color:#c7d3fb;cursor:pointer;font:800 10px var(--sans)}
.gm-bonk .bk-map canvas{width:84px;height:56px;border-radius:6px;display:block}
.gm-bonk .bk-map.on{border-color:#ffd95a;color:#fff}
.gm-bonk .bk-sw{display:inline-flex;gap:5px}
.gm-bonk .bk-sw button{width:24px;height:24px;border-radius:50%;border:2px solid #14141c;cursor:pointer;padding:0}
.gm-bonk .bk-sw button.on{box-shadow:0 0 0 3px #ffd95a}
.gm-bonk .bk-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.gm-bonk .bk-b{border:0;border-radius:999px;min-height:44px;padding:0 24px;font:900 15px var(--sans);color:#fff;background:#3a69e8;cursor:pointer;box-shadow:0 4px 0 #1f3f9c;transition:transform .1s}
.gm-bonk .bk-b:hover{transform:translateY(-2px)}
.gm-bonk .bk-b:active{transform:translateY(2px);box-shadow:0 1px 0 #1f3f9c}
.gm-bonk .bk-b.g{background:#2fbf5b;box-shadow:0 4px 0 #17803a}
.gm-bonk .bk-b.y{background:#ffd95a;color:#1b1b2e;box-shadow:0 4px 0 #b99318}
.gm-bonk .bk-b.s{background:#44507c;box-shadow:0 4px 0 #262f52;min-height:38px;font-size:13px;padding:0 16px}
.gm-bonk .bk-pan h3{margin:2px 0 4px;font:900 clamp(26px,5vw,40px)/1.05 var(--sans);letter-spacing:-.02em}
.gm-bonk .bk-pan p{margin:0 0 10px;color:#c7d3fb;font-weight:700;font-size:14px}
.gm-bonk .bk-k{display:inline-block;margin-bottom:6px;padding:4px 11px;border-radius:999px;background:#233a80;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#ffd95a}
.gm-bonk .bk-sb{display:flex;flex-direction:column;gap:5px;max-width:320px;margin:8px auto 12px}
.gm-bonk .bk-sb div{display:flex;align-items:center;gap:9px;padding:6px 12px;border-radius:10px;background:#15234f;font-weight:800;font-size:14px}
.gm-bonk .bk-sb div.w{background:#3a3a14;box-shadow:inset 0 0 0 2px #ffd95a}
.gm-bonk .bk-sb i{width:14px;height:14px;border-radius:50%;border:2px solid #14141c;flex:none}
.gm-bonk .bk-sb b{margin-left:auto;font-size:17px}
.gm-bonk .bk-how{text-align:left;max-width:560px;margin:0 auto 6px;font-size:13px;line-height:1.5;font-weight:700;color:#d6defc}
.gm-bonk .bk-how kbd{display:inline-block;padding:1px 7px;border-radius:6px;background:#0d1638;border:1px solid #3d539a;font:800 12px var(--sans);color:#ffd95a}
.gm-bonk .bk-how li{margin:3px 0}
.gm-bonk .bk-mb{position:absolute;right:8px;top:8px;z-index:4;width:36px;height:36px;border-radius:50%;border:0;background:rgba(8,14,36,.55);color:#fff;display:grid;place-items:center;cursor:pointer}
.gm-bonk .bk-mb[hidden]{display:none}
.gm-bonk .bk-mb.arm{width:auto;padding:0 14px;border-radius:999px;background:#d8342c;font:900 13px var(--sans)}
.gm-bonk .bk-tc{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;justify-content:space-between;align-items:flex-end;padding:8px 10px;pointer-events:none}
.gm-bonk .bk-tc[hidden]{display:none}
.gm-bonk .bk-tc div{display:flex;gap:8px;align-items:flex-end}
.gm-bonk .bk-tc button{pointer-events:auto;width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,.5);background:rgba(20,34,90,.55);color:#fff;font:900 16px var(--sans);touch-action:none;display:grid;place-items:center;padding:0}
.gm-bonk .bk-tc button.on{background:rgba(255,217,90,.7);color:#1b1b2e}
.gm-bonk .bk-tc button[hidden]{display:none}
@media (max-width:700px) and (orientation:portrait){.gm-bonk .bk-wrap{width:100%;aspect-ratio:3/4;container-type:inline-size;max-height:calc(100dvh - var(--goff,250px));background:#0c1330}.gm-bonk .bk-wrap canvas{position:absolute;left:0;top:0}.gm-bonk .bk-tc{top:62.5cqw;align-items:center;padding:6px 12px calc(10px + env(safe-area-inset-bottom,0px))}.gm-bonk .bk-tc button{width:66px;height:66px;font-size:20px}.gm-bonk .bk-tc div{gap:10px}.gm-bonk .bk-tc div+div{max-width:152px;flex-wrap:wrap;justify-content:flex-end;flex-direction:row-reverse}.gm-bonk .bk-tc{align-items:flex-end}.gm-bonk .bk-mode canvas{display:none}.gm-bonk .bk-modes{grid-template-columns:repeat(4,1fr)}.gm-bonk .bk-mode{padding:10px 2px}.gm-bonk .bk-logo{font-size:38px}}
@media (max-width:640px){.gm-bonk .bk-row>span{min-width:0;width:100%;text-align:center}.gm-bonk .bk-ui{align-items:flex-start}}`;

const BK_ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="38" r="14" fill="currentColor" fill-opacity=".18"/><circle cx="46" cy="22" r="9"/><path d="M33 34l7-7M24 38h.01M8 54h48"/></svg>';

Ameplay.register({
  id: BK_ID,
  title: 'Bonk.io',
  category: 'Action',
  tint: '#f08a30',
  blurb: 'Physics ball arena: bonk your rivals off the map in Classic, Arrows, Grapple and Football.',
  help: '<kbd>←</kbd><kbd>→</kbd> roll · <kbd>↑</kbd> jump · <kbd>X</kbd> heavy · <kbd>Space</kbd>/click shoot, hook or kick · mouse aims · touch buttons · online 2 to 8',
  better: 'high',
  format: v => v + ' wins',
  width: 960,
  _t: { PH, MAPS, makeArena, MODES, mapsFor },
  icon: BK_ICON,
  css: BK_CSS,
  mount(root, api) {
    const coarse = matchMedia('(pointer: coarse)').matches;
    const saved = Object.assign({ mode: 0, map: -1, target: 3, bots: 3, skill: 1, deadly: 0, team: 2, col: 0, rw: 0, seen: 0 }, api.load() || {});
    const persist = () => api.save(saved);
    let myName = 'You';
    try { const p = JSON.parse(localStorage.getItem('gameplay:profile') || 'null'); if (p && (p.username || p.displayName)) myName = String(p.username || p.displayName).slice(0, 14); } catch (e) {}
    const wrap = document.createElement('div');
    wrap.className = 'bk-wrap';
    root.append(wrap);
    const cvo = api.canvas(CW, CH, wrap);
    const cv = cvo.canvas, ctx = cvo.ctx;
    const ui = document.createElement('div');
    ui.className = 'bk-ui';
    wrap.append(ui);
    const mb = document.createElement('button');
    mb.className = 'bk-mb'; mb.type = 'button'; mb.hidden = true; mb.setAttribute('aria-label', 'Menu');
    mb.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>';
    wrap.append(mb);
    const tc = document.createElement('div');
    tc.className = 'bk-tc'; tc.hidden = true;
    tc.innerHTML = '<div><button data-k="l">◀</button><button data-k="r">▶</button></div><div><button data-k="d" hidden>▼</button><button data-k="h">X</button><button data-k="a">●</button><button data-k="u">▲</button></div>';
    wrap.append(tc);

    const snd = (() => {
      let ac = null;
      const t = (f, d, ty, v, f2, dl) => {
        if (api.muted) return;
        try {
          ac = ac || new (window.AudioContext || window.webkitAudioContext)();
          if (ac.state === 'suspended') ac.resume();
          const n = ac.currentTime + (dl || 0), o = ac.createOscillator(), g = ac.createGain();
          o.type = ty; o.frequency.setValueAtTime(f, n);
          if (f2) o.frequency.exponentialRampToValueAtTime(f2, n + d);
          g.gain.setValueAtTime(.0001, n); g.gain.exponentialRampToValueAtTime(v, n + .008); g.gain.exponentialRampToValueAtTime(.0001, n + d);
          o.connect(g).connect(ac.destination); o.start(n); o.stop(n + d + .03);
        } catch (e) {}
      };
      return {
        t,
        bonk: v => t(150 + Math.min(v, 900) * .22, .1, 'triangle', Math.min(.14, .035 + v / 8000), 70),
        pop: () => { t(480, .28, 'sawtooth', .05, 70); t(900, .12, 'square', .03, 200); },
        jump: () => t(320, .09, 'sine', .035, 560),
        shoot: () => t(980, .13, 'square', .02, 260),
        hook: () => t(200, .12, 'square', .035, 60),
        kick: () => t(130, .15, 'triangle', .13, 55),
        beep: () => t(660, .12, 'sine', .07),
        go: () => t(1040, .3, 'sine', .08),
        win: () => [523, 659, 784, 1046].forEach((f, i) => t(f, .22, 'triangle', .07, 0, i * .09)),
        goal: () => { [392, 523, 659, 784].forEach((f, i) => t(f, .3, 'sawtooth', .04, 0, i * .08)); t(120, .5, 'triangle', .1, 50); },
        lose: () => t(330, .5, 'sine', .07, 120)
      };
    })();

    const fx = makeFx();
    const demoCfg = () => ({ mode: 0, map: -1, target: 999, seed: (Math.random() * 1e9) | 0, players: [0, 1, 2, 3].map(i => ({ name: BOT_NAMES[i], bot: true, skill: 1, col: PCOL[i + 1] })) });
    const G = { state: 'menu', A: null, demo: null, me: -1, pl: [], mode: 0, role: null, hooked: false, pids: [], buf: [], off: 0, offSet: false, isq: 0, lastSend: 0, lastSig: '', gv: null, lastCount: -1, seq: 0 };
    const UI = { me: -1, aim: { x: 365, y: 250 }, touch: coarse, cam: camFor(0, CW, CH), hint: 0, hintText: '' };
    const keys = new Set();
    const touchKeys = { l: 0, r: 0, u: 0, d: 0, h: 0, a: 0 };
    let mouseA = 0, touchAim = 0, menuOpts = null;

    const KEYMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', KeyX: 'h', ShiftLeft: 'h', ShiftRight: 'h', Space: 'a', KeyZ: 'a' };
    api.on(window, 'keydown', e => {
      const k = KEYMAP[e.code];
      if (!k || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (!ui.hidden) return;
      e.preventDefault();
      keys.add(e.code);
    });
    api.on(window, 'keyup', e => { keys.delete(e.code); });
    api.on(window, 'blur', () => keys.clear());

    function readInput() {
      const o = { l: 0, r: 0, u: 0, d: 0, h: 0, a: 0, ax: UI.aim.x, ay: UI.aim.y };
      for (const c of keys) { const k = KEYMAP[c]; if (k) o[k] = 1; }
      for (const k in touchKeys) if (touchKeys[k]) o[k] = 1;
      if (mouseA || touchAim) o.a = 1;
      return o;
    }

    function toWorld(e) {
      const p = cvo.toLocal(e), c = UI.cam;
      return { x: (p.x - c.ox) / c.sc, y: (p.y - c.oy) / c.sc };
    }
    api.on(cv, 'pointermove', e => { if (e.pointerType === 'mouse' || touchAim) UI.aim = toWorld(e); });
    api.on(cv, 'pointerdown', e => {
      UI.aim = toWorld(e);
      if (e.pointerType === 'mouse') { if (e.button === 0) mouseA = 1; }
      else if (G.mode === 1 || G.mode === 2) { touchAim = e.pointerId; touchKeys.a = 0; }
      if (e.pointerType !== 'mouse') UI.touch = true;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    });
    const pu = e => { if (e.pointerType === 'mouse') mouseA = 0; else if (touchAim === e.pointerId) touchAim = 0; };
    api.on(cv, 'pointerup', pu);
    api.on(cv, 'pointercancel', pu);
    api.on(cv, 'contextmenu', e => e.preventDefault());
    api.on(window, 'pointerup', e => { if (e.pointerType === 'mouse') mouseA = 0; });

    const tcDown = new Map();
    api.on(tc, 'pointerdown', e => {
      const b = e.target.closest('button[data-k]');
      if (!b) return;
      e.preventDefault(); UI.touch = true;
      touchKeys[b.dataset.k] = 1; b.classList.add('on'); tcDown.set(e.pointerId, b);
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
    });
    const tcUp = e => { const b = tcDown.get(e.pointerId); if (!b) return; touchKeys[b.dataset.k] = 0; b.classList.remove('on'); tcDown.delete(e.pointerId); };
    api.on(tc, 'pointerup', tcUp); api.on(tc, 'pointercancel', tcUp);

    function setTouchLayout(mode) {
      tc.hidden = !(coarse || UI.touch) || ui.hidden === false;
      const bd = tc.querySelector('[data-k="d"]'), ba = tc.querySelector('[data-k="a"]');
      bd.hidden = mode !== 2; ba.hidden = mode === 0;
      ba.textContent = mode === 1 ? '➶' : mode === 2 ? '⚓' : '⚽';
    }

    function colOf(i) { return PCOL[i % PCOL.length]; }

    function panel(html, onClick) {
      ui.hidden = false; ui.innerHTML = html;
      ui.onclick = e => { const b = e.target.closest('[data-a]'); if (b && onClick) { snd.t(520, .05, 'sine', .05); onClick(b.dataset.a, b); } };
      tc.hidden = true;
    }
    function hidePanel() { ui.hidden = true; ui.innerHTML = ''; ui.onclick = null; setTouchLayout(G.mode); tc.hidden = !(coarse || UI.touch); }

    const seg = (k, opts, cur) => `<div class="bk-seg" data-k="${k}">${opts.map(([v, t]) => `<button data-a="opt" data-v="${v}" class="${String(cur) === String(v) ? 'on' : ''}">${t}</button>`).join('')}</div>`;

    function showMenu() {
      G.state = 'menu'; mb.hidden = true; tc.hidden = true; G.A = null; G.gv = null; G.role = null; G.me = -1; UI.me = -1;
      if (api.net.role) api.net.close();
      try { sessionStorage.removeItem('gameplay:bksave'); } catch (e) {}
      if (!G.demo) { G.demo = makeArena(demoCfg()); G.demo.start(); }
      renderMenu();
    }

    function renderMenu() {
      const m = saved.mode, fb = m === 3;
      const maps = mapsFor(m);
      if (saved.map >= 0 && !maps.includes(saved.map)) saved.map = -1;
      const botOpts = fb ? seg('team', [[1, '1 v 1'], [2, '2 v 2'], [3, '3 v 3'], [4, '4 v 4']], saved.team) : seg('bots', [1, 2, 3, 4, 5, 6, 7].map(n => [n, String(n)]), saved.bots);
      const tgt = fb ? seg('target', [[3, '3 goals'], [5, '5 goals'], [7, '7 goals'], [10, '10 goals']], saved.target) : seg('target', [[1, '1 win'], [3, '3 wins'], [5, '5 wins'], [7, '7 wins'], [10, '10 wins']], saved.target);
      ui.hidden = false;
      ui.innerHTML = `<div class="bk-card"><div class="bk-logo"><i></i>BONK<span>.IO</span></div><div class="bk-tag">Roll, bonk and shove everyone off the map.</div>
<div class="bk-modes">${MODES.map((md, i) => `<button class="bk-mode ${i === m ? 'on' : ''}" data-a="mode" data-v="${i}"><canvas width="104" height="68" data-pv="${mapsFor(i)[0]}"></canvas><b>${md.name}</b></button>`).join('')}</div>
<div class="bk-desc">${MODES[m].desc}</div>
<div class="bk-opts"><div class="bk-row"><span>Map</span><div class="bk-maps"><button class="bk-map ${saved.map < 0 ? 'on' : ''}" data-a="map" data-v="-1"><canvas width="168" height="112" data-rnd="1"></canvas>Random</button>${maps.map(i => `<button class="bk-map ${saved.map === i ? 'on' : ''}" data-a="map" data-v="${i}"><canvas width="168" height="112" data-pv="${i}"></canvas>${MAPS[i].name}</button>`).join('')}</div></div>
<div class="bk-row"><span>First to</span>${tgt}</div>
<div class="bk-row"><span>${fb ? 'Teams' : 'Opponents'}</span>${botOpts}</div>
<div class="bk-row"><span>Bots</span>${seg('skill', [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']], saved.skill)}</div>
${m === 1 ? `<div class="bk-row"><span>Arrows</span>${seg('deadly', [[0, 'Knockback'], [1, 'Deadly']], saved.deadly)}</div>` : ''}
<div class="bk-row"><span>Your ball</span><div class="bk-sw">${PCOL.map((c, i) => `<button data-a="col" data-v="${i}" class="${saved.col === i ? 'on' : ''}" style="background:${c}" aria-label="Color ${i + 1}"></button>`).join('')}</div></div></div>
<div class="bk-btns"><button class="bk-b g" data-a="play">Play vs bots</button><button class="bk-b" data-a="online">Play online</button><button class="bk-b s" data-a="how">How to play</button></div>${saved.rw ? `<p class="bk-tag" style="margin:8px 0 0">Rounds won: ${saved.rw}</p>` : ''}</div>`;
      ui.onclick = e => { const b = e.target.closest('[data-a]'); if (b) menuClick(b); };
      ui.querySelectorAll('canvas[data-pv]').forEach(c => drawPreview(c, +c.dataset.pv));
      ui.querySelectorAll('canvas[data-rnd]').forEach(c => { const x = c.getContext('2d'); x.fillStyle = '#0d1638'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#ffd95a'; x.font = '900 70px system-ui'; x.textAlign = 'center'; x.fillText('?', c.width / 2, c.height / 2 + 24); });
      const sel = ui.querySelector('.bk-map.on'); if (sel) { try { sel.parentNode.scrollLeft = Math.max(0, sel.offsetLeft - 120); } catch (e) {} }
    }

    function menuClick(b) {
      const a = b.dataset.a, v = b.dataset.v;
      snd.t(520, .05, 'sine', .05);
      if (a === 'mode') { saved.mode = +v; saved.map = -1; if (saved.mode === 3 && ![3, 5, 7, 10].includes(saved.target)) saved.target = 3; persist(); renderMenu(); }
      else if (a === 'map') { saved.map = +v; persist(); renderMenu(); }
      else if (a === 'opt') { const k = b.parentNode.dataset.k; saved[k] = +v; persist(); renderMenu(); }
      else if (a === 'col') { saved.col = +v; persist(); renderMenu(); }
      else if (a === 'play') startSolo();
      else if (a === 'online') goOnline();
      else if (a === 'how') showHow();
    }

    function showHow() {
      panel(`<div class="bk-card bk-pan"><span class="bk-k">How to play</span><h3>Bonk.io</h3><ul class="bk-how"><li><kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> roll left and right, <kbd>↑</kbd> / <kbd>W</kbd> jump when touching something, <kbd>↓</kbd> / <kbd>S</kbd> dive.</li><li><kbd>X</kbd> or <kbd>Shift</kbd> (hold) turns you heavy: more mass, harder bonks, slower rolling.</li><li><b>Classic</b>: ball collisions only. Fall off the map or touch a red death surface and you are out. Last ball standing wins the round.</li><li><b>Arrows</b>: aim with the mouse, <kbd>Space</kbd> or click shoots. Arrows knock rivals away (or kill, in Deadly mode).</li><li><b>Grapple</b>: hold click or <kbd>Space</kbd> to hook what you aim at, <kbd>↓</kbd> reels the rope in, release to let go. You can hook rivals too.</li><li><b>Football</b>: push or kick (<kbd>Space</kbd>) the big ball into the other goal.</li><li>Green surfaces are bouncy, pale blue ones are icy, red ones are deadly and dashed ones are only decoration.</li><li>Touch: on-screen buttons, tap the arena to aim and shoot.</li></ul><div class="bk-btns"><button class="bk-b" data-a="back">Back</button></div></div>`, () => renderMenu());
    }

    function soloCfg() {
      const fb = saved.mode === 3;
      const pl = [];
      const used = new Set([saved.col]);
      const free = () => { for (let i = 0; i < PCOL.length; i++) if (!used.has(i)) { used.add(i); return i; } return 0; };
      if (fb) {
        const k = saved.team;
        pl.push({ name: myName, col: PCOL[saved.col], team: 0 });
        let bn = 0;
        for (let i = 1; i < k * 2; i++) { const team = i % 2; pl.push({ name: BOT_NAMES[bn++ % BOT_NAMES.length], bot: true, skill: saved.skill, col: PCOL[free()], team }); }
      } else {
        pl.push({ name: myName, col: PCOL[saved.col] });
        for (let i = 0; i < saved.bots; i++) pl.push({ name: BOT_NAMES[i % BOT_NAMES.length], bot: true, skill: saved.skill, col: PCOL[free()] });
      }
      return { mode: saved.mode, map: saved.map, target: saved.target, deadly: !!saved.deadly, seed: (Math.random() * 1e9) | 0, players: pl, first: 1 };
    }

    function begin(A, me, state) {
      G.A = A; G.pl = A.players; G.me = me; UI.me = me; G.state = state; G.mode = A.mode; G.lastCount = -1;
      mb.hidden = false; fx.ps.length = 0; fx.rings.length = 0;
      UI.hint = 7; UI.hintText = hintFor(A.mode);
      hidePanel(); setTouchLayout(A.mode);
      api.score(saved.rw);
    }
    function hintFor(m) {
      if (UI.touch) return ['Buttons to roll and jump · hold X to get heavy', 'Tap the arena to aim and shoot arrows', 'Tap to hook a target · ▼ reels in', 'Push the ball into the other goal'][m];
      return ['Arrows roll · Up jump · hold X to get heavy', 'Aim with the mouse · click or Space to shoot', 'Hold click or Space to hook · Down reels in', 'Push the ball into the other goal · Space kicks'][m];
    }

    function startSolo() {
      const A = makeArena(soloCfg());
      A.start();
      begin(A, 0, 'solo');
    }

    function lerp(a, b, k) { return a + (b - a) * k; }

    function viewOf(A, al) {
      const w = A.world;
      const v = { map: A.map, wt: w ? w.t : 0, mode: A.mode, phase: A.phase, pt: Math.max(0, A.pt), play: A.play, round: A.round, target: A.cfg.target, scores: A.scores, shrink: A.shrink, win: A.winner, pl: [], ar: [], bl: null, dy: null };
      for (const p of A.players) {
        const b = p.body;
        const o = { alive: p.alive, col: p.col, name: p.bot ? p.name : p.name, team: p.team, heavy: p.heavy, kick: p.kick, me: p.i === G.me, hook: null, x: 0, y: 0, a: 0 };
        if (b && p.alive) { o.x = lerp(p.ox == null ? b.x : p.ox, b.x, al); o.y = lerp(p.oy == null ? b.y : p.oy, b.y, al); o.a = lerp(p.oa == null ? b.a : p.oa, b.a, al); if (p.hook && p.hook.j.px != null) o.hook = [p.hook.j.px, p.hook.j.py]; }
        v.pl.push(o);
      }
      if (w) {
        for (const a of A.arrows) v.ar.push([lerp(a.ox == null ? a.x : a.ox, a.x, al), lerp(a.oy == null ? a.y : a.oy, a.y, al), a.a]);
        if (A.ball) v.bl = [lerp(A.ball.ox == null ? A.ball.x : A.ball.ox, A.ball.x, al), lerp(A.ball.oy == null ? A.ball.y : A.ball.oy, A.ball.y, al), A.ball.a];
        v.dy = A.dyn.map(b => [lerp(b.ox == null ? b.x : b.ox, b.x, al), lerp(b.oy == null ? b.y : b.oy, b.y, al), b.a]);
      }
      return v;
    }

    function handleEv(e, v) {
      switch (e.k) {
        case 'hit':
          fx.burst(e.x, e.y, '#fff', Math.min(9, 2 + e.v / 120), 120 + e.v * .15, .35, 2.2);
          if (e.v > 520) fx.shake = Math.min(7, fx.shake + e.v / 260);
          snd.bonk(e.v);
          break;
        case 'die': fx.burst(e.x, e.y, e.col, 30, 300, .9, 4.4); fx.ring(e.x, e.y, e.col, 52, .6); fx.shake = 8; snd.pop(); break;
        case 'jump': fx.burst(e.x, e.y, 'rgba(255,255,255,.8)', 4, 70, .3, 2); snd.jump(); break;
        case 'shoot': snd.shoot(); break;
        case 'hook': fx.ring(e.x, e.y, e.ok ? '#fff' : 'rgba(255,255,255,.4)', 14, .3); snd.hook(); break;
        case 'kick': fx.burst(e.x, e.y, '#fff', 10, 220, .4, 3); fx.ring(e.x, e.y, '#fff', 36, .3); snd.kick(); break;
        case 'goal': for (let i = 0; i < 70; i++) fx.burst(e.x, e.y, ['#ffd95a', TCOL[e.team], '#fff'][i % 3], 1, 420, 1.3, 4); fx.shake = 9; snd.goal(); break;
        case 'respawn': fx.ring(e.x, e.y, e.col, 40, .5); break;
        case 'go': snd.go(); break;
        case 'rend':
          if (G.me >= 0 && e.win >= 0) {
            const mine = G.mode === 3 ? (e.win === (G.pl[G.me] && G.pl[G.me].team)) : e.win === G.me;
            if (mine && G.mode !== 3) { saved.rw++; persist(); api.score(saved.rw); api.submit(saved.rw); }
            if (mine) snd.win(); else if (G.mode !== 3) snd.lose();
          }
          break;
        case 'round': fx.ps.length = 0; fx.rings.length = 0; break;
      }
    }

    function matchOver(mw, scores) {
      G.state = G.state === 'guest' ? 'guest' : G.state;
      mb.hidden = true;
      const A = G.A, gv = G.gv;
      const pls = A ? A.players : G.pl;
      const fb = G.mode === 3;
      const name = fb ? (mw === 0 ? 'Red' : 'Blue') + ' team' : pls[mw].name;
      const meWon = fb ? (G.me >= 0 && pls[G.me].team === mw) : mw === G.me;
      let rows = '';
      if (fb) rows = [0, 1].map(t => `<div class="${t === mw ? 'w' : ''}"><i style="background:${TCOL[t]}"></i>${t ? 'Blue' : 'Red'}<b>${scores[t]}</b></div>`).join('');
      else rows = pls.map((p, i) => ({ p, s: scores[i] })).sort((a, b) => b.s - a.s).map(r => `<div class="${pls[mw] === r.p ? 'w' : ''}"><i style="background:${r.p.col}"></i>${r.p.name}<b>${r.s}</b></div>`).join('');
      const online = G.state === 'host' || G.state === 'guest';
      const btns = G.state === 'guest' ? '<p>Waiting for the host…</p><div class="bk-btns"><button class="bk-b s" data-a="leave">Leave</button></div>'
        : online ? '<div class="bk-btns"><button class="bk-b g" data-a="lobby">Rematch</button><button class="bk-b s" data-a="leave">Leave</button></div>'
        : '<div class="bk-btns"><button class="bk-b g" data-a="again">Play again</button><button class="bk-b s" data-a="menu">Menu</button></div>';
      if (meWon) snd.win();
      panel(`<div class="bk-card bk-pan"><span class="bk-k">${meWon ? 'Victory' : 'Match over'}</span><h3>${meWon && !fb ? 'You win!' : name + ' wins!'}</h3><div class="bk-sb">${rows}</div>${btns}</div>`, a => {
        if (a === 'again') { const c = soloCfg(); const A2 = makeArena(c); A2.start(); begin(A2, 0, 'solo'); }
        else if (a === 'menu' || a === 'leave') showMenu();
        else if (a === 'lobby') goOnline();
      });
    }

    const MBI = mb.innerHTML;
    api.on(mb, 'click', () => {
      if ((G.state === 'host' || G.state === 'guest') && !mb.classList.contains('arm')) {
        mb.classList.add('arm'); mb.textContent = 'Leave?';
        api.timeout(() => { mb.classList.remove('arm'); mb.innerHTML = MBI; }, 2500);
        return;
      }
      mb.classList.remove('arm'); mb.innerHTML = MBI;
      showMenu();
    });

    function pushHostSave(sc, rd) {
      const A = G.A;
      if (G.state !== 'host' || !A) return;
      try {
        sessionStorage.setItem('gameplay:bksave', JSON.stringify({ code: api.net.code, at: Date.now(), mode: A.mode, map: A.cfg.map, target: A.cfg.target, deadly: !!A.cfg.deadly, size: G.size, bots: G.botsOn, sc, rd, names: A.players.map(p => p.bot ? null : p.name), teams: A.players.map(p => p.team) }));
      } catch (e) {}
    }

    function hookNet() {
      G.hooked = true;
      api.net.on('data', (d, from) => {
        if (!d || !G.role) return;
        if (G.role === 'host') {
          if (d.t === 'i') {
            const i = G.pids.indexOf(from);
            if (i < 1 || !G.A) return;
            if (!d.r) { if (!(d.s > (G.is[from] || 0))) return; G.is[from] = d.s; }
            const p = G.A.players[i], k = d.k | 0;
            if (p && !p.bot) p.inp = { l: k & 1, r: (k >> 1) & 1, u: (k >> 2) & 1, d: (k >> 3) & 1, h: (k >> 4) & 1, a: (k >> 5) & 1, ax: +d.ax || 0, ay: +d.ay || 0 };
          }
          return;
        }
        if (d.t === 'cfg') guestCfg(d);
        else if (d.t === 'ev') guestEv(d);
        else if (d.t === 's') {
          d.rt = performance.now();
          const o = d.rt - d.T;
          G.off = G.offSet ? Math.min(o, G.off + 1) : o; G.offSet = true;
          const B = G.buf;
          let j = B.length;
          while (j > 0 && B[j - 1].T > d.T) j--;
          if (j > 0 && B[j - 1].T === d.T) return;
          B.splice(j, 0, d);
          if (B.length > 40) B.splice(0, B.length - 40);
        }
      });
      api.net.on('leave', p => {
        if (G.role !== 'host' || !p || !G.A) return;
        const i = G.pids.indexOf(p.id);
        if (i < 1) return;
        const pl = G.A.players[i];
        G.pids[i] = null;
        if (pl && !pl.bot) { pl.bot = true; pl.skill = saved.skill; pl.name = pl.name.slice(0, 11) + ' (bot)'; pl.inp = { l: 0, r: 0, u: 0, d: 0, h: 0, a: 0, ax: 0, ay: 0 }; api.toast(p.name + ' left. A bot takes over.'); sendCfgAll(); }
      });
      api.net.on('rejoin', p => {
        if (G.role !== 'host' || !p || !G.A) return;
        const i = G.pids.indexOf(p.id);
        if (i < 1) return;
        sendCfg(p.id, i);
        api.net.sendTo(p.id, stateMsg());
      });
      api.net.on('lobby', () => { if (G.role === 'guest') goOnline(); });
      api.net.on('close', why => {
        if (!G.role) return;
        G.role = null; G.state = 'left'; mb.hidden = true; G.gv = null;
        panel(`<div class="bk-card bk-pan"><span class="bk-k">Online</span><h3>${why === 'kicked' ? 'You were removed' : why === 'host-left' ? 'The host left' : 'Connection lost'}</h3><p>${why === 'host-left' ? 'The host ended the game.' : why === 'kicked' ? 'The host removed you from the game.' : 'The connection to the host was lost.'}</p><div class="bk-btns"><button class="bk-b" data-a="lobby">Online lobby</button><button class="bk-b s" data-a="menu">Menu</button></div></div>`, a => { if (a === 'lobby') goOnline(); else showMenu(); });
        snd.lose();
      });
    }

    function cfgMsg(i) {
      const A = G.A;
      return { t: 'cfg', me: i, mode: A.mode, map: A.cfg.map, target: A.cfg.target, deadly: !!A.cfg.deadly, pl: A.players.map(p => ({ n: p.name, c: p.col, t: p.team, b: p.bot ? 1 : 0 })) };
    }
    function stateMsg() {
      const A = G.A;
      return { t: 'ev', e: [], ph: A.phase, pt: A.pt, sc: A.scores.slice(), rd: A.round, map: A.map, win: A.winner, mw: A.matchWinner, T: A.clock, play: A.play };
    }
    function sendCfg(id, i) { api.net.sendTo(id, cfgMsg(i)); }
    function sendCfgAll() { G.pids.forEach((id, i) => { if (i && id) sendCfg(id, i); }); }

    function guestCfg(d) {
      G.state = 'guest'; G.mode = d.mode; G.me = d.me; UI.me = d.me; G.buf = []; G.offSet = false; G.pl = d.pl.map(p => ({ name: p.n, col: p.c, team: p.t, bot: !!p.b }));
      G.gv = { map: d.map >= 0 ? d.map : mapsFor(d.mode)[0], mode: d.mode, target: d.target, deadly: d.deadly, phase: 'count', pt: 2, play: 0, round: 0, scores: G.mode === 3 ? [0, 0] : d.pl.map(() => 0), win: -1, shrink: 0, mw: -1 };
      mb.hidden = false; fx.ps.length = 0; fx.rings.length = 0;
      UI.hint = 7; UI.hintText = hintFor(d.mode);
      hidePanel(); setTouchLayout(d.mode);
    }
    const PHN = { count: 0, play: 1, rend: 2, mend: 3 }, PHS = ['count', 'play', 'rend', 'mend'];

    function guestEv(d) {
      const g = G.gv;
      if (!g) return;
      if (d.ph != null) { g.at = performance.now(); g.phase = d.ph; g.pt = d.pt; g.scores = d.sc; g.round = d.rd; g.win = d.win; g.mw = d.mw; if (d.map != null && d.map !== g.map) { g.map = d.map; } if (d.play != null) g.play = d.play; }
      for (const e of d.e) {
        if (e.k === 'round') { g.map = e.map; G.buf = []; G.offSet = false; }
        handleEv(e, g);
        if (e.k === 'mend') { matchOver(e.mw, g.scores); }
      }
    }

    function guestView(now) {
      const g = G.gv, B = G.buf;
      if (!g) return null;
      const el = (now - (g.at || now)) / 1000, v = { map: g.map, wt: 0, mode: g.mode, phase: g.phase, pt: Math.max(0, g.pt - (g.phase === 'play' ? 0 : el)), play: g.play + (g.phase === 'play' ? el : 0), round: g.round, target: g.target, scores: g.scores, shrink: 0, win: g.win, pl: [], ar: [], bl: null, dy: null };
      const n = G.pl.length;
      const mk = i => ({ alive: false, col: G.pl[i].col, name: G.pl[i].name, team: G.pl[i].team, heavy: false, kick: 0, me: i === G.me, hook: null, x: 0, y: 0, a: 0 });
      for (let i = 0; i < n; i++) v.pl.push(mk(i));
      if (!B.length) return v;
      const r = now - G.off - 95;
      while (B.length > 2 && B[1].T <= r) B.shift();
      const A = B[0], C = B.length > 1 ? B[1] : A;
      const al = C === A ? 0 : Math.max(0, Math.min(1, (r - A.T) / (C.T - A.T)));
      const ang = (a, b) => { let d = b - a; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; return a + d * al; };
      v.wt = lerp(A.wt, C.wt, al); v.shrink = al > .5 ? C.sh : A.sh;
      for (let i = 0; i < n; i++) {
        const a = A.p[i], c = C.p[i] || a, o = v.pl[i];
        if (!a) continue;
        const f = al > .5 ? c[3] : a[3];
        o.alive = !!(f & 1); o.heavy = !!(f & 2); o.kick = (f & 8) ? .1 : 0;
        o.x = lerp(a[0], c[0], al); o.y = lerp(a[1], c[1], al); o.a = ang(a[2], c[2]);
        if (f & 4) o.hook = [c[4], c[5]];
      }
      const pm = new Map(A.ar.map(q => [q[0], q]));
      for (const q of C.ar) { const p0 = pm.get(q[0]) || q; v.ar.push([lerp(p0[1], q[1], al), lerp(p0[2], q[2], al), q[3]]); }
      if (C.bl) { const a = A.bl || C.bl; v.bl = [lerp(a[0], C.bl[0], al), lerp(a[1], C.bl[1], al), ang(a[2], C.bl[2])]; }
      v.dy = C.dy.map((c, i) => { const a = A.dy[i] || c; return [lerp(a[0], c[0], al), lerp(a[1], c[1], al), ang(a[2], c[2])]; });
      return v;
    }

    function snapOf(A) {
      const R = x => Math.round(x * 10) / 10, Rr = x => Math.round(x * 100) / 100;
      const M = MAPS[A.map];
      return {
        t: 's', T: Math.round(A.clock), wt: Rr(A.world.t), sh: Math.round(A.shrink),
        p: A.players.map(p => {
          const b = p.body;
          if (!p.alive || !b) return [0, 0, 0, 0, 0, 0];
          const f = 1 | (p.heavy ? 2 : 0) | (p.hook ? 4 : 0) | (p.kick > 0 ? 8 : 0);
          return p.hook ? [R(b.x), R(b.y), Rr(b.a), f, R(p.hook.j.px), R(p.hook.j.py)] : [R(b.x), R(b.y), Rr(b.a), f, 0, 0];
        }),
        ar: A.arrows.map(a => [a.id, R(a.x), R(a.y), Rr(a.a)]),
        bl: A.ball ? [R(A.ball.x), R(A.ball.y), Rr(A.ball.a)] : 0,
        dy: A.dyn.map(b => [R(b.x), R(b.y), Rr(b.a)])
      };
    }

    function hostLoopNet(evs) {
      const A = G.A;
      if (evs.length) {
        const out = evs.filter(e => e.k !== 'hit' || e.v > 260).slice(0, 24);
        api.net.send({ t: 'ev', e: out, ph: A.phase, pt: A.pt, sc: A.scores.slice(), rd: A.round, map: A.map, win: A.winner, mw: A.matchWinner, play: A.play });
      }
      if (A.world && A.ticks % 2 === 0) api.net.send(snapOf(A), true);
    }

    function guestInputSend(now) {
      const o = readInput();
      const k = o.l | (o.r << 1) | (o.u << 2) | (o.d << 3) | (o.h << 4) | (o.a << 5);
      const ax = Math.round(o.ax), ay = Math.round(o.ay);
      const hard = String(k);
      const sig = k + ',' + ax + ',' + ay;
      if (sig !== G.lastSig || now - G.lastSend > 120) {
        const ch = hard !== G.lastHard;
        G.lastSig = sig; G.lastHard = hard; G.lastSend = now;
        api.net.send({ t: 'i', k, ax, ay, s: ++G.isq, r: ch ? 1 : 0 }, !ch);
      }
    }

    async function goOnline() {
      if (!G.hooked) hookNet();
      G.state = 'lobby'; G.role = null; ui.hidden = true; mb.hidden = true; tc.hidden = true; G.A = null; G.gv = null;
      const r = await api.net.room({ title: 'Bonk.io', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 4, min: 2, max: 8, bots: true });
      if (!api.alive) return;
      if (!r) { showMenu(); return; }
      G.role = r.role; G.is = {};
      if (r.role === 'host') hostPrep(r);
      else panel('<div class="bk-card bk-pan"><span class="bk-k">Online</span><h3>Connected</h3><p>Waiting for the host to start…</p><div class="bk-btns"><button class="bk-b s" data-a="leave">Leave</button></div></div>', () => showMenu());
    }

    function onlinePlayers(r) {
      const fb = saved.mode === 3;
      const humans = r.players.slice(0, 8);
      const size = Math.max(humans.length, +r.size || humans.length);
      const nb = r.bots ? size - humans.length : 0;
      const pl = humans.map((h, i) => ({ name: h.name, col: PCOL[i], team: fb ? i % 2 : undefined }));
      for (let i = 0; i < nb; i++) { const k = humans.length + i; pl.push({ name: BOT_NAMES[i % BOT_NAMES.length], bot: true, skill: saved.skill, col: PCOL[k % PCOL.length], team: fb ? k % 2 : undefined }); }
      return { pl, pids: humans.map(h => h.id), size, botsOn: !!r.bots };
    }

    function hostPrep(r) {
      G.lastRoom = r;
      let sv = null;
      try {
        const x = JSON.parse(sessionStorage.getItem('gameplay:bksave') || 'null');
        if (x && x.code === api.net.code && Date.now() - x.at < 432e5) sv = x;
      } catch (e) {}
      const keep = saved.mode;
      if (sv) saved.mode = sv.mode;
      const op = onlinePlayers(r);
      G.size = op.size; G.botsOn = op.botsOn;
      if (sv && (sv.names.length !== op.pl.length || sv.names.filter(Boolean).length !== op.pl.filter(p => !p.bot).length)) { sv = null; saved.mode = keep; }
      if (!sv) return hostBegin(op, null);
      panel(`<div class="bk-card bk-pan"><span class="bk-k">Online</span><h3>Match in progress</h3><p>Saved match: ${MODES[sv.mode].name}, round ${sv.rd + 1}, score ${sv.sc.join(' - ')}.</p><div class="bk-btns"><button class="bk-b g" data-a="resume">Resume match</button><button class="bk-b y" data-a="new">New match</button><button class="bk-b s" data-a="leave">Leave</button></div></div>`, a => {
        if (a === 'resume') hostBegin(op, sv);
        else if (a === 'new') { saved.mode = keep; hostBegin(onlinePlayers(r), null); }
        else showMenu();
      });
    }

    function hostBegin(op, sv) {
      const cfg = { mode: saved.mode, map: sv ? sv.map : saved.map, target: sv ? sv.target : saved.target, deadly: sv ? sv.deadly : !!saved.deadly, seed: (Math.random() * 1e9) | 0, players: op.pl, first: 1 };
      let order = op.pl;
      G.pids = op.pids.slice();
      if (sv) {
        const hum = op.pl.filter(p => !p.bot), bots = op.pl.filter(p => p.bot);
        const seat = sv.names.map(() => null);
        seat[0] = hum.shift();
        sv.names.forEach((n, i) => { if (i && n) { const k = hum.findIndex(p => p.name === n); if (k >= 0) seat[i] = hum.splice(k, 1)[0]; } });
        sv.names.forEach((n, i) => { if (!seat[i]) seat[i] = n ? hum.shift() : bots.shift(); });
        order = seat;
        G.pids = order.map(p => { const k = op.pl.indexOf(p); return k >= 0 && k < op.pids.length ? op.pids[k] : null; });
        order.forEach((p, i) => { p.col = PCOL[i % PCOL.length]; if (sv.teams && cfg.mode === 3) p.team = sv.teams[i]; });
        cfg.players = order;
      }
      const A = makeArena(cfg);
      if (sv) { A.start(sv.sc, sv.rd); } else A.start();
      G.A = A;
      G.pl = A.players;
      begin(A, 0, 'host');
      G.role = 'host';
      for (let i = 1; i < A.players.length; i++) if (G.pids[i]) sendCfg(G.pids[i], i);
      pushHostSave(A.scores.slice(), A.round - 1);
    }

    function onMend(A, scores, mw) {
      try { sessionStorage.removeItem('gameplay:bksave'); } catch (e) {}
      matchOver(mw, scores);
    }

    let hsT = 0;
    api.loop((dt, now) => {
      fx.update(dt);
      if ((hsT -= dt) < 0) { hsT = .5; UI.hs = Math.max(1, Math.min(2.2, 700 / (cv.clientWidth || 960))); }
      if (UI.hint > 0) UI.hint -= dt * .6;
      if (G.state === 'solo' || G.state === 'host') {
        const A = G.A;
        if (!A) return;
        const me = A.players[G.me];
        if (me && !me.bot) { const o = readInput(); if (!me.alive) { o.l = o.r = o.u = o.d = o.h = o.a = 0; } me.inp = o; }
        const al = A.advance(dt);
        const evs = A.drain();
        const v0 = viewOf(A, al);
        for (const e of evs) { handleEv(e, v0); if (e.k === 'rend') { pushHostSave(A.scores.slice(), A.round); } if (e.k === 'mend') onMend(A, A.scores, e.mw); }
        if (G.state === 'host') hostLoopNet(evs);
        const v = viewOf(A, al);
        if (A.phase === 'count') { const c = Math.ceil(A.pt); if (c !== G.lastCount && c <= 3 && c > 0) { snd.beep(); } G.lastCount = c; }
        drawScene(ctx, v, fx, UI);
      } else if (G.state === 'guest') {
        guestInputSend(now);
        const v = guestView(now);
        if (v) {
          if (v.phase === 'count') { const c = Math.ceil(v.pt); if (c !== G.lastCount && c <= 3 && c > 0) snd.beep(); G.lastCount = c; }
          drawScene(ctx, v, fx, UI);
        }
      } else if (G.demo) {
        const A = G.demo;
        const al = A.advance(dt);
        A.drain();
        if (A.phase === 'mend') { A.start(); }
        drawScene(ctx, viewOf(A, al), fx, UI);
      } else {
        ctx.fillStyle = '#101830'; ctx.fillRect(0, 0, CW, CH);
      }
    });

    G.demo = makeArena(demoCfg()); G.demo.start();
    if (api.net.invite) { G.state = 'menu'; goOnline(); }
    else showMenu();
    return { destroy() { try { snd.t(1, .01, 'sine', .0001); } catch (e) {} } };
  }
});

Ameplay.covers[BK_ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bkc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4fb8"/><stop offset="1" stop-color="#0f1a45"/></linearGradient><radialGradient id="bkc-b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#ffd95a"/><stop offset=".75" stop-color="#f08a30"/><stop offset="1" stop-color="#a04a10"/></radialGradient></defs><rect width="400" height="300" fill="url(#bkc-g)"/><path d="M0 232h160l30 10h60l30-10h120v68H0z" fill="#1c2a5c" stroke="#0a1030" stroke-width="5"/><rect x="40" y="206" width="130" height="26" rx="4" fill="#4b5ca8" stroke="#0a1030" stroke-width="5"/><rect x="236" y="168" width="124" height="22" rx="4" fill="#3fbf6a" stroke="#0a1030" stroke-width="5"/><g stroke="#0a1030" stroke-width="5"><circle cx="118" cy="176" r="30" fill="url(#bkc-b)"/><circle cx="278" cy="136" r="30" fill="#3f8fe0"/><circle cx="196" cy="96" r="30" fill="#e8524a"/></g><g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M222 110l22 20M170 80l-20-14M144 160l-26-26" fill="none"/></g><circle cx="108" cy="168" r="6" fill="#0a1030"/><circle cx="270" cy="128" r="6" fill="#0a1030"/><circle cx="188" cy="88" r="6" fill="#0a1030"/><text x="200" y="40" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="900" font-style="italic" fill="#fff" stroke="#0a1030" stroke-width="6" paint-order="stroke">BONK</text></svg>`;

}
{
const ID = 'starve';
const WORLD = 4000, TC = 5, TN = WORLD / TC, DAY = 240, CELL = 200;
const TF = 0, TW = 1, TS = 2, TWA = 3, TDP = 4;
const hash2 = (x, y, s) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1013, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = t => t * t * (3 - 2 * t);
const vnoise = (x, y, s) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = smooth(x - xi), fy = smooth(y - yi);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};
const fbm = (x, y, s) => vnoise(x, y, s) * .55 + vnoise(x * 2.03, y * 2.03, s + 1) * .3 + vnoise(x * 4.1, y * 4.1, s + 2) * .15;
const mulberry = a => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; else if (d < -Math.PI) d += Math.PI * 2; return d; };
const lerpAng = (a, b, t) => a + angDiff(a, b) * t;

class Grid {
  constructor() { this.m = new Map(); }
  key(cx, cy) { return (cx + 64) * 256 + (cy + 64); }
  add(o) {
    const k = this.key(Math.floor(o.x / CELL), Math.floor(o.y / CELL));
    let a = this.m.get(k);
    if (!a) this.m.set(k, a = []);
    a.push(o); o._g = k;
  }
  del(o) {
    const a = this.m.get(o._g);
    if (a) { const i = a.indexOf(o); if (i >= 0) a.splice(i, 1); }
  }
  each(x, y, r, f) {
    r += 110;
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
      const a = this.m.get(this.key(cx, cy));
      if (a) for (let i = 0; i < a.length; i++) f(a[i]);
    }
  }
}

const ITEMS = {
  wood: { n: 'Wood', k: 'mat' },
  stone: { n: 'Stone', k: 'mat' },
  gold: { n: 'Gold', k: 'mat' },
  diamond: { n: 'Diamond', k: 'mat' },
  fur: { n: 'Fur', k: 'mat' },
  berry: { n: 'Berries', k: 'food', food: 9, water: 3 },
  meat: { n: 'Raw meat', k: 'food', food: 16, cook: 'cooked' },
  cooked: { n: 'Cooked meat', k: 'food', food: 46 },
  pick_wood: { n: 'Wood pickaxe', k: 'tool', tier: 1, dmg: 5, cd: .5, pick: 1 },
  pick_stone: { n: 'Stone pickaxe', k: 'tool', tier: 2, dmg: 6, cd: .46, pick: 1 },
  pick_gold: { n: 'Gold pickaxe', k: 'tool', tier: 3, dmg: 7, cd: .42, pick: 1 },
  pick_diamond: { n: 'Diamond pickaxe', k: 'tool', tier: 4, dmg: 8, cd: .38, pick: 1 },
  sword_wood: { n: 'Wood sword', k: 'tool', tier: 1, dmg: 14, cd: .45 },
  sword_stone: { n: 'Stone sword', k: 'tool', tier: 2, dmg: 22, cd: .42 },
  sword_gold: { n: 'Gold sword', k: 'tool', tier: 3, dmg: 32, cd: .38 },
  sword_diamond: { n: 'Diamond sword', k: 'tool', tier: 4, dmg: 46, cd: .34 },
  campfire: { n: 'Campfire', k: 'place' },
  workbench: { n: 'Workbench', k: 'place' },
  furnace: { n: 'Furnace', k: 'place' },
  chest: { n: 'Chest', k: 'place' },
  bed: { n: 'Bed', k: 'place' },
  wall_wood: { n: 'Wood wall', k: 'place' },
  wall_stone: { n: 'Stone wall', k: 'place' },
  wall_gold: { n: 'Gold wall', k: 'place' },
  door: { n: 'Door', k: 'place' },
  spike: { n: 'Wood spikes', k: 'place' },
  spike_stone: { n: 'Stone spikes', k: 'place' },
  spike_gold: { n: 'Gold spikes', k: 'place' },
  hat: { n: 'Fur hat', k: 'wear', slot: 'head' },
  coat: { n: 'Fur coat', k: 'wear', slot: 'body' },
  bag: { n: 'Bag', k: 'bag' }
};
const IDS = Object.keys(ITEMS);
const IDX = {};
IDS.forEach((k, i) => { ITEMS[k].id = k; IDX[k] = i; });
const STACK = 99;

const ST = {
  campfire: { hs: 26, circ: 1, hp: 120, solid: 1 },
  workbench: { hs: 34, hp: 220, solid: 1 },
  furnace: { hs: 34, hp: 320, solid: 1 },
  chest: { hs: 28, hp: 220, solid: 1, snap: 1 },
  bed: { hs: 32, hp: 160, solid: 0 },
  wall_wood: { hs: 36, hp: 260, solid: 1, snap: 1 },
  wall_stone: { hs: 36, hp: 560, solid: 1, snap: 1 },
  wall_gold: { hs: 36, hp: 950, solid: 1, snap: 1 },
  door: { hs: 36, hp: 240, solid: 1, snap: 1 },
  spike: { hs: 30, hp: 120, solid: 0, snap: 1, dmg: 10 },
  spike_stone: { hs: 30, hp: 240, solid: 0, snap: 1, dmg: 17 },
  spike_gold: { hs: 30, hp: 380, solid: 0, snap: 1, dmg: 26 }
};
const SNAP = 72;

const RECIPES = [
  { id: 'pick_wood', in: { wood: 10 }, st: 0, g: 'Tools' },
  { id: 'sword_wood', in: { wood: 12 }, st: 0, g: 'Tools' },
  { id: 'campfire', in: { wood: 12 }, st: 0, g: 'Build' },
  { id: 'workbench', in: { wood: 24 }, st: 0, g: 'Build' },
  { id: 'wall_wood', in: { wood: 12 }, st: 0, g: 'Build' },
  { id: 'pick_stone', in: { wood: 8, stone: 10 }, st: 1, g: 'Tools' },
  { id: 'sword_stone', in: { wood: 8, stone: 14 }, st: 1, g: 'Tools' },
  { id: 'furnace', in: { stone: 30 }, st: 1, g: 'Build' },
  { id: 'wall_stone', in: { stone: 14 }, st: 1, g: 'Build' },
  { id: 'door', in: { wood: 16 }, st: 1, g: 'Build' },
  { id: 'chest', in: { wood: 24 }, st: 1, g: 'Build' },
  { id: 'spike', in: { wood: 8, stone: 6 }, st: 1, g: 'Build' },
  { id: 'spike_stone', in: { stone: 14, wood: 4 }, st: 1, g: 'Build' },
  { id: 'bed', in: { wood: 20, fur: 3 }, st: 1, g: 'Gear' },
  { id: 'bag', in: { fur: 6, wood: 6 }, st: 1, g: 'Gear' },
  { id: 'hat', in: { fur: 4 }, st: 1, g: 'Gear' },
  { id: 'coat', in: { fur: 8 }, st: 1, g: 'Gear' },
  { id: 'pick_gold', in: { wood: 8, stone: 8, gold: 12 }, st: 2, g: 'Tools' },
  { id: 'sword_gold', in: { wood: 8, stone: 8, gold: 16 }, st: 2, g: 'Tools' },
  { id: 'wall_gold', in: { gold: 14 }, st: 2, g: 'Build' },
  { id: 'spike_gold', in: { gold: 10, stone: 6 }, st: 2, g: 'Build' },
  { id: 'pick_diamond', in: { wood: 8, gold: 10, diamond: 12 }, st: 2, g: 'Tools' },
  { id: 'sword_diamond', in: { wood: 8, gold: 10, diamond: 16 }, st: 2, g: 'Tools' }
];
const RBY = {};
RECIPES.forEach(r => { RBY[r.id] = r; });
const STNAME = ['', 'Workbench', 'Furnace'];

const RES = {
  tree: { r: 30, left: 10, need: 0, item: 'wood', rg: 150 },
  stone: { r: 36, left: 12, need: 1, item: 'stone', rg: 170 },
  gold: { r: 34, left: 8, need: 2, item: 'gold', rg: 200 },
  diamond: { r: 32, left: 6, need: 3, item: 'diamond', rg: 260 },
  bush: { r: 26, left: 4, need: 0, item: 'berry', rg: 70 }
};
const RK = ['tree', 'stone', 'gold', 'diamond', 'bush'];

const AN = {
  rabbit: { hp: 14, sp: 150, r: 14, dmg: 0, drops: [['meat', 1, 1], ['fur', 1, .7]], n: 'Rabbit' },
  wolf: { hp: 70, sp: 172, r: 22, dmg: 14, cd: 1, aggro: 300, drops: [['meat', 2, 1], ['fur', 2, 1]], n: 'Wolf' },
  spider: { hp: 48, sp: 125, r: 18, dmg: 9, cd: .8, aggro: 250, drops: [['meat', 1, .8]], n: 'Spider' },
  dragon: { hp: 900, sp: 118, r: 58, dmg: 38, cd: 1.4, aggro: 560, drops: [['diamond', 5, 1], ['gold', 8, 1], ['meat', 5, 1], ['fur', 4, 1]], n: 'Dragon' }
};
const AK = ['rabbit', 'wolf', 'spider', 'dragon'];

const SLOTS_MAX = 16;
const phaseOf = t => (t / DAY) % 1;
const darkOf = t => {
  const p = phaseOf(t);
  if (p < .55) return 0;
  if (p < .65) return (p - .55) / .1;
  if (p < .9) return 1;
  return 1 - (p - .9) / .1;
};

function terrainAt(x, y, s) {
  const yw = 1250 + (fbm(x / 650, 3.1, s + 11) - .5) * 420;
  const ys = 2850 + (fbm(x / 620, 7.7, s + 23) - .5) * 460;
  if (y < yw) {
    const p = fbm(x / 190, y / 190, s + 31);
    return p > .73 ? TWA : TW;
  }
  if (y > ys) {
    const d = y - ys;
    const e = fbm(x / 230, y / 230, s + 41);
    if (e > .575) return TS;
    if (d < 70) return TS;
    if (d < 170 || e > .45) return TWA;
    return TDP;
  }
  if (y > ys - 70) return TS;
  const p = fbm(x / 200, y / 200, s + 31);
  if (p > .715) return TWA;
  if (p > .675) return TS;
  return TF;
}

function genTerrain(seed) {
  const t = new Uint8Array(TN * TN);
  for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) t[j * TN + i] = terrainAt((i + .5) * TC, (j + .5) * TC, seed);
  return t;
}

function genWorld(seed) {
  const terr = genTerrain(seed);
  const W = { seed, terr, res: [], grid: new Grid() };
  const at = (x, y) => x < 0 || y < 0 || x >= WORLD || y >= WORLD ? TDP : terr[Math.floor(y / TC) * TN + Math.floor(x / TC)];
  W.at = at;
  const step = 150;
  for (let gy = 0; gy < WORLD / step; gy++) for (let gx = 0; gx < WORLD / step; gx++) {
    const rg = mulberry(Math.imul(gx + 1, 73856093) ^ Math.imul(gy + 1, 19349663) ^ seed);
    const x = gx * step + 24 + rg() * (step - 48), y = gy * step + 24 + rg() * (step - 48);
    const tt = at(x, y), roll = rg(), vr = rg(), sz = .85 + rg() * .35;
    if (tt === TWA || tt === TDP) continue;
    if (x < 60 || y < 60 || x > WORLD - 60 || y > WORLD - 60) continue;
    let kind = -1;
    if (tt === TF) {
      const cx = Math.abs(x - 2000) / 2000, boost = 1 - cx * .3;
      if (roll < .34 * boost) kind = 0; else if (roll < .41) kind = 1; else if (roll < .435) kind = 2; else if (roll < .5) kind = 4;
    } else if (tt === TW) {
      if (roll < .24) kind = 0; else if (roll < .33) kind = 1; else if (roll < .38) kind = 2; else if (roll < .41) kind = 3;
    } else if (y > 2750) {
      if (roll < .3) kind = 0; else if (roll < .35) kind = 1; else if (roll < .39) kind = 2; else if (roll < .41) kind = 3; else if (roll < .46) kind = 4;
    } else if (roll < .12) kind = 1;
    if (kind < 0) continue;
    const k = RK[kind];
    W.res.push({ i: W.res.length, k: kind, x, y, r: RES[k].r * sz, sz, v: Math.floor(vr * 3), b: tt, left: RES[k].left, max: RES[k].left, rt: 0, hit: 0 });
  }
  W.res.forEach(r => W.grid.add(r));
  return W;
}

function findSpawn(W, rand, near) {
  for (let n = 0; n < 400; n++) {
    const x = near ? near.x + (rand() - .5) * 900 : 700 + rand() * 2600, y = near ? near.y + (rand() - .5) * 900 : 1500 + rand() * 1100;
    if (x < 100 || x > WORLD - 100 || y < 100 || y > WORLD - 100) continue;
    if (W.at(x, y) !== TF) continue;
    let ok = true;
    W.grid.each(x, y, 90, r => { if (Math.hypot(r.x - x, r.y - y) < r.r + 50) ok = false; });
    if (ok) return { x, y };
  }
  return { x: 2000, y: 2000 };
}

const FXN = ['hit', 'harv', 'num', 'boom', 'eat', 'drink', 'craft', 'place', 'hurt', 'kill', 'clank', 'swing', 'roar', 'bite', 'sleep', 'door', 'fire', 'break', 'pick', 'death'];
const FXI = {};
FXN.forEach((k, i) => { FXI[k] = i; });
const COLORS = ['#f2c48d', '#e8a46a', '#d98f5b', '#c47a4a', '#f7d6b0', '#b9d9a0', '#a6cdf0', '#f0a8c0'];
const BOTNAMES = ['Ash', 'Birch', 'Cedar', 'Dune', 'Ember', 'Frost', 'Gale', 'Hawk', 'Ivy', 'Juniper', 'Kodiak', 'Lynx', 'Moss', 'Nova', 'Onyx', 'Pine', 'Quill', 'Rowan', 'Sage', 'Thorn'];

class Sim {
  constructor(o) {
    this.seed = o.seed >>> 0;
    this.W = genWorld(this.seed);
    this.time = o.time == null ? DAY * .08 : o.time;
    this.nextId = 1;
    this.players = new Map();
    this.animals = new Map();
    this.drops = new Map();
    this.projs = new Map();
    this.structs = new Map();
    this.sg = new Grid();
    this.spikes = [];
    this.ev = [];
    this.fx = [];
    this.solo = !!o.solo;
    this.rand = Math.random;
    this.spawnT = 0;
    this.dragonT = 0;
    this.sendEv = !!o.sendEv;
    this.botN = 0;
    this.lbT = 0;
    this.lb = [];
    this.day = 1;
  }

  id() { return this.nextId++; }
  note(p, m) { if (p.notes && p.ctl !== 'bot') p.notes.push(m); }
  addFx(t, x, y, v) { this.fx.push([FXI[t], Math.round(x), Math.round(y), v == null ? 0 : v]); }
  push(e) { if (this.sendEv) this.ev.push(e); }
  slots(p) { return 8 + (p.bag ? 8 : 0); }

  addPlayer(o) {
    const sp = findSpawn(this.W, this.rand);
    const p = {
      id: o.id || this.id(), name: o.name || 'Survivor', color: o.color || COLORS[Math.floor(this.rand() * COLORS.length)], ctl: o.ctl || 'local',
      x: sp.x, y: sp.y, vx: 0, vy: 0, a: 0, hp: 100, food: 100, water: 100, cold: 100,
      inv: new Array(SLOTS_MAX).fill(null), sel: 0, bag: 0, head: null, body: null, cd: 0, swing: 0, hurt: 0,
      alive: true, sleeping: false, born: this.time, kills: 0, crafted: 0, deadT: 0, inp: { mx: 0, my: 0, a: 0, atk: 0 },
      chest: 0, notes: [], dirty: true, spk: 0, flag: 0, lastHit: -99, struct: 0, bd: null, best: 0, moved: 0, dmgBy: 0
    };
    if (o.id && o.id >= this.nextId) this.nextId = o.id + 1;
    this.players.set(p.id, p);
    this.push({ k: 'pl', id: p.id, name: p.name, color: p.color });
    return p;
  }

  removePlayer(id) {
    const p = this.players.get(id);
    if (!p) return;
    if (p.alive) this.dropAll(p);
    this.players.delete(id);
    this.push({ k: 'plx', id });
  }

  respawn(p) {
    const sp = findSpawn(this.W, this.rand);
    Object.assign(p, {
      x: sp.x, y: sp.y, vx: 0, vy: 0, hp: 100, food: 100, water: 100, cold: 100, inv: new Array(SLOTS_MAX).fill(null), sel: 0, bag: 0, head: null, body: null,
      cd: 0, swing: 0, hurt: 0, alive: true, sleeping: false, born: this.time, kills: 0, crafted: 0, chest: 0, dirty: true, bd: null, spk: 0, lastHit: -99
    });
    this.push({ k: 'pl', id: p.id, name: p.name, color: p.color });
    return p;
  }

  days(p) { return Math.max(0, ((p.alive ? this.time : p.diedAt) - p.born) / DAY); }

  count(p, id) { let n = 0; for (const s of p.inv) if (s && s.i === id) n += s.n; return n; }
  free(p, id) {
    const n = this.slots(p), stack = ITEMS[id].k === 'mat' || ITEMS[id].k === 'food' || ITEMS[id].k === 'place' ? STACK : 1;
    let f = 0;
    for (let i = 0; i < n; i++) { const s = p.inv[i]; if (!s) f += stack; else if (s.i === id && stack > 1) f += stack - s.n; }
    return f;
  }
  give(p, id, n) {
    const ns = this.slots(p), stack = ITEMS[id].k === 'mat' || ITEMS[id].k === 'food' || ITEMS[id].k === 'place' ? STACK : 1;
    if (stack > 1) for (let i = 0; i < ns && n > 0; i++) { const s = p.inv[i]; if (s && s.i === id && s.n < stack) { const a = Math.min(n, stack - s.n); s.n += a; n -= a; } }
    for (let i = 0; i < ns && n > 0; i++) if (!p.inv[i]) { const a = Math.min(n, stack); p.inv[i] = { i: id, n: a }; n -= a; }
    p.dirty = true;
    return n;
  }
  take(p, id, n) {
    for (let i = this.slots(p) - 1; i >= 0 && n > 0; i--) {
      const s = p.inv[i];
      if (s && s.i === id) { const a = Math.min(n, s.n); s.n -= a; n -= a; if (!s.n) p.inv[i] = null; }
    }
    p.dirty = true;
  }

  addDrop(id, n, x, y, skip) {
    if (n <= 0) return;
    const a = this.rand() * 6.283, d = 12 + this.rand() * 26;
    const o = { id: this.id(), i: id, n, x: clamp(x + Math.cos(a) * d, 20, WORLD - 20), y: clamp(y + Math.sin(a) * d, 20, WORLD - 20), t: 0, skip: skip || 0, sk: skip ? 1.2 : 0 };
    this.drops.set(o.id, o);
  }
  dropAll(p) {
    for (let i = 0; i < SLOTS_MAX; i++) { const s = p.inv[i]; if (s) this.addDrop(s.i, s.n, p.x, p.y); p.inv[i] = null; }
    if (p.head) this.addDrop(p.head, 1, p.x, p.y);
    if (p.body) this.addDrop(p.body, 1, p.x, p.y);
    p.head = p.body = null;
    p.dirty = true;
  }

  near(p, id, r) {
    let f = null, best = r * r;
    this.sg.each(p.x, p.y, r, s => {
      if (s.t !== id) return;
      const d = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
      if (d < best) { best = d; f = s; }
    });
    return f;
  }
  station(p, lv) {
    if (!lv) return true;
    if (lv === 1) return !!(this.near(p, 'workbench', 190) || this.near(p, 'furnace', 190));
    return !!this.near(p, 'furnace', 190);
  }
  fireNear(p, r) {
    let f = null;
    this.sg.each(p.x, p.y, r, s => {
      if (f) return;
      if ((s.t === 'campfire' && s.fuel > 0 || s.t === 'furnace') && (s.x - p.x) ** 2 + (s.y - p.y) ** 2 < r * r) f = s;
    });
    return f;
  }

  boxHit(s, x, y, r) {
    const d = ST[s.t];
    if (d.circ) return Math.hypot(x - s.x, y - s.y) < d.hs + r;
    const cx = clamp(x, s.x - d.hs, s.x + d.hs), cy = clamp(y, s.y - d.hs, s.y + d.hs);
    return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
  }

  collide(e, r) {
    for (let it = 0; it < 2; it++) {
      this.W.grid.each(e.x, e.y, r, o => {
        if (o.left <= 0) return;
        const dx = e.x - o.x, dy = e.y - o.y, m = r + o.r, d2 = dx * dx + dy * dy;
        if (d2 >= m * m) return;
        const d = Math.sqrt(d2) || .01;
        e.x += dx / d * (m - d); e.y += dy / d * (m - d);
      });
      this.sg.each(e.x, e.y, r, s => {
        const d = ST[s.t];
        if (!d.solid || (s.t === 'door' && s.open)) return;
        if (d.circ) {
          const dx = e.x - s.x, dy = e.y - s.y, m = r + d.hs, d2 = dx * dx + dy * dy;
          if (d2 >= m * m) return;
          const q = Math.sqrt(d2) || .01;
          e.x += dx / q * (m - q); e.y += dy / q * (m - q);
          return;
        }
        const cx = clamp(e.x, s.x - d.hs, s.x + d.hs), cy = clamp(e.y, s.y - d.hs, s.y + d.hs);
        const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
        if (d2 >= r * r) return;
        if (d2 > .0001) { const q = Math.sqrt(d2); e.x += dx / q * (r - q); e.y += dy / q * (r - q); return; }
        const ox = d.hs + r - Math.abs(e.x - s.x), oy = d.hs + r - Math.abs(e.y - s.y);
        if (ox < oy) e.x += (e.x < s.x ? -1 : 1) * ox; else e.y += (e.y < s.y ? -1 : 1) * oy;
      });
    }
    e.x = clamp(e.x, r, WORLD - r); e.y = clamp(e.y, r, WORLD - r);
  }

  addStruct(t, x, y, own, extra) {
    const d = ST[t];
    const s = Object.assign({ id: this.id(), t, x, y, own, hp: d.hp, open: 0, fuel: t === 'campfire' ? 160 : 0, inv: t === 'chest' ? new Array(12).fill(null) : null, a: 0 }, extra || {});
    if (s.id >= this.nextId) this.nextId = s.id + 1;
    this.structs.set(s.id, s);
    this.sg.add(s);
    if (d.dmg) this.spikes.push(s);
    this.push({ k: 'sa', s: this.structPack(s) });
    return s;
  }
  delStruct(s) {
    this.structs.delete(s.id);
    this.sg.del(s);
    if (ST[s.t].dmg) this.spikes = this.spikes.filter(q => q !== s);
    if (s.inv) for (const it of s.inv) if (it) this.addDrop(it.i, it.n, s.x, s.y);
    this.players.forEach(p => { if (p.chest === s.id) p.chest = 0; });
    this.push({ k: 'sd', id: s.id });
  }
  structPack(s) { return [s.id, s.t, Math.round(s.x), Math.round(s.y), s.own, s.hp, s.open, Math.round(s.fuel)]; }

  canPlace(p, t, x, y) {
    const d = ST[t];
    if (x < 60 || y < 60 || x > WORLD - 60 || y > WORLD - 60) return 'Out of bounds';
    const hs = d.hs;
    for (const [ox, oy] of [[0, 0], [hs, hs], [-hs, hs], [hs, -hs], [-hs, -hs]]) { const q = this.W.at(x + ox, y + oy); if (q === TWA || q === TDP) return 'Cannot build on water'; }
    let bad = null;
    this.W.grid.each(x, y, hs + 60, o => {
      if (o.left <= 0 || bad) return;
      const cx = clamp(o.x, x - hs, x + hs), cy = clamp(o.y, y - hs, y + hs);
      if ((o.x - cx) ** 2 + (o.y - cy) ** 2 < (o.r + 4) ** 2) bad = 'Something is in the way';
    });
    if (bad) return bad;
    this.sg.each(x, y, hs + 80, s => {
      if (bad) return;
      const q = ST[s.t];
      if (Math.abs(s.x - x) < hs + q.hs - 2 && Math.abs(s.y - y) < hs + q.hs - 2) bad = 'Something is in the way';
    });
    if (bad) return bad;
    for (const q of this.players.values()) {
      if (!q.alive) continue;
      const cx = clamp(q.x, x - hs, x + hs), cy = clamp(q.y, y - hs, y + hs);
      if ((q.x - cx) ** 2 + (q.y - cy) ** 2 < 24 * 24 && d.solid) return 'Someone is standing there';
    }
    return null;
  }

  recipeOk(p, r) {
    for (const k in r.in) if (this.count(p, k) < r.in[k]) return false;
    return true;
  }

  cmd(p, c) {
    if (!p || !p.alive) return;
    if (c.c === 'craft') {
      const r = RBY[c.r];
      if (!r) return;
      if (!this.recipeOk(p, r)) return this.note(p, 'Not enough materials');
      if (!this.station(p, r.st)) return this.note(p, 'Stand near a ' + STNAME[r.st]);
      if (r.id === 'bag' && p.bag) return this.note(p, 'You already wear a bag');
      const it = ITEMS[r.id];
      if ((it.k === 'wear') && (p[it.slot] === r.id)) return this.note(p, 'Already wearing it');
      for (const k in r.in) this.take(p, k, r.in[k]);
      const left = this.give(p, r.id, 1);
      if (left) this.addDrop(r.id, left, p.x, p.y);
      p.crafted++;
      this.addFx('craft', p.x, p.y);
      this.note(p, 'Crafted ' + it.n);
    } else if (c.c === 'use') this.use(p, c.s | 0);
    else if (c.c === 'drop') {
      const s = p.inv[c.s | 0];
      if (!s || (c.s | 0) >= this.slots(p)) return;
      p.inv[c.s | 0] = null; p.dirty = true;
      this.addDrop(s.i, s.n, p.x + Math.cos(p.a) * 30, p.y + Math.sin(p.a) * 30, p.id);
    } else if (c.c === 'place') this.place(p, c.s | 0, +c.x, +c.y);
    else if (c.c === 'int') this.interact(p);
    else if (c.c === 'cput') this.chestMove(p, c, 1);
    else if (c.c === 'cget') this.chestMove(p, c, 0);
    else if (c.c === 'cclose') p.chest = 0;
    else if (c.c === 'swap') {
      const a = c.a | 0, b = c.b | 0, n = this.slots(p);
      if (a < n && b < n && a !== b) { const t = p.inv[a]; p.inv[a] = p.inv[b]; p.inv[b] = t; p.dirty = true; }
    }
  }

  use(p, i) {
    if (i < 0 || i >= this.slots(p)) return;
    const s = p.inv[i];
    if (!s) return;
    const it = ITEMS[s.i];
    if (it.k === 'food') {
      if (it.cook) {
        const f = this.fireNear(p, 150);
        if (f) { this.take(p, s.i, 1); this.give(p, it.cook, 1); this.addFx('fire', p.x, p.y); this.note(p, 'Cooked meat'); return; }
      }
      if (p.food >= 99 && p.water >= 99) return this.note(p, 'You are not hungry');
      s.n--; if (!s.n) p.inv[i] = null;
      p.food = Math.min(100, p.food + (it.food || 0)); p.water = Math.min(100, p.water + (it.water || 0));
      if (s.i === 'cooked') p.hp = Math.min(100, p.hp + 6);
      if (s.i === 'meat') p.cold = Math.max(0, p.cold - 6);
      p.dirty = true;
      this.addFx('eat', p.x, p.y);
    } else if (it.k === 'wear') {
      const old = p[it.slot];
      p[it.slot] = s.i;
      p.inv[i] = old ? { i: old, n: 1 } : null;
      p.dirty = true;
      this.addFx('craft', p.x, p.y);
    } else if (it.k === 'bag') {
      if (p.bag) return this.note(p, 'You already wear a bag');
      p.bag = 1; p.inv[i] = null; p.dirty = true;
      this.addFx('craft', p.x, p.y);
    }
  }

  place(p, i, x, y) {
    if (i < 0 || i >= this.slots(p)) return;
    const s = p.inv[i];
    if (!s || ITEMS[s.i].k !== 'place') return;
    const t = s.i, d = ST[t];
    let mine = 0;
    for (const q of this.structs.values()) if (q.own === p.id) mine++;
    if (mine >= 150) return this.note(p, 'Too many structures');
    const dd = Math.hypot(x - p.x, y - p.y);
    if (dd > 200) { x = p.x + (x - p.x) / dd * 200; y = p.y + (y - p.y) / dd * 200; }
    if (d.snap) { x = Math.floor(x / SNAP) * SNAP + SNAP / 2; y = Math.floor(y / SNAP) * SNAP + SNAP / 2; }
    const why = this.canPlace(p, t, x, y);
    if (why) return this.note(p, why);
    s.n--; if (!s.n) p.inv[i] = null;
    p.dirty = true;
    this.addStruct(t, x, y, p.id);
    this.addFx('place', x, y);
  }

  interact(p) {
    let f = null, best = 95 * 95;
    this.sg.each(p.x, p.y, 95, s => {
      if (s.t !== 'door' && s.t !== 'chest' && s.t !== 'bed' && s.t !== 'campfire') return;
      const d = (s.x - p.x) ** 2 + (s.y - p.y) ** 2;
      if (d < best) { best = d; f = s; }
    });
    if (p.sleeping) { p.sleeping = false; return; }
    if (!f) return;
    if (f.t === 'door') { f.open = f.open ? 0 : 1; this.addFx('door', f.x, f.y); this.push({ k: 'su', id: f.id, hp: f.hp, open: f.open, fuel: f.fuel }); }
    else if (f.t === 'chest') p.chest = f.id;
    else if (f.t === 'campfire') {
      if (this.count(p, 'wood') < 1) return this.note(p, 'Add wood to the fire');
      if (f.fuel > 380) return this.note(p, 'The fire is full');
      this.take(p, 'wood', 1); f.fuel = Math.min(420, f.fuel + 45);
      this.addFx('fire', f.x, f.y);
      this.push({ k: 'su', id: f.id, hp: f.hp, open: f.open, fuel: f.fuel });
    } else if (f.t === 'bed') {
      if (this.time - p.lastHit < 6) return this.note(p, 'You cannot sleep right now');
      let danger = false;
      for (const a of this.animals.values()) if (a.k !== 'rabbit' && Math.hypot(a.x - p.x, a.y - p.y) < 380) danger = true;
      if (danger) return this.note(p, 'Enemies are too close to sleep');
      p.sleeping = true; p.sleepDark = darkOf(this.time) > .2; p.x = f.x; p.y = f.y; p.vx = p.vy = 0;
      this.addFx('sleep', p.x, p.y);
    }
  }

  chestMove(p, c, put) {
    const s = this.structs.get(p.chest);
    if (!s || !s.inv || Math.hypot(s.x - p.x, s.y - p.y) > 150) { p.chest = 0; return; }
    if (put) {
      const i = c.s | 0, it = p.inv[i];
      if (!it || i >= this.slots(p)) return;
      let rest = it.n;
      for (let k = 0; k < 12 && rest > 0; k++) { const q = s.inv[k]; if (q && q.i === it.i && ITEMS[it.i].k !== 'tool' && q.n < STACK) { const a = Math.min(rest, STACK - q.n); q.n += a; rest -= a; } }
      for (let k = 0; k < 12 && rest > 0; k++) if (!s.inv[k]) { const a = Math.min(rest, ITEMS[it.i].k === 'tool' || ITEMS[it.i].k === 'wear' || ITEMS[it.i].k === 'bag' ? 1 : STACK); s.inv[k] = { i: it.i, n: a }; rest -= a; }
      if (rest) p.inv[i].n = rest; else p.inv[i] = null;
      p.dirty = true;
    } else {
      const k = c.s | 0, it = s.inv[k];
      if (!it) return;
      const left = this.give(p, it.i, it.n);
      if (left) it.n = left; else s.inv[k] = null;
    }
    p.chestDirty = true;
  }

  hurt(p, dmg, src) {
    if (!p.alive) return;
    p.hp -= dmg; p.hurt = .25; p.lastHit = this.time;
    if (p.sleeping) p.sleeping = false;
    this.addFx('num', p.x, p.y - 30, Math.round(dmg));
    if (src && src.ctl) p.dmgBy = src.id;
    if (p.hp <= 0) this.die(p, src);
  }
  die(p, src) {
    p.alive = false; p.hp = 0; p.diedAt = this.time; p.deadT = 0; p.sleeping = false; p.chest = 0;
    this.dropAll(p);
    this.addFx('death', p.x, p.y);
    p.finalDays = this.days(p);
    p.lastCause = src && src.k ? (AN[src.k] ? AN[src.k].n : 'a creature') : src && src.ctl ? src.name : p.food <= 0 ? 'hunger' : p.water <= 0 ? 'thirst' : p.cold <= 0 ? 'the cold' : 'injuries';
    this.push({ k: 'dead', id: p.id, days: p.finalDays, kills: p.kills, cause: p.lastCause });
    if (src && src.ctl) src.kills++;
  }

  act(p) {
    const s = p.inv[p.sel], item = s ? ITEMS[s.i] : null, tool = item && item.k === 'tool' ? item : null;
    const dmg = tool ? tool.dmg : 4;
    p.cd = tool ? tool.cd : .55;
    p.swing = 1;
    const cx = p.x + Math.cos(p.a) * 50, cy = p.y + Math.sin(p.a) * 50, hr = 40;
    let best = 1e9, tg = null, kind = 0;
    for (const a of this.animals.values()) {
      const d = Math.hypot(a.x - cx, a.y - cy) - AN[a.k].r;
      if (d < hr && d < best) { best = d; tg = a; kind = 1; }
    }
    for (const q of this.players.values()) {
      if (q === p || !q.alive) continue;
      const d = Math.hypot(q.x - cx, q.y - cy) - 22;
      if (d < hr && d < best) { best = d; tg = q; kind = 2; }
    }
    this.W.grid.each(cx, cy, hr + 40, o => {
      if (o.left <= 0) return;
      const d = Math.hypot(o.x - cx, o.y - cy) - o.r;
      if (d < hr && d < best) { best = d; tg = o; kind = 3; }
    });
    this.sg.each(cx, cy, hr + 40, o => {
      if (o.own === p.id) return;
      const d = Math.hypot(o.x - cx, o.y - cy) - ST[o.t].hs;
      if (d < hr && d < best) { best = d; tg = o; kind = 4; }
    });
    this.addFx('swing', p.x, p.y);
    if (kind === 1) this.hitAnimal(p, tg, dmg);
    else if (kind === 2) { this.hurt(tg, dmg, p); tg.vx += Math.cos(p.a) * 160; tg.vy += Math.sin(p.a) * 160; this.addFx('hit', tg.x, tg.y, 0); if (tg.ctl === 'bot') tg.bd = { foe: p.id, t: this.time }; }
    else if (kind === 3) this.harvest(p, tg, tool);
    else if (kind === 4) this.hitStruct(p, tg, dmg * (tool && tool.pick ? 2.4 : 1));
    else if (this.W.at(p.x + Math.cos(p.a) * 44, p.y + Math.sin(p.a) * 44) >= TWA || this.W.at(p.x, p.y) >= TWA) {
      p.water = Math.min(100, p.water + 16);
      this.addFx('drink', p.x + Math.cos(p.a) * 40, p.y + Math.sin(p.a) * 40);
    }
  }

  hitAnimal(p, a, dmg) {
    const d = AN[a.k];
    a.hp -= dmg; a.flash = .2; a.hitBy = p.id; a.fear = 4;
    a.vx += Math.cos(p.a) * 150 / (a.k === 'dragon' ? 4 : 1); a.vy += Math.sin(p.a) * 150 / (a.k === 'dragon' ? 4 : 1);
    this.addFx('hit', a.x, a.y, 0);
    this.addFx('num', a.x, a.y - 24, Math.round(dmg));
    if (a.hp <= 0) {
      this.animals.delete(a.id);
      for (const [it, n, pr] of d.drops) if (this.rand() < pr) this.addDrop(it, n, a.x, a.y);
      p.kills++;
      this.addFx('kill', a.x, a.y);
    }
  }

  harvest(p, o, tool) {
    const def = RES[RK[o.k]], tier = tool && tool.pick ? tool.tier : 0;
    if (tier < def.need) {
      this.addFx('clank', o.x, o.y);
      return this.note(p, 'You need a ' + ['', 'wood', 'stone', 'gold'][def.need] + ' pickaxe or better');
    }
    let y = o.k === 0 ? 1 + tier : o.k === 1 ? tier : o.k === 2 ? tier - 1 : o.k === 3 ? tier - 2 : 1;
    y = Math.min(y, o.left);
    o.left -= y; o.hit = .2;
    let left = this.give(p, def.item, y);
    if (left) this.addDrop(def.item, left, p.x, p.y);
    this.addFx('harv', o.x, o.y, o.k);
    if (o.left <= 0) o.rt = 110 + this.rand() * 70;
    this.push({ k: 'r', i: o.i, l: o.left });
  }

  hitStruct(p, s, dmg) {
    s.hp -= dmg;
    this.addFx('hit', s.x, s.y, 1);
    if (s.hp <= 0) { this.addFx('break', s.x, s.y); this.delStruct(s); }
    else this.push({ k: 'su', id: s.id, hp: s.hp, open: s.open, fuel: s.fuel });
  }

  moveEnt(e, dt, r, sp) {
    const ox = e.x, oy = e.y;
    e.x += e.vx * dt; e.y += e.vy * dt;
    this.collide(e, r);
    return Math.hypot(e.x - ox, e.y - oy);
  }

  walk(p, dt, mx, my) {
    const l = Math.hypot(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    const tt = this.W.at(p.x, p.y);
    const sp = 158 * (tt === TWA ? .62 : tt === TDP ? .5 : 1) * (p.cold < 10 ? .85 : 1);
    const k = Math.min(1, dt * 12);
    p.vx += (mx * sp - p.vx) * k; p.vy += (my * sp - p.vy) * k;
    this.moveEnt(p, dt, 22);
  }

  stepPlayer(p, dt) {
    p.cd -= dt; p.swing = Math.max(0, p.swing - dt * 4); p.hurt = Math.max(0, p.hurt - dt);
    const si = p.inv[p.sel];
    p.tool = si && ITEMS[si.i].k === 'tool' ? si.i : null;
    if (p.sleeping) { p.vx = p.vy = 0; return; }
    const i = p.inp;
    let mx = i.mx || 0, my = i.my || 0;
    const l = Math.hypot(mx, my);
    if (l > 1) { mx /= l; my /= l; }
    this.walk(p, dt, mx, my);
    if (p.chest) { const cs = this.structs.get(p.chest); if (!cs || Math.hypot(cs.x - p.x, cs.y - p.y) > 170) p.chest = 0; }
    p.a = i.a || 0;
    if (i.atk && p.cd <= 0) {
      const s = p.inv[p.sel], it = s ? ITEMS[s.i] : null;
      if (!it || it.k === 'tool' || it.k === 'mat' || it.k === 'wear' || it.k === 'bag') this.act(p);
      else if (it.k === 'food' && p.cd <= 0) { p.cd = .5; this.use(p, p.sel); }
    }
    if (p.knock) { p.knock = 0; }
  }

  statsStep(p, dt) {
    const d = darkOf(this.time), b = this.W.at(p.x, p.y);
    const slp = p.sleeping ? .4 : 1;
    p.food = Math.max(0, p.food - .5 * dt * slp);
    p.water = Math.max(0, p.water - (b === TW ? .6 : .78) * dt * slp);
    let base = 0;
    if (b === TW) base = lerp(1.25, 2.4, d); else base = d * .95;
    if (b === TWA) base += 1.3; else if (b === TDP) base += 2.1;
    if (p.head) base *= .75;
    if (p.body) base *= .52;
    const fire = this.fireNear(p, 200);
    if (fire) p.cold = Math.min(100, p.cold + 9 * dt);
    else if (base > 0) p.cold = Math.max(0, p.cold - base * dt);
    else p.cold = Math.min(100, p.cold + 3 * dt);
    let dm = 0;
    if (p.food <= 0) dm += 1.4;
    if (p.water <= 0) dm += 1.8;
    if (p.cold <= 0) dm += 2.2;
    if (dm > 0) { p.hp -= dm * dt; p.dmgT = (p.dmgT || 0) + dt; if (p.dmgT > 1) { p.dmgT = 0; p.hurt = .2; } if (p.hp <= 0) this.die(p, null); }
    else if (p.food > 20 && p.water > 20 && p.cold > 25) p.hp = Math.min(100, p.hp + (p.sleeping ? 3.4 : 1.3) * dt);
    if (p.sleeping && p.sleepDark && darkOf(this.time) === 0 && phaseOf(this.time) < .5) p.sleeping = false;
  }

  step(dt) {
    this.time += dt;
    const day = Math.floor(this.time / DAY) + 1;
    if (day !== this.day) { this.day = day; this.push({ k: 'day', d: day }); }
    const W = this.W;
    for (const o of W.res) {
      if (o.hit > 0) o.hit -= dt;
      if (o.left <= 0) {
        o.rt -= dt;
        if (o.rt <= 0) { o.left = o.max; this.push({ k: 'r', i: o.i, l: o.left }); }
      }
    }
    for (const p of this.players.values()) {
      if (!p.alive) { p.deadT += dt; continue; }
      if (p.ctl === 'bot') botThink(this, p, dt);
      this.stepPlayer(p, dt);
      this.statsStep(p, dt);
    }
    for (const p of this.players.values()) {
      if (p.ctl === 'bot' && !p.alive && p.deadT > 14) { this.respawn(p); p.bd = null; }
    }
    for (const a of [...this.animals.values()]) this.stepAnimal(a, dt);
    for (const q of [...this.projs.values()]) this.stepProj(q, dt);
    for (const d of [...this.drops.values()]) {
      d.t += dt; d.sk -= dt;
      if (d.t > 150) { this.drops.delete(d.id); continue; }
      for (const p of this.players.values()) {
        if (!p.alive || p.sleeping) continue;
        if (d.sk > 0 && d.skip === p.id) continue;
        if ((p.x - d.x) ** 2 + (p.y - d.y) ** 2 < 38 * 38) {
          const left = this.give(p, d.i, d.n);
          if (left < d.n) { this.addFx('pick', d.x, d.y); }
          if (left) d.n = left; else { this.drops.delete(d.id); }
          break;
        }
      }
    }
    for (const s of this.structs.values()) {
      if (s.t === 'campfire' && s.fuel > 0) {
        const was = s.fuel > 0;
        s.fuel -= dt;
        if (was && s.fuel <= 0) { s.fuel = 0; this.push({ k: 'su', id: s.id, hp: s.hp, open: s.open, fuel: 0 }); }
      }
    }
    this.spikeStep(dt);
    this.spawnStep(dt);
    this.lbT -= dt;
    if (this.lbT <= 0) { this.lbT = 1.5; this.lb = [...this.players.values()].map(p => [p.id, +this.days(p).toFixed(1), p.kills, p.alive ? 1 : 0]).sort((a, b) => b[1] - a[1]).slice(0, 8); }
  }

  spikeStep(dt) {
    if (!this.spikes.length) return;
    const ents = [...this.players.values()].filter(p => p.alive), ans = [...this.animals.values()];
    for (const s of this.spikes) {
      const d = ST[s.t];
      for (const e of ents) {
        if (e.id === s.own) continue;
        e.spk -= dt;
        if (Math.abs(e.x - s.x) < d.hs + 8 && Math.abs(e.y - s.y) < d.hs + 8 && e.spk <= 0) {
          e.spk = .6; this.hurt(e, d.dmg, null); s.hp -= 2; this.addFx('hit', e.x, e.y, 2);
        }
      }
      for (const e of ans) {
        e.spk = (e.spk || 0) - dt;
        if (Math.abs(e.x - s.x) < d.hs + 6 && Math.abs(e.y - s.y) < d.hs + 6 && e.spk <= 0) {
          e.spk = .6; e.hp -= d.dmg; e.flash = .2; s.hp -= 2; this.addFx('hit', e.x, e.y, 2);
          if (e.hp <= 0) { this.animals.delete(e.id); for (const [it, n, pr] of AN[e.k].drops) if (this.rand() < pr) this.addDrop(it, n, e.x, e.y); }
        }
      }
      if (s.hp <= 0) { this.delStruct(s); break; }
    }
  }

  leaderboard() { return this.lb; }

  saveState() {
    const res = [];
    for (const o of this.W.res) if (o.left !== o.max) res.push([o.i, o.left, Math.round(o.rt)]);
    const structs = [...this.structs.values()].map(s => ({ id: s.id, t: s.t, x: s.x, y: s.y, own: s.own, hp: s.hp, open: s.open, fuel: s.fuel, inv: s.inv }));
    const players = [...this.players.values()].map(p => ({
      id: p.id, name: p.name, color: p.color, ctl: p.ctl, x: p.x, y: p.y, hp: p.hp, food: p.food, water: p.water, cold: p.cold, inv: p.inv, sel: p.sel, bag: p.bag, head: p.head, body: p.body,
      alive: p.alive, born: p.born, kills: p.kills, crafted: p.crafted, diedAt: p.diedAt, finalDays: p.finalDays
    }));
    return { v: 1, seed: this.seed, time: this.time, nextId: this.nextId, res, structs, players, solo: this.solo };
  }

  loadState(st) {
    this.time = st.time; this.nextId = Math.max(this.nextId, st.nextId);
    for (const [i, l, rt] of st.res) { const o = this.W.res[i]; if (o) { o.left = l; o.rt = rt; } }
    for (const s of st.structs) {
      const q = this.addStruct(s.t, s.x, s.y, s.own, { id: s.id, hp: s.hp, open: s.open, fuel: s.fuel, inv: s.inv || null });
      if (s.inv) q.inv = s.inv;
    }
    this.day = Math.floor(this.time / DAY) + 1;
    return st.players;
  }
}

Sim.prototype.spawnAnimal = function (k, x, y) {
  const d = AN[k];
  const a = { id: this.id(), k, x, y, a: this.rand() * 6.283, vx: 0, vy: 0, hp: d.hp, mhp: d.hp, cd: 0, wt: 0, wa: this.rand() * 6.283, idle: 0, flash: 0, fear: 0, fb: 2, stuck: 0, sideT: 0, side: 1, anim: 0, w: this.W.at(x, y) === TW ? 1 : 0, hitBy: 0 };
  this.animals.set(a.id, a);
  return a;
};

Sim.prototype.stepAnimal = function (a, dt) {
  const d = AN[a.k], dark = darkOf(this.time);
  a.flash = Math.max(0, a.flash - dt); a.cd -= dt; a.fear -= dt; a.fb -= dt; a.sideT -= dt; a.wt -= dt;
  let tp = null, td = 1e9;
  for (const p of this.players.values()) {
    if (!p.alive) continue;
    const q = Math.hypot(p.x - a.x, p.y - a.y);
    if (q < td) { td = q; tp = p; }
  }
  let ax = 0, ay = 0, spd = 0, mode = 0;
  if (a.k === 'rabbit') {
    if (tp && (td < 210 || a.fear > 0) && td < 700) { mode = 1; ax = a.x - tp.x; ay = a.y - tp.y; spd = d.sp; }
  } else {
    const aggro = d.aggro * (a.k === 'wolf' ? .7 + .6 * dark : 1) * (tp && tp.sleeping ? .55 : 1);
    if (tp && (td < aggro || (a.fear > 0 && td < aggro * 2))) {
      mode = 2; ax = tp.x - a.x; ay = tp.y - a.y; spd = d.sp * (td < aggro * .35 ? 1 : .86);
      if (td < d.r + 24 + 6 && a.cd <= 0) {
        a.cd = d.cd; this.hurt(tp, d.dmg * (.85 + this.rand() * .3), a); this.addFx('bite', tp.x, tp.y);
      }
      if (a.k === 'dragon' && td > 150 && td < 540 && a.fb <= 0) {
        a.fb = 2.6 + this.rand() * 1.4;
        const an = Math.atan2(tp.y - a.y, tp.x - a.x) + (this.rand() - .5) * .25;
        const q = { id: this.id(), x: a.x + Math.cos(an) * 60, y: a.y + Math.sin(an) * 60, vx: Math.cos(an) * 360, vy: Math.sin(an) * 360, life: 1.7, dmg: 22, o: a.id };
        this.projs.set(q.id, q);
        this.addFx('roar', a.x, a.y);
      }
    }
  }
  if (!mode) {
    if (a.wt <= 0) { a.wt = 1.5 + this.rand() * 3.5; a.wa = this.rand() * 6.283; a.idle = this.rand() < .45 ? 1 : 0; }
    ax = Math.cos(a.wa); ay = Math.sin(a.wa); spd = a.idle ? 0 : d.sp * .32;
  }
  a.mode = mode;
  let hd = Math.atan2(ay, ax);
  if (a.sideT > 0) hd += a.side * 1.3;
  const tvx = spd ? Math.cos(hd) * spd : 0, tvy = spd ? Math.sin(hd) * spd : 0;
  const k = Math.min(1, dt * 8);
  a.vx += (tvx - a.vx) * k; a.vy += (tvy - a.vy) * k;
  const nx = a.x + a.vx * dt * 6, ny = a.y + a.vy * dt * 6;
  if (this.W.at(nx, ny) >= TWA && this.W.at(a.x, a.y) < TWA) { a.vx = a.vy = 0; if (!mode) { a.wa += 2.2; a.wt = .8; } else { a.sideT = .6; } }
  const moved = this.moveEnt(a, dt, d.r);
  if (spd && moved < spd * dt * .3) { a.stuck += dt; if (a.stuck > .35) { a.stuck = 0; a.sideT = .8; a.side = this.rand() < .5 ? -1 : 1; if (!mode) { a.wa += 2; } } } else a.stuck = 0;
  if (Math.hypot(a.vx, a.vy) > 8) { a.a = lerpAng(a.a, Math.atan2(a.vy, a.vx), Math.min(1, dt * 9)); a.anim += dt * Math.hypot(a.vx, a.vy) * .06; }
};

Sim.prototype.stepProj = function (q, dt) {
  q.life -= dt;
  q.x += q.vx * dt; q.y += q.vy * dt;
  let hit = q.life <= 0;
  if (!hit) for (const p of this.players.values()) {
    if (p.alive && Math.hypot(p.x - q.x, p.y - q.y) < 40) { this.hurt(p, q.dmg, { k: 'dragon' }); hit = true; break; }
  }
  if (!hit) this.sg.each(q.x, q.y, 30, s => {
    if (!hit && ST[s.t].solid && this.boxHit(s, q.x, q.y, 12)) { hit = true; s.hp -= 40; if (s.hp <= 0) this.delStruct(s); else this.push({ k: 'su', id: s.id, hp: s.hp, open: s.open, fuel: s.fuel }); }
  });
  if (!hit) this.W.grid.each(q.x, q.y, 30, o => { if (!hit && o.left > 0 && Math.hypot(o.x - q.x, o.y - q.y) < o.r + 10) hit = true; });
  if (hit) { this.projs.delete(q.id); this.addFx('boom', q.x, q.y); }
};

Sim.prototype.spawnStep = function (dt) {
  this.spawnT -= dt; this.dragonT -= dt;
  if (this.spawnT > 0) return;
  this.spawnT = 1.1;
  const hum = [...this.players.values()].filter(p => p.alive);
  if (!hum.length) return;
  const cnt = { rabbit: 0, wolf: 0, spider: 0, dragon: 0 };
  for (const a of this.animals.values()) {
    cnt[a.k]++;
    let m = 1e9;
    for (const p of hum) m = Math.min(m, Math.hypot(p.x - a.x, p.y - a.y));
    if (m > (a.k === 'dragon' ? 3200 : 2100)) this.animals.delete(a.id);
  }
  const dark = darkOf(this.time);
  const caps = { rabbit: 40, wolf: 12 + Math.round(dark * 8), spider: 10 + Math.round(dark * 6), dragon: 2 };
  const p = hum[Math.floor(this.rand() * hum.length)];
  const an = this.rand() * 6.283, dist = 650 + this.rand() * 750;
  const x = p.x + Math.cos(an) * dist, y = p.y + Math.sin(an) * dist;
  if (x < 80 || y < 80 || x > WORLD - 80 || y > WORLD - 80) return;
  for (const q of hum) if (Math.hypot(q.x - x, q.y - y) < 560) return;
  const tt = this.W.at(x, y);
  if (tt >= TWA || tt === TS) return;
  let free = true;
  this.W.grid.each(x, y, 50, o => { if (o.left > 0 && Math.hypot(o.x - x, o.y - y) < o.r + 30) free = false; });
  if (!free) return;
  const r = this.rand();
  let k = null;
  if (tt === TF) k = r < .5 ? 'rabbit' : r < .78 ? 'wolf' : 'spider';
  else k = r < .35 ? 'rabbit' : 'wolf';
  if (cnt[k] < caps[k]) this.spawnAnimal(k, x, y);
  if (cnt.dragon < caps.dragon && this.dragonT <= 0 && tt === TW && y < 1200) {
    let far = true;
    for (const q of hum) if (Math.hypot(q.x - x, q.y - y) < 1000) far = false;
    if (far) { this.spawnAnimal('dragon', x, y); this.dragonT = 120; }
  }
};

Sim.prototype.populate = function () {
  const rs = mulberry(this.seed ^ 0x9e3779b9);
  let n = 0, guard = 0;
  const want = { rabbit: 34, wolf: 12, spider: 9, dragon: 2 };
  const have = { rabbit: 0, wolf: 0, spider: 0, dragon: 0 };
  while (n < 75 && guard++ < 3000) {
    const x = 100 + rs() * (WORLD - 200), y = 100 + rs() * (WORLD - 200);
    const tt = this.W.at(x, y);
    if (tt >= TWA || tt === TS) continue;
    let near = false;
    for (const p of this.players.values()) if (Math.hypot(p.x - x, p.y - y) < 700) near = true;
    if (near) continue;
    let k;
    const r = rs();
    if (tt === TF) k = r < .5 ? 'rabbit' : r < .78 ? 'wolf' : 'spider'; else k = r < .12 && y < 1200 ? 'dragon' : r < .4 ? 'rabbit' : 'wolf';
    if (have[k] >= want[k]) continue;
    have[k]++; n++;
    this.spawnAnimal(k, x, y);
  }
  this.dragonT = 60;
};

function botFindRes(sim, p, kind, maxd) {
  let best = null, bd = maxd * maxd;
  sim.W.grid.each(p.x, p.y, maxd, o => {
    if (o.k !== kind || o.left <= 0) return;
    const d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2;
    if (d < bd) { bd = d; best = o; }
  });
  return best;
}
function botFindWater(sim, p) {
  for (let r = 60; r <= 1400; r += 60) {
    let best = null, bd = 1e12;
    for (let a = 0; a < 24; a++) {
      const x = p.x + Math.cos(a * .2618) * r, y = p.y + Math.sin(a * .2618) * r;
      if (sim.W.at(x, y) >= TWA && x > 40 && y > 40 && x < WORLD - 40 && y < WORLD - 40) { const d = (x - p.x) ** 2 + (y - p.y) ** 2; if (d < bd) { bd = d; best = { x, y }; } }
    }
    if (best) return best;
  }
  return null;
}
function botTier(sim, p, pick) {
  let t = 0;
  for (const s of p.inv) if (s) { const it = ITEMS[s.i]; if (it.k === 'tool' && !!it.pick === pick && it.tier > t) t = it.tier; }
  return t;
}
function botSlot(sim, p, pick) {
  let t = 0, si = -1;
  for (let i = 0; i < 8; i++) { const s = p.inv[i]; if (s) { const it = ITEMS[s.i]; if (it.k === 'tool' && !!it.pick === pick && it.tier > t) { t = it.tier; si = i; } } }
  return si;
}
const BOT_PLAN = ['pick_wood', 'sword_wood', 'workbench', 'pick_stone', 'sword_stone', 'hat', 'coat', 'furnace', 'pick_gold', 'sword_gold', 'bag', 'pick_diamond', 'sword_diamond'];

function botNext(sim, p) {
  for (const id of BOT_PLAN) {
    const it = ITEMS[id];
    if (it.k === 'tool') { if (botTier(sim, p, !!it.pick) >= it.tier) continue; }
    else if (id === 'workbench') { if (sim.near(p, 'workbench', 600) || sim.count(p, 'workbench')) continue; }
    else if (id === 'furnace') { if (sim.near(p, 'furnace', 600) || sim.count(p, 'furnace')) continue; }
    else if (it.k === 'wear') { if (p[it.slot]) continue; if (sim.count(p, 'fur') < RBY[id].in.fur) continue; }
    else if (id === 'bag') { if (p.bag || sim.count(p, 'fur') < 6) continue; }
    return id;
  }
  return null;
}

function botThink(sim, p, dt) {
  const b = p.bd || (p.bd = { thinkT: 0, mode: '', tx: 0, ty: 0, wa: 0, wt: 0, lx: p.x, ly: p.y, st: 0, ct: 0, foe: 0, t: 0, side: 0 });
  const inp = p.inp;
  b.thinkT -= dt; b.ct -= dt; b.side -= dt;
  if (b.foe && sim.time - b.t > 15) b.foe = 0;
  if (b.thinkT <= 0) {
    b.thinkT = .25 + Math.random() * .1;
    botDecide(sim, p, b);
  }
  let tx = b.tx, ty = b.ty, mx = 0, my = 0;
  if (b.mode && b.mode !== 'idle') {
    const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
    if (b.mode === 'flee') { mx = -dx / (d || 1); my = -dy / (d || 1); }
    else if (d > b.stop) { mx = dx / d; my = dy / d; }
    if (b.side > 0) { const c = Math.cos(1.2 * b.sd), s = Math.sin(1.2 * b.sd); const nx = mx * c - my * s, ny = mx * s + my * c; mx = nx; my = ny; }
    if (b.mode !== 'flee' || true) inp.a = Math.atan2(dy, dx) + (b.mode === 'flee' ? Math.PI : 0);
  }
  inp.mx = mx; inp.my = my;
  inp.atk = b.act ? 1 : 0;
  b.st += dt;
  if (b.st > .7) {
    if (Math.hypot(p.x - b.lx, p.y - b.ly) < 10 && (mx || my) && !b.act) { b.side = .9; b.sd = Math.random() < .5 ? 1 : -1; }
    b.lx = p.x; b.ly = p.y; b.st = 0;
  }
}

function botDecide(sim, p, b) {
  b.act = 0; b.stop = 10;
  const dark = darkOf(sim.time);
  let foe = null, fd = 1e9;
  for (const a of sim.animals.values()) {
    if (a.k === 'rabbit') continue;
    const d = Math.hypot(a.x - p.x, a.y - p.y);
    if (d < 340 && d < fd) { fd = d; foe = a; }
  }
  const sw = botTier(sim, p, false), swSlot = botSlot(sim, p, false);
  if (foe) {
    const strong = foe.k === 'dragon' || (foe.k === 'wolf' && sw < 1) || p.hp < 38;
    if (strong) { b.mode = 'flee'; b.tx = foe.x; b.ty = foe.y; return; }
    b.mode = 'goto'; b.tx = foe.x; b.ty = foe.y; b.stop = 26;
    if (swSlot >= 0) p.sel = swSlot;
    if (fd < 70) b.act = 1;
    p.inp.a = Math.atan2(foe.y - p.y, foe.x - p.x);
    return;
  }
  if (b.foe) {
    const q = sim.players.get(b.foe);
    if (q && q.alive && Math.hypot(q.x - p.x, q.y - p.y) < 300 && sw >= 1) { b.mode = 'goto'; b.tx = q.x; b.ty = q.y; b.stop = 26; p.sel = swSlot; if (Math.hypot(q.x - p.x, q.y - p.y) < 70) b.act = 1; return; }
  }
  const slot = id => p.inv.findIndex((s, i) => s && s.i === id && i < sim.slots(p));
  const eat = () => {
    for (const id of ['cooked', 'berry', 'meat']) { const i = slot(id); if (i >= 0 && !(id === 'meat' && sim.fireNear(p, 150) === null && p.food > 25)) { sim.cmd(p, { c: 'use', s: i }); return true; } }
    return false;
  };
  if (p.food < 55 && b.ct <= 0) { b.ct = .8; if (eat()) return; }
  const fire = sim.fireNear(p, 260);
  if (sim.fireNear(p, 150) && slot('meat') >= 0 && b.ct <= 0) { b.ct = .5; sim.cmd(p, { c: 'use', s: slot('meat') }); }
  if (p.water < 42) {
    if (b.wp === undefined || b.wpt < sim.time - 30) { b.wp = botFindWater(sim, p); b.wpt = sim.time; }
    if (b.wp) {
      const d = Math.hypot(b.wp.x - p.x, b.wp.y - p.y);
      b.mode = 'goto'; b.tx = b.wp.x; b.ty = b.wp.y; b.stop = 4;
      if (d < 70 || sim.W.at(p.x, p.y) >= TWA) { b.act = 1; p.inp.a = Math.atan2(b.wp.y - p.y, b.wp.x - p.x); b.mode = 'idle'; b.stop = 0; p.inp.mx = p.inp.my = 0; }
      return;
    }
  }
  if (p.food < 50) {
    const bush = botFindRes(sim, p, 4, 1100);
    if (bush) return botWork(sim, p, b, bush);
    let rb = null, rd = 700;
    for (const a of sim.animals.values()) if (a.k === 'rabbit') { const d = Math.hypot(a.x - p.x, a.y - p.y); if (d < rd) { rd = d; rb = a; } }
    if (rb) { b.mode = 'goto'; b.tx = rb.x; b.ty = rb.y; b.stop = 26; if (swSlot >= 0) p.sel = swSlot; if (rd < 70) b.act = 1; p.inp.a = Math.atan2(rb.y - p.y, rb.x - p.x); return; }
  }
  if (dark > .3 || p.cold < 50) {
    if (fire) {
      const d = Math.hypot(fire.x - p.x, fire.y - p.y);
      b.mode = d > 90 ? 'goto' : 'idle'; b.tx = fire.x; b.ty = fire.y; b.stop = 70;
      if (d < 100 && fire.t === 'campfire' && fire.fuel < 70 && sim.count(p, 'wood') > 0 && b.ct <= 0) { b.ct = 2; sim.cmd(p, { c: 'int' }); }
      if (d < 100 && dark > .6 && p.food > 30 && p.water > 30) return;
      if (d < 100) return;
      return;
    }
    if (sim.count(p, 'campfire') > 0) { const i = slot('campfire'); sim.cmd(p, { c: 'place', s: i, x: p.x + 60, y: p.y }); b.ct = 1; return; }
    if (sim.count(p, 'wood') >= 12) { sim.cmd(p, { c: 'craft', r: 'campfire' }); return; }
    const tr = botFindRes(sim, p, 0, 900);
    if (tr) return botWork(sim, p, b, tr);
  }
  const nx = botNext(sim, p);
  if (nx) {
    const r = RBY[nx];
    if (sim.recipeOk(p, r)) {
      if (r.st && !sim.station(p, r.st)) {
        let s = sim.near(p, r.st === 1 ? 'workbench' : 'furnace', 900) || (r.st === 1 ? sim.near(p, 'furnace', 900) : null);
        if (s) { b.mode = 'goto'; b.tx = s.x; b.ty = s.y; b.stop = 100; return; }
        const need = r.st === 1 ? 'workbench' : 'furnace';
        if (sim.count(p, need) > 0) { sim.cmd(p, { c: 'place', s: slot(need), x: p.x + 70, y: p.y }); return; }
        if (sim.recipeOk(p, RBY[need]) && (need !== 'furnace' || sim.station(p, 1))) { sim.cmd(p, { c: 'craft', r: need }); return; }
      } else { sim.cmd(p, { c: 'craft', r: nx }); if (p.sel > 7) p.sel = 0; const it = ITEMS[nx]; if (it.k === 'wear' || it.k === 'bag') { const i = slot(nx); if (i >= 0) sim.cmd(p, { c: 'use', s: i }); } if (it.k === 'place' && nx !== 'workbench' && nx !== 'furnace') { } return; }
    }
    let missing = null, ratio = 2;
    for (const k in r.in) { const q = sim.count(p, k) / r.in[k]; if (q < ratio && q < 1) { ratio = q; missing = k; } }
    if (r.st && !sim.station(p, r.st) && !sim.near(p, r.st === 1 ? 'workbench' : 'furnace', 900)) {
      const need = r.st === 1 ? 'workbench' : 'furnace';
      const nr = RBY[need];
      for (const k in nr.in) { const q = sim.count(p, k) / nr.in[k]; if (q < ratio && q < 1 && !(need === 'furnace' && sim.count(p, 'workbench') === 0 && !sim.near(p, 'workbench', 900))) { ratio = q; missing = k; } }
    }
    if (missing) {
      const kind = { wood: 0, stone: 1, gold: 2, diamond: 3 }[missing];
      if (kind !== undefined) {
        const need = RES[RK[kind]].need;
        if (botTier(sim, p, true) >= need) { const o = botFindRes(sim, p, kind, 1600); if (o) return botWork(sim, p, b, o); }
        else { const o = botFindRes(sim, p, 0, 1600); if (o) return botWork(sim, p, b, o); }
      }
      if (missing === 'fur') {
        let rb = null, rd = 900;
        for (const a of sim.animals.values()) if (a.k === 'rabbit' || a.k === 'wolf') { const d = Math.hypot(a.x - p.x, a.y - p.y); if (d < rd) { rd = d; rb = a; } }
        if (rb && (rb.k === 'rabbit' || sw >= 1)) { b.mode = 'goto'; b.tx = rb.x; b.ty = rb.y; b.stop = 26; if (swSlot >= 0) p.sel = swSlot; if (rd < 70) b.act = 1; p.inp.a = Math.atan2(rb.y - p.y, rb.x - p.x); return; }
      }
    }
  }
  const tr = botFindRes(sim, p, 0, 1200);
  if (tr && sim.count(p, 'wood') < 60) return botWork(sim, p, b, tr);
  if (b.wt === undefined || b.wt < sim.time) { b.wt = sim.time + 4 + Math.random() * 5; b.wx = clamp(p.x + (Math.random() - .5) * 900, 150, WORLD - 150); b.wy = clamp(p.y + (Math.random() - .5) * 900, 150, WORLD - 150); }
  b.mode = 'goto'; b.tx = b.wx; b.ty = b.wy; b.stop = 30;
}

function botWork(sim, p, b, o) {
  const d = Math.hypot(o.x - p.x, o.y - p.y);
  b.mode = 'goto'; b.tx = o.x; b.ty = o.y; b.stop = o.r + 20;
  const pk = botSlot(sim, p, true);
  if (pk >= 0) p.sel = pk; else { const e = p.inv.findIndex((s, i) => !s && i < 8); if (e >= 0) p.sel = e; }
  if (d < o.r + 52) { b.act = 1; p.inp.a = Math.atan2(o.y - p.y, o.x - p.x); }
}

const OUT = '#1f2a1c';
const SPS = 2;
const sprCache = new Map();
function spr(key, w, h, fn) {
  let c = sprCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = Math.ceil(w * SPS); c.height = Math.ceil(h * SPS);
  const g = c.getContext('2d');
  g.scale(SPS, SPS); g.translate(w / 2, h / 2);
  g.lineJoin = 'round'; g.lineCap = 'round';
  fn(g);
  c._w = w; c._h = h;
  sprCache.set(key, c);
  return c;
}
function blit(ctx, c, x, y, sc) {
  sc = sc || 1;
  ctx.drawImage(c, x - c._w / 2 * sc, y - c._h / 2 * sc, c._w * sc, c._h * sc);
}
function poly(g, pts) {
  g.beginPath();
  pts.forEach((p, i) => { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); });
  g.closePath();
}
function fs(g, fill, stroke, lw) {
  g.fillStyle = fill; g.fill();
  g.lineWidth = lw || 3; g.strokeStyle = stroke || OUT; g.stroke();
}
function blobPts(R, n, r, j) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.2832, d = r * (1 - j + R() * j * 2); pts.push([Math.cos(a) * d, Math.sin(a) * d]); }
  return pts;
}
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, 6.2832); }

function drawOak(g, v) {
  const R = mulberry(77 + v * 13);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(6, 10, 54, 48, 0, 0, 7); g.fill();
  const cs = [[0, 0, 34]];
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.2832 + R() * .4, d = 26 + R() * 6; cs.push([Math.cos(a) * d, Math.sin(a) * d, 22 + R() * 7]); }
  g.lineWidth = 8; g.strokeStyle = OUT;
  cs.forEach(c => { circ(g, c[0], c[1], c[2]); g.stroke(); });
  cs.forEach((c, i) => { circ(g, c[0], c[1], c[2]); g.fillStyle = i % 2 ? '#3a9b3f' : '#2f8a37'; g.fill(); });
  cs.forEach((c, i) => { circ(g, c[0] - c[2] * .25, c[1] - c[2] * .3, c[2] * .6); g.fillStyle = i % 2 ? '#5bbd4c' : '#4aae46'; g.fill(); });
  g.fillStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 6; i++) { circ(g, (R() - .5) * 60, (R() - .5) * 60, 3 + R() * 3); g.fill(); }
}
function drawPine(g, v) {
  const R = mulberry(31 + v * 7);
  g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.ellipse(6, 10, 50, 46, 0, 0, 7); g.fill();
  const lay = [[50, '#26603f'], [38, '#2f7a4d'], [26, '#3a9460']];
  lay.forEach(([r, c], k) => {
    const pts = [], n = 9, rot = k * .35 + R() * .2;
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.2832 + rot, d = i % 2 ? r * .6 : r; pts.push([Math.cos(a) * d, Math.sin(a) * d]); }
    poly(g, pts); fs(g, c, '#15301f', 3.5);
    const sp = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 6.2832 + rot, d = i % 2 ? r * .46 : r * .8; sp.push([Math.cos(a) * d - 4, Math.sin(a) * d - 5]); }
    poly(g, sp); g.fillStyle = 'rgba(245,250,255,.92)'; g.fill();
  });
  circ(g, 0, 0, 7); fs(g, '#e8f1f8', '#15301f', 2);
}
function drawPalm(g, v) {
  const R = mulberry(5 + v * 11);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(6, 10, 50, 44, 0, 0, 7); g.fill();
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = i / n * 6.2832 + R() * .3, L = 50 + R() * 8;
    g.save(); g.rotate(a);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .5, -16, L, 0); g.quadraticCurveTo(L * .5, 16, 0, 0);
    g.fillStyle = i % 2 ? '#3f9d45' : '#33893b'; g.fill(); g.lineWidth = 3; g.strokeStyle = OUT; g.stroke();
    g.beginPath(); g.moveTo(6, 0); g.lineTo(L * .85, 0); g.strokeStyle = 'rgba(20,70,30,.7)'; g.lineWidth = 1.6; g.stroke();
    g.restore();
  }
  circ(g, 0, 0, 9); fs(g, '#8a5a2c', OUT, 3);
  circ(g, -3, -3, 3); g.fillStyle = '#c28a4e'; g.fill();
}
function stumpSpr(g) {
  circ(g, 0, 0, 22); fs(g, '#9a6b38', OUT, 3);
  circ(g, 0, 0, 14); g.strokeStyle = '#6e4a24'; g.lineWidth = 2; g.stroke();
  circ(g, 0, 0, 6); g.stroke();
}
function drawStone(g, v, kind) {
  const R = mulberry(901 + v * 17);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(5, 8, 44, 38, 0, 0, 7); g.fill();
  const pts = blobPts(R, 9, 36, .14);
  poly(g, pts); fs(g, kind === 3 ? '#8aa6b8' : '#a3adb7', kind === 3 ? '#2b4756' : '#3b434b', 3.5);
  const hi = pts.slice(0, 5).map(p => [p[0] * .72 - 3, p[1] * .72 - 4]);
  poly(g, hi); g.fillStyle = kind === 3 ? '#a9c6d6' : '#c5ced6'; g.fill();
  const lo = pts.slice(5).map(p => [p[0] * .8, p[1] * .8]);
  poly(g, lo); g.fillStyle = 'rgba(40,50,60,.22)'; g.fill();
  g.strokeStyle = 'rgba(40,50,60,.45)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-10, -2); g.lineTo(-2, 8); g.lineTo(6, 4); g.stroke();
  if (kind === 2) {
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * 6.2832 + .5, d = 14 + (i % 2) * 8, x = Math.cos(a) * d, y = Math.sin(a) * d;
      poly(g, blobPts(mulberry(i + v), 6, 9, .18).map(p => [p[0] + x, p[1] + y])); fs(g, '#ffd23f', '#7a5a0c', 2.4);
      circ(g, x - 2.5, y - 2.5, 2.4); g.fillStyle = '#fff3b0'; g.fill();
    }
  } else if (kind === 3) {
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * 6.2832 + .3, d = 16 + (i % 2) * 6;
      g.save(); g.translate(Math.cos(a) * d, Math.sin(a) * d); g.rotate(a + 1.57);
      poly(g, [[0, -15], [7, -4], [5, 9], [-5, 9], [-7, -4]]); fs(g, i % 2 ? '#7be8f4' : '#a8f3fa', '#1d6a7c', 2.4);
      g.beginPath(); g.moveTo(-1, -12); g.lineTo(-3, 3); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.6; g.stroke();
      g.restore();
    }
  }
}
function drawBush(g, v, full) {
  const R = mulberry(41 + v * 5);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(4, 8, 32, 28, 0, 0, 7); g.fill();
  const cs = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832 + R(), d = 12 + R() * 6; cs.push([Math.cos(a) * d, Math.sin(a) * d, 14 + R() * 4]); }
  cs.push([0, 0, 18]);
  g.lineWidth = 7; g.strokeStyle = OUT;
  cs.forEach(c => { circ(g, c[0], c[1], c[2]); g.stroke(); });
  cs.forEach((c, i) => { circ(g, c[0], c[1], c[2]); g.fillStyle = full ? (i % 2 ? '#3f9b3d' : '#358f36') : (i % 2 ? '#7d8a45' : '#6f7b3d'); g.fill(); });
  if (full) for (let i = 0; i < 7; i++) {
    const a = R() * 6.2832, d = 4 + R() * 20, x = Math.cos(a) * d, y = Math.sin(a) * d;
    circ(g, x, y, 4.2); fs(g, '#e23b4e', '#6b1020', 1.8);
    circ(g, x - 1.3, y - 1.3, 1.2); g.fillStyle = '#ffd0d6'; g.fill();
  }
}

function plank(g, w, h, base, line, n) {
  g.fillStyle = base; g.fillRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = line; g.lineWidth = 1.8;
  for (let i = 1; i < n; i++) { const y = -h / 2 + h * i / n; g.beginPath(); g.moveTo(-w / 2, y); g.lineTo(w / 2, y); g.stroke(); }
}
function drawStruct(g, t) {
  const d = ST[t], hs = d.hs;
  g.fillStyle = 'rgba(0,0,0,.2)';
  if (t.startsWith('wall') || t === 'door') {
    const wood = t === 'wall_wood' || t === 'door', gold = t === 'wall_gold';
    g.fillRect(-hs + 3, -hs + 4, hs * 2, hs * 2);
    g.beginPath(); g.rect(-hs, -hs, hs * 2, hs * 2); g.save(); g.clip();
    if (wood) plank(g, hs * 2, hs * 2, t === 'door' ? '#b5824a' : '#a8743c', '#6e4a24', 4);
    else {
      g.fillStyle = gold ? '#e8b830' : '#a9b2bb'; g.fillRect(-hs, -hs, hs * 2, hs * 2);
      g.strokeStyle = gold ? '#8f6a10' : '#69737d'; g.lineWidth = 1.8;
      for (let r = 0; r < 4; r++) {
        const y = -hs + r * hs / 2; g.beginPath(); g.moveTo(-hs, y); g.lineTo(hs, y); g.stroke();
        for (let c = (r % 2 ? 0 : 1); c < 3; c++) { const x = -hs + c * hs * .66 + (r % 2 ? 0 : -hs * .33); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + hs / 2); g.stroke(); }
      }
      g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(-hs, -hs, hs * 2, 5);
    }
    g.restore();
    g.lineWidth = 4; g.strokeStyle = wood ? '#3d2a14' : gold ? '#5c4208' : '#3b434b'; g.strokeRect(-hs, -hs, hs * 2, hs * 2);
    if (t === 'door') { circ(g, hs * .5, 0, 5); fs(g, '#e8c25a', '#5c4208', 2); g.beginPath(); g.moveTo(-hs + 4, -hs + 14); g.lineTo(-hs + 14, -hs + 14); g.moveTo(-hs + 4, hs - 14); g.lineTo(-hs + 14, hs - 14); g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.stroke(); }
  } else if (t.startsWith('spike')) {
    const c = t === 'spike' ? ['#b88a50', '#6a4620'] : t === 'spike_stone' ? ['#b4bcc4', '#4a525a'] : ['#f0c040', '#7a5a0c'];
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(2, 4, hs, hs, 0, 0, 7); g.fill();
    for (let i = 0; i < 9; i++) {
      const x = ((i % 3) - 1) * 18, y = (Math.floor(i / 3) - 1) * 18;
      poly(g, [[x, y - 10], [x + 9, y + 8], [x - 9, y + 8]]); fs(g, c[0], c[1], 2.4);
      g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x - 2, y + 4); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.stroke();
    }
  } else if (t === 'chest') {
    g.fillRect(-hs + 3, -hs + 4, hs * 2, hs * 2);
    g.beginPath(); g.roundRect(-hs, -hs, hs * 2, hs * 2, 6); fs(g, '#a8743c', '#3d2a14', 3.5);
    g.strokeStyle = '#6e4a24'; g.lineWidth = 1.6;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-hs + 3, -hs + i * hs / 2); g.lineTo(hs - 3, -hs + i * hs / 2); g.stroke(); }
    g.fillStyle = '#8f9aa5'; g.fillRect(-hs, -6, hs * 2, 12); g.strokeStyle = '#3b434b'; g.lineWidth = 2; g.strokeRect(-hs, -6, hs * 2, 12);
    g.fillRect(-hs + 8, -hs, 8, hs * 2); g.fillRect(hs - 16, -hs, 8, hs * 2);
    circ(g, 0, 0, 6); fs(g, '#f2c230', '#5c4208', 2);
  } else if (t === 'workbench') {
    g.fillRect(-hs + 3, -hs + 4, hs * 2, hs * 2);
    g.beginPath(); g.roundRect(-hs, -hs, hs * 2, hs * 2, 5); fs(g, '#b58650', '#3d2a14', 3.5);
    g.strokeStyle = '#7a5428'; g.lineWidth = 1.6;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(-hs + 3, -hs + i * hs * .4); g.lineTo(hs - 3, -hs + i * hs * .4); g.stroke(); }
    g.save(); g.translate(-8, -4); g.rotate(-.6); g.fillStyle = '#7a5428'; g.fillRect(-2, -2, 24, 4); poly(g, [[22, -9], [32, -9], [32, 9], [22, 9]]); fs(g, '#8f9aa5', '#3b434b', 2); g.restore();
    g.save(); g.translate(10, 12); g.rotate(.3); g.fillStyle = '#d6d6d6'; g.fillRect(-14, -3, 28, 6); g.strokeStyle = '#555'; g.lineWidth = 1.5; g.strokeRect(-14, -3, 28, 6); g.restore();
  } else if (t === 'furnace') {
    g.fillRect(-hs + 3, -hs + 4, hs * 2, hs * 2);
    g.beginPath(); g.roundRect(-hs, -hs, hs * 2, hs * 2, 7); fs(g, '#8d97a1', '#2f363d', 3.5);
    g.strokeStyle = '#5d6872'; g.lineWidth = 1.6;
    for (let r = 1; r < 4; r++) { g.beginPath(); g.moveTo(-hs + 3, -hs + r * hs / 2); g.lineTo(hs - 3, -hs + r * hs / 2); g.stroke(); }
    g.beginPath(); g.roundRect(-18, -14, 36, 28, 8); fs(g, '#2a1a12', '#1b1b1b', 2.5);
    circ(g, 0, 20, 5); fs(g, '#4a525a', '#1b1b1b', 2);
  } else if (t === 'bed') {
    g.fillRect(-hs + 3, -hs * 1.4 + 4, hs * 2, hs * 2.8);
    g.beginPath(); g.roundRect(-hs, -hs * 1.4, hs * 2, hs * 2.8, 8); fs(g, '#8a5a2c', '#3d2a14', 3.5);
    g.beginPath(); g.roundRect(-hs + 5, -hs * 1.4 + 6, hs * 2 - 10, hs * 2.8 - 12, 6); fs(g, '#e56b86', '#7a2a40', 2.5);
    g.beginPath(); g.roundRect(-hs + 9, -hs * 1.4 + 9, hs * 2 - 18, 20, 6); fs(g, '#fbfbfb', '#9a9a9a', 2);
    g.strokeStyle = 'rgba(122,42,64,.6)'; g.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-hs + 9, 4 + i * 11); g.lineTo(hs - 9, 4 + i * 11); g.stroke(); }
  } else if (t === 'campfire') {
    g.beginPath(); g.ellipse(2, 4, 34, 32, 0, 0, 7); g.fill();
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.2832; poly(g, blobPts(mulberry(i + 3), 6, 8, .2).map(p => [p[0] + Math.cos(a) * 24, p[1] + Math.sin(a) * 24])); fs(g, i % 2 ? '#9aa3ad' : '#868f99', '#2f363d', 2.4);
    }
    g.save(); g.rotate(.6); g.fillStyle = '#7a5428'; g.strokeStyle = '#2d1c0c'; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(-20, -5, 40, 10, 4); g.fill(); g.stroke(); g.rotate(1.6); g.beginPath(); g.roundRect(-20, -5, 40, 10, 4); g.fill(); g.stroke(); g.restore();
  }
}

function drawTool(g, id, s) {
  const it = ITEMS[id], tier = it.tier - 1;
  const hc = ['#c28a4e', '#aab4be', '#f2c230', '#6ee3ee'][tier], hd = ['#5a3a18', '#454e57', '#7a5a0c', '#1d6a7c'][tier];
  g.save(); g.scale(s, s);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (it.pick) {
    g.fillStyle = '#9a6b38'; g.strokeStyle = '#3d2a14'; g.lineWidth = 2.6;
    g.beginPath(); g.roundRect(0, -3, 40, 6, 2.5); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(34, -20); g.quadraticCurveTo(48, -12, 44, 0); g.quadraticCurveTo(48, 12, 34, 20); g.lineTo(37, 7); g.lineTo(37, -7); g.closePath();
    fs(g, hc, hd, 2.6);
  } else {
    g.fillStyle = '#6e4a24'; g.strokeStyle = '#2d1c0c'; g.lineWidth = 2.6;
    g.beginPath(); g.roundRect(-2, -3.5, 14, 7, 3); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(10, -11, 6, 22, 2.5); fs(g, tier === 0 ? '#9a6b38' : hc, hd, 2.4);
    g.beginPath(); g.moveTo(16, -5); g.lineTo(52, -4); g.lineTo(60, 0); g.lineTo(52, 4); g.lineTo(16, 5); g.closePath();
    fs(g, tier === 0 ? '#c9965a' : hc, hd, 2.6);
    g.beginPath(); g.moveTo(20, -1.5); g.lineTo(52, -1.2); g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 1.6; g.stroke();
  }
  g.restore();
}

function drawIconArt(g, id, S) {
  const it = ITEMS[id], u = S / 56;
  g.save(); g.scale(u, u); g.translate(28, 28);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (it.k === 'tool') { g.rotate(-Math.PI / 4); g.translate(-30, 0); drawTool(g, id, .95); }
  else if (it.k === 'place') {
    const d = ST[id];
    const sc = 40 / (d.hs * 2) * (id === 'bed' ? .6 : 1);
    g.scale(sc, sc); drawStruct(g, id);
    if (id === 'campfire') { poly(g, [[0, -22], [11, 2], [0, 12], [-11, 2]]); fs(g, '#ff9a2e', '#7a2a08', 2.4); poly(g, [[0, -8], [5, 4], [0, 8], [-5, 4]]); g.fillStyle = '#ffe27a'; g.fill(); }
  } else if (id === 'wood') {
    for (let i = 0; i < 3; i++) {
      g.save(); g.translate(0, -12 + i * 12); g.rotate(i === 1 ? .08 : -.05);
      g.beginPath(); g.roundRect(-20, -6, 40, 12, 5); fs(g, '#a8743c', '#3d2a14', 2.6);
      circ(g, 20, 0, 6); fs(g, '#d3a463', '#3d2a14', 2); circ(g, 20, 0, 2.5); g.strokeStyle = '#7a5428'; g.lineWidth = 1.4; g.stroke();
      g.restore();
    }
  } else if (id === 'stone') { poly(g, blobPts(mulberry(4), 8, 20, .14)); fs(g, '#a3adb7', '#3b434b', 3); poly(g, blobPts(mulberry(4), 8, 20, .14).slice(0, 4).map(p => [p[0] * .7 - 2, p[1] * .7 - 3])); g.fillStyle = '#c5ced6'; g.fill(); }
  else if (id === 'gold') {
    [[-8, 6, 13], [9, 8, 11], [0, -9, 12]].forEach(([x, y, r], i) => { poly(g, blobPts(mulberry(i + 9), 7, r, .15).map(p => [p[0] + x, p[1] + y])); fs(g, '#ffd23f', '#7a5a0c', 2.6); circ(g, x - r * .3, y - r * .3, r * .22); g.fillStyle = '#fff3b0'; g.fill(); });
  } else if (id === 'diamond') {
    poly(g, [[0, -22], [18, -8], [10, 20], [-10, 20], [-18, -8]]); fs(g, '#7be8f4', '#1d6a7c', 3);
    poly(g, [[0, -22], [8, -8], [0, 20], [-8, -8]]); g.fillStyle = '#c4f9fd'; g.fill();
    g.beginPath(); g.moveTo(-18, -8); g.lineTo(18, -8); g.strokeStyle = '#1d6a7c'; g.lineWidth = 2; g.stroke();
  } else if (id === 'fur') {
    poly(g, blobPts(mulberry(12), 12, 20, .22)); fs(g, '#b98a5b', '#4a2f14', 2.8);
    g.strokeStyle = '#8a5f33'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-14 + i * 7, -8); g.lineTo(-10 + i * 7, 8); g.stroke(); }
  } else if (id === 'berry') {
    [[-8, 4], [8, 6], [0, -8], [-2, 10]].forEach(([x, y]) => { circ(g, x, y, 9); fs(g, '#e23b4e', '#6b1020', 2.4); circ(g, x - 3, y - 3, 2.4); g.fillStyle = '#ffd0d6'; g.fill(); });
    poly(g, [[-2, -18], [8, -14], [2, -8]]); fs(g, '#3f9b3d', '#1f4d1e', 2);
  } else if (id === 'meat' || id === 'cooked') {
    const c = id === 'meat' ? ['#e06a6a', '#7a2020'] : ['#b5622f', '#4a2410'];
    g.rotate(-.6);
    g.beginPath(); g.ellipse(0, -4, 20, 14, 0, 0, 7); fs(g, c[0], c[1], 3);
    g.beginPath(); g.moveTo(14, 6); g.lineTo(28, 16); g.strokeStyle = '#f2ecd8'; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#7a7058'; g.lineWidth = 2; g.stroke();
    circ(g, 30, 18, 5); fs(g, '#f2ecd8', '#7a7058', 2);
    g.beginPath(); g.ellipse(-5, -8, 9, 5, -.3, 0, 7); g.fillStyle = 'rgba(255,255,255,.3)'; g.fill();
  } else if (id === 'hat') {
    circ(g, 0, 2, 20); fs(g, '#8a5f33', '#3d2a14', 3); circ(g, 0, 2, 11); fs(g, '#e9dcc4', '#3d2a14', 2.4);
    circ(g, 0, -6, 6); fs(g, '#f6f0e4', '#3d2a14', 2);
  } else if (id === 'coat') {
    poly(g, [[-22, -14], [-10, -22], [10, -22], [22, -14], [26, 6], [14, 8], [14, 22], [-14, 22], [-14, 8], [-26, 6]]); fs(g, '#8a5f33', '#3d2a14', 3);
    poly(g, [[-10, -22], [0, -8], [10, -22]]); fs(g, '#f1e8d4', '#3d2a14', 2.4);
    g.beginPath(); g.moveTo(0, -8); g.lineTo(0, 22); g.strokeStyle = '#3d2a14'; g.lineWidth = 2; g.stroke();
  } else if (id === 'bag') {
    g.beginPath(); g.roundRect(-18, -12, 36, 32, 10); fs(g, '#b9763a', '#4a2a10', 3);
    g.beginPath(); g.roundRect(-18, -12, 36, 12, 6); fs(g, '#d49554', '#4a2a10', 2.6);
    g.beginPath(); g.arc(0, -14, 9, Math.PI, 0); g.strokeStyle = '#4a2a10'; g.lineWidth = 3; g.stroke();
    circ(g, 0, -1, 3.4); fs(g, '#f2c230', '#5c4208', 1.6);
  }
  g.restore();
}

const iconCache = {};
function iconUrl(id) {
  if (iconCache[id]) return iconCache[id];
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  drawIconArt(c.getContext('2d'), id, 96);
  return iconCache[id] = c.toDataURL();
}

const SKIN_OUT = '#3a2a1c';
function drawPlayerBody(g, p, t, swing) {
  const moving = Math.hypot(p.vx || 0, p.vy || 0) > 14;
  const bob = moving ? Math.sin(t * 14) * 2 : 0;
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(3, 5, 26, 24, 0, 0, 7); g.fill();
  const sw = swing > 0 ? Math.sin((1 - swing) * Math.PI) : 0;
  const hold = p.tool;
  const hx = 25 + sw * 14, hy = 16 - sw * 6;
  if (hold) {
    g.save(); g.translate(hx, hy); g.rotate(-1.15 + (1 - Math.min(1, swing * 1.4)) * 0 + (swing > 0 ? (swing - .5) * 2.3 : 0));
    drawTool(g, hold, .92); g.restore();
  }
  circ(g, hx, hy, 8.5); fs(g, p.color, SKIN_OUT, 3);
  circ(g, 25 - sw * 2, -16 + bob * .3, 8.5); fs(g, p.color, SKIN_OUT, 3);
  circ(g, 0, 0, 24); fs(g, p.body ? '#8a5f33' : p.color, SKIN_OUT, 3.5);
  if (p.body) {
    g.strokeStyle = '#f1e8d4'; g.lineWidth = 4; circ(g, 0, 0, 21); g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]);
    circ(g, 0, 0, 12); g.fillStyle = 'rgba(0,0,0,.14)'; g.fill();
  }
  if (p.head) { circ(g, -1, 0, 15.5); fs(g, '#8a5f33', SKIN_OUT, 3); circ(g, -1, 0, 8.5); fs(g, '#efe3cc', SKIN_OUT, 2.2); }
  else {
    circ(g, 10, -7, 3.2); g.fillStyle = '#222'; g.fill(); circ(g, 10, 7, 3.2); g.fill();
    circ(g, 11, -7.8, 1); g.fillStyle = '#fff'; g.fill(); circ(g, 11, 6.2, 1); g.fill();
  }
}

function drawAnimal(g, a, t) {
  const k = a.k, w = Math.sin(a.anim * 3.2);
  if (k === 'rabbit') {
    const white = a.w, c = white ? '#f2f6f8' : '#bda58a', d = white ? '#7f8d96' : '#4d3c2a';
    g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(2, 4, 17, 13, 0, 0, 7); g.fill();
    const hop = Math.abs(w) * 3;
    g.beginPath(); g.ellipse(-3, 0, 14, 11, 0, 0, 7); fs(g, c, d, 2.6);
    circ(g, -17, 0, 4.5); fs(g, '#fff', d, 2);
    g.beginPath(); g.ellipse(7, -7 - hop * .2, 8, 3.6, -.5, 0, 7); fs(g, c, d, 2.2);
    g.beginPath(); g.ellipse(7, 7 + hop * .2, 8, 3.6, .5, 0, 7); fs(g, c, d, 2.2);
    circ(g, 8, 0, 8); fs(g, c, d, 2.4);
    circ(g, 12, -3.5, 1.9); g.fillStyle = '#111'; g.fill(); circ(g, 12, 3.5, 1.9); g.fill();
    circ(g, 16, 0, 1.8); g.fillStyle = '#e8869a'; g.fill();
  } else if (k === 'wolf') {
    const c = a.w ? '#e6edf2' : '#8c929c', d = a.w ? '#6a7a86' : '#2f343c', c2 = a.w ? '#ffffff' : '#a9aeb8';
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(3, 6, 32, 20, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-24, 0); g.quadraticCurveTo(-40, w * 8, -36, w * 14); g.lineWidth = 9; g.strokeStyle = d; g.stroke(); g.lineWidth = 5; g.strokeStyle = c; g.stroke();
    for (const [lx, ly, ph] of [[10, -13, 0], [10, 13, 3.14], [-12, -13, 3.14], [-12, 13, 0]]) { circ(g, lx + Math.sin(a.anim * 3.2 + ph) * 7, ly, 5.5); fs(g, c, d, 2.2); }
    g.beginPath(); g.ellipse(-3, 0, 26, 15, 0, 0, 7); fs(g, c, d, 3);
    g.beginPath(); g.ellipse(-3, -3, 18, 7, 0, 0, 7); g.fillStyle = c2; g.fill();
    poly(g, [[14, -9], [20, -17], [25, -8]]); fs(g, c, d, 2.2); poly(g, [[14, 9], [20, 17], [25, 8]]); fs(g, c, d, 2.2);
    circ(g, 26, 0, 12); fs(g, c, d, 3);
    g.beginPath(); g.ellipse(36, 0, 7, 5.4, 0, 0, 7); fs(g, c2, d, 2.2);
    circ(g, 41, 0, 2.6); g.fillStyle = '#111'; g.fill();
    circ(g, 29, -6, 2.4); g.fillStyle = a.mode === 2 ? '#ff4040' : '#ffd23f'; g.fill(); circ(g, 29, 6, 2.4); g.fill();
  } else if (k === 'spider') {
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(3, 5, 26, 22, 0, 0, 7); g.fill();
    g.strokeStyle = '#2a1c33'; g.lineWidth = 4; g.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const side = i < 4 ? -1 : 1, j = i % 4, ph = Math.sin(a.anim * 3.2 + j * 1.6 + (side > 0 ? 1.5 : 0)) * 6;
      const ba = (-0.9 + j * .62) * 1, x0 = 6 - j * 5, bx = x0 + Math.cos(ba) * 12, by = side * (10 + Math.abs(Math.sin(ba)) * 14);
      g.beginPath(); g.moveTo(x0, side * 6); g.lineTo(bx + ph * .3, by + side * 6); g.lineTo(bx + (j - 1.5) * 9 + ph, side * 30); g.stroke();
    }
    circ(g, -14, 0, 15); fs(g, '#4a2f66', '#1d1226', 3);
    circ(g, -16, -4, 4); g.fillStyle = '#7a56a0'; g.fill();
    circ(g, 6, 0, 10); fs(g, '#5d3a80', '#1d1226', 3);
    circ(g, 12, -4, 2.8); g.fillStyle = '#ff4a4a'; g.fill(); circ(g, 12, 4, 2.8); g.fill(); circ(g, 15, 0, 1.8); g.fill();
  } else if (k === 'dragon') {
    const fl = Math.sin(t * 5) * .12;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(6, 12, 80, 50, 0, 0, 7); g.fill();
    for (let i = 5; i >= 0; i--) { const sx = -44 - i * 20, sy = Math.sin(a.anim * 2 + i * .7) * 9 * (i + 1) / 4, r = 20 - i * 2.4; circ(g, sx, sy, r); fs(g, '#3d9a8a', '#16403a', 3); if (i % 2) { poly(g, [[sx - 3, sy - r], [sx + 4, sy - r - 9], [sx + 7, sy - r + 1]]); fs(g, '#d8f3ee', '#16403a', 2); } }
    for (const s of [-1, 1]) {
      g.save(); g.translate(-6, s * 22); g.rotate(s * (.5 + fl + Math.sin(a.anim * 2) * .08));
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, s * 60); g.lineTo(10, s * 52); g.lineTo(30, s * 62); g.lineTo(34, s * 24); g.closePath(); fs(g, '#4fb5a2', '#16403a', 3.4);
      g.strokeStyle = '#16403a'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(-30, s * 60); g.moveTo(0, 0); g.lineTo(10, s * 52); g.moveTo(0, 0); g.lineTo(30, s * 62); g.stroke();
      g.restore();
    }
    g.beginPath(); g.ellipse(-4, 0, 48, 28, 0, 0, 7); fs(g, '#3d9a8a', '#16403a', 3.6);
    g.beginPath(); g.ellipse(-2, 0, 38, 14, 0, 0, 7); g.fillStyle = '#d8f3ee'; g.fill();
    for (let i = 0; i < 5; i++) { poly(g, [[-30 + i * 14, -26], [-24 + i * 14, -36], [-18 + i * 14, -26]]); fs(g, '#d8f3ee', '#16403a', 2); }
    circ(g, 52, 0, 20); fs(g, '#46a898', '#16403a', 3.6);
    g.beginPath(); g.ellipse(68, 0, 15, 11, 0, 0, 7); fs(g, '#3d9a8a', '#16403a', 3);
    poly(g, [[44, -14], [34, -34], [54, -22]]); fs(g, '#f2e9c8', '#16403a', 2.4); poly(g, [[44, 14], [34, 34], [54, 22]]); fs(g, '#f2e9c8', '#16403a', 2.4);
    circ(g, 56, -10, 4.4); g.fillStyle = '#ffd23f'; g.fill(); circ(g, 56, 10, 4.4); g.fill();
    circ(g, 57, -10, 1.8); g.fillStyle = '#c00'; g.fill(); circ(g, 57, 10, 1.8); g.fill();
    circ(g, 76, -4, 2); g.fillStyle = '#16403a'; g.fill(); circ(g, 76, 4, 2); g.fill();
  }
}

function makeTerrainTex(W) {
  const c = document.createElement('canvas');
  c.width = c.height = TN;
  const g = c.getContext('2d'), im = g.createImageData(TN, TN), d = im.data;
  const pal = [[108, 188, 66], [234, 243, 248], [238, 218, 152], [84, 174, 232], [56, 138, 206]];
  const T = W.terr, wat = t => t >= TWA;
  for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) {
    const t = T[j * TN + i], b = pal[t];
    const n = (vnoise(i / 18, j / 18, 5) - .5) * 16 + (hash2(i, j, 3) - .5) * 7;
    let r = b[0] + n, gg = b[1] + n, bl = b[2] + n * .8;
    const l = i > 0 ? T[j * TN + i - 1] : t, rt = i < TN - 1 ? T[j * TN + i + 1] : t, u = j > 0 ? T[(j - 1) * TN + i] : t, dn = j < TN - 1 ? T[(j + 1) * TN + i] : t;
    if (wat(t)) {
      if (!wat(l) || !wat(rt) || !wat(u) || !wat(dn)) { r = 176; gg = 230; bl = 248; }
      else if (t === TDP) { const w = Math.sin((i + j) * .35 + vnoise(i / 9, j / 9, 8) * 6) * 5; r += w; gg += w; bl += w; }
    } else if (wat(l) || wat(rt) || wat(u) || wat(dn)) { const k = t === TS ? .8 : .7; r *= k; gg *= k; bl *= k; }
    else if (t !== l || t !== rt || t !== u || t !== dn) { if (t === TW || l === TW || rt === TW || u === TW || dn === TW) { r = 214; gg = 236; bl = 226; } }
    const o = (j * TN + i) * 4;
    d[o] = r; d[o + 1] = gg; d[o + 2] = bl; d[o + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}

const FXL = [];
const SNDS = {};
function mkAudio(api) {
  let ac = null;
  const ctx = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; };
  const tone = (f, d, type, v, f2, delay) => {
    const a = ctx(); if (!a || api.muted) return;
    const t = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v || .06, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .03);
  };
  const noise = (d, v, lo, hi) => {
    const a = ctx(); if (!a || api.muted) return;
    const n = Math.floor(a.sampleRate * d), buf = a.createBuffer(1, n, a.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'bandpass'; f.frequency.value = lo; f.Q.value = hi || 1; g.gain.value = v;
    s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start();
  };
  return {
    play(k, near) {
      const q = near == null ? 1 : near;
      if (q <= 0) return;
      switch (k) {
        case 'hit': noise(.12, .35 * q, 300, 1.2); tone(120, .1, 'triangle', .08 * q, 60); break;
        case 'harv': noise(.1, .3 * q, 700, 2); tone(220, .06, 'square', .03 * q, 130); break;
        case 'clank': tone(900, .1, 'square', .04 * q, 700); noise(.05, .2 * q, 2500, 3); break;
        case 'swing': noise(.1, .1 * q, 1400, .8); break;
        case 'eat': tone(300, .06, 'square', .04, 200); tone(260, .06, 'square', .04, 180, .09); tone(320, .05, 'square', .03, 220, .17); break;
        case 'drink': tone(500, .09, 'sine', .06, 800); tone(600, .09, 'sine', .05, 900, .1); break;
        case 'craft': tone(520, .09, 'triangle', .06); tone(780, .12, 'triangle', .06, null, .08); break;
        case 'place': tone(110, .12, 'triangle', .1 * q, 70); noise(.08, .2 * q, 400, 1); break;
        case 'hurt': tone(160, .2, 'sawtooth', .07, 70); noise(.12, .25, 500, 1); break;
        case 'bite': tone(240, .08, 'sawtooth', .06 * q, 120); noise(.08, .2 * q, 900, 2); break;
        case 'roar': tone(90, .6, 'sawtooth', .1 * q, 55); noise(.5, .2 * q, 200, .7); break;
        case 'door': tone(180, .12, 'square', .04 * q, 120); break;
        case 'fire': noise(.25, .12 * q, 1800, 1); break;
        case 'break': noise(.3, .35 * q, 350, .8); tone(90, .25, 'triangle', .1 * q, 40); break;
        case 'pick': tone(900, .06, 'sine', .04, 1300); break;
        case 'death': tone(300, .6, 'sawtooth', .08, 60); break;
        case 'kill': tone(200, .1, 'triangle', .06 * q, 90); break;
        case 'boom': noise(.4, .3 * q, 250, .7); tone(70, .35, 'sawtooth', .08 * q, 40); break;
        case 'sleep': tone(330, .5, 'sine', .04, 220); break;
        case 'day': tone(392, .25, 'triangle', .06); tone(523, .25, 'triangle', .06, null, .2); tone(659, .4, 'triangle', .06, null, .4); break;
      }
    },
    close() { try { if (ac) ac.close(); } catch (e) {} ac = null; }
  };
}

class Renderer {
  constructor(canvas, minimap, W) {
    this.cv = canvas; this.g = canvas.getContext('2d');
    this.mm = minimap; this.mg = minimap.getContext('2d');
    this.W = W;
    this.tex = makeTerrainTex(W);
    this.dk = document.createElement('canvas'); this.dg = this.dk.getContext('2d');
    this.cam = { x: 2000, y: 2000 };
    this.parts = [];
    this.snow = [];
    for (let i = 0; i < 90; i++) this.snow.push({ x: Math.random(), y: Math.random(), s: .3 + Math.random() * .7 });
    this.k = 1; this.t = 0; this.shake = 0; this.mmT = 0;
    this.noteT = 0;
    this.touch = false;
  }

  resize(w, h, touch) {
    this.cv.width = w; this.cv.height = h;
    const vw = touch ? 760 : 1180, vh = touch ? 560 : 664;
    this.k = Math.min(w / vw, h / vh);
    this.dk.width = Math.ceil(w / 4); this.dk.height = Math.ceil(h / 4);
    this.touch = touch;
  }

  fx(f, me, audio) {
    const [t, x, y, v] = f, n = FXN[t];
    const d = me ? Math.hypot(me.x - x, me.y - y) : 0;
    const near = clamp(1 - d / 900, 0, 1);
    if (audio) audio.play(n, near);
    const P = this.parts;
    const burst = (cnt, col, sp, life, r) => { for (let i = 0; i < cnt; i++) { const a = Math.random() * 6.283, s = sp * (.4 + Math.random()); P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: life * (.6 + Math.random() * .6), m: life, c: col, r: r * (.6 + Math.random() * .8), ty: 0 }); } };
    if (n === 'hit') burst(6, v === 1 ? '#c8a070' : v === 2 ? '#c03030' : '#ff5a5a', 120, .4, 4);
    else if (n === 'harv') burst(7, ['#4aa84a', '#b0b8c0', '#f2c230', '#6ee3ee', '#d03a4c'][v] || '#ccc', 130, .5, 4);
    else if (n === 'num') P.push({ x, y, vx: 0, vy: -50, l: .8, m: .8, c: '#ff5a5a', s: String(v), ty: 1 });
    else if (n === 'boom') burst(16, '#ffa23a', 220, .6, 6);
    else if (n === 'kill') burst(10, '#ffffff', 180, .5, 4);
    else if (n === 'break') burst(14, '#b08850', 200, .6, 5);
    else if (n === 'death') burst(18, '#ff3a3a', 200, .8, 5);
    else if (n === 'craft') burst(8, '#ffe27a', 90, .7, 3);
    else if (n === 'drink') burst(6, '#7fd0ff', 70, .5, 3);
    else if (n === 'eat') burst(5, '#ff9a5a', 60, .5, 3);
    else if (n === 'place') burst(6, '#d8c8a0', 80, .4, 4);
    else if (n === 'fire') burst(6, '#ffb84a', 70, .6, 3);
    else if (n === 'pick') burst(4, '#fff3b0', 60, .4, 3);
    else if (n === 'sleep') P.push({ x, y: y - 30, vx: 10, vy: -20, l: 1.4, m: 1.4, c: '#bcd0ff', s: 'Z', ty: 1 });
    if (n === 'hurt' || (n === 'bite' && me && d < 60)) this.shake = .25;
  }

  draw(v, dt, audio) {
    const g = this.g, W = this.W, cw = this.cv.width, ch = this.cv.height, k = this.k;
    this.t += dt;
    const me = v.me, tgt = v.cam || me;
    if (tgt) {
      const dx = tgt.x - this.cam.x, dy = tgt.y - this.cam.y;
      if (Math.hypot(dx, dy) > 700) { this.cam.x = tgt.x; this.cam.y = tgt.y; }
      else { const a = Math.min(1, dt * 9); this.cam.x += dx * a; this.cam.y += dy * a; }
    }
    this.shake = Math.max(0, this.shake - dt);
    const sx = this.shake > 0 ? (Math.random() - .5) * 8 * this.shake * 4 : 0, sy = this.shake > 0 ? (Math.random() - .5) * 8 * this.shake * 4 : 0;
    const cx = this.cam.x + sx, cy = this.cam.y + sy;
    const hw = cw / k / 2, hh = ch / k / 2;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#2d6f98'; g.fillRect(0, 0, cw, ch);
    g.setTransform(k, 0, 0, k, cw / 2 - cx * k, ch / 2 - cy * k);
    g.imageSmoothingEnabled = true;
    const x0 = Math.max(0, cx - hw), y0 = Math.max(0, cy - hh), x1 = Math.min(WORLD, cx + hw), y1 = Math.min(WORLD, cy + hh);
    if (x1 > x0 && y1 > y0) g.drawImage(this.tex, x0 / TC, y0 / TC, (x1 - x0) / TC, (y1 - y0) / TC, x0, y0, x1 - x0, y1 - y0);
    this.decor(g, cx, cy, hw, hh, v.time);
    const pad = 130, vis = (x, y, r) => x + r > cx - hw - pad && x - r < cx + hw + pad && y + r > cy - hh - pad && y - r < cy + hh + pad;
    const t = this.t;
    for (const d of v.drops) {
      if (!vis(d.x, d.y, 30)) continue;
      const bob = Math.sin(t * 3 + d.id) * 2;
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(d.x + 2, d.y + 8, 14, 7, 0, 0, 7); g.fill();
      g.drawImage(iconImg(d.i), d.x - 17, d.y - 17 + bob, 34, 34);
      if (d.n > 1) { g.font = '700 12px sans-serif'; g.textAlign = 'right'; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(d.n, d.x + 18, d.y + 18 + bob); g.fillStyle = '#fff'; g.fillText(d.n, d.x + 18, d.y + 18 + bob); }
    }
    const low = [], high = [];
    for (const s of v.structs) { if (!vis(s.x, s.y, 80)) continue; (ST[s.t].solid ? high : low).push(s); }
    for (const s of low) this.struct(g, s, t);
    const sprRes = (o) => {
      const kind = RK[o.k];
      let c, sc = o.sz;
      if (o.left <= 0) { if (o.k !== 0) return; c = spr('stump', 56, 56, stumpSpr); sc = o.sz * .9; }
      else if (o.k === 0) { const b = o.b === TW ? 'pine' : o.b === TS ? 'palm' : 'oak'; c = spr(b + o.v, 140, 140, gg => (b === 'pine' ? drawPine : b === 'palm' ? drawPalm : drawOak)(gg, o.v)); }
      else if (o.k === 4) c = spr('bush' + o.v, 80, 80, gg => drawBush(gg, o.v, true));
      else c = spr(kind + o.v, 100, 100, gg => drawStone(gg, o.v, o.k));
      if (o.hit > 0) sc *= 1 + Math.sin(o.hit * 30) * .06;
      blit(g, c, o.x, o.y, sc);
    };
    const cells = [];
    W.grid.each(cx, cy, Math.hypot(hw, hh) + 40, o => { if (vis(o.x, o.y, 70)) cells.push(o); });
    cells.sort((a, b) => (a.k === 0) - (b.k === 0) || a.y - b.y);
    for (const o of cells) sprRes(o);
    for (const s of high) this.struct(g, s, t);
    for (const a of v.animals) {
      if (!vis(a.x, a.y, 90)) continue;
      g.save(); g.translate(a.x, a.y); g.rotate(a.a);
      if (a.flash > 0) g.globalAlpha = .55 + Math.sin(a.flash * 60) * .3;
      drawAnimal(g, a, t); g.restore();
    }
    for (const p of v.players) {
      if (!p.alive || !vis(p.x, p.y, 60)) continue;
      g.save(); g.translate(p.x, p.y); g.rotate(p.a);
      if (p.hurt > 0) g.globalAlpha = .6;
      if (p.sleeping) { g.globalAlpha = .9; g.rotate(1.3 - p.a + p.a); }
      drawPlayerBody(g, p, t, p.swing);
      g.restore();
    }
    for (const q of v.projs) {
      if (!vis(q.x, q.y, 40)) continue;
      const r = 17 + Math.sin(t * 20 + q.id) * 3;
      const gr = g.createRadialGradient(q.x, q.y, 2, q.x, q.y, r * 2);
      gr.addColorStop(0, 'rgba(255,240,150,1)'); gr.addColorStop(.35, 'rgba(255,150,40,.9)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, r * 2, 0, 6.283); g.fill();
    }
    this.particles(g, dt);
    this.darkness(g, v, cx, cy, hw, hh, cw, ch, k);
    g.setTransform(k, 0, 0, k, cw / 2 - cx * k, ch / 2 - cy * k);
    g.textAlign = 'center';
    for (const p of v.players) {
      if (!p.alive || !vis(p.x, p.y, 60)) continue;
      g.font = '700 13px sans-serif'; g.lineWidth = 3.5; g.strokeStyle = 'rgba(0,0,0,.65)'; g.fillStyle = p === me ? '#ffe9a8' : '#fff';
      g.strokeText(p.name, p.x, p.y - 38); g.fillText(p.name, p.x, p.y - 38);
      if (p !== me && p.hp < 100) this.bar(g, p.x, p.y - 33, 40, p.hp / 100, '#e84a4a');
    }
    for (const a of v.animals) {
      if (!vis(a.x, a.y, 90) || a.hp >= a.mhp) continue;
      this.bar(g, a.x, a.y - AN[a.k].r - 12, Math.max(30, AN[a.k].r * 1.6), a.hp / a.mhp, a.k === 'dragon' ? '#d84a4a' : '#e8a24a');
    }
    for (const s of v.structs) {
      const d = ST[s.t];
      if (s.hp < d.hp && vis(s.x, s.y, 60)) this.bar(g, s.x, s.y - d.hs - 8, d.hs * 1.4, s.hp / d.hp, '#e8c24a');
    }
    for (const q of this.parts) {
      if (q.ty !== 1) continue;
      g.globalAlpha = Math.min(1, q.l / q.m * 1.6);
      g.font = '800 17px sans-serif'; g.lineWidth = 4; g.strokeStyle = '#000'; g.strokeText(q.s, q.x, q.y); g.fillStyle = q.c; g.fillText(q.s, q.x, q.y);
      g.globalAlpha = 1;
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    this.weather(g, v, cw, ch, dt);
    if (this.mmT <= 0) { this.mmT = .2; this.minimap(v); } else this.mmT -= dt;
  }

  bar(g, x, y, w, f, c) {
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x - w / 2 - 1.5, y - 1.5, w + 3, 7);
    g.fillStyle = c; g.fillRect(x - w / 2, y, w * clamp(f, 0, 1), 4);
  }

  struct(g, s, t) {
    const d = ST[s.t], hs = d.hs;
    if (s.t === 'door' && s.open) {
      const c = spr('st_door', hs * 2 + 16, hs * 2 + 16, gg => drawStruct(gg, 'door'));
      g.globalAlpha = .9; g.drawImage(c, s.x - hs - 8, s.y - hs - 8, c._w * .22, c._h); g.globalAlpha = 1;
      g.strokeStyle = 'rgba(60,40,20,.35)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.strokeRect(s.x - hs, s.y - hs, hs * 2, hs * 2); g.setLineDash([]);
      return;
    }
    const c = spr('st_' + s.t, hs * 2 + 16, (s.t === 'bed' ? hs * 2.8 : hs * 2) + 16, gg => drawStruct(gg, s.t));
    blit(g, c, s.x, s.y);
    if (s.t === 'campfire') {
      if (s.fuel > 0) {
        const f = 1 + Math.sin(t * 17 + s.id) * .12 + Math.sin(t * 29) * .08;
        g.save(); g.translate(s.x, s.y); g.scale(f, f);
        poly(g, [[0, -26], [12, -4], [8, 12], [-8, 12], [-12, -4]]); fs(g, '#ff7a1a', '#8a2a05', 2.4);
        poly(g, [[0, -16], [7, -2], [4, 9], [-4, 9], [-7, -2]]); g.fillStyle = '#ffc24a'; g.fill();
        poly(g, [[0, -6], [3, 2], [0, 7], [-3, 2]]); g.fillStyle = '#fff3b0'; g.fill();
        g.restore();
      } else { circ(g, s.x, s.y, 12); g.fillStyle = '#3a3a3a'; g.fill(); }
    } else if (s.t === 'furnace') {
      const f = .85 + Math.sin(t * 14 + s.id) * .15;
      g.save(); g.translate(s.x, s.y); g.scale(f, f);
      poly(g, [[0, -10], [8, 2], [4, 10], [-4, 10], [-8, 2]]); fs(g, '#ff8a2a', '#8a2a05', 1.6);
      poly(g, [[0, -3], [3, 3], [0, 7], [-3, 3]]); g.fillStyle = '#ffe27a'; g.fill();
      g.restore();
    }
  }

  decor(g, cx, cy, hw, hh, time) {
    const W = this.W, step = 96;
    const gx0 = Math.floor((cx - hw) / step) - 1, gx1 = Math.floor((cx + hw) / step) + 1, gy0 = Math.floor((cy - hh) / step) - 1, gy1 = Math.floor((cy + hh) / step) + 1;
    g.lineCap = 'round';
    const tf = [], tw = [], tp = [], tsd = [];
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const h = hash2(gx, gy, 77);
      if (h > .6) continue;
      const x = gx * step + hash2(gx, gy, 5) * step, y = gy * step + hash2(gx, gy, 6) * step;
      if (x < 0 || y < 0 || x >= WORLD || y >= WORLD) continue;
      const t = W.at(x, y);
      if (t === TF) tf.push(x, y, h); else if (t === TW) tw.push(x, y, h); else if (t === TS) tsd.push(x, y, h); else tp.push(x, y, h, t);
    }
    g.strokeStyle = 'rgba(40,110,40,.55)'; g.lineWidth = 2.4; g.beginPath();
    for (let i = 0; i < tf.length; i += 3) { const x = tf[i], y = tf[i + 1]; g.moveTo(x - 6, y + 4); g.lineTo(x - 8, y - 5); g.moveTo(x, y + 4); g.lineTo(x, y - 9); g.moveTo(x + 6, y + 4); g.lineTo(x + 9, y - 4); }
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)';
    for (let i = 0; i < tf.length; i += 3) if (tf[i + 2] < .1) { circ(g, tf[i] + 14, tf[i + 1] + 6, 2.6); g.fill(); }
    g.strokeStyle = 'rgba(150,185,205,.7)'; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < tw.length; i += 3) { const x = tw[i], y = tw[i + 1]; g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.moveTo(x - 5, y - 5); g.lineTo(x + 5, y + 5); g.moveTo(x - 5, y + 5); g.lineTo(x + 5, y - 5); }
    g.stroke();
    g.fillStyle = 'rgba(160,130,70,.5)';
    for (let i = 0; i < tsd.length; i += 3) { g.beginPath(); g.ellipse(tsd[i], tsd[i + 1], 5, 3, tsd[i + 2] * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2.2; g.beginPath();
    for (let i = 0; i < tp.length; i += 4) {
      const x = tp[i], y = tp[i + 1], ph = this.t * 1.4 + tp[i + 2] * 20, w = 9 + Math.sin(ph) * 3;
      g.moveTo(x - w, y); g.quadraticCurveTo(x - w / 2, y - 4, x, y); g.quadraticCurveTo(x + w / 2, y + 4, x + w, y);
    }
    g.stroke();
  }

  particles(g, dt) {
    const P = this.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const q = P[i];
      q.l -= dt;
      if (q.l <= 0) { P.splice(i, 1); continue; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .94; q.vy *= .94;
      if (q.ty) continue;
      g.globalAlpha = Math.min(1, q.l / q.m * 1.5);
      g.fillStyle = q.c; circ(g, q.x, q.y, q.r); g.fill();
    }
    g.globalAlpha = 1;
    if (P.length > 400) P.splice(0, P.length - 400);
  }

  darkness(g, v, cx, cy, hw, hh, cw, ch, k) {
    const d = darkOf(v.time);
    if (d <= .01) return;
    const dk = this.dk, dg = this.dg, f = dk.width / cw;
    dg.globalCompositeOperation = 'source-over';
    dg.setTransform(1, 0, 0, 1, 0, 0);
    dg.clearRect(0, 0, dk.width, dk.height);
    const warm = [255, 120, 50], night = [10, 14, 46];
    const col = warm.map((w, i) => Math.round(lerp(w, night[i], Math.min(1, d * 1.3))));
    dg.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(d * .84).toFixed(3)})`;
    dg.fillRect(0, 0, dk.width, dk.height);
    dg.globalCompositeOperation = 'destination-out';
    dg.setTransform(k * f, 0, 0, k * f, dk.width / 2 - cx * k * f, dk.height / 2 - cy * k * f);
    const light = (x, y, r, a) => {
      if (x < cx - hw - r || x > cx + hw + r || y < cy - hh - r || y > cy + hh + r) return;
      const gr = dg.createRadialGradient(x, y, r * .08, x, y, r);
      gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(.55, `rgba(0,0,0,${a * .55})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      dg.fillStyle = gr; dg.beginPath(); dg.arc(x, y, r, 0, 6.283); dg.fill();
    };
    for (const p of v.players) if (p.alive) light(p.x, p.y, p === v.me ? 190 : 120, p === v.me ? .85 : .6);
    for (const s of v.structs) {
      if (s.t === 'campfire' && s.fuel > 0) light(s.x, s.y, 300 + Math.sin(this.t * 11 + s.id) * 14, 1);
      else if (s.t === 'furnace') light(s.x, s.y, 190, .9);
    }
    for (const q of v.projs) light(q.x, q.y, 170, .9);
    for (const a of v.animals) if (a.k === 'dragon') light(a.x, a.y, 150, .5);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(dk, 0, 0, cw, ch);
    g.setTransform(k, 0, 0, k, cw / 2 - cx * k, ch / 2 - cy * k);
    g.globalCompositeOperation = 'lighter';
    for (const s of v.structs) {
      if (s.t === 'campfire' && s.fuel > 0 && s.x > cx - hw - 300 && s.x < cx + hw + 300 && s.y > cy - hh - 300 && s.y < cy + hh + 300) {
        const r = 260 + Math.sin(this.t * 11 + s.id) * 12;
        const gr = g.createRadialGradient(s.x, s.y, 10, s.x, s.y, r);
        gr.addColorStop(0, `rgba(255,150,50,${.3 * d})`); gr.addColorStop(1, 'rgba(255,100,20,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(s.x, s.y, r, 0, 6.283); g.fill();
      }
    }
    g.globalCompositeOperation = 'source-over';
  }

  weather(g, v, cw, ch, dt) {
    const me = v.me;
    if (!me || this.W.at(me.x, me.y) !== TW) return;
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (const s of this.snow) {
      s.y += dt * (.12 + s.s * .16); s.x += dt * (.03 + Math.sin(this.t + s.s * 9) * .02);
      if (s.y > 1) { s.y = 0; s.x = Math.random(); }
      if (s.x > 1) s.x = 0;
      g.globalAlpha = .4 + s.s * .5;
      g.beginPath(); g.arc(s.x * cw, s.y * ch, 1.5 + s.s * 2.2, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }

  minimap(v) {
    const g = this.mg, S = this.mm.width, W = this.W;
    g.clearRect(0, 0, S, S);
    g.imageSmoothingEnabled = true;
    g.drawImage(this.tex, 0, 0, S, S);
    const f = S / WORLD;
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, S, S);
    for (const s of v.structs) { g.fillStyle = s.own === (v.me && v.me.id) ? '#fff' : 'rgba(255,255,255,.5)'; if (s.t === 'campfire' || s.t === 'workbench' || s.t === 'furnace' || s.t === 'bed') g.fillRect(s.x * f - 1, s.y * f - 1, 3, 3); }
    for (const p of v.players) if (p.alive && p !== v.me) { g.fillStyle = '#ffd23f'; g.fillRect(p.x * f - 1.5, p.y * f - 1.5, 3, 3); }
    for (const a of v.animals) if (a.k === 'dragon') { g.fillStyle = '#ff4a4a'; g.fillRect(a.x * f - 2, a.y * f - 2, 4, 4); }
    if (v.me) { g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath(); g.arc(v.me.x * f, v.me.y * f, 3.4, 0, 6.283); g.fill(); g.stroke(); }
  }
}

const iconImgs = {};
function iconImg(id) {
  let im = iconImgs[id];
  if (!im) { im = iconImgs[id] = new Image(); im.src = iconUrl(id); }
  return im;
}

const CSS = `.gm-starve{gap:0}
.gm-starve .sv-wrap{position:relative;max-width:100%;touch-action:none;-webkit-user-select:none;user-select:none;border-radius:var(--r);overflow:hidden;background:#2d6f98;box-shadow:0 0 0 1px var(--line);font-family:var(--sans);color:#fff}
.gm-starve .sv-cv{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
.gm-starve .sv-hud{position:absolute;inset:0;pointer-events:none}
.gm-starve .sv-hud[hidden],.gm-starve .sv-ui[hidden],.gm-starve .sv-chest[hidden],.gm-starve .sv-craft[hidden],.gm-starve .sv-touch[hidden]{display:none}
.gm-starve .sv-hud>*{pointer-events:auto}
.gm-starve .sv-pn{background:rgba(18,26,34,.72);border:1.5px solid rgba(255,255,255,.14);border-radius:12px;backdrop-filter:blur(3px)}
.gm-starve .sv-day{position:absolute;left:8px;top:8px;display:flex;align-items:center;gap:8px;padding:5px 11px 5px 8px;font-weight:800;font-size:13px}
.gm-starve .sv-day svg{width:22px;height:22px;flex:none}
.gm-starve .sv-day b{font-size:14px}
.gm-starve .sv-day span{opacity:.75;font-weight:700;font-size:12px}
.gm-starve .sv-day u{display:block;width:54px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);position:relative;overflow:hidden;text-decoration:none}
.gm-starve .sv-day u i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ffd45a,#ff9d3a,#6a7bd8);border-radius:3px}
.gm-starve .sv-lb{position:absolute;right:8px;top:8px;min-width:128px;max-width:200px;padding:6px 8px;font-size:12px;font-weight:700;pointer-events:none}
.gm-starve .sv-lb h4{margin:0 0 3px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;opacity:.6}
.gm-starve .sv-lbr{display:flex;gap:6px;align-items:center;line-height:1.5}
.gm-starve .sv-lbr b{width:12px;opacity:.55;font-size:11px}
.gm-starve .sv-lbr span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-starve .sv-lbr i{font-style:normal;opacity:.85}
.gm-starve .sv-lbr.me{color:#ffe08a}
.gm-starve .sv-lbr.dead{opacity:.45}
.gm-starve .sv-stats{position:absolute;left:8px;bottom:8px;display:flex;flex-direction:column;gap:5px;padding:7px 9px;width:152px}
.gm-starve .sv-st{display:flex;align-items:center;gap:6px}
.gm-starve .sv-st svg{width:17px;height:17px;flex:none}
.gm-starve .sv-st div{flex:1;height:9px;border-radius:5px;background:rgba(0,0,0,.45);overflow:hidden}
.gm-starve .sv-st i{display:block;height:100%;border-radius:5px;transition:width .15s}
.gm-starve .sv-st.low div{animation:svp .7s infinite alternate}
@keyframes svp{from{box-shadow:0 0 0 0 rgba(255,80,80,0)}to{box-shadow:0 0 0 2px rgba(255,80,80,.9)}}
.gm-starve .sv-eq{position:absolute;left:8px;bottom:128px;display:flex;gap:4px;pointer-events:none}
.gm-starve .sv-eq img{width:26px;height:26px;padding:2px;background:rgba(18,26,34,.72);border-radius:8px}
.gm-starve .sv-hot{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(8,1fr);gap:4px;padding:5px}
.gm-starve .sv-sl{position:relative;width:48px;height:48px;border-radius:9px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.14);cursor:pointer;padding:0;color:#fff;font-family:inherit}
.gm-starve .sv-sl img{width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none}
.gm-starve .sv-sl.on{border-color:#ffd45a;background:rgba(255,212,90,.2);box-shadow:0 0 10px rgba(255,212,90,.5)}
.gm-starve .sv-sl b{position:absolute;right:3px;bottom:1px;font-size:12px;font-weight:900;text-shadow:0 1px 2px #000,0 0 3px #000}
.gm-starve .sv-sl em{position:absolute;left:3px;top:0;font-size:10px;font-style:normal;font-weight:800;opacity:.55}
.gm-starve .sv-mm{position:absolute;right:8px;bottom:8px;width:112px;height:112px;border-radius:10px;border:2px solid rgba(255,255,255,.4);background:#2d6f98;pointer-events:none}
.gm-starve .sv-ctl{position:absolute;left:8px;top:52px;display:flex;flex-direction:column;gap:5px}
.gm-starve .sv-btn{border:1.5px solid rgba(255,255,255,.18);background:rgba(18,26,34,.72);color:#fff;border-radius:10px;font:800 12px var(--sans);padding:7px 11px;cursor:pointer;min-height:34px;display:flex;align-items:center;gap:6px}
.gm-starve .sv-btn:hover{background:rgba(40,56,70,.85)}
.gm-starve .sv-btn svg{width:16px;height:16px}
.gm-starve .sv-craft{position:absolute;left:8px;top:132px;bottom:136px;width:228px;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:3px}
.gm-starve .sv-craft h5{margin:6px 2px 2px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.55}
.gm-starve .sv-rc{display:grid;grid-template-columns:34px 1fr;gap:2px 8px;align-items:center;text-align:left;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);border-radius:9px;padding:3px 6px 3px 3px;color:#fff;font-family:inherit;cursor:pointer}
.gm-starve .sv-rc img{width:34px;height:34px;grid-row:span 2}
.gm-starve .sv-rc strong{font-size:12px;font-weight:800;line-height:1.1}
.gm-starve .sv-rc strong small{opacity:.6;font-weight:700;margin-left:4px}
.gm-starve .sv-rc div{display:flex;flex-wrap:wrap;gap:3px 6px;font-size:11px;font-weight:800}
.gm-starve .sv-rc div span{display:inline-flex;align-items:center;gap:2px;color:#ff8d8d}
.gm-starve .sv-rc div span.has{color:#b8f0b0}
.gm-starve .sv-rc div img{width:14px;height:14px;grid-row:auto}
.gm-starve .sv-rc.ok{border-color:rgba(160,255,150,.55);background:rgba(120,220,110,.16)}
.gm-starve .sv-rc.ok:hover{background:rgba(120,220,110,.3)}
.gm-starve .sv-rc.no{opacity:.62}
.gm-starve .sv-rc.nst{opacity:.8;border-color:rgba(255,200,90,.5)}
.gm-starve .sv-chest{position:absolute;left:50%;top:26%;transform:translateX(-50%);padding:8px 10px;text-align:center}
.gm-starve .sv-chest h5{margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}
.gm-starve .sv-chest div{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
.gm-starve .sv-notes{position:absolute;left:50%;top:64px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none}
.gm-starve .sv-notes div{background:rgba(18,26,34,.8);padding:5px 12px;border-radius:999px;font-weight:800;font-size:13px;animation:svn 2.6s forwards}
@keyframes svn{0%{opacity:0;transform:translateY(-6px)}8%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
.gm-starve .sv-sleep{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);padding:10px 18px;font-weight:900;font-size:17px;text-align:center;pointer-events:none}
.gm-starve .sv-sleep small{display:block;font-size:12px;opacity:.7;font-weight:700}
.gm-starve .sv-touch{position:absolute;inset:0;pointer-events:none}
.gm-starve .sv-jz{position:absolute;bottom:0;top:34%;width:46%;pointer-events:auto;touch-action:none}
.gm-starve .sv-jz.l{left:0}.gm-starve .sv-jz.r{right:0}
.gm-starve .sv-jb{position:absolute;width:104px;height:104px;margin:-52px 0 0 -52px;border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);pointer-events:none;display:none}
.gm-starve .sv-jk{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.55);pointer-events:none;display:none}
.gm-starve .sv-tb{position:absolute;right:8px;display:flex;flex-direction:column;gap:6px;pointer-events:auto}
.gm-starve .sv-tb button{width:50px;height:50px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(18,26,34,.66);color:#fff;font:900 15px var(--sans)}
.gm-starve .sv-ui{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10px;background:radial-gradient(ellipse at 50% 40%,rgba(20,45,62,.55),rgba(8,16,24,.88));overflow:auto;z-index:5}
.gm-starve .sv-card{width:100%;max-width:560px;margin:auto;text-align:center}
.gm-starve .sv-logo{font:900 clamp(40px,8vw,72px)/1 var(--sans);letter-spacing:.04em;text-transform:uppercase;color:#fff;-webkit-text-stroke:3px #1b3a1c;paint-order:stroke fill;text-shadow:0 5px 0 #1b3a1c,0 9px 18px rgba(0,0,0,.45)}
.gm-starve .sv-logo em{font-style:normal;color:#ffd45a}
.gm-starve .sv-sub{font-weight:800;opacity:.75;margin:8px 0 18px;font-size:14px}
.gm-starve .sv-btns{display:flex;flex-direction:column;gap:9px;align-items:center}
.gm-starve .sv-big{border:0;border-radius:14px;padding:13px 26px;font:900 18px var(--sans);color:#fff;background:linear-gradient(#5ec35a,#3c9a3a);box-shadow:0 4px 0 #26692a,0 8px 16px rgba(0,0,0,.35);cursor:pointer;min-width:230px;transition:transform .08s}
.gm-starve .sv-big:hover{transform:translateY(-2px)}
.gm-starve .sv-big:active{transform:translateY(2px);box-shadow:0 1px 0 #26692a}
.gm-starve .sv-big.b{background:linear-gradient(#5aa8e6,#3a78c0);box-shadow:0 4px 0 #204b80,0 8px 16px rgba(0,0,0,.35)}
.gm-starve .sv-big.g{background:linear-gradient(#8a98a6,#64727f);box-shadow:0 4px 0 #3d4852,0 8px 16px rgba(0,0,0,.35);font-size:15px;padding:10px 22px}
.gm-starve .sv-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;margin-top:12px}
.gm-starve .sv-row>span{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;opacity:.7}
.gm-starve .sv-seg{display:inline-flex;background:rgba(255,255,255,.12);border-radius:999px;padding:3px}
.gm-starve .sv-seg button{border:0;background:none;font:800 13px var(--sans);color:#d6e2ea;padding:6px 12px;border-radius:999px;cursor:pointer;min-height:32px}
.gm-starve .sv-seg button.on{background:#fff;color:#1c3a2c}
.gm-starve .sv-pan h3{font:900 32px/1.1 var(--sans);margin:4px 0 8px}
.gm-starve .sv-k{font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.gm-starve .sv-t{font-weight:700;opacity:.85;margin:0 0 14px}
.gm-starve .sv-stl{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:6px 0 16px}
.gm-starve .sv-stl div{background:rgba(255,255,255,.1);border-radius:12px;padding:8px 14px;min-width:84px}
.gm-starve .sv-stl b{display:block;font-size:24px;font-weight:900}
.gm-starve .sv-stl span{font-size:11px;font-weight:800;opacity:.65;text-transform:uppercase;letter-spacing:.06em}
.gm-starve .sv-help{text-align:left;font-size:13px;font-weight:600;line-height:1.5;max-width:520px;margin:0 auto 14px;background:rgba(255,255,255,.08);border-radius:12px;padding:10px 14px}
.gm-starve .sv-help b{color:#ffd45a}
.gm-starve .sv-help kbd{color:#fff;border:0;background:rgba(255,255,255,.2);border-radius:5px;padding:0 5px;font:800 12px var(--sans)}
@media (max-width:700px){
.gm-starve .sv-sl{width:38px;height:38px}
.gm-starve .sv-stats{width:118px;padding:5px 7px;gap:3px}
.gm-starve .sv-craft{width:190px;top:120px}
.gm-starve .sv-lb{display:none}
.gm-starve .sv-mm{width:84px;height:84px;top:8px;bottom:auto}
.gm-starve .sv-eq{bottom:108px}
.gm-starve .sv-day span,.gm-starve .sv-day u{display:none}
}`;

const IC = {
  hp: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.3-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.7-8 11-8 11z" fill="#e8434c" stroke="#4f0f14" stroke-width="1.6"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M15 3a5.5 5.5 0 0 1 1 10.8l-2 2-6.5 5a1.8 1.8 0 0 1-2.5-2.5l5-6.5 2-2A5.5 5.5 0 0 1 15 3z" fill="#e0833a" stroke="#4d2408" stroke-width="1.6"/></svg>',
  water: '<svg viewBox="0 0 24 24"><path d="M12 3c3 4.6 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.4 6-11z" fill="#4aa8f0" stroke="#0e3a63" stroke-width="1.6"/></svg>',
  cold: '<svg viewBox="0 0 24 24" fill="none" stroke="#b4ecff" stroke-width="2.4" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5.5" fill="#ffd45a" stroke="#8a5a08" stroke-width="1.6"/><g stroke="#ffd45a" stroke-width="2.2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="#cfd8ff" stroke="#3a4684" stroke-width="1.6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  craft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5l4 4M4 20l9-9M12 7l5-4 4 4-4 5z"/></svg>'
};

const HELP = '<b>Survive as many days as you can.</b> Keep <b>life</b>, <b>food</b>, <b>water</b> and <b>warmth</b> up.<br>' +
  '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · mouse aims · <kbd>click</kbd> / <kbd>Space</kbd> hit, eat, place · <kbd>1</kbd>-<kbd>8</kbd> / wheel pick a slot<br>' +
  '<kbd>E</kbd> use fire / door / chest / bed · <kbd>C</kbd> crafting · <kbd>Q</kbd> drop · drag slots to swap · drink by hitting water<br>' +
  'Wood &rarr; <b>wood pickaxe</b> &rarr; stone &rarr; <b>workbench</b> &rarr; stone, then <b>furnace</b> for gold and diamond. Nights and the north are freezing: build a <b>campfire</b>, craft <b>fur</b> clothes. Dragons live in the snow.';

class Hud {
  constructor(wrap, api, cb) {
    this.api = api; this.cb = cb;
    const h = this.root = document.createElement('div');
    h.className = 'sv-hud'; h.hidden = true;
    h.innerHTML =
      '<div class="sv-day sv-pn"><span class="sv-ic"></span><div><b>Day 1</b> <span>0.0 days</span><u><i></i></u></div></div>' +
      '<div class="sv-lb sv-pn"><h4>Survivors</h4><div></div></div>' +
      '<div class="sv-ctl"><button class="sv-btn" data-b="menu" type="button">' + IC.menu + '<span>Menu</span></button><button class="sv-btn" data-b="craft" type="button">' + IC.craft + '<span>Craft</span></button></div>' +
      '<div class="sv-craft sv-pn" hidden></div>' +
      '<div class="sv-eq"></div>' +
      '<div class="sv-stats sv-pn"></div>' +
      '<div class="sv-hot sv-pn"></div>' +
      '<canvas class="sv-mm" width="224" height="224"></canvas>' +
      '<div class="sv-chest sv-pn" hidden><h5>Chest</h5><div></div></div>' +
      '<div class="sv-sleep sv-pn" hidden>Sleeping&hellip;<small>Press E to wake up</small></div>' +
      '<div class="sv-notes"></div>' +
      '<div class="sv-touch" hidden><div class="sv-jz l"></div><div class="sv-jz r"></div><div class="sv-jb"></div><div class="sv-jk"></div><div class="sv-jb"></div><div class="sv-jk"></div><div class="sv-tb"><button data-b="int" type="button">E</button></div></div>';
    wrap.append(h);
    const q = s => h.querySelector(s);
    this.mm = q('.sv-mm'); this.dayIc = q('.sv-ic'); this.dayB = q('.sv-day b'); this.dayS = q('.sv-day div span'); this.dayU = q('.sv-day u i');
    this.lbEl = q('.sv-lb div'); this.lbBox = q('.sv-lb');
    this.craftEl = q('.sv-craft'); this.chestEl = q('.sv-chest'); this.chestGrid = q('.sv-chest div');
    this.notes = q('.sv-notes'); this.sleep = q('.sv-sleep'); this.touchEl = q('.sv-touch'); this.eq = q('.sv-eq');
    this.tb = q('.sv-tb');
    this.jb = h.querySelectorAll('.sv-jb'); this.jk = h.querySelectorAll('.sv-jk');
    this.zoneL = q('.sv-jz.l'); this.zoneR = q('.sv-jz.r');
    const st = q('.sv-stats');
    this.bars = {};
    [['hp', 'Life', '#e8434c'], ['food', 'Food', '#e0833a'], ['water', 'Water', '#4aa8f0'], ['cold', 'Warmth', '#9fdcff']].forEach(([k, n, c]) => {
      const r = document.createElement('div');
      r.className = 'sv-st'; r.title = n;
      r.innerHTML = IC[k] + '<div><i style="background:' + c + ';width:100%"></i></div>';
      st.append(r);
      this.bars[k] = { r, i: r.querySelector('i') };
    });
    const hot = q('.sv-hot');
    this.slots = [];
    for (let i = 0; i < SLOTS_MAX; i++) {
      const b = document.createElement('button');
      b.className = 'sv-sl'; b.type = 'button'; b.draggable = true; b.dataset.i = i;
      b.innerHTML = '<em>' + (i < 9 ? i + 1 : '') + '</em><img alt="" hidden><b></b>';
      hot.append(b);
      this.slots.push({ b, img: b.querySelector('img'), n: b.querySelector('b'), key: '' });
    }
    this.hot = hot;
    this.buildCraft();
    this.chestSl = [];
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('button');
      b.className = 'sv-sl'; b.type = 'button'; b.dataset.c = i;
      b.innerHTML = '<img alt="" hidden><b></b>';
      this.chestGrid.append(b);
      this.chestSl.push({ b, img: b.querySelector('img'), n: b.querySelector('b'), key: '' });
    }
    h.addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.i != null) cb.slot(+t.dataset.i, e);
      else if (t.dataset.c != null) cb.chestGet(+t.dataset.c);
      else if (t.dataset.r) cb.craft(t.dataset.r);
      else if (t.dataset.b === 'menu') cb.menu();
      else if (t.dataset.b === 'craft') this.toggleCraft();
      else if (t.dataset.b === 'int') cb.interact();
    });
    h.addEventListener('contextmenu', e => { const t = e.target.closest('[data-i]'); e.preventDefault(); if (t) cb.drop(+t.dataset.i); });
    let drag = -1;
    hot.addEventListener('dragstart', e => { const t = e.target.closest('[data-i]'); if (t) { drag = +t.dataset.i; try { e.dataTransfer.setData('text', 'x'); } catch (x) {} } });
    hot.addEventListener('dragover', e => e.preventDefault());
    hot.addEventListener('drop', e => { e.preventDefault(); const t = e.target.closest('[data-i]'); if (t && drag >= 0 && drag !== +t.dataset.i) cb.swap(drag, +t.dataset.i); drag = -1; });
    this.sig = {};
    this.sleepOn = false;
  }

  buildCraft() {
    const el = this.craftEl;
    let last = '';
    this.rc = [];
    for (const r of RECIPES) {
      if (r.g !== last) { const h5 = document.createElement('h5'); h5.textContent = r.g; el.append(h5); last = r.g; }
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sv-rc'; b.dataset.r = r.id;
      const cost = Object.keys(r.in).map(k => '<span data-k="' + k + '" data-n="' + r.in[k] + '"><img src="' + iconUrl(k) + '" alt="">' + r.in[k] + '</span>').join('');
      b.innerHTML = '<img src="' + iconUrl(r.id) + '" alt=""><strong>' + ITEMS[r.id].n + (r.st ? '<small>' + STNAME[r.st] + '</small>' : '') + '</strong><div>' + cost + '</div>';
      el.append(b);
      this.rc.push({ b, r, chips: [...b.querySelectorAll('span')], key: '' });
    }
  }

  show(on) { this.root.hidden = !on; }
  toggleCraft(v) { this.craftEl.hidden = v == null ? !this.craftEl.hidden : !v; this.cb.layout && this.cb.layout(); }
  note(m) {
    const d = document.createElement('div');
    d.textContent = m;
    this.notes.append(d);
    while (this.notes.children.length > 3) this.notes.firstChild.remove();
    this.api.timeout(() => d.remove(), 2700);
  }

  setSlot(s, it) {
    const key = it ? it.i + ':' + it.n : '';
    if (s.key === key) return;
    s.key = key;
    if (!it) { s.img.hidden = true; s.n.textContent = ''; return; }
    s.img.hidden = false; s.img.src = iconUrl(it.i);
    s.n.textContent = it.n > 1 ? it.n : '';
  }

  sync(S) {
    const bag = S.bag ? 16 : 8;
    const sg = this.sig;
    if (sg.bag !== bag) { sg.bag = bag; this.hot.style.gridTemplateColumns = 'repeat(8,1fr)'; this.slots.forEach((s, i) => { s.b.hidden = i >= bag; }); }
    for (let i = 0; i < bag; i++) {
      const s = this.slots[i];
      this.setSlot(s, S.inv[i]);
      s.b.classList.toggle('on', i === S.sel);
    }
    for (const k of ['hp', 'food', 'water', 'cold']) {
      const v = Math.round(clamp(S[k], 0, 100)), b = this.bars[k];
      if (sg[k] !== v) { sg[k] = v; b.i.style.width = v + '%'; b.r.classList.toggle('low', v < 20); }
    }
    const day = Math.floor(S.time / DAY) + 1, ph = phaseOf(S.time), dk = darkOf(S.time);
    const dt = 'Day ' + day + (dk > .6 ? ' · Night' : dk > .05 ? ' · Dusk' : '');
    if (sg.day !== dt) { sg.day = dt; this.dayB.textContent = dt; }
    const dst = S.days.toFixed(1) + ' days';
    if (sg.dst !== dst) { sg.dst = dst; this.dayS.textContent = dst; }
    const moon = dk > .5 ? 1 : 0;
    if (sg.moon !== moon) { sg.moon = moon; this.dayIc.innerHTML = moon ? IC.moon : IC.sun; }
    this.dayU.style.width = (ph * 100).toFixed(1) + '%';
    const eq = (S.head ? 'h' : '') + (S.body ? 'b' : '');
    if (sg.eq !== eq) { sg.eq = eq; this.eq.innerHTML = (S.head ? '<img src="' + iconUrl('hat') + '" alt="">' : '') + (S.body ? '<img src="' + iconUrl('coat') + '" alt="">' : ''); }
    if (!this.craftEl.hidden) {
      const counts = {};
      for (const s of S.inv) if (s) counts[s.i] = (counts[s.i] || 0) + s.n;
      const near = [0, S.station(1), S.station(2)];
      for (const c of this.rc) {
        let ok = true;
        const key = [];
        for (const ch of c.chips) {
          const has = (counts[ch.dataset.k] || 0) >= +ch.dataset.n;
          if (!has) ok = false;
          key.push(has ? 1 : 0);
        }
        const nst = c.r.st && !near[c.r.st];
        key.push(nst ? 1 : 0);
        const ks = key.join('');
        if (c.key === ks) continue;
        c.key = ks;
        c.chips.forEach((ch, i) => ch.classList.toggle('has', key[i] === 1));
        c.b.classList.toggle('ok', ok && !nst);
        c.b.classList.toggle('no', !ok);
        c.b.classList.toggle('nst', ok && !!nst);
      }
    }
    const co = !!S.chest;
    if (this.chestEl.hidden === co) this.chestEl.hidden = !co;
    if (co) for (let i = 0; i < 12; i++) this.setSlot(this.chestSl[i], S.chest[i]);
    if (this.sleepOn !== !!S.sleeping) { this.sleepOn = !!S.sleeping; this.sleep.hidden = !this.sleepOn; }
    const lb = S.lb.map(r => '<div class="sv-lbr' + (r.me ? ' me' : '') + (r.dead ? ' dead' : '') + '"><b>' + r.n + '</b><span>' + r.name.replace(/[<>&"]/g, '') + '</span><i>' + r.days + '</i></div>').join('');
    if (sg.lb !== lb) { sg.lb = lb; this.lbEl.innerHTML = lb; }
  }
}

const STEP = 1 / 60;
const VIEW_X = 840, VIEW_Y = 600;
const NEWSEED = () => (Math.random() * 4294967295) >>> 0;
const fin = v => typeof v === 'number' && isFinite(v);
const clean = s => String(s == null ? '' : s).replace(/[<>&"']/g, '').slice(0, 16);

class StarveGame {
  constructor(root, api) {
    this.root = root; this.api = api;
    this.coarse = matchMedia('(pointer: coarse)').matches;
    this.touch = this.coarse;
    this.audio = mkAudio(api);
    const wrap = this.wrap = document.createElement('div');
    wrap.className = 'sv-wrap';
    root.append(wrap);
    const cv = this.cv = document.createElement('canvas');
    cv.className = 'sv-cv';
    wrap.append(cv);
    this.hud = new Hud(wrap, api, {
      slot: (i, e) => this.onSlot(i, e),
      chestGet: i => this.cmd({ c: 'cget', s: i }),
      craft: id => this.cmd({ c: 'craft', r: id }),
      menu: () => this.openMenu(),
      interact: () => this.interact(),
      drop: i => this.cmd({ c: 'drop', s: i }),
      swap: (a, b) => this.cmd({ c: 'swap', a, b })
    });
    const ui = this.ui = document.createElement('div');
    ui.className = 'sv-ui';
    wrap.append(ui);
    ui.addEventListener('click', e => this.uiClick(e));
    const sv = api.load() || {};
    this.opts = Object.assign({ bots: 3 }, sv.opts || {});
    this.run = sv.run || null;
    this.state = 'menu'; this.role = null; this.sim = null; this.me = null; this.renderer = null;
    this.paused = false; this.acc = 0; this.fxQ = []; this.evQ = [];
    this.sel = 0; this.keys = new Set(); this.mx = .5; this.my = .5; this.useMouse = false;
    this.atkKey = false; this.atkMouse = false; this.stick = [null, null]; this.tAim = null; this.tAtk = false;
    this.lastHp = 100; this.lastDay = 1; this.hudT = 0; this.saveT = 0; this.tipT = 0; this.tip = 0;
    this.G = null; this.ghost = null; this.deadAt = 0;
    this.pmap = new Map();
    this.setupInput();
    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(wrap);
    api.loop((dt, now) => this.frame(dt, now));
  }

  destroy() {
    this.dead = true;
    try { this.ro.disconnect(); } catch (e) {}
    this.audio.close();
    this.saveNow();
  }

  myName() {
    try {
      const p = JSON.parse(localStorage.getItem('gameplay:profile'));
      if (p && (p.username || p.displayName)) return clean(p.username || p.displayName);
    } catch (e) {}
    return 'You';
  }

  persist() { this.api.save({ opts: this.opts, run: this.run }); }

  fit() {
    const r = this.wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    const cap = 2.3e6;
    if (w * h > cap) { const s = Math.sqrt(cap / (w * h)); w = Math.round(w * s); h = Math.round(h * s); }
    if (this.renderer && (this.cv.width !== w || this.cv.height !== h || this.renderer.touch !== this.touch)) this.renderer.resize(w, h, this.touch);
  }

  setTouch(on) {
    if (this.touch === on) return;
    this.touch = on;
    this.hud.touchEl.hidden = !on || this.state !== 'play';
    this.fit();
  }

  setupInput() {
    const api = this.api, cv = this.cv, h = this.hud;
    api.on(window, 'keydown', e => this.key(e, true));
    api.on(window, 'keyup', e => this.key(e, false));
    api.on(window, 'blur', () => { this.keys.clear(); this.atkKey = false; this.atkMouse = false; });
    api.on(cv, 'pointerdown', e => {
      if (e.pointerType === 'touch') { this.setTouch(true); return; }
      this.setTouch(false);
      this.useMouse = true; this.moveMouse(e);
      if (e.button !== 0 || this.state !== 'play') return;
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      const it = this.selItem();
      if (it && ITEMS[it.i].k === 'place') this.placeAt(this.calcGhost(this.me, this.sim));
      else this.atkMouse = true;
    });
    api.on(cv, 'pointermove', e => { if (e.pointerType !== 'touch') { this.useMouse = true; this.moveMouse(e); } });
    api.on(window, 'pointerup', e => { if (e.pointerType !== 'touch') this.atkMouse = false; });
    api.on(cv, 'contextmenu', e => e.preventDefault());
    api.on(cv, 'wheel', e => {
      if (this.state !== 'play') return;
      e.preventDefault();
      const n = this.slotCount();
      this.sel = (this.sel + (e.deltaY > 0 ? 1 : -1) + n) % n;
    }, { passive: false });
    const zone = (el, idx) => {
      const base = h.jb[idx], knob = h.jk[idx];
      let pid = null, ox = 0, oy = 0, t0 = 0;
      const rect = () => h.touchEl.getBoundingClientRect();
      api.on(el, 'pointerdown', e => {
        if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
        this.setTouch(true);
        if (pid != null || this.state !== 'play') return;
        e.preventDefault();
        pid = e.pointerId; t0 = performance.now();
        try { el.setPointerCapture(pid); } catch (x) {}
        const r = rect();
        ox = e.clientX; oy = e.clientY;
        base.style.display = knob.style.display = 'block';
        base.style.left = knob.style.left = (ox - r.left) + 'px';
        base.style.top = knob.style.top = (oy - r.top) + 'px';
        this.stick[idx] = { x: 0, y: 0, d: 0 };
      });
      api.on(el, 'pointermove', e => {
        if (e.pointerId !== pid) return;
        let dx = e.clientX - ox, dy = e.clientY - oy;
        const d = Math.hypot(dx, dy), m = 52;
        if (d > m) { dx = dx / d * m; dy = dy / d * m; }
        const r = rect();
        knob.style.left = (ox - r.left + dx) + 'px'; knob.style.top = (oy - r.top + dy) + 'px';
        this.stick[idx] = { x: dx / m, y: dy / m, d: Math.min(d, m) };
      });
      const up = e => {
        if (e.pointerId !== pid) return;
        pid = null;
        base.style.display = knob.style.display = 'none';
        const s = this.stick[idx];
        this.stick[idx] = null;
        if (idx === 1 && this.state === 'play') {
          const it = this.selItem();
          if (it && ITEMS[it.i].k === 'place' && this.tGhost) this.placeAt(this.tGhost);
          else if (!s || s.d < 14) {
            if (performance.now() - t0 < 260 && it && ITEMS[it.i].k === 'food') this.cmd({ c: 'use', s: this.sel });
          }
          this.tGhost = null;
        }
      };
      api.on(el, 'pointerup', up);
      api.on(el, 'pointercancel', up);
    };
    zone(h.zoneL, 0);
    zone(h.zoneR, 1);
  }

  moveMouse(e) {
    const r = this.cv.getBoundingClientRect();
    this.mx = (e.clientX - r.left) / r.width; this.my = (e.clientY - r.top) / r.height;
  }

  slotCount() { return this.bagOn() ? 16 : 8; }
  bagOn() { return this.role === 'guest' ? !!(this.G && this.G.bag) : !!(this.me && this.me.bag); }
  inv() { return this.role === 'guest' ? (this.G ? this.G.inv : []) : (this.me ? this.me.inv : []); }
  selItem() { return this.inv()[this.sel] || null; }
  chestOpen() { return this.role === 'guest' ? !!(this.G && this.G.chest) : !!(this.me && this.me.chest); }

  key(e, down) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const c = e.code;
    if (!down) { this.keys.delete(c); if (c === 'Space') this.atkKey = false; return; }
    if (this.state !== 'play') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) { this.keys.add(c); e.preventDefault(); return; }
    if (c === 'Space') { this.atkKey = true; e.preventDefault(); const it = this.selItem(); if (it && ITEMS[it.i].k === 'place' && !e.repeat) { this.placeAt(this.calcGhost(this.me, this.sim)); this.atkKey = false; } return; }
    if (e.repeat) return;
    if (c === 'KeyE') this.interact();
    else if (c === 'KeyC') this.hud.toggleCraft();
    else if (c === 'KeyQ') this.cmd({ c: 'drop', s: this.sel });
    else if (c === 'KeyF') this.cmd({ c: 'use', s: this.sel });
    else if (/^Digit[0-9]$/.test(c)) {
      const n = c === 'Digit0' ? 9 : +c[5] - 1;
      if (n < this.slotCount()) this.onSlot(n, null, true);
    }
  }

  onSlot(i, e, keyed) {
    if (this.state !== 'play') return;
    const it = this.inv()[i] || null;
    if (this.chestOpen() && it && !keyed) { this.cmd({ c: 'cput', s: i }); return; }
    const k = it ? ITEMS[it.i].k : '';
    if (i === this.sel && it && (k === 'food' || k === 'wear' || k === 'bag')) this.cmd({ c: 'use', s: i });
    else {
      this.sel = i;
      if (it && (k === 'wear' || k === 'bag')) this.cmd({ c: 'use', s: i });
    }
  }

  interact() {
    if (this.state !== 'play') return;
    if (this.chestOpen()) this.cmd({ c: 'cclose' });
    else this.cmd({ c: 'int' });
  }

  cmd(c) {
    if (this.state !== 'play') return;
    if (this.role === 'guest') { if (this.net && this.net.connected) this.net.send({ t: 'cmd', c }); }
    else if (this.me && this.sim && !(this.paused && this.role === 'solo')) this.sim.cmd(this.me, c);
  }

  placeAt(g) {
    if (!g) return;
    this.cmd({ c: 'place', s: this.sel, x: g.x, y: g.y });
  }

  get net() { return this.api.net; }

  uiClick(e) {
    const s = e.target.closest('[data-k][data-v]');
    if (s) {
      const k = s.dataset.k;
      this.opts[k] = +s.dataset.v;
      s.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === s));
      this.persist();
      return;
    }
    const b = e.target.closest('[data-a]');
    if (!b) return;
    this.api.sfx('tap');
    const f = this.acts && this.acts[b.dataset.a];
    if (f) f(b);
  }

  panel(html, acts) {
    this.acts = acts;
    this.ui.innerHTML = html;
    this.ui.hidden = false;
    this.ui.scrollTop = 0;
  }
  hidePanel() { this.ui.hidden = true; this.acts = null; }

  seg(k, list) {
    return '<div class="sv-seg" data-kk="' + k + '">' + list.map(([v, n]) => '<button type="button" data-k="' + k + '" data-v="' + v + '" class="' + (this.opts[k] === v ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
  }

  ensureDemo() {
    if (this.demo) return;
    const sim = this.demo = new Sim({ seed: 7, solo: true, time: DAY * .12 });
    for (let i = 0; i < 4; i++) sim.addPlayer({ name: BOTNAMES[i], ctl: 'bot' });
    sim.populate();
    this.demoR = new Renderer(this.cv, this.hud.mm, sim.W);
    this.demoCam = { x: 2000, y: 2000 };
  }

  showMenu() {
    this.state = 'menu'; this.role = null; this.me = null; this.sim = null; this.G = null;
    this.paused = false;
    this.hud.show(false);
    this.hud.touchEl.hidden = true;
    this.ensureDemo();
    this.renderer = this.demoR; this.sim = this.demo;
    this.fit();
    const sv = this.run && this.run.st && this.run.st.v === 1 ? this.run : null;
    let cont = '';
    if (sv) {
      const me = sv.st.players.find(p => p.ctl === 'local');
      const dys = me ? Math.max(0, ((me.alive ? sv.st.time : me.diedAt) - me.born) / DAY) : 0;
      cont = '<button class="sv-big" data-a="cont" type="button">Continue<small>Day ' + (Math.floor(sv.st.time / DAY) + 1) + ' &middot; ' + dys.toFixed(1) + ' days survived</small></button>';
    }
    this.panel('<div class="sv-card"><div class="sv-logo">STARVE<em>.IO</em></div><div class="sv-sub">Hunger, thirst and the cold. How many days can you last?</div>' +
      '<div class="sv-btns"><button class="sv-big" data-a="play" type="button">' + (sv ? 'New game' : 'Play') + '</button>' + cont +
      '<button class="sv-big b" data-a="online" type="button">Play online<small>2 to 16 players, shared world</small></button>' +
      '<button class="sv-big g" data-a="how" type="button">How to play</button></div>' +
      '<div class="sv-row"><span>Other survivors</span>' + this.seg('bots', [[0, 'None'], [3, 'Few'], [7, 'Many']]) + '</div>' +
      '</div>', {
      play: () => this.startSolo(false),
      cont: () => this.startSolo(true),
      online: () => this.goOnline(),
      how: () => this.showHow(() => this.showMenu())
    });
  }

  showHow(back) {
    this.panel('<div class="sv-card sv-pan"><p class="sv-k">Starve.io</p><h3>How to play</h3><div class="sv-help">' + HELP + '</div><div class="sv-btns"><button class="sv-big" data-a="back" type="button">Back</button></div></div>', { back });
  }

  openMenu() {
    if (this.state !== 'play') return;
    this.state = 'panel';
    this.paused = true;
    const online = this.role !== 'solo';
    this.panel('<div class="sv-card sv-pan"><p class="sv-k">Starve.io</p><h3>Menu</h3><div class="sv-btns"><button class="sv-big" data-a="res" type="button">Resume</button><button class="sv-big g" data-a="how" type="button">How to play</button>' +
      (online ? '' : '<button class="sv-big g" data-a="new" type="button">New world</button>') +
      '<button class="sv-big g" data-a="quit" type="button">' + (online ? 'Leave game' : 'Save and quit') + '</button></div>' + (online ? '<p class="sv-t" style="margin-top:12px">Online: the world keeps running while this menu is open.</p>' : '') + '</div>', {
      res: () => this.closeMenu(),
      how: () => this.showHow(() => this.openMenuAgain()),
      new: () => { this.finishRun(); this.startSolo(false); },
      quit: () => this.quit()
    });
  }
  openMenuAgain() { this.state = 'play'; this.openMenu(); }
  closeMenu() { this.hidePanel(); this.state = 'play'; this.paused = false; }

  quit() {
    if (this.role === 'solo') { this.saveNow(); this.finishRun(true); }
    else this.leaveOnline();
    this.showMenu();
  }

  finishRun(keep) {
    const me = this.me;
    if (me && this.sim) {
      const d = this.role === 'guest' ? this.G.days : this.sim.days(me);
      if (d > 0) this.api.submit(Math.round(d * 10) / 10);
    }
    if (!keep && this.role === 'solo') { this.run = null; this.persist(); }
  }

  saveNow() {
    if (this.role === 'solo' && this.sim && this.me && this.me.alive && this.state !== 'menu') {
      this.run = { st: this.sim.saveState(), at: Date.now() };
      this.persist();
    }
  }

  restorePlayers(sim, list, pick) {
    let me = null;
    for (const s of list) {
      const ctl = pick(s);
      if (!ctl) continue;
      const p = sim.addPlayer({ id: s.id, name: s.name, color: s.color, ctl: ctl.ctl });
      Object.assign(p, { x: s.x, y: s.y, hp: s.hp, food: s.food, water: s.water, cold: s.cold, inv: s.inv, sel: s.sel, bag: s.bag, head: s.head, body: s.body, alive: s.alive, born: s.born, kills: s.kills, crafted: s.crafted, diedAt: s.diedAt, finalDays: s.finalDays, dirty: true });
      if (ctl.me) me = p;
    }
    return me;
  }

  startSolo(resume) {
    this.leaveOnline(true);
    let sim, me;
    if (resume && this.run && this.run.st) {
      const st = this.run.st;
      sim = new Sim({ seed: st.seed, solo: true, time: st.time });
      const list = sim.loadState(st);
      me = this.restorePlayers(sim, list, s => s.ctl === 'local' ? { ctl: 'local', me: 1 } : s.ctl === 'bot' ? { ctl: 'bot' } : null);
      if (!me) me = sim.addPlayer({ name: this.myName(), ctl: 'local' });
      if (!me.alive) sim.respawn(me);
    } else {
      sim = new Sim({ seed: NEWSEED(), solo: true });
      me = sim.addPlayer({ name: this.myName(), ctl: 'local' });
      for (let i = 0; i < this.opts.bots; i++) sim.addPlayer({ name: BOTNAMES[(i * 3 + 1) % BOTNAMES.length], ctl: 'bot' });
    }
    sim.populate();
    this.begin('solo', sim, me);
  }

  idle() { return this.state === 'menu' || this.state === 'lobby' || this.state === 'wait'; }

  begin(role, sim, me) {
    this.role = role; this.sim = sim; this.me = me;
    this.renderer = new Renderer(this.cv, this.hud.mm, sim.W);
    this.state = 'play'; this.paused = false; this.acc = 0; this.fxQ.length = 0; this.waitRespawn = false;
    this.sel = me && me.sel ? me.sel : 0;
    this.hud.show(true);
    this.hud.touchEl.hidden = !this.touch;
    this.hud.toggleCraft(false);
    this.hidePanel();
    this.lastHp = me ? me.hp : 100; this.lastDay = Math.floor(sim.time / DAY) + 1;
    this.tip = 0; this.tipT = 3; this.saveT = 6; this.hsaveT = 4;
    this.api.label('Days');
    this.api.score(0);
    this.fit();
    this.hud.sig = {};
    this.hud.slots.forEach(s => { s.key = '~'; });
    this.hud.rc.forEach(c => { c.key = ''; });
  }

  frame(dt, now) {
    if (!this.renderer) return;
    if (this.role === 'guest' && this.G && this.G.started) this.guestFrame(dt, now);
    else this.hostFrame(dt, now);
  }

  applyLocalInput() {
    const me = this.me;
    if (!me || !me.alive) return;
    const inp = me.inp, i = this.readInput(me);
    inp.mx = i.mx; inp.my = i.my; inp.a = i.a; inp.atk = i.atk;
    me.sel = this.sel;
  }

  readInput(me) {
    const k = this.keys, st = this.stick;
    let mx = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let my = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
    if (st[0]) { mx += st[0].x; my += st[0].y; }
    const R = this.renderer;
    let a = me.a || 0, atk = this.atkKey || this.atkMouse;
    if (st[1] && st[1].d > 14) { a = Math.atan2(st[1].y, st[1].x); atk = true; }
    else if (this.useMouse && !this.touch) {
      const wx = R.cam.x + (this.mx * this.cv.width - this.cv.width / 2) / R.k, wy = R.cam.y + (this.my * this.cv.height - this.cv.height / 2) / R.k;
      a = Math.atan2(wy - me.y, wx - me.x);
    } else if (mx || my) a = Math.atan2(my, mx);
    const it = this.selItem();
    if (it && ITEMS[it.i].k === 'place') atk = false;
    if (this.state !== 'play') { mx = my = 0; atk = false; }
    return { mx: clamp(mx, -1, 1), my: clamp(my, -1, 1), a, atk: atk ? 1 : 0 };
  }

  hostFrame(dt, now) {
    const sim = this.sim, me = this.me, host = this.role === 'host';
    if (!(this.paused && this.role === 'solo')) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < 4) {
        this.acc -= STEP; n++;
        if (this.state === 'play') this.applyLocalInput();
        else if (me) { me.inp.mx = me.inp.my = 0; me.inp.atk = 0; }
        sim.step(STEP);
        if (host) this.hostPost();
        if (sim.fx.length) { for (const f of sim.fx) this.fxQ.push(f); sim.fx.length = 0; }
        sim.ev.length = 0;
        if (this.idle()) this.keepDemo();
      }
      if (n === 4) this.acc = 0;
    }
    const v = this.view || (this.view = {});
    v.time = sim.time;
    v.drops = [...sim.drops.values()]; v.structs = [...sim.structs.values()]; v.animals = [...sim.animals.values()]; v.players = [...sim.players.values()]; v.projs = [...sim.projs.values()];
    v.me = me; v.cam = me;
    if (this.idle()) {
      const t = this.demoT && this.demoT.alive ? this.demoT : null;
      v.cam = t || this.demoCam;
      if (t) { this.demoCam.x = t.x; this.demoCam.y = t.y; }
      v.me = null;
    }
    this.render(v, dt);
    if (host && me) { this.hsaveT -= dt; if (this.hsaveT <= 0) { this.hsaveT = 4; this.hostSave(); } }
  }

  keepDemo() {
    if (this.demoT && this.demoT.alive) return;
    this.demoT = null;
    for (const p of this.sim.players.values()) if (p.alive) { this.demoT = p; break; }
  }

  curDays() { return this.role === 'guest' ? this.G.days : this.sim.days(this.me); }

  render(v, dt) {
    const sim = this.sim, me = this.me, R = this.renderer, A = this.audio;
    for (const f of this.fxQ) R.fx(f, v.me, A);
    this.fxQ.length = 0;
    R.draw(v, dt, A);
    if (!me || this.idle()) return;
    if (me.notes.length) { for (const m of me.notes) this.hud.note(m); me.notes.length = 0; }
    if (me.hp < this.lastHp - 2 && me.alive) { A.play('hurt'); R.shake = .22; }
    this.lastHp = me.hp;
    const day = Math.floor(sim.time / DAY) + 1;
    if (day !== this.lastDay) { this.lastDay = day; A.play('day'); this.hud.note('Day ' + day + ' begins'); }
    const days = this.curDays();
    if (me.alive) this.api.score(Math.round(days * 10) / 10);
    this.drawGhost(R, me, sim);
    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = .07; this.hud.sync(this.hudState(days)); }
    if (!me.alive && this.state === 'play' && !this.waitRespawn) this.onDeath({ days: me.finalDays || days, kills: me.kills, crafted: me.crafted, cause: me.lastCause });
    this.tips(dt, me);
    if (this.role === 'solo') { this.saveT -= dt; if (this.saveT <= 0) { this.saveT = 8; this.saveNow(); } }
  }

  hudState(days) {
    if (this.role === 'guest') return this.guestHud(days);
    const sim = this.sim, me = this.me;
    const rows = this.lbRows(sim.lb, id => { const q = sim.players.get(id); return q ? q.name : '?'; }, me.id, days);
    return {
      bag: me.bag, inv: me.inv, sel: this.sel, hp: me.hp, food: me.food, water: me.water, cold: me.cold, time: sim.time, days,
      head: me.head, body: me.body, station: lv => sim.station(me, lv), chest: me.chest ? ((sim.structs.get(me.chest) || {}).inv || null) : null,
      sleeping: me.sleeping, lb: rows
    };
  }

  lbRows(lb, nameOf, myId, myDays) {
    const rows = lb.map((r, i) => ({ me: r[0] === myId, dead: !r[3], n: i + 1, name: nameOf(r[0]), days: r[1].toFixed(1) }));
    if (!rows.some(r => r.me)) rows.push({ me: true, dead: false, n: '-', name: 'You', days: myDays.toFixed(1) });
    return rows;
  }

  target(me) {
    const R = this.renderer;
    if (this.stick[1] && this.stick[1].d > 14 || this.touch) {
      const s = this.stick[1];
      if (!s || s.d <= 14) return null;
      const a = Math.atan2(s.y, s.x), d = clamp(70 + s.d * 2.4, 70, 200);
      return { x: me.x + Math.cos(a) * d, y: me.y + Math.sin(a) * d };
    }
    if (!this.useMouse) return { x: me.x + Math.cos(me.a || 0) * 100, y: me.y + Math.sin(me.a || 0) * 100 };
    return { x: R.cam.x + (this.mx * this.cv.width - this.cv.width / 2) / R.k, y: R.cam.y + (this.my * this.cv.height - this.cv.height / 2) / R.k };
  }

  calcGhost(me, sim) {
    this.ghost = null;
    const it = this.selItem();
    if (!me || !me.alive || !it || ITEMS[it.i].k !== 'place' || this.state !== 'play') { this.tGhost = null; return null; }
    const tg = this.target(me);
    if (!tg) { this.tGhost = null; return null; }
    const t = it.i, d = ST[t];
    let x = tg.x, y = tg.y;
    const dd = Math.hypot(x - me.x, y - me.y);
    if (dd > 200) { x = me.x + (x - me.x) / dd * 200; y = me.y + (y - me.y) / dd * 200; }
    if (d.snap) { x = Math.floor(x / SNAP) * SNAP + SNAP / 2; y = Math.floor(y / SNAP) * SNAP + SNAP / 2; }
    const why = sim.canPlace(me, t, x, y);
    this.ghost = { x, y, ok: !why, t, d, why };
    if (this.stick[1]) this.tGhost = this.ghost;
    return this.ghost;
  }

  drawGhost(R, me, sim) {
    const o = this.calcGhost(me, sim);
    if (!o) return;
    const { x, y, t, d, why } = o;
    const g = R.g, cw = R.cv.width, ch = R.cv.height, k = R.k;
    g.setTransform(k, 0, 0, k, cw / 2 - R.cam.x * k, ch / 2 - R.cam.y * k);
    g.globalAlpha = .6;
    const c = spr('st_' + t, d.hs * 2 + 16, (t === 'bed' ? d.hs * 2.8 : d.hs * 2) + 16, gg => drawStruct(gg, t));
    blit(g, c, x, y);
    g.globalAlpha = .38;
    g.fillStyle = why ? '#ff2a2a' : '#35ff6a';
    if (d.circ) { g.beginPath(); g.arc(x, y, d.hs, 0, 6.283); g.fill(); } else g.fillRect(x - d.hs, y - d.hs * (t === 'bed' ? 1.4 : 1), d.hs * 2, d.hs * (t === 'bed' ? 2.8 : 2));
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  tips(dt, me) {
    this.tipT -= dt;
    if (this.tipT > 0 || this.role === 'guest' && !this.G) return;
    this.tipT = 2;
    const inv = this.inv(), cnt = id => { let n = 0; for (const s of inv) if (s && s.i === id) n += s.n; return n; };
    const tips = [
      () => this.touch ? 'Drag the right stick toward a tree to chop it' : 'WASD to move, hold left click on a tree to chop it',
      () => cnt('wood') >= 10 && !cnt('pick_wood') ? 'You have wood. Press C to craft a pickaxe' : null,
      () => cnt('pick_wood') && !cnt('pick_stone') && cnt('stone') < 10 ? 'Stones need a pickaxe. Equip it and hit gray rocks' : null,
      () => darkOf(this.sim ? this.sim.time : 0) > .15 ? 'Night is coming. Craft a campfire and stay close to it' : null,
      () => me.food < 40 ? 'Hungry? Eat berries from bushes or hunt rabbits' : null,
      () => me.water < 40 ? 'Thirsty? Hit the water with your hand to drink' : null
    ];
    const f = tips[this.tip];
    if (!f) return;
    const m = f();
    if (m) { this.hud.note(m); this.tip++; this.tipT = 7; }
    else if (this.tip === 0) this.tipT = 1;
    else if (this.tip < tips.length) { this.tip++; }
  }

  onDeath(d) {
    this.state = 'dying';
    this.keys.clear(); this.atkMouse = this.atkKey = false;
    this.audio.play('death');
    this.api.submit(Math.round(d.days * 10) / 10);
    this.api.timeout(() => this.showDeath(this.G && this.G.deadInfo || d), 1100);
  }

  showDeath(d) {
    if (this.state !== 'dying') return;
    this.state = 'dead';
    this.hud.toggleCraft(false);
    const online = this.role !== 'solo';
    this.panel('<div class="sv-card sv-pan"><p class="sv-k">You died</p><h3>' + (d.cause ? 'Killed by ' + clean(d.cause) : 'Game over') + '</h3>' +
      '<div class="sv-stl"><div><b>' + d.days.toFixed(1) + '</b><span>Days</span></div><div><b>' + (d.kills | 0) + '</b><span>Kills</span></div><div><b>' + (d.crafted | 0) + '</b><span>Crafted</span></div></div>' +
      '<div class="sv-btns"><button class="sv-big" data-a="again" type="button">' + (online ? 'Respawn' : 'Play again') + '</button><button class="sv-big g" data-a="menu" type="button">' + (online ? 'Leave game' : 'Menu') + '</button></div></div>', {
      again: () => this.respawn(),
      menu: () => { if (online) this.leaveOnline(); else { this.run = null; this.persist(); } this.showMenu(); }
    });
  }

  respawn() {
    if (this.role === 'guest') { if (this.net && this.net.connected) this.net.send({ t: 'respawn' }); this.waitRespawn = true; this.rwT = 1.2; this.hidePanel(); this.state = 'play'; return; }
    this.sim.respawn(this.me);
    this.me.inp.mx = this.me.inp.my = this.me.inp.atk = 0;
    this.sel = 0; this.lastHp = 100; this.tip = 0; this.tipT = 3;
    this.hidePanel(); this.state = 'play';
    this.hud.slots.forEach(s => { s.key = '~'; });
    if (this.role === 'solo') { this.saveT = 2; }
  }
}

const SNAPEVERY = 3;
const SAVEKEY = 'gameplay:svsave';
const RX = 860, RY = 620, FXR = 900;
const NETO = { title: 'Starve.io', sizes: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], defaultSize: 8, min: 2, max: 16, bots: true };
const CMDS = ['craft', 'use', 'drop', 'place', 'int', 'cput', 'cget', 'cclose', 'swap'];
const rnd = Math.round;
const AKI = {};
AK.forEach((k, i) => { AKI[k] = i; });
const packInv = inv => inv.map(s => s ? [IDX[s.i], s.n] : 0);
const unpackInv = a => { const o = new Array(SLOTS_MAX).fill(null); (a || []).forEach((c, i) => { if (c && i < SLOTS_MAX && IDS[c[0]]) o[i] = { i: IDS[c[0]], n: c[1] }; }); return o; };

Object.assign(StarveGame.prototype, {
  async goOnline() {
    if (this.joining) return;
    this.joining = true;
    this.bindNet();
    this.leaveOnline(true);
    this.ensureDemo();
    this.renderer = this.demoR; this.sim = this.demo;
    this.state = 'lobby';
    this.hidePanel();
    this.fit();
    let r = null;
    try { r = await this.net.room(NETO); } catch (e) {}
    this.joining = false;
    if (this.dead) return;
    if (!r) { if (this.state === 'lobby') this.showMenu(); return; }
    if (r.role === 'host') this.hostReady(r); else this.guestWait(r);
  },

  bindNet() {
    if (this.bound) return;
    this.bound = true;
    const n = this.net;
    n.on('data', (m, from) => this.onData(m, from));
    n.on('leave', p => this.onLeave(p));
    n.on('rejoin', p => this.onRejoin(p));
    n.on('lobby', () => { if (this.role === 'guest') this.goOnline(); });
    n.on('close', why => this.onClose(why));
    this.api.on(window, 'pagehide', () => this.hostSave());
  },

  leaveOnline(keep) {
    const was = this.role;
    if (was === 'host' || was === 'guest') {
      if (this.me && this.sim) this.finishRun(true);
      if (!keep) { try { this.net.close(); } catch (e) {} }
      if (was === 'host' && !keep) { try { sessionStorage.removeItem(SAVEKEY); } catch (e) {} }
    }
    this.role = null; this.G = null; this.me = null; this.pmap = new Map(); this.rmap = new Map();
    this.fxQ.length = 0; this.waitRespawn = false;
    if (this.demo) { this.sim = this.demo; this.renderer = this.demoR; }
    this.hud.show(false);
    this.hud.touchEl.hidden = true;
    this.hud.toggleCraft(false);
    this.state = 'menu';
  },

  readSave() {
    try { const s = JSON.parse(sessionStorage.getItem(SAVEKEY)); return s && s.st && s.st.v === 1 ? s : null; } catch (e) { return null; }
  },

  hostSave() {
    if (this.role !== 'host' || !this.sim || this.sim === this.demo) return;
    const code = this.net.code || this.hcode;
    if (!code) return;
    try { sessionStorage.setItem(SAVEKEY, JSON.stringify({ code, at: Date.now(), st: this.sim.saveState() })); } catch (e) {}
  },

  hostReady(r) {
    const sv = this.readSave();
    this.rinfo = r;
    if (sv && sv.code === this.net.code && Date.now() - sv.at < 900000) {
      this.state = 'wait';
      const day = Math.floor(sv.st.time / DAY) + 1;
      this.panel('<div class="sv-card sv-pan"><p class="sv-k">Online</p><h3>Resume your game?</h3><p class="sv-t">Day ' + day + ' &middot; ' + sv.st.players.filter(p => p.ctl !== 'bot').length + ' survivors saved</p>' +
        '<div class="sv-btns"><button class="sv-big" data-a="res" type="button">Resume game</button><button class="sv-big g" data-a="new" type="button">New game</button></div></div>', {
        res: () => this.hostBegin(r, sv.st),
        new: () => this.hostBegin(r, null)
      });
    } else this.hostBegin(r, null);
  },

  link(nid, pid) { this.pmap.set(nid, pid); this.rmap.set(pid, nid); },

  hostBegin(r, st) {
    const sim = new Sim(st ? { seed: st.seed, time: st.time, sendEv: true } : { seed: NEWSEED(), sendEv: true });
    this.pmap = new Map(); this.rmap = new Map();
    let me = null;
    const list = st ? sim.loadState(st) : [], used = new Set();
    const find = (ctl, name) => { const s = list.find(q => !used.has(q) && q.ctl === ctl && (ctl === 'local' || q.name === name)); if (s) used.add(s); return s; };
    for (const pl of r.players) {
      const host = pl.id === r.id, ctl = host ? 'local' : 'remote', s = find(ctl, pl.name);
      let p;
      if (s) { p = this.restorePlayers(sim, [s], () => ({ ctl, me: 1 })); p.name = pl.name; }
      else p = sim.addPlayer({ name: pl.name, ctl });
      this.link(pl.id, p.id);
      if (host) me = p;
    }
    const nb = r.bots ? Math.max(0, r.size - r.players.length) : 0;
    let k = 0;
    for (const s of list) if (s.ctl === 'bot' && k < nb) { this.restorePlayers(sim, [s], () => ({ ctl: 'bot' })); k++; }
    for (; k < nb; k++) sim.addPlayer({ name: BOTNAMES[(k * 3 + 2) % BOTNAMES.length], ctl: 'bot' });
    sim.populate();
    sim.ev.length = 0;
    this.snapN = 0; this.fxAcc = []; this.hcode = this.net.code;
    this.begin('host', sim, me);
    for (const pl of r.players) if (pl.id !== r.id) this.sendCfg(pl.id);
    this.hostSave();
  },

  sendCfg(nid) {
    const sim = this.sim, pid = this.pmap.get(nid);
    if (pid == null || this.role !== 'host') return;
    const res = [];
    for (const o of sim.W.res) if (o.left !== o.max) res.push([o.i, o.left]);
    this.net.sendTo(nid, {
      t: 'cfg', seed: sim.seed, time: sim.time, id: pid,
      pls: [...sim.players.values()].map(p => [p.id, p.name, p.color]),
      structs: [...sim.structs.values()].map(s => sim.structPack(s)), res
    });
    const p = sim.players.get(pid);
    if (p) { p.dirty = true; p.cSig = undefined; }
  },

  onData(m, from) {
    if (!m || typeof m !== 'object') return;
    if (this.role === 'host') this.hostMsg(m, from);
    else if (this.role === 'guest') this.guestMsg(m);
  },

  hostMsg(m, from) {
    const sim = this.sim, pid = this.pmap.get(from), p = pid != null ? sim.players.get(pid) : null;
    if (!p) return;
    if (m.t === 'in') {
      const i = p.inp;
      i.mx = fin(m.mx) ? clamp(m.mx, -1, 1) : 0;
      i.my = fin(m.my) ? clamp(m.my, -1, 1) : 0;
      if (fin(m.a)) i.a = m.a;
      i.atk = m.atk ? 1 : 0;
      if (fin(m.s)) { const s = m.s | 0; if (s >= 0 && s < sim.slots(p)) p.sel = s; }
    } else if (m.t === 'cmd') {
      const c = m.c;
      if (!c || typeof c.c !== 'string' || !CMDS.includes(c.c)) return;
      const q = { c: c.c };
      if (typeof c.r === 'string') q.r = c.r.slice(0, 24);
      for (const k of ['s', 'x', 'y', 'a', 'b']) if (fin(c[k])) q[k] = c[k];
      sim.cmd(p, q);
    } else if (m.t === 'respawn') {
      if (!p.alive && p.deadT > 1) { sim.respawn(p); p.inp.mx = p.inp.my = p.inp.atk = 0; }
    } else if (m.t === 'hi') this.sendCfg(from);
  },

  onLeave(p) {
    if (this.role !== 'host' || !p) return;
    const pid = this.pmap.get(p.id);
    if (pid == null) return;
    this.sim.removePlayer(pid);
    this.pmap.delete(p.id); this.rmap.delete(pid);
  },

  onRejoin(p) {
    if (this.role === 'host' && p) this.sendCfg(p.id);
  },

  onClose(why) {
    if (this.role !== 'guest') return;
    this.leaveOnline(true);
    this.ensureDemo();
    this.showEnd(why === 'kicked' ? 'You were removed from the party' : why === 'host-left' ? 'The host left the game' : 'Connection lost');
  },

  showEnd(title) {
    this.state = 'menu';
    this.panel('<div class="sv-card sv-pan"><p class="sv-k">Online</p><h3>' + title + '</h3><div class="sv-btns"><button class="sv-big" data-a="online" type="button">New party</button><button class="sv-big g" data-a="menu" type="button">Menu</button></div></div>', {
      online: () => this.goOnline(),
      menu: () => this.showMenu()
    });
  },

  hostPost() {
    const sim = this.sim, net = this.net;
    if (sim.fx.length) {
      for (const f of sim.fx) this.fxAcc.push(f);
      if (this.fxAcc.length > 300) this.fxAcc.splice(0, this.fxAcc.length - 300);
    }
    if (sim.ev.length) {
      const e = [];
      for (const x of sim.ev) {
        if (x.k === 'dead') {
          const nid = this.rmap.get(x.id), q = sim.players.get(x.id);
          if (nid != null && nid !== net.id) net.sendTo(nid, { t: 'dead', days: x.days, kills: x.kills, cause: x.cause, crafted: q ? q.crafted : 0 });
        } else e.push(x);
      }
      if (e.length && this.pmap.size > 1) net.send({ t: 'ev', e });
    }
    if (++this.snapN % SNAPEVERY === 0) this.sendSnaps();
  },

  sendSnaps() {
    const sim = this.sim, net = this.net, ts = rnd(sim.time * 100) / 100, lbOn = this.snapN % (SNAPEVERY * 7) === 0;
    for (const [nid, pid] of this.pmap) {
      if (nid === this.rinfo.id) continue;
      const p = sim.players.get(pid);
      if (!p) continue;
      const px = p.x, py = p.y;
      const near = (x, y) => Math.abs(x - px) < RX && Math.abs(y - py) < RY;
      const ps = [], an = [], dr = [], pj = [];
      for (const q of sim.players.values()) if (q !== p && q.alive && near(q.x, q.y)) ps.push([q.id, rnd(q.x), rnd(q.y), rnd(q.a * 100), rnd(q.hp), (q.sleeping ? 1 : 0) | (q.hurt > 0 ? 2 : 0) | (q.head ? 4 : 0) | (q.body ? 8 : 0), q.tool ? IDX[q.tool] : -1, rnd(q.swing * 100)]);
      for (const a of sim.animals.values()) if (near(a.x, a.y)) an.push([a.id, AKI[a.k], rnd(a.x), rnd(a.y), rnd(a.a * 100), rnd(a.hp), a.flash > 0 ? 1 : 0]);
      for (const d of sim.drops.values()) if (dr.length < 60 && near(d.x, d.y)) dr.push([d.id, IDX[d.i], rnd(d.x), rnd(d.y), d.n]);
      for (const q of sim.projs.values()) if (near(q.x, q.y)) pj.push([q.id, rnd(q.x), rnd(q.y)]);
      const fx = this.fxAcc.filter(f => Math.abs(f[1] - px) < FXR && Math.abs(f[2] - py) < FXR);
      const msg = {
        t: 's', ts, m: [rnd(p.x), rnd(p.y), rnd(p.hp), rnd(p.food), rnd(p.water), rnd(p.cold), (p.alive ? 1 : 0) | (p.sleeping ? 2 : 0) | (p.hurt > 0 ? 4 : 0), rnd(p.swing * 100), rnd(sim.days(p) * 100), p.kills],
        p: ps, a: an, d: dr, q: pj, f: fx
      };
      if (lbOn) msg.l = sim.lb;
      net.sendTo(nid, msg, true);
      if (p.dirty) { p.dirty = false; net.sendTo(nid, { t: 'inv', inv: packInv(p.inv), bag: p.bag, head: p.head, body: p.body }); }
      if (p.notes.length) net.sendTo(nid, { t: 'note', m: p.notes.splice(0) });
      const cs = p.chest ? sim.structs.get(p.chest) : null, sig = cs && cs.inv ? JSON.stringify(cs.inv) : '';
      if (p.cSig !== sig) { p.cSig = sig; net.sendTo(nid, { t: 'chest', inv: sig ? packInv(cs.inv) : null }); }
    }
    this.fxAcc.length = 0;
  },

  guestWait(r) {
    this.role = 'guest'; this.state = 'wait'; this.G = null; this.rinfo = r;
    this.panel('<div class="sv-card sv-pan"><p class="sv-k">Online</p><h3>Waiting for the host&hellip;</h3><p class="sv-t">Joining the world.</p></div>', {});
    const hi = () => { if (this.role === 'guest' && !this.G && this.net.connected) this.net.send({ t: 'hi' }); };
    hi();
    if (!this.hiT) this.hiT = this.api.interval(hi, 1500);
  },

  guestMsg(m) {
    const G = this.G;
    if (m.t === 'cfg') return this.guestCfg(m);
    if (!G) return;
    if (m.t === 's') this.guestSnap(m);
    else if (m.t === 'ev' && Array.isArray(m.e)) { for (const e of m.e) this.guestEv(e); }
    else if (m.t === 'inv') {
      G.inv = unpackInv(m.inv); G.bag = m.bag ? 1 : 0;
      G.me.head = typeof m.head === 'string' ? m.head : null; G.me.body = typeof m.body === 'string' ? m.body : null;
      G.me.inv = G.inv; G.me.bag = G.bag;
    } else if (m.t === 'chest') { G.chest = m.inv ? unpackInv(m.inv).slice(0, 12) : null; G.me.chest = G.chest ? 1 : 0; }
    else if (m.t === 'note' && Array.isArray(m.m)) { for (const s of m.m) G.me.notes.push(String(s).slice(0, 80)); }
    else if (m.t === 'dead') G.deadInfo = { days: fin(m.days) ? m.days : G.days, kills: m.kills | 0, crafted: m.crafted | 0, cause: m.cause || '' };
  },

  guestCfg(m) {
    if (!fin(m.seed) || !Array.isArray(m.pls)) return;
    let G = this.G;
    if (!G || G.seed !== m.seed) {
      const mirror = new Sim({ seed: m.seed, time: m.time });
      const me = { id: m.id, name: this.myName(), color: '#f2c48d', ctl: 'local', x: 0, y: 0, vx: 0, vy: 0, a: 0, hp: 100, food: 100, water: 100, cold: 100, alive: true, sleeping: false, hurt: 0, swing: 0, head: null, body: null, tool: null, kills: 0, crafted: 0, inp: { mx: 0, my: 0, a: 0, atk: 0 }, notes: [], inv: new Array(SLOTS_MAX).fill(null), bag: 0, sel: 0, chest: 0, cd: 0 };
      G = this.G = { seed: m.seed, mirror, me, names: new Map(), pv: new Map(), av: new Map(), qv: new Map(), drops: [], inv: me.inv, bag: 0, chest: null, lb: [], sn: 0, ts: m.time, tsAt: performance.now(), days: 0, inT: 0, started: false, inp: null, deadInfo: null };
    }
    const mirror = G.mirror;
    G.me.id = m.id; G.id = m.id;
    G.names.clear();
    for (const [id, name, color] of m.pls) G.names.set(id, { name: clean(name), color: /^#[0-9a-f]{3,8}$/i.test(color) ? color : '#ddd' });
    const mine = G.names.get(m.id);
    if (mine) { G.me.name = mine.name; G.me.color = mine.color; }
    for (const s of [...mirror.structs.values()]) mirror.delStruct(s);
    for (const o of mirror.W.res) o.left = o.max;
    for (const [i, l] of m.res || []) { const o = mirror.W.res[i]; if (o) o.left = l; }
    for (const s of m.structs || []) if (Array.isArray(s) && ST[s[1]]) mirror.addStruct(s[1], s[2], s[3], s[4], { id: s[0], hp: s[5], open: s[6], fuel: s[7], inv: null });
  },

  guestEv(e) {
    const G = this.G, mirror = G.mirror;
    if (!e || typeof e !== 'object') return;
    if (e.k === 'sa') { const s = e.s; if (Array.isArray(s) && ST[s[1]] && !mirror.structs.has(s[0])) mirror.addStruct(s[1], s[2], s[3], s[4], { id: s[0], hp: s[5], open: s[6], fuel: s[7], inv: null }); }
    else if (e.k === 'sd') { const s = mirror.structs.get(e.id); if (s) mirror.delStruct(s); }
    else if (e.k === 'su') { const s = mirror.structs.get(e.id); if (s) { s.hp = e.hp; s.open = e.open; s.fuel = e.fuel; } }
    else if (e.k === 'r') { const o = mirror.W.res[e.i]; if (o) o.left = e.l; }
    else if (e.k === 'pl') G.names.set(e.id, { name: clean(e.name), color: e.color });
    else if (e.k === 'plx') { G.names.delete(e.id); G.pv.delete(e.id); }
  },

  track(map, id, t, x, y, a, init, sn) {
    let e = map.get(id);
    if (!e) { e = init(); e.s = []; e.x = x; e.y = y; e.a = a; map.set(id, e); }
    e.s.push({ t, x, y, a });
    if (e.s.length > 5) e.s.shift();
    e.seen = sn;
    return e;
  },

  guestSnap(m) {
    const G = this.G, mirror = G.mirror, me = G.me, now = performance.now(), q = m.m;
    if (!Array.isArray(q) || q.length < 10) return;
    G.sn++;
    G.ts = m.ts; G.tsAt = now;
    const was = me.alive, alive = !!(q[6] & 1);
    me.hp = q[2]; me.food = q[3]; me.water = q[4]; me.cold = q[5];
    me.sleeping = !!(q[6] & 2); me.hurt = q[6] & 4 ? .2 : 0; me.swing = q[7] / 100; G.days = q[8] / 100; me.kills = q[9];
    me.alive = alive;
    if (!G.started) {
      me.x = q[0]; me.y = q[1];
      G.started = true;
      this.begin('guest', mirror, me);
      this.lastHp = me.hp;
    } else if (!was && alive) {
      me.x = q[0]; me.y = q[1]; me.vx = me.vy = 0;
      this.waitRespawn = false; this.sel = 0; this.lastHp = 100; this.tip = 0; this.tipT = 3; G.deadInfo = null;
      this.hud.slots.forEach(s => { s.key = '~'; });
    } else {
      const dx = q[0] - me.x, dy = q[1] - me.y, d = Math.hypot(dx, dy), moving = G.inp && (G.inp.mx || G.inp.my);
      const k = d > 150 || me.sleeping || !alive ? 1 : d > 40 ? .25 : !moving ? .35 : .03;
      me.x += dx * k; me.y += dy * k;
    }
    for (const e of m.p || []) {
      const nm = G.names.get(e[0]);
      const v = this.track(G.pv, e[0], now, e[1], e[2], e[3] / 100, () => ({ id: e[0], alive: true, vx: 0, vy: 0, name: '?', color: '#ddd' }), G.sn);
      if (nm) { v.name = nm.name; v.color = nm.color; }
      v.hp = e[4]; v.sleeping = !!(e[5] & 1); v.hurt = e[5] & 2 ? .2 : 0; v.head = e[5] & 4 ? 'hat' : null; v.body = e[5] & 8 ? 'coat' : null;
      v.tool = e[6] >= 0 ? IDS[e[6]] || null : null; v.swing = e[7] / 100;
    }
    for (const e of m.a || []) {
      const k = AK[e[1]];
      if (!k) continue;
      const v = this.track(G.av, e[0], now, e[2], e[3], e[4] / 100, () => ({ id: e[0], k, mhp: AN[k].hp, anim: 0, flash: 0, w: mirror.W.at(e[2], e[3]) === TW ? 1 : 0, mode: 'idle' }), G.sn);
      v.hp = e[5]; v.flash = e[6] ? .2 : 0;
    }
    for (const e of m.q || []) this.track(G.qv, e[0], now, e[1], e[2], 0, () => ({ id: e[0] }), G.sn);
    for (const mp of [G.pv, G.av, G.qv]) for (const [id, v] of mp) if (v.seen !== G.sn) mp.delete(id);
    G.drops = (m.d || []).map(e => ({ id: e[0], i: IDS[e[1]], x: e[2], y: e[3], n: e[4], t: 0 })).filter(d => d.i);
    for (const f of m.f || []) if (this.fxQ.length < 200) this.fxQ.push(f);
    if (m.l) G.lb = m.l;
  },

  lerpTrack(e, rt, dt, animal) {
    const s = e.s;
    let j = 0;
    while (j < s.length && s[j].t <= rt) j++;
    let x, y, a;
    if (j === 0) { x = s[0].x; y = s[0].y; a = s[0].a; }
    else if (j === s.length) { const l = s[j - 1]; x = l.x; y = l.y; a = l.a; }
    else {
      const p = s[j - 1], n = s[j], f = clamp((rt - p.t) / Math.max(1, n.t - p.t), 0, 1);
      if (Math.hypot(n.x - p.x, n.y - p.y) > 300) { x = n.x; y = n.y; a = n.a; }
      else { x = lerp(p.x, n.x, f); y = lerp(p.y, n.y, f); a = lerpAng(p.a, n.a, f); }
    }
    const dx = x - e.x, dy = y - e.y;
    if (dt > 0) { e.vx = dx / dt; e.vy = dy / dt; }
    if (animal) e.anim += Math.hypot(dx, dy) * .06;
    e.x = x; e.y = y; e.a = a;
  },

  guestFrame(dt, now) {
    const G = this.G, mirror = G.mirror, me = G.me, net = this.net;
    G.inp = this.readInput(me);
    this.acc += dt;
    let n = 0;
    while (this.acc >= STEP && n < 4) {
      this.acc -= STEP; n++;
      if (me.alive && !me.sleeping) mirror.walk(me, STEP, G.inp.mx, G.inp.my);
      else me.vx = me.vy = 0;
    }
    if (n === 4) this.acc = 0;
    if (me.alive) me.a = G.inp.a;
    me.sel = this.sel;
    const si = G.inv[this.sel];
    me.tool = si && ITEMS[si.i].k === 'tool' ? si.i : null;
    me.swing = Math.max(0, me.swing - dt * 4);
    me.hurt = Math.max(0, me.hurt - dt);
    G.inT -= dt;
    if (G.inT <= 0 && net.connected) {
      G.inT = .05;
      const i = G.inp;
      net.send({ t: 'in', mx: rnd(i.mx * 100) / 100, my: rnd(i.my * 100) / 100, a: rnd(i.a * 100) / 100, atk: i.atk, s: this.sel }, true);
    }
    if (this.waitRespawn && !me.alive) {
      this.rwT -= dt;
      if (this.rwT <= 0) { this.rwT = 1.2; if (net.connected) net.send({ t: 'respawn' }); }
    }
    mirror.time = G.ts + (performance.now() - G.tsAt) / 1000;
    const rt = performance.now() - 110;
    for (const e of G.pv.values()) this.lerpTrack(e, rt, dt, false);
    for (const e of G.av.values()) this.lerpTrack(e, rt, dt, true);
    for (const e of G.qv.values()) this.lerpTrack(e, rt, dt, false);
    const v = this.view || (this.view = {});
    v.time = mirror.time;
    v.drops = G.drops; v.structs = [...mirror.structs.values()]; v.animals = [...G.av.values()];
    v.players = [...G.pv.values()]; v.players.push(me); v.projs = [...G.qv.values()];
    v.me = me; v.cam = me;
    this.render(v, dt);
  },

  guestHud(days) {
    const G = this.G, me = G.me;
    const rows = this.lbRows(G.lb, id => { const q = G.names.get(id); return q ? q.name : '?'; }, G.id, days);
    return {
      bag: G.bag, inv: G.inv, sel: this.sel, hp: me.hp, food: me.food, water: me.water, cold: me.cold, time: G.mirror.time, days,
      head: me.head, body: me.body, station: lv => G.mirror.station(me, lv), chest: G.chest, sleeping: me.sleeping, lb: rows
    };
  }
});

const EXTRA = `
.gm-starve .sv-big small{display:block}
.gm-starve .sv-wrap{width:min(100%,1180px,calc((100dvh - var(--goff,250px))*1.78));aspect-ratio:1180/664;margin:0 auto}
@media (pointer:coarse) and (orientation:landscape){.gm-starve .sv-wrap{width:min(100%,calc((100dvh - var(--goff,250px))*1.6));aspect-ratio:8/5}}
@media (max-width:700px) and (orientation:portrait){.gm-starve .sv-wrap{width:100%;aspect-ratio:4/5;max-height:calc(100dvh - var(--goff,250px))}}
`;

Ameplay.register({
  id: ID,
  title: 'Starve.io',
  category: 'Action',
  tint: '#3f8f4a',
  blurb: 'Survive the wild: gather, craft and keep a fire burning through freezing nights. Solo or in a shared world with up to 16 players.',
  help: HELP,
  better: 'high',
  format: v => (Math.round(v * 10) / 10) + ' days',
  width: 1180,
  icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8c6 8 11 14 11 22a11 11 0 0 1-22 0c0-4 2-7 4-9 1 3 3 4 4 4-1-6 0-10 3-17z"/><path d="M14 54l36-12M14 42l36 12"/></svg>',
  _t: { Sim, genWorld, darkOf, phaseOf, ITEMS, RECIPES, ST, AN, RES, StarveGame },
  css: CSS + EXTRA,
  mount(root, api) {
    const g = new StarveGame(root, api);
    if (api.net.invite) g.goOnline(); else g.showMenu();
    return { destroy() { g.destroy(); } };
  }
});

Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="svc-g" cx="50%" cy="55%" r="65%"><stop offset="0" stop-color="#5fae52"/><stop offset="1" stop-color="#2f6a3a"/></radialGradient><radialGradient id="svc-f" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd35a" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#svc-g)"/><rect x="250" width="150" height="300" fill="#dff1f7" opacity=".55"/><circle cx="205" cy="165" r="95" fill="url(#svc-f)"/><g stroke="#2a1e12" stroke-width="5" stroke-linecap="round"><path d="M180 178l50-26" stroke="#8a5a2c"/><path d="M180 152l50 26" stroke="#8a5a2c"/></g><path d="M205 128c12 14 20 22 20 34a20 20 0 0 1-40 0c0-8 4-13 8-17 2 5 5 7 7 7-2-10 0-16 5-24z" fill="#ff8a1c" stroke="#7a2a08" stroke-width="4"/><path d="M205 150c6 6 9 10 9 15a9 9 0 0 1-18 0c0-4 3-7 5-9z" fill="#ffd35a"/><g stroke="#16401e" stroke-width="5"><circle cx="70" cy="70" r="38" fill="#3f9a4a"/><circle cx="60" cy="240" r="46" fill="#3f9a4a"/><circle cx="330" cy="215" r="34" fill="#9fd3e0" stroke="#4a8a9c"/></g><g stroke="#2a2a30" stroke-width="5"><circle cx="330" cy="70" r="26" fill="#9aa2ad"/><circle cx="130" cy="262" r="20" fill="#f2c230" stroke="#7a5a08"/></g><g stroke="#3a2a1a" stroke-width="4"><circle cx="278" cy="140" r="22" fill="#f2c48d"/><circle cx="296" cy="128" r="7" fill="#f2c48d"/><circle cx="296" cy="152" r="7" fill="#f2c48d"/></g></svg>`;

}
})();
