# Grove 3D – Remix-Safe 3D Zone Guide

## Enable 3D Mode
- Open Witcher Grove with `?mode=3d` to load the Three.js scene:
  - `site/zones/witcher_grove/index.html?mode=3d`
- 2D debug mode remains the default for quick inspection and onboarding.

## Architecture Overview
- Renderer and scene: `site/zones/witcher_grove/3d/bootstrap.js` (ES module)
- Orchestration (3D): `site/zones/witcher_grove/orchestration.json`
- 2D fallback: `site/zones/witcher_grove/index.js` (canvas), auto-loaded when `mode!=3d`
- Mobile: WASD on desktop; touch gestures on mobile (pinch/drag)
- Camera: smooth follow, centered on spawn, responsive resize

## Orchestration → 3D Scene
- Props array defines what is placed in the scene:
```
{
  "props": [
    { "type": "tree", "x": -3, "z": -4 },
    { "type": "house", "x": 4, "z": 3 },
    { "type": "chest", "x": 2, "z": -2 },
    { "type": "prop", "model": "shield_round.gltf", "x": -1, "z": 1, "scale": 0.02, "rotationY": 1.2 }
  ]
}
```
- Model-driven props:
  - `model`: GLTF filename under `assets/New Assets/`
  - `scale`: scalar applied to the root node (default 0.02)
  - `rotationY`: optional rotation in radians
- Fallbacks:
  - Unknown or missing models gracefully fall back to simple primitives
  - `chest` without `model` uses `mug_full.gltf` when available

### NPC Pathing
```
{
  "npcPaths": [
    {
      "id": "hunter_patrol",
      "model": "Rogue.glb",
      "scale": 0.02,
      "clipIdle": 0,
      "clipWalk": 0,
      "waypoints": [ { "x": -2, "z": -1, "waitMs": 800 }, { "x": 1, "z": -3, "waitMs": 600 } ]
    },
    {
      "id": "scout_loop",
      "model": "Knight.glb",
      "scale": 0.02,
      "clipIdle": 0,
      "clipWalk": 0,
      "waypoints": [ { "x": 5, "z": -1, "waitMs": 700 }, { "x": 6.5, "z": 2.5, "waitMs": 700 } ]
    }
  ]
}
```

### Quest Zones and Story Hooks
```
{
  "questZones": [ { "id": "chest_reward", "x": 2, "z": -2, "radius": 1.2, "journal": "You discover a chest.", "reward": "Herb" } ],
  "story": [ { "t": 1500, "text": "A whisper rides the wind..." } ]
}
```

## Quests and Triggers
- Quest 1: proximity to the chest completes and grants Herb
- Quest 2: after the chest, visit the house, then the oak tree to receive the Oak Relic
- UI overlay updates on completion; journal entries persist (modal overlay)

## Inventory and Persistence
- Shared localStorage key: `grove_state`
  - `inventory`: array of strings
  - `muted`: boolean for music
- 2D and 3D modes use the same key to stay in sync

## Camera, Gestures, and Fullscreen
- Desktop wheel to zoom (clamped), smooth camera follow
- Touch pinch to zoom; one-finger drag to pan
- Long-press to open the main menu; double-tap to request fullscreen
- Start button also requests fullscreen
- Window resize updates renderer size and camera aspect

## Tiles and Modular Map
- Loader path: `assets/Isometric Blocks/tile_manifest.json`
- Manifest format accepts either `{ "tiles": [...] }` or array; entries use:
  - `{ "src": "grass_01.png", "x": 0, "y": 0, "rotationY": 0, "scale": 1 }`
  - `x` maps to world X; `y` maps to world Z; optional `alt` maps to world Y (height)
- Each entry becomes a plane rotated flat (isometric-up), with transparent PNG support
- No legacy fallback terrain is used if the manifest is missing
- Console confirms: `Grove3D Loaded! N isometric tiles from manifest.`

## Options Menu (showDevUI)
- In-game modal: `Start` and `Options`
- Options include fullscreen toggle, sound toggle, difficulty selector
- Trigger via menu button, long-press gesture, or call `showDevUI()`

## Performance
- Pixel ratio is capped to reduce overdraw on mobile devices
- Prefer low-poly GLTFs and modest texture sizes
- Consider frustum culling and merging static meshes for larger scenes

## Remix Safety
- No proprietary code/assets baked into scene; GLTFs are referenced by path
- Fallbacks ensure scene loads without specific models
- Contributors can safely add/replace props via orchestration only

## Testing
- Desktop: WASD; Mobile: pinch/drag
- Toggle music with `M` in 2D mode; 3D mode uses browser media controls
- Validate both `mode=3d` and default 2D paths