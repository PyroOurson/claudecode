(function () {
  var GEMS = ['#ff4d6d', '#3d8bfd', '#2bd47a', '#ffd23f', '#b45cff', '#25d0e8', '#ff8a3d'];
  function gem(x, y, R, f) { return e(x + R * 0.15, y + R * 0.25, R, R * 0.8, '#000', 'opacity=".3"') + c(x, y, R, f) + c(x + R * 0.2, y + R * 0.2, R * 0.7, '#000', 'opacity=".15"') + e(x - R * 0.35, y - R * 0.38, R * 0.36, R * 0.24, '#fff', 'opacity=".85" transform="rotate(-35 ' + (x - R * 0.35) + ' ' + (y - R * 0.38) + ')"'); }
  function pit(x, y, rx, ry, n, seed) {
    var q = rnd(seed), o = e(x, y + ry * 0.05, rx * 1.04, ry * 1.04, '#f0b878', 'opacity=".6"') + e(x, y, rx, ry, rg([['#4a2208', 0], ['#6b3615', 0.7], ['#8a4a20', 1]], 0.5, 0.35, 0.65));
    var R = Math.min(rx, ry) * 0.3, a0 = q() * 6.28;
    for (var i = 0; i < n; i++) { var a = a0 + i * 6.28 / Math.max(1, n - 1), k = i === n - 1 ? 0 : 0.44; o += gem(x + Math.cos(a) * rx * k, y + 4 + Math.sin(a) * ry * k, R, GEMS[Math.floor(q() * 7)]); }
    return o;
  }
  function boardShape(x, y, w, h, rr) {
    return r(x + 6, y + 14, w, h, '#000', rr, 'opacity=".3"') + r(x, y + 10, w, h, '#7a3d14', rr) + r(x, y, w, h, lg(['#e3a35e', '#c47a36']), rr) + r(x + 10, y + 6, w - 20, h * 0.18, '#fff', rr * 0.6, 'opacity=".18"');
  }
  G['mancala'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2fd1c0', '#118a8f'], 0, 0, 1, 1)), b = '';
      b += boardShape(-70, 72, 540, 256, 128);
      b += pit(-12, 200, 54, 104, 9, 21) + pit(412, 200, 54, 104, 7, 23);
      for (var k = 0; k < 4; k++) b += pit(80 + k * 80, 144, 36, 36, 3 + (k % 2), 40 + k) + pit(80 + k * 80, 256, 36, 36, 4 - (k % 2), 50 + k);
      o += g('rotate(-28 200 200)', b);
      o += gem(316, 346, 24, '#ffd23f') + gem(76, 64, 20, '#ff4d6d');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#1fb5a8', '#0d6b70']));
      o += boardShape(40, 110, 880, 380, 150);
      o += pit(140, 300, 70, 150, 14, 2) + pit(820, 300, 70, 150, 11, 4);
      for (var i = 0; i < 6; i++) o += pit(250 + i * 92, 220, 40, 40, 4, 10 + i) + pit(250 + i * 92, 380, 40, 40, 3 + (i % 3), 30 + i);
      o += gem(100, 60, 30, '#ff4d6d') + gem(860, 560, 30, '#3d8bfd') + gem(800, 60, 24, '#ffd23f');
      return o;
    }
  };
})();
