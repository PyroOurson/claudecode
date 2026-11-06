(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function mate(x, y, s, col, dk, rot) {
    var body = 'M-66 -50 C-66 -112 -30 -138 8 -138 C52 -138 78 -108 78 -50 L78 64 C78 86 68 98 50 98 L32 98 C20 98 14 88 14 76 L14 66 L-6 66 L-6 76 C-6 88 -12 98 -26 98 L-46 98 C-60 98 -66 88 -66 66 Z';
    var o = e(6, 102, 82, 12, '#000', 'opacity=".3"');
    o += r(-102, -52, 52, 116, dk, 20) + r(-98, -48, 30, 104, col, 16);
    o += d(body, dk) + d(body, col, 'transform="translate(-6,-4) scale(.94)"');
    o += d('M40 -120 C66 -104 74 -76 72 -40 L72 60 C72 80 64 90 50 92 C60 70 60 -60 40 -120 Z', dk, 'opacity=".6"');
    o += d('M-14 -88 C-14 -110 10 -116 40 -116 C80 -116 100 -104 100 -82 C100 -60 82 -52 40 -52 C8 -52 -14 -60 -14 -82 Z', '#2a4a6a');
    o += d('M-10 -90 C-10 -108 12 -112 40 -112 C76 -112 94 -102 94 -84 C94 -66 78 -58 40 -58 C10 -58 -10 -66 -10 -84 Z', lg(['#c8f4ff', '#7fd0ee', '#3a8ab8']));
    o += e(52, -98, 26, 7, '#fff', 'opacity=".9"') + e(16, -94, 6, 4, '#fff', 'opacity=".7"');
    o += e(-36, -104, 16, 22, '#fff', 'opacity=".22" transform="rotate(20 -36 -104)"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')', o);
  }
  function stars(w, h, n, seed) {
    var R = rnd(seed);
    return rep(n, function () { return c(R() * w, R() * h, 0.8 + R() * 2.2, '#fff', 'opacity="' + (0.4 + R() * 0.6).toFixed(2) + '"'); });
  }
  G['among-us'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2a3478', 0], ['#141a48', 0.55], ['#060820', 1]], 0.4, 0.3, 0.85));
      o += stars(400, 400, 50, 3) + c(344, 344, 96, '#6a5ad8', 'opacity=".18"') + c(344, 344, 86, '#2e2668') + c(332, 332, 76, '#5446a8') + c(300, 318, 13, '#433690') + c(338, 298, 9, '#433690') + c(352, 346, 16, '#433690') + c(316, 360, 8, '#433690') + e(296, 290, 22, 9, '#fff', 'opacity=".22" transform="rotate(-40 296 290)"');
      o += mate(324, 84, 0.34, '#3ad0d8', '#1a8a9a', 24);
      o += mate(186, 232, 1.18, '#ee2a3a', '#9a0e1e', 0);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a3040', '#141822']));
      o += r(0, 380, 960, 220, '#5a6070') + rep(12, function (i) { return r(i * 80, 380, 78, 220, i % 2 ? '#646a7a' : '#565c6c'); });
      o += r(0, 0, 960, 140, '#3a4050') + r(80, 160, 220, 140, '#2a6a8a', 12) + r(100, 180, 180, 100, '#5ad0ff', 8, 'opacity=".5"') + r(660, 160, 220, 140, '#2a6a8a', 12) + r(680, 180, 180, 100, '#5ad0ff', 8, 'opacity=".5"');
      o += r(420, 300, 120, 80, '#c8ccd8', 10) + c(480, 320, 22, '#e8233a');
      [[200, 470, '#2f6fe8', '#1a3e9a'], [360, 500, '#3ad05a', '#1a8a34'], [620, 490, '#ffd23a', '#b88a00'], [780, 470, '#ff8ad8', '#b8509a']].forEach(function (q) { o += mate(q[0], q[1], 0.7, q[2], q[3], 0); });
      return o;
    }
  };
})();
