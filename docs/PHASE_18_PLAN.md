# Phase 18 – Orchestration Expansion and Test Stabilization

## Objectives
- Stabilize Jest runner and restore legacy suite compatibility
- Expand orchestration coverage to high-readiness modules
- Prepare contributor onboarding packs for playable zones

## Workstreams
1) Jest Runner Stabilization
- Pin compatible Jest + worker versions
- Align `jest.setup.js` with environment (jsdom/node projects)
- Gate flaky CI suites; add `--runInBand` fallback profile
- Fix `jest-util` resolution issues in golden tests

2) Orchestration Coverage Expansion
- InventoryPure: author scenarios and golden runs
- CombatCorePure: combat sequences and assertions
- DialogueSystemPure: branching dialogue paths
- SaveLoadPure: state save/load roundtrip scenarios

3) Contributor Onboarding Packs
- Quickstart docs per zone (Toppler, Spirit Tamer, Witcher Grove)
- Fixture authoring guide and schema snippets
- Remix-safe asset sourcing checklist

## Milestones
- M18.1: Jest stable locally (all suites discover, majority pass)
- M18.2: 4 modules with orchestration scenarios + golden fixtures
- M18.3: Onboarding packs published under `docs/`

## Commands
```
npm run typecheck
npm run audit:games
npm test -- --runInBand
```

## Acceptance
- Sampler remains playable on GitHub Pages
- Jest runs without worker errors; flaky suites isolated
- New scenarios validated and documented