(function () {
  function stone(x, y, R, w) {
    var f = w ? rg([['#ffffff', 0], ['#ecebe6', 0.55], ['#bcb8ae', 1]], 0.36, 0.3, 0.75) : rg([['#5c5f6e', 0], ['#22242c', 0.5], ['#07070a', 1]], 0.36, 0.3, 0.75);
    return e(x + R * 0.1, y + R * 0.22, R, R * 0.92, '#000', 'opacity=".35"') + c(x, y, R, f) + e(x - R * 0.34, y - R * 0.4, R * 0.34, R * 0.2, '#fff', 'opacity="' + (w ? 0.9 : 0.5) + '" transform="rotate(-35 ' + (x - R * 0.34) + ' ' + (y - R * 0.4) + ')"');
  }
  function grid(x0, y0, n, m, s, w, col) {
    var o = '';
    for (var i = 0; i < n; i++) o += ln(x0 + i * s, y0, x0 + i * s, y0 + (m - 1) * s, col, w);
    for (var j = 0; j < m; j++) o += ln(x0, y0 + j * s, x0 + (n - 1) * s, y0 + j * s, col, w);
    return o;
  }
  G['gomoku'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ff7a59', '#e0315a'], 0, 0, 1, 1));
      o += r(30, 38, 340, 340, '#8a1f3a', 28, 'opacity=".5"') + r(30, 30, 340, 340, '#f7e2b0', 28);
      o += grid(50, 50, 7, 7, 50, 4, '#9a6a3a');
      var row = [[100, 300], [150, 250], [200, 200], [250, 150], [300, 100]];
      o += stone(100, 150, 22, 1) + stone(150, 100, 22, 1) + stone(250, 250, 22, 1) + stone(300, 250, 22, 1) + stone(150, 300, 22, 1) + stone(200, 300, 22, 1);
      o += ln(72, 328, 328, 72, '#ffd23f', 40, 'opacity=".55"');
      row.forEach(function (q) { o += stone(q[0], q[1], 24, 0); });
      o += ln(80, 320, 320, 80, '#ff3b4a', 8) + ln(80, 316, 320, 76, '#fff', 2.5, 'opacity=".6"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ff7a59', '#c22a54']));
      o += r(140, 20, 680, 560, '#f7e2b0', 24) + grid(170, 50, 15, 13, 44, 3, '#9a6a3a');
      var q = rnd(11);
      for (var k = 0; k < 30; k++) o += stone(170 + Math.floor(q() * 15) * 44, 50 + Math.floor(q() * 13) * 44, 19, k % 2);
      for (k = 0; k < 5; k++) o += stone(346 + k * 44, 182 + k * 44, 19, 0);
      o += ln(330, 166, 538, 374, '#ff3b4a', 8);
      return o;
    }
  };
})();
