(function () {
  function chk(x, y, R, light) {
    var f = light ? '#f6efe0' : '#2a2a30', dd = light ? '#b9ab90' : '#0e0e12', rim = light ? '#d8ccb2' : '#45454f';
    return e(x, y + R * 0.18, R, R * 0.98, dd) + c(x, y, R, f) + c(x, y, R * 0.72, 'none', 'stroke="' + rim + '" stroke-width="' + R * 0.09 + '"') + e(x - R * 0.35, y - R * 0.42, R * 0.34, R * 0.18, '#fff', 'opacity="' + (light ? 0.9 : 0.35) + '" transform="rotate(-30 ' + (x - R * 0.35) + ' ' + (y - R * 0.42) + ')"');
  }
  function die(x, y, s, n, rot) {
    var P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', r(-50, -42, 100, 100, '#000', 20, 'opacity=".3"') + r(-50, -50, 100, 100, '#9e1616', 20) + r(-50, -54, 100, 96, '#e32b2b', 20) + r(-40, -48, 60, 22, '#fff', 11, 'opacity=".25"') + P[n].map(function (q) { return c(q[0] * 24, q[1] * 24 - 4, 10, '#fff'); }).join(''));
  }
  function points(x0, y0, w, h, n, up, first) {
    var o = '';
    for (var i = 0; i < n; i++) { var x = x0 + i * w, f = (i + first) % 2 ? '#1d6b46' : '#c8352b'; o += up ? p([[x + 3, y0], [x + w - 3, y0], [x + w / 2, y0 - h]], f) : p([[x + 3, y0], [x + w - 3, y0], [x + w / 2, y0 + h]], f); }
    return o;
  }
  G['backgammon'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#6b3a1c') + r(20, 20, 360, 360, '#e9d6ae', 18) + r(20, 20, 360, 360, 'none', 18, 'stroke="#4a260f" stroke-width="6"');
      o += points(20, 20, 60, 160, 6, false, 0) + points(20, 380, 60, 160, 6, true, 1);
      [[50, 1, 4], [170, 0, 2], [290, 1, 3], [350, 0, 1]].forEach(function (q) { for (var k = 0; k < q[2]; k++) o += chk(q[0], 52 + k * 52, 27, q[1]); });
      [[50, 0, 3], [230, 1, 2], [350, 0, 4]].forEach(function (q) { for (var k = 0; k < q[2]; k++) o += chk(q[0], 348 - k * 52, 27, q[1]); });
      o += die(160, 205, 0.82, 6, -14) + die(255, 210, 0.82, 4, 12);
      o += r(20, 20, 360, 180, lg([['#fff', 0], ['#fff', 1]]), 18, 'opacity=".06"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#5a2f16') + r(40, 30, 420, 540, '#e9d6ae', 10) + r(500, 30, 420, 540, '#e9d6ae', 10) + r(460, 0, 40, 600, '#3e1f0c');
      o += points(40, 30, 70, 230, 6, false, 0) + points(500, 30, 70, 230, 6, false, 0) + points(40, 570, 70, 230, 6, true, 1) + points(500, 570, 70, 230, 6, true, 1);
      [[75, 1, 5], [355, 0, 3], [535, 0, 5], [815, 1, 2]].forEach(function (q) { for (var k = 0; k < q[2]; k++) o += chk(q[0], 64 + k * 62, 31, q[1]); });
      [[75, 0, 2], [215, 1, 3], [605, 0, 4], [885, 1, 5]].forEach(function (q) { for (var k = 0; k < q[2]; k++) o += chk(q[0], 536 - k * 62, 31, q[1]); });
      o += chk(480, 250, 30, 1) + chk(480, 350, 30, 0) + die(650, 300, 1, 5, -20) + die(760, 290, 1, 2, 14);
      return o;
    }
  };
})();
