# ExportAndroidPure

Android export orchestrator for Godot-based MIFF games. Builds signed AAB/APK via Godot 4 headless.

## CLI (planned)

```
export:android --preset Release \
  --aab \
  --project ./docs/godot \
  --output ./build/android \
  --version-code 100 \
  --version-name 1.0.0 \
  --keystore @env:KEYSTORE --alias @env:ALIAS \
  --ks-pass @env:KSPASS --key-pass @env:KEYPASS
```

## Requirements
- Godot 4.x headless + export templates
- Android SDK/NDK, Java toolchain
- Keystore and credentials (provided via env/Secrets in CI)

## Roadmap
- [ ] CLI harness (`cliHarness.ts`) with validation and spawn of Godot exporter
- [ ] GitHub Actions workflow (manual trigger) to produce signed AAB
- [ ] Docs for Play Console upload