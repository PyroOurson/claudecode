import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider

from chaos_game_polygon import chaos_game, optimal_ratio, regular_polygon


class InteractiveChaosGame:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(9, 9))
        self.fig.subplots_adjust(bottom=0.2)
        self.vertices = regular_polygon(3)
        self.dragging = None
        self.cloud = self.ax.scatter([], [], s=0.2, color="#3b5fc0", linewidths=0)
        (self.handles,) = self.ax.plot([], [], "o", color="#c0392b", markersize=9)
        self.ax.set_xlim(-1.3, 1.3)
        self.ax.set_ylim(-1.3, 1.3)
        self.ax.set_aspect("equal")
        self.ax.set_title("Drag the red points")
        self.sides = Slider(self.fig.add_axes((0.2, 0.1, 0.6, 0.03)), "Points", 3, 10, valinit=3, valstep=1)
        self.ratio = Slider(self.fig.add_axes((0.2, 0.06, 0.6, 0.03)), "Ratio", 0.1, 0.9, valinit=0.5)
        self.iterations = Slider(self.fig.add_axes((0.2, 0.02, 0.6, 0.03)), "Iterations", 1000, 100_000, valinit=30_000, valstep=1000)
        self.sides.on_changed(self.change_sides)
        self.ratio.on_changed(lambda _: self.redraw())
        self.iterations.on_changed(lambda _: self.redraw())
        self.fig.canvas.mpl_connect("button_press_event", self.press)
        self.fig.canvas.mpl_connect("motion_notify_event", self.move)
        self.fig.canvas.mpl_connect("button_release_event", lambda _: setattr(self, "dragging", None))
        self.redraw()

    def change_sides(self, value):
        self.vertices = regular_polygon(int(value))
        self.ratio.set_val(optimal_ratio(int(value)))

    def press(self, event):
        if event.inaxes is not self.ax:
            return
        distances = np.hypot(*(self.vertices - (event.xdata, event.ydata)).T)
        if distances.min() < 0.08:
            self.dragging = int(distances.argmin())

    def move(self, event):
        if self.dragging is None or event.inaxes is not self.ax:
            return
        self.vertices[self.dragging] = (event.xdata, event.ydata)
        self.redraw()

    def redraw(self):
        points = chaos_game(self.vertices, int(self.iterations.val), self.ratio.val, seed=0)
        self.cloud.set_offsets(points[20:])
        self.handles.set_data(self.vertices[:, 0], self.vertices[:, 1])
        self.fig.canvas.draw_idle()


if __name__ == "__main__":
    InteractiveChaosGame()
    plt.show()
