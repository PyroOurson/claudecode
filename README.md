# Projects

My old projects, cleaned up, fixed and put in one place. Everything runs on Windows, macOS and Linux. Nothing depends on hard-coded paths from one computer.

Live site: https://pyroourson.github.io/claudecode/

## Web (no install, open in a browser)

| Project | Link | What it does |
| --- | --- | --- |
| Hello page | [open](https://pyroourson.github.io/claudecode/) | White page with an animated "hello". |
| Wordello | [open](https://pyroourson.github.io/claudecode/web/wordello/) | Italian Wordle using vocabulary from Italian class. There's a new word every day plus an unlimited practice mode. It saves your progress, has a dark mode, and lets you share your result. |
| Voronoi Stippling | [open](https://pyroourson.github.io/claudecode/web/voronoi-stippling/) | Upload any picture and it is redrawn as dots using weighted Voronoi relaxation. You can set the number of dots, dot size, contrast and colours, and download a PNG. |
| Cooldown Timer | [open](https://pyroourson.github.io/claudecode/web/cooldown-timer/) | A countdown for any cooldown or quota reset. It survives page reloads and sends a browser notification when the time is up. |

## Python

Requires Python 3.10+. Every script supports `--help`. Scripts that draw something accept `--save file.png` to write an image instead of opening a window.

```bash
pip install -r math-art/requirements.txt
```

### `math-art/`: fractals, simulations and maths

| Script | Example | What it does |
| --- | --- | --- |
| `chaos_game.py` | `python chaos_game.py -n 5` | Chaos game fractals for any polygon or custom points. It picks the best jump ratio automatically, supports the optional "no repeat", "avoid jump" and "only jump" rules, and prints the fractal dimension. |
| `chaos_game_3d.py` | `python chaos_game_3d.py menger --spin` | 3D chaos game: Menger sponge, Sierpinski tetrahedron or octahedron. |
| `chaos_game_interactive.py` | `python chaos_game_interactive.py` | Drag the points and move the sliders to watch the fractal change live. |
| `lsystem.py` | `python lsystem.py plant -i 6` | L-system fractals: Koch, snowflake, dragon, twindragon, terdragon, plant, Hilbert, Sierpinski and Gosper. You can also give your own axiom and rules. |
| `barnsley_fern.py` | `python barnsley_fern.py` | The Barnsley fern. |
| `dragon_curve.py` | `python dragon_curve.py -a 90 -i 16` | Paper-folding dragon curve with any fold angle. |
| `apollonian_gasket.py` | `python apollonian_gasket.py` | Apollonian gasket built with the Descartes circle theorem. |
| `fractal_tree.py` | `python fractal_tree.py -l 20 -r 30` | Recursive tree with separate left and right angles. |
| `elementary_ca.py` | `python elementary_ca.py 30` | Wolfram elementary cellular automata (rules 0 to 255). |
| `game_of_life.py` | `python game_of_life.py --image me.jpg` | Conway's Game of Life. It can start from random cells, a text file of 0s and 1s, or any image, and can export a GIF. |
| `attractors.py` | `python attractors.py lorenz --spin` | Lorenz and Rössler strange attractors, with adjustable a, b and c. |
| `self_avoiding_walk.py` | `python self_avoiding_walk.py --walks 20` | Random self-avoiding walks. |
| `maze.py` | `python maze.py -W 40 -H 25` | Maze generator using depth-first search. |
| `fourier_drawing.py` | `python fourier_drawing.py` | Draw a curve with the mouse and watch a Fourier series approximate it. Up and down change the number of terms. |
| `image_to_ascii.py` | `python image_to_ascii.py photo.jpg -w 120` | Converts any image to ASCII art. |
| `box_plot.py` | `python box_plot.py --group A 1 2 3 --group B 2 4 8` | Box plots with min, Q1, median, Q3 and max marked. It also reads CSV files. |
| `number_tools.py` | `python number_tools.py fib 1000` | Fast Fibonacci, multiplicative persistence (including record holders) and a fast prime test. |

### `seaweed-model/`: invasive seaweed spread

```bash
pip install -r seaweed-model/requirements.txt
python seaweed-model/model.py --years 20 --start 25 54 --gif spread.gif
```

This is a cellular model of seaweed spreading month by month along the Marseille coast. It uses a real depth map (`marseille_depth.tif`) and the monthly sea temperatures. You can use any GeoTIFF elevation map with `--map`, or `--map synthetic` for an imaginary island.

### `snake/`

```bash
pip install pygame
python snake/snake.py
```

Snake with arrow keys, WASD or ZQSD. It has three kinds of fruit (red +1, blue +3, gold +5), a score, speed that increases as you grow, and Space to restart.

### `wordle-solver/`

```bash
python wordle-solver/solver.py
```

It suggests a guess. You type the colours you got back (`0` grey, `1` yellow, `2` green), and it picks the next guess that splits the remaining words best. Use `--words` with another list and `--length` for other languages or word lengths.
