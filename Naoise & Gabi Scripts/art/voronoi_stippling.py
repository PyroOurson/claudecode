import argparse

import numpy as np
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
from scipy.spatial import cKDTree


def demo_image(size=600):
    y, x = np.mgrid[:size, :size]
    distance = np.hypot(x - size / 2, y - size * 0.43) / (size / 2)
    image = Image.fromarray((np.clip(1 - distance, 0, 1) * 255).astype(np.uint8))
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.load_default(size=size // 4)
    except TypeError:
        font = ImageFont.load_default()
    draw.text((size / 2, size / 2), "HELLO", fill=0, font=font, anchor="mm")
    return image


def load_weights(image, width, contrast):
    image = image.convert("L")
    height = round(width * image.height / image.width)
    pixels = np.asarray(image.resize((width, height)), dtype=float) / 255
    return np.power(1 - pixels, contrast)


def initial_points(weights, n, rng):
    flat = weights.ravel()
    p = flat / flat.sum() if flat.sum() > 0 else None
    index = rng.choice(flat.size, size=n, p=p)
    y, x = np.divmod(index, weights.shape[1])
    return np.column_stack((x, y)).astype(float) + rng.random((n, 2))


def relax(points, pixels, pixel_weights, shape, iteration, rng):
    n = len(points)
    _, owner = cKDTree(points).query(pixels, workers=-1)
    total = np.bincount(owner, pixel_weights, n)
    cx = np.bincount(owner, pixel_weights * pixels[:, 0], n)
    cy = np.bincount(owner, pixel_weights * pixels[:, 1], n)
    empty = total == 0
    targets = np.column_stack((cx, cy)) / np.where(empty, 1, total)[:, None]
    targets[empty] = rng.random((empty.sum(), 2)) * (shape[1], shape[0])
    jitter = (iteration + 1) ** -0.8 * 10
    points += (targets - points) * 1.8 + (rng.random(points.shape) - 0.5) * jitter
    np.clip(points, 0, (shape[1] - 1e-3, shape[0] - 1e-3), out=points)
    return np.sqrt(total / (total.max() or 1))


def main():
    parser = argparse.ArgumentParser(description="Redraw a picture as dots using weighted Voronoi stippling.")
    parser.add_argument("image", nargs="?", help="any picture (a demo image is used if omitted)")
    parser.add_argument("--width", type=int, default=600, help="working width in pixels")
    parser.add_argument("--density", type=float, default=1.0, help="number of dots multiplier")
    parser.add_argument("--contrast", type=float, default=2.5)
    parser.add_argument("--min-size", type=float, default=0.3)
    parser.add_argument("--max-size", type=float, default=4.5)
    parser.add_argument("--iterations", type=int, default=60)
    parser.add_argument("--background", default="white")
    parser.add_argument("--color", default="black")
    parser.add_argument("--save", help="save the final picture instead of only showing it")
    parser.add_argument("--seed", type=int)
    args = parser.parse_args()

    rng = np.random.default_rng(args.seed)
    image = Image.open(args.image) if args.image else demo_image()
    weights = load_weights(image, args.width, args.contrast)
    shape = weights.shape
    n = max(1, round(shape[0] * shape[1] / 40 * args.density))
    ys, xs = np.nonzero(weights > 1e-6)
    pixels = np.column_stack((xs, ys)) + 0.5
    pixel_weights = weights[ys, xs]
    points = initial_points(weights, n, rng)

    fig, ax = plt.subplots(figsize=(8, 8 * shape[0] / shape[1]))
    fig.patch.set_facecolor(args.background)
    fig.subplots_adjust(0, 0, 1, 1)
    ax.set_xlim(0, shape[1])
    ax.set_ylim(shape[0], 0)
    ax.set_aspect("equal")
    ax.axis("off")
    scale = (fig.get_figwidth() * 72 / shape[1]) ** 2
    dots = ax.scatter(points[:, 0], points[:, 1], s=1, color=args.color, linewidths=0)
    live = not args.save

    for i in range(args.iterations):
        strength = relax(points, pixels, pixel_weights, shape, i, rng)
        radius = args.min_size + (args.max_size - args.min_size) * strength
        if live:
            if not plt.fignum_exists(fig.number):
                return
            dots.set_offsets(points)
            dots.set_sizes(np.pi * radius ** 2 * scale)
            ax.set_title(f"{n:,} dots · iteration {i + 1}/{args.iterations}", color="gray", fontsize=9, y=0.98)
            plt.pause(0.001)

    dots.set_offsets(points)
    dots.set_sizes(np.pi * radius ** 2 * scale)
    ax.set_title("")
    if args.save:
        fig.savefig(args.save, dpi=200, facecolor=args.background)
        print(f"Saved {args.save}")
    else:
        plt.show()


if __name__ == "__main__":
    main()
