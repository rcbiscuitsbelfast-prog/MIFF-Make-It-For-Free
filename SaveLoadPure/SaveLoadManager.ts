/*
  SaveLoadPure v1 - Engine-agnostic save/load manager with multi-slot, autosave, and rollback.
  - Schema v11: adds `saves` map and `currentSlot` to GameDataV11
  - Migration from v10: If input resembles v10 (no `saves`, but has xp/levels/etc), wrap it under saves["migrated-xp"].
*/

export type QuestStatus = 'Active' | 'Completed' | 'Failed';

// Minimal GameData V11 used by the CLI (extend safely in engine runtime)
export interface GameDataV11 {
  schemaVersion: 11;
  currentSlot: string;
  saves: Record<string, SaveSlot>;
  // Legacy fields (v10 and prior). Optional to support migration and inspection
  xp?: Array<{ id: string; xp: number }>;
  levels?: Array<{ id: string; state: { level: number; xp: number; nextLevelXp: number } }>;
  settings?: { musicVolume: number; sfxVolume: number; language: string; showSubtitles: boolean };
  quests?: Array<{ id: string; step: number; status: QuestStatus }>;
  inventory?: Array<{ id: string; quantity: number }>;
  [k: string]: any;
}

export interface SaveSlot {
  id: string;
  timestamp: number; // epoch ms
  data: GameDataV11; // snapshot of a full V11 state
  autosave?: boolean;
  rollbackCheckpoint?: GameDataV11;
}

export interface StorageAdapter {
  read(): Promise<unknown | null>;
  write(data: unknown): Promise<void>;
}

export class SaveLoadManager {
  private store: GameDataV11;
  private storage: StorageAdapter;

  private constructor(storage: StorageAdapter, initial: GameDataV11) {
    this.storage = storage;
    this.store = initial;
  }

  static async create(storage: StorageAdapter): Promise<SaveLoadManager> {
    const raw = await storage.read();
    const v11 = SaveLoadManager.migrateToV11(raw);
    return new SaveLoadManager(storage, v11);
  }

  // Migration: if input lacks `saves`, wrap legacy data into a migrated slot
  static migrateToV11(input: any): GameDataV11 {
    // New blank
    const newBlank = (): GameDataV11 => ({ schemaVersion: 11 as const, currentSlot: '', saves: {} });

    if (!input || typeof input !== 'object') return newBlank();

    if (input.schemaVersion === 11 && input.saves && typeof input.saves === 'object') {
      // Already v11
      return input as GameDataV11;
    }

    // Treat as legacy v10-ish data. Wrap into migrated-xp slot
    const migrated: GameDataV11 = newBlank();
    const slotId = 'migrated-xp';
    const snapshot: GameDataV11 = {
      schemaVersion: 11,
      currentSlot: slotId,
      saves: {},
      // copy known legacy fields (best-effort)
      xp: Array.isArray(input.xp) ? input.xp : [],
      levels: Array.isArray(input.levels) ? input.levels : [],
      settings: input.settings,
      quests: input.quests,
      inventory: input.inventory,
      // carry everything for transparency
      ...input,
    };
    migrated.saves[slotId] = {
      id: slotId,
      timestamp: Date.now(),
      data: snapshot,
      autosave: false,
    };
    migrated.currentSlot = slotId;
    return migrated;
  }

  get data(): GameDataV11 { return this.store; }

  async persist(): Promise<void> {
    await this.storage.write(this.store);
  }

  listSlots(): SaveSlot[] {
    return Object.values(this.store.saves).sort((a, b) => b.timestamp - a.timestamp);
  }

  load(slotId: string): GameDataV11 {
    const slot = this.store.saves[slotId];
    if (!slot) throw new Error(`Slot not found: ${slotId}`);
    this.store.currentSlot = slotId;
    // Return a deep-ish copy to avoid external mutation of store
    return JSON.parse(JSON.stringify(slot.data));
  }

  save(slotId: string): void {
    // Create snapshot of current logical state. For this CLI, we snapshot the currentSlot data if exists; otherwise blank
    const base = this.store.currentSlot && this.store.saves[this.store.currentSlot]
      ? this.store.saves[this.store.currentSlot].data
      : this.store;
    const snapshot: GameDataV11 = JSON.parse(JSON.stringify(base));
    snapshot.schemaVersion = 11;
    snapshot.currentSlot = slotId;
    snapshot.saves = {}; // avoid nesting saves within saves

    const now = Date.now();
    this.store.saves[slotId] = {
      id: slotId,
      timestamp: now,
      data: snapshot,
      autosave: this.store.saves[slotId]?.autosave,
      rollbackCheckpoint: this.store.saves[slotId]?.rollbackCheckpoint,
    };
    this.store.currentSlot = slotId;
  }

  delete(slotId: string): void {
    delete this.store.saves[slotId];
    if (this.store.currentSlot === slotId) this.store.currentSlot = '';
  }

  setRollback(slotId: string): void {
    const slot = this.store.saves[slotId];
    if (!slot) throw new Error(`Slot not found: ${slotId}`);
    slot.rollbackCheckpoint = JSON.parse(JSON.stringify(slot.data));
  }

  rollback(slotId: string): void {
    const slot = this.store.saves[slotId];
    if (!slot) throw new Error(`Slot not found: ${slotId}`);
    if (!slot.rollbackCheckpoint) throw new Error(`No rollback checkpoint set for: ${slotId}`);
    slot.data = JSON.parse(JSON.stringify(slot.rollbackCheckpoint));
    slot.timestamp = Date.now();
  }
}

