# MIFF Module Index
## Complete List of Pure Modules

**Generated:** October 18, 2025  
**Total Modules:** 228  
**Method:** Filesystem scan

---

## SUMMARY STATISTICS

**Module Coverage:**
- Total modules: 228
- With tests: 83 (36.4%)
- Without tests: 145 (63.6%)
- With Manager.ts: 129 (56.6%)
- With index.ts: 218 (95.6%)

**Code Metrics:**
- Total lines: 416,140
- Average per module: 450 lines
- Largest: UnrealBridgePure (9,247 lines)
- Smallest: WorldLayoutPure (26 lines)

---

## MODULES BY CATEGORY

### Core Systems (Tested)

1. **RenderWorldPure** - 3,164 LOC, ✓ tests
2. **SimpleGamePure** - 856 LOC, ✓ tests
3. **SavePure** - 743 LOC, ✓ tests
4. **StatePure** - 421 LOC, ✓ tests
5. **EventBusPure** - 387 LOC, ✓ tests

### Large Modules (Untested)

1. **UnrealBridgePure** - 9,247 LOC, ✗ no tests
2. **SkeletonAnimatorPure** - 6,426 LOC, ✗ no tests
3. **TeamsPure** - 4,098 LOC, ✗ no tests
4. **AIPure** - 2,993 LOC, ✗ no tests
5. **CutScenePure** - 2,977 LOC, ✗ no tests

### Manager Modules (129 total)

Modules with Manager.ts for CRUD operations.

Examples:
- APIGatewayPure/Manager.ts
- StateManagerPure/Manager.ts
- GraphicsPure/Manager.ts
- NetworkPure/Manager.ts
- DatabasePure/Manager.ts

---

## MODULES NEEDING TESTS (Priority Order)

### Priority 1: Large Untested Modules

1. UnrealBridgePure - 9,247 LOC
2. SkeletonAnimatorPure - 6,426 LOC
3. TeamsPure - 4,098 LOC
4. AIPure - 2,993 LOC
5. CutScenePure - 2,977 LOC
6. IdleSystemPure - 2,797 LOC
7. CameraSystemPure - 2,736 LOC
8. ChallengesPure - 2,524 LOC
9. EffectsPure - 2,515 LOC
10. EconomyPure - 2,504 LOC

### Priority 2: Medium Untested Modules

(50+ additional modules between 500-2,000 LOC)

### Priority 3: Small Untested Modules

(85+ modules under 500 LOC)

---

## COMPLETE MODULE LIST

See `module-index.json` for machine-readable complete list with:
- Module name
- File path
- File count
- Test count
- Lines of code
- Has Manager boolean
- Has index boolean

---

## USAGE

**Load module data:**
```javascript
const modules = require('./module-index.json');

// Find modules without tests
const untested = modules.filter(m => m.tests === 0);

// Find largest modules
const largest = modules.sort((a, b) => b.loc - a.loc);

// Find modules with Manager
const withManager = modules.filter(m => m.has_manager);
```

**Update index:**
```bash
python3 -c "import os, json; ..." > module-index.json
```

---

**Last Updated:** October 18, 2025  
**Accuracy:** Based on filesystem scan  
**Format:** Markdown + JSON
