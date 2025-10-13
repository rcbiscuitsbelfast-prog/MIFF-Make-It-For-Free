/**
 * Centralized Migration System for MIFF Framework
 * 
 * Provides comprehensive data migration, version compatibility checking,
 * and migration path management across all MIFF modules.
 */

export interface MigrationStep {
  id: string;
  fromVersion: string;
  toVersion: string;
  description: string;
  migrationFn: (data: any) => any;
  rollbackFn?: (data: any) => any;
  validationFn?: (data: any) => boolean;
  dependencies?: string[];
  critical: boolean;
}

export interface MigrationPath {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  estimatedDuration: number; // milliseconds
  rollbackSupported: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedData: any;
  stepsExecuted: string[];
  errors: string[];
  warnings: string[];
  duration: number;
  rollbackData?: any;
}

export interface VersionCompatibility {
  compatible: boolean;
  migrationPath?: MigrationPath;
  conflicts: string[];
  recommendations: string[];
}

export interface MigrationStats {
  totalMigrations: number;
  successfulMigrations: number;
  failedMigrations: number;
  averageDuration: number;
  mostUsedMigrations: Array<{ stepId: string; usage: number }>;
  errorRate: number;
}

export class MigrationManager {
  private migrations: Map<string, MigrationStep> = new Map();
  private migrationPaths: Map<string, MigrationPath> = new Map();
  private stats: MigrationStats;
  private migrationHistory: Array<{ id: string; timestamp: Date; success: boolean; duration: number }> = [];

  constructor() {
    this.stats = this.initializeStats();
    this.initializeDefaultMigrations();
  }

  /**
   * Register a migration step
   */
  registerMigration(step: MigrationStep): void {
    this.migrations.set(step.id, step);
    this.updateMigrationPaths();
  }

  /**
   * Migrate data from one version to another
   */
  async migrate(data: any, fromVersion: string, toVersion: string): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      migratedData: data,
      stepsExecuted: [],
      errors: [],
      warnings: [],
      duration: 0
    };

    try {
      // Check if migration is needed
      if (fromVersion === toVersion) {
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Find migration path
      const pathKey = `${fromVersion}->${toVersion}`;
      const migrationPath = this.migrationPaths.get(pathKey);

      if (!migrationPath) {
        result.errors.push(`No migration path found from ${fromVersion} to ${toVersion}`);
        result.duration = Date.now() - startTime;
        return result;
      }

      // Execute migration steps
      let currentData = { ...data };
      const rollbackData = { ...data };

      for (const step of migrationPath.steps) {
        try {
          // Validate before migration
          if (step.validationFn && !step.validationFn(currentData)) {
            result.warnings.push(`Validation failed for step ${step.id}, proceeding anyway`);
          }

          // Execute migration
          currentData = step.migrationFn(currentData);
          result.stepsExecuted.push(step.id);

          // Update stats
          this.updateMigrationUsage(step.id, Date.now() - startTime);

        } catch (error) {
          result.errors.push(`Migration step ${step.id} failed: ${error instanceof Error ? error.message : String(error)}`);
          
          if (step.critical) {
            result.duration = Date.now() - startTime;
            return result;
          }
        }
      }

      result.success = result.errors.length === 0;
      result.migratedData = currentData;
      result.rollbackData = rollbackData;
      result.duration = Date.now() - startTime;

      // Record migration history
      this.migrationHistory.push({
        id: `migration_${Date.now()}`,
        timestamp: new Date(),
        success: result.success,
        duration: result.duration
      });

      this.updateStats();

    } catch (error) {
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Check version compatibility
   */
  checkCompatibility(fromVersion: string, toVersion: string): VersionCompatibility {
    const pathKey = `${fromVersion}->${toVersion}`;
    const migrationPath = this.migrationPaths.get(pathKey);

    if (!migrationPath) {
      return {
        compatible: false,
        conflicts: [`No migration path from ${fromVersion} to ${toVersion}`],
        recommendations: [
          'Check if versions are supported',
          'Consider using intermediate migration steps',
          'Contact system administrator'
        ]
      };
    }

    // Check for critical steps
    const criticalSteps = migrationPath.steps.filter(step => step.critical);
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    if (criticalSteps.length > 0) {
      conflicts.push(`${criticalSteps.length} critical migration steps required`);
      recommendations.push('Ensure all critical steps can be executed safely');
    }

    if (!migrationPath.rollbackSupported) {
      conflicts.push('Migration does not support rollback');
      recommendations.push('Create backup before migration');
    }

    return {
      compatible: true,
      migrationPath,
      conflicts,
      recommendations
    };
  }

  /**
   * Get available migration paths
   */
  getMigrationPaths(): MigrationPath[] {
    return Array.from(this.migrationPaths.values());
  }

  /**
   * Get migration statistics
   */
  getStats(): MigrationStats {
    return { ...this.stats };
  }

  /**
   * Get migration history
   */
  getMigrationHistory(limit: number = 100): Array<{ id: string; timestamp: Date; success: boolean; duration: number }> {
    return this.migrationHistory.slice(-limit);
  }

  /**
   * Rollback a migration
   */
  async rollback(data: any, migrationId: string): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      migratedData: data,
      stepsExecuted: [],
      errors: [],
      warnings: [],
      duration: 0
    };

    try {
      // Find the migration in history
      const migration = this.migrationHistory.find(m => m.id === migrationId);
      if (!migration) {
        result.errors.push(`Migration ${migrationId} not found in history`);
        result.duration = Date.now() - startTime;
        return result;
      }

      // TODO: Implement in next phase
      result.warnings.push('Rollback functionality not fully implemented');
      result.success = false;
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.errors.push(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  private initializeDefaultMigrations(): void {
    // Schema version migrations
    this.registerMigration({
      id: 'schema_v1_to_v2',
      fromVersion: 'v1',
      toVersion: 'v2',
      description: 'Add version field to schema data',
      migrationFn: (data: any) => {
        if (!data.version) {
          data.version = 'v2';
        }
        return data;
      },
      rollbackFn: (data: any) => {
        delete data.version;
        return data;
      },
      validationFn: (data: any) => typeof data === 'object',
      critical: false
    });

    this.registerMigration({
      id: 'schema_v2_to_v3',
      fromVersion: 'v2',
      toVersion: 'v3',
      description: 'Update schema structure for v3 compatibility',
      migrationFn: (data: any) => {
        data.version = 'v3';
        if (data.schema) {
          data.schemaVersion = data.schema.version || '1.0';
        }
        return data;
      },
      rollbackFn: (data: any) => {
        data.version = 'v2';
        if (data.schemaVersion) {
          delete data.schemaVersion;
        }
        return data;
      },
      validationFn: (data: any) => data.version === 'v2',
      critical: false
    });

    // SharedSchema v12 migrations
    this.registerMigration({
      id: 'shared_v12_to_latest',
      fromVersion: 'v12',
      toVersion: 'latest',
      description: 'Migrate from SharedSchema v12 to latest',
      migrationFn: (data: any) => {
        // Update version references
        if (data.version === 'v12') {
          data.version = 'latest';
        }
        
        // Update type references
        if (data.types) {
          data.types = data.types.map((type: any) => {
            if (type === 'EntityID') return 'string';
            if (type === 'StatBlock') return 'array';
            return type;
          });
        }
        
        return data;
      },
      rollbackFn: (data: any) => {
        if (data.version === 'latest') {
          data.version = 'v12';
        }
        return data;
      },
      validationFn: (data: any) => data.version === 'v12',
      critical: true
    });

    // BridgeSchema migrations
    this.registerMigration({
      id: 'bridge_schema_consolidation',
      fromVersion: 'bridge_v1',
      toVersion: 'consolidated_v1',
      description: 'Migrate from BridgeSchemaPure to ConsolidatedSchema',
      migrationFn: (data: any) => {
        // Update import references
        if (data.imports) {
          data.imports = data.imports.map((imp: string) => {
            if (imp.includes('BridgeSchemaPure/schema')) {
              return imp.replace('BridgeSchemaPure/schema', 'shared/ConsolidatedSchema');
            }
            if (imp.includes('SharedSchemaPure/Manager')) {
              return imp.replace('SharedSchemaPure/Manager', 'shared/ConsolidatedSchema');
            }
            return imp;
          });
        }
        
        // Update schema references
        if (data.schemaRefs) {
          data.schemaRefs = data.schemaRefs.map((ref: string) => {
            if (ref === 'BridgeSchemaValidator') return 'ConsolidatedSchemaManager';
            return ref;
          });
        }
        
        return data;
      },
      validationFn: (data: any) => data.imports && Array.isArray(data.imports),
      critical: true
    });

    // RenderData migrations
    this.registerMigration({
      id: 'render_data_v1_to_v2',
      fromVersion: 'render_v1',
      toVersion: 'render_v2',
      description: 'Update RenderData structure for v2 compatibility',
      migrationFn: (data: any) => {
        if (data.renderData) {
          data.renderData = data.renderData.map((item: any) => {
            // Add required fields if missing
            if (!item.id) {
              item.id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            if (!item.type) {
              item.type = 'sprite';
            }
            return item;
          });
        }
        return data;
      },
      validationFn: (data: any) => data.renderData && Array.isArray(data.renderData),
      critical: false
    });
  }

  private updateMigrationPaths(): void {
    this.migrationPaths.clear();

    // Build migration paths from registered steps
    const stepMap = new Map<string, MigrationStep[]>();
    
    for (const step of this.migrations.values()) {
      const key = `${step.fromVersion}->${step.toVersion}`;
      if (!stepMap.has(key)) {
        stepMap.set(key, []);
      }
      stepMap.get(key)?.push(step);
    }

    // Create migration paths
    for (const [key, steps] of stepMap) {
      const [fromVersion, toVersion] = key.split('->');
      
      this.migrationPaths.set(key, {
        fromVersion,
        toVersion,
        steps: steps.sort((a, b) => a.id.localeCompare(b.id)),
        estimatedDuration: steps.reduce((sum, step) => sum + 100, 0), // Estimate 100ms per step
        rollbackSupported: steps.every(step => step.rollbackFn !== undefined)
      });
    }
  }

  private updateMigrationUsage(stepId: string, duration: number): void {
    // This would update usage statistics
    // Implementation depends on how you want to track usage
  }

  private updateStats(): void {
    const total = this.migrationHistory.length;
    const successful = this.migrationHistory.filter(m => m.success).length;
    const failed = total - successful;
    const avgDuration = total > 0 ? this.migrationHistory.reduce((sum, m) => sum + m.duration, 0) / total : 0;

    this.stats = {
      totalMigrations: total,
      successfulMigrations: successful,
      failedMigrations: failed,
      averageDuration: avgDuration,
      mostUsedMigrations: this.calculateMostUsedMigrations(),
      errorRate: total > 0 ? (failed / total) * 100 : 0
    };
  }

  private initializeStats(): MigrationStats {
    return {
      totalMigrations: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      averageDuration: 0,
      mostUsedMigrations: [],
      errorRate: 0
    };
  }

  private calculateMostUsedMigrations(): Array<{ stepId: string; usage: number }> {
    const usageCount = new Map<string, number>();
    
    // Count usage from migration history
    this.migrationHistory.forEach(entry => {
      if (entry.success) {
        usageCount.set(entry.id, (usageCount.get(entry.id) || 0) + 1);
      }
    });
    
    // Convert to array and sort by usage
    return Array.from(usageCount.entries())
      .map(([stepId, usage]) => ({ stepId, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10); // Top 10 most used
  }
}

export default MigrationManager;