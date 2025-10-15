# Scenario Fix Plan - "Do Everything" Comprehensive Repair

## Status: 📋 PLANNING COMPLETE → 🔧 READY TO EXECUTE

---

## Issues Summary

**Total Issues:** 28
- **Errors:** 24
- **Warnings:** 4 (missing CLI harnesses)

**Phases Failed:** 6/6 (0% success rate)
**Actions Failed:** 28/38 (74% failure rate)
**Target:** 100% success rate

---

## Issue Categories

### Category 1: ES Module Issues (3 modules)
**Problem:** Using `require.main === module` in ES modules
**Affected Modules:**
1. ItemsPure
2. RewardsPure
3. PartyPure

**Fix:** Replace with ES module check: `import.meta.url === new URL(process.argv[1], 'file:').href`

---

### Category 2: File Path Parsing Issues (8 modules)
**Problem:** CLI harnesses trying to read arguments as file paths
**Affected Modules:**
1. CraftingPure
2. EquipmentPure
3. StatusEffectsPure
4. CombatCorePure
5. AssetManifestPure
6. AssetValidatorPure
7. ConvertToUnityPure
8. ConvertToGodotPure

**Fix:** Implement proper CLI argument parsing using `process.argv`

---

### Category 3: Unknown Operation Errors (8 modules)
**Problem:** CLI harnesses don't recognize `--mode=` parameter format
**Affected Modules:**
1. DialogueSystemPure (triggerDialogue, presentDialogueChoice)
2. TeamsPure (createTeam)
3. CombatPure (initCombat)
4. AudioPure (playAudioCue)
5. SceneBuilderPure (buildScene)
6. PixelAnimPure (animateObject)
7. SessionManifestPure (createSession)

**Fix:** Add missing operation handlers or fix parameter parsing

---

### Category 4: Export Name Conflicts (2 modules)
**Problem:** Duplicate exports in index.ts files
**Affected Modules:**
1. MagicSystemPure
2. RitualSystemPure

**Fix:** Remove duplicate export declarations

---

### Category 5: Export Name Mismatch (1 module)
**Problem:** Manager doesn't export expected name
**Affected Modules:**
1. WeatherSystemPure

**Fix:** Fix export name in Manager.ts or update index.ts

---

### Category 6: Timeout Issues (1 module)
**Problem:** Operations exceeding 30-second timeout
**Affected Modules:**
1. SportsSystemPure

**Fix:** Optimize or mock long-running operations

---

### Category 7: Shell Syntax Error (1 module)
**Problem:** Unterminated quoted string in shell command
**Affected Modules:**
1. DialogueSystemPure (second occurrence)

**Fix:** Properly escape quotes in scenario runner

---

### Category 8: Missing CLI Harnesses (4 modules)
**Problem:** No cliHarness.ts file exists
**Affected Modules:**
1. SurvivalSystemPure
2. ClueSystemPure
3. RhythmChallengePure
4. WebSocketBridgePure

**Fix:** Create full CLI harness implementations

---

## Execution Plan

### Phase 1: Fix ES Module Issues (Priority: HIGH)
**Duration:** 5 minutes
**Actions:**
- [ ] Fix ItemsPure/cliHarness.ts
- [ ] Fix RewardsPure/cliHarness.ts
- [ ] Fix PartyPure/cliHarness.ts

### Phase 2: Fix File Path Parsing (Priority: HIGH)
**Duration:** 15 minutes
**Actions:**
- [ ] Fix CraftingPure/cliHarness.ts
- [ ] Fix EquipmentPure/cliHarness.ts
- [ ] Fix StatusEffectsPure/cliHarness.ts
- [ ] Fix CombatCorePure/cliHarness.ts
- [ ] Fix AssetManifestPure/cliHarness.ts
- [ ] Fix AssetValidatorPure/cliHarness.ts
- [ ] Fix ConvertToUnityPure/cliHarness.ts
- [ ] Fix ConvertToGodotPure/cliHarness.ts

### Phase 3: Add Missing Operations (Priority: HIGH)
**Duration:** 20 minutes
**Actions:**
- [ ] Fix DialogueSystemPure/cliHarness.ts (add triggerDialogue, presentDialogueChoice)
- [ ] Fix TeamsPure/cliHarness.ts (add createTeam)
- [ ] Fix CombatPure/cliHarness.ts (add initCombat)
- [ ] Fix AudioPure/cliHarness.ts (add playAudioCue)
- [ ] Fix SceneBuilderPure/cliHarness.ts (add buildScene)
- [ ] Fix PixelAnimPure/cliHarness.ts (add animateObject)
- [ ] Fix SessionManifestPure/cliHarness.ts (add createSession)

### Phase 4: Fix Export Issues (Priority: HIGH)
**Duration:** 5 minutes
**Actions:**
- [ ] Fix MagicSystemPure/index.ts (remove duplicate export)
- [ ] Fix RitualSystemPure/index.ts (remove duplicate export)
- [ ] Fix WeatherSystemPure export mismatch

### Phase 5: Create Missing CLI Harnesses (Priority: MEDIUM)
**Duration:** 30 minutes
**Actions:**
- [ ] Create SurvivalSystemPure/cliHarness.ts
- [ ] Create ClueSystemPure/cliHarness.ts
- [ ] Create RhythmChallengePure/cliHarness.ts
- [ ] Create WebSocketBridgePure/cliHarness.ts

### Phase 6: Fix Timeout and Shell Issues (Priority: MEDIUM)
**Duration:** 10 minutes
**Actions:**
- [ ] Optimize SportsSystemPure operations
- [ ] Fix quote escaping in scenario runner

### Phase 7: Re-run and Validate (Priority: HIGH)
**Duration:** 5 minutes
**Actions:**
- [ ] Execute fixed scenario
- [ ] Validate all phases pass
- [ ] Generate new results report
- [ ] Confirm 0 errors, 0 warnings

---

## Success Criteria

✅ **Phase Completion:** 6/6 phases complete (100%)
✅ **Action Success Rate:** 38/38 actions successful (100%)
✅ **Errors:** 0 (down from 24)
✅ **Warnings:** 0 (down from 4)
✅ **CLI Harnesses:** 151 available (up from 147)
✅ **Module Coverage:** 141 modules fully functional

---

## Estimated Timeline

- **Phase 1:** 5 min
- **Phase 2:** 15 min
- **Phase 3:** 20 min
- **Phase 4:** 5 min
- **Phase 5:** 30 min
- **Phase 6:** 10 min
- **Phase 7:** 5 min

**Total:** ~90 minutes

---

## Implementation Strategy

1. **Fix existing harnesses first** (Phases 1-4) - highest ROI
2. **Create missing harnesses** (Phase 5) - complete coverage
3. **Optimize and validate** (Phases 6-7) - ensure reliability
4. **Re-run scenario** - prove 100% success
5. **Generate updated reports** - document improvement

---

**Status:** Ready to execute
**Next Step:** Begin Phase 1 - Fix ES Module Issues
