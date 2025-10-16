/**
 * SimpleGamePure - Rapid Prototyping Module for MIFF
 *
 * A lightweight module that auto-configures basic MIFF modules for simple games.
 * Perfect for game jams, prototypes, and beginner developers who want to get
 * started quickly without complex configuration.
 *
 * Features:
 * - Pre-configured game templates (clicker, platformer, arcade, RPG)
 * - Auto-wiring of essential modules
 * - Simple APIs for common game patterns
 * - One-line game setup
 *
 * @module SimpleGamePure
 * @version 1.0.0
 * @license MIT
 */

export enum GameType {
  CLICKER = 'clicker',
  PLATFORMER = 'platformer',
  ARCADE = 'arcade',
  RPG = 'rpg',
  PUZZLE = 'puzzle',
  IDLE = 'idle',
  CUSTOM = 'custom'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface SimpleGameConfig {
  gameType: GameType;
  title: string;
  difficulty: DifficultyLevel;
  startingCurrency: number;
  enableSaving: boolean;
  enableAudio: boolean;
  customModules?: string[]; // Additional modules to include
}

export interface GameStats {
  playTime: number;
  score: number;
  level: number;
  currency: number;
  itemsCollected: number;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
  reward?: any;
}

/**
 * Main SimpleGamePure class - creates and configures games with one method call
 */
export class SimpleGameBuilder {
  private static readonly MODULE_DEPENDENCIES: Record<GameType, string[]> = {
    [GameType.CLICKER]: [
      'InputPure',
      'EventBusPure',
      'LogPure',
      'SaveLoadPure',
      'AudioPure'
    ],
    [GameType.PLATFORMER]: [
      'InputPure',
      'PhysicsSystemPure',
      'CollisionSystemPure',
      'MovementPure',
      'AudioPure',
      'SaveLoadPure',
      'DebugOverlayPure'
    ],
    [GameType.ARCADE]: [
      'InputPure',
      'CollisionSystemPure',
      'PhysicsSystemPure',
      'AudioPure',
      'SaveLoadPure',
      'RNGPure'
    ],
    [GameType.RPG]: [
      'InputPure',
      'CombatPure',
      'ItemsPure',
      'ProgressionPure',
      'AudioPure',
      'SaveLoadPure',
      'EventBusPure'
    ],
    [GameType.PUZZLE]: [
      'InputPure',
      'CollisionSystemPure',
      'AudioPure',
      'SaveLoadPure',
      'RNGPure'
    ],
    [GameType.IDLE]: [
      'EventBusPure',
      'SaveLoadPure',
      'AudioPure',
      'RNGPure'
    ],
    [GameType.CUSTOM]: []
  };

  /**
   * Create a complete clicker game with one method call
   */
  static createClickerGame(config: Partial<SimpleGameConfig> = {}): SimpleClickerGame {
    const gameConfig: SimpleGameConfig = {
      gameType: GameType.CLICKER,
      title: config.title! || 'My Clicker Game',
      difficulty: config.difficulty! || DifficultyLevel.EASY,
      startingCurrency: config.startingCurrency! || 0,
      enableSaving: config.enableSaving !== false,
      enableAudio: config.enableAudio !== false,
      customModules: config.customModules! || []
    };

    return new SimpleClickerGame(gameConfig);
  }

  /**
   * Create a complete platformer game with one method call
   */
  static createPlatformer(config: Partial<SimpleGameConfig> = {}): SimplePlatformerGame {
    const gameConfig: SimpleGameConfig = {
      gameType: GameType.PLATFORMER,
      title: config.title! || 'My Platformer',
      difficulty: config.difficulty! || DifficultyLevel.MEDIUM,
      startingCurrency: config.startingCurrency! || 0,
      enableSaving: config.enableSaving !== false,
      enableAudio: config.enableAudio !== false,
      customModules: config.customModules! || []
    };

    return new SimplePlatformerGame(gameConfig);
  }

  /**
   * Create a complete arcade game with one method call
   */
  static createArcadeGame(config: Partial<SimpleGameConfig> = {}): SimpleArcadeGame {
    const gameConfig: SimpleGameConfig = {
      gameType: GameType.ARCADE,
      title: config.title! || 'My Arcade Game',
      difficulty: config.difficulty! || DifficultyLevel.MEDIUM,
      startingCurrency: config.startingCurrency! || 100,
      enableSaving: config.enableSaving !== false,
      enableAudio: config.enableAudio !== false,
      customModules: config.customModules! || []
    };

    return new SimpleArcadeGame(gameConfig);
  }

  /**
   * Create a complete RPG game with one method call
   */
  static createRPG(config: Partial<SimpleGameConfig> = {}): SimpleRPGGame {
    const gameConfig: SimpleGameConfig = {
      gameType: GameType.RPG,
      title: config.title! || 'My RPG',
      difficulty: config.difficulty! || DifficultyLevel.MEDIUM,
      startingCurrency: config.startingCurrency! || 50,
      enableSaving: config.enableSaving !== false,
      enableAudio: config.enableAudio !== false,
      customModules: config.customModules! || []
    };

    return new SimpleRPGGame(gameConfig);
  }

  /**
   * Create a custom game with specified modules
   */
  static createCustomGame(config: SimpleGameConfig): SimpleCustomGame {
    return new SimpleCustomGame(config);
  }

  /**
   * Get required modules for a game type
   */
  static getRequiredModules(gameType: GameType): string[] {
    return this.MODULE_DEPENDENCIES[gameType!] || [];
  }

  /**
   * Check if all required modules are available
   */
  static validateGameType(gameType: GameType, availableModules: string[]): string[] {
    const required = this.getRequiredModules(gameType);
    const missing = required.filter((module: any) => !availableModules.includes(module));

    if (missing.length > 0) {
      return [`Missing required modules: ${missing.join(', ')}`];
    }

    return [];
  }
}

/**
 * Base class for all simple games
 */
export abstract class SimpleGame {
  protected config: SimpleGameConfig;
  protected stats: GameStats;
  protected achievements: Achievement[] = [];
  protected isRunning: boolean = false;
  protected startTime: number = 0;

  constructor(config: SimpleGameConfig) {
    this.config = config;
    this.stats = {
      playTime: 0,
      score: 0,
      level: 1,
      currency: config.startingCurrency,
      itemsCollected: 0,
      achievements: []
    };
  }

  /**
   * Start the game
   */
  start(): void {
    this.isRunning = true;
    this.startTime = Date.now();
    this.onStart();
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.isRunning = false;
    this.updatePlayTime();
    this.onStop();
  }

  /**
   * Update game state (called every frame)
   */
  update(deltaTime: number): void {
    if (!this.isRunning) return;

    this.updatePlayTime();
    this.onUpdate(deltaTime);
  }

  /**
   * Get current game statistics
   */
  getStats(): Readonly<GameStats> {
    return { ...this.stats };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<SimpleGameConfig> {
    return { ...this.config };
  }

  /**
   * Add currency
   */
  addCurrency(amount: number): void {
    this.stats.currency += amount;
    this.checkAchievements();
  }

  /**
   * Spend currency
   */
  spendCurrency(amount: number): boolean {
    if (this.stats.currency >= amount) {
      this.stats.currency -= amount;
      return true;
    }
    return false;
  }

  /**
   * Add score
   */
  addScore(points: number): void {
    this.stats.score += points;
    this.checkAchievements();
  }

  /**
   * Add achievement
   */
  unlockAchievement(achievement: Achievement): void {
    if (!this.achievements.some(a => a.id === achievement.id)) {
      this.achievements.push(achievement);
      this.stats.achievements.push(achievement.id);
      this.onAchievementUnlocked(achievement);
    }
  }

  /**
   * Get all achievements
   */
  getAchievements(): readonly Achievement[] {
    return this.achievements;
  }

  protected updatePlayTime(): void {
    if (this.isRunning) {
      this.stats.playTime = Date.now() - this.startTime;
    }
  }

  protected checkAchievements(): void {
    // Override in subclasses to implement achievement logic
  }

  protected abstract onStart(): void;
  protected abstract onStop(): void;
  protected abstract onUpdate(deltaTime: number): void;
  protected abstract onAchievementUnlocked(achievement: Achievement): void;
}

/**
 * Simple Clicker Game Implementation
 */
export class SimpleClickerGame extends SimpleGame {
  private clickPower: number = 1;
  private autoClickers: number = 0;
  private autoClickerPower: number = 0;
  private upgradeCosts: Record<string, number> = {
    clickPower: 10,
    autoClicker: 50
  };

  protected onStart(): void {
    console.log(`🎮 ${this.config.title} started!`);
  }

  protected onStop(): void {
    console.log(`⏹️ ${this.config.title} stopped!`);
  }

  protected onUpdate(deltaTime: number): void {
    // Auto-clickers generate currency
    if (this.autoClickers > 0) {
      const autoGenerated = this.autoClickers * this.autoClickerPower * (deltaTime / 1000);
      this.addCurrency(autoGenerated);
    }
  }

  protected onAchievementUnlocked(achievement: Achievement): void {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }

  // Clicker-specific methods
  click(): void {
    this.addCurrency(this.clickPower);
    this.addScore(this.clickPower);
  }

  upgradeClickPower(): boolean {
    const cost = this.upgradeCosts.clickPower;
    if (this.spendCurrency(cost)) {
      this.clickPower += 1;
      this.upgradeCosts.clickPower = Math.floor(cost * 1.5);
      return true;
    }
    return false;
  }

  buyAutoClicker(): boolean {
    const cost = this.upgradeCosts.autoClicker;
    if (this.spendCurrency(cost)) {
      this.autoClickers += 1;
      this.autoClickerPower += 0.5;
      this.upgradeCosts.autoClicker = Math.floor(cost * 1.8);
      return true;
    }
    return false;
  }

  getClickPower(): number { return this.clickPower; }
  getAutoClickers(): number { return this.autoClickers; }
  getAutoClickerPower(): number { return this.autoClickerPower; }
  getUpgradeCosts(): Record<string, number> { return { ...this.upgradeCosts }; }
}

/**
 * Simple Platformer Game Implementation
 */
export class SimplePlatformerGame extends SimpleGame {
  private playerX: number = 100;
  private playerY: number = 300;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private onGround: boolean = false;
  private coins: number = 0;
  private platforms: Array<{ x: number; y: number; width: number; height: number }> = [];

  protected onStart(): void {
    this.initializePlatforms();
    console.log(`🕹️ ${this.config.title} started! Use WASD to move, Space to jump`);
  }

  protected onStop(): void {
    console.log(`⏹️ ${this.config.title} stopped!`);
  }

  protected onUpdate(deltaTime: number): void {
    // Basic physics update would go here
    // This is a simplified version - real implementation would use PhysicsSystemPure
  }

  protected onAchievementUnlocked(achievement: Achievement): void {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }

  private initializePlatforms(): void {
    // Create some basic platforms
    this.platforms = [
      { x: 0, y: 350, width: 800, height: 50 },    // Ground
      { x: 200, y: 250, width: 200, height: 20 },  // Platform 1
      { x: 500, y: 200, width: 200, height: 20 },  // Platform 2
      { x: 300, y: 150, width: 200, height: 20 },  // Platform 3
    ];
  }

  // Platformer-specific methods
  moveLeft(): void {
    this.velocityX = -5;
  }

  moveRight(): void {
    this.velocityX = 5;
  }

  stopMoving(): void {
    this.velocityX = 0;
  }

  jump(): void {
    if (this.onGround) {
      this.velocityY = -12;
      this.onGround = false;
    }
  }

  collectCoin(): void {
    this.coins++;
    this.addCurrency(10);
    this.addScore(100);
  }

  getPlayerPosition(): { x: number; y: number } {
    return { x: this.playerX, y: this.playerY };
  }

  getCoins(): number { return this.coins; }
  getPlatforms(): readonly typeof this.platforms { return this.platforms; }
}

/**
 * Simple Arcade Game Implementation
 */
export class SimpleArcadeGame extends SimpleGame {
  private playerLives: number = 3;
  private enemies: Array<{ x: number; y: number; speed: number }> = [];
  private bullets: Array<{ x: number; y: number; speed: number }> = [];
  private lastShotTime: number = 0;

  protected onStart(): void {
    this.spawnEnemies();
    console.log(`👾 ${this.config.title} started! Use Space to shoot, avoid enemies`);
  }

  protected onStop(): void {
    console.log(`⏹️ ${this.config.title} stopped!`);
  }

  protected onUpdate(deltaTime: number): void {
    // Move enemies and bullets
    this.updateEnemies(deltaTime);
    this.updateBullets(deltaTime);
    this.checkCollisions();
  }

  protected onAchievementUnlocked(achievement: Achievement): void {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }

  private spawnEnemies(): void {
    // Spawn initial enemies
    for (let i = 0; i < 5; i++) {
      this.enemies.push({
        x: 100 + i * 150,
        y: 50 + Math.random() * 100,
        speed: 1 + Math.random() * 2
      });
    }
  }

  private updateEnemies(deltaTime: number): void {
    this.enemies.forEach((enemy: any) => {
      enemy.x += enemy.speed * (deltaTime / 16); // 60fps target

      // Bounce off screen edges
      if (enemy.x < 0 || enemy.x > 800) {
        enemy.speed *= -1;
        enemy.y += 50; // Move down when bouncing
      }
    });
  }

  private updateBullets(deltaTime: number): void {
    this.bullets.forEach((bullet, index) => {
      bullet.y -= bullet.speed * (deltaTime / 16);

      // Remove bullets that go off screen
      if (bullet.y < 0) {
        this.bullets.splice(index, 1);
      }
    });
  }

  private checkCollisions(): void {
    // Check bullet-enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.checkCollision(bullet, enemy, 10)) {
          // Hit!
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
          this.addScore(100);
          this.addCurrency(25);
        }
      });
    });
  }

  private checkCollision(obj1: any, obj2: any, size: number): boolean {
    return Math.abs(obj1.x - obj2.x) < size && Math.abs(obj1.y - obj2.y) < size;
  }

  // Arcade-specific methods
  shoot(): boolean {
    const now = Date.now();
    if (now - this.lastShotTime < 200) return false; // Rate limit

    this.lastShotTime = now;
    this.bullets.push({
      x: 400, // Player position
      y: 350,
      speed: 10
    });

    return true;
  }

  takeDamage(): void {
    this.playerLives--;
    if (this.playerLives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    console.log('💀 Game Over!');
    this.stop();
  }

  getLives(): number { return this.playerLives; }
  getEnemies(): readonly typeof this.enemies { return this.enemies; }
  getBullets(): readonly typeof this.bullets { return this.bullets; }
}

/**
 * Simple RPG Game Implementation
 */
export class SimpleRPGGame extends SimpleGame {
  private player: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    experience: number;
    experienceToNext: number;
  };

  private enemies: Array<{
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    experienceReward: number;
    position: { x: number; y: number };
  }> = [];

  private inCombat: boolean = false;
  private currentEnemy: any = null;

  constructor(config: SimpleGameConfig) {
    super(config);
    this.player = {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      experienceToNext: 100
    };
  }

  protected onStart(): void {
    this.spawnEnemies();
    console.log(`⚔️ ${this.config.title} started! Explore and fight enemies`);
  }

  protected onStop(): void {
    console.log(`⏹️ ${this.config.title} stopped!`);
  }

  protected onUpdate(deltaTime: number): void {
    // RPG logic would go here
  }

  protected onAchievementUnlocked(achievement: Achievement): void {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }

  private spawnEnemies(): void {
    const enemyTypes = [
      { name: 'Goblin', health: 30, attack: 5, defense: 2, exp: 25 },
      { name: 'Orc', health: 60, attack: 8, defense: 4, exp: 50 },
      { name: 'Skeleton', health: 45, attack: 6, defense: 1, exp: 35 }
    ];

    for (let i = 0; i < 5; i++) {
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      this.enemies.push({
        id: `enemy_${i}`,
        name: type.name,
        health: type.health,
        maxHealth: type.health,
        attack: type.attack,
        defense: type.defense,
        experienceReward: type.exp,
        position: {
          x: 100 + i * 150,
          y: 100 + Math.random() * 200
        }
      });
    }
  }

  // RPG-specific methods
  attack(): boolean {
    if (!this.currentEnemy || !this.inCombat) return false;

    const damage = Math.max(1, this.player.attack - this.currentEnemy.defense);
    this.currentEnemy.health -= damage;

    if (this.currentEnemy.health <= 0) {
      this.defeatEnemy();
      return true;
    }

    // Enemy counterattack
    setTimeout(() => {
      if (this.inCombat && this.currentEnemy) {
        const enemyDamage = Math.max(1, this.currentEnemy.attack - this.player.defense);
        this.takeDamage(enemyDamage);
      }
    }, 1000);

    return true;
  }

  takeDamage(damage: number): void {
    this.player.health -= damage;
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  private defeatEnemy(): void {
    if (!this.currentEnemy) return;

    this.addExperience(this.currentEnemy.experienceReward);
    this.addCurrency(10 + Math.floor(Math.random() * 20));
    this.addScore(this.currentEnemy.experienceReward * 2);

    this.inCombat = false;
    this.currentEnemy = null;
    console.log('🎉 Enemy defeated!');
  }

  private gameOver(): void {
    console.log('💀 Game Over! You died.');
    this.stop();
  }

  private addExperience(amount: number): void {
    this.player.experience += amount;

    while (this.player.experience >= this.player.experienceToNext) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.player.experience -= this.player.experienceToNext;
    this.stats.level++;
    this.player.experienceToNext = Math.floor(this.player.experienceToNext * 1.2);

    // Increase stats
    this.player.maxHealth += 10;
    this.player.health = this.player.maxHealth; // Full heal
    this.player.attack += 2;
    this.player.defense += 1;

    console.log(`🎉 Leveled up to ${this.stats.level}!`);
  }

  startCombat(enemyId: string): boolean {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy) return false;

    this.currentEnemy = enemy;
    this.inCombat = true;
    console.log(`⚔️ Combat started with ${enemy.name}!`);
    return true;
  }

  getPlayer(): Readonly<typeof this.player> { return this.player; }
  getEnemies(): readonly typeof this.enemies { return this.enemies; }
  getCurrentEnemy(): any { return this.currentEnemy; }
  isInCombat(): boolean { return this.inCombat; }
}

/**
 * Custom Game Implementation
 */
export class SimpleCustomGame extends SimpleGame {
  protected onStart(): void {
    console.log(`🎯 ${this.config.title} started!`);
  }

  protected onStop(): void {
    console.log(`⏹️ ${this.config.title} stopped!`);
  }

  protected onUpdate(deltaTime: number): void {
    // Custom game logic would go here
  }

  protected onAchievementUnlocked(achievement: Achievement): void {
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }
}

/**
 * Utility functions for common game patterns
 */
export const SimpleGameUtils = {
  /**
   * Create a simple achievement
   */
  createAchievement(id: string, name: string, description: string, icon: string = '🏆'): Achievement {
    return {
      id,
      name,
      description,
      icon,
      unlockedAt: Date.now()
    };
  },

  /**
   * Format time from milliseconds to readable string
   */
  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Format currency with appropriate suffix
   */
  formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      return amount.toString();
    }
  },

  /**
   * Simple collision detection
   */
  checkCollision(a: { x: number; y: number; width: number; height: number },
                 b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },

  /**
   * Generate a simple ID
   */
  generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

/**
 * Pre-configured game templates
 */
export const GameTemplates = {
  /**
   * Basic clicker game template
   */
  basicClicker: (): SimpleGameConfig => ({
    gameType: GameType.CLICKER,
    title: 'Cookie Clicker Clone',
    difficulty: DifficultyLevel.EASY,
    startingCurrency: 0,
    enableSaving: true,
    enableAudio: true
  }),

  /**
   * Basic platformer template
   */
  basicPlatformer: (): SimpleGameConfig => ({
    gameType: GameType.PLATFORMER,
    title: 'Super Mario Clone',
    difficulty: DifficultyLevel.MEDIUM,
    startingCurrency: 0,
    enableSaving: true,
    enableAudio: true
  }),

  /**
   * Basic arcade template
   */
  basicArcade: (): SimpleGameConfig => ({
    gameType: GameType.ARCADE,
    title: 'Space Invaders Clone',
    difficulty: DifficultyLevel.MEDIUM,
    startingCurrency: 100,
    enableSaving: true,
    enableAudio: true
  }),

  /**
   * Basic RPG template
   */
  basicRPG: (): SimpleGameConfig => ({
    gameType: GameType.RPG,
    title: 'Simple RPG',
    difficulty: DifficultyLevel.MEDIUM,
    startingCurrency: 50,
    enableSaving: true,
    enableAudio: true
  })
};

// Export default instance
export const simpleGameBuilder = SimpleGameBuilder;
export { SimpleGameBuilder as default };