LT = '/tmp/gameplay-build/w/agents2/covers/ltex/'

SPECS = {}


def S(id_, logo, post=None, **kw):
    d = {'logo': logo, 'post': post or {}}
    d.update(kw)
    SPECS[id_] = d


S('blockcraft-3d', {
    'lines': [{'t': 'MINECRAFT', 'size': 100}], 'font': 'Press Start 2P', 'weight': 400,
    'fillimg': 'file://' + LT + 'stone.png', 'fillimgw': 40,
    'sw': 0.045, 'sc': '#1b1b1b', 'depth': 0.16, 'dcol': ['#4a4a4a', '#151515'], 'ddir': [0, 1],
    'gloss': 0.18, 'glossh': 0.3, 'shadow': 0.7, 'x': 0.5, 'y': 0.17, 'maxw': 0.78, 'maxh': 0.26, 'ls': 0.02,
    'inner': '#000', 'innera': 0.0,
}, {
    'haze': {'color': '#a9c6ee', 'start': 0.15, 'end': 0.8, 'amount': 0.35, 'pow': 1.3},
    'grade': {'exposure': 1.08, 'sat': 1.2, 'con': 1.1, 'split': ['#2a4a80', '#ffd29a', 0.14]},
    'bloom': {'th': 0.7, 'amt': 0.3, 'r': 16}, 'vig': 0.45, 'topgrad': {'h': 0.38, 'amt': 0.25, 'color': '#0a1e44'},
})

S('rocket-soccer', {
    'lines': [{'t': 'ROCKET', 'size': 100}, {'t': 'LEAGUE', 'size': 100}], 'font': 'Russo One', 'weight': 400, 'italic': False, 'skew': -12,
    'fill': ['#ffffff', ['#e6ecf5', 0.45], ['#9aa6b8', 0.5], '#eef3fa'], 'sw': 0.035, 'sc': '#0d1220', 'ow': 0.03, 'oc': '#ff8a2a',
    'depth': 0.08, 'dcol': ['#3a2010', '#0a0604'], 'ddir': [0.3, 1], 'gloss': 0, 'shadow': 0.75, 'glow': '#ff7a1a', 'ga': 0.35, 'gr': 26,
    'x': 0.26, 'y': 0.2, 'maxw': 0.44, 'maxh': 0.3, 'lh': 0.9, 'ls': 0.03, 'edge': '#ffffff', 'edgew': 0.008, 'edgea': 0.5,
}, {
    'dof': {'z0': 0.16, 'z1': 0.5, 'r': 6},
    'grade': {'sat': 1.15, 'con': 1.1, 'split': ['#1a3a80', '#ffb070', 0.12]},
    'bloom': {'th': 0.6, 'amt': 0.55, 'r': 14}, 'vig': 0.5, 'topgrad': {'h': 0.4, 'amt': 0.4, 'color': '#02040c'},
})

S('sky-runner', {
    'lines': [{'t': 'SUBWAY', 'size': 100}, {'t': 'SURFERS', 'size': 100}], 'font': 'Luckiest Guy', 'weight': 400, 'rot': -4,
    'fill': ['#fff6a0', ['#ffd21a', 0.5], '#ff9a0a'], 'sw': 0.07, 'sc': '#0b2a6a', 'ow': 0.05, 'oc': '#ffffff',
    'depth': 0.09, 'dcol': ['#0b2a6a', '#06163a'], 'ddir': [0.2, 1], 'dout': '#ffffff', 'gloss': 0.35, 'glossh': 0.38, 'shadow': 0.6,
    'x': 0.5, 'y': 0.83, 'maxw': 0.62, 'maxh': 0.3, 'lh': 0.86,
}, {
    'dof': {'z0': 0.12, 'z1': 0.4, 'r': 5},
    'haze': {'color': '#bcdcff', 'start': 0.15, 'end': 0.9, 'amount': 0.4},
    'grade': {'sat': 1.22, 'con': 1.08, 'split': ['#3060c0', '#ffd090', 0.1]},
    'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.35, 'botgrad': {'h': 0.35, 'amt': 0.45, 'color': '#0a1838'},
})

S('road-hopper', {
    'lines': [{'t': 'CROSSY', 'size': 100}, {'t': 'ROAD', 'size': 100}], 'font': 'Bungee', 'weight': 400, 'rot': -3,
    'fill': ['#ffffff', '#e8eef5'], 'sw': 0.05, 'sc': '#14141c', 'ow': 0, 'depth': 0.16, 'dcol': ['#2a2a36', '#0c0c12'], 'ddir': [0.35, 1],
    'gloss': 0, 'shadow': 0.5, 'x': 0.5, 'y': 0.2, 'maxw': 0.5, 'maxh': 0.33, 'lh': 0.92,
}, {
    'dof': {'z0': 0.3, 'z1': 0.7, 'r': 4},
    'grade': {'sat': 1.18, 'con': 1.06, 'split': ['#3a70d0', '#ffe0a0', 0.08]},
    'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.3, 'topgrad': {'h': 0.4, 'amt': 0.2, 'color': '#103060'},
})

S('slither', {
    'lines': [{'t': 'slither.io', 'size': 100}], 'font': 'Fredoka', 'weight': 700,
    'fill': ['#ffffff', '#dfe8ff'], 'sw': 0.0, 'ow': 0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8, 'shr': 10,
    'glow': '#ff3a8a', 'ga': 0.75, 'gr': 18, 'glow2': '#7a3aff', 'ga2': 0.6, 'gr2': 40,
    'x': 0.5, 'y': 0.17, 'maxw': 0.56, 'maxh': 0.24,
}, {
    'dof': {'z0': 0.34, 'z1': 0.6, 'r': 5},
    'grade': {'sat': 1.2, 'con': 1.08},
    'bloom': {'th': 0.55, 'amt': 0.7, 'r': 12}, 'vig': 0.5, 'topgrad': {'h': 0.4, 'amt': 0.55, 'color': '#02030a'},
})

S('dash-cube', {
    'lines': [{'t': 'GEOMETRY', 'size': 100}, {'t': 'DASH', 'size': 118}], 'font': 'Bungee', 'weight': 400,
    'fill': ['#fff27a', ['#ffd21a', 0.5], '#ff8a0a'], 'sw': 0.06, 'sc': '#000000', 'ow': 0.025, 'oc': '#ffffff',
    'depth': 0.05, 'dcol': ['#000000', '#000000'], 'ddir': [0, 1], 'gloss': 0.3, 'glossh': 0.4, 'shadow': 0.7,
    'glow': '#3a8aff', 'ga': 0.5, 'gr': 30,
    'x': 0.5, 'y': 0.2, 'maxw': 0.56, 'maxh': 0.32, 'lh': 0.9,
}, {
    'grade': {'sat': 1.15, 'con': 1.08},
    'bloom': {'th': 0.6, 'amt': 0.6, 'r': 12}, 'vig': 0.45, 'topgrad': {'h': 0.4, 'amt': 0.35, 'color': '#020520'},
})

S('flap-bird', {
    'lines': [{'t': 'FLAPPY BIRD', 'size': 100}], 'font': 'Luckiest Guy', 'weight': 400,
    'fill': ['#ffffff', '#f2f2f2'], 'sw': 0.06, 'sc': '#3a2a1a', 'ow': 0.04, 'oc': '#ffffff',
    'depth': 0.1, 'dcol': ['#3a2a1a', '#1a120a'], 'ddir': [0, 1], 'dout': '#ffffff', 'gloss': 0, 'shadow': 0.45,
    'x': 0.5, 'y': 0.84, 'maxw': 0.66, 'maxh': 0.22,
}, {
    'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4},
    'grade': {'sat': 1.3, 'con': 1.06},
    'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.25,
})

S('brick-bros', {
    'lines': [{'t': 'SUPER MARIO', 'size': 70, 'style': {'depth': 0.12}}, {'t': 'BROS.', 'size': 120}], 'font': 'Luckiest Guy', 'weight': 400, 'rot': -2,
    'fill': ['#ffe14a', ['#ffc21a', 0.55], '#ff8a00'], 'sw': 0.06, 'sc': '#1a0e04', 'ow': 0.045, 'oc': '#ffffff',
    'depth': 0.1, 'dcol': ['#b8200a', '#5a0a02'], 'ddir': [0.25, 1], 'dout': '#ffffff', 'gloss': 0.35, 'glossh': 0.4, 'shadow': 0.5,
    'x': 0.24, 'y': 0.82, 'maxw': 0.42, 'maxh': 0.3, 'lh': 0.88,
}, {
    'dof': {'z0': 0.28, 'z1': 0.6, 'r': 4},
    'grade': {'sat': 1.35, 'con': 1.08},
    'bloom': {'th': 0.85, 'amt': 0.25, 'r': 12}, 'vig': 0.3,
})

S('last-card', {
    'lines': [{'t': 'UNO', 'size': 130}], 'font': 'Titan One', 'weight': 400, 'rot': -6, 'skew': -6,
    'fill': ['#fff36a', ['#ffd21a', 0.5], '#ffae00'], 'sw': 0.06, 'sc': '#1a0606', 'ow': 0.05, 'oc': '#e8201a',
    'depth': 0.14, 'dcol': ['#7a0a06', '#2a0202'], 'ddir': [0.3, 1], 'dout': '#7a0a06', 'gloss': 0.35, 'glossh': 0.42, 'shadow': 0.7,
    'x': 0.5, 'y': 0.17, 'maxw': 0.4, 'maxh': 0.27,
}, {
    'dof': {'z0': 0.4, 'z1': 0.75, 'r': 5},
    'grade': {'sat': 1.18, 'con': 1.08, 'split': ['#20306a', '#ffd0a0', 0.1]},
    'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.5, 'topgrad': {'h': 0.35, 'amt': 0.4, 'color': '#02030a'},
})

S('chess', {
    'lines': [{'t': 'CHESS', 'size': 110}], 'font': 'Cinzel', 'weight': 900, 'ls': 0.12,
    'fill': ['#fff4d0', ['#f2cf7a', 0.45], ['#b8862a', 0.55], '#f6dc96'], 'sw': 0.025, 'sc': '#1a1206', 'ow': 0, 'depth': 0.04, 'dcol': ['#5a3a10', '#1a1006'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.8, 'glow': '#ffc870', 'ga': 0.25, 'gr': 26, 'edge': '#fff8e0', 'edgew': 0.006, 'edgea': 0.6,
    'x': 0.5, 'y': 0.88, 'maxw': 0.5, 'maxh': 0.2,
}, {
    'grade': {'sat': 1.05, 'con': 1.1, 'split': ['#1a2a5a', '#ffcf90', 0.12]},
    'bloom': {'th': 0.7, 'amt': 0.3, 'r': 16}, 'vig': 0.55, 'botgrad': {'h': 0.35, 'amt': 0.6, 'color': '#000000'},
})

S('tetra', {
    'lines': [{'t': 'TETRIS', 'size': 110}], 'font': 'Russo One', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffffff', ['#bfe8ff', 0.5], '#5ac8ff'], 'sw': 0.035, 'sc': '#06102a', 'ow': 0.025, 'oc': '#2a7aff',
    'depth': 0.08, 'dcol': ['#0a2a7a', '#020a20'], 'ddir': [0, 1], 'gloss': 0.25, 'glossh': 0.45, 'shadow': 0.8,
    'glow': '#2a8aff', 'ga': 0.55, 'gr': 26, 'x': 0.5, 'y': 0.13, 'maxw': 0.5, 'maxh': 0.2,
}, {
    'dof': {'z0': 0.45, 'z1': 0.7, 'r': 5},
    'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.6, 'amt': 0.5, 'r': 14}, 'vig': 0.45,
    'topgrad': {'h': 0.3, 'amt': 0.5, 'color': '#000000'},
})
S('2048', {
    'lines': [{'t': '2048', 'size': 120}], 'font': 'Archivo Black', 'weight': 400, 'ls': 0.02,
    'fill': ['#fff2c0', ['#f6d86a', 0.5], '#e8b830'], 'sw': 0.035, 'sc': '#5a3a10', 'ow': 0.03, 'oc': '#ffffff',
    'depth': 0.09, 'dcol': ['#b8862a', '#5a3a10'], 'ddir': [0.2, 1], 'dout': '#ffffff', 'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.6,
    'glow': '#ffd060', 'ga': 0.4, 'gr': 26, 'x': 0.27, 'y': 0.17, 'maxw': 0.42, 'maxh': 0.22,
}, {
    'dof': {'z0': 0.45, 'z1': 0.75, 'r': 4},
    'grade': {'sat': 1.2, 'con': 1.08}, 'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.45,
})
S('pool', {
    'lines': [{'t': '8 BALL', 'size': 100}, {'t': 'POOL', 'size': 132}], 'font': 'Bebas Neue', 'weight': 400, 'ls': 0.04,
    'fill': ['#ffffff', ['#e8eef2', 0.5], '#b8c4cc'], 'sw': 0.025, 'sc': '#020604', 'ow': 0.0, 'depth': 0.05, 'dcol': ['#1a2a22', '#000000'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.8, 'edge': '#ffffff', 'edgew': 0.006, 'edgea': 0.4, 'glow': '#ffd890', 'ga': 0.2, 'gr': 20,
    'x': 0.18, 'y': 0.22, 'maxw': 0.3, 'maxh': 0.36, 'lh': 0.82,
}, {
    'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4},
    'grade': {'sat': 1.18, 'con': 1.12, 'split': ['#10302a', '#ffd8a0', 0.1]}, 'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.6,
    'topgrad': {'h': 0.4, 'amt': 0.4, 'color': '#000000'},
})
S('cube-3d', {
    'lines': [{'t': "RUBIK'S", 'size': 80}, {'t': 'CUBE', 'size': 120}], 'font': 'Montserrat', 'weight': 900, 'ls': 0.03,
    'fill': ['#ffffff', '#dfe6ee'], 'sw': 0.03, 'sc': '#05060c', 'ow': 0.0, 'depth': 0.06, 'dcol': ['#20263a', '#000000'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.8, 'x': 0.2, 'y': 0.22, 'maxw': 0.3, 'maxh': 0.34, 'lh': 0.9,
    'tag': {'t': 'SOLVE IT', 'size': 22, 'font': 'Oswald', 'color': '#ffd500', 'ls': 0.4},
}, {
    'dof': {'z0': 0.45, 'z1': 0.7, 'r': 4},
    'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.5,
})
S('maze-muncher', {
    'lines': [{'t': 'PAC-MAN', 'size': 110}], 'font': 'Bungee', 'weight': 400, 'ls': 0.02,
    'fill': ['#fff36a', ['#ffd400', 0.5], '#ff9a00'], 'sw': 0.05, 'sc': '#1a0a00', 'ow': 0.035, 'oc': '#2a5cff',
    'depth': 0.1, 'dcol': ['#0a1a8a', '#020630'], 'ddir': [0, 1], 'dout': '#2a5cff', 'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.8,
    'glow': '#2a5cff', 'ga': 0.6, 'gr': 26, 'x': 0.5, 'y': 0.15, 'maxw': 0.56, 'maxh': 0.22,
}, {
    'dof': {'z0': 0.25, 'z1': 0.5, 'r': 5},
    'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.55, 'amt': 0.6, 'r': 12}, 'vig': 0.45,
    'topgrad': {'h': 0.35, 'amt': 0.5, 'color': '#000000'},
})
S('stack', {
    'lines': [{'t': 'STACK', 'size': 110}], 'font': 'Montserrat', 'weight': 900, 'ls': 0.25,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.35, 'shr': 8,
    'x': 0.5, 'y': 0.14, 'maxw': 0.46, 'maxh': 0.17,
}, {'keep_alpha': True, 'vig': 0, 'grain': 0, 'bloom': None, 'grade': {'sat': 1.05, 'con': 1.02}},
  under='<div style="position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 30%,#bfe6f2 0%,#9ab8e8 45%,#c89ad8 100%)"></div>')

S('helix-3d', {
    'lines': [{'t': 'HELIX', 'size': 110}, {'t': 'JUMP', 'size': 110}], 'font': 'Fredoka', 'weight': 700, 'ls': 0.02,
    'fill': ['#ffffff', '#fff0f6'], 'sw': 0.05, 'sc': '#ff2a6a', 'ow': 0.03, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#c01a4a', '#6a0a2a'], 'ddir': [0, 1], 'dout': '#ffffff',
    'gloss': 0, 'shadow': 0.35, 'x': 0.76, 'y': 0.5, 'maxw': 0.4, 'maxh': 0.42, 'lh': 0.88, 'rot': -4,
}, {
    'dof': {'z0': 0.45, 'z1': 0.75, 'r': 4},
    'grade': {'sat': 1.2, 'con': 1.06}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 14}, 'vig': 0.3,
})
S('slope-3d', {
    'lines': [{'t': 'SLOPE', 'size': 120}], 'font': 'Orbitron', 'weight': 900, 'ls': 0.18,
    'fill': ['#eaffef', ['#7aff9a', 0.5], '#1aff5a'], 'sw': 0.02, 'sc': '#012a0a', 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.6,
    'glow': '#1aff5a', 'ga': 0.75, 'gr': 20, 'glow2': '#1aff8a', 'ga2': 0.4, 'gr2': 50,
    'x': 0.5, 'y': 0.16, 'maxw': 0.56, 'maxh': 0.2,
}, {
    'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.5, 'amt': 0.6, 'r': 12}, 'vig': 0.5,
})
S('tunnel-run', {
    'lines': [{'t': 'TUNNEL', 'size': 110}, {'t': 'RUSH', 'size': 140}], 'font': 'Audiowide', 'weight': 400, 'ls': 0.08,
    'fill': ['#ffffff', ['#ffd8f8', 0.5], '#ff6ad8'], 'sw': 0.03, 'sc': '#1a0020', 'ow': 0.0, 'depth': 0.06, 'dcol': ['#5a0060', '#100014'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.8, 'glow': '#ff3ad8', 'ga': 0.6, 'gr': 26, 'x': 0.5, 'y': 0.5, 'maxw': 0.6, 'maxh': 0.42, 'lh': 0.88,
}, {
    'grade': {'sat': 1.3, 'con': 1.1}, 'bloom': {'th': 0.6, 'amt': 0.5, 'r': 14}, 'vig': 0.6,
})
S('block-roll', {
    'lines': [{'t': 'BLOXORZ', 'size': 110}], 'font': 'Black Ops One', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffe0c8', ['#ff9a5a', 0.5], '#d8461a'], 'sw': 0.035, 'sc': '#1a0802', 'ow': 0.0, 'depth': 0.1, 'dcol': ['#6a2008', '#1a0602'], 'ddir': [0.2, 1],
    'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.8, 'glow': '#ff6a2a', 'ga': 0.3, 'gr': 24, 'x': 0.5, 'y': 0.16, 'maxw': 0.56, 'maxh': 0.2,
}, {
    'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4},
    'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.4, 'r': 14}, 'vig': 0.45,
})
S('hoops-3d', {
    'lines': [{'t': 'HOOPS', 'size': 120}, {'t': '3D', 'size': 80}], 'font': 'Graduate', 'weight': 400, 'ls': 0.06,
    'fill': ['#fff0d8', ['#ffb050', 0.5], '#e8641a'], 'sw': 0.035, 'sc': '#1a0802', 'ow': 0.025, 'oc': '#ffffff', 'depth': 0.08, 'dcol': ['#7a2a08', '#2a0a02'], 'ddir': [0, 1], 'dout': '#ffffff',
    'gloss': 0, 'shadow': 0.8, 'x': 0.78, 'y': 0.28, 'maxw': 0.36, 'maxh': 0.36, 'lh': 0.9,
}, {
    'dof': {'z0': 0.3, 'z1': 0.6, 'r': 5},
    'grade': {'sat': 1.15, 'con': 1.1, 'split': ['#1a2a5a', '#ffc080', 0.12]}, 'bloom': {'th': 0.6, 'amt': 0.5, 'r': 14}, 'vig': 0.5,
})
S('knife-throw', {
    'lines': [{'t': 'KNIFE HIT', 'size': 110}], 'font': 'Bangers', 'weight': 400, 'ls': 0.05, 'skew': -8,
    'fill': ['#ffffff', ['#ffe8d0', 0.5], '#ffb070'], 'sw': 0.05, 'sc': '#1a0602', 'ow': 0.0, 'depth': 0.1, 'dcol': ['#5a1a6a', '#1a0420'], 'ddir': [0.2, 1],
    'gloss': 0, 'shadow': 0.7, 'glow': '#ff6ad0', 'ga': 0.4, 'gr': 24, 'x': 0.5, 'y': 0.88, 'maxw': 0.5, 'maxh': 0.18,
}, {
    'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.45,
})

S('paper-land', {
    'lines': [{'t': 'paper.io', 'size': 110}], 'font': 'Fredoka', 'weight': 700,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.06, 'sc': '#2a62c8', 'ow': 0.0, 'depth': 0.1, 'dcol': ['#2a62c8', '#1a3a8a'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.4, 'x': 0.5, 'y': 0.15, 'maxw': 0.5, 'maxh': 0.22,
}, {'dof': {'z0': 0.55, 'z1': 0.85, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.9, 'amt': 0.15, 'r': 12}, 'vig': 0.3})
S('cell-feast', {
    'lines': [{'t': 'agar.io', 'size': 110}], 'font': 'Fredoka', 'weight': 700,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.06, 'sc': '#1a1a1a', 'ow': 0.0, 'depth': 0.08, 'dcol': ['#1a1a1a', '#000000'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.4, 'x': 0.5, 'y': 0.15, 'maxw': 0.46, 'maxh': 0.22,
}, {'dof': {'z0': 0.5, 'z1': 0.85, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.9, 'amt': 0.15, 'r': 12}, 'vig': 0.3})
S('hole-city', {
    'lines': [{'t': 'hole.io', 'size': 110}], 'font': 'Fredoka', 'weight': 700,
    'fill': ['#ffffff', '#e8f6ff'], 'sw': 0.06, 'sc': '#0a0a14', 'ow': 0.03, 'oc': '#3ad0ff', 'depth': 0.08, 'dcol': ['#0a0a14', '#000000'], 'ddir': [0, 1], 'dout': '#3ad0ff',
    'gloss': 0, 'shadow': 0.5, 'glow': '#3ad0ff', 'ga': 0.4, 'gr': 22, 'x': 0.5, 'y': 0.13, 'maxw': 0.46, 'maxh': 0.2,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.75, 'amt': 0.35, 'r': 12}, 'vig': 0.35})
S('garden-defense', {
    'lines': [{'t': 'PLANTS', 'size': 90}, {'t': 'vs.', 'size': 60}, {'t': 'ZOMBIES', 'size': 90}], 'font': 'Luckiest Guy', 'weight': 400, 'rot': -3,
    'fill': ['#d8ff8a', ['#8ae83a', 0.5], '#3aa81a'], 'sw': 0.06, 'sc': '#0a2a04', 'ow': 0.04, 'oc': '#ffffff',
    'depth': 0.09, 'dcol': ['#1a4a0a', '#0a1a04'], 'ddir': [0.2, 1], 'dout': '#ffffff', 'gloss': 0.3, 'glossh': 0.4, 'shadow': 0.5,
    'x': 0.25, 'y': 0.2, 'maxw': 0.38, 'maxh': 0.34, 'lh': 0.82,
}, {'dof': {'z0': 0.6, 'z1': 0.85, 'r': 4}, 'grade': {'sat': 1.2, 'con': 1.06}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 12}, 'vig': 0.35})
S('bean-royale', {
    'lines': [{'t': 'FALL GUYS', 'size': 110}], 'font': 'Titan One', 'weight': 400, 'rot': -3,
    'fill': ['#ffffff', ['#fff0fa', 0.5], '#ffc8ea'], 'sw': 0.06, 'sc': '#6a1a8a', 'ow': 0.04, 'oc': '#ffffff',
    'depth': 0.12, 'dcol': ['#8a2aaa', '#3a0a5a'], 'ddir': [0.2, 1], 'dout': '#ffffff', 'gloss': 0.3, 'glossh': 0.4, 'shadow': 0.5,
    'x': 0.5, 'y': 0.15, 'maxw': 0.6, 'maxh': 0.22,
}, {'dof': {'z0': 0.25, 'z1': 0.55, 'r': 4}, 'grade': {'sat': 1.18, 'con': 1.06}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 12}, 'vig': 0.3})
S('hoop-flop', {
    'lines': [{'t': 'BASKET', 'size': 100}, {'t': 'RANDOM', 'size': 100}], 'font': 'Bowlby One', 'weight': 400, 'rot': -4,
    'fill': ['#ffffff', ['#ffe0c0', 0.5], '#ffa040'], 'sw': 0.05, 'sc': '#1a0802', 'ow': 0.035, 'oc': '#e8241c',
    'depth': 0.1, 'dcol': ['#8a1a0a', '#2a0602'], 'ddir': [0.2, 1], 'dout': '#e8241c', 'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.6,
    'x': 0.24, 'y': 0.22, 'maxw': 0.4, 'maxh': 0.34, 'lh': 0.88,
}, {'dof': {'z0': 0.4, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 12}, 'vig': 0.4})

S('dino-run', {
    'lines': [{'t': 'CHROME DINO', 'size': 100}], 'font': 'Press Start 2P', 'weight': 400, 'ls': 0.04,
    'fill': ['#535353', '#3a3a3a'], 'sw': 0.0, 'ow': 0.06, 'oc': '#ffffff', 'depth': 0.08, 'dcol': ['#ffffff', '#e8e8e8'], 'ddir': [0, 1], 'dout': '#ffffff',
    'gloss': 0, 'shadow': 0.35, 'x': 0.5, 'y': 0.85, 'maxw': 0.66, 'maxh': 0.16,
}, {'dof': {'z0': 0.3, 'z1': 0.6, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.06}, 'bloom': {'th': 0.9, 'amt': 0.15, 'r': 12}, 'vig': 0.3})
S('snake', {
    'lines': [{'t': 'SNAKE', 'size': 120}], 'font': 'Lilita One', 'weight': 400, 'ls': 0.06, 'rot': -3,
    'fill': ['#ffffff', ['#e8f8ff', 0.5], '#b8dcff'], 'sw': 0.06, 'sc': '#1a3a8a', 'ow': 0.035, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#1a3a8a', '#0a1a4a'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.5, 'x': 0.72, 'y': 0.8, 'maxw': 0.44, 'maxh': 0.22,
}, {'dof': {'z0': 0.3, 'z1': 0.6, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.35})
S('cookie-baker', {
    'lines': [{'t': 'COOKIE', 'size': 100}, {'t': 'CLICKER', 'size': 100}], 'font': 'Sigmar One', 'weight': 400, 'rot': -3,
    'fill': ['#fff2c8', ['#f8c870', 0.5], '#d8902a'], 'sw': 0.05, 'sc': '#3a1a06', 'ow': 0.035, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#6a3a10', '#2a1404'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.6, 'x': 0.78, 'y': 0.5, 'maxw': 0.4, 'maxh': 0.38, 'lh': 0.88,
}, {'dof': {'z0': 0.4, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.06}, 'bloom': {'th': 0.8, 'amt': 0.3, 'r': 14}, 'vig': 0.45})
S('moto-stunts', {
    'lines': [{'t': 'MOTO X3M', 'size': 110}], 'font': 'Racing Sans One', 'weight': 400, 'ls': 0.02, 'skew': -10,
    'fill': ['#ffffff', ['#ffe0b0', 0.5], '#ff9a2a'], 'sw': 0.045, 'sc': '#1a0602', 'ow': 0.03, 'oc': '#e8241c', 'depth': 0.08, 'dcol': ['#6a1a0a', '#1a0402'], 'ddir': [0.3, 1], 'dout': '#e8241c',
    'gloss': 0, 'shadow': 0.7, 'x': 0.5, 'y': 0.85, 'maxw': 0.6, 'maxh': 0.18,
}, {'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.7, 'amt': 0.45, 'r': 16}, 'vig': 0.45})
S('sea-battle', {
    'lines': [{'t': 'BATTLESHIP', 'size': 110}], 'font': 'Black Ops One', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffffff', ['#e8ecf2', 0.5], '#a8b2bc'], 'sw': 0.035, 'sc': '#06080c', 'ow': 0.025, 'oc': '#ff7a2a', 'depth': 0.08, 'dcol': ['#2a2e34', '#000000'], 'ddir': [0, 1], 'dout': '#ff7a2a',
    'gloss': 0, 'shadow': 0.8, 'x': 0.5, 'y': 0.13, 'maxw': 0.62, 'maxh': 0.17,
}, {'grade': {'sat': 1.18, 'con': 1.18, 'split': ['#20306a', '#ffb070', 0.12]}, 'bloom': {'th': 0.65, 'amt': 0.6, 'r': 14}, 'vig': 0.45,
    'topgrad': {'h': 0.3, 'amt': 0.35, 'color': '#1a1020'}})
S('highway-3d', {
    'lines': [{'t': 'TRAFFIC', 'size': 100}, {'t': 'RACER', 'size': 100}], 'font': 'Racing Sans One', 'weight': 400, 'skew': -10,
    'fill': ['#ffffff', ['#ffe8d8', 0.5], '#ff8a5a'], 'sw': 0.035, 'sc': '#14040a', 'ow': 0.025, 'oc': '#ff2a4a', 'depth': 0.08, 'dcol': ['#5a0a1a', '#14020a'], 'ddir': [0.3, 1], 'dout': '#ff2a4a',
    'gloss': 0, 'shadow': 0.8, 'glow': '#ff2a4a', 'ga': 0.4, 'gr': 24, 'x': 0.22, 'y': 0.2, 'maxw': 0.4, 'maxh': 0.32, 'lh': 0.86,
}, {'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.6, 'amt': 0.55, 'r': 14}, 'vig': 0.5})

S('reaction', {
    'lines': [{'t': 'REACTION', 'size': 110}], 'font': 'Teko', 'weight': 700, 'ls': 0.12,
    'fill': ['#ffffff', ['#d8ffe0', 0.5], '#5aff8a'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.7,
    'glow': '#2aff6a', 'ga': 0.6, 'gr': 22, 'x': 0.5, 'y': 0.14, 'maxw': 0.5, 'maxh': 0.2,
    'tag': {'t': 'HOW FAST ARE YOU?', 'size': 22, 'font': 'Oswald', 'color': '#bfffd0', 'ls': 0.35},
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.55, 'r': 14}, 'vig': 0.5})
S('minesweeper', {
    'lines': [{'t': 'MINESWEEPER', 'size': 100}], 'font': 'Russo One', 'weight': 400, 'ls': 0.04,
    'fill': ['#ffffff', ['#e0e8f4', 0.5], '#a8b8d0'], 'sw': 0.035, 'sc': '#0a1020', 'ow': 0.0, 'depth': 0.08, 'dcol': ['#2a3450', '#05080f'], 'ddir': [0, 1],
    'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.8, 'x': 0.5, 'y': 0.12, 'maxw': 0.6, 'maxh': 0.16,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.45, 'topgrad': {'h': 0.3, 'amt': 0.45, 'color': '#05080f'}})
S('fruit-slice', {
    'lines': [{'t': 'FRUIT', 'size': 110}, {'t': 'NINJA', 'size': 110}], 'font': 'Bangers', 'weight': 400, 'ls': 0.06, 'skew': -8,
    'fill': ['#fff8e0', ['#ffd040', 0.5], '#ff7a10'], 'sw': 0.05, 'sc': '#1a0802', 'ow': 0.03, 'oc': '#ffffff', 'depth': 0.08, 'dcol': ['#6a2a08', '#1a0602'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0, 'shadow': 0.7, 'x': 0.8, 'y': 0.76, 'maxw': 0.34, 'maxh': 0.36, 'lh': 0.86,
}, {'dof': {'z0': 0.45, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.18, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.4, 'r': 14}, 'vig': 0.5})
S('word-guess', {
    'lines': [{'t': 'Wordle', 'size': 110}], 'font': 'Playfair Display', 'weight': 900, 'ls': 0.0,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8, 'shr': 10,
    'x': 0.22, 'y': 0.82, 'maxw': 0.34, 'maxh': 0.2,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.08}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.5})
S('sky-pilot', {
    'lines': [{'t': 'SKY PILOT', 'size': 110}], 'font': 'Changa One', 'weight': 400, 'ls': 0.03, 'skew': -6,
    'fill': ['#ffffff', ['#f0f8ff', 0.5], '#c8e4ff'], 'sw': 0.05, 'sc': '#0a2a6a', 'ow': 0.03, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#1a4aa8', '#0a1a4a'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0, 'shadow': 0.5, 'x': 0.5, 'y': 0.15, 'maxw': 0.56, 'maxh': 0.2,
}, {'haze': {'color': '#d0e8ff', 'start': 0.1, 'end': 0.8, 'amount': 0.4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.3})
S('tanks-3d', {
    'lines': [{'t': 'TANK', 'size': 110}, {'t': 'ARENA', 'size': 110}], 'font': 'Black Ops One', 'weight': 400, 'ls': 0.06,
    'fill': ['#fff4d8', ['#e8c890', 0.5], '#b08a50'], 'sw': 0.035, 'sc': '#0a0804', 'ow': 0.025, 'oc': '#ff7a2a', 'depth': 0.08, 'dcol': ['#3a2e1a', '#0a0804'], 'ddir': [0.2, 1], 'dout': '#ff7a2a',
    'gloss': 0, 'shadow': 0.85, 'x': 0.2, 'y': 0.2, 'maxw': 0.34, 'maxh': 0.34, 'lh': 0.88,
}, {'dof': {'z0': 0.62, 'z1': 0.85, 'r': 4}, 'grade': {'sat': 1.18, 'con': 1.2, 'split': ['#1a2a5a', '#ffb070', 0.14]}, 'bloom': {'th': 0.6, 'amt': 0.5, 'r': 14}, 'vig': 0.55})
S('bubble-pop', {
    'lines': [{'t': 'BUBBLE', 'size': 100}, {'t': 'SHOOTER', 'size': 100}], 'font': 'Fredoka', 'weight': 700, 'rot': -3,
    'fill': ['#ffffff', ['#fff0fa', 0.5], '#ffc8ec'], 'sw': 0.06, 'sc': '#5a1a9a', 'ow': 0.035, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#5a1a9a', '#2a0a4a'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.6, 'x': 0.5, 'y': 0.82, 'maxw': 0.5, 'maxh': 0.3, 'lh': 0.86,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.06}, 'bloom': {'th': 0.75, 'amt': 0.35, 'r': 14}, 'vig': 0.4})
S('pairs', {
    'lines': [{'t': 'PAIRS', 'size': 120}], 'font': 'Lilita One', 'weight': 400, 'ls': 0.1,
    'fill': ['#ffffff', ['#fff6d0', 0.5], '#ffd040'], 'sw': 0.05, 'sc': '#2a1a6a', 'ow': 0.0, 'depth': 0.1, 'dcol': ['#3a2a8a', '#14083a'], 'ddir': [0, 1],
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.7, 'x': 0.2, 'y': 0.16, 'maxw': 0.34, 'maxh': 0.2,
    'tag': {'t': 'MEMORY MATCH', 'size': 22, 'font': 'Oswald', 'color': '#ffe08a', 'ls': 0.35},
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.06}, 'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.4})
S('target-range-3d', {
    'lines': [{'t': 'TARGET', 'size': 110}, {'t': 'RANGE', 'size': 110}], 'font': 'Saira Stencil One', 'weight': 400, 'ls': 0.05,
    'fill': ['#ffffff', ['#f0f0f0', 0.5], '#d8d8d8'], 'sw': 0.035, 'sc': '#1a0604', 'ow': 0.025, 'oc': '#e8241c', 'depth': 0.08, 'dcol': ['#5a0a06', '#1a0202'], 'ddir': [0.2, 1], 'dout': '#e8241c',
    'gloss': 0, 'shadow': 0.7, 'x': 0.78, 'y': 0.22, 'maxw': 0.36, 'maxh': 0.34, 'lh': 0.88,
}, {'dof': {'z0': 0.25, 'z1': 0.55, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.1}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.4})
S('breakout', {
    'lines': [{'t': 'BREAKOUT', 'size': 110}], 'font': 'Audiowide', 'weight': 400, 'ls': 0.08,
    'fill': ['#ffffff', ['#e0f4ff', 0.5], '#8ad8ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.7,
    'glow': '#8a5aff', 'ga': 0.7, 'gr': 22, 'glow2': '#2ad8ff', 'ga2': 0.4, 'gr2': 50, 'x': 0.5, 'y': 0.13, 'maxw': 0.56, 'maxh': 0.18,
}, {'grade': {'sat': 1.2, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.55, 'r': 12}, 'vig': 0.5})
S('penalty-3d', {
    'lines': [{'t': 'PENALTY', 'size': 110}, {'t': 'KICK', 'size': 110}], 'font': 'Kanit', 'weight': 900, 'ls': 0.03, 'skew': -8,
    'fill': ['#ffffff', ['#f0f6ff', 0.5], '#c8d8f0'], 'sw': 0.035, 'sc': '#020814', 'ow': 0.025, 'oc': '#2aff6a', 'depth': 0.08, 'dcol': ['#0a2a14', '#020804'], 'ddir': [0.2, 1], 'dout': '#2aff6a',
    'gloss': 0, 'shadow': 0.8, 'x': 0.5, 'y': 0.17, 'maxw': 0.5, 'maxh': 0.3, 'lh': 0.86,
}, {'dof': {'z0': 0.35, 'z1': 0.6, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.6, 'amt': 0.45, 'r': 14}, 'vig': 0.5})
S('sudoku', {
    'lines': [{'t': 'SUDOKU', 'size': 120}], 'font': 'Archivo Black', 'weight': 400, 'ls': 0.08,
    'fill': ['#ffffff', ['#eaf2ff', 0.5], '#b8d0ff'], 'sw': 0.03, 'sc': '#0a1430', 'ow': 0.0, 'depth': 0.08, 'dcol': ['#1a2a5a', '#050a1a'], 'ddir': [0, 1],
    'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.8, 'x': 0.2, 'y': 0.14, 'maxw': 0.36, 'maxh': 0.18,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.08}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.45})

S('marble-3d', {
    'lines': [{'t': 'MARBLE', 'size': 110}, {'t': 'ROLL', 'size': 110}], 'font': 'Fredoka', 'weight': 700, 'rot': -3,
    'fill': ['#ffffff', ['#eaf6ff', 0.5], '#b8e0ff'], 'sw': 0.06, 'sc': '#1a3a8a', 'ow': 0.035, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#1a3a8a', '#0a1a4a'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.5, 'x': 0.78, 'y': 0.76, 'maxw': 0.36, 'maxh': 0.34, 'lh': 0.86,
}, {'dof': {'z0': 0.4, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.3})
S('trivia', {
    'lines': [{'t': 'TRIVIA', 'size': 120}], 'font': 'Bungee', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffffff', ['#fff0c0', 0.5], '#ffc21a'], 'sw': 0.04, 'sc': '#1a0a30', 'ow': 0.03, 'oc': '#8a5aff', 'depth': 0.1, 'dcol': ['#3a1a7a', '#0a0420'], 'ddir': [0, 1], 'dout': '#8a5aff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.8, 'glow': '#ff4ad8', 'ga': 0.35, 'gr': 24, 'x': 0.5, 'y': 0.84, 'maxw': 0.5, 'maxh': 0.18,
}, {'grade': {'sat': 1.15, 'con': 1.08}, 'bloom': {'th': 0.65, 'amt': 0.45, 'r': 14}, 'vig': 0.45, 'botgrad': {'h': 0.35, 'amt': 0.5, 'color': '#05030f'}})
S('invaders', {
    'lines': [{'t': 'SPACE', 'size': 100}, {'t': 'INVADERS', 'size': 100}], 'font': 'Press Start 2P', 'weight': 400, 'ls': 0.04,
    'fill': ['#ffffff', ['#d8ffd8', 0.5], '#5aff5a'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.08, 'dcol': ['#0a5a0a', '#021a02'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.8, 'glow': '#3aff3a', 'ga': 0.55, 'gr': 20, 'x': 0.5, 'y': 0.16, 'maxw': 0.56, 'maxh': 0.24, 'lh': 1.15,
}, {'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.55, 'r': 12}, 'vig': 0.5, 'topgrad': {'h': 0.4, 'amt': 0.5, 'color': '#000000'}})
S('aim', {
    'lines': [{'t': 'AIM TRAINER', 'size': 110}], 'font': 'Chakra Petch', 'weight': 700, 'ls': 0.08,
    'fill': ['#ffffff', ['#ffe0e4', 0.5], '#ff8a96'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#ff2a3a', 'ga': 0.55, 'gr': 20, 'x': 0.5, 'y': 0.84, 'maxw': 0.56, 'maxh': 0.16,
}, {'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 12}, 'vig': 0.5},
  html='<svg style="position:absolute;inset:0" width="960" height="600"><g stroke="#ffffff" stroke-width="3" opacity=".9" fill="none"><circle cx="480" cy="260" r="34"/><path d="M480 206v30M480 284v30M426 260h30M504 260h30"/></g><circle cx="480" cy="260" r="3" fill="#fff"/></svg>')
S('maze-3d', {
    'lines': [{'t': 'MAZE', 'size': 110}, {'t': 'ESCAPE', 'size': 110}], 'font': 'Cinzel', 'weight': 900, 'ls': 0.1,
    'fill': ['#fff0d0', ['#f2c870', 0.5], '#b8802a'], 'sw': 0.025, 'sc': '#140a02', 'ow': 0.0, 'depth': 0.05, 'dcol': ['#4a2a0a', '#0a0602'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'glow': '#ff9a3a', 'ga': 0.35, 'gr': 26, 'x': 0.5, 'y': 0.2, 'maxw': 0.46, 'maxh': 0.32, 'lh': 0.92,
}, {'grade': {'sat': 1.1, 'con': 1.12}, 'bloom': {'th': 0.6, 'amt': 0.5, 'r': 16}, 'vig': 0.6})
S('connect-four', {
    'lines': [{'t': 'CONNECT', 'size': 100}, {'t': 'FOUR', 'size': 130}], 'font': 'Titan One', 'weight': 400, 'rot': -3,
    'fill': ['#fff36a', ['#ffd21a', 0.5], '#ffa000'], 'sw': 0.05, 'sc': '#1a0606', 'ow': 0.035, 'oc': '#e8241c', 'depth': 0.1, 'dcol': ['#7a0a06', '#2a0202'], 'ddir': [0.2, 1], 'dout': '#e8241c',
    'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.6, 'x': 0.82, 'y': 0.3, 'maxw': 0.32, 'maxh': 0.36, 'lh': 0.86,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.06}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.4})

S('gem-swap', {
    'lines': [{'t': 'BEJEWELED', 'size': 110}], 'font': 'Cinzel', 'weight': 900, 'ls': 0.06,
    'fill': ['#fff4d0', ['#ffd060', 0.45], ['#c88a1a', 0.55], '#ffe8a0'], 'sw': 0.03, 'sc': '#1a0a02', 'ow': 0.02, 'oc': '#ffffff', 'depth': 0.06, 'dcol': ['#6a3a0a', '#140802'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'glow': '#ff5ad8', 'ga': 0.4, 'gr': 26, 'x': 0.5, 'y': 0.13, 'maxw': 0.6, 'maxh': 0.18,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.45, 'r': 14}, 'vig': 0.45, 'topgrad': {'h': 0.3, 'amt': 0.5, 'color': '#05030f'}})
S('asteroids-3d', {
    'lines': [{'t': 'ASTEROID', 'size': 100}, {'t': 'FIELD', 'size': 100}], 'font': 'Michroma', 'weight': 400, 'ls': 0.12,
    'fill': ['#ffffff', ['#e0ecff', 0.5], '#8ab8ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#3a7aff', 'ga': 0.55, 'gr': 22, 'x': 0.26, 'y': 0.8, 'maxw': 0.42, 'maxh': 0.24, 'lh': 1.1,
}, {'dof': {'z0': 0.12, 'z1': 0.4, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 14}, 'vig': 0.5})
S('solitaire', {
    'lines': [{'t': 'SOLITAIRE', 'size': 110}], 'font': 'Playfair Display', 'weight': 900, 'ls': 0.04,
    'fill': ['#fff4d8', ['#f2d08a', 0.5], '#c8902a'], 'sw': 0.02, 'sc': '#140a02', 'ow': 0.0, 'depth': 0.05, 'dcol': ['#4a2a0a', '#0a0602'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'x': 0.5, 'y': 0.12, 'maxw': 0.56, 'maxh': 0.18,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.1}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.55, 'topgrad': {'h': 0.3, 'amt': 0.5, 'color': '#010402'}})
S('perfect-stop', {
    'lines': [{'t': 'PERFECT', 'size': 110}, {'t': 'STOP', 'size': 110}], 'font': 'Unbounded', 'weight': 900, 'ls': 0.04,
    'fill': ['#ffffff', ['#fff8d8', 0.5], '#ffe070'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#ffd040', 'ga': 0.45, 'gr': 22, 'x': 0.5, 'y': 0.2, 'maxw': 0.46, 'maxh': 0.3, 'lh': 0.95,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 14}, 'vig': 0.5})
S('piano-tiles', {
    'lines': [{'t': 'PIANO', 'size': 110}, {'t': 'TILES', 'size': 110}], 'font': 'Montserrat', 'weight': 900, 'ls': 0.1,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.85,
    'glow': '#3ad8ff', 'ga': 0.45, 'gr': 22, 'x': 0.2, 'y': 0.22, 'maxw': 0.32, 'maxh': 0.32, 'lh': 0.95,
}, {'dof': {'z0': 0.35, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.6, 'amt': 0.45, 'r': 14}, 'vig': 0.5})
S('math-sprint', {
    'lines': [{'t': 'MATH', 'size': 110}, {'t': 'SPRINT', 'size': 110}], 'font': 'Rubik', 'weight': 900, 'ls': 0.04, 'skew': -8,
    'fill': ['#ffffff', ['#e8f4ff', 0.5], '#9ad0ff'], 'sw': 0.04, 'sc': '#0a1440', 'ow': 0.0, 'depth': 0.08, 'dcol': ['#1a3a9a', '#050a2a'], 'ddir': [0.2, 1],
    'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.8, 'x': 0.2, 'y': 0.2, 'maxw': 0.32, 'maxh': 0.3, 'lh': 0.9,
}, {'dof': {'z0': 0.45, 'z1': 0.75, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.45})

S('whack', {
    'lines': [{'t': 'WHACK-A-', 'size': 90}, {'t': 'MOLE', 'size': 130}], 'font': 'Luckiest Guy', 'weight': 400, 'rot': -4,
    'fill': ['#fff6c0', ['#ffd040', 0.5], '#ff9a10'], 'sw': 0.06, 'sc': '#3a1a06', 'ow': 0.04, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#6a3a10', '#2a1404'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.5, 'x': 0.78, 'y': 0.78, 'maxw': 0.38, 'maxh': 0.36, 'lh': 0.84,
}, {'dof': {'z0': 0.35, 'z1': 0.65, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.06}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 12}, 'vig': 0.35})
S('air-hockey', {
    'lines': [{'t': 'AIR', 'size': 110}, {'t': 'HOCKEY', 'size': 110}], 'font': 'Russo One', 'weight': 400, 'ls': 0.06, 'skew': -8,
    'fill': ['#ffffff', ['#e0f6ff', 0.5], '#7ad8ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.06, 'dcol': ['#0a3a6a', '#020a1a'], 'ddir': [0.2, 1], 'gloss': 0, 'shadow': 0.8,
    'glow': '#ff2a6a', 'ga': 0.5, 'gr': 22, 'x': 0.2, 'y': 0.72, 'maxw': 0.32, 'maxh': 0.32, 'lh': 0.9,
}, {'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 12}, 'vig': 0.5})
S('typing', {
    'lines': [{'t': 'TYPING', 'size': 110}, {'t': 'TEST', 'size': 110}], 'font': 'Chakra Petch', 'weight': 700, 'ls': 0.14,
    'fill': ['#ffffff', ['#fff0e8', 0.5], '#ffb08a'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#ff6a2a', 'ga': 0.5, 'gr': 22, 'x': 0.22, 'y': 0.2, 'maxw': 0.36, 'maxh': 0.3, 'lh': 0.95,
}, {'dof': {'z0': 0.4, 'z1': 0.7, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.45, 'r': 12}, 'vig': 0.5})
S('rhythm', {
    'lines': [{'t': 'PULSE', 'size': 130}], 'font': 'Monoton', 'weight': 400, 'ls': 0.08,
    'fill': ['#ffffff', '#ffe0ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.6,
    'glow': '#ff3aff', 'ga': 0.8, 'gr': 18, 'glow2': '#3ad8ff', 'ga2': 0.45, 'gr2': 46, 'x': 0.5, 'y': 0.17, 'maxw': 0.56, 'maxh': 0.24,
}, {'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 12}, 'vig': 0.5})
S('checkers', {
    'lines': [{'t': 'CHECKERS', 'size': 110}], 'font': 'Cinzel', 'weight': 900, 'ls': 0.1,
    'fill': ['#ffffff', ['#ffe8e0', 0.5], '#e8a090'], 'sw': 0.02, 'sc': '#1a0402', 'ow': 0.0, 'depth': 0.05, 'dcol': ['#6a0a06', '#140202'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'glow': '#ff3a2a', 'ga': 0.25, 'gr': 26, 'x': 0.5, 'y': 0.13, 'maxw': 0.56, 'maxh': 0.18,
}, {'grade': {'sat': 1.08, 'con': 1.1, 'split': ['#1a2a5a', '#ffcf90', 0.12]}, 'bloom': {'th': 0.7, 'amt': 0.3, 'r': 16}, 'vig': 0.55, 'topgrad': {'h': 0.3, 'amt': 0.45, 'color': '#000000'}})
S('pong', {
    'lines': [{'t': 'PONG', 'size': 130}], 'font': 'Press Start 2P', 'weight': 400, 'ls': 0.1,
    'fill': ['#ffffff', '#ffffff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.6,
    'glow': '#8ad8ff', 'ga': 0.6, 'gr': 18, 'x': 0.5, 'y': 0.85, 'maxw': 0.46, 'maxh': 0.16,
}, {'grade': {'sat': 1.1, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 12}, 'vig': 0.5, 'ca': 0.003})

S('tictactoe', {
    'lines': [{'t': 'TIC-TAC-TOE', 'size': 110}], 'font': 'Fredoka', 'weight': 700, 'ls': 0.02,
    'fill': ['#ffffff', '#f0f4ff'], 'sw': 0.05, 'sc': '#2a0a4a', 'ow': 0.0, 'depth': 0.08, 'dcol': ['#3a1a6a', '#14062a'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.7, 'glow': '#ff3a8a', 'ga': 0.35, 'gr': 22, 'x': 0.5, 'y': 0.86, 'maxw': 0.6, 'maxh': 0.17,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.45})
S('archery', {
    'lines': [{'t': 'ARCHERY', 'size': 120}], 'font': 'Cinzel', 'weight': 900, 'ls': 0.1,
    'fill': ['#ffffff', ['#fff4e0', 0.5], '#e8c890'], 'sw': 0.025, 'sc': '#140a02', 'ow': 0.0, 'depth': 0.06, 'dcol': ['#4a2a0a', '#0a0602'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'x': 0.27, 'y': 0.86, 'maxw': 0.46, 'maxh': 0.17,
}, {'dof': {'z0': 0.12, 'z1': 0.4, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 14}, 'vig': 0.45, 'botgrad': {'h': 0.3, 'amt': 0.5, 'color': '#0a0804'}})
S('sequence', {
    'lines': [{'t': 'SEQUENCE', 'size': 110}], 'font': 'Unbounded', 'weight': 900, 'ls': 0.06,
    'fill': ['#ffffff', '#e8eeff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#2a6aff', 'ga': 0.5, 'gr': 22, 'x': 0.5, 'y': 0.11, 'maxw': 0.52, 'maxh': 0.15,
    'tag': {'t': 'REPEAT THE PATTERN', 'size': 22, 'font': 'Oswald', 'color': '#a8c0ff', 'ls': 0.35},
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.6, 'amt': 0.45, 'r': 14}, 'vig': 0.5})
S('pinball', {
    'lines': [{'t': 'PINBALL', 'size': 120}], 'font': 'Monoton', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffffff', '#fff0ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.6,
    'glow': '#ff3aff', 'ga': 0.8, 'gr': 18, 'glow2': '#ffd21a', 'ga2': 0.35, 'gr2': 46, 'x': 0.5, 'y': 0.15, 'maxw': 0.56, 'maxh': 0.22,
}, {'dof': {'z0': 0.45, 'z1': 0.75, 'r': 4}, 'grade': {'sat': 1.15, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 12}, 'vig': 0.5, 'topgrad': {'h': 0.35, 'amt': 0.5, 'color': '#020108'}})
S('slide', {
    'lines': [{'t': 'SLIDE 15', 'size': 110}], 'font': 'Archivo Black', 'weight': 400, 'ls': 0.04,
    'fill': ['#fff4e0', ['#f2cf90', 0.5], '#d8a050'], 'sw': 0.035, 'sc': '#2a1406', 'ow': 0.0, 'depth': 0.09, 'dcol': ['#5a3010', '#1a0a04'], 'ddir': [0.2, 1],
    'gloss': 0.2, 'glossh': 0.42, 'shadow': 0.8, 'x': 0.76, 'y': 0.2, 'maxw': 0.4, 'maxh': 0.18,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.08}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.45})
S('box-pusher', {
    'lines': [{'t': 'SOKOBAN', 'size': 120}], 'font': 'Bowlby One', 'weight': 400, 'ls': 0.04,
    'fill': ['#fff2c8', ['#ffc860', 0.5], '#e8902a'], 'sw': 0.045, 'sc': '#2a1004', 'ow': 0.03, 'oc': '#ffffff', 'depth': 0.1, 'dcol': ['#6a3410', '#2a1004'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.6, 'x': 0.5, 'y': 0.1, 'maxw': 0.5, 'maxh': 0.16,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.45})

S('number-memory', {
    'lines': [{'t': 'NUMBER', 'size': 110}, {'t': 'MEMORY', 'size': 110}], 'font': 'Orbitron', 'weight': 900, 'ls': 0.1,
    'fill': ['#ffffff', ['#e0f0ff', 0.5], '#8ac8ff'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#3a8aff', 'ga': 0.55, 'gr': 22, 'x': 0.5, 'y': 0.82, 'maxw': 0.46, 'maxh': 0.26, 'lh': 1.0,
}, {'dof': {'z0': 0.45, 'z1': 0.75, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 14}, 'vig': 0.5})
S('reversi', {
    'lines': [{'t': 'REVERSI', 'size': 120}], 'font': 'Playfair Display', 'weight': 900, 'ls': 0.06,
    'fill': ['#ffffff', ['#f0f0f0', 0.5], '#c8c8c8'], 'sw': 0.025, 'sc': '#000000', 'ow': 0.0, 'depth': 0.06, 'dcol': ['#1a1a1a', '#000000'], 'ddir': [0, 1],
    'gloss': 0, 'shadow': 0.85, 'x': 0.24, 'y': 0.85, 'maxw': 0.4, 'maxh': 0.18,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.1, 'con': 1.1}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.55, 'botgrad': {'h': 0.3, 'amt': 0.5, 'color': '#000000'}})
S('pipe-connect', {
    'lines': [{'t': 'PIPE', 'size': 110}, {'t': 'MANIA', 'size': 110}], 'font': 'Bungee', 'weight': 400, 'ls': 0.04,
    'fill': ['#e8f6ff', ['#9ad8ff', 0.5], '#2a9aff'], 'sw': 0.045, 'sc': '#06142a', 'ow': 0.03, 'oc': '#c8ccd4', 'depth': 0.1, 'dcol': ['#1a3a6a', '#05101e'], 'ddir': [0.2, 1], 'dout': '#c8ccd4',
    'gloss': 0.3, 'glossh': 0.42, 'shadow': 0.7, 'x': 0.8, 'y': 0.3, 'maxw': 0.34, 'maxh': 0.34, 'lh': 0.9,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.7, 'amt': 0.35, 'r': 14}, 'vig': 0.45})
S('cps-test', {
    'lines': [{'t': 'CPS', 'size': 130}, {'t': 'TEST', 'size': 90}], 'font': 'Bebas Neue', 'weight': 400, 'ls': 0.1,
    'fill': ['#ffffff', ['#fff6d8', 0.5], '#ffd21a'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'glow': '#ff2a6a', 'ga': 0.5, 'gr': 22, 'x': 0.18, 'y': 0.3, 'maxw': 0.28, 'maxh': 0.4, 'lh': 0.86,
    'tag': {'t': 'CLICKS PER SECOND', 'size': 20, 'font': 'Oswald', 'color': '#ffd8e4', 'ls': 0.3},
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.1}, 'bloom': {'th': 0.55, 'amt': 0.5, 'r': 14}, 'vig': 0.5})
S('chimp-test', {
    'lines': [{'t': 'CHIMP', 'size': 120}, {'t': 'TEST', 'size': 120}], 'font': 'Lilita One', 'weight': 400, 'ls': 0.06,
    'fill': ['#ffffff', ['#eaf4ff', 0.5], '#a8d0ff'], 'sw': 0.05, 'sc': '#0a1840', 'ow': 0.0, 'depth': 0.1, 'dcol': ['#1a3a8a', '#050a2a'], 'ddir': [0, 1],
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.7, 'x': 0.82, 'y': 0.22, 'maxw': 0.3, 'maxh': 0.34, 'lh': 0.88,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.75, 'amt': 0.3, 'r': 14}, 'vig': 0.45})
S('hangman', {
    'lines': [{'t': 'HANGMAN', 'size': 120}], 'font': 'Special Elite' if False else 'Rubik Mono One', 'weight': 400, 'ls': 0.06,
    'fill': ['#f4f0e0', '#d8d0b8'], 'sw': 0.0, 'ow': 0.0, 'depth': 0.0, 'gloss': 0, 'shadow': 0.8,
    'x': 0.7, 'y': 0.18, 'maxw': 0.5, 'maxh': 0.16,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.05, 'con': 1.1}, 'bloom': {'th': 0.8, 'amt': 0.25, 'r': 14}, 'vig': 0.55})
S('true-false', {
    'lines': [{'t': 'TRUE', 'size': 110, 'style': {'fill': ['#d8ffe4', '#2ad86a']}}, {'t': 'or FALSE', 'size': 110, 'style': {'fill': ['#ffe0e4', '#ff2a3a']}}], 'font': 'Titan One', 'weight': 400, 'rot': -3,
    'sw': 0.05, 'sc': '#0a0a14', 'ow': 0.03, 'oc': '#ffffff', 'depth': 0.08, 'dcol': ['#2a2a3a', '#0a0a14'], 'ddir': [0.2, 1], 'dout': '#ffffff',
    'gloss': 0.25, 'glossh': 0.42, 'shadow': 0.6, 'x': 0.5, 'y': 0.85, 'maxw': 0.6, 'maxh': 0.2, 'lh': 0.95,
}, {'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.6, 'amt': 0.45, 'r': 14}, 'vig': 0.5, 'botgrad': {'h': 0.35, 'amt': 0.5, 'color': '#020306'}})
S('maze-tanks', {
    'lines': [{'t': 'TANK', 'size': 110}, {'t': 'TROUBLE', 'size': 110}], 'font': 'Black Ops One', 'weight': 400, 'ls': 0.05,
    'fill': ['#ffffff', ['#f0f0f0', 0.5], '#c8c8c8'], 'sw': 0.04, 'sc': '#14141a', 'ow': 0.03, 'oc': '#e8241c', 'depth': 0.09, 'dcol': ['#3a3a44', '#0a0a10'], 'ddir': [0.2, 1], 'dout': '#e8241c',
    'gloss': 0, 'shadow': 0.5, 'x': 0.5, 'y': 0.15, 'maxw': 0.46, 'maxh': 0.26, 'lh': 0.88,
}, {'dof': {'z0': 0.5, 'z1': 0.8, 'r': 4}, 'grade': {'sat': 1.12, 'con': 1.08}, 'bloom': {'th': 0.85, 'amt': 0.2, 'r': 14}, 'vig': 0.35})
