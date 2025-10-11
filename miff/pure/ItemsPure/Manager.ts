/**
 * ItemsPure Manager - Advanced Item Management System
 *
 * Comprehensive item management with:
 * - Item lifecycle management
 * - Inventory operations
 * - Item crafting and enhancement
 * - Economy and trading systems
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { 
  Item, 
  ItemType, 
  ItemRarity, 
  ItemEffectType, 
  UsageStatus,
  ItemInstance,
  IPlayerContext,
  ISpiritInstance,
  IItemEffectContext,
  UsageResult,
  ItemEffect,
  ItemsManager,
  ItemUsageManager,
  ItemUtils
} from './index.js';

export interface ItemManagerConfig {
  enableCaching: boolean;
  enableTrading: boolean;
  enableCrafting: boolean;
  enableEnhancement: boolean;
  maxInventorySize: number;
  enableItemHistory: boolean;
  enablePerformanceMetrics: boolean;
}

export interface ItemTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'trade' | 'craft' | 'enhance';
  itemId: string;
  quantity: number;
  cost: number;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface ItemCraftingRecipe {
  id: string;
  resultItemId: string;
  resultQuantity: number;
  requiredItems: Array<{ itemId: string; quantity: number }>;
  requiredFlags: string[];
  difficulty: number;
  successRate: number;
  experience: number;
}

export interface ItemEnhancement {
  id: string;
  itemId: string;
  enhancementType: 'durability' | 'effect' | 'rarity' | 'custom';
  enhancementValue: number;
  cost: number;
  successRate: number;
  maxLevel: number;
}

export class ItemsManagerAdvanced extends ItemsManager {
  private config: ItemManagerConfig;
  private tradingEnabled: boolean;
  private craftingRecipes: Map<string, ItemCraftingRecipe>;
  private enhancements: Map<string, ItemEnhancement>;
  private transactions: ItemTransaction[];
  private performanceMetrics: {
    totalOperations: number;
    averageResponseTime: number;
    cacheHitRate: number;
    lastOptimization: number;
  };

  constructor(config: Partial<ItemManagerConfig> = {}) {
    super();
    
    this.config = {
      enableCaching: true,
      enableTrading: true,
      enableCrafting: true,
      enableEnhancement: true,
      maxInventorySize: 1000,
      enableItemHistory: true,
      enablePerformanceMetrics: true,
      ...config
    };

    this.tradingEnabled = this.config.enableTrading;
    this.craftingRecipes = new Map();
    this.enhancements = new Map();
    this.transactions = [];
    this.performanceMetrics = {
      totalOperations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      lastOptimization: Date.now()
    };

    this.initializeDefaultRecipes();
    this.initializeDefaultEnhancements();
  }

  /**
   * Advanced item creation with validation and optimization
   */
  createAdvancedItem(
    itemId: string,
    name: string,
    type: ItemType,
    effect: ItemEffect,
    options: {
      rarity?: ItemRarity;
      value?: number;
      stackable?: boolean;
      maxStack?: number;
      targetRule?: string;
      properties?: Record<string, any>;
      metadata?: Record<string, any>;
    } = {}
  ): Item {
    const startTime = performance.now();
    
    const item = new Item(itemId, name, type, effect, options.targetRule);
    
    // Apply options
    if (options.rarity) item.rarity = options.rarity;
    if (options.value !== undefined) item.value = options.value;
    if (options.stackable !== undefined) item.stackable = options.stackable;
    if (options.maxStack !== undefined) item.maxStack = options.maxStack;
    if (options.properties) item.properties = { ...item.properties, ...options.properties };
    if (options.metadata) item.metadata = { ...item.metadata, ...options.metadata };

    // Validate item
    const validationErrors = item.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Item validation failed: ${validationErrors.join(', ')}`);
    }

    this.addItem(item);
    this.updatePerformanceMetrics(performance.now() - startTime);
    
    return item;
  }

  /**
   * Bulk item operations with optimization
   */
  createBulkItems(itemDefinitions: Array<{
    itemId: string;
    name: string;
    type: ItemType;
    effect: ItemEffect;
    options?: any;
  }>): { success: Item[]; errors: Array<{ itemId: string; error: string }> } {
    const startTime = performance.now();
    const success: Item[] = [];
    const errors: Array<{ itemId: string; error: string }> = [];

    for (const definition of itemDefinitions) {
      try {
        const item = this.createAdvancedItem(
          definition.itemId,
          definition.name,
          definition.type,
          definition.effect,
          definition.options
        );
        success.push(item);
      } catch (error) {
        errors.push({
          itemId: definition.itemId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.updatePerformanceMetrics(performance.now() - startTime);
    return { success, errors };
  }

  /**
   * Advanced item search with filtering and sorting
   */
  searchItemsAdvanced(query: {
    text?: string;
    type?: ItemType;
    rarity?: ItemRarity;
    effectType?: ItemEffectType;
    minValue?: number;
    maxValue?: number;
    stackable?: boolean;
    sortBy?: 'name' | 'type' | 'rarity' | 'value' | 'effectType';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): Item[] {
    const startTime = performance.now();
    let results = Array.from(this['items'].values());

    // Apply filters
    if (query.text) {
      const lowerQuery = query.text.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.itemID.toLowerCase().includes(lowerQuery)
      );
    }

    if (query.type) {
      results = results.filter(item => item.type === query.type);
    }

    if (query.rarity) {
      results = results.filter(item => item.rarity === query.rarity);
    }

    if (query.effectType) {
      results = results.filter(item => item.effect.effectType === query.effectType);
    }

    if (query.minValue !== undefined) {
      results = results.filter(item => item.value >= query.minValue!);
    }

    if (query.maxValue !== undefined) {
      results = results.filter(item => item.value <= query.maxValue!);
    }

    if (query.stackable !== undefined) {
      results = results.filter(item => item.stackable === query.stackable);
    }

    // Apply sorting
    if (query.sortBy) {
      results = ItemUtils.sortItems(results, query.sortBy);
      if (query.sortOrder === 'desc') {
        results.reverse();
      }
    }

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    this.updatePerformanceMetrics(performance.now() - startTime);
    return results;
  }

  /**
   * Item crafting system
   */
  canCraft(recipeId: string, playerContext: IPlayerContext): { canCraft: boolean; missingItems: string[]; missingFlags: string[] } {
    const recipe = this.craftingRecipes.get(recipeId);
    if (!recipe) {
      return { canCraft: false, missingItems: [], missingFlags: [] };
    }

    const missingItems: string[] = [];
    const missingFlags: string[] = [];

    // Check required items
    for (const required of recipe.requiredItems) {
      const available = playerContext.inventory[required.itemId] || 0;
      if (available < required.quantity) {
        missingItems.push(`${required.itemId} (need ${required.quantity}, have ${available})`);
      }
    }

    // Check required flags
    for (const flag of recipe.requiredFlags) {
      if (!playerContext.flags[flag]) {
        missingFlags.push(flag);
      }
    }

    return {
      canCraft: missingItems.length === 0 && missingFlags.length === 0,
      missingItems,
      missingFlags
    };
  }

  /**
   * Craft an item using a recipe
   */
  craftItem(recipeId: string, playerContext: IPlayerContext): { success: boolean; item?: Item; message: string } {
    const recipe = this.craftingRecipes.get(recipeId);
    if (!recipe) {
      return { success: false, message: 'Recipe not found' };
    }

    const canCraftResult = this.canCraft(recipeId, playerContext);
    if (!canCraftResult.canCraft) {
      return {
        success: false,
        message: `Cannot craft: ${[...canCraftResult.missingItems, ...canCraftResult.missingFlags].join(', ')}`
      };
    }

    // Check success rate
    const successRoll = Math.random();
    if (successRoll > recipe.successRate) {
      return { success: false, message: 'Crafting failed' };
    }

    // Consume required items
    for (const required of recipe.requiredItems) {
      playerContext.inventory[required.itemId] -= required.quantity;
    }

    // Create result item
    const resultItem = this.getItem(recipe.resultItemId);
    if (!resultItem) {
      return { success: false, message: 'Result item not found' };
    }

    // Add to inventory
    const currentQuantity = playerContext.inventory[recipe.resultItemId] || 0;
    playerContext.inventory[recipe.resultItemId] = currentQuantity + recipe.resultQuantity;

    // Record transaction
    this.recordTransaction({
      id: `craft_${Date.now()}`,
      type: 'craft',
      itemId: recipe.resultItemId,
      quantity: recipe.resultQuantity,
      cost: 0,
      timestamp: Date.now(),
      metadata: { recipeId, experience: recipe.experience }
    });

    return { success: true, item: resultItem, message: `Successfully crafted ${recipe.resultQuantity}x ${resultItem.name}` };
  }

  /**
   * Item enhancement system
   */
  canEnhance(itemId: string, enhancementId: string, playerContext: IPlayerContext): { canEnhance: boolean; reason?: string } {
    const item = this.getItem(itemId);
    const enhancement = this.enhancements.get(enhancementId);
    
    if (!item) {
      return { canEnhance: false, reason: 'Item not found' };
    }

    if (!enhancement) {
      return { canEnhance: false, reason: 'Enhancement not found' };
    }

    if (enhancement.itemId !== itemId) {
      return { canEnhance: false, reason: 'Enhancement not compatible with item' };
    }

    if (playerContext.inventory[itemId] < 1) {
      return { canEnhance: false, reason: 'Item not in inventory' };
    }

    return { canEnhance: true };
  }

  /**
   * Enhance an item
   */
  enhanceItem(itemId: string, enhancementId: string, playerContext: IPlayerContext): { success: boolean; message: string; enhancedItem?: Item } {
    const canEnhanceResult = this.canEnhance(itemId, enhancementId, playerContext);
    if (!canEnhanceResult.canEnhance) {
      return { success: false, message: canEnhanceResult.reason || 'Cannot enhance item' };
    }

    const enhancement = this.enhancements.get(enhancementId)!;
    const item = this.getItem(itemId)!;

    // Check success rate
    const successRoll = Math.random();
    if (successRoll > enhancement.successRate) {
      return { success: false, message: 'Enhancement failed' };
    }

    // Create enhanced item
    const enhancedItem = item.clone();
    
    switch (enhancement.enhancementType) {
      case 'durability':
        enhancedItem.properties.durability = (enhancedItem.properties.durability || 100) + enhancement.enhancementValue;
        break;
      case 'effect':
        enhancedItem.effect.amount += enhancement.enhancementValue;
        break;
      case 'rarity':
        const rarities = Object.values(ItemRarity);
        const currentIndex = rarities.indexOf(enhancedItem.rarity);
        if (currentIndex < rarities.length - 1) {
          enhancedItem.rarity = rarities[currentIndex + 1];
        }
        break;
      case 'custom':
        enhancedItem.properties[enhancementId] = enhancement.enhancementValue;
        break;
    }

    // Update inventory
    playerContext.inventory[itemId]--;
    const enhancedItemId = `${itemId}_enhanced_${Date.now()}`;
    enhancedItem.itemID = enhancedItemId;
    this.addItem(enhancedItem);
    playerContext.inventory[enhancedItemId] = 1;

    // Record transaction
    this.recordTransaction({
      id: `enhance_${Date.now()}`,
      type: 'enhance',
      itemId: enhancedItemId,
      quantity: 1,
      cost: enhancement.cost,
      timestamp: Date.now(),
      metadata: { enhancementId, originalItemId: itemId }
    });

    return { success: true, message: `Successfully enhanced ${item.name}`, enhancedItem };
  }

  /**
   * Trading system
   */
  canTrade(itemId: string, quantity: number, playerContext: IPlayerContext): { canTrade: boolean; reason?: string } {
    if (!this.tradingEnabled) {
      return { canTrade: false, reason: 'Trading is disabled' };
    }

    const item = this.getItem(itemId);
    if (!item) {
      return { canTrade: false, reason: 'Item not found' };
    }

    const available = playerContext.inventory[itemId] || 0;
    if (available < quantity) {
      return { canTrade: false, reason: 'Insufficient quantity' };
    }

    return { canTrade: true };
  }

  /**
   * Trade items between players
   */
  tradeItems(
    fromPlayer: IPlayerContext,
    toPlayer: IPlayerContext,
    tradeItems: Array<{ itemId: string; quantity: number }>,
    payment: number
  ): { success: boolean; message: string } {
    if (!this.tradingEnabled) {
      return { success: false, message: 'Trading is disabled' };
    }

    // Validate trade
    for (const tradeItem of tradeItems) {
      const canTradeResult = this.canTrade(tradeItem.itemId, tradeItem.quantity, fromPlayer);
      if (!canTradeResult.canTrade) {
        return { success: false, message: canTradeResult.reason || 'Invalid trade' };
      }
    }

    // Execute trade
    for (const tradeItem of tradeItems) {
      fromPlayer.inventory[tradeItem.itemId] -= tradeItem.quantity;
      toPlayer.inventory[tradeItem.itemId] = (toPlayer.inventory[tradeItem.itemId] || 0) + tradeItem.quantity;
    }

    // Record transactions
    for (const tradeItem of tradeItems) {
      this.recordTransaction({
        id: `trade_${Date.now()}`,
        type: 'trade',
        itemId: tradeItem.itemId,
        quantity: tradeItem.quantity,
        cost: payment,
        timestamp: Date.now(),
        metadata: { fromPlayer: fromPlayer.playerId, toPlayer: toPlayer.playerId }
      });
    }

    return { success: true, message: 'Trade completed successfully' };
  }

  /**
   * Get item statistics and analytics
   */
  getAdvancedStats(): {
    basic: ReturnType<ItemsManager['getStats']>;
    performance: typeof this.performanceMetrics;
    trading: {
      totalTransactions: number;
      totalValue: number;
      mostTradedItem: string;
      averageTransactionValue: number;
    };
    crafting: {
      totalRecipes: number;
      totalCrafts: number;
      successRate: number;
    };
    enhancement: {
      totalEnhancements: number;
      totalEnhancementAttempts: number;
      successRate: number;
    };
  } {
    const basic = this.getStats();
    const tradingTransactions = this.transactions.filter(t => t.type === 'trade');
    const craftTransactions = this.transactions.filter(t => t.type === 'craft');
    const enhanceTransactions = this.transactions.filter(t => t.type === 'enhance');

    return {
      basic,
      performance: this.performanceMetrics,
      trading: {
        totalTransactions: tradingTransactions.length,
        totalValue: tradingTransactions.reduce((sum, t) => sum + t.cost, 0),
        mostTradedItem: this.getMostTradedItem(),
        averageTransactionValue: tradingTransactions.length > 0 
          ? tradingTransactions.reduce((sum, t) => sum + t.cost, 0) / tradingTransactions.length 
          : 0
      },
      crafting: {
        totalRecipes: this.craftingRecipes.size,
        totalCrafts: craftTransactions.length,
        successRate: this.calculateCraftingSuccessRate()
      },
      enhancement: {
        totalEnhancements: this.enhancements.size,
        totalEnhancements: enhanceTransactions.length,
        successRate: this.calculateEnhancementSuccessRate()
      }
    };
  }

  /**
   * Initialize default crafting recipes
   */
  private initializeDefaultRecipes(): void {
    // Health Potion recipe
    this.craftingRecipes.set('health_potion', {
      id: 'health_potion',
      resultItemId: 'health_potion',
      resultQuantity: 1,
      requiredItems: [
        { itemId: 'herb', quantity: 2 },
        { itemId: 'water', quantity: 1 }
      ],
      requiredFlags: [],
      difficulty: 1,
      successRate: 0.8,
      experience: 10
    });

    // Revive recipe
    this.craftingRecipes.set('revive', {
      id: 'revive',
      resultItemId: 'revive',
      resultQuantity: 1,
      requiredItems: [
        { itemId: 'rare_herb', quantity: 1 },
        { itemId: 'magic_water', quantity: 1 },
        { itemId: 'crystal', quantity: 1 }
      ],
      requiredFlags: ['advanced_crafting'],
      difficulty: 3,
      successRate: 0.6,
      experience: 25
    });
  }

  /**
   * Initialize default enhancements
   */
  private initializeDefaultEnhancements(): void {
    // Durability enhancement
    this.enhancements.set('durability_boost', {
      id: 'durability_boost',
      itemId: 'weapon',
      enhancementType: 'durability',
      enhancementValue: 50,
      cost: 100,
      successRate: 0.7,
      maxLevel: 5
    });

    // Effect enhancement
    this.enhancements.set('effect_boost', {
      id: 'effect_boost',
      itemId: 'health_potion',
      enhancementType: 'effect',
      enhancementValue: 25,
      cost: 50,
      successRate: 0.8,
      maxLevel: 3
    });
  }

  /**
   * Record transaction for analytics
   */
  private recordTransaction(transaction: ItemTransaction): void {
    if (this.config.enableItemHistory) {
      this.transactions.push(transaction);
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(responseTime: number): void {
    if (this.config.enablePerformanceMetrics) {
      this.performanceMetrics.totalOperations++;
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalOperations - 1) + responseTime) 
        / this.performanceMetrics.totalOperations;
    }
  }

  /**
   * Get most traded item
   */
  private getMostTradedItem(): string {
    const tradeCounts = new Map<string, number>();
    const tradeTransactions = this.transactions.filter(t => t.type === 'trade');
    
    for (const transaction of tradeTransactions) {
      const count = tradeCounts.get(transaction.itemId) || 0;
      tradeCounts.set(transaction.itemId, count + transaction.quantity);
    }

    let mostTraded = '';
    let maxCount = 0;
    for (const [itemId, count] of tradeCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostTraded = itemId;
      }
    }

    return mostTraded;
  }

  /**
   * Calculate crafting success rate
   */
  private calculateCraftingSuccessRate(): number {
    const craftTransactions = this.transactions.filter(t => t.type === 'craft');
    if (craftTransactions.length === 0) return 0;

    const successfulCrafts = craftTransactions.filter(t => t.metadata.success !== false).length;
    return successfulCrafts / craftTransactions.length;
  }

  /**
   * Calculate enhancement success rate
   */
  private calculateEnhancementSuccessRate(): number {
    const enhanceTransactions = this.transactions.filter(t => t.type === 'enhance');
    if (enhanceTransactions.length === 0) return 0;

    const successfulEnhancements = enhanceTransactions.filter(t => t.metadata.success !== false).length;
    return successfulEnhancements / enhanceTransactions.length;
  }
}

// Export default instance
export const defaultItemsManagerAdvanced = new ItemsManagerAdvanced();
export { ItemsManagerAdvanced as default };