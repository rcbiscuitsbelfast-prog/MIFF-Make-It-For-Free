# MeshFactoryPure

Deterministic parametric mesh generators (tree, rock). Outputs engine-agnostic arrays.

## CLI
- asset:tree --params treeSchema.json --seed <n>
- asset:rock --params rockSchema.json

## Output
Mesh payload shape:
```json
{ "vertices": [[x,y,z]], "indices": [[a,b,c]], "metadata": {"type":"tree","seed":1} }
```

## Schemas
- schemas/meshSchema.json
- schemas/treeSchema.example.json
- schemas/rockSchema.example.json