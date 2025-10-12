/**
 * MIFF Ritual System Pure
 *
 * Comprehensive ritual system with multi-step ceremonies, summoning mechanics, and participant requirements
 * Integrates with MagicSystemPure, EventBus, ItemsPure, and other systems
 *
 * Schema Version: v1.0.0
 */

import { EventBus } from '../EventsPure/index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
// Avoid hard dependency during type-check; stub RNG
type RNGPure = any;

// Core interfaces and types
export interface RitualParticipant {
  id: string;
  name: string;
  role: 'leader' | 'participant' | 'observer' | 'sacrifice';
  position: Vector3;
  requirements: ParticipantRequirement[];
  contributions: ParticipantContribution[];
  status: 'preparing' | 'active' | 'completed' | 'failed' | 'sacrificed';
  manaContribution?: number;
  itemContributions: string[]; // Item IDs contributed
  energySpent: number;
  experienceGained: number;
}

export interface ParticipantRequirement {
  type: 'item' | 'mana' | 'skill' | 'level' | 'alignment' | 'permission';
  requirement: string; // Item ID, skill name, permission, etc.
  quantity?: number;
  description: string;
  optional?: boolean;
}

export interface ParticipantContribution {
  type: 'mana' | 'item' | 'time' | 'effort';
  value: number;
  description: string;
  quality?: number; // 0-1 quality multiplier
}

export interface RitualStep {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in milliseconds
  type: 'preparation' | 'invocation' | 'channeling' | 'summoning' | 'binding' | 'completion';
  requirements: StepRequirement[];
  effects: RitualEffect[];
  failureEffects: RitualEffect[];
  visualEffect: string;
  soundEffect: string;
  requiredParticipants: number;
  participantRoles: string[]; // Required roles for this step
  energyCost: number;
  successRate: number; // Base success rate (0-1)
  difficultyModifier: number; // Affects participant requirements
}

export interface StepRequirement {
  type: 'participants' | 'items' | 'mana' | 'time' | 'alignment' | 'environment';
  requirement: string;
  quantity?: number;
  description: string;
}

export interface RitualEffect {
  type: 'summon' | 'buff' | 'debuff' | 'damage' | 'heal' | 'create-item' | 'environmental' | 'status' | 'experience';
  target: 'participants' | 'area' | 'summoned' | 'global' | 'specific-entity';
  magnitude: number;
  duration?: number;
  description: string;
  parameters: Map<string, any>;
  chance: number; // 0-1 probability
}

export interface SummonedEntity {
  id: string;
  name: string;
  type: 'creature' | 'spirit' | 'elemental' | 'construct' | 'avatar';
  level: number;
  health: number;
  mana: number;
  abilities: string[];
  lifespan: number; // -1 for permanent
  loyalty: number; // 0-1 loyalty to summoner
  visualAppearance: string;
  behavior: 'passive' | 'defensive' | 'aggressive' | 'controlled';
  specialAbilities: string[];
  weaknesses: string[];
  resistances: string[];
}

export interface RitualDefinition {
  id: string;
  name: string;
  description: string;
  category: 'summoning' | 'binding' | 'creation' | 'transformation' | 'divination' | 'destruction';
  tier: 'basic' | 'intermediate' | 'advanced' | 'master' | 'legendary';
  steps: RitualStep[];
  requiredParticipants: number;
  minParticipants: number;
  maxParticipants: number;
  baseDuration: number; // Total base duration in milliseconds
  manaCost: number;
  itemRequirements: string[]; // Required item IDs
  environmentRequirements: string[]; // Required environmental conditions
  alignmentRequirement: string; // Required moral/ethical alignment
  successRate: number; // Base success rate (0-1)
  failureConsequences: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  rewards: RitualReward[];
  risks: RitualRisk[];
  visualTheme: string;
  soundTheme: string;
  icon: string;
  lore: string;
  prerequisites: string[]; // Other rituals or achievements required
  cooldown: number; // Cooldown before can be performed again
  charges?: number; // Limited uses (-1 for unlimited)
}

export interface RitualReward {
  type: 'experience' | 'item' | 'knowledge' | 'ability' | 'summoned-entity' | 'permanent-buff';
  reward: string; // Item ID, ability name, etc.
  quantity?: number;
  quality?: number; // 0-1 quality multiplier
  chance: number; // 0-1 probability
  description: string;
}

export interface RitualRisk {
  type: 'participant-damage' | 'mana-drain' | 'summoned-hostile' | 'environmental-damage' | 'permanent-debuff' | 'summon-failure';
  severity: 'minor' | 'moderate' | 'severe';
  chance: number; // 0-1 probability
  description: string;
  mitigation?: string; // How to reduce or avoid this risk
}

export interface RitualInstance {
  id: string;
  definition: RitualDefinition;
  leaderId: string;
  participants: RitualParticipant[];
  currentStep: number;
  startTime: number;
  status: 'preparing' | 'active' | 'paused' | 'completed' | 'failed' | 'aborted';
  progress: number; // 0-1 overall progress
  energySpent: number;
  itemsConsumed: string[];
  effectsApplied: RitualEffect[];
  summonedEntities: SummonedEntity[];
  experienceGained: number;
  quality: number; // 0-1 ritual quality (affects results)
  environmentFactors: Map<string, number>;
  customParameters: Map<string, any>;
}

export interface RitualResult {
  success: boolean;
  ritualId: string;
  leaderId: string;
  participants: string[];
  duration: number;
  energySpent: number;
  quality: number;
  rewards: RitualReward[];
  risksTriggered: RitualRisk[];
  summonedEntities: SummonedEntity[];
  effectsApplied: RitualEffect[];
  experienceGained: number;
  failureReason?: string;
  sideEffects?: string[];
}

export interface RitualConfig {
  maxActiveRituals: number;
  maxParticipantsPerRitual: number;
  ritualTimeout: number; // Maximum time for a ritual
  qualityThresholds: {
    poor: number;
    average: number;
    good: number;
    excellent: number;
  };
  enableEnvironmentalEffects: boolean;
  enableParticipantSacrifice: boolean;
  allowInterruption: boolean;
  saveProgressOnInterrupt: boolean;
  autoAssignRoles: boolean;
  requireLeaderConsent: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export class RitualSystemPure {
  private logger: StructuredLogger;
  private ritualDefinitions: Map<string, RitualDefinition> = new Map();
  private activeRituals: Map<string, RitualInstance> = new Map();
  private completedRituals: RitualResult[] = [];
  private participants: Map<string, RitualParticipant> = new Map();
  private config: RitualConfig;
  private eventBus: EventBus;
  private rng: RNGPure;

  constructor(eventBus: EventBus, rng: RNGPure) {
    this.logger = new StructuredLogger({ module: 'RitualSystemPure' });
    this.eventBus = eventBus;
    this.rng = rng;
    this.config = this.initializeConfig();
    this.initializeBasicRituals();
    this.setupEventListeners();
  }

  /**
   * Initialize default configuration
   */
  private initializeConfig(): RitualConfig {
    return {
      maxActiveRituals: 10,
      maxParticipantsPerRitual: 8,
      ritualTimeout: 3600000, // 1 hour
      qualityThresholds: {
        poor: 0.2,
        average: 0.5,
        good: 0.7,
        excellent: 0.9
      },
      enableEnvironmentalEffects: true,
      enableParticipantSacrifice: false,
      allowInterruption: true,
      saveProgressOnInterrupt: true,
      autoAssignRoles: true,
      requireLeaderConsent: true
    };
  }

  /**
   * Initialize basic ritual definitions
   */
  private initializeBasicRituals(): void {
    const basicRituals: RitualDefinition[] = [
      {
        id: 'summon-familiar',
        name: 'Summon Familiar',
        description: 'Summon a magical familiar to aid you',
        category: 'summoning',
        tier: 'basic',
        steps: [
          {
            id: 'prepare-circle',
            name: 'Prepare Summoning Circle',
            description: 'Draw the summoning circle and prepare components',
            duration: 10000, // 10 seconds
            type: 'preparation',
            requirements: [
              {
                type: 'participants',
                requirement: 'leader',
                description: 'Ritual leader required'
              }
            ],
            effects: [],
            failureEffects: [],
            visualEffect: 'circle_glow',
            soundEffect: 'chanting',
            requiredParticipants: 1,
            participantRoles: ['leader'],
            energyCost: 50,
            successRate: 0.95,
            difficultyModifier: 1.0
          },
          {
            id: 'summon-familiar',
            name: 'Summon the Familiar',
            description: 'Call forth the familiar spirit',
            duration: 15000, // 15 seconds
            type: 'summoning',
            requirements: [
              {
                type: 'mana',
                requirement: '50',
                description: '50 mana required'
              }
            ],
            effects: [
              {
                type: 'summon',
                target: 'participants',
                magnitude: 1,
                description: 'Summon a familiar',
                parameters: new Map([['entityType', 'familiar']]),
                chance: 0.9
              }
            ],
            failureEffects: [
              {
                type: 'damage',
                target: 'participants',
                magnitude: 20,
                description: 'Failed summoning damages participants',
                parameters: new Map(),
                chance: 0.5
              }
            ],
            visualEffect: 'summoning_glow',
            soundEffect: 'summoning_chant',
            requiredParticipants: 1,
            participantRoles: ['leader'],
            energyCost: 100,
            successRate: 0.8,
            difficultyModifier: 1.2
          }
        ],
        requiredParticipants: 1,
        minParticipants: 1,
        maxParticipants: 1,
        baseDuration: 25000,
        manaCost: 150,
        itemRequirements: ['summoning-chalk', 'familiar-essence'],
        environmentRequirements: ['quiet-space'],
        alignmentRequirement: 'neutral',
        successRate: 0.85,
        failureConsequences: 'minor',
        rewards: [
          {
            type: 'summoned-entity',
            reward: 'familiar',
            quality: 0.8,
            chance: 0.9,
            description: 'A loyal familiar companion'
          },
          {
            type: 'experience',
            reward: 'summoning',
            quantity: 100,
            chance: 1.0,
            description: 'Summoning experience gained'
          }
        ],
        risks: [
          {
            type: 'summoned-hostile',
            severity: 'minor',
            chance: 0.1,
            description: 'Familiar may be hostile',
            mitigation: 'Use higher quality essence'
          }
        ],
        visualTheme: 'arcane',
        soundTheme: 'mystical',
        icon: 'familiar_icon',
        lore: 'Ancient texts describe the summoning of familiar spirits to aid mages in their studies.',
        prerequisites: [],
        cooldown: 300000 // 5 minutes
      },
      {
        id: 'binding-ceremony',
        name: 'Spirit Binding Ceremony',
        description: 'Bind a spirit to an object or location',
        category: 'binding',
        tier: 'intermediate',
        steps: [
          {
            id: 'prepare-ritual-space',
            name: 'Prepare Ritual Space',
            description: 'Cleanse and prepare the area',
            duration: 30000,
            type: 'preparation',
            requirements: [
              {
                type: 'participants',
                requirement: '2',
                description: 'At least 2 participants required'
              }
            ],
            effects: [],
            failureEffects: [],
            visualEffect: 'cleansing_light',
            soundEffect: 'purification_chant',
            requiredParticipants: 2,
            participantRoles: ['leader', 'participant'],
            energyCost: 30,
            successRate: 0.95,
            difficultyModifier: 1.0
          },
          {
            id: 'channel-binding-energy',
            name: 'Channel Binding Energy',
            description: 'Focus energy to bind the spirit',
            duration: 45000,
            type: 'channeling',
            requirements: [
              {
                type: 'mana',
                requirement: '200',
                description: '200 total mana from participants'
              }
            ],
            effects: [
              {
                type: 'status',
                target: 'area',
                magnitude: 1,
                description: 'Create binding field',
                parameters: new Map([['statusType', 'binding-field']]),
                chance: 0.95
              }
            ],
            failureEffects: [
              {
                type: 'debuff',
                target: 'participants',
                magnitude: 50,
                duration: 300000,
                description: 'Mana exhaustion for participants',
                parameters: new Map(),
                chance: 0.8
              }
            ],
            visualEffect: 'binding_energy',
            soundEffect: 'binding_hum',
            requiredParticipants: 2,
            participantRoles: ['leader', 'participant'],
            energyCost: 150,
            successRate: 0.75,
            difficultyModifier: 1.5
          },
          {
            id: 'seal-binding',
            name: 'Seal the Binding',
            description: 'Complete the binding process',
            duration: 20000,
            type: 'binding',
            requirements: [],
            effects: [
              {
                type: 'status',
                target: 'area',
                magnitude: 1,
                duration: -1,
                description: 'Permanent binding effect',
                parameters: new Map([['statusType', 'permanent-binding']]),
                chance: 0.9
              }
            ],
            failureEffects: [
              {
                type: 'environmental',
                target: 'area',
                magnitude: 100,
                description: 'Magical backlash damages the area',
                parameters: new Map(),
                chance: 0.6
              }
            ],
            visualEffect: 'binding_seal',
            soundEffect: 'seal_complete',
            requiredParticipants: 2,
            participantRoles: ['leader', 'participant'],
            energyCost: 100,
            successRate: 0.8,
            difficultyModifier: 1.3
          }
        ],
        requiredParticipants: 2,
        minParticipants: 2,
        maxParticipants: 4,
        baseDuration: 95000,
        manaCost: 300,
        itemRequirements: ['binding-scroll', 'spirit-essence', 'sealing-wax'],
        environmentRequirements: ['sacred-space', 'protection-circle'],
        alignmentRequirement: 'lawful',
        successRate: 0.75,
        failureConsequences: 'moderate',
        rewards: [
          {
            type: 'item',
            reward: 'bound-spirit-gem',
            quantity: 1,
            quality: 0.7,
            chance: 0.9,
            description: 'A gem containing a bound spirit'
          },
          {
            type: 'experience',
            reward: 'binding',
            quantity: 200,
            chance: 1.0,
            description: 'Binding magic experience'
          }
        ],
        risks: [
          {
            type: 'summoned-hostile',
            severity: 'moderate',
            chance: 0.15,
            description: 'Spirit may resist binding',
            mitigation: 'Use higher quality binding materials'
          },
          {
            type: 'participant-damage',
            severity: 'minor',
            chance: 0.1,
            description: 'Participants may suffer minor magical feedback',
            mitigation: 'Maintain focus and concentration'
          }
        ],
        visualTheme: 'binding',
        soundTheme: 'ceremonial',
        icon: 'binding_icon',
        lore: 'The ancient art of binding spirits requires careful preparation and strong will.',
        prerequisites: ['summon-familiar'],
        cooldown: 600000 // 10 minutes
      }
    ];

    basicRituals.forEach(ritual => {
      this.ritualDefinitions.set(ritual.id, ritual);
    });
  }

  /**
   * Start a new ritual
   */
  startRitual(ritualId: string, leaderId: string, participantIds: string[] = []): RitualInstance | null {
    const ritualDef = this.ritualDefinitions.get(ritualId);
    if (!ritualDef) {
      this.logger.warn(`Ritual definition not found: ${ritualId}`);
      return null;
    }

    // Check active ritual limit
    if (this.activeRituals.size >= this.config.maxActiveRituals) {
      this.logger.warn('Maximum active rituals reached');
      return null;
    }

    // Check participant count
    const totalParticipants = [leaderId, ...participantIds];
    if (totalParticipants.length < ritualDef.minParticipants || totalParticipants.length > ritualDef.maxParticipants) {
      this.logger.warn(`Invalid participant count: ${totalParticipants.length} (min: ${ritualDef.minParticipants}, max: ${ritualDef.maxParticipants})`);
      return null;
    }

    // Create ritual instance
    const ritualInstance: RitualInstance = {
      id: this.generateRitualId(),
      definition: ritualDef,
      leaderId,
      participants: [],
      currentStep: 0,
      startTime: Date.now(),
      status: 'preparing',
      progress: 0,
      energySpent: 0,
      itemsConsumed: [],
      effectsApplied: [],
      summonedEntities: [],
      experienceGained: 0,
      quality: 0,
      environmentFactors: new Map(),
      customParameters: new Map()
    };

    // Create participants
    const participants: RitualParticipant[] = [];

    // Leader
    const leader = this.createParticipant(leaderId, 'leader', ritualDef);
    participants.push(leader);

    // Other participants
    participantIds.forEach((participantId, index) => {
      const role = this.config.autoAssignRoles ? this.getAutoRole(index + 1, ritualDef) : 'participant';
      const participant = this.createParticipant(participantId, role, ritualDef);
      participants.push(participant);
    });

    ritualInstance.participants = participants;
    this.activeRituals.set(ritualInstance.id, ritualInstance);

    // Emit ritual started event
    this.eventBus.publish('ritual:started', {
      ritualId: ritualInstance.id,
      ritualType: ritualDef.id,
      leaderId,
      participantCount: totalParticipants.length
    });

    this.logger.info(`✅ Started ritual: ${ritualDef.name} (${ritualInstance.id})`);
    return ritualInstance;
  }

  /**
   * Create a ritual participant
   */
  private createParticipant(participantId: string, role: string, ritualDef: RitualDefinition): RitualParticipant {
    const requirements: ParticipantRequirement[] = [];

    // Add role-specific requirements
    switch (role) {
      case 'leader':
        requirements.push({
          type: 'level',
          requirement: '10',
          description: 'Must be at least level 10'
        });
        break;
      case 'participant':
        requirements.push({
          type: 'mana',
          requirement: '50',
          description: 'Must contribute at least 50 mana'
        });
        break;
    }

    return {
      id: participantId,
      name: `Participant ${participantId}`,
      role: role as any,
      position: { x: 0, y: 0, z: 0 }, // Would be set by positioning system
      requirements,
      contributions: [],
      status: 'preparing',
      manaContribution: 0,
      itemContributions: [],
      energySpent: 0,
      experienceGained: 0
    };
  }

  /**
   * Get auto-assigned role for participants
   */
  private getAutoRole(participantIndex: number, ritualDef: RitualDefinition): string {
    const availableRoles = ['participant', 'observer', 'sacrifice'];
    return availableRoles[participantIndex % availableRoles.length];
  }

  /**
   * Progress a ritual to the next step
   */
  progressRitual(ritualId: string): RitualResult | null {
    const ritual = this.activeRituals.get(ritualId);
    if (!ritual) {
      this.logger.warn(`Ritual not found: ${ritualId}`);
      return null;
    }

    if (ritual.status !== 'active') {
      this.logger.warn(`Ritual not active: ${ritualId}`);
      return null;
    }

    const currentStep = ritual.definition.steps[ritual.currentStep];
    if (!currentStep) {
      this.logger.warn(`No current step for ritual: ${ritualId}`);
      return null;
    }

    // Check if step requirements are met
    if (!this.checkStepRequirements(ritual, currentStep)) {
      this.logger.warn(`Step requirements not met for ritual: ${ritualId}`);
      return null;
    }

    // Execute step
    const stepResult = this.executeRitualStep(ritual, currentStep);

    // Move to next step or complete ritual
    ritual.currentStep++;

    if (ritual.currentStep >= ritual.definition.steps.length) {
      // Ritual completed
      return this.completeRitual(ritual);
    } else {
      // Update progress
      ritual.progress = ritual.currentStep / ritual.definition.steps.length;
    }

    return stepResult;
  }

  /**
   * Check if step requirements are met
   */
  private checkStepRequirements(ritual: RitualInstance, step: RitualStep): boolean {
    // Check participant requirements
    if (ritual.participants.length < step.requiredParticipants) {
      return false;
    }

    // Check required roles
    const participantRoles = ritual.participants.map(p => p.role);
    for (const requiredRole of step.participantRoles) {
      if (!participantRoles.includes(requiredRole as any)) {
        return false;
      }
    }

    // Check energy requirements
    const totalMana = ritual.participants.reduce((sum, p) => sum + (p.manaContribution || 0), 0);
    if (totalMana < step.energyCost) {
      return false;
    }

    return true;
  }

  /**
   * Execute a ritual step
   */
  private executeRitualStep(ritual: RitualInstance, step: RitualStep): RitualResult {
    this.logger.info(`🔮 Executing ritual step: ${step.name}`);

    // Consume energy
    const energyConsumed = step.energyCost;
    ritual.energySpent += energyConsumed;

    // Apply step effects
    for (const effect of step.effects) {
      this.applyRitualEffect(ritual, effect);
    }

    // Update participants
    ritual.participants.forEach(participant => {
      participant.energySpent += step.energyCost / ritual.participants.length;
    });

    // Emit step completed event
    this.eventBus.publish('ritual:step-completed', {
      ritualId: ritual.id,
      stepId: step.id,
      stepName: step.name,
      energyConsumed
    });

    return {
      success: true,
      ritualId: ritual.id,
      leaderId: ritual.leaderId,
      participants: ritual.participants.map(p => p.id),
      duration: Date.now() - ritual.startTime,
      energySpent: energyConsumed,
      quality: ritual.quality,
      rewards: [],
      risksTriggered: [],
      summonedEntities: ritual.summonedEntities,
      effectsApplied: step.effects,
      experienceGained: 0
    };
  }

  /**
   * Apply ritual effect
   */
  private applyRitualEffect(ritual: RitualInstance, effect: RitualEffect): void {
    if (this.rng.nextFloat() > effect.chance) {
      return; // Effect doesn't trigger
    }

    this.logger.info(`✨ Applying ritual effect: ${effect.description}`);

    switch (effect.type) {
      case 'summon':
        this.summonEntity(ritual, effect);
        break;
      case 'buff':
        this.applyBuff(ritual, effect);
        break;
      case 'debuff':
        this.applyDebuff(ritual, effect);
        break;
      case 'damage':
        this.applyDamage(ritual, effect);
        break;
      case 'heal':
        this.applyHealing(ritual, effect);
        break;
      case 'create-item':
        this.createItem(ritual, effect);
        break;
      case 'status':
        this.applyStatus(ritual, effect);
        break;
      case 'experience':
        this.grantExperience(ritual, effect);
        break;
    }
  }

  /**
   * Summon an entity
   */
  private summonEntity(ritual: RitualInstance, effect: RitualEffect): void {
    const entityType = effect.parameters.get('entityType') || 'creature';

    const summonedEntity: SummonedEntity = {
      id: this.generateEntityId(),
      name: `Summoned ${entityType}`,
      type: entityType as any,
      level: Math.floor(ritual.quality * 10) + 1,
      health: 100 * ritual.quality,
      mana: 50 * ritual.quality,
      abilities: [`basic-${entityType}-ability`],
      lifespan: effect.duration || -1,
      loyalty: ritual.quality,
      visualAppearance: `${entityType}_summoned`,
      behavior: 'controlled',
      specialAbilities: [],
      weaknesses: [`${entityType}-weakness`],
      resistances: [`${entityType}-resistance`]
    };

    ritual.summonedEntities.push(summonedEntity);
    this.logger.info(`👻 Summoned entity: ${summonedEntity.name} (Level ${summonedEntity.level})`);
  }

  /**
   * Apply buff effect
   */
  private applyBuff(ritual: RitualInstance, effect: RitualEffect): void {
    this.logger.info(`💪 Applied buff: +${effect.magnitude} to participants`);
    // Would integrate with status effect system
  }

  /**
   * Apply debuff effect
   */
  private applyDebuff(ritual: RitualInstance, effect: RitualEffect): void {
    this.logger.info(`😵 Applied debuff: -${effect.magnitude} to participants`);
    // Would integrate with status effect system
  }

  /**
   * Apply damage effect
   */
  private applyDamage(ritual: RitualInstance, effect: RitualEffect): void {
    this.logger.info(`💔 Applied damage: ${effect.magnitude} to participants`);
    // Would integrate with health system
  }

  /**
   * Apply healing effect
   */
  private applyHealing(ritual: RitualInstance, effect: RitualEffect): void {
    this.logger.info(`💚 Applied healing: +${effect.magnitude} to participants`);
    // Would integrate with health system
  }

  /**
   * Create item effect
   */
  private createItem(ritual: RitualInstance, effect: RitualEffect): void {
    const itemType = effect.parameters.get('itemType') || 'generic';
    this.logger.info(`🎁 Created item: ${itemType}`);
    // Would integrate with item creation system
  }

  /**
   * Apply status effect
   */
  private applyStatus(ritual: RitualInstance, effect: RitualEffect): void {
    const statusType = effect.parameters.get('statusType') || 'generic';
    this.logger.info(`📊 Applied status: ${statusType} for ${effect.duration}ms`);
    // Would integrate with status effect system
  }

  /**
   * Grant experience
   */
  private grantExperience(ritual: RitualInstance, effect: RitualEffect): void {
    const expAmount = effect.magnitude;
    ritual.experienceGained += expAmount;
    this.logger.info(`⭐ Granted experience: ${expAmount}`);
  }

  /**
   * Complete a ritual
   */
  private completeRitual(ritual: RitualInstance): RitualResult {
    const duration = Date.now() - ritual.startTime;
    const quality = this.calculateRitualQuality(ritual);

    // Calculate final quality
    ritual.quality = quality;

    // Apply rewards
    const rewards = this.calculateRewards(ritual);
    const risksTriggered = this.calculateRisks(ritual);

    const result: RitualResult = {
      success: true,
      ritualId: ritual.id,
      leaderId: ritual.leaderId,
      participants: ritual.participants.map(p => p.id),
      duration,
      energySpent: ritual.energySpent,
      quality,
      rewards,
      risksTriggered,
      summonedEntities: ritual.summonedEntities,
      effectsApplied: ritual.effectsApplied,
      experienceGained: ritual.experienceGained
    };

    // Mark ritual as completed
    ritual.status = 'completed';
    this.activeRituals.delete(ritual.id);
    this.completedRituals.push(result);

    // Emit completion event
    this.eventBus.publish('ritual:completed', {
      ritualId: ritual.id,
      ritualType: ritual.definition.id,
      quality,
      rewards: rewards.length,
      summonedEntities: ritual.summonedEntities.length
    });

    this.logger.info(`🎉 Ritual completed: ${ritual.definition.name} (Quality: ${(quality * 100).toFixed(1)}%)`);
    return result;
  }

  /**
   * Calculate ritual quality
   */
  private calculateRitualQuality(ritual: RitualInstance): number {
    let quality = 0.5; // Base quality

    // Factor in participant contributions
    const totalMana = ritual.participants.reduce((sum, p) => sum + (p.manaContribution || 0), 0);
    const manaQuality = Math.min(1.0, totalMana / ritual.definition.manaCost);
    quality = (quality + manaQuality) / 2;

    // Factor in timing (faster is better)
    const expectedDuration = ritual.definition.baseDuration;
    const actualDuration = Date.now() - ritual.startTime;
    const timeEfficiency = Math.min(1.0, expectedDuration / Math.max(actualDuration, expectedDuration * 0.5));
    quality = (quality + timeEfficiency) / 2;

    // Add some randomness
    quality += (this.rng.nextFloat() - 0.5) * 0.2;

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Calculate ritual rewards
   */
  private calculateRewards(ritual: RitualInstance): RitualReward[] {
    const rewards: RitualReward[] = [];
    const quality = ritual.quality;

    for (const rewardDef of ritual.definition.rewards) {
      if (this.rng.nextFloat() <= rewardDef.chance) {
        const reward: RitualReward = {
          type: rewardDef.type,
          reward: rewardDef.reward,
          quantity: rewardDef.quantity || 1,
          quality: (rewardDef.quality || 1) * quality,
          chance: rewardDef.chance,
          description: rewardDef.description
        };
        rewards.push(reward);
      }
    }

    return rewards;
  }

  /**
   * Calculate ritual risks
   */
  private calculateRisks(ritual: RitualInstance): RitualRisk[] {
    const risks: RitualRisk[] = [];

    for (const riskDef of ritual.definition.risks) {
      if (this.rng.nextFloat() <= riskDef.chance) {
        risks.push(riskDef);
      }
    }

    return risks;
  }

  /**
   * Get ritual definition
   */
  getRitualDefinition(ritualId: string): RitualDefinition | null {
    return this.ritualDefinitions.get(ritualId) || null;
  }

  /**
   * Get active ritual
   */
  getActiveRitual(ritualId: string): RitualInstance | null {
    return this.activeRituals.get(ritualId) || null;
  }

  /**
   * Get all active rituals
   */
  getActiveRituals(): RitualInstance[] {
    return Array.from(this.activeRituals.values());
  }

  /**
   * Cancel a ritual
   */
  cancelRitual(ritualId: string): boolean {
    const ritual = this.activeRituals.get(ritualId);
    if (!ritual) return false;

    ritual.status = 'aborted';
    this.activeRituals.delete(ritualId);

    this.eventBus.publish('ritual:cancelled', {
      ritualId,
      reason: 'user-cancelled'
    });

    this.logger.info(`❌ Cancelled ritual: ${ritual.definition.name}`);
    return true;
  }

  /**
   * Update ritual configuration
   */
  updateConfig(newConfig: Partial<RitualConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Ritual configuration updated');
  }

  /**
   * Get ritual statistics
   */
  getStats(): {
    totalRituals: number;
    activeRituals: number;
    completedRituals: number;
    averageQuality: number;
    mostCommonCategory: string;
    totalExperienceGranted: number;
  } {
    const total = this.activeRituals.size + this.completedRituals.length;
    const averageQuality = this.completedRituals.length > 0 ?
      this.completedRituals.reduce((sum, r) => sum + r.quality, 0) / this.completedRituals.length : 0;

    const categoryCount = new Map<string, number>();
    this.completedRituals.forEach(result => {
      const category = result.ritualId.split('-')[0]; // Simplified category detection
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const mostCommonCategory = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    const totalExperienceGranted = this.completedRituals
      .reduce((sum, r) => sum + r.experienceGained, 0);

    return {
      totalRituals: total,
      activeRituals: this.activeRituals.size,
      completedRituals: this.completedRituals.length,
      averageQuality,
      mostCommonCategory,
      totalExperienceGranted
    };
  }

  private setupEventListeners(): void {
    // Listen for magic system events that might affect rituals
    this.eventBus.subscribe('magic:spell-cast', (_event: any) => {
      // Could enhance ritual effects based on spell casting
    });

    this.eventBus.subscribe('ritual:participant-joined', (_event: any) => {
      // Handle participant joining
    });
  }

  private generateRitualId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ritual_${timestamp}_${random}`;
  }

  private generateEntityId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `entity_${timestamp}_${random}`;
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    this.logger.info(`[RITUAL:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }
}

// Export type aliases only (class already exported above)
// Avoid conflicting re-exports; types are already declared above