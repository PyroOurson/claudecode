(function () {
  function face(cx, cy, s, o2) {
    var sk2 = o2.skin, hr = o2.hair, o = '';
    o += g('translate(' + cx + ',' + cy + ') scale(' + s + ')',
      d('M-40 60 C-40 30 -20 22 0 22 C20 22 40 30 40 60 Z', o2.shirt) +
      r(-9, 8, 18, 20, sk2, 6) +
      (o2.style === 'long' ? d('M-34 -12 C-36 -46 36 -46 34 -12 L36 34 L-36 34 Z', hr) : '') +
      e(0, -8, 27, 31, sk2) + e(-27, -6, 6, 9, sk2) + e(27, -6, 6, 9, sk2) +
      (o2.style === 'bald' ? d('M-26 -14 C-30 -30 -22 -36 -18 -36 L-22 -8 Z M26 -14 C30 -30 22 -36 18 -36 L22 -8 Z', hr) : '') +
      (o2.style === 'short' ? d('M-28 -10 C-32 -46 32 -46 28 -10 C22 -26 -8 -30 -28 -10 Z', hr) : '') +
      (o2.style === 'long' ? d('M-28 -6 C-30 -44 30 -44 28 -6 C18 -30 -18 -30 -28 -6 Z', hr) : '') +
      (o2.style === 'curly' ? rep(7, function (i) { var a = (200 + i * 23) * Math.PI / 180; return c(Math.cos(a) * 26, -12 + Math.sin(a) * 26, 11, hr); }) : '') +
      (o2.hat ? d('M-34 -22 L34 -22 L28 -30 C24 -52 -24 -52 -28 -30 Z', o2.hat) + r(-36, -26, 72, 7, '#222', 3, 'opacity=".25"') : '') +
      c(-10, -6, 3.6, '#222') + c(10, -6, 3.6, '#222') + sk('M-15 -16 L-6 -15 M15 -16 L6 -15', hr, 3) +
      (o2.glasses ? c(-10, -6, 9, 'none', 'stroke="#222" stroke-width="3"') + c(10, -6, 9, 'none', 'stroke="#222" stroke-width="3"') + ln(-1, -6, 1, -6, '#222', 3) : '') +
      (o2.mous ? d('M-12 10 C-6 4 6 4 12 10 C6 8 -6 8 -12 10 Z', hr, 'stroke="' + hr + '" stroke-width="4"') : sk('M-9 9 Q0 16 9 9', '#8a3b2a', 3)) +
      e(-14, 4, 4, 2.5, '#ff7b7b', 'opacity=".45"') + e(14, 4, 4, 2.5, '#ff7b7b', 'opacity=".45"'));
    return o;
  }
  var PEOPLE = [
    { skin: '#f6c9a0', hair: '#e0a030', style: 'long', shirt: '#2f7df6' },
    { skin: '#c98a5e', hair: '#2a1a12', style: 'short', shirt: '#22b34c', glasses: 1 },
    { skin: '#f3d1b5', hair: '#8a8a8a', style: 'bald', shirt: '#b14cff', mous: 1 },
    { skin: '#8d5a3a', hair: '#1a1210', style: 'curly', shirt: '#ff8a1f' },
    { skin: '#f6c9a0', hair: '#c4421a', style: 'short', shirt: '#e8322c', hat: '#1f4fb8' },
    { skin: '#e9b48c', hair: '#5a3418', style: 'long', shirt: '#14b8a6', glasses: 1 }
  ];
  var BGS = ['#ffe08a', '#bfe3ff', '#ffc2d1', '#c9f2c0', '#e4d4ff', '#ffd6b0'];
  function card(x, y, w, h, i, down) {
    var id = uid('gw');
    if (down) return r(x, y + h - h * 0.22, w, h * 0.22, '#1f4fb8', 8) + r(x, y + h - h * 0.22, w, h * 0.08, '#4f86ff', 8);
    return r(x, y, w, h, '#fff', 10) + r(x + 6, y + 6, w - 12, h - 12, BGS[i % 6], 7) + '<clipPath id="' + id + '"><rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (w - 12) + '" height="' + (h - 12) + '" rx="7"/></clipPath>' + '<g clip-path="url(#' + id + ')">' + face(x + w / 2, y + h * 0.5, w / 92, PEOPLE[i % 6]) + '</g>' + r(x + 10, y + 10, w * 0.4, 8, '#fff', 4, 'opacity=".6"');
  }
  function frame(x, y, w, h, f, dk) { return r(x + 6, y + 14, w, h, '#000', 26, 'opacity=".3"') + r(x, y + 10, w, h, dk, 26) + r(x, y, w, h, f, 26) + r(x + 14, y + 8, w - 28, 12, '#fff', 6, 'opacity=".25"'); }
  G['guess-who'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#ffd23f', '#ff9f1a'], 0, 0, 1, 1));
      o += frame(20, 28, 360, 344, '#e8322c', '#9e1914');
      var w = 104, h = 146, gx = 12;
      for (var k = 0; k < 6; k++) { var i = k % 3, j = Math.floor(k / 3); o += r(38 + i * (w + gx), 46 + j * (h + 12), w, h, '#9e1914', 10); o += card(38 + i * (w + gx), 46 + j * (h + 12), w, h, k, k === 2); }
      o += t(322, 150, '?', 104, '#ffd23f', { w: 900, st: '#5a0c0a', sw: 10 });
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2d6ff0', '#173f9e']));
      o += frame(30, 40, 900, 520, '#2d6ff0', '#173f9e');
      var w = 100, h = 140;
      for (var k = 0; k < 24; k++) { var i = k % 8, j = Math.floor(k / 8); if (j > 2) break; o += card(60 + i * 106, 64 + j * 162, w, h, k * 5 + j, k % 5 === 3); }
      return o;
    }
  };
})();
