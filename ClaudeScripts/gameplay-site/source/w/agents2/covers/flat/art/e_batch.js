function E_pac(x, y, R, a, f) { var k = a * Math.PI / 180, cx = (R * Math.cos(k)).toFixed(1), sy = (R * Math.sin(k)).toFixed(1); return d('M' + x + ' ' + y + ' L' + (x + +cx) + ' ' + (y - sy) + ' A' + R + ' ' + R + ' 0 1 0 ' + (x + +cx) + ' ' + (y + +sy) + ' Z', f); }
function E_ghost(x, y, s, f, lx) { lx = lx === undefined ? 1 : lx; return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M-1 0 A1 1 0 0 1 1 0 L1 1 L0.67 0.72 L0.33 1 L0 0.72 L-0.33 1 L-0.67 0.72 L-1 1 Z', f) + e(-0.38, -0.12, 0.26, 0.32, '#fff') + e(0.38, -0.12, 0.26, 0.32, '#fff') + c(-0.38 + 0.12 * lx, -0.08, 0.14, '#2121ff') + c(0.38 + 0.12 * lx, -0.08, 0.14, '#2121ff')); }
function E_wall(x, y, w, h, rx, sw) { return r(x, y, w, h, '#000', rx, 'stroke="#2a2aff" stroke-width="' + sw + '"') + r(x, y, w, h, 'none', rx, 'stroke="#000" stroke-width="' + Math.round(sw * 0.36) + '"'); }
function E_sec(cx, cy, R, ri, a0, a1, f, x2) { function P(rr, a) { a = a * Math.PI / 180; return (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return d('M' + P(R, a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + P(R, a1) + ' L' + P(ri, a1) + ' A' + ri + ' ' + ri + ' 0 0 0 ' + P(ri, a0) + ' Z', f, x2); }
function E_simon(cx, cy, R, lit) { var cols = [['#2bc48a', '#7dffc4', 180], ['#ff4d6d', '#ff9fb2', 270], ['#3d8bfd', '#9cc8ff', 0], ['#f4c20d', '#ffe680', 90]]; var o = c(cx, cy, R * 1.08, '#16152a') + c(cx, cy, R * 1.08, 'none', 'stroke="#4a4770" stroke-width="' + R * 0.04 + '"'); cols.forEach(function (q, i) { var a = q[2], m = (a + 45) * Math.PI / 180, gx = Math.cos(m) * R * 0.05, gy = Math.sin(m) * R * 0.05, on = i === lit; o += g('translate(' + gx.toFixed(1) + ',' + gy.toFixed(1) + ')', E_sec(cx, cy, R, R * 0.38, a, a + 90, on ? q[1] : q[0]) + E_sec(cx, cy, R * 0.97, R * 0.84, a + 8, a + 50, '#fff', 'opacity="' + (on ? 0.55 : 0.22) + '"')); }); return o + c(cx, cy, R * 0.3, '#2a2850') + c(cx, cy, R * 0.3, 'none', 'stroke="#16152a" stroke-width="' + R * 0.06 + '"'); }
function E_disc(x, y, R, top, side, ring) { return e(x, y + R * 0.18, R, R, side) + c(x, y, R, top) + c(x, y, R * 0.68, 'none', 'stroke="' + ring + '" stroke-width="' + (R * 0.1).toFixed(1) + '"'); }
function E_crown(x, y, s) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', p([[-34, 14], [-42, -24], [-17, -4], [0, -32], [17, -4], [42, -24], [34, 14]], '#ffd23f') + r(-34, 8, 68, 12, '#e8a400', 3) + c(0, -32, 7, '#ffd23f') + c(-42, -24, 6, '#ffd23f') + c(42, -24, 6, '#ffd23f')); }
function E_knife(x, y, rot, s) { return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + (s || 1) + ')', p([[0, 0], [20, 32], [20, 108], [-20, 108], [-20, 32]], '#c9d3e0') + p([[0, 0], [0, 108], [-20, 108], [-20, 32]], '#f4f7fb') + r(-34, 104, 68, 18, '#5a6275', 8) + r(-15, 120, 30, 78, '#e8322c', 9) + r(-15, 138, 30, 13, '#fff') + r(-15, 166, 30, 13, '#fff') + c(0, 202, 15, '#5a6275')); }
function E_log(x, y, R) { return c(x, y, R, '#7a4a24') + c(x, y, R * 0.88, '#e0a45e') + c(x, y, R * 0.66, 'none', 'stroke="#b97a3c" stroke-width="' + R * 0.06 + '"') + c(x, y, R * 0.4, 'none', 'stroke="#b97a3c" stroke-width="' + R * 0.06 + '"') + c(x, y, R * 0.12, '#b97a3c') + d('M' + (x + R * 0.88) + ' ' + y + ' L' + (x + R * 0.5) + ' ' + (y + R * 0.06) + ' L' + (x + R * 0.3) + ' ' + (y - R * 0.04), 'none', 'stroke="#9a5f2c" stroke-width="' + R * 0.05 + '" stroke-linecap="round"'); }
function E_tile(x, y, s, n, fs) { return r(x, y + s * 0.07, s, s, '#b8702f', s * 0.16) + r(x, y, s, s, '#f2b56b', s * 0.16) + r(x + s * 0.08, y + s * 0.07, s * 0.84, s * 0.3, '#ffd59a', s * 0.12, 'opacity=".55"') + t(x + s / 2, y + s * 0.7, n, fs || s * 0.54, '#6b3415', { font: 'Lilita One', w: 400 }); }
function E_pipe(path, sw, water) { return sk(path, '#3a4560', sw + 14) + sk(path, '#a9b5ca', sw) + sk(path, '#d3dce8', sw * 0.22, 'transform="translate(0,-' + (sw * 0.22).toFixed(0) + ')"') + (water ? sk(water, '#1688ff', sw * 0.5) + sk(water, '#7fd3ff', sw * 0.16) : sk(path, '#0b1328', sw * 0.5)); }
function E_mouse(x, y, s, rot) { return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', sk('M0 -140 C0 -200 70 -200 60 -260', '#3a3560', 14) + r(-90, -140, 180, 280, '#c9c6e0', 90, 'transform="translate(0,12)"') + r(-90, -140, 180, 280, '#f7f7fb', 90) + d('M0 -140 A90 90 0 0 0 -90 -50 L-90 -30 L0 -30 Z', '#ff595e') + d('M-8 -132 A82 82 0 0 0 -78 -60 L-60 -60 A62 62 0 0 1 -8 -112 Z', '#ff9a9a', 'opacity=".7"') + ln(0, -140, 0, -30, '#c9c6e0', 8) + ln(-88, -30, 88, -30, '#c9c6e0', 8) + r(-11, -112, 22, 50, '#3a3560', 11)); }
function E_tick(x, y, s, col, w) { return sk('M' + (x - 0.9 * s) + ' ' + y + ' L' + (x - 0.3 * s) + ' ' + (y + 0.6 * s) + ' L' + (x + s) + ' ' + (y - 0.75 * s), col, w); }
function E_cross(x, y, s, col, w) { return sk('M' + (x - s) + ' ' + (y - s) + ' L' + (x + s) + ' ' + (y + s) + ' M' + (x + s) + ' ' + (y - s) + ' L' + (x - s) + ' ' + (y + s), col, w); }
function E_hw(y, y0, y1, a0, b0, a1, b1) { var f = (y - y0) / (y1 - y0); return [a0 + (a1 - a0) * f, b0 + (b1 - b0) * f]; }
function E_chimp(x, y, s) { var B = '#6b4423', F = '#f0c08e'; return g('translate(' + x + ',' + y + ') scale(' + s + ')', c(-50, 0, 20, B) + c(50, 0, 20, B) + c(-50, 0, 11, F) + c(50, 0, 11, F) + c(0, 0, 52, B) + p([[-14, -50], [0, -64], [6, -50], [18, -58], [16, -44]], B) + c(-18, -8, 22, F) + c(18, -8, 22, F) + e(0, 18, 34, 24, F) + c(-17, -9, 7, '#2a1d14') + c(17, -9, 7, '#2a1d14') + c(-15, -11, 2.5, '#fff') + c(19, -11, 2.5, '#fff') + c(-6, 11, 3, B) + c(6, 11, 3, B) + sk('M-15 25 Q0 36 15 25', B, 5)); }
var E_LC = ['#4cc9f0', '#72efdd', '#ffd166', '#ff70a6'];
function E_road(y0, y1, a0, b0, a1, b1, hit, notes) {
  var o = p([[a0, y0], [b0, y0], [b1, y1], [a1, y1]], '#1d0237') + p([[a0, y0], [b0, y0], [b1, y1], [a1, y1]], lg(['#2a0b4f', '#4a1590']));
  for (var k = 1; k < 4; k++) o += ln(a0 + (b0 - a0) * k / 4, y0, a1 + (b1 - a1) * k / 4, y1, '#7a3fd0', 5);
  o += ln(a0, y0, a1, y1, '#ff70a6', 10) + ln(b0, y0, b1, y1, '#4cc9f0', 10);
  var H = E_hw(hit, y0, y1, a0, b0, a1, b1), lw = (H[1] - H[0]) / 4;
  o += ln(H[0], hit, H[1], hit, '#fff', 6, 'opacity=".8"');
  notes.forEach(function (n) { var X = E_hw(n[1], y0, y1, a0, b0, a1, b1), w = (X[1] - X[0]) / 4, cx = X[0] + w * (n[0] + 0.5); if (n[2]) { var Y = E_hw(n[2], y0, y1, a0, b0, a1, b1), w2 = (Y[1] - Y[0]) / 4, cx2 = Y[0] + w2 * (n[0] + 0.5); o += p([[cx - w * 0.16, n[1]], [cx + w * 0.16, n[1]], [cx2 + w2 * 0.16, n[2]], [cx2 - w2 * 0.16, n[2]]], E_LC[n[0]], 'opacity=".75"'); } o += e(cx, n[1] + w * 0.08, w * 0.4, w * 0.2, '#000', 'opacity=".35"') + e(cx, n[1], w * 0.4, w * 0.2, E_LC[n[0]]) + e(cx, n[1] - w * 0.05, w * 0.24, w * 0.09, '#fff', 'opacity=".7"'); });
  for (k = 0; k < 4; k++) o += e(H[0] + lw * (k + 0.5), hit, lw * 0.42, lw * 0.21, 'none', 'stroke="' + E_LC[k] + '" stroke-width="' + (lw * 0.09).toFixed(1) + '"');
  return o;
}

G['maze-muncher'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#000');
    o += E_wall(-40, -40, 480, 120, 30, 18) + E_wall(-40, 320, 480, 120, 30, 18);
    o += c(236, 200, 12, '#ffb8ae');
    o += E_pac(112, 200, 94, 34, '#ffd800');
    o += E_ghost(328, 192, 62, '#ff2020', -1);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#000');
    var cx = [60, 235, 405, 575, 745, 910], cy = [60, 210, 360, 525];
    cy.forEach(function (y) { for (var x = 60; x <= 910; x += 34) o += c(x, y, 6, '#ffb8ae'); });
    cx.forEach(function (x) { for (var y = 60; y <= 525; y += 34) o += c(x, y, 6, '#ffb8ae'); });
    o += r(30, 180, 330, 60, '#000');
    o += E_wall(14, 14, 932, 572, 26, 14);
    for (var i = 0; i < 5; i++) for (var j = 0; j < 3; j++) o += E_wall(90 + 170 * i, 90 + 150 * j, 120, 90, 18, 14);
    o += c(60, 60, 16, '#ffb8ae') + c(910, 525, 16, '#ffb8ae') + c(910, 60, 16, '#ffb8ae');
    o += E_pac(330, 210, 40, 34, '#ffd800');
    o += E_ghost(575, 210, 36, '#ff2020', -1) + E_ghost(745, 360, 36, '#ffb8ff', -1) + E_ghost(405, 525, 36, '#00ffff', 1) + E_ghost(235, 60, 36, '#ffb852', 1);
    return o;
  }
};

G['rhythm'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3d0569', '#7209b7']));
    o += rep(9, function (i) { return c((i * 97) % 400, 20 + (i * 53) % 90, 4, '#fff', 'opacity=".6"'); });
    o += E_road(-10, 410, 150, 250, -40, 440, 330, [[0, 40], [2, 90, 10], [1, 150], [3, 200], [0, 250], [2, 270]]);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#1d0237', '#4a0a80', '#7209b7']));
    o += rep(30, function (i) { return c((i * 137) % 960, (i * 61) % 260, 3 + i % 3, '#fff', 'opacity=".5"'); });
    o += p([[0, 0], [120, 0], [420, 600], [260, 600]], '#ff70a6', 'opacity=".12"') + p([[960, 0], [840, 0], [540, 600], [700, 600]], '#4cc9f0', 'opacity=".12"');
    o += rep(12, function (i) { var h = 60 + (i * 47) % 160, x = i < 6 ? i * 34 + 10 : 960 - (i - 5) * 34; return r(x, 600 - h, 24, h, E_LC[i % 4], 4, 'opacity=".7"'); });
    o += E_road(120, 640, 410, 550, 160, 800, 520, [[0, 160], [3, 200], [1, 260, 170], [2, 330], [0, 400], [3, 450], [2, 500]]);
    return o;
  }
};

G['checkers'] = {
  icon: function () {
    var o = '', s = 134;
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o += r(i * s - 1, j * s - 1, s + 1, s + 1, (i + j) % 2 ? '#f3d9a4' : '#9b4a26');
    o += E_disc(333, 67, 54, '#2e2e36', '#121216', '#4a4a56') + E_disc(67, 333, 54, '#2e2e36', '#121216', '#4a4a56') + E_disc(333, 333, 54, '#e5352b', '#a01c16', '#b8231c');
    o += E_disc(200, 214, 62, '#e5352b', '#a01c16', '#b8231c') + E_disc(200, 182, 62, '#e5352b', '#a01c16', '#b8231c') + E_crown(200, 182, 0.95);
    o += E_disc(67, 67, 54, '#e5352b', '#a01c16', '#b8231c');
    return o;
  },
  bg: function () {
    var o = '', s = 120;
    for (var i = 0; i < 8; i++) for (var j = 0; j < 5; j++) o += r(i * s, j * s, s, s, (i + j) % 2 ? '#f3d9a4' : '#9b4a26');
    var R = rnd(7);
    for (i = 0; i < 8; i++) for (j = 0; j < 5; j++) if ((i + j) % 2 === 0 && R() < 0.62) o += E_disc(i * s + 60, j * s + 56, 44, j < 2 ? '#2e2e36' : '#e5352b', j < 2 ? '#121216' : '#a01c16', j < 2 ? '#4a4a56' : '#b8231c');
    o += E_disc(540, 290, 50, '#e5352b', '#a01c16', '#b8231c') + E_disc(540, 262, 50, '#e5352b', '#a01c16', '#b8231c') + E_crown(540, 262, 0.75);
    return o;
  }
};

G['pong'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#1b1f3a', '#0b0d1c']));
    o += r(0, 26, 400, 14, '#fff', 0, 'opacity=".85"') + r(0, 360, 400, 14, '#fff', 0, 'opacity=".85"');
    o += rep(8, function (i) { return r(193, 54 + i * 40, 14, 22, '#fff', 0, 'opacity=".45"'); });
    o += t(140, 120, '3', 52, '#fff', { font: "'Press Start 2P'", w: 400 }) + t(260, 120, '2', 52, '#fff', { font: "'Press Start 2P'", w: 400 });
    o += r(36, 150, 34, 150, '#fff', 4) + r(330, 90, 34, 150, '#fff', 4);
    o += rep(5, function (i) { return r(110 + i * 34, 278 - i * 22, 30, 30, '#fff', 2, 'opacity="' + (0.1 + i * 0.12) + '"'); }) + r(266, 162, 40, 40, '#fff', 3);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#0b0d1c');
    o += r(0, 30, 960, 20, '#fff') + r(0, 550, 960, 20, '#fff');
    o += rep(12, function (i) { return r(470, 70 + i * 42, 20, 26, '#fff', 0, 'opacity=".6"'); });
    o += t(330, 190, '3', 110, '#fff', { font: "'Press Start 2P'", w: 400 }) + t(630, 190, '2', 110, '#fff', { font: "'Press Start 2P'", w: 400 });
    o += r(60, 240, 34, 160, '#fff') + r(866, 180, 34, 160, '#fff');
    o += rep(6, function (i) { return r(260 + i * 60, 420 - i * 34, 34, 34, '#fff', 0, 'opacity="' + (0.08 + i * 0.1) + '"'); }) + r(620, 200, 40, 40, '#fff');
    return o;
  }
};

G['tictactoe'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3a6bff', '#2848c9']));
    [143, 257].forEach(function (v) { o += r(v - 9, 34, 18, 332, '#1d2b8f', 9, 'transform="translate(0,6)"') + r(v - 9, 34, 18, 332, '#fff', 9) + r(34, v - 9, 332, 18, '#1d2b8f', 9, 'transform="translate(0,6)"') + r(34, v - 9, 332, 18, '#fff', 9); });
    var X = function (x, y) { return E_cross(x, y + 6, 32, '#b3203c', 28) + E_cross(x, y, 32, '#ff4d6d', 28); };
    var O = function (x, y) { return c(x, y + 6, 36, 'none', 'stroke="#c48a00" stroke-width="26"') + c(x, y, 36, 'none', 'stroke="#ffd23f" stroke-width="26"'); };
    o += X(86, 86) + X(200, 200) + X(314, 314) + O(314, 86) + O(86, 314) + O(314, 200);
    o += sk('M60 60 L340 340', '#fff', 20);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#2848c9', '#1d2b4f']));
    [380, 580].forEach(function (v) { o += r(v - 14, 20, 28, 560, '#fff', 14); });
    [210, 390].forEach(function (v) { o += r(200, v - 14, 560, 28, '#fff', 14); });
    var X = function (x, y, s) { return E_cross(x, y, s, '#ff4d6d', s * 0.8); }, O = function (x, y, s) { return c(x, y, s, 'none', 'stroke="#ffd23f" stroke-width="' + s * 0.65 + '"'); };
    o += X(290, 110, 50) + O(480, 300, 60) + X(670, 490, 50) + O(670, 110, 60) + X(480, 110, 50) + O(290, 490, 60);
    o += X(90, 140, 40) + O(100, 440, 50) + X(870, 300, 40) + O(880, 520, 46) + O(860, 80, 40) + X(80, 290, 30);
    return o;
  }
};

G['archery'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#7fd3ff', '#bfeaff'])) + r(0, 300, 400, 100, '#5cbf4a') + c(80, 330, 90, '#4aa83a') + c(330, 320, 100, '#4aa83a') + r(0, 340, 400, 60, '#3f9a32');
    o += r(150, 300, 26, 100, '#7a4a24') + r(224, 300, 26, 100, '#7a4a24');
    o += c(200, 192, 170, '#c9c9c9') + c(200, 184, 168, '#fff') + c(200, 184, 134, '#2b2a33') + c(200, 184, 101, '#2d7de1') + c(200, 184, 68, '#ff4d4d') + c(200, 184, 34, '#ffd23f');
    o += sk('M206 178 L330 54', '#6b4423', 12) + p([[318, 50], [352, 16], [366, 2], [356, 40], [342, 54]], '#ff4d6d') + p([[334, 66], [368, 32], [382, 18], [344, 28], [330, 42]], '#e83a5a');
    o += sk('M150 214 L60 304', '#6b4423', 12, 'opacity="0"');
    o += c(204, 180, 7, '#4a2a10');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#6fc8ff', '#c8eeff']));
    o += r(120, 70, 160, 40, '#fff', 20) + r(160, 50, 90, 40, '#fff', 20) + r(620, 110, 180, 44, '#fff', 22);
    o += c(150, 470, 260, '#59b84a') + c(780, 460, 280, '#4fae40') + r(0, 420, 960, 180, '#5cbf4a') + r(0, 520, 960, 80, '#4aa83a');
    o += r(640, 330, 22, 200, '#7a4a24') + r(760, 330, 22, 200, '#7a4a24');
    o += c(710, 280, 150, '#fff') + c(710, 280, 120, '#2b2a33') + c(710, 280, 90, '#2d7de1') + c(710, 280, 60, '#ff4d4d') + c(710, 280, 30, '#ffd23f');
    o += sk('M712 278 L840 160', '#6b4423', 10) + p([[830, 156], [860, 126], [872, 116], [862, 148], [850, 160]], '#ff4d6d');
    o += sk('M690 300 L820 380', '#6b4423', 10) + p([[810, 374], [846, 392], [860, 400], [826, 404], [812, 392]], '#ff4d6d');
    o += sk('M180 120 Q360 300 180 480', '#8a5a2a', 24) + ln(180, 120, 180, 480, '#fff', 5) + sk('M175 300 L470 300', '#6b4423', 10) + p([[470, 288], [500, 300], [470, 312]], '#9aa4b2') + p([[150, 290], [190, 290], [180, 300], [190, 310], [150, 310]], '#ff4d6d');
    return o;
  }
};

G['sequence'] = {
  icon: function () {
    return r(0, 0, 400, 400, lg(['#2a2650', '#16152a'])) + E_simon(200, 200, 168, 0);
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#2a2650', '#1d1b33']));
    o += E_simon(250, 300, 260, 1) + E_simon(800, 140, 120, 3) + E_simon(830, 500, 90, 2);
    o += c(250, 300, 300, 'none', 'stroke="#7c5cff" stroke-width="10" opacity=".4"');
    return o;
  }
};

G['pinball'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3a1d8c', '#120a33']));
    o += sk('M26 420 L26 170 A174 174 0 0 1 374 170 L374 420', '#7fe3ff', 16);
    o += rep(3, function (i) { return r(150 + i * 40, 46, 16, 40, ['#ffd23f', '#7dff6a', '#ff4d6d'][i], 8); });
    [[120, 150, '#ff4d6d'], [280, 150, '#4cc9f0'], [200, 236, '#7dff6a']].forEach(function (b) { o += c(b[0], b[1] + 8, 46, '#0c0920', 'opacity=".5"') + c(b[0], b[1], 46, b[2]) + c(b[0], b[1], 32, '#ffd23f') + c(b[0], b[1], 14, '#fff'); });
    o += p([[46, 236], [46, 300], [96, 324]], '#ff4d6d', 'stroke="#fff" stroke-width="8" stroke-linejoin="round"') + p([[354, 236], [354, 300], [304, 324]], '#ff4d6d', 'stroke="#fff" stroke-width="8" stroke-linejoin="round"');
    o += sk('M80 328 L176 372', '#fff', 34) + sk('M80 328 L176 372', '#ffd23f', 22) + sk('M320 328 L236 278', '#fff', 34) + sk('M320 328 L236 278', '#ffd23f', 22) + c(80, 328, 8, '#120a33') + c(320, 328, 8, '#120a33');
    o += c(250, 318, 30, '#7c88a2') + c(246, 314, 26, '#d3dce8') + c(238, 305, 9, '#fff');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#3a1d8c', '#120a33']));
    o += sk('M120 640 L120 260 A360 260 0 0 1 840 260 L840 640', '#7fe3ff', 18) + sk('M200 640 L200 300 A280 200 0 0 1 480 110', '#ff70a6', 12);
    o += rep(5, function (i) { return r(380 + i * 44, 70, 18, 50, ['#ffd23f', '#7dff6a', '#ff4d6d', '#4cc9f0', '#ffd23f'][i], 9); });
    [[400, 230, '#ff4d6d'], [560, 230, '#4cc9f0'], [480, 330, '#7dff6a'], [690, 190, '#ffd23f']].forEach(function (b) { o += c(b[0], b[1], 52, b[2]) + c(b[0], b[1], 36, '#ffd23f') + c(b[0], b[1], 16, '#fff'); });
    o += p([[230, 400], [230, 480], [320, 520]], '#ff4d6d') + p([[730, 400], [730, 480], [640, 520]], '#ff4d6d');
    o += sk('M300 520 L440 572', '#ffd23f', 30) + sk('M660 520 L520 572', '#ffd23f', 30);
    o += c(600, 420, 30, '#d3dce8') + c(592, 412, 9, '#fff');
    o += rep(6, function (i) { return c(80 + (i % 2) * 800, 140 + i * 70, 14, ['#ffd23f', '#ff70a6', '#7fe3ff'][i % 3]); });
    return o;
  }
};

G['slide'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#8a3a5e', '#4a1d33'])), s = 77;
    o += r(22, 22, 356, 356, '#3a1427', 26);
    for (var n = 0; n < 15; n++) { var i = n % 4, j = Math.floor(n / 4); o += E_tile(34 + i * (s + 8), 32 + j * (s + 8), s, n + 1, 44); }
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#73304d', '#4a1d33'])), s = 150;
    o += rep(10, function (i) { return r(i * 100 - 20, 0, 50, 600, '#fff', 0, 'opacity=".03"'); });
    o += g('translate(480,300) rotate(-8)', r(-335, -335, 670, 670, '#3a1427', 40) + rep(15, function (n) { var i = n % 4, j = Math.floor(n / 4); return E_tile(-315 + i * (s + 10), -315 + j * (s + 10), s, n + 1, 80); }));
    return o;
  }
};

G['box-pusher'] = {
  icon: function () {
    var o = r(0, 0, 400, 300, '#5a4a72');
    o += rep(6, function (j) { return rep(5, function (i) { return r(i * 100 - (j % 2) * 50 + 4, j * 50 + 4, 92, 42, j % 2 ? '#6b5a86' : '#665482', 6); }); });
    o += r(0, 300, 400, 100, '#c9b48a') + r(0, 300, 400, 10, '#a8956c') + ln(0, 350, 400, 350, '#b5a078', 6);
    o += p([[230, 318], [400, 318], [400, 372], [200, 372]], '#3ddc97') + p([[248, 326], [392, 326], [392, 364], [228, 364]], '#c9b48a') + p([[262, 332], [384, 332], [384, 358], [244, 358]], '#3ddc97');
    o += p([[176, 160], [206, 132], [356, 132], [326, 160]], '#f5a94a') + p([[326, 160], [356, 132], [356, 292], [326, 320]], '#b8661c');
    o += r(176, 160, 150, 160, '#e08a2a') + r(176, 160, 150, 160, 'none', 0, 'stroke="#a85a14" stroke-width="18"') + sk('M186 170 L316 310', '#a85a14', 18) + r(176, 160, 150, 160, 'none', 0, 'stroke="#7a3e0a" stroke-width="5"');
    var w = sk('M-2 -100 L-48 0', '#2c3e7a', 30) + sk('M8 -100 L26 0', '#2c3e7a', 30) + e(-44, 0, 22, 11, '#2a1d14') + e(34, 0, 22, 11, '#2a1d14') + r(-32, -190, 64, 104, '#2f7de1', 24) + sk('M10 -164 L84 -150', '#2464c0', 24) + c(90, -150, 14, '#f6c39b') + c(0, -222, 32, '#f6c39b') + d('M-34 -226 A34 34 0 0 1 34 -226 Z', '#ffd23f') + r(-36, -232, 84, 12, '#f5b400', 6) + c(18, -218, 5, '#2a1d14');
    o += g('translate(78,340) rotate(16)', w);
    o += sk('M30 140 L64 140 M18 176 L56 176', '#fff', 10, 'opacity=".6"');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#3a3550'), S = 80;
    var m = ['WWWWWWWWWWWW', 'W....W.....W', 'W.B..W..G..W', 'W..P.B..WW.W', 'WW...W.G...W', 'W..G....B..W', 'W....WW....W', 'WWWWWWWWWWWW'];
    m.forEach(function (row, j) { for (var i = 0; i < row.length; i++) { var x = i * S, y = j * S - 20, ch = row[i]; if (ch === 'W') o += r(x, y, S, S, '#8a4a2e') + r(x + 4, y + 4, S / 2 - 6, S / 2 - 6, '#a85a3a', 3) + r(x + S / 2 + 2, y + 4, S / 2 - 6, S / 2 - 6, '#a85a3a', 3) + r(x + 4, y + S / 2 + 2, S - 8, S / 2 - 6, '#a85a3a', 3); else { o += r(x, y, S, S, (i + j) % 2 ? '#c9c2b0' : '#bdb5a2'); if (ch === 'G') o += c(x + 40, y + 40, 24, 'none', 'stroke="#3ddc97" stroke-width="10"'); if (ch === 'B') o += r(x + 8, y + 8, 64, 64, '#e08a2a', 6) + r(x + 8, y + 8, 64, 64, 'none', 6, 'stroke="#a85a14" stroke-width="10"') + sk('M' + (x + 16) + ' ' + (y + 16) + ' L' + (x + 64) + ' ' + (y + 64), '#a85a14', 10); if (ch === 'P') o += c(x + 40, y + 44, 26, '#2f7de1') + c(x + 40, y + 36, 18, '#ffd23f'); } } });
    return o;
  }
};

G['number-memory'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#8a6bff', '#5b3fd9']));
    o += t(200, 236, '4829', 132, '#3a22a8', { tr: 'translate(0,8)' }) + t(200, 236, '4829', 132, '#fff');
    o += r(70, 290, 260, 26, '#3a22a8', 13) + r(70, 290, 172, 26, '#fff', 13);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#7c5cff', '#4a2fc0']));
    o += t(480, 340, '7391', 220, '#fff');
    o += t(150, 120, '52', 120, '#fff', { tr: 'rotate(-10 150 120)' }) + t(820, 130, '806', 110, '#fff', { tr: 'rotate(8 820 130)' }) + t(140, 560, '19', 120, '#fff') + t(830, 560, '4', 130, '#fff');
    o += r(280, 400, 400, 36, '#3a22a8', 18) + r(280, 400, 250, 36, '#fff', 18);
    return o;
  }
};

G['reversi'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#1f8a4c');
    [50, 200, 350].forEach(function (v) { o += r(v - 5, 0, 10, 400, '#145e33') + r(0, v - 5, 400, 10, '#145e33'); });
    var W = function (x, y) { return E_disc(x, y, 60, '#f4f4f4', '#b9bfc6', '#dfe3e8'); }, B = function (x, y) { return E_disc(x, y, 60, '#2a2a30', '#0e0e12', '#3c3c46'); };
    o += W(125, 120) + B(275, 120) + B(125, 270) + W(275, 270);
    o += c(200, 200, 12, '#145e33');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#1f8a4c'), S = 110;
    for (var i = 0; i <= 9; i++) o += r(i * S - 5, 0, 10, 600, '#145e33');
    for (var j = 0; j <= 6; j++) o += r(0, j * S - 30 - 5, 960, 10, '#145e33');
    var R = rnd(11);
    for (i = 0; i < 9; i++) for (j = 0; j < 6; j++) { var v = R(); if (v < 0.72) o += v < 0.36 ? E_disc(i * S + 55, j * S + 20, 42, '#f4f4f4', '#b9bfc6', '#dfe3e8') : E_disc(i * S + 55, j * S + 20, 42, '#2a2a30', '#0e0e12', '#3c3c46'); }
    return o;
  }
};

G['pipe-connect'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#0b1328');
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o += r(i * 133 + 5, j * 133 + 5, 123, 123, '#1d2b4f', 14) + r(i * 133 + 5, j * 133 + 5, 123, 10, '#2a3c66', 6);
    o += E_pipe('M333 -20 L333 133 Q333 200 400 200 L420 200', 56);
    o += E_pipe('M-20 67 L133 67 Q200 67 200 133 L200 267 Q200 333 267 333 L420 333', 64, 'M-20 67 L133 67 Q200 67 200 133 L200 267 Q200 333 240 333');
    [[133, 67, 0], [200, 200, 1], [333, 333, 0]].forEach(function (f) { o += f[2] ? r(f[0] - 44, f[1] - 12, 88, 24, '#7c88a2', 6) : r(f[0] - 12, f[1] - 44, 24, 88, '#7c88a2', 6); });
    o += c(240, 333, 18, '#7fd3ff') + c(262, 322, 9, '#7fd3ff') + c(274, 342, 7, '#7fd3ff');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#0b1328'), S = 120;
    for (var i = 0; i < 8; i++) for (var j = 0; j < 5; j++) o += r(i * S + 6, j * S + 6, S - 12, S - 12, '#1d2b4f', 14);
    var path = 'M-20 180 L300 180 Q360 180 360 240 L360 360 Q360 420 420 420 L660 420 Q720 420 720 360 L720 120 Q720 60 780 60 L980 60';
    o += E_pipe(path, 70, 'M-20 180 L300 180 Q360 180 360 240 L360 360 Q360 420 420 420 L600 420');
    o += E_pipe('M60 620 L60 420 Q60 360 120 360 L240 360', 60) + E_pipe('M500 -20 L500 240 M440 180 L560 180', 60) + E_pipe('M860 620 L860 300', 60);
    return o;
  }
};

G['knife-throw'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#2a3f6e', '#141d38']));
    o += rep(8, function (i) { return p([[200, 140], [200 + 600 * Math.cos(i * 0.785), 140 + 600 * Math.sin(i * 0.785)], [200 + 600 * Math.cos(i * 0.785 + 0.3), 140 + 600 * Math.sin(i * 0.785 + 0.3)]], '#fff', 'opacity=".04"'); });
    [200, 340].forEach(function (a) { var k = a * Math.PI / 180; o += E_knife(200 + 84 * Math.cos(k), 120 + 84 * Math.sin(k), a - 90, 0.6); });
    o += E_log(200, 120, 104);
    o += E_knife(200, 222, 0, 1.15);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#2a3f6e', '#141d38']));
    o += rep(12, function (i) { return p([[480, 220], [480 + 1200 * Math.cos(i * 0.52), 220 + 1200 * Math.sin(i * 0.52)], [480 + 1200 * Math.cos(i * 0.52 + 0.2), 220 + 1200 * Math.sin(i * 0.52 + 0.2)]], '#fff', 'opacity=".04"'); });
    [160, 250, 20, 300].forEach(function (a) { var k = a * Math.PI / 180; o += E_knife(480 + 110 * Math.cos(k), 220 + 110 * Math.sin(k), a - 90, 0.9); });
    o += E_log(480, 220, 160);
    o += c(560, 80, 26, '#ff4d4d') + r(556, 48, 8, 14, '#6b4423');
    o += E_knife(480, 430, 0, 0.9);
    o += rep(6, function (i) { return E_knife(60, 560 - i * 70, 0, 0.3); });
    return o;
  }
};

G['cps-test'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#7a6af0', '#4433b8']));
    o += c(150, 140, 120, 'none', 'stroke="#fff" stroke-width="10" opacity=".18"') + c(150, 140, 170, 'none', 'stroke="#fff" stroke-width="10" opacity=".1"');
    o += E_mouse(222, 238, 0.9, 16);
    o += sk('M70 70 L104 104 M40 140 L86 146 M120 30 L130 76', '#ffc15e', 14);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#6c5ce7', '#2e2390']));
    [[300, 260], [700, 180], [560, 470]].forEach(function (q) { o += rep(4, function (k) { return c(q[0], q[1], 40 + k * 46, 'none', 'stroke="#fff" stroke-width="10" opacity="' + (0.3 - k * 0.06) + '"'); }); });
    o += E_mouse(480, 330, 1.3, 14);
    o += sk('M140 80 L190 130 M90 200 L160 210 M220 40 L234 100', '#ffc15e', 18) + sk('M860 420 L810 450 M880 520 L820 520', '#ffc15e', 18);
    o += g('translate(760,90) rotate(-20)', p([[0, 0], [0, 80], [20, 62], [34, 92], [46, 86], [32, 56], [58, 56]], '#fff'));
    return o;
  }
};

G['chimp-test'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#4f7cff', '#2b3bb4']));
    var T = function (x, y, n, rot) { return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', r(-52, -46, 104, 104, '#1e2a8a', 18) + r(-52, -52, 104, 104, '#fff', 18) + (n ? t(0, 22, n, 64, '#3d5fe6') : '')); };
    o += T(90, 92, '3') + T(290, 74, '1') + T(196, 204, '4') + T(84, 314, '2');
    o += E_chimp(306, 306, 1.15);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#3d5fe6', '#2b3bb4'])), S = 120;
    for (var i = 0; i < 8; i++) for (var j = 0; j < 5; j++) o += r(i * S + 10, j * S + 10, S - 20, S - 20, '#fff', 16, 'opacity=".08"');
    [[1, 0, '1'], [4, 1, '2'], [6, 0, '3'], [2, 2, '4'], [5, 3, '5'], [0, 3, '6'], [7, 2, ''], [3, 4, ''], [6, 4, '7']].forEach(function (q) { o += r(q[0] * S + 10, q[1] * S + 10, S - 20, S - 20, '#fff', 16) + (q[2] ? t(q[0] * S + 60, q[1] * S + 86, q[2], 64, '#3d5fe6') : ''); });
    return o;
  }
};

G['hangman'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3b3760', '#2b2840']));
    o += r(40, 316, 200, 26, '#7a5230', 8) + r(84, 46, 28, 284, '#a8743a', 6) + r(84, 46, 210, 28, '#a8743a', 6) + sk('M100 130 L170 62', '#a8743a', 20) + r(84, 46, 8, 284, '#c98e4f', 4);
    o += r(273, 66, 12, 70, '#e8c07a', 4);
    o += c(279, 160, 30, 'none', 'stroke="#fff" stroke-width="13"') + sk('M279 192 L279 262 M279 212 L242 240 M279 212 L316 240 M279 262 L250 304 M279 262 L308 304', '#fff', 13);
    o += rep(5, function (i) { return r(52 + i * 62, 374, 46, 10, '#fff', 5); }) + t(137, 362, 'A', 40, '#ffca3a') + t(261, 362, 'E', 40, '#ffca3a');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#2b4a3a') + r(0, 0, 960, 600, lg(['#2f5642', '#1f3a2c']));
    o += r(160, 470, 280, 30, '#7a5230', 8) + r(220, 90, 32, 400, '#a8743a', 6) + r(220, 90, 260, 32, '#a8743a', 6) + sk('M236 200 L330 106', '#a8743a', 22) + r(452, 110, 12, 80, '#e8c07a', 4);
    o += c(458, 220, 36, 'none', 'stroke="#fff" stroke-width="12"') + sk('M458 258 L458 350 M458 280 L410 320 M458 280 L506 320', '#fff', 12);
    o += rep(7, function (i) { return r(560 + i * 56, 300, 40, 10, '#fff', 5); }) + t(636, 288, 'A', 50, '#ffca3a') + t(748, 288, 'M', 50, '#ffca3a') + t(860, 288, 'N', 50, '#ffca3a');
    var L = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    o += rep(26, function (i) { var row = i < 10 ? 0 : i < 19 ? 1 : 2, k = i < 10 ? i : i < 19 ? i - 10 : i - 19, x = 560 + k * 38 + row * 18, y = 400 + row * 52; return r(x, y, 32, 42, '#fffdf5', 6, 'opacity="' + ('AEMNST'.indexOf(L[i]) >= 0 ? 0.35 : 0.9) + '"') + t(x + 16, y + 31, L[i], 24, '#2b2840'); });
    o += r(0, 570, 960, 30, '#7a5230');
    return o;
  }
};

G['true-false'] = {
  icon: function () {
    var o = p([[0, 0], [400, 0], [0, 400]], lg(['#3ddc84', '#1fae5c'])) + p([[400, 0], [400, 400], [0, 400]], lg(['#ff6b6b', '#e0384f']));
    o += ln(420, -20, -20, 420, '#fff', 14);
    o += E_tick(122, 138, 72, '#14864a', 38) + E_tick(122, 130, 72, '#fff', 38);
    o += E_cross(274, 282, 52, '#a12b2b', 38) + E_cross(274, 274, 52, '#fff', 38);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#5a2ea6', '#2a1660']));
    o += p([[200, 0], [320, 0], [400, 600], [100, 600]], '#fff', 'opacity=".06"') + p([[640, 0], [760, 0], [860, 600], [560, 600]], '#fff', 'opacity=".06"');
    o += e(260, 520, 210, 50, '#1a0d40') + e(700, 520, 210, 50, '#1a0d40');
    o += c(260, 330, 170, '#14864a') + c(260, 316, 170, '#3ddc84') + E_tick(260, 316, 90, '#fff', 44);
    o += c(700, 330, 170, '#a12b2b') + c(700, 316, 170, '#ff5470') + E_cross(700, 316, 64, '#fff', 44);
    o += t(480, 160, '?', 160, '#ffd166', { font: 'Luckiest Guy', w: 400 });
    return o;
  }
};
