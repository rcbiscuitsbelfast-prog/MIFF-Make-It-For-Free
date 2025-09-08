# Map Builder Onboarding (MIFF)

Welcome! This guide walks you through adding tiles, building a zone map, defining orchestration triggers, and exporting/remixing safely using the MIFF Map Builder.

## 1) Add New Tiles to the Registry

- File: `site/maps/tile_manifest.json`
- Each tile definition must be remix-safe and include tags.

Example entry:
```json
{
  "id": "mystic_stone",
  "src": "../../assets/Isometric Blocks/isometric_0091.png",
  "tags": ["trigger", "lore", "quest"],
  "biome": ["grove"],
  "attribution": "KayKit / CC0"
}
```
Steps:
- Pick a unique `id` (lowercase, underscores).
- Point `src` to an existing CC0/GPL asset under `assets/`.
- Add descriptive `tags` (e.g., walkable, blocking, trigger, loot, forest, castle).
- Set `biome` categories and add `attribution`.
- Commit the registry change.

## 2) Build a Zone Map

- Open `site/map-builder.html` in a local server (e.g., `python3 -m http.server 8000 --directory /workspace`).
- Select a tile from the left panel; click on the isometric grid to place.
  - First click places on `terrain` layer; second click places on `props` layer in the same cell.
- Adjust map width/height at the top of the grid panel.

Tips:
- Use `grass_*` for base terrain and `path_stone` for paths.
- Use `castle_wall` or other structure tiles to block movement.

## 3) Define Orchestration Triggers

In the right panel:
- Set `Spawn X/Y` for player spawn.
- Choose a `Quest Trigger Tile` (e.g., `mystic_stone`).
- Choose an action:
  - `start_quest`: starts a quest on trigger
  - `show_lore`: opens a lore modal overlay

You can also define paths or lore in JSON later:
```json
{
  "orchestration": {
    "spawn": { "x": 1, "y": 1 },
    "quests": [ { "trigger": "step_on", "tile": "mystic_stone", "action": "start_quest", "id": "grove_intro" } ],
    "paths": [ { "npc": "skeleton_guard", "waypoints": [ { "x": 5, "y": 5 }, { "x": 8, "y": 6 } ] } ],
    "lore": [ { "tile": "mystic_stone", "overlay": "LoreModal", "id": "lore_ancient_isle" } ]
  }
}
```

## 4) Export and Remix Safely

- Click `Export JSON` to download your map.
- Save it under `site/maps/<your_zone>.json` in the repo.
- Run the validator (below) to check IDs and tags.
- Keep assets and tiles remix-safe (CC0/GPL/public domain only).

## 5) Validate Remix Safety

Use the validator script to check your map against the registry:
```bash
node scripts/map_remix_validator.js --map site/maps/grove3d.json --registry site/maps/tile_manifest.json
```
It will:
- Verify that all tile IDs exist in the registry
- Ensure tiles referenced by orchestration triggers exist
- Flag tiles with missing or empty `tags`

## 6) Starter Pack

See `site/contrib/map-builder-pack/` for:
- Sample tile metadata (`mystic_stone`)
- Sample map JSON (`grove3d.json`)
- README with contributor instructions and remix notes

## 7) Lore Overlay Integration

- To show lore when stepping on a tile, add an entry in `orchestration.lore` with `overlay: "LoreModal"` and an `id`.
- Style: serif headings, subtle parchment background; re-use Grove tiles for decorative borders.
- For NPC-triggered lore, add an NPC path node with a lore trigger at a waypoint and open the same `LoreModal` with appropriate content.