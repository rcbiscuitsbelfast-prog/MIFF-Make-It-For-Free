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
    console.info('='.repeat(70));
    console.info('👻 SpiritsPure CLI - Spirit Collection Management');
    console.info('='.repeat(70));
    console.info('');
    console.info('Available commands:');
    console.info('  list [filter]     - List spirits with optional filter');
    console.info('  add [name]        - Add new spirit');
    console.info('  remove [id]       - Remove spirit by ID');
    console.info('  search [query]    - Search spirits by name/description');
    console.info('  filter [type]     - Apply filter to spirits');
    console.info('  sort [option]     - Sort spirits');
    console.info('  capture [id]      - Mark spirit as captured');
    console.info('  release [id]      - Mark spirit as uncaptured');
    console.info('  favorite [id]     - Toggle favorite status');
    console.info('  stats             - Show collection statistics');
    console.info('  completion        - Show completion statistics');
    console.info('  info [id]         - Show detailed spirit info');
    console.info('  demo              - Reset to demo data');
    console.info('  help              - Show this help');
    console.info('  exit              - Exit application');
    console.info('');
    console.info(`Current collection: ${this.collection.totalSpirits} spirits`);
    console.info(`Captured: ${this.collection.capturedCount} (${this.collection.completionPercentage.toFixed(1)}%)`);

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
    console.info('👻 SpiritsPure CLI Help');
    console.info('Commands: list, add, remove, search, filter, sort, capture, release, favorite, stats, completion, info, demo, exit');
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

    console.info('='.repeat(70));
    console.info(`👻 Spirits (${spirits.length} shown)`);
    console.info('='.repeat(70));

    if (spirits.length === 0) {
      console.info('No spirits found.');
      return;
    }

    spirits.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const rarityIcon = this.getRarityIcon(spirit.rarity);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      const favoriteIcon = spirit.isFavorite ? '⭐' : '  ';

      console.info(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${rarityIcon}`);
      console.info(`    ${favoriteIcon} ${statusIcon} Lv.${spirit.level} | Sync: ${spirit.syncLevel}% | ${spirit.getTypeDescription()}`);
      console.info(`    ID: ${spirit.spiritId} | ${spirit.getSyncDescription()}`);
      console.info('');
    });

    console.info(`Total: ${this.collection.totalSpirits} | Captured: ${this.collection.capturedCount} | Completion: ${this.collection.completionPercentage.toFixed(1)}%`);
  }

  /**
   * Add new spirit
   */
  private addSpirit(name?: string): void {
    if (!name) {
      console.info('❌ Usage: add [spirit_name]');
      console.info('Example: add "Fire Dragon"');
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
    console.info(`✅ Added ${name} to collection (ID: ${spirit.spiritId})`);
  }

  /**
   * Remove spirit
   */
  private removeSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.info('❌ Usage: remove [spirit_id]');
      return;
    }

    const removed = this.collection.removeSpirit(spiritId);
    if (removed) {
      console.info(`✅ Removed spirit with ID: ${spiritId}`);
    } else {
      console.info(`❌ Spirit not found: ${spiritId}`);
    }
  }

  /**
   * Search spirits
   */
  private searchSpirits(query?: string): void {
    if (!query) {
      console.info('❌ Usage: search [query]');
      console.info('Example: search "dragon"');
      return;
    }

    const results = this.collection.searchSpirits(query);

    console.info(`🔍 Search results for "${query}" (${results.length} found):`);

    if (results.length === 0) {
      console.info('No spirits found.');
      return;
    }

    results.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      console.info(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${statusIcon}`);
      console.info(`    ${spirit.getTypeDescription()} | Lv.${spirit.level} | ID: ${spirit.spiritId}`);
      console.info('');
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
        console.info('🔍 Filter: Captured spirits only');
        break;
      case 'uncaptured':
        this.filter.captured = false;
        console.info('🔍 Filter: Uncaptured spirits only');
        break;
      case 'fire':
        this.filter.type = SpiritType.FIRE;
        console.info('🔍 Filter: Fire-type spirits');
        break;
      case 'water':
        this.filter.type = SpiritType.WATER;
        console.info('🔍 Filter: Water-type spirits');
        break;
      case 'high-sync':
        this.filter.minSync = 50;
        console.info('🔍 Filter: High sync spirits (50%+)');
        break;
      case 'legendary':
        this.filter.rarity = SpiritRarity.LEGENDARY;
        console.info('🔍 Filter: Legendary spirits');
        break;
      case 'evolved':
        this.filter.hasEvolved = true;
        console.info('🔍 Filter: Evolved spirits');
        break;
      case 'favorites':
        this.filter.isFavorite = true;
        console.info('🔍 Filter: Favorite spirits');
        break;
      case 'clear':
        this.filter.reset();
        console.info('🔍 Filter cleared');
        break;
      default:
        console.info('🔍 Available filters: captured, uncaptured, fire, water, high-sync, legendary, evolved, favorites, clear');
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
          console.info('🔄 Available sorts: alpha, sync, rarity, level');
          return;
      }
    }

    this.currentSortOption = sortOption;
    const sortDescription = this.sorter.getSortDescription(sortOption);
    console.info(`🔄 Sorting by: ${sortDescription}`);
    this.listSpirits();
  }

  /**
   * Capture spirit
   */
  private captureSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.info('❌ Usage: capture [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (spirit.isCaptured) {
      console.info(`ℹ️ ${spirit.spiritName} is already captured`);
      return;
    }

    spirit.isCaptured = true;
    spirit.captureDate = new Date();
    spirit.captureLevel = spirit.level;
    spirit.syncLevel = Math.floor(Math.random() * 100); // Random sync level

    console.info(`✅ Captured ${spirit.spiritName}!`);
    console.info(`📊 Sync Level: ${spirit.syncLevel}%`);
    console.info(`📈 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Release spirit
   */
  private releaseSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.info('❌ Usage: release [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!spirit.isCaptured) {
      console.info(`ℹ️ ${spirit.spiritName} is not captured`);
      return;
    }

    spirit.isCaptured = false;
    spirit.captureDate = undefined;
    spirit.captureLocation = undefined;
    spirit.captureLevel = undefined;

    console.info(`✅ Released ${spirit.spiritName} back into the wild`);
    console.info(`📉 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Toggle favorite status
   */
  private toggleFavorite(spiritId?: string): void {
    if (!spiritId) {
      console.info('❌ Usage: favorite [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    spirit.isFavorite = !spirit.isFavorite;
    const status = spirit.isFavorite ? 'added to favorites' : 'removed from favorites';
    console.info(`⭐ ${spirit.spiritName} ${status}`);
  }

  /**
   * Show collection statistics
   */
  private showStatistics(): void {
    const stats = this.collection.getStatistics();

    console.info('='.repeat(70));
    console.info('📊 Collection Statistics');
    console.info('='.repeat(70));
    console.info(`Total Spirits: ${stats.total}`);
    console.info(`Captured: ${stats.captured} (${stats.completionPercentage.toFixed(1)}%)`);
    console.info(`Uncaptured: ${stats.uncaptured}`);
    console.info(`Favorites: ${stats.favorites}`);
    console.info('');
    console.info(`Average Level: ${stats.averageLevel.toFixed(1)}`);
    console.info(`Average Sync: ${stats.averageSync.toFixed(1)}%`);
    console.info(`Highest Level: ${stats.highestLevel}`);
    console.info(`Highest Sync: ${stats.highestSync}%`);
    console.info('');
    console.info(`Unique Types: ${stats.totalTypes}`);
    console.info(`Unique Rarities: ${stats.uniqueRarities}`);
    console.info(`Unique Regions: ${stats.uniqueRegions}`);
    console.info(`Unique Generations: ${stats.uniqueGenerations}`);
    console.info('');
    console.info(`Evolved: ${stats.evolvedCount}`);
    console.info(`Unevolved: ${stats.unevolvedCount}`);
  }

  /**
   * Show completion statistics
   */
  private showCompletion(): void {
    const typeCompletion = this.collection.getCompletionByType();
    const rarityCompletion = this.collection.getCompletionByRarity();

    console.info('='.repeat(70));
    console.info('🎯 Completion Statistics');
    console.info('='.repeat(70));

    console.info('📋 By Type:');
    Object.entries(typeCompletion).forEach(([type, stats]) => {
      if (stats.total > 0) {
        console.info(`  ${type}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });

    console.info('');
    console.info('🏆 By Rarity:');
    Object.entries(rarityCompletion).forEach(([rarity, stats]) => {
      if (stats.total > 0) {
        console.info(`  ${rarity}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });
  }

  /**
   * Show detailed spirit information
   */
  private showSpiritInfo(spiritId?: string): void {
    if (!spiritId) {
      console.info('❌ Usage: info [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.info(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    console.info('='.repeat(70));
    console.info(`👻 ${spirit.spiritName} - Detailed Info`);
    console.info('='.repeat(70));

    console.info(`ID: ${spirit.spiritId}`);
    console.info(`Name: ${spirit.spiritName}`);
    console.info(`Nickname: ${spirit.nickname || 'None'}`);
    console.info(`Description: ${spirit.description}`);
    console.info('');
    console.info(`Type: ${this.getTypeIcon(spirit.primaryType)} ${spirit.getTypeDescription()}`);
    console.info(`Rarity: ${this.getRarityIcon(spirit.rarity)} ${spirit.getRarityDescription()}`);
    console.info(`Level: ${spirit.level} (Exp: ${spirit.experience}/${spirit.maxExperience})`);
    console.info(`Sync Level: ${spirit.syncLevel}% - ${spirit.getSyncDescription()}`);
    console.info(`Evolution Stage: ${spirit.evolutionStage}`);
    console.info('');
    console.info(`Status: ${spirit.isCaptured ? '✅ Captured' : '❌ Uncaptured'}`);
    console.info(`Favorite: ${spirit.isFavorite ? '⭐ Yes' : '☆ No'}`);
    if (spirit.captureDate) {
      console.info(`Captured: ${spirit.captureDate.toLocaleDateString()} (Lv.${spirit.captureLevel})`);
    }
    console.info('');
    console.info(`Region: ${spirit.region}`);
    console.info(`Generation: ${spirit.generation}`);
    console.info(`Habitat: ${spirit.getHabitatDescription()}`);
    console.info('');
    console.info('📊 Stats:');
    console.info(`  HP: ${spirit.stats.hp}`);
    console.info(`  Attack: ${spirit.stats.attack}`);
    console.info(`  Defense: ${spirit.stats.defense}`);
    console.info(`  Sp. Attack: ${spirit.stats.specialAttack}`);
    console.info(`  Sp. Defense: ${spirit.stats.specialDefense}`);
    console.info(`  Speed: ${spirit.stats.speed}`);
    console.info('');
    console.info(`Abilities: ${spirit.abilities.join(', ')}`);
    console.info(`Hidden Abilities: ${spirit.hiddenAbilities.join(', ')}`);
    console.info('');
    console.info(`Height: ${spirit.height}m | Weight: ${spirit.weight}kg`);
    console.info(`Catch Rate: ${spirit.catchRate}`);
    console.info(`Friendship: ${spirit.friendship}`);
    console.info(`Growth Rate: ${spirit.growthRate}`);
    console.info('');
    console.info(`Moves: ${spirit.moves.length}/4`);
    spirit.moves.forEach(move => {
      console.info(`  - ${move.name} (${move.type}, ${move.power} power)`);
    });
  }

  /**
   * Reset to demo data
   */
  private resetDemo(): void {
    this.collection = SpiritUtils.createDemoCollection();
    this.filter.reset();
    this.currentSortOption = SortOption.ALPHABETICAL_ASC;
    console.info('🔄 Reset to demo data');
    this.listSpirits();
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.info('');
    console.info('👋 Thank you for using SpiritsPure CLI!');
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