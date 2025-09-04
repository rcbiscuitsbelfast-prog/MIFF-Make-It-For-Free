# Contributor Onboarding – Grove 3D

## Extend Grove 3D
- Enable 3D: `site/zones/witcher_grove/index.html?mode=3d`
- Scene module: `site/zones/witcher_grove/3d/bootstrap.js`
- Orchestration: `site/zones/witcher_grove/orchestration.json`

## Add GLTF Assets Safely
- Place GLTFs under `assets/New Assets/`
- Reference via orchestration `props[]` with fields:
  - `model` (e.g., `shield_round.gltf`)
  - `x`, `z` world coordinates (meters)
  - optional `scale` (default 0.02), `rotationY` (radians)
- Fallbacks ensure primitives render if files are missing.

## 2D/3D Sync and Mobile Input
- Inventory persists via `localStorage` key `grove_state` (shared across 2D/3D)
- 2D: click chest to gain items; 3D: move near chest to trigger quest completion
- Desktop: WASD; Mobile: on-screen controls (auto-added)

## Testing Checklist
- 2D mode renders and updates inventory
- 3D mode loads (GLTFs optional), props placed by orchestration
- Quest UI updates on chest interaction
- LocalStorage sync: items visible in both modes

## Remix-Safe Principles
- Do not embed closed assets; reference GLTFs by path
- Prefer orchestration-driven placement and triggers
- Keep fallback primitives for resilience