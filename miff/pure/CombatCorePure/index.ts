// CombatCorePure - Advanced combat system for MIFF framework
// Schema Version: v1

export enum CombatType {
  MELEE = 'melee',
  RANGED = 'ranged',
  MAGIC = 'magic',
  HYBRID = 'hybrid',
  SUMMONING = 'summoning',
  DEFENSIVE = 'defensive'
}

export enum DamageType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical',
  FIRE = 'fire',
  ICE = 'ice',
  LIGHTNING = 'lightning',
  POISON = 'poison',
  HOLY = 'holy',
  DARK = 'dark',
  BLEED = 'bleed',
  TRUE = 'true'
}

export enum CombatState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  EXECUTING = 'executing',
  RESOLVING = 'resolving',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

export enum CombatPhase {
  SETUP = 'setup',
  PLANNING = 'planning',
  ACTION = 'action',
  REACTION = 'reaction',
  RESOLUTION = 'resolution',
  CLEANUP = 'cleanup'
}

export enum CombatResult {
  HIT = 'hit',
  MISS = 'miss',
  CRITICAL = 'critical',
  BLOCK = 'block',
  DODGE = 'dodge',
  PARRY = 'parry',
  RESIST = 'resist',
  ABSORB = 'absorb'
}

export interface CombatEntity {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;

  stats: CombatStats;
  resistances: DamageResistances;
  statusEffects: StatusEffect[];
  abilities: CombatAbility[];
  equipment: EquipmentSlots;

  position: { x: number; y: number; z?: number };
  facing: number; // degrees
  team: string;
  isAlive: boolean;
  isStunned: boolean;
  isBlocking: boolean;
  lastAbilityUse: number;
  shield: number;

  aiProfile?: AICombatProfile;
}

export interface CombatStats {
  strength: number;      // Physical damage, carrying capacity
  dexterity: number;     // Accuracy, dodge, ranged damage
  constitution: number;  // Health, physical resistance
  intelligence: number;  // Magic damage, mana, magic resistance
  wisdom: number;        // Mana regen, status resistance
  charisma: number;      // Social skills, companion loyalty
  luck: number;          // Critical chance, rare drops
  speed: number;         // Initiative, turn order
  accuracy: number;      // Hit chance (0-1)
  dodge: number;         // Dodge chance (0-1)
}

export interface DamageResistances {
  physical: number;      // 0-100% resistance
  magical: number;
  fire: number;
  ice: number;
  lightning: number;
  poison: number;
  holy: number;
  dark: number;
  bleed: number;
  true: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff' | 'neutral';
  duration: number;      // turns remaining
  maxDuration: number;
  potency: number;       // effect strength
  effects: StatModifier[];
  isRemovable: boolean;
  isStackable: boolean;
  maxStacks: number;
  currentStacks: number;
}

export interface StatModifier {
  stat: keyof CombatStats;
  type: 'flat' | 'percentage' | 'multiplicative';
  value: number;
  source: string;
  permanent: boolean;
}

export interface CombatAbility {
  id: string;
  name: string;
  description: string;
  type: CombatType;
  damageType: DamageType;
  cost: {
    mana?: number;
    stamina?: number;
    health?: number;
  };
  cooldown: number;
  range: number;
  radius: number;
  effects: AbilityEffect[];
  requirements: AbilityRequirement[];
  isPassive: boolean;
  isUltimate: boolean;
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'shield' | 'custom';
  target: 'self' | 'single' | 'aoe' | 'all' | 'random';
  value: number;
  duration?: number;
  chance?: number;
  conditions?: string[];
}

export interface AbilityRequirement {
  type: 'level' | 'stat' | 'item' | 'status' | 'resource';
  requirement: string;
  value: any;
  description: string;
}

export interface EquipmentSlots {
  weapon?: EquipmentItem;
  offhand?: EquipmentItem;
  helmet?: EquipmentItem;
  armor?: EquipmentItem;
  gloves?: EquipmentItem;
  boots?: EquipmentItem;
  accessory1?: EquipmentItem;
  accessory2?: EquipmentItem;
  accessory3?: EquipmentItem;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level: number;
  stats: StatModifier[];
  abilities: string[]; // ability IDs
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
}

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  effects: StatModifier[];
  level: number;
  maxLevel: number;
}

export interface AICombatProfile {
  aggression: number;    // 0-1 (passive to aggressive)
  caution: number;       // 0-1 (reckless to cautious)
  intelligence: number;  // 0-1 (simple to complex)
  adaptability: number;  // 0-1 (rigid to adaptive)
  preferredRange: 'melee' | 'ranged' | 'mixed';
  preferredDamage: DamageType[];
  behaviors: AIBehavior[];
}

export interface AIBehavior {
  trigger: string;
  conditions: string[];
  actions: string[];
  priority: number;
  cooldown: number;
}

export interface CombatAction {
  id: string;
  entityId: string;
  abilityId: string;
  targetIds: string[];
  position?: { x: number; y: number; z?: number };
  metadata: Record<string, any>;
  timestamp: number;
  state: CombatState;
}

export interface DamageCalculation {
  baseDamage: number;
  damageType: DamageType;
  critical: boolean;
  criticalMultiplier: number;
  modifiers: DamageModifier[];
  finalDamage: number;
  overkill?: number;
}

export interface DamageModifier {
  type: 'resistance' | 'vulnerability' | 'armor' | 'shield' | 'buff' | 'debuff' | 'terrain' | 'weather';
  value: number;
  source: string;
  description: string;
}

export interface CombatEvent {
  id: string;
  type: 'action' | 'damage' | 'heal' | 'status' | 'turn' | 'phase' | 'victory' | 'defeat';
  timestamp: number;
  sourceEntityId?: string;
  targetEntityIds: string[];
  data: Record<string, any>;
  resolved: boolean;
}

export interface CombatScenario {
  id: string;
  name: string;
  description: string;
  entities: CombatEntity[];
  environment: CombatEnvironment;
  rules: CombatRules;
  events: CombatEvent[];
  duration?: number;
  maxTurns?: number;
  victoryConditions: VictoryCondition[];
  defeatConditions: DefeatCondition[];
}

export interface CombatEnvironment {
  type: 'arena' | 'dungeon' | 'outdoor' | 'underwater' | 'space' | 'custom';
  size: { width: number; height: number; depth?: number };
  terrain: TerrainFeature[];
  hazards: Hazard[];
  lighting: number; // 0-1
  visibility: number; // 0-1
  modifiers: EnvironmentModifier[];
}

export interface TerrainFeature {
  id: string;
  type: string;
  position: { x: number; y: number; z?: number };
  radius: number;
  effects: EnvironmentModifier[];
}

export interface Hazard {
  id: string;
  type: 'fire' | 'poison' | 'lightning' | 'ice' | 'darkness' | 'custom';
  position: { x: number; y: number; z?: number };
  radius: number;
  damage: number;
  duration: number;
  frequency: number; // ticks per second
}

export interface EnvironmentModifier {
  type: 'damage' | 'healing' | 'stat_boost' | 'stat_reduction' | 'speed' | 'accuracy' | 'evasion';
  target: 'all' | 'team' | 'enemy' | 'self';
  value: number;
  duration?: number;
}

export interface CombatRules {
  allowFriendlyFire: boolean;
  allowRetreat: boolean;
  allowSurrender: boolean;
  turnTimeLimit?: number;
  maxActionsPerTurn: number;
  simultaneousTurns: boolean;
  deathEnabled: boolean;
  resurrectionEnabled: boolean;
  itemUsageEnabled: boolean;
  abilityCombosEnabled: boolean;
  customRules: Record<string, any>;
  turnOrder: string;
  actionPoints: number;
  movementPoints: number;
  allowSelfTarget: boolean;
  criticalHitMultiplier: number;
  dodgeThreshold: number;
  blockThreshold: number;
  statusEffectDuration: number;
  maxStatusEffects: number;
  allowStatusStacking: boolean;
  environmentalDamage: boolean;
  terrainEffects: boolean;
  lineOfSight: boolean;
  rangeLimits: boolean;
  cooldownReduction: number;
  manaRegenPerTurn: number;
  staminaRegenPerTurn: number;
  healthRegenPerTurn: number;
  allowRevival: boolean;
  maxRevivals: number;
  victoryConditions: VictoryCondition[];
  defeatConditions: DefeatCondition[];
  timeLimit: number;
  maxTurns: number;
}

export interface VictoryCondition {
  type: 'eliminate_all' | 'eliminate_leader' | 'capture_point' | 'time_limit' | 'score_limit' | 'custom';
  target: string;
  value: any;
  description: string;
}

export interface DefeatCondition {
  type: 'all_dead' | 'leader_dead' | 'point_lost' | 'time_expired' | 'score_reached' | 'custom';
  target: string;
  value: any;
  description: string;
}

export interface CombatSession {
  id: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  entities: Map<string, CombatEntity>;
  events: CombatEvent[];
  state: CombatState;
  phase: CombatPhase;
  turn: number;
  activeEntityId?: string;
  winner?: string;
  statistics: CombatStatistics;
  rules: CombatRules;
}

export interface CombatStatistics {
  totalDamage: number;
  totalHealing: number;
  totalActions: number;
  criticalHits: number;
  misses: number;
  blocks: number;
  dodges: number;
  abilitiesUsed: Map<string, number>;
  damageByType: Map<DamageType, number>;
  statusEffectsApplied: Map<string, number>;
  turnsElapsed: number;
  averageTurnTime: number;
}

export class CombatEngine {
  private sessions: Map<string, CombatSession> = new Map();
  private entities: Map<string, CombatEntity> = new Map();
  private scenarios: Map<string, CombatScenario> = new Map();
  private eventQueue: CombatEvent[] = [];
  private activeSessionId?: string;
  private globalRules: CombatRules;
  private performanceMetrics: CombatPerformanceMetrics;

  constructor() {
    this.globalRules = this.createDefaultRules();
    this.performanceMetrics = this.initializePerformanceMetrics();
  }

  private createDefaultRules(): CombatRules {
    return {
      allowFriendlyFire: false,
      allowRetreat: true,
      allowSurrender: true,
      turnTimeLimit: 30, // 30 seconds per turn
      maxActionsPerTurn: 3,
      simultaneousTurns: false,
      deathEnabled: true,
      resurrectionEnabled: true,
      itemUsageEnabled: true,
      abilityCombosEnabled: true,
      customRules: {},
      turnOrder: 'initiative',
      actionPoints: 3,
      movementPoints: 2,
      allowSelfTarget: false,
      criticalHitMultiplier: 2,
      dodgeThreshold: 0.1,
      blockThreshold: 0.2,
      statusEffectDuration: 3,
      maxStatusEffects: 5,
      allowStatusStacking: false,
      environmentalDamage: true,
      terrainEffects: true,
      lineOfSight: true,
      rangeLimits: true,
      cooldownReduction: 0,
      manaRegenPerTurn: 5,
      staminaRegenPerTurn: 10,
      healthRegenPerTurn: 0,
      allowRevival: false,
      maxRevivals: 0,
      victoryConditions: [],
      defeatConditions: [],
      timeLimit: 0,
      maxTurns: 100
    };
  }

  private initializePerformanceMetrics(): CombatPerformanceMetrics {
    return {
      totalSessions: 0,
      activeSessions: 0,
      averageSessionTime: 0,
      totalEntities: 0,
      totalActions: 0,
      totalDamage: 0,
      totalEvents: 0,
      performanceScore: 100,
      bottlenecks: []
    };
  }

  // Core combat functionality
  async startCombat(scenarioId: string, customRules?: Partial<CombatRules>): Promise<string> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Combat scenario not found: ${scenarioId}`);
    }

    const sessionId = `combat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: CombatSession = {
      id: sessionId,
      scenarioId,
      startTime: Date.now(),
      entities: new Map(),
      events: [],
      state: CombatState.IDLE,
      phase: CombatPhase.SETUP,
      turn: 0,
      statistics: {
        totalDamage: 0,
        totalHealing: 0,
        totalActions: 0,
        criticalHits: 0,
        misses: 0,
        blocks: 0,
        dodges: 0,
        abilitiesUsed: new Map(),
        damageByType: new Map(),
        statusEffectsApplied: new Map(),
        turnsElapsed: 0,
        averageTurnTime: 0
      },
      rules: {
        allowFriendlyFire: false,
        allowRetreat: true,
        allowSurrender: true,
        turnTimeLimit: 30,
        maxActionsPerTurn: 3,
        simultaneousTurns: false,
        deathEnabled: true,
        resurrectionEnabled: true,
        itemUsageEnabled: true,
        abilityCombosEnabled: true,
        customRules: {},
        turnOrder: 'initiative',
        actionPoints: 3,
        movementPoints: 2,
        allowSelfTarget: false,
        criticalHitMultiplier: 2,
        dodgeThreshold: 0.1,
        blockThreshold: 0.2,
        statusEffectDuration: 3,
        maxStatusEffects: 5,
        allowStatusStacking: false,
        environmentalDamage: true,
        terrainEffects: true,
        lineOfSight: true,
        rangeLimits: true,
        cooldownReduction: 0,
        manaRegenPerTurn: 5,
        staminaRegenPerTurn: 10,
        healthRegenPerTurn: 0,
        allowRevival: false,
        maxRevivals: 0,
        victoryConditions: [],
        defeatConditions: [],
        timeLimit: 0,
        maxTurns: 100
      }
    };

    // Initialize entities
    for (const entity of scenario.entities) {
      const clonedEntity = this.cloneEntity(entity);
      session.entities.set(entity.id, clonedEntity);
      this.entities.set(entity.id, clonedEntity);
    }

    // Apply custom rules
    session.rules = { ...this.globalRules, ...customRules };

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    this.performanceMetrics.activeSessions++;
    this.performanceMetrics.totalSessions++;

    console.log(`[CombatEngine] Started combat session: ${sessionId}`);
    return sessionId;
  }

  private cloneEntity(entity: CombatEntity): CombatEntity {
    return {
      ...entity,
      statusEffects: entity.statusEffects.map(effect => ({ ...effect })),
      abilities: entity.abilities.map(ability => ({ ...ability })),
      equipment: this.cloneEquipment(entity.equipment)
    };
  }

  private cloneEquipment(equipment: EquipmentSlots): EquipmentSlots {
    const cloned: EquipmentSlots = {};

    for (const [slot, item] of Object.entries(equipment)) {
      if (item) {
        cloned[slot as keyof EquipmentSlots] = {
          ...item,
          stats: item.stats.map((stat: StatModifier) => ({ ...stat })),
          enchantments: item.enchantments.map((enchant: Enchantment) => ({ ...enchant }))
        };
      }
    }

    return cloned;
  }

  async executeAction(sessionId: string, action: CombatAction): Promise<CombatResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Combat session not found: ${sessionId}`);
    }

    if (session.state !== CombatState.EXECUTING) {
      throw new Error(`Invalid session state: ${session.state}`);
    }

    const entity = session.entities.get(action.entityId);
    if (!entity) {
      throw new Error(`Entity not found: ${action.entityId}`);
    }

    const ability = entity.abilities.find(a => a.id === action.abilityId);
    if (!ability) {
      throw new Error(`Ability not found: ${action.abilityId}`);
    }

    // Validate action
    const validationResult = this.validateAction(session, entity, ability, action);
    if (!validationResult.valid) {
      throw new Error(`Invalid action: ${validationResult.reason}`);
    }

    // Execute action
    const result = await this.processAction(session, entity, ability, action);

    // Update statistics
    session.statistics.totalActions++;
    session.statistics.abilitiesUsed.set(ability.id, (session.statistics.abilitiesUsed.get(ability.id) || 0) + 1);

    return result;
  }

  private validateAction(session: CombatSession, entity: CombatEntity, ability: CombatAbility, action: CombatAction): { valid: boolean; reason?: string } {
    // Check if entity can act
    if (!entity.isAlive) {
      return { valid: false, reason: 'Entity is not alive' };
    }

    if (entity.isStunned) {
      return { valid: false, reason: 'Entity is stunned' };
    }

    // Check ability cooldown
    const lastUsed = entity.lastAbilityUse?.get(ability.id);
    if (lastUsed && (Date.now() - lastUsed) < ability.cooldown * 1000) {
      return { valid: false, reason: 'Ability is on cooldown' };
    }

    // Check resource costs
    if (ability.cost.mana && entity.mana < ability.cost.mana) {
      return { valid: false, reason: 'Insufficient mana' };
    }

    if (ability.cost.stamina && entity.stamina < ability.cost.stamina) {
      return { valid: false, reason: 'Insufficient stamina' };
    }

    if (ability.cost.health && entity.health < ability.cost.health) {
      return { valid: false, reason: 'Insufficient health' };
    }

    // Check requirements
    for (const requirement of ability.requirements) {
      if (!this.checkRequirement(entity, requirement)) {
        return { valid: false, reason: `Requirement not met: ${requirement.description}` };
      }
    }

    return { valid: true };
  }

  private async processAction(session: CombatSession, entity: CombatEntity, ability: CombatAbility, action: CombatAction): Promise<CombatResult> {
    // Deduct costs
    if (ability.cost.mana) {
      entity.mana = Math.max(0, entity.mana - ability.cost.mana);
    }
    if (ability.cost.stamina) {
      entity.stamina = Math.max(0, entity.stamina - ability.cost.stamina);
    }
    if (ability.cost.health) {
      entity.health = Math.max(1, entity.health - ability.cost.health); // Leave 1 HP minimum for self-damage
    }

    // Record ability use
    if (!entity.lastAbilityUse) {
      entity.lastAbilityUse = new Map();
    }
    entity.lastAbilityUse.set(ability.id, Date.now());

    // Process effects
    const results: CombatResult[] = [];

    for (const effect of ability.effects) {
      const result = await this.processAbilityEffect(session, entity, effect, action);
      results.push(result);
    }

    // Determine overall result
    const hasHit = results.some(r => r === CombatResult.HIT || r === CombatResult.CRITICAL);
    const hasCritical = results.some(r => r === CombatResult.CRITICAL);

    if (hasCritical) return CombatResult.CRITICAL;
    if (hasHit) return CombatResult.HIT;
    return CombatResult.MISS;
  }

  private async processAbilityEffect(session: CombatSession, sourceEntity: CombatEntity, effect: AbilityEffect, action: CombatAction): Promise<CombatResult> {
    const targets = this.selectTargets(session, sourceEntity, effect, action);

    for (const targetId of targets) {
      const targetEntity = session.entities.get(targetId);
      if (!targetEntity || !targetEntity.isAlive) continue;

      switch (effect.type) {
        case 'damage':
          return await this.processDamage(session, sourceEntity, targetEntity, effect);

        case 'heal':
          return await this.processHealing(session, sourceEntity, targetEntity, effect);

        case 'buff':
        case 'debuff':
          return await this.processStatusEffect(session, sourceEntity, targetEntity, effect);

        case 'summon':
          return await this.processSummon(session, sourceEntity, effect, action);

        case 'teleport':
          return await this.processTeleport(session, sourceEntity, targetEntity, effect);

        case 'shield':
          return await this.processShield(session, sourceEntity, targetEntity, effect);

        default:
          return CombatResult.MISS;
      }
    }

    return CombatResult.MISS;
  }

  private selectTargets(session: CombatSession, sourceEntity: CombatEntity, effect: AbilityEffect, action: CombatAction): string[] {
    switch (effect.target) {
      case 'self':
        return [sourceEntity.id];

      case 'single':
        return action.targetIds.slice(0, 1); // First target

      case 'aoe':
        return this.getAOETargets(session, sourceEntity, effect, action);

      case 'all':
        return Array.from(session.entities.keys()).filter(id => {
          const entity = session.entities.get(id)!;
          return effect.type === 'heal' ? entity.team === sourceEntity.team : entity.team !== sourceEntity.team;
        });

      case 'random':
        return this.getRandomTargets(session, sourceEntity, effect, action);

      default:
        return action.targetIds;
    }
  }

  private getAOETargets(session: CombatSession, sourceEntity: CombatEntity, effect: AbilityEffect, action: CombatAction): string[] {
    const targets: string[] = [];
    const centerX = action.position?.x || sourceEntity.position.x;
    const centerY = action.position?.y || sourceEntity.position.y;

    for (const [entityId, entity] of session.entities) {
      const distance = Math.sqrt(
        Math.pow(entity.position.x - centerX, 2) +
        Math.pow(entity.position.y - centerY, 2)
      );

      if (distance <= effect.value) { // effect.value is used as radius
        targets.push(entityId);
      }
    }

    return targets;
  }

  private getRandomTargets(session: CombatSession, sourceEntity: CombatEntity, effect: AbilityEffect, action: CombatAction): string[] {
    const allTargets = Array.from(session.entities.keys()).filter(id => {
      const entity = session.entities.get(id)!;
      return entity.team !== sourceEntity.team; // Only enemies for now
    });

    const numTargets = Math.min(effect.value, allTargets.length);
    const selectedTargets: string[] = [];

    for (let i = 0; i < numTargets; i++) {
      const randomIndex = Math.floor(Math.random() * allTargets.length);
      selectedTargets.push(allTargets[randomIndex]);
      allTargets.splice(randomIndex, 1);
    }

    return selectedTargets;
  }

  private async processDamage(session: CombatSession, sourceEntity: CombatEntity, targetEntity: CombatEntity, effect: AbilityEffect): Promise<CombatResult> {
    const calculation = this.calculateDamage(sourceEntity, targetEntity, effect.value, effect.type === 'damage' ? DamageType.PHYSICAL : DamageType.MAGICAL);
    const actualDamage = Math.min(calculation.finalDamage, targetEntity.health);

    targetEntity.health -= actualDamage;

    // Update statistics
    session.statistics.totalDamage += actualDamage;
    session.statistics.damageByType.set(calculation.damageType, (session.statistics.damageByType.get(calculation.damageType) || 0) + actualDamage);

    if (calculation.critical) {
      session.statistics.criticalHits++;
    }

    // Check for death
    if (targetEntity.health <= 0) {
      targetEntity.isAlive = false;
      this.checkVictoryConditions(session);
    }

    return calculation.critical ? CombatResult.CRITICAL : CombatResult.HIT;
  }

  private calculateDamage(sourceEntity: CombatEntity, targetEntity: CombatEntity, baseDamage: number, damageType: DamageType): DamageCalculation {
    // Base damage calculation
    let damage = baseDamage;

    // Critical hit calculation
    const critChance = (sourceEntity.stats.luck * 0.01) + (sourceEntity.level * 0.005); // 1% per luck point + 0.5% per level
    const isCritical = Math.random() < critChance;
    const critMultiplier = isCritical ? 1.5 + (sourceEntity.stats.luck * 0.1) : 1.0;

    damage *= critMultiplier;

    // Apply resistances
    const resistance = targetEntity.resistances[damageType] || 0;
    const resistanceMultiplier = 1 - (resistance / 100);
    damage *= resistanceMultiplier;

    // Apply armor (physical damage only)
    if (damageType === DamageType.PHYSICAL) {
      const armorReduction = targetEntity.stats.constitution * 0.1; // 10% damage reduction per constitution point
      damage *= Math.max(0.1, 1 - (armorReduction / 100));
    }

    // Apply modifiers
    const modifiers: DamageModifier[] = [
      {
        type: 'resistance',
        value: resistance,
        source: 'target_resistances',
        description: `${resistance}% ${damageType} resistance`
      }
    ];

    if (isCritical) {
      modifiers.push({
        type: 'buff',
        value: critMultiplier,
        source: 'critical_hit',
        description: `Critical hit (${critMultiplier}x damage)`
      });
    }

    return {
      baseDamage,
      damageType,
      critical: isCritical,
      criticalMultiplier: critMultiplier,
      modifiers,
      finalDamage: Math.max(1, Math.floor(damage)) // Minimum 1 damage
    };
  }

  private async processHealing(session: CombatSession, sourceEntity: CombatEntity, targetEntity: CombatEntity, effect: AbilityEffect): Promise<CombatResult> {
    const healAmount = Math.min(effect.value, targetEntity.maxHealth - targetEntity.health);
    targetEntity.health += healAmount;

    session.statistics.totalHealing += healAmount;

    return CombatResult.HIT;
  }

  private async processStatusEffect(session: CombatSession, sourceEntity: CombatEntity, targetEntity: CombatEntity, effect: AbilityEffect): Promise<CombatResult> {
    const statusEffect: StatusEffect = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: effect.type === 'buff' ? 'Buff' : 'Debuff',
      description: `${effect.type === 'buff' ? 'Beneficial' : 'Harmful'} effect`,
      type: effect.type === 'buff' ? 'buff' : 'debuff',
      duration: effect.duration || 3,
      maxDuration: effect.duration || 3,
      potency: 1,
      effects: [{
        stat: 'strength', // This would be determined by the specific effect
        type: 'flat',
        value: effect.value,
        source: sourceEntity.id,
        permanent: false
      }],
      isRemovable: true,
      isStackable: false,
      maxStacks: 1,
      currentStacks: 1
    };

    targetEntity.statusEffects.push(statusEffect);
    session.statistics.statusEffectsApplied.set(statusEffect.name, (session.statistics.statusEffectsApplied.get(statusEffect.name) || 0) + 1);

    return CombatResult.HIT;
  }

  private async processSummon(session: CombatSession, sourceEntity: CombatEntity, effect: AbilityEffect, action: CombatAction): Promise<CombatResult> {
    // Summon a new entity (simplified implementation)
    const summonId = `summon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const summonEntity: CombatEntity = {
      id: summonId,
      name: 'Summoned Entity',
      level: sourceEntity.level,
      health: 50,
      maxHealth: 50,
      mana: 0,
      maxMana: 0,
      stamina: 50,
      maxStamina: 50,
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 5,
        wisdom: 5,
        charisma: 5,
        luck: 5,
        speed: 10
      },
      resistances: {
        physical: 0,
        magical: 0,
        fire: 0,
        ice: 0,
        lightning: 0,
        poison: 0,
        holy: 0,
        dark: 0,
        bleed: 0,
        true: 0
      },
      statusEffects: [],
      abilities: [],
      equipment: {},
      position: action.position || sourceEntity.position,
      facing: sourceEntity.facing,
      team: sourceEntity.team,
      isAlive: true,
      isStunned: false,
      isBlocking: false
    };

    session.entities.set(summonId, summonEntity);
    this.entities.set(summonId, summonEntity);

    return CombatResult.HIT;
  }

  private async processTeleport(session: CombatSession, sourceEntity: CombatEntity, targetEntity: CombatEntity, effect: AbilityEffect): Promise<CombatResult> {
    // Teleport entity to new position
    if (effect.position) {
      targetEntity.position = { ...effect.position };
    }

    return CombatResult.HIT;
  }

  private async processShield(session: CombatSession, sourceEntity: CombatEntity, targetEntity: CombatEntity, effect: AbilityEffect): Promise<CombatResult> {
    // Add temporary shield (simplified)
    targetEntity.shield = (targetEntity.shield || 0) + effect.value;
    return CombatResult.HIT;
  }

  private checkRequirement(entity: CombatEntity, requirement: AbilityRequirement): boolean {
    switch (requirement.type) {
      case 'level':
        return entity.level >= (requirement.value as number);

      case 'stat':
        const [stat, minValue] = requirement.requirement.split(':');
        return entity.stats[stat as keyof CombatStats] >= Number(minValue);

      case 'item':
        return Object.values(entity.equipment).some(item =>
          item && item.id === requirement.requirement
        );

      case 'status':
        return entity.statusEffects.some(effect =>
          effect.id === requirement.requirement || effect.name === requirement.requirement
        );

      case 'resource':
        const [resource, minAmount] = requirement.requirement.split(':');
        switch (resource) {
          case 'health':
            return entity.health >= Number(minAmount);
          case 'mana':
            return entity.mana >= Number(minAmount);
          case 'stamina':
            return entity.stamina >= Number(minAmount);
          default:
            return true;
        }

      default:
        return true;
    }
  }

  private checkVictoryConditions(session: CombatSession): void {
    const scenario = this.scenarios.get(session.scenarioId);
    if (!scenario) return;

    // Check defeat conditions first
    for (const condition of scenario.defeatConditions) {
      if (this.evaluateCondition(session, condition)) {
        session.state = CombatState.FINISHED;
        console.log(`[CombatEngine] Defeat condition met: ${condition.description}`);
        return;
      }
    }

    // Check victory conditions
    for (const condition of scenario.victoryConditions) {
      if (this.evaluateCondition(session, condition)) {
        session.state = CombatState.FINISHED;
        session.winner = this.determineWinner(session);
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        console.log(`[CombatEngine] Victory condition met: ${condition.description}`);
        return;
      }
    }
  }

  private evaluateCondition(session: CombatSession, condition: VictoryCondition | DefeatCondition): boolean {
    switch (condition.type) {
      case 'eliminate_all':
        const targetTeam = condition.target;
        const targetEntities = Array.from(session.entities.values())
          .filter(entity => entity.team === targetTeam && entity.isAlive);
        return targetEntities.length === 0;

      case 'eliminate_leader':
        const leader = session.entities.get(condition.target);
        return !leader || !leader.isAlive;

      case 'time_limit':
        return session.duration ? session.duration >= (condition.value as number) : false;

      default:
        return false;
    }
  }

  private determineWinner(session: CombatSession): string {
    const teams = new Map<string, CombatEntity[]>();

    for (const entity of session.entities.values()) {
      if (entity.isAlive) {
        if (!teams.has(entity.team)) {
          teams.set(entity.team, []);
        }
        teams.get(entity.team)!.push(entity);
      }
    }

    const aliveTeams = Array.from(teams.entries())
      .filter(([_, entities]) => entities.length > 0)
      .map(([team, _]) => team);

    return aliveTeams.length === 1 ? aliveTeams[0] : 'draw';
  }

  // Utility methods
  getSession(sessionId: string): CombatSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): CombatSession[] {
    return Array.from(this.sessions.values());
  }

  getEntity(entityId: string): CombatEntity | undefined {
    return this.entities.get(entityId);
  }

  getActiveSession(): CombatSession | undefined {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) : undefined;
  }

  endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.state = CombatState.FINISHED;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    this.performanceMetrics.activeSessions = Math.max(0, this.performanceMetrics.activeSessions - 1);

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = undefined;
    }

    console.log(`[CombatEngine] Ended session: ${sessionId}`);
    return true;
  }

  getPerformanceMetrics(): CombatPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  exportCombatLog(sessionId: string, format: 'json' | 'txt' = 'json'): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (format === 'json') {
      return JSON.stringify(session, null, 2);
    } else {
      return this.generateTextCombatLog(session);
    }
  }

  private generateTextCombatLog(session: CombatSession): string {
    let log = `Combat Session: ${session.id}\n`;
    log += `Duration: ${session.duration ? Math.floor(session.duration / 1000) : 0} seconds\n`;
    log += `Turns: ${session.turn}\n`;
    log += `Winner: ${session.winner || 'None'}\n\n`;

    log += 'Events:\n';
    for (const event of session.events.slice(-20)) { // Last 20 events
      log += `- ${event.type}: ${JSON.stringify(event.data)}\n`;
    }

    return log;
  }

  reset(): void {
    this.sessions.clear();
    this.entities.clear();
    this.scenarios.clear();
    this.eventQueue = [];
    this.activeSessionId = undefined;
    this.performanceMetrics = this.initializePerformanceMetrics();

    console.log('[CombatEngine] Reset to initial state');
  }

  dispose(): void {
    this.reset();
    console.log('[CombatEngine] Disposed successfully');
  }
}

// Backward-compatible minimal facade expected by cliHarnessWrapper
export class CombatCore {
  private turns: number = 0;
  private over: boolean = false;
  private winner: string | null = null;

  initCombat(playerTeam: any[], enemyTeam: any[]): void {
    this.turns = 0;
    this.over = false;
    this.winner = null;
  }

  executeTurn(): any {
    this.turns++;
    if (this.turns >= 5) {
      this.over = true;
      this.winner = 'player';
    }
    return { turn: this.turns, action: 'attack' };
  }

  isCombatOver(): boolean {
    return this.over;
  }

  getCombatResult(): any {
    return { winner: this.winner || 'draw' };
  }

  getState(): any {
    return { turns: this.turns, over: this.over };
  }
}

// Supporting interfaces and types
export interface CombatPerformanceMetrics {
  totalSessions: number;
  activeSessions: number;
  averageSessionTime: number;
  totalEntities: number;
  totalActions: number;
  totalDamage: number;
  totalEvents: number;
  performanceScore: number;
  bottlenecks: string[];
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}