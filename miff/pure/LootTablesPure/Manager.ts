/**
 * LootTablesPure Manager
 * 
 * Advanced loot table management system including weighted drops, rarity tiers,
 * stat rolling, conditional drops, and loot table chaining.
 */

export interface LootEntry {
  id: string;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statRolls?: { key: string; min: number; max: number }[];
  conditions?: LootCondition[];
  metadata?: Record<string, any>;
}

export interface LootTable {
  id: string;
  name: string;
  entries: LootEntry[];
  maxRolls?: number;
  guaranteedDrops?: string[]; // Entry IDs that are guaranteed
  rarityModifiers?: Record<string, number>; // Modifiers for rarity chances
  metadata?: Record<string, any>;
}

export interface LootCondition {
  type: 'level' | 'class' | 'faction' | 'quest' | 'item' | 'stat';
  target: string;
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'not_equals';
}

export interface LootResult {
  drops: LootDrop[];
  totalValue: number;
  rarityDistribution: Record<string, number>;
  rollCount: number;
  seed?: number;
}

export interface LootDrop {
  id: string;
  rarity: string;
  quantity: number;
  rolledStats?: Record<string, number>;
  value: number;
  metadata?: Record<string, any>;
}

export interface LootStats {
  totalTables: number;
  totalEntries: number;
  averageWeight: number;
  rarityDistribution: Record<string, number>;
  mostCommonItems: Array<{ id: string; frequency: number }>;
  totalValue: number;
}

export interface LootFilter {
  rarity?: string;
  minWeight?: number;
  maxWeight?: number;
  hasConditions?: boolean;
}

export interface LootOutput {
  op: string;
  status: 'ok' | 'error';
  result?: LootTable | LootTable[] | LootResult | LootStats;
  issues?: string[];
}

export class LootTablesManager {
  private tables = new Map<string, LootTable>();
  private rollHistory: Array<{ tableId: string; result: LootResult; timestamp: number }> = [];

  constructor() {
    this.initializeDefaultTables();
  }

  private initializeDefaultTables() {
    const defaultTables: LootTable[] = [
      {
        id: 'basic_enemy_drops',
        name: 'Basic Enemy Drops',
        entries: [
          {
            id: 'gold_coin',
            weight: 50,
            rarity: 'common',
            statRolls: [{ key: 'value', min: 1, max: 5 }]
          },
          {
            id: 'health_potion',
            weight: 20,
            rarity: 'common'
          },
          {
            id: 'iron_sword',
            weight: 10,
            rarity: 'uncommon',
            statRolls: [
              { key: 'damage', min: 5, max: 10 },
              { key: 'durability', min: 50, max: 100 }
            ]
          },
          {
            id: 'magic_ring',
            weight: 5,
            rarity: 'rare',
            statRolls: [
              { key: 'magic_power', min: 10, max: 25 }
            ]
          }
        ],
        maxRolls: 3,
        metadata: { description: 'Basic loot from common enemies' }
      },
      {
        id: 'boss_drops',
        name: 'Boss Drops',
        entries: [
          {
            id: 'boss_essence',
            weight: 100,
            rarity: 'epic',
            statRolls: [
              { key: 'power', min: 50, max: 100 }
            ]
          },
          {
            id: 'legendary_weapon',
            weight: 30,
            rarity: 'legendary',
            statRolls: [
              { key: 'damage', min: 25, max: 50 },
              { key: 'special_ability', min: 1, max: 3 }
            ]
          },
          {
            id: 'boss_armor',
            weight: 50,
            rarity: 'epic',
            statRolls: [
              { key: 'defense', min: 15, max: 30 },
              { key: 'durability', min: 100, max: 200 }
            ]
          }
        ],
        guaranteedDrops: ['boss_essence'],
        metadata: { description: 'Loot from boss encounters' }
      }
    ];

    defaultTables.forEach(table => this.tables.set(table.id, table));
  }

  /**
   * Create a new loot table
   */
  createTable(table: LootTable): LootOutput {
    if (this.tables.has(table.id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Loot table ${table.id} already exists`]
      };
    }

    // Validate table
    const validation = this.validateTable(table);
    if (!validation.valid) {
      return {
        op: 'create',
        status: 'error',
        issues: validation.errors
      };
    }

    this.tables.set(table.id, table);
    return {
      op: 'create',
      status: 'ok',
      result: table
    };
  }

  /**
   * Update loot table
   */
  updateTable(tableId: string, updates: Partial<LootTable>): LootOutput {
    const table = this.tables.get(tableId);
    if (!table) {
      return {
        op: 'update',
        status: 'error',
        issues: [`Loot table ${tableId} not found`]
      };
    }

    const updatedTable = { ...table, ...updates };
    
    // Validate updated table
    const validation = this.validateTable(updatedTable);
    if (!validation.valid) {
      return {
        op: 'update',
        status: 'error',
        issues: validation.errors
      };
    }

    this.tables.set(tableId, updatedTable);
    return {
      op: 'update',
      status: 'ok',
      result: updatedTable
    };
  }

  /**
   * Delete loot table
   */
  deleteTable(tableId: string): LootOutput {
    if (!this.tables.has(tableId)) {
      return {
        op: 'delete',
        status: 'error',
        issues: [`Loot table ${tableId} not found`]
      };
    }

    this.tables.delete(tableId);
    return {
      op: 'delete',
      status: 'ok'
    };
  }

  /**
   * Get loot table by ID
   */
  getTable(tableId: string): LootOutput {
    const table = this.tables.get(tableId);
    if (!table) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Loot table ${tableId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: table
    };
  }

  /**
   * List all loot tables
   */
  listTables(filter?: LootFilter): LootOutput {
    let tables = Array.from(this.tables.values());

    if (filter) {
      tables = tables.filter(table => {
        if (filter.rarity) {
          const hasRarity = table.entries.some(entry => entry.rarity === filter.rarity);
          if (!hasRarity) return false;
        }
        if (filter.minWeight !== undefined) {
          const hasMinWeight = table.entries.some(entry => entry.weight >= filter.minWeight!);
          if (!hasMinWeight) return false;
        }
        if (filter.maxWeight !== undefined) {
          const hasMaxWeight = table.entries.some(entry => entry.weight <= filter.maxWeight!);
          if (!hasMaxWeight) return false;
        }
        if (filter.hasConditions !== undefined) {
          const hasConditions = table.entries.some(entry => entry.conditions && entry.conditions.length > 0);
          if (filter.hasConditions !== hasConditions) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: tables
    };
  }

  /**
   * Roll loot from a table
   */
  rollLoot(tableId: string, count: number = 1, seed?: number): LootOutput {
    const table = this.tables.get(tableId);
    if (!table) {
      return {
        op: 'roll',
        status: 'error',
        issues: [`Loot table ${tableId} not found`]
      };
    }

    const maxRolls = table.maxRolls || table.entries.length;
    const actualCount = Math.min(count, maxRolls);
    
    const drops: LootDrop[] = [];
    const rarityDistribution: Record<string, number> = {};
    let totalValue = 0;

    // Add guaranteed drops first
    if (table.guaranteedDrops) {
      for (const entryId of table.guaranteedDrops) {
        const entry = table.entries.find(e => e.id === entryId);
        if (entry) {
          const drop = this.createLootDrop(entry, seed);
          drops.push(drop);
          rarityDistribution[entry.rarity] = (rarityDistribution[entry.rarity] || 0) + 1;
          totalValue += drop.value;
        }
      }
    }

    // Roll remaining drops
    const remainingCount = Math.max(0, actualCount - (table.guaranteedDrops?.length || 0));
    for (let i = 0; i < remainingCount; i++) {
      const entry = this.selectWeightedEntry(table.entries, seed);
      if (entry) {
        const drop = this.createLootDrop(entry, seed);
        drops.push(drop);
        rarityDistribution[entry.rarity] = (rarityDistribution[entry.rarity] || 0) + 1;
        totalValue += drop.value;
      }
    }

    const result: LootResult = {
      drops,
      totalValue,
      rarityDistribution,
      rollCount: drops.length,
      seed
    };

    // Record roll history
    this.rollHistory.push({
      tableId,
      result,
      timestamp: Date.now()
    });

    return {
      op: 'roll',
      status: 'ok',
      result
    };
  }

  /**
   * Get loot statistics
   */
  getLootStats(): LootOutput {
    const tables = Array.from(this.tables.values());
    const allEntries = tables.flatMap(table => table.entries);
    
    const stats: LootStats = {
      totalTables: tables.length,
      totalEntries: allEntries.length,
      averageWeight: allEntries.reduce((sum, entry) => sum + entry.weight, 0) / allEntries.length,
      rarityDistribution: {},
      mostCommonItems: [],
      totalValue: 0
    };

    // Calculate rarity distribution
    allEntries.forEach(entry => {
      stats.rarityDistribution[entry.rarity] = (stats.rarityDistribution[entry.rarity] || 0) + 1;
    });

    // Calculate most common items
    const itemFrequency: Record<string, number> = {};
    allEntries.forEach(entry => {
      itemFrequency[entry.id] = (itemFrequency[entry.id] || 0) + 1;
    });

    stats.mostCommonItems = Object.entries(itemFrequency)
      .map(([id, frequency]) => ({ id, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Export loot tables in various formats
   */
  exportTables(format: 'json' | 'manifest' | 'summary' | 'rolls' = 'json'): LootOutput {
    const tables = Array.from(this.tables.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: { tables, total: tables.length }
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.loot.export.v1',
            tables,
            rollHistory: this.rollHistory.slice(-100), // Last 100 rolls
            exportedAt: new Date().toISOString(),
            total: tables.length
          }
        };
      
      case 'summary':
        const stats = this.getLootStats();
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: stats.result,
            tables: tables.map(table => ({
              id: table.id,
              name: table.name,
              entryCount: table.entries.length,
              maxRolls: table.maxRolls,
              guaranteedDrops: table.guaranteedDrops?.length || 0
            }))
          }
        };
      
      case 'rolls':
        return {
          op: 'export',
          status: 'ok',
          result: {
            rollHistory: this.rollHistory,
            total: this.rollHistory.length
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
   * Reset all loot tables
   */
  resetTables(): LootOutput {
    this.tables.clear();
    this.rollHistory = [];
    this.initializeDefaultTables();
    return {
      op: 'reset',
      status: 'ok',
      result: { message: 'All loot tables reset to default state' }
    };
  }

  /**
   * Private helper methods
   */
  private validateTable(table: LootTable): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!table.id || table.id.trim() === '') {
      errors.push('Table ID is required');
    }

    if (!table.name || table.name.trim() === '') {
      errors.push('Table name is required');
    }

    if (!table.entries || table.entries.length === 0) {
      errors.push('Table must have at least one entry');
    }

    if (table.entries) {
      table.entries.forEach((entry, index) => {
        if (!entry.id || entry.id.trim() === '') {
          errors.push(`Entry ${index} must have an ID`);
        }
        if (entry.weight <= 0) {
          errors.push(`Entry ${entry.id} must have a positive weight`);
        }
        if (!['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(entry.rarity)) {
          errors.push(`Entry ${entry.id} has invalid rarity: ${entry.rarity}`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  private selectWeightedEntry(entries: LootEntry[], seed?: number): LootEntry | null {
    if (entries.length === 0) return null;

    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight === 0) return entries[0]; // Fallback to first entry

    // Use seed for deterministic results
    const random = seed ? this.seededRandom(seed) : Math.random();
    const target = random * totalWeight;

    let currentWeight = 0;
    for (const entry of entries) {
      currentWeight += entry.weight;
      if (currentWeight >= target) {
        return entry;
      }
    }

    return entries[entries.length - 1]; // Fallback to last entry
  }

  private createLootDrop(entry: LootEntry, seed?: number): LootDrop {
    const rolledStats: Record<string, number> = {};
    
    if (entry.statRolls) {
      entry.statRolls.forEach(stat => {
        const random = seed ? this.seededRandom(seed + stat.key.length) : Math.random();
        const value = stat.min + (random * (stat.max - stat.min));
        rolledStats[stat.key] = Math.round(value * 100) / 100;
      });
    }

    // Calculate value based on rarity and stats
    const baseValue = this.getRarityBaseValue(entry.rarity);
    const statValue = Object.values(rolledStats).reduce((sum, val) => sum + val, 0);
    const value = baseValue + statValue;

    return {
      id: entry.id,
      rarity: entry.rarity,
      quantity: 1,
      rolledStats: Object.keys(rolledStats).length > 0 ? rolledStats : undefined,
      value: Math.round(value * 100) / 100,
      metadata: entry.metadata
    };
  }

  private getRarityBaseValue(rarity: string): number {
    const values = {
      'common': 1,
      'uncommon': 5,
      'rare': 25,
      'epic': 100,
      'legendary': 500
    };
    return values[rarity as keyof typeof values] || 1;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}