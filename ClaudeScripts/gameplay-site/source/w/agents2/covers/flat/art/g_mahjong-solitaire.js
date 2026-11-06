(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function mtile(x, y, w, h, face, lit) {
    var dpt = w * 0.16, o = r(x + 6, y + 10, w + dpt, h + dpt, '#000', w * 0.14, 'opacity=".3"');
    o += r(x + dpt * 0.2, y + dpt, w, h, '#0e7a4a', w * 0.14) + r(x + dpt * 0.1, y + dpt * 0.55, w, h, '#f0e2b8', w * 0.14) + r(x, y, w, h, lg(lit ? ['#fffbe0', '#fff0a8'] : ['#fffdf4', '#efe6cc']), w * 0.14);
    if (lit) o += r(x - 4, y - 4, w + 8, h + 8, 'none', w * 0.16, 'stroke="#ffd21a" stroke-width="5"');
    o += g('translate(' + (x + w / 2) + ',' + (y + h / 2) + ') scale(' + w / 100 + ')', face) + r(x + w * 0.1, y + h * 0.05, w * 0.8, h * 0.1, '#fff', w * 0.05, 'opacity=".7"');
    return o;
  }
  function dot1() { return c(0, 0, 38, '#1f9a4a') + c(0, 0, 30, '#fff') + c(0, 0, 25, '#e0262f') + star(0, 0, 22, 9, 8, '#fff') + c(0, 0, 9, '#1f5fd0'); }
  function bam() { var o = ''; [[-22, -34], [22, -34], [0, -34], [-22, 14], [22, 14], [0, 14]].forEach(function (q, i) { o += r(q[0] - 7, q[1], 14, 40, i === 2 ? '#e0262f' : '#1f9a4a', 7) + r(q[0] - 9, q[1] + 17, 18, 5, '#0e6a32', 2); }); return o; }
  function dots(n) { var P = { 2: [[0, -24], [0, 24]], 3: [[-22, -30], [0, 0], [22, 30]], 4: [[-20, -24], [20, -24], [-20, 24], [20, 24]] }, o = ''; P[n].forEach(function (q, i) { o += c(q[0], q[1], 15, i % 2 ? '#1f5fd0' : '#1f9a4a') + c(q[0], q[1], 9, '#fff') + c(q[0], q[1], 5, '#e0262f'); }); return o; }
  G['mahjong-solitaire'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3ad08a', 0], ['#0e8a5a', 0.6], ['#044a2e', 1]], 0.45, 0.3, 0.85));
      var w = 96, h = 124;
      o += mtile(28, 236, w, h, bam()) + mtile(124, 236, w, h, dots(3)) + mtile(220, 236, w, h, dots(4)) + mtile(316, 236, w, h, bam());
      o += mtile(60, 140, w, h, dots(2)) + mtile(156, 140, w, h, bam()) + mtile(252, 140, w, h, dots(3));
      o += mtile(144, 30, 112, 144, dot1(), 1);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#1fa86a', '#032a1a'], 0.5, 0.45, 0.85));
      var F = [bam(), dots(2), dots(3), dots(4), dot1()], w = 70, h = 90;
      for (var j = 0; j < 5; j++) for (var i = 0; i < 11; i++) if (Math.abs(i - 5) <= 5 - Math.abs(j - 2) + 1) o += mtile(90 + i * 72, 60 + j * 94, w, h, F[(i + j) % 5]);
      for (var j2 = 1; j2 < 4; j2++) for (var i2 = 3; i2 < 8; i2++) o += mtile(80 + i2 * 72, 48 + j2 * 94, w, h, F[(i2 * 2 + j2) % 5]);
      o += mtile(440, 230, w, h, dot1());
      return o;
    }
  };
})();
