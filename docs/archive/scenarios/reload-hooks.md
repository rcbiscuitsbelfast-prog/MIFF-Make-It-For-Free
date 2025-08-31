# Reload Hooks for MIFF Framework
MIT License, Copyright (c) 2025 MIFF Community

## Overview
Hot-loading enables dynamic reloading of scenarios and subsystems without restarting the game. These hooks are designed to be modular, engine-agnostic, and remix-safe, leaving orchestration to runtime agents (e.g., Cursor).

## Scenario Hot-Loading
- **Dynamic Import**: Use `ScenarioRegistry.ts` to load scenarios via `load` functions (e.g., `import('./scenarios/ember-pact')`). Cache results to avoid redundant imports.
- **Event Trigger**: Emit an `EventBusPure` event (`scenario_reload`) when a scenario is updated, signaling the engine to refresh objectives and triggers.
- **State Preservation**: Store scenario state (e.g., completed objectives) in `MemorySystemPure` to persist across reloads.
- **Validation Hook**: Add a `validate` method to `ScenarioPure` objects to check subsystem compatibility before loading.

## Subsystem Hot-Loading
- **Subsystem Registry**: Create a `SubsystemRegistry.ts` mirroring `ScenarioRegistry.ts`, mapping subsystem IDs to dynamic imports (e.g., `import('./subsystems/CombatCorePure')`).
- **Hot-Swap Events**: Use `EventBusPure` to emit `subsystem_reload` events when a subsystem is updated, allowing runtime replacement without disrupting active scenarios.
- **Version Check**: Include version metadata in subsystems (e.g., `version: '1.0.0'`) to ensure compatibility with scenarios.
- **Mock Stubs**: Provide mock implementations for subsystems during reload (e.g., `CombatCorePure.mock()`) to maintain gameplay continuity.

## Remix Considerations
- **Loose Coupling**: Ensure subsystems expose pure functions (e.g., `InventoryPure.has`) for safe hot-swapping.
- **Error Handling**: Implement fallback states in `EventBusPure` for failed reloads (e.g., revert to previous version).
- **Testing Hooks**: Add debug endpoints in `ScenarioRunnerPure.ts` to simulate reloads during development.
- **Documentation**: Tag subsystems and scenarios with reload compatibility in `scenario-metadata.json`.

## Implementation Notes
- Avoid hardcoding reload logic; defer to runtime agents for orchestration.
- Use TypeScript’s strong typing to ensure reloaded modules match expected interfaces.
- Test hot-loading with scenarios like "Mirror of Many Paths" (branching) or "Siege of the Emberwatch" (complex triggers) for robustness.
