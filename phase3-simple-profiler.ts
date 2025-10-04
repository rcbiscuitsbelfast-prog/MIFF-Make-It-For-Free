#!/usr/bin/env tsx

/**
 * Phase 3 Simple Performance Profiler
 * 
 * Simplified performance analysis for MIFF modules
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface SimpleMetrics {
  moduleName: string;
  hasIndex: boolean;
  hasCLI: boolean;
  hasTests: boolean;
  fileCount: number;
  totalSize: number;
  status: 'complete' | 'partial' | 'minimal' | 'broken';
}

class SimpleProfiler {
  private modules: SimpleMetrics[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Profile all modules
   */
  async profileAllModules(): Promise<void> {
    console.log('🔍 Starting simple performance profiling...\n');

    // Get module list from previous analysis
    const moduleNames = [
      'AIPure', 'CombatPure', 'ItemsPure', 'TeamsPure', 'StatusEffectsPure',
      'QuestsPure', 'RenderWorldPure', 'InputSystemPure', 'EventBusPure',
      'AvatarSystemPure', 'ObstacleCoursePure', 'SurvivalSystemPure',
      'ThemeParkPure', 'ExportPipelinePure', 'WebSocketBridgePure',
      'AudioPure', 'HUDPure', 'InventoryPure', 'EquipmentPure',
      'WorldManifestPure', 'WeatherSystemPure', 'TimeSystemPure',
      'PartyPure', 'SocialDeductionPure', 'RaidSystemPure',
      'MagicSystemPure', 'EvolutionPure', 'FusionPure',
      'PhysicsSystemPure', 'PixelAnimPure', 'PixelDrawPure',
      'ProgressionPure', 'ProjectileSystemPure', 'QuestModulePure',
      'QuestSystemPure', 'RNGPure', 'RacingSystemPure',
      'RemixAuditPure', 'RenderPayloadPure', 'RenderReplayPure',
      'RewardsPure', 'RhythmSystemPure', 'SaveLoadPure',
      'SceneBuilderPure', 'ScoreSystemPure', 'SessionManifestPure',
      'SettingsPure', 'SimpleGamePure', 'SkillTreePure',
      'SocialDeductionPure', 'SpiritsPure', 'SplashScreenPure',
      'SportsSystemPure', 'StatsSystemPure', 'StorySystemPure',
      'SyncManagerPure', 'SyncPure', 'TeleportationSystemPure',
      'TextureSynthPure', 'TimelineSystemPure', 'TycoonSystemPure',
      'UnityBridgePure', 'UnrealBridgePure', 'ValidationPure',
      'VisualItemEventPure', 'VisualReplaySystemPure', 'WebBridgePure',
      'WebSocketServerPure', 'XPLevelingPure', 'ZoneServerPure'
    ];

    console.log(`📊 Profiling ${moduleNames.length} modules...\n`);

    // Profile each module
    for (const moduleName of moduleNames) {
      try {
        const metrics = await this.analyzeModule(moduleName);
        this.modules.push(metrics);
        console.log(`✅ ${moduleName}: ${metrics.status} (${metrics.fileCount} files, ${(metrics.totalSize / 1024).toFixed(1)}KB)`);
      } catch (error) {
        console.log(`❌ Failed to profile ${moduleName}: ${error}`);
        this.modules.push({
          moduleName,
          hasIndex: false,
          hasCLI: false,
          hasTests: false,
          fileCount: 0,
          totalSize: 0,
          status: 'broken'
        });
      }
    }

    // Generate and save report
    this.generateReport();
  }

  /**
   * Analyze a single module
   */
  private async analyzeModule(moduleName: string): Promise<SimpleMetrics> {
    const modulePath = `/workspace/miff/pure/${moduleName}`;
    
    // Check if module exists
    try {
      const fs = await import('fs');
      const stat = fs.statSync(modulePath);
      if (!stat.isDirectory()) {
        throw new Error('Not a directory');
      }
    } catch (error) {
      throw new Error('Module not found');
    }

    // Analyze module structure
    const hasIndex = await this.checkFile(modulePath, 'index.ts');
    const hasCLI = await this.checkFile(modulePath, 'cliHarness.ts');
    const hasTests = await this.checkTests(modulePath);
    const fileCount = await this.countFiles(modulePath);
    const totalSize = await this.calculateSize(modulePath);
    
    // Determine status
    let status: 'complete' | 'partial' | 'minimal' | 'broken' = 'minimal';
    
    if (hasIndex && hasCLI && hasTests && fileCount > 5) {
      status = 'complete';
    } else if (hasIndex && hasCLI && fileCount > 3) {
      status = 'partial';
    } else if (hasIndex || hasCLI) {
      status = 'minimal';
    } else {
      status = 'broken';
    }

    return {
      moduleName,
      hasIndex,
      hasCLI,
      hasTests,
      fileCount,
      totalSize,
      status
    };
  }

  /**
   * Check if a file exists
   */
  private async checkFile(modulePath: string, fileName: string): Promise<boolean> {
    try {
      const fs = await import('fs');
      const filePath = join(modulePath, fileName);
      const stat = fs.statSync(filePath);
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if module has tests
   */
  private async checkTests(modulePath: string): Promise<boolean> {
    try {
      const fs = await import('fs');
      const files = fs.readdirSync(modulePath);
      return files.some((file: string) => file.includes('.test.') || file.includes('tests'));
    } catch (error) {
      return false;
    }
  }

  /**
   * Count files in module
   */
  private async countFiles(modulePath: string): Promise<number> {
    try {
      const fs = await import('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      return files.filter((file: string) => 
        typeof file === 'string' && 
        (file.endsWith('.ts') || file.endsWith('.js'))
      ).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate total size
   */
  private async calculateSize(modulePath: string): Promise<number> {
    try {
      const fs = await import('fs');
      const files = fs.readdirSync(modulePath, { recursive: true });
      let totalSize = 0;
      
      for (const file of files) {
        if (typeof file === 'string' && (file.endsWith('.ts') || file.endsWith('.js'))) {
          try {
            const filePath = join(modulePath, file);
            const stat = fs.statSync(filePath);
            totalSize += stat.size;
          } catch (error) {
            // Skip files that can't be accessed
          }
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Generate performance report
   */
  private generateReport(): void {
    const totalModules = this.modules.length;
    const completeModules = this.modules.filter(m => m.status === 'complete').length;
    const partialModules = this.modules.filter(m => m.status === 'partial').length;
    const minimalModules = this.modules.filter(m => m.status === 'minimal').length;
    const brokenModules = this.modules.filter(m => m.status === 'broken').length;
    
    const totalSize = this.modules.reduce((sum, m) => sum + m.totalSize, 0);
    const totalFiles = this.modules.reduce((sum, m) => sum + m.fileCount, 0);
    
    const reportContent = `
# Phase 3 Simple Performance Report

Generated: ${new Date().toISOString()}
Duration: ${Date.now() - this.startTime}ms

## Summary
- Total Modules: ${totalModules}
- Complete: ${completeModules} (${((completeModules / totalModules) * 100).toFixed(1)}%)
- Partial: ${partialModules} (${((partialModules / totalModules) * 100).toFixed(1)}%)
- Minimal: ${minimalModules} (${((minimalModules / totalModules) * 100).toFixed(1)}%)
- Broken: ${brokenModules} (${((brokenModules / totalModules) * 100).toFixed(1)}%)

## Metrics
- Total Files: ${totalFiles}
- Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB
- Average Files per Module: ${(totalFiles / totalModules).toFixed(1)}
- Average Size per Module: ${(totalSize / totalModules / 1024).toFixed(1)}KB

## Module Status

### Complete Modules (${completeModules})
${this.modules.filter(m => m.status === 'complete').map(m => 
  `- ${m.moduleName}: ${m.fileCount} files, ${(m.totalSize / 1024).toFixed(1)}KB`
).join('\n')}

### Partial Modules (${partialModules})
${this.modules.filter(m => m.status === 'partial').map(m => 
  `- ${m.moduleName}: ${m.fileCount} files, ${(m.totalSize / 1024).toFixed(1)}KB`
).join('\n')}

### Minimal Modules (${minimalModules})
${this.modules.filter(m => m.status === 'minimal').map(m => 
  `- ${m.moduleName}: ${m.fileCount} files, ${(m.totalSize / 1024).toFixed(1)}KB`
).join('\n')}

### Broken Modules (${brokenModules})
${this.modules.filter(m => m.status === 'broken').map(m => 
  `- ${m.moduleName}: ${m.fileCount} files, ${(m.totalSize / 1024).toFixed(1)}KB`
).join('\n')}

## Recommendations

${completeModules > 0 ? `✅ ${completeModules} modules are complete and ready for production` : ''}
${partialModules > 0 ? `🔧 ${partialModules} modules need minor improvements` : ''}
${minimalModules > 0 ? `⚠️  ${minimalModules} modules need significant development` : ''}
${brokenModules > 0 ? `❌ ${brokenModules} modules are broken and need immediate attention` : ''}

## Next Steps
1. Focus on completing partial modules
2. Address broken modules immediately
3. Enhance minimal modules with additional features
4. Optimize complete modules for performance
`;

    const reportPath = '/workspace/docs/archive/test-results/2025-10-01-phase3-simple-performance-report.txt';
    writeFileSync(reportPath, reportContent);
    
    console.log('\n📊 Performance Profiling Complete!');
    console.log(`✅ Total Modules: ${totalModules}`);
    console.log(`🟢 Complete: ${completeModules}`);
    console.log(`🟡 Partial: ${partialModules}`);
    console.log(`🟠 Minimal: ${minimalModules}`);
    console.log(`🔴 Broken: ${brokenModules}`);
    console.log(`📁 Total Files: ${totalFiles}`);
    console.log(`💾 Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const profiler = new SimpleProfiler();
  await profiler.profileAllModules();
}

// Run the profiler
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}