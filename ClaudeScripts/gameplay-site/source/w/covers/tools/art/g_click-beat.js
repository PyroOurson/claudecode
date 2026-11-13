(function () {
  var OUT = '#1c1130';
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function circ(x, y, R, a, b, n, ring) {
    var o = '';
    if (ring) o += c(x, y, R * ring, 'none', 'stroke="#fff" stroke-width="' + R * .09 + '" opacity=".85"');
    o += c(x + R * .06, y + R * .1, R, '#000', 'opacity=".3"');
    o += c(x, y, R, rg([[a, 0], [b, 1]], .38, .32, .85), 'stroke="#fff" stroke-width="' + R * .16 + '"');
    o += c(x, y, R * .86, 'none', 'stroke="#000" stroke-width="' + R * .04 + '" opacity=".25"');
    if (n) o += t(x, y + R * .36, n, R * 1.02, '#fff', { st: OUT, sw: R * .09 });
    return o;
  }
  function slider(path, R, col) {
    return sk(path, '#fff', R * 2.2) + sk(path, '#1a0b36', R * 1.9) + sk(path, col, R * 1.9, 'opacity=".35"') + sk(path, '#fff', R * .12, 'opacity=".25"');
  }
  function tri(x, y, s, rot, col, op) { return p([[0, -s], [s * .87, s * .5], [-s * .87, s * .5]], 'none', 'stroke="' + col + '" stroke-width="' + s * .14 + '" stroke-linejoin="round" opacity="' + op + '" transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"'); }
  G['click-beat'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#a8348e', 0], ['#4a1668', .55], ['#14062a', 1]], .55, .4, .9));
      o += tri(330, 60, 34, 12, '#fff', .14) + tri(60, 330, 26, -20, '#fff', .12) + r(300, 300, 44, 44, 'none', 0, 'stroke="#fff" stroke-width="5" opacity=".12" transform="rotate(20 322 322)"') + c(56, 70, 22, 'none', 'stroke="#fff" stroke-width="5" opacity=".14"');
      o += slider('M228 286 C268 236 312 300 344 222', 34, '#47c8ff');
      o += circ(344, 222, 30, '#c8f2ff', '#1f7fb0', '', 0) + c(296, 262, 30, 'none', 'stroke="#ffd23f" stroke-width="6"');
      o += circ(228, 286, 40, '#c8f2ff', '#1f7fb0', '2', 0);
      o += circ(132, 156, 66, '#ffc2e0', '#c2337a', '1', 1.55);
      o += circ(306, 96, 34, '#d8ffd0', '#2f9a52', '3', 1.3);
      o += rep(9, function (i) { return c(178 + i * 6, 236 - i * 9, 4 + i * .9, '#ffe680', 'opacity="' + (.1 + i * .08) + '"'); });
      o += c(232, 160, 22, '#ff66ab', 'opacity=".35"') + c(232, 160, 15, '#ffe680', 'stroke="#fff" stroke-width="4"') + c(232, 160, 5, '#fff');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#14062a', '#3a1458', '#8a2a82'], 0, 0, 1, 1));
      o += rep(14, function (i) { var x = (i * 173) % 960, y = (i * 97) % 600; return tri(x, y, 30 + (i % 4) * 14, i * 23, '#fff', .1); });
      o += slider('M120 420 C260 300 380 520 520 360 S760 260 860 380', 46, '#ff66ab');
      o += circ(120, 420, 52, '#ffc2e0', '#c2337a', '4', 0) + circ(860, 380, 44, '#ffc2e0', '#c2337a', '', 0);
      o += circ(300, 160, 60, '#c8f2ff', '#1f7fb0', '1', 1.5) + circ(470, 130, 60, '#c8f2ff', '#1f7fb0', '2', 0) + circ(640, 170, 60, '#c8f2ff', '#1f7fb0', '3', 0);
      o += r(0, 0, 960, 14, '#fff', 0, 'opacity=".08"') + r(20, 20, 300, 16, '#7dff9e', 8, 'opacity=".55"');
      return o;
    }
  };
})();
