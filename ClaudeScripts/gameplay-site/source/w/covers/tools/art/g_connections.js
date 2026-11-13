(function () {
  var Y = '#f9df6d', GR = '#a0c35a', BL = '#b0c4ef', PU = '#ba81c5';
  function bar(x, y, w, h, f, title, words) { return r(x, y + 5, w, h, '#000', 12, 'opacity=".12"') + r(x, y, w, h, f, 12) + r(x + 10, y + 6, w - 20, h * 0.2, '#fff', 8, 'opacity=".3"') + t(x + w / 2, y + h * 0.48, title, h * 0.3, '#1b1b1b', { w: 900 }) + t(x + w / 2, y + h * 0.82, words, h * 0.2, '#1b1b1b', { w: 600 }); }
  function tile(x, y, w, h, word, sel) { return r(x, y + 5, w, h, '#000', 12, 'opacity=".12"') + r(x, y, w, h, sel ? '#5a594e' : '#efefe6', 12) + r(x + 8, y + 6, w - 16, h * 0.18, '#fff', 8, 'opacity="' + (sel ? 0.12 : 0.6) + '"') + t(x + w / 2, y + h * 0.62, word, h * 0.3, sel ? '#fff' : '#1b1b1b', { w: 900 }); }
  G['connections'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, '#fbfbf7'), x0 = 24, y0 = 26, w = 352, h = 80, gp = 9, tw = (w - 3 * gp) / 4;
      o += bar(x0, y0, w, h, Y, 'FRUIT', 'PEAR, LIME, FIG, KIWI');
      o += bar(x0, y0 + (h + gp), w, h, GR, 'PLANETS', 'MARS, VENUS, EARTH...');
      o += bar(x0, y0 + 2 * (h + gp), w, h, BL, 'COLORS', 'RED, TEAL, GOLD, PINK');
      ['BAT', 'SUN', 'KEY', 'OWL'].forEach(function (wd, i) { o += tile(x0 + i * (tw + gp), y0 + 3 * (h + gp), tw, h, wd, i === 1 || i === 3); });
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, '#fbfbf7'), W = ['STAR', 'MOON', 'ROCK', 'JAZZ', 'BLUE', 'FOLK', 'SOUL', 'POP', 'TIDE', 'WAVE', 'SURF', 'REEF', 'KING', 'ACE', 'JACK', 'CLUB'], q = rnd(3);
      o += bar(60, 40, 840, 110, PU, 'MUSIC GENRES', 'JAZZ, FOLK, SOUL, POP') + bar(60, 165, 840, 110, Y, 'CARDS', 'KING, ACE, JACK, CLUB');
      for (var k = 0; k < 8; k++) o += tile(60 + (k % 4) * 213, 290 + Math.floor(k / 4) * 125, 200, 110, W[Math.floor(q() * 16)], k === 2 || k === 5);
      return o;
    }
  };
})();
