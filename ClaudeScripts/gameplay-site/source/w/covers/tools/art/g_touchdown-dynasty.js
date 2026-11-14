(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var QB = [
    '.......kkkkk.......',
    '.....kkyyyyykk.....',
    '....kyyyyyyyyyk....',
    '...kyywyyyyyyyyk...',
    '...kyyyyyyykkkkkk..',
    '...kyyyyyykssssgk..',
    '...kyyyyyykssssgk..',
    '....kyyyyykkssskk..',
    '.....kkkkkkkkkkk...',
    '...kkrrrrrrrrrrkk..',
    '..krrrwwwwrrrrrrrk.',
    '.krrrrrrwwrrrrrrsk.',
    'ksrrrrrwwrrrrrrrsk.',
    'kss.krrwwrrrrrkssk.',
    'ks..krrrrrrrrrk.kk.',
    '....kyyyyyyyyyk....',
    '....kwwwwkwwwwk....',
    '....kwwwk.kwwwk....',
    '....kwwwk.kwwwk....',
    '....kkkkk.kkkkk....',
    '....kbbbk.kbbbk....',
    '...kkkkkk.kkkkkk...'
  ];
  var PAL = { k: '#121428', y: '#ffd23a', w: '#f4f4f0', r: '#c8282e', s: '#e0a070', g: '#9aa4b8', b: '#2a2a36' };
  var BALL = ['..kkkk..', '.kbbbbk.', 'kbwbwbbk', 'kbbbbbbk', '.kbbbbk.', '..kkkk..'];
  var BPAL = { k: '#2a1408', b: '#8a4a1e', w: '#fff' };
  function field(w, h, x0, y0) {
    var o = r(x0, y0, w, h, '#2f8f3a');
    for (var i = 0; i < 12; i++) o += r(x0 + i * w / 12, y0, w / 24, h, '#2a8434');
    for (var j = 0; j <= 6; j++) o += r(x0 + j * w / 6, y0, 4, h, '#fff', 0, 'opacity=".55"');
    return o;
  }
  function crowd(w, y0, h, seed) {
    var rn = rnd(seed), o = r(0, y0, w, h, '#1a2550'), cols = ['#e8554e', '#f2c14e', '#4ea8e8', '#f2f2f2', '#6fd66f', '#c874e0', '#ff9a3c'];
    for (var y = y0 + 4; y < y0 + h - 4; y += 10) for (var x = 2; x < w; x += 10) if (rn() < 0.8) o += r(x, y, 7, 7, cols[Math.floor(rn() * cols.length)]);
    return o;
  }
  G['touchdown-dynasty'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#0d1530', '#24356e']));
      o += crowd(400, 30, 110, 7);
      o += r(0, 140, 400, 18, '#c2410c') + r(0, 140, 400, 4, '#000', 0, 'opacity=".25"');
      o += field(400, 250, 0, 158);
      o += e(200, 372, 120, 16, '#000', 'opacity=".25"');
      o += pix(QB, 110, 96, 14, PAL);
      o += pix(BALL, 292, 70, 11, BPAL);
      o += sk('M262 120 l-26 18 M270 150 l-30 6', '#fff', 6, 'opacity=".8"');
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#0d1530');
      o += crowd(960, 0, 220, 11);
      o += r(0, 220, 960, 26, '#1d4ed8');
      o += field(960, 354, 0, 246);
      o += pix(QB, 330, 160, 16, PAL) + pix(QB, 620, 230, 12, { k: '#121428', y: '#e8e8e8', w: '#2a62c8', r: '#2a62c8', s: '#c68642', g: '#9aa4b8', b: '#2a2a36' });
      o += pix(BALL, 560, 120, 12, BPAL);
      return o;
    }
  };
})();
