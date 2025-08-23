# AutoBuilderCLI

Multi-platform scenario builder that converts scenario packs to Web, Unity, or Godot using RenderPayloadPure and platform-specific converters.

## Usage

```bash
# Basic web build
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --fps 24 --debug --out toppler.html

# Unity build with asset injection
npx ts-node AutoBuilderCLI/cli.ts SpiritTamerDemoPure --platform unity --assets assets.json --out demo.cs

# Godot build with custom genre
npx ts-node AutoBuilderCLI/cli.ts AdventureDemo --genre adventure --platform godot --out demo.gd
```

## CLI Flags

- `--fps <number>`: Playback rate (default: 30)
- `--debug`: Enable debug overlay
- `--out <path>`: Output path (default: demo.html)
- `--genre <type>`: Scenario genre (physics, rhythm, adventure) - auto-detected if not specified
- `--platform <type>`: Target platform: web, unity, godot (default: web)
- `--assets <file>`: Asset manifest JSON file for injection

## Conventions

- **Scenario Module Path**: `<Name>/ScenarioPack<Name>.ts`
- **Supported Exports**: `generateGameState()`, `toGameState()`, or `runScenario()`
- **Genre Detection**: Automatically inferred from scenario name/content
- **Platform Conversion**: Uses ConvertToWebPure, ConvertToUnityPure, or ConvertToGodotPure

## Asset Injection

Asset manifests are validated using AssetManifestPure and can include:
- Sprites, audio, fonts, shaders, and bundles
- License information (cc0, cc-by, agpl, custom)
- Platform-specific targeting (web, unity, godot, all)

## Remix-Safe Override Notes

### Scenario Packs
- Extend `runScenario(config)` to inject custom parameters
- Override `generateGameState()` for custom frame generation
- Use `toGameState()` for deterministic state conversion

### Platform Converters
- Each platform converter is pure and deterministic
- Asset injection happens at build time, not runtime
- Output formats are consistent and predictable

### Asset Manifests
- Override asset paths and types via JSON configuration
- Custom license and platform targeting supported
- Validation ensures remix-safe asset usage

### Build Process
- Genre detection is heuristic-based and can be overridden
- Platform conversion preserves deterministic behavior
- Asset injection validates licensing and compatibility

## Examples

### Physics Genre (TopplerDemoPure)
```bash
npx ts-node AutoBuilderCLI/cli.ts TopplerDemoPure --genre physics --platform web --out physics_demo.html
```

### Rhythm Genre (SpiritTamerDemoPure)
```bash
npx ts-node AutoBuilderCLI/cli.ts SpiritTamerDemoPure --genre rhythm --platform unity --assets rhythm_assets.json --out rhythm_demo.cs
```

### Adventure Genre (WitcherExplorerDemoPure)
```bash
npx ts-node AutoBuilderCLI/cli.ts WitcherExplorerDemoPure --genre adventure --platform godot --assets adventure_assets.json --out adventure_demo.gd
```

## Architecture

```
ScenarioPack → RenderPayloadPure → Platform Converter → Output
     ↓              ↓                    ↓              ↓
  Genre        Frame Data         Web/Unity/Godot   HTML/CS/GD
Detection      Generation         Conversion        Files
```

Remix-safe and engine-agnostic. Works with ts-node or bundlers.