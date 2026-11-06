(function () {
  function plan(w, h, s, col) {
    var o = '';
    for (var i = 0; i * s < w; i++) for (var j = 0; j * s < h; j++) o += r(i * s, j * s, s, s, (i + j) % 2 ? '#e9d4a0' : '#f2e1b4');
    var rooms = [[0, 0, 5, 4, '#b98ad6'], [7, 0, 4, 5, '#8fbfe6'], [13, 0, 6, 4, '#e6a08f'], [0, 6, 4, 5, '#9ed69a'], [14, 6, 5, 6, '#e6cf7a'], [0, 13, 6, 5, '#d69ac0'], [8, 13, 5, 5, '#a0c8b0'], [15, 14, 5, 4, '#c8a37a']];
    rooms.forEach(function (q) { o += r(q[0] * s, q[1] * s, q[2] * s, q[3] * s, q[4]) + r(q[0] * s, q[1] * s, q[2] * s, q[3] * s, 'none', 0, 'stroke="' + col + '" stroke-width="' + s * 0.18 + '"'); });
    o += r(6 * s, 6 * s, 7 * s, 6 * s, '#5a2a3a') + r(6 * s, 6 * s, 7 * s, 6 * s, 'none', 0, 'stroke="' + col + '" stroke-width="' + s * 0.18 + '"');
    return o;
  }
  function candle(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(0, 0, 46, 12, '#000', 'opacity=".3"') + e(0, -6, 42, 12, '#b07a10') + e(0, -12, 42, 12, '#ffcf3f') + d('M-10 -14 C-8 -40 -16 -60 -6 -90 L6 -90 C16 -60 8 -40 10 -14 Z', '#e8a810') + d('M2 -14 C6 -40 0 -60 6 -90 L6 -90 C16 -60 8 -40 10 -14 Z', '#b07a10', 'opacity=".6"') + e(0, -92, 22, 7, '#ffcf3f') + r(-9, -150, 18, 58, '#fff6e0', 4) + r(-9, -150, 6, 58, '#fff', 3) + d('M0 -184 C10 -170 10 -160 0 -154 C-10 -160 -10 -170 0 -184 Z', '#ff9a1f') + d('M0 -174 C5 -166 5 -160 0 -157 C-5 -160 -5 -166 0 -174 Z', '#fff39a'));
  }
  function glass(x, y, R, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', r(R * 0.9, -R * 0.16, R * 1.5, R * 0.32, '#000', R * 0.16, 'opacity=".3" transform="translate(10,14)"') + c(10, 14, R * 1.1, '#000', 'opacity=".3"') +
      r(R * 0.95, -R * 0.15, R * 1.4, R * 0.3, '#3a1a0a', R * 0.15) + r(R * 0.95, -R * 0.15, R * 1.4, R * 0.12, '#7a4020', R * 0.06) + r(R * 0.86, -R * 0.2, R * 0.24, R * 0.4, '#d8a830', 4) +
      c(0, 0, R * 1.1, '#c8901a') + c(0, 0, R * 1.02, '#ffd760') + c(0, 0, R * 0.9, '#9fd8ff', 'opacity=".55"') + d('M' + (-R * 0.7) + ' ' + (-R * 0.2) + ' A' + R * 0.74 + ' ' + R * 0.74 + ' 0 0 1 ' + (R * 0.1) + ' ' + (-R * 0.72), 'none', 'stroke="#fff" stroke-width="' + R * 0.12 + '" stroke-linecap="round" opacity=".8"'));
  }
  G['clue'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#3a1426') + g('translate(-20,-20)', plan(440, 440, 24, '#3a1426'));
      o += r(0, 0, 400, 400, rg([['#000', 0], ['#000', 1]]), 0, 'opacity=".25"');
      o += candle(88, 372, 1.3);
      o += glass(234, 158, 100, 42);
      o += t(234, 206, '?', 140, '#c2183a', { w: 900, st: '#fff', sw: 10, tr: 'rotate(-8 234 158)' });
      return o;
    },
    bg: function () {
      var o = plan(960, 600, 44, '#3a1426');
      o += candle(470, 380, 1.3) + glass(760, 420, 110, 30);
      return o;
    }
  };
})();
