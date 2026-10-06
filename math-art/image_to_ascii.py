import argparse

import numpy as np
from PIL import Image

RAMP = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "


def to_ascii(path, width, invert=False):
    image = Image.open(path).convert("L")
    height = max(1, round(image.height / image.width * width * 0.5))
    pixels = np.asarray(image.resize((width, height)), dtype=float) / 255
    if invert:
        pixels = 1 - pixels
    indices = (pixels * (len(RAMP) - 1)).round().astype(int)
    return "\n".join("".join(RAMP[i] for i in row) for row in indices)


def main():
    parser = argparse.ArgumentParser(description="Turn any image into ASCII art.")
    parser.add_argument("image")
    parser.add_argument("-w", "--width", type=int, default=100)
    parser.add_argument("--invert", action="store_true", help="use on dark terminals")
    parser.add_argument("-o", "--output")
    args = parser.parse_args()

    art = to_ascii(args.image, args.width, args.invert)
    if args.output:
        with open(args.output, "w") as f:
            f.write(art + "\n")
        print(f"Saved {args.output}")
    else:
        print(art)


if __name__ == "__main__":
    main()
