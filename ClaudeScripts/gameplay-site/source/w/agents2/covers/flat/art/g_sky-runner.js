G['sky-runner'] = (function () {
  var INK = '#12224a';
  function coin(x, y, rr) {
    return c(x + rr * 0.15, y + rr * 0.2, rr, '#000', 'opacity=".2"') + c(x, y, rr, lg(['#ffe36a', '#ffc21a', '#e09a00']), 'stroke="#a86a00" stroke-width="' + (rr * 0.16).toFixed(1) + '"') + c(x, y, rr * 0.62, 'none', 'stroke="#d98a00" stroke-width="' + (rr * 0.12).toFixed(1) + '"') + star(x, y, rr * 0.42, rr * 0.18, 5, '#fff3a8') + e(x - rr * 0.35, y - rr * 0.42, rr * 0.28, rr * 0.16, '#fff', 'opacity=".7"');
  }
  function trainFront(x, y, w, h, body, stripe) {
    var o = r(x + w * 0.06, y + h * 0.04, w, h, '#000', w * 0.14, 'opacity=".22"');
    o += r(x, y, w, h, lg([shade2(body, 0.12), body, shade2(body, -0.18)]), w * 0.14, 'stroke="' + INK + '" stroke-width="' + (w * 0.035).toFixed(1) + '"');
    o += r(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.34, lg(['#d4ecff', '#8fc4ea']), w * 0.07, 'stroke="' + INK + '" stroke-width="' + (w * 0.025).toFixed(1) + '"');
    o += d('M' + (x + w * 0.16) + ' ' + (y + h * 0.4) + 'L' + (x + w * 0.42) + ' ' + (y + h * 0.13) + 'H' + (x + w * 0.56) + 'L' + (x + w * 0.3) + ' ' + (y + h * 0.4) + 'Z', '#fff', 'opacity=".45"');
    o += r(x, y + h * 0.56, w, h * 0.12, stripe);
    o += c(x + w * 0.2, y + h * 0.8, w * 0.07, '#fff6c0', 'stroke="' + INK + '" stroke-width="' + (w * 0.02).toFixed(1) + '"') + c(x + w * 0.8, y + h * 0.8, w * 0.07, '#fff6c0', 'stroke="' + INK + '" stroke-width="' + (w * 0.02).toFixed(1) + '"');
    o += r(x + w * 0.38, y + h * 0.76, w * 0.24, h * 0.1, '#2a3446', w * 0.03);
    return o;
  }
  function shade2(hex, k) {
    var n = parseInt(hex.slice(1), 16), rr = n >> 16, gg = (n >> 8) & 255, bb = n & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); };
    return '#' + ((1 << 24) + (f(rr) << 16) + (f(gg) << 8) + f(bb)).toString(16).slice(1);
  }
  function tracks(W, H, hz, vx, lanes, spread) {
    var o = p([[vx - W * 0.09, hz], [vx + W * 0.09, hz], [W * (0.5 + spread), H], [W * (0.5 - spread), H]], lg(['#b9ab96', '#a99b88', '#8c7e6c']));
    var bot = function (f) { return W * (0.5 - spread) + f * W * spread * 2; };
    var top = function (f) { return vx - W * 0.09 + f * W * 0.18; };
    for (var k = 0; k < 14; k++) {
      var tt = Math.pow(k / 13, 1.9), yy = hz + (H - hz) * tt, xl = top(0) + (bot(0) - top(0)) * tt, xr = top(1) + (bot(1) - top(1)) * tt;
      o += r(xl, yy, xr - xl, 2 + tt * H * 0.03, '#6b4a32', 1);
    }
    for (var l = 0; l < lanes; l++) {
      [-0.32, 0.32].forEach(function (off) {
        var f = (l + 0.5 + off) / lanes;
        o += sk('M' + top(f) + ' ' + hz + 'L' + bot(f) + ' ' + H, '#5e6672', 4 + spread * 6) + sk('M' + top(f) + ' ' + hz + 'L' + bot(f) + ' ' + H, '#e3e7ec', 2 + spread * 4);
      });
    }
    return o;
  }
  function city(W, hz, seed, cols) {
    var R = rnd(seed), o = '', x = -10;
    while (x < W) {
      var w = 40 + R() * 70, h = 50 + R() * 120, col = cols[Math.floor(R() * cols.length)];
      o += r(x, hz - h, w, h + 4, col) + rep(Math.floor(h / 26), function (j) { return rep(Math.floor(w / 22), function (i) { return r(x + 7 + i * 22, hz - h + 10 + j * 26, 10, 13, '#a9d4ef', 1, 'opacity=".75"'); }); });
      x += w + 2;
    }
    return o;
  }
  return {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2f8fe8', '#7fc8ff', '#e3f4ff']));
      o += c(70, 70, 70, '#fff6d0', 'opacity=".35"') + c(70, 70, 34, '#fffbe8', 'opacity=".7"');
      o += city(400, 205, 7, ['#9bb7d4', '#b3c9e0', '#8aa6c6']);
      o += r(0, 196, 400, 14, '#c9c2b6');
      o += tracks(400, 400, 200, 200, 3, 0.62);
      o += trainFront(6, 128, 112, 150, '#ef6a2c', '#b8d636');
      o += coin(330, 132, 13) + coin(342, 170, 17) + coin(355, 220, 22);
      o += d('M58 400 Q66 318 146 300 L286 300 Q362 316 372 400 Z', lg(['#ffffff', '#e6e2d8']), 'stroke="' + INK + '" stroke-width="7"');
      o += d('M74 400 Q80 336 140 314 L160 400 Z', lg(['#8cc0f0', '#5f98d4']), 'stroke="' + INK + '" stroke-width="5"') + d('M356 400 Q350 334 292 314 L272 400 Z', lg(['#8cc0f0', '#5f98d4']), 'stroke="' + INK + '" stroke-width="5"');
      o += d('M162 300 Q215 336 270 300', 'none', 'stroke="#a7abb2" stroke-width="16" stroke-linecap="round"');
      o += r(190, 268, 52, 42, '#d99c72', 10);
      o += c(132, 226, 20, '#e9b48a', 'stroke="' + INK + '" stroke-width="6"') + c(300, 226, 20, '#e9b48a', 'stroke="' + INK + '" stroke-width="6"');
      o += e(216, 214, 88, 94, rg([['#f7cfa6', 0], ['#e9b48a', 0.6], ['#d39a70', 1]], 0.38, 0.32, 0.8), 'stroke="' + INK + '" stroke-width="7"');
      o += d('M136 176 Q132 196 140 210 L150 178 Z', '#5a3420') + d('M296 176 Q300 196 292 210 L282 178 Z', '#5a3420');
      o += d('M126 186 Q124 96 216 92 Q308 96 306 186 Q216 166 126 186 Z', lg(['#ff5a4a', '#d8322c', '#a81e1e']), 'stroke="' + INK + '" stroke-width="7"');
      o += d('M178 106 Q216 92 254 106 L248 150 Q216 140 184 150 Z', lg(['#ffe25a', '#ffc21a']), 'stroke="' + INK + '" stroke-width="5"');
      o += c(216, 94, 9, '#ffd23f', 'stroke="' + INK + '" stroke-width="4"');
      o += d('M236 178 Q306 150 366 178 Q352 204 240 198 Z', lg(['#e5443a', '#a81e1e']), 'stroke="' + INK + '" stroke-width="7"');
      o += d('M150 118 Q168 100 196 100', 'none', 'stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"');
      o += sk('M160 196 Q180 184 202 192', '#5a3420', 9) + sk('M232 192 Q254 184 274 196', '#5a3420', 9);
      o += e(181, 226, 23, 28, '#fff', 'stroke="' + INK + '" stroke-width="5"') + e(252, 226, 23, 28, '#fff', 'stroke="' + INK + '" stroke-width="5"');
      o += c(188, 231, 13, '#3a2a1e') + c(259, 231, 13, '#3a2a1e') + c(193, 224, 5, '#fff') + c(264, 224, 5, '#fff');
      o += e(220, 256, 11, 8, '#cf8c62');
      o += e(160, 266, 15, 9, '#ff7a6a', 'opacity=".45"') + e(274, 266, 15, 9, '#ff7a6a', 'opacity=".45"');
      o += d('M176 272 Q218 322 264 270 Q218 284 176 272 Z', '#7a1a1a', 'stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"');
      o += d('M184 276 Q218 288 256 274 L252 284 Q218 294 188 286 Z', '#fff');
      o += e(222, 300, 16, 7, '#ff6a6a');
      o += d('M0 0H400V150Q200 110 0 190Z', '#fff', 'opacity=".1"');
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2f8fe8', '#8fd0ff', '#e3f4ff']));
      o += city(960, 270, 3, ['#c4553f', '#d9a066', '#8e6a5a', '#e3cfa8', '#6f8fb0']);
      o += r(0, 262, 960, 20, '#c9c2b6');
      o += tracks(960, 600, 262, 480, 3, 0.46);
      o += trainFront(120, 230, 170, 230, '#f5c21f', '#e2412c');
      o += trainFront(668, 250, 150, 200, '#3f7fd0', '#f2f2f2');
      o += rep(6, function (i) { var tt = Math.pow((i + 1) / 7, 1.6); return coin(480, 280 + tt * 300, 6 + tt * 26); });
      o += r(0, 140, 960, 10, '#5a6270') + r(60, 140, 12, 160, '#5a6270') + r(888, 140, 12, 160, '#5a6270');
      o += sk('M0 60 Q480 100 960 60', '#2a2f3a', 3) + sk('M0 90 Q480 130 960 90', '#2a2f3a', 3);
      return o;
    }
  };
})();
