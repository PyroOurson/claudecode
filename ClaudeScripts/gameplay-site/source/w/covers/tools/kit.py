import bpy, bmesh, math, os, sys, random
from mathutils import Vector, Euler, Matrix

C = '/tmp/gameplay-build/w/agents2/covers'
RENDERS = C + '/renders'
TEX = C + '/tex'


def reset(samples=64, w=960, h=600, threads=3):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 6
    sc.cycles.transparent_max_bounces = 8
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.threads_mode = 'FIXED'
    sc.render.threads = 2 if sys.argv[-1] == 'q' else threads
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_depth = '8'
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'AgX'
    for lk in ('AgX - Punchy', 'Punchy', 'AgX - Medium High Contrast', 'Medium High Contrast'):
        try:
            sc.view_settings.look = lk
            break
        except Exception:
            pass
    w0 = bpy.data.worlds.new('W')
    sc.world = w0
    return sc


def look(name):
    sc = bpy.context.scene
    for lk in name:
        try:
            sc.view_settings.look = lk
            return
        except Exception:
            pass


def hexc(h, a=1.0):
    h = h.lstrip('#')
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), a)


def col(c):
    if isinstance(c, str):
        return hexc(c)
    if len(c) == 3:
        return (c[0], c[1], c[2], 1)
    return c


def mat(name, color='#ffffff', rough=0.5, metal=0.0, emit=None, es=0.0, coat=0.0, trans=0.0, ior=1.45, sss=0.0, spec=0.5, alpha=1.0, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = col(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['IOR'].default_value = ior
    try:
        b.inputs['Specular IOR Level'].default_value = spec
    except Exception:
        pass
    if emit is not None:
        b.inputs['Emission Color'].default_value = col(emit)
        b.inputs['Emission Strength'].default_value = es
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.05
    if trans:
        b.inputs['Transmission Weight'].default_value = trans
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.5, 0.3, 0.2)
    if sheen:
        b.inputs['Sheen Weight'].default_value = sheen
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
    return m


def emit_mat(name, color, strength=5.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = col(color)
    e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], o.inputs[0])
    return m


def img_mat(name, path, rough=0.5, metal=0.0, closest=False, emit=0.0, coat=0.0, alpha=False, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(path, check_existing=True)
    if closest:
        t.interpolation = 'Closest'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if alpha:
        nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
    if emit:
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emit
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    try:
        b.inputs['Specular IOR Level'].default_value = spec
    except Exception:
        pass
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = 0.04
    return m


def link(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob


def _obj(name, me, m=None):
    ob = bpy.data.objects.new(name, me)
    link(ob)
    if m is not None:
        if isinstance(m, (list, tuple)):
            for mm in m:
                ob.data.materials.append(mm)
        else:
            ob.data.materials.append(m)
    return ob


def smooth(ob, angle=None):
    for p in ob.data.polygons:
        p.use_smooth = True
    if angle is not None:
        mod = ob.modifiers.new('sa', 'NODES')
        try:
            bpy.ops.object.select_all(action='DESELECT')
        except Exception:
            pass
    return ob


def bevel(ob, w=0.05, seg=3, lim='ANGLE'):
    md = ob.modifiers.new('bv', 'BEVEL')
    md.width = w
    md.segments = seg
    md.limit_method = lim
    md.harden_normals = False
    return md


def subsurf(ob, lv=2):
    md = ob.modifiers.new('ss', 'SUBSURF')
    md.levels = lv
    md.render_levels = lv
    return md


def box(loc=(0, 0, 0), size=(1, 1, 1), m=None, rot=(0, 0, 0), bev=0.0, seg=3, name='box'):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    ob.location = loc
    ob.rotation_euler = rot
    if bev:
        bevel(ob, bev, seg)
        for p in ob.data.polygons:
            p.use_smooth = True
        md = ob.modifiers['bv']
        md.harden_normals = True
    return ob


def sphere(loc=(0, 0, 0), r=1.0, m=None, seg=48, ring=24, scale=(1, 1, 1), name='sph', rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r, calc_uvs=True)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    ob.location = loc
    ob.scale = scale
    ob.rotation_euler = rot
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def cyl(loc=(0, 0, 0), r=1.0, depth=1.0, m=None, seg=48, rot=(0, 0, 0), r2=None, name='cyl', bev=0.0, cap=True):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=depth, calc_uvs=True)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    ob.location = loc
    ob.rotation_euler = rot
    for p in ob.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    if bev:
        bevel(ob, bev, 3)
        ob.modifiers['bv'].harden_normals = True
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def torus(loc=(0, 0, 0), R=1.0, r=0.25, m=None, rot=(0, 0, 0), seg=64, mseg=24, name='tor'):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    for i in range(seg):
        a = 2 * math.pi * i / seg
        for j in range(mseg):
            b = 2 * math.pi * j / mseg
            bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b)))
    bm.verts.ensure_lookup_table()
    for i in range(seg):
        for j in range(mseg):
            a = i * mseg + j
            b = ((i + 1) % seg) * mseg + j
            c = ((i + 1) % seg) * mseg + (j + 1) % mseg
            d = i * mseg + (j + 1) % mseg
            bm.faces.new((bm.verts[a], bm.verts[b], bm.verts[c], bm.verts[d]))
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    ob.location = loc
    ob.rotation_euler = rot
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def plane(loc=(0, 0, 0), size=(10, 10), m=None, rot=(0, 0, 0), name='pl'):
    me = bpy.data.meshes.new(name)
    sx, sy = size[0] / 2, size[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(0, 1, 2, 3)])
    me.uv_layers.new(name='UVMap')
    uv = me.uv_layers[0].data
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv[i].uv = c
    ob = _obj(name, me, m)
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def lathe(profile, m=None, loc=(0, 0, 0), seg=64, name='lathe', rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    rings = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ring = []
        for (r, z) in profile:
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    n = len(profile)
    for i in range(seg):
        r0, r1 = rings[i], rings[(i + 1) % seg]
        for j in range(n - 1):
            try:
                bm.faces.new((r0[j], r1[j], r1[j + 1], r0[j + 1]))
            except Exception:
                pass
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    ob.location = loc
    ob.rotation_euler = rot
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def tube(points, radius, m=None, seg=24, name='tube', radii=None, closed=False):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    pts = [Vector(p) for p in points]
    rings = []
    prev_n = None
    for i, p in enumerate(pts):
        if i == 0:
            t = (pts[1] - pts[0])
        elif i == len(pts) - 1:
            t = (pts[-1] - pts[-2])
        else:
            t = (pts[i + 1] - pts[i - 1])
        t.normalize()
        if prev_n is None:
            up = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))
            n = t.cross(up).normalized()
        else:
            n = (prev_n - t * prev_n.dot(t)).normalized()
        prev_n = n
        b = t.cross(n).normalized()
        rr = radii[i] if radii else radius
        ring = []
        for j in range(seg):
            a = 2 * math.pi * j / seg
            ring.append(bm.verts.new(p + (n * math.cos(a) + b * math.sin(a)) * rr))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for j in range(seg):
            bm.faces.new((rings[i][j], rings[i][(j + 1) % seg], rings[i + 1][(j + 1) % seg], rings[i + 1][j]))
    if not closed:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    ob = _obj(name, me, m)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def text3d(body, font=None, size=1.0, extrude=0.1, bev=0.02, m=None, loc=(0, 0, 0), rot=(math.pi / 2, 0, 0), align='CENTER', name='txt'):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    if font:
        cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = size
    cu.extrude = extrude
    cu.bevel_depth = bev
    cu.bevel_resolution = 3
    cu.align_x = align
    cu.align_y = 'CENTER'
    ob = bpy.data.objects.new(name, cu)
    link(ob)
    if m is not None:
        if isinstance(m, (list, tuple)):
            for mm in m:
                cu.materials.append(mm)
        else:
            cu.materials.append(m)
    ob.location = loc
    ob.rotation_euler = rot
    return ob


def camera(loc, target, lens=50, fstop=None, focus=None, shift=(0, 0), name='cam', roll=0.0):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.shift_x, cd.shift_y = shift
    cd.clip_end = 5000
    cd.clip_start = 0.05
    ob = bpy.data.objects.new(name, cd)
    link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    q = d.to_track_quat('-Z', 'Y')
    ob.rotation_euler = q.to_euler()
    if roll:
        ob.rotation_euler.rotate_axis('Z', roll)
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus if focus else d.length
    bpy.context.scene.camera = ob
    return ob


def light(kind, loc, target=None, energy=100, color='#ffffff', size=1.0, spot=45, name='L', size_y=None, shape=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = col(color)[:3]
    if kind == 'AREA':
        ld.size = size
        if size_y is not None:
            ld.shape = 'RECTANGLE'
            ld.size_y = size_y
        elif shape:
            ld.shape = shape
    elif kind in ('POINT', 'SPOT'):
        ld.shadow_soft_size = size
    elif kind == 'SUN':
        ld.angle = math.radians(size)
    if kind == 'SPOT':
        ld.spot_size = math.radians(spot)
        ld.spot_blend = 0.4
    ob = bpy.data.objects.new(name, ld)
    link(ob)
    ob.location = loc
    if target is not None:
        d = Vector(target) - Vector(loc)
        ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob


def sun(direction_target=(0, 0, 0), loc=(10, -10, 20), energy=4, color='#fff3e0', angle=2.0):
    return light('SUN', loc, direction_target, energy, color, angle, name='sun')


def world_grad(top='#3a6ea8', bottom='#f2c39a', strength=1.0, horizon=None, mid=0.5):
    w = bpy.context.scene.world
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Strength'].default_value = strength
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    vm = nt.nodes.new('ShaderNodeVectorMath')
    vm.operation = 'NORMALIZE'
    nt.links.new(tc.outputs['Generated'], vm.inputs[0])
    sep2 = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep2.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = -0.1
    mr.inputs['From Max'].default_value = 0.6
    nt.links.new(sep2.outputs['Z'], mr.inputs['Value'])
    nt.links.new(mr.outputs[0], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].color = col(bottom)
    ramp.color_ramp.elements[1].color = col(top)
    if horizon:
        e = ramp.color_ramp.elements.new(mid * 0.4)
        e.color = col(horizon)
    nt.links.new(ramp.outputs[0], bg.inputs['Color'])
    nt.links.new(bg.outputs[0], o.inputs[0])
    return nt


def world_color(c='#101018', strength=1.0):
    w = bpy.context.scene.world
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes.get('Background') or nt.nodes.new('ShaderNodeBackground')
    o = nt.nodes.get('World Output') or nt.nodes.new('ShaderNodeOutputWorld')
    bg.inputs['Color'].default_value = col(c)
    bg.inputs['Strength'].default_value = strength
    nt.links.new(bg.outputs[0], o.inputs[0])


def world_sky(sun_el=12, sun_az=200, strength=0.6, air=1.0, dust=1.0):
    w = bpy.context.scene.world
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    sk = nt.nodes.new('ShaderNodeTexSky')
    try:
        sk.sky_type = 'NISHITA'
    except Exception:
        pass
    try:
        sk.sun_elevation = math.radians(sun_el)
        sk.sun_rotation = math.radians(sun_az)
        sk.air_density = air
        sk.aerosol_density = dust
    except Exception:
        pass
    bg.inputs['Strength'].default_value = strength
    nt.links.new(sk.outputs[0], bg.inputs['Color'])
    nt.links.new(bg.outputs[0], o.inputs[0])
    return sk


def volume_box(loc, size, density=0.02, color='#ffffff', anis=0.3):
    m = bpy.data.materials.new('vol')
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    v = nt.nodes.new('ShaderNodeVolumePrincipled')
    v.inputs['Density'].default_value = density
    v.inputs['Color'].default_value = col(color)
    v.inputs['Anisotropy'].default_value = anis
    nt.links.new(v.outputs[0], o.inputs['Volume'])
    return box(loc, size, m, name='fog')


def holdout(ob):
    ob.visible_camera = False
    return ob


def render(name, samples=None):
    sc = bpy.context.scene
    if samples:
        sc.cycles.samples = samples
    os.makedirs(RENDERS, exist_ok=True)
    sc.render.filepath = RENDERS + '/' + name + '.png'
    import time
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print('RENDERED', name, round(time.time() - t, 1), 's')


def voxels(blocks, mats, name='vox', scale=1.0, offset=(0, 0, 0), faces_of=None):
    keys = list(mats.keys())
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new('UVMap')
    S = set(blocks.keys())
    dirs = [((1, 0, 0), 'side'), ((-1, 0, 0), 'side'), ((0, 1, 0), 'side'), ((0, -1, 0), 'side'), ((0, 0, 1), 'top'), ((0, 0, -1), 'bottom')]
    vcache = {}

    def V(x, y, z):
        k = (x, y, z)
        v = vcache.get(k)
        if v is None:
            v = bm.verts.new(((x + offset[0]) * scale, (y + offset[1]) * scale, (z + offset[2]) * scale))
            vcache[k] = v
        return v
    quads = {
        (1, 0, 0): [(1, 0, 0), (1, 1, 0), (1, 1, 1), (1, 0, 1)],
        (-1, 0, 0): [(0, 1, 0), (0, 0, 0), (0, 0, 1), (0, 1, 1)],
        (0, 1, 0): [(1, 1, 0), (0, 1, 0), (0, 1, 1), (1, 1, 1)],
        (0, -1, 0): [(0, 0, 0), (1, 0, 0), (1, 0, 1), (0, 0, 1)],
        (0, 0, 1): [(0, 0, 1), (1, 0, 1), (1, 1, 1), (0, 1, 1)],
        (0, 0, -1): [(0, 1, 0), (1, 1, 0), (1, 0, 0), (0, 0, 0)],
    }
    uvs = [(0, 0), (1, 0), (1, 1), (0, 1)]
    for (x, y, z), t in blocks.items():
        for d, kind in dirs:
            nb = (x + d[0], y + d[1], z + d[2])
            if nb in S:
                tb = blocks[nb]
                if not (mats.get(tb, {}).get('transparent') and tb != t):
                    continue
            spec = mats[t]
            mn = spec.get(kind, spec.get('side'))
            q = quads[d]
            vs = [V(x + a, y + b, z + c) for (a, b, c) in q]
            try:
                f = bm.faces.new(vs)
            except ValueError:
                continue
            f.material_index = mn
            for li, l in enumerate(f.loops):
                l[uvl].uv = uvs[li]
    bm.to_mesh(me)
    bm.free()
    return me


def voxel_obj(blocks, spec, matlist, name='vox', scale=1.0, offset=(0, 0, 0)):
    me = voxels(blocks, spec, name, scale, offset)
    ob = _obj(name, me, matlist)
    return ob


def pixtex(name, rows, palette, scale=1):
    h = len(rows)
    w = len(rows[0])
    im = bpy.data.images.new(name, w, h, alpha=True)
    px = []
    for y in range(h - 1, -1, -1):
        for x in range(w):
            c = palette[rows[y][x]]
            if c is None:
                px += [0, 0, 0, 0]
            else:
                cc = col(c)
                px += [cc[0], cc[1], cc[2], cc[3]]
    im.pixels = px
    im.pack()
    return im


def noise_tex(name, base, var=0.12, size=16, seed=1, spots=None, fn=None):
    rnd = random.Random(seed)
    im = bpy.data.images.new(name, size, size, alpha=True)
    b = col(base)
    px = []
    for y in range(size):
        for x in range(size):
            if fn:
                c = fn(x, size - 1 - y, rnd)
                c = col(c)
            else:
                k = 1 + (rnd.random() - 0.5) * 2 * var
                c = (b[0] * k, b[1] * k, b[2] * k, 1)
            px += list(c)
    im.pixels = px
    im.pack()
    return im


def tex_mat_from_image(name, im, rough=0.8, closest=True, emit=0.0, alpha=False, spec=0.3):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = im
    if closest:
        t.interpolation = 'Closest'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    if alpha:
        nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
    if emit:
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emit
    b.inputs['Roughness'].default_value = rough
    try:
        b.inputs['Specular IOR Level'].default_value = spec
    except Exception:
        pass
    return m


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]


def parent_empty(objs, name='grp'):
    e = bpy.data.objects.new(name, None)
    link(e)
    for o in objs:
        if o.parent is None:
            o.parent = e
    return e


def depth(name, far=100.0, near=0.0, samples=6):
    sc = bpy.context.scene
    m = bpy.data.materials.new('zov')
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    e = nt.nodes.new('ShaderNodeEmission')
    cdn = nt.nodes.new('ShaderNodeCameraData')
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = near
    mr.inputs['From Max'].default_value = far
    nt.links.new(cdn.outputs['View Distance'], mr.inputs['Value'])
    nt.links.new(mr.outputs[0], e.inputs['Color'])
    nt.links.new(e.outputs[0], o.inputs['Surface'])
    vl = sc.view_layers[0]
    vl.material_override = m
    w = bpy.data.worlds.new('WZ')
    old = sc.world
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
    for ob in sc.objects:
        if ob.name.startswith('fog'):
            ob.hide_render = True
    sc.cycles.samples = samples
    sc.cycles.use_denoising = False
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.max_bounces = 0
    try:
        sc.view_settings.view_transform = 'Raw'
    except Exception:
        sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.render.image_settings.color_depth = '8'
    dof = sc.camera.data.dof.use_dof
    sc.render.filepath = RENDERS + '/' + name + '_z.png'
    bpy.ops.render.render(write_still=True)
    print('DEPTH', name)


def flame_mat(name, c_tip='#ff3a08', c_mid='#ff8a20', c_core='#fff4c8', strength=18.0, edge=2.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    add = nt.nodes.new('ShaderNodeAddShader')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    em = nt.nodes.new('ShaderNodeEmission')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = col(c_core)
    e1 = ramp.color_ramp.elements.new(0.35)
    e1.color = col(c_tip)
    e2 = ramp.color_ramp.elements.new(0.75)
    e2.color = col(c_mid)
    nt.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    lw = nt.nodes.new('ShaderNodeLayerWeight')
    lw.inputs['Blend'].default_value = 0.5
    inv = nt.nodes.new('ShaderNodeMath')
    inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs['Facing'], inv.inputs[1])
    pw = nt.nodes.new('ShaderNodeMath')
    pw.operation = 'POWER'
    pw.inputs[1].default_value = edge
    nt.links.new(inv.outputs[0], pw.inputs[0])
    ms = nt.nodes.new('ShaderNodeMath')
    ms.operation = 'MULTIPLY'
    ms.inputs[1].default_value = strength
    nt.links.new(pw.outputs[0], ms.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs['Color'])
    nt.links.new(ms.outputs[0], em.inputs['Strength'])
    nt.links.new(tr.outputs[0], add.inputs[0])
    nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], o.inputs['Surface'])
    return m


def glow_mat(name, color, strength=10.0, edge=2.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    add = nt.nodes.new('ShaderNodeAddShader')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = col(color)
    lw = nt.nodes.new('ShaderNodeLayerWeight')
    lw.inputs['Blend'].default_value = 0.5
    inv = nt.nodes.new('ShaderNodeMath')
    inv.operation = 'SUBTRACT'
    inv.inputs[0].default_value = 1.0
    nt.links.new(lw.outputs['Facing'], inv.inputs[1])
    pw = nt.nodes.new('ShaderNodeMath')
    pw.operation = 'POWER'
    pw.inputs[1].default_value = edge
    nt.links.new(inv.outputs[0], pw.inputs[0])
    ms = nt.nodes.new('ShaderNodeMath')
    ms.operation = 'MULTIPLY'
    ms.inputs[1].default_value = strength
    nt.links.new(pw.outputs[0], ms.inputs[0])
    nt.links.new(ms.outputs[0], em.inputs['Strength'])
    nt.links.new(tr.outputs[0], add.inputs[0])
    nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], o.inputs['Surface'])
    return m


def three_point(target=(0, 0, 0), key=('#fff2e0', 800, (-4, -5, 6)), rim=('#6aa0ff', 600, (4, 5, 4)), fill=('#c0d0ff', 150, (5, -4, 2)), size=3.0):
    t = Vector(target)
    for nm, (c, e, p) in (('key', key), ('rim', rim), ('fill', fill)):
        if e:
            light('AREA', tuple(t + Vector(p)), tuple(t), energy=e, color=c, size=size, name=nm)


def text_obj(body, font, size, m, loc=(0, 0, 0), rot=(math.pi / 2, 0, 0), extrude=0.08, bev=0.02, align='CENTER'):
    return text3d(body, C + '/fonts/' + font, size, extrude, bev, m, loc, rot, align)


def rounded_tile(loc, size, m, r=0.1, rot=(0, 0, 0), name='tile', mats=None):
    ob = box(loc, size, m, rot=rot, bev=r, seg=5, name=name)
    return ob
