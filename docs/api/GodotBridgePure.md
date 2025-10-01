# GodotBridgePure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `GodotBridgeType`
- `GodotCommunicationProtocol`
- `GodotNodeType`
- `GodotSignalType`
- `GodotPropertyType`
- `GodotMethodType`
- `GodotResourceType`
- `GodotBridgeConfiguration`
- `GodotNodeBridge`
- `GodotSignalBridge`
- `GodotSignalConnection`
- `GodotMethodBridge`
- `GodotParameterBridge`
- `GodotPropertyBridge`
- `GodotResourceBridge`
- `GodotSceneBridge`
- `GodotInputEventBridge`
- `GodotPhysicsBridge`
- `GodotRenderingBridge`
- `GodotAudioBridge`
- `GodotAnimationBridge`
- `GodotNetworkBridge`
- `GodotMultiplayerBridge`
- `GodotMessage`
- `GodotCommand`
- `RetryPolicy`
- `RollbackStrategy`
- `GodotQuery`
- `GodotEvent`
- `GodotResponse`
- `GodotError`
- `GodotConnection`
- `GodotPerformanceMetrics`
- `GodotBridgeStatistics`
- `GodotBridgeManager`

## Classes

### GodotBridgeManager

GodotBridgeManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `configuration: GodotBridgeConfiguration` - 
- `connections: Map` - 
- `nodes: Map` - 
- `scenes: Map` - 
- `resources: Map` - 
- `messageQueue: GodotMessage` - 
- `eventQueue: GodotEvent` - 
- `commandQueue: GodotCommand` - 
- `queryQueue: GodotQuery` - 
- `responseQueue: GodotResponse` - 
- `inputEventQueue: GodotInputEventBridge` - 
- `signalQueue: any` - 
- `performanceMetrics: GodotPerformanceMetrics` - 
- `statistics: GodotBridgeStatistics` - 
- `configuration: GodotBridgeConfiguration` - 


## Interfaces

### GodotBridgeConfiguration

GodotBridgeConfiguration interface

**Properties:**


### GodotNodeBridge

GodotNodeBridge interface

**Properties:**


### GodotSignalBridge

GodotSignalBridge interface

**Properties:**


### GodotSignalConnection

GodotSignalConnection interface

**Properties:**


### GodotMethodBridge

GodotMethodBridge interface

**Properties:**


### GodotParameterBridge

GodotParameterBridge interface

**Properties:**


### GodotPropertyBridge

GodotPropertyBridge interface

**Properties:**


### GodotResourceBridge

GodotResourceBridge interface

**Properties:**


### GodotSceneBridge

GodotSceneBridge interface

**Properties:**


### GodotInputEventBridge

GodotInputEventBridge interface

**Properties:**


### GodotPhysicsBridge

GodotPhysicsBridge interface

**Properties:**


### GodotRenderingBridge

GodotRenderingBridge interface

**Properties:**


### GodotAudioBridge

GodotAudioBridge interface

**Properties:**


### GodotAnimationBridge

GodotAnimationBridge interface

**Properties:**


### GodotNetworkBridge

GodotNetworkBridge interface

**Properties:**


### GodotMultiplayerBridge

GodotMultiplayerBridge interface

**Properties:**


### GodotMessage

GodotMessage interface

**Properties:**


### GodotCommand

GodotCommand interface

**Properties:**


### RetryPolicy

RetryPolicy interface

**Properties:**


### RollbackStrategy

RollbackStrategy interface

**Properties:**


### GodotQuery

GodotQuery interface

**Properties:**


### GodotEvent

GodotEvent interface

**Properties:**


### GodotResponse

GodotResponse interface

**Properties:**


### GodotError

GodotError interface

**Properties:**


### GodotConnection

GodotConnection interface

**Properties:**


### GodotPerformanceMetrics

GodotPerformanceMetrics interface

**Properties:**


### GodotBridgeStatistics

GodotBridgeStatistics interface

**Properties:**



## Enums

### GodotBridgeType

GodotBridgeType enum

**Values:**
- `NODE = 'node'`
- `SCENE = 'scene'`
- `RESOURCE = 'resource'`
- `SCRIPT = 'script'`
- `SIGNAL = 'signal'`
- `PROPERTY = 'property'`
- `METHOD = 'method'`
- `INPUT_EVENT = 'input_event'`
- `PHYSICS = 'physics'`
- `RENDERING = 'rendering'`
- `AUDIO = 'audio'`
- `ANIMATION = 'animation'`
- `NETWORK = 'network'`
- `MULTIPLAYER = 'multiplayer'`
- `CUSTOM = 'custom'`

### GodotCommunicationProtocol

GodotCommunicationProtocol enum

**Values:**
- `GDNATIVE = 'gdnative'`
- `GDScript = 'gdscript'`
- `NETWORK = 'network'`
- `WEBSOCKET = 'websocket'`
- `HTTP = 'http'`
- `FILE_SYSTEM = 'file_system'`
- `SHARED_MEMORY = 'shared_memory'`
- `MESSAGE_QUEUE = 'message_queue'`

### GodotNodeType

GodotNodeType enum

**Values:**
- `NODE = 'Node'`
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
- `CUSTOM_NODE = 'CustomNode'`

### GodotSignalType

GodotSignalType enum

**Values:**
- `BUILT_IN = 'built_in'`
- `CUSTOM = 'custom'`
- `INPUT_EVENT = 'input_event'`
- `PHYSICS_PROCESS = 'physics_process'`
- `PROCESS = 'process'`
- `NOTIFICATION = 'notification'`
- `TREE_EVENT = 'tree_event'`

### GodotPropertyType

GodotPropertyType enum

**Values:**
- `BOOL = 'bool'`
- `INT = 'int'`
- `FLOAT = 'float'`
- `STRING = 'string'`
- `VECTOR2 = 'vector2'`
- `VECTOR3 = 'vector3'`
- `QUATERNION = 'quaternion'`
- `COLOR = 'color'`
- `RECT2 = 'rect2'`
- `TRANSFORM = 'transform'`
- `BASIS = 'basis'`
- `PLANE = 'plane'`
- `AABB = 'aabb'`
- `RID = 'rid'`
- `OBJECT = 'object'`
- `DICTIONARY = 'dictionary'`
- `ARRAY = 'array'`
- `POOL_ARRAY = 'pool_array'`
- `VARIANT = 'variant'`

### GodotMethodType

GodotMethodType enum

**Values:**
- `BUILT_IN = 'built_in'`
- `CUSTOM = 'custom'`
- `VIRTUAL = 'virtual'`
- `STATIC = 'static'`
- `SIGNAL = 'signal'`
- `PROPERTY_SETTER = 'property_setter'`
- `PROPERTY_GETTER = 'property_getter'`
- `RPC = 'rpc'`

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
- `AUDIO_STREAM_MP3 = 'AudioStreamMP3'`
- `AUDIO_STREAM_WAV = 'AudioStreamWAV'`
- `AUDIO_STREAM_OGG = 'AudioStreamOGG'`


## Functions



## CLI Commands

- `simulate`
- `render`
- `interop`
- `export`
- `dump`

## Dependencies



## Usage Example

```typescript
import { GodotBridgeType } from './miff/pure/GodotBridgePure';

// Example usage
const instance = new GodotBridgeType();
```
