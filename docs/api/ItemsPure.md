# ItemsPure

**Version:** 1.0.0  
**Description:** ItemsPure - Item Management System Comprehensive item management system for game items, including creation, modification, and inventory operations. /

## Exports

- `ItemType`
- `ItemRarity`
- `ItemEffectType`
- `UsageStatus`
- `Item`
- `ItemInstance`
- `IPlayerContext`
- `ISpiritInstance`
- `IItemEffectContext`
- `UsageResult`
- `ItemEffect`
- `ItemsManager`
- `ItemUsageManager`
- `ItemUtils`
- `defaultItemsManager`

## Classes

### Item

Item class

**Methods:**


**Properties:**
- `itemID: string` - 
- `name: string` - 
- `description: string` - 
- `type: ItemType` - 
- `rarity: ItemRarity` - 
- `value: number` - 
- `stackable: boolean` - 
- `maxStack: number` - 
- `effect: ItemEffect` - 
- `isConsumable: boolean` - 
- `isKeyItem: boolean` - 
- `isEvolutionItem: boolean` - 
- `properties: Record` - 
- `metadata: Record` - 
- `itemID: string` - 
- `name: string` - 
- `type: ItemType` - 
- `effect: ItemEffect` - 
- `999: 99` - 
- `enumerable: true` - 
- `configurable: true` - 

### UsageResult

UsageResult class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `status: UsageStatus` - 
- `message: string` - 
- `status: UsageStatus` - 
- `message: string` - 

### ItemEffect

ItemEffect class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `effectType: ItemEffectType` - 
- `amount: number` - 
- `cooldownSeconds: number` - 
- `maxUses: number` - 
- `effectType: ItemEffectType` - 
- `amount: number` - 
- `cooldownSeconds: number` - 
- `maxUses: number` - 

### ItemsManager

ItemsManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `items: Map` - 
- `instances: Map` - 

### ItemUsageManager

ItemUsageManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `context: IPlayerContext` - 
- `registeredItems: Map` - 
- `context: IPlayerContext` - 

### ItemUtils

ItemUtils class

**Methods:**


**Properties:**



## Interfaces

### ItemInstance

ItemInstance interface

**Properties:**


### IPlayerContext

IPlayerContext interface

**Properties:**


### ISpiritInstance

ISpiritInstance interface

**Properties:**


### IItemEffectContext

IItemEffectContext interface

**Properties:**



## Enums

### ItemType

ItemType enum

**Values:**
- `CONSUMABLE = 'consumable'`
- `WEAPON = 'weapon'`
- `ARMOR = 'armor'`
- `MATERIAL = 'material'`
- `QUEST = 'quest'`
- `CURRENCY = 'currency'`
- `EVOLUTION_ITEM = 'material'`
- `KEY_ITEM = 'quest' // Alias for backward compatibility`

### ItemRarity

ItemRarity enum

**Values:**
- `COMMON = 'common'`
- `UNCOMMON = 'uncommon'`
- `RARE = 'rare'`
- `EPIC = 'epic'`
- `LEGENDARY = 'legendary'`

### ItemEffectType

ItemEffectType enum

**Values:**
- `NONE = 'none'`
- `HEAL = 'heal'`
- `REVIVE = 'revive'`
- `SYNC_BOOST = 'sync_boost'`
- `EVOLVE = 'evolve'`
- `UNLOCK_FLAG = 'unlock_flag'`
- `BUFF_ATTACK = 'buff_attack'`
- `BUFF_DEFENSE = 'buff_defense'`
- `BUFF_SPEED = 'buff_speed'`

### UsageStatus

UsageStatus enum

**Values:**
- `SUCCESS = 'success'`
- `INVALID_TARGET = 'invalid_target'`
- `EFFECT_BLOCKED = 'effect_blocked'`
- `INSUFFICIENT_RESOURCES = 'insufficient_resources'`
- `ITEM_NOT_FOUND = 'item_not_found'`


## Functions



## CLI Commands

- `help`
- `h`
- `items`
- `i`
- `spirits`
- `s`
- `use`
- `u`
- `info`
- `search`
- `heal`
- `damage`
- `dmg`
- `status`
- `stat`
- `exit`
- `quit`
- `q`

## Dependencies



## Usage Example

```typescript
import { ItemType } from './miff/pure/ItemsPure';

// Example usage
const instance = new ItemType();
```
