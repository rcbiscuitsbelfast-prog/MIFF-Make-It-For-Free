# RenderReplayPure

**Version:** 1.0.0  
**Description:** RenderReplayPure - Render Replay System This module provides functionality for recording, playing back, and analyzing render data for game replay systems. /

## Exports

- `RenderReplayConfig`
- `RenderFrame`
- `ReplaySession`
- `RenderReplaySystem`

## Classes

### RenderReplaySystem

RenderReplaySystem class

**Methods:**
- `startRecording()` - startRecording method

**Properties:**
- `sessions: Map` - 
- `sessionId: string` - 
- `config: RenderReplayConfig` - 
- `session: ReplaySession` - 
- `id: sessionId` - 
- `startTime: Date` - 
- `frameRate: config` - 


## Interfaces

### RenderReplayConfig

RenderReplayConfig interface

**Properties:**


### RenderFrame

RenderFrame interface

**Properties:**


### ReplaySession

ReplaySession interface

**Properties:**



## Enums



## Functions



## CLI Commands

- `replay-golden`
- `replay-cli`
- `replay-payload`
- `export`

## Dependencies



## Usage Example

```typescript
import { RenderReplayConfig } from './miff/pure/RenderReplayPure';

// Example usage
const instance = new RenderReplayConfig();
```
