# Gameplay Verification Trace

## Visual Trace
- Entities log draw execution with coordinates: `[Trace] <Entity> drawn at (x,y)`
- Validate layout matches expected positions.

## Sprite Hydration
- Success: `[Assets] Sprite loaded: <src>`
- Failure: `[Assets] Sprite failed to load: <src>`

## Interaction Logging
- Clicks: `[Interaction] Click at: x y`
- Start: `[Interaction] Start button clicked]` (via start handler)

## UI Layer Confirmation
- `[UI] Overlay z-index: <value>`
- `[UI] Overlay visibility: <state>`

## Artifacts
- Logs: `logs/visualtracelog.txt`, `logs/spritehydrationlog.txt`, `logs/interaction_log.txt`, `logs/uilayerlog.txt`
- Screens: `tests/grovevisualtrace.png`, `tests/spiritinteractionlog.png`, `tests/mapbuilderuilayer.png`