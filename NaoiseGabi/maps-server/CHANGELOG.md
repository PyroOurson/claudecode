# Changelog

All notable changes to maps-server. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- The HTTP layer is axum instead of a single 2 KB `read`. Requests are read in full, so a body that arrives in a second TCP packet, or a request over 2 KB, no longer crashes the handler.
- Request bodies over `MAPS_MAX_BODY_BYTES` (default 65536) get `413` with a JSON `{"error": ...}` body.
- The listen address is `MAPS_BIND`, default `0.0.0.0:6767`.
- Only the path `/` is served: other paths get `404` and other methods on `/` get `405`. `OPTIONS /` is answered as before.
- Connections are kept alive between requests instead of being closed after each response. Send `Connection: close` to get the old behaviour.
- Header names are sent in lower case, which HTTP treats the same, and the `204` preflight answer no longer carries `Content-Length: 0`, which RFC 9110 forbids on `204`.
- Every response, errors included, carries `Access-Control-Allow-Origin`, `Access-Control-Expose-Headers` and `Source-Code`.
- A failure while computing a route answers `500` instead of dropping the connection.

- The Overpass container is created from `MAPS_OVERPASS_IMAGE`, default `wiktorn/overpass-api:v0.7.62.9`, instead of `wiktorn/overpass-api:latest`. The Nix wrapper loads exactly that image once and exports the variable. An existing container built from another image is recreated, and its `overpass_db` volume is kept, so no re-import happens.
- Overpass is published on `127.0.0.1:12345` only, instead of every network interface. An existing container published elsewhere is recreated the same way.
- The flake no longer lists `armv7l-linux`: the pinned Overpass image has no 32-bit ARM build. `aarch64-linux` and `aarch64-darwin` get their own image hash.
