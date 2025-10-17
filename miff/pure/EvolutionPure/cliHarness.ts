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

/**
 * CLI Harness for EvolutionPure
 */
export class EvolutionPureCLI {
  private evolutionManager: EvolutionManager;
  private rl: readline?.Interface;
  private isRunning: boolean = false;
  private mockContext: IPlayerContext;

  constructor() {
    this?.mockContext = EvolutionUtils?.createMockPlayerContext();
    this?.evolutionManager = EvolutionManager?.create(this?.mockContext);
    this?.rl = readline?.createInterface({
      input: process?.stdin,
      output: process?.stdout
    });

    this?.initializeDemoData();
  }

  /**
   * Initialize demo evolution data
   */
  private initializeDemoData(): void {
    // Create a demo evolution chain: Basic -> Intermediate -> Advanced
    const basicEvolutions = EvolutionUtils?.createLevelEvolutionChain('basic_spirit', [10, 25]);
    basicEvolutions?.forEach((evolution: any) => this?.evolutionManager.registerSpeciesEvolution(evolution));

    // Create item-based evolutions
    const itemEvolutions = EvolutionUtils?.createItemEvolutions({
      'fire_spirit': 'fire_stone',
      'water_spirit': 'water_stone',
      'grass_spirit': 'leaf_stone'
    });
    itemEvolutions?.forEach((evolution: any) => this?.evolutionManager.registerSpeciesEvolution(evolution));

    // Create sync-based evolutions
    const syncEvolutions = EvolutionUtils?.createSyncEvolutions({
      'psychic_spirit': 70,
      'dragon_spirit': 85,
      'fairy_spirit': 60
    });
    syncEvolutions?.forEach((evolution: any) => this?.evolutionManager.registerSpeciesEvolution(evolution));

    // Create complex evolutions with multiple conditions
    const complexEvolution = new SpeciesEvolutionData('starter_spirit', 'legendary_spirit', [
      EvolutionCondition?.levelAtLeast(50),
      EvolutionCondition?.syncAtLeast(80),
      EvolutionCondition?.requiresItem('legendary_crystal'),
      EvolutionCondition?.loreFlag('defeated_boss')
    ]);
    this?.evolutionManager.registerSpeciesEvolution(complexEvolution);
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    this?.isRunning = true;
    console.log('🧬 EvolutionPure CLI - Spirit Evolution System');
    console.log('Type "help" for commands or "exit" to quit.\n');

    while (this?.isRunning) {
      const input = await this?.prompt('evolution> ');
      await this?.processCommand(input);
    }
  }

  /**
   * Stop the CLI
   */
  stop(): void {
    this?.isRunning = false;
    this?.rl.close();
    console.log('👋 EvolutionPure CLI stopped.');
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    const parts = input?.trim().split(' ');
    const command = parts[0!]?.toLowerCase();
    const args = parts?.slice(1);

    try {
      switch (command) {
        case 'help':
          this?.showHelp();
          break;
        case 'exit':
        case 'quit':
          this?.stop();
          break;
        case 'create':
          await this?.createSpirit(args);
          break;
        case 'evolve':
          await this?.evolveSpirit(args);
          break;
        case 'check':
          this?.checkEvolution(args);
          break;
        case 'list':
          this?.listSpecies();
          break;
        case 'register':
          await this?.registerEvolution(args);
          break;
        case 'chain':
          this?.showEvolutionChain(args);
          break;
        case 'stats':
          this?.showStatistics();
          break;
        case 'validate':
          this?.validateData();
          break;
        case 'demo':
          this?.runDemo();
          break;
        case 'clear':
          console.clear();
          break;
        default:
          console.log('❌ Unknown command. Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('\n🧬 EvolutionPure Commands:');
    console.log('  help                    - Show this help message');
    console.log('  exit/quit               - Exit the CLI');
    console.log('  clear                   - Clear the console');
    console.log('');
    console.log('  create <name> <type> <level> - Create a test spirit');
    console.log('  evolve <spirit_id>      - Attempt to evolve a spirit');
    console.log('  check <species_id>      - Check evolution possibilities');
    console.log('  list                    - List all registered species');
    console.log('  register <species> <target> - Register simple evolution');
    console.log('  chain <species_id>      - Show evolution chain');
    console.log('  stats                   - Show evolution statistics');
    console.log('  validate                - Validate all evolution data');
    console.log('  demo                    - Run evolution demo');
    console.log('');
    console.log('💡 Examples:');
    console.log('  create "Fire Spirit" fire 25');
    console.log('  evolve fire_spirit');
    console.log('  register "basic_spirit" "intermediate_spirit"');
    console.log('  chain "basic_spirit"');
  }

  /**
   * Create a test spirit
   */
  private async createSpirit(args: string[]): Promise<void> {
    if (args?.length < 3) {
      console.log('❌ Usage: create <name> <type> <level>');
      return;
    }

    const name = args[0!];
    const type = args[1!];
    const level = parseInt(args[2!], 10);

    if (level <= 0 || level > 100) {
      console.log('❌ Level must be between 1 and 100');
      return;
    }

    const speciesId = name?.toLowerCase().replace(/\s+/g, '_');
    const spirit = EvolutionUtils?.createMockSpirit(speciesId, level, {
      speciesId,
      hasItem: (itemId: string) => {
        const inventory = this?.mockContext.getInventory();
        return inventory?.get(itemId) > 0;
      }
    });

    console.log(`✅ Created spirit: ${name} (${type}, Level ${level})`);
    console.log(`   Species ID: ${speciesId}`);
    console.log(`   Instance ID: ${spirit.instanceId}`);

    // Check evolution possibilities
    const canEvolve = this?.evolutionManager.canEvolve(spirit);
    const target = this?.evolutionManager.getEvolutionTarget(spirit);

    if (canEvolve && target) {
      console.log(`   🌟 Can evolve to: ${target}`);
    } else {
      console.log('   📍 No evolution available');
    }
  }

  /**
   * Attempt to evolve a spirit
   */
  private async evolveSpirit(args: string[]): Promise<void> {
    if (args?.length < 1) {
      console.log('❌ Usage: evolve <spirit_id>');
      return;
    }

    const spiritId = args[0!];
    const spirit = EvolutionUtils?.createMockSpirit(spiritId, 1);

    console.log(`🔄 Attempting to evolve: ${spiritId}`);

    const result = this?.evolutionManager.evolveSpirit(spirit);

    console.log(`Result: ${result.toString()}`);

    if (result?.isSuccess) {
      console.log('🎉 Evolution successful!');
      console.log(`   New species: ${result.newSpeciesId}`);

      // Show next evolution if available
      const nextTarget = this?.evolutionManager.getEvolutionTarget(spirit);
      if (nextTarget) {
        console.log(`   Next evolution available: ${nextTarget}`);
      }
    } else {
      console.log('❌ Evolution failed');
      switch (result?.status) {
        case EvolutionStatus?.CONDITIONS_NOT_MET:
          console.log('   💡 Try meeting the evolution requirements');
          break;
        case EvolutionStatus?.ALREADY_EVOLVED:
          console.log('   ✨ Spirit is already at its final evolution');
          break;
        case EvolutionStatus?.INVALID_SPIRIT:
          console.log('   💡 Spirit not found or invalid');
          break;
      }
    }
  }

  /**
   * Check evolution possibilities for a species
   */
  private checkEvolution(args: string[]): void {
    if (args?.length < 1) {
      console.log('❌ Usage: check <species_id>');
      return;
    }

    const speciesId = args[0!];
    const spirit = EvolutionUtils?.createMockSpirit(speciesId, 1);

    console.log(`🔍 Checking evolution for: ${speciesId}`);

    const canEvolve = this?.evolutionManager.canEvolve(spirit);
    const target = this?.evolutionManager.getEvolutionTarget(spirit);
    const availableEvolutions = this?.evolutionManager.getAvailableEvolutions(spirit);

    console.log(`Can evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);

    if (target) {
      console.log(`Evolution target: ${target}`);
    }

    if (availableEvolutions?.length > 0) {
      console.log('Available evolutions:');
      availableEvolutions?.forEach((evolution: any) => {
        console.log(`  • ${evolution}`);
      });
    }

    // Show requirements
    const requirements = EvolutionUtils?.getEvolutionRequirements(this?.evolutionManager, speciesId);
    if (requirements?.targetSpecies) {
      console.log(`\n📋 Requirements for ${requirements.targetSpecies}:`);
      requirements?.conditions.forEach((condition: any) => {
        console.log(`  • ${condition.description}`);
      });
    }
  }

  /**
   * List all registered species
   */
  private listSpecies(): void {
    const stats = this?.evolutionManager.getEvolutionStatistics();

    console.log('\n🧬 Registered Species:');
    console.log(`Total species: ${stats.totalSpecies}`);
    console.log(`Evolvable species: ${stats.evolvableSpecies}`);
    console.log(`Total evolutions: ${stats.totalEvolutions}`);
    console.log(`Max chain length: ${stats.maxChainLength}`);

    console.log('\nSpecies with evolutions:');
    for (const [speciesId, data] of this?.evolutionManager['speciesData']) {
      if (data?.evolutionTargetId) {
        console.log(`  ${speciesId} → ${data.evolutionTargetId}`);
      }
    }

    console.log('\nConditions by type:');
    Object.entries(stats.conditionsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }

  /**
   * Register simple evolution
   */
  private async registerEvolution(args: string[]): Promise<void> {
    if (args?.length < 2) {
      console.log('❌ Usage: register <species> <target> [condition_type!] [value!]');
      console.log('Condition types: level, item, sync, friendship, battles');
      return;
    }

    const speciesId = args[0!];
    const targetId = args[1!];
    const conditionType = args[2!]?.toLowerCase();
    const value = args[3!];

    let condition: EvolutionCondition | null = null;

    switch (conditionType) {
      case 'level':
        const level = parseInt(value, 10);
        if (level > 0) {
          condition = EvolutionCondition?.levelAtLeast(level);
          console.log(`✅ Registered level evolution: ${speciesId} → ${targetId} (Level ${level})`);
        }
        break;

      case 'item':
        if (value: any) {
          condition = EvolutionCondition?.requiresItem(value: any);
          console.log(`✅ Registered item evolution: ${speciesId} → ${targetId} (Item: ${value})`);
        }
        break;

      case 'sync':
        const syncLevel = parseInt(value, 10);
        if (syncLevel >= 0 && syncLevel <= 100) {
          condition = EvolutionCondition?.syncAtLeast(syncLevel);
          console.log(`✅ Registered sync evolution: ${speciesId} → ${targetId} (Sync: ${syncLevel}%)`);
        }
        break;

      case 'friendship':
        const friendship = parseInt(value, 10);
        if (friendship >= 0 && friendship <= 100) {
          condition = EvolutionCondition?.friendshipLevel(friendship);
          console.log(`✅ Registered friendship evolution: ${speciesId} → ${targetId} (Friendship: ${friendship})`);
        }
        break;

      case 'battles':
        const battleCount = parseInt(value, 10);
        if (battleCount >= 0) {
          condition = EvolutionCondition?.battleCount(battleCount);
          console.log(`✅ Registered battle evolution: ${speciesId} → ${targetId} (Battles: ${battleCount})`);
        }
        break;

      default:
        console.log(`✅ Registered unconditional evolution: ${speciesId} → ${targetId}`);
    }

    const evolutionData = new SpeciesEvolutionData(
      speciesId,
      targetId,
      condition ? [condition] : []
    );

    this?.evolutionManager.registerSpeciesEvolution(evolutionData);
  }

  /**
   * Show evolution chain for species
   */
  private showEvolutionChain(args: string[]): void {
    if (args?.length < 1) {
      console.log('❌ Usage: chain <species_id>');
      return;
    }

    const speciesId = args[0!];
    const chain = this?.evolutionManager.getEvolutionChain(speciesId);

    console.log(`\n🧬 Evolution Chain for ${speciesId}:`);
    if (chain?.length === 1) {
      console.log('  No evolutions found');
      return;
    }

    chain?.forEach((species, index) => {
      const prefix = index === 0 ? '  ' : '  → ';
      console.log(`${prefix}${species}`);
    });

    console.log(`\n📊 Chain Statistics:`);
    console.log(`  Length: ${chain.length}`);
    console.log(`  Starting species: ${chain[0!]}`);
    console.log(`  Final evolution: ${chain[chain.length - 1]}`);
  }

  /**
   * Show evolution statistics
   */
  private showStatistics(): void {
    const stats = this?.evolutionManager.getEvolutionStatistics();

    console.log('\n📊 Evolution System Statistics:');
    console.log(`Total Species: ${stats.totalSpecies}`);
    console.log(`Evolvable Species: ${stats.evolvableSpecies}`);
    console.log(`Total Evolutions: ${stats.totalEvolutions}`);
    console.log(`Max Chain Length: ${stats.maxChainLength}`);

    console.log('\n📋 Conditions Breakdown:');
    Object.entries(stats.conditionsByType).forEach(([conditionType, count]) => {
      console.log(`  ${conditionType}: ${count}`);
    });

    if (stats?.totalSpecies === 0) {
      console.log('\n💡 No species registered. Try "register" command or "demo" for examples.');
    }
  }

  /**
   * Validate all evolution data
   */
  private validateData(): void {
    const errors = this?.evolutionManager.validateEvolutionData();

    if (errors?.length === 0) {
      console.log('✅ All evolution data is valid!');
    } else {
      console.log('❌ Evolution data validation errors:');
      errors?.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  }

  /**
   * Run evolution demo
   */
  private runDemo(): void {
    console.log('🚀 Running EvolutionPure Demo...\n');

    // Create demo spirits
    const spirits = [
      EvolutionUtils?.createMockSpirit('demo_basic', 5),
      EvolutionUtils?.createMockSpirit('demo_fire', 1, {
        hasItem: (itemId: string) => itemId === 'fire_stone'
      }),
      EvolutionUtils?.createMockSpirit('demo_psychic', 1, {
        getSyncPercentage: () => 75
      }),
      EvolutionUtils?.createMockSpirit('demo_starter', 50, {
        hasItem: (itemId: string) => itemId === 'legendary_crystal'
      })
    ];

    // Test different evolution scenarios
    const scenarios = [
      { name: 'Level Evolution', spirit: spirits[0!], expected: 'Can evolve via level' },
      { name: 'Item Evolution', spirit: spirits[1!], expected: 'Cannot evolve (no fire stone)' },
      { name: 'Sync Evolution', spirit: spirits[2!], expected: 'Can evolve via sync' },
      { name: 'Complex Evolution', spirit: spirits[3!], expected: 'Can evolve (high level + item)' }
    ];

    scenarios?.forEach((scenario, index) => {
      console.log(`\n${index + 1}. ${scenario.name}:`);
      console.log(`   Species: ${scenario.spirit.speciesId}`);
      console.log(`   Level: ${scenario.spirit.level}`);

      const canEvolve = this?.evolutionManager.canEvolve(scenario?.spirit);
      const target = this?.evolutionManager.getEvolutionTarget(scenario?.spirit);

      console.log(`   Can Evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);
      if (target) {
        console.log(`   Target: ${target}`);
      }

      // Try evolution
      const result = this?.evolutionManager.evolveSpirit(scenario?.spirit);
      console.log(`   Result: ${result.toString()}`);
    });

    console.log('\n📋 Demo Summary:');
    console.log('  • Level-based evolutions require reaching specific levels');
    console.log('  • Item-based evolutions require specific items');
    console.log('  • Sync-based evolutions require high sync percentages');
    console.log('  • Complex evolutions can require multiple conditions');
    console.log('\n💡 Try: create "My Spirit" normal 25');
    console.log('💡 Try: check basic_spirit');
    console.log('💡 Try: evolve basic_spirit');
  }

  /**
   * Prompt user for input
   */
  private prompt(query: string): Promise<string> {
    return new Promise((resolve) => {
      this?.rl.question(query, resolve);
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
    await cli?.start();
  },

  /**
   * Run CLI in demo mode
   */
  async runDemo(): Promise<void> {
    const cli = new EvolutionPureCLI();
    cli?.runDemo();
    await cli?.start();
  },

  /**
   * Create evolution manager from CLI arguments
   */
  createManagerFromArgs(args: string[]): EvolutionManager | null {
    if (args?.length < 1) {
      console.error('❌ Usage: --create-manager <player_id>');
      return null;
    }

    const context = EvolutionUtils?.createMockPlayerContext();
    return EvolutionManager?.create(context);
  },

  /**
   * Register evolution from CLI arguments
   */
  registerEvolutionFromArgs(manager: EvolutionManager, args: string[]): boolean {
    if (args?.length < 2) {
      console.error('❌ Usage: --register-evolution <species> <target> [condition_type!] [value!]');
      return false;
    }

    const speciesId = args[0!];
    const targetId = args[1!];
    const conditionType = args[2!]?.toLowerCase();
    const value = args[3!];

    let condition: EvolutionCondition | null = null;

    switch (conditionType) {
      case 'level':
        const level = parseInt(value, 10);
        if (level > 0) {
          condition = EvolutionCondition?.levelAtLeast(level);
          console.log(`✅ Registered level evolution: ${speciesId} → ${targetId} (Level ${level})`);
        }
        break;

      case 'item':
        if (value: any) {
          condition = EvolutionCondition?.requiresItem(value: any);
          console.log(`✅ Registered item evolution: ${speciesId} → ${targetId} (Item: ${value})`);
        }
        break;

      case 'sync':
        const syncLevel = parseInt(value, 10);
        if (syncLevel >= 0 && syncLevel <= 100) {
          condition = EvolutionCondition?.syncAtLeast(syncLevel);
          console.log(`✅ Registered sync evolution: ${speciesId} → ${targetId} (Sync: ${syncLevel}%)`);
        }
        break;

      default:
        console.log(`✅ Registered unconditional evolution: ${speciesId} → ${targetId}`);
    }

    const evolutionData = new SpeciesEvolutionData(
      speciesId,
      targetId,
      condition ? [condition] : []
    );

    manager?.registerSpeciesEvolution(evolutionData);
    return true;
  },

  /**
   * Test evolution from CLI arguments
   */
  testEvolutionFromArgs(manager: EvolutionManager, args: string[]): void {
    if (args?.length < 1) {
      console.error('❌ Usage: --test-evolution <species_id>');
      return;
    }

    const speciesId = args[0!];
    const spirit = EvolutionUtils?.createMockSpirit(speciesId, 25);

    console.log(`🧬 Testing evolution for: ${speciesId}`);

    const canEvolve = manager?.canEvolve(spirit);
    const target = manager?.getEvolutionTarget(spirit);
    const chain = manager?.getEvolutionChain(speciesId);

    console.log(`Can Evolve: ${canEvolve ? '✅ Yes' : '❌ No'}`);
    if (target) {
      console.log(`Target: ${target}`);
    }

    console.log(`Evolution Chain: ${chain.join(' → ')}`);
  }
};

// CLI entry point
if (require?.main === module) {
  const args = process?.argv.slice(2);

  if (args?.includes('--demo')) {
    EvolutionPureCLIUtils?.runDemo();
  } else if (args?.includes('--help')) {
    console.log('EvolutionPure CLI Usage:');
    console.log('  node cliHarness.ts              - Run interactive CLI');
    console.log('  node cliHarness.ts --demo       - Run demo with sample data');
    console.log('  node cliHarness.ts --help       - Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  node cliHarness.ts --create-manager "player1"');
    console.log('  node cliHarness.ts --register-evolution "pikachu" "raichu" level 25');
    console.log('  node cliHarness.ts --test-evolution "pikachu"');
  } else {
    EvolutionPureCLIUtils?.runCLI();
  }
}