import numpy as np


def load_depth(path, shape=(100, 100)):
    import rasterio
    from rasterio.enums import Resampling

    with rasterio.open(path) as src:
        elevation = src.read(1, out_shape=shape, resampling=Resampling.bilinear).astype(np.float32)
    return np.clip(-elevation, 0, None)


def synthetic_depth(shape=(100, 100), island_fraction=0.2):
    y, x = np.indices(shape)
    distance = np.hypot(x - shape[1] / 2, y - shape[0] / 2)
    island_radius = min(shape) * island_fraction
    return np.clip((distance - island_radius) * 1.5, 0, None)


if __name__ == "__main__":
    import sys
    import matplotlib.pyplot as plt

    depth = load_depth(sys.argv[1] if len(sys.argv) > 1 else "marseille_depth.tif")
    plt.imshow(depth, cmap="Blues")
    plt.colorbar(label="Depth (m)")
    plt.title("Depth below sea level")
    plt.show()
