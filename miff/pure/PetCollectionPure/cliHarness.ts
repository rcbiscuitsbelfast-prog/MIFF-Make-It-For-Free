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

interface CliCommand {
  command: string;
  description: string;
  handler: (args: string[]) => void;
}

class PetCollectionCli {
  private manager: PetCollectionManager;
  private eventBus: EventBus;
  private commands: Map<string, CliCommand> = new Map();
  private isRunning: boolean = true;
  private currentPlayerId: string = '';
  private demoMode: boolean = false;

  constructor(config?: PetCollectionConfig) {
    this.eventBus = new EventBus();
    this.manager = new PetCollectionManager(this.eventBus, config);

    this.setupCommands();
    this.setupEventListeners();

    console.log('🐾 PetCollectionPure CLI - AAA Pet Collection System');
    console.log('Type "help" for available commands or "quit" to exit.\n');
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
      console.log(`🥚 Egg created: ${data.egg.species} (${data.egg.rarity})`);
    });

    this.eventBus.on('pet:egg_hatched', (data) => {
      console.log(`✨ Pet hatched: ${data.pet.name} (${data.pet.species} - ${data.pet.rarity})`);
    });

    this.eventBus.on('pet:trade_created', (data) => {
      console.log(`🤝 Trade offer created for ${data.tradeOffer.petId}`);
    });

    this.eventBus.on('pet:trade_completed', (data) => {
      console.log(`✅ Trade completed between players`);
    });

    this.eventBus.on('pet:fed', (data) => {
      console.log(`🍖 Pet fed successfully`);
    });

    this.eventBus.on('pet:favorite_toggled', (data) => {
      console.log(`⭐ Pet favorite status changed`);
    });
  }

  private handleCreatePlayer(args: string[]): void {
    if (args.length < 2) {
      console.log('Usage: create-player <id> <name>');
      return;
    }

    const [playerId, playerName] = args;
    this.currentPlayerId = playerId;

    console.log(`👤 Player created: ${playerName} (${playerId})`);
    console.log(`Current player set to: ${this.currentPlayerId}`);
  }

  private handleCreateEgg(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: create-egg <type> [species]');
      return;
    }

    const [eggType, species = 'dragon'] = args;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.createEgg(this.currentPlayerId, eggType as EggType, species);

    if (result.success) {
      console.log(result.message);
      if (result.data) {
        const egg = result.data.egg;
        console.log(`   Species: ${egg.species}`);
        console.log(`   Rarity: ${egg.rarity}`);
        console.log(`   Incubation: ${egg.incubationTime}s`);
      }
    } else {
      console.log('❌', result.message);
    }
  }

  private handleHatchEgg(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: hatch-egg <eggId>');
      return;
    }

    const [eggId] = args;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.hatchEgg(eggId, this.currentPlayerId);

    if (result.success) {
      console.log(result.message);
      if (result.data) {
        const pet = result.data.pet;
        console.log(`   Name: ${pet.name}`);
        console.log(`   Species: ${pet.species}`);
        console.log(`   Rarity: ${pet.rarity}`);
        console.log(`   Stats: H:${pet.stats.health} A:${pet.stats.attack} D:${pet.stats.defense}`);
      }
    } else {
      console.log('❌', result.message);
    }
  }

  private handleShowPets(args: string[]): void {
    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getPetsByOwner(this.currentPlayerId);

    if (result.success && result.data) {
      const pets = result.data.pets;
      if (pets.length === 0) {
        console.log('No pets found.');
        return;
      }

      console.log(`\n🐾 Your Pets (${pets.length}):`);
      console.log('─'.repeat(80));
      console.log('Name                    | Species    | Rarity    | Lvl | HP  | ATK | DEF | Fav');
      console.log('─'.repeat(80));

      pets.forEach(pet => {
        const name = pet.name.padEnd(23);
        const species = pet.species.padEnd(10);
        const rarity = pet.rarity.padEnd(9);
        const level = pet.level.toString().padStart(2);
        const hp = pet.stats.health.toString().padStart(3);
        const atk = pet.stats.attack.toString().padStart(3);
        const def = pet.stats.defense.toString().padStart(3);
        const fav = pet.isFavorite ? '⭐' : '  ';

        console.log(`${name} | ${species} | ${rarity} | ${level} | ${hp} | ${atk} | ${def} | ${fav}`);
      });
      console.log('─'.repeat(80));
    } else {
      console.log('❌ Failed to get pets');
    }
  }

  private handleShowEggs(args: string[]): void {
    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getEggsByOwner(this.currentPlayerId);

    if (result.success && result.data) {
      const eggs = result.data.eggs;
      if (eggs.length === 0) {
        console.log('No eggs found.');
        return;
      }

      console.log(`\n🥚 Your Eggs (${eggs.length}):`);
      console.log('─'.repeat(60));
      console.log('Species    | Rarity    | Progress | Time Left');
      console.log('─'.repeat(60));

      eggs.forEach(egg => {
        const species = egg.species.padEnd(10);
        const rarity = egg.rarity.padEnd(9);
        const progress = `${Math.round(egg.progress)}%`.padEnd(8);
        const timeLeft = Math.max(0, egg.hatchTime - Date.now());
        const timeLeftStr = timeLeft > 0 ? `${Math.round(timeLeft / 1000)}s` : 'Ready!';

        console.log(`${species} | ${rarity} | ${progress} | ${timeLeftStr}`);
      });
      console.log('─'.repeat(60));
    } else {
      console.log('❌ Failed to get eggs');
    }
  }

  private handleShowStats(args: string[]): void {
    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.getCollectionStats(this.currentPlayerId);

    if (result.success && result.data) {
      const stats = result.data.stats;

      console.log(`\n📊 Collection Stats for ${this.currentPlayerId}:`);
      console.log('─'.repeat(40));
      console.log(`Total Pets: ${stats.totalPets}`);
      console.log(`Unique Species: ${stats.uniqueSpecies}`);
      console.log(`Average Rarity: ${(stats.averageRarity).toFixed(1)}`);
      console.log(`Eggs Hatched: ${stats.eggsHatched}`);
      console.log(`Favorite Pets: ${stats.favoritePets}`);
      console.log(`Max Level: ${stats.maxLevel}`);
      console.log(`Total Trades: ${stats.totalTrades}`);
      console.log(`Collection Value: ${stats.collectionValue}`);
      console.log('─'.repeat(40));
    } else {
      console.log('❌ Failed to get stats');
    }
  }

  private handleFeedPet(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: feed-pet <petId>');
      return;
    }

    const [petId] = args;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.feedPet(petId, this.currentPlayerId);

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleToggleFavorite(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: toggle-favorite <petId>');
      return;
    }

    const [petId] = args;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.toggleFavorite(petId, this.currentPlayerId);

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleCreateTrade(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: create-trade <petId> [requestedPetId] [item1,item2,...]');
      return;
    }

    const [petId, requestedPetId, itemsStr] = args;
    const requestedItems = itemsStr ? itemsStr.split(',') : undefined;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.createTradeOffer(
      this.currentPlayerId,
      petId,
      requestedPetId,
      requestedItems
    );

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleAcceptTrade(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: accept-trade <tradeId>');
      return;
    }

    const [tradeId] = args;

    if (!this.currentPlayerId) {
      console.log('❌ No current player set. Use create-player first.');
      return;
    }

    const result = this.manager.acceptTradeOffer(tradeId, this.currentPlayerId);

    if (result.success) {
      console.log(result.message);
    } else {
      console.log('❌', result.message);
    }
  }

  private handleDemo(args: string[]): void {
    if (args.length < 1) {
      console.log('Usage: demo <mode>');
      console.log('Available modes: hatch, collect, trade');
      return;
    }

    const [mode] = args;
    this.demoMode = true;

    console.log(`🎮 Starting ${mode} demo mode...`);

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
        console.log('❌ Unknown demo mode:', mode);
    }
  }

  private async runHatchDemo(): Promise<void> {
    if (!this.currentPlayerId) {
      console.log('Creating demo player...');
      this.currentPlayerId = 'demo_player';
    }

    console.log('Creating various eggs...');

    // Create different types of eggs
    const eggTypes: EggType[] = ['basic', 'premium', 'golden'];
    const species = ['dragon', 'phoenix', 'unicorn'];

    for (const eggType of eggTypes) {
      for (const speciesType of species) {
        this.manager.createEgg(this.currentPlayerId, eggType, speciesType);
        await this.sleep(100);
      }
    }

    console.log('Hatching all eggs...');

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

    console.log('Creating a large collection...');

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
    console.log('Creating pets for trading...');

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

    console.log('Creating trade offers...');
    this.demoMode = false;
  }

  private async handleSimulate(args: string[]): Promise<void> {
    const rounds = parseInt(args[0]) || 5;
    console.log(`🧪 Running simulation for ${rounds} rounds...`);

    for (let i = 0; i < rounds; i++) {
      console.log(`\n--- Round ${i + 1} ---`);

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

    console.log('\n✅ Simulation completed!');
    this.handleShowStats([]);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 1000;
    console.log(`🔬 Running benchmark with ${operations} operations...`);

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

    console.log(`\n📈 Benchmark Results:`);
    console.log(`   Total Operations: ${operations}`);
    console.log(`   Duration: ${duration.toFixed(2)}ms`);
    console.log(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);

    // Cleanup
    await this.sleep(1000);
  }

  private handleSpecies(args: string[]): void {
    const species = this.manager.getAvailableSpecies();
    console.log('\n🦄 Available Species:');
    console.log('─'.repeat(30));
    species.forEach((species, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${species}`);
    });
    console.log('─'.repeat(30));
  }

  private handleHelp(args: string[]): void {
    console.log('\n🛠️ Available Commands:');
    console.log('─'.repeat(50));
    this.commands.forEach((cmd, key) => {
      console.log(`  ${cmd.command.padEnd(40)} | ${cmd.description}`);
    });
    console.log('─'.repeat(50));
  }

  private handleQuit(args: string[]): void {
    console.log('👋 Goodbye!');
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
          console.log(`❌ Unknown command: ${command}. Type "help" for available commands.`);
        }
      }

      if (this.isRunning) {
        rl.prompt();
      } else {
        rl.close();
      }
    });

    rl.on('close', () => {
      console.log('CLI session ended.');
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
  console.log('\n👋 Received SIGINT. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM. Exiting...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { PetCollectionCli };