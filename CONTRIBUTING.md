# Contributing to MIFF

Thank you for your interest in contributing!

## Code of Conduct
Be respectful and collaborative.

## Development
- CLI-first modules, engine-agnostic, remix-safe
- Deterministic golden-output tests for new features
- Schema version: use v14+ and document changes
- Current development phase: Phase 16 (Funding & Global Outreach)

## Remix-Safe Onboarding

### What is Remix-Safe?
MIFF modules are designed to be **remix-safe**, meaning they can be safely forked, modified, and redistributed without legal concerns. This is achieved through:

- **No Proprietary Assets**: All modules ship without copyrighted content
- **Engine-Agnostic Design**: Modules work across Unity, Web, and Godot
- **Deterministic Outputs**: Same inputs always produce same outputs
- **Clear Attribution**: All external dependencies are properly documented

### Remix Safety Checklist
Before contributing, ensure your module:
- [ ] Contains no hardcoded assets or proprietary content
- [ ] Uses only open-source dependencies with compatible licenses
- [ ] Includes proper attribution for any external resources
- [ ] Has clear documentation of remix hooks and override points
- [ ] Passes automated remix-safety audits

### Audit Tools
Use these tools to validate remix safety:
- **[RemixAuditPure](systems/RemixAuditPure/README.md)** - Scans modules for compliance
- **[CIEnforcerPure](systems/CIEnforcerPure/README.md)** - Validates contributor standards
- **[AssetValidatorPure](systems/AssetManifestPure/README.md)** - Checks asset licensing and attribution

### Hygiene & Placeholders
- **PLACEHOLDER_AUDIT.md**: Review current placeholders and cleanup suggestions
- **scripts/validate-placeholders.ts**: Run to scan for new TODOs/stubs and brittle defaults
- **cleanup-checklist.md**: Track and check off items as you resolve them

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

## Current Development Phases

### Completed Phases (1-15)
- **Phase 1-5**: Core systems, interop, attribution, derived systems, scenarios
- **Phase 6-8**: Codebase cleanup, engine bridges, visual tools
- **Phase 9-11**: Documentation, testing infrastructure, auto builder
- **Phase 12-14**: Core gameplay systems, quest/asset management, CI & remix safety
- **Phase 15**: Visual replay & testing infrastructure

### Current Phase (16)
- **Phase 16**: Funding, Outreach & Global Deployment
- Focus: Sustainability, community building, international expansion
- Goal: Establish MIFF as a global, sustainable framework

## Extending Modules & Adding New Genres

### Module Extension
Each MIFF module is designed to be extensible through **remix hooks**:
- **Override Points**: Well-defined interfaces for custom behavior
- **Plugin System**: Modular architecture for adding new features
- **Event System**: Hook into module lifecycle events
- **Configuration**: JSON-based configuration for customization

### Adding New Genres
To add support for new game genres:

1. **Identify Required Systems**: Determine which core systems the genre needs
2. **Create Genre-Specific Modules**: Build new modules following MIFF patterns
3. **Add Platform Support**: Ensure Unity, Web, and Godot compatibility
4. **Create Demo Scenarios**: Build example games showcasing the genre
5. **Update Documentation**: Add genre-specific guides and examples

### Example Genre Extensions
- **Racing Games**: Extend `PhysicsSystemPure` with vehicle physics
- **Strategy Games**: Add turn-based logic to `TimeSystemPure`
- **Puzzle Games**: Create new `PuzzleSystemPure` module
- **Roguelikes**: Extend `ProceduralGenerationPure` for dungeon generation

### Testing New Extensions
- Run `RemixAuditPure` to ensure compliance
- Use `CIEnforcerPure` to validate standards
- Create golden tests for deterministic behavior
- Test across all supported platforms

## Onboarding Flow
- Read Quick Start: `docs/QUICK_START.md`
- Review latest audit: `docs/audit/MIFF_Audit_2025-09.md`
- Try the Onboarding Challenge: `docs/ONBOARDING_CHALLENGE.md`
