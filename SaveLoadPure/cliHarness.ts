#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { SaveLoadManager, GameDataV11, StorageAdapter } from './SaveLoadManager';

type Cmd =
  | { op: 'listSlots' }
  | { op: 'save'; slotId: string }
  | { op: 'load'; slotId: string }
  | { op: 'delete'; slotId: string }
  | { op: 'setRollback'; slotId: string }
  | { op: 'rollback'; slotId: string }
  | { op: 'dumpState' };

class FileStorage implements StorageAdapter {
  constructor(private filePath: string) {}
  async read(): Promise<unknown | null> {
    if (!fs.existsSync(this.filePath)) return null;
    const txt = fs.readFileSync(this.filePath, 'utf-8');
    try { return JSON.parse(txt); } catch { return null; }
  }
  async write(data: unknown): Promise<void> {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }
}

async function main() {
  const cmdsPath = process.argv[2];
  const saveFile = process.argv[3] || 'Assets/Resources/saves/save_state.json';
  if (!cmdsPath) {
    console.error('Usage: SaveLoadPure/cliHarness.ts <commands.json> [save_file.json]');
    process.exit(1);
  }
  const cmds: Cmd[] = JSON.parse(fs.readFileSync(path.resolve(cmdsPath), 'utf-8'));
  const mgr = await SaveLoadManager.create(new FileStorage(path.resolve(saveFile)));

  const log: string[] = [];

  for (const c of cmds) {
    if (c.op === 'listSlots') {
      const slots = mgr.listSlots();
      log.push(`SLOTS ${slots.map(s => s.id).join(',')}`);
    } else if (c.op === 'save') {
      mgr.save(c.slotId); log.push(`SAVE ${c.slotId}`);
      await mgr.persist();
    } else if (c.op === 'load') {
      const data = mgr.load(c.slotId); log.push(`LOAD ${c.slotId} v${data.schemaVersion}`);
    } else if (c.op === 'delete') {
      mgr.delete(c.slotId); log.push(`DEL ${c.slotId}`);
      await mgr.persist();
    } else if (c.op === 'setRollback') {
      mgr.setRollback(c.slotId); log.push(`SET_RB ${c.slotId}`);
      await mgr.persist();
    } else if (c.op === 'rollback') {
      mgr.rollback(c.slotId); log.push(`RB ${c.slotId}`);
      await mgr.persist();
    } else if (c.op === 'dumpState') {
      // no-op; the final output includes the current store
    }
  }

  const out = {
    log,
    data: mgr.data,
  };
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();

