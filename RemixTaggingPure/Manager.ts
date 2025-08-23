export type RemixLevel = 'remix-required' | 'remix-optional' | 'remix-safe';

export type ModuleTag = {
  moduleId: string;
  moduleName: string;
  remixLevel: RemixLevel;
  reason: string;
  requirements: string[];
  dependencies: string[];
  lastUpdated: string;
  version: string;
};

export type TaggingConfig = {
  strictMode?: boolean;
  autoTag?: boolean;
  requireReason?: boolean;
  validateDependencies?: boolean;
};

export type TaggingResult = {
  op: 'tagModule';
  status: 'ok' | 'warning' | 'error';
  moduleId: string;
  remixLevel: RemixLevel;
  issues: { code: string; message: string }[];
  warnings: string[];
  metadata: {
    taggedAt: string;
    config: TaggingConfig;
    dependencies: string[];
  };
};

export type RemixTaggingOverride = {
  validateTag?(tag: ModuleTag): boolean;
  getCustomLevel?(moduleId: string): RemixLevel | null;
  getDependencies?(moduleId: string): string[];
};

export class RemixTaggingManager {
  private override: RemixTaggingOverride | null = null;
  private taggedModules: Map<string, ModuleTag> = new Map();
  private config: TaggingConfig;

  constructor(config: TaggingConfig = {}) {
    this.config = {
      strictMode: true,
      autoTag: false,
      requireReason: true,
      validateDependencies: true,
      ...config
    };
  }

  setOverride(ovr: RemixTaggingOverride) {
    this.override = ovr;
  }

  setConfig(config: Partial<TaggingConfig>) {
    this.config = { ...this.config, ...config };
  }

  private determineRemixLevel(moduleId: string, dependencies: string[]): RemixLevel {
    // Check for custom override first
    if (this.override?.getCustomLevel) {
      const customLevel = this.override.getCustomLevel(moduleId);
      if (customLevel) return customLevel;
    }

    // Auto-determination logic
    if (dependencies.length === 0) {
      return 'remix-safe'; // No dependencies, safe to remix
    }

    // Check if any dependencies are remix-required
    const hasRequiredDeps = dependencies.some(depId => {
      const depTag = this.taggedModules.get(depId);
      return depTag?.remixLevel === 'remix-required';
    });

    if (hasRequiredDeps) {
      return 'remix-required'; // Inherits required status
    }

    // Check if module has complex dependencies
    if (dependencies.length > 5) {
      return 'remix-optional'; // Complex dependency tree
    }

    return 'remix-safe'; // Default to safe
  }

  private getDefaultDependencies(moduleId: string): string[] {
    // Placeholder logic - in real implementation, this would analyze module imports
    const commonDeps: Record<string, string[]> = {
      'BridgeSchemaPure': ['SharedSchemaPure'],
      'CombatPure': ['CombatCorePure', 'StatsSystemPure'],
      'QuestsPure': ['NPCsPure', 'DialogPure'],
      'default': []
    };

    return commonDeps[moduleId] || commonDeps.default;
  }

  private generateReason(remixLevel: RemixLevel, dependencies: string[]): string {
    switch (remixLevel) {
      case 'remix-required':
        return dependencies.length > 0 
          ? `Required due to dependencies on: ${dependencies.join(', ')}`
          : 'Required for compliance with license terms';
      
      case 'remix-optional':
        return dependencies.length > 3 
          ? `Optional due to complex dependency tree (${dependencies.length} deps)`
          : 'Optional for enhanced functionality';
      
      case 'remix-safe':
        return dependencies.length === 0 
          ? 'Safe to remix - no external dependencies'
          : 'Safe to remix - all dependencies are remix-safe';
      
      default:
        return 'Level determined automatically';
    }
  }

  tagModule(
    moduleId: string, 
    moduleName: string, 
    customLevel?: RemixLevel,
    customReason?: string
  ): TaggingResult {
    const issues: { code: string; message: string }[] = [];
    const warnings: string[] = [];

    // Validate module ID
    if (!moduleId || typeof moduleId !== 'string') {
      issues.push({ code: 'invalid_module_id', message: 'Module ID must be a non-empty string' });
    }

    // Get dependencies
    const dependencies = this.override?.getDependencies?.(moduleId) || this.getDefaultDependencies(moduleId);

    // Determine remix level
    const remixLevel = customLevel || this.determineRemixLevel(moduleId, dependencies);

    // Generate reason if not provided
    const reason = customReason || this.generateReason(remixLevel, dependencies);

    // Validate reason if required
    if (this.config.requireReason && !reason) {
      issues.push({ code: 'missing_reason', message: 'Reason is required for module tagging' });
    }

    // Validate dependencies if enabled
    if (this.config.validateDependencies) {
      const invalidDeps = dependencies.filter(depId => !this.taggedModules.has(depId));
      if (invalidDeps.length > 0) {
        warnings.push(`Unknown dependencies: ${invalidDeps.join(', ')}`);
      }
    }

    // Create module tag
    const moduleTag: ModuleTag = {
      moduleId,
      moduleName,
      remixLevel,
      reason,
      requirements: this.getRequirements(remixLevel),
      dependencies,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };

    // Validate tag if override exists
    if (this.override?.validateTag && !this.override.validateTag(moduleTag)) {
      issues.push({ code: 'validation_failed', message: 'Custom validation failed' });
    }

    // Store tag if no critical issues
    if (issues.length === 0 || issues.every(i => i.code !== 'invalid_module_id')) {
      this.taggedModules.set(moduleId, moduleTag);
    }

    const status = issues.length === 0 ? 'ok' : issues.some(i => i.code === 'invalid_module_id') ? 'error' : 'warning';

    return {
      op: 'tagModule',
      status,
      moduleId,
      remixLevel,
      issues,
      warnings,
      metadata: {
        taggedAt: new Date().toISOString(),
        config: this.config,
        dependencies
      }
    };
  }

  private getRequirements(remixLevel: RemixLevel): string[] {
    switch (remixLevel) {
      case 'remix-required':
        return [
          'Must maintain attribution',
          'Cannot be closed-source',
          'Must preserve license headers',
          'Dependencies must be tracked'
        ];
      
      case 'remix-optional':
        return [
          'Attribution recommended',
          'License preservation advised',
          'Dependency tracking suggested'
        ];
      
      case 'remix-safe':
        return [
          'No special requirements',
          'Safe for commercial use',
          'Safe for closed-source projects'
        ];
      
      default:
        return [];
    }
  }

  getModuleTag(moduleId: string): ModuleTag | null {
    return this.taggedModules.get(moduleId) || null;
  }

  getAllTags(): ModuleTag[] {
    return Array.from(this.taggedModules.values());
  }

  getTagsByLevel(level: RemixLevel): ModuleTag[] {
    return this.getAllTags().filter(tag => tag.remixLevel === level);
  }

  removeTag(moduleId: string): boolean {
    return this.taggedModules.delete(moduleId);
  }

  getTaggingStats(): {
    total: number;
    byLevel: Record<RemixLevel, number>;
    lastUpdated: string | null;
  } {
    const byLevel: Record<RemixLevel, number> = {
      'remix-required': 0,
      'remix-optional': 0,
      'remix-safe': 0
    };

    this.taggedModules.forEach(tag => {
      byLevel[tag.remixLevel]++;
    });

    const lastUpdated = this.taggedModules.size > 0 
      ? Math.max(...Array.from(this.taggedModules.values()).map(t => new Date(t.lastUpdated).getTime()))
      : null;

    return {
      total: this.taggedModules.size,
      byLevel,
      lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null
    };
  }
}