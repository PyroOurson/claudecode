(function () {
  var DK = '#20242c';
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function felt(w, h) {
    var o = r(0, 0, w, h, rg([['#52b07e', 0], ['#1d5a44', .55], ['#08201a', 1]], .5, .12, .95));
    var s = w / 9;
    for (var i = -1; i < 11; i++) o += ln(i * s, 0, i * s + h, h, '#fff', 1.5, 'opacity=".05"') + ln(i * s, 0, i * s - h, h, '#fff', 1.5, 'opacity=".05"');
    return o;
  }
  var SUIT = {
    S: ['000010000', '000111000', '001111100', '011111110', '111111111', '111111111', '011010110', '000010000', '000111000'],
    H: ['011000110', '111101111', '111111111', '111111111', '011111110', '001111100', '000111000', '000010000', '000000000']
  };
  var GL = {
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001']
  };
  function pcard(x, y, rot, rank, suit) {
    var col = suit === 'H' ? '#e0453a' : '#38466a', o = '';
    o += r(-62, -86, 124, 172, '#000', 10, 'opacity=".3" transform="translate(8,10)"');
    o += r(-62, -86, 124, 172, DK, 10) + r(-58, -82, 116, 164, '#f4f0e6', 7) + r(-58, 58, 116, 20, '#e2dccb', 0);
    o += pix(GL[rank].map(function (q) { return q.replace(/1/g, 'a'); }), -52, -76, 4, { a: col });
    o += pix(SUIT[suit].map(function (q) { return q.replace(/1/g, 'a'); }), -52, -44, 3, { a: col });
    o += pix(SUIT[suit].map(function (q) { return q.replace(/1/g, 'a'); }), -27, -20, 6, { a: col });
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ')', o);
  }
  function joker(x, y, rot, s) {
    var face = [
      '....RRR..GGG....',
      '...RRRRRGGGGG...',
      '..RRRRRRGGGGGG..',
      '.YRRRR....GGGGY.',
      '.Y.RR......GG.Y.',
      '....KYYYYYYK....',
      '...KYYYYYYYYK...',
      '..KYYWWYYWWYYK..',
      '..KYYWKYYWKYYK..',
      '..KYYYYYYYYYYK..',
      '..KYPYYYYYYPYK..',
      '..KYYKYYYYKYYK..',
      '...KYYKKKKYYK...',
      '....KYYYYYYK....',
      '.....KKKKKK.....',
      '...CCCCCCCCCC...'
    ];
    var o = r(-66, -92, 132, 184, '#000', 10, 'opacity=".3" transform="translate(8,12)"');
    o += r(-66, -92, 132, 184, DK, 10) + r(-62, -88, 124, 176, '#c58aff', 7) + r(-58, -84, 116, 168, lg(['#3b2d6e', '#6a4fd6']), 4);
    o += rep(18, function (i) { return r(-54 + (i * 37) % 104, -80 + (i * 53) % 150, 3, 3, '#fff', 0, 'opacity=".55"'); });
    o += pix(face, -48, -52, 6, { R: '#e8574a', G: '#4cc66a', Y: '#f2c14e', K: '#1c1f2a', W: '#ffffff', P: '#f08fb0', C: '#ffe45a' });
    o += c(-44, -32, 5, '#ffe45a') + c(44, -32, 5, '#ffe45a');
    o += pix(['00100', '01110', '11111', '01110', '00100'], -54, -80, 3, { 1: '#ffe45a' }) + pix(['00100', '01110', '11111', '01110', '00100'], 39, 66, 3, { 1: '#ffe45a' });
    return g('translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + s + ')', o);
  }
  function chip(x, y, R, col) { return c(x + 3, y + 6, R, '#000', 'opacity=".3"') + c(x, y, R, col) + c(x, y, R * .78, 'none', 'stroke="#fff" stroke-width="' + R * .2 + '" stroke-dasharray="' + R * .36 + ' ' + R * .36 + '"') + c(x, y, R * .55, '#fff', 'opacity=".22"') + c(x, y, R * .47, col); }
  function stack(x, y, n, col) { var o = ''; for (var i = 0; i < n; i++) o += e(x, y - i * 10 + 4, 34, 13, '#000', 'opacity=".25"') + e(x, y - i * 10, 34, 13, col) + e(x, y - i * 10 - 2, 34, 12, col, 'stroke="#fff" stroke-width="3" stroke-dasharray="9 9" opacity=".9"'); return o + e(x, y - n * 10 + 8, 24, 8, '#fff', 'opacity=".25"'); }
  G['ante-up'] = {
    icon: function () {
      var o = felt(400, 400);
      o += e(200, 30, 220, 120, '#ffe2a0', 'opacity=".12"');
      o += pcard(118, 214, -18, 'A', 'S') + pcard(282, 214, 18, 'K', 'H');
      o += joker(200, 186, 0, 1.12);
      o += stack(70, 372, 4, '#c8303a') + stack(332, 372, 5, '#2f74e0');
      return o + gloss();
    },
    bg: function () {
      var o = felt(960, 600);
      o += e(480, 0, 520, 300, '#ffe2a0', 'opacity=".14"');
      o += r(-20, 520, 1000, 120, '#4a2f1c') + r(-20, 516, 1000, 10, '#c8a040', 0, 'opacity=".7"');
      o += pcard(200, 300, -24, 'A', 'S') + pcard(330, 280, -10, 'K', 'H') + joker(480, 270, 2, 1.3) + pcard(630, 280, 10, 'A', 'H') + pcard(760, 300, 24, 'K', 'S');
      o += stack(120, 560, 6, '#c8303a') + stack(220, 570, 4, '#2f74e0') + stack(760, 570, 5, '#e8c040') + stack(860, 560, 7, '#3aa86a');
      o += chip(560, 500, 30, '#c8303a') + chip(420, 520, 26, '#2f74e0');
      return o;
    }
  };
})();
