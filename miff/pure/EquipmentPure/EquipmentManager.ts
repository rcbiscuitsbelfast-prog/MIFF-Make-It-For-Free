/**
 * EquipmentPure Manager
 * 
 * Advanced equipment management system including stat modifiers,
 * equipment sets, durability, enchantments, and comprehensive equipment workflows.
 */

export interface StatModifier {
  stat: string;
  value: number;
  type: 'additive' | 'multiplicative' | 'percentage';
  source: string;
  metadata?: Record<string, any>;
}

export interface EquippedItem {
  id: string;
  name: string;
  slot: string;
  modifiers: StatModifier[];
  source: string;
  durability?: number;
  maxDurability?: number;
  enchantments?: Enchantment[];
  set?: string;
  rarity: ItemRarity;
  level: number;
  metadata?: Record<string, any>;
}

export interface Enchantment {
  id: string;
  name: string;
  level: number;
  effects: StatModifier[];
  duration?: number;
  metadata?: Record<string, any>;
}

export interface EquipmentSet {
  id: string;
  name: string;
  pieces: string[];
  bonuses: SetBonus[];
  metadata?: Record<string, any>;
}

export interface SetBonus {
  piecesRequired: number;
  bonuses: StatModifier[];
  description: string;
}

export interface EquipmentStats {
  totalItems: number;
  itemsBySlot: Record<string, number>;
  itemsByRarity: Record<ItemRarity, number>;
  totalModifiers: number;
  averageLevel: number;
  durability: number;
  enchantments: number;
}

export interface EquipmentFilter {
  slot?: string;
  rarity?: ItemRarity;
  minLevel?: number;
  maxLevel?: number;
  hasEnchantments?: boolean;
  hasSet?: boolean;
  minDurability?: number;
}

export interface EquipmentOutput {
  op: string;
  status: 'ok' | 'error';
  result?: EquippedItem | EquipmentStats | StatModifier[] | string;
  issues?: string[];
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Hooks {
  onEquip?: (item: EquippedItem) => void;
  onUnequip?: (slot: string, item?: EquippedItem) => void;
  onModifierApplied?: (modifier: StatModifier, item: EquippedItem) => void;
  onDurabilityChange?: (item: EquippedItem, oldDurability: number, newDurability: number) => void;
  onEnchantmentAdded?: (item: EquippedItem, enchantment: Enchantment) => void;
  onEnchantmentRemoved?: (item: EquippedItem, enchantmentId: string) => void;
  onSetBonusActivated?: (setId: string, bonus: SetBonus) => void;
}

export interface InventoryPort {
  getQuantity: (itemId: string) => number;
  addItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, quantity: number) => boolean;
}

export class EquipmentManager {
  private equipped = new Map<string, EquippedItem>();
  private equipmentSets = new Map<string, EquipmentSet>();
  private hooks: Hooks;
  private inventory?: InventoryPort;
  private stats: EquipmentStats;

  constructor(hooks: Hooks = {}, inventory?: InventoryPort) {
    this.hooks = hooks;
    this.inventory = inventory;
    this.stats = {
      totalItems: 0,
      itemsBySlot: {},
      itemsByRarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      },
      totalModifiers: 0,
      averageLevel: 0,
      durability: 0,
      enchantments: 0
    };
  }

  /**
   * Sync with inventory system
   */
  syncInventory(port: InventoryPort): EquipmentOutput {
    this.inventory = port;
    return {
      op: 'sync-inventory',
      status: 'ok',
      result: 'Inventory synced'
    };
  }

  /**
   * List all equipped slots
   */
  listSlots(): EquipmentOutput {
    return {
      op: 'list-slots',
      status: 'ok',
      result: Array.from(this.equipped.keys())
    };
  }

  /**
   * Get equipped item in slot
   */
  getEquipped(slot: string): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'get-equipped',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }
    return {
      op: 'get-equipped',
      status: 'ok',
      result: item
    };
  }

  /**
   * Get all stat modifiers from equipped items
   */
  getModifiers(): EquipmentOutput {
    const mods: StatModifier[] = [];
    for (const item of this.equipped.values()) {
      for (const modifier of item.modifiers) {
        mods.push({ ...modifier });
        this.hooks.onModifierApplied?.(modifier, item);
      }
    }
    return {
      op: 'get-modifiers',
      status: 'ok',
      result: mods
    };
  }

  /**
   * Equip an item
   */
  equip(itemId: string, slot: string, catalogLookup: (id: string) => Omit<EquippedItem, 'source'> | undefined): EquipmentOutput {
    const def = catalogLookup(itemId);
    if (!def) {
      return {
        op: 'equip',
        status: 'error',
        issues: [`Item not found: ${itemId}`]
      };
    }
    if (def.slot !== slot) {
      return {
        op: 'equip',
        status: 'error',
        issues: [`Item ${itemId} incompatible with slot ${slot}`]
      };
    }

    if (this.inventory) {
      const ok = this.inventory.removeItem(itemId, 1);
      if (!ok) {
        return {
          op: 'equip',
          status: 'error',
          issues: [`Not enough in inventory: ${itemId}`]
        };
      }
    }

    // Unequip existing in slot (return to inventory)
    const prev = this.equipped.get(slot);
    if (prev && this.inventory) {
      this.inventory.addItem(prev.id, 1);
    }

    const item: EquippedItem = { ...def, source: 'inventory' };
    this.equipped.set(slot, item);
    this.hooks.onEquip?.(item);
    this.updateStats();
    return {
      op: 'equip',
      status: 'ok',
      result: item
    };
  }

  /**
   * Unequip item from slot
   */
  unequip(slot: string): EquipmentOutput {
    const prev = this.equipped.get(slot);
    if (!prev) {
      return {
        op: 'unequip',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    if (this.inventory) {
      this.inventory.addItem(prev.id, 1);
    }
    this.equipped.delete(slot);
    this.hooks.onUnequip?.(slot, prev);
    this.updateStats();
    return {
      op: 'unequip',
      status: 'ok',
      result: `Item unequipped from ${slot}`
    };
  }

  /**
   * Add enchantment to item
   */
  addEnchantment(slot: string, enchantment: Enchantment): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'add-enchantment',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    if (!item.enchantments) {
      item.enchantments = [];
    }
    item.enchantments.push(enchantment);
    this.hooks.onEnchantmentAdded?.(item, enchantment);
    this.updateStats();
    return {
      op: 'add-enchantment',
      status: 'ok',
      result: item
    };
  }

  /**
   * Remove enchantment from item
   */
  removeEnchantment(slot: string, enchantmentId: string): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'remove-enchantment',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    if (!item.enchantments) {
      return {
        op: 'remove-enchantment',
        status: 'error',
        issues: [`No enchantments on item in slot ${slot}`]
      };
    }

    const index = item.enchantments.findIndex(e => e.id === enchantmentId);
    if (index === -1) {
      return {
        op: 'remove-enchantment',
        status: 'error',
        issues: [`Enchantment ${enchantmentId} not found`]
      };
    }

    item.enchantments.splice(index, 1);
    this.hooks.onEnchantmentRemoved?.(item, enchantmentId);
    this.updateStats();
    return {
      op: 'remove-enchantment',
      status: 'ok',
      result: item
    };
  }

  /**
   * Update item durability
   */
  updateDurability(slot: string, durability: number): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'update-durability',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    const oldDurability = item.durability || 0;
    item.durability = Math.max(0, Math.min(durability, item.maxDurability || 100));
    this.hooks.onDurabilityChange?.(item, oldDurability, item.durability);
    this.updateStats();
    return {
      op: 'update-durability',
      status: 'ok',
      result: item
    };
  }

  /**
   * Modify equipment stats
   */
  modifyEquipment(slot: string, modifications: {
    name?: string;
    modifiers?: StatModifier[];
    durability?: number;
    level?: number;
    rarity?: ItemRarity;
    enchantments?: Enchantment[];
  }): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'modify-equipment',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    // Apply modifications
    if (modifications.name !== undefined) {
      item.name = modifications.name;
    }

    if (modifications.modifiers !== undefined) {
      item.modifiers = modifications.modifiers;
    }

    if (modifications.durability !== undefined) {
      const oldDurability = item.durability || 0;
      item.durability = Math.max(0, Math.min(modifications.durability, item.maxDurability || 100));
      this.hooks.onDurabilityChange?.(item, oldDurability, item.durability);
    }

    if (modifications.level !== undefined) {
      item.level = Math.max(1, modifications.level);
    }

    if (modifications.rarity !== undefined) {
      item.rarity = modifications.rarity;
    }

    if (modifications.enchantments !== undefined) {
      item.enchantments = modifications.enchantments;
    }

    this.updateStats();
    return {
      op: 'modify-equipment',
      status: 'ok',
      result: item
    };
  }

  /**
   * Add equipment set
   */
  addEquipmentSet(set: EquipmentSet): EquipmentOutput {
    if (this.equipmentSets.has(set.id)) {
      return {
        op: 'add-equipment-set',
        status: 'error',
        issues: [`Equipment set ${set.id} already exists`]
      };
    }

    this.equipmentSets.set(set.id, set);
    return {
      op: 'add-equipment-set',
      status: 'ok',
      result: set
    };
  }

  /**
   * Remove equipment set
   */
  removeEquipmentSet(setId: string): EquipmentOutput {
    if (!this.equipmentSets.has(setId)) {
      return {
        op: 'remove-equipment-set',
        status: 'error',
        issues: [`Equipment set ${setId} does not exist`]
      };
    }

    this.equipmentSets.delete(setId);
    return {
      op: 'remove-equipment-set',
      status: 'ok',
      result: `Equipment set ${setId} removed`
    };
  }

  /**
   * Get active equipment sets and bonuses
   */
  getActiveSets(): EquipmentOutput {
    const activeSets: { set: EquipmentSet; activePieces: number; bonuses: SetBonus[] }[] = [];

    for (const set of this.equipmentSets.values()) {
      const activePieces = Array.from(this.equipped.values()).filter(item =>
        item.set === set.id
      ).length;

      const bonuses = set.bonuses.filter(bonus =>
        activePieces >= bonus.piecesRequired
      );

      activeSets.push({
        set,
        activePieces,
        bonuses
      });
    }

    return {
      op: 'get-active-sets',
      status: 'ok',
      result: activeSets
    };
  }

  /**
   * Get all stat modifiers including set bonuses
   */
  getAllModifiers(): EquipmentOutput {
    const mods = this.getModifiers().result as StatModifier[];
    const setBonuses = this.getActiveSets().result as { bonuses: SetBonus[] }[];

    for (const setData of setBonuses) {
      for (const bonus of setData.bonuses) {
        mods.push(...bonus.bonuses);
      }
    }

    return {
      op: 'get-all-modifiers',
      status: 'ok',
      result: mods
    };
  }

  /**
   * Compare equipment with another item
   */
  compareEquipment(slot: string, itemId: string, catalogLookup: (id: string) => Omit<EquippedItem, 'source'> | undefined): EquipmentOutput {
    const currentItem = this.equipped.get(slot);
    const newItem = catalogLookup(itemId);

    if (!newItem) {
      return {
        op: 'compare-equipment',
        status: 'error',
        issues: [`Item not found: ${itemId}`]
      };
    }

    const comparison: {
      current?: EquippedItem;
      new: Omit<EquippedItem, 'source'>;
      differences: Record<string, { current: any; new: any; change: string }>;
      recommendation: 'upgrade' | 'downgrade' | 'neutral';
    } = {
      current: currentItem,
      new: newItem,
      differences: {},
      recommendation: 'neutral'
    };

    // Compare each property
    const properties = ['name', 'level', 'rarity', 'durability', 'maxDurability'];
    for (const prop of properties) {
      if (currentItem?.[prop as keyof EquippedItem] !== newItem[prop as keyof typeof newItem]) {
        comparison.differences[prop] = {
          current: currentItem?.[prop as keyof EquippedItem],
          new: newItem[prop as keyof typeof newItem],
          change: currentItem?.[prop as keyof EquippedItem] ?
            (newItem[prop as keyof typeof newItem] > currentItem?.[prop as keyof EquippedItem] ? 'upgrade' : 'downgrade') :
            'new'
        };
      }
    }

    // Compare modifiers
    const currentModifiers = currentItem?.modifiers || [];
    const newModifiers = newItem.modifiers;

    for (const newMod of newModifiers) {
      const currentMod = currentModifiers.find(m => m.stat === newMod.stat);
      if (!currentMod || currentMod.value !== newMod.value) {
        comparison.differences[newMod.stat] = {
          current: currentMod?.value || 0,
          new: newMod.value,
          change: !currentMod ? 'new' : (newMod.value > currentMod.value ? 'upgrade' : 'downgrade')
        };
      }
    }

    // Determine recommendation
    const upgrades = Object.values(comparison.differences).filter(d => d.change === 'upgrade').length;
    const downgrades = Object.values(comparison.differences).filter(d => d.change === 'downgrade').length;

    if (upgrades > downgrades) {
      comparison.recommendation = 'upgrade';
    } else if (downgrades > upgrades) {
      comparison.recommendation = 'downgrade';
    }

    return {
      op: 'compare-equipment',
      status: 'ok',
      result: comparison
    };
  }

  /**
   * Get equipment preview (what if scenario)
   */
  previewEquipment(itemId: string, catalogLookup: (id: string) => Omit<EquippedItem, 'source'> | undefined): EquipmentOutput {
    const newItem = catalogLookup(itemId);

    if (!newItem) {
      return {
        op: 'preview-equipment',
        status: 'error',
        issues: [`Item not found: ${itemId}`]
      };
    }

    const preview: {
      originalStats: EquipmentStats;
      previewStats: EquipmentStats;
      changes: Record<string, number>;
    } = {
      originalStats: { ...this.stats },
      previewStats: { ...this.stats },
      changes: {}
    };

    // Calculate preview stats (simplified)
    const currentItems = Array.from(this.equipped.values());
    const totalItems = currentItems.length + 1;
    preview.previewStats.totalItems = totalItems;
    preview.previewStats.averageLevel = currentItems.reduce((acc, item) => acc + item.level, newItem.level) / totalItems;
    // For preview, we need to replace the item in the same slot, not add to total
    preview.previewStats.totalModifiers = currentItems.reduce((acc, item) => acc + item.modifiers.length, 0) + newItem.modifiers.length;

    // Track changes
    preview.changes.totalItems = totalItems - preview.originalStats.totalItems;
    preview.changes.averageLevel = preview.previewStats.averageLevel - preview.originalStats.averageLevel;
    preview.changes.totalModifiers = preview.previewStats.totalModifiers - preview.originalStats.totalModifiers;

    return {
      op: 'preview-equipment',
      status: 'ok',
      result: preview
    };
  }

  /**
   * Repair item durability
   */
  repairItem(slot: string, amount?: number): EquipmentOutput {
    const item = this.equipped.get(slot);
    if (!item) {
      return {
        op: 'repair',
        status: 'error',
        issues: [`No item equipped in slot ${slot}`]
      };
    }

    const repairAmount = amount || (item.maxDurability || 100);
    const oldDurability = item.durability || 0;
    item.durability = Math.min(repairAmount, item.maxDurability || 100);
    this.hooks.onDurabilityChange?.(item, oldDurability, item.durability);
    this.updateStats();
    return {
      op: 'repair',
      status: 'ok',
      result: item
    };
  }

  /**
   * Get equipment statistics
   */
  getStats(): EquipmentOutput {
    return {
      op: 'get-stats',
      status: 'ok',
      result: { ...this.stats }
    };
  }

  /**
   * List equipped items with filter
   */
  listEquipped(filter?: EquipmentFilter): EquipmentOutput {
    let items = Array.from(this.equipped.values());

    if (filter) {
      items = items.filter(item => {
        if (filter.slot && item.slot !== filter.slot) return false;
        if (filter.rarity && item.rarity !== filter.rarity) return false;
        if (filter.minLevel !== undefined && item.level < filter.minLevel) return false;
        if (filter.maxLevel !== undefined && item.level > filter.maxLevel) return false;
        if (filter.hasEnchantments !== undefined) {
          if (filter.hasEnchantments && (!item.enchantments || item.enchantments.length === 0)) return false;
          if (!filter.hasEnchantments && item.enchantments && item.enchantments.length > 0) return false;
        }
        if (filter.hasSet !== undefined) {
          if (filter.hasSet && !item.set) return false;
          if (!filter.hasSet && item.set) return false;
        }
        if (filter.minDurability !== undefined && (item.durability || 0) < filter.minDurability) return false;
        return true;
      });
    }

    return {
      op: 'list-equipped',
      status: 'ok',
      result: items
    };
  }

  /**
   * Export equipment data
   */
  exportEquipment(format: 'json' | 'manifest' | 'summary' | 'items' = 'json'): EquipmentOutput {
    const items = Array.from(this.equipped.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            items,
            stats: this.stats
          }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.equipment.export.v1',
            items,
            stats: this.stats,
            exportedAt: new Date().toISOString()
          }
        };
      
      case 'summary':
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: this.stats,
            totalItems: items.length,
            itemsBySlot: this.stats.itemsBySlot,
            itemsByRarity: this.stats.itemsByRarity
          }
        };
      
      case 'items':
        return {
          op: 'export',
          status: 'ok',
          result: {
            items,
            total: items.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset equipment system
   */
  resetEquipment(): EquipmentOutput {
    this.equipped.clear();
    this.equipmentSets.clear();
    this.stats = {
      totalItems: 0,
      itemsBySlot: {},
      itemsByRarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      },
      totalModifiers: 0,
      averageLevel: 0,
      durability: 0,
      enchantments: 0
    };
    return {
      op: 'reset',
      status: 'ok',
      result: 'Equipment system reset'
    };
  }

  /**
   * Private helper methods
   */
  private updateStats(): void {
    const items = Array.from(this.equipped.values());
    this.stats.totalItems = items.length;

    // Reset counts
    this.stats.itemsBySlot = {};
    this.stats.itemsByRarity = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0
    };

    // Count by slot and rarity
    items.forEach(item => {
      this.stats.itemsBySlot[item.slot] = (this.stats.itemsBySlot[item.slot] || 0) + 1;
      this.stats.itemsByRarity[item.rarity]++;
    });

    // Calculate totals
    this.stats.totalModifiers = items.reduce((acc, item) => acc + item.modifiers.length, 0);
    this.stats.averageLevel = items.length > 0 ? items.reduce((acc, item) => acc + item.level, 0) / items.length : 0;
    this.stats.durability = items.reduce((acc, item) => acc + (item.durability || 0), 0);
    this.stats.enchantments = items.reduce((acc, item) => acc + (item.enchantments?.length || 0), 0);
  }
}

