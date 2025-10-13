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

    console.info('🔬 FusionPure CLI - AAA Spirit Fusion System');
    console.info('Type "help" for available commands or "quit" to exit.\n');
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
      console.info(`✨ Fusion successful! New spirit: ${data.resultSpiritId}`);
      console.info(`   Species A: ${data.spiritAId}`);
      console.info(`   Species B: ${data.spiritBId}`);
    });
  }

  private handleCreateSpirit(args: string[]): void {
    if (args.length < 2) {
      console.info('Usage: create-spirit <species> <level>');
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

    console.info(`✅ Spirit created: ${spirit.name}`);
    console.info(`   ID: ${spirit.instanceId}`);
    console.info(`   Species: ${spirit.speciesId}`);
    console.info(`   Level: ${spirit.level}`);
    console.info(`   Type: ${spirit.type}`);
  }

  private handleListSpirits(args: string[]): void {
    console.info('\n🧬 Available Species for Fusion:');
    console.info('─'.repeat(40));
    console.info('Species          | Type       | Compatible With');
    console.info('─'.repeat(40));

    const species = ['fire_spirit', 'water_spirit', 'grass_spirit', 'electric_spirit', 'poison_spirit', 'steel_spirit'];
    species.forEach(species => {
      const compatible = this.getCompatibleSpecies(species);
      const speciesName = species.padEnd(15);
      const type = this.getSpiritType(species).padEnd(10);
      const compatStr = compatible.slice(0, 3).join(', ');

      console.info(`${speciesName} | ${type} | ${compatStr}`);
    });
    console.info('─'.repeat(40));
  }

  private handleListRules(args: string[]): void {
    const rules = this.rules.getAvailablePairs();

    console.info(`\n🔬 Fusion Rules (${rules.length}):`);
    console.info('─'.repeat(70));
    console.info('Species A       | Species B       | Result          | Success | Energy');
    console.info('─'.repeat(70));

    rules.forEach(rule => {
      const speciesA = rule.speciesA.padEnd(15);
      const speciesB = rule.speciesB.padEnd(15);
      const result = rule.resultSpeciesId.padEnd(15);
      const success = `${rule.successRate}%`.padEnd(7);
      const energy = rule.energyCost.toString().padEnd(6);

      console.info(`${speciesA} | ${speciesB} | ${result} | ${success} | ${energy}`);
    });
    console.info('─'.repeat(70));
  }

  private handleCheckFusion(args: string[]): void {
    if (args.length < 2) {
      console.info('Usage: check-fusion <speciesA> <speciesB>');
      return;
    }

    const [speciesA, speciesB] = args;
    const validation = this.rules.validateRuleCompatibility(speciesA, speciesB);

    console.info(`\n🔍 Fusion Compatibility: ${speciesA} + ${speciesB}`);
    console.info('─'.repeat(50));

    if (validation.compatible) {
      console.info('✅ Compatible!');
      if (validation.rule) {
        console.info(`   Result: ${validation.rule.resultSpeciesId}`);
        console.info(`   Success Rate: ${validation.rule.successRate}%`);
        console.info(`   Energy Cost: ${validation.rule.energyCost}`);
      }
    } else {
      console.info('❌ Not Compatible');
      console.info('   Missing Constraints:');
      validation.missingConstraints.forEach(constraint => {
        console.info(`   - ${constraint}`);
      });
      console.info('   Recommendations:');
      validation.recommendations.forEach(rec => {
        console.info(`   - ${rec}`);
      });
    }
    console.info('─'.repeat(50));
  }

  private handleFuse(args: string[]): void {
    if (args.length < 2) {
      console.info('Usage: fuse <spiritIdA> <spiritIdB>');
      return;
    }

    const [spiritIdA, spiritIdB] = args;

    // Create mock spirits for testing
    const spiritA = this.createMockSpirit(spiritIdA.split('_')[0] || 'fire_spirit', 25);
    const spiritB = this.createMockSpirit(spiritIdB.split('_')[0] || 'water_spirit', 25);

    if (!spiritA || !spiritB) {
      console.info('❌ Invalid spirit IDs. Use species names like fire_spirit, water_spirit.');
      return;
    }

    console.info(`🔬 Attempting fusion: ${spiritA.speciesId} + ${spiritB.speciesId}`);
    console.info(`   Spirit A Level: ${spiritA.level}`);
    console.info(`   Spirit B Level: ${spiritB.level}`);
    console.info(`   Player Energy: ${this.context.energy}`);

    const result = this.manager.fuse(spiritA, spiritB);

    if (result.success) {
      console.info(`✅ ${result.message}`);
      if (result.inheritedTraits) {
        console.info('   Inherited Traits:');
        result.inheritedTraits.forEach(trait => {
          console.info(`   - ${trait.name}: ${trait.description}`);
        });
      }
    } else {
      console.info(`❌ ${result.message}`);
    }
  }

  private handleShowStats(args: string[]): void {
    const stats = this.manager.getFusionStats();

    console.info('\n📊 Fusion Statistics:');
    console.info('─'.repeat(30));
    console.info(`Total Fusions: ${stats.totalFusions}`);
    console.info(`Successful: ${stats.successfulFusions}`);
    console.info(`Failed: ${stats.failedFusions}`);
    console.info(`Average Success Rate: ${stats.averageSuccessRate.toFixed(1)}%`);
    console.info(`Unique Combinations: ${stats.uniqueCombinations}`);
    console.info(`Fusion Streak: ${stats.fusionStreak}`);
    console.info(`Best Streak: ${stats.bestStreak}`);
    console.info(`Rare Traits Obtained: ${stats.rareTraitsObtained}`);
    console.info(`Favorite Rule: ${stats.favoriteFusionRule}`);
    console.info('─'.repeat(30));
  }

  private handleShowRulesStats(args: string[]): void {
    const stats = this.rules.getRulesStats();

    console.info('\n🔬 Fusion Rules Statistics:');
    console.info('─'.repeat(35));
    console.info(`Total Rules: ${stats.totalRules}`);
    console.info(`Available Pairs: ${stats.availablePairs}`);
    console.info(`Average Success Rate: ${stats.averageSuccessRate.toFixed(1)}%`);
    console.info(`Average Energy Cost: ${stats.averageEnergyCost.toFixed(1)}`);
    console.info(`Most Used Rule: ${stats.mostUsedRule}`);
    console.info(`Rarest Combination: ${stats.rarestCombination}`);
    console.info('\nConstraint Types:');
    Object.entries(stats.constraintTypes).forEach(([type, count]) => {
      console.info(`  ${type}: ${count}`);
    });
    console.info('─'.repeat(35));
  }

  private async handleSimulate(args: string[]): Promise<void> {
    const attempts = parseInt(args[0]) || 10;
    console.info(`🧪 Running fusion simulation for ${attempts} attempts...`);

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

    console.info('\n✅ Simulation completed!');
    console.info(`Successful Fusions: ${successCount}/${attempts}`);
    console.info(`Success Rate: ${(successCount / attempts * 100).toFixed(1)}%`);
    console.info(`Energy Spent: ${energySpent}`);
    console.info(`Remaining Energy: ${this.context.energy}`);

    this.showStats([]);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 100;
    console.info(`🔬 Running benchmark with ${operations} operations...`);

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

    console.info(`\n📈 Benchmark Results:`);
    console.info(`   Total Operations: ${operations}`);
    console.info(`   Duration: ${duration.toFixed(2)}ms`);
    console.info(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);

    // Cleanup
    this.context.fusionHistory = [];
  }

  private handleEnergy(args: string[]): void {
    const amount = args[0] ? parseInt(args[0]) : 100;
    this.context.energy = Math.max(0, Math.min(100, amount));

    console.info(`⚡ Energy set to: ${this.context.energy}`);
  }

  private handleHelp(args: string[]): void {
    console.info('\n🛠️ Available Commands:');
    console.info('─'.repeat(50));
    this.commands.forEach((cmd, key) => {
      console.info(`  ${cmd.command.padEnd(40)} | ${cmd.description}`);
    });
    console.info('─'.repeat(50));
  }

  private handleQuit(args: string[]): void {
    console.info('👋 Goodbye!');
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
          console.info(`❌ Unknown command: ${command}. Type "help" for available commands.`);
        }
      }

      if (this.isRunning) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      console.info('CLI session ended.');
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
  console.info('\n👋 Received SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('\n👋 Received SIGTERM. Exiting...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { FusionCli };