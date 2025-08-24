import { BadgeSystem, BadgeType, BadgeAssignment } from './index';

describe('BadgeSystem', () => {
  let badgeSystem: BadgeSystem;

  beforeEach(() => {
    badgeSystem = new BadgeSystem();
  });



  describe('Badge Generation', () => {
    test('should generate badge with correct structure', () => {
      const assignment: BadgeAssignment = {
        contributorId: 'test_contributor',
        badgeType: 'Theme Stylist',
        sourceZone: 'test_zone',
        criteria: {
          remixDepth: 2,
          assetValidation: 10,
          scenarioCreation: 5,
          themeContributions: 8,
          debugContributions: 3
        },
        notes: 'Test contribution'
      };

      const badge = badgeSystem.generateBadge(assignment);

      expect(badge.id).toContain('test_contributor_Theme Stylist');
      expect(badge.type).toBe('Theme Stylist');
      expect(badge.contributorId).toBe('test_contributor');
      expect(badge.sourceZone).toBe('test_zone');
      expect(badge.criteria.remixDepth).toBe(2);
      expect(badge.metadata.contributorNotes).toBe('Test contribution');
      expect(badge.metadata.remixLineage).toBeDefined();
    });

    test('should calculate correct badge level based on criteria', () => {
      const highScoreAssignment: BadgeAssignment = {
        contributorId: 'high_score',
        badgeType: 'Remix Pioneer',
        sourceZone: 'test_zone',
        criteria: {
          remixDepth: 5,
          assetValidation: 50,
          scenarioCreation: 20,
          themeContributions: 10,
          debugContributions: 15
        }
      };

      const badge = badgeSystem.generateBadge(highScoreAssignment);
      expect(badge.metadata.badgeLevel).toBe('Platinum');

      const lowScoreAssignment: BadgeAssignment = {
        contributorId: 'low_score',
        badgeType: 'Debug Master',
        sourceZone: 'test_zone',
        criteria: {
          remixDepth: 1,
          assetValidation: 5,
          scenarioCreation: 2,
          themeContributions: 1,
          debugContributions: 3
        }
      };

      const lowBadge = badgeSystem.generateBadge(lowScoreAssignment);
      // Score: 1*10 + 5*5 + 2*8 + 1*6 + 3*4 = 10 + 25 + 16 + 6 + 12 = 69 (Silver)
      expect(lowBadge.metadata.badgeLevel).toBe('Silver');
    });

    test('should generate remix lineage based on source zone', () => {
      const assignment: BadgeAssignment = {
        contributorId: 'test',
        badgeType: 'Theme Stylist',
        sourceZone: 'overlink_pure',
        criteria: { remixDepth: 1 }
      };

      const badge = badgeSystem.generateBadge(assignment);
      expect(badge.metadata.remixLineage).toEqual(['MIFF Framework', 'OverlinkPure Zone']);
    });
  });

  describe('Badge Assignment', () => {
    test('should assign badge and update contributor mapping', () => {
      const assignment: BadgeAssignment = {
        contributorId: 'new_contributor',
        badgeType: 'Asset Auditor',
        sourceZone: 'test_zone',
        criteria: { assetValidation: 25 }
      };

      const badge = badgeSystem.assignBadge(assignment);

      expect(badgeSystem.getBadge(badge.id)).toBeDefined();
      expect(badgeSystem.getContributorBadges('new_contributor')).toHaveLength(1);
      expect(badgeSystem.getContributorCount()).toBe(1);
    });

    test('should assign multiple badges to same contributor', () => {
      const assignment1: BadgeAssignment = {
        contributorId: 'multi_badge',
        badgeType: 'Theme Stylist',
        sourceZone: 'zone1',
        criteria: { themeContributions: 5 }
      };

      const assignment2: BadgeAssignment = {
        contributorId: 'multi_badge',
        badgeType: 'Scenario Designer',
        sourceZone: 'zone2',
        criteria: { scenarioCreation: 8 }
      };

      badgeSystem.assignBadge(assignment1);
      badgeSystem.assignBadge(assignment2);

      const badges = badgeSystem.getContributorBadges('multi_badge');
      expect(badges).toHaveLength(2);
      expect(badges.map(b => b.type)).toContain('Theme Stylist');
      expect(badges.map(b => b.type)).toContain('Scenario Designer');
    });
  });

  describe('Badge Display', () => {
    beforeEach(() => {
      // Setup test badges
      const assignments = [
        {
          contributorId: 'contributor1',
          badgeType: 'Remix Pioneer' as BadgeType,
          sourceZone: 'zone1',
          criteria: { remixDepth: 3, assetValidation: 20 }
        },
        {
          contributorId: 'contributor2',
          badgeType: 'Debug Master' as BadgeType,
          sourceZone: 'zone2',
          criteria: { debugContributions: 15 }
        },
        {
          contributorId: 'contributor1',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone3',
          criteria: { themeContributions: 10 }
        }
      ];

      // Clear any existing state and assign new badges
      badgeSystem = new BadgeSystem();
      assignments.forEach(assignment => {
        badgeSystem.assignBadge(assignment);
      });
    });

    test('should display all badges by default', () => {
      const badges = badgeSystem.displayBadges();
      expect(badges).toHaveLength(3);
    });

    test('should display badges for specific contributor', () => {
      const badges = badgeSystem.displayBadges('contributor1');
      expect(badges).toHaveLength(2);
      expect(badges.every(b => b.contributorId === 'contributor1')).toBe(true);
    });

    test('should filter badges by remix option', () => {
      const badges = badgeSystem.displayBadges(undefined, { remix: true });
      expect(badges.every(b => b.metadata.remixLineage.length > 0)).toBe(true);
    });

    test('should filter badges by debug option', () => {
      const badges = badgeSystem.displayBadges(undefined, { debug: true });
      expect(badges.every(b => b.type === 'Debug Master')).toBe(true);
    });
  });

  describe('Badge Management', () => {
    test('should retrieve badge by ID', () => {
      const assignment: BadgeAssignment = {
        contributorId: 'test',
        badgeType: 'Theme Stylist',
        sourceZone: 'test_zone',
        criteria: { themeContributions: 5 }
      };

      const badge = badgeSystem.assignBadge(assignment);
      const retrievedBadge = badgeSystem.getBadge(badge.id);

      expect(retrievedBadge).toBeDefined();
      expect(retrievedBadge!.id).toBe(badge.id);
    });

    test('should get badges by type', () => {
      const assignments = [
        {
          contributorId: 'contributor1',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone1',
          criteria: { themeContributions: 5 }
        },
        {
          contributorId: 'contributor2',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone2',
          criteria: { themeContributions: 8 }
        }
      ];

      assignments.forEach(assignment => {
        badgeSystem.assignBadge(assignment);
      });

      const themeStylistBadges = badgeSystem.getBadgesByType('Theme Stylist');
      expect(themeStylistBadges).toHaveLength(2);
      expect(themeStylistBadges.every(b => b.type === 'Theme Stylist')).toBe(true);
    });
  });

  describe('Display Settings', () => {
    test('should update display settings', () => {
      const newSettings = {
        theme: 'forest' as const,
        overlay: false,
        tooltip: false
      };

      badgeSystem.updateDisplaySettings(newSettings);
      const currentSettings = badgeSystem.getDisplaySettings();

      expect(currentSettings.theme).toBe('forest');
      expect(currentSettings.overlay).toBe(false);
      expect(currentSettings.tooltip).toBe(false);
    });

    test('should preserve existing settings when updating', () => {
      const originalSettings = badgeSystem.getDisplaySettings();
      expect(originalSettings.remix).toBe(false);

      badgeSystem.updateDisplaySettings({ theme: 'cosmic' as const });
      const updatedSettings = badgeSystem.getDisplaySettings();

      expect(updatedSettings.theme).toBe('cosmic');
      expect(updatedSettings.remix).toBe(false); // Should be preserved
    });
  });

  describe('State Management', () => {
    test('should export and import state correctly', () => {
      // Create some badges
      const assignment: BadgeAssignment = {
        contributorId: 'test_contributor',
        badgeType: 'Asset Auditor',
        sourceZone: 'test_zone',
        criteria: { assetValidation: 30 }
      };

      badgeSystem.assignBadge(assignment);

      // Export state
      const exportedState = badgeSystem.exportState();
      expect(exportedState.badges).toHaveLength(1);
      expect(exportedState.contributors).toHaveLength(1);

      // Create new system and import state
      const newBadgeSystem = new BadgeSystem();
      newBadgeSystem.importState(exportedState);

      expect(newBadgeSystem.getBadgeCount()).toBe(1);
      expect(newBadgeSystem.getContributorCount()).toBe(1);
    });
  });

  describe('Utility Functions', () => {
    test('should count badges correctly', () => {
      expect(badgeSystem.getBadgeCount()).toBe(0);

      const assignment: BadgeAssignment = {
        contributorId: 'test',
        badgeType: 'Theme Stylist',
        sourceZone: 'test_zone',
        criteria: { themeContributions: 5 }
      };

      badgeSystem.assignBadge(assignment);
      expect(badgeSystem.getBadgeCount()).toBe(1);
    });

    test('should count contributors correctly', () => {
      expect(badgeSystem.getContributorCount()).toBe(0);

      const assignment: BadgeAssignment = {
        contributorId: 'new_contributor',
        badgeType: 'Debug Master',
        sourceZone: 'test_zone',
        criteria: { debugContributions: 10 }
      };

      badgeSystem.assignBadge(assignment);
      expect(badgeSystem.getContributorCount()).toBe(1);
    });

    test('should count badges by type', () => {
      const assignments = [
        {
          contributorId: 'contributor1',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone1',
          criteria: { themeContributions: 5 }
        },
        {
          contributorId: 'contributor2',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone2',
          criteria: { themeContributions: 8 }
        }
      ];

      assignments.forEach(assignment => {
        badgeSystem.assignBadge(assignment);
      });

      expect(badgeSystem.getBadgeTypeCount('Theme Stylist')).toBe(2);
      expect(badgeSystem.getBadgeTypeCount('Debug Master')).toBe(0);
    });
  });

  describe('CLI Preview', () => {
    test('should generate general CLI preview', () => {
      const preview = badgeSystem.getCLIPreview();
      
      expect(preview).toContain('=== Badge System Status ===');
      expect(preview).toContain('Total Badges: 0');
      expect(preview).toContain('Total Contributors: 0');
      expect(preview).toContain('=== Badge Types ===');
    });

    test('should generate contributor-specific CLI preview', () => {
      const assignment: BadgeAssignment = {
        contributorId: 'test_contributor',
        badgeType: 'Remix Pioneer',
        sourceZone: 'test_zone',
        criteria: { remixDepth: 3, assetValidation: 20 }
      };

      badgeSystem.assignBadge(assignment);
      const preview = badgeSystem.getCLIPreview('test_contributor');

      expect(preview).toContain('=== Contributor: test_contributor ===');
      expect(preview).toContain('Badges: 1');
      expect(preview).toContain('Remix Pioneer');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete badge workflow', () => {
      // 1. Generate badge
      const assignment: BadgeAssignment = {
        contributorId: 'workflow_test',
        badgeType: 'Scenario Designer',
        sourceZone: 'test_zone',
        criteria: {
          remixDepth: 2,
          assetValidation: 15,
          scenarioCreation: 12,
          themeContributions: 6,
          debugContributions: 4
        },
        notes: 'Comprehensive scenario design work'
      };

      // 2. Assign badge
      const badge = badgeSystem.assignBadge(assignment);

      // 3. Verify badge storage
      expect(badgeSystem.getBadge(badge.id)).toBeDefined();

      // 4. Verify contributor mapping
      const contributorBadges = badgeSystem.getContributorBadges('workflow_test');
      expect(contributorBadges).toHaveLength(1);

      // 5. Verify display filtering
      const displayedBadges = badgeSystem.displayBadges('workflow_test', { remix: true });
      expect(displayedBadges).toHaveLength(1);

      // 6. Verify CLI preview
      const preview = badgeSystem.getCLIPreview('workflow_test');
      expect(preview).toContain('workflow_test');
      expect(preview).toContain('Scenario Designer');
    });

    test('should handle multiple contributors and badge types', () => {
      const assignments = [
        {
          contributorId: 'contributor_a',
          badgeType: 'Theme Stylist' as BadgeType,
          sourceZone: 'zone_a',
          criteria: { themeContributions: 10 }
        },
        {
          contributorId: 'contributor_b',
          badgeType: 'Debug Master' as BadgeType,
          sourceZone: 'zone_b',
          criteria: { debugContributions: 15 }
        },
        {
          contributorId: 'contributor_a',
          badgeType: 'Asset Auditor' as BadgeType,
          sourceZone: 'zone_c',
          criteria: { assetValidation: 25 }
        }
      ];

      assignments.forEach(assignment => {
        badgeSystem.assignBadge(assignment);
      });

      // Verify counts
      expect(badgeSystem.getBadgeCount()).toBe(3);
      expect(badgeSystem.getContributorCount()).toBe(2);

      // Verify contributor badges
      const contributorABadges = badgeSystem.getContributorBadges('contributor_a');
      expect(contributorABadges).toHaveLength(2);

      const contributorBBadges = badgeSystem.getContributorBadges('contributor_b');
      expect(contributorBBadges).toHaveLength(1);

      // Verify badge type counts
      expect(badgeSystem.getBadgeTypeCount('Theme Stylist')).toBe(1);
      expect(badgeSystem.getBadgeTypeCount('Debug Master')).toBe(1);
      expect(badgeSystem.getBadgeTypeCount('Asset Auditor')).toBe(1);
    });
  });
});