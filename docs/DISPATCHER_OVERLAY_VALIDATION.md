# Dispatcher Overlay Validation

## Overlays per Zone (expected)
- Grove: `IntroModal`, `LoreModal`, `HUD`
- Toppler: `IntroModal`, `HUD`, (Puzzle/Progress overlays can be added)
- Spirit: `IntroModal`, `GameOver`, `LoreModal`, `HUD`

## Logs
- `[Dispatcher] Overlays registered: [...]`
- `[UI] Overlay DOM attached`
- `[UI] HUDBar rendered`
- `[Dispatcher] Overlay shown: <Name>` (when invoked)

## Validation
1. Load each zone and observe logs for overlays registration.
2. Trigger an overlay (e.g., show intro or lore) and confirm DOM attachment and visibility.
3. Ensure overlays appear above canvas and receive input.