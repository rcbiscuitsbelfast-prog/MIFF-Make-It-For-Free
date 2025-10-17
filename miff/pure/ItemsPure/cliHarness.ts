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

// Mock Spirit Instance for testing
class MockSpiritInstance implements ISpiritInstance {
  public id: string;
  public name: string;
  public currentHP: number;
  public maxHP: number;
  public syncLevel?: number;
  private fainted: boolean;

  constructor(id: string, name: string, maxHP: number = 100, currentHP?: number, syncLevel?: number) {
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
    console.log(`${this.name} evolved to ${evolutionId}!`);
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
    this.items.forEach((item: any) => this.manager.registerItem(item));
    console.log(`Loaded ${this.items.length} items into registry`);
  }

  /**
   * Initialize test spirits
   */
  private initializeSpirits(): void {
    const spirits = [
      new MockSpiritInstance('spirit1', 'Fire Spirit', 100, 75, 30),
      new MockSpiritInstance('spirit2', 'Water Spirit', 80, 60, 45),
      new MockSpiritInstance('spirit3', 'Wind Spirit', 90, 0, 60), // Fainted
      new MockSpiritInstance('spirit4', 'Earth Spirit', 120, 120, 25),
      new MockSpiritInstance('spirit5', 'Light Spirit', 70, 35, 80) // High sync, can evolve
    ];

    spirits.forEach((spirit: any) => {
      this.spirits.set(spirit.id, spirit);
    });

    console.log(`Created ${spirits.length} test spirits`);
  }

  /**
   * Start CLI application
   */
  start(): void {
    console.log('='.repeat(60));
    console.log('🎒 ItemsPure CLI - Item Management System');
    console.log('='.repeat(60));
    console.log('');
    console.log('Available commands:');
    console.log('  items         - Show all items');
    console.log('  spirits       - Show all spirits');
    console.log('  use [item!] [spirit!] - Use item on spirit');
    console.log('  info [item!]   - Show item details');
    console.log('  search [query!] - Search items');
    console.log('  heal [spirit!] [amount!] - Heal spirit');
    console.log('  damage [spirit!] [amount!] - Damage spirit');
    console.log('  status        - Show system status');
    console.log('  help          - Show this help');
    console.log('  exit          - Exit application');
    console.log('');

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
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands.');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Error: ${error}`);
    }

    this.showPrompt();
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log('='.repeat(60));
    console.log('📚 ItemsPure CLI Help');
    console.log('='.repeat(60));
    console.log('');
    console.log('Commands:');
    console.log('  help                    - Show this help');
    console.log('  items                   - List all registered items');
    console.log('  spirits                 - List all available spirits');
    console.log('  use [item!] [spirit!]     - Use item on spirit');
    console.log('  info [item!]             - Show detailed item information');
    console.log('  search [query!]          - Search items by name or ID');
    console.log('  heal [spirit!] [amount!]  - Heal spirit by amount (default: 20)');
    console.log('  damage [spirit!] [amount!]- Damage spirit by amount (default: 20)');
    console.log('  status                  - Show system statistics');
    console.log('  exit                    - Exit the application');
    console.log('');
    console.log('Examples:');
    console.log('  use health_potion spirit1');
    console.log('  use revive spirit3');
    console.log('  use sync_crystal spirit2');
    console.log('  search potion');
    console.log('  heal spirit1 50');
    console.log('');
  }

  /**
   * Show all registered items
   */
  private showItems(): void {
    console.log('='.repeat(60));
    console.log('📦 Registered Items');
    console.log('='.repeat(60));

    if (this.items.length === 0) {
      console.log('No items registered.');
      return;
    }

    this.items.forEach((item, index) => {
      const inventoryCount = this.context.inventory[item.itemID] || 0;
      const effectIcon = this.getEffectIcon(item.effect.effectType);
      console.log(`${index + 1}. ${effectIcon} ${item.name} (${item.type})`);
      console.log(`   ID: ${item.itemID}`);
      console.log(`   Effect: ${item.effect.getSummary()}`);
      console.log(`   Target: ${item.targetRule}`);
      console.log(`   Inventory: ${inventoryCount}`);
      console.log('');
    });
  }

  /**
   * Show all spirits
   */
  private showSpirits(): void {
    console.log('='.repeat(60));
    console.log('👻 Available Spirits');
    console.log('='.repeat(60));

    if (this.spirits.size === 0) {
      console.log('No spirits available.');
      return;
    }

    Array.from(this.spirits.values()).forEach((spirit, index) => {
      const status = spirit.isFainted() ? '💀 Fainted' : '✅ Active';
      const syncInfo = spirit.syncLevel !== undefined ? ` | Sync: ${spirit.syncLevel}` : '';
      const healthBar = this.createHealthBar(spirit.currentHP, spirit.maxHP);
      const evolveStatus = spirit.canEvolve() ? '✨ Can Evolve' : '';

      console.log(`${index + 1}. ${spirit.name} [${spirit.id}]`);
      console.log(`   HP: ${spirit.currentHP}/${spirit.maxHP} ${healthBar}`);
      console.log(`   Status: ${status}${syncInfo} ${evolveStatus}`);
      console.log('');
    });
  }

  /**
   * Use item on spirit
   */
  private async useItem(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.log('❌ Usage: use [item!] [spirit!]');
      return;
    }

    const itemId = args[0];
    const spiritId = args[1];

    const item = this.manager.getItem(itemId);
    const spirit = this.spirits.get(spiritId);

    if (!item) {
      console.log(`❌ Item not found: ${itemId}`);
      return;
    }

    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    console.log(`🎒 Using ${item.name} on ${spirit.name}...`);

    // Check if can use
    if (!this.manager.canUseItem(itemId, spirit)) {
      console.log(`❌ Cannot use ${item.name} on ${spirit.name}`);
      return;
    }

    // Use item
    const result = this.manager.useItem(itemId, spirit);

    if (result.isSuccess) {
      console.log(`✅ ${result.message}`);
      console.log(`📊 ${spirit.name} HP: ${spirit.currentHP}/${spirit.maxHP}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
  }

  /**
   * Show detailed item information
   */
  private showItemInfo(itemId: string): void {
    if (!itemId) {
      console.log('❌ Usage: info [item!]');
      return;
    }

    const item = this.manager.getItem(itemId);
    if (!item) {
      console.log(`❌ Item not found: ${itemId}`);
      return;
    }

    console.log('='.repeat(60));
    console.log(`📋 Item Information: ${item.name}`);
    console.log('='.repeat(60));
    console.log(`ID: ${item.itemID}`);
    console.log(`Type: ${item.type}`);
    console.log(`Target Rule: ${item.targetRule}`);
    console.log(`Description: ${item.getDescription()}`);
    console.log('');

    // Show effect details
    const effect = item.effect;
    console.log('Effect Details:');
    console.log(`  Type: ${effect.effectType}`);
    console.log(`  Amount: ${effect.amount}`);
    if (effect.param) {
      console.log(`  Parameter: ${effect.param}`);
    }
    console.log(`  Cooldown: ${effect.cooldownSeconds}s`);
    console.log(`  Max Uses: ${effect.maxUses === -1 ? 'Unlimited' : effect.maxUses}`);
    console.log('');

    // Show validation
    const errors = item.validate({});
    if (errors.length === 0) {
      console.log('✅ Item is valid');
    } else {
      console.log('❌ Validation errors:');
      errors.forEach((error: any) => console.log(`   - ${error}`));
    }
  }

  /**
   * Search items
   */
  private searchItems(query: string): void {
    const results = this.manager.searchItems(query);

    console.log('='.repeat(60));
    console.log(`🔍 Search Results for "${query}"`);
    console.log('='.repeat(60));

    if (results.length === 0) {
      console.log('No items found.');
      return;
    }

    results.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - ${item.itemID}`);
    });
    console.log(`\nFound ${results.length} items.`);
  }

  /**
   * Heal spirit
   */
  private healSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    const oldHP = spirit.currentHP;
    const maxHeal = spirit.maxHP - oldHP;
    const actualHeal = Math.min(amount, maxHeal);

    if (actualHeal <= 0) {
      console.log(`❌ ${spirit.name} is already at full health`);
      return;
    }

    spirit.currentHP += actualHeal;
    console.log(`❤️ Healed ${spirit.name} by ${actualHeal} HP`);
    console.log(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);
  }

  /**
   * Damage spirit
   */
  private damageSpirit(spiritId: string, amount: number): void {
    const spirit = this.spirits.get(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (spirit.isFainted()) {
      console.log(`❌ ${spirit.name} is already fainted`);
      return;
    }

    const oldHP = spirit.currentHP;
    spirit.currentHP = Math.max(0, spirit.currentHP - amount);

    console.log(`💔 Damaged ${spirit.name} by ${amount} HP`);
    console.log(`📊 HP: ${oldHP} → ${spirit.currentHP}/${spirit.maxHP}`);

    if (spirit.isFainted()) {
      console.log(`💀 ${spirit.name} fainted!`);
    }
  }

  /**
   * Show system status
   */
  private showStatus(): void {
    const stats = ItemUtils.getItemStatistics(this.items);

    console.log('='.repeat(60));
    console.log('📊 System Status');
    console.log('='.repeat(60));

    console.log(`Total Items: ${stats.totalItems}`);
    console.log(`Consumables: ${stats.consumableCount}`);
    console.log(`Items with Target Rules: ${stats.hasTargetRules}`);
    console.log('');

    console.log('Items by Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('');

    console.log('Items by Effect:');
    Object.entries(stats.byEffect).forEach(([effect, count]) => {
      if (count > 0) {
        console.log(`  ${effect}: ${count}`);
      }
    });
    console.log('');

    console.log('Current Inventory:');
    Object.entries(this.context.inventory).forEach(([itemId, count]) => {
      if (count > 0) {
        const item = this.manager.getItem(itemId);
        console.log(`  ${item?.name || itemId}: ${count}`);
      }
    });
    console.log('');

    console.log('Active Spirits:');
    Array.from(this.spirits.values()).forEach((spirit: any) => {
      const status = spirit.isFainted() ? '💀 Fainted' : '✅ Active';
      const syncInfo = spirit.syncLevel !== undefined ? ` | Sync: ${spirit.syncLevel}` : '';
      const evolveStatus = spirit.canEvolve() ? ' ✨ Can Evolve' : '';
      console.log(`  ${spirit.name}: ${spirit.currentHP}/${spirit.maxHP} HP ${status}${syncInfo}${evolveStatus}`);
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
    console.log('');
    console.log('👋 Thank you for using ItemsPure CLI!');
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