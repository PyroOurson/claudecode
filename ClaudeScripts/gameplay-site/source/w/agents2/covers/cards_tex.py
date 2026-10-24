from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
C = '/tmp/gameplay-build/w/agents2/covers/'
F = C + 'fonts/'
W, H = 560, 870
COL = {'r': (226, 30, 40), 'y': (252, 196, 0), 'g': (20, 160, 70), 'b': (0, 104, 196), 'k': (18, 18, 20)}


def font(n, s):
    return ImageFont.truetype(F + n, s)


def ellipse_layer(color, fill=True, scale=1.0, outline=None, ow=0):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    a, b = 335 * scale, 190 * scale
    d.ellipse((W / 2 - a, H / 2 - b, W / 2 + a, H / 2 + b), fill=color, outline=outline, width=ow)
    L = L.rotate(57, resample=Image.BICUBIC, center=(W / 2, H / 2))
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle((26, 26, W - 26, H - 26), radius=40, fill=255)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.paste(L, (0, 0), Image.composite(L.split()[3], Image.new('L', (W, H), 0), m))
    return out


def text_c(im, txt, size, cx, cy, fill, outline=None, ow=0, fnt='Archivo_Black.ttf', shadow=None, rot=0):
    f = font(fnt, size)
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    bb = d.textbbox((0, 0), txt, font=f, stroke_width=ow)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x, y = cx - tw / 2 - bb[0], cy - th / 2 - bb[1]
    if shadow:
        d.text((x + size * 0.05, y + size * 0.05), txt, font=f, fill=shadow, stroke_width=ow, stroke_fill=shadow)
    d.text((x, y), txt, font=f, fill=fill, stroke_width=ow, stroke_fill=outline)
    if rot:
        L = L.rotate(rot, resample=Image.BICUBIC, center=(cx, cy))
    im.alpha_composite(L)


def card(c, sym, path):
    im = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((26, 26, W - 26, H - 26), radius=40, fill=COL[c] + (255,))
    im.alpha_composite(ellipse_layer((255, 255, 255, 255)))
    if c == 'k':
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        dd = ImageDraw.Draw(L)
        cx, cy = W / 2, H / 2
        for i, k in enumerate('rbyg'):
            dd.pieslice((W / 2 - 300, H / 2 - 160, W / 2 + 300, H / 2 + 160), i * 90, i * 90 + 90, fill=COL[k] + (255,))
        L = L.rotate(57, resample=Image.BICUBIC, center=(W / 2, H / 2))
        im.alpha_composite(L)
    big = {'skip': None}.get(sym, sym)
    colr = COL[c] + (255,) if c != 'k' else (255, 255, 255, 255)
    if sym == 'skip':
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        dd = ImageDraw.Draw(L)
        dd.ellipse((150, 300, 410, 560), outline=(0, 0, 0, 255), width=60)
        dd.line((185, 525, 375, 335), fill=(0, 0, 0, 255), width=60)
        dd.ellipse((160, 290, 400, 530), outline=colr, width=44)
        dd.line((195, 495, 365, 325), fill=colr, width=44)
        im.alpha_composite(L)
        small = None
    elif c == 'k':
        text_c(im, sym, 170, W / 2, H / 2, (255, 255, 255, 255), (0, 0, 0, 255), 12, shadow=(0, 0, 0, 255))
    else:
        text_c(im, sym, 330 if len(sym) == 1 else 220, W / 2, H / 2, colr, (0, 0, 0, 255), 14, shadow=(0, 0, 0, 255))
    cs = sym if sym != 'skip' else 'Ø'
    for (x, y, r) in [(92, 120, 0), (W - 92, H - 120, 180)]:
        text_c(im, cs, 110 if len(cs) == 1 else 80, x, y, (255, 255, 255, 255), (0, 0, 0, 255), 7, shadow=(0, 0, 0, 255), rot=r)
    im.convert('RGB').save(path)


def back(path):
    im = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((26, 26, W - 26, H - 26), radius=40, fill=(16, 16, 18, 255))
    im.alpha_composite(ellipse_layer((226, 30, 40, 255), scale=0.92, outline=(252, 196, 0, 255), ow=14))
    im.convert('RGB').save(path)


for c, s in [('r', '7'), ('y', '3'), ('g', '+2'), ('b', '9'), ('r', 'skip'), ('y', '0'), ('g', '5'), ('b', '+2'), ('k', '+4'), ('r', '2'), ('b', '6'), ('g', '1'), ('y', 'skip')]:
    card(c, s, C + 'tex/card_%s_%s.png' % (c, s.replace('+', 'p')))
back(C + 'tex/card_back.png')
print('ok')
