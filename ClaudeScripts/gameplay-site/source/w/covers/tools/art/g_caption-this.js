(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var OL = '#2a2238';
  function cat(x, y, s) {
    var o = '';
    o += d('M-100 140 C-100 40 -80 0 0 0 C80 0 100 40 100 140 Z', '#f08a36', 'stroke="' + OL + '" stroke-width="6"');
    o += p([[-92, -70], [-80, -150], [-24, -98]], '#f08a36', 'stroke="' + OL + '" stroke-width="6" stroke-linejoin="round"') + p([[92, -70], [80, -150], [24, -98]], '#f08a36', 'stroke="' + OL + '" stroke-width="6" stroke-linejoin="round"');
    o += p([[-78, -86], [-72, -128], [-42, -98]], '#ffb4b4') + p([[78, -86], [72, -128], [42, -98]], '#ffb4b4');
    o += e(0, -40, 104, 84, '#f08a36', 'stroke="' + OL + '" stroke-width="6"');
    o += sk('M-24 -114 l6 22 M0 -120 v24 M24 -114 l-6 22', '#c4611c', 6);
    o += e(0, -8, 50, 34, '#fff3e0');
    [-44, 46].forEach(function (ex) {
      o += c(ex, -50, 24, '#fff', 'stroke="' + OL + '" stroke-width="5"') + c(ex + 10, -46, 12, OL) + c(ex + 7, -50, 4, '#fff');
      o += '<path d="M' + (ex - 25) + ' -74 h50 v24 h-50 Z" fill="#f08a36"/>' + sk('M' + (ex - 24) + ' -51 L' + (ex + 24) + ' -51', OL, 5);
    });
    o += sk('M-70 -82 L-20 -70 M24 -74 L72 -90', OL, 7);
    o += p([[-8, -20], [8, -20], [0, -10]], '#ff7a8a', 'stroke="' + OL + '" stroke-width="4" stroke-linejoin="round"');
    o += sk('M-15 12 Q0 2 15 12', OL, 5);
    o += sk('M-60 -8 L-116 -18 M-60 2 L-114 8 M60 -8 L118 -18 M60 2 L116 8', OL, 3.5);
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function meme(x, y, w, h, rot, top, bot, sc) {
    var id = uid('mc'), o = '';
    _defs += '<clipPath id="' + id + '"><rect x="0" y="0" width="' + w + '" height="' + h + '" rx="10"/></clipPath>';
    var inner = r(0, 0, w, h, lg(['#ffe7a8', '#f5c46e'])) + rep(6, function (i) { return r(i * w / 6 + 6, 0, w / 14, h * 0.7, '#fff', 0, 'opacity=".18"'); });
    inner += r(0, h * 0.74, w, h * 0.26, lg(['#b56b3a', '#8a4a24']));
    inner += cat(w * 0.5, h * 0.58, sc);
    var tf = function (txt, ty, size) { return t(w / 2, ty, txt, size, '#fff', { font: "Impact, Anton, 'Arial Black', sans-serif", w: 400, st: '#000', sw: size * 0.16, ls: 1 }); };
    inner += tf(top, h * 0.21, h * 0.2) + tf(bot, h * 0.96, h * 0.2);
    o += r(8, 12, w, h, '#000', 10, 'opacity=".35"');
    o += r(-10, -10, w + 20, h + 20, '#fff', 14) + '<g clip-path="url(#' + id + ')">' + inner + '</g>';
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  function face(x, y, R, col, k) {
    var o = c(x + 3, y + 5, R, '#000', 'opacity=".3"') + c(x, y, R, col) + c(x, y, R * 0.82, '#fff', 'opacity=".22"');
    if (k === 2) o += star(x - R * 0.34, y - R * 0.18, R * 0.22, R * 0.1, 5, '#fff') + star(x + R * 0.34, y - R * 0.18, R * 0.22, R * 0.1, 5, '#fff') + d('M' + (x - R * 0.5) + ' ' + (y + R * 0.15) + ' Q' + x + ' ' + (y + R * 0.9) + ' ' + (x + R * 0.5) + ' ' + (y + R * 0.15) + ' Z', '#fff');
    else o += c(x - R * 0.3, y - R * 0.15, R * 0.1, '#fff') + c(x + R * 0.3, y - R * 0.15, R * 0.1, '#fff') + sk('M' + (x - R * 0.4) + ' ' + (y + R * 0.25) + ' Q' + x + ' ' + (y + R * 0.6) + ' ' + (x + R * 0.4) + ' ' + (y + R * 0.25), '#fff', R * 0.1);
    return o;
  }
  G['caption-this'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#9a4fe0', 0], ['#6a2fb8', 0.55], ['#3a1464', 1]], 0.4, 0.3, 0.9));
      o += rep(12, function (i) { var a = i * 30; return p([[200, 200], [200 + Math.cos((a - 6) * Math.PI / 180) * 400, 200 + Math.sin((a - 6) * Math.PI / 180) * 400], [200 + Math.cos((a + 6) * Math.PI / 180) * 400, 200 + Math.sin((a + 6) * Math.PI / 180) * 400]], '#fff', 'opacity=".08"'); });
      o += meme(70, 82, 260, 210, -5, 'ME AT LUNCH', 'NO VEGGIES', 0.7);
      o += face(318, 318, 44, '#e8364d', 2) + face(250, 336, 30, '#f09a10', 1);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#8a3fd0', '#2a1650'], 0.5, 0.45, 0.85));
      o += meme(330, 150, 300, 240, -5, 'ME AT LUNCH', 'NO VEGGIES', 0.8);
      o += face(170, 200, 70, '#3d8be0', 1) + face(800, 380, 80, '#e8364d', 2) + face(160, 440, 60, '#2fae55', 1) + face(800, 150, 56, '#f09a10', 1);
      return o;
    }
  };
})();
