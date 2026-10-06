import random

import pygame

CELL = 20
COLUMNS, ROWS = 30, 30
WIDTH, HEIGHT = COLUMNS * CELL, ROWS * CELL
BACKGROUND = (18, 18, 18)
HEAD = (0, 255, 120)
BODY = (0, 200, 0)
TEXT = (230, 230, 230)

KEYS = {
    pygame.K_UP: (0, -1), pygame.K_w: (0, -1), pygame.K_z: (0, -1),
    pygame.K_DOWN: (0, 1), pygame.K_s: (0, 1),
    pygame.K_LEFT: (-1, 0), pygame.K_a: (-1, 0), pygame.K_q: (-1, 0),
    pygame.K_RIGHT: (1, 0), pygame.K_d: (1, 0),
}

FRUITS = [
    {"color": (230, 40, 40), "growth": 1, "points": 1, "weight": 80},
    {"color": (60, 120, 255), "growth": 2, "points": 3, "weight": 15},
    {"color": (255, 200, 0), "growth": 0, "points": 5, "weight": 5},
]


class Game:
    def __init__(self):
        self.reset()

    def reset(self):
        x, y = COLUMNS // 2, ROWS // 2
        self.snake = [(x, y + i) for i in range(5)]
        self.direction = (0, -1)
        self.queued = []
        self.pending_growth = 0
        self.score = 0
        self.alive = True
        self.place_fruit()

    def place_fruit(self):
        free = [(x, y) for x in range(COLUMNS) for y in range(ROWS) if (x, y) not in set(self.snake)]
        self.fruit_pos = random.choice(free)
        self.fruit = random.choices(FRUITS, weights=[f["weight"] for f in FRUITS])[0]

    def turn(self, direction):
        last = self.queued[-1] if self.queued else self.direction
        if direction != last and direction != (-last[0], -last[1]) and len(self.queued) < 2:
            self.queued.append(direction)

    def update(self):
        if self.queued:
            self.direction = self.queued.pop(0)
        head = (self.snake[0][0] + self.direction[0], self.snake[0][1] + self.direction[1])
        tail_moves = self.pending_growth == 0
        body = self.snake[:-1] if tail_moves else self.snake
        if not (0 <= head[0] < COLUMNS and 0 <= head[1] < ROWS) or head in body:
            self.alive = False
            return
        self.snake.insert(0, head)
        if tail_moves:
            self.snake.pop()
        else:
            self.pending_growth -= 1
        if head == self.fruit_pos:
            self.score += self.fruit["points"]
            self.pending_growth += self.fruit["growth"]
            self.place_fruit()

    def draw(self, screen, font):
        screen.fill(BACKGROUND)
        fx, fy = self.fruit_pos
        pygame.draw.rect(screen, self.fruit["color"], (fx * CELL, fy * CELL, CELL, CELL), border_radius=CELL // 2)
        for i, (x, y) in enumerate(self.snake):
            pygame.draw.rect(screen, HEAD if i == 0 else BODY, (x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2), border_radius=4)
        screen.blit(font.render(f"Score {self.score}", True, TEXT), (10, 8))
        if not self.alive:
            message = font.render("Game over - press Space to restart", True, TEXT)
            screen.blit(message, message.get_rect(center=(WIDTH // 2, HEIGHT // 2)))


def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Snake")
    font = pygame.font.SysFont(None, 32)
    clock = pygame.time.Clock()
    game = Game()
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                pygame.quit()
                return
            if event.type == pygame.KEYDOWN:
                if event.key in KEYS and game.alive:
                    game.turn(KEYS[event.key])
                elif event.key == pygame.K_SPACE and not game.alive:
                    game.reset()
        if game.alive:
            game.update()
        game.draw(screen, font)
        pygame.display.flip()
        clock.tick(8 + len(game.snake) // 4)


if __name__ == "__main__":
    main()
