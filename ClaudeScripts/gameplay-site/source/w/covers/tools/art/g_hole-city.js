G['hole-city'] = {
  bld: function (x, y, w, dpt, front, roof, rr) {
    var o = r(x + 8, y + 10, w, dpt + 30, '#000', 6, 'opacity=".16"');
    o += r(x, y + dpt, w, 30, front, 4);
    o += rep(Math.floor((w - 10) / 22), function (i) { return r(x + 8 + i * 22, y + dpt + 8, 14, 12, '#a6dcff', 2) + r(x + 8 + i * 22, y + dpt + 8, 14, 5, '#d4f1ff', 2); });
    o += r(x, y, w, dpt + 4, roof, 5) + r(x + 4, y + 4, w - 8, dpt - 4, 'none', 4, 'stroke="#fff" stroke-opacity=".35" stroke-width="3"');
    var R = rnd(rr || 3);
    if (w > 60) o += r(x + w * 0.18, y + dpt * 0.25, 20, 14, '#cfd3db', 2) + r(x + w * 0.18, y + dpt * 0.25 + 11, 20, 4, '#9aa1b2') + c(x + w * 0.7, y + dpt * 0.45, 9 + R() * 4, '#c58b5a') + c(x + w * 0.7, y + dpt * 0.45 - 2, 6, '#d9a476');
    return o;
  },
  tree: function (x, y, s) { return e(x + 5 * s, y + 8 * s, 15 * s, 9 * s, '#000', 'opacity=".16"') + c(x, y, 15 * s, '#4fa83a') + c(x - 4 * s, y - 5 * s, 9 * s, '#6fc957') + c(x - 6 * s, y - 7 * s, 3.5 * s, '#a6e28a'); },
  car: function (x, y, ang, col, s) {
    return g('translate(' + x + ',' + y + ') rotate(' + ang + ') scale(' + (s || 1) + ')', r(-21, -9, 46, 22, '#000', 7, 'opacity=".18"') + r(-24, -12, 48, 24, col, 7) + r(-8, -10, 20, 20, '#2a3550', 4) + r(-6, -8, 16, 6, '#7fc4ef', 2) + r(-22, -10, 44, 4, '#fff', 2, 'opacity=".3"') + r(20, -9, 3, 5, '#fff6c8') + r(20, 4, 3, 5, '#fff6c8'));
  },
  hole: function (x, y, rx, col, hi) {
    return e(x + 6, y + 8, rx * 1.12, rx * 0.68, '#000', 'opacity=".2"') + e(x, y, rx * 1.1, rx * 0.66, col) + sk('M' + (x - rx * 1.02) + ' ' + (y - 2) + 'A' + rx * 1.02 + ' ' + rx * 0.6 + ' 0 0 1 ' + x + ' ' + (y - rx * 0.6), hi, rx * 0.06, 'opacity=".8"') + e(x, y + rx * 0.02, rx * 0.96, rx * 0.56, rg(['#000', '#06070d', '#20243a'], 0.5, 0.35, 0.75));
  },
  street: function (W, H, xs, ys) {
    var o = '';
    xs.forEach(function (x) { o += r(x - 50, 0, 100, H, '#dcdee3') + r(x - 38, 0, 76, H, '#6b717d') + rep(Math.ceil(H / 40), function (i) { return r(x - 2, i * 40 + 6, 4, 20, '#f4f4f4'); }); });
    ys.forEach(function (y) { o += r(0, y - 50, W, 100, '#dcdee3') + r(0, y - 38, W, 76, '#6b717d') + rep(Math.ceil(W / 40), function (i) { return r(i * 40 + 6, y - 2, 20, 4, '#f4f4f4'); }); });
    xs.forEach(function (x) { ys.forEach(function (y) { o += r(x - 38, y - 38, 76, 76, '#6b717d') + rep(6, function (k) { return r(x - 33 + k * 12, y - 58, 7, 16, '#f4f4f4') + r(x - 33 + k * 12, y + 42, 7, 16, '#f4f4f4') + r(x - 58, y - 33 + k * 12, 16, 7, '#f4f4f4') + r(x + 42, y - 33 + k * 12, 16, 7, '#f4f4f4'); }); }); });
    return o;
  },
  icon: function () {
    var A = G['hole-city'];
    var o = r(0, 0, 400, 400, lg(['#9ee07a', '#74c653']));
    o += r(0, 128, 400, 22, '#dcdee3') + r(0, 300, 400, 22, '#dcdee3') + r(0, 148, 400, 154, '#6b717d');
    o += rep(5, function (i) { return r(-10 + i * 90, 223, 46, 6, '#f4f4f4', 2); });
    o += A.bld(16, 4, 128, 62, '#e2a85b', '#ffd166', 5) + A.bld(250, -20, 140, 82, '#5f86c9', '#80d8ff', 9);
    o += A.tree(196, 60, 1.25) + A.tree(222, 88, 0.85);
    o += A.tree(40, 352, 1.3) + A.tree(352, 356, 1.15) + A.car(150, 362, 0, '#ffc93c', 1.1) + A.car(262, 360, 180, '#1e88e5', 1.05);
    _defs += '<clipPath id="hcK"><ellipse cx="200" cy="232" rx="134" ry="80"/><rect x="0" y="0" width="400" height="232"/></clipPath>';
    o += e(206, 242, 168, 104, '#000', 'opacity=".22"');
    o += e(200, 232, 156, 96, '#ffffff', 'opacity=".55"');
    o += e(200, 232, 150, 92, '#3d8bff');
    o += e(200, 233, 134, 80, rg([['#000', 0], ['#05060c', 0.55], ['#262b45', 1]], 0.5, 0.3, 0.75));
    o += e(200, 270, 120, 40, '#3d8bff', 'opacity=".1"');
    var car = g('translate(212,196) rotate(-24)', r(-80, -26, 160, 58, '#e53935', 16) + r(-44, -62, 92, 42, '#e53935', 14) + r(-36, -56, 34, 30, '#bfe6ff', 6) + r(6, -56, 34, 30, '#bfe6ff', 6) + r(-36, -56, 34, 10, '#e9f7ff', 5) + r(-78, -24, 156, 10, '#ff8a80', 6) + r(70, -14, 10, 14, '#fff6c8', 3) + r(-80, -14, 8, 14, '#ff4d4d', 3) + c(-46, 32, 18, '#2a2c33') + c(-46, 32, 8, '#cfd3dc') + c(46, 32, 18, '#2a2c33') + c(46, 32, 8, '#cfd3dc') + r(-80, 8, 160, 24, '#000', 0, 'opacity=".22"'));
    var cone = g('translate(98,206) rotate(-34)', d('M-14 22L14 22L4 -22L-4 -22Z', '#ff7a1a') + r(-9, -4, 18, 7, '#fff') + r(-18, 20, 36, 7, '#3a3f4b', 2));
    var guy = g('translate(304,198) rotate(28)', r(-7, 6, 6, 20, '#3b4a6b', 2) + r(1, 6, 6, 20, '#3b4a6b', 2) + r(-10, -16, 20, 24, '#ffca28', 5) + r(-8, -32, 16, 16, '#f3c9a5', 4) + r(-9, -35, 18, 6, '#4a3426', 2) + c(-3, -25, 1.6, '#25272e') + c(3, -25, 1.6, '#25272e'));
    o += '<g clip-path="url(#hcK)">' + cone + guy + car + '</g>';
    _defs += '<clipPath id="hcI"><ellipse cx="200" cy="233" rx="134" ry="80"/></clipPath>';
    o += '<g clip-path="url(#hcI)">' + rep(6, function (i) { return e(200, 318 - i * 6, 150, 34 + i * 9, '#000', 'opacity=".13"'); }) + '</g>';
    o += sk('M52 232A148 90 0 0 0 348 232', '#3d8bff', 16);
    o += sk('M60 246A140 84 0 0 0 340 246', '#2a6fe0', 5, 'opacity=".7"');
    o += sk('M58 222A146 88 0 0 1 150 148', '#bfe0ff', 6, 'opacity=".9"');
    o += sk('M164 143A146 88 0 0 1 196 141', '#bfe0ff', 6, 'opacity=".9"');
    o += rep(9, function (i) { var a = -2.6 + i * 0.32, x = 200 + Math.cos(a) * 178, y = 226 + Math.sin(a) * 118; return g('translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + i * 37 + ')', r(-5, -5, 10, 10, ['#ffd23f', '#ffffff', '#3d8bff', '#ff6f61'][i % 4], 2)); });
    o += rep(5, function (i) { return e(70, 40, 90 + i * 46, 56 + i * 30, '#fff', 'opacity=".06"'); });
    return o;
  },
  bg: function () {
    var A = G['hole-city'], R = rnd(41);
    var o = r(0, 0, 960, 600, '#86cf5e');
    o += A.street(960, 600, [130, 480, 830], [160, 470]);
    var cols = [['#e2574c', '#ff8a80'], ['#e2a85b', '#ffd166'], ['#5f86c9', '#80d8ff'], ['#8a6fc0', '#b39ddb'], ['#5aa66a', '#a5d6a7'], ['#d07a9a', '#f48fb1']];
    [[190, 220, 230, 190], [540, 220, 230, 190], [-170, 220, 250, 190], [890, 220, 250, 190]].forEach(function (b, k) {
      var x = b[0], y = b[1];
      o += r(x, y, b[2], b[3], '#ebe7de', 6);
      var c1 = cols[(k * 2) % cols.length], c2 = cols[(k * 2 + 1) % cols.length];
      o += A.bld(x + 14, y + 10, b[2] * 0.42, 90, c1[0], c1[1], k + 1) + A.bld(x + b[2] * 0.52, y + 26, b[2] * 0.42, 70, c2[0], c2[1], k + 5);
      o += A.tree(x + 30, y + 168, 0.9) + A.tree(x + b[2] - 30, y + 166, 0.9);
    });
    [[190, -100, 230, 200], [540, -100, 230, 200], [190, 530, 230, 120], [540, 530, 230, 120], [-170, -100, 250, 200], [890, -100, 250, 200], [-170, 530, 250, 120], [890, 530, 250, 120]].forEach(function (b, k) {
      o += r(b[0], b[1], b[2], b[3], k % 3 === 1 ? '#8fd463' : '#ebe7de', 6);
      if (k % 3 === 1) { o += rep(5, function (i) { return A.tree(b[0] + 24 + i * 44, b[1] + 60 + (i % 2) * 70, 1); }); }
      else { var cl = cols[(k + 2) % cols.length]; o += A.bld(b[0] + 16, b[1] + 16, b[2] - 120, b[3] - 70, cl[0], cl[1], k + 9) + A.tree(b[0] + b[2] - 50, b[1] + 60, 1.1); }
    });
    var cc = ['#e53935', '#1e88e5', '#ffc93c', '#43a047', '#fb8c00', '#8e24aa', '#f5f5f5'];
    for (var i = 0; i < 16; i++) {
      var v = i % 2, lane = [130, 480, 830, 160, 470][i % 5], vert = i % 5 < 3, t = 40 + R() * 880 * (vert ? 0.62 : 1);
      o += vert ? A.car(lane + (v ? 18 : -18), t, v ? 90 : -90, cc[i % cc.length], 1.2) : A.car(t, lane + (v ? 18 : -18), v ? 0 : 180, cc[i % cc.length], 1.2);
    }
    o += A.hole(300, 470, 62, '#ff9f1c', '#ffd28a') + A.hole(690, 160, 46, '#f15bb5', '#ffb3df') + A.hole(480, 330, 96, '#3d8bff', '#bfe0ff') + A.hole(860, 470, 34, '#2ec4b6', '#a9f0e8') + A.hole(110, 300, 40, '#9b5de5', '#d8c2ff');
    return o;
  }
};
