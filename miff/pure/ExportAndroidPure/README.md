# ExportAndroidPure

Android export orchestrator for Godot-based MIFF games. Builds signed AAB/APK via Godot 4 headless.

## CLI

```
npx ts-node miff/pure/ExportAndroidPure/cli.ts \
  --project ./docs/godot \
  --output ./build/android \
  --aab \
  --keystore ./keystore.jks \
  --alias app \
  --ks-pass $KSPASS \
  --key-pass $KEYPASS
```

## Requirements
- Godot 4.x headless + export templates
- Android SDK/NDK, Java toolchain
- Keystore and credentials (provided via env/Secrets in CI)

Outputs JSON:
```
{ "op": "export:android", "status": "ok", "outputs": ["build/android/app.aab"], "signing": { "alias": "app" } }
```

## Roadmap
- [x] CLI harness with signing validation and CI-safe placeholders
- [ ] GitHub Actions workflow (manual trigger) to produce signed AAB
- [ ] Docs for Play Console upload