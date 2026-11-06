(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function bloon(x, y, s, col, dk) {
    var o = e(6, 10, 40, 50, '#000', 'opacity=".25"') + e(0, 0, 40, 50, dk) + e(-3, -3, 36, 46, col) + p([[-8, 48], [8, 48], [0, 40]], dk) + p([[-9, 56], [9, 56], [0, 46]], dk);
    o += e(-14, -20, 9, 16, '#fff', 'opacity=".6" transform="rotate(25 -14 -20)"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function dart(x, y, s, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', r(-30, -3, 50, 6, '#6a4a2a', 3) + p([[20, -6], [40, 0], [20, 6]], '#c8ccd8') + p([[-30, -3], [-44, -12], [-38, 0], [-44, 12], [-30, 3]], '#e8233a'));
  }
  function monkey(x, y, s) {
    var B = '#8a5228', T = '#f2c896';
    var o = e(0, 140, 80, 14, '#000', 'opacity=".3"');
    o += d('M-60 140 C-66 80 -40 56 0 56 C40 56 66 80 60 140 Z', B) + e(0, 104, 34, 36, T);
    o += sk('M40 76 C70 50 84 10 92 -20', B, 26) + c(94, -24, 16, T);
    o += c(-82, -6, 30, B) + c(-82, -6, 18, T) + c(82, -6, 30, B) + c(82, -6, 18, T);
    o += c(0, 0, 76, B) + d('M-50 -6 C-56 -50 -10 -50 0 -24 C10 -50 56 -50 50 -6 C60 30 30 60 0 60 C-30 60 -60 30 -50 -6 Z', T);
    o += e(-22, -12, 11, 14, '#1b1d24') + e(22, -12, 11, 14, '#1b1d24') + c(-19, -16, 4, '#fff') + c(25, -16, 4, '#fff');
    o += e(-8, 16, 4, 3, '#5a3418') + e(8, 16, 4, 3, '#5a3418') + d('M-22 28 Q0 50 22 28 Z', '#7a2a1a');
    o += e(-34, -44, 20, 10, '#fff', 'opacity=".25" transform="rotate(-30 -34 -44)"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['bloons-td'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#8ad84a', 0], ['#4aa82a', 0.6], ['#2a7a1a', 1]], 0.4, 0.3, 0.85));
      o += sk('M-20 90 C120 70 160 160 240 150 C330 140 340 60 420 70', '#b8823a', 74) + sk('M-20 90 C120 70 160 160 240 150 C330 140 340 60 420 70', '#e0b066', 60);
      o += bloon(56, 70, 0.8, '#2f8cff', '#1a5ac0') + bloon(140, 104, 0.8, '#3ac84a', '#1a8a2a') + bloon(340, 76, 0.9, '#ffd23a', '#c49a00');
      o += star(262, 136, 52, 22, 10, '#fff') + star(262, 136, 34, 14, 10, '#ffe23a') + bloon(262, 140, 0.95, '#ff3a3a', '#b8141e');
      o += dart(220, 204, 1.2, -40);
      o += monkey(150, 274, 0.9);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#5ab83a');
      o += sk('M-40 120 C200 80 260 300 480 280 C700 260 720 480 1000 460', '#b8823a', 110) + sk('M-40 120 C200 80 260 300 480 280 C700 260 720 480 1000 460', '#e0b066', 90);
      o += e(780, 140, 120, 70, '#3a9ae8') + e(160, 460, 110, 60, '#3a9ae8');
      [[100, 110, '#ff3a3a', '#b8141e'], [200, 130, '#2f8cff', '#1a5ac0'], [300, 200, '#3ac84a', '#1a8a2a'], [420, 270, '#ffd23a', '#c49a00'], [560, 280, '#ff3a3a', '#b8141e'], [680, 340, '#ff8ad8', '#b8509a']].forEach(function (q) { o += bloon(q[0], q[1], 0.9, q[2], q[3]); });
      o += monkey(420, 440, 0.7) + monkey(640, 160, 0.6) + monkey(860, 300, 0.6);
      return o;
    }
  };
})();
