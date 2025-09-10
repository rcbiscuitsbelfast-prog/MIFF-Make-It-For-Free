# UI Overlay Deduplication & Lifecycle Guard

## Singleton Injection
- Skip injection if overlay with the same name already exists
- Use `showOverlay(name)` to enforce single instance and log injection

## Dismissal & Cleanup
- `hideOverlay(name)` removes overlay and logs removal
- Prevents lingering DOM nodes/z-index conflicts

## Zone Boot Guard
- `window.__miffZoneBooted` prevents repeated StartMenu injection
- Logs `[ZoneBoot] StartMenu shown once`

## Artifacts
- Logs: `logs/overlaydeduplicationlog.txt`, `logs/overlayremovallog.txt`, `logs/zonebootguardlog.txt`
- Screens: `tests/groveoverlayfixed.png`, `tests/spiritoverlayfixed.png`, `tests/mapbuilderoverlayfixed.png`