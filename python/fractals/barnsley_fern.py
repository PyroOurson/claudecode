import argparse

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish

MAPS = np.array([
    [0.00, 0.00, 0.00, 0.16, 0.00, 0.00],
    [0.85, 0.04, -0.04, 0.85, 0.00, 1.60],
    [0.20, -0.26, 0.23, 0.22, 0.00, 1.60],
    [-0.15, 0.28, 0.26, 0.24, 0.00, 0.44],
])
WEIGHTS = [0.01, 0.85, 0.07, 0.07]


def fern(iterations, seed=None):
    rng = np.random.default_rng(seed)
    choices = rng.choice(len(MAPS), size=iterations, p=WEIGHTS)
    points = np.empty((iterations, 2))
    x = y = 0.0
    for i, k in enumerate(choices):
        a, b, c, d, e, f = MAPS[k]
        x, y = a * x + b * y + e, c * x + d * y + f
        points[i] = x, y
    return points


def main():
    parser = argparse.ArgumentParser(description="Draw the Barnsley fern.")
    parser.add_argument("-i", "--iterations", type=int, default=300_000)
    parser.add_argument("--color", default="#2a783f")
    parser.add_argument("--save")
    args = parser.parse_args()

    points = fern(args.iterations)
    fig, ax = plt.subplots(figsize=(6, 10))
    ax.scatter(points[:, 0], points[:, 1], s=0.05, color=args.color, linewidths=0)
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
