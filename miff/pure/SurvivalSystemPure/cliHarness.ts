#!/usr/bin/env tsx

/**
 * SurvivalSystemPure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the SurvivalSystemPure survival game system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
SurvivalSystemPure CLI Harness - Survival Game System

Usage: npx tsx miff/pure/SurvivalSystemPure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic survival system tests
  start-survival           - Start survival session
  get-stats                - Get current survival stats
  consume <resource>       - Consume resource
  build-shelter <type>     - Build shelter
  gather <resource>        - Gather resource
  craft <item>             - Craft item
  check-weather            - Check weather conditions
  simulate                 - Simulate survival scenario
  help                     - Show this help

Examples:
  npx tsx miff/pure/SurvivalSystemPure/cliHarness.ts test
  npx tsx miff/pure/SurvivalSystemPure/cliHarness.ts start-survival
  npx tsx miff/pure/SurvivalSystemPure/cliHarness.ts consume food
  npx tsx miff/pure/SurvivalSystemPure/cliHarness.ts simulate
`);
  process.exit(0);
}

import * as readline from 'readline';
import { SurvivalSystemPure, SurvivalNeed, ShelterType, ResourceType, SurvivalStats, SurvivalResource } from './index';

class SurvivalSystemCLI {
  private survivalSystem: SurvivalSystemPure;
  private rl: readline.Interface;
  private sessionId: string | null = null;

  constructor() {
    this.survivalSystem = new SurvivalSystemPure();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Survival> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\n👋 Survival System CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'start-survival':
        await this.startSurvival();
        break;
      case 'get-stats':
        this.getStats();
        break;
      case 'consume':
        await this.consumeResource(args[0]);
        break;
      case 'build-shelter':
        await this.buildShelter(args[0]);
        break;
      case 'gather':
        await this.gatherResource(args[0]);
        break;
      case 'craft':
        await this.craftItem(args[0]);
        break;
      case 'check-weather':
        this.checkWeather();
        break;
      case 'simulate':
        await this.simulate();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
      case 'quit':
        this.rl.close();
        break;
      case '':
        // Empty line, just show prompt
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Survival System tests...\n');

    try {
      // Test 1: Session creation
      console.log('1. Testing session creation...');
      const sessionId = this.survivalSystem.startSession();
      console.log(`   ✅ Session created with ID: ${sessionId}`);

      // Test 2: Initial stats
      console.log('2. Testing initial stats...');
      const initialStats = this.survivalSystem.getStats(sessionId);
      console.log(`   ✅ Initial stats retrieved:`);
      console.log(`      Hunger: ${initialStats.hunger}`);
      console.log(`      Thirst: ${initialStats.thirst}`);
      console.log(`      Stamina: ${initialStats.stamina}`);
      console.log(`      Health: ${initialStats.health}`);
      console.log(`      Temperature: ${initialStats.temperature}`);

      // Test 3: Resource consumption
      console.log('3. Testing resource consumption...');
      const foodResource: SurvivalResource = {
        id: 'food-1',
        type: 'food',
        name: 'Berries',
        value: 20,
        quantity: 5
      };
      
      this.survivalSystem.addResource(sessionId, foodResource);
      const consumeResult = this.survivalSystem.consumeResource(sessionId, 'food-1');
      console.log(`   ${consumeResult ? '✅' : '❌'} Resource consumed: ${consumeResult ? 'Success' : 'Failed'}`);

      // Test 4: Shelter building
      console.log('4. Testing shelter building...');
      const shelterResult = this.survivalSystem.buildShelter(sessionId, 'tent');
      console.log(`   ${shelterResult ? '✅' : '❌'} Shelter built: ${shelterResult ? 'Success' : 'Failed'}`);

      // Test 5: Resource gathering
      console.log('5. Testing resource gathering...');
      const gatherResult = this.survivalSystem.gatherResource(sessionId, 'wood');
      console.log(`   ${gatherResult ? '✅' : '❌'} Resource gathered: ${gatherResult ? 'Success' : 'Failed'}`);

      // Test 6: Weather check
      console.log('6. Testing weather check...');
      const weather = this.survivalSystem.getWeather(sessionId);
      console.log(`   ✅ Weather: ${weather.condition} (${weather.temperature}°C)`);

      // Test 7: Session validation
      console.log('7. Testing session validation...');
      const isValid = this.survivalSystem.validateSession(sessionId);
      console.log(`   ${isValid ? '✅' : '❌'} Session validation: ${isValid ? 'Valid' : 'Invalid'}`);

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async startSurvival(): Promise<void> {
    try {
      const sessionId = this.survivalSystem.startSession();
      this.sessionId = sessionId;
      console.log(`✅ Survival session started with ID: ${sessionId}`);
      console.log('🌲 Welcome to the wilderness! Your survival journey begins...');
    } catch (error) {
      console.error('❌ Failed to start survival session:', error);
    }
  }

  private getStats(): void {
    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      const stats = this.survivalSystem.getStats(this.sessionId);
      console.log('📊 Current Survival Stats:');
      console.log(`   🍎 Hunger: ${stats.hunger}/100 ${this.getStatusEmoji(stats.hunger)}`);
      console.log(`   💧 Thirst: ${stats.thirst}/100 ${this.getStatusEmoji(stats.thirst)}`);
      console.log(`   ⚡ Stamina: ${stats.stamina}/100 ${this.getStatusEmoji(stats.stamina)}`);
      console.log(`   ❤️  Health: ${stats.health}/100 ${this.getStatusEmoji(stats.health)}`);
      console.log(`   🌡️  Temperature: ${stats.temperature}°C ${this.getTemperatureEmoji(stats.temperature)}`);
      console.log(`   🏠 Shelter Integrity: ${stats.shelterIntegrity}/100 ${this.getStatusEmoji(stats.shelterIntegrity)}`);
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
    }
  }

  private async consumeResource(resourceType?: string): Promise<void> {
    if (!resourceType) {
      console.log('❌ Usage: consume <resource>');
      console.log('   Resources: food, water');
      return;
    }

    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      // Create a sample resource
      const resource: SurvivalResource = {
        id: `${resourceType}-${Date.now()}`,
        type: resourceType as ResourceType,
        name: resourceType === 'food' ? 'Berries' : 'Clean Water',
        value: resourceType === 'food' ? 25 : 30,
        quantity: 1
      };

      this.survivalSystem.addResource(this.sessionId, resource);
      const result = this.survivalSystem.consumeResource(this.sessionId, resource.id);
      
      if (result) {
        console.log(`✅ Consumed ${resource.name} (+${resource.value} ${resourceType})`);
      } else {
        console.log('❌ Failed to consume resource');
      }
    } catch (error) {
      console.error('❌ Resource consumption failed:', error);
    }
  }

  private async buildShelter(type?: string): Promise<void> {
    if (!type) {
      console.log('❌ Usage: build-shelter <type>');
      console.log('   Types: tent, cabin, house, fortress');
      return;
    }

    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      const result = this.survivalSystem.buildShelter(this.sessionId, type as ShelterType);
      if (result) {
        console.log(`✅ Built ${type} shelter! Your protection has increased.`);
      } else {
        console.log('❌ Failed to build shelter (insufficient resources)');
      }
    } catch (error) {
      console.error('❌ Shelter building failed:', error);
    }
  }

  private async gatherResource(resourceType?: string): Promise<void> {
    if (!resourceType) {
      console.log('❌ Usage: gather <resource>');
      console.log('   Resources: food, water, wood, stone, metal');
      return;
    }

    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      const result = this.survivalSystem.gatherResource(this.sessionId, resourceType as ResourceType);
      if (result) {
        console.log(`✅ Gathered ${resourceType}! Added to your inventory.`);
      } else {
        console.log(`❌ Failed to gather ${resourceType} (low stamina or bad weather)`);
      }
    } catch (error) {
      console.error('❌ Resource gathering failed:', error);
    }
  }

  private async craftItem(item?: string): Promise<void> {
    if (!item) {
      console.log('❌ Usage: craft <item>');
      console.log('   Items: rope, tools, weapon, medicine');
      return;
    }

    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      const result = this.survivalSystem.craftItem(this.sessionId, item);
      if (result) {
        console.log(`✅ Crafted ${item}! Your survival chances have improved.`);
      } else {
        console.log(`❌ Failed to craft ${item} (insufficient resources)`);
      }
    } catch (error) {
      console.error('❌ Crafting failed:', error);
    }
  }

  private checkWeather(): void {
    if (!this.sessionId) {
      console.log('❌ No active session. Start a survival session first.');
      return;
    }

    try {
      const weather = this.survivalSystem.getWeather(this.sessionId);
      console.log('🌤️  Current Weather:');
      console.log(`   Condition: ${weather.condition}`);
      console.log(`   Temperature: ${weather.temperature}°C`);
      console.log(`   Wind Speed: ${weather.windSpeed} km/h`);
      console.log(`   Precipitation: ${weather.precipitation}%`);
    } catch (error) {
      console.error('❌ Failed to check weather:', error);
    }
  }

  private async simulate(): Promise<void> {
    console.log('🎭 Starting survival simulation...');
    
    try {
      // Start survival session
      console.log('1. Starting survival session...');
      const sessionId = this.survivalSystem.startSession();
      this.sessionId = sessionId;
      console.log(`   ✅ Session started: ${sessionId}`);

      // Initial stats
      console.log('2. Initial survival stats...');
      const initialStats = this.survivalSystem.getStats(sessionId);
      console.log(`   🍎 Hunger: ${initialStats.hunger}, 💧 Thirst: ${initialStats.thirst}, ⚡ Stamina: ${initialStats.stamina}`);

      // Simulate survival activities
      console.log('3. Simulating survival activities...');
      
      // Gather resources
      console.log('   🌲 Gathering wood...');
      this.survivalSystem.gatherResource(sessionId, 'wood');
      
      console.log('   🍎 Gathering food...');
      this.survivalSystem.gatherResource(sessionId, 'food');
      
      console.log('   💧 Gathering water...');
      this.survivalSystem.gatherResource(sessionId, 'water');

      // Build shelter
      console.log('   🏠 Building tent shelter...');
      this.survivalSystem.buildShelter(sessionId, 'tent');

      // Craft items
      console.log('   🔧 Crafting rope...');
      this.survivalSystem.craftItem(sessionId, 'rope');
      
      console.log('   🛠️  Crafting tools...');
      this.survivalSystem.craftItem(sessionId, 'tools');

      // Consume resources
      console.log('   🍎 Consuming food...');
      const foodResource: SurvivalResource = {
        id: 'sim-food',
        type: 'food',
        name: 'Berries',
        value: 30,
        quantity: 1
      };
      this.survivalSystem.addResource(sessionId, foodResource);
      this.survivalSystem.consumeResource(sessionId, 'sim-food');

      // Check weather
      console.log('   🌤️  Checking weather...');
      const weather = this.survivalSystem.getWeather(sessionId);
      console.log(`      Weather: ${weather.condition} (${weather.temperature}°C)`);

      // Final stats
      console.log('4. Final survival stats...');
      const finalStats = this.survivalSystem.getStats(sessionId);
      console.log(`   🍎 Hunger: ${finalStats.hunger} (${finalStats.hunger > initialStats.hunger ? '↗️' : '↘️'})`);
      console.log(`   💧 Thirst: ${finalStats.thirst} (${finalStats.thirst > initialStats.thirst ? '↗️' : '↘️'})`);
      console.log(`   ⚡ Stamina: ${finalStats.stamina} (${finalStats.stamina > initialStats.stamina ? '↗️' : '↘️'})`);
      console.log(`   🏠 Shelter: ${finalStats.shelterIntegrity}%`);

      // Session validation
      const isValid = this.survivalSystem.validateSession(sessionId);
      console.log(`   ✅ Session Valid: ${isValid ? 'Yes' : 'No'}`);

      console.log('✅ Survival simulation completed successfully');

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  private getStatusEmoji(value: number): string {
    if (value >= 80) return '🟢';
    if (value >= 50) return '🟡';
    if (value >= 20) return '🟠';
    return '🔴';
  }

  private getTemperatureEmoji(temp: number): string {
    if (temp >= 30) return '🔥';
    if (temp >= 20) return '☀️';
    if (temp >= 10) return '🌤️';
    if (temp >= 0) return '🌨️';
    return '🥶';
  }

  private showHelp(): void {
    console.log(`
Available commands:
  test                     - Run basic survival system tests
  start-survival           - Start survival session
  get-stats                - Get current survival stats
  consume <resource>       - Consume resource
  build-shelter <type>     - Build shelter
  gather <resource>        - Gather resource
  craft <item>             - Craft item
  check-weather            - Check weather conditions
  simulate                 - Simulate survival scenario
  help                     - Show this help
  exit/quit                - Exit the CLI

Resources: food, water, wood, stone, metal
Shelter Types: tent, cabin, house, fortress
Craftable Items: rope, tools, weapon, medicine
`);
  }

  public async start(): Promise<void> {
    console.log('🚀 Survival System CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new SurvivalSystemCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}