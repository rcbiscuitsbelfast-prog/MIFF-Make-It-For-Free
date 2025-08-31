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
node miff/scripts/validateOutputFormat.js out_tutorial.json scenario
```

## 📄 Expected Output

See `TutorialScenarioPure/expected_output.json` for the golden output.

> Tip: Use RenderReplayPure to visualize renderData outputs.

---

## 🧪 Scenario Coverage Stubs

Below are example CLI stubs demonstrating how MIFF validates different genres. These are remix-safe placeholders to show structure, not shipped content.

### 1) Physics Shooter (Toppler)

```bash
# Initialize physics shooter scaffold
npx ts-node cli/miff-init.ts Toppler --template physics-shooter

# Simulate physics shooter scenario
npx ts-node cli/miff-simulate.ts Toppler/scenario.json --seed 101 > out_toppler.json
```

```json
{
  "op": "runScenario",
  "status": "ok",
  "outputs": [
    { "type": "spawn", "entity": "enemy", "position": { "x": 12, "y": 4 } },
    { "type": "projectile", "id": "p1", "velocity": { "x": 3, "y": -9 } }
  ]
}
```

Remix-safe assets (preview):

```text
square-red.png      # enemy placeholder
square-yellow.png   # projectile placeholder
mars-bg.png         # background placeholder
```

### 2) Rhythm RPG (Newhaven K-Pop Exorcist)

```bash
# Initialize rhythm RPG scaffold
npx ts-node cli/miff-init.ts Newhaven --template rhythm-rpg

# Simulate rhythm RPG scenario
npx ts-node cli/miff-simulate.ts Newhaven/scenario.json --seed 202 > out_rhythm.json
```

```json
{
  "op": "runScenario",
  "status": "ok",
  "outputs": [
    { "type": "beat", "time": 0.0 },
    { "type": "window", "start": 0.1, "end": 0.3 },
    { "type": "combo", "streak": 5 }
  ]
}
```

Remix-safe assets (preview):

```text
square-blue.png     # player marker
square-pink.png     # beat marker
ui-hud.png          # neutral UI placeholder
```

### 3) Open-World Adventure (Explorer)

```bash
# Initialize open-world scaffold
npx ts-node cli/miff-init.ts Explorer --template open-world

# Simulate explorer scenario
npx ts-node cli/miff-simulate.ts Explorer/scenario.json --seed 303 > out_explorer.json
```

```json
{
  "op": "runScenario",
  "status": "ok",
  "outputs": [
    { "type": "mount", "entity": "horse", "zone": "zone_village" },
    { "type": "navigate", "from": "zone_village", "to": "zone_forest" },
    { "type": "dialog", "npc": "guard", "node": "greeting" }
  ]
}
```

Remix-safe assets (preview):

```text
square-brown.png    # mount placeholder
square-green.png    # forest tile placeholder
dialog-box.png      # neutral dialog placeholder
```