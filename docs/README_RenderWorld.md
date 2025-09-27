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