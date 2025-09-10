# UI Nesting & DOM Structure Audit

## Logs
- `[UI] Start button injected`
- `[UI] StartMenu overlay attached`
- `[UI] Duplicate StartMenu detected` (warn)

## Steps
1. Load zones and inspect `#miffIntro` elements.
2. Ensure only one Start menu exists; skip injection if present.