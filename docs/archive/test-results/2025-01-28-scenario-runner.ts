#!/usr/bin/env tsx

/**
 * MIFF Scenario Runner
 * 
 * Comprehensive testing framework for MIFF module integrations
 * Tests real module interactions and CLI functionality
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  scenarioName: string;
  modules: string[];
  commands: string[];
  output: string[];
  status: 'PASS' | 'FAIL' | 'WARNING';
  errors: string[];
  warnings: string[];
  realModules: string[];
  scaffoldedModules: string[];
}

interface ModuleTest {
  name: string;
  hasTest: boolean;
  isReal: boolean;
  errors: string[];
  output: string;
}

class ScenarioRunner {
  private results: TestResult[] = [];
  private realModules: Set<string> = new Set();
  private scaffoldedModules: Set<string> = new Set();
  private cliWarnings: string[] = [];

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [
      '/workspace/docs/archive/test-results',
      '/workspace/docs/archive/test-results/2025-01-28'
    ];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  private runCommand(command: string, timeout: number = 10000): { output: string; success: boolean } {
    try {
      const output = execSync(command, { 
        encoding: 'utf8', 
        timeout,
        cwd: '/workspace'
      });
      return { output: output.trim(), success: true };
    } catch (error: any) {
      return { 
        output: error.message || 'Command failed', 
        success: false 
      };
    }
  }

  private testModule(moduleName: string): ModuleTest {
    this.log(`Testing module: ${moduleName}`);
    
    const modulePath = `/workspace/miff/pure/${moduleName}`;
    const hasTest = existsSync(`${modulePath}/test.ts`) || 
                   existsSync(`${modulePath}/test.js`) ||
                   existsSync(`${modulePath}/cliHarness.ts`) ||
                   existsSync(`${modulePath}/cliHarness.js`);
    
    let isReal = false;
    const errors: string[] = [];
    let output = '';

    // Check if module has real implementation
    try {
      if (existsSync(`${modulePath}/index.ts`)) {
        const content = require('fs').readFileSync(`${modulePath}/index.ts`, 'utf8');
        isReal = content.length > 1000 && !content.includes('TODO') && !content.includes('placeholder');
      }
    } catch (e) {
      errors.push(`Failed to read module: ${e}`);
    }

    // Try to run CLI harness if available
    if (hasTest) {
      const cliCommand = `npx tsx ${modulePath}/cliHarness.ts 2>&1 || echo "CLI harness failed"`;
      const result = this.runCommand(cliCommand, 5000);
      output = result.output;
      
      if (result.success && !output.includes('CLI harness failed')) {
        isReal = true;
      } else {
        errors.push('CLI harness failed or not functional');
      }
    } else {
      errors.push('No test harness found');
    }

    if (isReal) {
      this.realModules.add(moduleName);
    } else {
      this.scaffoldedModules.add(moduleName);
    }

    return {
      name: moduleName,
      hasTest,
      isReal,
      errors,
      output
    };
  }

  private testCombatItemsIntegration(): TestResult {
    this.log('Testing CombatPure + ItemsPure integration');
    
    const result: TestResult = {
      scenarioName: 'CombatPure + ItemsPure',
      modules: ['CombatPure', 'ItemsPure'],
      commands: [],
      output: [],
      status: 'PASS',
      errors: [],
      warnings: [],
      realModules: [],
      scaffoldedModules: []
    };

    // Test CombatPure module
    const combatTest = this.testModule('CombatPure');
    result.realModules.push(...(combatTest.isReal ? ['CombatPure'] : []));
    result.scaffoldedModules.push(...(combatTest.isReal ? [] : ['CombatPure']));
    
    if (combatTest.errors.length > 0) {
      result.errors.push(...combatTest.errors);
      result.status = 'FAIL';
    }

    // Test ItemsPure module
    const itemsTest = this.testModule('ItemsPure');
    result.realModules.push(...(itemsTest.isReal ? ['ItemsPure'] : []));
    result.scaffoldedModules.push(...(itemsTest.isReal ? [] : ['ItemsPure']));
    
    if (itemsTest.errors.length > 0) {
      result.errors.push(...itemsTest.errors);
      result.status = 'FAIL';
    }

    // Test integration
    try {
      const integrationCode = `
import { CombatEngine, SpiritInstance } from '/workspace/miff/pure/CombatPure/engine';
import { Item, ItemEffect, ItemEffectType, ItemUsageManager, ItemType } from '/workspace/miff/pure/ItemsPure/index';

// Create test spirits
const player = new SpiritInstance('1', 'Player', 'player', { hp: 100, maxHp: 100, atk: 50, def: 30, spd: 40 });
const enemy = new SpiritInstance('2', 'Enemy', 'enemy', { hp: 80, maxHp: 80, atk: 45, def: 25, spd: 35 });

// Create test items
const healthPotion = new Item('potion', 'Health Potion', ItemType.CONSUMABLE, new ItemEffect(ItemEffectType.HEAL, 30), 'notfainted');
const attackBoost = new Item('attack_boost', 'Attack Boost', ItemType.CONSUMABLE, new ItemEffect(ItemEffectType.BUFF_ATTACK, 20), 'notfainted');

// Create item manager
const itemManager = new ItemUsageManager({
  playerId: 'player1',
  inventory: { 'potion': 2, 'attack_boost': 1 },
  flags: {}
});

itemManager.registerItem(healthPotion);
itemManager.registerItem(attackBoost);

// Test item usage in combat
console.log('=== Combat + Items Integration Test ===');
console.log('Player HP before:', player.stats.hp);
console.log('Player Attack before:', player.stats.atk);

// Use health potion
const healResult = itemManager.useItem('potion', player);
console.log('Heal result:', healResult.message);
console.log('Player HP after heal:', player.stats.hp);

// Use attack boost
const boostResult = itemManager.useItem('attack_boost', player);
console.log('Boost result:', boostResult.message);
console.log('Player Attack after boost:', player.stats.atk);

// Test combat with items
const engine = new CombatEngine();
engine.addCombatant(player);
engine.addCombatant(enemy);

console.log('\\n=== Combat Engine Test ===');
console.log('Combatants added:', Object.keys(engine.state.combatants).length);
console.log('Turn order:', engine.state.order);

// Simulate attack
engine.enqueueAction({
  actorId: '1',
  type: 'attack',
  targetId: '2',
  source: 'player' as any
});

const turnResult = engine.processTurn();
console.log('Turn result:', turnResult.results);

console.log('\\n=== Integration Test Complete ===');
console.log('Status: SUCCESS');
      `;

      const testFile = '/workspace/test-combat-items.js';
      writeFileSync(testFile, integrationCode);
      
      const integrationResult = this.runCommand(`node ${testFile}`);
      result.commands.push(`node ${testFile}`);
      result.output.push(integrationResult.output);
      
      if (integrationResult.success) {
        result.status = 'PASS';
        this.log('Combat + Items integration test passed', 'success');
      } else {
        result.status = 'FAIL';
        result.errors.push('Integration test failed');
        this.log('Combat + Items integration test failed', 'error');
      }

      // Clean up
      this.runCommand(`rm -f ${testFile}`);
      
    } catch (error: any) {
      result.status = 'FAIL';
      result.errors.push(`Integration test error: ${error.message}`);
      this.log(`Integration test error: ${error.message}`, 'error');
    }

    return result;
  }

  private testCombatTeamsIntegration(): TestResult {
    this.log('Testing CombatPure + TeamsPure integration');
    
    const result: TestResult = {
      scenarioName: 'CombatPure + TeamsPure',
      modules: ['CombatPure', 'TeamsPure'],
      commands: [],
      output: [],
      status: 'PASS',
      errors: [],
      warnings: [],
      realModules: [],
      scaffoldedModules: []
    };

    // Test TeamsPure module
    const teamsTest = this.testModule('TeamsPure');
    result.realModules.push(...(teamsTest.isReal ? ['TeamsPure'] : []));
    result.scaffoldedModules.push(...(teamsTest.isReal ? [] : ['TeamsPure']));
    
    if (teamsTest.errors.length > 0) {
      result.errors.push(...teamsTest.errors);
      result.status = 'FAIL';
    }

    // Test integration
    try {
      const integrationCode = `
import { CombatEngine, SpiritInstance } from '/workspace/miff/pure/CombatPure/engine';
import { TeamManager, Team, TeamUtils } from '/workspace/miff/pure/TeamsPure/index';

console.log('=== Combat + Teams Integration Test ===');

// Create team manager
const teamManager = TeamManager.create();
const team = teamManager.createTeam('Test Team', 3);

// Create test spirits
const spirit1 = TeamUtils.createDefaultSpiritInstance();
spirit1.name = 'Spirit 1';
spirit1.level = 25;
spirit1.stats = { hp: 100, attack: 60, defense: 50, speed: 70 };

const spirit2 = TeamUtils.createDefaultSpiritInstance();
spirit2.name = 'Spirit 2';
spirit2.level = 23;
spirit2.stats = { hp: 90, attack: 55, defense: 45, speed: 65 };

// Add spirits to team
const addResult1 = teamManager.addSpiritToTeam(team.teamId, spirit1);
const addResult2 = teamManager.addSpiritToTeam(team.teamId, spirit2);

console.log('Add spirit 1 result:', addResult1);
console.log('Add spirit 2 result:', addResult2);

// Get team statistics
const stats = teamManager.getTeamStatistics(team.teamId);
console.log('Team stats:', stats);

// Validate team
const validation = teamManager.validateTeam(team.teamId);
console.log('Team validation:', validation.isValid ? 'PASS' : 'FAIL');

// Test combat with team
const engine = new CombatEngine();
const teamSpirits = teamManager.getActiveTeam(team.teamId);

console.log('\\n=== Combat Engine with Team ===');
console.log('Team spirits count:', teamSpirits.length);

// Add team spirits to combat
teamSpirits.forEach(spirit => {
  const combatSpirit = new SpiritInstance(
    spirit.instanceId,
    spirit.name,
    'player',
    { hp: spirit.stats.hp, maxHp: spirit.stats.hp, atk: spirit.stats.attack, def: spirit.stats.defense, spd: spirit.stats.speed }
  );
  engine.addCombatant(combatSpirit);
});

console.log('Combatants in engine:', Object.keys(engine.state.combatants).length);
console.log('Turn order:', engine.state.order);

console.log('\\n=== Integration Test Complete ===');
console.log('Status: SUCCESS');
      `;

      const testFile = '/workspace/test-combat-teams.js';
      writeFileSync(testFile, integrationCode);
      
      const integrationResult = this.runCommand(`node ${testFile}`);
      result.commands.push(`node ${testFile}`);
      result.output.push(integrationResult.output);
      
      if (integrationResult.success) {
        result.status = 'PASS';
        this.log('Combat + Teams integration test passed', 'success');
      } else {
        result.status = 'FAIL';
        result.errors.push('Integration test failed');
        this.log('Combat + Teams integration test failed', 'error');
      }

      // Clean up
      this.runCommand(`rm -f ${testFile}`);
      
    } catch (error: any) {
      result.status = 'FAIL';
      result.errors.push(`Integration test error: ${error.message}`);
      this.log(`Integration test error: ${error.message}`, 'error');
    }

    return result;
  }

  private auditCLI(): void {
    this.log('Auditing CLI commands');
    
    const cliFiles = [
      'cli/miff-cli.ts',
      'cli/miff-export.ts',
      'cli/miff-simulate.ts',
      'cli/miff-world.ts',
      'cli/test-cli.cjs'
    ];

    cliFiles.forEach(file => {
      try {
        const content = require('fs').readFileSync(`/workspace/${file}`, 'utf8');
        
        // Check for placeholders
        if (content.includes('TODO') || content.includes('placeholder') || content.includes('FIXME')) {
          this.cliWarnings.push(`[Warning] ${file} contains placeholders`);
        }
        
        // Check for empty handlers
        if (content.includes('() {') && content.includes('return;')) {
          this.cliWarnings.push(`[Warning] ${file} has empty command handlers`);
        }
        
        // Check for missing implementations
        if (content.includes('not yet implemented') || content.includes('coming soon')) {
          this.cliWarnings.push(`[Warning] ${file} has unimplemented features`);
        }
        
      } catch (error) {
        this.cliWarnings.push(`[Error] Could not read ${file}: ${error}`);
      }
    });
  }

  public async runAllTests(): Promise<void> {
    this.log('Starting MIFF Scenario Runner');
    this.log('============================');
    
    // Audit CLI first
    this.auditCLI();
    
    // Run integration tests
    this.results.push(this.testCombatItemsIntegration());
    this.results.push(this.testCombatTeamsIntegration());
    
    // Generate reports
    this.generateReports();
    
    this.log('Scenario Runner Complete');
    this.log('========================');
  }

  private generateReports(): void {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Generate individual scenario reports
    this.results.forEach(result => {
      const reportContent = `
# ${result.scenarioName} Test Report
Generated: ${new Date().toISOString()}

## Test Summary
- Status: ${result.status}
- Modules: ${result.modules.join(', ')}
- Real Modules: ${result.realModules.join(', ')}
- Scaffolded Modules: ${result.scaffoldedModules.join(', ')}

## Commands Executed
${result.commands.map(cmd => `- ${cmd}`).join('\n')}

## Output
\`\`\`
${result.output.join('\n\n')}
\`\`\`

## Errors
${result.errors.length > 0 ? result.errors.map(err => `- ${err}`).join('\n') : 'None'}

## Warnings
${result.warnings.length > 0 ? result.warnings.map(warn => `- ${warn}`).join('\n') : 'None'}
      `;
      
      const fileName = `${timestamp}-${result.scenarioName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
      writeFileSync(`/workspace/docs/archive/test-results/${fileName}`, reportContent);
    });
    
    // Generate summary report
    const summaryContent = `
# MIFF Scenario Runner Summary
Generated: ${new Date().toISOString()}

## Test Results
Total Scenarios: ${this.results.length}
Passed: ${this.results.filter(r => r.status === 'PASS').length}
Failed: ${this.results.filter(r => r.status === 'FAIL').length}
Warnings: ${this.results.filter(r => r.status === 'WARNING').length}

## Real Modules (${this.realModules.size})
${Array.from(this.realModules).map(m => `- ${m}`).join('\n')}

## Scaffolded Modules (${this.scaffoldedModules.size})
${Array.from(this.scaffoldedModules).map(m => `- ${m}`).join('\n')}

## CLI Warnings
${this.cliWarnings.map(w => `- ${w}`).join('\n')}

## Detailed Results
${this.results.map(r => `
### ${r.scenarioName}
- Status: ${r.status}
- Real Modules: ${r.realModules.join(', ')}
- Scaffolded Modules: ${r.scaffoldedModules.join(', ')}
- Errors: ${r.errors.length}
`).join('\n')}

## Next Steps
1. Implement missing test() methods for scaffolded modules
2. Fix CLI command placeholders
3. Add real module implementations where needed
4. Improve integration testing coverage
    `;
    
    writeFileSync(`/workspace/docs/archive/test-results/${timestamp}-summary.txt`, summaryContent);
    
    // Generate module categorization files
    writeFileSync('/workspace/docs/archive/test-results/realModules.txt', Array.from(this.realModules).join('\n'));
    writeFileSync('/workspace/docs/archive/test-results/scaffoldedModules.txt', Array.from(this.scaffoldedModules).join('\n'));
    
    this.log(`Generated ${this.results.length} scenario reports`);
    this.log(`Real modules: ${this.realModules.size}`);
    this.log(`Scaffolded modules: ${this.scaffoldedModules.size}`);
  }
}

// Run the scenario runner
if (require.main === module) {
  const runner = new ScenarioRunner();
  runner.runAllTests().catch(console.error);
}

export default ScenarioRunner;