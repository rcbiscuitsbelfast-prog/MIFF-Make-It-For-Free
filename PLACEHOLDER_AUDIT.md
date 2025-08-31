# Placeholder Audit Report

This audit identifies placeholder code, stubs, and incomplete scaffolds across the repository that could cause runtime failures, build errors, or contributor confusion. Use this report to prioritize cleanup, improve remix safety, and harden build stability.

## Findings

### 1) Debug/Temporary Logging

```102:106:games/toppler/TopplerScene.ts
        this.ctx = ctx;
        // Debug: confirm canvas mount and size
        console.log('[TopplerScene] Canvas mounted', { width: this.canvas.width, height: this.canvas.height });
```
- Type: Debug logging
- Impact: Noise in production logs; minor performance overhead
- Suggestion: Guard with an env flag or remove before release

```130:132:games/toppler/TopplerScene.ts
        if (!this.hasStartedLoop) {
            this.hasStartedLoop = true;
            console.log('[TopplerScene] Game loop started');
        }
```
- Type: Debug logging
- Impact: Noise in production logs
- Suggestion: Gate behind `process.env.NODE_ENV !== 'production'` or remove

```28:30:miff/scripts/html-utils.ts
    writeFileSync(outPath, html, 'utf8');
    console.log('[gen-html] Wrote', outPath);
```
- Type: Debug logging
- Impact: CI/stdout noise
- Suggestion: Keep for CI visibility or demote to verbose mode

### 2) Test Stubs and Fallbacks

```29:53:games/toppler/tests/scene.spec.ts
        // Fallback mock in case CI does not preload the global setup
        if (!(HTMLCanvasElement.prototype as any).getContext ||
            (HTMLCanvasElement.prototype.getContext as any)._stubbed !== true) {
            const stub = function () {
                return {
                    fillStyle: '#000',
                    strokeStyle: '#000',
                    lineWidth: 1,
                    clearRect: () => {},
                    fillRect: () => {},
                    strokeRect: () => {},
                    beginPath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    stroke: () => {},
                    fillText: () => {},
                    font: '',
                } as any;
            } as any;
            stub._stubbed = true;
            Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
                configurable: true,
                writable: true,
                value: stub
            });
        }
```
- Type: Test stub
- Impact: Can mask rendering bugs in non-canvas environments
- Suggestion: Keep for jsdom, but add a note that real canvas APIs are required in-browser

### 3) Docs Placeholders (intentional)

```31:41:docs/src/pages/demos/tutorial.md
## 🧪 Scenario Coverage Stubs
...
```
- Type: Documentation placeholders
- Impact: None at runtime; educational
- Suggestion: None

### 4) Potentially Unused Re-exports

```1:1:modules/pure/HealthSystemPure.ts
export * from '../../systems/HealthSystemPure/index';
```
- Type: Thin re-export module
- Impact: Low; may confuse navigation if not used by sampler
- Suggestion: Confirm usage; consider consolidating re-exports under a single index to reduce surface area

### 5) Build Pipeline Warnings and Fallbacks

- Location: `npm run gen-toppler` (console)
- Type: ESM loader warning and cycle, fallback used
- Impact: Non-fatal; HTML is generated via fallback
- Suggestion: Keep fallback as default path in CI. To remove warning, avoid `require(esm)` cycles and consider registering the ts-node loader via `--import` syntax or fully precompile scripts

## Asset and Path Checks

- `games/toppler/toppler.html` references compiled JS: `./dist/index.js` and loader `./main.js` — OK
- No external asset paths are referenced in standalone Toppler — OK

## Recommendations Summary

- Remove or guard debug `console.log` statements in `TopplerScene` and `html-utils` for production
- Keep jsdom canvas stubs but document that they are for tests only
- Confirm if thin re-export modules under `modules/pure/*` are necessary; consolidate if possible
- Maintain the fallback path for `gen-toppler` in CI; optionally refactor ESM loader init to eliminate the cycle warning

---

Contributors can use this audit to prioritize cleanup tasks that improve remix safety, reduce confusion, and harden the build. Focus first on removing debug logs, documenting test stubs, and ensuring build scripts always use the stable fallback path.

