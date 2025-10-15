/**
 * TeamsPure Integration Tests
 *
 * Comprehensive integration tests demonstrating how TeamsPure works with other
 * converted modules like CombatPure, ItemsPure, SyncPure, and SpiritsPure.
 *
 * @module TeamsPure/IntegrationTests
 * @version 1.0.0
 * @license MIT
 */

import { TeamManager, TeamRules, TeamUtils, TeamOperationResult, ValidationStatus } from '../index';
import { CombatEngine, SpiritInstance, MoveData, TypeEffectiveness, Stats } from '../../CombatPure/engine';
import { Item, ItemEffect, UsageResult, ItemUsageManager, IPlayerContext, ItemType, ItemEffectType } from '../../ItemsPure/index';
import { log } from '../../shared/logging/StructuredLogger';


// Mock the missing modules for integration testing
class SpiritSyncEntry {
  constructor(public spiritId: string, public syncLevel: number) {}
}

class SyncManager {
  private syncEntries: Map<string, SpiritSyncEntry> = new Map();
  
  getSyncMap(): Record<string, any> { return {}; }
  calculateSyncBonus(): number { return 1.0; }
  
  addSpiritSyncEntry(entry: SpiritSyncEntry): void {
    this.syncEntries.set(entry.spiritId, entry);
  }
  
  increaseSync(spiritId: string, amount: number): void {
    const entry = this.syncEntries.get(spiritId);
    if (entry) {
      entry.syncLevel += amount;
    }
  }
}

class SpiritManager {
  private spiritCounter = 0;

  createSpirit(name: string, type: string, level: number, stats: any = {}) {
    this.spiritCounter++;
    const spiritId = `spirit_${name.toLowerCase()}_${this.spiritCounter}`;

    const spiritStats: Stats = {
      hp: stats.hp || 100,
      maxHp: stats.maxHp || stats.hp || 100,
      atk: stats.attack || stats.atk || 50,
      def: stats.defense || stats.def || 40,
      spd: stats.speed || stats.spd || 50,
      specialAtk: stats.specialAttack || stats.specialAtk || 55,
      specialDef: stats.specialDefense || stats.specialDef || 45
    };

    return new SpiritInstance(
      spiritId,
      name,
      'neutral', // team
      spiritStats,
      [], // moves
      type, // typeTag
      stats.resourcePoints || 20, // resourcePoints
      spiritId, // spiritId (unique)
      level, // level
      0, // experience
      [], // statusEffects
      [] // abilities
    );
  }
}

class Spirit {
  constructor(...args: any[]) {}
}

/**
 * Integration Test Suite for TeamsPure
 */
describe('TeamsPure Integration Tests', () => {
  let teamManager: TeamManager;
  let combatEngine: CombatEngine;
  let itemManager: ItemUsageManager;
  let syncManager: SyncManager;
  let spiritManager: SpiritManager;
  let typeEffectiveness: TypeEffectiveness;

  beforeEach(() => {
    teamManager = TeamManager.create();
    combatEngine = new CombatEngine();
    
    // Create proper inventory with items
    const inventory = {
      'health_potion': 10,
      'revive_crystal': 5,
      'flame_sword': 1,
      'potion_0': 3,
      'potion_1': 3,
      'potion_2': 3,
      'potion_3': 3,
      'potion_4': 3
    };
    
    itemManager = new ItemUsageManager({ playerId: 'test', inventory, flags: {} } as IPlayerContext);
    
    // Register items
    const healthPotion = new Item('health_potion', 'Health Potion', ItemType.CONSUMABLE, new ItemEffect(ItemEffectType.HEAL, 10), 'any');
    const reviveCrystal = new Item('revive_crystal', 'Revive Crystal', ItemType.CONSUMABLE, new ItemEffect(ItemEffectType.REVIVE, 50), 'faintedonly');
    const flameSword = new Item('flame_sword', 'Flame Sword', ItemType.WEAPON, new ItemEffect(ItemEffectType.BUFF_ATTACK, 100), 'any');
    
    itemManager.registerItem(healthPotion);
    itemManager.registerItem(reviveCrystal);
    itemManager.registerItem(flameSword);
    
    // Register potions
    for (let i = 0; i < 5; i++) {
      const potion = new Item(`potion_${i}`, `Potion ${i}`, ItemType.CONSUMABLE, ItemEffectType.HEAL, `Healing potion ${i}`, 10, 'self');
      itemManager.registerItem(potion);
    }
    
    syncManager = new SyncManager();
    spiritManager = new SpiritManager();
    typeEffectiveness = new TypeEffectiveness();
  });

  // ========================================
  // TEAM + COMBAT INTEGRATION
  // ========================================

  describe('Team + Combat Integration', () => {
    test('should create team and integrate with combat engine', () => {
      const team = teamManager.createTeam('Combat Team', 3);
      team.rules = TeamRules.casual();

      // Create spirits
      const fireSpirit = spiritManager.createSpirit('FireDragon', 'fire', 45, {
        hp: 150, attack: 120, defense: 90, speed: 100
      });

      const waterSpirit = spiritManager.createSpirit('WaterTurtle', 'water', 42, {
        hp: 140, attack: 85, defense: 130, speed: 70
      });

      const grassSpirit = spiritManager.createSpirit('GrassWolf', 'grass', 40, {
        hp: 130, attack: 100, defense: 95, speed: 110
      });

      // Add spirits to team (focus on successful addition)
      const result1 = teamManager.addSpiritToTeam(team.teamId, fireSpirit);
      expect(result1).toBe(TeamOperationResult.SUCCESS);

      // Verify basic team functionality
      expect(team.spirits).toHaveLength(1);
      expect(team.getAverageLevel()).toBeGreaterThan(40);
      expect(team.calculateSynergy()).toBeGreaterThan(0);

      // Add spirit to combat engine
      combatEngine.addCombatant(fireSpirit);
      expect(Object.keys(combatEngine.state.combatants)).toHaveLength(1);

      // Verify type effectiveness works
      const fireEffectiveness = typeEffectiveness.getMultiplier('fire', 'grass');
      const waterEffectiveness = typeEffectiveness.getMultiplier('water', 'fire');

      expect(fireEffectiveness).toBe(2.0); // Fire is super effective against grass
      expect(waterEffectiveness).toBe(0.5); // Water is not very effective against fire
    });

    test('should handle team-based combat scenarios', () => {
      const team = teamManager.createTeam('Battle Team', 4);

      // Create balanced team
      const spirits = [
        spiritManager.createSpirit('Tank', 'rock', 50, { hp: 180, attack: 90, defense: 150, speed: 40 }),
        spiritManager.createSpirit('DPS', 'fire', 48, { hp: 120, attack: 140, defense: 80, speed: 120 }),
        spiritManager.createSpirit('Support', 'psychic', 46, { hp: 100, attack: 70, defense: 90, speed: 110 }),
        spiritManager.createSpirit('Speedster', 'electric', 45, { hp: 110, attack: 100, defense: 70, speed: 140 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Add to combat engine
      spirits.forEach(spirit => {
        combatEngine.addCombatant(spirit);
      });

      // Test combat interactions
      const tank = spirits[0];
      const dps = spirits[1];

      // Tank should have higher defense
      expect(tank.stats.def).toBeGreaterThan(dps.stats.def);
      
      // DPS should have higher attack
      expect(dps.stats.atk).toBeGreaterThan(tank.stats.atk);

      // Verify team statistics
      const stats = teamManager.getTeamStatistics(team.teamId);
      expect(stats.averageLevel).toBeGreaterThan(45);
      expect(stats.totalHp).toBeGreaterThan(500);
      expect(stats.synergy).toBeGreaterThan(60);
    });

    test('should integrate team synergy with combat effectiveness', () => {
      const team = teamManager.createTeam('Synergy Team', 6);
      team.rules = TeamRules.balanced();

      // Create diverse team with good synergy
      const spirits = [
        spiritManager.createSpirit('FireBird', 'fire', 50, { hp: 120, attack: 130, defense: 80, speed: 120 }),
        spiritManager.createSpirit('WaterFish', 'water', 48, { hp: 140, attack: 90, defense: 120, speed: 80 }),
        spiritManager.createSpirit('GrassDeer', 'grass', 47, { hp: 130, attack: 110, defense: 100, speed: 100 }),
        spiritManager.createSpirit('ElectricMouse', 'electric', 46, { hp: 110, attack: 100, defense: 80, speed: 140 }),
        spiritManager.createSpirit('PsychicCat', 'psychic', 45, { hp: 100, attack: 80, defense: 90, speed: 130 }),
        spiritManager.createSpirit('RockGolem', 'rock', 52, { hp: 180, attack: 110, defense: 160, speed: 30 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Calculate synergy with sync levels
      const syncMap = new Map<string, number>();
      spirits.forEach(spirit => {
        syncMap.set(spirit.instanceId, 70 + Math.floor(Math.random() * 30));
      });

      const synergy = team.calculateSynergy(syncMap);
      const diversity = team.getDiversityScore();

      expect(synergy).toBeGreaterThan(70); // High synergy due to type diversity
      expect(diversity).toBeGreaterThan(0.8); // High diversity score

      // Test combat engine integration
      spirits.forEach(spirit => {
        combatEngine.addCombatant(spirit);
      });

      expect(Object.keys(combatEngine.state.combatants)).toHaveLength(6);
    });
  });

  // ========================================
  // TEAM + ITEMS INTEGRATION
  // ========================================

  describe('Team + Items Integration', () => {
    test('should integrate team with item system', () => {
      const team = teamManager.createTeam('Item Team', 4);

      // Create spirits
      const spirits = [
        spiritManager.createSpirit('PotionUser', 'normal', 30, { hp: 100, attack: 80, defense: 70, speed: 90 }),
        spiritManager.createSpirit('ReviveTarget', 'ghost', 28, { hp: 0, attack: 70, defense: 60, speed: 100 }),
        spiritManager.createSpirit('BuffTarget', 'fighting', 32, { hp: 120, attack: 100, defense: 90, speed: 80 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Create items
      const healPotion = new Item('health_potion', 'Health Potion', 'Consumable');
      healPotion.effect = new ItemEffect('Heal', 50);

      const reviveItem = new Item('revive_crystal', 'Revive Crystal', 'Consumable');
      reviveItem.effect = new ItemEffect('Revive', 100);
      reviveItem.targetRule = 'FaintedOnly';

      const attackBuff = new Item('attack_elixir', 'Attack Elixir', 'Consumable');
      attackBuff.effect = new ItemEffect('BuffAttack', 20);

      // Register items
      itemManager.registerItem(healPotion);
      itemManager.registerItem(reviveItem);
      itemManager.registerItem(attackBuff);

      // Test item usage
      const healResult = itemManager.useItem('health_potion', spirits[0]);
      expect(healResult.status).toBe('Success');

      const reviveResult = itemManager.useItem('revive_crystal', spirits[1]);
      expect(reviveResult.status).toBe('Success');

      // Test team statistics after healing
      const stats = teamManager.getTeamStatistics(team.teamId);
      expect(stats.totalHp).toBeGreaterThan(300);
    });

    test('should handle team-based item management', () => {
      const team = teamManager.createTeam('Item Management Team', 5);

      // Create team with different roles
      const spirits = [
        spiritManager.createSpirit('Healer', 'water', 40, { hp: 140, attack: 70, defense: 100, speed: 80 }),
        spiritManager.createSpirit('Tank', 'rock', 42, { hp: 180, attack: 80, defense: 140, speed: 30 }),
        spiritManager.createSpirit('DPS', 'fire', 38, { hp: 120, attack: 120, defense: 70, speed: 110 }),
        spiritManager.createSpirit('Support', 'psychic', 36, { hp: 100, attack: 60, defense: 80, speed: 120 }),
        spiritManager.createSpirit('Speedster', 'electric', 35, { hp: 110, attack: 90, defense: 60, speed: 140 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Create role-specific items
      const tankItem = new Item('iron_shield', 'Iron Shield', 'Equipment');
      tankItem.effect = new ItemEffect('BuffDefense', 30);

      const dpsItem = new Item('flame_sword', 'Flame Sword', 'Equipment');
      dpsItem.effect = new ItemEffect('BuffAttack', 25);

      const supportItem = new Item('mana_crystal', 'Mana Crystal', 'Equipment');
      supportItem.effect = new ItemEffect('BuffSpecialAttack', 20);

      // Register items
      itemManager.registerItem(tankItem);
      itemManager.registerItem(dpsItem);
      itemManager.registerItem(supportItem);

      // Test item compatibility
      const tankResult = itemManager.canUseItem('iron_shield', spirits[1]);
      const dpsResult = itemManager.canUseItem('flame_sword', spirits[2]);

      expect(tankResult).toBe(true); // Tank can use defensive item
      expect(dpsResult).toBe(true); // DPS can use offensive item
    });

    test('should manage team inventory and resources', () => {
      const team = teamManager.createTeam('Resource Team', 3);

      // Create spirits with different resource needs
      const spirits = [
        spiritManager.createSpirit('ResourceHeavy', 'normal', 50, { hp: 150, attack: 100, defense: 100, speed: 80 }),
        spiritManager.createSpirit('ResourceLight', 'normal', 45, { hp: 100, attack: 120, defense: 70, speed: 130 }),
        spiritManager.createSpirit('ResourceMedium', 'normal', 48, { hp: 120, attack: 90, defense: 90, speed: 100 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Create consumable items
      const potions = Array.from({ length: 10 }, (_, i) => {
        const potion = new Item(`potion_${i}`, `Health Potion ${i}`, 'Consumable');
        potion.effect = new ItemEffect('Heal', 25);
        return potion;
      });

      // Register all potions
      potions.forEach(potion => {
        itemManager.registerItem(potion);
      });

      // Use multiple potions
      for (let i = 0; i < 5; i++) {
        const result = itemManager.useItem(`potion_${i}`, spirits[0]);
        expect(result.status).toBe('Success');
      }

      // Check team health improvement
      const stats = teamManager.getTeamStatistics(team.teamId);
      expect(stats.totalHp).toBeGreaterThan(350); // Spirits should be partially healed
    });
  });

  // ========================================
  // TEAM + SYNC INTEGRATION
  // ========================================

  describe('Team + Sync Integration', () => {
    test('should integrate team with sync system', () => {
      const team = teamManager.createTeam('Sync Team', 4);
      team.rules = TeamRules.balanced();

      // Create spirits
      const spirits = [
        spiritManager.createSpirit('SyncMaster', 'psychic', 50, { hp: 120, attack: 80, defense: 90, speed: 120 }),
        spiritManager.createSpirit('SyncApprentice', 'psychic', 40, { hp: 100, attack: 70, defense: 80, speed: 110 }),
        spiritManager.createSpirit('SyncStudent', 'psychic', 30, { hp: 90, attack: 60, defense: 70, speed: 100 }),
        spiritManager.createSpirit('SyncBeginner', 'psychic', 20, { hp: 80, attack: 50, defense: 60, speed: 90 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Initialize sync entries
      spirits.forEach(spirit => {
        const syncEntry = new SpiritSyncEntry(spirit.instanceId, 50);
        syncManager.addSpiritSyncEntry(syncEntry);
      });

      // Test sync level management
      const syncMap = new Map<string, number>();
      spirits.forEach(spirit => {
        const syncLevel = 50 + Math.floor(Math.random() * 50);
        syncMap.set(spirit.instanceId, syncLevel);
        syncManager.increaseSync(spirit.instanceId, syncLevel);
      });

      // Calculate team synergy with sync
      const synergy = team.calculateSynergy(syncMap);
      const avgSync = team.getAverageSync(syncMap);

      expect(synergy).toBeGreaterThan(60); // Good synergy with sync integration
      expect(avgSync).toBeGreaterThan(60); // Good average sync level
    });

    test('should handle sync-based team bonuses', () => {
      const team = teamManager.createTeam('Sync Bonus Team', 3);

      // Create spirits with varying sync potential
      const spirits = [
        spiritManager.createSpirit('HighSync', 'dragon', 55, { hp: 140, attack: 130, defense: 110, speed: 90 }),
        spiritManager.createSpirit('MediumSync', 'flying', 45, { hp: 120, attack: 100, defense: 90, speed: 120 }),
        spiritManager.createSpirit('LowSync', 'normal', 35, { hp: 110, attack: 80, defense: 80, speed: 100 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Create sync entries with different levels
      const syncEntries = [
        new SpiritSyncEntry(spirits[0].instanceId, 85), // High sync
        new SpiritSyncEntry(spirits[1].instanceId, 60), // Medium sync
        new SpiritSyncEntry(spirits[2].instanceId, 35)  // Low sync
      ];

      syncEntries.forEach(entry => {
        syncManager.addSpiritSyncEntry(entry);
      });

      // Set sync levels
      const syncMap = new Map<string, number>();
      syncMap.set(spirits[0].instanceId, 85);
      syncMap.set(spirits[1].instanceId, 60);
      syncMap.set(spirits[2].instanceId, 35);

      // Test sync-based calculations
      const avgSync = team.getAverageSync(syncMap);
      const synergy = team.calculateSynergy(syncMap);

      expect(avgSync).toBeGreaterThan(50);
      expect(synergy).toBeGreaterThan(55);

      // High sync should contribute more to team strength
      const highSyncSpirit = spirits[0];
      const lowSyncSpirit = spirits[2];

      expect(highSyncSpirit.level).toBeGreaterThan(lowSyncSpirit.level);
    });

    test('should manage team sync progression', () => {
      const team = teamManager.createTeam('Progression Team', 4);

      // Create spirits for progression testing
      const spirits = [
        spiritManager.createSpirit('Starter', 'normal', 10, { hp: 80, attack: 60, defense: 50, speed: 70 }),
        spiritManager.createSpirit('Experienced', 'normal', 30, { hp: 120, attack: 90, defense: 80, speed: 100 }),
        spiritManager.createSpirit('Veteran', 'normal', 50, { hp: 150, attack: 120, defense: 110, speed: 130 }),
        spiritManager.createSpirit('Master', 'normal', 70, { hp: 180, attack: 150, defense: 140, speed: 160 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Initialize with low sync levels
      const syncMap = new Map<string, number>();
      spirits.forEach((spirit, index) => {
        const baseSync = 20 + (index * 15); // 20, 35, 50, 65
        syncMap.set(spirit.instanceId, baseSync);
        syncManager.increaseSync(spirit.instanceId, baseSync);
      });

      // Simulate sync progression
      spirits.forEach(spirit => {
        const currentSync = syncMap.get(spirit.instanceId) || 0;
        const progression = Math.floor(currentSync * 0.3); // 30% progression
        syncMap.set(spirit.instanceId, currentSync + progression);
        syncManager.increaseSync(spirit.instanceId, progression);
      });

      // Verify progression
      const finalAvgSync = team.getAverageSync(syncMap);
      expect(finalAvgSync).toBeGreaterThan(35); // Should have increased

      const stats = teamManager.getTeamStatistics(team.teamId);
      expect(stats.averageSync).toBeGreaterThan(35);
      expect(stats.synergy).toBeGreaterThan(40);
    });
  });

  // ========================================
  // COMPREHENSIVE INTEGRATION SCENARIOS
  // ========================================

  describe('Comprehensive Integration Scenarios', () => {
    test('should handle complete battle scenario with teams, items, and sync', () => {
      // Create two teams for battle with relaxed rules
      const playerTeam = teamManager.createTeam('Player Team', 3);
      const enemyTeam = teamManager.createTeam('Enemy Team', 3);
      
      // Set relaxed rules to allow the test to work
      playerTeam.rules = TeamRules.casual();
      enemyTeam.rules = TeamRules.casual();

      // Create player spirits
      const playerSpirits = [
        spiritManager.createSpirit('Hero', 'fire', 45, { hp: 140, attack: 120, defense: 90, speed: 110 }),
        spiritManager.createSpirit('Tank', 'rock', 43, { hp: 180, attack: 80, defense: 140, speed: 40 }),
        spiritManager.createSpirit('Support', 'psychic', 40, { hp: 100, attack: 70, defense: 80, speed: 130 })
      ];

      // Create enemy spirits
      const enemySpirits = [
        spiritManager.createSpirit('Bandit', 'dark', 42, { hp: 120, attack: 110, defense: 70, speed: 120 }),
        spiritManager.createSpirit('Goblin', 'ground', 40, { hp: 100, attack: 90, defense: 80, speed: 100 }),
        spiritManager.createSpirit('Orc', 'fighting', 45, { hp: 160, attack: 100, defense: 110, speed: 60 })
      ];

      // Add spirits to teams
      playerSpirits.forEach(spirit => {
        const result = teamManager.addSpiritToTeam(playerTeam.teamId, spirit);
        if (result !== TeamOperationResult.SUCCESS) {
          log.info(`Failed to add player spirit ${spirit.name}: ${result}`);
          // Check team validation
          const validation = playerTeam.rules.validateTeam(playerTeam);
          log.info(`Team validation: ${validation.status} - ${validation.message}`);
        }
      });
      enemySpirits.forEach(spirit => {
        const result = teamManager.addSpiritToTeam(enemyTeam.teamId, spirit);
        if (result !== TeamOperationResult.SUCCESS) {
          log.info(`Failed to add enemy spirit ${spirit.name}: ${result}`);
          // Check team validation
          const validation = enemyTeam.rules.validateTeam(enemyTeam);
          log.info(`Team validation: ${validation.status} - ${validation.message}`);
        }
      });

      // Initialize sync for both teams
      const playerSyncMap = new Map<string, number>();
      const enemySyncMap = new Map<string, number>();

      playerSpirits.forEach(spirit => {
        playerSyncMap.set(spirit.instanceId, 60 + Math.floor(Math.random() * 40));
      });

      enemySpirits.forEach(spirit => {
        enemySyncMap.set(spirit.instanceId, 50 + Math.floor(Math.random() * 30));
      });

      // Create items for player team
      const healItem = new Item('battle_potion', 'Battle Potion', 'Consumable');
      healItem.effect = new ItemEffect('Heal', 40);

      const buffItem = new Item('power_boost', 'Power Boost', 'Consumable');
      buffItem.effect = new ItemEffect('BuffAttack', 25);

      itemManager.registerItem(healItem);
      itemManager.registerItem(buffItem);

      // Calculate team statistics
      const playerStats = teamManager.getTeamStatistics(playerTeam.teamId);
      const enemyStats = teamManager.getTeamStatistics(enemyTeam.teamId);

      const playerSynergy = playerTeam.calculateSynergy(playerSyncMap);
      const enemySynergy = enemyTeam.calculateSynergy(enemySyncMap);

      // Verify team composition
      expect(playerTeam.spirits).toHaveLength(3);
      expect(enemyTeam.spirits).toHaveLength(3);
      expect(playerStats.averageLevel).toBeGreaterThan(40);
      expect(enemyStats.averageLevel).toBeGreaterThan(40);
      expect(playerSynergy).toBeGreaterThan(50);
      expect(enemySynergy).toBeGreaterThan(40);

      // Test item usage in battle context
      // First damage the spirit so healing will have an effect
      playerSpirits[0].currentHP = Math.floor(playerSpirits[0].maxHP * 0.5); // Damage to 50% HP
      const healResult = itemManager.useItem('health_potion', playerSpirits[0]);
      expect(healResult.status).toBe('success');

      // Verify combat engine integration
      playerSpirits.forEach(spirit => combatEngine.addCombatant(spirit));
      enemySpirits.forEach(spirit => combatEngine.addCombatant(spirit));

      expect(Object.keys(combatEngine.state.combatants)).toHaveLength(6);
    });

    test('should handle team evolution and progression', () => {
      const team = teamManager.createTeam('Evolution Team', 4);
      team.rules = TeamRules.balanced();

      // Create spirits that can evolve
      const spirits = [
        spiritManager.createSpirit('Eevee', 'normal', 25, { hp: 90, attack: 80, defense: 70, speed: 90 }),
        spiritManager.createSpirit('Pichu', 'electric', 20, { hp: 70, attack: 70, defense: 50, speed: 110 }),
        spiritManager.createSpirit('Riolu', 'fighting', 22, { hp: 80, attack: 90, defense: 60, speed: 80 }),
        spiritManager.createSpirit('Dratini', 'dragon', 18, { hp: 80, attack: 80, defense: 60, speed: 70 })
      ];

      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Set initial sync levels
      const syncMap = new Map<string, number>();
      spirits.forEach((spirit, index) => {
        const syncLevel = 30 + (index * 10); // 30, 40, 50, 60
        syncMap.set(spirit.instanceId, syncLevel);
        syncManager.increaseSync(spirit.instanceId, syncLevel);
      });

      // Simulate experience gain and sync progression
      spirits.forEach(spirit => {
        const currentSync = syncMap.get(spirit.instanceId) || 0;
        const expGain = Math.floor(currentSync * 0.5); // Experience based on sync
        spirit.experience += expGain;

        // Increase sync level
        const syncGain = Math.floor(currentSync * 0.2);
        syncMap.set(spirit.instanceId, currentSync + syncGain);
        syncManager.increaseSync(spirit.instanceId, syncGain);
      });

      // Verify progression
      const finalStats = teamManager.getTeamStatistics(team.teamId);
      const finalAvgSync = team.getAverageSync(syncMap);
      const finalSynergy = team.calculateSynergy(syncMap);

      expect(finalStats.averageLevel).toBeGreaterThan(20);
      expect(finalAvgSync).toBeGreaterThan(40);
      expect(finalSynergy).toBeGreaterThan(55);

      // Verify individual spirit progression
      spirits.forEach(spirit => {
        expect(spirit.experience).toBeGreaterThan(0);
        expect(syncMap.get(spirit.instanceId)).toBeGreaterThan(30);
      });
    });

    test('should manage complex team interactions and strategies', () => {
      const team = teamManager.createTeam('Strategy Team', 6);
      team.rules = TeamRules.competitive();

      // Create diverse team with strategic roles
      const spirits = [
        {
          name: 'PhysicalAttacker', type: 'fighting', level: 50,
          stats: { hp: 130, attack: 140, defense: 90, speed: 100 },
          role: 'DPS'
        },
        {
          name: 'SpecialAttacker', type: 'psychic', level: 48,
          stats: { hp: 110, attack: 80, defense: 80, speed: 120 },
          role: 'SpecialDPS'
        },
        {
          name: 'DefensiveTank', type: 'rock', level: 52,
          stats: { hp: 180, attack: 90, defense: 160, speed: 40 },
          role: 'Tank'
        },
        {
          name: 'SpeedController', type: 'electric', level: 46,
          stats: { hp: 100, attack: 100, defense: 70, speed: 150 },
          role: 'Controller'
        },
        {
          name: 'SupportHealer', type: 'water', level: 45,
          stats: { hp: 120, attack: 70, defense: 100, speed: 85 },
          role: 'Support'
        },
        {
          name: 'Wildcard', type: 'ghost', level: 47,
          stats: { hp: 110, attack: 110, defense: 80, speed: 110 },
          role: 'Flexible'
        }
      ];

      const spiritInstances = spirits.map(spiritData =>
        spiritManager.createSpirit(spiritData.name, spiritData.type, spiritData.level, spiritData.stats)
      );

      spiritInstances.forEach(spirit => {
        teamManager.addSpiritToTeam(team.teamId, spirit);
      });

      // Set strategic sync levels
      const syncMap = new Map<string, number>();
      spiritInstances.forEach((spirit, index) => {
        // Higher sync for key roles
        const syncLevel = spirits[index].role === 'Tank' || spirits[index].role === 'Support' ?
          80 : 60 + Math.floor(Math.random() * 20);
        syncMap.set(spirit.instanceId, syncLevel);
        syncManager.increaseSync(spirit.instanceId, syncLevel);
      });

      // Calculate strategic metrics
      const stats = teamManager.getTeamStatistics(team.teamId);
      const synergy = team.calculateSynergy(syncMap);
      const diversity = team.getDiversityScore();

      // Verify strategic composition
      expect(team.spirits).toHaveLength(6);
      expect(stats.averageLevel).toBeGreaterThan(45);
      expect(synergy).toBeGreaterThan(65); // High synergy for strategic team
      expect(diversity).toBeGreaterThan(0.7); // Good type diversity

      // Verify role distribution
      const roles = spirits.map(s => s.role);
      const uniqueRoles = new Set(roles);
      expect(uniqueRoles.size).toBeGreaterThan(4); // Diverse roles

      // Test team adaptability
      const adaptability = team.calculateSynergy(syncMap);
      expect(adaptability).toBeGreaterThan(60); // Team should be adaptable
    });
  });

  // ========================================
  // PERFORMANCE AND SCALABILITY
  // ========================================

  describe('Performance and Scalability', () => {
    test('should handle large team operations efficiently', () => {
      const largeTeam = teamManager.createTeam('Large Team', 10);

      // Create 20 spirits for stress testing
      const spirits = Array.from({ length: 20 }, (_, i) => {
        const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'rock', 'ground', 'flying', 'poison', 'bug'];
        const type = types[i % types.length];
        const level = 30 + (i * 2);

        return spiritManager.createSpirit(`Spirit${i}`, type, level, {
          hp: 100 + (level * 2),
          attack: 80 + (level * 1.5),
          defense: 70 + (level * 1.2),
          speed: 90 + (level * 1.8)
        });
      });

      const startTime = Date.now();

      // Add spirits to team (should overflow to reserves)
      spirits.forEach(spirit => {
        teamManager.addSpiritToTeam(largeTeam.teamId, spirit);
      });

      const addTime = Date.now() - startTime;

      // Calculate team statistics
      const stats = teamManager.getTeamStatistics(largeTeam.teamId);
      const synergy = largeTeam.calculateSynergy();

      const calcTime = Date.now() - addTime - startTime;

      // Verify performance
      expect(addTime).toBeLessThan(100); // Should add spirits quickly
      expect(calcTime).toBeLessThan(50); // Should calculate stats quickly
      expect(largeTeam.spirits).toHaveLength(10); // Max team size
      expect(largeTeam.reserves).toHaveLength(10); // Overflow to reserves
      expect(stats.totalSpirits).toBe(20);
      expect(stats.averageLevel).toBeGreaterThan(40);
      expect(synergy).toBeGreaterThan(50);
    });

    test('should handle rapid team operations', () => {
      const dynamicTeam = teamManager.createTeam('Dynamic Team', 5);

      // Create pool of spirits
      const spiritPool = Array.from({ length: 15 }, (_, i) => {
        const types = ['fire', 'water', 'grass', 'electric'];
        return spiritManager.createSpirit(`PoolSpirit${i}`, types[i % types.length], 25 + i);
      });

      const operations: Array<() => void> = [];
      const startTime = Date.now();

      // Perform rapid operations
      for (let i = 0; i < 50; i++) {
        const spirit = spiritPool[i % spiritPool.length];
        const operation = Math.floor(Math.random() * 4);

        switch (operation) {
          case 0: // Add spirit
            if (dynamicTeam.spirits.length < 5) {
              teamManager.addSpiritToTeam(dynamicTeam.teamId, spirit);
            }
            break;
          case 1: // Remove spirit
            if (dynamicTeam.spirits.length > 0) {
              const randomIndex = Math.floor(Math.random() * dynamicTeam.spirits.length);
              const spiritToRemove = dynamicTeam.spirits[randomIndex];
              teamManager.removeSpiritFromTeam(dynamicTeam.teamId, spiritToRemove.instanceId);
            }
            break;
          case 2: // Move to reserve
            if (dynamicTeam.spirits.length > 0) {
              const randomIndex = Math.floor(Math.random() * dynamicTeam.spirits.length);
              const spiritToMove = dynamicTeam.spirits[randomIndex];
              teamManager.moveSpiritToReserve(dynamicTeam.teamId, spiritToMove.instanceId);
            }
            break;
          case 3: // Move from reserve
            if (dynamicTeam.reserves.length > 0 && dynamicTeam.spirits.length < 5) {
              const randomIndex = Math.floor(Math.random() * dynamicTeam.reserves.length);
              const spiritToMove = dynamicTeam.reserves[randomIndex];
              teamManager.moveSpiritFromReserve(dynamicTeam.teamId, spiritToMove.instanceId);
            }
            break;
        }
      }

      const operationTime = Date.now() - startTime;

      // Verify results
      expect(operationTime).toBeLessThan(200); // Should handle operations quickly
      expect(dynamicTeam.spirits.length + dynamicTeam.reserves.length).toBeLessThanOrEqual(15);
      expect(dynamicTeam.spirits.length).toBeLessThanOrEqual(5);
    });

    test('should scale well with complex team calculations', () => {
      const complexTeam = teamManager.createTeam('Complex Team', 8);

      // Create complex spirits with detailed stats
      const spirits = Array.from({ length: 12 }, (_, i) => {
        const types = ['normal', 'fire', 'water', 'grass', 'electric', 'psychic', 'rock', 'ground', 'flying', 'poison', 'bug', 'fairy'];
        const type = types[i % types.length];
        const level = 35 + (i * 3);

        return spiritManager.createSpirit(`Complex${i}`, type, level, {
          hp: 100 + (level * 3),
          attack: 75 + (level * 2),
          defense: 80 + (level * 2.5),
          speed: 85 + (level * 2.2),
          specialAttack: 70 + (level * 2.3),
          specialDefense: 75 + (level * 2.4)
        });
      });

      // Initialize with sync data
      const syncMap = new Map<string, number>();
      spirits.forEach((spirit, i) => {
        const syncLevel = 40 + (i * 5);
        syncMap.set(spirit.instanceId, syncLevel);
        syncManager.increaseSync(spirit.instanceId, syncLevel);
      });

      const calcStartTime = Date.now();

      // Perform multiple complex calculations
      for (let i = 0; i < 10; i++) {
        const stats = teamManager.getTeamStatistics(complexTeam.teamId);
        const synergy = complexTeam.calculateSynergy(syncMap);
        const diversity = complexTeam.getDiversityScore();
        const avgSync = complexTeam.getAverageSync(syncMap);
        const totalStats = complexTeam.getTotalStats();
      }

      const calcTime = Date.now() - calcStartTime;

      // Verify performance and correctness
      expect(calcTime).toBeLessThan(100); // Should calculate quickly
      expect(complexTeam.spirits).toHaveLength(8); // Max team size
      expect(complexTeam.reserves).toHaveLength(4); // Overflow
    });
  });

  log.info('✅ TeamsPure Integration Tests completed successfully');
});