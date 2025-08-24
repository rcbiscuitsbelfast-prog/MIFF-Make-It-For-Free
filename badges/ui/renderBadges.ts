// Badge UI Renderer — Modular Badge Display System (Remix-Safe)
// Purpose: Renders badges with theme alignment and display options
// Schema: Pure JSON outputs, deterministic, engine-agnostic

import { Badge, BadgeDisplayOptions, BadgeType } from '../index';

export type BadgeIcon = {
  id: string;
  symbol: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  size: number;
};

export type BadgeTooltip = {
  title: string;
  description: string;
  criteria: string[];
  lineage: string[];
  notes?: string;
};

export type BadgeOverlay = {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  badges: Badge[];
  theme: 'neon' | 'forest' | 'cosmic';
  visible: boolean;
};

export type BadgeRendererOptions = {
  theme: 'neon' | 'forest' | 'cosmic';
  size: 'small' | 'medium' | 'large';
  showTooltips: boolean;
  showOverlay: boolean;
  animation: boolean;
};

export class BadgeRenderer {
  private themeStyles: Map<string, any>;
  private badgeIcons: Map<BadgeType, BadgeIcon>;

  constructor() {
    this.themeStyles = new Map();
    this.badgeIcons = new Map();
    this.initializeThemeStyles();
    this.initializeBadgeIcons();
  }

  // Theme Style Initialization
  private initializeThemeStyles(): void {
    this.themeStyles.set('neon', {
      primary: '#00ffff',
      secondary: '#ff00ff',
      background: '#000000',
      border: '#00ff00',
      text: '#ffffff',
      glow: '#00ffff',
      shadow: '#0000ff'
    });

    this.themeStyles.set('forest', {
      primary: '#90ee90',
      secondary: '#228b22',
      background: '#f0f8f0',
      border: '#006400',
      text: '#2f4f2f',
      glow: '#32cd32',
      shadow: '#228b22'
    });

    this.themeStyles.set('cosmic', {
      primary: '#9370db',
      secondary: '#4b0082',
      background: '#0a0a0a',
      border: '#8a2be2',
      text: '#e6e6fa',
      glow: '#9932cc',
      shadow: '#4b0082'
    });
  }

  // Badge Icon Initialization
  private initializeBadgeIcons(): void {
    this.badgeIcons.set('Remix Pioneer', {
      id: 'remix_pioneer',
      symbol: '⚡',
      color: '#ffd700',
      backgroundColor: '#ff4500',
      borderColor: '#ff8c00',
      size: 24
    });

    this.badgeIcons.set('Asset Auditor', {
      id: 'asset_auditor',
      symbol: '🔍',
      color: '#00bfff',
      backgroundColor: '#4169e1',
      borderColor: '#1e90ff',
      size: 24
    });

    this.badgeIcons.set('Scenario Designer', {
      id: 'scenario_designer',
      symbol: '🎬',
      color: '#ff69b4',
      backgroundColor: '#da70d6',
      borderColor: '#c71585',
      size: 24
    });

    this.badgeIcons.set('Theme Stylist', {
      id: 'theme_stylist',
      symbol: '🎨',
      color: '#32cd32',
      backgroundColor: '#228b22',
      borderColor: '#006400',
      size: 24
    });

    this.badgeIcons.set('Debug Master', {
      id: 'debug_master',
      symbol: '🐛',
      color: '#ff6347',
      backgroundColor: '#dc143c',
      borderColor: '#b22222',
      size: 24
    });
  }

  // Badge Icon Rendering
  renderBadgeIcon(badge: Badge, options: BadgeRendererOptions): BadgeIcon {
    const baseIcon = this.badgeIcons.get(badge.type);
    if (!baseIcon) {
      throw new Error(`Unknown badge type: ${badge.type}`);
    }

    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    // Scale size based on options
    const sizeMultiplier = options.size === 'small' ? 0.75 : options.size === 'large' ? 1.5 : 1.0;
    const scaledSize = Math.round(baseIcon.size * sizeMultiplier);

    return {
      ...baseIcon,
      size: scaledSize,
      backgroundColor: this.blendColors(baseIcon.backgroundColor, themeStyle.background, 0.3),
      borderColor: this.blendColors(baseIcon.borderColor, themeStyle.border, 0.5)
    };
  }

  // Badge Tooltip Rendering
  renderBadgeTooltip(badge: Badge, options: BadgeRendererOptions): BadgeTooltip {
    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    const criteria = [
      `Remix Depth: ${badge.criteria.remixDepth}`,
      `Assets Validated: ${badge.criteria.assetValidation}`,
      `Scenarios Created: ${badge.criteria.scenarioCreation}`,
      `Themes Contributed: ${badge.criteria.themeContributions}`,
      `Debug Features: ${badge.criteria.debugContributions}`
    ];

    return {
      title: `${badge.type} (${badge.metadata.badgeLevel})`,
      description: `Awarded to ${badge.contributorId} for contributions to ${badge.sourceZone}`,
      criteria,
      lineage: badge.metadata.remixLineage,
      notes: badge.metadata.contributorNotes
    };
  }

  // Badge Overlay Rendering
  renderBadgeOverlay(badges: Badge[], options: BadgeRendererOptions): BadgeOverlay {
    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    return {
      position: 'top-right',
      badges: badges.slice(0, 5), // Limit to 5 badges for overlay
      theme: options.theme,
      visible: options.showOverlay
    };
  }

  // Contributor Badge Display
  renderContributorBadges(contributorId: string, badges: Badge[], options: BadgeRendererOptions): any {
    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    const renderedBadges = badges.map(badge => ({
      icon: this.renderBadgeIcon(badge, options),
      tooltip: options.showTooltips ? this.renderBadgeTooltip(badge, options) : null,
      metadata: {
        type: badge.type,
        level: badge.metadata.badgeLevel,
        timestamp: badge.timestamp,
        sourceZone: badge.sourceZone
      }
    }));

    return {
      contributorId,
      badgeCount: badges.length,
      badges: renderedBadges,
      theme: options.theme,
      style: {
        primary: themeStyle.primary,
        background: themeStyle.background,
        border: themeStyle.border,
        text: themeStyle.text
      }
    };
  }

  // Badge Grid Layout
  renderBadgeGrid(badges: Badge[], options: BadgeRendererOptions): any {
    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    // Group badges by type
    const groupedBadges = new Map<BadgeType, Badge[]>();
    badges.forEach(badge => {
      if (!groupedBadges.has(badge.type)) {
        groupedBadges.set(badge.type, []);
      }
      groupedBadges.get(badge.type)!.push(badge);
    });

    const grid = Array.from(groupedBadges.entries()).map(([type, typeBadges]) => ({
      type,
      count: typeBadges.length,
      badges: typeBadges.map(badge => ({
        icon: this.renderBadgeIcon(badge, options),
        tooltip: options.showTooltips ? this.renderBadgeTooltip(badge, options) : null,
        metadata: {
          contributorId: badge.contributorId,
          level: badge.metadata.badgeLevel,
          timestamp: badge.timestamp,
          sourceZone: badge.sourceZone
        }
      }))
    }));

    return {
      totalBadges: badges.length,
      groupedBadges: grid,
      theme: options.theme,
      style: {
        primary: themeStyle.primary,
        secondary: themeStyle.secondary,
        background: themeStyle.background,
        border: themeStyle.border,
        text: themeStyle.text
      }
    };
  }

  // Credits Overlay Rendering
  renderCreditsOverlay(contributors: Map<string, Badge[]>, options: BadgeRendererOptions): any {
    const themeStyle = this.themeStyles.get(options.theme);
    if (!themeStyle) {
      throw new Error(`Unknown theme: ${options.theme}`);
    }

    const contributorList = Array.from(contributors.entries()).map(([contributorId, badges]) => ({
      contributorId,
      badgeCount: badges.length,
      topBadge: badges.reduce((top, current) => 
        this.getBadgeScore(current) > this.getBadgeScore(top) ? current : top
      ),
      recentBadge: badges.reduce((recent, current) => 
        new Date(current.timestamp) > new Date(recent.timestamp) ? current : recent
      )
    }));

    return {
      totalContributors: contributors.size,
      contributors: contributorList,
      theme: options.theme,
      style: {
        primary: themeStyle.primary,
        secondary: themeStyle.secondary,
        background: themeStyle.background,
        border: themeStyle.border,
        text: themeStyle.text,
        glow: themeStyle.glow,
        shadow: themeStyle.shadow
      }
    };
  }

  // Utility Functions
  private blendColors(color1: string, color2: string, ratio: number): string {
    // Simple color blending for theme integration
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private getBadgeScore(badge: Badge): number {
    const levelScores = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4 };
    return levelScores[badge.metadata.badgeLevel] || 0;
  }

  // Theme Management
  getAvailableThemes(): string[] {
    return Array.from(this.themeStyles.keys());
  }

  getThemeStyle(theme: string): any {
    return this.themeStyles.get(theme);
  }

  // CLI Preview
  getCLIPreview(badges: Badge[], options: BadgeRendererOptions): string {
    let output = '=== Badge Renderer Preview ===\n';
    output += `Theme: ${options.theme}\n`;
    output += `Size: ${options.size}\n`;
    output += `Tooltips: ${options.showTooltips ? 'Yes' : 'No'}\n`;
    output += `Overlay: ${options.showOverlay ? 'Yes' : 'No'}\n\n`;
    
    output += `=== Badge Icons ===\n`;
    badges.forEach(badge => {
      const icon = this.renderBadgeIcon(badge, options);
      output += `${badge.type}: ${icon.symbol} (${icon.size}px)\n`;
      output += `  Colors: ${icon.color} / ${icon.backgroundColor} / ${icon.borderColor}\n`;
    });
    
    output += `\n=== Theme Styles ===\n`;
    const themeStyle = this.themeStyles.get(options.theme);
    if (themeStyle) {
      Object.entries(themeStyle).forEach(([key, value]) => {
        output += `${key}: ${value}\n`;
      });
    }
    
    return output;
  }
}