import math
import bpy, bmesh
from mathutils import Vector, Matrix, Euler
import kit as K


def limb(a, b, r0, r1, m, mid=None, seg=20, name='limb'):
    a, b = Vector(a), Vector(b)
    pts = [a, b] if mid is None else [a, Vector(mid), b]
    n = 10
    P, R = [], []
    for i in range(n + 1):
        t = i / n
        if mid is None:
            p = a.lerp(b, t)
        else:
            m0 = Vector(mid)
            p = (1 - t) ** 2 * a + 2 * (1 - t) * t * m0 + t * t * b
        P.append(p)
        R.append(r0 + (r1 - r0) * t)
    ob = K.tube(P, r0, m, seg=seg, radii=R, name=name)
    for v in (a, b):
        pass
    return ob


def ball(p, r, m, sc=(1, 1, 1), name='j'):
    return K.sphere(tuple(p), r, m, seg=24, ring=12, scale=sc, name=name)


def rbox(p, size, m, rot=(0, 0, 0), bev=0.04, name='rb'):
    ob = K.box(tuple(p), size, m, rot=rot, bev=bev, seg=4, name=name)
    return ob


def runner(J, mats, root=None, cap=True, backwards_cap=True, hoodie=True):
    obs = []
    sk, top, pant, shoe, sole, capm, hair, eye, white = mats['skin'], mats['top'], mats['pants'], mats['shoe'], mats['sole'], mats['cap'], mats['hair'], mats['eye'], mats['white']
    pel = Vector(J['pelvis'])
    ch = Vector(J['chest'])
    nk = Vector(J['neck'])
    obs.append(limb(pel, ch, 0.17, 0.2, top, name='torso'))
    obs.append(ball(ch, 0.205, top, (1.05, 0.85, 0.9)))
    obs.append(ball(pel, 0.175, pant, (1.05, 0.85, 0.8)))
    if hoodie:
        hd = K.torus(tuple(ch + (nk - ch) * 0.55), 0.13, 0.05, top, name='hood')
        hd.rotation_euler = (nk - ch).to_track_quat('Z', 'Y').to_euler()
        obs.append(hd)
    obs.append(limb(ch, nk, 0.07, 0.065, sk, name='neck'))
    hc = Vector(J['head'])
    hr = J.get('head_r', 0.17)
    obs.append(ball(hc, hr, sk, (0.95, 1.0, 1.08)))
    fwd = Vector(J.get('face', (0, -1, 0))).normalized()
    up = Vector((0, 0, 1))
    side = fwd.cross(up).normalized()
    for s in (-1, 1):
        ep = hc + fwd * hr * 0.86 + side * s * hr * 0.34 - up * hr * 0.02
        e = ball(ep, hr * 0.2, white, (1, 0.7, 1.3))
        obs.append(e)
        pp = ep + fwd * hr * 0.12
        obs.append(ball(pp + fwd * hr * 0.03, hr * 0.11, eye, (1, 0.7, 1.25)))
        brow = ep + up * hr * 0.27 - fwd * hr * 0.02
        b = K.cyl(tuple(brow), hr * 0.035, hr * 0.28, hair, seg=8, rot=(0, 0, 0))
        b.rotation_euler = side.to_track_quat('Z', 'Y').to_euler()
        obs.append(b)
        er = hc + side * s * hr * 0.98
        obs.append(ball(er, hr * 0.17, sk, (0.6, 1, 1)))
    nose = ball(hc + fwd * hr * 1.0 - up * hr * 0.12, hr * 0.12, sk)
    obs.append(nose)
    mo = K.torus(tuple(hc + fwd * hr * 0.86 - up * hr * 0.4), hr * 0.2, hr * 0.035, mats.get('mouth', eye), name='mouth')
    mo.rotation_euler = fwd.to_track_quat('Z', 'Y').to_euler()
    mo.scale = (1, 0.55, 1)
    obs.append(mo)
    if cap:
        cp = K.sphere(tuple(hc + up * hr * 0.45 - fwd * hr * 0.1), hr * 1.0, capm, seg=32, ring=16, scale=(1, 1, 0.6))
        bm = bmesh.new()
        obs.append(cp)
        bd = -fwd if backwards_cap else fwd
        br = K.cyl(tuple(hc + up * hr * 0.4 + bd * hr * 0.9), hr * 0.55, hr * 0.05, capm, seg=32)
        br.scale = (1, 1, 1)
        br.rotation_euler = Euler((math.radians(-10 if backwards_cap else 10), 0, 0))
        obs.append(br)
        obs.append(ball(hc - fwd * hr * 0.22 + up * hr * 0.12, hr * 1.0, hair, (1.02, 1, 0.92)))
        for s2 in (-1, 1):
            obs.append(ball(hc + side * s2 * hr * 0.8 + up * hr * 0.25 + fwd * hr * 0.3, hr * 0.32, hair, (0.6, 1, 1)))
    for s, key in ((1, 'L'), (-1, 'R')):
        sh = Vector(J['sh' + key])
        el = Vector(J['el' + key])
        wr = Vector(J['wr' + key])
        th = J.get('arm', 1.0)
        obs.append(ball(sh, 0.1 * th, top))
        obs.append(limb(sh, el, 0.095 * th, 0.085 * th, top, name='ua'))
        obs.append(ball(el, 0.085 * th, top))
        obs.append(limb(el, wr, 0.085 * th, 0.08 * th, top, name='fa'))
        obs.append(ball(wr, 0.085 * th, top, (1.1, 1.1, 0.8)))
        hp = wr + (wr - el).normalized() * 0.1
        obs.append(ball(hp, 0.085, sk, (1, 0.85, 1.1)))
        hip = Vector(J['hip' + key])
        kn = Vector(J['kn' + key])
        an = Vector(J['an' + key])
        obs.append(limb(hip, kn, 0.105, 0.09, pant, name='th'))
        obs.append(ball(kn, 0.09, pant))
        obs.append(limb(kn, an, 0.09, 0.075, pant, name='sh'))
        tf = Vector(J['toe' + key])
        d = (tf - an)
        mid = an + d * 0.5
        sh_ = rbox(mid + Vector((0, 0, -0.0)), (0.15, 0.16, 0.13), shoe, bev=0.06)
        sh_.rotation_euler = d.to_track_quat('X', 'Z').to_euler()
        sh_.scale = (d.length / 0.13 + 0.6, 1, 1)
        obs.append(sh_)
        so = rbox(mid + Vector((0, 0, -0.07)), (0.16, 0.17, 0.04), sole, bev=0.015)
        so.rotation_euler = d.to_track_quat('X', 'Z').to_euler()
        so.scale = (d.length / 0.14 + 0.6, 1, 1)
        obs.append(so)
    if root is not None:
        for o in obs:
            o.parent = root
    for o in obs:
        if o.type == 'MESH':
            for p in o.data.polygons:
                p.use_smooth = True
    return obs
