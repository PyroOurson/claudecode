# buphagus (maps-server)

## What it is

A routing engine designed with public transport in mind. It finds the earliest arrival between OpenStreetMap nodes by combining walking, on a graph built from `.osm.pbf` extracts, with vehicles. Each public transport provider has a plugin that talks to that provider's API; the engine asks the plugins for departures while it searches.

A route request lists two or more OSM node IDs (a footway node, a station node, or any node on a walkable way) and a departure time. The answer is a list of segments: walks, and one segment per vehicle leg, with times.

## Requirements

* Nix with flakes enabled (`nix.settings.experimental-features = ["nix-command" "flakes"]`).
* Docker, with your user in the `docker` group (`users.users.<user>.extraGroups = ["docker"]`) and the daemon running. The server runs a local [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) in a container called `overpass_api`; plugins use it to match their stops to OSM nodes.
* One of the systems the flake builds for: `x86_64-linux`, `aarch64-linux` or `aarch64-darwin`. The pinned Overpass image has no 32-bit ARM build.
* Memory for the walking graph. It keeps about 36 bytes per walkable node: 1.3 MB for Andorra (37,522 walkable nodes), 0.5 MB for north Bayreuth (13,341). As a rough guide, plan for about the size of your `.osm.pbf` files in RAM for the graph, up to three times that while it loads, and a few MB per CPU core while it decodes large files. Overpass, in Docker, needs its own memory and disk on top of that.
* SSH access only for private plugins: every input below is public and fetched over HTTPS. If you add a private plugin through a `git+ssh://` URL, configure an SSH key for that host.

## First run

The first start imports your map files into Overpass. Nothing else can answer until that finishes, and it is by far the slowest step: seconds for a city extract, typically an hour or more for a large region, and several hours for a whole country, depending on your disk. The server prints its progress every minute and gives up after `MAPS_OVERPASS_READY_TIMEOUT_S` (6 hours by default), or as soon as the container stops, showing its last log lines.

The import lives in the Docker volume `overpass_db` and is reused on later starts. It is redone only when the list of map files, their size or their modification time changes. If an import is interrupted, the next start throws the half-imported database away and starts again.

While Overpass and the plugins start, the server already listens and answers `503`.

## Setup

### Flake configuration (`flake.nix`)

Save the following configuration as `flake.nix` in your project folder:

```
{
    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
        flake-utils.url = "github:numtide/flake-utils";

        maps-server.url = "gitlab:buphagidae/maps-server";

        sncf-plugin.url = "git+https://gitlab.com/buphagidae/plugins/sncf-plugin.git";
        dublin-bus-bus-eireann-go-ahead-plugin.url = "git+https://gitlab.com/buphagidae/plugins/tfi-plugins/dublin-bus-bus-eireann-go-ahead-plugin.git";
        cam-plugin.url = "git+https://gitlab.com/buphagidae/plugins/camonaco-plugin.git";
        tri-rail-plugin.url = "git+https://gitlab.com/vitras21-group/trirail-plugin.git";
    };

    outputs = { self, nixpkgs, maps-server, sncf-plugin, dublin-bus-bus-eireann-go-ahead-plugin, cam-plugin, tri-rail-plugin, flake-utils }:
        flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (system:
            let
                pkgs = nixpkgs.legacyPackages.${system};
            in {
                packages.default = maps-server.packages.${system}.default;

                apps = {
                    default = {
                        type = "app";
                        program = "${pkgs.writeShellScriptBin "maps-server-configured" ''
                            export OSM_PBF_FILES="provence-alpes-cote-d-azur-260718.osm.pbf,florida-260819.osm.pbf"
                            exec ${maps-server.apps.${system}.default.program} "$@"
                        ''}/bin/maps-server-configured";
                    };

                    plugins = {
                        sncf-plugin = sncf-plugin.apps.${system}.default;
                        cam-plugin-bus = cam-plugin.apps.${system}.default;
                    };
                };
            }
        );
}
```

Git inputs need the `git+https://` form: plain `https://…git` is fetched as an archive and Nix rejects it with "Unrecognized archive format".

### Steps

1. Create an `assets` folder next to `flake.nix` and download the `.osm.pbf` files into it, for example from [Geofabrik](https://download.geofabrik.de/). The names must match `OSM_PBF_FILES`; the server lists any missing file and stops before touching Docker.
2. Add the API keys your plugins need. Each plugin's README says which environment variables it reads.
3. Run the server from that folder:
```
nix run
```
The wrapper loads the pinned Overpass image (`wiktorn/overpass-api:v0.7.62.9`) into Docker the first time, then starts the server. `Ctrl-C` or `SIGTERM` stops the plugins and the Overpass container.

`examples/requests.sh` sends a set of requests with their expected status codes: `examples/requests.sh http://127.0.0.1:6767`.

## Configuration

Everything is set with environment variables. Each one defaults to the behaviour described here.

| Variable | Default | Meaning |
| --- | --- | --- |
| `OSM_PBF_FILES` | `provence-alpes-cote-d-azur-260718.osm.pbf` | Comma-separated map files in `./assets`. `OSM_PBF_FILE_NAME` is read if this is unset. |
| `MAPS_BIND` | `0.0.0.0:6767` | Address and port the HTTP server listens on. |
| `MAPS_MAX_BODY_BYTES` | `65536` | Largest request body; larger ones get `413`. |
| `MAPS_MAX_REQUIRED_NODES` | `25` | Most entries allowed in `required_nodes`. |
| `MAPS_MAX_SPEED_KMH` | `300` | Speed used by the exact search's estimate. Keep it above the fastest vehicle's average speed between stations; `0` turns the estimate off (plain Dijkstra). |
| `MAPS_MAX_EXPANDED` | `5000000` | Most search states expanded per request. |
| `MAPS_MAX_PLUGIN_CALLS` | `1000` | Most plugin calls per request. |
| `MAPS_HORIZON_H` | `24` | States arriving more than this many hours after the start of their leg are not expanded. Fractions are allowed. |
| `MAPS_CACHE_TTL_S` | `120` | How long a plugin's answer for a station and a 5-minute window is reused. `0` turns the cache off. |
| `MAPS_PLUGIN_TIMEOUT_S` | `30` | How long to wait for a plugin's answer to `explore`. |
| `MAPS_PLUGIN_STARTUP_TIMEOUT_S` | `900` | How long to wait for `mode`, `attribution` and `available`, at startup and after a restart. |
| `MAPS_OVERPASS_IMAGE` | `wiktorn/overpass-api:v0.7.62.9` | Docker image for Overpass. The Nix wrapper sets it and loads the image; set it yourself to use another image. |
| `MAPS_OVERPASS_READY_TIMEOUT_S` | `21600` | How long to wait for the Overpass import before giving up. |
| `MAPS_SOURCE_URL` | `https://gitlab.com/buphagidae/maps-server` | Sent in the `Source-Code` header. Change it if you run modified code: the AGPL asks you to offer your version's source to its users. |

Overpass is published on `127.0.0.1:12345` only.

## HTTP API

### `POST /`

The body is a JSON object. Unknown fields are ignored.

| Field | Type | Unit and default | Meaning |
| --- | --- | --- | --- |
| `required_nodes` | array of integers | required, 2 to `MAPS_MAX_REQUIRED_NODES` entries | OSM node IDs to visit in order: walkable nodes, station nodes or station entrances. |
| `time` | string | UTC, default now | Departure time, as `YYYYmmddTHHMMSS`, `YYYY-mm-ddTHH:MM:SS`, or RFC 3339 with an offset (`2026-08-08T15:10:00+02:00`). |
| `walking_speed` | number | km/s, `0.0003` to `0.01`, default `0.00138` (about 5 km/h) | Walking speed. |
| `fast` | boolean | default `false` | `true` uses the walking-speed estimate: about half the work, but it can miss a faster vehicle (see below). |
| `heuristic` | boolean or integer | legacy | `1`/`true` means exact, `0`/`false` means fast. `fast` wins when both are sent. |

**Search modes.** The default, exact search always returns the earliest arrival. `"fast": true` estimates the remaining time at walking speed, which explores far fewer nodes but treats vehicles as no faster than walking, so it can return a 36-minute walk when a 20-minute train exists. On Andorra, a 9 h 26 min walk expands 29,319 states in exact mode and 15,763 in fast mode, with the same answer.

A successful answer is `200`:

```json
{
  "route": [
    {"mode": "walking", "line": null, "nodes": [1, 3, 100],
     "departure_time": "2026-08-08T12:00:00Z", "arrival_time": "2026-08-08T12:03:37.555Z"},
    {"mode": "train", "line": {"id": "TER", "preferred_colour": "#0055A5"}, "nodes": [100, 200],
     "departure_time": "2026-08-08T12:14:37Z", "arrival_time": "2026-08-08T12:19:37Z"}
  ],
  "arrival_time": "2026-08-08T12:19:37Z"
}
```

* `mode` is `walking` or the plugin's mode.
* `line` is `{"id", "preferred_colour"}` (either may be `null`) or `null`.
* `nodes` lists the nodes from the first to the last.
* Times are RFC 3339 in UTC, to the millisecond.
* Consecutive walking edges form one segment, and each vehicle leg is its own segment, so a change between vehicles is always visible.

### Errors

Every error has a JSON body `{"error": "<message>"}`, sometimes with more fields.

| Status | When |
| --- | --- |
| `400` | Invalid JSON, a body that is not an object, `required_nodes` missing or malformed or with too few or too many entries, a `time` that does not parse, a `walking_speed` out of range, or a bad `fast`/`heuristic`. The message names the problem. |
| `404` | `{"error": "no route", "failed_leg": [from, to]}`: no route for that pair of consecutive nodes, or one of them is unknown. `{"error": "no route within limits", "limit": "max_expanded" \| "max_plugin_calls" \| "horizon_h"}`: a search limit stopped the search. Unknown paths get `404` too. |
| `405` | A method other than `POST` or `OPTIONS` on `/`. |
| `413` | A body larger than `MAPS_MAX_BODY_BYTES`. |
| `500` | An internal error. The connection is never dropped without an answer. |
| `503` | The server is still starting: Overpass or the plugins are not ready yet. |

### Headers

Every response carries:

* `Access-Control-Allow-Origin: *` and `Access-Control-Expose-Headers: Attribution, Source-Code`, so pages on any origin can call the server and read both headers.
* `Source-Code: "<MAPS_SOURCE_URL>"`.

A route also carries `Attribution: "<text>"`, URL-encoded: the OpenStreetMap credit and the data and plugin credits of every plugin.

`OPTIONS /` answers `204` with `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type` and `Access-Control-Max-Age: 86400`.

## Plugin protocol

Plugins are long-running processes started with `nix run .#plugins.<name>`, one per attribute in your flake's `apps.<system>.plugins`. They talk over stdin and stdout with newline-delimited JSON: one request per line, one reply per line, and stdout flushed after each reply. Anything a plugin writes to stderr is logged with its name. An example plugin is https://gitlab.com/buphagidae/plugins/sncf-plugin. For Overpass queries, use the local instance at `http://localhost:12345/api/interpreter`.

### Call order

1. `mode`, then `attribution`. These must answer without any slow initialisation.
2. `available`. Do the slow initialisation (downloading timetables, matching stops) here; it gets `MAPS_PLUGIN_STARTUP_TIMEOUT_S`.
3. Any number of `explore` calls. Each gets `MAPS_PLUGIN_TIMEOUT_S`.

A plugin is only asked about stations it listed in `available`. If it misses a deadline, exits, or prints something that is not JSON, it is killed and restarted, and `mode`, `attribution` and `available` are sent again. Calls to several plugins happen in parallel; each plugin receives one request at a time.

### Requests

Every request is `{"action": "<name>", "data": <value>}`.

* `{"action": "mode", "data": []}`
* `{"action": "attribution", "data": []}`
* `{"action": "available", "data": []}`
* `{"action": "explore", "data": {"station": 123456, "datetime": "20260808T120000"}}`
  * `station` (integer): OSM ID of the station, one of the keys from `available`.
  * `datetime` (string, `YYYYmmddTHHMMSS`, UTC): start of the window. The server rounds it down to a 5-minute mark so answers can be cached, and drops departures before the time it needs.
  * `duration` (integer, seconds, optional): the length of the window. The server does not send it today, so pick a sensible default for your network (the SNCF plugin uses 7200).

### Replies

Success is `{"response": <value>}`:

* `mode`: a string, for example `{"response": "train"}`.
* `attribution`: `{"response": {"data_owner": "[SNCF](https://sncf.fr/)", "data_license": "[ODbL](https://opendatacommons.org/licenses/odbl/1.0/)", "plugin_owner": "Naoise McG", "plugin_license": "[BSD 3-clause](https://gitlab.com/buphagidae/plugins/sncf-plugin/-/raw/main/LICENSE)"}}`.
* `available`: station IDs mapped to the walkable node IDs of their entrances, `{"response": {"123456": [789123, 456789]}}`. Keys are strings because JSON keys always are; send the entrances as integers (numeric strings are accepted). A station whose own node lies on a footway can have an empty list.
* `explore`: every journey that leaves the station in the window, `{"response": [{"to": 654321, "cost": 1800, "time": "20260808T121500", "line": {"id": "4", "preferred_colour": "#FF0000", "ways": [123456]}}]}`.
  * `to` (integer): the station the journey reaches. Numeric strings are accepted.
  * `cost` (integer, seconds, 0 or more): travel time.
  * `time` (string, `YYYYmmddTHHMMSS`, UTC): departure time.
  * `line` (object, optional): `id` (string or number) and `preferred_colour` (hex colour such as `#FF0000`) are shown in routes; `ways` (OSM way IDs) is not used yet.

  List one entry for **every later stop** of each vehicle: a train leaving at 12:15 and calling at three more stations gives three entries with the same `time` and different `to` and `cost`. The server needs this to let travellers get off anywhere. Journeys with a negative or non-integer `cost`, an unreadable `time` or a `to` that is not an ID are skipped and logged. Plugins are the slowest part of a search, so use as few API requests as possible.

On failure, reply `{"error": "<message>"}` and keep running. An error reply does not restart the plugin.

## Attribution and licence

maps-server is free software under the GNU Affero General Public License v3.0 (`LICENSE`). If you run a modified version for other people, the AGPL requires you to offer them its source; point `MAPS_SOURCE_URL` at it.

Map data © OpenStreetMap contributors, under the [ODbL](https://opendatacommons.org/licenses/odbl/1-0/). The walking graph and every node ID come from OpenStreetMap, and the `Attribution` header of every route says so. Timetable and realtime data come from each plugin's data owner under the licence that plugin reports, and are credited in the same header.
