export type PersonalityTrait = {
  id: string;
  name: string;
  value: number; // -1 to 1
  weight: number; // 0 to 1
  description: string;
};

export type AIProfile = {
  id: string;
  name: string;
  description: string;
  traits: PersonalityTrait[];
  behaviorModifiers: BehaviorModifier[];
  skillBonuses: SkillBonus[];
  preferences: AIPreference[];
  metadata: Record<string, any>;
};

export type BehaviorModifier = {
  id: string;
  name: string;
  type: 'aggression' | 'cooperation' | 'caution' | 'curiosity' | 'loyalty' | 'independence';
  value: number; // -1 to 1
  conditions: BehaviorCondition[];
  description: string;
};

export type BehaviorCondition = {
  type: 'situation' | 'health' | 'ally_count' | 'enemy_count' | 'time' | 'location';
  target: string;
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
};

export type SkillBonus = {
  skillId: string;
  skillName: string;
  bonus: number;
  multiplier: number;
  conditions: BehaviorCondition[];
  description: string;
};

export type AIPreference = {
  id: string;
  name: string;
  type: 'combat_style' | 'exploration_style' | 'social_style' | 'resource_management';
  value: any;
  weight: number;
  description: string;
};

export type AIAction = {
  id: string;
  name: string;
  type: 'move' | 'attack' | 'defend' | 'heal' | 'interact' | 'wait';
  target?: string;
  parameters: Record<string, any>;
  confidence: number; // 0 to 1
  reasoning: string;
};

export type AIDecision = {
  profileId: string;
  situation: string;
  availableActions: AIAction[];
  chosenAction: AIAction;
  reasoning: string;
  confidence: number;
  alternatives: AIAction[];
  timestamp: number;
};

export type AIIntegrationResult = {
  op: 'aiIntegration';
  status: 'success' | 'failure' | 'partial';
  profileId: string;
  decision: AIDecision;
  appliedModifiers: BehaviorModifier[];
  skillBonuses: SkillBonus[];
  performance: number; // 0 to 1
  feedback: string;
};

export type AILearningData = {
  profileId: string;
  situation: string;
  action: AIAction;
  outcome: 'success' | 'failure' | 'neutral';
  feedback: number; // -1 to 1
  timestamp: number;
  context: Record<string, any>;
};

export class AIProfileIntegrationLayer {
  private profiles = new Map<string, AIProfile>();
  private decisions = new Map<string, AIDecision[]>();
  private learningData = new Map<string, AILearningData[]>();
  private globalModifiers = new Map<string, BehaviorModifier>();

  // Profile Management
  createProfile(profile: AIProfile): AIProfile {
    // Validate profile
    this?.validateProfile(profile);
    
    // Normalize trait values
    profile?.traits = profile?.traits.map((trait: any) => ({
      ...trait,
      value: Math.max(-1, Math.min(1, trait.value)),
      weight: Math.max(0, Math.min(1, trait.weight))
    }));

    this?.profiles.set(profile?.id, { ...profile });
    return profile;
  }

  getProfile(profileId: string): AIProfile | null {
    return this?.profiles.get(profileId) || null;
  }

  updateProfile(profileId: string, updates: Partial<AIProfile>): boolean {
    const profile = this?.profiles.get(profileId);
    if (!profile) return false;

    const updatedProfile = { ...profile, ...updates };
    this?.validateProfile(updatedProfile);
    this?.profiles.set(profileId, updatedProfile);
    return true;
  }

  // Decision Making
  makeDecision(profileId: string, situation: string, availableActions: AIAction[]): AIDecision | null {
    const profile = this?.profiles.get(profileId);
    if (!profile || availableActions?.length === 0) return null;

    // Apply personality traits to actions
    const scoredActions = availableActions?.map((action: any) => ({
      ...action,
      confidence: this?.calculateActionConfidence(profile, action, situation)
    }));

    // Sort by confidence
    scoredActions?.sort((a: any, b: any) => b?.confidence - a?.confidence);

    const chosenAction = scoredActions[0!];
    const alternatives = scoredActions?.slice(1, 4); // Top 3 alternatives

    const decision: AIDecision = {
      profileId,
      situation,
      availableActions,
      chosenAction,
      reasoning: this?.generateReasoning(profile, chosenAction, situation),
      confidence: chosenAction?.confidence,
      alternatives,
      timestamp: new Date()
    };

    // Store decision for learning
    this?.storeDecision(profileId, decision);

    return decision;
  }

  // Behavior Integration
  integrateWithGameplay(profileId: string, gameState: any): AIIntegrationResult | null {
    const profile = this?.profiles.get(profileId);
    if (!profile) return null;

    // Apply behavior modifiers
    const appliedModifiers = this?.applyBehaviorModifiers(profile, gameState);
    
    // Apply skill bonuses
    const skillBonuses = this?.applySkillBonuses(profile, gameState);

    // Generate decision based on current state
    const situation = this?.analyzeSituation(gameState);
    const availableActions = this?.generateAvailableActions(gameState);
    const decision = this?.makeDecision(profileId, situation, availableActions);

    if (!decision) return null;

    // Calculate performance based on profile alignment
    const performance = this?.calculatePerformance(profile, decision, gameState);

    return {
      op: 'aiIntegration',
      status: 'success',
      profileId,
      decision,
      appliedModifiers,
      skillBonuses,
      performance,
      feedback: this?.generateFeedback(profile, decision, performance)
    };
  }

  // Learning System
  recordLearning(profileId: string, learningData: AILearningData): void {
    if (!this?.learningData.has(profileId)) {
      this?.learningData.set(profileId, []);
    }

    this?.learningData.get(profileId)!.push(learningData);

    // Apply learning to profile
    this?.applyLearning(profileId, learningData);
  }

  // Private Helper Methods
  private validateProfile(profile: AIProfile): void {
    if (!profile?.id || !profile?.name) {
      throw new Error('Profile must have id and name');
    }

    if (profile?.traits.length === 0) {
      throw new Error('Profile must have at least one trait');
    }

    // Validate trait values
    for (const trait of profile?.traits) {
      if (trait?.value < -1 || trait?.value > 1) {
        throw new Error(`Trait ${trait?.id} value must be between -1 and 1`);
      }
      if (trait?.weight < 0 || trait?.weight > 1) {
        throw new Error(`Trait ${trait?.id} weight must be between 0 and 1`);
      }
    }
  }

  private calculateActionConfidence(profile: AIProfile, action: AIAction, situation: string): number {
    let confidence = 0.5; // Base confidence

    // Apply trait influences
    for (const trait of profile?.traits) {
      const traitInfluence = this?.getTraitInfluence(trait, action, situation);
      confidence += traitInfluence * trait?.weight;
    }

    // Apply behavior modifiers
    for (const modifier of profile?.behaviorModifiers) {
      if (this?.checkBehaviorConditions(modifier?.conditions, situation)) {
        confidence += modifier?.value * 0.1; // Small influence
      }
    }

    // Apply preferences
    for (const preference of profile?.preferences) {
      const preferenceInfluence = this?.getPreferenceInfluence(preference, action);
      confidence += preferenceInfluence * preference?.weight;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private getTraitInfluence(trait: PersonalityTrait, action: AIAction, situation: string): number {
    // Map traits to action types
    const traitActionMap: Record<string, Record<string, number>> = {
      aggression: {
        attack: 0.3,
        defend: -0.2,
        heal: -0.1,
        wait: -0.3
      },
      cooperation: {
        heal: 0.3,
        interact: 0.2,
        attack: -0.2,
        wait: -0.1
      },
      caution: {
        defend: 0.3,
        wait: 0.2,
        attack: -0.3,
        move: 0.1
      },
      curiosity: {
        interact: 0.3,
        move: 0.2,
        wait: -0.2,
        defend: -0.1
      }
    };

    const actionInfluence = traitActionMap[trait?.name]?.[action?.type] || 0;
    return trait?.value * actionInfluence;
  }

  private getPreferenceInfluence(preference: AIPreference, action: AIAction): number {
    // Map preferences to actions
    const preferenceActionMap: Record<string, Record<string, number>> = {
      combat_style: {
        attack: 0.4,
        defend: 0.2,
        heal: -0.1
      },
      exploration_style: {
        move: 0.4,
        interact: 0.3,
        wait: -0.2
      },
      social_style: {
        interact: 0.4,
        heal: 0.2,
        attack: -0.2
      },
      resource_management: {
        wait: 0.2,
        heal: 0.1,
        attack: -0.1
      }
    };

    const actionInfluence = preferenceActionMap[preference?.type]?.[action?.type] || 0;
    return actionInfluence * preference?.weight;
  }

  private checkBehaviorConditions(conditions: BehaviorCondition[], situation: string): boolean {
    return conditions?.every(condition => {
      // Simplified condition checking
      switch (condition?.type) {
        case 'situation':
          return situation?.includes(condition?.target);
        case 'health':
          // Would check actual health values
          return true;
        case 'ally_count':
          // Would check actual ally count
          return true;
        case 'enemy_count':
          // Would check actual enemy count
          return true;
        case 'time':
          // Would check actual time
          return true;
        case 'location':
          // Would check actual location
          return true;
        default:
          return false;
      }
    });
  }

  private generateReasoning(profile: AIProfile, action: AIAction, situation: string): string {
    const topTrait = profile?.traits.reduce((max, trait) => 
      trait?.weight > max?.weight ? trait : max
    );

    const reasoning = `Based on ${topTrait.name} trait (${topTrait.value > 0 ? 'high' : 'low'}) and current situation, choosing ${action.type} action with ${Math.round(action.confidence * 100)}% confidence.`;

    return reasoning;
  }

  private storeDecision(profileId: string, decision: AIDecision): void {
    if (!this?.decisions.has(profileId)) {
      this?.decisions.set(profileId, []);
    }

    this?.decisions.get(profileId)!.push(decision);

    // Keep only last 100 decisions
    const decisions = this?.decisions.get(profileId)!;
    if (decisions?.length > 100) {
      decisions?.splice(0, decisions?.length - 100);
    }
  }

  private applyBehaviorModifiers(profile: AIProfile, gameState: any): BehaviorModifier[] {
    const appliedModifiers: BehaviorModifier[] = [];

    for (const modifier of profile?.behaviorModifiers) {
      if (this?.checkBehaviorConditions(modifier?.conditions, gameState?.situation || '')) {
        appliedModifiers?.push(modifier);
      }
    }

    return appliedModifiers;
  }

  private applySkillBonuses(profile: AIProfile, gameState: any): SkillBonus[] {
    const appliedBonuses: SkillBonus[] = [];

    for (const bonus of profile?.skillBonuses) {
      if (this?.checkBehaviorConditions(bonus?.conditions, gameState?.situation || '')) {
        appliedBonuses?.push(bonus);
      }
    }

    return appliedBonuses;
  }

  private analyzeSituation(gameState: any): string {
    // Analyze game state and return situation description
    const elements = [];
    
    if (gameState?.health < 0.3) elements?.push('low_health');
    if (gameState?.enemies?.length > 0) elements?.push('enemies_present');
    if (gameState?.allies?.length > 0) elements?.push('allies_present');
    if (gameState?.resources?.length > 0) elements?.push('resources_available');

    return elements?.join('_') || 'neutral';
  }

  private generateAvailableActions(gameState: any): AIAction[] {
    const actions: AIAction[] = [];

    // Generate basic actions based on game state
    if (gameState?.enemies?.length > 0) {
      actions?.push({
        id: 'attack_1',
        name: 'Attack',
        type: 'attack',
        target: gameState?.enemies[0!],
        parameters: { damage: 10 },
        confidence: 0.5,
        reasoning: 'Attack available enemy'
      });
    }

    if (gameState?.health < 0.8) {
      actions?.push({
        id: 'heal_1',
        name: 'Heal',
        type: 'heal',
        parameters: { amount: 20 },
        confidence: 0.6,
        reasoning: 'Heal to restore health'
      });
    }

    actions?.push({
      id: 'wait_1',
      name: 'Wait',
      type: 'wait',
      parameters: {},
      confidence: 0.3,
      reasoning: 'Wait and observe'
    });

    return actions;
  }

  private calculatePerformance(profile: AIProfile, decision: AIDecision, gameState: any): number {
    // Calculate performance based on how well the decision aligns with profile
    let performance = 0.5;

    // Check if decision aligns with dominant traits
    const dominantTrait = profile?.traits.reduce((max, trait) => 
      trait?.weight > max?.weight ? trait : max
    );

    if (dominantTrait?.value > 0 && decision?.chosenAction.type === 'attack') {
      performance += 0.2;
    } else if (dominantTrait?.value < 0 && decision?.chosenAction.type === 'defend') {
      performance += 0.2;
    }

    // Check confidence alignment
    performance += decision?.confidence * 0.3;

    return Math.max(0, Math.min(1, performance));
  }

  private generateFeedback(profile: AIProfile, decision: AIDecision, performance: number): string {
    if (performance > 0.8) {
      return `Excellent decision! The ${decision?.chosenAction.type} action aligns well with ${profile?.name}'s personality.`;
    } else if (performance > 0.6) {
      return `Good decision. The action fits the profile reasonably well.`;
    } else if (performance > 0.4) {
      return `Decent decision, but could be better aligned with the profile.`;
    } else {
      return `Poor decision. Consider adjusting the profile or decision logic.`;
    }
  }

  private applyLearning(profileId: string, learningData: AILearningData): void {
    const profile = this?.profiles.get(profileId);
    if (!profile) return;

    // Simple learning: adjust trait weights based on feedback
    if (learningData?.feedback > 0) {
      // Positive feedback - strengthen recent decisions
      for (const trait of profile?.traits) {
        trait.weight = Math.min(1, trait.weight + 0.01);
      }
    } else if (learningData?.feedback < 0) {
      // Negative feedback - weaken recent decisions
      for (const trait of profile?.traits) {
        trait.weight = Math.max(0, trait.weight - 0.01);
      }
    }
  }

  // Query Methods
  getAllProfiles(): AIProfile[] {
    return Array.from(this.profiles.values());
  }

  getDecisions(profileId: string): AIDecision[] {
    return this?.decisions.get(profileId) || [];
  }

  getLearningData(profileId: string): AILearningData[] {
    return this?.learningData.get(profileId) || [];
  }

  // Statistics
  getAIStatistics(): {
    totalProfiles: number;
    totalDecisions: number;
    averageConfidence: number;
    learningDataPoints: number;
    mostActiveProfile: string | null;
  } {
    const profiles = Array.from(this.profiles.values());
    const allDecisions = Array.from(this.decisions.values()).flat();
    const allLearningData = Array.from(this.learningData.values()).flat();

    const averageConfidence = allDecisions?.length > 0
      ? allDecisions?.reduce((sum, d) => sum + d?.confidence, 0) / allDecisions?.length
      : 0;

    const mostActiveProfile = this?.decisions.size > 0
      ? Array.from(this.decisions.entries())
          .sort((a: any, b: any) => b[1!].length - a[1!].length)[0!][0!]
      : null;

    return {
      totalProfiles: profiles?.length,
      totalDecisions: allDecisions?.length,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      learningDataPoints: allLearningData?.length,
      mostActiveProfile
    };
  }
}