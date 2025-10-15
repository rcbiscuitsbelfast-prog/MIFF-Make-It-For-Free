# Workflow Queue Crisis - Temporary Disabling

**Date:** October 15, 2025  
**Issue:** 100+ workflows queued, blocking all CI/CD  
**Action:** Temporarily disable most workflows to clear queue

## Workflows to Keep Active (3 only)
1. ci-core.yml - Core CI
2. security.yml - Security
3. test-coverage.yml - Coverage

## Workflows to Temporarily Disable (17)
Rename these by adding `.disabled` suffix:
- audit-ci.yml → audit-ci.yml.disabled
- build-deploy.yml → build-deploy.yml.disabled
- capa-validation.yml → capa-validation.yml.disabled
- cli-harness-validation.yml → cli-harness-validation.yml.disabled
- coverage.yml → coverage.yml.disabled
- lifecycle-hook-coverage.yml → lifecycle-hook-coverage.yml.disabled
- lighthouse-ci.yml → lighthouse-ci.yml.disabled
- link-check.yml → link-check.yml.disabled
- maintenance.yml → maintenance.yml.disabled
- monitoring.yml → monitoring.yml.disabled
- production-deploy.yml → production-deploy.yml.disabled
- release.yml → release.yml.disabled
- schema-drift-detection.yml → schema-drift-detection.yml.disabled
- security-scan.yml → security-scan.yml.disabled
- test-coverage-regression.yml → test-coverage-regression.yml.disabled
- testing.yml → testing.yml.disabled
- transport-layer-fidelity.yml → transport-layer-fidelity.yml.disabled

## Re-enable Strategy
After queue clears and root is organized:
1. Re-enable 3 workflows per day
2. Monitor queue status
3. Ensure no jam recurs

## Why This Happened
- 20 workflows × multiple pushes = queue jam
- GitHub has concurrency limits
- Documentation commits don't need full CI
