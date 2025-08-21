# Contributing to MIFF (Newhaven)

- Branching: `docs/*`, `feat/*`, `refactor/*`, `fix/*`
- Commit style: scope in parentheses, concise summary
- PRs: small, focused, with deterministic CLI steps and seeds

## Remix-Safe Principles
- Only include original or public-domain assets (CC0 preferred)
- Data-first; JSON fixtures and schemas over binary blobs when possible
- Keep adapters engine-agnostic; no Unity references in `miff/pure`

## Getting Started
- Read `ROADMAP.md` for active phase and checklists
- Run CLI harnesses (see modules under `miff/pure/*TestHarness.cs`)
- Add seeds/fixtures for deterministic golden tests

## Naming
- Classes: PascalCase; methods: PascalCase; fields: camelCase
- Avoid abbreviations; aim for clarity over brevity

## Tests
- Prefer pure C# unit tests and CLI harness demos
- Use seeds for RNG to ensure reproducibility

## Code Review
- Explain trade-offs; link to roadmap items
- Include before/after behavior when applicable