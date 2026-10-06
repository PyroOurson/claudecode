import argparse

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection

from plot_output import finish


def tree(depth, left, right, scale):
    lines, widths = [], []
    stack = [(0.0, 0.0, 90.0, 1.0, depth)]
    while stack:
        x, y, heading, length, level = stack.pop()
        if level == 0:
            continue
        nx = x + length * np.cos(np.radians(heading))
        ny = y + length * np.sin(np.radians(heading))
        lines.append(((x, y), (nx, ny)))
        widths.append(level * 0.4)
        stack.append((nx, ny, heading + left, length * scale, level - 1))
        stack.append((nx, ny, heading - right, length * scale, level - 1))
    return lines, widths


def main():
    parser = argparse.ArgumentParser(description="Draw a recursive binary tree.")
    parser.add_argument("-l", "--left", type=float, default=25)
    parser.add_argument("-r", "--right", type=float, default=25)
    parser.add_argument("-d", "--depth", type=int, default=12)
    parser.add_argument("-s", "--scale", type=float, default=2 / 3)
    parser.add_argument("--save")
    args = parser.parse_args()

    lines, widths = tree(args.depth, args.left, args.right, args.scale)
    fig, ax = plt.subplots(figsize=(8, 8))
    ax.add_collection(LineCollection(lines, linewidths=widths, colors="#5b3a29"))
    ax.autoscale()
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
