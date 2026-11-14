(function () {
  var PAL = ['#f5c518', '#1f4fc8', '#d42a2a', '#5b2b8a', '#f07a1a', '#178a4c', '#7a1f22', '#18181c'];
  function gr(type, stops, a) {
    var id = uid('pl'), tag = type === 'r' ? 'radialGradient' : 'linearGradient';
    var at = type === 'r' ? A({ cx: a[0], cy: a[1], r: a[2] }) : A({ x1: a[0], y1: a[1], x2: a[2], y2: a[3] });
    _defs += '<' + tag + ' id="' + id + '"' + at + '>' + stops.map(function (s) { return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '" stop-opacity="' + (s[2] === undefined ? 1 : s[2]) + '"/>'; }).join('') + '</' + tag + '>';
    return 'url(#' + id + ')';
  }
  function blur(sd) { var id = uid('pb'); _defs += '<filter id="' + id + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="' + sd + '"/></filter>'; return 'filter="url(#' + id + ')"'; }
  function clip(inner) { var id = uid('pc'); _defs += '<clipPath id="' + id + '">' + inner + '</clipPath>'; return 'clip-path="url(#' + id + ')"'; }
  function shadow(x, y, R, op) {
    return e(x + R * 0.32, y + R * 0.4, R * 1.02, R * 0.84, '#000', 'opacity="' + (op || 0.45) + '" ' + blur(R * 0.16)) + e(x + R * 0.1, y + R * 0.14, R * 0.94, R * 0.88, '#000', 'opacity=".45" ' + blur(R * 0.05));
  }
  function ball(x, y, R, n, rot, felt) {
    var st = n > 8, col = n === 0 ? '#f7f3ea' : PAL[(n - 1) % 8], o = '';
    rot = rot === undefined ? -22 : rot;
    felt = felt || '#5ab8e8';
    var tr = 'translate(' + x + ',' + y + ') rotate(' + rot + ')';
    if (st) {
      o += c(x, y, R, '#f7f3ea');
      var band = 'M' + (-1.4 * R) + ' ' + (-0.52 * R) + ' Q0 ' + (-0.3 * R) + ' ' + (1.4 * R) + ' ' + (-0.52 * R) + ' L' + (1.4 * R) + ' ' + (0.44 * R) + ' Q0 ' + (0.72 * R) + ' ' + (-1.4 * R) + ' ' + (0.44 * R) + ' Z';
      o += '<g ' + clip('<circle cx="' + x + '" cy="' + y + '" r="' + R + '"/>') + '>' + g(tr, d(band, col)) + '</g>';
    } else o += c(x, y, R, col);
    if (n > 0) {
      var rr = R * (st ? 0.4 : 0.47), fs = rr * (n > 9 ? 1.02 : 1.3), ny = st ? R * 0.1 : -R * 0.14;
      o += g(tr, e(-R * 0.12, ny, rr, rr * 0.92, gr('r', [['#ffffff', 0], ['#e6e8ee', 1]], [0.4, 0.35, 0.7])) + t(-R * 0.12, ny + fs * 0.36, n, fs, '#16161a', { w: 800, ls: n > 9 ? -1 : undefined }));
    }
    o += c(x, y, R, gr('r', [['#000', 0, 0], ['#000', 0.45, 0.06], ['#000', 0.82, 0.4], ['#000', 1, 0.66]], [0.36, 0.32, 0.78]));
    o += c(x, y, R, gr('r', [[felt, 0, 0], [felt, 0.85, 0], [felt, 1, 0.4]], [0.42, 0.38, 0.62]));
    var hx = x - R * 0.46, hy = y - R * 0.5;
    o += e(hx, hy, R * 0.36, R * 0.21, gr('r', [['#fff', 0, 0.8], ['#fff', 1, 0]], [0.5, 0.5, 0.5]), 'transform="rotate(-40 ' + hx + ' ' + hy + ')"');
    o += e(hx - R * 0.05, hy - R * 0.05, R * 0.13, R * 0.075, '#fff', 'opacity=".95" transform="rotate(-40 ' + (hx - R * 0.05) + ' ' + (hy - R * 0.05) + ')"');
    return o;
  }
  function cue(tx, ty, bx, by, w0, w1, sop) {
    var dx = bx - tx, dy = by - ty, L = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx), deg = a * 180 / Math.PI;
    function hw(s) { return (w0 + (w1 - w0) * s / L) / 2; }
    function seg(s0, s1, f, x2) { return p([[s0, -hw(s0)], [s1, -hw(s1)], [s1, hw(s1)], [s0, hw(s0)]], f, x2); }
    var tl = w0 * 0.9, fl = w0 * 1.7, f0 = L * 0.56, w2 = L * 0.79, b0 = L * 0.94, h0 = hw(f0);
    var o = seg(0, tl, '#2f6db5') + seg(tl, tl + fl, '#f4f0e6') + seg(tl + fl, f0, gr('l', [['#f2d7a6', 0], ['#e0b16e', 1]], [0, 0, 1, 0]));
    o += seg(f0, w2, '#7c2a12') + p([[f0, -h0 * 0.62], [f0 - L * 0.13, 0], [f0, h0 * 0.62]], '#7c2a12', 'stroke="#f1e2bf" stroke-width="' + w0 * 0.12 + '" stroke-linejoin="round"');
    o += p([[f0, -h0], [f0 - L * 0.1, -hw(f0 - L * 0.1)], [f0, -h0 * 0.82]], '#2a0d06') + p([[f0, h0], [f0 - L * 0.1, hw(f0 - L * 0.1)], [f0, h0 * 0.82]], '#2a0d06');
    o += seg(w2, b0, '#1b1b21') + seg(b0, L, '#5a200e') + seg(w2 - w0 * 0.15, w2 + w0 * 0.15, '#efe2c4') + seg(b0 - w0 * 0.15, b0 + w0 * 0.15, '#efe2c4');
    var lit = Math.sin(a) - Math.cos(a) > 0;
    o += seg(0, L, gr('l', [['#fff', 0, 0.55], ['#fff', 0.26, 0.14], ['#fff', 0.44, 0], ['#000', 0.6, 0], ['#000', 1, 0.5]], lit ? [0, 1, 0, 0] : [0, 0, 0, 1]));
    var sh = g('translate(' + (tx + w0 * 0.7) + ',' + (ty + w0 * 1.0) + ') rotate(' + deg + ')', seg(0, L, '#000', 'opacity="' + (sop || 0.45) + '" ' + blur(w0 * 0.35)));
    return sh + g('translate(' + tx + ',' + ty + ') rotate(' + deg + ')', o);
  }
  function gloss() {
    return r(0, 0, 400, 400, gr('l', [['#fff', 0, 0.2], ['#fff', 0.4, 0.04], ['#fff', 0.6, 0], ['#000', 0.62, 0], ['#000', 1, 0.16]], [0, 0, 0, 1]));
  }
  G['pool'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, gr('r', [['#63c3f2', 0], ['#2b87c2', 0.5], ['#134c7a', 1]], [0.28, 0.22, 1.0]));
      o += cue(352, 64, -186, 548, 17, 36);
      o += shadow(300, 304, 64, 0.5) + ball(300, 304, 64, 9, -28);
      o += shadow(190, 186, 124, 0.55) + ball(190, 186, 124, 8, -24);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, gr('r', [['#3c1d14', 0], ['#140806', 1]], [0.5, 0.5, 0.75]));
      o += r(62, 56, 860, 524, '#000', 44, 'opacity=".6" ' + blur(16));
      o += r(50, 40, 860, 520, gr('l', [['#b8392f', 0], ['#9a2a26', 0.3], ['#6e1515', 1]], [0, 0, 0.25, 1]), 42);
      o += rep(10, function (i) { return ln(80 + i * 13, 52 + (i % 3) * 4, 880 - i * 11, 52 + (i % 3) * 4 + i * 0.4, '#2a0606', 1.2, 'opacity=".18"') + ln(80 + i * 17, 546 - (i % 4) * 4, 880 - i * 9, 548 - (i % 4) * 4, '#2a0606', 1.2, 'opacity=".18"'); });
      o += r(56, 46, 848, 508, 'none', 38, 'stroke="#d65a4a" stroke-width="3" opacity=".45"');
      o += r(94, 84, 772, 432, '#14496f', 12);
      o += r(106, 96, 748, 408, gr('r', [['#62bfee', 0], ['#45a9de', 0.3], ['#2b80bb', 0.72], ['#1b5f94', 1]], [0.5, 0.48, 0.68]), 4);
      o += r(106, 96, 748, 408, 'none', 4, 'stroke="#0c3556" stroke-width="6" opacity=".5"');
      for (var k = 1; k < 8; k++) if (k !== 4) { var dx = 106 + 748 * k / 8; o += star(dx, 66, 6, 3, 2, '#f3e6c4', 0) + star(dx, 534, 6, 3, 2, '#f3e6c4', 0); }
      for (var j = 1; j < 4; j++) { var dy = 96 + 408 * j / 4; o += star(76, dy, 6, 3, 2, '#f3e6c4', 0) + star(884, dy, 6, 3, 2, '#f3e6c4', 0); }
      [[108, 98], [852, 98], [108, 502], [852, 502], [480, 90], [480, 510]].forEach(function (q) { o += c(q[0], q[1], 36, '#3a0c08') + c(q[0], q[1], 29, gr('r', [['#000', 0], ['#0a0a0a', 0.8], ['#1c1c1c', 1]], [0.5, 0.5, 0.5])); });
      o += ln(293, 100, 293, 500, '#fff', 2.5, 'opacity=".22"') + c(293, 300, 4, '#fff', 'opacity=".4"') + c(667, 300, 4, '#fff', 'opacity=".4"');
      var bs = [[214, 330, 0], [168, 176, 3], [248, 452, 6], [140, 424, 12], [236, 230, 9], [744, 212, 1], [786, 238, 10], [752, 264, 5], [806, 384, 2], [712, 452, 14], [820, 142, 15], [612, 466, 13], [372, 468, 7], [700, 338, 4], [738, 150, 8], [560, 130, 11]];
      var R = 23;
      bs.forEach(function (b) { o += shadow(b[0], b[1], R, 0.5); });
      bs.forEach(function (b, i) { o += ball(b[0], b[1], R, b[2], -30 + i * 23); });
      o += cue(192, 360, -160, 830, 9, 20, 0.5);
      o += cue(660, 590, 930, 470, 9, 18, 0.4);
      o += e(480, 290, 430, 250, gr('r', [['#fff', 0, 0.13], ['#fff', 1, 0]], [0.5, 0.5, 0.5]));
      return o;
    }
  };
})();
