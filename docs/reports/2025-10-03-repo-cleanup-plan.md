# Repo Cleanup Plan (2025-10-03)

## Canonical Structure
- /docs/index.html (landing)
- /docs/viewport/ (render viewport)
- /docs/presets/ (mirrored presets)
- /docs/archive/test-results/
- /docs/archive/scenarios/
- /miff/pure/
- /presets/

## Issues Observed
- Duplicated site folders: `docs/site/`, `docs/docs-site/`, `docs/docs/` patterns.
- Legacy exports and orphaned files under `docs/demos/` and root-level misc.
- Multiple sampler entries (both under `docs/site/sampler/` and `docs/sampler/`).

## Plan
1) Consolidate samplers under `docs/site/` and provide redirects from `docs/sampler/`.
2) Keep `docs/render/viewport/` as the canonical viewport; update hub/portals accordingly.
3) Mirror presets only under `docs/presets/`; remove scattered duplicates.
4) Archive old test outputs under `docs/archive/test-results/`; standardize filenames and sections.
5) Add redirects where removal would break existing links.

## Non-Goals
- No module deletions. No functional changes to Pure modules.

---
Generated: 2025-10-03