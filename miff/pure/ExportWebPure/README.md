# ExportWebPure

Web export orchestrator for Godot-based MIFF games (HTML5 builds with asset manifests).

## CLI (planned)
```
export:web --project ./docs/godot --output ./build/web --deploy pages
```

## Features
- Build Godot HTML5 export
- Generate asset manifest (hash, size, preload)
- Upload artifacts; optional auto-deploy to Pages/Netlify/Vercel

## Roadmap
- [ ] CLI harness (`cliHarness.ts`) to run export and emit manifest
- [ ] GitHub Actions `export-web.yml` (manual trigger)
- [ ] Docs for custom domains and cache headers