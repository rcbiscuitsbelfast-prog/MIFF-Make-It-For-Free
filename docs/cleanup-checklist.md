# Cleanup Checklist

Use this checklist to track items from PLACEHOLDER_AUDIT.md and ongoing hygiene tasks.

- [ ] Guard/remove debug logs (TopplerScene, html-utils)
- [ ] Document jsdom canvas stubs as test-only
- [ ] Consolidate thin re-exports if unused
- [ ] Keep CI fallback path for gen-toppler as default
- [ ] Add placeholder hygiene to CI (`lint:placeholders`)
- [ ] Review BRITTLE_DEFAULT findings and replace with explicit types/defaults
- [ ] Remove any unused exports or modules
- [ ] Confirm no raw `.ts` is referenced by browser builds
- [ ] Keep README/CONTRIBUTING aligned with hygiene practices