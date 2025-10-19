# Test Infrastructure Fix Plan
## Systematic Approach to Fix 394 Failing Test Suites

**Date:** October 18, 2025  
**Current State:** 44 passing, 394 failing (10% pass rate)  
**Goal:** Get to 70%+ pass rate  
**Estimated Time:** 20-30 hours

---

## ANALYSIS OF FAILURES

### Test Execution Results

**Total Test Suites:** 442  
**Passing:** 44 (10%)  
**Failing:** 394 (89%)  
**Skipped:** 4 (1%)

### Primary Failure Causes

1. **TypeScript Compilation Errors** (90% of failures)
   - Import path issues
   - Type mismatches
   - Missing type definitions
   - Syntax errors from previous edits

2. **Test Helper Issues** (5% of failures)
   - ManagerTestHelpers not properly applied
   - Generic method mappings incorrect
   - Missing helper imports

3. **Actual Test Logic Issues** (5% of failures)
   - Changed APIs
   - Updated function signatures
   - Deprecated methods

---

## STRATEGY

### Phase 1: Fix Compilation Errors (10-15 hours)

**Approach:** Systematic file-by-file fixes

**Steps:**
1. Run `npm test` to get error list
2. Group errors by type
3. Fix most common errors first
4. Re-run after each batch

**Common Fixes Needed:**
- Fix import paths
- Update type definitions
- Remove syntax errors
- Fix test helper applications

### Phase 2: Fix Test Helper Issues (3-5 hours)

**Approach:** Verify test helper application

**Steps:**
1. Check all Manager.test.ts files
2. Verify helper imports
3. Verify method mappings
4. Fix incorrect domain method names

### Phase 3: Update Test Logic (5-10 hours)

**Approach:** Update tests for API changes

**Steps:**
1. Identify changed APIs
2. Update test expectations
3. Fix deprecated method calls
4. Verify test assertions

### Phase 4: Verification (2 hours)

**Approach:** Full test suite validation

**Steps:**
1. Run full test suite
2. Verify >70% pass rate
3. Document remaining failures
4. Create issues for future fixes

---

## EXECUTION PLAN

### Batch 1: Quick Wins (2-3 hours)

**Target:** Fix tests that are almost working

Files to focus on:
- Tests with single syntax errors
- Tests with simple import issues
- Tests with missing semicolons

**Expected Gain:** +50-100 passing tests

### Batch 2: Manager Tests (5-7 hours)

**Target:** Fix Manager.test.ts files

47 Manager test files need:
- Correct test helper application
- Fix domain method mappings
- Update type expectations

**Expected Gain:** +30-40 passing test suites

### Batch 3: Type Errors (5-8 hours)

**Target:** Fix TypeScript type mismatches

Common issues:
- Generic type constraints
- Interface mismatches
- Missing type imports
- 'any' type issues

**Expected Gain:** +100-150 passing tests

### Batch 4: Import Paths (3-5 hours)

**Target:** Fix relative import paths

Issues:
- Incorrect relative paths
- Missing barrel exports
- Circular dependencies

**Expected Gain:** +50-80 passing tests

### Batch 5: Remaining Issues (3-5 hours)

**Target:** Fix remaining failures

Approach:
- One-by-one fixes
- Document complex issues
- Create follow-up tasks

**Expected Gain:** +30-50 passing tests

---

## TRACKING PROGRESS

### Metrics to Monitor

1. **Test Suite Pass Rate**
   - Current: 10%
   - Target: 70%
   - Stretch: 85%

2. **Individual Test Pass Rate**
   - Current: 69%
   - Target: 85%
   - Stretch: 95%

3. **Compilation Errors**
   - Current: ~400 files
   - Target: <50 files
   - Stretch: 0 files

### Progress Checkpoints

**After 5 hours:** 20-30% pass rate  
**After 10 hours:** 40-50% pass rate  
**After 15 hours:** 60-70% pass rate  
**After 20 hours:** 70-80% pass rate  
**After 25 hours:** 80%+ pass rate

---

## STARTING EXECUTION

### Immediate Actions

1. Create tracking spreadsheet
2. Run initial test suite (baseline)
3. Extract all compilation errors
4. Group by error type
5. Start with most common error

### First Batch Focus

**Most Common Errors:**
1. Missing semicolons
2. Extra closing braces
3. Import path issues
4. Type mismatches

**Files to Fix First:**
- APIGatewayPure/Manager.test.ts
- Simple test files with 1-2 errors
- High-value modules (EventBus, State, RNG)

---

## AUTOMATION OPPORTUNITIES

### Scripts to Create

1. **find-common-errors.py**
   - Parse test output
   - Group errors by type
   - Generate fix suggestions

2. **fix-import-paths.py**
   - Scan for broken imports
   - Suggest correct paths
   - Auto-fix when confident

3. **validate-test-helpers.py**
   - Check Manager.test.ts files
   - Verify helper application
   - Report issues

4. **track-progress.py**
   - Run tests periodically
   - Track pass rate over time
   - Generate progress report

---

## SUCCESS CRITERIA

### Minimum Viable (Must Have)

- [ ] 70% of test suites pass
- [ ] 85% of individual tests pass
- [ ] All compilation errors fixed
- [ ] No obvious syntax errors

### Target (Should Have)

- [ ] 80% of test suites pass
- [ ] 90% of individual tests pass
- [ ] Test helpers working correctly
- [ ] Documentation updated

### Stretch (Nice to Have)

- [ ] 90% of test suites pass
- [ ] 95% of individual tests pass
- [ ] All Manager tests pass
- [ ] Automated fix scripts created

---

## NEXT STEPS

1. Start with Batch 1 (Quick Wins)
2. Fix APIGatewayPure/Manager.test.ts syntax
3. Run targeted tests to verify fixes
4. Move to next batch
5. Track progress after each batch

**Status:** Ready to execute  
**Priority:** Critical  
**Estimated Duration:** 20-30 hours
