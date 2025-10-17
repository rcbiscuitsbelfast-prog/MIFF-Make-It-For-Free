/**
 * SpiritsPure - SpiritDex Management System
 *
 * A comprehensive spirit (creature) management system for filtering, sorting,
 * and managing spirit collections. Features advanced filtering by type, sync
 * level, evolution status, and lore, plus flexible sorting options.
 *
 * @module SpiritsPure
 * @version 1.0.0
 * @license MIT
 */

/**
 * Spirit type enumeration
 */
export enum SpiritType {
  NONE = 'none',
  FIRE = 'fire',
  WATER = 'water',
  GRASS = 'grass',
  ELECTRIC = 'electric',
  PSYCHIC = 'psychic',
  ICE = 'ice',
  DRAGON = 'dragon',
  DARK = 'dark',
  FAIRY = 'fairy',
  NORMAL = 'normal',
  FIGHTING = 'fighting',
  POISON = 'poison',
  GROUND = 'ground',
  FLYING = 'flying',
  BUG = 'bug',
  ROCK = 'rock',
  GHOST = 'ghost',
  STEEL = 'steel',
  LIGHT = 'light',
  SHADOW = 'shadow',
  TIME = 'time',
  SPACE = 'space',
  SOUND = 'sound',
  CHAOS = 'chaos',
  ORDER = 'order',
  LIFE = 'life',
  DEATH = 'death',
  BALANCE = 'balance'
}

/**
 * Spirit rarity enumeration
 */
export enum SpiritRarity {
  COMMON = 1,
  UNCOMMON = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  MYTHICAL = 6,
  UNIQUE = 7
}

/**
 * Sort option enumeration
 */
export enum SortOption {
  ALPHABETICAL_ASC = 'alphabetical_asc',
  ALPHABETICAL_DESC = 'alphabetical_desc',
  SYNC_ASC = 'sync_asc',
  SYNC_DESC = 'sync_desc',
  RARITY_ASC = 'rarity_asc',
  RARITY_DESC = 'rarity_desc',
  LEVEL_ASC = 'level_asc',
  LEVEL_DESC = 'level_desc',
  CAPTURE_DATE_ASC = 'capture_date_asc',
  CAPTURE_DATE_DESC = 'capture_date_desc'
}

/**
 * Filter criteria interface
 */
export interface ISpiritFilter {
  type?: SpiritType;
  captured?: boolean; // true=captured only, false=not captured only, null=any
  minSync?: number;   // minimum sync level
  maxSync?: number;   // maximum sync level
  loreUnlocked?: boolean; // true=unlocked lore only, false=locked lore only, null=any
  hasEvolved?: boolean;   // true=evolved spirits only, false=base spirits only, null=any
  minLevel?: number;      // minimum spirit level
  maxLevel?: number;      // maximum spirit level
  rarity?: SpiritRarity;  // specific rarity filter
  nameContains?: string;  // filter by name substring
  hasMoves?: boolean;     // true=has moves, false=no moves, null=any
  isFavorite?: boolean;   // favorite spirits filter
  region?: string;        // region filter
  generation?: number;    // generation filter
}

/**
 * Sort criteria interface
 */
export interface ISpiritSortCriteria {
  primarySort: SortOption;
  secondarySort?: SortOption;
  tertiarySort?: SortOption;
  ascending: boolean;
}

/**
 * Spirit statistics interface
 */
export interface ISpiritStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  accuracy?: number;
  evasion?: number;
  criticalHit?: number;
  [key: string]: number | undefined;
}

/**
 * Spirit move interface
 */
export interface ISpiritMove {
  id: string;
  name: string;
  description: string;
  type: SpiritType;
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number;
  pp: number; // Power points
  priority: number;
  effects: string[];
  target: 'single' | 'multiple' | 'all' | 'self' | 'field';
  contact: boolean;
  soundBased: boolean;
  punchBased: boolean;
  snatchable: boolean;
  gravityAffected: boolean;
  defrostsTarget: boolean;
  bites: boolean;
  pulses: boolean;
  ballistic: boolean;
  dance: boolean;
  wind: boolean;
}

/**
 * Spirit evolution interface
 */
export interface ISpiritEvolution {
  id: string;
  name: string;
  level: number;
  item?: string;
  location?: string;
  timeOfDay?: 'day' | 'night' | 'dusk' | 'dawn';
  weather?: string;
  happiness?: number;
  gender?: 'male' | 'female';
  otherRequirements: string[];
  evolvesTo: string; // Spirit ID
}

/**
 * Spirit lore interface
 */
export interface ISpiritLore {
  id: string;
  title: string;
  description: string;
  category: 'biology' | 'behavior' | 'habitat' | 'mythology' | 'training' | 'other';
  unlocked: boolean;
  unlockRequirements: string[];
  relatedSpirits: string[];
  images: string[];
  audio: string[];
  videos: string[];
  writtenDate: string;
  author: string;
  tags: string[];
  rating: number; // 1-5 stars
  wordCount: number;
  readingTime: number; // minutes
}

/**
 * Spirit interface (SpiritDex entry)
 */
export interface ISpirit {
  spiritId: string;
  spiritName: string;
  description: string;
  primaryType: SpiritType;
  secondaryType?: SpiritType;
  rarity: SpiritRarity;
  level: number;
  experience: number;
  maxExperience: number;
  evolutionStage: number; // 1 = base, 2 = first evolution, etc.
  evolutions: ISpiritEvolution[];
  stats: ISpiritStats;
  moves: ISpiritMove[];
  abilities: string[];
  hiddenAbilities: string[];
  height: number; // in meters
  weight: number; // in kilograms
  genderRatio: { male: number; female: number }; // percentages
  eggGroups: string[];
  hatchSteps: number;
  friendship: number;
  growthRate: 'slow' | 'medium_slow' | 'medium_fast' | 'fast' | 'fluctuating' | 'erratic';
  catchRate: number;
  baseExperience: number;
  evYield: Partial<ISpiritStats>;
  habitat: string[];
  region: string;
  generation: number;
  isCaptured: boolean;
  captureDate?: Date;
  captureLocation?: string;
  captureLevel?: number;
  isFavorite: boolean;
  nickname?: string;
  trainerId?: string;
  trainerName?: string;
  syncLevel: number; // 0-100
  loreEntries: ISpiritLore[];
  sprites: {
    normal: string;
    shiny?: string;
    front: string;
    back: string;
    icon: string;
  };
  cries: {
    normal: string;
    shiny?: string;
    hurt?: string;
  };
  metadata: Record<string, any>;
  validate(): string[];
  computeExperienceForLevel(level: number): number;
  canEvolve(): boolean;
  getNextEvolution(): ISpiritEvolution | null;
  getEffectiveStats(): ISpiritStats;
  getTypeEffectiveness(attackingType: SpiritType): number;
  hasMove(moveId: string): boolean;
  learnMove(move: ISpiritMove): boolean;
  forgetMove(moveId: string): boolean;
  getMoveById(moveId: string): ISpiritMove | null;
  getLoreEntry(loreId: string): ISpiritLore | null;
  unlockLore(loreId: string): boolean;
  isLoreUnlocked(loreId: string): boolean;
  getAllLoreIds(): string[];
  getUnlockedLoreIds(): string[];
  getSyncDescription(): string;
  getRarityDescription(): string;
  getTypeDescription(): string;
  getHabitatDescription(): string;
  toJSON(): Record<string, any>;
  clone(): ISpirit;
}

/**
 * Spirit collection interface
 */
export interface ISpiritCollection {
  spirits: ISpirit[];
  capturedSpirits: ISpirit[];
  uncapturedSpirits: ISpirit[];
  favoriteSpirits: ISpirit[];
  totalSpirits: number;
  capturedCount: number;
  completionPercentage: number;
  addSpirit(spirit: ISpirit): void;
  removeSpirit(spiritId: string): boolean;
  getSpirit(spiritId: string): ISpirit | null;
  hasSpirit(spiritId: string): boolean;
  updateSpirit(spiritId: string, updates: Partial<ISpirit>): boolean;
  getSpiritsByType(type: SpiritType): ISpirit[];
  getSpiritsByRarity(rarity: SpiritRarity): ISpirit[];
  getSpiritsByRegion(region: string): ISpirit[];
  getSpiritsByGeneration(generation: number): ISpirit[];
  getSpiritsBySyncLevel(minSync: number, maxSync: number): ISpirit[];
  getSpiritsByLevel(minLevel: number, maxLevel: number): ISpirit[];
  getEvolvedSpirits(): ISpirit[];
  getUnevolvedSpirits(): ISpirit[];
  searchSpirits(query: string): ISpirit[];
  sortSpirits(sortOption: SortOption, ascending?: boolean): ISpirit[];
  filterSpirits(filter: ISpiritFilter): ISpirit[];
  getStatistics(): Record<string, number>;
  getCompletionByType(): Record<SpiritType, { total: number; captured: number; percentage: number }>;
  getCompletionByRarity(): Record<SpiritRarity, { total: number; captured: number; percentage: number }>;
  exportCollection(): Record<string, any>;
  importCollection(data: Record<string, any>): void;
  validateCollection(): string[];
}

/**
 * Spirit filter implementation
 */
export class SpiritFilter implements ISpiritFilter {
  public type?: SpiritType;
  public captured?: boolean;
  public minSync?: number;
  public maxSync?: number;
  public loreUnlocked?: boolean;
  public hasEvolved?: boolean;
  public minLevel?: number;
  public maxLevel?: number;
  public rarity?: SpiritRarity;
  public nameContains?: string;
  public hasMoves?: boolean;
  public isFavorite?: boolean;
  public region?: string;
  public generation?: number;

  constructor(
    type?: SpiritType,
    captured?: boolean,
    minSync?: number,
    maxSync?: number,
    loreUnlocked?: boolean,
    hasEvolved?: boolean,
    minLevel?: number,
    maxLevel?: number,
    rarity?: SpiritRarity,
    nameContains?: string,
    hasMoves?: boolean,
    isFavorite?: boolean,
    region?: string,
    generation?: number
  ) {
    this.type = type;
    this.captured = captured;
    this.minSync = minSync;
    this.maxSync = maxSync;
    this.loreUnlocked = loreUnlocked;
    this.hasEvolved = hasEvolved;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.rarity = rarity;
    this.nameContains = nameContains;
    this.hasMoves = hasMoves;
    this.isFavorite = isFavorite;
    this.region = region;
    this.generation = generation;
  }

  /**
   * Create filter with specific criteria
   */
  static create(
    type?: SpiritType,
    captured?: boolean,
    minSync?: number,
    maxSync?: number,
    loreUnlocked?: boolean,
    hasEvolved?: boolean,
    minLevel?: number,
    maxLevel?: number,
    rarity?: SpiritRarity,
    nameContains?: string,
    hasMoves?: boolean,
    isFavorite?: boolean,
    region?: string,
    generation?: number
  ): SpiritFilter {
    return new SpiritFilter(
      type, captured, minSync, maxSync, loreUnlocked, hasEvolved,
      minLevel, maxLevel, rarity, nameContains, hasMoves, isFavorite, region, generation
    );
  }

  /**
   * Create filter for captured spirits only
   */
  static capturedOnly(): SpiritFilter {
    return new SpiritFilter(undefined, true);
  }

  /**
   * Create filter for uncaptured spirits only
   */
  static uncapturedOnly(): SpiritFilter {
    return new SpiritFilter(undefined, false);
  }

  /**
   * Create filter by type
   */
  static byType(type: SpiritType): SpiritFilter {
    return new SpiritFilter(type);
  }

  /**
   * Create filter by sync level range
   */
  static bySyncLevel(minSync: number, maxSync: number): SpiritFilter {
    return new SpiritFilter(undefined, undefined, minSync, maxSync);
  }

  /**
   * Create filter by level range
   */
  static byLevel(minLevel: number, maxLevel: number): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, undefined, minLevel, maxLevel);
  }

  /**
   * Create filter by rarity
   */
  static byRarity(rarity: SpiritRarity): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, rarity);
  }

  /**
   * Create filter by region
   */
  static byRegion(region: string): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, region);
  }

  /**
   * Create filter by generation
   */
  static byGeneration(generation: number): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, generation);
  }

  /**
   * Create filter for favorites
   */
  static favoritesOnly(): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
  }

  /**
   * Create filter for spirits with unlocked lore
   */
  static withUnlockedLore(): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, true);
  }

  /**
   * Create filter for spirits with locked lore
   */
  static withLockedLore(): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, false);
  }

  /**
   * Create filter for evolved spirits
   */
  static evolvedOnly(): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, true);
  }

  /**
   * Create filter for unevolved spirits
   */
  static unevolvedOnly(): SpiritFilter {
    return new SpiritFilter(undefined, undefined, undefined, undefined, undefined, false);
  }

  /**
   * Apply filter to spirit collection
   */
  apply(
    spirits: ISpirit[],
    spiritIdToSync?: Map<string, number>,
    unlockedLoreIds?: Set<string>
  ): ISpirit[] {
    let filtered = [...spirits];

    // Filter by type
    if (this.type && this.type !== SpiritType.NONE) {
      filtered = filtered.filter((spirit: any) =>
        spirit.primaryType === this.type || spirit.secondaryType === this.type
      );
    }

    // Filter by capture status
    if (this.captured !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.isCaptured === this.captured);
    }

    // Filter by evolution status
    if (this.hasEvolved !== undefined) {
      filtered = filtered.filter((spirit: any) => {
        const hasEvolved = spirit.evolutionStage > 1;
        return this.hasEvolved ? hasEvolved : !hasEvolved;
      });
    }

    // Filter by sync level
    if (this.minSync !== undefined || this.maxSync !== undefined) {
      const min = this.minSync ?? 0;
      const max = this.maxSync ?? 100;

      if (spiritIdToSync) {
        filtered = filtered.filter((spirit: any) => {
          const sync = spiritIdToSync.get(spirit.spiritId) ?? 0;
          return sync >= min && sync <= max;
        });
      } else {
        // Without sync map, exclude all spirits
        filtered = [];
      }
    }

    // Filter by lore unlocked status
    if (this.loreUnlocked !== undefined && unlockedLoreIds) {
      filtered = filtered.filter((spirit: any) => {
        const loreIds = spirit.getAllLoreIds();
        const hasUnlockedLore = loreIds.some(loreId => unlockedLoreIds.has(loreId));
        return this.loreUnlocked ? hasUnlockedLore : !hasUnlockedLore;
      });
    }

    // Filter by level range
    if (this.minLevel !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.level >= this.minLevel);
    }

    if (this.maxLevel !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.level <= this.maxLevel);
    }

    // Filter by rarity
    if (this.rarity !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.rarity === this.rarity);
    }

    // Filter by name contains
    if (this.nameContains) {
      const query = this.nameContains.toLowerCase();
      filtered = filtered.filter((spirit: any) =>
        spirit.spiritName.toLowerCase().includes(query) ||
        spirit.description.toLowerCase().includes(query) ||
        spirit.nickname?.toLowerCase().includes(query)
      );
    }

    // Filter by moves
    if (this.hasMoves !== undefined) {
      filtered = filtered.filter((spirit: any) => {
        const hasMoves = spirit.moves.length > 0;
        return this.hasMoves ? hasMoves : !hasMoves;
      });
    }

    // Filter by favorite status
    if (this.isFavorite !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.isFavorite === this.isFavorite);
    }

    // Filter by region
    if (this.region) {
      filtered = filtered.filter((spirit: any) => spirit.region === this.region);
    }

    // Filter by generation
    if (this.generation !== undefined) {
      filtered = filtered.filter((spirit: any) => spirit.generation === this.generation);
    }

    return filtered;
  }

  /**
   * Get filter description
   */
  getDescription(): string {
    const parts: string[] = [];

    if (this.type) parts.push(`Type: ${this.type}`);
    if (this.captured !== undefined) parts.push(`Captured: ${this.captured ? 'Yes' : 'No'}`);
    if (this.minSync !== undefined || this.maxSync !== undefined) {
      parts.push(`Sync: ${this.minSync || 0}-${this.maxSync || 100}`);
    }
    if (this.loreUnlocked !== undefined) {
      parts.push(`Lore: ${this.loreUnlocked ? 'Unlocked' : 'Locked'}`);
    }
    if (this.hasEvolved !== undefined) {
      parts.push(`Evolved: ${this.hasEvolved ? 'Yes' : 'No'}`);
    }
    if (this.minLevel !== undefined || this.maxLevel !== undefined) {
      parts.push(`Level: ${this.minLevel || 1}-${this.maxLevel || 100}`);
    }
    if (this.rarity !== undefined) parts.push(`Rarity: ${SpiritRarity[this.rarity]}`);
    if (this.nameContains) parts.push(`Name: "${this.nameContains}"`);
    if (this.region) parts.push(`Region: ${this.region}`);
    if (this.generation !== undefined) parts.push(`Generation: ${this.generation}`);

    return parts.join(', ') || 'No filters applied';
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      type: this.type,
      captured: this.captured,
      minSync: this.minSync,
      maxSync: this.maxSync,
      loreUnlocked: this.loreUnlocked,
      hasEvolved: this.hasEvolved,
      minLevel: this.minLevel,
      maxLevel: this.maxLevel,
      rarity: this.rarity,
      nameContains: this.nameContains,
      hasMoves: this.hasMoves,
      isFavorite: this.isFavorite,
      region: this.region,
      generation: this.generation
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): SpiritFilter {
    return new SpiritFilter(
      data.type,
      data.captured,
      data.minSync,
      data.maxSync,
      data.loreUnlocked,
      data.hasEvolved,
      data.minLevel,
      data.maxLevel,
      data.rarity,
      data.nameContains,
      data.hasMoves,
      data.isFavorite,
      data.region,
      data.generation
    );
  }

  /**
   * Clone filter
   */
  clone(): SpiritFilter {
    return SpiritFilter.fromJSON(this.toJSON());
  }

  /**
   * Check if filter is empty
   */
  isEmpty(): boolean {
    return !this.type && this.captured === undefined && !this.minSync && !this.maxSync &&
           this.loreUnlocked === undefined && this.hasEvolved === undefined &&
           !this.minLevel && !this.maxLevel && !this.rarity && !this.nameContains &&
           this.hasMoves === undefined && this.isFavorite === undefined &&
           !this.region && this.generation === undefined;
  }

  /**
   * Reset filter
   */
  reset(): void {
    this.type = undefined;
    this.captured = undefined;
    this.minSync = undefined;
    this.maxSync = undefined;
    this.loreUnlocked = undefined;
    this.hasEvolved = undefined;
    this.minLevel = undefined;
    this.maxLevel = undefined;
    this.rarity = undefined;
    this.nameContains = undefined;
    this.hasMoves = undefined;
    this.isFavorite = undefined;
    this.region = undefined;
    this.generation = undefined;
  }
}

/**
 * Spirit sorter implementation
 */
export class SpiritSorter {
  /**
   * Sort spirits by specified option
   */
  sort(
    spirits: ISpirit[],
    sortOption: SortOption,
    ascending: boolean = true,
    spiritIdToSync?: Map<string, number>,
    spiritIdToCaptureDate?: Map<string, Date>
  ): ISpirit[] {
    const sorted = [...spirits];

    const sortFn = this.getSortFunction(sortOption, spiritIdToSync, spiritIdToCaptureDate);

    if (ascending) {
      sorted.sort(sortFn);
    } else {
      sorted.sort((a: any, b: any) => -sortFn(a, b));
    }

    return sorted;
  }

  /**
   * Get sort function for option
   */
  private getSortFunction(
    sortOption: SortOption,
    spiritIdToSync?: Map<string, number>,
    spiritIdToCaptureDate?: Map<string, Date>
  ): (a: ISpirit, b: ISpirit) => number {
    switch (sortOption) {
      case ALPHABETICAL_ASC:
      case ALPHABETICAL_DESC:
        return (a, b) => a.spiritName.localeCompare(b.spiritName);

      case SYNC_ASC:
      case SYNC_DESC:
        return (a, b) => {
          const syncA = spiritIdToSync?.get(a.spiritId) ?? 0;
          const syncB = spiritIdToSync?.get(b.spiritId) ?? 0;
          return syncA - syncB;
        };

      case RARITY_ASC:
      case RARITY_DESC:
        return (a, b) => a.rarity - b.rarity;

      case LEVEL_ASC:
      case LEVEL_DESC:
        return (a, b) => a.level - b.level;

      case CAPTURE_DATE_ASC:
      case CAPTURE_DATE_DESC:
        return (a, b) => {
          const dateA = a.captureDate?.getTime() ?? 0;
          const dateB = b.captureDate?.getTime() ?? 0;
          return dateA - dateB;
        };

      default:
        return (a, b) => a.spiritName.localeCompare(b.spiritName);
    }
  }

  /**
   * Sort by multiple criteria
   */
  sortByCriteria(
    spirits: ISpirit[],
    criteria: ISpiritSortCriteria,
    spiritIdToSync?: Map<string, number>,
    spiritIdToCaptureDate?: Map<string, Date>
  ): ISpirit[] {
    const sorted = [...spirits];

    const sortFunctions = [
      this.getSortFunction(criteria.primarySort, spiritIdToSync, spiritIdToCaptureDate)
    ];

    if (criteria.secondarySort) {
      sortFunctions.push(this.getSortFunction(criteria.secondarySort, spiritIdToSync, spiritIdToCaptureDate));
    }

    if (criteria.tertiarySort) {
      sortFunctions.push(this.getSortFunction(criteria.tertiarySort, spiritIdToSync, spiritIdToCaptureDate));
    }

    sorted.sort((a: any, b: any) => {
      for (const sortFn of sortFunctions) {
        const result = sortFn(a, b);
        if (result !== 0) {
          return criteria.ascending ? result : -result;
        }
      }
      return 0;
    });

    return sorted;
  }

  /**
   * Get sort option description
   */
  getSortDescription(sortOption: SortOption): string {
    switch (sortOption) {
      case ALPHABETICAL_ASC:
        return 'Alphabetical (A-Z)';
      case ALPHABETICAL_DESC:
        return 'Alphabetical (Z-A)';
      case SYNC_ASC:
        return 'Sync Level (Low to High)';
      case SYNC_DESC:
        return 'Sync Level (High to Low)';
      case RARITY_ASC:
        return 'Rarity (Common to Mythical)';
      case RARITY_DESC:
        return 'Rarity (Mythical to Common)';
      case LEVEL_ASC:
        return 'Level (Low to High)';
      case LEVEL_DESC:
        return 'Level (High to Low)';
      case CAPTURE_DATE_ASC:
        return 'Capture Date (Oldest First)';
      case CAPTURE_DATE_DESC:
        return 'Capture Date (Newest First)';
      default:
        return 'Unknown Sort';
    }
  }
}

/**
 * Spirit implementation (basic)
 */
export class Spirit implements ISpirit {
  public spiritId: string;
  public spiritName: string;
  public description: string;
  public primaryType: SpiritType;
  public secondaryType?: SpiritType;
  public rarity: SpiritRarity;
  public level: number;
  public experience: number;
  public maxExperience: number;
  public evolutionStage: number;
  public evolutions: ISpiritEvolution[];
  public stats: ISpiritStats;
  public moves: ISpiritMove[];
  public abilities: string[];
  public hiddenAbilities: string[];
  public height: number;
  public weight: number;
  public genderRatio: { male: number; female: number };
  public eggGroups: string[];
  public hatchSteps: number;
  public friendship: number;
  public growthRate: 'slow' | 'medium_slow' | 'medium_fast' | 'fast' | 'fluctuating' | 'erratic';
  public catchRate: number;
  public baseExperience: number;
  public evYield: Partial<ISpiritStats>;
  public habitat: string[];
  public region: string;
  public generation: number;
  public isCaptured: boolean;
  public captureDate?: Date;
  public captureLocation?: string;
  public captureLevel?: number;
  public isFavorite: boolean;
  public nickname?: string;
  public trainerId?: string;
  public trainerName?: string;
  public syncLevel: number;
  public loreEntries: ISpiritLore[];
  public sprites: {
    normal: string;
    shiny?: string;
    front: string;
    back: string;
    icon: string;
  };
  public cries: {
    normal: string;
    shiny?: string;
    hurt?: string;
  };
  public metadata: Record<string, any>;

  constructor(
    spiritId: string,
    spiritName: string,
    description: string,
    primaryType: SpiritType,
    secondaryType: SpiritType | undefined = undefined,
    rarity: SpiritRarity = SpiritRarity.COMMON
  ) {
    this.spiritId = spiritId;
    this.spiritName = spiritName;
    this.description = description;
    this.primaryType = primaryType;
    this.secondaryType = secondaryType;
    this.rarity = rarity;
    this.level = 1;
    this.experience = 0;
    this.maxExperience = 1000;
    this.evolutionStage = 1;
    this.evolutions = [];
    this.stats = {
      hp: 50,
      attack: 50,
      defense: 50,
      specialAttack: 50,
      specialDefense: 50,
      speed: 50
    };
    this.moves = [];
    this.abilities = [];
    this.hiddenAbilities = [];
    this.height = 1.0;
    this.weight = 10.0;
    this.genderRatio = { male: 50, female: 50 };
    this.eggGroups = ['undiscovered'];
    this.hatchSteps = 5120;
    this.friendship = 70;
    this.growthRate = 'medium_fast';
    this.catchRate = 255;
    this.baseExperience = 64;
    this.evYield = {};
    this.habitat = ['grassland'];
    this.region = 'kanto';
    this.generation = 1;
    this.isCaptured = false;
    this.isFavorite = false;
    this.syncLevel = 0;
    this.loreEntries = [];
    this.sprites = {
      normal: '',
      front: '',
      back: '',
      icon: ''
    };
    this.cries = {
      normal: ''
    };
    this.metadata = {};
  }

  /**
   * Create spirit with basic info
   */
  static create(
    spiritId: string,
    spiritName: string,
    description: string,
    primaryType: SpiritType,
    secondaryType?: SpiritType,
    rarity?: SpiritRarity
  ): Spirit {
    return new Spirit(spiritId, spiritName, description, primaryType, secondaryType, rarity);
  }

  /**
   * Validate spirit
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.spiritId || this.spiritId.trim() === '') {
      errors.push('Spirit ID is required');
    }

    if (!this.spiritName || this.spiritName.trim() === '') {
      errors.push('Spirit name is required');
    }

    if (!this.description || this.description.trim() === '') {
      errors.push('Description is required');
    }

    if (this.primaryType === SpiritType.NONE) {
      errors.push('Primary type cannot be NONE');
    }

    if (this.level < 1 || this.level > 100) {
      errors.push('Level must be between 1 and 100');
    }

    if (this.syncLevel < 0 || this.syncLevel > 100) {
      errors.push('Sync level must be between 0 and 100');
    }

    if (this.experience < 0) {
      errors.push('Experience cannot be negative');
    }

    if (this.maxExperience <= 0) {
      errors.push('Max experience must be positive');
    }

    if (this.evolutionStage < 1) {
      errors.push('Evolution stage must be at least 1');
    }

    return errors;
  }

  /**
   * Compute experience needed for level
   */
  computeExperienceForLevel(level: number): number {
    if (level <= 1) return 0;

    switch (this.growthRate) {
      case 'slow':
        return Math.floor((5 * Math.pow(level, 3)) / 4);
      case 'medium_slow':
        return Math.floor((6 * Math.pow(level, 3)) / 5 - 15 * Math.pow(level, 2) + 100 * level - 140);
      case 'medium_fast':
        return Math.pow(level, 3);
      case 'fast':
        return Math.floor((4 * Math.pow(level, 3)) / 5);
      case 'fluctuating':
        if (level <= 15) return Math.floor(Math.pow(level, 3) * ((Math.floor((level + 1) / 3) + 24) / 50));
        if (level <= 36) return Math.floor(Math.pow(level, 3) * ((level + 14) / 50));
        return Math.floor(Math.pow(level, 3) * ((Math.floor(level / 2) + 32) / 50));
      case 'erratic':
        if (level <= 50) return Math.floor(Math.pow(level, 3) * (100 - level) / 50);
        if (level <= 68) return Math.floor(Math.pow(level, 3) * (150 - level) / 100);
        if (level <= 98) return Math.floor(Math.pow(level, 3) * Math.floor((1911 - 10 * level) / 3) / 500);
        return Math.floor(Math.pow(level, 3) * (160 - level) / 100);
      default:
        return Math.pow(level, 3);
    }
  }

  /**
   * Check if spirit can evolve
   */
  canEvolve(): boolean {
    return this.evolutions.length > 0;
  }

  /**
   * Get next evolution
   */
  getNextEvolution(): ISpiritEvolution | null {
    const nextEvolution = this.evolutions.find(evolution =>
      evolution.level <= this.level &&
      (!evolution.item || this.hasItem(evolution.item)) &&
      (!evolution.location || this.captureLocation === evolution.location) &&
      (!evolution.timeOfDay || this.isTimeOfDay(evolution.timeOfDay)) &&
      (!evolution.weather || this.isWeather(evolution.weather)) &&
      (!evolution.happiness || this.friendship >= evolution.happiness) &&
      (!evolution.gender || this.getGender() === evolution.gender)
    );

    return nextEvolution || null;
  }

  /**
   * Get effective stats (with level scaling)
   */
  getEffectiveStats(): ISpiritStats {
    const levelMultiplier = this.level / 50; // Simple level scaling
    return {
      hp: Math.floor(this.stats.hp * levelMultiplier),
      attack: Math.floor(this.stats.attack * levelMultiplier),
      defense: Math.floor(this.stats.defense * levelMultiplier),
      specialAttack: Math.floor(this.stats.specialAttack * levelMultiplier),
      specialDefense: Math.floor(this.stats.specialDefense * levelMultiplier),
      speed: Math.floor(this.stats.speed * levelMultiplier),
      accuracy: this.stats.accuracy,
      evasion: this.stats.evasion,
      criticalHit: this.stats.criticalHit
    };
  }

  /**
   * Get type effectiveness against attacking type
   */
  getTypeEffectiveness(attackingType: SpiritType): number {
    // This would be a complex lookup table in a real implementation
    // For now, return a simple effectiveness value
    if (this.primaryType === attackingType || this.secondaryType === attackingType) {
      return 0.5; // Not very effective
    }

    // Check for super effective combinations
    const superEffective: Record<string, string[]> = {
      [SpiritType.FIRE]: [SpiritType.GRASS, ICE: SpiritType.ICE, SpiritType.BUG, SpiritType.STEEL],
      [SpiritType.WATER]: [SpiritType.FIRE, GROUND: SpiritType.GROUND, SpiritType.ROCK],
      [SpiritType.GRASS]: [SpiritType.WATER, GROUND: SpiritType.GROUND, SpiritType.ROCK],
      [SpiritType.ELECTRIC]: [SpiritType.WATER, SpiritType.FLYING],
      [SpiritType.ICE]: [SpiritType.GRASS, GROUND: SpiritType.GROUND, SpiritType.FLYING, SpiritType.DRAGON],
      [SpiritType.FIGHTING]: [SpiritType.NORMAL, ICE: SpiritType.ICE, SpiritType.ROCK, DARK: SpiritType.DARK, SpiritType.STEEL],
      [SpiritType.POISON]: [SpiritType.GRASS, SpiritType.FAIRY],
      [SpiritType.GROUND]: [SpiritType.FIRE, ELECTRIC: SpiritType.ELECTRIC, SpiritType.POISON, ROCK: SpiritType.ROCK, SpiritType.STEEL],
      [SpiritType.FLYING]: [SpiritType.GRASS, FIGHTING: SpiritType.FIGHTING, SpiritType.BUG],
      [SpiritType.PSYCHIC]: [SpiritType.FIGHTING, SpiritType.POISON],
      [SpiritType.BUG]: [SpiritType.GRASS, PSYCHIC: SpiritType.PSYCHIC, SpiritType.DARK],
      [SpiritType.ROCK]: [SpiritType.FIRE, FLYING: SpiritType.FLYING, SpiritType.BUG],
      [SpiritType.GHOST]: [SpiritType.PSYCHIC, SpiritType.GHOST],
      [SpiritType.DRAGON]: [SpiritType.DRAGON],
      [SpiritType.DARK]: [SpiritType.PSYCHIC, SpiritType.GHOST],
      [SpiritType.STEEL]: [SpiritType.ICE, ROCK: SpiritType.ROCK, SpiritType.FAIRY],
      [SpiritType.FAIRY]: [SpiritType.FIGHTING, DRAGON: SpiritType.DRAGON, SpiritType.DARK]
    };

    const typesToCheck = [this.primaryType];
    if (this.secondaryType) {
      typesToCheck.push(this.secondaryType);
    }

    let effectiveness = 1;
    for (const type of typesToCheck) {
      if (superEffective[attackingType]?.includes(type)) {
        effectiveness *= 2;
      }
    }

    return effectiveness;
  }

  /**
   * Check if spirit has move
   */
  hasMove(moveId: string): boolean {
    return this.moves.some(move => move.id === moveId);
  }

  /**
   * Learn move
   */
  learnMove(move: ISpiritMove): boolean {
    if (this.hasMove(move.id)) {
      return false; // Already knows move
    }

    if (this.moves.length >= 4) {
      return false; // No space for new move
    }

    this.moves.push(move);
    return true;
  }

  /**
   * Forget move
   */
  forgetMove(moveId: string): boolean {
    const index = this.moves.findIndex(move => move.id === moveId);
    if (index >= 0) {
      this.moves.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get move by ID
   */
  getMoveById(moveId: string): ISpiritMove | null {
    return this.moves.find(move => move.id === moveId) || null;
  }

  /**
   * Get lore entry
   */
  getLoreEntry(loreId: string): ISpiritLore | null {
    return this.loreEntries.find(lore => lore.id === loreId) || null;
  }

  /**
   * Unlock lore
   */
  unlockLore(loreId: string): boolean {
    const lore = this.getLoreEntry(loreId);
    if (lore && !lore.unlocked) {
      lore.unlocked = true;
      return true;
    }
    return false;
  }

  /**
   * Check if lore is unlocked
   */
  isLoreUnlocked(loreId: string): boolean {
    const lore = this.getLoreEntry(loreId);
    return lore?.unlocked || false;
  }

  /**
   * Get all lore IDs
   */
  getAllLoreIds(): string[] {
    return this.loreEntries.map((lore: any) => lore.id);
  }

  /**
   * Get unlocked lore IDs
   */
  getUnlockedLoreIds(): string[] {
    return this.loreEntries.filter((lore: any) => lore.unlocked).map((lore: any) => lore.id);
  }

  /**
   * Get sync description
   */
  getSyncDescription(): string {
    if (this.syncLevel >= 90) return 'Perfect Harmony';
    if (this.syncLevel >= 70) return 'Strong Bond';
    if (this.syncLevel >= 50) return 'Good Connection';
    if (this.syncLevel >= 30) return 'Growing Bond';
    if (this.syncLevel >= 10) return 'New Friendship';
    return 'Just Met';
  }

  /**
   * Get rarity description
   */
  getRarityDescription(): string {
    switch (this.rarity) {
      case COMMON: return 'Common';
      case UNCOMMON: return 'Uncommon';
      case RARE: return 'Rare';
      case EPIC: return 'Epic';
      case LEGENDARY: return 'Legendary';
      case MYTHICAL: return 'Mythical';
      case UNIQUE: return 'Unique';
      default: return 'Unknown';
    }
  }

  /**
   * Get type description
   */
  getTypeDescription(): string {
    const types = [this.primaryType];
    if (this.secondaryType) {
      types.push(this.secondaryType);
    }
    return types.join('/');
  }

  /**
   * Get habitat description
   */
  getHabitatDescription(): string {
    return this.habitat.join(', ');
  }

  /**
   * Convert to JSON
   */
  toJSON(): Record<string, any> {
    return {
      spiritId: this.spiritId,
      spiritName: this.spiritName,
      description: this.description,
      primaryType: this.primaryType,
      secondaryType: this.secondaryType,
      rarity: this.rarity,
      level: this.level,
      experience: this.experience,
      maxExperience: this.maxExperience,
      evolutionStage: this.evolutionStage,
      evolutions: this.evolutions,
      stats: this.stats,
      moves: this.moves,
      abilities: this.abilities,
      hiddenAbilities: this.hiddenAbilities,
      height: this.height,
      weight: this.weight,
      genderRatio: this.genderRatio,
      eggGroups: this.eggGroups,
      hatchSteps: this.hatchSteps,
      friendship: this.friendship,
      growthRate: this.growthRate,
      catchRate: this.catchRate,
      baseExperience: this.baseExperience,
      evYield: this.evYield,
      habitat: this.habitat,
      region: this.region,
      generation: this.generation,
      isCaptured: this.isCaptured,
      captureDate: this.captureDate?.toISOString(),
      captureLocation: this.captureLocation,
      captureLevel: this.captureLevel,
      isFavorite: this.isFavorite,
      nickname: this.nickname,
      trainerId: this.trainerId,
      trainerName: this.trainerName,
      syncLevel: this.syncLevel,
      loreEntries: this.loreEntries,
      sprites: this.sprites,
      cries: this.cries,
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: Record<string, any>): Spirit {
    const spirit = new Spirit(
      data.spiritId,
      data.spiritName,
      data.description,
      data.primaryType,
      data.secondaryType,
      data.rarity
    );

    Object.assign(spirit, data);
    spirit.captureDate = data.captureDate ? new Date(data.captureDate) : undefined;

    return spirit;
  }

  /**
   * Clone spirit
   */
  clone(): Spirit {
    return Spirit.fromJSON(this.toJSON());
  }

  // Helper methods
  private hasItem(itemId: string): boolean {
    // This would check player's inventory in a real implementation
    return false;
  }

  private isTimeOfDay(timeOfDay: string): boolean {
    const hour = new Date().getHours();
    switch (timeOfDay) {
      case 'day': return hour >= 6 && hour < 18;
      case 'night': return hour >= 18 || hour < 6;
      case 'dawn': return hour >= 5 && hour < 7;
      case 'dusk': return hour >= 17 && hour < 19;
      default: return true;
    }
  }

  private isWeather(weather: string): boolean {
    // This would check current weather in a real implementation
    return true;
  }

  private getGender(): 'male' | 'female' {
    // This would be determined by the spirit's gender or random
    return 'male';
  }
}

/**
 * Spirit collection implementation
 */
export class SpiritCollection implements ISpiritCollection {
  public spirits: ISpirit[];
  public capturedSpirits: ISpirit[];
  public uncapturedSpirits: ISpirit[];
  public favoriteSpirits: ISpirit[];

  constructor(spirits: ISpirit[] = []) {
    this.spirits = [...spirits];
    this.updateCollections();
  }

  /**
   * Create collection
   */
  static create(spirits?: ISpirit[]): SpiritCollection {
    return new SpiritCollection(spirits);
  }

  /**
   * Update collections
   */
  private updateCollections(): void {
    this.capturedSpirits = this.spirits.filter((spirit: any) => spirit.isCaptured);
    this.uncapturedSpirits = this.spirits.filter((spirit: any) => !spirit.isCaptured);
    this.favoriteSpirits = this.spirits.filter((spirit: any) => spirit.isFavorite);
  }

  /**
   * Get collection properties
   */
  get totalSpirits(): number {
    return this.spirits.length;
  }

  get capturedCount(): number {
    return this.capturedSpirits.length;
  }

  get completionPercentage(): number {
    return this.totalSpirits > 0 ? (this.capturedCount / this.totalSpirits) * 100 : 0;
  }

  /**
   * Add spirit
   */
  addSpirit(spirit: ISpirit): void {
    if (!this.hasSpirit(spirit.spiritId)) {
      this.spirits.push(spirit);
      this.updateCollections();
    }
  }

  /**
   * Remove spirit
   */
  removeSpirit(spiritId: string): boolean {
    const index = this.spirits.findIndex(spirit => spirit.spiritId === spiritId);
    if (index >= 0) {
      this.spirits.splice(index, 1);
      this.updateCollections();
      return true;
    }
    return false;
  }

  /**
   * Get spirit
   */
  getSpirit(spiritId: string): ISpirit | null {
    return this.spirits.find(spirit => spirit.spiritId === spiritId) || null;
  }

  /**
   * Check if collection has spirit
   */
  hasSpirit(spiritId: string): boolean {
    return this.spirits.some(spirit => spirit.spiritId === spiritId);
  }

  /**
   * Update spirit
   */
  updateSpirit(spiritId: string, updates: Partial<ISpirit>): boolean {
    const spirit = this.getSpirit(spiritId);
    if (spirit) {
      Object.assign(spirit, updates);
      return true;
    }
    return false;
  }

  /**
   * Get spirits by type
   */
  getSpiritsByType(type: SpiritType): ISpirit[] {
    return this.spirits.filter((spirit: any) =>
      spirit.primaryType === type || spirit.secondaryType === type
    );
  }

  /**
   * Get spirits by rarity
   */
  getSpiritsByRarity(rarity: SpiritRarity): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.rarity === rarity);
  }

  /**
   * Get spirits by region
   */
  getSpiritsByRegion(region: string): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.region === region);
  }

  /**
   * Get spirits by generation
   */
  getSpiritsByGeneration(generation: number): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.generation === generation);
  }

  /**
   * Get spirits by sync level
   */
  getSpiritsBySyncLevel(minSync: number, maxSync: number): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.syncLevel >= minSync && spirit.syncLevel <= maxSync);
  }

  /**
   * Get spirits by level
   */
  getSpiritsByLevel(minLevel: number, maxLevel: number): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.level >= minLevel && spirit.level <= maxLevel);
  }

  /**
   * Get evolved spirits
   */
  getEvolvedSpirits(): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.evolutionStage > 1);
  }

  /**
   * Get unevolved spirits
   */
  getUnevolvedSpirits(): ISpirit[] {
    return this.spirits.filter((spirit: any) => spirit.evolutionStage === 1);
  }

  /**
   * Search spirits
   */
  searchSpirits(query: string): ISpirit[] {
    const lowerQuery = query.toLowerCase();
    return this.spirits.filter((spirit: any) =>
      spirit.spiritName.toLowerCase().includes(lowerQuery) ||
      spirit.description.toLowerCase().includes(lowerQuery) ||
      spirit.spiritId.toLowerCase().includes(lowerQuery) ||
      spirit.nickname?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Sort spirits
   */
  sortSpirits(sortOption: SortOption, ascending: boolean = true): ISpirit[] {
    const sorter = new SpiritSorter();
    return sorter.sort(this.spirits, sortOption, ascending);
  }

  /**
   * Filter spirits
   */
  filterSpirits(filter: ISpiritFilter): ISpirit[] {
    return filter.apply(this.spirits);
  }

  /**
   * Get statistics
   */
  getStatistics(): Record<string, number> {
    const stats = {
      total: this.totalSpirits,
      captured: this.capturedCount,
      uncaptured: this.uncapturedSpirits.length,
      favorites: this.favoriteSpirits.length,
      completionPercentage: this.completionPercentage,
      averageLevel: this.spirits.reduce((sum, spirit) => sum + spirit.level, 0) / this.totalSpirits,
      averageSync: this.spirits.reduce((sum, spirit) => sum + spirit.syncLevel, 0) / this.totalSpirits,
      highestLevel: Math.max(...this.spirits.map((spirit: any) => spirit.level), 0),
      highestSync: Math.max(...this.spirits.map((spirit: any) => spirit.syncLevel), 0),
      totalTypes: new Set([...this.spirits.map((s: any) => s.primaryType), ...this.spirits.map((s: any) => s.secondaryType).filter(Boolean)]).size,
      uniqueRarities: new Set(this.spirits.map((s: any) => s.rarity)).size,
      uniqueRegions: new Set(this.spirits.map((s: any) => s.region)).size,
      uniqueGenerations: new Set(this.spirits.map((s: any) => s.generation)).size,
      evolvedCount: this.getEvolvedSpirits().length,
      unevolvedCount: this.getUnevolvedSpirits().length
    };

    return stats;
  }

  /**
   * Get completion by type
   */
  getCompletionByType(): Record<SpiritType, { total: number; captured: number; percentage: number }> {
    const types = Object.values(SpiritType);
    const completion: Record<string, { total: number; captured: number; percentage: number }> = {};

    types.forEach((type: any) => {
      const total = this.getSpiritsByType(type).length;
      const captured = this.getSpiritsByType(type).filter((s: any) => s.isCaptured).length;
      const percentage = total > 0 ? (captured / total) * 100 : 0;

      completion[type] = { total, captured, percentage };
    });

    return completion;
  }

  /**
   * Get completion by rarity
   */
  getCompletionByRarity(): Record<SpiritRarity, { total: number; captured: number; percentage: number }> {
    const rarities = Object.values(SpiritRarity).filter((r: any) => typeof r === 'number') as SpiritRarity[];
    const completion: Record<string, { total: number; captured: number; percentage: number }> = {};

    rarities.forEach((rarity: any) => {
      const total = this.getSpiritsByRarity(rarity).length;
      const captured = this.getSpiritsByRarity(rarity).filter((s: any) => s.isCaptured).length;
      const percentage = total > 0 ? (captured / total) * 100 : 0;

      completion[SpiritRarity[rarity]] = { total, captured, percentage };
    });

    return completion;
  }

  /**
   * Export collection
   */
  exportCollection(): Record<string, any> {
    return {
      spirits: this.spirits.map((spirit: any) => spirit.toJSON()),
      totalSpirits: this.totalSpirits,
      capturedCount: this.capturedCount,
      completionPercentage: this.completionPercentage,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import collection
   */
  importCollection(data: Record<string, any>): void {
    if (data.spirits && Array.isArray(data.spirits)) {
      this.spirits = data.spirits.map((spiritData: any) => Spirit.fromJSON(spiritData));
      this.updateCollections();
    }
  }

  /**
   * Validate collection
   */
  validateCollection(): string[] {
    const errors: string[] = [];

    this.spirits.forEach((spirit, index) => {
      const spiritErrors = spirit.validate({});
      if (spiritErrors.length > 0) {
        errors.push(`Spirit ${index} (${spirit.spiritName}): ${spiritErrors.join(', ')}`);
      }
    });

    return errors;
  }
}

/**
 * Utility functions for spirit operations
 */
export const SpiritUtils = {
  /**
   * Create default spirit filter
   */
  createDefaultFilter(): SpiritFilter {
    return new SpiritFilter();
  },

  /**
   * Create default spirit sorter
   */
  createDefaultSorter(): SpiritSorter {
    return new SpiritSorter();
  },

  /**
   * Create default spirit collection
   */
  createDefaultCollection(): SpiritCollection {
    return new SpiritCollection();
  },

  /**
   * Generate unique spirit ID
   */
  generateSpiritId(): string {
    return `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Calculate type effectiveness
   */
  calculateTypeEffectiveness(attackingType: SpiritType, defendingType: SpiritType): number {
    // This would be a complex lookup table in a real implementation
    // For now, return simple effectiveness values
    if (attackingType === defendingType) {
      return 0.5; // Not very effective
    }

    const superEffective: Record<SpiritType, SpiritType[]> = {
      [SpiritType.FIRE]: [SpiritType.GRASS, ICE: SpiritType.ICE, SpiritType.BUG],
      [SpiritType.WATER]: [SpiritType.FIRE, GROUND: SpiritType.GROUND, SpiritType.ROCK],
      [SpiritType.GRASS]: [SpiritType.WATER, GROUND: SpiritType.GROUND, SpiritType.ROCK],
      [SpiritType.ELECTRIC]: [SpiritType.WATER, SpiritType.FLYING],
      [SpiritType.ICE]: [SpiritType.GRASS, GROUND: SpiritType.GROUND, SpiritType.FLYING, SpiritType.DRAGON],
      [SpiritType.FIGHTING]: [SpiritType.NORMAL, ICE: SpiritType.ICE, SpiritType.ROCK],
      [SpiritType.POISON]: [SpiritType.GRASS, SpiritType.FAIRY],
      [SpiritType.GROUND]: [SpiritType.FIRE, ELECTRIC: SpiritType.ELECTRIC, SpiritType.POISON],
      [SpiritType.FLYING]: [SpiritType.GRASS, FIGHTING: SpiritType.FIGHTING, SpiritType.BUG],
      [SpiritType.PSYCHIC]: [SpiritType.FIGHTING, SpiritType.POISON],
      [SpiritType.BUG]: [SpiritType.GRASS, PSYCHIC: SpiritType.PSYCHIC, SpiritType.DARK],
      [SpiritType.ROCK]: [SpiritType.FIRE, FLYING: SpiritType.FLYING, SpiritType.BUG],
      [SpiritType.GHOST]: [SpiritType.PSYCHIC, SpiritType.GHOST],
      [SpiritType.DRAGON]: [SpiritType.DRAGON],
      [SpiritType.DARK]: [SpiritType.PSYCHIC, SpiritType.GHOST],
      [SpiritType.STEEL]: [SpiritType.ICE, ROCK: SpiritType.ROCK, SpiritType.FAIRY],
      [SpiritType.FAIRY]: [SpiritType.FIGHTING, DRAGON: SpiritType.DRAGON, SpiritType.DARK],
      [SpiritType.NONE]: [],
      [SpiritType.NORMAL]: [],
      [SpiritType.LIGHT]: [SpiritType.DARK, SpiritType.GHOST],
      [SpiritType.SHADOW]: [SpiritType.LIGHT, SpiritType.FAIRY],
      [SpiritType.TIME]: [SpiritType.NONE],
      [SpiritType.SPACE]: [SpiritType.NONE],
      [SpiritType.SOUND]: [SpiritType.NONE],
      [SpiritType.CHAOS]: [SpiritType.ORDER],
      [SpiritType.ORDER]: [SpiritType.CHAOS],
      [SpiritType.LIFE]: [SpiritType.DEATH],
      [SpiritType.DEATH]: [SpiritType.LIFE],
      [SpiritType.BALANCE]: []
    };

    if (superEffective[attackingType]?.includes(defendingType)) {
      return 2.0; // Super effective
    }

    return 1.0; // Normal effectiveness
  },

  /**
   * Get all spirit types
   */
  getAllSpiritTypes(): SpiritType[] {
    return Object.values(SpiritType).filter((type: any) => type !== SpiritType.NONE);
  },

  /**
   * Get type name
   */
  getTypeName(type: SpiritType): string {
    return SpiritType[type].toUpperCase();
  },

  /**
   * Get rarity name
   */
  getRarityName(rarity: SpiritRarity): string {
    switch (rarity) {
      case COMMON: return 'Common';
      case UNCOMMON: return 'Uncommon';
      case RARE: return 'Rare';
      case EPIC: return 'Epic';
      case LEGENDARY: return 'Legendary';
      case MYTHICAL: return 'Mythical';
      case UNIQUE: return 'Unique';
      default: return 'Unknown';
    }
  },

  /**
   * Calculate experience for level
   */
  calculateExperienceForLevel(level: number, growthRate: 'slow' | 'medium_slow' | 'medium_fast' | 'fast' | 'fluctuating' | 'erratic' = 'medium_fast'): number {
    if (level <= 1) return 0;

    switch (growthRate) {
      case 'slow':
        return Math.floor((5 * Math.pow(level, 3)) / 4);
      case 'medium_slow':
        return Math.floor((6 * Math.pow(level, 3)) / 5 - 15 * Math.pow(level, 2) + 100 * level - 140);
      case 'medium_fast':
        return Math.pow(level, 3);
      case 'fast':
        return Math.floor((4 * Math.pow(level, 3)) / 5);
      case 'fluctuating':
        if (level <= 15) return Math.floor(Math.pow(level, 3) * ((Math.floor((level + 1) / 3) + 24) / 50));
        if (level <= 36) return Math.floor(Math.pow(level, 3) * ((level + 14) / 50));
        return Math.floor(Math.pow(level, 3) * ((Math.floor(level / 2) + 32) / 50));
      case 'erratic':
        if (level <= 50) return Math.floor(Math.pow(level, 3) * (100 - level) / 50);
        if (level <= 68) return Math.floor(Math.pow(level, 3) * (150 - level) / 100);
        if (level <= 98) return Math.floor(Math.pow(level, 3) * Math.floor((1911 - 10 * level) / 3) / 500);
        return Math.floor(Math.pow(level, 3) * (160 - level) / 100);
      default:
        return Math.pow(level, 3);
    }
  },

  /**
   * Create demo spirit
   */
  createDemoSpirit(): Spirit {
    const spirit = Spirit.create(
      'demo_spirit',
      'Demo Spirit',
      'A demonstration spirit for testing purposes',
      SpiritType.FIRE,
      undefined,
      SpiritRarity.COMMON
    );

    spirit.level = 5;
    spirit.experience = 1250;
    spirit.maxExperience = 1500;
    spirit.stats = {
      hp: 60,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 45,
      speed: 60
    };

    return spirit;
  },

  /**
   * Create comprehensive demo collection
   */
  createDemoCollection(): SpiritCollection {
    const collection = new SpiritCollection();

    // Add various demo spirits
    collection.addSpirit(Spirit.create('fire_spirit', 'Fire Spirit', 'A fiery spirit', FIRE: SpiritType.FIRE, undefined, SpiritRarity.COMMON));
    collection.addSpirit(Spirit.create('water_spirit', 'Water Spirit', 'A watery spirit', WATER: SpiritType.WATER, undefined, SpiritRarity.UNCOMMON));
    collection.addSpirit(Spirit.create('grass_spirit', 'Grass Spirit', 'A grassy spirit', GRASS: SpiritType.GRASS, undefined, SpiritRarity.RARE));
    collection.addSpirit(Spirit.create('electric_spirit', 'Electric Spirit', 'A shocking spirit', ELECTRIC: SpiritType.ELECTRIC, undefined, SpiritRarity.EPIC));

    // Mark some as captured
    const fireSpirit = collection.getSpirit('fire_spirit');
    const waterSpirit = collection.getSpirit('water_spirit');
    if (fireSpirit) {
      fireSpirit.isCaptured = true;
      fireSpirit.syncLevel = 75;
      fireSpirit.captureDate = new Date();
    }
    if (waterSpirit) {
      waterSpirit.isCaptured = true;
      waterSpirit.syncLevel = 45;
      waterSpirit.captureDate = new Date(Date.now() - 86400000); // 1 day ago
    }

    return collection;
  }
};

/**
 * Default instances
 */
export const defaultSpiritFilter = new SpiritFilter();
export const defaultSpiritSorter = new SpiritSorter();
export const defaultSpiritCollection = new SpiritCollection();
export const defaultSpirit = Spirit.create('default', 'Default Spirit', 'Default spirit', SpiritType.NORMAL);