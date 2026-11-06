(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function poly(x, y, R, n, rot, col, dk, w) {
    var q = [];
    for (var i = 0; i < n; i++) { var a = (rot + i * 360 / n) * Math.PI / 180; q.push([+(x + Math.cos(a) * R).toFixed(1), +(y + Math.sin(a) * R).toFixed(1)]); }
    return p(q, col, 'stroke="' + dk + '" stroke-width="' + w + '" stroke-linejoin="round"');
  }
  function tank(x, y, R, rot, col, dk) {
    var o = g('rotate(' + rot + ')', r(R * 0.2, -R * 0.42, R * 1.75, R * 0.84, '#999999', 3, 'stroke="#727272" stroke-width="' + R * 0.14 + '" stroke-linejoin="round"'));
    o += c(0, 0, R, col, 'stroke="' + dk + '" stroke-width="' + R * 0.14 + '"') + c(-R * 0.3, -R * 0.32, R * 0.3, '#fff', 'opacity=".3"');
    return g('translate(' + x + ',' + y + ')', o);
  }
  function bullet(x, y, R, col, dk) {
    return c(x, y, R, col, 'stroke="' + dk + '" stroke-width="' + R * 0.3 + '"');
  }
  function hp(x, y, w, f) {
    return r(x - w / 2, y, w, 9, '#555', 4.5) + r(x - w / 2 + 1.5, y + 1.5, (w - 3) * f, 6, '#86e27a', 3);
  }
  G['diep'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#cdcdcd');
      o += rep(17, function (i) { return ln(i * 25, 0, i * 25, 400, '#c0c0c0', 2) + ln(0, i * 25, 400, i * 25, '#c0c0c0', 2); });
      o += poly(78, 88, 34, 4, 20, '#ffe869', '#bfae4e', 8) + poly(326, 318, 30, 4, -10, '#ffe869', '#bfae4e', 8) + poly(330, 120, 36, 3, -30, '#fc7677', '#bd5859', 8) + poly(80, 316, 50, 5, -54, '#768dfc', '#5869bd', 8) + hp(80, 376, 80, 0.55);
      o += bullet(262, 150, 16, '#00b2e1', '#0085a8') + bullet(302, 108, 16, '#00b2e1', '#0085a8') + bullet(346, 62, 16, '#00b2e1', '#0085a8');
      o += tank(190, 220, 72, -45, '#00b2e1', '#0085a8');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#cdcdcd');
      o += rep(40, function (i) { return ln(i * 25, 0, i * 25, 600, '#c0c0c0', 2); }) + rep(25, function (i) { return ln(0, i * 25, 960, i * 25, '#c0c0c0', 2); });
      var R = rnd(3);
      o += rep(14, function (i) { var k = i % 3; return k === 0 ? poly(R() * 960, R() * 600, 26, 4, R() * 90, '#ffe869', '#bfae4e', 7) : k === 1 ? poly(R() * 960, R() * 600, 28, 3, R() * 90, '#fc7677', '#bd5859', 7) : poly(R() * 960, R() * 600, 40, 5, R() * 90, '#768dfc', '#5869bd', 7); });
      o += tank(300, 300, 60, -20, '#00b2e1', '#0085a8') + tank(680, 320, 60, 160, '#f14e54', '#b43a3f') + bullet(420, 256, 14, '#00b2e1', '#0085a8') + bullet(560, 360, 14, '#f14e54', '#b43a3f');
      return o;
    }
  };
})();
