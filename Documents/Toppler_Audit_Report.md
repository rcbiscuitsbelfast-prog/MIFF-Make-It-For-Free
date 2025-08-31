## Errors

- ESM/CJS loader alignment for scripts
  - File: `package.json` (scripts)
    - Prior issue: `gen:html`/`gen-toppler` failed under ESM with `ERR_UNKNOWN_FILE_EXTENSION` using `ts-node`.
    - Fix implemented: `node --loader ts-node/esm miff/scripts/gen-html.ts || node dist-miff/scripts/gen-html.js` (Node v20.19.4 compatible; GH Actions safe).
    - Action: Ensure CI runs `npm run build:scripts` so `dist-miff/scripts/gen-html.js` exists for fallback.

- Browser-incompatible TypeScript in generated HTML
  - File: `miff/scripts/gen-html.ts` 20-22: references `./index.ts` (TS) and `./main.js`, calls `window.mountToppler()`
  - File: `games/toppler/main.js` 4-16: dynamically imports `./index.ts` in browser
  - Issue: Browsers cannot import `.ts` directly; without bundling/compile, standalone HTML will fail.
  - Fix options:
    - Option A: compile `games/toppler/*.ts` to JS (`games/toppler/dist/`) and update HTML to `./dist/index.js` (and compiled loader if needed).
    - Option B: produce a Vite bundle for Toppler and reference that in the generated HTML.

- Fallback script generation
  - File: `tsconfig.scripts.json`: compiles `miff/scripts/**/*.ts` to ESM at `dist-miff/scripts/`. Correct.
  - Note: `dist-miff/scripts/gen-html.js` exists only after `npm run build:scripts`.

- Sampler runtime ESM/CJS note (non-blocking for Toppler gen)
  - File: `sampler/main.js` 4-7: uses `require('ts-node/register/transpile-only')` with `.ts` requires; fine for Node, not for browser.

- Vite env define
  - File: `vite.config.ts`: updated to mode-aware `process.env.NODE_ENV` via `({ mode }) => ({ define: { ...JSON.stringify(process.env.NODE_ENV || mode) } })`. Safe in dev and prod.

## Missing Links

- Toppler generation flow
  - Command: `npm run gen-toppler`
    - Executes: `node --loader ts-node/esm ./miff/scripts/gen-html.ts || node dist-miff/scripts/gen-html.js`
    - Output: `games/toppler/toppler.html`
    - HTML references: `./index.ts`, `./main.js`, and calls `window.mountToppler()`.
    - Loader also auto-mounts (`games/toppler/main.js` 9-17), so explicit call is redundant.

- Required assets/templates/data
  - No external assets required by `gen-html.ts`; it writes static HTML.
  - Runtime requires functional app modules:
    - `games/toppler/index.ts` and supporting TS modules: `TopplerScene.ts`, `PlayerController.ts`, `PlatformSpawner.ts`, `WinTrigger.ts`, `FailZone.ts`.
  - Missing piece for static output: compiled JS for `.ts` files (or a bundler) so browser can execute.

- Uncompiled TS / unlinked modules
  - Files: `games/toppler/*.ts` are not transpiled for standalone HTML.
  - Suggestion:
    - Add `build:toppler-standalone` that compiles to `games/toppler/dist/` and update HTML to use `./dist/index.js` (and loader). Or bundle with Vite.

- Fallback clarity
  - Suggest logging when fallback path runs (e.g., wrapper echoes a message before calling `dist-miff/scripts/gen-html.js`).

## Game Analysis

- Genre and mechanics
  - Files: `zones/toppler/index.ts` 15-26, 60-106, 137-175, 212-251; `games/toppler/*.ts`
  - Mechanics: vertical platformer with gravity/jumping; procedural platforms (`PlatformSpawner`), win/fail thresholds (`WinTrigger`, `FailZone`), player movement (`PlayerController`).
  - Genre: physics platformer / puzzle-platformer.
  - Experience: climb upward, time jumps, avoid falling; win/fail overlays, remix/theme toggles.

- Scenario/UI shaping gameplay
  - Overlays: `zones/toppler/index.ts` 212-251 (DOM overlays for win/fail).
  - Sampler routing: `sampler/main.js` routes into Toppler zone.
  - Standalone: `games/toppler/toppler.html` provides `#app` mount and hint text.

- Fit in MIFF
  - Self-contained with Pure-style modules; demonstrates remix-safe design and modularity.

## Actionable Fixes

- Build the Toppler standalone to JS
  - Add script: `"build:toppler-standalone": "tsc -p games/toppler/tsconfig.json"` (or a new `tsconfig.toppler.json` with `outDir: games/toppler/dist`).
  - Update `miff/scripts/gen-html.ts` to reference `./dist/index.js` and loader path, or bundle via Vite.

- CI wiring
  - Execute: `npm run build:scripts` then `npm run gen-toppler`.
  - Optional matrix: ESM path vs TSC fallback path.

- Logging improvements
  - Echo when fallback is used to aid CI diagnostics.

## References

- `miff/scripts/gen-html.ts` 20-22, 27-31
- `games/toppler/main.js` 4-16, 9-17, 22-24
- `zones/toppler/index.ts` 15-26, 60-106, 137-175, 212-251
- `package.json` scripts: `gen:html`, `gen-toppler`, `build:scripts`
- `tsconfig.scripts.json`: compiles `miff/scripts/**/*.ts` to `dist-miff/scripts/`
