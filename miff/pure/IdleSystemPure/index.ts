/**
 * IdleSystemPure - AAA Quality Idle Game System
 *
 * Advanced idle game mechanics with:
 * - AFK resource generation and accumulation
 * - Upgrade systems with exponential scaling
 * - Prestige mechanics with permanent bonuses
 * - Achievement systems with rewards
 * - Mobile-optimized performance
 * - Integration with other MIFF modules
 * - Remix-safe deterministic behavior
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';

// ============================================================================
// IDLE SYSTEM TYPES & INTERFACES
// ============================================================================

/**
 * Resource types in the idle system
 */
export type ResourceType = 'currency' | 'experience' | 'materials' | 'energy' | 'knowledge' | 'reputation';

/**
 * Generator types for resource production
 */
export type GeneratorType = 'basic' | 'advanced' | 'premium' | 'legendary' | 'mythic';

/**
 * Upgrade categories
 */
export type UpgradeCategory = 'generator' | 'multiplier' | 'automation' | 'prestige' | 'special' | 'efficiency';

/**
 * Prestige tiers
 */
export type PrestigeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';

/**
 * Achievement types
 */
export type AchievementType = 'production' | 'upgrades' | 'time' | 'efficiency' | 'special';

/**
 * Resource definition
 */
export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  baseValue: number;
  currentAmount: number;
  maxAmount?: number;
  generationRate: number;     // Per second
  displayFormat: 'number' | 'scientific' | 'currency' | 'percentage';
  icon?: string;
  color?: string;
  unlocked: boolean;
  metadata?: Record<string, any>;
}

/**
 * Generator definition
 */
export interface Generator {
  id: string;
  name: string;
  description: string;
  type: GeneratorType;
  baseCost: number;
  currentCost: number;
  costMultiplier: number;      // Cost increases by this factor each purchase
  owned: number;
  baseProduction: number;     // Base production per second
  productionMultiplier: number; // Applied to base production
  unlocked: boolean;
  maxOwned?: number;
  autoBuyEnabled: boolean;
  producesResource: string;   // Resource ID this generator produces
  consumesResource?: string;  // Resource ID this generator consumes
  efficiency: number;         // 0-1 (affects production efficiency)
  metadata?: Record<string, any>;
}

/**
 * Upgrade definition
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  cost: number;
  costResource: string;       // Resource ID for cost
  requirements?: string[];    // Required upgrades or conditions
  effects: UpgradeEffect[];
  maxLevel: number;
  currentLevel: number;
  unlocked: boolean;
  permanent: boolean;         // Survives prestige
  metadata?: Record<string, any>;
}

/**
 * Upgrade effect on game mechanics
 */
export interface UpgradeEffect {
  type: 'multiplier' | 'unlock' | 'automation' | 'efficiency' | 'special';
  target: string;             // Target ID (generator, resource, etc.)
  value: number;              // Effect value
  operation: 'multiply' | 'add' | 'set' | 'unlock';
  condition?: string;         // Optional condition for effect
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  metadata?: Record<string, any>;
}

/**
 * Achievement requirement
 */
export interface AchievementRequirement {
  type: 'amount' | 'time' | 'count' | 'rate';
  target: string;             // Target ID or property
  value: number;
  condition?: string;         // Additional condition
}

/**
 * Achievement reward
 */
export interface AchievementReward {
  type: 'resource' | 'multiplier' | 'unlock' | 'special';
  target: string;
  value: number;
  permanent: boolean;
}

/**
 * Prestige configuration
 */
export interface PrestigeConfig {
  tier: PrestigeTier;
  requirement: number;        // Required currency for prestige
  multiplier: number;         // Prestige bonus multiplier
  description: string;
  unlocked: boolean;
  completed: boolean;
  completionTime?: number;
}

/**
 * Idle system configuration
 */
export interface IdleSystemConfig {
  enableOfflineProgress: boolean;
  offlineProgressMultiplier: number;
  saveInterval: number;       // Seconds between auto-saves
  maxIdleTime: number;        // Max idle time for offline progress (seconds)
  enableAchievements: boolean;
  enablePrestige: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  debugMode: boolean;
}

/**
 * Integration hooks for other systems
 */
export interface IdleIntegration {
  onResourceChange?: (resourceId: string, oldAmount: number, newAmount: number) => void;
  onGeneratorPurchase?: (generatorId: string, amount: number) => void;
  onUpgradePurchase?: (upgradeId: string, level: number) => void;
  onAchievementUnlock?: (achievementId: string) => void;
  onPrestige?: (tier: PrestigeTier, bonus: number) => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => any;
  getWorldState?: () => any;
}

// ============================================================================
// IDLE SYSTEM IMPLEMENTATION
// ============================================================================

/**
 * Main IdleSystemPure class
 * Provides AAA-quality idle game mechanics with full integration support
 */
export class IdleSystemPure {
  private eventBus: EventBus;
  private config: IdleSystemConfig;
  private integrations: IdleIntegration = {};

  // Core game state
  private resources: Map<string, Resource> = new Map();
  private generators: Map<string, Generator> = new Map();
  private upgrades: Map<string, Upgrade> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private prestigeConfigs: Map<string, PrestigeConfig> = new Map();

  // Game mechanics state
  private lastUpdateTime: number = Date.now();
  private totalPlayTime: number = 0;
  private totalIdleTime: number = 0;
  private prestigeCount: number = 0;
  private isPaused: boolean = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'high';

  // Production tracking
  private productionMultipliers: Map<string, number> = new Map();
  private efficiencyMultipliers: Map<string, number> = new Map();
  private lastProductionUpdate: number = Date.now();
  private productionCache: Map<string, number> = new Map();

  // Save/load state
  private saveData: any = {};
  private autoSaveInterval: number | null = null;

  constructor(eventBus: EventBus, config: IdleSystemConfig = {
    enableOfflineProgress: true,
    offlineProgressMultiplier: 1.0,
    saveInterval: 60, // Auto-save every 60 seconds
    maxIdleTime: 86400, // 24 hours max offline progress
    enableAchievements: true,
    enablePrestige: true,
    performanceMode: 'high',
    debugMode: false
  }) {
    this.eventBus = eventBus;
    this.config = config;

    this.initializeSystem();
    this.startUpdateLoop();
    this.startAutoSave();
  }

  /**
   * Initialize the idle system with default resources and generators
   */
  private initializeSystem(): void {
    this.initializeResources();
    this.initializeGenerators();
    this.initializeUpgrades();
    this.initializeAchievements();
    this.initializePrestige();

    this.setupEventListeners();

    // Emit initialization event
    this.eventBus.emit('idle:system_initialized', {
      config: this.config,
      resources: this.resources.size,
      generators: this.generators.size,
      upgrades: this.upgrades.size,
      achievements: this.achievements.size,
      timestamp: new Date()
    });
  }

  /**
   * Initialize default resources
   */
  private initializeResources(): void {
    const resources: Resource[] = [
      {
        id: 'currency',
        name: 'Coins',
        description: 'Basic currency for purchasing generators',
        type: 'currency',
        baseValue: 1,
        currentAmount: 0,
        generationRate: 0,
        displayFormat: 'number',
        color: '#FFD700',
        unlocked: true
      },
      {
        id: 'experience',
        name: 'Experience',
        description: 'Experience points for leveling up',
        type: 'experience',
        baseValue: 1,
        currentAmount: 0,
        generationRate: 0,
        displayFormat: 'number',
        color: '#4A90E2',
        unlocked: true
      },
      {
        id: 'energy',
        name: 'Energy',
        description: 'Energy for special abilities and boosts',
        type: 'energy',
        baseValue: 1,
        currentAmount: 100,
        maxAmount: 100,
        generationRate: 1, // Regenerates 1 per second
        displayFormat: 'number',
        color: '#FF6B35',
        unlocked: true
      }
    ];

    resources.forEach((resource: any) => {
      this.resources.set(resource.id, resource);
    });
  }

  /**
   * Initialize default generators
   */
  private initializeGenerators(): void {
    const generators: Generator[] = [
      {
        id: 'clicker',
        name: 'Manual Clicker',
        description: 'Click to generate coins manually',
        type: 'basic',
        baseCost: 0,
        currentCost: 0,
        costMultiplier: 1,
        owned: 0,
        baseProduction: 1,
        productionMultiplier: 1,
        unlocked: true,
        producesResource: 'currency',
        efficiency: 1.0,
        autoBuyEnabled: false
      },
      {
        id: 'auto_clicker',
        name: 'Auto Clicker',
        description: 'Automatically generates coins over time',
        type: 'basic',
        baseCost: 15,
        currentCost: 15,
        costMultiplier: 1.15,
        owned: 0,
        baseProduction: 0.1,
        productionMultiplier: 1,
        unlocked: false,
        producesResource: 'currency',
        efficiency: 1.0,
        autoBuyEnabled: true
      },
      {
        id: 'farm',
        name: 'Coin Farm',
        description: 'Generates coins passively',
        type: 'advanced',
        baseCost: 100,
        currentCost: 100,
        costMultiplier: 1.15,
        owned: 0,
        baseProduction: 1,
        productionMultiplier: 1,
        unlocked: false,
        producesResource: 'currency',
        efficiency: 0.8,
        autoBuyEnabled: true
      },
      {
        id: 'mine',
        name: 'Coin Mine',
        description: 'High-efficiency coin generation',
        type: 'premium',
        baseCost: 1000,
        currentCost: 1000,
        costMultiplier: 1.15,
        owned: 0,
        baseProduction: 8,
        productionMultiplier: 1,
        unlocked: false,
        producesResource: 'currency',
        efficiency: 0.9,
        autoBuyEnabled: true
      }
    ];

    generators.forEach((generator: any) => {
      this.generators.set(generator.id, generator);
    });
  }

  /**
   * Initialize default upgrades
   */
  private initializeUpgrades(): void {
    const upgrades: Upgrade[] = [
      {
        id: 'click_power',
        name: 'Click Power',
        description: 'Increases manual clicking efficiency',
        category: 'multiplier',
        cost: 100,
        costResource: 'currency',
        maxLevel: 10,
        currentLevel: 0,
        unlocked: true,
        permanent: true,
        effects: [
          {
            type: 'multiplier',
            target: 'clicker',
            value: 2,
            operation: 'multiply'
          }
        ]
      },
      {
        id: 'auto_efficiency',
        name: 'Auto Efficiency',
        description: 'Improves auto-clicker production',
        category: 'efficiency',
        cost: 500,
        costResource: 'currency',
        maxLevel: 5,
        currentLevel: 0,
        unlocked: false,
        permanent: true,
        effects: [
          {
            type: 'efficiency',
            target: 'auto_clicker',
            value: 0.2,
            operation: 'add'
          }
        ]
      },
      {
        id: 'farm_multiplier',
        name: 'Farm Multiplier',
        description: 'Increases farm production',
        category: 'multiplier',
        cost: 1000,
        costResource: 'currency',
        maxLevel: 10,
        currentLevel: 0,
        unlocked: false,
        permanent: true,
        effects: [
          {
            type: 'multiplier',
            target: 'farm',
            value: 2,
            operation: 'multiply'
          }
        ]
      }
    ];

    upgrades.forEach((upgrade: any) => {
      this.upgrades.set(upgrade.id, upgrade);
    });
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first_click',
        name: 'First Click',
        description: 'Make your first manual click',
        type: 'production',
        requirement: {
          type: 'amount',
          target: 'currency',
          value: 1
        },
        reward: {
          type: 'resource',
          target: 'experience',
          value: 10,
          permanent: true
        },
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'hundred_clicks',
        name: 'Click Master',
        description: 'Click 100 times manually',
        type: 'production',
        requirement: {
          type: 'count',
          target: 'clicks',
          value: 100
        },
        reward: {
          type: 'multiplier',
          target: 'click_power',
          value: 1.5,
          permanent: true
        },
        unlocked: false,
        progress: 0,
        maxProgress: 100
      }
    ];

    achievements.forEach((achievement: any) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Initialize prestige system
   */
  private initializePrestige(): void {
    const prestigeConfigs: PrestigeConfig[] = [
      {
        tier: 'bronze',
        requirement: 1000,
        multiplier: 2,
        description: 'First prestige tier',
        unlocked: true,
        completed: false
      },
      {
        tier: 'silver',
        requirement: 10000,
        multiplier: 3,
        description: 'Second prestige tier',
        unlocked: false,
        completed: false
      },
      {
        tier: 'gold',
        requirement: 100000,
        multiplier: 5,
        description: 'Third prestige tier',
        unlocked: false,
        completed: false
      }
    ];

    prestigeConfigs.forEach((config: any) => {
      this.prestigeConfigs.set(config.tier, config);
    });
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for integration events
    if (this.integrations.onResourceChange) {
      this.eventBus.subscribe('idle:resource_change', (event: any) => {
        const data = event.data || event;
        this.integrations.onResourceChange!(data.resourceId, oldAmount: data.oldAmount, data.newAmount);
      });
    }

    if (this.integrations.onGeneratorPurchase) {
      this.eventBus.subscribe('idle:generator_purchase', (event: any) => {
        const data = event.data || event;
        this.integrations.onGeneratorPurchase!(data.generatorId, data.amount);
      });
    }

    if (this.integrations.onUpgradePurchase) {
      this.eventBus.subscribe('idle:upgrade_purchase', (event: any) => {
        const data = event.data || event;
        this.integrations.onUpgradePurchase!(data.upgradeId, data.level);
      });
    }

    if (this.integrations.onAchievementUnlock) {
      this.eventBus.subscribe('idle:achievement_unlock', (event: any) => {
        const data = event.data || event;
        this.integrations.onAchievementUnlock!(data.achievementId);
      });
    }
  }

  /**
   * Start the main update loop
   */
  private startUpdateLoop(): void {
    setInterval(() => {
      if (!this.isPaused) {
        this.updateProduction();
        this.updateAchievements();
        this.checkPrestige();
      }
    }, 1000); // Update every second
  }

  /**
   * Start auto-save system
   */
  private startAutoSave(): void {
    if (this.config.saveInterval > 0) {
      this.autoSaveInterval = setInterval(() => {
        this.saveGame();
      }, this.config.saveInterval * 1000) as any;
    }
  }

  /**
   * Update resource production
   */
  private updateProduction(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastProductionUpdate) / 1000;
    this.lastProductionUpdate = now;

    if (deltaTime <= 0) return;

    // Calculate offline progress if enabled
    if (this.config.enableOfflineProgress) {
      this.processOfflineProgress();
    }

    // Update each generator
    this.generators.forEach((generator, generatorId) => {
      if (!generator.unlocked || generator.owned === 0) return;

      const resource = this.resources.get(generator.producesResource);
      if (!resource) return;

      // Calculate production
      const baseProduction = generator.baseProduction * generator.owned;
      const multiplier = this.getTotalMultiplier(generatorId);
      const efficiency = this.getTotalEfficiency(generatorId);
      const actualProduction = baseProduction * multiplier * efficiency * deltaTime;

      // Add production to resource
      const newAmount = resource.currentAmount + actualProduction;

      // Check resource limits
      const cappedAmount = resource.maxAmount ? Math.min(newAmount, resource.maxAmount) : newAmount;

      if (cappedAmount !== resource.currentAmount) {
        this.updateResource(generator.producesResource, cappedAmount);

        // Emit resource change event
        this.eventBus.emit('idle:resource_change', {
          resourceId: generator.producesResource,
          oldAmount: resource.currentAmount,
          newAmount: cappedAmount,
          timestamp: now
        });
      }
    });

    // Update resource regeneration
    this.resources.forEach((resource, resourceId) => {
      if (resource.generationRate > 0) {
        const regeneration = resource.generationRate * deltaTime;
        const newAmount = Math.min(
          resource.currentAmount + regeneration,
          resource.maxAmount || Infinity
        );

        if (newAmount !== resource.currentAmount) {
          this.updateResource(resourceId, newAmount);
        }
      }
    });
  }

  /**
   * Process offline progress
   */
  private processOfflineProgress(): void {
    const now = Date.now();
    const lastSaveTime = this.saveData.lastSaveTime || now;
    const offlineTime = Math.min(
      (now - lastSaveTime) / 1000,
      this.config.maxIdleTime
    );

    if (offlineTime > 60) { // Only process if offline for more than 1 minute
      const totalOfflineProduction = this.calculateTotalProduction() * offlineTime * this.config.offlineProgressMultiplier;

      const currencyResource = this.resources.get('currency');
      if (currencyResource) {
        this.updateResource('currency', currencyResource.currentAmount + totalOfflineProduction);

        this.eventBus.emit('idle:offline_progress', {
          offlineTime: offlineTime,
          production: totalOfflineProduction,
          timestamp: now
        });
      }

      this.totalIdleTime += offlineTime;
    }
  }

  /**
   * Calculate total production rate
   */
  private calculateTotalProduction(): number {
    let totalProduction = 0;

    this.generators.forEach((generator, generatorId) => {
      if (!generator.unlocked || generator.owned === 0) return;

      const baseProduction = generator.baseProduction * generator.owned;
      const multiplier = this.getTotalMultiplier(generatorId);
      const efficiency = this.getTotalEfficiency(generatorId);
      totalProduction += baseProduction * multiplier * efficiency;
    });

    return totalProduction;
  }

  /**
   * Get total multiplier for a generator
   */
  private getTotalMultiplier(generatorId: string): number {
    let multiplier = 1.0;

    // Base production multiplier
    const generator = this.generators.get(generatorId);
    if (generator) {
      multiplier *= generator.productionMultiplier;
    }

    // Global multipliers
    this.productionMultipliers.forEach((value, key) => {
      if (key === 'all' || key === generatorId) {
        multiplier *= value;
      }
    });

    // Upgrade effects
    this.upgrades.forEach((upgrade: any) => {
      if (upgrade.currentLevel > 0) {
        upgrade.effects.forEach((effect: any) => {
          if (effect.target === generatorId && effect.type === 'multiplier') {
            multiplier *= Math.pow(effect.value, upgrade.currentLevel);
          }
        });
      }
    });

    return multiplier;
  }

  /**
   * Get total efficiency for a generator
   */
  private getTotalEfficiency(generatorId: string): number {
    let efficiency = 1.0;

    const generator = this.generators.get(generatorId);
    if (generator) {
      efficiency *= generator.efficiency;
    }

    // Efficiency multipliers
    this.efficiencyMultipliers.forEach((value, key) => {
      if (key === 'all' || key === generatorId) {
        efficiency *= value;
      }
    });

    // Upgrade effects
    this.upgrades.forEach((upgrade: any) => {
      if (upgrade.currentLevel > 0) {
        upgrade.effects.forEach((effect: any) => {
          if (effect.target === generatorId && effect.type === 'efficiency') {
            efficiency += effect.value * upgrade.currentLevel;
          }
        });
      }
    });

    return Math.max(0, Math.min(1, efficiency));
  }

  /**
   * Update resource amount
   */
  private updateResource(resourceId: string, newAmount: number): void {
    const resource = this.resources.get(resourceId);
    if (!resource) return;

    const oldAmount = resource.currentAmount;
    resource.currentAmount = newAmount;

    this.eventBus.emit('idle:resource_change', {
      resourceId: resourceId,
      oldAmount: oldAmount,
      newAmount: newAmount,
      timestamp: new Date()
    });
  }

  /**
   * Update achievements
   */
  private updateAchievements(): void {
    if (!this.config.enableAchievements) return;

    this.achievements.forEach((achievement, achievementId) => {
      if (achievement.unlocked) return;

      this.updateAchievementProgress(achievement);

      if (achievement.progress >= achievement.maxProgress) {
        this.unlockAchievement(achievementId);
      }
    });
  }

  /**
   * Update achievement progress
   */
  private updateAchievementProgress(achievement: Achievement): void {
    const requirement = achievement.requirement;

    switch (requirement.type) {
      case 'amount':
        if (requirement.target in this.resources) {
          const resource = this.resources.get(requirement.target)!;
          achievement.progress = Math.min(achievement.maxProgress, resource.currentAmount);
        }
        break;

      case 'time':
        achievement.progress = Math.min(achievement.maxProgress, this.totalPlayTime);
        break;

      case 'count':
        // Handle click counts, purchases, etc.
        achievement.progress = Math.min(achievement.maxProgress, achievement.progress + 1);
        break;

      case 'rate':
        // Handle production rates
        const production = this.calculateTotalProduction();
        achievement.progress = Math.min(achievement.maxProgress, production);
        break;
    }
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    achievement.unlocked = true;

    // Apply reward
    this.applyAchievementReward(achievement);

    this.eventBus.emit('idle:achievement_unlock', {
      achievementId: achievementId,
      achievement: achievement,
      timestamp: new Date()
    });
  }

  /**
   * Apply achievement reward
   */
  private applyAchievementReward(achievement: Achievement): void {
    const reward = achievement.reward;

    switch (reward.type) {
      case 'resource':
        const resource = this.resources.get(reward.target);
        if (resource) {
          this.updateResource(reward.target, resource.currentAmount + reward.value);
        }
        break;

      case 'multiplier':
        this.productionMultipliers.set(reward.target, (this.productionMultipliers.get(reward.target) || 1) * reward.value);
        break;

      case 'unlock':
        // Unlock generators, upgrades, etc.
        if (reward.target.startsWith('generator:')) {
          const generatorId = reward.target.replace('generator:', '');
          const generator = this.generators.get(generatorId);
          if (generator) {
            generator.unlocked = true;
          }
        }
        break;
    }
  }

  /**
   * Check prestige opportunities
   */
  private checkPrestige(): void {
    if (!this.config.enablePrestige) return;

    const currencyResource = this.resources.get('currency');
    if (!currencyResource) return;

    this.prestigeConfigs.forEach((config, tier) => {
      if (!config.unlocked! || config.completed) return;

      if (currencyResource.currentAmount >= config.requirement) {
        this.performPrestige(tier as PrestigeTier);
      }
    });
  }

  /**
   * Perform prestige
   */
  private performPrestige(tier: PrestigeTier): void {
    const config = this.prestigeConfigs.get(tier);
    if (!config) return;

    const currencyResource = this.resources.get('currency');
    if (!currencyResource) return;

    // Reset resources and generators (keep permanent upgrades)
    this.resetGameState();

    // Apply prestige bonus
    this.productionMultipliers.set('all', (this.productionMultipliers.get('all') || 1) * config.multiplier);

    // Mark prestige as completed
    config.completed = true;
    config.completionTime = Date.now();
    this.prestigeCount++;

    this.eventBus.emit('idle:prestige', {
      tier: tier,
      bonus: config.multiplier,
      totalPrestige: this.prestigeCount,
      timestamp: new Date()
    });

    // Unlock next prestige tier
    this.unlockNextPrestigeTier(tier);
  }

  /**
   * Reset game state for prestige
   */
  private resetGameState(): void {
    // Reset resources (keep permanent bonuses)
    this.resources.forEach((resource, resourceId) => {
      if (resource.type !== 'experience') { // Keep experience
        resource.currentAmount = resource.baseValue;
      }
    });

    // Reset generators
    this.generators.forEach((generator, generatorId) => {
      generator.owned = 0;
      generator.currentCost = generator.baseCost;
      generator.unlocked = generatorId === 'clicker'; // Keep clicker unlocked
    });

    // Keep permanent upgrades
    this.upgrades.forEach((upgrade: any) => {
      if (!upgrade.permanent) {
        upgrade.currentLevel = 0;
      }
    });
  }

  /**
   * Unlock next prestige tier
   */
  private unlockNextPrestigeTier(currentTier: PrestigeTier): void {
    const tiers: PrestigeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1];
      const nextConfig = this.prestigeConfigs.get(nextTier);
      if (nextConfig) {
        nextConfig.unlocked = true;
      }
    }
  }

  /**
   * Save game state
   */
  private saveGame(): void {
    this.saveData = {
      resources: Array.from(this.resources.entries()),
      generators: Array.from(this.generators.entries()),
      upgrades: Array.from(this.upgrades.entries()),
      achievements: Array.from(this.achievements.entries()),
      prestigeConfigs: Array.from(this.prestigeConfigs.entries()),
      totalPlayTime: this.totalPlayTime,
      totalIdleTime: this.totalIdleTime,
      prestigeCount: this.prestigeCount,
      lastSaveTime: new Date()
    };

    this.eventBus.emit('idle:game_saved', {
      timestamp: new Date(),
      resources: this.resources.size,
      generators: this.generators.size
    });
  }

  /**
   * Load game state
   */
  private loadGame(): void {
    if (this.saveData.resources) {
      this.resources = new Map(this.saveData.resources);
    }
    if (this.saveData.generators) {
      this.generators = new Map(this.saveData.generators);
    }
    if (this.saveData.upgrades) {
      this.upgrades = new Map(this.saveData.upgrades);
    }
    if (this.saveData.achievements) {
      this.achievements = new Map(this.saveData.achievements);
    }
    if (this.saveData.prestigeConfigs) {
      this.prestigeConfigs = new Map(this.saveData.prestigeConfigs);
    }

    this.totalPlayTime = this.saveData.totalPlayTime || 0;
    this.totalIdleTime = this.saveData.totalIdleTime || 0;
    this.prestigeCount = this.saveData.prestigeCount || 0;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get current resource amounts
   */
  public getResources(): Map<string, Resource> {
    return new Map(this.resources);
  }

  /**
   * Get specific resource
   */
  public getResource(resourceId: string): Resource | null {
    return this.resources.get(resourceId) || null;
  }

  /**
   * Get generators
   */
  public getGenerators(): Map<string, Generator> {
    return new Map(this.generators);
  }

  /**
   * Get specific generator
   */
  public getGenerator(generatorId: string): Generator | null {
    return this.generators.get(generatorId) || null;
  }

  /**
   * Purchase generator
   */
  public purchaseGenerator(generatorId: string, amount: number = 1): boolean {
    const generator = this.generators.get(generatorId);
    if (!generator || !generator.unlocked) return false;

    const totalCost = this.calculateGeneratorCost(generator, amount);
    const currencyResource = this.resources.get('currency');

    if (!currencyResource || currencyResource.currentAmount < totalCost) {
      return false;
    }

    // Deduct cost
    this.updateResource('currency', currencyResource.currentAmount - totalCost);

    // Add generators
    generator.owned += amount;
    generator.currentCost = this.calculateGeneratorCost(generator, 1); // Cost for next purchase

    // Apply upgrade effects
    this.applyUpgradeEffects();

    this.eventBus.emit('idle:generator_purchase', {
      generatorId: generatorId,
      amount: amount,
      newOwned: generator.owned,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Calculate generator cost
   */
  private calculateGeneratorCost(generator: Generator, amount: number): number {
    let totalCost = 0;

    for (let i = 0; i < amount; i++) {
      totalCost += generator.currentCost;
      generator.currentCost *= generator.costMultiplier;
    }

    // Reset cost for next calculation
    generator.currentCost = generator.baseCost * Math.pow(generator.costMultiplier, generator.owned);

    return totalCost;
  }

  /**
   * Purchase upgrade
   */
  public purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade || !upgrade.unlocked || upgrade.currentLevel >= upgrade.maxLevel) return false;

    const cost = upgrade.cost * Math.pow(2, upgrade.currentLevel); // Exponential cost scaling
    const costResource = this.resources.get(upgrade.costResource);

    if (!costResource || costResource.currentAmount < cost) {
      return false;
    }

    // Deduct cost
    this.updateResource(upgrade.costResource, costResource.currentAmount - cost);

    // Apply upgrade
    upgrade.currentLevel++;
    this.applyUpgradeEffects();

    this.eventBus.emit('idle:upgrade_purchase', {
      upgradeId: upgradeId,
      level: upgrade.currentLevel,
      timestamp: new Date()
    });

    return true;
  }

  /**
   * Apply upgrade effects
   */
  private applyUpgradeEffects(): void {
    // Reset multipliers
    this.productionMultipliers.clear();
    this.efficiencyMultipliers.clear();

    // Reapply all upgrade effects
    this.upgrades.forEach((upgrade: any) => {
      if (upgrade.currentLevel > 0) {
        upgrade.effects.forEach((effect: any) => {
          switch (effect.type) {
            case 'multiplier':
              const current = this.productionMultipliers.get(effect.target) || 1;
              this.productionMultipliers.set(effect.target, current * Math.pow(effect.value, upgrade.currentLevel));
              break;

            case 'efficiency':
              const currentEff = this.efficiencyMultipliers.get(effect.target) || 1;
              this.efficiencyMultipliers.set(effect.target, currentEff + (effect.value * upgrade.currentLevel));
              break;
          }
        });
      }
    });
  }

  /**
   * Get total production rate
   */
  public getTotalProduction(): number {
    return this.calculateTotalProduction();
  }

  /**
   * Get achievements
   */
  public getAchievements(): Map<string, Achievement> {
    return new Map(this.achievements);
  }

  /**
   * Get prestige configs
   */
  public getPrestigeConfigs(): Map<string, PrestigeConfig> {
    return new Map(this.prestigeConfigs);
  }

  /**
   * Set integrations
   */
  public setIntegrations(integrations: IdleIntegration): void {
    this.integrations = { ...this.integrations, ...integrations };
  }

  /**
   * Set paused state
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;

    this.eventBus.emit('idle:paused', {
      paused: paused,
      timestamp: new Date()
    });
  }

  /**
   * Get system statistics
   */
  public getStats(): {
    totalResources: number;
    totalGenerators: number;
    totalUpgrades: number;
    totalAchievements: number;
    totalPrestige: number;
    totalPlayTime: number;
    totalIdleTime: number;
    currentProduction: number;
    unlockedAchievements: number;
  } {
    return {
      totalResources: this.resources.size,
      totalGenerators: this.generators.size,
      totalUpgrades: this.upgrades.size,
      totalAchievements: this.achievements.size,
      totalPrestige: this.prestigeCount,
      totalPlayTime: this.totalPlayTime,
      totalIdleTime: this.totalIdleTime,
      currentProduction: this.getTotalProduction(),
      unlockedAchievements: Array.from(this.achievements.values()).filter((a: any) => a.unlocked).length
    };
  }

  /**
   * Save game state
   */
  public saveGameData(): void {
    this.saveGame();
  }

  /**
   * Load game state
   */
  public loadGameData(): void {
    this.loadGame();
  }

  /**
   * Reset entire game
   */
  public resetGame(): void {
    this.resources.clear();
    this.generators.clear();
    this.upgrades.clear();
    this.achievements.clear();
    this.prestigeConfigs.clear();
    this.productionMultipliers.clear();
    this.efficiencyMultipliers.clear();
    this.saveData = {};
    this.totalPlayTime = 0;
    this.totalIdleTime = 0;
    this.prestigeCount = 0;

    this.initializeSystem();
  }

  /**
   * Get game state for debugging
   */
  public getGameState(): any {
    return {
      resources: Array.from(this.resources.entries()),
      generators: Array.from(this.generators.entries()),
      upgrades: Array.from(this.upgrades.entries()),
      achievements: Array.from(this.achievements.entries()),
      stats: this.getStats(),
      config: this.config
    };
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Types already exported above with their definitions
// No need for duplicate export type { } block

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default IdleSystemPure;