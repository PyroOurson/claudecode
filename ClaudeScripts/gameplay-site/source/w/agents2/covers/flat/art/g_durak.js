(function () {
  var SUIT = {
    S: 'M0 -34 C-10 -18 -38 -6 -36 12 C-34 26 -16 28 -4 18 L-10 34 L10 34 L4 18 C16 28 34 26 36 12 C38 -6 10 -18 0 -34 Z',
    H: 'M0 32 C-44 4 -42 -28 -20 -32 C-8 -34 0 -26 0 -18 C0 -26 8 -34 20 -32 C42 -28 44 4 0 32 Z',
    D: 'M0 -36 L26 0 L0 36 L-26 0 Z'
  };
  function suit(k, s, col, x2) {
    if (k === 'C') return g('scale(' + s + ')', c(0, -16, 14, col) + c(-16, 6, 14, col) + c(16, 6, 14, col) + p([[-4, 0], [4, 0], [10, 34], [-10, 34]], col), x2);
    return g('scale(' + s + ')', d(SUIT[k], col), x2);
  }
  var LAY = { 7: [[-1, -1], [1, -1], [0, -0.5], [-1, 0], [1, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]], 9: [[-1, -1], [1, -1], [-1, -0.33], [1, -0.33], [0, 0], [-1, 0.33], [1, 0.33], [-1, 1], [1, 1]] };
  function card(x, y, w, h, rot, rk, su, back) {
    var col = su === 'H' || su === 'D' ? '#d3202c' : '#17191f', R = w * 0.1, o = '';
    o += r(-w / 2 + w * 0.06, -h / 2 + h * 0.06, w, h, '#000', R, 'opacity=".32"');
    o += r(-w / 2, -h / 2, w, h, lg(['#ffffff', '#f1efe6']), R) + r(-w / 2, -h / 2, w, h, 'none', R, 'stroke="#bfc3cc" stroke-width="' + w * 0.014 + '"');
    if (back) {
      o += r(-w / 2 + w * 0.07, -h / 2 + w * 0.07, w * 0.86, h - w * 0.14, lg([back, '#0f2a66']), w * 0.06);
      o += r(-w / 2 + w * 0.15, -h / 2 + w * 0.15, w * 0.7, h - w * 0.3, 'none', w * 0.04, 'stroke="#fff" stroke-width="' + w * 0.025 + '" opacity=".6"');
      o += e(0, 0, w * 0.24, h * 0.18, '#1d3a80', 'stroke="#fff" stroke-width="' + w * 0.02 + '"');
      o += g('translate(0,' + (-h * 0.08) + ')', suit('H', w * 0.0022, '#fff')) + g('translate(0,' + (h * 0.08) + ')', suit('D', w * 0.0022, '#fff')) + g('translate(' + (-w * 0.11) + ',0)', suit('C', w * 0.0022, '#fff')) + g('translate(' + (w * 0.11) + ',0)', suit('S', w * 0.0022, '#fff'));
    } else {
      o += t(-w / 2 + w * 0.17, -h / 2 + w * 0.28, rk, w * (rk.length > 1 ? 0.22 : 0.27), col);
      o += g('translate(' + (-w / 2 + w * 0.17) + ',' + (-h / 2 + w * 0.5) + ')', suit(su, w * 0.0021, col));
      o += g('translate(' + (w / 2 - w * 0.17) + ',' + (h / 2 - w * 0.28) + ') rotate(180)', t(0, 0, rk, w * (rk.length > 1 ? 0.22 : 0.27), col) + g('translate(0,' + (w * 0.22) + ')', suit(su, w * 0.0021, col)));
      if (rk === 'A') o += g('translate(0,' + h * 0.03 + ')', suit(su, w * 0.0082, col));
      else (LAY[+rk] || []).forEach(function (q) { o += g('translate(' + (q[0] * w * 0.17 + w * 0.03) + ',' + q[1] * h * 0.29 + ')' + (q[1] > 0 ? ' rotate(180)' : ''), suit(su, w * 0.0029, col)); });
    }
    o += d('M' + (-w / 2 + R) + ' ' + (-h / 2) + ' H' + (w * 0.1) + ' L' + (-w / 2) + ' ' + (-h * 0.12) + ' V' + (-h / 2 + R) + ' Z', '#fff', 'opacity=".3"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function felt(cx, cy, rx, ry) {
    return e(cx, cy, rx, ry, rg([['#3cb36c', 0], ['#1f7a44', 0.6], ['#0b3a20', 1]], 0.45, 0.4, 0.62));
  }
  function cap() {
    var gold = lg(['#fff1a0', '#f2b62c', '#a0650a']), o = '';
    o += g('translate(4,8)', d('M-60 4 C-70 -30 -92 -50 -106 -58 C-80 -62 -48 -44 -22 4 Z M-26 4 C-20 -40 -10 -80 0 -102 C10 -80 20 -40 26 4 Z M60 4 C70 -30 92 -50 106 -58 C80 -62 48 -44 22 4 Z', '#000'), 'opacity=".3"');
    o += d('M-60 4 C-70 -30 -92 -50 -106 -58 C-80 -62 -48 -44 -22 4 Z', lg(['#ff5a4e', '#c3121e', '#7a0810']));
    o += d('M60 4 C70 -30 92 -50 106 -58 C80 -62 48 -44 22 4 Z', lg(['#ff5a4e', '#c3121e', '#7a0810']));
    o += d('M-26 4 C-20 -40 -10 -80 0 -102 C10 -80 20 -40 26 4 Z', lg(['#8a5ad8', '#5a2a9a', '#2e1058']));
    o += d('M-58 -2 C-66 -26 -80 -42 -96 -54 C-78 -50 -62 -36 -50 -14 Z', '#fff', 'opacity=".28"') + d('M-16 -6 C-12 -40 -6 -70 -2 -92 C-4 -64 -6 -36 -6 -6 Z', '#fff', 'opacity=".3"');
    o += r(-66, -6, 132, 24, gold, 11) + r(-60, -4, 120, 7, '#fff', 4, 'opacity=".35"');
    [[-106, -58], [0, -102], [106, -58]].forEach(function (q) { o += c(q[0] + 2, q[1] + 4, 11, '#000', 'opacity=".3"') + c(q[0], q[1], 11, gold) + c(q[0] - 3, q[1] - 4, 4, '#fff', 'opacity=".7"'); });
    return o;
  }
  G['durak'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3fb46e', 0], ['#1d7a43', 0.55], ['#083019', 1]], 0.36, 0.3, 0.9));
      o += rep(9, function (i) { return ln(-40 + i * 60, 0, -240 + i * 60, 400, '#fff', 1.2, 'opacity=".05"'); }) + rep(9, function (i) { return ln(-40 + i * 60, 400, -240 + i * 60, 0, '#000', 1.2, 'opacity=".06"'); });
      o += c(200, 200, 168, 'none', 'stroke="#fff" stroke-width="3" opacity=".09"') + c(200, 200, 180, 'none', 'stroke="#fff" stroke-width="1.5" opacity=".07"');
      o += card(150, 222, 150, 212, -17, '7', 'S');
      o += card(246, 234, 150, 212, 13, 'A', 'H');
      o += g('translate(198,122) rotate(-5) scale(1.0)', cap());
      o += g('translate(322,330)', c(3, 6, 50, '#000', 'opacity=".3"') + c(0, 0, 50, lg(['#fff3a8', '#f0b52a', '#9a6208'])) + c(0, 0, 40, lg(['#fffdf4', '#efe6cf'])) + suit('H', 0.78, '#d3202c', 'transform="translate(0,2)"') + e(-14, -18, 14, 8, '#fff', 'opacity=".55" transform="rotate(-30 -14 -18)"'));
      o += e(110, 70, 150, 70, '#fff', 'opacity=".09" transform="rotate(-28 110 70)"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4a2a14', '#2a160a']));
      o += rep(12, function (i) { return r(0, i * 52, 960, 3, '#000', 0, 'opacity=".18"'); });
      o += e(480, 312, 470, 278, lg(['#8a5a30', '#5a3418'])) + e(480, 306, 448, 256, '#3a2010');
      o += felt(480, 306, 436, 246);
      o += e(480, 306, 300, 160, 'none', 'stroke="#fff" stroke-width="3" opacity=".08"');
      o += card(392, 290, 92, 130, -4, '7', 'S') + card(410, 306, 92, 130, 10, '9', 'S');
      o += card(530, 286, 92, 130, 3, '6', 'D') + card(548, 304, 92, 130, 14, 'A', 'H');
      o += card(186, 300, 92, 130, 90, 'A', 'H') + rep(5, function (k) { return card(150 - k * 2, 300 - k * 2, 92, 130, 0, null, null, '#2f55ab'); });
      o += rep(6, function (k) { return card(790 + (k % 3) * 6, 296 + (k % 2) * 5, 92, 130, -24 + k * 11, null, null, '#2f55ab'); });
      o += rep(6, function (k) { return card(300 + k * 26, 112 + Math.abs(k - 2.5) * 4, 64, 90, (k - 2.5) * 7 + 180, null, null, '#2f55ab'); });
      o += rep(6, function (k) { return card(560 + k * 26, 112 + Math.abs(k - 2.5) * 4, 64, 90, (k - 2.5) * 7 + 180, null, null, '#2f55ab'); });
      o += card(360, 600, 100, 140, -18, '6', 'H') + card(420, 586, 100, 140, -6, 'K', 'C') + card(480, 582, 100, 140, 4, 'A', 'S') + card(540, 588, 100, 140, 14, '9', 'D') + card(600, 602, 100, 140, 24, '7', 'H');
      return o;
    }
  };
})();
