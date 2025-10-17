/**
 * AIProfilesPure Manager
 * 
 * Advanced AI profile management system including behavior trees,
 * scheduling, role assignment, and comprehensive AI workflows.
 */

export type Role = 'vendor' | 'questGiver' | 'wanderer' | 'guard' | 'custom';

export interface ScheduleEntry {
  id: string;
  time: string;
  action: string;
  priority: number;
  conditions?: string[];
  metadata?: Record<string, any>;
}

export interface AIProfile {
  id: string;
  name: string;
  role: Role;
  behaviorTree?: string;
  schedule?: ScheduleEntry[];
  dialogId?: string;
  questId?: string;
  personality: PersonalityTraits;
  skills: SkillSet;
  relationships: RelationshipMap;
  metadata?: Record<string, any>;
}

export interface PersonalityTraits {
  friendliness: number; // 0-100
  aggression: number; // 0-100
  intelligence: number; // 0-100
  courage: number; // 0-100
  loyalty: number; // 0-100
  curiosity: number; // 0-100
}

export interface SkillSet {
  combat: number; // 0-100
  magic: number; // 0-100
  crafting: number; // 0-100
  trading: number; // 0-100
  diplomacy: number; // 0-100
  stealth: number; // 0-100
}

export interface RelationshipMap {
  [npcId: string]: {
    relationship: 'friend' | 'enemy' | 'neutral' | 'ally' | 'rival';
    trust: number; // 0-100
    respect: number; // 0-100
    history: RelationshipEvent[];
  };
}

export interface RelationshipEvent {
  id: string;
  type: 'interaction' | 'quest' | 'trade' | 'combat' | 'dialogue';
  description: string;
  timestamp: number;
  impact: number; // -100 to 100
}

export interface BehaviorResult {
  npcId: string;
  role: Role;
  actions: string[];
  dialogId?: string;
  questId?: string;
  personality: PersonalityTraits;
  skills: SkillSet;
  relationships: RelationshipMap;
  schedule: ScheduleEntry[];
  metadata?: Record<string, any>;
}

export interface AIStats {
  totalProfiles: number;
  profilesByRole: Record<Role, number>;
  averagePersonality: PersonalityTraits;
  averageSkills: SkillSet;
  totalRelationships: number;
  activeSchedules: number;
}

export interface AIFilter {
  role?: Role;
  minFriendliness?: number;
  maxFriendliness?: number;
  minIntelligence?: number;
  maxIntelligence?: number;
  hasSchedule?: boolean;
  hasDialog?: boolean;
  hasQuest?: boolean;
}

export interface AIOutput {
  op: string;
  status: 'ok' | 'error';
  result?: AIProfile | BehaviorResult | AIStats | string;
  issues?: string[];
}

export interface Hooks {
  onNPCInteract?: (npcId: string, role: Role) => void;
  onScheduleTrigger?: (npcId: string, entry: ScheduleEntry) => void;
  onRoleAssigned?: (npcId: string, role: Role) => void;
  onPersonalityChange?: (npcId: string, traits: PersonalityTraits) => void;
  onSkillChange?: (npcId: string, skills: SkillSet) => void;
  onRelationshipChange?: (npcId: string, targetId: string, relationship: any) => void;
}

export class AIProfileManager {
  private profiles = new Map<string, AIProfile>();
  private hooks: Hooks;
  private stats: AIStats;

  constructor(hooks: Hooks = {}) {
    this.hooks = hooks;
    this.stats = {
      totalProfiles: 0,
      profilesByRole: {
        vendor: 0,
        questGiver: 0,
        wanderer: 0,
        guard: 0,
        custom: 0
      },
      averagePersonality: {
        friendliness: 50,
        aggression: 50,
        intelligence: 50,
        courage: 50,
        loyalty: 50,
        curiosity: 50
      },
      averageSkills: {
        combat: 50,
        magic: 50,
        crafting: 50,
        trading: 50,
        diplomacy: 50,
        stealth: 50
      },
      totalRelationships: 0,
      activeSchedules: 0
    };
  }

  /**
   * Load AI profiles from array
   */
  loadProfiles(profiles: AIProfile[]): AIOutput {
    this.profiles.clear();
    for (const profile of profiles) {
      this.profiles.set(profile.id, profile);
    }
    this.updateStats();
    return {
      op: 'load-profiles',
      status: 'ok',
      result: `Loaded ${profiles.length} profiles`
    };
  }

  /**
   * Create a new AI profile
   */
  createProfile(profile: AIProfile): AIOutput {
    if (this.profiles.has(profile.id)) {
      return {
        op: 'create-profile',
        status: 'error',
        issues: [`Profile with ID ${profile.id} already exists`]
      };
    }

    this.profiles.set(profile.id, profile);
    this.updateStats();
    return {
      op: 'create-profile',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Get AI profile by ID
   */
  getProfile(npcId: string): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'get-profile',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }
    return {
      op: 'get-profile',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Update AI profile
   */
  updateProfile(npcId: string, updates: Partial<AIProfile>): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'update-profile',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(npcId, updatedProfile);
    this.updateStats();
    return {
      op: 'update-profile',
      status: 'ok',
      result: updatedProfile
    };
  }

  /**
   * Delete AI profile
   */
  deleteProfile(npcId: string): AIOutput {
    if (!this.profiles.has(npcId)) {
      return {
        op: 'delete-profile',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    this.profiles.delete(npcId);
    this.updateStats();
    return {
      op: 'delete-profile',
      status: 'ok',
      result: `Profile ${npcId} deleted`
    };
  }

  /**
   * List all profiles
   */
  listProfiles(filter?: AIFilter): AIOutput {
    let profiles = Array.from(this.profiles.values());

    if (filter) {
      profiles = profiles.filter((profile: any) => {
        if (filter.role && profile.role !== filter.role) return false;
        if (filter.minFriendliness !== undefined && profile.personality.friendliness < filter.minFriendliness) return false;
        if (filter.maxFriendliness !== undefined && profile.personality.friendliness > filter.maxFriendliness) return false;
        if (filter.minIntelligence !== undefined && profile.personality.intelligence < filter.minIntelligence) return false;
        if (filter.maxIntelligence !== undefined && profile.personality.intelligence > filter.maxIntelligence) return false;
        if (filter.hasSchedule !== undefined) {
          if (filter.hasSchedule && (!profile.schedule || profile.schedule.length === 0)) return false;
          if (!filter.hasSchedule && profile.schedule && profile.schedule.length > 0) return false;
        }
        if (filter.hasDialog !== undefined) {
          if (filter.hasDialog && !profile.dialogId) return false;
          if (!filter.hasDialog && profile.dialogId) return false;
        }
        if (filter.hasQuest !== undefined) {
          if (filter.hasQuest && !profile.questId) return false;
          if (!filter.hasQuest && profile.questId) return false;
        }
        return true;
      });
    }

    return {
      op: 'list-profiles',
      status: 'ok',
      result: profiles as any
    };
  }

  /**
   * Assign role to NPC
   */
  assignRole(npcId: string, role: Role): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'assign-role',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    profile.role = role;
    this.hooks.onRoleAssigned?.(npcId, role);
    this.updateStats();
    return {
      op: 'assign-role',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Link dialog to NPC
   */
  linkDialog(npcId: string, dialogId: string): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'link-dialog',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    profile.dialogId = dialogId;
    return {
      op: 'link-dialog',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Link quest to NPC
   */
  linkQuest(npcId: string, questId: string): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'link-quest',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    profile.questId = questId;
    return {
      op: 'link-quest',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Get schedule for NPC
   */
  getSchedule(npcId: string): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'get-schedule',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    return {
      op: 'get-schedule',
      status: 'ok',
      result: (profile.schedule || []) as any
    };
  }

  /**
   * Add schedule entry
   */
  addScheduleEntry(npcId: string, entry: ScheduleEntry): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'add-schedule',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    if (!profile.schedule) {
      profile.schedule = [];
    }
    profile.schedule.push(entry);
    profile.schedule.sort((a: any, b: any) => a.priority - b.priority);
    this.updateStats();
    return {
      op: 'add-schedule',
      status: 'ok',
      result: profile.schedule as any
    };
  }

  /**
   * Update personality traits
   */
  updatePersonality(npcId: string, traits: Partial<PersonalityTraits>): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'update-personality',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    profile.personality = { ...profile.personality, ...traits };
    this.hooks.onPersonalityChange?.(npcId, profile.personality);
    this.updateStats();
    return {
      op: 'update-personality',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Update skills
   */
  updateSkills(npcId: string, skills: Partial<SkillSet>): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'update-skills',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    profile.skills = { ...profile.skills, ...skills };
    this.hooks.onSkillChange?.(npcId, profile.skills);
    this.updateStats();
    return {
      op: 'update-skills',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Update relationship
   */
  updateRelationship(npcId: string, targetId: string, relationship: any): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'update-relationship',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    if (!profile.relationships) {
      profile.relationships = {};
    }
    profile.relationships[targetId] = relationship;
    this.hooks.onRelationshipChange?.(npcId, targetId, relationship);
    this.updateStats();
    return {
      op: 'update-relationship',
      status: 'ok',
      result: profile
    };
  }

  /**
   * Simulate behavior for NPC
   */
  simulateBehavior(npcId: string): AIOutput {
    const profile = this.profiles.get(npcId);
    if (!profile) {
      return {
        op: 'simulate-behavior',
        status: 'error',
        issues: [`Profile with ID ${npcId} not found`]
      };
    }

    this.hooks.onNPCInteract?.(npcId, profile.role);
    const actions: string[] = [];

    // Role-based behavior
    switch (profile.role) {
      case 'vendor':
        actions.push('openShop');
        if (profile.dialogId) actions.push('talk');
        if (profile.skills.trading > 70) actions.push('negotiate');
        break;
      case 'questGiver':
        if (profile.questId) actions.push(`offerQuest:${profile.questId}`);
        if (profile.dialogId) actions.push('talk');
        if (profile.personality.friendliness > 80) actions.push('greet');
        break;
      case 'wanderer':
        actions.push('wander');
        if (profile.personality.curiosity > 60) actions.push('explore');
        break;
      case 'guard':
        actions.push('patrol');
        if (profile.skills.combat > 80) actions.push('alert');
        break;
      case 'custom':
        if (profile.behaviorTree) actions.push(`runBT:${profile.behaviorTree}`);
        else actions.push('idle');
        break;
    }

    // Schedule-based behavior
    if (profile.schedule && profile.schedule.length > 0) {
      const currentEntry = profile.schedule[0!];
      actions.push(`schedule:${currentEntry.time}:${currentEntry.action}`);
      this.hooks.onScheduleTrigger?.(npcId, currentEntry);
    }

    // Personality-based behavior
    if (profile.personality.aggression > 70) actions.push('aggressive');
    if (profile.personality.friendliness > 80) actions.push('friendly');
    if (profile.personality.intelligence > 90) actions.push('wise');

    const result: BehaviorResult = {
      npcId,
      role: profile.role,
      actions,
      dialogId: profile.dialogId,
      questId: profile.questId,
      personality: profile.personality,
      skills: profile.skills,
      relationships: profile.relationships || {},
      schedule: profile.schedule || [],
      metadata: profile.metadata
    };

    return {
      op: 'simulate-behavior',
      status: 'ok',
      result
    };
  }

  /**
   * Get AI statistics
   */
  getStats(): AIOutput {
    return {
      op: 'get-stats',
      status: 'ok',
      result: { ...this.stats }
    };
  }

  /**
   * Export AI data
   */
  exportAI(format: 'json' | 'manifest' | 'summary' | 'profiles' = 'json'): AIOutput {
    const profiles = Array.from(this.profiles.values());

    switch (format) {
      case 'json':
        return {
          op: 'export',
          status: 'ok',
          result: {
            profiles,
            stats: this.stats
          } as any
        };
      
      case 'manifest':
        return {
          op: 'export',
          status: 'ok',
          result: {
            schema: 'miff.ai.export.v1',
            profiles,
            stats: this.stats,
            exportedAt: new Date().toISOString()
          } as any
        };
      
      case 'summary':
        return {
          op: 'export',
          status: 'ok',
          result: {
            summary: this.stats,
            totalProfiles: profiles.length,
            profilesByRole: this.stats.profilesByRole
          } as any
        };
      
      case 'profiles':
        return {
          op: 'export',
          status: 'ok',
          result: {
            profiles,
            total: profiles.length
          } as any
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
   * Reset AI system
   */
  resetAI(): AIOutput {
    this.profiles.clear();
    this.stats = {
      totalProfiles: 0,
      profilesByRole: {
        vendor: 0,
        questGiver: 0,
        wanderer: 0,
        guard: 0,
        custom: 0
      },
      averagePersonality: {
        friendliness: 50,
        aggression: 50,
        intelligence: 50,
        courage: 50,
        loyalty: 50,
        curiosity: 50
      },
      averageSkills: {
        combat: 50,
        magic: 50,
        crafting: 50,
        trading: 50,
        diplomacy: 50,
        stealth: 50
      },
      totalRelationships: 0,
      activeSchedules: 0
    };
    return {
      op: 'reset',
      status: 'ok',
      result: 'AI system reset'
    };
  }

  /**
   * Private helper methods
   */
  private updateStats(): void {
    const profiles = Array.from(this.profiles.values());
    this.stats.totalProfiles = profiles.length;

    // Reset role counts
    this.stats.profilesByRole = {
      vendor: 0,
      questGiver: 0,
      wanderer: 0,
      guard: 0,
      custom: 0
    };

    // Count by role
    profiles.forEach((profile: any) => {
      this.stats.profilesByRole[profile.role]++;
    });

    // Calculate averages
    if (profiles.length > 0) {
      const totalPersonality = profiles.reduce((acc, profile) => ({
        friendliness: acc.friendliness + profile.personality.friendliness,
        aggression: acc.aggression + profile.personality.aggression,
        intelligence: acc.intelligence + profile.personality.intelligence,
        courage: acc.courage + profile.personality.courage,
        loyalty: acc.loyalty + profile.personality.loyalty,
        curiosity: acc.curiosity + profile.personality.curiosity
      }), { friendliness: 0, aggression: 0, intelligence: 0, courage: 0, loyalty: 0, curiosity: 0 });

      this.stats.averagePersonality = {
        friendliness: totalPersonality.friendliness / profiles.length,
        aggression: totalPersonality.aggression / profiles.length,
        intelligence: totalPersonality.intelligence / profiles.length,
        courage: totalPersonality.courage / profiles.length,
        loyalty: totalPersonality.loyalty / profiles.length,
        curiosity: totalPersonality.curiosity / profiles.length
      };

      const totalSkills = profiles.reduce((acc, profile) => ({
        combat: acc.combat + profile.skills.combat,
        magic: acc.magic + profile.skills.magic,
        crafting: acc.crafting + profile.skills.crafting,
        trading: acc.trading + profile.skills.trading,
        diplomacy: acc.diplomacy + profile.skills.diplomacy,
        stealth: acc.stealth + profile.skills.stealth
      }), { combat: 0, magic: 0, crafting: 0, trading: 0, diplomacy: 0, stealth: 0 });

      this.stats.averageSkills = {
        combat: totalSkills.combat / profiles.length,
        magic: totalSkills.magic / profiles.length,
        crafting: totalSkills.crafting / profiles.length,
        trading: totalSkills.trading / profiles.length,
        diplomacy: totalSkills.diplomacy / profiles.length,
        stealth: totalSkills.stealth / profiles.length
      };
    }

    // Count relationships and schedules
    this.stats.totalRelationships = profiles.reduce((acc, profile) => 
      acc + (profile.relationships ? Object.keys(profile.relationships).length : 0), 0);
    this.stats.activeSchedules = profiles.reduce((acc, profile) => 
      acc + (profile.schedule ? profile.schedule.length : 0), 0);
  }
}

