# Projects

My old projects, cleaned up, fixed and put in one place. Everything runs on Windows, macOS and Linux. Nothing depends on hard-coded paths from one computer.

Hello page: https://pyroourson.github.io/claudecode/

## Web (no install, open in a browser)

| Project | Link | What it does |
| --- | --- | --- |
| Hello page | [open](https://pyroourson.github.io/claudecode/) | White page with an animated "hello". |
| Wordello | [open](https://pyroourson.github.io/claudecode/Naoise%20%26%20Gabi%20Scripts/web/wordello/) | Italian Wordle using vocabulary from Italian class. There's a new word every day plus an unlimited practice mode. It saves your progress, has a dark mode, and lets you share your result. |
| Voronoi Stippling | [open](https://pyroourson.github.io/claudecode/Naoise%20%26%20Gabi%20Scripts/web/voronoi-stippling/) | Upload any picture and it is redrawn as dots using weighted Voronoi relaxation. You can set the number of dots, dot size, contrast and colours, and download a PNG. |
| Cooldown Timer | [open](https://pyroourson.github.io/claudecode/Naoise%20%26%20Gabi%20Scripts/web/cooldown-timer/) | A countdown for any cooldown or quota reset. It survives page reloads and sends a browser notification when the time is up. |

## Python

Requires Python 3.10+. Install everything once:

```bash
pip install -r "Naoise & Gabi Scripts/python/requirements.txt"
```

Every script supports `--help`. Scripts that draw something accept `--save file.png` to write an image instead of opening a window. Run each script from inside its own folder.

### `python/fractals/`

| Script | Example | What it does |
| --- | --- | --- |
| `chaos_game_polygon.py` | `python chaos_game_polygon.py -n 5` | Chaos game fractals for any polygon or custom points. It picks the best jump ratio automatically, supports the optional "no repeat", "avoid jump" and "only jump" rules, and prints the fractal dimension. |
| `chaos_game_3d_shapes.py` | `python chaos_game_3d_shapes.py menger --spin` | 3D chaos game: Menger sponge, Sierpinski tetrahedron or octahedron. |
| `chaos_game_interactive.py` | `python chaos_game_interactive.py` | Drag the points and move the sliders to watch the fractal change live. |
| `lsystem_curves.py` | `python lsystem_curves.py plant -i 6` | L-system fractals: Koch, snowflake, dragon, twindragon, terdragon, plant, Hilbert, Sierpinski and Gosper. You can also give your own axiom and rules. |
| `barnsley_fern.py` | `python barnsley_fern.py` | The Barnsley fern. |
| `dragon_curve.py` | `python dragon_curve.py -a 90 -i 16` | Paper-folding dragon curve with any fold angle. |
| `apollonian_gasket.py` | `python apollonian_gasket.py` | Apollonian gasket built with the Descartes circle theorem. |
| `recursive_tree.py` | `python recursive_tree.py -l 20 -r 30` | Recursive tree with separate left and right angles. |

### `python/simulations/`

| Script | Example | What it does |
| --- | --- | --- |
| `cellular_automaton_1d.py` | `python cellular_automaton_1d.py 30` | Wolfram elementary cellular automata (rules 0 to 255). |
| `game_of_life.py` | `python game_of_life.py --image me.jpg` | Conway's Game of Life. It can start from random cells, a text file of 0s and 1s, or any image, and can export a GIF. |
| `strange_attractors.py` | `python strange_attractors.py lorenz --spin` | Lorenz and Rössler strange attractors, with adjustable a, b and c. Runs about 10 times faster again if `numba` is installed (`pip install numba`). |
| `self_avoiding_walk.py` | `python self_avoiding_walk.py --walks 20` | Random self-avoiding walks. |
| `seaweed_spread_model.py` | `python seaweed_spread_model.py --years 20 --start 25 54 --gif spread.gif` | Seaweed spreading month by month along the Marseille coast, using a real depth map (`marseille_depth.tif`) and monthly sea temperatures. Use `--map` with any GeoTIFF, or `--map synthetic` for an imaginary island. |
| `seaweed_depth_map.py` | `python seaweed_depth_map.py marseille_depth.tif` | Shows the depth map that the seaweed model uses. |

### `python/tools/`

| Script | Example | What it does |
| --- | --- | --- |
| `maze_generator.py` | `python maze_generator.py -W 40 -H 25` | Maze generator using depth-first search. |
| `image_to_ascii.py` | `python image_to_ascii.py photo.jpg -w 120` | Converts any image to ASCII art. |
| `fourier_curve_drawing.py` | `python fourier_curve_drawing.py` | Draw a curve with the mouse and watch a Fourier series approximate it. Up and down change the number of terms. |
| `box_plot_summary.py` | `python box_plot_summary.py --group A 1 2 3 --group B 2 4 8` | Box plots with min, Q1, median, Q3 and max marked. It also reads CSV files. |
| `number_theory.py` | `python number_theory.py fib 1000` | Fast Fibonacci, multiplicative persistence (including record holders) and a fast prime test. |

### `python/games/`

| Script | Example | What it does |
| --- | --- | --- |
| `snake.py` | `python snake.py` | Snake with arrow keys, WASD or ZQSD. It has three kinds of fruit (red +1, blue +3, gold +5), a score, speed that increases as you grow, and Space to restart. |
| `wordle_solver.py` | `python wordle_solver.py` | Wordle helper. Type the colours you got back (`0` grey, `1` yellow, `2` green) and it picks the guess that splits the remaining words best. Use `--words` and `--length` for other languages or word lengths. |

`plot_output.py` in each folder is a small shared helper for saving or showing figures.
