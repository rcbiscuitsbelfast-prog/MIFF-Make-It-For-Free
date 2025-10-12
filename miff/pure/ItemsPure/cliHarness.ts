#!/usr/bin/env node

/**
 * ItemsPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the ItemsPure item management system.
 */

import * as readline from 'readline';
import {
  Item,
  ItemEffect,
  ItemUsageManager,
  UsageResult,
  ItemType,
  ItemEffectType,
  UsageStatus,
  ItemUtils,
  IPlayerContext,
  ISpiritInstance
} from './index';
import { Spirit } from '../SpiritsPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

// Real Spirit Instance for testing - using actual Spirit class
class CLISpiritInstance extends Spirit implements ISpiritInstance {
  public id: string;
  public name: string;
  public currentHP: number;
  public maxHP: number;
  public syncLevel?: number;
  private fainted: boolean;

  constructor(id: string, name: string, maxHP: number = 100, currentHP?: number, syncLevel?: number) {
    this.logger = new StructuredLogger({ module: 'class' });
    this.id = id;
    this.name = name;
    this.maxHP = maxHP;
    this.currentHP = currentHP ?? maxHP;
    this.syncLevel = syncLevel;
    this.fainted = this.currentHP <= 0;
  }

  isFainted(): boolean {
    return this.fainted;
  }

  canEvolve(): boolean {
    return this.syncLevel !== undefined && this.syncLevel >= 50;
  }

  evolve(evolutionId: string): boolean {
    if (!this.canEvolve()) {
      return false;
    }
    this.logger.info(`${this.name} evolved to ${evolutionId}!`);
    return true;
  }
}

// CLI Application
class ItemsPureCLI {
  private rl: readline.Interface;
  private manager: ItemUsageManager;
  private context: IPlayerContext;
  private spirits: Map<string, MockSpiritInstance>;
  private items: Item[];

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Initialize context
    this.context = {
      playerId: 'player1',
      inventory: {
        'health_potion': 5,
        'super_potion': 3,
        'revive': 2,
        'sync_crystal': 4,
        'attack_elixir': 1,
        'mystery_key': 1
      },
      flags: {}
    };

    this.manager = new ItemUsageManager(this.context);
    this.spirits = new Map();
    this.items = [];

    this.initializeItems();
    this.initializeSpirits();
  }

  /**
   * Initialize default items
   */
  private initializeItems(): void {
    this.items = ItemUtils.createStandardItemSet();
    this.items.forEach(item => this.manager.registerItem(item));
    this.logger.info(`Loaded ${this.items.length} items into registry`);
  }

  /**
   * Initialize test spirits
   */
  private initializeSpirits(): void {
    const spirits = [
      new CLISpiritInstance({
        id: 'spirit1', name: 'Fire Spirit', species: 'Fire Spirit', type: ['fire'],
        level: 15, stats: { hp: 100, attack: 50, defense: 40, specialAttack: 60, specialDefense: 45, speed: 35 },
        moves: ['ember', 'flame_burst'], experience: 1500, syncLevel: 30
      }),
      new CLISpiritInstance({
        id: 'spirit2', name: 'Water Spirit', species: 'Water Spirit', type: ['water'],
        level: 12, stats: { hp: 80, attack: 45, defense: 50, specialAttack: 55, specialDefense: 50, speed: 40 },
        moves: ['water_gun', 'bubble_beam'], experience: 1200, syncLevel: 45
      }),
      new CLISpiritInstance({
        id: 'spirit3', name: 'Wind Spirit', species: 'Wind Spirit', type: ['flying'],
        level: 18, stats: { hp: 90, attack: 55, defense: 35, specialAttack: 65, specialDefense: 40, speed: 50 },
        moves: ['gust', 'air_slash'], experience: 1800, syncLevel: 60, currentHP: 0 // Fainted
      }),
      new CLISpiritInstance({
        id: 'spirit4', name: 'Earth Spirit', species: 'Earth Spirit', type: ['ground'],
        level: 20, stats: { hp: 120, attack: 60, defense: 55, specialAttack: 45, specialDefense: 50, speed: 25 },
        moves: ['earthquake', 'rock_throw'], experience: 2000, syncLevel: 25
      }),
      new CLISpiritInstance({
        id: 'spirit5', name: 'Light Spirit', species: 'Light Spirit', type: ['light'],
        level: 14, stats: { hp: 70, attack: 40, defense: 35, specialAttack: 70, specialDefense: 55, speed: 45 },
        moves: ['light_beam', 'heal'], experience: 1400, syncLevel: 80 // High sync, can evolve
      })
    ];

    spirits.forEach(spirit => {
      this.spirits.set(spirit.id, spirit);
    });

    this.logger.info(`Created ${spirits.length} test spirits`);
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('🎒 ItemsPure CLI - Item Management System');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  items         - Show all items');
    this.logger.info('  spirits       - Show all spirits');
    this.logger.info('  use [item] [spirit] - Use item on spirit');
    this.logger.info('  info [item]   - Show item details');
    this.logger.info('  search [query] - Search items');
    this.logger.info('  heal [spirit] [amount] - Heal spirit');
    this.logger.info('  damage [spirit] [amount] - Damage spirit');
    this.logger.info('  status        - Show system status');
    this.logger.info('  help          - Show this help');
    this.logger.info('  exit          - Exit application');
    this.logger.info('');

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('ItemsPure> ', (input) => {
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
        case 'items':
        case 'i':
          this.showItems();
          break;
        case 'spirits':
        case 's':
          this.showSpirits();
          break;
        case 'use':
        case 'u':
          await this.useItem(args);
          break;
        case 'info':
          this.showItemInfo(args[0]);
          break;
        case 'search':
          this.searchItems(args.join(' '));
          break;
        case 'heal':
          this.healSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'damage':
        case 'dmg':
          this.damageSpirit(args[0], parseInt(args[1]) || 20);
          break;
        case 'status':
        case 'stat':
          this.showStatus();
          break;
        case 'exit':
        case 'quit':
        case 'q':
          this.exit();
          return;
        default:
          this.logger.info(`❌ Unknown command: ${command}`);
          this.logger.info('Type "help" for available commands.');
      }
    } catch (error) {
      this.logger.info(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📚 ItemsPure CLI Help');
    this.logger.info('='.repeat(60));
    this.logger.info('');
    this.logger.info('Commands:');
    this.logger.info('  help                    - Show this help');
    this.logger.info('  items                   - List all registered items');
    this.logger.info('  spirits                 - List all available spirits');
    this.logger.info('  use [item] [spirit]     - Use item on spirit');
    this.logger.info('  info [item]             - Show detailed item information');
    this.logger.info('  search [query]          - Search items by name or ID');
    this.logger.info('  heal [spirit] [amount]  - Heal spirit by amount (default: 20)');
    this.logger.info('  damage [spirit] [amount]- Damage spirit by amount (default: 20)');
    this.logger.info('  status                  - Show system statistics');
    this.logger.info('  exit                    - Exit the application');
    this.logger.info('');
    this.logger.info('Examples:');
    this.logger.info('  use health_potion spirit1');
    this.logger.info('  use revive spirit3');
    this.logger.info('  use sync_crystal spirit2');
    this.logger.info('  search potion');
    this.logger.info('  heal spirit1 50');
    this.logger.info('');
  }

  /**
   * Show all registered items
   */
  private showItems(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('📦 Registered Items');
    this.logger.info('='.repeat(60));

    if (this.items.length === 0) {
      this.logger.info('No items registered.');
      return;
    }

    this.items.forEach((item, index) => {
      const inventoryCount = this.context.inventory[item.itemID] || 0;
      const effectIcon = this.getEffectIcon(item.effect.effectType);
      this.logger.info(`${index + 1}. ${effectIcon} ${item.name} (${item.type})`);
      this.logger.info(`   ID: ${item.itemID}`);
      this.logger.info(`   Effect: ${item.effect.getSummary()}`);
      this.logger.info(`   Target: ${item.targetRule}`);
      this.logger.info(`   Inventory: ${inventoryCount}`);
      this.logger.info('');
    });
  }

  /**
   * Show all spirits
   */
  private showSpirits(): void {
    this.logger.info('='.repeat(60));
    this.logger.info('👻 Available Spirits');
    this.logger.info('='.repeat(60));

    if (this.spirits.size === 0) {
      this.logger.info('No spirits available.');
      return;
    }

    Array.from(this.spirits.values()).forEach((spirit, index) => {
      const status = spirit.isFainted() ? '💀 Fainted' : '✅ Active';
      const syncInfo = spirit.syncLevel !== undefined ? ` | Sync: ${spirit.syncLevel}` : '';
      const healthBar = this.createHealthBar(spirit.currentHP, spirit.maxHP);
      const evolveStatus = spirit.canEvolve() ? '✨ Can Evolve' : '';

      this.logger.info(`${index + 1}. ${spirit.name} [${spirit.id}]`);
      this.logger.info(`   HP: ${spirit.currentHP}/${spirit.maxHP} ${healthBar}`);
      this.logger.info(`   Status: ${status}${syncInfo} ${evolveStatus}`);
      this.logger.info('');
    });
  }

  /**
   * Use item on spirit
   */
  private async useItem(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.logger.info('❌ Usage: use [item] [spirit]');
      return;
    }

    const itemId = args[0];
    const spiritId = args[1];

    const item = this.manager.getItem(itemId);
    const spirit = this.spirits.get(spiritId);

    if (!item) {
      this.logger.info(`❌ Item not found: ${itemId}`);
      return;
    }

    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    this.logger.info(`🎒 Using ${item.name} on ${spirit.name}...`);

    // Check if can use
    if (!this.manager.canUseItem(itemId, spirit)) {
      this.logger.info(`❌ Cannot use ${item.name} on ${spirit.name}`);
      return;
    }

    // Use item
    const result = this.manager.useItem(itemId, spirit);

    if (result.isSuccess) {
      this.logger.info(`✅ ${result.message}`);
      this.logger.info(`📊 ${spirit.name} HP: ${spirit.currentHP}/${spirit.maxHP}`);
    } else {
      this.logger.info(`❌ ${result.message}`);
    }
  }

  /**
   * Show detailed item information
   */
  private showItemInfo(itemId: string): void {
    if (!itemId) {
      this.logger.info('❌ Usage: info [item]');
      return;
    }

    const item = this.manager.getItem(itemId);
    if (!item) {
      this.logger.info(`❌ Item not found: ${itemId}`);
      return;
    }

    this.logger.info('='.repeat(60));
    this.logger.info(`📋 Item Information: ${item.name}`);
    this.logger.info('='.repeat(60));
    this.logger.info(`ID: ${item.itemID}`);
    this.logger.info(`Type: ${item.type}`);
    this.logger.info(`Target Rule: ${item.targetRule}`);
    this.logger.info(`Description: ${item.getDescription()}`);
    this.logger.info('');

    // Show effect details
    const effect = item.effect;
    this.logger.info('Effect Details:');
    this.logger.info(`  Type: ${effect.effectType}`);
    this.logger.info(`  Amount: ${effect.amount}`);
    if (effect.param) {
      this.logger.info(`  Parameter: ${effect.param}`);
    }
    this.logger.info(`  Cooldown: ${effect.cooldownSeconds}s`);
    this.logger.info(`  Max Uses: ${effect.maxUses === -1 ? 'Unlimited' : effect.maxUses}`);
    this.logger.info('');

    // Show validation
    const errors = item.validate();
    if (errors.length === 0) {
      this.logger.info('✅ Item is valid');
    } else {
      this.logger.info('❌ Validation errors:');
      errors.forEach(error => this.logger.info(`   - ${error}`));
    }
  }

  /**
   * Search items
   */
  private searchItems(query: string): void {
    const results = this.manager.searchItems(query);

    this.logger.info('='.repeat(60));
    this.logger.info(`🔍 Search Results for "${query}"`);
    this.logger.info('='.repeat(60));

    if (results.length === 0) {
      this.logger.info('No items found.');
      return;
    }

    results.forEach((item, index) => {
      this.logger.info(`${index + 1}. ${item.name} (${item.type}) - ${item.itemID}`);
    });
    this.logger.info(`\nFound ${results.length} items.`);
  }

  /**
   * Heal spirit
   */
  private healSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    const maxHeal = spirit.maxHP - oldHP;
    const actualHeal = Math.min(amount, maxHeal);

    if (actualHeal <= 0) {
      this.logger.info(`❌ ${spirit.name} is already at full health`);
      return;
    }

    spirit.currentHP += actualHeal;
    this.logger.info(`❤️ Healed ${spirit.name} by ${actualHeal} HP`);
    this.logger.info(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);
  }

  /**
   * Damage spirit
   */
  private damageSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (spirit.isFainted()) {
      this.logger.info(`❌ ${spirit.name} is already fainted`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.currentHP = Math.max(0, spirit.currentHP - amount);

    this.logger.info(`💔 Damaged ${spirit.name} by ${amount} HP`);
    this.logger.info(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);

    if (spirit.isFainted()) {
      this.logger.info(`💀 ${spirit.name} fainted!`);
    }
  }

  /**
   * Show system status
   */
  private showStatus(): void {
    const stats = ItemUtils.getItemStatistics(this.items);

    this.logger.info('='.repeat(60));
    this.logger.info('📊 System Status');
    this.logger.info('='.repeat(60));

    this.logger.info(`Total Items: ${stats.totalItems}`);
    this.logger.info(`Consumables: ${stats.consumableCount}`);
    this.logger.info(`Items with Target Rules: ${stats.hasTargetRules}`);
    this.logger.info('');

    this.logger.info('Items by Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      this.logger.info(`  ${type}: ${count}`);
    });
    this.logger.info('');

    this.logger.info('Items by Effect:');
    Object.entries(stats.byEffect).forEach(([effect, count]) => {
      if (count > 0) {
        this.logger.info(`  ${effect}: ${count}`);
      }
    });
    this.logger.info('');

    this.logger.info('Current Inventory:');
    Object.entries(this.context.inventory).forEach(([itemId, count]) => {
      if (count > 0) {
        const item = this.manager.getItem(itemId);
        this.logger.info(`  ${item?.name || itemId}: ${count}`);
      }
    });
    this.logger.info('');

    this.logger.info('Active Spirits:');
    Array.from(this.spirits.values()).forEach(spirit => {
      const status = spirit.isFainted() ? '💀 Fainted' : '✅ Active';
      const syncInfo = spirit.syncLevel !== undefined ? ` | Sync: ${spirit.syncLevel}` : '';
      const evolveStatus = spirit.canEvolve() ? ' ✨ Can Evolve' : '';
      this.logger.info(`  ${spirit.name}: ${spirit.currentHP}/${spirit.maxHP} HP ${status}${syncInfo}${evolveStatus}`);
    });
  }

  /**
   * Get icon for effect type
   */
  private getEffectIcon(effectType: ItemEffectType): string {
    switch (effectType) {
      case ItemEffectType.HEAL: return '❤️';
      case ItemEffectType.REVIVE: return '💚';
      case ItemEffectType.BUFF_ATTACK: return '⚔️';
      case ItemEffectType.BUFF_DEFENSE: return '🛡️';
      case ItemEffectType.SYNC_BOOST: return '🔄';
      case ItemEffectType.EVOLVE: return '✨';
      case ItemEffectType.UNLOCK_FLAG: return '🔑';
      case ItemEffectType.NONE: return '❓';
      default: return '❓';
    }
  }

  /**
   * Create health bar string
   */
  private createHealthBar(current: number, max: number): string {
    const barLength = 10;
    const filledLength = Math.round((current / max) * barLength);
    const emptyLength = barLength - filledLength;

    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);

    return `[${filled}${empty}]`;
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using ItemsPure CLI!');
    this.rl.close();
    process.exit(0);
  }
}

// Start CLI if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ItemsPureCLI();
  cli.start();
}

export { ItemsPureCLI };