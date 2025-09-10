# Draw Loop Diagnostic

## Expectations
- `[Draw] Frame rendering...` appears every frame
- If scene is empty, `[Draw] Scene empty — nothing to render` warns until entities added

## Steps
1. Load each zone and observe continuous draw logs.
2. Ensure entity addition occurs before draw loop or very early.