import argparse
import itertools

import numpy as np
import matplotlib.pyplot as plt

from chaos_game_polygon import chaos_game
from plot_output import finish

SHAPES = {
    "tetrahedron": (np.array([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], float), 0.5),
    "menger": (np.array([p for p in itertools.product((-1, 0, 1), repeat=3) if sum(c == 0 for c in p) <= 1], float), 2 / 3),
    "octahedron": (np.array([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], float), 2 / 3),
}


def main():
    parser = argparse.ArgumentParser(description="3D chaos game (Sierpinski tetrahedron, Menger sponge...).")
    parser.add_argument("shape", choices=SHAPES, nargs="?", default="menger")
    parser.add_argument("-i", "--iterations", type=int, default=100_000)
    parser.add_argument("-r", "--ratio", type=float)
    parser.add_argument("--spin", action="store_true", help="rotate the view after drawing")
    parser.add_argument("--save")
    args = parser.parse_args()

    vertices, ratio = SHAPES[args.shape]
    points = chaos_game(vertices, args.iterations, args.ratio or ratio)

    fig = plt.figure(figsize=(8, 8))
    ax = fig.add_subplot(projection="3d")
    ax.scatter(*points[20:].T, s=0.1, c=points[20:, 2], cmap="viridis", linewidths=0)
    ax.set_box_aspect((1, 1, 1))
    ax.axis("off")
    if args.spin and not args.save:
        for azimuth in range(0, 360, 2):
            if not plt.fignum_exists(fig.number):
                return
            ax.view_init(30, azimuth)
            plt.pause(0.01)
    finish(fig, args.save)


if __name__ == "__main__":
    main()
