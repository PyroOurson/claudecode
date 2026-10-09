# NaoiseGabi

Everything here is Python 3.9+, except `maps-server/`. Go into a folder and run a script with `python`. Add `--help` to any script to see all its options.

## Setup (once)

```bash
python -m pip install --user -r requirements.txt
```

## `games/`

| Script | Run | What it does |
| --- | --- | --- |
| `snake.py` | `python snake.py` | Snake Deluxe: smooth movement, particles, synthesized sounds, golden apples (+5) and slow-motion crystals, a demo snake on the start screen and a saved high score. Arrows, WASD or ZQSD to move, Space or Enter to start, P pause, F full screen, M sound, Esc quit. It pauses by itself if you switch to another window. |
| `wordello.py` | `python wordello.py` | Italian Wordle with vocabulary from Italian class. There is a new word every day, saved between runs, plus a practice mode (the "Oggi" button). Type or click the on-screen keyboard. Shows games played, win rate and streak. "Condividi" copies your result grid. After a game, Enter starts a new practice word. |

## `solvers/`

| Script | Run | What it does |
| --- | --- | --- |
| `wordle_solver.py` | `python wordle_solver.py` | Gets today's answer straight from the New York Times, shows the path the solver would take to find it, copies the answer and opens Wordle in your browser. `--step` reveals one row at a time, `--date 2025-01-01` for another day, `--play` for the helper mode where you type the colours you got. If the NYT can't be reached, it switches to helper mode by itself. |
| `connections_answers.py` | `python connections_answers.py` | Gets today's NYT Connections groups and reveals them one at a time from easiest (yellow) to hardest (purple), so you can use it as hints. Opens Connections in your browser. `--all` shows everything at once, `--date` for another day. |

## `art/`

| Script | Run | What it does |
| --- | --- | --- |
| `voronoi_stippling.py` | `python voronoi_stippling.py` | Opens a file picker, then redraws the picture as dots using weighted Voronoi stippling, animated live, and saves the result next to the picture as `name_stippled.png`. You can also give a path directly, or use `--demo`. Options: `--density`, `--contrast`, `--min-size`, `--max-size`, `--color`, `--background`, `--save`, `--no-window`. |

## `maps-server/`

buphagus (maps-server), a public-transport routing engine written in Rust and run with Nix and Docker; it is not a Python script. Everything about it, from setup to the HTTP API and the plugin protocol, is in [`maps-server/README.md`](maps-server/README.md). What changed is in [`maps-server/CHANGELOG.md`](maps-server/CHANGELOG.md).
