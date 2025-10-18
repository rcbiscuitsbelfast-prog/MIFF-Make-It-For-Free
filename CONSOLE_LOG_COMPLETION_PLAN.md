# Console.log Migration - COMPLETION PLAN
## Target: 100% (160/160 files)

**Date:** October 18, 2025  
**Current:** 20/160 files (13%), 342 console calls replaced  
**Target:** 160/160 files (100%), ~2,700 console calls replaced

---

## EXECUTION STRATEGY

### Phase 1: High-Impact Files (15-20+ calls each)
**Priority:** HIGHEST - These files have the most console statements

Process in batches of 5-10 files, commit after each batch.

### Phase 2: Medium Files (5-15 calls each)
**Priority:** HIGH - Significant impact, manageable size

Process in batches of 10-15 files, commit after each batch.

### Phase 3: Small Files (1-5 calls each)
**Priority:** MEDIUM - Complete the cleanup

Process in batches of 20-30 files, commit after each batch.

### Phase 4: Verification
**Priority:** CRITICAL - Ensure completeness

1. Verify all Manager.ts files migrated
2. Check for any missed console calls
3. Run linting to confirm no violations
4. Final quality check

---

## QUALITY STANDARDS

Every replacement MUST include:

✅ **Import Statement**
```typescript
import { Logger } from '../shared/logging';
const logger = Logger.create('ModuleName');
```

✅ **Structured Context**
```typescript
logger.info('Operation completed', { id, name, status });
```

✅ **Proper Log Levels**
- `logger.debug()` - Low-priority/verbose
- `logger.info()` - Normal operations
- `logger.warn()` - Issues/edge cases
- `logger.error()` - Failures/errors
- `logger.fatal()` - Critical failures

✅ **Error Handling**
```typescript
logger.error('Operation failed', { id, error: err });
```

---

## BATCH STRATEGY

### Batch Size Guidelines:
- **High-impact (15+ calls):** 5-10 files per batch
- **Medium (5-15 calls):** 10-15 files per batch
- **Small (1-5 calls):** 20-30 files per batch

### Commit Strategy:
- Commit after each batch
- Include progress in commit message
- Push regularly to save work

---

## TRACKING

### Completed Files (20):
1. EventBusPure (7)
2. CacheManager (1)
3. CameraSystemPure (25)
4. TeleportationSystemPure (24)
5. RitualSystemPure (24)
6. DrivingSystemPure (20)
7. AIPure (18)
8. AnimationSystemPure (17)
9. MagicSystemPure (14)
10. BlockchainPure (26)
11. BackupSystemPure (25)
12. WeatherSystemPure (27)
13. EncounterPure (9)
14. ARVRPure (17)
15. DataAnalysisPure (19)
16. DebugOverlayPure (6)
17. APIGatewayPure (14)
18. TycoonSystemPure (19)
19. DialoguePure (4)
20. (one more completed)

### Progress Tracking:
- [ ] Batch 1: Files 21-30 (High-impact)
- [ ] Batch 2: Files 31-40 (High-impact)
- [ ] Batch 3: Files 41-50 (High-impact)
- [ ] Batch 4: Files 51-65 (Medium)
- [ ] Batch 5: Files 66-80 (Medium)
- [ ] Batch 6: Files 81-100 (Medium)
- [ ] Batch 7: Files 101-130 (Small)
- [ ] Batch 8: Files 131-160 (Small)
- [ ] Final verification

---

## ESTIMATED TIME

**Based on current pace (~2 files/hour):**

- Remaining files: 140
- Hours required: ~70 hours
- Working days (8h/day): ~9 days
- Calendar time (distributed): 2-3 weeks

**Accelerated pace (~3-4 files/hour for small files):**
- High-impact (30 files): ~15 hours
- Medium (50 files): ~15 hours
- Small (60 files): ~15 hours
- **Total: ~45 hours (6-7 working days)**

---

## SUCCESS CRITERIA

✅ All 160 Manager.ts files migrated  
✅ All console.log/error/warn/info/debug replaced  
✅ 100% quality maintained  
✅ ESLint passing (no console violations)  
✅ Structured logging with context everywhere  
✅ Documentation updated  

---

## NOTES

- CLI harnesses excluded (per strategy)
- Test files excluded (console.log OK for debugging)
- Quality over speed always
- Regular commits to save progress
- Track discoveries (files with more calls than expected)

---

*Plan created: October 18, 2025*  
*Status: EXECUTING*  
*Target: 100% completion*
