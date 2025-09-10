# Contributor Walkthrough — Verifying & Extending MIFF Zones

## 1) Run locally
- Serve `site/` with any static server (e.g., `python3 -m http.server`)
- Open `/site/index.html` and navigate to zones

## 2) Visual checks
- Confirm canvas visible; check console for `[Canvas]` and `[Trace]` logs
- Verify overlays appear once and dismiss correctly

## 3) Interactions
- Grove: click NPC → Dialogue
- Spirit: click Spirit → Bond overlay
- Map Builder: click tiles → Toolbar

## 4) State progression
- Watch `[State]` logs in console; check HUD/Quest UI

## 5) Remix quickstart
- Duplicate a zone folder under `site/zones/`
- Update `site/zone-router.js` with a new entry and test
- Use dispatcher `showOverlay(name)` for quick UI

## 6) PR checklist
- No duplicate overlays
- Canvas responsive on mobile
- Entities render with hydrated sprites
- Add/update docs for any new modules