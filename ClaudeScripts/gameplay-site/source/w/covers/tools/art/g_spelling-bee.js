(function () {
  function hexPts(cx, cy, R) { var q = []; for (var i = 0; i < 6; i++) { var a = (60 * i) * Math.PI / 180; q.push([+(cx + R * Math.cos(a)).toFixed(1), +(cy + R * Math.sin(a)).toFixed(1)]); } return q; }
  function cell(cx, cy, R, L, mid) {
    var f = mid ? '#ffd21f' : '#eef0f4', dk = mid ? '#d9a400' : '#b9bfcc';
    return p(hexPts(cx + 3, cy + R * 0.12, R), '#000', 'opacity=".25"') + p(hexPts(cx, cy + R * 0.07, R), dk) + p(hexPts(cx, cy, R), f) + p(hexPts(cx, cy, R).slice(3, 6).concat([[cx + R * 0.5, cy - R * 0.2], [cx - R * 0.5, cy - R * 0.2]]).slice(0, 3), '#fff', 'opacity=".35"') + t(cx, cy + R * 0.32, L, R * 0.9, '#1b1d24', { w: 900 });
  }
  function comb(cx, cy, R, L) {
    var H = R * Math.sqrt(3), o = '', pos = [[0, -H], [1.5 * R, -H / 2], [1.5 * R, H / 2], [0, H], [-1.5 * R, H / 2], [-1.5 * R, -H / 2]];
    pos.forEach(function (q, i) { o += cell(cx + q[0] * 1.07, cy + q[1] * 1.07, R, L[i + 1], 0); });
    return o + cell(cx, cy, R, L[0], 1);
  }
  function bee(x, y, s, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')',
      e(-6, -26, 22, 30, '#e8f6ff', 'opacity=".85" transform="rotate(-25 -6 -26)"') + e(16, -24, 18, 26, '#e8f6ff', 'opacity=".75" transform="rotate(20 16 -24)"') +
      p([[-46, 4], [-62, 0], [-46, -4]], '#1b1d24') + e(0, 0, 46, 34, '#ffd21f') + r(-22, -32, 12, 64, '#1b1d24', 4) + r(4, -33, 12, 66, '#1b1d24', 4) + e(-14, -16, 18, 8, '#fff', 'opacity=".5"') +
      c(46, -6, 22, '#1b1d24') + c(52, -12, 7, '#fff') + c(54, -12, 3.5, '#1b1d24') + sk('M40 -26 C38 -42 46 -50 52 -52', '#1b1d24', 4) + c(52, -52, 4, '#1b1d24') + sk('M50 -24 C54 -38 64 -42 70 -42', '#1b1d24', 4) + c(70, -42, 4, '#1b1d24'));
  }
  G['spelling-bee'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#7fd0ff', '#3a8ff0'], 0, 0, 1, 1));
      o += rep(6, function (i) { return c(60 + i * 70, 360 - (i % 2) * 40, 40 + (i % 3) * 10, '#fff', 'opacity=".12"'); });
      o += comb(196, 214, 58, 'GALPNIE');
      o += bee(316, 74, 1.0, -12) + sk('M262 120 C230 150 270 170 240 190', '#fff', 5, 'stroke-dasharray="2 12" opacity=".85"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ffcf3a', '#f29400'])), R = 70, H = R * Math.sqrt(3);
      for (var i = -1; i < 10; i++) for (var j = -1; j < 5; j++) { var cx = i * 1.5 * R, cy = j * H + (i % 2 ? H / 2 : 0); o += p(hexPts(cx, cy, R * 0.94), (i + j) % 3 ? '#ffd968' : '#f7b52a', 'stroke="#d98600" stroke-width="6"'); }
      o += comb(480, 300, 70, 'TBRAOWS') + bee(160, 140, 1.4, -10) + bee(820, 460, 1.2, 14);
      return o;
    }
  };
})();
