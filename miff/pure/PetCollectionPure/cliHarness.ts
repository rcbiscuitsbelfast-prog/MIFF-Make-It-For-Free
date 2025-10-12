#!/usr/bin/env node

/**
 * PetCollectionPure CLI Harness - AAA Quality Pet Collection Testing
 *
 * Interactive command-line interface for testing pet collection mechanics:
 * - Egg creation and hatching
 * - Pet management and statistics
 * - Trading system interactions
 * - Collection management
 * - Performance benchmarking
 * - Mobile-friendly controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';
import { PetCollectionManager, PetCollectionConfig } from './Manager.js';
import { PetRarity, EggType, PetType } from './index.js';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CliCommand {
  command: string;
  description: string;
  handler: (args: string[]) => void;
}

class PetCollectionCli {
  private logger: StructuredLogger;
  private manager: PetCollectionManager;
  private eventBus: EventBus;
  private commands: Map<string, CliCommand> = new Map();
  private isRunning: boolean = true;
  private currentPlayerId: string = '';
  private demoMode: boolean = false;

  constructor(config?: PetCollectionConfig) {
    this.logger = new StructuredLogger({ module: 'PetCollectionCli' });
    this.eventBus = new EventBus();
    this.manager = new PetCollectionManager(this.eventBus, config);

    this.setupCommands();
    this.setupEventListeners();

    this.logger.info('🐾 PetCollectionPure CLI - AAA Pet Collection System');
    this.logger.info('Type "help" for available commands or "quit" to exit.\n');
  }

  private setupCommands(): void {
    this.commands.set('create-player', {
      command: 'create-player <id> <name>',
      description: 'Create a new player',
      handler: (args) => this.handleCreatePlayer(args)
    });

    this.commands.set('create-egg', {
      command: 'create-egg <type> [species]',
      description: 'Create a new egg (basic, premium, golden, diamond, cosmic)',
      handler: (args) => this.handleCreateEgg(args)
    });

    this.commands.set('hatch-egg', {
      command: 'hatch-egg <eggId>',
      description: 'Hatch a specific egg',
      handler: (args) => this.handleHatchEgg(args)
    });

    this.commands.set('show-pets', {
      command: 'show-pets [filter] [sort]',
      description: 'Display pets with optional filtering and sorting',
      handler: (args) => this.handleShowPets(args)
    });

    this.commands.set('show-eggs', {
      command: 'show-eggs',
      description: 'Display current eggs',
      handler: (args) => this.handleShowEggs(args)
    });

    this.commands.set('show-stats', {
      command: 'show-stats',
      description: 'Display collection statistics',
      handler: (args) => this.handleShowStats(args)
    });

    this.commands.set('feed-pet', {
      command: 'feed-pet <petId>',
      description: 'Feed a pet to increase happiness',
      handler: (args) => this.handleFeedPet(args)
    });

    this.commands.set('toggle-favorite', {
      command: 'toggle-favorite <petId>',
      description: 'Toggle favorite status for a pet',
      handler: (args) => this.handleToggleFavorite(args)
    });

    this.commands.set('create-trade', {
      command: 'create-trade <petId> [requestedPetId] [item1,item2,...]',
      description: 'Create a trade offer',
      handler: (args) => this.handleCreateTrade(args)
    });

    this.commands.set('accept-trade', {
      command: 'accept-trade <tradeId>',
      description: 'Accept a trade offer',
      handler: (args) => this.handleAcceptTrade(args)
    });

    this.commands.set('demo', {
      command: 'demo <mode>',
      description: 'Run demo mode (hatch, collect, trade)',
      handler: (args) => this.handleDemo(args)
    });

    this.commands.set('simulate', {
      command: 'simulate <rounds>',
      description: 'Run automated collection simulation',
      handler: (args) => this.handleSimulate(args)
    });

    this.commands.set('benchmark', {
      command: 'benchmark <operations>',
      description: 'Run performance benchmark',
      handler: (args) => this.handleBenchmark(args)
    });

    this.commands.set('species', {
      command: 'species',
      description: 'List available pet species',
      handler: (args) => this.handleSpecies(args)
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
    this.eventBus.on('pet:egg_created', (data) => {
      this.logger.info(`🥚 Egg created: ${data.egg.species} (${data.egg.rarity})`);
    });

    this.eventBus.on('pet:egg_hatched', (data) => {
      this.logger.info(`✨ Pet hatched: ${data.pet.name} (${data.pet.species} - ${data.pet.rarity})`);
    });

    this.eventBus.on('pet:trade_created', (data) => {
      this.logger.info(`🤝 Trade offer created for ${data.tradeOffer.petId}`);
    });

    this.eventBus.on('pet:trade_completed', (data) => {
      this.logger.info(`✅ Trade completed between players`);
    });

    this.eventBus.on('pet:fed', (data) => {
      this.logger.info(`🍖 Pet fed successfully`);
    });

    this.eventBus.on('pet:favorite_toggled', (data) => {
      this.logger.info(`⭐ Pet favorite status changed`);
    });
  }

  private handleCreatePlayer(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: create-player <id> <name>');
      return;
    }

    const [playerId, playerName] = args;
    this.currentPlayerId = playerId;

    this.logger.info(`👤 Player created: ${playerName} (${playerId})`);
    this.logger.info(`Current player set to: ${this.currentPlayerId}`);
  }

  private handleCreateEgg(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: create-egg <type> [species]');
      return;
    }

    const [eggType, species = 'dragon'] = args;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.createEgg(this.currentPlayerId, eggType as EggType, species);

    if (result.success) {
      this.logger.info(result.message);
      if (result.data) {
        const egg = result.data.egg;
        this.logger.info(`   Species: ${egg.species}`);
        this.logger.info(`   Rarity: ${egg.rarity}`);
        this.logger.info(`   Incubation: ${egg.incubationTime}s`);
      }
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleHatchEgg(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: hatch-egg <eggId>');
      return;
    }

    const [eggId] = args;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.hatchEgg(eggId, this.currentPlayerId);

    if (result.success) {
      this.logger.info(result.message);
      if (result.data) {
        const pet = result.data.pet;
        this.logger.info(`   Name: ${pet.name}`);
        this.logger.info(`   Species: ${pet.species}`);
        this.logger.info(`   Rarity: ${pet.rarity}`);
        this.logger.info(`   Stats: H:${pet.stats.health} A:${pet.stats.attack} D:${pet.stats.defense}`);
      }
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleShowPets(args: string[]): void {
    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getPetsByOwner(this.currentPlayerId);

    if (result.success && result.data) {
      const pets = result.data.pets;
      if (pets.length === 0) {
        this.logger.info('No pets found.');
        return;
      }

      this.logger.info(`\n🐾 Your Pets (${pets.length}):`);
      this.logger.info('─'.repeat(80));
      this.logger.info('Name                    | Species    | Rarity    | Lvl | HP  | ATK | DEF | Fav');
      this.logger.info('─'.repeat(80));

      pets.forEach(pet => {
        const name = pet.name.padEnd(23);
        const species = pet.species.padEnd(10);
        const rarity = pet.rarity.padEnd(9);
        const level = pet.level.toString().padStart(2);
        const hp = pet.stats.health.toString().padStart(3);
        const atk = pet.stats.attack.toString().padStart(3);
        const def = pet.stats.defense.toString().padStart(3);
        const fav = pet.isFavorite ? '⭐' : '  ';

        this.logger.info(`${name} | ${species} | ${rarity} | ${level} | ${hp} | ${atk} | ${def} | ${fav}`);
      });
      this.logger.info('─'.repeat(80));
    } else {
      this.logger.info('❌ Failed to get pets');
    }
  }

  private handleShowEggs(args: string[]): void {
    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getEggsByOwner(this.currentPlayerId);

    if (result.success && result.data) {
      const eggs = result.data.eggs;
      if (eggs.length === 0) {
        this.logger.info('No eggs found.');
        return;
      }

      this.logger.info(`\n🥚 Your Eggs (${eggs.length}):`);
      this.logger.info('─'.repeat(60));
      this.logger.info('Species    | Rarity    | Progress | Time Left');
      this.logger.info('─'.repeat(60));

      eggs.forEach(egg => {
        const species = egg.species.padEnd(10);
        const rarity = egg.rarity.padEnd(9);
        const progress = `${Math.round(egg.progress)}%`.padEnd(8);
        const timeLeft = Math.max(0, egg.hatchTime - Date.now());
        const timeLeftStr = timeLeft > 0 ? `${Math.round(timeLeft / 1000)}s` : 'Ready!';

        this.logger.info(`${species} | ${rarity} | ${progress} | ${timeLeftStr}`);
      });
      this.logger.info('─'.repeat(60));
    } else {
      this.logger.info('❌ Failed to get eggs');
    }
  }

  private handleShowStats(args: string[]): void {
    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getCollectionStats(this.currentPlayerId);

    if (result.success && result.data) {
      const stats = result.data.stats;

      this.logger.info(`\n📊 Collection Stats for ${this.currentPlayerId}:`);
      this.logger.info('─'.repeat(40));
      this.logger.info(`Total Pets: ${stats.totalPets}`);
      this.logger.info(`Unique Species: ${stats.uniqueSpecies}`);
      this.logger.info(`Average Rarity: ${(stats.averageRarity).toFixed(1)}`);
      this.logger.info(`Eggs Hatched: ${stats.eggsHatched}`);
      this.logger.info(`Favorite Pets: ${stats.favoritePets}`);
      this.logger.info(`Max Level: ${stats.maxLevel}`);
      this.logger.info(`Total Trades: ${stats.totalTrades}`);
      this.logger.info(`Collection Value: ${stats.collectionValue}`);
      this.logger.info('─'.repeat(40));
    } else {
      this.logger.info('❌ Failed to get stats');
    }
  }

  private handleFeedPet(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: feed-pet <petId>');
      return;
    }

    const [petId] = args;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.feedPet(petId, this.currentPlayerId);

    if (result.success) {
      this.logger.info(result.message);
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleToggleFavorite(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: toggle-favorite <petId>');
      return;
    }

    const [petId] = args;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.toggleFavorite(petId, this.currentPlayerId);

    if (result.success) {
      this.logger.info(result.message);
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleCreateTrade(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: create-trade <petId> [requestedPetId] [item1,item2,...]');
      return;
    }

    const [petId, requestedPetId, itemsStr] = args;
    const requestedItems = itemsStr ? itemsStr.split(',') : undefined;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.createTradeOffer(
      this.currentPlayerId,
      petId,
      requestedPetId,
      requestedItems
    );

    if (result.success) {
      this.logger.info(result.message);
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleAcceptTrade(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: accept-trade <tradeId>');
      return;
    }

    const [tradeId] = args;

    if (!this.currentPlayerId) {
      this.logger.info('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.acceptTradeOffer(tradeId, this.currentPlayerId);

    if (result.success) {
      this.logger.info(result.message);
    } else {
      this.logger.info('❌', result.message);
    }
  }

  private handleDemo(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: demo <mode>');
      this.logger.info('Available modes: hatch, collect, trade');
      return;
    }

    const [mode] = args;
    this.demoMode = true;

    this.logger.info(`🎮 Starting ${mode} demo mode...`);

    switch (mode) {
      case 'hatch':
        this.runHatchDemo();
        break;
      case 'collect':
        this.runCollectDemo();
        break;
      case 'trade':
        this.runTradeDemo();
        break;
      default:
        this.logger.info('❌ Unknown demo mode:', mode);
    }
  }

  private async runHatchDemo(): Promise<void> {
    if (!this.currentPlayerId) {
      this.logger.info('Creating demo player...');
      this.currentPlayerId = 'demo_player';
    }

    this.logger.info('Creating various eggs...');

    // Create different types of eggs
    const eggTypes: EggType[] = ['basic', 'premium', 'golden'];
    const species = ['dragon', 'phoenix', 'unicorn'];

    for (const eggType of eggTypes) {
      for (const speciesType of species) {
        this.manager.createEgg(this.currentPlayerId, eggType, speciesType);
        await this.sleep(100);
      }
    }

    this.logger.info('Hatching all eggs...');

    // Wait a bit then hatch all eggs
    await this.sleep(2000);

    const eggsResult = this.manager.getEggsByOwner(this.currentPlayerId);
    if (eggsResult.success && eggsResult.data) {
      for (const egg of eggsResult.data.eggs) {
        this.manager.hatchEgg(egg.id, this.currentPlayerId);
        await this.sleep(200);
      }
    }

    this.showStats();
    this.demoMode = false;
  }

  private async runCollectDemo(): Promise<void> {
    if (!this.currentPlayerId) {
      this.currentPlayerId = 'demo_player';
    }

    this.logger.info('Creating a large collection...');

    const species = ['dragon', 'phoenix', 'unicorn', 'griffin', 'cerberus', 'pegasus'];

    for (let i = 0; i < 20; i++) {
      const speciesType = species[i % species.length];
      const eggType = ['basic', 'premium'][i % 2] as EggType;

      this.manager.createEgg(this.currentPlayerId, eggType, speciesType);
      await this.sleep(50);
    }

    // Hatch all eggs
    await this.sleep(1000);

    const eggsResult = this.manager.getEggsByOwner(this.currentPlayerId);
    if (eggsResult.success && eggsResult.data) {
      for (const egg of eggsResult.data.eggs) {
        this.manager.hatchEgg(egg.id, this.currentPlayerId);
        await this.sleep(100);
      }
    }

    this.showStats();
    this.demoMode = false;
  }

  private async runTradeDemo(): Promise<void> {
    if (!this.currentPlayerId) {
      this.currentPlayerId = 'demo_player';
    }

    // Create some pets for trading
    this.logger.info('Creating pets for trading...');

    for (let i = 0; i < 5; i++) {
      const species = ['dragon', 'phoenix', 'unicorn'][i % 3];
      this.manager.createEgg(this.currentPlayerId, 'basic', species);
    }

    await this.sleep(1000);

    // Hatch pets
    const eggsResult = this.manager.getEggsByOwner(this.currentPlayerId);
    if (eggsResult.success && eggsResult.data) {
      for (const egg of eggsResult.data.eggs) {
        this.manager.hatchEgg(egg.id, this.currentPlayerId);
      }
    }

    this.logger.info('Creating trade offers...');
    this.demoMode = false;
  }

  private async handleSimulate(args: string[]): Promise<void> {
    const rounds = parseInt(args[0]) || 5;
    this.logger.info(`🧪 Running simulation for ${rounds} rounds...`);

    for (let i = 0; i < rounds; i++) {
      this.logger.info(`\n--- Round ${i + 1} ---`);

      // Create eggs
      const eggTypes: EggType[] = ['basic', 'premium', 'golden'];
      const species = ['dragon', 'phoenix', 'unicorn', 'griffin'];

      for (let j = 0; j < 10; j++) {
        const eggType = eggTypes[j % eggTypes.length];
        const speciesType = species[j % species.length];
        this.manager.createEgg(`player${i}_${j}`, eggType, speciesType);
      }

      // Wait for hatching
      await this.sleep(100);

      // Hatch eggs
      for (let j = 0; j < 10; j++) {
        const playerId = `player${i}_${j}`;
        const eggsResult = this.manager.getEggsByOwner(playerId);

        if (eggsResult.success && eggsResult.data) {
          for (const egg of eggsResult.data.eggs) {
            this.manager.hatchEgg(egg.id, playerId);
          }
        }
      }

      // Wait between rounds
      await this.sleep(200);
    }

    this.logger.info('\n✅ Simulation completed!');
    this.handleShowStats([]);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 1000;
    this.logger.info(`🔬 Running benchmark with ${operations} operations...`);

    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
      const playerId = `bench_player_${i}`;
      const species = ['dragon', 'phoenix', 'unicorn'][i % 3];

      // Create egg
      this.manager.createEgg(playerId, 'basic', species);

      // Get pets
      this.manager.getPetsByOwner(playerId);

      // Get stats
      this.manager.getCollectionStats(playerId);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const opsPerSecond = (operations / duration) * 1000;

    this.logger.info(`\n📈 Benchmark Results:`);
    this.logger.info(`   Total Operations: ${operations}`);
    this.logger.info(`   Duration: ${duration.toFixed(2)}ms`);
    this.logger.info(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);

    // Cleanup
    await this.sleep(1000);
  }

  private handleSpecies(args: string[]): void {
    const species = this.manager.getAvailableSpecies();
    this.logger.info('\n🦄 Available Species:');
    this.logger.info('─'.repeat(30));
    species.forEach((species, index) => {
      this.logger.info(`${(index + 1).toString().padStart(2)}. ${species}`);
    });
    this.logger.info('─'.repeat(30));
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

  private showStats(): void {
    if (this.currentPlayerId) {
      this.handleShowStats([]);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async run(): Promise<void> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'pet-collection> '
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
  const config: PetCollectionConfig = {
    maxPetsPerPlayer: 100,
    maxEggsPerPlayer: 50,
    maxActiveTradesPerPlayer: 10,
    incubationUpdateInterval: 1000,
    enablePersistence: false,
    debugMode: process.env.NODE_ENV === 'development',
    mobileOptimized: true
  };

  const cli = new PetCollectionCli(config);
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

export { PetCollectionCli };