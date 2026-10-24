# maps-server demo

A web page to try [maps-server](../../NaoiseGabi/maps-server/) in a browser, with nothing to install:

**https://pyroourson.github.io/claudecode/ClaudeScripts/maps-demo/**

Click a start and a destination in Monaco. The page finds the earliest arrival, walking and taking buses, and draws it on the map with the times of each part.

## What is real and what is not

| Part | Where it comes from |
| --- | --- |
| Route search | maps-server's own code (`src/route.rs`), compiled to WebAssembly. The same search, options and answer format as `POST /`. |
| Walking paths | maps-server's own map loader rules (`src/graph.rs`), run on the OpenStreetMap data of Monaco. |
| Bus lines and stops | OpenStreetMap: Monaco's lines 1, 2, 4, 5 and 6, in both directions, with their stops in order. |
| Bus times | **Made up for this demo.** A bus every 10 minutes from 06:00 to 22:00 Monaco time, at about 18 km/h plus 20 s at each stop. The real server gets its times from transit plugins such as the SNCF one, which need a computer and cannot run in a browser. |

Everything runs in the browser: nothing is sent to a server, except requests for the map pictures to `tile.openstreetmap.org`.

The "Request and answer (JSON)" section under the route shows the body the page sends and the answer it gets, in the same shape as the real server's `POST /`. The answer has two extras for the page: `stop_names` and `stats`.

## Files

| File | What it is |
| --- | --- |
| `index.html`, `demo.js`, `demo.css` | The page. It also uses `../hello-page/common.css` for the site's look. |
| `engine.wasm` | The routing engine, built from `engine/`. |
| `engine/` | A small Rust crate that compiles maps-server's `graph.rs` and `route.rs` unchanged, plus the demo's bus timetable (`transit.rs`), request handling (`api.rs`) and the functions the page calls (`ffi.rs`). |
| `monaco.osm.pbf` | The map: OpenStreetMap data for Monaco, © OpenStreetMap contributors, ODbL. |
| `leaflet/` | Leaflet 1.9.4, which draws the map, under its BSD-2-Clause licence. |
| `build.py` | Rebuilds `engine.wasm`. |

## Try it on your computer

Browsers do not let the page load its files straight from a folder, so serve the folder first. From the `claudecode` folder:

```bash
python3 -m http.server
```

Then open http://localhost:8000/ClaudeScripts/maps-demo/

## Rebuild the engine

Needed only after changing `engine/` or maps-server's `src/graph.rs` or `src/route.rs`. You need Rust (https://rustup.rs) and, once, `rustup target add wasm32-unknown-unknown`.

```bash
python3 ClaudeScripts/maps-demo/build.py --test
```

`--test` first runs the engine's tests on the Monaco map (`cargo test` in `engine/`). Then commit the new `engine.wasm`.

## Limits

- Only Monaco. Another region needs its `.osm.pbf` file in place of `monaco.osm.pbf`; the bus lines are read from it, if it has route relations.
- Bus times are not real, and there are no trains: Monaco's only station is on a line whose other stops are outside the map.
- The page answers `"format": "json"` only, and has no `GET /health` or `GET /metrics`: those belong to the real server.

## Licences

The routing code is maps-server by Naoise McG, under AGPL-3.0, and so is this demo, which includes it. Its source is this folder and [`NaoiseGabi/maps-server/`](../../NaoiseGabi/maps-server/). Map data © OpenStreetMap contributors, ODbL. Leaflet © Volodymyr Agafonkin and CloudMade, BSD-2-Clause.
