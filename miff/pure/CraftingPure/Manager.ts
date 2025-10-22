/**
 * CraftingPure Manager
 * 
 * Advanced crafting system including recipe management, material requirements,
 * skill-based crafting, quality systems, and comprehensive crafting workflows.
 */

import type { StatBlock } from '../SharedSchemaPure/Manager';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'consumable' | 'material' | 'tool' | 'decoration';
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  statMods?: StatBlock;
  skillRequired?: string;
  skillLevel?: number;
  craftingTime: number; // seconds
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  quality: 'poor' | 'normal' | 'good' | 'excellent' | 'perfect';
  prerequisites?: string[]; // Recipe IDs that must be learned first
  unlockLevel?: number;
  metadata?: Record<string, any>;
}

export interface Inventory {
  [itemId: string]: number;
}

export interface CraftingSession {
  id: string;
  recipeId: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  crafterId: string;
  quality: number; // 0-100
  materials: Record<string, number>;
  outputs: Record<string, number>;
  experience: number;
  metadata?: Record<string, any>;
}

export interface CraftResult {
  crafted: Record<string, number>;
  remaining: Inventory;
  statMods?: StatBlock;
  quality: number;
  experience: number;
  success: boolean;
  sessionId: string;
  craftingTime: number;
  metadata?: Record<string, any>;
}

export interface CraftingStats {
  totalRecipes: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  averageQuality: number;
  totalExperience: number;
  recipesByCategory: Record<string, number>;
  difficultyDistribution: Record<string, number>;
}

export interface CraftingFilter {
  category?: string;
  difficulty?: string;
  skillRequired?: string;
  minLevel?: number;
  maxLevel?: number;
  hasPrerequisites?: boolean;
}

export interface CraftingOutput {
  op: string;
  status: 'ok' | 'error';
  result?: Recipe | Recipe[] | CraftResult | CraftingStats | CraftingSession;
  issues?: string[];
}

export class CraftingManager {
  private recipes: Map<string, Recipe> = new Map();
  private sessions: Map<string, CraftingSession> = new Map();
  private craftingHistory: CraftResult[] = [];

  constructor() {
    this.initializeDefaultRecipes();
  }

  private initializeDefaultRecipes() {
    const defaultRecipes: Recipe[] = [
      {
        id: 'iron_sword',
        name: 'Iron Sword',
        description: 'A basic iron sword',
        category: 'weapon',
        inputs: { 'iron_ingot': 2, 'wood': 1 },
        outputs: { 'iron_sword': 1 },
        statMods: [
          { key: 'damage', base: 15 },
          { key: 'durability', base: 100 }
        ],
        skillRequired: 'smithing',
        skillLevel: 1,
        craftingTime: 30,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      },
      {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'A basic healing potion',
        category: 'consumable',
        inputs: { 'healing_herb': 3, 'water': 1, 'bottle': 1 },
        outputs: { 'health_potion': 2 },
        statMods: [
          { key: 'healing', base: 50 }
        ],
        skillRequired: 'alchemy',
        skillLevel: 1,
        craftingTime: 15,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      },
      {
        id: 'leather_armor',
        name: 'Leather Armor',
        description: 'Basic leather protection',
        category: 'armor',
        inputs: { 'leather': 4, 'thread': 2 },
        outputs: { 'leather_armor': 1 },
        statMods: [
          { key: 'defense', base: 8 },
          { key: 'durability', base: 80 }
        ],
        skillRequired: 'tailoring',
        skillLevel: 1,
        craftingTime: 45,
        difficulty: 'easy',
        quality: 'normal',
        unlockLevel: 1
      },
      {
        id: 'steel_sword',
        name: 'Steel Sword',
        description: 'A superior steel sword',
        category: 'weapon',
        inputs: { 'steel_ingot': 3, 'iron_ingot': 1, 'wood': 1 },
        outputs: { 'steel_sword': 1 },
        statMods: [
          { key: 'damage', base: 25 },
          { key: 'durability', base: 150 }
        ],
        skillRequired: 'smithing',
        skillLevel: 3,
        craftingTime: 60,
        difficulty: 'medium',
        quality: 'good',
        prerequisites: ['iron_sword'],
        unlockLevel: 5
      }
    ];

    defaultRecipes.forEach((recipe: any) => this.recipes.set(recipe.id, recipe));
  }

  // Shims expected by cliHarnessWrapper
  registerRecipe(recipe: Recipe): void {
    // Map minimal wrapper recipe to rich Recipe shape
    const normalized: Recipe = {
      id: recipe.id || recipe.name || `recipe_${Date.now()}`,
      name: recipe.name || recipe.id || 'Custom Recipe',
      description: recipe.description || '',
      category: 'material',
      inputs: recipe.inputs || recipe.materials || {},
      outputs: recipe.outputs || { [recipe.id || 'crafted_item']: 1 },
      craftingTime: recipe.craftTime || recipe.craftingTime || 10,
      difficulty: 'easy',
      quality: 'normal'
    };
    this.recipes.set(normalized.id, normalized);
  }

  simulate(recipeId: string, inventory: Inventory) {
    const started = this.startCrafting(recipeId, 'cli', inventory);
    if (started.status !== 'ok' || !started.result) {
      return { success: false, issues: (started as any).issues };
    }
    const completed = this.completeCrafting((started.result as any).id, inventory);
    return completed.result;
  }

  /**
   * Create a new recipe
   */
  createRecipe(recipe: Recipe): CraftingOutput {
    if (this.recipes.has(recipe.id)) {
      return {
        op: 'create',
        status: 'error',
        issues: [`Recipe ${recipe.id} already exists`]
      };
    }

    // Validate recipe
    const validation = this.validateRecipe(recipe);
    if (!validation.valid) {
      return {
        op: 'create',
        status: 'error',
        issues: validation.errors
      };
    }

    this.recipes.set(recipe.id, recipe);
    return {
      op: 'create',
      status: 'ok',
      result: recipe
    };
  }

  /**
   * Update recipe
   */
  updateRecipe(recipeId: string, updates: Partial<Recipe>): CraftingOutput {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return {
        op: 'update',
        status: 'error',
        issues: [`Recipe ${recipeId} not found`]
      };
    }

    const updatedRecipe = { ...recipe, ...updates };
    
    // Validate updated recipe
    const validation = this.validateRecipe(updatedRecipe);
    if (!validation.valid) {
      return {
        op: 'update',
        status: 'error',
        issues: validation.errors
      };
    }

    this.recipes.set(recipeId, updatedRecipe);
    return {
      op: 'update',
      status: 'ok',
      result: updatedRecipe
    };
  }

  /**
   * Delete recipe
   */
  deleteRecipe(recipeId: string): CraftingOutput {
    if (!this.recipes.has(recipeId)) {
      return {
        op: 'delete',
        status: 'error',
        issues: [`Recipe ${recipeId} not found`]
      };
    }

    this.recipes.delete(recipeId);
    return {
      op: 'delete',
      status: 'ok'
    };
  }

  /**
   * Get recipe by ID
   */
  getRecipe(recipeId: string): CraftingOutput {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return {
        op: 'get',
        status: 'error',
        issues: [`Recipe ${recipeId} not found`]
      };
    }

    return {
      op: 'get',
      status: 'ok',
      result: recipe
    };
  }

  /**
   * List all recipes
   */
  listRecipes(filter?: CraftingFilter): CraftingOutput {
    let recipes = Array.from(this.recipes.values());

    if (filter) {
      recipes = recipes.filter((recipe: any) => {
        if (filter.category && recipe.category !== filter.category) return false;
        if (filter.difficulty && recipe.difficulty !== filter.difficulty) return false;
        if (filter.skillRequired && recipe.skillRequired !== filter.skillRequired) return false;
        if (filter.minLevel !== undefined && (recipe.skillLevel || 0) < filter.minLevel) return false;
        if (filter.maxLevel !== undefined && (recipe.skillLevel || 0) > filter.maxLevel) return false;
        if (filter.hasPrerequisites !== undefined) {
          const hasPrereqs = recipe.prerequisites && recipe.prerequisites.length > 0;
          if (filter.hasPrerequisites !== hasPrereqs) return false;
        }
        return true;
      });
    }

    return {
      op: 'list',
      status: 'ok',
      result: recipes
    };
  }

  /**
   * Start a crafting session
   */
  startCrafting(recipeId: string, crafterId: string, inventory: Inventory): CraftingOutput {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return {
        op: 'start_crafting',
        status: 'error',
        issues: [`Recipe ${recipeId} not found`]
      };
    }

    // Check if materials are available
    for (const [material, required] of Object.entries(recipe.inputs)) {
      if ((inventory[material] || 0) < required) {
        return {
          op: 'start_crafting',
          status: 'error',
          issues: [`Insufficient ${material}: need ${required}, have ${inventory[material] || 0}`]
        };
      }
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: CraftingSession = {
      id: sessionId,
      recipeId,
      startTime: new Date(),
      status: 'active',
      crafterId,
      quality: this.calculateBaseQuality(recipe),
      materials: { ...recipe.inputs },
      outputs: { ...recipe.outputs },
      experience: 0
    };

    this.sessions.set(sessionId, session);
    return {
      op: 'start_crafting',
      status: 'ok',
      result: session
    };
  }

  /**
   * Complete a crafting session
   */
  completeCrafting(sessionId: string, inventory: Inventory): CraftingOutput {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        op: 'complete_crafting',
        status: 'error',
        issues: [`Crafting session ${sessionId} not found`]
      };
    }

    if (session.status !== 'active') {
      return {
        op: 'complete_crafting',
        status: 'error',
        issues: [`Crafting session ${sessionId} is not active`]
      };
    }

    const recipe = this.recipes.get(session.recipeId);
    if (!recipe) {
      return {
        op: 'complete_crafting',
        status: 'error',
        issues: [`Recipe ${session.recipeId} not found`]
      };
    }

    // Calculate final quality and success
    const finalQuality = this.calculateFinalQuality(session, recipe);
    const success = this.calculateSuccess(session, recipe, finalQuality);
    const experience = this.calculateExperience(session, recipe, success);

    // Update inventory
    const remaining: Inventory = { ...inventory };
    const crafted: Record<string, number> = {};

    if (success) {
      // Remove materials
      for (const [material, required] of Object.entries(recipe.inputs)) {
        remaining[material] = (remaining[material] || 0) - required;
      }

      // Add outputs
      for (const [item, quantity] of Object.entries(recipe.outputs)) {
        crafted[item] = quantity;
        remaining[item] = (remaining[item] || 0) + quantity;
      }
    }

    // Create craft result
    const result: CraftResult = {
      crafted,
      remaining,
      statMods: recipe.statMods,
      quality: finalQuality,
      experience,
      success,
      sessionId,
      craftingTime: new Date() - session.startTime,
      metadata: {
        recipeId: session.recipeId,
        crafterId: session.crafterId,
        difficulty: recipe.difficulty
      }
    };

    // Update session
    session.status = success ? 'completed' : 'failed';
    session.endTime = Date.now();
    session.quality = finalQuality;
    session.experience = experience;

    // Record in history
    this.craftingHistory.push(result);

    return {
      op: 'complete_crafting',
      status: 'ok',
      result
    };
  }

  /**
   * Cancel a crafting session
   */
  cancelCrafting(sessionId: string): CraftingOutput {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        op: 'cancel_crafting',
        status: 'error',
        issues: [`Crafting session ${sessionId} not found`]
      };
    }

    session.status = 'cancelled';
    session.endTime = Date.now();

    return {
      op: 'cancel_crafting',
      status: 'ok',
      result: session
    };
  }

  /**
   * Get crafting session
   */
  getSession(sessionId: string): CraftingOutput {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        op: 'get_session',
        status: 'error',
        issues: [`Crafting session ${sessionId} not found`]
      };
    }

    return {
      op: 'get_session',
      status: 'ok',
      result: session
    };
  }

  /**
   * Get crafting statistics
   */
  getCraftingStats(): CraftingOutput {
    const recipes = Array.from(this.recipes.values());
    const sessions = Array.from(this.sessions.values());
    const completedSessions = sessions.filter((s: any) => s.status === 'completed');
    const failedSessions = sessions.filter((s: any) => s.status === 'failed');

    const stats: CraftingStats = {
      totalRecipes: recipes.length,
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      failedSessions: failedSessions.length,
      averageQuality: 0,
      totalExperience: 0,
      recipesByCategory: {},
      difficultyDistribution: {}
    };

    if (completedSessions.length > 0) {
      stats.averageQuality = completedSessions.reduce((sum, s) => sum + s.quality, 0) / completedSessions.length;
      stats.totalExperience = completedSessions.reduce((sum, s) => sum + s.experience, 0);
    }

    // Calculate category distribution
    recipes.forEach((recipe: any) => {
      stats.recipesByCategory[recipe.category] = (stats.recipesByCategory[recipe.category] || 0) + 1;
      stats.difficultyDistribution[recipe.difficulty] = (stats.difficultyDistribution[recipe.difficulty] || 0) + 1;
    });

    return {
      op: 'stats',
      status: 'ok',
      result: stats
    };
  }

  /**
   * Export crafting data
   */
  exportCrafting(format: 'json' | 'manifest' | 'summary' | 'sessions' = 'json'): CraftingOutput {
    const recipes = Array.from(this.recipes.values());
    const sessions = Array.from(this.sessions.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: recipes
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: recipes
        };
      
      case 'summary':
        const stats = this.getCraftingStats();
        return {
          op: 'export',
          status: 'ok',
          result: stats.result
        };
      
      case 'sessions':
        return {
          op: 'export',
          status: 'ok',
          result: sessions[0!] // Return first session or undefined
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
   * Reset all crafting data
   */
  resetCrafting(): CraftingOutput {
    this.recipes.clear();
    this.sessions.clear();
    this.craftingHistory = [];
    this.initializeDefaultRecipes();
    return {
      op: 'reset',
      status: 'ok',
      result: undefined
    };
  }

  /**
   * Private helper methods
   */
  private validateRecipe(recipe: Recipe): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!recipe.id || recipe.id.trim() === '') {
      errors.push('Recipe ID is required');
    }

    if (!recipe.name || recipe.name.trim() === '') {
      errors.push('Recipe name is required');
    }

    if (!recipe.inputs || Object.keys(recipe.inputs).length === 0) {
      errors.push('Recipe must have at least one input material');
    }

    if (!recipe.outputs || Object.keys(recipe.outputs).length === 0) {
      errors.push('Recipe must have at least one output item');
    }

    if (recipe.craftingTime <= 0) {
      errors.push('Crafting time must be positive');
    }

    if (!['easy', 'medium', 'hard', 'expert', 'master'].includes(recipe.difficulty)) {
      errors.push('Invalid difficulty level');
    }

    return { valid: errors.length === 0, errors };
  }

  private calculateBaseQuality(recipe: Recipe): number {
    const qualityMap = {
      'poor': 20,
      'normal': 50,
      'good': 70,
      'excellent': 85,
      'perfect': 100
    };
    return qualityMap[recipe.quality] || 50;
  }

  private calculateFinalQuality(session: CraftingSession, recipe: Recipe): number {
    const baseQuality = session.quality;
    const difficultyModifier = this.getDifficultyModifier(recipe.difficulty);
    const randomFactor = Math.random() * 20 - 10; // -10 to +10
    
    return Math.max(0, Math.min(100, baseQuality + difficultyModifier + randomFactor));
  }

  private getDifficultyModifier(difficulty: string): number {
    const modifiers = {
      'easy': 10,
      'medium': 0,
      'hard': -10,
      'expert': -20,
      'master': -30
    };
    return modifiers[difficulty as keyof typeof modifiers] || 0;
  }

  private calculateSuccess(session: CraftingSession, recipe: Recipe, quality: number): boolean {
    const baseSuccessRate = 0.8;
    const qualityBonus = (quality - 50) / 100;
    const difficultyPenalty = this.getDifficultyModifier(recipe.difficulty) / 100;
    
    const successRate = Math.max(0.1, Math.min(0.95, baseSuccessRate + qualityBonus + difficultyPenalty));
    return Math.random() < successRate;
  }

  private calculateExperience(session: CraftingSession, recipe: Recipe, success: boolean): number {
    const baseExp = 10;
    const difficultyMultiplier = this.getDifficultyMultiplier(recipe.difficulty);
    const qualityBonus = Math.floor((session.quality - 50) / 10);
    const successBonus = success ? 5: 0.5;
    
    return Math.floor((baseExp + qualityBonus) * difficultyMultiplier * successBonus);
  }

  private getDifficultyMultiplier(difficulty: string): number {
    const multipliers = {
      'easy': 1.0,
      'medium': 1.5,
      'hard': 2.0,
      'expert': 2.5,
      'master': 3.0
    };
    return multipliers[difficulty as keyof typeof multipliers] || 1.0;
  }
}