# Archived Scenarios

This directory contains archived scenario definitions that are maintained for historical reference, remix potential, and contributor learning.

## Status Overview

| Scenario | Status | Remix-Safe | CI-Compatible | Test Coverage |
|----------|--------|------------|---------------|---------------|
| `Alter_forgotten_ames.ts` | ✅ Recovered | ✅ MIT License | ✅ TypeScript Clean | 🔶 Manual Only |
| `Ember pact/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |
| `Trial of echoes/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |
| `Harvest red moon/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |
| `Pact twin flames/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |
| `Song silent bell/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |
| `Mirror many paths/` | 📁 Directory | ⚠️ Unknown | ⚠️ Unknown | ❌ None |

## Recovery Status

### ✅ `Alter_forgotten_ames.ts` - FULLY RECOVERED

**Description**: "The Altar of Forgotten Names" - A ritual-based progression scenario with time-sensitive mechanics and emotional dialogue outcomes.

**Recovery Actions Completed**:
- ✅ Fixed unterminated strings and malformed exports
- ✅ Restored object syntax and function declarations
- ✅ Added mock implementations for archived module compatibility
- ✅ Validated TypeScript compilation (0 errors)
- ✅ Confirmed MIT license compliance
- ✅ Verified CI pipeline compatibility

**Technical Details**:
- **File**: `docs/archive/scenarios/Alter_forgotten_ames.ts`
- **TypeScript**: ✅ Compiles cleanly
- **Jest**: ❌ Not executed (not a test file)
- **Dependencies**: Mock implementations for archived pure modules
- **Exports**: `AltarOfForgottenNames` type and `ScenarioPure` default

**Remix Safety**:
- **License**: MIT (ensures forkability)
- **Author**: MIFF Community
- **Assets**: Generic identifiers only (no embedded content)
- **Dependencies**: Documented and mockable

## Usage Guidelines

### For Contributors
- **Archived scenarios are reference material** - not actively maintained
- **Recovery status indicates CI compatibility** - recovered files won't break builds
- **Mock implementations** allow compilation without external dependencies
- **Remix at your own risk** - verify license compliance before use

### For CI/CD
- **Recovered files** pass TypeScript compilation
- **No test execution** - Jest excludes non-test files
- **Type safety** maintained through mock implementations
- **Build stability** ensured through syntax validation

### For Remixers
- **MIT licensed** scenarios can be freely forked and modified
- **Mock dependencies** can be replaced with actual implementations
- **Scenario structure** follows MIFF standards for compatibility
- **Asset references** are generic and can be customized

## Recovery Process

When recovering archived scenarios:

1. **Syntax Validation**: Fix TypeScript compilation errors
2. **Dependency Mocking**: Create placeholder implementations for missing modules
3. **License Verification**: Ensure MIT or compatible licensing
4. **CI Testing**: Confirm build pipeline compatibility
5. **Documentation**: Update status and recovery notes

## Future Improvements

- [ ] Audit remaining archived scenarios for recovery potential
- [ ] Standardize mock implementations across archived files
- [ ] Create validation scripts for archived scenario integrity
- [ ] Establish clear archival vs. active scenario boundaries