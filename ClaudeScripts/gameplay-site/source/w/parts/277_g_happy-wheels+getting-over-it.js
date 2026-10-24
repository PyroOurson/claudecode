(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const rint = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const hyp = Math.hypot, sin = Math.sin, cos = Math.cos, atan2 = Math.atan2, sqrt = Math.sqrt, abs = Math.abs, min = Math.min, max = Math.max;
  const angN = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
  const fmtT = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(2); };
  const fmtHMS = s => { s = Math.floor(Math.max(0, s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (r < 10 ? '0' : '') + r; };
  const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  const PH = (() => {
    const SLOP = .006, CORR = .2, MAXCOR = 2.5, MARGIN = .05, VMAX = 75, WMAX = 45;
    let SID = 1, BID = 1;

    const polyShape = (pts, o) => {
      let n = pts.length / 2, a = 0;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; a += pts[2 * i] * pts[2 * j + 1] - pts[2 * j] * pts[2 * i + 1]; }
      const vx = [], vy = [];
      for (let i = 0; i < n; i++) { const k = a < 0 ? n - 1 - i : i; vx.push(pts[2 * k]); vy.push(pts[2 * k + 1]); }
      const s = { t: 1, n, vx, vy, nx: [], ny: [], wx: new Array(n).fill(0), wy: new Array(n).fill(0), wnx: new Array(n).fill(0), wny: new Array(n).fill(0) };
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n, dx = vx[j] - vx[i], dy = vy[j] - vy[i], l = hyp(dx, dy) || 1;
        s.nx.push(dy / l); s.ny.push(-dx / l);
      }
      return base(s, o);
    };
    const base = (s, o = {}) => {
      s.d = o.d ?? 1; s.f = o.f ?? .6; s.e = o.e ?? 0; s.bounce = o.bounce ?? 0; s.tag = o.tag; s.sid = SID++; s.x0 = s.x1 = s.y0 = s.y1 = 0; s.ud = o.ud; s.nocol = o.nocol;
      return s;
    };
    const circle = (r, ox = 0, oy = 0, o) => base({ t: 0, r, ox, oy, cx: 0, cy: 0 }, o);
    const box = (hw, hh, ox = 0, oy = 0, a = 0, o) => {
      const c = cos(a), s = sin(a), p = [];
      for (const [x, y] of [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]) p.push(ox + c * x - s * y, oy + s * x + c * y);
      return polyShape(p, o);
    };
    const poly = (pts, o) => polyShape(pts, o);

    class Body {
      constructor(o = {}) {
        this.id = BID++;
        this.x = o.x || 0; this.y = o.y || 0; this.a = o.a || 0;
        this.vx = o.vx || 0; this.vy = o.vy || 0; this.w = o.w || 0;
        this.fx = 0; this.fy = 0; this.tq = 0;
        this.shapes = []; this.static = !!o.static; this.kin = !!o.kin;
        this.group = o.group || 0; this.cat = o.cat ?? 1; this.mask = o.mask ?? 0xffff;
        this.ld = o.ld ?? .05; this.ad = o.ad ?? .08; this.gs = o.gs ?? 1;
        this.m = 0; this.im = 0; this.I = 0; this.ii = 0; this.cs = 1; this.sn = 0;
        this.lx = 0; this.ly = 0; this.ud = o.ud; this.active = true; this.imp = 0; this.mark = 0;
        this.x0 = this.x1 = this.y0 = this.y1 = 0; this.kind = o.kind; this.dead = false; this.tag = o.tag;
        this.cr = 0;
      }
      add(s) { this.shapes.push(s); s.body = this; return this; }
      finalize() {
        if (this.static || this.kin) { this.im = 0; this.ii = 0; this.m = 0; this.I = 0; }
        let M = 0, cx = 0, cy = 0, I0 = 0;
        for (const s of this.shapes) {
          if (s.t === 0) {
            const m = s.d * Math.PI * s.r * s.r;
            M += m; cx += m * s.ox; cy += m * s.oy; I0 += m * (s.r * s.r / 2 + s.ox * s.ox + s.oy * s.oy);
          } else {
            let A = 0, ccx = 0, ccy = 0, I = 0;
            for (let i = 0; i < s.n; i++) {
              const j = (i + 1) % s.n, x1 = s.vx[i], y1 = s.vy[i], x2 = s.vx[j], y2 = s.vy[j], cr = x1 * y2 - x2 * y1;
              A += cr / 2; ccx += (x1 + x2) * cr / 6; ccy += (y1 + y2) * cr / 6;
              I += cr * (x1 * x1 + x1 * x2 + x2 * x2 + y1 * y1 + y1 * y2 + y2 * y2) / 12;
            }
            M += s.d * A; cx += s.d * ccx; cy += s.d * ccy; I0 += s.d * I;
          }
        }
        if (M > 0) { cx /= M; cy /= M; } else { cx = cy = 0; }
        const dyn = !this.static && !this.kin && M > 0;
        if (dyn && (cx !== 0 || cy !== 0)) {
          for (const s of this.shapes) {
            if (s.t === 0) { s.ox -= cx; s.oy -= cy; } else for (let i = 0; i < s.n; i++) { s.vx[i] -= cx; s.vy[i] -= cy; }
          }
          const c = cos(this.a), sn = sin(this.a);
          this.x += c * cx - sn * cy; this.y += sn * cx + c * cy;
          this.lx = -cx; this.ly = -cy;
        }
        if (dyn) {
          this.m = M; this.im = 1 / M;
          this.I = Math.max(1e-4, I0 - M * (cx * cx + cy * cy)); this.ii = 1 / this.I;
        }
        this.upd();
        return this;
      }
      upd() {
        const c = this.cs = cos(this.a), s = this.sn = sin(this.a);
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const sh of this.shapes) {
          if (sh.t === 0) {
            sh.cx = this.x + c * sh.ox - s * sh.oy; sh.cy = this.y + s * sh.ox + c * sh.oy;
            sh.x0 = sh.cx - sh.r; sh.x1 = sh.cx + sh.r; sh.y0 = sh.cy - sh.r; sh.y1 = sh.cy + sh.r;
          } else {
            let a0 = 1e9, b0 = 1e9, a1 = -1e9, b1 = -1e9;
            for (let i = 0; i < sh.n; i++) {
              const x = sh.vx[i], y = sh.vy[i], wx = this.x + c * x - s * y, wy = this.y + s * x + c * y;
              sh.wx[i] = wx; sh.wy[i] = wy;
              sh.wnx[i] = c * sh.nx[i] - s * sh.ny[i]; sh.wny[i] = s * sh.nx[i] + c * sh.ny[i];
              if (wx < a0) a0 = wx; if (wx > a1) a1 = wx; if (wy < b0) b0 = wy; if (wy > b1) b1 = wy;
            }
            sh.x0 = a0; sh.x1 = a1; sh.y0 = b0; sh.y1 = b1;
          }
          if (sh.x0 < x0) x0 = sh.x0; if (sh.x1 > x1) x1 = sh.x1; if (sh.y0 < y0) y0 = sh.y0; if (sh.y1 > y1) y1 = sh.y1;
        }
        this.x0 = x0; this.x1 = x1; this.y0 = y0; this.y1 = y1;
      }
      rot() { this.cs = cos(this.a); this.sn = sin(this.a); }
      lp(wx, wy) { const dx = wx - this.x, dy = wy - this.y; return [this.cs * dx + this.sn * dy, -this.sn * dx + this.cs * dy]; }
      wp(lx, ly) { return [this.x + this.cs * lx - this.sn * ly, this.y + this.sn * lx + this.cs * ly]; }
      vel(wx, wy) { return [this.vx - this.w * (wy - this.y), this.vy + this.w * (wx - this.x)]; }
      push(ix, iy, wx, wy) { this.vx += ix * this.im; this.vy += iy * this.im; this.w += ((wx - this.x) * iy - (wy - this.y) * ix) * this.ii; }
    }

    const colCC = (A, B, m) => {
      const dx = B.cx - A.cx, dy = B.cy - A.cy, r = A.r + B.r + MARGIN, d2 = dx * dx + dy * dy;
      if (d2 > r * r) return 0;
      const d = sqrt(d2);
      let nx = 1, ny = 0;
      if (d > 1e-9) { nx = dx / d; ny = dy / d; }
      m.nx = nx; m.ny = ny; m.n = 1;
      m.px[0] = (A.cx + nx * A.r + B.cx - nx * B.r) / 2; m.py[0] = (A.cy + ny * A.r + B.cy - ny * B.r) / 2;
      m.sep[0] = d - A.r - B.r; m.id[0] = 0;
      return 1;
    };
    const colPC = (P, C, m) => {
      const n = P.n, r = C.r + MARGIN;
      let best = -1e9, bi = 0;
      for (let i = 0; i < n; i++) {
        const s = P.wnx[i] * (C.cx - P.wx[i]) + P.wny[i] * (C.cy - P.wy[i]);
        if (s > r) return 0;
        if (s > best) { best = s; bi = i; }
      }
      const bj = bi + 1 === n ? 0 : bi + 1, v1x = P.wx[bi], v1y = P.wy[bi], v2x = P.wx[bj], v2y = P.wy[bj];
      const ex = v2x - v1x, ey = v2y - v1y;
      const u1 = (C.cx - v1x) * ex + (C.cy - v1y) * ey, u2 = -((C.cx - v2x) * ex + (C.cy - v2y) * ey);
      m.n = 1;
      if (u1 <= 0 || u2 <= 0) {
        const vx = u1 <= 0 ? v1x : v2x, vy = u1 <= 0 ? v1y : v2y;
        const dx = C.cx - vx, dy = C.cy - vy, d = hyp(dx, dy);
        if (d > r) return 0;
        if (d > 1e-9) { m.nx = dx / d; m.ny = dy / d; } else { m.nx = P.wnx[bi]; m.ny = P.wny[bi]; }
        m.sep[0] = d - C.r; m.px[0] = (vx + C.cx - m.nx * C.r) / 2; m.py[0] = (vy + C.cy - m.ny * C.r) / 2; m.id[0] = u1 <= 0 ? 1 : 2;
        return 1;
      }
      m.nx = P.wnx[bi]; m.ny = P.wny[bi]; m.sep[0] = best - C.r;
      m.px[0] = C.cx - m.nx * (C.r + best) / 2; m.py[0] = C.cy - m.ny * (C.r + best) / 2; m.id[0] = 0;
      return 1;
    };
    const maxSep = (A, B, out) => {
      let best = -1e9, bi = 0;
      for (let i = 0; i < A.n; i++) {
        const nx = A.wnx[i], ny = A.wny[i], px = A.wx[i], py = A.wy[i];
        let s = 1e9;
        for (let j = 0; j < B.n; j++) { const d = nx * (B.wx[j] - px) + ny * (B.wy[j] - py); if (d < s) s = d; }
        if (s > best) { best = s; bi = i; }
      }
      out.s = best; out.i = bi;
    };
    const ms1 = { s: 0, i: 0 }, ms2 = { s: 0, i: 0 };
    const cp = [0, 0, 0, 0];
    const clipSeg = (ax, ay, bx, by, nx, ny, off, out) => {
      const d0 = nx * ax + ny * ay - off, d1 = nx * bx + ny * by - off;
      let k = 0;
      if (d0 <= 0) { out[k++] = ax; out[k++] = ay; }
      if (d1 <= 0) { out[k++] = bx; out[k++] = by; }
      if (d0 * d1 < 0) { const t = d0 / (d0 - d1); out[k++] = ax + (bx - ax) * t; out[k++] = ay + (by - ay) * t; }
      return k / 2;
    };
    const c1 = [0, 0, 0, 0, 0, 0], c2 = [0, 0, 0, 0, 0, 0];
    const colPP = (A, B, m) => {
      maxSep(A, B, ms1); if (ms1.s > MARGIN) return 0;
      maxSep(B, A, ms2); if (ms2.s > MARGIN) return 0;
      const flip = ms2.s > ms1.s + .0008;
      const R = flip ? B : A, I = flip ? A : B, e = flip ? ms2.i : ms1.i;
      const nx = R.wnx[e], ny = R.wny[e];
      let k = 0, md = 1e9;
      for (let i = 0; i < I.n; i++) { const d = I.wnx[i] * nx + I.wny[i] * ny; if (d < md) { md = d; k = i; } }
      const k2 = k + 1 === I.n ? 0 : k + 1, e2 = e + 1 === R.n ? 0 : e + 1;
      const v1x = R.wx[e], v1y = R.wy[e], v2x = R.wx[e2], v2y = R.wy[e2];
      let tx = v2x - v1x, ty = v2y - v1y; const tl = hyp(tx, ty) || 1; tx /= tl; ty /= tl;
      let nc = clipSeg(I.wx[k], I.wy[k], I.wx[k2], I.wy[k2], -tx, -ty, -(tx * v1x + ty * v1y), c1);
      if (nc < 2) return 0;
      nc = clipSeg(c1[0], c1[1], c1[2], c1[3], tx, ty, tx * v2x + ty * v2y, c2);
      if (nc < 2) return 0;
      m.nx = flip ? -nx : nx; m.ny = flip ? -ny : ny; m.n = 0;
      for (let q = 0; q < 2; q++) {
        const px = c2[2 * q], py = c2[2 * q + 1], s = nx * (px - v1x) + ny * (py - v1y);
        if (s > MARGIN) continue;
        const i = m.n++;
        m.px[i] = px - nx * s / 2; m.py[i] = py - ny * s / 2; m.sep[i] = s; m.id[i] = (flip ? 32 : 0) + e * 2 + q;
      }
      return m.n;
    };
    const MF = { n: 0, nx: 0, ny: 0, px: [0, 0], py: [0, 0], sep: [0, 0], id: [0, 0] };
    const collide = (A, B, m = MF) => {
      if (A.t === 1) {
        if (B.t === 1) return colPP(A, B, m);
        return colPC(A, B, m);
      }
      if (B.t === 1) {
        const r = colPC(B, A, m);
        if (r) { m.nx = -m.nx; m.ny = -m.ny; }
        return r;
      }
      return colCC(A, B, m);
    };

    const crossv = (ax, ay, bx, by) => ax * by - ay * bx;

    class Rev {
      constructor(a, b, wx, wy, o = {}) {
        this.a = a; this.b = b; [this.lax, this.lay] = a.lp(wx, wy); [this.lbx, this.lby] = b.lp(wx, wy);
        this.lo = o.lo; this.hi = o.hi; this.lim = o.lo !== undefined;
        this.ms = o.ms || 0; this.maxT = o.maxT || 0; this.servo = o.servo || null;
        this.breakAt = o.breakAt || 0; this.Px = 0; this.Py = 0; this.Pm = 0; this.Pl = 0; this.Pu = 0; this.dead = false; this.kind = o.kind; this.ud = o.ud;
      }
      angle() { return this.b.a - this.a.a; }
      prep(dt) {
        const a = this.a, b = this.b;
        this.rax = a.cs * this.lax - a.sn * this.lay; this.ray = a.sn * this.lax + a.cs * this.lay;
        this.rbx = b.cs * this.lbx - b.sn * this.lby; this.rby = b.sn * this.lbx + b.cs * this.lby;
        const mA = a.im, mB = b.im, iA = a.ii, iB = b.ii;
        this.k11 = mA + mB + this.ray * this.ray * iA + this.rby * this.rby * iB;
        this.k12 = -this.ray * this.rax * iA - this.rby * this.rbx * iB;
        this.k22 = mA + mB + this.rax * this.rax * iA + this.rbx * this.rbx * iB;
        const det = this.k11 * this.k22 - this.k12 * this.k12;
        this.det = det ? 1 / det : 0;
        this.am = iA + iB > 0 ? 1 / (iA + iB) : 0;
        if (this.servo) {
          const s = this.servo, ang = this.angle();
          this.ms = clamp((s.t - ang) * s.kp, -s.vmax, s.vmax); this.maxT = s.maxT;
        }
        if (!this.maxT) this.Pm = 0;
        this.warm();
      }
      warm() {
        const a = this.a, b = this.b, L = this.Pm + this.Pl - this.Pu;
        a.vx -= a.im * this.Px; a.vy -= a.im * this.Py; a.w -= a.ii * (crossv(this.rax, this.ray, this.Px, this.Py) + L);
        b.vx += b.im * this.Px; b.vy += b.im * this.Py; b.w += b.ii * (crossv(this.rbx, this.rby, this.Px, this.Py) + L);
      }
      vel(dt) {
        const a = this.a, b = this.b, mA = a.im, mB = b.im, iA = a.ii, iB = b.ii;
        if (this.maxT && this.am) {
          const C = b.w - a.w - this.ms, mx = this.maxT * dt;
          const old = this.Pm; this.Pm = clamp(old - this.am * C, -mx, mx);
          const i = this.Pm - old; a.w -= iA * i; b.w += iB * i;
        }
        if (this.lim && this.am) {
          const ang = this.angle(), inv = 1 / dt;
          let C = ang - this.lo, Cd = b.w - a.w, i = -this.am * (Cd + max(C, 0) * inv), old = this.Pl;
          this.Pl = max(old + i, 0); i = this.Pl - old; a.w -= iA * i; b.w += iB * i;
          C = this.hi - ang; Cd = a.w - b.w; i = -this.am * (Cd + max(C, 0) * inv); old = this.Pu;
          this.Pu = max(old + i, 0); i = this.Pu - old; a.w += iA * i; b.w -= iB * i;
        }
        const cx = b.vx - b.w * this.rby - a.vx + a.w * this.ray, cy = b.vy + b.w * this.rbx - a.vy - a.w * this.rax;
        const bx = -cx, by = -cy, ix = this.det * (this.k22 * bx - this.k12 * by), iy = this.det * (this.k11 * by - this.k12 * bx);
        this.Px += ix; this.Py += iy;
        a.vx -= mA * ix; a.vy -= mA * iy; a.w -= iA * crossv(this.rax, this.ray, ix, iy);
        b.vx += mB * ix; b.vy += mB * iy; b.w += iB * crossv(this.rbx, this.rby, ix, iy);
      }
      pos() {
        const a = this.a, b = this.b;
        if (this.lim && this.am) {
          const ang = this.angle();
          let C = 0;
          if (ang < this.lo) C = clamp(ang - this.lo + .005, -.12, 0); else if (ang > this.hi) C = clamp(ang - this.hi - .005, 0, .12);
          if (C) { const i = -this.am * C; a.a -= a.ii * i; b.a += b.ii * i; a.rot(); b.rot(); }
        }
        const rax = a.cs * this.lax - a.sn * this.lay, ray = a.sn * this.lax + a.cs * this.lay, rbx = b.cs * this.lbx - b.sn * this.lby, rby = b.sn * this.lbx + b.cs * this.lby;
        const Cx = b.x + rbx - a.x - rax, Cy = b.y + rby - a.y - ray;
        const mA = a.im, mB = b.im, iA = a.ii, iB = b.ii;
        const k11 = mA + mB + ray * ray * iA + rby * rby * iB, k12 = -ray * rax * iA - rby * rbx * iB, k22 = mA + mB + rax * rax * iA + rbx * rbx * iB;
        const d = k11 * k22 - k12 * k12; if (!d) return;
        const ix = -(k22 * Cx - k12 * Cy) / d, iy = -(k11 * Cy - k12 * Cx) / d;
        a.x -= mA * ix; a.y -= mA * iy; a.a -= iA * crossv(rax, ray, ix, iy);
        b.x += mB * ix; b.y += mB * iy; b.a += iB * crossv(rbx, rby, ix, iy);
        a.rot(); b.rot();
      }
      load(dt) { return hyp(this.Px, this.Py) / dt; }
    }

    class Slide {
      constructor(a, b, wx, wy, axx, axy, o = {}) {
        this.a = a; this.b = b;
        [this.lbx, this.lby] = b.lp(wx, wy);
        [this.lax, this.lay] = a.lp(o.ax ?? a.x, o.ay ?? a.y);
        const l = hyp(axx, axy) || 1; axx /= l; axy /= l;
        this.lxx = a.cs * axx + a.sn * axy; this.lxy = -a.sn * axx + a.cs * axy;
        this.freq = o.freq || 0; this.zeta = o.zeta ?? .7; this.rest = o.rest || 0; this.k = o.k || 0; this.c = o.c || 0;
        this.ms = o.ms || 0; this.maxF = o.maxF || 0; this.servo = o.servo || null;
        this.lo = o.lo; this.hi = o.hi; this.lim = o.lo !== undefined;
        this.rms = 0; this.rmaxT = o.rmaxT || 0; this.Pr = 0;
        this.Py = 0; this.Ps = 0; this.Pm = 0; this.Pl = 0; this.Pu = 0; this.dead = false; this.ud = o.ud; this.breakAt = o.breakAt || 0;
      }
      trans() {
        const a = this.a, b = this.b;
        const rax = a.cs * this.lax - a.sn * this.lay, ray = a.sn * this.lax + a.cs * this.lay, rbx = b.cs * this.lbx - b.sn * this.lby, rby = b.sn * this.lbx + b.cs * this.lby;
        const ax = a.cs * this.lxx - a.sn * this.lxy, ay = a.sn * this.lxx + a.cs * this.lxy;
        return (b.x + rbx - a.x - rax) * ax + (b.y + rby - a.y - ray) * ay;
      }
      prep(dt) {
        const a = this.a, b = this.b;
        this.rax = a.cs * this.lax - a.sn * this.lay; this.ray = a.sn * this.lax + a.cs * this.lay;
        this.rbx = b.cs * this.lbx - b.sn * this.lby; this.rby = b.sn * this.lbx + b.cs * this.lby;
        this.dx = b.x + this.rbx - a.x - this.rax; this.dy = b.y + this.rby - a.y - this.ray;
        this.ax = a.cs * this.lxx - a.sn * this.lxy; this.ay = a.sn * this.lxx + a.cs * this.lxy;
        const yx = -this.ay, yy = this.ax; this.yx = yx; this.yy = yy;
        const mA = a.im, mB = b.im, iA = a.ii, iB = b.ii;
        const px = this.dx + this.rax, py = this.dy + this.ray;
        this.sAx = crossv(px, py, this.ax, this.ay); this.sBx = crossv(this.rbx, this.rby, this.ax, this.ay);
        this.sAy = crossv(px, py, yx, yy); this.sBy = crossv(this.rbx, this.rby, yx, yy);
        const kx = mA + mB + iA * this.sAx * this.sAx + iB * this.sBx * this.sBx;
        const ky = mA + mB + iA * this.sAy * this.sAy + iB * this.sBy * this.sBy;
        this.mx = kx ? 1 / kx : 0; this.my = ky ? 1 / ky : 0;
        const t = this.dx * this.ax + this.dy * this.ay; this.t = t;
        this.gamma = 0; this.sbias = 0; this.ms2 = this.mx;
        this.sp = this.freq > 0 || this.k > 0;
        if (this.sp) {
          const C = t - this.rest, om = TAU * this.freq, m = this.mx, damp = this.k ? this.c : 2 * m * this.zeta * om, k = this.k || m * om * om;
          let g = dt * (damp + dt * k); g = g ? 1 / g : 0;
          this.gamma = g; this.sbias = C * dt * k * g; this.ms2 = 1 / (kx + g);
        }
        if (this.servo) { const s = this.servo; this.ms = clamp((s.t - t) * s.kp, -s.vmax, s.vmax); this.maxF = s.maxF; }
        if (!this.maxF) this.Pm = 0;
        if (!this.rmaxT) this.Pr = 0;
        this.am = iA + iB > 0 ? 1 / (iA + iB) : 0;
        const L = this.Ps + this.Pm + this.Pl - this.Pu;
        this.apply(this.Py, L);
        a.w -= a.ii * this.Pr; b.w += b.ii * this.Pr;
      }
      apply(py, L) {
        const a = this.a, b = this.b;
        const Px = py * this.yx + L * this.ax, Py = py * this.yy + L * this.ay;
        const LA = py * this.sAy + L * this.sAx, LB = py * this.sBy + L * this.sBx;
        a.vx -= a.im * Px; a.vy -= a.im * Py; a.w -= a.ii * LA;
        b.vx += b.im * Px; b.vy += b.im * Py; b.w += b.ii * LB;
      }
      cdx() { const a = this.a, b = this.b; return this.ax * (b.vx - a.vx) + this.ay * (b.vy - a.vy) + this.sBx * b.w - this.sAx * a.w; }
      vel(dt) {
        const a = this.a, b = this.b;
        if (this.rmaxT && this.am) {
          const C = b.w - a.w - this.rms, mx = this.rmaxT * dt, old = this.Pr;
          this.Pr = clamp(old - this.am * C, -mx, mx);
          const i = this.Pr - old; a.w -= a.ii * i; b.w += b.ii * i;
        }
        if (this.sp) {
          const i = -this.ms2 * (this.cdx() + this.sbias + this.gamma * this.Ps); this.Ps += i; this.apply(0, i);
        }
        if (this.maxF) {
          const C = this.cdx() - this.ms, mx = this.maxF * dt, old = this.Pm;
          this.Pm = clamp(old - this.mx * C, -mx, mx); this.apply(0, this.Pm - old);
        }
        if (this.lim) {
          const inv = 1 / dt;
          let C = this.t - this.lo, i = -this.mx * (this.cdx() + max(C, 0) * inv), old = this.Pl;
          this.Pl = max(old + i, 0); this.apply(0, this.Pl - old);
          C = this.hi - this.t; i = -this.mx * (-this.cdx() + max(C, 0) * inv); old = this.Pu;
          this.Pu = max(old + i, 0); this.apply(0, -(this.Pu - old));
        }
        const Cd = this.yx * (b.vx - a.vx) + this.yy * (b.vy - a.vy) + this.sBy * b.w - this.sAy * a.w;
        const i = -this.my * Cd; this.Py += i; this.apply(i, 0);
      }
      pos() {
        const a = this.a, b = this.b;
        const rax = a.cs * this.lax - a.sn * this.lay, ray = a.sn * this.lax + a.cs * this.lay, rbx = b.cs * this.lbx - b.sn * this.lby, rby = b.sn * this.lbx + b.cs * this.lby;
        const dx = b.x + rbx - a.x - rax, dy = b.y + rby - a.y - ray;
        const axx = a.cs * this.lxx - a.sn * this.lxy, axy = a.sn * this.lxx + a.cs * this.lxy, yx = -axy, yy = axx;
        const mA = a.im, mB = b.im, iA = a.ii, iB = b.ii;
        const px = dx + rax, py = dy + ray;
        const sAy = crossv(px, py, yx, yy), sBy = crossv(rbx, rby, yx, yy);
        let k = mA + mB + iA * sAy * sAy + iB * sBy * sBy;
        let C = dx * yx + dy * yy;
        if (k) {
          const i = -C / k, Px = i * yx, Py = i * yy;
          a.x -= mA * Px; a.y -= mA * Py; a.a -= iA * i * sAy;
          b.x += mB * Px; b.y += mB * Py; b.a += iB * i * sBy;
          a.rot(); b.rot();
        }
        if (this.lim) {
          const t = this.trans();
          let c = 0;
          if (t < this.lo) c = clamp(t - this.lo + .005, -.2, 0); else if (t > this.hi) c = clamp(t - this.hi - .005, 0, .2);
          if (c) {
            const rax2 = a.cs * this.lax - a.sn * this.lay, ray2 = a.sn * this.lax + a.cs * this.lay, rbx2 = b.cs * this.lbx - b.sn * this.lby, rby2 = b.sn * this.lbx + b.cs * this.lby;
            const ex = a.cs * this.lxx - a.sn * this.lxy, ey = a.sn * this.lxx + a.cs * this.lxy;
            const dx2 = b.x + rbx2 - a.x - rax2, dy2 = b.y + rby2 - a.y - ray2;
            const sA = crossv(dx2 + rax2, dy2 + ray2, ex, ey), sB = crossv(rbx2, rby2, ex, ey);
            const kk = mA + mB + iA * sA * sA + iB * sB * sB;
            if (kk) { const i = -c / kk; a.x -= mA * i * ex; a.y -= mA * i * ey; a.a -= iA * i * sA; b.x += mB * i * ex; b.y += mB * i * ey; b.a += iB * i * sB; a.rot(); b.rot(); }
          }
        }
      }
      load(dt) { return abs(this.Py) / dt; }
    }

    class Ang {
      constructor(a, b, o = {}) {
        this.a = a; this.b = b; this.ref = o.ref ?? (b.a - a.a); this.servo = o.servo || null; this.maxT = o.maxT || 0; this.ms = 0;
        this.P = 0; this.dead = false; this.hard = !o.maxT && !o.servo; this.ud = o.ud;
      }
      angle() { return this.b.a - this.a.a; }
      prep(dt) {
        const a = this.a, b = this.b;
        this.am = a.ii + b.ii > 0 ? 1 / (a.ii + b.ii) : 0;
        if (this.servo) { const s = this.servo; this.ms = clamp((s.t - this.angle()) * s.kp, -s.vmax, s.vmax); this.maxT = s.maxT; }
        a.w -= a.ii * this.P; b.w += b.ii * this.P;
      }
      vel(dt) {
        const a = this.a, b = this.b, C = b.w - a.w - this.ms;
        const old = this.P;
        if (this.hard) this.P = old - this.am * C;
        else { const mx = this.maxT * dt; this.P = clamp(old - this.am * C, -mx, mx); }
        const i = this.P - old; a.w -= a.ii * i; b.w += b.ii * i;
      }
      pos() {
        if (!this.hard) return;
        const a = this.a, b = this.b, C = clamp(b.a - a.a - this.ref, -.2, .2);
        const i = -this.am * C; a.a -= a.ii * i; b.a += b.ii * i; a.rot(); b.rot();
      }
      load(dt) { return abs(this.P) / dt; }
    }

    class World {
      constructor(o = {}) {
        this.g = o.g ?? 10; this.dyn = []; this.stat = []; this.joints = []; this.contacts = []; this.prev = new Map();
        this.grid = new Map(); this.cell = 6; this.stamp = 1; this.cb = null; this.onBreak = null; this.iters = o.iters || 9; this.piters = o.piters || 3; this.time = 0;
        this.hold = o.hold;
      }
      key(cx, cy) { return (cx + 4000) * 10000 + (cy + 4000); }
      add(b) {
        if (b.static) {
          this.stat.push(b);
          const c = this.cell, x0 = Math.floor(b.x0 / c), x1 = Math.floor(b.x1 / c), y0 = Math.floor(b.y0 / c), y1 = Math.floor(b.y1 / c);
          for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
            const k = this.key(i, j); let l = this.grid.get(k);
            if (!l) this.grid.set(k, l = []);
            l.push(b);
          }
        } else this.dyn.push(b);
        return b;
      }
      remove(b) {
        if (b.static) {
          this.stat.splice(this.stat.indexOf(b), 1);
          const c = this.cell, x0 = Math.floor(b.x0 / c), x1 = Math.floor(b.x1 / c), y0 = Math.floor(b.y0 / c), y1 = Math.floor(b.y1 / c);
          for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
            const l = this.grid.get(this.key(i, j)); if (l) { const q = l.indexOf(b); if (q >= 0) l.splice(q, 1); }
          }
        } else { const q = this.dyn.indexOf(b); if (q >= 0) this.dyn.splice(q, 1); }
        b.dead = true;
        for (const j of this.joints) if (j.a === b || j.b === b) j.dead = true;
      }
      join(j) { this.joints.push(j); return j; }
      filt(a, b) {
        if (a.group && a.group === b.group && a.group < 0) return false;
        if (a.group && a.group === b.group && a.group > 0) return true;
        return (a.cat & b.mask) !== 0 && (b.cat & a.mask) !== 0;
      }
      pair(a, b, out) {
        const sa = a.shapes, sb = b.shapes;
        for (let i = 0; i < sa.length; i++) {
          const A = sa[i]; if (A.nocol) continue;
          for (let j = 0; j < sb.length; j++) {
            const B = sb[j]; if (B.nocol) continue;
            if (A.x1 < B.x0 - MARGIN || B.x1 < A.x0 - MARGIN || A.y1 < B.y0 - MARGIN || B.y1 < A.y0 - MARGIN) continue;
            const n = collide(A, B, MF);
            if (!n) continue;
            const c = { a, b, sa: A, sb: B, nx: MF.nx, ny: MF.ny, n, f: sqrt(A.f * B.f), e: max(A.e, B.e), bounce: max(A.bounce, B.bounce), pts: [] };
            for (let k = 0; k < n; k++) c.pts.push({ x: MF.px[k], y: MF.py[k], sep: MF.sep[k], key: (A.sid * 100000 + B.sid) * 64 + MF.id[k], jn: 0, jt: 0, mn: 0, mt: 0, bias: 0, rax: 0, ray: 0, rbx: 0, rby: 0 });
            out.push(c);
          }
        }
      }
      step(dt) {
        const act = [];
        for (const b of this.dyn) if (b.active) act.push(b);
        this.act = act;
        const g = this.g;
        if (this.hold) this.hold(dt);
        for (const b of act) {
          b.imp = 0;
          if (b.kin) continue;
          b.vx += dt * b.fx * b.im; b.vy += dt * (g * b.gs + b.fy * b.im); b.w += dt * b.tq * b.ii;
          const dl = 1 / (1 + dt * b.ld), da = 1 / (1 + dt * b.ad);
          b.vx *= dl; b.vy *= dl; b.w *= da;
          const v = hyp(b.vx, b.vy);
          if (v > VMAX) { b.vx *= VMAX / v; b.vy *= VMAX / v; }
          b.w = clamp(b.w, -WMAX, WMAX);
          b.fx = b.fy = b.tq = 0;
        }
        const cs = [];
        for (const b of act) {
          const c = this.cell, x0 = Math.floor((b.x0 - MARGIN) / c), x1 = Math.floor((b.x1 + MARGIN) / c), y0 = Math.floor((b.y0 - MARGIN) / c), y1 = Math.floor((b.y1 + MARGIN) / c);
          const st = ++this.stamp;
          for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
            const l = this.grid.get(this.key(i, j)); if (!l) continue;
            for (let q = 0; q < l.length; q++) {
              const s = l[q];
              if (s.mark === st) continue;
              s.mark = st;
              if (b.kin || !this.filt(b, s)) continue;
              if (s.x1 < b.x0 - MARGIN || s.x0 > b.x1 + MARGIN || s.y1 < b.y0 - MARGIN || s.y0 > b.y1 + MARGIN) continue;
              this.pair(b, s, cs);
            }
          }
        }
        for (let i = 0; i < act.length; i++) {
          const a = act[i];
          for (let j = i + 1; j < act.length; j++) {
            const b = act[j];
            if (a.im === 0 && b.im === 0) continue;
            if (a.x1 < b.x0 - MARGIN || a.x0 > b.x1 + MARGIN || a.y1 < b.y0 - MARGIN || a.y0 > b.y1 + MARGIN) continue;
            if (!this.filt(a, b)) continue;
            this.pair(a, b, cs);
          }
        }
        if (this.pre) this.pre(cs);
        const inv = 1 / dt, prev = this.prev;
        for (const c of cs) {
          const a = c.a, b = c.b, nx = c.nx, ny = c.ny, tx = ny, ty = -nx;
          for (const p of c.pts) {
            p.rax = p.x - a.x; p.ray = p.y - a.y; p.rbx = p.x - b.x; p.rby = p.y - b.y;
            const rna = crossv(p.rax, p.ray, nx, ny), rnb = crossv(p.rbx, p.rby, nx, ny);
            const kn = a.im + b.im + a.ii * rna * rna + b.ii * rnb * rnb; p.mn = kn ? 1 / kn : 0;
            const rta = crossv(p.rax, p.ray, tx, ty), rtb = crossv(p.rbx, p.rby, tx, ty);
            const kt = a.im + b.im + a.ii * rta * rta + b.ii * rtb * rtb; p.mt = kt ? 1 / kt : 0;
            const dvx = b.vx - b.w * p.rby - a.vx + a.w * p.ray, dvy = b.vy + b.w * p.rbx - a.vy - a.w * p.rax;
            const vn = dvx * nx + dvy * ny, c0 = p.sep + SLOP;
            let bias = c0 < 0 ? min(MAXCOR, -CORR * c0 * inv) : -c0 * inv;
            if (c.e > 0 && vn < -1.2) bias = max(bias, -c.e * vn);
            if (c.bounce > 0 && vn < c.bounce * .9) bias = max(bias, c.bounce);
            p.bias = bias;
            const old = prev.get(p.key);
            if (old) { p.jn = old[0]; p.jt = old[1]; }
            const Px = p.jn * nx + p.jt * tx, Py = p.jn * ny + p.jt * ty;
            a.vx -= a.im * Px; a.vy -= a.im * Py; a.w -= a.ii * crossv(p.rax, p.ray, Px, Py);
            b.vx += b.im * Px; b.vy += b.im * Py; b.w += b.ii * crossv(p.rbx, p.rby, Px, Py);
          }
        }
        const js = this.joints.filter(j => !j.dead);
        this.joints = js;
        for (const j of js) j.prep(dt);
        for (let it = 0; it < this.iters; it++) {
          for (const j of js) j.vel(dt);
          for (const c of cs) {
            const a = c.a, b = c.b, nx = c.nx, ny = c.ny, tx = ny, ty = -nx;
            for (const p of c.pts) {
              let dvx = b.vx - b.w * p.rby - a.vx + a.w * p.ray, dvy = b.vy + b.w * p.rbx - a.vy - a.w * p.rax;
              let l = -p.mt * (dvx * tx + dvy * ty);
              const mf = c.f * p.jn, old = p.jt;
              p.jt = clamp(old + l, -mf, mf); l = p.jt - old;
              let Px = l * tx, Py = l * ty;
              a.vx -= a.im * Px; a.vy -= a.im * Py; a.w -= a.ii * crossv(p.rax, p.ray, Px, Py);
              b.vx += b.im * Px; b.vy += b.im * Py; b.w += b.ii * crossv(p.rbx, p.rby, Px, Py);
            }
            for (const p of c.pts) {
              const dvx = b.vx - b.w * p.rby - a.vx + a.w * p.ray, dvy = b.vy + b.w * p.rbx - a.vy - a.w * p.rax;
              let l = -p.mn * (dvx * nx + dvy * ny - p.bias);
              const old = p.jn; p.jn = max(old + l, 0); l = p.jn - old;
              const Px = l * nx, Py = l * ny;
              a.vx -= a.im * Px; a.vy -= a.im * Py; a.w -= a.ii * crossv(p.rax, p.ray, Px, Py);
              b.vx += b.im * Px; b.vy += b.im * Py; b.w += b.ii * crossv(p.rbx, p.rby, Px, Py);
            }
          }
        }
        const np = new Map();
        for (const c of cs) {
          let s = 0;
          for (const p of c.pts) { np.set(p.key, [p.jn, p.jt]); s += p.jn; }
          c.imp = s; c.a.imp += s; c.b.imp += s;
        }
        this.prev = np;
        for (const b of act) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.w * dt; b.rot();
        }
        for (let it = 0; it < this.piters; it++) for (const j of js) j.pos();
        for (const b of act) b.upd();
        for (const j of js) {
          if (j.dead || !j.breakAt) continue;
          if (j.load(dt) > j.breakAt) { j.dead = true; if (this.onBreak) this.onBreak(j); }
        }
        this.contacts = cs;
        if (this.cb) for (const c of cs) if (c.imp > 1.2 || c.sa.tag || c.sb.tag) this.cb(c, c.imp);
        this.time += dt;
      }
      circleHits(b, cx, cy, r) {
        const t = { t: 0, r, cx, cy, ox: 0, oy: 0 };
        for (const s of b.shapes) {
          if (s.nocol) continue;
          if (s.x1 < cx - r || s.x0 > cx + r || s.y1 < cy - r || s.y0 > cy + r) continue;
          if (collide(s, t, MF2) && MF2.sep[0] <= 0) return true;
        }
        return false;
      }
    }
    const MF2 = { n: 0, nx: 0, ny: 0, px: [0, 0], py: [0, 0], sep: [0, 0], id: [0, 0] };
    return { Body, World, Rev, Slide, Ang, circle, box, poly, collide, crossv };
  })();
  const makeSnd = api => {
    let ac = null, master = null, nbuf = null, eng = null, rk = null;
    const last = {};
    const ctx = () => {
      if (!ac) {
        try {
          ac = new (window.AudioContext || window.webkitAudioContext)();
          master = ac.createGain(); master.gain.value = .55; master.connect(ac.destination);
          nbuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
          const d = nbuf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { ac = null; }
      }
      if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
      return ac;
    };
    const ok = () => !api.muted && ctx();
    const tone = (f0, f1, dur, type = 'sine', vol = .1, delay = 0) => {
      if (!ok()) return;
      const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .03);
    };
    const noise = (dur, vol = .1, f0 = 2000, f1 = 600, type = 'lowpass', delay = 0) => {
      if (!ok()) return;
      const t = ac.currentTime + delay, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nbuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + .03);
    };
    const gate = (k, ms) => { const n = performance.now(); if (last[k] && n - last[k] < ms) return false; last[k] = n; return true; };
    const sfx = (name, v = 1, p = 1) => {
      if (api.muted || !gate(name, name === 'bonk' ? 55 : 30)) return;
      switch (name) {
        case 'bonk': tone(180 * p, 70 * p, .12, 'triangle', .16 * v); noise(.07, .08 * v, 900, 200); break;
        case 'thud': tone(90 * p, 45, .16, 'sine', .22 * v); noise(.1, .08 * v, 500, 120); break;
        case 'pop': tone(520 * p, 1100 * p, .07, 'sine', .14 * v); tone(260, 120, .09, 'square', .05 * v, .02); break;
        case 'boom': noise(.9, .3 * v, 1800, 90); tone(110, 28, .6, 'sine', .35 * v); tone(60, 25, .5, 'sawtooth', .12 * v); break;
        case 'boing': tone(220 * p, 700 * p, .22, 'sine', .18 * v); tone(330 * p, 880 * p, .22, 'triangle', .07 * v, .02); break;
        case 'glass': noise(.35, .16 * v, 9000, 2500, 'highpass'); tone(2400, 1800, .1, 'triangle', .05 * v); tone(3100, 2200, .12, 'triangle', .04 * v, .03); break;
        case 'ding': tone(988, 988, .5, 'sine', .14); tone(1319, 1319, .6, 'sine', .12, .09); tone(1760, 1760, .8, 'sine', .1, .2); break;
        case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .3, 'triangle', .12, i * .1)); break;
        case 'splat': noise(.14, .13 * v, 1200, 300); tone(150, 60, .12, 'sine', .12 * v); break;
        case 'beep': tone(480, 480, .12, 'square', .07); tone(480, 480, .12, 'square', .07, .2); break;
        case 'zap': tone(900, 180, .22, 'sawtooth', .1 * v); break;
        case 'shoot': noise(.18, .16, 3200, 400, 'bandpass'); tone(300, 90, .2, 'sawtooth', .08); break;
        case 'eject': noise(.25, .12, 600, 3000, 'bandpass'); tone(300, 800, .15, 'sine', .08); break;
        case 'tick': tone(1200, 1200, .03, 'square', .035); break;
        case 'click': tone(660, 880, .06, 'sine', .07); break;
        case 'back': tone(520, 340, .08, 'sine', .07); break;
        case 'crate': noise(.12, .12 * v, 1400, 250); tone(140, 80, .1, 'square', .05 * v); break;
        case 'metal': tone(420 * p, 380 * p, .35, 'triangle', .13 * v); tone(840 * p, 760 * p, .3, 'sine', .07 * v); noise(.05, .1 * v, 4000, 1500, 'highpass'); break;
        case 'spike': tone(700, 300, .1, 'sawtooth', .07 * v); noise(.06, .08, 3000, 1200, 'highpass'); break;
        case 'chime': tone(660, 660, .3, 'sine', .08); tone(880, 880, .4, 'sine', .08, .1); break;
        case 'deep': tone(220, 220, 1.2, 'sine', .09 * v); tone(330, 330, 1.4, 'sine', .06 * v, .05); break;
        default: break;
      }
    };
    const engine = {
      on(kind) {
        if (api.muted || !ctx() || eng) return;
        const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
        o.type = kind === 'bike' ? 'triangle' : 'sawtooth'; o.frequency.value = 60; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
        o.connect(f); f.connect(g); g.connect(master); o.start();
        eng = { o, g, f };
      },
      set(freq, vol) {
        if (!eng) return;
        const t = ac.currentTime;
        eng.o.frequency.setTargetAtTime(freq, t, .06); eng.g.gain.setTargetAtTime(api.muted ? 0 : vol, t, .08); eng.f.frequency.setTargetAtTime(300 + freq * 5, t, .08);
      },
      off() { if (!eng) return; try { eng.g.gain.setTargetAtTime(0, ac.currentTime, .05); eng.o.stop(ac.currentTime + .3); } catch (e) {} eng = null; }
    };
    const rocket = {
      set(v) {
        if (v > 0 && !api.muted && ctx()) {
          if (!rk) {
            const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
            s.buffer = nbuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = 0;
            s.connect(f); f.connect(g); g.connect(master); s.start();
            rk = { s, g, f };
          }
          rk.g.gain.setTargetAtTime(.2 * v, ac.currentTime, .05);
        } else if (rk) rk.g.gain.setTargetAtTime(0, ac.currentTime, .06);
      },
      off() { if (rk) { try { rk.s.stop(); } catch (e) {} rk = null; } }
    };
    return { sfx, tone, noise, engine, rocket, destroy() { engine.off(); rocket.off(); if (ac) { try { ac.close(); } catch (e) {} ac = null; } }, unlock: ctx };
  };
  const HW = {};
  HW.INK = '#1d1b26';

  HW.RD = { hr: .25, tl: .62, th: .34, ua: .34, la: .33, ut: .45, lt: .44, ar: .075, lr: .098, sr: .086 };

  HW.mkBody = (W, x, y, a, group, shapes, o = {}) => {
    const b = new PH.Body({ x, y, a, group, ld: o.ld ?? .02, ad: o.ad ?? .2, gs: o.gs ?? 1, kind: o.kind });
    for (const s of shapes) b.add(s);
    b.finalize(); W.add(b);
    return b;
  };

  HW.ik = (ax, ay, tx, ty, l1, l2, sgn) => {
    let dx = tx - ax, dy = ty - ay, d = hyp(dx, dy);
    const th = atan2(dy, dx);
    d = clamp(d, Math.abs(l1 - l2) + .02, l1 + l2 - .005);
    const ca = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), al = Math.acos(ca);
    const a1 = th + sgn * al;
    const ex = ax + cos(a1) * l1, ey = ay + sin(a1) * l1;
    return { ex, ey, a1, a2: atan2(ty - ey, tx - ex) };
  };

  HW.RAGJ = {
    neck: { lo: -.75, hi: .75, f: 7000, t: 7 },
    sh: { lo: -3.0, hi: 1.25, f: 6500, t: 14 },
    el: { lo: -2.7, hi: .08, f: 5500, t: 14 },
    hip: { lo: -2.3, hi: .95, f: 8200, t: 28 },
    kn: { lo: -.08, hi: 2.7, f: 6800, t: 20 }
  };

  HW.mkRag = (W, o) => {
    const R = HW.RD, s = o.s || 1, g = o.group, K = (o.tough || 1) * 2.4;
    const hr = R.hr * s, tl = R.tl * s, th = R.th * s, ua = R.ua * s, la = R.la * s, ut = R.ut * s, lt = R.lt * s;
    const lean = o.lean || 0, ta = Math.PI / 2 + lean, dx = cos(ta), dy = sin(ta);
    const [hx, hy] = o.hip;
    const nx = hx - dx * tl, ny = hy - dy * tl;
    const rag = { s, group: g, parts: {}, joints: {}, attach: [], free: false, style: o.style || {}, order: [], broken: [], id: o.id || 0, lean, scale: s };
    const bx = (hw, hh, d) => PH.box(hw, hh, 0, 0, 0, { d, f: .75, e: .05 });
    const P = rag.parts;
    P.torso = HW.mkBody(W, (hx + nx) / 2, (hy + ny) / 2, ta, g, [bx(tl / 2, th / 2, 70)], { ad: .4 });
    const hdx = nx - dx * hr * .72, hdy = ny - dy * hr * .72;
    P.head = HW.mkBody(W, hdx, hdy, ta, g, [PH.circle(hr, 0, 0, { d: 36, f: .6, e: .15 })], { ad: .3 });
    const mkJ = (name, par, ch, wx, wy, spec, rel0, stiff = 1, extra = {}) => {
      const rel = ch.a - par.a;
      const lo = Math.min(spec.lo, rel - .08), hi = Math.max(spec.hi, rel + .08);
      const j = new PH.Rev(par, ch, wx, wy, { lo, hi, kind: 'limb', breakAt: spec.f * K * s * s * (extra.k || 1), servo: { t: rel, kp: 7, vmax: 4, maxT: spec.t * stiff * s * s }, ud: name });
      j.name = name; j.spec = spec; j.base = spec.t * s * s; j.stiff = stiff;
      W.join(j); rag.joints[name] = j;
      return j;
    };
    mkJ('neck', P.torso, P.head, nx, ny, HW.RAGJ.neck, 0, o.neck ?? 1);
    const shx = nx + dx * .09 * s, shy = ny + dy * .09 * s;
    for (const side of ['B', 'F']) {
      const tgt = side === 'F' ? o.handF : o.handB, ft = side === 'F' ? o.footF : o.footB;
      let a1, a2, ex, ey;
      if (tgt) ({ a1, a2, ex, ey } = HW.ik(shx, shy, tgt[0], tgt[1], ua, la, 1));
      else { a1 = ta + (side === 'F' ? .1 : -.05) + (o.armRest || 0); a2 = a1 - .5; ex = shx + cos(a1) * ua; ey = shy + sin(a1) * ua; }
      let a1c = P.torso.a + angN(a1 - P.torso.a);
      const uap = HW.mkBody(W, shx + cos(a1c) * ua / 2, shy + sin(a1c) * ua / 2, a1c, g, [bx(ua / 2, R.ar * s, 60)], { ad: .5 });
      const a2c = uap.a + angN(a2 - uap.a);
      const elx = shx + cos(a1c) * ua, ely = shy + sin(a1c) * ua;
      const lap = HW.mkBody(W, elx + cos(a2c) * la / 2, ely + sin(a2c) * la / 2, a2c, g, [bx(la / 2, R.ar * s * .9, 55)], { ad: .5 });
      P['ua' + side] = uap; P['la' + side] = lap;
      mkJ('sh' + side, P.torso, uap, shx, shy, HW.RAGJ.sh, 0, o.armStiff ?? 1);
      mkJ('el' + side, uap, lap, elx, ely, HW.RAGJ.el, 0, o.armStiff ?? 1);
      if (tgt && o.veh) {
        const hxw = elx + cos(a2c) * la, hyw = ely + sin(a2c) * la;
        const ja = new PH.Rev(lap, o.handBody || o.veh, hxw, hyw, { breakAt: (o.handBreak || 2600) * s * K, ud: 'hand' + side });
        ja.kind2 = 'attach'; W.join(ja); rag.attach.push(ja); rag.joints['hand' + side] = ja;
      }
      let b1, b2;
      if (ft) ({ a1: b1, a2: b2 } = HW.ik(hx, hy, ft[0], ft[1], ut, lt, -1));
      else { b1 = ta + (side === 'F' ? -.25 : .1) + (o.legRest ?? 0); b2 = b1 + .5; }
      const b1c = P.torso.a + angN(b1 - P.torso.a);
      const thp = HW.mkBody(W, hx + cos(b1c) * ut / 2, hy + sin(b1c) * ut / 2, b1c, g, [bx(ut / 2, R.lr * s, 75)], { ad: .5 });
      const knx = hx + cos(b1c) * ut, kny = hy + sin(b1c) * ut;
      const b2c = thp.a + angN(b2 - thp.a);
      const shp = HW.mkBody(W, knx + cos(b2c) * lt / 2, kny + sin(b2c) * lt / 2, b2c, g, [bx(lt / 2, R.sr * s, 70)], { ad: .5 });
      P['th' + side] = thp; P['sh' + side] = shp;
      mkJ('hip' + side, P.torso, thp, hx, hy, HW.RAGJ.hip, 0, o.legStiff ?? 1);
      mkJ('kn' + side, thp, shp, knx, kny, HW.RAGJ.kn, 0, o.legStiff ?? 1);
      if (ft && o.veh) {
        const fxw = knx + cos(b2c) * lt, fyw = kny + sin(b2c) * lt;
        const jf = new PH.Rev(shp, o.veh, fxw, fyw, { breakAt: (o.footBreak || 3600) * s * K, ud: 'foot' + side });
        jf.kind2 = 'attach'; W.join(jf); rag.attach.push(jf); rag.joints['foot' + side] = jf;
      }
    }
    if (o.veh) {
      const rel = P.torso.a - o.veh.a;
      const js = new PH.Rev(o.veh, P.torso, hx, hy, { servo: { t: rel, kp: 6, vmax: 3, maxT: (o.seatT ?? 160) * s * s }, breakAt: (o.seatBreak || 9000) * s * K, ud: 'seat' });
      js.kind2 = 'attach'; js.rel0 = rel; W.join(js); rag.attach.push(js); rag.joints.seat = js; rag.seat = js;
    }
    rag.order = ['shB', 'thB', 'laB', 'uaB', 'torso', 'shF', 'thF', 'head', 'laF', 'uaF'];
    rag.all = Object.values(P);
    rag.veh = o.veh || null;
    rag.face = 0;
    rag.eject = () => {
      if (rag.free) return;
      rag.free = true;
      for (const a of rag.attach) a.dead = true;
      for (const k in rag.joints) { const j = rag.joints[k]; if (j.servo && j.kind === 'limb') { j.servo.maxT = j.base * .04; } }
      for (const b of rag.all) b.ad = .35;
    };
    rag.setStiff = k => { for (const n in rag.joints) { const j = rag.joints[n]; if (j.kind === 'limb' && j.servo) j.servo.maxT = j.base * k; } };
    rag.intact = () => Object.values(rag.joints).filter(j => j.kind === 'limb' && !j.dead).length;
    rag.total = Object.values(rag.joints).filter(j => j.kind === 'limb').length;
    return rag;
  };

  HW.seg = (x1, y1, x2, y2, th, o) => {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, l = hyp(x2 - x1, y2 - y1), a = atan2(y2 - y1, x2 - x1);
    return PH.box(l / 2, th / 2, cx, cy, a, o);
  };

  HW.wheel = (W, g, cx, cy, r, o = {}) => {
    const b = new PH.Body({ x: cx, y: cy, group: g, ld: .01, ad: .02, kind: 'wheel' });
    b.add(PH.circle(r, 0, 0, { d: o.d ?? 90, f: o.f ?? 1.3, e: .1 }));
    b.finalize(); W.add(b); b.r = r;
    return b;
  };

  HW.suspend = (W, frame, wheel, cx, cy, axx, axy, o = {}) => {
    const j = new PH.Slide(frame, wheel, cx, cy, axx, axy, { ax: cx, ay: cy, k: o.k || 18000, c: o.c || 1400, rest: o.rest ?? .06, lo: o.lo ?? -.12, hi: o.hi ?? .16, rmaxT: 1 });
    W.join(j); j.rmaxT = 0;
    return j;
  };
  HW.CHARS = {
    wheelchair: { name: 'Wheelchair Guy', blurb: 'A cheerful rider with a rocket pack. Roll, boost and stay upright.', keys: 'Up/Down drive and brake, Left/Right lean, Shift rockets', col: '#f2b134' },
    bike: { name: 'Bike Dad', blurb: 'A dad on a bicycle with a child on the back rack. Keep it steady.', keys: 'Up pedal, Down brake, Left/Right lean, Shift sprint', col: '#3b7cf4' },
    segway: { name: 'Segway Guy', blurb: 'Balances on its own. Lean to go, hop over curbs.', keys: 'Left/Right lean to move, Up boost, Down brake, Shift hop', col: '#1fb38a' },
    moped: { name: 'Moped Couple', blurb: 'Two riders, one scooter. Keep the passenger on board.', keys: 'Up gas, Down brake, Left/Right lean, Shift turbo, Z horn', col: '#ef5a6f' },
    pogo: { name: 'Pogo Guy', blurb: 'Bounce along on a spring. Lean to steer the hop.', keys: 'Left/Right lean, Up push, Down squat, Shift mega boing', col: '#9a5ff0' }
  };
  HW.CHAR_IDS = ['wheelchair', 'bike', 'segway', 'moped', 'pogo'];

  HW.mkVeh = (W, kind, px, py, G, opt = {}) => {
    const v = { kind, W, group: G, riders: [], bodies: [], fuel: 1, stamina: 1, ejected: false, time: 0, grounded: false, airT: 0, hopCd: 0, rocket: 0, input: { l: 0, r: 0, u: 0, d: 0, boost: 0 }, lean: 0, pw: 0, thrust: 0, wasBoost: false };
    const skin = pick(['#f6d2ae', '#e8b48a', '#c98d5e', '#9a643f']);
    const rider = (o, style) => { const r = HW.mkRag(W, Object.assign({ group: G, veh: v.frame, style }, o)); v.riders.push(r); return r; };
    if (kind === 'wheelchair') {
      v.frame = HW.mkBody(W, px, py, 0, G, [
        PH.box(.33, .045, 0, 0, 0, { d: 85, f: .5 }), PH.box(.035, .43, -.31, -.42, 0, { d: 64, f: .5 }), PH.box(.17, .03, .52, .36, 0, { d: 64, f: .5 }),
        HW.seg(.34, .02, .5, .6, .06, { d: 53, f: .5 })
      ], { kind: 'frame', ad: .1 });
      v.rear = HW.wheel(W, G, px - .4, py + .42, .5, { d: 6.4 }); v.front = HW.wheel(W, G, px + .5, py + .72, .2, { d: 14 });
      v.jr = W.join(new PH.Rev(v.frame, v.rear, px - .4, py + .42, { maxT: 1 }));
      W.join(new PH.Rev(v.frame, v.front, px + .5, py + .72, {}));
      v.bodies.push(v.frame, v.rear, v.front);
      v.dad = rider({ hip: [px - .1, py - .12], lean: -.1, handF: [px + .13, py - .2], handB: [px + .06, py - .2], footF: [px + .52, py + .3], footB: [px + .42, py + .31], seatT: 260 }, { shirt: '#e8453c', pants: '#2c4a8f', hair: '#3a2415', skin, shoe: '#f2f2f2', hat: 'cap', kind: 'guy' });
      v.lift = .94; v.vmax = 17;
    } else if (kind === 'bike') {
      const sh = [
        HW.seg(-.78, .4, -.05, .34, .06, { d: 53 }), HW.seg(-.05, .34, -.3, -.2, .06, { d: 53 }), HW.seg(-.3, -.18, .42, -.2, .06, { d: 53 }),
        HW.seg(-.05, .34, .42, -.2, .07, { d: 53 }), HW.seg(.42, -.2, .78, .4, .06, { d: 53 }), HW.seg(.42, -.2, .45, -.45, .05, { d: 38 }), PH.box(.16, .035, -.32, -.26, 0, { d: 38 })
      ];
      if (opt.kid !== false) sh.push(PH.box(.24, .03, -.66, -.12, 0, { d: 38 }));
      v.frame = HW.mkBody(W, px, py, 0, G, sh, { kind: 'frame', ad: .12 });
      v.rear = HW.wheel(W, G, px - .78, py + .4, .38, { d: 7.7, f: 1.5 }); v.front = HW.wheel(W, G, px + .78, py + .4, .38, { d: 7.7, f: 1.4 });
      v.sr = HW.suspend(W, v.frame, v.rear, px - .78, py + .4, 0, 1, { k: 24000, c: 1700, rest: .05, lo: -.07, hi: .1 });
      v.sf = HW.suspend(W, v.frame, v.front, px + .78, py + .4, .5, .86, { k: 24000, c: 1700, rest: .05, lo: -.07, hi: .1 });
      v.bodies.push(v.frame, v.rear, v.front);
      v.dad = rider({ hip: [px - .3, py - .3], lean: .38, handF: [px + .46, py - .43], handB: [px + .42, py - .43], footF: [px - .02, py + .31], footB: [px - .08, py + .35], seatT: 230 }, { shirt: '#3b7cf4', pants: '#40424a', hair: '#7a4a2a', skin, shoe: '#d9d9d9', kind: 'dad', beard: 1 });
      if (opt.kid !== false) {
        const t = v.dad.parts.torso, hp1 = t.wp(.12, .17), hp2 = t.wp(.22, .17);
        v.kid = rider({ s: .62, hip: [px - .64, py - .2], lean: .1, handF: hp1, handB: hp2, handBody: t, footF: [px - .5, py + .4], footB: [px - .55, py + .44], seatT: 120, handBreak: 1500, footBreak: 1900, seatBreak: 4600 }, { shirt: '#ffb11f', pants: '#2fa4c9', hair: '#c4532d', skin: '#f6d2ae', shoe: '#ef5a6f', kind: 'kid' });
      }
      v.lift = .8; v.vmax = 17;
    } else if (kind === 'moped') {
      v.frame = HW.mkBody(W, px, py, 0, G, [
        PH.box(.28, .06, .15, .31, 0, { d: 84 }), PH.box(.52, .09, -.45, -.05, 0, { d: 67 }), HW.seg(-.95, 0, -.7, .3, .12, { d: 67 }), HW.seg(.55, .3, .42, -.5, .08, { d: 67 }),
        HW.seg(-.68, .4, -.3, .3, .1, { d: 84 }), PH.box(.12, .04, .4, -.6, 0, { d: 42 })
      ], { kind: 'frame', ad: .12 });
      v.rear = HW.wheel(W, G, px - .68, py + .4, .34, { d: 16, f: 1.5 }); v.front = HW.wheel(W, G, px + .74, py + .4, .34, { d: 16, f: 1.4 });
      v.sr = HW.suspend(W, v.frame, v.rear, px - .68, py + .4, 0, 1, { k: 30000, c: 2000, rest: .05, lo: -.07, hi: .1 });
      v.sf = HW.suspend(W, v.frame, v.front, px + .74, py + .4, .2, 1, { k: 30000, c: 2000, rest: .05, lo: -.07, hi: .1 });
      v.bodies.push(v.frame, v.rear, v.front);
      v.dad = rider({ hip: [px - .12, py - .2], lean: .18, handF: [px + .4, py - .6], handB: [px + .36, py - .6], footF: [px + .38, py + .24], footB: [px + .28, py + .25], seatT: 230 }, { shirt: '#ff7a1a', pants: '#2b3a67', hair: '#2a1b14', skin, shoe: '#f4f4f4', kind: 'guy', helmet: '#ffe14d' });
      const t = v.dad.parts.torso, hp1 = t.wp(.08, .17), hp2 = t.wp(.2, .17);
      v.girl = rider({ hip: [px - .58, py - .2], lean: .12, handF: hp1, handB: hp2, handBody: t, footF: [px - .1, py + .25], footB: [px - .2, py + .26], seatT: 200, seatBreak: 8000, handBreak: 2200 }, { shirt: '#ef5a6f', pants: '#6b4fd0', hair: '#c4532d', skin: pick(['#f6d2ae', '#e8b48a']), shoe: '#ffffff', kind: 'girl', helmet: '#ff8fab' });
      v.lift = .75; v.vmax = 22;
    } else if (kind === 'segway') {
      v.frame = HW.mkBody(W, px, py, 0, G, [PH.box(.36, .045, 0, -.56, 0, { d: 91, f: .6 }), HW.seg(.3, -.56, .32, -1.78, .07, { d: 84, f: .5 }), PH.box(.14, .035, .37, -1.8, 0, { d: 42 })], { kind: 'frame', ad: .1 });
      v.rear = HW.wheel(W, G, px, py, .45, { d: 42, f: 1.6 });
      v.jr = W.join(new PH.Rev(v.frame, v.rear, px, py, { maxT: 1 }));
      v.bodies.push(v.frame, v.rear);
      v.dad = rider({ hip: [px - .02, py - 1.4], lean: .05, handF: [px + .38, py - 1.76], handB: [px + .34, py - 1.76], footF: [px + .14, py - .6], footB: [px - .12, py - .6], seatT: 300, armStiff: 1.2, legStiff: 1.5 }, { shirt: '#1fb38a', pants: '#37373f', hair: '#222', skin, shoe: '#f4d03f', kind: 'guy', helmet: '#cfd5df' });
      v.lift = .47; v.vmax = 12;
    } else if (kind === 'pogo') {
      const G0 = py + 1.42;
      v.frame = HW.mkBody(W, px, G0 - 1.15, 0, G, [PH.box(.05, .55, 0, 0, 0, { d: 69, f: .3 }), PH.box(.22, .03, 0, -.45, 0, { d: 37 }), PH.box(.14, .03, 0, .35, 0, { d: 37 })], { kind: 'frame', ad: .1 });
      v.plunger = HW.mkBody(W, px, G0 - .55, 0, G, [PH.box(.035, .42, 0, -.08, 0, { d: 69, f: .3 }), PH.circle(.09, 0, .46, { d: 69, f: 1.6, e: .05 })], { kind: 'plunger', ad: .1 });
      v.sl = new PH.Slide(v.frame, v.plunger, px, G0 - .55, 0, 1, { ax: px, ay: G0 - .55, k: 7400, c: 210, rest: .08, lo: -.42, hi: .12 });
      W.join(v.sl); v.k0 = 7400;
      W.join(new PH.Ang(v.frame, v.plunger));
      v.bodies.push(v.frame, v.plunger);
      v.dad = rider({ hip: [px, G0 - 1.62], lean: 0, handF: [px + .17, G0 - 1.6], handB: [px - .17, G0 - 1.6], footF: [px + .1, G0 - .84], footB: [px - .1, G0 - .84], seatT: 280, armStiff: 1.2, legStiff: 1.5 }, { shirt: '#9a5ff0', pants: '#3b3f54', hair: '#e2b04a', skin, shoe: '#ff5a5a', kind: 'guy', helmet: '#ffd23f' });
      v.lift = 1.42; v.vmax = 14; v.ph = 0; v.pt = 0; v.mega = false;
    }
    v.all = [...v.bodies]; for (const r of v.riders) v.all.push(...r.all);
    v.main = v.dad.parts.torso;
    v.seats = v.riders.map(r => r.seat);
    v.leanT = 0;
    v.eject = () => {
      if (v.ejected) return false;
      v.ejected = true;
      for (const r of v.riders) r.eject();
      v.thrust = 0;
      return true;
    };
    v.fwdSpeed = () => v.frame.vx * v.frame.cs + v.frame.vy * v.frame.sn;
    v.upd = (inp, dt, snd) => {
      v.time += dt; v.input = inp;
      const lean = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
      v.lean += (lean - v.lean) * Math.min(1, dt * 9);
      if (!v.ejected) for (const r of v.riders) { const s = r.seat; if (s && !s.dead) s.servo.t = s.rel0 + v.lean * (v.kind === 'segway' || v.kind === 'pogo' ? .14 : .5) * (r === v.kid ? .5 : 1); }
      const gr = v.rear ? (v.rear.imp > .8 || (v.front && v.front.imp > .8)) : (v.plunger.imp > .8);
      if (gr) { v.grounded = true; v.airT = 0; } else { v.airT += dt; if (v.airT > .08) v.grounded = false; }
      const u = inp.u ? 1 : 0, d = inp.d ? 1 : 0, f = v.fwdSpeed();
      if (kind === 'wheelchair') {
        const j = v.jr;
        if (v.ejected) { j.maxT = 4; j.ms = 0; }
        else if (u) { j.ms = 36; j.maxT = (v.grounded ? 80 * clamp((14 - f) / 5, .15, 1) : 8) * clamp(1 - (-angN(v.frame.a) - .12) * 2.6, .1, 1); }
        else if (d) { if (f > .8) { j.ms = 0; j.maxT = 220; } else { j.ms = -20; j.maxT = 130; } }
        else { j.ms = 0; j.maxT = 7; }
        const boost = inp.boost && v.fuel > 0 && !v.ejected;
        v.thrust = boost ? 1 : 0;
        if (boost) v.fuel = Math.max(0, v.fuel - dt / 3.4); else v.fuel = Math.min(1, v.fuel + dt / 10);
      } else if (kind === 'bike' || kind === 'moped') {
        const mo = kind === 'moped', sp = inp.boost && v.stamina > 0 && !v.ejected;
        const wm = (mo ? 56 : 38) * (sp ? 1.3 : 1), tq = (mo ? 190 : 150) * (sp ? 1.35 : 1);
        const r = v.sr, fr = v.sf;
        if (v.ejected) { r.rmaxT = 3; r.rms = 0; fr.rmaxT = 1; fr.rms = 0; }
        else if (u) { r.rms = wm; r.rmaxT = tq; fr.rmaxT = 0; }
        else if (d) { if (f > .8) { r.rms = 0; r.rmaxT = 150; fr.rms = 0; fr.rmaxT = 100; } else { r.rms = -24; r.rmaxT = 100; fr.rmaxT = 0; } }
        else { r.rms = 0; r.rmaxT = 5; fr.rmaxT = 0; }
        if (sp && u) v.stamina = Math.max(0, v.stamina - dt / (mo ? 2.6 : 2.4)); else v.stamina = Math.min(1, v.stamina + dt / 6);
        v.thrust = sp && u ? 1 : 0;
      } else if (kind === 'segway') {
        v.thrust = 0;
      } else if (kind === 'pogo') {
        v.thrust = 0;
      }
      v.hopCd -= dt;
      if (kind === 'segway' && inp.boost && v.grounded && v.hopCd <= 0 && !v.ejected) {
        v.hopCd = .6;
        for (const b of v.all) b.vy -= 5.3;
        if (snd) snd.sfx('boing', .5, 1.4);
      }
      if (kind === 'pogo') {
        const sl = v.sl, mega = !!inp.boost;
        if (v.ejected) { sl.k = v.k0; sl.rest = .12; v.ph = 0; }
        else {
          v.pt += dt;
          if (v.ph === 0) {
            sl.k = v.k0; sl.rest = d ? -.22 : .12;
            if (v.grounded && (u || mega) && v.pt > .06) { v.ph = 1; v.pt = 0; v.mega = mega; }
          } else if (v.ph === 1) {
            sl.rest = lerp(.12, v.mega ? -.42 : -.28, Math.min(1, v.pt / .1)); sl.k = v.k0 * (v.mega ? 1.4 : 1);
            if (v.pt > (v.mega ? .2 : .15)) { v.ph = 2; v.pt = 0; }
          } else {
            sl.rest = v.pt < .12 ? (v.mega ? .75 : .38) : .12; sl.k = v.k0 * (v.mega ? 1.3 : 1);
            if (v.pt > .22) { v.ph = 0; v.pt = 0; }
          }
        }
      }
    };
    v.hold = dt => {
      if (v.ejected) return;
      const inp = v.input, fr = v.frame, lean = v.lean;
      if (kind === 'wheelchair') {
        if (v.thrust) {
          v.pw = Math.min(1, v.pw + dt * 5);
          const nx = -.38, ny = -.05, wx = fr.x + fr.cs * nx - fr.sn * ny, wy = fr.y + fr.sn * nx + fr.cs * ny, F = 1000 * v.pw * clamp(1.2 - v.fwdSpeed() / 12, 0, 1);
          const fx = fr.cs * F, fy = fr.sn * F;
          fr.fx += fx; fr.fy += fy; fr.tq += (wx - fr.x) * fy - (wy - fr.y) * fx;
        } else v.pw = 0;
        if (!v.grounded) fr.tq += lean * 130 - clamp((v.thrust ? 240 : 90) * angN(fr.a) + (v.thrust ? 70 : 28) * fr.w, -420, 420);
        else fr.tq += lean * 40 + clamp(-700 * (angN(fr.a) + .38), 0, 600) + clamp(-900 * (angN(fr.a) - .32), -800, 0) + (fr.w < 0 && angN(fr.a) < -.2 ? -fr.w * 18 : 0);
      } else if (kind === 'bike' || kind === 'moped') {
        fr.tq += lean * (v.grounded ? 55 : 230);
        if (!v.grounded && !(inp.l || inp.r)) fr.tq += -fr.w * 12;
      } else if (kind === 'segway') {
        const th = angN(fr.a), w = fr.w, wheel = v.rear;
        const vt = (inp.r ? 7.5 : 0) - (inp.l ? 5.5 : 0) + (inp.u ? 6 : 0);
        const vx = wheel.vx;
        let tgt = clamp(.075 * (vt - vx), -.42, .42);
        if (inp.d) tgt = clamp(.09 * (0 - vx), -.5, .5);
        v.tgtV = tgt;
        if (v.grounded || Math.abs(th) < .9) {
          const tau = clamp(2600 * (th - tgt) + 330 * w, -520, 520);
          v.jr.ms = tau >= 0 ? 90 : -90; v.jr.maxT = Math.abs(tau);
        } else { v.jr.maxT = 3; v.jr.ms = 0; }
        if (!v.grounded) fr.tq += lean * 120 - clamp(260 * th + 60 * w, -300, 300);
      } else if (kind === 'pogo') {
        const th = angN(fr.a), w = fr.w, pl = v.plunger;
        const tgt = clamp(.06 * (lean * (inp.boost ? 9 : 6) - fr.vx), -.32, .32);
        if (pl.imp > .5 || v.grounded) fr.tq += clamp(2500 * (tgt - th) - 360 * w, -900, 900);
        else fr.tq += clamp(320 * (tgt - th) - 90 * w, -600, 600);
      }
    };
    return v;
  };
  const INK = HW.INK;
  const inB = (ctx, b, fn) => { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.translate(b.lx, b.ly); fn(); ctx.restore(); };
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
  const fillStroke = (ctx, fill, lw = .05) => { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  const line = (ctx, pts, col, w, ink = true) => {
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (ink) { ctx.strokeStyle = INK; ctx.lineWidth = w + .07; ctx.stroke(); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), r = clamp(Math.round((n >> 16) * k), 0, 255), g = clamp(Math.round(((n >> 8) & 255) * k), 0, 255), b = clamp(Math.round((n & 255) * k), 0, 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };
  HW.shade = shade; HW.rr = rr; HW.line = line; HW.inB = inB; HW.fillStroke = fillStroke;

  HW.drawHead = (ctx, rag, b, back) => {
    const st = rag.style, hr = HW.RD.hr * rag.s;
    inB(ctx, b, () => {
      ctx.rotate(-Math.PI / 2);
      ctx.beginPath(); ctx.arc(0, 0, hr, 0, TAU); fillStroke(ctx, back ? shade(st.skin, .85) : st.skin);
      if (st.kind === 'dad' || st.beard) { ctx.beginPath(); ctx.arc(0, 0, hr * .98, .25, Math.PI - .25); ctx.lineTo(0, hr * .1); ctx.closePath(); ctx.fillStyle = '#6b4a2f'; ctx.fill(); }
      const hairTop = () => { ctx.beginPath(); ctx.arc(0, 0, hr * 1.04, Math.PI * 1.02, Math.PI * 2.0); ctx.closePath(); };
      if (st.helmet) {
        ctx.beginPath(); ctx.arc(0, -hr * .05, hr * 1.12, Math.PI, 0); ctx.lineTo(hr * 1.12, hr * .1); ctx.lineTo(-hr * 1.12, hr * .1); ctx.closePath(); fillStroke(ctx, st.helmet);
        ctx.beginPath(); ctx.moveTo(-hr * .5, -hr * .9); ctx.lineTo(hr * .5, -hr * .9); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = hr * .16; ctx.stroke();
      } else if (st.hat === 'cap') {
        hairTop(); fillStroke(ctx, '#e8453c');
        ctx.beginPath(); ctx.moveTo(hr * .8, -hr * .35); ctx.quadraticCurveTo(hr * 1.5, -hr * .3, hr * 1.55, -hr * .12); ctx.lineTo(hr * .7, -hr * .12); ctx.closePath(); fillStroke(ctx, '#b92a22');
      } else {
        hairTop(); fillStroke(ctx, st.hair, .04);
        if (st.kind === 'girl' || st.kind === 'kid') { ctx.beginPath(); ctx.arc(-hr * .7, hr * .15, hr * .42, 0, TAU); fillStroke(ctx, st.hair, .04); }
      }
      const ex = hr * .42, ey = -hr * .12, k = rag.face;
      for (const dx of [0, hr * .5]) {
        const x = ex + dx - hr * .12 * (dx ? 1 : 0);
        if (k) {
          ctx.strokeStyle = INK; ctx.lineWidth = hr * .13; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - hr * .14, ey - hr * .14); ctx.lineTo(x + hr * .14, ey + hr * .14); ctx.moveTo(x + hr * .14, ey - hr * .14); ctx.lineTo(x - hr * .14, ey + hr * .14); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(x, ey, hr * .21, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = .025; ctx.strokeStyle = INK; ctx.stroke();
          ctx.beginPath(); ctx.arc(x + hr * .06, ey + hr * .02, hr * .1, 0, TAU); ctx.fillStyle = INK; ctx.fill();
        }
      }
      ctx.beginPath();
      if (k) { ctx.ellipse(hr * .62, hr * .42, hr * .13, hr * .18, 0, 0, TAU); ctx.fillStyle = '#7a1f2b'; ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = INK; ctx.stroke(); }
      else { ctx.arc(hr * .5, hr * .22, hr * .3, .35, 1.9); ctx.lineWidth = .035; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); }
    });
  };

  HW.drawRag = (ctx, rag) => {
    const st = rag.style, R = HW.RD, s = rag.s, P = rag.parts;
    for (const nm of rag.order) {
      const b = P[nm];
      if (nm === 'head') { HW.drawHead(ctx, rag, b, false); continue; }
      const back = nm.endsWith('B'), lim = nm !== 'torso';
      inB(ctx, b, () => {
        if (nm === 'torso') {
          const tl = R.tl * s, th = R.th * s;
          rr(ctx, -tl / 2 - .03 * s, -th / 2, tl + .06 * s, th, th * .42); fillStroke(ctx, st.shirt);
          ctx.save(); rr(ctx, -tl / 2 - .03 * s, -th / 2, tl + .06 * s, th, th * .42); ctx.clip();
          ctx.fillStyle = st.pants; ctx.fillRect(tl * .16, -th, tl, th * 2); ctx.restore();
          rr(ctx, -tl / 2 - .03 * s, -th / 2, tl + .06 * s, th, th * .42); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(tl * .16, -th / 2 + .01); ctx.lineTo(tl * .16, th / 2 - .01); ctx.lineWidth = .035; ctx.stroke();
          if (st.kind === 'dad') { ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-tl * .3, -th * .45, tl * .38, th * .12); ctx.fillRect(-tl * .3, -th * .1, tl * .38, th * .12); }
          return;
        }
        const t = nm.slice(0, 2), hw = (nm.startsWith('ua') ? R.ua : nm.startsWith('la') ? R.la : nm.startsWith('th') ? R.ut : R.lt) * s / 2;
        const hh = (nm.startsWith('ua') ? R.ar : nm.startsWith('la') ? R.ar * .9 : nm.startsWith('th') ? R.lr : R.sr) * s;
        let col = t === 'ua' ? st.shirt : t === 'la' ? st.skin : t === 'th' ? st.pants : st.pants;
        if (back) col = shade(col, .8);
        if (t === 'sh') {
          ctx.beginPath(); ctx.ellipse(hw + .01, -hh * 1.0, .17 * s, hh * 1.25, 0, 0, TAU); ctx.fillStyle = back ? shade(st.shoe, .8) : st.shoe; ctx.fill(); ctx.lineWidth = .045; ctx.strokeStyle = INK; ctx.stroke();
        }
        rr(ctx, -hw - hh * .4, -hh, hw * 2 + hh * .8, hh * 2, hh); fillStroke(ctx, col);
        if (t === 'la') { ctx.beginPath(); ctx.arc(hw + hh * .35, 0, hh * 1.35, 0, TAU); fillStroke(ctx, back ? shade(st.skin, .85) : st.skin, .04); }
      });
    }
  };

  const spokes = (ctx, r, n, a, col, w) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
    for (let i = 0; i < n; i++) { const t = a + i * TAU / n; ctx.moveTo(0, 0); ctx.lineTo(cos(t) * r, sin(t) * r); }
    ctx.stroke();
  };
  HW.drawWheel = (ctx, b, o = {}) => {
    const r = b.r;
    inB(ctx, b, () => {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = o.tire || '#2a2b33'; ctx.fill(); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * (o.rim || .72), 0, TAU); ctx.fillStyle = o.hub || '#d9dde6'; ctx.fill(); ctx.lineWidth = .03; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * (o.rim || .72) * .84, 0, TAU); ctx.fillStyle = o.face || '#f0f2f7'; ctx.fill();
      spokes(ctx, r * (o.rim || .72) * .84, o.n || 8, 0, '#8d93a3', .025);
      ctx.beginPath(); ctx.arc(0, 0, r * .13, 0, TAU); ctx.fillStyle = '#6b7080'; ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = INK; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * .99, -.8, -.2); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = .03; ctx.stroke();
    });
  };

  HW.drawVeh = (ctx, v, fx) => {
    const f = v.frame, k = v.kind, t = fx.t;
    const rider = () => { for (const r of v.riders) HW.drawRag(ctx, r); };
    if (k === 'wheelchair') {
      inB(ctx, f, () => {
        if (v.thrust || v.fuel < 1) {
          ctx.save(); ctx.translate(-.5, -.28); ctx.rotate(-.12);
          if (v.thrust) {
            const fl = .5 + Math.random() * .35;
            ctx.beginPath(); ctx.moveTo(-.1, -.06); ctx.quadraticCurveTo(-.1 - fl * .7, -.08, -.1 - fl, 0); ctx.quadraticCurveTo(-.1 - fl * .7, .08, -.1, .06); ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill();
            ctx.beginPath(); ctx.moveTo(-.1, -.035); ctx.quadraticCurveTo(-.1 - fl * .4, -.04, -.1 - fl * .55, 0); ctx.quadraticCurveTo(-.1 - fl * .4, .04, -.1, .035); ctx.closePath(); ctx.fillStyle = '#fff4b8'; ctx.fill();
          }
          ctx.restore();
        }
        rr(ctx, -.64, -.38, .44, .16, .08); fillStroke(ctx, '#e8453c');
        ctx.beginPath(); ctx.moveTo(-.2, -.38); ctx.lineTo(-.04, -.3); ctx.lineTo(-.2, -.22); ctx.closePath(); fillStroke(ctx, '#aeb4c0');
        ctx.beginPath(); ctx.moveTo(-.64, -.38); ctx.lineTo(-.7, -.46); ctx.lineTo(-.54, -.38); ctx.closePath(); fillStroke(ctx, '#ffd23f');
        line(ctx, [-.33, -.86, -.5, -.9], '#4a4d57', .05);
        rr(ctx, -.345, -.86, .07, .86, .03); fillStroke(ctx, '#3a3d48');
        rr(ctx, -.34, -.045, .68, .09, .04); fillStroke(ctx, '#2d6bd6');
        line(ctx, [.34, .02, .5, .6], '#aeb4c0', .06);
        rr(ctx, .36, .34, .34, .06, .03); fillStroke(ctx, '#aeb4c0');
        line(ctx, [-.06, -.2, .24, -.2], '#4a4d57', .05);
      });
      HW.drawWheel(ctx, v.front, { rim: .6, hub: '#aeb4c0', n: 6, tire: '#33343c' });
      HW.drawWheel(ctx, v.rear, { rim: .82, hub: '#c7ccd8', face: 'rgba(255,255,255,.15)', n: 12 });
      rider();
    } else if (k === 'bike') {
      HW.drawWheel(ctx, v.rear, { rim: .85, face: 'rgba(255,255,255,.1)', n: 14 });
      inB(ctx, f, () => {
        if (v.kid) { rr(ctx, -.9, -.15, .48, .06, .03); fillStroke(ctx, '#40424a'); line(ctx, [-.86, -.12, -.78, .26], '#8d93a3', .03, false); }
        line(ctx, [-.78, .4, -.05, .34, -.3, -.2], '#3b7cf4', .07);
        line(ctx, [-.05, .34, .42, -.2], '#3b7cf4', .07);
        line(ctx, [-.3, -.18, .42, -.2], '#3b7cf4', .07);
        line(ctx, [-.78, .4, -.3, -.18], '#3b7cf4', .05);
        line(ctx, [.42, -.2, .45, -.45, .55, -.46], '#2a2b33', .05);
        line(ctx, [.42, -.2, .78, .4], '#aeb4c0', .06);
        rr(ctx, -.5, -.3, .3, .07, .035); fillStroke(ctx, '#2a2b33');
        const ca = (v.rear.a * .5);
        ctx.save(); ctx.translate(-.05, .34); ctx.beginPath(); ctx.arc(0, 0, .09, 0, TAU); fillStroke(ctx, '#aeb4c0', .03);
        line(ctx, [cos(ca) * .17, sin(ca) * .17, -cos(ca) * .17, -sin(ca) * .17], '#6b7080', .03); ctx.restore();
        ctx.beginPath(); ctx.arc(.78, .4, .03, 0, TAU);
      });
      HW.drawWheel(ctx, v.front, { rim: .85, face: 'rgba(255,255,255,.1)', n: 14 });
      rider();
    } else if (k === 'moped') {
      HW.drawWheel(ctx, v.rear, { rim: .6, hub: '#c7ccd8', n: 5 });
      inB(ctx, f, () => {
        ctx.beginPath(); ctx.moveTo(-.95, -.12); ctx.quadraticCurveTo(-.98, .3, -.6, .5); ctx.lineTo(-.15, .46); ctx.lineTo(-.15, .22); ctx.lineTo(-.3, -.14); ctx.closePath(); fillStroke(ctx, '#ef5a6f');
        rr(ctx, -.1, .26, .62, .12, .05); fillStroke(ctx, '#7a7f8c');
        ctx.beginPath(); ctx.moveTo(.4, .28); ctx.lineTo(.64, .28); ctx.lineTo(.5, -.5); ctx.lineTo(.36, -.5); ctx.closePath(); fillStroke(ctx, '#ef5a6f');
        rr(ctx, -.95, -.15, 1.05, .12, .06); fillStroke(ctx, '#2a2b33');
        ctx.beginPath(); ctx.arc(.62, -.34, .08, 0, TAU); fillStroke(ctx, '#fff3b0', .035);
        line(ctx, [.43, -.5, .4, -.62, .25, -.66], '#2a2b33', .05);
        line(ctx, [.55, .3, .74, .4], '#aeb4c0', .06);
        ctx.beginPath(); ctx.moveTo(.4, .44); ctx.lineTo(.84, .44); ctx.lineTo(.8, .2); ctx.quadraticCurveTo(.7, .25, .55, .22); ctx.closePath();
        ctx.beginPath(); ctx.moveTo(.58, .06); ctx.quadraticCurveTo(.78, .1, .96, .3); ctx.lineTo(.86, .36); ctx.quadraticCurveTo(.74, .2, .56, .16); ctx.closePath(); fillStroke(ctx, '#ef5a6f');
        if (v.thrust) { ctx.beginPath(); ctx.moveTo(-.95, .06); ctx.lineTo(-1.35 - Math.random() * .3, .08); ctx.lineTo(-.95, .14); ctx.closePath(); fillStroke(ctx, '#ffd23f', .02); }
      });
      HW.drawWheel(ctx, v.front, { rim: .6, hub: '#c7ccd8', n: 5 });
      rider();
    } else if (k === 'segway') {
      inB(ctx, f, () => {
        line(ctx, [.3, -.56, .32, -1.78], '#aeb4c0', .08);
        rr(ctx, -.4, -.6, .8, .1, .05); fillStroke(ctx, '#1fb38a');
        rr(ctx, -.34, -.7, .68, .1, .05); fillStroke(ctx, '#2a2b33');
        line(ctx, [.3, -1.78, .46, -1.8], '#2a2b33', .06);
        rr(ctx, .26, -1.0, .1, .22, .04); fillStroke(ctx, '#2a2b33');
      });
      HW.drawWheel(ctx, v.rear, { rim: .6, hub: '#1fb38a', face: '#8de0c5', n: 8 });
      rider();
    } else if (k === 'pogo') {
      const pl = v.plunger;
      inB(ctx, pl, () => {
        rr(ctx, -.045, -.5, .09, .96, .04); fillStroke(ctx, '#d9dde6');
        ctx.beginPath(); ctx.arc(0, .46, .09, 0, TAU); fillStroke(ctx, '#2a2b33', .04);
      });
      inB(ctx, f, () => {
        rr(ctx, -.065, -.55, .13, 1.1, .05); fillStroke(ctx, '#9a5ff0');
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-.065, -.3 + i * .12); ctx.lineTo(.065, -.24 + i * .12); ctx.lineWidth = .03; ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.stroke(); }
        rr(ctx, -.22, -.48, .44, .06, .03); fillStroke(ctx, '#2a2b33');
        rr(ctx, -.16, .32, .32, .06, .03); fillStroke(ctx, '#d9dde6');
      });
      rider();
    }
  };
  const FONT = 'Nunito, "Segoe UI", system-ui, sans-serif';
  const wtext = (ctx, s, x, y, size, col, align = 'center', ink) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(.01, .01);
    ctx.font = '800 ' + Math.round(size * 100) + 'px ' + FONT; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (ink) { ctx.lineWidth = size * 22; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.strokeText(s, 0, 0); }
    ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore();
  };
  HW.wtext = wtext;

  HW.THEMES = {
    meadow: { sky: ['#5db9f5', '#d9f2ff'], hills: ['#a8dcb0', '#86c995'], dirt: '#a56f45', dirt2: '#8a5a37', top: '#5fc04e', top2: '#3f9b3a', blk: '#8e97a8', fric: .95, deco: ['tree', 'bush', 'flower'], bgk: 'cloud', sun: 1 },
    desert: { sky: ['#ff9e5c', '#ffe9bd'], hills: ['#f0b878', '#e0a05a'], dirt: '#d8a064', dirt2: '#bf8447', top: '#efcd86', top2: '#d6a95a', blk: '#a77a54', fric: .95, deco: ['cactus', 'rock'], bgk: 'cloud', sun: 1 },
    snow: { sky: ['#8fc2ec', '#eaf6ff'], hills: ['#d6e9f8', '#bcd8ee'], dirt: '#8da6bd', dirt2: '#71899f', top: '#f6fcff', top2: '#cfe5f4', blk: '#9fb6cb', fric: .4, deco: ['pine', 'snowman', 'rock'], bgk: 'snow' },
    night: { sky: ['#12133a', '#42337a'], hills: ['#2c2b62', '#23224f'], dirt: '#4b3c68', dirt2: '#3a2d54', top: '#7a62b8', top2: '#5e4a96', blk: '#5d5d7c', fric: .95, deco: ['crystal', 'shroom'], bgk: 'stars', moon: 1 },
    factory: { sky: ['#68798c', '#b4bfcb'], hills: ['#84909f', '#717d8d'], dirt: '#5b626d', dirt2: '#464c56', top: '#f0b323', top2: '#c99a12', blk: '#7b8596', fric: .9, deco: ['barrel', 'lamp'], bgk: 'gears' },
    lava: { sky: ['#32090f', '#b3361b'], hills: ['#5c1b14', '#451210'], dirt: '#4d3232', dirt2: '#372222', top: '#ff7f24', top2: '#d9490f', blk: '#6c4b4b', fric: .9, deco: ['spire', 'ember'], bgk: 'embers', lava: 1 }
  };
  HW.THEME_IDS = Object.keys(HW.THEMES);
  HW.LIFT = { wheelchair: .94, bike: .8, moped: .75, segway: .47, pogo: 1.42 };

  HW.mkBack = (th, seed) => {
    const R = seeded(seed * 97 + 13), b = { clouds: [], stars: [], gears: [], flakes: [] };
    for (let i = 0; i < 10; i++) b.clouds.push({ x: R(), y: .06 + R() * .32, s: .7 + R() * 1.1 });
    for (let i = 0; i < 110; i++) b.stars.push({ x: R(), y: R() * .75, s: .6 + R() * 1.6, p: R() * 6 });
    for (let i = 0; i < 7; i++) b.gears.push({ x: R(), y: .12 + R() * .55, r: 2.6 + R() * 4.5, n: rint(8, 14), d: R() < .5 ? 1 : -1 });
    for (let i = 0; i < 90; i++) b.flakes.push({ x: R(), y: R(), s: .5 + R() * 1.1, p: R() * 6 });
    return b;
  };

  const gearPath = (ctx, r, n) => {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a0 = i / (n * 2) * TAU, a1 = (i + 1) / (n * 2) * TAU, rr0 = i % 2 ? r * .82 : r;
      ctx.lineTo(cos(a0) * rr0, sin(a0) * rr0); ctx.lineTo(cos(a0 + (a1 - a0) * .5) * rr0, sin(a0 + (a1 - a0) * .5) * rr0);
    }
    ctx.closePath();
  };

  HW.drawBack = (ctx, th, b, cam, t) => {
    const w = cam.w, h = cam.h, ppm = cam.ppm, cx = cam.x, cy = cam.y;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (th.sun) {
      const sx = w * .8, sy = h * .2, r = Math.min(w, h) * .085, rg = ctx.createRadialGradient(sx, sy, r * .3, sx, sy, r * 4);
      rg.addColorStop(0, 'rgba(255,248,200,.85)'); rg.addColorStop(1, 'rgba(255,248,200,0)'); ctx.fillStyle = rg; ctx.fillRect(sx - r * 4, sy - r * 4, r * 8, r * 8);
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fillStyle = '#fff6c4'; ctx.fill();
    }
    if (th.bgk === 'stars') {
      for (const s of b.stars) { const a = .45 + .55 * Math.abs(sin(t * 1.3 + s.p)); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.fillRect(((s.x * w - cx * ppm * .02 * s.s) % w + w) % w, s.y * h, s.s, s.s); }
      ctx.globalAlpha = 1;
    }
    if (th.moon) {
      const sx = w * .8, sy = h * .2, r = Math.min(w, h) * .075, rg = ctx.createRadialGradient(sx, sy, r * .5, sx, sy, r * 3.5);
      rg.addColorStop(0, 'rgba(200,210,255,.5)'); rg.addColorStop(1, 'rgba(200,210,255,0)'); ctx.fillStyle = rg; ctx.fillRect(sx - r * 4, sy - r * 4, r * 8, r * 8);
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fillStyle = '#eef0ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(sx - r * .3, sy - r * .15, r * .2, 0, TAU); ctx.fillStyle = '#d3d7f0'; ctx.fill();
      ctx.beginPath(); ctx.arc(sx + r * .35, sy + r * .3, r * .14, 0, TAU); ctx.fill();
    }
    if (th.bgk === 'cloud') {
      ctx.fillStyle = 'rgba(255,255,255,.88)';
      for (const c of b.clouds) {
        const x = (((c.x * (w + 400) - cx * ppm * .04 + t * 6 * c.s) % (w + 400)) + w + 400) % (w + 400) - 200, y = c.y * h - cy * ppm * .01, s = c.s * h * .045;
        ctx.beginPath(); ctx.arc(x, y, s * 1.2, 0, TAU); ctx.arc(x + s * 1.3, y + s * .2, s, 0, TAU); ctx.arc(x - s * 1.3, y + s * .3, s * .8, 0, TAU); ctx.arc(x + s * .2, y - s * .6, s * 1.05, 0, TAU); ctx.fill();
      }
    }
    if (th.bgk === 'gears') {
      ctx.fillStyle = th.hills[0];
      for (const q of b.gears) {
        const r = q.r * ppm * .5, x = (((q.x * (w + 600) - cx * ppm * .12) % (w + 600)) + w + 600) % (w + 600) - 300, y = q.y * h - cy * ppm * .05;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * .25 * q.d); gearPath(ctx, r, q.n); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(0, 0, r * .28, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    const hill = (k, base, amp, col, f, ph) => {
      ctx.beginPath(); ctx.moveTo(0, h + 4);
      const ox = cx * ppm * k, oy = cy * ppm * k * .4;
      for (let x = 0; x <= w + 24; x += 24) {
        const u = (x + ox) / (170 * f);
        ctx.lineTo(x, h * base + amp * (sin(u + ph) + .55 * sin(u * 2.3 + ph * 2.1) + .3 * sin(u * 5.1 + ph * .7)) - oy);
      }
      ctx.lineTo(w + 24, h + 4); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    };
    hill(.1, .66, h * .06, th.hills[0], 1.4, 1);
    hill(.22, .78, h * .05, th.hills[1], 1, 3.2);
    if (th.bgk === 'snow' || th.bgk === 'embers') {
      const up = th.bgk === 'embers';
      for (const f of b.flakes) {
        const x = (((f.x * w + sin(t * .8 + f.p) * 24 - cx * ppm * .06 * f.s) % w) + w) % w, y = up ? h - (((f.y * h + t * 36 * f.s) % h)) : ((f.y * h + t * 42 * f.s) % h);
        ctx.globalAlpha = up ? .5 + .4 * sin(t * 5 + f.p) : .85; ctx.fillStyle = up ? '#ffb36b' : '#fff'; ctx.beginPath(); ctx.arc(x, y, f.s * (up ? 1.4 : 1.8), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  };

  const DECO = {
    tree(ctx, s) {
      rr(ctx, -.16 * s, -1.3 * s, .32 * s, 1.4 * s, .1 * s); fillStroke(ctx, '#7b4f2b', .05);
      for (const [x, y, r, c] of [[-.7, -1.5, .75, '#3f9b3a'], [.7, -1.5, .75, '#3f9b3a'], [0, -2.3, .95, '#4fb446'], [0, -1.6, .85, '#58c24d']]) { ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, TAU); fillStroke(ctx, c, .05); }
      ctx.beginPath(); ctx.arc(-.25 * s, -2.55 * s, .26 * s, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
    },
    bush(ctx, s) { for (const [x, y, r] of [[-.5, -.3, .5], [.5, -.3, .5], [0, -.6, .6]]) { ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, TAU); fillStroke(ctx, '#4aa944', .05); } },
    flower(ctx, s) {
      for (let i = -1; i <= 1; i++) { line(ctx, [i * .25 * s, 0, i * .3 * s, -.5 * s - Math.abs(i) * .1], '#3f9b3a', .05, false); ctx.beginPath(); ctx.arc(i * .3 * s, -.55 * s - Math.abs(i) * .1, .13 * s, 0, TAU); fillStroke(ctx, ['#ff6b8a', '#ffd23f', '#fff'][i + 1], .03); }
    },
    cactus(ctx, s) {
      rr(ctx, -.22 * s, -1.9 * s, .44 * s, 2 * s, .22 * s); fillStroke(ctx, '#4aa05a', .05);
      rr(ctx, -.75 * s, -1.3 * s, .32 * s, .8 * s, .16 * s); fillStroke(ctx, '#4aa05a', .05); rr(ctx, -.75 * s, -.65 * s, .6 * s, .28 * s, .12 * s); fillStroke(ctx, '#4aa05a', .05);
      rr(ctx, .43 * s, -1.6 * s, .32 * s, .75 * s, .16 * s); fillStroke(ctx, '#4aa05a', .05); rr(ctx, .15 * s, -.95 * s, .6 * s, .28 * s, .12 * s); fillStroke(ctx, '#4aa05a', .05);
    },
    rock(ctx, s) { ctx.beginPath(); ctx.moveTo(-.8 * s, .05); ctx.lineTo(-.55 * s, -.55 * s); ctx.lineTo(0, -.8 * s); ctx.lineTo(.6 * s, -.45 * s); ctx.lineTo(.85 * s, .05); ctx.closePath(); fillStroke(ctx, '#9a9fae', .05); ctx.beginPath(); ctx.moveTo(-.2 * s, -.7 * s); ctx.lineTo(.2 * s, -.7 * s); ctx.lineTo(.55 * s, -.42 * s); ctx.lineTo(-.1 * s, -.45 * s); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); },
    pine(ctx, s) {
      rr(ctx, -.12 * s, -.5 * s, .24 * s, .6 * s, .05 * s); fillStroke(ctx, '#6b4426', .05);
      for (let i = 0; i < 3; i++) { const y = -.4 * s - i * .85 * s, w = (1.05 - i * .24) * s; ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(0, y - 1.3 * s); ctx.lineTo(w, y); ctx.closePath(); fillStroke(ctx, '#2f7d54', .05); ctx.beginPath(); ctx.moveTo(-w * .55, y - .55 * s); ctx.lineTo(0, y - 1.3 * s); ctx.lineTo(w * .55, y - .55 * s); ctx.lineTo(w * .2, y - .72 * s); ctx.lineTo(-w * .2, y - .6 * s); ctx.closePath(); ctx.fillStyle = '#f2fbff'; ctx.fill(); }
    },
    snowman(ctx, s) {
      ctx.beginPath(); ctx.arc(0, -.45 * s, .5 * s, 0, TAU); fillStroke(ctx, '#fff', .05); ctx.beginPath(); ctx.arc(0, -1.15 * s, .36 * s, 0, TAU); fillStroke(ctx, '#fff', .05);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-.12 * s, -1.22 * s, .04 * s, 0, TAU); ctx.arc(.12 * s, -1.22 * s, .04 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -1.15 * s); ctx.lineTo(.3 * s, -1.12 * s); ctx.lineTo(0, -1.08 * s); ctx.closePath(); fillStroke(ctx, '#ff8a2a', .03);
    },
    crystal(ctx, s) {
      for (const [x, h, c] of [[-.4, 1.1, '#6fe3ff'], [0, 1.6, '#a98bff'], [.45, .9, '#6fe3ff']]) { ctx.beginPath(); ctx.moveTo((x - .22) * s, 0); ctx.lineTo((x - .12) * s, -h * s * .8); ctx.lineTo(x * s, -h * s); ctx.lineTo((x + .14) * s, -h * s * .75); ctx.lineTo((x + .24) * s, 0); ctx.closePath(); fillStroke(ctx, c, .04); ctx.beginPath(); ctx.moveTo((x - .1) * s, -h * s * .1); ctx.lineTo((x - .08) * s, -h * s * .75); ctx.lineTo((x + .02) * s, -h * s * .85); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = .05; ctx.stroke(); }
    },
    shroom(ctx, s) { rr(ctx, -.15 * s, -.7 * s, .3 * s, .75 * s, .1 * s); fillStroke(ctx, '#f6efe0', .04); ctx.beginPath(); ctx.ellipse(0, -.75 * s, .6 * s, .42 * s, 0, Math.PI, 0); fillStroke(ctx, '#ff6b9d', .05); ctx.fillStyle = '#fff'; for (const [x, y] of [[-.25, -.9], [.15, -1.0], [.32, -.82]]) { ctx.beginPath(); ctx.arc(x * s, y * s, .08 * s, 0, TAU); ctx.fill(); } },
    barrel(ctx, s) { rr(ctx, -.42 * s, -.95 * s, .84 * s, 1, .12 * s); fillStroke(ctx, '#d0352b', .05); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-.42 * s, -.62 * s, .84 * s, .07 * s); ctx.fillRect(-.42 * s, -.28 * s, .84 * s, .07 * s); },
    lamp(ctx, s) { line(ctx, [0, 0, 0, -2.2 * s, .5 * s, -2.4 * s], '#4a4f5a', .09); ctx.beginPath(); ctx.arc(.55 * s, -2.38 * s, .18 * s, 0, TAU); fillStroke(ctx, '#fff2a8', .04); },
    spire(ctx, s) { ctx.beginPath(); ctx.moveTo(-.5 * s, 0); ctx.lineTo(-.18 * s, -2.1 * s); ctx.lineTo(.5 * s, 0); ctx.closePath(); fillStroke(ctx, '#3b2626', .05); ctx.beginPath(); ctx.moveTo(-.1 * s, -1.3 * s); ctx.lineTo(.1 * s, -.4 * s); ctx.strokeStyle = '#ff7f24'; ctx.lineWidth = .06; ctx.stroke(); },
    ember(ctx, s) { for (const [x, y, r] of [[-.4, -.3, .32], [.3, -.35, .38], [0, -.7, .3]]) { ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, TAU); fillStroke(ctx, '#552626', .05); ctx.beginPath(); ctx.arc(x * s, y * s, r * s * .35, 0, TAU); ctx.fillStyle = '#ff8a2a'; ctx.fill(); } }
  };

  const stat = (x, y, a, shapes) => { const b = new PH.Body({ x, y, a, static: true }); for (const s of shapes) b.add(s); b.finalize(); return b; };
  const lcl = (it, lx, ly) => { const c = cos(it.a || 0), s = sin(it.a || 0); return [it.x + c * lx - s * ly, it.y + s * lx + c * ly]; };
  const xf = (ctx, it, fn) => { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a || 0); fn(); ctx.restore(); };
  const stripes = (ctx, w, h, c1, c2, sw) => {
    ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, Math.min(.1, h / 3)); ctx.clip(); ctx.fillStyle = c1; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = c2;
    for (let x = -w / 2 - h; x < w / 2 + h; x += sw * 2) { ctx.beginPath(); ctx.moveTo(x, h / 2); ctx.lineTo(x + sw, h / 2); ctx.lineTo(x + sw + h, -h / 2); ctx.lineTo(x + h, -h / 2); ctx.closePath(); ctx.fill(); }
    ctx.restore(); rr(ctx, -w / 2, -h / 2, w, h, Math.min(.1, h / 3)); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke();
  };

  const OWN = { head: 'neck', uaF: 'shF', uaB: 'shB', laF: 'elF', laB: 'elB', thF: 'hipF', thB: 'hipB', shF: 'knF', shB: 'knB' };
  HW.OWN = OWN;
  HW.snap = (W, j) => { if (!j || j.dead) return false; j.dead = true; if (W.onBreak) W.onBreak(j); return true; };

  const ITEM = {};

  ITEM.ground = (lv, it) => {
    const p = it.p, n = p.length / 2, th = lv.th, D = 9;
    let ymax = -1e9;
    for (let i = 0; i < n - 1; i++) {
      const x1 = p[2 * i], y1 = p[2 * i + 1], x2 = p[2 * i + 2], y2 = p[2 * i + 3];
      if (x2 - x1 < .01) continue;
      const yb = Math.max(y1, y2) + D;
      const b = stat(0, 0, 0, [PH.poly([x1, y1, x2, y2, x2, yb, x1, yb], { f: it.f ?? th.fric, e: 0 })]);
      lv.W.add(b);
    }
    for (let i = 0; i < n; i++) { ymax = Math.max(ymax, p[2 * i + 1]); lv.ext(p[2 * i], p[2 * i + 1]); }
    const path = new Path2D(), top = new Path2D(), grass = new Path2D();
    path.moveTo(p[0], p[1]); top.moveTo(p[0], p[1]); grass.moveTo(p[0], p[1] + .1);
    for (let i = 1; i < n; i++) { path.lineTo(p[2 * i], p[2 * i + 1]); top.lineTo(p[2 * i], p[2 * i + 1]); grass.lineTo(p[2 * i], p[2 * i + 1] + .1); }
    path.lineTo(p[2 * n - 2], ymax + D + 40); path.lineTo(p[0], ymax + D + 40); path.closePath();
    const g = { path, top, grass, x0: p[0], x1: p[2 * n - 2], p };
    lv.grounds.push(g);
    const R = seeded(Math.abs(lv.seed * 31 + Math.round(p[0] * 7)) + 5), kinds = th.deco;
    let x = p[0] + 2 + R() * 6;
    while (x < p[2 * n - 2] - 2) {
      let i = 0; while (i < n - 2 && p[2 * i + 2] < x) i++;
      const x1 = p[2 * i], y1 = p[2 * i + 1], x2 = p[2 * i + 2], y2 = p[2 * i + 3], dx = x2 - x1;
      if (dx > .01) {
        const sl = (y2 - y1) / dx;
        if (Math.abs(sl) < .3 && !(it.nd)) lv.decor.push({ x, y: y1 + sl * (x - x1) + .08, k: kinds[Math.floor(R() * kinds.length)], s: .75 + R() * .8 });
      }
      x += 3.5 + R() * 9;
    }
  };

  const BLK = {
    stone: (ctx, w, h, th) => { rr(ctx, -w / 2, -h / 2, w, h, .12); fillStroke(ctx, th.blk, .06); ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, .12); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-w / 2, -h / 2, w, Math.min(.2, h * .25)); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-w / 2, h / 2 - Math.min(.22, h * .25), w, .3); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let x = -w / 2 + .5; x < w / 2 - .2; x += 1) if (h > .6) ctx.fillRect(x, -h / 2, .035, h); ctx.restore(); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (const [x, y] of [[-w / 2 + .14, -h / 2 + .14], [w / 2 - .14, -h / 2 + .14], [-w / 2 + .14, h / 2 - .14], [w / 2 - .14, h / 2 - .14]]) { if (h > .45 && w > .45) { ctx.beginPath(); ctx.arc(x, y, .045, 0, TAU); ctx.fill(); } } },
    wood: (ctx, w, h) => { rr(ctx, -w / 2, -h / 2, w, h, .08); fillStroke(ctx, '#b9824a', .06); ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, .08); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.18)'; if (w >= h) for (let y = -h / 2 + .35; y < h / 2 - .1; y += .35) ctx.fillRect(-w / 2, y, w, .035); else for (let x = -w / 2 + .35; x < w / 2 - .1; x += .35) ctx.fillRect(x, -h / 2, .035, h); ctx.restore(); },
    ice: (ctx, w, h) => { rr(ctx, -w / 2, -h / 2, w, h, .14); fillStroke(ctx, '#bfe9ff', .05); ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, .14); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2 + .1); ctx.lineTo(-w / 2 + Math.min(w, 1.4), -h / 2 + .1); ctx.lineTo(-w / 2 + Math.min(w, 1.4) - .35, h / 2); ctx.lineTo(-w / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.restore(); },
    hazard: (ctx, w, h) => stripes(ctx, w, h, '#f2c200', '#26242d', .28)
  };
  ITEM.box = (lv, it) => {
    const hw = it.w / 2, hh = it.h / 2, m = it.m || 'stone';
    const b = stat(it.x, it.y, it.a || 0, [PH.box(hw, hh, 0, 0, 0, { f: m === 'ice' ? .04 : lv.th.fric })]); lv.W.add(b);
    const r = Math.hypot(hw, hh); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    lv.objs.push({ it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], bodies: [b], draw(ctx) { xf(ctx, it, () => BLK[m](ctx, it.w, it.h, lv.th)); } });
  };
  ITEM.ramp = (lv, it) => {
    const hw = it.w / 2, hh = it.h / 2, fl = it.fl ? -1 : 1, m = it.m || 'stone';
    const pts = [-hw * fl, hh, hw * fl, hh, hw * fl, -hh];
    const b = stat(it.x, it.y, it.a || 0, [PH.poly(pts, { f: m === 'ice' ? .04 : lv.th.fric })]); lv.W.add(b);
    const r = Math.hypot(hw, hh); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    lv.objs.push({ it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], bodies: [b], draw(ctx) {
      xf(ctx, it, () => {
        ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.lineTo(pts[2], pts[3]); ctx.lineTo(pts[4], pts[5]); ctx.closePath();
        fillStroke(ctx, m === 'ice' ? '#bfe9ff' : m === 'wood' ? '#b9824a' : m === 'hazard' ? '#f2c200' : lv.th.blk, .06);
        ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 1; i < 6; i++) { const x = -hw * fl + (hw * 2 * fl) * i / 6; ctx.fillRect(Math.min(x, x) - .0175, -hh, .035, hh * 2); } ctx.restore();
        ctx.beginPath(); ctx.moveTo(pts[2], pts[3]); ctx.lineTo(pts[4], pts[5]); ctx.lineTo(pts[0], pts[1]); ctx.lineWidth = .06; ctx.strokeStyle = INK; ctx.stroke();
      });
    } });
  };

  ITEM.spikes = (lv, it) => {
    const n = Math.max(1, Math.round(it.w / .5)), tw = it.w / n, sh = [PH.box(it.w / 2, .09, 0, .09, 0, { f: .5, tag: 'spike' })];
    for (let i = 0; i < n; i++) { const cx = -it.w / 2 + tw * (i + .5); sh.push(PH.poly([cx - tw * .46, 0, cx + tw * .46, 0, cx, -.62], { f: .4, tag: 'spike' })); }
    const b = stat(it.x, it.y, it.a || 0, sh); lv.W.add(b);
    const r = Math.hypot(it.w / 2, .7); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    lv.objs.push({ it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], bodies: [b], draw(ctx) {
      xf(ctx, it, () => {
        for (let i = 0; i < n; i++) {
          const cx = -it.w / 2 + tw * (i + .5);
          ctx.beginPath(); ctx.moveTo(cx - tw * .46, .02); ctx.lineTo(cx, -.62); ctx.lineTo(cx + tw * .46, .02); ctx.closePath(); fillStroke(ctx, '#c9d0dc', .045);
          ctx.beginPath(); ctx.moveTo(cx, -.62); ctx.lineTo(cx + tw * .46, .02); ctx.lineTo(cx + tw * .08, .02); ctx.closePath(); ctx.fillStyle = 'rgba(40,48,70,.35)'; ctx.fill();
        }
        rr(ctx, -it.w / 2 - .04, 0, it.w + .08, .2, .05); fillStroke(ctx, '#4b5160', .05);
      });
    } });
  };

  ITEM.mine = (lv, it) => {
    const o = { it, bb: [it.x - 1, it.y - 1, it.x + 1, it.y + 1], boom: false, t: Math.random() * 3,
      upd(dt) {
        o.t += dt;
        if (o.boom) return;
        for (const b of lv.plb) if (lv.W.circleHits(b, it.x, it.y, .5)) { o.boom = true; lv.explode(it.x, it.y, it.r || 6.5, it.p || 16); lv.dead.push(o); return; }
      },
      draw(ctx) {
        if (o.boom) return;
        ctx.save(); ctx.translate(it.x, it.y);
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(.3, -.07); ctx.lineTo(.5, 0); ctx.lineTo(.3, .07); ctx.closePath(); fillStroke(ctx, '#2d3039', .03); ctx.restore(); }
        ctx.beginPath(); ctx.arc(0, 0, .32, 0, TAU); fillStroke(ctx, '#3b3f4c', .05);
        ctx.beginPath(); ctx.arc(-.09, -.1, .1, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill();
        const on = sin(o.t * 6) > .2; ctx.beginPath(); ctx.arc(0, 0, .1, 0, TAU); ctx.fillStyle = on ? '#ff3b30' : '#7a1f1b'; ctx.fill(); ctx.lineWidth = .035; ctx.strokeStyle = INK; ctx.stroke();
        if (on) { const g = ctx.createRadialGradient(0, 0, .05, 0, 0, .7); g.addColorStop(0, 'rgba(255,60,50,.5)'); g.addColorStop(1, 'rgba(255,60,50,0)'); ctx.fillStyle = g; ctx.fillRect(-.7, -.7, 1.4, 1.4); }
        ctx.restore();
      } };
    lv.ext(it.x - 1, it.y - 1); lv.ext(it.x + 1, it.y + 1);
    lv.objs.push(o); lv.mines.push(o);
  };

  ITEM.harpoon = (lv, it) => {
    const b = stat(it.x, it.y, it.a || 0, [PH.box(.4, .2, 0, .1, 0, { f: .5 }), PH.box(.5, .1, .55, 0, 0, { f: .3 })]); lv.W.add(b);
    lv.ext(it.x - 2, it.y - 2); lv.ext(it.x + 2, it.y + 2);
    const o = { it, bb: [it.x - 2, it.y - 2, it.x + 2, it.y + 2], bodies: [b], cd: 1 + Math.random(), rec: 0, warn: 0, chg: 0,
      upd(dt) {
        o.cd -= dt; o.rec = Math.max(0, o.rec - dt * 3);
        const m = lv.main; if (!m) return;
        const dx = m.x - it.x, dy = m.y - it.y, c = cos(it.a || 0), s = sin(it.a || 0), lx = dx * c + dy * s, ly = -dx * s + dy * c, rg = it.range || 16;
        const inl = lx > 1.2 && lx < rg && Math.abs(ly) < .8 + lx * .09;
        o.warn = inl ? Math.min(1, o.warn + dt * 3) : Math.max(0, o.warn - dt * 3);
        o.chg = inl ? o.chg + dt : Math.max(0, o.chg - dt * 2);
        if (inl && o.cd <= 0 && o.chg > .9) { o.cd = 2.8; o.chg = 0; o.rec = 1; lv.fire(o); }
      },
      draw(ctx) {
        xf(ctx, it, () => {
          const rc = o.rec * .22;
          rr(ctx, -.55, -.06, 1.1, .5, .08); fillStroke(ctx, '#4b5160', .05); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-.5, -.02, 1, .08);
          ctx.save(); ctx.translate(-rc, 0); rr(ctx, 0, -.2, 1.25, .4, .08); fillStroke(ctx, '#6b7384', .05);
          ctx.fillStyle = o.warn > .3 ? (sin(lv.t * 14) > 0 ? '#ff3b30' : '#7a1f1b') : '#3b3f4c'; ctx.beginPath(); ctx.arc(.15, 0, .07, 0, TAU); ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = INK; ctx.stroke();
          if (o.cd < .6) { ctx.beginPath(); ctx.moveTo(.95, -.05); ctx.lineTo(1.35, 0); ctx.lineTo(.95, .05); ctx.closePath(); fillStroke(ctx, '#c9d0dc', .03); }
          ctx.restore();
          rr(ctx, -.3, .38, .6, .12, .04); fillStroke(ctx, '#2d3039', .04);
          if (o.rec > .8) { ctx.beginPath(); ctx.moveTo(1.3, 0); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? .22 : .5; ctx.lineTo(1.3 + cos(a) * r, sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill(); }
        });
      } };
    lv.objs.push(o);
  };

  ITEM.wreck = (lv, it) => {
    const L = it.len || 5, r = it.r || .8, amp = it.amp ?? 1.05, per = it.per || 3.4, ph = it.ph || 0, W = lv.W;
    const arm = new PH.Body({ x: it.x, y: it.y, kin: true, ld: 0, ad: 0 });
    arm.add(PH.box(.06, (L - r) / 2, 0, (L - r) / 2, 0, { f: .5 })); arm.add(PH.circle(r, 0, L, { f: .8, e: .25, tag: 'wreck' })); arm.finalize(); W.add(arm);
    const ang = t => amp * sin(TAU * t / per + ph);
    arm.a = ang(0); arm.upd();
    lv.ext(it.x - L, it.y); lv.ext(it.x + L, it.y + L + r);
    const o = { it, bb: [it.x - L - r, it.y - 1, it.x + L + r, it.y + L + r], arm,
      hold(dt) { arm.w = (ang(W.time + dt) - arm.a) / dt; },
      draw(ctx) {
        const ca = arm.a;
        const cx = it.x - sin(ca) * L, cy = it.y + cos(ca) * L;
        ctx.save(); ctx.translate(it.x, it.y);
        const links = Math.floor((L - r) / .26);
        for (let i = 0; i < links; i++) {
          const f = (i + .5) / links, x = -sin(ca) * (L - r) * f, y = cos(ca) * (L - r) * f;
          ctx.save(); ctx.translate(x, y); ctx.rotate(ca + (i % 2 ? 0 : Math.PI / 2)); ctx.beginPath(); ctx.ellipse(0, 0, .15, .06, 0, 0, TAU); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke(); ctx.strokeStyle = '#aeb4c0'; ctx.lineWidth = .03; ctx.stroke(); ctx.restore();
        }
        ctx.restore();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ca);
        for (let i = 0; i < 10; i++) { ctx.save(); ctx.rotate(i / 10 * TAU); ctx.beginPath(); ctx.moveTo(r * .85, -.12); ctx.lineTo(r * 1.3, 0); ctx.lineTo(r * .85, .12); ctx.closePath(); fillStroke(ctx, '#4b5160', .04); ctx.restore(); }
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r); g.addColorStop(0, '#8d93a3'); g.addColorStop(1, '#30333d'); fillStroke(ctx, g, .06);
        ctx.beginPath(); ctx.arc(0, -r * .85, .1, 0, TAU); fillStroke(ctx, '#aeb4c0', .03);
        ctx.restore();
        ctx.save(); ctx.translate(it.x, it.y); rr(ctx, -.5, -.3, 1, .3, .06); fillStroke(ctx, '#f2c200', .05); ctx.beginPath(); ctx.arc(0, 0, .12, 0, TAU); fillStroke(ctx, '#aeb4c0', .03); ctx.restore();
      } };
    lv.objs.push(o); lv.holds.push(o);
  };

  ITEM.fan = (lv, it) => {
    const a = it.a ?? -Math.PI / 2, w = it.w || 7, h = it.h || 3, f = it.f || 16;
    const c = { x: it.x, y: it.y, a }, b = stat(it.x, it.y, a, [PH.box(.18, h / 2, -.18, 0, 0, { f: .5 })]); lv.W.add(b);
    const r = Math.hypot(w, h); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    const dx = cos(a), dy = sin(a);
    const o = { it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], ang: 0,
      hold() {
        for (const bd of lv.W.dyn) {
          if (bd.kin || !bd.im) continue;
          const px = bd.x - it.x, py = bd.y - it.y, lx = px * dx + py * dy, ly = -px * dy + py * dx;
          if (lx < -.2 || lx > w || Math.abs(ly) > h / 2) continue;
          const k = f * (1 - .5 * lx / w) * bd.m;
          bd.fx += dx * k; bd.fy += dy * k;
        }
      },
      upd(dt) { o.ang += dt * 16; },
      draw(ctx) {
        xf(ctx, c, () => {
          ctx.lineCap = 'round';
          for (let i = 0; i < 9; i++) { const ly = ((i * .37 + .11) % 1 - .5) * h * .92, ph = ((lv.t * (5 + (i % 3)) * .8 + i * .43) % 1), lx = ph * w; ctx.globalAlpha = (1 - ph) * .5; ctx.strokeStyle = '#fff'; ctx.lineWidth = .07; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + .9, ly); ctx.stroke(); }
          ctx.globalAlpha = 1;
          rr(ctx, -.5, -h / 2, .62, h, .12); fillStroke(ctx, '#6b7384', .06);
          ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-.45, -h / 2 + .05, .1, h - .1);
          for (let i = 0; i < 3; i++) { const q = o.ang + i * TAU / 3, l = cos(q) * h * .42; ctx.beginPath(); ctx.ellipse(.0, 0, .06, Math.abs(l) + .01, 0, 0, TAU); ctx.fillStyle = i ? '#c9d0dc' : '#e9edf5'; ctx.fill(); ctx.lineWidth = .04; ctx.strokeStyle = INK; ctx.stroke(); }
          ctx.beginPath(); ctx.arc(0, 0, .13, 0, TAU); fillStroke(ctx, '#2d3039', .04);
          rr(ctx, -.5, h / 2 - .02, .62, .14, .04); fillStroke(ctx, '#2d3039', .04);
        });
      } };
    lv.objs.push(o); lv.holds.push(o);
  };

  ITEM.boost = (lv, it) => {
    const w = it.w || 5, f = it.f || 26, a = it.a || 0, dx = cos(a), dy = sin(a);
    const r = Math.hypot(w / 2, 1.5); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    const o = { it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], hit: 0,
      hold() {
        for (const bd of lv.W.dyn) {
          if (bd.kin || !bd.im) continue;
          const px = bd.x - it.x, py = bd.y - it.y, lx = px * dx + py * dy, ly = -px * dy + py * dx;
          if (Math.abs(lx) > w / 2 || ly > .5 || ly < -1.4) continue;
          const vs = bd.vx * dx + bd.vy * dy;
          if (vs < 25) { bd.fx += dx * f * bd.m; bd.fy += dy * f * bd.m; }
          o.hit = .6;
        }
      },
      upd(dt) { o.hit = Math.max(0, o.hit - dt); },
      draw(ctx) {
        xf(ctx, it, () => {
          rr(ctx, -w / 2, -.04, w, .2, .06); fillStroke(ctx, '#2d3039', .05);
          const n = Math.floor(w / .7);
          for (let i = 0; i < n; i++) { const ph = ((i / n - lv.t * 1.6) % 1 + 1) % 1, al = .3 + .7 * Math.max(0, 1 - ph * 1.2) + (o.hit ? .2 : 0), x = -w / 2 + (i + .5) * w / n; ctx.beginPath(); ctx.moveTo(x - .18, .12); ctx.lineTo(x + .02, .12); ctx.lineTo(x + .2, .04); ctx.lineTo(x + .02, -.0); ctx.lineTo(x - .18, -.0); ctx.lineTo(x, .06); ctx.closePath(); ctx.fillStyle = 'rgba(255,214,60,' + Math.min(1, al) + ')'; ctx.fill(); }
          ctx.globalAlpha = .18 + (o.hit ? .22 : 0); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-w / 2, -1.2, w, 1.2); ctx.globalAlpha = 1;
        });
      } };
    lv.objs.push(o); lv.holds.push(o);
  };

  ITEM.glass = (lv, it) => {
    const b = stat(it.x, it.y, it.a || 0, [PH.box(it.w / 2, it.h / 2, 0, 0, 0, { f: .2, tag: 'glass' })]); lv.W.add(b);
    const r = Math.hypot(it.w / 2, it.h / 2); lv.ext(it.x - r, it.y - r); lv.ext(it.x + r, it.y + r);
    const o = { it, bb: [it.x - r, it.y - r, it.x + r, it.y + r], bodies: [b], b, broken: false, draw(ctx) {
      if (o.broken) return;
      xf(ctx, it, () => {
        rr(ctx, -it.w / 2, -it.h / 2, it.w, it.h, .06); ctx.fillStyle = 'rgba(160,220,255,.38)'; ctx.fill(); ctx.lineWidth = .06; ctx.strokeStyle = 'rgba(220,245,255,.95)'; ctx.stroke();
        ctx.save(); rr(ctx, -it.w / 2, -it.h / 2, it.w, it.h, .06); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = .08; const hh = it.h, ww = it.w;
        for (let k = 0; k < 3; k++) { const o2 = (k - 1) * .5; ctx.beginPath(); ctx.moveTo(-ww / 2 + o2 * ww * .5 + .1, hh / 2); ctx.lineTo(-ww / 2 + o2 * ww * .5 + .1 + Math.min(hh, ww) * .6, -hh / 2); ctx.stroke(); }
        ctx.restore();
        ctx.lineWidth = .025; ctx.strokeStyle = INK; rr(ctx, -it.w / 2, -it.h / 2, it.w, it.h, .06); ctx.stroke();
      });
    } };
    b.ud = o; b.shapes[0].ud = o;
    lv.objs.push(o);
  };

  ITEM.spring = (lv, it) => {
    const w = it.w || 2.2, p = it.p || 15, o = { it, press: 0, bb: [it.x - w, it.y - 1.2, it.x + w, it.y + 1.2] };
    const b = stat(it.x, it.y, it.a || 0, [PH.poly([-w / 2, 0, w / 2, 0, w / 2 + .5, .24, -w / 2 - .5, .24], { f: .7, bounce: p, tag: 'spring', ud: o })]); lv.W.add(b);
    lv.ext(it.x - w, it.y - 1.2); lv.ext(it.x + w, it.y + 1.2);
    o.bodies = [b];
    o.upd = dt => { o.press = Math.max(0, o.press - dt * 3.2); };
    o.draw = ctx => {
      xf(ctx, it, () => {
        const ext = .55 * (1 - o.press * .65) + .22;
        ctx.beginPath(); const n = 6; ctx.moveTo(-w * .3, ext + .24); for (let i = 0; i <= n; i++) ctx.lineTo((i % 2 ? .3 : -.3) * w * .85, .24 + ext * (1 - i / n));
        ctx.lineWidth = .16; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineWidth = .09; ctx.strokeStyle = '#ff5a5a'; ctx.stroke();
        rr(ctx, -w * .42, ext + .22, w * .84, .14, .05); fillStroke(ctx, '#4b5160', .05);
        ctx.save(); ctx.translate(0, -o.press * .0); rr(ctx, -w / 2, 0, w, .24, .1); fillStroke(ctx, '#3b7cf4', .06); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-w / 2 + .1, .04, w - .2, .05); ctx.restore();
      });
    };
    lv.objs.push(o);
  };

  ITEM.crate = (lv, it) => {
    const w = it.w || 1, h = it.h || w, b = new PH.Body({ x: it.x, y: it.y, a: it.a || 0, ld: .1, ad: .3 });
    b.add(PH.box(w / 2, h / 2, 0, 0, 0, { d: it.d || 26, f: .55, e: .05 })); b.finalize(); lv.W.add(b);
    lv.ext(it.x - 2, it.y - 2); lv.ext(it.x + 2, it.y + 2);
    lv.objs.push({ it, b, dyn: true, draw(ctx) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.translate(b.lx, b.ly);
      rr(ctx, -w / 2, -h / 2, w, h, .05); fillStroke(ctx, '#c98f4a', .06);
      ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, .05); ctx.clip(); ctx.strokeStyle = '#9a6a33'; ctx.lineWidth = .09; ctx.strokeRect(-w / 2 + .09, -h / 2 + .09, w - .18, h - .18);
      ctx.beginPath(); ctx.moveTo(-w / 2 + .1, -h / 2 + .1); ctx.lineTo(w / 2 - .1, h / 2 - .1); ctx.moveTo(w / 2 - .1, -h / 2 + .1); ctx.lineTo(-w / 2 + .1, h / 2 - .1); ctx.stroke(); ctx.restore();
      ctx.restore();
    } });
  };

  ITEM.ball = (lv, it) => {
    const r = it.r || .6, b = new PH.Body({ x: it.x, y: it.y, ld: .04, ad: .05 });
    b.add(PH.circle(r, 0, 0, { d: it.d || 8, f: .8, e: .45 })); b.finalize(); lv.W.add(b);
    lv.ext(it.x - 2, it.y - 2); lv.ext(it.x + 2, it.y + 2);
    const cols = ['#ff5a5a', '#ffd23f', '#3b7cf4', '#fff', '#2fbf71', '#ff9a3c'];
    lv.objs.push({ it, b, dyn: true, draw(ctx) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, i / 6 * TAU, (i + 1) / 6 * TAU); ctx.closePath(); ctx.fillStyle = cols[i]; ctx.fill(); }
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = .06; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
    } });
  };

  ITEM.lift = (lv, it) => {
    const w = it.w || 4, h = it.h || .45, dx = it.dx || 0, dy = it.dy || 0, per = it.per || 6, ph = it.ph || 0;
    const b = new PH.Body({ x: it.x, y: it.y, kin: true, ld: 0, ad: 0 }); b.add(PH.box(w / 2, h / 2, 0, 0, 0, { f: 1 })); b.finalize(); lv.W.add(b);
    const at = t => [it.x + dx * sin(TAU * t / per + ph), it.y + dy * sin(TAU * t / per + ph)];
    lv.ext(it.x - Math.abs(dx) - w, it.y - Math.abs(dy) - 2); lv.ext(it.x + Math.abs(dx) + w, it.y + Math.abs(dy) + 2);
    const o = { it, b, bb: [it.x - Math.abs(dx) - w, it.y - Math.abs(dy) - 3, it.x + Math.abs(dx) + w, it.y + Math.abs(dy) + 3],
      hold(dt) { const [nx, ny] = at(lv.W.time + dt); b.vx = (nx - b.x) / dt; b.vy = (ny - b.y) / dt; },
      draw(ctx) {
        ctx.save();
        if (dx || dy) { ctx.setLineDash([.25, .25]); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = .06; ctx.beginPath(); ctx.moveTo(it.x - dx, it.y - dy); ctx.lineTo(it.x + dx, it.y + dy); ctx.stroke(); ctx.setLineDash([]); }
        ctx.translate(b.x, b.y);
        stripes(ctx, w, h, '#7b8596', '#5b6372', .3);
        rr(ctx, -w / 2 + .1, h / 2 - .02, w - .2, .1, .04); fillStroke(ctx, '#2d3039', .03);
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * (w / 2 - .25), 0, .05, 0, TAU); ctx.fillStyle = sin(lv.t * 4 + s) > 0 ? '#2fe38a' : '#1c6e47'; ctx.fill(); }
        ctx.restore();
      } };
    lv.objs.push(o); lv.holds.push(o);
  };

  ITEM.sign = (lv, it) => {
    lv.ext(it.x - 2, it.y - 2); lv.ext(it.x + 2, it.y + 1);
    const lines = String(it.txt || '').split('|');
    lv.objs.push({ it, bb: [it.x - 3, it.y - 3, it.x + 3, it.y + 1], draw(ctx) {
      const w = Math.max(1.3, Math.max(...lines.map(s => s.length)) * .2 + .4), h = .36 + lines.length * .32;
      rr(ctx, it.x - .06, it.y - 1.1, .12, 1.15, .03); fillStroke(ctx, '#7b4f2b', .05);
      rr(ctx, it.x - w / 2, it.y - 1.1 - h, w, h, .1); fillStroke(ctx, '#d9a45a', .06);
      lines.forEach((s, i) => wtext(ctx, s, it.x, it.y - 1.1 - h + .34 + i * .32, .24, '#3a2415'));
    } });
  };

  ITEM.spawn = (lv, it) => { lv.spawn = { x: it.x, y: it.y }; lv.ext(it.x, it.y); lv.spawnIt = it; };

  ITEM.finish = (lv, it) => {
    lv.finish = { x: it.x, y: it.y, r: it.r || 1.15 }; lv.ext(it.x, it.y);
    lv.objs.push({ it, bb: [it.x - 4, it.y - 40, it.x + 4, it.y + 3], draw(ctx) {
      const t = lv.t, got = lv.won;
      const g = ctx.createLinearGradient(0, it.y + .6, 0, it.y - 34); g.addColorStop(0, 'rgba(255,230,120,.5)'); g.addColorStop(1, 'rgba(255,230,120,0)');
      ctx.fillStyle = g; ctx.fillRect(it.x - .9, it.y - 34, 1.8, 34.6);
      const by = it.y + sin(t * 2.4) * .12;
      ctx.beginPath(); ctx.ellipse(it.x, it.y + .7, .9, .2, 0, 0, TAU); ctx.fillStyle = 'rgba(255,210,60,.35)'; ctx.fill();
      const sp = cos(t * 2.8), rg = ctx.createRadialGradient(it.x, by, .2, it.x, by, 1.6); rg.addColorStop(0, 'rgba(255,240,150,.7)'); rg.addColorStop(1, 'rgba(255,240,150,0)'); ctx.fillStyle = rg; ctx.fillRect(it.x - 1.6, by - 1.6, 3.2, 3.2);
      ctx.save(); ctx.translate(it.x, by); ctx.scale(Math.max(.12, Math.abs(sp)), 1);
      ctx.beginPath(); ctx.arc(0, 0, .6, 0, TAU); fillStroke(ctx, got ? '#fff2a0' : '#ffc928', .07);
      ctx.beginPath(); ctx.arc(0, 0, .45, 0, TAU); ctx.lineWidth = .04; ctx.strokeStyle = '#c98a00'; ctx.stroke();
      ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .1 : .28; ctx.lineTo(cos(a) * r, sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#fff6c9'; ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = '#c98a00'; ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 6; i++) { const a = t * 1.5 + i * 1.047, r = .95 + .15 * sin(t * 3 + i), s = .06 + .04 * sin(t * 5 + i * 2); ctx.beginPath(); ctx.arc(it.x + cos(a) * r, by + sin(a) * r * .8, s, 0, TAU); ctx.fillStyle = '#fff3a8'; ctx.fill(); }
      wtext(ctx, 'FINISH', it.x, by - 1.15, .3, '#fff', 'center', INK);
    } });
  };

  HW.ITEM = ITEM;

  HW.buildLevel = (W, L, fx, seed) => {
    const th = HW.THEMES[L.theme] || HW.THEMES.meadow;
    const lv = { W, L, th, fx, seed: seed || 1, objs: [], grounds: [], decor: [], holds: [], mines: [], proj: [], dead: [], t: 0, plb: [], main: null, spawn: { x: 0, y: 0 }, finish: null, won: false, bnd: { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 }, back: HW.mkBack(th, seed || 1), pats: null };
    lv.ext = (x, y) => { const b = lv.bnd; if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; };
    for (const it of L.items) { const f = ITEM[it.t]; if (f) f(lv, it); }
    let gy = -1e9; for (const g of lv.grounds) for (let i = 1; i < g.p.length; i += 2) gy = Math.max(gy, g.p[i]);
    lv.fall = Math.max(gy, lv.bnd.y1) + 20;
    lv.bnd.y1 = lv.fall;
    lv.groundY = x => {
      let best = null;
      for (const g of lv.grounds) {
        if (x < g.x0 || x > g.x1) continue;
        const p = g.p; let i = 0; while (i < p.length / 2 - 2 && p[2 * i + 2] < x) i++;
        const x1 = p[2 * i], y1 = p[2 * i + 1], x2 = p[2 * i + 2], y2 = p[2 * i + 3];
        if (x2 <= x1) continue;
        const y = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
        if (best === null || y < best) best = y;
      }
      return best;
    };
    lv.setPlayer = v => { lv.plb = v.all; lv.main = v.main; lv.veh = v; };
    lv.hold = dt => { for (const o of lv.holds) o.hold(dt); };
    lv.update = dt => {
      lv.t += dt;
      for (const o of lv.objs) if (o.upd) o.upd(dt);
      for (const o of lv.dead) { const i = lv.objs.indexOf(o); if (i >= 0) lv.objs.splice(i, 1); const k = lv.mines.indexOf(o); if (k >= 0) lv.mines.splice(k, 1); }
      lv.dead.length = 0;
      for (let i = lv.proj.length - 1; i >= 0; i--) { const p = lv.proj[i]; p.age += dt; if (p.age > p.life || p.b.y > lv.fall) { W.remove(p.b); lv.proj.splice(i, 1); } }
      if (lv.finish && !lv.won) {
        const f = lv.finish;
        for (const b of lv.plb) if (!b.dead && W.circleHits(b, f.x, f.y, f.r * .75)) { lv.won = true; break; }
      }
    };
    lv.explode = (x, y, R, pw) => {
      fx.boom(x, y, R);
      for (const b of W.dyn) {
        if (b.kin || b.dead || !b.im) continue;
        let dx = b.x - x, dy = b.y - y; const d = Math.max(.25, hyp(dx, dy));
        if (d > R) continue;
        dx /= d; dy /= d;
        const k = Math.pow(1 - d / R, 1.1) * pw;
        b.vx += dx * k; b.vy += dy * k - k * .22; b.w += (Math.random() - .5) * k * .5;
        const rg = b.rag;
        if (rg && d < R * .55 && !rg.free) { rg.eject(); if (lv.veh && lv.veh.riders.includes(rg)) lv.veh.ejected = lv.veh.riders.every(q => q.free); }
        if (rg && b.pn && OWN[b.pn] && d < R * .5 && Math.random() < .8) { if (HW.snap(W, rg.joints[OWN[b.pn]])) fx.pop(b.x, b.y); }
      }
    };
    lv.fire = o => {
      const it = o.it, a = it.a || 0, c = cos(a), s = sin(a), x = it.x + c * 1.45, y = it.y + s * 1.45;
      const b = new PH.Body({ x, y, a, vx: c * 38, vy: s * 38, gs: .12, ld: 0, ad: .1 });
      b.add(PH.box(.55, .03, 0, 0, 0, { d: 140, f: .3 })); b.add(PH.poly([.55, -.1, .95, 0, .55, .1], { d: 140, f: .3, tag: 'harp' })); b.add(PH.box(.05, .12, -.5, 0, 0, { d: 140, f: .3 }));
      b.finalize(); b.kind = 'harp'; W.add(b);
      const p = { b, age: 0, life: 7, stuck: false }; b.proj = p; lv.proj.push(p);
      fx.snd('shoot'); fx.puff(x + c * .5, y + s * .5, 5, '#fff7d6'); fx.shake(.25);
    };
    W.pre = cs => {
      for (let i = cs.length - 1; i >= 0; i--) {
        const c = cs[i], sh = c.sa.tag === 'glass' ? c.sa : c.sb.tag === 'glass' ? c.sb : null;
        if (!sh || sh.ud.broken) continue;
        const o = sh === c.sa ? c.b : c.a;
        if (!o.im) continue;
        if (Math.hypot(o.vx, o.vy) > 5.5 + o.m * .01) {
          sh.ud.broken = true; W.remove(sh.body); fx.glass(sh.ud.it); cs.splice(i, 1);
        }
      }
    };
    lv.contact = (c, imp) => {
      for (const sh of [c.sa, c.sb]) {
        const tg = sh.tag; if (!tg) continue;
        const other = sh === c.sa ? c.sb : c.sa, ob = other.body, sb = sh.body;
        if (tg === 'spring') {
          if (ob.im && imp > .5) { if ((ob.kind === 'plunger' || ob.kind === 'wheel') && lv.veh && lv.veh.all.includes(ob) && sh.ud.press < .3) for (const q of lv.veh.all) { q.vy = Math.min(q.vy, -sh.bounce * .85); q.vx = Math.max(q.vx, 6); } sh.ud.press = 1; fx.snd('boing', Math.min(1, .35 + imp / 120), 1); fx.puff(ob.x, sh.body.y, 4, '#fff'); }
        } else if (tg === 'glass') {
          if (ob.im && imp > 6 + ob.m * .06 && !sh.ud.broken) {
            sh.ud.broken = true; W.remove(sh.body); fx.glass(sh.ud.it); ob.vx *= .94; ob.vy *= .94;
          }
        } else if (tg === 'spike') {
          if (ob.rag && imp > 2.2) {
            const rg = ob.rag, key = ob.pn, jn = OWN[key];
            if (key === 'torso') { if (imp > 6 && !rg.free) { rg.eject(); fx.pop(ob.x, ob.y); fx.snd('spike', 1); } }
            else if (jn && HW.snap(W, rg.joints[jn])) { fx.pop(ob.x, ob.y); fx.snd('spike', 1); }
          } else if (ob.kind === 'wheel' && imp > 2 && !ob.flat) { ob.flat = true; fx.snd('spike', .8); fx.puff(ob.x, ob.y, 5, '#ddd'); }
        } else if (tg === 'harp') {
          const p = sb.proj; if (!p || p.stuck || imp < 1.5) continue;
          if (ob.rag) {
            p.stuck = true; p.age = 0; p.life = 14;
            const [px, py] = [sh.body.x, sh.body.y];
            const j = new PH.Rev(ob, sb, px + cos(sb.a) * .7, py + sin(sb.a) * .7, { breakAt: 2600 }); W.join(j);
            const g = new PH.Ang(ob, sb); g.breakAt = 2600; W.join(g);
            const jn = OWN[ob.pn]; if (jn && ob.pn !== 'torso') HW.snap(W, ob.rag.joints[jn]);
            fx.pop(px, py); fx.snd('metal', 1, .8); fx.shake(.3);
          } else { p.stuck = true; p.age = p.life - 4; fx.snd('metal', .5, 1.1); fx.puff(sb.x, sb.y, 3, '#fff'); }
        }
      }
    };
    lv.tagPlayer = v => {
      for (const r of v.riders) for (const n in r.parts) { r.parts[n].rag = r; r.parts[n].pn = n; r.parts[n].veh = v; }
      for (const b of v.bodies) b.veh = v;
    };
    lv.drawWorld = (ctx, cam, back) => {
      const x0 = cam.x0, x1 = cam.x1, y0 = cam.y0, y1 = cam.y1;
      for (const d of lv.decor) {
        if (d.x < x0 - 4 || d.x > x1 + 4 || d.y < y0 - 5 || d.y > y1 + 5) continue;
        ctx.save(); ctx.translate(d.x, d.y); DECO[d.k](ctx, d.s); ctx.restore();
      }
      if (!lv.pat) {
        const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), R = seeded(77);
        g.fillStyle = th.dirt; g.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 46; i++) {
          const x = R() * 128, y = R() * 128, rx = 2 + R() * 6, ry = 1.5 + R() * 4, rt = R() * 3; g.fillStyle = R() < .55 ? th.dirt2 : shade(th.dirt, 1.14);
          for (const ox of [-128, 0, 128]) for (const oy of [-128, 0, 128]) { g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, rt, 0, TAU); g.fill(); }
        }
        lv.pat = ctx.createPattern(c, 'repeat'); lv.pat.setTransform(new DOMMatrix().scale(1 / 64));
      }
      for (const g of lv.grounds) {
        if (g.x1 < x0 || g.x0 > x1) continue;
        ctx.fillStyle = lv.pat; ctx.fill(g.path);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.lineWidth = .3; ctx.strokeStyle = th.top2; ctx.stroke(g.grass);
        ctx.lineWidth = .2; ctx.strokeStyle = th.top; ctx.save(); ctx.translate(0, -.03); ctx.stroke(g.grass); ctx.restore();
        ctx.lineWidth = .06; ctx.strokeStyle = INK; ctx.stroke(g.path);
      }
      if (lv.th.lava) {
        const ly = lv.fall - 8, gr = ctx.createLinearGradient(0, ly, 0, ly + 8); gr.addColorStop(0, '#ffb13c'); gr.addColorStop(1, '#d9300f');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0 - 2, ly + 30); for (let x = Math.floor(x0 - 2); x <= x1 + 2; x += 1) ctx.lineTo(x, ly + sin(x * .7 + lv.t * 2.2) * .22 + sin(x * .31 - lv.t * 1.3) * .18); ctx.lineTo(x1 + 2, ly + 30); ctx.closePath(); ctx.fill();
      }
      for (const o of lv.objs) {
        if (o.dyn) { const b = o.b; if (b.x < x0 - 3 || b.x > x1 + 3 || b.y < y0 - 3 || b.y > y1 + 3) continue; }
        else if (o.bb && (o.bb[2] < x0 || o.bb[0] > x1 || o.bb[3] < y0 || o.bb[1] > y1)) continue;
        o.draw(ctx);
      }
      for (const p of lv.proj) {
        inB(ctx, p.b, () => {
          rr(ctx, -.55, -.035, 1.1, .07, .03); fillStroke(ctx, '#aeb4c0', .035);
          ctx.beginPath(); ctx.moveTo(.55, -.11); ctx.lineTo(.97, 0); ctx.lineTo(.55, .11); ctx.closePath(); fillStroke(ctx, '#dfe4ee', .04);
          ctx.beginPath(); ctx.moveTo(-.5, 0); ctx.lineTo(-.62, -.14); ctx.lineTo(-.4, 0); ctx.lineTo(-.62, .14); ctx.closePath(); fillStroke(ctx, '#ff5a5a', .035);
        });
      }
    };
    return lv;
  };
  const PI = Math.PI;
  const P = (x, y) => {
    const p = [x, y], b = { p };
    b.to = (nx, ny) => { p.push(nx, ny); return b; };
    b.f = dx => b.to(p[p.length - 2] + dx, p[p.length - 1]);
    b.s = (dx, dy) => b.to(p[p.length - 2] + dx, p[p.length - 1] + dy);
    b.c = (dx, dy, n = 8) => { const x0 = p[p.length - 2], y0 = p[p.length - 1]; for (let i = 1; i <= n; i++) b.to(x0 + dx * i / n, y0 + dy * (1 - cos(PI * i / n)) / 2); return b; };
    b.bump = (dx, h, n = 10) => { const x0 = p[p.length - 2], y0 = p[p.length - 1]; for (let i = 1; i <= n; i++) b.to(x0 + dx * i / n, y0 - h * (1 - cos(TAU * i / n)) / 2); return b; };
    b.x1 = () => p[p.length - 2];
    b.at = x => {
      let i = 0; while (i < p.length / 2 - 2 && p[2 * i + 2] < x) i++;
      const x1 = p[2 * i], y1 = p[2 * i + 1], x2 = p[2 * i + 2], y2 = p[2 * i + 3];
      return y1 + (y2 - y1) * clamp((x - x1) / (x2 - x1), 0, 1);
    };
    b.ang = x => { const e = .6; return atan2(b.at(x + e) - b.at(x - e), 2 * e); };
    b.g = o => Object.assign({ t: 'ground', p }, o);
    return b;
  };
  const K = {
    sp: (g, x, w) => ({ t: 'spikes', x: x + w / 2, y: g.at(x + w / 2) - .1, w, a: g.ang(x + w / 2) }),
    mn: (g, x, o) => Object.assign({ t: 'mine', x, y: g.at(x) - .36 }, o),
    hp: (x, y, a, range) => ({ t: 'harpoon', x, y, a, range }),
    wr: (x, y, o) => Object.assign({ t: 'wreck', x, y }, o),
    fn: (x, y, a, o) => Object.assign({ t: 'fan', x, y, a }, o),
    bo: (g, x, w, f) => ({ t: 'boost', x, y: g.at(x), w, f, a: g.ang(x) }),
    gl: (g, x, w, h) => ({ t: 'glass', x, y: g.at(x) - h / 2 - .02, w, h }),
    sg: (g, x, txt) => ({ t: 'sign', x, y: g.at(x), txt }),
    sr: (g, x, w, p) => ({ t: 'spring', x, y: g.at(x) - .22, w, p }),
    bx: (g, x, w, h, m) => ({ t: 'box', x, y: g.at(x) - h / 2 + .02, w, h, m }),
    rp: (g, x, w, h, fl) => ({ t: 'ramp', x, y: g.at(x) - h / 2 + .02, w, h, fl }),
    cr: (g, x, w, h) => ({ t: 'crate', x, y: g.at(x) - (h || w) / 2 - .02, w, h: h || w }),
    st: (g, x, n, w) => { const o = []; for (let r = 0; r < n; r++) for (let c = 0; c < n - r; c++) o.push({ t: 'crate', x: x + (c + r / 2) * w * 1.02, y: g.at(x) - w / 2 - r * w - .02, w, h: w }); return o; },
    ba: (x, y, r) => ({ t: 'ball', x, y, r }),
    lf: (x, y, o) => Object.assign({ t: 'lift', x, y }, o),
    sp0: (g, x) => ({ t: 'spawn', x, y: g.at(x) }),
    fin: (g, x) => ({ t: 'finish', x, y: g.at(x) - .9 })
  };
  const LV = (id, name, theme, char, par, blurb, ...parts) => {
    const items = [];
    for (const q of parts) { if (Array.isArray(q)) items.push(...q); else if (q.p && q.g) items.push(q.g()); else items.push(q); }
    return { id, name, theme, char, par, blurb, items };
  };

  HW.LEVELS = [];
  {
    const L = HW.LEVELS;

    {
      const a = P(-16, 0).f(28).c(16, -3).f(6).c(16, 3).f(8);
      const b = P(67, 1).s(14, 1.4).c(16, 2).f(8).c(14, -2).f(6).c(16, -2.4).f(10);
      const cx = b.x1() + 4;
      const c = P(cx, b.at(b.x1()) + 1).f(34);
      L.push(LV('l1', 'First Roll', 'meadow', 'wheelchair', 55, 'Learn to roll, lean and fire your rocket pack. The gap near the start is a ramp jump: boost into it.',
        a, b, c, K.sp0(a, 0), K.sg(a, 2, 'Up: roll|Left and Right: lean'), K.sg(a, 30, 'Hills are your friends'), K.sg(a, 48, 'Hold Shift for rockets|then hit the ramp'),
        K.rp(a, 56, 4, 1), K.sg(b, 74, 'Nice landing'), K.sg(c, cx + 5, 'Almost there'), K.fin(c, cx + 24)));
    }

    {
      const a = P(-16, 0).f(26).c(14, -2).c(14, 2).f(8).c(12, -1.5).f(34);
      const ax = a.x1(), bx = ax + 9;
      const b = P(bx, a.at(ax) + 1).c(14, 1.5).f(14).c(10, 1).f(60);
      L.push(LV('l2', "Dad's Day Out", 'meadow', 'bike', 55, 'Dad takes the bike out with the kid on the back. Pop the big jump, smash the crates, hop the spikes.',
        a, b, K.sp0(a, 0), K.sg(a, 3, 'Up: gas|Left, Right: tilt|Down: brake'), K.sg(a, ax - 20, 'Big jump ahead|keep your speed'), K.rp(a, ax - 2, 4, 1),
        K.sg(b, bx + 6, 'Crates are fun'), K.cr(b, bx + 28, .4), K.cr(b, bx + 31, .4), K.cr(b, bx + 34, .4), K.rp(b, bx + 52, 3.5, 1), K.sp(b, bx + 58, 3), K.fin(b, bx + 80)));
    }

    {
      const a = P(-16, 0).f(60).c(14, -3).f(10).c(18, 5).f(8).c(18, -6).f(10);
      const ax = a.x1();
      const b = P(ax + 4, a.at(ax) - .4).f(30).c(10, 2).f(24);
      L.push(LV('l3', 'Spike Valley', 'desert', 'segway', 70, 'Balance the segway through the desert. Shift hops over the spike strips. The valley floor is the worst.',
        a, b, K.sp0(a, 0), K.sg(a, 3, 'Up: go|Left, Right: lean|Shift: hop'), K.sp(a, 12, 2.5), K.sp(a, 24, 3), K.sp(a, 35, 3.5), K.sg(a, 66, 'Valley ahead'), K.sp(a, 91, 4),
        K.sp(b, ax + 22, 3), K.fin(b, ax + 62)));
    }

    {
      const a = P(-16, 0).f(100).c(14, -2.5).f(10);
      const bx = a.x1() + 2;
      const b = P(bx, a.at(a.x1()) + .6).f(14).c(30, 4).f(10).c(24, -3).f(28);
      L.push(LV('l4', 'Moped Mayhem', 'night', 'moped', 60, 'A neon night run. Boost pads, glass walls and a row of mines. Jump the mines, drive through the glass.',
        a, b, K.sp0(a, 0), K.sg(a, 3, 'Up: gas|Shift: nitro'), K.bo(a, 12, 6, 20), K.gl(a, 76, .35, 3), K.gl(a, 83, .35, 3.2), K.sg(a, 38, 'Mines ahead|use the ramp'), K.rp(a, 50, 3.6, 1),
        K.mn(a, 56), K.mn(a, 59), K.mn(a, 62), K.bo(b, bx + 5, 5, 16), K.gl(b, bx + 46, .35, 3.4), K.gl(b, bx + 51, .35, 3.4), K.fin(b, bx + 86)));
    }

    {
      const a = P(-16, 0).f(30).c(14, -3).f(12);
      const ax = a.x1();
      const b = P(ax + 5.5, a.at(ax) - 3.5).f(14).c(10, 1).f(8);
      const bx = b.x1();
      const c = P(bx + 5.5, b.at(bx) - 3).f(12).c(14, 3).f(6);
      const cx = c.x1();
      const d = P(cx + 7, c.at(cx) + 2).f(40);
      L.push(LV('l5', 'Pogo Peaks', 'snow', 'pogo', 120, 'Hop up the frozen peaks. Up to bounce, hold Shift for a mega jump, lean to steer. Springs fling you across the gaps.',
        a, b, c, d, K.sp0(a, 0), K.sg(a, 2, 'Up: hop|Shift: mega hop|Left, Right: lean'), K.sr(a, ax - 3.6, 2.6, 13), K.sg(b, ax + 12, 'Wheee'), K.sr(b, bx - 3.6, 2.4, 13),
        K.sr(c, cx - 3.6, 2.4, 11), K.sg(d, cx + 12, 'Almost there'), K.fin(d, cx + 34)));
    }

    {
      const a = P(-16, 0).f(130).c(14, -3).f(30);
      L.push(LV('l6', 'Mine Field', 'desert', 'bike', 75, 'Mines everywhere. Hit each ramp at speed and fly over the rows.',
        a, K.sp0(a, 0), K.sg(a, 3, 'Careful. Those are mines.'), K.sg(a, 18, 'Ramp up|then fly over'), K.rp(a, 24, 4, 1.1), K.mn(a, 30), K.mn(a, 32), K.rp(a, 50, 4, 1.1), K.mn(a, 56), K.mn(a, 58), K.mn(a, 60),
        K.rp(a, 78, 4, 1.1), K.mn(a, 84), K.mn(a, 86), K.rp(a, 100, 4, 1.1), K.mn(a, 106), K.mn(a, 108), K.mn(a, 110), K.fin(a, 165)));
    }

    {
      const a = P(-16, 0).f(172);
      L.push(LV('l7', 'Wrecking Yard', 'factory', 'moped', 70, 'The yard is full of swinging wrecking balls. Watch the rhythm, slip between swings, and use the boost pads.',
        a, K.sp0(a, 0), K.sg(a, 3, 'Time the swings|ease off, brake, go'),
        K.wr(36, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: 0 }), K.wr(62, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: 2 }), K.wr(86, -9.2, { len: 8.1, amp: 1.25, per: 3.6, ph: 4 }),
        K.bo(a, 100, 5, 22), K.wr(114, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: 0 }), K.wr(128, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: PI }), K.rp(a, 144, 4, 1.1), K.fin(a, 156)));
    }

    {
      const a = P(-16, 0).f(40).c(10, -2).f(30).c(10, 2).f(40).c(14, -3).f(58);
      const T = (x, y, o) => [{ t: 'box', x, y, w: 4, h: .7, m: 'hazard' }, K.hp(x - 1.2, y - .55, PI - .5, o || 22)];
      L.push(LV('l8', 'Harpoon Alley', 'night', 'segway', 80, 'Turrets watch the road from above. Step into a beam and they fire. Hop or keep moving.',
        a, K.sp0(a, 0), K.sg(a, 3, 'Lights blink before they shoot'), T(44, -6.5), T(76, -7), T(104, -7), T(104 + 14, -6.2), T(150, -7.5), K.sp(a, 141, 3), K.fin(a, 176)));
    }

    {
      const a = P(-16, 0).f(30);
      const b = P(a.x1() + 8, -1).f(14);
      const c = P(b.x1() + 8, -3.8).f(14);
      const d = P(c.x1() + 8, -6.6).f(40);
      const ax = a.x1(), bx = b.x1(), cx = c.x1();
      L.push(LV('l9', 'Fan Tower', 'factory', 'wheelchair', 90, 'Giant fans blow up from the pits between the platforms. Fall in, float out, and climb the tower.',
        a, b, c, d, K.sp0(a, 0), K.sg(a, 3, 'Fans lift you up|lean to steer'), K.fn(ax + 3, 6.5, -PI / 2 + .3, { w: 12, h: 10, f: 19 }), K.fn(bx + 3, 5, -PI / 2 + .3, { w: 13, h: 10, f: 19 }), K.fn(cx + 3, 3, -PI / 2 + .3, { w: 14, h: 10, f: 21 }),
        K.sg(d, cx + 14, 'Top of the tower'), K.fin(d, cx + 34)));
    }

    {
      const a = P(-16, 0).f(46);
      const b = P(a.x1() + 14, -3).f(34);
      const c = P(b.x1() + 14, -6).f(40);
      const ax = a.x1(), bx = b.x1();
      L.push(LV('l10', 'Spring Fling', 'meadow', 'bike', 60, 'Hit the springs at full speed and fly. Each landing zone sits higher than the last.',
        a, b, c, K.sp0(a, 0), K.sg(a, 3, 'Springs bounce you|keep your speed'), K.sr(a, ax - 4, 3, 13), K.sr(b, bx - 4, 3, 13), K.sg(c, bx + 32, 'You flew!'), K.fin(c, bx + 54)));
    }

    {
      const a = P(-16, 0).f(40).c(12, -1).f(130);
      const w = (x, n) => { const o = []; for (let i = 0; i < n; i++) o.push(K.gl(a, x, .35, 1.6)); for (let i = 1; i < n; i++) o[i].y = o[0].y - i * 1.62; return o; };
      L.push(LV('l11', 'Glass House', 'snow', 'moped', 65, 'Glass walls, then spike pits behind them. Smash through at speed, then hit the ramp to jump the spikes.',
        a, K.sp0(a, 0), K.sg(a, 3, 'Glass breaks if you hit it hard'), K.gl(a, 30, .35, 3), w(46, 3), K.rp(a, 53, 4, 1.1), K.sp(a, 60.5, 3), w(72, 3), K.rp(a, 80, 4, 1.1), K.sp(a, 87.5, 3), K.bo(a, 98, 5, 22), w(112, 3), w(116, 3), K.rp(a, 121, 4, 1.1), K.sp(a, 128.5, 3), K.fin(a, 150)));
    }

    {
      const isl = [P(-16, 0).f(46), P(38, 0).f(14), P(60, 0).f(14), P(82, 0).f(14), P(104, 0).f(66)];
      const lifts = [34, 56, 78, 100].map((x, i) => K.lf(x, 0.2, { w: 12, dx: 2.5, per: 5, ph: i * 1.7 }));
      L.push(LV('l12', 'Lava Run', 'lava', 'wheelchair', 110, 'The floor is lava. Cross the rickety sliding bridges between the islands. Do not stop, and keep your rockets for the slips.',
        ...isl, K.sp0(isl[0], 0), K.sg(isl[0], 3, 'Cross the bridges'), ...lifts, K.fin(isl[4], 160)));
    }

    {
      const a = P(-16, 0).f(30).c(12, -2).f(20).c(12, 2).f(20);
      const ax = a.x1();
      const b = P(ax + 6, 0.6).f(30).c(16, 2).f(24).c(16, -3).f(52);
      const bx = b.x1();
      L.push(LV('l13', 'Grand Finale', 'factory', 'moped', 100, 'Everything at once: boost pads, mines, swinging balls, turrets and a big jump. Show them what you learned.',
        a, b, K.sp0(a, 0), K.bo(a, 10, 5, 22), K.sg(a, 22, 'Ramp, then mines'), K.rp(a, 28, 4, 1.2), K.mn(a, 33.5), K.mn(a, 35.5), K.wr(58, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: 1 }), K.rp(a, ax - 4, 4, 1.2), K.sg(a, ax - 12, 'Big jump'),
        K.bo(b, 100, 5, 22), K.rp(b, 142, 4, 1.2), K.sp(b, 150, 3), K.wr(187, -9.2, { len: 8.1, amp: 1.25, per: 3.8, ph: 0 }), K.rp(b, 199, 4, 1.2), K.mn(b, 204.5), K.mn(b, 206.5), K.fin(b, bx - 4)));
    }

    {
      const a = P(-16, -14).f(10).s(60, 14).c(10, 0).f(70);
      const cx = 74;
      L.push(LV('l14', 'Eject Express', 'meadow', 'wheelchair', 45, 'Down the big hill. Press Space to eject and fly the rest of the way. Pins, balls and crates are waiting.',
        a, K.sp0(a, -9), K.sg(a, -12, 'Space ejects you'), K.rp(a, cx + 14, 4, 1.2), K.ba(cx + 38, -1, .7), K.ba(cx + 40, -1, .7), K.ba(cx + 42, -1, .7), K.fin(a, cx + 62)));
    }
  }
  HW.mount = (root, api) => {
    const PORT = matchMedia('(orientation: portrait) and (max-width: 820px)').matches;
    const CW = PORT ? 540 : 960, CH = PORT ? 960 : 540, PANEL = PORT ? 262 : 0;
    const cv = api.canvas(CW, CH), canvas = cv.canvas, ctx = cv.ctx;
    const VW = CW, VH = CH - PANEL;
    const snd = makeSnd(api);
    const sv = Object.assign({ best: {}, splat: 0, shake: 1, char: null, mine: [], hint: 1, touch: 0 }, api.load() || {});
    if (!sv.best || typeof sv.best !== 'object') sv.best = {};
    if (!Array.isArray(sv.mine)) sv.mine = [];
    const persist = () => api.save(sv);
    let touchSeen = matchMedia('(pointer: coarse)').matches || PORT;
    const MED = ['#cd7f32', '#c0c8d4', '#ffc928'];
    const medalOf = s => s >= 2500 ? 3 : s >= 1900 ? 2 : s >= 1300 ? 1 : 0;
    const totalScore = () => { let t = 0; for (const k in sv.best) t += sv.best[k].s || 0; return t; };
    const publish = () => { api.score(totalScore()); api.label('Total score'); if (totalScore() > 0) api.submit(totalScore()); };
    publish();

    let screen = 'title', tScreen = 0, clock = 0;
    const go = s => { screen = s; tScreen = 0; ui.f = 0; ui.nav = null; touchPtr.clear(); keysHeld.clear(); if (s !== 'play') snd.engine.off(), snd.rocket.off(); };

    const parts = [], texts = [], decals = [];
    let shakeA = 0, run = null, lastText = 0;
    const addP = o => { o.age = 0; if (parts.length > 520) parts.shift(); parts.push(o); };
    const addText = (x, y, s, col) => { texts.push({ x, y, s, col: col || '#fff', age: 0 }); if (texts.length > 8) texts.shift(); };
    const COMIC = { head: ['BONK!', 'OOF!', 'DONK!'], pop: ['POP!', 'SNAP!', 'POING!'], hit: ['CRASH!', 'WHAM!', 'SMASH!'] };
    const fx = {
      puff(x, y, n, col) { for (let i = 0; i < n; i++) addP({ k: 'puff', x: x + rnd(-.15, .15), y: y + rnd(-.15, .15), vx: rnd(-2, 2), vy: rnd(-2.5, .3), r: rnd(.1, .26), life: rnd(.35, .75), col: col || '#fff' }); },
      pop(x, y) {
        for (let i = 0; i < 7; i++) addP({ k: 'star', x, y, vx: rnd(-4, 4), vy: rnd(-5, -.5), r: rnd(.1, .2), life: rnd(.5, .9), rot: rnd(0, 6), col: pick(['#ffd23f', '#fff', '#ff6b9d', '#6fe3ff']) });
        const n = performance.now(); if (n - lastText > 350) { lastText = n; addText(x, y - .5, pick(COMIC.pop), '#ffd23f'); }
        snd.sfx('pop', 1, rnd(.9, 1.2)); fx.splat(x, y, 1);
      },
      splat(x, y, f) {
        if (!sv.splat) return;
        for (let i = 0; i < 9; i++) addP({ k: 'drop', x, y, vx: rnd(-4, 4), vy: rnd(-5, -.5), r: rnd(.05, .11), life: 1.6, col: '#d92b3a' });
        if (f) decals.push({ x, y, r: rnd(.18, .3), a: 0, t: 0, air: 1 });
      },
      boom(x, y, R) {
        for (let i = 0; i < 26; i++) { const a = rnd(0, TAU), s = rnd(1, R * 1.6); addP({ k: 'fire', x, y, vx: cos(a) * s, vy: sin(a) * s - 1, r: rnd(.25, .6), life: rnd(.35, .8), col: pick(['#ffd23f', '#ff8a2a', '#ff4a1c', '#fff2a0']) }); }
        for (let i = 0; i < 16; i++) { const a = rnd(0, TAU), s = rnd(1, R * .8); addP({ k: 'puff', x, y, vx: cos(a) * s, vy: sin(a) * s - 2, r: rnd(.3, .7), life: rnd(.8, 1.5), col: '#6b6f7c' }); }
        for (let i = 0; i < 22; i++) { const a = rnd(0, TAU), s = rnd(4, R * 3); addP({ k: 'spark', x, y, vx: cos(a) * s, vy: sin(a) * s - 2, r: .05, life: rnd(.4, 1), col: '#ffe08a' }); }
        addP({ k: 'ring', x, y, r: .3, life: .5, R, col: '#fff' });
        shakeA = Math.max(shakeA, 1.2); snd.sfx('boom', 1);
      },
      snd(n, v, p) { snd.sfx(n, v, p); },
      shake(a) { shakeA = Math.max(shakeA, a); },
      glass(it) {
        const c = cos(it.a || 0), s = sin(it.a || 0);
        for (let i = 0; i < 22; i++) {
          const lx = rnd(-it.w / 2, it.w / 2), ly = rnd(-it.h / 2, it.h / 2);
          addP({ k: 'shard', x: it.x + c * lx - s * ly, y: it.y + s * lx + c * ly, vx: rnd(-4, 5), vy: rnd(-5, 1), r: rnd(.08, .2), rot: rnd(0, 6), vr: rnd(-8, 8), life: rnd(.8, 1.4), col: pick(['rgba(190,235,255,.85)', 'rgba(255,255,255,.8)', 'rgba(140,205,245,.8)']) });
        }
        snd.sfx('glass', 1); shakeA = Math.max(shakeA, .2);
      }
    };

    const stepParticles = dt => {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        if (p.k === 'ring') { p.r += dt * p.R * 5; continue; }
        const g = p.k === 'spark' || p.k === 'shard' || p.k === 'drop' || p.k === 'star' ? 14 : p.k === 'fire' ? -2 : -.6;
        p.vy += g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.k === 'puff' || p.k === 'fire') { p.vx *= 1 - dt * 2; p.vy *= 1 - dt * 1.2; }
        if (p.vr) p.rot += p.vr * dt;
        if (p.k === 'drop' && run) { const gy = run.lv.groundY(p.x); if (gy !== null && p.y >= gy - .02) { decals.push({ x: p.x, y: gy, r: p.r * 2.4, a: 0, t: 0 }); parts.splice(i, 1); } }
      }
      for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.age += dt; t.y -= dt * 1.2; if (t.age > 1.1) texts.splice(i, 1); }
      for (let i = decals.length - 1; i >= 0; i--) { const d = decals[i]; d.t += dt; if (d.t > 14) decals.splice(i, 1); }
      if (decals.length > 160) decals.splice(0, decals.length - 160);
      shakeA *= Math.pow(.02, dt);
    };

    const drawParticles = () => {
      for (const p of parts) {
        const f = p.age / p.life;
        if (p.k === 'puff') { ctx.globalAlpha = (1 - f) * .75; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + f * 1.4), 0, TAU); ctx.fillStyle = p.col; ctx.fill(); }
        else if (p.k === 'fire') { ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - f * .5), 0, TAU); ctx.fillStyle = p.col; ctx.fill(); }
        else if (p.k === 'spark') { ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fillStyle = p.col; ctx.fill(); }
        else if (p.k === 'drop') { ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fillStyle = p.col; ctx.fill(); }
        else if (p.k === 'ring') { ctx.globalAlpha = (1 - f) * .6; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.lineWidth = .18 * (1 - f); ctx.strokeStyle = p.col; ctx.stroke(); }
        else if (p.k === 'star') {
          ctx.globalAlpha = 1 - f * f; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.age * 6); ctx.beginPath();
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? p.r * .4 : p.r * 1.4; ctx.lineTo(cos(a) * r, sin(a) * r); }
          ctx.closePath(); ctx.fillStyle = p.col; ctx.fill(); ctx.lineWidth = .03; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
        } else if (p.k === 'shard') {
          ctx.globalAlpha = 1 - f * f; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.beginPath(); ctx.moveTo(-p.r, p.r * .6); ctx.lineTo(p.r * 1.1, 0); ctx.lineTo(-p.r * .2, -p.r); ctx.closePath(); ctx.fillStyle = p.col; ctx.fill(); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
      for (const d of decals) {
        const al = d.t > 10 ? 1 - (d.t - 10) / 4 : 1; if (d.air) continue;
        ctx.globalAlpha = al * .85; ctx.beginPath(); ctx.ellipse(d.x, d.y - .02, d.r * 1.6, d.r * .5, 0, 0, TAU); ctx.fillStyle = '#c4202f'; ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const t of texts) {
        const f = t.age / 1.1, sc = f < .15 ? .5 + f / .15 * .8 : 1.3 - Math.min(.3, (f - .15) * .6);
        ctx.globalAlpha = f > .7 ? 1 - (f - .7) / .3 : 1; ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(-.12); ctx.scale(sc, sc); wtext(ctx, t.s, 0, 0, .55, t.col, 'center', INK); ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const TX = (s, x, y, size, col = '#fff', al = 'center', w = 800, ink) => {
      ctx.font = w + ' ' + size + 'px ' + FONT; ctx.textAlign = al; ctx.textBaseline = 'middle';
      if (ink) { ctx.lineWidth = size * .22; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
      ctx.fillStyle = col; ctx.fillText(s, x, y);
    };
    const WRAP = (s, x, y, mw, lh, size, col, al = 'center', w = 700) => {
      ctx.font = w + ' ' + size + 'px ' + FONT; const words = String(s).split(' '); let line = '', yy = y;
      for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > mw && line) { TX(line, x, yy, size, col, al, w); line = wd; yy += lh; } else line = t; }
      if (line) TX(line, x, yy, size, col, al, w);
      return yy;
    };
    const panel = (x, y, w, h, r = 18, fill = 'rgba(14,16,40,.82)', stroke = 'rgba(255,255,255,.14)') => { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke(); };

    const ui = { b: [], f: 0, mx: -99, my: -99, nav: null };
    const button = (x, y, w, h, label, fn, o = {}) => {
      const id = ui.b.length; ui.b.push({ x, y, w, h, fn, id, dis: o.dis });
      const foc = ui.f === id && !o.dis, hov = ui.mx >= x && ui.mx <= x + w && ui.my >= y && ui.my <= y + h;
      const base = o.col || '#2c3170', lit = o.lit || '#ffd23f';
      ctx.save();
      if (foc || hov) { ctx.shadowColor = o.glow || 'rgba(255,210,63,.55)'; ctx.shadowBlur = 14; }
      rr(ctx, x, y, w, h, o.r ?? 14);
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, shade(base, 1.28)); g.addColorStop(1, shade(base, .82));
      ctx.fillStyle = o.dis ? '#3a3d52' : g; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = foc ? 4 : 2; ctx.strokeStyle = foc ? lit : 'rgba(255,255,255,.22)'; ctx.stroke();
      ctx.restore();
      if (label) TX(label, x + w / 2, y + h / 2 + 1, o.size || Math.min(22, h * .42), o.dis ? '#8a8ea8' : (o.tc || '#fff'), 'center', 800);
      return foc;
    };
    const pressBtn = b => { if (!b || b.dis) return; snd.sfx('click'); b.fn(); };
    const navMove = (dx, dy) => {
      const bs = ui.b; if (!bs.length) return;
      const cur = bs[clamp(ui.f, 0, bs.length - 1)]; let best = -1, bs2 = 1e9;
      const cx = cur.x + cur.w / 2, cy = cur.y + cur.h / 2;
      for (const b of bs) {
        if (b === cur || b.dis) continue;
        const x = b.x + b.w / 2 - cx, y = b.y + b.h / 2 - cy, al = x * dx + y * dy, pe = Math.abs(x * dy - y * dx);
        if (al < 4) continue;
        const sc = al + pe * 2.2; if (sc < bs2) { bs2 = sc; best = b.id; }
      }
      if (best >= 0) { ui.f = best; snd.sfx('tick'); }
    };

    const keysHeld = new Set(), touchPtr = new Map();
    const tb = {};
    const layoutTouch = () => {
      const L = {}, s = 1;
      if (PORT) {
        const y0 = VH + 12, bw = 124, bh = 108;
        L.l = { x: 16, y: y0 + 96, w: bw, h: bh + 20 }; L.r = { x: 16 + bw + 12, y: y0 + 96, w: bw, h: bh + 20 };
        L.u = { x: CW - 16 - bw * 2 - 12, y: y0 + 96, w: bw, h: bh + 20 }; L.d = { x: CW - 16 - bw, y: y0 + 96, w: bw, h: bh + 20 };
        L.boost = { x: CW - 16 - bw * 2 - 12, y: y0, w: bw * 2 + 12, h: 84 };
        L.eject = { x: 16, y: y0, w: bw * 2 + 12, h: 84 };
      } else {
        const bw = 88, bh = 84, y0 = CH - 14 - bh;
        L.l = { x: 14, y: y0, w: bw, h: bh }; L.r = { x: 14 + bw + 10, y: y0, w: bw, h: bh };
        L.d = { x: CW - 14 - bw * 2 - 10, y: y0, w: bw, h: bh }; L.u = { x: CW - 14 - bw, y: y0, w: bw, h: bh };
        L.boost = { x: CW - 14 - bw, y: y0 - 10 - 64, w: bw, h: 64 }; L.eject = { x: CW - 14 - bw * 2 - 10, y: y0 - 10 - 64, w: bw, h: 64 };
      }
      L.restart = { x: CW - 14 - 44 - 8 - 44, y: 12, w: 44, h: 44 }; L.menu = { x: CW - 14 - 44, y: 12, w: 44, h: 44 };
      Object.assign(tb, L);
    };
    layoutTouch();
    const hitTB = (x, y) => { for (const k in tb) { const r = tb[k]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return k; } return null; };
    const KEYMAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ShiftLeft: 'boost', ShiftRight: 'boost', KeyX: 'boost' };
    const readInput = () => {
      const i = { l: 0, r: 0, u: 0, d: 0, boost: 0 };
      for (const k of keysHeld) { const m = KEYMAP[k]; if (m) i[m] = 1; }
      for (const k of touchPtr.values()) if (i[k] === 0) i[k] = 1;
      return i;
    };
    const hashId = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h + 1; };
    const BOOST_LABEL = { wheelchair: 'ROCKET', bike: 'SPRINT', segway: 'HOP', moped: 'TURBO', pogo: 'MEGA' };
    const UP_LABEL = { wheelchair: 'GAS', bike: 'PEDAL', segway: 'FAST', moped: 'GAS', pogo: 'BOING' };
    const DN_LABEL = { wheelchair: 'BRAKE', bike: 'BRAKE', segway: 'STOP', moped: 'BRAKE', pogo: 'SQUAT' };

    const limbsOf = v => { let a = 0, t = 0; for (const r of v.riders) { a += r.intact(); t += r.total; } return [a, t]; };

    const onBreak = j => {
      if (!run) return;
      const v = run.v, b = j.b, x = b.x, y = b.y;
      if (j.kind === 'limb') { run.lost++; fx.pop(x, y); }
      else if (j.kind2 === 'attach') {
        snd.sfx('pop', .5, 1.5);
        if (j.ud === 'seat') {
          const rg = v.riders.find(q => q.seat === j);
          if (rg === v.dad) { if (v.eject()) { snd.sfx('eject'); fx.puff(x, y, 6, '#fff'); } }
          else if (rg) { rg.eject(); snd.sfx('eject', .6); }
        }
      }
    };

    const onContact = (c, imp) => {
      const r = run; if (!r) return;
      r.lv.contact(c, imp);
      if (imp < 3.2) return;
      const a = c.a, b = c.b, rg = a.rag ? a : b.rag ? b : null, vp = (a.veh && !a.rag) ? a : (b.veh && !b.rag) ? b : null;
      const p = c.pts[0], vol = clamp(imp / 100, .08, 1), now = performance.now();
      if (rg) {
        if (rg.pn === 'head' && imp > 12) { snd.sfx('bonk', vol, rnd(.9, 1.2)); if (imp > 30 && now - lastText > 450) { lastText = now; addText(p.x, p.y - .5, pick(COMIC.head), '#fff'); fx.puff(p.x, p.y, 4, '#fff'); } }
        else snd.sfx('thud', vol * .8, rnd(.9, 1.2));
        if (imp > 40) shakeA = Math.max(shakeA, Math.min(.5, imp / 400));
      } else if (vp) {
        if (vp.kind === 'frame') { snd.sfx(imp > 25 ? 'metal' : 'thud', vol, rnd(.8, 1.1)); if (imp > 70) { shakeA = Math.max(shakeA, Math.min(.7, imp / 300)); if (now - lastText > 600) { lastText = now; addText(p.x, p.y - .6, pick(COMIC.hit), '#ffd23f'); fx.puff(p.x, p.y, 5, '#ddd'); } } }
        else snd.sfx('thud', vol * .6, rnd(.8, 1.1));
      } else if (a.kind === 'harp' || b.kind === 'harp') snd.sfx('metal', .5);
      else snd.sfx('crate', vol * .7);
    };

    const startRun = (L, kind, o = {}) => {
      const W = new PH.World({ g: 10 });
      parts.length = 0; texts.length = 0; decals.length = 0; shakeA = 0;
      snd.engine.off(); snd.rocket.off();
      const lv = HW.buildLevel(W, L, fx, hashId(String(L.id || L.name || 'x')));
      const sp = lv.spawn;
      const v = HW.mkVeh(W, kind, sp.x, sp.y - HW.LIFT[kind] - .03, -1, {});
      lv.tagPlayer(v); lv.setPlayer(v);
      const base = PORT ? VW / 11 : VH / 9.4;
      const m = v.main;
      run = { L, lv, W, v, kind, t: 0, started: false, acc: 0, state: 'play', st: 0, clock: 0, lost: 0, base, test: !!o.test, hint: 7,
        cam: { x: m.x + 2, y: m.y - .8, ppm: base, x0: 0, x1: 0, y0: 0, y1: 0, w: VW, h: VH }, res: null, air: 0, ph: 0 };
      W.hold = dt => { v.hold(dt); lv.hold(dt); };
      W.cb = onContact; W.onBreak = onBreak;
      for (let i = 0; i < 90; i++) { v.upd({ l: 0, r: 0, u: 0, d: 0, boost: 0 }, 1 / 60, null); W.step(1 / 120); W.step(1 / 120); lv.update(1 / 60); }
      lv.t = 0; lv.won = false;
      if (kind === 'bike' || kind === 'moped' || kind === 'segway') snd.engine.on(kind);
      updCam(run, 1, true);
      go('play');
    };

    const updCam = (r, dt, snap) => {
      const m = r.v.main, cam = r.cam, f = snap ? 1 : 1 - Math.exp(-dt * 4.2), fz = snap ? 1 : 1 - Math.exp(-dt * 1.4);
      const sp = hyp(m.vx, m.vy), tz = r.base * (1 - clamp((sp - 8) / 55, 0, .22));
      cam.ppm += (tz - cam.ppm) * fz;
      const lax = clamp(m.vx * .26, -3, 6.5) * (PORT ? .55 : 1), lay = clamp(m.vy * .07, -1.5, 2);
      const tx = m.x + lax + (PORT ? 0 : 1.6), ty = m.y - .6 + lay;
      cam.x += (tx - cam.x) * f; cam.y += (ty - cam.y) * f * .85;
      const hw = VW / 2 / cam.ppm + 1.5, hh = VH / 2 / cam.ppm + 1.5;
      cam.x0 = cam.x - hw; cam.x1 = cam.x + hw; cam.y0 = cam.y - hh; cam.y1 = cam.y + hh;
    };

    const calcScore = r => {
      const par = r.L.par || 60, tb = Math.round(1500 * clamp(2 - r.t / par, 0, 1));
      const [ia, it] = limbsOf(r.v), lb = Math.round(400 * ia / Math.max(1, it));
      return { time: r.t, tb, lb, s: 1000 + tb + lb, limbs: ia, total: it };
    };

    const finishRun = r => {
      r.state = 'won'; r.st = 0; snd.sfx('win'); snd.sfx('ding');
      const f = r.lv.finish; for (let i = 0; i < 30; i++) addP({ k: 'star', x: f.x + rnd(-1, 1), y: f.y + rnd(-1, 1), vx: rnd(-6, 6), vy: rnd(-9, -1), r: rnd(.1, .25), life: rnd(.8, 1.6), rot: rnd(0, 6), col: pick(['#ffd23f', '#fff', '#ff6b9d', '#6fe3ff', '#7cf29a']) });
      const res = calcScore(r); res.med = medalOf(res.s); res.newBest = false;
      const id = r.L.id;
      if (!r.test && !r.L.mine) {
        const old = sv.best[id];
        if (!old || res.s > old.s) { sv.best[id] = { s: res.s, t: res.time, k: r.kind, m: res.med }; res.newBest = true; }
        else res.prev = old;
        persist(); publish();
      }
      r.res = res;
    };

    let hint = null;
    const stepRun = dt => {
      const r = run, v = r.v, lv = r.lv, W = r.W;
      r.clock += dt;
      const inp = r.state === 'play' || (r.state === 'won' && r.st < 1.1) ? readInput() : { l: 0, r: 0, u: 0, d: 0, boost: 0 };
      if (!r.started && (inp.l || inp.r || inp.u || inp.d || inp.boost)) { r.started = true; }
      r.acc += dt; let n = 0;
      while (r.acc >= 1 / 60 && n < 4) {
        r.acc -= 1 / 60; n++;
        v.upd(inp, 1 / 60, snd);
        W.step(1 / 120); W.step(1 / 120);
        lv.update(1 / 60);
        if (r.started && r.state === 'play') r.t += 1 / 60;
      }
      if (n === 4) r.acc = 0;
      stepParticles(dt);
      r.st += dt;
      if (r.hint > 0 && r.started) r.hint -= dt;
      const m = v.main;
      if (r.state === 'play') {
        if (lv.won) finishRun(r);
        else if (m.y > lv.fall || v.frame.y > lv.fall + 4) { r.state = 'fell'; r.st = 0; snd.sfx('deep'); }
      }
      if (!v.grounded && !v.ejected) r.air += dt; else r.air = 0;
      if (v.kind === 'wheelchair') snd.rocket.set(v.thrust && !v.ejected ? 1 : 0);
      if (v.kind === 'pogo') { if (v.ph === 1 && r.ph !== 1 && !v.ejected) snd.sfx('boing', v.mega ? .9 : .5, v.mega ? .8 : 1.1); r.ph = v.ph; }
      if (v.kind === 'bike' || v.kind === 'moped' || v.kind === 'segway') {
        if (v.ejected) snd.engine.off();
        else {
          const sp = Math.abs(v.rear.w) * v.rear.r, bk = v.kind;
          snd.engine.set(bk === 'segway' ? 120 + sp * 18 : bk === 'bike' ? 50 + sp * 6 : 62 + sp * 7.5, bk === 'segway' ? .025 : (inp.u ? .08 : .035));
        }
      }
      if (r.state === 'won' && r.st > 1.1 && !run.shown) { run.shown = true; go('result'); }
      updCam(r, dt, false);
    };

    const doEject = () => {
      const r = run; if (!r || r.state !== 'play') return;
      if (!r.started) r.started = true;
      const v = r.v;
      if (v.eject()) {
        snd.sfx('eject'); fx.puff(v.main.x, v.main.y, 6, '#fff');
        v.main.vy -= 1.2;
      }
    };

    const drawTouch = () => {
      const r = run, k = r.kind, pressed = {};
      for (const kk of keysHeld) { const m = KEYMAP[kk]; if (m) pressed[m] = 1; }
      for (const t of touchPtr.values()) pressed[t] = 1;
      const bt = (id, label, kind, col) => {
        const b = tb[id], on = pressed[id];
        ctx.save(); ctx.globalAlpha = on ? .92 : .62;
        rr(ctx, b.x, b.y, b.w, b.h, 18); const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h); g.addColorStop(0, shade(col, on ? 1.4 : 1.15)); g.addColorStop(1, shade(col, on ? .9 : .7)); ctx.fillStyle = g; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.4)'; ctx.stroke(); ctx.globalAlpha = 1;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        if (kind === 'ar') { ctx.beginPath(); ctx.moveTo(cx + (label === 'l' ? -16 : 16), cy); ctx.lineTo(cx + (label === 'l' ? 12 : -12), cy - 20); ctx.lineTo(cx + (label === 'l' ? 12 : -12), cy + 20); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); }
        else TX(label, cx, cy, b.h > 70 && b.w > 130 ? 24 : 17, '#fff', 'center', 800);
        ctx.restore();
      };
      if (PORT) { ctx.fillStyle = 'rgba(8,10,28,.92)'; ctx.fillRect(0, VH, CW, PANEL); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(0, VH, CW, 2); }
      bt('l', 'l', 'ar', '#3b5bdb'); bt('r', 'r', 'ar', '#3b5bdb');
      bt('u', UP_LABEL[k], 't', '#2f9e44'); bt('d', DN_LABEL[k], 't', '#e03131');
      bt('boost', BOOST_LABEL[k], 't', '#f08c00'); bt('eject', 'EJECT', 't', '#7048e8');
    };

    const drawIconBtn = (id, kind, fn) => {
      const b = tb[id], act = ui.mx >= b.x && ui.mx <= b.x + b.w && ui.my >= b.y && ui.my <= b.y + b.h;
      ctx.save(); rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.fillStyle = act ? 'rgba(255,210,63,.85)' : 'rgba(10,12,32,.55)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.strokeStyle = act ? '#1d1b26' : '#fff'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 3; ctx.lineCap = 'round';
      if (kind === 'restart') { ctx.beginPath(); ctx.arc(cx, cy, 9, -2.6, 1.9); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - 12, cy - 8); ctx.lineTo(cx - 7, cy - 14); ctx.lineTo(cx - 4, cy - 6); ctx.closePath(); ctx.fill(); }
      else { for (const dy of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(cx - 10, cy + dy); ctx.lineTo(cx + 10, cy + dy); ctx.stroke(); } }
      ctx.restore();
    };

    const drawHUD = () => {
      const r = run, v = r.v, k = r.kind;
      const pw = PORT ? 250 : 292;
      rr(ctx, 12, 12, pw, 78, 14); ctx.fillStyle = 'rgba(10,12,32,.62)'; ctx.fill();
      TX(r.L.name.toUpperCase(), 24, 29, 14, '#ffd23f', 'left', 800);
      TX(fmtT(r.t), 24, 56, 30, '#fff', 'left', 800);
      const [ia, it] = limbsOf(v);
      for (let i = 0; i < it; i++) { ctx.beginPath(); ctx.arc(26 + (i % 18) * 12.5, 79, 4.2, 0, TAU); ctx.fillStyle = i < ia ? '#7cf29a' : 'rgba(255,255,255,.2)'; ctx.fill(); }
      const bar = (lab, f, col, y) => { TX(lab, CW / 2 - 60, y, 11, '#fff', 'right', 800); rr(ctx, CW / 2 - 52, y - 6, 104, 12, 6); ctx.fillStyle = 'rgba(10,12,32,.6)'; ctx.fill(); if (f > .01) { rr(ctx, CW / 2 - 52, y - 6, 104 * f, 12, 6); ctx.fillStyle = col; ctx.fill(); } };
      if (k === 'wheelchair') bar('ROCKET', v.fuel, v.fuel < .2 ? '#e03131' : '#f08c00', PORT ? 112 : 22);
      else if (k === 'bike' || k === 'moped') bar(k === 'bike' ? 'SPRINT' : 'TURBO', v.stamina, '#f08c00', PORT ? 112 : 22);
      const f = r.lv.finish, m = v.main;
      if (f) {
        const d0 = hyp(f.x - r.lv.spawn.x, f.y - r.lv.spawn.y) || 1, d = hyp(f.x - m.x, f.y - m.y), p = clamp(1 - d / d0, 0, 1), bw = PORT ? 250 : 292, by = PORT ? 100 : 100;
        rr(ctx, 12, by, bw, 8, 4); ctx.fillStyle = 'rgba(10,12,32,.55)'; ctx.fill();
        if (p > .005) { rr(ctx, 12, by, Math.max(8, bw * p), 8, 4); ctx.fillStyle = '#ffd23f'; ctx.fill(); }
        ctx.beginPath(); ctx.arc(12 + bw, by + 4, 7, 0, TAU); ctx.fillStyle = '#ffc928'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
      }
      drawIconBtn('restart', 'restart'); drawIconBtn('menu', 'menu');
      if (r.hint > 0 && r.state === 'play') {
        ctx.globalAlpha = clamp(r.hint, 0, 1); panel(CW / 2 - (PORT ? 250 : 340), VH - (PORT ? 86 : 150), PORT ? 500 : 680, PORT ? 70 : 54, 14);
        const ln = HW.CHARS[k].keys;
        if (PORT) { TX(HW.CHARS[k].name, CW / 2, VH - 64, 17, '#ffd23f'); WRAP(touchSeen ? 'Use the on-screen buttons below' : ln, CW / 2, VH - 40, 480, 16, 13, '#fff'); }
        else { TX(HW.CHARS[k].name + '  -  Space: eject   R: restart   M: menu', CW / 2, VH - 128, 14, '#ffd23f'); TX(ln, CW / 2, VH - 104, 15, '#fff'); }
        ctx.globalAlpha = 1;
      }
      if (!r.started && r.state === 'play') TX('Press any control to start the clock', CW / 2, VH * .3, 20, '#fff', 'center', 800, 'rgba(10,12,32,.7)');
      if (r.state === 'fell') {
        panel(CW / 2 - 190, VH / 2 - 62, 380, 124, 18);
        TX('You fell off the world!', CW / 2, VH / 2 - 26, 24, '#fff'); TX(PORT ? 'Tap restart' : 'Press R to try again', CW / 2, VH / 2 + 6, 16, '#cfd3ff');
        button(CW / 2 - 70, VH / 2 + 24, 140, 30, 'Retry', () => restartRun(), { size: 16, r: 10 });
      }
    };

    const drawRun = () => {
      const r = run, cam = r.cam, lv = r.lv, v = r.v;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
      HW.drawBack(ctx, lv.th, lv.back, { w: VW, h: VH, ppm: cam.ppm, x: cam.x, y: cam.y }, r.clock);
      const sh = shakeA * sv.shake * .22, sx = (Math.random() - .5) * sh, sy = (Math.random() - .5) * sh;
      ctx.translate(VW / 2, VH / 2); ctx.scale(cam.ppm, cam.ppm); ctx.translate(-cam.x + sx, -cam.y + sy);
      lv.drawWorld(ctx, cam);
      HW.drawVeh(ctx, v, { t: r.clock });
      drawParticles();
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, CW, CH); ctx.clip();
      drawHUD();
      if (touchSeen || PORT) drawTouch();
      ctx.restore();
    };

    const restartRun = () => { if (run) startRun(run.L, run.kind, { test: run.test }); };
    let br = null, prev = null, tp = null, retTo = 'levels', confirmReset = 0, mineMsg = '', primary = null;
    const mkPrev = kind => {
      const W = new PH.World({ g: 10 });
      const gr = new PH.Body({ static: true, x: 0, y: 4 }); gr.add(PH.box(80, 1, 0, 0, 0, { f: .9 })); gr.finalize(); W.add(gr);
      const v = HW.mkVeh(W, kind, 0, 3 - HW.LIFT[kind] - .03, -1, {});
      W.hold = dt => v.hold(dt);
      for (const r of v.riders) r.face = 0;
      return { W, v, kind, t: 0, acc: 0, cx: 0 };
    };
    const stepPrev = (p, dt) => {
      p.t += dt; p.acc += dt; let n = 0;
      const ph = p.t % 5, k = p.kind;
      const inp = { l: 0, r: k === 'segway' && ph > 3 ? 1 : 0, u: k === 'pogo' ? 1 : (ph < 1.3 && k !== 'segway' ? 1 : 0), d: 0, boost: 0 };
      while (p.acc >= 1 / 60 && n < 3) { p.acc -= 1 / 60; n++; p.v.upd(inp, 1 / 60, null); p.W.step(1 / 120); p.W.step(1 / 120); }
      if (n === 3) p.acc = 0;
      p.cx += (p.v.main.x - p.cx) * Math.min(1, dt * 3);
    };
    const drawPrev = (p, x, y, w, h, themeId, ppm, rot) => {
      const th = HW.THEMES[themeId] || HW.THEMES.meadow;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      if (!p.back || p.theme !== themeId) { p.back = HW.mkBack(th, 5); p.theme = themeId; }
      HW.drawBack(ctx, th, p.back, { w, h, ppm, x: p.cx, y: 0 }, clock);
      ctx.translate(w * (PORT ? .5 : .17), h * (PORT ? .7 : .78)); ctx.scale(ppm, ppm); ctx.translate(-p.cx, -3);
      ctx.fillStyle = th.dirt; ctx.fillRect(p.cx - 40, 3, 80, 12);
      ctx.fillStyle = th.top2; ctx.fillRect(p.cx - 40, 3, 80, .3); ctx.fillStyle = th.top; ctx.fillRect(p.cx - 40, 2.97, 80, .22);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let i = Math.floor(p.cx - 20); i < p.cx + 20; i += 4) ctx.fillRect(i, 3.6, 1.2, .1);
      HW.drawVeh(ctx, p.v, { t: clock });
      ctx.restore();
    };

    const hazList = L => {
      const c = {}; for (const it of L.items) c[it.t] = (c[it.t] || 0) + 1;
      const N = { spikes: 'Spikes', mine: 'Mines', harpoon: 'Harpoon guns', wreck: 'Wrecking balls', fan: 'Fans', boost: 'Boost pads', glass: 'Glass', spring: 'Springs', lift: 'Lifts', crate: 'Crates', ball: 'Balls' };
      const o = []; for (const k in N) if (c[k]) o.push(N[k] + (c[k] > 1 ? ' x' + c[k] : ''));
      return o;
    };

    const header = (t, sub, back) => {
      TX(t, CW / 2, PORT ? 50 : 40, PORT ? 34 : 36, '#fff', 'center', 800, 'rgba(10,12,32,.7)');
      if (sub) TX(sub, CW / 2, PORT ? 84 : 72, 15, '#cfd3ff', 'center', 700);
      if (back) button(14, 12, 96, 40, 'Back', back, { size: 17, r: 12 });
    };
    const scrBack = themeId => {
      if (!tp || tp.v.main.x > 60) tp = mkPrev(pick(HW.CHAR_IDS));
      stepPrev(tp, dtF);
      drawPrev(tp, 0, 0, CW, CH, themeId || 'meadow', PORT ? 44 : 58);
      ctx.fillStyle = 'rgba(8,10,30,.55)'; ctx.fillRect(0, 0, CW, CH);
    };
    let dtF = 1 / 60;

    const drawTitle = () => {
      scrBack('meadow');
      const sz = PORT ? 70 : 92, y = PORT ? 150 : 96, wob = Math.sin(clock * 2) * 3;
      const cols = ['#ff5a5a', '#ffd23f', '#3fd47a', '#4aa3ff', '#ff8a2a', '#c77dff'];
      const row = (s, yy, off) => {
        ctx.font = '900 ' + sz + 'px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let tw = 0; for (const ch of s) tw += ctx.measureText(ch).width + 2;
        let x = CW / 2 - tw / 2;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i], w = ctx.measureText(ch).width + 2, dy = Math.sin(clock * 3 + i * .8 + off) * 5;
          ctx.save(); ctx.translate(x + w / 2, yy + dy); ctx.rotate(Math.sin(clock * 2 + i + off) * .05);
          ctx.font = '900 ' + sz + 'px ' + FONT; ctx.textAlign = 'center'; ctx.lineWidth = sz * .17; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0);
          ctx.fillStyle = cols[(i + off) % cols.length]; ctx.fillText(ch, 0, 0);
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -sz * .5, w, sz * .42); ctx.clip(); ctx.fillText(ch, 0, 0); ctx.restore();
          ctx.restore(); x += w;
        }
      };
      row('HAPPY', y + wob * .3, 0); row('WHEELS', y + sz * .92 - wob * .3, 2);
      TX('A ragdoll ride through hand-made levels', CW / 2, y + sz * 1.62, PORT ? 15 : 18, '#e3e6ff', 'center', 700);
      const bw = PORT ? 330 : 290, bh = 48, bx = PORT ? CW / 2 - bw / 2 : CW * .66 - bw / 2, by0 = PORT ? 330 : 272, g = 10;
      button(bx, by0, bw, bh + 8, 'PLAY', () => go('levels'), { col: '#2f9e44', size: 28 });
      button(bx, by0 + bh + 8 + g, bw, bh, 'LEVEL EDITOR', () => { openEditor(-1); }, { col: '#3b5bdb', size: 20 });
      button(bx, by0 + 2 * (bh + g) + 8, bw, bh, 'MY LEVELS', () => go('mine'), { col: '#7048e8', size: 20 });
      button(bx, by0 + 3 * (bh + g) + 8, bw, bh, 'OPTIONS', () => go('options'), { col: '#495057', size: 20 });
      const tot = totalScore(), meds = HW.LEVELS.filter(l => sv.best[l.id] && sv.best[l.id].m === 3).length;
      TX('Total score  ' + tot.toLocaleString(), PORT ? CW / 2 : CW * .17, CH - (PORT ? 70 : 52), 18, '#ffd23f', 'center', 800);
      TX(meds + ' / ' + HW.LEVELS.length + ' gold medals', PORT ? CW / 2 : CW * .17, CH - (PORT ? 44 : 28), 14, '#cfd3ff', 'center', 700);
    };

    const star = (x, y, r, col, ink) => {
      ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr0 = i % 2 ? r * .45 : r; ctx.lineTo(x + cos(a) * rr0, y + sin(a) * rr0); } ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = ink || 'rgba(0,0,0,.45)'; ctx.stroke();
    };

    const drawLevels = () => {
      scrBack('meadow');
      header('Choose a level', 'Total score ' + totalScore().toLocaleString(), () => go('title'));
      const n = HW.LEVELS.length, cols = PORT ? 2 : 5, gap = 12, top = PORT ? 118 : 92, bot = 22;
      const cw = (CW - 36 - gap * (cols - 1)) / cols, rows = Math.ceil(n / cols), ch = Math.min(PORT ? 108 : 124, (CH - top - bot - gap * (rows - 1)) / rows);
      HW.LEVELS.forEach((L, i) => {
        const x = 18 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), th = HW.THEMES[L.theme], b = sv.best[L.id];
        button(x, y, cw, ch, null, () => openBrief(L), { col: '#262a5c' });
        ctx.save(); rr(ctx, x + 4, y + 4, cw - 8, ch * .44, 11); ctx.clip();
        const g = ctx.createLinearGradient(0, y, 0, y + ch * .5); g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]); ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch);
        ctx.fillStyle = th.hills[1]; ctx.beginPath(); ctx.moveTo(x, y + ch * .44); for (let q = 0; q <= 8; q++) ctx.lineTo(x + cw * q / 8, y + ch * (.3 + .06 * Math.sin(q * 1.3 + i))); ctx.lineTo(x + cw, y + ch * .5); ctx.lineTo(x, y + ch * .5); ctx.fill();
        ctx.fillStyle = th.top; ctx.fillRect(x, y + ch * .4, cw, ch * .1);
        ctx.restore();
        ctx.beginPath(); ctx.arc(x + 20, y + 20, 14, 0, TAU); ctx.fillStyle = HW.CHARS[L.char].col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke(); TX(String(i + 1), x + 20, y + 21, 15, '#1d1b26', 'center', 900);
        TX(L.name, x + cw / 2, y + ch * .6, Math.min(16, cw / (L.name.length * .5 + 1) * 1.1), '#fff', 'center', 800);
        TX(HW.CHARS[L.char].name, x + cw / 2, y + ch * .76, 11.5, '#aeb4ff', 'center', 700);
        for (let s = 0; s < 3; s++) star(x + cw / 2 - 22 + s * 22, y + ch - 14, 8, b && b.m > s ? MED[s] : 'rgba(255,255,255,.14)', b && b.m > s ? INK : 'rgba(255,255,255,.2)');
        if (b) TX(b.s.toLocaleString(), x + cw - 8, y + ch - 14, 11, '#ffd23f', 'right', 800);
      });
    };

    const openBrief = L => {
      const kind = (sv.char && sv.char[L.id]) || L.char;
      br = { L, kind }; prev = mkPrev(kind); retTo = L.mine ? 'mine' : 'levels'; go('brief');
    };
    const setBriefChar = k => { if (br.kind === k) return; br.kind = k; prev = mkPrev(k); if (!sv.char || typeof sv.char !== 'object') sv.char = {}; sv.char[br.L.id] = k; persist(); };

    const drawBrief = () => {
      const L = br.L, th = HW.THEMES[L.theme];
      stepPrev(prev, dtF); drawPrev(prev, 0, 0, CW, CH, L.theme, PORT ? 48 : 66);
      ctx.fillStyle = 'rgba(8,10,30,.5)'; ctx.fillRect(0, 0, CW, CH);
      header(L.name, null, () => go(retTo));
      const bx = PORT ? 20 : 30, bw = PORT ? CW - 40 : 430, by = PORT ? 70 : 72;
      panel(bx, by, bw, PORT ? 230 : 196, 16);
      const ey = WRAP(L.blurb || '', bx + 18, by + 28, bw - 36, 21, 16, '#e3e6ff', 'left', 600);
      const hz = hazList(L);
      let cy = ey + 34, cx = bx + 18;
      TX('Hazards', bx + 18, cy, 13, '#8e94d6', 'left', 800); cy += 22;
      if (!hz.length) TX('None. Enjoy the ride.', bx + 18, cy, 14, '#fff', 'left', 700);
      for (const h of hz) {
        ctx.font = '700 13px ' + FONT; const w = ctx.measureText(h).width + 18;
        if (cx + w > bx + bw - 14) { cx = bx + 18; cy += 28; }
        rr(ctx, cx, cy - 11, w, 22, 11); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); TX(h, cx + 9, cy, 13, '#fff', 'left', 700); cx += w + 7;
      }
      const b = sv.best[L.id];
      TX(b ? 'Best  ' + b.s.toLocaleString() + '   ' + fmtT(b.t) : 'Not finished yet', bx + 18, by + (PORT ? 212 : 178), 15, b ? '#ffd23f' : '#8e94d6', 'left', 800);
      if (b) for (let s = 0; s < 3; s++) star(bx + bw - 72 + s * 24, by + (PORT ? 212 : 178), 9, b.m > s ? MED[s] : 'rgba(255,255,255,.14)', b.m > s ? INK : 'rgba(255,255,255,.2)');
      const ry = PORT ? 316 : 300, cw5 = PORT ? (CW - 40 - 4 * 8) / 5 : 82, startX = PORT ? 20 : CW - 30 - (5 * 82 + 4 * 8);
      TX('Pick your rider', PORT ? CW / 2 : startX + (5 * 82 + 32) / 2, ry - 18, 14, '#cfd3ff', 'center', 800);
      HW.CHAR_IDS.forEach((k, i) => {
        const x = startX + i * (cw5 + 8), c = HW.CHARS[k], sel = br.kind === k;
        button(x, ry, cw5, 58, null, () => setBriefChar(k), { col: sel ? '#3b5bdb' : '#262a5c', lit: c.col });
        ctx.beginPath(); ctx.arc(x + cw5 / 2, ry + 18, 9, 0, TAU); ctx.fillStyle = c.col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
        TX(c.name.split(' ')[0], x + cw5 / 2, ry + 40, PORT ? 11.5 : 12, '#fff', 'center', 800);
        if (k === L.char) TX('best fit', x + cw5 / 2, ry + 52, 9, '#ffd23f', 'center', 700);
      });
      const c = HW.CHARS[br.kind];
      panel(PORT ? 20 : startX, ry + 70, PORT ? CW - 40 : 5 * 82 + 32, PORT ? 92 : 72, 14);
      TX(c.name, (PORT ? CW / 2 : startX + (5 * 82 + 32) / 2), ry + 90, 16, c.col, 'center', 800);
      WRAP(c.blurb + ' ' + c.keys + '.', (PORT ? CW / 2 : startX + (5 * 82 + 32) / 2), ry + 109, PORT ? CW - 70 : 5 * 82 + 32 - 30, 16, 12.5, '#e3e6ff', 'center', 600);
      button(PORT ? CW / 2 - 140 : CW - 30 - 250, CH - (PORT ? 120 : 76), PORT ? 280 : 250, 58, 'START', () => startRun(L, br.kind), { col: '#2f9e44', size: 26 });
    };

    const drawResult = () => {
      drawRun();
      ctx.fillStyle = 'rgba(8,10,30,.55)'; ctx.fillRect(0, 0, CW, CH);
      const r = run, res = r.res, pw = PORT ? CW - 40 : 480, px = CW / 2 - pw / 2, ph = PORT ? 440 : 392, py = (CH - ph) / 2 - (PORT ? 40 : 0);
      const e = Math.min(1, tScreen * 4), ez = 1 - Math.pow(1 - e, 3);
      ctx.save(); ctx.translate(CW / 2, py + ph / 2); ctx.scale(.88 + .12 * ez, .88 + .12 * ez); ctx.globalAlpha = ez; ctx.translate(-CW / 2, -(py + ph / 2));
      panel(px, py, pw, ph, 22, 'rgba(14,16,44,.95)', 'rgba(255,255,255,.2)');
      TX(r.test ? 'TEST COMPLETE' : 'LEVEL COMPLETE', CW / 2, py + 40, 30, '#7cf29a', 'center', 900);
      TX(r.L.name, CW / 2, py + 68, 16, '#cfd3ff', 'center', 700);
      for (let s = 0; s < 3; s++) { const k = Math.min(1, Math.max(0, tScreen * 2 - s * .35)); star(CW / 2 - 56 + s * 56, py + 112, 20 * (res.med > s ? (.4 + .6 * k) : 1), res.med > s ? MED[s] : 'rgba(255,255,255,.12)', res.med > s ? INK : 'rgba(255,255,255,.2)'); }
      const row = (lab, val, y, col) => { TX(lab, px + 44, y, 17, '#aeb4ff', 'left', 700); TX(val, px + pw - 44, y, 20, col || '#fff', 'right', 800); };
      row('Time', fmtT(res.time), py + 168);
      row('Finish bonus', '1,000', py + 198);
      row('Speed bonus', '+' + res.tb.toLocaleString(), py + 228);
      row('Limbs intact ' + res.limbs + '/' + res.total, '+' + res.lb.toLocaleString(), py + 258);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(px + 40, py + 276, pw - 80, 2);
      row('SCORE', res.s.toLocaleString(), py + 302, '#ffd23f');
      if (!r.test) TX(res.newBest ? 'New personal best!' : 'Best ' + (res.prev ? res.prev.s.toLocaleString() : ''), CW / 2, py + 330, 15, res.newBest ? '#7cf29a' : '#8e94d6', 'center', 800);
      const by = py + ph - 66, nxt = HW.LEVELS[HW.LEVELS.indexOf(r.L) + 1];
      const bl = r.test ? [['Retry', () => restartRun(), '#3b5bdb'], ['Editor', () => go('edit'), '#2f9e44']] : [['Retry', () => restartRun(), '#3b5bdb'], ...(nxt && !r.L.mine ? [['Next', () => openBrief(nxt), '#2f9e44']] : []), ['Levels', () => go(r.L.mine ? 'mine' : 'levels'), '#495057']];
      const gap = 10, bw = (pw - 48 - gap * (bl.length - 1)) / bl.length;
      bl.forEach(([lab, fn, col], i) => button(px + 24 + i * (bw + gap), by, bw, 46, lab, fn, { col, size: 18 }));
      primary = (bl.find(q => q[0] === 'Next') || bl.find(q => q[0] === 'Editor') || bl[0])[1];
      ctx.restore();
    };

    const drawOptions = () => {
      scrBack('night');
      header('Options', null, () => go('title'));
      const w = PORT ? CW - 40 : 560, x = CW / 2 - w / 2; let y = PORT ? 130 : 110;
      const row = (lab, desc, val, fn) => {
        panel(x, y, w, 70, 14); TX(lab, x + 20, y + 24, 19, '#fff', 'left', 800); TX(desc, x + 20, y + 49, 13, '#aeb4ff', 'left', 600);
        button(x + w - 150, y + 14, 130, 42, val, fn, { size: 17, col: '#3b5bdb', r: 11 }); y += 82;
      };
      row('Red splat', 'A cartoon red splat when limbs pop. Off by default.', sv.splat ? 'ON' : 'OFF', () => { sv.splat = sv.splat ? 0 : 1; persist(); });
      row('Screen shake', 'How much the camera rattles on crashes.', ['OFF', 'LOW', 'FULL'][sv.shake === 0 ? 0 : sv.shake < 1 ? 1 : 2], () => { sv.shake = sv.shake === 0 ? .5 : sv.shake < 1 ? 1 : 0; persist(); });
      row('Control hints', 'Show the controls when a level starts.', sv.hint ? 'ON' : 'OFF', () => { sv.hint = sv.hint ? 0 : 1; persist(); });
      row('Touch buttons', 'Always show the on-screen buttons.', sv.touch ? 'ON' : 'AUTO', () => { sv.touch = sv.touch ? 0 : 1; touchSeen = sv.touch || matchMedia('(pointer: coarse)').matches || PORT; persist(); });
      button(x, y + 4, w, 46, confirmReset ? 'Tap again to erase all scores' : 'Reset scores', () => { if (confirmReset) { sv.best = {}; confirmReset = 0; persist(); publish(); } else confirmReset = 1; }, { col: confirmReset ? '#c92a2a' : '#495057', size: 17 });
    };

    const blankLevel = () => ({ id: 'u0', name: 'My level', theme: 'meadow', char: 'wheelchair', par: 40, mine: 1, blurb: 'A level made in the editor.', items: [{ t: 'ground', p: [-12, 0, 70, 0] }, { t: 'spawn', x: 0, y: 0 }, { t: 'finish', x: 56, y: -1.2 }] });
    const drawMine = () => {
      scrBack('desert');
      header('My levels', 'Levels you build are saved on this device.', () => go('title'));
      const w = PORT ? CW - 40 : 620, x = CW / 2 - w / 2; let y = PORT ? 118 : 96;
      for (let i = 0; i < 6; i++) {
        const L = sv.mine[i];
        panel(x, y, w, 58, 14);
        TX(L ? L.name : 'Empty slot ' + (i + 1), x + 18, y + 29, 17, L ? '#fff' : '#8e94d6', 'left', 800);
        if (L) {
          const bw = PORT ? 62 : 84;
          button(x + w - 3 * bw - 30, y + 9, bw, 40, 'Play', () => { const q = Object.assign({}, L, { id: 'u' + i, mine: 1 }); openBrief(q); }, { col: '#2f9e44', size: 15, r: 10 });
          button(x + w - 2 * bw - 20, y + 9, bw, 40, 'Edit', () => openEditor(i), { col: '#3b5bdb', size: 15, r: 10 });
          button(x + w - bw - 10, y + 9, bw, 40, 'Del', () => { if (mineMsg === 'del' + i) { sv.mine[i] = null; persist(); mineMsg = ''; } else mineMsg = 'del' + i; }, { col: mineMsg === 'del' + i ? '#c92a2a' : '#495057', size: 15, r: 10 });
        } else button(x + w - 130, y + 9, 120, 40, 'Create', () => openEditor(i), { col: '#3b5bdb', size: 15, r: 10 });
        y += 66;
      }
      if (mineMsg) TX('Tap Del again to delete this level for good.', CW / 2, y + 12, 14, '#ffd23f', 'center', 700);
    };
    let ed = null;
    const STUB = { boom() {}, pop() {}, snd() {}, puff() {}, shake() {}, glass() {} };
    const TYPES = [['ground', 'Ground'], ['box', 'Block'], ['ramp', 'Ramp'], ['spikes', 'Spikes'], ['mine', 'Mine'], ['harpoon', 'Harpoon'], ['wreck', 'Wrecker'], ['fan', 'Fan'], ['boost', 'Boost'], ['glass', 'Glass'], ['spring', 'Spring'], ['crate', 'Crate'], ['ball', 'Ball'], ['lift', 'Lift'], ['sign', 'Sign'], ['spawn', 'Start'], ['finish', 'Finish']];
    const DEF = { box: { w: 3, h: 1 }, ramp: { w: 4, h: 2 }, spikes: { w: 2 }, mine: {}, harpoon: { a: Math.PI, range: 16 }, wreck: { len: 5, amp: 1.05, per: 3.4 }, fan: { a: -Math.PI / 2, w: 7, h: 3, f: 16 }, boost: { w: 5, f: 26 }, glass: { w: .5, h: 3, a: 0 }, spring: { w: 2.2, p: 15 }, crate: { w: 1, h: 1 }, ball: { r: .6 }, lift: { w: 4, dx: 4, dy: 0, per: 6 }, sign: { txt: 'Careful!' }, spawn: {}, finish: {} };
    const SIGNS = ['Careful!', 'Jump here', 'Go go go!', 'Hold on tight', 'Boost ahead', 'Almost there'];
    const NAMES_A = ['Wobbly', 'Spiky', 'Bouncy', 'Tricky', 'Lumpy', 'Happy', 'Wild', 'Crunchy', 'Sneaky', 'Silly'], NAMES_B = ['Hills', 'Run', 'Canyon', 'Dash', 'Garden', 'Rumble', 'Loop', 'Valley', 'Trail', 'Plunge'];
    const PROPS = {
      box: [['W', 'w', .5, 1, 60], ['H', 'h', .5, .5, 40], ['Turn', 'a'], ['Style', 'm', ['stone', 'wood', 'ice', 'hazard']]],
      ramp: [['W', 'w', .5, 1, 40], ['H', 'h', .5, .5, 30], ['Turn', 'a'], ['Flip', 'fl', [0, 1]], ['Style', 'm', ['stone', 'wood', 'ice', 'hazard']]],
      spikes: [['W', 'w', .5, 1, 20], ['Turn', 'a']], harpoon: [['Turn', 'a'], ['Range', 'range', 2, 6, 30]],
      wreck: [['Len', 'len', .5, 2, 12], ['Swing', 'amp', .1, .3, 1.6], ['Speed', 'per', .4, 1.6, 8]],
      fan: [['Len', 'w', 1, 2, 20], ['Wide', 'h', .5, 1, 10], ['Turn', 'a'], ['Power', 'f', 2, 6, 30]],
      boost: [['W', 'w', .5, 2, 20], ['Turn', 'a'], ['Power', 'f', 2, 8, 40]],
      glass: [['W', 'w', .25, .25, 10], ['H', 'h', .5, .5, 12], ['Turn', 'a']],
      spring: [['W', 'w', .4, 1, 8], ['Power', 'p', 1, 6, 30], ['Turn', 'a']],
      crate: [['W', 'w', .25, .5, 5], ['H', 'h', .25, .5, 5]], ball: [['Size', 'r', .1, .25, 2]],
      lift: [['W', 'w', .5, 1.5, 12], ['Across', 'dx', .5, -20, 20], ['Rise', 'dy', .5, -20, 20], ['Speed', 'per', .5, 2, 14]],
      sign: [['Text', 'txt', SIGNS]]
    };
    const EXT = {
      box: it => [it.w / 2, it.h / 2, 0, 0], ramp: it => [it.w / 2, it.h / 2, 0, 0], spikes: it => [it.w / 2, .45, 0, -.25], mine: () => [.5, .5, 0, 0], harpoon: () => [.9, .5, .3, .1],
      wreck: () => [.8, .5, 0, 0], fan: it => [.5, it.h / 2, 0, 0], boost: it => [it.w / 2, .5, 0, -.2], glass: it => [it.w / 2, it.h / 2, 0, 0], spring: it => [it.w / 2, .5, 0, .2],
      crate: it => [it.w / 2, it.h / 2, 0, 0], ball: it => [it.r, it.r, 0, 0], lift: it => [it.w / 2, it.h / 2, 0, 0], sign: () => [.8, .8, 0, -1.5], spawn: () => [.8, 1, 0, -.8], finish: () => [.8, .8, 0, 0]
    };
    const snap = v => Math.round(v * 2) / 2;
    const edRebuild = () => { ed.lv = HW.buildLevel(new PH.World({ g: 10 }), ed.L, STUB, 3); };
    const openEditor = slot => {
      const L = slot >= 0 && sv.mine[slot] ? JSON.parse(JSON.stringify(sv.mine[slot])) : blankLevel();
      if (slot < 0) L.name = pick(NAMES_A) + ' ' + pick(NAMES_B);
      ed = { slot, L, cam: { x: 22, y: -3, ppm: PORT ? 17 : 26 }, tool: 'sel', type: null, sel: null, drag: null, gp: null, typing: false, msg: '', msgT: 0, dirty: false, vtx: -1, pan: null, keys: new Set() };
      edRebuild(); go('edit');
    };
    const edMsg = s => { ed.msg = s; ed.msgT = 2.6; };
    const s2w = (x, y) => [(x - VW / 2) / ed.cam.ppm + ed.cam.x, (y - VH / 2) / ed.cam.ppm + ed.cam.y];
    const edHit = (x, y) => {
      const its = ed.L.items;
      for (let i = its.length - 1; i >= 0; i--) {
        const it = its[i];
        if (it.t === 'ground') {
          const p = it.p;
          for (let k = 0; k < p.length / 2 - 1; k++) {
            const x1 = p[2 * k], y1 = p[2 * k + 1], x2 = p[2 * k + 2], y2 = p[2 * k + 3], dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy || 1;
            const t = clamp(((x - x1) * dx + (y - y1) * dy) / l2, 0, 1), d = hyp(x - x1 - dx * t, y - y1 - dy * t);
            if (d < .8 || (Math.abs(x - (x1 + dx * t)) < .01 && y > y1 + dy * t && y < y1 + dy * t + 3)) return it;
          }
          continue;
        }
        const e = EXT[it.t]; if (!e) continue;
        const [hx, hy, ox, oy] = e(it), c = cos(-(it.a || 0)), s = sin(-(it.a || 0)), dx = x - it.x, dy = y - it.y, lx = dx * c - dy * s - ox, ly = dx * s + dy * c - oy;
        if (Math.abs(lx) <= hx + .15 && Math.abs(ly) <= hy + .15) return it;
      }
      return null;
    };
    const addItem = (t, x, y) => {
      const L = ed.L;
      if (t === 'spawn' || t === 'finish') { const o = L.items.find(i => i.t === t); if (o) { o.x = x; o.y = y; edRebuild(); ed.sel = o; ed.dirty = true; return; } }
      const it = Object.assign({ t, x, y }, DEF[t]);
      if (t === 'box' || t === 'ramp') it.m = 'stone';
      L.items.push(it); ed.sel = it; ed.dirty = true; edRebuild();
    };
    const edFinishGround = () => {
      if (ed.gp && ed.gp.length >= 4) { ed.L.items.unshift({ t: 'ground', p: ed.gp.slice() }); ed.dirty = true; edRebuild(); }
      ed.gp = null;
    };
    const edPointer = (kind, x, y, btn) => {
      const cam = ed.cam;
      if (kind === 'down') {
        if (ed.typing) ed.typing = false;
        if (btn === 1 || btn === 2 || ed.tool === 'pan' || ed.keys.has('Space')) { ed.pan = { sx: x, sy: y, cx: cam.x, cy: cam.y }; return; }
        const [wx, wy] = s2w(x, y);
        if (ed.tool === 'place' && ed.type) {
          if (ed.type === 'ground') {
            if (!ed.gp) ed.gp = []; const sx = snap(wx), sy = snap(wy);
            if (ed.gp.length >= 2 && sx <= ed.gp[ed.gp.length - 2]) { edMsg('Ground points go left to right'); return; }
            ed.gp.push(sx, sy); return;
          }
          const sx = snap(wx), sy = snap(wy);
          if (ed.type === 'spawn' || ed.type === 'finish') addItem(ed.type, sx, sy);
          else addItem(ed.type, sx, sy);
          snd.sfx('click'); return;
        }
        if (ed.tool === 'del') {
          const it = edHit(wx, wy);
          if (it) {
            if (it.t === 'ground' && it.p.length > 4) {
              let bi = -1, bd = 1.1; for (let k = 0; k < it.p.length / 2; k++) { const d = hyp(it.p[2 * k] - wx, it.p[2 * k + 1] - wy); if (d < bd) { bd = d; bi = k; } }
              if (bi >= 0) { it.p.splice(2 * bi, 2); ed.dirty = true; edRebuild(); snd.sfx('back'); return; }
            }
            if (it.t === 'spawn' || it.t === 'finish') { edMsg('A level needs a ' + (it.t === 'spawn' ? 'start' : 'finish') + '. Move it instead.'); return; }
            ed.L.items.splice(ed.L.items.indexOf(it), 1); if (ed.sel === it) ed.sel = null; ed.dirty = true; edRebuild(); snd.sfx('back');
          }
          return;
        }
        let vi = -1, vit = null;
        for (const it of ed.L.items) if (it.t === 'ground') for (let k = 0; k < it.p.length / 2; k++) if (hyp(it.p[2 * k] - wx, it.p[2 * k + 1] - wy) < .7) { vi = k; vit = it; }
        if (vit) { ed.sel = vit; ed.drag = { vtx: vi, it: vit }; return; }
        const it = edHit(wx, wy);
        if (it) { ed.sel = it; if (it.t !== 'ground') ed.drag = { it, ox: it.x - wx, oy: it.y - wy }; snd.sfx('tick'); }
        else { ed.sel = null; ed.pan = { sx: x, sy: y, cx: cam.x, cy: cam.y }; }
      } else if (kind === 'move') {
        if (ed.pan) { cam.x = ed.pan.cx - (x - ed.pan.sx) / cam.ppm; cam.y = ed.pan.cy - (y - ed.pan.sy) / cam.ppm; }
        else if (ed.drag) {
          const [wx, wy] = s2w(x, y), d = ed.drag;
          if (d.vtx !== undefined) {
            const p = d.it.p, k = d.vtx, lo = k > 0 ? p[2 * k - 2] + .5 : -1e9, hi = k < p.length / 2 - 1 ? p[2 * k + 2] - .5 : 1e9;
            const nx = clamp(snap(wx), lo, hi), ny = snap(wy);
            if (nx !== p[2 * k] || ny !== p[2 * k + 1]) { p[2 * k] = nx; p[2 * k + 1] = ny; ed.dirty = true; edRebuild(); }
          } else {
            const nx = snap(wx + d.ox), ny = snap(wy + d.oy);
            if (nx !== d.it.x || ny !== d.it.y) { d.it.x = nx; d.it.y = ny; ed.dirty = true; edRebuild(); }
          }
        }
      } else { ed.pan = null; ed.drag = null; }
    };
    const edPropBtns = () => {
      const it = ed.sel; if (!it) return [];
      const out = [];
      if (it.t === 'ground') { out.push({ lab: 'Delete', fn: () => { ed.L.items.splice(ed.L.items.indexOf(it), 1); ed.sel = null; ed.dirty = true; edRebuild(); } }); return out; }
      for (const pr of PROPS[it.t] || []) {
        const [lab, k, a, b2, c2] = pr;
        if (k === 'a') out.push({ lab: lab + ' ' + Math.round((it.a || 0) * 180 / Math.PI) + '\u00b0', dual: [() => { it.a = (it.a || 0) - Math.PI / 12; }, () => { it.a = (it.a || 0) + Math.PI / 12; }] });
        else if (Array.isArray(a)) out.push({ lab: lab + ': ' + String(it[k] ?? a[0]), fn: () => { const i = a.indexOf(it[k] ?? a[0]); it[k] = a[(i + 1) % a.length]; } });
        else { const step = a, lo = b2, hi = c2; out.push({ lab: lab + ' ' + (+(it[k] ?? DEF[it.t][k] ?? 0)).toFixed(step < 1 ? (step < .2 ? 2 : 1) : 0), dual: [() => { it[k] = clamp(+((it[k] ?? DEF[it.t][k] ?? 0) - step).toFixed(2), lo, hi); }, () => { it[k] = clamp(+((it[k] ?? DEF[it.t][k] ?? 0) + step).toFixed(2), lo, hi); }] }); }
      }
      if (it.t !== 'spawn' && it.t !== 'finish') { out.push({ lab: 'Copy', fn: () => { const c = JSON.parse(JSON.stringify(it)); c.x += 1; c.y -= 1; ed.L.items.push(c); ed.sel = c; } }); out.push({ lab: 'Delete', fn: () => { ed.L.items.splice(ed.L.items.indexOf(it), 1); ed.sel = null; } }); }
      return out;
    };
    const edSave = (quiet) => {
      const L = ed.L;
      if (ed.slot < 0) { const i = [0, 1, 2, 3, 4, 5].find(q => !sv.mine[q]); if (i === undefined) { edMsg('All 6 slots are full. Delete one in My levels.'); return false; } ed.slot = i; }
      L.id = 'u' + ed.slot; L.mine = 1; sv.mine[ed.slot] = JSON.parse(JSON.stringify(L)); persist(); ed.dirty = false;
      if (!quiet) { edMsg('Saved to slot ' + (ed.slot + 1)); snd.sfx('chime'); }
      return true;
    };
    const edTest = () => {
      const L = ed.L;
      if (!L.items.some(i => i.t === 'spawn') || !L.items.some(i => i.t === 'finish')) { edMsg('Place a Start and a Finish first'); return; }
      if (!L.items.some(i => i.t === 'ground')) { edMsg('Add some ground first'); return; }
      L.id = 'u' + Math.max(0, ed.slot);
      startRun(L, L.char, { test: true });
    };
    const drawEditor = dt => {
      const cam = ed.cam, L = ed.L, lv = ed.lv;
      if (ed.msgT > 0) ed.msgT -= dt;
      const sp = 14 / cam.ppm * 60 * dt;
      if (ed.keys.has('ArrowLeft') || ed.keys.has('KeyA')) cam.x -= sp; if (ed.keys.has('ArrowRight') || ed.keys.has('KeyD')) cam.x += sp;
      if (ed.keys.has('ArrowUp') || ed.keys.has('KeyW')) cam.y -= sp; if (ed.keys.has('ArrowDown') || ed.keys.has('KeyS')) cam.y += sp;
      const hw = VW / 2 / cam.ppm + 1, hh = VH / 2 / cam.ppm + 1;
      const vw = { x: cam.x, y: cam.y, ppm: cam.ppm, w: VW, h: VH, x0: cam.x - hw, x1: cam.x + hw, y0: cam.y - hh, y1: cam.y + hh };
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, CW, CH); ctx.clip();
      HW.drawBack(ctx, lv.th, lv.back, vw, 0);
      ctx.save(); ctx.translate(VW / 2, VH / 2); ctx.scale(cam.ppm, cam.ppm); ctx.translate(-cam.x, -cam.y);
      ctx.lineWidth = 1 / cam.ppm; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.beginPath();
      for (let gx = Math.floor(vw.x0); gx <= vw.x1; gx++) { ctx.moveTo(gx, vw.y0); ctx.lineTo(gx, vw.y1); }
      for (let gy = Math.floor(vw.y0); gy <= vw.y1; gy++) { ctx.moveTo(vw.x0, gy); ctx.lineTo(vw.x1, gy); }
      ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2 / cam.ppm; ctx.beginPath(); ctx.moveTo(vw.x0, 0); ctx.lineTo(vw.x1, 0); ctx.moveTo(0, vw.y0); ctx.lineTo(0, vw.y1); ctx.stroke();
      lv.drawWorld(ctx, vw);
      const sp0 = L.items.find(i => i.t === 'spawn');
      if (sp0) {
        ctx.save(); ctx.translate(sp0.x, sp0.y); line(ctx, [0, 0, 0, -1.8], '#e9edf5', .09); ctx.beginPath(); ctx.moveTo(0, -1.8); ctx.lineTo(1.1, -1.5); ctx.lineTo(0, -1.2); ctx.closePath(); fillStroke(ctx, '#2fbf71', .05);
        ctx.beginPath(); ctx.ellipse(0, 0, .7, .15, 0, 0, TAU); ctx.fillStyle = 'rgba(47,191,113,.4)'; ctx.fill(); wtext(ctx, 'START', 0, .55, .3, '#fff', 'center', INK); ctx.restore();
      }
      ctx.lineJoin = 'round';
      for (const it of L.items) {
        if (it.t === 'fan') { xf(ctx, { x: it.x, y: it.y, a: it.a }, () => { ctx.strokeStyle = 'rgba(120,200,255,.7)'; ctx.setLineDash([.2, .2]); ctx.lineWidth = .05; ctx.strokeRect(0, -it.h / 2, it.w, it.h); ctx.setLineDash([]); }); }
        if (it.t === 'wreck') { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([.2, .2]); ctx.lineWidth = .05; ctx.beginPath(); ctx.arc(it.x, it.y, it.len || 5, Math.PI / 2 - (it.amp ?? 1.05), Math.PI / 2 + (it.amp ?? 1.05)); ctx.stroke(); ctx.setLineDash([]); }
        if (it.t === 'harpoon') { xf(ctx, it, () => { ctx.strokeStyle = 'rgba(255,90,90,.45)'; ctx.setLineDash([.2, .2]); ctx.lineWidth = .05; ctx.beginPath(); ctx.moveTo(1.2, 0); ctx.lineTo(it.range || 16, 0); ctx.stroke(); ctx.setLineDash([]); }); }
        if (it.t === 'mine') { ctx.beginPath(); ctx.arc(it.x, it.y, it.r || 6.5, 0, TAU); ctx.strokeStyle = 'rgba(255,90,90,.18)'; ctx.lineWidth = .05; ctx.stroke(); }
        if (it.t === 'ground' && (ed.tool === 'sel' || ed.tool === 'del' || ed.sel === it)) for (let k = 0; k < it.p.length / 2; k++) { ctx.beginPath(); ctx.arc(it.p[2 * k], it.p[2 * k + 1], .18, 0, TAU); ctx.fillStyle = ed.sel === it ? '#ffd23f' : 'rgba(255,255,255,.7)'; ctx.fill(); ctx.lineWidth = .04; ctx.strokeStyle = INK; ctx.stroke(); }
      }
      if (ed.sel && ed.sel.t !== 'ground') {
        const it = ed.sel, e = EXT[it.t];
        if (e) { const [hx, hy, ox, oy] = e(it); xf(ctx, it, () => { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .08; ctx.setLineDash([.25, .18]); ctx.strokeRect(ox - hx - .1, oy - hy - .1, hx * 2 + .2, hy * 2 + .2); ctx.setLineDash([]); }); }
      }
      if (ed.gp) {
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = .12; ctx.beginPath(); for (let k = 0; k < ed.gp.length; k += 2) ctx[k ? 'lineTo' : 'moveTo'](ed.gp[k], ed.gp[k + 1]); ctx.stroke();
        for (let k = 0; k < ed.gp.length; k += 2) { ctx.beginPath(); ctx.arc(ed.gp[k], ed.gp[k + 1], .2, 0, TAU); ctx.fillStyle = '#ffd23f'; ctx.fill(); }
      }
      if (ed.tool === 'place' && ed.type && ui.mx > 0 && ui.my > 120 && ui.my < VH - 120) {
        const [wx, wy] = s2w(ui.mx, ui.my); ctx.beginPath(); ctx.arc(snap(wx), snap(wy), .22, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill(); ctx.lineWidth = .05; ctx.strokeStyle = INK; ctx.stroke();
      }
      ctx.restore();
      const flow = (list, x0, y0, maxW, w, h, gap, mk) => {
        let x = x0, y = y0;
        for (const q of list) {
          const ww = q.w || w;
          if (x + ww > x0 + maxW + .5) { x = x0; y += h + gap; }
          mk(q, x, y, ww, h); x += ww + gap;
        }
        return y + h;
      };
      const sm = PORT ? 15 : 14;
      let y1 = flow([
        { lab: 'Back', fn: () => { if (ed.dirty && ed.slot >= 0) edSave(true); go(ed.slot >= 0 || sv.mine.some(Boolean) ? 'mine' : 'title'); }, w: 62 },
        { lab: 'Save', fn: () => edSave(), col: '#2f9e44', w: 62 },
        { lab: 'Test', fn: edTest, col: '#f08c00', w: 62 },
        { lab: L.name + (ed.typing && (clock * 2 | 0) % 2 ? '|' : ''), fn: () => { ed.typing = true; }, w: PORT ? 200 : 210, col: ed.typing ? '#1c7ed6' : '#364fc7', name: 1 },
        { lab: 'Dice', fn: () => { L.name = pick(NAMES_A) + ' ' + pick(NAMES_B); ed.dirty = true; }, w: 54 },
        { lab: 'Sky: ' + L.theme, fn: () => { const i = HW.THEME_IDS.indexOf(L.theme); L.theme = HW.THEME_IDS[(i + 1) % HW.THEME_IDS.length]; ed.dirty = true; edRebuild(); }, w: 112 },
        { lab: 'Rider: ' + HW.CHARS[L.char].name.split(' ')[0], fn: () => { const i = HW.CHAR_IDS.indexOf(L.char); L.char = HW.CHAR_IDS[(i + 1) % 5]; ed.dirty = true; }, w: 130 },
        { lab: 'Par ' + L.par + 's', dual: [() => { L.par = Math.max(10, L.par - 5); ed.dirty = true; }, () => { L.par = Math.min(300, L.par + 5); ed.dirty = true; }], w: 106 }
      ], 6, 6, CW - 12, 70, 30, 5, (q, x, y, w, h) => {
        if (q.dual) { button(x, y, 22, h, '-', q.dual[0], { size: 16, r: 8 }); TX(q.lab, x + w / 2, y + h / 2, 12, '#fff', 'center', 800); button(x + w - 22, y, 22, h, '+', q.dual[1], { size: 16, r: 8 }); }
        else button(x, y, w, h, q.lab, q.fn, { size: q.name ? 14 : 13, col: q.col || '#2c3170', r: 8 });
      });
      const tools = [['pan', 'Pan'], ['sel', 'Select'], ['del', 'Erase']];
      y1 = flow([...tools.map(([k, n]) => ({ lab: n, fn: () => { ed.tool = k; ed.type = null; if (ed.gp) edFinishGround(); }, col: ed.tool === k ? '#e8590c' : '#2c3170', w: 66 })),
        { lab: 'Zoom -', fn: () => { cam.ppm = clamp(cam.ppm / 1.25, 8, 80); }, w: 66 }, { lab: 'Zoom +', fn: () => { cam.ppm = clamp(cam.ppm * 1.25, 8, 80); }, w: 66 },
        ...(ed.gp ? [{ lab: 'Finish ground', fn: edFinishGround, col: '#2f9e44', w: 120 }] : [])
      ], 6, y1 + 5, CW - 12, 66, 28, 5, (q, x, y, w, h) => button(x, y, w, h, q.lab, q.fn, { size: 13, col: q.col || '#2c3170', r: 8 }));
      const pal = TYPES.map(([k, n]) => ({ lab: n, fn: () => { if (ed.gp) edFinishGround(); ed.tool = 'place'; ed.type = k; ed.sel = null; }, col: ed.tool === 'place' && ed.type === k ? '#e8590c' : '#364fc7', w: PORT ? 82 : 84 }));
      const perRow = Math.floor((CW - 12 + 5) / ((PORT ? 82 : 84) + 5)), rows = Math.ceil(pal.length / perRow), ph = rows * 31 + 4;
      const pyy = VH - ph - 4;
      ctx.fillStyle = 'rgba(8,10,30,.7)'; ctx.fillRect(0, pyy - 4, CW, ph + 8);
      flow(pal, 6, pyy, CW - 12, 84, 28, 5, (q, x, y, w, h) => button(x, y, w, h, q.lab, q.fn, { size: 13, col: q.col, r: 8 }));
      const props = edPropBtns();
      if (props.length) {
        let py = pyy - 36 * (PORT ? 2 : 1) - 8;
        const total = flow(props, 6, py, CW - 12, 118, 30, 5, () => {});
        py = pyy - (total - py) - 12; ctx.fillStyle = 'rgba(8,10,30,.7)'; ctx.fillRect(0, py - 4, CW, total - py + 40);
        flow(props.map(q => Object.assign({}, q, { w: q.dual ? 128 : 74 })), 6, py, CW - 12, 118, 30, 5, (q, x, y, w, h) => {
          const fire = f => () => { f(); ed.dirty = true; edRebuild(); };
          if (q.dual) { button(x, y, 26, h, '-', fire(q.dual[0]), { size: 16, r: 8 }); TX(q.lab, x + w / 2, y + h / 2, 12, '#fff', 'center', 800); button(x + w - 26, y, 26, h, '+', fire(q.dual[1]), { size: 16, r: 8 }); }
          else button(x, y, Math.max(w, q.lab.length * 8 + 16), h, q.lab, fire(q.fn), { size: 13, col: q.lab === 'Delete' ? '#c92a2a' : '#2c3170', r: 8 });
        });
      }
      const hint = ed.tool === 'place' ? (ed.type === 'ground' ? 'Click to add ground points left to right, then Finish ground' : 'Click to place ' + (TYPES.find(t => t[0] === ed.type) || [0, ''])[1]) : ed.tool === 'pan' ? 'Drag to move the view' : ed.tool === 'del' ? 'Click an object to erase it' : 'Click to select, drag to move. Empty space pans.';
      TX(hint, CW / 2, y1 + 18, 13, 'rgba(255,255,255,.9)', 'center', 700, 'rgba(10,12,32,.7)');
      if (ed.msgT > 0) { panel(CW / 2 - 200, VH / 2 - 24, 400, 48, 12); TX(ed.msg, CW / 2, VH / 2, 16, '#ffd23f', 'center', 800); }
      ctx.restore();
    };
    const goBack = () => {
      if (screen === 'levels' || screen === 'options' || screen === 'mine') go('title');
      else if (screen === 'brief') go(retTo);
      else if (screen === 'result') { if (run.test) go('edit'); else go(run.L.mine ? 'mine' : 'levels'); }
      else if (screen === 'play') leaveRun();
      else if (screen === 'edit') { if (ed.dirty && ed.slot >= 0) edSave(true); go(sv.mine.some(Boolean) ? 'mine' : 'title'); }
    };
    const leaveRun = () => {
      if (!run) return go('title');
      if (run.test) go('edit'); else openBrief(run.L);
    };
    const uiHit = (x, y) => { for (let i = ui.b.length - 1; i >= 0; i--) { const b = ui.b[i]; if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b; } return null; };

    api.on(canvas, 'pointerdown', e => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      if (e.pointerType === 'touch' || e.pointerType === 'pen') touchSeen = true;
      const p = cv.toLocal(e); ui.mx = p.x; ui.my = p.y; snd.unlock();
      const b = uiHit(p.x, p.y);
      if (b && !b.dis) { ui.f = b.id; pressBtn(b); return; }
      if (screen === 'play' && run) {
        const k = hitTB(p.x, p.y);
        if (k === 'restart') { restartRun(); return; }
        if (k === 'menu') { leaveRun(); return; }
        if (k === 'eject') { doEject(); touchPtr.set(e.pointerId, 'eject'); return; }
        if (k) touchPtr.set(e.pointerId, k);
      } else if (screen === 'edit') edPointer('down', p.x, p.y, e.button);
    });
    api.on(canvas, 'pointermove', e => {
      const p = cv.toLocal(e); ui.mx = p.x; ui.my = p.y;
      if (e.pointerType === 'mouse') { const b = uiHit(p.x, p.y); if (b && !b.dis) ui.f = b.id; }
      if (screen === 'play') { if (touchPtr.has(e.pointerId)) { const k = hitTB(p.x, p.y); if (k && k !== 'eject' && k !== 'restart' && k !== 'menu') touchPtr.set(e.pointerId, k); else if (!k) touchPtr.delete(e.pointerId); } }
      else if (screen === 'edit') edPointer('move', p.x, p.y);
    });
    const up = e => { touchPtr.delete(e.pointerId); if (screen === 'edit') edPointer('up', 0, 0); if (e.pointerType !== 'mouse') { ui.mx = -99; ui.my = -99; } };
    api.on(canvas, 'pointerup', up); api.on(canvas, 'pointercancel', up);
    api.on(canvas, 'contextmenu', e => e.preventDefault());
    api.on(canvas, 'wheel', e => { if (screen === 'edit') { e.preventDefault(); ed.cam.ppm = clamp(ed.cam.ppm * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 8, 80); } }, { passive: false });

    const NAVKEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] };
    api.on(window, 'keydown', e => {
      const t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (!api.alive) return;
      const c = e.code;
      snd.unlock();
      if (screen === 'edit' && ed.typing) {
        e.preventDefault();
        if (c === 'Enter' || c === 'Escape') ed.typing = false;
        else if (c === 'Backspace') { ed.L.name = ed.L.name.slice(0, -1); ed.dirty = true; }
        else if (e.key.length === 1 && ed.L.name.length < 22) { ed.L.name += e.key; ed.dirty = true; }
        return;
      }
      if (c.startsWith('Arrow') || c === 'Space') e.preventDefault();
      if (screen === 'play') {
        keysHeld.add(c);
        if (e.repeat) return;
        if (c === 'Space') doEject();
        else if (c === 'KeyR') restartRun();
        else if (c === 'KeyM') leaveRun();
      } else if (screen === 'edit') {
        ed.keys.add(c);
        if (e.repeat && c !== 'Delete') return;
        if (c === 'Delete' || c === 'Backspace') { if (ed.sel && ed.sel.t !== 'spawn' && ed.sel.t !== 'finish') { ed.L.items.splice(ed.L.items.indexOf(ed.sel), 1); ed.sel = null; ed.dirty = true; edRebuild(); } }
        else if (c === 'KeyR' && ed.sel && ed.sel.t !== 'ground') { ed.sel.a = (ed.sel.a || 0) + Math.PI / 12; ed.dirty = true; edRebuild(); }
        else if (c === 'Enter' && ed.gp) edFinishGround();
        else if (c === 'KeyP') edTest();
        else if (c === 'Equal' || c === 'NumpadAdd') ed.cam.ppm = clamp(ed.cam.ppm * 1.2, 8, 80);
        else if (c === 'Minus' || c === 'NumpadSubtract') ed.cam.ppm = clamp(ed.cam.ppm / 1.2, 8, 80);
      } else if (screen === 'result') {
        if (e.repeat) return;
        if (c === 'Enter' || c === 'Space') { if (primary) { snd.sfx('click'); primary(); } }
        else if (c === 'KeyR') restartRun();
        else if (c === 'Backspace' || c === 'KeyM') goBack();
      } else {
        if (NAVKEYS[c]) { navMove(NAVKEYS[c][0], NAVKEYS[c][1]); return; }
        if (c === 'Enter' || c === 'Space') { if (!e.repeat) pressBtn(ui.b[ui.f]); return; }
        if (c === 'Backspace') goBack();
        if (screen === 'brief' && (c === 'KeyQ' || c === 'KeyE')) { const i = HW.CHAR_IDS.indexOf(br.kind); setBriefChar(HW.CHAR_IDS[(i + (c === 'KeyE' ? 1 : 4)) % 5]); }
      }
    });
    api.on(window, 'keyup', e => { keysHeld.delete(e.code); if (ed) ed.keys.delete(e.code); });
    api.on(window, 'blur', () => { keysHeld.clear(); touchPtr.clear(); });

    api.loop(dt => {
      dtF = dt; clock += dt; tScreen += dt; ui.b.length = 0;
      ctx.fillStyle = '#0b0d20'; ctx.fillRect(0, 0, CW, CH);
      if (screen === 'play') { stepRun(dt); if (screen === 'play') drawRun(); }
      else if (screen === 'result') drawResult();
      else if (screen === 'edit') drawEditor(dt);
      else if (screen === 'levels') drawLevels();
      else if (screen === 'brief') drawBrief();
      else if (screen === 'options') drawOptions();
      else if (screen === 'mine') drawMine();
      else drawTitle();
      if (screen !== 'play' && screen !== 'edit') stepParticles(dt);
      if (ui.f >= ui.b.length) ui.f = Math.max(0, ui.b.length - 1);
      if (screen !== 'play' && ui.b.length && ui.b[ui.f] && ui.b[ui.f].dis) navMove(1, 0);
    });

    return { destroy() { snd.destroy(); } };
  };
  Ameplay.register({
    id: 'happy-wheels', title: 'Happy Wheels', category: 'Action', tint: '#ff5a3c',
    blurb: 'Ragdoll vehicle chaos: wheelchair rockets, bike, segway, moped and pogo through 14 levels, plus your own level editor.',
    help: '<kbd>&uarr;</kbd> <kbd>W</kbd> gas / roll / hop &middot; <kbd>&darr;</kbd> <kbd>S</kbd> brake &middot; <kbd>&larr;</kbd> <kbd>&rarr;</kbd> lean &middot; <kbd>Shift</kbd> boost or special &middot; <kbd>Space</kbd> eject &middot; <kbd>R</kbd> restart &middot; touch: on-screen buttons &middot; build levels in the editor',
    better: 'high',
    width: 960,
    format: v => v + ' pts',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="46" r="10"/><circle cx="46" cy="50" r="5"/><path d="M20 46l8-18h12l6 22M28 28l-4-10"/><circle cx="26" cy="12" r="4"/><path d="M52 30l8-4M52 36l10 0"/></svg>',
    css: '.gm-happy-wheels canvas{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;border-radius:14px}',
    mount: (root, api) => HW.mount(root, api)
  });
})();
