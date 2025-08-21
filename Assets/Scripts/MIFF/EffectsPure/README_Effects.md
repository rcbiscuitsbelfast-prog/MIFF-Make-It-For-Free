# Battle Effects (Pure C#)

This module provides a decoupled, Unity-independent battle effects system that works for both real-time and turn-based combat.

## Components

- `BattleEffect` (data):
  - id/name/description
  - durationSeconds and/or durationTurns
  - stackable/maxStacks/refreshOnStack
  - triggers (OnApply/OnRemove/OnTick/OnHit/OnCast/OnCrit)
  - effectType (StatModifier/DOT/Heal/Stun/Shield/Custom)
  - targetStat, modifierType (Flat/Percent), value

- `EffectManager` (runtime):
  - Apply/remove effects to string entityIDs
  - UpdateRealtime(deltaTime) and TickTurn() for turn-based
  - Handles expiration/stacking and broadcasts: OnEffectApplied/Refreshed/Removed/Expired/Tick

- `StatModifierAggregator`:
  - Combine Flat/Percent modifiers; additive and multiplicative stacking
  - Apply(baseValue) -> modified value

## Integration Hooks

- Real-time: call `TriggerOnHit/TriggerOnCast/TriggerOnApply` when collisions, animation events, or ability casts happen.
- Turn-based: call `TickTurn(entityID)` at the end/start of a turn; call `TriggerOnApply` when a move applies an effect.

## Adding new effect types

- Extend `EffectType` enum or set type to `Custom`.
- In your combat system, listen to `EffectManager` events and implement the logic for new types (e.g., applying DOT damage each tick, applying Stun to skip turns, etc.).
- For stat modifiers, map `BattleEffect.targetStat/modifierType/value` into your own stat system using `StatModifierAggregator`.

## Plugging in animation/VFX

- Subscribe to events to spawn VFX/SFX:
  - `OnEffectApplied` -> spawn attach VFX
  - `OnEffectTick` -> pulse VFX
  - `OnEffectExpired/Removed` -> stop VFX
- Keep VFX code outside this module for clean separation.

## Testing without Unity

- Create a console test that:
  1. Creates an `EffectManager` and a few `BattleEffect` definitions (e.g., DOT 5s, Heal 3 turns).
  2. Applies them to an `entityID` (e.g., "spirit_1").
  3. Calls `UpdateRealtime(delta)` in a loop to observe expirations, or `TickTurn` to simulate turns.
  4. Uses `StatModifierAggregator` to check stat math.
- Print event callbacks to verify behavior.

## Remix Notes

- All data structures are serializable and safe to extend.
- You can replace string `entityID` with your own entity handle type via wrappers.
- Consider storing arbitrary payload in `BattleEffect` (e.g., `customFields`) if you need extra parameters.