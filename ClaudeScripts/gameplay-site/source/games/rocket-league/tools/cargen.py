import json, base64, os
import numpy as np

M = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models') + os.sep


def load(k):
    return json.load(open(M + k + '.json'))


def save(k, m):
    json.dump(m, open(M + k + '.json', 'w'), separators=(',', ':'))


def dec(b):
    nv = int(b['nv'])
    lo, sc = np.array(b['lo'], float), np.array(b['sc'], float)
    p = np.frombuffer(base64.b64decode(b['p']), np.uint16).reshape(-1, 3)[:nv] / 65535.0 * sc + lo
    n = np.frombuffer(base64.b64decode(b['n']), np.int8).reshape(-1, 3)[:nv] / 127.0
    big = b['big'] in (True, 'True')
    ix = np.frombuffer(base64.b64decode(b['i']), np.uint32 if big else np.uint16).astype(np.int64)
    uv = None
    if b.get('u'):
        ulo, usc = np.array(b['ulo'], float), np.array(b['usc'], float)
        u0 = np.frombuffer(base64.b64decode(b['u']), np.uint16).reshape(-1, 2)[:int(b['nu'])] / 65535.0 * usc + ulo
        uv = np.zeros((nv, 2)); uv[:len(u0)] = u0
    g = b['g'] if isinstance(b['g'], list) else json.loads(b['g'])
    return {'p': p, 'n': n, 'i': ix, 'uv': uv, 'nu': int(b.get('nu', 0) or 0), 'g': [list(x) for x in g]}


def enc(d):
    p, n, ix, uv = d['p'], d['n'], d['i'], d['uv']
    lo = p.min(0); sc = np.maximum(p.max(0) - lo, 1e-6)
    q = np.round((p - lo) / sc * 65535).clip(0, 65535).astype(np.uint16)
    nn = np.round(np.clip(n, -1, 1) * 127).astype(np.int8)
    big = int(ix.max()) > 65535
    o = {'nv': int(len(p)), 'nt': int(len(ix) // 3), 'lo': [round(float(x), 4) for x in lo], 'sc': [round(float(x), 4) for x in sc],
         'p': base64.b64encode(q.tobytes()).decode(), 'n': base64.b64encode(nn.tobytes()).decode(),
         'i': base64.b64encode(ix.astype(np.uint32 if big else np.uint16).tobytes()).decode(), 'big': big, 'g': d['g']}
    o['lo'] = [float(x) for x in lo]; o['sc'] = [float(x) for x in sc]
    if uv is not None:
        uv = uv[:d.get('nu') or len(uv)]
        ulo = uv.min(0); usc = np.maximum(uv.max(0) - ulo, 1e-6)
        o['nu'] = int(len(uv)); o['ulo'] = [float(x) for x in ulo]; o['usc'] = [float(x) for x in usc]
        o['u'] = base64.b64encode(np.round((uv - ulo) / usc * 65535).clip(0, 65535).astype(np.uint16).tobytes()).decode()
    return o


def regroup(d, tri_mat):
    ix = d['i'].reshape(-1, 3)
    order = np.argsort(tri_mat, kind='stable')
    d['i'] = ix[order].reshape(-1)
    g, st = [], 0
    for mi in sorted(set(tri_mat.tolist())):
        c = int((tri_mat == mi).sum()) * 3
        g.append([int(mi), st, c]); st += c
    d['g'] = g
    return d


def tri_mats(d):
    nt = len(d['i']) // 3
    t = np.zeros(nt, np.int64)
    for mi, st, ct in d['g']:
        t[st // 3:(st + ct) // 3] = mi
    return t




class Mesh:
    def __init__(self):
        self.P, self.N, self.T, self.M = [], [], [], []
        self.n = 0

    def part(self, pos, tris, mat, smooth=True):
        pos = np.asarray(pos, float); tris = np.asarray(tris, np.int64)
        if not smooth:
            pos = pos[tris.reshape(-1)]; tris = np.arange(len(pos)).reshape(-1, 3)
        a, b, c = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
        fn = np.cross(b - a, c - a)
        nrm = np.zeros_like(pos)
        for k in range(3):
            np.add.at(nrm, tris[:, k], fn)
        l = np.linalg.norm(nrm, axis=1, keepdims=True); nrm = nrm / np.maximum(l, 1e-9)
        self.P.append(pos); self.N.append(nrm); self.T.append(tris + self.n); self.M.append(np.full(len(tris), mat))
        self.n += len(pos)

    def mirror(self, fn):
        fn(1); fn(-1)

    def build(self):
        return np.concatenate(self.P), np.concatenate(self.N), np.concatenate(self.T), np.concatenate(self.M)


def orient(pos, tris, centers):
    pos = np.asarray(pos); tris = np.asarray(tris)
    a, b, c = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
    fn = np.cross(b - a, c - a); cen = (a + b + c) / 3
    d = np.einsum('ij,ij->i', fn, cen - centers)
    tris = tris.copy(); f = d < 0
    tris[f] = tris[f][:, [0, 2, 1]]
    return tris


def loft(M, rings, mat, caps=(True, True), smooth=True, flat_edges=False):
    rings = [np.asarray(r, float) for r in rings]
    S, K = len(rings), len(rings[0])
    cent = np.array([r.mean(0) for r in rings])
    if flat_edges:
        for k in range(K):
            k2 = (k + 1) % K
            pos = np.concatenate([np.stack([r[k], r[k2]]) for r in rings])
            tris, cs = [], []
            for i in range(S - 1):
                a, b, c, d = 2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 3
                tris += [[a, b, d], [a, d, c]]; cs += [(cent[i] + cent[i + 1]) / 2] * 2
            M.part(pos, orient(pos, tris, np.array(cs)), mat, smooth)
    else:
        pos = np.concatenate(rings)
        tris, cs = [], []
        for i in range(S - 1):
            for k in range(K):
                k2 = (k + 1) % K
                a, b, c, d = i * K + k, i * K + k2, (i + 1) * K + k, (i + 1) * K + k2
                tris += [[a, b, d], [a, d, c]]; cs += [(cent[i] + cent[i + 1]) / 2] * 2
        M.part(pos, orient(pos, tris, np.array(cs)), mat, smooth)
    for end, on in ((0, caps[0]), (S - 1, caps[1])):
        if not on:
            continue
        r = rings[end]; c0 = cent[end]; nb = cent[1] if end == 0 else cent[-2]
        pos = np.concatenate([r, c0[None]])
        tris = [[k, (k + 1) % K, K] for k in range(K)]
        out = c0 + (c0 - nb) * 10
        M.part(pos, orient(pos, tris, np.tile(2 * c0 - out, (K, 1)) * 0 + nb), mat, False)


def sect(x, yc, zc, w, h, n=16, e=3.0, zb_flat=0.0):
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    c, s = np.cos(t), np.sin(t)
    y = yc + w * np.sign(c) * np.abs(c) ** (2 / e)
    z = zc + h * np.sign(s) * np.abs(s) ** (2 / e)
    return np.stack([np.full(n, x), y, z], 1)


def box(M, x0, x1, y0, y1, z0, z1, mat):
    r0 = [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]]
    r1 = [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]
    loft(M, [r0, r1], mat, smooth=False, flat_edges=True)


def cyl(M, p0, p1, r, mat, n=14, caps=(True, True)):
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    ax = p1 - p0; ax /= np.linalg.norm(ax)
    u = np.cross(ax, [0, 0, 1.0]) if abs(ax[2]) < 0.9 else np.cross(ax, [1.0, 0, 0]); u /= np.linalg.norm(u)
    v = np.cross(ax, u)
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    ring = lambda p: p + r * (np.cos(t)[:, None] * u + np.sin(t)[:, None] * v)
    loft(M, [ring(p0), ring(p1)], mat, caps)


def fender(M, cx, cy, cz, rin, rout, w, a0, a1, body, trim, n=18):
    rings = []
    for a in np.radians(np.linspace(a0, a1, n)):
        c, s = np.cos(a), np.sin(a)
        pts = [[cx + rout * c, cy - w / 2, cz + rout * s], [cx + rout * c, cy + w / 2, cz + rout * s], [cx + rin * c, cy + w / 2, cz + rin * s], [cx + rin * c, cy - w / 2, cz + rin * s]]
        rings.append(pts)
    rings = np.array(rings)
    S = len(rings)
    cent = rings.mean(1)
    for k, mat in ((0, body), (1, trim), (2, trim), (3, trim)):
        k2 = (k + 1) % 4
        pos = np.concatenate([np.stack([r[k], r[k2]]) for r in rings])
        tris, cs = [], []
        for i in range(S - 1):
            a, b, c, d = 2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 3
            tris += [[a, b, d], [a, d, c]]; cs += [(cent[i] + cent[i + 1]) / 2] * 2
        M.part(pos, orient(pos, tris, np.array(cs)), mat, True)


def finish(key, M, mats, wh, nz, tz, credit=''):
    P, N, T, MI = M.build()
    order = np.argsort(MI, kind='stable')
    T = T[order]; MI = MI[order]
    g, st = [], 0
    for mi in sorted(set(MI.tolist())):
        c = int((MI == mi).sum()) * 3; g.append([int(mi), st, c]); st += c
    body = enc({'p': P, 'n': N, 'i': T.reshape(-1), 'uv': None, 'g': g})
    oc = load('octane')
    m = {'v': 2, 'id': key, 'body': body, 'wheel': oc['wheel'], 'mats': mats, 'wmats': oc['wmats'], 'tex': {}, 'wh': wh, 'nz': nz, 'tz': tz, 'credit': credit}
    save(key, m)
    print(key, 'tris', len(T), 'verts', len(P), 'bbox', P.min(0).round(1), P.max(0).round(1))
