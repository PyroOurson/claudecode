(function () {
  var OL = '#2a1b14';
  function pizza(cx, cy, R, rot) {
    var o = e(cx + R * 0.04, cy + R * 0.1, R * 1.02, R * 1.02, '#000', 'opacity=".28"');
    o += c(cx, cy, R, rg([['#f1c987', 0], ['#d99b4a', 1]], 0.35, 0.3, 0.75), 'stroke="' + OL + '" stroke-width="' + (R * 0.035).toFixed(1) + '"');
    o += c(cx, cy, R * 0.86, '#c8321e');
    o += c(cx, cy, R * 0.8, '#ffd96a');
    var rn = rnd(9);
    for (var i = 0; i < 26; i++) { var a = rn() * Math.PI * 2, dd = Math.sqrt(rn()) * R * 0.74, px = cx + Math.cos(a) * dd, py = cy + Math.sin(a) * dd; o += r(px - R * 0.06, py - R * 0.015, R * 0.12, R * 0.035, rn() < 0.5 ? '#ffe27a' : '#fff0a8', R * 0.02, 'transform="rotate(' + Math.round(rn() * 180) + ' ' + px.toFixed(1) + ' ' + py.toFixed(1) + ')"'); }
    [[-0.42, -0.3], [0.38, -0.36], [0.05, 0.1], [-0.36, 0.38], [0.42, 0.34], [0.02, -0.6], [-0.66, 0.02]].forEach(function (q) {
      var x = cx + q[0] * R, y = cy + q[1] * R, s = R * 0.14;
      o += c(x, y, s, '#c4301f', 'stroke="#6e1409" stroke-width="' + (s * 0.16).toFixed(1) + '"') + c(x - s * 0.25, y - s * 0.25, s * 0.55, '#e25a3a') + c(x + s * 0.35, y + s * 0.3, s * 0.12, '#8f2112') + c(x - s * 0.4, y + s * 0.35, s * 0.1, '#8f2112');
    });
    [[0.2, -0.12], [-0.12, 0.5], [0.6, -0.02]].forEach(function (q) { var x = cx + q[0] * R, y = cy + q[1] * R, s = R * 0.085; o += c(x, y, s, '#2a2a33', 'stroke="#000" stroke-width="' + (s * 0.2).toFixed(1) + '"') + c(x, y, s * 0.36, '#d8b88a'); });
    [[-0.12, -0.32, 20], [0.3, 0.6, -30], [-0.6, -0.4, 60]].forEach(function (q) { var x = cx + q[0] * R, y = cy + q[1] * R, s = R * 0.0095; o += g('translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + q[2] + ') scale(' + s.toFixed(2) + ')', d('M-9 -2 Q-10 -11 0 -11 Q10 -11 9 -2 L3 -2 L3 9 Q0 11 -3 9 L-3 -2 Z', '#e6d5b8', 'stroke="#7a6244" stroke-width="1.8" stroke-linejoin="round"')); });
    o += d('M' + (cx - R * 0.7) + ' ' + (cy - R * 0.45) + ' Q' + (cx - R * 0.5) + ' ' + (cy - R * 0.85) + ' ' + (cx - R * 0.05) + ' ' + (cy - R * 0.92), 'none', 'stroke="#fff" stroke-width="' + (R * 0.05).toFixed(1) + '" stroke-linecap="round" opacity=".35"');
    return rot ? g('rotate(' + rot + ' ' + cx + ' ' + cy + ')', o) : o;
  }
  function burger(cx, yb, w) {
    var k = w / 150, hw = w / 2, o = e(cx, yb + 4 * k, hw * 1.1, 10 * k, '#000', 'opacity=".3"'), y = yb, sw = 'stroke="' + OL + '" stroke-width="' + (2.6 * k).toFixed(1) + '" stroke-linejoin="round"';
    o += d('M' + (cx - hw) + ' ' + (y - 20 * k) + ' H' + (cx + hw) + ' Q' + (cx + hw) + ' ' + y + ' ' + (cx + hw - 14 * k) + ' ' + y + ' H' + (cx - hw + 14 * k) + ' Q' + (cx - hw) + ' ' + y + ' ' + (cx - hw) + ' ' + (y - 20 * k) + ' Z', '#e3a058', sw); y -= 18 * k;
    o += r(cx - hw + 3 * k, y - 18 * k, w - 6 * k, 18 * k, '#7a4524', 8 * k, sw); y -= 16 * k;
    o += d('M' + (cx - hw - 4 * k) + ' ' + (y - 6 * k) + ' H' + (cx + hw + 4 * k) + ' L' + (cx + hw * 0.5) + ' ' + y + ' L' + (cx + hw * 0.4) + ' ' + (y + 12 * k) + ' L' + (cx + hw * 0.28) + ' ' + y + ' L' + (cx - hw * 0.4) + ' ' + y + ' L' + (cx - hw * 0.5) + ' ' + (y + 14 * k) + ' L' + (cx - hw * 0.6) + ' ' + y + ' Z', '#ffc93c', sw); y -= 6 * k;
    var lp = 'M' + (cx - hw - 8 * k) + ' ' + y;
    for (var i = 0; i <= 10; i++) { var sx = cx - hw - 8 * k + i * (w + 16 * k) / 10; lp += ' Q' + (sx - 5 * k).toFixed(1) + ' ' + (y - (i % 2 ? 14 : 4) * k).toFixed(1) + ' ' + sx.toFixed(1) + ' ' + (y - (i % 2 ? 4 : 10) * k).toFixed(1); }
    o += d(lp + ' L' + (cx + hw) + ' ' + (y + 2 * k) + ' L' + (cx - hw) + ' ' + (y + 2 * k) + ' Z', '#6cc04a', sw); y -= 8 * k;
    [-0.48, 0.02, 0.5].forEach(function (sx) { o += r(cx + sx * hw - hw * 0.44, y - 8 * k, hw * 0.92, 9 * k, '#e8412c', 4 * k, sw); });
    y -= 7 * k;
    o += d('M' + (cx - hw) + ' ' + y + ' Q' + (cx - hw) + ' ' + (y - 36 * k) + ' ' + cx + ' ' + (y - 35 * k) + ' Q' + (cx + hw) + ' ' + (y - 36 * k) + ' ' + (cx + hw) + ' ' + y + ' Z', lg(['#f0b468', '#c97c34'], 0, 0, 0, 1), sw);
    for (var j = 0; j < 9; j++) { var qx = cx - hw * 0.7 + j * hw * 0.175, qy = y - 30 * k * (0.45 + 0.4 * Math.sin(j / 8 * Math.PI)); o += e(qx, qy, 3.4 * k, 1.8 * k, '#fff6dc', 'transform="rotate(' + ((j - 4) * 9) + ' ' + qx.toFixed(1) + ' ' + qy.toFixed(1) + ')"'); }
    o += e(cx - hw * 0.35, y - 24 * k, hw * 0.25, 4 * k, '#fff', 'opacity=".28"');
    return o;
  }
  function shake(cx, yb, k) {
    var w = 88 * k, h = 142 * k, bw = w * 0.72, o = e(cx, yb + 4 * k, w * 0.6, 8 * k, '#000', 'opacity=".3"');
    o += d('M' + (cx + 10 * k) + ' ' + (yb - h - 20 * k) + ' L' + (cx + 30 * k) + ' ' + (yb - h - 74 * k), 'none', 'stroke="#e63946" stroke-width="' + (9 * k).toFixed(1) + '" stroke-linecap="round"');
    o += p([[cx - w / 2, yb - h], [cx + w / 2, yb - h], [cx + bw / 2, yb], [cx - bw / 2, yb]], '#f48fb1', 'stroke="' + OL + '" stroke-width="' + (3 * k).toFixed(1) + '" stroke-linejoin="round"');
    var rn = rnd(5);
    for (var i = 0; i < 16; i++) o += c(cx + (rn() - 0.5) * bw * 0.9, yb - h * 0.1 - rn() * h * 0.8, (2 + rn() * 3) * k, '#e53950');
    o += d('M' + (cx - w / 2 + 8 * k) + ' ' + (yb - h + 10 * k) + ' L' + (cx - bw / 2 + 7 * k) + ' ' + (yb - 10 * k), 'none', 'stroke="#fff" stroke-width="' + (4 * k).toFixed(1) + '" stroke-linecap="round" opacity=".6"');
    var hh = 22 * k, y = yb - h;
    for (var t2 = 0; t2 < 3; t2++) { var ww = w * 0.46 * (1 - t2 * 0.26), yy = y - t2 * hh * 0.78 - hh * 0.3; o += e(cx, yy, ww, hh * 0.5, '#fffdf8', 'stroke="#a9a2bb" stroke-width="' + (2.4 * k).toFixed(1) + '"'); }
    o += d('M' + cx + ' ' + (y - hh * 2.6 - 8 * k) + ' Q' + (cx + 3 * k) + ' ' + (y - hh * 3.1) + ' ' + (cx + 10 * k) + ' ' + (y - hh * 3.3), 'none', 'stroke="#3e6b1a" stroke-width="' + (2.4 * k).toFixed(1) + '"');
    o += c(cx, y - hh * 2.6, 9 * k, '#d61f3c', 'stroke="' + OL + '" stroke-width="' + (2 * k).toFixed(1) + '"') + c(cx - 3 * k, y - hh * 2.6 - 3 * k, 2.4 * k, '#fff', 'opacity=".7"');
    return o;
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function rays(cx, cy, n, R, col, op) { var o = ''; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, w = Math.PI / n * 0.55; o += p([[cx, cy], [cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R], [cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R]], col, 'opacity="' + op + '"'); } return o; }
  function ticket(x, y, rot) {
    return g('rotate(' + rot + ' ' + (x + 50) + ' ' + (y + 38) + ')', r(x + 4, y + 6, 100, 76, '#000', 6, 'opacity=".25"') + r(x, y, 100, 76, '#fffdf2', 6, 'stroke="#7a5a2a" stroke-width="4"') + c(x + 50, y + 6, 7, '#e63946', 'stroke="' + OL + '" stroke-width="2"') + r(x + 14, y + 24, 60, 8, '#c0392b', 3) + r(x + 14, y + 40, 72, 6, '#9a8a6a', 3) + r(x + 14, y + 54, 50, 6, '#9a8a6a', 3));
  }
  G['order-up'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#ffb75e', 0], ['#f0703f', 0.6], ['#c0392b', 1]], 0.45, 0.35, 0.9));
      o += rays(200, 190, 16, 330, '#fff3d0', 0.1);
      o += r(-10, 300, 420, 120, '#7a4a26') + r(-10, 296, 420, 12, '#a8703c');
      o += shake(330, 300, 0.9);
      o += pizza(186, 212, 120, -8);
      o += burger(292, 356, 168);
      o += ticket(40, 40, -12);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg([['#ffcf6e', 0], ['#ff8a4b', 0.55], ['#c0392b', 1]], 0.5, 0.4, 0.8));
      o += rays(480, 260, 22, 900, '#fff1c8', 0.08);
      o += r(0, 430, 960, 170, '#7a4a26') + r(0, 424, 960, 16, '#a8703c');
      o += pizza(480, 300, 200, 10) + burger(800, 470, 230) + shake(170, 470, 1.6);
      o += pizza(90, 110, 60, 30) + pizza(880, 120, 70, -20);
      return o;
    }
  };
})();
