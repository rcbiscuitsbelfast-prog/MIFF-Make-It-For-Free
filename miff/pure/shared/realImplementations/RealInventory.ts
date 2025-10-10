/**
 * Real Inventory Implementation
 * 
 * Replaces mock inventory with actual inventory management functionality
 * for better test fidelity and real-world behavior validation.
 */

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  maxStack: number;
  properties: Record<string, any>;
}

export interface InventorySlot {
  item: InventoryItem | null;
  quantity: number;
}

export class RealInventory {
  private items: Map<string, InventorySlot> = new Map();
  private maxSlots: number = 100;
  private eventBus: any;

  constructor(eventBus: any) {
    this.eventBus = eventBus;
  }

  /**
   * Add item to inventory
   */
  addItem(itemId: string, quantity: number = 1, properties: Record<string, any> = {}): boolean {
    const existingSlot = this.items.get(itemId);
    
    if (existingSlot && existingSlot.item) {
      // Stack with existing item
      const maxAdd = Math.min(quantity, existingSlot.item.maxStack - existingSlot.quantity);
      if (maxAdd > 0) {
        existingSlot.quantity += maxAdd;
        this.eventBus?.emit('inventory-item-added', { itemId, quantity: maxAdd });
        return quantity - maxAdd === 0;
      }
    } else if (this.items.size < this.maxSlots) {
      // Create new slot
      this.items.set(itemId, {
        item: {
          id: itemId,
          name: `Item ${itemId}`,
          type: 'generic',
          quantity: 1,
          maxStack: 99,
          properties
        },
        quantity: Math.min(quantity, 99)
      });
      this.eventBus?.emit('inventory-item-added', { itemId, quantity: Math.min(quantity, 99) });
      return true;
    }
    
    return false;
  }

  /**
   * Remove item from inventory
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.items.get(itemId);
    if (!slot || slot.quantity < quantity) {
      return false;
    }
    
    slot.quantity -= quantity;
    if (slot.quantity <= 0) {
      this.items.delete(itemId);
    }
    
    this.eventBus?.emit('inventory-item-removed', { itemId, quantity });
    return true;
  }

  /**
   * Get item from inventory
   */
  getItem(itemId: string): InventorySlot | null {
    return this.items.get(itemId) || null;
  }

  /**
   * Get all items
   */
  getAllItems(): Map<string, InventorySlot> {
    return new Map(this.items);
  }

  /**
   * Check if inventory has space
   */
  hasSpace(): boolean {
    return this.items.size < this.maxSlots;
  }

  /**
   * Get inventory size
   */
  getSize(): number {
    return this.items.size;
  }

  /**
   * Clear inventory
   */
  clear(): void {
    this.items.clear();
    this.eventBus?.emit('inventory-cleared');
  }
}

// Export as mock for compatibility
export const realInventory = RealInventory;
export default RealInventory;