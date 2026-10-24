"""Build the ACRA lizard quadruped in FreeCAD and export it for MuJoCo.

Run inside FreeCAD (Python console or macro) for coloured FCStd/STEP output, or
headless with `freecadcmd freecad_build.py` for geometry and meshes only.

Every part is modelled in its own MuJoCo body frame (millimetres, x forward,
y left, z up) and exported as one STL per body and finish (shell, dark, black,
rubber, blue), so acra.xml can colour them separately. The assembly in
acra.FCStd / acra.step is posed at the neutral standing pose; the STEP file is
shipped zipped as acra_step.zip (it is ~50 MB raw).

Design: a two-segment lofted body joined by a rubber bellows over the spine
yaw joint, sprawled legs (each leg plane is mounted with a fixed 45 degree
outward splay, hip and knee stay pure pitch joints), clevis knees, servo
housings with bolt circles, five-toed gecko feet on a rounded palm pad,
shell parting line, panel seams, vents and screws, an engraved ACRA badge, a
front depth-camera visor, stereo eye lenses with blue rings, blue mouth LEDs,
a head-top sensor window and a segmented drooping tail on a yaw hub.
"""
from __future__ import annotations

import math
import os
import zipfile
from typing import Dict, List, Optional, Sequence, Tuple

import FreeCAD as App
import Import
import MeshPart
import Part

V = App.Vector
HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
MESH_DIR = os.path.join(HERE, "meshes")
FONTS = (
    r"C:\Windows\Fonts\arial.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)

Station = Tuple[float, float, float, float]

TORSO = [(-185, 62, 50, -6), (-165, 90, 66, -3), (-120, 104, 80, 0), (-40, 108, 84, 0),
         (40, 108, 84, 0), (120, 102, 80, 1), (165, 86, 68, 4), (185, 62, 52, 8)]
TORSO_N = 2.8
SPINE_X = -70.0
FRONT_END = -55.0
REAR_END = -85.0
SEAM_X = 70.0
PARTING_Z = -16.0
PANEL = (-45.0, 55.0, -34.0, 34.0)
VENTS_X = (80.0, 87.0, 94.0, 101.0, 108.0)

HEAD_POS = V(285.0, 0.0, 72.0)
HEAD = [(-62, 62, 52, 0), (-44, 78, 64, 2), (-5, 82, 66, 3), (28, 78, 60, 1),
        (50, 69, 48, -1), (64, 57, 37, -3), (69, 48, 30, -3)]
NECK = [(-115, 62, 70, -62), (-80, 56, 66, -30), (-50, 52, 56, -6)]
HEAD_N = 3.2
CAMERA_POS = V(72.0, 0.0, 4.0)
LED_POS = V(69.5, 17.0, -9.0)
EYE_POS = V(33.0, 35.0, 16.0)
EYE_YAW = 35.0

TAIL_POS = V(-180.0, 0.0, -6.0)
TAIL = [(15, 58, 48, 0), (-40, 52, 44, -5), (-110, 42, 36, -14), (-190, 32, 28, -25),
        (-270, 22, 20, -37), (-340, 14, 13, -48), (-390, 8, 8, -56)]
TAIL_N = 2.3
TAIL_RINGS = (-60.0, -125.0, -190.0, -255.0, -320.0)

HIP_X = 130.0
HIP_Y = 80.0
HIP_Z = -14.0
SPLAY = 45.0
THIGH_LEN = 95.0
SHIN_LEN = 105.0
FOOT_R = 20.0
NEUTRAL_HIP = 0.95
NEUTRAL_KNEE = 1.9
LEGS = (("FL", 1, 1), ("FR", 1, -1), ("RL", -1, 1), ("RR", -1, -1))
FOOT_YAW = {1: 35.0, -1: 115.0}
TOES = ((-60.0, 12.0, 9.0), (-30.0, 17.0, 13.0), (0.0, 19.0, 14.0), (30.0, 17.0, 13.0), (60.0, 12.0, 9.0))

COLOURS = {
    "shell": (0.50, 0.52, 0.54),
    "dark": (0.22, 0.23, 0.25),
    "black": (0.04, 0.04, 0.05),
    "rubber": (0.09, 0.09, 0.10),
    "blue": (0.10, 0.45, 1.00),
}

Parts = Dict[str, Part.Shape]


def section(x: float, w: float, h: float, zc: float, n: float, count: int = 48) -> Part.Wire:
    """Closed superellipse (rounded-rectangle) cross-section in the y-z plane at station x."""
    pts = []
    for i in range(count):
        t = 2 * math.pi * i / count
        c, s = math.cos(t), math.sin(t)
        y = w / 2 * math.copysign(abs(c) ** (2 / n), c)
        z = zc + h / 2 * math.copysign(abs(s) ** (2 / n), s)
        pts.append(V(x, y, z))
    curve = Part.BSplineCurve()
    curve.interpolate(pts, PeriodicFlag=True)
    return Part.Wire(curve.toShape())


def loft(stations: Sequence[Station], n: float, inset: float = 0.0) -> Part.Shape:
    """Smooth solid through (x, width, height, z-centre) stations, shrunk by `inset` all round (negative grows it)."""
    wires = [section(x, w - 2 * inset, h - 2 * inset, zc, n) for x, w, h, zc in stations]
    return Part.makeLoft(wires, True, False, False)


def box(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float) -> Part.Shape:
    """Axis-aligned box from min/max coordinates."""
    return Part.makeBox(x1 - x0, y1 - y0, z1 - z0, V(x0, y0, z0))


def rounded_prism(x0: float, x1: float, y0: float, y1: float, z0: float, z1: float, r: float, axis: str = "z") -> Part.Shape:
    """Box whose edges parallel to `axis` are rounded, used for panels, windows and slots."""
    b = box(x0, x1, y0, y1, z0, z1)
    i = "xyz".index(axis)
    edges = [e for e in b.Edges if abs(e.Vertexes[0].Point[i] - e.Vertexes[1].Point[i]) > 1e-6]
    return b.makeFillet(r, edges)


def y_cyl(r: float, y0: float, y1: float, x: float = 0.0, z: float = 0.0) -> Part.Shape:
    """Cylinder along y from y0 to y1 through (x, z)."""
    return Part.makeCylinder(r, y1 - y0, V(x, y0, z), V(0, 1, 0))


def capsule(p0: App.Vector, p1: App.Vector, r: float) -> Part.Shape:
    """Rod with hemispherical ends between two points (left unfused, it is only rendered)."""
    d = p1 - p0
    return Part.makeCompound([Part.makeCylinder(r, d.Length, p0, d), Part.makeSphere(r, p0), Part.makeSphere(r, p1)])


def ellipsoid(rx: float, ry: float, rz: float, center: App.Vector, yaw: float = 0.0) -> Part.Shape:
    """Ellipsoid made by scaling a unit sphere, optionally turned about z by `yaw` degrees."""
    m = App.Matrix()
    m.scale(rx, ry, rz)
    shape = Part.makeSphere(1.0).transformGeometry(m)
    shape.rotate(V(0, 0, 0), V(0, 0, 1), yaw)
    shape.translate(center)
    return shape


def stadium(r1: float, r2: float, length: float, y0: float, y1: float, z0: float = 0.0) -> Part.Shape:
    """Tapered link: hull of a circle r1 at z0 and r2 at z0 - length in the x-z plane, extruded from y0 to y1."""
    sin_a = (r2 - r1) / length
    cos_a = math.sqrt(1 - sin_a ** 2)
    pts = [V(cos_a * r1, y0, z0 + sin_a * r1), V(cos_a * r2, y0, z0 - length + sin_a * r2),
           V(-cos_a * r2, y0, z0 - length + sin_a * r2), V(-cos_a * r1, y0, z0 + sin_a * r1)]
    web = Part.Face(Part.makePolygon(pts + [pts[0]])).extrude(V(0, y1 - y0, 0))
    ends = [y_cyl(r1, y0, y1, 0, z0), y_cyl(r2, y0, y1, 0, z0 - length)]
    return web.fuse(ends).removeSplitter()


def soften(shape: Part.Shape, r: float, y_faces: Sequence[float]) -> Part.Shape:
    """Fillet the outline edges lying on the planes y = y_faces; returns the shape unchanged if OCC refuses."""
    edges = [e for e in shape.Edges if all(any(abs(v.Point.y - yf) < 1e-4 for yf in y_faces) for v in e.Vertexes)]
    try:
        return shape.makeFillet(r, edges)
    except Exception:
        return shape


def bolt_circle(count: int, radius: float, bolt_r: float, y0: float, y1: float, z: float = 0.0, x: float = 0.0) -> Part.Shape:
    """Ring of socket-head bolt stubs along y, centred on (x, z)."""
    bolts = [y_cyl(bolt_r, y0, y1, x + radius * math.cos(2 * math.pi * k / count), z + radius * math.sin(2 * math.pi * k / count))
             for k in range(count)]
    return Part.makeCompound(bolts)


def surface_z(shape: Part.Shape, x: float, y: float) -> float:
    """Height of the top surface of `shape` above the point (x, y)."""
    hits = shape.section(Part.makeLine(V(x, y, 300), V(x, y, -300))).Vertexes
    return max(v.Point.z for v in hits)


def font() -> Optional[str]:
    """First available TrueType font for the engraved badge, or None to skip lettering."""
    return next((f for f in FONTS if os.path.exists(f)), None)


def text_faces(text: str, size: float) -> Optional[Part.Shape]:
    """Flat letter faces in the x-y plane, centred on the origin and facing +z."""
    path = font()
    if path is None:
        return None
    faces = [Part.makeFace(char, "Part::FaceMakerBullseye") for char in Part.makeWireString(text, path, size, 0) if char]
    for f in faces:
        if f.normalAt(0, 0).z < 0:
            f.reverse()
    comp = Part.makeCompound(faces)
    bb = comp.BoundBox
    return comp.translated(V(-bb.Center.x, -bb.Center.y, 0))


def engrave(shell: Part.Shape, tool: Part.Shape, core: Part.Shape, floor: Part.Shape, lid: Part.Shape) -> Tuple[Part.Shape, Part.Shape]:
    """Cut `tool` into the skin of `shell` down to `core`; returns (engraved shell, dark inlay from `floor` up to `lid`).

    `lid` sits just above `core`, so the inlay covers the cut floor instead of z-fighting with it.
    """
    shell = shell.cut(tool.cut(core))
    inlay = tool.common(lid).cut(floor)
    return shell, inlay


def hip_frame(sx: int, sy: int) -> App.Placement:
    """Hip joint frame in the front-torso frame: offset to the hip and rolled outward by SPLAY."""
    return App.Placement(V(sx * HIP_X, sy * HIP_Y, HIP_Z), App.Rotation(V(1, 0, 0), sy * SPLAY))


def hip_unit(sy: int) -> Part.Shape:
    """Hip servo housing with flange and bolted output face, in the hip frame (inboard of the thigh)."""
    housing = y_cyl(25, -44, -16)
    housing = housing.makeChamfer(2.0, [e for e in housing.Edges if e.Curve.TypeId == "Part::GeomCircle"])
    unit = Part.makeCompound([housing, y_cyl(30, -40, -36), bolt_circle(6, 19, 2.2, -17, -14.5)])
    return unit if sy > 0 else unit.mirror(V(0, 0, 0), V(0, 1, 0))


def body() -> Tuple[Parts, Parts]:
    """Front and rear body segments: one lofted shell with all surface detail, split at the spine bellows.

    Returns (front parts in the front frame, rear parts in the rear frame,
    which sits at x = SPINE_X).
    """
    shell = loft(TORSO, TORSO_N)
    skin, floor, lid = loft(TORSO, TORSO_N, 1.0), loft(TORSO, TORSO_N, 1.6), loft(TORSO, TORSO_N, 0.85)
    shell = shell.cut(box(SEAM_X - 1.5, SEAM_X + 1.5, -80, 80, -80, 80).cut(loft(TORSO, TORSO_N, 2.5)))
    shell = shell.cut(box(-200, 200, -80, 80, PARTING_Z - 1.0, PARTING_Z + 1.0).cut(loft(TORSO, TORSO_N, 1.5)))
    x0, x1, y0, y1 = PANEL
    ring = rounded_prism(x0, x1, y0, y1, -80, 80, 12).cut(rounded_prism(x0 + 1.6, x1 - 1.6, y0 + 1.6, y1 - 1.6, -80, 80, 10.4))
    shell = shell.cut(ring.common(box(-200, 200, -80, 80, 20, 80)).cut(skin))
    shell = shell.cut(ring.common(box(-200, 200, -80, 80, -80, -20)).cut(skin))
    cx = (x0 + x1) / 2
    front_dark: List[Part.Shape] = []
    blue: List[Part.Shape] = []
    letters = text_faces("ACRA", 20)
    if letters is not None:
        top = letters.extrude(V(0, 0, 80)).translated(V(cx, 0, 0))
        side = text_faces("ACRA", 13).extrude(V(0, 0, 80)).rotated(V(0, 0, 0), V(1, 0, 0), 90).translated(V(-5, 0, 0))
        for tool in (top, side, side.rotated(V(-5, 0, 0), V(0, 0, 1), 180)):
            shell, inlay = engrave(shell, tool, skin, floor, lid)
            front_dark.append(inlay)
    for sy in (1, -1):
        ys = (0, 80) if sy > 0 else (-80, 0)
        window = rounded_prism(28, 55, ys[0], ys[1], 19, 28, 3.5, "y")
        led = box(47, 52, -80, 80, 21.5, 25.5).common(window)
        shell, inlay = engrave(shell, window, skin, floor, lid)
        front_dark.append(inlay.cut(led))
        blue.append(led.common(lid).cut(floor))
        for x in VENTS_X:
            shell, inlay = engrave(shell, rounded_prism(x - 1.6, x + 1.6, ys[0], ys[1], -2, 14, 1.5, "y"), skin, floor, lid)
            front_dark.append(inlay)
    for x in (x0 + 7, x1 - 7):
        for y in (y0 + 7, y1 - 7):
            z = surface_z(shell, x, y)
            front_dark.append(Part.makeCylinder(2.3, 1.8, V(x, y, z - 1.4), V(0, 0, 1)))
    front_shell = shell.common(box(FRONT_END, 300, -100, 100, -100, 100))
    rear_shell = shell.common(box(-300, REAR_END, -100, 100, -100, 100))
    bellows = [loft(TORSO, TORSO_N, 6.0).common(box(REAR_END - 3, FRONT_END + 3, -80, 80, -80, 80))]
    for k in range(6):
        x = REAR_END + 2.5 + k * 5.0
        bellows.append(loft(TORSO, TORSO_N, 2.2).common(box(x - 1.7, x + 1.7, -80, 80, -80, 80)))
    rear_dark: List[Part.Shape] = []
    for _, sx, sy in LEGS:
        (front_dark if sx > 0 else rear_dark).append(hip_unit(sy).transformed(hip_frame(sx, sy).toMatrix()))
    to_rear = V(-SPINE_X, 0, 0)
    front = {"shell": front_shell, "dark": Part.makeCompound(front_dark), "blue": Part.makeCompound(blue)}
    rear = {"shell": rear_shell.translated(to_rear), "dark": Part.makeCompound(rear_dark).translated(to_rear),
            "rubber": Part.makeCompound(bellows).translated(to_rear)}
    return front, rear


def head() -> Parts:
    """Boxy lofted head on a banded neck, with mouth groove, nostrils, camera visor, top sensor, eye pods and mouth LEDs."""
    shell = loft(HEAD, HEAD_N).fuse(loft(NECK, 2.4)).removeSplitter()
    mouth_core = loft(HEAD, HEAD_N, 2.5).fuse(loft(NECK, 2.4, 2.5))
    shell = shell.cut(box(20, 76, -60, 60, -10.5, -8.5).cut(mouth_core.common(box(-200, 66.5, -60, 60, -60, 60))))
    for sy in (1, -1):
        z = surface_z(shell, 58, sy * 9)
        shell = shell.cut(Part.makeCylinder(2.2, 6, V(58, sy * 9, z - 3), V(0, 0, 1)))
    skin, floor, lid = loft(HEAD, HEAD_N, 1.0), loft(HEAD, HEAD_N, 1.6), loft(HEAD, HEAD_N, 0.85)
    shell, sensor = engrave(shell, rounded_prism(-22, 8, -11, 11, 0, 60, 4), skin, floor, lid)
    visor = rounded_prism(67, 71.5, -19, 19, -2, 10, 4, "x").cut(shell)
    glass = Part.makeCylinder(5.5, 2.0, CAMERA_POS - V(2.0, 0, 0), V(1, 0, 0))
    neck_joint = y_cyl(21, -35, 35, -55, -18).fuse(bolt_circle(5, 13, 1.9, 34.5, 36.5, -18, -55).Solids).fuse(
        bolt_circle(5, 13, 1.9, -36.5, -34.5, -18, -55).Solids)
    bands = [loft(NECK, 2.4, -1.5).common(box(x - 2.5, x + 2.5, -60, 60, -100, 60)) for x in (-100.0, -82.0)]
    dark = [visor, neck_joint] + bands
    black = [glass, sensor]
    blue = []
    for sy in (1, -1):
        d = V(math.cos(math.radians(EYE_YAW)), sy * math.sin(math.radians(EYE_YAW)), 0.12)
        d.normalize()
        base = V(EYE_POS.x, sy * EYE_POS.y, EYE_POS.z) - d * 4
        dark.append(Part.makeCylinder(12.5, 13, base, d))
        black.append(Part.makeCylinder(9, 1.0, base + d * 12.6, d))
        blue.append(Part.makeTorus(10.5, 1.2, base + d * 13, d))
        blue.append(Part.makeCylinder(1.8, 8, V(LED_POS.x, sy * LED_POS.y - 4, LED_POS.z), V(0, 1, 0)))
    return {"shell": shell, "dark": Part.makeCompound(dark), "black": Part.makeCompound(black), "blue": Part.makeCompound(blue)}


def tail() -> Parts:
    """Long drooping lofted tail with segment rings, rounded tip and a vertical yaw hub at the root."""
    shell = loft(TAIL, TAIL_N).fuse(Part.makeSphere(4.0, V(-390, 0, -56))).removeSplitter()
    core = loft(TAIL, TAIL_N, 1.6)
    for x in TAIL_RINGS:
        shell = shell.cut(box(x - 1.2, x + 1.2, -50, 50, -100, 50).cut(core))
    hub = Part.makeCylinder(24, 50, V(0, 0, -25), V(0, 0, 1)).fuse(Part.makeCylinder(27, 4, V(0, 0, 21), V(0, 0, 1)))
    return {"shell": shell, "dark": hub}


def thigh() -> Parts:
    """Upper leg: filleted tapered link with a clevis at the knee, lightening pockets and bolted axle caps."""
    link = soften(stadium(24, 20, THIGH_LEN, -14, 14), 3.0, (-14, 14))
    link = link.cut(box(-30, 30, -8.5, 8.5, -THIGH_LEN - 30, -THIGH_LEN + 25))
    for y0, y1 in ((12.5, 15), (-15, -12.5)):
        link = link.cut(stadium(9, 7, 38, y0, y1, -24))
    caps = []
    for z, r in ((0.0, 14.0), (-THIGH_LEN, 13.0)):
        for sy in (1, -1):
            caps.append(y_cyl(r, *((14, 17) if sy > 0 else (-17, -14)), 0, z))
            caps.extend(bolt_circle(6, r - 4.5, 1.4, *((17, 18) if sy > 0 else (-18, -17)), z).Solids)
    return {"shell": link, "dark": Part.makeCompound(caps)}


def shin() -> Parts:
    """Lower leg: slim filleted link fitting the knee clevis, with an ankle collar."""
    link = soften(stadium(16, 11, SHIN_LEN - 22, -8, 8), 2.0, (-8, 8))
    for y0, y1 in ((6.5, 8), (-8, -6.5)):
        link = link.cut(stadium(6, 4, 36, y0, y1, -24))
    collar = Part.makeCylinder(12, 14, V(0, 0, -SHIN_LEN + 4), V(0, 0, 1))
    collar = collar.makeChamfer(1.5, collar.Edges)
    return {"shell": link, "dark": Part.makeCompound([collar, y_cyl(7, -8.6, 8.6)])}


def foot() -> Parts:
    """Gecko foot in a level frame at the ankle (x along the foot, z up): palm pad and five jointed toes.

    The rubber sole of the palm is the single rounded contact surface; its
    lowest point is FOOT_R below the ankle, like the collision sphere.
    """
    palm = ellipsoid(21, 18, 9, V(0, 0, -FOOT_R + 9))
    sole_cut = box(-40, 40, -40, 40, -FOOT_R - 1, -FOOT_R + 5)
    shell = [palm.cut(sole_cut)]
    rubber = [palm.common(sole_cut)]
    dark = [Part.makeSphere(9.5, V(0, 0, -6))]
    for ang, l1, l2 in TOES:
        a = math.radians(ang)
        c, s = math.cos(a), math.sin(a)
        p0 = V(16 * c, 13.5 * s, -FOOT_R + 5.5)
        d1 = V(c, s, 0.10)
        d1.normalize()
        p1 = p0 + d1 * l1
        d2 = V(c, s, 0.30)
        d2.normalize()
        p2 = p1 + d2 * l2
        shell.append(capsule(p0, p1, 4.0))
        shell.append(capsule(p1, p2, 3.2))
        dark.extend([Part.makeSphere(4.9, p0), Part.makeSphere(4.3, p1)])
        rubber.append(ellipsoid(6.5, 5.5, 2.6, p2 + V(c * 1.5, s * 1.5, -1.6), ang))
    return {"shell": Part.makeCompound(shell), "dark": Part.makeCompound(dark), "rubber": Part.makeCompound(rubber)}


def pitch(rad: float) -> App.Rotation:
    """Rotation about the leg frame's y axis, the axis of every hip and knee joint."""
    return App.Rotation(V(0, 1, 0), math.degrees(rad))


def assembly() -> List[Tuple[str, str, Parts, App.Placement]]:
    """(object name, mesh name, finish -> shape, placement in the neutral pose) for every rigid part.

    Front legs stand elbow-back and rear legs knee-forward, as in the reference
    side views. Thighs and shins are symmetric about their own plane so one
    mesh serves all legs; each foot is turned level and fanned outward
    (forward-out at the front, back-out at the rear) in its shin frame, so
    every leg gets its own foot mesh.
    """
    front, rear = body()
    items = [
        ("torso", "torso", front, App.Placement()),
        ("rear", "rear", rear, App.Placement(V(SPINE_X, 0, 0), App.Rotation())),
        ("head", "head", head(), App.Placement(HEAD_POS, App.Rotation())),
        ("tail", "tail", tail(), App.Placement(TAIL_POS, App.Rotation())),
    ]
    th, sh, ft = thigh(), shin(), foot()
    for name, sx, sy in LEGS:
        hip = hip_frame(sx, sy).multiply(App.Placement(V(), pitch(sx * NEUTRAL_HIP)))
        knee = hip.multiply(App.Placement(V(0, 0, -THIGH_LEN), pitch(-sx * NEUTRAL_KNEE)))
        level = App.Rotation(V(0, 0, 1), sy * FOOT_YAW[sx])
        ankle = App.Placement(V(0, 0, -SHIN_LEN), knee.Rotation.inverted().multiply(level))
        local_foot = {k: v.transformed(ankle.toMatrix()) for k, v in ft.items()}
        items.append((name + "_thigh", "thigh", th, hip))
        items.append((name + "_shin", "shin", sh, knee))
        items.append((name + "_foot", "foot_" + name, local_foot, knee))
    return items


def export_mesh(shape: Part.Shape, path: str, fine: bool) -> int:
    """Tessellate a shape and write it as STL; large smooth shells get the finer tolerance. Returns the facet count."""
    lin, ang = (0.08, 0.15) if fine else (0.2, 0.35)
    mesh = MeshPart.meshFromShape(Shape=shape, LinearDeflection=lin, AngularDeflection=ang, Relative=False)
    mesh.write(path)
    return mesh.CountFacets


def main() -> None:
    """Build the document, export per-finish meshes, STEP and FCStd, and print a size report."""
    os.makedirs(MESH_DIR, exist_ok=True)
    for f in os.listdir(MESH_DIR):
        if f.endswith(".stl"):
            os.remove(os.path.join(MESH_DIR, f))
    if "ACRA" in App.listDocuments():
        App.closeDocument("ACRA")
    doc = App.newDocument("ACRA")
    written: Dict[str, int] = {}
    objs = []
    for obj_name, mesh_name, parts, placement in assembly():
        for finish, shape in parts.items():
            key = "%s_%s" % (mesh_name, finish)
            if key not in written:
                fine = finish == "shell" and not mesh_name.startswith("foot")
                written[key] = export_mesh(shape, os.path.join(MESH_DIR, key + ".stl"), fine)
            obj = doc.addObject("Part::Feature", "%s_%s" % (obj_name, finish))
            placed = shape.copy()
            placed.Placement = placement.multiply(shape.Placement)
            obj.Shape = placed
            if App.GuiUp:
                obj.ViewObject.ShapeColor = COLOURS[finish]
                obj.ViewObject.DisplayMode = "Shaded"
            objs.append(obj)
    doc.recompute()
    step = os.path.join(HERE, "acra.step")
    Import.export(objs, step)
    with zipfile.ZipFile(os.path.join(HERE, "acra_step.zip"), "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(step, "acra.step")
    os.remove(step)
    doc.saveAs(os.path.join(HERE, "acra.FCStd"))
    bb = objs[0].Shape.BoundBox
    for o in objs[1:]:
        bb.add(o.Shape.BoundBox)
    print("meshes:", ", ".join("%s (%d)" % kv for kv in written.items()))
    print("bbox mm: x %.1f..%.1f  y %.1f..%.1f  z %.1f..%.1f" % (bb.XMin, bb.XMax, bb.YMin, bb.YMax, bb.ZMin, bb.ZMax))
    print("standing torso-centre height mm: %.1f" % -bb.ZMin)


main()
