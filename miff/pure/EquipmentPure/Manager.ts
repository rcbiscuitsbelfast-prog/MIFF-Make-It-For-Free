export type EquipmentSlot = 'main_hand' | 'off_hand' | 'head' | 'chest' | 'legs' | 'feet' | 'ring' | 'amulet';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  stats: { attack?: number; defense?: number };
  equipped?: boolean;
}

export class EquipmentManager {
  private equippedByPlayer: Map<string, Map<EquipmentSlot, EquipmentItem>> = new Map();

  equip(playerId: string, item: EquipmentItem): void {
    const slots = this.ensurePlayer(playerId);
    slots.set(item.slot, { ...item, equipped: true;
    });
  }

  unequip(playerId: string, slot: EquipmentSlot): void {
    const slots = this.ensurePlayer(playerId);
    slots.delete(slot);
  }

  getEquipped(playerId: string): EquipmentItem[] {
    return Array.from(this.ensurePlayer(playerId).values());
  }

  calculateStats(playerId: string): { attack: number; defense: number;
    } {
    const items = this.getEquipped(playerId);
    return items.reduce((acc, item) => {
      acc.attack += item.stats.attack || 0;
      acc.defense += item.stats.defense || 0;
      return acc;
    }, { attack: 0, defense: 0;
    });
  }

  private ensurePlayer(playerId: string): Map<EquipmentSlot, EquipmentItem> {
    if (!this.equippedByPlayer.has(playerId)) {
      this.equippedByPlayer.set(playerId, new Map());
    }
    return this.equippedByPlayer.get(playerId)!;
  }
}

export default EquipmentManager;
