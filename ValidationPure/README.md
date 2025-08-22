# ValidationPure

Cross-module validation (v12). CLI-first, engine-agnostic, remix-safe.

## Schema (v12)
- ValidationRule: 'missing_refs' | 'stat_bounds' | 'zone_overlap'
- ValidationInput: { refs?, stats?, zones? }
- ValidationConfig: { rules: ValidationRule[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' ValidationPure/cliHarness.ts ValidationPure/sample_input.json "" ValidationPure/tests/commands.json
```

Ops:
- validateAll
- reportIssues

Output format:
- JSON with fields: op, status, issues, resolvedRefs

## Remix Hooks
- Configure custom rule sets via `configure({ rules })`

## Dependencies
- Consumes outputs from `EntityLinkerPure`