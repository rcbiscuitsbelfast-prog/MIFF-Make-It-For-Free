#!/usr/bin/env node

/**
 * FusionPure CLI Harness - AAA Quality Fusion Testing
 *
 * Interactive command-line interface for testing fusion mechanics:
 * - Spirit fusion and combination
 * - Rule validation and constraints
 * - Fusion history and statistics
 * - Trait inheritance testing
 * - Performance benchmarking
 * - Mobile-friendly controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';
import { FusionManager, FusionRules, PlayerContext } from './index.js';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CliCommand {
  command: string;
  description: string;
  handler: (args: string[]) => void;
}

class FusionCli {
  private logger: StructuredLogger;
  private manager: FusionManager;
  private rules: FusionRules;
  private eventBus: EventBus;
  private commands: Map<string, CliCommand> = new Map();
  private isRunning: boolean = true;
  private context: PlayerContext;

  constructor() {
    this.logger = new StructuredLogger({ module: 'FusionCli' });
    this.eventBus = new EventBus();
    this.context = {
      playerId: 'cli_player',
      energy: 100,
      level: 25,
      fusionHistory: [],
      lastFusionTime: 0
    };

    this.manager = new FusionManager(this.eventBus, this.context);
    this.rules = new FusionRules();

    this.setupCommands();
    this.setupEventListeners();

    this.logger.info('🔬 FusionPure CLI - AAA Spirit Fusion System');
    this.logger.info('Type "help" for available commands or "quit" to exit.\n');
  }

  private setupCommands(): void {
    this.commands.set('create-spirit', {
      command: 'create-spirit <species> <level>',
      description: 'Create a test spirit for fusion',
      handler: (args) => this.handleCreateSpirit(args)
    });

    this.commands.set('list-spirits', {
      command: 'list-spirits',
      description: 'List all available spirits',
      handler: (args) => this.handleListSpirits(args)
    });

    this.commands.set('list-rules', {
      command: 'list-rules',
      description: 'List all fusion rules',
      handler: (args) => this.handleListRules(args)
    });

    this.commands.set('check-fusion', {
      command: 'check-fusion <speciesA> <speciesB>',
      description: 'Check if two species can fuse',
      handler: (args) => this.handleCheckFusion(args)
    });

    this.commands.set('fuse', {
      command: 'fuse <spiritIdA> <spiritIdB>',
      description: 'Attempt to fuse two spirits',
      handler: (args) => this.handleFuse(args)
    });

    this.commands.set('show-stats', {
      command: 'show-stats',
      description: 'Display fusion statistics',
      handler: (args) => this.handleShowStats(args)
    });

    this.commands.set('show-rules-stats', {
      command: 'show-rules-stats',
      description: 'Display fusion rules statistics',
      handler: (args) => this.handleShowRulesStats(args)
    });

    this.commands.set('simulate', {
      command: 'simulate <attempts>',
      description: 'Run automated fusion simulation',
      handler: (args) => this.handleSimulate(args)
    });

    this.commands.set('benchmark', {
      command: 'benchmark <operations>',
      description: 'Run performance benchmark',
      handler: (args) => this.handleBenchmark(args)
    });

    this.commands.set('energy', {
      command: 'energy [amount]',
      description: 'Set player energy level',
      handler: (args) => this.handleEnergy(args)
    });

    this.commands.set('help', {
      command: 'help',
      description: 'Show available commands',
      handler: (args) => this.handleHelp(args)
    });

    this.commands.set('quit', {
      command: 'quit',
      description: 'Exit the CLI',
      handler: (args) => this.handleQuit(args)
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on('fusion:performed', (data) => {
      this.logger.info(`✨ Fusion successful! New spirit: ${data.resultSpiritId}`);
      this.logger.info(`   Species A: ${data.spiritAId}`);
      this.logger.info(`   Species B: ${data.spiritBId}`);
    });
  }

  private handleCreateSpirit(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: create-spirit <species> <level>');
      return;
    }

    const [species, levelStr] = args;
    const level = parseInt(levelStr) || 1;

    // Create a mock spirit for testing
    const spirit = {
      instanceId: `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      speciesId: species,
      level: level,
      name: `${species.charAt(0).toUpperCase() + species.slice(1)} Spirit`,
      type: this.getSpiritType(species)
    };

    this.logger.info(`✅ Spirit created: ${spirit.name}`);
    this.logger.info(`   ID: ${spirit.instanceId}`);
    this.logger.info(`   Species: ${spirit.speciesId}`);
    this.logger.info(`   Level: ${spirit.level}`);
    this.logger.info(`   Type: ${spirit.type}`);
  }

  private handleListSpirits(args: string[]): void {
    this.logger.info('\n🧬 Available Species for Fusion:');
    this.logger.info('─'.repeat(40));
    this.logger.info('Species          | Type       | Compatible With');
    this.logger.info('─'.repeat(40));

    const species = ['fire_spirit', 'water_spirit', 'grass_spirit', 'electric_spirit', 'poison_spirit', 'steel_spirit'];
    species.forEach(species => {
      const compatible = this.getCompatibleSpecies(species);
      const speciesName = species.padEnd(15);
      const type = this.getSpiritType(species).padEnd(10);
      const compatStr = compatible.slice(0, 3).join(', ');

      this.logger.info(`${speciesName} | ${type} | ${compatStr}`);
    });
    this.logger.info('─'.repeat(40));
  }

  private handleListRules(args: string[]): void {
    const rules = this.rules.getAvailablePairs();

    this.logger.info(`\n🔬 Fusion Rules (${rules.length}):`);
    this.logger.info('─'.repeat(70));
    this.logger.info('Species A       | Species B       | Result          | Success | Energy');
    this.logger.info('─'.repeat(70));

    rules.forEach(rule => {
      const speciesA = rule.speciesA.padEnd(15);
      const speciesB = rule.speciesB.padEnd(15);
      const result = rule.resultSpeciesId.padEnd(15);
      const success = `${rule.successRate}%`.padEnd(7);
      const energy = rule.energyCost.toString().padEnd(6);

      this.logger.info(`${speciesA} | ${speciesB} | ${result} | ${success} | ${energy}`);
    });
    this.logger.info('─'.repeat(70));
  }

  private handleCheckFusion(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: check-fusion <speciesA> <speciesB>');
      return;
    }

    const [speciesA, speciesB] = args;
    const validation = this.rules.validateRuleCompatibility(speciesA, speciesB);

    this.logger.info(`\n🔍 Fusion Compatibility: ${speciesA} + ${speciesB}`);
    this.logger.info('─'.repeat(50));

    if (validation.compatible) {
      this.logger.info('✅ Compatible!');
      if (validation.rule) {
        this.logger.info(`   Result: ${validation.rule.resultSpeciesId}`);
        this.logger.info(`   Success Rate: ${validation.rule.successRate}%`);
        this.logger.info(`   Energy Cost: ${validation.rule.energyCost}`);
      }
    } else {
      this.logger.info('❌ Not Compatible');
      this.logger.info('   Missing Constraints:');
      validation.missingConstraints.forEach(constraint => {
        this.logger.info(`   - ${constraint}`);
      });
      this.logger.info('   Recommendations:');
      validation.recommendations.forEach(rec => {
        this.logger.info(`   - ${rec}`);
      });
    }
    this.logger.info('─'.repeat(50));
  }

  private handleFuse(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: fuse <spiritIdA> <spiritIdB>');
      return;
    }

    const [spiritIdA, spiritIdB] = args;

    // Create mock spirits for testing
    const spiritA = this.createMockSpirit(spiritIdA.split('_')[0] || 'fire_spirit', 25);
    const spiritB = this.createMockSpirit(spiritIdB.split('_')[0] || 'water_spirit', 25);

    if (!spiritA || !spiritB) {
      this.logger.info('❌ Invalid spirit IDs. Use species names like fire_spirit, water_spirit.');
      return;
    }

    this.logger.info(`🔬 Attempting fusion: ${spiritA.speciesId} + ${spiritB.speciesId}`);
    this.logger.info(`   Spirit A Level: ${spiritA.level}`);
    this.logger.info(`   Spirit B Level: ${spiritB.level}`);
    this.logger.info(`   Player Energy: ${this.context.energy}`);

    const result = this.manager.fuse(spiritA, spiritB);

    if (result.success) {
      this.logger.info(`✅ ${result.message}`);
      if (result.inheritedTraits) {
        this.logger.info('   Inherited Traits:');
        result.inheritedTraits.forEach(trait => {
          this.logger.info(`   - ${trait.name}: ${trait.description}`);
        });
      }
    } else {
      this.logger.info(`❌ ${result.message}`);
    }
  }

  private handleShowStats(args: string[]): void {
    const stats = this.manager.getFusionStats();

    this.logger.info('\n📊 Fusion Statistics:');
    this.logger.info('─'.repeat(30));
    this.logger.info(`Total Fusions: ${stats.totalFusions}`);
    this.logger.info(`Successful: ${stats.successfulFusions}`);
    this.logger.info(`Failed: ${stats.failedFusions}`);
    this.logger.info(`Average Success Rate: ${stats.averageSuccessRate.toFixed(1)}%`);
    this.logger.info(`Unique Combinations: ${stats.uniqueCombinations}`);
    this.logger.info(`Fusion Streak: ${stats.fusionStreak}`);
    this.logger.info(`Best Streak: ${stats.bestStreak}`);
    this.logger.info(`Rare Traits Obtained: ${stats.rareTraitsObtained}`);
    this.logger.info(`Favorite Rule: ${stats.favoriteFusionRule}`);
    this.logger.info('─'.repeat(30));
  }

  private handleShowRulesStats(args: string[]): void {
    const stats = this.rules.getRulesStats();

    this.logger.info('\n🔬 Fusion Rules Statistics:');
    this.logger.info('─'.repeat(35));
    this.logger.info(`Total Rules: ${stats.totalRules}`);
    this.logger.info(`Available Pairs: ${stats.availablePairs}`);
    this.logger.info(`Average Success Rate: ${stats.averageSuccessRate.toFixed(1)}%`);
    this.logger.info(`Average Energy Cost: ${stats.averageEnergyCost.toFixed(1)}`);
    this.logger.info(`Most Used Rule: ${stats.mostUsedRule}`);
    this.logger.info(`Rarest Combination: ${stats.rarestCombination}`);
    this.logger.info('\nConstraint Types:');
    Object.entries(stats.constraintTypes).forEach(([type, count]) => {
      this.logger.info(`  ${type}: ${count}`);
    });
    this.logger.info('─'.repeat(35));
  }

  private async handleSimulate(args: string[]): Promise<void> {
    const attempts = parseInt(args[0]) || 10;
    this.logger.info(`🧪 Running fusion simulation for ${attempts} attempts...`);

    const species = ['fire_spirit', 'water_spirit', 'grass_spirit', 'electric_spirit', 'poison_spirit', 'steel_spirit'];
    let successCount = 0;
    let energySpent = 0;

    for (let i = 0; i < attempts; i++) {
      const speciesA = species[Math.floor(Math.random() * species.length)];
      const speciesB = species[Math.floor(Math.random() * species.length)];

      const spiritA = this.createMockSpirit(speciesA, 10 + Math.random() * 20);
      const spiritB = this.createMockSpirit(speciesB, 10 + Math.random() * 20);

      const rule = this.rules.findMatch(speciesA, speciesB);
      if (rule && this.context.energy >= rule.energyCost) {
        const result = this.manager.fuse(spiritA, spiritB);
        if (result.success) {
          successCount++;
          energySpent += rule.energyCost;
        }
      }

      // Regenerate energy occasionally
      if (Math.random() < 0.3) {
        this.context.energy = Math.min(100, this.context.energy + 20);
      }

      await this.sleep(100); // Brief pause between attempts
    }

    this.logger.info('\n✅ Simulation completed!');
    this.logger.info(`Successful Fusions: ${successCount}/${attempts}`);
    this.logger.info(`Success Rate: ${(successCount / attempts * 100).toFixed(1)}%`);
    this.logger.info(`Energy Spent: ${energySpent}`);
    this.logger.info(`Remaining Energy: ${this.context.energy}`);

    this.showStats([]);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 100;
    this.logger.info(`🔬 Running benchmark with ${operations} operations...`);

    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
      // Test rule validation
      this.rules.findMatch('fire_spirit', 'water_spirit');

      // Test constraint checking
      this.rules.constraintsMet(
        { speciesA: 'fire_spirit', speciesB: 'water_spirit', minCombinedSync: 20, energyCost: 50 } as any,
        this.context,
        'spirit1',
        'spirit2'
      );

      // Test fusion history tracking
      this.context.fusionHistory.push(`fire_spirit+water_spirit_${i}`);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const opsPerSecond = (operations / duration) * 1000;

    this.logger.info(`\n📈 Benchmark Results:`);
    this.logger.info(`   Total Operations: ${operations}`);
    this.logger.info(`   Duration: ${duration.toFixed(2)}ms`);
    this.logger.info(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);

    // Cleanup
    this.context.fusionHistory = [];
  }

  private handleEnergy(args: string[]): void {
    const amount = args[0] ? parseInt(args[0]) : 100;
    this.context.energy = Math.max(0, Math.min(100, amount));

    this.logger.info(`⚡ Energy set to: ${this.context.energy}`);
  }

  private handleHelp(args: string[]): void {
    this.logger.info('\n🛠️ Available Commands:');
    this.logger.info('─'.repeat(50));
    this.commands.forEach((cmd, key) => {
      this.logger.info(`  ${cmd.command.padEnd(40)} | ${cmd.description}`);
    });
    this.logger.info('─'.repeat(50));
  }

  private handleQuit(args: string[]): void {
    this.logger.info('👋 Goodbye!');
    this.isRunning = false;
  }

  private createMockSpirit(speciesId: string, level: number): any {
    return {
      instanceId: `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      speciesId: speciesId,
      level: level,
      name: `${speciesId.charAt(0).toUpperCase() + speciesId.slice(1)} Spirit`
    };
  }

  private getSpiritType(species: string): string {
    const typeMap: Record<string, string> = {
      'fire_spirit': 'Fire',
      'water_spirit': 'Water',
      'grass_spirit': 'Grass',
      'electric_spirit': 'Electric',
      'poison_spirit': 'Poison',
      'steel_spirit': 'Steel'
    };

    return typeMap[species] || 'Normal';
  }

  private getCompatibleSpecies(species: string): string[] {
    const compatMap: Record<string, string[]> = {
      'fire_spirit': ['water_spirit', 'grass_spirit', 'electric_spirit'],
      'water_spirit': ['fire_spirit', 'grass_spirit', 'electric_spirit'],
      'grass_spirit': ['fire_spirit', 'water_spirit', 'poison_spirit'],
      'electric_spirit': ['water_spirit', 'steel_spirit'],
      'poison_spirit': ['grass_spirit'],
      'steel_spirit': ['electric_spirit']
    };

    return compatMap[species] || [];
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async run(): Promise<void> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'fusion> '
    });

    rl.prompt();

    rl.on('line', (line) => {
      const input = line.trim();
      if (input) {
        const [command, ...args] = input.split(' ');
        const cmd = this.commands.get(command);

        if (cmd) {
          cmd.handler(args);
        } else {
          this.logger.info(`❌ Unknown command: ${command}. Type "help" for available commands.`);
        }
      }

      if (this.isRunning) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      this.logger.info('CLI session ended.');
      process.exit(0);
    });
  }
}

// CLI entry point
async function main() {
  const cli = new FusionCli();
  await cli.run();
}

// Handle process termination
process.on('SIGINT', () => {
  this.logger.info('\n👋 Received SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  this.logger.info('\n👋 Received SIGTERM. Exiting...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FusionCli };