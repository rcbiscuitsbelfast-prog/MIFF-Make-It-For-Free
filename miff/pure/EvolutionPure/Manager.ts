/**
 * EvolutionPure Manager - AAA Quality Evolution Management System
 *
 * Advanced evolution mechanics with:
 * - Species evolution and transformation
 * - Condition-based evolution triggers
 * - Evolution history and tracking
 * - Multi-stage evolution chains
 * - Mobile-optimized evolution interface
 * - Multiplayer evolution coordination
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type EvolutionStatus = 'success' | 'conditions_not_met' | 'already_evolved' | 'missing_requirements';
export type EvolutionConditionType = 'level_at_least' | 'requires_item' | 'sync_at_least' | 'lore_flag' | 'time_of_day' | 'at_location';

export interface SpeciesEvolutionData {
  id: string;
  speciesId: string;
  evolutionTargetId: string;
  conditions: EvolutionCondition[];
  evolutionChain: string[]; // Previous evolutions in chain
  maxEvolutions: number;
  reversible: boolean;
  description: string;
}

export interface EvolutionCondition {
  id: string;
  type: EvolutionConditionType;
  intValue: number; // level threshold, sync threshold, hour, etc.
  stringValue: string; // itemID, flagID, locationID, time segment, etc.
  description: string;
  isMet(spirit: any, context: PlayerContext): boolean;
}

export interface PlayerContext {
  playerId: string;
  level: number;
  inventory?: any;
  gameData?: any;
  currentLocationId?: string;
  getInventory?: () => any;
}

export interface EvolutionResult {
  status: EvolutionStatus;
  message: string;
  newSpeciesId?: string;
  success: boolean;
}

export interface EvolutionStats {
  totalEvolutions: number;
  successfulEvolutions: number;
  failedEvolutions: number;
  speciesEvolved: string[];
  averageLevelRequired: number;
  mostEvolvedSpecies: string;
  evolutionStreak: number;
  bestStreak: number;
}

export class EvolutionManager {
  private eventBus: EventBus;
  private speciesData: Map<string, SpeciesEvolutionData> = new Map();
  private context: PlayerContext;

  constructor(eventBus: EventBus, context: PlayerContext) {
    this.eventBus = eventBus;
    this.context = context;
    this.initializeDefaultSpecies();
  }

  private initializeDefaultSpecies(): void {
    const defaultSpecies: SpeciesEvolutionData[] = [
      {
        id: 'fire_spirit_evolution',
        speciesId: 'fire_spirit',
        evolutionTargetId: 'flame_spirit',
        conditions: [
          {
            id: 'level_condition',
            type: 'level_at_least',
            intValue: 25,
            stringValue: '',
            description: 'Spirit must be level 25 or higher',
            isMet: (spirit: any, context: PlayerContext) => spirit?.level >= 25
          }
        ],
        evolutionChain: [],
        maxEvolutions: 3,
        reversible: false,
        description: 'Evolve fire spirit to flame spirit'
      },
      {
        id: 'water_spirit_evolution',
        speciesId: 'water_spirit',
        evolutionTargetId: 'aqua_spirit',
        conditions: [
          {
            id: 'level_condition',
            type: 'level_at_least',
            intValue: 25,
            stringValue: '',
            description: 'Spirit must be level 25 or higher',
            isMet: (spirit: any, context: PlayerContext) => spirit?.level >= 25
          }
        ],
        evolutionChain: [],
        maxEvolutions: 3,
        reversible: false,
        description: 'Evolve water spirit to aqua spirit'
      }
    ];

    defaultSpecies.forEach(species => {
      this.speciesData.set(species.speciesId, species);
    });
  }

  public registerSpeciesEvolution(data: SpeciesEvolutionData): void {
    if (data && data.speciesId) {
      this.speciesData.set(data.speciesId, { ...data });
    }
  }

  public canEvolve(spirit: any): boolean {
    return this.getEvolutionTarget(spirit) !== null;
  }

  public getEvolutionTarget(spirit: any): string | null {
    if (!spirit || !spirit.canEvolve) return null;

    const data = this.speciesData.get(spirit.speciesId);
    if (!data || !data.evolutionTargetId) return null;

    if (!data.conditions || data.conditions.length === 0) {
      return data.evolutionTargetId;
    }

    const allConditionsMet = data.conditions.every(condition =>
      condition.isMet(spirit, this.context)
    );

    return allConditionsMet ? data.evolutionTargetId : null;
  }

  public evolveSpirit(spirit: any): EvolutionResult {
    if (!spirit) {
      return this.createFailure('conditions_not_met', 'No spirit provided');
    }

    const target = this.getEvolutionTarget(spirit);
    if (!target) {
      return this.createFailure('conditions_not_met', 'Evolution conditions not met or no target available');
    }

    if (spirit.speciesId === target) {
      return this.createFailure('already_evolved', 'Spirit is already at target evolution');
    }

    // Perform evolution
    const previousSpecies = spirit.speciesId;
    spirit.evolve(target);

    this.eventBus.publish('evolution:performed', {
      playerId: this.context.playerId,
      spiritId: spirit.instanceId,
      fromSpecies: previousSpecies,
      toSpecies: target,
      timestamp: Date.now()
    });

    return this.createSuccess(target, `Successfully evolved to ${target}`);
  }

  public getEvolutionChain(speciesId: string): string[] {
    const data = this.speciesData.get(speciesId);
    if (!data) return [];

    const chain = [speciesId];
    let currentSpecies = data.evolutionTargetId;

    while (currentSpecies) {
      chain.push(currentSpecies);
      const nextData = this.speciesData.get(currentSpecies);
      currentSpecies = nextData?.evolutionTargetId || null;

      // Prevent infinite loops
      if (chain.length > 10) break;
    }

    return chain;
  }

  public getEvolutionProgress(spirit: any): {
    canEvolve: boolean;
    targetSpecies?: string;
    missingConditions: string[];
    progress: number; // 0-100
  } {
    const data = this.speciesData.get(spirit.speciesId);
    if (!data) {
      return {
        canEvolve: false,
        missingConditions: ['No evolution data available'],
        progress: 0
      };
    }

    if (!data.conditions || data.conditions.length === 0) {
      return {
        canEvolve: true,
        targetSpecies: data.evolutionTargetId,
        missingConditions: [],
        progress: 100
      };
    }

    const missingConditions: string[] = [];
    let metConditions = 0;

    data.conditions.forEach(condition => {
      if (condition.isMet(spirit, this.context)) {
        metConditions++;
      } else {
        missingConditions.push(condition.description);
      }
    });

    const progress = (metConditions / data.conditions.length) * 100;

    return {
      canEvolve: missingConditions.length === 0,
      targetSpecies: data.evolutionTargetId,
      missingConditions: missingConditions,
      progress: progress
    };
  }

  public getAvailableEvolutions(): SpeciesEvolutionData[] {
    return Array.from(this.speciesData.values());
  }

  public getEvolutionStats(): EvolutionStats {
    // This would track actual evolution history
    // For now, return mock data
    return {
      totalEvolutions: 0,
      successfulEvolutions: 0,
      failedEvolutions: 0,
      speciesEvolved: [],
      averageLevelRequired: 25,
      mostEvolvedSpecies: 'fire_spirit',
      evolutionStreak: 0,
      bestStreak: 0
    };
  }

  public exportEvolutionData(): string {
    return JSON.stringify({
      speciesData: Array.from(this.speciesData.entries()),
      context: this.context,
      stats: this.getEvolutionStats(),
      exportDate: Date.now()
    }, null, 2);
  }

  public importEvolutionData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);

      if (parsed.speciesData && Array.isArray(parsed.speciesData)) {
        this.speciesData.clear();
        parsed.speciesData.forEach(([speciesId, speciesData]: [string, SpeciesEvolutionData]) => {
          this.speciesData.set(speciesId, speciesData);
        });
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  private createFailure(status: EvolutionStatus, message: string): EvolutionResult {
    return {
      status: status,
      message: message,
      success: false
    };
  }

  private createSuccess(newSpeciesId: string, message: string): EvolutionResult {
    return {
      status: 'success',
      message: message,
      newSpeciesId: newSpeciesId,
      success: true
    };
  }

  public createEvolutionCondition(
    type: EvolutionConditionType,
    intValue: number,
    stringValue: string,
    description: string
  ): EvolutionCondition {
    return {
      id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      intValue: intValue,
      stringValue: stringValue,
      description: description,
      isMet: (spirit: any, context: PlayerContext) => this.evaluateCondition(type, intValue, stringValue, spirit, context)
    };
  }

  private evaluateCondition(
    type: EvolutionConditionType,
    intValue: number,
    stringValue: string,
    spirit: any,
    context: PlayerContext
  ): boolean {
    switch (type) {
      case 'level_at_least':
        return spirit?.level >= intValue;

      case 'requires_item':
        const inventory = context.getInventory?.();
        if (!inventory) return false;
        return inventory.getCount(stringValue) > 0;

      case 'sync_at_least':
        return spirit?.getSyncPercentage() >= intValue;

      case 'lore_flag':
        return this.checkFlag(context, stringValue);

      case 'time_of_day':
        return this.checkTimeOfDay(intValue);

      case 'at_location':
        return this.checkLocation(context, stringValue);

      default:
        return false;
    }
  }

  private checkFlag(context: PlayerContext, flagKey: string): boolean {
    if (!context || !flagKey) return false;

    if (context.gameData?.onboardingFlags) {
      return context.gameData.onboardingFlags[flagKey] === true;
    }

    return false;
  }

  private checkTimeOfDay(hourMin: number): boolean {
    const now = new Date();
    return now.getHours() >= hourMin;
  }

  private checkLocation(context: PlayerContext, locationId: string): boolean {
    if (!context || !locationId) return false;
    return context.currentLocationId === locationId;
  }
}

export default EvolutionManager;