/**
 * ShrineSystemPure - Shrine System for K-Pop Monster Hunter
 * 
 * Manages shrine interactions including saving, spirit evolution, lore unlocks,
 * puzzle gates, and progression tracking. Core mechanic for world progression.
 * 
 * Features:
 * - Mini prayer shrines (lore, buffs, spawns)
 * - Major boss shrines (gates, evolution, progression)
 * - Shrine puzzle system
 * - Spirit evolution triggers
 * - Progression tracking
 * - Save/checkpoint system
 * 
 * @module ShrineSystemPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Shrine types
 */
export enum ShrineType {
  MINI_PRAYER = 'mini_prayer',
  MAJOR_BOSS = 'major_boss',
  CAMPFIRE = 'campfire',
  HIDDEN = 'hidden',
  ELEMENTAL = 'elemental'
}

/**
 * Shrine state
 */
export enum ShrineState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  HIDDEN = 'hidden'
}

/**
 * Puzzle type for shrine gates
 */
export enum PuzzleType {
  LIGHT_REFLECTION = 'light_reflection',
  RHYTHM_SEQUENCE = 'rhythm_sequence',
  ITEM_OFFERING = 'item_offering',
  SPIRIT_SYNC = 'spirit_sync',
  ELEMENTAL_ALIGNMENT = 'elemental_alignment',
  NONE = 'none'
}

/**
 * Element type for elemental shrines
 */
export enum ElementType {
  FIRE = 'fire',
  WATER = 'water',
  EARTH = 'earth',
  AIR = 'air',
  LIGHT = 'light',
  SHADOW = 'shadow',
  DEATH = 'death'
}

/**
 * Shrine buff interface
 */
export interface IShrineBuff {
  id: string;
  name: string;
  description: string;
  duration: number; // ms, 0 = permanent
  effects: {
    statBoost?: { stat: string; amount: number };
    spiritSyncBoost?: number;
    experienceMultiplier?: number;
    captureRateBoost?: number;
  };
}

/**
 * Shrine puzzle interface
 */
export interface IShrinePuzzle {
  type: PuzzleType;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  requirements: {
    items?: string[];
    spiritTypes?: string[];
    minimumSync?: number;
    rhythmAccuracy?: number;
  };
  reward?: {
    loreId?: string;
    buffId?: string;
    spiritSpawn?: string;
    itemDrop?: string[];
  };
}

/**
 * Shrine interface
 */
export interface IShrine {
  id: string;
  name: string;
  type: ShrineType;
  state: ShrineState;
  location: {
    zone: string;
    x: number;
    y: number;
  };
  element?: ElementType;
  description: string;
  loreEntries: string[];
  loreUnlocked: string[];
  buff?: IShrineBuff;
  puzzle?: IShrinePuzzle;
  canSave: boolean;
  canEvolveSpirits: boolean;
  requiredForProgression: boolean;
  linkedBossId?: string;
  linkedRegionId?: string;
  discoveryTimestamp?: Date;
  completionTimestamp?: Date;
}

/**
 * Save point data
 */
export interface ISavePoint {
  shrineId: string;
  timestamp: Date;
  playerData: {
    level: number;
    experience: number;
    currentHP: number;
    maxHP: number;
  };
  spiritData: {
    activeTeam: string[];
    totalCaptured: number;
    totalSeen: number;
  };
  progressionData: {
    completedShrines: string[];
    unlockedRegions: string[];
    defeatedBosses: string[];
    completedQuests: string[];
  };
  location: {
    zone: string;
    x: number;
    y: number;
  };
}

/**
 * Spirit evolution trigger
 */
export interface IEvolutionTrigger {
  spiritId: string;
  shrineId: string;
  requiredLevel: number;
  requiredItem?: string;
  requiredElement?: ElementType;
  evolvedSpiritId: string;
}

/**
 * Shrine Manager
 */
export class ShrineManager {
  private shrines: Map<string, IShrine> = new Map();
  private savePoints: ISavePoint[] = [];
  private activeSavePoint: ISavePoint | null = null;
  private completedShrines: Set<string> = new Set();
  private unlockedLore: Set<string> = new Set();
  private activeBuffs: IShrineBuff[] = [];

  /**
   * Register shrine
   */
  registerShrine(shrine: IShrine): void {
    this.shrines.set(shrine.id, shrine);
  }

  /**
   * Get shrine by ID
   */
  getShrine(shrineId: string): IShrine | undefined {
    return this.shrines.get(shrineId);
  }

  /**
   * Get all shrines
   */
  getAllShrines(): IShrine[] {
    return Array.from(this.shrines.values());
  }

  /**
   * Get shrines by type
   */
  getShrinesByType(type: ShrineType): IShrine[] {
    return this.getAllShrines().filter(s => s.type === type);
  }

  /**
   * Get shrines by zone
   */
  getShrinesByZone(zone: string): IShrine[] {
    return this.getAllShrines().filter(s => s.location.zone === zone);
  }

  /**
   * Discover shrine (change from HIDDEN to UNLOCKED)
   */
  discoverShrine(shrineId: string): boolean {
    const shrine = this.getShrine(shrineId);
    if (!shrine) return false;

    if (shrine.state === ShrineState.HIDDEN) {
      shrine.state = ShrineState.UNLOCKED;
      shrine.discoveryTimestamp = new Date();
      return true;
    }

    return false;
  }

  /**
   * Activate shrine
   */
  activateShrine(shrineId: string): { success: boolean; message: string } {
    const shrine = this.getShrine(shrineId);
    
    if (!shrine) {
      return { success: false, message: 'Shrine not found' };
    }

    if (shrine.state === ShrineState.LOCKED) {
      return { success: false, message: 'Shrine is locked. Complete requirements to unlock.' };
    }

    if (shrine.state === ShrineState.COMPLETED) {
      return { success: false, message: 'Shrine already completed' };
    }

    shrine.state = ShrineState.ACTIVE;
    return { success: true, message: `Activated ${shrine.name}` };
  }

  /**
   * Complete shrine puzzle
   */
  completePuzzle(shrineId: string): { success: boolean; reward?: any; message: string } {
    const shrine = this.getShrine(shrineId);
    
    if (!shrine || !shrine.puzzle) {
      return { success: false, message: 'No puzzle at this shrine' };
    }

    if (shrine.puzzle.completed) {
      return { success: false, message: 'Puzzle already completed' };
    }

    // Mark puzzle as completed
    shrine.puzzle.completed = true;
    shrine.state = ShrineState.COMPLETED;
    shrine.completionTimestamp = new Date();
    this.completedShrines.add(shrineId);

    // Apply rewards
    const reward = shrine.puzzle.reward;
    if (reward) {
      if (reward.loreId) {
        this.unlockedLore.add(reward.loreId);
      }
      if (reward.buffId && shrine.buff) {
        this.activeBuffs.push(shrine.buff);
      }
    }

    return {
      success: true,
      reward: reward,
      message: `Completed ${shrine.name}!`
    };
  }

  /**
   * Save at shrine (campfire)
   */
  saveAtShrine(shrineId: string, saveData: Omit<ISavePoint, 'shrineId' | 'timestamp'>): boolean {
    const shrine = this.getShrine(shrineId);
    
    if (!shrine || !shrine.canSave) {
      return false;
    }

    const savePoint: ISavePoint = {
      ...saveData,
      shrineId,
      timestamp: new Date()
    };

    this.savePoints.push(savePoint);
    this.activeSavePoint = savePoint;

    return true;
  }

  /**
   * Get last save point
   */
  getLastSavePoint(): ISavePoint | null {
    return this.activeSavePoint;
  }

  /**
   * Evolve spirit at shrine
   */
  evolveSpiritAtShrine(shrineId: string, spiritId: string, evolutionTrigger: IEvolutionTrigger): { success: boolean; evolvedSpiritId?: string; message: string } {
    const shrine = this.getShrine(shrineId);
    
    if (!shrine || !shrine.canEvolveSpirits) {
      return { success: false, message: 'Cannot evolve spirits at this shrine' };
    }

    if (evolutionTrigger.shrineId !== shrineId) {
      return { success: false, message: 'Wrong shrine for this evolution' };
    }

    if (evolutionTrigger.requiredElement && shrine.element !== evolutionTrigger.requiredElement) {
      return { success: false, message: `This evolution requires a ${evolutionTrigger.requiredElement} shrine` };
    }

    return {
      success: true,
      evolvedSpiritId: evolutionTrigger.evolvedSpiritId,
      message: `Spirit evolved successfully!`
    };
  }

  /**
   * Unlock lore at shrine
   */
  unlockLore(loreId: string): void {
    this.unlockedLore.add(loreId);
  }

  /**
   * Get unlocked lore
   */
  getUnlockedLore(): string[] {
    return Array.from(this.unlockedLore);
  }

  /**
   * Apply shrine buff
   */
  applyBuff(buff: IShrineBuff): void {
    this.activeBuffs.push(buff);
  }

  /**
   * Get active buffs
   */
  getActiveBuffs(): IShrineBuff[] {
    return [...this.activeBuffs];
  }

  /**
   * Update buff durations (call each frame)
   */
  updateBuffs(deltaTime: number): void {
    this.activeBuffs = this.activeBuffs.filter(buff => {
      if (buff.duration === 0) return true; // Permanent buff
      
      buff.duration -= deltaTime;
      return buff.duration > 0;
    });
  }

  /**
   * Check if shrine is completed
   */
  isShrineCompleted(shrineId: string): boolean {
    return this.completedShrines.has(shrineId);
  }

  /**
   * Get completion statistics
   */
  getCompletionStats(): { completed: number; total: number; percentage: number } {
    const completed = this.completedShrines.size;
    const total = this.shrines.size;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }

  /**
   * Get shrines required for progression
   */
  getRequiredShrines(): IShrine[] {
    return this.getAllShrines().filter(s => s.requiredForProgression);
  }

  /**
   * Check if progression requirements are met
   */
  canProgressToNextRegion(): boolean {
    const requiredShrines = this.getRequiredShrines();
    return requiredShrines.every(shrine => this.isShrineCompleted(shrine.id));
  }
}

/**
 * Shrine Builder
 */
export class ShrineBuilder {
  private shrine: Partial<IShrine> = {
    loreEntries: [],
    loreUnlocked: [],
    canSave: false,
    canEvolveSpirits: false,
    requiredForProgression: false
  };

  setId(id: string): this {
    this.shrine.id = id;
    return this;
  }

  setName(name: string): this {
    this.shrine.name = name;
    return this;
  }

  setType(type: ShrineType): this {
    this.shrine.type = type;
    return this;
  }

  setState(state: ShrineState): this {
    this.shrine.state = state;
    return this;
  }

  setLocation(zone: string, x: number, y: number): this {
    this.shrine.location = { zone, x, y };
    return this;
  }

  setElement(element: ElementType): this {
    this.shrine.element = element;
    return this;
  }

  setDescription(description: string): this {
    this.shrine.description = description;
    return this;
  }

  addLoreEntry(loreId: string): this {
    this.shrine.loreEntries!.push(loreId);
    return this;
  }

  setBuff(buff: IShrineBuff): this {
    this.shrine.buff = buff;
    return this;
  }

  setPuzzle(puzzle: IShrinePuzzle): this {
    this.shrine.puzzle = puzzle;
    return this;
  }

  enableSave(): this {
    this.shrine.canSave = true;
    return this;
  }

  enableEvolution(): this {
    this.shrine.canEvolveSpirits = true;
    return this;
  }

  setRequiredForProgression(required: boolean): this {
    this.shrine.requiredForProgression = required;
    return this;
  }

  linkBoss(bossId: string): this {
    this.shrine.linkedBossId = bossId;
    return this;
  }

  linkRegion(regionId: string): this {
    this.shrine.linkedRegionId = regionId;
    return this;
  }

  build(): IShrine {
    if (!this.shrine.id || !this.shrine.name || !this.shrine.type || 
        !this.shrine.state || !this.shrine.location || !this.shrine.description) {
      throw new Error('Invalid shrine configuration: missing required fields');
    }

    return this.shrine as IShrine;
  }
}

/**
 * Utility functions
 */
export const ShrineUtils = {
  /**
   * Create campfire save shrine
   */
  createCampfireShrine(id: string, zone: string, x: number, y: number): IShrine {
    return new ShrineBuilder()
      .setId(id)
      .setName('Campfire')
      .setType(ShrineType.CAMPFIRE)
      .setState(ShrineState.UNLOCKED)
      .setLocation(zone, x, y)
      .setDescription('A warm campfire where you can rest and save your progress')
      .enableSave()
      .build();
  },

  /**
   * Create prayer shrine with lore
   */
  createPrayerShrine(id: string, name: string, zone: string, x: number, y: number, loreIds: string[]): IShrine {
    const builder = new ShrineBuilder()
      .setId(id)
      .setName(name)
      .setType(ShrineType.MINI_PRAYER)
      .setState(ShrineState.UNLOCKED)
      .setLocation(zone, x, y)
      .setDescription('An ancient prayer shrine containing lost knowledge');

    loreIds.forEach(loreId => builder.addLoreEntry(loreId));

    return builder.build();
  },

  /**
   * Create boss shrine with puzzle gate
   */
  createBossShrine(id: string, name: string, zone: string, x: number, y: number, bossId: string, puzzleType: PuzzleType): IShrine {
    return new ShrineBuilder()
      .setId(id)
      .setName(name)
      .setType(ShrineType.MAJOR_BOSS)
      .setState(ShrineState.LOCKED)
      .setLocation(zone, x, y)
      .setDescription('A powerful shrine guarding a boss spirit')
      .setPuzzle({
        type: puzzleType,
        difficulty: 'hard',
        completed: false,
        requirements: {}
      })
      .linkBoss(bossId)
      .setRequiredForProgression(true)
      .build();
  },

  /**
   * Create elemental evolution shrine
   */
  createElementalShrine(id: string, name: string, zone: string, x: number, y: number, element: ElementType): IShrine {
    return new ShrineBuilder()
      .setId(id)
      .setName(name)
      .setType(ShrineType.ELEMENTAL)
      .setState(ShrineState.UNLOCKED)
      .setLocation(zone, x, y)
      .setElement(element)
      .setDescription(`A shrine infused with ${element} energy, perfect for spirit evolution`)
      .enableEvolution()
      .build();
  },

  /**
   * Create hidden shrine
   */
  createHiddenShrine(id: string, name: string, zone: string, x: number, y: number): IShrine {
    return new ShrineBuilder()
      .setId(id)
      .setName(name)
      .setType(ShrineType.HIDDEN)
      .setState(ShrineState.HIDDEN)
      .setLocation(zone, x, y)
      .setDescription('A secret shrine hidden from plain sight')
      .addLoreEntry('hidden_shrine_lore')
      .setBuff({
        id: 'hidden_shrine_buff',
        name: 'Seeker\'s Blessing',
        description: 'Increased chance to find hidden shrines',
        duration: 0,
        effects: {
          spiritSyncBoost: 10
        }
      })
      .build();
  }
};

export default ShrineManager;
