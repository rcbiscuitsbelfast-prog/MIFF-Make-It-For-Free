# PartyPure

**Version:** 1.0.0  
**Description:** PartyPure - Party Management System A comprehensive party management system for handling player party members, party slots, KO handling, and revival mechanics. Supports party organization, member management, and status tracking for modular gameplay systems. /

## Exports

- `IPartyMember`
- `PartySlot`
- `PartyManager`
- `KOHandler`
- `PartyStatusSummary`
- `PartyUtils`
- `defaultPartyManager`
- `defaultKOHandler`

## Classes

### PartySlot

PartySlot class

**Methods:**
- `constructor()` - constructor method
- `if()` - if method

**Properties:**
- `member: IPartyMember` - 

### PartyManager

PartyManager class

**Methods:**
- `constructor()` - constructor method
- `if()` - if method

**Properties:**
- `_slots: PartySlot` - 
- `_maxSize: number` - 
- `_onRevivedListeners: Array` - 
- `member: IPartyMember` - 
- `maxSize: number` - 

### KOHandler

Mark a spirit as knocked out

**Methods:**
- `markKO()` - markKO method

**Properties:**
- `_onReviveListeners: Array` - 
- `spiritId: string` - 
- `spiritId: string` - 


## Interfaces

### IPartyMember

Unique identifier

**Properties:**


### PartyStatusSummary

PartyStatusSummary interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `help`
- `h`
- `status`
- `add`
- `remove`
- `rem`
- `swap`
- `move`
- `heal`
- `damage`
- `dmg`
- `ko`
- `revive`
- `members`
- `slots`
- `summary`
- `select`
- `clear`
- `demo`
- `quit`
- `exit`
- `q`

## Dependencies



## Usage Example

```typescript
import { IPartyMember } from './miff/pure/PartyPure';

// Example usage
const instance = new IPartyMember();
```
