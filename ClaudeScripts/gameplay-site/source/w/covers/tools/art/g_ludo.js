(function () {
  var COL = { R: ['#ef3b36', '#a8201c'], G: ['#22b34c', '#137a31'], Y: ['#ffcc1a', '#c48f00'], B: ['#2d7cf0', '#1650b0'] };
  function pawn(x, y, s, k) {
    var f = COL[k][0], dd = COL[k][1];
    return g('translate(' + x + ',' + y + ') scale(' + s + ')',
      e(0, 6, 54, 16, '#000', 'opacity=".28"') + e(0, 0, 48, 17, dd) + e(0, -8, 48, 17, f) +
      d('M-36 -10 C-32 -54 -14 -74 -15 -96 L15 -96 C14 -74 32 -54 36 -10 Z', f) +
      d('M6 -96 L15 -96 C14 -74 32 -54 36 -10 C26 -4 14 -2 4 -2 C18 -30 14 -70 6 -96 Z', dd, 'opacity=".55"') +
      e(0, -98, 26, 9, dd) + c(0, -126, 32, f) + d('M14 -152 A32 32 0 0 1 14 -100 A36 36 0 0 0 14 -152 Z', dd, 'opacity=".5"') +
      e(-12, -138, 10, 14, '#fff', 'opacity=".75" transform="rotate(-25 -12 -138)"') + sk('M-24 -20 C-20 -50 -10 -66 -9 -86', '#fff', 6, 'opacity=".45"'));
  }
  function die(x, y, s, n, rot) {
    var P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')',
      r(-50, -42, 100, 100, '#000', 22, 'opacity=".25"') + r(-50, -50, 100, 100, '#c9ccd6', 22) + r(-50, -54, 100, 96, '#fff', 22) + r(-40, -48, 60, 24, '#fff', 12, 'opacity=".9"') +
      P[n].map(function (q) { return c(q[0] * 24, q[1] * 24 - 4, 10, '#22252e'); }).join(''));
  }
  function board(x0, y0, s, pawns) {
    var o = r(x0, y0, 15 * s, 15 * s, '#fff');
    var homes = [['R', 0, 0], ['G', 9, 0], ['Y', 9, 9], ['B', 0, 9]];
    homes.forEach(function (h) { var f = COL[h[0]][0], hx = x0 + h[1] * s, hy = y0 + h[2] * s; o += r(hx, hy, 6 * s, 6 * s, f) + r(hx + s, hy + s, 4 * s, 4 * s, '#fff', s * 0.4); [[2, 2], [4, 2], [2, 4], [4, 4]].forEach(function (q) { o += c(hx + q[0] * s, hy + q[1] * s, s * 0.62, f); }); });
    for (var i = 0; i < 15; i++) for (var j = 0; j < 15; j++) {
      var arm = (i >= 6 && i <= 8) !== (j >= 6 && j <= 8);
      if (!arm) continue;
      var f = '#fff';
      if (i === 7 && j >= 1 && j <= 5) f = COL.G[0];
      if (i === 7 && j >= 9 && j <= 13) f = COL.B[0];
      if (j === 7 && i >= 1 && i <= 5) f = COL.R[0];
      if (j === 7 && i >= 9 && i <= 13) f = COL.Y[0];
      if (i === 1 && j === 6) f = COL.R[0];
      if (i === 8 && j === 1) f = COL.G[0];
      if (i === 13 && j === 8) f = COL.Y[0];
      if (i === 6 && j === 13) f = COL.B[0];
      o += r(x0 + i * s, y0 + j * s, s, s, f, 0, 'stroke="#2a2f3a" stroke-width="' + (s * 0.06).toFixed(1) + '"');
    }
    var cx = x0 + 7.5 * s, cy = y0 + 7.5 * s, a = x0 + 6 * s, b = x0 + 9 * s, u = y0 + 6 * s, v = y0 + 9 * s;
    o += p([[a, u], [b, u], [cx, cy]], COL.G[0]) + p([[b, u], [b, v], [cx, cy]], COL.Y[0]) + p([[a, v], [b, v], [cx, cy]], COL.B[0]) + p([[a, u], [a, v], [cx, cy]], COL.R[0]);
    o += r(x0, y0, 15 * s, 15 * s, 'none', 0, 'stroke="#2a2f3a" stroke-width="' + (s * 0.12).toFixed(1) + '"');
    (pawns || []).forEach(function (q) { o += pawn(x0 + q[0] * s, y0 + q[1] * s, s / 70, q[2]); });
    return o;
  }
  G['ludo'] = {
    icon: function () {
      var s = 400 / 9, o = '';
      o += g('translate(' + (-3 * s) + ',' + (-3 * s) + ')', board(0, 0, s));
      o += r(0, 0, 400, 400, lg([['#fff', 0], ['#fff', 0.5], ['#000', 1]], 0, 0, 1, 1), 0, 'opacity=".12"');
      o += pawn(200, 300, 1.25, 'R') + die(318, 318, 0.9, 6, 14);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2b5aa8', '#16306a']));
      o += r(170, -10, 620, 620, '#0d1d44', 30) + board(180, 0, 40, [[2, 2, 'R'], [4, 4, 'R'], [11, 2, 'G'], [8.5, 3.5, 'G'], [13, 11, 'Y'], [11, 13, 'Y'], [2, 13, 'B'], [6.5, 9.5, 'B']]);
      o += die(90, 470, 1.2, 5, -16) + die(870, 140, 1.1, 3, 18) + pawn(860, 520, 1.1, 'Y') + pawn(100, 220, 1.1, 'G');
      return o;
    }
  };
})();
