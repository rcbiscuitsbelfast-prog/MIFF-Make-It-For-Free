# Golden Fixtures for CLI Testing

This directory contains golden output fixtures for all MIFF CLI tools. These fixtures serve as the "source of truth" for expected CLI behavior and enable deterministic testing across different environments.

## 🎯 Purpose

Golden fixtures provide:
- **Deterministic Testing**: Consistent expected outputs for regression testing
- **Remix Safety**: Validates CLI behavior remains consistent across forks
- **Documentation**: Examples of actual CLI output formats
- **CI Validation**: Automated verification that CLI tools work as expected

## 📁 Fixture Categories

### Core Gameplay Modules
- `stats_system_flow.json` - StatsSystemPure CLI operations
- `skill_tree_flow.json` - SkillTreePure skill tree management
- `combat_core_flow.json` - CombatCorePure combat simulation
- `pathfinding_flow.json` - PathfindingPure pathfinding algorithms
- `crafting_flow.json` - CraftingPure recipe and crafting logic
- `loot_tables_flow.json` - LootTablesPure loot generation
- `economy_flow.json` - EconomyPure pricing and vendor logic
- `equipment_flow.json` - EquipmentPure gear management
- `status_effects_flow.json` - StatusEffectsPure effect processing
- `ai_profiles_flow.json` - AIProfilesPure behavior simulation
- `dialog_flow.json` - DialogPure conversation flows
- `npcs_list.json` - NPCsPure NPC management
- `save_load_flow.json` - SaveLoadPure save/load operations

### Scenario Packs
- `tutorial_scenario_run.json` - TutorialScenarioPure execution
- `combat_scenario_run.json` - CombatScenarioPure battle scenarios
- `quest_scenario_run.json` - QuestScenarioPure quest progression

### Bridge & Interop
- `unity_bridge_dump_npcs.json` - UnityBridgePure NPC export
- `godot_bridge_dump_npcs.json` - GodotBridgePure NPC export
- `web_bridge_dump_npcs.json` - WebBridgePure NPC export
- `validation_flow.json` - ValidationPure cross-module validation

### Visual Tools
- `render_replay_help.json` - RenderReplayPure tool help
- `debug_overlay_help.json` - DebugOverlayPure tool help
- `bridge_inspector_help.json` - BridgeInspectorPure tool help

### Schema & Types
- `sharedSchema_dumpTypes.json` - SharedSchemaPure type definitions

## 🔧 Using Golden Fixtures

### In Tests
```typescript
test('✓ golden output validation', () => {
  const root = path.resolve(__dirname, '..');
  const goldenFixture = path.resolve(root, 'tests/goldenFixtures/stats_system_flow.json');
  
  const output = (global as any).testUtils.runCLI(cliPath, ['list']);
  const got = JSON.parse(output);
  const expected = JSON.parse(fs.readFileSync(goldenFixture, 'utf-8'));
  
  expect(got).toEqual(expected);
});
```

### Regenerating Fixtures
When CLI behavior changes intentionally, regenerate fixtures:

```bash
# Generate new fixture for a module
npx ts-node --compiler-options '{"module":"commonjs"}' \
  ModulePure/cliHarness.ts arg1 arg2 > tests/goldenFixtures/module_operation.json

# Verify the fixture is valid JSON
cat tests/goldenFixtures/module_operation.json | jq .
```

### Fixture Naming Convention
- `{module}_{operation}.json` - Single operation output
- `{module}_flow.json` - Multi-step operation sequence
- `{module}_{tool}_{action}.json` - Tool-specific actions

## 🚨 Important Notes

1. **Never Edit Manually**: Fixtures are generated automatically from CLI output
2. **Version Control**: All fixtures are committed to git for consistency
3. **CI Validation**: Automated tests verify fixtures match actual CLI output
4. **Cross-Platform**: Fixtures work on Windows, macOS, and Linux

## 🔍 Troubleshooting

### Fixture Mismatch
If a test fails due to fixture mismatch:
1. Check if CLI behavior changed intentionally
2. Regenerate the fixture if needed
3. Verify the new fixture is valid JSON
4. Commit the updated fixture

### Empty Fixtures
Some fixtures may be empty (0 bytes) if:
- CLI tool doesn't support the operation
- Required input files are missing
- Tool is in development

### JSON Validation
Always validate fixtures are proper JSON:
```bash
jq . tests/goldenFixtures/fixture.json > /dev/null
```

## 📚 Related Documentation

- [TESTING.md](../../TESTING.md) - CLI testing guidelines
- [ROADMAP.md](../../ROADMAP.md) - Project development phases
- [README.md](../../README.md) - Project overview and setup