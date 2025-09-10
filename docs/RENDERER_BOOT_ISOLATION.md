# Renderer Boot Isolation

## Per-Zone init call
- Grove: `[Renderer] init() called for zone: witcher_grove`
- Toppler: `[Renderer] init() called for zone: toppler`
- Spirit: `[Renderer] init() called for zone: spirit_tamer`
- Map Builder: `[Renderer] init() called for zone: map_builder`

## Draw loop
- `[Renderer] Draw loop started`
- `[Renderer] requestAnimationFrame active for: <zone>`

## Verification
Check browser console per route for the above logs to confirm isolated renderer boot per zone.