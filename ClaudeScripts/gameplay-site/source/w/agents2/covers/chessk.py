import math
import bpy, bmesh
from mathutils import Vector
import kit as K

S = 1.0


def _smooth(prof, n=3):
    out = prof
    for _ in range(n):
        new = [out[0]]
        for i in range(len(out) - 1):
            a, b = out[i], out[i + 1]
            new.append((a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25))
            new.append((a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75))
        new.append(out[-1])
        out = new
    return out


BASE = [(0.0, 0.0), (0.4, 0.0), (0.41, 0.03), (0.41, 0.07), (0.37, 0.1), (0.38, 0.13), (0.34, 0.16), (0.29, 0.19)]
PROF = {
    'pawn': BASE[:-1] + [(0.3, 0.18), (0.24, 0.22), (0.19, 0.27), (0.14, 0.42), (0.12, 0.55), (0.21, 0.58), (0.21, 0.61), (0.12, 0.63), (0.15, 0.68), (0.18, 0.75), (0.17, 0.83), (0.12, 0.9), (0.05, 0.93), (0.0, 0.935)],
    'king': BASE + [(0.25, 0.24), (0.2, 0.33), (0.165, 0.55), (0.14, 0.9), (0.15, 1.05), (0.27, 1.09), (0.27, 1.13), (0.16, 1.16), (0.19, 1.22), (0.25, 1.35), (0.27, 1.43), (0.22, 1.47), (0.14, 1.5), (0.07, 1.52), (0.0, 1.52)],
    'queen': BASE + [(0.25, 0.24), (0.2, 0.33), (0.16, 0.55), (0.13, 0.88), (0.14, 1.0), (0.25, 1.04), (0.25, 1.08), (0.15, 1.11), (0.17, 1.17), (0.25, 1.33), (0.29, 1.4), (0.23, 1.42), (0.15, 1.45), (0.08, 1.49), (0.0, 1.5)],
    'bishop': BASE + [(0.24, 0.24), (0.18, 0.33), (0.14, 0.55), (0.12, 0.78), (0.22, 0.82), (0.22, 0.86), (0.12, 0.88), (0.15, 0.93), (0.19, 1.02), (0.19, 1.12), (0.15, 1.2), (0.09, 1.27), (0.05, 1.3), (0.07, 1.33), (0.05, 1.37), (0.0, 1.38)],
    'rook': BASE + [(0.27, 0.24), (0.24, 0.32), (0.22, 0.6), (0.22, 0.8), (0.26, 0.84), (0.29, 0.86), (0.29, 1.02), (0.22, 1.02), (0.22, 0.95), (0.0, 0.95)],
    'knightbase': BASE + [(0.27, 0.24), (0.25, 0.3), (0.0, 0.3)],
}


def piece(kind, m, loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0):
    objs = []
    if kind == 'knight':
        b = K.lathe(_smooth(PROF['knightbase'], 2), m, seg=64, name='kb')
        objs.append(b)
        hp = [(-0.22, 0.28), (0.2, 0.28), (0.24, 0.45), (0.22, 0.62), (0.26, 0.78), (0.3, 0.92), (0.27, 1.05), (0.18, 1.18), (0.08, 1.25), (0.02, 1.32), (-0.04, 1.24), (-0.14, 1.2), (-0.26, 1.08), (-0.38, 0.98), (-0.42, 0.9), (-0.38, 0.84), (-0.28, 0.84), (-0.18, 0.86), (-0.1, 0.8), (-0.18, 0.66), (-0.24, 0.52), (-0.26, 0.4)]
        me = bpy.data.meshes.new('kh')
        bm = bmesh.new()
        vs = [bm.verts.new((0.0, x, z)) for x, z in hp]
        f = bm.faces.new(vs)
        r = bmesh.ops.extrude_face_region(bm, geom=[f])
        for v in [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]:
            v.co.x += 0.26
        for v in bm.verts:
            v.co.x -= 0.13
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
        h = K._obj('kh', me, m)
        bv = h.modifiers.new('bv', 'BEVEL')
        bv.width = 0.06
        bv.segments = 4
        ss = h.modifiers.new('ss', 'SUBSURF')
        ss.levels = 2
        ss.render_levels = 2
        for p in h.data.polygons:
            p.use_smooth = True
        objs.append(h)
        for s in (-1, 1):
            e = K.sphere((s * 0.12, 0.1, 1.08), 0.035, m, seg=12, ring=8)
            objs.append(e)
        mane = K.box((0, -0.24, 0.95), (0.1, 0.12, 0.42), m, rot=(math.radians(-20), 0, 0), bev=0.04)
        objs.append(mane)
    else:
        prof = _smooth(PROF[kind], 3)
        objs.append(K.lathe(prof, m, seg=72, name=kind))
        if kind == 'king':
            objs.append(K.box((0, 0, 1.64), (0.07, 0.07, 0.26), m, bev=0.015))
            objs.append(K.box((0, 0, 1.66), (0.2, 0.07, 0.07), m, bev=0.015))
        if kind == 'queen':
            objs.append(K.sphere((0, 0, 1.55), 0.075, m, seg=24, ring=12))
            for i in range(9):
                a = 2 * math.pi * i / 9
                objs.append(K.sphere((0.25 * math.cos(a), 0.25 * math.sin(a), 1.42), 0.045, m, seg=16, ring=8))
        if kind == 'rook':
            for i in range(5):
                a = 2 * math.pi * i / 5
                objs.append(K.box((0.25 * math.cos(a), 0.25 * math.sin(a), 1.05), (0.12, 0.09, 0.08), m, rot=(0, 0, a + math.pi / 2), bev=0.01))
        if kind == 'bishop':
            pass
    root = K.parent_empty(objs, kind)
    root.location = loc
    root.rotation_euler = rot
    root.scale = (scale, scale, scale)
    return root


def board(n=8, size=1.0, light='#e8dcc4', dark='#3a2a22', frame='#1a100a', z=0.0):
    ml = K.mat('sq_l', light, rough=0.15, coat=0.8)
    md = K.mat('sq_d', dark, rough=0.15, coat=0.8)
    for mm in (ml, md):
        nt = mm.node_tree
        b = nt.nodes['Principled BSDF']
        nz = nt.nodes.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = 6
        nz.inputs['Detail'].default_value = 8
        nz.inputs['Distortion'].default_value = 3
        rp = nt.nodes.new('ShaderNodeValToRGB')
        c = b.inputs['Base Color'].default_value
        rp.color_ramp.elements[0].color = (c[0] * 0.75, c[1] * 0.75, c[2] * 0.75, 1)
        rp.color_ramp.elements[1].color = (min(1, c[0] * 1.15), min(1, c[1] * 1.15), min(1, c[2] * 1.15), 1)
        nt.links.new(nz.outputs['Fac'], rp.inputs['Fac'])
        nt.links.new(rp.outputs[0], b.inputs['Base Color'])
    for i in range(n):
        for j in range(n):
            x = (i - n / 2 + 0.5) * size
            y = (j - n / 2 + 0.5) * size
            K.box((x, y, z - 0.05), (size, size, 0.1), ml if (i + j) % 2 else md)
    K.box((0, 0, z - 0.12), (n * size + 0.6, n * size + 0.6, 0.2), K.mat('frame', frame, 0.25, coat=0.8), bev=0.04)
