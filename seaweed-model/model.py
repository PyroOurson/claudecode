import argparse
import os

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch

from depth import load_depth, synthetic_depth

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
MARSEILLE_SEA_TEMPERATURE = [13.3, 12.8, 13.1, 14.4, 17.3, 20.9, 21.9, 22.5, 21.9, 19.3, 17.4, 15.0]
COLORS = ListedColormap(["lightblue", "green", "red"])


class SeaweedModel:
    def __init__(self, depth, monthly_temperature=MARSEILLE_SEA_TEMPERATURE, max_depth=40.0,
                 min_temperature=15.0, growth_rate=0.2, spread_radius=3, seed=None):
        self.depth = depth
        self.land = depth <= 0
        self.monthly_temperature = monthly_temperature
        self.max_depth = max_depth
        self.min_temperature = min_temperature
        self.growth_rate = growth_rate
        self.rng = np.random.default_rng(seed)
        self.seaweed = np.zeros(depth.shape, dtype=bool)
        self.history = []
        self.depth_factor = self._depth_factor()
        offsets = range(-spread_radius, spread_radius + 1)
        self.kernel = [(dy, dx, 1 - np.hypot(dy, dx) / spread_radius)
                       for dy in offsets for dx in offsets
                       if (dy or dx) and np.hypot(dy, dx) < spread_radius]

    def _depth_factor(self):
        factor = np.clip(1 - self.depth / self.max_depth, 0, 1)
        factor[(self.depth > 10) & (self.depth < 20)] = 1
        factor[self.land | (self.depth > self.max_depth)] = 0
        return factor

    def seed_seaweed(self, positions=None, count=5):
        if positions is None:
            candidates = np.argwhere(self.depth_factor > 0)
            positions = [tuple(p[::-1]) for p in candidates[self.rng.choice(len(candidates), count, replace=False)]]
        for x, y in positions:
            if self.depth_factor[y, x] > 0:
                self.seaweed[y, x] = True
        self.history = [self.seaweed.copy()]

    def growth_probability(self, month):
        temperature = self.monthly_temperature[month]
        if temperature < self.min_temperature:
            return np.zeros_like(self.depth_factor)
        temperature_factor = 1 - self.min_temperature / temperature / 20
        return self.growth_rate * temperature_factor * self.depth_factor

    def step(self, month):
        probability = self.growth_probability(month)
        survive = np.ones(self.seaweed.shape)
        padded = np.pad(self.seaweed, max(abs(dy) for dy, _, _ in self.kernel))
        r = (padded.shape[0] - self.seaweed.shape[0]) // 2
        h, w = self.seaweed.shape
        for dy, dx, weight in self.kernel:
            neighbour = padded[r + dy:r + dy + h, r + dx:r + dx + w]
            survive *= np.where(neighbour, 1 - probability * weight, 1)
        colonised = self.rng.random(self.seaweed.shape) > survive
        self.seaweed |= colonised & ~self.land
        self.history.append(self.seaweed.copy())

    def run(self, years):
        for i in range(years * 12):
            self.step(i % 12)
            print(f"\rYear {i // 12 + 1}/{years} {MONTHS[i % 12]}  coverage {self.seaweed.mean():.1%}", end="")
        print()

    def frame(self, grid):
        image = self.land.astype(int)
        image[~self.land & grid] = 2
        return image

    def show(self, step=-1):
        fig, axes = plt.subplots(1, 2, figsize=(13, 6))
        axes[0].imshow(self.frame(self.history[step]), cmap=COLORS, vmin=0, vmax=2)
        axes[0].set_title("Seaweed distribution")
        axes[0].legend(handles=[Patch(color=c, label=l) for c, l in zip(COLORS.colors, ("Sea", "Land", "Seaweed"))],
                       loc="upper right")
        im = axes[1].imshow(self.depth, cmap="Blues")
        axes[1].set_title("Depth (m)")
        fig.colorbar(im, ax=axes[1])
        fig.tight_layout()
        plt.show()

    def save_animation(self, filename, fps=8):
        from matplotlib.animation import FuncAnimation

        fig, ax = plt.subplots(figsize=(7, 7))
        image = ax.imshow(self.frame(self.history[0]), cmap=COLORS, vmin=0, vmax=2)
        ax.axis("off")

        def update(i):
            image.set_data(self.frame(self.history[i]))
            ax.set_title(f"Year {i // 12 + 1}, {MONTHS[i % 12]}")
            return (image,)

        FuncAnimation(fig, update, frames=len(self.history)).save(filename, writer="pillow", fps=fps)
        plt.close(fig)
        print(f"Saved {filename}")


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description="Simulate the spread of an invasive seaweed.")
    parser.add_argument("--map", default=os.path.join(here, "marseille_depth.tif"),
                        help="GeoTIFF elevation map, or 'synthetic' for an island")
    parser.add_argument("--size", type=int, default=100)
    parser.add_argument("--years", type=int, default=20)
    parser.add_argument("--start", nargs=2, type=int, action="append", metavar=("X", "Y"),
                        help="starting seaweed cell (repeatable); random if omitted")
    parser.add_argument("--max-depth", type=float, default=40)
    parser.add_argument("--seed", type=int)
    parser.add_argument("--gif", help="save an animation to this file")
    parser.add_argument("--no-show", action="store_true")
    args = parser.parse_args()

    shape = (args.size, args.size)
    depth = synthetic_depth(shape) if args.map == "synthetic" else load_depth(args.map, shape)
    model = SeaweedModel(depth, max_depth=args.max_depth, seed=args.seed)
    model.seed_seaweed([tuple(p) for p in args.start] if args.start else None)
    model.run(args.years)
    if args.gif:
        model.save_animation(args.gif)
    if not args.no_show:
        model.show()


if __name__ == "__main__":
    main()
