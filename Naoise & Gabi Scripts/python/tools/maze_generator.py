import argparse
import random

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish


def generate(width, height, seed=None):
    rng = random.Random(seed)
    grid = np.zeros((2 * height + 1, 2 * width + 1), dtype=np.uint8)
    stack = [(0, 0)]
    grid[1, 1] = 1
    while stack:
        x, y = stack[-1]
        options = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                   if 0 <= x + dx < width and 0 <= y + dy < height and not grid[2 * (y + dy) + 1, 2 * (x + dx) + 1]]
        if not options:
            stack.pop()
            continue
        nx, ny = rng.choice(options)
        grid[y + ny + 1, x + nx + 1] = 1
        grid[2 * ny + 1, 2 * nx + 1] = 1
        stack.append((nx, ny))
    grid[1, 0] = grid[-2, -1] = 1
    return grid


def main():
    parser = argparse.ArgumentParser(description="Generate a perfect maze with depth-first search.")
    parser.add_argument("-W", "--width", type=int, default=30)
    parser.add_argument("-H", "--height", type=int, default=30)
    parser.add_argument("--seed", type=int)
    parser.add_argument("--save")
    args = parser.parse_args()

    grid = generate(args.width, args.height, args.seed)
    fig, ax = plt.subplots(figsize=(8, 8 * args.height / args.width))
    ax.imshow(grid, cmap="gray", interpolation="nearest")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
