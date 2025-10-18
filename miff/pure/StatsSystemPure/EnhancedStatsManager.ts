/**
 * StatsSystemPure Enhanced Manager
 * 
 * Advanced statistics management including modifiers, calculations, 
 * stat dependencies, progression tracking, and analytics.
 */

export interface StatConfig {
  enableModifiers: boolean;
  enableDependencies: boolean;
  enableProgression: boolean;
  enableAnalytics: boolean;
  maxStatValue: number;
  minStatValue: number;
}

export interface Stat {
  key: string;
  base: number;
  current?: number; // Calculated value after modifiers
  category: 'primary' | 'secondary' | 'derived' | 'combat' | 'skill' | 'misc';
  description?: string;
  metadata?: Record<string, any>;
}

export interface StatModifier {
  id: string;
  statKey: string;
  value: number;
  type: 'flat' | 'percentage' | 'multiplier';
  source: string; // Equipment, buff, skill, etc.
  duration?: number; // -1 for permanent, ms for temporary
  startTime?: number;
  condition?: ModifierCondition;
  priority: number; // Calculation order
}

export interface ModifierCondition {
  type: 'stat_threshold' | 'time' | 'event' | 'combination';
  operator: 'equals' | 'greater' | 'less' | 'between';
  value: any;
  statKey?: string;
}

export interface StatDependency {
  dependentStat: string;
  sourceStat: string;
  formula: string; // Mathematical formula (e.g., "source * 0.5 + 10")
  weight: number; // 0-1, how much source affects dependent
}

export interface EntityStats {
  id: string;
  stats: Stat[];
  modifiers: StatModifier[];
  dependencies: StatDependency[];
  lastCalculation: number;
  metadata?: Record<string, any>;
}

export interface StatProgression {
  entityId: string;
  statKey: string;
  history: Array<{
    timestamp: number;
    value: number;
    change: number;
    source: string;
  }>;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  milestones: Array<{
    value: number;
    timestamp: number;
    description: string;
  }>;
}

export interface StatsAnalytics {
  totalEntities: number;
  totalStats: number;
  totalModifiers: number;
  averageStatValue: number;
  statDistribution: Record<string, { min: number; max: number; avg: number; count: number }>;
  modifierEffectiveness: Record<string, { count: number; avgEffect: number; totalEffect: number }>;
  topEntities: Array<{ entityId: string; totalStats: number; rank: number }>;
  categoryBreakdown: Record<string, { count: number; avgValue: number }>;
}

export interface StatCalculationResult {
  statKey: string;
  baseValue: number;
  finalValue: number;
  modifiers: Array<{
    id: string;
    source: string;
    effect: number;
    type: string;
  }>;
  dependencies: Array<{
    sourceStat: string;
    contribution: number;
    formula: string;
  }>;
  calculationTime: number;
}

export interface StatsOutput {
  op: string;
  status: 'ok' | 'error';
  result?: any;
  issues?: string[];
}

export class EnhancedStatsManager {
  private config: StatConfig;
  private entities: Map<string, EntityStats> = new Map();
  private progressions: Map<string, StatProgression> = new Map();
  private calculationCache: Map<string, { result: any; timestamp: number }> = new Map();

  constructor(config?: Partial<StatConfig>) {
    this.config = {
      enableModifiers: true,
      enableDependencies: true,
      enableProgression: true,
      enableAnalytics: true,
      maxStatValue: 9999,
      minStatValue: 0,
      ...config
    };

    this.initializeDefaultStats();
  }

  private initializeDefaultStats(): void {
    // Create a sample entity with default stats
    const defaultEntity: EntityStats = {
      id: 'sample_entity',
      stats: [
        { key: 'strength', base: 10, category: 'primary', description: 'Physical power' },
        { key: 'dexterity', base: 10, category: 'primary', description: 'Agility and precision' },
        { key: 'intelligence', base: 10, category: 'primary', description: 'Mental acuity' },
        { key: 'health', base: 100, category: 'secondary', description: 'Life points' },
        { key: 'mana', base: 50, category: 'secondary', description: 'Magic points' },
        { key: 'attack_power', base: 0, category: 'derived', description: 'Damage output' },
        { key: 'defense', base: 0, category: 'derived', description: 'Damage resistance' }
      ],
      modifiers: [],
      dependencies: [
        { dependentStat: 'health', sourceStat: 'strength', formula: 'source * 5 + 50', weight: 1.0 },
        { dependentStat: 'mana', sourceStat: 'intelligence', formula: 'source * 3 + 20', weight: 1.0 },
        { dependentStat: 'attack_power', sourceStat: 'strength', formula: 'source * 2', weight: 0.7 },
        { dependentStat: 'defense', sourceStat: 'dexterity', formula: 'source * 1.5', weight: 0.5 }
      ],
      lastCalculation: 0
    };

    this.entities.set(defaultEntity.id, defaultEntity);
    this.calculateStats(defaultEntity.id);
  }

  /**
   * Create entity with stats
   */
  createEntity(id: string, stats: Stat[] = []): StatsOutput {
    if (this.entities.has(id)) {
      return {
        op: 'create_entity',
        status: 'error',
        issues: [`Entity ${id} already exists`]
      };
    }

    const entity: EntityStats = {
      id,
      stats: [...stats],
      modifiers: [],
      dependencies: [],
      lastCalculation: 0
    };

    this.entities.set(id, entity);
    this.calculateStats(id);

    return {
      op: 'create_entity',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Add or update stat
   */
  setStat(entityId: string, statKey: string, baseValue: number, category: string = 'misc', description?: string): StatsOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'set_stat',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Validate value bounds
    const clampedValue = Math.max(this.config.minStatValue, Math.min(this.config.maxStatValue, baseValue));

    const existingStat = entity.stats.find(s => s.key === statKey);
    if (existingStat) {
      const oldValue = existingStat.base;
      existingStat.base = clampedValue;
      existingStat.category = category as any;
      if (description) existingStat.description = description;

      // Track progression
      if (this.config.enableProgression) {
        this.updateProgression(entityId, statKey, clampedValue, clampedValue - oldValue, 'manual_update');
      }
    } else {
      entity.stats.push({
        key: statKey,
        base: clampedValue,
        category: category as any,
        description
      });

      // Track progression
      if (this.config.enableProgression) {
        this.updateProgression(entityId, statKey, clampedValue, clampedValue, 'initial_set');
      }
    }

    this.calculateStats(entityId);

    return {
      op: 'set_stat',
      status: 'ok',
      result: { entityId, statKey, baseValue: clampedValue, actualValue: clampedValue }
    };
  }

  /**
   * Add modifier to entity
   */
  addModifier(entityId: string, modifier: StatModifier): StatsOutput {
    if (!this.config.enableModifiers) {
      return {
        op: 'add_modifier',
        status: 'error',
        issues: ['Modifiers are disabled in configuration']
      };
    }

    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add_modifier',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Check if stat exists
    const stat = entity.stats.find(s => s.key === modifier.statKey);
    if (!stat) {
      return {
        op: 'add_modifier',
        status: 'error',
        issues: [`Stat ${modifier.statKey} not found on entity ${entityId}`]
      };
    }

    // Add start time if duration is specified
    if (modifier.duration && modifier.duration > 0) {
      modifier.startTime = Date.now();
    }

    entity.modifiers.push(modifier);
    this.calculateStats(entityId);

    return {
      op: 'add_modifier',
      status: 'ok',
      result: modifier
    };
  }

  /**
   * Remove modifier
   */
  removeModifier(entityId: string, modifierId: string): StatsOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'remove_modifier',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const index = entity.modifiers.findIndex(m => m.id === modifierId);
    if (index === -1) {
      return {
        op: 'remove_modifier',
        status: 'error',
        issues: [`Modifier ${modifierId} not found on entity ${entityId}`]
      };
    }

    const removedModifier = entity.modifiers.splice(index, 1)[0!];
    this.calculateStats(entityId);

    return {
      op: 'remove_modifier',
      status: 'ok',
      result: removedModifier
    };
  }

  /**
   * Add stat dependency
   */
  addDependency(entityId: string, dependency: StatDependency): StatsOutput {
    if (!this.config.enableDependencies) {
      return {
        op: 'add_dependency',
        status: 'error',
        issues: ['Dependencies are disabled in configuration']
      };
    }

    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'add_dependency',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Validate stats exist
    const dependentStat = entity.stats.find(s => s.key === dependency.dependentStat);
    const sourceStat = entity.stats.find(s => s.key === dependency.sourceStat);

    if (!dependentStat) {
      return {
        op: 'add_dependency',
        status: 'error',
        issues: [`Dependent stat ${dependency.dependentStat} not found`]
      };
    }

    if (!sourceStat) {
      return {
        op: 'add_dependency',
        status: 'error',
        issues: [`Source stat ${dependency.sourceStat} not found`]
      };
    }

    entity.dependencies.push(dependency);
    this.calculateStats(entityId);

    return {
      op: 'add_dependency',
      status: 'ok',
      result: dependency
    };
  }

  /**
   * Calculate all stats for entity
   */
  calculateStats(entityId: string): StatsOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'calculate_stats',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    const startTime = performance.now();
    const calculations: StatCalculationResult[] = [];

    // Clean up expired modifiers first
    if (this.config.enableModifiers) {
      this.cleanupExpiredModifiers(entity);
    }

    // Calculate each stat
    for (const stat of entity.stats) {
      const calculation = this.calculateStat(entity, stat.key);
      calculations.push(calculation);
      stat.current = calculation.finalValue;
    }

    entity.lastCalculation = Date.now();
    const totalTime = performance.now() - startTime;

    // Cache the result
    this.calculationCache.set(entityId, {
      result: { entity, calculations },
      timestamp: new Date()
    });

    return {
      op: 'calculate_stats',
      status: 'ok',
      result: {
        entityId,
        calculations,
        totalCalculationTime: totalTime,
        lastCalculation: entity.lastCalculation
      }
    };
  }

  /**
   * Calculate individual stat
   */
  private calculateStat(entity: EntityStats, statKey: string): StatCalculationResult {
    const stat = entity.stats.find(s => s.key === statKey);
    if (!stat) {
      throw new Error(`Stat ${statKey} not found`);
    }

    let value = stat.base;
    const modifierEffects: Array<{ id: string; source: string; effect: number; type: string }> = [];
    const dependencyContributions: Array<{ sourceStat: string; contribution: number; formula: string }> = [];

    // Apply dependencies first (if enabled)
    if (this.config.enableDependencies) {
      for (const dependency of entity.dependencies) {
        if (dependency.dependentStat === statKey) {
          const sourceStat = entity.stats.find(s => s.key === dependency.sourceStat);
          if (sourceStat) {
            const contribution = this.evaluateFormula(dependency.formula, sourceStat.base) * dependency.weight;
            value += contribution;
            dependencyContributions.push({
              sourceStat: dependency.sourceStat,
              contribution,
              formula: dependency.formula
            });
          }
        }
      }
    }

    // Apply modifiers (if enabled)
    if (this.config.enableModifiers) {
      // Sort modifiers by priority
      const relevantModifiers = entity.modifiers
        .filter((m: any) => m.statKey === statKey && this.isModifierActive(m))
        .sort((a: any, b: any) => a.priority - b.priority);

      for (const modifier of relevantModifiers) {
        if (this.evaluateModifierCondition(modifier, entity)) {
          let effect = 0;

          switch (modifier.type) {
            case 'flat':
              effect = modifier.value;
              value += effect;
              break;
            case 'percentage':
              effect = value * (modifier.value / 100);
              value += effect;
              break;
            case 'multiplier':
              effect = value * (modifier.value - 1);
              value = value * modifier.value;
              break;
          }

          modifierEffects.push({
            id: modifier.id,
            source: modifier.source,
            effect,
            type: modifier.type
          });
        }
      }
    }

    // Clamp final value
    const finalValue = Math.max(this.config.minStatValue, Math.min(this.config.maxStatValue, Math.round(value)));

    return {
      statKey,
      baseValue: stat.base,
      finalValue,
      modifiers: modifierEffects,
      dependencies: dependencyContributions,
      calculationTime: 0 // Would be measured in real implementation
    };
  }

  /**
   * Get entity stats
   */
  getEntityStats(entityId: string): StatsOutput {
    const entity = this.entities.get(entityId);
    if (!entity) {
      return {
        op: 'get_entity',
        status: 'error',
        issues: [`Entity ${entityId} not found`]
      };
    }

    // Check if we need to recalculate
    const lastCalc = entity.lastCalculation;
    const now = Date.now();
    const shouldRecalculate = now - lastCalc > 1000; // Recalculate every second

    if (shouldRecalculate) {
      this.calculateStats(entityId);
    }

    return {
      op: 'get_entity',
      status: 'ok',
      result: entity
    };
  }

  /**
   * Get stat progression
   */
  getStatProgression(entityId: string, statKey: string): StatsOutput {
    if (!this.config.enableProgression) {
      return {
        op: 'get_progression',
        status: 'error',
        issues: ['Progression tracking is disabled in configuration']
      };
    }

    const progressionKey = `${entityId}_${statKey}`;
    const progression = this.progressions.get(progressionKey);

    if (!progression) {
      return {
        op: 'get_progression',
        status: 'error',
        issues: [`No progression found for entity ${entityId}, stat ${statKey}`]
      };
    }

    return {
      op: 'get_progression',
      status: 'ok',
      result: progression
    };
  }

  /**
   * Get analytics
   */
  getAnalytics(): StatsOutput {
    if (!this.config.enableAnalytics) {
      return {
        op: 'get_analytics',
        status: 'error',
        issues: ['Analytics are disabled in configuration']
      };
    }

    const entities = Array.from(this.entities.values());
    const allStats = entities.flatMap(e => e.stats);
    const allModifiers = entities.flatMap(e => e.modifiers);

    // Calculate stat distribution
    const statDistribution: Record<string, { min: number; max: number; avg: number; count: number }> = {};
    const statGroups = new Map<string, number[]>();

    for (const stat of allStats) {
      if (!statGroups.has(stat.key)) {
        statGroups.set(stat.key, []);
      }
      statGroups.get(stat.key)!.push(stat.current || stat.base);
    }

    for (const [statKey, values] of statGroups) {
      statDistribution[statKey] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        count: values.length
      };
    }

    // Calculate modifier effectiveness
    const modifierEffectiveness: Record<string, { count: number; avgEffect: number; totalEffect: number }> = {};
    const modifierGroups = new Map<string, number[]>();

    for (const modifier of allModifiers) {
      if (!modifierGroups.has(modifier.source)) {
        modifierGroups.set(modifier.source, []);
      }
      modifierGroups.get(modifier.source)!.push(Math.abs(modifier.value));
    }

    for (const [source, effects] of modifierGroups) {
      const totalEffect = effects.reduce((sum, e) => sum + e, 0);
      modifierEffectiveness[source] = {
        count: effects.length,
        avgEffect: totalEffect / effects.length,
        totalEffect
      };
    }

    // Calculate top entities by total stats
    const topEntities = entities
      .map((entity: any) => ({
        entityId: entity.id,
        totalStats: entity.stats.reduce((sum, stat) => sum + (stat.current || stat.base), 0),
        rank: 0
      }))
      .sort((a: any, b: any) => b.totalStats - a.totalStats)
      .map((entity, index) => ({ ...entity, rank: index + 1 }))
      .slice(0, 10);

    // Calculate category breakdown
    const categoryBreakdown: Record<string, { count: number; avgValue: number }> = {};
    const categoryGroups = new Map<string, number[]>();

    for (const stat of allStats) {
      if (!categoryGroups.has(stat.category)) {
        categoryGroups.set(stat.category, []);
      }
      categoryGroups.get(stat.category)!.push(stat.current || stat.base);
    }

    for (const [category, values] of categoryGroups) {
      categoryBreakdown[category] = {
        count: values.length,
        avgValue: values.reduce((sum, v) => sum + v, 0) / values.length
      };
    }

    const analytics: StatsAnalytics = {
      totalEntities: entities.length,
      totalStats: allStats.length,
      totalModifiers: allModifiers.length,
      averageStatValue: allStats.reduce((sum, s) => sum + (s.current || s.base), 0) / allStats.length,
      statDistribution,
      modifierEffectiveness,
      topEntities,
      categoryBreakdown
    };

    return {
      op: 'get_analytics',
      status: 'ok',
      result: analytics
    };
  }

  /**
   * List all entities
   */
  listEntities(): StatsOutput {
    const entities = Array.from(this.entities.values());
    return {
      op: 'list_entities',
      status: 'ok',
      result: entities.map((e: any) => ({
        id: e.id,
        statCount: e.stats.length,
        modifierCount: e.modifiers.length,
        dependencyCount: e.dependencies.length,
        lastCalculation: e.lastCalculation
      }))
    };
  }

  /**
   * Export stats data
   */
  exportStats(format: 'json' | 'manifest' | 'summary' | 'analytics' = 'json'): StatsOutput {
    const entities = Array.from(this.entities.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            config: this.config,
            entities,
            progressions: Array.from(this.progressions.values()),
            exportedAt: new Date().toISOString()
          }
        };

      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.stats.export.v1',
            config: this.config,
            summary: {
              totalEntities: entities.length,
              totalStats: entities.reduce((sum, e) => sum + e.stats.length, 0),
              totalModifiers: entities.reduce((sum, e) => sum + e.modifiers.length, 0),
              totalDependencies: entities.reduce((sum, e) => sum + e.dependencies.length, 0)
            },
            entities,
            exportedAt: new Date().toISOString()
          }
        };

      case 'summary':
        return {
          op: 'export',
          status: 'ok',
          result: {
            entities: entities.map((e: any) => ({
              id: e.id,
              stats: e.stats.map((s: any) => ({
                key: s.key,
                base: s.base,
                current: s.current,
                category: s.category
              })),
              modifierCount: e.modifiers.length,
              dependencyCount: e.dependencies.length
            }))
          }
        };

      case 'analytics':
        const analyticsResult = this.getAnalytics();
        return {
          op: 'export',
          status: 'ok',
          result: analyticsResult.result
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
   * Reset all stats data
   */
  resetStats(): StatsOutput {
    this.entities.clear();
    this.progressions.clear();
    this.calculationCache.clear();
    this.initializeDefaultStats();

    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'All stats data reset to default state' }
    };
  }

  // Private helper methods

  private updateProgression(entityId: string, statKey: string, newValue: number, change: number, source: string): void {
    const progressionKey = `${entityId}_${statKey}`;
    let progression = this.progressions.get(progressionKey);

    if (!progression) {
      progression = {
        entityId,
        statKey,
        history: [],
        trends: { daily: 0, weekly: 0, monthly: 0 },
        milestones: []
      };
      this.progressions.set(progressionKey, progression);
    }

    const timestamp = Date.now();
    progression.history.push({
      timestamp,
      value: newValue,
      change,
      source
    });

    // Keep only last 1000 entries
    if (progression.history.length > 1000) {
      progression.history = progression.history.slice(-1000);
    }

    // Update trends
    this.calculateTrends(progression);

    // Check for milestones
    this.checkMilestones(progression, newValue, timestamp);
  }

  private calculateTrends(progression: StatProgression): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const dailyEntries = progression.history.filter((h: any) => h.timestamp >= oneDayAgo);
    const weeklyEntries = progression.history.filter((h: any) => h.timestamp >= oneWeekAgo);
    const monthlyEntries = progression.history.filter((h: any) => h.timestamp >= oneMonthAgo);

    progression.trends.daily = dailyEntries.reduce((sum, h) => sum + h.change, 0);
    progression.trends.weekly = weeklyEntries.reduce((sum, h) => sum + h.change, 0);
    progression.trends.monthly = monthlyEntries.reduce((sum, h) => sum + h.change, 0);
  }

  private checkMilestones(progression: StatProgression, value: number, timestamp: number): void {
    const milestoneValues = [10, 25, 50, 100, 250, 500, 1000];
    
    for (const milestoneValue of milestoneValues) {
      const existingMilestone = progression.milestones.find(m => m.value === milestoneValue);
      if (!existingMilestone && value >= milestoneValue) {
        progression.milestones.push({
          value: milestoneValue,
          timestamp,
          description: `Reached ${milestoneValue} in ${progression.statKey}`
        });
      }
    }
  }

  private cleanupExpiredModifiers(entity: EntityStats): void {
    const now = Date.now();
    entity.modifiers = entity.modifiers.filter((modifier: any) => {
      if (modifier.duration && modifier.duration > 0 && modifier.startTime) {
        return (now - modifier.startTime) < modifier.duration;
      }
      return true;
    });
  }

  private isModifierActive(modifier: StatModifier): boolean {
    if (modifier.duration && modifier.duration > 0 && modifier.startTime) {
      const now = Date.now();
      return (now - modifier.startTime) < modifier.duration;
    }
    return true;
  }

  private evaluateModifierCondition(modifier: StatModifier, entity: EntityStats): boolean {
    if (!modifier.condition) return true;

    const condition = modifier.condition;
    
    switch (condition.type) {
      case 'stat_threshold':
        if (!condition.statKey) return false;
        const stat = entity.stats.find(s => s.key === condition.statKey);
        if (!stat) return false;
        const statValue = stat.current || stat.base;
        
        switch (condition.operator) {
          case 'equals': return statValue === condition.value;
          case 'greater': return statValue > condition.value;
          case 'less': return statValue < condition.value;
          case 'between': 
            return Array.isArray(condition.value) && 
                   statValue >= condition.value[0!] && 
                   statValue <= condition.value[1!];
          default: return false;
        }
      
      case 'time':
        const now = Date.now();
        switch (condition.operator) {
          case 'greater': return now > condition.value;
          case 'less': return now < condition.value;
          case 'between':
            return Array.isArray(condition.value) && 
                   now >= condition.value[0!] && 
                   now <= condition.value[1!];
          default: return false;
        }
      
      default:
        return true;
    }
  }

  private evaluateFormula(formula: string, sourceValue: number): number {
    try {
      // Simple formula evaluation - replace 'source' with actual value
      const expression = formula.replace(/source/g, sourceValue.toString());
      // In a real implementation, you'd use a safe math expression evaluator
      // For now, we'll do basic parsing for common cases
      
      if (expression.includes('*')) {
        const parts = expression.split('*').map((p: any) => p.trim());
        if (parts.length === 2) {
          const multiplier = parseFloat(parts[1!].split('+')[0!].trim());
          const addition = parts[1!].includes('+') ? parseFloat(parts[1!].split('+')[1!].trim()) : 0;
          return sourceValue * multiplier + addition;
        }
      }
      
      // Fallback to simple evaluation
      return eval(expression);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Formula evaluation failed', { formula, error: err });
      return 0;
    }
  }
}