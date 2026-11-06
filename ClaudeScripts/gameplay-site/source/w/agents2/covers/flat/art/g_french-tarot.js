(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function tcard(x, y, w, h, rot, inner, num) {
    var o = r(-w / 2 + 8, -h / 2 + 10, w, h, '#000', 14, 'opacity=".3"') + r(-w / 2, -h / 2, w, h, lg(['#fff8e6', '#ecdcb6']), 14) + r(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 'none', 8, 'stroke="#8a5a1a" stroke-width="4"') + r(-w / 2 + 15, -h / 2 + 15, w - 30, h - 30, 'none', 5, 'stroke="#c9963a" stroke-width="2"');
    if (num) o += t(-w / 2 + 30, -h / 2 + 46, num, 28, '#5a2a8a') + t(w / 2 - 30, h / 2 - 22, num, 28, '#5a2a8a');
    o += inner + d('M' + (-w / 2 + 14) + ' ' + (-h / 2) + ' H' + (w / 2 - 14) + ' L' + (-w / 2) + ' ' + (h * 0.1) + ' V' + (-h / 2 + 14) + ' Z', '#fff', 'opacity=".25"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  function sun(R) { return star(0, 0, R, R * 0.62, 12, '#f5a81c') + c(0, 0, R * 0.62, rg(['#ffe680', '#f5b21c'])) + c(-R * 0.2, -R * 0.1, R * 0.07, '#7a4300') + c(R * 0.2, -R * 0.1, R * 0.07, '#7a4300') + sk('M' + (-R * 0.22) + ' ' + R * 0.16 + ' Q0 ' + R * 0.32 + ' ' + R * 0.22 + ' ' + R * 0.16, '#7a4300', R * 0.06); }
  function fool() { return d('M-40 20 C-50 -20 -60 -40 -70 -50 C-30 -40 -14 -20 -6 -6 C-6 -40 0 -66 0 -76 C10 -60 10 -36 6 -6 C16 -22 34 -40 70 -48 C56 -36 48 -18 40 20 Z', '#d8262f') + d('M-6 -6 C-6 -40 0 -66 0 -76 C10 -60 10 -36 6 -6 Z', '#2a55e0') + c(-70, -50, 9, '#f5c542') + c(0, -78, 9, '#f5c542') + c(70, -48, 9, '#f5c542') + r(-46, 16, 92, 16, '#f5c542', 8); }
  function scene(w, h) { return r(-w / 2, -h / 2, w, h, lg(['#5ab4ff', '#bfe6ff']), 8) + d('M' + (-w / 2) + ' ' + (h * 0.22) + ' C' + (-w * 0.2) + ' ' + (h * 0.08) + ' ' + (w * 0.1) + ' ' + (h * 0.3) + ' ' + (w / 2) + ' ' + (h * 0.14) + ' V' + (h / 2 - 8) + ' Q' + (w / 2) + ' ' + (h / 2) + ' ' + (w / 2 - 8) + ' ' + (h / 2) + ' H' + (-w / 2 + 8) + ' Q' + (-w / 2) + ' ' + (h / 2) + ' ' + (-w / 2) + ' ' + (h / 2 - 8) + ' Z', '#4ab05a') + r(-w / 2, -h / 2, w, h, 'none', 8, 'stroke="#8a5a1a" stroke-width="3"'); }
  G['french-tarot'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#6a44c8', 0], ['#3a1f8a', 0.6], ['#180c44', 1]], 0.45, 0.3, 0.85));
      o += rep(14, function (i) { var q = rnd(i + 3); return star(q() * 400, q() * 400, 5 + q() * 6, 2, 4, '#ffe08a', 0, 'opacity="' + (0.4 + q() * 0.5).toFixed(2) + '"'); });
      o += tcard(108, 220, 140, 260, -20, r(-48, -88, 96, 176, lg(['#ffe0ec', '#ffb8d0']), 8) + g('translate(0,20) scale(.9)', fool())) + tcard(292, 220, 140, 260, 20, r(-48, -88, 96, 176, lg(['#e6dcff', '#c4b0f0']), 8) + t(26, 40, '1', 110, '#5a2a8a', { font: 'Lilita One' }), '');
      o += tcard(200, 196, 166, 300, 0, g('translate(0,-8)', scene(124, 190) + g('translate(0,-20)', sun(56))) + rep(3, function (i) { return star(-26 + i * 26, 116, 8, 3, 5, '#5a2a8a'); }), '21');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#4a2c9a', '#120836'], 0.5, 0.4, 0.8));
      o += rep(40, function (i) { var q = rnd(i + 40); return c(q() * 960, q() * 600, 1.5 + q() * 3, '#ffe08a', 'opacity="' + (0.3 + q() * 0.6).toFixed(2) + '"'); });
      [[150, 300, -18, '7'], [290, 260, -8, '14'], [670, 260, 8, '18'], [810, 300, 18, '3']].forEach(function (q) { o += tcard(q[0], q[1], 130, 240, q[2], g('scale(.6)', sun(60)), q[3]); });
      o += tcard(480, 330, 150, 270, 0, fool(), '') + c(480, 80, 54, '#ffe08a', 'opacity=".5"');
      return o;
    }
  };
})();
