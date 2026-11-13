(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var T = [['#e8304a', '#a8182e'], ['#2f6fe8', '#1a46a8'], ['#f5b400', '#b88200'], ['#2aa84a', '#1a7432']];
  function shape(k, x, y, s, col) {
    if (k === 0) return p([[x, y - s], [x + s * 1.1, y + s * 0.8], [x - s * 1.1, y + s * 0.8]], col);
    if (k === 1) return p([[x, y - s * 1.1], [x + s * 0.9, y], [x, y + s * 1.1], [x - s * 0.9, y]], col);
    if (k === 2) return c(x, y, s, col);
    return r(x - s * 0.9, y - s * 0.9, s * 1.8, s * 1.8, col, 4);
  }
  function tileK(x, y, w, h, k, check) {
    var o = r(x + 4, y + 12, w, h, '#000', 18, 'opacity=".3"') + r(x, y + 8, w, h, T[k][1], 18) + r(x, y, w, h, T[k][0], 18) + r(x, y, w, h * 0.42, '#fff', 18, 'opacity=".12"');
    o += shape(k, x + w / 2 + 3, y + h / 2 + 4, h * 0.28, '#000" opacity=".2') + shape(k, x + w / 2, y + h / 2, h * 0.28, '#fff');
    if (check) o += c(x + w - 26, y + 26, 18, '#fff') + sk('M' + (x + w - 35) + ' ' + (y + 26) + ' l7 8 l13 -15', T[k][0], 6);
    return o;
  }
  G['kahoot'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#8a4cf0', 0], ['#4e1aaa', 0.6], ['#28086a', 1]], 0.4, 0.3, 0.85));
      o += r(38, 46, 324, 74, '#000', 20, 'opacity=".25" transform="translate(4,7)"') + r(38, 40, 324, 74, '#fff', 20);
      o += c(82, 77, 26, '#7a3fe0') + t(82, 87, '20', 26, '#fff') + r(124, 62, 200, 12, '#d8cdf2', 6) + r(124, 84, 140, 12, '#d8cdf2', 6);
      o += tileK(38, 140, 156, 108, 0) + tileK(206, 140, 156, 108, 1) + tileK(38, 266, 156, 108, 2) + tileK(206, 266, 156, 108, 3, true);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#6a2ed8', '#22065a'], 0.5, 0.4, 0.85));
      var R = rnd(4);
      o += rep(24, function (i) { return shape(i % 4, R() * 960, R() * 600, 20 + R() * 30, '#fff" opacity=".1'); });
      o += r(200, 60, 560, 90, '#fff', 20) + tileK(200, 190, 270, 150, 0) + tileK(490, 190, 270, 150, 1) + tileK(200, 370, 270, 150, 2) + tileK(490, 370, 270, 150, 3);
      return o;
    }
  };
})();
