G['blockcraft-3d'] = {
  grid: function (m, rows, pal, ov) {
    var o = '';
    rows.forEach(function (row, j) { for (var i = 0; i < row.length; i++) { var f = pal[row[i]]; if (f) o += '<rect x="' + i + '" y="' + j + '" width="' + (1 + ov) + '" height="' + (1 + ov) + '" fill="' + f + '"/>'; } });
    return '<g transform="matrix(' + m.join(',') + ')">' + o + '</g>';
  },
  tex: function (seed, kind) {
    var R = rnd(seed), out = [];
    for (var j = 0; j < 8; j++) {
      var s = '';
      for (var i = 0; i < 8; i++) {
        var q = R();
        if (kind === 'top') s += q < .22 ? 'a' : q < .55 ? 'b' : q < .85 ? 'c' : 'd';
        else {
          var edge = j === 0 || j === 1 && R() < .7 || j === 2 && R() < .25;
          s += edge ? (q < .5 ? 'b' : 'c') : q < .08 ? 's' : q < .35 ? 'e' : q < .75 ? 'f' : 'g';
        }
      }
      out.push(s);
    }
    return out;
  },
  cube: function (cx, ty, a, b, h, seed, k) {
    var K = G['blockcraft-3d'], ov = 0.06;
    var top = { a: '#5fbf3c', b: '#6fd046', c: '#56ad35', d: '#82dc56' };
    var lit = { b: '#5cb43a', c: '#4e9e30', e: '#8d6440', f: '#7c5636', g: '#9a7049', s: '#9aa0a4' };
    var dk = { b: '#3f7f27', c: '#376f22', e: '#5f432b', f: '#533a25', g: '#6a4b31', s: '#6d7276' };
    var u = a / 8, w = b / 8, v = h / 8, o = '';
    o += K.grid([u, w, -u, w, cx, ty], K.tex(seed, 'top'), top, ov);
    o += K.grid([u, w, 0, v, cx - a, ty + b], K.tex(seed + 7, 'side'), lit, ov);
    o += K.grid([u, -w, 0, v, cx, ty + 2 * b], K.tex(seed + 13, 'side'), dk, ov);
    if (k) {
      o += p([[cx, ty], [cx + a, ty + b], [cx, ty + 2 * b], [cx - a, ty + b]], 'none', 'stroke="#fff" stroke-opacity=".35" stroke-width="' + k + '" stroke-linejoin="round"');
      o += sk('M' + (cx - a) + ' ' + (ty + b) + 'L' + cx + ' ' + (ty + 2 * b) + 'L' + (cx + a) + ' ' + (ty + b), '#fff', k * .8, 'opacity=".25"');
      o += sk('M' + cx + ' ' + (ty + 2 * b) + 'L' + cx + ' ' + (ty + 2 * b + h), '#000', k * .7, 'opacity=".25"');
    }
    return o;
  },
  pick: function (x, y, s, sh) {
    var m = ['....KKKKKK......', '...KHHHHHHKK....', '..KHhhhhhhhHK...', '...KKKKKKhhhDK..', '........KWKhhDK.', '.......KWwKKhDK.', '......KWwK.KhDK.', '.....KWwK..KhDK.', '....KWwK....KDK.', '...KWwK.....KDK.', '..KWwK.......KK.', '.KWwK...........', 'KWwK............', 'KwwK............', 'KwK.............', '.K..............'];
    if (sh) return pix(m, x, y, s, { K: '#000', H: '#000', h: '#000', D: '#000', W: '#000', w: '#000' }, 'opacity=".3"');
    return pix(m, x, y, s, { K: '#22262c', H: '#ffffff', h: '#c9d6e2', D: '#7f8fa0', W: '#b98a52', w: '#7a5530' });
  },
  icon: function () {
    var K = G['blockcraft-3d'];
    var o = r(0, 0, 400, 400, lg(['#79c8ff', '#3f8fe6', '#2554b8']));
    o += c(64, 66, 130, rg([['rgba(255,248,210,.85)', 0], ['rgba(255,226,140,.35)', .45], ['rgba(255,210,110,0)', 1]]));
    o += r(28, 30, 70, 70, '#fff3b0', 6) + r(36, 38, 54, 54, '#fffbe0', 4);
    o += r(250, 64, 90, 22, '#fff', 0, 'opacity=".85"') + r(272, 50, 46, 16, '#fff', 0, 'opacity=".85"') + r(40, 150, 64, 16, '#fff', 0, 'opacity=".6"');
    o += e(196, 356, 150, 26, '#0b2a6a', 'opacity=".35"');
    o += K.cube(196, 96, 128, 74, 150, 11, 5);
    o += K.pick(150, 150, 14, 1).replace('<g ', '<g transform="translate(10,12)" ');
    o += K.pick(150, 150, 14);
    o += r(118, 118, 12, 12, '#82dc56') + r(96, 96, 8, 8, '#6fd046', 0, 'opacity=".8"') + r(332, 300, 12, 12, '#8d6440') + r(352, 270, 8, 8, '#9a7049', 0, 'opacity=".8"');
    o += d('M0 0 H400 V120 C300 170 120 170 0 120 Z', '#fff', 'opacity=".09"');
    return o;
  },
  bg: function () {
    var K = G['blockcraft-3d'], R = rnd(7);
    var o = r(0, 0, 960, 600, lg(['#4f86e0', '#8fbcf2', '#ffcf9a']));
    o += c(200, 150, 160, '#fff1c0', 'opacity=".35"') + r(160, 110, 80, 80, '#fff6d0');
    o += r(420, 70, 200, 36, '#fff', 0, 'opacity=".8"') + r(470, 46, 100, 30, '#fff', 0, 'opacity=".8"') + r(720, 120, 160, 30, '#fff', 0, 'opacity=".7"');
    var far = [9, 10, 11, 12, 12, 11, 10, 10, 11, 13, 14, 14, 13, 12, 11, 11, 12, 12, 11, 10, 10, 11, 12, 13];
    far.forEach(function (hh, i) { o += r(i * 40, 600 - hh * 30, 41, hh * 30, '#7ea0c8'); });
    var mid = [6, 6, 7, 7, 8, 8, 8, 7, 6, 5, 4, 4, 4, 4, 5, 6, 7, 8, 9, 9, 8, 8, 7, 7];
    mid.forEach(function (hh, i) {
      var x = i * 40, top = 600 - hh * 40;
      o += r(x, top, 41, 40, i % 2 ? '#5cb43a' : '#68c444') + r(x, top + 12, 41, 8, '#4e9e30');
      o += r(x, top + 40, 41, 80, i % 3 ? '#7c5636' : '#8d6440') + r(x, top + 120, 41, 600, i % 2 ? '#80868c' : '#8d9399');
      if (R() < .35) o += r(x + 10, top + 150 + R() * 40, 12, 12, R() < .5 ? '#2e3236' : '#e0b070');
    });
    o += r(400, 600 - 4 * 40 + 6, 240, 40, '#3f7fd8', 0, 'opacity=".9"') + r(400, 600 - 4 * 40 + 6, 240, 6, '#a6d4ff', 0, 'opacity=".7"');
    [[2, 7], [6, 8], [17, 8], [21, 8]].forEach(function (q) {
      var x = q[0] * 40, top = 600 - q[1] * 40;
      o += r(x, top - 160, 40, 160, '#6b4a2a') + r(x + 8, top - 160, 8, 160, '#80592f');
      o += r(x - 80, top - 280, 200, 130, '#3f8a2a') + r(x - 40, top - 330, 120, 50, '#4a9a32') + r(x - 60, top - 280, 60, 30, '#56aa3a');
    });
    o += r(720, 600 - 8 * 40 - 120, 160, 120, '#a77a48') + r(720, 600 - 8 * 40 - 120, 160, 10, '#8a6038');
    o += p([[700, 600 - 8 * 40 - 120], [800, 600 - 8 * 40 - 200], [900, 600 - 8 * 40 - 120]], '#6b4a2a');
    o += r(760, 600 - 8 * 40 - 90, 34, 34, '#ffd36a') + r(820, 600 - 8 * 40 - 70, 36, 70, '#5a3b20');
    o += c(777, 600 - 8 * 40 - 73, 60, '#ffcf60', 'opacity=".25"');
    o += K.cube(300, 330, 40, 23, 46, 3, 0) + K.cube(640, 300, 34, 20, 40, 5, 0);
    o += r(560, 520, 12, 26, '#7a5530') + r(558, 508, 16, 14, '#ffcc4a') + c(566, 514, 50, '#ffb030', 'opacity=".3"');
    return o;
  }
};
