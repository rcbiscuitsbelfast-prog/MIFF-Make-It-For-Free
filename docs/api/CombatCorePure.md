# CombatCorePure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `CombatType`
- `DamageType`
- `CombatState`
- `CombatPhase`
- `CombatResult`
- `CombatEntity`
- `CombatStats`
- `DamageResistances`
- `StatusEffect`
- `StatModifier`
- `CombatAbility`
- `AbilityEffect`
- `AbilityRequirement`
- `EquipmentSlots`
- `EquipmentItem`
- `Enchantment`
- `AICombatProfile`
- `AIBehavior`
- `CombatAction`
- `DamageCalculation`
- `DamageModifier`
- `CombatEvent`
- `CombatScenario`
- `CombatEnvironment`
- `TerrainFeature`
- `Hazard`
- `EnvironmentModifier`
- `CombatRules`
- `VictoryCondition`
- `DefeatCondition`
- `CombatSession`
- `CombatStatistics`
- `CombatEngine`
- `CombatPerformanceMetrics`
- `ValidationResult`

## Classes

### CombatEngine

CombatEngine class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `sessions: Map` - 
- `entities: Map` - 
- `scenarios: Map` - 
- `eventQueue: CombatEvent` - 
- `globalRules: CombatRules` - 
- `performanceMetrics: CombatPerformanceMetrics` - 


## Interfaces

### CombatEntity

CombatEntity interface

**Properties:**


### CombatStats

CombatStats interface

**Properties:**


### DamageResistances

DamageResistances interface

**Properties:**


### StatusEffect

StatusEffect interface

**Properties:**


### StatModifier

StatModifier interface

**Properties:**


### CombatAbility

CombatAbility interface

**Properties:**


### AbilityEffect

AbilityEffect interface

**Properties:**


### AbilityRequirement

AbilityRequirement interface

**Properties:**


### EquipmentSlots

EquipmentSlots interface

**Properties:**


### EquipmentItem

EquipmentItem interface

**Properties:**


### Enchantment

Enchantment interface

**Properties:**


### AICombatProfile

AICombatProfile interface

**Properties:**


### AIBehavior

AIBehavior interface

**Properties:**


### CombatAction

CombatAction interface

**Properties:**


### DamageCalculation

DamageCalculation interface

**Properties:**


### DamageModifier

DamageModifier interface

**Properties:**


### CombatEvent

CombatEvent interface

**Properties:**


### CombatScenario

CombatScenario interface

**Properties:**


### CombatEnvironment

CombatEnvironment interface

**Properties:**


### TerrainFeature

TerrainFeature interface

**Properties:**


### Hazard

Hazard interface

**Properties:**


### EnvironmentModifier

EnvironmentModifier interface

**Properties:**


### CombatRules

CombatRules interface

**Properties:**


### VictoryCondition

VictoryCondition interface

**Properties:**


### DefeatCondition

DefeatCondition interface

**Properties:**


### CombatSession

CombatSession interface

**Properties:**


### CombatStatistics

CombatStatistics interface

**Properties:**


### CombatPerformanceMetrics

CombatPerformanceMetrics interface

**Properties:**


### ValidationResult

ValidationResult interface

**Properties:**



## Enums

### CombatType

CombatType enum

**Values:**
- `MELEE = 'melee'`
- `RANGED = 'ranged'`
- `MAGIC = 'magic'`
- `HYBRID = 'hybrid'`
- `SUMMONING = 'summoning'`
- `DEFENSIVE = 'defensive'`

### DamageType

DamageType enum

**Values:**
- `PHYSICAL = 'physical'`
- `MAGICAL = 'magical'`
- `FIRE = 'fire'`
- `ICE = 'ice'`
- `LIGHTNING = 'lightning'`
- `POISON = 'poison'`
- `HOLY = 'holy'`
- `DARK = 'dark'`
- `BLEED = 'bleed'`
- `TRUE = 'true'`

### CombatState

CombatState enum

**Values:**
- `IDLE = 'idle'`
- `PREPARING = 'preparing'`
- `EXECUTING = 'executing'`
- `RESOLVING = 'resolving'`
- `FINISHED = 'finished'`
- `CANCELLED = 'cancelled'`

### CombatPhase

CombatPhase enum

**Values:**
- `SETUP = 'setup'`
- `PLANNING = 'planning'`
- `ACTION = 'action'`
- `REACTION = 'reaction'`
- `RESOLUTION = 'resolution'`
- `CLEANUP = 'cleanup'`

### CombatResult

CombatResult enum

**Values:**
- `HIT = 'hit'`
- `MISS = 'miss'`
- `CRITICAL = 'critical'`
- `BLOCK = 'block'`
- `DODGE = 'dodge'`
- `PARRY = 'parry'`
- `RESIST = 'resist'`
- `ABSORB = 'absorb'`


## Functions



## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { CombatType } from './miff/pure/CombatCorePure';

// Example usage
const instance = new CombatType();
```
