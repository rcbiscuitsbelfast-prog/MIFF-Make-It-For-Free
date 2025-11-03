# PHASE 1B: REMAINING WORK - DEFERRED TO PHASE 4

**Date Deferred:** October 17, 2025  
**Reason:** Foundation complete, security is higher priority  
**Estimated Time:** 4-5 hours  
**Priority:** Low (iterative improvement)

---

## 📋 DEFERRED TASKS (4 items)

### 1. Fix Event Data Access Patterns (2 hours)

**Issue:** Tests access event data incorrectly  
**Current:** `data.old`, `data.new`  
**Should Be:** `event.data.old`, `event.data.new`

**Affected Files:**
- `miff/pure/TimeSystemPure/tests/golden_TimeSystemPure.test.ts`
- `miff/pure/CameraSystemPure/tests/` (if exists)
- `miff/pure/IdleSystemPure/tests/` (if exists)
- `miff/pure/FusionPure/tests/` (if exists)

**Fix Pattern:**
```typescript
// Before:
eventBus.on('event:name', (data) => {
  expect(data.old).toBe('value');
});

// After:
eventBus.on('event:name', (event) => {
  expect(event.data.old).toBe('value');
});
```

**Estimated Time:** 2 hours

---

### 2. Fix Private Method Access (30 minutes)

**Issue:** Tests calling private methods  
**Method:** `getCurrentAcceleration()` is private

**Affected Files:**
- `miff/pure/TimeSystemPure/tests/golden_TimeSystemPure.test.ts`

**Solution Options:**
A. Make method public
B. Add public getter
C. Remove tests for private methods

**Recommended:** Option B (add public getter)
```typescript
// Add to TimeSystemPure:
public getAcceleration(): TimeAcceleration {
  return this.getCurrentAcceleration();
}
```

**Estimated Time:** 30 minutes

---

### 3. Fix Type Mismatches (1 hour)

**Issue:** Mock objects don't match ISpiritInstance interface

**Affected Files:**
- `miff/pure/TeamsPure/tests/integration_TeamsPure.test.ts`
- `miff/pure/TeamsPure/tests/golden_TeamsPure.test.ts`

**Error:**
```
Type 'SpiritInstance' is not assignable to parameter of type 'ISpiritInstance'.
Missing properties: type, isAlive, canAct, getEffectiveStats, etc.
```

**Solution:**
Update mock objects to include all required properties:
```typescript
const mockSpirit: ISpiritInstance = {
  instanceId: 'spirit1',
  name: 'Test Spirit',
  level: 1,
  type: 'fire',
  isAlive: true,
  canAct: true,
  getEffectiveStats: () => ({...}),
  // ... add all required properties
};
```

**Estimated Time:** 1 hour

---

### 4. Fix Contract Test Module Resolution (1 hour)

**Issue:** ts-node can't resolve modules with .ts extensions

**Affected Files:**
- `miff/pure/WebSocketBridgePure/tests/contract.test.ts`
- `miff/pure/GodotBridgePure/tests/contract.test.ts`

**Error:**
```
error TS5097: An import path can only end with a '.ts' extension 
when 'allowImportingTsExtensions' is enabled.
```

**Current Code:**
```typescript
import * as mod from '/workspace/miff/pure/WebSocketBridgePure/index.ts';
```

**Solution Options:**
A. Remove .ts extension from imports
B. Update tsconfig for ts-node
C. Use different test approach

**Recommended:** Option A (remove .ts extension)
```typescript
import * as mod from '/workspace/miff/pure/WebSocketBridgePure/index';
```

**Estimated Time:** 1 hour

---

## 🎯 WHEN TO TACKLE THIS WORK

### Recommended Phase: **Phase 4 (Code Quality)**

**Why Phase 4?**
- Not blocking development
- Test infrastructure is solid
- Can be done incrementally
- Aligns with code quality improvements

**Phase 4 Already Includes:**
- Reducing any types
- Replacing console.logs
- Refactoring large files
- Adding JSDoc

**Adding Test Polish Fits Perfectly:**
- Similar type of work (quality improvement)
- Same iterative approach
- Non-blocking nature

---

## 📊 IMPACT OF DEFERRING

### What Works Now:
✅ Tests compile  
✅ Tests run  
✅ Can debug test failures  
✅ Foundation is solid  
✅ Development feedback loop exists

### What's Deferred:
⏳ Some tests fail due to minor bugs  
⏳ 80% pass rate not yet achieved  
⏳ Coverage report not generated

### Risk Assessment:
**Risk:** LOW ✅

**Reasoning:**
- Foundation is complete
- Failures are specific and understood
- Can be fixed anytime
- Doesn't block development
- Security is higher priority

---

## 🔄 INTEGRATION INTO PHASE 4

### Updated Phase 4 Task List:

**Original Phase 4:**
1. Reduce any types (8,162 → <1,000)
2. Replace console.logs (5,592 → <500)
3. Refactor large files (5 files >1,500 lines)
4. Add JSDoc to public APIs

**Phase 4 + Test Polish:**
1. Reduce any types (8,162 → <1,000)
2. Replace console.logs (5,592 → <500)
3. Refactor large files (5 files >1,500 lines)
4. Add JSDoc to public APIs
5. **Fix event data access patterns** (2 hours)
6. **Fix private method access** (30 minutes)
7. **Fix type mismatches** (1 hour)
8. **Fix contract tests** (1 hour)
9. **Generate coverage report** (30 minutes)

**New Phase 4 Duration:** 4 weeks → 4.5 weeks

---

## 📝 QUICK REFERENCE

### Files to Fix:

```
miff/pure/TimeSystemPure/tests/golden_TimeSystemPure.test.ts
  - Fix: event data access (event.data.property)
  - Fix: private method access (getAcceleration())

miff/pure/TeamsPure/tests/integration_TeamsPure.test.ts
miff/pure/TeamsPure/tests/golden_TeamsPure.test.ts
  - Fix: ISpiritInstance mock objects

miff/pure/WebSocketBridgePure/tests/contract.test.ts
miff/pure/GodotBridgePure/tests/contract.test.ts
  - Fix: Remove .ts from import paths
```

---

## ✅ DECISION RATIONALE

**Why Defer?**

1. **Foundation Complete** ✅
   - Tests compile
   - Tests run
   - Infrastructure solid

2. **Security is Critical** ⚠️
   - 150+ CLI injection vulnerabilities
   - Production deployment blocker
   - Affects safety NOW

3. **Low Risk** ✅
   - Test issues are minor
   - Well understood
   - Easy to fix later

4. **Efficient Resource Use** ⚠️
   - Security needs 2-3 days
   - Test polish needs 4-5 hours
   - Better to batch similar work

5. **Natural Fit** ✅
   - Phase 4 is about quality
   - Test polish is quality work
   - Makes logical sense together

---

## 🎯 SUCCESS CRITERIA (When Revisited)

### When Phase 4 Tackles This:

**Target:**
- ✅ 80%+ test pass rate
- ✅ All type mismatches fixed
- ✅ All event handlers corrected
- ✅ Coverage report generated
- ✅ <20% of tests failing

**Verification:**
```bash
npm test 2>&1 | grep "Tests:"
# Should show: 80% passed or better

npm test -- --coverage
# Should generate coverage report
```

---

## 📅 TIMELINE

**Current:** Phase 1b paused at 33% (2/6 tasks)  
**Phase 2:** Security (2-3 days)  
**Phase 3:** HTML Consolidation (1 day)  
**Phase 4:** Code Quality + Test Polish (4.5 weeks)  
**Phase 1b Completion:** During Phase 4 ✅

---

*Deferred: October 17, 2025*  
*To Be Completed: Phase 4 (Code Quality)*  
*Estimated Time: 4-5 hours*  
*Priority: Low (improvement, not blocker)*
