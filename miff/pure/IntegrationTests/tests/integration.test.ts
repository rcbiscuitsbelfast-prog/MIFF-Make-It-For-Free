/**
 * Integration Tests - Module Interaction Testing
 *
 * Comprehensive test suite covering interactions between different MIFF modules
 * to ensure proper integration and cross-module functionality.
 *
 * @module IntegrationTests
 * @version 1.0.0
 * @license MIT
 */

import { TeamManager, Team, TeamRules, TeamSlot, ValidationResult } from '../../TeamsPure/index';
import { BattleEffect, EffectType, TargetStat, ModifierType, EffectManager, IEntityContext } from '../../EffectsPure/index';
import { EventBus } from '../../EventBusPure/EventBusPure';

// Mock implementations for integration testing
class MockSpiritInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  experience: number;
  name: string;
  type: string;
  stats: Record<string, number>;

  constructor(name: string, type: string, level: number = 25) {
    this.instanceId = `spirit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.speciesId = name.toLowerCase().replace(' ', '_');
    this.level = level;
    this.experience = level * 100;
    this.name = name;
    this.type = type;
    this.stats = {
      hp: 100 + level * 2,
      attack: 50 + level,
      defense: 40 + level * 0.5,
      speed: 60 + level * 0.5,
      specialAttack: 45 + level,
      specialDefense: 35 + level * 0.5
    };
  }

  validate(): string[] { return []; }
  isAlive(): boolean { return this.stats.hp > 0; }
  canAct(): boolean { return this.isAlive(); }
  getEffectiveStats(): Record<string, number> { return this.stats; }
  getTypeEffectiveness(attackingType: string): number { return 1.0; }
  clone(): MockSpiritInstance { return new MockSpiritInstance(this.name, type: this.type, this.level); }
  toJSON(): Record<string, any> { return {}; }
}

class MockEntityContext implements IEntityContext {
  private entityStats = new Map<string, Map<string, number>>();

  getEntityStat(entityId: string, stat: TargetStat): number {
    const stats = this.entityStats.get(entityId) || new Map();
    return stats.get(stat) || 100;
  }

  setEntityStat(entityId: string, stat: TargetStat, value: number): void {
    if (!this.entityStats.has(entityId)) {
      this.entityStats.set(entityId, new Map());
    }
    this.entityStats.get(entityId)!.set(stat, Math.max(0, value));
  }

  hasImmunity(entityId: string, immunityTag: string): boolean { return false; }
  getEntityImmunities(entityId: string): string[] { return []; }
  isEntityAlive(entityId: string): boolean { return true; }
  getCurrentPhase(): any { return 'pre_turn'; }
  setCurrentPhase(phase): void {}
  addImmunity(entityId: string, immunityTag: string): void {}
  removeImmunity(entityId: string, immunityTag: string): void {}
  killEntity(entityId: string): void {}
  reviveEntity(entityId: string): void {}

  setEntityHp(entityId: string, hp: number): void { this.setEntityStat(entityId, HP: TargetStat.HP, hp); }
  setEntityAtk(entityId: string, atk: number): void { this.setEntityStat(entityId, ATK: TargetStat.ATK, atk); }
}

describe('Module Integration Tests', () => {
  let eventBus: EventBus;
  let teamManager: TeamManager;
  let effectManager: EffectManager;
  let mockContext: MockEntityContext;

  beforeEach(() => {
    eventBus = new EventBus();
    teamManager = new TeamManager();
    effectManager = new EffectManager();
    mockContext = new MockEntityContext();
  });

  afterEach(() => {
    eventBus.clearOldEvents();
  });

  describe('Team and Effects Integration', () => {
    test('should create team with spirits and apply effects', () => {
      // Create spirits
      const fireSpirit = new MockSpiritInstance('Fire Spirit', 'fire', 25);
      const waterSpirit = new MockSpiritInstance('Water Spirit', 'water', 25);

      // Create team
      const team = teamManager.createTeam('Test Team');
      expect(teamManager.addSpiritToTeam(team.teamId, fireSpirit)).toBe('success');
      expect(teamManager.addSpiritToTeam(team.teamId, waterSpirit)).toBe('success');

      // Verify team has spirits
      const activeTeam = teamManager.getActiveTeam(team.teamId);
      expect(activeTeam).toHaveLength(2);
      expect(activeTeam[0].name).toBe('Fire Spirit');
      expect(activeTeam[1].name).toBe('Water Spirit');
    });

    test('should apply stat boosting effects to team members', () => {
      // Create spirit
      const spirit = new MockSpiritInstance('Test Spirit', 'normal', 25);

      // Create team
      const team = teamManager.createTeam('Effect Team');
      teamManager.addSpiritToTeam(team.teamId, spirit);

      // Create attack boost effect
      const attackEffect = BattleEffect.statModifier(
        'attack_boost',
        'Attack Boost',
        'Increases attack',
        TargetStat.ATK,
        ModifierType.FLAT,
        20,
        30, // 30 seconds
        0
      );

      // Apply effect
      const result = effectManager.applyEffect('spirit_1', attackEffect);
      expect(result).toBe('applied');

      // Verify effect was applied (check if effect exists in manager)
      const activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBeGreaterThan(0);

      // Verify effect details
      const effect = activeEffects.find(e => e.effect.effectId === 'attack_boost');
      expect(effect).toBeDefined();
      expect(effect!.effect.name).toBe('Attack Boost');
      expect(effect!.effect.value).toBe(20);
    });

    test('should handle effect expiration and cleanup', () => {
      // Create spirit
      const spirit = new MockSpiritInstance('Test Spirit', 'normal', 25);

      // Create team
      const team = teamManager.createTeam('Cleanup Team');
      teamManager.addSpiritToTeam(team.teamId, spirit);

      // Create temporary effect
      const tempEffect = BattleEffect.statModifier(
        'temp_boost',
        'Temporary Boost',
        'Temporary boost',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        0, // 0 seconds duration
        0
      );

      // Apply effect
      effectManager.applyEffect('spirit_1', tempEffect);

      // Verify effect was applied
      let activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBeGreaterThan(0);

      // Simulate time passing (effect should expire)
      // Note: In a real scenario, this would be handled by the game loop

      // Check that expired effects are cleaned up
      activeEffects = effectManager.getActiveEffects('spirit_1');
      // Effects with 0 duration should be expired immediately
      expect(activeEffects.length).toBe(0);
    });
  });

  describe('Effect System Integration', () => {
    test('should handle multiple effects on single entity', () => {
      const spirit = new MockSpiritInstance('Multi-Effect Spirit', 'normal', 25);

      // Create multiple effects
      const attackEffect = BattleEffect.statModifier(
        'attack_boost',
        'Attack Boost',
        'Increases attack',
        TargetStat.ATK,
        ModifierType.FLAT,
        15,
        60,
        0
      );

      const defenseEffect = BattleEffect.statModifier(
        'defense_boost',
        'Defense Boost',
        'Increases defense',
        TargetStat.DEF,
        ModifierType.FLAT,
        10,
        60,
        0
      );

      // Apply both effects
      effectManager.applyEffect('spirit_1', attackEffect);
      effectManager.applyEffect('spirit_1', defenseEffect);

      // Verify both effects are active
      const activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBe(2);

      // Verify effect details
      const attackEffectFound = activeEffects.find(e => e.effect.effectId === 'attack_boost');
      const defenseEffectFound = activeEffects.find(e => e.effect.effectId === 'defense_boost');

      expect(attackEffectFound).toBeDefined();
      expect(defenseEffectFound).toBeDefined();
      expect(attackEffectFound!.effect.value).toBe(15);
      expect(defenseEffectFound!.effect.value).toBe(10);
    });

    test('should handle effect stacking correctly', () => {
      const spirit = new MockSpiritInstance('Stacking Spirit', 'normal', 25);

      // Create stackable effect
      const stackEffect = BattleEffect.statModifier(
        'stack_boost',
        'Stack Boost',
        'Stackable boost',
        TargetStat.ATK,
        ModifierType.FLAT,
        5,
        30,
        0,
        true, // stackable
        3,    // max stacks
        true  // refresh on stack
      );

      // Apply effect multiple times
      effectManager.applyEffect('spirit_1', stackEffect);
      effectManager.applyEffect('spirit_1', stackEffect);
      effectManager.applyEffect('spirit_1', stackEffect);

      // Verify stacking
      const activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBe(1);

      const stackedEffect = activeEffects[0];
      expect(stackedEffect.stacks).toBe(3);
      expect(stackedEffect.effect.value).toBe(5); // Individual effect value
    });
  });

  describe('Cross-Module Event Integration', () => {
    test('should handle team changes triggering effect updates', (done) => {
      const spirit = new MockSpiritInstance('Event Spirit', 'normal', 25);

      // Set up event listener for effect events
      eventBus.on('effect:applied', (data) => {
        expect(data.entityId).toBe('spirit_1');
        expect(data.effect.name).toBe('Event Boost');
        done();
      });

      // Create team
      const team = teamManager.createTeam('Event Team');
      teamManager.addSpiritToTeam(team.teamId, spirit);

      // Create and apply effect
      const eventEffect = BattleEffect.statModifier(
        'event_boost',
        'Event Boost',
        'Test event effect',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        30,
        0
      );

      effectManager.applyEffect('spirit_1', eventEffect);
    });

    test('should handle team member removal with active effects', () => {
      const spirit = new MockSpiritInstance('Removal Spirit', 'normal', 25);

      // Create team
      const team = teamManager.createTeam('Removal Team');
      teamManager.addSpiritToTeam(team.teamId, spirit);

      // Apply effect
      const removalEffect = BattleEffect.statModifier(
        'removal_boost',
        'Removal Boost',
        'Test removal effect',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        30,
        0
      );

      effectManager.applyEffect('spirit_1', removalEffect);

      // Verify effect is active
      let activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBe(1);

      // Remove spirit from team
      const result = teamManager.removeSpiritFromTeam(team.teamId, spirit.instanceId);
      expect(result).toBe('success');

      // Effects should still be active (not tied to team membership)
      activeEffects = effectManager.getActiveEffects('spirit_1');
      expect(activeEffects.length).toBe(1);
    });
  });

  describe('Complex Integration Scenarios', () => {
    test('should handle complete battle scenario with teams and effects', () => {
      // Create two teams
      const playerTeam = teamManager.createTeam('Player Team');
      const enemyTeam = teamManager.createTeam('Enemy Team');

      // Create spirits
      const playerSpirit = new MockSpiritInstance('Hero Spirit', 'light', 30);
      const enemySpirit = new MockSpiritInstance('Dark Spirit', 'dark', 28);

      // Add spirits to teams
      teamManager.addSpiritToTeam(playerTeam.teamId, playerSpirit);
      teamManager.addSpiritToTeam(enemyTeam.teamId, enemySpirit);

      // Apply effects to player spirit
      const playerEffects = [
        BattleEffect.statModifier('player_atk', 'Player Attack', 'Attack boost', ATK: TargetStat.ATK, ModifierType.FLAT, 15, 60, 0),
        BattleEffect.statModifier('player_def', 'Player Defense', 'Defense boost', DEF: TargetStat.DEF, ModifierType.FLAT, 10, 60, 0)
      ];

      playerEffects.forEach(effect => {
        effectManager.applyEffect(playerSpirit.instanceId, effect);
      });

      // Verify team setup
      const playerActive = teamManager.getActiveTeam(playerTeam.teamId);
      const enemyActive = teamManager.getActiveTeam(enemyTeam.teamId);

      expect(playerActive).toHaveLength(1);
      expect(enemyActive).toHaveLength(1);

      // Verify effects are applied
      const playerEffectsActive = effectManager.getActiveEffects(playerSpirit.instanceId);
      expect(playerEffectsActive.length).toBe(2);

      // Verify effect details
      expect(playerEffectsActive[0].effect.value).toBe(15);
      expect(playerEffectsActive[1].effect.value).toBe(10);
    });

    test('should handle effect interactions between team members', () => {
      const team = teamManager.createTeam('Interaction Team');

      // Create spirits
      const leaderSpirit = new MockSpiritInstance('Leader Spirit', 'light', 35);
      const supportSpirit = new MockSpiritInstance('Support Spirit', 'light', 25);

      // Add to team
      teamManager.addSpiritToTeam(team.teamId, leaderSpirit);
      teamManager.addSpiritToTeam(team.teamId, supportSpirit);

      // Create aura effect that affects team members
      const teamAura = BattleEffect.statModifier(
        'team_aura',
        'Team Aura',
        'Team-wide aura effect',
        TargetStat.ATK,
        ModifierType.FLAT,
        5,
        45,
        0
      );

      // Apply to leader (simulating aura effect)
      effectManager.applyEffect(leaderSpirit.instanceId, teamAura);

      // Verify individual effects are tracked
      const leaderEffects = effectManager.getActiveEffects(leaderSpirit.instanceId);
      const supportEffects = effectManager.getActiveEffects(supportSpirit.instanceId);

      expect(leaderEffects.length).toBe(1);
      expect(supportEffects.length).toBe(0); // Support spirit doesn't have the effect directly

      // In a real implementation, the aura would affect nearby team members
      // This test verifies that effects are properly isolated to their targets
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid entity operations gracefully', () => {
      // Try to apply effect to non-existent entity
      const invalidEffect = BattleEffect.statModifier(
        'invalid_test',
        'Invalid Test',
        'Test effect',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        30,
        0
      );

      // Should not throw error for non-existent entity
      expect(() => {
        effectManager.applyEffect('non_existent_entity', invalidEffect);
      }).not.toThrow();
    });

    test('should handle team operations with effects', () => {
      const spirit = new MockSpiritInstance('Team Op Spirit', 'normal', 25);
      const team = teamManager.createTeam('Team Op Team');

      // Add spirit to team
      teamManager.addSpiritToTeam(team.teamId, spirit);

      // Apply effect
      const teamEffect = BattleEffect.statModifier(
        'team_op_effect',
        'Team Op Effect',
        'Team operation effect',
        TargetStat.ATK,
        ModifierType.FLAT,
        10,
        30,
        0
      );

      effectManager.applyEffect(spirit.instanceId, teamEffect);

      // Verify team still functions correctly
      const activeTeam = teamManager.getActiveTeam(team.teamId);
      expect(activeTeam).toHaveLength(1);
      expect(activeTeam[0].instanceId).toBe(spirit.instanceId);

      // Effects should still be active
      const activeEffects = effectManager.getActiveEffects(spirit.instanceId);
      expect(activeEffects.length).toBe(1);
    });
  });
});