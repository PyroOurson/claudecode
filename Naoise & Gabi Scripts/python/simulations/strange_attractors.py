import argparse
import functools

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish

def lorenz(x, y, z, a, b, c):
    return a * (y - x), x * (b - z) - y, x * y - c * z


def rossler(x, y, z, a, b, c):
    return -y - z, x + a * y, b + z * (x - c)


SYSTEMS = {"lorenz": (lorenz, (10, 28, 8 / 3)), "rossler": (rossler, (0.2, 0.2, 5.7))}

try:
    from numba import njit
    SYSTEMS = {name: (njit(f), d) for name, (f, d) in SYSTEMS.items()}
except ImportError:
    def njit(**_):
        return lambda f: f


@functools.cache
def make_integrator(f):
    @njit()
    def integrate(params, steps, dt, x, y, z):
        a, b, c = params
        out = np.empty((steps, 3))
        h = dt / 2
        for i in range(steps):
            k1 = f(x, y, z, a, b, c)
            k2 = f(x + h * k1[0], y + h * k1[1], z + h * k1[2], a, b, c)
            k3 = f(x + h * k2[0], y + h * k2[1], z + h * k2[2], a, b, c)
            k4 = f(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2], a, b, c)
            x += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
            y += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
            z += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
            out[i, 0] = x
            out[i, 1] = y
            out[i, 2] = z
        return out
    return integrate


def integrate(system, params, steps, dt, start):
    return make_integrator(SYSTEMS[system][0])(tuple(map(float, params)), steps, dt, *map(float, start))


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
