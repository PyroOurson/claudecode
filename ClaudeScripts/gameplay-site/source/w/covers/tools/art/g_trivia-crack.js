(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function sec(cx, cy, R, a0, a1, col) {
    var r0 = a0 * Math.PI / 180, r1 = a1 * Math.PI / 180;
    return d('M' + cx + ' ' + cy + ' L' + (cx + R * Math.cos(r0)).toFixed(1) + ' ' + (cy + R * Math.sin(r0)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(r1)).toFixed(1) + ' ' + (cy + R * Math.sin(r1)).toFixed(1) + ' Z', col);
  }
  var SC = ['#2f8cff', '#e8233a', '#ffc21a', '#2bb85a', '#ff8a1a', '#a24bff'];
  function glyph(k, x, y, s) {
    var w = '#fff';
    if (k === 0) return star(x, y, 15 * s, 7 * s, 5, w);
    if (k === 1) return r(x - 13 * s, y - 10 * s, 12 * s, 20 * s, w, 2) + r(x + 1 * s, y - 10 * s, 12 * s, 20 * s, w, 2);
    if (k === 2) return c(x, y - 3 * s, 10 * s, w) + r(x - 5 * s, y + 6 * s, 10 * s, 7 * s, w, 2);
    if (k === 3) return c(x, y, 13 * s, 'none', 'stroke="#fff" stroke-width="' + 4 * s + '"') + ln(x - 13 * s, y, x + 13 * s, y, w, 3 * s) + e(x, y, 5 * s, 13 * s, 'none', 'stroke="#fff" stroke-width="' + 3 * s + '"');
    if (k === 4) return p([[x - 12 * s, y + 12 * s], [x - 4 * s, y - 12 * s], [x + 2 * s, y + 2 * s], [x + 12 * s, y - 6 * s], [x + 12 * s, y + 12 * s]], w);
    return d('M' + (x - 6 * s) + ' ' + (y - 14 * s) + ' h12 v10 l8 16 h-28 l8 -16 z', w);
  }
  function wheel(cx, cy, R) {
    var o = c(cx + 7, cy + 12, R + 14, '#000', 'opacity=".3"') + c(cx, cy, R + 14, '#fff') + c(cx, cy, R + 14, 'none', 'stroke="#d8dce8" stroke-width="3"');
    for (var i = 0; i < 6; i++) { var a = -90 - 30 + i * 60; o += sec(cx, cy, R, a, a + 60, SC[i]); var am = (a + 30) * Math.PI / 180; o += glyph(i, cx + Math.cos(am) * R * 0.66, cy + Math.sin(am) * R * 0.66, R / 110); }
    o += d('M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy + ' Z', '#fff', 'opacity=".12"');
    o += rep(12, function (i) { var a = (i * 30 - 15) * Math.PI / 180; return c(cx + Math.cos(a) * (R + 7), cy + Math.sin(a) * (R + 7), 4.5, '#ffc21a'); });
    o += c(cx, cy, R * 0.3, '#fff') + c(cx, cy, R * 0.24, '#ff8a1a') + star(cx, cy, R * 0.18, R * 0.08, 5, '#fff');
    return o;
  }
  G['trivia-crack'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#7ad8ff', 0], ['#2f9ae8', 0.55], ['#1450a8', 1]], 0.4, 0.3, 0.85));
      o += rep(16, function (i) { var a = i * 22.5; return p([[200, 216], [200 + Math.cos((a - 5) * Math.PI / 180) * 400, 216 + Math.sin((a - 5) * Math.PI / 180) * 400], [200 + Math.cos((a + 5) * Math.PI / 180) * 400, 216 + Math.sin((a + 5) * Math.PI / 180) * 400]], '#fff', 'opacity=".1"'); });
      o += wheel(200, 222, 148);
      o += p([[176, 40], [224, 40], [200, 86]], '#000', 'opacity=".3" transform="translate(4,6)"') + p([[174, 36], [226, 36], [200, 84]], '#e8233a') + c(200, 40, 14, '#e8233a') + c(196, 36, 5, '#fff', 'opacity=".6"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#3aa8f0', '#0a2a6a'], 0.5, 0.45, 0.85));
      o += wheel(480, 330, 220);
      o += rep(6, function (i) { var x = 90 + (i % 3) * 60 + (i > 2 ? 640 : 0), y = 140 + Math.floor(i / 1) % 3 * 140; return r(x - 50, y - 50, 100, 100, SC[i], 20) + glyph(i, x, y, 2); });
      return o;
    }
  };
})();
