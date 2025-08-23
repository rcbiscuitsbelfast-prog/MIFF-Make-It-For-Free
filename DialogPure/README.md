# DialogPure CLI Harness

Branching dialog CLI system for defining, testing, and simulating dialog trees with quest/item triggers. Engine-agnostic and remix-safe.

## Schema

```ts
type DialogChoice = {
  id: string;
  text: string;
  nextNodeId?: string;
  triggers?: { questId?: string; itemId?: string };
};

type DialogNode = {
  id: string;
  text: string;
  choices: DialogChoice[];
};

type DialogTree = {
  id: string;
  npc?: string;
  nodes: DialogNode[];
};
```

## CLI Usage

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' DialogPure/cliHarness.ts DialogPure/sample_dialog.json DialogPure/tests/commands.json
```

Supported commands:
- listDialogs
- simulateDialog <dialogId>
- simulateChoice <dialogId> <choiceId>
- dumpDialog <dialogId>
- exportDialog <dialogId>

## Remix Hooks

- onDialogChoiceMade(dialogId, choiceId)
- onDialogComplete(dialogId)
- Integrate with inventory/quest systems by implementing hooks: `addItem`, `startQuest`.

## Golden Test

- `DialogPure/tests/goldenDialog.test.ts` compares harness output to `DialogPure/expected_output.json`.