# Grove 3D – Remix-Safe 3D Zone Guide

## Enable 3D Mode
- Open Witcher Grove with `?mode=3d` to load the Three.js scene:
  - `site/zones/witcher_grove/index.html?mode=3d`
- 2D debug mode remains the default for quick inspection and onboarding.

## Architecture Overview
- Renderer and scene: `site/zones/witcher_grove/3d/bootstrap.js` (ES module)
- Orchestration (3D): `site/zones/witcher_grove/orchestration.json`
- 2D fallback: `site/zones/witcher_grove/index.js` (canvas), auto-loaded when `mode!=3d`
- Mobile: WASD on desktop; touch buttons on mobile
- Camera: smooth follow, adjustable in `followCamera()`

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

## Quests and Triggers
- A simple quest zone trigger checks player proximity to the chest
- Update UI overlay via `uiOverlay` when quest completes
- Extend with more triggers in orchestration (`triggers`) and handle in `checkQuestZones()`

## Inventory and Persistence
- Shared localStorage key: `grove_state`
  - `inventory`: array of strings
  - `muted`: boolean for music
- 2D and 3D modes use the same key to stay in sync

## Adding New Props
1. Drop GLTF under `assets/New Assets/`
2. Add entry to `orchestration.json` `props[]` with `model`, `x`, `z`, and optional `scale`, `rotationY`
3. Reload with `?mode=3d` to verify placement

## Remix Safety
- No proprietary code/assets baked into scene; GLTFs are referenced by path
- Fallbacks ensure scene loads without specific models
- Contributors can safely add/replace props via orchestration only

## Testing
- Desktop: WASD; Mobile: on-screen buttons
- Toggle music with `M` in 2D mode; 3D mode uses browser media controls
- Validate both `mode=3d` and default 2D paths