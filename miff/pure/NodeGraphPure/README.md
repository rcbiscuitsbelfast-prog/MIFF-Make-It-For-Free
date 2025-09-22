# NodeGraphPure

JSON-defined node graphs to chain TextureSynth and MeshFactory operations.

## CLI
- graph:run --file graphDefinition.json --seed <n>

## Nodes
- texture.noise: { width, height, type, octaves }
- texture.gradient: { width, height, colors, direction }
- mesh.tree: { trunkHeight, trunkRadius, ... }
- mesh.rock: { radius, segments, noise }

## Output
```json
{ "results": { "nodeA": { ... }, "nodeB": { ... } } }
```

## Schema
- schemas/graphSchema.json