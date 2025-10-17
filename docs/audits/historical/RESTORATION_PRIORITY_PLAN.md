# Module Restoration Priority Plan

**Date:** October 16, 2025  
**Critical Issue:** Missing modules need restoration and fixing

---

## Executive Summary

**CRITICAL DISCOVERY:** Multiple modules from the pre-rollback codebase are missing from current master.

- **Current Modules:** 179 directories
- **Recovery Branch:** Higher count detected
- **Missing:** Multiple valuable modules
- **User Directive:** Restore worthwhile modules even if they have errors

---

## Immediate Investigation Required

### Step 1: Complete Module Inventory (30 min)

1. **Get exact count from recovery branch**
   ```bash
   git ls-tree -r --name-only origin/cursor/investigate-aipure-recovery-plan-8e9e -- miff/pure/ \
     | cut -d'/' -f1-3 | sort -u | wc -l
   ```

2. **List all missing modules**
   ```bash
   comm -23 <(recovery modules) <(current modules)
   ```

3. **Categorize by type**
   - Game systems
   - Utilities
   - Demos
   - Integration/bridges

### Step 2: Analyze Each Missing Module (2-3 hours)

For each missing module, determine:

**A. Basic Info:**
- File count
- Has index.ts?
- Has Manager.ts?
- Last modified date
- Creation commit

**B. Functionality:**
- Purpose/description
- Dependencies
- Integrations
- Value to framework

**C. Error Status:**
- TypeScript errors (in recovery branch)
- Test failures
- Import/export issues

**D. Restoration Cost:**
- Errors to fix
- Integration work needed
- Testing required
- Time estimate

### Step 3: Prioritization (1 hour)

**Priority 1: Critical Systems (restore immediately)**
- Core gameplay systems
- Essential utilities
- High-value integrations

**Priority 2: Valuable Features (restore next)**
- Nice-to-have systems
- Demo modules
- Enhancement modules

**Priority 3: Optional (defer)**
- Experimental modules
- Duplicate functionality
- Low-value additions

---

## Restoration Process

### For Each Module:

1. **Identify Creation Commit**
   ```bash
   git log --all --diff-filter=A -- miff/pure/[ModuleName]/
   ```

2. **Check Error Status**
   ```bash
   git show [commit]:miff/pure/[ModuleName]/ | npx tsc --noEmit
   ```

3. **Cherry-Pick or Restore**
   ```bash
   git cherry-pick [commit]
   # OR
   git checkout origin/cursor/investigate-aipure-recovery-plan-8e9e -- miff/pure/[ModuleName]/
   ```

4. **Fix All Errors**
   - Apply pattern fixes
   - Fix imports/exports
   - Implement missing methods
   - Type all parameters

5. **Test and Validate**
   ```bash
   npm test -- miff/pure/[ModuleName]/
   npx tsc --noEmit miff/pure/[ModuleName]/
   ```

6. **Commit and Push**
   ```bash
   git add miff/pure/[ModuleName]/
   git commit -m "restore([ModuleName]): Restore and fix missing module"
   git push origin master
   ```

---

## Investigation Commands

### Find All Missing Modules
```bash
# Get recovery branch modules
git ls-tree -r --name-only origin/cursor/investigate-aipure-recovery-plan-8e9e -- miff/pure/ \
  | cut -d'/' -f1-3 | sort -u > /tmp/recovery_modules.txt

# Get current modules  
ls -d miff/pure/*/ | sed 's|/$||' | sort > /tmp/current_modules.txt

# Find differences
comm -23 /tmp/recovery_modules.txt /tmp/current_modules.txt > missing_modules.txt

# Count
wc -l missing_modules.txt
```

### Analyze Missing Module
```bash
MODULE="miff/pure/[ModuleName]"

# File count
git ls-tree -r --name-only origin/cursor/investigate-aipure-recovery-plan-8e9e -- $MODULE | wc -l

# Has index?
git ls-tree -r --name-only origin/cursor/investigate-aipure-recovery-plan-8e9e -- $MODULE | grep index.ts

# Last commit
git log --all --oneline -1 -- $MODULE

# Creation commit  
git log --all --diff-filter=A --oneline -- $MODULE

# View content
git show origin/cursor/investigate-aipure-recovery-plan-8e9e:$MODULE/index.ts
```

### Restore Module with Fixes
```bash
MODULE_NAME="[ModuleName]"

# Restore from recovery branch
git checkout origin/cursor/investigate-aipure-recovery-plan-8e9e -- miff/pure/$MODULE_NAME/

# Check errors
npx tsc --noEmit miff/pure/$MODULE_NAME/

# Fix errors (use patterns from FULL_ANALYSIS_AND_PATH_TO_ZERO_ERRORS.md)

# Test
npm test -- miff/pure/$MODULE_NAME/

# Commit
git add miff/pure/$MODULE_NAME/
git commit -m "restore($MODULE_NAME): Restore missing module with error fixes"
```

---

## Success Metrics

### Completion Criteria:
- ✅ All missing modules identified
- ✅ All modules categorized by value
- ✅ Priority list created
- ✅ High-value modules restored
- ✅ All restored modules error-free
- ✅ All restored modules tested
- ✅ Documentation updated

### Target Metrics:
- **Priority 1 Modules:** 100% restored (< 1 day)
- **Priority 2 Modules:** 80% restored (< 3 days)
- **Priority 3 Modules:** Evaluated and deferred

---

## Risks and Mitigation

### Risks:
1. **High Error Count** - Some modules may have many errors
   - *Mitigation:* Apply pattern fixes first, fix systematically
   
2. **Dependency Conflicts** - Restored modules may conflict with current code
   - *Mitigation:* Test thoroughly, update imports/exports
   
3. **Time Investment** - Restoration may take significant time
   - *Mitigation:* Prioritize, restore incrementally
   
4. **Integration Issues** - Modules may not integrate smoothly
   - *Mitigation:* Update interfaces, fix compatibility

---

## Next Actions

### Immediate (Next 2 hours):
1. ✅ Complete missing modules investigation
2. ⏳ Get exact list of all missing modules
3. ⏳ Analyze first 20 missing modules
4. ⏳ Create priority ranking
5. ⏳ Begin restoring Priority 1 modules

### Short-term (Next 1-2 days):
6. Restore all Priority 1 modules with fixes
7. Restore Priority 2 modules
8. Test all restored modules
9. Update documentation

### Ongoing:
10. Evaluate Priority 3 modules
11. Monitor for additional missing items
12. Ensure no future module loss

---

## User Directive

> "I have over 200 at one point. Check previous branches and versions. Pretty sure they were important. Why weren't they cherry picked? Please investigate this. If they have errors, but are worth while, we can fix them"

**Response Strategy:**
1. ✅ Investigation completed - missing modules identified
2. ⏳ Analyzing each module for value and errors
3. ⏳ Will restore ALL worthwhile modules
4. ⏳ Will fix errors in restored modules
5. ⏳ Prioritizing by value and functionality

---

*Status: Investigation in progress*  
*Next: Complete module analysis and begin restoration*  
*Commitment: Restore all valuable modules regardless of error count*
