(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function glow(x, y, R, a) {
    var id = uid('fg');
    _defs += '<radialGradient id="' + id + '"><stop offset="0" stop-color="#ffd27a" stop-opacity="' + a + '"/><stop offset=".45" stop-color="#ff9a3a" stop-opacity="' + (a * 0.45) + '"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>';
    return c(x, y, R, 'url(#' + id + ')');
  }
  function tree(x, y, R) {
    return c(x + 10, y + 14, R, '#000', 'opacity=".35"') + c(x, y, R, '#123d2a', 'stroke="#0a2418" stroke-width="6"') + c(x - R * 0.14, y - R * 0.14, R * 0.74, '#1c5a36') + c(x - R * 0.3, y - R * 0.3, R * 0.4, '#2a7646');
  }
  function bush(x, y, R) {
    var o = c(x + 6, y + 9, R, '#000', 'opacity=".35"') + c(x, y, R, '#1d6a3a', 'stroke="#0d3a20" stroke-width="5"') + c(x - R * 0.2, y - R * 0.2, R * 0.6, '#2a8a4a');
    [[-0.42, -0.1], [0.18, -0.46], [0.4, 0.22], [-0.1, 0.42], [0.02, -0.02]].forEach(function (q) { var bx = x + q[0] * R, by = y + q[1] * R, br = R * 0.19; o += c(bx, by, br, '#c8142e', 'stroke="#6a0a18" stroke-width="3"') + c(bx - br * 0.35, by - br * 0.35, br * 0.32, '#ff8a9a'); });
    return o;
  }
  function rock(x, y, R) {
    return c(x + 5, y + 8, R, '#000', 'opacity=".35"') + c(x, y, R, '#5a6070', 'stroke="#2a2e38" stroke-width="5"') + c(x - R * 0.15, y - R * 0.15, R * 0.72, '#7a8090') + c(x - R * 0.32, y - R * 0.32, R * 0.26, '#a8aebc');
  }
  function fire(x, y, s) {
    var o = '';
    o += rep(9, function (i) { var a = (i * 40 + 10) * Math.PI / 180, sx = Math.cos(a) * 50, sy = Math.sin(a) * 50; return c(sx + 3, sy + 4, 15, '#000', 'opacity=".35"') + c(sx, sy, 15, '#6a707e', 'stroke="#2e323c" stroke-width="4"') + c(sx - 4, sy - 4, 6, '#a4aab8'); });
    o += r(-42, -9, 84, 18, '#5a3418', 9, 'transform="rotate(32)"') + r(-42, -9, 84, 18, '#7a4a24', 9, 'transform="rotate(-32)"') + r(-42, -9, 84, 18, '#8a5a2a', 9, 'transform="rotate(90)"');
    o += star(0, 0, 46, 24, 8, '#ff5a1a', -78) + star(0, 0, 34, 18, 8, '#ff9a1a', -100) + c(0, 0, 17, '#ffd23a') + c(-3, -3, 8, '#fff6c8');
    o += c(-26, -62, 4, '#ffd23a') + c(18, -74, 3, '#ffb21a') + c(34, -50, 3.5, '#ffe27a');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function pick(x, y, rot, s) {
    var o = r(-7, -6, 14, 150, '#8a5a2a', 6, 'stroke="#3a2412" stroke-width="5"') + r(-3, 0, 5, 140, '#b07a3e', 3);
    o += d('M-74 22 C-50 -8 50 -8 74 22 C50 4 -50 4 -74 22 Z', '#b4bccc', 'stroke="#2a2e38" stroke-width="6" stroke-linejoin="round"') + d('M-56 12 C-30 -2 30 -2 56 12', 'none', 'stroke="#f0f4fa" stroke-width="5" stroke-linecap="round"');
    o += r(-14, -2, 28, 22, '#6a4a2a', 5, 'stroke="#3a2412" stroke-width="4"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function player(x, y, s, rot, tool) {
    var o = c(8, 12, 76, '#000', 'opacity=".38"');
    var sid = uid('sk');
    _defs += '<radialGradient id="' + sid + '" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffe9c8"/><stop offset=".6" stop-color="#f4c896"/><stop offset="1" stop-color="#d89a64"/></radialGradient>';
    o += c(0, 0, 72, 'url(#' + sid + ')', 'stroke="#3a2412" stroke-width="8"');
    if (tool) o += pick(150, -10, 60, 0.95);
    o += c(-52, 48, 22, '#f4c896', 'stroke="#3a2412" stroke-width="7"') + c(54, 46, 22, '#f4c896', 'stroke="#3a2412" stroke-width="7"');
    o += e(-24, 22, 9, 11, '#2a1a10') + e(24, 22, 9, 11, '#2a1a10') + c(-21, 18, 3.5, '#fff') + c(27, 18, 3.5, '#fff');
    o += e(-42, 40, 11, 6, '#ff8a7a', 'opacity=".55"') + e(42, 40, 11, 6, '#ff8a7a', 'opacity=".55"');
    o += sk('M-12 44 Q0 52 12 44', '#3a2412', 5);
    o += e(-24, -30, 26, 16, '#fff', 'opacity=".35" transform="rotate(-30 -24 -30)"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ') scale(' + s + ')', o);
  }
  function grass(R, w, h, n, col) {
    return rep(n, function () { var x = R() * w, y = R() * h; return sk('M' + x + ' ' + y + ' l-5 -12 M' + x + ' ' + y + ' l0 -14 M' + x + ' ' + y + ' l5 -12', col, 3); });
  }
  function night(w, h, cx, cy) {
    var id = uid('vg');
    _defs += '<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' + cx + '" cy="' + cy + '" r="' + Math.max(w, h) * 0.8 + '"><stop offset="0" stop-color="#06101e" stop-opacity="0"/><stop offset=".3" stop-color="#06101e" stop-opacity="0"/><stop offset="1" stop-color="#06101e" stop-opacity=".62"/></radialGradient>';
    return r(0, 0, w, h, 'url(#' + id + ')');
  }
  G['starve'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#306844');
      o += grass(rnd(6), 400, 400, 34, '#3a7448');
      o += glow(266, 290, 250, 0.85);
      o += tree(30, 40, 82) + bush(356, 176, 40) + tree(40, 394, 60);
      o += fire(272, 300, 1.12);
      o += player(160, 170, 1.12, -38, true);
      o += night(400, 400, 250, 270);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#28563a');
      var R = rnd(12);
      o += grass(R, 960, 600, 70, '#3a7448');
      o += glow(480, 330, 420, 0.8);
      o += tree(80, 90, 110) + tree(880, 120, 120) + tree(150, 560, 90) + tree(860, 540, 100) + tree(330, 40, 70) + tree(660, 30, 80);
      o += bush(260, 260, 50) + bush(720, 440, 46) + rock(620, 180, 40) + rock(300, 460, 34) + rock(780, 300, 28);
      o += fire(480, 330, 1.5) + player(370, 290, 0.8, -60, true) + player(600, 400, 0.8, 120, false);
      o += night(960, 600, 480, 330);
      return o;
    }
  };
})();
