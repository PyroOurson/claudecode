import kit as K
import bpy

PAL = {}


def pm(c, rough=0.75, metal=0.0, emit=0.0, coat=0.0):
    k = (c, rough, metal, emit, coat)
    if k not in PAL:
        m = K.mat('v_' + c.strip('#'), c, rough=rough, metal=metal, coat=coat)
        if emit:
            m.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = K.hexc(c)
            m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = emit
        PAL[k] = m
    return PAL[k]


class V:
    def __init__(self):
        self.d = {}

    def fill(self, x0, y0, z0, x1, y1, z1, c):
        for x in range(x0, x1):
            for y in range(y0, y1):
                for z in range(z0, z1):
                    self.d[(x, y, z)] = c
        return self

    def set(self, x, y, z, c):
        self.d[(x, y, z)] = c
        return self

    def build(self, name, scale, loc=(0, 0, 0), rot=(0, 0, 0), center=True, mats=None, bevel=0.0):
        keys = sorted(set(self.d.values()), key=str)
        spec = {k: {'side': i} for i, k in enumerate(keys)}
        ml = []
        for k in keys:
            if isinstance(k, tuple):
                ml.append(pm(*k))
            else:
                ml.append(pm(k))
        if center and self.d:
            xs = [p[0] for p in self.d]
            ys = [p[1] for p in self.d]
            zs = [p[2] for p in self.d]
            off = (-(min(xs) + max(xs) + 1) / 2, -(min(ys) + max(ys) + 1) / 2, -min(zs))
        else:
            off = (0, 0, 0)
        ob = K.voxel_obj(self.d, spec, ml, name, scale, off)
        ob.location = loc
        ob.rotation_euler = rot
        if bevel:
            md = ob.modifiers.new('bv', 'BEVEL')
            md.width = bevel
            md.segments = 2
            md.limit_method = 'ANGLE'
        return ob
