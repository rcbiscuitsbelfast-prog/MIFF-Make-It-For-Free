---
layout: ../../layouts/Layout.astro
title: "Tutorial Scenario Demo"
description: "Run the tutorial scenario and view outputs"
---

# 🎬 Tutorial Scenario Demo

Run the built-in tutorial scenario to understand MIFF's workflow.

## ▶️ Run the Scenario

```bash
npx ts-node cli/miff-simulate.ts TutorialScenarioPure/scenario.json --seed 123 > out_tutorial.json
```

## 🔍 Validate Output

```bash
node scripts/validateOutputFormat.js out_tutorial.json scenario
```

## 📄 Expected Output

See `TutorialScenarioPure/expected_output.json` for the golden output.

> Tip: Use RenderReplayPure to visualize renderData outputs.