/**
 * CreaturesPure - Creature/Monster Management System
 * 
 * Simple creature creation and management for game systems.
 * Supports stats, abilities, and state management.
 */

export interface CreatureStats {
  hp: number;
  attack?: number;
  defense?: number;
  speed?: number;
  magic?: number;
}

export interface Creature {
  id: string;
  name: string;
  level?: number;
  stats: CreatureStats;
  abilities?: string[];
  currentHp?: number;
}

export interface StatModifier {
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  magic?: number;
}

export const Creatures = {
  /**
   * Create a new creature with the given properties
   */
  create(data: {
    id: string;
    name: string;
    level?: number;
    stats?: Partial<CreatureStats>;
    abilities?: string[];
  }): Creature {
    const defaultStats: CreatureStats = {
      hp: data.stats?.hp || 100,
      attack: data.stats?.attack || 10,
      defense: data.stats?.defense || 5,
      speed: data.stats?.speed || 10,
      magic: data.stats?.magic || 0
    };

    return {
      id: data.id,
      name: data.name,
      level: data.level || 1,
      stats: defaultStats,
      abilities: data.abilities || [],
      currentHp: defaultStats.hp
    };
  },

  /**
   * Get effective stats for a creature
   */
  getStats(creature: Creature): CreatureStats {
    return { ...creature.stats };
  },

  /**
   * Apply stat modifiers to a creature (returns new creature)
   */
  applyModifier(creature: Creature, modifier: StatModifier): Creature {
    const newStats: CreatureStats = { ...creature.stats };
    
    if (modifier.hp !== undefined) newStats.hp = (newStats.hp || 0) + modifier.hp;
    if (modifier.attack !== undefined) newStats.attack = (newStats.attack || 0) + modifier.attack;
    if (modifier.defense !== undefined) newStats.defense = (newStats.defense || 0) + modifier.defense;
    if (modifier.speed !== undefined) newStats.speed = (newStats.speed || 0) + modifier.speed;
    if (modifier.magic !== undefined) newStats.magic = (newStats.magic || 0) + modifier.magic;

    return {
      ...creature,
      stats: newStats
    };
  },

  /**
   * Get creature abilities
   */
  getAbilities(creature: Creature): string[] {
    return creature.abilities || [];
  },

  /**
   * Check if creature is alive
   */
  isAlive(creature: Creature): boolean {
    const currentHp = creature.currentHp !== undefined ? creature.currentHp : creature.stats.hp;
    return currentHp > 0;
  },

  /**
   * Deal damage to a creature (returns new creature)
   */
  takeDamage(creature: Creature, damage: number): Creature {
    const currentHp = creature.currentHp !== undefined ? creature.currentHp : creature.stats.hp;
    const newHp = Math.max(0, currentHp - damage);
    
    return {
      ...creature,
      currentHp: newHp
    };
  },

  /**
   * Heal a creature (returns new creature)
   */
  heal(creature: Creature, amount: number): Creature {
    const currentHp = creature.currentHp !== undefined ? creature.currentHp : creature.stats.hp;
    const newHp = Math.min(creature.stats.hp, currentHp + amount);
    
    return {
      ...creature,
      currentHp: newHp
    };
  }
};

// Default export
export default Creatures;
