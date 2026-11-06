(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  function ground(w, top, bs, hs, seed) {
    var R = rnd(seed), o = '';
    for (var i = 0; i * bs < w; i++) {
      var h = hs[i % hs.length], y0 = top - h * bs, x = i * bs;
      for (var y = y0; y < 600; y += bs) {
        var dpt = (y - y0) / bs, col;
        if (dpt === 0) col = '#5cc23a';
        else if (dpt < 4) col = R() < 0.15 ? '#8a5a34' : '#9a6a40';
        else col = R() < 0.25 ? '#6a6e78' : '#7c808a';
        if (dpt > 2 && R() < 0.08) col = '#e8883a';
        if (dpt > 4 && R() < 0.05) col = '#ffd23a';
        o += r(x, y, bs + 0.5, bs + 0.5, col);
        if (dpt === 0) o += r(x, y + bs * 0.7, bs + 0.5, bs * 0.3, '#3a9a2a') + r(x, y, bs + 0.5, bs * 0.18, '#8ae05a');
      }
    }
    return o;
  }
  var HERO = ['...hhhhh....', '..hhhhhhh...', '..hhhsssss..', '..hhssseso..', '...sssssss..', '....sssss...', '...rrrrrr...', '..srrrrrrs..', '..srRrrrrs..', '...rrlrrr...', '...pppppp...', '...pp..pp...', '...pp..pp...', '..kkk..kkk..'];
  var HP = { h: '#6a3a1a', s: '#f2c49a', e: '#1b1d24', o: '#e8a87a', r: '#d8322c', R: '#ff6a5a', l: '#ffd23a', p: '#3a4a7a', k: '#2a1a12' };
  var SWORD = ['.........ww', '........wbw', '.......wbw.', '......wbw..', '.....wbw...', '..y.wbw....', '...ybw.....', '...gyy.....', '..g..y.....', '.g.........', 'g..........'];
  var SP = { w: '#ffffff', b: '#7ad0ff', y: '#ffc21a', g: '#7a4a24' };
  var SLIME = ['...bbbb...', '.bbbbbbbb.', 'bbwwbbbbbb', 'bwbbbebbeb', 'bbbbbebbeb', 'bbbbbbbbbb', 'dbbbbbbbbd', '.dddddddd.'];
  var SLP = { b: '#3a8aff', w: '#bfe4ff', e: '#0e1a3a', d: '#1e5ad0' };
  var PICK = ['...mmmmm..', '..mm...mm.', '.mm.....mm', '.m...w...m', '....w.....', '...w......', '..w.......', '.w........'];
  var HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
  function tree(x, base, bs) {
    var o = r(x, base - bs * 6, bs * 2, bs * 6, '#7a4a24') + r(x, base - bs * 6, bs * 0.6, bs * 6, '#9a6034');
    var L = ['..gggg..', '.gggggg.', 'gggGgggg', 'ggggggGg', 'gGgggggg', '.gggggg.', '..gggg..'];
    return o + pix(L, x - bs * 3, base - bs * 12, bs, { g: '#3aa83a', G: '#5cd05a' });
  }
  G['terraria'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#3a8ae8', '#7ac4ff', '#c8ecff']));
      o += c(70, 70, 46, '#fff6b0', 'opacity=".4"') + r(44, 44, 52, 52, '#fff2a0') + r(52, 52, 22, 22, '#ffffff', 0, 'opacity=".55"');
      o += r(120, 60, 70, 18, '#fff', 0, 'opacity=".85"') + r(138, 44, 36, 18, '#fff', 0, 'opacity=".85"');
      o += rep(5, function (i) { return pix(HEART, 196 + i * 34, 22, 4.4, { r: '#e8233a' }) + r(200 + i * 34, 26, 7, 4.4, '#ff9a9a'); });
      o += ground(400, 400, 25, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], 4);
      o += pix(['...cccccc...', '.cccccccccc.', 'cccccccccccc', '.cccccccccc..', '...cccccc...'], 130, 318, 12.5, { c: '#262a34' }) + pix(['f', 'f', 't', 't'], 168, 330, 6, { f: '#ffc21a', t: '#8a5a2a' }) + c(171, 336, 18, '#ffc21a', 'opacity=".25"');
      o += pix(['.y.', 'yYy', '.y.'], 290, 338, 9, { y: '#ffd23a', Y: '#fff2a0' }) + pix(['.v.', 'vVv', '.v.'], 60, 350, 9, { v: '#b04aff', V: '#e0b0ff' });
      o += sk('M206 70 Q326 50 352 196', '#fff', 16, 'opacity=".45"') + sk('M226 66 Q320 54 342 160', '#fff', 6, 'opacity=".7"');
      o += r(304, 266, 92, 12, '#000', 0, 'opacity=".2"') + pix(SLIME, 300, 196, 10, SLP, 'opacity=".95"');
      o += r(94, 268, 130, 10, '#000', 0, 'opacity=".2"') + pix(HERO, 86, 121, 11, HP);
      o += pix(SWORD, 186, 90, 11, SP);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#2a6ad8', '#8acaff']));
      o += r(760, 60, 80, 80, '#fff2a0') + d('M0 360 L120 280 L220 330 L340 250 L470 320 L600 240 L740 300 L860 230 L960 280 V600 H0 Z', '#4a8a6a', 'opacity=".6"');
      o += ground(960, 600, 30, [6, 6, 7, 7, 7, 6, 6, 5, 5, 5, 6, 6, 7, 8, 8, 8, 7, 7, 6, 6, 6, 5, 5, 6, 6, 7, 7, 6, 6, 6, 6, 7], 9);
      o += tree(90, 420, 18) + tree(560, 390, 18) + tree(860, 420, 18);
      o += pix(HERO, 380, 300, 10, HP);
      return o;
    }
  };
})();
