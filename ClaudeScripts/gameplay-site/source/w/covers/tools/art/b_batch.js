function B_clip(shape, inner) { var id = uid('bc'); _defs += '<clipPath id="' + id + '">' + shape + '</clipPath>'; return '<g clip-path="url(#' + id + ')">' + inner + '</g>'; }
function B_hex(cx, cy, R, f, x2) { var q = []; for (var i = 0; i < 6; i++) { var a = (i * 60 + 30) * Math.PI / 180; q.push([+(cx + R * Math.cos(a)).toFixed(1), +(cy + R * Math.sin(a)).toFixed(1)]); } return p(q, f, x2); }
function B_iso(cx, cy, s) { return function (u, v, h) { return [+(cx + (u - v) * 0.866 * s).toFixed(1), +(cy + (u + v) * 0.5 * s - (h || 0) * s).toFixed(1)]; }; }
function B_box(P, u, v, w, l, h, top, left, right, z) { z = z || 0; return p([P(u, v + l, z), P(u + w, v + l, z), P(u + w, v + l, z + h), P(u, v + l, z + h)], left) + p([P(u + w, v, z), P(u + w, v + l, z), P(u + w, v + l, z + h), P(u + w, v, z + h)], right) + p([P(u, v, z + h), P(u + w, v, z + h), P(u + w, v + l, z + h), P(u, v + l, z + h)], top); }

function B_snk(path, col, dark, w) { return sk(path, '#000', w + 10, 'opacity=".25" transform="translate(5,8)"') + sk(path, col, w) + d(path, 'none', 'stroke="' + dark + '" stroke-width="' + w + '" stroke-dasharray="' + (w * 0.22).toFixed(0) + ' ' + (w * 0.5).toFixed(0) + '"') + sk(path, '#fff', w * 0.28, 'opacity=".28" transform="translate(-' + (w * 0.12).toFixed(0) + ',-' + (w * 0.14).toFixed(0) + ')"'); }
function B_shead(x, y, R, col, ang) { var a = ang * Math.PI / 180, ex = Math.cos(a + 1.57) * R * 0.48, ey = Math.sin(a + 1.57) * R * 0.48, fx = Math.cos(a) * R * 0.25, fy = Math.sin(a) * R * 0.25, px = Math.cos(a) * R * 0.18, py = Math.sin(a) * R * 0.18; return c(x, y, R, col) + c(x + fx + ex, y + fy + ey, R * 0.42, '#fff') + c(x + fx - ex, y + fy - ey, R * 0.42, '#fff') + c(x + fx + ex + px, y + fy + ey + py, R * 0.22, '#111') + c(x + fx - ex + px, y + fy - ey + py, R * 0.22, '#111'); }
G['slither'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#6f8cff', '#3a4fd0']));
    o += rep(7, function (i) { return rep(7, function (j) { return B_hex(i * 66 + (j % 2) * 33, j * 58, 36, '#fff', 'opacity=".05"'); }); });
    var P = 'M318 64 C210 30 78 70 110 160 C140 238 300 196 300 282 C300 336 230 350 168 326';
    o += B_snk(P, '#ff9a1f', '#f07c0a', 82);
    o += B_shead(160, 322, 54, '#ff9a1f', 160);
    o += c(60, 330, 11, '#7dff6a') + c(340, 200, 11, '#ff5fa8') + c(70, 60, 10, '#ffe030') + c(352, 352, 10, '#5fd8ff');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#161b2e');
    o += rep(17, function (i) { return rep(13, function (j) { return B_hex(i * 64 + (j % 2) * 32, j * 55, 34, j % 3 ? '#232a45' : '#1f2640', 'stroke="#10142a" stroke-width="4"'); }); });
    var R = rnd(7);
    o += rep(70, function (i) { var cl = ['#ff4040', '#80ff80', '#80d0ff', '#ffe030', '#c080ff', '#ff5fa8'][i % 6]; return c(R() * 960, R() * 600, 6 + R() * 6, cl); });
    o += B_snk('M-40 120 C120 60 260 200 380 150 C470 112 520 60 600 90', '#5fd8ff', '#2fb0e0', 46) + B_shead(600, 90, 30, '#5fd8ff', 10);
    o += B_snk('M1000 330 C860 260 760 420 640 380 C540 346 520 470 420 500', '#ff5fa8', '#e03a88', 60) + B_shead(420, 500, 38, '#ff5fa8', 160);
    o += B_snk('M80 620 C120 480 260 440 300 360', '#80ff80', '#40d040', 38) + B_shead(300, 360, 24, '#80ff80', -60);
    o += B_snk('M980 60 C880 80 860 180 760 190', '#ff9a1f', '#f07c0a', 40) + B_shead(760, 190, 26, '#ff9a1f', 175);
    return o;
  }
};

var B_HERO = ['...RRRRR....', '..RRRRRRRRR.', '..HHHSSKS...', '.HSHSSSKSSS.', '.HSHHSSSKSSS', '.HHSSSSHHHH.', '...SSSSSSS..', '..RRBRRR....', '.RRRBRRBRRR.', 'RRRRBBBBRRRR', 'SSRBYBBYBRSS', 'SSSBBBBBBSSS', 'SSBBBBBBBBSS', '..BBB..BBB..', '.HHH....HHH.', 'HHHH....HHHH'];
var B_HPAL = { R: '#e52521', H: '#6b3a0c', S: '#ffc08a', K: '#1a1a1a', B: '#2b5fd9', Y: '#ffd21a' };
function B_qblock(x, y, s) { var k = s / 16; return r(x, y, s, s, '#3a1a00') + r(x + k, y + k, s - 2 * k, s - 2 * k, '#f8a020') + r(x + k, y + k, s - 2 * k, k, '#ffd27a') + r(x + 2 * k, y + 2 * k, k, k, '#3a1a00') + r(x + s - 3 * k, y + 2 * k, k, k, '#3a1a00') + r(x + 2 * k, y + s - 3 * k, k, k, '#3a1a00') + r(x + s - 3 * k, y + s - 3 * k, k, k, '#3a1a00') + pix(['.WWWW.', 'WW..WW', '....WW', '...WW.', '..WW..', '..WW..', '......', '..WW..'], x + 5 * k + k * 0.6, y + 4 * k + k * 0.6, k, { W: '#8a3a00' }) + pix(['.WWWW.', 'WW..WW', '....WW', '...WW.', '..WW..', '..WW..', '......', '..WW..'], x + 5 * k, y + 4 * k, k, { W: '#fff3d0' }); }
function B_bricks(x, y, w, h, bw, bh) { var o = r(x, y, w, h, '#c84c0c'); for (var j = 0; j * bh < h; j++) { o += r(x, y + j * bh, w, 4, '#5a1e00') + r(x, y + j * bh + 4, w, 4, '#ff9a5a', 0, 'opacity=".5"'); for (var i = -1; i * bw < w; i++) o += r(x + i * bw + (j % 2) * bw / 2, y + j * bh, 4, bh, '#5a1e00'); } return o; }
function B_pipe(x, y, w, h) { return r(x + 8, y + 40, w - 16, h, '#00a800', 0, 'stroke="#0a3a0a" stroke-width="6"') + r(x + 20, y + 40, 14, h, '#8ff07a') + r(x, y, w, 46, '#00a800', 0, 'stroke="#0a3a0a" stroke-width="6"') + r(x + 12, y + 6, 14, 34, '#8ff07a'); }
G['brick-bros'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#5c94fc');
    o += e(330, 300, 60, 34, '#fff') + e(290, 312, 40, 22, '#fff') + e(372, 314, 40, 22, '#fff');
    o += B_bricks(0, 344, 400, 60, 50, 28);
    o += pix(B_HERO, 28, 56, 18, B_HPAL);
    o += B_qblock(262, 34, 118);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#5c94fc');
    [[140, 110], [560, 80], [860, 150]].forEach(function (q) { o += e(q[0], q[1], 70, 36, '#fff') + e(q[0] - 50, q[1] + 14, 46, 26, '#fff') + e(q[0] + 50, q[1] + 14, 46, 26, '#fff'); });
    o += e(120, 500, 180, 120, '#00a800', 'stroke="#0a3a0a" stroke-width="6"') + e(540, 500, 110, 70, '#00a800', 'stroke="#0a3a0a" stroke-width="6"');
    o += e(380, 500, 80, 34, '#7ad84a') + e(330, 500, 50, 26, '#7ad84a') + e(900, 500, 70, 30, '#7ad84a');
    o += B_bricks(0, 500, 960, 100, 64, 34);
    o += B_qblock(320, 250, 64) + B_bricks(384, 250, 64, 64, 64, 32) + B_qblock(448, 250, 64) + B_bricks(512, 250, 64, 64, 64, 32) + B_qblock(416, 60, 64);
    o += B_pipe(700, 360, 130, 140);
    o += pix(B_HERO, 190, 404, 8, B_HPAL);
    o += g('translate(600,450)', d('M-34 30 C-34 -10 -20 -26 0 -26 C20 -26 34 -10 34 30 Z', '#9a4a0a') + r(-20, 26, 40, 14, '#ffc08a') + e(-16, 46, 16, 8, '#2a1a00') + e(16, 46, 16, 8, '#2a1a00') + r(-14, -4, 8, 14, '#fff') + r(6, -4, 8, 14, '#fff'));
    return o;
  }
};

function B_neonRoad(cx, y0, w0, y1, w1, nT, nL, col, sw, fill) {
  var o = p([[cx - w0, y0], [cx + w0, y0], [cx + w1, y1], [cx - w1, y1]], fill);
  for (var k = 0; k <= nT; k++) { var f = Math.pow(k / nT, 1.8), y = y0 + (y1 - y0) * f, w = w0 + (w1 - w0) * f; o += ln(cx - w, y, cx + w, y, col, sw * (0.4 + f)); }
  for (var j = 0; j <= nL; j++) { var a = -1 + 2 * j / nL; o += ln(cx + a * w0, y0, cx + a * w1, y1, col, sw); }
  return o;
}
function B_circ(x, y, R) { return 'M' + (x - R) + ' ' + y + ' a' + R + ' ' + R + ' 0 1 0 ' + 2 * R + ' 0 a' + R + ' ' + R + ' 0 1 0 ' + (-2 * R) + ' 0 Z'; }
function B_cres(cx, cy, R, k, col, op) { return d(B_circ(cx, cy, R) + ' ' + B_circ(cx + k * R, cy + k * R, R * 0.97), col, 'fill-rule="evenodd" opacity="' + op + '"'); }
function B_cball(cx, cy, R, a, b) { var s = R / 2.2; var inner = r(cx - R, cy - R, 2 * R, 2 * R, b); for (var i = -4; i < 4; i++) for (var j = -4; j < 4; j++) if ((i + j + 8) % 2 === 0) inner += r(cx + i * s, cy + j * s, s, s, a); return B_clip(c(cx, cy, R, '#fff'), g('rotate(-28 ' + cx + ' ' + cy + ')', inner) + B_cres(cx, cy, R, -0.2, '#000', 0.4) + e(cx - R * 0.38, cy - R * 0.42, R * 0.32, R * 0.2, '#fff', 'opacity=".35" transform="rotate(-35 ' + (cx - R * 0.38) + ' ' + (cy - R * 0.42) + ')"')) + c(cx, cy, R, 'none', 'stroke="' + a + '" stroke-width="' + (R * 0.06).toFixed(0) + '"'); }
G['slope-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#000');
    var R = rnd(5); o += rep(26, function (i) { return c(R() * 400, R() * 90, 3, '#fff', 'opacity=".5"'); });
    o += B_neonRoad(200, 80, 44, 420, 330, 9, 6, '#39ff14', 6, '#062a0a');
    o += r(176, 96, 48, 20, '#ff2a2a') + r(176, 96, 48, 6, '#ff8080');
    o += e(200, 362, 110, 20, '#39ff14', 'opacity=".25"');
    o += B_cball(200, 250, 112, '#39ff14', '#0a2a0c');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#000');
    o += rep(40, function (i) { return c((i * 173) % 960, (i * 97) % 200, 3, '#fff', 'opacity=".5"'); });
    o += B_neonRoad(480, 200, 80, 640, 520, 12, 8, '#39ff14', 6, '#062a0a');
    o += rep(6, function (i) { var x = 80 + i * 40; return ln(x, 200 + i * 8, x - 60, 600, '#39ff14', 4, 'opacity=".5"') + ln(960 - x, 200 + i * 8, 1020 - x, 600, '#39ff14', 4, 'opacity=".5"'); });
    o += r(330, 300, 90, 50, '#ff2a2a') + r(330, 300, 90, 12, '#ff8080') + r(600, 380, 120, 70, '#ff2a2a') + r(600, 380, 120, 16, '#ff8080') + r(452, 240, 60, 30, '#ff2a2a');
    o += B_cball(470, 470, 70, '#39ff14', '#0a2a0c');
    return o;
  }
};

function B_tunnel(cx, cy, vx, vy, R0, n, rings, q, tw) {
  var o = '', cols = ['#ff3b5c', '#ffd23f', '#3ad1ff', '#8c4dff', '#2fe07a'];
  for (var k = 0; k < rings; k++) {
    var f0 = k / rings, f1 = (k + 1) / rings, R1 = R0 * Math.pow(q, k), R2 = R0 * Math.pow(q, k + 1);
    var c1 = [cx + (vx - cx) * f0, cy + (vy - cy) * f0], c2 = [cx + (vx - cx) * f1, cy + (vy - cy) * f1];
    for (var s = 0; s < n; s++) {
      var a0 = (s * 360 / n + k * tw) * Math.PI / 180, a1 = ((s + 1) * 360 / n + k * tw) * Math.PI / 180, b0 = (s * 360 / n + (k + 1) * tw) * Math.PI / 180, b1 = ((s + 1) * 360 / n + (k + 1) * tw) * Math.PI / 180;
      var col = k % 3 === 2 ? cols[(s + k) % 5] : ((s + k) % 2 ? '#111' : '#f4f4f4');
      o += p([[c1[0] + R1 * Math.cos(a0), c1[1] + R1 * Math.sin(a0)], [c1[0] + R1 * Math.cos(a1), c1[1] + R1 * Math.sin(a1)], [c2[0] + R2 * Math.cos(b1), c2[1] + R2 * Math.sin(b1)], [c2[0] + R2 * Math.cos(b0), c2[1] + R2 * Math.sin(b0)]].map(function (z) { return [+z[0].toFixed(1), +z[1].toFixed(1)]; }), col, 'stroke="' + col + '" stroke-width="1"');
    }
  }
  var Rn = R0 * Math.pow(q, rings);
  return o + c(vx, vy, Rn * 1.05, '#000') + c(vx, vy, Rn * 0.6, '#fff', 'opacity=".9"');
}
G['tunnel-run'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#111');
    o += B_tunnel(200, 200, 232, 176, 330, 12, 11, 0.74, 7);
    o += g('translate(200,200)', p([[-30, -150], [30, -150], [22, 40], [-22, 40]], '#000', 'opacity="0"'));
    return o;
  },
  bg: function () { return r(0, 0, 960, 600, '#111') + B_tunnel(480, 300, 540, 260, 760, 14, 13, 0.76, 6); }
};

G['paper-land'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#ffe25a', '#ffb31a']));
    var P = B_iso(158, 132, 44);
    o += p([P(-0.6, -0.6, 0), P(5.4, -0.6, 0), P(5.4, 5.4, 0), P(-0.6, 5.4, 0)], '#e89a00', 'opacity=".3"');
    o += B_box(P, 0, 0, 2.8, 2.8, 0.7, '#6fd8ff', '#2fa8e6', '#1a86c8');
    o += B_box(P, 2.8, 1.1, 2.2, 0.7, 0.22, '#b6ecff', '#7fcff5', '#5ab6e6');
    o += B_box(P, 4.8, 0.9, 1.1, 1.1, 1.1, '#3b8dff', '#1f63d8', '#1450b0');
    var a = P(5.9, 1.25, 0.75), b = P(5.9, 1.75, 0.75);
    o += c(a[0], a[1], 9, '#fff') + c(b[0], b[1], 9, '#fff') + c(a[0] + 2, a[1] + 1, 4.5, '#111') + c(b[0] + 2, b[1] + 1, 4.5, '#111');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#f2f0ea');
    o += rep(25, function (i) { return ln(i * 40, 0, i * 40, 600, '#e2dfd6', 3) + ln(0, i * 40, 960, i * 40, '#e2dfd6', 3); });
    function T(pts, top, side) { return p(pts.map(function (z) { return [z[0], z[1] + 16]; }), side) + p(pts, top); }
    o += T([[40, 60], [300, 40], [340, 200], [220, 260], [60, 230]], '#4fc3ff', '#1f8fd0');
    o += T([[600, 40], [900, 70], [920, 260], [700, 240], [640, 160]], '#ff5a6e', '#c42a40');
    o += T([[80, 380], [320, 340], [360, 560], [100, 580]], '#5ad86a', '#2a9a3a');
    o += T([[560, 360], [860, 330], [900, 520], [620, 560]], '#b07aff', '#7a40d0');
    o += sk('M340 200 L440 200 L440 320 L520 320', '#4fc3ff', 24, 'opacity=".6"') + r(500, 300, 40, 40, '#1f63d8', 6);
    o += sk('M700 240 L640 300 L520 300', '#ff5a6e', 24, 'opacity=".55"');
    return o;
  }
};

function B_cell(x, y, R, col, dk) { return c(x, y, R, dk) + c(x, y, R - Math.max(6, R * 0.08), col); }
G['cell-feast'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#f6f8fb') + rep(11, function (i) { return ln(i * 40, 0, i * 40, 400, '#dde3ea', 4) + ln(0, i * 40, 400, i * 40, '#dde3ea', 4); });
    o += c(60, 340, 12, '#ffd23f') + c(330, 70, 12, '#7c4dff') + c(360, 200, 11, '#2fe07a') + c(90, 50, 11, '#ff5fa8') + c(240, 370, 11, '#3ad1ff');
    o += B_cell(176, 180, 140, '#2f7fe0', '#1d5fb8');
    o += B_cell(320, 318, 44, '#ff3b3b', '#c41f1f');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#f6f8fb') + rep(25, function (i) { return ln(i * 40, 0, i * 40, 600, '#dde3ea', 3) + ln(0, i * 40, 960, i * 40, '#dde3ea', 3); });
    var R = rnd(11), cs = [['#ff3b3b', '#c41f1f'], ['#2fe07a', '#18a854'], ['#ffd23f', '#d9a800'], ['#7c4dff', '#5a2ad0'], ['#ff8a1f', '#d06200'], ['#3ad1ff', '#16a0d0']];
    o += rep(90, function (i) { return c(R() * 960, R() * 600, 8, cs[i % 6][0]); });
    o += B_cell(200, 200, 150, '#2f7fe0', '#1d5fb8') + B_cell(700, 380, 110, cs[0][0], cs[0][1]) + B_cell(480, 520, 60, cs[1][0], cs[1][1]) + B_cell(840, 120, 70, cs[2][0], cs[2][1]) + B_cell(420, 300, 36, cs[3][0], cs[3][1]) + B_cell(560, 120, 44, cs[4][0], cs[4][1]) + B_cell(120, 500, 50, cs[5][0], cs[5][1]);
    return o;
  }
};

function B_city(w, h, bs, rw, seed) {
  var R = rnd(seed), o = r(0, 0, w, h, '#3a3f4b'), cols = ['#ff6f61', '#ffd166', '#6fc3ff', '#9be15d', '#c9a6ff', '#f4f4f4', '#ffa94d'];
  for (var i = 0; i * bs < w + bs; i++) for (var j = 0; j * bs < h + bs; j++) {
    var x = i * bs + rw / 2, y = j * bs + rw / 2, s = bs - rw;
    o += r(x, y, s, s, '#c9ccd3', 10) + r(x + 12, y + 12, s - 24, s - 24, '#7fc85a', 6);
    if (R() < 0.7) { var bw = s * 0.5, cl = cols[Math.floor(R() * cols.length)]; o += r(x + 24, y + 24 + 14, bw, bw, '#000', 4, 'opacity=".25"') + r(x + 30, y + 24, bw, bw, cl, 4) + r(x + 30 + bw * 0.2, y + 24 + bw * 0.2, bw * 0.6, bw * 0.6, '#fff', 3, 'opacity=".3"'); }
    o += c(x + s - 34, y + s - 34, 18, '#3e9b3a') + c(x + s - 38, y + s - 38, 10, '#5fc04a');
    o += rep(3, function (k) { return r(x - rw / 2 + rw / 2 - 4, y + k * s / 3 + 10, 8, s / 6, '#f4f4f4', 2, 'opacity=".7"'); });
  }
  return o;
}
function B_cartop(x, y, ang, col, s) { return g('translate(' + x + ',' + y + ') rotate(' + ang + ') scale(' + (s || 1) + ')', r(-24, -42, 48, 84, col, 12) + r(-18, -18, 36, 30, '#2a3550', 6) + r(-16, 18, 32, 14, '#2a3550', 4)); }
G['hole-city'] = {
  icon: function () {
    var o = B_city(400, 400, 200, 70, 3);
    o += B_cartop(40, 330, 0, '#ff6f61') + B_cartop(360, 70, 0, '#ffd166');
    var hole = c(200, 205, 128, '#000');
    o += c(200, 205, 146, '#3d8bff') + c(200, 205, 136, '#1d5fd0') + hole;
    o += B_clip(hole, c(200, 205, 128, rg(['#2a2c3a', '#000'])) + g('translate(196,180) rotate(28)', r(-50, -40, 100, 150, '#ff6f61', 6) + r(-50, -40, 100, 34, '#ffb0a6', 6) + rep(3, function (k) { return r(-36, 10 + k * 30, 22, 16, '#cfe9ff') + r(14, 10 + k * 30, 22, 16, '#cfe9ff'); }) + r(-50, 40, 100, 140, '#000', 0, 'opacity=".45"')) + B_cartop(130, 270, -40, '#9be15d', 1.1) + c(200, 205, 128, rg([['#000', 0], ['#000', 0.6], ['#000', 1]]), 'opacity=".0"'));
    o += c(200, 205, 128, 'none', 'stroke="#000" stroke-width="10" opacity=".5"');
    return o;
  },
  bg: function () {
    var o = B_city(960, 600, 240, 80, 5);
    o += B_cartop(40, 300, 0, '#ff6f61') + B_cartop(520, 40, 90, '#6fc3ff') + B_cartop(760, 280, 0, '#ffd166') + B_cartop(280, 520, 90, '#9be15d');
    o += c(480, 300, 120, '#3d8bff') + c(480, 300, 106, '#000') + c(480, 300, 80, '#14151c');
    return o;
  }
};

function B_pea(sc) {
  var o = sk('M-6 210 C-10 160 10 120 0 70', '#2e8a22', 26);
  o += g('rotate(-30 -40 200)', e(-60, 200, 70, 26, '#3fa52e')) + g('rotate(30 40 200)', e(60, 200, 70, 26, '#4cb83a'));
  o += c(0, 0, 96, '#7fd23a') + d('M-90 30 A96 96 0 0 0 80 50 A110 110 0 0 1 -90 30 Z', '#4ea51f') + e(-34, -50, 34, 20, '#c6f07a', 'opacity=".7" transform="rotate(-30 -34 -50)"');
  o += r(40, -48, 130, 84, '#7fd23a', 30) + e(166, -6, 34, 54, '#8fe04a') + e(170, -6, 22, 38, '#1e5a0e');
  o += e(10, -26, 18, 26, '#111') + c(15, -34, 7, '#fff');
  return g('scale(' + (sc || 1) + ')', o);
}
function B_zomb() { return r(-30, -10, 60, 90, '#6b4a2a', 10) + d('M-8 -10 L8 -10 L4 50 L-4 50 Z', '#c4302a') + r(-26, 80, 20, 60, '#3a3a5a') + r(6, 80, 20, 60, '#3a3a5a') + sk('M-26 10 L-80 20', '#9ab07a', 18) + sk('M26 10 L-60 40', '#9ab07a', 18) + c(0, -50, 40, '#9ab07a') + c(-14, -56, 14, '#fff') + c(-16, -56, 6, '#111') + c(14, -54, 10, '#fff') + r(-16, -28, 30, 8, '#4a3a2a'); }
G['garden-defense'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#8fdcff', '#5fc0f0']));
    o += r(0, 300, 400, 100, '#5cb83a') + rep(4, function (i) { return r(i * 100, 300, 50, 100, '#6ccb46'); });
    o += c(370, 160, 24, '#9be33a', 'stroke="#4ea51f" stroke-width="7"');
    o += g('translate(128,176)', B_pea(1));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#4a9a2c') + r(0, 0, 960, 80, '#2f6b1e') + rep(16, function (i) { return c(i * 64, 80, 40, '#3a8424'); });
    o += r(0, 0, 70, 600, '#c99a5a') + r(0, 0, 70, 600, '#000', 0, 'opacity=".15"');
    for (var i = 0; i < 9; i++) for (var j = 0; j < 5; j++) o += r(70 + i * 100, 90 + j * 102, 100, 102, (i + j) % 2 ? '#5cb83a' : '#6ccb46');
    o += g('translate(150,170)', B_pea(0.36)) + g('translate(150,380)', B_pea(0.36)) + g('translate(250,270)', B_pea(0.36));
    [[150, 270], [250, 480], [250, 170]].forEach(function (q) { o += g('translate(' + q[0] + ',' + q[1] + ')', sk('M0 60 L0 0', '#2e8a22', 10) + rep(12, function (k) { var a = k * 30 * Math.PI / 180; return e(Math.cos(a) * 30, Math.sin(a) * 30 - 10, 16, 10, '#ffd21a', 'transform="rotate(' + (k * 30) + ' ' + (Math.cos(a) * 30) + ' ' + (Math.sin(a) * 30 - 10) + ')"'); }) + c(0, -10, 24, '#b8741a') + c(-8, -14, 4, '#111') + c(8, -14, 4, '#111')); });
    o += c(380, 170, 12, '#9be33a') + c(500, 170, 12, '#9be33a') + c(420, 380, 12, '#9be33a');
    o += g('translate(720,160) scale(.9)', B_zomb()) + g('translate(830,370) scale(.9)', B_zomb()) + g('translate(620,470) scale(.9)', B_zomb());
    o += star(560, 260, 40, 26, 12, '#ffe14d') + c(560, 260, 24, '#fff27a');
    return o;
  }
};

function B_bean(col, dk) {
  var o = e(0, 168, 90, 14, '#000', 'opacity=".2"');
  o += e(-40, 150, 34, 22, dk) + e(40, 150, 34, 22, dk);
  o += g('rotate(25 -88 50)', e(-88, 50, 26, 44, col)) + g('rotate(-25 88 50)', e(88, 50, 26, 44, col));
  o += r(-85, -150, 170, 300, col, 85) + d('M45 -140 A85 85 0 0 1 85 -65 L85 65 A85 85 0 0 1 20 148 C70 100 70 -60 45 -140 Z', dk);
  o += e(0, -62, 62, 50, '#fff') + e(-22, -64, 10, 16, '#1d1640') + e(22, -64, 10, 16, '#1d1640') + c(-19, -70, 3.5, '#fff') + c(25, -70, 3.5, '#fff') + sk('M-14 -36 Q0 -26 14 -36', '#1d1640', 6);
  return o;
}
G['bean-royale'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#62d2ff', '#7a5cff']));
    o += rep(8, function (i) { var a = i * 45; return p([[200, 200], [200 + 400 * Math.cos(a * Math.PI / 180), 200 + 400 * Math.sin(a * Math.PI / 180)], [200 + 400 * Math.cos((a + 20) * Math.PI / 180), 200 + 400 * Math.sin((a + 20) * Math.PI / 180)]], '#fff', 'opacity=".09"'); });
    o += c(52, 330, 14, '#ffd23f') + star(340, 90, 26, 12, 5, '#ffd23f') + c(350, 310, 10, '#fff', 'opacity=".7"');
    o += g('translate(200,214) rotate(-6)', B_bean('#ff5fb0', '#e03a8c') + p([[-40, -150], [-40, -190], [-20, -170], [0, -200], [20, -170], [40, -190], [40, -150]], '#ffd23f', 'stroke="#e0a000" stroke-width="5" stroke-linejoin="round"'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#7fd8ff', '#c9b8ff']));
    o += e(180, 110, 90, 34, '#fff') + e(760, 80, 110, 36, '#fff');
    o += r(-20, 420, 1000, 200, '#ff8fc8') + r(-20, 420, 1000, 30, '#ffb8de');
    o += r(80, 300, 300, 50, '#ffd23f', 20) + r(80, 330, 300, 20, '#e0a000', 10) + r(560, 250, 320, 50, '#4fc3ff', 20) + r(560, 280, 320, 20, '#1f8fd0', 10);
    o += rep(6, function (i) { return r(440 + i * 0, 120, 30, 300, i % 2 ? '#fff' : '#ff4fa3'); }).slice(0, 0) + r(450, 150, 40, 280, '#ff4fa3') + rep(5, function (i) { return r(450, 170 + i * 56, 40, 24, '#fff'); });
    o += g('rotate(-14 470 160)', r(260, 146, 420, 28, '#7a5cff', 14));
    [[160, 250, '#ff5fb0', '#e03a8c'], [300, 250, '#5fd86a', '#2fa83a'], [640, 200, '#ffd23f', '#e0a000'], [780, 200, '#ff8a1f', '#d06200'], [380, 400, '#4fc3ff', '#1f8fd0'], [700, 410, '#b07aff', '#7a40d0']].forEach(function (q) { o += g('translate(' + q[0] + ',' + q[1] + ') scale(.34)', B_bean(q[2], q[3])); });
    return o;
  }
};

function B_baller(col, dk, armA) { return r(-26, 38, 18, 86, '#e8b48a', 8) + r(8, 38, 18, 86, '#e8b48a', 8) + r(-30, 116, 26, 14, '#1d1b26', 5) + r(6, 116, 26, 14, '#1d1b26', 5) + r(-30, -60, 60, 80, col, 10) + r(-30, 10, 60, 36, dk, 8) + r(-30, -60, 60, 14, '#fff', 6, 'opacity=".25"') + sk('M18 -48 ' + armA, '#e8b48a', 18) + sk('M-18 -48 L-46 10', '#e8b48a', 18) + c(0, -92, 32, '#e8b48a') + d('M-32 -96 C-32 -132 32 -132 32 -96 C20 -112 -20 -112 -32 -96 Z', '#3a2414') + c(12, -94, 5, '#1d1b26'); }
function B_hoop(flip) { return g(flip ? 'scale(-1,1)' : '', r(-14, -30, 18, 400, '#9aa1b2') + r(0, -80, 16, 130, '#fff', 4, 'stroke="#1d1b26" stroke-width="6"') + d('M20 32 L110 32 L96 110 L34 110 Z', 'none', 'stroke="#fff" stroke-width="7" stroke-linejoin="round"') + ln(42, 32, 54, 110, '#fff', 6) + ln(88, 32, 76, 110, '#fff', 6) + ln(30, 70, 102, 70, '#fff', 6) + r(16, 24, 100, 14, '#f04848', 6)); }
function B_ball(x, y, R) { return c(x, y, R, '#ff8a1f') + d('M' + (x - R) + ' ' + y + ' L' + (x + R) + ' ' + y + ' M' + x + ' ' + (y - R) + ' L' + x + ' ' + (y + R), 'none', 'stroke="#7a3a00" stroke-width="' + (R * 0.14).toFixed(0) + '"') + d('M' + (x - R * 0.7) + ' ' + (y - R * 0.7) + ' Q' + (x - R * 0.2) + ' ' + y + ' ' + (x - R * 0.7) + ' ' + (y + R * 0.7) + ' M' + (x + R * 0.7) + ' ' + (y - R * 0.7) + ' Q' + (x + R * 0.2) + ' ' + y + ' ' + (x + R * 0.7) + ' ' + (y + R * 0.7), 'none', 'stroke="#7a3a00" stroke-width="' + (R * 0.12).toFixed(0) + '"') + c(x, y, R, 'none', 'stroke="#7a3a00" stroke-width="' + (R * 0.12).toFixed(0) + '"'); }
G['hoop-flop'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#4f8df7', '#2a5fd0']));
    o += r(0, 320, 400, 80, '#d99a5b') + rep(5, function (i) { return r(i * 90 + 30, 320, 6, 80, '#b97a3e'); }) + r(0, 320, 400, 10, '#f0b878');
    o += g('translate(30,90)', B_hoop(false));
    o += g('translate(250,214) rotate(-14) scale(1.25)', B_baller('#f04848', '#b82a2a', 'L-40 -150'));
    o += B_ball(130, 70, 38);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#3b7cf4') + r(0, 0, 960, 250, '#2a2f48');
    var R = rnd(9);
    o += rep(80, function (i) { return c((i * 53) % 960, 60 + (i * 31) % 170, 14, ['#f04848', '#ffd23f', '#fff', '#2fbf71'][i % 4], 'opacity=".6"'); });
    o += r(0, 470, 960, 130, '#d99a5b') + rep(10, function (i) { return r(i * 100, 470, 6, 130, '#b97a3e'); }) + r(0, 470, 960, 12, '#f0b878');
    o += g('translate(30,260)', B_hoop(false)) + g('translate(930,260)', B_hoop(true));
    o += g('translate(300,350) rotate(-10)', B_baller('#f04848', '#b82a2a', 'L50 -140')) + g('translate(420,360) rotate(12)', B_baller('#f04848', '#b82a2a', 'L-30 -130'));
    o += g('translate(580,350) rotate(8) scale(-1,1)', B_baller('#3b7cf4', '#1f4fb0', 'L40 -140')) + g('translate(700,360) rotate(-12) scale(-1,1)', B_baller('#3b7cf4', '#1f4fb0', 'L-30 -120'));
    o += B_ball(500, 180, 30);
    return o;
  }
};

function B_tank(col, dk) { return r(-64, -70, 34, 140, '#3b3b3b', 10) + r(30, -70, 34, 140, '#3b3b3b', 10) + rep(6, function (i) { return r(-60, -62 + i * 23, 26, 8, '#5a5a5a') + r(34, -62 + i * 23, 26, 8, '#5a5a5a'); }) + r(-40, -60, 80, 120, col, 12) + r(-40, 36, 80, 24, dk, 10) + r(-12, -124, 24, 100, dk, 6) + r(-16, -130, 32, 18, dk, 5) + c(0, 0, 34, dk) + c(0, 0, 22, col) + c(-8, -8, 7, '#fff', 'opacity=".35"'); }
function B_maze(w, h, cs, seed, col, sw) { var R = rnd(seed), o = ''; for (var i = 0; i * cs <= w; i++) for (var j = 0; j * cs <= h; j++) { var x = i * cs, y = j * cs, q = R(); if (q < 0.4) o += ln(x, y, x + cs, y, col, sw); else if (q < 0.75) o += ln(x, y, x, y + cs, col, sw); } return o; }
G['maze-tanks'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#ececec') + rep(5, function (i) { return ln(i * 100, 0, i * 100, 400, '#dcdcdc', 4) + ln(0, i * 100, 400, i * 100, '#dcdcdc', 4); });
    o += r(10, 10, 380, 380, 'none', 0, 'stroke="#4d4d4d" stroke-width="16" rx="6"');
    o += ln(10, 100, 120, 100, '#4d4d4d', 16) + ln(300, 10, 300, 110, '#4d4d4d', 16) + ln(290, 300, 390, 300, '#4d4d4d', 16) + ln(100, 290, 100, 390, '#4d4d4d', 16);
    o += c(310, 196, 10, '#222') + c(340, 150, 10, '#222') + c(70, 230, 10, '#222');
    o += g('translate(196,212) rotate(28) scale(1.32)', B_tank('#66bb52', '#3f8a30'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#ececec') + B_maze(960, 600, 120, 4, '#4d4d4d', 18);
    o += g('translate(200,180) rotate(40) scale(.6)', B_tank('#66bb52', '#3f8a30')) + g('translate(700,420) rotate(-130) scale(.6)', B_tank('#e5553f', '#a8301e')) + g('translate(780,140) rotate(200) scale(.6)', B_tank('#3d8bff', '#1f5fc0'));
    o += c(300, 260, 9, '#222') + c(420, 330, 9, '#222') + c(600, 360, 9, '#222') + c(640, 220, 9, '#222');
    return o;
  }
};

function B_card(col, lbl) { return r(-80, -118, 160, 236, '#000', 18, 'opacity=".25" transform="translate(6,8)"') + r(-80, -118, 160, 236, '#fff', 18) + r(-68, -106, 136, 212, col, 12) + e(0, 0, 54, 92, '#fff', 'transform="rotate(30)"') + t(4, 36, lbl, 104, col, { font: 'Luckiest Guy', st: '#111', sw: 8 }) + t(-46, -66, lbl, 36, '#fff', { font: 'Luckiest Guy', st: '#111', sw: 5 }); }
G['last-card'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg(['#ff4b3a', '#c4001a'], 0.5, 0.4, 0.75));
    var cards = [['#1f6fe0', '5', -36], ['#2fae4a', '2', -12], ['#ffc21a', '9', 12], ['#e8231e', '7', 36]];
    cards.forEach(function (q) { o += g('translate(200,560) rotate(' + q[2] + ') translate(0,-300)', B_card(q[0], q[1])); });
    o += g('rotate(-10 200 104)', e(200, 104, 168, 78, '#111') + e(200, 104, 156, 66, '#e8231e') + t(200, 138, 'UNO', 104, '#ffd21a', { font: 'Luckiest Guy', st: '#111', sw: 10, ls: 2 }));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, rg(['#e8231e', '#5a0010'], 0.5, 0.5, 0.8));
    var cs = ['#1f6fe0', '#2fae4a', '#ffc21a', '#e8231e'];
    [[150, 160, -20], [300, 420, 15], [700, 150, 25], [820, 430, -10], [480, 300, 5], [560, 320, 30], [120, 470, 40]].forEach(function (q, i) { o += g('translate(' + q[0] + ',' + q[1] + ') rotate(' + q[2] + ') scale(.8)', B_card(cs[i % 4], '' + ((i * 3 + 2) % 10))); });
    o += g('translate(860,250) rotate(-5) scale(.8)', r(-80, -118, 160, 236, '#fff', 18) + r(-68, -106, 136, 212, '#111', 12) + e(0, 0, 54, 92, '#e8231e', 'transform="rotate(30)"'));
    return o;
  }
};

function B_moto() {
  var o = '';
  [[-92, 46], [92, 46]].forEach(function (w) { o += c(w[0], w[1], 54, '#1b1b1b') + c(w[0], w[1], 38, '#3a3a3a') + c(w[0], w[1], 24, '#c9ced8') + c(w[0], w[1], 9, '#555'); });
  o += sk('M-92 46 L-10 10', '#555', 14) + sk('M92 46 L60 -44', '#c9ced8', 14);
  o += p([[-56, -16], [40, -40], [70, -30], [30, 18], [-20, 22]], '#ff5a1f') + p([[-70, -30], [-6, -30], [-6, -16], [-60, -12]], '#1d1b26') + d('M50 -30 C80 -50 120 -36 130 -12 L96 -20 Z', '#ff5a1f') + p([[-110, -14], [-56, -24], [-58, -10]], '#ff5a1f') + r(-24, -4, 40, 28, '#3a3a3a', 6);
  o += sk('M-30 -46 L14 -14 L0 26', '#22356a', 24) + sk('M-30 -46 L8 -104', '#ff8a1f', 36) + sk('M8 -96 L58 -54', '#ff8a1f', 16) + c(64, -52, 10, '#1d1b26');
  o += c(20, -132, 32, '#fff') + d('M-12 -136 A32 32 0 0 1 52 -136 Z', '#e8231e') + d('M24 -132 L54 -132 C54 -116 46 -110 36 -110 L24 -110 Z', '#1d1b26') + r(0, 18, 18, 14, '#1d1b26', 4);
  return o;
}
G['moto-stunts'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3fb8ff', '#bfeaff']));
    o += r(0, 300, 400, 40, '#2a9ad8') + r(0, 330, 400, 70, '#f5d48a') + r(0, 330, 400, 10, '#ffe7b0');
    o += sk('M40 330 C48 260 60 220 80 190', '#8a5a2a', 18) + rep(5, function (k) { var a = -180 + k * 36; return g('rotate(' + a + ' 80 190)', e(130, 190, 52, 16, '#2fae4a')); });
    o += g('translate(212,232) rotate(-24) scale(1.12)', B_moto());
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#3fb8ff', '#d6f2ff']));
    o += c(800, 110, 60, '#fff3a0') + r(0, 330, 960, 80, '#2a9ad8') + r(0, 330, 960, 14, '#7fd4ff') + r(0, 400, 960, 200, '#f5d48a');
    [[90, 400], [880, 410], [600, 400]].forEach(function (q) { o += sk('M' + q[0] + ' ' + q[1] + ' C' + (q[0] - 10) + ' ' + (q[1] - 100) + ' ' + (q[0] + 10) + ' ' + (q[1] - 180) + ' ' + (q[0] + 30) + ' ' + (q[1] - 230), '#8a5a2a', 20) + rep(6, function (k) { return g('rotate(' + (-180 + k * 36) + ' ' + (q[0] + 30) + ' ' + (q[1] - 230) + ')', e(q[0] + 100, q[1] - 230, 74, 20, '#2fae4a')); }); });
    o += p([[200, 520], [460, 520], [460, 400]], '#a8743a') + rep(5, function (k) { return ln(220 + k * 50, 520, 220 + k * 50, 520 - (k + 0.4) * 22, '#7a4a1a', 8); }) + r(0, 520, 960, 20, '#7a4a1a') + r(640, 470, 200, 50, '#a8743a') + r(640, 470, 200, 12, '#c98e4f');
    o += g('translate(560,360) rotate(-30) scale(.6)', B_moto());
    return o;
  }
};

function B_cookie(cx, cy, R) { var o = c(cx, cy, R, '#b0702c') + c(cx, cy, R * 0.92, '#d9a05a') + e(cx - R * 0.3, cy - R * 0.35, R * 0.35, R * 0.22, '#e8b878', 'opacity=".8"'); [[-0.45, -0.1], [0.1, -0.5], [0.45, -0.15], [-0.15, 0.25], [0.35, 0.45], [-0.5, 0.45], [0.05, 0.75], [0.7, 0.2], [-0.72, 0.1]].forEach(function (q, i) { var x = cx + q[0] * R, y = cy + q[1] * R, s = R * (0.12 + (i % 3) * 0.02); o += p([[x - s, y - s * 0.4], [x - s * 0.2, y - s], [x + s, y - s * 0.6], [x + s * 0.8, y + s * 0.7], [x - s * 0.5, y + s * 0.9]], '#4a2810') + c(x - s * 0.3, y - s * 0.4, s * 0.25, '#7a4a28'); }); return o; }
function B_cursor(x, y, ang, s) { return g('translate(' + x + ',' + y + ') rotate(' + ang + ') scale(' + s + ')', p([[0, 0], [0, 46], [11, 36], [20, 56], [28, 52], [19, 33], [34, 33]], '#fff', 'stroke="#111" stroke-width="5" stroke-linejoin="round"')); }
G['cookie-baker'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, rg(['#6fd0ff', '#1d5fc8'], 0.5, 0.5, 0.7));
    o += rep(12, function (i) { var a = i * 30 * Math.PI / 180, b = (i * 30 + 13) * Math.PI / 180; return p([[200, 200], [200 + 400 * Math.cos(a), 200 + 400 * Math.sin(a)], [200 + 400 * Math.cos(b), 200 + 400 * Math.sin(b)]], '#fff', 'opacity=".1"'); });
    o += c(206, 212, 150, '#000', 'opacity=".18"') + B_cookie(200, 200, 148);
    o += B_cursor(318, 300, -40, 1.3) + B_cursor(60, 70, -20, 1.1);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, rg(['#4fb0ff', '#0e2e70'], 0.35, 0.5, 0.8));
    o += rep(16, function (i) { var a = i * 22.5 * Math.PI / 180, b = (i * 22.5 + 10) * Math.PI / 180; return p([[330, 300], [330 + 900 * Math.cos(a), 300 + 900 * Math.sin(a)], [330 + 900 * Math.cos(b), 300 + 900 * Math.sin(b)]], '#fff', 'opacity=".08"'); });
    o += B_cookie(330, 300, 190) + rep(10, function (k) { var a = k * 36 * Math.PI / 180; return B_cursor(330 + 240 * Math.cos(a), 300 + 240 * Math.sin(a), k * 36 + 90 + 150, 0.9); });
    o += r(660, 0, 300, 600, '#7a4a28') + rep(5, function (k) { return r(672, 20 + k * 116, 276, 100, '#a8743a', 8) + r(690, 40 + k * 116, 60, 60, ['#ffd23f', '#9be15d', '#ff8a5a', '#6fc3ff', '#c9a6ff'][k], 8); });
    o += B_cookie(560, 80, 30) + B_cookie(120, 540, 36) + B_cookie(600, 520, 26);
    return o;
  }
};

function B_blox(P, tiles, hole, bu, bv) {
  var o = '';
  tiles.forEach(function (q) { if (hole && q[0] === hole[0] && q[1] === hole[1]) return; o += B_box(P, q[0] + 0.04, q[1] + 0.04, 0.92, 0.92, 0.22, '#cfd6e2', '#8f99aa', '#6f7a8c', -0.22) + p([P(q[0] + 0.2, q[1] + 0.2, 0), P(q[0] + 0.8, q[1] + 0.2, 0), P(q[0] + 0.8, q[1] + 0.8, 0), P(q[0] + 0.2, q[1] + 0.8, 0)], '#e2e8f0'); });
  if (hole) o += p([P(hole[0] + 0.1, hole[1] + 0.1, 0), P(hole[0] + 0.9, hole[1] + 0.1, 0), P(hole[0] + 0.9, hole[1] + 0.9, 0), P(hole[0] + 0.1, hole[1] + 0.9, 0)], '#1a0a04');
  return o + B_box(P, bu, bv, 1, 1, 2, '#ffb066', '#b0451f', '#8f3d1f');
}
G['block-roll'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#c9532a', '#6a2410']));
    var P = B_iso(200, 196, 68), T = [];
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (!(i === 3 && j === 0) && !(i === 0 && j === 3)) T.push([i - 1.5, j - 1.5]);
    o += B_blox(P, T, [1.5 - 1, 1.5 - 2], -0.5, -0.5);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#1a1030', '#3a1a20']));
    o += rep(50, function (i) { return c((i * 137) % 960, (i * 71) % 600, 2.5, '#fff', 'opacity=".6"'); });
    var P = B_iso(480, 150, 70), T = [];
    for (var i = 0; i < 7; i++) for (var j = 0; j < 4; j++) if ((i + j * 2) % 9 !== 4) T.push([i - 1, j]);
    o += B_blox(P, T, [4, 1], 1, 1);
    return o;
  }
};

function B_ship(len) { var L = len / 2, W = len * 0.13; return d('M' + (-L) + ' ' + (-W * 0.8) + ' L' + (L * 0.6) + ' ' + (-W) + ' Q' + L + ' 0 ' + (L * 0.6) + ' ' + W + ' L' + (-L) + ' ' + (W * 0.8) + ' Z', '#9fa7b2', 'stroke="#38404a" stroke-width="6"') + r(-L * 0.55, -W * 0.45, L * 0.9, W * 0.9, '#7c8592', 6) + r(-L * 0.12, -W * 0.5, L * 0.3, W, '#eef1f5', 5) + [-0.4, 0.4].map(function (f) { return c(L * f, 0, W * 0.42, '#5a626e') + r(L * f, -W * 0.1, L * 0.24, W * 0.2, '#38404a'); }).join(''); }
function B_peg(x, y, R, hit) { return c(x, y, R, hit ? '#9a1510' : '#9fa7b2') + c(x, y, R * 0.78, hit ? '#ff5246' : '#fff') + c(x - R * 0.25, y - R * 0.25, R * 0.25, '#fff', 'opacity=".6"'); }
G['sea-battle'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#123a7a', '#0a1f48']));
    o += rep(9, function (i) { return ln(i * 50, 0, i * 50, 400, '#3a7be0', 3, 'opacity=".7"') + ln(0, i * 50, 400, i * 50, '#3a7be0', 3, 'opacity=".7"'); });
    o += g('translate(200,200) rotate(-40)', B_ship(380));
    o += B_peg(140, 260, 28, true) + B_peg(225, 175, 28, true) + B_peg(325, 325, 22, false) + B_peg(75, 75, 22, false) + B_peg(325, 75, 22, false);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#0e2e66') + rep(20, function (i) { return ln(i * 60, 0, i * 60, 600, '#3a7be0', 3, 'opacity=".6"') + ln(0, i * 60, 960, i * 60, '#3a7be0', 3, 'opacity=".6"'); });
    o += g('translate(260,150)', B_ship(360)) + g('translate(700,330) rotate(90)', B_ship(300)) + g('translate(320,450)', B_ship(240));
    o += B_peg(200, 150, 22, true) + B_peg(700, 300, 22, true) + B_peg(520, 120, 16, false) + B_peg(880, 500, 16, false) + B_peg(560, 500, 16, false);
    o += star(340, 150, 50, 22, 9, '#ffd166') + star(340, 150, 26, 12, 9, '#ff5246');
    return o;
  }
};

G['snake'] = {
  icon: function () {
    var o = rep(64, function (i) { var x = i % 8, y = Math.floor(i / 8); return r(x * 50, y * 50, 50, 50, (x + y) % 2 ? '#a2d149' : '#aad751'); });
    o += sk('M25 325 L175 325 L175 175 L275 175 L275 100', '#1a4fbf', 58, 'transform="translate(0,6)"') + sk('M25 325 L175 325 L175 175 L275 175 L275 100', '#4e7cf6', 58);
    o += g('translate(275,92)', e(-15, -6, 13, 15, '#fff') + e(15, -6, 13, 15, '#fff') + c(-13, -10, 7, '#1f2a44') + c(17, -10, 7, '#1f2a44'));
    o += g('translate(290,295)', shade(56, 14, 0, 64, 0.2) + c(-22, 8, 48, '#e7471d') + c(22, 8, 48, '#e7471d') + e(0, 20, 60, 44, '#e7471d') + e(-24, -8, 14, 20, '#f38a6c') + r(-5, -58, 10, 30, '#6b3f1f', 4) + d('M4 -44 C24 -72 56 -64 60 -56 C44 -38 18 -36 4 -44 Z', '#5ba62f'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#578a34') + r(0, 0, 960, 70, '#4a752c');
    o += g('translate(70,35)', c(0, 0, 18, '#e7471d') + r(-3, -26, 6, 12, '#6b3f1f')) + t(130, 50, '12', 40, '#fff', { a: 'start' }) + g('translate(260,35)', star(0, 0, 20, 9, 5, '#ffc107')) + t(300, 50, '24', 40, '#fff', { a: 'start' });
    o += rep(17 * 10, function (i) { var x = i % 17, y = Math.floor(i / 17); return r(30 + x * 53.5, 80 + y * 50, 54, 51, (x + y) % 2 ? '#a2d149' : '#aad751'); });
    o += sk('M110 505 L430 505 L430 305 L700 305 L700 155', '#1a4fbf', 46, 'transform="translate(0,6)"') + sk('M110 505 L430 505 L430 305 L700 305 L700 155', '#4e7cf6', 46);
    o += g('translate(700,150)', e(-12, -4, 10, 12, '#fff') + e(12, -4, 10, 12, '#fff') + c(-11, -7, 5, '#1f2a44') + c(13, -7, 5, '#1f2a44'));
    o += g('translate(700,80) translate(0,20)', '') + g('translate(240,205)', c(-16, 4, 30, '#e7471d') + c(16, 4, 30, '#e7471d') + r(-3, -38, 6, 18, '#6b3f1f') + e(14, -32, 16, 8, '#5ba62f'));
    o += g('translate(820,430)', c(-16, 4, 30, '#e7471d') + c(16, 4, 30, '#e7471d') + r(-3, -38, 6, 18, '#6b3f1f') + e(14, -32, 16, 8, '#5ba62f'));
    return o;
  }
};

function B_rear(x, y, s, col) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(0, 34, 70, 10, '#000', 'opacity=".3"') + r(-60, -30, 120, 60, col, 12) + r(-44, -62, 88, 40, col, 16) + r(-36, -56, 72, 28, '#2a3550', 8) + r(-54, -16, 28, 12, '#ff3030', 4) + r(26, -16, 28, 12, '#ff3030', 4) + r(-20, 6, 40, 14, '#fff', 3) + r(-58, 26, 26, 14, '#111', 4) + r(32, 26, 26, 14, '#111', 4)); }
function B_cartopBig(col, dk) { return r(-80, -150, 160, 300, '#000', 50, 'opacity=".25" transform="translate(10,12)"') + r(-80, -150, 160, 300, col, 50) + r(40, -140, 34, 280, dk, 20) + r(-62, -60, 124, 50, '#22304d', 12) + r(-58, -10, 116, 90, col, 14) + r(-58, -10, 116, 90, '#fff', 14, 'opacity=".18"') + r(-56, 84, 112, 34, '#22304d', 10) + r(-66, -146, 38, 18, '#fff6c0', 8) + r(28, -146, 38, 18, '#fff6c0', 8) + r(-66, 132, 34, 14, '#ff3030', 6) + r(32, 132, 34, 14, '#ff3030', 6) + r(-96, -56, 18, 26, col, 6) + r(78, -56, 18, 26, col, 6) + r(-12, -150, 24, 84, dk, 6); }
G['highway-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#4a4e58') + r(0, 0, 20, 400, '#3fa040') + r(380, 0, 20, 400, '#3fa040') + r(20, 0, 10, 400, '#fff') + r(370, 0, 10, 400, '#fff');
    o += rep(4, function (i) { return r(110, i * 110 - 30, 12, 60, '#fff') + r(278, i * 110 + 20, 12, 60, '#fff'); });
    o += rep(5, function (i) { return r(40 + i * 70, 320 + (i % 2) * 30, 6, 70, '#fff', 3, 'opacity=".25"'); });
    o += g('translate(68,96)', r(-36, -130, 72, 170, '#e9edf2', 8) + r(-36, -130, 72, 170, '#000', 8, 'opacity=".08"') + r(-32, 46, 64, 62, '#c4201b', 12) + r(-26, 76, 52, 22, '#22304d', 6));
    o += g('translate(334,320) scale(.42)', B_cartopBig('#3d8bff', '#1f5fc0'));
    o += g('translate(200,214)', B_cartopBig('#ffd21a', '#e0a800'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#7cc8ff', '#d8f0ff']));
    o += rep(12, function (i) { var h = 60 + (i * 47) % 90; return r(i * 84, 230 - h, 70, h + 10, '#9ab4d0'); });
    o += r(0, 230, 960, 370, '#5fb04a') + p([[440, 230], [520, 230], [1000, 600], [-40, 600]], '#4a4e58') + p([[436, 230], [444, 230], [-20, 600], [-60, 600]], '#fff') + p([[516, 230], [524, 230], [1020, 600], [980, 600]], '#fff');
    o += rep(7, function (k) { var f0 = Math.pow(k / 7, 1.7), f1 = Math.pow((k + 0.45) / 7, 1.7), y0 = 230 + 370 * f0, y1 = 230 + 370 * f1; return [-1, 0, 1].map(function (L) { var x0 = 480 + L * (13 + 160 * f0 * 2.6), x1 = 480 + L * (13 + 160 * f1 * 2.6), w0 = 2 + f0 * 10, w1 = 2 + f1 * 10; return p([[x0 - w0, y0], [x0 + w0, y0], [x1 + w1, y1], [x1 - w1, y1]], '#fff'); }).join(''); });
    o += B_rear(380, 520, 1.3, '#ffd21a') + B_rear(560, 340, 0.6, '#e8322c') + B_rear(450, 280, 0.35, '#3d8bff') + B_rear(700, 420, 0.9, '#f4f4f4');
    o += rep(5, function (i) { var f = Math.pow((i + 1) / 5, 1.6), y = 230 + 330 * f, x = 420 - 480 * f, s = 10 + 50 * f; return c(x - 40, y - s, s, '#2f8a3a') + c(1000 - x, y - s, s, '#2f8a3a'); });
    return o;
  }
};
