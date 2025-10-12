/**
 * SavePure - Game Save/Load System
 *
 * A comprehensive save and load system for handling game state persistence.
 * Features JSON serialization, checksum validation, version migration, and
 * remix-safe save data structures.
 *
 * @module SavePure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Supported save file versions
 */
export const SUPPORTED_VERSIONS = ['v1', 'v2', 'v3'] as const;
export type SaveVersion = typeof SUPPORTED_VERSIONS[number];

/**
 * Save validation result
 */
export interface SaveValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  version: string;
  checksumValid: boolean;
}

/**
 * Save migration result
 */
export interface SaveMigrationResult {
  snapshot: SaveSnapshot;
  warnings: string[];
  migrated: boolean;
  oldVersion: string;
  newVersion: string;
}

/**
 * Save/load operation result
 */
export interface SaveOperationResult {
  success: boolean;
  message: string;
  snapshot?: any;
  validationResult?: SaveValidationResult;
  migrationResult?: SaveMigrationResult;
  error?: Error;
}

/**
 * Game entity interface (for spirit instances)
 */
export interface IGameEntity {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: Record<string, number>;
  statusEffects: string[];
  [key: string]: any;
}

/**
 * Save snapshot interface - the core save data structure
 */
export interface ISaveSnapshot {
  version: SaveVersion;
  playerId: string;
  zoneId: string;
  timestampUtc: string;
  checksum?: string;
  partyRoster: IGameEntity[];
  inventory: Record<string, number>;
  questFlags: Record<string, boolean>;
  unlockedContent: string[];
  gameSettings: Record<string, any>;
  statistics: Record<string, number>;
  metadata: Record<string, any>;
  validate(): SaveValidationResult;
  computeChecksum(): string;
  clone(): ISaveSnapshot;
  toJSON(): Record<string, any>;
  getEstimatedSize(): number;
}

/**
 * Save manager interface
 */
export interface ISaveManager {
  saveGame(snapshot: ISaveSnapshot, filePath: string): Promise<SaveOperationResult>;
  loadGame(filePath: string): Promise<SaveOperationResult>;
  validateSnapshot(snapshot: ISaveSnapshot): SaveValidationResult;
  migrateSnapshot(snapshot: ISaveSnapshot, targetVersion?: SaveVersion): SaveMigrationResult;
  exportSnapshot(snapshot: ISaveSnapshot, format?: 'json' | 'binary'): Promise<Uint8Array>;
  importSnapshot(data: Uint8Array | string, format?: 'json' | 'binary'): Promise<SaveOperationResult>;
  createBackup(filePath: string, backupPath?: string): Promise<SaveOperationResult>;
  listSaveFiles(directory: string): Promise<string[]>;
  getSaveInfo(filePath: string): Promise<SaveOperationResult>;
}

/**
 * Save validator interface
 */
export interface ISaveValidator {
  validate(snapshot: ISaveSnapshot): SaveValidationResult;
  validateField(fieldName: string, value: any): boolean;
  validateVersion(version: string): boolean;
  validateChecksum(snapshot: ISaveSnapshot): boolean;
  getValidationRules(): Record<string, any>;
}

/**
 * Save migrator interface
 */
export interface ISaveMigrator {
  migrate(snapshot: ISaveSnapshot, targetVersion?: SaveVersion): SaveMigrationResult;
  canMigrate(fromVersion: string, toVersion: string): boolean;
  getMigrationPath(fromVersion: string, toVersion: string): string[];
  addMigrationStep(fromVersion: string, toVersion: string, migrationFn: (snapshot: ISaveSnapshot) => ISaveSnapshot): void;
  getSupportedVersions(): SaveVersion[];
}

/**
 * Compression utility interface
 */
export interface ICompressionUtil {
  compress(data: string): Promise<Uint8Array>;
  decompress(data: Uint8Array): Promise<string>;
  compressSync(data: string): Uint8Array;
  decompressSync(data: Uint8Array): string;
}

/**
 * Encryption utility interface
 */
export interface IEncryptionUtil {
  encrypt(data: string, key: string): Promise<string>;
  decrypt(data: string, key: string): Promise<string>;
  generateKey(): string;
  hash(data: string): Promise<string>;
}

/**
 * Save snapshot implementation
 */
export class SaveSnapshot implements ISaveSnapshot {
  public version: SaveVersion;
  public playerId: string;
  public zoneId: string;
  public timestampUtc: string;
  public checksum?: string;
  public partyRoster: IGameEntity[];
  public inventory: Record<string, number>;
  public questFlags: Record<string, boolean>;
  public unlockedContent: string[];
  public gameSettings: Record<string, any>;
  public statistics: Record<string, number>;
  public metadata: Record<string, any>;

  constructor(
    playerId: string = '',
    zoneId: string = 'newhaven',
    version: SaveVersion = 'v1'
  ) {
    this.version = version;
    this.playerId = playerId;
    this.zoneId = zoneId;
    this.timestampUtc = new Date().toISOString();
    this.partyRoster = [];
    this.inventory = {};
    this.questFlags = {};
    this.unlockedContent = [];
    this.gameSettings = {};
    this.statistics = {};
    this.metadata = {};
  }

  /**
   * Create save snapshot with default values
   */
  static create(
    playerId: string = '',
    zoneId: string = 'newhaven',
    version: SaveVersion = 'v1'
  ): SaveSnapshot {
    return new SaveSnapshot(playerId, zoneId, version);
  }

  /**
   * Create save snapshot from game state
   */
  static fromGameState(
    playerId: string,
    partyRoster: IGameEntity[] = [],
    inventory: Record<string, number> = {},
    questFlags: Record<string, boolean> = {},
    gameSettings: Record<string, any> = {},
    zoneId: string = 'newhaven'
  ): SaveSnapshot {
    const snapshot = new SaveSnapshot(playerId, zoneId);
    snapshot.partyRoster = [...partyRoster];
    snapshot.inventory = { ...inventory };
    snapshot.questFlags = { ...questFlags };
    snapshot.gameSettings = { ...gameSettings };
    snapshot.updateTimestamp();
    snapshot.computeChecksum();
    return snapshot;
  }

  /**
   * Update timestamp to current time
   */
  updateTimestamp(): void {
    this.timestampUtc = new Date().toISOString();
  }

  /**
   * Compute checksum for integrity validation
   */
  computeChecksum(): string {
    // Create hash from core fields excluding timestamp and existing checksum
    const hashData = `${this.version}|${this.playerId}|${this.zoneId}|${this.partyRoster.length}|${Object.keys(this.inventory).length}|${Object.keys(this.questFlags).length}|${this.unlockedContent.length}`;

    // Simple hash function for demo - in production use crypto.subtle or similar
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    this.checksum = btoa(Math.abs(hash).toString(36));
    return this.checksum;
  }

  /**
   * Validate save snapshot
   */
  validate(): SaveValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check required fields
    if (!this.playerId || this.playerId.trim() === '') {
      errors.push('Player ID is required');
    }

    if (!this.zoneId || this.zoneId.trim() === '') {
      errors.push('Zone ID is required');
    }

    if (!this.version || !SUPPORTED_VERSIONS.includes(this.version)) {
      errors.push(`Unsupported version: ${this.version}`);
    }

    // Check data integrity
    if (!this.partyRoster || !Array.isArray(this.partyRoster)) {
      errors.push('Party roster must be an array');
    } else {
      // Validate party members
      for (let i = 0; i < this.partyRoster.length; i++) {
        const member = this.partyRoster[i];
        if (!member.id || !member.name) {
          warnings.push(`Party member ${i} is missing required fields`);
        }
        if (member.hp < 0 || member.maxHp <= 0) {
          warnings.push(`Party member ${member.name} has invalid HP values`);
        }
      }
    }

    if (!this.inventory || typeof this.inventory !== 'object') {
      errors.push('Inventory must be an object');
    }

    if (!this.questFlags || typeof this.questFlags !== 'object') {
      errors.push('Quest flags must be an object');
    }

    if (!Array.isArray(this.unlockedContent)) {
      errors.push('Unlocked content must be an array');
    }

    // Check checksum
    const expectedChecksum = this.computeChecksum();
    const checksumValid = this.checksum === expectedChecksum;

    if (!checksumValid) {
      warnings.push('Checksum mismatch - data may have been corrupted');
    }

    // Check metadata
    if (this.metadata && typeof this.metadata !== 'object') {
      errors.push('Metadata must be an object');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      version: this.version,
      checksumValid
    };
  }

  /**
   * Clone save snapshot
   */
  clone(): SaveSnapshot {
    const cloned = new SaveSnapshot(this.playerId, this.zoneId, this.version);
    cloned.timestampUtc = this.timestampUtc;
    cloned.checksum = this.checksum;
    cloned.partyRoster = PerformanceOptimizer.optimizeObjectCloning(this.partyRoster, true).result;
    cloned.inventory = { ...this.inventory };
    cloned.questFlags = { ...this.questFlags };
    cloned.unlockedContent = [...this.unlockedContent];
    cloned.gameSettings = PerformanceOptimizer.optimizeObjectCloning(this.gameSettings, true).result;
    cloned.statistics = { ...this.statistics };
    cloned.metadata = PerformanceOptimizer.optimizeObjectCloning(this.metadata, true).result;
    return cloned;
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      version: this.version,
      playerId: this.playerId,
      zoneId: this.zoneId,
      timestampUtc: this.timestampUtc,
      checksum: this.checksum,
      partyRoster: this.partyRoster,
      inventory: this.inventory,
      questFlags: this.questFlags,
      unlockedContent: this.unlockedContent,
      gameSettings: this.gameSettings,
      statistics: this.statistics,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): SaveSnapshot {
    const snapshot = new SaveSnapshot(
      data.playerId || '',
      data.zoneId || 'newhaven',
      (data.version as SaveVersion) || 'v1'
    );

    snapshot.timestampUtc = data.timestampUtc || new Date().toISOString();
    snapshot.checksum = data.checksum;
    snapshot.partyRoster = Array.isArray(data.partyRoster) ? data.partyRoster : [];
    snapshot.inventory = typeof data.inventory === 'object' && data.inventory ? data.inventory : {};
    snapshot.questFlags = typeof data.questFlags === 'object' && data.questFlags ? data.questFlags : {};
    snapshot.unlockedContent = Array.isArray(data.unlockedContent) ? data.unlockedContent : [];
    snapshot.gameSettings = typeof data.gameSettings === 'object' && data.gameSettings ? data.gameSettings : {};
    snapshot.statistics = typeof data.statistics === 'object' && data.statistics ? data.statistics : {};
    snapshot.metadata = typeof data.metadata === 'object' && data.metadata ? data.metadata : {};

    return snapshot;
  }

  /**
   * Get estimated size in bytes
   */
  getEstimatedSize(): number {
    return JSON.stringify(this.toJSON()).length;
  }

  /**
   * Add party member
   */
  addPartyMember(entity: IGameEntity): void {
    this.partyRoster.push({ ...entity });
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Remove party member
   */
  removePartyMember(entityId: string): boolean {
    const index = this.partyRoster.findIndex(member => member.id === entityId);
    if (index >= 0) {
      this.partyRoster.splice(index, 1);
      this.updateTimestamp();
      this.computeChecksum();
      return true;
    }
    return false;
  }

  /**
   * Update party member
   */
  updatePartyMember(entityId: string, updates: Partial<IGameEntity>): boolean {
    const member = this.partyRoster.find(m => m.id === entityId);
    if (member) {
      // Optimized: Use PerformanceOptimizer.optimizeObjectMerging
    // Original: Object.assign(member, updates)
    PerformanceOptimizer.optimizeObjectMerging(member, updates).result;
      this.updateTimestamp();
      this.computeChecksum();
      return true;
    }
    return false;
  }

  /**
   * Add inventory item
   */
  addInventoryItem(itemId: string, quantity: number = 1): void {
    this.inventory[itemId] = (this.inventory[itemId] || 0) + quantity;
    if (this.inventory[itemId] <= 0) {
      delete this.inventory[itemId];
    }
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Remove inventory item
   */
  removeInventoryItem(itemId: string, quantity: number = 1): boolean {
    const currentQuantity = this.inventory[itemId] || 0;
    if (currentQuantity >= quantity) {
      this.inventory[itemId] -= quantity;
      if (this.inventory[itemId] <= 0) {
        delete this.inventory[itemId];
      }
      this.updateTimestamp();
      this.computeChecksum();
      return true;
    }
    return false;
  }

  /**
   * Set quest flag
   */
  setQuestFlag(flagId: string, value: boolean): void {
    this.questFlags[flagId] = value;
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Unlock content
   */
  unlockContent(contentId: string): void {
    if (!this.unlockedContent.includes(contentId)) {
      this.unlockedContent.push(contentId);
      this.updateTimestamp();
      this.computeChecksum();
    }
  }

  /**
   * Check if content is unlocked
   */
  isContentUnlocked(contentId: string): boolean {
    return this.unlockedContent.includes(contentId);
  }

  /**
   * Update game statistics
   */
  updateStatistic(statId: string, value: number): void {
    this.statistics[statId] = value;
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Get game statistic
   */
  getStatistic(statId: string): number {
    return this.statistics[statId] || 0;
  }

  /**
   * Set game setting
   */
  setGameSetting(settingId: string, value: any): void {
    this.gameSettings[settingId] = value;
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Get game setting
   */
  getGameSetting(settingId: string): any {
    return this.gameSettings[settingId];
  }

  /**
   * Add metadata
   */
  addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
    this.updateTimestamp();
    this.computeChecksum();
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): any {
    return this.metadata[key];
  }

  /**
   * Get save summary for display
   */
  getSummary(): Record<string, any> {
    return {
      playerId: this.playerId,
      zoneId: this.zoneId,
      version: this.version,
      timestamp: this.timestampUtc,
      partySize: this.partyRoster.length,
      inventoryItems: Object.keys(this.inventory).length,
      questFlags: Object.keys(this.questFlags).length,
      unlockedContent: this.unlockedContent.length,
      totalPlayTime: this.statistics['totalPlayTime'] || 0,
      saveSize: this.getEstimatedSize()
    };
  }
}

/**
 * Save validator implementation
 */
export class SaveValidator implements ISaveValidator {
  private readonly supportedVersions: Set<SaveVersion>;

  constructor(supportedVersions: SaveVersion[] = [...SUPPORTED_VERSIONS]) {
    this.supportedVersions = new Set(supportedVersions);
  }

  /**
   * Validate save snapshot
   */
  validate(snapshot: ISaveSnapshot): SaveValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!snapshot) {
      errors.push('Snapshot is null or undefined');
      return { isValid: false, warnings, errors, version: 'unknown', checksumValid: false };
    }

    // Version validation
    if (!snapshot.version || !this.supportedVersions.has(snapshot.version)) {
      errors.push(`Unsupported version: ${snapshot.version}`);
    }

    // Required field validation
    if (!snapshot.playerId || snapshot.playerId.trim() === '') {
      errors.push('Player ID is required');
    }

    if (!snapshot.zoneId || snapshot.zoneId.trim() === '') {
      errors.push('Zone ID is required');
    }

    if (!Array.isArray(snapshot.partyRoster)) {
      errors.push('Party roster must be an array');
    }

    if (typeof snapshot.inventory !== 'object' || snapshot.inventory === null) {
      errors.push('Inventory must be an object');
    }

    if (typeof snapshot.questFlags !== 'object' || snapshot.questFlags === null) {
      errors.push('Quest flags must be an object');
    }

    if (!Array.isArray(snapshot.unlockedContent)) {
      errors.push('Unlocked content must be an array');
    }

    // Data integrity warnings
    if (snapshot.partyRoster && Array.isArray(snapshot.partyRoster)) {
      snapshot.partyRoster.forEach((member, index) => {
        if (!member.id) {
          warnings.push(`Party member ${index} missing ID`);
        }
        if (member.hp < 0) {
          warnings.push(`Party member ${member.name || `member_${index}`} has negative HP`);
        }
        if (member.maxHp <= 0) {
          warnings.push(`Party member ${member.name || `member_${index}`} has invalid max HP`);
        }
      });
    }

    // Checksum validation
    let checksumValid = false;
    if (snapshot.checksum) {
      const expectedChecksum = snapshot.computeChecksum();
      checksumValid = snapshot.checksum === expectedChecksum;
      if (!checksumValid) {
        warnings.push('Checksum mismatch detected');
      }
    } else {
      warnings.push('No checksum present');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      version: snapshot.version,
      checksumValid
    };
  }

  /**
   * Validate specific field
   */
  validateField(fieldName: string, value: any): boolean {
    switch (fieldName) {
      case 'playerId':
      case 'zoneId':
        return typeof value === 'string' && value.trim().length > 0;
      case 'version':
        return typeof value === 'string' && SUPPORTED_VERSIONS.includes(value as SaveVersion);
      case 'partyRoster':
        return Array.isArray(value);
      case 'inventory':
      case 'questFlags':
      case 'gameSettings':
      case 'metadata':
        return typeof value === 'object' && value !== null;
      case 'unlockedContent':
      case 'statistics':
        return Array.isArray(value);
      case 'timestampUtc':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      case 'checksum':
        return typeof value === 'string' && value.length > 0;
      default:
        return true; // Unknown fields are allowed
    }
  }

  /**
   * Validate version string
   */
  validateVersion(version: string): boolean {
    return this.supportedVersions.has(version as SaveVersion);
  }

  /**
   * Validate checksum
   */
  validateChecksum(snapshot: ISaveSnapshot): boolean {
    if (!snapshot.checksum) return false;

    const expectedChecksum = snapshot.computeChecksum();
    return snapshot.checksum === expectedChecksum;
  }

  /**
   * Get validation rules
   */
  getValidationRules(): Record<string, any> {
    return {
      supportedVersions: [...this.supportedVersions],
      requiredFields: ['playerId', 'zoneId', 'version', 'partyRoster', 'inventory', 'questFlags', 'unlockedContent'],
      optionalFields: ['checksum', 'timestampUtc', 'gameSettings', 'statistics', 'metadata'],
      fieldTypes: {
        playerId: 'string',
        zoneId: 'string',
        version: 'string',
        timestampUtc: 'string',
        checksum: 'string',
        partyRoster: 'array',
        inventory: 'object',
        questFlags: 'object',
        unlockedContent: 'array',
        gameSettings: 'object',
        statistics: 'object',
        metadata: 'object'
      }
    };
  }

  /**
   * Add supported version
   */
  addSupportedVersion(version: SaveVersion): void {
    this.supportedVersions.add(version);
  }

  /**
   * Remove supported version
   */
  removeSupportedVersion(version: SaveVersion): void {
    this.supportedVersions.delete(version);
  }
}

/**
 * Save migrator implementation
 */
export class SaveMigrator implements ISaveMigrator {
  private readonly migrationSteps = new Map<string, (snapshot: ISaveSnapshot) => ISaveSnapshot>();
  private readonly supportedVersions: Set<SaveVersion>;

  constructor(supportedVersions: SaveVersion[] = [...SUPPORTED_VERSIONS]) {
    this.supportedVersions = new Set(supportedVersions);
    this.initializeMigrationSteps();
  }

  /**
   * Initialize migration steps
   */
  private initializeMigrationSteps(): void {
    // v0 -> v1 migration
    this.addMigrationStep('v0', 'v1', (snapshot: ISaveSnapshot) => {
      // Add zoneId if missing
      if (!snapshot.zoneId || snapshot.zoneId.trim() === '') {
        snapshot.zoneId = 'newhaven';
      }

      // Add quest flags if missing
      if (!snapshot.questFlags) {
        snapshot.questFlags = {};
      }

      // Add unlocked content if missing
      if (!snapshot.unlockedContent) {
        snapshot.unlockedContent = [];
      }

      // Add game settings if missing
      if (!snapshot.gameSettings) {
        snapshot.gameSettings = {};
      }

      // Add statistics if missing
      if (!snapshot.statistics) {
        snapshot.statistics = {};
      }

      // Add metadata if missing
      if (!snapshot.metadata) {
        snapshot.metadata = {};
      }

      snapshot.version = 'v1';
      return snapshot;
    });

    // v1 -> v2 migration
    this.addMigrationStep('v1', 'v2', (snapshot: ISaveSnapshot) => {
      // Add statistics tracking
      if (!snapshot.statistics) {
        snapshot.statistics = {};
      }

      // Add metadata for migration tracking
      if (!snapshot.metadata) {
        snapshot.metadata = {};
      }

      snapshot.metadata['migratedFrom'] = 'v1';
      snapshot.metadata['migratedAt'] = new Date().toISOString();

      snapshot.version = 'v2';
      return snapshot;
    });

    // v2 -> v3 migration
    this.addMigrationStep('v2', 'v3', (snapshot: ISaveSnapshot) => {
      // Add enhanced metadata
      if (!snapshot.metadata) {
        snapshot.metadata = {};
      }

      snapshot.metadata['migratedFrom'] = 'v2';
      snapshot.metadata['migratedAt'] = new Date().toISOString();
      snapshot.metadata['migrationVersion'] = '3.0';

      // Update checksum algorithm
      snapshot.computeChecksum();

      snapshot.version = 'v3';
      return snapshot;
    });
  }

  /**
   * Migrate save snapshot to target version
   */
  migrate(snapshot: ISaveSnapshot, targetVersion?: SaveVersion): SaveMigrationResult {
    if (!snapshot) {
      return {
        snapshot: SaveSnapshot.create(),
        warnings: ['Cannot migrate null snapshot'],
        migrated: false,
        oldVersion: 'unknown',
        newVersion: targetVersion || 'unknown'
      };
    }

    const currentVersion = (snapshot as any)?.version as SaveVersion;
    const target = targetVersion || this.getLatestVersion();

    if (currentVersion === target) {
      return {
        snapshot: snapshot as SaveSnapshot,
        warnings: [],
        migrated: false,
        oldVersion: currentVersion,
        newVersion: target
      };
    }

    if (!this.canMigrate(currentVersion, target)) {
      return {
        snapshot: snapshot as SaveSnapshot,
        warnings: [`Cannot migrate from ${currentVersion} to ${target}`],
        migrated: false,
        oldVersion: currentVersion,
        newVersion: target
      };
    }

    const migrationPath = this.getMigrationPath(currentVersion, target);
    let currentSnapshot: ISaveSnapshot = (snapshot as SaveSnapshot).clone();
    const warnings: string[] = [];

    for (let i = 0; i < migrationPath.length - 1; i++) {
      const fromVersion = migrationPath[i];
      const toVersion = migrationPath[i + 1];
      const migrationKey = `${fromVersion}->${toVersion}`;

      const migrationStep = this.migrationSteps.get(migrationKey);
      if (migrationStep) {
        try {
          currentSnapshot = migrationStep(currentSnapshot);
          warnings.push(`Migrated from ${fromVersion} to ${toVersion}`);
        } catch (error) {
          warnings.push(`Migration failed from ${fromVersion} to ${toVersion}: ${error}`);
          break;
        }
      }
    }

    return {
      snapshot: currentSnapshot as SaveSnapshot,
      warnings,
      migrated: warnings.length > 0,
      oldVersion: currentVersion,
      newVersion: currentSnapshot.version
    };
  }

  /**
   * Check if migration is possible
   */
  canMigrate(fromVersion: string, toVersion: string): boolean {
    const migrationPath = this.getMigrationPath(fromVersion, toVersion);
    return migrationPath.length > 1;
  }

  /**
   * Get migration path
   */
  getMigrationPath(fromVersion: string, toVersion: string): string[] {
    const path: string[] = [fromVersion];

    if (fromVersion === toVersion) {
      return path;
    }

    // Simple linear migration path - in production this could be more complex
    const versions = Array.from(this.supportedVersions).sort();
    const fromIndex = versions.indexOf(fromVersion as SaveVersion);
    const toIndex = versions.indexOf(toVersion as SaveVersion);

    if (fromIndex === -1 || toIndex === -1) {
      return path;
    }

    if (fromIndex < toIndex) {
      // Forward migration
      for (let i = fromIndex + 1; i <= toIndex; i++) {
        path.push(versions[i]);
      }
    } else {
      // Backward migration (not typically recommended)
      for (let i = fromIndex - 1; i >= toIndex; i--) {
        path.push(versions[i]);
      }
    }

    return path;
  }

  /**
   * Add migration step
   */
  addMigrationStep(fromVersion: string, toVersion: string, migrationFn: (snapshot: ISaveSnapshot) => ISaveSnapshot): void {
    this.migrationSteps.set(`${fromVersion}->${toVersion}`, migrationFn);
  }

  /**
   * Get supported versions
   */
  getSupportedVersions(): SaveVersion[] {
    return [...this.supportedVersions];
  }

  /**
   * Get latest version
   */
  getLatestVersion(): SaveVersion {
    const versions = Array.from(this.supportedVersions);
    return versions[versions.length - 1];
  }

  /**
   * Remove migration step
   */
  removeMigrationStep(fromVersion: string, toVersion: string): void {
    this.migrationSteps.delete(`${fromVersion}->${toVersion}`);
  }
}

/**
 * Save manager implementation
 */
export class SaveManager implements ISaveManager {
  private readonly validator: ISaveValidator;
  private readonly migrator: ISaveMigrator;
  private readonly defaultVersion: SaveVersion;

  constructor(
    validator?: ISaveValidator,
    migrator?: ISaveMigrator,
    defaultVersion: SaveVersion = 'v1'
  ) {
    this.validator = validator || new SaveValidator();
    this.migrator = migrator || new SaveMigrator();
    this.defaultVersion = defaultVersion;
  }

  /**
   * Create save manager
   */
  static create(
    validator?: ISaveValidator,
    migrator?: ISaveMigrator,
    defaultVersion: SaveVersion = 'v1'
  ): SaveManager {
    return new SaveManager(validator, migrator, defaultVersion);
  }

  /**
   * Save game to file
   */
  async saveGame(snapshot: ISaveSnapshot, filePath: string): Promise<SaveOperationResult> {
    try {
      // Validate snapshot
      const validationResult = snapshot.validate();
      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Save validation failed: ${validationResult.errors.join(', ')}`,
          validationResult
        };
      }

      // Update timestamp and checksum
      (snapshot as SaveSnapshot).updateTimestamp();
      (snapshot as SaveSnapshot).computeChecksum();

      // Convert to JSON
      const jsonData = JSON.stringify((snapshot as SaveSnapshot).toJSON(), null, 2);

      // Write to file (in browser environment, this would use different APIs)
      if (typeof window !== 'undefined') {
        // Browser implementation
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Node.js implementation
        const fs = require('fs').promises;
        await fs.writeFile(filePath, jsonData, 'utf8');
      }

      return {
        success: true,
        message: `Game saved successfully to ${filePath}`,
        snapshot,
        validationResult
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save game: ${error}`,
        error: error as Error
      };
    }
  }

  /**
   * Load game from file
   */
  async loadGame(filePath: string): Promise<SaveOperationResult> {
    try {
      let jsonData: string;

      if (typeof window !== 'undefined') {
        // Browser implementation would require file input
        throw new Error('File loading not supported in browser environment');
      } else {
        // Node.js implementation
        const fs = require('fs').promises;
        jsonData = await fs.readFile(filePath, 'utf8');
      }

      // Parse JSON
      const data = JSON.parse(jsonData);
      let snapshot = SaveSnapshot.fromJSON(data);

      // Validate snapshot
      const validationResult = this.validator.validate(snapshot);

      // Migrate if necessary
      let migrationResult: SaveMigrationResult | undefined;
      if ((snapshot as any).version !== this.defaultVersion && this.migrator.canMigrate((snapshot as any).version, this.defaultVersion)) {
        migrationResult = this.migrator.migrate(snapshot, this.defaultVersion);
        snapshot = migrationResult.snapshot as SaveSnapshot;
      }

      return {
        success: true,
        message: `Game loaded successfully from ${filePath}`,
        snapshot,
        validationResult,
        migrationResult
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to load game: ${error}`,
        error: error as Error
      };
    }
  }

  /**
   * Validate save snapshot
   */
  validateSnapshot(snapshot: ISaveSnapshot): SaveValidationResult {
    return this.validator.validate(snapshot);
  }

  /**
   * Migrate save snapshot
   */
  migrateSnapshot(snapshot: ISaveSnapshot, targetVersion?: SaveVersion): SaveMigrationResult {
    return this.migrator.migrate(snapshot, targetVersion);
  }

  /**
   * Export snapshot to binary format
   */
  async exportSnapshot(snapshot: ISaveSnapshot, format: 'json' | 'binary' = 'json'): Promise<Uint8Array> {
      const jsonData = JSON.stringify((snapshot as SaveSnapshot).toJSON());

    if (format === 'json') {
      return new TextEncoder().encode(jsonData);
    } else {
      // Simple compression for binary format
      const compressed = await this.compressData(jsonData);
      return compressed;
    }
  }

  /**
   * Import snapshot from data
   */
  async importSnapshot(data: Uint8Array | string, format: 'json' | 'binary' = 'json'): Promise<SaveOperationResult> {
    try {
      let jsonData: string;

      if (format === 'json') {
        jsonData = typeof data === 'string' ? data : new TextDecoder().decode(data);
      } else {
        jsonData = await this.decompressData(data as Uint8Array);
      }

      const parsedData = JSON.parse(jsonData);
      let snapshot = SaveSnapshot.fromJSON(parsedData);

      // Validate
      const validationResult = this.validator.validate(snapshot);

      // Migrate if needed
      let migrationResult: SaveMigrationResult | undefined;
      if ((snapshot as any).version !== this.defaultVersion && this.migrator.canMigrate((snapshot as any).version, this.defaultVersion)) {
        migrationResult = this.migrator.migrate(snapshot, this.defaultVersion);
        snapshot = migrationResult.snapshot as SaveSnapshot;
      }

      return {
        success: true,
        message: 'Snapshot imported successfully',
        snapshot,
        validationResult,
        migrationResult
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to import snapshot: ${error}`,
        error: error as Error
      };
    }
  }

  /**
   * Create backup of save file
   */
  async createBackup(filePath: string, backupPath?: string): Promise<SaveOperationResult> {
    try {
      const targetPath = backupPath || `${filePath}.backup`;

      if (typeof window !== 'undefined') {
        // Browser implementation would need to handle this differently
        throw new Error('Backup creation not supported in browser environment');
      } else {
        // Node.js implementation
        const fs = require('fs').promises;
        await fs.copyFile(filePath, targetPath);
      }

      return {
        success: true,
        message: `Backup created at ${targetPath}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create backup: ${error}`,
        error: error as Error
      };
    }
  }

  /**
   * List save files in directory
   */
  async listSaveFiles(directory: string): Promise<string[]> {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('Directory listing not supported in browser environment');
      } else {
        const fs = require('fs').promises;
        const files: any[] = await fs.readdir(directory);
        return (files as string[]).filter((file: string) => file.endsWith('.json') || file.endsWith('.sav'));
      }
    } catch (error) {
      return [];
    }
  }

  /**
   * Get save file information
   */
  async getSaveInfo(filePath: string): Promise<SaveOperationResult> {
    try {
      const loadResult = await this.loadGame(filePath);
      if (loadResult.success && loadResult.snapshot) {
        return {
          success: true,
          message: 'Save info retrieved successfully',
          snapshot: loadResult.snapshot
        };
      } else {
        return loadResult;
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to get save info: ${error}`,
        error: error as Error
      };
    }
  }

  /**
   * Compress data for binary format
   */
  private async compressData(data: string): Promise<Uint8Array> {
    // Simple compression implementation
    // In production, use a proper compression library
    const compressed = new TextEncoder().encode(data);
    return compressed;
  }

  /**
   * Decompress data from binary format
   */
  private async decompressData(data: Uint8Array): Promise<string> {
    // Simple decompression implementation
    // In production, use a proper decompression library
    return new TextDecoder().decode(data);
  }
}

/**
 * Utility functions for save operations
 */
export const SaveUtils = {
  /**
   * Generate unique player ID
   */
  generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate unique save file name
   */
  generateSaveFileName(playerId: string, timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    const formattedDate = date.toISOString().replace(/[:.]/g, '-').substr(0, 19);
    return `save_${playerId}_${formattedDate}.json`;
  },

  /**
   * Validate file path
   */
  validateFilePath(filePath: string): boolean {
    if (!filePath || filePath.trim() === '') {
      return false;
    }

    // Basic path validation
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(filePath)) {
      return false;
    }

    // Check for path traversal attempts
    if (filePath.includes('../') || filePath.includes('..\\')) {
      return false;
    }

    return true;
  },

  /**
   * Sanitize file path
   */
  sanitizeFilePath(filePath: string): string {
    return filePath
      .replace(/[<>:"|?*\x00-\x1f]/g, '_')
      .replace(/\.\./g, '.')
      .replace(/\/+/g, '/')
      .replace(/\\/g, '/');
  },

  /**
   * Calculate save file size
   */
  calculateSaveSize(snapshot: ISaveSnapshot): number {
    return snapshot.getEstimatedSize();
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Get save file metadata
   */
  getSaveMetadata(filePath: string): Record<string, any> {
    const stats = require('fs').statSync(filePath);
    return {
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    };
  },

  /**
   * Compare two save snapshots
   */
  compareSnapshots(snapshot1: ISaveSnapshot, snapshot2: ISaveSnapshot): Record<string, any> {
    const differences: Record<string, any> = {};

    const fieldsToCompare = [
      'version', 'playerId', 'zoneId', 'partyRoster', 'inventory',
      'questFlags', 'unlockedContent', 'gameSettings', 'statistics'
    ];

    fieldsToCompare.forEach(field => {
      const value1 = (snapshot1 as any)[field];
      const value2 = (snapshot2 as any)[field];

      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        differences[field] = {
          snapshot1: value1,
          snapshot2: value2
        };
      }
    });

    return differences;
  },

  /**
   * Create minimal save snapshot for testing
   */
  createMinimalSnapshot(): SaveSnapshot {
    return SaveSnapshot.create(
      SaveUtils.generatePlayerId(),
      'test_zone',
      'v1'
    );
  },

  /**
   * Create comprehensive save snapshot for testing
   */
  createComprehensiveSnapshot(): SaveSnapshot {
    const snapshot = SaveSnapshot.create(
      SaveUtils.generatePlayerId(),
      'comprehensive_test_zone',
      'v1'
    );

    // Add test party members
    snapshot.addPartyMember({
      id: 'hero_001',
      name: 'Hero',
      level: 10,
      hp: 100,
      maxHp: 100,
      stats: { atk: 50, def: 30, spd: 40 },
      statusEffects: ['blessed']
    });

    snapshot.addPartyMember({
      id: 'mage_001',
      name: 'Mage',
      level: 8,
      hp: 80,
      maxHp: 80,
      stats: { atk: 40, def: 20, spd: 35 },
      statusEffects: ['magic_boost']
    });

    // Add test inventory
    snapshot.addInventoryItem('health_potion', 5);
    snapshot.addInventoryItem('mana_potion', 3);
    snapshot.addInventoryItem('sword', 1);

    // Add test quest flags
    snapshot.setQuestFlag('tutorial_complete', true);
    snapshot.setQuestFlag('first_boss_defeated', false);

    // Add test unlocked content
    snapshot.unlockContent('area_town');
    snapshot.unlockContent('dungeon_cave');

    // Add test statistics
    snapshot.updateStatistic('enemies_defeated', 42);
    snapshot.updateStatistic('total_play_time', 3600000); // 1 hour in milliseconds

    return snapshot;
  }
};

/**
 * Default instances
 */
export const defaultSaveSnapshot = new SaveSnapshot();
export const defaultSaveValidator = new SaveValidator();
export const defaultSaveMigrator = new SaveMigrator();
export const defaultSaveManager = new SaveManager();