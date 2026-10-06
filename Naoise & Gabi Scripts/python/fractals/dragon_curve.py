import argparse

import numpy as np
import matplotlib.pyplot as plt

from plot_output import finish


def dragon(iterations, angle_degrees):
    theta = np.radians(angle_degrees)
    rotation = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
    points = np.array([[0.0, 0.0], [1.0, 0.0]])
    for _ in range(iterations):
        pivot = points[-1]
        unfolded = (points[-2::-1] - pivot) @ rotation.T + pivot
        points = np.vstack((points, unfolded))
    return points


def main():
    parser = argparse.ArgumentParser(description="Paper-folding dragon curve with any fold angle.")
    parser.add_argument("-i", "--iterations", type=int, default=16)
    parser.add_argument("-a", "--angle", type=float, default=90)
    parser.add_argument("--save")
    args = parser.parse_args()

    points = dragon(args.iterations, args.angle)
    fig, ax = plt.subplots(figsize=(10, 10))
    ax.plot(points[:, 0], points[:, 1], linewidth=0.3, color="#7b2cbf")
    ax.set_aspect("equal")
    ax.axis("off")
    finish(fig, args.save)


if __name__ == "__main__":
    main()
