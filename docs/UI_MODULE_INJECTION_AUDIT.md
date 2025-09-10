# UI Module Injection Audit

## Per-Zone Expectations
- Grove: HUDBar, QuestLog
- Toppler: HUDBar (with Toppler info), ProgressTracker/RampEditor (if present)
- Spirit: HUDBar, DialogueBox/Bond UI

## Logs
- `[UI] Injected modules for zone: <zone>`
- `[UI] HUDBar rendered`

## Steps
1. Inspect console for injection logs.
2. Verify UI is visible and clickable above canvas.
3. If container missing, expect warning: `[UI] Container missing — UI injection skipped`.