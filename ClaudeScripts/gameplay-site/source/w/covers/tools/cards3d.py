import math
import bpy, bmesh
import kit as K

_faces = {}


def card_mesh(CW, CH_, CT, r):
    me = bpy.data.meshes.new('card')
    bm = bmesh.new()
    pts = []
    for (cx, cy, a0) in [(CW / 2 - r, CH_ / 2 - r, 0), (-CW / 2 + r, CH_ / 2 - r, 90), (-CW / 2 + r, -CH_ / 2 + r, 180), (CW / 2 - r, -CH_ / 2 + r, 270)]:
        for k in range(7):
            a = math.radians(a0 + k * 15)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    top = [bm.verts.new((x, y, CT / 2)) for x, y in pts]
    bot = [bm.verts.new((x, y, -CT / 2)) for x, y in pts]
    bm.faces.new(top).material_index = 0
    bm.faces.new(list(reversed(bot))).material_index = 1
    n = len(pts)
    for i in range(n):
        bm.faces.new((bot[i], bot[(i + 1) % n], top[(i + 1) % n], top[i])).material_index = 2
    uvl = bm.loops.layers.uv.new('UVMap')
    for f in bm.faces:
        for l in f.loops:
            u = l.vert.co.x / CW + 0.5
            if f.material_index == 1:
                u = 1 - u
            l[uvl].uv = (u, l.vert.co.y / CH_ + 0.5)
    bm.to_mesh(me)
    bm.free()
    return me


def card(face_path, back_mat, loc, rot, size=(1.0, 1.4), t=0.012, r=0.07, edge=None):
    if face_path not in _faces:
        _faces[face_path] = K.img_mat('f%d' % len(_faces), face_path, rough=0.25, coat=0.6)
    if edge is None:
        edge = _faces.setdefault('__edge', K.mat('edge', '#f4f4f0', 0.5))
    ob = K._obj('card', card_mesh(size[0], size[1], t, r), [_faces[face_path], back_mat, edge])
    ob.location = loc
    ob.rotation_euler = rot
    return ob
