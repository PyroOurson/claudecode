(function () {
  var TIP = { a: '#ef3b36', b: '#ffcc1a', c: '#22b34c', A: '#2d7cf0', B: '#a24cf0', C: '#ff8a1f' };
  function marble(x, y, R, f) {
    return e(x + R * 0.12, y + R * 0.3, R, R * 0.85, '#000', 'opacity=".35"') + c(x, y, R, f) + c(x + R * 0.18, y + R * 0.2, R * 0.78, '#000', 'opacity=".18"') + c(x - R * 0.36, y - R * 0.38, R * 0.3, '#fff', 'opacity=".85"');
  }
  function star(cx, cy, s, filled, extra) {
    var o = '', S3 = Math.sqrt(3) / 2;
    function P(q, rr) { return [cx + s * (q + rr / 2), cy + s * S3 * rr]; }
    var A = [P(8, -4), P(-4, -4), P(-4, 8)], B = [P(-8, 4), P(4, 4), P(4, -8)];
    function grow(T, k) { return T.map(function (v) { return [+(cx + (v[0] - cx) * k).toFixed(1), +(cy + (v[1] - cy) * k).toFixed(1)]; }); }
    o += p(grow(A, 1.16), '#000', 'opacity=".3" transform="translate(6,12)" stroke="#000" stroke-width="' + s * 1.2 + '" stroke-linejoin="round"') + p(grow(B, 1.16), '#000', 'opacity=".3" transform="translate(6,12)" stroke="#000" stroke-width="' + s * 1.2 + '" stroke-linejoin="round"');
    o += p(grow(A, 1.16), '#e8d9bd', 'stroke="#e8d9bd" stroke-width="' + s * 1.2 + '" stroke-linejoin="round"') + p(grow(B, 1.16), '#e8d9bd', 'stroke="#e8d9bd" stroke-width="' + s * 1.2 + '" stroke-linejoin="round"');
    o += p(grow(B, 1.16), '#fff', 'opacity=".25"');
    var tips = { a: [P(8, -4), P(5, -4), P(5, -1)], b: [P(-4, 8), P(-4, 5), P(-1, 5)], c: [P(-4, -4), P(-1, -4), P(-4, -1)], A: [P(-8, 4), P(-5, 4), P(-5, 1)], B: [P(4, -8), P(4, -5), P(1, -5)], C: [P(4, 4), P(1, 4), P(4, 1)] };
    for (var a = -8; a <= 8; a++) for (var c3 = -8; c3 <= 8; c3++) {
      var b = -a - c3, inA = a >= -4 && b >= -4 && c3 >= -4, inB = a <= 4 && b <= 4 && c3 <= 4;
      if (!inA && !inB) continue;
      var k = a > 4 ? 'a' : c3 > 4 ? 'b' : b > 4 ? 'c' : a < -4 ? 'A' : b < -4 ? 'B' : c3 < -4 ? 'C' : '';
      var xy = P(a, c3);
      o += c(xy[0], xy[1] + s * 0.06, s * 0.3, '#8a7350') + c(xy[0], xy[1], s * 0.27, '#5e4a2e');
      if (k && filled[k]) o += marble(xy[0], xy[1], s * 0.42, TIP[k]);
    }
    return o + (extra ? extra(P) : '');
  }
  G['chinese-checkers'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a2a8a', '#16124a'], 0, 0, 1, 1));
      o += c(200, 200, 190, rg([['#6a54ff', 0], ['#3a2a8a', 1]]), 'opacity=".5"');
      o += star(200, 205, 25, { a: 1, b: 1, c: 1, A: 1, B: 1, C: 1 }, function (P) { var q = P(1, -1), w = P(-1, 1); return marble(q[0], q[1], 25 * 0.42, '#ef3b36') + marble(w[0], w[1], 25 * 0.42, '#2d7cf0'); });
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2e2270', '#120e3a']));
      o += star(480, 300, 40, { a: 1, b: 1, c: 1, A: 1, C: 1 });
      o += marble(120, 120, 22, '#ef3b36') + marble(170, 160, 22, '#ffcc1a') + marble(110, 190, 22, '#22b34c') + marble(850, 480, 22, '#2d7cf0') + marble(800, 520, 22, '#a24cf0');
      return o;
    }
  };
})();
