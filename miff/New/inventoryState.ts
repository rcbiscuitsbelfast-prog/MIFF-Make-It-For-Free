export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

const inventory: InventoryItem[] = [];

export function addItem(id: string, name: string, quantity = 1): void {
  const existing = inventory.find(item => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.push({ id, name, quantity });
  }
}

export function removeItem(id: string, quantity = 1): void {
  const item = inventory.find(i => i.id === id);
  if (item) {
    item.quantity -= quantity;
    if (item.quantity <= 0) {
      const index = inventory.indexOf(item);
      inventory.splice(index, 1);
    }
  }
}

export function listInventory(): InventoryItem[] {
  return [...inventory];
}
