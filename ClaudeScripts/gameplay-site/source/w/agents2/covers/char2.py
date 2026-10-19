import math
import bpy, bmesh
from mathutils import Vector
import kit as K


def skin_mesh(name, chains, m, sub=2):
    verts, radii, edges, idx = [], [], [], {}

    def vid(key, p, r):
        if key not in idx:
            idx[key] = len(verts)
            verts.append(tuple(p))
            radii.append(r)
        return idx[key]
    for ch in chains:
        prev = None
        for (key, p, r) in ch:
            n = vid(key, p, r)
            if prev is not None and prev != n:
                edges.append((prev, n))
            prev = n
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, edges, [])
    ob = K._obj(name, me, m)
    sk = ob.modifiers.new('skin', 'SKIN')
    sk.use_smooth_shade = True
    sk.branch_smoothing = 0.6
    for i, r in enumerate(radii):
        sv = ob.data.skin_vertices[0].data[i]
        sv.radius = (r[0], r[1]) if isinstance(r, tuple) else (r, r)
    ob.data.skin_vertices[0].data[0].use_root = True
    ss = ob.modifiers.new('ss', 'SUBSURF')
    ss.levels = sub
    ss.render_levels = sub
    return ob


def lerp(a, b, t):
    return Vector(a).lerp(Vector(b), t)


def seg(key, a, b, ra, rb, n=3):
    out = []
    for i in range(n + 1):
        t = i / n
        out.append((key + str(i) if 0 < i < n else None, lerp(a, b, t), ra + (rb - ra) * t))
    return out


def figure(J, M, root=None, opts=None):
    o = dict(sleeve=0.55, shorts=False, hair='short', cap=None, head_r=0.25, body=1.0, limb=1.0, belly=1.0, face_mood='smile', backpack=None, tie=None, shoe_scale=1.0, skin_tone=None)
    if opts:
        o.update(opts)
    V = {k: Vector(v) for k, v in J.items() if isinstance(v, tuple) and k != 'face'}
    fwd = Vector(J.get('face', (0, -1, 0))).normalized()
    up = Vector((0, 0, 1))
    obs = []
    bw = o['body']
    lw = o['limb']
    pel, ch, nk, hd = V['pelvis'], V['chest'], V['neck'], V['head']
    spine = [('pel', pel, (0.17 * bw, 0.13 * bw)), ('mid', lerp(pel, ch, 0.5), (0.165 * bw * o['belly'], 0.13 * bw * o['belly'])), ('ch', ch, (0.19 * bw, 0.13 * bw)), ('nk', nk, 0.065)]
    for s in 'LR':
        pass
    skin_chains = [[('pel', pel, (0.15 * bw, 0.11 * bw)), ('mid', lerp(pel, ch, 0.5), (0.145 * bw, 0.11 * bw)), ('ch', ch, (0.17 * bw, 0.11 * bw)), ('nk', nk, 0.06), ('hb', lerp(nk, hd, 0.5), 0.06)]]
    shirt_chains = [[('pel2', pel + (ch - pel) * 0.05, (0.185 * bw, 0.145 * bw)), ('mid', lerp(pel, ch, 0.5), (0.18 * bw * o['belly'], 0.145 * bw * o['belly'])), ('ch', ch, (0.205 * bw, 0.145 * bw)), ('nk', lerp(ch, nk, 0.7), 0.085)]]
    pant_chains = [[('pelp', pel + (ch - pel) * 0.12, (0.18 * bw, 0.14 * bw)), ('pel', pel, (0.175 * bw, 0.14 * bw))]]
    hands = []
    for s in 'LR':
        sh, el, wr = V['sh' + s], V['el' + s], V['wr' + s]
        hp, kn, an = V['hip' + s], V['kn' + s], V['an' + s]
        ua = 0.068 * lw
        fa = 0.056 * lw
        sl = o['sleeve']
        arm_pts = [('sh' + s, sh, ua * 1.15), ('ua' + s, lerp(sh, el, 0.5), ua), ('el' + s, el, fa * 1.05), ('fa' + s, lerp(el, wr, 0.5), fa), ('wr' + s, wr, fa * 0.85)]
        skin_chains.append([('ch', ch, (0.17 * bw, 0.11 * bw)), ('chs' + s, lerp(ch, sh, 0.5), 0.09)] + arm_pts)
        if sl > 0:
            sp = [('ch', ch, (0.205 * bw, 0.145 * bw)), ('shs' + s, sh, ua * 1.45)]
            if sl <= 0.5:
                sp.append(('sle' + s, lerp(sh, el, sl * 2), ua * 1.35))
            else:
                sp += [('sle' + s, el, fa * 1.4), ('slf' + s, lerp(el, wr, (sl - 0.5) * 2 * 0.95), fa * 1.35)]
            shirt_chains.append(sp)
        leg_r = 0.085 * lw
        skin_chains.append([('pel', pel, (0.15 * bw, 0.11 * bw)), ('hp' + s, hp, leg_r), ('th' + s, lerp(hp, kn, 0.5), leg_r * 0.92), ('kn' + s, kn, leg_r * 0.8), ('sn' + s, lerp(kn, an, 0.5), leg_r * 0.72), ('an' + s, an, leg_r * 0.55)])
        pc = [('pel', pel, (0.175 * bw, 0.14 * bw)), ('hpp' + s, hp, leg_r * 1.25), ('thp' + s, lerp(hp, kn, 0.5), leg_r * 1.15)]
        if o['shorts']:
            pc.append(('kp' + s, lerp(hp, kn, 0.85), leg_r * 1.15))
        else:
            pc += [('knp' + s, kn, leg_r * 1.05), ('snp' + s, lerp(kn, an, 0.5), leg_r * 0.98), ('anp' + s, an + (kn - an).normalized() * 0.04, leg_r * 0.95)]
        pant_chains.append(pc)
        d = (wr - el).normalized()
        hc = wr + d * 0.07 * lw
        hands.append((hc, d, s))
        toe = V['toe' + s]
        fd = (toe - an)
        fd.z = 0
        if fd.length < 1e-3:
            fd = fwd.copy()
        fd.normalize()
        ss = o['shoe_scale']
        shoe = K.sphere(tuple(an + fd * 0.07 * ss - up * 0.03), 0.1 * ss, M['shoe'], seg=32, ring=16, scale=(1, 1, 1))
        shoe.scale = (1.55, 0.95, 0.75)
        shoe.rotation_euler = fd.to_track_quat('X', 'Z').to_euler()
        obs.append(shoe)
        sole = K.sphere(tuple(an + fd * 0.07 * ss - up * 0.085 * ss), 0.1 * ss, M['sole'], seg=32, ring=12)
        sole.scale = (1.62, 1.0, 0.3)
        sole.rotation_euler = fd.to_track_quat('X', 'Z').to_euler()
        obs.append(sole)
    body = skin_mesh('skinb', skin_chains, M['skin'])
    shirt = skin_mesh('shirt', shirt_chains, M['top'])
    pants = skin_mesh('pants', pant_chains, M['pants'])
    obs += [body, shirt, pants]
    for (hc, d, s) in hands:
        h = K.sphere(tuple(hc), 0.065 * lw * (1.3 if 'hand' in M else 1.0), M.get('hand', M['skin']), seg=24, ring=12)
        h.scale = (1.0, 0.85, 1.15)
        h.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
        obs.append(h)
        side = d.cross(up)
        if side.length < 1e-3:
            side = Vector((1, 0, 0))
        side.normalize()
        th = K.sphere(tuple(hc - d * 0.02 + side * (0.05 if s == 'L' else -0.05) * lw), 0.026 * lw * (1.3 if 'hand' in M else 1.0), M.get('hand', M['skin']), seg=12, ring=8, scale=(1, 1, 1.6))
        obs.append(th)
    hr = o['head_r']
    side = fwd.cross(up).normalized()
    upv = side.cross(fwd).normalized()
    head = K.sphere(tuple(hd), hr, M['skin'], seg=48, ring=24)
    head.scale = (1.0, 1.0, 1.0)
    obs.append(head)
    jaw = K.sphere(tuple(hd - upv * hr * 0.3 + fwd * hr * 0.12), hr * 0.82, M['skin'], seg=40, ring=20, scale=(1.0, 1.0, 0.8))
    obs.append(jaw)
    for sgn in (-1, 1):
        ec = hd + fwd * hr * 0.8 + side * sgn * hr * 0.37 - upv * hr * 0.06
        e = K.sphere(tuple(ec), hr * 0.25, M['white'], seg=32, ring=16)
        e.scale = (1.0, 1.0, 1.25)
        e.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        obs.append(e)
        ic = ec + fwd * hr * 0.2 - side * sgn * hr * 0.01
        ir = K.sphere(tuple(ic), hr * 0.15, M.get('iris', M['eye']), seg=24, ring=12, scale=(1, 1, 1.15))
        ir.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        ir.scale = (1.0, 0.45, 1.15)
        obs.append(ir)
        pp = K.sphere(tuple(ic + fwd * hr * 0.03), hr * 0.085, M['eye'], seg=16, ring=8)
        pp.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        pp.scale = (1.0, 0.4, 1.1)
        obs.append(pp)
        hl = K.sphere(tuple(ic + fwd * hr * 0.06 + upv * hr * 0.06 + side * hr * 0.04), hr * 0.035, K.emit_mat('hl', '#ffffff', 2), seg=8, ring=6)
        obs.append(hl)
        bb = ec + upv * hr * 0.36 + fwd * hr * 0.1
        mood = o['face_mood']
        tilt = 0.08 if mood == 'angry' else -0.03
        bp = [bb - side * hr * 0.16 + upv * hr * (tilt if sgn > 0 else -tilt), bb + upv * hr * 0.04, bb + side * hr * 0.16 + upv * hr * (-tilt if sgn > 0 else tilt)]
        obs.append(K.tube(bp, hr * 0.035, M['hair'], seg=8, radii=[hr * 0.02, hr * 0.04, hr * 0.02]))
        ear = K.sphere(tuple(hd + side * sgn * hr * 0.95 - upv * hr * 0.05), hr * 0.18, M['skin'], seg=16, ring=8)
        ear.scale = (0.5, 1.0, 1.3)
        ear.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        obs.append(ear)
    nose = K.sphere(tuple(hd + fwd * hr * 1.0 - upv * hr * 0.12), hr * 0.12, M['skin'], seg=16, ring=8, scale=(1, 1, 0.85))
    obs.append(nose)
    jc = hd - upv * hr * 0.3 + fwd * hr * 0.12
    mc = jc + fwd * hr * 0.8 - upv * hr * 0.12
    if o['face_mood'] == 'open':
        mo = K.sphere(tuple(mc), hr * 0.17, M['mouth'], seg=24, ring=12)
        mo.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        mo.scale = (1.3, 0.5, 0.9)
        obs.append(mo)
        tt = K.sphere(tuple(mc + upv * hr * 0.08 + fwd * hr * 0.02), hr * 0.12, M['white'], seg=16, ring=8)
        tt.rotation_euler = fwd.to_track_quat('Y', 'Z').to_euler()
        tt.scale = (1.4, 0.3, 0.35)
        obs.append(tt)
    else:
        k = 1 if o['face_mood'] in ('smile', 'grin') else -1
        mp = [mc - side * hr * 0.28 + upv * hr * 0.09 * k, mc - upv * hr * 0.06 * k, mc + side * hr * 0.28 + upv * hr * 0.09 * k]
        sm = []
        for i in range(9):
            t = i / 8
            sm.append((1 - t) ** 2 * mp[0] + 2 * (1 - t) * t * mp[1] + t * t * mp[2])
        obs.append(K.tube(sm, hr * 0.03, M['mouth'], seg=8, radii=[hr * 0.02 + hr * 0.035 * math.sin(math.pi * i / 8) for i in range(9)]))
    hm = M['hair']
    hs = o['hair']
    if hs in ('short', 'messy') and not o['cap']:
        hs = hs
    if hs in ('short', 'messy'):
        cap = K.sphere(tuple(hd + upv * hr * 0.22 - fwd * hr * 0.12), hr * 1.05, hm, seg=40, ring=20, scale=(1.0, 1.0, 0.82))
        obs.append(cap)
        for i in range(0 if o['cap'] else (7 if hs == 'messy' else 5)):
            a = -0.9 + i * 0.3
            p = hd + upv * hr * 0.72 + fwd * hr * (0.5 - abs(a) * 0.15) + side * hr * a * 0.8
            tf = K.sphere(tuple(p), hr * 0.3, hm, seg=16, ring=8, scale=(1.0, 0.7, 0.55))
            tf.rotation_euler = (fwd * 1).to_track_quat('Y', 'Z').to_euler()
            obs.append(tf)
    if o['cap']:
        cm = o['cap']
        back = o.get('cap_back', True)
        c = K.sphere(tuple(hd + upv * hr * 0.42 - fwd * hr * 0.08), hr * 1.03, cm, seg=40, ring=20, scale=(1, 1, 0.62))
        obs.append(c)
        bd = -fwd if back else fwd
        br = K.cyl(tuple(hd + upv * hr * 0.42 + bd * hr * 0.92), hr * 0.62, hr * 0.06, cm, seg=40)
        br.scale = (1, 0.75, 1)
        br.rotation_euler = bd.to_track_quat('Y', 'Z').to_euler()
        br.rotation_euler.rotate_axis('X', math.radians(80))
        obs.append(br)
        obs.append(K.sphere(tuple(hd + upv * hr * 1.0), hr * 0.08, cm, seg=12, ring=6))
    if o['backpack']:
        obs.append(K.box(tuple(ch - fwd * 0.2 - upv * 0.05), (0.32, 0.18, 0.4), o['backpack'], bev=0.07))
    if o['tie']:
        obs.append(K.box(tuple(ch + fwd * 0.15 - upv * 0.06), (0.06, 0.03, 0.3), o['tie'], bev=0.01))
    if root is not None:
        for ob in obs:
            if ob.parent is None:
                ob.parent = root
    return obs
