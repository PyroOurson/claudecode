import io, json, os, sys
from PIL import Image, ImageDraw

D = os.path.dirname(os.path.abspath(__file__))
PNG = os.environ.get('COVER_PNG', 'C:/tmp/gameplay-build/w/agents3/covers/png')
OUT = os.environ.get('COVER_OUT', 'C:/tmp/gameplay-build/w/agents3/covers/out')
os.makedirs(OUT, exist_ok=True)
games = json.load(open(os.path.join(D, 'games.json'), encoding='utf-8'))
ids = sys.argv[1:] or [g[0] for g in games]


def enc(im):
    for q in (90, 86, 82, 78, 74, 70, 64, 58):
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= 80000:
            return b.getvalue(), q
    return b.getvalue(), q


for i in ids:
    src = os.path.join(PNG, i + '.png')
    if not os.path.exists(src):
        print('missing', i)
        continue
    im = Image.open(src).convert('RGB')
    assert im.size == (960, 600), (i, im.size)
    data, q = enc(im)
    open(os.path.join(OUT, i + '.webp'), 'wb').write(data)
    print(i, len(data) // 1024, 'KB q', q)

cols, tw, th = 6, 320, 200
have = [g for g in games if (len(sys.argv) < 2 or g[0] in ids) and os.path.exists(os.path.join(OUT, g[0] + '.webp'))]
rows = (len(have) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 18)), (20, 20, 24))
dr = ImageDraw.Draw(sheet)
for n, g in enumerate(have):
    x, y = n % cols * tw, n // cols * (th + 18)
    sheet.paste(Image.open(os.path.join(OUT, g[0] + '.webp')).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y))
    dr.text((x + 4, y + th + 3), g[0], fill=(200, 200, 200))
sheet.save(os.environ.get('COVER_SHEET', os.path.join(OUT, 'contact_sheet.jpg')), quality=82)
