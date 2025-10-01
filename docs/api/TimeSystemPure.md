# TimeSystemPure

**Version:** 2.0.0  
**Description:** TimeSystemPure - AAA Quality Time Management System Advanced time management with day/night cycles and time manipulation /

## Exports

- `TimeOfDay`
- `Season`
- `TimeAcceleration`
- `TimeData`
- `TimeSystemConfig`
- `TimeSystemPure`

## Classes

### TimeSystemPure

TimeSystemPure class

**Methods:**


**Properties:**
- `eventBus: EventBus` - 
- `config: TimeSystemConfig` - 
- `currentTimeData: TimeData` - 
- `isPaused: boolean` - 
- `lastUpdateTime: number` - 
- `currentTimeScale: number` - 
- `eventBus: EventBus` - 
- `config: TimeSystemConfig` - 
- `initialTime: 0` - 
- `dayLength: 1440` - 
- `enableSeasons: true` - 
- `debugMode: false` - 


## Interfaces

### TimeData

TimeData interface

**Properties:**


### TimeSystemConfig

TimeSystemConfig interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `status`
- `s`
- `set`
- `speed`
- `pause`
- `resume`
- `reset`
- `quit`
- `exit`

## Dependencies

- `EventBusPure/index.js`

## Usage Example

```typescript
import { TimeOfDay } from './miff/pure/TimeSystemPure';

// Example usage
const instance = new TimeOfDay();
```
