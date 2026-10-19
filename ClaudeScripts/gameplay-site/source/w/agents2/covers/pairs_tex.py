from PIL import Image, ImageDraw
import math
C = '/tmp/gameplay-build/w/agents2/covers/tex/'
W, H = 400, 520


def base(bg):
    im = Image.new('RGB', (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((14, 14, W - 14, H - 14), 30, fill=bg)
    return im, d


def star(d, cx, cy, r, col):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=col)


def heart(d, cx, cy, r, col):
    d.ellipse((cx - r, cy - r * 0.7, cx, cy + r * 0.3), fill=col)
    d.ellipse((cx, cy - r * 0.7, cx + r, cy + r * 0.3), fill=col)
    d.polygon([(cx - r * 0.97, cy - r * 0.05), (cx + r * 0.97, cy - r * 0.05), (cx, cy + r)], fill=col)


icons = {
    'star': lambda d: star(d, W / 2, H / 2, 130, (255, 196, 0)),
    'heart': lambda d: heart(d, W / 2, H / 2 - 10, 120, (232, 36, 60)),
    'diamond': lambda d: d.polygon([(W / 2, H / 2 - 140), (W / 2 + 100, H / 2), (W / 2, H / 2 + 140), (W / 2 - 100, H / 2)], fill=(40, 140, 255)),
    'circle': lambda d: d.ellipse((W / 2 - 110, H / 2 - 110, W / 2 + 110, H / 2 + 110), fill=(40, 200, 110)),
}
for k, f in icons.items():
    im, d = base((250, 248, 244))
    f(d)
    im.save(C + 'pair_%s.png' % k)
im, d = base((90, 60, 200))
for y in range(40, H, 40):
    for x in range(40, W, 40):
        d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(130, 100, 240))
d.rounded_rectangle((40, 40, W - 40, H - 40), 20, outline=(255, 255, 255), width=8)
star(d, W / 2, H / 2, 70, (255, 255, 255))
im.save(C + 'pair_back.png')
print('ok')
