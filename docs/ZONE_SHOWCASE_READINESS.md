# MIFF Zone Showcase Readiness

Scope: Grove 3D, Toppler Medieval, Spirit Tamer

## Summary
- Orchestration: Present across zones; Spirit overlays refactored to orchestration-driven. Dispatcher still recommended for Toppler transitions.
- UI Consistency: Shared look-and-feel improved; Spirit/Grove show input mode in HUD; unified overlay styling in progress.
- Assets: Registry valid; grove3d map uses registry tiles. Characters/portraits remain direct assets with remix-safe attribution.
- Onboarding: In-zone overlays/links present for Grove; packs live; gallery scaffold ready.

## Zone Checklists

### Grove 3D
- Orchestration
  - [ ] IntroModal
  - [x] PlayHUD (progress/inventory/input)
  - [ ] GameOverModal
  - [ ] LoreModal (via orchestration)
  - [x] 3D toggle via `?mode=3d`
- UI Consistency
  - [ ] Serif typography + tile background overlays
  - [ ] Fade transitions
  - [x] HUD progress/inventory/input indicator
- Assets
  - [x] Registry-backed map exists (`site/maps/grove3d.json`)
  - [x] Registry tags/biome valid
  - [x] No oversized/misaligned PNGs
- Onboarding
  - [x] Onboarding overlay with remix links
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
  - [x] Dialogue via JSON plan (schema present; integration staged)
  - [x] Orchestration-driven overlays (Intro, GameOver, Lore)
  - [x] Beat replay timer via orchestration param
- UI Consistency
  - [ ] Unified overlay styles
  - [x] Progress bar + input mode in HUD
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
  - [x] Gallery submission page

## Sprint Launch Notes
- Finalize unified overlay styling and dispatcher for Toppler/Grove.
- Add onboarding overlays to Spirit/Toppler and shared attribution footer.
- Promote remix starter packs and gallery submission flow in overlays.