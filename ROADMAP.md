# 🧭 MIFF Framework Roadmap

## 📊 Current Status
- ✅ **Phases Completed**: 1–15  
- 🚀 **Active Phase**: Phase 16 — Funding, Outreach & Global Deployment  
- 📦 **Modules**: 25+ core systems with CLI harnesses and golden tests  
- 🧩 **Schema Version**: v14+ for new modules  

---

## 🧱 Phase Overview

| Phase Range | Focus Area |
|-------------|------------|
| 1–5         | Foundation: Core systems, interop, attribution, derived systems, scenarios  
| 6–8         | Infrastructure: Cleanup, bridges, visual tools  
| 9–11        | Quality: Documentation, testing, auto builder  
| 12–14       | Gameplay: Core systems, management, compliance  
| 15          | Advanced Features: Visual replay, enhanced building  
| 16          | Global Expansion: Funding, outreach, sustainability  
| 17          | Contributor Tooling: Sampler zones, remix overlay, onboarding  
| 18          | Flagship Game: Full release to test modular model  
| 19          | Feedback Loop: Scaffold audit, missing systems, remix trail  
| 20          | Prompt-to-Game: Natural language → playable demo  
| 21          | Asset Pipeline: Remix-safe packs, visual editor  
| 22          | MIFF Studio: Web IDE, scenario builder, export tools  
| 23+         | Education & Enterprise: Curriculum, SDK, licensing, global scale

---

## 🧩 Phase-by-Phase Breakdown

### 🔹 Phase 1–5: Foundation & Scenario Packs

#### Phase 1: Core Gameplay Modules
- StatsSystemPure, SkillTreePure, CombatCorePure, StatusEffectsPure, PathfindingPure  
- Schema v12, CLI-first, golden tests

#### Phase 2: Interop & Validation
- SharedSchemaPure, EntityLinkerPure, ValidationPure  
- Cross-module communication and deterministic validation

#### Phase 3: Attribution & Licensing
- MiffAttributionPure, LICENSE.md, CONTRIBUTING.md  
- Dual-license model and CLA enforcement

#### Phase 4: Derived Systems
- CraftingPure, LootTablesPure, EconomyPure  
- Recipes, drop rates, pricing logic

#### Phase 5: Scenario Packs
- TutorialScenarioPure, QuestScenarioPure, CombatScenarioPure  
- Game Demos:
  - 🕹️ **Toppler** (Physics Shooter):  
    - Modules: PhysicsSystemPure, ProjectileSystemPure, CollisionSystemPure, ScoreSystemPure, HealthSystemPure, InputSystemPure, CameraBridgePure  
    - Scenario: projectile → collision → score  
  - 🎵 **Newhaven K-Pop Exorcist** (Rhythm RPG):  
    - Modules: RhythmSystemPure, AudioBridgePure, ScoreSystemPure, HealthSystemPure, DialogueSystemPure, CutsceneSystemPure, InputSystemPure  
    - Scenario: beat-timing → combo → health impact  
  - 🗺️ **Witcher-style Explorer** (Open-World Adventure):  
    - Modules: NavigationSystemPure, MountSystemPure, DialogueSystemPure, QuestSystemPure, CameraBridgePure, InputSystemPure  
    - Scenario: mount → navigate → dialogue → quest

---

### 🔹 Phase 6–8: Infrastructure

#### Phase 6: Codebase Cleanup
- NPCsPure regeneration, Unity artifact removal, CI pipeline verification

#### Phase 7: Engine Bridges
- UnityBridgePure, WebBridgePure, GodotBridgePure, BridgeSchemaPure  
- Cross-engine compatibility

#### Phase 8: Visual Tools
- RenderReplayPure, DebugOverlayPure, BridgeInspectorPure  
- Visual debugging and replay

---

### 🔹 Phase 9–11: Quality & Auto Builder

#### Phase 9: Documentation Site
- Astro-based docs, GitHub Pages deploy, CLI reference, contributor guides

#### Phase 10: Advanced Testing Infrastructure
- Golden tests, CLI harness refactor, CI/CD fixes, `TESTING.md`

#### Phase 11: Auto Builder
- RenderPayloadPure, ConvertToWebPure, AutoBuilderCLI  
- Build demos from scenario packs

---

### 🔹 Phase 12–14: Gameplay & Compliance

#### Phase 12: Core Gameplay Systems
- ProjectileSystemPure, ScoreSystemPure, HealthSystemPure, InputSystemPure  
- CameraBridgePure, RhythmSystemPure, AudioBridgePure  
- MountSystemPure, DialogueSystemPure, CutsceneSystemPure  
- NavigationSystemPure

#### Phase 13: Quest & Asset Management
- QuestSystemPure, AssetValidatorPure  
- Quest DSL and asset compliance

#### Phase 14: CI & Remix Safety
- RemixAuditPure, CIEnforcerPure  
- Contributor standards and compliance automation

---

### 🔹 Phase 15: Visual Replay & Enhanced Builder

- VisualReplaySystemPure  
- Enhanced AutoBuilderCLI  
- Multi-platform support and performance profiling

---

### 🔹 Phase 16: Funding, Outreach & Global Deployment

- Funding strategy and sustainability planning  
- Global contributor outreach  
- Localization and multi-language docs  
- Commercial licensing and remix safety enforcement

---

---

### 🔹 Phase 17: MIFF Sampler & Remix Overlay

Goal: Launch remix-safe contributor tooling and playable demos.

Deliverables:
- Sampler zones: Toppler, Spirit Tamer, Witcher Grove  
- Remix Lab interface with Remix Mode validator  
- Browser-based Replay Harness with reducer-driven goldens  
- Remix Overlay for golden failures (Scenario, Diff, Hooks)  
- Onboarding pages: zone guide, contributor index  
- CI coverage and fixture validation

---

### 🔹 Phase 18: Flagship Game Deployment

Goal: Prove MIFF’s modular model with a real, remixable release.

Deliverables:
- Select genre (e.g. rhythm RPG, puzzle sim, narrative platformer)  
- Build using only MIFF modules (no custom logic)  
- Include golden tests, CLI harness, and remix overlay  
- Publish to one or more platforms:
  - ✅ Web (GitHub Pages, itch.io)  
  - ✅ Mobile (Android via Play Store)  
  - ✅ Console (via Unity/Godot export, if feasible)  
- Include remix-safe asset manifest  
- Add “Remix This Game” button with CLI instructions  
- Track remix forks and contributor feedback

Success Criteria:
- Game runs on target platform(s)  
- Remix button generates valid CLI scaffold  
- At least 3 remix forks from external contributors  
- Feedback loop used to refine modules and onboarding


---

### 🔹 Phase 19: Flagship Feedback & Scaffolding Evolution

Goal: Use flagship development to refine MIFF’s scaffolding, systems, and contributor flow.

Deliverables:
- **Flagship Postmortem**:
  - What worked, what broke, what was missing  
  - Remix feedback from external contributors  
  - Asset and module gaps (e.g. UI, save/load, transitions)  
- **Scaffold Audit**:
  - Validate CLI harness structure  
  - Identify missing systems (e.g. `SaveSystemPure`, `SceneManagerPure`)  
  - Refactor `ScenarioPure` and `ReplayHarnessPure` for clarity  
- **System Additions**:
  - `SaveSystemPure`: persistent state across sessions  
  - `SceneManagerPure`: modular scene transitions  
  - `InputMapPure`: unify input across platforms  
  - `UIOverlayPure`: basic UI scaffolding (menus, HUD)  
- **Remix Feedback Loop**:
  - Track remix forks and diffs  
  - Add “Remix Audit Trail” to CLI  
  - Auto-generate contributor notes from golden failures  
- **Scaffold Templates**:
  - Genre-specific starter kits (e.g. rhythm, puzzle, sim)  
  - Asset manifest examples  
  - Remix-safe onboarding flows

Success Criteria:
- Flagship postmortem published  
- At least 3 new systems added based on real gaps  
- CLI scaffold updated and validated  
- Remix forks show improved onboarding and fewer golden failures

---

### 🔹 Phase 20: Prompt-to-Game Pipeline

Goal: Enable natural language game creation using MIFF modules.

Deliverables:
- `PromptToScenarioPure`: parses prompts into scaffolded scenarios  
- Prompt schema definition (genre, modules, assets, output)  
- CLI runner for prompt-based builds  
- Integration with Copilot or local LLMs  
- Remix safety validation before build  
- Auto-generated golden tests and CLI harnesses

Example prompt:
```json
{
  "genre": "rhythm RPG",
  "modules": ["RhythmSystemPure", "DialogueSystemPure"],
  "assets": "free pixel art",
  "output": "Web demo"
}
```

---

### 🔹 Phase 21: Asset Pipeline & Remix Lab

Goal: Provide remix-safe assets and visual editing tools.

Deliverables:
- Curated CC0/GPL asset packs (sprites, audio, fonts)  
- `AssetManifestPure` validator  
- Remix Lab interface:
  - Drag-and-drop assets  
  - Scenario preview  
  - Remix overlay for golden test failures  
- Visual hooks for CLI harnesses  
- Asset injection via schema

---

### 🔹 Phase 22: MIFF Studio (Web IDE)

Goal: Launch a browser-based IDE for contributors and educators.

Deliverables:
- Online editor with:
  - CLI runner  
  - Visual replay  
  - Scenario builder  
  - Export to Unity/Web/Godot  
- Embedded onboarding guide  
- “Remix Mode” toggle for contributors  
- Scenario diff viewer and audit trail  
- Mobile-first layout and accessibility support

---

### 🔹 Phase 23+: Education & Enterprise Expansion

Goal: Scale MIFF into classrooms, studios, and public sector use.

Deliverables:
- Curriculum kits for remix-safe game design  
- Contributor badges and learning tracks  
- Enterprise SDK with audit tools  
- Licensing tiers for remix-safe commercial use  
- Public sector templates (education, training, simulation)  
- Global contributor index and translation supposuppot
