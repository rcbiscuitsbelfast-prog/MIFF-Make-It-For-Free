# Pixel World 404 Analysis (2025-10-03)

## Scope
- Paths reviewed: `docs/pixelworld.html`, `docs/pixelworld/index.html`, `docs/render/viewport/`, `docs/site/sampler/`, `docs/sampler/`
- Canonicals: use `docs/pixelworld.html` and `docs/render/viewport/pixelCityViewport.html`

## Observations
- `docs/pixelworld.html` exists and is a valid top-level entry.
- `docs/render/viewport/index.html` and `docs/render/viewport/pixelCityViewport.html` exist; index redirects are present.
- `docs/site/sampler/pixel-world.html` and `docs/sampler/pixel-world.html` both exist; duplication can cause confusion.
- Most 404s previously stemmed from folder-level links when deployed under GitHub Pages base path.

## Link Validation
- Sampler → Pixel World: ensure links reference `/render/viewport/pixelCityViewport.html` (or relative `docs/render/viewport/pixelCityViewport.html`).
- Portals/Hub: ensure links use the canonical viewport path; avoid nested folder `../pixelworld/` paths.
- Index redirects: `docs/render/viewport/index.html` should redirect to `pixelCityViewport.html`.

## Recommendations
1) Canonicalize to `docs/render/viewport/pixelCityViewport.html` for live demo; keep `docs/pixelworld.html` as a landing doc.
2) Update any sampler/portal links to the canonical viewport path; avoid folder-only links.
3) Remove duplicate `docs/sampler/pixel-world.html` (or keep one and redirect the other).
4) Add fallback `<base>` or absolute paths where needed under GH Pages.

---
Generated: 2025-10-03