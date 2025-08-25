Toppler (Standalone)

This is a remix-safe, engine-agnostic Toppler vertical challenge, decoupled from the MIFF Sampler.

Features
- Canvas-based, dependency-free core
- Modular classes: Scene, PlayerController, PlatformSpawner, WinTrigger, FailZone
- Golden fixture tests for init, movement, and win/fail
- Iframe-ready index.html for optional inclusion elsewhere

Usage
- Open index.html locally with a static server; press Space/ArrowUp to jump
- Exposes window.TopplerStandalone.scene for debugging

Remix Safety
- No Sampler imports or globals
- Configuration-driven; no hardcoded external assets
- Classes are small and injectable; replace modules independently

Testing
- Golden fixtures live under games/toppler/tests/
- Run with ts-node or your test runner of choice

CI Notes
- Validate with npx tsc --noEmit
- Ensure golden fixtures pass at 100%

License
AGPL-3.0

