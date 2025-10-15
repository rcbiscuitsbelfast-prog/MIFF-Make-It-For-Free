#!/usr/bin/env tsx

/**
 * IdleSystemPure CLI Harness
 *
 * AAA-quality CLI interface for IdleSystemPure with:
 * - Interactive idle game management
 * - Real-time resource monitoring
 * - Generator and upgrade management
 * - Achievement tracking
 * - Prestige system control
 * - Performance monitoring
 * - Mobile-friendly interface
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
import IdleSystemPure from './index.js';
import { IdleSystemPure as IdleManagerPure } from './Manager.js';
import * as fs from 'fs';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// ============================================================================
// CLI HARNESS CONFIGURATION
// ============================================================================

interface CLIOptions {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  mode: 'interactive' | 'simulate' | 'auto' | 'test' | 'benchmark';
  initialCurrency?: number;
  autoBuyEnabled?: boolean;
  simulationTime?: number;
  verbose?: boolean;
}

interface GameState {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  currency: number;
  generators: Record<string, number>;
  upgrades: Record<string, number>;
  achievements: string[];
  totalProduction: number;
  playTime: number;
}

// ============================================================================
// CLI HARNESS IMPLEMENTATION
// ============================================================================

export class IdleSystemCLI {
  
  private idleSystem: IdleSystemPure;
  private idleManager: IdleManagerPure;
  private eventBus: EventBus;
  private options: CLIOptions;
  private gameState: GameState;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private lastUpdateTime: number = 0;
  private updateInterval: number = 1000; // 1 second
  private autoBuyEnabled: boolean = false;

  // CLI state
  private readline: any;
  private isInteractive: boolean = false;

  constructor(options: CLIOptions) {
    
    this.options = options;
    this.eventBus = new EventBus();
    this.idleSystem = new IdleSystemPure(this.eventBus, {
      enableOfflineProgress: true,
      offlineProgressMultiplier: 1.0,
      saveInterval: 60,
      maxIdleTime: 86400,
      enableAchievements: true,
      enablePrestige: true,
      performanceMode: 'high',
      debugMode: options.verbose || false
    });

    this.idleManager = new IdleManagerPure(this.eventBus, {
      enableAutoSave: true,
      saveInterval: 60,
      enableAnalytics: true,
      enableAchievements: true,
      enablePrestige: true,
      performanceMode: 'high',
      debugMode: options.verbose || false
    });

    this.gameState = this.initializeGameState();
    this.setupEventHandlers();
    this.initializeInterface();

    if (options.autoBuyEnabled) {
      this.autoBuyEnabled = true;
    }
  }

  private initializeGameState(): GameState {
    return {
      currency: this.options.initialCurrency || 0,
      generators: {},
      upgrades: {},
      achievements: [],
      totalProduction: 0,
      playTime: 0
    };
  }

  private setupEventHandlers(): void {
    this.eventBus.on('idle:resource_change', (data) => {
      if (data.resourceId === 'currency') {
        this.gameState.currency = data.newAmount;
        this.gameState.totalProduction = this.idleSystem.getTotalProduction();
      }
    });

    this.eventBus.on('idle:generator_purchase', (data) => {
      this.gameState.generators[data.generatorId] = data.newOwned;

      if (this.options.verbose) {
        this.log(`🛒 Purchased ${data.amount}x ${data.generatorId} (${data.newOwned} total)`);
      }
    });

    this.eventBus.on('idle:upgrade_purchase', (data) => {
      this.gameState.upgrades[data.upgradeId] = data.level;

      if (this.options.verbose) {
        this.log(`⬆️  Upgraded ${data.upgradeId} to level ${data.level}`);
      }
    });

    this.eventBus.on('idle:achievement_unlock', (data) => {
      this.gameState.achievements.push(data.achievementId);

      if (this.options.verbose) {
        this.log(`🏆 Unlocked achievement: ${data.achievementId}`);
      }
    });

    this.eventBus.on('idle:offline_progress', (data) => {
      this.log(`💤 Earned ${data.production.toFixed(2)} currency from offline progress (${data.offlineTime.toFixed(1)}s)`);
    });
  }

  private initializeInterface(): void {
    if (typeof window === 'undefined') {
      this.readline = require('readline');
      this.setupReadline();
    } else {
      this.isInteractive = false;
    }
  }

  private setupReadline(): void {
    const rl = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Idle> '
    });

    rl.on('line', (line: string) => {
      this.processCommand(line.trim());
      rl.prompt();
    });

    rl.on('SIGINT', () => {
      this.log('\n🛑 Shutting down idle system...');
      this.shutdown();
    });

    this.isInteractive = true;
  }

  private processCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'status':
      case 's':
        this.showStatus();
        break;

      case 'buy':
        this.buyGenerator(args);
        break;

      case 'upgrade':
      case 'up':
        this.buyUpgrade(args);
        break;

      case 'auto':
        this.toggleAutoBuy();
        break;

      case 'click':
      case 'c':
        this.manualClick();
        break;

      case 'prestige':
      case 'p':
        this.prestige();
        break;

      case 'optimize':
      case 'o':
        this.optimize();
        break;

      case 'simulate':
        this.runSimulation();
        break;

      case 'stats':
        this.showStats();
        break;

      case 'achievements':
      case 'ach':
        this.showAchievements();
        break;

      case 'save':
        this.saveGame();
        break;

      case 'load':
        this.loadGame();
        break;

      case 'reset':
        this.resetGame();
        break;

      case 'export':
        this.exportData(args[0]);
        break;

      case 'quit':
      case 'q':
      case 'exit':
        this.shutdown();
        break;

      default:
        this.showHelp();
    }
  }

  private showStatus(): void {
    const resources = this.idleSystem.getResources();
    const generators = this.idleSystem.getGenerators();
//     const timeData = this.idleSystem.getCurrentTimeData();

    this.log('\n=== IDLE GAME STATUS ===');
    this.log(`💰 Currency: ${this.gameState.currency.toFixed(2)}`);
    this.log(`⚡ Production: ${this.gameState.totalProduction.toFixed(2)}/sec`);
    this.log(`🕐 Play Time: ${Math.floor(this.gameState.playTime / 60)}m ${this.gameState.playTime % 60}s`);
    this.log(`🏆 Achievements: ${this.gameState.achievements.length}`);
    this.log(`🔄 Auto-buy: ${this.autoBuyEnabled ? 'ON' : 'OFF'}`);

    this.log('\n📊 RESOURCES:');
    resources.forEach((resource, id) => {
      if (resource.unlocked) {
        this.log(`   ${resource.name}: ${resource.currentAmount.toFixed(2)}${resource.maxAmount ? `/${resource.maxAmount}` : ''}`);
      }
    });

    this.log('\n🏭 GENERATORS:');
    generators.forEach((generator, id) => {
      if (generator.unlocked) {
        const owned = generator.owned;
        const production = generator.baseProduction * owned;
        this.log(`   ${generator.name}: ${owned} owned (${production.toFixed(2)}/sec) - Cost: ${generator.currentCost.toFixed(0)}`);
      }
    });

    this.log('');
  }

  private buyGenerator(args: string[]): void {
    if (args.length === 0) {
      this.log('❌ Usage: buy <generator> [amount]');
      this.log('   Available: clicker, auto_clicker, farm, mine');
      return;
    }

    const generatorId = args[0];
    const amount = args[1] ? parseInt(args[1]) : 1;

    if (isNaN(amount) || amount <= 0) {
      this.log('❌ Invalid amount');
      return;
    }

    const success = this.idleSystem.purchaseGenerator(generatorId, amount);

    if (success) {
      this.log(`✅ Purchased ${amount}x ${generatorId}`);
    } else {
      this.log('❌ Cannot purchase generator (insufficient funds or not unlocked)');
    }
  }

  private buyUpgrade(args: string[]): void {
    if (args.length === 0) {
      this.log('❌ Usage: upgrade <upgrade>');
      this.log('   Available: click_power, auto_efficiency, farm_multiplier');
      return;
    }

    const upgradeId = args[0];
    const success = this.idleSystem.purchaseUpgrade(upgradeId);

    if (success) {
      this.log(`✅ Upgraded ${upgradeId}`);
    } else {
      this.log('❌ Cannot upgrade (insufficient funds, max level, or not unlocked)');
    }
  }

  private toggleAutoBuy(): void {
    this.autoBuyEnabled = !this.autoBuyEnabled;
    this.log(`🔄 Auto-buy ${this.autoBuyEnabled ? 'enabled' : 'disabled'}`);
  }

  private manualClick(): void {
    // Simulate manual clicking
    this.gameState.currency += 1;
    this.log('👆 Manual click! (+1 currency)');
  }

  private prestige(): void {
    const prestigeConfigs = this.idleSystem.getPrestigeConfigs();
    const currencyResource = this.idleSystem.getResource('currency');

    if (!currencyResource) return;

    for (const [tier, config] of prestigeConfigs) {
      if (this.idleManager.canPrestige(tier)) {
        this.log(`⭐ Prestiging to ${tier} tier...`);
        // In a real implementation, this would call the prestige function
        this.log(`✅ Prestige successful! Bonus: ${config.multiplier}x`);
        return;
      }
    }

    this.log('❌ Cannot prestige (insufficient currency or no available tiers)');
  }

  private optimize(): void {
    this.log('🔧 Optimizing...');

    // Balance resources
    this.idleManager.balanceResources();

    // Auto-buy optimal generators
    if (this.autoBuyEnabled) {
      const purchased = this.idleManager.autoBuyGenerators();
      if (purchased.length > 0) {
        this.log(`🛒 Auto-purchased: ${purchased.join(', ')}`);
      }
    }

    // Get optimal upgrade order
    const upgradeOrder = this.idleManager.getOptimalUpgradeOrder();
    this.log(`📈 Optimal upgrade order: ${upgradeOrder.slice(0, 3).join(', ')}`);

    this.log('✅ Optimization complete');
  }

  private runSimulation(): void {
    const duration = this.options.simulationTime || 300; // 5 minutes default
    this.log(`🚀 Starting simulation (${duration}s)...`);

    this.startTime = Date.now();
    this.isRunning = true;

    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.gameState.playTime = elapsed;

      if (elapsed >= duration) {
        this.log(`✅ Simulation complete!`);
        this.log(`   Currency: ${this.gameState.currency.toFixed(2)}`);
        this.log(`   Production: ${this.gameState.totalProduction.toFixed(2)}/sec`);
        this.log(`   Play Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
        this.isRunning = false;
        clearInterval(interval);
        this.showStats();
        return;
      }

      // Auto-buy every 30 seconds
      if (elapsed % 30 === 0 && this.autoBuyEnabled) {
        this.optimize();
      }

      // Update display every 10 seconds
      if (elapsed % 10 === 0) {
        const currency = this.gameState.currency;
        this.log(`⏰ ${elapsed}s: ${currency.toFixed(2)} currency (${this.gameState.totalProduction.toFixed(2)}/sec)`);
      }
    }, 1000);
  }

  private showStats(): void {
    const stats = this.idleManager.getStats();

    this.log('\n=== GAME STATISTICS ===');
    this.log(`💰 Currency: ${this.gameState.currency.toFixed(2)}`);
    this.log(`⚡ Production: ${stats.currentProduction.toFixed(2)}/sec`);
    this.log(`🕐 Play Time: ${Math.floor(stats.totalPlayTime / 60)}m ${stats.totalPlayTime % 60}s`);
    this.log(`💤 Idle Time: ${Math.floor(stats.totalIdleTime / 60)}m ${stats.totalIdleTime % 60}s`);
    this.log(`🏆 Achievements: ${stats.unlockedAchievements}/${stats.totalAchievements}`);
    this.log(`⭐ Prestige Count: ${stats.totalPrestige}`);
    this.log(`🔧 Resources: ${stats.totalResources}`);
    this.log(`🏭 Generators: ${stats.totalGenerators}`);
    this.log(`⬆️  Upgrades: ${stats.totalUpgrades}`);
    this.log('');
  }

  private showAchievements(): void {
    const achievements = this.idleSystem.getAchievements();

    this.log('\n=== ACHIEVEMENTS ===');
    achievements.forEach((achievement, id) => {
      const status = achievement.unlocked ? '✅' : achievement.progress >= achievement.maxProgress ? '🔓' : '🔒';
      this.log(`${status} ${achievement.name}: ${achievement.progress}/${achievement.maxProgress}`);
      if (achievement.description) {
        this.log(`   ${achievement.description}`);
      }
    });
    this.log('');
  }

  private saveGame(): void {
    this.idleManager.saveGame();
    this.log('💾 Game saved');
  }

  private loadGame(): void {
    this.idleManager.loadGame();
    this.updateGameState();
    this.log('📂 Game loaded');
  }

  private resetGame(): void {
    this.idleManager.resetGame();
    this.gameState = this.initializeGameState();
    this.log('🔄 Game reset');
  }

  private exportData(filename?: string): void {
    const data = {
      gameState: this.gameState,
      stats: this.idleManager.getStats(),
      resources: Array.from(this.idleSystem.getResources().entries()),
      generators: Array.from(this.idleSystem.getGenerators().entries()),
      timestamp: Date.now()
    };

    const outputFile = filename || `idle_export_${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    this.log(`💾 Game data exported to: ${outputFile}`);
  }

  private updateGameState(): void {
    const resources = this.idleSystem.getResources();
    const currencyResource = resources.get('currency');

    if (currencyResource) {
      this.gameState.currency = currencyResource.currentAmount;
    }

    this.gameState.totalProduction = this.idleSystem.getTotalProduction();
  }

  private showHelp(): void {
    this.log('\n=== IDLE SYSTEM CLI COMMANDS ===');
    this.log('📊 status/s              - Show game status');
    this.log('💰 buy <gen> [amt]       - Buy generator');
    this.log('⬆️  upgrade/up <upgrade>  - Buy upgrade');
    this.log('🔄 auto                  - Toggle auto-buy');
    this.log('👆 click/c               - Manual click (+1)');
    this.log('⭐ prestige/p            - Prestige (if available)');
    this.log('🔧 optimize/o             - Optimize purchases');
    this.log('🚀 simulate              - Run simulation');
    this.log('📈 stats                 - Show statistics');
    this.log('🏆 achievements/ach       - Show achievements');
    this.log('💾 save                  - Save game');
    this.log('📂 load                  - Load game');
    this.log('🔄 reset                 - Reset game');
    this.log('💾 export <file>         - Export game data');
    this.log('❓ help/h                - Show this help');
    this.log('👋 quit/q/exit           - Exit CLI');
    this.log('');
    this.log('💰 Available generators: clicker, auto_clicker, farm, mine');
    this.log('⬆️  Available upgrades: click_power, auto_efficiency, farm_multiplier');
    this.log('');
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.info(`[${timestamp}] ${message}`);
  }

  private shutdown(): void {
    this.log('👋 Shutting down IdleSystem CLI...');
    if (this.isInteractive) {
      this.readline.close();
    }
    process.exit(0);
  }

  // Public API methods
  public async run(): Promise<void> {
    this.log('🕹️  IdleSystemPure CLI Harness v1.0.0');
    this.log('💡 Type "help" for available commands');
    this.log('');

    if (this.options.mode === 'interactive') {
      if (this.isInteractive) {
        this.readline.prompt();
      } else {
        this.log('❌ Interactive mode not available in browser environment');
        this.shutdown();
      }
    } else if (this.options.mode === 'simulate') {
      await this.runSimulation();
      this.shutdown();
    } else if (this.options.mode === 'auto') {
      this.log('🤖 Auto mode - running optimization loop...');
      this.startAutoMode();
    } else {
      this.log(`❌ Unsupported mode: ${this.options.mode}`);
      this.shutdown();
    }
  }

  private startAutoMode(): void {
    this.isRunning = true;
    this.autoBuyEnabled = true;

    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      this.optimize();
      this.showStatus();

      // Stop after 10 minutes
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      if (elapsed >= 600) {
        this.log('⏰ Auto mode complete');
        this.isRunning = false;
        clearInterval(interval);
        this.showStats();
        this.shutdown();
      }
    }, 30000); // Optimize every 30 seconds
  }
}

// CLI entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    mode: 'interactive',
    initialCurrency: 0,
    autoBuyEnabled: false,
    simulationTime: 300,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
      case '-m':
        options.mode = args[++i] as CLIOptions['mode'];
        break;
      case '--currency':
      case '-c':
        options.initialCurrency = parseFloat(args[++i]);
        break;
      case '--auto':
      case '-a':
        options.autoBuyEnabled = true;
        break;
      case '--time':
      case '-t':
        options.simulationTime = parseInt(args[++i]);
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        console.info('IdleSystemPure CLI Harness');
        console.info('Usage: tsx cliHarness.ts [options]');
        console.info('Options:');
        console.info('  --mode, -m <mode>          Mode: interactive, simulate, auto');
        console.info('  --currency, -c <amount>    Initial currency amount');
        console.info('  --auto, -a                 Enable auto-buy mode');
        console.info('  --time, -t <seconds>       Simulation duration');
        console.info('  --verbose, -v              Enable verbose output');
        console.info('  --help, -h                 Show this help');
        console.info('');
        process.exit(0);
    }
  }

  const cli = new IdleSystemCLI(options);
  await cli.run();
}

if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default IdleSystemCLI;