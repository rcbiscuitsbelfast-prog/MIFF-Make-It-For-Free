# MIFF Roadmap (Q3–Q4 2025)

## Pillars
- Remix: Studio + site integration; manifest validation
- Avatar: Cross-style manifests, registry, renderers, presets
- Multiplayer: Deterministic player/session, sync, server, WS bridge
- Pixel Art: Asset creation, generation, animation, world building

## Short-term (1–2 days)
- Fix conflict markers in `miff/pure/VisualReplaySystemPure/README.md`
- Tighten types in `WebBridgePure/Bridge.ts` and `NetworkBridgePure`
- Add Godot avatar loader glue (manifest -> nodes)

## Near-term (1 week)
- Real WebSocket server behind flag; keep local bus fallback ✅
- Golden tests for avatar layering across more styles
- Migrate subset of tests to ts-jest or Vitest; stabilize CI
- Multiplayer replay enhancements (step-through, export) ✅

## Mid-term (2–3 weeks)
- Full test modernization; retire esbuild-jest transformer
- Performance hygiene expansion (texture/poly checks in CI)
- Contributor flows in Studio (preset packs, validation UI) ✅

## Done (Sep 2025)
- Remix UI expanded; Studio seeded
- Avatar system scaffolded (CLI, registry, renderers, Studio)
- Multiplayer core scaffolded; Studio preview + CI
- Multiplayer contributor expansion (packs, onboarding, perf diagnostics, keyboard input)
- Multiplayer replay system (record/play/step, CLI, sampler viewer)
- Vercel deployment automation with GitHub Actions
- Pixel asset creation system (draw, generate, animate, world building, CLI tools)
- Pixel world showcase with demo forest and contributor remix flow
- Animation presets and export preview for Godot integration
