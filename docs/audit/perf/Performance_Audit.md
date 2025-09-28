# Performance Audit

## Web (Docs & RenderWorld)
- Lighthouse/CLS/LCP baseline: pending run
- WebGL FPS stability and GPU memory: add profiling harness

## Node/CLI
- Script runtimes and hot paths to be profiled

## Actions
- Add Lighthouse CI job; budgets for LCP/CLS/TTI
- Add WebGL trace collectors and frame budget checks
- Node CPU profiles for scripts under `scripts/`