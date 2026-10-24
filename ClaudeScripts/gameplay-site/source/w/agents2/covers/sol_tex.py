from PIL import Image, ImageDraw, ImageFont
C = '/tmp/gameplay-build/w/agents2/covers/'
W, H = 500, 700
SY = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
RF = C + 'fonts/Playfair_Display_wght_900.ttf'
suits = {'s': ('♠', (20, 20, 24)), 'h': ('♥', (210, 20, 40)), 'd': ('♦', (210, 20, 40)), 'c': ('♣', (20, 20, 24))}


def card(rank, s, path):
    im = Image.new('RGB', (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((6, 6, W - 6, H - 6), 36, fill=(252, 250, 244), outline=(200, 196, 186), width=3)
    sym, col = suits[s]
    fr = ImageFont.truetype(RF, 90)
    fs = ImageFont.truetype(SY, 70)
    for (x, y, rot) in [(50, 40, 0), (W - 50, H - 40, 180)]:
        L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        dl = ImageDraw.Draw(L)
        bb = dl.textbbox((0, 0), rank, font=fr)
        dl.text((50 - (bb[2] - bb[0]) / 2 - bb[0] + (0 if rot == 0 else 0), 30), rank, font=fr, fill=col)
        bb2 = dl.textbbox((0, 0), sym, font=fs)
        dl.text((50 - (bb2[2] - bb2[0]) / 2 - bb2[0], 140), sym, font=fs, fill=col)
        if rot:
            L = L.rotate(180)
        im.paste(L, (0, 0), L)
    big = ImageFont.truetype(SY, 300 if rank in 'AJQK' else 230)
    bb = d.textbbox((0, 0), sym, font=big)
    d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], H / 2 - (bb[3] - bb[1]) / 2 - bb[1]), sym, font=big, fill=col)
    if rank in 'JQK':
        d.rounded_rectangle((110, 150, W - 110, H - 150), 20, outline=(200, 160, 40), width=8)
        f2 = ImageFont.truetype(RF, 120)
        bb = d.textbbox((0, 0), rank, font=f2)
        d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], 170), rank, font=f2, fill=(200, 160, 40))
    im.save(path)


for r, s in [('A', 's'), ('K', 'h'), ('Q', 'd'), ('J', 'c'), ('10', 'h'), ('9', 's'), ('8', 'd'), ('7', 'c'), ('A', 'h'), ('A', 'd'), ('A', 'c'), ('6', 'h'), ('5', 's')]:
    card(r, s, C + 'tex/pc_%s%s.png' % (r, s))
im = Image.new('RGB', (W, H), (255, 255, 255))
d = ImageDraw.Draw(im)
d.rounded_rectangle((6, 6, W - 6, H - 6), 36, fill=(20, 60, 160))
for y in range(30, H, 28):
    for x in range(30, W, 28):
        d.line((x - 10, y, x, y - 10, x + 10, y, x, y + 10, x - 10, y), fill=(60, 110, 220), width=3)
d.rounded_rectangle((30, 30, W - 30, H - 30), 24, outline=(255, 255, 255), width=8)
im.save(C + 'tex/pc_back.png')
print('ok')
