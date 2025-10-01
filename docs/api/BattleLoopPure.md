# BattleLoopPure

**Version:** 1.0.0  
**Description:** BattleLoopPure - Battle Loop Management System Manages the main battle loop, turn processing, and battle state transitions. Provides a clean interface for battle flow control and event handling. /

## Exports

- `BattleLoopConfig`
- `BattleState`
- `BattleAction`
- `BattlePhase`
- `BattlePhaseManager`
- `BattleLoopManager`
- `defaultBattleLoopManager`

## Classes

### BattleAction

BattleAction class

**Methods:**


**Properties:**
- `actorId: number` - 
- `targetId: number` - 
- `moveId: string` - 
- `priority: number` - 
- `options: Partial` - 

### BattlePhaseManager

BattlePhaseManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `phases: BattlePhase` - 
- `currentPhaseIndex: number` - 

### BattleLoopManager

BattleLoopManager class

**Methods:**


**Properties:**
- `config: BattleLoopConfig` - 
- `state: BattleState` - 
- `startTime: number` - 
- `config: Partial` - 


## Interfaces

### BattleLoopConfig

BattleLoopConfig interface

**Properties:**


### BattleState

BattleState interface

**Properties:**


### BattleAction

BattleAction interface

**Properties:**


### BattlePhase

BattlePhase interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `battle`
- `b`
- `phase`
- `p`
- `state`
- `s`
- `history`
- `hist`
- `stats`
- `actors`
- `a`
- `moves`
- `m`
- `addactor`
- `addmove`
- `clear`
- `c`
- `demo`
- `d`
- `exit`
- `quit`
- `q`

## Dependencies



## Usage Example

```typescript
import { BattleLoopConfig } from './miff/pure/BattleLoopPure';

// Example usage
const instance = new BattleLoopConfig();
```
