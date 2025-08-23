---
layout: ../../layouts/Layout.astro
title: "Combat Scenario Demo"
description: "Walkthrough for CombatScenarioPure demo"
---

# 🗡️ Combat Scenario Demo

Run the `CombatScenarioPure` demo to see combat flows in action.

## ▶️ Run the Scenario

```bash
npx ts-node cli/miff-simulate.ts CombatScenarioPure/scenario.json --seed 42 > out_combat.json
```

## 🔍 Validate Output

```bash
node scripts/validateOutputFormat.js out_combat.json scenario
```

## 📄 Expected Output

See `CombatScenarioPure/expected_output.json` for the golden output.

> Tip: Use RenderReplayPure to visualize `renderData` frames for debugging combat.