# MIFF Phased Build Plan — 2025-10-17

## Goal
Achieve efficient builds, reliable tests, and optimized web artifacts.

## Build Phase A — Type & Test Pipeline (1 week)
- tsc project references; incremental build
- jest: transform cache, --maxWorkers=50%, test sharding
- coverage: html + json-summary, CI artifact upload

## Build Phase B — Bundling & Perf (1 week)
- esbuild/tsup for CLIs; split chunks
- Enable source maps in dev, minify in prod
- Analyze bundle size; tree-shake dead code

## Build Phase C — Web Docs & Demos (3–5 days)
- Static export for docs/site; CSP headers; integrity attributes
- HTML link validation; sitemap

## Build Phase D — CI Optimizations (2–3 days)
- Node/NPM caching; jest cache restore
- Matrix by module group (pure/core/demo)

## Metrics
- Build < 2 min; Tests < 5 min; Bundle size reduced ≥30%

