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
  private rl: readline.Interface;
  private currentGame: any = null;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.showWelcome();
    this.showMenu();
  }

  private showWelcome(): void {
    console.log('\n🎮 Welcome to SimpleGamePure CLI Harness! 🎮\n');
    console.log('This interactive tool lets you test and play with SimpleGamePure.');
    console.log('Perfect for game jams, prototypes, and learning MIFF modules.\n');
  }

  private showMenu(): void {
    console.log('📋 Available Commands:');
    console.log('1. 🎯 Create Clicker Game');
    console.log('2. 🕹️ Create Platformer Game');
    console.log('3. 👾 Create Arcade Game');
    console.log('4. ⚔️ Create RPG Game');
    console.log('5. 🎮 Play Current Game');
    console.log('6. 📊 Show Game Stats');
    console.log('7. 🏆 Show Achievements');
    console.log('8. 💾 Save Game');
    console.log('9. 📁 Load Game');
    console.log('0. 🚪 Exit\n');

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
        console.log('❌ Invalid command. Please enter a number from 0-9.\n');
        this.showMenu();
    }
  }

  private createClickerGame(): void {
    console.log('\n🎯 Creating Clicker Game...\n');

    this.currentGame = SimpleGameBuilder.createClickerGame({
      title: 'CLI Clicker Demo',
      difficulty: DifficultyLevel.EASY,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.log('✅ Clicker Game created and started!');
    console.log('💡 Type "5" to start playing, or "6" to see stats.\n');
    this.showMenu();
  }

  private createPlatformerGame(): void {
    console.log('\n🕹️ Creating Platformer Game...\n');

    this.currentGame = SimpleGameBuilder.createPlatformerGame({
      title: 'CLI Platformer Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 0,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.log('✅ Platformer Game created and started!');
    console.log('💡 Use WASD to move, Space to jump.\n');
    this.showMenu();
  }

  private createArcadeGame(): void {
    console.log('\n👾 Creating Arcade Game...\n');

    this.currentGame = SimpleGameBuilder.createArcadeGame({
      title: 'CLI Arcade Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 100,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.log('✅ Arcade Game created and started!');
    console.log('💡 Use Space to shoot, avoid enemies.\n');
    this.showMenu();
  }

  private createRPGGame(): void {
    console.log('\n⚔️ Creating RPG Game...\n');

    this.currentGame = SimpleGameBuilder.createRPGGame({
      title: 'CLI RPG Demo',
      difficulty: DifficultyLevel.MEDIUM,
      startingCurrency: 50,
      enableSaving: true,
      enableAudio: true
    });

    this.currentGame.start();
    console.log('✅ RPG Game created and started!');
    console.log('💡 Explore and fight enemies.\n');
    this.showMenu();
  }

  private playGame(): void {
    if (!this.currentGame) {
      console.log('❌ No game created. Please create a game first (options 1-4).\n');
      this.showMenu();
      return;
    }

    console.log('\n🎮 Game Controls:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.currentGame instanceof SimpleClickerGame) {
      console.log('🖱️  Click anywhere to earn currency');
      console.log('🆙 Type "upgrade" to upgrade click power');
      console.log('🤖 Type "auto" to buy auto-clickers');
      console.log('💰 Type "stats" to see currency and upgrades');
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      console.log('⌨️  Movement: W/A/S/D keys');
      console.log('🦘 Jump: Spacebar');
      console.log('🪙 Type "collect" to collect coins');
      console.log('📍 Type "pos" to show player position');
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      console.log('🔫 Shoot: Spacebar');
      console.log('💔 Lives remaining: ' + this.currentGame.getLives());
      console.log('🎯 Type "shoot" to fire');
      console.log('📊 Type "stats" to show game stats');
    } else if (this.currentGame instanceof SimpleRPGGame) {
      console.log('⚔️  Type "attack" to attack enemies');
      console.log('🏃 Type "explore" to find enemies');
      console.log('🩸 Health: ' + this.currentGame.getPlayer().health);
      console.log('📈 Level: ' + this.currentGame.getStats().level);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Type "menu" to return to main menu\n');

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
      console.log('\n📋 Returning to main menu...\n');
      this.showMenu();
      return;
    }

    if (!this.currentGame) {
      console.log('❌ No active game. Type "menu" to return.\n');
      this.startInteractiveMode();
      return;
    }

    try {
      this.processGameCommand(input);
    } catch (error) {
      console.log('❌ Error processing command:', error);
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
      console.log('❓ Unknown command. Type "menu" for help.');
    }
  }

  private handleClickerCommands(command: string): void {
    switch (command) {
      case '':
        this.currentGame.click();
        console.log('🖱️ Clicked! +1 currency');
        break;
      case 'upgrade':
        if (this.currentGame.upgradeClickPower()) {
          console.log('🆙 Click power upgraded! New power: ' + this.currentGame.getClickPower());
        } else {
          console.log('❌ Not enough currency for upgrade');
        }
        break;
      case 'auto':
        if (this.currentGame.buyAutoClicker()) {
          console.log('🤖 Auto-clicker purchased! Total: ' + this.currentGame.getAutoClickers());
        } else {
          console.log('❌ Not enough currency for auto-clicker');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.log('❓ Clicker commands: [click], "upgrade", "auto", "stats", or "menu"');
    }
  }

  private handlePlatformerCommands(command: string): void {
    switch (command) {
      case 'w':
        console.log('⬆️ Moving up');
        break;
      case 'a':
        console.log('⬅️ Moving left');
        break;
      case 's':
        console.log('⬇️ Moving down');
        break;
      case 'd':
        console.log('➡️ Moving right');
        break;
      case ' ':
      case 'space':
        this.currentGame.jump();
        console.log('🦘 Jumped!');
        break;
      case 'collect':
        this.currentGame.collectCoin();
        console.log('🪙 Coin collected!');
        break;
      case 'pos':
        const pos = this.currentGame.getPlayerPosition();
        console.log(`📍 Player position: (${pos.x}, ${pos.y})`);
        break;
      default:
        console.log('❓ Platformer commands: w/a/s/d, "space", "collect", "pos", or "menu"');
    }
  }

  private handleArcadeCommands(command: string): void {
    switch (command) {
      case ' ':
      case 'space':
        if (this.currentGame.shoot()) {
          console.log('🔫 Shot fired!');
        } else {
          console.log('❌ Cannot shoot yet (rate limit)');
        }
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.log('❓ Arcade commands: "space", "stats", or "menu"');
    }
  }

  private handleRPGCommands(command: string): void {
    switch (command) {
      case 'attack':
        if (this.currentGame.attack()) {
          console.log('⚔️ Attacked!');
        } else {
          console.log('❌ No enemy in combat');
        }
        break;
      case 'explore':
        console.log('🏃 Exploring for enemies...');
        break;
      case 'stats':
        this.showStats();
        break;
      default:
        console.log('❓ RPG commands: "attack", "explore", "stats", or "menu"');
    }
  }

  private showStats(): void {
    if (!this.currentGame) {
      console.log('❌ No active game');
      return;
    }

    const stats = this.currentGame.getStats();
    const config = this.currentGame.getConfig();

    console.log('\n📊 Game Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎮 Game: ${config.title}`);
    console.log(`🎯 Type: ${config.gameType}`);
    console.log(`⭐ Difficulty: ${config.difficulty}`);
    console.log(`⏰ Play Time: ${SimpleGameUtils.formatTime(stats.playTime)}`);
    console.log(`💰 Currency: ${SimpleGameUtils.formatCurrency(stats.currency)}`);
    console.log(`🎖️ Score: ${stats.score.toLocaleString()}`);
    console.log(`📊 Level: ${stats.level}`);
    console.log(`🪙 Items Collected: ${stats.itemsCollected}`);
    console.log(`🏆 Achievements: ${stats.achievements.length}`);

    // Game-specific stats
    if (this.currentGame instanceof SimpleClickerGame) {
      console.log(`🖱️ Click Power: ${this.currentGame.getClickPower()}`);
      console.log(`🤖 Auto-Clickers: ${this.currentGame.getAutoClickers()}`);
    } else if (this.currentGame instanceof SimplePlatformerGame) {
      console.log(`🪙 Coins: ${this.currentGame.getCoins()}`);
    } else if (this.currentGame instanceof SimpleArcadeGame) {
      console.log(`❤️ Lives: ${this.currentGame.getLives()}`);
    } else if (this.currentGame instanceof SimpleRPGGame) {
      const player = this.currentGame.getPlayer();
      console.log(`❤️ Health: ${player.health}/${player.maxHealth}`);
      console.log(`⚔️ Attack: ${player.attack}`);
      console.log(`🛡️ Defense: ${player.defense}`);
      console.log(`📈 Experience: ${player.experience}/${player.experienceToNext}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private showAchievements(): void {
    if (!this.currentGame) {
      console.log('❌ No active game');
      return;
    }

    const achievements = this.currentGame.getAchievements();

    console.log('\n🏆 Achievements:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (achievements.length === 0) {
      console.log('📭 No achievements unlocked yet');
    } else {
      achievements.forEach((achievement, index) => {
        console.log(`${index + 1}. ${achievement.icon} ${achievement.name}`);
        console.log(`   ${achievement.description}`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  private saveGame(): void {
    console.log('\n💾 Save feature coming soon!');
    console.log('This would save the current game state.\n');
    this.showMenu();
  }

  private loadGame(): void {
    console.log('\n📁 Load feature coming soon!');
    console.log('This would load a previously saved game.\n');
    this.showMenu();
  }

  private exit(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    if (this.currentGame) {
      this.currentGame.stop();
      console.log('⏹️ Game stopped.');
    }

    console.log('\n👋 Thanks for using SimpleGamePure CLI!');
    console.log('Happy game development! 🎮✨\n');

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