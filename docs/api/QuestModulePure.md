# QuestModulePure

**Version:** 1.0.0  
**Description:** parseQuestText - very small, deterministic parser for a simplified quest DSL Example: id: quest_hello title: Hello World start: step_1 step step_1: Talk to elder | trigger: talk elder | next: step_2 step step_2: Bring 3 herbs | trigger: collect herb 3 | next: step_3 step step_3: Finish | trigger: timer 60 | reward: xp 100, item herb 1 /

## Exports

- `QuestTrigger`
- `QuestReward`
- `QuestStep`
- `NormalizedQuest`
- `ParseResult`
- `parseQuestText`
- `validateQuest`

## Classes



## Interfaces

### ParseResult

ParseResult interface

**Properties:**



## Enums



## Functions

### parseQuestText

parseQuestText function

**Parameters:**   
**Returns:** any


## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { QuestTrigger } from './miff/pure/QuestModulePure';

// Example usage
const instance = new QuestTrigger();
```
