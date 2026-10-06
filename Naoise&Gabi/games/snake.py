import math
import os
import random
import sys
from array import array
from collections import deque

import pygame

GRID_W = 20
GRID_H = 20
START_FULLSCREEN = True
WINDOW_CELL = 30
FPS = 60

START_STEP_MS = 140
SPEEDUP_MS = 10
SPEEDUP_EVERY = 5
MIN_STEP_MS = 60

BONUS_CHANCE = 0.25
GOLD_POINTS = 5
GOLD_TIME = 6.0
GEM_TIME = 8.0
SLOWMO_TIME = 5.0
SLOWMO_FACTOR = 1.6

PARTICLES = 1.0
AMBIENT_MOTES = 80
SOUND_ON = True
SHOW_DEMO = True

BG_TOP = (14, 16, 34)
BG_BOTTOM = (34, 14, 44)
ORB_COLORS = [(60, 30, 110), (20, 80, 90), (30, 40, 120), (80, 30, 70),
              (20, 60, 110), (70, 20, 90)]
TILE_A = (26, 32, 54)
TILE_B = (30, 37, 61)
BOARD_EDGE = (90, 220, 170)
SHADOW = (13, 16, 30)
SLAB = (7, 8, 18)
SNAKE_HEAD = (140, 245, 150)
SNAKE_TAIL = (30, 150, 120)
SNAKE_OUTLINE = (8, 44, 36)
EYE_WHITE = (250, 250, 250)
EYE_PUPIL = (15, 15, 25)
TONGUE = (235, 70, 100)
APPLE = (235, 60, 70)
GOLD = (255, 200, 60)
GEM = (90, 210, 255)
LEAF = (80, 200, 95)
TEXT = (238, 240, 250)
TEXT_DIM = (150, 156, 185)
ACCENT = (120, 240, 170)
DANGER = (255, 85, 95)
PANEL = (16, 20, 38)
CONFETTI = [APPLE, GOLD, GEM, ACCENT, (200, 120, 255), (255, 150, 200)]
MOTE_COLORS = [(50, 115, 95), (50, 80, 150), (105, 60, 135)]

CELL = WINDOW_CELL
U = 1.0
WIDTH = HEIGHT = 0
MARGIN = HUD_H = 0
BOARD_X = BOARD_Y = BOARD_W = BOARD_H = 0
HIGHSCORE_FILE = os.path.join(os.path.expanduser("~"), ".snake_highscore.txt")
OLD_HIGHSCORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "snake_highscore.txt")

WHITE, BLACK = (255, 255, 255), (0, 0, 0)
UP, DOWN, LEFT, RIGHT = (0, -1), (0, 1), (-1, 0), (1, 0)
DIRS = (UP, DOWN, LEFT, RIGHT)
KEY_TO_DIR = {
    pygame.K_UP: UP, pygame.K_w: UP, pygame.K_z: UP,
    pygame.K_DOWN: DOWN, pygame.K_s: DOWN,
    pygame.K_LEFT: LEFT, pygame.K_a: LEFT, pygame.K_q: LEFT,
    pygame.K_RIGHT: RIGHT, pygame.K_d: RIGHT,
}
DOT, SPARK, CONF = 0, 1, 2
FOCUS_LOST = getattr(pygame, "WINDOWFOCUSLOST", -1)
MAX_PARTS = 1800


def ui(x):
    return int(round(x * U))


def setup_layout(w, h, cell):
    global CELL, U, WIDTH, HEIGHT, MARGIN, HUD_H, BOARD_X, BOARD_Y, BOARD_W, BOARD_H
    CELL, U = cell, cell / 30.0
    WIDTH, HEIGHT = w, h
    MARGIN, HUD_H = ui(20), ui(76)
    BOARD_W, BOARD_H = GRID_W * CELL, GRID_H * CELL
    BOARD_X = (w - BOARD_W) // 2
    BOARD_Y = (h - (HUD_H + BOARD_H + MARGIN)) // 2 + HUD_H


def fit_cell(w, h):
    return max(10, min((w - 40) // GRID_W, int(h / (GRID_H + 3.3))))


def window_size(cell):
    k = cell / 30.0
    m, hud = int(round(20 * k)), int(round(76 * k))
    return GRID_W * cell + 2 * m, hud + GRID_H * cell + m


def lerp(a, b, t):
    return a + (b - a) * t


def lerp2(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def clamp(x, lo, hi):
    return lo if x < lo else hi if x > hi else x


def mix(c1, c2, t):
    return (int(lerp(c1[0], c2[0], t)), int(lerp(c1[1], c2[1], t)),
            int(lerp(c1[2], c2[2], t)))


def scale_color(c, k):
    return (clamp(int(c[0] * k), 0, 255), clamp(int(c[1] * k), 0, 255),
            clamp(int(c[2] * k), 0, 255))


def ease_out_back(t):
    c = 1.70158
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def cell_center(cell):
    return (BOARD_X + (cell[0] + 0.5) * CELL, BOARD_Y + (cell[1] + 0.5) * CELL)


def load_highscore():
    best = 0
    for path in (HIGHSCORE_FILE, OLD_HIGHSCORE_FILE):
        try:
            with open(path) as f:
                best = max(best, int(f.read().strip() or 0))
        except (OSError, ValueError):
            pass
    return best


def save_highscore(value):
    try:
        with open(HIGHSCORE_FILE, "w") as f:
            f.write(str(value))
    except OSError:
        pass


def synth(notes, volume=0.3):
    info = pygame.mixer.get_init()
    if not info or not info[1] == -16:
        return None
    rate, _fmt, channels = info
    buf = array("h")
    phase = 0.0
    for f0, f1, ms, wave in notes:
        n = max(1, int(rate * ms / 1000))
        attack = max(1, int(rate * 0.004))
        for i in range(n):
            t = i / n
            phase += (f0 + (f1 - f0) * t) / rate
            p = phase % 1.0
            if wave == "sine":
                v = math.sin(2 * math.pi * p)
            elif wave == "tri":
                v = 4 * abs(p - 0.5) - 1
            elif wave == "square":
                v = 0.6 if p < 0.5 else -0.6
            else:
                v = random.uniform(-1, 1)
            env = min(1.0, i / attack) * (1 - t) ** 1.5
            s = int(32767 * volume * env * v)
            for _ in range(channels):
                buf.append(s)
    return pygame.mixer.Sound(buffer=buf.tobytes())


def make_sounds():
    try:
        s = {
            "eat":   synth([(520, 880, 60, "sine"), (880, 1250, 50, "sine")]),
            "gold":  synth([(660, 660, 55, "tri"), (880, 880, 55, "tri"),
                            (1100, 1100, 55, "tri"), (1320, 1320, 130, "tri")]),
            "gem":   synth([(1200, 1800, 120, "sine"), (1800, 2600, 160, "sine")], 0.22),
            "speed": synth([(440, 440, 70, "square"), (554, 554, 70, "square"),
                            (659, 659, 150, "square")], 0.16),
            "die":   synth([(420, 70, 420, "square"), (200, 200, 180, "noise")], 0.25),
            "start": synth([(523, 523, 70, "tri"), (659, 659, 70, "tri"),
                            (784, 784, 70, "tri"), (1047, 1047, 170, "tri")]),
            "pause": synth([(700, 500, 60, "sine")], 0.2),
            "spawn": synth([(900, 1400, 70, "sine")], 0.12),
        }
    except pygame.error:
        return {}
    return {k: v for k, v in s.items() if v is not None}


FONT_FILES = [
    "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",
    "/Library/Fonts/Arial Rounded Bold.ttf",
    "/System/Library/Fonts/SFNSRounded.ttf",
]
_fonts = {}


def font(size):
    real = max(6, int(size * U))
    if real not in _fonts:
        f = None
        for path in FONT_FILES:
            if os.path.exists(path):
                try:
                    f = pygame.font.Font(path, real)
                    break
                except (OSError, pygame.error):
                    pass
        _fonts[real] = f or pygame.font.Font(None, int(real * 1.35))
    return _fonts[real]


def draw_text(surf, text, size, color, pos, anchor="center", shadow=True, alpha=255):
    f = font(size)
    img = f.render(text, True, color)
    rect = img.get_rect(**{anchor: (int(pos[0]), int(pos[1]))})
    if shadow:
        sh = f.render(text, True, BLACK)
        sh.set_alpha(int(110 * alpha / 255))
        surf.blit(sh, rect.move(max(1, ui(2)), max(1, ui(3))))
    if alpha < 255:
        img.set_alpha(max(0, alpha))
    surf.blit(img, rect)
    return rect


_glow_base = []
_glows = {}


def make_glow(radius, color, strength=1.0):
    if not _glow_base:
        n = 64
        base = pygame.Surface((n, n))
        c = (n - 1) / 2
        for y in range(n):
            for x in range(n):
                v = int(255 * max(0.0, 1 - math.hypot(x - c, y - c) / c) ** 2)
                base.set_at((x, y), (v, v, v))
        _glow_base.append(base)
    s = _glow_base[0].copy()
    s.fill(scale_color(color, strength), special_flags=pygame.BLEND_RGB_MULT)
    radius = max(1, int(radius))
    return pygame.transform.smoothscale(s, (radius * 2, radius * 2))


def blit_glow(surf, pos, radius, color, strength=1.0):
    key = (max(1, int(radius)), color, round(strength, 1))
    img = _glows.get(key)
    if img is None:
        if len(_glows) > 3000:
            _glows.clear()
        img = _glows[key] = make_glow(key[0], color, key[2])
    r = key[0]
    surf.blit(img, (int(pos[0]) - r, int(pos[1]) - r), special_flags=pygame.BLEND_RGB_ADD)


def panel(surf, rect, color=PANEL, alpha=200, radius=14, border=(70, 80, 125),
          border_alpha=110, shadow=False):
    r = pygame.Rect(rect)
    rr = ui(radius)
    pad = ui(14) if shadow else 0
    s = pygame.Surface((r.w + pad * 2, r.h + pad * 2), pygame.SRCALPHA)
    inner = pygame.Rect(pad, pad, r.w, r.h)
    if shadow:
        pygame.draw.rect(s, (0, 0, 0, 100), inner.move(0, ui(8)), border_radius=rr)
    pygame.draw.rect(s, color + (alpha,), inner, border_radius=rr)
    if border:
        pygame.draw.rect(s, border + (border_alpha,), inner, max(1, ui(2)), border_radius=rr)
    surf.blit(s, (r.x - pad, r.y - pad))


class Art:
    def __init__(self):
        rnd = random.Random(7)

        self.pan = ui(30) + 10
        nw, nh = WIDTH + 2 * self.pan, HEIGHT + 2 * self.pan
        strip = pygame.Surface((1, nh))
        for y in range(nh):
            strip.set_at((0, y), mix(BG_TOP, BG_BOTTOM, y / (nh - 1)))
        neb = pygame.transform.scale(strip, (nw, nh)).convert()
        big = max(nw, nh)
        for color in ORB_COLORS:
            img = make_glow(big * rnd.uniform(0.2, 0.34), color, rnd.uniform(0.7, 1.0))
            neb.blit(img, (rnd.uniform(-0.1, 0.9) * nw - img.get_width() / 2 + nw * 0.1,
                           rnd.uniform(-0.1, 0.9) * nh - img.get_height() / 2 + nh * 0.1),
                     special_flags=pygame.BLEND_RGB_ADD)
        n = 32
        small = pygame.Surface((n, n), pygame.SRCALPHA)
        for y in range(n):
            for x in range(n):
                dx, dy = (x - (n - 1) / 2) / ((n - 1) / 2), (y - (n - 1) / 2) / ((n - 1) / 2)
                d = min(1.0, math.hypot(dx, dy) / 1.414)
                small.set_at((x, y), (0, 0, 0, int(160 * d ** 2.2)))
        neb.blit(pygame.transform.smoothscale(small, (nw, nh)), (0, 0))
        self.nebula = neb

        self.board = pygame.Surface((BOARD_W, BOARD_H)).convert()
        for y in range(GRID_H):
            for x in range(GRID_W):
                self.board.fill(TILE_A if (x + y) % 2 == 0 else TILE_B,
                                (x * CELL, y * CELL, CELL, CELL))
        self.corner_r = ui(16)
        self.shade = pygame.Surface((BOARD_W, BOARD_H), pygame.SRCALPHA)
        pygame.draw.rect(self.shade, (4, 5, 12, 255), self.shade.get_rect(),
                         border_radius=self.corner_r)
        self.tint = pygame.Surface((BOARD_W, BOARD_H)).convert()

        count = int(70 * math.sqrt(WIDTH * HEIGHT / (640 * 696)))
        self.stars = [(rnd.uniform(0, WIDTH), rnd.uniform(0, HEIGHT), rnd.uniform(0, 6.3),
                       rnd.uniform(0.5, 2.0), rnd.choice((1, 1, 2)) * max(1, ui(1)))
                      for _ in range(count)]

        self._border = {}
        for color in (BOARD_EDGE, GEM, DANGER):
            for level in range(2, 17):
                self.border_strips(color, level / 8)

    def border_strips(self, color, level):
        key = (color, level)
        if key not in self._border:
            pad = ui(14)
            w, h = BOARD_W + 2 * pad, BOARD_H + 2 * pad
            f = pygame.Surface((w, h)).convert()
            f.fill(BLACK)
            inner = pygame.Rect(pad, pad, BOARD_W, BOARD_H)
            for i in range(4, 0, -1):
                pygame.draw.rect(f, scale_color(color, 0.16 * level / i),
                                 inner.inflate(ui(5) * i, ui(5) * i), max(2, ui(3)),
                                 border_radius=self.corner_r + ui(2) * i)
            pygame.draw.rect(f, scale_color(color, 0.8 * level), inner.inflate(2, 2),
                             max(2, ui(2)), border_radius=self.corner_r + 1)
            t = pad + ui(9)
            parts = [((0, 0, w, t)), ((0, h - t, w, t)), ((0, t, t, h - 2 * t)),
                     ((w - t, t, t, h - 2 * t))]
            self._border[key] = [(f.subsurface(p).copy(), (p[0] - pad, p[1] - pad)) for p in parts]
        return self._border[key]


def leaf_points(x, y, length, width, angle):
    ca, sa = math.cos(angle), math.sin(angle)
    pts = []
    for side, k in ((-1, 1.0), (1, 0.6)):
        rng = range(9) if side < 0 else range(8, -1, -1)
        for i in rng:
            t = i / 8
            px, py = t * length, side * math.sin(math.pi * t) * width * k
            pts.append((x + px * ca - py * sa, y + px * sa + py * ca))
    return pts


def draw_apple(surf, cx, cy, r, body, now=0.0):
    if r < 2:
        return
    dark = scale_color(body, 0.55)
    light = mix(body, WHITE, 0.55)
    lobes = [(cx - r * 0.3, cy - r * 0.05, r * 0.78), (cx + r * 0.3, cy - r * 0.05, r * 0.78),
             (cx, cy + r * 0.15, r * 0.85)]
    edge = max(2, int(r * 0.15))
    for x, y, rr in lobes:
        pygame.draw.circle(surf, dark, (int(x), int(y)), int(rr) + edge)
    for x, y, rr in lobes:
        pygame.draw.circle(surf, body, (int(x), int(y)), int(rr))
    pygame.draw.ellipse(surf, light, (cx - r * 0.62, cy - r * 0.5, r * 0.36, r * 0.55))
    pygame.draw.line(surf, (110, 70, 40), (cx, cy - r * 0.55), (cx + r * 0.12, cy - r * 1.05),
                     max(2, int(r * 0.16)))
    ang = -0.55 + math.sin(now * 3) * 0.15
    pygame.draw.polygon(surf, LEAF, leaf_points(cx + r * 0.08, cy - r * 0.8, r * 0.75, r * 0.3, ang))


def draw_gem(surf, cx, cy, r, now):
    sx = 0.55 + 0.45 * abs(math.cos(now * 1.8))

    def P(x, y):
        return (cx + x * r * sx, cy + y * r)
    outline = [P(-0.55, -0.75), P(0.55, -0.75), P(0.95, -0.2), P(0, 1.0), P(-0.95, -0.2)]
    dark = scale_color(GEM, 0.45)
    pygame.draw.polygon(surf, GEM, outline)
    pygame.draw.polygon(surf, mix(GEM, WHITE, 0.55),
                        [P(-0.55, -0.75), P(0.0, -0.75), P(-0.3, -0.2), P(-0.95, -0.2)])
    pygame.draw.polygon(surf, scale_color(GEM, 0.75), [P(0.3, -0.2), P(0.95, -0.2), P(0, 1.0)])
    w = max(1, int(r * 0.12))
    pygame.draw.line(surf, dark, P(-0.95, -0.2), P(0.95, -0.2), w)
    pygame.draw.line(surf, dark, P(-0.3, -0.2), P(0, 1.0), max(1, w // 2))
    pygame.draw.line(surf, dark, P(0.3, -0.2), P(0, 1.0), max(1, w // 2))
    pygame.draw.polygon(surf, dark, outline, w)


def draw_sparkle(surf, x, y, size, color):
    w = max(2, ui(2))
    pygame.draw.line(surf, color, (x - size, y), (x + size, y), w)
    pygame.draw.line(surf, color, (x, y - size), (x, y + size), w)
    pygame.draw.circle(surf, WHITE, (int(x), int(y)), max(1, int(size * 0.3)))


def draw_trophy(surf, cx, cy, s):
    dark = scale_color(GOLD, 0.6)
    for side in (-1, 1):
        pygame.draw.circle(surf, dark, (int(cx + side * s * 0.55), int(cy - s * 0.35)),
                           int(s * 0.28), max(2, int(s * 0.14)))
    pygame.draw.polygon(surf, GOLD, [(cx - s * 0.62, cy - s * 0.72), (cx + s * 0.62, cy - s * 0.72),
                                     (cx + s * 0.35, cy + s * 0.05), (cx - s * 0.35, cy + s * 0.05)])
    pygame.draw.circle(surf, GOLD, (int(cx), int(cy - s * 0.12)), int(s * 0.4))
    pygame.draw.rect(surf, dark, (cx - s * 0.1, cy + s * 0.05, s * 0.2, s * 0.35))
    pygame.draw.rect(surf, GOLD, (cx - s * 0.42, cy + s * 0.38, s * 0.84, s * 0.22),
                     border_radius=max(1, int(s * 0.15)))


def draw_key(surf, cx, cy, label=None, arrow=None, w=34, h=34):
    r = pygame.Rect(0, 0, ui(w), ui(h))
    r.center = (int(cx), int(cy))
    pygame.draw.rect(surf, (18, 22, 38), r.move(0, ui(4)), border_radius=ui(8))
    pygame.draw.rect(surf, (58, 66, 98), r, border_radius=ui(8))
    pygame.draw.rect(surf, (88, 98, 140), r, 1, border_radius=ui(8))
    if label:
        draw_text(surf, label, 15 if len(label) < 2 else 12, TEXT, r.center, shadow=False)
    if arrow:
        dx, dy = arrow
        px, py = -dy, dx
        s = ui(7)
        pygame.draw.polygon(surf, TEXT, [
            (cx + dx * s, cy + dy * s),
            (cx - dx * s * 0.6 + px * s * 0.8, cy - dy * s * 0.6 + py * s * 0.8),
            (cx - dx * s * 0.6 - px * s * 0.8, cy - dy * s * 0.6 - py * s * 0.8)])


def draw_key_cluster(surf, cx, cy, keys):
    k, g = ui(34), ui(4)
    spots = [(cx, cy), (cx - k - g, cy + k + g), (cx, cy + k + g), (cx + k + g, cy + k + g)]
    for (x, y), (label, arrow) in zip(spots, keys):
        draw_key(surf, x, y, label, arrow)


class Effects:
    def __init__(self):
        self.parts = []
        self.rings = []
        self.texts = []
        self.motes = []
        self.banner = None
        self.shake = 0.0
        self.flash = 0.0
        self.make_motes()

    def make_motes(self):
        n = int(AMBIENT_MOTES * math.sqrt(max(1.0, WIDTH * HEIGHT / (640 * 696))))
        self.motes = [[random.uniform(0, WIDTH), random.uniform(0, HEIGHT),
                       random.uniform(-6, 6) * U, random.uniform(-20, -6) * U,
                       random.uniform(0, 6.3), random.choice((2, 3, 3, 4)),
                       random.choice(MOTE_COLORS)] for _ in range(n)]

    def clear(self):
        self.parts, self.rings, self.texts, self.banner = [], [], [], None

    def add(self, x, y, vx, vy, life, color, size, gravity=0.0, kind=DOT):
        if len(self.parts) < MAX_PARTS:
            self.parts.append([x, y, vx, vy, life, life, color, size, gravity, kind,
                               random.uniform(0, 6.3), random.uniform(-9, 9)])

    def burst(self, x, y, color, n=16, speed=170, size=4.0, life=0.7, gravity=260,
              kind=DOT, up=0.25):
        for _ in range(int(n * PARTICLES)):
            a = random.uniform(0, math.tau)
            v = random.uniform(0.35, 1.0) * speed * U
            self.add(x, y, math.cos(a) * v, math.sin(a) * v - speed * U * up,
                     life * random.uniform(0.6, 1.0), color,
                     size * U * random.uniform(0.6, 1.3), gravity * U, kind)

    def confetti(self, x, y, n, speed=280, colors=CONFETTI):
        for _ in range(int(n * PARTICLES)):
            a = random.uniform(-math.pi * 0.92, -math.pi * 0.08)
            v = random.uniform(0.35, 1.0) * speed * U
            self.add(x, y, math.cos(a) * v, math.sin(a) * v, random.uniform(1.0, 1.8),
                     random.choice(colors), random.uniform(3, 5) * U, 420 * U, CONF)

    def rain(self, n):
        for _ in range(int(n * PARTICLES)):
            self.add(BOARD_X + random.uniform(0, BOARD_W), BOARD_Y - random.uniform(0, 40) * U,
                     random.uniform(-40, 40) * U, random.uniform(0, 80) * U,
                     random.uniform(1.4, 2.4), random.choice(CONFETTI),
                     random.uniform(3, 5) * U, 260 * U, CONF)

    def ring(self, x, y, color, r_end, life=0.45, width=3, r_start=0):
        self.rings.append([x, y, r_start * U, r_end * U, life, life, color, width])

    def text(self, msg, x, y, color, size=24):
        self.texts.append([msg, x, y, 0.9, 0.9, color, size])

    def show_banner(self, msg, color):
        self.banner = [msg, color, 0.0]

    def update(self, dt):
        drag = max(0.0, 1 - 1.8 * dt)
        air = max(0.0, 1 - 2.5 * dt)
        for p in self.parts:
            p[0] += p[2] * dt
            p[1] += p[3] * dt
            p[3] += p[8] * dt
            if p[9] == CONF:
                p[2] *= air
                p[3] = min(p[3], 150 * U)
                p[0] += math.sin(p[10] * 1.3) * 40 * U * dt
                p[10] += p[11] * dt
            else:
                p[2] *= drag
            p[4] -= dt
        self.parts = [p for p in self.parts if p[4] > 0]
        for r in self.rings:
            r[4] -= dt
        self.rings = [r for r in self.rings if r[4] > 0]
        for t in self.texts:
            t[2] -= 45 * U * dt
            t[3] -= dt
        self.texts = [t for t in self.texts if t[3] > 0]
        for m in self.motes:
            m[4] += dt
            m[0] += (m[2] + math.sin(m[4] * 0.9) * 8 * U) * dt
            m[1] += m[3] * dt
            if m[1] < -20:
                m[0], m[1] = random.uniform(0, WIDTH), HEIGHT + 20
            if m[0] < -20:
                m[0] = WIDTH + 20
            elif m[0] > WIDTH + 20:
                m[0] = -20
        if self.banner:
            self.banner[2] += dt
            if self.banner[2] > 1.4:
                self.banner = None
        self.shake = max(0.0, self.shake - 35 * dt)
        self.flash = max(0.0, self.flash - 2.5 * dt)

    def draw_motes(self, surf):
        for x, y, _vx, _vy, ph, size, color in self.motes:
            tw = 0.35 + 0.65 * (0.5 + 0.5 * math.sin(ph * 1.7))
            blit_glow(surf, (x, y), ui(size * 2.2), color, tw)

    def draw(self, surf):
        for x, y, r0, r1, life, mx, color, w in self.rings:
            k = life / mx
            e = 1 - k ** 3
            r = int(lerp(r0, r1, e))
            width = max(1, int(ui(w) * k + 0.5))
            if r > width:
                pygame.draw.circle(surf, scale_color(color, 0.35 + 0.65 * k), (int(x), int(y)),
                                   r, width)
        for x, y, _vx, _vy, life, mx, color, size, _g, kind, ang, _s in self.parts:
            k = life / mx
            if kind == SPARK:
                r = size * (0.5 + 0.5 * k)
                blit_glow(surf, (x, y), max(2, int(r * 2.4)), color, max(0.2, k))
                pygame.draw.circle(surf, mix(color, WHITE, 0.7), (int(x), int(y)),
                                   max(1, int(r * 0.5)))
            elif kind == CONF:
                w = size * (0.3 + 0.7 * abs(math.cos(ang * 1.7)))
                h = size * 0.55
                ca, sa = math.cos(ang), math.sin(ang)
                col = color if k > 0.25 else scale_color(color, k / 0.25)
                pygame.draw.polygon(surf, col, [(x + ca * dx - sa * dy, y + sa * dx + ca * dy)
                                                for dx, dy in ((-w, -h), (w, -h), (w, h), (-w, h))])
            else:
                pygame.draw.circle(surf, mix(color, WHITE, 0.35 * k), (int(x), int(y)),
                                   max(1, int(size * (0.4 + 0.6 * k))))
        for msg, x, y, life, mx, color, size in self.texts:
            age = mx - life
            pop = int(8 * max(0.0, 1 - age * 6))
            draw_text(surf, msg, size + pop, color, (x, y), alpha=int(255 * min(1.0, life / mx * 2)))
        if self.banner:
            msg, color, age = self.banner
            pop = ease_out_back(min(1.0, age / 0.35))
            fade = 1.0 if age < 1.0 else max(0.0, (1.4 - age) / 0.4)
            draw_text(surf, msg, max(8, int(20 + 30 * pop)), color,
                      (BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H * 0.3), alpha=int(255 * fade))


def base_step(apples):
    return max(MIN_STEP_MS, START_STEP_MS - (apples // SPEEDUP_EVERY) * SPEEDUP_MS) / 1000.0


def flood(start, blocked, cap):
    seen = {start}
    q = deque([start])
    while q and len(seen) < cap:
        x, y = q.popleft()
        for dx, dy in DIRS:
            n = (x + dx, y + dy)
            if (0 <= n[0] < GRID_W and 0 <= n[1] < GRID_H
                    and n not in blocked and n not in seen):
                seen.add(n)
                q.append(n)
    return len(seen)


class Game:
    def __init__(self, demo=False):
        self.demo = demo
        cx, cy = GRID_W // 2, GRID_H // 2
        self.snake = deque([(cx, cy), (cx - 1, cy), (cx - 2, cy)])
        self.prev = list(self.snake)
        self.direction = RIGHT
        self.turns = deque()
        self.grow = 0
        self.score = 0
        self.apples = 0
        self.timer = 0.0
        self.slowmo = 0.0
        self.play_time = 0.0
        self.alive = True
        self.won = False
        self.food = None
        self.bonus = None
        self.food = self.random_empty()
        self.food_age = 0.0

    def step_time(self):
        t = base_step(self.apples)
        return t * SLOWMO_FACTOR if self.slowmo > 0 else t

    def progress(self):
        return clamp(self.timer / self.step_time(), 0.0, 1.0)

    def random_empty(self):
        taken = set(self.snake)
        if self.food:
            taken.add(self.food)
        if self.bonus:
            taken.add(self.bonus["cell"])
        free = [(x, y) for x in range(GRID_W) for y in range(GRID_H) if (x, y) not in taken]
        return random.choice(free) if free else None

    def queue_turn(self, d):
        last = self.turns[-1] if self.turns else self.direction
        if d == last or d == (-last[0], -last[1]):
            return
        if len(self.turns) < 3:
            self.turns.append(d)

    def update(self, dt):
        events = []
        if not self.alive:
            return events
        self.play_time += dt
        self.food_age += dt
        if self.slowmo > 0:
            self.slowmo = max(0.0, self.slowmo - dt)
        if self.bonus:
            self.bonus["age"] += dt
            self.bonus["ttl"] -= dt
            if self.bonus["ttl"] <= 0:
                events.append(("bonus_gone", self.bonus["cell"]))
                self.bonus = None
        self.timer += dt
        while self.alive and self.timer >= self.step_time():
            self.timer -= self.step_time()
            events.extend(self.step())
        return events

    def die(self, events, cell):
        self.alive = False
        self.prev = list(self.snake)
        self.timer = 0.0
        events.append(("die", cell))
        return events

    def step(self):
        if self.demo:
            self.think()
        if self.turns:
            self.direction = self.turns.popleft()
        hx, hy = self.snake[0]
        new = (hx + self.direction[0], hy + self.direction[1])

        eaten = None
        if new == self.food:
            eaten = "apple"
        elif self.bonus and new == self.bonus["cell"]:
            eaten = self.bonus["kind"]

        keep_tail = self.grow > 0 or eaten is not None
        body = list(self.snake) if keep_tail else list(self.snake)[:-1]
        if not (0 <= new[0] < GRID_W and 0 <= new[1] < GRID_H) or new in body:
            return self.die([], (hx, hy))

        self.prev = list(self.snake)
        self.snake.appendleft(new)
        events = []
        if eaten == "apple":
            self.grow += 1
            self.score += 1
            self.apples += 1
            events.append(("apple", new))
            if base_step(self.apples) < base_step(self.apples - 1):
                events.append(("speedup", new))
            self.food = self.random_empty()
            self.food_age = 0.0
            if self.food is None:
                self.won = True
                return self.die(events, new)
            if self.bonus is None and random.random() < BONUS_CHANCE:
                kind = "gold" if random.random() < 0.6 else "gem"
                cell = self.random_empty()
                if cell:
                    life = GOLD_TIME if kind == "gold" else GEM_TIME
                    self.bonus = {"kind": kind, "cell": cell, "ttl": life, "max": life, "age": 0.0}
                    events.append(("spawn", cell))
        elif eaten == "gold":
            self.grow += 2
            self.score += GOLD_POINTS
            self.bonus = None
            events.append(("gold", new))
        elif eaten == "gem":
            self.grow += 1
            self.score += 2
            self.slowmo = SLOWMO_TIME
            self.bonus = None
            events.append(("gem", new))

        if self.grow > 0:
            self.grow -= 1
        else:
            self.snake.pop()
        return events

    def think(self):
        hx, hy = self.snake[0]
        dx, dy = self.direction
        target = self.bonus["cell"] if self.bonus else self.food
        blocked = set(list(self.snake)[:-1])
        need = len(self.snake) + 5
        best, best_key = None, None
        for d in ((dx, dy), (dy, -dx), (-dy, dx)):
            n = (hx + d[0], hy + d[1])
            if not (0 <= n[0] < GRID_W and 0 <= n[1] < GRID_H) or n in blocked:
                continue
            room = flood(n, blocked, need)
            dist = abs(n[0] - target[0]) + abs(n[1] - target[1]) if target else 0
            if room >= need:
                key = (True, 0, -dist, random.random())
            else:
                key = (False, room, -dist, random.random())
            if best_key is None or key > best_key:
                best, best_key = d, key
        if best:
            self.turns = deque([best])


def snake_points(g):
    t = g.progress()
    pts = []
    for i, cell in enumerate(g.snake):
        a = g.prev[i] if i < len(g.prev) else g.prev[-1]
        pts.append(cell_center(lerp2(a, cell, t)))
    return pts


def body_polyline(g):
    t = g.progress()
    cells = list(g.snake)
    n = len(cells)
    head = lerp2(g.prev[0], cells[0], t)
    tail_from = g.prev[n - 1] if n - 1 < len(g.prev) else g.prev[-1]
    tail = lerp2(tail_from, cells[-1], t)
    return [cell_center(c) for c in [head] + cells[1:] + [tail]]


def resample(poly, step):
    out = [(poly[0][0], poly[0][1], 0.0)]
    s = 0.0
    for i in range(len(poly) - 1):
        (x0, y0), (x1, y1) = poly[i], poly[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if seg < 1e-6:
            continue
        k = max(1, int(math.ceil(seg / step)))
        for j in range(1, k + 1):
            f = j / k
            out.append((x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, s + seg * f))
        s += seg
    return out, s


def point_at(poly, dist):
    for i in range(len(poly) - 1):
        (x0, y0), (x1, y1) = poly[i], poly[i + 1]
        seg = math.hypot(x1 - x0, y1 - y0)
        if dist <= seg and seg > 1e-6:
            return (x0 + (x1 - x0) * dist / seg, y0 + (y1 - y0) * dist / seg)
        dist -= seg
    return poly[-1]


def body_radius(f):
    return CELL * (0.43 - 0.22 * f ** 1.5)


def snake_geometry(g, head_dir, tint=None):
    poly = body_polyline(g)
    n = len(g.snake)
    step = CELL / 3.0 if n < 40 else CELL / 2.0 if n < 100 else CELL * 1.0
    samples, length = resample(poly, step)
    length = max(length, 1.0)
    pts, rad, col = [], [], []
    for x, y, s in samples:
        f = min(1.0, s / length)
        pts.append((x, y))
        rad.append(body_radius(f))
        c = mix(SNAKE_HEAD, SNAKE_TAIL, f)
        col.append(mix(c, tint, 0.65) if tint else c)
    spots = []
    for i in range(2, len(g.snake), 2):
        s = i * CELL
        if s < length - CELL * 0.3:
            f = s / length
            c = mix(SNAKE_HEAD, SNAKE_TAIL, f)
            spots.append((point_at(poly, s), body_radius(f), mix(c, tint, 0.65) if tint else c))
    head_col = mix(SNAKE_HEAD, tint, 0.65) if tint else SNAKE_HEAD
    return {"pts": pts, "rad": rad, "col": col, "spots": spots, "dir": head_dir,
            "head_col": head_col}


def tube(surf, pts, rad, colors, grow=0.0, scale=1.0, shift=(0.0, 0.0)):
    single = isinstance(colors, tuple)
    for i in range(len(pts) - 1, -1, -1):
        r = rad[i] * scale + grow
        x, y = pts[i][0] + shift[0] * rad[i], pts[i][1] + shift[1] * rad[i]
        color = colors if single else colors[i]
        if i < len(pts) - 1:
            r2 = rad[i + 1] * scale + grow
            nx, ny = pts[i + 1][0] + shift[0] * rad[i + 1], pts[i + 1][1] + shift[1] * rad[i + 1]
            pygame.draw.line(surf, color, (int(x), int(y)), (int(nx), int(ny)),
                             max(1, int(2 * min(r, r2))))
        pygame.draw.circle(surf, color, (int(x), int(y)), max(1, int(r)))


def draw_snake_shadow(c, geo):
    off = (CELL * 0.14, CELL * 0.24)
    moved = [(x + off[0], y + off[1]) for x, y in geo["pts"]]
    tube(c, moved, geo["rad"], SHADOW)
    pygame.draw.circle(c, SHADOW, (int(moved[0][0]), int(moved[0][1])), int(CELL * 0.47))


def draw_snake(c, geo, now, target, dead=False):
    pts, rad, col = geo["pts"], geo["rad"], geo["col"]
    vx, vy = geo["dir"]
    px, py = -vy, vx
    hx, hy = pts[0]
    r = CELL * 0.47
    lw = max(2, ui(3))

    near = target and math.hypot(target[0] - hx, target[1] - hy) < CELL * 2.6
    if not dead and ((now % 1.8) < 0.22 or (near and (now * 5) % 1 < 0.5)):
        tip = (hx + vx * (r + CELL * 0.33), hy + vy * (r + CELL * 0.33))
        pygame.draw.line(c, TONGUE, (hx + vx * r * 0.7, hy + vy * r * 0.7), tip, lw)
        f = CELL * 0.16
        for s in (-1, 1):
            pygame.draw.line(c, TONGUE, tip, (tip[0] + vx * f + px * f * 0.8 * s,
                                              tip[1] + vy * f + py * f * 0.8 * s), max(1, lw - 1))

    tube(c, pts, rad, SNAKE_OUTLINE, grow=max(2, ui(2)))
    tube(c, pts, rad, [scale_color(cc, 0.7) for cc in col])
    tube(c, pts, rad, col, scale=0.8, shift=(-0.04, -0.17))
    for (sx, sy), sr, sc in geo["spots"]:
        pygame.draw.circle(c, scale_color(sc, 0.72), (int(sx), int(sy + sr * 0.15)),
                           max(1, int(sr * 0.45)))
    tube(c, pts, rad, [mix(cc, WHITE, 0.3) for cc in col], scale=0.28, shift=(-0.18, -0.4))

    head = geo["head_col"]
    pygame.draw.circle(c, SNAKE_OUTLINE, (int(hx), int(hy)), int(r) + max(2, ui(2)))
    pygame.draw.circle(c, head, (int(hx), int(hy)), int(r))
    pygame.draw.circle(c, mix(head, WHITE, 0.45), (int(hx - r * 0.25), int(hy - r * 0.35)),
                       int(r * 0.35))
    for s in (-1, 1):
        pygame.draw.circle(c, SNAKE_OUTLINE, (int(hx + vx * r * 0.78 + px * r * 0.2 * s),
                                              int(hy + vy * r * 0.78 + py * r * 0.2 * s)),
                           max(1, ui(2)))

    blink = (now % 3.7) < 0.12
    for s in (-1, 1):
        ex, ey = hx + vx * r * 0.12 + px * r * 0.48 * s, hy + vy * r * 0.12 + py * r * 0.48 * s
        er = r * 0.36
        if dead:
            for a, b in ((1, 1), (1, -1)):
                pygame.draw.line(c, SNAKE_OUTLINE, (ex - er * 0.7 * a, ey - er * 0.7 * b),
                                 (ex + er * 0.7 * a, ey + er * 0.7 * b), lw)
        elif blink:
            pygame.draw.line(c, SNAKE_OUTLINE, (ex - vx * er, ey - vy * er),
                             (ex + vx * er, ey + vy * er), lw)
        else:
            lx, ly = vx, vy
            if target:
                dx, dy = target[0] - ex, target[1] - ey
                d = math.hypot(dx, dy)
                if d > 0.01:
                    lx, ly = dx / d, dy / d
            pygame.draw.circle(c, SNAKE_OUTLINE, (int(ex), int(ey)), int(er + max(2, ui(2))))
            pygame.draw.circle(c, EYE_WHITE, (int(ex), int(ey)), int(er))
            qx, qy = ex + lx * er * 0.35, ey + ly * er * 0.35
            pygame.draw.circle(c, EYE_PUPIL, (int(qx), int(qy)), max(1, int(er * 0.58)))
            pygame.draw.circle(c, WHITE, (int(qx - er * 0.22), int(qy - er * 0.25)),
                               max(1, int(er * 0.22)))


def draw_background(c, art, now):
    p = art.pan
    c.blit(art.nebula, (-p + p * math.sin(now * 0.07), -p + p * math.cos(now * 0.05)))
    for x, y, ph, sp, size in art.stars:
        k = 0.3 + 0.7 * (0.5 + 0.5 * math.sin(now * sp + ph))
        pygame.draw.circle(c, scale_color((170, 180, 255), k * 0.8), (int(x), int(y)), size)


def draw_board(c, art, color, intensity):
    r = art.corner_r
    x, y, w, h = BOARD_X, BOARD_Y, BOARD_W, BOARD_H
    pygame.draw.rect(c, SLAB, (x, y + ui(7), w, h), border_radius=r)
    c.blit(art.board, (x + r, y), (r, 0, w - 2 * r, h))
    c.blit(art.board, (x, y + r), (0, r, r, h - 2 * r))
    c.blit(art.board, (x + w - r, y + r), (w - r, r, r, h - 2 * r))
    for (cx, cy), gx, gy in (((x + r, y + r), 0, 0), ((x + w - r, y + r), GRID_W - 1, 0),
                             ((x + r, y + h - r), 0, GRID_H - 1),
                             ((x + w - r, y + h - r), GRID_W - 1, GRID_H - 1)):
        pygame.draw.circle(c, TILE_A if (gx + gy) % 2 == 0 else TILE_B, (cx, cy), r)
    level = clamp(round(intensity * 8) / 8, 0.25, 2.0)
    for img, (ox, oy) in art.border_strips(color, level):
        c.blit(img, (x + ox, y + oy), special_flags=pygame.BLEND_RGB_ADD)


ITEM_GLOW = {"apple": (70, 15, 20), "gold": (95, 75, 10), "gem": (15, 65, 95)}


def visible_items(g, now):
    out = []
    if g.food:
        s = ease_out_back(min(1.0, g.food_age / 0.35))
        x, y = cell_center(g.food)
        out.append(("apple", x, y + math.sin(now * 4 + g.food[0]) * CELL * 0.07,
                    CELL * 0.36 * s, None, y))
    if g.bonus:
        b = g.bonus
        s = ease_out_back(min(1.0, b["age"] / 0.35))
        x, y = cell_center(b["cell"])
        out.append((b["kind"], x, y + math.sin(now * 5) * CELL * 0.08, CELL * 0.38 * s,
                    b["ttl"] / b["max"], y))
    return out


def draw_items(c, items, now):
    for kind, x, y, r, frac, _gy in items:
        blinking = frac is not None and frac < 0.3 and int(now * 10) % 2 == 0
        if frac is not None:
            ring = GOLD if kind == "gold" else GEM
            rect = pygame.Rect(0, 0, int(CELL * 1.15), int(CELL * 1.15))
            rect.center = (int(x), int(y))
            pygame.draw.arc(c, scale_color(ring, 0.8), rect, math.pi / 2,
                            math.pi / 2 + 2 * math.pi * frac, max(2, ui(2)))
        if blinking:
            continue
        if kind == "apple":
            draw_apple(c, x, y, r, APPLE, now)
        elif kind == "gold":
            draw_apple(c, x, y, r, GOLD, now)
            for i in range(3):
                a = now * 2.5 + i * math.tau / 3
                draw_sparkle(c, x + math.cos(a) * CELL * 0.62, y + math.sin(a) * CELL * 0.62,
                             (3 + 2 * abs(math.sin(now * 5 + i))) * U, (255, 240, 170))
        else:
            draw_gem(c, x, y, r, now)
            draw_sparkle(c, x + CELL * 0.3, y - CELL * 0.35, (2 + 3 * abs(math.sin(now * 3))) * U,
                         WHITE)


def draw_hud(c, app, g):
    h = ui(50)
    cy = BOARD_Y - HUD_H + HUD_H // 2 + ui(2)
    top = cy - h // 2

    lx = BOARD_X
    panel(c, (lx, top, ui(170), h))
    draw_apple(c, lx + ui(26), cy + ui(3), ui(11), APPLE, app.now)
    draw_text(c, "SCORE", 12, TEXT_DIM, (lx + ui(50), top + ui(13)), "midleft", shadow=False)
    draw_text(c, str(int(round(app.disp_score))), 26 + int(8 * app.score_bump), TEXT,
              (lx + ui(50), top + ui(33)), "midleft")

    rx = BOARD_X + BOARD_W - ui(170)
    panel(c, (rx, top, ui(170), h))
    draw_trophy(c, rx + ui(26), cy + ui(1), ui(20))
    best = max(app.highscore, g.score if not g.demo else 0)
    draw_text(c, "BEST", 12, TEXT_DIM, (rx + ui(50), top + ui(13)), "midleft", shadow=False)
    draw_text(c, str(best), 26, GOLD if best > app.best_before else TEXT,
              (rx + ui(50), top + ui(33)), "midleft")

    mx = BOARD_X + BOARD_W // 2
    panel(c, (mx - ui(105), top, ui(210), h))
    if g.slowmo > 0:
        label, color = "SLOW-MO  %.1fs" % g.slowmo, GEM
    elif base_step(g.apples) <= MIN_STEP_MS / 1000.0:
        label, color = "SPEED  MAX", DANGER
    else:
        label, color = "SPEED  %d" % (g.apples // SPEEDUP_EVERY + 1), ACCENT
    draw_text(c, label, 14, TEXT, (mx, top + ui(15)), shadow=False)
    bar = pygame.Rect(mx - ui(80), top + ui(29), ui(160), ui(9))
    pygame.draw.rect(c, (8, 10, 22), bar, border_radius=ui(5))
    fill = int(bar.w * clamp(app.bar, 0.0, 1.0))
    if fill > ui(4):
        pygame.draw.rect(c, color, (bar.x, bar.y, fill, bar.h), border_radius=ui(5))
        pygame.draw.rect(c, mix(color, WHITE, 0.5), (bar.x + ui(2), bar.y + 1, fill - ui(4),
                                                     max(1, ui(2))), border_radius=1)
        blit_glow(c, (bar.x + fill, bar.centery), ui(10), scale_color(color, 0.5))


def draw_start(c, app):
    now = app.now
    cx = BOARD_X + BOARD_W / 2
    ty = BOARD_Y + BOARD_H * 0.24

    blit_glow(c, (cx, ty), ui(190), (25, 70, 55), 1.0)
    word, size, gap = "SNAKE", 92, ui(6)
    widths = [font(size).size(ch)[0] for ch in word]
    x = cx - (sum(widths) + gap * (len(word) - 1)) / 2
    for i, ch in enumerate(word):
        col = mix(ACCENT, (90, 200, 255), i / (len(word) - 1))
        draw_text(c, ch, size, col, (x + widths[i] / 2, ty + math.sin(now * 3 - i * 0.7) * ui(8)))
        x += widths[i] + gap
    draw_text(c, "press SPACE to start", 24, TEXT, (cx, ty + ui(85)),
              alpha=int(165 + 90 * math.sin(now * 4)))

    ky = BOARD_Y + BOARD_H * 0.55
    draw_key_cluster(c, cx - ui(190), ky, [(None, UP), (None, LEFT), (None, DOWN), (None, RIGHT)])
    draw_text(c, "or", 16, TEXT_DIM, (cx - ui(122), ky + ui(38)), shadow=False)
    draw_key_cluster(c, cx - ui(54), ky, [("W", None), ("A", None), ("S", None), ("D", None)])
    draw_key(c, cx + ui(40), ky + ui(38), "P")
    draw_key(c, cx + ui(92), ky + ui(38), "F")
    draw_key(c, cx + ui(144), ky + ui(38), "M")
    draw_key(c, cx + ui(206), ky + ui(38), "ESC", w=52)
    for text, x in (("move", cx - ui(122)), ("pause", cx + ui(40)), ("screen", cx + ui(92)),
                    ("sound", cx + ui(144)), ("quit", cx + ui(206))):
        draw_text(c, text, 13, TEXT_DIM, (x, ky + ui(76)), shadow=False)

    ly = BOARD_Y + BOARD_H * 0.85
    panel(c, (cx - ui(230), ly - ui(26), ui(460), ui(52)), alpha=150, radius=16)
    draw_apple(c, cx - ui(190), ly + ui(1), ui(11), APPLE, now)
    draw_text(c, "+1", 16, TEXT, (cx - ui(170), ly), "midleft")
    draw_apple(c, cx - ui(70), ly + ui(1), ui(11), GOLD, now)
    draw_text(c, "+%d  hurry" % GOLD_POINTS, 16, TEXT, (cx - ui(50), ly), "midleft")
    draw_gem(c, cx + ui(80), ly, ui(11), now)
    draw_text(c, "slow-mo", 16, TEXT, (cx + ui(100), ly), "midleft")


def draw_pause(c, app):
    cx, cy = BOARD_X + BOARD_W // 2, BOARD_Y + BOARD_H // 2
    panel(c, (cx - ui(140), cy - ui(80), ui(280), ui(160)), alpha=230, radius=20,
          border=TEXT_DIM, shadow=True)
    pygame.draw.rect(c, TEXT, (cx - ui(18), cy - ui(55), ui(11), ui(32)), border_radius=ui(3))
    pygame.draw.rect(c, TEXT, (cx + ui(7), cy - ui(55), ui(11), ui(32)), border_radius=ui(3))
    draw_text(c, "PAUSED", 36, TEXT, (cx, cy + ui(10)))
    draw_text(c, "press P to resume", 16, TEXT_DIM, (cx, cy + ui(50)), shadow=False)


def card_rect(app):
    slide = ease_out_back(min(1.0, app.over_t / 0.55))
    rect = pygame.Rect(0, 0, ui(400), ui(380))
    rect.center = (BOARD_X + BOARD_W // 2, int(BOARD_Y + BOARD_H // 2 - (1 - slide) * BOARD_H))
    return rect


def draw_game_over(c, app):
    g, now = app.game, app.now
    rect = card_rect(app)
    cx, top = rect.centerx, rect.top
    panel(c, rect, alpha=235, radius=22, border=GOLD if g.won else DANGER,
          border_alpha=160, shadow=True)
    draw_text(c, "YOU WIN" if g.won else "GAME OVER", 44, GOLD if g.won else DANGER,
              (cx, top + ui(48)))
    draw_text(c, "SCORE", 14, TEXT_DIM, (cx, top + ui(96)), shadow=False)
    draw_text(c, str(g.score), 64, TEXT, (cx, top + ui(142)))
    if app.new_record:
        pulse = 1 + 0.06 * math.sin(now * 6)
        badge = pygame.Rect(0, 0, int(ui(170) * pulse), int(ui(34) * pulse))
        badge.center = (cx, top + ui(202))
        blit_glow(c, badge.center, ui(110), (70, 55, 10))
        pygame.draw.rect(c, GOLD, badge, border_radius=ui(17))
        draw_text(c, "NEW RECORD", 16, (60, 40, 0), badge.center, shadow=False)
        for i in range(4):
            a = now * 2 + i * math.pi / 2
            draw_sparkle(c, cx + math.cos(a) * ui(112), top + ui(202) + math.sin(a) * ui(26),
                         (4 + 2 * abs(math.sin(now * 5 + i))) * U, (255, 240, 170))
    else:
        draw_text(c, "BEST  %d" % app.highscore, 18, TEXT_DIM, (cx, top + ui(202)))
    mins, secs = divmod(int(g.play_time), 60)
    stats = [("LENGTH", str(len(g.snake))), ("APPLES", str(g.apples)),
             ("TIME", "%d:%02d" % (mins, secs))]
    for i, (label, value) in enumerate(stats):
        x = cx + (i - 1) * ui(120)
        draw_text(c, value, 24, TEXT, (x, top + ui(258)))
        draw_text(c, label, 12, TEXT_DIM, (x, top + ui(284)), shadow=False)
    draw_text(c, "Press SPACE to restart", 20, ACCENT, (cx, top + ui(325)),
              alpha=int(165 + 90 * math.sin(now * 4)))
    draw_text(c, "Esc to quit", 13, TEXT_DIM, (cx, top + ui(355)), shadow=False)


class App:
    def __init__(self):
        if SOUND_ON:
            pygame.mixer.pre_init(44100, -16, 1, 512)
        pygame.init()
        pygame.display.set_caption("Snake")
        icon = pygame.Surface((32, 32), pygame.SRCALPHA)
        draw_apple(icon, 16, 18, 11, APPLE)
        pygame.display.set_icon(icon)
        try:
            self.desktop = pygame.display.get_desktop_sizes()[0]
        except (AttributeError, IndexError, pygame.error):
            info = pygame.display.Info()
            self.desktop = (info.current_w or 1280, info.current_h or 800)
        self.screen = None
        self.fx = None
        self.set_display(START_FULLSCREEN)
        self.clock = pygame.time.Clock()
        self.sounds = make_sounds() if SOUND_ON else {}
        self.muted = False
        self.highscore = load_highscore()
        self.best_before = self.highscore
        self.blank = Game()
        self.game = Game(demo=True) if SHOW_DEMO else Game()
        self.state = "start"
        self.now = 0.0
        self.running = True
        self.disp_score = 0.0
        self.last_score = 0
        self.score_bump = 0.0
        self.bar = 0.0
        self.dim = 1.0
        self.dying_t = 0.0
        self.over_t = 0.0
        self.party_t = 0.0
        self.trail_acc = 0.0
        self.item_acc = 0.0
        self.exploded = False
        self.new_record = False
        self.head_dir = (1.0, 0.0)

    def open_window(self, size, fullscreen):
        flags = pygame.FULLSCREEN if fullscreen else 0
        for extra, vsync in ((pygame.SCALED, 1), (0, 0)):
            try:
                if vsync:
                    return pygame.display.set_mode(size, flags | extra, vsync=1)
                return pygame.display.set_mode(size, flags | extra)
            except (pygame.error, TypeError):
                continue
        return pygame.display.set_mode(size)

    def set_display(self, fullscreen):
        dw, dh = self.desktop
        if fullscreen:
            cell = fit_cell(dw, dh)
            size = (dw, dh)
        else:
            cell = min(WINDOW_CELL, fit_cell(int(dw * 0.92), int(dh * 0.86)))
            size = window_size(cell)
        setup_layout(size[0], size[1], cell)
        self.screen = self.open_window(size, fullscreen)
        if self.screen.get_size() != size:
            w, h = self.screen.get_size()
            setup_layout(w, h, min(cell, fit_cell(w, h)))
        self.fullscreen = fullscreen
        self.canvas = pygame.Surface(self.screen.get_size()).convert()
        _glows.clear()
        self.art = Art()
        if self.fx is None:
            self.fx = Effects()
        else:
            self.fx.clear()
            self.fx.make_motes()
        pygame.mouse.set_visible(not fullscreen)

    def sfx(self, name):
        if self.muted:
            return
        s = self.sounds.get(name)
        if s:
            s.play()

    def new_game(self):
        self.game = Game()
        self.state = "play"
        self.best_before = self.highscore
        self.new_record = False
        self.exploded = False
        self.disp_score = 0.0
        self.last_score = 0
        self.head_dir = (1.0, 0.0)
        self.sfx("start")
        self.fx.show_banner("GO", ACCENT)
        hx, hy = cell_center(self.game.snake[0])
        self.fx.ring(hx, hy, ACCENT, 120, 0.6, 4)
        self.fx.burst(hx, hy, ACCENT, 24, speed=240, size=3, life=0.7, gravity=0, kind=SPARK)

    def on_event(self, event):
        if event.type == pygame.QUIT:
            self.running = False
        elif event.type == FOCUS_LOST and self.state == "play":
            self.state = "pause"
        elif event.type == pygame.KEYDOWN:
            k = event.key
            if k == pygame.K_ESCAPE:
                self.running = False
            elif k == pygame.K_f:
                self.set_display(not self.fullscreen)
            elif k == pygame.K_m:
                self.muted = not self.muted
                self.fx.show_banner("SOUND OFF" if self.muted else "SOUND ON", TEXT_DIM)
            elif self.state in ("start", "over") and k in (pygame.K_SPACE, pygame.K_RETURN, pygame.K_KP_ENTER):
                if self.state == "start" or self.over_t > 0.4:
                    self.new_game()
            elif self.state == "play" and k == pygame.K_p:
                self.state = "pause"
                self.sfx("pause")
            elif self.state == "pause" and k == pygame.K_p:
                self.state = "play"
                self.sfx("pause")
            elif self.state == "play" and k in KEY_TO_DIR:
                self.game.queue_turn(KEY_TO_DIR[k])

    def handle(self, events, quiet=False):
        fx = self.fx
        for kind, cell in events:
            x, y = cell_center(cell)
            if kind == "apple":
                fx.burst(x, y, APPLE, 12, speed=170, size=4)
                fx.burst(x, y, (255, 120, 110), 16, speed=230, size=3, life=0.6,
                         gravity=40, kind=SPARK)
                fx.ring(x, y, APPLE, 44, 0.4, 3)
                fx.flash = 0.35
                if not quiet:
                    fx.text("+1", x, y - CELL * 0.35, TEXT)
                    self.sfx("eat")
            elif kind == "gold":
                fx.confetti(x, y, 28, colors=[GOLD, (255, 235, 150), (255, 165, 40)])
                fx.burst(x, y, GOLD, 30, speed=280, size=3.5, life=0.8, gravity=30, kind=SPARK)
                fx.ring(x, y, GOLD, 70, 0.5, 4)
                fx.ring(x, y, WHITE, 40, 0.3, 2)
                fx.shake = max(fx.shake, 5)
                fx.flash = 0.9
                if not quiet:
                    fx.text("+%d" % GOLD_POINTS, x, y - CELL * 0.35, GOLD, 30)
                    self.sfx("gold")
            elif kind == "gem":
                fx.burst(x, y, GEM, 30, speed=260, size=3.5, life=0.8, gravity=0, kind=SPARK)
                fx.confetti(x, y, 16, speed=220, colors=[GEM, (190, 245, 255), (40, 150, 220)])
                fx.ring(x, y, GEM, 110, 0.7, 4)
                fx.ring(x, y, WHITE, 50, 0.35, 2)
                fx.flash = 0.7
                if not quiet:
                    fx.text("SLOW-MO", x, y - CELL * 0.35, GEM, 22)
                    self.sfx("gem")
            elif kind == "speedup" and not quiet:
                fx.show_banner("SPEED UP", ACCENT)
                fx.rain(60)
                self.sfx("speed")
            elif kind == "spawn":
                fx.ring(x, y, WHITE, 2, 0.35, 2, r_start=45)
                fx.burst(x, y, WHITE, 12, speed=110, size=2.5, life=0.5, gravity=0, kind=SPARK)
                if not quiet:
                    self.sfx("spawn")
            elif kind == "bonus_gone":
                fx.burst(x, y, TEXT_DIM, 14, speed=70, size=3, life=0.6, gravity=-60)
                fx.ring(x, y, TEXT_DIM, 30, 0.35, 2)

    def explode(self, g):
        pts = snake_points(g)
        per = max(2, min(8, 200 // len(pts)))
        for i, (x, y) in enumerate(pts):
            c = mix(SNAKE_HEAD, SNAKE_TAIL, i / max(1, len(pts) - 1))
            self.fx.burst(x, y, c, per, speed=190, size=5)
            self.fx.burst(x, y, c, per, speed=260, size=3, life=0.9, gravity=60, kind=SPARK)
        hx, hy = pts[0]
        self.fx.ring(hx, hy, DANGER, 160, 0.8, 5)
        self.fx.ring(hx, hy, WHITE, 90, 0.4, 3)

    def emit_ambient(self, g, dt):
        if not g.alive or PARTICLES <= 0:
            return
        fx = self.fx
        pts = snake_points(g)
        self.trail_acc += dt * (18 + (22 if g.slowmo > 0 else 0)) * PARTICLES
        while self.trail_acc >= 1:
            self.trail_acc -= 1
            i = random.randrange(len(pts))
            x, y = pts[i]
            c = GEM if g.slowmo > 0 and random.random() < 0.6 else \
                mix(mix(SNAKE_HEAD, SNAKE_TAIL, i / max(1, len(pts) - 1)), WHITE, 0.3)
            fx.add(x + random.uniform(-0.3, 0.3) * CELL, y + random.uniform(-0.3, 0.3) * CELL,
                   random.uniform(-10, 10) * U, random.uniform(-35, -12) * U,
                   random.uniform(0.5, 0.9), c, random.uniform(1.5, 2.5) * U, 0, SPARK)
        if base_step(g.apples) <= 0.09 and random.random() < dt * 30 * PARTICLES:
            x, y = pts[-1]
            fx.add(x, y, random.uniform(-20, 20) * U, random.uniform(-20, 20) * U,
                   0.5, SNAKE_TAIL, 2.5 * U, 0, DOT)
        items = [(g.food, APPLE, 3)]
        if g.bonus:
            items.append((g.bonus["cell"], GOLD if g.bonus["kind"] == "gold" else GEM, 14))
        for cell, color, rate in items:
            if cell and random.random() < dt * rate * PARTICLES:
                x, y = cell_center(cell)
                fx.add(x + random.uniform(-0.45, 0.45) * CELL, y + random.uniform(-0.3, 0.4) * CELL,
                       random.uniform(-6, 6) * U, random.uniform(-40, -20) * U,
                       random.uniform(0.6, 1.0), mix(color, WHITE, 0.3),
                       random.uniform(1.5, 2.5) * U, 0, SPARK)

    def update(self, dt):
        self.now += dt
        self.fx.update(dt)
        g = self.game
        if self.state == "start" and SHOW_DEMO:
            events = g.update(dt)
            self.handle(events, quiet=True)
            self.emit_ambient(g, dt)
            if not g.alive:
                self.explode(g)
                self.game = Game(demo=True)
                self.head_dir = (1.0, 0.0)
        elif self.state == "play":
            events = g.update(dt)
            self.handle(events)
            self.emit_ambient(g, dt)
            if not g.alive:
                self.state = "dying"
                self.dying_t = 0.0
                self.fx.shake = 14
                self.sfx("gold" if g.won else "die")
                if g.score > self.highscore:
                    self.highscore = g.score
                    self.new_record = True
                    save_highscore(self.highscore)
        elif self.state == "dying":
            self.dying_t += dt
            if not self.exploded and self.dying_t >= 0.45:
                self.exploded = True
                self.explode(g)
                self.fx.shake = max(self.fx.shake, 9)
            if self.dying_t >= 1.25:
                self.state = "over"
                self.over_t = 0.0
                self.party_t = 0.3
        elif self.state == "over":
            self.over_t += dt
            if self.new_record and self.over_t > 0.5:
                self.party_t += dt
                if self.party_t >= 0.7:
                    self.party_t = 0.0
                    r = card_rect(self)
                    self.fx.confetti(r.left + ui(20), r.top + ui(30), 18, speed=320)
                    self.fx.confetti(r.right - ui(20), r.top + ui(30), 18, speed=320)

        g = self.game
        c0, c1 = g.snake[0], g.snake[1]
        tx, ty = c0[0] - c1[0], c0[1] - c1[1]
        k = 1 - math.exp(-dt * 22)
        hx, hy = lerp(self.head_dir[0], tx, k), lerp(self.head_dir[1], ty, k)
        d = math.hypot(hx, hy)
        self.head_dir = (hx / d, hy / d) if d > 0.05 else (float(tx), float(ty))

        hud = self.blank if self.state == "start" else self.game
        if hud.score > self.last_score:
            self.score_bump = 1.0
        self.last_score = hud.score
        self.score_bump = max(0.0, self.score_bump - dt * 4)
        self.disp_score += (hud.score - self.disp_score) * min(1.0, dt * 12)
        if hud.slowmo > 0:
            target = hud.slowmo / SLOWMO_TIME
        elif base_step(hud.apples) <= MIN_STEP_MS / 1000.0:
            target = 1.0
        else:
            target = (hud.apples % SPEEDUP_EVERY) / SPEEDUP_EVERY
        self.bar += (target - self.bar) * min(1.0, dt * 10)
        want = 1.0 if self.state in ("start", "pause", "over") else 0.0
        self.dim += (want - self.dim) * min(1.0, dt * 8)

    def draw(self):
        c, art, g, now = self.canvas, self.art, self.game, self.now
        board = pygame.Rect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H)
        draw_background(c, art, now)
        if self.state == "dying":
            edge = DANGER
        elif g.slowmo > 0:
            edge = GEM
        else:
            edge = BOARD_EDGE
        draw_board(c, art, edge, 0.55 + 0.15 * math.sin(now * 2) + self.fx.flash)
        if g.slowmo > 0 and g.alive:
            pulse = int(10 + 6 * math.sin(now * 5))
            art.tint.fill((0, pulse, pulse + 8))
            c.blit(art.tint, board, special_flags=pygame.BLEND_RGB_ADD)
        self.fx.draw_motes(c)

        items = visible_items(g, now)
        for kind, x, y, r, _f, _gy in items:
            blit_glow(c, (x, y), int(CELL * 1.2), ITEM_GLOW[kind],
                      0.8 + 0.2 * math.sin(now * 4))

        show_snake = not (self.state == "dying" and self.exploded) and not self.state == "over"
        tint = None
        if self.state == "dying" and int(self.dying_t * 14) % 2 == 0:
            tint = DANGER
        geo = snake_geometry(g, self.head_dir, tint) if show_snake else None

        c.set_clip(board)
        for _k, x, _y, r, _f, gy in items:
            pygame.draw.ellipse(c, SHADOW, (x - r * 0.8, gy + r * 0.7, r * 1.6, r * 0.5))
        if geo:
            draw_snake_shadow(c, geo)
        c.set_clip(None)

        draw_items(c, items, now)
        if geo:
            target = None
            if items:
                hx, hy = geo["pts"][0]
                near = min(items, key=lambda it: (it[1] - hx) ** 2 + (it[2] - hy) ** 2)
                target = (near[1], near[2])
            draw_snake(c, geo, now, target, dead=self.state == "dying")

        draw_hud(c, self, self.blank if self.state == "start" else g)
        if self.dim > 0.02:
            art.shade.set_alpha(int(150 * self.dim))
            c.blit(art.shade, board)
        self.fx.draw(c)
        if self.state == "start":
            draw_start(c, self)
        elif self.state == "pause":
            draw_pause(c, self)
        elif self.state == "over":
            draw_game_over(c, self)

        s = self.fx.shake
        if s > 0.1:
            self.screen.fill(BG_TOP)
            ox, oy = s * math.sin(now * 71) * U, s * math.cos(now * 53) * U
            self.screen.blit(c, (int(ox), int(oy)))
        else:
            self.screen.blit(c, (0, 0))
        pygame.display.flip()

    def run(self):
        while self.running:
            dt = min(self.clock.tick(FPS) / 1000.0, 0.05)
            for event in pygame.event.get():
                self.on_event(event)
            self.update(dt)
            self.draw()
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    App().run()
