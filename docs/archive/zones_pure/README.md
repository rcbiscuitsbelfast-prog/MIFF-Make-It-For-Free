# ZonesPure

Engine-agnostic zone transitions, triggers, and remixable hooks for environment changes. Provides a CLI harness for fast iteration and golden testing.

## Schema

ZoneTrigger:

```ts
type ZoneTrigger = {
  id: string;
  fromZone?: string; // optional origin
  toZone?: string;   // optional destination hint
  kind: 'enter' | 'exit' | 'interact';
  conditions?: (
    | { type: 'requiresItem'; itemId: string; quantity?: number }
    | { type: 'requiresQuestState'; questId: string; status?: 'Active'|'Completed'|'Failed'; minStep?: number }
    | { type: 'flag'; key: string; equals?: string|number|boolean }
  )[];
  effects?: (
    | { type: 'dialog'; dialogId: string }
    | { type: 'rewardItem'; itemId: string; quantity?: number }
    | { type: 'questAdvance'; questId: string; step?: number; status?: 'Active'|'Completed'|'Failed' }
    | { type: 'lightingPreset'; preset: string }
    | { type: 'overlay'; action: 'fadeIn'|'fadeOut'|'tint'|'flash'; color?: string; duration?: number }
  )[];
  tags?: string[];
}
```

## CLI Harness

Run with ts-node:

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' zones_pure/harness.ts zones_pure/tests/sample_commands.json
```

Commands:

- defineZone { id, name?, tags? }
- setFlag { key, value }
- registerTrigger { trigger: ZoneTrigger }
- enter { id }
- exit { id }
- interact { id? }

Output includes a `log` of emitted actions, current `zone`, `inventory`, `quests`, and `world` state changes.

## Remix Hooks

- Add new zones: call `defineZone({ id, name, tags })`.
- Customize transitions: register triggers with conditions and effects.
- Trigger effects: use `effects` to start dialog, grant items, advance quests, change lighting, or fire overlays.
- Extend world hooks: implement `setLightingPreset` and `overlay` in your engine adapter.

## Integration (Engine Runtime)

- Connect to DialogManager: implement `dialog.startDialog`.
- Connect to InventoryManager: implement `inventory.addItem` and `inventory.hasItem`.
- Connect to QuestManager: implement `quests.setFlag` and `quests.getState`.
- Connect to World Enhancements: implement `world.setLightingPreset` and `world.overlay`.

## Tests

- Golden output is provided in `zones_pure/tests/golden_output.json` for `zones_pure/tests/sample_commands.json`.

