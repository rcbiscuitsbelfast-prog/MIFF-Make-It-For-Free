# Generated Scenarios

This directory contains automatically generated test scenarios for the MIFF game development ecosystem.

## Available Scenarios

### 🎮 Do Everything (2025-10-01)
**File:** `2025-10-01-do-everything.json`  
**Status:** ✅ Complete and Tested  
**Purpose:** Comprehensive integration test activating 141 modules

#### Quick Start
```bash
# Run from workspace root
node scripts/run-do-everything-scenario.cjs
```

#### Details
- **Modules:** 141 (100% coverage)
- **Phases:** 6
- **Actions:** 38
- **Execution Time:** ~2 minutes
- **Export Formats:** Web, Unity, Godot, Android

#### Features
✅ Multi-phase quest chain  
✅ Dynamic secondary quest spawning  
✅ EventBus integration  
✅ Cross-platform exports  
✅ Full module ecosystem test  

#### Documentation
- **Quick Start:** `/workspace/docs/DO_EVERYTHING_QUICK_START.md`
- **Full Report:** `/workspace/docs/DO_EVERYTHING_SCENARIO_COMPLETION_REPORT.md`
- **Task Summary:** `/workspace/DO_EVERYTHING_TASK_SUMMARY.md`

#### Results
- **Execution Log:** `/workspace/docs/archive/test-results/2025-10-01-do-everything-results.txt`
- **Coverage Report:** `/workspace/docs/archive/test-results/2025-10-01-scenario-coverage-report.txt`

---

## Scenario Format

All scenarios follow this JSON structure:

```json
{
  "scenarioId": "unique-id",
  "name": "Scenario Name",
  "version": "1.0.0",
  "schema": "v14",
  "phases": [
    {
      "id": "phase_id",
      "name": "Phase Name",
      "trigger": "TriggerModulePure",
      "modules": ["Module1Pure", "Module2Pure"],
      "actions": [
        {
          "step": 1,
          "action": "actionName",
          "module": "ModulePure",
          "params": {}
        }
      ]
    }
  ]
}
```

---

## Adding New Scenarios

### 1. Create Scenario JSON
Place your scenario JSON in this directory:
```bash
scenarios/generated/YYYY-MM-DD-scenario-name.json
```

### 2. Follow Naming Convention
- Use ISO date prefix: `YYYY-MM-DD-`
- Use kebab-case: `my-scenario-name`
- Extension: `.json`

### 3. Validate Schema
```bash
node -e "JSON.parse(require('fs').readFileSync('scenarios/generated/your-scenario.json'))"
```

### 4. Create Execution Script (Optional)
```bash
cp scripts/run-do-everything-scenario.cjs scripts/run-your-scenario.cjs
# Edit to load your scenario file
```

---

## Testing Scenarios

### Manual Execution
```bash
node scripts/run-your-scenario.cjs
```

### Validation
```bash
# Check syntax
node -e "JSON.parse(require('fs').readFileSync('scenarios/generated/your-scenario.json'))"

# Verify modules exist
node -e "const s=JSON.parse(require('fs').readFileSync('scenarios/generated/your-scenario.json')); s.phases.forEach(p => p.modules.forEach(m => console.log(m)))"
```

---

## Scenario Best Practices

### ✅ Do's
- Use existing modules only
- Maintain stateless purity
- Include clear phase descriptions
- Document expected outcomes
- Test before committing
- Add conditional quest logic
- Use EventBus for dynamic spawning

### ❌ Don'ts
- Don't create new modules in scenarios
- Don't hardcode file paths
- Don't use blocking operations
- Don't skip error handling
- Don't exceed reasonable execution times
- Don't break naming conventions

---

## Module Categories

When designing scenarios, consider modules from these categories:

- **Core Systems:** Quest, Combat, Items, Teams, AI
- **World & Environment:** Weather, Procedural Generation, Navigation
- **Dialogue & NPCs:** Dialogue Trees, NPC Management
- **Combat & Battle:** Combat Core, Battle AI, Health System
- **Crafting & Items:** Crafting, Equipment, Inventory
- **Magic & Abilities:** Magic System, Rituals, Skill Trees
- **Sports & Games:** Sports, Rhythm, Challenges
- **Rendering & Graphics:** Render World, Pixel Animation
- **Export & Bridges:** Web, Unity, Godot, Android
- **UI & Display:** HUD, Audio, Debug Overlay
- **Infrastructure:** Event Bus, Save System, Validation

---

## CLI Harness Integration

Scenarios execute CLI harnesses for each module action:

```typescript
// Expected CLI harness format
npx tsx miff/pure/ModulePure/cliHarness.ts --mode=action --param1=value1 --param2=value2
```

### Parameter Formats
- String: `--name="value"`
- Number: `--count=123`
- Boolean: `--enabled=true`
- JSON: `--config='{"key":"value"}'`

---

## Troubleshooting

### Scenario Won't Run
1. Check JSON syntax validity
2. Verify all modules exist
3. Ensure CLI harnesses are present
4. Check execution script permissions

### Modules Not Triggering
1. Verify module has CLI harness
2. Check parameter format matches harness
3. Review error logs in results file
4. Test harness individually

### Timeout Errors
1. Increase timeout in execution script
2. Break long operations into steps
3. Use async/parallel execution where possible

---

## Contributing

### Submit New Scenarios
1. Create scenario JSON following format
2. Test thoroughly
3. Document in this README
4. Submit PR with:
   - Scenario JSON
   - Execution script (if needed)
   - Documentation updates
   - Test results

### Report Issues
If a scenario fails:
1. Check error logs
2. Verify module compatibility
3. Document the issue
4. Propose fixes in PR

---

## Resources

- **MIFF Documentation:** `/workspace/docs/`
- **Module Index:** `/workspace/docs/MIFF_MODULE_INDEX_2025.md`
- **CLI Guide:** `/workspace/docs/CLI_GUIDE.md`
- **Testing Guide:** `/workspace/docs/TESTING.md`

---

*Last Updated: 2025-10-01*  
*MIFF Version: v14*
