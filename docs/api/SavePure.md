# SavePure

**Version:** 1.0.0  
**Description:** SavePure - Game Save/Load System A comprehensive save and load system for handling game state persistence. Features JSON serialization, checksum validation, version migration, and remix-safe save data structures. /

## Exports

- `SUPPORTED_VERSIONS`
- `SaveVersion`
- `SaveValidationResult`
- `SaveMigrationResult`
- `SaveOperationResult`
- `IGameEntity`
- `ISaveSnapshot`
- `ISaveManager`
- `ISaveValidator`
- `ISaveMigrator`
- `ICompressionUtil`
- `IEncryptionUtil`
- `SaveSnapshot`
- `SaveValidator`
- `SaveMigrator`
- `SaveManager`
- `SaveUtils`
- `defaultSaveSnapshot`
- `defaultSaveValidator`
- `defaultSaveMigrator`
- `defaultSaveManager`

## Classes



## Interfaces

### SaveValidationResult

SaveValidationResult interface

**Properties:**


### SaveMigrationResult

SaveMigrationResult interface

**Properties:**


### SaveOperationResult

SaveOperationResult interface

**Properties:**


### IGameEntity

IGameEntity interface

**Properties:**


### ISaveSnapshot

ISaveSnapshot interface

**Properties:**


### ISaveManager

ISaveManager interface

**Properties:**


### ISaveValidator

ISaveValidator interface

**Properties:**


### ISaveMigrator

ISaveMigrator interface

**Properties:**


### ICompressionUtil

ICompressionUtil interface

**Properties:**


### IEncryptionUtil

IEncryptionUtil interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `save`
- `s`
- `load`
- `l`
- `info`
- `i`
- `validate`
- `v`
- `migrate`
- `m`
- `party`
- `p`
- `inventory`
- `inv`
- `quests`
- `q`
- `unlock`
- `u`
- `stats`
- `settings`
- `set`
- `metadata`
- `meta`
- `demo`
- `d`
- `exit`
- `quit`
- `q`
- `add`
- `remove`
- `list`
- `damage`
- `heal`
- `add`
- `remove`
- `list`
- `clear`
- `set`
- `list`
- `clear`
- `unlock`
- `check`
- `list`
- `clear`
- `set`
- `get`
- `list`
- `increment`
- `set`
- `get`
- `list`
- `set`
- `get`
- `list`
- `clear`

## Dependencies



## Usage Example

```typescript
import { SUPPORTED_VERSIONS } from './miff/pure/SavePure';

// Example usage
const instance = new SUPPORTED_VERSIONS();
```
