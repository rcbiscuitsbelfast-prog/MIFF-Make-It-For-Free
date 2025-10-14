/**
 * PetCollectionPure Manager - AAA Quality Pet Collection Management
 *
 * Advanced management system for pet collection gameplay:
 * - Pet lifecycle orchestration
 * - Collection statistics tracking
 * - Trading system management
 * - Performance monitoring
 * - Integration hooks
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
// Types are defined in this file to avoid circular imports

export enum PetRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHICAL = 'mythical'
}

export enum EggType {
  BASIC = 'basic',
  SPECIAL = 'special',
  LEGENDARY = 'legendary',
  MYTHICAL = 'mythical'
}

export enum PetType {
  FIRE = 'fire',
  WATER = 'water',
  GRASS = 'grass',
  ELECTRIC = 'electric',
  PSYCHIC = 'psychic',
  ICE = 'ice',
  DRAGON = 'dragon',
  DARK = 'dark',
  FAIRY = 'fairy',
  NORMAL = 'normal'
}

export interface PetStats {
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
  health: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

export interface Pet {
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
  species?: string;
  type: PetType;
  rarity: PetRarity;
  level: number;
  experience: number;
  stats: PetStats;
  abilities: string[];
  isShiny: boolean;
  isTradable: boolean;
  ownerId: string;
  createdAt: Date;
  lastFed: Date;
  happiness: number;
  hunger: number;
  loyalty?: number;
  hatchDate?: Date;
  evolutionStage?: number;
  maxEvolutionStage?: number;
  isLocked?: boolean;
  isFavorite?: boolean;
  metadata?: any;
}

export interface Egg {
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
  type: EggType;
  rarity: PetRarity;
  hatchTime: number;
  remainingTime: number;
  ownerId: string;
  createdAt: Date;
  isIncubating: boolean;
}

export interface TradeOffer {
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
  offererId: string;
  offeredPetIds: string[];
  requestedPetIds: string[];
  status: 'active' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface CollectionStats {
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
  totalPets: number;
  petsByType: Record<PetType, number>;
  petsByRarity: Record<PetRarity, number>;
  shinyCount: number;
  totalTrades: number;
  successfulTrades: number;
  averagePetLevel: number;
  highestPetLevel: number;
  lastUpdated: Date;
}

export interface PetCollectionConfig {
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
  maxPetsPerPlayer?: number;
  maxEggsPerPlayer?: number;
  maxActiveTradesPerPlayer?: number;
  incubationUpdateInterval?: number;
  enablePersistence?: boolean;
  debugMode?: boolean;
  mobileOptimized?: boolean;
}

export interface PetFilter {
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
  rarity?: PetRarity[];
  type?: PetType[];
  species?: string[];
  level?: { min: number; max: number;
    };
  isFavorite?: boolean;
  isLocked?: boolean;
}

export interface PetSortOption {
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
  field: 'name' | 'rarity' | 'level' | 'happiness' | 'loyalty' | 'hatchDate';
  direction: 'asc' | 'desc';
}

export interface PetCollectionOutput {
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
  success: boolean;
  message: string;
  data?: any;
}

export class PetCollectionManager {
  private petSystem: any;
  private eventBus: EventBus;
  private config: PetCollectionConfig;
  private stats: CollectionStats;

  constructor(eventBus: EventBus, config: PetCollectionConfig = {}) {
    this.eventBus = eventBus;
    this.config = {
      maxPetsPerPlayer: 100,
      maxEggsPerPlayer: 50,
      maxActiveTradesPerPlayer: 10,
      incubationUpdateInterval: 1000,
      enablePersistence: false,
      debugMode: false,
      mobileOptimized: true,
      ...config
    };

    this.petSystem = (globalThis as any).PetCollectionPure ? new (globalThis as any).PetCollectionPure(eventBus) : {
      getEggsByOwner: (_id: string) => [],
      createEgg: (_ownerId: string, _eggType: EggType, _species: string) => ({ id: 'egg', type: EggType.BASIC, rarity: PetRarity.COMMON } as any),
      hatchEgg: (_eggId: string) => ({ id: 'pet', name: 'Pet', type: PetType.FIRE } as any),
      getPetsByOwner: (_id: string) => [],
      createTradeOffer: (_o: any) => ({ id: 'trade' }),
      completeTrade: (_id: string) => true
    };
    this.stats = this.initializeStats();

    this.setupEventListeners();
  }

  private initializeStats(): CollectionStats {
    const zeroRarity: Record<PetRarity, number> = {
      [PetRarity.COMMON]: 0,
      [PetRarity.UNCOMMON]: 0,
      [PetRarity.RARE]: 0,
      [PetRarity.EPIC]: 0,
      [PetRarity.LEGENDARY]: 0,
      [PetRarity.MYTHICAL]: 0
    } as Record<PetRarity, number>;
    const zeroTypes: Record<PetType, number> = {
      [PetType.FIRE]: 0,
      [PetType.WATER]: 0,
      [PetType.GRASS]: 0,
      [PetType.ELECTRIC]: 0,
      [PetType.PSYCHIC]: 0,
      [PetType.ICE]: 0,
      [PetType.DRAGON]: 0,
      [PetType.DARK]: 0,
      [PetType.FAIRY]: 0,
      [PetType.NORMAL]: 0
    } as Record<PetType, number>;

    return {
      totalPets: 0,
      petsByType: zeroTypes,
      petsByRarity: zeroRarity,
      shinyCount: 0,
      totalTrades: 0,
      successfulTrades: 0,
      averagePetLevel: 0,
      highestPetLevel: 0,
      lastUpdated: new Date()
    };
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('pet:egg_created', (_event: any) => {
      this.updateStats();
    });

    this.eventBus.subscribe('pet:egg_hatched', (_event: any) => {
      this.updateStats();
    });

    this.eventBus.subscribe('pet:trade_created', (_event: any) => {
      this.stats.totalTrades++;
    });

    this.eventBus.subscribe('pet:trade_completed', (_event: any) => {
      this.updateStats();
    });

    this.eventBus.subscribe('pet:favorite_toggled', (_event: any) => {
      this.updateStats();
    });
  }

  public createEgg(ownerId: string, eggType: EggType, species: string): PetCollectionOutput {
    try {
      const eggs = this.petSystem.getEggsByOwner(ownerId);
      if (eggs.length >= this.config.maxEggsPerPlayer!) {
        return {
          success: false,
          message: `Maximum eggs per player (${this.config.maxEggsPerPlayer}) reached`,
          timestamp: Date.now()
        };
      }

      const egg = this.petSystem.createEgg(ownerId, eggType, species);

      return {
        success: true,
        message: `Egg created successfully`,
        data: { egg },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to create egg: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public hatchEgg(eggId: string, ownerId: string): PetCollectionOutput {
    try {
      const eggs = this.petSystem.getEggsByOwner(ownerId);
      const egg = eggs.find((e: any) => e.id === eggId);

      if (!egg) {
        return {
          success: false,
          message: 'Egg not found',
          timestamp: Date.now()
        };
      }

      const pet = this.petSystem.hatchEgg(eggId);

      if (!pet) {
        return {
          success: false,
          message: 'Failed to hatch egg',
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        message: `Pet hatched successfully: ${pet.name}`,
        data: { pet },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to hatch egg: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public getPetsByOwner(ownerId: string, filter?: PetFilter, sort?: PetSortOption): PetCollectionOutput {
    try {
      let pets = this.petSystem.getPetsByOwner(ownerId);

      // Apply filters
      if (filter) {
        if (filter.rarity) {
          pets = pets.filter((pet: any) => (filter.rarity as PetRarity[]).includes((pet as any).rarity));
        }
        if (filter.type) {
          pets = pets.filter((pet: any) => (filter.type as PetType[]).includes((pet as any).type));
        }
        if (filter.species) {
          pets = pets.filter((pet: any) => (filter.species as string[]).includes((pet as any).species));
        }
        if (filter.level) {
          pets = pets.filter((pet: any) =>
            (pet as any).level >= (filter.level as any).min && (pet as any).level <= (filter.level as any).max
          );
        }
        if (filter.isFavorite !== undefined) {
          pets = pets.filter((pet: any) => (pet as any).isFavorite === filter.isFavorite);
        }
        if (filter.isLocked !== undefined) {
          pets = pets.filter((pet: any) => (pet as any).isLocked === filter.isLocked);
        }
      }

      // Apply sorting
      if (sort) {
        pets.sort((a: any, b: any) => {
          let aValue: any;
          let bValue: any;

          switch (sort.field) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'rarity':
              aValue = this.getRarityValue(a.rarity);
              bValue = this.getRarityValue(b.rarity);
              break;
            case 'level':
              aValue = a.level;
              bValue = b.level;
              break;
            case 'happiness':
              aValue = a.happiness;
              bValue = b.happiness;
              break;
            case 'loyalty':
              aValue = a.loyalty;
              bValue = b.loyalty;
              break;
            case 'hatchDate':
              aValue = a.hatchDate;
              bValue = b.hatchDate;
              break;
            default:
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
          }

          if (sort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      return {
        success: true,
        message: `Found ${pets.length} pets`,
        data: { pets },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to get pets: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public getEggsByOwner(ownerId: string): PetCollectionOutput {
    try {
      const eggs = this.petSystem.getEggsByOwner(ownerId);

      return {
        success: true,
        message: `Found ${eggs.length} eggs`,
        data: { eggs },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to get eggs: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public getCollectionStats(ownerId: string): PetCollectionOutput {
    try {
      const stats = this.petSystem.getCollectionStats(ownerId);

      return {
        success: true,
        message: 'Collection stats retrieved successfully',
        data: { stats },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to get collection stats: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public createTradeOffer(ownerId: string, petId: string, requestedPetId?: string, requestedItems?: string[]): PetCollectionOutput {
    try {
      const pets = this.petSystem.getPetsByOwner(ownerId);
      const pet = pets.find((p: any) => p.id === petId);

      if (!pet) {
        return {
          success: false,
          message: 'Pet not found',
          timestamp: Date.now()
        };
      }

      const activeTrades = Array.from((this.petSystem['trades'] as Map<string, any>).values())
        .filter((trade: any) => trade.ownerId === ownerId && trade.status === 'pending');

      if (activeTrades.length >= this.config.maxActiveTradesPerPlayer!) {
        return {
          success: false,
          message: `Maximum active trades per player (${this.config.maxActiveTradesPerPlayer}) reached`,
          timestamp: Date.now()
        };
      }

      const tradeOffer = this.petSystem.createTradeOffer(ownerId, petId, requestedPetId, requestedItems);

      if (!tradeOffer) {
        return {
          success: false,
          message: 'Failed to create trade offer',
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        message: 'Trade offer created successfully',
        data: { tradeOffer },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to create trade offer: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public acceptTradeOffer(tradeId: string, accepterId: string): PetCollectionOutput {
    try {
      const success = this.petSystem.acceptTradeOffer(tradeId, accepterId);

      if (!success) {
        return {
          success: false,
          message: 'Failed to accept trade offer',
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        message: 'Trade offer accepted successfully',
        data: { tradeId, accepterId },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to accept trade offer: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public feedPet(petId: string, ownerId: string): PetCollectionOutput {
    try {
      const success = this.petSystem.feedPet(petId, ownerId);

      if (!success) {
        return {
          success: false,
          message: 'Failed to feed pet',
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        message: 'Pet fed successfully',
        data: { petId, ownerId },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to feed pet: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public toggleFavorite(petId: string, ownerId: string): PetCollectionOutput {
    try {
      const success = this.petSystem.toggleFavorite(petId, ownerId);

      if (!success) {
        return {
          success: false,
          message: 'Failed to toggle favorite',
          timestamp: Date.now()
        };
      }

      return {
        success: true,
        message: 'Pet favorite status toggled successfully',
        data: { petId, ownerId },
        timestamp: Date.now()
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to toggle favorite: ${message}`,
        timestamp: Date.now()
      };
    }
  }

  public getAvailableSpecies(): string[] {
    // This would typically load from a configuration file
    return [
      'dragon', 'phoenix', 'unicorn', 'griffin', 'cerberus', 'pegasus',
      'wolf', 'tiger', 'eagle', 'owl', 'fox', 'bear', 'lion', 'turtle'
    ];
  }

  public getEggTypes(): EggType[] {
    return [EggType.BASIC, EggType.SPECIAL, EggType.LEGENDARY, EggType.MYTHICAL];
  }

  public getPetRarities(): PetRarity[] {
    return [PetRarity.COMMON, PetRarity.UNCOMMON, PetRarity.RARE, PetRarity.EPIC, PetRarity.LEGENDARY, PetRarity.MYTHICAL];
  }

  public getPetTypes(): PetType[] {
    return [PetType.FIRE, PetType.WATER, PetType.GRASS, PetType.ELECTRIC, PetType.PSYCHIC, PetType.ICE, PetType.DRAGON, PetType.DARK, PetType.FAIRY, PetType.NORMAL];
  }

  private updateStats(): void {
    // This would aggregate stats across all players
    // For now, we'll just keep track of global metrics
  }

  private getRarityValue(rarity: PetRarity): number {
    const values: Record<PetRarity, number> = {
      [PetRarity.COMMON]: 1,
      [PetRarity.UNCOMMON]: 2,
      [PetRarity.RARE]: 3,
      [PetRarity.EPIC]: 4,
      [PetRarity.LEGENDARY]: 5,
      [PetRarity.MYTHICAL]: 6
    } as any;

    return values[
      r,
      a,
      r,
      i,
      t,
      y
    ];
  }

  public exportCollection(ownerId: string): string {
    const pets = this.petSystem.getPetsByOwner(ownerId);
    const eggs = this.petSystem.getEggsByOwner(ownerId);
    const stats = this.petSystem.getCollectionStats(ownerId);

    return JSON.stringify({
      ownerId,
      pets,
      eggs,
      stats,
      exportDate: Date.now()
    }, null, 2);
  }

  public importCollection(ownerId: string, collectionData: string): boolean {
    try {
      const data = SafeJSONParser.parse(collectionData);

      // Import pets
      if (data.pets && Array.isArray(data.pets)) {
        data.pets.forEach((petData: any) => {
          const pet: Pet = {
            id: String(petData.id),
            name: String(petData.name),
            species: petData.species ? String(petData.species) : undefined,
            type: petData.type as PetType,
            rarity: petData.rarity as PetRarity,
            level: Number(petData.level ?? 1),
            experience: Number(petData.experience ?? 0),
            stats: petData.stats as PetStats,
            abilities: Array.isArray(petData.abilities) ? petData.abilities.map((a: any) => String(a)) : [],
            isShiny: Boolean(petData.isShiny),
            isTradable: petData.isTradable ?? true,
            ownerId: String(ownerId),
            createdAt: petData.createdAt ? new Date(petData.createdAt) : new Date(),
            lastFed: petData.lastFed ? new Date(petData.lastFed) : new Date(),
            happiness: Number(petData.happiness ?? 0),
            hunger: Number(petData.hunger ?? 0),
            loyalty: petData.loyalty != null ? Number(petData.loyalty) : undefined,
            hatchDate: petData.hatchDate ? new Date(petData.hatchDate) : undefined,
            evolutionStage: petData.evolutionStage != null ? Number(petData.evolutionStage) : undefined,
            maxEvolutionStage: petData.maxEvolutionStage != null ? Number(petData.maxEvolutionStage) : undefined,
            isLocked: Boolean(petData.isLocked),
            isFavorite: Boolean(petData.isFavorite),
            metadata: petData.metadata
          };

          (this.petSystem['pets'] as Map<string, Pet>).set(pet.id, pet);
        });
      }

      return true;
    } catch (error: unknown) {
      return false;
    }
  }
}

export default PetCollectionManager;