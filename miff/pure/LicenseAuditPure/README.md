# LicenseAuditPure

Validates module licenses and flags remix safety with comprehensive license registry and dependency analysis. CLI-first, engine-agnostic, remix-safe.

## 🎯 Purpose

LicenseAuditPure provides automated license validation and remix safety scoring for MIFF modules:

- **License Validation**: Comprehensive license type recognition and validation
- **Remix Safety Scoring**: 0-100 scoring system for remix compatibility
- **Dependency Analysis**: Circular dependency detection and license compatibility
- **Compliance Monitoring**: Automated requirement and restriction checking

## 📋 Schema (v1.0)

### Core Types
- `LicenseType`: Supported license types (AGPLv3, MIT, CC-BY-SA-4.0, etc.)
- `LicenseInfo`: Complete license information and requirements
- `ModuleLicense`: Module-specific license audit results
- `LicenseIssue`: Validation issues with severity and suggestions
- `AuditConfig`: Configuration options for audit behavior
- `AuditResult`: Complete audit operation results

### LicenseInfo Structure
```typescript
{
  type: LicenseType;                    // License type identifier
  version: string;                      // License version
  url?: string;                         // License URL
  spdxId?: string;                      // SPDX identifier
  description: string;                  // Human-readable description
  requirements: string[];               // What must be done
  restrictions: string[];               // What is prohibited
  remixSafe: boolean;                   // Safe for remixing
  commercialUse: 'allowed'|'restricted'|'prohibited';
  attributionRequired: boolean;         // Attribution needed
  sourceCodeRequired: boolean;          // Source code must be open
  derivativeWorks: 'allowed'|'restricted'|'prohibited';
}
```

## 🚀 CLI Usage

```bash
# Audit a module's license
npx ts-node --compiler-options '{"module":"commonjs"}' \
  LicenseAuditPure/cliHarness.ts \
  LicenseAuditPure/sample_config.json \
  LicenseAuditPure/sample_commands.json

# Get audit statistics
npx ts-node --compiler-options '{"module":"commonjs"}' \
  LicenseAuditPure/cliHarness.ts \
  LicenseAuditPure/sample_config.json \
  '{"op":"getAuditStats"}'
```

### Available Operations
- `auditModule`: Audit a module's license and dependencies
- `getLicense`: Retrieve license information for a module
- `listLicenses`: List all audited licenses or filter by type
- `getRemixSafe`: Get all remix-safe modules
- `getAuditStats`: Get comprehensive audit statistics
- `removeAudit`: Remove a module's audit record

## ⚙️ Configuration

### AuditConfig Options
- `strictMode`: Enforce strict validation (default: true)
- `checkDependencies`: Analyze module dependencies (default: true)
- `validateSpdx`: Require SPDX identifiers (default: true)
- `requireLicenseFiles`: Require license files (default: true)
- `maxRemixScore`: Minimum score for 'pass' status (default: 80)
- `allowedLicenses`: Whitelist of allowed license types
- `blockedLicenses`: Blacklist of prohibited license types

### Example Config
```json
{
  "strictMode": true,
  "checkDependencies": true,
  "validateSpdx": true,
  "requireLicenseFiles": true,
  "maxRemixScore": 80,
  "allowedLicenses": ["AGPLv3", "GPLv3", "MIT", "CC-BY-SA-4.0"],
  "blockedLicenses": ["Proprietary"]
}
```

## 🏆 Remix Safety Scoring

### Score Calculation (0-100)
- **Base Score**: 100 points
- **License Penalties**:
  - Not remix-safe: -50 points
  - Commercial use prohibited: -20 points
  - Derivative works prohibited: -30 points
  - Source code required: -10 points
- **Issue Penalties**:
  - Error: -20 points
  - Warning: -10 points
  - Info: -5 points
- **Bonus Points**:
  - MIT/CC0: +10 points
  - CC-BY-4.0: +5 points

### Score Interpretation
- **90-100**: Excellent remix safety
- **70-89**: Good remix safety
- **50-69**: Moderate remix safety
- **30-49**: Limited remix safety
- **0-29**: Poor remix safety

## 📊 Example Output

```json
{
  "outputs": [
    {
      "op": "auditLicense",
      "status": "pass",
      "moduleId": "CombatPure",
      "moduleName": "Combat System",
      "license": {
        "type": "AGPLv3",
        "version": "3.0",
        "remixSafe": true,
        "commercialUse": "restricted"
      },
      "remixSafetyScore": 85,
      "issues": [],
      "warnings": [],
      "recommendations": [
        "Consider using a license that allows commercial use for broader adoption"
      ]
    }
  ]
}
```

## 🔌 Remix Hooks

### LicenseAuditOverride Interface
```typescript
export type LicenseAuditOverride = {
  validateLicense?(license: LicenseInfo): boolean;
  getCustomLicense?(moduleId: string): LicenseInfo | null;
  checkCompatibility?(license1: LicenseType, license2: LicenseType): LicenseCompatibility;
};
```

### Override Implementation
Create an `override.ts` file:
```typescript
import { LicenseAuditOverride, LicenseInfo } from './Manager';

export function getOverride(): LicenseAuditOverride {
  return {
    validateLicense: (license) => {
      // Custom validation logic
      return license.remixSafe || license.type === 'Custom';
    },
    getCustomLicense: (moduleId) => {
      // Custom license for specific modules
      if (moduleId === 'SpecialModule') {
        return {
          type: 'Custom',
          version: '1.0',
          description: 'Custom license for special module',
          requirements: ['Custom requirement'],
          restrictions: [],
          remixSafe: true,
          commercialUse: 'allowed',
          attributionRequired: true,
          sourceCodeRequired: false,
          derivativeWorks: 'allowed'
        };
      }
      return null;
    }
  };
}
```

## 📚 License Registry

### Supported Licenses
- **AGPLv3**: Strong copyleft, network use triggers source distribution
- **GPLv3**: Strong copyleft, derivative works must be GPLv3
- **MIT**: Permissive, very remix-friendly
- **CC-BY-SA-4.0**: Share-alike, remix-friendly with attribution
- **CC-BY-4.0**: Attribution required, very permissive
- **CC0**: Public domain dedication
- **Apache-2.0**: Permissive with patent protection
- **Proprietary**: Not remix-safe, commercial license required

### License Compatibility
The manager includes built-in license compatibility checking and can detect:
- **Circular Dependencies**: Prevents dependency loops
- **License Conflicts**: Identifies incompatible license combinations
- **Missing Requirements**: Flags missing license files or SPDX IDs

## 📈 Use Cases

### For Module Developers
- **License Selection**: Choose appropriate licenses for remix safety
- **Compliance Checking**: Ensure license requirements are met
- **Dependency Management**: Understand how dependencies affect licensing

### For Remix Creators
- **Safety Assessment**: Know which modules are safe to remix
- **Requirement Understanding**: Clear compliance requirements
- **Risk Mitigation**: Avoid licensing violations

### For Project Maintainers
- **Quality Control**: Ensure modules meet licensing standards
- **Compliance Monitoring**: Track license compliance across the project
- **Automated Auditing**: CI/CD integration for license validation

## 🧪 Testing

### Golden Fixtures
Test files are available in the `tests/` directory:
- `golden.test.ts`: Main test suite
- `sample_commands.json`: Test command examples
- `sample_config.json`: Test configuration

### Test Commands
```bash
npm test LicenseAuditPure
npm run test:watch LicenseAuditPure
```

## 📚 Related Modules

- **MiffAttributionPure**: License metadata and contributor information
- **RemixTaggingPure**: Module remix safety level tagging
- **BridgeSchemaPure**: Core schema definitions

## 🔒 License Notes

- LicenseAuditPure is licensed under AGPLv3 + Commercial
- Attribution is required under AGPLv3
- Contact: miff@yourdomain.dev for commercial licensing

## 🚀 Future Enhancements

- **Automated License Detection**: File scanning for license identification
- **Compatibility Matrix**: Detailed license compatibility database
- **Compliance Reports**: Automated compliance requirement generation
- **Integration APIs**: Bridge integration for engine-specific tools
- **Visual Analytics**: License compliance dashboard and reporting