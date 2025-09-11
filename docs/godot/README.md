# MIFF Godot HTML5 Exports

Place your Godot HTML5 export artifacts here per zone.

## Structure

/docs/godot/{zone}/
  ├── {zone}.html   # Godot HTML5 loader
  ├── {zone}.wasm   # WebAssembly binary
  └── {zone}.pck    # Packed assets

## Embedded Pages
- Toppler: docs/site/toppler.html
- Spirit: docs/site/spirit.html
- Grove: docs/site/grove.html

## Boot Signal
From Godot (GDScript):
JavaScript.eval("window.postMessage({ type: 'godot-ready', zone: 'toppler' }, '*')")
MIFF Overlay hydrates HUD on `godot-ready`.

## Notes
- Replace placeholders with actual exports; keep filenames the same.