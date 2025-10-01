# EffectsPure

**Version:** 1.0.0  
**Description:** EffectsPure - Effects Management System A comprehensive effects management system for handling battle effects, stat modifications, and effect resolution. Supports real-time and turn-based effects with stacking, immunity, triggers, and complex stat calculations. /

## Exports

- `EffectTrigger`
- `EffectType`
- `TargetStat`
- `ModifierType`
- `EffectPhase`
- `EffectOrder`
- `EffectApplicationResult`
- `EffectRemovalReason`
- `IEntityContext`
- `IBattleEffect`
- `IActiveEffect`
- `IEffectResolver`
- `IStatModifierAggregator`
- `IEffectResolution`
- `IEffectEvent`
- `IEffectManager`
- `BattleEffect`
- `ActiveEffect`
- `StatModifierAggregator`
- `EffectEvent`
- `EffectResolution`
- `EffectResolver`
- `EffectManager`
- `EffectUtils`
- `defaultBattleEffect`
- `defaultActiveEffect`
- `defaultStatModifierAggregator`
- `defaultEffectResolver`
- `defaultEffectManager`
- `defaultEffectEvent`
- `defaultEffectResolution`

## Classes



## Interfaces

### IEntityContext

IEntityContext interface

**Properties:**


### IBattleEffect

IBattleEffect interface

**Properties:**


### IActiveEffect

IActiveEffect interface

**Properties:**


### IEffectResolver

IEffectResolver interface

**Properties:**


### IStatModifierAggregator

IStatModifierAggregator interface

**Properties:**


### IEffectResolution

IEffectResolution interface

**Properties:**


### IEffectEvent

IEffectEvent interface

**Properties:**


### IEffectManager

IEffectManager interface

**Properties:**



## Enums

### EffectTrigger

EffectTrigger enum

**Values:**
- `NONE = 0`
- `ON_APPLY = 1 << 0`
- `ON_REMOVE = 1 << 1`
- `ON_TICK = 1 << 2`
- `ON_HIT = 1 << 3`
- `ON_CAST = 1 << 4`
- `ON_CRIT = 1 << 5`

### EffectType

EffectType enum

**Values:**
- `STAT_MODIFIER = 'stat_modifier'`
- `DAMAGE_OVER_TIME = 'damage_over_time'`
- `HEAL = 'heal'`
- `STUN = 'stun'`
- `SHIELD = 'shield'`
- `CUSTOM = 'custom'`

### TargetStat

TargetStat enum

**Values:**
- `HP = 'hp'`
- `ATK = 'atk'`
- `DEF = 'def'`
- `SPD = 'spd'`
- `SPATK = 'spatk'`
- `SPDEF = 'spdef'`
- `ACC = 'acc'`
- `EVA = 'eva'`
- `CUSTOM = 'custom'`

### ModifierType

ModifierType enum

**Values:**
- `FLAT = 'flat'`
- `PERCENT = 'percent'`

### EffectPhase

EffectPhase enum

**Values:**
- `PRE_TURN = 'pre_turn'`
- `SELECT_ACTION = 'select_action'`
- `RESOLVE_ACTION = 'resolve_action'`
- `END_TURN = 'end_turn'`

### EffectOrder

EffectOrder enum

**Values:**
- `BUFFS = 0`
- `DEBUFFS = 1`
- `PASSIVES = 2`

### EffectApplicationResult

EffectApplicationResult enum

**Values:**
- `APPLIED = 'applied'`
- `REFRESHED = 'refreshed'`
- `REJECTED = 'rejected'`
- `EXPIRED = 'expired'`

### EffectRemovalReason

EffectRemovalReason enum

**Values:**
- `EXPIRED = 'expired'`
- `REMOVED = 'removed'`
- `CLEANSED = 'cleansed'`
- `OVERWRITTEN = 'overwritten'`
- `IMMUNITY = 'immunity'`


## Functions



## CLI Commands

- `help`
- `h`
- `list`
- `l`
- `apply`
- `a`
- `remove`
- `r`
- `create`
- `c`
- `stats`
- `s`
- `update`
- `u`
- `switch`
- `phase`
- `p`
- `immunity`
- `i`
- `demo`
- `d`
- `exit`
- `quit`
- `q`
- `stat`
- `dot`
- `heal`
- `stun`
- `shield`
- `pre_turn`
- `select_action`
- `resolve_action`
- `end_turn`
- `strength_boost`
- `defense_boost`
- `poison`
- `regeneration`
- `shield`
- `stun`

## Dependencies



## Usage Example

```typescript
import { EffectTrigger } from './miff/pure/EffectsPure';

// Example usage
const instance = new EffectTrigger();
```
