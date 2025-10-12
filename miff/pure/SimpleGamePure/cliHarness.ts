#!/usr/bin/env node

/**
 * SimpleGamePure CLI Harness
 *
 * Interactive CLI for testing and demonstrating SimpleGamePure functionality.
 * Perfect for quick testing, game jams, and learning MIFF module integration.
 *
 * Usage:
 *   npx ts-node SimpleGamePure/cliHarness.ts
 *   node dist/SimpleGamePure/cliHarness.js
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  SimpleGameBuilder,
  GameType,
  DifficultyLevel,
  SimpleGameUtils,
  SimpleClickerGame,
  SimplePlatformerGame,
  SimpleArcadeGame,
  SimpleRPGGame
} from './index';

class SimpleGameCLI {
  private logger: StructuredLogger;
  private rl: readline.Interface;
  private currentGame: any = null;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor() {
    this.logger = new StructuredLogger({ module: 'SimpleGameCLI' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.showWelcome();
    this.showMenu();
  }

  private showWelcome(): void {
    this.logger.info('\n🎮 Welcome to SimpleGamePure CLI Harness! 🎮\n');
    this.logger.info('This interactive tool lets you test and play with SimpleGamePure.');
    this.logger.info('Perfect for game jams, prototypes, and learning MIFF modules.\n');
  }

  private showMenu(): void {
    this.logger.info('📋 Available Commands:');
    this.logger.info('1. 🎯 Create Clicker Game');
    this.logger.info('2. 🕹️ Create Platformer Game');
    this.logger.info('3. 👾 Create Arcade Game');
    this.logger.info('4. ⚔️ Create RPG Game');
    this.logger.info('5. 🎮 Play Current Game');
    this.logger.info('6. 📊 Show Game Stats');
    this.logger.info('7. 🏆 Show Achievements');
    this.logger.info('8. 💾 Save Game');
    this.logger.info('9. 📁 Load Game');
    this.logger.info('0. 🚪 Exit\n');

    this.askForCommand();
  }

  private askForCommand(): void {
    this.rl.question('Enter command (0-9): ', (answer) => {
      this.handleCommand(answer.trim());
    });
  }

  private handleCommand(command: string): void {
    switch (command) {
      case '1':
        this.createClickerGame();
        break;
      case '2':
        this.createPlatformerGame();
        break;
      case '3':
        this.createArcadeGame();
        break;
      case '4':
        this.createRPGGame();
        break;
      case '5':
        this.playGame();
        break;
      case '6':
        this.showStats();
        break;
      case '7':
        this.showAchievements();
        break;
      case '8':
        this.saveGame();
        break;
      case '9':
        this.loadGame();
        break;
      case '0':
        this.exit();
        break;
      default:
        this.logger.info('❌ Invalid command. Please enter a number from 0-9.\n');
        this.showMenu();
    }
  }

  private createClickerGame(): void {
    this.logger.info('\n🎯 Creating Clicker Game...\n');

    this.currentGame = SimpleGameBuilder.createClickerGame({
      title: 'CLI Clicker Demo',
      difficulty: DifficultyLevel.EASY,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    this.logger.info('✅ Clicker Game created and started!');
    this.logger.info('💡 Type "5" to start playing, or "6" to see stats.\n');
    this.showMenu();
  }

  private createPlatformerGame(): void {
    this.logger.info('\n🕹️ Creating Platformer Game...\n');

    this.currentGame = SimpleGameBuilder.createPlatformerGame({
      title: 'CLI Platformer Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    this.logger.info('✅ Platformer Game created and started!');
    this.logger.info('💡 Use WASD to move, Space to jump.\n');
    this.showMenu();
  }

  private createArcadeGame(): void {
    this.logger.info('\n👾 Creating Arcade Game...\n');

    this.currentGame = SimpleGameBuilder.createArcadeGame({
      title: 'CLI Arcade Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 100,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    this.logger.info('✅ Arcade Game created and started!');
    this.logger.info('💡 Use Space to shoot, avoid enemies.\n');
    this.showMenu();
  }

  private createRPGGame(): void {
    this.logger.info('\n⚔️ Creating RPG Game...\n');

    this.currentGame = SimpleGameBuilder.createRPGGame({
      title: 'CLI RPG Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 50,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    this.logger.info('✅ RPG Game created and started!');
    this.logger.info('💡 Explore and fight enemies.\n');
    this.showMenu();
  }

  private playGame(): void {
    if (!this.currentGame) {
      this.logger.info('❌ No game created. Please create a game first (options 1-4).\n');
      this.showMenu();
      return;
    }

    this.logger.info('\n🎮 Game Controls:');
    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.currentGame instanceof SimpleClickerGame) {
      this.logger.info('🖱️  Click anywhere to earn currency');
      this.logger.info('🆙 Type "upgrade" to upgrade click power');
      this.logger.info('🤖 Type "auto" to buy auto-clickers');
      this.logger.info('💰 Type "stats" to see currency and upgrades');
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      this.logger.info('⌨️  Movement: W/A/S/D keys');
      this.logger.info('🦘 Jump: Spacebar');
      this.logger.info('🪙 Type "collect" to collect coins');
      this.logger.info('📍 Type "pos" to show player position');
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      this.logger.info('🔫 Shoot: Spacebar');
      this.logger.info('💔 Lives remaining: ' + this.currentGame.getLives());
      this.logger.info('🎯 Type "shoot" to fire');
      this.logger.info('📊 Type "stats" to show game stats');
    } else if (this.currentGame instanceof SimpleRPGGame) {
      this.logger.info('⚔️  Type "attack" to attack enemies');
      this.logger.info('🏃 Type "explore" to find enemies');
      this.logger.info('🩸 Health: ' + this.currentGame.getPlayer().health);
      this.logger.info('📈 Level: ' + this.currentGame.getStats().level);
    }

    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.info('📝 Type "menu" to return to main menu\n');

    this.startInteractiveMode();
  }

  private startInteractiveMode(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    this.gameLoop = setInterval(() => {
      if (this.currentGame) {
        this.currentGame.update(16); // 60fps
      }
    }, 16);

    this.rl.question('🎮 Game> ', (input) => {
      this.handleGameInput(input.trim().toLowerCase());
    });
  }

  private handleGameInput(input: string): void {
    if (input === 'menu') {
      if (this.gameLoop) {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
      }
      this.logger.info('\n📋 Returning to main menu...\n');
      this.showMenu();
      return;
    }

    if (!this.currentGame) {
      this.logger.info('❌ No active game. Type "menu" to return.\n');
      this.startInteractiveMode();
      return;
    }

    try {
      this.processGameCommand(input);
    } catch (error) {
      this.logger.info('❌ Error processing command:', error);
    }

    this.startInteractiveMode();
  }

  private processGameCommand(command: string): void {
    if (this.currentGame instanceof SimpleClickerGame) {
      this.handleClickerCommands(command);
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      this.handlePlatformerCommands(command);
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      this.handleArcadeCommands(command);
    } else if (this.currentGame instanceof SimpleRPGGame) {
      this.handleRPGCommands(command);
    } else {
      this.logger.info('❓ Unknown command. Type "menu" for help.');
    }
  }

  private handleClickerCommands(command: string): void {
    switch (command) {
      case '':
        this.currentGame.click();
        this.logger.info('🖱️ Clicked! +1 currency');
        break;
      case 'upgrade':
        if (this.currentGame.upgradeClickPower()) {
          this.logger.info('🆙 Click power upgraded! New power: ' + this.currentGame.getClickPower());
        } else {
          this.logger.info('❌ Not enough currency for upgrade');
        }
        break;
      case 'auto':
        if (this.currentGame.buyAutoClicker()) {
          this.logger.info('🤖 Auto-clicker purchased! Total: ' + this.currentGame.getAutoClickers());
        } else {
          this.logger.info('❌ Not enough currency for auto-clicker');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        this.logger.info('❓ Clicker commands: [click], "upgrade", "auto", "stats", or "menu"');
    }
  }

  private handlePlatformerCommands(command: string): void {
    switch (command) {
      case 'w':
        this.logger.info('⬆️ Moving up');
        break;
      case 'a':
        this.logger.info('⬅️ Moving left');
        break;
      case 's':
        this.logger.info('⬇️ Moving down');
        break;
      case 'd':
        this.logger.info('➡️ Moving right');
        break;
      case ' ':
      case 'space':
        this.currentGame.jump();
        this.logger.info('🦘 Jumped!');
        break;
      case 'collect':
        this.currentGame.collectCoin();
        this.logger.info('🪙 Coin collected!');
        break;
      case 'pos':
        const pos = this.currentGame.getPlayerPosition();
        this.logger.info(`📍 Player position: (${pos.x}, ${pos.y})`);
        break;
      default:
        this.logger.info('❓ Platformer commands: w/a/s/d, "space", "collect", "pos", or "menu"');
    }
  }

  private handleArcadeCommands(command: string): void {
    switch (command) {
      case ' ':
      case 'space':
        if (this.currentGame.shoot()) {
          this.logger.info('🔫 Shot fired!');
        } else {
          this.logger.info('❌ Cannot shoot yet (rate limit)');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        this.logger.info('❓ Arcade commands: "space", "stats", or "menu"');
    }
  }

  private handleRPGCommands(command: string): void {
    switch (command) {
      case 'attack':
        if (this.currentGame.attack()) {
          this.logger.info('⚔️ Attacked!');
        } else {
          this.logger.info('❌ No enemy in combat');
        }
        break;
      case 'explore':
        this.logger.info('🏃 Exploring for enemies...');
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        this.logger.info('❓ RPG commands: "attack", "explore", "stats", or "menu"');
    }
  }

  private showStats(): void {
    if (!this.currentGame) {
      this.logger.info('❌ No active game');
      return;
    }

    const stats = this.currentGame.getStats();
    const config = this.currentGame.getConfig();

    this.logger.info('\n📊 Game Statistics:');
    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.info(`🎮 Game: ${config.title}`);
    this.logger.info(`🎯 Type: ${config.gameType}`);
    this.logger.info(`⭐ Difficulty: ${config.difficulty}`);
    this.logger.info(`⏰ Play Time: ${SimpleGameUtils.formatTime(stats.playTime)}`);
    this.logger.info(`💰 Currency: ${SimpleGameUtils.formatCurrency(stats.currency)}`);
    this.logger.info(`🎖️ Score: ${stats.score.toLocaleString()}`);
    this.logger.info(`📊 Level: ${stats.level}`);
    this.logger.info(`🪙 Items Collected: ${stats.itemsCollected}`);
    this.logger.info(`🏆 Achievements: ${stats.achievements.length}`);

    // Game-specific stats
    if (this.currentGame instanceof SimpleClickerGame) {
      this.logger.info(`🖱️ Click Power: ${this.currentGame.getClickPower()}`);
      this.logger.info(`🤖 Auto-Clickers: ${this.currentGame.getAutoClickers()}`);
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      this.logger.info(`🪙 Coins: ${this.currentGame.getCoins()}`);
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      this.logger.info(`❤️ Lives: ${this.currentGame.getLives()}`);
    } else if (this.currentGame instanceof SimpleRPGGame) {
      const player = this.currentGame.getPlayer();
      this.logger.info(`❤️ Health: ${player.health}/${player.maxHealth}`);
      this.logger.info(`⚔️ Attack: ${player.attack}`);
      this.logger.info(`🛡️ Defense: ${player.defense}`);
      this.logger.info(`📈 Experience: ${player.experience}/${player.experienceToNext}`);
    }

    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private showAchievements(): void {
    if (!this.currentGame) {
      this.logger.info('❌ No active game');
      return;
    }

    const achievements = this.currentGame.getAchievements();

    this.logger.info('\n🏆 Achievements:');
    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (achievements.length === 0) {
      this.logger.info('📭 No achievements unlocked yet');
    } else {
      achievements.forEach((achievement, index) => {
        this.logger.info(`${index + 1}. ${achievement.icon} ${achievement.name}`);
        this.logger.info(`   ${achievement.description}`);
      });
    }

    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private saveGame(): void {
    this.logger.info('\n💾 Save feature coming soon!');
    this.logger.info('This would save the current game state.\n');
    this.showMenu();
  }

  private loadGame(): void {
    this.logger.info('\n📁 Load feature coming soon!');
    this.logger.info('This would load a previously saved game.\n');
    this.showMenu();
  }

  private exit(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    if (this.currentGame) {
      this.currentGame.stop();
      this.logger.info('⏹️ Game stopped.');
    }

    this.logger.info('\n👋 Thanks for using SimpleGamePure CLI!');
    this.logger.info('Happy game development! 🎮✨\n');

    this.rl.close();
    process.exit(0);
  }

  // Public method to start the CLI
  public start(): void {
    // CLI is already running in constructor
  }
}

// Auto-start if this file is run directly
if (require.main === module) {
  const cli = new SimpleGameCLI();
  cli.start();
}

export { SimpleGameCLI };