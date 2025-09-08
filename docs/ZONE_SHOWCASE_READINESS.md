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
  - [x] IntroModal (dispatcher)
  - [x] PlayHUD (progress/inventory/input)
  - [x] GameOverModal (dispatcher)
  - [x] LoreModal (dispatcher)
  - [x] 3D toggle via `?mode=3d`
- UI Consistency
  - [x] Serif typography + tile background overlays
  - [x] Fade transitions
  - [x] HUD progress/inventory/input indicator
- Assets
  - [x] Registry-backed map exists (`site/maps/grove3d.json`)
  - [x] Registry tags/biome valid
  - [x] No oversized/misaligned PNGs
- Onboarding
  - [x] Onboarding overlay with remix links
  - [ ] Attribution footer

Screenshots:
- `tests/showcase_grove_intro.png`
- `tests/showcase_grove_lore.png`
- `tests/showcase_grove_gameover.png`

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

Reset status:
- Grove 3D reset to minimal scene (2×2 tiles + character) and dispatcher main menu.
- Screenshot: `tests/showcase_grove_minimal.png`
- Removed prior quest/overlay/trigger logic from orchestration and scene.

Renderer fix (camera/sprite/tiles):
- Character scaled to 64×64 with bob animation; camera follows and keeps center.
- Joystick anchored bottom-left; tiles centered with iso placement.
- Screenshot: `tests/showcase_grove_render_fixed.png`.

Enhancements:
- Input mode detection displayed in HUD (auto-updates on Keyboard/Touch/Gamepad).
- Preload HUD shows loading progress and fades into scene.
- Character variant selector in Intro (Adventurer/Mage/Rogue/Knight) with remix-safe assets.
- Screenshots: `tests/showcase_grove_input_mode.png`, `tests/showcase_grove_preload_hud.png`, `tests/showcase_grove_variant_selector.png`.

Grove immersion upgrade:
- Parallax background and tile elevation cues implemented.
- Chest interaction (herb pickup) and campfire ambient glow added.
- NPC near campfire triggers Lore overlay with serif/fade styling.
- Draggable joystick for touch/mouse; HUD shows "Touch (Joystick)" when active.
- Remix button added in GameOverModal.
- Screenshots: `tests/showcase_grove_joystick.png`, `tests/showcase_grove_interaction.png`, `tests/showcase_grove_npc_dialogue.png`, `tests/showcase_grove_scene_depth.png`, `tests/showcase_grove_remix_ui.png`.

Grove alignment:
- Dispatcher overlays unified (Intro/PlayHUD/GameOver/Lore), joystick added, and HUD shows input mode.
- Remix UI linked from GameOver modal; contributor credits overlay available via dispatcher.
- Screenshots: `tests/showcase_grove_joystick.png`, `tests/showcase_grove_input_mode.png`, `tests/showcase_grove_remix_ui.png`.

Grove asset module:
- Asset definitions (sprites/tiles/UI) centralized in `site/zones/witcher_grove/assets.js` with preload and helpers (`getSprite`, `getTile`, `getUIComponent`).
- Renderer integrated to consume module outputs immediately.
- Screenshot: `tests/showcase_grove_assets_module.png`.

Grove activation:
- Sprite animation driven by asset module (idle/walk sequences synced to movement speed).
- Tile interactions (chest pickup, campfire lore) trigger dispatcher overlays and console logs.
- Remix scaffolds wired in GameOver modal and credits overlay; links to starter packs and onboarding.
- Screenshots: `tests/showcase_grove_animation.png`, `tests/showcase_grove_interaction.png`, `tests/showcase_grove_remix_ui.png`.

Grove renderer reset:
- Sprite rendering rebuilt: Clean frame-based animation using getSprite with proper drawImage cropping; 120ms walk timing, idle holds, centered on tiles.
- Joystick system rebuilt: Complete rewrite using getUIComponent with clean CSS positioning (80px left, 80px bottom, 96px base, 48px knob); responsive and non-overlapping.
- Fullscreen canvas rebuilt: Proper canvas resize system with window resize handler; overlays and joystick reposition correctly.
- Screenshots: `tests/showcase_grove_sprite_fixed.png`, `tests/showcase_grove_joystick_rebuilt.png`, `tests/showcase_grove_fullscreen_responsive.png`.