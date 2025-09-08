# MIFF Zone Showcase Readiness

Scope: Grove 3D, Toppler Medieval, Spirit Tamer

## Summary
- Orchestration: Present across zones, though some overlays/dialogue remain imperative. Dispatcher recommended.
- UI Consistency: Shared look-and-feel mostly aligned; standard overlay styles not fully unified yet.
- Assets: Registry valid; grove3d map uses registry tiles. Characters/portraits remain direct assets with remix-safe attribution.
- Onboarding: Docs in place; add in-zone onboarding overlays/links.

## Zone Checklists

### Grove 3D
- Orchestration
  - [ ] IntroModal
  - [ ] PlayHUD (progress/inventory/input)
  - [ ] GameOverModal
  - [ ] LoreModal (via orchestration)
  - [x] 3D toggle via `?mode=3d`
- UI Consistency
  - [ ] Serif typography + tile background overlays
  - [ ] Fade transitions
  - [ ] HUD progress/inventory/input indicator
- Assets
  - [x] Registry-backed map exists (`site/maps/grove3d.json`)
  - [x] Registry tags/biome valid
  - [x] No oversized/misaligned PNGs
- Onboarding
  - [ ] Onboarding overlay with remix links
  - [ ] Attribution footer

### Toppler Medieval
- Orchestration
  - [x] Intro via start menu (orchestration JSON)
  - [ ] Dispatcher for transitions (currently imperative)
  - [x] LoreModal (credits)
  - [x] GameOver overlay
- UI Consistency
  - [ ] Unified overlay styles (serif, tile background, fade)
  - [ ] PlayHUD with input mode
- Assets
  - [x] Uses remix-safe set; medieval theme
  - [x] No oversized/misaligned PNGs in audit
- Onboarding
  - [ ] Onboarding overlay with remix links
  - [x] Contributor docs present in repo

### Spirit Tamer
- Orchestration
  - [ ] Dialogue via JSON tree (schema present, sample added)
  - [ ] Orchestration-driven overlays
  - [x] Beat replay timer via orchestration param
- UI Consistency
  - [ ] Unified overlay styles
  - [x] Progress bar HUD present
  - [ ] Input mode indicator
- Assets
  - [x] No oversized/misaligned PNGs in audit
- Onboarding
  - [ ] Onboarding overlay
  - [ ] Attribution footer

## Contributor Readiness
- Docs
  - [x] MAP_BUILDER_README.md
  - [x] MAP_BUILDER_ONBOARDING.md
  - [x] TOPPLER_CONTRIBUTING.md
- Tools
  - [x] Map Builder UI
  - [x] Remix Validator
  - [x] Coverage Dashboard scaffold

## Next Steps (Sprint)
- Implement overlay dispatcher reading orchestration transitions (all zones)
- Add unified overlay components (IntroModal, PlayHUD, GameOverModal, LoreModal) with serif/tile/fade styling
- Add onboarding overlays per zone linking to docs and lore archive
- Display input mode indicator in PlayHUD (shared util)
- Expand Spirit Tamer to JSON dialogue and quest/state orchestration