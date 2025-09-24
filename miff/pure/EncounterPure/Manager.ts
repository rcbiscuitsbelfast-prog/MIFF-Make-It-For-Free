/**
 * EncounterPure Manager - Encounter and Event System
 *
 * Advanced encounter management with:
 * - Random encounter generation
 * - Event triggering and management
 * - Probability calculations
 * - Encounter balancing
 * - Performance optimization
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

export interface EncounterConfig {
  baseEncounterRate: number;
  maxEncountersPerArea: number;
  enableRareEncounters: boolean;
  debugMode: boolean;
}

export interface Encounter {
  id: string;
  name: string;
  type: 'combat' | 'treasure' | 'event' | 'npc';
  probability: number;
  level: number;
  rewards: string[];
  requirements: string[];
  description: string;
}

export interface EncounterArea {
  id: string;
  name: string;
  encounters: Encounter[];
  baseLevel: number;
  maxLevel: number;
  encounterRate: number;
}

export class EncounterManager {
  private config: EncounterConfig;
  private areas: Map<string, EncounterArea> = new Map();
  private encounterHistory: string[] = [];
  private isInitialized: boolean = false;

  constructor(config: Partial<EncounterConfig> = {}) {
    this.config = {
      baseEncounterRate: 0.1,
      maxEncountersPerArea: 10,
      enableRareEncounters: true,
      debugMode: false,
      ...config
    };
  }

  /**
   * Initialize the encounter system
   */
  initialize(): void {
    if (this.isInitialized) return;

    console.log('[EncounterManager] Initializing encounter system...');
    
    // Initialize default areas
    this.initializeDefaultAreas();
    
    this.isInitialized = true;
    console.log('[EncounterManager] Encounter system initialized successfully');
  }

  private initializeDefaultAreas(): void {
    const defaultAreas: EncounterArea[] = [
      {
        id: 'forest',
        name: 'Mystic Forest',
        encounters: [
          {
            id: 'forest_wolf',
            name: 'Forest Wolf',
            type: 'combat',
            probability: 0.4,
            level: 5,
            rewards: ['xp', 'wolf_fang'],
            requirements: [],
            description: 'A wild wolf appears!'
          },
          {
            id: 'forest_treasure',
            name: 'Hidden Treasure',
            type: 'treasure',
            probability: 0.1,
            level: 1,
            rewards: ['gold', 'potion'],
            requirements: [],
            description: 'You found a hidden treasure!'
          }
        ],
        baseLevel: 5,
        maxLevel: 10,
        encounterRate: 0.15
      },
      {
        id: 'cave',
        name: 'Dark Cave',
        encounters: [
          {
            id: 'cave_bat',
            name: 'Cave Bat',
            type: 'combat',
            probability: 0.6,
            level: 8,
            rewards: ['xp', 'bat_wing'],
            requirements: [],
            description: 'A bat swoops down!'
          }
        ],
        baseLevel: 8,
        maxLevel: 15,
        encounterRate: 0.2
      }
    ];

    for (const area of defaultAreas) {
      this.areas.set(area.id, area);
    }
  }

  /**
   * Add an encounter area
   */
  addArea(area: EncounterArea): boolean {
    if (!area.id || !area.name) {
      console.error('[EncounterManager] Invalid area: missing required fields');
      return false;
    }

    this.areas.set(area.id, area);
    console.log(`[EncounterManager] Added area: ${area.name}`);
    return true;
  }

  /**
   * Get encounter area by ID
   */
  getArea(areaId: string): EncounterArea | undefined {
    return this.areas.get(areaId);
  }

  /**
   * Get all areas
   */
  getAreas(): EncounterArea[] {
    return Array.from(this.areas.values());
  }

  /**
   * Trigger a random encounter in an area
   */
  triggerEncounter(areaId: string, playerLevel: number = 1): Encounter | null {
    const area = this.areas.get(areaId);
    if (!area) {
      console.warn(`[EncounterManager] Area not found: ${areaId}`);
      return null;
    }

    // Check if encounter should trigger
    const roll = Math.random();
    if (roll > area.encounterRate) {
      return null;
    }

    // Filter encounters by level and requirements
    const availableEncounters = area.encounters.filter(encounter => {
      return encounter.level <= playerLevel + 5 && 
             encounter.level >= playerLevel - 2;
    });

    if (availableEncounters.length === 0) {
      return null;
    }

    // Select encounter based on probability
    const totalProbability = availableEncounters.reduce((sum, enc) => sum + enc.probability, 0);
    let random = Math.random() * totalProbability;

    for (const encounter of availableEncounters) {
      random -= encounter.probability;
      if (random <= 0) {
        this.encounterHistory.push(encounter.id);
        return encounter;
      }
    }

    return null;
  }

  /**
   * Get encounter history
   */
  getEncounterHistory(): string[] {
    return [...this.encounterHistory];
  }

  /**
   * Clear encounter history
   */
  clearHistory(): void {
    this.encounterHistory = [];
  }

  /**
   * Get encounter statistics
   */
  getStatistics(): Record<string, any> {
    const totalEncounters = this.encounterHistory.length;
    const encounterCounts = this.encounterHistory.reduce((counts, id) => {
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalEncounters,
      encounterCounts,
      areasCount: this.areas.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Reset the encounter system
   */
  reset(): void {
    this.areas.clear();
    this.encounterHistory = [];
    this.isInitialized = false;
    console.log('[EncounterManager] Encounter system reset');
  }

  /**
   * Dispose of the encounter system
   */
  dispose(): void {
    this.reset();
    console.log('[EncounterManager] Encounter system disposed');
  }
}

export default EncounterManager;