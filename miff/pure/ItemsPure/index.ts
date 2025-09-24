/**
 * ItemsPure - Item Management System
 *
 * A comprehensive item management system for handling consumables, key items,
 * equipment, and evolution items with configurable effects and target rules.
 * Supports modular effect system and extensible usage validation.
 *
 * @module ItemsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Item type enumeration
 */
export enum ItemType {
  CONSUMABLE = 'consumable',
  KEY_ITEM = 'key_item',
  EQUIPMENT = 'equipment',
  EVOLUTION_ITEM = 'evolution_item'
}

/**
 * Item effect type enumeration
 */
export enum ItemEffectType {
  NONE = 'none',
  HEAL = 'heal',
  REVIVE = 'revive',
  BUFF_ATTACK = 'buff_attack',
  BUFF_DEFENSE = 'buff_defense',
  SYNC_BOOST = 'sync_boost',
  EVOLVE = 'evolve',
  UNLOCK_FLAG = 'unlock_flag'
}

/**
 * Usage status enumeration
 */
export enum UsageStatus {
  SUCCESS = 'success',
  INVALID_TARGET = 'invalid_target',
  EFFECT_BLOCKED = 'effect_blocked',
  ALREADY_USED = 'already_used'
}

/**
 * Player context interface (dependency)
 */
export interface IPlayerContext {
  playerId: string;
  inventory: Record<string, number>;
  flags: Record<string, boolean>;
  [key: string]: any; // Allow for additional context
}

/**
 * Spirit instance interface (dependency)
 */
export interface ISpiritInstance {
  id: string;
  name: string;
  isFainted(): boolean;
  currentHP: number;
  maxHP: number;
  syncLevel?: number;
  canEvolve?(): boolean;
  evolve?(evolutionId: string): boolean;
  [key: string]: any;
}

/**
 * Usage result structure
 */
export interface IUsageResult {
  status: UsageStatus;
  message: string;
  isSuccess: boolean;
}

/**
 * Item effect interface
 */
export interface IItemEffect {
  effectType: ItemEffectType;
  amount: number;
  param?: string;
  cooldownSeconds: number;
  maxUses: number;
  apply(context: IPlayerContext, target: ISpiritInstance | null): IUsageResult;
}

/**
 * Item data structure
 */
export interface IItem {
  itemID: string;
  name: string;
  type: ItemType;
  effect: IItemEffect;
  targetRule: string;
  applyEffect(context: IPlayerContext, target: ISpiritInstance | null): IUsageResult;
}

/**
 * Inventory hook interface
 */
export interface IInventoryHook {
  hasItem(itemId: string): boolean;
  consumeItem(itemId: string): boolean;
  addItem(itemId: string, quantity: number): void;
  getItemCount(itemId: string): number;
}

/**
 * Item usage manager interface
 */
export interface IItemUsageManager {
  registerItem(item: IItem): boolean;
  canUseItem(itemId: string, target: ISpiritInstance | null): boolean;
  useItem(itemId: string, target: ISpiritInstance | null): IUsageResult;
  getItem(itemId: string): IItem | null;
  getAllItems(): IItem[];
  clearItems(): void;
}

/**
 * Usage result implementation
 */
export class UsageResult implements IUsageResult {
  public status: UsageStatus;
  public message: string;

  constructor(status: UsageStatus, message: string = '') {
    this.status = status;
    this.message = message;
  }

  get isSuccess(): boolean {
    return this.status === UsageStatus.SUCCESS;
  }

  static ok(message: string = ''): UsageResult {
    return new UsageResult(UsageStatus.SUCCESS, message);
  }

  static fail(status: UsageStatus, message: string): UsageResult {
    return new UsageResult(status, message);
  }

  toString(): string {
    return `${this.status}: ${this.message}`;
  }
}

/**
 * Item effect implementation
 */
export class ItemEffect implements IItemEffect {
  public effectType: ItemEffectType;
  public amount: number;
  public param?: string;
  public cooldownSeconds: number;
  public maxUses: number;

  constructor(
    effectType: ItemEffectType = ItemEffectType.NONE,
    amount: number = 0,
    param?: string,
    cooldownSeconds: number = 0,
    maxUses: number = -1
  ) {
    this.effectType = effectType;
    this.amount = Math.max(0, amount);
    this.param = param;
    this.cooldownSeconds = Math.max(0, cooldownSeconds);
    this.maxUses = maxUses;
  }

  /**
   * Apply effect to target
   */
  apply(context: IPlayerContext, target: ISpiritInstance | null): IUsageResult {
    if (!target) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'No target specified');
    }

    try {
      switch (this.effectType) {
        case ItemEffectType.HEAL:
          return this.applyHeal(target);
        case ItemEffectType.REVIVE:
          return this.applyRevive(target);
        case ItemEffectType.BUFF_ATTACK:
          return UsageResult.ok(`Attack buff applied by ${this.amount} for ${this.param || 'unknown duration'}`);
        case ItemEffectType.BUFF_DEFENSE:
          return UsageResult.ok(`Defense buff applied by ${this.amount} for ${this.param || 'unknown duration'}`);
        case ItemEffectType.SYNC_BOOST:
          return this.applySync(target);
        case ItemEffectType.EVOLVE:
          return this.applyEvolve(target);
        case ItemEffectType.UNLOCK_FLAG:
          return this.applyUnlockFlag(context);
        case ItemEffectType.NONE:
        default:
          return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'No effect configured');
      }
    } catch (error) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, `Effect error: ${error}`);
    }
  }

  /**
   * Apply healing effect
   */
  private applyHeal(target: ISpiritInstance): IUsageResult {
    if (target.isFainted()) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Cannot heal fainted spirit');
    }

    const healAmount = Math.min(this.amount, target.maxHP - target.currentHP);
    if (healAmount <= 0) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'already at full health');
    }

    target.currentHP += healAmount;
    return UsageResult.ok(`Healed ${healAmount} HP`);
  }

  /**
   * Apply revive effect
   */
  private applyRevive(target: ISpiritInstance): IUsageResult {
    if (!target.isFainted()) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target is not fainted');
    }

    const reviveAmount = Math.max(1, Math.floor(target.maxHP * (this.amount / 100))); // Amount is percentage
    target.currentHP = reviveAmount;
    return UsageResult.ok(`Revived with ${reviveAmount} HP`);
  }

  /**
   * Apply sync boost effect
   */
  private applySync(target: ISpiritInstance): IUsageResult {
    if (!target.syncLevel) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Target has no sync level');
    }

    const oldSync = target.syncLevel;
    target.syncLevel = Math.max(0, target.syncLevel + this.amount);
    return UsageResult.ok(`Sync increased from ${oldSync} to ${target.syncLevel}`);
  }

  /**
   * Apply evolution effect
   */
  private applyEvolve(target: ISpiritInstance): IUsageResult {
    if (!target.canEvolve || !target.canEvolve()) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Target cannot evolve');
    }

    if (!this.param) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'No evolution target specified');
    }

    if (target.evolve && target.evolve(this.param)) {
      return UsageResult.ok(`Evolved to ${this.param}`);
    } else {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Evolution failed');
    }
  }

  /**
   * Apply unlock flag effect
   */
  private applyUnlockFlag(context: IPlayerContext): IUsageResult {
    if (!this.param) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'No flag to unlock specified');
    }

    context.flags[this.param] = true;
    return UsageResult.ok(`Unlocked flag: ${this.param}`);
  }

  /**
   * Create a copy of this effect
   */
  clone(): ItemEffect {
    return new ItemEffect(
      this.effectType,
      this.amount,
      this.param,
      this.cooldownSeconds,
      this.maxUses
    );
  }

  /**
   * Validate effect configuration
   */
  validate(): string[] {
    const errors: string[] = [];

    if (this.amount < 0) {
      errors.push('Effect amount cannot be negative');
    }

    if (this.cooldownSeconds < 0) {
      errors.push('Cooldown seconds cannot be negative');
    }

    if (this.maxUses < -1) {
      errors.push('Max uses must be -1 (unlimited) or greater than 0');
    }

    switch (this.effectType) {
      case ItemEffectType.HEAL:
      case ItemEffectType.REVIVE:
        if (this.amount <= 0) {
          errors.push(`${this.effectType.toUpperCase()} effect requires positive amount`);
        }
        break;
      case ItemEffectType.EVOLVE:
      case ItemEffectType.UNLOCK_FLAG:
        if (!this.param || this.param.trim() === '') {
          errors.push(`${this.effectType} effect requires parameter`);
        }
        break;
    }

    return errors;
  }

  /**
   * Get effect summary
   */
  getSummary(): string {
    switch (this.effectType) {
      case ItemEffectType.HEAL:
        return `Heal ${this.amount} HP`;
      case ItemEffectType.REVIVE:
        return `Revive with ${this.amount}% HP`;
      case ItemEffectType.BUFF_ATTACK:
        return `Buff Attack by ${this.amount}`;
      case ItemEffectType.BUFF_DEFENSE:
        return `Buff Defense by ${this.amount}`;
      case ItemEffectType.SYNC_BOOST:
        return `Boost Sync by ${this.amount}`;
      case ItemEffectType.EVOLVE:
        return `Evolve to ${this.param || 'unknown'}`;
      case ItemEffectType.UNLOCK_FLAG:
        return `Unlock ${this.param || 'unknown'}`;
      case ItemEffectType.NONE:
      default:
        return 'No effect';
    }
  }
}

/**
 * Item implementation
 */
export class Item implements IItem {
  public itemID: string;
  public name: string;
  public type: ItemType;
  public effect: ItemEffect;
  public targetRule: string;

  constructor(
    itemID: string = '',
    name: string = '',
    type: ItemType = ItemType.CONSUMABLE,
    effect: ItemEffect = new ItemEffect(),
    targetRule: string = 'any'
  ) {
    this.itemID = itemID;
    this.name = name;
    this.type = type;
    this.effect = effect;
    this.targetRule = targetRule;
  }

  /**
   * Apply effect with target rule validation
   */
  applyEffect(context: IPlayerContext, target: ISpiritInstance | null): IUsageResult {
    // Simple target checks (extend as needed)
    switch (this.targetRule.toLowerCase()) {
      case 'faintedonly':
        if (!target || !target.isFainted()) {
          return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target must be fainted');
        }
        break;
      case 'notfainted':
        if (!target || target.isFainted()) {
          return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target must be conscious');
        }
        break;
      case 'inbattleonly':
        // In real implementation, check if in battle context
        break;
      case 'overworldonly':
        // In real implementation, check if in overworld context
        break;
      case 'any':
      default:
        // Allow any target
        break;
    }

    return this.effect ? this.effect.apply(context, target) : UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'No effect configured');
  }

  /**
   * Check if item can be used on target
   */
  canUseOn(target: ISpiritInstance | null): boolean {
    try {
      // Create a minimal context for validation
      const mockContext: IPlayerContext = {
        playerId: 'test',
        inventory: {},
        flags: {}
      };

      const result = this.applyEffect(mockContext, target);
      return result.isSuccess || result.status === UsageStatus.INVALID_TARGET;
    } catch {
      return false;
    }
  }

  /**
   * Get item description
   */
  getDescription(): string {
    let description = `${this.name} (${this.type})`;

    if (this.effect.effectType !== ItemEffectType.NONE) {
      description += ` - ${this.effect.getSummary()}`;
    }

    if (this.targetRule !== 'any') {
      description += ` [${this.targetRule}]`;
    }

    return description;
  }

  /**
   * Create a copy of this item
   */
  clone(): Item {
    return new Item(
      this.itemID,
      this.name,
      this.type,
      this.effect.clone(),
      this.targetRule
    );
  }

  /**
   * Validate item configuration
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.itemID || this.itemID.trim() === '') {
      errors.push('Item ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Item name cannot be empty');
    }

    const effectErrors = this.effect.validate();
    effectErrors.forEach(error => {
      errors.push(`Effect: ${error}`);
    });

    const validTargetRules = ['any', 'faintedonly', 'notfainted', 'inbattleonly', 'overworldonly'];
    if (!validTargetRules.includes(this.targetRule.toLowerCase())) {
      errors.push('Invalid target rule specified');
    }

    return errors;
  }

  /**
   * Check if item is consumable
   */
  get isConsumable(): boolean {
    return this.type === ItemType.CONSUMABLE;
  }

  /**
   * Check if item is a key item
   */
  get isKeyItem(): boolean {
    return this.type === ItemType.KEY_ITEM;
  }

  /**
   * Check if item is equipment
   */
  get isEquipment(): boolean {
    return this.type === ItemType.EQUIPMENT;
  }

  /**
   * Check if item is an evolution item
   */
  get isEvolutionItem(): boolean {
    return this.type === ItemType.EVOLUTION_ITEM;
  }
}

/**
 * Item usage manager implementation
 */
export class ItemUsageManager implements IItemUsageManager {
  private readonly itemRegistry = new Map<string, Item>();
  private readonly context: IPlayerContext;

  constructor(context: IPlayerContext) {
    if (!context) {
      throw new Error('Player context is required');
    }
    this.context = context;
  }

  /**
   * Register an item
   */
  registerItem(item: Item): boolean {
    if (!item || !item.itemID || item.itemID.trim() === '') {
      console.warn('Invalid item registration: missing or empty item ID');
      return false;
    }

    const errors = item.validate();
    if (errors.length > 0) {
      console.warn(`Invalid item ${item.itemID}:`, errors);
      return false;
    }

    this.itemRegistry.set(item.itemID, item);
    return true;
  }

  /**
   * Check if item can be used
   */
  canUseItem(itemId: string, target: ISpiritInstance | null): boolean {
    const item = this.itemRegistry.get(itemId);
    if (!item) {
      return false;
    }

    try {
      return item.canUseOn(target);
    } catch {
      return false;
    }
  }

  /**
   * Use an item
   */
  useItem(itemId: string, target: ISpiritInstance | null): IUsageResult {
    const item = this.itemRegistry.get(itemId);
    if (!item) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, `Unknown item: ${itemId}`);
    }

    // Check if item exists in inventory (if inventory hook is provided)
    if (this.context.inventory && !this.context.inventory[itemId]) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, `Item not in inventory: ${itemId}`);
    }

    try {
      const result = item.applyEffect(this.context, target);

      // Consume item if successful and it's consumable
      if (result.isSuccess && item.isConsumable && this.context.inventory) {
        this.context.inventory[itemId] = Math.max(0, this.context.inventory[itemId] - 1);
      }

      return result;
    } catch (error) {
      return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, `Item usage error: ${error}`);
    }
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): Item | null {
    return this.itemRegistry.get(itemId) || null;
  }

  /**
   * Get all registered items
   */
  getAllItems(): Item[] {
    return Array.from(this.itemRegistry.values());
  }

  /**
   * Get items by type
   */
  getItemsByType(type: ItemType): Item[] {
    return this.getAllItems().filter(item => item.type === type);
  }

  /**
   * Get items usable on target
   */
  getUsableItems(target: ISpiritInstance | null): Item[] {
    return this.getAllItems().filter(item => this.canUseItem(item.itemID, target));
  }

  /**
   * Search items by name
   */
  searchItems(query: string): Item[] {
    if (!query || query.trim() === '') {
      return this.getAllItems();
    }

    const lowerQuery = query.toLowerCase();
    return this.getAllItems().filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.itemID.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all items
   */
  clearItems(): void {
    this.itemRegistry.clear();
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.itemRegistry.size;
  }

  /**
   * Check if item exists
   */
  hasItem(itemId: string): boolean {
    return this.itemRegistry.has(itemId);
  }

  /**
   * Remove item from registry
   */
  removeItem(itemId: string): boolean {
    return this.itemRegistry.delete(itemId);
  }

  /**
   * Update item in registry
   */
  updateItem(itemId: string, updates: Partial<Item>): boolean {
    const existingItem = this.itemRegistry.get(itemId);
    if (!existingItem) {
      return false;
    }

    // Create updated item
    const updatedItem = new Item(
      updates.itemID || existingItem.itemID,
      updates.name || existingItem.name,
      updates.type || existingItem.type,
      updates.effect || existingItem.effect.clone(),
      updates.targetRule || existingItem.targetRule
    );

    const errors = updatedItem.validate();
    if (errors.length > 0) {
      console.warn(`Invalid item update for ${itemId}:`, errors);
      return false;
    }

    this.itemRegistry.set(itemId, updatedItem);
    return true;
  }
}

/**
 * Utility functions for item operations
 */
export const ItemUtils = {
  /**
   * Create standard healing item
   */
  createHealItem(
    itemId: string,
    name: string,
    healAmount: number,
    targetRule: string = 'notfainted'
  ): Item {
    const effect = new ItemEffect(ItemEffectType.HEAL, healAmount);
    return new Item(itemId, name, ItemType.CONSUMABLE, effect, targetRule);
  },

  /**
   * Create revival item
   */
  createReviveItem(
    itemId: string,
    name: string,
    revivePercent: number = 50,
    targetRule: string = 'faintedonly'
  ): Item {
    const effect = new ItemEffect(ItemEffectType.REVIVE, revivePercent);
    return new Item(itemId, name, ItemType.CONSUMABLE, effect, targetRule);
  },

  /**
   * Create sync boost item
   */
  createSyncBoostItem(
    itemId: string,
    name: string,
    syncAmount: number,
    targetRule: string = 'any'
  ): Item {
    const effect = new ItemEffect(ItemEffectType.SYNC_BOOST, syncAmount);
    return new Item(itemId, name, ItemType.CONSUMABLE, effect, targetRule);
  },

  /**
   * Create evolution item
   */
  createEvolutionItem(
    itemId: string,
    name: string,
    evolutionId: string,
    targetRule: string = 'any'
  ): Item {
    const effect = new ItemEffect(ItemEffectType.EVOLVE, 0, evolutionId);
    return new Item(itemId, name, ItemType.EVOLUTION_ITEM, effect, targetRule);
  },

  /**
   * Create flag unlock item
   */
  createFlagUnlockItem(
    itemId: string,
    name: string,
    flagKey: string,
    targetRule: string = 'any'
  ): Item {
    const effect = new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0, flagKey);
    return new Item(itemId, name, ItemType.KEY_ITEM, effect, targetRule);
  },

  /**
   * Create buff item
   */
  createBuffItem(
    itemId: string,
    name: string,
    buffType: 'attack' | 'defense',
    buffAmount: number,
    duration: string = '5 turns',
    targetRule: string = 'notfainted'
  ): Item {
    const effectType = buffType === 'attack' ? ItemEffectType.BUFF_ATTACK : ItemEffectType.BUFF_DEFENSE;
    const effect = new ItemEffect(effectType, buffAmount, duration);
    return new Item(itemId, name, ItemType.CONSUMABLE, effect, targetRule);
  },

  /**
   * Create item set for common RPG items
   */
  createStandardItemSet(): Item[] {
    return [
      this.createHealItem('health_potion', 'Health Potion', 50),
      this.createHealItem('super_potion', 'Super Potion', 100),
      this.createReviveItem('revive', 'Revive', 50),
      this.createSyncBoostItem('sync_crystal', 'Sync Crystal', 10),
      this.createBuffItem('attack_elixir', 'Attack Elixir', 'attack', 20),
      this.createBuffItem('defense_elixir', 'Defense Elixir', 'defense', 15),
      this.createFlagUnlockItem('mystery_key', 'Mystery Key', 'mystery_unlocked'),
    ];
  },

  /**
   * Validate item registry
   */
  validateItemRegistry(items: Item[]): string[] {
    const errors: string[] = [];
    const itemIds = new Set<string>();

    items.forEach((item, index) => {
      // Check for duplicate IDs
      if (itemIds.has(item.itemID)) {
        errors.push(`Duplicate item ID: ${item.itemID}`);
      } else {
        itemIds.add(item.itemID);
      }

      // Validate individual item
      const itemErrors = item.validate();
      itemErrors.forEach(error => {
        errors.push(`Item ${index} (${item.itemID}): ${error}`);
      });
    });

    return errors;
  },

  /**
   * Filter items by criteria
   */
  filterItems(
    items: Item[],
    criteria: {
      type?: ItemType;
      effectType?: ItemEffectType;
      targetRule?: string;
      hasEffect?: boolean;
    }
  ): Item[] {
    return items.filter(item => {
      if (criteria.type && item.type !== criteria.type) return false;
      if (criteria.effectType && item.effect.effectType !== criteria.effectType) return false;
      if (criteria.targetRule && item.targetRule !== criteria.targetRule) return false;
      if (criteria.hasEffect !== undefined) {
        const hasEffect = item.effect.effectType !== ItemEffectType.NONE;
        if (criteria.hasEffect !== hasEffect) return false;
      }
      return true;
    });
  },

  /**
   * Sort items by criteria
   */
  sortItems(items: Item[], sortBy: 'name' | 'type' | 'id'): Item[] {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'id':
          return a.itemID.localeCompare(b.itemID);
        default:
          return 0;
      }
    });
  },

  /**
   * Get item statistics
   */
  getItemStatistics(items: Item[]): {
    totalItems: number;
    byType: Record<ItemType, number>;
    byEffect: Record<ItemEffectType, number>;
    consumableCount: number;
    hasTargetRules: number;
  } {
    const stats = {
      totalItems: items.length,
      byType: {
        [ItemType.CONSUMABLE]: 0,
        [ItemType.KEY_ITEM]: 0,
        [ItemType.EQUIPMENT]: 0,
        [ItemType.EVOLUTION_ITEM]: 0
      } as Record<ItemType, number>,
      byEffect: Object.values(ItemEffectType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<ItemEffectType, number>),
      consumableCount: 0,
      hasTargetRules: 0
    };

    items.forEach(item => {
      stats.byType[item.type]++;
      stats.byEffect[item.effect.effectType]++;
      if (item.isConsumable) stats.consumableCount++;
      if (item.targetRule !== 'any') stats.hasTargetRules++;
    });

    return stats;
  }
};

/**
 * Default instances
 */
export const defaultItemEffect = new ItemEffect();
export const defaultItem = new Item();