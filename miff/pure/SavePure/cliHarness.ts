#!/usr/bin/env node

/**
 * SavePure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SavePure save/load system.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  SaveManager,
  SaveSnapshot,
  SaveValidator,
  SaveMigrator,
  SaveUtils,
  SaveOperationResult,
  ISaveSnapshot,
  IGameEntity
} from './index';

// Mock game entity for testing
class MockGameEntity implements IGameEntity {
  public id: string;
  public name: string;
  public level: number;
  public hp: number;
  public maxHp: number;
  public stats: Record<string, number>;
  public statusEffects: string[];

  constructor(
    id: string,
    name: string,
    level: number = 1,
    hp: number = 100,
    maxHp: number = 100,
    stats: Record<string, number> = {},
    statusEffects: string[] = []
  ) {
    this.logger = new StructuredLogger({ module: 'MockGameEntity' });
    this.id = id;
    this.name = name;
    this.level = level;
    this.hp = hp;
    this.maxHp = maxHp;
    this.stats = stats;
    this.statusEffects = statusEffects;
  }

  /**
   * Create hero entity
   */
  static createHero(name: string = 'Hero'): MockGameEntity {
    return new MockGameEntity(
      `hero_${Date.now()}`,
      name,
      10,
      100,
      100,
      { atk: 50, def: 30, spd: 40, mag: 25 },
      ['blessed']
    );
  }

  /**
   * Create enemy entity
   */
  static createEnemy(name: string = 'Enemy'): MockGameEntity {
    return new MockGameEntity(
      `enemy_${Date.now()}`,
      name,
      8,
      80,
      80,
      { atk: 45, def: 25, spd: 35 },
      []
    );
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  /**
   * Heal
   */
  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * Get stat value
   */
  getStat(stat: string): number {
    return this.stats[stat] || 0;
  }

  /**
   * Set stat value
   */
  setStat(stat: string, value: number): void {
    this.stats[stat] = value;
  }

  /**
   * Add status effect
   */
  addStatusEffect(effect: string): void {
    if (!this.statusEffects.includes(effect)) {
      this.statusEffects.push(effect);
    }
  }

  /**
   * Remove status effect
   */
  removeStatusEffect(effect: string): boolean {
    const index = this.statusEffects.indexOf(effect);
    if (index >= 0) {
      this.statusEffects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if alive
   */
  isAlive(): boolean {
    return this.hp > 0;
  }

  /**
   * Get summary
   */
  getSummary(): string {
    return `${this.name} (Lv.${this.level}) - HP: ${this.hp}/${this.maxHp} - Status: ${this.statusEffects.join(', ') || 'none'}`;
  }
}

// CLI Application
class SavePureCLI {
  private rl: readline.Interface;
  private saveManager: SaveManager;
  private currentSnapshot: SaveSnapshot;
  private saveFilePath: string = './savegame.json';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.saveManager = new SaveManager();
    this.currentSnapshot = this.createDemoSnapshot();
  }

  /**
   * Create demo snapshot
   */
  private createDemoSnapshot(): SaveSnapshot {
    const snapshot = SaveSnapshot.create(
      SaveUtils.generatePlayerId(),
      'demo_town',
      'v1'
    );

    // Add demo party members
    snapshot.addPartyMember(MockGameEntity.createHero('Alex'));
    snapshot.addPartyMember(MockGameEntity.createHero('Jordan'));
    snapshot.addPartyMember(MockGameEntity.createEnemy('Goblin'));

    // Add demo inventory
    snapshot.addInventoryItem('health_potion', 5);
    snapshot.addInventoryItem('mana_potion', 3);
    snapshot.addInventoryItem('iron_sword', 1);
    snapshot.addInventoryItem('magic_ring', 1);

    // Add demo quest flags
    snapshot.setQuestFlag('tutorial_complete', true);
    snapshot.setQuestFlag('first_quest_active', true);
    snapshot.setQuestFlag('boss_defeated', false);

    // Add demo unlocked content
    snapshot.unlockContent('town_area');
    snapshot.unlockContent('forest_path');
    snapshot.unlockContent('secret_cave');

    // Add demo statistics
    snapshot.updateStatistic('enemies_defeated', 42);
    snapshot.updateStatistic('total_play_time', 3600000); // 1 hour
    snapshot.updateStatistic('gold_earned', 1500);

    // Add demo metadata
    snapshot.addMetadata('difficulty', 'normal');
    snapshot.addMetadata('game_version', '1.0.0');
    snapshot.addMetadata('last_save_location', 'demo_town');

    return snapshot;
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.info('='.repeat(70));
    console.info('💾 SavePure CLI - Game Save/Load System');
    console.info('='.repeat(70));
    console.info('');
    console.info('Available commands:');
    console.info('  save [file]       - Save current game state');
    console.info('  load [file]       - Load game state from file');
    console.info('  info              - Show current save info');
    console.info('  validate          - Validate current snapshot');
    console.info('  migrate [version] - Migrate to specific version');
    console.info('  party             - Manage party members');
    console.info('  inventory         - Manage inventory items');
    console.info('  quests            - Manage quest flags');
    console.info('  unlock            - Manage unlocked content');
    console.info('  stats             - Show/update statistics');
    console.info('  settings          - Manage game settings');
    console.info('  metadata          - Manage metadata');
    console.info('  demo              - Reset to demo data');
    console.info('  help              - Show this help');
    console.info('  exit              - Exit application');
    console.info('');
    console.info(`Current save file: ${this.saveFilePath}`);
    console.info(`Player ID: ${this.currentSnapshot.playerId}`);
    console.info(`Zone: ${this.currentSnapshot.zoneId}`);
    console.info(`Version: ${this.currentSnapshot.version}`);

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('SavePure> ', (input) => {
      this.processCommand(input.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!input) {
      this.showPrompt();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'save':
        case 's':
          await this.saveGame(args[0]);
          break;
        case 'load':
        case 'l':
          await this.loadGame(args[0]);
          break;
        case 'info':
        case 'i':
          this.showSaveInfo();
          break;
        case 'validate':
        case 'v':
          this.validateSnapshot();
          break;
        case 'migrate':
        case 'm':
          this.migrateSnapshot(args[0]);
          break;
        case 'party':
        case 'p':
          this.manageParty(args);
          break;
        case 'inventory':
        case 'inv':
          this.manageInventory(args);
          break;
        case 'quests':
        case 'q':
          this.manageQuests(args);
          break;
        case 'unlock':
        case 'u':
          this.manageUnlocks(args);
          break;
        case 'stats':
          this.manageStats(args);
          break;
        case 'settings':
        case 'set':
          this.manageSettings(args);
          break;
        case 'metadata':
        case 'meta':
          this.manageMetadata(args);
          break;
        case 'demo':
        case 'd':
          this.resetDemo();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          console.info(`❌ Unknown command: ${command}`);
          console.info('Type "help" for available commands.');
      }
    } catch (error) {
      console.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.info('💾 SavePure CLI Help');
    console.info('Commands: save, load, info, validate, migrate, party, inventory, quests, unlock, stats, settings, metadata, demo, exit');
  }

  /**
   * Save game to file
   */
  private async saveGame(filePath?: string): Promise<void> {
    const targetPath = filePath || this.saveFilePath;

    if (!SaveUtils.validateFilePath(targetPath)) {
      console.info('❌ Invalid file path');
      return;
    }

    console.info(`💾 Saving game to ${targetPath}...`);

    const result = await this.saveManager.saveGame(this.currentSnapshot, targetPath);

    if (result.success) {
      console.info(`✅ ${result.message}`);
      console.info(`📊 Save size: ${SaveUtils.formatFileSize(SaveUtils.calculateSaveSize(this.currentSnapshot))}`);
    } else {
      console.info(`❌ ${result.message}`);
    }
  }

  /**
   * Load game from file
   */
  private async loadGame(filePath?: string): Promise<void> {
    const targetPath = filePath || this.saveFilePath;

    console.info(`📂 Loading game from ${targetPath}...`);

    const result = await this.saveManager.loadGame(targetPath);

    if (result.success && result.snapshot) {
      this.currentSnapshot = result.snapshot;
      console.info(`✅ ${result.message}`);

      if (result.migrationResult && result.migrationResult.migrated) {
        console.info(`🔄 Migrated from ${result.migrationResult.oldVersion} to ${result.migrationResult.newVersion}`);
      }

      this.showSaveInfo();
    } else {
      console.info(`❌ ${result.message}`);
    }
  }

  /**
   * Show save information
   */
  private showSaveInfo(): void {
    const summary = this.currentSnapshot.getSummary();

    console.info('='.repeat(70));
    console.info('📊 Save Information');
    console.info('='.repeat(70));
    console.info(`Player ID: ${this.currentSnapshot.playerId}`);
    console.info(`Zone: ${this.currentSnapshot.zoneId}`);
    console.info(`Version: ${this.currentSnapshot.version}`);
    console.info(`Timestamp: ${new Date(this.currentSnapshot.timestampUtc).toLocaleString()}`);
    console.info(`Checksum: ${this.currentSnapshot.checksum || 'none'}`);
    console.info('');
    console.info(`Party Members: ${summary.partySize}`);
    console.info(`Inventory Items: ${summary.inventoryItems}`);
    console.info(`Quest Flags: ${summary.questFlags}`);
    console.info(`Unlocked Content: ${summary.unlockedContent}`);
    console.info(`Total Play Time: ${Math.round((summary.totalPlayTime || 0) / 60000)} minutes`);
    console.info(`Save Size: ${summary.saveSize} bytes`);
    console.info('');

    // Show party details
    if (this.currentSnapshot.partyRoster.length > 0) {
      console.info('🎭 Party Members:');
      this.currentSnapshot.partyRoster.forEach((member, index) => {
        console.info(`  ${index + 1}. ${member.name} (Lv.${member.level}) - HP: ${member.hp}/${member.maxHp}`);
      });
      console.info('');
    }

    // Show inventory summary
    if (Object.keys(this.currentSnapshot.inventory).length > 0) {
      console.info('🎒 Inventory:');
      Object.entries(this.currentSnapshot.inventory).forEach(([item, quantity]) => {
        console.info(`  ${item}: ${quantity}`);
      });
      console.info('');
    }
  }

  /**
   * Validate current snapshot
   */
  private validateSnapshot(): void {
    console.info('🔍 Validating save snapshot...');

    const validationResult = this.saveManager.validateSnapshot(this.currentSnapshot);

    console.info(`Validation Result: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.info(`Version: ${validationResult.version}`);
    console.info(`Checksum Valid: ${validationResult.checksumValid ? '✅' : '❌'}`);

    if (validationResult.errors.length > 0) {
      console.info('');
      console.info('❌ Errors:');
      validationResult.errors.forEach(error => {
        console.info(`  - ${error}`);
      });
    }

    if (validationResult.warnings.length > 0) {
      console.info('');
      console.info('⚠️ Warnings:');
      validationResult.warnings.forEach(warning => {
        console.info(`  - ${warning}`);
      });
    }

    if (validationResult.isValid && validationResult.checksumValid) {
      console.info('✅ Save file is healthy and valid!');
    }
  }

  /**
   * Migrate snapshot to different version
   */
  private migrateSnapshot(targetVersion?: string): void {
    if (!targetVersion) {
      console.info('❌ Usage: migrate [version]');
      console.info('Available versions: v1, v2, v3');
      return;
    }

    console.info(`🔄 Migrating from ${this.currentSnapshot.version} to ${targetVersion}...`);

    const migrator = new SaveMigrator();
    const result = migrator.migrate(this.currentSnapshot, targetVersion as any);

    if (result.migrated) {
      this.currentSnapshot = result.snapshot;
      console.info(`✅ Migration successful!`);
      console.info(`📊 New version: ${this.currentSnapshot.version}`);
      console.info(`⚠️ Warnings: ${result.warnings.length}`);
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.info(`  - ${warning}`);
        });
      }
    } else {
      console.info(`❌ Migration failed or not needed`);
      console.info(`⚠️ ${result.warnings.join(', ')}`);
    }
  }

  /**
   * Manage party members
   */
  private manageParty(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const entityName = args[1];

    switch (subcommand) {
      case 'add':
        if (!entityName) {
          console.info('❌ Usage: party add [name]');
          return;
        }

        const hero = MockGameEntity.createHero(entityName);
        this.currentSnapshot.addPartyMember(hero);
        console.info(`✅ Added ${hero.name} to party`);
        break;

      case 'remove':
        if (!entityName) {
          console.info('❌ Usage: party remove [name]');
          return;
        }

        const removed = this.currentSnapshot.removePartyMember(entityName);
        if (removed) {
          console.info(`✅ Removed ${entityName} from party`);
        } else {
          console.info(`❌ Party member ${entityName} not found`);
        }
        break;

      case 'list':
        console.info('🎭 Party Members:');
        this.currentSnapshot.partyRoster.forEach((member, index) => {
          console.info(`  ${index + 1}. ${member.getSummary ? (member as any).getSummary() : member.name}`);
        });
        break;

      case 'damage':
        const damage = parseInt(args[1]) || 10;
        this.currentSnapshot.partyRoster.forEach(member => {
          if (member.takeDamage) {
            (member as any).takeDamage(damage);
          }
        });
        console.info(`💔 Applied ${damage} damage to all party members`);
        break;

      case 'heal':
        const heal = parseInt(args[1]) || 20;
        this.currentSnapshot.partyRoster.forEach(member => {
          if (member.heal) {
            (member as any).heal(heal);
          }
        });
        console.info(`💚 Healed all party members by ${heal} HP`);
        break;

      default:
        console.info('Party commands: add, remove, list, damage, heal');
    }
  }

  /**
   * Manage inventory items
   */
  private manageInventory(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const itemId = args[1];
    const quantity = parseInt(args[2]) || 1;

    switch (subcommand) {
      case 'add':
        if (!itemId) {
          console.info('❌ Usage: inventory add [item] [quantity]');
          return;
        }

        this.currentSnapshot.addInventoryItem(itemId, quantity);
        console.info(`✅ Added ${quantity} x ${itemId} to inventory`);
        break;

      case 'remove':
        if (!itemId) {
          console.info('❌ Usage: inventory remove [item] [quantity]');
          return;
        }

        const removed = this.currentSnapshot.removeInventoryItem(itemId, quantity);
        if (removed) {
          console.info(`✅ Removed ${quantity} x ${itemId} from inventory`);
        } else {
          console.info(`❌ Not enough ${itemId} in inventory`);
        }
        break;

      case 'list':
        console.info('🎒 Inventory:');
        Object.entries(this.currentSnapshot.inventory).forEach(([item, qty]) => {
          console.info(`  ${item}: ${qty}`);
        });
        break;

      case 'clear':
        this.currentSnapshot.inventory = {};
        console.info('🗑️ Inventory cleared');
        break;

      default:
        console.info('Inventory commands: add, remove, list, clear');
    }
  }

  /**
   * Manage quest flags
   */
  private manageQuests(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const flagId = args[1];
    const value = args[2]?.toLowerCase() === 'true';

    switch (subcommand) {
      case 'set':
        if (!flagId) {
          console.info('❌ Usage: quests set [flag] [true/false]');
          return;
        }

        this.currentSnapshot.setQuestFlag(flagId, value);
        console.info(`✅ Set ${flagId} = ${value}`);
        break;

      case 'list':
        console.info('📋 Quest Flags:');
        Object.entries(this.currentSnapshot.questFlags).forEach(([flag, val]) => {
          console.info(`  ${flag}: ${val}`);
        });
        break;

      case 'clear':
        this.currentSnapshot.questFlags = {};
        console.info('🗑️ Quest flags cleared');
        break;

      default:
        console.info('Quest commands: set, list, clear');
    }
  }

  /**
   * Manage unlocked content
   */
  private manageUnlocks(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const contentId = args[1];

    switch (subcommand) {
      case 'unlock':
        if (!contentId) {
          console.info('❌ Usage: unlock unlock [content_id]');
          return;
        }

        this.currentSnapshot.unlockContent(contentId);
        console.info(`✅ Unlocked ${contentId}`);
        break;

      case 'check':
        if (!contentId) {
          console.info('❌ Usage: unlock check [content_id]');
          return;
        }

        const unlocked = this.currentSnapshot.isContentUnlocked(contentId);
        console.info(`${contentId}: ${unlocked ? '✅ Unlocked' : '❌ Locked'}`);
        break;

      case 'list':
        console.info('🔓 Unlocked Content:');
        this.currentSnapshot.unlockedContent.forEach(content => {
          console.info(`  ${content}`);
        });
        break;

      case 'clear':
        this.currentSnapshot.unlockedContent = [];
        console.info('🗑️ Unlocked content cleared');
        break;

      default:
        console.info('Unlock commands: unlock, check, list, clear');
    }
  }

  /**
   * Manage statistics
   */
  private manageStats(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const statId = args[1];
    const value = parseInt(args[2]) || 0;

    switch (subcommand) {
      case 'set':
        if (!statId) {
          console.info('❌ Usage: stats set [stat] [value]');
          return;
        }

        this.currentSnapshot.updateStatistic(statId, value);
        console.info(`✅ Set ${statId} = ${value}`);
        break;

      case 'get':
        if (!statId) {
          console.info('❌ Usage: stats get [stat]');
          return;
        }

        const statValue = this.currentSnapshot.getStatistic(statId);
        console.info(`${statId}: ${statValue}`);
        break;

      case 'list':
        console.info('📊 Statistics:');
        Object.entries(this.currentSnapshot.statistics).forEach(([stat, val]) => {
          console.info(`  ${stat}: ${val}`);
        });
        break;

      case 'increment':
        if (!statId) {
          console.info('❌ Usage: stats increment [stat]');
          return;
        }

        const currentValue = this.currentSnapshot.getStatistic(statId);
        this.currentSnapshot.updateStatistic(statId, currentValue + 1);
        console.info(`✅ Incremented ${statId} to ${currentValue + 1}`);
        break;

      default:
        console.info('Stats commands: set, get, list, increment');
    }
  }

  /**
   * Manage game settings
   */
  private manageSettings(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const settingId = args[1];
    const value = args[2];

    switch (subcommand) {
      case 'set':
        if (!settingId || value === undefined) {
          console.info('❌ Usage: settings set [setting] [value]');
          return;
        }

        this.currentSnapshot.setGameSetting(settingId, value);
        console.info(`✅ Set ${settingId} = ${value}`);
        break;

      case 'get':
        if (!settingId) {
          console.info('❌ Usage: settings get [setting]');
          return;
        }

        const settingValue = this.currentSnapshot.getGameSetting(settingId);
        console.info(`${settingId}: ${settingValue}`);
        break;

      case 'list':
        console.info('⚙️ Game Settings:');
        Object.entries(this.currentSnapshot.gameSettings).forEach(([setting, val]) => {
          console.info(`  ${setting}: ${val}`);
        });
        break;

      default:
        console.info('Settings commands: set, get, list');
    }
  }

  /**
   * Manage metadata
   */
  private manageMetadata(args: string[]): void {
    const subcommand = args[0]?.toLowerCase();
    const key = args[1];
    const value = args[2];

    switch (subcommand) {
      case 'set':
        if (!key || value === undefined) {
          console.info('❌ Usage: metadata set [key] [value]');
          return;
        }

        this.currentSnapshot.addMetadata(key, value);
        console.info(`✅ Set metadata ${key} = ${value}`);
        break;

      case 'get':
        if (!key) {
          console.info('❌ Usage: metadata get [key]');
          return;
        }

        const metaValue = this.currentSnapshot.getMetadata(key);
        console.info(`${key}: ${metaValue}`);
        break;

      case 'list':
        console.info('📋 Metadata:');
        Object.entries(this.currentSnapshot.metadata).forEach(([key, val]) => {
          console.info(`  ${key}: ${val}`);
        });
        break;

      case 'clear':
        this.currentSnapshot.metadata = {};
        console.info('🗑️ Metadata cleared');
        break;

      default:
        console.info('Metadata commands: set, get, list, clear');
    }
  }

  /**
   * Reset to demo data
   */
  private resetDemo(): void {
    this.currentSnapshot = this.createDemoSnapshot();
    console.info('🔄 Reset to demo data');
    this.showSaveInfo();
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.info('');
    console.info('👋 Thank you for using SavePure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new SavePureCLI();
  cli.start();
}

export { SavePureCLI };