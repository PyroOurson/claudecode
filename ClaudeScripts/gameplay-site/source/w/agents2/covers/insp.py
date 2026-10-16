import sys, bpy
sys.path.insert(0, '/tmp/gameplay-build/w/agents2/covers')
import kit as K
from mathutils import Vector
K.reset()
obs = K.import_glb(sys.argv[-1])
mn = Vector((1e9,)*3); mx = Vector((-1e9,)*3)
for o in obs:
    if o.type == 'MESH':
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
        print(o.name, len(o.data.polygons), [m.name for m in o.data.materials])
print('BB', mn, mx)
for im in bpy.data.images:
    print('IMG', im.name, im.size[:])
