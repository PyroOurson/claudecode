(function () {
  var CC = ['#ffd84d', '#ff8f5a', '#6fd3a0', '#5fb4ff', '#ff7aa8'];
  function grid(x0, y0, s, cols, rows, start) {
    var o = '';
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      var x = x0 + i * s, y = y0 + j * s, row = rows - 1 - j, n = start + row * cols + (row % 2 ? cols - 1 - i : i);
      o += r(x, y, s, s, CC[(i + j * 2) % 5]) + r(x + 3, y + 3, s - 6, s * 0.35, '#fff', s * 0.12, 'opacity=".22"') + t(x + s * 0.2, y + s * 0.3, n, s * 0.22, '#5a3418', { w: 800, a: 'start' });
    }
    return o;
  }
  function ladder(x1, y1, x2, y2, w, n) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2, o = '';
    o += ln(x1 + nx + 8, y1 + ny + 10, x2 + nx + 8, y2 + ny + 10, '#000', w * 0.2, 'opacity=".25"') + ln(x1 - nx + 8, y1 - ny + 10, x2 - nx + 8, y2 - ny + 10, '#000', w * 0.2, 'opacity=".25"');
    for (var k = 1; k < n; k++) { var f = k / n, px = x1 + dx * f, py = y1 + dy * f; o += ln(px + nx, py + ny, px - nx, py - ny, '#a8642a', w * 0.14) + ln(px + nx, py + ny - w * 0.03, px - nx, py - ny - w * 0.03, '#e6a15a', w * 0.06); }
    [1, -1].forEach(function (sg) { o += ln(x1 + nx * sg, y1 + ny * sg, x2 + nx * sg, y2 + ny * sg, '#8a4a1c', w * 0.2) + ln(x1 + nx * sg - 2, y1 + ny * sg - 2, x2 + nx * sg - 2, y2 + ny * sg - 2, '#d48a45', w * 0.08); });
    return o;
  }
  function snake(path, w, hx, hy, rot, body, belly, dark) {
    var o = sk(path, '#000', w + 6, 'opacity=".25" transform="translate(8,10)"') + sk(path, dark, w + 6) + sk(path, body, w) + sk(path, belly, w * 0.3, 'stroke-dasharray="' + w * 0.5 + ' ' + w * 0.5 + '"') + sk(path, '#fff', w * 0.12, 'opacity=".35" transform="translate(-' + w * 0.18 + ',-' + w * 0.18 + ')"');
    o += g('translate(' + hx + ',' + hy + ') rotate(' + rot + ')', sk('M' + w * 0.9 + ' 0 L' + w * 1.4 + ' 0 M' + w * 1.4 + ' 0 L' + w * 1.65 + ' -' + w * 0.18 + ' M' + w * 1.4 + ' 0 L' + w * 1.65 + ' ' + w * 0.18, '#e8203a', w * 0.1) + e(0, 0, w * 1.0, w * 0.78, dark) + e(-w * 0.04, -w * 0.04, w * 0.95, w * 0.72, body) + e(-w * 0.2, -w * 0.25, w * 0.4, w * 0.18, '#fff', 'opacity=".35"') + c(w * 0.3, -w * 0.38, w * 0.26, '#fff') + c(w * 0.3, w * 0.38, w * 0.26, '#fff') + c(w * 0.38, -w * 0.38, w * 0.14, '#1a1a1a') + c(w * 0.38, w * 0.38, w * 0.14, '#1a1a1a') + c(w * 0.34, -w * 0.43, w * 0.05, '#fff') + c(w * 0.34, w * 0.33, w * 0.05, '#fff'));
    return o;
  }
  G['snakes-ladders'] = {
    icon: function () {
      var o = grid(0, 0, 80, 5, 5, 76);
      o += ladder(70, 370, 250, 40, 70, 7);
      o += snake('M380 360 C300 380 250 300 300 250 C350 200 330 120 250 130 C170 140 150 80 190 50', 46, 205, 52, -60, '#2fc24a', '#d8f56a', '#137a2a');
      return o;
    },
    bg: function () {
      var o = grid(0, 0, 96, 10, 7, 1);
      o += ladder(140, 640, 340, 150, 64, 9) + ladder(620, 560, 760, 250, 64, 7) + ladder(850, 280, 900, -20, 64, 6);
      o += snake('M560 40 C480 120 600 200 500 280 C400 360 480 460 380 540', 44, 560, 40, -110, '#ff6a3d', '#ffe07a', '#b33a12');
      o += snake('M60 80 C150 150 40 250 130 330', 40, 60, 80, -140, '#7a5cff', '#d6ccff', '#4a2fc0');
      return o;
    }
  };
})();
