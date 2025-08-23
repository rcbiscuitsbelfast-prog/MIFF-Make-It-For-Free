# CIEnforcerPure

A deterministic CI validation and contributor onboarding standards enforcement system that ensures all modules meet contributor onboarding standards.

## Overview

CIEnforcerPure validates golden test coverage, CLI harness presence, README completeness, and other CI standards to ensure all modules are ready for contributor onboarding. It provides comprehensive enforcement reports with pass/fail status and actionable remediation notes.

## Core Concepts

### CI Standards
- **Testing**: Golden test presence and coverage
- **Documentation**: README completeness and structure
- **Executability**: CLI harness functionality
- **Coverage**: Test and fixture adequacy
- **Standards**: Module structure compliance

### Validation Rules
- **Critical Rules**: Must pass for CI compliance
- **Warning Rules**: Should be addressed for onboarding readiness
- **Info Rules**: Informational checks for best practices

### Compliance Categories
- **Testing**: Golden test requirements
- **Documentation**: README and documentation standards
- **Executability**: CLI harness functionality
- **Coverage**: Test coverage adequacy
- **Standards**: Module structure standards

## Schema

### CIValidationRule
```typescript
interface CIValidationRule {
  id: string;                    // Unique rule identifier
  name: string;                  // Human-readable rule name
  description: string;           // Rule description
  severity: 'critical' | 'warning' | 'info';  // Rule severity
  category: 'testing' | 'documentation' | 'executability' | 'coverage' | 'standards';
  check: (context: CIValidationContext) => Promise<CIValidationResult>;  // Rule check function
}
```

### CIValidationContext
```typescript
interface CIValidationContext {
  modulePath: string;            // Module file system path
  moduleName: string;            // Module name
  files: string[];               // List of module files
  hasIndex: boolean;             // Has index.ts file
  hasCliHarness: boolean;        // Has CLI harness file
  hasReadme: boolean;            // Has README.md file
  hasTests: boolean;             // Has tests directory
  hasFixtures: boolean;          // Has fixtures directory
  testFiles: string[];           // List of test files
  fixtureFiles: string[];        // List of fixture files
  readmeContent: string;         // README content
  packageJson?: any;             // Package.json content if present
}
```

### CIValidationResult
```typescript
interface CIValidationResult {
  ruleId: string;                // Rule identifier
  passed: boolean;               // Whether rule passed
  severity: 'critical' | 'warning' | 'info';  // Rule severity
  message: string;               // Result message
  details?: string;              // Additional details
  remediation?: string;          // How to fix the issue
  filePath?: string;             // Relevant file path
  metrics?: {                    // Validation metrics
    testCount?: number;          // Number of test files
    fixtureCount?: number;       // Number of fixture files
    readmeLength?: number;       // README content length
    coveragePercentage?: number; // Test coverage percentage
  };
}
```

### CIEnforcementReport
```typescript
interface CIEnforcementReport {
  op: 'enforce';                 // Operation type
  status: 'pass' | 'fail' | 'warning';  // Overall status
  summary: {                     // Validation statistics
    total: number;               // Total rules checked
    passed: number;              // Rules that passed
    failed: number;              // Rules that failed
    warnings: number;            // Warning count
    critical: number;            // Critical issue count
  };
  results: CIValidationResult[]; // Individual rule results
  modules: string[];             // Validated module names
  criticalIssues: string[];      // Critical issue messages
  warnings: string[];            // Warning messages
  recommendations: string[];     // Remediation recommendations
  ciCompliant: boolean;          // Overall CI compliance status
  onboardingReady: boolean;      // Contributor onboarding readiness
  compliance: {                  // Compliance breakdown
    testing: boolean;            // Testing compliance
    documentation: boolean;      // Documentation compliance
    executability: boolean;      // Executability compliance
    coverage: boolean;           // Coverage compliance
    standards: boolean;          // Standards compliance
  };
}
```

## Usage

### Basic CI Standards Enforcement

```typescript
import { enforceCIStandards, enforceCIStandardsForModules } from './index';

// Enforce CI standards for a single module
const result = await enforceCIStandards('systems/QuestSystemPure');

// Enforce CI standards for multiple modules
const report = await enforceCIStandardsForModules([
  'systems/QuestSystemPure',
  'systems/AssetValidatorPure'
]);
```

### Custom CI Validation Rules

```typescript
import { CIValidationRule } from './index';

const customRule: CIValidationRule = {
  id: 'custom_ci_check',
  name: 'Custom CI Check',
  description: 'Custom CI validation check',
  severity: 'warning',
  category: 'testing',
  check: async (context) => {
    // Custom CI check logic
    const passed = true; // Your check here
    
    return {
      ruleId: 'custom_ci_check',
      passed,
      severity: 'warning',
      message: passed ? 'Custom CI check passed' : 'Custom CI check failed',
      category: 'testing'
    };
  }
};
```

### Report Generation

```typescript
import { generateCIEnforcementReport } from './index';

const report = await enforceCIStandardsForModules(modulePaths);
const humanReadable = generateCIEnforcementReport(report);
console.log(humanReadable);
```

## CLI Harness

The CLI harness enforces CI standards from JSON input files:

```bash
npx ts-node cliHarness.ts fixtures/ci_enforcement.json
```

### Input Format
```json
{
  "modulePaths": [
    "systems/QuestSystemPure",
    "systems/AssetValidatorPure"
  ],
  "verbose": true
}
```

### Output Format
```json
{
  "op": "enforce",
  "status": "pass",
  "summary": {
    "total": 6,
    "passed": 6,
    "failed": 0,
    "warnings": 0,
    "critical": 0
  },
  "results": [/* validation results */],
  "modules": ["QuestSystemPure", "AssetValidatorPure"],
  "criticalIssues": [],
  "warnings": [],
  "recommendations": [],
  "ciCompliant": true,
  "onboardingReady": true,
  "compliance": {
    "testing": true,
    "documentation": true,
    "executability": true,
    "coverage": true,
    "standards": true
  }
}
```

## Built-in CI Validation Rules

### Testing Rules
- **Golden Tests Present**: Module must have golden test files
- **Test Coverage**: Adequate test coverage with fixtures
- **Test Structure**: Proper test organization

### Documentation Rules
- **README Complete**: Comprehensive README with schema, usage, examples
- **Documentation Structure**: Proper documentation organization
- **Code Examples**: TypeScript code examples in documentation

### Executability Rules
- **CLI Harness**: Module must have executable CLI harness
- **Shebang**: Proper shebang for CLI execution
- **Permissions**: Executable file permissions

### Coverage Rules
- **Test Count**: Minimum number of test files
- **Fixture Count**: Minimum number of fixture files
- **Golden Tests**: Presence of golden test files
- **Coverage Percentage**: Test coverage metrics

### Standards Rules
- **Module Structure**: Standard directory structure
- **File Organization**: Proper file organization
- **Package.json**: Valid package.json if present
- **Naming Conventions**: Consistent naming patterns

## Contributor Onboarding Features

### CI Compliance
- **Automated Validation**: Automated CI standards checking
- **Compliance Reports**: Detailed compliance breakdowns
- **Remediation Guidance**: Actionable fix recommendations
- **Status Tracking**: Clear pass/fail status indicators

### Onboarding Readiness
- **Standards Enforcement**: Enforces contributor standards
- **Quality Assurance**: Ensures module quality
- **Documentation Completeness**: Validates documentation
- **Test Coverage**: Ensures adequate testing

### Integration Support
- **CI/CD Integration**: Seamless CI/CD pipeline integration
- **Automated Checks**: Automated validation in workflows
- **Status Reporting**: Clear status reporting for contributors
- **Progress Tracking**: Track onboarding progress

## Remix-Safe Features

### Deterministic Validation
- **Rule Consistency**: Same inputs always produce identical results
- **Pure Functions**: No external dependencies or side effects
- **Reproducible Reports**: Consistent validation results across runs

### Comprehensive Coverage
- **Multi-Category**: Covers all aspects of CI standards
- **Rule-Based**: Configurable and extensible rule system
- **Detailed Reporting**: Actionable remediation guidance

### Standards Validation
- **Testing Requirements**: Ensures proper testing standards
- **Documentation Standards**: Validates documentation completeness
- **Executability Standards**: Ensures CLI functionality
- **Coverage Standards**: Validates test coverage adequacy
- **Structure Standards**: Ensures proper module organization

## Testing

Run the golden tests to verify deterministic behavior:

```bash
npm test -- systems/CIEnforcerPure/tests/golden_CIEnforcerPure.test.ts
```

### Test Coverage
- **Enforcement Flow**: Complete CI enforcement pipeline
- **Single Module**: Individual module validation
- **Rule Validation**: Specific rule functionality
- **Compliance Calculation**: Compliance logic verification
- **Metrics Validation**: Metrics calculation verification

## Integration

CIEnforcerPure integrates with other Pure modules:

- **RemixAuditPure**: Remix-safe compliance auditing
- **AssetValidatorPure**: Asset compliance checking
- **AutoBuilderCLI**: Build-time standards validation
- **CI/CD Pipelines**: Automated CI validation

## Extensibility

The system is designed for easy extension:

- **Custom Rules**: Add project-specific CI validation rules
- **Rule Categories**: Extend validation categories
- **Severity Levels**: Customize rule severity
- **Metrics**: Enhanced validation metrics
- **Remediation**: Enhanced fix suggestions

## Performance

- **Efficient Validation**: Minimal file system access
- **Parallel Processing**: Concurrent module validation
- **Caching**: Cache validation results for repeated checks
- **Incremental**: Only re-validate changed modules

## CI/CD Integration

### Pipeline Integration
- **Pre-commit Hooks**: Validate before commits
- **Pull Request Checks**: Validate in PR workflows
- **Build Validation**: Validate during builds
- **Deployment Gates**: Validate before deployment

### Status Reporting
- **Clear Indicators**: Pass/fail/warning status
- **Detailed Reports**: Comprehensive validation reports
- **Actionable Items**: Clear remediation steps
- **Progress Tracking**: Track compliance progress

## Error Handling

### Validation Failures
- **Rule Execution**: Graceful handling of rule failures
- **File Access**: Proper error handling for file operations
- **Dependency Issues**: Safe handling of missing dependencies
- **Validation Errors**: Clear error messages and context

### Report Generation
- **Missing Data**: Graceful handling of incomplete data
- **Format Errors**: Safe JSON generation
- **Output Issues**: Proper error reporting

## License

This module follows the same licensing as the parent project, ensuring remix-safe usage and distribution. All CI validation rules and standards enforcement are designed to promote high-quality, contributor-friendly development practices.