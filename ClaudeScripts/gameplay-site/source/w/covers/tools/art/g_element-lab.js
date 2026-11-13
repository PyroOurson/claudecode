(function () {
  function GL() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  var OL = 'stroke-linejoin="round" stroke-linecap="round"';
  function drop(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M0 -46 Q4 -24 26 0 Q44 22 26 40 Q16 50 0 50 Q-16 50 -26 40 Q-44 22 -26 0 Q-4 -24 0 -46Z', '#3b82e6', 'stroke="#24428f" stroke-width="6" ' + OL) + d('M-14 14 Q-18 30 -6 40 Q-12 28 -10 18Z', '#fff', 'opacity=".6"'));
  }
  function flame(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M0 -50 Q8 -22 28 -6 Q48 16 30 36 Q18 50 0 50 Q-20 50 -32 36 Q-46 18 -26 -4 Q-20 8 -10 12 Q-18 -16 0 -50Z', '#f58a2d', 'stroke="#b8501b" stroke-width="6" ' + OL) + d('M0 0 Q6 14 18 24 Q24 40 8 46 Q0 49 -8 46 Q-24 40 -12 24 Q-2 18 0 0Z', '#f9cf3a') + d('M0 22 Q5 30 6 40 Q0 45 -5 40 Q-5 30 0 22Z', '#fbeaa4'));
  }
  function earth(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M-46 8 Q-44 -16 -16 -22 Q0 -28 16 -22 Q46 -14 46 8 Q46 32 18 38 Q-14 44 -32 34 Q-48 26 -46 8Z', '#9a6a3a', 'stroke="#5e3d21" stroke-width="6" ' + OL) + d('M-46 8 Q-44 -16 -16 -22 Q0 -28 16 -22 Q46 -14 46 6 Q32 -4 18 4 Q4 -8 -12 2 Q-30 -6 -46 8Z', '#4cad48', 'stroke="#2d7a3e" stroke-width="6" ' + OL) + c(-16, 22, 6, '#5e3d21') + c(14, 26, 7, '#5e3d21') + c(0, 14, 4, '#5e3d21'));
  }
  function air(x, y, s) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', sk('M-44 -16 Q-6 -36 18 -20 Q32 -10 18 0 Q10 4 4 -6', '#2b8fb0', 15) + sk('M-44 -16 Q-6 -36 18 -20 Q32 -10 18 0 Q10 4 4 -6', '#4cc9e8', 9) + sk('M-48 14 Q-10 2 12 12 Q30 22 16 32 Q8 36 2 28', '#2b8fb0', 15) + sk('M-48 14 Q-10 2 12 12 Q30 22 16 32 Q8 36 2 28', '#4cc9e8', 9));
  }
  function flask(x, y, s) {
    var o = d('M-26 -96 L26 -96 L26 -40 Q86 -14 76 44 Q66 98 0 98 Q-66 98 -76 44 Q-86 -14 -26 -40Z', '#e9f7fb', 'stroke="#5c6570" stroke-width="9" ' + OL);
    o += d('M-70 30 Q-30 14 0 26 Q34 38 70 24 Q74 46 64 64 Q46 90 0 90 Q-46 90 -64 64 Q-74 48 -70 30Z', '#2fbfa8');
    o += d('M-70 30 Q-30 14 0 26 Q34 38 70 24 Q70 32 66 38 Q34 48 0 38 Q-34 26 -68 40Z', '#7ee0cf');
    o += c(-20, 56, 9, '#bff3ea') + c(18, 70, 6, '#bff3ea') + c(30, 44, 4, '#bff3ea') + c(-4, 6, 6, '#bff3ea', 'opacity=".8"') + c(10, -22, 4, '#bff3ea', 'opacity=".7"');
    o += r(-34, -108, 68, 18, '#a9b0b8', 8, 'stroke="#5c6570" stroke-width="7"');
    o += d('M-56 0 Q-66 30 -54 62', 'none', 'stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".75"');
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', o);
  }
  function spark(x, y, s, col) {
    return g('translate(' + x + ',' + y + ') scale(' + s + ')', d('M0 -30 L7 -7 L30 0 L7 7 L0 30 L-7 7 L-30 0 L-7 -7Z', col || '#ffe46b'));
  }
  G['element-lab'] = {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2fb8a6', '#13606f'], 0, 0, 1, 1));
      o += c(200, 214, 156, '#ffffff', 'opacity=".12"') + c(200, 214, 108, '#ffffff', 'opacity=".1"');
      o += sk('M96 96 Q150 150 186 186', '#ffffff', 6, 'opacity=".35" stroke-dasharray="2 18"') + sk('M304 96 Q250 150 214 186', '#ffffff', 6, 'opacity=".35" stroke-dasharray="2 18"') + sk('M96 312 Q140 290 160 270', '#ffffff', 6, 'opacity=".35" stroke-dasharray="2 18"') + sk('M304 312 Q260 290 240 270', '#ffffff', 6, 'opacity=".35" stroke-dasharray="2 18"');
      o += flask(200, 218, 1.12);
      o += drop(78, 82, 0.92) + flame(322, 80, 0.92) + earth(80, 324, 0.92) + air(326, 322, 0.95);
      o += spark(150, 128, 0.7) + spark(262, 140, 0.5, '#ffffff') + spark(290, 214, 0.55);
      return o + GL();
    },
    bg: function () {
      var o = r(0, 0, 960, 600, rg([['#3cbcaa', 0], ['#17706f', 1]], 0.5, 0.5, 0.8));
      o += rep(20, function (i) { return rep(13, function (j) { return c(24 + i * 48, 24 + j * 48, 3, '#8fe0d3'); }); });
      o += drop(160, 140, 1.4) + flame(780, 130, 1.5) + earth(170, 470, 1.4) + air(800, 470, 1.5);
      o += flask(480, 300, 1.9) + spark(330, 210, 1.2) + spark(640, 220, 1.0, '#7ee0cf') + spark(600, 470, 1.1);
      o += c(330, 420, 46, '#e8473f', 'opacity=".75"') + c(640, 400, 40, '#9bd13f', 'opacity=".75"');
      return o;
    }
  };
})();
