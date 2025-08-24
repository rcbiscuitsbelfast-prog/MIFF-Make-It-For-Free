// Credits Renderer — Contributor Recognition and Badge Display (Remix-Safe)
// Purpose: Renders credits with badge integration and theme alignment
// Schema: Pure JSON outputs, deterministic, engine-agnostic

import { Badge, BadgeSystem } from '../index';
import { BadgeRenderer, BadgeRendererOptions } from './renderBadges';

export type CreditsSection = {
  title: string;
  contributors: ContributorCredit[];
  badges: Badge[];
};

export type ContributorCredit = {
  id: string;
  name: string;
  role: string;
  contributions: string[];
  badges: Badge[];
  remixLineage: string[];
};

export type CreditsLayout = {
  sections: CreditsSection[];
  theme: 'neon' | 'forest' | 'cosmic';
  style: 'compact' | 'detailed' | 'badge-focused';
  showBadges: boolean;
  showLineage: boolean;
  showContributions: boolean;
};

export type CreditsRendererOptions = {
  theme: 'neon' | 'forest' | 'cosmic';
  style: 'compact' | 'detailed' | 'badge-focused';
  showBadges: boolean;
  showLineage: boolean;
  showContributions: boolean;
  animation: boolean;
  overlay: boolean;
};

export class CreditsRenderer {
  private badgeSystem: BadgeSystem;
  private badgeRenderer: BadgeRenderer;

  constructor(badgeSystem: BadgeSystem) {
    this.badgeSystem = badgeSystem;
    this.badgeRenderer = new BadgeRenderer();
  }

  // Credits Generation
  generateCredits(options: CreditsRendererOptions): CreditsLayout {
    const allBadges = Array.from(this.badgeSystem['state'].badges.values());
    const contributors = this.badgeSystem['state'].contributors;
    
    // Group contributors by role/contribution type
    const sections = this.createCreditsSections(allBadges, contributors, options);
    
    return {
      sections,
      theme: options.theme,
      style: options.style,
      showBadges: options.showBadges,
      showLineage: options.showLineage,
      showContributions: options.showContributions
    };
  }

  // Section Creation
  private createCreditsSections(
    allBadges: Badge[], 
    contributors: Map<string, string[]>, 
    options: CreditsRendererOptions
  ): CreditsSection[] {
    const sections: CreditsSection[] = [];
    
    // Core Framework Section
    const coreBadges = allBadges.filter(badge => 
      badge.sourceZone === 'miff_framework'
    );
    if (coreBadges.length > 0) {
      sections.push({
        title: 'Core Framework',
        contributors: this.createContributorCredits(coreBadges, contributors, options),
        badges: coreBadges
      });
    }
    
    // Zone Development Section
    const zoneBadges = allBadges.filter(badge => 
      badge.sourceZone === 'overlink_pure'
    );
    if (zoneBadges.length > 0) {
      sections.push({
        title: 'Zone Development',
        contributors: this.createContributorCredits(zoneBadges, contributors, options),
        badges: zoneBadges
      });
    }
    
    // Theme Development Section
    const themeBadges = allBadges.filter(badge => 
      ['neon_grid', 'forest_glade', 'cosmic_void'].includes(badge.sourceZone)
    );
    if (themeBadges.length > 0) {
      sections.push({
        title: 'Theme Development',
        contributors: this.createContributorCredits(themeBadges, contributors, options),
        badges: themeBadges
      });
    }
    
    // Audio System Section
    const audioBadges = allBadges.filter(badge => 
      badge.sourceZone === 'audio_manager'
    );
    if (audioBadges.length > 0) {
      sections.push({
        title: 'Audio System',
        contributors: this.createContributorCredits(audioBadges, contributors, options),
        badges: audioBadges
      });
    }
    
    // Remix Lineage Section
    const lineageBadges = allBadges.filter(badge => 
      badge.sourceZone === 'remix_lab'
    );
    if (lineageBadges.length > 0) {
      sections.push({
        title: 'Remix Lineage',
        contributors: this.createContributorCredits(lineageBadges, contributors, options),
        badges: lineageBadges
      });
    }
    
    return sections;
  }

  // Contributor Credits Creation
  private createContributorCredits(
    badges: Badge[], 
    contributors: Map<string, string[]>, 
    options: CreditsRendererOptions
  ): ContributorCredit[] {
    const contributorMap = new Map<string, ContributorCredit>();
    
    badges.forEach(badge => {
      if (!contributorMap.has(badge.contributorId)) {
        contributorMap.set(badge.contributorId, {
          id: badge.contributorId,
          name: this.getContributorName(badge.contributorId),
          role: this.getContributorRole(badge.contributorId),
          contributions: [],
          badges: [],
          remixLineage: []
        });
      }
      
      const contributor = contributorMap.get(badge.contributorId)!;
      contributor.badges.push(badge);
      
      // Add contribution based on badge type
      if (options.showContributions) {
        contributor.contributions.push(`${badge.type} (${badge.metadata.badgeLevel})`);
      }
      
      // Add remix lineage
      if (options.showLineage) {
        contributor.remixLineage = badge.metadata.remixLineage;
      }
    });
    
    return Array.from(contributorMap.values());
  }

  // Contributor Information
  private getContributorName(contributorId: string): string {
    const nameMap: Record<string, string> = {
      'miff_team': 'MIFF Framework Team',
      'overlink_contributor': 'Overlink Zone Contributor',
      'audio_contributor': 'Audio System Contributor',
      'lineage_tracker': 'Lineage Tracking Contributor',
      'debug_master': 'Debug System Contributor'
    };
    return nameMap[contributorId] || contributorId;
  }

  private getContributorRole(contributorId: string): string {
    const roleMap: Record<string, string> = {
      'miff_team': 'Core Framework Developer',
      'overlink_contributor': 'Zone Developer',
      'audio_contributor': 'Audio Developer',
      'lineage_tracker': 'Data Developer',
      'debug_master': 'Debug Developer'
    };
    return roleMap[contributorId] || 'Contributor';
  }

  // Badge Integration
  renderCreditsWithBadges(options: CreditsRendererOptions): any {
    const credits = this.generateCredits(options);
    const badgeOptions: BadgeRendererOptions = {
      theme: options.theme,
      size: 'medium',
      showTooltips: true,
      showOverlay: options.overlay,
      animation: options.animation
    };
    
    // Render badges for each section
    const renderedSections = credits.sections.map(section => ({
      title: section.title,
      contributors: section.contributors.map(contributor => ({
        ...contributor,
        renderedBadges: this.badgeRenderer.renderContributorBadges(
          contributor.id, 
          contributor.badges, 
          badgeOptions
        )
      })),
      badgeGrid: this.badgeRenderer.renderBadgeGrid(section.badges, badgeOptions)
    }));
    
    return {
      credits: {
        ...credits,
        sections: renderedSections
      },
      badgeOptions,
      theme: options.theme,
      style: options.style
    };
  }

  // Compact Credits View
  renderCompactCredits(options: CreditsRendererOptions): any {
    const credits = this.generateCredits(options);
    
    return {
      type: 'compact',
      totalContributors: this.badgeSystem.getContributorCount(),
      totalBadges: this.badgeSystem.getBadgeCount(),
      topContributors: this.getTopContributors(credits.sections),
      theme: options.theme,
      style: options.style
    };
  }

  // Detailed Credits View
  renderDetailedCredits(options: CreditsRendererOptions): any {
    const credits = this.generateCredits(options);
    const badgeOptions: BadgeRendererOptions = {
      theme: options.theme,
      size: 'large',
      showTooltips: true,
      showOverlay: false,
      animation: false
    };
    
    return {
      type: 'detailed',
      sections: credits.sections.map(section => ({
        title: section.title,
        contributorCount: section.contributors.length,
        badgeCount: section.badges.length,
        contributors: section.contributors.map(contributor => ({
          ...contributor,
          badgeSummary: {
            count: contributor.badges.length,
            types: [...new Set(contributor.badges.map(b => b.type))],
            topLevel: contributor.badges.reduce((top, current) => 
              this.getBadgeLevelScore(current.metadata.badgeLevel) > this.getBadgeLevelScore(top.metadata.badgeLevel) ? current : top
            ).metadata.badgeLevel
          }
        })),
        badgeDetails: this.badgeRenderer.renderBadgeGrid(section.badges, badgeOptions)
      })),
      theme: options.theme,
      style: options.style
    };
  }

  // Badge-Focused Credits View
  renderBadgeFocusedCredits(options: CreditsRendererOptions): any {
    const credits = this.generateCredits(options);
    const badgeOptions: BadgeRendererOptions = {
      theme: options.theme,
      size: 'large',
      showTooltips: true,
      showOverlay: true,
      animation: true
    };
    
    // Group all badges by type
    const allBadges = credits.sections.flatMap(section => section.badges);
    const badgeGrid = this.badgeRenderer.renderBadgeGrid(allBadges, badgeOptions);
    
    // Create contributor badge mapping
    const contributorBadges = new Map<string, Badge[]>();
    allBadges.forEach(badge => {
      if (!contributorBadges.has(badge.contributorId)) {
        contributorBadges.set(badge.contributorId, []);
      }
      contributorBadges.set(badge.contributorId, [...contributorBadges.get(badge.contributorId)!, badge]);
    });
    
    const creditsOverlay = this.badgeRenderer.renderCreditsOverlay(contributorBadges, badgeOptions);
    
    return {
      type: 'badge-focused',
      badgeGrid,
      creditsOverlay,
      theme: options.theme,
      style: options.style,
      totalBadges: allBadges.length,
      totalContributors: contributorBadges.size
    };
  }

  // Utility Functions
  private getTopContributors(sections: CreditsSection[]): any[] {
    const contributorScores = new Map<string, number>();
    
    sections.forEach(section => {
      section.contributors.forEach(contributor => {
        const score = contributor.badges.reduce((total, badge) => 
          total + this.getBadgeLevelScore(badge.metadata.badgeLevel), 0
        );
        contributorScores.set(contributor.id, score);
      });
    });
    
    return Array.from(contributorScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([contributorId, score]) => ({
        contributorId,
        name: this.getContributorName(contributorId),
        score,
        badgeCount: this.badgeSystem.getContributorBadges(contributorId).length
      }));
  }

  private getBadgeLevelScore(level: string): number {
    const levelScores = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4 };
    return levelScores[level as keyof typeof levelScores] || 0;
  }

  // CLI Preview
  getCLIPreview(options: CreditsRendererOptions): string {
    let output = '=== Credits Renderer Preview ===\n';
    output += `Theme: ${options.theme}\n`;
    output += `Style: ${options.style}\n`;
    output += `Show Badges: ${options.showBadges}\n`;
    output += `Show Lineage: ${options.showLineage}\n`;
    output += `Show Contributions: ${options.showContributions}\n\n`;
    
    const credits = this.generateCredits(options);
    output += `=== Credits Sections ===\n`;
    credits.sections.forEach(section => {
      output += `${section.title}:\n`;
      output += `  Contributors: ${section.contributors.length}\n`;
      output += `  Badges: ${section.badges.length}\n`;
      section.contributors.forEach(contributor => {
        output += `    ${contributor.name} (${contributor.badges.length} badges)\n`;
      });
    });
    
    return output;
  }
}