/**
 * Integration Tests for XPLevelingPure
 *
 * Tests integration between XPLevelingPure and other MIFF modules:
 * - ProgressionPure (XP advancement)
 * - TeamsPure (team leveling)
 * - SpiritsPure (spirit progression)
 * - QuestsPure (quest rewards)
 * - ItemsPure (XP items and rewards)
 * - CombatPure (combat XP)
 *
 * @module XPLevelingPure/tests/integration
 * @version 1.0.0
 * @license MIT
 */

import { XPLevelingManager } from '../Manager';
import { CombatEngine } from '../../CombatPure';
import { TeamManager } from '../../TeamsPure';
import { SpiritInstance } from '../../SpiritsPure';

describe('XPLevelingPure Integration Tests', () => {
  let xpManager: XPLevelingManager;
  let combatEngine: CombatEngine;
  let teamManager: TeamManager;

  beforeEach(() => {
    xpManager = new XPLevelingManager();
    combatEngine = new CombatEngine();
    teamManager = new TeamManager();
  });

  describe('CombatPure Integration', () => {
    test('should award XP for combat victories', () => {
      // Create a combatant entity
      const entityResult = xpManager.createEntity('combatant_001', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate combat victory (would normally come from CombatPure)
      const xpReward = 150;
      const combatResult = xpManager.addXP('combatant_001', xpReward, 'combat_victory');
      expect(combatResult.status).toBe('ok');

      if (combatResult.result) {
        expect(combatResult.result.xp).toBeGreaterThanOrEqual(xpReward);
        expect(combatResult.result.totalXp).toBeGreaterThanOrEqual(xpReward);
      }
    });

    test('should handle multiple combat XP sources', () => {
      const entityResult = xpManager.createEntity('hero_001', 'standard', 5);
      expect(entityResult.status).toBe('ok');

      // Multiple combat encounters
      const combatScenarios = [
        { xp: 100, source: 'goblin_fight' },
        { xp: 250, source: 'orc_battle' },
        { xp: 75, source: 'skeleton_encounter' },
        { xp: 500, source: 'dragon_slaying' }
      ];

      let totalXp = 0;
      for (const scenario of combatScenarios) {
        totalXp += scenario.xp;
        const result = xpManager.addXP('hero_001', scenario.xp, scenario.source);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('hero_001');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.totalXp).toBe(totalXp);
      }
    });
  });

  describe('TeamsPure Integration', () => {
    test('should handle team-based XP distribution', () => {
      // Create team
      const team = teamManager.createTeam('adventure_team', 'Adventure Team');

      // Create team members with XP entities
      const memberIds = ['alice', 'bob', 'charlie'];
      for (const memberId of memberIds) {
        xpManager.createEntity(memberId, 'standard', 1);
        const spirit: SpiritInstance = {
          instanceId: memberId,
          name: `Spirit ${memberId}`,
          level: 1,
          speciesId: 'human',
          primaryType: 'normal',
          types: ['normal'],
          friendship: 50,
          syncLevel: 0,
          canEvolve: false,
          moves: ['tackle'],
          getEffectiveStats: () => ({ hp: 100, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 })
        };
        teamManager.addSpiritToTeam('adventure_team', spirit);
      }

      // Award team XP
      const teamXp = 300;
      for (const memberId of memberIds) {
        const result = xpManager.addXP(memberId, teamXp, 'team_quest');
        expect(result.status).toBe('ok');
      }

      // Check that all members received XP
      for (const memberId of memberIds) {
        const levelResult = xpManager.getLevel(memberId);
        expect(levelResult.status).toBe('ok');
        if (levelResult.result) {
          expect(levelResult.result.totalXp).toBe(teamXp);
        }
      }
    });

    test('should handle XP-based team synergies', () => {
      const team = teamManager.createTeam('synergy_team', 'Synergy Team');

      // Create members with different XP curves
      xpManager.createEntity('tank', 'slow', 1); // High HP, slow progression
      xpManager.createEntity('dps', 'standard', 1); // Balanced
      xpManager.createEntity('support', 'fast', 1); // Quick progression

      const spirits = ['tank', 'dps', 'support'].map((id, index) => ({
        instanceId: id,
        name: `Spirit ${id}`,
        level: 1,
        speciesId: id,
        primaryType: 'normal',
        types: ['normal'],
        friendship: 50,
        syncLevel: 0,
        canEvolve: false,
        moves: ['tackle'],
        getEffectiveStats: () => ({ hp: 100, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 })
      }));

      spirits.forEach(spirit => teamManager.addSpiritToTeam('synergy_team', spirit));

      // Award different XP amounts based on roles
      xpManager.addXP('tank', 400, 'tank_bonus'); // High XP for tank role
      xpManager.addXP('dps', 300, 'dps_standard'); // Standard XP
      xpManager.addXP('support', 200, 'support_bonus'); // Lower XP for support

      // Verify XP distribution
      const tankLevel = xpManager.getLevel('tank');
      const dpsLevel = xpManager.getLevel('dps');
      const supportLevel = xpManager.getLevel('support');

      expect(tankLevel.status).toBe('ok');
      expect(dpsLevel.status).toBe('ok');
      expect(supportLevel.status).toBe('ok');

      // Tank should have higher level due to slow curve + high XP
      if (tankLevel.result && dpsLevel.result && supportLevel.result) {
        expect(tankLevel.result.level).toBeGreaterThanOrEqual(dpsLevel.result.level);
        expect(dpsLevel.result.level).toBeGreaterThanOrEqual(supportLevel.result.level);
      }
    });
  });

  describe('ProgressionPure Integration', () => {
    test('should integrate with progression milestones', () => {
      const entityResult = xpManager.createEntity('progression_hero', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate progression through levels
      const progressionLevels = [5, 10, 15, 20, 25];
      let totalXp = 0;

      for (const targetLevel of progressionLevels) {
        // Calculate XP needed to reach level
        const currentLevel = xpManager.getLevel('progression_hero');
        if (currentLevel.result && currentLevel.result.level < targetLevel) {
          const xpNeeded = targetLevel * 100; // Simplified calculation
          totalXp += xpNeeded;
          const xpResult = xpManager.addXP('progression_hero', xpNeeded);
          expect(xpResult.status).toBe('ok');
        }
      }

      // Verify final level
      const finalLevel = xpManager.getLevel('progression_hero');
      expect(finalLevel.status).toBe('ok');
      if (finalLevel.result) {
        expect(finalLevel.result.level).toBeGreaterThanOrEqual(progressionLevels[progressionLevels.length - 1]);
        expect(finalLevel.result.totalXp).toBe(totalXp);
      }
    });

    test('should handle XP multipliers and bonuses', () => {
      const entityResult = xpManager.createEntity('bonus_hero', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Test different XP sources with multipliers
      const xpSources = [
        { amount: 100, source: 'quest', expectedMultiplier: 1.0 },
        { amount: 50, source: 'exploration', expectedMultiplier: 1.2 },
        { amount: 200, source: 'boss_defeat', expectedMultiplier: 1.5 },
        { amount: 25, source: 'treasure', expectedMultiplier: 0.8 }
      ];

      let totalBaseXp = 0;
      let totalMultipliedXp = 0;

      for (const source of xpSources) {
        totalBaseXp += source.amount;
        const multipliedAmount = Math.floor(source.amount * source.expectedMultiplier);
        totalMultipliedXp += multipliedAmount;

        const result = xpManager.addXP('bonus_hero', source.amount, source.source);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('bonus_hero');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.totalXp).toBe(totalMultipliedXp);
      }
    });
  });

  describe('ItemsPure Integration', () => {
    test('should handle XP items and consumables', () => {
      const entityResult = xpManager.createEntity('item_user', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate XP items
      const xpItems = [
        { name: 'Small XP Potion', xp: 50 },
        { name: 'Medium XP Potion', xp: 150 },
        { name: 'Large XP Potion', xp: 400 },
        { name: 'Legendary XP Elixir', xp: 1000 }
      ];

      let totalXpFromItems = 0;
      for (const item of xpItems) {
        totalXpFromItems += item.xp;
        const result = xpManager.addXP('item_user', item.xp, `consumed_${item.name.toLowerCase()}`);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('item_user');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.totalXp).toBe(totalXpFromItems);
      }
    });

    test('should handle XP reward items from loot', () => {
      const entityResult = xpManager.createEntity('looter', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate loot drops with XP rewards
      const lootDrops = [
        { item: 'XP Crystal', xp: 75, dropRate: 0.3 },
        { item: 'Skill Orb', xp: 200, dropRate: 0.1 },
        { item: 'Level Token', xp: 500, dropRate: 0.05 },
        { item: 'Ascension Shard', xp: 1500, dropRate: 0.01 }
      ];

      let totalXpFromLoot = 0;
      for (const loot of lootDrops) {
        // Simulate drop success
        const dropped = Math.random() < loot.dropRate;
        if (dropped) {
          totalXpFromLoot += loot.xp;
          const result = xpManager.addXP('looter', loot.xp, `loot_${loot.item.toLowerCase()}`);
          expect(result.status).toBe('ok');
        }
      }

      // Even if no drops occurred, the system should handle it gracefully
      const finalResult = xpManager.getLevel('looter');
      expect(finalResult.status).toBe('ok');
    });
  });

  describe('SpiritsPure Integration', () => {
    test('should handle spirit XP and evolution requirements', () => {
      const entityResult = xpManager.createEntity('spirit_warrior', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate spirit training and battles
      const trainingSessions = [
        { type: 'basic_training', xp: 25 },
        { type: 'combat_training', xp: 100 },
        { type: 'advanced_training', xp: 250 },
        { type: 'master_training', xp: 600 }
      ];

      for (const session of trainingSessions) {
        const result = xpManager.addXP('spirit_warrior', session.xp, session.type);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('spirit_warrior');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.level).toBeGreaterThan(1);
      }
    });

    test('should handle multi-spirit XP distribution', () => {
      const spirits = ['spirit_1', 'spirit_2', 'spirit_3'];
      const baseXp = 100;

      // Create all spirits
      for (const spiritId of spirits) {
        const result = xpManager.createEntity(spiritId, 'standard', 1);
        expect(result.status).toBe('ok');
      }

      // Award XP to all spirits (simulating team battle)
      for (const spiritId of spirits) {
        const result = xpManager.addXP(spiritId, baseXp, 'team_battle');
        expect(result.status).toBe('ok');
      }

      // Verify all spirits received XP
      for (const spiritId of spirits) {
        const levelResult = xpManager.getLevel(spiritId);
        expect(levelResult.status).toBe('ok');
        if (levelResult.result) {
          expect(levelResult.result.totalXp).toBe(baseXp);
        }
      }
    });
  });

  describe('QuestsPure Integration', () => {
    test('should handle quest XP rewards', () => {
      const entityResult = xpManager.createEntity('quest_hero', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate quest completion rewards
      const quests = [
        { name: 'Kill Rats', xp: 50, type: 'side_quest' },
        { name: 'Save Village', xp: 300, type: 'main_quest' },
        { name: 'Defeat Dragon', xp: 1000, type: 'epic_quest' },
        { name: 'Daily Task', xp: 25, type: 'daily_quest' }
      ];

      let totalQuestXp = 0;
      for (const quest of quests) {
        totalQuestXp += quest.xp;
        const result = xpManager.addXP('quest_hero', quest.xp, quest.type);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('quest_hero');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.totalXp).toBe(totalQuestXp);
      }
    });

    test('should handle quest milestone bonuses', () => {
      const entityResult = xpManager.createEntity('milestone_hero', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Simulate quest milestones
      const milestones = [
        { quest: 'Complete 10 quests', xp: 500, milestone: true },
        { quest: 'Reach level 10', xp: 250, milestone: true },
        { quest: 'Master 5 skills', xp: 750, milestone: true },
        { quest: 'Complete main storyline', xp: 2000, milestone: true }
      ];

      let totalMilestoneXp = 0;
      for (const milestone of milestones) {
        totalMilestoneXp += milestone.xp;
        const result = xpManager.addXP('milestone_hero', milestone.xp, `milestone_${milestone.quest.toLowerCase().replace(/\s+/g, '_')}`);
        expect(result.status).toBe('ok');
      }

      const finalResult = xpManager.getLevel('milestone_hero');
      expect(finalResult.status).toBe('ok');
      if (finalResult.result) {
        expect(finalResult.result.totalXp).toBe(totalMilestoneXp);
        expect(finalResult.result.level).toBeGreaterThan(5); // Should have leveled up multiple times
      }
    });
  });

  describe('Advanced XP Calculations', () => {
    test('should handle XP curves with different growth rates', () => {
      // Create entities with different curves
      const fastEntity = xpManager.createEntity('fast_hero', 'fast', 1);
      const standardEntity = xpManager.createEntity('standard_hero', 'standard', 1);
      const slowEntity = xpManager.createEntity('slow_hero', 'slow', 1);

      expect(fastEntity.status).toBe('ok');
      expect(standardEntity.status).toBe('ok');
      expect(slowEntity.status).toBe('ok');

      // Award same XP to all
      const testXp = 1000;
      xpManager.addXP('fast_hero', testXp);
      xpManager.addXP('standard_hero', testXp);
      xpManager.addXP('slow_hero', testXp);

      // Check levels (should be different due to curve differences)
      const fastLevel = xpManager.getLevel('fast_hero');
      const standardLevel = xpManager.getLevel('standard_hero');
      const slowLevel = xpManager.getLevel('slow_hero');

      expect(fastLevel.status).toBe('ok');
      expect(standardLevel.status).toBe('ok');
      expect(slowLevel.status).toBe('ok');

      if (fastLevel.result && standardLevel.result && slowLevel.result) {
        expect(fastLevel.result.level).toBeGreaterThanOrEqual(standardLevel.result.level);
        expect(standardLevel.result.level).toBeGreaterThanOrEqual(slowLevel.result.level);
      }
    });

    test('should handle diminishing returns and XP caps', () => {
      const entityResult = xpManager.createEntity('cap_hero', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Test XP cap behavior (if implemented)
      const massiveXp = 1000000;
      const result = xpManager.addXP('cap_hero', massiveXp);
      expect(result.status).toBe('ok');

      const finalLevel = xpManager.getLevel('cap_hero');
      expect(finalLevel.status).toBe('ok');
      if (finalLevel.result) {
        // Should be capped at max level (100)
        expect(finalLevel.result.level).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle non-existent entities gracefully', () => {
      const invalidResults = [
        xpManager.getLevel('nonexistent'),
        xpManager.addXP('nonexistent', 100),
        xpManager.setSkillLevel('nonexistent', 'test', 1),
        xpManager.setStat('nonexistent', 'test', 10)
      ];

      invalidResults.forEach(result => {
        expect(result.status).toBe('error');
        expect(result.issues).toBeDefined();
        expect(result.issues?.length).toBeGreaterThan(0);
      });
    });

    test('should handle invalid XP values', () => {
      const entityResult = xpManager.createEntity('test_entity', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Test negative XP
      const negativeResult = xpManager.addXP('test_entity', -100);
      expect(negativeResult.status).toBe('ok'); // Should handle negative XP

      // Test zero XP
      const zeroResult = xpManager.addXP('test_entity', 0);
      expect(zeroResult.status).toBe('ok');

      // Test extremely large XP
      const largeResult = xpManager.addXP('test_entity', Number.MAX_SAFE_INTEGER);
      expect(largeResult.status).toBe('ok');
    });

    test('should handle skill and stat limits', () => {
      const entityResult = xpManager.createEntity('limits_entity', 'standard', 1);
      expect(entityResult.status).toBe('ok');

      // Test skill level bounds
      const maxSkillResult = xpManager.setSkillLevel('limits_entity', 'test_skill', 999);
      expect(maxSkillResult.status).toBe('ok');

      const skillResult = xpManager.getSkillLevel('limits_entity', 'test_skill');
      expect(skillResult.status).toBe('ok');
      if (skillResult.result) {
        expect(skillResult.result.level).toBe(999);
      }

      // Test stat value bounds
      const maxStatResult = xpManager.setStat('limits_entity', 'test_stat', 9999);
      expect(maxStatResult.status).toBe('ok');

      const statResult = xpManager.getStat('limits_entity', 'test_stat');
      expect(statResult.status).toBe('ok');
      if (statResult.result) {
        expect(statResult.result.value).toBe(9999);
      }
    });
  });
});