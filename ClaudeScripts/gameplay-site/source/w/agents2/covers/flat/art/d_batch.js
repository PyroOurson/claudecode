function D_dk(h, f) { var n = parseInt(h.slice(1), 16), R = n >> 16, Gc = (n >> 8) & 255, B = n & 255; function m(v) { v = f < 1 ? v * f : v + (255 - v) * (f - 1); return Math.max(0, Math.min(255, Math.round(v))); } return '#' + ((1 << 24) + (m(R) << 16) + (m(Gc) << 8) + m(B)).toString(16).slice(1); }
function D_slab(cx, y, hw, hh, th, top, lf, rt) {
  return p([[cx - hw, y], [cx, y + hh], [cx, y + hh + th], [cx - hw, y + th]], lf) + p([[cx, y + hh], [cx + hw, y], [cx + hw, y + th], [cx, y + hh + th]], rt) + p([[cx, y - hh], [cx + hw, y], [cx, y + hh], [cx - hw, y]], top);
}
function D_stars(n, W, H, seed, col, rmax) { var q = rnd(seed); return rep(n, function () { return c(Math.round(q() * W), Math.round(q() * H), 2 + q() * (rmax || 3), col || '#fff', 'opacity="' + (0.4 + q() * 0.6).toFixed(2) + '"'); }); }

var D_INV = {
  crab: ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
  squid: ['...XX...', '..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '..X..X..', '.X.XX.X.', 'X.X..X.X'],
  octo: ['....XXXX....', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXX..XX..XXX', 'XXXXXXXXXXXX', '...XX..XX...', '..XX.XX.XX..', 'XX........XX'],
  gun: ['......X......', '.....XXX.....', '.....XXX.....', '.XXXXXXXXXXX.', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX', 'XXXXXXXXXXXXX'],
  bunk: ['....XXXXXXXX....', '...XXXXXXXXXX...', '..XXXXXXXXXXXX..', '.XXXXXXXXXXXXXX.', 'XXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXX', 'XXXXX......XXXXX', 'XXXX........XXXX'],
  ufo: ['.....XXXXXX.....', '...XXXXXXXXXX...', '..XXXXXXXXXXXX..', '.XX.XX.XX.XX.XX.', 'XXXXXXXXXXXXXXXX', '..XXX..XX..XXX..', '...X........X...']
};

G['stack'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#f78fb3', '#f9b9c9']));
    o += p([[200, 20], [390, 130], [200, 240], [10, 130]], 'none', 'stroke="#fff" stroke-width="6" opacity=".35"') + p([[200, 0], [430, 135], [200, 270], [-30, 135]], 'none', 'stroke="#fff" stroke-width="6" opacity=".2"');
    var sides = [['#f2e5a2', '#e2d184'], ['#a9dcfb', '#86c4ec'], ['#7fc3f0', '#5fa9de'], ['#5aa6e0', '#4290cc'], ['#3f8ccf', '#2d76b8'], ['#2f72b5', '#215d9b'], ['#245f9e', '#1a4c85']];
    for (var k = 6; k >= 0; k--) o += D_slab(200, 150 + k * 36, 125, 72, 36, k ? '#bfe6ff' : '#fff7cf', sides[k][0], sides[k][1]);
    o += g('translate(338,262) rotate(24)', D_slab(0, 0, 34, 20, 36, '#fff7cf', '#f2e5a2', '#e2d184'));
    o += star(80, 70, 18, 6, 4, '#fff') + star(330, 60, 13, 5, 4, '#fff', -90, 'opacity=".85"') + star(55, 230, 11, 4, 4, '#fff', -90, 'opacity=".7"');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#f27aa6', '#f8b48f']));
    o += rep(6, function (i) { return p([[480, -200 + i * 70], [1000, 100 + i * 70], [480, 400 + i * 70], [-40, 100 + i * 70]], 'none', 'stroke="#fff" stroke-width="8" opacity=".12"'); });
    var cols = ['#f2e5a2', '#ffc58a', '#ff9f9f', '#c9a6ff', '#a9dcfb', '#7fc3f0', '#5aa6e0', '#3f8ccf', '#2f72b5'];
    for (var k = 8; k >= 0; k--) o += D_slab(480, 230 + k * 60, 250, 144, 60, k ? D_dk(cols[k - 1], 1.2) : '#fff7cf', cols[k], D_dk(cols[k], 0.85));
    o += D_slab(300, 120, 250, 144, 60, '#fff7cf', '#f2e5a2', '#e2d184');
    o += g('translate(820,330) rotate(20)', D_slab(0, 0, 60, 34, 60, '#fff7cf', '#f2e5a2', '#e2d184'));
    return o;
  }
};

G['sudoku'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#4f8dff', '#2a5bd8']));
    o += r(46, 52, 308, 308, '#173a96', 30) + r(46, 46, 308, 308, '#fff', 30);
    o += r(150, 150, 100, 100, '#cfe0ff');
    o += ln(150, 52, 150, 348, '#1b2a4a', 7) + ln(250, 52, 250, 348, '#1b2a4a', 7) + ln(52, 150, 348, 150, '#1b2a4a', 7) + ln(52, 250, 348, 250, '#1b2a4a', 7);
    o += r(46, 46, 308, 308, 'none', 30, 'stroke="#1b2a4a" stroke-width="10"');
    var v = [['1', '2', '3'], ['6', '5', '4'], ['7', '8', '9']], bl = { '2': 1, '5': 1, '8': 1 };
    v.forEach(function (row, j) { row.forEach(function (s, i) { if (s) o += t(100 + i * 100, 126 + j * 100, s, 80, bl[s] ? '#2f6fe8' : '#1b2a4a', { w: 800 }); }); });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#4f8dff', '#2a5bd8']));
    var sol = ['534678912', '672195348', '198342567', '859761423', '426853791', '713924856', '961537284', '287419635', '345286179'], q = rnd(7);
    var x0 = 192, y0 = 12, s = 64;
    o += r(x0, y0, s * 9, s * 9, '#fff', 10) + r(x0, y0 + 4 * s, s * 9, s, '#e3ecff') + r(x0 + 5 * s, y0, s, s * 9, '#e3ecff') + r(x0 + 5 * s, y0 + 4 * s, s, s, '#bcd3ff');
    for (var i = 1; i < 9; i++) if (i % 3) o += ln(x0 + i * s, y0, x0 + i * s, y0 + 9 * s, '#a9b8d6', 3) + ln(x0, y0 + i * s, x0 + 9 * s, y0 + i * s, '#a9b8d6', 3);
    for (i = 3; i < 9; i += 3) o += ln(x0 + i * s, y0, x0 + i * s, y0 + 9 * s, '#1b2a4a', 7) + ln(x0, y0 + i * s, x0 + 9 * s, y0 + i * s, '#1b2a4a', 7);
    o += r(x0, y0, s * 9, s * 9, 'none', 10, 'stroke="#1b2a4a" stroke-width="9"');
    sol.forEach(function (row, j) { for (var k = 0; k < 9; k++) { var z = q(); if (z < 0.55) o += t(x0 + k * s + 32, y0 + j * s + 50, row[k], 46, z < 0.4 ? '#1b2a4a' : '#2f6fe8', { w: 800 }); } });
    o += t(95, 200, '7', 110, '#fff', { w: 800, tr: 'rotate(-12 95 200)' }) + t(870, 420, '3', 110, '#fff', { w: 800, tr: 'rotate(10 870 420)' }) + t(860, 170, '9', 80, '#cfe0ff', { w: 800 }) + t(100, 470, '5', 80, '#cfe0ff', { w: 800 });
    return o;
  }
};

function D_marble(cx, cy, R) {
  var band = 'M' + (cx - R * 0.98) + ' ' + (cy - R * 0.05) + ' C' + (cx - R * 0.4) + ' ' + (cy + R * 0.35) + ' ' + (cx + R * 0.4) + ' ' + (cy + R * 0.35) + ' ' + (cx + R * 0.98) + ' ' + (cy - R * 0.05);
  return shade(R * 0.9, R * 0.28, cx, cy + R * 0.95, 0.25) + c(cx, cy, R * 1.14, '#d9ccff', 'opacity=".45"') + c(cx, cy, R, '#8a72ff') + d('M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + R + ' 0 0 0 ' + (cx + R) + ' ' + cy + ' A' + R + ' ' + (R * 0.55) + ' 0 0 1 ' + (cx - R) + ' ' + cy + ' Z', '#4a36d0') + sk(band, '#ffd23f', R * 0.34) + sk(band, '#fff', R * 0.2) + e(cx - R * 0.38, cy - R * 0.5, R * 0.26, R * 0.16, '#fff', 'opacity=".85" transform="rotate(-30 ' + (cx - R * 0.38) + ' ' + (cy - R * 0.5) + ')"');
}
function D_tile(cx, y, hw, hh, th, alt, goal) {
  var L = th * 0.28, o = D_slab(cx, y, hw, hh, th, alt ? '#8be08f' : '#78d47e', '#f3d9a8', '#dcbd85') + p([[cx - hw, y], [cx, y + hh], [cx, y + hh + L], [cx - hw, y + L]], '#5cbf62') + p([[cx, y + hh], [cx + hw, y], [cx + hw, y + L], [cx, y + hh + L]], '#4aa852');
  if (goal) { var a = [cx, y - hh], b = [cx + hw, y], cc = [cx, y + hh], dd = [cx - hw, y]; function m(P, Q, k) { return [P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k]; } for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if ((i + j) % 2) { var u0 = i / 4, u1 = (i + 1) / 4, v0 = j / 4, v1 = (j + 1) / 4; o += p([m(m(a, b, u0), m(dd, cc, u0), v0), m(m(a, b, u1), m(dd, cc, u1), v0), m(m(a, b, u1), m(dd, cc, u1), v1), m(m(a, b, u0), m(dd, cc, u0), v1)], '#22222a'); } else { u0 = i / 4; u1 = (i + 1) / 4; v0 = j / 4; v1 = (j + 1) / 4; o += p([m(m(a, b, u0), m(dd, cc, u0), v0), m(m(a, b, u1), m(dd, cc, u1), v0), m(m(a, b, u1), m(dd, cc, u1), v1), m(m(a, b, u0), m(dd, cc, u0), v1)], '#fff'); } }
  return o;
}
function D_flag(x, y, h, s) { return e(x, y, 14 * s, 6 * s, '#000', 'opacity=".25"') + r(x - 4 * s, y - h, 8 * s, h, '#3a3f4a', 3) + p([[x + 4 * s, y - h], [x + 4 * s + 78 * s, y - h + 26 * s], [x + 4 * s, y - h + 52 * s]], '#ff6aa0') + p([[x + 4 * s, y - h + 26 * s], [x + 4 * s + 78 * s, y - h + 26 * s], [x + 4 * s, y - h + 52 * s]], '#e04c86'); }

G['marble-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#6cc0ff', '#c4eaff']));
    o += e(70, 110, 70, 26, '#fff') + e(110, 92, 46, 30, '#fff') + e(340, 300, 80, 26, '#fff', 'opacity=".8"');
    for (var k = 3; k >= 0; k--) o += D_tile(88 + k * 76, 300 - k * 44, 76, 44, 38, k % 2, k === 3);
    o += D_flag(316, 168, 140, 1.1);
    o += D_marble(164, 204, 54);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#5fb4ff', '#cdeeff']));
    o += e(160, 120, 150, 50, '#fff') + e(230, 90, 90, 50, '#fff') + e(800, 160, 170, 50, '#fff') + e(740, 130, 90, 46, '#fff') + e(480, 560, 400, 60, '#fff', 'opacity=".7"');
    var cells = [[0, -3], [0, -2], [0, -1], [0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [-1, 0], [-2, 0], [-3, 0], [-3, 1], [-3, 2]];
    cells.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
    cells.forEach(function (q) { var cx = 480 + (q[0] - q[1]) * 90, y = 300 + (q[0] + q[1]) * 52; o += D_tile(cx, y, 90, 52, 44, (q[0] + q[1]) % 2, q[0] === 0 && q[1] === -3); if (q[0] === 1 && q[1] === 0) o += D_marble(cx, y - 42, 46); });
    o += D_flag(750, 144, 140, 1.1);
    return o;
  }
};

G['trivia'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#8a3ffc', '#4a12b8']));
    o += rep(8, function (i) { var a = i * 45 * Math.PI / 180, b = a + 0.3; return p([[200, 150], [200 + 400 * Math.cos(a), 150 + 400 * Math.sin(a)], [200 + 400 * Math.cos(b), 150 + 400 * Math.sin(b)]], '#fff', 'opacity=".07"'); });
    o += r(70, 46, 260, 206, '#2e0a80', 56, 'transform="translate(0,8)"') + p([[150, 240], [130, 292], [210, 248]], '#2e0a80', 'transform="translate(0,8)"');
    o += r(70, 46, 260, 206, '#fff', 56) + p([[150, 240], [130, 292], [210, 248]], '#fff');
    o += t(200, 232, '?', 200, '#ffc21a', { font: 'Luckiest Guy', st: '#4a12b8', sw: 12 });
    [['A', '#ff4d6d'], ['B', '#3a86ff'], ['C', '#2ec27e'], ['D', '#ffb703']].forEach(function (q, i) { var x = 80 + i * 80; o += c(x, 334, 34, D_dk(q[1], 0.75), 'transform="translate(0,6)"') + c(x, 334, 34, q[1]) + t(x, 349, q[0], 40, '#fff'); });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#2a0a6e', '#6a1fd0']));
    [[120, '#ff4dd2'], [320, '#3df2ff'], [640, '#ffd23a'], [840, '#7dff6a']].forEach(function (q) { o += p([[q[0] - 20, 0], [q[0] + 20, 0], [480 + (q[0] - 480) * 0.4 + 140, 600], [480 + (q[0] - 480) * 0.4 - 140, 600]], q[1], 'opacity=".22"'); });
    o += r(240, 60, 480, 200, '#fff', 40) + t(480, 220, '?', 190, '#8a3ffc', { font: 'Luckiest Guy' });
    [['A', '#ff4d6d', 60, 330], ['B', '#3a86ff', 500, 330], ['C', '#2ec27e', 60, 450], ['D', '#ffb703', 500, 450]].forEach(function (q) { o += r(q[2], q[3], 400, 90, q[1], 45) + c(q[2] + 48, q[3] + 45, 30, '#fff') + t(q[2] + 48, q[3] + 59, q[0], 38, q[1]) + r(q[2] + 100, q[3] + 34, 250, 22, '#fff', 11, 'opacity=".55"'); });
    return o;
  }
};

G['invaders'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#16124a', '#05040f']));
    o += D_stars(26, 400, 300, 11, '#fff', 2);
    o += pix(D_INV.crab, 57, 46, 26, { X: '#5df2ff' });
    o += r(194, 270, 12, 38, '#fff', 3);
    o += pix(D_INV.gun, 141, 318, 9, { X: '#4dff6a' });
    o += r(0, 390, 400, 10, '#4dff6a');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#05040f') + D_stars(70, 960, 600, 5, '#fff', 2);
    var rows = [['squid', '#ff5df2', 12], ['crab', '#5df2ff', 6], ['crab', '#5df2ff', 6], ['octo', '#ffe94d', 0], ['octo', '#ffe94d', 0]];
    rows.forEach(function (R, j) { for (var i = 0; i < 11; i++) o += pix(D_INV[R[0]], 84 + i * 74 + R[2], 80 + j * 58, 5, { X: R[1] }); });
    o += pix(D_INV.ufo, 380, 14, 6, { X: '#ff3b3b' });
    for (var b = 0; b < 4; b++) o += pix(D_INV.bunk, 110 + b * 210, 420, 8, { X: '#4dff6a' });
    o += pix(D_INV.gun, 420, 520, 8, { X: '#4dff6a' }) + r(468, 380, 8, 30, '#fff') + r(300, 340, 8, 26, '#fff') + r(0, 584, 960, 8, '#4dff6a');
    return o;
  }
};

G['aim'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#1d2f6b', '#0b1330']));
    o += rep(7, function (i) { return ln(i * 66, 0, i * 66, 400, '#3a5bbf', 4, 'opacity=".35"') + ln(0, i * 66, 400, i * 66, '#3a5bbf', 4, 'opacity=".35"'); });
    [[150, '#ff3b4f'], [120, '#fff'], [90, '#ff3b4f'], [60, '#fff'], [30, '#ff3b4f']].forEach(function (q) { o += c(200, 200, q[0], q[1]); });
    o += c(200, 200, 150, 'none', 'stroke="#c81e33" stroke-width="10"');
    var cr = '#16f2b0';
    [[200, 26, 200, 120], [200, 280, 200, 374], [26, 200, 120, 200], [280, 200, 374, 200]].forEach(function (L) { o += ln(L[0], L[1], L[2], L[3], '#0b1330', 24) + ln(L[0], L[1], L[2], L[3], cr, 12); });
    o += c(200, 200, 12, '#0b1330') + c(200, 200, 7, cr);
    o += c(60, 70, 18, '#ff3b4f') + c(345, 330, 14, '#ff3b4f') + c(340, 60, 10, '#ff3b4f');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#0e1a40') + p([[0, 380], [960, 380], [960, 600], [0, 600]], '#13235a');
    o += rep(13, function (i) { return ln(i * 80, 0, i * 80, 380, '#2a4aa8', 4, 'opacity=".5"'); }) + rep(5, function (i) { return ln(0, i * 80, 960, i * 80, '#2a4aa8', 4, 'opacity=".5"'); });
    o += rep(17, function (i) { return ln(480 + (i - 8) * 30, 380, 480 + (i - 8) * 160, 600, '#3df2ff', 4, 'opacity=".45"'); }) + rep(5, function (i) { var y = 380 + i * i * 12 + i * 16; return ln(0, y, 960, y, '#3df2ff', 4, 'opacity=".45"'); });
    [[150, 140, 46], [330, 250, 30], [700, 120, 40], [820, 300, 54], [560, 210, 26], [250, 420, 36], [680, 450, 30], [100, 300, 22]].forEach(function (q) { o += c(q[0], q[1], q[2], '#ff3b4f') + c(q[0] - q[2] * 0.3, q[1] - q[2] * 0.3, q[2] * 0.3, '#fff', 'opacity=".5"'); });
    o += c(480, 300, 60, 'none', 'stroke="#16f2b0" stroke-width="8"') + ln(480, 220, 480, 270, '#16f2b0', 8) + ln(480, 330, 480, 380, '#16f2b0', 8) + ln(400, 300, 450, 300, '#16f2b0', 8) + ln(510, 300, 560, 300, '#16f2b0', 8);
    return o;
  }
};

function D_hall(W, H, x0, y0, x1, y1, tor) {
  var o = '', wl = '#77708a', wr = '#635c75', mor = '#433d52';
  o += p([[0, 0], [W, 0], [x1, y0], [x0, y0]], '#2c2838') + p([[0, H], [x0, y1], [x1, y1], [W, H]], '#4a4458');
  o += p([[0, 0], [x0, y0], [x0, y1], [0, H]], wl) + p([[W, 0], [x1, y0], [x1, y1], [W, H]], wr);
  o += r(x0, y0, x1 - x0, y1 - y0, '#16121f');
  var vs = [0.17, 0.34, 0.5, 0.66, 0.83];
  function L(f, v) { return [f * x0, (1 - f) * H * v + f * (y0 + (y1 - y0) * v)]; }
  function Rt(f, v) { return [W - f * (W - x1), (1 - f) * H * v + f * (y0 + (y1 - y0) * v)]; }
  vs.forEach(function (v) { var a = L(0, v), b = L(1, v), a2 = Rt(0, v), b2 = Rt(1, v); o += ln(a[0], a[1], b[0], b[1], mor, 7) + ln(a2[0], a2[1], b2[0], b2[1], mor, 7); });
  [0, 0.17, 0.34, 0.5, 0.66, 0.83].forEach(function (v, k) { (k % 2 ? [0.25, 0.55, 0.78, 0.92] : [0.4, 0.68, 0.86]).forEach(function (f) { var a = L(f, v), b = L(f, v + 0.17), a2 = Rt(f, v), b2 = Rt(f, v + 0.17); o += ln(a[0], a[1], b[0], b[1], mor, 6) + ln(a2[0], a2[1], b2[0], b2[1], mor, 6); }); });
  [0.25, 0.5, 0.75].forEach(function (u) { o += ln(W * u, H, x0 + (x1 - x0) * u, y1, '#363042', 6); });
  [0.35, 0.6, 0.8].forEach(function (f) { var y = H - f * (H - y1), xa = f * x0, xb = W - f * (W - x1); o += ln(xa, y, xb, y, '#363042', 6); });
  tor.forEach(function (q) { var x = q[0], y = q[1], s = q[2]; o += c(x, y - 30 * s, 110 * s, rg([['#ffb347', 0], ['#ffb347', 0.25], ['rgba(255,179,71,0)', 1]]), 'opacity=".6"') + r(x - 8 * s, y, 16 * s, 60 * s, '#3a2a1e', 4 * s) + r(x - 18 * s, y - 6 * s, 36 * s, 16 * s, '#2a1e14', 4 * s) + d('M' + x + ' ' + (y - 80 * s) + ' C' + (x + 34 * s) + ' ' + (y - 40 * s) + ' ' + (x + 26 * s) + ' ' + (y - 6 * s) + ' ' + x + ' ' + (y - 6 * s) + ' C' + (x - 26 * s) + ' ' + (y - 6 * s) + ' ' + (x - 34 * s) + ' ' + (y - 40 * s) + ' ' + x + ' ' + (y - 80 * s) + ' Z', '#ff7a1a') + d('M' + x + ' ' + (y - 52 * s) + ' C' + (x + 18 * s) + ' ' + (y - 30 * s) + ' ' + (x + 14 * s) + ' ' + (y - 8 * s) + ' ' + x + ' ' + (y - 8 * s) + ' C' + (x - 14 * s) + ' ' + (y - 8 * s) + ' ' + (x - 18 * s) + ' ' + (y - 30 * s) + ' ' + x + ' ' + (y - 52 * s) + ' Z', '#ffe14d'); });
  return o;
}
function D_key(s) { return c(0, 0, 46 * s, '#ffcc33') + c(0, 0, 20 * s, '#7a5a1a') + d('M' + (-46 * s) + ' 0 A' + 46 * s + ' ' + 46 * s + ' 0 0 0 ' + 46 * s + ' 0 L' + 20 * s + ' 0 A' + 20 * s + ' ' + 20 * s + ' 0 0 1 ' + (-20 * s) + ' 0 Z', '#e0a422') + r(40 * s, -13 * s, 150 * s, 26 * s, '#ffcc33', 6 * s) + r(40 * s, 2 * s, 150 * s, 11 * s, '#e0a422', 4 * s) + r(140 * s, 8 * s, 22 * s, 40 * s, '#e0a422', 4 * s) + r(170 * s, 8 * s, 20 * s, 30 * s, '#e0a422', 4 * s); }

G['maze-3d'] = {
  icon: function () {
    var o = D_hall(400, 400, 150, 150, 250, 250, [[62, 150, 0.9]]);
    o += c(200, 220, 120, rg([['rgba(255,220,120,.55)', 0], ['rgba(255,220,120,0)', 1]]));
    o += g('translate(110,250) rotate(-28)', D_key(1.15), 'stroke="#5a3e10" stroke-width="0"');
    return o;
  },
  bg: function () {
    var o = D_hall(960, 600, 390, 230, 570, 370, [[150, 200, 1.4], [820, 200, 1.4], [455, 290, 0.45]]);
    o += p([[650, 150], [760, 120], [760, 470], [650, 440]], '#16121f') + p([[650, 440], [760, 470], [700, 470]], '#4a4458');
    o += g('translate(420,330) rotate(-20)', D_key(0.7));
    return o;
  }
};

function D_disc(x, y, R, col) { return c(x, y, R, col) + c(x, y, R * 0.68, 'none', 'stroke="' + D_dk(col, 0.78) + '" stroke-width="' + R * 0.16 + '"') + d('M' + (x - R * 0.7) + ' ' + (y - R * 0.3) + ' A' + R * 0.76 + ' ' + R * 0.76 + ' 0 0 1 ' + (x - R * 0.1) + ' ' + (y - R * 0.75), 'none', 'stroke="#fff" stroke-width="' + R * 0.14 + '" stroke-linecap="round" opacity=".5"'); }

G['connect-four'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#dff1ff', '#9fd2ff']));
    var R = '#ef3b36', Y = '#ffcc1a', gr = ['___R', '__RY', '_RYR', 'RYYY'];
    o += r(25, 95, 350, 340, '#1a4fc7', 34) + r(25, 85, 350, 340, '#2563eb', 34);
    gr.forEach(function (row, j) { for (var i = 0; i < 4; i++) { var x = 80 + i * 80, y = 135 + j * 74; o += c(x, y + 4, 31, '#163f9e') + c(x, y, 30, '#cfe6ff'); if (row[i] !== '_') o += D_disc(x, y, 30, row[i] === 'R' ? R : Y); } });
    o += ln(80, 357, 320, 135, '#fff', 14, 'opacity=".9"');
    o += D_disc(160, 44, 32, Y);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#8fd0ff', '#d8efff'])) + r(0, 520, 960, 80, '#c98e4f') + r(0, 520, 960, 14, '#e0a866');
    var q = rnd(3), hh = [3, 5, 2, 6, 4, 1, 3];
    o += r(170, 70, 620, 500, '#1a4fc7', 30) + r(170, 60, 620, 500, '#2563eb', 30) + r(140, 500, 60, 90, '#1a4fc7', 10) + r(760, 500, 60, 90, '#1a4fc7', 10);
    for (var i = 0; i < 7; i++) for (var j = 0; j < 6; j++) { var x = 222 + i * 86, y = 110 + j * 80, f = 5 - j < hh[i]; o += c(x, y, 33, '#cfe6ff'); if (f) o += D_disc(x, y, 33, q() < 0.5 ? '#ef3b36' : '#ffcc1a'); }
    o += D_disc(394, 20, 34, '#ef3b36') + D_disc(70, 540, 40, '#ffcc1a') + D_disc(890, 550, 40, '#ef3b36') + D_disc(130, 480, 40, '#ffcc1a');
    return o;
  }
};

var D_GEMS = {
  r: [[[-1, -0.7], [-0.7, -1], [0.7, -1], [1, -0.7], [1, 0.7], [0.7, 1], [-0.7, 1], [-1, 0.7]], '#ff2d4a'],
  o: [[[0, -1.05], [0.9, -0.52], [0.9, 0.52], [0, 1.05], [-0.9, 0.52], [-0.9, -0.52]], '#ff8a1f'],
  y: [[[0, -1.1], [1.1, 0], [0, 1.1], [-1.1, 0]], '#ffd21f'],
  gn: [[[-0.45, -1], [0.45, -1], [1, -0.45], [1, 0.45], [0.45, 1], [-0.45, 1], [-1, 0.45], [-1, -0.45]], '#2ee05a'],
  p: [[[0, -1.05], [1.05, 0.85], [-1.05, 0.85]], '#c13cff'],
  b: [[], '#2f8cff'],
  w: [[], '#e8ecf5']
};
(function () { var cir = []; for (var i = 0; i < 10; i++) { var a = (i * 36 - 90) * Math.PI / 180; cir.push([Math.cos(a), Math.sin(a)]); } D_GEMS.b[0] = cir; D_GEMS.w[0] = cir; })();
function D_gem(cx, cy, s, k) {
  var V = D_GEMS[k][0], col = D_GEMS[k][1], n = V.length, o = '', ins = k === 'w' ? 0.75 : 0.55;
  function P(v, m) { return [+(cx + v[0] * s * m).toFixed(1), +(cy + v[1] * s * m).toFixed(1)]; }
  o += p(V.map(function (v) { return P(v, 1); }), D_dk(col, 0.6), 'transform="translate(0,' + s * 0.08 + ')"');
  for (var i = 0; i < n; i++) { var a = V[i], b = V[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, l = -(mx + my) / Math.sqrt(2) / Math.max(0.01, Math.hypot(mx, my)); o += p([P(a, 1), P(b, 1), P(b, ins), P(a, ins)], D_dk(col, l > 0.3 ? 1.35 : l < -0.3 ? 0.72 : 0.95)); }
  o += p(V.map(function (v) { return P(v, ins); }), D_dk(col, 1.15));
  o += p([P([-0.3, -0.5], 1), P([0.05, -0.5], 1), P([-0.3, -0.15], 1)], '#fff', 'opacity=".7"');
  return o;
}

G['gem-swap'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg([['#ff4fb0', 0], ['#b0127a', 1]], 0.5, 0.45, 0.75));
    o += star(330, 330, 26, 5, 4, '#fff', -90, 'opacity=".8"') + star(60, 300, 16, 4, 4, '#fff', -90, 'opacity=".7"');
    o += D_gem(92, 84, 42, 'y') + D_gem(312, 84, 38, 'gn');
    var cx = 200, cy = 240, f = 0.92;
    function P(x, y) { return [cx + x * f, cy + y * f]; }
    var T0 = P(-85, -80), T1 = P(0, -80), T2 = P(85, -80), G0 = P(-155, -10), G1 = P(-78, -10), G2 = P(0, -10), G3 = P(78, -10), G4 = P(155, -10), C = P(0, 150);
    o += p([T0, T2, G4, C, G0], '#0d3a8f', 'transform="translate(0,10)"');
    o += p([T0, G0, G1], '#8fdcff') + p([T0, T1, G2, G1], '#c9f1ff') + p([T1, T2, G3, G2], '#9fe3ff') + p([T2, G4, G3], '#4fb6f2');
    o += p([G0, G1, C], '#3a9cf5') + p([G1, G2, C], '#1f6fe0') + p([G2, G3, C], '#2f86ec') + p([G3, G4, C], '#1452c0');
    o += star(150, 172, 28, 6, 4, '#fff');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#4a0f6e', '#c0157e'])) + D_stars(40, 960, 600, 9, '#ffd1f0', 3);
    var ks = ['r', 'o', 'y', 'gn', 'b', 'p', 'w'], q = rnd(21);
    o += r(196, 16, 568, 568, '#1a0630', 20, 'opacity=".75"');
    for (var i = 0; i < 8; i++) for (var j = 0; j < 8; j++) { if ((i + j) % 2) o += r(200 + i * 70, 20 + j * 70, 70, 70, '#fff', 0, 'opacity=".06"'); o += D_gem(235 + i * 70, 55 + j * 70, 26, ks[Math.floor(q() * 7)]); }
    o += r(410, 230, 140, 70, 'none', 10, 'stroke="#fff" stroke-width="6"');
    o += D_gem(100, 150, 60, 'b') + D_gem(860, 420, 60, 'y') + D_gem(90, 470, 44, 'r') + D_gem(870, 150, 44, 'gn');
    return o;
  }
};

function D_rock(cx, cy, R, seed, col) {
  var q = rnd(seed), pts = [], pts2 = [];
  for (var i = 0; i < 10; i++) { var a = i * 36 * Math.PI / 180 + q() * 0.3, k = 0.8 + q() * 0.25; pts.push([+(cx + Math.cos(a) * R * k).toFixed(1), +(cy + Math.sin(a) * R * k).toFixed(1)]); pts2.push([+(cx - R * 0.08 + Math.cos(a) * R * k * 0.86).toFixed(1), +(cy - R * 0.1 + Math.sin(a) * R * k * 0.86).toFixed(1)]); }
  var o = p(pts, D_dk(col, 0.7)) + p(pts2, col);
  [[0.3, -0.25, 0.22], [-0.35, 0.2, 0.16], [0.1, 0.4, 0.12]].forEach(function (z) { o += c(cx + z[0] * R, cy + z[1] * R, z[2] * R, D_dk(col, 0.72)) + d('M' + (cx + z[0] * R - z[2] * R) + ' ' + (cy + z[1] * R) + ' A' + z[2] * R + ' ' + z[2] * R + ' 0 0 0 ' + (cx + z[0] * R + z[2] * R) + ' ' + (cy + z[1] * R) + ' Z', D_dk(col, 1.2), 'opacity=".6"'); });
  return o;
}
function D_ship() {
  return p([[-12, 78], [12, 78], [0, 170]], '#ff8a1f') + p([[-7, 78], [7, 78], [0, 135]], '#ffe14d') +
    p([[22, -10], [118, 56], [118, 84], [24, 66]], '#5446c9') + p([[-22, -10], [-118, 56], [-118, 84], [-24, 66]], '#7a6cf0') + r(100, 30, 18, 60, '#ff9f43', 6) + r(-118, 30, 18, 60, '#ff9f43', 6) +
    p([[0, -125], [24, -40], [28, 62], [0, 84], [-28, 62], [-24, -40]], '#eef2f8') + p([[0, -125], [24, -40], [28, 62], [0, 84]], '#bcc8da') + e(0, -38, 13, 30, '#3df2ff') + e(-4, -48, 5, 12, '#fff', 'opacity=".7"');
}

G['asteroids-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#1c1450', '#05030f'])) + c(320, 100, 170, rg([['#8a3fe0', 0], ['rgba(138,63,224,0)', 1]]), 'opacity=".6"') + D_stars(30, 400, 400, 4, '#fff', 2);
    o += D_rock(40, 60, 90, 3, '#8a7766') + D_rock(350, 330, 100, 8, '#8a7766') + D_rock(330, 110, 40, 12, '#9a8676') + D_rock(70, 320, 34, 15, '#9a8676');
    o += ln(302, 82, 332, 46, '#2fd4ff', 10) + ln(258, 54, 278, 30, '#2fd4ff', 8, 'opacity=".7"');
    o += g('translate(200,205) rotate(40) scale(1.05)', D_ship());
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#120c38', '#04030c'])) + c(200, 160, 260, '#6a2fd0', 'opacity=".22"') + c(760, 460, 300, '#1f6fe0', 'opacity=".2"') + D_stars(90, 960, 600, 6, '#fff', 2);
    [[100, 480, 120, 2], [820, 120, 140, 5], [620, 470, 80, 7], [300, 120, 60, 9], [900, 420, 60, 13], [480, 60, 40, 14], [140, 260, 46, 17], [720, 300, 36, 19]].forEach(function (q) { o += D_rock(q[0], q[1], q[2], q[3], '#8a7766'); });
    o += ln(600, 250, 690, 218, '#2fd4ff', 10) + ln(640, 310, 730, 278, '#2fd4ff', 10);
    o += g('translate(440,300) rotate(70) scale(0.9)', D_ship());
    return o;
  }
};

function D_cube(cx, cy, s, st) {
  var A = [cx, cy - 165 * s], Bp = [cx + 143 * s, cy - 83 * s], Cc = [cx, cy], Dp = [cx - 143 * s, cy - 83 * s], E = [cx - 143 * s, cy + 82 * s], F = [cx, cy + 165 * s], H = [cx + 143 * s, cy + 82 * s];
  var pal = { W: '#ffffff', Y: '#ffd500', R: '#e8322c', O: '#ff8a1f', B: '#1f6dff', G: '#19b34a' };
  var o = p([A, Bp, H, F, E, Dp], '#15161c', 'stroke="#15161c" stroke-width="' + 18 * s + '" stroke-linejoin="round"');
  function face(p00, p10, p01, p11, cols, sh) {
    var out = '';
    function at(u, v) { return [p00[0] * (1 - u) * (1 - v) + p10[0] * u * (1 - v) + p01[0] * (1 - u) * v + p11[0] * u * v, p00[1] * (1 - u) * (1 - v) + p10[1] * u * (1 - v) + p01[1] * (1 - u) * v + p11[1] * u * v].map(function (z) { return +z.toFixed(1); }); }
    for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) { var a = 0.07, u0 = i / 3 + a, u1 = (i + 1) / 3 - a, v0 = j / 3 + a, v1 = (j + 1) / 3 - a; out += p([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], D_dk(pal[cols[j * 3 + i]], sh), 'stroke="' + D_dk(pal[cols[j * 3 + i]], sh) + '" stroke-width="' + 7 * s + '" stroke-linejoin="round"'); }
    return out;
  }
  o += face(Dp, A, Cc, Bp, st[0], 1) + face(Dp, Cc, E, F, st[1], 0.9) + face(Cc, Bp, F, H, st[2], 0.78);
  return o;
}

G['cube-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#2e3266', '#141631'])) + c(200, 200, 190, '#4a52b0', 'opacity=".35"');
    o += D_cube(200, 205, 1, ['WWYWWWBWW', 'GGGGGOGGG', 'RRRWRRRRB']);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#2e3266', '#141631'])) + c(480, 300, 320, '#4a52b0', 'opacity=".35"');
    o += D_cube(150, 420, 0.9, ['YBYOYYRYW', 'OOGOORORO', 'BBBYBGBBB']) + D_cube(820, 220, 0.9, ['RWRRRRGRR', 'WWWBWWYWW', 'GOGGGGGGG']) + D_cube(480, 330, 1.45, ['WWWWWWWWW', 'GGGGGGGGG', 'RRRRRRRRR']);
    return o;
  }
};

function D_suit(k, s, col) {
  var P = { S: 'M0 -34 C-10 -18 -38 -6 -36 12 C-34 26 -16 28 -4 18 L-10 34 L10 34 L4 18 C16 28 34 26 36 12 C38 -6 10 -18 0 -34 Z', H: 'M0 32 C-44 4 -42 -28 -20 -32 C-8 -34 0 -26 0 -18 C0 -26 8 -34 20 -32 C42 -28 44 4 0 32 Z', D: 'M0 -36 L26 0 L0 36 L-26 0 Z' };
  if (k === 'C') return g('scale(' + s + ')', c(0, -16, 14, col) + c(-16, 6, 14, col) + c(16, 6, 14, col) + p([[-4, 0], [4, 0], [10, 34], [-10, 34]], col));
  return g('scale(' + s + ')', d(P[k], col));
}
function D_card(x, y, w, h, rank, suit) {
  var col = suit === 'H' || suit === 'D' ? '#e0262f' : '#1a1a1a';
  return r(x, y + 4, w, h, '#000', w * 0.1, 'opacity=".25"') + r(x, y, w, h, '#fff', w * 0.1) + t(x + w * 0.2, y + w * 0.3, rank, w * 0.27, col) + g('translate(' + (x + w * 0.2) + ',' + (y + w * 0.47) + ')', D_suit(suit, w * 0.0035, col)) + g('translate(' + (x + w / 2) + ',' + (y + h * 0.56) + ')', D_suit(suit, w * 0.0125, col));
}
function D_back(x, y, w, h) { return r(x, y + 4, w, h, '#000', w * 0.1, 'opacity=".25"') + r(x, y, w, h, '#fff', w * 0.1) + r(x + w * 0.08, y + w * 0.08, w * 0.84, h - w * 0.16, '#2a5bd7', w * 0.06) + r(x + w * 0.2, y + w * 0.2, w * 0.6, h - w * 0.4, 'none', w * 0.04, 'stroke="#7fa6ff" stroke-width="' + w * 0.05 + '"'); }

G['solitaire'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg([['#34b45a', 0], ['#15703a', 1]], 0.5, 0.4, 0.7));
    o += g('translate(200,350) rotate(-22)', D_back(-80, -260, 160, 224));
    o += g('translate(200,350) rotate(-2)', D_card(-80, -268, 160, 224, 'A', 'H'));
    o += g('translate(200,350) rotate(18)', D_card(-80, -270, 160, 224, 'A', 'S'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, rg([['#2fa84f', 0], ['#14602f', 1]], 0.5, 0.4, 0.8));
    var w = 100, h = 140, x0 = 52, sp = 124, su = ['S', 'H', 'C', 'D'], rk = ['K', 'Q', 'J', '10', '9', '8', '7'];
    o += D_back(x0, 20, w, h) + D_card(x0 + sp, 20, w, h, '7', 'D');
    for (var f = 0; f < 4; f++) o += r(x0 + (3 + f) * sp, 20, w, h, 'none', 10, 'stroke="#7fd394" stroke-width="5"') + (f < 3 ? D_card(x0 + (3 + f) * sp, 20, w, h, ['A', '2', 'A'][f], su[f]) : '');
    for (var i = 0; i < 7; i++) { var y = 190; for (var k = 0; k < i; k++) { o += D_back(x0 + i * sp, y, w, h); y += 26; } o += D_card(x0 + i * sp, y, w, h, rk[i], su[i % 4]); if (i > 3) o += D_card(x0 + i * sp, y + 44, w, h, rk[i - 3], su[(i + 1) % 4]); }
    return o;
  }
};

function D_track(x, y, w, h, z0, z1, g0, g1) { return r(x, y + 10, w, h, '#1b1229', h / 2) + r(x, y, w, h, '#3a2a58', h / 2) + r(x + 12, y + 12, w - 24, h - 24, '#251a38', (h - 24) / 2) + r(z0, y + 12, z1 - z0, h - 24, '#ffd166') + r(z0, y + h * 0.62, z1 - z0, h * 0.38 - 12, '#e8b54a') + r(g0, y + 12, g1 - g0, h - 24, '#4fd38e') + r(g0, y + h * 0.62, g1 - g0, h * 0.38 - 12, '#36b874'); }

G['perfect-stop'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg([['#d2adf5', 0], ['#8448c2', 1]], 0.5, 0.45, 0.75));
    o += star(200, 204, 200, 80, 12, '#fff', -90, 'opacity=".14"');
    o += D_track(18, 152, 364, 104, 122, 278, 166, 234);
    o += r(186, 110, 28, 188, '#251a38', 14, 'transform="translate(0,6)"') + r(186, 110, 28, 188, '#fff', 14);
    o += star(262, 104, 24, 7, 4, '#fff') + star(132, 318, 18, 6, 4, '#ffd166') + star(90, 100, 14, 5, 4, '#fff', -90, 'opacity=".8"') + star(318, 310, 12, 4, 4, '#fff', -90, 'opacity=".8"');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, rg([['#c9a2f0', 0], ['#8448c2', 1]], 0.5, 0.45, 0.8));
    o += star(480, 300, 460, 180, 14, '#fff', -90, 'opacity=".1"');
    [[40, 300, 0.3], [180, 520, 0.55], [320, 380, 0.5], [460, 640, 0.75]].forEach(function (b) { var y = b[0], zc = b[1], mx = 80 + 800 * b[2]; o += D_track(80, y, 800, 96, zc - 110, zc + 110, zc - 40, zc + 40) + r(mx - 14, y - 26, 28, 148, '#fff', 14); });
    o += star(700, 160, 30, 9, 4, '#fff') + star(240, 470, 24, 7, 4, '#ffd166');
    return o;
  }
};

G['piano-tiles'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#f4f6fb');
    o += ln(100, 0, 100, 400, '#c9d0de', 6) + ln(200, 0, 200, 400, '#c9d0de', 6) + ln(300, 0, 300, 400, '#c9d0de', 6);
    o += r(306, -20, 94, 150, '#16161c', 10) + r(106, 46, 88, 168, '#16161c', 10) + r(6, 226, 88, 200, '#16161c', 10) + r(206, 150, 88, 168, lg(['#c084fc', '#6c5ce7']), 10);
    o += r(106, 186, 88, 28, '#2e2f3a', 10) + r(306, 102, 88, 28, '#2e2f3a', 10);
    o += c(250, 244, 40, 'none', 'stroke="#fff" stroke-width="10"') + c(250, 244, 16, '#fff');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#f4f6fb'), q = rnd(5);
    for (var i = 1; i < 8; i++) o += ln(i * 120, 0, i * 120, 600, '#c9d0de', 6);
    [[0, 380], [1, 120], [2, -60], [3, 260], [4, 40], [5, 330], [6, -100], [7, 180]].forEach(function (z) { o += r(z[0] * 120 + 6, z[1], 108, 200, z[0] === 3 ? '#8f6cff' : '#16161c', 10); });
    o += r(0, 520, 960, 80, '#2a2d3a') + rep(24, function (k) { return r(k * 40 + 2, 524, 36, 76, '#fff', 4); }) + rep(24, function (k) { return [0, 1, 3, 4, 5][k % 7] !== undefined && k % 7 !== 2 && k % 7 !== 6 ? r(k * 40 + 26, 524, 26, 44, '#16161c', 4) : ''; });
    return o;
  }
};

function D_watch(cx, cy, R) { return r(cx - R * 0.18, cy - R * 1.35, R * 0.36, R * 0.3, '#ffd23a', 4) + c(cx, cy, R, '#ffd23a') + c(cx, cy, R * 0.8, '#fff') + d('M' + cx + ' ' + cy + ' L' + cx + ' ' + (cy - R * 0.8) + ' A' + R * 0.8 + ' ' + R * 0.8 + ' 0 0 1 ' + (cx + R * 0.8) + ' ' + cy + ' Z', '#ff4d6d', 'opacity=".85"') + ln(cx, cy, cx + R * 0.45, cy - R * 0.45, '#1c1470', R * 0.1) + c(cx, cy, R * 0.1, '#1c1470'); }

G['math-sprint'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg([['#4fb0cf', 0], ['#118ab2', 0.6], ['#0f6f90', 1]], 0.5, 0.4, 0.8));
    o += r(70, 26, 260, 20, '#fff', 10, 'opacity=".35"') + r(70, 26, 170, 20, '#ffd166', 10);
    o += g('rotate(-4 200 150)', r(46, 72, 308, 164, '#0b4f68', 34, 'transform="translate(0,10)"') + r(46, 72, 308, 164, '#fff', 34) + t(200, 198, '7+5', 128, '#0f3d55', { font: 'Lilita One' }));
    o += r(96, 264, 208, 104, '#17865e', 52, 'transform="translate(0,8)"') + r(96, 264, 208, 104, '#22b07d', 52) + t(200, 348, '12', 92, '#fff', { font: 'Lilita One' });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, rg([['#2f9cc0', 0], ['#0f6f90', 0.6], ['#0a4a63', 1]], 0.5, 0.45, 0.8));
    [['7', 120, 200, '#fff', 160], ['+', 300, 230, '#ffd166', 120], ['5', 460, 200, '#fff', 160], ['=', 620, 230, '#ffd166', 120], ['12', 800, 200, '#7dffb0', 160], ['3', 140, 470, '#ffd166', 110], ['×', 330, 520, '#fff', 100], ['9', 560, 500, '#ff8fab', 110], ['÷', 90, 330, '#fff', 90], ['4', 900, 400, '#ffd166', 100]].forEach(function (z) { o += t(z[1], z[2], z[0], z[4], z[3], { font: 'Lilita One' }); });
    o += D_watch(760, 470, 80);
    o += r(200, 40, 560, 26, '#fff', 13, 'opacity=".25"') + r(200, 40, 360, 26, '#ffd166', 13);
    return o;
  }
};

function D_mole(x, y, s) {
  var o = '';
  function P(a, b) { return (x + a * s).toFixed(1) + ' ' + (y + b * s).toFixed(1); }
  o += e(x, y, 170 * s, 62 * s, '#8a5a34') + e(x, y - 4 * s, 140 * s, 42 * s, '#2a1a10');
  o += d('M' + P(-112, 40) + ' L' + P(-112, -120) + ' C' + P(-112, -230) + ' ' + P(112, -230) + ' ' + P(112, -120) + ' L' + P(112, 40) + ' Z', '#9a5b34');
  o += d('M' + P(60, 40) + ' L' + P(60, -150) + ' C' + P(90, -150) + ' ' + P(112, -140) + ' ' + P(112, -110) + ' L' + P(112, 40) + ' Z', '#85492a');
  o += e(x, y - 70 * s, 70 * s, 56 * s, '#e8bf94');
  o += c(x - 44 * s, y - 128 * s, 17 * s, '#1a0f08') + c(x + 44 * s, y - 128 * s, 17 * s, '#1a0f08') + c(x - 38 * s, y - 134 * s, 6 * s, '#fff') + c(x + 50 * s, y - 134 * s, 6 * s, '#fff');
  o += e(x, y - 96 * s, 26 * s, 18 * s, '#ff7a9a') + r(x - 14 * s, y - 80 * s, 13 * s, 24 * s, '#fff', 3 * s) + r(x + 1 * s, y - 80 * s, 13 * s, 24 * s, '#fff', 3 * s);
  o += d('M' + P(-100, -170) + ' C' + P(-100, -260) + ' ' + P(100, -260) + ' ' + P(100, -170) + ' Z', '#ffcc1a') + r(x - 130 * s, y - 182 * s, 260 * s, 26 * s, '#f0a81a', 13 * s) + r(x - 14 * s, y - 248 * s, 28 * s, 70 * s, '#ffe066', 10 * s);
  o += d('M' + P(-170, 0) + ' A' + 170 * s + ' ' + 62 * s + ' 0 0 0 ' + P(170, 0) + ' L' + P(140, -4) + ' A' + 140 * s + ' ' + 42 * s + ' 0 0 1 ' + P(-140, -4) + ' Z', '#6e4426');
  return o;
}
function D_mallet(x, y, rot, s) { return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', r(-12, 20, 24, 200, '#c98e4f', 10) + r(-12, 20, 10, 200, '#e0a866', 6) + r(-80, -46, 160, 92, '#e8322c', 22) + r(-80, 10, 160, 36, '#b81f1f', 18) + r(-80, -46, 34, 92, '#ff6a5a', 16)); }

G['whack'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#92e05e', '#4fae38']));
    o += rep(9, function (i) { return e((i * 97) % 400, 60 + (i * 53) % 330, 22, 8, '#3f9a2c'); });
    o += D_mole(180, 318, 0.95);
    o += D_mallet(300, 78, -38, 0.82);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#7fd352', '#4fae38']));
    o += rep(30, function (i) { return e((i * 137) % 960, (i * 71) % 600, 26, 9, '#3f9a2c'); });
    [[200, 170, 0], [480, 170, 1], [760, 170, 0], [200, 330, 0], [480, 330, 0], [760, 330, 1], [200, 500, 1], [480, 500, 0], [760, 500, 0]].forEach(function (q) { if (q[2]) o += D_mole(q[0], q[1], 0.5); else o += e(q[0], q[1], 85, 31, '#8a5a34') + e(q[0], q[1] - 2, 70, 21, '#2a1a10'); });
    o += D_mallet(600, 120, -38, 1);
    return o;
  }
};

function D_mallet2(x, y, R, col) { return c(x, y + R * 0.12, R, '#000', 'opacity=".3"') + c(x, y, R, D_dk(col, 0.75)) + c(x, y, R * 0.84, col) + c(x, y, R * 0.5, D_dk(col, 0.7)) + c(x, y - R * 0.05, R * 0.42, D_dk(col, 1.25)) + e(x - R * 0.14, y - R * 0.2, R * 0.16, R * 0.1, '#fff', 'opacity=".6"'); }

G['air-hockey'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#2f86ff', '#0a3a8c']));
    o += r(28, 28, 344, 440, lg(['#ffffff', '#cfe2f7']), 64);
    o += rep(56, function (i) { return c(54 + (i % 7) * 49, 60 + Math.floor(i / 7) * 46, 4, '#9fb8d8'); });
    o += d('M116 28 A84 84 0 0 0 284 28', 'none', 'stroke="#3d8bfd" stroke-width="9"') + r(126, 16, 148, 26, '#081530', 10);
    o += ln(28, 378, 372, 378, '#ef2f4c', 10) + c(200, 420, 70, 'none', 'stroke="#ef2f4c" stroke-width="9"');
    o += sk('M228 176 L300 110', '#9fc4ef', 12) + sk('M214 150 L270 100', '#9fc4ef', 9) ;
    o += c(262, 136, 38, '#d68f00') + c(262, 130, 38, '#ffd43b') + c(262, 130, 22, '#fff6c4');
    o += D_mallet2(165, 270, 84, '#ef2f4c');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#050a1c') + r(30, 30, 900, 540, lg(['#2f86ff', '#0a3a8c']), 70) + r(54, 54, 852, 492, lg(['#ffffff', '#cfe2f7']), 54);
    o += rep(110, function (i) { return c(90 + (i % 11) * 78, 90 + Math.floor(i / 11) * 46, 4, '#9fb8d8'); });
    o += ln(480, 54, 480, 546, '#ef2f4c', 10) + c(480, 300, 90, 'none', 'stroke="#ef2f4c" stroke-width="10"');
    o += ln(300, 54, 300, 546, '#3d8bfd', 8) + ln(660, 54, 660, 546, '#3d8bfd', 8);
    o += d('M54 200 A100 100 0 0 1 54 400', 'none', 'stroke="#3d8bfd" stroke-width="8"') + d('M906 200 A100 100 0 0 0 906 400', 'none', 'stroke="#3d8bfd" stroke-width="8"') + r(36, 220, 26, 160, '#081530', 8) + r(898, 220, 26, 160, '#081530', 8);
    o += D_mallet2(220, 330, 70, '#ef2f4c') + D_mallet2(760, 250, 70, '#2f7bf5') + sk('M590 270 L690 230', '#9fc4ef', 12) + c(560, 296, 32, '#d68f00') + c(560, 290, 32, '#ffd43b') + c(560, 290, 18, '#fff6c4');
    return o;
  }
};

function D_keycap(x, y, w, h, ch, hot, fs) {
  var sd = hot ? '#d9640a' : '#a9aebb', fc = hot ? '#ff8a1f' : '#f2f3f7', dy = hot ? h * 0.06 : 0;
  return r(x, y + h * 0.1, w, h * 0.9, '#000', w * 0.16, 'opacity=".4"') + r(x, y + dy, w, h * 0.92, sd, w * 0.16) + r(x + w * 0.07, y + dy + h * 0.04, w * 0.86, h * 0.72, fc, w * 0.12) + t(x + w / 2, y + dy + h * 0.56, ch, fs || w * 0.42, hot ? '#fff' : '#2a2d3a', { w: 800 });
}

G['typing'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#9479e6', '#5a3fb0']));
    var rows = [['QWER', -40], ['ASDF', -10], ['ZXCV', 20]];
    rows.forEach(function (R, j) { for (var i = 0; i < 4; i++) { var ch = R[0][i]; o += D_keycap(R[1] + i * 128, 18 + j * 128, 116, 116, ch, ch === 'S' || ch === 'E'); } });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#9479e6', '#5a3fb0']));
    o += r(60, 30, 840, 150, '#fff', 24) + t(110, 125, 'the quick brown <tspan fill="#c3c7d4">fox jumps</tspan>', 64, '#2ec27e', { a: 'start', w: 800 }) + r(600, 70, 8, 80, '#ff8a1f', 3);
    var rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    rows.forEach(function (R, j) { for (var i = 0; i < R.length; i++) o += D_keycap(30 + j * 46 + i * 92, 220 + j * 96, 84, 84, R[i], R[i] === 'J' || R[i] === 'W'); });
    o += D_keycap(260, 508, 440, 84, '', false);
    return o;
  }
};
