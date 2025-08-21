# MIFF Modules (Synced)

This folder consolidates engine-agnostic Pure modules from prior branches into a unified, remix-safe structure. Modules are code-first and decoupled from Unity. Rendering/audio adapters are intentionally out-of-scope here.

## Structure

- miff/pure/BattleAIPure: AI policies and test harness
- miff/pure/ChallengesPure: battle challenges and rulesets
- miff/pure/EffectsPure: battle effects system and aggregator
- miff/pure/EvolutionPure: evolution rules, results, tests
- miff/pure/FusionPure: fusion rules and results (experimental)
- miff/pure/ItemsPure: items and usage flow, tests
- miff/pure/LorePure: codex unlocks, flags, tests
- miff/pure/NPCsPure: basic NPC data and interaction tests
- miff/pure/QuestsPure: quests, objectives, flags, tests
- miff/pure/SpiritsPure: dex filters/sorters and tests
- miff/pure/SyncPure: timed/scheduled sync events and challenges
- miff/pure/TeamsPure: party/team composition rules and tests

## Status Legend

- Complete: feature-complete for Newhaven vertical slice
- Partial: usable but missing edges/tests
- Stub: scaffolds only; needs implementation

## Module Status

- BattleAIPure: Partial (baseline policies + harness)
- ChallengesPure: Partial (core rules + tests)
- EffectsPure: Partial (core types + stacking/aggregation)
- EvolutionPure: Partial (conditions + results + tests)
- FusionPure: Stub (experimental, not needed for Newhaven)
- ItemsPure: Partial (usage flow + results + tests)
- LorePure: Partial (flags/unlocks + tests)
- NPCsPure: Stub (data models + simple tests)
- QuestsPure: Partial (objectives/flags + tests)
- SpiritsPure: Partial (filters/sorters + tests)
- SyncPure: Partial (events/challenges + tests)
- TeamsPure: Partial (rules/validation + tests)

## Notes

- Keep modules engine-agnostic; avoid Unity APIs
- Prefer deterministic logic and seedable tests
- Use JSON fixtures where applicable; keep assets remix-safe
- Track TODOs as roadmap items, not inline comments