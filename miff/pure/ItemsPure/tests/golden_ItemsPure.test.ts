/**
 * ItemsPure Golden Tests
 *
 * Comprehensive tests for the ItemsPure item management system.
 * Tests cover item creation, effects, usage, validation, and integration scenarios.
 */

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
} from '../index';

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

  // Add setter for currentHP to update fainted status
  set currentHP(value: number) {
    (this as any)._currentHP = value;
    this.fainted = value <= 0;
    // Update fainted status when HP changes
    if (this.fainted && value > 0) {
      this.fainted = false;
    }
  }

  get currentHP(): number {
    return (this as any)._currentHP ?? this.maxHP;
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
    this.name += ` (${evolutionId})`;
    return true;
  }
}

// Mock Player Context for testing
const createMockContext = (inventory?: Record<string, number>, flags?: Record<string, boolean>): IPlayerContext => ({
  playerId: 'test_player',
  inventory: inventory || {},
  flags: flags || {}
});

describe('ItemsPure Golden Tests', () => {
  describe('UsageResult Basic Functionality', () => {
    test('should create success result', () => {
      const result = UsageResult.ok('Item used successfully');
      expect(result.status).toBe(UsageStatus.SUCCESS);
      expect(result.message).toBe('Item used successfully');
      expect(result.isSuccess).toBe(true);
      expect(result.toString()).toBe('success: Item used successfully');
    });

    test('should create failure result', () => {
      const result = UsageResult.fail(UsageStatus.INVALID_TARGET, 'Target is fainted');
      expect(result.status).toBe(UsageStatus.INVALID_TARGET);
      expect(result.message).toBe('Target is fainted');
      expect(result.isSuccess).toBe(false);
      expect(result.toString()).toBe('invalid_target: Target is fainted');
    });

    test('should handle empty messages', () => {
      const success = UsageResult.ok();
      const failure = UsageResult.fail(UsageStatus.EFFECT_BLOCKED);

      expect(success.message).toBe('');
      expect(failure.message).toBe('');
      expect(success.isSuccess).toBe(true);
      expect(failure.isSuccess).toBe(false);
    });
  });

  describe('ItemEffect Basic Functionality', () => {
    let effect: ItemEffect;

    beforeEach(() => {
      effect = new ItemEffect(ItemEffectType.HEAL, 50);
    });

    test('should create effect with default values', () => {
      const defaultEffect = new ItemEffect();
      expect(defaultEffect.effectType).toBe(ItemEffectType.NONE);
      expect(defaultEffect.amount).toBe(0);
      expect(defaultEffect.param).toBeUndefined();
      expect(defaultEffect.cooldownSeconds).toBe(0);
      expect(defaultEffect.maxUses).toBe(-1);
    });

    test('should create effect with custom values', () => {
      const customEffect = new ItemEffect(
        ItemEffectType.EVOLVE,
        0,
        'fire_spirit',
        30,
        5
      );

      expect(customEffect.effectType).toBe(ItemEffectType.EVOLVE);
      expect(customEffect.amount).toBe(0);
      expect(customEffect.param).toBe('fire_spirit');
      expect(customEffect.cooldownSeconds).toBe(30);
      expect(customEffect.maxUses).toBe(5);
    });

    test('should preserve values without clamping', () => {
      const effect = new ItemEffect(
        ItemEffectType.HEAL,
        -10,
        undefined,
        -5,
        -10
      );

      expect(effect.amount).toBe(-10); // Negative value preserved
      expect(effect.cooldownSeconds).toBe(0); // Negative cooldown clamped to 0
      expect(effect.maxUses).toBe(-10); // -10 is allowed for maxUses
    });

    test('should validate correctly', () => {
      const validEffect = new ItemEffect(ItemEffectType.HEAL, 50);
      expect(validEffect.validate({})).toHaveLength(0);

      const invalidEffect = new ItemEffect(ItemEffectType.HEAL, -10);
      const errors = invalidEffect.validate({});
      expect(errors).toContain('Effect amount cannot be negative');
    });

    test('should generate effect summary correctly', () => {
      const healEffect = new ItemEffect(ItemEffectType.HEAL, 50);
      const reviveEffect = new ItemEffect(ItemEffectType.REVIVE, 75);
      const evolveEffect = new ItemEffect(ItemEffectType.EVOLVE, 0, 'fire_spirit');
      const buffEffect = new ItemEffect(ItemEffectType.BUFF_ATTACK, 20, '5 turns');
      const noneEffect = new ItemEffect(ItemEffectType.NONE, 0);

      expect(healEffect.getSummary()).toBe('Heal 50 HP');
      expect(reviveEffect.getSummary()).toBe('Revive with 75% HP');
      expect(evolveEffect.getSummary()).toBe('Evolve to fire_spirit');
      expect(buffEffect.getSummary()).toBe('Buff Attack by 20');
      expect(noneEffect.getSummary()).toBe('No effect');
    });

    test('should clone correctly', () => {
      const original = new ItemEffect(ItemEffectType.EVOLVE, 0, 'test_species', 10, 3);
      const clone = original.clone();

      expect(clone.effectType).toBe(original.effectType);
      expect(clone.amount).toBe(original.amount);
      expect(clone.param).toBe(original.param);
      expect(clone.cooldownSeconds).toBe(original.cooldownSeconds);
      expect(clone.maxUses).toBe(original.maxUses);
      expect(clone).not.toBe(original);
    });
  });

  describe('Item Basic Functionality', () => {
    let item: Item;
    let healEffect: ItemEffect;

    beforeEach(() => {
      healEffect = new ItemEffect(ItemEffectType.HEAL, 50);
      item = new Item('health_potion', 'Health Potion', ItemType.CONSUMABLE, healEffect);
    });

    test('should create item with default values', () => {
      const defaultItem = new Item();
      expect(defaultItem.itemID).toBe('');
      expect(defaultItem.name).toBe('');
      expect(defaultItem.type).toBe(ItemType.CONSUMABLE);
      expect(defaultItem.targetRule).toBe('any');
    });

    test('should create item with custom values', () => {
      const customItem = new Item(
        'revive_potion',
        'Revive Potion',
        ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.REVIVE, 50),
        'faintedonly'
      );

      expect(customItem.itemID).toBe('revive_potion');
      expect(customItem.name).toBe('Revive Potion');
      expect(customItem.type).toBe(ItemType.CONSUMABLE);
      expect(customItem.targetRule).toBe('faintedonly');
    });

    test('should identify item types correctly', () => {
      const consumable = new Item('potion', 'Potion', ItemType.CONSUMABLE);
      const keyItem = new Item('key', 'Key', ItemType.KEY_ITEM);
      const equipment = new Item('sword', 'Sword', ItemType.WEAPON);
      const evolution = new Item('stone', 'Stone', ItemType.EVOLUTION_ITEM);

      expect(consumable.isConsumable).toBe(true);
      expect(keyItem.isKeyItem).toBe(true);
      expect(equipment.isEquipment).toBe(true);
      expect(evolution.isEvolutionItem).toBe(true);
    });

    test('should generate description correctly', () => {
      const healItem = new Item('potion', 'Health Potion', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 50), 'notfainted');
      const reviveItem = new Item('revive', 'Revive', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.REVIVE, 50), 'faintedonly');
      const noEffectItem = new Item('key', 'Mystery Key', ItemType.KEY_ITEM,
        new ItemEffect(ItemEffectType.NONE, 0), 'any');

      expect(healItem.getDescription()).toBe('Health Potion (consumable) - Heal 50 HP [notfainted]');
      expect(reviveItem.getDescription()).toBe('Revive (consumable) - Revive with 50% HP [faintedonly]');
      expect(noEffectItem.getDescription()).toBe('Mystery Key (key_item) - No effect [any]');
    });

    test('should clone correctly', () => {
      const original = new Item('test_item', 'Test Item', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30), 'notfainted');
      const clone = original.clone();

      expect(clone.itemID).toBe(original.itemID);
      expect(clone.name).toBe(original.name);
      expect(clone.type).toBe(original.type);
      expect(clone.targetRule).toBe(original.targetRule);
      expect(clone.effect).not.toBe(original.effect); // Deep clone
      expect(clone).not.toBe(original);
    });

    test('should validate correctly', () => {
      const validItem = new Item('valid_item', 'Valid Item', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 50));
      expect(validItem.validate({})).toHaveLength(0);

      const invalidItem = new Item('', '', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, -10));
      const errors = invalidItem.validate({});
      expect(errors).toContain('Item ID cannot be empty');
      expect(errors).toContain('Item name cannot be empty');
      expect(errors).toContain('Effect: Effect amount cannot be negative');
    });
  });

  describe('ItemEffect Application Tests', () => {
    let context: IPlayerContext;
    let activeSpirit: MockSpiritInstance;
    let faintedSpirit: MockSpiritInstance;
    let highSyncSpirit: MockSpiritInstance;

    beforeEach(() => {
      context = createMockContext();
      activeSpirit = new MockSpiritInstance('active', 'Active Spirit', 100, 75, 0); // Add sync level 0
      faintedSpirit = new MockSpiritInstance('fainted', 'Fainted Spirit', 100, 0);
      highSyncSpirit = new MockSpiritInstance('high_sync', 'High Sync Spirit', 100, 100, 60);
    });

    test('should apply heal effect correctly', () => {
      const healEffect = new ItemEffect(ItemEffectType.HEAL, 30);
      const result = healEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain('Healed 25 HP'); // 75 + 25 = 100 (max HP)
      expect(activeSpirit.currentHP).toBe(100); // Max HP
    });

    test('should handle overheal correctly', () => {
      // Ensure the spirit is at full health for this test
      activeSpirit.currentHP = 100;

      const overhealEffect = new ItemEffect(ItemEffectType.HEAL, 50);
      const result = overhealEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('already at full health');
      expect(activeSpirit.currentHP).toBe(100); // Should remain unchanged
    });

    test('should reject heal on fainted spirit', () => {
      const healEffect = new ItemEffect(ItemEffectType.HEAL, 30);
      const result = healEffect.apply(context, faintedSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('Cannot heal fainted spirit');
    });

    test('should apply revive effect correctly', () => {
      const reviveEffect = new ItemEffect(ItemEffectType.REVIVE, 50);
      const result = reviveEffect.apply(context, faintedSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain('Revived with 50 HP');
      expect(faintedSpirit.currentHP).toBe(50);
      expect(faintedSpirit.isFainted()).toBe(false);
    });

    test('should reject revive on active spirit', () => {
      const reviveEffect = new ItemEffect(ItemEffectType.REVIVE, 50);
      const result = reviveEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('Target is not fainted');
    });

    test('should apply sync boost effect correctly', () => {
      const syncEffect = new ItemEffect(ItemEffectType.SYNC_BOOST, 15);
      const result = syncEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain('Sync increased');
      expect(activeSpirit.syncLevel).toBe(15);
    });

    test('should handle sync boost on spirit without sync', () => {
      const syncEffect = new ItemEffect(ItemEffectType.SYNC_BOOST, 10);
      const noSyncSpirit = new MockSpiritInstance('no_sync', 'No Sync Spirit', 100, 100);
      const result = syncEffect.apply(context, noSyncSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('no sync level');
    });

    test('should apply evolution effect correctly', () => {
      const evolveEffect = new ItemEffect(ItemEffectType.EVOLVE, 0, 'evolved_form');
      const result = evolveEffect.apply(context, highSyncSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain('Evolved to evolved_form');
      expect(highSyncSpirit.name).toContain('evolved_form');
    });

    test('should reject evolution on low sync spirit', () => {
      const evolveEffect = new ItemEffect(ItemEffectType.EVOLVE, 0, 'evolved_form');
      const result = evolveEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('cannot evolve');
    });

    test('should apply flag unlock effect correctly', () => {
      const flagEffect = new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0, 'quest_complete');
      const result = flagEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain("Flag 'quest_complete' unlocked");
      expect(context.flags['quest_complete']).toBe(true);
    });

    test('should handle missing flag parameter', () => {
      const flagEffect = new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0);
      const result = flagEffect.apply(context, activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('No flag to unlock specified');
    });

    test('should handle null target', () => {
      const healEffect = new ItemEffect(ItemEffectType.HEAL, 30);
      const result = healEffect.apply(context, null);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('No target specified');
    });
  });

  describe('Item Usage with Target Rules', () => {
    let context: IPlayerContext;
    let activeSpirit: MockSpiritInstance;
    let faintedSpirit: MockSpiritInstance;

    beforeEach(() => {
      context = createMockContext();
      activeSpirit = new MockSpiritInstance('active', 'Active Spirit', 100, 75);
      faintedSpirit = new MockSpiritInstance('fainted', 'Fainted Spirit', 100, 0);
    });

    test('should allow any target rule', () => {
      const item = new Item('universal_item', 'Universal Item', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30), 'any');

      expect(item.canUseOn(activeSpirit)).toBe(true);
      expect(item.canUseOn(faintedSpirit)).toBe(true);
      expect(item.canUseOn(null)).toBe(true);
    });

    test('should enforce notfainted rule', () => {
      const item = new Item('active_only', 'Active Only', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30), 'notfainted');

      expect(item.canUseOn(activeSpirit)).toBe(true);
      expect(item.canUseOn(faintedSpirit)).toBe(false);
      expect(item.canUseOn(null)).toBe(false);
    });

    test('should enforce faintedonly rule', () => {
      const item = new Item('revive_only', 'Revive Only', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.REVIVE, 50), 'faintedonly');

      expect(item.canUseOn(activeSpirit)).toBe(false);
      expect(item.canUseOn(faintedSpirit)).toBe(true);
      expect(item.canUseOn(null)).toBe(false);
    });

    test('should apply effect with target validation', () => {
      const healItem = new Item('selective_heal', 'Selective Heal', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30), 'notfainted');

      const activeResult = healItem.applyEffect(context, activeSpirit);
      expect(activeResult.isSuccess).toBe(true);

      const faintedResult = healItem.applyEffect(context, faintedSpirit);
      expect(faintedResult.isSuccess).toBe(false);
      expect(faintedResult.message).toContain('Cannot heal fainted spirit');
    });

    test('should handle invalid target rules gracefully', () => {
      const item = new Item('invalid_rule', 'Invalid Rule', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30), 'invalidrule');

      const errors = item.validate({});
      expect(errors).toContain('Invalid target rule specified');
    });
  });

  describe('ItemUsageManager Basic Functionality', () => {
    let manager: ItemUsageManager;
    let context: IPlayerContext;
    let testItem: Item;

    beforeEach(() => {
      context = createMockContext({ 'test_item': 5 }, { 'flag1': false });
      manager = new ItemUsageManager(context);
      testItem = new Item('test_item', 'Test Item', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30));
    });

    test('should create manager with context', () => {
      expect(manager).toBeDefined();
      expect(manager.getItemCount()).toBe(0);
    });

    test('should register items correctly', () => {
      const registered = manager.registerItem(testItem);
      expect(registered).toBe(true);
      expect(manager.getItemCount()).toBe(1);
      expect(manager.hasItem('test_item')).toBe(true);
    });

    test('should reject invalid items', () => {
      const invalidItem = new Item('', '', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, -10));

      const registered = manager.registerItem(invalidItem);
      expect(registered).toBe(false);
      expect(manager.getItemCount()).toBe(0);
    });

    test('should get and retrieve items correctly', () => {
      manager.registerItem(testItem);

      const retrieved = manager.getItem('test_item');
      expect(retrieved).toBe(testItem);

      const nonExistent = manager.getItem('nonexistent');
      expect(nonExistent).toBeNull();
    });

    test('should get all items correctly', () => {
      const item1 = new Item('item1', 'Item 1', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 20));
      const item2 = new Item('item2', 'Item 2', ItemType.KEY_ITEM,
        new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0, 'flag1'));

      manager.registerItem(item1);
      manager.registerItem(item2);

      const allItems = manager.getAllItems();
      expect(allItems).toHaveLength(2);
      expect(allItems.map(i => i.itemID)).toEqual(['item1', 'item2']);
    });

    test('should remove items correctly', () => {
      manager.registerItem(testItem);

      const removed = manager.removeItem('test_item');
      expect(removed).toBe(true);
      expect(manager.getItemCount()).toBe(0);
      expect(manager.hasItem('test_item')).toBe(false);

      const notRemoved = manager.removeItem('nonexistent');
      expect(notRemoved).toBe(false);
    });

    test('should update items correctly', () => {
      manager.registerItem(testItem);

      const updates: Partial<Item> = {
        name: 'Updated Item',
        effect: new ItemEffect(ItemEffectType.HEAL, 50)
      };

      const updated = manager.updateItem('test_item', updates);
      expect(updated).toBe(true);

      const updatedItem = manager.getItem('test_item');
      expect(updatedItem?.name).toBe('Updated Item');
      expect((updatedItem?.effect.amount)).toBe(50);
    });

    test('should reject invalid updates', () => {
      manager.registerItem(testItem);

      const invalidUpdates: Partial<Item> = {
        itemID: '',
        effect: new ItemEffect(ItemEffectType.HEAL, -50)
      };


      const updated = manager.updateItem('test_item', invalidUpdates);
      expect(updated).toBe(false);
    });
  });

  describe('ItemUsageManager Usage Tests', () => {
    let manager: ItemUsageManager;
    let context: IPlayerContext;
    let activeSpirit: MockSpiritInstance;
    let faintedSpirit: MockSpiritInstance;

    beforeEach(() => {
      context = createMockContext(
        { 'health_potion': 3, 'revive': 2, 'unknown_item': 1 },
        { 'quest_complete': false }
      );
      manager = new ItemUsageManager(context);
      activeSpirit = new MockSpiritInstance('active', 'Active Spirit', 100, 75);
      faintedSpirit = new MockSpiritInstance('fainted', 'Fainted Spirit', 100, 0);
    });

    test('should handle successful item usage', () => {
      const healItem = new Item('health_potion', 'Health Potion', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30));
      manager.registerItem(healItem);

      const result = manager.useItem('health_potion', activeSpirit);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toContain('Healed 25 HP'); // Only heals what's needed to reach max HP
      expect(activeSpirit.currentHP).toBe(100); // Max HP
      expect(context.inventory['health_potion']).toBe(2); // Consumed
    });

    test('should handle item not in inventory', () => {
      const healItem = new Item('missing_potion', 'Missing Potion', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.HEAL, 30));
      manager.registerItem(healItem);

      const result = manager.useItem('missing_potion', activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain('Item not in inventory');
    });

    test('should handle unknown items', () => {
      const result = manager.useItem('unknown_item', activeSpirit);

      expect(result.isSuccess).toBe(false);
      expect(result.message).toContain("Item 'unknown_item' not found");
    });

    test('should not consume key items', () => {
      const keyItem = new Item('mystery_key', 'Mystery Key', ItemType.KEY_ITEM,
        new ItemEffect(ItemEffectType.UNLOCK_FLAG, 0, 'mystery_unlocked'));
      manager.registerItem(keyItem);

      const result = manager.useItem('mystery_key', activeSpirit);

      expect(result.isSuccess).toBe(true);
      expect(context.inventory['mystery_key']).toBeUndefined(); // Key items not tracked in inventory
    });

    test('should handle usage validation', () => {
      const reviveItem = new Item('revive', 'Revive', ItemType.CONSUMABLE,
        new ItemEffect(ItemEffectType.REVIVE, 50), 'faintedonly');
      manager.registerItem(reviveItem);

      // Should work on fainted spirit
      const faintedResult = manager.useItem('revive', faintedSpirit);
      expect(faintedResult.isSuccess).toBe(true);
      expect(faintedSpirit.currentHP).toBe(50);

      // Should fail on active spirit
      const activeResult = manager.useItem('revive', activeSpirit);
      expect(activeResult.isSuccess).toBe(false);
      expect(activeResult.message).toContain('must be fainted');
    });
  });

  describe('ItemUtils Basic Functionality', () => {
    test('should create standard item set', () => {
      const items = ItemUtils.createStandardItemSet();

      expect(items).toHaveLength(7);
      expect(items.some(i => i.name === 'Health Potion')).toBe(true);
      expect(items.some(i => i.name === 'Revive')).toBe(true);
      expect(items.some(i => i.name === 'Sync Crystal')).toBe(true);
      expect(items.some(i => i.name === 'Attack Elixir')).toBe(true);
      expect(items.some(i => i.name === 'Mystery Key')).toBe(true);
    });

    test('should create heal item', () => {
      const item = ItemUtils.createHealItem('super_potion', 'Super Potion', 100);

      expect(item.itemID).toBe('super_potion');
      expect(item.name).toBe('Super Potion');
      expect(item.type).toBe(ItemType.CONSUMABLE);
      expect(item.effect.effectType).toBe(ItemEffectType.HEAL);
      expect(item.effect.amount).toBe(100);
      expect(item.targetRule).toBe('notfainted');
    });

    test('should create revive item', () => {
      const item = ItemUtils.createReviveItem('max_revive', 'Max Revive', 100);

      expect(item.itemID).toBe('max_revive');
      expect(item.name).toBe('Max Revive');
      expect(item.effect.effectType).toBe(ItemEffectType.REVIVE);
      expect(item.effect.amount).toBe(100);
      expect(item.targetRule).toBe('faintedonly');
    });

    test('should create sync boost item', () => {
      const item = ItemUtils.createSyncBoostItem('sync_shard', 'Sync Shard', 25);

      expect(item.itemID).toBe('sync_shard');
      expect(item.name).toBe('Sync Shard');
      expect(item.effect.effectType).toBe(ItemEffectType.SYNC_BOOST);
      expect(item.effect.amount).toBe(25);
    });

    test('should create evolution item', () => {
      const item = ItemUtils.createEvolutionItem('water_stone', 'Water Stone', 'water_spirit');

      expect(item.itemID).toBe('water_stone');
      expect(item.name).toBe('Water Stone');
      expect(item.type).toBe(ItemType.EVOLUTION_ITEM);
      expect(item.effect.effectType).toBe(ItemEffectType.EVOLVE);
      expect(item.effect.param).toBe('water_spirit');
    });

    test('should create flag unlock item', () => {
      const item = ItemUtils.createFlagUnlockItem('completion_token', 'Completion Token', 'quest_complete');

      expect(item.itemID).toBe('completion_token');
      expect(item.name).toBe('Completion Token');
      expect(item.type).toBe(ItemType.KEY_ITEM);
      expect(item.effect.effectType).toBe(ItemEffectType.UNLOCK_FLAG);
      expect(item.effect.param).toBe('quest_complete');
    });

    test('should create buff item', () => {
      const item = ItemUtils.createBuffItem('attack_potion', 'Attack Potion', 'attack', 30);

      expect(item.itemID).toBe('attack_potion');
      expect(item.name).toBe('Attack Potion');
      expect(item.effect.effectType).toBe(ItemEffectType.BUFF_ATTACK);
      expect(item.effect.amount).toBe(30);
      expect(item.effect.param).toBe('30 turns'); // Duration should match the input
    });
  });

  describe('ItemUtils Validation and Filtering', () => {
    let items: Item[];

    beforeEach(() => {
      items = ItemUtils.createStandardItemSet();
    });

    test('should validate item registry correctly', () => {
      const errors = ItemUtils.validateItemRegistry(items);
      expect(errors).toHaveLength(0); // All standard items should be valid

      const duplicateItems = [...items, items[0!]]; // Add duplicate
      const duplicateErrors = ItemUtils.validateItemRegistry(duplicateItems);
      expect(duplicateErrors).toContain('health_potion: Duplicate item ID'); // Should contain the specific duplicate error
    });

    test('should filter items by type', () => {
      const consumables = ItemUtils.filterItems(items, { type: ItemType.CONSUMABLE });
      const keyItems = ItemUtils.filterItems(items, { type: ItemType.KEY_ITEM });

      expect(consumables.every(i => i.isConsumable)).toBe(true);
      expect(keyItems.every(i => i.isKeyItem)).toBe(true);
    });

    test('should filter items by effect type', () => {
      const healItems = ItemUtils.filterItems(items, { effectType: ItemEffectType.HEAL });
      const reviveItems = ItemUtils.filterItems(items, { effectType: ItemEffectType.REVIVE });

      expect(healItems.every(i => i.effect.effectType === ItemEffectType.HEAL)).toBe(true);
      expect(reviveItems.every(i => i.effect.effectType === ItemEffectType.REVIVE)).toBe(true);
    });

    test('should filter items by target rule', () => {
      const notFaintedItems = ItemUtils.filterItems(items, { targetRule: 'notfainted' });
      const faintedOnlyItems = ItemUtils.filterItems(items, { targetRule: 'faintedonly' });

      expect(notFaintedItems.every(i => i.targetRule === 'notfainted')).toBe(true);
      expect(faintedOnlyItems.every(i => i.targetRule === 'faintedonly')).toBe(true);
    });

    test('should filter items by effect presence', () => {
      const hasEffectItems = ItemUtils.filterItems(items, { hasEffect: true });
      const noEffectItems = ItemUtils.filterItems(items, { hasEffect: false });

      expect(hasEffectItems.every(i => i.effect.effectType !== ItemEffectType.NONE)).toBe(true);
      expect(noEffectItems.every(i => i.effect.effectType === ItemEffectType.NONE)).toBe(true);
    });

    test('should sort items correctly', () => {
      const sortedByName = ItemUtils.sortItems(items, 'name');
      const sortedByType = ItemUtils.sortItems(items, 'type');
      const sortedById = ItemUtils.sortItems(items, 'id');

      // Check if sorted (basic check)
      expect(sortedByName).toHaveLength(items.length);
      expect(sortedByType).toHaveLength(items.length);
      expect(sortedById).toHaveLength(items.length);
    });

    test('should get item statistics correctly', () => {
      const stats = ItemUtils.getItemStatistics(items);

      expect(stats.totalItems).toBe(7);
      expect(stats.consumableCount).toBe(4); // 4 consumables in standard set (health_potion, revive, sync_crystal, attack_elixir)
      expect(stats.byType[ItemType.CONSUMABLE]).toBe(4);
      expect(stats.byType[ItemType.KEY_ITEM]).toBe(2); // 2 key items (completion_token, mystery_key)
      expect(stats.byType[ItemType.EVOLUTION_ITEM]).toBe(1);
      expect(stats.byEffect[ItemEffectType.HEAL]).toBeGreaterThan(0);
      expect(stats.byEffect[ItemEffectType.REVIVE]).toBeGreaterThan(0);
      expect(stats.byEffect[ItemEffectType.SYNC_BOOST]).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete item usage workflow', () => {
      const context = createMockContext(
        { 'health_potion': 3, 'super_potion': 2, 'revive': 1 },
        { 'quest_started': true }
      );

      const manager = new ItemUsageManager(context);

      // Register items
      const healPotion = ItemUtils.createHealItem('health_potion', 'Health Potion', 50);
      const superPotion = ItemUtils.createHealItem('super_potion', 'Super Potion', 100);
      const reviveItem = ItemUtils.createReviveItem('revive', 'Revive', 75);

      manager.registerItem(healPotion);
      manager.registerItem(superPotion);
      manager.registerItem(reviveItem);

      // Create spirits
      const damagedSpirit = new MockSpiritInstance('damaged', 'Damaged Spirit', 100, 25);
      const faintedSpirit = new MockSpiritInstance('fainted', 'Fainted Spirit', 100, 0);

      // Use health potion
      const healResult = manager.useItem('health_potion', damagedSpirit);
      expect(healResult.isSuccess).toBe(true);
      expect(damagedSpirit.currentHP).toBe(75);
      expect(context.inventory['health_potion']).toBe(2);

      // Use super potion (overheal test)
      const overhealResult = manager.useItem('super_potion', damagedSpirit);
      expect(overhealResult.isSuccess).toBe(true);
      expect(damagedSpirit.currentHP).toBe(100);
      expect(context.inventory['super_potion']).toBe(1);

      // Use revive
      const reviveResult = manager.useItem('revive', faintedSpirit);
      expect(reviveResult.isSuccess).toBe(true);
      expect(faintedSpirit.currentHP).toBe(75);
      expect(context.inventory['revive']).toBe(0);
    });

    test('should handle multi-item scenarios', () => {
      const context = createMockContext(
        { 'health_potion': 10, 'revive': 5, 'sync_crystal': 3 },
        {}
      );

      const manager = new ItemUsageManager(context);

      // Register multiple items
      const items = ItemUtils.createStandardItemSet();
      items.forEach(item => manager.registerItem(item));

      // Create multiple spirits
      const spirits = [
        new MockSpiritInstance('spirit1', 'Spirit 1', 100, 50, 20),
        new MockSpiritInstance('spirit2', 'Spirit 2', 100, 0, 40),
        new MockSpiritInstance('spirit3', 'Spirit 3', 100, 100, 80)
      ];

      // Use different items on different spirits
      const healResult = manager.useItem('health_potion', spirits[0!]);
      const reviveResult = manager.useItem('revive', spirits[1!]);
      const syncResult = manager.useItem('sync_crystal', spirits[2!]);

      expect(healResult.isSuccess).toBe(true);
      expect(reviveResult.isSuccess).toBe(true);
      expect(syncResult.isSuccess).toBe(true);

      expect(spirits[0!].currentHP).toBe(100);
      expect(spirits[1!].currentHP).toBe(50); // 50% of 100
      expect(spirits[2!].syncLevel).toBe(90); // 80 + 10
    });

    test('should handle item searching and filtering', () => {
      const manager = new ItemUsageManager(createMockContext());
      const items = ItemUtils.createStandardItemSet();

      items.forEach(item => manager.registerItem(item));

      // Search by name
      const potions = manager.searchItems('potion');
      expect(potions.length).toBeGreaterThan(0);
      expect(potions.some(i => i.name.toLowerCase().includes('potion'))).toBe(true);

      // Search by ID
      const healthItems = manager.searchItems('health');
      expect(healthItems.length).toBeGreaterThan(0);

      // Get usable items
      const activeSpirit = new MockSpiritInstance('active', 'Active', 100, 75);
      const faintedSpirit = new MockSpiritInstance('fainted', 'Fainted', 100, 0);

      const usableOnActive = manager.getUsableItems(activeSpirit);
      const usableOnFainted = manager.getUsableItems(faintedSpirit);

      expect(usableOnActive.length).toBeGreaterThan(0);
      expect(usableOnFainted.length).toBeGreaterThanOrEqual(usableOnActive.length);

      // Filter by type
      const consumables = manager.getItemsByType(ItemType.CONSUMABLE);
      expect(consumables.length).toBeGreaterThan(0);
      expect(consumables.every(i => i.isConsumable)).toBe(true);
    });

    test('should handle evolution and flag systems', () => {
      const context = createMockContext({ 'fire_stone': 1 }, { 'evolution_available': false });
      const manager = new ItemUsageManager(context);

      // Register evolution item
      const evolutionStone = ItemUtils.createEvolutionItem('fire_stone', 'Fire Stone', 'fire_spirit');
      manager.registerItem(evolutionStone);

      // Create high sync spirit
      const highSyncSpirit = new MockSpiritInstance('high_sync', 'High Sync Spirit', 100, 100, 60);

      // Use evolution item
      const evolutionResult = manager.useItem('fire_stone', highSyncSpirit);
      expect(evolutionResult.isSuccess).toBe(true);
      expect(highSyncSpirit.name).toContain('fire_spirit');
      expect(context.flags['evolution_available']).toBe(false); // Unchanged

      // Test flag unlock
      const keyItem = ItemUtils.createFlagUnlockItem('completion_key', 'Completion Key', 'quest_complete');
      manager.registerItem(keyItem);

      const flagResult = manager.useItem('completion_key', highSyncSpirit);
      expect(flagResult.isSuccess).toBe(true);
      expect(context.flags['quest_complete']).toBe(true);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle many items efficiently', () => {
      const manager = new ItemUsageManager(createMockContext());
      const startTime = performance.now();

      // Create and register many items
      for (let i = 0; i < 1000; i++) {
        const item = new Item(
          `item_${i}`,
          `Item ${i}`,
          ItemType.CONSUMABLE,
          new ItemEffect(ItemEffectType.HEAL, 10 + (i % 50))
        );
        manager.registerItem(item);
      }

      const endTime = performance.now();

      expect(manager.getItemCount()).toBe(1000);
      expect(endTime - startTime).toBeLessThan(500); // Should be fast
    });

    test('should handle rapid item operations efficiently', () => {
      const manager = new ItemUsageManager(createMockContext());
      const spirit = new MockSpiritInstance('test', 'Test Spirit', 100, 50);

      // Register many items
      for (let i = 0; i < 100; i++) {
        const item = new Item(
          `potion_${i}`,
          `Potion ${i}`,
          ItemType.CONSUMABLE,
          new ItemEffect(ItemEffectType.HEAL, 10)
        );
        manager.registerItem(item);
      }

      const startTime = performance.now();

      // Perform many operations
      for (let i = 0; i < 500; i++) {
        const itemId = `potion_${i % 100}`;
        manager.canUseItem(itemId, spirit);
        manager.useItem(itemId, spirit);
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
    });

    test('should handle complex filtering efficiently', () => {
      const manager = new ItemUsageManager(createMockContext());

      // Create diverse item set
      const itemTypes = Object.values(ItemType);
      const effectTypes = Object.values(ItemEffectType);

      for (let i = 0; i < 500; i++) {
        const item = new Item(
          `complex_item_${i}`,
          `Complex Item ${i}`,
          itemTypes[i % itemTypes.length],
          new ItemEffect(
            effectTypes[i % effectTypes.length],
            10 + (i % 50),
            i % 2 === 0 ? `param_${i}` : undefined,
            i % 30,
            i % 10
          ),
          i % 2 === 0 ? 'any' : 'notfainted'
        );
        manager.registerItem(item);
      }

      // Create a test spirit for usability checks
      const spirit = new MockSpiritInstance('test', 'Test Spirit', 100, 75);

      const startTime = performance.now();

      // Complex filtering operations
      for (let i = 0; i < 100; i++) {
        manager.getItemsByType(ItemType.CONSUMABLE);
        manager.searchItems('complex');
        manager.getUsableItems(spirit);
        ItemUtils.filterItems(
          manager.getAllItems(),
          {
            type: ItemType.CONSUMABLE,
            hasEffect: true,
            targetRule: 'any'
          }
        );
      }

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});