(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function stile(x, y, w, h, face, rot) {
    var o = r(-w / 2 + 6, -h / 2 + 12, w, h, '#000', w * 0.14, 'opacity=".35"') + r(-w / 2, -h / 2 + h * 0.08, w, h, lg(['#ffc24a', '#e0860a']), w * 0.14) + r(-w / 2, -h / 2, w, h * 0.94, lg(['#fffdf4', '#ece2c4']), w * 0.14);
    o += g('translate(0,' + (-h * 0.03) + ') scale(' + w / 100 + ')', face) + r(-w / 2 + w * 0.1, -h / 2 + h * 0.04, w * 0.8, h * 0.08, '#fff', w * 0.04, 'opacity=".8"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function chun() { return r(-30, -26, 60, 40, 'none', 8, 'stroke="#d81e2c" stroke-width="12"') + r(-6, -58, 12, 116, '#d81e2c', 5); }
  function pin5() { var o = ''; [[-24, -34], [24, -34], [-24, 34], [24, 34]].forEach(function (q, i) { o += c(q[0], q[1], 17, i % 3 ? '#1f5fd0' : '#1f9a4a') + c(q[0], q[1], 10, '#fff') + c(q[0], q[1], 5, i % 3 ? '#1f5fd0' : '#1f9a4a'); }); return o + c(0, 0, 18, '#d81e2c') + c(0, 0, 10, '#fff') + c(0, 0, 5, '#d81e2c'); }
  function sou(n) { var o = ''; for (var i = 0; i < n; i++) { var x = (i % 2) * 30 - 15, y = Math.floor(i / 2) * 44 - 44; o += r(x - 7, y - 4, 14, 38, '#1f9a4a', 7) + r(x - 9, y + 13, 18, 5, '#0e6a32', 2); } return o; }
  function stick(x, y, w, rot) { return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', r(-w / 2 + 4, -7, w, 18, '#000', 9, 'opacity=".35"') + r(-w / 2, -11, w, 22, lg(['#ffffff', '#d8dce6']), 11) + c(0, 0, 8, '#d81e2c') + r(-w / 2 + 14, -8, w - 28, 4, '#fff', 2, 'opacity=".9"')); }
  G['mahjong'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a86f0', 0], ['#1a48b0', 0.6], ['#08184a', 1]], 0.45, 0.3, 0.85));
      o += r(-10, -10, 420, 420, 'none', 0, 'stroke="#ffffff" stroke-width="2" opacity=".1"');
      o += stile(92, 196, 124, 168, pin5(), -14) + stile(308, 196, 124, 168, sou(6), 14);
      o += stile(200, 170, 150, 204, chun(), 0);
      o += stick(200, 336, 330, -6);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a70d8', '#06123a'], 0.5, 0.45, 0.85));
      o += r(140, 40, 680, 520, '#1e5cc0', 20) + r(150, 50, 660, 500, 'none', 16, 'stroke="#fff" stroke-width="3" opacity=".25"');
      for (var i = 0; i < 14; i++) { o += r(250 + i * 33, 80, 30, 40, '#e0860a', 5) + r(250 + i * 33, 480, 30, 40, '#e0860a', 5); }
      for (var j = 0; j < 9; j++) { o += r(180, 140 + j * 36, 40, 32, '#e0860a', 5) + r(740, 140 + j * 36, 40, 32, '#e0860a', 5); }
      var F = [chun(), pin5(), sou(4), sou(2)];
      for (var k = 0; k < 12; k++) o += stile(370 + (k % 6) * 44, 230 + Math.floor(k / 6) * 62, 40, 54, F[k % 4]);
      o += stick(480, 400, 200, 0);
      return o;
    }
  };
})();
