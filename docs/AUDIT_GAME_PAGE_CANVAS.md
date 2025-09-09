## 🧪 Game Page Canvas Audit — Routing, DOM, Asset Load & Renderer Init

Date: 2025-09-09

Scope: `/grove`, `/toppler`, `/spirit` (site pages) and router-driven zone pages

### 1) Route Verification

- Router: `site/zone-router.js` registers `toppler`, `spirit_tamer`, `witcher_grove` with sources:
  - `./zones/toppler/index.html`
  - `./zones/spirit_tamer/index.html`
  - `./zones/witcher_grove/index.html`
- Each zone page loads its entry script:
  - Toppler: `site/zones/toppler/index.html` → `index.js`
  - Spirit: `site/zones/spirit_tamer/index.html` → `index.js`
  - Grove: `site/zones/witcher_grove/index.html` → `index.js` and `assets.js`
- Zone scripts call initialization on DOMContentLoaded:
  - Grove: `window.addEventListener('DOMContentLoaded', init)`
  - Toppler: `window.addEventListener('DOMContentLoaded', init)`
  - Spirit: `window.addEventListener('DOMContentLoaded', init)`

### 2) DOM & Canvas Check

- Pages: `site/grove.html`, `site/toppler.html`, `site/spirit.html`
- Each contains `#gameContainer` and `<canvas id="gameCanvas">` and is visible.
- Canvas sizing:
  - Grove: buffer 1280x800, CSS 1280x800
  - Toppler: buffer 300x150, CSS 800x600 (scaled via CSS)
  - Spirit: buffer 300x150, CSS 800x600 (scaled via CSS)

### 3) Renderer Initialization

- Grove (`site/zones/witcher_grove/index.js`):
  - Preloads assets via `preloadAll()`, waits on `onAssetsReady()`
  - Initializes UI overlays and joystick
  - Starts update/draw loop via `requestAnimationFrame(gameLoop)`
  - Console logs observed: `GroveResize`, `GroveSprite`, movement logs
- Toppler (`site/zones/toppler/index.js`):
  - Loads orchestration JSON, binds inputs, ensures overlays and joystick
  - Starts draw loop with `requestAnimationFrame(loop)`
- Spirit (`site/zones/spirit_tamer/index.js`):
  - Loads orchestration/assets, detects input mode, overlays
  - Starts loop with `requestAnimationFrame(loop)`

### 4) Asset & Module Loading

- Grove assets module `assets.js` provides `getSprite`, `getTile`, `getUIComponent`, `preloadAll`, `onAssetsReady`.
- Dispatcher `site/overlays/dispatcher.js` and footer `site/overlays/footer.js` present and initialized.
- Inputs (keyboard/gamepad/touch) bound in each zone.

### 5) Errors & Console Logs (headless audit)

- Method: `scripts/canvas-audit-runner.js` (Puppeteer) with local static server mapping `/assets/*`.
- Grove: initial 404s for some optional assets occurred but rendering succeeded. No fatal errors.
- Toppler: minor 404s for optional resources; canvas and HUD render.
- Spirit: minor 404s for optional resources; canvas and HUD render.

### 6) Verification (Screenshots)

- Canvas visible and rendering for all three pages.
- HUD and footer overlays present.
- Screenshots saved:
  - `tests/audit_grove_canvas_loaded.png`
  - `tests/audit_toppler_canvas_loaded.png`
  - `tests/audit_spirit_canvas_loaded.png`

### 7) Notes/Changes Made During Audit

- Ensured ES module script tags on zone pages (`type="module"`) so imports work consistently.
- Added local static server `scripts/static-serve.js` with `/assets/*` mapping for audit and dev.
- Added `scripts/canvas-audit-runner.js` to verify canvas presence, UI overlays, and capture screenshots.

### Conclusion

All three pages load a visible canvas, initialize overlays and input, and start the render/update loop. Minor non-blocking 404s were observed for optional resources; no critical runtime errors detected.

