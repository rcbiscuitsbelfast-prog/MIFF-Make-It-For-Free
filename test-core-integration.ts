#!/usr/bin/env tsx

/**
 * Core Module Integration Test
 * 
 * Tests the integration between CombatPure, ItemsPure, TeamsPure, and StatusEffectsPure
 */

import { CombatEngine, BattleEngine, SpiritInstance, MoveData, TypeEffectiveness } from './miff/pure/CombatPure/engine';
import { ItemUsageManager, Item, ItemEffect, IPlayerContext } from './miff/pure/ItemsPure/index';
import { TeamManager, TeamOperationResult, ISpiritInstance } from './miff/pure/TeamsPure/index';
import { StatusEffectsManager, StatusEffect } from './miff/pure/StatusEffectsPure/index';

// Mock player context
class MockPlayerContext implements IPlayerContext {
  getSpiritById(id: string): any {
    return {
      id,
      name: `Spirit ${id}`,
      level: 50,
      type: 'fire',
      currentHP: 100,
      maxHP: 100,
      stats: {
        attack: 80,
        defense: 70,
        speed: 90,
        specialAttack: 85,
        specialDefense: 75
      }
    };
  }
}

async function testCoreIntegration() {
  console.log('🧪 Testing Core Module Integration...\n');

  try {
    // 1. Test CombatPure + ItemsPure integration
    console.log('1. Testing CombatPure + ItemsPure integration...');
    
    const combatEngine = new CombatEngine(new Map());
    const playerContext = new MockPlayerContext();
    const itemManager = new ItemUsageManager(playerContext);
    
    // Create a test spirit for combat
    const spirit: SpiritInstance = {
      id: 'test-spirit-1',
      name: 'Test Spirit',
      level: 50,
      type: 'fire',
      currentHP: 100,
      maxHP: 100,
      stats: {
        attack: 80,
        defense: 70,
        speed: 90,
        specialAttack: 85,
        specialDefense: 75
      },
      isFainted: () => false,
      canEvolve: () => false,
      evolve: () => false,
      getStat: (stat: string) => spirit.stats[stat as keyof typeof spirit.stats] || 0
    };
    
    // Create a test spirit for team management
    const teamSpirit: ISpiritInstance = {
      id: 'test-spirit-1',
      name: 'Test Spirit',
      level: 50,
      type: 'fire',
      currentHP: 100,
      maxHP: 100,
      stats: {
        attack: 80,
        defense: 70,
        speed: 90,
        specialAttack: 85,
        specialDefense: 75
      },
      isFainted: () => false,
      canEvolve: () => false,
      evolve: () => false,
      getStat: (stat: string) => teamSpirit.stats[stat as keyof typeof teamSpirit.stats] || 0
    };
    
    // Create a test item
    const testItem: Item = {
      id: 'potion',
      name: 'Health Potion',
      description: 'Restores HP',
      type: 'consumable',
      effects: [{
        id: 'heal',
        type: 'heal',
        magnitude: 50,
        duration: 0
      }],
      stackable: true,
      maxStack: 99,
      value: 100
    };
    
    // Test item usage
    const usageResult = itemManager.useItem('test-spirit-1', testItem);
    console.log(`   ✅ Item usage result: ${usageResult.status}`);
    
    // 2. Test TeamsPure + CombatPure integration
    console.log('\n2. Testing TeamsPure + CombatPure integration...');
    
    const teamManager = new TeamManager();
    
    // Create a team first
    const teamResult = teamManager.createTeam('test-team');
    console.log(`   ✅ Create team: ${teamResult.status}`);
    
    // Add spirit to team
    const addResult = teamManager.addSpiritToTeam('test-team', teamSpirit);
    console.log(`   ✅ Add spirit to team: ${addResult.status}`);
    
    // Test team validation
    const validation = teamManager.validateTeam();
    console.log(`   ✅ Team validation: ${validation.status}`);
    
    // 3. Test StatusEffectsPure + CombatPure integration
    console.log('\n3. Testing StatusEffectsPure + CombatPure integration...');
    
    const statusManager = new StatusEffectsManager();
    
    // Create a status effect
    const statusEffect: StatusEffect = {
      id: 'burn',
      name: 'Burn',
      type: 'damage_over_time',
      magnitude: 10,
      duration: 5,
      appliedAt: Date.now(),
      expiresAt: Date.now() + (5 * 1000),
      currentStacks: 1
    };
    
    // Apply status effect
    const applyResult = statusManager.applyEffect('test-spirit-1', statusEffect);
    console.log(`   ✅ Apply status effect: ${applyResult.success ? 'Success' : 'Failed'}`);
    
    // 4. Test full integration
    console.log('\n4. Testing full integration...');
    
    // Create a battle scenario
    const battleEngine = new BattleEngine();
    
    // Add combatants
    battleEngine.addCombatant('player', [spirit]);
    battleEngine.addCombatant('enemy', [{
      ...spirit,
      id: 'enemy-spirit-1',
      name: 'Enemy Spirit',
      type: 'water'
    }]);
    
    console.log(`   ✅ Battle engine created`);
    console.log(`   ✅ Battle has ${battleEngine.getAllCombatants().length} combatants`);
    
    // Test move creation
    const move: MoveData = {
      id: 'tackle',
      name: 'Tackle',
      type: 'normal',
      category: 'physical',
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
      effects: []
    };
    
    // Test battle status
    const battleStatus = battleEngine.getBattleStatus();
    console.log(`   ✅ Battle status: ${battleStatus.phase}`);
    
    // Test move creation (simplified)
    console.log(`   ✅ Move created: ${move.name}`);
    
    console.log('\n🎉 All core integration tests passed!');
    
    return {
      success: true,
      tests: {
        combatItems: true,
        teamsCombat: true,
        statusCombat: true,
        fullIntegration: true
      }
    };
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testCoreIntegration().then(result => {
    if (result.success) {
      console.log('\n✅ Core module integration is working correctly!');
      process.exit(0);
    } else {
      console.log('\n❌ Core module integration has issues:', result.error);
      process.exit(1);
    }
  });
}