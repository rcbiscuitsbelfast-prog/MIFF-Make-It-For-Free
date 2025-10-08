/**
 * MIFF Magic System Pure
 *
 * Comprehensive spell system with mana pools, elemental interactions, and spell definitions
 * Integrates with CombatPure, HUDPure, LorePure, and XPLevelingPure
 *
 * Schema Version: v1.0.0
 */

import { EventBus } from '../EventBusPure/index.js';
type HealthSystemPure = any;
type CombatPure = any;
type RNGPure = any;

// Core interfaces and types
export interface SpellElement {
  name: string;
  color: string;
  description: string;
  strengths: string[]; // Elements this is strong against
  weaknesses: string[]; // Elements this is weak against
  neutral: string[]; // Elements with no special interaction
}

export interface SpellEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'shield' | 'curse' | 'bless';
  magnitude: number;
  duration?: number; // For effects with duration
  element: string;
  description: string;
  target: 'self' | 'single' | 'area' | 'all-allies' | 'all-enemies';
  range?: number;
  areaOfEffect?: number;
}

export interface SpellDefinition {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  castTime: number;
  levelRequirement: number;
  school: 'arcane' | 'divine' | 'nature' | 'fire' | 'water' | 'earth' | 'air' | 'dark' | 'light';
  primaryElement: string;
  secondaryElements: string[];
  effects: SpellEffect[];
  visualEffect: string;
  soundEffect: string;
  icon: string;
  isPassive: boolean;
  prerequisites: string[]; // Other spells required to unlock this
  upgrades: string[]; // Spells that can be upgraded to/from this
  loreRequirement?: string; // Lore entry required to unlock
  xpCost?: number; // XP cost to learn this spell
}

export interface ManaPool {
  current: number;
  maximum: number;
  regenerationRate: number; // Mana per second
  lastRegeneration: number;
  modifiers: Map<string, number>; // Spell schools and their modifiers
  elementalAffinities: Map<string, number>; // Elemental affinities (0.5 to 2.0)
}

export interface SpellInstance {
  definition: SpellDefinition;
  casterId: string;
  currentCooldown: number;
  lastCastTime: number;
  upgradeLevel: number;
  isUnlocked: boolean;
  experience: number;
  customizations: Map<string, any>;
}

export interface MagicCombatResult {
  spellInstance: SpellInstance;
  targets: string[];
  effectsApplied: SpellEffect[];
  manaSpent: number;
  damageDealt: number;
  healingDone: number;
  buffsApplied: string[];
  debuffsApplied: string[];
  success: boolean;
  failureReason?: string;
}

export interface SpellSchool {
  name: string;
  description: string;
  color: string;
  icon: string;
  manaColor: string;
  baseSpells: string[];
  advancedSpells: string[];
  masterSpells: string[];
  passiveBonus: string;
  weakness: string;
  strength: string;
}

export class MagicSystemPure {
  private spellDefinitions: Map<string, SpellDefinition> = new Map();
  private spellInstances: Map<string, Map<string, SpellInstance>> = new Map(); // casterId -> spellId -> instance
  private manaPools: Map<string, ManaPool> = new Map(); // entityId -> mana pool
  private elements: Map<string, SpellElement> = new Map();
  private spellSchools: Map<string, SpellSchool> = new Map();
  private eventBus: EventBus;
  private healthSystem: HealthSystemPure;
  private combatSystem: CombatPure;
  private rng: RNGPure;

  constructor(
    eventBus: EventBus,
    healthSystem: HealthSystemPure,
    combatSystem: CombatPure,
    rng: RNGPure
  ) {
    this.eventBus = eventBus;
    this.healthSystem = healthSystem;
    this.combatSystem = combatSystem;
    this.rng = rng;

    this.initializeElements();
    this.initializeSpellSchools();
    this.initializeBasicSpells();
    this.setupEventListeners();
  }

  /**
   * Initialize elemental system
   */
  private initializeElements(): void {
    const elements: SpellElement[] = [
      {
        name: 'fire',
        color: '#FF4500',
        description: 'Fire element - deals damage over time, strong against nature',
        strengths: ['nature', 'ice'],
        weaknesses: ['water', 'earth'],
        neutral: ['fire', 'air', 'light', 'dark', 'arcane']
      },
      {
        name: 'water',
        color: '#1E90FF',
        description: 'Water element - healing and protective, strong against fire',
        strengths: ['fire', 'earth'],
        weaknesses: ['electric', 'nature'],
        neutral: ['water', 'ice', 'air', 'light', 'dark', 'arcane']
      },
      {
        name: 'earth',
        color: '#8B4513',
        description: 'Earth element - defensive and summoning, strong against electric',
        strengths: ['electric', 'air'],
        weaknesses: ['fire', 'water'],
        neutral: ['earth', 'nature', 'light', 'dark', 'arcane']
      },
      {
        name: 'air',
        color: '#87CEEB',
        description: 'Air element - speed and evasion, strong against earth',
        strengths: ['earth', 'nature'],
        weaknesses: ['electric', 'ice'],
        neutral: ['air', 'fire', 'water', 'light', 'dark', 'arcane']
      },
      {
        name: 'light',
        color: '#FFFF99',
        description: 'Light element - healing and buffs, strong against dark',
        strengths: ['dark', 'curse'],
        weaknesses: ['dark', 'arcane'],
        neutral: ['light', 'fire', 'water', 'earth', 'air', 'nature', 'ice', 'electric']
      },
      {
        name: 'dark',
        color: '#4B0082',
        description: 'Dark element - debuffs and damage, strong against light',
        strengths: ['light', 'bless'],
        weaknesses: ['light', 'fire'],
        neutral: ['dark', 'fire', 'water', 'earth', 'air', 'nature', 'ice', 'electric', 'arcane']
      },
      {
        name: 'arcane',
        color: '#9370DB',
        description: 'Arcane element - utility and control, neutral to most',
        strengths: ['arcane'],
        weaknesses: ['arcane'],
        neutral: ['fire', 'water', 'earth', 'air', 'nature', 'ice', 'electric', 'light', 'dark']
      }
    ];

    elements.forEach(element => {
      this.elements.set(element.name, element);
    });
  }

  /**
   * Initialize spell schools
   */
  private initializeSpellSchools(): void {
    const schools: SpellSchool[] = [
      {
        name: 'fire',
        description: 'Fire magic focuses on destruction and damage over time',
        color: '#FF4500',
        icon: '🔥',
        manaColor: '#FF6B35',
        baseSpells: ['firebolt', 'ignite', 'flame-shield'],
        advancedSpells: ['fireball', 'scorch', 'burning-hands'],
        masterSpells: ['meteor', 'inferno', 'phoenix-rising'],
        passiveBonus: '10% extra fire damage',
        weakness: '20% more damage from water spells',
        strength: 'Spells cost 10% less mana'
      },
      {
        name: 'water',
        description: 'Water magic focuses on healing and protection',
        color: '#1E90FF',
        icon: '💧',
        manaColor: '#4FC3F7',
        baseSpells: ['heal', 'water-shield', 'cure'],
        advancedSpells: ['torrent', 'ice-shard', 'healing-wave'],
        masterSpells: ['tsunami', 'arctic-blast', 'tidal-force'],
        passiveBonus: '15% increased healing power',
        weakness: 'Spells take 20% longer to cast',
        strength: 'Mana regenerates 20% faster'
      },
      {
        name: 'arcane',
        description: 'Arcane magic focuses on utility and control',
        color: '#9370DB',
        icon: '✨',
        manaColor: '#B39DDB',
        baseSpells: ['magic-missile', 'detect-magic', 'teleport'],
        advancedSpells: ['arcane-blast', 'dimension-door', 'counterspell'],
        masterSpells: ['time-stop', 'wish', 'reality-warp'],
        passiveBonus: '20% chance to reduce spell cooldowns',
        weakness: '10% less damage from all spells',
        strength: 'Can cast two spells simultaneously'
      }
    ];

    schools.forEach(school => {
      this.spellSchools.set(school.name, school);
    });
  }

  /**
   * Initialize basic spell definitions
   */
  private initializeBasicSpells(): void {
    const basicSpells: SpellDefinition[] = [
      {
        id: 'firebolt',
        name: 'Fire Bolt',
        description: 'Hurl a mote of fire at your enemy',
        manaCost: 10,
        cooldown: 2000, // 2 seconds
        castTime: 1500, // 1.5 seconds
        levelRequirement: 1,
        school: 'fire',
        primaryElement: 'fire',
        secondaryElements: [],
        effects: [{
          type: 'damage',
          magnitude: 25,
          element: 'fire',
          description: 'Deals fire damage',
          target: 'single',
          range: 30
        }],
        visualEffect: 'fire_projectile',
        soundEffect: 'fire_cast',
        icon: 'fire_icon',
        isPassive: false,
        prerequisites: [],
        upgrades: ['fireball', 'flame-arrow']
      },
      {
        id: 'heal',
        name: 'Minor Heal',
        description: 'Restore health to yourself or an ally',
        manaCost: 15,
        cooldown: 5000, // 5 seconds
        castTime: 2000, // 2 seconds
        levelRequirement: 1,
        school: 'water',
        primaryElement: 'water',
        secondaryElements: ['light'],
        effects: [{
          type: 'heal',
          magnitude: 40,
          element: 'water',
          description: 'Restores health',
          target: 'single',
          range: 20
        }],
        visualEffect: 'heal_effect',
        soundEffect: 'heal_cast',
        icon: 'heal_icon',
        isPassive: false,
        prerequisites: [],
        upgrades: ['major-heal', 'healing-wave']
      },
      {
        id: 'magic-missile',
        name: 'Magic Missile',
        description: 'Launch homing bolts of magical energy',
        manaCost: 20,
        cooldown: 3000, // 3 seconds
        castTime: 1000, // 1 second
        levelRequirement: 1,
        school: 'arcane',
        primaryElement: 'arcane',
        secondaryElements: [],
        effects: [{
          type: 'damage',
          magnitude: 15,
          element: 'arcane',
          description: 'Deals arcane damage',
          target: 'single',
          range: 40
        }],
        visualEffect: 'magic_missile',
        soundEffect: 'arcane_cast',
        icon: 'magic_missile_icon',
        isPassive: false,
        prerequisites: [],
        upgrades: ['arcane-blast', 'magic-barrage']
      }
    ];

    basicSpells.forEach(spell => {
      this.spellDefinitions.set(spell.id, spell);
    });
  }

  /**
   * Create mana pool for an entity
   */
  createManaPool(entityId: string, maxMana: number = 100): void {
    const manaPool: ManaPool = {
      current: maxMana,
      maximum: maxMana,
      regenerationRate: 5, // 5 mana per second
      lastRegeneration: Date.now(),
      modifiers: new Map(),
      elementalAffinities: new Map()
    };

    this.manaPools.set(entityId, manaPool);
    this.log(`Created mana pool for ${entityId}: ${maxMana} max mana`);
  }

  /**
   * Get mana pool for an entity
   */
  getManaPool(entityId: string): ManaPool | null {
    return this.manaPools.get(entityId) || null;
  }

  /**
   * Update mana pool (regeneration, etc.)
   */
  updateManaPool(entityId: string): void {
    const manaPool = this.manaPools.get(entityId);
    if (!manaPool) return;

    const now = Date.now();
    const deltaTime = (now - manaPool.lastRegeneration) / 1000; // Convert to seconds

    if (deltaTime >= 1) {
      const regenAmount = Math.floor(manaPool.regenerationRate * deltaTime);
      manaPool.current = Math.min(manaPool.maximum, manaPool.current + regenAmount);
      manaPool.lastRegeneration = now;
    }
  }

  /**
   * Cast a spell
   */
  castSpell(casterId: string, spellId: string, targets: string[] = []): MagicCombatResult {
    const spellInstance = this.getSpellInstance(casterId, spellId);
    if (!spellInstance || !spellInstance.isUnlocked) {
      return {
        spellInstance: spellInstance!,
        targets: [],
        effectsApplied: [],
        manaSpent: 0,
        damageDealt: 0,
        healingDone: 0,
        buffsApplied: [],
        debuffsApplied: [],
        success: false,
        failureReason: 'Spell not unlocked or not found'
      };
    }

    const spellDef = spellInstance.definition;
    const manaPool = this.getManaPool(casterId);

    // Check mana cost
    if (!manaPool || manaPool.current < spellDef.manaCost) {
      return {
        spellInstance,
        targets,
        effectsApplied: [],
        manaSpent: 0,
        damageDealt: 0,
        healingDone: 0,
        buffsApplied: [],
        debuffsApplied: [],
        success: false,
        failureReason: 'Insufficient mana'
      };
    }

    // Check cooldown
    const now = Date.now();
    if (now - spellInstance.lastCastTime < spellDef.cooldown) {
      const remainingCooldown = spellDef.cooldown - (now - spellInstance.lastCastTime);
      return {
        spellInstance,
        targets,
        effectsApplied: [],
        manaSpent: 0,
        damageDealt: 0,
        healingDone: 0,
        buffsApplied: [],
        debuffsApplied: [],
        success: false,
        failureReason: `Spell on cooldown (${(remainingCooldown / 1000).toFixed(1)}s remaining)`
      };
    }

    // Deduct mana
    manaPool.current -= spellDef.manaCost;
    spellInstance.lastCastTime = now;

    // Apply spell effects
    const effectsApplied: SpellEffect[] = [];
    let damageDealt = 0;
    let healingDone = 0;
    const buffsApplied: string[] = [];
    const debuffsApplied: string[] = [];

    for (const effect of spellDef.effects) {
      const result = this.applySpellEffect(effect, casterId, targets);
      effectsApplied.push(effect);
      damageDealt += result.damage;
      healingDone += result.healing;
      buffsApplied.push(...result.buffs);
      debuffsApplied.push(...result.debuffs);
    }

    // Publish spell cast event
    this.eventBus.publish('magic:spell-cast', {
      casterId,
      spellId,
      targets,
      effectsApplied,
      manaSpent: spellDef.manaCost
    });

    return {
      spellInstance,
      targets,
      effectsApplied,
      manaSpent: spellDef.manaCost,
      damageDealt,
      healingDone,
      buffsApplied,
      debuffsApplied,
      success: true
    };
  }

  /**
   * Apply individual spell effect
   */
  private applySpellEffect(effect: SpellEffect, casterId: string, targets: string[]): {
    damage: number;
    healing: number;
    buffs: string[];
    debuffs: string[];
  } {
    let damage = 0;
    let healing = 0;
    const buffs: string[] = [];
    const debuffs: string[] = [];

    // Calculate effectiveness based on elemental interactions
    const effectiveness = this.calculateElementalEffectiveness(effect.element, casterId, targets[0]);

    switch (effect.type) {
      case 'damage':
        damage = Math.floor(effect.magnitude * effectiveness);
        if (targets.length > 0) {
          this.healthSystem.damageEntity(targets[0], damage);
        }
        break;

      case 'heal':
        healing = Math.floor(effect.magnitude * effectiveness);
        if (targets.length > 0) {
          this.healthSystem.healEntity(targets[0], healing);
        }
        break;

      case 'buff':
        buffs.push(`${effect.element}_resistance`);
        // Apply buff logic here
        break;

      case 'debuff':
        debuffs.push(`${effect.element}_weakness`);
        // Apply debuff logic here
        break;
    }

    return { damage, healing, buffs, debuffs };
  }

  /**
   * Calculate elemental effectiveness
   */
  private calculateElementalEffectiveness(element: string, casterId: string, targetId: string): number {
    const casterPool = this.manaPools.get(casterId);
    const casterAffinity = casterPool?.elementalAffinities.get(element) || 1.0;

    // Get target element for resistance calculation
    // This would integrate with a creature/character system
    const targetElement = 'neutral'; // Placeholder
    const targetElementDef = this.elements.get(targetElement);

    let effectiveness = casterAffinity;

    if (targetElementDef) {
      if (targetElementDef.weaknesses.includes(element)) {
        effectiveness *= 1.5; // 50% bonus damage to weak elements
      } else if (targetElementDef.strengths.includes(element)) {
        effectiveness *= 0.5; // 50% reduced damage to strong elements
      }
    }

    return Math.max(0.1, effectiveness); // Minimum 10% effectiveness
  }

  /**
   * Get spell instance for a caster
   */
  getSpellInstance(casterId: string, spellId: string): SpellInstance | null {
    const casterSpells = this.spellInstances.get(casterId);
    if (!casterSpells) return null;

    return casterSpells.get(spellId) || null;
  }

  /**
   * Unlock spell for a caster
   */
  unlockSpell(casterId: string, spellId: string): boolean {
    const spellDef = this.spellDefinitions.get(spellId);
    if (!spellDef) return false;

    if (!this.spellInstances.has(casterId)) {
      this.spellInstances.set(casterId, new Map());
    }

    const casterSpells = this.spellInstances.get(casterId)!;
    const spellInstance: SpellInstance = {
      definition: spellDef,
      casterId,
      currentCooldown: 0,
      lastCastTime: 0,
      upgradeLevel: 1,
      isUnlocked: true,
      experience: 0,
      customizations: new Map()
    };

    casterSpells.set(spellId, spellInstance);
    this.log(`Unlocked spell ${spellId} for ${casterId}`);
    return true;
  }

  /**
   * Get all spells for a caster
   */
  getSpellsForCaster(casterId: string): SpellInstance[] {
    const casterSpells = this.spellInstances.get(casterId);
    if (!casterSpells) return [];

    return Array.from(casterSpells.values()).filter(spell => spell.isUnlocked);
  }

  /**
   * Get spell definition
   */
  getSpellDefinition(spellId: string): SpellDefinition | null {
    return this.spellDefinitions.get(spellId) || null;
  }

  /**
   * Get all spell definitions
   */
  getAllSpellDefinitions(): SpellDefinition[] {
    return Array.from(this.spellDefinitions.values());
  }

  /**
   * Get spells by school
   */
  getSpellsBySchool(school: string): SpellDefinition[] {
    return Array.from(this.spellDefinitions.values()).filter(spell => spell.school === school);
  }

  /**
   * Get elemental information
   */
  getElement(elementName: string): SpellElement | null {
    return this.elements.get(elementName) || null;
  }

  /**
   * Get all elements
   */
  getAllElements(): SpellElement[] {
    return Array.from(this.elements.values());
  }

  /**
   * Get spell school information
   */
  getSpellSchool(schoolName: string): SpellSchool | null {
    return this.spellSchools.get(schoolName) || null;
  }

  /**
   * Get all spell schools
   */
  getAllSpellSchools(): SpellSchool[] {
    return Array.from(this.spellSchools.values());
  }

  /**
   * Update all mana pools (call regularly)
   */
  updateAllManaPools(): void {
    for (const entityId of this.manaPools.keys()) {
      this.updateManaPool(entityId);
    }
  }

  /**
   * Set elemental affinity for an entity
   */
  setElementalAffinity(entityId: string, element: string, affinity: number): void {
    const manaPool = this.manaPools.get(entityId);
    if (manaPool) {
      manaPool.elementalAffinities.set(element, Math.max(0.1, Math.min(2.0, affinity)));
    }
  }

  /**
   * Get elemental affinity for an entity
   */
  getElementalAffinity(entityId: string, element: string): number {
    const manaPool = this.manaPools.get(entityId);
    return manaPool?.elementalAffinities.get(element) || 1.0;
  }

  /**
   * Set spell school modifier for an entity
   */
  setSpellSchoolModifier(entityId: string, school: string, modifier: number): void {
    const manaPool = this.manaPools.get(entityId);
    if (manaPool) {
      manaPool.modifiers.set(school, modifier);
    }
  }

  /**
   * Get spell school modifier for an entity
   */
  getSpellSchoolModifier(entityId: string, school: string): number {
    const manaPool = this.manaPools.get(entityId);
    return manaPool?.modifiers.get(school) || 1.0;
  }

  private setupEventListeners(): void {
    // Listen for combat events to potentially trigger magical effects
    this.eventBus.subscribe('combat:turn-start', (_event: any) => {
      this.updateAllManaPools();
    });

    this.eventBus.subscribe('combat:entity-created', (event: any) => {
      // Create mana pool for new entities that should have magic
      const data = event?.data as any;
      if (data && (data.entityType === 'mage' || data.entityType === 'spellcaster')) {
        this.createManaPool(String(data.entityId), 100);
      }
    });
  }

  private log(message: string, level: 'info' | 'debug' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[MAGIC:${level.toUpperCase()}] ${timestamp} - ${message}`);
  }
}

// Export type aliases only (class already exported above)
// Removed duplicate type re-exports to avoid conflicts