function C_mx(h, a) { var n = parseInt(h.slice(1), 16), R = n >> 16, Gg = n >> 8 & 255, B = n & 255, tt = a < 0 ? 0 : 255, k = Math.abs(a); R = Math.round(R + (tt - R) * k); Gg = Math.round(Gg + (tt - Gg) * k); B = Math.round(B + (tt - B) * k); return '#' + ((1 << 24) + (R << 16) + (Gg << 8) + B).toString(16).slice(1); }
function C_clip(shape, inner) { var id = uid('cc'); return '<clipPath id="' + id + '">' + shape + '</clipPath><g clip-path="url(#' + id + ')">' + inner + '</g>'; }
function C_blk(x, y, s, col) { var b = s * 0.17; return r(x, y, s, s, col) + p([[x, y], [x + s, y], [x + s - b, y + b], [x + b, y + b]], C_mx(col, 0.4)) + p([[x, y], [x + b, y + b], [x + b, y + s - b], [x, y + s]], C_mx(col, 0.2)) + p([[x, y + s], [x + b, y + s - b], [x + s - b, y + s - b], [x + s, y + s]], C_mx(col, -0.35)) + p([[x + s, y], [x + s, y + s], [x + s - b, y + s - b], [x + s - b, y + b]], C_mx(col, -0.2)); }
function C_cells(cells, x, y, s, col) { return cells.map(function (q) { return C_blk(x + q[0] * s, y + q[1] * s, s, col); }).join(''); }
var C_TC = { I: '#19c8f0', O: '#ffd400', T: '#a23df0', S: '#3ccf3c', Z: '#f0303a', J: '#2a5cf0', L: '#ff8a00' };

G['tetra'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#1c2266', '#090c2c']));
    o += rep(5, function (i) { return r(i * 80, 0, 80, 400, '#fff', 0, 'opacity="' + (i % 2 ? 0.03 : 0) + '"'); });
    var rows = ['JJ.SS', 'JZZSI', 'LZZOI'];
    rows.forEach(function (row, j) { for (var i = 0; i < 5; i++) if (row[i] !== '.') o += C_blk(i * 80, 160 + j * 80, 80, C_TC[row[i]]); });
    o += C_cells([[1, 0], [2, 0], [3, 0], [2, 1]], 0, 0, 80, C_TC.T);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#1c2266', '#090c2c']));
    var s = 60, x0 = 240;
    o += r(x0 - 12, 0, 504, 600, '#5b6290') + r(x0, 0, 480, 600, '#0b0f36');
    o += rep(8, function (i) { return r(x0 + i * s, 0, 2, 600, '#fff', 0, 'opacity=".06"'); });
    var rows = ['L.....JJ', 'LL..SSJI', 'ZLTSSOJI', 'ZZTTOOJI', 'IZTLLOOI', 'ITTLZZSS'];
    rows.forEach(function (row, j) { for (var i = 0; i < 8; i++) if (row[i] !== '.') o += C_blk(x0 + i * s, 240 + j * s, s, C_TC[row[i]]); });
    o += C_cells([[0, 0], [1, 0], [2, 0], [1, 1]], x0 + 2 * s, 60, s, C_TC.T);
    o += C_cells([[0, 0], [1, 0], [0, 1], [1, 1]], 50, 80, 70, C_TC.O) + C_cells([[0, 0], [0, 1], [0, 2], [0, 3]], 110, 290, 70, C_TC.I);
    o += C_cells([[1, 0], [2, 0], [0, 1], [1, 1]], 760, 70, 60, C_TC.S) + C_cells([[0, 0], [0, 1], [0, 2], [1, 2]], 800, 290, 60, C_TC.L);
    return o;
  }
};

var C_T48 = { 2: ['#eee4da', '#776e65'], 4: ['#ede0c8', '#776e65'], 8: ['#f2b179', '#fff'], 16: ['#f59563', '#fff'], 32: ['#f67c5f', '#fff'], 64: ['#f65e3b', '#fff'], 128: ['#edcf72', '#fff'], 256: ['#edcc61', '#fff'], 512: ['#edc850', '#fff'], 1024: ['#edc53f', '#fff'], 2048: ['#edc22e', '#fff'] };
function C_tile(x, y, s, v, fs) { var q = C_T48[v], L = String(v).length; fs = fs || s * [0, 0.55, 0.5, 0.42, 0.32][L]; return r(x, y, s, s, q[0], s * 0.07) + t(x + s / 2, y + s / 2 + fs * 0.36, v, fs, q[1]); }

G['2048'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#bbada0');
    o += rep(16, function (i) { return r(12 + (i % 4) * 97, 12 + Math.floor(i / 4) * 97, 85, 85, '#cdc1b4', 8); });
    o += r(46, 56, 308, 308, '#000', 22, 'opacity=".15"') + C_tile(46, 46, 308, 2048, 92);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#faf8ef');
    o += r(210, 30, 540, 540, '#bbada0', 24);
    var v = [2, 4, 8, 2, 16, 32, 64, 4, 128, 256, 512, 8, 1024, 2048, 2, 16];
    v.forEach(function (n, i) { o += C_tile(226 + (i % 4) * 131, 46 + Math.floor(i / 4) * 131, 115, n); });
    o += g('translate(60,90) rotate(-12)', C_tile(0, 0, 120, 8)) + g('translate(80,370) rotate(10)', C_tile(0, 0, 110, 64)) + g('translate(800,110) rotate(12)', C_tile(0, 0, 120, 4)) + g('translate(790,380) rotate(-8)', C_tile(0, 0, 120, 512));
    return o;
  }
};

function C_pball(cx, cy, R, col, n, stripe) {
  var cl = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>';
  var inner = stripe ? r(cx - R, cy - R, 2 * R, 2 * R, '#d8d8d8') + c(cx - R * 0.1, cy - R * 0.1, R * 0.96, '#fff') + r(cx - R, cy - R * 0.55, 2 * R, R * 1.1, col) : c(cx, cy, R, C_mx(col, -0.35)) + c(cx - R * 0.1, cy - R * 0.1, R * 0.96, col);
  var o = C_clip(cl, inner);
  if (n !== undefined) o += c(cx, cy, R * 0.5, '#fff') + t(cx, cy + R * 0.21, n, R * 0.6, '#111');
  return o + e(cx - R * 0.42, cy - R * 0.5, R * 0.22, R * 0.13, '#fff', 'opacity=".7" transform="rotate(-35 ' + (cx - R * 0.42) + ' ' + (cy - R * 0.5) + ')"');
}
function C_cue(len, w) { return p([[0, -w * 0.4], [len, -w], [len, w], [0, w * 0.4]], '#f0d39b') + p([[len * 0.62, -w * 0.83], [len, -w], [len, w], [len * 0.62, w * 0.83]], '#5a2a12') + p([[len * 0.6, -w * 0.82], [len * 0.64, -w * 0.84], [len * 0.64, w * 0.84], [len * 0.6, w * 0.82]], '#e8e8e8') + r(-6, -w * 0.4, 10, w * 0.8, '#3a8ee8', 2) + r(4, -w * 0.42, 10, w * 0.84, '#fff'); }

G['pool'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#45c0ff', '#0b56d0'], 0, 0, 1, 1));
    o += C_pball(90, 92, 78, '#ffc81a', 1) + C_pball(318, 88, 78, '#e5232c', 3);
    o += g('translate(110,316) rotate(140)', C_cue(330, 26));
    o += C_pball(212, 222, 128, '#1a1a1a', 8);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#5a2e14') + r(40, 40, 880, 520, '#0c6e36', 20) + r(64, 64, 832, 472, '#139a4c', 6);
    o += rep(7, function (i) { return c(160 + i * 107, 52, 6, '#f3e3b0') + c(160 + i * 107, 548, 6, '#f3e3b0'); });
    [[64, 64], [480, 52], [896, 64], [64, 536], [480, 548], [896, 536]].forEach(function (q) { o += c(q[0], q[1], 34, '#111'); });
    o += ln(300, 64, 300, 536, '#fff', 4, 'opacity=".25"') + c(300, 300, 7, '#fff', 'opacity=".4"');
    var cols = ['#ffc81a', '#1f3fd6', '#e5232c', '#6a2bb8', '#ff7a1a', '#138a3a', '#8a1b1b', '#1a1a1a'], k = 0, R = 30;
    for (var col = 0; col < 5; col++) for (var j = 0; j <= col; j++) { var n = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15][k++]; o += shade(R, R * 0.4, 640 + col * 52 + 4, 300 + (j - col / 2) * 60 + 26) + C_pball(640 + col * 52, 300 + (j - col / 2) * 60, R, n === 8 ? '#1a1a1a' : cols[(n - 1) % 8], n, n > 8); }
    o += C_pball(330, 300, R, '#f4f1e6') + g('translate(290,300) rotate(180)', C_cue(420, 14));
    return o;
  }
};

function C_arcp(cx, cy, rx, ry, a1, a2) { var q = [], n = Math.max(2, Math.ceil(Math.abs(a2 - a1) / 4)); for (var i = 0; i <= n; i++) { var a = (a1 + (a2 - a1) * i / n) * Math.PI / 180; q.push([+(cx + rx * Math.cos(a)).toFixed(1), +(cy + ry * Math.sin(a)).toFixed(1)]); } return q; }
function C_disc(cx, cy, rx, ry, h, segs) {
  var sides = '', tops = '';
  segs.forEach(function (s) {
    var b1 = Math.max(s[0], 0), b2 = Math.min(s[1], 180);
    if (b2 > b1) { var a = C_arcp(cx, cy, rx, ry, b1, b2); sides += p(a.concat(a.slice().reverse().map(function (q) { return [q[0], q[1] + h]; })), C_mx(s[2], -0.3)); }
    tops += p([[cx, cy]].concat(C_arcp(cx, cy, rx, ry, s[0], s[1])), s[2]);
  });
  return sides + tops;
}
function C_helix(cx, ys, rx, ry, h, pw, segsFor, poleCol) {
  var o = '', top = -20;
  for (var i = ys.length - 1; i >= 0; i--) {
    o += C_disc(cx, ys[i], rx, ry, h, segsFor(i));
    var y0 = i ? ys[i - 1] : top;
    o += r(cx - pw / 2, y0, pw, ys[i] - y0, poleCol) + r(cx + pw * 0.18, y0, pw * 0.32, ys[i] - y0, C_mx(poleCol, -0.12));
  }
  return o;
}

G['helix-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#ffd84a', '#ff7a2e']));
    var P = '#8a35f2', K = '#ff3048';
    o += C_helix(200, [96, 236, 376], 180, 52, 30, 74, function (i) { return [[[-90, 20, P], [20, 60, K], [125, 270, P]], [[-90, 40, P], [100, 270, P]], [[-60, 150, P], [150, 210, K], [210, 300, P]]][i]; }, '#fff0f6');
    o += e(118, 228, 40, 12, '#ffd21a', 'opacity=".7"') + c(124, 172, 40, '#e88a00') + c(118, 166, 35, '#ffc21a') + e(108, 154, 12, 8, '#fff', 'opacity=".85"');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#ffd84a', '#ff7a2e']));
    var P = '#8a35f2', K = '#ff3048';
    o += C_helix(480, [80, 290, 500], 380, 90, 50, 130, function (i) { return [[[-90, 30, P], [30, 70, K], [130, 270, P]], [[-90, 40, P], [110, 270, P]], [[-40, 150, P], [150, 220, K], [220, 320, P]]][i]; }, '#fff0f6');
    o += c(290, 210, 46, '#e88a00') + c(284, 204, 40, '#ffc21a') + e(276, 192, 14, 9, '#fff', 'opacity=".85"');
    return o;
  }
};

var C_DINO = ['..........########.', '.........##.#######', '.........##########', '.........##########', '.........##########', '.........#####.....', '.........########..', '#.......#####......', '#......######......', '##....#########....', '###..###########...', '#############..#...', '.############......', '..###########......', '...#########.......', '....#######........', '....###.##.........', '....##...#.........', '....#....#.........', '....##...##........'];
var C_CACT = ['...##...', '.#.##...', '.#.##.#.', '.#.##.#.', '.####.#.', '...####.', '...##...', '...##...', '...##...'];
var C_CLOUD = ['....####....', '..##....##..', '.#........##', '############'];

G['dino-run'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#f7f7f7');
    o += pix(C_CLOUD, 40, 70, 9, { '#': '#c9c9c9' });
    o += r(0, 336, 400, 7, '#535353') + rep(7, function (i) { return r(20 + i * 60, 356 + (i % 2) * 14, 8 + (i % 3) * 8, 6, '#535353'); });
    o += pix(C_DINO, 24, 36, 15, { '#': '#535353' });
    o += pix(C_CACT, 300, 228, 12, { '#': '#535353' });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#f7f7f7');
    o += pix(C_CLOUD, 120, 90, 12, { '#': '#c9c9c9' }) + pix(C_CLOUD, 560, 60, 12, { '#': '#c9c9c9' }) + pix(C_CLOUD, 780, 170, 10, { '#': '#c9c9c9' });
    o += r(0, 470, 960, 8, '#535353') + rep(16, function (i) { return r(30 + i * 62, 494 + (i % 3) * 18, 10 + (i % 4) * 10, 6, '#535353'); });
    o += pix(C_DINO, 120, 230, 12, { '#': '#535353' });
    o += pix(C_CACT, 520, 362, 14, { '#': '#535353' }) + pix(C_CACT, 600, 398, 9, { '#': '#535353' }) + pix(C_CACT, 820, 362, 14, { '#': '#535353' });
    o += pix(['..#......', '..##.....', '#####....', '.#######.', '....####.', '....##...'], 640, 210, 12, { '#': '#535353' });
    return o;
  }
};

function C_watch(x, y, R) {
  return g('translate(' + x + ',' + y + ')', r(-24, -R - 44, 48, 34, '#fff', 8) + r(-14, -R - 14, 28, 20, '#fff') + g('rotate(45)', r(-12, -R - 30, 24, 30, '#fff', 6)) + c(0, 0, R, '#fff') + c(0, 0, R * 0.8, '#1f2a44') +
    rep(12, function (i) { var a = i * 30 * Math.PI / 180; return ln(Math.cos(a) * R * 0.66, Math.sin(a) * R * 0.66, Math.cos(a) * R * 0.74, Math.sin(a) * R * 0.74, '#9fb0d0', 7); }) +
    p([[R * 0.12, -R * 0.62], [-R * 0.34, R * 0.08], [-R * 0.02, R * 0.08], [-R * 0.14, R * 0.62], [R * 0.34, -R * 0.1], [R * 0.02, -R * 0.1]], '#ffd42a'));
}
function C_cursor(x, y, s) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M0 0 L0 100 L25 78 L42 116 L60 108 L44 72 L76 72 Z', '#fff', 'stroke="#111" stroke-width="7" stroke-linejoin="round"')); }

G['reaction'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#4bd36a') + p([[0, 0], [400, 0], [0, 400]], '#d6283a');
    o += C_watch(200, 222, 126);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 480, 600, '#d6283a') + r(480, 0, 480, 600, '#4bd36a');
    o += c(170, 250, 26, '#fff') + c(250, 250, 26, '#fff') + c(330, 250, 26, '#fff');
    o += t(240, 380, 'Wait for green', 50, '#fff') + t(720, 380, 'Click!', 90, '#fff');
    o += C_cursor(700, 140, 1.4);
    return o;
  }
};

function C_piece(k, col, line) {
  var o = r(-40, -20, 80, 20, col, 6) + r(-32, -34, 64, 16, col, 4);
  if (k === 'p') o += p([[-22, -34], [-12, -72], [12, -72], [22, -34]], col) + e(0, -74, 24, 8, col) + c(0, -98, 23, col);
  if (k === 'r') o += r(-24, -96, 48, 62, col) + d('M-32 -94 L-32 -130 L-19 -130 L-19 -116 L-6 -116 L-6 -130 L6 -130 L6 -116 L19 -116 L19 -130 L32 -130 L32 -94 Z', col);
  if (k === 'b') o += p([[-24, -34], [-12, -86], [12, -86], [24, -34]], col) + e(0, -88, 26, 8, col) + e(0, -118, 22, 30, col) + c(0, -152, 8, col);
  if (k === 'k') o += p([[-26, -34], [-16, -98], [16, -98], [26, -34]], col) + e(0, -100, 28, 9, col) + d('M-26 -104 C-34 -140 34 -140 26 -104 Z', col) + r(-6, -170, 12, 40, col) + r(-17, -158, 34, 12, col);
  if (k === 'q') o += p([[-26, -34], [-16, -98], [16, -98], [26, -34]], col) + e(0, -100, 28, 9, col) + p([[-28, -104], [-36, -146], [-16, -122], [0, -154], [16, -122], [36, -146], [28, -104]], col) + c(-36, -150, 8, col) + c(0, -158, 8, col) + c(36, -150, 8, col);
  if (k === 'n') o += d('M-28 -34 C-28 -54 -12 -60 -8 -70 L-34 -76 C-46 -80 -48 -94 -38 -102 L-12 -124 L-6 -146 L6 -126 C28 -120 42 -98 38 -70 C36 -54 32 -44 30 -34 Z', col) + c(-12, -106, 5, line);
  return '<g stroke="' + line + '" stroke-width="6" stroke-linejoin="round" paint-order="stroke">' + o.replace(/fill="[^"]*"/g, 'fill="' + col + '"') + '</g>' + (k === 'n' ? c(-12, -106, 6, line) : '') + (k === 'b' ? ln(-6, -128, 8, -114, line, 6) : '');
}
function C_pc(k, x, y, s, white) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', C_piece(k, white ? '#f6f6f2' : '#4a4744', white ? '#5a5650' : '#1e1c1a')); }

G['chess'] = {
  icon: function () {
    var o = rep(16, function (i) { var a = i % 4, b = Math.floor(i / 4); return r(a * 100, b * 100, 100, 100, (a + b) % 2 ? '#769656' : '#eeeed2'); });
    o += e(206, 362, 120, 18, '#000', 'opacity=".22"');
    o += g('translate(206,362) scale(2.05)', C_piece('n', '#f6f6f2', '#2e2b28').replace(/stroke-width="6"/, 'stroke-width="5"'));
    return o;
  },
  bg: function () {
    var o = rep(40, function (i) { var a = i % 8, b = Math.floor(i / 8); return r(a * 120, b * 120, 120, 120, (a + b) % 2 ? '#769656' : '#eeeed2'); });
    var back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    back.forEach(function (k, i) { o += C_pc(k, 60 + i * 120, 110, 0.62, false) + C_pc('p', 60 + i * 120, 230, 0.6, false); });
    [0, 1, 2, 5, 6, 7].forEach(function (i) { o += C_pc('p', 60 + i * 120, 590, 0.6, true); });
    o += C_pc('p', 420, 470, 0.6, true) + C_pc('n', 660, 470, 0.66, true) + C_pc('p', 540, 350, 0.6, true) + C_pc('q', 300, 350, 0.62, true);
    return o;
  }
};

function C_raised(x, y, s) { var b = s * 0.13; return r(x, y, s, s, '#c0c0c0') + p([[x, y], [x + s, y], [x + s - b, y + b], [x + b, y + b], [x + b, y + s - b], [x, y + s]], '#fff') + p([[x + s, y], [x + s, y + s], [x, y + s], [x + b, y + s - b], [x + s - b, y + s - b], [x + s - b, y + b]], '#808080'); }
function C_open(x, y, s, f) { return r(x, y, s, s, f || '#bdbdbd') + r(x, y, s, s, 'none', 0, 'stroke="#7b7b7b" stroke-width="' + Math.max(2, s * 0.04) + '"'); }
var C_NC = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000', '#808080'];
function C_num(x, y, s, n) { return t(x + s / 2, y + s * 0.74, n, s * 0.64, C_NC[n], { font: "'Press Start 2P'", w: 400 }); }
function C_flag(x, y, s) { return r(x + s * 0.5, y + s * 0.16, s * 0.08, s * 0.54, '#000') + p([[x + s * 0.58, y + s * 0.14], [x + s * 0.58, y + s * 0.52], [x + s * 0.16, y + s * 0.33]], '#f00') + r(x + s * 0.34, y + s * 0.64, s * 0.4, s * 0.08, '#000') + r(x + s * 0.24, y + s * 0.71, s * 0.6, s * 0.1, '#000'); }
function C_mine(cx, cy, R) { return rep(4, function (i) { return g('rotate(' + i * 45 + ' ' + cx + ' ' + cy + ')', r(cx - R * 0.1, cy - R * 1.5, R * 0.2, R * 3, '#111', R * 0.06)); }) + c(cx, cy, R, '#111') + r(cx - R * 0.5, cy - R * 0.5, R * 0.36, R * 0.36, '#fff'); }

G['minesweeper'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#c0c0c0'), s = 100;
    var L = ['R1FR', '1..1', '1..2', 'R2FR'];
    L.forEach(function (row, j) { for (var i = 0; i < 4; i++) { var ch = row[i], x = i * s, y = j * s; if (ch === 'R') o += C_raised(x, y, s); else if (ch === 'F') o += C_raised(x, y, s) + C_flag(x, y, s); else if (ch === '.') o += C_open(x, y, s, '#ff2a2a'); else o += C_open(x, y, s) + C_num(x, y, s, +ch); } });
    o += C_mine(200, 200, 74);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#c0c0c0'), s = 60, R = rnd(7), M = [];
    for (var j = 0; j < 10; j++) { M.push([]); for (var i = 0; i < 16; i++) M[j].push(R() < 0.17); }
    for (j = 0; j < 10; j++) for (i = 0; i < 16; i++) {
      var x = i * s, y = j * s, inn = Math.pow((i - 7.5) / 6.5, 2) + Math.pow((j - 4.5) / 4, 2) < 1;
      if (!inn) { o += C_raised(x, y, s); continue; }
      if (M[j][i]) { o += C_raised(x, y, s) + C_flag(x, y, s); continue; }
      var n = 0; for (var b = -1; b <= 1; b++) for (var a = -1; a <= 1; a++) if (M[j + b] && M[j + b][i + a]) n++;
      o += C_open(x, y, s) + (n ? C_num(x, y, s, n) : '');
    }
    o += C_open(600, 300, s, '#ff2a2a') + C_mine(630, 330, 18);
    return o;
  }
};

function C_bball(cx, cy, R) { var w = R * 0.08, k = '#3a1a06'; return C_clip('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>', c(cx, cy, R, '#c4570f') + c(cx - R * 0.12, cy - R * 0.12, R * 0.95, '#f2821e')) + g('translate(' + cx + ',' + cy + ') rotate(-25)', ln(0, -R, 0, R, k, w) + ln(-R, 0, R, 0, k, w) + sk('M' + (-R * 0.62) + ' ' + (-R * 0.78) + ' C' + (-R * 0.2) + ' ' + (-R * 0.3) + ' ' + (-R * 0.2) + ' ' + (R * 0.3) + ' ' + (-R * 0.62) + ' ' + (R * 0.78), k, w) + sk('M' + (R * 0.62) + ' ' + (-R * 0.78) + ' C' + (R * 0.2) + ' ' + (-R * 0.3) + ' ' + (R * 0.2) + ' ' + (R * 0.3) + ' ' + (R * 0.62) + ' ' + (R * 0.78), k, w)) + c(cx, cy, R, 'none', 'stroke="' + k + '" stroke-width="' + w + '"'); }
function C_hoop(cx, y, w) {
  var o = '', top = w * 0.18, bw = w * 0.62, hgt = w * 0.62;
  var XT = function (i) { return cx - w / 2 + i * w / 6; }, XB = function (i) { return cx - bw / 2 + Math.max(0, Math.min(6, i)) * bw / 6; };
  for (var i = 0; i <= 6; i++) { if (i < 6) o += ln(XT(i), y + 4, XB(i + 1), y + hgt, '#fff', w * 0.035); if (i > 0) o += ln(XT(i), y + 4, XB(i - 1), y + hgt, '#fff', w * 0.035); }
  o += ln(XT(0), y + 4, XB(0), y + hgt, '#fff', w * 0.035) + ln(XT(6), y + 4, XB(6), y + hgt, '#fff', w * 0.035) + ln(cx - bw / 2, y + hgt, cx + bw / 2, y + hgt, '#fff', w * 0.035);
  return o + e(cx, y, w / 2, top / 2, 'none', 'stroke="#ff4a1a" stroke-width="' + w * 0.07 + '"');
}

G['hoops-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#2a3d9a', '#0f1748']));
    o += e(200, 120, 230, 160, '#fff', 'opacity=".06"');
    o += r(60, 30, 280, 190, '#f4f6fb', 14, 'stroke="#c9cfdf" stroke-width="8"') + r(140, 100, 120, 90, 'none', 4, 'stroke="#e8352a" stroke-width="12"');
    o += r(190, 190, 20, 30, '#9aa3b8');
    o += C_bball(212, 186, 66);
    o += C_hoop(200, 226, 190);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#1a2766', '#0c1236']));
    o += rep(70, function (i) { return c((i * 53) % 960, 230 + (i * 29) % 90, 12, ['#ff8a2a', '#4a7bff', '#ffffff', '#ffd23a'][i % 4], 'opacity=".4"'); });
    o += r(0, 340, 960, 260, '#d79c55') + rep(12, function (i) { return r(i * 80, 340, 4, 260, '#b97f3c'); }) + p([[300, 600], [380, 400], [580, 400], [660, 600]], '#c2462e') + e(480, 400, 100, 26, 'none', 'stroke="#fff" stroke-width="6"');
    o += r(470, 160, 20, 200, '#7a8299') + r(360, 40, 240, 160, '#f4f6fb', 12, 'stroke="#c9cfdf" stroke-width="7"') + r(430, 100, 100, 70, 'none', 4, 'stroke="#e8352a" stroke-width="10"');
    o += C_hoop(480, 200, 150) + C_bball(640, 110, 46);
    return o;
  }
};

function C_melon(cx, cy, R, rot, up) {
  var s = up ? -1 : 1, o = '';
  o += C_clip(d('M' + (-R) + ' 0 A' + R + ' ' + R + ' 0 0 ' + (up ? 1 : 0) + ' ' + R + ' 0 Z', '#000'), d('M' + (-R) + ' 0 A' + R + ' ' + R + ' 0 0 ' + (up ? 1 : 0) + ' ' + R + ' 0 Z', '#2f8a22') + rep(5, function (i) { return e(-R * 0.8 + i * R * 0.4, s * R * 0.5, R * 0.08, R * 0.9, '#1d5e14'); }));
  o += e(0, 0, R, R * 0.34, '#d9f0a0') + e(0, 0, R * 0.9, R * 0.28, '#ff3048') + rep(6, function (i) { return e(-R * 0.55 + i * R * 0.22, (i % 2 ? -1 : 1) * R * 0.08, R * 0.04, R * 0.06, '#2a120c'); });
  return g('translate(' + cx + ',' + cy + ') rotate(' + rot + ')', o);
}
function C_orange(cx, cy, R) { return c(cx, cy, R, '#e8780e') + c(cx - R * 0.08, cy - R * 0.08, R * 0.9, '#ff9a1f') + e(cx + R * 0.1, cy - R * 0.95, R * 0.25, R * 0.12, '#3c9a2a'); }
function C_apple(cx, cy, R) { return d('M' + cx + ' ' + (cy - R * 0.7) + ' C' + (cx - R * 1.4) + ' ' + (cy - R * 1.3) + ' ' + (cx - R * 1.3) + ' ' + (cy + R * 0.9) + ' ' + cx + ' ' + (cy + R * 0.9) + ' C' + (cx + R * 1.3) + ' ' + (cy + R * 0.9) + ' ' + (cx + R * 1.4) + ' ' + (cy - R * 1.3) + ' ' + cx + ' ' + (cy - R * 0.7) + ' Z', '#e0242e') + r(cx - R * 0.06, cy - R * 1.05, R * 0.12, R * 0.4, '#5a3214') + e(cx + R * 0.3, cy - R * 0.9, R * 0.3, R * 0.12, '#3c9a2a'); }
function C_splat(cx, cy, R, col, seed) { var q = rnd(seed), o = c(cx, cy, R, col); for (var i = 0; i < 9; i++) { var a = q() * 6.28, dd = R * (0.9 + q() * 0.9); o += c(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, R * (0.12 + q() * 0.22), col); } return o; }
function C_wood(w, h, pw) { return r(0, 0, w, h, '#93602f') + rep(Math.ceil(w / pw), function (i) { return r(i * pw, 0, pw - 6, h, i % 2 ? '#a26c38' : '#9a6533') + r(i * pw + pw - 6, 0, 6, h, '#6e4520') + e(i * pw + pw * 0.4, (i * 137) % h, 10, 22, '#7d5128', 'opacity=".6"'); }); }

G['fruit-slice'] = {
  icon: function () {
    var o = C_wood(400, 400, 100);
    o += C_splat(110, 300, 34, '#c8102e', 3) + C_splat(300, 110, 26, '#c8102e', 5);
    o += C_melon(150, 158, 132, -38, true) + C_melon(250, 250, 132, -38, false);
    o += d('M20 380 C140 250 260 140 395 25 C300 160 170 290 20 380 Z', '#fff') + d('M60 350 C160 260 260 170 370 60 C270 180 170 280 60 350 Z', '#cfe8ff');
    return o;
  },
  bg: function () {
    var o = C_wood(960, 600, 120);
    o += C_splat(200, 420, 40, '#c8102e', 9) + C_splat(720, 160, 34, '#e8780e', 11) + C_splat(560, 470, 30, '#c8102e', 13);
    o += C_melon(300, 220, 110, -20, true) + C_melon(380, 300, 110, -20, false) + C_orange(700, 380, 70) + C_apple(820, 170, 64) + C_apple(130, 150, 56) + C_orange(560, 120, 54);
    o += d('M60 560 C300 380 600 260 920 60 C620 300 320 460 60 560 Z', '#fff', 'opacity=".85"');
    return o;
  }
};

var C_WC = { g: '#6aaa64', y: '#c9b458', x: '#787c7e' };
function C_wtile(x, y, s, st, ch, dark) { var o = st === 'e' ? r(x, y, s, s, dark ? '#121213' : '#fff', 0, 'stroke="' + (dark ? '#3a3a3c' : '#d3d6da') + '" stroke-width="' + s * 0.05 + '"') : r(x, y, s, s, C_WC[st]); return o + (ch ? t(x + s / 2, y + s * 0.71, ch, s * 0.58, st === 'e' ? '#1a1a1b' : '#fff', { font: 'Montserrat', w: 800 }) : ''); }

G['word-guess'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#121213'), s = 112, gp = 12, x0 = (400 - 3 * s - 2 * gp) / 2;
    var st = ['xyx', 'yxg', 'ggg'], ch = ['   ', '   ', 'WIN'];
    st.forEach(function (row, j) { for (var i = 0; i < 3; i++) o += C_wtile(x0 + i * (s + gp), x0 + j * (s + gp), s, row[i], ch[j][i]); });
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#fff'), s = 64, gp = 8, x0 = 480 - (5 * s + 4 * gp) / 2;
    var st = ['xyxxg', 'gxyxg', 'ggggg', 'eeeee', 'eeeee', 'eeeee'], ch = ['CRANE', 'PLATE', 'GLOBE', '', '', ''];
    st.forEach(function (row, j) { for (var i = 0; i < 5; i++) o += C_wtile(x0 + i * (s + gp), 16 + j * (s + gp), s, row[i], ch[j][i]); });
    ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].forEach(function (row, j) { var w = 70, x = 480 - row.length * (w + 8) / 2; for (var i = 0; i < row.length; i++) { var k = row[i], col = 'GLOBE'.indexOf(k) >= 0 ? '#6aaa64' : 'CRANPT'.indexOf(k) >= 0 ? '#787c7e' : '#d3d6da'; o += r(x + i * (w + 8), 462 + j * 46, w, 40, col, 6) + t(x + i * (w + 8) + w / 2, 462 + j * 46 + 29, k, 24, col === '#d3d6da' ? '#1a1a1b' : '#fff', { w: 800 }); } });
    return o;
  }
};

function C_plane(col) {
  var dk = C_mx(col, -0.3);
  return p([[-118, -6], [-146, -70], [-108, -68], [-74, -20]], dk) + d('M-130 -8 C-128 -30 -60 -36 40 -32 C92 -30 122 -18 126 0 C122 18 92 28 40 30 L-118 10 Z', col) + r(-70, -33, 18, 52, '#fff', 0, 'opacity=".9"') +
    d('M-20 -30 C-12 -64 40 -64 52 -30 Z', '#bfeaff') + d('M-6 -32 C0 -52 14 -56 24 -54 L18 -32 Z', '#fff', 'opacity=".7"') + e(-110, 6, 40, 11, dk) + p([[-30, 8], [50, 8], [6, 62], [-52, 62]], dk, 'stroke="' + dk + '" stroke-width="10" stroke-linejoin="round"') +
    ln(24, 26, 16, 58, '#333', 7) + c(16, 62, 14, '#333') + c(16, 62, 6, '#aaa') + c(126, 0, 15, '#e8e8e8') + e(138, 0, 9, 64, '#fff', 'opacity=".55"') + r(134, -64, 6, 128, '#333', 3, 'opacity=".35"');
}
function C_ring(cx, cy, rx, ry, half) { var a = 'stroke="#ffc21a" stroke-width="' + rx * 0.36 + '"', b = 'stroke="#fff3a0" stroke-width="' + rx * 0.1 + '"'; if (!half) return e(cx, cy, rx, ry, 'none', a) + e(cx, cy, rx, ry, 'none', b); var pth = 'M' + cx + ' ' + (cy - ry) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + cx + ' ' + (cy + ry); return d(pth, 'none', a) + d(pth, 'none', b); }
function C_isle(cx, cy, w) { return e(cx, cy, w, w * 0.22, '#f4d98c') + e(cx - w * 0.05, cy - w * 0.05, w * 0.78, w * 0.18, '#4cbf4a') + e(cx - w * 0.3, cy - w * 0.12, w * 0.3, w * 0.1, '#3aa53c') + sk('M' + (cx + w * 0.2) + ' ' + (cy - w * 0.06) + ' C' + (cx + w * 0.18) + ' ' + (cy - w * 0.3) + ' ' + (cx + w * 0.28) + ' ' + (cy - w * 0.45) + ' ' + (cx + w * 0.34) + ' ' + (cy - w * 0.55), '#8a5a2a', w * 0.06) + rep(5, function (i) { var a = -160 + i * 50; return e(cx + w * 0.34 + Math.cos(a * Math.PI / 180) * w * 0.14, cy - w * 0.55 + Math.sin(a * Math.PI / 180) * w * 0.08, w * 0.17, w * 0.05, '#2f9a3a', 'transform="rotate(' + (a + 90 - 90) + ' ' + (cx + w * 0.34 + Math.cos(a * Math.PI / 180) * w * 0.14) + ' ' + (cy - w * 0.55 + Math.sin(a * Math.PI / 180) * w * 0.08) + ')"'); }); }

G['sky-pilot'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3fb4ff', '#a8e4ff']));
    o += e(80, 90, 70, 26, '#fff') + e(330, 60, 60, 20, '#fff');
    o += r(0, 320, 400, 80, '#2aa0e0') + C_isle(90, 330, 120) + C_isle(330, 352, 80);
    o += C_ring(232, 190, 62, 140) + g('translate(196,198) scale(1.1) rotate(-6)', C_plane('#e8352a')) + C_ring(232, 190, 62, 140, true);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#3fb4ff', '#bfeaff']));
    o += e(160, 100, 120, 36, '#fff') + e(220, 80, 80, 30, '#fff') + e(760, 140, 140, 40, '#fff') + e(520, 60, 90, 26, '#fff');
    o += r(0, 400, 960, 200, '#2a9fe0') + rep(8, function (i) { return r(i * 130 + 20, 440 + (i % 3) * 40, 70, 6, '#fff', 3, 'opacity=".4"'); });
    o += C_isle(150, 430, 200) + C_isle(560, 520, 150) + C_isle(850, 420, 160);
    o += C_ring(470, 250, 40, 92) + C_ring(640, 230, 32, 74) + C_ring(780, 215, 26, 60);
    o += g('translate(270,270) scale(.9) rotate(-8)', C_plane('#e8352a'));
    return o;
  }
};

function C_tank(col) {
  var dk = C_mx(col, -0.3), lt = C_mx(col, 0.15);
  return r(-122, 0, 244, 58, '#2b2b2b', 29) + r(-110, 4, 220, 8, '#4a4a4a', 4) + rep(5, function (i) { return c(-88 + i * 44, 32, 19, '#6e6e6e') + c(-88 + i * 44, 32, 8, '#3a3a3a'); }) +
    p([[-134, 0], [-112, -42], [112, -42], [138, 0]], col) + p([[-112, -42], [112, -42], [118, -32], [-118, -32]], lt) + r(-134, -6, 272, 12, dk) +
    r(40, -82, 150, 20, dk, 4) + r(176, -86, 30, 28, dk, 5) + d('M-62 -42 C-62 -96 52 -100 62 -42 Z', col) + d('M-40 -60 C-36 -86 20 -90 30 -66 Z', lt) + r(-20, -102, 40, 12, dk, 5);
}
function C_boom(cx, cy, R) { return star(cx, cy, R, R * 0.55, 9, '#ff6a1a') + star(cx, cy, R * 0.7, R * 0.4, 9, '#ffc21a', -70) + c(cx, cy, R * 0.25, '#fff5c0'); }

G['tanks-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#ffb347', '#ff6a2a']));
    o += c(110, 110, 60, '#ffe7a0', 'opacity=".7"') + r(0, 300, 400, 100, '#7a4a28') + r(0, 300, 400, 10, '#5e3820');
    o += C_boom(352, 192, 54);
    o += g('translate(160,262) scale(.95)', C_tank('#5f7d2c'));
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#ffb347', '#ff7a3a']));
    o += r(0, 380, 960, 220, '#c98a4a') + r(0, 380, 960, 14, '#a8703a');
    o += rep(4, function (i) { return r(80 + i * 240, 300, 120, 90, '#8a8f99') + r(80 + i * 240, 300, 120, 14, '#a9aeb8'); });
    o += r(420, 430, 80, 80, '#a8743a') + r(430, 440, 60, 60, 'none', 0, 'stroke="#7a5228" stroke-width="8"') + ln(430, 440, 490, 500, '#7a5228', 8);
    o += g('translate(220,470) scale(.9)', C_tank('#5f7d2c')) + g('translate(760,470) scale(-.9,.9)', C_tank('#3f5f9a'));
    o += r(420, 397, 120, 8, '#fff4b0', 4) + C_boom(580, 400, 50);
    return o;
  }
};

function C_bub(x, y, R, col) { return c(x, y, R, C_mx(col, -0.28)) + c(x - R * 0.08, y - R * 0.08, R * 0.88, col) + e(x - R * 0.35, y - R * 0.38, R * 0.26, R * 0.17, '#fff', 'opacity=".8" transform="rotate(-35 ' + (x - R * 0.35) + ' ' + (y - R * 0.38) + ')"'); }
var C_BC = ['#ff3b4e', '#ffcc1a', '#2fb4ff', '#3cd65a', '#a64dff', '#ff8a1a'];

G['bubble-pop'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#e4e0ff', '#a99eff'])), R = 38, q = rnd(4);
    var L = ['012340', '25013', '340251', '1302'];
    L.forEach(function (row, j) { for (var i = 0; i < row.length; i++) o += C_bub(10 + i * 76 + (j % 2) * 38 + (j === 3 ? 76 : 0), 30 + j * 66, R, C_BC[+row[i]]); });
    o += rep(5, function (i) { return c(200 - i * 6, 300 - i * 30, 8, '#3b3b8f'); });
    o += e(200, 410, 92, 60, '#3b3b8f') + C_bub(200, 340, R, C_BC[2]);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#e4e0ff', '#a99eff'])), R = 40, q = rnd(11);
    for (var j = 0; j < 5; j++) for (var i = 0; i < 12; i++) o += C_bub(40 + i * 80 + (j % 2) * 40, 40 + j * 70, R, C_BC[Math.floor(q() * 6)]);
    o += rep(6, function (i) { return c(480 + i * 18, 520 - i * 34, 9, '#3b3b8f'); }) + e(480, 620, 120, 70, '#3b3b8f') + C_bub(480, 540, R, C_BC[0]);
    return o;
  }
};

function C_card(x, y, w, h, rot, face) {
  var o = r(-w / 2 + 6, -h / 2 + 10, w, h, '#000', w * 0.13, 'opacity=".2"');
  if (face === 'back') o += r(-w / 2, -h / 2, w, h, '#fff', w * 0.13) + r(-w / 2 + w * 0.07, -h / 2 + w * 0.07, w * 0.86, h - w * 0.14, '#4a5be0', w * 0.09) + star(0, 0, w * 0.26, w * 0.11, 5, '#ffd23a') + c(-w * 0.26, -h * 0.3, w * 0.06, '#7f8dff') + c(w * 0.26, h * 0.3, w * 0.06, '#7f8dff') + c(w * 0.26, -h * 0.3, w * 0.06, '#7f8dff') + c(-w * 0.26, h * 0.3, w * 0.06, '#7f8dff');
  else o += r(-w / 2, -h / 2, w, h, '#fff', w * 0.13) + r(-w / 2, -h / 2, w, h, 'none', w * 0.13, 'stroke="#dfe3ee" stroke-width="' + w * 0.04 + '"') + g('scale(' + w / 100 + ')', face);
  return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
}
var C_HEART = d('M0 32 C-40 4 -44 -24 -22 -32 C-10 -36 0 -27 0 -19 C0 -27 10 -36 22 -32 C44 -24 40 4 0 32 Z', '#ff3d5a');

G['pairs'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#3fd0c4', '#1f74d6'], 0, 0, 1, 1));
    o += C_card(200, 150, 150, 210, 0, 'back');
    o += C_card(122, 238, 160, 224, -12, C_HEART) + C_card(278, 238, 160, 224, 12, C_HEART);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#3fd0c4', '#1f74d6'], 0, 0, 1, 1));
    var star5 = star(0, 0, 32, 14, 5, '#ffc21a'), circ = c(0, 0, 30, '#2fbf5a'), dia = p([[0, -36], [26, 0], [0, 36], [-26, 0]], '#3b7bff');
    var F = ['back', C_HEART, 'back', star5, 'back', 'back', 'back', circ, 'back', C_HEART, 'back', dia, star5, 'back', 'back', 'back', 'back', dia];
    F.forEach(function (f, i) { o += C_card(100 + (i % 6) * 152, 100 + Math.floor(i / 6) * 200, 120, 170, ((i * 7) % 9) - 4, f); });
    return o;
  }
};

function C_target(cx, cy, R) { var o = c(cx + 6, cy + 10, R, '#000', 'opacity=".2"'); for (var i = 0; i < 5; i++) o += c(cx, cy, R * (1 - i * 0.19), i % 2 ? '#fff' : '#e8312f'); o += c(cx, cy, R * 0.12, '#ffd21a'); return o + c(cx, cy, R, 'none', 'stroke="#7a1414" stroke-width="' + R * 0.05 + '"'); }
function C_hole(x, y, R) { return c(x, y, R * 1.5, '#fff', 'opacity=".35"') + c(x, y, R, '#2a1810'); }
function C_cross(cx, cy, R, col) { var w = R * 0.13; return c(cx, cy, R, 'none', 'stroke="' + col + '" stroke-width="' + w + '"') + ln(cx - R * 1.35, cy, cx - R * 0.45, cy, col, w) + ln(cx + R * 0.45, cy, cx + R * 1.35, cy, col, w) + ln(cx, cy - R * 1.35, cx, cy - R * 0.45, col, w) + ln(cx, cy + R * 0.45, cx, cy + R * 1.35, col, w) + c(cx, cy, w * 0.9, '#ff2a2a'); }
function C_duck(x, y, s) { return g('translate(' + x + ',' + y + ') scale(' + s + ')', e(0, 0, 50, 30, '#ffd21a') + c(36, -34, 22, '#ffd21a') + p([[54, -38], [80, -30], [54, -26]], '#ff8a1a') + c(40, -40, 5, '#222') + d('M-30 -10 C-10 -30 20 -20 22 0 Z', '#f0b400') + r(-6, 28, 12, 40, '#7a5a3a')); }

G['target-range-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#7fd0ff', '#d4f1ff'])) + r(0, 310, 400, 90, '#5fb84a') + r(0, 310, 400, 12, '#4a9a38');
    o += r(186, 280, 28, 120, '#8a5a32') + p([[120, 400], [186, 300], [196, 310], [140, 400]], '#7a4c28') + p([[280, 400], [214, 300], [204, 310], [260, 400]], '#7a4c28');
    o += C_target(200, 178, 150) + C_hole(176, 160, 11) + C_hole(232, 214, 11) + C_hole(120, 104, 11);
    o += C_cross(206, 172, 70, '#1b1b1b');
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#b8783e') + rep(12, function (i) { return r(0, i * 50, 960, 4, '#8f5a2a'); });
    o += rep(16, function (i) { return r(i * 60, 0, 60, 80, i % 2 ? '#fff' : '#e8312f') + c(i * 60 + 30, 80, 30, i % 2 ? '#fff' : '#e8312f'); });
    o += r(0, 300, 960, 16, '#6a3e1c') + rep(5, function (i) { return C_duck(120 + i * 180, 270, 0.75); });
    o += C_target(200, 200, 70) + C_target(480, 180, 90) + C_target(770, 200, 70);
    o += r(0, 440, 960, 160, '#5a3418') + r(0, 440, 960, 22, '#7a4a24');
    o += C_cross(470, 190, 60, '#111');
    return o;
  }
};

var C_BRK = ['#c84848', '#c66c3a', '#b47a30', '#a2a22a', '#48a048', '#4248c8'];

G['breakout'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, '#0e0e16') + r(0, 0, 400, 20, '#8e8e8e') + r(0, 0, 20, 400, '#8e8e8e') + r(380, 0, 20, 400, '#8e8e8e');
    var gap = { '4,1': 1, '5,1': 1, '5,2': 1, '3,1': 1 };
    for (var j = 0; j < 6; j++) for (var i = 0; i < 4; i++) if (!gap[j + ',' + i]) o += r(26 + i * 88, 52 + j * 32, 82, 26, C_BRK[j], 3) + r(26 + i * 88, 52 + j * 32, 82, 7, '#fff', 3, 'opacity=".25"');
    o += r(166, 262, 26, 26, '#fff') + r(186, 300, 14, 14, '#fff', 0, 'opacity=".35"') + r(206, 326, 10, 10, '#fff', 0, 'opacity=".2"');
    o += r(120, 346, 140, 26, '#e04a2c', 4) + r(120, 346, 140, 8, '#ff8a6a', 4);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, '#0e0e16') + r(0, 0, 960, 24, '#8e8e8e') + r(0, 0, 24, 600, '#8e8e8e') + r(936, 0, 24, 600, '#8e8e8e');
    for (var j = 0; j < 6; j++) for (var i = 0; i < 9; i++) if (!((j > 3 && (i === 4 || i === 5)) || (j === 5 && i === 2))) o += r(36 + i * 100, 70 + j * 40, 92, 32, C_BRK[j], 3);
    o += r(490, 380, 30, 30, '#fff') + r(400, 540, 180, 30, '#e04a2c', 4);
    return o;
  }
};

function C_sball(cx, cy, R) {
  var pent = function (x, y, rr, rot) { return star(x, y, rr, rr, 5, '#1d1d1d', rot); };
  var inner = c(cx, cy, R, '#d6d9de') + c(cx - R * 0.08, cy - R * 0.08, R * 0.95, '#fff') + pent(cx, cy, R * 0.34, -90);
  for (var i = 0; i < 5; i++) { var a = (-90 + i * 72) * Math.PI / 180; inner += ln(cx + Math.cos(a) * R * 0.34, cy + Math.sin(a) * R * 0.34, cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72, '#1d1d1d', R * 0.05) + pent(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98, R * 0.32, 90 + i * 72); }
  return C_clip('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/>', inner) + c(cx, cy, R, 'none', 'stroke="#1d1d1d" stroke-width="' + R * 0.05 + '"');
}
function C_goal(x, y, w, h, pw) { var o = r(x, y, w, h, '#fff', 0, 'opacity=".08"'); for (var i = 1; i < w / 30; i++) o += ln(x + i * 30, y, x + i * 30, y + h, '#fff', 4, 'opacity=".45"'); for (i = 1; i < h / 30; i++) o += ln(x, y + i * 30, x + w, y + i * 30, '#fff', 4, 'opacity=".45"'); return o + r(x - pw, y - pw, pw, h + pw, '#fff') + r(x + w, y - pw, pw, h + pw, '#fff') + r(x - pw, y - pw, w + 2 * pw, pw, '#fff'); }

G['penalty-3d'] = {
  icon: function () {
    var o = r(0, 0, 400, 400, lg(['#0f1d4a', '#23407a'])) + rep(20, function (i) { return c(20 + i * 20, 40 + (i % 3) * 14, 6, '#ffffff', 'opacity=".25"'); });
    o += r(0, 260, 400, 140, '#3daa3a') + rep(4, function (i) { return r(i * 100, 260, 50, 140, '#48b844'); }) + r(0, 258, 400, 6, '#fff');
    o += C_goal(52, 90, 296, 170, 16);
    o += e(206, 362, 70, 14, '#000', 'opacity=".25"') + C_sball(206, 284, 82);
    return o;
  },
  bg: function () {
    var o = r(0, 0, 960, 600, lg(['#0f1d4a', '#23407a'])) + rep(60, function (i) { return c((i * 41) % 960, 40 + (i * 31) % 130, 10, ['#ffffff', '#ffd23a', '#ff5a5a', '#5ab4ff'][i % 4], 'opacity=".35"'); });
    o += r(0, 330, 960, 270, '#3daa3a') + rep(8, function (i) { return r(i * 120, 330, 60, 270, '#48b844'); }) + r(0, 328, 960, 6, '#fff');
    o += C_goal(250, 160, 460, 170, 18) + p([[210, 600], [250, 330], [710, 330], [750, 600]], 'none', 'stroke="#fff" stroke-width="6"');
    o += g('translate(560,250) rotate(-30)', r(-20, -60, 40, 90, '#ffd23a', 16) + c(0, -80, 20, '#f2c09a') + r(-70, -54, 50, 18, '#ffd23a', 9) + r(20, -54, 50, 18, '#ffd23a', 9) + r(-18, 26, 14, 50, '#222', 6) + r(4, 26, 14, 50, '#222', 6));
    o += e(480, 540, 46, 10, '#000', 'opacity=".25"') + C_sball(480, 500, 44);
    return o;
  }
};
