G['hopfire'] = (function () {
  function cube(x, y, w, h, dp, col, top, side) {
    return p([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col) + p([[x, y], [x + dp, y - dp * 0.6], [x + w + dp, y - dp * 0.6], [x + w, y]], top) + p([[x + w, y], [x + w + dp, y - dp * 0.6], [x + w + dp, y + h - dp * 0.6], [x + w, y + h]], side);
  }
  function hero() {
    var o = '';
    o += cube(-46, 40, 38, 110, 18, '#3d4658', '#56617a', '#2c3342') + cube(6, 40, 38, 110, 18, '#3d4658', '#56617a', '#2c3342');
    o += cube(-50, 136, 44, 26, 18, '#3a2f28', '#54463c', '#2a221d') + cube(4, 136, 44, 26, 18, '#3a2f28', '#54463c', '#2a221d');
    o += cube(-62, -76, 112, 124, 26, '#ff6b3d', '#ff9a72', '#d9502a');
    o += r(-62, 34, 112, 16, '#2b2f3a') + r(-26, -50, 34, 22, '#ffffff', 3, 'opacity=".9"');
    o += cube(-48, -166, 84, 84, 24, '#f0c39a', '#ffdcb8', '#d6a57c');
    o += r(-42, -138, 72, 22, '#2b2f3a', 4) + r(-30, -133, 14, 10, '#ffffff', 2) + r(4, -133, 14, 10, '#ffffff', 2);
    o += cube(-52, -186, 92, 24, 26, '#ff6b3d', '#ff9a72', '#d9502a') + p([[-52, -162], [40, -162], [62, -150], [-30, -150]], '#e0552c');
    o += g('rotate(-8 30 -40)', cube(-40, -46, 210, 30, 14, '#4a505c', '#6b7280', '#2d313a') + r(-60, -36, 40, 34, '#2d313a', 4) + cube(10, -62, 90, 14, 10, '#ff7a1a', '#ffa24d', '#d85e00') + r(170, -40, 56, 12, '#1c1e24', 3) + r(40, -16, 26, 46, '#2d313a', 3) +
      cube(-90, -40, 40, 30, 12, '#ff6b3d', '#ff9a72', '#d9502a') + r(-30, -30, 26, 24, '#f0c39a', 4) + r(70, -30, 26, 24, '#f0c39a', 4) +
      star(248, -32, 54, 18, 8, '#fff3b0', -90) + star(248, -32, 30, 12, 8, '#ffffff', -70));
    return o;
  }
  return {
    icon: function () {
      var o = r(0, 0, 400, 400, lg(['#2f7bff', '#5fb0ff', '#ffb36b']));
      o += rep(12, function (i) { var a = (i * 30 + 8) * Math.PI / 180; return p([[230, 190], [230 + Math.cos(a - 0.09) * 420, 190 + Math.sin(a - 0.09) * 420], [230 + Math.cos(a + 0.09) * 420, 190 + Math.sin(a + 0.09) * 420]], '#ffffff', 'opacity=".09"'); });
      o += c(232, 190, 128, 'none', 'stroke="#ffffff" stroke-width="10" opacity=".22"') + c(232, 190, 76, 'none', 'stroke="#ffffff" stroke-width="6" opacity=".18"');
      o += rep(7, function (i) { return r(10 + i * 9, 236 + i * 18, 70 - i * 6, 7, '#ffffff', 3, 'opacity="' + (0.5 - i * 0.05) + '"'); });
      o += e(196, 372, 120, 20, '#000000', 'opacity=".22"');
      o += g('translate(176,220) scale(.94)', hero());
      o += cube(300, 300, 46, 46, 18, '#c08a4a', '#d8a868', '#9a6a34') + sk('M304 304 L342 342', '#7a5226', 5);
      return o;
    },
    bg: function () {
      var o = r(0, 0, 960, 600, lg(['#3d8dff', '#8ec8ff', '#d6ecff']));
      o += rep(8, function (i) { var x = 40 + i * 120, h = 160 + (i * 53) % 140; return r(x, 360 - h, 90, h + 60, '#7f97b8', 0, 'opacity=".75"'); });
      o += r(0, 380, 960, 220, '#8a8682');
      o += cube(60, 250, 260, 170, 50, '#c9714f', '#e3926e', '#9e5236') + rep(6, function (i) { return r(84 + (i % 3) * 78, 280 + Math.floor(i / 3) * 70, 40, 44, '#3d6fa0', 3) + r(80 + (i % 3) * 78, 324 + Math.floor(i / 3) * 70, 48, 6, '#f2f2ee'); });
      o += cube(640, 230, 260, 190, 50, '#ece2cc', '#ffffff', '#cbbfa6') + rep(6, function (i) { return r(664 + (i % 3) * 78, 262 + Math.floor(i / 3) * 74, 40, 46, '#3d6fa0', 3); });
      o += cube(440, 120, 70, 300, 30, '#c46a4e', '#de8a6c', '#9a4e36') + cube(430, 80, 90, 50, 30, '#ece2cc', '#ffffff', '#cbbfa6') + c(475, 104, 18, '#ffffff') + sk('M475 104 L475 92 M475 104 L484 108', '#2b2f3a', 3) + cube(426, 62, 98, 18, 30, '#5b6270', '#7a8292', '#454b57');
      o += cube(360, 420, 60, 60, 24, '#c08a4a', '#d8a868', '#9a6a34') + cube(560, 440, 70, 70, 24, '#c08a4a', '#d8a868', '#9a6a34');
      o += rep(10, function (i) { return r(i * 100, 540, 60, 10, '#ffffff', 2, 'opacity=".35"'); });
      return o;
    }
  };
})();
