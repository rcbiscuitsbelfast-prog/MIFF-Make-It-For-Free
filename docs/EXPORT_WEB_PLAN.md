# ExportWebPure Plan

Goal: Produce HTML5 game builds with preloaded assets and deploy to static hosting.

## Module
- ExportWebPure: orchestrate web bundling, asset manifest emission, and deployment.

## CLI (planned)
```
export:web --project ./docs/godot --output ./build/web --deploy pages
```

## Workflow
- Build Godot HTML5 export
- Generate asset manifest (hashes, sizes, preload list)
- Upload artifact
- Deploy (GitHub Pages/Netlify/Vercel)

## Tasks
- [ ] ExportWebPure README + CLI harness skeleton
- [ ] GitHub Actions job `export-web.yml` (manual trigger)
- [ ] Docs for custom domains and cache headers