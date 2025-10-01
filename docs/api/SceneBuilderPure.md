# SceneBuilderPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `SceneLayer`
- `SceneOptimizationMode`
- `SceneExportFormat`
- `SceneBuildConfiguration`
- `SceneNode`
- `SceneComponent`
- `SceneAsset`
- `SceneLight`
- `SceneCamera`
- `SceneAudio`
- `SceneAnimation`
- `SceneAnimationEvent`
- `SceneParticleSystem`
- `SceneTrigger`
- `SceneTriggerEvent`
- `SceneCollider`
- `ScenePhysicsMaterial`
- `ScenePostProcessing`
- `ScenePostProcessingEffect`
- `SceneBuildResult`
- `SceneOptimizationStats`
- `SceneValidationResult`
- `SceneTemplate`
- `SceneBuilderProgress`
- `SceneBuilderManager`

## Classes

### SceneBuilderManager

SceneBuilderManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `configuration: SceneBuildConfiguration` - 
- `nodes: Map` - 
- `assets: Map` - 
- `lights: Map` - 
- `cameras: Map` - 
- `audios: Map` - 
- `animations: Map` - 
- `particleSystems: Map` - 
- `triggers: Map` - 
- `colliders: Map` - 
- `postProcessing: Map` - 
- `templates: Map` - 
- `configuration: SceneBuildConfiguration` - 


## Interfaces

### SceneBuildConfiguration

SceneBuildConfiguration interface

**Properties:**


### SceneNode

SceneNode interface

**Properties:**


### SceneComponent

SceneComponent interface

**Properties:**


### SceneAsset

SceneAsset interface

**Properties:**


### SceneLight

SceneLight interface

**Properties:**


### SceneCamera

SceneCamera interface

**Properties:**


### SceneAudio

SceneAudio interface

**Properties:**


### SceneAnimation

SceneAnimation interface

**Properties:**


### SceneAnimationEvent

SceneAnimationEvent interface

**Properties:**


### SceneParticleSystem

SceneParticleSystem interface

**Properties:**


### SceneTrigger

SceneTrigger interface

**Properties:**


### SceneTriggerEvent

SceneTriggerEvent interface

**Properties:**


### SceneCollider

SceneCollider interface

**Properties:**


### ScenePhysicsMaterial

ScenePhysicsMaterial interface

**Properties:**


### ScenePostProcessing

ScenePostProcessing interface

**Properties:**


### ScenePostProcessingEffect

ScenePostProcessingEffect interface

**Properties:**


### SceneBuildResult

SceneBuildResult interface

**Properties:**


### SceneOptimizationStats

SceneOptimizationStats interface

**Properties:**


### SceneValidationResult

SceneValidationResult interface

**Properties:**


### SceneTemplate

SceneTemplate interface

**Properties:**


### SceneBuilderProgress

SceneBuilderProgress interface

**Properties:**



## Enums

### SceneLayer

SceneLayer enum

**Values:**
- `BACKGROUND = 'background'`
- `TERRAIN = 'terrain'`
- `STRUCTURES = 'structures'`
- `INTERACTABLES = 'interactables'`
- `CHARACTERS = 'characters'`
- `EFFECTS = 'effects'`
- `UI = 'ui'`
- `OVERLAY = 'overlay'`

### SceneOptimizationMode

SceneOptimizationMode enum

**Values:**
- `NONE = 'none'`
- `CULLING = 'culling'`
- `LOD = 'lod'`
- `BATCHING = 'batching'`
- `INSTANCING = 'instancing'`
- `OCCLUSION = 'occlusion'`

### SceneExportFormat

SceneExportFormat enum

**Values:**
- `UNITY = 'unity'`
- `GODOT = 'godot'`
- `WEBGL = 'webgl'`
- `GLTF = 'gltf'`
- `FBX = 'fbx'`
- `OBJ = 'obj'`
- `JSON = 'json'`
- `BINARY = 'binary'`


## Functions



## CLI Commands

- `build`
- `validate`
- `export`
- `template`
- `info`

## Dependencies



## Usage Example

```typescript
import { SceneLayer } from './miff/pure/SceneBuilderPure';

// Example usage
const instance = new SceneLayer();
```
