# CI Gate Tightening Checklist

- [ ] Fail type-check on errors (currently failing)
- [ ] Fail lint on errors (verify config)
- [ ] Fail coverage < threshold
- [ ] Remove || echo in workflows
- [ ] Enforce Snyk/CodeQL as required checks
- [ ] Enforce SBOM + audit high/critical→fail

