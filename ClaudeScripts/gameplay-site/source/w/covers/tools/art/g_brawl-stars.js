(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var K = '#14141c';
  function bush(x, y, s) {
    var o = '';
    [[-40, 10, 40], [0, -14, 46], [42, 8, 40], [-10, 26, 40], [30, 30, 34]].forEach(function (q) { o += c(q[0], q[1], q[2] + 6, K); });
    [[-40, 10, 40], [0, -14, 46], [42, 8, 40], [-10, 26, 40], [30, 30, 34]].forEach(function (q) { o += c(q[0], q[1], q[2], '#3ab84a') + c(q[0] - q[2] * 0.3, q[1] - q[2] * 0.35, q[2] * 0.35, '#7ae06a'); });
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function gem(x, y, s) {
    var o = p([[0, -34], [26, -10], [0, 34], [-26, -10]], K, 'stroke="' + K + '" stroke-width="10" stroke-linejoin="round"') + p([[0, -34], [26, -10], [0, 34], [-26, -10]], '#b84aff') + p([[0, -34], [26, -10], [0, -2], [-26, -10]], '#e0a0ff') + p([[0, -2], [26, -10], [0, 34]], '#8a2ad8');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function brawler(x, y, s) {
    var o = d('M-90 170 C-90 90 -50 64 0 64 C50 64 90 90 90 170 Z', K) + d('M-80 170 C-80 98 -44 74 0 74 C44 74 80 98 80 170 Z', '#e8433a') + d('M-30 74 L0 120 L30 74 Z', '#ffd23a', 'stroke="' + K + '" stroke-width="6"');
    o += p([[-70, -60], [-56, -150], [-30, -86], [-10, -170], [12, -88], [40, -160], [52, -82], [80, -130], [76, -50]], K, 'stroke="' + K + '" stroke-width="16" stroke-linejoin="round"');
    o += p([[-70, -60], [-56, -150], [-30, -86], [-10, -170], [12, -88], [40, -160], [52, -82], [80, -130], [76, -50]], '#8a3ae8') + p([[-56, -150], [-30, -86], [-44, -80]], '#b87aff') + p([[-10, -170], [12, -88], [-4, -86]], '#b87aff');
    o += c(0, -10, 104, K) + c(0, -10, 94, '#f5b98a') + e(-40, -64, 30, 16, '#fff', 'opacity=".35" transform="rotate(-30 -40 -64)"');
    o += r(-94, -44, 188, 34, K, 10) + r(-88, -40, 176, 26, '#ffd23a', 8);
    o += e(-36, -28, 20, 14, '#fff') + e(36, -28, 20, 14, '#fff') + c(-30, -27, 9, K) + c(30, -27, 9, K);
    o += d('M-58 -66 L-10 -48 L-14 -40 L-60 -54 Z', K) + d('M58 -66 L10 -48 L14 -40 L60 -54 Z', K);
    o += d('M-50 24 C-30 70 30 70 50 24 Z', K) + d('M-40 30 L40 30 L36 40 L-36 40 Z', '#fff');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  G['brawl-stars'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#fff07a', 0], ['#ffc21a', 0.5], ['#ff7a1a', 1]], 0.45, 0.35, 0.85));
      o += rep(12, function (i) { var a = i * 30; return p([[200, 200], [200 + Math.cos((a - 6) * Math.PI / 180) * 400, 200 + Math.sin((a - 6) * Math.PI / 180) * 400], [200 + Math.cos((a + 6) * Math.PI / 180) * 400, 200 + Math.sin((a + 6) * Math.PI / 180) * 400]], '#fff', 'opacity=".16"'); });
      o += bush(40, 360, 1.1) + bush(370, 350, 1.0);
      o += brawler(200, 222, 1.0);
      o += gem(334, 92, 1.1) + gem(70, 120, 0.8);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#d8b07a');
      o += rep(12, function (j) { return rep(16, function (i) { return (i + j) % 2 ? r(i * 60, j * 60, 60, 60, '#c89e66') : ''; }); });
      o += rep(5, function (i) { return r(100 + i * 180, 80 + (i % 2) * 300, 120, 60, '#a8643a', 6) + r(100 + i * 180, 80 + (i % 2) * 300, 120, 14, '#d88a5a', 6); });
      o += bush(160, 300, 1.4) + bush(800, 260, 1.4) + bush(480, 520, 1.2) + bush(480, 90, 1.1);
      o += brawler(320, 200, 0.6) + brawler(640, 380, 0.6) + gem(480, 300, 1.4);
      return o;
    }
  };
})();
