(function () {
  var T = {
    wheat: ['#f2c230', '#c99a10'], forest: ['#2e9a44', '#1b6a2c'], brick: ['#d0623a', '#9a3c1c'], sheep: ['#9ad65a', '#64a032'], ore: ['#9aa1ad', '#626a78'], desert: ['#ecd49a', '#c4a868']
  };
  function hexPts(cx, cy, R) { var q = []; for (var i = 0; i < 6; i++) { var a = (60 * i - 90) * Math.PI / 180; q.push([+(cx + R * Math.cos(a)).toFixed(1), +(cy + R * Math.sin(a)).toFixed(1)]); } return q; }
  function deco(k, cx, cy, R) {
    var o = '', s = R / 70;
    if (k === 'forest') [[-22, 8], [18, 14], [-2, -18]].forEach(function (q) { var x = cx + q[0] * s, y = cy + q[1] * s; o += r(x - 3 * s, y + 10 * s, 6 * s, 12 * s, '#6b3a17') + p([[x, y - 26 * s], [x + 18 * s, y + 12 * s], [x - 18 * s, y + 12 * s]], '#14592a') + p([[x, y - 26 * s], [x + 18 * s, y + 12 * s], [x, y + 12 * s]], '#0d4420'); });
    if (k === 'wheat') [-16, 0, 16].forEach(function (dx) { var x = cx + dx * s; o += ln(x, cy + 26 * s, x, cy - 10 * s, '#a87a08', 3 * s) + rep(4, function (i) { return e(x - 5 * s, cy - 6 * s + i * 8 * s, 5 * s, 3 * s, '#fff2a8', 'transform="rotate(-30 ' + (x - 5 * s) + ' ' + (cy - 6 * s + i * 8 * s) + ')"') + e(x + 5 * s, cy - 6 * s + i * 8 * s, 5 * s, 3 * s, '#fff2a8', 'transform="rotate(30 ' + (x + 5 * s) + ' ' + (cy - 6 * s + i * 8 * s) + ')"'); }); });
    if (k === 'brick') [[-18, -6], [6, -6], [-6, 8], [18, 8], [-30, 8]].forEach(function (q) { o += r(cx + q[0] * s - 11 * s, cy + q[1] * s, 22 * s, 11 * s, '#f08a5a', 2 * s, 'stroke="#8a2c10" stroke-width="' + 2 * s + '"'); });
    if (k === 'sheep') [[-14, 4], [16, -6]].forEach(function (q) { var x = cx + q[0] * s, y = cy + q[1] * s; o += rep(5, function (i) { return c(x - 10 * s + i * 5 * s, y + (i % 2 ? -4 : 2) * s, 8 * s, '#fff'); }) + c(x + 14 * s, y - 2 * s, 6 * s, '#3a3a3a') + ln(x - 6 * s, y + 8 * s, x - 6 * s, y + 16 * s, '#3a3a3a', 3 * s) + ln(x + 6 * s, y + 8 * s, x + 6 * s, y + 16 * s, '#3a3a3a', 3 * s); });
    if (k === 'ore') o += p([[cx - 34 * s, cy + 22 * s], [cx - 8 * s, cy - 26 * s], [cx + 16 * s, cy + 22 * s]], '#4a515e') + p([[cx - 8 * s, cy - 26 * s], [cx + 2 * s, cy - 8 * s], [cx - 16 * s, cy - 10 * s]], '#fff') + p([[cx - 2 * s, cy + 22 * s], [cx + 18 * s, cy - 10 * s], [cx + 38 * s, cy + 22 * s]], '#5a6270') + p([[cx + 18 * s, cy - 10 * s], [cx + 26 * s, cy + 2 * s], [cx + 12 * s, cy]], '#fff');
    if (k === 'desert') o += d('M' + (cx - 30 * s) + ' ' + (cy + 14 * s) + ' Q' + cx + ' ' + (cy - 14 * s) + ' ' + (cx + 30 * s) + ' ' + (cy + 14 * s) + ' Z', '#d8b870');
    return o;
  }
  function hex(cx, cy, R, k) {
    var q = T[k];
    return p(hexPts(cx, cy + R * 0.08, R), '#000', 'opacity=".25"') + p(hexPts(cx, cy, R), '#f4e4b8') + p(hexPts(cx, cy, R * 0.9), q[0]) + p(hexPts(cx, cy, R * 0.9).slice(0, 4).concat([[cx, cy]]), '#fff', 'opacity=".08"') + deco(k, cx, cy, R);
  }
  function token(cx, cy, R, n) { var red = n === 6 || n === 8; return c(cx + 2, cy + 4, R, '#000', 'opacity=".3"') + c(cx, cy, R, '#fbf1d6') + c(cx, cy, R, 'none', 'stroke="#c8a868" stroke-width="' + R * 0.08 + '"') + t(cx, cy + R * 0.36, n, R * 1.0, red ? '#d0201a' : '#2a1a0a', { w: 900 }); }
  function settle(x, y, s, f, dk) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(4, 4, 26, 7, '#000', 'opacity=".3"') + r(-24, -26, 48, 26, dk, 3) + p([[-24, -3], [24, -3], [24, -26], [0, -46], [-24, -26]], f) + r(-6, -16, 12, 13, dk, 2) + p([[0, -40], [18, -22], [18, 0], [6, 0], [6, -26]], dk, 'opacity=".55"') + p([[-18, -22], [0, -40], [4, -36], [-12, -21]], '#fff', 'opacity=".4"')); }
  function road(x1, y1, x2, y2, w, f, dk) { return ln(x1, y1 + w * 0.3, x2, y2 + w * 0.3, dk, w) + ln(x1, y1, x2, y2, f, w) + ln(x1, y1 - w * 0.2, x2, y2 - w * 0.2, '#fff', w * 0.2, 'opacity=".45"'); }
  function sea(w, h) { return r(0, 0, w, h, lg(['#3aa0e8', '#1a64b8'])) + rep(14, function (i) { var x = (i * 137) % w, y = (i * 89) % h; return sk('M' + x + ' ' + y + ' q12 -8 24 0 t24 0', '#bfe6ff', 3, 'opacity=".5"'); }); }
  G['catan'] = {
    icon: function () {
      var R = 76, H = R * Math.sqrt(3), o = sea(400, 400), cx = 200, cy = 206;
      var cells = [[0, 0, 'wheat'], [H, 0, 'forest'], [-H, 0, 'sheep'], [H / 2, -1.5 * R, 'ore'], [-H / 2, -1.5 * R, 'brick'], [H / 2, 1.5 * R, 'wheat'], [-H / 2, 1.5 * R, 'forest']];
      cells.forEach(function (q) { o += hex(cx + q[0], cy + q[1], R, q[2]); });
      o += token(cx, cy + 6, 30, 8);
      var V = function (dx, dy, k) { var a = (60 * k - 90) * Math.PI / 180; return [cx + dx + R * Math.cos(a), cy + dy + R * Math.sin(a)]; };
      var a = V(0, 0, 4), b = V(0, 0, 5), c2 = V(0, 0, 0);
      o += road(b[0], b[1], c2[0], c2[1], 20, '#e8322c', '#8e1512') + settle(b[0], b[1] + 22, 1.7, '#e8322c', '#8e1512');
      var e1 = V(0, 0, 3), e2 = V(0, 0, 2);
      o += road(e1[0], e1[1], e2[0], e2[1], 20, '#2d7cf0', '#1650b0') + settle(e2[0], e2[1] + 22, 1.7, '#2d7cf0', '#1650b0');
      return o;
    },
    bg: function () {
      var R = 92, H = R * Math.sqrt(3), o = sea(960, 600), K = ['wheat', 'forest', 'brick', 'sheep', 'ore', 'forest', 'wheat', 'sheep', 'brick', 'ore', 'desert', 'sheep', 'wheat', 'forest', 'ore', 'brick', 'wheat', 'sheep', 'forest'], n = 0, N = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];
      [[-2, 3], [-1, 4], [0, 5], [1, 4], [2, 3]].forEach(function (rowDef) { var j = rowDef[0], cnt = rowDef[1]; for (var i = 0; i < cnt; i++) { var x = 480 + (i - (cnt - 1) / 2) * H, y = 300 + j * 1.5 * R, k = K[n % K.length]; o += hex(x, y, R, k) + (k !== 'desert' ? token(x, y + 8, 26, N[n % N.length]) : ''); n++; } });
      return o;
    }
  };
})();
