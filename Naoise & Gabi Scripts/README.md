# Naoise & Gabi Scripts

Everything here is Python. Go into a folder and run a script with `python`.

## Setup (once)

```bash
python -m pip install --user -r requirements.txt
```

## `games/`

| Script | Run | What it does |
| --- | --- | --- |
| `snake.py` | `python snake.py` | Snake with arrow keys, WASD or ZQSD. It has three kinds of fruit (red +1, blue +3, gold +5), a score, speed that increases as you grow, Space to restart and Esc to quit. |
| `wordello.py` | `python wordello.py` | Italian Wordle with vocabulary from Italian class. There is a new word every day, saved between runs, plus a practice mode (the "Oggi" button). You can type or click the on-screen keyboard. "Condividi" prints your result grid in the terminal. |

## `solvers/`

| Script | Run | What it does |
| --- | --- | --- |
| `wordle_solver.py` | `python wordle_solver.py` | Wordle helper. Type the colours you got back (`0` grey, `1` yellow, `2` green) and it picks the guess that splits the remaining words best. `--words` and `--length` let you use other word lists or word lengths. |

## `art/`

| Script | Run | What it does |
| --- | --- | --- |
| `voronoi_stippling.py` | `python voronoi_stippling.py photo.jpg` | Redraws any picture as dots using weighted Voronoi stippling, animated live. Options include `--density`, `--contrast`, `--min-size`, `--max-size`, `--color`, `--background` and `--save out.png`. Without a picture it uses a demo image. |

Add `--help` to any script to see all its options.
