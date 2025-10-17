import { StructuredLogger } from '../logging/StructuredLogger';
import { EventBus } from '../../EventBusPure/index';

/**
 * Test Implementation Factory - Creates realistic test implementations
 * Replaces excessive mocks with proper test implementations for better test quality
 */

export interface TestEntity {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  stats: Map<string, number>;
  immunities: string[];
  isAlive: boolean;
  level: number;
  experience: number;
  inventory: Map<string, number>;
  position: { x: number; y: number; z: number };
}

export interface TestSpirit extends TestEntity {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  speciesId: string;
  syncPercentage: number;
  traits: string[];
  element: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface TestPlayer extends TestEntity {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  energy: number;
  fusionHistory: string[];
  lastFusionTime: number;
  unlockedSpecies: string[];
  achievements: string[];
}

export interface TestHealthSystem {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  entities: Map<string, TestEntity>;
  createEntity(entityId: string, options: Partial<TestEntity>): TestEntity;
  damageEntity(entityId: string, damage: number): boolean;
  healEntity(entityId: string, healing: number): boolean;
  getEntity(entityId: string): TestEntity!;
  isEntityAlive(entityId: string): boolean;
  killEntity(entityId: string): void;
  reviveEntity(entityId: string): void;
}

export interface TestCombatSystem {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  entities: Map<string, TestEntity>;
  activeBattles: Map<string, any>;
  startBattle(participants: string[]): string;
  endBattle(battleId: string): void;
  calculateDamage(attacker: string, target: string, damage: number): number;
  applyStatusEffect(entityId: string, effect: string, duration: number): void;
}

export interface TestRNGSystem {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  seed: number;
  values: number[];
  index: number;
  setSeed(seed: number): void;
  setNextFloat(value: number): void;
  nextFloat(): number;
  nextInt(min: number, max: number): number;
  nextBoolean(): boolean;
  shuffle<T extends object>(array: T[]): T[];
}

export interface TestInventorySystem {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  items: Map<string, number>;
  addItem(itemId: string, quantity: number): void;
  removeItem(itemId: string, quantity: number): boolean;
  getItemCount(itemId: string): number;
  hasItem(itemId: string): boolean;
  getItems(): Map<string, number>;
}

export class TestImplementationFactory {
  
  private eventBus: EventBus;
  private entities: Map<string, TestEntity> = new Map();
  private spirits: Map<string, TestSpirit> = new Map();
  private players: Map<string, TestPlayer> = new Map();

  constructor(...args: any[]) {
    
    this.eventBus = new EventBus();
  }

  /**
   * Create a realistic test entity
   */
  createTestEntity(): TestEntity {
    const entity: TestEntity = {
      id: options.id || `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: options.name || 'Test Entity',
      stats: options.stats || new Map([
        ['hp', 100],
        ['maxHp', 100],
        ['attack', 50],
        ['defense', 30],
        ['speed', 40],
        ['mana', 80],
        ['maxMana', 80]
      ]),
      immunities: options.immunities || [],
      isAlive: options.isAlive !== undefined ? options.isAlive : true,
      level: options.level || 1,
      experience: options.experience || 0,
      inventory: options.inventory || new Map(),
      position: options.position || { x: 0, y: 0, z: 0 },
      metadata: options.metadata || {}
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  /**
   * Create a realistic test spirit
   */
  createTestSpirit(): TestSpirit {
    const spirit: TestSpirit = {
      ...this.createTestEntity(options),
      speciesId: options.speciesId || 'test_spirit',
      syncPercentage: options.syncPercentage || 50,
      traits: options.traits || ['loyal', 'energetic'],
      element: options.element || 'neutral',
      rarity: options.rarity || 'common'
    };

    this.spirits.set(spirit.id, spirit);
    return spirit;
  }

  /**
   * Create a realistic test player
   */
  createTestPlayer(): TestPlayer {
    const player: TestPlayer = {
      ...this.createTestEntity(options),
      energy: options.energy || 100,
      fusionHistory: options.fusionHistory || [],
      lastFusionTime: options.lastFusionTime || 0,
      unlockedSpecies: options.unlockedSpecies || ['fire_spirit', 'water_spirit'],
      achievements: options.achievements || ['first_fusion']
    };

    this.players.set(player.id, player);
    return player;
  }

  /**
   * Create a realistic health system
   */
  createTestHealthSystem(): TestHealthSystem {
    const entities = new Map<string, TestEntity>();

    return {
      entities,
      createEntity(entityId: string, options: Partial<TestEntity> = {}): TestEntity {
        const entity = this.createTestEntity({ id: entityId, ...options });
        entities.set(entityId, entity);
        return entity;
      },
      damageEntity(entityId: string, damage: number): boolean {
        const entity = entities.get(entityId);
        if (!entity || !entity.isAlive) return false;

        const currentHp = entity.stats.get('hp') || 0;
        const newHp = Math.max(0, currentHp - damage);
        entity.stats.set('hp', newHp);

        if (newHp === 0) {
          entity.isAlive = false;
        }

        return true;
      },
      healEntity(entityId: string, healing: number): boolean {
        const entity = entities.get(entityId);
        if (!entity || !entity.isAlive) return false;

        const currentHp = entity.stats.get('hp') || 0;
        const maxHp = entity.stats.get('maxHp') || 100;
        const newHp = Math.min(maxHp, currentHp + healing);
        entity.stats.set('hp', newHp);

        return true;
      },
      getEntity(entityId: string): TestEntity! {
        return entities.get(entityId);
      },
      isEntityAlive(entityId: string): boolean {
        const entity = entities.get(entityId);
        return entity ? entity.isAlive : false;
      },
      killEntity(entityId: string): void {
        const entity = entities.get(entityId);
        if (entity) {
          entity.isAlive = false;
          entity.stats.set('hp', 0);
        }
      },
      reviveEntity(entityId: string): void {
        const entity = entities.get(entityId);
        if (entity) {
          entity.isAlive = true;
          entity.stats.set('hp', entity.stats.get('maxHp') || 100);
        }
      }
    };
  }

  /**
   * Create a realistic combat system
   */
  createTestCombatSystem(): TestCombatSystem {
    const entities = new Map<string, TestEntity>();
    const activeBattles = new Map<string, any>();

    return {
      entities,
      activeBattles,
      startBattle(participants: string[]): string {
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        activeBattles.set(battleId, {
          id: battleId,
          participants,
          startTime: new Date(),
          status: 'active'
        });
        return battleId;
      },
      endBattle(battleId: string): void {
        activeBattles.delete(battleId);
      },
      calculateDamage(attacker: string, target: string, damage: number): number {
        const attackerEntity = entities.get(attacker);
        const targetEntity = entities.get(target);
        
        if (!attackerEntity || !targetEntity) return 0;

        const attack = attackerEntity.stats.get('attack') || 0;
        const defense = targetEntity.stats.get('defense') || 0;
        
        // Simple damage calculation
        const baseDamage = damage + attack;
        const finalDamage = Math.max(1, baseDamage - defense);
        
        return finalDamage;
      },
      applyStatusEffect(entityId: string, effect: string, duration: number): void {
        const entity = entities.get(entityId);
        if (entity) {
          entity.metadata[`effect_${effect}`] = {
            effect,
            duration,
            appliedAt: new Date()
          };
        }
      }
    };
  }

  /**
   * Create a realistic RNG system
   */
  createTestRNGSystem(): TestRNGSystem {
    return {
      seed: 12345,
      values: [],
      index: 0,
      setSeed(seed: number): void {
        this.seed = seed;
        this.values = [];
        this.index = 0;
      },
      setNextFloat(value: number): void {
        this.values.push(value);
      },
      nextFloat(): number {
        if (this.values.length > 0 && this.index < this.values.length) {
          return this.values[this.index++];
        }
        // Simple LCG for deterministic testing
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
      },
      nextInt(min: number, max: number): number {
        return Math.floor(this.nextFloat() * (max - min + 1)) + min;
      },
      nextBoolean(): boolean {
        return this.nextFloat() < 0.5;
      },
      shuffle<T extends object>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(this.nextFloat() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }
    };
  }

  /**
   * Create a realistic inventory system
   */
  createTestInventorySystem(): TestInventorySystem {
    const items = new Map<string, number>();

    return {
      items,
      addItem(itemId: string, quantity: number): void {
        const current = items.get(itemId) || 0;
        items.set(itemId, current + quantity);
      },
      removeItem(itemId: string, quantity: number): boolean {
        const current = items.get(itemId) || 0;
        if (current >= quantity) {
          items.set(itemId, current - quantity);
          return true;
        }
        return false;
      },
      getItemCount(itemId: string): number {
        return items.get(itemId) || 0;
      },
      hasItem(itemId: string): boolean {
        return (items.get(itemId) || 0) > 0;
      },
      getItems(): Map<string, number> {
        return new Map(items);
      }
    };
  }

  /**
   * Create a realistic event bus
   */
  createTestEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Create a complete test environment
   */
  createTestEnvironment(): {
    healthSystem: TestHealthSystem;
    combatSystem: TestCombatSystem;
    rngSystem: TestRNGSystem;
    inventorySystem: TestInventorySystem;
    eventBus: EventBus;
    entities: Map<string, TestEntity>;
    spirits: Map<string, TestSpirit>;
    players: Map<string, TestPlayer>;
  } {
    return {
      healthSystem: this.createTestHealthSystem(),
      combatSystem: this.createTestCombatSystem(),
      rngSystem: this.createTestRNGSystem(),
      inventorySystem: this.createTestInventorySystem(),
      eventBus: this.createTestEventBus(),
      entities: this.entities,
      spirits: this.spirits,
      players: this.players
    };
  }

  /**
   * Clean up test data
   */
  cleanup(): void {
    this.entities.clear();
    this.spirits.clear();
    this.players.clear();
    this.eventBus.clearOldEvents();
  }

  /**
   * Get test statistics
   */
  getTestStats(): {
    entityCount: number;
    spiritCount: number;
    playerCount: number;
    eventCount: number;
  } {
    return {
      entityCount: this.entities.size,
      spiritCount: this.spirits.size,
      playerCount: this.players.size,
      eventCount: this.eventBus.getEventCount()
    };
  }
}

// Export default instance
export const testImplementationFactory = new TestImplementationFactory();
export default testImplementationFactory;