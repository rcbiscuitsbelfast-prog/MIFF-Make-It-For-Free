/**
 * EvolutionPure CLI Harness
 *
 * Command-line interface for the EvolutionPure module, providing interactive
 * evolution management, species registration, and evolution testing capabilities.
 *
 * @module EvolutionPure/CLI
 * @version 1.0.0
 * @license MIT
 */

import * as readline from 'readline';
import { EvolutionManager, EvolutionCondition, SpeciesEvolutionData, EvolutionUtils, EvolutionStatus, EvolutionConditionType, TimeOfDay, IPlayerContext } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

/**
 * CLI Harness for EvolutionPure
 */
export class EvolutionPureCLI {
  private logger: StructuredLogger;
  private evolutionManager: EvolutionManager;
  private rl: readline.Interface;
  private isRunning: boolean = false;
  private mockContext: IPlayerContext;

  constructor() {
    this.logger = new StructuredLogger({ module: 'EvolutionPureCLI' });
    this.mockContext = EvolutionUtils.createMockPlayerContext();
    this.evolutionManager = EvolutionManager.create(this.mockContext);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.initializeDemoData();
  }

  /**
   * Initialize demo evolution data
   */
  private initializeDemoData(): void {
    // Create a demo evolution chain: Basic -> Intermediate -> Advanced
    const basicEvolutions = EvolutionUtils.createLevelEvolutionChain('basic_spirit', [10, 25]);
    basicEvolutions.forEach(evolution => this.evolutionManager.registerSpeciesEvolution(evolution));

    // Create item-based evolutions
    const itemEvolutions = EvolutionUtils.createItemEvolutions({
      'fire_spirit': 'fire_stone',
      'water_spirit': 'water_stone',
      'grass_spirit': 'leaf_stone'
    });
    itemEvolutions.forEach(evolution => this.evolutionManager.registerSpeciesEvolution(evolution));

    // Create sync-based evolutions
    const syncEvolutions = EvolutionUtils.createSyncEvolutions({
      'psychic_spirit': 70,
      'dragon_spirit': 85,
      'fairy_spirit': 60
    });
    syncEvolutions.forEach(evolution => this.evolutionManager.registerSpeciesEvolution(evolution));

    // Create complex evolutions with multiple conditions
    const complexEvolution = new SpeciesEvolutionData('starter_spirit', 'legendary_spirit', [
      EvolutionCondition.levelAtLeast(50),
      EvolutionCondition.syncAtLeast(80),
      EvolutionCondition.requiresItem('legendary_crystal'),
      EvolutionCondition.loreFlag('defeated_boss')
    ]);
    this.evolutionManager.registerSpeciesEvolution(complexEvolution);
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info('🧬 EvolutionPure CLI - Spirit Evolution System');
    this.logger.info('Type "help" for commands or "exit" to quit.\n');

    while (this.isRunning) {
      const input = await this.prompt('evolution> ');
      await this.processCommand(input);
    }
  }

  /**
   * Stop the CLI
   */
  stop(): void {
    this.isRunning = false;
    this.rl.close();
    this.logger.info('👋 EvolutionPure CLI stopped.');
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    const parts = input.trim().split(' ');
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
          this.showHelp();
          break;
        case 'exit':
        case 'quit':
          this.stop();
          break;
        case 'create':
          await this.createSpirit(args);
          break;
        case 'evolve':
          await this.evolveSpirit(args);
          break;
        case 'check':
          this.checkEvolution(args);
          break;
        case 'list':
          this.listSpecies();
          break;
        case 'register':
          await this.registerEvolution(args);
          break;
        case 'chain':
          this.showEvolutionChain(args);
          break;
        case 'stats':
          this.showStatistics();
          break;
        case 'validate':
          this.validateData();
          break;
        case 'demo':
          this.runDemo();
          break;
        case 'clear':
          console.clear();
          break;
        default:
          this.logger.info('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('\n🧬 EvolutionPure Commands:');
    this.logger.info('  help                    - Show this help message');
    this.logger.info('  exit/quit               - Exit the CLI');
    this.logger.info('  clear                   - Clear the console');
    this.logger.info('');
    this.logger.info('  create <name> <type> <level> - Create a test spirit');
    this.logger.info('  evolve <spirit_id>      - Attempt to evolve a spirit');
    this.logger.info('  check <species_id>      - Check evolution possibilities');
    this.logger.info('  list                    - List all registered species');
    this.logger.info('  register <species> <target> - Register simple evolution');
    this.logger.info('  chain <species_id>      - Show evolution chain');
    this.logger.info('  stats                   - Show evolution statistics');
    this.logger.info('  validate                - Validate all evolution data');
    this.logger.info('  demo                    - Run evolution demo');
    this.logger.info('');
    this.logger.info('💡 Examples:');
    this.logger.info('  create "Fire Spirit" fire 25');
    this.logger.info('  evolve fire_spirit');
    this.logger.info('  register "basic_spirit" "intermediate_spirit"');
    this.logger.info('  chain "basic_spirit"');
  }

  /**
   * Create a test spirit
   */
  private async createSpirit(args: string[]): Promise<void> {
    if (args.length < 3) {
      this.logger.info('❌ Usage: create <name> <type> <level>');
      return;
    }

    const name = args[0];
    const type = args[1];
    const level = parseInt(args[2], 10);

    if (level <= 0 || level > 100) {
      this.logger.info('❌ Level must be between 1 and 100');
      return;
    }

    const speciesId = name.toLowerCase().replace(/\s+/g, '_');
    const spirit = EvolutionUtils.createMockSpirit(speciesId, level, {
      speciesId,
      hasItem: (itemId: string) => {
        const inventory = this.mockContext.getInventory();
        return inventory.get(itemId) > 0;
      }
    });

    this.logger.info(`✅ Created spirit: ${name} (${type}, Level ${level})`);
    this.logger.info(`   Species ID: ${speciesId}`);
    this.logger.info(`   Instance ID: ${spirit.instanceId}`);

    // Check evolution possibilities
    const canEvolve = this.evolutionManager.canEvolve(spirit);
    const target = this.evolutionManager.getEvolutionTarget(spirit);

    if (canEvolve && target) {
      this.logger.info(`   🌟 Can evolve to: ${target}`);
    } else {
      this.logger.info('   📍 No evolution available');
    }
  }

  /**
   * Attempt to evolve a spirit
   */
  private async evolveSpirit(args: string[]): Promise<void> {
    if (args.length < 1) {
      this.logger.info('❌ Usage: evolve <spirit_id>');
      return;
    }

    const spiritId = args[0];
    const spirit = EvolutionUtils.createMockSpirit(spiritId, 1);

    this.logger.info(`🔄 Attempting to evolve: ${spiritId}`);

    const result = this.evolutionManager.evolveSpirit(spirit);

    this.logger.info(`Result: ${result.toString()}`);

    if (result.isSuccess) {
      this.logger.info('🎉 Evolution successful!');
      this.logger.info(`   New species: ${result.newSpeciesId}`);

      // Show next evolution if available
      const nextTarget = this.evolutionManager.getEvolutionTarget(spirit);
      if (nextTarget) {
        this.logger.info(`   Next evolution available: ${nextTarget}`);
      }
    } else {
      this.logger.info('❌ Evolution failed');
      switch (result.status) {
        case EvolutionStatus.CONDITIONS_NOT_MET:
          this.logger.info('   💡 Try meeting the evolution requirements');
          break;
        case EvolutionStatus.ALREADY_EVOLVED:
          this.logger.info('   ✨ Spirit is already at its final evolution');
          break;
        case EvolutionStatus.INVALID_SPIRIT:
          this.logger.info('   💡 Spirit not found or invalid');
          break;
      }
    }
  }

  /**
   * Check evolution possibilities for a species
   */
  private checkEvolution(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('❌ Usage: check <species_id>');
      return;
    }

    const speciesId = args[0];
    const spirit = EvolutionUtils.createMockSpirit(speciesId, 1);

    this.logger.info(`🔍 Checking evolution for: ${speciesId}`);

    const canEvolve = this.evolutionManager.canEvolve(spirit);
    const target = this.evolutionManager.getEvolutionTarget(spirit);
    const availableEvolutions = this.evolutionManager.getAvailableEvolutions(spirit);

    this.logger.info(`Can evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);

    if (target) {
      this.logger.info(`Evolution target: ${target}`);
    }

    if (availableEvolutions.length > 0) {
      this.logger.info('Available evolutions:');
      availableEvolutions.forEach(evolution => {
        this.logger.info(`  • ${evolution}`);
      });
    }

    // Show requirements
    const requirements = EvolutionUtils.getEvolutionRequirements(this.evolutionManager, speciesId);
    if (requirements.targetSpecies) {
      this.logger.info(`\n📋 Requirements for ${requirements.targetSpecies}:`);
      requirements.conditions.forEach((condition: any) => {
        this.logger.info(`  • ${condition.description}`);
      });
    }
  }

  /**
   * List all registered species
   */
  private listSpecies(): void {
    const stats = this.evolutionManager.getEvolutionStatistics();

    this.logger.info('\n🧬 Registered Species:');
    this.logger.info(`Total species: ${stats.totalSpecies}`);
    this.logger.info(`Evolvable species: ${stats.evolvableSpecies}`);
    this.logger.info(`Total evolutions: ${stats.totalEvolutions}`);
    this.logger.info(`Max chain length: ${stats.maxChainLength}`);

    this.logger.info('\nSpecies with evolutions:');
    for (const [speciesId, data] of this.evolutionManager['speciesData']) {
      if (data.evolutionTargetId) {
        this.logger.info(`  ${speciesId} → ${data.evolutionTargetId}`);
      }
    }

    this.logger.info('\nConditions by type:');
    Object.entries(stats.conditionsByType).forEach(([type, count]) => {
      this.logger.info(`  ${type}: ${count}`);
    });
  }

  /**
   * Register simple evolution
   */
  private async registerEvolution(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: register <species> <target> [condition_type] [value]');
      this.logger.info('Condition types: level, item, sync, friendship, battles');
      return;
    }

    const speciesId = args[0];
    const targetId = args[1];
    const conditionType = args[2]?.toLowerCase();
    const value = args[3];

    let condition: EvolutionCondition | null = null;

    switch (conditionType) {
      case 'level':
        const level = parseInt(value, 10);
        if (level > 0) {
          condition = EvolutionCondition.levelAtLeast(level);
          this.logger.info(`✅ Registered level evolution: ${speciesId} → ${targetId} (Level ${level})`);
        }
        break;

      case 'item':
        if (value) {
          condition = EvolutionCondition.requiresItem(value);
          this.logger.info(`✅ Registered item evolution: ${speciesId} → ${targetId} (Item: ${value})`);
        }
        break;

      case 'sync':
        const syncLevel = parseInt(value, 10);
        if (syncLevel >= 0 && syncLevel <= 100) {
          condition = EvolutionCondition.syncAtLeast(syncLevel);
          this.logger.info(`✅ Registered sync evolution: ${speciesId} → ${targetId} (Sync: ${syncLevel}%)`);
        }
        break;

      case 'friendship':
        const friendship = parseInt(value, 10);
        if (friendship >= 0 && friendship <= 100) {
          condition = EvolutionCondition.friendshipLevel(friendship);
          this.logger.info(`✅ Registered friendship evolution: ${speciesId} → ${targetId} (Friendship: ${friendship})`);
        }
        break;

      case 'battles':
        const battleCount = parseInt(value, 10);
        if (battleCount >= 0) {
          condition = EvolutionCondition.battleCount(battleCount);
          this.logger.info(`✅ Registered battle evolution: ${speciesId} → ${targetId} (Battles: ${battleCount})`);
        }
        break;

      default:
        this.logger.info(`✅ Registered unconditional evolution: ${speciesId} → ${targetId}`);
    }

    const evolutionData = new SpeciesEvolutionDataImpl(
      speciesId,
      targetId,
      condition ? [condition] : []
    );

    this.evolutionManager.registerSpeciesEvolution(evolutionData);
  }

  /**
   * Show evolution chain for species
   */
  private showEvolutionChain(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('❌ Usage: chain <species_id>');
      return;
    }

    const speciesId = args[0];
    const chain = this.evolutionManager.getEvolutionChain(speciesId);

    this.logger.info(`\n🧬 Evolution Chain for ${speciesId}:`);
    if (chain.length === 1) {
      this.logger.info('  No evolutions found');
      return;
    }

    chain.forEach((species, index) => {
      const prefix = index === 0 ? '  ' : '  → ';
      this.logger.info(`${prefix}${species}`);
    });

    this.logger.info(`\n📊 Chain Statistics:`);
    this.logger.info(`  Length: ${chain.length}`);
    this.logger.info(`  Starting species: ${chain[0]}`);
    this.logger.info(`  Final evolution: ${chain[chain.length - 1]}`);
  }

  /**
   * Show evolution statistics
   */
  private showStatistics(): void {
    const stats = this.evolutionManager.getEvolutionStatistics();

    this.logger.info('\n📊 Evolution System Statistics:');
    this.logger.info(`Total Species: ${stats.totalSpecies}`);
    this.logger.info(`Evolvable Species: ${stats.evolvableSpecies}`);
    this.logger.info(`Total Evolutions: ${stats.totalEvolutions}`);
    this.logger.info(`Max Chain Length: ${stats.maxChainLength}`);

    this.logger.info('\n📋 Conditions Breakdown:');
    Object.entries(stats.conditionsByType).forEach(([conditionType, count]) => {
      this.logger.info(`  ${conditionType}: ${count}`);
    });

    if (stats.totalSpecies === 0) {
      this.logger.info('\n💡 No species registered. Try "register" command or "demo" for examples.');
    }
  }

  /**
   * Validate all evolution data
   */
  private validateData(): void {
    const errors = this.evolutionManager.validateEvolutionData();

    if (errors.length === 0) {
      this.logger.info('✅ All evolution data is valid!');
    } else {
      this.logger.info('❌ Evolution data validation errors:');
      errors.forEach((error, index) => {
        this.logger.info(`  ${index + 1}. ${error}`);
      });
    }
  }

  /**
   * Run evolution demo
   */
  private runDemo(): void {
    this.logger.info('🚀 Running EvolutionPure Demo...\n');

    // Create demo spirits
    const spirits = [
      EvolutionUtils.createMockSpirit('demo_basic', 5),
      EvolutionUtils.createMockSpirit('demo_fire', 1, {
        hasItem: (itemId: string) => itemId === 'fire_stone'
      }),
      EvolutionUtils.createMockSpirit('demo_psychic', 1, {
        getSyncPercentage: () => 75
      }),
      EvolutionUtils.createMockSpirit('demo_starter', 50, {
        hasItem: (itemId: string) => itemId === 'legendary_crystal'
      })
    ];

    // Test different evolution scenarios
    const scenarios = [
      { name: 'Level Evolution', spirit: spirits[0], expected: 'Can evolve via level' },
      { name: 'Item Evolution', spirit: spirits[1], expected: 'Cannot evolve (no fire stone)' },
      { name: 'Sync Evolution', spirit: spirits[2], expected: 'Can evolve via sync' },
      { name: 'Complex Evolution', spirit: spirits[3], expected: 'Can evolve (high level + item)' }
    ];

    scenarios.forEach((scenario, index) => {
      this.logger.info(`\n${index + 1}. ${scenario.name}:`);
      this.logger.info(`   Species: ${scenario.spirit.speciesId}`);
      this.logger.info(`   Level: ${scenario.spirit.level}`);

      const canEvolve = this.evolutionManager.canEvolve(scenario.spirit);
      const target = this.evolutionManager.getEvolutionTarget(scenario.spirit);

      this.logger.info(`   Can Evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);
      if (target) {
        this.logger.info(`   Target: ${target}`);
      }

      // Try evolution
      const result = this.evolutionManager.evolveSpirit(scenario.spirit);
      this.logger.info(`   Result: ${result.toString()}`);
    });

    this.logger.info('\n📋 Demo Summary:');
    this.logger.info('  • Level-based evolutions require reaching specific levels');
    this.logger.info('  • Item-based evolutions require specific items');
    this.logger.info('  • Sync-based evolutions require high sync percentages');
    this.logger.info('  • Complex evolutions can require multiple conditions');
    this.logger.info('\n💡 Try: create "My Spirit" normal 25');
    this.logger.info('💡 Try: check basic_spirit');
    this.logger.info('💡 Try: evolve basic_spirit');
  }

  /**
   * Prompt user for input
   */
  private prompt(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}

/**
 * CLI utility functions
 */
export const EvolutionPureCLIUtils = {
  /**
   * Create and start CLI
   */
  async runCLI(): Promise<void> {
    const cli = new EvolutionPureCLI();
    await cli.start();
  },

  /**
   * Run CLI in demo mode
   */
  async runDemo(): Promise<void> {
    const cli = new EvolutionPureCLI();
    cli.runDemo();
    await cli.start();
  },

  /**
   * Create evolution manager from CLI arguments
   */
  createManagerFromArgs(args: string[]): EvolutionManager | null {
    if (args.length < 1) {
      this.logger.error('❌ Usage: --create-manager <player_id>');
      return null;
    }

    const context = EvolutionUtils.createMockPlayerContext();
    return EvolutionManager.create(context);
  },

  /**
   * Register evolution from CLI arguments
   */
  registerEvolutionFromArgs(manager: EvolutionManager, args: string[]): boolean {
    if (args.length < 2) {
      this.logger.error('❌ Usage: --register-evolution <species> <target> [condition_type] [value]');
      return false;
    }

    const speciesId = args[0];
    const targetId = args[1];
    const conditionType = args[2]?.toLowerCase();
    const value = args[3];

    let condition: EvolutionCondition | null = null;

    switch (conditionType) {
      case 'level':
        const level = parseInt(value, 10);
        if (level > 0) {
          condition = EvolutionCondition.levelAtLeast(level);
          this.logger.info(`✅ Registered level evolution: ${speciesId} → ${targetId} (Level ${level})`);
        }
        break;

      case 'item':
        if (value) {
          condition = EvolutionCondition.requiresItem(value);
          this.logger.info(`✅ Registered item evolution: ${speciesId} → ${targetId} (Item: ${value})`);
        }
        break;

      case 'sync':
        const syncLevel = parseInt(value, 10);
        if (syncLevel >= 0 && syncLevel <= 100) {
          condition = EvolutionCondition.syncAtLeast(syncLevel);
          this.logger.info(`✅ Registered sync evolution: ${speciesId} → ${targetId} (Sync: ${syncLevel}%)`);
        }
        break;

      default:
        this.logger.info(`✅ Registered unconditional evolution: ${speciesId} → ${targetId}`);
    }

    const evolutionData = new SpeciesEvolutionData(
      speciesId,
      targetId,
      condition ? [condition] : []
    );

    manager.registerSpeciesEvolution(evolutionData);
    return true;
  },

  /**
   * Test evolution from CLI arguments
   */
  testEvolutionFromArgs(manager: EvolutionManager, args: string[]): void {
    if (args.length < 1) {
      this.logger.error('❌ Usage: --test-evolution <species_id>');
      return;
    }

    const speciesId = args[0];
    const spirit = EvolutionUtils.createMockSpirit(speciesId, 25);

    this.logger.info(`🧬 Testing evolution for: ${speciesId}`);

    const canEvolve = manager.canEvolve(spirit);
    const target = manager.getEvolutionTarget(spirit);
    const chain = manager.getEvolutionChain(speciesId);

    this.logger.info(`Can Evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);
    if (target) {
      this.logger.info(`Target: ${target}`);
    }

    this.logger.info(`Evolution Chain: ${chain.join(' → ')}`);
  }
};

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--demo')) {
    EvolutionPureCLIUtils.runDemo();
  } else if (args.includes('--help')) {
    this.logger.info('EvolutionPure CLI Usage:');
    this.logger.info('  node cliHarness.ts              - Run interactive CLI');
    this.logger.info('  node cliHarness.ts --demo       - Run demo with sample data');
    this.logger.info('  node cliHarness.ts --help       - Show this help');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  node cliHarness.ts --create-manager "player1"');
    this.logger.info('  node cliHarness.ts --register-evolution "pikachu" "raichu" level 25');
    this.logger.info('  node cliHarness.ts --test-evolution "pikachu"');
  } else {
    EvolutionPureCLIUtils.runCLI();
  }
}