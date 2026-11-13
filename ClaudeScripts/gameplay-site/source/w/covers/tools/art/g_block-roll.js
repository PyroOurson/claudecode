G['block-roll'] = {
  iso: function (ox, oy, a, b, th) {
    var P = function (i, j, z) { return [ox + (i - j) * a, oy + (i + j) * b - (z || 0)]; };
    var q = function (pts) { return pts.map(function (v) { return v[0].toFixed(1) + ',' + v[1].toFixed(1); }).join(' '); };
    return {
      tile: function (i, j, top, side1, side2, line) {
        var t0 = P(i, j), t1 = P(i + 1, j), t2 = P(i + 1, j + 1), t3 = P(i, j + 1), dn = function (v) { return [v[0], v[1] + th]; };
        var s = p(q([t3, t2, dn(t2), dn(t3)]), side1) + p(q([t2, t1, dn(t1), dn(t2)]), side2);
        s += p(q([t0, t1, t2, t3]), top, 'stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"');
        var k = .14, ins = function (u, v) { return P(i + u, j + v); };
        s += p(q([ins(k, k), ins(1 - k, k), ins(1 - k, 1 - k), ins(k, 1 - k)]), 'none', 'stroke="#fff" stroke-opacity=".22" stroke-width="2"');
        return s;
      },
      hole: function (i, j, glow) {
        var t0 = P(i, j), t1 = P(i + 1, j), t2 = P(i + 1, j + 1), t3 = P(i, j + 1);
        return p(q([t0, t1, t2, t3]), '#1a0604') + p(q([t0, t1, P(i + 1, j + .25), P(i, j + .25)]), '#3a1008') + p(q([t0, P(i + .2, j), P(i + .2, j + 1), t3]), '#2a0a06') + p(q([t0, t1, t2, t3]), 'none', 'stroke="' + glow + '" stroke-width="5" stroke-linejoin="round"');
      },
      box: function (i, j, w, d, h, top, left, right, hi) {
        var a0 = P(i, j, h), a1 = P(i + w, j, h), a2 = P(i + w, j + d, h), a3 = P(i, j + d, h), b1 = P(i + w, j), b2 = P(i + w, j + d), b3 = P(i, j + d);
        var s = p(q([a3, a2, b2, b3]), left) + p(q([a2, a1, b1, b2]), right) + p(q([a0, a1, a2, a3]), top);
        s += sk('M' + a3.join(',') + 'L' + a2.join(',') + 'L' + a1.join(','), hi, 3, 'opacity=".55"');
        s += sk('M' + a2.join(',') + 'L' + b2.join(','), hi, 2.5, 'opacity=".35"');
        return s;
      },
      P: P
    };
  },
  rust: function (x, y, w, h, n, seed) {
    var s = '', k = seed;
    var R = function () { k = k * 16807 % 2147483647; return k / 2147483647; };
    for (var i = 0; i < n; i++) s += e(x + R() * w, y + R() * h, 3 + R() * 9, 2 + R() * 6, R() < .5 ? '#4a1608' : '#c8703e', 'opacity="' + (.18 + R() * .25).toFixed(2) + '"');
    return s;
  },
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#ff7a36', '#d42a0a', '#6a0800']));
    o += e(110, 70, 220, 150, rg([['#ffd0a0', 0], ['#ffa060', .5], ['#ff7030', 1]]), 'opacity=".22"');
    var I = G['block-roll'].iso(200, 150, 66, 33, 20);
    o += e(200, 335, 190, 52, '#2a0200', 'opacity=".35"');
    var cells = [];
    for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) cells.push([i, j]);
    cells.sort(function (u, v) { return (u[0] + u[1]) - (v[0] + v[1]); });
    cells.forEach(function (cc) {
      if (cc[0] === 2 && cc[1] === 2) o += I.hole(2, 2, '#ffc070');
      else o += I.tile(cc[0], cc[1], lg(['#eef0f3', '#b9bdc7']), '#7c818c', '#9ba1ab', '#6a707c');
    });
    var hc = I.P(2.5, 2.5);
    o += e(hc[0], hc[1], 50, 24, rg([['#ffe0a0', 0], ['#ff9a40', .55], ['#ff9a40', 1]]), 'opacity=".5"');
    var s0 = I.P(1, 2), s1 = I.P(2, 1), s2 = I.P(3.2, 1.6), s3 = I.P(2.2, 2.6);
    o += p([s0, s1, s2, s3].map(function (v) { return v.join(','); }).join(' '), '#3a0a04', 'opacity=".25"');
    o += I.box(1, 1, 1, 1, 152, lg(['#ea9864', '#c86c3c']), lg(['#b0522e', '#76301a']), lg(['#8e3c20', '#561e0c']), '#ffd8b4');
    var L0 = I.P(1, 2, 152), R0 = I.P(2, 2, 152);
    o += G['block-roll'].rust(L0[0] + 6, L0[1] + 12, 54, 156, 26, 77);
    o += G['block-roll'].rust(R0[0] + 6, R0[1] - 22, 54, 156, 22, 191);
    o += sk('M' + (L0[0] + 10) + ',' + (L0[1] + 18) + 'l0,124', '#ffd8b4', 6, 'opacity=".32"');
    var T = I.P(1.5, 1.5, 152);
    o += e(T[0] - 8, T[1] - 2, 22, 9, '#fff', 'opacity=".28"');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#4a0600', '#b81c04', '#d83410', '#6e0c00']));
    var k = 9157, R = function () { k = k * 16807 % 2147483647; return k / 2147483647; };
    for (var i = 0; i < 16; i++) o += e(R() * 960, R() * 600, 120 + R() * 220, 24 + R() * 50, '#200000', 'opacity="' + (.15 + R() * .25).toFixed(2) + '" transform="rotate(' + ((R() - .5) * 20).toFixed(1) + ' 480 300)"');
    for (var j = 0; j < 8; j++) o += e(R() * 960, 200 + R() * 300, 100 + R() * 200, 20 + R() * 40, '#ff6a2a', 'opacity="' + (.08 + R() * .14).toFixed(2) + '"');
    for (var m = 0; m < 50; m++) o += c(R() * 960, R() * 420, R() < .2 ? 2.4 : 1.3, '#fff', 'opacity="' + (.2 + R() * .5).toFixed(2) + '"');
    var I = G['block-roll'].iso(470, 150, 58, 29, 18);
    var map = ['oooo', 'oooooo', 'oooooooo', ' ooffooooo', '  offoooo', '   oooHoo', '    oooo'];
    var cells = [];
    map.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row[x] !== ' ') cells.push([x, y, row[x]]); });
    cells.sort(function (u, v) { return (u[0] + u[1]) - (v[0] + v[1]); });
    cells.forEach(function (cc) {
      var x = cc[0] - 4, y = cc[1] - 1;
      if (cc[2] === 'H') o += I.hole(x, y, '#ffc070');
      else if (cc[2] === 'f') o += I.tile(x, y, lg(['#f7a058', '#d8702c']), '#8a3c10', '#b0561c', '#8a3c10');
      else o += I.tile(x, y, lg(['#d8dbe0', '#aeb3bc']), '#6c717c', '#8c929c', '#62687a');
    });
    o += I.box(-3, 1, 2, 1, 116, lg(['#e08a58', '#c46a3a']), lg(['#a8492a', '#6e2a14']), lg(['#8a3a1e', '#541c0c']), '#ffd2a8');
    o += r(0, 0, 960, 600, rg([['#000', 0], ['#000', .55], ['#200000', 1]]), 0, 'opacity=".45"');
    return o;
  }
};
