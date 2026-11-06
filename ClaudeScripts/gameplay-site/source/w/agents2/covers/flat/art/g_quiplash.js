(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function bubble(x, y, w, h, rot, col, dk, right, face) {
    var tx = right ? w * 0.28 : -w * 0.28, o = '';
    var body = r(-w / 2, -h / 2, w, h, col, h * 0.3) + p([[tx - 18, h / 2 - 4], [tx + (right ? 40 : -40), h / 2 + 44], [tx + 22, h / 2 - 4]], col);
    o += g('translate(6,10)', body, 'opacity=".28" fill="#000"').replace(/fill="#[0-9a-f]{6}"/g, 'fill="#000"');
    o += g('translate(0,7)', body.replace(new RegExp(col, 'g'), dk)) + body + r(-w / 2 + 14, -h / 2 + 8, w - 28, h * 0.3, '#fff', h * 0.15, 'opacity=".2"');
    if (face === 1) o += c(-w * 0.18, -6, 9, '#1b1530') + c(w * 0.18, -6, 9, '#1b1530') + d('M' + (-w * 0.22) + ' 12 Q0 ' + (h * 0.42) + ' ' + (w * 0.22) + ' 12 Z', '#1b1530') + d('M' + (-w * 0.12) + ' 26 Q0 ' + (h * 0.36) + ' ' + (w * 0.12) + ' 26 Z', '#ff6a8a');
    else o += c(-w * 0.2, -4, 8, '#1b1530') + sk('M' + (w * 0.12) + ' -4 l20 0', '#1b1530', 7) + sk('M' + (-w * 0.18) + ' 22 Q0 ' + (h * 0.3) + ' ' + (w * 0.2) + ' 18', '#1b1530', 7);
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  function burst(x, y, s) {
    var o = star(x + 4, y + 7, 62 * s, 40 * s, 12, '#000', -90, 'opacity=".3"') + star(x, y, 62 * s, 40 * s, 12, '#ffffff') + star(x, y, 52 * s, 34 * s, 12, '#e8233a');
    return o + t(x, y + 15 * s, 'VS', 42 * s, '#fff', { st: '#7a0a18', sw: 4 });
  }
  G['quiplash'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ffe066', 0], ['#ffae1a', 0.5], ['#e8601a', 1]], 0.4, 0.3, 0.85));
      o += rep(12, function (i) { var a = i * 30; return p([[200, 210], [200 + Math.cos((a - 6) * Math.PI / 180) * 400, 210 + Math.sin((a - 6) * Math.PI / 180) * 400], [200 + Math.cos((a + 6) * Math.PI / 180) * 400, 210 + Math.sin((a + 6) * Math.PI / 180) * 400]], '#fff', 'opacity=".12"'); });
      o += bubble(132, 124, 200, 134, -8, '#2f8cff', '#1a5ac0', false, 1);
      o += bubble(268, 272, 200, 134, 7, '#ff4b8a', '#c41f5c', true, 2);
      o += burst(206, 206, 1);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#ffb21a', '#a8320a'], 0.5, 0.45, 0.85));
      o += rep(18, function (i) { var a = i * 20; return p([[480, 300], [480 + Math.cos((a - 4) * Math.PI / 180) * 900, 300 + Math.sin((a - 4) * Math.PI / 180) * 900], [480 + Math.cos((a + 4) * Math.PI / 180) * 900, 300 + Math.sin((a + 4) * Math.PI / 180) * 900]], '#fff', 'opacity=".1"'); });
      o += bubble(280, 220, 300, 190, -6, '#2f8cff', '#1a5ac0', false, 1) + bubble(680, 360, 300, 190, 6, '#ff4b8a', '#c41f5c', true, 2) + burst(480, 300, 1.6);
      return o;
    }
  };
})();
