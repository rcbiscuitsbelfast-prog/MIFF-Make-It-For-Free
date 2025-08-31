# SaveLoadPure

Modular, engine-agnostic save/load system with multi-slot support, autosave/rollback, and schema persistence (v11). Includes a CLI harness for testing and automation.

## Schema v11 (Additions)

```ts
interface GameDataV11 {
  schemaVersion: 11;
  currentSlot: string;
  saves: Record<string, SaveSlot>;
}

interface SaveSlot {
  id: string;
  timestamp: number;
  data: GameDataV11;
  autosave?: boolean;
  rollbackCheckpoint?: GameDataV11;
}
```

Migration from v10: if input lacks `saves`, it is wrapped into slot "migrated-xp" with a v11 snapshot.

## CLI Harness

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' SaveLoadPure/cliHarness.ts SaveLoadPure/tests/sample_commands.json Assets/Resources/saves/save_state.json
```

Supported commands:
- listSlots
- save <slotId>
- load <slotId>
- delete <slotId>
- setRollback <slotId>
- rollback <slotId>
- dumpState

## Remix Hooks

- Replace `StorageAdapter` to persist elsewhere (cloud, indexedDB, etc.).
- Extend `GameDataV11` with domain fields (inventory, quests, settings) safely; snapshotting preserves unknown fields.
- Autosave policy: set `autosave` flag on a slot and invoke `save()` on lifecycle events.
- Rollback flows: call `setRollback()` at checkpoints; `rollback()` restores.

## Samples

- Sample save file: `Assets/Resources/saves/save_state.json` (two slots)
- Sample commands: `SaveLoadPure/tests/sample_commands.json`

## Contributor Notes

- Keep the manager engine-agnostic. Runtime engines should adapt via storage and domain glue code.
- When adding schema fields, bump `schemaVersion` and update migration accordingly.

