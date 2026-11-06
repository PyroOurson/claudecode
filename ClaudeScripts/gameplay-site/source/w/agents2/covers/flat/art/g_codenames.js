(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var COL = { R: ['#e8453a', '#a8231c'], B: ['#2f72e8', '#1a46a8'], N: ['#efe0bc', '#c9b48a'], K: ['#22232b', '#0c0c10'] };
  function agent(x, y, s, col) {
    var o = d('M-34 40 C-34 14 -18 4 0 4 C18 4 34 14 34 40 Z', col) + c(0, -10, 14, col) + e(0, -20, 26, 6, col) + r(-14, -38, 28, 18, col, 5);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function card(x, y, w, k) {
    var cc = COL[k], h = w, o = r(x + 5, y + 8, w, h, '#000', w * 0.14, 'opacity=".35"') + r(x, y + 5, w, h, cc[1], w * 0.14) + r(x, y, w, h, cc[0], w * 0.14);
    if (k === 'N') {
      o += r(x + w * 0.12, y + w * 0.12, w * 0.76, w * 0.3, 'none', 6, 'stroke="#b39c6c" stroke-width="2.5"') + agent(x + w * 0.5, y + w * 0.26, w * 0.005, '#c9b48a');
      o += r(x + w * 0.12, y + w * 0.56, w * 0.76, w * 0.28, '#fff', 6) + r(x + w * 0.22, y + w * 0.66, w * 0.56, w * 0.08, '#8a7650', 3);
    } else if (k === 'K') {
      o += c(x + w / 2, y + w * 0.46, w * 0.22, '#ececf0') + r(x + w * 0.38, y + w * 0.58, w * 0.24, w * 0.14, '#ececf0', 4) + c(x + w * 0.42, y + w * 0.45, w * 0.06, '#22232b') + c(x + w * 0.58, y + w * 0.45, w * 0.06, '#22232b') + r(x + w * 0.46, y + w * 0.62, w * 0.03, w * 0.08, '#22232b') + r(x + w * 0.53, y + w * 0.62, w * 0.03, w * 0.08, '#22232b');
    } else {
      o += agent(x + w / 2, y + w * 0.52, w * 0.011, cc[1]);
    }
    return o + r(x, y, w, h * 0.4, '#fff', w * 0.14, 'opacity=".14"');
  }
  var GRID = ['RNB', 'BKR', 'NRB'];
  G['codenames'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#46527a', 0], ['#232b45', 0.7], ['#141a2c', 1]], 0.4, 0.3, 0.85));
      GRID.forEach(function (row, j) { for (var i = 0; i < 3; i++) o += card(34 + i * 116, 30 + j * 116, 100, row[i]); });
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#5a3a24', '#24150c'], 0.5, 0.5, 0.8));
      var ks = 'RNBNRBKNRBNNRBRNBRNBRNBNR';
      for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) o += card(250 + i * 94, 70 + j * 94, 80, ks[j * 5 + i]);
      [[100, 160, 'R'], [100, 300, 'R'], [100, 440, 'R'], [860, 160, 'B'], [860, 300, 'B'], [860, 440, 'B']].forEach(function (q) { o += card(q[0] - 50, q[1] - 50, 100, q[2]); });
      return o;
    }
  };
})();
