import argparse
import cmath
import random

import matplotlib.pyplot as plt
from matplotlib.collections import PatchCollection
from matplotlib.patches import Circle

from plot_output import finish


def tangent_circles(c1, c2, c3):
    (k1, z1), (k2, z2), (k3, z3) = c1, c2, c3
    root = cmath.sqrt(k1 * k2 + k2 * k3 + k3 * k1).real
    results = []
    for k in (k1 + k2 + k3 + 2 * root, k1 + k2 + k3 - 2 * root):
        if abs(k) < 1e-12:
            continue
        zroot = cmath.sqrt(k1 * z1 * k2 * z2 + k2 * z2 * k3 * z3 + k3 * z3 * k1 * z1)
        for sign in (1, -1):
            results.append((k, (k1 * z1 + k2 * z2 + k3 * z3 + sign * 2 * zroot) / k))
    return results


def is_tangent(a, b, tolerance=1e-6):
    (ka, za), (kb, zb) = a, b
    distance = abs(za - zb)
    ra, rb = 1 / ka, 1 / kb
    return abs(distance - abs(ra + rb)) < tolerance or abs(distance - abs(ra - rb)) < tolerance


def gasket(outer_radius=1.0, split=None, min_radius=0.002):
    split = split if split is not None else random.uniform(0.2, 0.8)
    r1 = outer_radius * split
    r2 = outer_radius - r1
    outer = (-1 / outer_radius, 0j)
    a = (1 / r1, complex(-outer_radius + r1, 0))
    b = (1 / r2, complex(outer_radius - r2, 0))
    circles = [outer, a, b]
    seen = {(round(c[0], 6), round(c[1].real, 6), round(c[1].imag, 6)) for c in circles}
    queue = [(outer, a, b)]
    while queue:
        c1, c2, c3 = queue.pop()
        for new in tangent_circles(c1, c2, c3):
            radius = 1 / new[0]
            if radius < min_radius or radius <= 0:
                continue
            key = (round(new[0], 6), round(new[1].real, 6), round(new[1].imag, 6))
            if key in seen or not all(is_tangent(new, c) for c in (c1, c2, c3)):
                continue
            if abs(new[1]) + radius > outer_radius + 1e-9:
                continue
            seen.add(key)
            circles.append(new)
            queue.extend(((c1, c2, new), (c1, c3, new), (c2, c3, new)))
    return circles


def main():
    parser = argparse.ArgumentParser(description="Draw an Apollonian gasket.")
    parser.add_argument("--split", type=float, help="size of the first inner circle, 0-1 (random if omitted)")
    parser.add_argument("--min-radius", type=float, default=0.003)
    parser.add_argument("--save")
    args = parser.parse_args()

    circles = gasket(split=args.split, min_radius=args.min_radius)
    print(f"{len(circles)} circles")
    patches = [Circle((z.real, z.imag), abs(1 / k)) for k, z in circles]
    fig, ax = plt.subplots(figsize=(9, 9))
    ax.add_collection(PatchCollection(patches, facecolor="none", edgecolor="black", linewidth=0.4))
    ax.set_xlim(-1.02, 1.02)
    ax.set_ylim(-1.02, 1.02)
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
