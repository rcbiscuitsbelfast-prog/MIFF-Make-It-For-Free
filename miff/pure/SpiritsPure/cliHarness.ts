#!/usr/bin/env node

/**
 * SpiritsPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SpiritsPure spirit collection management system.
 */

import * as readline from 'readline';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
import {
  Spirit,
  SpiritCollection,
  SpiritFilter,
  SpiritSorter,
  SpiritUtils,
  SortOption,
  SpiritType,
  SpiritRarity,
  ISpirit,
  ISpiritFilter
} from './index';

// CLI Application
class SpiritsPureCLI {
  private logger: StructuredLogger;
  private rl: readline.Interface;
  private collection: SpiritCollection;
  private filter: SpiritFilter;
  private sorter: SpiritSorter;
  private currentSortOption: SortOption = SortOption.ALPHABETICAL_ASC;

  constructor() {
    this.logger = new StructuredLogger({ module: 'SpiritsPureCLI' });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.collection = SpiritUtils.createDemoCollection();
    this.filter = SpiritUtils.createDefaultFilter();
    this.sorter = SpiritUtils.createDefaultSorter();
  }

  /**
   * Start CLI application
   */
  start(): void {
    this.logger.info('='.repeat(70));
    this.logger.info('👻 SpiritsPure CLI - Spirit Collection Management');
    this.logger.info('='.repeat(70));
    this.logger.info('');
    this.logger.info('Available commands:');
    this.logger.info('  list [filter]     - List spirits with optional filter');
    this.logger.info('  add [name]        - Add new spirit');
    this.logger.info('  remove [id]       - Remove spirit by ID');
    this.logger.info('  search [query]    - Search spirits by name/description');
    this.logger.info('  filter [type]     - Apply filter to spirits');
    this.logger.info('  sort [option]     - Sort spirits');
    this.logger.info('  capture [id]      - Mark spirit as captured');
    this.logger.info('  release [id]      - Mark spirit as uncaptured');
    this.logger.info('  favorite [id]     - Toggle favorite status');
    this.logger.info('  stats             - Show collection statistics');
    this.logger.info('  completion        - Show completion statistics');
    this.logger.info('  info [id]         - Show detailed spirit info');
    this.logger.info('  demo              - Reset to demo data');
    this.logger.info('  help              - Show this help');
    this.logger.info('  exit              - Exit application');
    this.logger.info('');
    this.logger.info(`Current collection: ${this.collection.totalSpirits} spirits`);
    this.logger.info(`Captured: ${this.collection.capturedCount} (${this.collection.completionPercentage.toFixed(1)}%)`);

    this.showPrompt();
  }

  /**
   * Show command prompt
   */
  private showPrompt(): void {
    this.rl.question('SpiritsPure> ', (input) => {
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
        case 'list':
        case 'l':
          this.listSpirits(args[0]);
          break;
        case 'add':
        case 'a':
          this.addSpirit(args[0]);
          break;
        case 'remove':
        case 'r':
          this.removeSpirit(args[0]);
          break;
        case 'search':
        case 's':
          this.searchSpirits(args[0]);
          break;
        case 'filter':
        case 'f':
          this.applyFilter(args);
          break;
        case 'sort':
          this.applySort(args[0]);
          break;
        case 'capture':
        case 'c':
          this.captureSpirit(args[0]);
          break;
        case 'release':
          this.releaseSpirit(args[0]);
          break;
        case 'favorite':
        case 'fav':
          this.toggleFavorite(args[0]);
          break;
        case 'stats':
          this.showStatistics();
          break;
        case 'completion':
        case 'comp':
          this.showCompletion();
          break;
        case 'info':
        case 'i':
          this.showSpiritInfo(args[0]);
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
    this.logger.info('👻 SpiritsPure CLI Help');
    this.logger.info('Commands: list, add, remove, search, filter, sort, capture, release, favorite, stats, completion, info, demo, exit');
  }

  /**
   * List spirits with optional filter
   */
  private listSpirits(filterArg?: string): void {
    let spirits = this.collection.spirits;

    if (filterArg) {
      switch (filterArg.toLowerCase()) {
        case 'captured':
          spirits = this.collection.capturedSpirits;
          break;
        case 'uncaptured':
          spirits = this.collection.uncapturedSpirits;
          break;
        case 'favorites':
          spirits = this.collection.favoriteSpirits;
          break;
        case 'evolved':
          spirits = this.collection.getEvolvedSpirits();
          break;
        case 'unevolved':
          spirits = this.collection.getUnevolvedSpirits();
          break;
        default:
          spirits = this.collection.filterSpirits(this.filter);
      }
    } else {
      spirits = this.collection.sortSpirits(this.currentSortOption);
    }

    this.logger.info('='.repeat(70));
    this.logger.info(`👻 Spirits (${spirits.length} shown)`);
    this.logger.info('='.repeat(70));

    if (spirits.length === 0) {
      this.logger.info('No spirits found.');
      return;
    }

    spirits.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const rarityIcon = this.getRarityIcon(spirit.rarity);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      const favoriteIcon = spirit.isFavorite ? '⭐' : '  ';

      this.logger.info(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${rarityIcon}`);
      this.logger.info(`    ${favoriteIcon} ${statusIcon} Lv.${spirit.level} | Sync: ${spirit.syncLevel}% | ${spirit.getTypeDescription()}`);
      this.logger.info(`    ID: ${spirit.spiritId} | ${spirit.getSyncDescription()}`);
      this.logger.info('');
    });

    this.logger.info(`Total: ${this.collection.totalSpirits} | Captured: ${this.collection.capturedCount} | Completion: ${this.collection.completionPercentage.toFixed(1)}%`);
  }

  /**
   * Add new spirit
   */
  private addSpirit(name?: string): void {
    if (!name) {
      this.logger.info('❌ Usage: add [spirit_name]');
      this.logger.info('Example: add "Fire Dragon"');
      return;
    }

    const spirit = Spirit.create(
      SpiritUtils.generateSpiritId(),
      name,
      `A ${name.toLowerCase()} spirit`,
      SpiritType.FIRE, // Default to fire for demo
      undefined,
      SpiritRarity.COMMON
    );

    this.collection.addSpirit(spirit);
    this.logger.info(`✅ Added ${name} to collection (ID: ${spirit.spiritId})`);
  }

  /**
   * Remove spirit
   */
  private removeSpirit(spiritId?: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: remove [spirit_id]');
      return;
    }

    const removed = this.collection.removeSpirit(spiritId);
    if (removed) {
      this.logger.info(`✅ Removed spirit with ID: ${spiritId}`);
    } else {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
    }
  }

  /**
   * Search spirits
   */
  private searchSpirits(query?: string): void {
    if (!query) {
      this.logger.info('❌ Usage: search [query]');
      this.logger.info('Example: search "dragon"');
      return;
    }

    const results = this.collection.searchSpirits(query);

    this.logger.info(`🔍 Search results for "${query}" (${results.length} found):`);

    if (results.length === 0) {
      this.logger.info('No spirits found.');
      return;
    }

    results.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      this.logger.info(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${statusIcon}`);
      this.logger.info(`    ${spirit.getTypeDescription()} | Lv.${spirit.level} | ID: ${spirit.spiritId}`);
      this.logger.info('');
    });
  }

  /**
   * Apply filter
   */
  private applyFilter(args: string[]): void {
    const filterType = args[0]?.toLowerCase();

    this.filter.reset();

    switch (filterType) {
      case 'captured':
        this.filter.captured = true;
        this.logger.info('🔍 Filter: Captured spirits only');
        break;
      case 'uncaptured':
        this.filter.captured = false;
        this.logger.info('🔍 Filter: Uncaptured spirits only');
        break;
      case 'fire':
        this.filter.type = SpiritType.FIRE;
        this.logger.info('🔍 Filter: Fire-type spirits');
        break;
      case 'water':
        this.filter.type = SpiritType.WATER;
        this.logger.info('🔍 Filter: Water-type spirits');
        break;
      case 'high-sync':
        this.filter.minSync = 50;
        this.logger.info('🔍 Filter: High sync spirits (50%+)');
        break;
      case 'legendary':
        this.filter.rarity = SpiritRarity.LEGENDARY;
        this.logger.info('🔍 Filter: Legendary spirits');
        break;
      case 'evolved':
        this.filter.hasEvolved = true;
        this.logger.info('🔍 Filter: Evolved spirits');
        break;
      case 'favorites':
        this.filter.isFavorite = true;
        this.logger.info('🔍 Filter: Favorite spirits');
        break;
      case 'clear':
        this.filter.reset();
        this.logger.info('🔍 Filter cleared');
        break;
      default:
        this.logger.info('🔍 Available filters: captured, uncaptured, fire, water, high-sync, legendary, evolved, favorites, clear');
        return;
    }

    this.listSpirits();
  }

  /**
   * Apply sort
   */
  private applySort(sortOptionStr?: string): void {
    let sortOption: SortOption = SortOption.ALPHABETICAL_ASC;

    if (sortOptionStr) {
      switch (sortOptionStr.toLowerCase()) {
        case 'alpha':
        case 'name':
          sortOption = SortOption.ALPHABETICAL_ASC;
          break;
        case 'sync':
          sortOption = SortOption.SYNC_DESC;
          break;
        case 'rarity':
          sortOption = SortOption.RARITY_DESC;
          break;
        case 'level':
          sortOption = SortOption.LEVEL_DESC;
          break;
        default:
          this.logger.info('🔄 Available sorts: alpha, sync, rarity, level');
          return;
      }
    }

    this.currentSortOption = sortOption;
    const sortDescription = this.sorter.getSortDescription(sortOption);
    this.logger.info(`🔄 Sorting by: ${sortDescription}`);
    this.listSpirits();
  }

  /**
   * Capture spirit
   */
  private captureSpirit(spiritId?: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: capture [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (spirit.isCaptured) {
      this.logger.info(`ℹ️ ${spirit.spiritName} is already captured`);
      return;
    }

    spirit.isCaptured = true;
    spirit.captureDate = new Date();
    spirit.captureLevel = spirit.level;
    spirit.syncLevel = Math.floor(Math.random() * 100); // Random sync level

    this.logger.info(`✅ Captured ${spirit.spiritName}!`);
    this.logger.info(`📊 Sync Level: ${spirit.syncLevel}%`);
    this.logger.info(`📈 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Release spirit
   */
  private releaseSpirit(spiritId?: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: release [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!spirit.isCaptured) {
      this.logger.info(`ℹ️ ${spirit.spiritName} is not captured`);
      return;
    }

    spirit.isCaptured = false;
    spirit.captureDate = undefined;
    spirit.captureLocation = undefined;
    spirit.captureLevel = undefined;

    this.logger.info(`✅ Released ${spirit.spiritName} back into the wild`);
    this.logger.info(`📉 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Toggle favorite status
   */
  private toggleFavorite(spiritId?: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: favorite [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    spirit.isFavorite = !spirit.isFavorite;
    const status = spirit.isFavorite ? 'added to favorites' : 'removed from favorites';
    this.logger.info(`⭐ ${spirit.spiritName} ${status}`);
  }

  /**
   * Show collection statistics
   */
  private showStatistics(): void {
    const stats = this.collection.getStatistics();

    this.logger.info('='.repeat(70));
    this.logger.info('📊 Collection Statistics');
    this.logger.info('='.repeat(70));
    this.logger.info(`Total Spirits: ${stats.total}`);
    this.logger.info(`Captured: ${stats.captured} (${stats.completionPercentage.toFixed(1)}%)`);
    this.logger.info(`Uncaptured: ${stats.uncaptured}`);
    this.logger.info(`Favorites: ${stats.favorites}`);
    this.logger.info('');
    this.logger.info(`Average Level: ${stats.averageLevel.toFixed(1)}`);
    this.logger.info(`Average Sync: ${stats.averageSync.toFixed(1)}%`);
    this.logger.info(`Highest Level: ${stats.highestLevel}`);
    this.logger.info(`Highest Sync: ${stats.highestSync}%`);
    this.logger.info('');
    this.logger.info(`Unique Types: ${stats.totalTypes}`);
    this.logger.info(`Unique Rarities: ${stats.uniqueRarities}`);
    this.logger.info(`Unique Regions: ${stats.uniqueRegions}`);
    this.logger.info(`Unique Generations: ${stats.uniqueGenerations}`);
    this.logger.info('');
    this.logger.info(`Evolved: ${stats.evolvedCount}`);
    this.logger.info(`Unevolved: ${stats.unevolvedCount}`);
  }

  /**
   * Show completion statistics
   */
  private showCompletion(): void {
    const typeCompletion = this.collection.getCompletionByType();
    const rarityCompletion = this.collection.getCompletionByRarity();

    this.logger.info('='.repeat(70));
    this.logger.info('🎯 Completion Statistics');
    this.logger.info('='.repeat(70));

    this.logger.info('📋 By Type:');
    Object.entries(typeCompletion).forEach(([type, stats]) => {
      if (stats.total > 0) {
        this.logger.info(`  ${type}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });

    this.logger.info('');
    this.logger.info('🏆 By Rarity:');
    Object.entries(rarityCompletion).forEach(([rarity, stats]) => {
      if (stats.total > 0) {
        this.logger.info(`  ${rarity}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });
  }

  /**
   * Show detailed spirit information
   */
  private showSpiritInfo(spiritId?: string): void {
    if (!spiritId) {
      this.logger.info('❌ Usage: info [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      this.logger.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    this.logger.info('='.repeat(70));
    this.logger.info(`👻 ${spirit.spiritName} - Detailed Info`);
    this.logger.info('='.repeat(70));

    this.logger.info(`ID: ${spirit.spiritId}`);
    this.logger.info(`Name: ${spirit.spiritName}`);
    this.logger.info(`Nickname: ${spirit.nickname || 'None'}`);
    this.logger.info(`Description: ${spirit.description}`);
    this.logger.info('');
    this.logger.info(`Type: ${this.getTypeIcon(spirit.primaryType)} ${spirit.getTypeDescription()}`);
    this.logger.info(`Rarity: ${this.getRarityIcon(spirit.rarity)} ${spirit.getRarityDescription()}`);
    this.logger.info(`Level: ${spirit.level} (Exp: ${spirit.experience}/${spirit.maxExperience})`);
    this.logger.info(`Sync Level: ${spirit.syncLevel}% - ${spirit.getSyncDescription()}`);
    this.logger.info(`Evolution Stage: ${spirit.evolutionStage}`);
    this.logger.info('');
    this.logger.info(`Status: ${spirit.isCaptured ? '✅ Captured' : '❌ Uncaptured'}`);
    this.logger.info(`Favorite: ${spirit.isFavorite ? '⭐ Yes' : '☆ No'}`);
    if (spirit.captureDate) {
      this.logger.info(`Captured: ${spirit.captureDate.toLocaleDateString()} (Lv.${spirit.captureLevel})`);
    }
    this.logger.info('');
    this.logger.info(`Region: ${spirit.region}`);
    this.logger.info(`Generation: ${spirit.generation}`);
    this.logger.info(`Habitat: ${spirit.getHabitatDescription()}`);
    this.logger.info('');
    this.logger.info('📊 Stats:');
    this.logger.info(`  HP: ${spirit.stats.hp}`);
    this.logger.info(`  Attack: ${spirit.stats.attack}`);
    this.logger.info(`  Defense: ${spirit.stats.defense}`);
    this.logger.info(`  Sp. Attack: ${spirit.stats.specialAttack}`);
    this.logger.info(`  Sp. Defense: ${spirit.stats.specialDefense}`);
    this.logger.info(`  Speed: ${spirit.stats.speed}`);
    this.logger.info('');
    this.logger.info(`Abilities: ${spirit.abilities.join(', ')}`);
    this.logger.info(`Hidden Abilities: ${spirit.hiddenAbilities.join(', ')}`);
    this.logger.info('');
    this.logger.info(`Height: ${spirit.height}m | Weight: ${spirit.weight}kg`);
    this.logger.info(`Catch Rate: ${spirit.catchRate}`);
    this.logger.info(`Friendship: ${spirit.friendship}`);
    this.logger.info(`Growth Rate: ${spirit.growthRate}`);
    this.logger.info('');
    this.logger.info(`Moves: ${spirit.moves.length}/4`);
    spirit.moves.forEach(move => {
      this.logger.info(`  - ${move.name} (${move.type}, ${move.power} power)`);
    });
  }

  /**
   * Reset to demo data
   */
  private resetDemo(): void {
    this.collection = SpiritUtils.createDemoCollection();
    this.filter.reset();
    this.currentSortOption = SortOption.ALPHABETICAL_ASC;
    this.logger.info('🔄 Reset to demo data');
    this.listSpirits();
  }

  /**
   * Exit application
   */
  private exit(): void {
    this.logger.info('');
    this.logger.info('👋 Thank you for using SpiritsPure CLI!');
    this.rl.close();
    process.exit(0);
  }

  /**
   * Get type icon
   */
  private getTypeIcon(type: SpiritType): string {
    const icons: Record<SpiritType, string> = {
      [SpiritType.NONE]: '❓',
      [SpiritType.FIRE]: '🔥',
      [SpiritType.WATER]: '💧',
      [SpiritType.GRASS]: '🌱',
      [SpiritType.ELECTRIC]: '⚡',
      [SpiritType.PSYCHIC]: '🧠',
      [SpiritType.ICE]: '❄️',
      [SpiritType.DRAGON]: '🐉',
      [SpiritType.DARK]: '🌑',
      [SpiritType.FAIRY]: '🧚',
      [SpiritType.NORMAL]: '⚪',
      [SpiritType.FIGHTING]: '🥊',
      [SpiritType.POISON]: '☠️',
      [SpiritType.GROUND]: '🌍',
      [SpiritType.FLYING]: '🕊️',
      [SpiritType.BUG]: '🐛',
      [SpiritType.ROCK]: '🪨',
      [SpiritType.GHOST]: '👻',
      [SpiritType.STEEL]: '⚙️',
      [SpiritType.LIGHT]: '✨',
      [SpiritType.SHADOW]: '🌑',
      [SpiritType.TIME]: '⏰',
      [SpiritType.SPACE]: '🌌',
      [SpiritType.SOUND]: '🔊',
      [SpiritType.CHAOS]: '🌪️',
      [SpiritType.ORDER]: '⚖️',
      [SpiritType.LIFE]: '🌿',
      [SpiritType.DEATH]: '💀',
      [SpiritType.BALANCE]: '☯️'
    };
    return icons[type] || '❓';
  }

  /**
   * Get rarity icon
   */
  private getRarityIcon(rarity: SpiritRarity): string {
    const icons: Record<SpiritRarity, string> = {
      [SpiritRarity.COMMON]: '⚪',
      [SpiritRarity.UNCOMMON]: '🟢',
      [SpiritRarity.RARE]: '🔵',
      [SpiritRarity.EPIC]: '🟣',
      [SpiritRarity.LEGENDARY]: '🟡',
      [SpiritRarity.MYTHICAL]: '🟠',
      [SpiritRarity.UNIQUE]: '🔴'
    };
    return icons[rarity] || '⚪';
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new SpiritsPureCLI();
  cli.start();
}

export { SpiritsPureCLI };