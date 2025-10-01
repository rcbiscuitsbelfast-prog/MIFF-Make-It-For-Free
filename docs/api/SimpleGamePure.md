# SimpleGamePure

**Version:** 1.0.0  
**Description:** SimpleGamePure - Rapid Prototyping Module for MIFF A lightweight module that auto-configures basic MIFF modules for simple games. Perfect for game jams, prototypes, and beginner developers who want to get started quickly without complex configuration. Features: - Pre-configured game templates (clicker, platformer, arcade, RPG) - Auto-wiring of essential modules - Simple APIs for common game patterns - One-line game setup /

## Exports

- `GameType`
- `DifficultyLevel`
- `SimpleGameConfig`
- `GameStats`
- `Achievement`
- `SimpleGameBuilder`
- `SimpleClickerGame`
- `SimplePlatformerGame`
- `SimpleArcadeGame`
- `SimpleRPGGame`
- `SimpleCustomGame`
- `SimpleGameUtils`
- `GameTemplates`
- `simpleGameBuilder`

## Classes

### SimpleGameBuilder

SimpleGameBuilder class

**Methods:**


**Properties:**
- `MODULE_DEPENDENCIES: Record` - 

### SimpleClickerGame

SimpleClickerGame class

**Methods:**


**Properties:**
- `clickPower: number` - 
- `autoClickers: number` - 
- `autoClickerPower: number` - 
- `upgradeCosts: Record` - 
- `clickPower: 10` - 
- `autoClicker: 50` - 

### SimplePlatformerGame

SimplePlatformerGame class

**Methods:**


**Properties:**
- `playerX: number` - 
- `playerY: number` - 
- `velocityX: number` - 
- `velocityY: number` - 
- `onGround: boolean` - 
- `coins: number` - 
- `platforms: Array` - 
- `x: number` - 
- `y: number` - 
- `width: number` - 
- `height: number` - 

### SimpleArcadeGame

SimpleArcadeGame class

**Methods:**


**Properties:**
- `playerLives: number` - 
- `enemies: Array` - 
- `x: number` - 
- `y: number` - 
- `speed: number` - 

### SimpleRPGGame

SimpleRPGGame class

**Methods:**


**Properties:**
- `health: number` - 
- `maxHealth: number` - 
- `attack: number` - 
- `defense: number` - 
- `experience: number` - 
- `experienceToNext: number` - 

### SimpleCustomGame

SimpleCustomGame class

**Methods:**
- `onStart()` - onStart method

**Properties:**



## Interfaces

### SimpleGameConfig

SimpleGameConfig interface

**Properties:**


### GameStats

GameStats interface

**Properties:**


### Achievement

Achievement interface

**Properties:**



## Enums

### GameType

GameType enum

**Values:**
- `CLICKER = 'clicker'`
- `PLATFORMER = 'platformer'`
- `ARCADE = 'arcade'`
- `RPG = 'rpg'`
- `PUZZLE = 'puzzle'`
- `IDLE = 'idle'`
- `CUSTOM = 'custom'`

### DifficultyLevel

DifficultyLevel enum

**Values:**
- `EASY = 'easy'`
- `MEDIUM = 'medium'`
- `HARD = 'hard'`


## Functions



## CLI Commands

- `1`
- `2`
- `3`
- `4`
- `5`
- `6`
- `7`
- `8`
- `9`
- `0`
- `upgrade`
- `auto`
- `stats`
- `w`
- `a`
- `s`
- `d`
- ` `
- `space`
- `collect`
- `pos`
- ` `
- `space`
- `stats`
- `attack`
- `explore`
- `stats`

## Dependencies



## Usage Example

```typescript
import { GameType } from './miff/pure/SimpleGamePure';

// Example usage
const instance = new GameType();
```
