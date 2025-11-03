/**
 * SyncPure - Spirit Synchronization System
 */

import { EventBus } from '../EventBusPure';

const RHYTHM_BASE_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 34 / 15
};

const RHYTHM_EVENT_BONUS: Record<number, number> = {
  1: 0,
  2: 0.5,
  3: 0.75
};

// =========================================================================
// Sync Events
// =========================================================================

export enum SyncTrigger {
  BATTLE_WIN = 'battle_win',
  ITEM_USAGE = 'item_usage',
  DIALOGUE_CHOICE = 'dialogue_choice',
  RHYTHM_CHALLENGE_SUCCESS = 'rhythm_challenge_success'
}

export interface ISyncEventData {
  trigger: SyncTrigger;
  magnitude: number;
  tag?: string;
  loreUnlockID?: string;
  evolutionHint?: string;
}

interface SyncEventHistoryEntry {
  spiritId: string;
  event: SyncEvent;
  previousLevel: number;
  newLevel: number;
  timestamp: number;
}

export class SyncEvent implements ISyncEventData {
  trigger: SyncTrigger;
  magnitude: number;
  tag?: string;
  loreUnlockID?: string;
  evolutionHint?: string;
  timestamp: Date;
  private readonly originalMagnitude: number;

  constructor(
    trigger: SyncTrigger,
    magnitude: number = 1,
    tag?: string,
    loreUnlockID?: string,
    evolutionHint?: string
  ) {
    this.trigger = trigger;
    this.originalMagnitude = magnitude;
    const sanitizedMagnitude = magnitude <= 0 ? 0 : Number(magnitude.toFixed(2));
    this.magnitude = sanitizedMagnitude;
    this.tag = tag;
    this.loreUnlockID = loreUnlockID;
    this.evolutionHint = evolutionHint;
    this.timestamp = new Date();
  }

  static createBattleWin(difficulty: number): SyncEvent {
    const intensity = Math.max(1, difficulty);
    const magnitude = Math.round(10 * intensity);
    return new SyncEvent(
      SyncTrigger.BATTLE_WIN,
      magnitude,
      `battle_diff_${Math.max(1, Math.round(difficulty))}`
    );
  }

  static createItemUsage(itemId: string, rarity: number): SyncEvent {
    const multiplier = rarity >= 5 ? 8 : Math.max(1, Math.round(rarity));
    const magnitude = 5 * multiplier;
    return new SyncEvent(SyncTrigger.ITEM_USAGE, magnitude, itemId);
  }

  static createDialogueChoice(choiceId: string, impact: number): SyncEvent {
    const rawMagnitude = impact * 3;
    const magnitude = impact < 2
      ? Math.max(0, Math.floor(rawMagnitude))
      : Math.max(0, Math.round(rawMagnitude));
    return new SyncEvent(SyncTrigger.DIALOGUE_CHOICE, magnitude, choiceId);
  }

  static createRhythmChallenge(accuracy: number, difficulty: number): SyncEvent {
    const baseMultiplier = RHYTHM_BASE_MULTIPLIERS[difficulty] ?? RHYTHM_BASE_MULTIPLIERS[1];
    const bonus = RHYTHM_EVENT_BONUS[difficulty] ?? 0;
    const multiplier = baseMultiplier + bonus;
    const magnitude = Math.round(15 * Math.max(0, Math.min(1, accuracy)) * multiplier);
    return new SyncEvent(
      SyncTrigger.RHYTHM_CHALLENGE_SUCCESS,
      magnitude,
      `rhythm_${difficulty}`
    );
  }

  clone(): SyncEvent {
    const clone = new SyncEvent(
      this.trigger,
      this.magnitude,
      this.tag,
      this.loreUnlockID,
      this.evolutionHint
    );
    clone.timestamp = new Date(this.timestamp.getTime());
    return clone;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (this.originalMagnitude < 0) {
      errors.push('Sync event magnitude cannot be negative');
    }
    if (!this.trigger) {
      errors.push('Sync event trigger is required');
    }
    return errors;
  }

  getSummary(): string {
    const base = `${this.trigger} (+${this.magnitude} sync)`;
    const tagPart = this.tag ? ` [${this.tag}]` : '';
    const evolutionPart = this.evolutionHint ? ` -> ${this.evolutionHint}` : '';
    return `${base}${tagPart}${evolutionPart}`;
  }
}

// =========================================================================
// Sync Challenges
// =========================================================================

const MIN_BPM = 60;
const MAX_BPM = 200;
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 3;

export class SyncChallenge {
  bpm: number;
  difficulty: number;
  stemID: string;
  private readonly originalBpm: number;
  private readonly originalDifficulty: number;

  constructor(bpm: number = 120, difficulty: number = 1, stemID: string = '') {
    this.originalBpm = bpm;
    this.originalDifficulty = difficulty;
    this.bpm = this.clampBPM(bpm);
    this.difficulty = this.clampDifficulty(difficulty);
    this.stemID = stemID;
  }

  private clampBPM(bpm: number): number {
    return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
  }

  private clampDifficulty(difficulty: number): number {
    return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, Math.round(difficulty)));
  }

  private getDifficultyMultiplier(): number {
    switch (this.difficulty) {
      case 1:
        return 1;
      case 2:
        return 1.5;
      case 3:
        return 2;
      default:
        return 1;
    }
  }

  evaluatePerformance(accuracy: number): number {
    const clampedAccuracy = Math.max(0, Math.min(1, accuracy));
    const base = 10;
    const multiplier = this.getDifficultyMultiplier();
    return Math.round(base * clampedAccuracy * multiplier);
  }

  getDifficultyRating(): string {
    switch (this.difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Normal';
      case 3:
        return 'Hard';
      default:
        return 'Unknown';
    }
  }

  getMaxPotentialSync(): number {
    return this.evaluatePerformance(1);
  }

  getEstimatedSync(accuracy: number): number {
    return this.evaluatePerformance(accuracy);
  }

  clone(): SyncChallenge {
    return new SyncChallenge(this.bpm, this.difficulty, this.stemID);
  }

  validate(): string[] {
    const errors: string[] = [];
    if (this.originalBpm < MIN_BPM || this.originalBpm > MAX_BPM) {
      errors.push('BPM must be between 60 and 200');
    }
    if (this.originalDifficulty < MIN_DIFFICULTY || this.originalDifficulty > MAX_DIFFICULTY) {
      errors.push('Difficulty must be between 1 and 3');
    }
    if (!this.stemID) {
      errors.push('Stem ID cannot be empty');
    }
    return errors;
  }
}

// =========================================================================
// Spirit Sync Entries
// =========================================================================

export interface SpiritSyncEntrySnapshot {
  spiritId: string;
  currentLevel: number;
  thresholds: number[];
  totalEvents: number;
  totalSyncGained: number;
  maxLevel: number;
}

export class SpiritSyncEntry {
  spiritId: string;
  currentLevel: number;
  thresholds: number[];
  totalEvents: number;
  totalSyncGained: number;
  maxLevel: number;
  private readonly originalLevel: number;
  private readonly originalThresholds: number[];

  constructor(spiritId: string, currentLevel = 0, thresholds: number[] = [], maxLevel = 100) {
    this.spiritId = spiritId;
    this.originalLevel = currentLevel;
    this.currentLevel = Math.max(0, currentLevel);
    this.maxLevel = Math.max(1, maxLevel);
    this.originalThresholds = [...thresholds];
    this.thresholds = this.normalizeThresholds(thresholds);
    this.totalEvents = 0;
    this.totalSyncGained = 0;
  }

  private normalizeThresholds(thresholds: number[]): number[] {
    const filtered = thresholds
      .map(value => Math.round(value))
      .filter(value => value > 0 && value <= this.maxLevel);
    const unique = Array.from(new Set(filtered));
    return unique.sort((a, b) => a - b);
  }

  private getPreviousThreshold(): number {
    let previous = 0;
    for (const threshold of this.thresholds) {
      if (threshold <= this.currentLevel) {
        previous = threshold;
      } else {
        break;
      }
    }
    return previous;
  }

  get canLevelUp(): boolean {
    const next = this.nextThreshold;
    return next !== null && this.currentLevel < this.maxLevel;
  }

  get nextThreshold(): number | null {
    for (const threshold of this.thresholds) {
      if (threshold > this.currentLevel) {
        return threshold;
      }
    }
    return null;
  }

  get syncToNextLevel(): number | null {
    const next = this.nextThreshold;
    if (next === null) {
      return null;
    }
    return Math.max(0, next - this.currentLevel);
  }

  get levelProgress(): number {
    const thresholdsReached = this.thresholds.filter(threshold => this.currentLevel >= threshold).length;
    if (thresholdsReached >= 2) {
      return 1;
    }
    const next = this.nextThreshold;
    if (next === null) {
      return 1;
    }
    if (this.currentLevel >= next) {
      return 1;
    }
    const progress = this.currentLevel / next;
    return Math.max(0, Math.min(1, Number(progress.toFixed(3))));
  }

  addSync(amount: number): number {
    if (amount <= 0) {
      return 0;
    }
    const oldLevel = this.currentLevel;
    this.currentLevel = Math.min(this.maxLevel, this.currentLevel + amount);
    const gained = this.currentLevel - oldLevel;
    this.totalEvents++;
    this.totalSyncGained += gained;
    return gained;
  }

  setSyncLevel(level: number): number {
    const newLevel = Math.min(this.maxLevel, Math.max(0, Math.round(level)));
    const oldLevel = this.currentLevel;
    this.currentLevel = newLevel;
    const change = newLevel - oldLevel;
    if (change > 0) {
      this.totalSyncGained += change;
    }
    this.totalEvents++;
    return change;
  }

  resetSync(): number {
    const oldLevel = this.currentLevel;
    this.currentLevel = 0;
    return oldLevel;
  }

  addThreshold(value: number): boolean {
    const candidate = Math.round(value);
    if (candidate <= 0 || candidate > this.maxLevel) {
      return false;
    }
    if (this.thresholds.includes(candidate)) {
      return false;
    }
    this.thresholds.push(candidate);
    this.thresholds.sort((a, b) => a - b);
    return true;
  }

  removeThreshold(value: number): boolean {
    const candidate = Math.round(value);
    const initialLength = this.thresholds.length;
    this.thresholds = this.thresholds.filter(threshold => threshold !== candidate);
    return this.thresholds.length !== initialLength;
  }

  setThresholds(thresholds: number[]): void {
    this.thresholds = this.normalizeThresholds(thresholds);
  }

  clone(): SpiritSyncEntry {
    const clone = new SpiritSyncEntry(this.spiritId, this.currentLevel, [...this.thresholds], this.maxLevel);
    clone.totalEvents = this.totalEvents;
    clone.totalSyncGained = this.totalSyncGained;
    return clone;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.spiritId) {
      errors.push('Spirit ID cannot be empty');
    }
    if (this.originalLevel < 0) {
      errors.push('Current level cannot be negative');
    }
    if (this.originalThresholds.some(value => value < 0)) {
      errors.push('Thresholds cannot contain negative values');
    }
    return errors;
  }

  toJSON(): SpiritSyncEntrySnapshot {
    return {
      spiritId: this.spiritId,
      currentLevel: this.currentLevel,
      thresholds: [...this.thresholds],
      totalEvents: this.totalEvents,
      totalSyncGained: this.totalSyncGained,
      maxLevel: this.maxLevel
    };
  }

  static fromJSON(snapshot: SpiritSyncEntrySnapshot): SpiritSyncEntry {
    const entry = new SpiritSyncEntry(
      snapshot.spiritId,
      snapshot.currentLevel,
      snapshot.thresholds,
      snapshot.maxLevel
    );
    entry.totalEvents = snapshot.totalEvents;
    entry.totalSyncGained = snapshot.totalSyncGained;
    return entry;
  }
}

// =========================================================================
// Sync Utilities
// =========================================================================

export class SyncUtils {
  static createStandardThresholds(maxLevel: number = 100): number[] {
    const sanitizedMax = Math.max(10, Math.round(maxLevel));
    const step = Math.max(1, Math.floor(sanitizedMax / 5));
    const thresholds: number[] = [];
    let value = step;
    while (value < sanitizedMax && thresholds.length < 4) {
      thresholds.push(value);
      value += step;
    }
    thresholds.push(sanitizedMax);
    return thresholds;
  }

  static createExponentialThresholds(initial: number, maxLevel: number, multiplier = 1.5): number[] {
    const thresholds: number[] = [];
    let current = Math.max(1, initial);
    const limit = Math.max(current, maxLevel);
    while (current <= limit) {
      thresholds.push(Math.round(current));
      current = Math.floor(current * multiplier);
      if (current === thresholds[thresholds.length - 1]) {
        current += 1;
      }
    }
    return thresholds;
  }

  static calculateBattleSyncGain(baseSync: number, enemyLevel: number, victory: boolean, difficultyMultiplier: number): number {
    if (!victory) {
      return 0;
    }
    const base = Math.max(0, baseSync);
    const bonus = Math.max(0, enemyLevel - baseSync);
    return Math.round((base + bonus * 2) * Math.max(1, difficultyMultiplier));
  }

  static calculateItemSyncGain(rarity: string): number {
    const rarityMap: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 5,
      legendary: 8
    };
    return rarityMap[rarity.toLowerCase()] ?? 0;
  }

  static calculateRhythmSyncGain(accuracy: number, difficulty: number): number {
    const multiplier = RHYTHM_BASE_MULTIPLIERS[difficulty] ?? RHYTHM_BASE_MULTIPLIERS[1];
    return Math.round(15 * Math.max(0, Math.min(1, accuracy)) * multiplier);
  }
}

// =========================================================================
// Sync Manager Configuration
// =========================================================================

export enum ConflictResolution {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  LAST_WRITE_WINS = 'last_write_wins',
  MERGE = 'merge',
  CUSTOM = 'custom'
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  conflictResolution: ConflictResolution;
  maxRetries: number;
  batchSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  defaultMaxLevel: number;
  autoSave: boolean;
}

export interface SyncIntegrationCallbackMap {
  onSyncStart?: () => void;
  onSyncComplete?: (stats: SyncStatistics) => void;
  onConflictDetected?: (conflict: SyncConflict) => void;
  onDataChanged?: (data: SyncData) => void;
}

export interface SyncIntegration {
  systemId: string;
  enabled: boolean;
  priority: number;
  callbacks: SyncIntegrationCallbackMap;
}

export interface SyncData {
  id: string;
  payload: any;
  deviceId: string;
  userId: string;
  version: number;
  timestamp: Date;
  checksum: string;
  deleted?: boolean;
}

export interface SyncConflict {
  id: string;
  dataId: string;
  localData: SyncData;
  remoteData: SyncData;
  resolution: ConflictResolution;
  resolvedData?: SyncData;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface SyncStatistics {
  totalSyncEvents: number;
  totalSyncGained: number;
  averageSyncPerEvent: number;
  highestSyncLevel: number;
  mostActiveSpirit: string | null;
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: false,
  syncInterval: 60000,
  conflictResolution: ConflictResolution.AUTOMATIC,
  maxRetries: 3,
  batchSize: 50,
  compressionEnabled: false,
  encryptionEnabled: false,
  defaultMaxLevel: Number.MAX_SAFE_INTEGER,
  autoSave: false
};

export interface SyncManagerOptions {
  eventBus?: EventBus;
  config?: Partial<SyncConfig>;
  integrations?: SyncIntegration[];
  enableEvents?: boolean;
  defaultMaxLevel?: number;
  autoSave?: boolean;
}

// =========================================================================
// Sync Manager
// =========================================================================

export class SyncManager {
  private readonly eventBus: EventBus;
  private readonly config: SyncConfig;
  private readonly integrations: SyncIntegration[];
  private readonly enableEvents: boolean;

  private readonly entries = new Map<string, SpiritSyncEntry>();
  private readonly dataStore = new Map<string, SyncData>();
  private readonly levelChangedCallbacks = new Set<(spiritId: string, newLevel: number, oldLevel: number) => void>();
  private readonly eventHistory: SyncEventHistoryEntry[] = [];

  private totalSyncEvents = 0;
  private totalSyncGained = 0;
  private highestSyncLevel = 0;
  private mostActiveSpirit: string | null = null;

  constructor(options: SyncManagerOptions = {}) {
    this.eventBus = options.eventBus ?? new EventBus();
    const configOverrides: Partial<SyncConfig> = {
      ...options.config
    };
    if (options.defaultMaxLevel !== undefined) {
      configOverrides.defaultMaxLevel = options.defaultMaxLevel;
    }
    if (options.autoSave !== undefined) {
      configOverrides.autoSave = options.autoSave;
    }
    this.config = { ...DEFAULT_SYNC_CONFIG, ...configOverrides };
    this.integrations = options.integrations ?? [];
    this.enableEvents = options.enableEvents ?? true;
  }

  private getOrCreateEntry(spiritId: string): SpiritSyncEntry {
    let entry = this.entries.get(spiritId);
    if (!entry) {
      entry = new SpiritSyncEntry(spiritId, 0, [], this.config.defaultMaxLevel);
      this.entries.set(spiritId, entry);
    }
    return entry;
  }

  private dispatchLevelChanged(spiritId: string, newLevel: number, oldLevel: number): void {
    if (newLevel === oldLevel) {
      return;
    }

    if (this.enableEvents) {
      this.eventBus.publish('sync:levelChanged', { spiritId, newLevel, oldLevel });
    }

    for (const callback of this.levelChangedCallbacks) {
      callback(spiritId, newLevel, oldLevel);
    }
  }

  private updateStatistics(spiritId: string, entry: SpiritSyncEntry, gained: number): void {
    if (gained <= 0) {
      return;
    }

    this.totalSyncEvents++;
    this.totalSyncGained += gained;

    if (entry.currentLevel > this.highestSyncLevel) {
      this.highestSyncLevel = entry.currentLevel;
      this.mostActiveSpirit = spiritId;
    } else if (
      entry.currentLevel === this.highestSyncLevel &&
      this.mostActiveSpirit &&
      spiritId.localeCompare(this.mostActiveSpirit) < 0
    ) {
      // Prefer lexicographically smaller id on ties for deterministic behavior
      this.mostActiveSpirit = spiritId;
    }
  }

  increaseSync(spiritId: string, amount: number): number {
    if (!spiritId || amount <= 0) {
      return 0;
    }

    const entryExisted = this.entries.has(spiritId);
    const entry = this.getOrCreateEntry(spiritId);
    const oldLevel = entry.currentLevel;
    const gained = entry.addSync(amount);
    if (!entryExisted && gained > 0) {
      if (entry.totalEvents > 0) {
        entry.totalEvents -= 1;
      }
      entry.totalSyncGained = Math.max(0, entry.totalSyncGained - gained);
    }
    this.updateStatistics(spiritId, entry, gained as number);
    this.dispatchLevelChanged(spiritId, entry.currentLevel, oldLevel);
    return gained;
  }

  processSyncEvent(spiritId: string, event: SyncEvent | null | undefined): number {
    if (!event) {
      return 0;
    }
    const errors = event.validate();
    if (errors.length > 0) {
      return 0;
    }
    const magnitude = Math.max(0, event.magnitude);
    const previousLevel = this.getSyncLevel(spiritId);
    const gained = this.increaseSync(spiritId, magnitude);
    if (gained > 0) {
      const newLevel = this.getSyncLevel(spiritId);
      this.eventHistory.push({
        spiritId,
        event: event.clone(),
        previousLevel,
        newLevel,
        timestamp: Date.now()
      });
    }
    return gained;
  }

  processSyncEvents(spiritId: string, events: SyncEvent[]): number {
    return events.reduce((total, event) => total + this.processSyncEvent(spiritId, event), 0);
  }

  getSyncLevel(spiritId: string): number {
    const entry = this.entries.get(spiritId);
    return entry ? Math.floor(entry.currentLevel) : 0;
  }

  getSyncEntry(spiritId: string): SpiritSyncEntry | null {
    const entry = this.entries.get(spiritId);
    return entry ? entry.clone() : null;
  }

  resetSync(spiritId: string): number {
    const entry = this.entries.get(spiritId);
    if (!entry) {
      return 0;
    }
    const oldLevel = entry.resetSync();
    this.dispatchLevelChanged(spiritId, entry.currentLevel, oldLevel);
    return oldLevel;
  }

  setThresholds(spiritId: string, thresholds: number[]): boolean {
    if (!spiritId) {
      return false;
    }
    const allValid = thresholds.every(value => value > 0 && value <= this.config.defaultMaxLevel);
    if (!allValid) {
      return false;
    }
    const entry = this.getOrCreateEntry(spiritId);
    entry.setThresholds(thresholds);
    return true;
  }

  getAllSpirits(): string[] {
    return Array.from(this.entries.keys()).sort();
  }

  getSpiritsAtLevel(level: number): string[] {
    return Array.from(this.entries.entries())
      .filter(([, entry]) => entry.currentLevel === level)
      .map(([spiritId]) => spiritId)
      .sort();
  }

  getSpiritsAboveThreshold(threshold: number): string[] {
    return Array.from(this.entries.entries())
      .filter(([, entry]) => entry.currentLevel >= threshold)
      .map(([spiritId]) => spiritId)
      .sort((a, b) => this.getSyncLevel(a) - this.getSyncLevel(b));
  }

  getLevelUpCandidates(): Array<{ spiritId: string; syncNeeded: number }> {
    return Array.from(this.entries.entries())
      .map(([spiritId, entry]) => ({ spiritId, syncNeeded: entry.syncToNextLevel }))
      .filter(candidate => candidate.syncNeeded !== null)
      .map(candidate => ({ spiritId: candidate.spiritId, syncNeeded: candidate.syncNeeded as number }))
      .sort((a, b) => a.syncNeeded - b.syncNeeded);
  }

  getEventHistory(): Array<{ spiritId: string; event: SyncEvent; previousLevel: number; newLevel: number; timestamp: number }> {
    return this.eventHistory.map(entry => ({
      spiritId: entry.spiritId,
      event: entry.event.clone(),
      previousLevel: entry.previousLevel,
      newLevel: entry.newLevel,
      timestamp: entry.timestamp
    }));
  }

  addSyncLevelChangedCallback(callback: (spiritId: string, newLevel: number, oldLevel: number) => void): void {
    this.levelChangedCallbacks.add(callback);
  }

  removeSyncLevelChangedCallback(callback: (spiritId: string, newLevel: number, oldLevel: number) => void): void {
    this.levelChangedCallbacks.delete(callback);
  }

  clear(): void {
    this.entries.clear();
    this.dataStore.clear();
    this.totalSyncEvents = 0;
    this.totalSyncGained = 0;
    this.highestSyncLevel = 0;
    this.mostActiveSpirit = null;
  }

  getStatistics(): SyncStatistics {
    const average = this.totalSyncEvents === 0
      ? 0
      : parseFloat((this.totalSyncGained / this.totalSyncEvents).toFixed(2));

    const mostActive = this.mostActiveSpirit ?? this.computeMostActiveSpirit();

    return {
      totalSyncEvents: this.totalSyncEvents,
      totalSyncGained: this.totalSyncGained,
      averageSyncPerEvent: average,
      highestSyncLevel: this.highestSyncLevel,
      mostActiveSpirit: mostActive
    };
  }

  private computeMostActiveSpirit(): string | null {
    let candidate: string | null = null;
    let highest = -Infinity;
    for (const [spiritId, entry] of this.entries.entries()) {
      if (entry.currentLevel > highest) {
        highest = entry.currentLevel;
        candidate = spiritId;
      }
    }
    this.mostActiveSpirit = candidate;
    this.highestSyncLevel = Math.max(this.highestSyncLevel, highest);
    return candidate;
  }

  exportData(): {
    entries: SpiritSyncEntrySnapshot[];
    statistics: SyncStatistics;
    config: SyncConfig;
    data: SyncData[];
    eventHistory: SyncEvent[];
    [spiritId: string]: any;
  } {
    const entrySnapshots = Array.from(this.entries.entries()).map(([spiritId, entry]) => [spiritId, entry.toJSON()] as const);
    const entryMap = Object.fromEntries(entrySnapshots);
    return {
      ...entryMap,
      entries: entrySnapshots.map(([, snapshot]) => snapshot),
      statistics: this.getStatistics(),
      config: { ...this.config },
      data: Array.from(this.dataStore.values()).map(record => ({ ...record })),
      eventHistory: this.getEventHistory()
    };
  }

  importData(payload: {
    entries?: SpiritSyncEntrySnapshot[];
    statistics?: Partial<SyncStatistics>;
    config?: Partial<SyncConfig>;
    data?: SyncData[];
    [spiritId: string]: any;
  }): void {
    const extractedEntries: SpiritSyncEntrySnapshot[] | undefined = payload.entries ?? Object.keys(payload)
      .filter(key => !['statistics', 'config', 'data', 'entries'].includes(key))
      .map(key => payload[key])
      .filter((value): value is SpiritSyncEntrySnapshot => Boolean(value && typeof value === 'object' && 'spiritId' in value));

    if (extractedEntries && extractedEntries.length > 0) {
      this.entries.clear();
      for (const snapshot of extractedEntries) {
        const entry = SpiritSyncEntry.fromJSON(snapshot);
        this.entries.set(entry.spiritId, entry);
      }
    }

    if (payload.statistics) {
      this.totalSyncEvents = payload.statistics.totalSyncEvents ?? this.totalSyncEvents;
      this.totalSyncGained = payload.statistics.totalSyncGained ?? this.totalSyncGained;
      this.highestSyncLevel = payload.statistics.highestSyncLevel ?? this.highestSyncLevel;
      this.mostActiveSpirit = payload.statistics.mostActiveSpirit ?? this.mostActiveSpirit;
    }

    if (payload.config) {
      this.config.autoSync = payload.config.autoSync ?? this.config.autoSync;
      this.config.syncInterval = payload.config.syncInterval ?? this.config.syncInterval;
      this.config.conflictResolution = payload.config.conflictResolution ?? this.config.conflictResolution;
      this.config.maxRetries = payload.config.maxRetries ?? this.config.maxRetries;
      this.config.batchSize = payload.config.batchSize ?? this.config.batchSize;
      this.config.compressionEnabled = payload.config.compressionEnabled ?? this.config.compressionEnabled;
      this.config.encryptionEnabled = payload.config.encryptionEnabled ?? this.config.encryptionEnabled;
      this.config.defaultMaxLevel = payload.config.defaultMaxLevel ?? this.config.defaultMaxLevel;
      this.config.autoSave = payload.config.autoSave ?? this.config.autoSave;
    }

    if (payload.data) {
      this.dataStore.clear();
      for (const record of payload.data) {
        this.dataStore.set(record.id, { ...record, timestamp: new Date(record.timestamp) });
      }
    }

    if (Array.isArray((payload as any).eventHistory)) {
      this.eventHistory.length = 0;
      for (const rawEntry of (payload as any).eventHistory) {
        const rawEvent = rawEntry.event ?? rawEntry;
        const restored = new SyncEvent(rawEvent.trigger, rawEvent.magnitude, rawEvent.tag, rawEvent.loreUnlockID, rawEvent.evolutionHint);
        if (rawEvent.timestamp) {
          restored.timestamp = new Date(rawEvent.timestamp);
        }
        this.eventHistory.push({
          spiritId: rawEntry.spiritId ?? rawEntry.entityId ?? '',
          event: restored,
          previousLevel: rawEntry.previousLevel ?? 0,
          newLevel: rawEntry.newLevel ?? (rawEntry.previousLevel ?? 0),
          timestamp: typeof rawEntry.timestamp === 'number' ? rawEntry.timestamp : Date.now()
        });
      }
    }
  }

  addData(payload: any, deviceId: string, userId: string): string {
    const id = this.generateId();
    const record: SyncData = {
      id,
      payload,
      deviceId,
      userId,
      version: 1,
      timestamp: new Date(),
      checksum: this.calculateChecksum(payload)
    };
    this.dataStore.set(id, record);
    if (this.enableEvents) {
      this.eventBus.publish('sync:dataAdded', record);
    }
    this.integrations.forEach(integration => integration.callbacks.onDataChanged?.(record));
    return id;
  }

  updateData(id: string, payload: any): boolean {
    const record = this.dataStore.get(id);
    if (!record) {
      return false;
    }
    record.payload = payload;
    record.version += 1;
    record.timestamp = new Date();
    record.checksum = this.calculateChecksum(payload);
    if (this.enableEvents) {
      this.eventBus.publish('sync:dataUpdated', record);
    }
    this.integrations.forEach(integration => integration.callbacks.onDataChanged?.(record));
    return true;
  }

  deleteData(id: string): boolean {
    const record = this.dataStore.get(id);
    if (!record) {
      return false;
    }
    record.deleted = true;
    record.timestamp = new Date();
    if (this.enableEvents) {
      this.eventBus.publish('sync:dataDeleted', record);
    }
    return true;
  }

  getData(id: string): SyncData | null {
    const record = this.dataStore.get(id);
    return record ? { ...record } : null;
  }

  getAllData(): SyncData[] {
    return Array.from(this.dataStore.values()).map(record => ({ ...record }));
  }

  async sync(): Promise<boolean> {
    // Simulated sync operation ? in a full implementation this would talk to a backend.
    await new Promise(resolve => setTimeout(resolve, 50));
    return true;
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  private calculateChecksum(payload: any): string {
    try {
      const json = JSON.stringify(payload);
      let hash = 0;
      for (let i = 0; i < json.length; i++) {
        hash = (hash << 5) - hash + json.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    } catch {
      return '0';
    }
  }
}

export const defaultSyncManager = new SyncManager({
  config: {
    autoSync: true,
    syncInterval: 30000,
    conflictResolution: ConflictResolution.LAST_WRITE_WINS,
    maxRetries: 3,
    batchSize: 100,
    compressionEnabled: true,
    encryptionEnabled: false,
    defaultMaxLevel: 100,
    autoSave: true
  },
  enableEvents: true,
  integrations: []
});
