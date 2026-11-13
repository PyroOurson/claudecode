import sys, os
sys.path.insert(0, '/tmp/gameplay-build/w')
from meta_rows import ROWS
from PIL import Image, ImageDraw, ImageFont
O = '/tmp/gameplay-build/w/covers2/'
dele = set('demon-halls night-survivors fire-water bomb-blast marble-chain clicker glide jetpack sky-jump lights-out deep-miner fling-birds candy-rope racer shooter hill-climb golf asteroids bowling-3d kart-circuit tower-defense stick-bridge'.split())
ids = [r[0] for r in ROWS if r[0] not in dele]
W, H, L = 320, 200, 22
cols = 6
rows = (len(ids) + cols - 1) // cols
s = Image.new('RGB', (cols * W, rows * (H + L)), (18, 18, 22))
d = ImageDraw.Draw(s)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
missing = []
for i, id_ in enumerate(ids):
    x, y = (i % cols) * W, (i // cols) * (H + L)
    p = O + id_ + '.webp'
    if os.path.exists(p):
        s.paste(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS), (x, y))
    else:
        missing.append(id_)
    d.text((x + 6, y + H + 3), id_, font=f, fill=(200, 200, 210))
s.save(O + 'contact_sheet.jpg', quality=85)
done = [i for i in ids if i not in missing]
sizes = {i: os.path.getsize(O + i + '.webp') for i in done}
with open(O + 'README.md', 'w') as fh:
    fh.write('# Game covers (key art)\n\n')
    fh.write('960x600 (16:10) WebP covers, one per game id, each under 80 KB. Remakes of known games use the official artwork (App Store icons, Steam store art, web portal covers, Wikipedia box art), fitted without stretching; source URLs in `SOURCES.md`. Games with no well-known cover use original key art rendered with Blender 5.2 Cycles plus a title wordmark (no generative AI). Preview: `contact_sheet.jpg`.\n\n')
    fh.write('Sources and tools: `../agents2/covers/` (`scenes/<id>.py` Blender scene per game, `specs.py` logo and grading per game, `make.py` post + compose + WebP, `runfinal.sh <ids>` to rebuild renders, `official.py <ids>` to rebuild official covers from `official/`).\n\n')
    fh.write('Done (%d / %d):\n\n' % (len(done), len(ids)))
    for i in done:
        fh.write('- `%s` (%d KB)\n' % (i, sizes[i] // 1024))
    if missing:
        fh.write('\nMissing: ' + ', '.join(missing) + '\n')
print(len(done), 'done; missing', missing)
