# EntityLinkerPure

Resolves references across modules (v12). CLI-first, engine-agnostic, remix-safe.

## Schema (v12)
- ExternalRefMaps: { quests?: Record<string,true>; items?: Record<string,true>; zones?: Record<string,true> }
- LinkInput: { npcs?: {id, quest?}[]; equipment?: {id,itemId}[]; placements?: {id,zoneId}[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' EntityLinkerPure/cliHarness.ts EntityLinkerPure/sample_links.json EntityLinkerPure/sample_extern.json EntityLinkerPure/tests/commands.json
```

Ops:
- resolveRefs
- dumpLinks

Output format:
- JSON with fields: op, status, issues, resolvedRefs

## Remix Hooks
- Allow injection of external reference maps via `inject(extern)`

## Dependencies
- Consumes types from `SharedSchemaPure` as needed