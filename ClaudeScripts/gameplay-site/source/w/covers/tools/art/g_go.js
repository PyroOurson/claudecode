(function () {
  function stone(x, y, R, w) {
    var f = w ? rg([['#ffffff', 0], ['#eceae4', 0.55], ['#bdb9b0', 1]], 0.36, 0.3, 0.75) : rg([['#6a6a72', 0], ['#26262c', 0.5], ['#08080a', 1]], 0.36, 0.3, 0.75);
    return e(x + R * 0.12, y + R * 0.22, R * 1.02, R * 0.95, '#000', 'opacity=".38"') + c(x, y, R, f) + e(x - R * 0.34, y - R * 0.4, R * 0.36, R * 0.22, '#fff', 'opacity="' + (w ? 0.9 : 0.45) + '" transform="rotate(-35 ' + (x - R * 0.34) + ' ' + (y - R * 0.4) + ')"');
  }
  function grid(x0, y0, n, m, s, w) {
    var o = '';
    for (var i = 0; i < n; i++) o += ln(x0 + i * s, y0, x0 + i * s, y0 + (m - 1) * s, '#2a1a08', w);
    for (var j = 0; j < m; j++) o += ln(x0, y0 + j * s, x0 + (n - 1) * s, y0 + j * s, '#2a1a08', w);
    return o;
  }
  function bowl(x, y, R, w) {
    return e(x + 10, y + R * 0.7, R * 1.05, R * 0.3, '#000', 'opacity=".3"') + e(x, y, R, R * 0.62, '#6b3a17') + e(x, y - R * 0.1, R * 0.92, R * 0.48, '#3a1e0a') + stone(x - R * 0.3, y - R * 0.12, R * 0.3, w) + stone(x + R * 0.25, y - R * 0.18, R * 0.3, w) + stone(x, y + R * 0.05, R * 0.3, w) + e(x - R * 0.5, y + R * 0.3, R * 0.3, R * 0.1, '#fff', 'opacity=".15"');
  }
  G['go'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#f0c878', '#d49a4a'], 0, 0, 1, 1));
      o += rep(9, function (i) { return sk('M0 ' + (20 + i * 46) + ' C120 ' + (8 + i * 46) + ' 260 ' + (36 + i * 46) + ' 400 ' + (18 + i * 46), '#b07a34', 3, 'opacity=".35"'); });
      var S = 80, X = function (k) { return 40 + k * S; };
      o += rep(5, function (k) { return ln(X(k), -10, X(k), 410, '#2a1a08', 5) + ln(-10, X(k), 410, X(k), '#2a1a08', 5); }) + c(X(1), X(1), 9, '#2a1a08') + c(X(3), X(1), 9, '#2a1a08') + c(X(1), X(3), 9, '#2a1a08');
      [[1, 2], [2, 1], [3, 2], [0, 3]].forEach(function (q) { o += stone(X(q[0]), X(q[1]), 37, 0); });
      [[2, 2], [3, 1], [1, 3], [3, 3], [4, 2]].forEach(function (q) { o += stone(X(q[0]), X(q[1]), 37, 1); });
      o += e(X(2) + 4, X(3) + 8, 34, 30, '#000', 'opacity=".3"') + stone(X(2) - 10, X(3) - 22, 40, 0);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#e8bb6a', '#c98d3e'])), q = rnd(5);
      o += grid(30, 30, 15, 10, 60, 4);
      [[3, 3], [11, 3], [3, 7], [11, 7], [7, 5]].forEach(function (s) { o += c(30 + s[0] * 60, 30 + s[1] * 60, 8, '#2a1a08'); });
      for (var k = 0; k < 46; k++) { var i = Math.floor(q() * 15), j = Math.floor(q() * 10); o += stone(30 + i * 60, 30 + j * 60, 27, k % 2); }
      o += bowl(110, 520, 95, 0) + bowl(860, 90, 95, 1);
      return o;
    }
  };
})();
