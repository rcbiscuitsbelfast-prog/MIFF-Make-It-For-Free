# PathfindingPure

Simple grid-based pathfinding (BFS) with obstacles. Schema v12. Engine-agnostic.

## Schema (v12)
- Grid: { width: number; height: number; blocks: {x:number;y:number}[] }
- Sample file: { grid: Grid }

## CLI
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' PathfindingPure/cliHarness.ts PathfindingPure/sample_grid.json PathfindingPure/tests/commands.json
```

Commands:
- list
- simulate <start> <goal>
- dump

## Remix Hooks
- onPathFound(start, goal, path)
- onPathBlocked(start, goal)

## Dependencies
- None. Can integrate with `WorldLayoutPure` for collision sources.