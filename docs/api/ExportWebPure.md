# ExportWebPure

**Version:** 1.0.0  
**Description:** Unknown module

## Exports

- `WebBuildType`
- `WebCompressionType`
- `WebTemplateType`
- `WebProjectSettings`
- `WebBuildConfiguration`
- `WebExportReport`
- `WebFileExport`
- `WebExportError`
- `WebExportWarning`
- `WebExporter`

## Classes

### WebExporter

WebExporter class

**Methods:**
- `constructor()` - constructor method

**Properties:**
- `projectSettings: WebProjectSettings` - 
- `buildConfiguration: WebBuildConfiguration` - 
- `exportReports: WebExportReport` - 
- `projectSettings: WebProjectSettings` - 
- `buildConfiguration: WebBuildConfiguration` - 


## Interfaces

### WebProjectSettings

WebProjectSettings interface

**Properties:**


### WebBuildConfiguration

WebBuildConfiguration interface

**Properties:**


### WebExportReport

WebExportReport interface

**Properties:**


### WebFileExport

WebFileExport interface

**Properties:**


### WebExportError

WebExportError interface

**Properties:**


### WebExportWarning

WebExportWarning interface

**Properties:**



## Enums

### WebBuildType

WebBuildType enum

**Values:**
- `DEVELOPMENT = 'development'`
- `PRODUCTION = 'production'`
- `OPTIMIZED = 'optimized'`

### WebCompressionType

WebCompressionType enum

**Values:**
- `NONE = 'none'`
- `GZIP = 'gzip'`
- `BROTLI = 'brotli'`

### WebTemplateType

WebTemplateType enum

**Values:**
- `DEFAULT = 'default'`
- `MINIMAL = 'minimal'`
- `FULL = 'full'`


## Functions



## CLI Commands

- `--project`
- `--output`
- `--deploy`

## Dependencies



## Usage Example

```typescript
import { WebBuildType } from './miff/pure/ExportWebPure';

// Example usage
const instance = new WebBuildType();
```
