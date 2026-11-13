(function () {
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var TC = { r: '#e0262f', b: '#1f5fd0', k: '#16181f', o: '#f08a12' };
  function tile(x, y, w, h, n, col, rot) {
    var o = r(-w / 2 + 5, -h / 2 + 8, w, h, '#000', w * 0.16, 'opacity=".3"') + r(-w / 2, -h / 2, w, h, '#d8cdb0', w * 0.16) + r(-w / 2, -h / 2, w, h - h * 0.07, lg(['#fffdf4', '#f1e8d0']), w * 0.16);
    if (n === 'J') o += c(0, -h * 0.06, w * 0.3, 'none', 'stroke="' + TC.r + '" stroke-width="' + w * 0.07 + '"') + c(-w * 0.1, -h * 0.1, w * 0.04, TC.r) + c(w * 0.1, -h * 0.1, w * 0.04, TC.r) + sk('M' + (-w * 0.14) + ' ' + (-h * 0.0) + ' Q0 ' + h * 0.1 + ' ' + w * 0.14 + ' 0', TC.r, w * 0.05);
    else o += t(0, h * 0.12, n, w * (n.length > 1 ? 0.5 : 0.62), TC[col], { ls: -2 });
    o += c(0, h * 0.3, w * 0.07, TC[col] || TC.r, 'opacity=".9"') + r(-w / 2 + w * 0.1, -h / 2 + h * 0.05, w * 0.8, h * 0.12, '#fff', w * 0.06, 'opacity=".6"');
    return g('translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')', o);
  }
  function rack(x, y, w) { return r(x + 6, y + 10, w, 70, '#000', 10, 'opacity=".3"') + r(x, y, w, 70, lg(['#c8894a', '#7a4a1e']), 10) + r(x, y, w, 12, '#e0a868', 6) + r(x, y + 40, w, 6, '#5a3010', 3, 'opacity=".5"'); }
  G['rummikub'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, rg([['#8adcff', 0], ['#3a9ae8', 0.6], ['#163e8a', 1]], 0.45, 0.3, 0.85));
      o += tile(112, 112, 84, 116, '11', 'k', -10) + tile(200, 98, 84, 116, '12', 'k', 0) + tile(288, 112, 84, 116, '13', 'k', 10);
      o += tile(72, 262, 84, 116, '7', 'r') + tile(158, 262, 84, 116, '7', 'b') + tile(244, 262, 84, 116, '7', 'o') + tile(330, 262, 84, 116, 'J', 'r');
      o += rack(10, 300, 380);
      return o + gloss();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg(['#4ab0f0', '#0e2e6a'], 0.5, 0.45, 0.8));
      var rows = [[[3, 'r'], [4, 'r'], [5, 'r'], [6, 'r']], [[9, 'b'], [9, 'k'], [9, 'o']], [[10, 'o'], [11, 'o'], [12, 'o'], [13, 'o'], [1, 'b']], [[2, 'k'], [2, 'r'], [2, 'b'], [2, 'o']]];
      rows.forEach(function (row, j) { row.forEach(function (q, i) { o += tile(120 + i * 74 + (j % 2) * 380, 110 + Math.floor(j / 2) * 170 + (j % 2) * 40, 66, 92, '' + q[0], q[1]); }); });
      o += rack(140, 500, 680) + rep(9, function (i) { return tile(190 + i * 72, 470, 64, 88, '' + (i + 3), ['r', 'b', 'k', 'o'][i % 4]); });
      return o;
    }
  };
})();
