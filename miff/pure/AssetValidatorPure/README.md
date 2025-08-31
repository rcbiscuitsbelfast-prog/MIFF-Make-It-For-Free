# AssetValidatorPure

A deterministic asset bundle validation system that ensures remix-safe compliance and platform compatibility.

## Overview

AssetValidatorPure validates asset bundles against required schemas, ensuring all assets referenced in scenarios are present, properly licensed, and compatible with target platforms. It provides comprehensive validation reports and ensures remix-safe distribution.

## Core Concepts

### Asset Validation
- **Asset Reference**: Assets required by scenarios
- **Asset Manifest**: Complete asset bundle with metadata
- **Validation Rules**: Type-specific validation criteria
- **Compliance Checking**: Remix-safe and licensing validation

### Validation Types
- **Schema Validation**: Required properties and structure
- **License Compliance**: Open source license verification
- **Platform Compatibility**: Target platform support
- **Dependency Checking**: Asset dependency resolution
- **Attribution Verification**: Proper credit assignment

### Asset Types Supported
- **Sprites**: Images with size and format validation
- **Audio**: Sound files with duration and quality checks
- **Fonts**: Typography with family and style validation
- **Shaders**: GPU programs with version compatibility
- **Generic Assets**: Custom asset types with flexible rules

## Schema

### AssetReference
```typescript
interface AssetReference {
  id: string;                    // Unique asset identifier
  path: string;                  // File system path
  type: string;                  // Asset type (sprite, audio, etc.)
  required: boolean;             // Whether asset is mandatory
  source: 'scenario' | 'manifest' | 'dynamic';  // Reference source
}
```

### AssetManifest
```typescript
interface AssetManifest {
  assets: Array<{
    id: string;                  // Unique asset identifier
    path: string;                // File system path
    type: string;                // Asset type
    license: string;             // License identifier
    platform?: string;           // Target platform(s)
    properties?: Record<string, any>;  // Type-specific properties
    attribution?: string;        // Creator attribution
    dependencies?: string[];     // Required asset dependencies
  }>;
  metadata?: {
    version: string;             // Bundle version
    author: string;              // Bundle creator
    description: string;         // Bundle description
    license: string;             // Overall bundle license
    platform: string;            // Target platform
  };
}
```

### ValidationReport
```typescript
interface ValidationReport {
  op: 'validate';                // Operation type
  status: 'ok' | 'error' | 'warning';  // Overall status
  summary: {                     // Validation statistics
    total: number;               // Total assets checked
    valid: number;               // Valid assets
    missing: number;             // Missing assets
    invalid: number;             // Invalid assets
    warnings: number;            // Warning count
  };
  results: AssetValidationResult[];  // Individual asset results
  issues: string[];              // Critical issues
  recommendations: string[];     // Improvement suggestions
  remixSafe: boolean;            // Remix-safe compliance
  compliance: {                  // Compliance breakdown
    licensing: boolean;          // License compliance
    attribution: boolean;        // Attribution compliance
    platformSupport: boolean;    // Platform compatibility
    schemaValidation: boolean;   // Schema compliance
  };
}
```

## Usage

### Basic Asset Validation

```typescript
import { validateAssetBundle, AssetReference, AssetManifest } from './index';

// Validate asset bundle
const report = validateAssetBundle(
  scenarioAssets,
  manifestAssets,
  'web',    // Target platform
  true      // Strict mode
);

// Check results
console.log('Remix-safe:', report.remixSafe);
console.log('Issues:', report.issues);
```

### Validation Rules

```typescript
import { AssetValidationRule } from './index';

const customRule: AssetValidationRule = {
  type: 'custom_asset',
  required: true,
  requiredProperties: ['license', 'custom_prop'],
  licenseWhitelist: ['cc0', 'cc-by'],
  platformCompatibility: ['web', 'unity']
};
```

### Scenario Asset Validation

```typescript
import { validateScenarioAssets } from './index';

// Validate assets for specific scenario
const report = validateScenarioAssets(
  'scenarios/adventure.json',
  'assets/manifest.json',
  'web'
);
```

## CLI Harness

The CLI harness validates asset bundles from JSON input files:

```bash
npx ts-node cliHarness.ts fixtures/asset_validation.json
```

### Input Format
```json
{
  "scenarioAssets": [
    {
      "id": "player_sprite",
      "path": "assets/sprites/player.png",
      "type": "sprite",
      "required": true,
      "source": "scenario"
    }
  ],
  "manifestAssets": {
    "assets": [
      {
        "id": "player_sprite",
        "path": "assets/sprites/player.png",
        "type": "sprite",
        "license": "cc-by",
        "platform": "all",
        "properties": {
          "size": { "width": 64, "height": 64 }
        },
        "attribution": "Created by Artist Name"
      }
    ]
  },
  "platform": "web",
  "strictMode": true
}
```

### Output Format
```json
{
  "op": "validate",
  "status": "ok",
  "summary": {
    "total": 1,
    "valid": 1,
    "missing": 0,
    "invalid": 0,
    "warnings": 0
  },
  "results": [/* asset validation results */],
  "issues": [],
  "recommendations": [],
  "remixSafe": true,
  "compliance": {
    "licensing": true,
    "attribution": true,
    "platformSupport": true,
    "schemaValidation": true
  }
}
```

## Remix-Safe Features

### License Compliance
- **Whitelist Validation**: Only approved open source licenses
- **License Types**: cc0, cc-by, cc-by-sa, public-domain, ofl
- **Attribution Requirements**: Proper credit assignment
- **Commercial Use**: Clear licensing terms

### Attribution System
- **Creator Credits**: Required for attribution-required licenses
- **License Information**: Clear license terms and conditions
- **Usage Rights**: Explicit permission for remixing and distribution
- **Credit Preservation**: Attribution must be maintained

### Platform Compatibility
- **Multi-Platform Support**: Web, Unity, Godot compatibility
- **Asset Format Validation**: Platform-appropriate file formats
- **Dependency Resolution**: Platform-specific asset dependencies
- **Cross-Platform Assets**: Universal asset support

### Schema Validation
- **Property Requirements**: Type-specific required properties
- **Format Validation**: File extension and format checking
- **Size Constraints**: File size limits and validation
- **Metadata Verification**: Complete asset information

## Validation Rules

### Default Rules
- **Sprites**: PNG/JPG/WebP with size and format properties
- **Audio**: WAV/MP3/OGG/WebM with duration and quality
- **Fonts**: TTF/OTF/WOFF/WOFF2 with family and style
- **Shaders**: GLSL/HLSL with version and type information

### Custom Rules
- **Property Requirements**: Define required asset properties
- **License Whitelists**: Custom license approval lists
- **Platform Restrictions**: Platform-specific validation
- **Size Constraints**: File size limits and validation

## Testing

Run the golden tests to verify deterministic behavior:

```bash
npm test -- systems/AssetValidatorPure/tests/golden_AssetValidatorPure.test.ts
```

### Test Coverage
- **Asset Validation Flow**: Complete validation pipeline
- **Strict Mode Testing**: Validation behavior with strict mode
- **Platform Mismatch**: Platform compatibility validation
- **License Compliance**: License validation and compliance
- **Missing Assets**: Handling of missing asset references
- **Orphaned Assets**: Unreferenced asset detection

## Integration

AssetValidatorPure integrates with other Pure modules:

- **AssetManifestPure**: Asset manifest management
- **QuestSystemPure**: Quest-related asset validation
- **AutoBuilderCLI**: Build-time asset validation
- **Scenario Packs**: Scenario asset requirement checking

## Extensibility

The system is designed for easy extension:

- **Custom Asset Types**: Add new asset type validation
- **Custom Rules**: Define project-specific validation rules
- **Custom Licenses**: Add new license type support
- **Custom Platforms**: Extend platform compatibility

## Performance

- **Efficient Validation**: Minimal file system access
- **Batch Processing**: Validate multiple assets simultaneously
- **Caching**: Cache validation results for repeated checks
- **Parallel Processing**: Concurrent asset validation

## Compliance Standards

### Open Source Licenses
- **CC0**: Public domain dedication
- **CC-BY**: Attribution required
- **CC-BY-SA**: Attribution and share-alike
- **OFL**: Open Font License
- **Public Domain**: No copyright restrictions

### Attribution Requirements
- **Creator Names**: Clear creator identification
- **License Terms**: Explicit license information
- **Usage Rights**: Clear permission statements
- **Credit Preservation**: Attribution maintenance

## Error Handling

### Validation Errors
- **Missing Assets**: Assets not found in manifest
- **Invalid Properties**: Missing required properties
- **License Violations**: Unapproved license types
- **Platform Mismatches**: Incompatible platform targeting

### Warning System
- **Missing Attribution**: Attribution information gaps
- **Orphaned Assets**: Unreferenced manifest assets
- **Deprecated Formats**: Outdated file formats
- **Size Warnings**: Large file size notifications

## License

This module follows the same licensing as the parent project, ensuring remix-safe usage and distribution. All validation rules and compliance checks are designed to promote open source and remix-friendly asset management.