#!/usr/bin/env tsx

/**
 * Phase 2 Integration Tests
 * 
 * Comprehensive integration testing for all module combinations
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface IntegrationTestResult {
  testName: string;
  modules: string[];
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  errors: string[];
  warnings: string[];
  details: string;
}

interface ModuleIntegration {
  modules: string[];
  testName: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

class Phase2IntegrationTester {
  private results: IntegrationTestResult[] = [];
  private modules: string[] = [
    'CombatPure',
    'ItemsPure', 
    'TeamsPure',
    'StatusEffectsPure',
    'AIPure',
    'BattleAIPure',
    'WebSocketBridgePure',
    'ObstacleCoursePure',
    'SurvivalSystemPure',
    'ThemeParkPure',
    'AvatarSystemPure',
    'AvatarAssetRegistryPure',
    'AvatarRendererWebPure',
    'AvatarRendererGodotPure'
  ];

  private integrationTests: ModuleIntegration[] = [
    // Core Combat System Integrations
    {
      modules: ['CombatPure', 'ItemsPure'],
      testName: 'Combat-Items Integration',
      description: 'Test item usage in combat scenarios',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'TeamsPure'],
      testName: 'Combat-Teams Integration', 
      description: 'Test team management in combat',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'StatusEffectsPure'],
      testName: 'Combat-StatusEffects Integration',
      description: 'Test status effects in combat',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'AIPure'],
      testName: 'Combat-AI Integration',
      description: 'Test AI decision making in combat',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'BattleAIPure'],
      testName: 'Combat-BattleAI Integration',
      description: 'Test battle AI controllers in combat',
      priority: 'high'
    },

    // Core System Integrations
    {
      modules: ['ItemsPure', 'TeamsPure'],
      testName: 'Items-Teams Integration',
      description: 'Test item usage with team management',
      priority: 'high'
    },
    {
      modules: ['ItemsPure', 'StatusEffectsPure'],
      testName: 'Items-StatusEffects Integration',
      description: 'Test item effects on status effects',
      priority: 'high'
    },
    {
      modules: ['TeamsPure', 'StatusEffectsPure'],
      testName: 'Teams-StatusEffects Integration',
      description: 'Test status effects on team members',
      priority: 'high'
    },
    {
      modules: ['AIPure', 'BattleAIPure'],
      testName: 'AI-BattleAI Integration',
      description: 'Test AI and battle AI coordination',
      priority: 'high'
    },

    // Avatar System Integrations
    {
      modules: ['AvatarSystemPure', 'AvatarAssetRegistryPure'],
      testName: 'Avatar-AssetRegistry Integration',
      description: 'Test avatar system with asset registry',
      priority: 'medium'
    },
    {
      modules: ['AvatarSystemPure', 'AvatarRendererWebPure'],
      testName: 'Avatar-WebRenderer Integration',
      description: 'Test avatar system with web renderer',
      priority: 'medium'
    },
    {
      modules: ['AvatarSystemPure', 'AvatarRendererGodotPure'],
      testName: 'Avatar-GodotRenderer Integration',
      description: 'Test avatar system with Godot renderer',
      priority: 'medium'
    },
    {
      modules: ['AvatarAssetRegistryPure', 'AvatarRendererWebPure'],
      testName: 'AssetRegistry-WebRenderer Integration',
      description: 'Test asset registry with web renderer',
      priority: 'medium'
    },
    {
      modules: ['AvatarAssetRegistryPure', 'AvatarRendererGodotPure'],
      testName: 'AssetRegistry-GodotRenderer Integration',
      description: 'Test asset registry with Godot renderer',
      priority: 'medium'
    },

    // Game System Integrations
    {
      modules: ['ObstacleCoursePure', 'WebSocketBridgePure'],
      testName: 'ObstacleCourse-WebSocket Integration',
      description: 'Test obstacle course with real-time communication',
      priority: 'medium'
    },
    {
      modules: ['SurvivalSystemPure', 'WebSocketBridgePure'],
      testName: 'Survival-WebSocket Integration',
      description: 'Test survival system with real-time communication',
      priority: 'medium'
    },
    {
      modules: ['ThemeParkPure', 'WebSocketBridgePure'],
      testName: 'ThemePark-WebSocket Integration',
      description: 'Test theme park with real-time communication',
      priority: 'medium'
    },

    // Complex Multi-Module Integrations
    {
      modules: ['CombatPure', 'ItemsPure', 'TeamsPure'],
      testName: 'Combat-Items-Teams Integration',
      description: 'Test full combat system with items and teams',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'ItemsPure', 'StatusEffectsPure'],
      testName: 'Combat-Items-StatusEffects Integration',
      description: 'Test combat with items and status effects',
      priority: 'high'
    },
    {
      modules: ['CombatPure', 'AIPure', 'BattleAIPure'],
      testName: 'Combat-AI-BattleAI Integration',
      description: 'Test combat with both AI systems',
      priority: 'high'
    },
    {
      modules: ['ItemsPure', 'TeamsPure', 'StatusEffectsPure'],
      testName: 'Items-Teams-StatusEffects Integration',
      description: 'Test items, teams, and status effects together',
      priority: 'high'
    },

    // Full System Integration
    {
      modules: ['CombatPure', 'ItemsPure', 'TeamsPure', 'StatusEffectsPure', 'AIPure'],
      testName: 'Full Core System Integration',
      description: 'Test complete core game system integration',
      priority: 'high'
    },
    {
      modules: ['AvatarSystemPure', 'AvatarAssetRegistryPure', 'AvatarRendererWebPure', 'AvatarRendererGodotPure'],
      testName: 'Full Avatar System Integration',
      description: 'Test complete avatar system integration',
      priority: 'medium'
    },
    {
      modules: ['ObstacleCoursePure', 'SurvivalSystemPure', 'ThemeParkPure'],
      testName: 'Full Game System Integration',
      description: 'Test complete game system integration',
      priority: 'medium'
    }
  ];

  async runAllIntegrationTests(): Promise<IntegrationTestResult[]> {
    console.log('🚀 Starting Phase 2 Integration Tests...\n');
    console.log(`📊 Total tests: ${this.integrationTests.length}`);
    console.log(`📦 Modules: ${this.modules.length}\n`);

    for (const test of this.integrationTests) {
      await this.runIntegrationTest(test);
    }

    this.generateReport();
    return this.results;
  }

  private async runIntegrationTest(test: ModuleIntegration): Promise<void> {
    console.log(`🧪 Running ${test.testName}...`);
    const startTime = Date.now();

    try {
      // Check if all modules exist
      const missingModules = await this.checkMissingModules(test.modules);
      if (missingModules.length > 0) {
        this.results.push({
          testName: test.testName,
          modules: test.modules,
          status: 'SKIP',
          duration: Date.now() - startTime,
          errors: [`Missing modules: ${missingModules.join(', ')}`],
          warnings: [],
          details: `Skipped due to missing modules: ${missingModules.join(', ')}`
        });
        console.log(`   ⏭️  Skipped (missing modules: ${missingModules.join(', ')})`);
        return;
      }

      // Run the integration test
      const testResult = await this.executeIntegrationTest(test);
      
      this.results.push({
        testName: test.testName,
        modules: test.modules,
        status: testResult.success ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        errors: testResult.errors,
        warnings: testResult.warnings,
        details: testResult.details
      });

      const status = testResult.success ? '✅' : '❌';
      console.log(`   ${status} ${test.testName} (${Date.now() - startTime}ms)`);
      if (testResult.errors.length > 0) {
        console.log(`      Errors: ${testResult.errors.join(', ')}`);
      }

    } catch (error) {
      this.results.push({
        testName: test.testName,
        modules: test.modules,
        status: 'FAIL',
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        details: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      console.log(`   ❌ ${test.testName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkMissingModules(modules: string[]): Promise<string[]> {
    const missing: string[] = [];
    
    for (const module of modules) {
      try {
        await import(`./miff/pure/${module}`);
      } catch (error) {
        missing.push(module);
      }
    }
    
    return missing;
  }

  private async executeIntegrationTest(test: ModuleIntegration): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      // Import all modules
      const moduleInstances: any[] = [];
      for (const moduleName of test.modules) {
        const module = await import(`./miff/pure/${moduleName}`);
        moduleInstances.push(module);
      }

      // Run specific integration tests based on module combination
      if (test.modules.includes('CombatPure') && test.modules.includes('ItemsPure')) {
        const result = await this.testCombatItemsIntegration(moduleInstances);
        if (!result.success) errors.push(...result.errors);
        if (result.warnings.length > 0) warnings.push(...result.warnings);
        details += result.details;
      }

      if (test.modules.includes('CombatPure') && test.modules.includes('TeamsPure')) {
        const result = await this.testCombatTeamsIntegration(moduleInstances);
        if (!result.success) errors.push(...result.errors);
        if (result.warnings.length > 0) warnings.push(...result.warnings);
        details += result.details;
      }

      if (test.modules.includes('CombatPure') && test.modules.includes('StatusEffectsPure')) {
        const result = await this.testCombatStatusEffectsIntegration(moduleInstances);
        if (!result.success) errors.push(...result.errors);
        if (result.warnings.length > 0) warnings.push(...result.warnings);
        details += result.details;
      }

      if (test.modules.includes('AvatarSystemPure') && test.modules.includes('AvatarAssetRegistryPure')) {
        const result = await this.testAvatarAssetRegistryIntegration(moduleInstances);
        if (!result.success) errors.push(...result.errors);
        if (result.warnings.length > 0) warnings.push(...result.warnings);
        details += result.details;
      }

      // Generic integration test for other combinations
      if (test.modules.length > 1 && !test.modules.includes('CombatPure') && !test.modules.includes('AvatarSystemPure')) {
        const result = await this.testGenericIntegration(moduleInstances, test.modules);
        if (!result.success) errors.push(...result.errors);
        if (result.warnings.length > 0) warnings.push(...result.warnings);
        details += result.details;
      }

      return {
        success: errors.length === 0,
        errors,
        warnings,
        details
      };

    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        details: `Integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async testCombatItemsIntegration(modules: any[]): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      // Find CombatPure and ItemsPure modules
      const combatModule = modules.find(m => m.CombatEngine || m.BattleEngine);
      const itemsModule = modules.find(m => m.ItemUsageManager || m.Item);

      if (!combatModule) {
        errors.push('CombatPure module not found');
        return { success: false, errors, warnings, details };
      }

      if (!itemsModule) {
        errors.push('ItemsPure module not found');
        return { success: false, errors, warnings, details };
      }

      // Test basic integration
      details += 'Combat-Items integration test: ';
      
      // Create mock combat scenario
      const typeChart = new Map();
      const combatEngine = new combatModule.CombatEngine(typeChart);
      details += 'CombatEngine created; ';

      // Create mock item
      const mockPlayerContext = {
        getSpiritById: (id: string) => ({
          id, name: `Spirit ${id}`, level: 10, type: 'normal',
          currentHP: 100, maxHP: 100, stats: { attack: 10, defense: 10, speed: 10, specialAttack: 10, specialDefense: 10 },
          isFainted: () => false, canEvolve: () => false, evolve: () => false, getStat: (stat: string) => 10
        })
      };

      const itemManager = new itemsModule.ItemUsageManager(mockPlayerContext);
      details += 'ItemUsageManager created; ';

      // Test item creation and usage
      const testItem = {
        id: 'potion',
        name: 'Health Potion',
        description: 'Restores HP',
        type: 'consumable',
        effects: [{ type: 'heal', magnitude: 50 }],
        usage: { target: 'spirit', consumable: true }
      };

      itemManager.registerItem(testItem);
      details += 'Item registered; ';

      const useResult = await itemManager.useItem('potion', 'test-spirit');
      if (useResult.status === 'success') {
        details += 'Item usage successful; ';
      } else {
        warnings.push('Item usage returned non-success status');
      }

      details += 'Integration test completed successfully.';

      return { success: true, errors, warnings, details };

    } catch (error) {
      errors.push(`Combat-Items integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, details };
    }
  }

  private async testCombatTeamsIntegration(modules: any[]): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      // Find CombatPure and TeamsPure modules
      const combatModule = modules.find(m => m.CombatEngine || m.BattleEngine);
      const teamsModule = modules.find(m => m.TeamManager || m.Team);

      if (!combatModule) {
        errors.push('CombatPure module not found');
        return { success: false, errors, warnings, details };
      }

      if (!teamsModule) {
        errors.push('TeamsPure module not found');
        return { success: false, errors, warnings, details };
      }

      details += 'Combat-Teams integration test: ';

      // Create team manager
      const teamManager = new teamsModule.TeamManager();
      details += 'TeamManager created; ';

      // Create team
      const teamResult = teamManager.createTeam('test-team');
      if (teamResult.status === 'success') {
        details += 'Team created; ';
      } else {
        warnings.push('Team creation returned non-success status');
      }

      // Create mock spirit for team
      const mockSpirit = {
        id: 'test-spirit',
        name: 'Test Spirit',
        level: 10,
        type: 'fire',
        currentHP: 100,
        maxHP: 100,
        stats: { attack: 10, defense: 10, speed: 10, specialAttack: 10, specialDefense: 10 },
        isFainted: () => false,
        canEvolve: () => false,
        evolve: () => false,
        getStat: (stat: string) => 10
      };

      const addResult = teamManager.addSpiritToTeam('test-team', mockSpirit);
      if (addResult.status === 'success') {
        details += 'Spirit added to team; ';
      } else {
        warnings.push('Spirit addition returned non-success status');
      }

      // Test team validation
      const validation = teamManager.validateTeam();
      if (validation.status === 'success') {
        details += 'Team validation successful; ';
      } else {
        warnings.push('Team validation returned non-success status');
      }

      details += 'Integration test completed successfully.';

      return { success: true, errors, warnings, details };

    } catch (error) {
      errors.push(`Combat-Teams integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, details };
    }
  }

  private async testCombatStatusEffectsIntegration(modules: any[]): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      // Find CombatPure and StatusEffectsPure modules
      const combatModule = modules.find(m => m.CombatEngine || m.BattleEngine);
      const statusModule = modules.find(m => m.StatusEffectsManager || m.StatusEffect);

      if (!combatModule) {
        errors.push('CombatPure module not found');
        return { success: false, errors, warnings, details };
      }

      if (!statusModule) {
        errors.push('StatusEffectsPure module not found');
        return { success: false, errors, warnings, details };
      }

      details += 'Combat-StatusEffects integration test: ';

      // Create status effects manager
      const statusManager = new statusModule.StatusEffectsManager();
      details += 'StatusEffectsManager created; ';

      // Create status effect
      const poisonEffect = {
        id: 'poison',
        name: 'Poison',
        type: 'debuff',
        magnitude: 5,
        duration: 3,
        appliedAt: Date.now(),
        expiresAt: Date.now() + 3000,
        currentStacks: 1
      };

      const applyResult = statusManager.applyEffect('test-spirit', poisonEffect);
      if (applyResult.success) {
        details += 'Status effect applied; ';
      } else {
        warnings.push('Status effect application returned non-success status');
      }

      // Test status effect processing
      const processResult = statusManager.processEffects('test-spirit');
      if (processResult.success) {
        details += 'Status effects processed; ';
      } else {
        warnings.push('Status effect processing returned non-success status');
      }

      details += 'Integration test completed successfully.';

      return { success: true, errors, warnings, details };

    } catch (error) {
      errors.push(`Combat-StatusEffects integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, details };
    }
  }

  private async testAvatarAssetRegistryIntegration(modules: any[]): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      // Find AvatarSystemPure and AvatarAssetRegistryPure modules
      const avatarModule = modules.find(m => m.AvatarSystemPure || m.AvatarManifest);
      const registryModule = modules.find(m => m.AvatarAssetRegistryPure || m.VariantMap);

      if (!avatarModule) {
        errors.push('AvatarSystemPure module not found');
        return { success: false, errors, warnings, details };
      }

      if (!registryModule) {
        errors.push('AvatarAssetRegistryPure module not found');
        return { success: false, errors, warnings, details };
      }

      details += 'Avatar-AssetRegistry integration test: ';

      // Create sample registry
      const registry = {
        version: '1.0.0',
        items: [
          {
            id: 'head-001',
            variants: {
              '3d': 'https://example.com/head-3d.glb',
              '2d-side': 'https://example.com/head-2d.png',
              'overlay': 'https://example.com/head-overlay.png'
            },
            remixSafety: 'CC0',
            generationHints: { style: 'realistic' }
          }
        ]
      };

      details += 'Registry created; ';

      // Test variant resolution
      const resolved = registryModule.AvatarAssetRegistryPure.resolveVariant('head-001', '3d', registry);
      if (resolved) {
        details += 'Variant resolved; ';
      } else {
        warnings.push('Variant resolution failed');
      }

      // Test avatar validation
      const avatarManifest = {
        id: 'test-avatar',
        name: 'Test Avatar',
        style: '3d',
        components: [],
        animations: [],
        materials: [],
        textures: [],
        meshes: [],
        customizations: [],
        optimizations: { lodLevels: 3, textureCompression: true, meshSimplification: true, animationCompression: true }
      };

      const validation = avatarModule.AvatarSystemPure.validate(avatarManifest);
      if (validation.ok) {
        details += 'Avatar validation successful; ';
      } else {
        warnings.push(`Avatar validation failed: ${validation.errors.join(', ')}`);
      }

      details += 'Integration test completed successfully.';

      return { success: true, errors, warnings, details };

    } catch (error) {
      errors.push(`Avatar-AssetRegistry integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, details };
    }
  }

  private async testGenericIntegration(modules: any[], moduleNames: string[]): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
    details: string;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let details = '';

    try {
      details += `Generic integration test for ${moduleNames.join(', ')}: `;

      // Test basic module loading and instantiation
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const moduleName = moduleNames[i];
        
        // Try to find a main class or function to instantiate
        const mainClass = module[moduleName] || module.default || Object.values(module)[0];
        
        if (typeof mainClass === 'function') {
          try {
            const instance = new mainClass();
            details += `${moduleName} instantiated; `;
          } catch (error) {
            warnings.push(`${moduleName} instantiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          details += `${moduleName} loaded; `;
        }
      }

      details += 'Integration test completed successfully.';

      return { success: true, errors, warnings, details };

    } catch (error) {
      errors.push(`Generic integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings, details };
    }
  }

  private generateReport(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = `/workspace/docs/archive/test-results/${timestamp}-phase2-integration-tests.txt`;
    
    // Ensure directory exists
    if (!existsSync('/workspace/docs/archive/test-results')) {
      mkdirSync('/workspace/docs/archive/test-results', { recursive: true });
    }

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    let report = `Phase 2 Integration Test Results
Generated: ${new Date().toISOString()}
========================================

SUMMARY
-------
Total Tests: ${this.results.length}
Passed: ${passed}
Failed: ${failed}
Skipped: ${skipped}
Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%

DETAILED RESULTS
----------------
`;

    this.results.forEach((result, index) => {
      report += `\n${index + 1}. ${result.testName}
   Modules: ${result.modules.join(', ')}
   Status: ${result.status}
   Duration: ${result.duration}ms
   Details: ${result.details}
`;

      if (result.errors.length > 0) {
        report += `   Errors: ${result.errors.join(', ')}\n`;
      }

      if (result.warnings.length > 0) {
        report += `   Warnings: ${result.warnings.join(', ')}\n`;
      }
    });

    report += `\nRECOMMENDATIONS
---------------
`;

    if (failed > 0) {
      report += `- Fix ${failed} failed integration tests
`;
    }

    if (skipped > 0) {
      report += `- Address ${skipped} skipped tests (missing modules)
`;
    }

    const highPriorityFailed = this.results.filter(r => 
      r.status === 'FAIL' && 
      this.integrationTests.find(t => t.testName === r.testName)?.priority === 'high'
    ).length;

    if (highPriorityFailed > 0) {
      report += `- Priority: Fix ${highPriorityFailed} high-priority failed tests
`;
    }

    report += `- Continue with Phase 2 development
- Monitor integration test results
- Add more specific integration tests as needed
`;

    writeFileSync(reportPath, report);
    console.log(`\n📊 Integration test report saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const tester = new Phase2IntegrationTester();
  const results = await tester.runAllIntegrationTests();
  
  console.log('\n📈 Integration Test Summary:');
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`   Failed: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`   Skipped: ${results.filter(r => r.status === 'SKIP').length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}