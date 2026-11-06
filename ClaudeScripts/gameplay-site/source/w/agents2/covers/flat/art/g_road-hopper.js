G['road-hopper'] = {
  iso: function (ox, oy, A, B, H) {
    var P = function (i, j, z) { return [ox + (i - j) * A, oy + (i + j) * B - (z || 0) * H]; };
    var q = function (pts) { return pts.map(function (v) { return v[0].toFixed(1) + ',' + v[1].toFixed(1); }).join(' '); };
    return {
      P: P,
      quad: function (i0, j0, i1, j1, f, x2) { return p(q([P(i0, j0), P(i1, j0), P(i1, j1), P(i0, j1)]), f, x2); },
      box: function (i, j, z, w, d, h, top, left, right, hi) {
        var a0 = P(i, j, z + h), a1 = P(i + w, j, z + h), a2 = P(i + w, j + d, z + h), a3 = P(i, j + d, z + h), b1 = P(i + w, j, z), b2 = P(i + w, j + d, z), b3 = P(i, j + d, z);
        var s = p(q([a3, a2, b2, b3]), left) + p(q([a2, a1, b1, b2]), right) + p(q([a0, a1, a2, a3]), top);
        if (hi) s += sk('M' + a3.join(',') + 'L' + a0.join(',') + 'L' + a1.join(','), hi, 2.5, 'opacity=".7"');
        return s;
      }
    };
  },
  chick: function (I, i, j, s) {
    s = s || 1;
    var o = '', W = ['#ffffff', '#e6e9f1', '#c3cada'];
    var bx = function (a, b, z, w, d, h, c, hi) { o += I.box(i + a * s, j + b * s, z * s, w * s, d * s, h * s, c[0], c[1], c[2], hi); };
    bx(.45, 1.7, 0, .32, .32, .9, ['#ffb03a', '#ff9f1c', '#d97e06']);
    bx(1.4, 1.7, 0, .32, .32, .9, ['#ffb03a', '#ff9f1c', '#d97e06']);
    bx(.7, -.45, 2.1, 1.0, .5, .7, W);
    bx(0, 0, .9, 2.2, 2.2, 1.8, W, '#ffffff');
    bx(2.2, .55, 1.25, .22, 1.2, .9, ['#eef1f7', '#d6dbe6', '#aeb6c8']);
    bx(.2, .8, 2.7, 1.8, 1.4, 1.5, W, '#ffffff');
    bx(.8, 1.05, 4.2, .62, .85, .55, ['#ff6f7d', '#ff3b4e', '#c9182c']);
    bx(.82, 2.2, 3.15, .58, .55, .42, ['#ffc35a', '#ff9f1c', '#d97e06']);
    bx(.97, 2.2, 2.72, .28, .3, .42, ['#ff6f7d', '#ff3b4e', '#c9182c']);
    bx(.32, 2.2, 3.55, .28, .06, .4, ['#1d1b26', '#1d1b26', '#1d1b26']);
    bx(1.62, 2.2, 3.55, .28, .06, .4, ['#1d1b26', '#1d1b26', '#1d1b26']);
    bx(.36, 2.26, 3.8, .1, .02, .12, ['#ffffff', '#ffffff', '#ffffff']);
    bx(1.66, 2.26, 3.8, .1, .02, .12, ['#ffffff', '#ffffff', '#ffffff']);
    return o;
  },
  car: function (I, i, j, col, dk, lt) {
    var o = '';
    o += I.box(i, j, .25, 3.2, 1.7, .9, lt, col, dk, lt);
    o += I.box(i + .7, j + .1, 1.15, 1.7, 1.5, .75, '#9fb4d8', '#34466a', '#24324e');
    o += I.box(i + .65, j + .05, 1.9, 1.8, 1.6, .14, lt, col, dk);
    o += I.box(i + .3, j + 1.62, .0, .7, .14, .55, '#2b2d42', '#1d1b26', '#1d1b26');
    o += I.box(i + 2.2, j + 1.62, .0, .7, .14, .55, '#2b2d42', '#1d1b26', '#1d1b26');
    o += I.box(i + 3.15, j + .25, .55, .08, .35, .25, '#fffbd0', '#fff3a0', '#fff3a0');
    o += I.box(i + 3.15, j + 1.1, .55, .08, .35, .25, '#fffbd0', '#fff3a0', '#fff3a0');
    return o;
  },
  tree: function (I, i, j, h, c) {
    return I.box(i + .3, j + .3, 0, .5, .5, .6, '#8a5a3c', '#6b4630', '#523422') + I.box(i, j, .6, 1.1, 1.1, h, shade(c, 1.12), c, shade(c, .78), shade(c, 1.3));
  },
  log: function (I, i, j, L) {
    return I.box(i, j, -.2, L, 1, .45, '#c48a52', '#9a6538', '#7f4f2a') + I.box(i + L - .05, j + .1, -.15, .06, .8, .35, '#e9c08c', '#e9c08c', '#d6a96c');
  },
  ground: function (I, lanes, i0, i1) {
    var o = '';
    lanes.forEach(function (L) {
      o += I.quad(i0, L[0], i1, L[1], L[2]);
      if (L[3] === 'road') for (var x = i0; x < i1; x += 2.2) o += I.quad(x, (L[0] + L[1]) / 2 - .08, x + 1.2, (L[0] + L[1]) / 2 + .08, '#eef1f5');
      if (L[3] === 'water') for (var y = 0; y < 6; y++) o += I.quad(i0 + 2 + y * 3.1, L[0] + .6 + (y % 3) * .9, i0 + 3.2 + y * 3.1, L[0] + .7 + (y % 3) * .9, '#a8ecff');
      if (L[3] === 'rail') { for (var t = i0; t < i1; t += .8) o += I.quad(t, L[0] + .15, t + .3, L[1] - .15, '#7a5236'); o += I.quad(i0, L[0] + .45, i1, L[0] + .58, '#e6eaf0') + I.quad(i0, L[1] - .58, i1, L[1] - .45, '#e6eaf0'); }
    });
    return o;
  },
  icon: function () {
    var K = G['road-hopper'];
    var o = r(0, 0, 400, 400, lg(['#b7ef7a', '#7fd14f']));
    var I = K.iso(184, 244, 40, 20, 38);
    o += K.ground(I, [[-12, -5.0, '#a2e05f'], [-5.0, -.8, '#555a67', 'road'], [-.8, 3.4, '#9fdf5c'], [3.4, 3.55, '#d8f4ff'], [3.55, 9, '#55c9f5', 'water']], -12, 12);
    o += I.quad(-12, -5.0, 12, -4.85, '#d0d4dc') + I.quad(-12, -.95, 12, -.8, '#d0d4dc');
    o += K.car(I, -5.9, -3.3, '#ff4d4d', '#b8323a', '#ff8a8a');
    o += sk('M44 112l-30 15M60 134l-40 20M40 160l-26 13', '#ffffff', 6, 'opacity=".85"');
    o += K.log(I, -6.5, 4.4, 4.2);
    var sh = I.P(1.1, 1.3);
    o += e(sh[0] + 6, sh[1] + 30, 96, 30, '#1d3a10', 'opacity=".28"');
    o += K.chick(I, 0, 0, .92);
    var cs = I.P(4.35, 1.45);
    o += e(cs[0], cs[1] + 6, 30, 10, '#1d3a10', 'opacity=".25"') + I.box(4, 1.2, 1.3, .7, .18, .78, '#fff3a0', '#ffd23f', '#e8a800', '#fff6c4') + I.box(4.22, 1.38, 1.52, .26, .04, .34, '#ffe25a', '#f0a500', '#f0a500');
    o += d('M0 0H400V40C300 70 160 150 0 170Z', '#ffffff', 'opacity=".13"');
    o += r(5, 5, 390, 390, 'none', 88, 'stroke="#ffffff" stroke-opacity=".25" stroke-width="4"');
    return o;
  },
  bg: function () {
    var K = G['road-hopper'];
    var o = r(0, 0, 960, 600, '#7fd14f');
    var I = K.iso(470, 180, 34, 17, 30);
    var lanes = [[-30, -17, '#9fdf5c'], [-17, -14, '#a39383', 'rail'], [-14, -10, '#55c9f5', 'water'], [-10, -7, '#a2e05f'], [-7, -1, '#555a67', 'road'], [-1, 4, '#99da58'], [4, 10, '#555a67', 'road'], [10, 13, '#a2e05f'], [13, 18, '#55c9f5', 'water'], [18, 30, '#9fdf5c']];
    o += K.ground(I, lanes, -30, 30);
    o += K.log(I, -8, -13, 4) + K.log(I, 2, -12, 3) + K.log(I, -16, 14, 4) + K.log(I, -4, 16, 3);
    o += K.car(I, -9, -6.5, '#3d8bff', '#245ec2', '#7cb2ff') + K.car(I, 3, -3.5, '#ffcf2e', '#d19e00', '#ffe27a');
    o += K.car(I, -2, 5, '#ff4d4d', '#b8323a', '#ff8a8a') + K.car(I, 9, 7.5, '#a55eea', '#7a3ec0', '#c99af5');
    for (var n = 0; n < 16; n++) {
      var ti = -20 + (n * 7.3) % 40, tj = [-9.5, -9.5, 1.2, 2.4, 11, 11.5, -20, -22][n % 8];
      o += K.tree(I, ti, tj, .8 + (n % 3) * .5, ['#93c83a', '#a5cf3a', '#7fb52e'][n % 3]);
    }
    o += K.chick(I, -1, 0.6, .55);
    return o;
  }
};
