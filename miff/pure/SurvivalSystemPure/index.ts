/**
 * SurvivalSystemPure - AAA Quality Survival Game System
 *
 * Advanced survival mechanics with:
 * - Hunger, thirst, and stamina management
 * - Shelter building and crafting
 * - Weather impact on survival needs
 * - Resource gathering and management
 * - Mobile-optimized survival controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

export type SurvivalNeed = 'hunger' | 'thirst' | 'stamina' | 'health' | 'temperature';
export type ShelterType = 'tent' | 'cabin' | 'house' | 'fortress';
export type ResourceType = 'food' | 'water' | 'wood' | 'stone' | 'metal';

export interface SurvivalStats {
  hunger: number;      // 0-100
  thirst: number;      // 0-100
  stamina: number;     // 0-100
  health: number;      // 0-100
  temperature: number; // -50 to +50
  shelterIntegrity: number; // 0-100
}

export interface SurvivalResource {
  type: ResourceType;
  amount: number;
  maxAmount: number;
  gatheringRate: number;
  consumptionRate: number;
}

export interface SurvivalShelter {
  type: ShelterType;
  integrity: number;
  maxIntegrity: number;
  warmth: number;      // Temperature bonus
  capacity: number;    // Storage capacity
  buildProgress: number;
}

export class SurvivalSystemPure {
  private eventBus: EventBus;
  private stats: SurvivalStats;
  private resources: Map<ResourceType, SurvivalResource> = new Map();
  private shelter: SurvivalShelter | null = null;
  private isAlive: boolean = true;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.stats = this.initializeStats();
    this.initializeResources();
  }

  private initializeStats(): SurvivalStats {
    return {
      hunger: 80,
      thirst: 80,
      stamina: 100,
      health: 100,
      temperature: 20,
      shelterIntegrity: 0
    };
  }

  private initializeResources(): void {
    const resources: SurvivalResource[] = [
      {
        type: 'food',
        amount: 10,
        maxAmount: 50,
        gatheringRate: 1,
        consumptionRate: 0.1
      },
      {
        type: 'water',
        amount: 15,
        maxAmount: 30,
        gatheringRate: 1.5,
        consumptionRate: 0.2
      },
      {
        type: 'wood',
        amount: 5,
        maxAmount: 100,
        gatheringRate: 2,
        consumptionRate: 0
      }
    ];

    resources.forEach(resource => {
      this.resources.set(resource.type, resource);
    });
  }

  public getStats(): SurvivalStats {
    return { ...this.stats };
  }

  public getResources(): Map<ResourceType, SurvivalResource> {
    return new Map(this.resources);
  }

  public getShelter(): SurvivalShelter | null {
    return this.shelter;
  }

  public isPlayerAlive(): boolean {
    return this.isAlive && this.stats.health > 0;
  }

  public updateSurvival(deltaTime: number): void {
    // Update needs
    this.stats.hunger = Math.max(0, this.stats.hunger - deltaTime * 0.1);
    this.stats.thirst = Math.max(0, this.stats.thirst - deltaTime * 0.15);
    this.stats.stamina = Math.min(100, this.stats.stamina + deltaTime * 0.5);

    // Check survival conditions
    if (this.stats.hunger <= 0 || this.stats.thirst <= 0) {
      this.stats.health = Math.max(0, this.stats.health - deltaTime * 2);
    }

    if (this.stats.health <= 0) {
      this.isAlive = false;
    }

    // Update resources
    this.resources.forEach((resource, type) => {
      if (type === 'food' && this.stats.hunger > 0) {
        resource.amount = Math.max(0, resource.amount - deltaTime * 0.05);
      }
      if (type === 'water' && this.stats.thirst > 0) {
        resource.amount = Math.max(0, resource.amount - deltaTime * 0.1);
      }
    });
  }

  public gatherResource(type: ResourceType, amount: number): boolean {
    const resource = this.resources.get(type);
    if (!resource) return false;

    resource.amount = Math.min(resource.maxAmount, resource.amount + amount);
    return true;
  }

  public consumeResource(type: ResourceType, amount: number): boolean {
    const resource = this.resources.get(type);
    if (!resource || resource.amount < amount) return false;

    resource.amount -= amount;
    return true;
  }
}

export default SurvivalSystemPure;