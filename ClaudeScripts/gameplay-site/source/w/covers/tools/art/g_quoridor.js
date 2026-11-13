(function () {
  function sq(x, y, s) { return r(x, y, s, s, '#7a4a26', s * 0.08) + r(x + s * 0.06, y + s * 0.06, s * 0.88, s * 0.88, lg(['#a8703e', '#8a5630']), s * 0.06) + r(x + s * 0.12, y + s * 0.1, s * 0.5, s * 0.1, '#fff', s * 0.05, 'opacity=".14"'); }
  function wallH(x, y, L, w) { return r(x + 4, y - w / 2 + 10, L, w, '#000', w * 0.3, 'opacity=".35"') + r(x, y - w / 2 + 6, L, w, '#b8894a', w * 0.3) + r(x, y - w / 2, L, w, '#f4d79d', w * 0.3) + r(x + w * 0.3, y - w * 0.32, L - w * 0.6, w * 0.22, '#fff', w * 0.1, 'opacity=".6"'); }
  function wallV(x, y, L, w) { return r(x - w / 2 + 4, y + 10, w, L, '#000', w * 0.3, 'opacity=".35"') + r(x - w / 2, y + 6, w, L, '#b8894a', w * 0.3) + r(x - w / 2, y, w, L, '#f4d79d', w * 0.3) + r(x - w * 0.32, y + w * 0.3, w * 0.22, L - w * 0.6, '#fff', w * 0.1, 'opacity=".6"'); }
  function pawn(x, y, s, f, dd) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(4, 8, 40, 14, '#000', 'opacity=".35"') + e(0, 0, 36, 13, dd) + r(-36, -60, 72, 60, f) + e(0, -60, 36, 13, f) + d('M10 -60 L36 -60 L36 0 A36 13 0 0 1 10 12 Z', dd, 'opacity=".5"') + c(0, -92, 30, f) + d('M12 -118 A30 30 0 0 1 12 -66 A34 34 0 0 0 12 -118 Z', dd, 'opacity=".5"') + e(-11, -104, 8, 12, '#fff', 'opacity=".75" transform="rotate(-25 -11 -104)"') + r(-28, -54, 8, 46, '#fff', 4, 'opacity=".35"'));
  }
  function board(x0, y0, n, m, s, gap) { var o = ''; for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) o += sq(x0 + i * (s + gap), y0 + j * (s + gap), s); return o; }
  G['quoridor'] = {
    icon: function () {
      var s = 66, gp = 16, st = s + gp, x0 = -24, y0 = -24;
      var o = r(0, 0, 400, 400, '#3a1f0c') + board(x0, y0, 6, 6, s, gp);
      var gx = function (i) { return x0 + i * st - gp / 2; };
      o += wallV(gx(4), gx(0) + gp / 2, 2 * st - gp, 24) + wallH(gx(2) + gp / 2, gx(3), 2 * st - gp, 24) + wallV(gx(2), gx(3) + gp / 2, 2 * st - gp, 24) + wallH(gx(3) + gp / 2, gx(5), 2 * st - gp, 24);
      o += pawn(x0 + 3 * st + s / 2, y0 + 2 * st + s * 0.78, 1.2, '#2d7cf0', '#1650b0') + pawn(x0 + 1 * st + s / 2, y0 + 4 * st + s * 0.78, 1.2, '#ef3b36', '#a8201c');
      return o;
    },
    bg: function () {
      var s = 56, gp = 14, st = s + gp, x0 = 165, y0 = -20;
      var o = r(0, 0, 960, 600, '#2e180a') + board(x0, y0, 9, 9, s, gp);
      var X = function (i) { return x0 + i * st - gp / 2; }, Y = function (j) { return y0 + j * st - gp / 2; };
      [[1, 3], [4, 5], [6, 2], [2, 7]].forEach(function (w) { o += wallH(X(w[0]) + gp / 2, Y(w[1]), 2 * st - gp, 16); });
      [[3, 1], [6, 6], [8, 4]].forEach(function (w) { o += wallV(X(w[0]), Y(w[1]) + gp / 2, 2 * st - gp, 16); });
      o += pawn(x0 + 4 * st + s / 2, y0 + 6 * st + s * 0.8, 0.8, '#ef3b36', '#a8201c') + pawn(x0 + 4 * st + s / 2, y0 + 2 * st + s * 0.8, 0.8, '#2d7cf0', '#1650b0');
      o += rep(5, function (i) { return wallV(60 + i * 18, 120, 2 * st - gp, 14) + wallV(840 + i * 18, 320, 2 * st - gp, 14); });
      return o;
    }
  };
})();
