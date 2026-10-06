import argparse

import numpy as np
import matplotlib.pyplot as plt

from common import finish

SYSTEMS = {
    "lorenz": (lambda p, a, b, c: np.array([a * (p[1] - p[0]), p[0] * (b - p[2]) - p[1], p[0] * p[1] - c * p[2]]), (10, 28, 8 / 3)),
    "rossler": (lambda p, a, b, c: np.array([-p[1] - p[2], p[0] + a * p[1], b + p[2] * (p[0] - c)]), (0.2, 0.2, 5.7)),
}


def integrate(system, params, steps, dt, start):
    f = SYSTEMS[system][0]
    points = np.empty((steps, 3))
    p = np.array(start, float)
    for i in range(steps):
        k1 = f(p, *params)
        k2 = f(p + dt / 2 * k1, *params)
        k3 = f(p + dt / 2 * k2, *params)
        k4 = f(p + dt * k3, *params)
        p = p + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        points[i] = p
    return points


def main():
    parser = argparse.ArgumentParser(description="Lorenz and Rossler strange attractors.")
    parser.add_argument("system", choices=SYSTEMS, nargs="?", default="lorenz")
    parser.add_argument("-a", type=float)
    parser.add_argument("-b", type=float)
    parser.add_argument("-c", type=float)
    parser.add_argument("--steps", type=int, default=20_000)
    parser.add_argument("--dt", type=float, default=0.01)
    parser.add_argument("--trajectories", type=int, default=3)
    parser.add_argument("--spin", action="store_true")
    parser.add_argument("--save")
    args = parser.parse_args()

    defaults = SYSTEMS[args.system][1]
    params = tuple(v if v is not None else d for v, d in zip((args.a, args.b, args.c), defaults))

    fig = plt.figure(figsize=(9, 9))
    ax = fig.add_subplot(projection="3d")
    colors = plt.cm.plasma(np.linspace(0.1, 0.9, args.trajectories))
    for i in range(args.trajectories):
        points = integrate(args.system, params, args.steps, args.dt, (0.01 * (i + 1),) * 3)
        ax.plot(*points.T, linewidth=0.4, color=colors[i])
    ax.set_title(f"{args.system.title()} a={params[0]:g} b={params[1]:g} c={params[2]:g}")
    ax.axis("off")
    if args.spin and not args.save:
        for azimuth in range(0, 720, 2):
            if not plt.fignum_exists(fig.number):
                return
            ax.view_init(20, azimuth)
            plt.pause(0.01)
    finish(fig, args.save)


if __name__ == "__main__":
    main()
