# Dispatcher Routing Audit

## Goals
- Overlays registered and routable per zone
- Visible above canvas, pointer events enabled

## Logs to Confirm
- `[Dispatcher] Overlays registered for zone: <zone>`
- `[UI] Overlay DOM attached`
- `[UI] HUDBar rendered`
- `[Dispatcher] Overlay shown: <Name>`
- `[UI] Overlay z-index: <value>`

## Steps
1. Load zone, ensure dispatcher created and overlays registered.
2. Manually show an overlay; confirm it appears and is interactive.
3. Check z-index logs and computed styles.