import { AIDecisionProfile } from './AIDecisionProfile';
import { BattleAIController } from './AIController';
import { AIDecisionStyle, IAIDecisionProfile, IAIControllerManager, IBattleAIController } from './types';

export class AIControllerManager implements IAIControllerManager {
  private profiles: Map<string, IAIDecisionProfile> = new Map();

  constructor(...args: any[]) {
    // Seed standard profiles
    this.createStandardProfiles();
  }

  createStandardProfiles(): IAIDecisionProfile[] {
    const profiles = [
      AIDecisionProfile.balanced('balanced'),
      AIDecisionProfile.aggressive('aggressive'),
      AIDecisionProfile.defensive('defensive'),
      AIDecisionProfile.trickster('trickster')
    ];
    profiles.forEach(p => this.profiles.set(p.profileID, p));
    return profiles;
  }

  registerProfile(profile: IAIDecisionProfile): boolean {
    if (profile.validate().length > 0) return false;
    this.profiles.set(profile.profileID, profile);
    return true;
  }

  getProfile(id: string): IAIDecisionProfile | null {
    const p = this.profiles.get(id);
    if (!p) return null;
    // Normalize to AIDecisionProfile instance to ensure getters like isDefensive
    if (p instanceof AIDecisionProfile) return p;
    return new AIDecisionProfile(p.profileID, p.style, p.movePriorityWeights, p.preferredTypes);
  }

  hasProfile(id: string): boolean {
    return this.profiles.has(id);
  }

  getAllProfiles(): IAIDecisionProfile[] {
    return Array.from(this.profiles.values());
  }

  removeProfile(id: string): boolean {
    return this.profiles.delete(id);
  }

  updateProfile(id: string, updates: Partial<IAIDecisionProfile>): boolean {
    const existing = this.profiles.get(id);
    if (!existing) return false;
    if (updates.profileID === '') return false;
    const updated = {
      ...existing,
      ...updates,
      movePriorityWeights: { ...existing.movePriorityWeights, ...(updates.movePriorityWeights || {}) }
    } as IAIDecisionProfile;
    // Use a new AIDecisionProfile instance to validate constraints
    const temp = new AIDecisionProfile(
      updated.profileID,
      updated.style,
      updated.movePriorityWeights,
      updated.preferredTypes
    );
    if (temp.validate().length > 0) return false;
    this.profiles.set(updated.profileID, updated);
    if (updated.profileID !== id) this.profiles.delete(id);
    return true;
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getAIController(profileId: string): IBattleAIController {
    const profile = this.getProfile(profileId) || AIDecisionProfile.balanced(profileId);
    if (!this.getProfile(profile.profileID)) this.registerProfile(profile);
    return new BattleAIController(profile);
  }

  getProfilesByStyle(style: AIDecisionStyle): IAIDecisionProfile[] {
    return this.getAllProfiles().filter(p => p.style === style);
  }

  getProfilesWithTypePreferences(): IAIDecisionProfile[] {
    return this.getAllProfiles().filter(p => p.preferredTypes && p.preferredTypes.length > 0);
  }
}

