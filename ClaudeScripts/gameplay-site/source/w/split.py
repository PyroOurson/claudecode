import re, os, json, sys
T2I = {'Blockcraft': 'blockcraft-3d', 'Geometry Rush': 'dash-cube', 'Rail Rush': 'sky-runner', 'Road Hopper': 'road-hopper', 'Slither': 'slither', 'Flap Bird': 'flap-bird', 'Brick Bros': 'brick-bros', 'Rocket Soccer': 'rocket-soccer', 'Slope': 'slope-3d', 'Tunnel Run': 'tunnel-run', 'Fling Birds': 'fling-birds', 'Bomb Blast': 'bomb-blast', 'Fire & Water': 'fire-water', 'Paper Land': 'paper-land', 'Cell Feast': 'cell-feast', 'Hole City': 'hole-city', 'Garden Defense': 'garden-defense', 'Night Survivors': 'night-survivors', 'Demon Halls': 'demon-halls', 'Bean Royale': 'bean-royale', 'Hoop Flop': 'hoop-flop', 'Maze Tanks': 'maze-tanks', 'Last Card': 'last-card', 'Candy Rope': 'candy-rope', 'Moto Stunts': 'moto-stunts', 'Cookie Baker': 'cookie-baker', 'Block Roll': 'block-roll', 'Marble Chain': 'marble-chain', 'Sea Battle': 'sea-battle', 'Snake': 'snake', 'Highway 3D': 'highway-3d', 'Lane Racer': 'racer', 'Tetra Blocks': 'tetra', '2048': '2048', 'Starfighter': 'shooter', 'Hill Climb': 'hill-climb', '8-Ball Pool': 'pool', 'Helix Drop': 'helix-3d', 'Dino Run': 'dino-run', 'Reaction': 'reaction', 'Chess': 'chess', 'Minesweeper': 'minesweeper', 'Hoops 3D': 'hoops-3d', 'Atelier': 'clicker', 'Fruit Slice': 'fruit-slice', 'Five Letters': 'word-guess', 'Sky Pilot': 'sky-pilot', 'Mini Golf': 'golf', 'Tank Arena': 'tanks-3d', 'Bubble Pop': 'bubble-pop', 'Pairs': 'pairs', 'Target Range': 'target-range-3d', 'Breakout': 'breakout', 'Asteroids': 'asteroids', 'Penalty Kick': 'penalty-3d', 'Stack': 'stack', 'Sudoku': 'sudoku', 'Marble Roll': 'marble-3d', 'Trivia': 'trivia', 'Invaders': 'invaders', 'Strike 3D': 'bowling-3d', 'Kart Circuit': 'kart-circuit', 'Aim Trainer': 'aim', 'Maze Escape 3D': 'maze-3d', 'Connect Four': 'connect-four', 'Gem Swap': 'gem-swap', 'Asteroid Field': 'asteroids-3d', 'Glide': 'glide', 'Jetpack Rush': 'jetpack', "Rubik's Cube": 'cube-3d', 'Solitaire': 'solitaire', 'Perfect Stop': 'perfect-stop', 'Piano Tiles': 'piano-tiles', 'Math Sprint': 'math-sprint', 'Tower Defense': 'tower-defense', 'Whack-a-Mole': 'whack', 'Air Hockey': 'air-hockey', 'Typing Test': 'typing', 'Maze Muncher': 'maze-muncher', 'Pulse': 'rhythm', 'Checkers': 'checkers', 'Pong': 'pong', 'Sky Jump': 'sky-jump', 'Tic-Tac-Toe': 'tictactoe', 'Archery': 'archery', 'Sequence': 'sequence', 'Pinball': 'pinball', 'Slide 15': 'slide', 'Box Pusher': 'box-pusher', 'Number Memory': 'number-memory', 'Reversi': 'reversi', 'Lights Out': 'lights-out', 'Pipe Connect': 'pipe-connect', 'Knife Throw': 'knife-throw', 'Stick Bridge': 'stick-bridge', 'CPS Test': 'cps-test', 'Chimp Test': 'chimp-test', 'Hangman': 'hangman', 'True or False': 'true-false', 'Deep Miner': 'deep-miner'}
src = open(sys.argv[1], encoding='utf-8', newline='').read()
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
parts = re.split(r'(<script>\n|</script>\n?)', src)
pieces = []
i = 0
pre = parts[0]
pieces.append(('pre', pre))
k = 1
n = 0
while k < len(parts):
    tok = parts[k]
    body = parts[k + 1]
    if tok == '<script>\n':
        pieces.append(('script', body))
    else:
        pieces.append(('gap', tok + body))
    k += 2
names = []
for idx, (kind, body) in enumerate(pieces):
    if kind == 'script':
        ids = []
        for m in re.finditer(r"Ameplay\.register\(\{", body):
            seg = body[m.end():m.end() + 900]
            mi = re.search(r"\bid:\s*'([^']+)'", seg)
            mt = re.search(r"\btitle:\s*'([^']+)'", seg)
            if mi: ids.append(mi.group(1))
            elif mt: ids.append(T2I.get(mt.group(1), mt.group(1)))
        covers = re.findall(r"S\['([^']+)'\]\s*=", body)
        if not ids and 'Prime Tunnel' in body: ids = ['tunnel-run']
        if idx == 1:
            nm = 'portal'
        elif ids:
            nm = 'g_' + '+'.join(ids)
        elif covers:
            nm = 'covers_' + covers[0]
        else:
            nm = 'script_%03d' % idx
    else:
        nm = '%s_%03d' % (kind, idx)
    names.append((kind, nm))
    open(os.path.join(out, '%03d_%s.%s' % (idx, nm, 'js' if kind == 'script' else 'html')), 'w', encoding='utf-8', newline='').write(body)
json.dump(names, open(os.path.join(out, '_order.json'), 'w'))
print(len(pieces))
