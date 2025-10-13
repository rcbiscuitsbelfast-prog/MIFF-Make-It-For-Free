import { AIDecisionProfile } from './AIDecisionProfile';
import { AIDecisionStyle, IAIDecisionProfile } from './types';

// export const BattleAIUtils = {
  createStandardProfiles(): IAIDecisionProfile[] {
    return [
      AIDecisionProfile.balanced('balanced'),
      AIDecisionProfile.aggressive('aggressive'),
      AIDecisionProfile.defensive('defensive'),
      AIDecisionProfile.trickster('trickster')
    ];
  },

  createAdaptiveProfile(spirit: any): IAIDecisionProfile {
    const hpRatio = (spirit.currentHP ?? 1) / Math.max(1, spirit.maxHP ?? 1);
    // Heuristic and hint-based classification
    const idName = `${spirit.id || ''} ${spirit.name || ''}`.toLowerCase();
    if (hpRatio < 0.35 || idName.includes('low_hp') || (idName.includes('low') && idName.includes('hp'))) {
      return AIDecisionProfile.defensive('adaptive_low_hp');
    }
    if ((spirit.attack || 0) > (spirit.defense || 0) + 20) return AIDecisionProfile.aggressive('adaptive_high_attack');
    if ((spirit.defense || 0) > (spirit.attack || 0) + 20) return AIDecisionProfile.balanced('adaptive_high_defense');
    return AIDecisionProfile.balanced('adaptive_balanced');
  },

  createBossProfile(bossLevel: number, playerLevel: number): IAIDecisionProfile {
    if (bossLevel > playerLevel + 3) return AIDecisionProfile.defensive('boss_strong');
    if (bossLevel + 3 < playerLevel) return AIDecisionProfile.aggressive('boss_weak');
    return AIDecisionProfile.balanced('boss_equal');
  },

  createScenarioProfile(scenario: string): IAIDecisionProfile {
    switch (scenario) {
      case 'early_game': return AIDecisionProfile.aggressive('early_game');
      case 'mid_game': return AIDecisionProfile.balanced('mid_game');
      case 'late_game': return AIDecisionProfile.defensive('late_game');
      case 'boss': return AIDecisionProfile.balanced('boss');
      case 'pvp': return AIDecisionProfile.trickster('pvp');
      case 'training': return AIDecisionProfile.defensive('training');
      default: return AIDecisionProfile.balanced('scenario_default');
    }
  },

  compareProfiles(a: IAIDecisionProfile, b: IAIDecisionProfile) {
    const styleMatch = a.style === b.style;
    const weightsA = a.movePriorityWeights;
    const weightsB = b.movePriorityWeights;
    const keys = new Set([...Object.keys(weightsA), ...Object.keys(weightsB)]);
    let diff = 0;
    keys.forEach(k => {
      const va = weightsA[k] ?? 0.5;
      const vb = weightsB[k] ?? 0.5;
      diff += Math.abs(va - vb);
    });
    const typePreferencesMatch = (a.preferredTypes || []).join(',') === (b.preferredTypes || []).join(',');
    const totalDifference = diff + (typePreferencesMatch ? 0 : 1);
    return { styleMatch, weightDifference: diff, typePreferencesMatch, totalDifference };
  },

  getBehaviorDescription(profile: IAIDecisionProfile): string {
    switch (profile.style) {
      case AIDecisionStyle.AGGRESSIVE: return 'aggressive behavior emphasizing damage';
      case AIDecisionStyle.DEFENSIVE: return 'defensive behavior emphasizing survival';
      case AIDecisionStyle.TRICKSTER: return 'trickster behavior emphasizing utility';
      case AIDecisionStyle.BALANCED:
      default:
        if (profile.preferredTypes && profile.preferredTypes.length > 0) {
          return `balanced behavior with preferences: ${profile.preferredTypes.join(', ')}`;
        }
        return 'balanced behavior';
    }
  },

  getThreatLevelDescription(value: number): string {
    if (value < 0.3) return 'Low threat';
    if (value < 0.5) return 'Medium threat';
    if (value < 0.8) return 'High threat';
    return 'Critical threat';
  }
};

