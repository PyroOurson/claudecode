(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function key(x, y, w, ch, hot) {
    var o = r(x + 3, y + 10, w, w, '#000', 14, 'opacity=".35"') + r(x, y + 8, w, w, hot ? '#b81f33' : '#9aa2b8', 14) + r(x, y, w, w, hot ? '#ff4b5e' : '#f2f4fa', 14) + r(x + 8, y + 6, w - 16, w - 22, hot ? '#ff7a88' : '#fff', 10);
    return o + t(x + w / 2, y + w * 0.62, ch, w * 0.46, hot ? '#fff' : '#2a2f45');
  }
  function car(x, y, s, col, dk, num) {
    var o = e(0, 46, 120, 10, '#000', 'opacity=".35"');
    o += d('M-120 30 L-114 -2 C-110 -14 -96 -18 -80 -18 L-40 -20 L-10 -48 C0 -56 40 -56 54 -48 L76 -22 L112 -16 C126 -12 130 0 130 14 L130 30 Z', col);
    o += d('M-120 30 L-118 14 L130 14 L130 30 Z', dk) + r(-132, -34, 30, 10, dk, 3) + r(-122, -26, 8, 22, dk);
    o += d('M-2 -44 C6 -50 36 -50 46 -44 L64 -22 L-22 -22 Z', '#9fe0ff') + d('M2 -42 L18 -42 L4 -24 L-12 -24 Z', '#fff', 'opacity=".6"');
    o += c(-46, 2, 18, '#fff') + t(-46, 10, num, 22, dk);
    o += c(-72, 32, 26, '#1b1d24') + c(-72, 32, 12, '#b8bcc8') + c(84, 32, 26, '#1b1d24') + c(84, 32, 12, '#b8bcc8');
    o += r(-90, -14, 150, 6, '#fff', 3, 'opacity=".35"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function flag(x, y, s) {
    var o = r(-4, -10, 8, 150, '#d8dce6', 3);
    for (var j = 0; j < 4; j++) for (var i = 0; i < 5; i++) o += r(4 + i * 16, -10 + j * 16, 16, 16, (i + j) % 2 ? '#1b1d24' : '#fff');
    return g('translate(' + x + ',' + y + ') scale(' + s + ') rotate(-6)', o);
  }
  G['typeracer'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a4258', 0], ['#1e2230', 0.6], ['#0c0e16', 1]], 0.4, 0.3, 0.85));
      o += r(0, 112, 400, 120, '#4a5064') + r(0, 112, 400, 6, '#fff', 0, 'opacity=".6"') + r(0, 226, 400, 6, '#fff', 0, 'opacity=".6"') + rep(6, function (i) { return r(-20 + i * 80, 168, 46, 8, '#ffd23a', 4); });
      o += rep(4, function (i) { return r(10 + i * 8, 136 + i * 18, 70 - i * 10, 6, '#fff', 3, 'opacity=".5"'); });
      o += flag(320, 40, 0.75);
      o += car(196, 172, 0.92, '#ff4b5e', '#a8182e', '1');
      o += key(26, 262, 78, 'T') + key(116, 262, 78, 'Y', true) + key(206, 262, 78, 'P') + key(296, 262, 78, 'E');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a3044', '#07080e'], 0.5, 0.45, 0.85));
      [['#ff4b5e', '#a8182e', '1', 400], ['#2f8cff', '#1a4aa8', '2', 620], ['#ffb21a', '#b87a00', '3', 280]].forEach(function (q, i) { var y = 80 + i * 120; o += r(0, y, 960, 100, '#3a4054') + r(0, y + 46, 960, 6, '#ffd23a', 0, 'opacity=".5"') + car(q[3], y + 50, 0.7, q[0], q[1], q[2]); });
      o += flag(820, 60, 1.2);
      o += rep(10, function (i) { return key(40 + i * 90, 470, 74, 'QWERTYUIOP'[i], i === 4); });
      return o;
    }
  };
})();
