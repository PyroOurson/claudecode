import numpy as np
from cargen import Mesh, loft, sect, box, cyl, fender, finish

BODY, PAINT, GLASS, LW, RED, LR, TRIM, METAL, BRONZE = range(9)
mats = [
    {'k': 'body', 'r': 0.3, 'm': 0.2, 'cc': 0.6, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'paint', 'r': 0.55, 'm': 0.1, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'glass', 'r': 0.06, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'light', 'hex': '#eaf6ff', 'r': 0.5, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'red', 'hex': '#b3141a', 'r': 0.35, 'm': 0.2, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'light', 'hex': '#ff2a14', 'r': 0.5, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'trim', 'hex': '#1a1b1f', 'r': 0.6, 'm': 0.0, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'metal', 'hex': '#7d8188', 'r': 0.3, 'm': 0.85, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
    {'k': 'bronze', 'hex': '#9a7444', 'r': 0.35, 'm': 0.85, 'cc': 0, 'ccr': 0, 'c': [1, 1, 1], 'e': None},
]
FW = (51.25, 25.9, 15.0, 15.0)
RW = (-33.75, 29.5, 15.0, 15.0)
AR = 19.5
M = Mesh()


def arch(x, base):
    z = base
    for wx, _, wz, _ in (FW, RW):
        d = x - wx
        if abs(d) < AR:
            z = max(z, wz + np.sqrt(AR * AR - d * d))
    return z


def quad(pts, mat):
    p = np.asarray(pts, float)
    M.part(p, np.array([[0, 1, 2], [0, 2, 3], [0, 2, 1], [0, 3, 2]]), mat, False)


xs = sorted(set(np.round(np.concatenate([np.linspace(-60, 74, 40), np.linspace(FW[0] - AR, FW[0] + AR, 13), np.linspace(RW[0] - AR, RW[0] + AR, 13)]), 2)))


def lower(x):
    zt = 44.5 if x < 40 else 44.5 - (x - 40) * 0.09
    zb = arch(x, 13.0 if -50 < x < 66 else 17.0)
    w = 27.0 if x < 68 else 27.0 - (x - 68) * 0.45
    if x < -57:
        w -= (x + 57) * -0.6
    return x, w, zb, zt


rings = []
for x in xs:
    x, w, zb, zt = lower(x)
    rings.append(sect(x, 0, (zb + zt) / 2, w, (zt - zb) / 2, 28, 7))
loft(M, rings, BODY)

cab = []
for x in np.linspace(-60, 42, 18):
    zt = 65.5 if x < 20 else 65.5 - (x - 20) * (21.0 / 22.0)
    w = 25.2 if x < 20 else 25.2 - (x - 20) * 0.06
    cab.append(sect(x, 0, (43 + zt) / 2, w, (zt - 43) / 2, 24, 8))
loft(M, cab, BODY)
box(M, 14, 33, -22.5, 22.5, 64.5, 67.2, BODY)
box(M, -58, 14, -21, 21, 65, 66.6, BODY)
for k in range(6):
    box(M, -52 + k * 11, -48 + k * 11, -16, 16, 66.3, 67, BODY)

ws = [[41.4, -21, 44.6], [41.4, 21, 44.6], [21.6, 21.5, 63.6], [21.6, -21.5, 63.6]]
quad([[p[0] + 0.25, p[1], p[2] + 0.25] for p in ws], GLASS)


def side(s):
    y = s * 25.45
    quad([[-30, y + s * 0.15, 47], [12, y + s * 0.15, 47], [12, y + s * 0.15, 62], [-30, y + s * 0.15, 62]], GLASS)
    quad([[15, y, 47], [38.5, y - s * 0.2, 47], [21, y - s * 0.1, 62], [15, y, 62]], GLASS)
    box(M, 12, 15, y - s * 0.3, y + s * 0.6, 46, 63, TRIM)
    box(M, -33, -30, y - s * 0.3, y + s * 0.6, 46, 63, TRIM)
    for W, ext in ((FW, 4.5), (RW, 3.5)):
        yo = s * (27 + ext / 2 + 1)
        fender(M, W[0], yo, W[2], AR - 0.5, AR + 3.5, ext + 4, -12, 192, TRIM, TRIM, 7)
        box(M, W[0] - AR - 4.5, W[0] - AR - 0.5, s * 25, s * (27 + ext + 3), 11, 18, TRIM)
        box(M, W[0] + AR + 0.5, W[0] + AR + 4.5, s * 25, s * (27 + ext + 3), 11, 18, TRIM)
    box(M, RW[0] + AR + 3, FW[0] - AR - 3, s * 25, s * 30.5, 11, 16.5, TRIM)
    box(M, RW[0] + AR, FW[0] - AR, s * 26.6, s * 27.6, 26.5, 28, TRIM)
    box(M, 74.5, 77.6, s * 13, s * 19.5, 36.5, 42.5, LW)
    box(M, 71, 78.5, s * 4, s * 25, 12, 25, TRIM)
    cyl(M, (78, s * 18, 18), (82, s * 18, 18), 3.2, TRIM, 14)
    cyl(M, (81.8, s * 18, 18), (82.6, s * 18, 18), 2.4, BRONZE, 14)
    cyl(M, (79, s * 8, 13), (79, s * 8, 34), 1.2, TRIM, 8)
    box(M, -61, -59.5, s * 21, s * 25.5, 40, 60, LR)
    box(M, -61, -58, s * 21, s * 26, 12, 22, TRIM)
    box(M, 20, 33, s * 19, s * 20.5, 66.6, 68, TRIM)
    cyl(M, (-58, s * 19, 66.6), (12, s * 19, 66.6), 0.9, TRIM, 6)
    box(M, -56, -54, s * 18, s * 20, 64, 67, TRIM)
    box(M, 8, 10, s * 18, s * 20, 64, 67, TRIM)


M.mirror(side)
box(M, 74, 77.2, -12, 12, 30, 43, TRIM)
for k in range(7):
    box(M, 77.0, 77.6, -10.5 + k * 3.5, -9.3 + k * 3.5, 31.5, 41.5, METAL)
box(M, 78.4, 79.6, -10, 10, 12, 34, TRIM)
box(M, 56, 66, -6, 6, 43.5, 45.2, TRIM)
box(M, -61.5, -59.5, -16, 16, 14, 62, TRIM)
for z in (28, 47):
    cyl(M, (-59.5, 0, z), (-66, 0, z), 9.0, BRONZE, 22)
    cyl(M, (-65.5, 0, z), (-67.4, 0, z), 9.6, BRONZE, 22, (False, False))
    cyl(M, (-66.6, 0, z), (-66.9, 0, z), 6.6, TRIM, 22)
    cyl(M, (-66.4, 0, z), (-67.2, 0, z), 2.4, METAL, 12)
for s in (1, -1):
    box(M, -64, -60, s * 10, s * 13, 18, 58, BRONZE)
    cyl(M, (-58, s * 15, 63), (-61.5, s * 15, 63), 1.8, LR, 10)

finish('merc', M, mats, [list(FW), list(RW)], [[-67.4, 0, 28, 5.6], [-67.4, 0, 47, 5.6]], 80, '')
