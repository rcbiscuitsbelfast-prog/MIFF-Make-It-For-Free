# CutScenePure

**Version:** 1.0.0  
**Description:** CutScenePure - Cinematic Storytelling Module for MIFF Provides a unified system for creating and triggering cut scenes across Unity, Unreal, Godot, and WebBridgePure using modular, declarative definitions. /

## Exports

- `CutSceneEngine`
- `CutSceneWebBridge`
- `CutSceneUnityBridge`
- `CutSceneGodotBridge`
- `CutSceneUnrealBridge`
- `CutScenePure`
- `cutSceneDemo`

## Classes

### CutSceneEngine

CutSceneEngine class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `cutScene: CutScenePure` - 
- `definition: CutSceneDefinition` - 

### CutSceneWebBridge

CutSceneWebBridge class

**Methods:**
- `generateCutSceneScript()` - generateCutSceneScript method
- `CutSceneWebBridge()` - CutSceneWebBridge method

**Properties:**
- `definition: CutSceneDefinition` - 

### CutSceneUnityBridge

CutSceneUnityBridge class

**Methods:**
- `generateCutSceneScript()` - generateCutSceneScript method
- `Start()` - Start method
- `if()` - if method

**Properties:**
- `definition: CutSceneDefinition` - 
- `CutScenePlayer: MonoBehaviour` - 

### CutSceneGodotBridge

CutSceneGodotBridge class

**Methods:**
- `generateCutSceneScript()` - generateCutSceneScript method

**Properties:**
- `definition: CutSceneDefinition` - 
- `definition: Dictionary` - 
- `is_playing: bool` - 

### CutSceneUnrealBridge

CutSceneUnrealBridge class

**Methods:**
- `generateCutSceneHeader()` - generateCutSceneHeader method

**Properties:**
- `definition: CutSceneDefinition` - 
- `ACutScenePlayer: public` - 
- `public: ACutScenePlayer` - 

### CutScenePure

CutScenePure class

**Methods:**


**Properties:**
- `config: CutSceneConfig` - 
- `state: CutSceneState` - 
- `definition: CutSceneDefinition` - 
- `engines: CutSceneEngine` - 
- `actionQueue: CutSceneAction` - 
- `eventListeners: Map` - 
- `result: any` - 
- `definition: CutSceneDefinition` - 
- `engines: Partial` - 


## Interfaces



## Enums



## Functions

### cutSceneDemo

cutSceneDemo function

**Parameters:**   
**Returns:** any


## CLI Commands

No CLI commands available

## Dependencies

- `EventBusPure`
- `DialogueSystemPure`
- `CameraSystemPure`
- `AudioPure`
- `AvatarSystemPure`
- `PixelAnimPure`

## Usage Example

```typescript
import { CutSceneEngine } from './miff/pure/CutScenePure';

// Example usage
const instance = new CutSceneEngine();
```
