#!/usr/bin/env node

/**
 * ProgressionPure CLI Harness - AAA Quality Progression Testing
 *
 * Interactive command-line interface for testing progression mechanics:
 * - XP management and level ups
 * - XP curve visualization
 * - Stat growth and effects
 * - Performance benchmarking
 * - Mobile-friendly controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';
import { XPManager, XPCurve, XPCurveType } from './index.js';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

interface CliCommand {
  command: string;
  description: string;
  handler: (args: string[]) => void;
}

class ProgressionCli {
  private logger: StructuredLogger;
  private manager: XPManager;
  private eventBus: EventBus;
  private spirits: Map<string, any> = new Map();
  private commands: Map<string, CliCommand> = new Map();
  private isRunning: boolean = true;

  constructor() {
    this.logger = new StructuredLogger({ module: 'ProgressionCli' });
    this.eventBus = new EventBus();

    // Create XP curve
    const curve: XPCurve = {
      type: 'exponential',
      maxLevel: 50,
      baseXP: 100,
      exponent: 1.5,
      customThresholds: new Map(),
      getXPForLevel: (level: number) => {
        const clampedLevel = Math.max(1, Math.min(50, level));
        return Math.floor(100 * Math.pow(clampedLevel - 1, 1.5));
      }
    };

    // Create XP manager
    this.manager = new XPManager(this.eventBus, curve, {
      enableLevelUpEffects: true,
      enableStatGrowth: true,
      enableEvolutionTriggers: true,
      xpMultiplier: 1.0,
      levelCap: 50,
      debugMode: true
    });

    this.setupCommands();
    this.setupEventListeners();
    this.createDefaultSpirits();

    this.logger.info('🆙 ProgressionPure CLI - AAA XP and Leveling System');
    this.logger.info('Type "help" for available commands or "quit" to exit.\n');
  }

  private setupCommands(): void {
    this.commands.set('create-spirit', {
      command: 'create-spirit <species> <level> [xp]',
      description: 'Create a test spirit',
      handler: (args) => this.handleCreateSpirit(args)
    });

    this.commands.set('list-spirits', {
      command: 'list-spirits',
      description: 'List all spirits',
      handler: (args) => this.handleListSpirits(args)
    });

    this.commands.set('show-curve', {
      command: 'show-curve [levels]',
      description: 'Display XP curve for levels',
      handler: (args) => this.handleShowCurve(args)
    });

    this.commands.set('add-xp', {
      command: 'add-xp <spiritId> <amount>',
      description: 'Add XP to a spirit',
      handler: (args) => this.handleAddXP(args)
    });

    this.commands.set('set-xp', {
      command: 'set-xp <spiritId> <amount>',
      description: 'Set XP for a spirit',
      handler: (args) => this.handleSetXP(args)
    });

    this.commands.set('show-progress', {
      command: 'show-progress <spiritId>',
      description: 'Show progression details',
      handler: (args) => this.handleShowProgress(args)
    });

    this.commands.set('level-up', {
      command: 'level-up <spiritId>',
      description: 'Force level up (if enough XP)',
      handler: (args) => this.handleLevelUp(args)
    });

    this.commands.set('simulate', {
      command: 'simulate <spiritId> <battles>',
      description: 'Simulate XP gain from battles',
      handler: (args) => this.handleSimulate(args)
    });

    this.commands.set('benchmark', {
      command: 'benchmark <operations>',
      description: 'Run performance benchmark',
      handler: (args) => this.handleBenchmark(args)
    });

    this.commands.set('stats', {
      command: 'stats <spiritId>',
      description: 'Show detailed spirit stats',
      handler: (args) => this.handleStats(args)
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
    this.eventBus.on('xp:gained', (data) => {
      this.logger.info(`⚡ ${data.spiritId} gained ${data.amount} XP (Total: ${data.totalXP})`);
    });

    this.eventBus.on('spirit:level_up', (data) => {
      const spirit = this.spirits.get(data.spiritId);
      if (spirit) {
        this.logger.info(`🎉 ${spirit.speciesId} reached level ${data.newLevel}!`);
        this.logger.info(`   HP: ${spirit.maxHP}, Attack: ${spirit.attack}, Special Attack: ${spirit.specialAttack}`);
      }
    });

    this.eventBus.on('progression:level_up', (data) => {
      this.logger.info(`📈 Progression: ${data.spiritId} leveled up to ${data.newLevel}`);
    });
  }

  private createDefaultSpirits(): void {
    const species = ['fire_spirit', 'water_spirit', 'grass_spirit', 'electric_spirit'];
    species.forEach((species, index) => {
      const spirit = this.createSpirit(species, 5 + index * 2, 0);
      this.spirits.set(spirit.instanceId, spirit);
    });
  }

  private createSpirit(speciesId: string, level: number, experience: number): any {
    return {
      instanceId: `${speciesId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      speciesId: speciesId,
      level: level,
      experience: experience,
      maxHP: 50 + (level - 1) * 2,
      currentHP: 50 + (level - 1) * 2,
      attack: 10 + (level - 1),
      defense: 8 + (level - 1) * 0.5,
      speed: 12 + (level - 1) * 0.5,
      specialAttack: 15 + (level - 1),
      specialDefense: 10 + (level - 1) * 0.5
    };
  }

  private handleCreateSpirit(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: create-spirit <species> <level> [xp]');
      return;
    }

    const [species, levelStr, xpStr] = args;
    const level = parseInt(levelStr) || 1;
    const experience = parseInt(xpStr) || 0;

    const spirit = this.createSpirit(species, level, experience);
    this.spirits.set(spirit.instanceId, spirit);

    this.logger.info(`✅ Spirit created: ${spirit.speciesId}`);
    this.logger.info(`   ID: ${spirit.instanceId}`);
    this.logger.info(`   Level: ${spirit.level}`);
    this.logger.info(`   XP: ${spirit.experience}`);
    this.logger.info(`   HP: ${spirit.maxHP}/${spirit.currentHP}`);
  }

  private handleListSpirits(args: string[]): void {
    this.logger.info('\n🧬 Spirits:');
    this.logger.info('─'.repeat(60));
    this.logger.info('ID              | Species       | Level | XP      | HP    | Attack | Sp.Att');
    this.logger.info('─'.repeat(60));

    this.spirits.forEach(spirit => {
      const id = spirit.instanceId.substring(0, 15).padEnd(15);
      const species = spirit.speciesId.padEnd(13);
      const level = spirit.level.toString().padEnd(5);
      const xp = (spirit.experience || 0).toString().padEnd(7);
      const hp = `${spirit.currentHP}/${spirit.maxHP}`.padEnd(6);
      const attack = spirit.attack.toString().padEnd(6);
      const spAttack = spirit.specialAttack.toString().padEnd(6);

      this.logger.info(`${id} | ${species} | ${level} | ${xp} | ${hp} | ${attack} | ${spAttack}`);
    });
    this.logger.info('─'.repeat(60));
  }

  private handleShowCurve(args: string[]): void {
    const levels = parseInt(args[0]) || 10;

    this.logger.info(`\n📈 XP Curve (Levels 1-${levels}):`);
    this.logger.info('─'.repeat(40));
    this.logger.info('Level | XP Required | Cumulative XP');
    this.logger.info('─'.repeat(40));

    let cumulativeXP = 0;
    for (let level = 1; level <= levels; level++) {
      const xpForLevel = this.manager.getCurve().getXPForLevel(level);
      cumulativeXP += xpForLevel;

      const levelStr = level.toString().padEnd(5);
      const xpStr = xpForLevel.toString().padEnd(11);
      const cumStr = cumulativeXP.toString().padEnd(13);

      this.logger.info(`${levelStr} | ${xpStr} | ${cumStr}`);
    }
    this.logger.info('─'.repeat(40));
  }

  private handleAddXP(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: add-xp <spiritId> <amount>');
      return;
    }

    const [spiritId, amountStr] = args;
    const amount = parseInt(amountStr);

    if (amount <= 0) {
      this.logger.info('❌ XP amount must be positive');
      return;
    }

    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    this.manager.addXP(spirit, amount);
    this.logger.info(`✅ Added ${amount} XP to ${spirit.speciesId}`);
  }

  private handleSetXP(args: string[]): void {
    if (args.length < 2) {
      this.logger.info('Usage: set-xp <spiritId> <amount>');
      return;
    }

    const [spiritId, amountStr] = args;
    const amount = parseInt(amountStr);

    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    this.manager.setXP(spirit, amount);
    this.logger.info(`✅ Set XP to ${amount} for ${spirit.speciesId}`);
  }

  private handleShowProgress(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: show-progress <spiritId>');
      return;
    }

    const [spiritId] = args;
    const spirit = this.spirits.get(spiritId);

    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    const progress = this.manager.getLevelProgress(spirit);
    const stats = this.manager.getProgressionStats(spirit);

    this.logger.info(`\n📊 Progression for ${spirit.speciesId}:`);
    this.logger.info('─'.repeat(40));
    this.logger.info(`Current Level: ${spirit.level}`);
    this.logger.info(`Current XP: ${spirit.experience || 0}`);
    this.logger.info(`XP to Next: ${progress.xpToNextLevel}`);
    this.logger.info(`Progress: ${progress.progress.toFixed(1)}%`);
    this.logger.info(`Can Level Up: ${progress.canLevelUp ? '✅ Yes' : '❌ No'}`);
    this.logger.info(`Total Level Ups: ${stats.totalLevelUps}`);
    this.logger.info(`Average XP/Level: ${stats.averageXPPerLevel.toFixed(0)}`);
    this.logger.info('─'.repeat(40));
  }

  private handleLevelUp(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: level-up <spiritId>');
      return;
    }

    const [spiritId] = args;
    const spirit = this.spirits.get(spiritId);

    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    const leveledUp = this.manager.checkLevelUp(spirit);

    if (leveledUp) {
      this.logger.info(`🎉 ${spirit.speciesId} leveled up to ${spirit.level}!`);
    } else {
      const progress = this.manager.getLevelProgress(spirit);
      this.logger.info(`❌ Not enough XP. Need ${progress.xpToNextLevel - (spirit.experience || 0)} more XP`);
    }
  }

  private async handleSimulate(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('Usage: simulate <spiritId> <battles>');
      return;
    }

    const [spiritId, battlesStr] = args;
    const battles = parseInt(battlesStr) || 10;

    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    this.logger.info(`🧪 Simulating ${battles} battles for ${spirit.speciesId}...`);

    const initialLevel = spirit.level;
    const initialXP = spirit.experience || 0;

    for (let i = 0; i < battles; i++) {
      // Random XP gain between 10-50
      const xpGain = Math.floor(Math.random() * 40) + 10;
      this.manager.addXP(spirit, xpGain);

      // Brief pause
      await this.sleep(50);
    }

    const finalLevel = spirit.level;
    const finalXP = spirit.experience || 0;
    const totalXPGained = finalXP - initialXP;
    const levelsGained = finalLevel - initialLevel;

    this.logger.info('\n✅ Simulation completed!');
    this.logger.info(`   Initial Level: ${initialLevel} (${initialXP} XP)`);
    this.logger.info(`   Final Level: ${finalLevel} (${finalXP} XP)`);
    this.logger.info(`   Levels Gained: ${levelsGained}`);
    this.logger.info(`   Total XP Gained: ${totalXPGained}`);
    this.logger.info(`   Average XP/Battle: ${(totalXPGained / battles).toFixed(1)}`);
  }

  private async handleBenchmark(args: string[]): Promise<void> {
    const operations = parseInt(args[0]) || 1000;
    this.logger.info(`🔬 Running benchmark with ${operations} operations...`);

    const startTime = performance.now();

    for (let i = 0; i < operations; i++) {
      // Test XP calculations
      const mockSpirit = { level: 25, experience: 1000 };
      this.manager.getLevelProgress(mockSpirit);
      this.manager.getNextLevelXP(mockSpirit);

      // Test curve calculations
      this.manager.getCurve().getXPForLevel(25);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    const opsPerSecond = (operations / duration) * 1000;

    this.logger.info(`\n📈 Benchmark Results:`);
    this.logger.info(`   Total Operations: ${operations}`);
    this.logger.info(`   Duration: ${duration.toFixed(2)}ms`);
    this.logger.info(`   Operations/sec: ${opsPerSecond.toFixed(0)}`);
    this.logger.info(`   Average Time/Operation: ${(duration / operations).toFixed(4)}ms`);
  }

  private handleStats(args: string[]): void {
    if (args.length < 1) {
      this.logger.info('Usage: stats <spiritId>');
      return;
    }

    const [spiritId] = args;
    const spirit = this.spirits.get(spiritId);

    if (!spirit) {
      this.logger.info('❌ Spirit not found');
      return;
    }

    const progress = this.manager.getLevelProgress(spirit);
    const stats = this.manager.getProgressionStats(spirit);

    this.logger.info(`\n📊 ${spirit.speciesId} Stats:`);
    this.logger.info('─'.repeat(50));
    this.logger.info(`Level: ${spirit.level}`);
    this.logger.info(`Experience: ${spirit.experience || 0}`);
    this.logger.info(`Progress to Next: ${progress.progress.toFixed(1)}%`);
    this.logger.info(`XP to Next Level: ${progress.xpToNextLevel}`);

    this.logger.info('\n⚔️ Combat Stats:');
    this.logger.info(`   HP: ${spirit.currentHP}/${spirit.maxHP}`);
    this.logger.info(`   Attack: ${spirit.attack}`);
    this.logger.info(`   Defense: ${spirit.defense}`);
    this.logger.info(`   Speed: ${spirit.speed}`);
    this.logger.info(`   Special Attack: ${spirit.specialAttack}`);
    this.logger.info(`   Special Defense: ${spirit.specialDefense}`);

    this.logger.info('\n📈 Progression Stats:');
    this.logger.info(`   Total Level Ups: ${stats.totalLevelUps}`);
    this.logger.info(`   Total XP: ${stats.totalXP}`);
    this.logger.info(`   Average XP/Level: ${stats.averageXPPerLevel.toFixed(0)}`);
    this.logger.info('─'.repeat(50));
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

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async run(): Promise<void> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'progression> '
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
  const cli = new ProgressionCli();
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

export { ProgressionCli };