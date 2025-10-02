# RenderWorld Hub (MIFF-native)

This folder contains the MIFF-native RenderWorld Hub: a modular, mobile-friendly 3D interface showcasing MIFF worlds.

## Files
- `renderworld-hub.js`: Web bridge and core hub logic (Three.js scene bootstrap integrated)
- `index.html`: Hub landing page (loads styles, hub, and helper modules)
- `style.css`: Extra UI (mobile controls, portal buttons)
- `touch-controls.js`: `MobileIntegration` for joystick and action buttons
- `asset-loader.js`: Loads MIFF-native textures and GLTF models
- `portal-map.js`: Link targets for demo worlds
- `renderworld-config.json`: Camera/lights/NPC metadata

## Contributing
- Keep assets MIFF-native (use content under `docs/assets/` or generate in-repo)
- Avoid external models/textures. Prefer procedural or existing repo assets
- Test on mobile and desktop; verify joystick and buttons work
- Use JetBrains Mono and MIFF dark theme for consistency

## Roadmap Sync
Implements the technical roadmap for a 3D hub: mobile-first controls, isometric tile floor, NPCs, and portal links to Sampler worlds.

## Persistent Game Loop
RenderWorld now supports a persistent loop driven by pure state:
- Player movement and interaction via `PlayerStatePure`
- Joint-based animation via `JointAnimPure`
- Autosave using `SavePure` on `visibilitychange`

CLI utilities:
```
# Advance loop with movement
bash -lc "echo '{\"move\":{\"x\":1,\"y\":0},\"dt\":100}' > /workspace/session/input.json"
npx tsx /workspace/render/gameLoop.ts

# Interact and save
bash -lc "echo '{\"interact\":\"chest_01\",\"dt\":16}' > /workspace/session/input.json"
npx tsx /workspace/render/gameLoop.ts
npx tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=save
npx tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=load
```