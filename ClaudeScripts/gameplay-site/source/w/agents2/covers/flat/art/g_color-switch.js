(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var CS = ['#35e2f2', '#f8dc10', '#ff1a8a', '#9a2afa'];
  function arc(cx, cy, R, a0, a1, col, w) {
    var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180;
    return '<path d="M' + (cx + R * Math.cos(r0)).toFixed(1) + ' ' + (cy + R * Math.sin(r0)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(r1)).toFixed(1) + ' ' + (cy + R * Math.sin(r1)).toFixed(1) + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>';
  }
  function ring(cx, cy, R, w, rot) {
    var o = c(cx + 5, cy + 8, R, 'none', 'stroke="#000" stroke-width="' + w + '" opacity=".35"');
    for (var i = 0; i < 4; i++) o += arc(cx, cy, R, rot + i * 90, rot + i * 90 + 90, CS[i], w);
    o += arc(cx, cy, R + w * 0.3, rot - 170, rot - 100, '#fff', w * 0.18).replace('/>', ' opacity=".45" stroke-linecap="round"/>');
    return o;
  }
  function switcher(x, y, R) {
    var o = '';
    for (var i = 0; i < 4; i++) { var a0 = (i * 90 - 90) * Math.PI / 180, a1 = (i * 90) * Math.PI / 180; o += d('M' + x + ' ' + y + ' L' + (x + R * Math.cos(a0)).toFixed(1) + ' ' + (y + R * Math.sin(a0)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (x + R * Math.cos(a1)).toFixed(1) + ' ' + (y + R * Math.sin(a1)).toFixed(1) + ' Z', CS[i]); }
    return o + c(x - R * 0.3, y - R * 0.35, R * 0.25, '#fff', 'opacity=".4"');
  }
  function ball(x, y, R, col) {
    return c(x + 3, y + 5, R, '#000', 'opacity=".35"') + c(x, y, R, col) + c(x - R * 0.3, y - R * 0.35, R * 0.32, '#fff', 'opacity=".55"');
  }
  G['color-switch'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a3a52', 0], ['#22222e', 0.6], ['#121218', 1]], 0.4, 0.3, 0.85));
      o += ring(200, 160, 112, 34, -45);
      o += star(200, 160, 30, 13, 5, '#fff') + c(200, 160, 50, '#fff', 'opacity=".05"');
      o += switcher(200, 302, 22);
      o += sk('M200 372 L200 354', '#ff1a8a', 4, 'opacity=".4"') + ball(200, 348, 18, '#ff1a8a');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#16161e');
      o += ring(480, 150, 140, 40, 10) + ring(200, 400, 110, 34, 60) + ring(780, 420, 120, 34, -30);
      o += rep(4, function (i) { return r(0, 560, 240, 24, CS[i], 0, 'transform="translate(' + i * 240 + ',0)"'); });
      o += switcher(480, 360, 26) + ball(480, 460, 22, '#f8dc10');
      return o;
    }
  };
})();
