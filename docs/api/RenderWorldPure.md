# RenderWorldPure

**Version:** 1.0.0  
**Description:** RenderWorld Pure - Real-Time AI-Native Game Preview Engine The central hub scene for navigating between MIFF demo worlds, showcasing modular rendering capabilities with Superhot-inspired aesthetics. /

## Exports

- `RenderWorldPure`
- `renderWorldDemo`

## Classes

### RenderWorldPure

RenderWorldPure class

**Methods:**


**Properties:**
- `state: RenderWorldGameState` - 
- `combat: CombatEngine` - 
- `items: ItemUsageManager` - 
- `quests: QuestsManager` - 
- `teams: TeamManager` - 
- `ai: AIManager` - 
- `hud: HUDManager` - 
- `scene: SceneBuilderManager` - 
- `avatar: AvatarSystemPure` - 
- `nextNode: typeof` - 


## Interfaces



## Enums



## Functions

### renderWorldDemo

renderWorldDemo function

**Parameters:**   
**Returns:** any


## CLI Commands

- `build-sample`
- `validate`
- `renderworld`

## Dependencies



## Usage Example

```typescript
import { RenderWorldPure } from './miff/pure/RenderWorldPure';

// Example usage
const instance = new RenderWorldPure();
```
