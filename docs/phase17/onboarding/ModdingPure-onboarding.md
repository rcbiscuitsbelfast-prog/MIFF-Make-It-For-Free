# ModdingPure Onboarding Pack

## 📦 Module Overview
ModdingPure provides plugin loading, validation, and asset bundling capabilities for MIFF games. It supports hot-reloading, dependency resolution, and remix-safe mod distribution.

## 🚀 CLI Usage

### Basic Commands
```bash
# Discover plugins in directory
npx ts-node cli/commands/modding.ts discover --directory ./plugins --verbose

# Load specific plugin
npx ts-node cli/commands/modding.ts load --plugin my-plugin-id

# Load all enabled plugins
npx ts-node cli/commands/modding.ts load --all

# Bundle assets for distribution
npx ts-node cli/commands/modding.ts bundle --output ./dist/mods
```

### Orchestration Commands
```bash
# Initialize modding system
npx ts-node cli/commands/modding.ts init --config modding-config.json

# Teardown and cleanup
npx ts-node cli/commands/modding.ts teardown --save-state

# Replay mod loading sequence
npx ts-node cli/commands/modding.ts replay --fixture fixtures/mod-loading.json

# Export mod manifest
npx ts-node cli/commands/modding.ts export --format json --output mod-manifest.json
```

## 📁 Sample Fixtures

### Basic Plugin Manifest
```json
{
  "id": "sample-combat-mod",
  "name": "Enhanced Combat Mod",
  "version": "1.0.0",
  "author": "MIFF Contributor",
  "description": "Adds new combat mechanics",
  "license": "GPL-3.0",
  "dependencies": ["CombatPure", "HealthSystemPure"],
  "assets": [
    "sprites/new-weapons.png",
    "audio/combat-sounds.ogg"
  ],
  "hooks": {
    "onCombatStart": "enhancedCombatStart",
    "onDamageCalculation": "newDamageFormula"
  }
}
```

### Mod Loading Configuration
```json
{
  "pluginDirectory": "./mods",
  "autoLoad": true,
  "dependencyResolution": "strict",
  "assetBundling": true,
  "hotReload": false,
  "maxPlugins": 50,
  "enabledPlugins": ["sample-combat-mod", "ui-enhancement-mod"]
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run ModdingPure golden tests
npm test -- --testNamePattern="ModdingPure"

# Test plugin discovery
npx ts-node cli/commands/modding.ts discover --directory miff/pure/ModdingPure/test-plugins

# Validate mod compatibility
npx ts-node cli/commands/modding.ts validate --plugin test-mod-id
```

## 🔄 Replay/Export Examples

### Replay Mod Loading Sequence
```bash
# Record mod loading session
npx ts-node cli/commands/modding.ts replay --record --output session.json

# Replay recorded session
npx ts-node cli/commands/modding.ts replay --fixture session.json --deterministic
```

### Export Mod Bundle
```bash
# Export for Unity
npx ts-node cli/commands/modding.ts export --format unity --output unity-mods/

# Export for Web
npx ts-node cli/commands/modding.ts export --format web --output web-mods/

# Export for Godot
npx ts-node cli/commands/modding.ts export --format godot --output godot-mods/
```

## 🎯 Deterministic Globals

ModdingPure uses these deterministic patterns:
- Plugin loading order based on dependency graph
- Deterministic asset bundling with content hashing
- Reproducible hot-reload sequences
- Consistent plugin validation results

## 🔗 Orchestration Patterns

### Plugin Lifecycle
1. **Discovery** - Scan plugin directory
2. **Validation** - Check dependencies and compatibility
3. **Loading** - Initialize plugins in dependency order
4. **Runtime** - Handle hot-reload and asset updates
5. **Teardown** - Clean shutdown with state preservation

### Integration Points
- Hooks into core MIFF systems (Combat, Dialogue, etc.)
- Asset pipeline integration with RenderPayloadPure
- Network synchronization with NetworkBridgePure
- Replay compatibility with VisualReplaySystemPure

## 📋 Quick Validation Checklist
- [ ] Plugin manifest structure is valid
- [ ] Dependencies are correctly resolved
- [ ] Assets are remix-safe (CC0/GPL)
- [ ] Hot-reload works without breaking game state
- [ ] Export formats are compatible with target engines