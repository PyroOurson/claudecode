(function () {
  var BL = '#2463eb', RD = '#ef3b4a';
  function paper(w, h, s) {
    return r(0, 0, w, h, '#fbfcff') + rep(Math.ceil(w / s) + 1, function (i) { return ln(i * s, 0, i * s, h, '#c9dcf5', 2); }) + rep(Math.ceil(h / s) + 1, function (j) { return ln(0, j * s, w, j * s, '#c9dcf5', 2); });
  }
  function pencil(x, y, L, rot, s) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')',
      r(4, -12, L, 36, '#000', 8, 'opacity=".22"') + r(0, -18, L, 36, '#ffc21a', 6) + r(0, -18, L, 12, '#ffe07a', 6) + r(0, 6, L, 12, '#e29a00', 0) +
      r(L - 6, -18, 34, 36, '#c9ccd6', 4) + r(L + 24, -18, 30, 36, '#ff7f9c', 10) + p([[0, -18], [-44, 0], [0, 18]], '#f2c99a') + p([[-30, -6], [-44, 0], [-30, 6]], '#2a2a35'));
  }
  function board(x0, y0, s, H, V, boxes, dot) {
    var o = '';
    boxes.forEach(function (b) { var col = b[2] ? RD : BL; o += r(x0 + b[0] * s, y0 + b[1] * s, s, s, col, 0, 'opacity=".2"') + t(x0 + b[0] * s + s / 2, y0 + b[1] * s + s * 0.66, b[2] ? 'R' : 'B', s * 0.46, col, { font: 'Luckiest Guy', w: 400 }); });
    H.forEach(function (l) { o += ln(x0 + l[0] * s, y0 + l[1] * s, x0 + (l[0] + 1) * s, y0 + l[1] * s, l[2] ? RD : BL, s * 0.09); });
    V.forEach(function (l) { o += ln(x0 + l[0] * s, y0 + l[1] * s, x0 + l[0] * s, y0 + (l[1] + 1) * s, l[2] ? RD : BL, s * 0.09); });
    return o + dot;
  }
  function dots(x0, y0, s, n, m, R) { var o = ''; for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) o += c(x0 + i * s + 2, y0 + j * s + 3, R, '#000', 'opacity=".2"') + c(x0 + i * s, y0 + j * s, R, '#1e2433'); return o; }
  G['dots-boxes'] = {
    icon: function () {
      var o = paper(400, 400, 25), s = 110, x0 = 35, y0 = 35;
      o += board(x0, y0, s, [[0, 0, 0], [1, 0, 1], [2, 0, 1], [0, 1, 0], [1, 1, 1], [0, 2, 0], [2, 2, 1], [0, 3, 0], [1, 3, 0], [2, 1, 1]], [[0, 0, 0], [1, 0, 0], [2, 0, 1], [3, 0, 1], [0, 1, 0], [1, 1, 1], [0, 2, 0], [3, 2, 1], [3, 1, 1]], [[0, 0, 0], [0, 1, 0], [2, 0, 1]], dots(x0, y0, s, 4, 4, 13));
      o += ln(x0 + 2 * s, y0 + 2 * s, x0 + 2 * s, y0 + 3 * s, RD, s * 0.09, 'opacity=".35" stroke-dasharray="10 14"');
      o += pencil(262, 310, 170, -42, 0.95);
      return o;
    },
    bg: function () {
      var o = paper(960, 600, 30), s = 90, x0 = 75, y0 = 30, q = rnd(4), H = [], V = [], B = [];
      for (var i = 0; i < 10; i++) for (var j = 0; j < 7; j++) { if (q() < 0.6) H.push([i, j, q() < 0.5 ? 1 : 0]); if (q() < 0.6) V.push([i, j, q() < 0.5 ? 1 : 0]); if (q() < 0.2) B.push([i, j, q() < 0.5 ? 1 : 0]); }
      o += board(x0, y0, s, H.filter(function (h) { return h[0] < 9; }), V.filter(function (v) { return v[1] < 6; }), B.filter(function (b) { return b[0] < 9 && b[1] < 6; }), dots(x0, y0, s, 10, 7, 11));
      o += pencil(700, 470, 260, -30, 1.1);
      return o;
    }
  };
})();
