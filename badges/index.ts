// Badge System — Contributor Recognition and Remix Lineage (Remix-Safe)
// Purpose: Recognizes contributors with badges based on their contributions and remix lineage
// Schema: Pure JSON outputs, deterministic, engine-agnostic

export type BadgeType = 
  | 'Remix Pioneer' 
  | 'Asset Auditor' 
  | 'Scenario Designer' 
  | 'Theme Stylist' 
  | 'Debug Master';

export type BadgeCriteria = {
  remixDepth: number;        // Number of remix generations
  assetValidation: number;    // Number of assets validated
  scenarioCreation: number;   // Number of scenarios created
  themeContributions: number; // Number of themes contributed
  debugContributions: number; // Number of debug features added
};

export type Badge = {
  id: string;
  type: BadgeType;
  contributorId: string;
  timestamp: string;
  sourceZone: string;
  criteria: BadgeCriteria;
  metadata: {
    remixLineage: string[];
    contributorNotes?: string;
    badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    achievementDate: string;
  };
};

export type BadgeAssignment = {
  contributorId: string;
  badgeType: BadgeType;
  sourceZone: string;
  criteria: Partial<BadgeCriteria>;
  notes?: string;
};

export type BadgeDisplayOptions = {
  remix?: boolean;
  debug?: boolean;
  credits?: boolean;
  theme?: 'neon' | 'forest' | 'cosmic';
  overlay?: boolean;
  tooltip?: boolean;
};

export type BadgeSystemState = {
  badges: Map<string, Badge>;
  contributors: Map<string, string[]>; // contributorId -> badgeIds[]
  assignments: Map<string, BadgeAssignment[]>;
  displaySettings: BadgeDisplayOptions;
};

export class BadgeSystem {
  private state: BadgeSystemState;

  constructor() {
    this.state = {
      badges: new Map(),
      contributors: new Map(),
      assignments: new Map(),
      displaySettings: {
        remix: false,  // Don't filter by remix by default
        debug: false,  // Don't filter by debug by default
        credits: true,
        theme: 'neon',
        overlay: true,
        tooltip: true
      }
    };
  }

  // Badge Generation
  generateBadge(assignment: BadgeAssignment): Badge {
    const badgeId = `${assignment.contributorId}_${assignment.badgeType}_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Calculate badge level based on criteria
    const totalScore = this.calculateCriteriaScore(assignment.criteria);
    const badgeLevel = this.determineBadgeLevel(totalScore);
    
    // Generate remix lineage
    const remixLineage = this.generateRemixLineage(assignment.sourceZone);
    
    const badge: Badge = {
      id: badgeId,
      type: assignment.badgeType,
      contributorId: assignment.contributorId,
      timestamp,
      sourceZone: assignment.sourceZone,
      criteria: this.normalizeCriteria(assignment.criteria),
      metadata: {
        remixLineage,
        contributorNotes: assignment.notes,
        badgeLevel,
        achievementDate: timestamp
      }
    };

    return badge;
  }

  // Badge Assignment
  assignBadge(assignment: BadgeAssignment): Badge {
    const badge = this.generateBadge(assignment);
    
    // Store badge
    this.state.badges.set(badge.id, badge);
    
    // Update contributor mapping
    if (!this.state.contributors.has(assignment.contributorId)) {
      this.state.contributors.set(assignment.contributorId, []);
    }
    this.state.contributors.get(assignment.contributorId)!.push(badge.id);
    
    // Store assignment
    if (!this.state.assignments.has(assignment.contributorId)) {
      this.state.assignments.set(assignment.contributorId, []);
    }
    this.state.assignments.get(assignment.contributorId)!.push(assignment);
    
    return badge;
  }

  // Badge Display
  displayBadges(contributorId?: string, options: BadgeDisplayOptions = {}): Badge[] {
    const displayOptions = { ...this.state.displaySettings, ...options };
    let badges: Badge[] = [];
    
    if (contributorId) {
      // Display badges for specific contributor
      const contributorBadgeIds = this.state.contributors.get(contributorId) || [];
      badges = contributorBadgeIds.map(id => this.state.badges.get(id)!);
    } else {
      // Display all badges
      badges = Array.from(this.state.badges.values());
    }
    
    // Filter based on display options
    if (displayOptions.remix !== undefined) {
      badges = badges.filter(badge => 
        displayOptions.remix ? badge.metadata.remixLineage.length > 0 : true
      );
    }
    
    if (displayOptions.debug !== undefined) {
      badges = badges.filter(badge => 
        displayOptions.debug ? badge.type === 'Debug Master' : true
      );
    }
    
    return badges;
  }

  // Badge Management
  getBadge(badgeId: string): Badge | undefined {
    return this.state.badges.get(badgeId);
  }

  getContributorBadges(contributorId: string): Badge[] {
    const badgeIds = this.state.contributors.get(contributorId) || [];
    return badgeIds.map(id => this.state.badges.get(id)!);
  }

  getBadgesByType(badgeType: BadgeType): Badge[] {
    return Array.from(this.state.badges.values())
      .filter(badge => badge.type === badgeType);
  }

  // Criteria Calculation
  private calculateCriteriaScore(criteria: Partial<BadgeCriteria>): number {
    let score = 0;
    score += (criteria.remixDepth || 0) * 10;
    score += (criteria.assetValidation || 0) * 5;
    score += (criteria.scenarioCreation || 0) * 8;
    score += (criteria.themeContributions || 0) * 6;
    score += (criteria.debugContributions || 0) * 4;
    return score;
  }

  private determineBadgeLevel(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (score >= 100) return 'Platinum';
    if (score >= 75) return 'Gold';
    if (score >= 50) return 'Silver';
    if (score >= 25) return 'Bronze';
    return 'Bronze';
  }

  private normalizeCriteria(criteria: Partial<BadgeCriteria>): BadgeCriteria {
    return {
      remixDepth: criteria.remixDepth || 0,
      assetValidation: criteria.assetValidation || 0,
      scenarioCreation: criteria.scenarioCreation || 0,
      themeContributions: criteria.themeContributions || 0,
      debugContributions: criteria.debugContributions || 0
    };
  }

  private generateRemixLineage(sourceZone: string): string[] {
    // Generate deterministic remix lineage based on source zone
    const lineageMap: Record<string, string[]> = {
      'overlink_pure': ['MIFF Framework', 'OverlinkPure Zone'],
      'neon_grid': ['MIFF Framework', 'OverlinkThemes', 'NeonGrid Theme'],
      'forest_glade': ['MIFF Framework', 'OverlinkThemes', 'ForestGlade Theme'],
      'cosmic_void': ['MIFF Framework', 'OverlinkThemes', 'CosmicVoid Theme'],
      'remix_lab': ['MIFF Framework', 'RemixLineageTracker'],
      'audio_manager': ['MIFF Framework', 'AudioManager', 'Theme Audio']
    };
    
    return lineageMap[sourceZone] || ['MIFF Framework', sourceZone];
  }

  // Display Settings
  updateDisplaySettings(settings: Partial<BadgeDisplayOptions>): void {
    this.state.displaySettings = { ...this.state.displaySettings, ...settings };
  }

  getDisplaySettings(): BadgeDisplayOptions {
    return { ...this.state.displaySettings };
  }

  // State Management
  exportState(): any {
    return {
      badges: Array.from(this.state.badges.entries()),
      contributors: Array.from(this.state.contributors.entries()),
      assignments: Array.from(this.state.assignments.entries()),
      displaySettings: this.state.displaySettings
    };
  }

  importState(state: any): void {
    if (state.badges) this.state.badges = new Map(state.badges);
    if (state.contributors) this.state.contributors = new Map(state.contributors);
    if (state.assignments) this.state.assignments = new Map(state.assignments);
    if (state.displaySettings) this.state.displaySettings = { ...state.displaySettings };
  }

  // Utility Functions
  getBadgeCount(): number {
    return this.state.badges.size;
  }

  getContributorCount(): number {
    return this.state.contributors.size;
  }

  getBadgeTypeCount(badgeType: BadgeType): number {
    return this.getBadgesByType(badgeType).length;
  }

  // CLI Preview
  getCLIPreview(contributorId?: string): string {
    let output = '=== Badge System Status ===\n';
    output += `Total Badges: ${this.getBadgeCount()}\n`;
    output += `Total Contributors: ${this.getContributorCount()}\n\n`;
    
    if (contributorId) {
      const badges = this.getContributorBadges(contributorId);
      output += `=== Contributor: ${contributorId} ===\n`;
      output += `Badges: ${badges.length}\n`;
      badges.forEach(badge => {
        output += `  ${badge.type} (${badge.metadata.badgeLevel}) - ${badge.timestamp}\n`;
        output += `    Source: ${badge.sourceZone}\n`;
        output += `    Lineage: ${badge.metadata.remixLineage.join(' → ')}\n`;
      });
    } else {
      output += '=== Badge Types ===\n';
      const types: BadgeType[] = ['Remix Pioneer', 'Asset Auditor', 'Scenario Designer', 'Theme Stylist', 'Debug Master'];
      types.forEach(type => {
        output += `${type}: ${this.getBadgeTypeCount(type)}\n`;
      });
    }
    
    return output;
  }
}