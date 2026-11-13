import os, sys, json, io, subprocess
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
C = os.path.dirname(os.path.abspath(__file__))
O = C + '/official/'
OUT = '/tmp/gameplay-build/w/covers2/'
W, H = 960, 600

PLAN = {
    'rocket-soccer': ('hero', 'library_hero.jpg', 'logo.png', 0.5, 0.2),
    'bean-royale': ('hero', 'library_hero.jpg', 'logo.png', 0.5, 0.22),
    'cookie-baker': ('hero', 'library_hero.jpg', 'logo.png', 0.62, 0.5),
    'gem-swap': ('land', 'capsule_616x353.jpg'),
    'dash-cube': ('land', 'capsule_616x353.jpg'),
    'garden-defense': ('land', 'capsule_616x353.jpg'),
    'moto-stunts': ('land', 'web.img'),
    'hoop-flop': ('land', 'web.img'),
    'block-roll': ('fit', 'web.img', 1.0),
    'slope-3d': ('fit', 'web.img', 1.0),
    'tunnel-run': ('icon', 'web.img', 'Tunnel Rush'),
    'connect-four': ('land', 'wiki.img'),
    'cube-3d': ('fit', 'wiki.img', 0.92),
    'brick-bros': ('fit', 'wiki.img', 0.94),
    'maze-muncher': ('fit', 'wiki.img', 0.94),
    'breakout': ('fit', 'wiki.img', 0.94),
    'pipe-connect': ('fit', 'wiki.img', 0.94),
    'flap-bird': ('icon', 'wiki.img', 'Flappy Bird'),
    'blockcraft-3d': ('icon', 'icon.png', 'Minecraft'),
    'sky-runner': ('icon', 'icon.png', 'Subway Surfers'),
    'road-hopper': ('icon', 'icon.png', 'Crossy Road'),
    'slither': ('icon', 'icon.png', 'slither.io'),
    'paper-land': ('icon', 'icon.png', 'Paper.io'),
    'cell-feast': ('icon', 'icon.png', None),
    'hole-city': ('icon', 'icon.png', 'Hole.io'),
    'maze-tanks': ('icon', 'icon.png', 'Tank Trouble'),
    'last-card': ('icon', 'icon.png', None),
    'highway-3d': ('icon', 'icon.png', 'Traffic Racer'),
    'tetra': ('icon', 'icon.png', None),
    '2048': ('icon', 'icon.png', None),
    'pool': ('icon', 'icon.png', '8 Ball Pool'),
    'helix-3d': ('icon', 'icon.png', 'Helix Jump'),
    'fruit-slice': ('icon', 'icon.png', 'Fruit Ninja'),
    'bubble-pop': ('icon', 'icon.png', 'Bubble Shooter'),
    'piano-tiles': ('icon', 'icon.png', 'Piano Tiles'),
    'knife-throw': ('icon', 'icon.png', 'Knife Hit'),
    'stack': ('icon', 'icon.png', 'Stack'),
    'solitaire': ('icon', 'icon.png', 'Solitaire'),
    'chess': ('icon', 'icon.png', 'Chess'),
    'sudoku': ('icon', 'icon.png', 'Sudoku'),
    'sea-battle': ('icon', 'icon.png', None),
    'invaders': ('icon', 'icon.png', 'Space Invaders'),
    'reversi': ('icon', 'icon.png', 'Reversi'),
    'snake': ('icon', 'icon.png', 'Snake'),
}


def cover(im, w, h):
    s = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x = (im.width - w) // 2
    y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def blurbg(im, dark=0.55, r=28):
    b = cover(im.convert('RGB'), W // 4, H // 4).filter(ImageFilter.GaussianBlur(r / 4)).resize((W, H), Image.BICUBIC)
    b = b.filter(ImageFilter.GaussianBlur(6))
    b = ImageEnhance.Brightness(b).enhance(dark)
    b = ImageEnhance.Color(b).enhance(1.25)
    a = np.asarray(b, dtype=np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    a = a * np.clip(1.1 - 0.45 * d, 0, 1)[:, :, None]
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).convert('RGBA')


def shadow(size, radius, blur=18, off=(0, 14), alpha=150):
    sh = Image.new('RGBA', (size[0] + 120, size[1] + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((60, 60, 60 + size[0], 60 + size[1]), radius, fill=(0, 0, 0, alpha))
    return sh.filter(ImageFilter.GaussianBlur(blur)), off


def paste_card(bg, fg, cx, cy, radius):
    sh, off = shadow(fg.size, radius)
    bg.alpha_composite(sh, (int(cx - fg.width / 2 - 60 + off[0]), int(cy - fg.height / 2 - 60 + off[1])))
    m = Image.new('L', fg.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, fg.width - 1, fg.height - 1), radius, fill=255)
    fg = fg.convert('RGBA')
    al = Image.composite(fg.split()[3], Image.new('L', fg.size, 0), m)
    fg.putalpha(al)
    bg.alpha_composite(fg, (int(cx - fg.width / 2), int(cy - fg.height / 2)))


def build(k):
    p = PLAN[k]
    kind = p[0]
    src = Image.open(O + k + '/' + p[1]).convert('RGBA')
    title = None
    if kind == 'hero':
        hero = src.convert('RGB')
        base = cover(hero, W, H).convert('RGBA')
        lg = Image.open(O + k + '/' + p[2]).convert('RGBA')
        bb = lg.getbbox()
        lg = lg.crop(bb)
        s = min(W * 0.62 / lg.width, H * 0.36 / lg.height)
        lg = lg.resize((round(lg.width * s), round(lg.height * s)), Image.LANCZOS)
        sh = Image.new('RGBA', (lg.width + 80, lg.height + 80), (0, 0, 0, 0))
        sh.paste((0, 0, 0, 160), (40, 40), lg.split()[3].point(lambda v: 255 if v > 30 else 0))
        sh = sh.filter(ImageFilter.GaussianBlur(14))
        cx, cy = W * p[3], H * p[4]
        base.alpha_composite(sh, (int(cx - lg.width / 2 - 40), int(cy - lg.height / 2 - 34)))
        base.alpha_composite(lg, (int(cx - lg.width / 2), int(cy - lg.height / 2)))
        out = base
    elif kind == 'land':
        out = cover(src.convert('RGB'), W, H).convert('RGBA')
    elif kind == 'fit':
        out = blurbg(src, 0.5)
        mh = H * p[2]
        s = min(mh / src.height, (W * 0.9) / src.width)
        fg = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS)
        paste_card(out, fg, W / 2, H / 2, 10)
    elif kind == 'icon':
        title = p[2]
        out = blurbg(src, 0.5)
        sz = 430 if title else 470
        fg = src.resize((sz, sz), Image.LANCZOS)
        cy = H * 0.42 if title else H / 2
        paste_card(out, fg, W / 2, cy, int(sz * 0.2))
    os.makedirs(C + '/post', exist_ok=True)
    path = C + '/post/' + k + '_off.png'
    out.convert('RGB').save(path)
    return path, title


def webp(src, dst, limit=78000):
    im = Image.open(src).convert('RGB')
    for q in (90, 86, 82, 78, 74, 70, 66, 62, 58, 54, 50):
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= limit:
            break
    open(dst, 'wb').write(b.getvalue())
    return q, b.tell()


if __name__ == '__main__':
    ids = sys.argv[1:] or list(PLAN)
    jobs = []
    for k in ids:
        path, title = build(k)
        j = {'id': k, 'bg': path, 'out': C + '/out/' + k + '_off.png'}
        if title:
            j['logo'] = {'lines': [{'t': title, 'size': 100}], 'font': 'Montserrat', 'weight': 900, 'ls': 0.01,
                         'fill': ['#ffffff', '#f2f4f8'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.85, 'shr': 10,
                         'x': 0.5, 'y': 0.88, 'maxw': 0.7, 'maxh': 0.12}
        else:
            j['logo'] = None
        jobs.append(j)
    json.dump(jobs, open(C + '/jobs_off.json', 'w'))
    subprocess.run(['node', C + '/compose.js', C + '/jobs_off.json'], check=True)
    for k in ids:
        print(k, webp(C + '/out/' + k + '_off.png', OUT + k + '.webp'))
