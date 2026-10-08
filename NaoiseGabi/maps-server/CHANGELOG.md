# Changelog

All notable changes to maps-server. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

These change what clients or plugins see. Read them before upgrading.

- **The default search is exact.** It always returns the earliest arrival, using a safe estimate (straight-line distance at `MAPS_MAX_SPEED_KMH`, default 300 km/h; `0` turns the estimate off). The old default used the walking-speed estimate, which could return a 36-minute walk when a 20-minute train existed. Send `"fast": true` for the old, quicker search. On Andorra a 9.4-hour walk expands 29,319 states in exact mode and 15,763 in fast mode, with the same answer.
- `heuristic` keeps its meaning (`1`/`true`: estimate off, exact; `0`/`false`: estimate on, fast) and now accepts booleans; `true` used to be read as `0`. `fast` wins when both are sent.
- **New status codes.** Every error has a JSON body `{"error": "<message>"}`:
  - `400` for invalid JSON, a body that is not an object, a missing or malformed `required_nodes` (fewer than 2 or more than `MAPS_MAX_REQUIRED_NODES` entries, or not integers), a `time` that does not parse (it used to become "now" silently), a `walking_speed` outside 0.0003 to 0.01 km/s (0 used to crash the handler), or a bad `fast`/`heuristic`;
  - `404` with `{"error": "no route", "failed_leg": [from, to]}` instead of `200` with an empty route, and `404` with `{"error": "no route within limits", "limit": ...}` when a search limit stops the search;
  - `404` for unknown paths and `405` for other methods on `/`;
  - `413` for bodies over `MAPS_MAX_BODY_BYTES`;
  - `500` for internal errors, which used to drop the connection;
  - `503` while Overpass and the plugins start.
- **Overpass is published on `127.0.0.1:12345` only**, instead of every network interface.
- The server listens as soon as the walking graph is built and answers `503` until it is ready. It used to listen only once everything was up.
- The `Source-Code` header points to `MAPS_SOURCE_URL`, default `https://gitlab.com/buphagidae/maps-server`. It used to point to `https://gitlab.com/buphagidae/buphagus`, which anonymous users cannot see; under the AGPL this header is how network users are offered the source. It is now on every response, errors included, together with `Access-Control-Allow-Origin` and `Access-Control-Expose-Headers`.
- The `Attribution` header starts with "Map data © OpenStreetMap contributors, ODbL." and credits only OpenStreetMap and the plugins the route used, instead of every plugin.
- Every vehicle leg is its own segment in `route`; only consecutive walking edges are merged. Two vehicles in a row with the same line ID, or with none, used to be merged into one segment, which hid the change and the wait.
- Connections are kept alive between requests instead of being closed after each response. Header names are sent in lower case, which HTTP treats the same, and the `204` preflight answer no longer carries `Content-Length: 0`, which RFC 9110 forbids on `204`.
- **Plugins** are only asked about stations they listed in `available` (they used to be asked about every station), and every plugin that listed a station is asked (the search used to stop at the first plugin with departures).
- Plugins are asked for the start of a 5-minute window (the requested time rounded down) instead of the exact second, so their answers can be cached; departures before the requested time are still dropped, and so are departures earlier than arrival plus the 60-second minimum transfer.
- A node that is neither on a walkable way, nor tagged `public_transport`, `railway` or `entrance`, nor a plugin station is unknown to the server: a request naming it gets `404` at once instead of a search.
- Walkability: `highway=busway`, `bus_guideway`, `razed`, `disused` and `no` are no longer walkable (unless `foot=yes` or similar); `indoor=corridor` without a `highway` tag is walkable, which is how many station interiors are mapped; `trunk` and `trunk_link` are walkable when they have a sidewalk (`sidewalk=both|left|right|yes` or `sidewalk:<side>=yes`).
- The Overpass container is created from `MAPS_OVERPASS_IMAGE`, default `wiktorn/overpass-api:v0.7.62.9`, instead of `wiktorn/overpass-api:latest`.
- The `pbf_hash` label that decides whether the map files changed is FNV-1a over each file's name, size and modification time (`fnv1a-` plus 16 hex digits), which no Rust upgrade can change. A container with the old label is accepted when the old hash still matches, and is recreated once with the new label, keeping its database.
- The flake no longer lists `armv7l-linux`: the pinned Overpass image has no 32-bit ARM build.
- Startup errors are printed as plain text and the process exits with status 1.

### Added

- `maps-server check-plugin <flake attribute>` (or `check-plugin -- <command> [args]`) runs a plugin through `mode`, `attribution`, `available` and three `explore` calls, reports problems and warnings, and exits with status 1 on problems. JSON Schemas for every request and reply are in `docs/plugin-protocol/`.
- Routing options, all optional and defaulting to the old behaviour: `min_transfer_s` (overrides `MAPS_MIN_TRANSFER_S`, default 60), `max_walk_m` (longest single walk), `transfer_penalty_s` (added per change when comparing routes), `exclude_modes` (plugins of those modes are not asked) and `avoid_steps` (no `highway=steps`; the graph stores a steps flag per edge).
- `"waypoints": [[lat, lon], ...]` instead of `required_nodes`: each point snaps to the nearest walkable node (an R-tree built on first use), and points further than `max_snap_m` (default 500) get `400`. The answer then carries `"snapped": [{"input", "node", "distance_m"}]`.
- Every segment carries `"coordinates": [[lat, lon], ...]`; a station without a position of its own uses its first entrance.
- `"format": "geojson"` returns a FeatureCollection with one LineString per segment and the segment fields as properties.
- Routes carry `"attribution": [{"plugin", "data_owner", "data_license", "plugin_owner", "plugin_license"}]`, sorted by `plugin`: OpenStreetMap plus the plugins the route used.
- `GET /health`: `{"status": "ok" | "degraded", "ready", "uptime_s", "graph": {"nodes", "edges"}, "overpass": "up" | "down", "plugins": [{"name", "mode", "alive", "calls", "errors", "avg_ms"}]}`, with `200` when everything is up and `503` otherwise.
- Configuration variables, each defaulting to the old behaviour: `MAPS_BIND`, `MAPS_MIN_TRANSFER_S`, `MAPS_MAX_BODY_BYTES`, `MAPS_MAX_REQUIRED_NODES`, `MAPS_MAX_SPEED_KMH`, `MAPS_MAX_EXPANDED`, `MAPS_MAX_PLUGIN_CALLS`, `MAPS_HORIZON_H`, `MAPS_CACHE_TTL_S`, `MAPS_PLUGIN_TIMEOUT_S`, `MAPS_PLUGIN_STARTUP_TIMEOUT_S`, `MAPS_OVERPASS_IMAGE`, `MAPS_OVERPASS_READY_TIMEOUT_S`, `MAPS_SOURCE_URL`. `OSM_PBF_FILES` and `OSM_PBF_FILE_NAME` still work.
- `"fast": true` in requests, for the walking-estimate search.
- `time` also accepts `YYYY-mm-ddTHH:MM:SS` (UTC) and RFC 3339 with an offset.
- Search limits per request: `MAPS_MAX_EXPANDED` states (default 5,000,000), `MAPS_MAX_PLUGIN_CALLS` plugin calls (default 1000), and no state more than `MAPS_HORIZON_H` hours (default 24) after the start of its leg. An unreachable destination used to walk the whole region and call the plugins at every station it reached.
- A cache of plugin explorations shared by all requests, keyed by station, plugin and 5-minute window, for `MAPS_CACHE_TTL_S` (default 120 s; `0` turns it off). Failed explorations are not cached. A repeated request makes no plugin calls.
- Plugin timeouts: `MAPS_PLUGIN_TIMEOUT_S` (default 30 s) for `explore`, and `MAPS_PLUGIN_STARTUP_TIMEOUT_S` (default 900 s) for `mode`, `attribution` and `available`, where plugins load their data.
- A plugin that times out, exits or sends something other than JSON is killed and restarted in the background, and `mode`, `attribution` and `available` are replayed; retries back off from 1 s to 5 minutes. Routes are computed without it meanwhile. An `{"error": ...}` reply does not restart it.
- Plugin stderr is logged line by line, prefixed with `[plugin <name>]`.
- The server stops on SIGTERM as well as Ctrl-C, and kills the plugin processes before stopping Overpass.
- Waiting for Overpass gives up after `MAPS_OVERPASS_READY_TIMEOUT_S` (default 21600 s, six hours), or as soon as the container exits, and shows the container's last 20 log lines. Progress is printed every minute.
- `examples/requests.sh`: sample requests with their expected status codes.
- Tests that need neither Docker, Nix nor the network (`cargo test`), and a GitLab CI pipeline: fmt, clippy, tests, a Rust 1.88 check, and a manual `nix build` job.

### Fixed

- A body that arrives in a second TCP packet, or a request over 2 KB, no longer crashes the handler: requests are read in full by axum instead of with a single 2 KB `read`.
- Station, entrance and `to` IDs from plugins are accepted as integers or numeric strings; string IDs used to be dropped silently. A numeric line `id` is kept, as a string.
- Plugin journeys with a negative or non-integer `cost`, an unreadable `time` or a `to` that is not an ID are skipped and logged, once per plugin call. A negative cost used to produce a journey that arrived before it left.
- A train-to-bus change works when the train plugin also has departures from the change station.
- A change between two vehicles of the same plugin (TER to TGV) is possible. It used to work only when the station node lay on a footway. This costs one more plugin call per vehicle arrival.
- A stuck plugin no longer freezes the server: each plugin has its own lock and a timeout, and plugins are called in parallel.
- The Overpass image is found on a fresh machine. The Nix wrapper loads the pinned image once instead of on every run and exports `MAPS_OVERPASS_IMAGE`; the code used to ask for `:latest`, which Docker never pulled.
- An existing Overpass container built from another image or published on another address is recreated, and its `overpass_db` volume and its "import finished" marker (`/db/init_done`, which the image keeps outside the volume) are carried over, so no re-import happens.
- A stopped Overpass container whose first import never finished is removed with its volume and the import starts again. Restarting it used to re-run the import on top of the old files, which fails.
- The walking graph is built at startup. Missing map files are listed by name before Docker is touched, and an unreadable file stops startup with a clear message instead of making every request panic.
- The plugin list from `nix eval` is parsed as JSON.
- `aarch64-linux` and `aarch64-darwin` get the right Overpass image hash, and the development shell evaluates on them.
- `nix build` runs the tests with Python available.
- The walking graph keeps coordinates only for the nodes it needs, in compact arrays: on Andorra it takes 1.3 MB instead of about 12 MB, peak memory while loading drops by two thirds, and loading takes about 40 ms instead of 56 ms. Large files are decoded on several cores.
- The README's example flake uses `git+https://` inputs, which Nix accepts, and the README describes the real plugin call order and integer IDs.
