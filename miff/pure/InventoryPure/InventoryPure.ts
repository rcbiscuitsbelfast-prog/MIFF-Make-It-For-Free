/**
 * InventoryPure.ts
 * 
 * Inspired by Delta Engine's ECS component system and Torque persistence API.
 * Provides pure, remix-safe inventory and resource management for MIFF games.
 * 
 * Attribution: Delta Engine (MIT License) - ECS component system patterns
 * Attribution: Torque3D (MIT License) - persistence and serialization concepts
 */

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'currency';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weight: number;
  value: number;
  stackable: boolean;
  maxStack: number;
  properties: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ItemInstance {
  id: string;
  definitionId: string;
  quantity: number;
  durability?: number;
  maxDurability?: number;
  enchantments?: ItemEnchantment[];
  customProperties?: Record<string, any>;
  acquiredAt: number;
  lastUsed?: number;
}

export interface ItemEnchantment {
  id: string;
  name: string;
  type: 'damage' | 'defense' | 'utility' | 'special';
  magnitude: number;
  duration?: number; // -1 for permanent
  expiresAt?: number;
}

export interface InventoryComponent {
  entityId: string;
  maxWeight: number;
  maxSlots: number;
  items: Map<string, ItemInstance>;
  equipped: Map<string, string>; // slot -> itemId
  currency: Map<string, number>; // currencyType -> amount
  lastUpdated: number;
}

export interface InventorySystem {
  items: Map<string, ItemDefinition>;
  inventories: Map<string, InventoryComponent>;
  transactions: InventoryTransaction[];
  observers: InventoryObserver[];
}

export interface InventoryTransaction {
  id: string;
  type: 'add' | 'remove' | 'move' | 'equip' | 'unequip' | 'use' | 'split' | 'merge';
  entityId: string;
  itemId?: string;
  quantity?: number;
  fromSlot?: string;
  toSlot?: string;
  equipSlot?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface InventoryObserver {
  id: string;
  onItemAdded?: (transaction: InventoryTransaction) => void;
  onItemRemoved?: (transaction: InventoryTransaction) => void;
  onItemMoved?: (transaction: InventoryTransaction) => void;
  onItemEquipped?: (transaction: InventoryTransaction) => void;
  onItemUnequipped?: (transaction: InventoryTransaction) => void;
  onItemUsed?: (transaction: InventoryTransaction) => void;
}

export interface InventoryQuery {
  entityId?: string;
  itemType?: string;
  rarity?: string;
  minValue?: number;
  maxValue?: number;
  hasEnchantment?: string;
  customProperty?: { key: string; value: any };
}

export class InventoryManager {
  private system: InventorySystem;
  private transactionIdCounter: number;

  constructor() {
    this.system = {
      items: new Map(),
      inventories: new Map(),
      transactions: [],
      observers: []
    };
    this.transactionIdCounter = 0;
  }

  // Item Definition Management
  registerItem(definition: ItemDefinition): void {
    this.system.items.set(definition.id, definition);
  }

  getItemDefinition(itemId: string): ItemDefinition | undefined {
    return this.system.items.get(itemId);
  }

  getAllItemDefinitions(): ItemDefinition[] {
    return Array.from(this.system.items.values());
  }

  // Inventory Management
  createInventory(entityId: string, maxWeight: number = 100, maxSlots: number = 20): InventoryComponent {
    const inventory: InventoryComponent = {
      entityId,
      maxWeight,
      maxSlots,
      items: new Map(),
      equipped: new Map(),
      currency: new Map(),
      lastUpdated: Date.now()
    };

    this.system.inventories.set(entityId, inventory);
    return inventory;
  }

  getInventory(entityId: string): InventoryComponent | undefined {
    return this.system.inventories.get(entityId);
  }

  // Item Operations
  addItem(entityId: string, itemId: string, quantity: number = 1, slot?: string): boolean {
    const inventory = this.getInventory(entityId);
    const itemDef = this.getItemDefinition(itemId);
    
    if (!inventory || !itemDef) {
      return false;
    }

    // Check weight limit
    const currentWeight = this.calculateInventoryWeight(inventory);
    const newWeight = currentWeight + (itemDef.weight * quantity);
    
    if (newWeight > inventory.maxWeight) {
      return false;
    }

    // Check if item is stackable and already exists
    if (itemDef.stackable) {
      const existingItem = this.findItemInInventory(inventory, itemId);
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > itemDef.maxStack) {
          return false;
        }
        existingItem.quantity = newQty;
        this.recordTransaction('add', entityId, itemId, quantity, slot);
        return true;
      }
    }

    // Check slot availability
    if (slot && inventory.items.has(slot)) {
      return false; // Slot occupied
    }

    // Create new item instance
    const itemInstance: ItemInstance = {
      id: this.generateItemInstanceId(),
      definitionId: itemId,
      quantity,
      durability: itemDef.properties.durability,
      maxDurability: itemDef.properties.durability,
      acquiredAt: Date.now()
    };

    const targetSlot = slot || this.findEmptySlot(inventory);
    if (targetSlot) {
      inventory.items.set(targetSlot, itemInstance);
      inventory.lastUpdated = Date.now();
      this.recordTransaction('add', entityId, itemId, quantity, targetSlot);
      return true;
    }

    return false;
  }

  removeItem(entityId: string, slot: string, quantity?: number): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const item = inventory.items.get(slot);
    if (!item) return false;

    const itemDef = this.getItemDefinition(item.definitionId);
    if (!itemDef) return false;

    const removeQuantity = quantity || item.quantity;
    
    if (removeQuantity >= item.quantity) {
      // Remove entire item
      inventory.items.delete(slot);
      this.recordTransaction('remove', entityId, item.definitionId, item.quantity, slot);
    } else {
      // Reduce quantity
      item.quantity -= removeQuantity;
      this.recordTransaction('remove', entityId, item.definitionId, removeQuantity, slot);
    }

    inventory.lastUpdated = Date.now();
    return true;
  }

  moveItem(entityId: string, fromSlot: string, toSlot: string): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const item = inventory.items.get(fromSlot);
    if (!item) return false;

    // Check if destination slot is available
    if (inventory.items.has(toSlot)) {
      return false;
    }

    inventory.items.set(toSlot, item);
    inventory.items.delete(fromSlot);
    inventory.lastUpdated = Date.now();

    this.recordTransaction('move', entityId, item.definitionId, item.quantity, toSlot, fromSlot);
    return true;
  }

  equipItem(entityId: string, slot: string, equipSlot: string): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const item = inventory.items.get(slot);
    if (!item) return false;

    const itemDef = this.getItemDefinition(item.definitionId);
    if (!itemDef || !['weapon', 'armor'].includes(itemDef.type)) {
      return false;
    }

    // Unequip existing item in that slot
    const existingEquipped = inventory.equipped.get(equipSlot);
    if (existingEquipped) {
      inventory.equipped.delete(equipSlot);
    }

    inventory.equipped.set(equipSlot, item.id);
    this.recordTransaction('equip', entityId, item.definitionId, item.quantity, slot, undefined, equipSlot);
    return true;
  }

  unequipItem(entityId: string, equipSlot: string): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const equippedItemId = inventory.equipped.get(equipSlot);
    if (!equippedItemId) return false;

    inventory.equipped.delete(equipSlot);
    this.recordTransaction('unequip', entityId, undefined, undefined, undefined, undefined, equipSlot);
    return true;
  }

  useItem(entityId: string, slot: string): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const item = inventory.items.get(slot);
    if (!item) return false;

    const itemDef = this.getItemDefinition(item.definitionId);
    if (!itemDef || itemDef.type !== 'consumable') {
      return false;
    }

    // Reduce durability or quantity
    if (item.durability !== undefined) {
      item.durability = Math.max(0, item.durability - 1);
      if (item.durability === 0) {
        inventory.items.delete(slot);
      }
    } else {
      item.quantity--;
      if (item.quantity <= 0) {
        inventory.items.delete(slot);
      }
    }

    item.lastUsed = Date.now();
    inventory.lastUpdated = Date.now();

    this.recordTransaction('use', entityId, item.definitionId, 1, slot);
    return true;
  }

  // Currency Management
  addCurrency(entityId: string, currencyType: string, amount: number): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const currentAmount = inventory.currency.get(currencyType) || 0;
    inventory.currency.set(currencyType, currentAmount + amount);
    inventory.lastUpdated = Date.now();

    this.recordTransaction('add', entityId, currencyType, amount);
    return true;
  }

  removeCurrency(entityId: string, currencyType: string, amount: number): boolean {
    const inventory = this.getInventory(entityId);
    if (!inventory) return false;

    const currentAmount = inventory.currency.get(currencyType) || 0;
    if (currentAmount < amount) return false;

    inventory.currency.set(currencyType, currentAmount - amount);
    inventory.lastUpdated = Date.now();

    this.recordTransaction('remove', entityId, currencyType, amount);
    return true;
  }

  // Query and Search
  queryInventory(query: InventoryQuery): ItemInstance[] {
    const results: ItemInstance[] = [];

    for (const [entityId, inventory] of this.system.inventories) {
      if (query.entityId && entityId !== query.entityId) continue;

      for (const [slot, item] of inventory.items) {
        const itemDef = this.getItemDefinition(item.definitionId);
        if (!itemDef) continue;

        // Apply filters
        if (query.itemType && itemDef.type !== query.itemType) continue;
        if (query.rarity && itemDef.rarity !== query.rarity) continue;
        if (query.minValue !== undefined && itemDef.value < query.minValue) continue;
        if (query.maxValue !== undefined && itemDef.value > query.maxValue) continue;
        if (query.hasEnchantment && !item.enchantments?.some(e => e.id === query.hasEnchantment)) continue;
        if (query.customProperty && item.customProperties?.[query.customProperty.key] !== query.customProperty.value) continue;

        results.push({ ...item, id: `${entityId}:${slot}` });
      }
    }

    return results;
  }

  // Utility Methods
  calculateInventoryWeight(inventory: InventoryComponent): number {
    let totalWeight = 0;
    
    for (const [slot, item] of inventory.items) {
      const itemDef = this.getItemDefinition(item.definitionId);
      if (itemDef) {
        totalWeight += itemDef.weight * item.quantity;
      }
    }

    return totalWeight;
  }

  getInventorySpace(inventory: InventoryComponent): { used: number; total: number; available: number } {
    const used = inventory.items.size;
    const total = inventory.maxSlots;
    const available = total - used;

    return { used, total, available };
  }

  // Observer Management
  addObserver(observer: InventoryObserver): void {
    this.system.observers.push(observer);
  }

  removeObserver(observerId: string): void {
    const index = this.system.observers.findIndex(o => o.id === observerId);
    if (index > -1) {
      this.system.observers.splice(index, 1);
    }
  }

  // Transaction Recording
  private recordTransaction(
    type: InventoryTransaction['type'],
    entityId: string,
    itemId?: string,
    quantity?: number,
    toSlot?: string,
    fromSlot?: string,
    equipSlot?: string
  ): void {
    const transaction: InventoryTransaction = {
      id: `tx_${++this.transactionIdCounter}`,
      type,
      entityId,
      itemId,
      quantity,
      fromSlot,
      toSlot,
      equipSlot,
      timestamp: Date.now()
    };

    this.system.transactions.push(transaction);
    this.notifyObservers(transaction);
  }

  private notifyObservers(transaction: InventoryTransaction): void {
    this.system.observers.forEach(observer => {
      switch (transaction.type) {
        case 'add':
          observer.onItemAdded?.(transaction);
          break;
        case 'remove':
          observer.onItemRemoved?.(transaction);
          break;
        case 'move':
          observer.onItemMoved?.(transaction);
          break;
        case 'equip':
          observer.onItemEquipped?.(transaction);
          break;
        case 'unequip':
          observer.onItemUnequipped?.(transaction);
          break;
        case 'use':
          observer.onItemUsed?.(transaction);
          break;
      }
    });
  }

  // Helper Methods
  private findItemInInventory(inventory: InventoryComponent, itemId: string): ItemInstance | undefined {
    for (const [slot, item] of inventory.items) {
      if (item.definitionId === itemId) {
        return item;
      }
    }
    return undefined;
  }

  private findEmptySlot(inventory: InventoryComponent): string | undefined {
    for (let i = 0; i < inventory.maxSlots; i++) {
      const slot = `slot_${i}`;
      if (!inventory.items.has(slot)) {
        return slot;
      }
    }
    return undefined;
  }

  private generateItemInstanceId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistence (Torque-inspired)
  serialize(): string {
    const serializableSystem = {
      items: Object.fromEntries(this.system.items),
      inventories: Object.fromEntries(
        Array.from(this.system.inventories.entries()).map(([id, inv]) => [
          id,
          {
            ...inv,
            items: Object.fromEntries(inv.items),
            equipped: Object.fromEntries(inv.equipped),
            currency: Object.fromEntries(inv.currency)
          }
        ])
      ),
      transactions: this.system.transactions.slice(-100) // Keep last 100 transactions
    };

    return JSON.stringify(serializableSystem, null, 2);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    
    // Restore items
    this.system.items = new Map(Object.entries(parsed.items));
    
    // Restore inventories
    this.system.inventories = new Map(
      Object.entries(parsed.inventories).map(([id, inv]: [string, any]) => [
        id,
        {
          ...inv,
          items: new Map(Object.entries(inv.items)),
          equipped: new Map(Object.entries(inv.equipped)),
          currency: new Map(Object.entries(inv.currency))
        }
      ])
    );
    
    // Restore transactions
    this.system.transactions = parsed.transactions || [];
  }

  // Export for CLI usage
  getStats(): any {
    return {
      totalItems: this.system.items.size,
      totalInventories: this.system.inventories.size,
      totalTransactions: this.system.transactions.length,
      totalObservers: this.system.observers.length
    };
  }
}

// CLI interface
export function createInventoryManager(): InventoryManager {
  return new InventoryManager();
}

// Export for CLI usage
export default InventoryManager;