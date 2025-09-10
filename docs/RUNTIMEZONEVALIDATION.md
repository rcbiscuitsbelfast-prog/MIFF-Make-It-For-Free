# Runtime Zone Identity Validation

## Steps
1. Visit routes: `/grove`, `/toppler`, `/spirit`, `/map-builder`.
2. Console should show:
   - `[Router] Route matched: <route>`
   - `[Renderer] init() called for zone: <zone>`
   - `[Assets] Loaded for zone: <zone>`
   - `[Dispatcher] Overlays registered: [...]`
3. DevTools → Elements: confirm `body[data-zone]` unique per route.
4. Visual marker at top-left shows zone name and color.
5. Use `debugger` in router and renderer init to step through bindings.

## Artifacts
- Logs: `logs/runtimezoneidentity_log.txt`, `logs/routertracelog.txt`, `logs/rendererboottrace.txt`
- Screenshots: `tests/zonegrovemarker.png`, `tests/zonetopplermarker.png`, `tests/zonespiritmarker.png`, `tests/zonemapbuilder_marker.png`