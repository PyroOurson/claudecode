(function () {
  function stone(x, y, R, k) {
    var f = k ? '#f4f1ea' : '#e8322c', dd = k ? '#a9a39a' : '#8e1512';
    return e(x + R * 0.1, y + R * 0.3, R, R * 0.9, '#000', 'opacity=".35"') + c(x, y + R * 0.12, R, dd) + c(x, y, R, f) + c(x, y, R * 0.7, 'none', 'stroke="' + dd + '" stroke-width="' + R * 0.08 + '" opacity=".5"') + e(x - R * 0.36, y - R * 0.4, R * 0.34, R * 0.2, '#fff', 'opacity=".85" transform="rotate(-35 ' + (x - R * 0.36) + ' ' + (y - R * 0.4) + ')"');
  }
  function morris(cx, cy, s, col, w) {
    var o = '';
    [3, 2, 1].forEach(function (k) { o += r(cx - k * s, cy - k * s, 2 * k * s, 2 * k * s, 'none', 0, 'stroke="' + col + '" stroke-width="' + w + '"'); });
    o += ln(cx, cy - 3 * s, cx, cy - s, col, w) + ln(cx, cy + s, cx, cy + 3 * s, col, w) + ln(cx - 3 * s, cy, cx - s, cy, col, w) + ln(cx + s, cy, cx + 3 * s, cy, col, w);
    [3, 2, 1].forEach(function (k) { [-1, 0, 1].forEach(function (a) { [-1, 0, 1].forEach(function (b) { if (a || b) o += c(cx + a * k * s, cy + b * k * s, w * 1.3, col); }); }); });
    return o;
  }
  G['nine-mens-morris'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2e3a66', '#151b38'], 0, 0, 1, 1));
      o += rep(6, function (i) { return ln(-50 + i * 90, 0, 40 + i * 90, 400, '#fff', 14, 'opacity=".03"'); });
      var s = 50, cx = 200, cy = 200;
      o += morris(cx, cy, s, '#e9b949', 9);
      o += ln(cx - 3 * s, cy - 3 * s, cx + 3 * s, cy - 3 * s, '#ffe58a', 22, 'opacity=".55"');
      o += stone(cx - 3 * s, cy - 3 * s, 30, 1) + stone(cx, cy - 3 * s, 30, 1) + stone(cx + 3 * s, cy - 3 * s, 30, 1);
      o += stone(cx - 2 * s, cy, 30, 0) + stone(cx + s, cy + s, 30, 0) + stone(cx, cy + 3 * s, 30, 0) + stone(cx + 3 * s, cy, 30, 1) + stone(cx - s, cy + s, 30, 1);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#28335c', '#121732']));
      o += morris(480, 300, 92, '#e9b949', 10);
      [[-3, -3, 1], [0, -3, 1], [3, -3, 1], [-2, 0, 0], [-1, 1, 0], [2, 2, 0], [0, 2, 1], [3, 0, 0], [-3, 3, 0], [1, -1, 1]].forEach(function (q) { o += stone(480 + q[0] * 92, 300 + q[1] * 92, 38, q[2]); });
      o += stone(80, 120, 40, 1) + stone(130, 200, 40, 1) + stone(70, 290, 40, 1) + stone(880, 380, 40, 0) + stone(830, 460, 40, 0) + stone(890, 540, 40, 0);
      return o;
    }
  };
})();
