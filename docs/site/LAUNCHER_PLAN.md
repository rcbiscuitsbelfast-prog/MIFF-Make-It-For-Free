# Sampler Launcher Plan

Goal: Replace placeholder entry with a launcher that embeds a Godot HTML5 export and lets users start scenarios with chosen seeds.

## Features
- Scenario picker: load `TutorialScenarioPure`, `SpiritTamerDemoPure` by file path.
- Seed input; run/deterministic replay via `RenderReplayPure`.
- DebugOverlay toggle.
- Asset prewarm via `AssetManifestPure`.

## Tasks
- [ ] Create `site/src/launcher.tsx` and `site/src/index.html` wiring
- [ ] Embed Godot HTML5 export (docs/godot/export/web)
- [ ] JS bridge: forward RenderPayload frames to Godot
- [ ] Minimal styles and docs