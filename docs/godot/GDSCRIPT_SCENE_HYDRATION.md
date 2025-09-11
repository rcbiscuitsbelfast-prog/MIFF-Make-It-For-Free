# Godot HTML5 Scene Hydration (GDScript)

Use this snippet in your exported scene to receive scene JSON from MIFF Studio and instantiate nodes.

```gdscript
extends Node

var js := JavaScript

func _ready():
	# Notify MIFF page this export is ready
	JavaScript.eval("window.parent && window.parent.postMessage({ type: 'godot-ready', zone: 'toppler' }, '*')")
	# Register a JS listener to forward messages into Godot
	JavaScript.eval("window.addEventListener('message', (e)=>{ if (e && e.data && e.data.type==='scene-data'){ const payload = JSON.stringify(e.data); Module.mono_call_assembly_entry_point([payload]); } });")

# If using Godot 4 without C#, replace the above with a callable via JavaScript bridge
# Alternatively poll via JavaScript.get_interface in _process.

func hydrate_from_json(payload: String) -> void:
	var data = JSON.parse(payload)
	if data.error != OK:
		return
	var scene = data.result.get("data", {})
	var ents = scene.get("entities", [])
	for e in ents:
		var n = Node2D.new()
		n.name = e.get("name", e.get("id", "Entity"))
		n.position = Vector2(e.get("x", 0), e.get("y", 0))
		if e.get("src", "") != "":
			var spr = Sprite2D.new()
			var tex = ImageTexture.new()
			var img = Image.load_from_file(e.get("src")) # adjust with proper resource loader if needed
			if img:
				tex.create_from_image(img)
				spr.texture = tex
				spr.scale = Vector2(max(1.0, e.get("w", 32)/max(1.0, tex.get_size().x)), max(1.0, e.get("h", 32)/max(1.0, tex.get_size().y)))
			n.add_child(spr)
		add_child(n)
	# Signal back to MIFF overlays
	JavaScript.eval("window.parent && window.parent.postMessage({ type: 'scene-hydrated', zone: 'toppler' }, '*')")
```

Notes:
- Load textures with your preferred resource path strategy; the above assumes direct URLs are accessible.
- For stricter security, restrict `postMessage` origins.