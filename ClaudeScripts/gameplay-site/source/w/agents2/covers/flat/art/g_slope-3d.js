(function () {
  var N = '#2bff5a', NL = '#b9ffcb', RED = '#ff3b3f';
  function sky(w, h, hz) {
    var o = r(0, 0, w, h, lg([['#01030a', 0], ['#04121c', 0.55], ['#0b3a2c', 1]], 0, 0, 0, 1));
    var R = rnd(11);
    o += rep(Math.round(w / 9), function () { var x = R() * w, y = R() * hz * 0.8; return c(x.toFixed(1), y.toFixed(1), (0.8 + R() * 1.4).toFixed(1), '#dff7ff', 'opacity="' + (0.25 + R() * 0.5).toFixed(2) + '"'); });
    return o;
  }
  function sun(cx, cy, R0, bgc) {
    var o = c(cx, cy, R0 * 1.9, rg([['#2bff5a', 0], ['#2bff5a', 0.25], ['rgba(43,255,90,0)', 1]]), 'opacity=".35"');
    o += c(cx, cy, R0, lg([['#f4ffd0', 0], ['#9dff6a', 0.45], ['#18c95a', 1]]));
    for (var i = 0; i < 5; i++) { var y = cy - R0 * (0.62 - i * 0.14), hh = R0 * (0.02 + i * 0.022); o += r(cx - R0 - 2, y.toFixed(1), R0 * 2 + 4, hh.toFixed(1), bgc); }
    return o;
  }
  function floor(w, h, hz, vx, col) {
    var o = r(0, hz, w, h - hz, lg([['#06261a', 0], ['#010805', 1]]));
    for (var k = 1; k < 14; k++) { var f = Math.pow(k / 14, 2.2), y = hz + (h - hz) * f; o += ln(0, y.toFixed(1), w, y.toFixed(1), col, (0.6 + f * 2).toFixed(2), 'opacity="' + (0.12 + f * 0.25).toFixed(2) + '"'); }
    for (var j = -12; j <= 12; j++) o += ln(vx, hz, vx + j * w * 0.16, h, col, 1.4, 'opacity=".18"');
    return o;
  }
  function track(vx, hz, w0, bx0, bx1, by, nT, nL, sw) {
    var tl = [vx - w0, hz], tr = [vx + w0, hz], br = [bx1, by], bl = [bx0, by];
    var o = p([tl, tr, br, bl], lg([['#062114', 0], ['#0a3a1f', 1]]));
    for (var k = 1; k <= nT; k++) {
      var f = Math.pow(k / nT, 2), y = hz + (by - hz) * f, xl = tl[0] + (bl[0] - tl[0]) * f, xr = tr[0] + (br[0] - tr[0]) * f;
      o += ln(xl.toFixed(1), y.toFixed(1), xr.toFixed(1), y.toFixed(1), N, (sw * (0.25 + f)).toFixed(2), 'opacity=".55"');
    }
    for (var j = 1; j < nL; j++) { var a = j / nL; o += ln((tl[0] + (tr[0] - tl[0]) * a).toFixed(1), hz, (bl[0] + (br[0] - bl[0]) * a).toFixed(1), by, N, sw * 0.8, 'opacity=".45"'); }
    var edge = 'M' + bl.join(' ') + ' L' + tl.join(' ') + ' L' + tr.join(' ') + ' L' + br.join(' ');
    o += sk(edge, N, sw * 5, 'opacity=".18"') + sk(edge, N, sw * 2.2) + sk(edge, NL, sw * 0.7, 'opacity=".8"');
    return o;
  }
  function cube(x, y, s) {
    var k = s * 0.32, o = '';
    o += p([[x, y], [x + s, y], [x + s + k, y - k], [x + k, y - k]], '#ff7a7a');
    o += p([[x + s, y], [x + s + k, y - k], [x + s + k, y + s - k], [x + s, y + s]], '#8e0c18');
    o += r(x, y, s, s, lg([['#ff3b3f', 0], ['#b3101e', 1]]));
    o += sk('M' + x + ' ' + y + 'h' + s + 'v' + s + 'h' + (-s) + 'Z M' + x + ' ' + y + 'l' + k + ' ' + (-k) + 'h' + s + 'l' + (-k) + ' ' + k + ' M' + (x + s + k) + ' ' + (y - k) + 'v' + s + 'l' + (-k) + ' ' + k, '#ffb0a8', Math.max(1.5, s * 0.06));
    o += r(x + s * 0.12, y + s * 0.12, s * 0.3, s * 0.14, '#fff', 0, 'opacity=".35"');
    return e(x + s * 0.6, y + s + 2, s * 0.75, s * 0.12, RED, 'opacity=".35"') + o;
  }
  function ball(cx, cy, R) {
    var id = uid('slc');
    _defs += '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/></clipPath>';
    var o = e(cx, cy + R * 0.98, R * 1.25, R * 0.22, N, 'opacity=".35"');
    o += c(cx, cy, R * 1.55, rg([['rgba(43,255,90,.55)', 0], ['rgba(43,255,90,0)', 1]]));
    o += c(cx, cy, R, rg([['#f2fff4', 0], ['#7dff9e', 0.28], ['#19c24d', 0.68], ['#05401a', 1]], 0.34, 0.28, 0.78));
    var gl = '';
    [0.32, 0.68, 1].forEach(function (k) { gl += e(cx + R * 0.12, cy, R * k * 0.92, R, 'none', 'stroke="#064a1d" stroke-width="' + (R * 0.055).toFixed(1) + '" opacity=".6" transform="rotate(-18 ' + cx + ' ' + cy + ')"'); });
    [-0.5, 0, 0.5].forEach(function (k) { gl += sk('M' + (cx - R) + ' ' + (cy + k * R) + ' Q' + cx + ' ' + (cy + k * R + R * 0.28) + ' ' + (cx + R) + ' ' + (cy + k * R), '#064a1d', R * 0.055, 'opacity=".6"'); });
    gl += c(cx + R * 0.42, cy + R * 0.42, R * 0.9, '#002a0c', 'opacity=".28"');
    o += '<g clip-path="url(#' + id + ')">' + gl + '</g>';
    o += c(cx, cy, R, 'none', 'stroke="' + NL + '" stroke-width="' + (R * 0.05).toFixed(1) + '" opacity=".7"');
    o += e(cx - R * 0.36, cy - R * 0.42, R * 0.34, R * 0.2, '#fff', 'opacity=".75" transform="rotate(-35 ' + (cx - R * 0.36) + ' ' + (cy - R * 0.42) + ')"');
    o += c(cx - R * 0.58, cy - R * 0.12, R * 0.06, '#fff', 'opacity=".6"');
    return o;
  }
  function towers(w, hz, vx, R, n, side) {
    var o = '';
    for (var i = 0; i < n; i++) {
      var f = i / n, x = side < 0 ? vx - 70 - f * vx * 1.05 - R() * 30 : vx + 40 + f * (w - vx) * 1.05 + R() * 30;
      var tw = 24 + f * 70 + R() * 20, th = 40 + R() * 110 + f * 120, y = hz - th + f * 90;
      o += r(x.toFixed(1), y.toFixed(1), tw.toFixed(1), (th + 400).toFixed(1), '#020a08');
      o += r(x.toFixed(1), y.toFixed(1), tw.toFixed(1), (th + 400).toFixed(1), 'none', 0, 'stroke="' + N + '" stroke-width="2" opacity=".55"');
      for (var gy = y + 12; gy < hz + 120; gy += 14) o += ln(x.toFixed(1), gy.toFixed(1), (x + tw).toFixed(1), gy.toFixed(1), N, 1, 'opacity=".22"');
      for (var gx = x + 10; gx < x + tw - 4; gx += 12) o += ln(gx.toFixed(1), y.toFixed(1), gx.toFixed(1), hz + 120, N, 1, 'opacity=".18"');
    }
    return o;
  }
  G['slope-3d'] = {
    icon: function () {
      var hz = 168, vx = 214, bgc = '#071d1c';
      var o = sky(400, 400, hz);
      o += sun(vx, hz - 4, 62, bgc);
      o += floor(400, 400, hz, vx, N);
      o += towers(400, hz, vx, rnd(4), 3, -1) + towers(400, hz, vx, rnd(9), 3, 1);
      o += track(vx, hz, 16, -60, 470, 400, 11, 6, 2.4);
      o += cube(250, 214, 30);
      o += cube(166, 198, 20);
      o += sk('M58 340L92 300M44 300L70 270M346 340L312 300M362 296L334 268', N, 4, 'opacity=".7"');
      o += ball(196, 306, 74);
      return o;
    },
    bg: function () {
      var hz = 250, vx = 480, bgc = '#071d1c';
      var o = sky(960, 600, hz);
      o += sun(vx, hz - 6, 120, bgc);
      o += floor(960, 600, hz, vx, N);
      o += towers(960, hz, vx, rnd(21), 6, -1) + towers(960, hz, vx, rnd(33), 6, 1);
      o += track(vx, hz, 26, 120, 840, 600, 13, 7, 3);
      o += cube(530, 320, 40) + cube(390, 360, 46) + cube(600, 430, 60);
      o += ball(470, 500, 70);
      return o;
    }
  };
})();
