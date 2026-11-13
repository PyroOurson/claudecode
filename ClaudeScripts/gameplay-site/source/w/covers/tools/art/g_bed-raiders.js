G['bed-raiders'] = {
  face: function (pts, cols, n, seed, x2) {
    var R = rnd(seed), a = pts[0], b = pts[1], dd = pts[3], o = '';
    var ux = (b[0] - a[0]) / n, uy = (b[1] - a[1]) / n, vx = (dd[0] - a[0]) / n, vy = (dd[1] - a[1]) / n;
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var f = typeof cols === 'function' ? cols(i, j, R()) : cols[(R() * cols.length) | 0];
      var x0 = a[0] + ux * i + vx * j, y0 = a[1] + uy * i + vy * j;
      o += p([[x0, y0], [x0 + ux + .4, y0 + uy], [x0 + ux + vx + .4, y0 + uy + vy + .4], [x0 + vx, y0 + vy + .4]], f);
    }
    return x2 ? '<g ' + x2 + '>' + o + '</g>' : o;
  },
  cube: function (cx, cy, s, top, left, right, seed, h) {
    var K = G['bed-raiders'], hh = (h || 1) * s;
    var T = [[cx, cy - s * 0.5], [cx + s, cy], [cx, cy + s * 0.5], [cx - s, cy]];
    var L = [[cx - s, cy], [cx, cy + s * 0.5], [cx, cy + s * 0.5 + hh], [cx - s, cy + hh]];
    var Rr = [[cx, cy + s * 0.5], [cx + s, cy], [cx + s, cy + hh], [cx, cy + s * 0.5 + hh]];
    return K.face(L, left, 8, seed + 3) + K.face(Rr, right, 8, seed + 5) + K.face(T, top, 8, seed);
  },
  icon: function () {
    var K = G['bed-raiders'];
    var o = r(0, 0, 400, 400, lg(['#9ad3ff', '#4f97f0', '#2d5fc8']));
    o += r(26, 46, 96, 26, '#fff', 0, 'opacity=".9"') + r(48, 30, 52, 20, '#fff', 0, 'opacity=".9"') + r(260, 70, 110, 24, '#fff', 0, 'opacity=".85"') + r(290, 54, 50, 20, '#fff', 0, 'opacity=".85"');
    var grassT = ['#6cb33f', '#5ea535', '#77c048', '#4f9a2c'], grassL = function (i, j, q) { return j < 2 || j === 2 && q < 0.5 ? ['#5ea535', '#4f9a2c'][(q * 2) | 0] : ['#8a5d3b', '#7a5132', '#6b442a'][(q * 3) | 0]; }, grassR = function (i, j, q) { return j < 2 || j === 2 && q < 0.5 ? ['#47852a', '#3c7424'][(q * 2) | 0] : ['#6b452b', '#5d3b24', '#523320'][(q * 3) | 0]; };
    var stoneL = ['#8a8a8a', '#7a7a7a', '#6f6f6f'], stoneR = ['#666', '#5a5a5a', '#555'];
    o += p([[110, 300], [290, 300], [200, 392]], '#4b4b52');
    o += K.cube(200, 272, 70, stoneL, stoneL, stoneR, 41, 0.9);
    var cells = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [0, 0]];
    var order = [[-1, -1], [0, -1], [-1, 0], [1, -1], [0, 0], [-1, 1], [1, 0], [0, 1], [1, 1]];
    order.forEach(function (q, k) { var a = q[0], b = q[1]; var cx = 200 + (a - b) * 58, cy = 196 + (a + b) * 29; o += K.cube(cx, cy, 58, grassT, grassL, grassR, 7 + k * 9, 1); });
    var bedC = function (top) { return function (i, j, q) { return top ? (j > 5 && i < 3 ? '#f4f4f4' : ['#ff4a4a', '#e83e3e', '#ff5a5a'][(q * 3) | 0]) : j < 3 ? '#f4f4f4' : j < 6 ? ['#ff4a4a', '#e83e3e'][(q * 2) | 0] : ['#7a5230', '#6b4428'][(q * 2) | 0]; }; };
    var bx = 200, by = 150, s = 46, hh = s * 0.6;
    var T = [[bx - s * 0.6, by - s * 0.55], [bx + s * 1.4, by + s * 0.45], [bx + s * 0.6, by + s * 0.85], [bx - s * 1.4, by - s * 0.15]];
    var L = [[bx - s * 1.4, by - s * 0.15], [bx + s * 0.6, by + s * 0.85], [bx + s * 0.6, by + s * 0.85 + hh], [bx - s * 1.4, by - s * 0.15 + hh]];
    var Rr = [[bx + s * 0.6, by + s * 0.85], [bx + s * 1.4, by + s * 0.45], [bx + s * 1.4, by + s * 0.45 + hh], [bx + s * 0.6, by + s * 0.85 + hh]];
    o += K.face(L, function (i, j, q) { return j < 3 ? '#e6e6e6' : j < 6 ? (q < .5 ? '#d33434' : '#c22c2c') : '#5e3f24'; }, 8, 77) + K.face(Rr, function (i, j, q) { return j < 3 ? '#cfcfcf' : j < 6 ? '#a82626' : '#4a301c'; }, 8, 78);
    o += K.face(T, bedC(true), 8, 79);
    var wool = ['#3f8cff', '#3580f0', '#4a96ff'], woolD = ['#2f6ccc', '#2862bb'];
    o += K.cube(96, 196, 40, wool, wool, woolD, 90, 1);
    o += g('translate(300,236) rotate(-8)', pix(['..............KK', '.............KWK', '............KWdK', '...........KWdK.', '..........KWdK..', '.........KWdK...', '........KWdK....', '..KK...KWdK.....', '..KgKKKWdK......', '...KggWdK.......', '....KgdK........', '...KhKKgK.......', '..KhK...KK......', '.KhK............', 'KhK.............', 'KK..............'], -64, -64, 8, { K: '#1d1d22', W: '#ffffff', d: '#c9ced6', g: '#6b4428', h: '#8a5a30' }));
    o += r(0, 0, 400, 400, lg([['rgba(255,255,255,.16)', 0], ['rgba(255,255,255,0)', 0.5], ['rgba(0,0,0,.14)', 1]]));
    return o;
  },
  bg: function () {
    var K = G['bed-raiders'], R = rnd(5);
    var o = r(0, 0, 960, 600, lg(['#9ad3ff', '#4f97f0', '#1e2a5a']));
    var grassT = ['#6cb33f', '#5ea535', '#77c048'], dirt = ['#8a5d3b', '#7a5132'], dirtD = ['#6b452b', '#5d3b24'];
    [[160, 330, 60], [480, 260, 80], [800, 340, 60], [330, 470, 40], [650, 470, 40]].forEach(function (q, k) {
      o += p([[q[0] - q[2] * 1.6, q[1] + q[2]], [q[0] + q[2] * 1.6, q[1] + q[2]], [q[0], q[1] + q[2] * 3]], '#3f3f46');
      for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) o += K.cube(q[0] + (a - b) * q[2] * 0.55, q[1] + (a + b) * q[2] * 0.27, q[2] * 0.55, grassT, dirt, dirtD, k * 31 + a * 7 + b, 1);
    });
    o += K.cube(480, 210, 30, ['#ff4a4a', '#e83e3e'], ['#d33434'], ['#a82626'], 9, 0.6);
    return o;
  }
};
