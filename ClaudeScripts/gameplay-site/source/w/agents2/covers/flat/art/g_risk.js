(function () {
  var PL = { r: ['#e8322c', '#9e1914'], b: ['#2d6ff0', '#173f9e'], y: ['#ffc21a', '#c48a00'], g: ['#22a34a', '#13702e'], p: ['#9b4cf0', '#5e22a8'] };
  function ocean(w, h) { return r(0, 0, w, h, lg(['#2a6db0', '#123a72'])) + rep(Math.ceil(h / 40), function (j) { return sk('M0 ' + (j * 40 + 20) + ' Q' + w / 4 + ' ' + (j * 40 + 10) + ' ' + w / 2 + ' ' + (j * 40 + 20) + ' T' + w + ' ' + (j * 40 + 20), '#5a9ad8', 2, 'opacity=".25"'); }); }
  function wob(pts, seed, amp) {
    var q = rnd(seed), out = [];
    pts.forEach(function (a, i) {
      var b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), n = Math.max(2, Math.round(L / 22));
      for (var k = 0; k < n; k++) { var f = k / n, j = k ? (q() - 0.5) * amp : 0; out.push([+(a[0] + dx * f - dy / L * j).toFixed(1), +(a[1] + dy * f + dx / L * j).toFixed(1)]); }
    });
    return out;
  }
  function land(pts, f, dk) {
    pts = wob(pts, Math.round(pts[0][0] * 7 + pts[0][1] * 3 + 1), 16);
    return p(pts, '#000', 'opacity=".3" transform="translate(6,10)"') + p(pts, '#f3e3b8', 'stroke="#f3e3b8" stroke-width="14" stroke-linejoin="round"') + p(pts, f, 'stroke="' + dk + '" stroke-width="4" stroke-linejoin="round"') + p(pts, '#fff', 'opacity=".12" transform="translate(-3,-4) scale(1)"');
  }
  function badge(x, y, R, n, k) { return c(x + 2, y + 4, R, '#000', 'opacity=".35"') + c(x, y, R, PL[k][1]) + c(x, y - 2, R * 0.9, '#fff') + t(x, y + R * 0.34, n, R * 0.95, PL[k][1], { w: 900 }); }
  function die(x, y, s, n, rot, f, pip) {
    var P = { 3: [[-1, -1], [0, 0], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]] };
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', r(-46, -38, 96, 96, '#000', 20, 'opacity=".3"') + r(-48, -46, 96, 96, '#000', 20, 'opacity=".25"') + r(-48, -50, 96, 92, f, 20) + r(-38, -44, 52, 18, '#fff', 9, 'opacity=".35"') + P[n].map(function (q) { return c(q[0] * 23, q[1] * 23 - 4, 10, pip); }).join(''));
  }
  function arrow(path, col) { return sk(path, '#000', 18, 'opacity=".3" transform="translate(4,6)"') + sk(path, '#fff', 18) + sk(path, col, 10); }
  G['risk'] = {
    icon: function () {
      var o = ocean(400, 400);
      o += land([[20, 60], [130, 30], [190, 80], [170, 160], [100, 190], [30, 160]], PL.r[0], PL.r[1]);
      o += land([[220, 40], [340, 50], [380, 130], [330, 190], [240, 170], [210, 110]], PL.b[0], PL.b[1]);
      o += land([[40, 230], [150, 210], [200, 270], [170, 370], [70, 380], [20, 300]], PL.y[0], PL.y[1]);
      o += land([[240, 220], [370, 230], [380, 330], [300, 380], [230, 320]], PL.g[0], PL.g[1]);
      o += badge(100, 110, 36, 12, 'r') + badge(295, 112, 30, 3, 'b') + badge(110, 300, 30, 5, 'y') + badge(305, 300, 30, 7, 'g');
      o += arrow('M140 120 Q200 70 250 104', '#e8322c') + p([[246, 82], [276, 112], [238, 122]], '#e8322c', 'stroke="#fff" stroke-width="5" stroke-linejoin="round"');
      o += die(232, 218, 0.62, 6, -14, '#e8322c', '#fff') + die(178, 236, 0.62, 5, 12, '#f6f6f6', '#1a1a1a');
      return o;
    },
    bg: function () {
      var o = ocean(960, 600);
      o += land([[40, 60], [260, 40], [320, 150], [260, 260], [140, 240], [60, 180]], PL.r[0], PL.r[1]) + land([[200, 320], [300, 300], [330, 420], [280, 560], [210, 520], [180, 400]], PL.y[0], PL.y[1]);
      o += land([[420, 60], [560, 40], [600, 140], [520, 220], [430, 180]], PL.b[0], PL.b[1]) + land([[440, 260], [580, 250], [620, 380], [540, 520], [460, 440]], PL.g[0], PL.g[1]);
      o += land([[640, 40], [900, 60], [930, 220], [800, 300], [660, 220]], PL.p[0], PL.p[1]) + land([[760, 380], [900, 370], [920, 500], [820, 540]], PL.r[0], PL.r[1]);
      o += badge(170, 140, 34, 9, 'r') + badge(250, 420, 30, 4, 'y') + badge(510, 130, 30, 6, 'b') + badge(530, 360, 30, 3, 'g') + badge(790, 160, 34, 11, 'p') + badge(850, 450, 30, 5, 'r');
      o += arrow('M300 170 Q380 110 450 130', '#e8322c');
      return o;
    }
  };
})();
