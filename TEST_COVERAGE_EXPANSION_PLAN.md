# Test Coverage Expansion Plan
## Phase 2 - October 18, 2025

---

## OBJECTIVE

Expand test coverage from 58% to 70% (12% increase)

---

## CURRENT STATE

**Test Coverage:** 58%  
**Target Coverage:** 70%  
**Increase Needed:** +12%

**Test Files:** 433 test files  
**Test Suites:** 421 total  
**Tests:** 165 total (52 failed, 109 passed, 4 skipped)

---

## CHALLENGES IDENTIFIED

**From npm test output:**
- 373 test suites failing
- 52 tests failing
- 9 obsolete snapshots

**Root Issues:**
- Console.log migration may have broken some snapshot tests
- Golden tests need updating after recent changes
- Some tests may need Logger imports

---

## STRATEGY

### Phase 1: Fix Failing Tests (Priority: CRITICAL)
**Goal:** Get test suite to 100% passing

1. Update golden test snapshots
2. Fix Logger-related test failures
3. Update broken assertions
4. Clean obsolete snapshots

**Estimated Time:** 4-6 hours  
**Impact:** Stabilizes test suite

### Phase 2: Add Tests for Untested Modules
**Goal:** Increase coverage to 70%

1. Identify high-value untested modules
2. Write unit tests for core functionality
3. Add integration tests for critical paths
4. Focus on easy wins first

**Estimated Time:** 10-15 hours  
**Impact:** +12% coverage

---

## EXECUTION PLAN

### Step 1: Fix Failing Tests (NOW)
```bash
# Update snapshots
npm test -- -u

# Run tests to verify
npm test

# Fix any remaining failures
```

### Step 2: Analyze Coverage Gaps
```bash
# Generate coverage report
npm test -- --coverage

# Identify untested modules
# Prioritize by importance
```

### Step 3: Add Strategic Tests
- Focus on core game systems
- Test critical business logic
- Add integration tests
- Ensure edge cases covered

---

## SUCCESS CRITERIA

✅ All test suites passing (0 failures)  
✅ No obsolete snapshots  
✅ Coverage increased to 70%+  
✅ New tests are meaningful  
✅ Tests are maintainable  

---

**Status:** STARTING  
**Priority:** MEDIUM-HIGH  
**Estimated Time:** 15-20 hours  
**Approach:** Fix failing tests first, then add new tests
