(function () {
  var OL = '#2a2438';
  function duck(x, y, s, flip) {
    var sw = 'stroke="' + OL + '" stroke-width="' + (6 / s * 0.8).toFixed(2) + '" stroke-linejoin="round" stroke-linecap="round"', o = '';
    o += e(0, 96, 92, 14, '#000', 'opacity=".22"');
    o += d('M-40 84 L-46 98 L-28 98 Z M12 84 L6 98 L24 98 Z', '#ff8c1a', sw);
    o += d('M-96 10 Q-128 -22 -104 -40 Q-92 -18 -70 -18 Q-40 -60 6 -50 Q48 -44 58 0 Q76 26 52 60 Q12 96 -48 86 Q-104 74 -96 10 Z', lg(['#ffe066', '#ffd23f', '#eba51c'], 0, 0, 0, 1), sw);
    o += d('M-58 18 Q-30 -8 10 12 Q-8 52 -58 18 Z', '#eba51c', sw);
    o += d('M18 -40 Q14 -104 60 -108 Q104 -110 104 -64 Q104 -20 62 -16 Q30 -16 18 -40 Z', lg(['#ffe066', '#ffd23f'], 0, 0, 0, 1), sw);
    o += d('M98 -70 Q138 -78 146 -60 Q138 -42 98 -48 Z', '#ff8c1a', sw) + sk('M100 -59 L138 -60', OL, 3);
    o += c(70, -74, 13, '#fff', sw) + c(74, -73, 6.5, OL) + c(76, -76, 2.2, '#fff');
    o += e(52, -50, 10, 6, '#ff9ab0', 'opacity=".7"');
    o += e(-20, -30, 24, 8, '#fff', 'opacity=".35" transform="rotate(-18 -20 -30)"');
    return g('translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')', o);
  }
  function trophy(x, y, s) {
    var sw = 'stroke="' + OL + '" stroke-width="' + (5 / s * 0.8).toFixed(2) + '" stroke-linejoin="round"', gold = lg(['#fff2a0', '#ffcf33', '#d99a0a'], 0, 0, 1, 1), o = '';
    o += e(0, 118, 66, 10, '#000', 'opacity=".22"');
    o += sk('M-44 -34 Q-86 -34 -78 6 Q-70 34 -34 34', OL, 16 / s * 0.8) + sk('M-44 -34 Q-86 -34 -78 6 Q-70 34 -34 34', '#e8b020', 8 / s * 0.8);
    o += sk('M44 -34 Q86 -34 78 6 Q70 34 34 34', OL, 16 / s * 0.8) + sk('M44 -34 Q86 -34 78 6 Q70 34 34 34', '#e8b020', 8 / s * 0.8);
    o += d('M-54 -50 H54 Q54 40 0 56 Q-54 40 -54 -50 Z', gold, sw);
    o += r(-12, 54, 24, 30, '#e8b020', 0, sw) + r(-44, 82, 88, 18, gold, 6, sw) + r(-56, 98, 112, 20, '#8a5a22', 6, sw);
    o += star(0, -6, 24, 10, 5, '#fff6c8', -90, sw);
    o += d('M-38 -40 Q-40 4 -18 34', 'none', 'stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".55"');
    return g('translate(' + x + ' ' + y + ') scale(' + s + ')', o);
  }
  function scene(w, h, gy) {
    var o = r(0, 0, w, h, lg([['#6fc3f5', 0], ['#d4f0ff', 0.7]], 0, 0, 0, 1));
    o += c(w * 0.82, h * 0.16, h * 0.09, '#fff3a0') + c(w * 0.82, h * 0.16, h * 0.13, '#fff3a0', 'opacity=".35"');
    o += e(w * 0.16, h * 0.14, w * 0.09, h * 0.035, '#fff') + e(w * 0.22, h * 0.12, w * 0.06, h * 0.03, '#fff');
    o += d('M0 ' + gy + ' Q' + w * 0.2 + ' ' + (gy - h * 0.1) + ' ' + w * 0.44 + ' ' + (gy - h * 0.02) + ' T' + w + ' ' + (gy - h * 0.05) + ' V' + h + ' H0 Z', '#8fd47a', 'stroke="' + OL + '" stroke-width="4"');
    o += r(0, h * 0.8, w, h * 0.2, '#e2674d', 0, 'stroke="' + OL + '" stroke-width="4"');
    o += ln(0, h * 0.865, w, h * 0.865, '#fff', 4) + ln(0, h * 0.935, w, h * 0.935, '#fff', 4);
    return o;
  }
  function gloss() {
    var id = uid('gl');
    _defs += '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>';
    return r(0, 0, 400, 400, 'url(#' + id + ')');
  }
  G['quack-cup'] = {
    icon: function () {
      var o = scene(400, 400, 250);
      o += trophy(322, 214, 0.82);
      o += duck(150, 240, 1.02);
      o += sk('M176 218 Q194 246 214 214', '#3a86ff', 9) + c(195, 244, 15, lg(['#fff2a0', '#e8b020'], 0, 0, 1, 1), 'stroke="#2a2438" stroke-width="4"') + star(195, 244, 9, 4, 5, '#fff6c8');
      return o + gloss();
    },
    bg: function () {
      var o = scene(960, 600, 380);
      o += trophy(760, 300, 1.5);
      o += duck(380, 370, 1.7);
      o += duck(110, 470, 0.8) + duck(880, 500, 0.7, true);
      return o;
    }
  };
})();
