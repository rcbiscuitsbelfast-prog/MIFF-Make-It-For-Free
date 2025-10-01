# UnityBridgePure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `UnityBridgeType`
- `UnityCommunicationProtocol`
- `UnityLifecycleEvent`
- `UnityDataType`
- `UnityBridgeConfiguration`
- `UnityGameObjectBridge`
- `UnityTransformBridge`
- `UnityComponentBridge`
- `UnityMethodBridge`
- `UnityParameterBridge`
- `UnityEventBridge`
- `UnityAssetBridge`
- `UnitySceneBridge`
- `UnitySystemBridge`
- `UnityServiceBridge`
- `UnityMessage`
- `UnityCommand`
- `RetryPolicy`
- `RollbackStrategy`
- `UnityQuery`
- `UnityEvent`
- `UnityResponse`
- `UnityError`
- `UnityConnection`
- `UnityPerformanceMetrics`
- `UnitySynchronizationContext`
- `UnityBridgeStatistics`
- `UnityBridgeManager`

## Classes

### UnityBridgeManager

UnityBridgeManager class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `configuration: UnityBridgeConfiguration` - 
- `connections: Map` - 
- `gameObjects: Map` - 
- `components: Map` - 
- `assets: Map` - 
- `scenes: Map` - 
- `systems: Map` - 
- `services: Map` - 
- `messageQueue: UnityMessage` - 
- `eventQueue: UnityEvent` - 
- `commandQueue: UnityCommand` - 
- `queryQueue: UnityQuery` - 
- `responseQueue: UnityResponse` - 
- `performanceMetrics: UnityPerformanceMetrics` - 
- `statistics: UnityBridgeStatistics` - 
- `synchronizationContexts: Map` - 
- `lifecycleEventHandlers: Map` - 
- `configuration: UnityBridgeConfiguration` - 


## Interfaces

### UnityBridgeConfiguration

UnityBridgeConfiguration interface

**Properties:**


### UnityGameObjectBridge

UnityGameObjectBridge interface

**Properties:**


### UnityTransformBridge

UnityTransformBridge interface

**Properties:**


### UnityComponentBridge

UnityComponentBridge interface

**Properties:**


### UnityMethodBridge

UnityMethodBridge interface

**Properties:**


### UnityParameterBridge

UnityParameterBridge interface

**Properties:**


### UnityEventBridge

UnityEventBridge interface

**Properties:**


### UnityAssetBridge

UnityAssetBridge interface

**Properties:**


### UnitySceneBridge

UnitySceneBridge interface

**Properties:**


### UnitySystemBridge

UnitySystemBridge interface

**Properties:**


### UnityServiceBridge

UnityServiceBridge interface

**Properties:**


### UnityMessage

UnityMessage interface

**Properties:**


### UnityCommand

UnityCommand interface

**Properties:**


### RetryPolicy

RetryPolicy interface

**Properties:**


### RollbackStrategy

RollbackStrategy interface

**Properties:**


### UnityQuery

UnityQuery interface

**Properties:**


### UnityEvent

UnityEvent interface

**Properties:**


### UnityResponse

UnityResponse interface

**Properties:**


### UnityError

UnityError interface

**Properties:**


### UnityConnection

UnityConnection interface

**Properties:**


### UnityPerformanceMetrics

UnityPerformanceMetrics interface

**Properties:**


### UnitySynchronizationContext

UnitySynchronizationContext interface

**Properties:**


### UnityBridgeStatistics

UnityBridgeStatistics interface

**Properties:**



## Enums

### UnityBridgeType

UnityBridgeType enum

**Values:**
- `GAME_OBJECT = 'game_object'`
- `COMPONENT = 'component'`
- `ASSET = 'asset'`
- `SCENE = 'scene'`
- `SYSTEM = 'system'`
- `SERVICE = 'service'`

### UnityCommunicationProtocol

UnityCommunicationProtocol enum

**Values:**
- `MESSAGE_PASSING = 'message_passing'`
- `SHARED_MEMORY = 'shared_memory'`
- `NETWORK_SOCKET = 'network_socket'`
- `FILE_SYSTEM = 'file_system'`
- `DATABASE = 'database'`

### UnityLifecycleEvent

UnityLifecycleEvent enum

**Values:**
- `AWAKE = 'awake'`
- `START = 'start'`
- `UPDATE = 'update'`
- `FIXED_UPDATE = 'fixed_update'`
- `LATE_UPDATE = 'late_update'`
- `ON_DESTROY = 'on_destroy'`
- `ON_DISABLE = 'on_disable'`
- `ON_ENABLE = 'on_enable'`
- `ON_APPLICATION_QUIT = 'on_application_quit'`
- `ON_APPLICATION_PAUSE = 'on_application_pause'`
- `ON_APPLICATION_FOCUS = 'on_application_focus'`

### UnityDataType

UnityDataType enum

**Values:**
- `PRIMITIVE = 'primitive'`
- `ARRAY = 'array'`
- `OBJECT = 'object'`
- `VECTOR2 = 'vector2'`
- `VECTOR3 = 'vector3'`
- `QUATERNION = 'quaternion'`
- `MATRIX4X4 = 'matrix4x4'`
- `COLOR = 'color'`
- `TEXTURE = 'texture'`
- `AUDIO_CLIP = 'audio_clip'`
- `ANIMATION_CLIP = 'animation_clip'`
- `PREFAB = 'prefab'`
- `SCENE_OBJECT = 'scene_object'`
- `CUSTOM = 'custom'`


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
import { UnityBridgeType } from './miff/pure/UnityBridgePure';

// Example usage
const instance = new UnityBridgeType();
```
