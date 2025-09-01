# MIFF Audit — September 2025

- Scope: CI, Jest env, orchestration integrity, failing suites
- Repo: MIFF-Make-It-For-Free
- Scenario focus: Spirit Tamer — Trial of the Grove

## CI Status
- Missing main CI workflow (added: .github/workflows/miff-ci.yml)
- Pages deploy workflow present

## Jest Environment
- Introduced projects split: dom-tests (jsdom) and node-tests (node)
- DOM-dependent suites mapped: PlatformBridgePure, DialoguePure

## Test Failures (pre-fix snapshot)
- PlatformBridgePure: DOM usage without jsdom; platform mapping mismatches
- EventBusPure: scheduler/replication expectations
- NetworkBridgePure: transport spies not invoked
- InventoryPure: stack enforcement and query counts
- DialoguePure: parser/engine expectations, serialization
- ModdingPure: error messages and dependency resolution

## Orchestration Integrity
- SpiritTamerDemoPure: orchestration.json, release_manifest.json, start_grove.js present
- start_grove.js now exports startGrove (CJS)

## Actions Taken
- CI workflow added (Node 18, typecheck, tests)
- Jest config split into dom/node projects
- Scripts added: miff/scripts/fix-test-paths.js, miff/scripts/validate-bridge.js

## Next Fixes
- Gate canvas creation on document presence; provide headless fallback
- Align platform capability mapping for test expectations
- Tighten EventBus scheduler cadence in tests or increase waits
- Ensure NetworkBridge mocks wired in connect()
- Enforce Inventory max stack; correct query filters
- Adjust Dialogue parser/engine behavior for asserted outcomes
- Relax Modding error assertions or unify error strings

## Contributor Readiness
- Quick Start and Onboarding Challenge to be added
- Spirit Tamer entry runnable via npm scripts