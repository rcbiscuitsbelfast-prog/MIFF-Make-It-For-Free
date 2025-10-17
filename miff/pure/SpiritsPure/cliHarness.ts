#!/usr/bin/env node

/**
 * SpiritsPure CLI Harness
 *
 * Interactive command-line interface for testing and demonstrating
 * the SpiritsPure spirit collection management system.
 */

import * as readline from 'readline';
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
  private rl: readline.Interface;
  private collection: SpiritCollection;
  private filter: SpiritFilter;
  private sorter: SpiritSorter;
  private currentSortOption: SortOption = SortOption.ALPHABETICAL_ASC;

  constructor() {
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
    console.log('='.repeat(70));
    console.log('👻 SpiritsPure CLI - Spirit Collection Management');
    console.log('='.repeat(70));
    console.log('');
    console.log('Available commands:');
    console.log('  list [filter]     - List spirits with optional filter');
    console.log('  add [name]        - Add new spirit');
    console.log('  remove [id]       - Remove spirit by ID');
    console.log('  search [query]    - Search spirits by name/description');
    console.log('  filter [type]     - Apply filter to spirits');
    console.log('  sort [option]     - Sort spirits');
    console.log('  capture [id]      - Mark spirit as captured');
    console.log('  release [id]      - Mark spirit as uncaptured');
    console.log('  favorite [id]     - Toggle favorite status');
    console.log('  stats             - Show collection statistics');
    console.log('  completion        - Show completion statistics');
    console.log('  info [id]         - Show detailed spirit info');
    console.log('  demo              - Reset to demo data');
    console.log('  help              - Show this help');
    console.log('  exit              - Exit application');
    console.log('');
    console.log(`Current collection: ${this.collection.totalSpirits} spirits`);
    console.log(`Captured: ${this.collection.capturedCount} (${this.collection.completionPercentage.toFixed(1)}%)`);

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
    const command = parts[0!].toLowerCase();
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'help':
        case 'h':
          this.showHelp();
          break;
        case 'list':
        case 'l':
          this.listSpirits(args[0!]);
          break;
        case 'add':
        case 'a':
          this.addSpirit(args[0!]);
          break;
        case 'remove':
        case 'r':
          this.removeSpirit(args[0!]);
          break;
        case 'search':
        case 's':
          this.searchSpirits(args[0!]);
          break;
        case 'filter':
        case 'f':
          this.applyFilter(args);
          break;
        case 'sort':
          this.applySort(args[0!]);
          break;
        case 'capture':
        case 'c':
          this.captureSpirit(args[0!]);
          break;
        case 'release':
          this.releaseSpirit(args[0!]);
          break;
        case 'favorite':
        case 'fav':
          this.toggleFavorite(args[0!]);
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
          this.showSpiritInfo(args[0!]);
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
    console.log('👻 SpiritsPure CLI Help');
    console.log('Commands: list, add, remove, search, filter, sort, capture, release, favorite, stats, completion, info, demo, exit');
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

    console.log('='.repeat(70));
    console.log(`👻 Spirits (${spirits.length} shown)`);
    console.log('='.repeat(70));

    if (spirits.length === 0) {
      console.log('No spirits found.');
      return;
    }

    spirits.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const rarityIcon = this.getRarityIcon(spirit.rarity);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      const favoriteIcon = spirit.isFavorite ? '⭐' : '  ';

      console.log(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${rarityIcon}`);
      console.log(`    ${favoriteIcon} ${statusIcon} Lv.${spirit.level} | Sync: ${spirit.syncLevel}% | ${spirit.getTypeDescription()}`);
      console.log(`    ID: ${spirit.spiritId} | ${spirit.getSyncDescription()}`);
      console.log('');
    });

    console.log(`Total: ${this.collection.totalSpirits} | Captured: ${this.collection.capturedCount} | Completion: ${this.collection.completionPercentage.toFixed(1)}%`);
  }

  /**
   * Add new spirit
   */
  private addSpirit(name?: string): void {
    if (!name) {
      console.log('❌ Usage: add [spirit_name]');
      console.log('Example: add "Fire Dragon"');
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
    console.log(`✅ Added ${name} to collection (ID: ${spirit.spiritId})`);
  }

  /**
   * Remove spirit
   */
  private removeSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.log('❌ Usage: remove [spirit_id]');
      return;
    }

    const removed = this.collection.removeSpirit(spiritId);
    if (removed) {
      console.log(`✅ Removed spirit with ID: ${spiritId}`);
    } else {
      console.log(`❌ Spirit not found: ${spiritId}`);
    }
  }

  /**
   * Search spirits
   */
  private searchSpirits(query?: string): void {
    if (!query) {
      console.log('❌ Usage: search [query]');
      console.log('Example: search "dragon"');
      return;
    }

    const results = this.collection.searchSpirits(query);

    console.log(`🔍 Search results for "${query}" (${results.length} found):`);

    if (results.length === 0) {
      console.log('No spirits found.');
      return;
    }

    results.forEach((spirit, index) => {
      const typeIcon = this.getTypeIcon(spirit.primaryType);
      const statusIcon = spirit.isCaptured ? '✅' : '❌';
      console.log(`${index + 1}. ${typeIcon} ${spirit.spiritName} ${statusIcon}`);
      console.log(`    ${spirit.getTypeDescription()} | Lv.${spirit.level} | ID: ${spirit.spiritId}`);
      console.log('');
    });
  }

  /**
   * Apply filter
   */
  private applyFilter(args: string[]): void {
    const filterType = args[0!]?.toLowerCase();

    this.filter.reset();

    switch (filterType) {
      case 'captured':
        this.filter.captured = true;
        console.log('🔍 Filter: Captured spirits only');
        break;
      case 'uncaptured':
        this.filter.captured = false;
        console.log('🔍 Filter: Uncaptured spirits only');
        break;
      case 'fire':
        this.filter.type = SpiritType.FIRE;
        console.log('🔍 Filter: Fire-type spirits');
        break;
      case 'water':
        this.filter.type = SpiritType.WATER;
        console.log('🔍 Filter: Water-type spirits');
        break;
      case 'high-sync':
        this.filter.minSync = 50;
        console.log('🔍 Filter: High sync spirits (50%+)');
        break;
      case 'legendary':
        this.filter.rarity = SpiritRarity.LEGENDARY;
        console.log('🔍 Filter: Legendary spirits');
        break;
      case 'evolved':
        this.filter.hasEvolved = true;
        console.log('🔍 Filter: Evolved spirits');
        break;
      case 'favorites':
        this.filter.isFavorite = true;
        console.log('🔍 Filter: Favorite spirits');
        break;
      case 'clear':
        this.filter.reset();
        console.log('🔍 Filter cleared');
        break;
      default:
        console.log('🔍 Available filters: captured, uncaptured, fire, water, high-sync, legendary, evolved, favorites, clear');
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
          console.log('🔄 Available sorts: alpha, sync, rarity, level');
          return;
      }
    }

    this.currentSortOption = sortOption;
    const sortDescription = this.sorter.getSortDescription(sortOption);
    console.log(`🔄 Sorting by: ${sortDescription}`);
    this.listSpirits();
  }

  /**
   * Capture spirit
   */
  private captureSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.log('❌ Usage: capture [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (spirit.isCaptured) {
      console.log(`ℹ️ ${spirit.spiritName} is already captured`);
      return;
    }

    spirit.isCaptured = true;
    spirit.captureDate = new Date();
    spirit.captureLevel = spirit.level;
    spirit.syncLevel = Math.floor(Math.random() * 100); // Random sync level

    console.log(`✅ Captured ${spirit.spiritName}!`);
    console.log(`📊 Sync Level: ${spirit.syncLevel}%`);
    console.log(`📈 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Release spirit
   */
  private releaseSpirit(spiritId?: string): void {
    if (!spiritId) {
      console.log('❌ Usage: release [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    if (!spirit.isCaptured) {
      console.log(`ℹ️ ${spirit.spiritName} is not captured`);
      return;
    }

    spirit.isCaptured = false;
    spirit.captureDate = undefined;
    spirit.captureLocation = undefined;
    spirit.captureLevel = undefined;

    console.log(`✅ Released ${spirit.spiritName} back into the wild`);
    console.log(`📉 Collection: ${this.collection.capturedCount}/${this.collection.totalSpirits} captured (${this.collection.completionPercentage.toFixed(1)}%)`);
  }

  /**
   * Toggle favorite status
   */
  private toggleFavorite(spiritId?: string): void {
    if (!spiritId) {
      console.log('❌ Usage: favorite [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    spirit.isFavorite = !spirit.isFavorite;
    const status = spirit.isFavorite ? 'added to favorites' : 'removed from favorites';
    console.log(`⭐ ${spirit.spiritName} ${status}`);
  }

  /**
   * Show collection statistics
   */
  private showStatistics(): void {
    const stats = this.collection.getStatistics();

    console.log('='.repeat(70));
    console.log('📊 Collection Statistics');
    console.log('='.repeat(70));
    console.log(`Total Spirits: ${stats.total}`);
    console.log(`Captured: ${stats.captured} (${stats.completionPercentage.toFixed(1)}%)`);
    console.log(`Uncaptured: ${stats.uncaptured}`);
    console.log(`Favorites: ${stats.favorites}`);
    console.log('');
    console.log(`Average Level: ${stats.averageLevel.toFixed(1)}`);
    console.log(`Average Sync: ${stats.averageSync.toFixed(1)}%`);
    console.log(`Highest Level: ${stats.highestLevel}`);
    console.log(`Highest Sync: ${stats.highestSync}%`);
    console.log('');
    console.log(`Unique Types: ${stats.totalTypes}`);
    console.log(`Unique Rarities: ${stats.uniqueRarities}`);
    console.log(`Unique Regions: ${stats.uniqueRegions}`);
    console.log(`Unique Generations: ${stats.uniqueGenerations}`);
    console.log('');
    console.log(`Evolved: ${stats.evolvedCount}`);
    console.log(`Unevolved: ${stats.unevolvedCount}`);
  }

  /**
   * Show completion statistics
   */
  private showCompletion(): void {
    const typeCompletion = this.collection.getCompletionByType();
    const rarityCompletion = this.collection.getCompletionByRarity();

    console.log('='.repeat(70));
    console.log('🎯 Completion Statistics');
    console.log('='.repeat(70));

    console.log('📋 By Type:');
    Object.entries(typeCompletion).forEach(([type, stats]) => {
      if (stats.total > 0) {
        console.log(`  ${type}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });

    console.log('');
    console.log('🏆 By Rarity:');
    Object.entries(rarityCompletion).forEach(([rarity, stats]) => {
      if (stats.total > 0) {
        console.log(`  ${rarity}: ${stats.captured}/${stats.total} (${stats.percentage.toFixed(1)}%)`);
      }
    });
  }

  /**
   * Show detailed spirit information
   */
  private showSpiritInfo(spiritId?: string): void {
    if (!spiritId) {
      console.log('❌ Usage: info [spirit_id]');
      return;
    }

    const spirit = this.collection.getSpirit(spiritId);
    if (!spirit) {
      console.log(`❌ Spirit not found: ${spiritId}`);
      return;
    }

    console.log('='.repeat(70));
    console.log(`👻 ${spirit.spiritName} - Detailed Info`);
    console.log('='.repeat(70));

    console.log(`ID: ${spirit.spiritId}`);
    console.log(`Name: ${spirit.spiritName}`);
    console.log(`Nickname: ${spirit.nickname || 'None'}`);
    console.log(`Description: ${spirit.description}`);
    console.log('');
    console.log(`Type: ${this.getTypeIcon(spirit.primaryType)} ${spirit.getTypeDescription()}`);
    console.log(`Rarity: ${this.getRarityIcon(spirit.rarity)} ${spirit.getRarityDescription()}`);
    console.log(`Level: ${spirit.level} (Exp: ${spirit.experience}/${spirit.maxExperience})`);
    console.log(`Sync Level: ${spirit.syncLevel}% - ${spirit.getSyncDescription()}`);
    console.log(`Evolution Stage: ${spirit.evolutionStage}`);
    console.log('');
    console.log(`Status: ${spirit.isCaptured ? '✅ Captured' : '❌ Uncaptured'}`);
    console.log(`Favorite: ${spirit.isFavorite ? '⭐ Yes' : '☆ No'}`);
    if (spirit.captureDate) {
      console.log(`Captured: ${spirit.captureDate.toLocaleDateString()} (Lv.${spirit.captureLevel})`);
    }
    console.log('');
    console.log(`Region: ${spirit.region}`);
    console.log(`Generation: ${spirit.generation}`);
    console.log(`Habitat: ${spirit.getHabitatDescription()}`);
    console.log('');
    console.log('📊 Stats:');
    console.log(`  HP: ${spirit.stats.hp}`);
    console.log(`  Attack: ${spirit.stats.attack}`);
    console.log(`  Defense: ${spirit.stats.defense}`);
    console.log(`  Sp. Attack: ${spirit.stats.specialAttack}`);
    console.log(`  Sp. Defense: ${spirit.stats.specialDefense}`);
    console.log(`  Speed: ${spirit.stats.speed}`);
    console.log('');
    console.log(`Abilities: ${spirit.abilities.join(', ')}`);
    console.log(`Hidden Abilities: ${spirit.hiddenAbilities.join(', ')}`);
    console.log('');
    console.log(`Height: ${spirit.height}m | Weight: ${spirit.weight}kg`);
    console.log(`Catch Rate: ${spirit.catchRate}`);
    console.log(`Friendship: ${spirit.friendship}`);
    console.log(`Growth Rate: ${spirit.growthRate}`);
    console.log('');
    console.log(`Moves: ${spirit.moves.length}/4`);
    spirit.moves.forEach((move: any) => {
      console.log(`  - ${move.name} (${move.type}, ${move.power} power)`);
    });
  }

  /**
   * Reset to demo data
   */
  private resetDemo(): void {
    this.collection = SpiritUtils.createDemoCollection();
    this.filter.reset();
    this.currentSortOption = SortOption.ALPHABETICAL_ASC;
    console.log('🔄 Reset to demo data');
    this.listSpirits();
  }

  /**
   * Exit application
   */
  private exit(): void {
    console.log('');
    console.log('👋 Thank you for using SpiritsPure CLI!');
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