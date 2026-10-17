from PIL import Image, ImageDraw, ImageFont
C = '/tmp/gameplay-build/w/agents2/covers/'
COL = {1: (250, 200, 0), 2: (0, 70, 200), 3: (220, 30, 30), 4: (90, 20, 140), 5: (255, 110, 0), 6: (0, 140, 60), 7: (130, 20, 20), 8: (12, 12, 12)}
W, H = 1024, 512
f = ImageFont.truetype(C + 'fonts/Archivo_Black.ttf', 64)
for n in range(1, 16):
    base = COL[n if n <= 8 else n - 8]
    im = Image.new('RGB', (W, H), (248, 246, 236) if n > 8 else base)
    d = ImageDraw.Draw(im)
    if n > 8:
        d.rectangle((0, H * 0.27, W, H * 0.73), fill=base)
    for cx in (W * 0.25, W * 0.75):
        r = 52
        d.ellipse((cx - r * 1.0, H / 2 - r, cx + r * 1.0, H / 2 + r), fill=(248, 246, 236))
        t = str(n)
        bb = d.textbbox((0, 0), t, font=f)
        d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], H / 2 - (bb[3] - bb[1]) / 2 - bb[1]), t, font=f, fill=(15, 15, 15))
    im.save(C + 'tex/ball_%d.png' % n)
im = Image.new('RGB', (W, H), (250, 248, 240))
ImageDraw.Draw(im).ellipse((W * 0.25 - 14, H / 2 - 14, W * 0.25 + 14, H / 2 + 14), fill=(220, 30, 30))
im.save(C + 'tex/ball_0.png')
print('ok')
