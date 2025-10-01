# SpiritsPure

**Version:** 1.0.0  
**Description:** SpiritsPure - SpiritDex Management System A comprehensive spirit (creature) management system for filtering, sorting, and managing spirit collections. Features advanced filtering by type, sync level, evolution status, and lore, plus flexible sorting options. /

## Exports

- `SpiritType`
- `SpiritRarity`
- `SortOption`
- `ISpiritFilter`
- `ISpiritSortCriteria`
- `ISpiritStats`
- `ISpiritMove`
- `ISpiritEvolution`
- `ISpiritLore`
- `ISpirit`
- `ISpiritCollection`
- `SpiritFilter`
- `SpiritSorter`
- `Spirit`
- `SpiritCollection`
- `SpiritUtils`
- `defaultSpiritFilter`
- `defaultSpiritSorter`
- `defaultSpiritCollection`
- `defaultSpirit`

## Classes

### SpiritSorter

Sort spirits by specified option

**Methods:**
- `if()` - if method

**Properties:**
- `spirits: ISpirit` - 
- `sortOption: SortOption` - 
- `ascending: boolean` - 


## Interfaces

### ISpiritFilter

ISpiritFilter interface

**Properties:**


### ISpiritSortCriteria

ISpiritSortCriteria interface

**Properties:**


### ISpiritStats

ISpiritStats interface

**Properties:**


### ISpiritMove

ISpiritMove interface

**Properties:**


### ISpiritEvolution

ISpiritEvolution interface

**Properties:**


### ISpiritLore

ISpiritLore interface

**Properties:**


### ISpirit

ISpirit interface

**Properties:**


### ISpiritCollection

ISpiritCollection interface

**Properties:**



## Enums

### SpiritType

SpiritType enum

**Values:**
- `NONE = 'none'`
- `FIRE = 'fire'`
- `WATER = 'water'`
- `GRASS = 'grass'`
- `ELECTRIC = 'electric'`
- `PSYCHIC = 'psychic'`
- `ICE = 'ice'`
- `DRAGON = 'dragon'`
- `DARK = 'dark'`
- `FAIRY = 'fairy'`
- `NORMAL = 'normal'`
- `FIGHTING = 'fighting'`
- `POISON = 'poison'`
- `GROUND = 'ground'`
- `FLYING = 'flying'`
- `BUG = 'bug'`
- `ROCK = 'rock'`
- `GHOST = 'ghost'`
- `STEEL = 'steel'`
- `LIGHT = 'light'`
- `SHADOW = 'shadow'`
- `TIME = 'time'`
- `SPACE = 'space'`
- `SOUND = 'sound'`
- `CHAOS = 'chaos'`
- `ORDER = 'order'`
- `LIFE = 'life'`
- `DEATH = 'death'`
- `BALANCE = 'balance'`

### SpiritRarity

SpiritRarity enum

**Values:**
- `COMMON = 1`
- `UNCOMMON = 2`
- `RARE = 3`
- `EPIC = 4`
- `LEGENDARY = 5`
- `MYTHICAL = 6`
- `UNIQUE = 7`

### SortOption

SortOption enum

**Values:**
- `ALPHABETICAL_ASC = 'alphabetical_asc'`
- `ALPHABETICAL_DESC = 'alphabetical_desc'`
- `SYNC_ASC = 'sync_asc'`
- `SYNC_DESC = 'sync_desc'`
- `RARITY_ASC = 'rarity_asc'`
- `RARITY_DESC = 'rarity_desc'`
- `LEVEL_ASC = 'level_asc'`
- `LEVEL_DESC = 'level_desc'`
- `CAPTURE_DATE_ASC = 'capture_date_asc'`
- `CAPTURE_DATE_DESC = 'capture_date_desc'`


## Functions



## CLI Commands

- `help`
- `h`
- `list`
- `l`
- `add`
- `a`
- `remove`
- `r`
- `search`
- `s`
- `filter`
- `f`
- `sort`
- `capture`
- `c`
- `release`
- `favorite`
- `fav`
- `stats`
- `completion`
- `comp`
- `info`
- `i`
- `demo`
- `d`
- `exit`
- `quit`
- `q`
- `captured`
- `uncaptured`
- `favorites`
- `evolved`
- `unevolved`
- `captured`
- `uncaptured`
- `fire`
- `water`
- `high-sync`
- `legendary`
- `evolved`
- `favorites`
- `clear`
- `alpha`
- `name`
- `sync`
- `rarity`
- `level`

## Dependencies



## Usage Example

```typescript
import { SpiritType } from './miff/pure/SpiritsPure';

// Example usage
const instance = new SpiritType();
```
