# Render Suppression & Asset Path Audit

## Canvas Visibility
- Logs canvas display/z-index/visibility per zone
- Ensure display:block, visibility:visible, z-index <= 1

## Asset Path Validation
- Sprite onload/onerror logs
- Check 404s in Network tab

## Overlay Obstruction
- Logs for overlay z-index, pointer-events, display
- Verify overlays not blocking canvas unintentionally

## Draw Loop Integrity
- Continuous draw logs with entity render traces
- Confirm no entity filtering or early aborts

## Artifacts
- Logs: `logs/canvasvisibilitylog.txt`, `logs/assetpathlog.txt`, `logs/overlayzindexlog.txt`, `logs/drawlooptrace.txt`
- Screens: `tests/canvasvisibilitycheck.png`, `tests/assetpathvalidation.png`, `tests/overlayobstructiontrace.png`, `tests/drawloopintegrity.png`