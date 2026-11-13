(function () {
  var VAL = { A: 1, B: 3, C: 3, D: 2, E: 1, G: 2, I: 1, L: 1, M: 3, N: 1, O: 1, P: 3, R: 1, S: 1, T: 1, W: 4, Y: 4, X: 8, Z: 10, Q: 10, K: 5, U: 1, H: 4 };
  var PREM = { T: ['#e8463c', 'TW'], D: ['#f6a3b4', 'DW'], L: ['#9fd3f0', 'DL'], R: ['#2d8fd6', 'TL'] };
  function sq(x, y, s, k) { var f = k ? PREM[k][0] : '#efe6cf'; return r(x + 2, y + 2, s - 4, s - 4, f, s * 0.08) + (k ? t(x + s / 2, y + s * 0.62, PREM[k][1], s * 0.3, '#fff', { w: 800 }) : ''); }
  function tile(x, y, s, L) {
    return r(x + 3, y + 3 + s * 0.08, s - 6, s - 6, '#000', s * 0.12, 'opacity=".3"') + r(x + 3, y + 3 + s * 0.05, s - 6, s - 6, '#b98c4e', s * 0.12) + r(x + 3, y + 3, s - 6, s - 6, lg(['#ffe8b8', '#f2cf8c']), s * 0.12) + r(x + s * 0.12, y + s * 0.1, s * 0.56, s * 0.1, '#fff', s * 0.05, 'opacity=".6"') +
      t(x + s * 0.46, y + s * 0.72, L, s * 0.58, '#3a2410', { w: 900 }) + t(x + s * 0.8, y + s * 0.86, VAL[L], s * 0.2, '#3a2410', { w: 800 });
  }
  function board(x0, y0, s, n, m, prem) { var o = ''; for (var j = 0; j < m; j++) for (var i = 0; i < n; i++) o += sq(x0 + i * s, y0 + j * s, s, prem[(i * 7 + j * 3) % prem.length]); return o; }
  function word(x0, y0, s, w, i0, j0, down) { return w.split('').map(function (L, k) { return tile(x0 + (i0 + (down ? 0 : k)) * s, y0 + (j0 + (down ? k : 0)) * s, s, L); }).join(''); }
  G['scrabble'] = {
    icon: function () {
      var s = 80, o = r(0, 0, 400, 400, '#1f6b5a') + board(0, 0, s, 5, 5, ['', 'L', '', 'D', '', '', 'T', '', 'R', '']);
      o += word(0, 0, s, 'WORDS', 0, 1, 0) + word(0, 0, s, 'NE', 1, 2, 1) + word(0, 0, s, 'AY', 4, 2, 1);
      return o;
    },
    bg: function () {
      var s = 64, o = r(0, 0, 960, 600, '#1f6b5a') + board(0, 0, s, 15, 10, ['', 'L', '', '', 'D', '', '', 'T', '', 'R', '', '']);
      o += word(0, 0, s, 'PLAY', 2, 2, 0) + word(0, 0, s, 'LETTER', 3, 2, 1) + word(0, 0, s, 'TILES', 4, 5, 0) + word(0, 0, s, 'MIX', 9, 1, 1) + word(0, 0, s, 'QUIZ', 10, 7, 0) + word(0, 0, s, 'BOARD', 12, 2, 1);
      return o;
    }
  };
})();
