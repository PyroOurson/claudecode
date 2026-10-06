import argparse
import random

import matplotlib.pyplot as plt

from plot_output import finish

DIRECTIONS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def walk(size, max_steps, seed=None):
    rng = random.Random(seed)
    x = y = size // 2
    path = [(x, y)]
    visited = {(x, y)}
    for _ in range(max_steps):
        options = [(x + dx, y + dy) for dx, dy in DIRECTIONS
                   if 0 <= x + dx <= size and 0 <= y + dy <= size and (x + dx, y + dy) not in visited]
        if not options:
            break
        x, y = rng.choice(options)
        path.append((x, y))
        visited.add((x, y))
    return path


def main():
    parser = argparse.ArgumentParser(description="Random self-avoiding walks on a square grid.")
    parser.add_argument("--size", type=int, default=50)
    parser.add_argument("--steps", type=int, default=5000)
    parser.add_argument("--walks", type=int, default=1, help="number of walks to overlay")
    parser.add_argument("--save")
    args = parser.parse_args()

    fig, ax = plt.subplots(figsize=(8, 8))
    lengths = []
    for i in range(args.walks):
        path = walk(args.size, args.steps)
        lengths.append(len(path) - 1)
        xs, ys = zip(*path)
        ax.plot(xs, ys, linewidth=1 if args.walks == 1 else 0.5, alpha=1 if args.walks == 1 else 0.5)
    print(f"Average length before getting stuck: {sum(lengths) / len(lengths):.1f} steps")
    ax.set_title("Self-avoiding walk")
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
