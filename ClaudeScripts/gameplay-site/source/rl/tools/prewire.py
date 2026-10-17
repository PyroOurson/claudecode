import sys
p = sys.argv[1]
s = open(p, encoding='utf-8', newline='').read()
assert '\r' not in s
def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:80], c)
    s = s.replace(a, b)
rep("  const TAU = Math.PI * 2, BR = CFG.ballR;\n",
"""  const BODIES = {
    octane: { name: 'Octane', hitbox: 'Octane', hb: [60.25, 43.35, 19.33], off: [13.88, 0, 20.75], wf: [51.25, 25.9, 12.5], wb: [-33.75, 29.5, 15] },
    fennec: { name: 'Fennec', hitbox: 'Octane', hb: [60.25, 43.35, 19.33], off: [13.88, 0, 20.75], wf: [51.25, 25.9, 12.5], wb: [-33.75, 29.5, 15] },
    dominus: { name: 'Dominus', hitbox: 'Dominus', hb: [65.21, 42.89, 16.9], off: [9, 0, 15.75], wf: [50.3, 31.1, 12], wb: [-34.75, 33, 13.5] },
    breakout: { name: 'Breakout', hitbox: 'Breakout', hb: [67, 41.51, 16.4], off: [12.5, 0, 11.75], wf: [51.5, 26.67, 13.5], wb: [-35.75, 35, 15] },
    merc: { name: 'Merc', hitbox: 'Merc', hb: [61.61, 39.61, 22.08], off: [11.38, 0, 21.5], wf: [51.25, 25.9, 15], wb: [-33.75, 29.5, 15] },
    venom: { name: 'Venom', hitbox: 'Hybrid', hb: [64.76, 42.34, 18.33], off: [13.88, 0, 20.75], wf: [51.25, 25.9, 12.5], wb: [-34, 29.5, 15] }
  };
  const BODY_IDS = Object.keys(BODIES);
  const TAU = Math.PI * 2, BR = CFG.ballR;
""")
rep("  function makeCar(team, name, bot) {\n    return {\n      id: carSeq++, team, name, bot, slot: 0,\n",
    "  function makeCar(team, name, bot, body) {\n    return {\n      id: carSeq++, team, name, bot, slot: 0, body: BODIES[body] ? body : 'octane',\n")
rep("    const ts = W.size, human = o.human !== false;\n", "    const ts = W.size, human = o.human !== false, bodies = o.bodies || [];\n")
rep("!(isMe || isP2));\n      c.slot = i;", "!(isMe || isP2), isMe ? bodies[0] : isP2 ? bodies[1] : 'octane');\n      c.slot = i;")
rep("    css: CSS.replace(/\\$/g, '.gm-' + ID),\n    sim: { CFG, sdf, sdfN, makeWorld, startMatch, worldStep, kickoff, placeCar, ballStep, predict, makeBall },",
    "    css: (CSS + CSS_FX).replace(/\\$/g, '.gm-' + ID),\n    sim: { CFG, BODIES, BODY_IDS, sdf, sdfN, makeWorld, startMatch, worldStep, kickoff, placeCar, ballStep, predict, makeBall },")
rep("Object.assign({ play: 'cpu', size: 1, diff: 'pro', len: 300, cam: true }, api.load() || {});\n        if (!DIFF[saved.diff]) saved.diff = 'pro';\n",
    "Object.assign({ play: 'cpu', size: 1, diff: 'pro', len: 300, cam: true, car: 'octane' }, api.load() || {});\n        if (!DIFF[saved.diff]) saved.diff = 'pro';\n        if (!BODIES[saved.car]) saved.car = 'octane';\n        if (![1, 2, 3].includes(saved.size)) saved.size = 1;\n")
rep("p2: mode === 'local', names: mode === 'local' ? ['P1', 'P2'] : null });", "p2: mode === 'local', names: mode === 'local' ? ['P1', 'P2'] : null, bodies: [saved.car, saved.car] });")
rep("for (let team = 0; team < 2; team++) for (let slot = 0; slot < 2; slot++) {", "for (let team = 0; team < 2; team++) for (let slot = 0; slot < 3; slot++) {")
rep("const visOf = c => carVis[c.team * 2 + c.slot];", "const visOf = c => carVis[c.team * 3 + c.slot];")
cam = """        const camera = new THREE.PerspectiveCamera(portrait ? 78 : 2 * Math.atan(Math.tan(CFG.cam.fov * Math.PI / 360) / (w / h)) * 180 / Math.PI, w / h, 10, 90000);
        camera.up.set(0, 0, 1);
"""
rep(cam, "")
pv_start = s.index("  const PVS = `")
pv_end = s.index("  const el = (tag, cls, parent, html)")
pv = s[pv_start:pv_end]
s = s[:pv_start] + s[pv_end:]
rep("  const NO_GL = {", "//@@SEG 02_fxhead fx\n" + pv + "  const CSS_FX = `\n`;\n\n//@@SEG 03_style ui\n  const NO_GL = {")
rep("      function run({ THREE, renderer, canvas, w, h }) {\n", "//@@SEG 04_core lead\n      function run({ THREE, renderer, canvas, w, h }) {\n")
rep("        const saved = Object.assign(", "//@@SEG 05_state ui\n        const saved = Object.assign(")
rep("\n\n        const scene = new THREE.Scene();", "\n\n//@@SEG 06_scene arena\n        const scene = new THREE.Scene();")
rep("        const V2d = (pts) =>", "//@@SEG 07_cars cars\n        const V2d = (pts) =>")
rep("        const particles = (n, additive) => {", "//@@SEG 08_fx fx\n" + cam + "        const particles = (n, additive) => {")
rep("        const hud = el('div', 'hud', wrap);", "//@@SEG 09_ui ui\n        const hud = el('div', 'hud', wrap);")
rep("        let AC = null, master = null,", "//@@SEG 10_fxa fx\n        let AC = null, master = null,")
a = s.index("        const M4 = new THREE.Matrix4(), vF = new THREE.Vector3()")
b = s.index("        const hudUpdate = dt => {")
vis = s[a:b]
lines = vis.split('\n')
head = lines[0]
body = '\n'.join(lines[2:])
i_ball = body.index("          const B = W.ball;\n          ballM.visible")
i_fire = body.index("          fire.update(dt); smoke.update(dt);")
i_end = body.index("        };\n")
carpart = body[:i_ball]
worldpart = body[i_ball:i_fire]
fxpart = body[i_fire:i_end]
new = ("//@@SEG 11_carvis cars\n        const M4 = new THREE.Matrix4(), vF = new THREE.Vector3(), vL = new THREE.Vector3(), vU = new THREE.Vector3();\n"
       "        const carVisuals = (dt, t) => {\n" + carpart + "        };\n\n"
       "//@@SEG 12_worldvis arena\n        const Q = new THREE.Quaternion(), ax = new THREE.Vector3();\n"
       "        const worldVisuals = (dt, t) => {\n" + worldpart + "        };\n\n"
       "//@@SEG 13_fxvis fx\n        const fxVisuals = (dt, t) => {\n" + fxpart + "        };\n"
       "        const visuals = (dt, t) => { carVisuals(dt, t); worldVisuals(dt, t); fxVisuals(dt, t); };\n\n\n")
assert head.startswith("        const M4 = new THREE.Matrix4(), vF = new THREE.Vector3(), vL = new THREE.Vector3(), vU = new THREE.Vector3(), Q = new THREE.Quaternion(), ax = new THREE.Vector3();"), head
s = s[:a] + new + s[b:]
rep("        const hudUpdate = dt => {", "//@@SEG 14_hud ui\n        const hudUpdate = dt => {")
rep("        const soundUpdate = () => {", "//@@SEG 15_fxloop fx\n        const soundUpdate = () => {")
rep("        wrap.__rs = {", "//@@SEG 16_boot ui\n        wrap.__rs = {")
rep("        return () => {\n          dead = true;", "//@@SEG 17_tail lead\n        return () => {\n          dead = true;")
s = "//@@SEG 01_sim mech\n" + s
open(p, 'w', encoding='utf-8', newline='').write(s)
