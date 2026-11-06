(function () {
  function runs(a) { var o = [], n = 0; a.forEach(function (v) { if (v) n++; else if (n) { o.push(n); n = 0; } }); if (n) o.push(n); return o.length ? o : [0]; }
  function puzzle(x0, y0, s, pic, cw, fill, fs) {
    var R = pic.length, C = pic[0].length, o = '';
    o += r(x0 - cw, y0 - cw, cw + C * s, cw, '#e4e9f2') + r(x0 - cw, y0, cw, R * s, '#e4e9f2');
    for (var j = 0; j < R; j++) for (var i = 0; i < C; i++) {
      var x = x0 + i * s, y = y0 + j * s, v = pic[j][i];
      o += r(x, y, s, s, '#fff');
      if (v === 'X') o += r(x + s * 0.06, y + s * 0.06, s * 0.88, s * 0.88, fill, s * 0.1) + r(x + s * 0.14, y + s * 0.12, s * 0.42, s * 0.12, '#fff', s * 0.06, 'opacity=".35"');
      else if (v === 'x') o += sk('M' + (x + s * 0.32) + ' ' + (y + s * 0.32) + ' L' + (x + s * 0.68) + ' ' + (y + s * 0.68) + ' M' + (x + s * 0.68) + ' ' + (y + s * 0.32) + ' L' + (x + s * 0.32) + ' ' + (y + s * 0.68), '#a9b2c4', s * 0.07);
    }
    for (var k = 0; k <= C; k++) o += ln(x0 + k * s, y0 - cw, x0 + k * s, y0 + R * s, k % 5 ? '#b8c2d4' : '#3a4560', k % 5 ? 2 : 4);
    for (k = 0; k <= R; k++) o += ln(x0 - cw, y0 + k * s, x0 + C * s, y0 + k * s, k % 5 ? '#b8c2d4' : '#3a4560', k % 5 ? 2 : 4);
    for (j = 0; j < R; j++) { var rr = runs(pic[j].split('').map(function (v) { return v === 'X'; })); rr.forEach(function (n, m) { o += t(x0 - s * 0.2 - (rr.length - 1 - m) * fs * 0.95, y0 + j * s + s * 0.66, n, fs, '#2a3550', { w: 800, a: 'end' }); }); }
    for (i = 0; i < C; i++) { var cr = runs(pic.map(function (row) { return row[i] === 'X'; })); cr.forEach(function (n, m) { o += t(x0 + i * s + s / 2, y0 - cw + cw - (cr.length - m) * fs * 1.05 + fs * 0.8, n, fs, '#2a3550', { w: 800 }); }); }
    return o;
  }
  G['nonogram'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ff8fb1', '#e84a7f'], 0, 0, 1, 1));
      o += r(22, 30, 356, 356, '#a8204f', 22, 'opacity=".45"') + r(22, 22, 356, 356, '#f4f6fb', 22);
      o += puzzle(126, 126, 46, ['.X.X.', 'XXXXX', 'XXXXX', 'xXXXx', 'x.X.x'], 96, '#e8264f', 30);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#ff8fb1', '#c93a6a']));
      o += r(170, -10, 620, 620, '#f4f6fb', 20);
      o += puzzle(330, 150, 44, ['..XXXX....', '.XXXXXX...', 'XX.XX.XX..', 'XXXXXXXX..', '.XX..XX...', '..XXXX....', '.X.XX.X...', 'X........X', 'xxxxxxxxxx', '..........'], 150, '#2a3550', 24);
      return o;
    }
  };
})();
