#!/usr/bin/env node

/**
 * SavePure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SavePure save/load system.
 */

import * as readline from 'readline';
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
    this?.id = id;
    this?.name = name;
    this?.level = level;
    this?.hp = hp;
    this?.maxHp = maxHp;
    this?.stats = stats;
    this?.statusEffects = statusEffects;
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
    return this?.stats[stat!] || 0;
  }

  /**
   * Set stat value
   */
  setStat(stat: string, value: number): void {
    this?.stats[stat!] = value;
  }

  /**
   * Add status effect
   */
  addStatusEffect(effect: string): void {
    if (!this?.statusEffects.includes(effect)) {
      this?.statusEffects?.push(effect);
    }
  }

  /**
   * Remove status effect
   */
  removeStatusEffect(effect: string): boolean {
    const index = this?.statusEffects.indexOf(effect);
    if (index >= 0) {
      this?.statusEffects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if alive
   */
  isAlive(): boolean {
    return this?.hp > 0;
  }

  /**
   * Get summary
   */
  getSummary(): string {
    return `${this?.name} (Lv.${this?.level}) - HP: ${this?.hp}/${this?.maxHp} - Status: ${this?.statusEffects.join(', ') || 'none'}`;
  }
}

// CLI Application
class SavePureCLI {
  private rl: readline?.Interface;
  private saveManager: SaveManager;
  private currentSnapshot: SaveSnapshot;
  private saveFilePath: string = './savegame?.json';

  constructor() {
    this?.rl = readline?.createInterface({
      input: process?.stdin,
      output: process?.stdout
    });

    this?.saveManager = new SaveManager();
    this?.currentSnapshot = this?.createDemoSnapshot();
  }

  /**
   * Create demo snapshot
   */
  private createDemoSnapshot(): SaveSnapshot {
    const snapshot = SaveSnapshot?.create(
      SaveUtils?.generatePlayerId(),
      'demo_town',
      'v1'
    );

    // Add demo party members
    snapshot?.addPartyMember(MockGameEntity?.createHero('Alex'));
    snapshot?.addPartyMember(MockGameEntity?.createHero('Jordan'));
    snapshot?.addPartyMember(MockGameEntity?.createEnemy('Goblin'));

    // Add demo inventory
    snapshot?.addInventoryItem('health_potion', 5);
    snapshot?.addInventoryItem('mana_potion', 3);
    snapshot?.addInventoryItem('iron_sword', 1);
    snapshot?.addInventoryItem('magic_ring', 1);

    // Add demo quest flags
    snapshot?.setQuestFlag('tutorial_complete', true);
    snapshot?.setQuestFlag('first_quest_active', true);
    snapshot?.setQuestFlag('boss_defeated', false);

    // Add demo unlocked content
    snapshot?.unlockContent('town_area');
    snapshot?.unlockContent('forest_path');
    snapshot?.unlockContent('secret_cave');

    // Add demo statistics
    snapshot?.updateStatistic('enemies_defeated', 42);
    snapshot?.updateStatistic('total_play_time', 3600000); // 1 hour
    snapshot?.updateStatistic('gold_earned', 1500);

    // Add demo metadata
    snapshot?.addMetadata('difficulty', 'normal');
    snapshot?.addMetadata('game_version', '1.0.0');
    snapshot?.addMetadata('last_save_location', 'demo_town');

    return snapshot;
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(70));
    console.log('💾 SavePure CLI - Game Save/Load System');
    console.log('='.repeat(70));
    console.log('');
    console.log('Available commands:');
    console.log('  save [file!]       - Save current game state');
    console.log('  load [file!]       - Load game state from file');
    console.log('  info              - Show current save info');
    console.log('  validate          - Validate current snapshot');
    console.log('  migrate [version!] - Migrate to specific version');
    console.log('  party             - Manage party members');
    console.log('  inventory         - Manage inventory items');
    console.log('  quests            - Manage quest flags');
    console.log('  unlock            - Manage unlocked content');
    console.log('  stats             - Show/update statistics');
    console.log('  settings          - Manage game settings');
    console.log('  metadata          - Manage metadata');
    console.log('  demo              - Reset to demo data');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');
    console.log(`Current save file: ${this.saveFilePath}`);
    console.log(`Player ID: ${this.currentSnapshot.playerId}`);
    console.log(`Zone: ${this.currentSnapshot.zoneId}`);
    console.log(`Version: ${this.currentSnapshot.version}`);

    this?.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this?.rl.question('SavePure> ', (input) => {
      this?.processCommand(input?.trim());
    });
  }

  /**
   * Process user command
   */
  private async processCommand(input: string): Promise<void> {
    if (!input) {
      this?.showPrompt();
      return;
    }

    const parts = input?.split(' ');
    const command = parts[0!].toLowerCase();
    const args = parts?.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this?.showHelp();
          break;
        case 'save':
        case 's':
          await this?.saveGame(args[0!]);
          break;
        case 'load':
        case 'l':
          await this?.loadGame(args[0!]);
          break;
        case 'info':
        case 'i':
          this?.showSaveInfo();
          break;
        case 'validate':
        case 'v':
          this?.validateSnapshot();
          break;
        case 'migrate':
        case 'm':
          this?.migrateSnapshot(args[0!]);
          break;
        case 'party':
        case 'p':
          this?.manageParty(args);
          break;
        case 'inventory':
        case 'inv':
          this?.manageInventory(args);
          break;
        case 'quests':
        case 'q':
          this?.manageQuests(args);
          break;
        case 'unlock':
        case 'u':
          this?.manageUnlocks(args);
          break;
        case 'stats':
          this?.manageStats(args);
          break;
        case 'settings':
        case 'set':
          this?.manageSettings(args);
          break;
        case 'metadata':
        case 'meta':
          this?.manageMetadata(args);
          break;
        case 'demo':
        case 'd':
          this?.resetDemo();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this?.exit();
          return;
        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Error: ${error}`);
    }

    this?.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('💾 SavePure CLI Help');
    console.log('Commands: save, load, info, validate, migrate, party, inventory, quests, unlock, stats, settings, metadata, demo, exit');
  }

  /**
   * Save game to file
   */
  private async saveGame(filePath?: string): Promise<void> {
    const targetPath = filePath || this?.saveFilePath;

    if (!SaveUtils?.validateFilePath(targetPath)) {
      console.log('❌ Invalid file path');
      return;
    }

    console.log(`💾 Saving game to ${targetPath}...`);

    const result = await this?.saveManager.saveGame(this?.currentSnapshot, targetPath);

    if (result?.success) {
      console.log(`✅ ${result.message}`);
      console.log(`📊 Save size: ${SaveUtils.formatFileSize(SaveUtils.calculateSaveSize(this.currentSnapshot))}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
  }

  /**
   * Load game from file
   */
  private async loadGame(filePath?: string): Promise<void> {
    const targetPath = filePath || this?.saveFilePath;

    console.log(`📂 Loading game from ${targetPath}...`);

    const result = await this?.saveManager.loadGame(targetPath);

    if (result?.success && result?.snapshot) {
      this?.currentSnapshot = result?.snapshot;
      console.log(`✅ ${result.message}`);

      if (result?.migrationResult && result?.migrationResult.migrated) {
        console.log(`🔄 Migrated from ${result.migrationResult.oldVersion} to ${result.migrationResult.newVersion}`);
      }

      this?.showSaveInfo();
    } else {
      console.log(`❌ ${result.message}`);
    }
  }

  /**
   * Show save information
   */
  private showSaveInfo(): void {
    const summary = this?.currentSnapshot.getSummary();

    console.log('='.repeat(70));
    console.log('📊 Save Information');
    console.log('='.repeat(70));
    console.log(`Player ID: ${this.currentSnapshot.playerId}`);
    console.log(`Zone: ${this.currentSnapshot.zoneId}`);
    console.log(`Version: ${this.currentSnapshot.version}`);
    console.log(`Timestamp: ${new Date(this.currentSnapshot.timestampUtc).toLocaleString()}`);
    console.log(`Checksum: ${this.currentSnapshot.checksum || 'none'}`);
    console.log('');
    console.log(`Party Members: ${summary.partySize}`);
    console.log(`Inventory Items: ${summary.inventoryItems}`);
    console.log(`Quest Flags: ${summary.questFlags}`);
    console.log(`Unlocked Content: ${summary.unlockedContent}`);
    console.log(`Total Play Time: ${Math.round((summary.totalPlayTime || 0) / 60000)} minutes`);
    console.log(`Save Size: ${summary.saveSize} bytes`);
    console.log('');

    // Show party details
    if (this?.currentSnapshot.partyRoster?.length > 0) {
      console.log('🎭 Party Members:');
      this?.currentSnapshot.partyRoster?.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} (Lv.${member.level}) - HP: ${member.hp}/${member.maxHp}`);
      });
      console.log('');
    }

    // Show inventory summary
    if (Object.keys(this.currentSnapshot.inventory).length > 0) {
      console.log('🎒 Inventory:');
      Object.entries(this.currentSnapshot.inventory).forEach(([item, quantity]) => {
        console.log(`  ${item}: ${quantity}`);
      });
      console.log('');
    }
  }

  /**
   * Validate current snapshot
   */
  private validateSnapshot(): void {
    console.log('🔍 Validating save snapshot...');

    const validationResult = this?.saveManager.validateSnapshot(this?.currentSnapshot);

    console.log(`Validation Result: ${validationResult.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`Version: ${validationResult.version}`);
    console.log(`Checksum Valid: ${validationResult.checksumValid ? '✅' : '❌'}`);

    if (validationResult?.errors.length > 0) {
      console.log('');
      console.log('❌ Errors:');
      validationResult?.errors.forEach((error: any) => {
        console.log(`  - ${error}`);
      });
    }

    if (validationResult?.warnings.length > 0) {
      console.log('');
      console.log('⚠️ Warnings:');
      validationResult?.warnings.forEach((warning: any) => {
        console.log(`  - ${warning}`);
      });
    }

    if (validationResult?.isValid && validationResult?.checksumValid) {
      console.log('✅ Save file is healthy and valid!');
    }
  }

  /**
   * Migrate snapshot to different version
   */
  private migrateSnapshot(targetVersion?: string): void {
    if (!targetVersion) {
      console.log('❌ Usage: migrate [version!]');
      console.log('Available versions: v1, v2, v3');
      return;
    }

    console.log(`🔄 Migrating from ${this.currentSnapshot.version} to ${targetVersion}...`);

    const migrator = new SaveMigrator();
    const result = migrator?.migrate(this?.currentSnapshot, targetVersion as any);

    if (result?.migrated) {
      this?.currentSnapshot = result?.snapshot;
      console.log(`✅ Migration successful!`);
      console.log(`📊 New version: ${this.currentSnapshot.version}`);
      console.log(`⚠️ Warnings: ${result.warnings.length}`);
      if (result?.warnings.length > 0) {
        result?.warnings.forEach((warning: any) => {
          console.log(`  - ${warning}`);
        });
      }
    } else {
      console.log(`❌ Migration failed or not needed`);
      console.log(`⚠️ ${result.warnings.join(', ')}`);
    }
  }

  /**
   * Manage party members
   */
  private manageParty(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const entityName = args[1!];

    switch (subcommand) {
      case 'add':
        if (!entityName) {
          console.log('❌ Usage: party add [name!]');
          return;
        }

        const hero = MockGameEntity?.createHero(entityName);
        this?.currentSnapshot.addPartyMember(hero);
        console.log(`✅ Added ${hero.name} to party`);
        break;

      case 'remove':
        if (!entityName) {
          console.log('❌ Usage: party remove [name!]');
          return;
        }

        const removed = this?.currentSnapshot.removePartyMember(entityName);
        if (removed) {
          console.log(`✅ Removed ${entityName} from party`);
        } else {
          console.log(`❌ Party member ${entityName} not found`);
        }
        break;

      case 'list':
        console.log('🎭 Party Members:');
        this?.currentSnapshot.partyRoster?.forEach((member, index) => {
          console.log(`  ${index + 1}. ${member.getSummary ? (member as any).getSummary() : member.name}`);
        });
        break;

      case 'damage':
        const damage = parseInt(args[1!]) || 10;
        this?.currentSnapshot.partyRoster?.forEach((member: any) => {
          if (member?.takeDamage) {
            (member as any).takeDamage(damage);
          }
        });
        console.log(`💔 Applied ${damage} damage to all party members`);
        break;

      case 'heal':
        const heal = parseInt(args[1!]) || 20;
        this?.currentSnapshot.partyRoster?.forEach((member: any) => {
          if (member?.heal) {
            (member as any).heal(heal);
          }
        });
        console.log(`💚 Healed all party members by ${heal} HP`);
        break;

      default:
        console.log('Party commands: add, remove, list, damage, heal');
    }
  }

  /**
   * Manage inventory items
   */
  private manageInventory(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const itemId = args[1!];
    const quantity = parseInt(args[2!]) || 1;

    switch (subcommand) {
      case 'add':
        if (!itemId) {
          console.log('❌ Usage: inventory add [item!] [quantity!]');
          return;
        }

        this?.currentSnapshot.addInventoryItem(itemId, quantity);
        console.log(`✅ Added ${quantity} x ${itemId} to inventory`);
        break;

      case 'remove':
        if (!itemId) {
          console.log('❌ Usage: inventory remove [item!] [quantity!]');
          return;
        }

        const removed = this?.currentSnapshot.removeInventoryItem(itemId, quantity);
        if (removed) {
          console.log(`✅ Removed ${quantity} x ${itemId} from inventory`);
        } else {
          console.log(`❌ Not enough ${itemId} in inventory`);
        }
        break;

      case 'list':
        console.log('🎒 Inventory:');
        Object.entries(this.currentSnapshot.inventory).forEach(([item, qty]) => {
          console.log(`  ${item}: ${qty}`);
        });
        break;

      case 'clear':
        this?.currentSnapshot.inventory = {};
        console.log('🗑️ Inventory cleared');
        break;

      default:
        console.log('Inventory commands: add, remove, list, clear');
    }
  }

  /**
   * Manage quest flags
   */
  private manageQuests(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const flagId = args[1!];
    const value = args[2!]?.toLowerCase() === 'true';

    switch (subcommand) {
      case 'set':
        if (!flagId) {
          console.log('❌ Usage: quests set [flag!] [true/false]');
          return;
        }

        this?.currentSnapshot.setQuestFlag(flagId, value);
        console.log(`✅ Set ${flagId} = ${value}`);
        break;

      case 'list':
        console.log('📋 Quest Flags:');
        Object.entries(this.currentSnapshot.questFlags).forEach(([flag, val]) => {
          console.log(`  ${flag}: ${val}`);
        });
        break;

      case 'clear':
        this?.currentSnapshot.questFlags = {};
        console.log('🗑️ Quest flags cleared');
        break;

      default:
        console.log('Quest commands: set, list, clear');
    }
  }

  /**
   * Manage unlocked content
   */
  private manageUnlocks(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const contentId = args[1!];

    switch (subcommand) {
      case 'unlock':
        if (!contentId) {
          console.log('❌ Usage: unlock unlock [content_id!]');
          return;
        }

        this?.currentSnapshot.unlockContent(contentId);
        console.log(`✅ Unlocked ${contentId}`);
        break;

      case 'check':
        if (!contentId) {
          console.log('❌ Usage: unlock check [content_id!]');
          return;
        }

        const unlocked = this?.currentSnapshot.isContentUnlocked(contentId);
        console.log(`${contentId}: ${unlocked ? '✅ Unlocked' : '❌ Locked'}`);
        break;

      case 'list':
        console.log('🔓 Unlocked Content:');
        this?.currentSnapshot.unlockedContent?.forEach((content: any) => {
          console.log(`  ${content}`);
        });
        break;

      case 'clear':
        this?.currentSnapshot.unlockedContent = [];
        console.log('🗑️ Unlocked content cleared');
        break;

      default:
        console.log('Unlock commands: unlock, check, list, clear');
    }
  }

  /**
   * Manage statistics
   */
  private manageStats(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const statId = args[1!];
    const value = parseInt(args[2!]) || 0;

    switch (subcommand) {
      case 'set':
        if (!statId) {
          console.log('❌ Usage: stats set [stat!] [value!]');
          return;
        }

        this?.currentSnapshot.updateStatistic(statId, value);
        console.log(`✅ Set ${statId} = ${value}`);
        break;

      case 'get':
        if (!statId) {
          console.log('❌ Usage: stats get [stat!]');
          return;
        }

        const statValue = this?.currentSnapshot.getStatistic(statId);
        console.log(`${statId}: ${statValue}`);
        break;

      case 'list':
        console.log('📊 Statistics:');
        Object.entries(this.currentSnapshot.statistics).forEach(([stat, val]) => {
          console.log(`  ${stat}: ${val}`);
        });
        break;

      case 'increment':
        if (!statId) {
          console.log('❌ Usage: stats increment [stat!]');
          return;
        }

        const currentValue = this?.currentSnapshot.getStatistic(statId);
        this?.currentSnapshot.updateStatistic(statId, currentValue + 1);
        console.log(`✅ Incremented ${statId} to ${currentValue + 1}`);
        break;

      default:
        console.log('Stats commands: set, get, list, increment');
    }
  }

  /**
   * Manage game settings
   */
  private manageSettings(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const settingId = args[1!];
    const value = args[2!];

    switch (subcommand) {
      case 'set':
        if (!settingId || value === undefined) {
          console.log('❌ Usage: settings set [setting!] [value!]');
          return;
        }

        this?.currentSnapshot.setGameSetting(settingId, value);
        console.log(`✅ Set ${settingId} = ${value}`);
        break;

      case 'get':
        if (!settingId) {
          console.log('❌ Usage: settings get [setting!]');
          return;
        }

        const settingValue = this?.currentSnapshot.getGameSetting(settingId);
        console.log(`${settingId}: ${settingValue}`);
        break;

      case 'list':
        console.log('⚙️ Game Settings:');
        Object.entries(this.currentSnapshot.gameSettings).forEach(([setting, val]) => {
          console.log(`  ${setting}: ${val}`);
        });
        break;

      default:
        console.log('Settings commands: set, get, list');
    }
  }

  /**
   * Manage metadata
   */
  private manageMetadata(args: string[]): void {
    const subcommand = args[0!]?.toLowerCase();
    const key = args[1!];
    const value = args[2!];

    switch (subcommand) {
      case 'set':
        if (!key || value === undefined) {
          console.log('❌ Usage: metadata set [key!] [value!]');
          return;
        }

        this?.currentSnapshot.addMetadata(key, value);
        console.log(`✅ Set metadata ${key} = ${value}`);
        break;

      case 'get':
        if (!key) {
          console.log('❌ Usage: metadata get [key!]');
          return;
        }

        const metaValue = this?.currentSnapshot.getMetadata(key);
        console.log(`${key}: ${metaValue}`);
        break;

      case 'list':
        console.log('📋 Metadata:');
        Object.entries(this.currentSnapshot.metadata).forEach(([key, val]) => {
          console.log(`  ${key}: ${val}`);
        });
        break;

      case 'clear':
        this?.currentSnapshot.metadata = {};
        console.log('🗑️ Metadata cleared');
        break;

      default:
        console.log('Metadata commands: set, get, list, clear');
    }
  }

  /**
   * Reset to demo data
   */
  private resetDemo(): void {
    this?.currentSnapshot = this?.createDemoSnapshot();
    console.log('🔄 Reset to demo data');
    this?.showSaveInfo();
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using SavePure CLI!');
    this?.rl.close();
    process?.exit(0);
  }
}

// Start CLI if run directly
if (require?.main === module) {
  const cli = new SavePureCLI();
  cli?.start();
}

export { SavePureCLI };