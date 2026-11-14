(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity=".03"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function house(x, y, s, body, lit) {
    var o = p([[-120, -20], [0, -110], [120, -20]], body) + r(-104, -24, 208, 150, body) + r(56, -110, 26, 60, body);
    o += p([[-160, 40], [-104, -4], [-104, 126], [-160, 126]], body) + p([[-170, 46], [-104, -10], [-98, -4], [-160, 52]], body);
    var win = function (wx, wy, on) { return r(wx, wy, 34, 42, on ? lit : '#1a1430', 3) + (on ? r(wx - 6, wy - 6, 46, 54, lit, 6, 'opacity=".25"') : '') + r(wx + 15, wy, 4, 42, body) + r(wx, wy + 19, 34, 4, body) + sk('M' + (wx - 2) + ' ' + (wy + 6) + ' L' + (wx + 36) + ' ' + (wy + 30), '#4a3424', 6) + sk('M' + (wx - 2) + ' ' + (wy + 32) + ' L' + (wx + 36) + ' ' + (wy + 14), '#4a3424', 6); };
    o += win(-78, -4, true) + win(44, -4, false) + win(-78, 64, false) + win(44, 64, true);
    o += r(-16, 70, 32, 56, '#1a1430', 3) + c(10, 100, 3, lit);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function keeper(x, y, s) {
    var COAT = '#1b1720', SKIN = '#e9e1cf', SK2 = '#c4baa6';
    var o = d('M-118 210 C-110 110 -70 80 0 76 C70 80 110 110 118 210 Z', COAT);
    o += d('M-42 80 L0 140 L42 80 C30 74 -30 74 -42 80 Z', '#2c2430');
    o += d('M-20 78 L0 104 L20 78 Z', '#3a2a24');
    o += e(0, -8, 62, 84, SK2) + e(-3, -12, 58, 80, SKIN);
    o += e(-26, -18, 17, 13, '#0a0810') + e(26, -18, 17, 13, '#0a0810') + c(-24, -17, 3.2, '#ffe9b8') + c(28, -17, 3.2, '#ffe9b8');
    o += sk('M-44 -34 Q-26 -44 -10 -34', '#9a8e7a', 3) + sk('M10 -34 Q26 -44 44 -34', '#9a8e7a', 3);
    o += e(0, 14, 6, 9, '#b8ae98') + sk('M-22 46 Q0 51 22 45', '#4a3e3a', 3.5);
    o += e(0, -78, 112, 20, '#100c14') + d('M-62 -80 C-60 -150 60 -150 62 -80 Z', '#100c14') + r(-60, -98, 120, 12, '#3a2620');
    o += sk('M-34 -126 C-20 -140 18 -142 36 -128', '#2a2230', 4);
        o += d('M60 210 C58 170 50 140 34 124 C26 116 18 120 20 130 C30 150 34 180 30 210 Z', COAT);
    o += e(10, 112, 27, 24, SK2) + e(8, 110, 25, 22, SKIN);
    o += r(-6, 26, 13, 82, SK2, 6.5) + r(-7, 24, 12, 82, SKIN, 6) + e(-1, 30, 4, 3, '#d8ccb6');
    o += r(10, 90, 22, 11, SKIN, 5.5) + r(12, 101, 22, 11, SKIN, 5.5) + r(12, 112, 20, 10, SKIN, 5);
    o += sk('M12 96 L30 96 M14 107 L32 107', SK2, 1.5);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function lantern(x, y, s) {
    var o = c(0, 26, 64, '#ffb050', 'opacity=".22"') + c(0, 26, 40, '#ffc870', 'opacity=".35"');
    o += sk('M-14 -26 Q0 -44 14 -26', '#3a2e1c', 4) + r(-22, -24, 44, 8, '#8a6a32', 2) + r(-18, -16, 36, 56, '#ffd88a', 4) + r(-18, -16, 36, 56, rg([['#fff4c8', 0], ['#ffb04a', 1]]), 4);
    o += r(-20, -16, 4, 56, '#6a5226') + r(16, -16, 4, 56, '#6a5226') + r(-1, -16, 3, 56, '#6a5226', 0, 'opacity=".7"') + r(-24, 40, 48, 8, '#8a6a32', 2);
    o += e(0, 18, 5, 9, '#fff8e0');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['the-quiet-house'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#5e4290', 0], ['#2e2056', 0.55], ['#120c24', 1]], 0.62, 0.22, 0.9));
      o += c(318, 78, 74, '#f4ecd0', 'opacity=".1"') + c(318, 78, 50, '#f2ead0', 'opacity=".2"') + c(318, 78, 38, '#f6efd8') + c(306, 70, 7, '#e2d8bc') + c(330, 92, 5, '#e2d8bc');
      o += house(300, 258, 0.62, '#120c1e', '#ffc564');
      o += r(0, 330, 400, 70, '#0e0a16');
      o += keeper(168, 196, 1.02);
      o += lantern(64, 300, 1.0);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2c2048', '#140e24']));
      o += c(760, 120, 90, '#f4ecd0', 'opacity=".1"') + c(760, 120, 46, '#d8d0b8');
      var R = rnd(11);
      o += rep(14, function (i) { var x = i * 74 - 20 + R() * 30, h = 160 + R() * 160; return p([[x, 600 - h - 120], [x + 48, 480], [x - 48, 480]], '#0c0a14'); });
      o += house(480, 370, 1.5, '#0e0a18', '#ffbe5a');
      o += r(0, 480, 960, 120, '#0a0812');
      o += lantern(250, 470, 1.6) + c(250, 500, 130, '#ffb050', 'opacity=".12"');
      return o;
    }
  };
})();
