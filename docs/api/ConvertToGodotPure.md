# ConvertToGodotPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `GodotNodeType`
- `GodotResourceType`
- `GodotScriptLanguage`
- `GodotNode`
- `GodotScript`
- `GodotFunction`
- `GodotParameter`
- `GodotComponent`
- `GodotResource`
- `GodotScene`
- `GodotProject`
- `GodotProjectSettings`
- `GodotExportPreset`
- `ConversionOptions`
- `ConversionResult`
- `ConversionStatistics`
- `GodotConverter`

## Classes

### GodotConverter

GodotConverter class

**Methods:**


**Properties:**
- `conversionOptions: ConversionOptions` - 
- `currentProject: GodotProject` - 
- `conversionStartTime: number` - 
- `options: Partial` - 


## Interfaces

### GodotNode

GodotNode interface

**Properties:**


### GodotScript

GodotScript interface

**Properties:**


### GodotFunction

GodotFunction interface

**Properties:**


### GodotParameter

GodotParameter interface

**Properties:**


### GodotComponent

GodotComponent interface

**Properties:**


### GodotResource

GodotResource interface

**Properties:**


### GodotScene

GodotScene interface

**Properties:**


### GodotProject

GodotProject interface

**Properties:**


### GodotProjectSettings

GodotProjectSettings interface

**Properties:**


### GodotExportPreset

GodotExportPreset interface

**Properties:**


### ConversionOptions

ConversionOptions interface

**Properties:**


### ConversionResult

ConversionResult interface

**Properties:**


### ConversionStatistics

ConversionStatistics interface

**Properties:**



## Enums

### GodotNodeType

GodotNodeType enum

**Values:**
- `NODE_2D = 'Node2D'`
- `NODE_3D = 'Node3D'`
- `SPRITE = 'Sprite'`
- `ANIMATED_SPRITE = 'AnimatedSprite'`
- `AREA_2D = 'Area2D'`
- `COLLISION_SHAPE_2D = 'CollisionShape2D'`
- `RIGID_BODY_2D = 'RigidBody2D'`
- `KINEMATIC_BODY_2D = 'KinematicBody2D'`
- `STATIC_BODY_2D = 'StaticBody2D'`
- `TILE_MAP = 'TileMap'`
- `CONTROL = 'Control'`
- `BUTTON = 'Button'`
- `LABEL = 'Label'`
- `TEXTURE_RECT = 'TextureRect'`
- `NINE_PATCH_RECT = 'NinePatchRect'`
- `COLOR_RECT = 'ColorRect'`
- `PANEL = 'Panel'`
- `CONTAINER = 'Container'`
- `HBOX_CONTAINER = 'HBoxContainer'`
- `VBOX_CONTAINER = 'VBoxContainer'`
- `SCROLL_CONTAINER = 'ScrollContainer'`
- `AUDIO_STREAM_PLAYER = 'AudioStreamPlayer'`
- `AUDIO_STREAM_PLAYER_2D = 'AudioStreamPlayer2D'`
- `AUDIO_STREAM_PLAYER_3D = 'AudioStreamPlayer3D'`
- `ANIMATION_PLAYER = 'AnimationPlayer'`
- `TWEEN = 'Tween'`
- `TIMER = 'Timer'`
- `PARTICLES_2D = 'Particles2D'`
- `PARTICLES = 'Particles'`
- `LIGHT_2D = 'Light2D'`
- `LIGHT = 'Light'`
- `CAMERA_2D = 'Camera2D'`
- `CAMERA = 'Camera'`
- `POSITION_2D = 'Position2D'`
- `POSITION_3D = 'Position3D'`
- `RAY_CAST_2D = 'RayCast2D'`
- `RAY_CAST = 'RayCast'`
- `VISIBILITY_NOTIFIER_2D = 'VisibilityNotifier2D'`
- `VISIBILITY_NOTIFIER = 'VisibilityNotifier'`
- `CUSTOM = 'Custom'`

### GodotResourceType

GodotResourceType enum

**Values:**
- `TEXTURE = 'Texture'`
- `AUDIO_STREAM = 'AudioStream'`
- `SCENE = 'Scene'`
- `SCRIPT = 'Script'`
- `MATERIAL = 'Material'`
- `MESH = 'Mesh'`
- `ANIMATION = 'Animation'`
- `FONT = 'Font'`
- `THEME = 'Theme'`
- `TILESET = 'Tileset'`
- `ATLAS_TEXTURE = 'AtlasTexture'`
- `COMPRESSED_TEXTURE_2D = 'CompressedTexture2D'`
- `COMPRESSED_TEXTURE_3D = 'CompressedTexture3D'`
- `AUDIO_STREAM_MP3 = 'AudioStreamMP3'`
- `AUDIO_STREAM_WAV = 'AudioStreamWAV'`
- `AUDIO_STREAM_OGG = 'AudioStreamOGG'`

### GodotScriptLanguage

GodotScriptLanguage enum

**Values:**
- `GDScript = 'gdscript'`
- `CSharp = 'csharp'`
- `VisualScript = 'visual_script'`
- `NativeScript = 'native_script'`


## Functions



## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { GodotNodeType } from './miff/pure/ConvertToGodotPure';

// Example usage
const instance = new GodotNodeType();
```
