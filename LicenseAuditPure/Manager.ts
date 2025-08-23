export type LicenseType = 
  | 'AGPLv3' 
  | 'GPLv3' 
  | 'LGPLv3' 
  | 'MIT' 
  | 'Apache-2.0' 
  | 'CC-BY-SA-4.0' 
  | 'CC-BY-4.0' 
  | 'CC0' 
  | 'Proprietary' 
  | 'Custom';

export type LicenseCompatibility = 'compatible' | 'incompatible' | 'requires-review' | 'unknown';

export type LicenseInfo = {
  type: LicenseType;
  version: string;
  url?: string;
  spdxId?: string;
  description: string;
  requirements: string[];
  restrictions: string[];
  remixSafe: boolean;
  commercialUse: 'allowed' | 'restricted' | 'prohibited';
  attributionRequired: boolean;
  sourceCodeRequired: boolean;
  derivativeWorks: 'allowed' | 'restricted' | 'prohibited';
};

export type ModuleLicense = {
  moduleId: string;
  moduleName: string;
  license: LicenseInfo;
  dependencies: string[];
  licenseFiles: string[];
  lastAudited: string;
  issues: LicenseIssue[];
  warnings: string[];
  remixSafetyScore: number; // 0-100
};

export type LicenseIssue = {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  affectedFiles?: string[];
};

export type AuditConfig = {
  strictMode?: boolean;
  checkDependencies?: boolean;
  validateSpdx?: boolean;
  requireLicenseFiles?: boolean;
  maxRemixScore?: number;
  allowedLicenses?: LicenseType[];
  blockedLicenses?: LicenseType[];
};

export type AuditResult = {
  op: 'auditLicense';
  status: 'pass' | 'warning' | 'fail';
  moduleId: string;
  moduleName: string;
  license: LicenseInfo;
  remixSafetyScore: number;
  issues: LicenseIssue[];
  warnings: string[];
  recommendations: string[];
  metadata: {
    auditedAt: string;
    config: AuditConfig;
    dependencies: string[];
    licenseFiles: string[];
  };
};

export type LicenseAuditOverride = {
  validateLicense?(license: LicenseInfo): boolean;
  getCustomLicense?(moduleId: string): LicenseInfo | null;
  checkCompatibility?(license1: LicenseType, license2: LicenseType): LicenseCompatibility;
};

export class LicenseAuditManager {
  private override: LicenseAuditOverride | null = null;
  private auditedModules: Map<string, ModuleLicense> = new Map();
  private config: AuditConfig;
  private licenseRegistry: Map<LicenseType, LicenseInfo>;

  constructor(config: AuditConfig = {}) {
    this.config = {
      strictMode: true,
      checkDependencies: true,
      validateSpdx: true,
      requireLicenseFiles: true,
      maxRemixScore: 80,
      allowedLicenses: [],
      blockedLicenses: ['Proprietary'],
      ...config
    };

    this.licenseRegistry = this.initializeLicenseRegistry();
  }

  setOverride(ovr: LicenseAuditOverride) {
    this.override = ovr;
  }

  setConfig(config: Partial<AuditConfig>) {
    this.config = { ...this.config, ...config };
  }

  private initializeLicenseRegistry(): Map<LicenseType, LicenseInfo> {
    const registry = new Map<LicenseType, LicenseInfo>();

    // AGPLv3 - Strong copyleft, requires source distribution
    registry.set('AGPLv3', {
      type: 'AGPLv3',
      version: '3.0',
      url: 'https://www.gnu.org/licenses/agpl-3.0.en.html',
      spdxId: 'AGPL-3.0',
      description: 'GNU Affero General Public License v3.0',
      requirements: [
        'Source code must be open',
        'Network use triggers source distribution',
        'Derivative works must be AGPLv3'
      ],
      restrictions: [
        'Cannot be closed-source',
        'Network use requires source availability'
      ],
      remixSafe: true,
      commercialUse: 'restricted',
      attributionRequired: true,
      sourceCodeRequired: true,
      derivativeWorks: 'allowed'
    });

    // MIT - Permissive, very remix-friendly
    registry.set('MIT', {
      type: 'MIT',
      version: '1.0',
      url: 'https://opensource.org/licenses/MIT',
      spdxId: 'MIT',
      description: 'MIT License',
      requirements: [
        'License and copyright notice must be preserved'
      ],
      restrictions: [],
      remixSafe: true,
      commercialUse: 'allowed',
      attributionRequired: true,
      sourceCodeRequired: false,
      derivativeWorks: 'allowed'
    });

    // CC-BY-SA-4.0 - Share-alike, remix-friendly with attribution
    registry.set('CC-BY-SA-4.0', {
      type: 'CC-BY-SA-4.0',
      version: '4.0',
      url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      spdxId: 'CC-BY-SA-4.0',
      description: 'Creative Commons Attribution-ShareAlike 4.0 International',
      requirements: [
        'Attribution required',
        'Derivative works must be CC-BY-SA-4.0'
      ],
      restrictions: [
        'Cannot use more restrictive license'
      ],
      remixSafe: true,
      commercialUse: 'allowed',
      attributionRequired: true,
      sourceCodeRequired: false,
      derivativeWorks: 'allowed'
    });

    // GPLv3 - Strong copyleft
    registry.set('GPLv3', {
      type: 'GPLv3',
      version: '3.0',
      url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
      spdxId: 'GPL-3.0',
      description: 'GNU General Public License v3.0',
      requirements: [
        'Source code must be open',
        'Derivative works must be GPLv3'
      ],
      restrictions: [
        'Cannot be closed-source'
      ],
      remixSafe: true,
      commercialUse: 'restricted',
      attributionRequired: true,
      sourceCodeRequired: true,
      derivativeWorks: 'allowed'
    });

    // Proprietary - Not remix-safe
    registry.set('Proprietary', {
      type: 'Proprietary',
      version: '1.0',
      description: 'Proprietary License',
      requirements: [
        'Commercial license required'
      ],
      restrictions: [
        'No redistribution allowed',
        'No derivative works allowed'
      ],
      remixSafe: false,
      commercialUse: 'prohibited',
      attributionRequired: false,
      sourceCodeRequired: false,
      derivativeWorks: 'prohibited'
    });

    return registry;
  }

  private calculateRemixSafetyScore(license: LicenseInfo, issues: LicenseIssue[]): number {
    let score = 100;

    // Base score adjustments
    if (!license.remixSafe) score -= 50;
    if (license.commercialUse === 'prohibited') score -= 20;
    if (license.derivativeWorks === 'prohibited') score -= 30;
    if (license.sourceCodeRequired) score -= 10;

    // Issue-based deductions
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 20;
          break;
        case 'warning':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });

    // Bonus for permissive licenses
    if (license.type === 'MIT' || license.type === 'CC0') score += 10;
    if (license.type === 'CC-BY-4.0') score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private validateLicense(license: LicenseInfo): LicenseIssue[] {
    const issues: LicenseIssue[] = [];

    // Check if license is blocked
    if (this.config.blockedLicenses?.includes(license.type)) {
      issues.push({
        code: 'blocked_license',
        severity: 'error',
        message: `License type '${license.type}' is blocked by configuration`,
        suggestion: 'Use an allowed license type'
      });
    }

    // Check if license is allowed (when restrictions are set)
    if (this.config.allowedLicenses && this.config.allowedLicenses.length > 0) {
      if (!this.config.allowedLicenses.includes(license.type)) {
        issues.push({
          code: 'license_not_allowed',
          severity: 'warning',
          message: `License type '${license.type}' is not in allowed list`,
          suggestion: 'Consider using an allowed license type'
        });
      }
    }

    // Validate SPDX ID if required
    if (this.config.validateSpdx && !license.spdxId) {
      issues.push({
        code: 'missing_spdx',
        severity: 'warning',
        message: 'SPDX identifier is missing',
        suggestion: 'Add SPDX identifier for better license recognition'
      });
    }

    // Check remix safety
    if (!license.remixSafe && this.config.strictMode) {
      issues.push({
        code: 'not_remix_safe',
        severity: 'warning',
        message: 'License is not marked as remix-safe',
        suggestion: 'Consider using a more permissive license for remix safety'
      });
    }

    return issues;
  }

  auditModule(
    moduleId: string,
    moduleName: string,
    licenseType: LicenseType,
    dependencies: string[] = [],
    licenseFiles: string[] = []
  ): AuditResult {
    const issues: LicenseIssue[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for custom license override
    const customLicense = this.override?.getCustomLicense?.(moduleId);
    const license = customLicense || this.licenseRegistry.get(licenseType);

    if (!license) {
      issues.push({
        code: 'unknown_license',
        severity: 'error',
        message: `Unknown license type: ${licenseType}`,
        suggestion: 'Use a recognized license type from the registry'
      });
      
      // Create a minimal license info for the audit
      const minimalLicense: LicenseInfo = {
        type: licenseType,
        version: 'unknown',
        description: 'Unknown license type',
        requirements: [],
        restrictions: [],
        remixSafe: false,
        commercialUse: 'prohibited',
        attributionRequired: false,
        sourceCodeRequired: false,
        derivativeWorks: 'prohibited'
      };
      
      return this.createAuditResult(moduleId, moduleName, minimalLicense, dependencies, licenseFiles, issues, warnings, recommendations);
    }

    // Validate license
    const licenseIssues = this.validateLicense(license);
    issues.push(...licenseIssues);

    // Check license files requirement
    if (this.config.requireLicenseFiles && licenseFiles.length === 0) {
      issues.push({
        code: 'missing_license_files',
        severity: 'warning',
        message: 'No license files found',
        suggestion: 'Include LICENSE, COPYING, or similar files'
      });
    }

    // Check dependencies if enabled
    if (this.config.checkDependencies && dependencies.length > 0) {
      const dependencyIssues = this.auditDependencies(dependencies);
      issues.push(...dependencyIssues);
    }

    // Generate recommendations
    if (license.commercialUse === 'prohibited') {
      recommendations.push('Consider using a license that allows commercial use for broader adoption');
    }
    
    if (!license.remixSafe) {
      recommendations.push('Consider using a remix-safe license to encourage community contributions');
    }

    if (license.derivativeWorks === 'prohibited') {
      recommendations.push('Allowing derivative works can increase module adoption and community engagement');
    }

    return this.createAuditResult(moduleId, moduleName, license, dependencies, licenseFiles, issues, warnings, recommendations);
  }

  private auditDependencies(dependencies: string[]): LicenseIssue[] {
    const issues: LicenseIssue[] = [];
    
    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies(dependencies);
    if (circularDeps.length > 0) {
      issues.push({
        code: 'circular_dependencies',
        severity: 'warning',
        message: `Circular dependencies detected: ${circularDeps.join(' -> ')}`,
        suggestion: 'Review and resolve circular dependency chain'
      });
    }

    // Check for unknown dependencies
    const unknownDeps = dependencies.filter(depId => !this.auditedModules.has(depId));
    if (unknownDeps.length > 0) {
      issues.push({
        code: 'unknown_dependencies',
        severity: 'info',
        message: `Unknown dependencies: ${unknownDeps.join(', ')}`,
        suggestion: 'Audit dependencies to ensure license compatibility'
      });
    }

    return issues;
  }

  private detectCircularDependencies(dependencies: string[]): string[] {
    // Simple circular dependency detection
    // In a real implementation, this would build a dependency graph
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (depId: string): string[] => {
      if (recursionStack.has(depId)) {
        return [depId]; // Found cycle
      }
      
      if (visited.has(depId)) {
        return []; // Already processed
      }
      
      visited.add(depId);
      recursionStack.add(depId);
      
      const module = this.auditedModules.get(depId);
      if (module) {
        for (const dep of module.dependencies) {
          const cycle = hasCycle(dep);
          if (cycle.length > 0) {
            recursionStack.delete(depId);
            return [depId, ...cycle];
          }
        }
      }
      
      recursionStack.delete(depId);
      return [];
    };
    
    for (const dep of dependencies) {
      const cycle = hasCycle(dep);
      if (cycle.length > 0) {
        return cycle;
      }
    }
    
    return [];
  }

  private createAuditResult(
    moduleId: string,
    moduleName: string,
    license: LicenseInfo,
    dependencies: string[],
    licenseFiles: string[],
    issues: LicenseIssue[],
    warnings: string[],
    recommendations: string[]
  ): AuditResult {
    const remixSafetyScore = this.calculateRemixSafetyScore(license, issues);
    
    // Determine overall status
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    if (issues.some(i => i.severity === 'error')) {
      status = 'fail';
    } else if (issues.some(i => i.severity === 'warning') || remixSafetyScore < this.config.maxRemixScore!) {
      status = 'warning';
    }

    // Store audit result
    const moduleLicense: ModuleLicense = {
      moduleId,
      moduleName,
      license,
      dependencies,
      licenseFiles,
      lastAudited: new Date().toISOString(),
      issues,
      warnings,
      remixSafetyScore
    };
    
    this.auditedModules.set(moduleId, moduleLicense);

    return {
      op: 'auditLicense',
      status,
      moduleId,
      moduleName,
      license,
      remixSafetyScore,
      issues,
      warnings,
      recommendations,
      metadata: {
        auditedAt: new Date().toISOString(),
        config: this.config,
        dependencies,
        licenseFiles
      }
    };
  }

  getModuleLicense(moduleId: string): ModuleLicense | null {
    return this.auditedModules.get(moduleId) || null;
  }

  getAllLicenses(): ModuleLicense[] {
    return Array.from(this.auditedModules.values());
  }

  getLicensesByType(licenseType: LicenseType): ModuleLicense[] {
    return this.getAllLicenses().filter(ml => ml.license.type === licenseType);
  }

  getRemixSafeModules(): ModuleLicense[] {
    return this.getAllLicenses().filter(ml => ml.license.remixSafe);
  }

  getAuditStats(): {
    total: number;
    byStatus: Record<'pass' | 'warning' | 'fail', number>;
    byLicenseType: Record<LicenseType, number>;
    averageRemixScore: number;
    lastAudited: string | null;
  } {
    const byStatus: Record<'pass' | 'warning' | 'fail', number> = {
      pass: 0,
      warning: 0,
      fail: 0
    };

    const byLicenseType: Record<LicenseType, number> = {
      AGPLv3: 0,
      GPLv3: 0,
      LGPLv3: 0,
      MIT: 0,
      'Apache-2.0': 0,
      'CC-BY-SA-4.0': 0,
      'CC-BY-4.0': 0,
      CC0: 0,
      Proprietary: 0,
      Custom: 0
    };
    
    let totalScore = 0;
    let lastAudited: string | null = null;

    this.auditedModules.forEach(module => {
      // Count by status
      const status = module.issues.some(i => i.severity === 'error') ? 'fail' :
                    module.issues.some(i => i.severity === 'warning') || module.remixSafetyScore < this.config.maxRemixScore! ? 'warning' : 'pass';
      byStatus[status]++;

      // Count by license type
      const licenseType = module.license.type;
      byLicenseType[licenseType] = (byLicenseType[licenseType] || 0) + 1;

      // Accumulate scores
      totalScore += module.remixSafetyScore;

      // Track last audit
      if (!lastAudited || module.lastAudited > lastAudited) {
        lastAudited = module.lastAudited;
      }
    });

    return {
      total: this.auditedModules.size,
      byStatus,
      byLicenseType,
      averageRemixScore: this.auditedModules.size > 0 ? Math.round(totalScore / this.auditedModules.size) : 0,
      lastAudited
    };
  }

  removeAudit(moduleId: string): boolean {
    return this.auditedModules.delete(moduleId);
  }
}