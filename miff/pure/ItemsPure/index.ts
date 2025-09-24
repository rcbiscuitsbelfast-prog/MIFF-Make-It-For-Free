/**
 * ItemsPure - Item Management System
 * 
 * Comprehensive item management system for game items,
 * including creation, modification, and inventory operations.
 */

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'currency';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  stackable: boolean;
  maxStack: number;
  properties: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ItemInstance {
  itemId: string;
  quantity: number;
  durability?: number;
  maxDurability?: number;
  enchantments?: string[];
  customProperties?: Record<string, any>;
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
    this.items.set(item.id, item);
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

// Export default instance
export const defaultItemsManager = new ItemsManager();
export { ItemsManager as default };
