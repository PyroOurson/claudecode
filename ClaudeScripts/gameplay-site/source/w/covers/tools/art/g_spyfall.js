(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function plane(col) {
    return d('M0 -42 C7 -42 9 -32 9 -22 L9 -8 L46 14 L46 26 L9 14 L9 32 L22 42 L22 50 L0 44 L-22 50 L-22 42 L-9 32 L-9 14 L-46 26 L-46 14 L-9 -8 L-9 -22 C-9 -32 -7 -42 0 -42 Z', col);
  }
  function locCard(x, y, rot, s, icon, bgc) {
    var o = r(-62, -84, 124, 168, '#000', 14, 'opacity=".3" transform="translate(7,10)"') + r(-62, -84, 124, 168, '#fff', 14) + r(-52, -74, 104, 112, bgc, 9);
    o += g('translate(0,-18) scale(.85)', icon) + r(-42, 50, 84, 11, '#2a2f3a', 5) + r(-30, 66, 60, 7, '#b8bcc8', 3);
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function spy(x, y, s) {
    var o = d('M-130 150 C-120 70 -70 40 0 40 C70 40 120 70 130 150 Z', '#b8874a');
    o += p([[-60, 46], [0, 80], [-30, 150]], '#d6a462') + p([[60, 46], [0, 80], [30, 150]], '#d6a462') + p([[-14, 64], [14, 64], [8, 150], [-8, 150]], '#1b1d24');
    o += r(-24, 10, 48, 40, '#d49c74') + e(0, -30, 62, 72, '#f0c09a') + e(-30, -60, 18, 24, '#fff', 'opacity=".22"');
    o += r(-58, -48, 54, 32, '#111318', 13) + r(4, -48, 54, 32, '#111318', 13) + r(-8, -40, 16, 7, '#111318') + p([[-46, -42], [-34, -42], [-48, -22], [-54, -22]], '#fff', 'opacity=".5"') + p([[16, -42], [28, -42], [14, -22], [8, -22]], '#fff', 'opacity=".5"');
    o += sk('M-18 14 Q4 22 24 8', '#8a4a3a', 5);
    o += e(0, -82, 116, 24, '#16181f') + d('M-62 -82 C-62 -138 -46 -160 0 -160 C46 -160 62 -138 62 -82 Z', '#22252e') + r(-62, -108, 124, 20, '#8a2a2a') + d('M-30 -150 C-10 -140 10 -140 30 -150 L26 -140 C10 -132 -10 -132 -26 -140 Z', '#33363f');
    o += e(-40, -140, 14, 8, '#fff', 'opacity=".12"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['spyfall'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#2fb2b4', 0], ['#127080', 0.55], ['#082c38', 1]], 0.35, 0.3, 0.85));
      o += p([[200, 0], [40, 400], [360, 400]], '#fff', 'opacity=".06"');
      o += locCard(306, 120, 14, 0.95, plane('#1e2a3a'), '#ffd84a');
      o += t(318, 284, '?', 120, '#ffd84a', { st: '#7a5200', sw: 6, tr: 'rotate(12 318 250)' });
      o += spy(168, 262, 1.0);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#1f8a90', '#06222c'], 0.5, 0.45, 0.85));
      var ic = [plane('#1e2a3a'), c(0, 0, 36, '#ff7a3a') + r(-4, -10, 8, 60, '#6a4a2a'), r(-36, -30, 72, 60, '#3a6ad0', 6) + p([[-44, -30], [0, -60], [44, -30]], '#c43a3a'), star(0, 0, 40, 18, 5, '#ff4b6a')];
      var bc = ['#ffd84a', '#7fd8ff', '#bfe8a8', '#ffc4d8'];
      [[120, 170, -10], [300, 440, 8], [660, 440, -8], [840, 170, 10], [130, 450, 6], [830, 450, -6], [480, 120, 0]].forEach(function (q, i) { o += locCard(q[0], q[1], q[2], 1.1, ic[i % 4], bc[i % 4]); });
      o += spy(480, 440, 1.2);
      return o;
    }
  };
})();
