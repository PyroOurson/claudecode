(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function tile(x, y, rot, ch, s) {
    var o = r(-30, -30, 60, 62, '#000', 11, 'opacity=".3" transform="translate(4,7)"') + r(-30, -30, 60, 62, '#b9c4f5', 11) + r(-30, -32, 60, 56, '#fff', 11) + t(0, 10, ch, 36, '#1c2f9a');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + (s || 1) + ')', o);
  }
  function bomb(x, y, R, txt) {
    var o = e(x + 10, y + R * 0.98, R * 0.85, R * 0.18, '#000', 'opacity=".35"');
    o += r(x - R * 0.24, y - R * 1.14, R * 0.48, R * 0.3, lg(['#a6aec4', '#4a5068']), 8, 'transform="rotate(18 ' + x + ' ' + y + ')"');
    o += sk('M' + (x + R * 0.3) + ' ' + (y - R * 1.02) + ' C' + (x + R * 0.55) + ' ' + (y - R * 1.5) + ' ' + (x + R * 0.95) + ' ' + (y - R * 1.2) + ' ' + (x + R * 0.9) + ' ' + (y - R * 1.6), '#d9b06a', R * 0.09);
    o += star(x + R * 0.9, y - R * 1.66, R * 0.42, R * 0.15, 9, '#ffb21a') + star(x + R * 0.9, y - R * 1.66, R * 0.26, R * 0.1, 8, '#fff6c4');
    o += c(x, y, R, rg([['#4a5274', 0], ['#20253e', 0.5], ['#080a16', 1]], 0.35, 0.3, 0.75));
    o += e(x - R * 0.42, y - R * 0.45, R * 0.28, R * 0.15, '#fff', 'opacity=".45" transform="rotate(-40 ' + (x - R * 0.42) + ' ' + (y - R * 0.45) + ')"');
    o += t(x, y + R * 0.2, txt, R * 0.58, '#ffd21a', { st: '#3a2400', sw: R * 0.06 });
    return o;
  }
  G['word-bomb'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#4a72f0', 0], ['#2034a8', 0.55], ['#0b1450', 1]], 0.4, 0.35, 0.85));
      o += c(200, 232, 160, '#7fa0ff', 'opacity=".12"');
      o += tile(62, 84, -12, 'W') + tile(62, 330, 10, 'R') + tile(340, 330, -10, 'D') + tile(344, 90, 12, 'O', 0.8);
      o += bomb(196, 240, 112, 'ING');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a46c0', '#081040'], 0.5, 0.5, 0.8));
      o += rep(10, function (i) { var a = i / 10 * Math.PI * 2, x = 480 + Math.cos(a) * 360, y = 300 + Math.sin(a) * 220; return r(x - 70, y - 36, 140, 72, '#1c2a80', 14, 'stroke="#5a78ff" stroke-width="3"') + c(x - 40, y, 18, ['#ff8a3a', '#3ad08a', '#ff5a8a', '#ffd23a'][i % 4]) + r(x - 12, y - 6, 60, 12, '#8aa0ff', 6); });
      o += bomb(480, 320, 110, 'ART');
      o += rep(10, function (i) { return tile(310 + i * 38, 530, 0, 'QWERTYUIOP'[i], 0.55); });
      return o;
    }
  };
})();
