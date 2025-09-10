# Mobile Rendering Issues — Findings & Fixes

## Symptoms
- Canvas invisible or clipped
- UI overlays behind canvas
- Touch input not detected
- Canvas not resizing on rotation

## Root Causes Identified
- Canvas not sized to window inner dimensions
- Missing `touch-action: none`
- Overlays not appended after canvas
- No orientationchange listener

## Fixes Implemented
- Full window canvas sizing with resize/orientation listeners
- Canvas CSS:
```
canvas { position:absolute; top:0; left:0; z-index:0; display:block; touch-action:none; }
```
- UI layering: overlays injected after canvas; HUD logged on first render
- Input mode detection: touch/mouse/gamepad with logging

## Verification
- Tested on `/grove`, `/toppler`, `/spirit`, `/map-builder`
- Confirmed logs for canvas, renderer, assets, dispatcher, input
- Confirmed joystick/HUD appears on touch devices