import matplotlib.pyplot as plt


def finish(fig, save=None):
    if save:
        fig.savefig(save, dpi=200, bbox_inches="tight", facecolor="white")
        print(f"Saved {save}")
    else:
        plt.show()
