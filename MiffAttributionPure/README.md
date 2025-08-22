# MiffAttributionPure

Displays a small "Powered by MIFF" attribution during boot. CLI-first, engine-agnostic, remix-safe.

## Schema (v13)
- AttributionConfig: { message: string; style?: string; durationMs?: number; enabled?: boolean }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' MiffAttributionPure/cliHarness.ts MiffAttributionPure/sample_config.json MiffAttributionPure/tests/commands.json
```

Ops:
- showAttribution

Output format:
- JSON with fields: op, status, issues, resolvedRefs, rendered?

## Remix Hooks
- Provide an override via `override.ts` exporting `getOverride()` to control `shouldShow` and `render`

## License Notes
- Attribution is required under AGPLv3. Removal or closed-source use requires a commercial license.
- Contact: miff@yourdomain.dev