#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { EquipmentManager, EquippedItem, StatModifier } from './EquipmentManager';

type CatalogItem = Omit<EquippedItem, 'source'>;

type Cmd =
  | { op: 'listEquipment' }
  | { op: 'equip'; itemId: string; slot: string }
  | { op: 'unequip'; slot: string }
  | { op: 'dumpModifiers' }
  | { op: 'syncInventory' };

function main() {
  const catalogPath = process.argv[2] || 'EquipmentPure/sample_equipment.json';
  const commandsPath = process.argv[3] || '';
  const obj = JSON.parse(fs.readFileSync(path.resolve(catalogPath), 'utf-8')) as { items: CatalogItem[], inventory?: { id: string, quantity: number }[] };

  const inventory = new Map<string, number>();
  for (const e of obj.inventory || []) inventory.set(e.id, e.quantity);

  const invPort = {
    getQuantity: (id: string) => inventory.get(id) || 0,
    addItem: (id: string, q: number) => inventory.set(id, (inventory.get(id) || 0) + q),
    removeItem: (id: string, q: number) => {
      const n = inventory.get(id) || 0; if (n < q) return false; inventory.set(id, n - q); return true;
    },
  };

  const lookup = (id: string): CatalogItem | undefined => obj.items.find(i => i.id === id);
  const log: string[] = [];
  const mgr = new EquipmentManager({
    onEquip: (item) => log.push(`EQUIP ${item.id} -> ${item.slot}`),
    onUnequip: (slot, item) => log.push(`UNEQUIP ${slot}${item ? ' ' + item.id : ''}`),
    onModifierApplied: (m, item) => {/* trace modifiers on dump only */},
  }, invPort);

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'listEquipment' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'listEquipment') {
      const eq = ['weapon', 'armor', 'mount'].map(s => ({ slot: s, item: mgr.getEquipped(s) || null }));
      outputs.push({ op: 'listEquipment', equipped: eq });
    } else if (c.op === 'equip') {
      mgr.equip(c.itemId, c.slot, lookup);
      outputs.push({ op: 'equip', slot: c.slot, itemId: c.itemId });
    } else if (c.op === 'unequip') {
      mgr.unequip(c.slot);
      outputs.push({ op: 'unequip', slot: c.slot });
    } else if (c.op === 'dumpModifiers') {
      outputs.push({ op: 'dumpModifiers', modifiers: mgr.getModifiers() });
    } else if (c.op === 'syncInventory') {
      // no-op in this harness; inventory is already synced
      outputs.push({ op: 'syncInventory', inventory: Array.from(inventory.entries()).map(([id, quantity]) => ({ id, quantity })) });
    }
  }

  const out = { log, outputs, inventory: Array.from(inventory.entries()).map(([id, quantity]) => ({ id, quantity })) };
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();

