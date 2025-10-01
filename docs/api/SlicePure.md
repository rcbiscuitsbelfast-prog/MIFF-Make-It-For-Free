# SlicePure

**Version:** 1.0.0  
**Description:** SlicePure - Overworld Battle Vertical Slice A comprehensive vertical slice demonstration showing a complete game loop: overworld encounter generation → battle execution → logging and output. This tool demonstrates how all the MIFF modules work together in practice. /

## Exports

- `ActionSource`
- `MoveCategory`
- `TriggerType`
- `TimeOfDay`
- `IPlayerState`
- `IEncounterTableEntry`
- `IEncounterTable`
- `IEncounterTrigger`
- `IEncounterResult`
- `IEncounterController`
- `ISpiritInstance`
- `IMoveData`
- `IBattleAction`
- `IBattleResult`
- `BattlePhase`
- `IBattleState`
- `IBattleLogEntry`
- `IRNGProvider`
- `ITypeEffectiveness`
- `IDamageCalculator`
- `IBattleLogger`
- `IBattleLoopController`
- `PlayerState`
- `EncounterTableEntry`
- `EncounterTable`
- `EncounterTrigger`
- `EncounterResult`
- `RNGProvider`
- `TypeEffectiveness`
- `OverworldBattleSliceTool`
- `SliceUtils`
- `defaultRNGProvider`
- `defaultTypeEffectiveness`
- `defaultPlayerState`
- `defaultEncounterTable`
- `defaultEncounterTrigger`

## Classes

### OverworldBattleSliceTool

Main demonstration method

**Methods:**
- `main()` - main method

**Properties:**



## Interfaces

### IPlayerState

IPlayerState interface

**Properties:**


### IEncounterTableEntry

IEncounterTableEntry interface

**Properties:**


### IEncounterTable

IEncounterTable interface

**Properties:**


### IEncounterTrigger

IEncounterTrigger interface

**Properties:**


### IEncounterResult

IEncounterResult interface

**Properties:**


### IEncounterController

IEncounterController interface

**Properties:**


### ISpiritInstance

ISpiritInstance interface

**Properties:**


### IMoveData

IMoveData interface

**Properties:**


### IBattleAction

IBattleAction interface

**Properties:**


### IBattleResult

IBattleResult interface

**Properties:**


### IBattleState

IBattleState interface

**Properties:**


### IBattleLogEntry

IBattleLogEntry interface

**Properties:**


### IRNGProvider

IRNGProvider interface

**Properties:**


### ITypeEffectiveness

ITypeEffectiveness interface

**Properties:**


### IDamageCalculator

IDamageCalculator interface

**Properties:**


### IBattleLogger

IBattleLogger interface

**Properties:**


### IBattleLoopController

IBattleLoopController interface

**Properties:**



## Enums

### ActionSource

ActionSource enum

**Values:**
- `PLAYER = 'player'`
- `AI = 'ai'`
- `ENVIRONMENT = 'environment'`
- `SYSTEM = 'system'`

### MoveCategory

MoveCategory enum

**Values:**
- `PHYSICAL = 'physical'`
- `SPECIAL = 'special'`
- `STATUS = 'status'`

### TriggerType

TriggerType enum

**Values:**
- `TILE_TYPE = 'tile_type'`
- `STEP_COUNT = 'step_count'`
- `TIME_BASED = 'time_based'`
- `RANDOM = 'random'`
- `ZONE_ENTRY = 'zone_entry'`

### TimeOfDay

TimeOfDay enum

**Values:**
- `DAWN = 'dawn'`
- `DAY = 'day'`
- `DUSK = 'dusk'`
- `NIGHT = 'night'`

### BattlePhase

BattlePhase enum

**Values:**
- `START = 'start'`
- `SELECT_ACTION = 'select_action'`
- `EXECUTE_ACTION = 'execute_action'`
- `END_TURN = 'end_turn'`
- `VICTORY = 'victory'`
- `DEFEAT = 'defeat'`
- `FLEE = 'flee'`


## Functions



## CLI Commands

- `help`
- `h`
- `roam`
- `r`
- `battle`
- `b`
- `status`
- `s`
- `move`
- `m`
- `time`
- `t`
- `weather`
- `w`
- `reset`
- `demo`
- `d`
- `exit`
- `quit`
- `q`
- `n`
- `north`
- `s`
- `south`
- `e`
- `east`
- `w`
- `west`
- `dawn`
- `day`
- `dusk`
- `night`

## Dependencies



## Usage Example

```typescript
import { ActionSource } from './miff/pure/SlicePure';

// Example usage
const instance = new ActionSource();
```
