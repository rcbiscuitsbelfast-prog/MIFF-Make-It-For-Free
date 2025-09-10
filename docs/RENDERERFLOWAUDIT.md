# Renderer Flow Audit

## Validate
- Context acquired
- Draw loop active
- Scene populated

## Logs
- `[Renderer] init() called for zone: ...`
- `[Renderer] requestAnimationFrame active`
- `[Draw] Frame rendering...`
- Fallback if missing: `[Renderer] Context or scene missing — rendering aborted`