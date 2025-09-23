# TextureSynthPure

Procedural textures via gradients and layered noise; outputs raw pixel matrices (engine-agnostic) or data URIs (future).

## CLI
- texture:gradient --colors <c1,c2,...> --width <w> --height <h>
- texture:noise --type perlin|simplex|worley --octaves <n> --seed <n> --width <w> --height <h>

## Output
```json
{ "texture": { "width": 64, "height": 64, "pixels": [r,g,b,a,...] } }
```

## Schemas
- schemas/textureSchema.json