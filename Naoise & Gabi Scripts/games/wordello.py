import datetime
import json
import os
import random

import pygame

HERE = os.path.dirname(os.path.abspath(__file__))
SAVE_FILE = os.path.join(os.path.expanduser("~"), ".wordello.json")
LENGTH, TRIES = 5, 6
START = datetime.date(2022, 1, 3)
WIDTH, HEIGHT = 500, 760
TILE, GAP = 62, 6
FPS = 60

WHITE = (255, 255, 255)
TEXT = (26, 26, 27)
BORDER = (211, 214, 218)
FILLED = (135, 138, 140)
KEY = (211, 214, 218)
COLORS = {"correct": (106, 170, 100), "present": (201, 180, 88), "absent": (120, 124, 126)}
RANK = {"absent": 1, "present": 2, "correct": 3}
PRAISE = ["Geniale!", "Magnifico!", "Splendido!", "Bravo!", "Bene!", "Fiuu!"]
ROWS = ["qwertyuiop", "asdfghjkl", ["invio"] + list("zxcvbnm") + ["⌫"]]


def load_words():
    with open(os.path.join(HERE, "wordello_words.txt"), encoding="utf-8") as f:
        return sorted({w.strip().lower() for w in f if len(w.strip()) == LENGTH})


def day_index():
    return (datetime.date.today() - START).days


def evaluate(guess, answer):
    result = ["absent"] * LENGTH
    left = {}
    for i in range(LENGTH):
        if guess[i] == answer[i]:
            result[i] = "correct"
        else:
            left[answer[i]] = left.get(answer[i], 0) + 1
    for i in range(LENGTH):
        if result[i] != "correct" and left.get(guess[i]):
            result[i] = "present"
            left[guess[i]] -= 1
    return result


def read_save():
    try:
        with open(SAVE_FILE) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


class Game:
    def __init__(self, words):
        self.words = words
        self.new("daily")

    def new(self, mode):
        self.mode = mode
        saved = read_save().get(str(day_index())) if mode == "daily" else None
        if saved:
            self.answer, self.guesses, self.over = saved["answer"], saved["guesses"], saved["over"]
        else:
            self.answer = self.words[(day_index() * 7919) % len(self.words)] if mode == "daily" else random.choice(self.words)
            self.guesses, self.over = [], False
        self.current = ""
        self.message, self.message_until = "", 0
        self.reveal_start = None
        self.shake_until = 0

    def save(self):
        if self.mode != "daily":
            return
        data = {str(day_index()): {"answer": self.answer, "guesses": self.guesses, "over": self.over}}
        try:
            with open(SAVE_FILE, "w") as f:
                json.dump(data, f)
        except OSError:
            pass

    def say(self, text, ms=1500):
        self.message, self.message_until = text, pygame.time.get_ticks() + ms

    def press(self, key):
        if self.over:
            return
        if key == "invio":
            if len(self.current) < LENGTH:
                self.shake_until = pygame.time.get_ticks() + 400
                self.say("Troppo corta")
                return
            self.guesses.append(self.current)
            self.current = ""
            self.reveal_start = pygame.time.get_ticks()
            won = self.guesses[-1] == self.answer
            if won or len(self.guesses) == TRIES:
                self.over = True
                self.message, self.message_until = (PRAISE[len(self.guesses) - 1] if won else self.answer.upper()), 0
            self.save()
        elif key == "⌫":
            self.current = self.current[:-1]
        elif len(key) == 1 and key.isalpha() and len(self.current) < LENGTH:
            self.current += key

    def share_text(self):
        emoji = {"correct": "🟩", "present": "🟨", "absent": "⬜"}
        won = self.guesses and self.guesses[-1] == self.answer
        title = f"Wordello {'#' + str(day_index()) if self.mode == 'daily' else 'pratica'} {len(self.guesses) if won else 'X'}/{TRIES}"
        return title + "\n\n" + "\n".join("".join(emoji[m] for m in evaluate(g, self.answer)) for g in self.guesses)

    def key_colors(self):
        best = {}
        for g in self.guesses:
            for letter, mark in zip(g, evaluate(g, self.answer)):
                if RANK[mark] > RANK.get(best.get(letter), 0):
                    best[letter] = mark
        return best


class View:
    def __init__(self, screen):
        self.screen = screen
        self.big = pygame.font.SysFont("helveticaneue,arial", 36, bold=True)
        self.title = pygame.font.SysFont("helveticaneue,arial", 34, bold=True)
        self.small = pygame.font.SysFont("helveticaneue,arial", 18, bold=True)
        self.keys = []
        self.buttons = {}

    def text(self, font, text, color, center):
        surface = font.render(text, True, color)
        self.screen.blit(surface, surface.get_rect(center=center))

    def button(self, name, label, rect):
        pygame.draw.rect(self.screen, BORDER, rect, 1, border_radius=6)
        self.text(self.small, label, TEXT, rect.center)
        self.buttons[name] = rect

    def draw(self, game):
        now = pygame.time.get_ticks()
        self.screen.fill(WHITE)
        self.button("mode", "Oggi" if game.mode == "daily" else "Pratica", pygame.Rect(12, 12, 90, 34))
        self.button("share", "Condividi", pygame.Rect(WIDTH - 112, 12, 100, 34))
        self.text(self.title, "WORDELLO", TEXT, (WIDTH // 2, 30))
        pygame.draw.line(self.screen, BORDER, (0, 58), (WIDTH, 58))

        board_width = LENGTH * TILE + (LENGTH - 1) * GAP
        left = (WIDTH - board_width) // 2
        for r in range(TRIES):
            word = game.guesses[r] if r < len(game.guesses) else game.current if r == len(game.guesses) else ""
            marks = evaluate(word, game.answer) if r < len(game.guesses) else None
            shake = 0
            if r == len(game.guesses) and now < game.shake_until:
                shake = int(8 * ((game.shake_until - now) / 400) * (1 if (now // 50) % 2 else -1))
            for c in range(LENGTH):
                x = left + c * (TILE + GAP) + shake
                y = 80 + r * (TILE + GAP)
                height, color = TILE, None
                if marks:
                    color = marks[c]
                    if game.reveal_start is not None and r == len(game.guesses) - 1:
                        t = (now - game.reveal_start - c * 250) / 500
                        if t < 0:
                            color = None
                        elif t < 1:
                            height = max(2, int(TILE * abs(1 - 2 * t)))
                            if t < 0.5:
                                color = None
                rect = pygame.Rect(x, y + (TILE - height) // 2, TILE, height)
                if color:
                    pygame.draw.rect(self.screen, COLORS[color], rect)
                else:
                    pygame.draw.rect(self.screen, FILLED if c < len(word) else BORDER, rect, 2)
                if c < len(word) and height > TILE // 3:
                    self.text(self.big, word[c].upper(), WHITE if color else TEXT, rect.center)

        colors = game.key_colors()
        self.keys = []
        top = 500
        for i, row in enumerate(ROWS):
            weights = [1.5 if len(k) > 1 else 1 for k in row]
            unit = (WIDTH - 16 - 6 * (len(row) - 1)) / (10 if i < 2 else sum(weights))
            row_width = sum(w * unit for w in weights) + 6 * (len(row) - 1)
            x = (WIDTH - row_width) / 2
            for key, w in zip(row, weights):
                rect = pygame.Rect(int(x), top + i * 66, int(w * unit), 58)
                mark = colors.get(key)
                pygame.draw.rect(self.screen, COLORS[mark] if mark else KEY, rect, border_radius=4)
                self.text(self.small, "DEL" if key == "⌫" else key.upper(), WHITE if mark else TEXT, rect.center)
                self.keys.append((rect, key))
                x += w * unit + 6

        if game.message and (game.message_until == 0 or now < game.message_until):
            if game.message_until or game.reveal_start is None or now - game.reveal_start > LENGTH * 250 + 300:
                surface = self.small.render(game.message, True, WHITE)
                box = surface.get_rect(center=(WIDTH // 2, 30)).inflate(28, 18)
                pygame.draw.rect(self.screen, TEXT, box, border_radius=6)
                self.screen.blit(surface, surface.get_rect(center=box.center))

    def click(self, pos):
        for name, rect in self.buttons.items():
            if rect.collidepoint(pos):
                return name
        for rect, key in self.keys:
            if rect.collidepoint(pos):
                return key
        return None


def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Wordello")
    try:
        pygame.display.set_icon(pygame.image.load(os.path.join(HERE, "wordello_logo.png")))
    except (pygame.error, FileNotFoundError):
        pass
    game = Game(load_words())
    view = View(screen)
    clock = pygame.time.Clock()
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                pygame.quit()
                return
            action = None
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_RETURN, pygame.K_KP_ENTER):
                    action = "invio"
                elif event.key == pygame.K_BACKSPACE:
                    action = "⌫"
                elif event.unicode and event.unicode.isalpha() and event.unicode.isascii():
                    action = event.unicode.lower()
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                action = view.click(event.pos)
            if action == "mode":
                game.new("practice" if game.mode == "daily" else "daily")
            elif action == "share":
                if game.over:
                    print("\n" + game.share_text() + "\n")
                    game.say("Risultato stampato nel terminale")
                else:
                    game.say("Finisci prima la partita")
            elif action:
                game.press(action)
        view.draw(game)
        pygame.display.flip()
        clock.tick(FPS)


if __name__ == "__main__":
    main()
