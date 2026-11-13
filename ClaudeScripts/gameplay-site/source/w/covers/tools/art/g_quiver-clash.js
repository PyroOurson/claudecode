(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function cliff(x, y, w, h) {
    return r(x, y, w, h, '#586882') + r(x + 6, y + 12, w - 12, h, '#8a9bb4') + d('M' + x + ' ' + (y + 4) + ' h' + w + ' v10 q-' + (w / 4) + ' 8 -' + (w / 2) + ' 0 q-' + (w / 4) + ' -8 -' + (w / 2) + ' 0 Z', '#f4fbff');
  }
  function archer(x, y, s, f, band, draw) {
    var B = '#16233f';
    var o = '';
    o += sk('M0 -71 L-2 -42 M-2 -42 L-12 -21 L-13 0 M-2 -42 L9 -21 L13 0', B, 10);
    o += sk('M2 -64 L16 -66 L28 -68', B, 7);
    o += sk('M2 -64 L' + (14 - draw * 18) + ' -62 L' + (26 - draw * 30) + ' -66', B, 7);
    o += sk('M26 -100 Q48 -68 26 -36', '#a0662a', 6) + sk('M26 -100 Q48 -68 26 -36', '#d9a05a', 3);
    o += sk('M26 -100 L' + (26 - draw * 30) + ' -66 L26 -36', '#f2eadb', 1.6);
    o += sk('M' + (24 - draw * 30) + ' -66 L58 -68', '#d9c9a0', 3) + p([[58, -72], [68, -68], [58, -64]], '#cfd6dd') + sk('M' + (24 - draw * 30) + ' -66 l-8 -5 M' + (24 - draw * 30) + ' -66 l-8 5', '#e8e8e8', 2.5);
    o += c(2, -86, 13.5, B) + r(-12, -92, 27, 6, band, 2) + p([[-12, -91], [-30, -98], [-27, -86]], band);
    return g('translate(' + x + ',' + y + ') scale(' + (s * f) + ',' + s + ')', o);
  }
  function stuck(x, y, rot) {
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', sk('M-34 0 L0 0', '#d9c9a0', 4) + sk('M-34 0 l-9 -6 M-34 0 l-9 6', '#ff7a1a', 3.5));
  }
  G['quiver-clash'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2a64c8', '#6aa4ec', '#cfe6ff']));
      o += c(300, 90, 40, '#fff', 'opacity=".75"') + c(300, 90, 62, '#fff', 'opacity=".2"');
      o += p([[0, 290], [70, 200], [130, 260], [200, 170], [270, 250], [340, 190], [400, 240], [400, 400], [0, 400]], '#b8cde6');
      o += cliff(-10, 300, 420, 110);
      var arc = 'M186 128 Q270 70 352 130';
      o += sk(arc, '#fff', 3, 'stroke-dasharray="2 12" opacity=".85"');
      o += archer(128, 312, 2.75, 1, '#ffb21a', 1);
      o += sk('M270 126 L326 126', '#d9c9a0', 0);
      o += star(352, 150, 24, 10, 5, '#ffd23a', -90, 'stroke="#b07a00" stroke-width="3.5" stroke-linejoin="round"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a64c8', '#7ab0ee', '#dcecff']));
      o += p([[0, 380], [120, 260], [240, 340], [380, 220], [520, 330], [660, 240], [800, 330], [960, 260], [960, 600], [0, 600]], '#b8cde6');
      o += cliff(0, 420, 300, 200) + cliff(660, 420, 300, 200) + cliff(410, 330, 140, 50);
      o += archer(150, 420, 1.6, 1, '#3b82f6', 1) + archer(810, 420, 1.6, -1, '#e2453c', .4);
      o += stuck(822, 310, 200);
      o += sk('M230 300 Q480 140 760 290', '#fff', 3, 'stroke-dasharray="2 14" opacity=".8"');
      return o;
    }
  };
})();
