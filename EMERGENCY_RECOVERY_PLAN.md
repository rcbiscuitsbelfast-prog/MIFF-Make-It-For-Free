# EMERGENCY RECOVERY PLAN

**Status:** 🔴 CRITICAL - Framework-Wide Failure  
**Priority:** P0 - Immediate Action Required  
**Timeline:** Execute immediately  

---

## 🚨 SITUATION

**ALL 234 modules are broken** due to automated "fixes" that broke exports and removed methods.

**Breakage caused by:** Commit `8420c953` (Oct 14, 2025) - "96% TypeScript Error Reduction"

---

## 🎯 RECOVERY STRATEGY

### **Option A: Full Rollback** ⭐ **RECOMMENDED**

**Action:** Restore entire codebase to October 8, 2025 (before breakage)

**Pros:**
- ✅ Immediate restoration
- ✅ Known working state
- ✅ All modules functional
- ✅ Minimal risk

**Cons:**
- ❌ Lose 7 days of work
- ❌ Lose 147 new modules (87 → 234)
- ❌ Lose audit documentation

**Recommendation:** **DO THIS FIRST** to get to working state, then selectively restore safe changes.

---

## 📋 PHASE 0: IMMEDIATE ROLLBACK (30 minutes)

### **Step 1: Create Safety Backup**

```bash
# Create backup branch of current (broken) state
git branch backup-broken-state-oct15
git push origin backup-broken-state-oct15

# Document current HEAD
echo "Broken state: $(git rev-parse HEAD)" > ROLLBACK_INFO.txt
```

### **Step 2: Identify Good Commit**

```bash
# Find last good commit (before Oct 14 breaking changes)
GOOD_COMMIT=$(git rev-list --before="2025-10-14" --max-count=1 HEAD)
echo "Good commit: $GOOD_COMMIT"

# Verify it's from Oct 8 or earlier
git log --oneline $GOOD_COMMIT -1
```

### **Step 3: Create Recovery Branch**

```bash
# Create new branch from good state
git checkout -b recovery-from-oct8 $GOOD_COMMIT

# Verify we're at good state
git log --oneline -5
```

### **Step 4: Test the Good State**

```bash
# Install dependencies
npm install

# Run sample tests to verify
npm test -- --testPathPattern="AIPure|CombatPure|QuestsPure" 2>&1 | grep -E "Test Suites:|Tests:"

# Expected: Tests should pass or at least not show "Manager is not a constructor"
```

### **Step 5: If Tests Pass, Merge to Master**

```bash
# If tests pass at good commit
git checkout master
git reset --hard $GOOD_COMMIT
git push --force origin master

# Document the rollback
echo "Rolled back to: $GOOD_COMMIT" >> ROLLBACK_INFO.txt
echo "Reason: Automated fixes broke all 234 modules" >> ROLLBACK_INFO.txt
git add ROLLBACK_INFO.txt
git commit -m "emergency: Rollback to working state (Oct 8) - all modules were broken"
git push origin master
```

---

## 📋 PHASE 1: SELECTIVE RESTORATION (2-3 hours)

**After rollback, selectively restore SAFE changes:**

### **Step 1: Audit What Was Good**

From Oct 8 → Oct 15, identify safe additions:

**Safe to restore:**
- ✅ New documentation (if accurate)
- ✅ New modules (if they have tests)
- ✅ Test additions (if they pass)
- ✅ Configuration improvements

**NOT safe to restore:**
- ❌ Automated fix commits (8420c953, 830f1160)
- ❌ Any commit touching 100+ Manager.ts files
- ❌ batch_fix_script.ts changes

### **Step 2: Cherry-Pick Safe Commits**

```bash
# List commits between good and bad
git log $GOOD_COMMIT..8420c953 --oneline

# Cherry-pick ONLY safe commits (documentation, new modules)
git cherry-pick <safe-commit-sha>

# Test after EACH cherry-pick
npm test -- --testPathPattern="AIPure" 2>&1 | head -20
```

### **Step 3: Restore New Modules Carefully**

**147 new modules were added between Oct 8-15.**

**Strategy:**
```bash
# For each new module directory
for module in $(git diff --name-only $GOOD_COMMIT..HEAD | grep "miff/pure/.*/" | cut -d/ -f1-3 | sort -u); do
  echo "Checking: $module"
  
  # Copy from backup branch
  git checkout backup-broken-state-oct15 -- $module
  
  # Test immediately
  npm test -- --testPathPattern="$(basename $module)" 2>&1 | grep "Test Suites:"
  
  # If fails, revert
  if [ $? -ne 0 ]; then
    echo "FAILED - reverting $module"
    git checkout HEAD -- $module
  fi
done
```

---

## 📋 PHASE 2: PROPER AUDIT WITH TESTS (1 day)

**Create proper audit that includes test execution:**

### **New Audit Requirements:**

1. **Static Analysis** (existing)
2. **Test Execution** (NEW - CRITICAL)
   ```bash
   npm test 2>&1 | tee audit_test_results.txt
   ```
3. **Module Instantiation Tests** (NEW)
   ```bash
   # For each module, verify can instantiate
   node -e "const m = require('./miff/pure/AIPure'); console.log(Object.keys(m))"
   ```
4. **Functional Smoke Tests** (NEW)
   ```bash
   # Verify basic operations work
   # Test Combat, Dialogue, Quests, Save/Load
   ```

### **Audit Checklist:**

- [  ] All tests executed and passing
- [ ] All Manager classes instantiable
- [ ] All exports verified
- [ ] Smoke tests pass
- [ ] No TypeScript compilation errors
- [ ] No runtime errors

---

## 📋 PHASE 3: INCREMENTAL IMPROVEMENTS (Ongoing)

**After stable state restored, improve incrementally:**

### **Rule 1: Test After Every Change**

```bash
# ALWAYS run tests after changes
git add -A
npm test
git commit -m "..." # Only if tests pass
```

### **Rule 2: No Automated Batch Changes**

**NEVER again:**
- Run automated refactoring scripts
- Apply fixes to 100+ files at once
- Trust "percentage reduction" metrics

**ALWAYS:**
- Manual review
- Test in isolation
- Incremental application
- Verify each change

### **Rule 3: Proper TypeScript Error Reduction**

If reducing TypeScript errors:

1. **Fix ONE error at a time**
2. **Test after each fix**
3. **Verify no breakage**
4. **Document the fix**
5. **Commit separately**

NOT:
- ❌ Automated script fixing 13,231 errors
- ❌ Batch modifications
- ❌ Trusting metrics

---

## 📋 PHASE 4: IMPROVED WORKFLOW (1 week)

### **New Development Rules:**

1. **Pre-Commit Testing**
   ```bash
   # Add to .git/hooks/pre-commit
   npm test
   ```

2. **CI/CD with Test Execution**
   ```yaml
   # .github/workflows/ci-core.yml
   - name: Run all tests
     run: npm test
   - name: Fail if any test fails
     run: exit 1 if tests fail
   ```

3. **Module Health Dashboard**
   - Track which modules have passing tests
   - Red/yellow/green status
   - Block commits if health degrades

4. **Audit Improvements**
   - Include test execution
   - Verify module instantiation
   - Functional smoke tests
   - Runtime verification

---

## 🎯 SUCCESS CRITERIA

### **Phase 0 Complete When:**
- [ ] Rolled back to Oct 8 commit
- [ ] Tests pass (sample modules)
- [ ] Modules instantiable
- [ ] Framework functional

### **Phase 1 Complete When:**
- [ ] Safe changes restored
- [ ] New modules tested and working
- [ ] Documentation updated
- [ ] No regressions

### **Phase 2 Complete When:**
- [ ] Comprehensive audit run
- [ ] ALL tests executed
- [ ] ALL modules verified
- [ ] Health report generated

### **Phase 3 Complete When:**
- [ ] Proper workflow established
- [ ] Test gates in place
- [ ] No automated batch changes
- [ ] Incremental improvements only

---

## ⚠️ CRITICAL WARNINGS

### **DO NOT:**

1. ❌ Try to "fix" current broken state
   - Too much damage
   - Too many broken modules
   - Not worth the time

2. ❌ Run automated fix scripts
   - They caused this problem
   - They cannot be trusted
   - Manual fixes only

3. ❌ Skip testing
   - This is how we got here
   - Tests must pass before commit
   - No exceptions

4. ❌ Trust metrics alone
   - "96% error reduction" was false
   - "13,231 errors fixed" broke everything
   - Functional tests are truth

### **DO:**

1. ✅ Rollback immediately
2. ✅ Test everything
3. ✅ Incremental changes
4. ✅ Manual review
5. ✅ Verify before commit

---

## 📞 EXECUTION CHECKLIST

**Before starting:**
- [ ] Backup current state (backup branch)
- [ ] Document HEAD commit
- [ ] Identify good commit (Oct 8)
- [ ] Notify team

**During rollback:**
- [ ] Create recovery branch
- [ ] Test at good commit
- [ ] Verify tests pass
- [ ] Force push to master

**After rollback:**
- [ ] Verify framework works
- [ ] Document what happened
- [ ] Update audit process
- [ ] Implement safeguards

**Recovery validation:**
- [ ] All sample tests pass
- [ ] Modules instantiate
- [ ] No "not a constructor" errors
- [ ] Framework usable

---

## 🎯 ESTIMATED TIMELINE

| Phase | Duration | Priority |
|-------|----------|----------|
| **Phase 0: Rollback** | 30 min | P0 - NOW |
| **Phase 1: Restoration** | 2-3 hrs | P0 - TODAY |
| **Phase 2: Audit** | 1 day | P1 - THIS WEEK |
| **Phase 3: Improvements** | Ongoing | P2 |
| **Phase 4: Workflow** | 1 week | P2 |

---

## 🚨 FINAL RECOMMENDATION

**DO THIS NOW:**

```bash
# 1. Backup
git branch backup-broken-state-oct15
git push origin backup-broken-state-oct15

# 2. Find good commit
GOOD_COMMIT=$(git rev-list --before="2025-10-14" --max-count=1 HEAD)

# 3. Rollback
git checkout -b emergency-rollback $GOOD_COMMIT

# 4. Test
npm test -- --testPathPattern="AIPure|CombatPure" 2>&1 | grep "Test Suites:"

# 5. If tests pass, force push
git checkout master
git reset --hard $GOOD_COMMIT
git push --force origin master
```

**Then assess and plan next steps.**

---

**Time is critical. Every hour delayed increases risk of conflicting changes.**  
**Execute Phase 0 immediately.**
