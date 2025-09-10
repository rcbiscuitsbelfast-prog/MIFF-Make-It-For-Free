# MIFF Deep Diagnostic — Canvas, UI, Input, Mobile

## Purpose
Full diagnostic logging across canvas injection, renderer boot, assets, dispatcher overlays, input mode, and mobile viewport.

## What We Log
- [Canvas] Injection starting / Element found
- [Canvas] Resized on window change
- [Renderer] init() called / Draw loop started / requestAnimationFrame active
- [Assets] Loaded / [Assets] Missing
- [Dispatcher] Overlays registered
- [UI] HUDBar rendered / Overlay DOM attached
- [Input] Mode detected
- [Viewport] Orientation changed
- [Zone] Booting / Renderer initialized / Dispatcher ready

## Where Implemented
- `site/zones/witcher_grove/index.js`
- `site/zones/toppler/index.js`
- `site/zones/spirit_tamer/index.js`
- `site/zones/map_builder/index.js`
- `site/overlays/dispatcher.js`
- `site/state/game_state.js`

## Validation Steps
1. Load `/grove`, `/toppler`, `/spirit`, `/map-builder` and observe console logs.
2. Resize window / rotate device; confirm canvas resizes and input re-detected.
3. Verify overlays render above canvas and respond to input.

