# GodotBridgePure Contract Tests (Plan)

Purpose: Validate that given RenderPayloadPure frames, GodotBridgePure emits deterministic bridge commands (JSON level) for scene updates.

## Test Outline
- Inputs: recorded frames from demos (SpiritTamerDemoPure, TutorialScenarioPure) stored as JSON fixtures.
- Harness: feed frames to GodotBridgePure adapter and capture emitted commands (no actual Godot required).
- Assertions: stable command schema, ids, transforms, materials, and audio cues.
- Golden: compare command envelopes to fixtures with seeds fixed.

## Next Steps
- [ ] Create fixtures under `fixtures/frames/*.json`
- [ ] Implement `contract.test.ts` with golden comparisons
- [ ] Add CLI harness command `bridge:godot:contract --frame fixtures/frames/demo.json`