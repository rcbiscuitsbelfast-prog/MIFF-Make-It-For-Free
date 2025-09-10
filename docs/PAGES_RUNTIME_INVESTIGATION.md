# GitHub Pages Runtime Investigation — MIFF Sampler

This report pinpoints why the live Pages URL still shows blank gameplay screens despite local fixes and commits.

## What we verified

- Mirror of playable assets:
  - `docs/site/**` now mirrors `site/**` (HTML + JS + zones + overlays)
  - `docs/assets/**` now mirrors `assets/**` (sprites, tiles, audio)
  - `.nojekyll` present under `docs/site/`
- Runtime pathing model on Pages:
  - Zone HTML at `/MIFF-Make-It-For-Free/site/*.html`
  - Zone scripts at `/MIFF-Make-It-For-Free/site/zones/**`
  - Assets at `/MIFF-Make-It-For-Free/assets/**`

This mirrors how relative paths resolve in zone JS (e.g., `../../../assets/...` → `/MIFF-Make-It-For-Free/assets/...`).

## Likely blockages (root causes)

1) Pages Source mismatch
- If Pages is configured to serve a different branch (e.g., `gh-pages`) or a different folder, the live site won’t receive our updates under `docs/`.
- Action: Settings → Pages → Set Source to “Deploy from a branch: master, folder: /docs”. Save and wait ~2–5 minutes.

2) Browser cache / CDN cache
- GitHub Pages caches aggressively. Old JS can persist.
- Action: Hard refresh (Ctrl/Cmd+Shift+R). Try an incognito window or append `?v=<timestamp>` to zone URLs.

3) Mixed Pages roots
- The URL you used is `/site/` under the repo Pages root. If Pages is set to `docs/`, you should be seeing `docs/site/**` already. If you still see old content, your Pages build may be pointing elsewhere.
- Action: Confirm Settings → Pages → “Build and deployment” lists the latest deployment timestamp and commit hash. It should match recent pushes.

4) Asset base path mismatch in a prior deployment
- If a previous deployment hosted only `/docs` without `/assets` at the root, sprites would 404. We have now mirrored `assets/` to `docs/assets/` which resolves zone-relative `../../../assets/...` references.
- Action: After cache-bust, verify DevTools → Network has no 404s for `assets/*`.

## What to check live (fast)

- Open DevTools → Console on `/site/grove.html`:
  - You should see:
    - `[Canvas] Display:` …, `Z-index:`, `Visibility:`
    - `[Canvas] Size:` …
    - `[Scene] Entities injected before draw loop:` … `count=` …
    - `[Renderer] Draw loop starting after hydration`
    - `[Trace] … drawn at (x,y)` every frame
- Open DevTools → Network:
  - Ensure `assets/Player.png`, `assets/Isometric Blocks/*.png` load (no 404).

## Next hardening (if still blank)

If Pages Source and cache are correct but visuals are still blank:

- I will add an in-page Network Sentinel overlay (no external deps) that logs failed requests and displays a banner if any critical asset returns 404.
- I can also convert all `../../../assets/...` to absolute `/MIFF-Make-It-For-Free/assets/...` at build-time in `docs/site/zones/**.js` for Pages safety.

## Summary
- The repository is now Pages-ready under `docs/` with mirrored `site/` and `assets/` trees.
- The most probable blockage is the GitHub Pages “Source” not serving `docs/` (or stale cache). Once the Pages source is aligned to `/docs` and caches are cleared, gameplay should render.