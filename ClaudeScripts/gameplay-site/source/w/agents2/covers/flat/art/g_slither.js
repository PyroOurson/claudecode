G['slither'] = {
  hex: function (w, h, a, base, face, line, seed) {
    var o = r(0, 0, w, h, base), hw = a * 3, hh = Math.sqrt(3) * a, R = rnd(seed);
    for (var i = -1; i * hw < w + hw; i++) for (var j = -1; j * hh < h + hh; j++) for (var k = 0; k < 2; k++) {
      var cx = i * hw + k * hw / 2, cy = j * hh + k * hh / 2, q = [];
      for (var m = 0; m < 6; m++) { var t0 = m * Math.PI / 3; q.push([+(cx + Math.cos(t0) * (a - 3)).toFixed(1), +(cy + Math.sin(t0) * (a - 3)).toFixed(1)]); }
      o += p(q, face, 'stroke="' + line + '" stroke-width="1.6" opacity="' + (0.75 + R() * 0.25).toFixed(2) + '"');
    }
    return o;
  },
  orbs: function (n, w, h, s0, s1, seed, cols) {
    var R = rnd(seed), o = '', gs = cols.map(function (col) { return rg([['#ffffff', 0], [col, 0.18], [col, 0.3], [col + '55', 0.5], [col + '00', 1]]); });
    for (var i = 0; i < n; i++) { var s = s0 + R() * (s1 - s0); o += c((R() * w).toFixed(1), (R() * h).toFixed(1), s.toFixed(1), gs[(R() * gs.length) | 0]); }
    return o;
  },
  snake: function (pts, r0, r1, cols, dark, glow) {
    var o = '', n = pts.length, beads = [];
    var fills = cols.map(function (col) { return rg([['#ffffff', 0], [col, 0.42], [col, 0.72], [dark, 1]], 0.36, 0.3, 0.72); });
    for (var i = 0; i < n; i++) { var u = i / (n - 1); beads.push([pts[i][0], pts[i][1], r0 + (r1 - r0) * Math.min(1, u * 1.6)]); }
    if (glow) for (var g0 = 0; g0 < n; g0 += 2) o += c(beads[g0][0], beads[g0][1] + 2, beads[g0][2] * 1.9, glow);
    for (var s0 = 0; s0 < n; s0 += 2) o += c(beads[s0][0] + 3, beads[s0][1] + 9, beads[s0][2], '#000', 'opacity=".2"');
    for (var b = 0; b < n; b++) o += c(beads[b][0].toFixed(1), beads[b][1].toFixed(1), beads[b][2].toFixed(1), fills[Math.floor(b / 3) % fills.length]);
    return { svg: o, head: beads[n - 1], prev: beads[n - 2] };
  },
  path: function (n, f) { var a = []; for (var i = 0; i < n; i++) a.push(f(i / (n - 1))); return a; },
  eyes: function (hx, hy, rr, ang, look) {
    var o = '', ca = Math.cos(ang), sa = Math.sin(ang);
    for (var sd = -1; sd <= 1; sd += 2) {
      var ex = hx + ca * rr * 0.34 - sa * sd * rr * 0.48, ey = hy + sa * rr * 0.34 + ca * sd * rr * 0.48;
      o += c(ex.toFixed(1), ey.toFixed(1), (rr * 0.38).toFixed(1), '#fff', 'stroke="#2a1450" stroke-width="2"');
      o += c((ex + Math.cos(look) * rr * 0.15).toFixed(1), (ey + Math.sin(look) * rr * 0.15).toFixed(1), (rr * 0.22).toFixed(1), '#15101e');
      o += c((ex + Math.cos(look) * rr * 0.15 - rr * 0.07).toFixed(1), (ey + Math.sin(look) * rr * 0.15 - rr * 0.08).toFixed(1), (rr * 0.07).toFixed(1), '#fff');
    }
    return o;
  },
  icon: function () {
    var S = G['slither'];
    var o = r(0, 0, 400, 400, rg([['#3a2a7a', 0], ['#1c1640', 0.55], ['#0a0b18', 1]], 0.35, 0.3, 0.85));
    o += '<g opacity=".35">' + S.hex(400, 400, 30, 'none', '#251f4a', '#3a3270', 3) + '</g>';
    o += S.orbs(9, 400, 400, 14, 26, 11, ['#ffe030', '#7dff9a', '#ff6fb0', '#60d0ff']);
    var pts = S.path(30, function (u) { return [70 + u * 230, 318 - u * 150 + Math.sin(u * Math.PI * 2) * 62]; });
    var sn = S.snake(pts, 20, 44, ['#a66cff', '#a66cff', '#e6d4ff'], '#3a1680', rg([['#b48cff', 0], ['#b48cff00', 1]]));
    o += sn.svg;
    var h = sn.head, pv = sn.prev, ang = Math.atan2(h[1] - pv[1], h[0] - pv[0]);
    o += c(h[0] + 58, h[1] - 40, 30, rg([['#ffffff', 0], ['#ffe030', 0.25], ['#ffe03055', 0.55], ['#ffe03000', 1]]));
    o += S.eyes(h[0], h[1], h[2], ang, ang - 0.5);
    o += e(118, 88, 150, 60, rg([['#ffffff', 0], ['#ffffff00', 1]]), 'opacity=".16"');
    return o;
  },
  bg: function () {
    var S = G['slither'];
    var o = S.hex(960, 600, 40, '#0a0e13', '#1a212b', '#0a0e13', 7);
    o += S.orbs(70, 960, 600, 10, 22, 21, ['#ffe030', '#7dff9a', '#ff6fb0', '#60d0ff', '#ffa060', '#c080ff']);
    var a = S.path(46, function (u) { return [-40 + u * 520, 520 - Math.sin(u * Math.PI) * 300 + u * 40]; });
    o += S.snake(a, 18, 30, ['#ff8a4a', '#ffd06a'], '#7a2a08').svg;
    var b = S.path(52, function (u) { return [1000 - u * 420, 80 + Math.sin(u * Math.PI * 1.5) * 120 + u * 260]; });
    o += S.snake(b, 16, 34, ['#3cc0ff', '#3cc0ff', '#ffffff'], '#0a3a6a').svg;
    o += d('M760 600 A 700 700 0 0 1 960 330 V600Z', '#4a0612', 'opacity=".7"');
    o += sk('M760 600 A 700 700 0 0 1 960 330', '#ff3550', 8);
    return o;
  }
};
