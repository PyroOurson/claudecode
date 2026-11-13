(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function stage(x, y, s) {
    var o = d('M-170 0 L170 0 L130 40 L60 90 L0 110 L-60 90 L-130 40 Z', '#4a3a8a') + d('M-170 0 L170 0 L130 40 L-130 40 Z', '#6a5ab8') + d('M0 40 L60 90 L0 110 Z', '#3a2a6a');
    o += r(-176, -14, 352, 18, '#4cc46a', 8) + r(-176, -14, 352, 6, '#8ae08a', 4);
    o += r(-140, -104, 100, 12, '#c8b8ff', 6) + r(40, -104, 100, 12, '#c8b8ff', 6) + r(-50, -170, 100, 12, '#c8b8ff', 6);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function sword(x, y, s, rot) {
    var o = e(0, 0, 0, 0, '#000');
    o = r(-8, -40, 16, 46, '#5a3a2a', 4) + r(-30, -48, 60, 12, '#f2c14e', 5) + p([[-11, -48], [11, -48], [9, -170], [0, -190], [-9, -170]], '#e8ecf6') + p([[0, -48], [11, -48], [9, -170], [0, -190]], '#b8c0d4') + c(0, 10, 9, '#f2c14e');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function hero(x, y, s) {
    var o = e(0, 92, 54, 10, '#000', 'opacity=".3"');
    o += d('M-34 0 C-60 30 -70 70 -62 90 L-20 60 Z', '#d8303a');
    o += r(-30, 50, 22, 40, '#22264a', 8) + r(8, 50, 22, 40, '#22264a', 8) + r(-34, 82, 30, 14, '#5a3a2a', 6) + r(6, 82, 30, 14, '#5a3a2a', 6);
    o += r(-34, -4, 68, 62, '#2f4fb8', 18) + r(-34, 30, 68, 10, '#f2c14e');
    o += sword(40, -10, 0.78, 30) + c(40, -6, 14, '#f2c49a');
    o += c(-38, 20, 13, '#f2c49a');
    o += c(0, -46, 46, '#f2c49a') + d('M-50 -50 C-56 -90 -20 -110 10 -104 L30 -126 L34 -100 C50 -96 58 -80 54 -52 L44 -64 L36 -48 L26 -70 L-4 -64 L-20 -76 L-30 -58 Z', '#1e2a6a');
    o += e(-12, -40, 7, 10, '#1b1d24') + e(18, -40, 7, 10, '#1b1d24') + c(-10, -43, 3, '#fff') + c(20, -43, 3, '#fff') + sk('M-20 -54 L-4 -50 M28 -54 L12 -50', '#1b1d24', 5) + sk('M-8 -20 Q4 -12 16 -20', '#8a3a2a', 4);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function flyer(x, y, s, rot) {
    var o = c(0, 0, 44, '#ff9a2a') + c(-12, -14, 14, '#fff', 'opacity=".35"') + c(-40, 30, 14, '#ff9a2a') + c(42, 30, 14, '#ff9a2a') + e(-30, 46, 16, 10, '#c43a1a') + e(30, 46, 16, 10, '#c43a1a');
    o += sk('M-20 -10 l12 12 M-8 -10 l-12 12 M8 -10 l12 12 M20 -10 l-12 12', '#1b1d24', 5) + e(0, 20, 10, 8, '#7a1a1a');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  G['smash-fighter'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5ab0ff', '#8a7aff', '#ff9ad0']));
      o += e(80, 90, 70, 22, '#fff', 'opacity=".6"') + e(330, 230, 60, 18, '#fff', 'opacity=".5"');
      o += stage(200, 330, 1.05);
      o += sk('M180 230 C240 170 270 130 300 96', '#fff', 30, 'opacity=".55"') + sk('M190 226 C240 176 268 136 298 100', '#fff', 14);
      o += star(208, 206, 50, 20, 10, '#fff') + star(208, 206, 32, 13, 10, '#ffe23a');
      o += flyer(316, 86, 0.95, 30) + rep(3, function (i) { return star(276 - i * 24, 128 + i * 26, 9 - i * 2, 4, 4, '#fff'); });
      o += hero(132, 236, 1.05);
      o += t(306, 384, '142%', 44, '#ff5a2a', { st: '#fff', sw: 7 });
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#3a8af0', '#7a6ae8', '#f08ac0']));
      o += rep(6, function (i) { return e(100 + i * 170, 80 + (i % 2) * 60, 90, 24, '#fff', 'opacity=".5"'); });
      o += stage(480, 380, 2) + hero(380, 280, 0.9) + flyer(620, 240, 0.9, -20) + hero(560, 280, 0.9);
      return o;
    }
  };
})();
