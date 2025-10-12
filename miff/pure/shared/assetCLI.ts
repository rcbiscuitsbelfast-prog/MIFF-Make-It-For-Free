#!/usr/bin/env tsx

/**
 * Asset Validation CLI Tool
 * 
 * Command-line interface for validating asset existence and pipeline integrity
 * across the MIFF framework.
 */

import { AssetValidator, AssetType } from './AssetValidator.js';
import * as fs from 'fs';
import * as path from 'path';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class AssetCLI {
  private logger: StructuredLogger;
  private validator: AssetValidator;

  constructor() {
    this.logger = new StructuredLogger({ module: 'AssetCLI' });
    this.validator = new AssetValidator();
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
      switch (command) {
        case 'scan':
          await this.scanAssets(args.slice(1));
          break;
        case 'validate':
          await this.validateAssets(args.slice(1));
          break;
        case 'pipeline':
          await this.checkPipeline(args.slice(1));
          break;
        case 'report':
          await this.generateReport(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async scanAssets(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'asset-references.json';

    this.logger.info(`🔍 Scanning for asset references in ${rootPath}...`);
    
    const references = await this.validator.scanAssetReferences(rootPath);
    
    // Save references to file
    fs.writeFileSync(outputFile, JSON.stringify(references, null, 2));
    
    this.logger.info(`✅ Found ${references.length} asset references`);
    this.logger.info(`📄 References saved to ${outputFile}`);

    // Show breakdown by type
    const typeCounts = new Map<AssetType, number>();
    for (const ref of references) {
      const count = typeCounts.get(ref.type) || 0;
      typeCounts.set(ref.type, count + 1);
    }

    this.logger.info('\n📊 Asset references by type:');
    for (const [type, count] of typeCounts) {
      this.logger.info(`  ${type}: ${count}`);
    }
  }

  private async validateAssets(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'asset-validation.json';

    this.logger.info(`🔍 Validating assets in ${rootPath}...`);
    
    // First scan for references
    await this.validator.scanAssetReferences(rootPath);
    
    // Then validate them
    const results = await this.validator.validateAssets(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    const stats = this.validator.getStats();
    
    this.logger.info('\n📊 Asset Validation Results:');
    this.logger.info(`Total assets: ${stats.totalAssets}`);
    this.logger.info(`Valid assets: ${stats.validAssets}`);
    this.logger.info(`Invalid assets: ${stats.invalidAssets}`);
    this.logger.info(`Missing assets: ${stats.missingAssets}`);
    this.logger.info(`Broken references: ${stats.brokenReferences}`);
    this.logger.info(`Total size: ${this.formatBytes(stats.totalSize)}`);
    this.logger.info(`Average size: ${this.formatBytes(stats.averageSize)}`);
    
    if (stats.invalidAssets > 0) {
      this.logger.info('\n❌ Invalid assets:');
      const invalidResults = results.filter(r => !r.valid);
      for (const result of invalidResults.slice(0, 10)) { // Show first 10
        this.logger.info(`  ${result.asset.path} (${result.asset.module})`);
        result.errors.forEach(error => this.logger.info(`    - ${error}`));
      }
      if (invalidResults.length > 10) {
        this.logger.info(`  ... and ${invalidResults.length - 10} more`);
      }
    }
    
    this.logger.info(`\n📄 Detailed results saved to ${outputFile}`);
  }

  private async checkPipeline(args: string[]): Promise<void> {
    const rootPath = args[0] || 'miff/pure';
    const outputFile = args[1] || 'pipeline-integrity.json';

    this.logger.info(`🔍 Checking pipeline integrity in ${rootPath}...`);
    
    // First scan for references
    await this.validator.scanAssetReferences(rootPath);
    
    // Then check pipeline integrity
    const results = await this.validator.checkPipelineIntegrity(rootPath);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    
    this.logger.info('\n📊 Pipeline Integrity Results:');
    for (const result of results) {
      const status = result.valid ? '✅' : '❌';
      this.logger.info(`${status} ${result.pipeline} Pipeline`);
      
      if (result.missingAssets.length > 0) {
        this.logger.info(`  Missing assets: ${result.missingAssets.length}`);
        result.missingAssets.slice(0, 5).forEach(asset => this.logger.info(`    - ${asset}`));
        if (result.missingAssets.length > 5) {
          this.logger.info(`    ... and ${result.missingAssets.length - 5} more`);
        }
      }
      
      if (result.brokenReferences.length > 0) {
        this.logger.info(`  Broken references: ${result.brokenReferences.length}`);
      }
      
      if (result.versionMismatches.length > 0) {
        this.logger.info(`  Version mismatches: ${result.versionMismatches.length}`);
      }
      
      if (result.recommendations.length > 0) {
        this.logger.info(`  Recommendations:`);
        result.recommendations.forEach(rec => this.logger.info(`    - ${rec}`));
      }
    }
    
    this.logger.info(`\n📄 Detailed results saved to ${outputFile}`);
  }

  private async generateReport(args: string[]): Promise<void> {
    const inputFile = args[0] || 'asset-validation.json';
    const outputFile = args[1] || 'asset-report.html';

    if (!fs.existsSync(inputFile)) {
      this.logger.error(`❌ Validation file not found: ${inputFile}`);
      this.logger.error('Run asset validation first with: tsx assetCLI.ts validate');
      return;
    }

    const results = SafeJSONParser.parse(fs.readFileSync(inputFile, 'utf-8'));
    const report = this.validator.generateReport();
    const html = this.generateHTMLReport(results);

    fs.writeFileSync(outputFile, html);
    this.logger.info(`📄 HTML report generated: ${outputFile}`);
  }

  private generateHTMLReport(results: any[]): string {
    const stats = this.calculateStatsFromResults(results);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MIFF Asset Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; margin-top: 5px; }
        .valid { color: #28a745; }
        .invalid { color: #dc3545; }
        .missing { color: #ffc107; }
        .asset-list { margin: 20px 0; }
        .asset-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; }
        .asset-path { font-weight: bold; }
        .asset-module { color: #666; font-size: 0.9em; }
        .asset-errors { color: #dc3545; margin-top: 5px; }
        .asset-warnings { color: #ffc107; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 MIFF Asset Validation Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-value">${stats.totalAssets}</div>
            <div class="stat-label">Total Assets</div>
        </div>
        <div class="stat-card">
            <div class="stat-value valid">${stats.validAssets}</div>
            <div class="stat-label">Valid Assets</div>
        </div>
        <div class="stat-card">
            <div class="stat-value invalid">${stats.invalidAssets}</div>
            <div class="stat-label">Invalid Assets</div>
        </div>
        <div class="stat-card">
            <div class="stat-value missing">${stats.missingAssets}</div>
            <div class="stat-label">Missing Assets</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${this.formatBytes(stats.totalSize)}</div>
            <div class="stat-label">Total Size</div>
        </div>
    </div>

    <div class="asset-list">
        <h3>Invalid Assets</h3>
        ${results.filter((r: any) => !r.valid).map((result: any) => `
            <div class="asset-item">
                <div class="asset-path">${result.asset.path}</div>
                <div class="asset-module">Module: ${result.asset.module} | Type: ${result.asset.type}</div>
                ${result.errors.length > 0 ? `<div class="asset-errors">Errors: ${result.errors.join(', ')}</div>` : ''}
                ${result.warnings.length > 0 ? `<div class="asset-warnings">Warnings: ${result.warnings.join(', ')}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  private calculateStatsFromResults(results: any[]): any {
    const totalAssets = results.length;
    const validAssets = results.filter((r: any) => r.valid).length;
    const invalidAssets = results.filter((r: any) => !r.valid).length;
    const missingAssets = results.filter((r: any) => r.errors.some((e: string) => e.includes('not found'))).length;
    const totalSize = results.reduce((sum, r: any) => sum + (r.asset.size || 0), 0);
    
    return {
      totalAssets,
      validAssets,
      invalidAssets,
      missingAssets,
      totalSize
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private showHelp(): void {
    this.logger.info(`
🎨 MIFF Asset Validation CLI

Usage: tsx assetCLI.ts <command> [options]

Commands:
  scan [path] [output]           Scan for asset references in codebase
  validate [path] [output]       Validate asset existence and integrity
  pipeline [path] [output]       Check pipeline integrity (Unity, Godot, Web)
  report [input] [output]        Generate HTML report from validation results
  help                          Show this help

Examples:
  tsx assetCLI.ts scan miff/pure
  tsx assetCLI.ts validate miff/pure asset-validation.json
  tsx assetCLI.ts pipeline miff/pure pipeline-integrity.json
  tsx assetCLI.ts report asset-validation.json report.html

Supported Asset Types:
  - Images: png, jpg, jpeg, gif, svg, webp, bmp, ico
  - Audio: mp3, wav, ogg, m4a, aac, flac
  - Video: mp4, avi, mov, wmv, flv, webm
  - Models: obj, fbx, dae, gltf, glb, blend
  - Scripts: js, ts, cs, gd, py, lua
  - Scenes: unity, tscn, prefab
  - Data: json, xml, yaml, yml, toml

Pipeline Checks:
  - Unity: .unity, .prefab files and references
  - Godot: .tscn files and references
  - Web: Image, audio, video optimization
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new AssetCLI();
  cli.run().catch(console.error);
}

export default AssetCLI;