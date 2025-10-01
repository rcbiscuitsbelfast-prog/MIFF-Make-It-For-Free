# AudioPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `AudioFormat`
- `AudioChannel`
- `AudioState`
- `AudioEffectType`
- `AudioBusType`
- `AudioSource`
- `AudioEffect`
- `AudioAutomationPoint`
- `AudioBus`
- `AudioBusSend`
- `AudioMixerStrip`
- `AudioAutomation`
- `AudioListener`
- `SpatialAudioConfig`
- `AudioPerformanceMetrics`
- `AudioAnalysisData`
- `AudioEngine`
- `PlayOptions`
- `AudioProject`
- `SecurityConfiguration`

## Classes

### AudioEngine

AudioEngine class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `audioContext: AudioContext` - 
- `sources: Map` - 
- `activeSources: Map` - 
- `buses: Map` - 
- `mixerStrips: Map` - 
- `masterBus: AudioBus` - 
- `audioListener: AudioListener` - 
- `performanceMetrics: AudioPerformanceMetrics` - 
- `analyserNode: AnalyserNode` - 
- `gainNodes: Map` - 


## Interfaces

### AudioSource

AudioSource interface

**Properties:**


### AudioEffect

AudioEffect interface

**Properties:**


### AudioAutomationPoint

AudioAutomationPoint interface

**Properties:**


### AudioBus

AudioBus interface

**Properties:**


### AudioBusSend

AudioBusSend interface

**Properties:**


### AudioMixerStrip

AudioMixerStrip interface

**Properties:**


### AudioAutomation

AudioAutomation interface

**Properties:**


### AudioListener

AudioListener interface

**Properties:**


### SpatialAudioConfig

SpatialAudioConfig interface

**Properties:**


### AudioPerformanceMetrics

AudioPerformanceMetrics interface

**Properties:**


### AudioAnalysisData

AudioAnalysisData interface

**Properties:**


### PlayOptions

PlayOptions interface

**Properties:**


### AudioProject

AudioProject interface

**Properties:**


### SecurityConfiguration

SecurityConfiguration interface

**Properties:**



## Enums

### AudioFormat

AudioFormat enum

**Values:**
- `MP3 = 'mp3'`
- `WAV = 'wav'`
- `OGG = 'ogg'`
- `FLAC = 'flac'`
- `AAC = 'aac'`
- `WEBM = 'webm'`

### AudioChannel

AudioChannel enum

**Values:**
- `MONO = 1`
- `STEREO = 2`
- `SURROUND_5_1 = 6`
- `SURROUND_7_1 = 8`

### AudioState

AudioState enum

**Values:**
- `STOPPED = 'stopped'`
- `PLAYING = 'playing'`
- `PAUSED = 'paused'`
- `LOADING = 'loading'`
- `ERROR = 'error'`

### AudioEffectType

AudioEffectType enum

**Values:**
- `REVERB = 'reverb'`
- `DELAY = 'delay'`
- `CHORUS = 'chorus'`
- `DISTORTION = 'distortion'`
- `COMPRESSION = 'compression'`
- `EQ = 'equalizer'`
- `FILTER = 'filter'`
- `PITCH_SHIFT = 'pitch_shift'`
- `VOLUME = 'volume'`
- `PAN = 'pan'`

### AudioBusType

AudioBusType enum

**Values:**
- `MASTER = 'master'`
- `MUSIC = 'music'`
- `SFX = 'sfx'`
- `VOICE = 'voice'`
- `AMBIENT = 'ambient'`
- `UI = 'ui'`
- `CUSTOM = 'custom'`


## Functions



## CLI Commands

- `create`
- `register-sound`
- `play`
- `stop`
- `pause`
- `set-volume`
- `set-spatial`
- `demo`
- `dump`
- `create`
- `register-sound`
- `play`
- `stop`
- `pause`
- `set-volume`
- `set-spatial`
- `demo`
- `dump`

## Dependencies



## Usage Example

```typescript
import { AudioFormat } from './miff/pure/AudioPure';

// Example usage
const instance = new AudioFormat();
```
