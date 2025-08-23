export type StatModifier = { stat: string; value: number };

export type EquippedItem = {
  id: string;
  name: string;
  slot: string; // e.g., weapon, armor, mount
  modifiers: StatModifier[];
  source: string; // e.g., inventory id
};

export interface Hooks {
  onEquip?: (item: EquippedItem) => void;
  onUnequip?: (slot: string, item?: EquippedItem) => void;
  onModifierApplied?: (modifier: StatModifier, item: EquippedItem) => void;
}

export interface InventoryPort {
  getQuantity: (itemId: string) => number;
  addItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, quantity: number) => boolean;
}

export class EquipmentManager {
  private equipped = new Map<string, EquippedItem>();
  private hooks: Hooks;
  private inventory?: InventoryPort;

  constructor(hooks: Hooks = {}, inventory?: InventoryPort) {
    this.hooks = hooks;
    this.inventory = inventory;
  }

  syncInventory(port: InventoryPort) {
    this.inventory = port;
  }

  listSlots(): string[] { return Array.from(this.equipped.keys()); }

  getEquipped(slot: string): EquippedItem | undefined {
    return this.equipped.get(slot);
  }

  getModifiers(): StatModifier[] {
    const mods: StatModifier[] = [];
    for (const item of this.equipped.values()) {
      for (const m of item.modifiers) {
        mods.push({ stat: m.stat, value: m.value });
        this.hooks.onModifierApplied?.(m, item);
      }
    }
    return mods;
  }

  equip(itemId: string, slot: string, catalogLookup: (id: string) => Omit<EquippedItem, 'source'> | undefined): void {
    const def = catalogLookup(itemId);
    if (!def) throw new Error(`Item not found: ${itemId}`);
    if (def.slot !== slot) throw new Error(`Item ${itemId} incompatible with slot ${slot}`);

    if (this.inventory) {
      const ok = this.inventory.removeItem(itemId, 1);
      if (!ok) throw new Error(`Not enough in inventory: ${itemId}`);
    }

    // Unequip existing in slot (return to inventory)
    const prev = this.equipped.get(slot);
    if (prev && this.inventory) this.inventory.addItem(prev.id, 1);

    const item: EquippedItem = { ...def, source: 'inventory' };
    this.equipped.set(slot, item);
    this.hooks.onEquip?.(item);
  }

  unequip(slot: string): void {
    const prev = this.equipped.get(slot);
    if (!prev) return;
    if (this.inventory) this.inventory.addItem(prev.id, 1);
    this.equipped.delete(slot);
    this.hooks.onUnequip?.(slot, prev);
  }
}

