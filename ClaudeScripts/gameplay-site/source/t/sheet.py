import sys, os, json
from PIL import Image, ImageDraw
d = sys.argv[1]; suffix = sys.argv[2]; start = int(sys.argv[3]); n = int(sys.argv[4]); out = sys.argv[5]
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 3
crop = sys.argv[7] if len(sys.argv) > 7 else ''
ids = []
for f in sorted(os.listdir(d)):
    if f.endswith('_' + suffix + '.png'): ids.append(f[:-len('_' + suffix + '.png')])
order = json.load(open('order.json'))
ids.sort(key=lambda i: order.index(i) if i in order else 999)
ids = ids[start:start + n]
tw, th = (1280 // cols), int(1280 // cols * 0.625)
rows = (len(ids) + cols - 1) // cols
S = Image.new('RGB', (1280, rows * th), 'white')
for k, i in enumerate(ids):
    im = Image.open('%s/%s_%s.png' % (d, i, suffix))
    if crop:
        x0, y0, x1, y1 = [int(v) for v in crop.split(',')]
        im = im.crop((x0, y0, x1, y1))
    im = im.resize((tw, th))
    dr = ImageDraw.Draw(im); dr.rectangle((0, 0, 170, 16), fill='black'); dr.text((3, 2), i, fill='white')
    S.paste(im, ((k % cols) * tw, (k // cols) * th))
S.save(out)
print(len(ids), ids)
