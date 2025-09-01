# Onboarding Challenge — Color Clicker (Remix-Safe)

Build a minimal Color Clicker using Pure modules. Goal: change colors on click, track score, and export a replay.

## Steps
1. Fork repo and create `sampler/zones/color_clicker.js`
2. Export `startZone()` with simple state: color, score
3. On click: cycle color, +1 score, append to replay log
4. Add fixture `sampler/scenarios/color_clicker.fixture.json`
5. Run tests: `npm run test:ci` and validate assets/licenses
6. Submit PR with README snippet and remix-safe assets

## Acceptance
- Deterministic replay works
- No engine dependencies
- Assets are CC0/GPL/Public Domain