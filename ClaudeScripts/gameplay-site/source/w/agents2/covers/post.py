import sys, os, json
import numpy as np
from PIL import Image, ImageFilter

C = os.path.dirname(os.path.abspath(__file__))


def hexf(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], dtype=np.float32)


def blur(a, r):
    if r <= 0:
        return a
    im = Image.fromarray(np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8), 'RGB')
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def rays(a, cx, cy, n=24, decay=0.965, th=0.75, strength=0.5):
    h, w = a.shape[:2]
    lum = a.mean(2)
    m = np.clip((lum - th) / (1 - th + 1e-6), 0, 1)[:, :, None] * a
    src = Image.fromarray(np.clip(m * 255, 0, 255).astype(np.uint8), 'RGB')
    acc = np.zeros_like(a)
    wsum = 0
    k = 1.0
    for i in range(n):
        s = 1 + i * 0.025
        nw, nh = int(w * s), int(h * s)
        im = src.resize((nw, nh), Image.BILINEAR)
        ox = int(cx * w * s - cx * w)
        oy = int(cy * h * s - cy * h)
        im = im.crop((ox, oy, ox + w, oy + h))
        acc += np.asarray(im, dtype=np.float32) / 255 * k
        wsum += k
        k *= decay
    return acc / wsum * strength


def process(id_, p, src=None, dst=None):
    src = src or (C + '/renders/' + id_ + '.png')
    dst = dst or (C + '/post/' + id_ + '.png')
    im0 = Image.open(src)
    alpha = None
    if im0.mode == 'RGBA':
        alpha = np.asarray(im0.split()[3], dtype=np.float32) / 255
    im = im0.convert('RGB')
    a = np.asarray(im, dtype=np.float32) / 255
    h, w = a.shape[:2]
    zp = src.replace('.png', '_z.png')
    hz = p.get('haze')
    if hz and os.path.exists(zp):
        z = np.asarray(Image.open(zp).convert('L').resize((w, h)), dtype=np.float32) / 255
        f = np.clip((z - hz.get('start', 0.2)) / (hz.get('end', 1.0) - hz.get('start', 0.2)), 0, 1) ** hz.get('pow', 1.0) * hz.get('amount', 0.6)
        if hz.get('sky', False) is False:
            f = np.where(z > 0.995, 0, f)
        hc = hexf(hz.get('color', '#c8dcff'))
        a = a * (1 - f[:, :, None]) + hc * f[:, :, None]
    dof = p.get('dof')
    if dof and os.path.exists(zp):
        z = np.asarray(Image.open(zp).convert('L').resize((w, h)), dtype=np.float32) / 255
        k = np.clip((z - dof['z0']) / (dof['z1'] - dof['z0']), 0, 1)
        b1 = blur(a, dof['r'] * 0.4)
        b2 = blur(a, dof['r'])
        k = np.asarray(Image.fromarray((k * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(dof.get('feather', 3))), dtype=np.float32)[:, :, None] / 255
        k1 = np.clip(k * 2, 0, 1)
        k2 = np.clip(k * 2 - 1, 0, 1)
        a = a * (1 - k1) + b1 * k1
        a = a * (1 - k2) + b2 * k2
    g = p.get('grade', {})
    if g.get('exposure'):
        a = a * g['exposure']
    if g.get('lift') is not None:
        lc = hexf(g.get('liftc', '#102040'))
        a = a + (1 - a) * lc * g['lift']
    if g.get('gain'):
        gc = hexf(g['gain'])
        a = a * gc / max(gc.max(), 1e-6) * g.get('gainamt', 1.0) + a * (1 - g.get('gainamt', 1.0))
    sat = g.get('sat', 1.08)
    l = a.mean(2, keepdims=True)
    a = l + (a - l) * sat
    con = g.get('con', 1.06)
    a = (a - 0.5) * con + 0.5
    if g.get('split'):
        sh = hexf(g['split'][0])
        hi = hexf(g['split'][1])
        amt = g['split'][2] if len(g['split']) > 2 else 0.12
        l = np.clip(a.mean(2, keepdims=True), 0, 1)
        a = a + ((sh - 0.5) * (1 - l) + (hi - 0.5) * l) * amt
    a = np.clip(a, 0, 1)
    b = p.get('bloom', {'th': 0.72, 'amt': 0.35, 'r': 18})
    if b:
        lum = a.max(2)
        m = np.clip((lum - b['th']) / (1 - b['th'] + 1e-6), 0, 1)[:, :, None] * a
        bl = blur(m, b['r']) * 0.6 + blur(m, b['r'] * 3) * 0.4
        if b.get('tint'):
            bl = bl * hexf(b['tint']) * 1.4
        a = 1 - (1 - a) * (1 - np.clip(bl * b['amt'] * 2, 0, 1))
    r = p.get('rays')
    if r:
        rr = rays(a, r['x'], r['y'], th=r.get('th', 0.8), strength=r.get('amt', 0.5))
        if r.get('tint'):
            rr = rr * hexf(r['tint'])
        a = 1 - (1 - a) * (1 - np.clip(rr, 0, 1))
    if p.get('ca', 0.0):
        s = p['ca']
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        dx = (xx - w / 2) / (w / 2)
        dy = (yy - h / 2) / (h / 2)
        img = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
        r_ = np.asarray(img.resize((int(w * (1 + s)), int(h * (1 + s))), Image.BILINEAR), dtype=np.float32)[:, :, 0] / 255
        ox = (r_.shape[1] - w) // 2
        oy = (r_.shape[0] - h) // 2
        a[:, :, 0] = r_[oy:oy + h, ox:ox + w]
    v = p.get('vig', 0.35)
    if v:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 * 0.8 + ((yy - h / 2) / (h / 2)) ** 2 * 0.9)
        f = np.clip(1 - v * np.clip(d - 0.45, 0, 2) ** 1.6, 0, 1)
        a = a * f[:, :, None]
    tg = p.get('topgrad')
    if tg:
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
        f = np.clip(1 - yy / tg.get('h', 0.4), 0, 1) ** 1.5 * tg.get('amt', 0.5)
        a = a * (1 - f) + hexf(tg.get('color', '#000000')) * f
    bg = p.get('botgrad')
    if bg:
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
        f = np.clip((yy - (1 - bg.get('h', 0.4))) / bg.get('h', 0.4), 0, 1) ** 1.5 * bg.get('amt', 0.5)
        a = a * (1 - f) + hexf(bg.get('color', '#000000')) * f
    gr = p.get('grain', 0.01)
    if gr:
        rng = np.random.default_rng(3)
        n = rng.normal(0, gr, (h, w, 1)).astype(np.float32)
        a = a + n
    a = np.clip(a, 0, 1)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if alpha is not None and p.get('keep_alpha'):
        out = np.concatenate([a, alpha[:, :, None]], 2)
        Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA').save(dst)
    else:
        Image.fromarray((a * 255 + 0.5).astype(np.uint8)).save(dst)
    return dst


if __name__ == '__main__':
    sys.path.insert(0, C)
    from specs import SPECS
    for id_ in sys.argv[1:]:
        q = id_.endswith('_q')
        base = id_[:-2] if q else id_
        print(process(id_, SPECS.get(base, {}).get('post', {})))
