G['maze-tanks'] = (function () {
  var COL = { g: ['#4a9c3a', '#66bb52', '#2c5e22', '#8fdc78'], r: ['#c9382b', '#e5553f', '#7b2018', '#ff8a70'], b: ['#3264c8', '#4f86e8', '#1d3c7e', '#86b2ff'], y: ['#d39a12', '#f0b92e', '#7f5a06', '#ffd970'] };
  function tank(x, y, rot, s, k, shadow) {
    var C = COL[k], o = '';
    if (shadow !== false) o += g('translate(' + (x + 7 * s) + ',' + (y + 10 * s) + ') rotate(' + rot + ') scale(' + s + ')', r(-32, -42, 64, 84, '#000', 10, 'opacity=".22"') + r(-7, -64, 14, 30, '#000', 4, 'opacity=".22"'));
    var t = r(-31, -41, 15, 82, C[2], 6) + r(16, -41, 15, 82, C[2], 6);
    t += rep(8, function (i) { var yy = -36 + i * 10; return r(-28.5, yy, 10, 4, '#fff', 1, 'opacity=".2"') + r(18.5, yy, 10, 4, '#fff', 1, 'opacity=".2"'); });
    t += r(-22, -37, 44, 74, lg([C[3], C[0], C[0]], 0, 0, 1, 1), 8, 'stroke="' + C[2] + '" stroke-width="3"');
    t += r(-18, -33, 36, 12, '#fff', 5, 'opacity=".2"');
    t += rep(3, function (i) { return r(-12, 22 + i * 4, 24, 2, '#000', 1, 'opacity=".22"'); });
    t += c(-14, -33, 2.4, '#fff3b0', 'stroke="' + C[2] + '" stroke-width="1"') + c(14, -33, 2.4, '#fff3b0', 'stroke="' + C[2] + '" stroke-width="1"');
    t += r(-7, -63, 14, 58, lg([C[3], C[1]], 0, 0, 1, 0), 3.5, 'stroke="' + C[2] + '" stroke-width="3"') + r(-7, -63, 14, 5, C[2], 2);
    t += c(0, 2, 19, rg([[C[3], 0], [C[1], 0.55], [C[0], 1]], 0.35, 0.3, 0.75), 'stroke="' + C[2] + '" stroke-width="3"');
    t += c(0, 2, 13, 'none', 'stroke="#000" stroke-opacity=".18" stroke-width="1.5"') + c(5, 8, 4.6, C[2]) + c(-6, -4, 6, '#fff', 'opacity=".4"');
    return o + g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', t);
  }
  function bullet(x, y, rr) { return c(x + rr * 0.4, y + rr * 0.6, rr, '#000', 'opacity=".18"') + c(x, y, rr, '#151515') + c(x - rr * 0.32, y - rr * 0.36, rr * 0.3, '#fff', 'opacity=".6"'); }
  function wall(x, y, w, h, t) { return r(x + t * 0.35, y + t * 0.5, w, h, '#000', t / 2, 'opacity=".2"') + r(x, y, w, h, '#4a4a4a', t / 2) + r(x, y, w, Math.min(h, t * 0.4), '#6a6a6a', t / 2); }
  function boom(x, y, s) {
    var o = c(x, y, 46 * s, '#ff8a2a', 'opacity=".55"') + c(x, y, 32 * s, '#ffb03a') + c(x, y, 19 * s, '#ffe27a') + c(x, y, 9 * s, '#fff8d8');
    o += rep(8, function (i) { var a = i * Math.PI / 4 + 0.3, r0 = 50 * s, r1 = 68 * s; return ln(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, '#ff9a2e', 7 * s); });
    return o;
  }
  return {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#f4f4f0', '#d6d7cf']));
      o += rep(5, function (i) { return r(i * 80, 0, 1.5, 400, '#000', 0, 'opacity=".05"') + r(0, i * 80, 400, 1.5, '#000', 0, 'opacity=".05"'); });
      o += rep(3, function (i) { return r(i * 160, 0, 80, 80, '#fff', 0, 'opacity=".25"') + r(i * 160 + 80, 160, 80, 80, '#fff', 0, 'opacity=".25"') + r(i * 160, 320, 80, 80, '#fff', 0, 'opacity=".25"'); });
      o += wall(0, 0, 400, 22, 22) + wall(0, 0, 22, 400, 22) + wall(378, 0, 22, 400, 22) + wall(0, 378, 400, 22, 22);
      o += wall(160, 0, 22, 140, 22) + wall(338, 196, 62, 22, 22) + wall(22, 150, 92, 22, 22);
      o += sk('M262 157 L356 60 L296 262', '#1d1d1d', 7, 'stroke-dasharray="0.5 17" opacity=".75"');
      o += bullet(262, 157, 11) + bullet(296, 262, 11);
      o += tank(320, 320, -70, 0.95, 'r');
      o += c(232, 188, 22, '#ffe9a0', 'opacity=".8"') + c(232, 188, 11, '#fff');
      o += tank(150, 270, 45, 1.8, 'g');
      o += e(90, 60, 150, 80, '#fff', 'opacity=".14" transform="rotate(-25 90 60)"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#f1efe6', '#d3cfc0']));
      o += rep(12, function (i) { return rep(8, function (j) { return (i + j) % 2 ? r(i * 80, j * 80, 80, 80, '#fff', 0, 'opacity=".3"') : ''; }); });
      var W = [[0, 0, 960, 18], [0, 0, 18, 600], [942, 0, 18, 600], [0, 582, 960, 18], [160, 0, 18, 180], [160, 160, 180, 18], [320, 160, 18, 180], [80, 320, 258, 18], [480, 80, 18, 260], [480, 80, 160, 18], [640, 240, 18, 200], [640, 420, 200, 18], [800, 80, 18, 200], [800, 80, 142, 18], [160, 420, 18, 180], [320, 480, 200, 18], [500, 420, 18, 78]];
      W.forEach(function (q) { o += wall(q[0], q[1], q[2], q[3], 18); });
      o += sk('M300 260 L420 380 L250 470', '#1d1d1d', 6, 'stroke-dasharray="0.5 16" opacity=".6"');
      o += bullet(420, 380, 8) + bullet(560, 220, 8) + bullet(720, 340, 8) + bullet(250, 470, 8);
      o += tank(240, 240, 135, 1.25, 'g') + tank(590, 520, -60, 1.15, 'r') + tank(870, 200, -100, 1.15, 'b') + tank(90, 110, 160, 1.1, 'y');
      o += boom(730, 160, 1.1);
      o += g('translate(400,90) rotate(18)', r(-18, -18, 36, 36, '#000', 6, 'opacity=".2" transform="translate(4 6)"') + r(-18, -18, 36, 36, '#fafafa', 6, 'stroke="#4d4d4d" stroke-width="3"') + sk('M-9 8 L-3 -4 L3 4 L9 -8', '#4d4d4d', 3.5));
      return o;
    }
  };
})();
