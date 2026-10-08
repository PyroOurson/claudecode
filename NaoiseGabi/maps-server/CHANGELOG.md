# Changelog

All notable changes to maps-server. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- **The default search is exact.** It always returns the earliest arrival, using a safe estimate (straight-line distance at `MAPS_MAX_SPEED_KMH`, default 300 km/h; `0` turns the estimate off). The old default used the walking-speed estimate, which could return a 36-minute walk when a 20-minute train existed. Send `"fast": true` to get the old, quicker search. On Andorra a 9.4-hour walk expands 29,319 states in exact mode and 15,763 in fast mode, with the same answer.
- `heuristic` accepts `true`/`false` as well as integers, with its old meaning: `1` or `true` turns the walking estimate off (exact), `0` or `false` turns it on (fast). `true` used to be read as `0`. `fast` wins when both are sent. Any other value gets `400`.

- The HTTP layer is axum instead of a single 2 KB `read`. Requests are read in full, so a body that arrives in a second TCP packet, or a request over 2 KB, no longer crashes the handler.
- Request bodies over `MAPS_MAX_BODY_BYTES` (default 65536) get `413` with a JSON `{"error": ...}` body.
- The listen address is `MAPS_BIND`, default `0.0.0.0:6767`.
- Only the path `/` is served: other paths get `404` and other methods on `/` get `405`. `OPTIONS /` is answered as before.
- Connections are kept alive between requests instead of being closed after each response. Send `Connection: close` to get the old behaviour.
- Header names are sent in lower case, which HTTP treats the same, and the `204` preflight answer no longer carries `Content-Length: 0`, which RFC 9110 forbids on `204`.
- Every response, errors included, carries `Access-Control-Allow-Origin`, `Access-Control-Expose-Headers` and `Source-Code`.
- A failure while computing a route answers `500` instead of dropping the connection.
- Bad requests get `400` with `{"error": "<message>"}` instead of a dropped connection or a silent default: invalid JSON, a body that is not an object, `required_nodes` missing, not an array of integers, shorter than 2 or longer than `MAPS_MAX_REQUIRED_NODES` (default 25), a `time` that does not parse, and a `walking_speed` outside 0.0003 to 0.01 km/s.
- `time` accepts `YYYYmmddTHHMMSS`, `YYYY-mm-ddTHH:MM:SS` (both UTC) and RFC 3339 with an offset. A malformed time used to become "now" silently.
- When a leg has no route the answer is `404` with `{"error": "no route", "failed_leg": [from, to]}` instead of `200` with an empty route. A node that is neither in the walking graph nor a station gets this answer at once, without searching.
- Unknown paths get `404` and other methods `405`, both with a JSON error.
- Station, entrance and `to` IDs from plugins are accepted as integers or numeric strings. String IDs used to be dropped silently.
- Plugin journeys whose `cost` is negative or not an integer, whose `time` does not parse, or whose `to` is not an ID are skipped and logged with the plugin's name, once per plugin call. A negative cost used to produce a journey that arrived before it left.
- A line `id` sent as a number is kept, as a string.
- Every plugin that listed a station in `available` is asked about it, and their departures are merged. The search used to stop at the first plugin with departures, so a train-to-bus change failed when the train plugin also left that station.
- A plugin is only asked about stations it listed in `available`. It used to be asked about every station.
- Every vehicle leg is its own segment in `route`; only consecutive walking edges are merged. Two vehicles in a row with the same line ID, or with none, used to be merged into one segment, which hid the change and the wait.

- The Overpass container is created from `MAPS_OVERPASS_IMAGE`, default `wiktorn/overpass-api:v0.7.62.9`, instead of `wiktorn/overpass-api:latest`. The Nix wrapper loads exactly that image once and exports the variable. An existing container built from another image is recreated, and its `overpass_db` volume is kept, so no re-import happens.
- Overpass is published on `127.0.0.1:12345` only, instead of every network interface. An existing container published elsewhere is recreated the same way.
- The flake no longer lists `armv7l-linux`: the pinned Overpass image has no 32-bit ARM build. `aarch64-linux` and `aarch64-darwin` get their own image hash.
