# PermissionsPure

Deterministic permission query/request facade over browser APIs with cache and simulated request pathway for testability.

## CLI

```bash
npx ts-node miff/pure/PermissionsPure/cliHarness.ts query camera
npx ts-node miff/pure/PermissionsPure/cliHarness.ts request notifications
```

## API
- `query(name)` returns current state (granted/denied/prompt)
- `request(name)` simulates a prompt flow and returns final state