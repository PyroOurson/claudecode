(function () {
  var PC = { r: '#ff3b4a', y: '#ffd21f', g: '#22c55e', b: '#2f7df6', o: '#ff8a1f', p: '#b14cff' };
  function peg(x, y, R, f) { return c(x + R * 0.12, y + R * 0.25, R, '#000', 'opacity=".45"') + c(x, y, R, f) + c(x + R * 0.18, y + R * 0.18, R * 0.75, '#000', 'opacity=".2"') + e(x - R * 0.32, y - R * 0.36, R * 0.34, R * 0.22, '#fff', 'opacity=".85" transform="rotate(-35 ' + (x - R * 0.32) + ' ' + (y - R * 0.36) + ')"'); }
  function hole(x, y, R) { return c(x, y, R, '#0c0e14') + c(x, y + R * 0.2, R * 0.8, '#262a36'); }
  function key(x, y, R, k) { return k ? peg(x, y, R, k === 'w' ? '#f4f4f4' : '#1a1a1a') + (k === 'b' ? c(x, y, R, 'none', 'stroke="#555" stroke-width="1.5"') : '') : hole(x, y, R * 0.7); }
  function row(x0, y, s, R, code, keys) {
    var o = r(x0 - s * 0.6, y - s * 0.55, s * 5.6, s * 1.1, '#000', s * 0.2, 'opacity=".15"');
    code.split('').forEach(function (k, i) { o += k === '_' ? hole(x0 + i * s, y, R * 0.55) : peg(x0 + i * s, y, R, PC[k]); });
    keys.split('').forEach(function (k, i) { o += key(x0 + 4 * s + (i % 2) * s * 0.42 - s * 0.05, y - s * 0.2 + Math.floor(i / 2) * s * 0.42, R * 0.32, k === '_' ? '' : k); });
    return o;
  }
  G['mastermind'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a4152', '#151821']));
      o += rep(10, function (i) { return ln(0, i * 44, 400, i * 44 - 30, '#fff', 1.5, 'opacity=".05"'); });
      var s = 72, x0 = 64;
      o += r(26, 26, 348, 82, '#0b0d12', 20) + r(30, 22, 340, 80, lg(['#9aa3b8', '#5e667a']), 20) + rep(4, function (i) { return t(x0 + i * s, 82, '?', 50, '#fff', { w: 900 }); }) + r(40, 28, 320, 16, '#fff', 8, 'opacity=".25"');
      o += row(x0, 162, s, 28, 'rybg', 'wb__') + row(x0, 246, s, 28, 'gyrp', 'bbw_') + row(x0, 330, s, 28, 'yrgb', 'bbbb');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2c3242', '#11141b'])), q = rnd(6), K = 'rygbop';
      o += r(240, -20, 480, 640, '#1c202b', 30);
      for (var j = 0; j < 8; j++) { var code = '', keys = ''; for (var i = 0; i < 4; i++) { code += j < 6 ? K[Math.floor(q() * 6)] : '_'; keys += j < 6 ? 'wb_'[Math.floor(q() * 3)] : '_'; } o += row(320, 40 + j * 74, 74, 26, code, keys); }
      o += peg(110, 150, 36, PC.r) + peg(170, 230, 36, PC.y) + peg(90, 320, 36, PC.g) + peg(860, 300, 36, PC.b) + peg(820, 400, 36, PC.o) + peg(880, 480, 36, PC.p);
      return o;
    }
  };
})();
