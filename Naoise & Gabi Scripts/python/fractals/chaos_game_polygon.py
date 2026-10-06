import argparse
import math

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish


def optimal_ratio(sides):
    total = sum(math.cos(2 * math.pi * k / sides) for k in range(1, sides // 4 + 1))
    return (1 + 2 * total) / (2 + 2 * total)


def regular_polygon(sides, radius=1.0):
    angles = np.pi / 2 + 2 * np.pi * np.arange(sides) / sides
    return np.column_stack((radius * np.cos(angles), radius * np.sin(angles)))


def vertex_sequence(rng, n, iterations, rule, jump):
    if rule == "none":
        return rng.integers(n, size=iterations)
    if rule == "no-repeat":
        steps = rng.integers(1, n, size=iterations)
    elif rule == "avoid-jump":
        banned = {jump % n, -jump % n}
        allowed = np.array([k for k in range(n) if k not in banned] or list(range(n)))
        steps = rng.choice(allowed, size=iterations)
    elif rule == "only-jump":
        steps = jump * rng.choice((-1, 1), size=iterations)
    else:
        raise ValueError(rule)
    return np.cumsum(steps) % n


def chaos_game(vertices, iterations, ratio, rule="none", jump=1, seed=None):
    rng = np.random.default_rng(seed)
    targets = vertices[vertex_sequence(rng, len(vertices), iterations, rule, jump)]
    keep = 1 - ratio
    start = vertices.mean(axis=0)
    if not 0 < abs(keep) < 1:
        points = np.empty_like(targets)
        point = start
        for i, target in enumerate(targets):
            point = point + (target - point) * ratio
            points[i] = point
        return points
    terms = min(iterations, int(np.ceil(np.log(1e-12) / np.log(abs(keep)))) + 1)
    points = np.zeros_like(targets)
    weight = ratio
    for j in range(terms):
        points[j:] += weight * targets[:iterations - j]
        weight *= keep
    points += np.power(keep, np.arange(1, iterations + 1))[:, None] * start
    return points


def main():
    parser = argparse.ArgumentParser(description="Draw fractals with the chaos game.")
    parser.add_argument("-n", "--sides", type=int, default=3)
    parser.add_argument("-i", "--iterations", type=int, default=200_000)
    parser.add_argument("-r", "--ratio", type=float, help="jump fraction towards the vertex (default: optimal for the polygon)")
    parser.add_argument("--rule", choices=["none", "no-repeat", "avoid-jump", "only-jump"], default="none")
    parser.add_argument("--jump", type=int, default=1)
    parser.add_argument("--points", type=str, help="custom vertices as 'x1,y1;x2,y2;...'")
    parser.add_argument("--color", default="#c3a85c")
    parser.add_argument("--seed", type=int)
    parser.add_argument("--save")
    args = parser.parse_args()

    if args.points:
        vertices = np.array([[float(v) for v in p.split(",")] for p in args.points.split(";")])
    else:
        vertices = regular_polygon(args.sides)
    ratio = args.ratio if args.ratio is not None else optimal_ratio(len(vertices))
    points = chaos_game(vertices, args.iterations, ratio, args.rule, args.jump, args.seed)

    dimension = math.log(len(vertices)) / math.log(1 / (1 - ratio)) if 0 < ratio < 1 else float("nan")
    print(f"Jump ratio {ratio:.4f}, similarity dimension {dimension:.4f}")

    fig, ax = plt.subplots(figsize=(8, 8))
    ax.scatter(points[20:, 0], points[20:, 1], s=0.05, color=args.color, linewidths=0)
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
