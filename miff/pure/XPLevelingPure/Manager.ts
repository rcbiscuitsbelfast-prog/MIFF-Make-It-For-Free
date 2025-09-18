/**
 * XPLevelingPure Manager
 * 
 * Advanced experience and leveling system including XP curves, skill trees,
 * stat progression, and comprehensive character advancement.
 */

export interface LevelEntry {
  level: number;
  nextLevelXp: number;
  statBoosts?: { stat: string; amount: number }[];
  unlockedSkills?: string[];
  rewards?: { type: 'item' | 'skill' | 'ability'; id: string; quantity?: number }[];
  metadata?: Record<string, any>;
}

export interface XPEntity {
  id: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  totalXp: number;
  skills: Map<string, number>; // skill -> level
  stats: Map<string, number>; // stat -> value
  lastLevelUp: number;
  metadata?: Record<string, any>;
}

export interface XPCurve {
  id: string;
  name: string;
  description: string;
  levels: LevelEntry[];
  maxLevel: number;
  baseXp: number;
  growthRate: number; // multiplier for each level
  metadata?: Record<string, any>;
}

export interface LevelUpResult {
  entityId: string;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
  statBoosts: { stat: string; amount: number }[];
  unlockedSkills: string[];
  rewards: { type: string; id: string; quantity?: number }[];
  totalXp: number;
}

export interface XPStats {
  totalEntities: number;
  averageLevel: number;
  totalXp: number;
  levelDistribution: Record<number, number>;
  skillDistribution: Record<string, number>;
  mostCommonLevel: number;
  highestLevel: number;
}

export interface XPFilter {
  minLevel?: number;
  maxLevel?: number;
  hasSkill?: string;
  minSkillLevel?: number;
  maxSkillLevel?: number;
  minXp?: number;
  maxXp?: number;
}

export interface XPOutput {
  op: string;
  status: 'ok' | 'error';
  result?: XPEntity | XPEntity[] | LevelUpResult | XPStats | XPCurve;
  issues?: string[];
}

export class XPLevelingManager {
  private entities: Map<string, XPEntity> = new Map();
  private curves: Map<string, XPCurve> = new Map();
  private levelUpHistory: LevelUpResult[] = [];

  constructor() {
    this.initializeDefaultCurves();
  }

  private initializeDefaultCurves() {
    const defaultCurves: XPCurve[] = [
      {
        id: 'standard',
        name: 'Standard Progression',
        description: 'Balanced XP curve for general gameplay',
        maxLevel: 100,
        baseXp: 100,
        growthRate: 1.1,
        levels: this.generateLevelEntries(100, 100, 1.1),
        metadata: { type: 'balanced' }
      },
      {
        id: 'fast',
        name: 'Fast Progression',
        description: 'Quick leveling for casual gameplay',
        maxLevel: 50,
        baseXp: 50,
        growthRate: 1.05,
        levels: this.generateLevelEntries(50, 50, 1.05),
        metadata: { type: 'casual' }
      },
      {
        id: 'slow',
        name: 'Slow Progression',
        description: 'Challenging progression for hardcore gameplay',
        maxLevel: 200,
        baseXp: 200,
        growthRate: 1.15,
        levels: this.generateLevelEntries(200, 200, 1.15),
        metadata: { type: 'hardcore' }
      }
    ];

    defaultCurves.forEach(curve => this.curves.set(curve.id, curve));
  }

  private generateLevelEntries(maxLevel: number, baseXp: number, growthRate: number): LevelEntry[] {
    const entries: LevelEntry[] = [];
    let currentXp = baseXp;

    for (let level = 1; level <= maxLevel; level++) {
      const nextLevelXp = Math.floor(currentXp);
      
      entries.push({
        level,
        nextLevelXp,
        statBoosts: [
          { stat: 'health', amount: 10 },
          { stat: 'mana', amount: 5 },
          { stat: 'strength', amount: 1 },
          { stat: 'intelligence', amount: 1 }
        ],
        unlockedSkills: level % 5 === 0 ? [`skill_${level}`] : [],
        rewards: level % 10 === 0 ? [{ type: 'item', id: 'level_reward', quantity: 1 }] : []
      });

      currentXp *= growthRate;
    }

    return entries;
  }

  /**
   * Create a new XP entity
   */
  createEntity(id: string, curveId: string = 'standard', initialLevel: number = 1): XPOutput {
    if (this.entities.has(id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Entity ${id} already exists`]
      };
    }

    const curve = this.curves.get(curveId);
    if (!curve) {
      return {
        op: 'create',
        status: 'error',
        issues: [`XP curve ${curveId} not found`]
      };
    }

    const levelEntry = curve.levels.find(l => l.level === initialLevel);
    if (!levelEntry) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Level ${initialLevel} not found in curve ${curveId}`]
      };
    }

    const entity: XPEntity = {
      id,
      level: initialLevel,
      xp: 0,
      nextLevelXp: levelEntry.nextLevelXp,
      totalXp: 0,
      skills: new Map(),
      stats: new Map(),
      lastLevelUp: Date.now()
    };

    this.entities.set(id, entity);
    return {
      op: 'create',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Add XP to an entity
   */
  addXP(entityId: string, amount: number, source?: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add_xp',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.xp += amount;
    entity.totalXp += amount;

    // Check for level up
    const levelUpResult = this.checkAndApplyLevelUp(entity);
    if (levelUpResult) {
      this.levelUpHistory.push(levelUpResult);
    }

    return {
      op: 'add_xp',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get entity level
   */
  getLevel(entityId: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get_level',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    return {
      op: 'get_level',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Check if entity can level up
   */
  checkLevelUp(entityId: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'check_level_up',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const canLevelUp = entity.xp >= entity.nextLevelXp;
    return {
      op: 'check_level_up',
      status: 'ok',
      result: { canLevelUp, currentXp: entity.xp, requiredXp: entity.nextLevelXp }
    };
  }

  /**
   * Force level up an entity
   */
  forceLevelUp(entityId: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'force_level_up',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const levelUpResult = this.applyLevelUp(entity);
    if (levelUpResult) {
      this.levelUpHistory.push(levelUpResult);
      return {
        op: 'force_level_up',
        status: 'ok',
        result: levelUpResult
      };
    } else {
      return {
        op: 'force_level_up',
        status: 'error',
        issues: [`Entity ${entityId} cannot level up`]
      };
    }
  }

  /**
   * Set entity skill level
   */
  setSkillLevel(entityId: string, skillId: string, level: number): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'set_skill',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.skills.set(skillId, Math.max(0, level));
    return {
      op: 'set_skill',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get entity skill level
   */
  getSkillLevel(entityId: string, skillId: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get_skill',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const skillLevel = entity.skills.get(skillId) || 0;
    return {
      op: 'get_skill',
      status: 'ok',
      result: { skillId, level: skillLevel }
    };
  }

  /**
   * Set entity stat value
   */
  setStat(entityId: string, statId: string, value: number): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'set_stat',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    entity.stats.set(statId, Math.max(0, value));
    return {
      op: 'set_stat',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get entity stat value
   */
  getStat(entityId: string, statId: string): XPOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get_stat',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const statValue = entity.stats.get(statId) || 0;
    return {
      op: 'get_stat',
      status: 'ok',
      result: { statId, value: statValue }
    };
  }

  /**
   * List all entities
   */
  listEntities(filter?: XPFilter): XPOutput {
    let entities = Array.from(this.entities.values());

    if (filter) {
      entities = entities.filter(entity => {
        if (filter.minLevel !== undefined && entity.level < filter.minLevel) return false;
        if (filter.maxLevel !== undefined && entity.level > filter.maxLevel) return false;
        if (filter.minXp !== undefined && entity.xp < filter.minXp) return false;
        if (filter.maxXp !== undefined && entity.xp > filter.maxXp) return false;
        if (filter.hasSkill && !entity.skills.has(filter.hasSkill)) return false;
        if (filter.minSkillLevel !== undefined) {
          const skillLevel = entity.skills.get(filter.hasSkill || '') || 0;
          if (skillLevel < filter.minSkillLevel) return false;
        }
        if (filter.maxSkillLevel !== undefined) {
          const skillLevel = entity.skills.get(filter.hasSkill || '') || 0;
          if (skillLevel > filter.maxSkillLevel) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: entities
    };
  }

  /**
   * Get XP statistics
   */
  getXPStats(): XPOutput {
    const entities = Array.from(this.entities.values());
    
    const stats: XPStats = {
      totalEntities: entities.length,
      averageLevel: 0,
      totalXp: 0,
      levelDistribution: {},
      skillDistribution: {},
      mostCommonLevel: 1,
      highestLevel: 1
    };

    if (entities.length > 0) {
      const totalLevel = entities.reduce((sum, e) => sum + e.level, 0);
      stats.averageLevel = totalLevel / entities.length;
      stats.totalXp = entities.reduce((sum, e) => sum + e.totalXp, 0);
      stats.highestLevel = Math.max(...entities.map(e => e.level));

      // Calculate level distribution
      entities.forEach(entity => {
        stats.levelDistribution[entity.level] = (stats.levelDistribution[entity.level] || 0) + 1;
      });

      // Find most common level
      const sortedLevels = Object.entries(stats.levelDistribution)
        .sort(([,a], [,b]) => b - a);
      stats.mostCommonLevel = parseInt(sortedLevels[0]?.[0] || '1');

      // Calculate skill distribution
      entities.forEach(entity => {
        entity.skills.forEach((level, skillId) => {
          stats.skillDistribution[skillId] = (stats.skillDistribution[skillId] || 0) + level;
        });
      });
    }

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Create XP curve
   */
  createCurve(curve: XPCurve): XPOutput {
    if (this.curves.has(curve.id)) {
      return {
        op: 'create_curve',
        status: 'error',
        issues: [`XP curve ${curve.id} already exists`]
      };
    }

    this.curves.set(curve.id, curve);
    return {
      op: 'create_curve',
      status: 'ok',
      result: curve
    };
  }

  /**
   * Get XP curve
   */
  getCurve(curveId: string): XPOutput {
    const curve = this.curves.get(curveId);
    if (!curve) {
      return {
        op: 'get_curve',
        status: 'error',
        issues: [`XP curve ${curveId} not found`]
      };
    }

    return {
      op: 'get_curve',
      status: 'ok',
      result: curve
    };
  }

  /**
   * Export XP data
   */
  exportXP(format: 'json' | 'manifest' | 'summary' | 'history' = 'json'): XPOutput {
    const entities = Array.from(this.entities.values());
    const curves = Array.from(this.curves.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: { entities, total: entities.length }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.xp.export.v1',
            entities,
            curves,
            history: this.levelUpHistory.slice(-100), // Last 100 level ups
            exportedAt: new Date().toISOString(),
            total: entities.length
          }
        };
      
      case 'summary':
        const stats = this.getXPStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            entities: entities.map(entity => ({
              id: entity.id,
              level: entity.level,
              xp: entity.xp,
              totalXp: entity.totalXp,
              skills: Object.fromEntries(entity.skills),
              stats: Object.fromEntries(entity.stats)
            }))
          }
        };
      
      case 'history':
        return {
          op: 'export',
          status: 'ok',
          result: {
            levelUpHistory: this.levelUpHistory,
            total: this.levelUpHistory.length
          }
        };
      
      default:
        return {
          op: 'export',
          status: 'error',
          issues: [`Unknown export format: ${format}`]
        };
    }
  }

  /**
   * Reset all XP data
   */
  resetXP(): XPOutput {
    this.entities.clear();
    this.levelUpHistory = [];
    this.initializeDefaultCurves();
    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'All XP data reset to default state' }
    };
  }

  /**
   * Private helper methods
   */
  private checkAndApplyLevelUp(entity: XPEntity): LevelUpResult | null {
    if (entity.xp < entity.nextLevelXp) {
      return null;
    }

    return this.applyLevelUp(entity);
  }

  private applyLevelUp(entity: XPEntity): LevelUpResult | null {
    const oldLevel = entity.level;
    const newLevel = oldLevel + 1;

    // Find level entry for new level
    const levelEntry = this.findLevelEntry(newLevel);
    if (!levelEntry) {
      return null; // Max level reached
    }

    // Update entity
    entity.level = newLevel;
    entity.xp -= entity.nextLevelXp;
    entity.nextLevelXp = levelEntry.nextLevelXp;
    entity.lastLevelUp = Date.now();

    // Apply stat boosts
    const statBoosts: { stat: string; amount: number }[] = [];
    if (levelEntry.statBoosts) {
      levelEntry.statBoosts.forEach(boost => {
        const currentValue = entity.stats.get(boost.stat) || 0;
        entity.stats.set(boost.stat, currentValue + boost.amount);
        statBoosts.push(boost);
      });
    }

    // Unlock skills
    const unlockedSkills: string[] = [];
    if (levelEntry.unlockedSkills) {
      levelEntry.unlockedSkills.forEach(skillId => {
        if (!entity.skills.has(skillId)) {
          entity.skills.set(skillId, 1);
          unlockedSkills.push(skillId);
        }
      });
    }

    return {
      entityId: entity.id,
      oldLevel,
      newLevel,
      xpGained: entity.nextLevelXp,
      statBoosts,
      unlockedSkills,
      rewards: levelEntry.rewards || [],
      totalXp: entity.totalXp
    };
  }

  private findLevelEntry(level: number): LevelEntry | null {
    // Find the curve that contains this level
    for (const curve of this.curves.values()) {
      const entry = curve.levels.find(l => l.level === level);
      if (entry) {
        return entry;
      }
    }
    return null;
  }
}