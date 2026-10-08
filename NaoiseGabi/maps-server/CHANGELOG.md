# Changelog

All notable changes to maps-server. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Changed

- The Overpass container is created from `MAPS_OVERPASS_IMAGE`, default `wiktorn/overpass-api:v0.7.62.9`, instead of `wiktorn/overpass-api:latest`. The Nix wrapper loads exactly that image once and exports the variable. An existing container built from another image is recreated, and its `overpass_db` volume is kept, so no re-import happens.
- Overpass is published on `127.0.0.1:12345` only, instead of every network interface. An existing container published elsewhere is recreated the same way.
- The flake no longer lists `armv7l-linux`: the pinned Overpass image has no 32-bit ARM build. `aarch64-linux` and `aarch64-darwin` get their own image hash.
