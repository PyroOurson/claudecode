import numpy as np
import matplotlib.pyplot as plt

SAMPLES = 1024


class FourierDrawing:
    def __init__(self):
        self.fig, self.ax = plt.subplots(figsize=(10, 6))
        self.ax.set_xlim(0, 1)
        self.ax.set_ylim(-1, 1)
        self.xs = np.linspace(0, 1, SAMPLES, endpoint=False)
        self.stroke = []
        self.drawing = False
        self.terms = 5
        self.signal = None
        (self.drawn,) = self.ax.plot([], [], color="black", linewidth=1.5)
        (self.approx,) = self.ax.plot([], [], color="#d62828", linewidth=1.5)
        self.update_title()
        self.fig.canvas.mpl_connect("button_press_event", self.press)
        self.fig.canvas.mpl_connect("motion_notify_event", self.move)
        self.fig.canvas.mpl_connect("button_release_event", self.release)
        self.fig.canvas.mpl_connect("key_press_event", self.key)

    def update_title(self):
        self.ax.set_title(f"Draw a curve left to right  |  up/down: {self.terms} terms  |  c: clear")

    def press(self, event):
        if event.inaxes is self.ax:
            self.drawing = True
            self.stroke = [(event.xdata, event.ydata)]

    def move(self, event):
        if self.drawing and event.inaxes is self.ax:
            self.stroke.append((event.xdata, event.ydata))
            self.drawn.set_data(*zip(*self.stroke))
            self.fig.canvas.draw_idle()

    def release(self, _):
        self.drawing = False
        if len(self.stroke) < 2:
            return
        points = np.array(sorted(self.stroke))
        self.signal = np.interp(self.xs, points[:, 0], points[:, 1])
        self.drawn.set_data(self.xs, self.signal)
        self.refresh()

    def key(self, event):
        if event.key == "up":
            self.terms += 1
        elif event.key == "down":
            self.terms = max(0, self.terms - 1)
        elif event.key == "c":
            self.signal = None
            self.drawn.set_data([], [])
            self.approx.set_data([], [])
        self.refresh()

    def refresh(self):
        self.update_title()
        if self.signal is not None:
            spectrum = np.fft.rfft(self.signal)
            spectrum[self.terms + 1:] = 0
            self.approx.set_data(self.xs, np.fft.irfft(spectrum, SAMPLES))
        self.fig.canvas.draw_idle()


if __name__ == "__main__":
    FourierDrawing()
    plt.show()
