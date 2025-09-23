# ProceduralWorldPure

Engine-agnostic terrain generation with biomes and river carving. Deterministic via seed. CLI-first.

## CLI

- world:generate-terrain --seed <n> --size <WxH> [--noise perlin|simplex|worley]
- world:apply-biomes --heightmap <file.json> --rules <biomeSchema.json> --seed <n>
- world:carve-rivers --heightmap <file.json> --threshold <v> --seed <n>

## Output

```json
{ "log": ["..."], "outputs": [{ "heightmap": [[0]] }] }
```
Biome and river commands return `biomes: string[][]` and `rivers: { start:[x,y], end:[x,y] }[]` respectively.

## Schemas
- schemas/terrainSchema.json
- schemas/biomeSchema.example.json