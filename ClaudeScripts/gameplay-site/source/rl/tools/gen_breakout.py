import numpy as np
from cargen import Mesh, loft, sect, box, cyl, fender, finish

BODY, PAINT, GLASS, LW, LO, LR, TRIM, METAL, RED = range(9)
mats = [
    {'k': 'body', 'r': 0.3, 'm': 0.2, 'cc': 0.6, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'paint', 'r': 0.55, 'm': 0.1, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'glass', 'r': 0.06, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'light', 'hex': '#ffe7a6', 'r': 0.5, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'light', 'hex': '#ffb21a', 'r': 0.5, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'light', 'hex': '#ff2a14', 'r': 0.5, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'trim', 'hex': '#1a1b1f', 'r': 0.6, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'metal', 'hex': '#8c9198', 'r': 0.35, 'm': 0.8, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'red', 'hex': '#9c1a16', 'r': 0.4, 'm': 0.3, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
]
FW = (51.5, 26.67, 13.5, 13.5)
RW = (-35.75, 35.0, 15.0, 15.0)
M = Mesh()

PRO = [(81, 14, 8.5, 13.5), (77, 20, 8, 18), (70, 24, 8, 23), (62, 26.5, 8, 27), (51, 28, 8, 30), (40, 28, 8, 30.5), (30, 28.5, 8, 31.5), (15, 30, 8, 33), (0, 31.5, 8, 34.5), (-15, 33.5, 8, 36), (-28, 35, 8, 37), (-40, 35.5, 8, 37.5), (-50, 34.5, 8, 37), (-58, 32, 9, 35), (-63, 28, 10, 31)]


def prof(x):
    xs = [p[0] for p in PRO][::-1]
    return [float(np.interp(x, xs, [p[k] for p in PRO][::-1])) for k in (1, 2, 3)]


def zbot(x, base):
    z = base
    for wx, _, wz, r in (FW, RW):
        R = r + 3.2
        d = x - wx
        if abs(d) < R:
            z = max(z, wz + np.sqrt(R * R - d * d))
    return z


xs = sorted(set(np.round(np.concatenate([np.linspace(-63, 81, 40), np.linspace(FW[0] - 16.7, FW[0] + 16.7, 13), np.linspace(RW[0] - 18.2, RW[0] + 18.2, 13)]), 2)), reverse=True)
rings = []
for x in xs:
    w, zb, zt = prof(x)
    for wx, wy, wz, r in (FW, RW):
        if abs(x - wx) < r + 4:
            w = min(w, wy - 6.8)
    rings.append(sect(x, 0, (zb + zt) / 2, w, (zt - zb) / 2, 28, 5.5))
loft(M, rings, BODY)


def hood(x):
    return prof(x)[2]


sp = [(x, hood(x)) for x in np.linspace(78, 28, 11)]
loft(M, [sect(x, 0, z + 0.4, 4.2 + (78 - x) * 0.02, 1.6 + (78 - x) * 0.025, 14, 3) for x, z in sp], BODY)
for s in (1, -1):
    loft(M, [[[x, s * (yi + (78 - x) * 0.03), z + 0.2], [x, s * (yo + (78 - x) * 0.06), z - 0.1], [x, s * (yo + (78 - x) * 0.06), z + 0.5], [x, s * (yi + (78 - x) * 0.03), z + 0.8]] for x, z in sp for yi, yo in [(4.6, 8.5)]], TRIM, smooth=False, flat_edges=True)

cab = [(30, 4, 32, 33.5), (24, 18, 32, 37.5), (14, 21, 32.5, 43.5), (2, 21.5, 33, 46), (-10, 21, 33.5, 46.2), (-22, 20, 34, 45.3), (-34, 17, 35, 42.5), (-46, 13, 35.5, 39), (-54, 8, 35, 36.5)]
loft(M, [sect(x, 0, (zb + zt) / 2, w, (zt - zb) / 2, 22, 3.6) for x, w, zb, zt in cab], GLASS)
rf = [(6, 16, 44.6, 46.6), (-4, 19, 44.5, 46.7), (-16, 19.5, 43.5, 46.4), (-28, 18.5, 41, 44.6), (-40, 16, 38, 41.3), (-52, 11, 35.5, 37.6), (-57, 6, 34.5, 35.8)]
loft(M, [sect(x, 0, (zb + zt) / 2, w, (zt - zb) / 2, 22, 4) for x, w, zb, zt in rf], BODY)
for s in (1, -1):
    loft(M, [sect(x, s * y, z, 2.6, h, 10, 3) for x, y, z, h in [(-14, 19.5, 40, 5), (-26, 18.5, 39, 4.5), (-40, 16.5, 37.5, 3), (-50, 12.5, 36, 1.5)]], BODY)


def side(s):
    for wx, wy, wz, r in (FW, RW):
        fender(M, wx, s * wy, wz, r + 1.2, r + 4.0, 12, -14, 194, BODY, TRIM, 16)
    pts = []
    for x in np.linspace(30, -16, 10):
        w = prof(x)[0]
        pts.append([[x, s * (w - 1.2), 13], [x, s * (w + 0.35), 13], [x, s * (w + 0.35), 24], [x, s * (w - 1.2), 24]])
    loft(M, pts, TRIM, smooth=False, flat_edges=True)
    for k in range(4):
        x0 = 24 - k * 10
        w = prof(x0)[0]
        box(M, x0 - 6, x0, s * (w + 0.2), s * (w + 0.6), 14.5, 15.5, METAL)
    pts = []
    for x in np.linspace(62, 30, 7):
        w = prof(x)[0]
        pts.append([[x, s * (w - 0.8), 27.6], [x, s * (w + 0.3), 27.6], [x, s * (w + 0.3), 28.4], [x, s * (w - 0.8), 28.4]])
    loft(M, pts, TRIM, smooth=False, flat_edges=True)
    loft(M, [[[x, s * a, z0], [x, s * b, z0], [x, s * b, z0 + 2.4], [x, s * a, z0 + 2.4]] for x, a, b, z0 in [(77.8, 10.5, 17.5, 17.4), (75.5, 11.5, 20.5, 19.3), (73.5, 12.5, 21.5, 20.6)]], LW, smooth=False, flat_edges=True)
    box(M, 80.4, 81.4, s * 5, s * 12.5, 9.5, 11.2, LO)
    box(M, -63.6, -62.4, s * 17, s * 27, 22, 25, LR)
    box(M, -45, -30, s * 4, s * 11, 36, 39.5, RED)
    cyl(M, (-58, s * 9, 34), (-64, s * 9, 36.5), 2.4, METAL, 12)


M.mirror(side)
box(M, 79, 81.2, -12, 12, 9, 12.5, TRIM)
box(M, -64, -60, -16, 16, 10, 22, TRIM)
for k in range(5):
    box(M, -64.6, -63.8, -10, 10, 11.5 + k * 2.1, 12.4 + k * 2.1, METAL)
cyl(M, (-58, 0, 26), (-64.5, 0, 26), 6.2, TRIM, 18)
cyl(M, (-64.3, 0, 26), (-64.8, 0, 26), 4.8, METAL, 18)

finish('breakout', M, mats, [list(FW), list(RW)], [[-64.8, 0, 26, 5.4]], 62, '')
