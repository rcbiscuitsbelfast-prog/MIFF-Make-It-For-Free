# Unified Game Audit Report — MIFF Zones

This report consolidates the full boot lifecycle traces across UI, Renderer, Scene, Dispatcher, and Input for `/grove`, `/toppler`, `/spirit`, `/map-builder`.

## Section 1 — Zone Boot Summary
- `[ZoneBoot] Zone loaded: <zone>`
- `[ZoneBoot] DOM marker: data-zone="<zone>"`
- `[ZoneBoot] Visual marker injected`

## Section 2 — UI Injection & Nesting
- `[UI] Start button injected` / `[UI] StartMenu overlay attached`
- `[UI] Modules attached: HUDBar, QuestLog, DialogueBox, MapToolbar`
- Warns duplicates: `[UI] Duplicate StartMenu detected: N`

## Section 3 — Renderer Flow & Canvas Context
- `[Renderer] init() called for zone: <zone>`
- `[Renderer] requestAnimationFrame active`
- `[Draw] Frame rendering…`
- `[Canvas] Context acquired: webgl|2d`
- Fallback: `[Renderer] Canvas or context missing — rendering aborted`

## Section 4 — Scene Graph & Entity Injection
- `[Scene] Entity injected: <type>`
- `[Scene] Entities count: N`
- Entities have `draw()` and sprites hydrate/render

## Section 5 — Dispatcher Routing & Overlays
- `[Dispatcher] Overlays registered: [StartModal, LoreModal, BondOverlay, MapToolbar]`
- `[Dispatcher] Overlay shown: <Name>`
- `[UI] Overlay z-index: <value>`

## Section 6 — Input Mode Detection
- `[Input] Mode detected: touch|mouse|gamepad`
- HUD/joystick activation confirmed

## Section 7 — Artifacts
- Unified log: `logs/unifiedgameaudit_log.txt`
- Screens: `tests/unifiedgroveboot.png`, `tests/unifiedtopplerboot.png`, `tests/unifiedspiritboot.png`, `tests/unifiedmapbuilderboot.png`

## Section 8 — Final Checklist
- ✅ Unique zone boot logic
- ✅ Single StartMenu per zone
- ✅ Canvas context valid
- ✅ Draw loop active
- ✅ Entities injected and rendered
- ✅ Dispatcher overlays routed
- ✅ Input mode detected and responsive