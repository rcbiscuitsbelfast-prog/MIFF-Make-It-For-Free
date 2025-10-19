# CONSOLE.LOG REPLACEMENT STRATEGY
## Phase 1: Emergency Stabilization - Logging Task

**Date:** October 18, 2025  
**Total console.log statements:** 5,567 (estimated from previous audit)

---

## STRATEGY OVERVIEW

### Key Decision: CLI Harnesses vs. Core Code

**CLI Harnesses (160 files):**
- Purpose: Interactive command-line tools for humans
- Current: 20 files with console.log
- **Decision:** KEEP console.log in CLI harnesses ✅
- **Reason:** These tools are meant for human output, console.log is appropriate

**Core Code (Managers, Services, Utilities):**
- Purpose: Background processing, libraries, services
- Current: Unknown count with console.log
- **Decision:** REPLACE with Logger 🎯
- **Reason:** Need structured logging for production

---

## PHASED REPLACEMENT PLAN

### Phase A: Identify & Categorize (1-2 hours)

**Step 1:** Find all console.log locations
```bash
grep -r "console\.log" miff/pure --include="*.ts" ! -name "*.test.ts" > console_log_audit.txt
```

**Step 2:** Categorize by file type:
1. CLI Harnesses (keep as-is)
2. Manager files (replace with Logger)
3. Service files (replace with Logger)
4. Utility files (replace with Logger)
5. Test files (ignore - keep console.log)

---

### Phase B: Replace Manager Files (4-6 hours)

**Target:** All `Manager.ts` files

**Pattern:**
```typescript
// Before:
console.log('User action completed', userId);
console.error('Operation failed:', error);

// After:
import { Logger } from '../shared/logging';
const logger = Logger.create('ModuleName');

logger.info('User action completed', { userId });
logger.error('Operation failed', { error });
```

**Files to Update:**
- CameraSystemPure/Manager.ts
- DataLakePure/Manager.ts
- ServiceDiscoveryPure/Manager.ts
- ... ~130 Manager files

---

### Phase C: Replace Core Services (4-6 hours)

**Target:** Service and utility files

**Examples:**
- EventBusPure/EventBusPure.ts
- shared/cache/CacheManager.ts
- HapticsPure/index.ts
- DebugOverlayPure/Manager.ts

---

### Phase D: Verify & Test (2-3 hours)

**Validation:**
```bash
# Verify no console.log in non-CLI files
grep -r "console\.log" miff/pure \
  --include="*.ts" \
  ! -name "*.test.ts" \
  ! -name "cliHarness.ts" \
  ! -name "cli.ts"
# Should return 0 matches
```

---

## FILES TO KEEP console.log

### 1. CLI Harnesses (160 files)
```
miff/pure/*/cliHarness.ts
miff/pure/*/cli.ts
```

**Reason:** These are interactive command-line tools for humans

**Examples:**
- AIProfilesPure/cliHarness.ts (outputs JSON for piping)
- ChallengesPure/cliHarness.ts (interactive CLI game)
- TimeSystemPure/cliHarness.ts (CLI utility)

### 2. Test Files (433 files)
```
miff/pure/*/*.test.ts
```

**Reason:** Tests may use console.log for debugging

---

## FILES TO REPLACE console.log

### 1. Manager Files (~130 files)

**Priority: HIGH** 🎯

**Pattern Found:**
- CameraSystemPure/Manager.ts
- DataLakePure/Manager.ts
- ServiceDiscoveryPure/Manager.ts
- DebugOverlayPure/Manager.ts

**Why:** These are core business logic, need structured logging

---

### 2. Event & Service Files (~20 files)

**Priority: HIGH** 🎯

**Examples:**
- EventBusPure/EventBusPure.ts
- shared/cache/CacheManager.ts
- HapticsPure/index.ts

**Why:** Core framework files, production code

---

### 3. Utility Files (~10 files)

**Priority: MEDIUM** ⚠️

**Examples:**
- Various index.ts files with logging

**Why:** Libraries should use structured logging

---

## REPLACEMENT SCRIPT

### Automated Replacement (Where Safe)

```bash
#!/bin/bash
# Replace simple console.log patterns

# Find Manager files with console.log
find miff/pure -name "Manager.ts" -exec grep -l "console\.log" {} \;

# For each file:
# 1. Add Logger import at top
# 2. Create logger instance
# 3. Replace console.log with logger.info
# 4. Replace console.error with logger.error
# 5. Replace console.warn with logger.warn
```

**Manual Review Required:**
- Verify logger is imported
- Verify module name is correct
- Verify context objects are valid
- Test each module after replacement

---

## EXAMPLE REPLACEMENT

### Before: EventBusPure/EventBusPure.ts

```typescript
export class EventBusPure {
  private subscriptions = new Map<string, Subscription[]>();

  emit(eventType: string, data: any): void {
    console.log(`Event emitted: ${eventType}`, data);
    
    const subs = this.subscriptions.get(eventType);
    if (!subs) {
      console.log(`No subscribers for event: ${eventType}`);
      return;
    }

    for (const sub of subs) {
      try {
        sub.handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    }
  }
}
```

### After: EventBusPure/EventBusPure.ts

```typescript
import { Logger } from '../shared/logging';

const logger = Logger.create('EventBusPure');

export class EventBusPure {
  private subscriptions = new Map<string, Subscription[]>();

  emit(eventType: string, data: any): void {
    logger.debug('Event emitted', { eventType, data });
    
    const subs = this.subscriptions.get(eventType);
    if (!subs) {
      logger.debug('No subscribers for event', { eventType });
      return;
    }

    for (const sub of subs) {
      try {
        sub.handler(data);
      } catch (error) {
        logger.error('Error in event handler', { eventType, error });
      }
    }
  }
}
```

**Key Changes:**
1. ✅ Import Logger
2. ✅ Create logger instance with module name
3. ✅ Replace console.log with logger.debug/info
4. ✅ Replace console.error with logger.error
5. ✅ Add context objects ({ eventType, data })
6. ✅ Use appropriate log levels

---

## LOG LEVEL MAPPING

### console.log → Logger

| console | Logger | When to Use |
|---------|--------|-------------|
| console.log() | logger.info() | General information |
| console.log() | logger.debug() | Verbose/development info |
| console.warn() | logger.warn() | Warnings, potential issues |
| console.error() | logger.error() | Errors, exceptions |
| console.error() | logger.fatal() | Critical, unrecoverable errors |

**Guidelines:**
- Use `debug()` for detailed execution flow
- Use `info()` for important events
- Use `warn()` for potential problems
- Use `error()` for exceptions
- Use `fatal()` for system failures

---

## ESLINT INTEGRATION

### Update .eslintrc.json

```json
{
  "rules": {
    "no-console": ["error", {
      "allow": []  // No console.log allowed in production code
    }]
  },
  "overrides": [
    {
      "files": ["**/cliHarness.ts", "**/cli.ts", "**/*.test.ts"],
      "rules": {
        "no-console": "off"  // Allow console.log in CLI harnesses and tests
      }
    }
  ]
}
```

**Effect:**
- ❌ console.log in Manager.ts → ESLint error
- ✅ console.log in cliHarness.ts → Allowed
- ✅ console.log in *.test.ts → Allowed

---

## ESTIMATED EFFORT

### By Category:

| Category | Files | console.log Count | Effort | Priority |
|----------|-------|-------------------|--------|----------|
| CLI Harnesses | 160 | ~200 | 0 hours (keep) | N/A |
| Manager Files | 130 | ~2,000 | 6-8 hours | HIGH |
| Service Files | 20 | ~500 | 2-3 hours | HIGH |
| Utility Files | 10 | ~200 | 1-2 hours | MEDIUM |
| Test Files | 433 | ~2,667 | 0 hours (keep) | N/A |
| **TOTAL** | **753** | **~5,567** | **9-13 hours** | - |

**Actual Work:** 9-13 hours (replacing ~2,700 statements)  
**Skipped Work:** CLI harnesses + tests (~2,867 statements kept)

---

## SUCCESS METRICS

### Phase 1 Complete When:

1. ✅ All Manager.ts files use Logger
2. ✅ All Service files use Logger
3. ✅ Core EventBus uses Logger
4. ✅ ESLint enforces no-console (with exemptions)
5. ✅ CLI harnesses still use console.log (exempt)
6. ✅ Tests still use console.log (exempt)

### Validation:

```bash
# Should return 0 (no console.log in non-CLI production code)
grep -r "console\.log" miff/pure \
  --include="*.ts" \
  ! -name "*.test.ts" \
  ! -name "cliHarness.ts" \
  ! -name "cli.ts" | wc -l

# Should return ~200 (console.log in CLI harnesses - allowed)
grep -r "console\.log" miff/pure \
  --include="cliHarness.ts" | wc -l
```

---

## IMPLEMENTATION PLAN

### Week 1:

**Day 1-2: Manager Files (6-8 hours)**
- Replace console.log in all Manager.ts files
- Add Logger imports
- Test each module

**Day 3: Service Files (2-3 hours)**
- Replace console.log in EventBusPure, CacheManager, etc.
- Test core services

**Day 4: Utility Files (1-2 hours)**
- Replace console.log in remaining files
- Verify all replacements

**Day 5: Verification (2-3 hours)**
- Run ESLint
- Fix any issues
- Final testing

**Total:** 11-16 hours (2-3 days full-time)

---

## RISKS & MITIGATIONS

### Risk 1: Breaking CLI Tools

**Risk:** Accidentally replace console.log in CLI harnesses  
**Mitigation:** Use ESLint overrides to allow console.log in **/cliHarness.ts  
**Validation:** Test CLI tools after changes

### Risk 2: Incorrect Log Levels

**Risk:** Using wrong log level (info vs debug vs error)  
**Mitigation:** Follow log level mapping guide  
**Validation:** Review logs in development mode

### Risk 3: Missing Context

**Risk:** Not adding context objects to logger calls  
**Mitigation:** Add context for all important variables  
**Validation:** Review logger calls for useful context

---

## NEXT STEPS

**Immediate:**
1. Update .eslintrc.json with console.log rules + overrides
2. Start with EventBusPure (high-visibility core file)
3. Replace Manager files in batches of 10-20
4. Test after each batch
5. Verify with ESLint

**This Sprint:**
- Complete 50% of Manager files (65 files)
- Complete all Service files (20 files)
- Validate with ESLint

**Next Sprint:**
- Complete remaining 50% of Manager files
- Complete all Utility files
- Final verification
- Documentation update

---

## CONCLUSION

**Realistic Estimate:** 11-16 hours of actual work

**Why Less Than Original 20-30 hours?**
- Keep CLI harnesses as-is (~200 statements)
- Keep test files as-is (~2,667 statements)
- Only replace ~2,700 statements in core code
- Automated patterns for simple replacements

**Deliverables:**
- ✅ Structured logging in all core code
- ✅ ESLint enforcement with exemptions
- ✅ CLI tools still work (keep console.log)
- ✅ Production-ready logging system

---

*Strategy Document: October 18, 2025*  
*Status: Ready for implementation*  
*Estimated Completion: 2-3 days*
