(function () {
  var L = { r: '#ff3b5c', b: '#2f86ff', g: '#2ee07a', y: '#ffd21f', p: '#b65cff', o: '#ff8a2a', c: '#25d8f0' };
  function tube(x, y, w, h, layers, rot, done, inv) {
    var id = uid('ws'), lh = (h - w * 0.4) / 4, o = '', path = 'M' + (-w / 2) + ' 0 L' + (-w / 2) + ' ' + (h - w / 2) + ' A' + w / 2 + ' ' + w / 2 + ' 0 0 0 ' + (w / 2) + ' ' + (h - w / 2) + ' L' + (w / 2) + ' 0 Z';
    var inner = '';
    layers.split('').forEach(function (k, i) { var top = inv ? i * lh - w : h - (i + 1) * lh; inner += r(-w / 2, top, w, lh + (i === 0 ? w : 1), L[k]) + r(-w / 2, inv ? top + lh + w - lh * 0.16 : top, w, lh * 0.16, '#fff', 0, 'opacity=".25"'); });
    o += '<clipPath id="' + id + '"><path d="' + path + '"/></clipPath>';
    o += d(path, '#000', 'opacity=".3" transform="translate(6,10)"') + d(path, '#dff1ff', 'opacity=".22"') + '<g clip-path="url(#' + id + ')">' + inner + r(w * 0.12, 0, w * 0.18, h, '#000', 0, 'opacity=".12"') + '</g>';
    o += d(path, 'none', 'stroke="#eaf6ff" stroke-width="' + w * 0.09 + '"') + r(-w * 0.32, h * 0.08, w * 0.14, h * 0.7, '#fff', w * 0.07, 'opacity=".55"') + r(-w / 2 - w * 0.12, -w * 0.08, w * 1.24, w * 0.18, '#eaf6ff', w * 0.09);
    if (done) o += c(0, -w * 0.55, w * 0.32, '#2ee07a') + sk('M' + (-w * 0.14) + ' ' + (-w * 0.55) + ' L' + (-w * 0.03) + ' ' + (-w * 0.44) + ' L' + (w * 0.16) + ' ' + (-w * 0.68), '#fff', w * 0.08);
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  G['water-sort'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#5b3cc4', '#2a1a6e'], 0, 0, 1, 1));
      o += c(200, 230, 180, rg([['#8a6cff', 0], ['#5b3cc4', 1]]), 'opacity=".5"');
      o += tube(70, 100, 66, 262, 'rbyr', 0) + tube(152, 100, 66, 262, 'gggg', 0, 1) + tube(234, 196, 66, 166, 'byr', 0) + tube(318, 196, 66, 166, 'opo', 0);
      o += sk('M236 150 C234 170 234 185 234 236', L.r, 12) + sk('M233 160 L232 230', '#fff', 3, 'opacity=".5"') + tube(244, 142, 56, 150, 'r', -146, 0, 1);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#4a2fb0', '#1e1258']));
      o += r(0, 500, 960, 100, '#2a1a6e') + r(0, 496, 960, 10, '#8a6cff');
      var T = ['rbgy', 'pyob', 'gggg', 'ocrp', 'bbyy', 'rcpo', 'yyy', 'cc'];
      T.forEach(function (lay, i) { o += tube(80 + i * 115, 160, 76, 330, lay, 0, lay === 'gggg'); });
      return o;
    }
  };
})();
