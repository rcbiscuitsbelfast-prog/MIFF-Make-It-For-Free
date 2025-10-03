# Starter Pack for Grove Zone Contributors

This pack includes sample assets and JSON to help you build remix-safe maps with the MIFF Map Builder.

Contents:
- `mystic_stone.meta.json` — example tile metadata with remix-safe tags
- `grove3d.sample.json` — example map JSON with orchestration hooks

Quick Start:
1) Review `../../maps/tile_manifest.json` for tile IDs and tags.
2) Open `/site/map-builder.html` in a local server (`python3 -m http.server 8000 --directory /workspace`).
3) Place tiles on the grid and define spawn and quest triggers.
4) Export JSON and save under `site/maps/<your_zone>.json`.
5) Run the remix validator to ensure tile IDs and tags are valid.