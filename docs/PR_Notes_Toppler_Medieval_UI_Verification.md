# Toppler Medieval UI Verification

Label: Toppler Medieval UI Verification

## Summary
- Verified orchestration-driven overlays (Intro via start menu, Play HUD, Game Over modal, Lore modal)
- Confirmed input handling (keyboard, touch UI present). Gamepad polling not yet wired
- Persistence: `localStorage.toppler_state` read/writes verified for `levelIndex`, `muted`; documented schema for `difficultyLevel`, `inputMode`, `score`

## Screenshots (artifacts)
- tests/toppler_intro.png
- tests/toppler_play.png
- tests/toppler_gameover.png
- tests/toppler_lore.png
- tests/toppler_page.png (standalone baseline)

## Orchestration Notes
- File: `site/zones/toppler/orchestration.medieval.json`
- `ui.startMenu.enabled` shows Intro
- Transitions are defined (`startGame`, `showCredits`) but currently handled imperatively in `site/zones/toppler/index.js`
- Recommendation: add a small dispatcher to auto-interpret transitions for overlays

## Input & Persistence
- Keyboard: ArrowLeft/ArrowRight/ArrowUp; `Enter` to start; `M` mute; `P` pause
- Touch: `ensureMobileControls()` adds controls on narrow viewports
- Gamepad: add periodic `navigator.getGamepads()` polling, persist `inputMode`
- Persistence key: `localStorage.toppler_state`
  - Suggested fields: `levelIndex`, `muted`, `difficultyLevel`, `inputMode`, `score`

## UI Cleanup Checklist (to align with MIFF standards)
- Remove bottom-left level selector (`#levelSelector`)
- Remove `[Next Level]` button created in `bindInputs()`
- Remove `[Back]` button in `site/zones/toppler/index.html`
- Remove physics puzzle fallback logic; rely on orchestration overlays & gestures

## Environment
- Served via `python3 -m http.server 8000 --directory /workspace`
- Headless run with Puppeteer to capture screenshots

## Follow-ups
- Implement dispatcher for `orchestration.transitions`
- Implement gamepad detection and persist `inputMode`
- Wire difficulty selection to persist and fully influence physics/enemy speed