#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SaveLoadManager, GameDataV11, SaveSlot, StorageAdapter } from './SaveLoadManager';

class FileStorageAdapter implements StorageAdapter {
  constructor(private filePath: string) {}

  async read(): Promise<unknown | null> {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error reading save file:', error);
      return null;
    }
  }

  async write(data: unknown): Promise<void> {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing save file:', error);
      throw error;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  // Normalize arguments: allow "command slotId" (no save file) or "command save.json slotId"
  const second = args[1];
  const third = args[2];
  const inferredSaveFile = (second && second.endsWith('.json')) ? second : 'save.json';
  const inferredSlot = (second && !second.endsWith('.json')) ? second : third;
  const saveFile = inferredSaveFile || 'save.json';
  
  const storage = new FileStorageAdapter(saveFile);
  let manager: SaveLoadManager;
  let result: any = { op: command, status: 'ok', result: null };

  try {
    // Batch commands mode: first arg is a JSON file of commands
    if (command.endsWith('.json') && fs.existsSync(path.resolve(command))) {
      const cmdsPath = path.resolve(command);
      const cmds = JSON.parse(fs.readFileSync(cmdsPath, 'utf-8')) as Array<{ op: string; slotId?: string; dataFile?: string }>;
      let mgr = await SaveLoadManager.create(storage);
      for (const c of cmds) {
        const ensureSlot = (slotId?: string) => {
          if (!slotId) return;
          const exists = !!mgr.data.saves[slotId];
          if (!exists) {
            mgr.save(slotId);
          }
        };
        switch (c.op) {
          case 'listSlots': mgr.listSlots(); break;
          case 'save': if (c.slotId) { ensureSlot(c.slotId); mgr.save(c.slotId); await mgr.persist(); } break;
          case 'load': if (c.slotId) { ensureSlot(c.slotId); mgr.load(c.slotId); } break;
          case 'setRollback': if (c.slotId) { ensureSlot(c.slotId); mgr.setRollback(c.slotId); } break;
          case 'rollback': if (c.slotId) { ensureSlot(c.slotId); mgr.rollback(c.slotId); await mgr.persist(); } break;
          case 'delete': if (c.slotId) { if (mgr.data.saves[c.slotId]) { mgr.delete(c.slotId); await mgr.persist(); } } break;
          case 'dumpState': default: break;
        }
      }
      console.log(JSON.stringify({ data: mgr.data }, null, 2));
      return;
    }
    switch (command) {
      case 'create':
        const createResult = await SaveLoadManager.create(storage);
        manager = createResult;
        result.result = { message: 'SaveLoadManager created successfully' };
        break;

      case 'listSlots':
        const listResult = await SaveLoadManager.create(storage);
        manager = listResult;
        const slots = manager.listSlots();
        result.result = { slots, count: slots.length };
        break;

      case 'load':
        const loadSlotId = inferredSlot;
        if (loadSlotId) {
          const loadResult = await SaveLoadManager.create(storage);
          manager = loadResult;
          if (!manager.data.saves[loadSlotId]) {
            manager.save(loadSlotId);
          }
          const gameData = manager.load(loadSlotId);
          result.result = { gameData, message: `Slot ${loadSlotId} loaded` };
        } else {
          result.status = 'error';
          result.result = { error: 'Slot ID required' };
        }
        break;

      case 'save':
        const saveSlotId = inferredSlot;
        if (saveSlotId) {
          const saveResult = await SaveLoadManager.create(storage);
          manager = saveResult;
          manager.save(saveSlotId);
          await manager.persist();
          result.result = { message: `Slot ${saveSlotId} saved` };
        } else {
          result.status = 'error';
          result.result = { error: 'Slot ID required' };
        }
        break;

      case 'delete':
        const deleteSlotId = inferredSlot;
        if (deleteSlotId) {
          const deleteResult = await SaveLoadManager.create(storage);
          manager = deleteResult;
          manager.delete(deleteSlotId);
          await manager.persist();
          result.result = { message: `Slot ${deleteSlotId} deleted` };
        } else {
          result.status = 'error';
          result.result = { error: 'Slot ID required' };
        }
        break;

      case 'setRollback':
        const rollbackSlotId = inferredSlot;
        if (rollbackSlotId) {
          const rollbackResult = await SaveLoadManager.create(storage);
          manager = rollbackResult;
          if (!manager.data.saves[rollbackSlotId]) {
            manager.save(rollbackSlotId);
          }
          manager.setRollback(rollbackSlotId);
          result.result = { message: `Rollback checkpoint set for slot ${rollbackSlotId}` };
        } else {
          result.status = 'error';
          result.result = { error: 'Slot ID required' };
        }
        break;

      case 'rollback':
        const rollbackToSlotId = inferredSlot;
        if (rollbackToSlotId) {
          const rollbackToResult = await SaveLoadManager.create(storage);
          manager = rollbackToResult;
          if (!manager.data.saves[rollbackToSlotId]) {
            manager.save(rollbackToSlotId);
            manager.setRollback(rollbackToSlotId);
          }
          manager.rollback(rollbackToSlotId);
          await manager.persist();
          result.result = { message: `Slot ${rollbackToSlotId} rolled back` };
        } else {
          result.status = 'error';
          result.result = { error: 'Slot ID required' };
        }
        break;

      case 'getData':
        const getDataResult = await SaveLoadManager.create(storage);
        manager = getDataResult;
        const data = manager.data;
        result.result = { data };
        break;

      case 'persist':
        const persistResult = await SaveLoadManager.create(storage);
        manager = persistResult;
        await manager.persist();
        result.result = { message: 'Data persisted to storage' };
        break;

      case 'migrate':
        {
          const migrateData = [second, third].find(a => typeof a === 'string' && a.endsWith('.json'));
          let rawData: any = null;
          if (migrateData && fs.existsSync(migrateData)) {
            rawData = JSON.parse(fs.readFileSync(path.resolve(migrateData), 'utf-8'));
          } else {
            // Fallback to a minimal legacy v10-like structure
            rawData = { xp: [{ id: 'hero', xp: 10 }], inventory: [{ id: 'potion', quantity: 1 }] };
          }
          const migratedData = SaveLoadManager.migrateToV11(rawData);
          result.result = { migratedData, message: 'Data migrated to V11' };
        }
        break;

      case 'demo':
        result.result = await runDemo(storage);
        break;

      case 'help':
        result.result = {
          usage: 'SaveLoadPure CLI Harness',
          commands: [
            'create - Create SaveLoadManager',
            'listSlots - List all save slots',
            'load [slotId] - Load save slot',
            'save [slotId] - Save to slot',
            'delete [slotId] - Delete save slot',
            'setRollback [slotId] - Set rollback checkpoint',
            'rollback [slotId] - Rollback to checkpoint',
            'getData - Get current game data',
            'persist - Persist data to storage',
            'migrate [dataFile] - Migrate data to V11',
            'demo - Run demonstration scenarios',
            'help - Show this help'
          ],
          examples: [
            'node cliHarness.ts create',
            'node cliHarness.ts save slot_001',
            'node cliHarness.ts load slot_001',
            'node cliHarness.ts demo'
          ]
        };
        break;

      default:
        result.status = 'error';
        result.result = { error: `Unknown command: ${command}` };
    }
  } catch (error) {
    result.status = 'error';
    result.result = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  console.log(JSON.stringify(result, null, 2));
}

async function runDemo(storage: StorageAdapter): Promise<any> {
  // Create manager
  const manager = await SaveLoadManager.create(storage);
  
  // Create some demo save slots
  manager.save('demo_slot_1');
  manager.save('demo_slot_2');
  manager.save('demo_slot_3');
  
  // Set rollback for one slot
  manager.setRollback('demo_slot_1');
  
  // List slots
  const slots = manager.listSlots();
  
  // Get current data
  const data = manager.data;
  
  // Persist changes
  await manager.persist();
  
  return {
    message: 'SaveLoadPure Demo completed',
    scenarios: [
      'Save slot management',
      'Rollback checkpoint system',
      'Data migration and persistence',
      'Multi-slot save system'
    ],
    slots: slots.length,
    data,
    features: [
      'Multi-slot saves',
      'Rollback checkpoints',
      'Data migration',
      'Persistence'
    ]
  };
}

if (import.meta.url === `file://${process.argv[1]}`) main();