import argparse
import json

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection

from common import finish

PRESETS = {
    "koch": ("F", {"F": "F+F--F+F"}, 60),
    "koch-square": ("F", {"F": "F+F-F-F+F"}, 90),
    "snowflake": ("F--F--F", {"F": "F+F--F+F"}, 60),
    "dragon": ("FX", {"X": "X+YF+", "Y": "-FX-Y"}, 90),
    "twindragon": ("FX+FX+", {"X": "X+YF", "Y": "FX-Y"}, 90),
    "terdragon": ("F", {"F": "F+F-F"}, 120),
    "plant": ("X", {"X": "F+[[X]-X]-F[-FX]+X", "F": "FF"}, 25),
    "hilbert": ("A", {"A": "-BF+AFA+FB-", "B": "+AF-BFB-FA+"}, 90),
    "sierpinski": ("F-G-G", {"F": "F-G+F+G-F", "G": "GG"}, 120),
    "gosper": ("A", {"A": "A-B--B+A++AA+B-", "B": "+A-BB--B-A++A+B"}, 60),
}

DRAW = set("FGAB")


def expand(axiom, rules, iterations):
    for _ in range(iterations):
        axiom = "".join(rules.get(c, c) for c in axiom)
    return axiom


def segments(sentence, angle, draw_symbols=DRAW):
    turn = np.radians(angle)
    x = y = 0.0
    heading = np.pi / 2
    stack, lines = [], []
    for c in sentence:
        if c in draw_symbols:
            nx, ny = x + np.cos(heading), y + np.sin(heading)
            lines.append(((x, y), (nx, ny)))
            x, y = nx, ny
        elif c == "+":
            heading += turn
        elif c == "-":
            heading -= turn
        elif c == "[":
            stack.append((x, y, heading))
        elif c == "]":
            x, y, heading = stack.pop()
    return np.array(lines)


def main():
    parser = argparse.ArgumentParser(description="Draw L-system fractals.")
    parser.add_argument("preset", nargs="?", choices=PRESETS, default="dragon")
    parser.add_argument("-i", "--iterations", type=int, default=10)
    parser.add_argument("-a", "--angle", type=float)
    parser.add_argument("--axiom")
    parser.add_argument("--rules", help='JSON, e.g. \'{"F": "F+F-F"}\'')
    parser.add_argument("--draw", default="FGAB", help="symbols that draw a line")
    parser.add_argument("--save")
    args = parser.parse_args()

    axiom, rules, angle = PRESETS[args.preset]
    axiom = args.axiom or axiom
    rules = json.loads(args.rules) if args.rules else rules
    angle = args.angle if args.angle is not None else angle

    sentence = expand(axiom, rules, args.iterations)
    if len(sentence) > 20_000_000:
        raise SystemExit("Too many iterations, the string would be enormous.")
    lines = segments(sentence, angle, set(args.draw))

    fig, ax = plt.subplots(figsize=(10, 10))
    ax.add_collection(LineCollection(lines, colors="black", linewidths=0.6))
    ax.autoscale()
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
