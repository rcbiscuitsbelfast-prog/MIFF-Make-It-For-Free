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
    console.info('\n🎮 Welcome to SimpleGamePure CLI Harness! 🎮\n');
    console.info('This interactive tool lets you test and play with SimpleGamePure.');
    console.info('Perfect for game jams, prototypes, and learning MIFF modules.\n');
  }

  private showMenu(): void {
    console.info('📋 Available Commands:');
    console.info('1. 🎯 Create Clicker Game');
    console.info('2. 🕹️ Create Platformer Game');
    console.info('3. 👾 Create Arcade Game');
    console.info('4. ⚔️ Create RPG Game');
    console.info('5. 🎮 Play Current Game');
    console.info('6. 📊 Show Game Stats');
    console.info('7. 🏆 Show Achievements');
    console.info('8. 💾 Save Game');
    console.info('9. 📁 Load Game');
    console.info('0. 🚪 Exit\n');

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
        console.info('❌ Invalid command. Please enter a number from 0-9.\n');
        this.showMenu();
    }
  }

  private createClickerGame(): void {
    console.info('\n🎯 Creating Clicker Game...\n');

    this.currentGame = SimpleGameBuilder.createClickerGame({
      title: 'CLI Clicker Demo',
      difficulty: DifficultyLevel.EASY,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.info('✅ Clicker Game created and started!');
    console.info('💡 Type "5" to start playing, or "6" to see stats.\n');
    this.showMenu();
  }

  private createPlatformerGame(): void {
    console.info('\n🕹️ Creating Platformer Game...\n');

    this.currentGame = SimpleGameBuilder.createPlatformerGame({
      title: 'CLI Platformer Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.info('✅ Platformer Game created and started!');
    console.info('💡 Use WASD to move, Space to jump.\n');
    this.showMenu();
  }

  private createArcadeGame(): void {
    console.info('\n👾 Creating Arcade Game...\n');

    this.currentGame = SimpleGameBuilder.createArcadeGame({
      title: 'CLI Arcade Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 100,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.info('✅ Arcade Game created and started!');
    console.info('💡 Use Space to shoot, avoid enemies.\n');
    this.showMenu();
  }

  private createRPGGame(): void {
    console.info('\n⚔️ Creating RPG Game...\n');

    this.currentGame = SimpleGameBuilder.createRPGGame({
      title: 'CLI RPG Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 50,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.info('✅ RPG Game created and started!');
    console.info('💡 Explore and fight enemies.\n');
    this.showMenu();
  }

  private playGame(): void {
    if (!this.currentGame) {
      console.info('❌ No game created. Please create a game first (options 1-4).\n');
      this.showMenu();
      return;
    }

    console.info('\n🎮 Game Controls:');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.currentGame instanceof SimpleClickerGame) {
      console.info('🖱️  Click anywhere to earn currency');
      console.info('🆙 Type "upgrade" to upgrade click power');
      console.info('🤖 Type "auto" to buy auto-clickers');
      console.info('💰 Type "stats" to see currency and upgrades');
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      console.info('⌨️  Movement: W/A/S/D keys');
      console.info('🦘 Jump: Spacebar');
      console.info('🪙 Type "collect" to collect coins');
      console.info('📍 Type "pos" to show player position');
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      console.info('🔫 Shoot: Spacebar');
      console.info('💔 Lives remaining: ' + this.currentGame.getLives());
      console.info('🎯 Type "shoot" to fire');
      console.info('📊 Type "stats" to show game stats');
    } else if (this.currentGame instanceof SimpleRPGGame) {
      console.info('⚔️  Type "attack" to attack enemies');
      console.info('🏃 Type "explore" to find enemies');
      console.info('🩸 Health: ' + this.currentGame.getPlayer().health);
      console.info('📈 Level: ' + this.currentGame.getStats().level);
    }

    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.info('📝 Type "menu" to return to main menu\n');

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
      console.info('\n📋 Returning to main menu...\n');
      this.showMenu();
      return;
    }

    if (!this.currentGame) {
      console.info('❌ No active game. Type "menu" to return.\n');
      this.startInteractiveMode();
      return;
    }

    try {
      this.processGameCommand(input);
    } catch (error) {
      console.info('❌ Error processing command:', error);
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
      console.info('❓ Unknown command. Type "menu" for help.');
    }
  }

  private handleClickerCommands(command: string): void {
    switch (command) {
      case '':
        this.currentGame.click();
        console.info('🖱️ Clicked! +1 currency');
        break;
      case 'upgrade':
        if (this.currentGame.upgradeClickPower()) {
          console.info('🆙 Click power upgraded! New power: ' + this.currentGame.getClickPower());
        } else {
          console.info('❌ Not enough currency for upgrade');
        }
        break;
      case 'auto':
        if (this.currentGame.buyAutoClicker()) {
          console.info('🤖 Auto-clicker purchased! Total: ' + this.currentGame.getAutoClickers());
        } else {
          console.info('❌ Not enough currency for auto-clicker');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.info('❓ Clicker commands: [click], "upgrade", "auto", "stats", or "menu"');
    }
  }

  private handlePlatformerCommands(command: string): void {
    switch (command) {
      case 'w':
        console.info('⬆️ Moving up');
        break;
      case 'a':
        console.info('⬅️ Moving left');
        break;
      case 's':
        console.info('⬇️ Moving down');
        break;
      case 'd':
        console.info('➡️ Moving right');
        break;
      case ' ':
      case 'space':
        this.currentGame.jump();
        console.info('🦘 Jumped!');
        break;
      case 'collect':
        this.currentGame.collectCoin();
        console.info('🪙 Coin collected!');
        break;
      case 'pos':
        const pos = this.currentGame.getPlayerPosition();
        console.info(`📍 Player position: (${pos.x}, ${pos.y})`);
        break;
      default:
        console.info('❓ Platformer commands: w/a/s/d, "space", "collect", "pos", or "menu"');
    }
  }

  private handleArcadeCommands(command: string): void {
    switch (command) {
      case ' ':
      case 'space':
        if (this.currentGame.shoot()) {
          console.info('🔫 Shot fired!');
        } else {
          console.info('❌ Cannot shoot yet (rate limit)');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.info('❓ Arcade commands: "space", "stats", or "menu"');
    }
  }

  private handleRPGCommands(command: string): void {
    switch (command) {
      case 'attack':
        if (this.currentGame.attack()) {
          console.info('⚔️ Attacked!');
        } else {
          console.info('❌ No enemy in combat');
        }
        break;
      case 'explore':
        console.info('🏃 Exploring for enemies...');
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.info('❓ RPG commands: "attack", "explore", "stats", or "menu"');
    }
  }

  private showStats(): void {
    if (!this.currentGame) {
      console.info('❌ No active game');
      return;
    }

    const stats = this.currentGame.getStats();
    const config = this.currentGame.getConfig();

    console.info('\n📊 Game Statistics:');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.info(`🎮 Game: ${config.title}`);
    console.info(`🎯 Type: ${config.gameType}`);
    console.info(`⭐ Difficulty: ${config.difficulty}`);
    console.info(`⏰ Play Time: ${SimpleGameUtils.formatTime(stats.playTime)}`);
    console.info(`💰 Currency: ${SimpleGameUtils.formatCurrency(stats.currency)}`);
    console.info(`🎖️ Score: ${stats.score.toLocaleString()}`);
    console.info(`📊 Level: ${stats.level}`);
    console.info(`🪙 Items Collected: ${stats.itemsCollected}`);
    console.info(`🏆 Achievements: ${stats.achievements.length}`);

    // Game-specific stats
    if (this.currentGame instanceof SimpleClickerGame) {
      console.info(`🖱️ Click Power: ${this.currentGame.getClickPower()}`);
      console.info(`🤖 Auto-Clickers: ${this.currentGame.getAutoClickers()}`);
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      console.info(`🪙 Coins: ${this.currentGame.getCoins()}`);
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      console.info(`❤️ Lives: ${this.currentGame.getLives()}`);
    } else if (this.currentGame instanceof SimpleRPGGame) {
      const player = this.currentGame.getPlayer();
      console.info(`❤️ Health: ${player.health}/${player.maxHealth}`);
      console.info(`⚔️ Attack: ${player.attack}`);
      console.info(`🛡️ Defense: ${player.defense}`);
      console.info(`📈 Experience: ${player.experience}/${player.experienceToNext}`);
    }

    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private showAchievements(): void {
    if (!this.currentGame) {
      console.info('❌ No active game');
      return;
    }

    const achievements = this.currentGame.getAchievements();

    console.info('\n🏆 Achievements:');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (achievements.length === 0) {
      console.info('📭 No achievements unlocked yet');
    } else {
      achievements.forEach((achievement, index) => {
        console.info(`${index + 1}. ${achievement.icon} ${achievement.name}`);
        console.info(`   ${achievement.description}`);
      });
    }

    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private saveGame(): void {
    console.info('\n💾 Save feature coming soon!');
    console.info('This would save the current game state.\n');
    this.showMenu();
  }

  private loadGame(): void {
    console.info('\n📁 Load feature coming soon!');
    console.info('This would load a previously saved game.\n');
    this.showMenu();
  }

  private exit(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    if (this.currentGame) {
      this.currentGame.stop();
      console.info('⏹️ Game stopped.');
    }

    console.info('\n👋 Thanks for using SimpleGamePure CLI!');
    console.info('Happy game development! 🎮✨\n');

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