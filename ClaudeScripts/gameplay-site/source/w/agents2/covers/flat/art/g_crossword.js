(function () {
  function grid(x0, y0, s, L, act, cur, nums, fs) {
    var o = '';
    L.forEach(function (row, j) {
      for (var i = 0; i < row.length; i++) {
        var x = x0 + i * s, y = y0 + j * s, ch = row[i];
        if (ch === '#') { o += r(x, y, s, s, '#14161c'); continue; }
        var f = (cur && cur[0] === i && cur[1] === j) ? '#ffd52e' : (act === j ? '#a7d8ff' : '#fff');
        o += r(x, y, s, s, f) + (ch !== '.' ? t(x + s / 2, y + s * 0.78, ch, fs || s * 0.6, '#14161c', { w: 700 }) : '');
      }
    });
    for (var i = 0; i <= L[0].length; i++) o += ln(x0 + i * s, y0, x0 + i * s, y0 + L.length * s, '#14161c', s * 0.035);
    for (var j = 0; j <= L.length; j++) o += ln(x0, y0 + j * s, x0 + L[0].length * s, y0 + j * s, '#14161c', s * 0.035);
    (nums || []).forEach(function (n) { o += t(x0 + n[0] * s + s * 0.08, y0 + n[1] * s + s * 0.26, n[2], s * 0.22, '#14161c', { w: 700, a: 'start' }); });
    return o;
  }
  G['crossword'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a3f4f', '#16181f']));
      o += r(30, 40, 340, 340, '#000', 14, 'opacity=".45"') + r(30, 30, 340, 340, '#fff', 14);
      var s = 68;
      o += grid(30, 30, s, ['#SWAP', 'PLANE', 'ALOE.', 'MOVE.', '#WE.#'], 2, [4, 2], [[1, 0, 1], [2, 0, 2], [3, 0, 3], [4, 0, 4], [0, 1, 5], [0, 2, 6], [0, 3, 7], [1, 4, 8]]);
      o += r(30, 30, 340, 340, 'none', 14, 'stroke="#14161c" stroke-width="8"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#ece6d6');
      o += rep(14, function (j) { return r(20, 20 + j * 42, 260, 14, '#b8b0a0', 6) + r(700, 20 + j * 42, 240, 14, '#b8b0a0', 6); });
      o += grid(300, 30, 72, ['#CAT#.', 'HOUSE#', 'ARENA.', 'IRATE.', 'R#.NET', '#..##.', '.#.#..', '......'], 2, [3, 2], [[1, 0, 1], [0, 1, 2], [0, 2, 3]]);
      return o;
    }
  };
})();
