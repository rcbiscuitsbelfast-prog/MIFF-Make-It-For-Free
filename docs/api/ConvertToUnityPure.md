# ConvertToUnityPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `UnityExportTarget`
- `UnityBuildConfiguration`
- `UnityApiCompatibilityLevel`
- `UnityColorSpace`
- `UnityRenderingPath`
- `UnityStereoRenderingPath`
- `UnityScriptingBackend`
- `UnityCompressionMethod`
- `UnityProjectSettings`
- `UnityRenderSettings`
- `UnityQualitySettings`
- `UnityPhysicsSettings`
- `UnityTimeSettings`
- `UnityAudioSettings`
- `UnityPlayerSettings`
- `UnityEditorSettings`
- `UnityExportConfiguration`
- `UnityBuildOptions`
- `UnityBuildReport`
- `UnityBuildSummary`
- `UnityBuildFile`
- `UnityBuildDependency`
- `UnityBuildStrippingInfo`
- `UnityBuildStep`
- `UnityConversionReport`
- `UnityAssetConversion`
- `UnityConversionError`
- `UnityConversionWarning`
- `UnityConverter`

## Classes

### UnityConverter

UnityConverter class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `projectSettings: UnityProjectSettings` - 
- `exportConfiguration: UnityExportConfiguration` - 
- `buildOptions: UnityBuildOptions` - 
- `conversionReports: UnityConversionReport` - 
- `projectSettings: UnityProjectSettings` - 
- `exportConfiguration: UnityExportConfiguration` - 


## Interfaces

### UnityProjectSettings

UnityProjectSettings interface

**Properties:**


### UnityRenderSettings

UnityRenderSettings interface

**Properties:**


### UnityQualitySettings

UnityQualitySettings interface

**Properties:**


### UnityPhysicsSettings

UnityPhysicsSettings interface

**Properties:**


### UnityTimeSettings

UnityTimeSettings interface

**Properties:**


### UnityAudioSettings

UnityAudioSettings interface

**Properties:**


### UnityPlayerSettings

UnityPlayerSettings interface

**Properties:**


### UnityEditorSettings

UnityEditorSettings interface

**Properties:**


### UnityExportConfiguration

UnityExportConfiguration interface

**Properties:**


### UnityBuildOptions

UnityBuildOptions interface

**Properties:**


### UnityBuildReport

UnityBuildReport interface

**Properties:**


### UnityBuildSummary

UnityBuildSummary interface

**Properties:**


### UnityBuildFile

UnityBuildFile interface

**Properties:**


### UnityBuildDependency

UnityBuildDependency interface

**Properties:**


### UnityBuildStrippingInfo

UnityBuildStrippingInfo interface

**Properties:**


### UnityBuildStep

UnityBuildStep interface

**Properties:**


### UnityConversionReport

UnityConversionReport interface

**Properties:**


### UnityAssetConversion

UnityAssetConversion interface

**Properties:**


### UnityConversionError

UnityConversionError interface

**Properties:**


### UnityConversionWarning

UnityConversionWarning interface

**Properties:**



## Enums

### UnityExportTarget

UnityExportTarget enum

**Values:**
- `WINDOWS = 'windows'`
- `MACOS = 'macos'`
- `LINUX = 'linux'`
- `ANDROID = 'android'`
- `IOS = 'ios'`
- `WEBGL = 'webgl'`
- `XBOX = 'xbox'`
- `PLAYSTATION = 'playstation'`
- `NINTENDO_SWITCH = 'nintendo_switch'`
- `HOLOLENS = 'hololens'`
- `STANDALONE = 'standalone'`

### UnityBuildConfiguration

UnityBuildConfiguration enum

**Values:**
- `DEBUG = 'debug'`
- `RELEASE = 'release'`
- `MASTER = 'master'`
- `DEVELOPMENT = 'development'`

### UnityApiCompatibilityLevel

UnityApiCompatibilityLevel enum

**Values:**
- `NET_STANDARD_2_0 = 'net_standard_2_0'`
- `NET_STANDARD_2_1 = 'net_standard_2_1'`
- `NET_4_X = 'net_4_x'`
- `NET_6_0 = 'net_6_0'`

### UnityColorSpace

UnityColorSpace enum

**Values:**
- `GAMMA = 'gamma'`
- `LINEAR = 'linear'`

### UnityRenderingPath

UnityRenderingPath enum

**Values:**
- `FORWARD = 'forward'`
- `DEFERRED = 'deferred'`
- `LEGACY_VERTEX_LIT = 'legacy_vertex_lit'`
- `LEGACY_DEFERRED = 'legacy_deferred'`

### UnityStereoRenderingPath

UnityStereoRenderingPath enum

**Values:**
- `MULTI_PASS = 'multi_pass'`
- `SINGLE_PASS = 'single_pass'`
- `SINGLE_PASS_INSTANCED = 'single_pass_instanced'`

### UnityScriptingBackend

UnityScriptingBackend enum

**Values:**
- `MONO = 'mono'`
- `IL2CPP = 'il2cpp'`

### UnityCompressionMethod

UnityCompressionMethod enum

**Values:**
- `DEFAULT = 'default'`
- `LZ4 = 'lz4'`
- `LZ4HC = 'lz4hc'`
- `NONE = 'none'`


## Functions



## CLI Commands

No CLI commands available

## Dependencies



## Usage Example

```typescript
import { UnityExportTarget } from './miff/pure/ConvertToUnityPure';

// Example usage
const instance = new UnityExportTarget();
```
