(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function road(pts, w, depth) {
    var path = 'M' + pts.map(function (q) { return q.join(' '); }).join(' L');
    var st = function (col, ww, x2) { return '<path d="' + path + '" fill="none" stroke="' + col + '" stroke-width="' + ww + '" stroke-linejoin="miter" stroke-linecap="butt" ' + (x2 || '') + '/>'; };
    var o = st('#000', w, 'opacity=".2" transform="translate(10,' + (depth + 18) + ')"');
    for (var k = depth; k > 0; k -= 2) o += st('#b8488a', w, 'transform="translate(0,' + k + ')"');
    o += st('#ffffff', w) + st('#f2dcea', w * 0.86) + st('#ffffff', w * 0.7);
    o += st('#ff8ac4', 3, 'stroke-dasharray="12 12"');
    return o;
  }
  function car(x, y, s, rot) {
    var o = e(0, 10, 34, 18, '#000', 'opacity=".25"');
    o += r(-30, -16, 60, 32, '#a8141e', 9) + r(-30, -20, 60, 32, '#ff3a3a', 9) + r(-14, -18, 30, 28, '#ffd0d0', 6) + r(-10, -16, 22, 24, '#ff5a5a', 4) + r(18, -16, 8, 24, '#9fe0ff', 3);
    o += r(-24, -24, 14, 6, '#1b1d24', 2) + r(10, -24, 14, 6, '#1b1d24', 2) + r(-24, 14, 14, 6, '#1b1d24', 2) + r(10, 14, 14, 6, '#1b1d24', 2);
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ',' + (s * 0.62) + ')', o);
  }
  function smoke(x, y, n, s) {
    return rep(n, function (i) { return c(x - i * 16 * s, y + i * 9 * s, (12 + i * 4) * s, '#fff', 'opacity="' + (0.85 - i * 0.15).toFixed(2) + '"'); });
  }
  G['drift-boss'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ffb0d8', '#d87ae8', '#7a4ae0']));
      o += rep(6, function (i) { return c(40 + i * 70, 60 + (i % 2) * 260, 24, '#fff', 'opacity=".12"'); });
      o += road([[-40, 452], [130, 354], [40, 302], [250, 180], [150, 122], [300, 36], [270, 18]], 64, 26);
      o += smoke(176, 250, 4, 1.5);
      o += car(230, 196, 1.75, -30);
      o += c(310, 300, 16, '#ffd23a', 'stroke="#c49a00" stroke-width="4"') + c(305, 295, 5, '#fff', 'opacity=".6"') + c(80, 210, 14, '#ffd23a', 'stroke="#c49a00" stroke-width="4"');
      o += t(330, 120, '27', 64, '#fff', { st: '#7a3ab8', sw: 6 });
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ffb0d8', '#c87ae8', '#6a3ad8']));
      o += road([[-40, 640], [300, 444], [180, 374], [520, 178], [400, 108], [700, -64]], 90, 34) + road([[700, 640], [960, 490], [840, 420], [1100, 270]], 90, 34);
      o += car(380, 330, 1.6, -30) + smoke(330, 360, 5, 1.4);
      return o;
    }
  };
})();
