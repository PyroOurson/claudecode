import argparse

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish


def run(rule, width, steps, random_start=False, seed=None):
    table = np.array([(rule >> i) & 1 for i in range(8)], dtype=np.uint8)
    rng = np.random.default_rng(seed)
    row = rng.integers(0, 2, width, dtype=np.uint8) if random_start else np.zeros(width, dtype=np.uint8)
    if not random_start:
        row[width // 2] = 1
    grid = np.empty((steps, width), dtype=np.uint8)
    for t in range(steps):
        grid[t] = row
        row = table[(np.roll(row, 1) << 2) | (row << 1) | np.roll(row, -1)]
    return grid


def main():
    parser = argparse.ArgumentParser(description="Wolfram elementary cellular automata.")
    parser.add_argument("rule", type=int, nargs="?", default=30)
    parser.add_argument("-w", "--width", type=int, default=401)
    parser.add_argument("-s", "--steps", type=int, default=200)
    parser.add_argument("--random", action="store_true", help="start from a random row")
    parser.add_argument("--save")
    args = parser.parse_args()
    if not 0 <= args.rule <= 255:
        raise SystemExit("Rule must be between 0 and 255.")

    grid = run(args.rule, args.width, args.steps, args.random)
    fig, ax = plt.subplots(figsize=(10, 10 * args.steps / args.width))
    ax.imshow(grid, cmap="binary", interpolation="nearest")
    ax.set_title(f"Rule {args.rule}")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
