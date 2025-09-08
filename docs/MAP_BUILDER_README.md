# MIFF Map Builder

Remix-safe map building for Grove 3D and Toppler Medieval using the isometric block pack. Supports orchestration-driven placement, contributor editing, and persistent layouts.

## Tile Registry

- Path: `site/maps/tile_manifest.json`
- Fields per tile:
  - `id`: stable identifier (string)
  - `src`: relative path to asset (string)
  - `tags`: string[] (e.g., walkable, blocking, forest, castle, loot, trigger)
  - `biome`: string[] (e.g., grove, castle)
  - `attribution`: source licensing, must be remix-safe

Example:
```json
{
  "id": "mystic_stone",
  "src": "../../assets/Isometric Blocks/isometric_0091.png",
  "tags": ["trigger", "lore", "quest"],
  "biome": ["grove"],
  "attribution": "KayKit / CC0"
}
```

## Map Grid Schema

- Base schema example: `site/maps/schema.map.json`
- Zones stored under `site/maps/<zone>.json`
- Structure:
```json
{
  "version": 1,
  "zone": "grove3d",
  "size": { "width": 16, "height": 12, "tile": { "w": 64, "h": 32 } },
  "layers": {
    "terrain": { "map": [["grass_01"]] },
    "props": { "map": [[null]] },
    "npcs": { "map": [] }
  },
  "orchestration": {
    "spawn": { "x": 1, "y": 1 },
    "quests": [ { "trigger": "step_on", "tile": "mystic_stone", "action": "start_quest", "id": "grove_intro" } ],
    "paths": [ { "npc": "skeleton_guard", "waypoints": [{"x":5,"y":5}] } ],
    "lore": [ { "tile": "mystic_stone", "overlay": "LoreModal" } ]
  }
}
```

## Orchestration Integration

- Use `orchestration.spawn` to position player spawn in engine bridge.
- Use `orchestration.quests` to bind tile-based triggers (e.g., step_on mystic_stone → start_quest).
- Use `orchestration.paths` for NPC waypoint patrols.
- Use `orchestration.lore` to open overlays when interacting with designated tiles.

## Contributor Map Builder

- UI: `site/map-builder.html`
  - Select a tile from the left panel, click on the isometric grid to place.
  - First click sets `terrain`, second click sets `props` at same cell.
  - Set spawn and one quest trigger (example) in the right panel.
  - Export JSON to download a remixable map.

## Persistence & Remix Safety

- Store maps under `site/maps/<zone>.json` in the repo.
- Validate tile IDs against `tile_manifest.json` before shipping.
- Only CC0/GPL/public-domain assets; ensure `attribution` field is present.

## Examples

- Registry: `site/maps/tile_manifest.json`
- Schema: `site/maps/schema.map.json`
- Sample zone: `site/maps/grove3d.json`

## Roadmap

- Add live validation against registry when exporting.
- Add multi-layer brushes and eraser tool.
- Add import/edit for existing zone maps.
- Integrate dispatcher to auto-bind `orchestration.*` into runtime.