(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function glow(sd) {
    var id = uid('bl');
    _defs += '<filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="' + sd + '"/></filter>';
    return 'filter="url(#' + id + ')"';
  }
  function walls(path, w, col) {
    return sk(path, col, w * 2.2, glow(8) + ' opacity=".55"') + sk(path, col, w) + sk(path, '#fff8c0', w * 0.3, 'opacity=".7"');
  }
  function mask(x, y, s) {
    var o = r(-50, -46, 100, 100, '#000', 18, 'opacity=".4" transform="translate(5,8)"');
    o += p([[-44, -40], [-34, -70], [-20, -44]], '#ffd21a', 'stroke="#14141c" stroke-width="5" stroke-linejoin="round"') + p([[44, -40], [34, -70], [20, -44]], '#ffd21a', 'stroke="#14141c" stroke-width="5" stroke-linejoin="round"');
    o += r(-50, -46, 100, 100, '#ffd21a', 18, 'stroke="#14141c" stroke-width="6"') + r(-42, -40, 84, 28, '#fff6a0', 12, 'opacity=".6"');
    o += d('M-40 -14 C-40 -30 -6 -30 -4 -10 C-6 8 -40 8 -40 -6 Z', '#14141c') + d('M40 -14 C40 -30 6 -30 4 -10 C6 8 40 8 40 -6 Z', '#14141c');
    o += c(-20, -10, 10, '#fff') + c(20, -10, 10, '#fff') + c(-17, -9, 5, '#14141c') + c(23, -9, 5, '#14141c');
    o += p([[-26, 22], [-16, 32], [-6, 22], [4, 32], [14, 22], [24, 32], [24, 40], [-26, 40]], '#14141c');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  var MZ = 'M40 0 V120 H120 M40 200 V400 M120 400 V300 H200 M280 0 V80 H360 M360 160 H280 V240 M400 300 H320 V400 M120 120 V200 H40 M200 300 V240';
  G['tomb-of-the-mask'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#0a0a12');
      o += rep(9, function (i) { return ln(i * 50, 0, i * 50, 400, '#1a1a2a', 1); }) + rep(9, function (i) { return ln(0, i * 50, 400, i * 50, '#1a1a2a', 1); });
      o += walls(MZ, 18, '#ffd21a');
      [[80, 40], [80, 80], [160, 40], [200, 40], [240, 40], [240, 120], [320, 120], [320, 200], [240, 280], [160, 360], [80, 280], [80, 340], [360, 240]].forEach(function (q) { o += c(q[0], q[1], 7, '#ffd21a', glow(3)) + c(q[0], q[1], 5, '#fff6b0'); });
      o += p([[322, 300], [334, 284], [346, 300], [358, 284], [370, 300], [382, 284], [394, 300]], '#ff2a8a', glow(4)) + p([[322, 300], [334, 284], [346, 300], [358, 284], [370, 300], [382, 284], [394, 300]], '#ff4aa0');
      o += star(330, 40, 20, 9, 5, '#ffd21a', -90, glow(4)) + star(330, 40, 18, 8, 5, '#fff6a0');
      o += p([[176, 400], [224, 400], [214, 250], [186, 250]], '#ffd21a', 'opacity=".25"') + p([[186, 400], [214, 400], [208, 260], [192, 260]], '#ffd21a', 'opacity=".5"');
      o += mask(200, 214, 1.15);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#08080e');
      o += g('scale(1.5)', walls(MZ, 14, '#ffd21a')) + g('translate(600,0) scale(1.5)', walls(MZ, 14, '#ffd21a'));
      o += rep(20, function (i) { return c(30 + i * 48, 560, 6, '#ffd21a'); }) + mask(480, 300, 1.3);
      return o;
    }
  };
})();
