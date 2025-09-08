# MIFF Zone Realignment Audit

Scope: Grove 3D, Toppler Medieval, Spirit Tamer

## 1) Zone Overview & Routing

- Routes (site):
  - Grove 3D: `site/zones/witcher_grove/index.html` (3D via `?mode=3d`)
  - Toppler Medieval: `site/zones/toppler/index.html?theme=medieval`
  - Spirit Tamer: `site/zones/spirit_tamer/index.html`
- Router signals: Zones post `MIFF_ZONE_READY` when `?router=1` is used.
- Orchestration load:
  - Grove: loads `orchestration.json` (zone file present)
  - Toppler: loads `orchestration.medieval.json` when `theme=medieval`
  - Spirit Tamer: loads `orchestration.json`
- Flagged routing/UI fallbacks:
  - Toppler: `[Back]` button in HTML; level selector + `[Next Level]` added imperatively.
  - Spirit Tamer: `[Back]` button in HTML; mobile `[Tap for beats]` hint overlay.
  - Grove: 3D toggle via query param; OK. No legacy router hardcoding detected.

## 2) UI & Overlay Audit

- Overlays targeted: Intro / Play / Game Over / LoreModal
  - Toppler: Start menu (Intro) via orchestration UI; Game Over via imperative overlay; Lore modal present; Play HUD canvas text.
  - Grove: Dialogue overlay via imperative code; inventory/journal text inline; no centralized overlay system.
  - Spirit Tamer: Dialogue overlay via imperative code; progress bar HUD in canvas; mobile tap hint.
- Consistency/styling:
  - Mixed: overlays use consistent dark translucent backdrops; serif typography not enforced; tile backgrounds not uniformly applied; fade transitions not centrally managed.
- Legacy elements to remove or refactor:
  - Toppler: `[Back]`, level selector, `[Next Level]` (replace with orchestration transitions + gestures).
  - Spirit Tamer: `[Back]`, `[Tap for beats]` inline (replace with orchestration-driven overlays / HUD hints).
  - Grove: Inline inventory/journal UI; recommend orchestration-driven overlays for quests/journal.

## 3) Asset Usage & Tile Registry

- Registry used: `site/maps/tile_manifest.json` (isometric blocks; remix-safe; biome+tags present).
- Toppler (site): canvas draws minimal shapes; medieval sprites in `assets/` (Player/Skeleton/Cliff/Bridge/Chest PNGs) not from `assets/Isometric Blocks/`.
- Grove (site): background, trees, house, chest PNGs referenced from `assets/` (not isometric blocks in current 2D view).
- Spirit Tamer (site): spirit and portrait textures from `assets/` + props; not isometric blocks.
- Revalidation:
  - `tile_manifest.json` valid (IDs, tags, biome, remix-safe); no oversized/misaligned entries.
  - `site/maps/grove3d.json` uses only registered tile IDs.
  - No orchestration files reference registry IDs outside Toppler’s level data; Toppler/Grove/Spirit site code reference some non-registry PNGs directly.
- Action: Migrate zone visuals to use registry tiles (terrain/props) where applicable; keep character/portrait sprites separate with explicit remix-safe attribution.

## 4) Orchestration Fidelity

- Toppler: Start menu per orchestration JSON; transitions handled imperatively (no dispatcher); overlays partially orchestration-driven.
- Grove: Imperative triggers (hint timeout, click chest); recommend moving to orchestration-driven triggers (quests, lore, props) and map-based tiles (`grove3d.json`).
- Spirit Tamer: Orchestration consumed for NPC positions and music; most flow (dialogue, beats) is imperative; recommend JSON dialogue trees and quest/state hooks (schemas added).
- Files present:
  - `site/zones/toppler/orchestration.medieval.json`
  - `site/zones/witcher_grove/orchestration.json`
  - `site/zones/spirit_tamer/orchestration.json`

## 5) Contributor Onboarding Flow

- Remix bars in all zones link to forks and contributor guides.
- Missing explicit links to `MAP_BUILDER_ONBOARDING.md` in zone UIs; recommend adding a small footer link or Remix mode link to map builder and onboarding docs.
- Credits/attribution: present in some overlays (Toppler lore mentions KayKit/CC0); unify credit footer across zones.

## 6) Visual Consistency & UX

- Layout: shared container and canvas styling; HUD text styles vary.
- Inconsistencies:
  - Progress/HUD placement and typography differ (Spirit Tamer has progress bar; others show text).
  - Input mode indicators only explicit in Toppler plan (stored in localStorage); not surfaced consistently.
- Recommendation: Unified UI scaffold
  - Shared overlay components: Intro, Play HUD, Pause, Game Over, LoreModal (serif headings, tile-backed panels, fade transitions)
  - Shared input hint component and input-mode indicator
  - Central orchestration dispatcher for overlay transitions

## 7) Asset & Orchestration Summary

- Registry integrity: OK (isometric blocks; tags/biomes complete)
- Orchestration linkage: `grove3d.json` valid; Toppler/Spirit site layers not yet registry-backed for terrain/props
- Non-registry direct assets: Present in Grove and Spirit Tamer for characters/props
- Suggested actions:
  - Replace site-level ad-hoc props with registry tiles and orchestration hooks
  - Keep non-tile character assets with explicit remix-safe attribution fields
  - Add dispatcher to consume orchestration transitions for overlays

## 8) Contributor Readiness Checklist

- [ ] Add footer/link in each zone to `docs/MAP_BUILDER_ONBOARDING.md`
- [ ] Migrate site props/terrain to `site/maps/*.json` and registry tiles
- [ ] Remove legacy UI ([Back], Next Level, Tap hint) and replace with orchestration overlays
- [ ] Add unified overlay styles (serif, tile background, fade)
- [ ] Wire dialogue trees (JSON) and quest/state schemas per new files
- [ ] Add input mode indicator and persistence across zones