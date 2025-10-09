#!/usr/bin/env tsx

/**
 * Migration CLI Tool
 * 
 * Command-line interface for managing data migrations and version compatibility
 * across the MIFF framework.
 */

import { MigrationManager, MigrationResult, VersionCompatibility } from './MigrationSystem.js';
import * as fs from 'fs';
import * as path from 'path';

class MigrationCLI {
  private migrationManager: MigrationManager;

  constructor() {
    this.migrationManager = new MigrationManager();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'migrate':
          await this.migrateData(args.slice(1));
          break;
        case 'check':
          await this.checkCompatibility(args.slice(1));
          break;
        case 'paths':
          await this.listPaths(args.slice(1));
          break;
        case 'stats':
          await this.showStats(args.slice(1));
          break;
        case 'history':
          await this.showHistory(args.slice(1));
          break;
        case 'rollback':
          await this.rollbackMigration(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async migrateData(args: string[]): Promise<void> {
    if (args.length < 3) {
      console.error('❌ Usage: migrate <input-file> <from-version> <to-version> [output-file]');
      return;
    }

    const inputFile = args[0];
    const fromVersion = args[1];
    const toVersion = args[2];
    const outputFile = args[3] || inputFile.replace('.json', '_migrated.json');

    try {
      // Load input data
      const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
      console.log(`📁 Loaded data from ${inputFile}`);

      // Check compatibility first
      const compatibility = this.migrationManager.checkCompatibility(fromVersion, toVersion);
      if (!compatibility.compatible) {
        console.error('❌ Migration not compatible:');
        compatibility.conflicts.forEach(conflict => console.error(`  - ${conflict}`));
        compatibility.recommendations.forEach(rec => console.error(`  💡 ${rec}`));
        return;
      }

      console.log(`🔄 Migrating from ${fromVersion} to ${toVersion}...`);
      
      // Perform migration
      const result = await this.migrationManager.migrate(inputData, fromVersion, toVersion);

      if (result.success) {
        console.log(`✅ Migration completed successfully in ${result.duration}ms`);
        console.log(`📝 Steps executed: ${result.stepsExecuted.join(', ')}`);
        
        if (result.warnings.length > 0) {
          console.log('⚠️ Warnings:');
          result.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        // Save migrated data
        fs.writeFileSync(outputFile, JSON.stringify(result.migratedData, null, 2));
        console.log(`💾 Migrated data saved to ${outputFile}`);

      } else {
        console.error('❌ Migration failed:');
        result.errors.forEach(error => console.error(`  - ${error}`));
        
        if (result.rollbackData) {
          const rollbackFile = outputFile.replace('.json', '_rollback.json');
          fs.writeFileSync(rollbackFile, JSON.stringify(result.rollbackData, null, 2));
          console.log(`🔄 Rollback data saved to ${rollbackFile}`);
        }
      }

    } catch (error) {
      console.error('❌ Migration error:', error instanceof Error ? error.message : error);
    }
  }

  private async checkCompatibility(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('❌ Usage: check <from-version> <to-version>');
      return;
    }

    const fromVersion = args[0];
    const toVersion = args[1];

    console.log(`🔍 Checking compatibility from ${fromVersion} to ${toVersion}...`);
    
    const compatibility = this.migrationManager.checkCompatibility(fromVersion, toVersion);

    if (compatibility.compatible) {
      console.log('✅ Migration is compatible');
      
      if (compatibility.migrationPath) {
        console.log(`📋 Migration path: ${compatibility.migrationPath.steps.length} steps`);
        console.log(`⏱️ Estimated duration: ${compatibility.migrationPath.estimatedDuration}ms`);
        console.log(`🔄 Rollback supported: ${compatibility.migrationPath.rollbackSupported ? 'Yes' : 'No'}`);
        
        console.log('\n📝 Migration steps:');
        compatibility.migrationPath.steps.forEach((step, index) => {
          console.log(`  ${index + 1}. ${step.id}: ${step.description}`);
          if (step.critical) {
            console.log('     ⚠️ Critical step');
          }
        });
      }

      if (compatibility.conflicts.length > 0) {
        console.log('\n⚠️ Conflicts:');
        compatibility.conflicts.forEach(conflict => console.log(`  - ${conflict}`));
      }

      if (compatibility.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        compatibility.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }

    } else {
      console.log('❌ Migration is not compatible');
      console.log('\n🚫 Conflicts:');
      compatibility.conflicts.forEach(conflict => console.log(`  - ${conflict}`));
      console.log('\n💡 Recommendations:');
      compatibility.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  }

  private async listPaths(args: string[]): Promise<void> {
    const paths = this.migrationManager.getMigrationPaths();
    
    if (paths.length === 0) {
      console.log('📋 No migration paths available');
      return;
    }

    console.log(`📋 Available migration paths (${paths.length}):\n`);
    
    paths.forEach(path => {
      console.log(`🔄 ${path.fromVersion} → ${path.toVersion}`);
      console.log(`   Steps: ${path.steps.length}`);
      console.log(`   Duration: ${path.estimatedDuration}ms`);
      console.log(`   Rollback: ${path.rollbackSupported ? 'Yes' : 'No'}`);
      console.log('');
    });
  }

  private async showStats(args: string[]): Promise<void> {
    const stats = this.migrationManager.getStats();
    
    console.log('📊 Migration Statistics\n');
    console.log(`Total migrations: ${stats.totalMigrations}`);
    console.log(`Successful: ${stats.successfulMigrations}`);
    console.log(`Failed: ${stats.failedMigrations}`);
    console.log(`Success rate: ${stats.totalMigrations > 0 ? ((stats.successfulMigrations / stats.totalMigrations) * 100).toFixed(1) : 0}%`);
    console.log(`Average duration: ${stats.averageDuration.toFixed(1)}ms`);
    console.log(`Error rate: ${stats.errorRate.toFixed(1)}%`);
    
    if (stats.mostUsedMigrations.length > 0) {
      console.log('\n🔥 Most used migrations:');
      stats.mostUsedMigrations.forEach(migration => {
        console.log(`  ${migration.stepId}: ${migration.usage} uses`);
      });
    }
  }

  private async showHistory(args: string[]): Promise<void> {
    const limit = args[0] ? parseInt(args[0]) : 10;
    const history = this.migrationManager.getMigrationHistory(limit);
    
    if (history.length === 0) {
      console.log('📋 No migration history available');
      return;
    }

    console.log(`📋 Recent migration history (${history.length} entries):\n`);
    
    history.forEach(entry => {
      const status = entry.success ? '✅' : '❌';
      const duration = entry.duration.toFixed(1);
      const timestamp = entry.timestamp.toISOString().split('T')[0];
      
      console.log(`${status} ${entry.id} - ${timestamp} (${duration}ms)`);
    });
  }

  private async rollbackMigration(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('❌ Usage: rollback <migration-id> <data-file>');
      return;
    }

    const migrationId = args[0];
    const dataFile = args[1];

    try {
      const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
      console.log(`🔄 Rolling back migration ${migrationId}...`);
      
      const result = await this.migrationManager.rollback(data, migrationId);

      if (result.success) {
        console.log('✅ Rollback completed successfully');
        // Save rolled back data
        const outputFile = dataFile.replace('.json', '_rolled_back.json');
        fs.writeFileSync(outputFile, JSON.stringify(result.migratedData, null, 2));
        console.log(`💾 Rolled back data saved to ${outputFile}`);
      } else {
        console.error('❌ Rollback failed:');
        result.errors.forEach(error => console.error(`  - ${error}`));
      }

    } catch (error) {
      console.error('❌ Rollback error:', error instanceof Error ? error.message : error);
    }
  }

  private showHelp(): void {
    console.log(`
🔄 MIFF Migration CLI Tool

Usage: tsx migrationCLI.ts <command> [options]

Commands:
  migrate <input> <from> <to> [output]  Migrate data between versions
  check <from> <to>                     Check migration compatibility
  paths                                 List all available migration paths
  stats                                 Show migration statistics
  history [limit]                       Show migration history
  rollback <id> <data>                  Rollback a migration
  help                                  Show this help

Examples:
  tsx migrationCLI.ts migrate data.json v1 v2
  tsx migrationCLI.ts check v1 v2
  tsx migrationCLI.ts migrate data.json v12 latest migrated.json
  tsx migrationCLI.ts stats
  tsx migrationCLI.ts history 20

Supported Versions:
  - Schema: v1, v2, v3, latest
  - SharedSchema: v12, latest
  - BridgeSchema: bridge_v1, consolidated_v1
  - RenderData: render_v1, render_v2
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new MigrationCLI();
  cli.run().catch(console.error);
}

export default MigrationCLI;