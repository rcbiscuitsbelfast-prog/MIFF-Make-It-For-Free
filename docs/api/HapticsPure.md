# HapticsPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `HapticDeviceType`
- `HapticPatternType`
- `HapticWaveform`
- `HapticPriority`
- `HapticTarget`
- `HapticDevice`
- `HapticCapabilities`
- `HapticPattern`
- `HapticSequenceItem`
- `HapticEffect`
- `HapticEnvironment`
- `HapticEnvironmentSettings`
- `HapticEvent`
- `HapticGesture`
- `GestureRequirement`
- `HapticFeedback`
- `HapticProfile`
- `HapticProfileSettings`
- `HapticStatistics`
- `HapticConfiguration`
- `HapticGlobalSettings`
- `HapticResponse`
- `HapticEngine`
- `PlayOptions`
- `GestureInput`
- `TouchPoint`
- `HapticPerformanceMetrics`

## Classes

### HapticEngine

HapticEngine class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `devices: Map` - 
- `patterns: Map` - 
- `environments: Map` - 
- `activeEffects: Map` - 
- `eventQueue: HapticEvent` - 
- `configuration: HapticConfiguration` - 
- `performanceMetrics: HapticPerformanceMetrics` - 
- `deviceConnections: Map` - 
- `gestureRecognizer: HapticGestureRecognizer` - 


## Interfaces

### HapticDevice

HapticDevice interface

**Properties:**


### HapticCapabilities

HapticCapabilities interface

**Properties:**


### HapticPattern

HapticPattern interface

**Properties:**


### HapticSequenceItem

HapticSequenceItem interface

**Properties:**


### HapticEffect

HapticEffect interface

**Properties:**


### HapticEnvironment

HapticEnvironment interface

**Properties:**


### HapticEnvironmentSettings

HapticEnvironmentSettings interface

**Properties:**


### HapticEvent

HapticEvent interface

**Properties:**


### HapticGesture

HapticGesture interface

**Properties:**


### GestureRequirement

GestureRequirement interface

**Properties:**


### HapticFeedback

HapticFeedback interface

**Properties:**


### HapticProfile

HapticProfile interface

**Properties:**


### HapticProfileSettings

HapticProfileSettings interface

**Properties:**


### HapticStatistics

HapticStatistics interface

**Properties:**


### HapticConfiguration

HapticConfiguration interface

**Properties:**


### HapticGlobalSettings

HapticGlobalSettings interface

**Properties:**


### HapticResponse

HapticResponse interface

**Properties:**


### PlayOptions

PlayOptions interface

**Properties:**


### GestureInput

GestureInput interface

**Properties:**


### TouchPoint

TouchPoint interface

**Properties:**


### HapticPerformanceMetrics

HapticPerformanceMetrics interface

**Properties:**



## Enums

### HapticDeviceType

HapticDeviceType enum

**Values:**
- `GAMEPAD = 'gamepad'`
- `MOBILE = 'mobile'`
- `WEARABLE = 'wearable'`
- `VR_CONTROLLER = 'vr_controller'`
- `STEERING_WHEEL = 'steering_wheel'`
- `FLIGHT_STICK = 'flight_stick'`
- `CUSTOM = 'custom'`

### HapticPatternType

HapticPatternType enum

**Values:**
- `CONSTANT = 'constant'`
- `RAMP_UP = 'ramp_up'`
- `RAMP_DOWN = 'ramp_down'`
- `PULSE = 'pulse'`
- `CLICK = 'click'`
- `BUZZ = 'buzz'`
- `RUMBLE = 'rumble'`
- `HEARTBEAT = 'heartbeat'`
- `EXPLOSION = 'explosion'`
- `IMPACT = 'impact'`
- `TEXTURE = 'texture'`
- `CUSTOM = 'custom'`

### HapticWaveform

HapticWaveform enum

**Values:**
- `SINE = 'sine'`
- `SQUARE = 'square'`
- `TRIANGLE = 'triangle'`
- `SAWTOOTH = 'sawtooth'`
- `CUSTOM = 'custom'`

### HapticPriority

HapticPriority enum

**Values:**
- `LOW = 'low'`
- `MEDIUM = 'medium'`
- `HIGH = 'high'`
- `CRITICAL = 'critical'`
- `URGENT = 'urgent'`

### HapticTarget

HapticTarget enum

**Values:**
- `LEFT_TRIGGER = 'left_trigger'`
- `RIGHT_TRIGGER = 'right_trigger'`
- `LEFT_RUMBLE = 'left_rumble'`
- `RIGHT_RUMBLE = 'right_rumble'`
- `BOTH_TRIGGERS = 'both_triggers'`
- `BOTH_RUMBLES = 'both_rumbles'`
- `ALL = 'all'`
- `CUSTOM = 'custom'`


## Functions



## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { HapticDeviceType } from './miff/pure/HapticsPure';

// Example usage
const instance = new HapticDeviceType();
```
