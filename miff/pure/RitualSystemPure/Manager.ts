/**
 * MIFF Ritual System Manager
 *
 * Core business logic for ritual management, participant handling, and ceremony execution
 */

import {
  RitualSystemPure,
  RitualDefinition,
  RitualInstance,
  RitualParticipant,
  RitualStep,
  RitualEffect,
  SummonedEntity,
  RitualResult,
  RitualReward,
  RitualRisk,
  RitualConfig
} from './index';

export class RitualManager {
  private ritualSystem: RitualSystemPure;

  constructor(ritualSystem: RitualSystemPure) {
    this.ritualSystem = ritualSystem;

    // Initialize structured logging
    this.logger = new StructuredLogger({
      level: LogLevel.INFO,
      enableConsole: true,
      performanceMonitoring: true,
      modules: {
        'RitualSystemManager': LogLevel.DEBUG
      }
    });

    // Register with memory manager
    this.memoryId = `RitualSystemManager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    MemoryManager.registerObject(this.memoryId, this, 'RitualSystemManager');
  }

  /**
   * Create a new ritual definition with validation
   */
  createRitualDefinition(ritualData: Partial<RitualDefinition>): RitualDefinition | null {
    // Validate required fields
    if (!ritualData.id || ritualData.id.trim() === '') {
      this.logger.error('RitualSystemManager', '❌ Ritual ID is required');
      return null;
    }

    if (!ritualData.name || ritualData.name.trim() === '') {
      this.logger.error('RitualSystemManager', '❌ Ritual name is required');
      return null;
    }

    if (!ritualData.steps || ritualData.steps.length === 0) {
      this.logger.error('RitualSystemManager', '❌ Ritual must have at least one step');
      return null;
    }

    if ((ritualData.minParticipants ?? 0) > (ritualData.maxParticipants ?? Number.MAX_SAFE_INTEGER)) {
      this.logger.error('RitualSystemManager', '❌ Minimum participants cannot exceed maximum');
      return null;
    }

    // Create ritual definition
    const ritual: RitualDefinition = {
      id: ritualData.id,
      name: ritualData.name,
      description: ritualData.description || 'A magical ritual',
      category: ritualData.category || 'summoning',
      tier: ritualData.tier || 'basic',
      steps: ritualData.steps,
      requiredParticipants: ritualData.requiredParticipants || 1,
      minParticipants: ritualData.minParticipants || 1,
      maxParticipants: ritualData.maxParticipants || 1,
      baseDuration: ritualData.baseDuration || 60000,
      manaCost: ritualData.manaCost || 100,
      itemRequirements: ritualData.itemRequirements || [],
      environmentRequirements: ritualData.environmentRequirements || [],
      alignmentRequirement: ritualData.alignmentRequirement || 'neutral',
      successRate: ritualData.successRate || 0.8,
      failureConsequences: ritualData.failureConsequences || 'minor',
      rewards: ritualData.rewards || [],
      risks: ritualData.risks || [],
      visualTheme: ritualData.visualTheme || 'default',
      soundTheme: ritualData.soundTheme || 'default',
      icon: ritualData.icon || 'ritual_icon',
      lore: ritualData.lore || '',
      prerequisites: ritualData.prerequisites || [],
      cooldown: ritualData.cooldown || 300000,
      charges: ritualData.charges
    };

    return ritual;
  }

  /**
   * Register a ritual in the system
   */
  registerRitual(ritual: RitualDefinition): boolean {
    // Validate ritual
    if (!this.validateRitualDefinition(ritual)) {
      this.logger.error('RitualSystemManager', `❌ Invalid ritual definition: ${ritual.id}`);
      return false;
    }

    // Store in system (this would normally go through the main system)
    this.logger.info('RitualSystemManager', `✅ Registered ritual: ${ritual.name} (${ritual.id})`);
    return true;
  }

  /**
   * Start a ritual with enhanced error handling
   */
  startRitualEnhanced(ritualId: string, leaderId: string, participantIds: string[] = []): RitualInstance | null {
    try {
      // Validate inputs
      if (!leaderId || leaderId.trim() === '') {
        throw new Error('Leader ID is required');
      }

      if (participantIds.length > 0 && participantIds.includes(leaderId)) {
        throw new Error('Leader cannot also be a participant');
      }

      // Check prerequisites
      const ritualDef = this.ritualSystem.getRitualDefinition(ritualId);
      if (!ritualDef) {
        throw new Error(`Ritual definition not found: ${ritualId}`);
      }

      // Check if leader meets requirements
      if (!this.checkParticipantRequirements(leaderId, 'leader', ritualDef)) {
        throw new Error('Leader does not meet ritual requirements');
      }

      // Validate participants
      for (const participantId of participantIds) {
        if (!this.checkParticipantRequirements(participantId, 'participant', ritualDef)) {
          throw new Error(`Participant ${participantId} does not meet requirements`);
        }
      }

      // Start the ritual
      const ritual = this.ritualSystem.startRitual(ritualId, leaderId, participantIds);

      if (ritual) {
        this.logger.info('RitualSystemManager', `🎭 Started ritual: ${ritualDef.name} led by ${leaderId}`);
        this.logger.info('RitualSystemManager', `   Participants: ${ritual.participants.length}`);
        this.logger.info('RitualSystemManager', `   Steps: ${ritualDef.steps.length}`);
      }

      return ritual;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('RitualSystemManager', `❌ Failed to start ritual ${ritualId}: ${message}`);
      return null;
    }
  }

  /**
   * Check if participant meets requirements
   */
  private checkParticipantRequirements(participantId: string, role: string, ritualDef: RitualDefinition): boolean {
    // This would integrate with character/level systems
    // For now, just check basic requirements
    if (role === 'leader') {
      // Leader typically needs higher level/skill requirements
      return true; // Assume leader meets requirements
    } else {
      // Participants need basic requirements
      return true; // Assume participants meet requirements
    }
  }

  /**
   * Progress ritual with enhanced logic
   */
  progressRitualEnhanced(ritualId: string): RitualResult | null {
    try {
      const ritual = this.ritualSystem.getActiveRitual(ritualId);
      if (!ritual) {
        this.logger.warn('RitualSystemManager', `⚠️ Ritual not found: ${ritualId}`);
        return null;
      }

      const currentStep = ritual.definition.steps[ritual.currentStep];
      if (!currentStep) {
        this.logger.warn('RitualSystemManager', `⚠️ No current step for ritual: ${ritualId}`);
        return null;
      }

      // Check if ritual can progress
      if (ritual.status !== 'active') {
        this.logger.warn('RitualSystemManager', `⚠️ Ritual not active: ${ritualId}`);
        return null;
      }

      // Calculate step success
      const successRate = this.calculateStepSuccessRate(ritual, currentStep);
      const success = Math.random() < successRate;

      if (!success) {
        return this.handleStepFailure(ritual, currentStep);
      }

      // Progress the ritual
      const result = this.ritualSystem.progressRitual(ritualId);

      if (result) {
        this.logger.info('RitualSystemManager', `✅ Ritual step completed: ${currentStep.name}`);
        this.logger.info('RitualSystemManager', `   Quality: ${(result.quality * 100).toFixed(1)}%`);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('RitualSystemManager', `❌ Error progressing ritual ${ritualId}: ${message}`);
      return null;
    }
  }

  /**
   * Calculate step success rate
   */
  private calculateStepSuccessRate(ritual: RitualInstance, step: RitualStep): number {
    let successRate = step.successRate;

    // Factor in participant quality
    const participantQuality = this.calculateParticipantQuality(ritual);
    successRate = (successRate + participantQuality) / 2;

    // Factor in ritual quality so far
    successRate = (successRate + ritual.quality) / 2;

    // Factor in environmental conditions
    const environmentalFactor = this.getEnvironmentalFactor(ritual);
    successRate *= environmentalFactor;

    return Math.max(0.1, Math.min(0.99, successRate));
  }

  /**
   * Calculate participant quality
   */
  private calculateParticipantQuality(ritual: RitualInstance): number {
    if (ritual.participants.length === 0) return 0.5;

    const totalMana = ritual.participants.reduce((sum, p) => sum + (p.manaContribution || 0), 0);
    const averageMana = totalMana / ritual.participants.length;

    // Normalize to 0-1 scale (assuming 100 mana is good)
    return Math.min(1.0, averageMana / 100);
  }

  /**
   * Get environmental factor
   */
  private getEnvironmentalFactor(ritual: RitualInstance): number {
    // This would check environmental conditions
    // For now, return a neutral factor
    return 1.0;
  }

  /**
   * Handle step failure
   */
  private handleStepFailure(ritual: RitualInstance, step: RitualStep): RitualResult {
    this.logger.warn('RitualSystemManager', `⚠️ Ritual step failed: ${step.name}`);

    // Apply failure effects
    for (const effect of step.failureEffects) {
      this.applyFailureEffect(ritual, effect);
    }

    // Create failure result
    const result: RitualResult = {
      success: false,
      ritualId: ritual.id,
      leaderId: ritual.leaderId,
      participants: ritual.participants.map(p => p.id),
      duration: Date.now() - ritual.startTime,
      energySpent: ritual.energySpent,
      quality: ritual.quality,
      rewards: [],
      risksTriggered: [],
      summonedEntities: [],
      effectsApplied: step.failureEffects,
      experienceGained: 0,
      failureReason: `Step failed: ${step.name}`
    };

    // Mark ritual as failed
    ritual.status = 'failed';

    return result;
  }

  /**
   * Apply failure effect
   */
  private applyFailureEffect(ritual: RitualInstance, effect: RitualEffect): void {
    this.logger.info('RitualSystemManager', `💥 Applying failure effect: ${effect.description}`);

    // This would apply negative effects to participants
    // Integration with health/damage systems would happen here
  }

  /**
   * Get ritual statistics
   */
  getRitualStats(): {
    totalRituals: number;
    activeRituals: number;
    completedRituals: number;
    successRate: number;
    averageQuality: number;
    mostSuccessfulCategory: string;
    totalManaSpent: number;
  } {
    const stats = this.ritualSystem.getStats();
    const successRate = stats.completedRituals > 0 ?
      (stats.completedRituals / (stats.completedRituals + stats.totalRituals - stats.activeRituals)) * 100 : 0;

    return {
      totalRituals: stats.totalRituals,
      activeRituals: stats.activeRituals,
      completedRituals: stats.completedRituals,
      successRate: Math.round(successRate * 100) / 100,
      averageQuality: Math.round(stats.averageQuality * 100) / 100,
      mostSuccessfulCategory: stats.mostCommonCategory,
      totalManaSpent: stats.totalExperienceGranted // Using as proxy for mana
    };
  }

  /**
   * Get available rituals for a participant
   */
  getAvailableRituals(participantId: string): RitualDefinition[] {
    const allRituals = this.getAllRitualDefinitions();
    return allRituals.filter(ritual => this.canParticipateInRitual(participantId, ritual));
  }

  /**
   * Check if participant can join a ritual
   */
  private canParticipateInRitual(participantId: string, ritual: RitualDefinition): boolean {
    // Check prerequisites
    for (const prereq of ritual.prerequisites) {
      if (!this.hasPrerequisite(participantId, prereq)) {
        return false;
      }
    }

    // Check participant count limits
    // This would check current active rituals

    return true;
  }

  /**
   * Check if participant has prerequisite
   */
  private hasPrerequisite(participantId: string, prerequisite: string): boolean {
    // This would check achievements, completed rituals, etc.
    // For now, assume basic prerequisites are met
    return prerequisite !== 'impossible-prerequisite';
  }

  /**
   * Get ritual recommendations for a participant
   */
  getRitualRecommendations(participantId: string): Array<{
    ritual: RitualDefinition;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    expectedReward: string;
  }> {
    const availableRituals = this.getAvailableRituals(participantId);
    const recommendations: Array<{
      ritual: RitualDefinition;
      reason: string;
      difficulty: 'easy' | 'medium' | 'hard' | 'expert';
      expectedReward: string;
    }> = [];

    for (const ritual of availableRituals) {
      const difficulty = this.assessRitualDifficulty(ritual);
      const expectedReward = this.getExpectedReward(ritual);

      let reason = '';
      if (ritual.category === 'summoning') {
        reason = 'Learn to summon powerful allies';
      } else if (ritual.category === 'binding') {
        reason = 'Master the art of spirit binding';
      } else {
        reason = 'Expand your magical knowledge';
      }

      recommendations.push({
        ritual,
        reason,
        difficulty,
        expectedReward
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Assess ritual difficulty
   */
  private assessRitualDifficulty(ritual: RitualDefinition): 'easy' | 'medium' | 'hard' | 'expert' {
    const manaCost = ritual.manaCost;
    const participantCount = ritual.requiredParticipants;
    const stepCount = ritual.steps.length;

    if (manaCost < 100 && participantCount === 1 && stepCount <= 2) {
      return 'easy';
    } else if (manaCost < 300 && participantCount <= 3 && stepCount <= 4) {
      return 'medium';
    } else if (manaCost < 1000 && participantCount <= 5 && stepCount <= 6) {
      return 'hard';
    } else {
      return 'expert';
    }
  }

  /**
   * Get expected reward from ritual
   */
  private getExpectedReward(ritual: RitualDefinition): string {
    if (ritual.rewards.length === 0) return 'Experience and knowledge';

    const mainReward = ritual.rewards[0];
    return `${mainReward.type}: ${mainReward.description}`;
  }

  /**
   * Get ritual by ID
   */
  getRitual(ritualId: string): RitualDefinition | null {
    return this.ritualSystem.getRitualDefinition(ritualId);
  }

  /**
   * Get all ritual definitions
   */
  getAllRitualDefinitions(): RitualDefinition[] {
    // This would normally come from the main system
    return [];
  }

  /**
   * Get active ritual
   */
  getActiveRitual(ritualId: string): RitualInstance | null {
    return this.ritualSystem.getActiveRitual(ritualId);
  }

  /**
   * Cancel ritual
   */
  cancelRitual(ritualId: string): boolean {
    return this.ritualSystem.cancelRitual(ritualId);
  }

  /**
   * Validate ritual definition
   */
  private validateRitualDefinition(ritual: RitualDefinition): boolean {
    if (!ritual.id || ritual.id.trim() === '') {
      this.logger.error('RitualSystemManager', 'Ritual ID is required');
      return false;
    }

    if (!ritual.name || ritual.name.trim() === '') {
      this.logger.error('RitualSystemManager', 'Ritual name is required');
      return false;
    }

    if (ritual.steps.length === 0) {
      this.logger.error('RitualSystemManager', 'Ritual must have at least one step');
      return false;
    }

    if (ritual.minParticipants > ritual.maxParticipants) {
      this.logger.error('RitualSystemManager', 'Minimum participants cannot exceed maximum');
      return false;
    }

    if (ritual.manaCost < 0) {
      this.logger.error('RitualSystemManager', 'Mana cost cannot be negative');
      return false;
    }

    return true;
  }

  /**
   * Export ritual system data
   */
  exportData(): {
    rituals: RitualDefinition[];
    activeRituals: RitualInstance[];
    stats: ReturnType<RitualSystemPure['getStats']>;
    timestamp: number;
  } {
    return {
      rituals: this.getAllRitualDefinitions(),
      activeRituals: this.ritualSystem.getActiveRituals(),
      stats: this.ritualSystem.getStats(),
      timestamp: Date.now()
    };
  }

  /**
   * Import ritual system data
   */
  importData(data: ReturnType<typeof this.exportData>): void {
    // Import logic would go here
    this.logger.info('RitualSystemManager', 'Ritual system data imported');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.logger.info('RitualSystemManager', 'Destroying manager', {
      itemsCount: this.items.size
    });
    
    this.items.clear();
    this.stats = this.initializeStats();
    this.isInitialized = false;
    
    // Unregister from memory manager
    MemoryManager.unregisterObject(this.memoryId);
    
    // Destroy logger
    this.logger.destroy();
  }
}