(function () {
  var COL = { B: ['#2f7df6', '#8fc0ff', '#1648a8'], Y: ['#ffcf1f', '#fff08a', '#c48a00'], R: ['#f2353b', '#ff9a9a', '#9e1418'], G: ['#26c04e', '#9af0a8', '#11782a'] };
  function cell(x, y, s, k) {
    var q = COL[k], b = s * 0.14;
    return r(x + 2, y + 2, s - 4, s - 4, q[2], s * 0.12) + p([[x + 2, y + 2], [x + s - 2, y + 2], [x + s - b, y + b], [x + b, y + b], [x + b, y + s - b], [x + 2, y + s - 2]], q[1], 'opacity=".9"') + r(x + b, y + b, s - 2 * b, s - 2 * b, q[0], s * 0.06) + r(x + b + s * 0.06, y + b + s * 0.06, s * 0.28, s * 0.12, '#fff', s * 0.06, 'opacity=".55"');
  }
  function grid(x0, y0, n, m, s) {
    var o = r(x0, y0, n * s, m * s, '#e9ecf2');
    for (var i = 0; i <= n; i++) o += ln(x0 + i * s, y0, x0 + i * s, y0 + m * s, '#c3c9d6', 2);
    for (var j = 0; j <= m; j++) o += ln(x0, y0 + j * s, x0 + n * s, y0 + j * s, '#c3c9d6', 2);
    return o;
  }
  function piece(x0, y0, s, cells, k) { return cells.map(function (q) { return cell(x0 + q[0] * s, y0 + q[1] * s, s, k); }).join(''); }
  G['blokus'] = {
    icon: function () {
      var s = 50, o = grid(0, 0, 8, 8, s);
      o += piece(0, 0, s, [[1, 1], [2, 1], [3, 1], [1, 2], [1, 3]], 'B') + piece(0, 0, s, [[4, 2], [5, 2], [5, 3], [6, 3], [5, 4]], 'Y') + piece(0, 0, s, [[2, 4], [2, 5], [3, 5], [4, 5], [3, 6]], 'R') + piece(0, 0, s, [[6, 5], [5, 6], [6, 6], [7, 6], [6, 7]], 'G');
      o += piece(0, 0, s, [[6, 0], [7, 0], [7, 1]], 'B') + piece(0, 0, s, [[0, 5], [0, 6], [0, 7], [1, 7]], 'Y') + piece(0, 0, s, [[4, 7]], 'R') + piece(0, 0, s, [[3, 3]], 'G');
      return o;
    },
    bg: function () {
      var s = 48, o = r(0, 0, 960, 600, '#5a6478') + grid(0, 0, 20, 13, s), q = rnd(9), K = ['B', 'Y', 'R', 'G'];
      var shapes = [[[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]];
      for (var k = 0; k < 26; k++) o += piece(Math.floor(q() * 18) * s, Math.floor(q() * 11) * s, s, shapes[Math.floor(q() * shapes.length)], K[k % 4]);
      return o;
    }
  };
})();
