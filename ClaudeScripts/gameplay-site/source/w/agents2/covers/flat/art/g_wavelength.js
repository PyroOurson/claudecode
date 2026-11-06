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
  function dial(cx, cy, R, mid, ndl) {
    var o = sec(cx + 6, cy + 10, R + 16, 180, 360, '#000" opacity=".3') + sec(cx, cy, R + 16, 180, 360, '#1a2a6a') + sec(cx, cy, R, 180, 360, '#f6edd6');
    var Z = [['#ffd23a', 2], ['#ff8a2a', 3], ['#2f6fe8', 4], ['#ff8a2a', 3], ['#ffd23a', 2]], w = 12;
    Z.forEach(function (z, i) { var a = mid - w * 2.5 + i * w; o += sec(cx, cy, R, a, a + w, z[0]); var am = (a + w / 2) * Math.PI / 180; o += t(cx + Math.cos(am) * R * 0.82, cy + Math.sin(am) * R * 0.82 + R * 0.05, '' + z[1], R * 0.13, '#fff', { tr: 'rotate(' + (a + w / 2 + 90) + ' ' + (cx + Math.cos(am) * R * 0.82) + ' ' + (cy + Math.sin(am) * R * 0.82) + ')' }); });
    var an = ndl * Math.PI / 180;
    o += ln(cx + 4, cy + 6, cx + 4 + Math.cos(an) * R * 0.92, cy + 6 + Math.sin(an) * R * 0.92, '#000', R * 0.065, 'opacity=".3"') + ln(cx, cy, cx + Math.cos(an) * R * 0.92, cy + Math.sin(an) * R * 0.92, '#e8233a', R * 0.065);
    o += c(cx, cy, R * 0.16, '#e8233a') + c(cx - R * 0.04, cy - R * 0.05, R * 0.06, '#fff', 'opacity=".5"');
    return o;
  }
  function label(x, y, rot, txt, col) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', r(-60, -24, 120, 48, '#000', 12, 'opacity=".3" transform="translate(3,5)"') + r(-60, -24, 120, 48, col, 12) + t(0, 10, txt, 26, '#fff'));
  }
  G['wavelength'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a4aa8', 0], ['#1c2468', 0.6], ['#0c1036', 1]], 0.4, 0.3, 0.85));
      o += rep(5, function (i) { return sk('M-20 ' + (60 + i * 14) + ' Q50 ' + (30 + i * 14) + ' 100 ' + (60 + i * 14) + ' T220 ' + (60 + i * 14) + ' T340 ' + (60 + i * 14) + ' T460 ' + (60 + i * 14), '#7fa8ff', 3, 'opacity=".18"'); });
      o += r(26, 268, 348, 104, '#000', 26, 'opacity=".3" transform="translate(5,8)"') + r(26, 268, 348, 104, '#2bb8c8', 26) + r(26, 268, 348, 30, '#fff', 26, 'opacity=".15"');
      o += dial(200, 278, 162, 294, 288);
      o += label(110, 330, -4, 'HOT', '#ff5a3a') + label(290, 330, 4, 'COLD', '#2f8cff');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a3a98', '#080c2e'], 0.5, 0.45, 0.85));
      o += rep(10, function (i) { return sk('M-40 ' + (60 + i * 50) + ' Q120 ' + (10 + i * 50) + ' 240 ' + (60 + i * 50) + ' T520 ' + (60 + i * 50) + ' T800 ' + (60 + i * 50) + ' T1080 ' + (60 + i * 50), '#7fa8ff', 5, 'opacity=".2"'); });
      o += r(220, 360, 520, 160, '#2bb8c8', 30) + dial(480, 370, 250, 250, 256);
      o += label(170, 470, -6, 'HOT', '#ff5a3a') + label(790, 470, 6, 'COLD', '#2f8cff');
      return o;
    }
  };
})();
