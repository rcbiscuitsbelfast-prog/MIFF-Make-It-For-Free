# Zone Boot Validation

## Checklist per Zone
- [Zone] Booting: <zone>
- [Canvas] Element found
- [Renderer] init() called
- [Assets] Loaded (and Missing if any)
- [Dispatcher] Overlays registered
- [UI] HUDBar rendered
- [Input] Mode detected
- [Renderer] Draw loop started
- [Renderer] requestAnimationFrame active

## Expected Visuals
- Canvas visible
- UI modules layered above canvas
- Input responsive
- Overlays route correctly (IntroModal -> HUD -> GameOver)