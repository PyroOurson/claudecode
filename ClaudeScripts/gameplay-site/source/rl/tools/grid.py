import sys
from PIL import Image
out = sys.argv[1]; files = sys.argv[2:]
ims = [Image.open(f).convert('RGB') for f in files]
w = 640; ims = [i.resize((w, int(i.height * w / i.width))) for i in ims]
h = max(i.height for i in ims); cols = 2; rows = (len(ims) + 1) // 2
g = Image.new('RGB', (w * cols, h * rows), 'white')
for k, i in enumerate(ims): g.paste(i, ((k % cols) * w, (k // cols) * h))
g.save(out)
