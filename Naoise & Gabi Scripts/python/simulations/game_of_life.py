import argparse

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation


def step(grid):
    neighbours = sum(np.roll(np.roll(grid, dy, 0), dx, 1) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    return ((neighbours == 3) | (grid & (neighbours == 2))).astype(np.uint8)


def from_text(path):
    with open(path) as f:
        rows = [line.rstrip("\n") for line in f if line.strip()]
    width = max(map(len, rows))
    return np.array([[1 if c == "1" else 0 for c in row.ljust(width, "0")] for row in rows], dtype=np.uint8)


def from_image(path, size, threshold):
    from PIL import Image
    image = Image.open(path).convert("L")
    image.thumbnail((size, size))
    return (np.asarray(image) < threshold).astype(np.uint8)


def main():
    parser = argparse.ArgumentParser(description="Conway's Game of Life.")
    parser.add_argument("--size", type=int, default=200, help="grid size for random starts / max size for images")
    parser.add_argument("--density", type=float, default=0.2)
    parser.add_argument("--file", help="text file of 0s and 1s")
    parser.add_argument("--image", help="any picture; dark pixels become live cells")
    parser.add_argument("--threshold", type=int, default=128)
    parser.add_argument("--interval", type=int, default=50, help="ms between frames")
    parser.add_argument("--save", help="save an animation (.gif)")
    parser.add_argument("--frames", type=int, default=200)
    args = parser.parse_args()

    if args.file:
        grid = from_text(args.file)
    elif args.image:
        grid = from_image(args.image, args.size, args.threshold)
    else:
        grid = (np.random.random((args.size, args.size)) < args.density).astype(np.uint8)

    fig, ax = plt.subplots(figsize=(8, 8))
    image = ax.imshow(grid, cmap="binary", interpolation="nearest")
    ax.axis("off")
    state = {"grid": grid}

    def update(_):
        state["grid"] = step(state["grid"])
        image.set_data(state["grid"])
        return (image,)

    anim = animation.FuncAnimation(fig, update, frames=args.frames if args.save else None,
                                   interval=args.interval, blit=True, cache_frame_data=False)
    if args.save:
        anim.save(args.save, writer="pillow", fps=1000 // args.interval)
        print(f"Saved {args.save}")
    else:
        plt.show()


if __name__ == "__main__":
    main()
