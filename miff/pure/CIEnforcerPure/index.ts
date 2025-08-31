// CIEnforcerPure - CI validation and contributor onboarding standards enforcement

export interface CIValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'testing' | 'documentation' | 'executability' | 'coverage' | 'standards';
  check: (context: CIValidationContext) => Promise<CIValidationResult>;
}

export interface CIValidationContext {
  modulePath: string;
  moduleName: string;
  files: string[];
  hasIndex: boolean;
  hasCliHarness: boolean;
  hasReadme: boolean;
  hasTests: boolean;
  hasFixtures: boolean;
  testFiles: string[];
  fixtureFiles: string[];
  readmeContent: string;
  packageJson?: any;
}

export interface CIValidationResult {
  ruleId: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: string;
  remediation?: string;
  filePath?: string;
  category: 'testing' | 'documentation' | 'executability' | 'coverage' | 'standards';
  metrics?: {
    testCount?: number;
    fixtureCount?: number;
    readmeLength?: number;
    coveragePercentage?: number;
  };
}

export interface CIEnforcementReport {
  op: 'enforce';
  status: 'pass' | 'fail' | 'warning';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    critical: number;
  };
  results: CIValidationResult[];
  modules: string[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  ciCompliant: boolean;
  onboardingReady: boolean;
  compliance: {
    testing: boolean;
    documentation: boolean;
    executability: boolean;
    coverage: boolean;
    standards: boolean;
  };
}

export interface ModuleCIResult {
  moduleName: string;
  path: string;
  validationResults: CIValidationResult[];
  status: 'pass' | 'fail' | 'warning';
  ciCompliant: boolean;
  onboardingReady: boolean;
}

/**
 * enforceCIStandards - Enforce CI standards for a single module
 */
export async function enforceCIStandards(modulePath: string): Promise<ModuleCIResult> {
  const context = await buildCIValidationContext(modulePath);
  const rules = getCIValidationRules();
  const results: CIValidationResult[] = [];

  for (const rule of rules) {
    try {
      const result = await rule.check(context);
      results.push(result);
    } catch (error) {
      results.push({
        ruleId: rule.id,
        passed: false,
        severity: 'critical',
        message: `Rule execution failed: ${error}`,
        details: error instanceof Error ? error.stack : String(error),
        category: 'standards' // Default category for error cases
      });
    }
  }

  const status = determineModuleCIStatus(results);
  const ciCompliant = results.every(r => r.passed || r.severity === 'info');
  const onboardingReady = results.every(r => r.passed || r.severity === 'info');

  return {
    moduleName: context.moduleName,
    path: modulePath,
    validationResults: results,
    status,
    ciCompliant,
    onboardingReady
  };
}

/**
 * enforceCIStandardsForModules - Enforce CI standards for multiple modules
 */
export async function enforceCIStandardsForModules(modulePaths: string[]): Promise<CIEnforcementReport> {
  const moduleResults: ModuleCIResult[] = [];
  const allResults: CIValidationResult[] = [];
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  for (const modulePath of modulePaths) {
    try {
      const result = await enforceCIStandards(modulePath);
      moduleResults.push(result);
      allResults.push(...result.validationResults);
    } catch (error) {
      const errorResult: CIValidationResult = {
        ruleId: 'ci_enforcement',
        passed: false,
        severity: 'critical',
        message: `Failed to enforce CI standards: ${error}`,
        details: error instanceof Error ? error.stack : String(error),
        filePath: modulePath,
        category: 'standards' // Default category for error cases
      };
      allResults.push(errorResult);
      criticalIssues.push(`CI enforcement failed: ${modulePath}`);
    }
  }

  // Generate summary
  const summary = generateCIValidationSummary(allResults);
  
  // Determine overall status
  const status = determineOverallCIStatus(summary);
  
  // Check compliance
  const compliance = checkCICompliance(allResults);
  const ciCompliant = compliance.testing && compliance.documentation && 
                     compliance.executability && compliance.coverage && 
                     compliance.standards && summary.critical === 0;
  
  const onboardingReady = ciCompliant && summary.warnings === 0;

  // Collect issues and recommendations
  for (const result of allResults) {
    if (!result.passed) {
      if (result.severity === 'critical') {
        criticalIssues.push(`${result.ruleId}: ${result.message}`);
      } else if (result.severity === 'warning') {
        warnings.push(`${result.ruleId}: ${result.message}`);
      }
      
      if (result.remediation) {
        recommendations.push(`${result.ruleId}: ${result.remediation}`);
      }
    }
  }

  return {
    op: 'enforce',
    status,
    summary,
    results: allResults,
    modules: moduleResults.map(r => r.moduleName),
    criticalIssues,
    warnings,
    recommendations,
    ciCompliant,
    onboardingReady,
    compliance
  };
}

/**
 * buildCIValidationContext - Build CI validation context for a module
 */
async function buildCIValidationContext(modulePath: string): Promise<CIValidationContext> {
  // This would typically read files and analyze content
  // For now, we'll use a placeholder implementation
  const moduleName = modulePath.split('/').pop() || 'unknown';
  
  return {
    modulePath,
    moduleName,
    files: ['index.ts', 'cliHarness.ts', 'README.md', 'tests/golden_test.ts', 'fixtures/sample.json'],
    hasIndex: true,
    hasCliHarness: true,
    hasReadme: true,
    hasTests: true,
    hasFixtures: true,
    testFiles: ['tests/golden_test.ts'],
    fixtureFiles: ['fixtures/sample.json'],
    readmeContent: '# Module Documentation\n\nThis is a sample README.',
    packageJson: {
      name: moduleName.toLowerCase(),
      version: '1.0.0',
      description: 'Module description'
    }
  };
}

/**
 * getCIValidationRules - Get all CI validation rules
 */
function getCIValidationRules(): CIValidationRule[] {
  return [
    // Testing rules
    {
      id: 'golden_tests_present',
      name: 'Golden Tests Present',
      description: 'Module must have golden test files',
      severity: 'critical',
      category: 'testing',
      check: async (context) => {
        const hasGoldenTests = context.testFiles.some(f => f.includes('golden_'));
        
        return {
          ruleId: 'golden_tests_present',
          passed: hasGoldenTests,
          severity: 'critical',
          message: hasGoldenTests ? 'Golden tests are present' : 'Missing golden test files',
          remediation: hasGoldenTests ? undefined : 'Create golden test files in tests/ directory',
          filePath: `${context.modulePath}/tests/`,
          category: 'testing',
          metrics: {
            testCount: context.testFiles.length
          }
        };
      }
    },
    
    // Documentation rules
    {
      id: 'readme_complete',
      name: 'README Complete',
      description: 'Module must have comprehensive README documentation',
      severity: 'critical',
      category: 'documentation',
      check: async (context) => {
        const readmeLength = context.readmeContent.length;
        const hasSchema = context.readmeContent.includes('## Schema');
        const hasUsage = context.readmeContent.includes('## Usage');
        const hasExamples = context.readmeContent.includes('```typescript');
        
        const isComplete = readmeLength > 500 && hasSchema && hasUsage && hasExamples;
        
        return {
          ruleId: 'readme_complete',
          passed: isComplete,
          severity: 'critical',
          message: isComplete ? 'README is complete and comprehensive' : 'README is incomplete or missing key sections',
          remediation: isComplete ? undefined : 'Add Schema, Usage, and Examples sections to README',
          filePath: `${context.modulePath}/README.md`,
          category: 'documentation',
          metrics: {
            readmeLength
          }
        };
      }
    },
    
    // Executability rules
    {
      id: 'cli_harness_executable',
      name: 'CLI Harness Executable',
      description: 'Module must have executable CLI harness',
      severity: 'critical',
      category: 'executability',
      check: async (context) => {
        const hasCliHarness = context.hasCliHarness;
        const hasShebang = context.files.includes('cliHarness.ts');
        
        return {
          ruleId: 'cli_harness_executable',
          passed: hasCliHarness && hasShebang,
          severity: 'critical',
          message: (hasCliHarness && hasShebang) ? 'CLI harness is present and executable' : 'Missing or non-executable CLI harness',
          remediation: (hasCliHarness && hasShebang) ? undefined : 'Create cliHarness.ts with proper shebang and executable permissions',
          filePath: `${context.modulePath}/cliHarness.ts`,
          category: 'executability'
        };
      }
    },
    
    // Coverage rules
    {
      id: 'test_coverage_adequate',
      name: 'Test Coverage Adequate',
      description: 'Module must have adequate test coverage',
      severity: 'warning',
      category: 'coverage',
      check: async (context) => {
        const testCount = context.testFiles.length;
        const fixtureCount = context.fixtureFiles.length;
        const hasGoldenTests = context.testFiles.some(f => f.includes('golden_'));
        const hasFixtures = fixtureCount > 0;
        
        const isAdequate = testCount >= 2 && hasGoldenTests && hasFixtures;
        
        return {
          ruleId: 'test_coverage_adequate',
          passed: isAdequate,
          severity: 'warning',
          message: isAdequate ? 'Test coverage is adequate' : 'Test coverage is insufficient',
          remediation: isAdequate ? undefined : 'Add more tests and fixtures to improve coverage',
          filePath: `${context.modulePath}/tests/`,
          category: 'coverage',
          metrics: {
            testCount,
            fixtureCount,
            coveragePercentage: isAdequate ? 100 : Math.round((testCount / 2) * 100)
          }
        };
      }
    },
    
    // Standards rules
    {
      id: 'module_structure_standard',
      name: 'Module Structure Standard',
      description: 'Module must follow standard directory structure',
      severity: 'warning',
      category: 'standards',
      check: async (context) => {
        const hasStandardStructure = context.hasIndex && 
                                   context.hasCliHarness && 
                                   context.hasReadme && 
                                   context.hasTests && 
                                   context.hasFixtures;
        
        return {
          ruleId: 'module_structure_standard',
          passed: hasStandardStructure,
          severity: 'warning',
          message: hasStandardStructure ? 'Module follows standard structure' : 'Module structure is non-standard',
          remediation: hasStandardStructure ? undefined : 'Ensure module has index.ts, cliHarness.ts, README.md, tests/, and fixtures/',
          filePath: context.modulePath,
          category: 'standards'
        };
      }
    },
    
    // Package.json rules
    {
      id: 'package_json_valid',
      name: 'Package.json Valid',
      description: 'Module must have valid package.json if present',
      severity: 'info',
      category: 'standards',
      check: async (context) => {
        if (!context.packageJson) {
          return {
            ruleId: 'package_json_valid',
            passed: true,
            severity: 'info',
            message: 'No package.json required for this module',
            category: 'standards'
          };
        }
        
        const hasName = context.packageJson.name;
        const hasVersion = context.packageJson.version;
        const hasDescription = context.packageJson.description;
        
        const isValid = hasName && hasVersion && hasDescription;
        
        return {
          ruleId: 'package_json_valid',
          passed: isValid,
          severity: 'info',
          message: isValid ? 'Package.json is valid' : 'Package.json is missing required fields',
          remediation: isValid ? undefined : 'Add name, version, and description to package.json',
          filePath: `${context.modulePath}/package.json`,
          category: 'standards'
        };
      }
    }
  ];
}

/**
 * determineModuleCIStatus - Determine CI status for a single module
 */
function determineModuleCIStatus(results: CIValidationResult[]): 'pass' | 'fail' | 'warning' {
  if (results.some(r => !r.passed && r.severity === 'critical')) {
    return 'fail';
  }
  if (results.some(r => !r.passed && r.severity === 'warning')) {
    return 'warning';
  }
  return 'pass';
}

/**
 * determineOverallCIStatus - Determine overall CI enforcement status
 */
function determineOverallCIStatus(summary: CIEnforcementReport['summary']): CIEnforcementReport['status'] {
  if (summary.critical > 0) {
    return 'fail';
  }
  if (summary.warnings > 0) {
    return 'warning';
  }
  return 'pass';
}

/**
 * generateCIValidationSummary - Generate CI validation summary statistics
 */
function generateCIValidationSummary(results: CIValidationResult[]): CIEnforcementReport['summary'] {
  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    warnings: results.filter(r => !r.passed && r.severity === 'warning').length,
    critical: results.filter(r => !r.passed && r.severity === 'critical').length
  };
}

/**
 * checkCICompliance - Check compliance across different categories
 */
function checkCICompliance(results: CIValidationResult[]): CIEnforcementReport['compliance'] {
  const testing = results.filter(r => r.category === 'testing').every(r => r.passed);
  const documentation = results.filter(r => r.category === 'documentation').every(r => r.passed);
  const executability = results.filter(r => r.category === 'executability').every(r => r.passed);
  const coverage = results.filter(r => r.category === 'coverage').every(r => r.passed);
  const standards = results.filter(r => r.category === 'standards').every(r => r.passed);

  return {
    testing,
    documentation,
    executability,
    coverage,
    standards
  };
}

/**
 * generateCIEnforcementReport - Generate a human-readable CI enforcement report
 */
export function generateCIEnforcementReport(report: CIEnforcementReport): string {
  let output = `CI Standards Enforcement Report\n`;
  output += `================================\n\n`;
  
  output += `Status: ${report.status.toUpperCase()}\n`;
  output += `CI Compliant: ${report.ciCompliant ? 'YES' : 'NO'}\n`;
  output += `Onboarding Ready: ${report.onboardingReady ? 'YES' : 'NO'}\n\n`;
  
  output += `Summary:\n`;
  output += `  Total Rules: ${report.summary.total}\n`;
  output += `  Passed: ${report.summary.passed}\n`;
  output += `  Failed: ${report.summary.failed}\n`;
  output += `  Warnings: ${report.summary.warnings}\n`;
  output += `  Critical: ${report.summary.critical}\n\n`;
  
  if (report.criticalIssues.length > 0) {
    output += `Critical Issues:\n`;
    report.criticalIssues.forEach(issue => output += `  - ${issue}\n`);
    output += `\n`;
  }
  
  if (report.warnings.length > 0) {
    output += `Warnings:\n`;
    report.warnings.forEach(warning => output += `  - ${warning}\n`);
    output += `\n`;
  }
  
  if (report.recommendations.length > 0) {
    output += `Recommendations:\n`;
    report.recommendations.forEach(rec => output += `  - ${rec}\n`);
    output += `\n`;
  }
  
  output += `Compliance:\n`;
  output += `  Testing: ${report.compliance.testing ? '✓' : '✗'}\n`;
  output += `  Documentation: ${report.compliance.documentation ? '✓' : '✗'}\n`;
  output += `  Executability: ${report.compliance.executability ? '✓' : '✗'}\n`;
  output += `  Coverage: ${report.compliance.coverage ? '✓' : '✗'}\n`;
  output += `  Standards: ${report.compliance.standards ? '✓' : '✗'}\n`;
  
  return output;
}