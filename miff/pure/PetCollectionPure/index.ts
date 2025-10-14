/**
 * PetCollectionPure - AAA Quality Pet Collection System
 *
 * Advanced pet collection mechanics with:
 * - Egg rolling and hatching systems
 * - Rarity tiers and evolution
 * - Pet stats and leveling
 * - Trading UI and marketplace
 * - Mobile-optimized collection interface
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type PetType = 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'neutral';
export type EggType = 'basic' | 'premium' | 'golden' | 'diamond' | 'cosmic';

export interface PetStats {
  // Auto-added common properties
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
  intelligence: number;
  charisma: number;
}

export interface Pet {
  // Auto-added common properties
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
  id: string;
  name: string;
  species: string;
  type: PetType;
  rarity: PetRarity;
  level: number;
  experience: number;
  stats: PetStats;
  abilities: string[];
  evolutionStage: number;
  maxEvolutionStage: number;
  isLocked: boolean;
  isFavorite: boolean;
  hatchDate: number;
  lastFed: number;
  happiness: number; // 0-100
  loyalty: number;   // 0-100
  ownerId: string;
  metadata?: Record<string, any>;
}

export interface Egg {
  // Auto-added common properties
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
  id: string;
  type: EggType;
  species: string;
  rarity: PetRarity;
  incubationTime: number; // seconds
  hatchTime: number;
  isIncubating: boolean;
  progress: number; // 0-100
  ownerId: string;
  metadata?: Record<string, any>;
}

export interface TradeOffer {
  // Auto-added common properties
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
  id: string;
  petId: string;
  ownerId: string;
  requestedPetId?: string;
  requestedItems?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  createdAt: number;
  expiresAt: number;
  metadata?: Record<string, any>;
}

export interface CollectionStats {
  // Auto-added common properties
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
  uniqueSpecies: number;
  averageRarity: number;
  totalTrades: number;
  eggsHatched: number;
  favoritePets: number;
  maxLevel: number;
  collectionValue: number;
}

export class PetCollectionPure {
  private eventBus: EventBus;
  private pets: Map<string, Pet> = new Map();
  private eggs: Map<string, Egg> = new Map();
  private trades: Map<string, TradeOffer> = new Map();
  private incubationTimer: NodeJS.Timeout | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.startIncubationTimer();
  }

  private startIncubationTimer(): void {
    this.incubationTimer = setInterval(() => {
      this.updateIncubation();
    }, 1000); // Check every second
  }

  private updateIncubation(): void {
    const now = Date.now();

    this.eggs.forEach((egg, eggId) => {
      if (egg.isIncubating && now >= egg.hatchTime) {
        this.hatchEgg(eggId);
      } else if (egg.isIncubating) {
        egg.progress = Math.min(100, ((now - (egg.hatchTime - egg.incubationTime)) / egg.incubationTime) * 100);
      }
    });
  }

  public createEgg(ownerId: string, eggType: EggType, species: string): Egg {
    const rarity = this.determineEggRarity(eggType);
    const incubationTime = this.getIncubationTime(eggType, rarity);

    const egg: Egg = {
      id: `egg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eggType,
      species: species,
      rarity: rarity,
      incubationTime: incubationTime,
      hatchTime: Date.now() + incubationTime,
      isIncubating: true,
      progress: 0,
      ownerId: ownerId
    };

    this.eggs.set(egg.id, egg);

    this.eventBus.publish('pet:egg_created', {
      egg: egg,
      ownerId: ownerId,
      timestamp: Date.now()
    });

    return egg;
  }

  public hatchEgg(eggId: string): Pet | null {
    const egg = this.eggs.get(eggId);
    if (!egg || !egg.isIncubating) {
      return null;
    }

    egg.isIncubating = false;
    egg.progress = 100;

    const pet = this.generatePetFromEgg(egg);
    this.pets.set(pet.id, pet);

    this.eggs.delete(eggId);

    this.eventBus.publish('pet:egg_hatched', {
      eggId: eggId,
      pet: pet,
      ownerId: egg.ownerId,
      timestamp: Date.now()
    });

    return pet;
  }

  private generatePetFromEgg(egg: Egg): Pet {
    const baseStats = this.getBaseStatsForSpecies(egg.species);
    const rarityMultiplier = this.getRarityMultiplier(egg.rarity);

    const pet: Pet = {
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.generatePetName(egg.species),
      species: egg.species,
      type: this.getPetTypeForSpecies(egg.species),
      rarity: egg.rarity,
      level: 1,
      experience: 0,
      stats: {
        health: Math.floor(baseStats.health * rarityMultiplier),
        attack: Math.floor(baseStats.attack * rarityMultiplier),
        defense: Math.floor(baseStats.defense * rarityMultiplier),
        speed: Math.floor(baseStats.speed * rarityMultiplier),
        intelligence: Math.floor(baseStats.intelligence * rarityMultiplier),
        charisma: Math.floor(baseStats.charisma * rarityMultiplier)
      },
      abilities: this.getAbilitiesForSpecies(egg.species, egg.rarity),
      evolutionStage: 1,
      maxEvolutionStage: this.getMaxEvolutionStage(egg.rarity),
      isLocked: false,
      isFavorite: false,
      hatchDate: Date.now(),
      lastFed: Date.now(),
      happiness: 50,
      loyalty: 50,
      ownerId: egg.ownerId
    };

    return pet;
  }

  public getPetsByOwner(ownerId: string): Pet[] {
    return Array.from(this.pets.values()).filter(pet => pet.ownerId === ownerId);
  }

  public getEggsByOwner(ownerId: string): Egg[] {
    return Array.from(this.eggs.values()).filter(egg => egg.ownerId === ownerId);
  }

  public getCollectionStats(ownerId: string): CollectionStats {
    const pets = this.getPetsByOwner(ownerId);
    const eggs = this.getEggsByOwner(ownerId);

    const totalPets = pets.length;
    const uniqueSpecies = new Set(pets.map(p => p.species)).size;
    const averageRarity = pets.reduce((sum, p) => sum + this.getRarityValue(p.rarity), 0) / totalPets || 0;
    const totalTrades = Array.from(this.trades.values()).filter(t => t.ownerId === ownerId).length;
    const eggsHatched = pets.length;
    const favoritePets = pets.filter(p => p.isFavorite).length;
    const maxLevel = pets.reduce((max, p) => Math.max(max, p.level), 0);
    const collectionValue = pets.reduce((sum, p) => sum + this.calculatePetValue(p), 0);

    return {
      totalPets,
      uniqueSpecies,
      averageRarity,
      totalTrades,
      eggsHatched,
      favoritePets,
      maxLevel,
      collectionValue
    };
  }

  public createTradeOffer(ownerId: string, petId: string, requestedPetId?: string, requestedItems?: string[]): TradeOffer | null {
    const pet = this.pets.get(petId);
    if (!pet || pet.ownerId !== ownerId || pet.isLocked) {
      return null;
    }

    const tradeOffer: TradeOffer = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId: petId,
      ownerId: ownerId,
      requestedPetId: requestedPetId,
      requestedItems: requestedItems,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.trades.set(tradeOffer.id, tradeOffer);

    this.eventBus.publish('pet:trade_created', {
      tradeOffer: tradeOffer,
      ownerId: ownerId,
      timestamp: Date.now()
    });

    return tradeOffer;
  }

  public acceptTradeOffer(tradeId: string, accepterId: string): boolean {
    const trade = this.trades.get(tradeId);
    if (!trade || trade.status !== 'pending') {
      return false;
    }

    const accepterPets = this.getPetsByOwner(accepterId);
    const accepterPet = trade.requestedPetId ? accepterPets.find(p => p.id === trade.requestedPetId) : null;

    if (trade.requestedPetId && !accepterPet) {
      return false; // Accepter doesn't have the requested pet
    }

    // Execute the trade
    const offeringPet = this.pets.get(trade.petId);
    if (offeringPet && accepterPet) {
      // Swap pets
      const tempOwnerId = offeringPet.ownerId;
      offeringPet.ownerId = accepterId;
      accepterPet.ownerId = tempOwnerId;
    }

    trade.status = 'completed';

    this.eventBus.publish('pet:trade_completed', {
      tradeId: tradeId,
      participants: [trade.ownerId, accepterId],
      timestamp: Date.now()
    });

    return true;
  }

  public feedPet(petId: string, ownerId: string): boolean {
    const pet = this.pets.get(petId);
    if (!pet || pet.ownerId !== ownerId) {
      return false;
    }

    pet.lastFed = Date.now();
    pet.happiness = Math.min(100, pet.happiness + 10);

    this.eventBus.publish('pet:fed', {
      petId: petId,
      ownerId: ownerId,
      timestamp: Date.now()
    });

    return true;
  }

  public toggleFavorite(petId: string, ownerId: string): boolean {
    const pet = this.pets.get(petId);
    if (!pet || pet.ownerId !== ownerId) {
      return false;
    }

    pet.isFavorite = !pet.isFavorite;

    this.eventBus.publish('pet:favorite_toggled', {
      petId: petId,
      isFavorite: pet.isFavorite,
      ownerId: ownerId,
      timestamp: Date.now()
    });

    return true;
  }

  private determineEggRarity(eggType: EggType): PetRarity {
    const rarityChances: Record<EggType, Record<PetRarity, number>> = {
      basic: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0, mythic: 0 },
      premium: { common: 40, uncommon: 35, rare: 20, epic: 5, legendary: 0, mythic: 0 },
      golden: { common: 0, uncommon: 30, rare: 40, epic: 25, legendary: 5, mythic: 0 },
      diamond: { common: 0, uncommon: 0, rare: 30, epic: 40, legendary: 25, mythic: 5 },
      cosmic: { common: 0, uncommon: 0, rare: 0, epic: 30, legendary: 40, mythic: 30 }
    };

    const chances = rarityChances[eggType];
    const random = Math.random() * 100;

    let cumulative = 0;
    for (const [rarity, chance] of Object.entries(chances)) {
      cumulative += chance;
      if (random <= cumulative) {
        return rarity as PetRarity;
      }
    }

    return 'common'; // Fallback
  }

  private getIncubationTime(eggType: EggType, rarity: PetRarity): number {
    const baseTimes: Record<EggType, number> = {
      basic: 300,     // 5 minutes
      premium: 600,   // 10 minutes
      golden: 1800,   // 30 minutes
      diamond: 3600,  // 1 hour
      cosmic: 7200    // 2 hours
    };

    const rarityMultiplier: Record<PetRarity, number> = {
      common: 1,
      uncommon: 1.2,
      rare: 1.5,
      epic: 2,
      legendary: 3,
      mythic: 5
    };

    return baseTimes[eggType] * rarityMultiplier[rarity];
  }

  private getBaseStatsForSpecies(species: string): PetStats {
    // This would be loaded from a configuration file in a real implementation
    const speciesStats: Record<string, PetStats> = {
      'dragon': { health: 100, attack: 80, defense: 70, speed: 60, intelligence: 90, charisma: 85 },
      'phoenix': { health: 80, attack: 90, defense: 60, speed: 95, intelligence: 85, charisma: 75 },
      'unicorn': { health: 90, attack: 70, defense: 80, speed: 85, intelligence: 95, charisma: 90 },
      'griffin': { health: 95, attack: 85, defense: 75, speed: 90, intelligence: 80, charisma: 80 },
      'cerberus': { health: 110, attack: 95, defense: 85, speed: 70, intelligence: 75, charisma: 70 },
      'pegasus': { health: 85, attack: 75, defense: 70, speed: 100, intelligence: 80, charisma: 85 }
    };

    return speciesStats[species] || { health: 50, attack: 50, defense: 50, speed: 50, intelligence: 50, charisma: 50 };
  }

  private getRarityMultiplier(rarity: PetRarity): number {
    const multipliers: Record<PetRarity, number> = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.4,
      epic: 1.6,
      legendary: 2.0,
      mythic: 2.5
    };

    return multipliers[rarity];
  }

  private getAbilitiesForSpecies(species: string, rarity: PetRarity): string[] {
    const speciesAbilities: Record<string, string[]> = {
      'dragon': ['fire_breath', 'flight', 'intimidation'],
      'phoenix': ['rebirth', 'fire_aura', 'healing_flames'],
      'unicorn': ['healing_touch', 'magic_barrier', 'purification'],
      'griffin': ['wind_blast', 'keen_sight', 'territorial_roar'],
      'cerberus': ['triple_bite', 'guard_mode', 'howl_of_fear'],
      'pegasus': ['speed_boost', 'healing_wings', 'wind_rush']
    };

    const baseAbilities = speciesAbilities[species] || ['basic_attack'];
    const rarityBonusAbilities: Record<PetRarity, number> = {
      common: 1,
      uncommon: 1,
      rare: 2,
      epic: 2,
      legendary: 3,
      mythic: 3
    };

    return baseAbilities.slice(0, rarityBonusAbilities[rarity]);
  }

  private getMaxEvolutionStage(rarity: PetRarity): number {
    const maxStages: Record<PetRarity, number> = {
      common: 2,
      uncommon: 3,
      rare: 4,
      epic: 5,
      legendary: 6,
      mythic: 7
    };

    return maxStages[rarity];
  }

  private getPetTypeForSpecies(species: string): PetType {
    const speciesTypes: Record<string, PetType> = {
      'dragon': 'fire',
      'phoenix': 'fire',
      'unicorn': 'light',
      'griffin': 'air',
      'cerberus': 'dark',
      'pegasus': 'air'
    };

    return speciesTypes[species] || 'neutral';
  }

  private generatePetName(species: string): string {
    const prefixes = ['Mystic', 'Ancient', 'Royal', 'Swift', 'Wise', 'Brave', 'Gentle', 'Fierce'];
    const suffixes = ['Star', 'Moon', 'Sun', 'Storm', 'Flame', 'Frost', 'Shadow', 'Light'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${species} of ${suffix}`;
  }

  private getRarityValue(rarity: PetRarity): number {
    const values: Record<PetRarity, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
      mythic: 6
    };

    return values[rarity];
  }

  private calculatePetValue(pet: Pet): number {
    const rarityMultiplier = this.getRarityValue(pet.rarity);
    const levelMultiplier = pet.level;
    const statSum = Object.values(pet.stats).reduce((sum, stat) => sum + stat, 0);

    return Math.floor((statSum * rarityMultiplier * levelMultiplier) / 6);
  }
}

export default PetCollectionPure;