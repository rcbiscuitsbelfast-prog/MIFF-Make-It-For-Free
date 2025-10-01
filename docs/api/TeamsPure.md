# TeamsPure

**Version:** 1.0.0  
**Description:** TeamsPure - Team Management System A comprehensive team management system for handling active teams and reserves, with validation rules, synergy checks, and team composition constraints. Supports multiplayer teams, party management, and flexible team configurations. /

## Exports

- `TeamOperationResult`
- `ValidationStatus`
- `TeamPosition`
- `SynergyType`
- `ISpiritInstance`
- `ITeamSlot`
- `ISpiritSyncEntry`
- `ISyncManager`
- `ITeam`
- `ITeamRules`
- `IValidationResult`
- `ITeamManager`
- `IStrategicAnalysis`
- `ITeamCompositionRecommendation`
- `IThreatAnalysis`
- `ITeamSynergyCalculator`
- `ITeamTemplate`
- `ValidationResult`
- `TeamSlot`
- `TeamRules`
- `Team`
- `TeamManager`
- `TeamUtils`
- `TeamStrategyAnalyzer`
- `SpiritSyncEntry`
- `SyncManager`
- `defaultTeamManager`
- `defaultTeamRules`
- `defaultTeam`
- `defaultTeamSlot`
- `defaultValidationResult`

## Classes

### TeamStrategyAnalyzer

Analyze team strategically

**Methods:**
- `analyzeTeam()` - analyzeTeam method
- `if()` - if method

**Properties:**
- `team: ITeam` - 


## Interfaces

### ISpiritInstance

ISpiritInstance interface

**Properties:**


### ITeamSlot

ITeamSlot interface

**Properties:**


### ISpiritSyncEntry

ISpiritSyncEntry interface

**Properties:**


### ISyncManager

ISyncManager interface

**Properties:**


### ITeam

ITeam interface

**Properties:**


### ITeamRules

ITeamRules interface

**Properties:**


### IValidationResult

IValidationResult interface

**Properties:**


### ITeamManager

ITeamManager interface

**Properties:**


### IStrategicAnalysis

IStrategicAnalysis interface

**Properties:**


### ITeamCompositionRecommendation

ITeamCompositionRecommendation interface

**Properties:**


### IThreatAnalysis

IThreatAnalysis interface

**Properties:**


### ITeamSynergyCalculator

ITeamSynergyCalculator interface

**Properties:**


### ITeamTemplate

ITeamTemplate interface

**Properties:**



## Enums

### TeamOperationResult

TeamOperationResult enum

**Values:**
- `SUCCESS = 'success'`
- `FAILURE = 'failure'`
- `INVALID_INPUT = 'invalid_input'`
- `TEAM_FULL = 'team_full'`
- `SPIRIT_NOT_FOUND = 'spirit_not_found'`
- `DUPLICATE_SPIRIT = 'duplicate_spirit'`
- `INVALID_TEAM_SIZE = 'invalid_team_size'`
- `INSUFFICIENT_DIVERSITY = 'insufficient_diversity'`
- `LOW_SYNERGY = 'low_synergy'`

### ValidationStatus

ValidationStatus enum

**Values:**
- `OK = 'ok'`
- `TOO_MANY_MEMBERS = 'too_many_members'`
- `DUPLICATE_SPECIES = 'duplicate_species'`
- `INVALID_SYNERGY = 'invalid_synergy'`
- `MISSING_REQUIREMENTS = 'missing_requirements'`
- `INCOMPATIBLE_MEMBERS = 'incompatible_members'`

### TeamPosition

TeamPosition enum

**Values:**
- `FRONT = 'front'`
- `MIDDLE = 'middle'`
- `BACK = 'back'`
- `SUPPORT = 'support'`
- `RESERVE = 'reserve'`

### SynergyType

SynergyType enum

**Values:**
- `TYPE_DIVERSITY = 'type_diversity'`
- `SYNC_LEVEL = 'sync_level'`
- `LEVEL_BALANCE = 'level_balance'`
- `STAT_DISTRIBUTION = 'stat_distribution'`
- `ROLE_COMPLEMENT = 'role_complement'`


## Functions



## CLI Commands

- `add`
- `remove`
- `swap`
- `list`
- `get-team`
- `get-reserves`
- `set-max-size`
- `simulate`
- `dump`
- `add`
- `remove`
- `swap`
- `list`
- `get-team`
- `get-reserves`
- `set-max-size`
- `simulate`
- `dump`

## Dependencies



## Usage Example

```typescript
import { TeamOperationResult } from './miff/pure/TeamsPure';

// Example usage
const instance = new TeamOperationResult();
```
