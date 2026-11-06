(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var PC = [['#e8333f', '#a8121f'], ['#2a6af0', '#163ea8'], ['#2fbf5a', '#18803a'], ['#ffc21a', '#d0860a']];
  function pcard(x, y, w, h, rot, n, k) {
    var o = r(-w / 2 + 7, -h / 2 + 10, w, h, '#000', w * 0.12, 'opacity=".3"') + r(-w / 2, -h / 2, w, h, '#fff', w * 0.12) + r(-w / 2 + w * 0.07, -h / 2 + w * 0.07, w * 0.86, h - w * 0.14, lg([PC[k][0], PC[k][1]]), w * 0.08);
    o += e(0, 0, w * 0.36, h * 0.32, '#fff', 'transform="rotate(-20)" opacity=".2"');
    o += t(0, h * 0.16, n, w * (n.length > 1 ? 0.56 : 0.72), '#fff', { font: 'Lilita One', st: '#16181f', sw: w * 0.05 }) + t(-w * 0.28, -h * 0.3, n, w * 0.2, '#fff', { font: 'Lilita One' });
    o += d('M' + (-w / 2 + w * 0.12) + ' ' + (-h / 2) + ' H' + (w / 2 - w * 0.12) + ' L' + (-w / 2) + ' ' + (h * 0.05) + ' V' + (-h / 2 + w * 0.12) + ' Z', '#fff', 'opacity=".22"');
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  G['phase-10'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#3a4ec8', 0], ['#18237a', 0.6], ['#080c34', 1]], 0.45, 0.3, 0.85));
      o += pcard(92, 250, 120, 172, -14, '7', 0) + pcard(162, 220, 120, 172, -5, '8', 1) + pcard(234, 196, 120, 172, 4, '9', 2) + pcard(300, 178, 140, 200, 12, '10', 3);
      o += c(88, 92, 54, '#000', 'opacity=".3"') + c(84, 86, 54, lg(['#6af08a', '#18a040'])) + c(84, 86, 54, 'none', 'stroke="#fff" stroke-width="7"') + sk('M60 88 L78 106 L110 68', '#fff', 14) + e(70, 62, 26, 12, '#fff', 'opacity=".3"');
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#2a3aa8', '#060a2a'], 0.5, 0.45, 0.8));
      ['1', '2', '3', '4', '5'].forEach(function (n, i) { o += pcard(150 + i * 90, 190, 100, 144, 0, n, i % 4); });
      ['6', '6', '6'].forEach(function (n, i) { o += pcard(620 + i * 90, 190, 100, 144, 0, n, (i + 1) % 4); });
      ['11', '12', '12', '9', '3', '7'].forEach(function (n, i) { o += pcard(250 + i * 92, 450, 100, 144, (i - 2.5) * 5, n, (i + 2) % 4); });
      return o;
    }
  };
})();
