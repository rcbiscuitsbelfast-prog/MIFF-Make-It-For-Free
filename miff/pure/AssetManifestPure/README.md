# AssetManifestPure

Validate and normalize asset manifests with remix-safe licensing tags.

Types:
- id, path, type: sprite|audio|font|shader|bundle
- license: cc0|cc-by|agpl|custom
- platform: web|unity|godot|all

CLI usage:
```bash
npx ts-node cli/manifest.ts systems/AssetManifestPure/fixtures/sprites.json
```