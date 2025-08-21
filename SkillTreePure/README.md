# SkillTreePure

Unlockable skills graph with prerequisites. Engine-agnostic with CLI harness and golden test.

## Schema (v12)
- Skill: { id: string; name: string; requires?: string[] }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' SkillTreePure/cliHarness.ts SkillTreePure/sample_skills.json SkillTreePure/tests/commands.json
```

Commands:
- list
- canUnlock <id>
- unlock <id>
- dump

## Remix Hooks
- Integrate with Stats/Combat to apply modifiers when a skill is unlocked.
- Add skill metadata (cost, category) and extend CLI accordingly.