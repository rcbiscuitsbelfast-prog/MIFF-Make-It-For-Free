# ExportAndroidPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `AndroidBuildType`
- `AndroidArchitecture`
- `AndroidGraphicsAPI`
- `AndroidBuildSystem`
- `AndroidTextureCompression`
- `AndroidMinSdkVersion`
- `AndroidTargetSdkVersion`
- `AndroidInstallLocation`
- `AndroidInternetAccess`
- `AndroidWriteAccess`
- `AndroidProjectSettings`
- `AndroidBuildConfiguration`
- `AndroidBuildOptions`
- `AndroidBuildReport`
- `AndroidBuildSummary`
- `AndroidBuildFile`
- `AndroidBuildDependency`
- `AndroidBuildStep`
- `AndroidExportReport`
- `AndroidAssetExport`
- `AndroidExportError`
- `AndroidExportWarning`
- `AndroidExporter`

## Classes

### AndroidExporter

AndroidExporter class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `projectSettings: AndroidProjectSettings` - 
- `buildConfiguration: AndroidBuildConfiguration` - 
- `exportReports: AndroidExportReport` - 
- `projectSettings: AndroidProjectSettings` - 
- `buildConfiguration: AndroidBuildConfiguration` - 


## Interfaces

### AndroidProjectSettings

AndroidProjectSettings interface

**Properties:**


### AndroidBuildConfiguration

AndroidBuildConfiguration interface

**Properties:**


### AndroidBuildOptions

AndroidBuildOptions interface

**Properties:**


### AndroidBuildReport

AndroidBuildReport interface

**Properties:**


### AndroidBuildSummary

AndroidBuildSummary interface

**Properties:**


### AndroidBuildFile

AndroidBuildFile interface

**Properties:**


### AndroidBuildDependency

AndroidBuildDependency interface

**Properties:**


### AndroidBuildStep

AndroidBuildStep interface

**Properties:**


### AndroidExportReport

AndroidExportReport interface

**Properties:**


### AndroidAssetExport

AndroidAssetExport interface

**Properties:**


### AndroidExportError

AndroidExportError interface

**Properties:**


### AndroidExportWarning

AndroidExportWarning interface

**Properties:**



## Enums

### AndroidBuildType

AndroidBuildType enum

**Values:**
- `APK = 'apk'`
- `AAB = 'aab'`
- `DEVELOPMENT = 'development'`
- `RELEASE = 'release'`
- `DEBUG = 'debug'`

### AndroidArchitecture

AndroidArchitecture enum

**Values:**
- `ARMV7 = 'armeabi-v7a'`
- `ARM64 = 'arm64-v8a'`
- `X86 = 'x86'`
- `X86_64 = 'x86_64'`

### AndroidGraphicsAPI

AndroidGraphicsAPI enum

**Values:**
- `OPENGL_ES = 'OpenGL ES'`
- `VULKAN = 'Vulkan'`

### AndroidBuildSystem

AndroidBuildSystem enum

**Values:**
- `GRADLE = 'gradle'`
- `INTERNAL = 'internal'`

### AndroidTextureCompression

AndroidTextureCompression enum

**Values:**
- `ATC = 'ATC'`
- `ETC1 = 'ETC1'`
- `ETC2 = 'ETC2'`
- `PVRTC = 'PVRTC'`
- `ASTC = 'ASTC'`
- `DXT1 = 'DXT1'`
- `DEFAULT = 'default'`

### AndroidMinSdkVersion

AndroidMinSdkVersion enum

**Values:**
- `API_16 = 16`
- `API_19 = 19`
- `API_21 = 21`
- `API_22 = 22`
- `API_23 = 23`
- `API_24 = 24`
- `API_25 = 25`
- `API_26 = 26`
- `API_27 = 27`
- `API_28 = 28`
- `API_29 = 29`
- `API_30 = 30`
- `API_31 = 31`
- `API_32 = 32`
- `API_33 = 33`
- `API_34 = 34`

### AndroidTargetSdkVersion

AndroidTargetSdkVersion enum

**Values:**
- `API_29 = 29`
- `API_30 = 30`
- `API_31 = 31`
- `API_32 = 32`
- `API_33 = 33`
- `API_34 = 34`
- `API_35 = 35`

### AndroidInstallLocation

AndroidInstallLocation enum

**Values:**
- `AUTO = 'auto'`
- `PREFER_EXTERNAL = 'preferExternal'`
- `FORCE_INTERNAL = 'forceInternal'`

### AndroidInternetAccess

AndroidInternetAccess enum

**Values:**
- `AUTO = 'auto'`
- `REQUIRE = 'require'`
- `DENY = 'deny'`

### AndroidWriteAccess

AndroidWriteAccess enum

**Values:**
- `EXTERNAL = 'external'`
- `INTERNAL = 'internal'`
- `NONE = 'none'`


## Functions



## CLI Commands

- `--preset`
- `--aab`
- `--apk`
- `--project`
- `--output`
- `--version-code`
- `--version-name`
- `--keystore`
- `--alias`
- `--ks-pass`
- `--key-pass`

## Dependencies



## Usage Example

```typescript
import { AndroidBuildType } from './miff/pure/ExportAndroidPure';

// Example usage
const instance = new AndroidBuildType();
```
