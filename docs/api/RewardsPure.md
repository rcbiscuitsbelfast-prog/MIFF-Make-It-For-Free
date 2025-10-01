# RewardsPure

**Version:** 1.0.0  
**Description:** RewardsPure - Reward and Drop System A comprehensive reward and drop system for handling currency, XP, items, and weighted random selection from drop tables. Supports deterministic rewards based on encounter difficulty and player progression. /

## Exports

- `IRewardStub`
- `IDropEntry`
- `IDropTable`
- `IRNGProvider`
- `RewardStub`
- `DropEntry`
- `DropTable`
- `RewardManager`
- `DropResolver`
- `RewardUtils`
- `defaultRewardManager`
- `defaultDropResolver`

## Classes

### RewardManager

Generate rewards for an encounter

**Methods:**
- `generateRewards()` - generateRewards method

**Properties:**
- `baseCurrency: number` - 
- `levelCurrencyMultiplier: number` - 
- `baseXP: number` - 
- `levelXPMultiplier: number` - 
- `encounterType: string` - 
- `playerLevel: number` - 
- `enemyLevel: number` - 

### DropResolver

DropResolver class

**Methods:**
- `constructor()` - constructor method
- `if()` - if method

**Properties:**
- `rng: IRNGProvider` - 
- `rng: IRNGProvider` - 


## Interfaces

### IRewardStub

IRewardStub interface

**Properties:**


### IDropEntry

IDropEntry interface

**Properties:**


### IDropTable

IDropTable interface

**Properties:**


### IRNGProvider

IRNGProvider interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `status`
- `reward`
- `table`
- `add`
- `remove`
- `drop`
- `simulate`
- `history`
- `clear`
- `demo`
- `config`
- `test`
- `quit`
- `exit`
- `q`

## Dependencies



## Usage Example

```typescript
import { IRewardStub } from './miff/pure/RewardsPure';

// Example usage
const instance = new IRewardStub();
```
