# Architecture & Modularity Audit

## Highlights
- Pure modules under `miff/pure/` are well-factored by domain; consistent naming
- Legacy web shells under `site/` and `docs/site/` now redirected; unified pages under `docs/`

## Risks / Gaps
- Cross-module coupling and circular deps: pending graph analysis
- Ownership metadata missing for some modules

## Actions
- Generate dependency graphs and flag cycles
- Add CODEOWNERS per module and document public APIs