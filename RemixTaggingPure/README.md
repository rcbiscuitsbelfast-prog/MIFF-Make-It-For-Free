# RemixTaggingPure

Tags MIFF modules as 'remix-required', 'remix-optional', or 'remix-safe' based on dependencies and licensing requirements. CLI-first, engine-agnostic, remix-safe.

## 🎯 Purpose

RemixTaggingPure provides a systematic way to categorize modules based on their remix safety level:

- **remix-required**: Must be remixed for compliance (e.g., AGPLv3 modules)
- **remix-optional**: Recommended for enhanced functionality
- **remix-safe**: Safe to remix without restrictions

## 📋 Schema (v1.0)

### Core Types
- `RemixLevel`: Union type for the three remix safety levels
- `ModuleTag`: Complete tagging information for a module
- `TaggingConfig`: Configuration options for the tagging manager
- `TaggingResult`: Result of tagging operations

### ModuleTag Structure
```typescript
{
  moduleId: string;           // Unique module identifier
  moduleName: string;         // Human-readable module name
  remixLevel: RemixLevel;     // Safety level
  reason: string;             // Explanation for the level
  requirements: string[];     // What must be done for compliance
  dependencies: string[];     // Module dependencies
  lastUpdated: string;        // ISO timestamp
  version: string;            // Tag version
}
```

## 🚀 CLI Usage

```bash
# Tag a module with custom level
npx ts-node --compiler-options '{"module":"commonjs"}' \
  RemixTaggingPure/cliHarness.ts \
  RemixTaggingPure/sample_config.json \
  RemixTaggingPure/sample_commands.json

# Get tagging statistics
npx ts-node --compiler-options '{"module":"commonjs"}' \
  RemixTaggingPure/cliHarness.ts \
  RemixTaggingPure/sample_config.json \
  '{"op":"getStats"}'
```

### Available Operations
- `tagModule`: Tag a module with remix safety level
- `getTag`: Retrieve tagging information for a module
- `listTags`: List all tags or filter by level
- `getStats`: Get tagging statistics
- `removeTag`: Remove a module tag

## ⚙️ Configuration

### TaggingConfig Options
- `strictMode`: Enforce strict validation (default: true)
- `autoTag`: Automatically determine levels (default: false)
- `requireReason`: Require reason for tagging (default: true)
- `validateDependencies`: Validate dependency information (default: true)

### Example Config
```json
{
  "strictMode": true,
  "autoTag": false,
  "requireReason": true,
  "validateDependencies": true
}
```

## 🔧 Auto-Determination Logic

The manager automatically determines remix levels based on:

1. **Dependencies**: Inherits 'remix-required' from dependencies
2. **Complexity**: Modules with >5 dependencies become 'remix-optional'
3. **Isolation**: Modules with no dependencies are 'remix-safe'
4. **Custom Overrides**: Allows manual level specification

## 📊 Example Output

```json
{
  "outputs": [
    {
      "op": "tagModule",
      "status": "ok",
      "moduleId": "CombatPure",
      "remixLevel": "remix-required",
      "issues": [],
      "warnings": [],
      "metadata": {
        "taggedAt": "2025-01-27T10:00:00.000Z",
        "config": { "strictMode": true },
        "dependencies": ["CombatCorePure", "StatsSystemPure"]
      }
    }
  ]
}
```

## 🔌 Remix Hooks

### AttributionOverride Interface
```typescript
export type RemixTaggingOverride = {
  validateTag?(tag: ModuleTag): boolean;
  getCustomLevel?(moduleId: string): RemixLevel | null;
  getDependencies?(moduleId: string): string[];
};
```

### Override Implementation
Create an `override.ts` file:
```typescript
import { RemixTaggingOverride } from './Manager';

export function getOverride(): RemixTaggingOverride {
  return {
    validateTag: (tag) => {
      // Custom validation logic
      return tag.remixLevel !== 'remix-required' || tag.reason.length > 10;
    },
    getCustomLevel: (moduleId) => {
      // Custom level determination
      if (moduleId === 'SpecialModule') return 'remix-safe';
      return null;
    }
  };
}
```

## 📈 Use Cases

### For Module Developers
- **Clear Guidelines**: Understand remix requirements upfront
- **Dependency Tracking**: See how dependencies affect remix safety
- **Compliance**: Ensure proper attribution and licensing

### For Remix Creators
- **Safety Assessment**: Know which modules are safe to remix
- **Requirement Understanding**: Clear compliance requirements
- **Risk Mitigation**: Avoid licensing violations

### For Project Maintainers
- **Quality Control**: Ensure modules meet remix safety standards
- **Documentation**: Automated requirement generation
- **Compliance Monitoring**: Track remix safety across the project

## 🧪 Testing

### Golden Fixtures
Test files are available in the `tests/` directory:
- `golden.test.ts`: Main test suite
- `sample_commands.json`: Test command examples
- `sample_config.json`: Test configuration

### Test Commands
```bash
npm test RemixTaggingPure
npm run test:watch RemixTaggingPure
```

## 📚 Related Modules

- **MiffAttributionPure**: License metadata and contributor information
- **LicenseAuditPure**: License validation and remix safety scoring
- **BridgeSchemaPure**: Core schema definitions

## 🔒 License Notes

- RemixTaggingPure is licensed under AGPLv3 + Commercial
- Attribution is required under AGPLv3
- Contact: miff@yourdomain.dev for commercial licensing

## 🚀 Future Enhancements

- **Dependency Graph Analysis**: Visual representation of remix dependencies
- **Automated Scanning**: CI/CD integration for automatic tagging
- **Compliance Reports**: Detailed compliance requirement generation
- **Integration APIs**: Bridge integration for engine-specific tools