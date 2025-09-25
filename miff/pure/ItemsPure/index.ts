/**
 * ItemsPure - Item Management System
 *
 * Comprehensive item management system for game items,
 * including creation, modification, and inventory operations.
 */

// Enums
export enum ItemType {
  CONSUMABLE = 'consumable',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  MATERIAL = 'material',
  QUEST = 'quest',
  CURRENCY = 'currency',
  EVOLUTION_ITEM = 'material', // Alias for backward compatibility
  KEY_ITEM = 'quest' // Alias for backward compatibility
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum ItemEffectType {
  NONE = 'none',
  HEAL = 'heal',
  REVIVE = 'revive',
  SYNC_BOOST = 'sync_boost',
  EVOLVE = 'evolve',
  UNLOCK_FLAG = 'unlock_flag',
  BUFF_ATTACK = 'buff_attack',
  BUFF_DEFENSE = 'buff_defense',
  BUFF_SPEED = 'buff_speed'
}

export enum UsageStatus {
  SUCCESS = 'success',
  INVALID_TARGET = 'invalid_target',
  EFFECT_BLOCKED = 'effect_blocked',
  INSUFFICIENT_RESOURCES = 'insufficient_resources',
  ITEM_NOT_FOUND = 'item_not_found'
}

export class Item {
  itemID: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
  maxStack: number;
  effect: ItemEffect;
  targetRule?: string;
  isConsumable: boolean;
  isKeyItem: boolean;
  isEvolutionItem: boolean;
  properties: Record<string, any>;
  metadata: Record<string, any>;

  constructor(
    itemID: string = '',
    name: string = '',
    type: ItemType = ItemType.CONSUMABLE,
    effect: ItemEffect = new ItemEffect(ItemEffectType.NONE, 0),
    targetRule?: string
  ) {
    this.itemID = itemID;
    this.name = name;
    this.description = '';
    this.type = type;
    this.rarity = ItemRarity.COMMON;
    this.value = 50;
    this.stackable = true;
    this.maxStack = type === ItemType.CURRENCY ? 999 : 99;
    this.effect = effect;
    this.targetRule = targetRule || 'any';
    this.isConsumable = type === ItemType.CONSUMABLE;
    this.isKeyItem = type === ItemType.QUEST;
    this.isEvolutionItem = type === ItemType.MATERIAL;

    // Add missing item type identifiers as properties
    Object.defineProperty(this, 'isEquipment', {
      get: () => this.type === ItemType.WEAPON || this.type === ItemType.ARMOR,
      enumerable: true,
      configurable: true
    });
    this.properties = {};
    this.metadata = {};
  }

  canUseOn(spirit: ISpiritInstance | null): boolean {
    if (!this.targetRule) return true;

    switch (this.targetRule) {
      case 'any':
        return true; // 'any' rule allows any target including null
      case 'notfainted':
        return spirit ? !spirit.isFainted() : false;
      case 'faintedonly':
        return spirit ? spirit.isFainted() : false;
      default:
        return true;
    }
  }

  applyEffect(context: IItemEffectContext, target: ISpiritInstance): UsageResult {
    return this.effect.apply(context, target);
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.itemID || this.itemID.trim() === '') {
      errors.push('Item ID cannot be empty');
    }

    if (!this.name || this.name.trim() === '') {
      errors.push('Item name cannot be empty');
    }

    if (!this.effect) {
      errors.push('Item must have an effect');
    }

    if (this.effect) {
      const effectErrors = this.effect.validate();
      errors.push(...effectErrors.map(error => `Effect: ${error}`));
    }

    if (this.targetRule && !['any', 'notfainted', 'faintedonly'].includes(this.targetRule)) {
      errors.push('Invalid target rule specified');
    }

    return errors;
  }

  getSummary(): string {
    return `${this.name} - ${this.effect.getSummary()}`;
  }

  getDescription(): string {
    const targetRule = this.targetRule ? `[${this.targetRule}]` : '';
    return `${this.name} (${this.typeName}) - ${this.effect.getSummary()} ${targetRule}`;
  }

  // Add type mapping for backward compatibility
  get typeName(): string {
    const typeMap: Record<string, string> = {
      consumable: 'consumable',
      weapon: 'weapon',
      armor: 'armor',
      material: 'material',
      quest: 'key_item',
      currency: 'currency'
    };
    return typeMap[this.type] || this.type;
  }

  clone(): Item {
    return new Item(
      this.itemID,
      this.name,
      this.type,
      this.effect.clone(),
      this.targetRule
    );
  }

  // Add missing properties for backward compatibility
  get effectType(): ItemEffectType | undefined {
    return this.effect.effectType;
  }

  get amount(): number | undefined {
    return this.effect.amount;
  }

  get param(): string | undefined {
    return this.effect.param;
  }

  // Add missing computed properties
  get isEquipment(): boolean {
    return this.type === ItemType.WEAPON || this.type === ItemType.ARMOR;
  }
}

export interface ItemInstance {
  itemId: string;
  quantity: number;
  durability?: number;
  maxDurability?: number;
  enchantments?: string[];
  customProperties?: Record<string, any>;
}

// Interfaces
export interface IPlayerContext {
  playerId: string;
  inventory: Record<string, number>;
  flags: Record<string, boolean>;
}

export interface ISpiritInstance {
  id: string;
  name: string;
  currentHP: number;
  maxHP: number;
  syncLevel?: number;
  isFainted(): boolean;
  canEvolve(): boolean;
  evolve(evolutionId: string): boolean;
}

export interface IItemEffectContext {
  playerContext: IPlayerContext;
  targetSpirit?: ISpiritInstance;
  sourceSpirit?: ISpiritInstance;
}

// Classes
export class UsageResult {
  status: UsageStatus;
  message: string;
  data?: any;

  constructor(status: UsageStatus, message: string = '', data?: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  get isSuccess(): boolean {
    return this.status === UsageStatus.SUCCESS;
  }

  static ok(message: string = '', data?: any): UsageResult {
    return new UsageResult(UsageStatus.SUCCESS, message, data);
  }

  static fail(status: UsageStatus, message: string = '', data?: any): UsageResult {
    return new UsageResult(status, message, data);
  }

  toString(): string {
    return `${this.status}: ${this.message}`;
  }
}

export class ItemEffect {
  effectType: ItemEffectType;
  amount: number;
  param?: string;
  cooldownSeconds: number;
  maxUses: number;

  constructor(
    effectType: ItemEffectType = ItemEffectType.NONE,
    amount: number = 0,
    param?: string,
    cooldownSeconds: number = 0,
    maxUses: number = -1
  ) {
    this.effectType = effectType;
    this.amount = amount; // Don't clamp - let validation handle it
    this.param = param;
    this.cooldownSeconds = Math.max(0, cooldownSeconds);
    this.maxUses = maxUses;
  }

  apply(context: IItemEffectContext, target: ISpiritInstance | null): UsageResult {
    if (!target) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'No target specified');
    }

    if (target.isFainted() && this.effectType !== ItemEffectType.REVIVE) {
      return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Cannot heal fainted spirit');
    }

    switch (this.effectType) {
      case ItemEffectType.HEAL:
        if (target.currentHP >= target.maxHP) {
          return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'already at full health');
        }
        const healAmount = Math.min(this.amount, target.maxHP - target.currentHP);
        target.currentHP += healAmount;
        return UsageResult.ok(`Healed ${healAmount} HP`, { healAmount });

      case ItemEffectType.REVIVE:
        if (!target.isFainted()) {
          return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target is not fainted');
        }
        // Use the amount as percentage of max HP to restore (default to 50% if not specified)
        const revivePercent = this.amount > 0 ? this.amount : 50;
        const reviveAmount = Math.floor(target.maxHP * (revivePercent / 100));
        target.currentHP = Math.max(1, reviveAmount);
        // Mark spirit as not fainted after revive
        if (target.isFainted && typeof target.isFainted === 'function') {
          // Note: This is a simplified approach for testing
          // In a real implementation, the spirit's fainted status would be managed by the battle system
        }
        return UsageResult.ok(`Revived with ${target.currentHP} HP`, { reviveAmount: target.currentHP });

      case ItemEffectType.SYNC_BOOST:
        if (target.syncLevel === undefined) {
          return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Spirit has no sync level');
        }
        target.syncLevel = Math.min(100, target.syncLevel + this.amount);
        return UsageResult.ok(`Sync increased`, { newSyncLevel: target.syncLevel });

      case ItemEffectType.EVOLVE:
        if (!target.canEvolve()) {
          return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Spirit cannot evolve');
        }
        const success = target.evolve(this.param || 'evolved');
        if (success) {
          return UsageResult.ok(`Evolved to ${this.param}`, { evolution: this.param });
        }
        return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Evolution failed');

      case ItemEffectType.UNLOCK_FLAG:
        if (this.param) {
          // Handle both IItemEffectContext and IPlayerContext
          const flags = (context as any).playerContext?.flags || (context as any).flags;
          if (flags) {
            flags[this.param] = true;
            return UsageResult.ok(`Flag '${this.param}' unlocked`, { flag: this.param });
          }
        }
        return UsageResult.fail(UsageStatus.INVALID_TARGET, 'No flag to unlock specified');

      case ItemEffectType.BUFF_ATTACK:
      case ItemEffectType.BUFF_DEFENSE:
      case ItemEffectType.BUFF_SPEED:
        const buffType = this.effectType.replace('buff_', '');
        return UsageResult.ok(`Buff ${buffType} by ${this.amount}`, { buffType, duration: this.amount });

      default:
        return UsageResult.fail(UsageStatus.EFFECT_BLOCKED, 'Unknown effect type');
    }
  }

  getSummary(): string {
    switch (this.effectType) {
      case ItemEffectType.NONE:
        return 'No effect';
      case ItemEffectType.HEAL:
        return `Heal ${this.amount} HP`;
      case ItemEffectType.REVIVE:
        return `Revive with ${this.amount}% HP`;
      case ItemEffectType.SYNC_BOOST:
        return `Sync increased`;
      case ItemEffectType.EVOLVE:
        return `Evolve to ${this.param || 'unknown'}`;
      case ItemEffectType.UNLOCK_FLAG:
        return `Flag '${this.param}' unlocked`;
      case ItemEffectType.BUFF_ATTACK:
        return `Buff Attack by ${this.amount}`;
      case ItemEffectType.BUFF_DEFENSE:
        return `Buff Defense by ${this.amount}`;
      case ItemEffectType.BUFF_SPEED:
        return `Buff Speed by ${this.amount}`;
      default:
        return `Effect: ${this.effectType}`;
    }
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!Object.values(ItemEffectType).includes(this.effectType)) {
      errors.push('Invalid effect type');
    }

    if (this.amount < 0) {
      errors.push('Effect amount cannot be negative');
    }

    if (this.cooldownSeconds < 0) {
      errors.push('Cooldown cannot be negative');
    }

    if (this.maxUses < -1) {
      errors.push('Max uses cannot be less than -1');
    }

    return errors;
  }

  clone(): ItemEffect {
    return new ItemEffect(this.effectType, this.amount, this.param, this.cooldownSeconds, this.maxUses);
  }
}

export class ItemsManager {
  private items: Map<string, Item>;
  private instances: Map<string, ItemInstance>;

  constructor() {
    this.items = new Map();
    this.instances = new Map();
  }

  /**
   * Add an item definition
   */
  addItem(item: Item): void {
    this.items.set(item.itemID, item);
  }

  /**
   * Get item definition by ID
   */
  getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  /**
   * Create item instance
   */
  createInstance(itemId: string, quantity: number = 1): string | null {
    const item = this.items.get(itemId);
    if (!item) return null;

    const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const instance: ItemInstance = {
      itemId,
      quantity,
      durability: item.properties.durability || undefined,
      maxDurability: item.properties.maxDurability || undefined,
      enchantments: [],
      customProperties: {}
    };

    this.instances.set(instanceId, instance);
    return instanceId;
  }

  /**
   * Get item instance by ID
   */
  getInstance(instanceId: string): ItemInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Update item instance
   */
  updateInstance(instanceId: string, updates: Partial<ItemInstance>): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    Object.assign(instance, updates);
    return true;
  }

  /**
   * Remove item instance
   */
  removeInstance(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }

  /**
   * Get all items by type
   */
  getItemsByType(type: string): Item[] {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  /**
   * Get all items by rarity
   */
  getItemsByRarity(rarity: string): Item[] {
    return Array.from(this.items.values()).filter(item => item.rarity === rarity);
  }

  /**
   * Search items by name or description
   */
  searchItems(query: string): Item[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all item instances
   */
  getAllInstances(): ItemInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get statistics
   */
  getStats(): { totalItems: number; totalInstances: number; itemsByType: Record<string, number> } {
    const itemsByType: Record<string, number> = {};
    for (const item of this.items.values()) {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
    }

    return {
      totalItems: this.items.size,
      totalInstances: this.instances.size,
      itemsByType
    };
  }
}

export class ItemUsageManager {
  private context: IPlayerContext;
  private registeredItems: Map<string, Item> = new Map();

  constructor(context: IPlayerContext) {
    this.context = context;
  }

  registerItem(item: Item): boolean {
    if (item.itemID && item.name && item.type) {
      this.registeredItems.set(item.itemID, item);
      return true;
    }
    return false;
  }

  getItem(itemId: string): Item | null {
    return this.registeredItems.get(itemId) || null;
  }

  getAllItems(): Item[] {
    return Array.from(this.registeredItems.values());
  }

  removeItem(itemId: string): boolean {
    return this.registeredItems.delete(itemId);
  }

  updateItem(itemId: string, updates: Partial<Item>): boolean {
    const item = this.registeredItems.get(itemId);
    if (!item) return false;

    // Create a temporary item with the updates to validate
    const updated = new Item(
      updates.itemID ?? item.itemID,
      updates.name ?? item.name,
      updates.type ?? item.type,
      updates.effect ?? item.effect,
      updates.description ?? item.description,
      updates.value ?? item.value,
      updates.targetRule ?? item.targetRule
    );
    const validationErrors = updated.validate();

    if (validationErrors.length > 0) {
      return false; // Don't apply invalid updates
    }

    Object.assign(item, updates);
    return true;
  }

  canUseItem(itemId: string, targetSpirit?: ISpiritInstance): UsageResult {
    const item = this.registeredItems.get(itemId);
    if (!item) {
      return UsageResult.fail(UsageStatus.ITEM_NOT_FOUND, `Item '${itemId}' not found`);
    }

    // Key items don't require inventory tracking
    if (item.type !== ItemType.KEY_ITEM && (!this.context.inventory[itemId] || this.context.inventory[itemId] <= 0)) {
      return UsageResult.fail(UsageStatus.INSUFFICIENT_RESOURCES, 'Item not in inventory');
    }

    if (targetSpirit) {
      // Check item-specific target rules
      if (item.targetRule) {
        switch (item.targetRule) {
          case 'notfainted':
            if (targetSpirit.isFainted()) {
              return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target must not be fainted');
            }
            break;
          case 'faintedonly':
            if (!targetSpirit.isFainted()) {
              return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target must be fainted');
            }
            break;
          case 'any':
            // Allow any target
            break;
          default:
            return UsageResult.fail(UsageStatus.INVALID_TARGET, `Unknown target rule: ${item.targetRule}`);
        }
      } else {
        // Default behavior for items without specific target rules
        if (targetSpirit.isFainted() && item.type === ItemType.CONSUMABLE) {
          const effect = this.getItemEffect(item);
          if (effect && effect.type !== ItemEffectType.REVIVE) {
            return UsageResult.fail(UsageStatus.INVALID_TARGET, 'Cannot use this item on fainted spirit');
          }
        }
      }
    }

    return UsageResult.ok('Item can be used');
  }

  useItem(itemId: string, targetSpirit?: ISpiritInstance): UsageResult {
    const canUseResult = this.canUseItem(itemId, targetSpirit);
    if (!canUseResult.isSuccess) {
      return canUseResult;
    }

    const item = this.registeredItems.get(itemId);
    if (!item) {
      return UsageResult.fail(UsageStatus.ITEM_NOT_FOUND);
    }

    // Consume item (key items are not tracked in inventory)
    if (item.type !== ItemType.KEY_ITEM) {
      this.context.inventory[itemId]--;
    }

    // Apply effects
    const effect = this.getItemEffect(item);
    if (effect && targetSpirit) {
      const context: IItemEffectContext = {
        playerContext: this.context,
        targetSpirit
      };
      return effect.apply(context, targetSpirit);
    }

    return UsageResult.ok(`Used ${item.name}`);
  }

  private getItemEffect(item: Item): ItemEffect | null {
    // Return the item's effect directly
    return item.effect;
  }

  getItemCount(): number {
    return this.registeredItems.size;
  }

  searchItems(query: string): Item[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.registeredItems.values()).filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.itemID.toLowerCase().includes(lowerQuery)
    );
  }

  hasItem(itemId: string): boolean {
    return this.registeredItems.has(itemId);
  }

  getAllItems(): Item[] {
    return Array.from(this.registeredItems.values());
  }

  removeItem(itemId: string): boolean {
    return this.registeredItems.delete(itemId);
  }

  getUsableItems(spirit?: ISpiritInstance): Item[] {
    return Array.from(this.registeredItems.values()).filter(item =>
      item.canUseOn(spirit)
    );
  }

  getItemsByType(type: ItemType): Item[] {
    return Array.from(this.registeredItems.values()).filter(item =>
      item.type === type
    );
  }
}

export class ItemUtils {
  static createStandardItemSet(): Item[] {
    return [
      this.createHealItem('health_potion', 'Health Potion', 50),
      this.createReviveItem('revive', 'Revive', 50),
      this.createSyncBoostItem('sync_crystal', 'Sync Crystal', 10),
      this.createBuffItem('attack_elixir', 'Attack Elixir', 'attack', 30),
      this.createEvolutionItem('fire_stone', 'Fire Stone', 'fire_spirit'),
      this.createFlagUnlockItem('completion_token', 'Completion Token', 'quest_complete'),
      this.createKeyItem('mystery_key', 'Mystery Key')
    ];
  }

  static createHealItem(itemId: string, name: string, healAmount: number): Item {
    return new Item(
      itemId,
      name,
      ItemType.CONSUMABLE,
      new ItemEffect(ItemEffectType.HEAL, healAmount),
      'notfainted'
    );
  }

  static createReviveItem(itemId: string, name: string, revivePercent: number): Item {
    return new Item(
      itemId,
      name,
      ItemType.CONSUMABLE,
      new ItemEffect(ItemEffectType.REVIVE, revivePercent),
      'faintedonly'
    );
  }

  static createSyncBoostItem(itemId: string, name: string, boostAmount: number): Item {
    return new Item(
      itemId,
      name,
      ItemType.CONSUMABLE,
      new ItemEffect(ItemEffectType.SYNC_BOOST, boostAmount)
    );
  }

  static createEvolutionItem(itemId: string, name: string, evolutionTarget: string): Item {
    return new Item(
      itemId,
      name,
      ItemType.MATERIAL,
      new ItemEffect(ItemEffectType.EVOLVE, 0, evolutionTarget)
    );
  }

  static createFlagUnlockItem(itemId: string, name: string, flag: string): Item {
    return new Item(
      itemId,
      name,
      ItemType.QUEST,
      new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0, flag)
    );
  }

  static createBuffItem(itemId: string, name: string, buffType: string, duration: number): Item {
    let effectType: ItemEffectType;
    let param: string;
    switch (buffType) {
      case 'attack':
        effectType = ItemEffectType.BUFF_ATTACK;
        param = `${duration} turns`;
        break;
      case 'defense':
        effectType = ItemEffectType.BUFF_DEFENSE;
        param = `${duration} turns`;
        break;
      case 'speed':
        effectType = ItemEffectType.BUFF_SPEED;
        param = `${duration} turns`;
        break;
      default:
        effectType = ItemEffectType.BUFF_ATTACK;
        param = `${duration} turns`;
        break;
    }

    return new Item(
      itemId,
      name,
      ItemType.CONSUMABLE,
      new ItemEffect(effectType, duration, param)
    );
  }

  static createKeyItem(itemId: string, name: string): Item {
    return new Item(
      itemId,
      name,
      ItemType.QUEST,
      new ItemEffect(ItemEffectType.NONE, 0)
    );
  }

  static validateItem(item: Item): string[] {
    const errors: string[] = [];

    if (!item.itemID || item.itemID.trim() === '') {
      errors.push('Item ID cannot be empty');
    }

    if (!item.name || item.name.trim() === '') {
      errors.push('Item name cannot be empty');
    }

    if (!item.type) {
      errors.push('Item type is required');
    }

    if (item.value < 0) {
      errors.push('Item value cannot be negative');
    }

    if (item.stackable && item.maxStack <= 0) {
      errors.push('Stackable items must have maxStack > 0');
    }

    return errors;
  }

  static filterItemsByType(items: Item[], type: ItemType): Item[] {
    return items.filter(item => item.type === type);
  }

  static filterItemsByEffectType(items: Item[], effectType: ItemEffectType): Item[] {
    return items.filter(item =>
      item.properties.effectType === effectType
    );
  }

  static filterItemsByRarity(items: Item[], rarity: ItemRarity): Item[] {
    return items.filter(item => item.rarity === rarity);
  }

  static sortItemsByName(items: Item[]): Item[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }

  static sortItemsByValue(items: Item[]): Item[] {
    return [...items].sort((a, b) => b.value - a.value);
  }

  static getItemStatistics(items: Item[]): {
    totalItems: number;
    consumableCount: number;
    byType: Record<string, number>;
    byRarity: Record<string, number>;
    byEffect: Record<string, number>;
    averageValue: number;
    totalValue: number;
  } {
    const byType: Record<string, number> = {};
    const byRarity: Record<string, number> = {};
    const byEffect: Record<string, number> = {};
    let totalValue = 0;
    let consumableCount = 0;

    items.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
      byEffect[item.effect.effectType] = (byEffect[item.effect.effectType] || 0) + 1;
      totalValue += item.value;
      if (item.isConsumable) consumableCount++;
    });

    return {
      totalItems: items.length,
      consumableCount,
      byType,
      byRarity,
      byEffect,
      averageValue: items.length > 0 ? totalValue / items.length : 0,
      totalValue
    };
  }

  static filterItems(items: Item[], criteria: {
    type?: ItemType;
    effectType?: ItemEffectType;
    targetRule?: string;
    hasEffect?: boolean;
  }): Item[] {
    return items.filter(item => {
      if (criteria.type && item.type !== criteria.type) return false;
      if (criteria.effectType && item.effect.effectType !== criteria.effectType) return false;
      if (criteria.targetRule && item.targetRule !== criteria.targetRule) return false;
      if (criteria.hasEffect !== undefined && (criteria.hasEffect ? item.effect.effectType === ItemEffectType.NONE : item.effect.effectType !== ItemEffectType.NONE)) return false;
      return true;
    });
  }

  static validateItemRegistry(items: Item[]): string[] {
    const errors: string[] = [];
    const itemIds = new Set<string>();

    items.forEach(item => {
      const itemErrors = this.validateItem(item);
      errors.push(...itemErrors.map(error => `${item.itemID}: ${error}`));

      if (itemIds.has(item.itemID)) {
        errors.push(`${item.itemID}: Duplicate item ID`);
      }
      itemIds.add(item.itemID);
    });

    return errors;
  }

  static filterItems(items: Item[], criteria: any): Item[] {
    return items.filter(item => {
      if (criteria.type && item.type !== criteria.type) return false;
      if (criteria.effectType && item.effect.effectType !== criteria.effectType) return false;
      if (criteria.targetRule && item.targetRule !== criteria.targetRule) return false;
      if (criteria.hasEffect !== undefined) {
        if (criteria.hasEffect && item.effect.effectType === ItemEffectType.NONE) return false;
        if (!criteria.hasEffect && item.effect.effectType !== ItemEffectType.NONE) return false;
      }
      return true;
    });
  }

  static sortItems(items: Item[], sortBy: string): Item[] {
    const sorted = [...items];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.type.localeCompare(b.type));
      case 'id':
        return sorted.sort((a, b) => a.itemID.localeCompare(b.itemID));
      case 'value':
        return sorted.sort((a, b) => b.value - a.value);
      default:
        return sorted;
    }
  }

  static searchItems(items: Item[], query: string): Item[] {
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.itemID.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export default instance
export const defaultItemsManager = new ItemsManager();
export { ItemsManager as default };
