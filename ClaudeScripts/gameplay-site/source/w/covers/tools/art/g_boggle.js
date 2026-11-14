(function () {
  function cube(x, y, s, L, rot, hi) {
    var top = hi ? '#ffe36a' : '#ffffff', side = hi ? '#d9a800' : '#b6bfd4';
    return r(x + 4, y + 8, s, s, '#000', s * 0.18, 'opacity=".35"') + r(x, y + s * 0.08, s, s, side, s * 0.18) + r(x, y, s, s * 0.94, top, s * 0.18) + r(x + s * 0.1, y + s * 0.06, s * 0.6, s * 0.14, '#fff', s * 0.07, 'opacity=".8"') +
      t(x + s / 2, y + s * 0.66, L, L.length > 1 ? s * 0.42 : s * 0.56, '#14224a', { w: 900, tr: 'rotate(' + rot + ' ' + (x + s / 2) + ' ' + (y + s * 0.47) + ')' });
  }
  function tray(x, y, w, h, rr) { return r(x + 8, y + 16, w, h, '#000', rr, 'opacity=".35"') + r(x, y + 10, w, h, '#0b3a8f', rr) + r(x, y, w, h, lg(['#3d8cff', '#1a56d6']), rr) + r(x + w * 0.04, y + h * 0.03, w * 0.92, h * 0.94, '#0d3c94', rr * 0.7); }
  G['boggle'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ff9d2e', '#ff5d2e'], 0, 0, 1, 1));
      o += tray(18, 18, 364, 364, 54);
      var G4 = [['T', 'A', 'S', 'E'], ['H', 'W', 'O', 'R'], ['Qu', 'I', 'N', 'D'], ['L', 'E', 'M', 'P']], R = [[-8, 6, 0, 10], [4, 0, -6, 0], [0, 12, -4, 0], [6, -10, 4, -6]], H = { '1,1': 1, '1,2': 1, '1,3': 1, '2,3': 1 }, s = 76, gp = 7, x0 = 46, y0 = 42;
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) o += cube(x0 + i * (s + gp), y0 + j * (s + gp), s, G4[j][i], H[j + ',' + i] ? 0 : R[j][i], H[j + ',' + i]);
      var P = function (i, j) { return (x0 + i * (s + gp) + s / 2) + ' ' + (y0 + j * (s + gp) + s * 0.47); };
      o += sk('M' + P(1, 1) + ' L' + P(2, 1) + ' L' + P(3, 1) + ' L' + P(3, 2), '#ff3b6b', 12, 'opacity=".75"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ff8a2e', '#d6402a'])), q = rnd(8), A = 'AEIOUSTRNLDGBMPHQWYKC';
      o += tray(200, 20, 560, 560, 60);
      for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) o += cube(236 + i * 100, 52 + j * 100, 90, A[Math.floor(q() * A.length)], Math.floor(q() * 4) * 90, 0);
      o += g('translate(110,300)', r(-50, -150, 100, 20, '#7a3d14', 8) + r(-50, 130, 100, 20, '#7a3d14', 8) + d('M-40 -130 L40 -130 L6 0 L40 130 L-40 130 L-6 0 Z', '#dff4ff', 'opacity=".85"') + d('M-26 -80 L26 -80 L4 -6 L-4 -6 Z', '#ffd27a') + d('M-30 128 L30 128 L4 40 L-4 40 Z', '#ffd27a'));
      return o;
    }
  };
})();
