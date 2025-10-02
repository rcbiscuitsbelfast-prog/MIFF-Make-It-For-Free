# Scenarios Index

## RenderWorld Game Loop
- Scenario: persistent player movement, interaction, animation, save/load
- Commands:
```
# Move
bash -lc "echo '{\"move\":{\"x\":1,\"y\":0},\"dt\":100}' > /workspace/session/input.json"
npx tsx /workspace/render/gameLoop.ts

# Interact, save, and load
bash -lc "echo '{\"interact\":\"chest_01\",\"dt\":16}' > /workspace/session/input.json"
npx tsx /workspace/render/gameLoop.ts
npx tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=save
npx tsx /workspace/miff/pure/SavePure/integration/GameSnapshotCLI.ts --mode=load
```

## Building Quest Tutorial
See: `presets/scenarios/buildingQuestTutorial.fixture.json` and detailed results in `docs/archive/test-results/2025-10-02-buildingQuestTutorial-results.txt`.