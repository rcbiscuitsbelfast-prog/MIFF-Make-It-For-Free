# Contributing to MIFF

Thank you for your interest in contributing!

## Code of Conduct
Be respectful and collaborative.

## Development
- CLI-first modules, engine-agnostic, remix-safe
- Deterministic golden-output tests for new features
- Schema version: use v12+ and document changes

## Contributor License Agreement (CLA)
By submitting a contribution (code, docs, assets) to this repository, you agree to the following:
- You certify that you have the right to submit the contribution under the open-source license(s) indicated in this repository (AGPLv3) and the MIFF commercial license.
- You grant the MIFF maintainers a perpetual, worldwide, non-exclusive, sublicensable, transferable license to use, reproduce, modify, distribute, and relicense your contribution under the MIFF commercial license.
- You retain copyright in your contributions.

## Dual-License Model
- MIFF is available under AGPLv3 and a separate commercial license.
- Commercial use (including closed-source or removal of attribution) requires a paid license. Contact: miff@yourdomain.dev
- Contributions may be incorporated into commercial offerings; contributors are not owed royalties for such uses.

## How to Contribute
1. Fork and create a feature branch
2. Add module code with CLI harness, samples, golden tests, README
3. Ensure consistency with standardized JSON outputs { op, status, issues, resolvedRefs }
4. Update ROADMAP.md if adding new module/phase
5. Open a PR describing changes and schema impact