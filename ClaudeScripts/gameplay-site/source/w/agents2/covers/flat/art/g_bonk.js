(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function ball(x, y, R, col, dk) {
    var o = c(x + 5, y + 8, R, '#000', 'opacity=".3"') + c(x, y, R, dk) + c(x, y, R * 0.9, rg([[col, 0], [col, 0.55], [dk, 1]], 0.38, 0.32, 0.7));
    o += e(x - R * 0.36, y - R * 0.42, R * 0.3, R * 0.17, '#fff', 'opacity=".6" transform="rotate(-35 ' + (x - R * 0.36) + ' ' + (y - R * 0.42) + ')"');
    return o;
  }
  function trail(x, y, R, dx, dy, col) {
    return rep(4, function (i) { return c(x - dx * (i + 1), y - dy * (i + 1), R * (0.9 - i * 0.18), col, 'opacity="' + (0.35 - i * 0.08).toFixed(2) + '"'); });
  }
  function plat(x, y, w, h, rot) {
    return g('rotate(' + (rot || 0) + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')', r(x + 5, y + 9, w, h, '#000', h / 2, 'opacity=".3"') + r(x, y, w, h, '#8a92a8', h / 2) + r(x, y, w, h * 0.4, '#c8cedc', h / 2));
  }
  G['bonk'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a4a8a', 0], ['#1c2550', 0.6], ['#0b1028', 1]], 0.4, 0.3, 0.85));
      o += rep(9, function (i) { return ln(i * 50, 0, i * 50, 400, '#fff', 1.5, 'opacity=".06"') + ln(0, i * 50, 400, i * 50, '#fff', 1.5, 'opacity=".06"'); });
      o += plat(30, 302, 290, 34, -4);
      o += sk('M330 296 L334 316 M346 288 L348 306 M362 294 L360 312', '#fff', 4, 'opacity=".75"') + ball(346, 344, 22, '#ffd23a', '#c49a00');
      o += trail(110, 220, 66, -22, 4, '#ff5a5a') + trail(290, 214, 66, 22, 4, '#4aa8ff');
      o += ball(130, 222, 70, '#ff5a5a', '#b81f2a') + ball(272, 216, 70, '#4aa8ff', '#1a5ab8');
      o += star(201, 216, 40, 14, 8, '#fff') + star(201, 216, 24, 9, 8, '#ffe23a');
      o += sk('M190 140 L182 112 M212 138 L224 108 M174 152 L150 134 M228 150 L252 130', '#fff', 6);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a3a78', '#060a20'], 0.5, 0.45, 0.85));
      o += rep(20, function (i) { return ln(i * 50, 0, i * 50, 600, '#fff', 1.5, 'opacity=".06"'); }) + rep(12, function (i) { return ln(0, i * 50, 960, i * 50, '#fff', 1.5, 'opacity=".06"'); });
      o += plat(120, 440, 720, 40, 0) + plat(80, 240, 200, 26, -8) + plat(680, 240, 200, 26, 8) + plat(380, 300, 200, 24, 0);
      o += ball(300, 396, 40, '#ff5a5a', '#b81f2a') + ball(420, 396, 40, '#ffd23a', '#c49a00') + ball(620, 396, 40, '#4aa8ff', '#1a5ab8') + ball(180, 196, 36, '#3ad05a', '#1a8a34') + ball(780, 196, 36, '#c84aff', '#7a1ab8');
      return o;
    }
  };
})();
