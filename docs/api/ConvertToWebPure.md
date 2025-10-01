# ConvertToWebPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `WebPlatform`
- `WebRenderer`
- `WebAudioSystem`
- `WebInputSystem`
- `WebBuildType`
- `WebProject`
- `WebScene`
- `WebGameObject`
- `WebComponent`
- `WebEventHandler`
- `WebAnimation`
- `WebAnimationFrame`
- `WebSystem`
- `WebAsset`
- `WebScript`
- `WebStyle`
- `WebMediaQuery`
- `WebSelector`
- `WebConfiguration`
- `WebProjectMetadata`
- `WebBuildResult`
- `WebBuildStatistics`
- `WebEvent`
- `WebConverter`
- `ConversionOptions`
- `ValidationResult`

## Classes

### WebConverter

WebConverter class

**Methods:**


**Properties:**
- `project: WebProject` - 
- `renderer: WebRenderer` - 
- `platform: WebPlatform` - 
- `buildType: WebBuildType` - 
- `options: ConversionOptions` - 
- `statistics: WebBuildStatistics` - 
- `eventQueue: WebEvent` - 
- `assetMap: Map` - 
- `scriptMap: Map` - 
- `sceneMap: Map` - 
- `options: ConversionOptions` - 


## Interfaces

### WebProject

WebProject interface

**Properties:**


### WebScene

WebScene interface

**Properties:**


### WebGameObject

WebGameObject interface

**Properties:**


### WebComponent

WebComponent interface

**Properties:**


### WebEventHandler

WebEventHandler interface

**Properties:**


### WebAnimation

WebAnimation interface

**Properties:**


### WebAnimationFrame

WebAnimationFrame interface

**Properties:**


### WebSystem

WebSystem interface

**Properties:**


### WebAsset

WebAsset interface

**Properties:**


### WebScript

WebScript interface

**Properties:**


### WebStyle

WebStyle interface

**Properties:**


### WebMediaQuery

WebMediaQuery interface

**Properties:**


### WebSelector

WebSelector interface

**Properties:**


### WebConfiguration

WebConfiguration interface

**Properties:**


### WebProjectMetadata

WebProjectMetadata interface

**Properties:**


### WebBuildResult

WebBuildResult interface

**Properties:**


### WebBuildStatistics

WebBuildStatistics interface

**Properties:**


### WebEvent

WebEvent interface

**Properties:**


### ConversionOptions

ConversionOptions interface

**Properties:**


### ValidationResult

ValidationResult interface

**Properties:**



## Enums

### WebPlatform

WebPlatform enum

**Values:**
- `WEBGL = 'webgl'`
- `CANVAS_2D = 'canvas2d'`
- `HTML5_GAME = 'html5'`
- `WEBXR = 'webxr'`
- `PROGRESSIVE_WEB_APP = 'pwa'`

### WebRenderer

WebRenderer enum

**Values:**
- `PIXI_JS = 'pixi.js'`
- `PHASER = 'phaser'`
- `BABYLON_JS = 'babylon.js'`
- `THREE_JS = 'three.js'`
- `CUSTOM = 'custom'`

### WebAudioSystem

WebAudioSystem enum

**Values:**
- `WEB_AUDIO_API = 'web_audio_api'`
- `HOWLER_JS = 'howler.js'`
- `PIXI_SOUND = 'pixi_sound'`
- `CUSTOM = 'custom'`

### WebInputSystem

WebInputSystem enum

**Values:**
- `KEYBOARD_MOUSE = 'keyboard_mouse'`
- `TOUCH = 'touch'`
- `GAMEPAD = 'gamepad'`
- `GESTURES = 'gestures'`
- `CUSTOM = 'custom'`

### WebBuildType

WebBuildType enum

**Values:**
- `DEVELOPMENT = 'development'`
- `PRODUCTION = 'production'`
- `OPTIMIZED = 'optimized'`


## Functions



## CLI Commands

No CLI commands available

## Dependencies

- `./game.js`

## Usage Example

```typescript
import { WebPlatform } from './miff/pure/ConvertToWebPure';

// Example usage
const instance = new WebPlatform();
```
