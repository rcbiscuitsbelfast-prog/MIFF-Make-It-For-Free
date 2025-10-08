# Phase 1: TypeScript Error Resolution Plan

**Target:** Reduce TypeScript errors from 140 to 0  
**Timeline:** Next 7 days  
**Priority:** Critical  

## Current Status
- **Starting Point:** 140 TypeScript errors (down from 154)
- **Progress:** 14 errors fixed in immediate next steps
- **Remaining:** 140 errors across multiple modules

## Error Categories Identified

### 1. EventBus API Inconsistencies (High Priority)
- **Issue:** `.on`/`.emit` vs `.subscribe`/`.publish` method mismatches
- **Modules Affected:** TimelineSystemPure, TycoonSystemPure, and others
- **Status:** Partially fixed (added `.on()` method to EventBus)
- **Remaining Work:** Update all modules to use consistent API

### 2. Interface Mismatches (High Priority)
- **Issue:** Object literal properties not matching interface definitions
- **Modules Affected:** TimeSystemPure, TycoonSystemPure, UnityBridgePure
- **Status:** Partially fixed (TimeSystemPure, TycoonSystemPure)
- **Remaining Work:** Fix remaining interface alignment issues

### 3. Missing Method Implementations (Medium Priority)
- **Issue:** Methods referenced but not implemented
- **Modules Affected:** UnityBridgePure, various Manager classes
- **Status:** Some fixes applied
- **Remaining Work:** Complete missing method implementations

### 4. Type Safety Issues (Medium Priority)
- **Issue:** Implicit `any` types, enum/string mismatches
- **Modules Affected:** Multiple modules
- **Status:** Some fixes applied
- **Remaining Work:** Add proper type annotations

## Phase 1 Action Plan

### Day 1-2: EventBus Standardization
- [ ] Audit all modules using EventBus
- [ ] Standardize to `.subscribe`/`.publish` pattern
- [ ] Update legacy `.on`/`.emit` usage
- [ ] Test event handling across modules

### Day 3-4: Interface Alignment
- [ ] Fix remaining TimeSystemPure object literal issues
- [ ] Resolve TycoonSystemPure type mismatches
- [ ] Align UnityBridgePure interface definitions
- [ ] Update Manager interface implementations

### Day 5-6: Missing Implementations
- [ ] Complete UnityBridgePure missing methods
- [ ] Fix CLI harness module resolution
- [ ] Add missing Manager class methods
- [ ] Resolve import path issues

### Day 7: Type Safety & Validation
- [ ] Add explicit type annotations
- [ ] Fix enum/string literal mismatches
- [ ] Resolve implicit `any` types
- [ ] Final validation and testing

## Success Metrics
- **TypeScript Errors:** 140 → 0
- **Compilation Time:** <30 seconds
- **Module Integration:** 100% compatible
- **Test Coverage:** Maintained or improved

## Repository Cleanup Note

**`miff/miff/pure` Directory Investigation Required:**
- Contains 20 modules with only fixture data (no implementation)
- 3 TypeScript files, 21 JSON fixtures, no README files
- Appears to be outdated scaffolding or alternative test data
- **Action:** Investigate usage and consider removal in Phase 3 cleanup
- **Priority:** Low (focus on TypeScript errors first)

## Next Steps
1. Begin EventBus standardization across all modules
2. Systematically fix interface mismatches
3. Complete missing method implementations
4. Validate all changes with TypeScript compilation
5. Update tests to ensure compatibility

---

**Phase 1 Completion Target:** 7 days  
**Next Phase:** Test Infrastructure Stabilization