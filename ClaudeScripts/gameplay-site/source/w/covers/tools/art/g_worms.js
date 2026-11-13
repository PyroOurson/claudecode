(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function island(x, y, w, s) {
    var o = d('M' + (-w) + ' 0 C' + (-w * 0.8) + ' 70 ' + (-w * 0.3) + ' 120 0 130 C' + (w * 0.3) + ' 120 ' + (w * 0.8) + ' 70 ' + w + ' 0 Z', '#8a5a34') + d('M' + (-w * 0.6) + ' 30 C' + (-w * 0.3) + ' 90 ' + (w * 0.3) + ' 90 ' + (w * 0.5) + ' 40 Z', '#6a4024', 'opacity=".6"');
    o += e(0, 0, w, w * 0.16, '#4cbf3a') + e(0, -6, w * 0.94, w * 0.12, '#6ad84a') + e(-w * 0.4, -10, w * 0.3, w * 0.04, '#fff', 'opacity=".25"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function worm(x, y, s, flip) {
    var path = 'M-60 60 C-20 70 30 66 30 30 C30 0 -10 -10 -6 -50 C-4 -76 10 -90 20 -96';
    var o = e(-10, 76, 70, 10, '#000', 'opacity=".25"') + sk(path, '#c45a80', 62) + sk(path, '#ff8ab0', 54) + sk('M-56 50 C-20 58 18 56 20 30', '#ffc4d8', 14, 'opacity=".7"') + sk('M-14 -40 C-12 -64 0 -80 10 -88', '#ffc4d8', 12, 'opacity=".6"');
    o += g('translate(6,8) rotate(-28)', r(-50, -16, 160, 32, '#000', 10, 'opacity=".25"')) + g('rotate(-28)', r(-50, -16, 160, 32, '#5a7a32', 10) + r(-50, -16, 160, 10, '#8aaa52', 6) + r(98, -21, 20, 42, '#3a5420', 5) + r(-60, -12, 16, 24, '#3a5420', 4) + r(0, 14, 16, 26, '#3a5420', 4));
    o += c(-6, 6, 13, '#ff8ab0', 'stroke="#c45a80" stroke-width="3"') + c(40, -18, 13, '#ff8ab0', 'stroke="#c45a80" stroke-width="3"');
    o += e(6, -110, 17, 22, '#fff', 'stroke="#c45a80" stroke-width="3"') + e(36, -108, 17, 22, '#fff', 'stroke="#c45a80" stroke-width="3"') + c(12, -106, 8, '#1b1d24') + c(42, -104, 8, '#1b1d24') + c(14, -109, 3, '#fff') + c(44, -107, 3, '#fff');
    o += r(-20, -136, 82, 16, '#e8233a', 7, 'transform="rotate(6 20 -128)"') + d('M-18 -130 C-40 -140 -54 -126 -62 -112 C-44 -118 -32 -120 -18 -122 Z', '#e8233a') + d('M-18 -124 C-36 -118 -46 -100 -48 -88 C-34 -100 -26 -108 -14 -116 Z', '#c41a2e');
    o += sk('M10 -76 Q24 -68 38 -78', '#7a1a3a', 5);
    return g('translate(' + x + ',' + y + ') scale(' + (flip ? -s : s) + ',' + s + ')', o);
  }
  function grenade(x, y, R) {
    return c(x + 4, y + 6, R, '#000', 'opacity=".25"') + c(x, y, R, '#3a6a2a') + r(x - R * 0.35, y - R * 1.3, R * 0.7, R * 0.45, '#8a8f9a', 3) + sk('M' + (x + R * 0.3) + ' ' + (y - R * 1.1) + ' q' + R * 0.6 + ' -' + R * 0.2 + ' ' + R * 0.5 + ' ' + R * 0.6, '#c8ccd8', 4) + e(x - R * 0.35, y - R * 0.35, R * 0.3, R * 0.18, '#fff', 'opacity=".4"');
  }
  G['worms'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5ab8ff', '#a8e0ff', '#ffe8b0']));
      o += c(80, 70, 34, '#fff6c0', 'opacity=".9"') + e(290, 80, 60, 18, '#fff', 'opacity=".8"') + e(330, 66, 36, 16, '#fff', 'opacity=".8"');
      o += r(0, 352, 400, 48, '#2a7ad0') + sk('M0 360 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0', '#8ad0ff', 5);
      o += island(200, 300, 190, 1);
      o += sk('M290 160 Q330 90 372 120', '#fff', 5, 'stroke-dasharray="4 12" opacity=".9"') + grenade(352, 130, 20);
      o += worm(170, 214, 1.05);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4aa8f0', '#a8dcff', '#ffd8a0']));
      o += r(0, 470, 960, 130, '#2a6ac0') + island(200, 380, 180, 1) + island(560, 420, 220, 1) + island(860, 360, 140, 1);
      o += worm(200, 300, 0.8) + worm(600, 336, 0.8, true) + worm(860, 290, 0.6, true);
      o += star(400, 180, 70, 30, 12, '#ffb21a') + star(400, 180, 40, 18, 10, '#fff2a0');
      return o;
    }
  };
})();
