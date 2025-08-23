// RemixAuditPure - Remix-safe compliance auditing system

export interface RemixAuditRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'licensing' | 'attribution' | 'dependencies' | 'documentation' | 'assets';
  check: (context: AuditContext) => Promise<AuditResult>;
}

export interface AuditContext {
  modulePath: string;
  moduleName: string;
  files: string[];
  content: Record<string, string>;
  dependencies: string[];
  metadata: {
    license?: string;
    author?: string;
    description?: string;
    version?: string;
  };
}

export interface AuditResult {
  ruleId: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: string;
  remediation?: string;
  lineNumbers?: number[];
  filePath?: string;
  category: 'licensing' | 'attribution' | 'dependencies' | 'documentation' | 'assets';
}

export interface RemixAuditReport {
  op: 'audit';
  status: 'pass' | 'fail' | 'warning';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    critical: number;
  };
  results: AuditResult[];
  modules: string[];
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  remixSafe: boolean;
  compliance: {
    licensing: boolean;
    attribution: boolean;
    dependencies: boolean;
    documentation: boolean;
    assets: boolean;
  };
}

export interface ModuleScanResult {
  moduleName: string;
  path: string;
  auditResults: AuditResult[];
  status: 'pass' | 'fail' | 'warning';
  remixSafe: boolean;
}

/**
 * auditModule - Audit a single module for remix-safe compliance
 */
export async function auditModule(modulePath: string): Promise<ModuleScanResult> {
  const context = await buildAuditContext(modulePath);
  const rules = getRemixAuditRules();
  const results: AuditResult[] = [];

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
        category: 'documentation' // Default category for error cases
      });
    }
  }

  const status = determineModuleStatus(results);
  const remixSafe = results.every(r => r.passed || r.severity === 'info');

  return {
    moduleName: context.moduleName,
    path: modulePath,
    auditResults: results,
    status,
    remixSafe
  };
}

/**
 * auditModules - Audit multiple modules for remix-safe compliance
 */
export async function auditModules(modulePaths: string[]): Promise<RemixAuditReport> {
  const moduleResults: ModuleScanResult[] = [];
  const allResults: AuditResult[] = [];
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  for (const modulePath of modulePaths) {
    try {
      const result = await auditModule(modulePath);
      moduleResults.push(result);
      allResults.push(...result.auditResults);
    } catch (error) {
      const errorResult: AuditResult = {
        ruleId: 'module_scan',
        passed: false,
        severity: 'critical',
        message: `Failed to audit module: ${error}`,
        details: error instanceof Error ? error.stack : String(error),
        filePath: modulePath,
        category: 'documentation' // Default category for error cases
      };
      allResults.push(errorResult);
      criticalIssues.push(`Module scan failed: ${modulePath}`);
    }
  }

  // Generate summary
  const summary = generateAuditSummary(allResults);
  
  // Determine overall status
  const status = determineOverallStatus(summary);
  
  // Check compliance
  const compliance = checkCompliance(allResults);
  const remixSafe = compliance.licensing && compliance.attribution && 
                   compliance.dependencies && compliance.documentation && 
                   compliance.assets && summary.critical === 0;

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
    op: 'audit',
    status,
    summary,
    results: allResults,
    modules: moduleResults.map(r => r.moduleName),
    criticalIssues,
    warnings,
    recommendations,
    remixSafe,
    compliance
  };
}

/**
 * buildAuditContext - Build audit context for a module
 */
async function buildAuditContext(modulePath: string): Promise<AuditContext> {
  // This would typically read files and analyze content
  // For now, we'll use a placeholder implementation
  const moduleName = modulePath.split('/').pop() || 'unknown';
  
  return {
    modulePath,
    moduleName,
    files: ['index.ts', 'cliHarness.ts', 'README.md'],
    content: {
      'index.ts': '// Module content would be read here',
      'cliHarness.ts': '#!/usr/bin/env ts-node',
      'README.md': '# Module Documentation'
    },
    dependencies: ['fs', 'path'],
    metadata: {
      license: 'MIT',
      author: 'Contributor',
      description: 'Module description',
      version: '1.0.0'
    }
  };
}

/**
 * getRemixAuditRules - Get all remix audit rules
 */
function getRemixAuditRules(): RemixAuditRule[] {
  return [
    // Licensing rules
    {
      id: 'license_present',
      name: 'License Present',
      description: 'Module must have a valid license specified',
      severity: 'critical',
      category: 'licensing',
      check: async (context) => {
        const hasLicense = context.metadata.license && 
                          ['MIT', 'Apache-2.0', 'CC0', 'CC-BY', 'CC-BY-SA'].includes(context.metadata.license);
        
        return {
          ruleId: 'license_present',
          passed: hasLicense,
          severity: 'critical',
          message: hasLicense ? 'License is present and valid' : 'Missing or invalid license',
          remediation: hasLicense ? undefined : 'Add a valid open source license to module metadata',
          filePath: `${context.modulePath}/README.md`,
          category: 'licensing'
        };
      }
    },
    
    // Attribution rules
    {
      id: 'attribution_present',
      name: 'Attribution Present',
      description: 'Module must have proper attribution information',
      severity: 'warning',
      category: 'attribution',
      check: async (context) => {
        const hasAuthor = context.metadata.author && context.metadata.author !== 'Contributor';
        
        return {
          ruleId: 'attribution_present',
          passed: hasAuthor,
          severity: 'warning',
          message: hasAuthor ? 'Author attribution is present' : 'Missing or generic author attribution',
          remediation: hasAuthor ? undefined : 'Add proper author attribution in module metadata',
          filePath: `${context.modulePath}/README.md`,
          category: 'attribution'
        };
      }
    },
    
    // Documentation rules
    {
      id: 'readme_present',
      name: 'README Present',
      description: 'Module must have a README.md file',
      severity: 'critical',
      category: 'documentation',
      check: async (context) => {
        const hasReadme = context.files.includes('README.md');
        
        return {
          ruleId: 'readme_present',
          passed: hasReadme,
          severity: 'critical',
          message: hasReadme ? 'README.md is present' : 'Missing README.md file',
          remediation: hasReadme ? undefined : 'Create a README.md file with module documentation',
          filePath: `${context.modulePath}/README.md`,
          category: 'documentation'
        };
      }
    },
    
    // CLI harness rules
    {
      id: 'cli_harness_present',
      name: 'CLI Harness Present',
      description: 'Module must have an executable CLI harness',
      severity: 'critical',
      category: 'documentation',
      check: async (context) => {
        const hasCliHarness = context.files.includes('cliHarness.ts');
        
        return {
          ruleId: 'cli_harness_present',
          passed: hasCliHarness,
          severity: 'critical',
          message: hasCliHarness ? 'CLI harness is present' : 'Missing CLI harness file',
          remediation: hasCliHarness ? undefined : 'Create a cliHarness.ts file for CLI execution',
          filePath: `${context.modulePath}/cliHarness.ts`,
          category: 'documentation'
        };
      }
    },
    
    // Dependencies rules
    {
      id: 'safe_dependencies',
      name: 'Safe Dependencies',
      description: 'Module must not have unsafe external dependencies',
      severity: 'warning',
      category: 'dependencies',
      check: async (context) => {
        const unsafeDeps = ['eval', 'Function', 'exec', 'spawn'];
        const hasUnsafeDep = context.dependencies.some(dep => unsafeDeps.includes(dep));
        
        return {
          ruleId: 'safe_dependencies',
          passed: !hasUnsafeDep,
          severity: 'warning',
          message: !hasUnsafeDep ? 'All dependencies are safe' : 'Unsafe dependencies detected',
          remediation: !hasUnsafeDep ? undefined : 'Remove or replace unsafe dependencies',
          filePath: `${context.modulePath}/index.ts`,
          category: 'dependencies'
        };
      }
    },
    
    // Asset rules
    {
      id: 'no_hardcoded_assets',
      name: 'No Hardcoded Assets',
      description: 'Module must not contain hardcoded asset paths',
      severity: 'warning',
      category: 'assets',
      check: async (context) => {
        const hardcodedPatterns = [
          /assets\/[^"]*\.(png|jpg|jpeg|gif|wav|mp3|ogg|ttf|otf)/g,
          /\.\/assets\//g,
          /\/assets\//g
        ];
        
        let hasHardcodedAssets = false;
        for (const [filePath, content] of Object.entries(context.content)) {
          for (const pattern of hardcodedPatterns) {
            if (pattern.test(content)) {
              hasHardcodedAssets = true;
              break;
            }
          }
        }
        
        return {
          ruleId: 'no_hardcoded_assets',
          passed: !hasHardcodedAssets,
          severity: 'warning',
          message: !hasHardcodedAssets ? 'No hardcoded assets detected' : 'Hardcoded asset paths found',
          remediation: !hasHardcodedAssets ? undefined : 'Use asset manifest or configuration files instead of hardcoded paths',
          filePath: `${context.modulePath}/index.ts`,
          category: 'assets'
        };
      }
    }
  ];
}

/**
 * determineModuleStatus - Determine status for a single module
 */
function determineModuleStatus(results: AuditResult[]): 'pass' | 'fail' | 'warning' {
  if (results.some(r => !r.passed && r.severity === 'critical')) {
    return 'fail';
  }
  if (results.some(r => !r.passed && r.severity === 'warning')) {
    return 'warning';
  }
  return 'pass';
}

/**
 * determineOverallStatus - Determine overall audit status
 */
function determineOverallStatus(summary: RemixAuditReport['summary']): RemixAuditReport['status'] {
  if (summary.critical > 0) {
    return 'fail';
  }
  if (summary.warnings > 0) {
    return 'warning';
  }
  return 'pass';
}

/**
 * generateAuditSummary - Generate audit summary statistics
 */
function generateAuditSummary(results: AuditResult[]): RemixAuditReport['summary'] {
  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    warnings: results.filter(r => !r.passed && r.severity === 'warning').length,
    critical: results.filter(r => !r.passed && r.severity === 'critical').length
  };
}

/**
 * checkCompliance - Check compliance across different categories
 */
function checkCompliance(results: AuditResult[]): RemixAuditReport['compliance'] {
  const licensing = results.filter(r => r.category === 'licensing').every(r => r.passed);
  const attribution = results.filter(r => r.category === 'attribution').every(r => r.passed);
  const dependencies = results.filter(r => r.category === 'dependencies').every(r => r.passed);
  const documentation = results.filter(r => r.category === 'documentation').every(r => r.passed);
  const assets = results.filter(r => r.category === 'assets').every(r => r.passed);

  return {
    licensing,
    attribution,
    dependencies,
    documentation,
    assets
  };
}

/**
 * generateAuditReport - Generate a human-readable audit report
 */
export function generateAuditReport(report: RemixAuditReport): string {
  let output = `Remix Safety Audit Report\n`;
  output += `=========================\n\n`;
  
  output += `Status: ${report.status.toUpperCase()}\n`;
  output += `Remix-Safe: ${report.remixSafe ? 'YES' : 'NO'}\n\n`;
  
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
  output += `  Licensing: ${report.compliance.licensing ? '✓' : '✗'}\n`;
  output += `  Attribution: ${report.compliance.attribution ? '✓' : '✗'}\n`;
  output += `  Dependencies: ${report.compliance.dependencies ? '✓' : '✗'}\n`;
  output += `  Documentation: ${report.compliance.documentation ? '✓' : '✗'}\n`;
  output += `  Assets: ${report.compliance.assets ? '✓' : '✗'}\n`;
  
  return output;
}