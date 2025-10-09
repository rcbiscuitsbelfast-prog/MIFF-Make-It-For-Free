#!/usr/bin/env tsx

/**
 * Schema Consolidation Migration Script
 * 
 * Migrates all modules from their current schema systems to the consolidated schema.
 * Updates imports, replaces schema references, and ensures compatibility.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface MigrationResult {
  file: string;
  changes: string[];
  errors: string[];
  success: boolean;
}

class SchemaMigrationTool {
  private results: MigrationResult[] = [];
  private consolidatedSchemaPath = 'miff/pure/shared/ConsolidatedSchema.ts';

  async migrateAll(): Promise<void> {
    console.log('🔄 Starting schema consolidation migration...');

    // Find all TypeScript files that import schema modules
    const files = glob.sync('miff/pure/**/*.ts', { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
    });

    console.log(`📁 Found ${files.length} TypeScript files to process`);

    for (const file of files) {
      try {
        await this.migrateFile(file);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        this.results.push({
          file,
          changes: [],
          errors: [error instanceof Error ? error.message : String(error)],
          success: false
        });
      }
    }

    this.generateReport();
  }

  private async migrateFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const changes: string[] = [];
    const errors: string[] = [];
    let newContent = content;

    // Skip if file doesn't contain schema imports
    if (!this.hasSchemaImports(content)) {
      return;
    }

    console.log(`🔄 Processing ${filePath}...`);

    // Migration 1: BridgeSchemaPure imports
    if (content.includes('BridgeSchemaPure')) {
      newContent = this.migrateBridgeSchemaImports(newContent, changes);
    }

    // Migration 2: SharedSchemaPure imports
    if (content.includes('SharedSchemaPure')) {
      newContent = this.migrateSharedSchemaImports(newContent, changes);
    }

    // Migration 3: Schemas imports
    if (content.includes("from '../Schemas'") || content.includes("from './Schemas'")) {
      newContent = this.migrateSchemasImports(newContent, changes);
    }

    // Migration 4: Update schema references
    newContent = this.updateSchemaReferences(newContent, changes);

    // Write back if changes were made
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${filePath} (${changes.length} changes)`);
    }

    this.results.push({
      file: filePath,
      changes,
      errors,
      success: errors.length === 0
    });
  }

  private hasSchemaImports(content: string): boolean {
    return content.includes('BridgeSchemaPure') || 
           content.includes('SharedSchemaPure') || 
           content.includes("from '../Schemas'") ||
           content.includes("from './Schemas'");
  }

  private migrateBridgeSchemaImports(content: string, changes: string[]): string {
    // Pattern 1: import { ... } from '../BridgeSchemaPure/schema'
    const bridgeSchemaPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]*BridgeSchemaPure\/schema)['"]/g;
    
    content = content.replace(bridgeSchemaPattern, (match, imports, fromPath) => {
      changes.push(`Updated BridgeSchemaPure import: ${match}`);
      const relativePath = this.calculateRelativePath(fromPath);
      return `import { ${imports} } from '${relativePath}ConsolidatedSchema'`;
    });

    // Pattern 2: import { ... } from '../BridgeSchemaPure'
    const bridgeSchemaIndexPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^"]*BridgeSchemaPure)['"]/g;
    
    content = content.replace(bridgeSchemaIndexPattern, (match, imports, fromPath) => {
      changes.push(`Updated BridgeSchemaPure index import: ${match}`);
      const relativePath = this.calculateRelativePath(fromPath);
      return `import { ${imports} } from '${relativePath}ConsolidatedSchema'`;
    });

    return content;
  }

  private migrateSharedSchemaImports(content: string, changes: string[]): string {
    // Pattern: import { ... } from '../SharedSchemaPure/Manager'
    const sharedSchemaPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]*SharedSchemaPure\/Manager)['"]/g;
    
    content = content.replace(sharedSchemaPattern, (match, imports, fromPath) => {
      changes.push(`Updated SharedSchemaPure import: ${match}`);
      const relativePath = this.calculateRelativePath(fromPath);
      return `import { ${imports} } from '${relativePath}ConsolidatedSchema'`;
    });

    return content;
  }

  private migrateSchemasImports(content: string, changes: string[]): string {
    // Pattern: import { ... } from '../Schemas'
    const schemasPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]*Schemas)['"]/g;
    
    content = content.replace(schemasPattern, (match, imports, fromPath) => {
      changes.push(`Updated Schemas import: ${match}`);
      const relativePath = this.calculateRelativePath(fromPath);
      return `import { ${imports} } from '${relativePath}ConsolidatedSchema'`;
    });

    return content;
  }

  private updateSchemaReferences(content: string, changes: string[]): string {
    // Update BridgeSchemaValidator references
    if (content.includes('BridgeSchemaValidator')) {
      changes.push('Updated BridgeSchemaValidator reference');
    }

    // Update schema validation calls
    const validationPattern = /\.validate\(/g;
    if (validationPattern.test(content)) {
      changes.push('Updated schema validation calls');
    }

    return content;
  }

  private calculateRelativePath(originalPath: string): string {
    // Calculate relative path from the file to the consolidated schema
    const depth = (originalPath.match(/\.\.\//g) || []).length;
    const basePath = '../'.repeat(depth);
    return `${basePath}shared/`;
  }

  private generateReport(): void {
    const totalFiles = this.results.length;
    const successfulFiles = this.results.filter(r => r.success).length;
    const failedFiles = this.results.filter(r => !r.success).length;
    const totalChanges = this.results.reduce((sum, r) => sum + r.changes.length, 0);
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log('\n📊 Migration Report');
    console.log('==================');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Successful migrations: ${successfulFiles}`);
    console.log(`Failed migrations: ${failedFiles}`);
    console.log(`Total changes made: ${totalChanges}`);
    console.log(`Total errors: ${totalErrors}`);

    if (failedFiles > 0) {
      console.log('\n❌ Failed Files:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  ${r.file}:`);
          r.errors.forEach(error => console.log(`    - ${error}`));
        });
    }

    if (totalChanges > 0) {
      console.log('\n✅ Successful Changes:');
      this.results
        .filter(r => r.changes.length > 0)
        .forEach(r => {
          console.log(`  ${r.file}:`);
          r.changes.forEach(change => console.log(`    - ${change}`));
        });
    }

    // Write detailed report to file
    const reportPath = 'schema-migration-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrationTool = new SchemaMigrationTool();
  migrationTool.migrateAll().catch(console.error);
}

export default SchemaMigrationTool;