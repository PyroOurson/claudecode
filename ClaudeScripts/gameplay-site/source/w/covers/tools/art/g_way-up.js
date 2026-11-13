(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function crate(x, y, w) { return r(x, y, w, w * 0.8, '#b8844a') + r(x, y, w, w * 0.12, '#d8a46a') + sk('M' + x + ' ' + y + 'l' + w + ' ' + w * 0.8 + 'M' + (x + w) + ' ' + y + 'l' + (-w) + ' ' + w * 0.8, '#7a5428', 3) + r(x, y + w * 0.7, w, w * 0.1, '#000', 0, 'opacity=".2"'); }
  function book(x, y, w, h, col) { return r(x, y, w, h, col, 4) + r(x + 4, y + 3, w - 8, h * 0.45, '#f4eedc') + r(x, y, w, 4, '#fff', 0, 'opacity=".25"'); }
  function cookie(x, y, rr) { return e(x, y + 6, rr, rr * 0.3, '#a86a30') + e(x, y, rr, rr * 0.3, '#d8a060') + rep(6, function (i) { return c(x + Math.cos(i * 1.1) * rr * 0.55, y + Math.sin(i * 1.7) * rr * 0.16, 4, '#4a2a14'); }); }
  function mika(x, y, s) {
    var o = '';
    o += sk('M' + (x - 6 * s) + ' ' + (y + 26 * s) + ' l-8 ' + 18 * s + ' l-10 4', '#2f3a56', 7 * s);
    o += sk('M' + (x + 6 * s) + ' ' + (y + 26 * s) + ' l12 ' + 10 * s + ' l2 ' + 14 * s, '#2f3a56', 7 * s);
    o += d('M' + (x - 12 * s) + ' ' + (y + 28 * s) + ' L' + (x - 9 * s) + ' ' + (y - 4 * s) + ' L' + (x + 9 * s) + ' ' + (y - 4 * s) + ' L' + (x + 13 * s) + ' ' + (y + 28 * s) + 'Z', '#f5c330');
    o += r(x - 16 * s, y, 8 * s, 16 * s, '#3a8a5a', 3);
    o += sk('M' + (x - 8 * s) + ' ' + y + ' l-12 -18', '#f5c330', 6 * s) + sk('M' + (x + 8 * s) + ' ' + y + ' l14 -20', '#f5c330', 6 * s);
    o += e(x, y - 5 * s, 10 * s, 3.5 * s, '#d8302e');
    o += c(x, y - 14 * s, 9 * s, '#f2c49a') + d('M' + (x - 10 * s) + ' ' + (y - 13 * s) + ' a' + 10 * s + ' ' + 10 * s + ' 0 0 1 ' + 20 * s + ' 0 l0 6 l-4 -4 l-12 0 l-4 4z', '#4a2c1e');
    return o;
  }
  function balloon(x, y, rr) { return sk('M' + x + ' ' + (y + rr * 1.15) + ' q8 30 -4 60', '#fff', 2.5) + e(x, y, rr, rr * 1.15, '#e8302e') + e(x - rr * 0.35, y - rr * 0.45, rr * 0.25, rr * 0.35, '#fff', 'opacity=".45"') + p([[x - 6, y + rr * 1.12], [x + 6, y + rr * 1.12], [x, y + rr * 1.12 + 9]], '#c82020'); }
  G['way-up'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a3f8a', '#c86a9a', '#ffb98a', '#ffe0b0']));
      o += e(90, 310, 130, 30, '#fff', 'opacity=".5"') + e(320, 250, 100, 24, '#fff', 'opacity=".45"');
      o += rep(5, function (i) { return r(10 + i * 80, 330 - (i % 2) * 30, 70, 120, '#4a4a6a', 0, 'opacity=".7"'); });
      o += crate(56, 300, 62) + book(150, 252, 92, 26, '#2e6ac8') + book(160, 228, 76, 24, '#c8402e') + cookie(285, 196, 46) + r(212, 140, 110, 14, '#5aa0a0', 7) + book(110, 120, 80, 22, '#3a8a5a');
      o += mika(196, 92, 2.2);
      o += balloon(310, 66, 30);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2e2e78', '#b05a8a', '#ff9a7a', '#ffd8a8']));
      o += e(200, 420, 260, 50, '#fff', 'opacity=".45"') + e(760, 360, 220, 40, '#fff', 'opacity=".4"');
      o += rep(12, function (i) { return r(i * 82, 470 - (i % 3) * 40, 74, 200, '#3a3a5a', 0, 'opacity=".75"'); });
      o += crate(260, 420, 90) + book(380, 360, 140, 34, '#2e6ac8') + cookie(600, 300, 70) + book(420, 220, 120, 30, '#c8402e') + r(560, 160, 160, 18, '#5aa0a0', 9);
      o += mika(470, 130, 2.6) + balloon(700, 80, 44);
      return o;
    }
  };
})();
