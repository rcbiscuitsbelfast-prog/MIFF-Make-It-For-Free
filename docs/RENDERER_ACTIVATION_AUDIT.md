# Renderer Activation Audit

## Checklist per Zone
- `renderer.init({ zone: <zone> })` is executed
- Logs:
  - `[Renderer] init() called for zone: <zone>`
  - `[Renderer] Draw loop started`
  - `[Renderer] requestAnimationFrame active for: <zone>`
- Fallback:
  - If canvas or context missing → `[Renderer] Canvas or renderer missing — fallback triggered]`

## Steps
1. Load each zone and watch console for renderer logs.
2. Verify draw loop messages continue each frame.
3. Confirm fallback never triggers; if triggered, inspect canvas mounting.