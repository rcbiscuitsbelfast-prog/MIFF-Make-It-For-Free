/**
 * Golden Tests for NPCsPure
 * 
 * Tests NPC management, behavior simulation, quest integration,
 * and export functionality with comprehensive scenarios.
 * 
 * @module NPCsPure/tests/golden_NPCsPure.test
 * @version 1.0.0
 * @license MIT
 */

import { NPCsManager, NPC } from '../Manager';

describe('NPCsPure Golden Tests', () => {
  let manager: NPCsManager;

  beforeEach(() => {
    manager = new NPCsManager();
  });

  describe('NPC Management', () => {
    test('should create and manage NPCs', () => {
      const npc: NPC = {
        id: 'test_npc' as any,
        name: 'Test NPC',
        stats: [
          { key: 'health', base: 100 },
          { key: 'mana', base: 50 }
        ],
        behavior: {
          type: 'friendly',
          aggression: 10,
          curiosity: 50,
          loyalty: 80
        },
        location: { zoneId: 'test_zone' as any, x: 10, y: 10 },
        questIds: [],
        movementPattern: { type: 'idle', speed: 1 },
        faction: 'test_faction',
        reputation: 75
      };

      const createResult = manager.createNPC(npc);
      expect(createResult.status).toBe('ok');
      expect(createResult.result?.id).toBe('test_npc');

      const getResult = manager.getNPC('test_npc' as any);
      expect(getResult.status).toBe('ok');
      expect(getResult.result?.name).toBe('Test NPC');
    });

    test('should handle NPC updates', () => {
      const updateResult = manager.updateNPC('npc_001' as any, { 
        name: 'Updated Elder Oak',
        reputation: 95
      });
      expect(updateResult.status).toBe('ok');
      expect(updateResult.result?.name).toBe('Updated Elder Oak');
      expect(updateResult.result?.reputation).toBe(95);
    });

    test('should handle NPC deletion', () => {
      const deleteResult = manager.deleteNPC('npc_001' as any);
      expect(deleteResult.status).toBe('ok');

      const getResult = manager.getNPC('npc_001' as any);
      expect(getResult.status).toBe('error');
    });
  });

  describe('NPC Filtering and Queries', () => {
    test('should filter NPCs by zone', () => {
      const listResult = manager.listNPCs({ zoneId: 'zone_village' as any });
      expect(listResult.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });

    test('should filter NPCs by behavior type', () => {
      const behaviorResult = manager.getNPCsByBehavior('quest_giver');
      expect(behaviorResult.status).toBe('ok');
      expect(Array.isArray(behaviorResult.result)).toBe(true);
    });

    test('should filter NPCs by reputation', () => {
      const repResult = manager.getNPCsByReputation(70, 100);
      expect(repResult.status).toBe('ok');
      expect(Array.isArray(repResult.result)).toBe(true);
    });
  });

  describe('Quest Integration', () => {
    test('should add quests to NPCs', () => {
      const addQuestResult = manager.addQuestToNPC('npc_001' as any, 'new_quest' as any);
      expect(addQuestResult.status).toBe('ok');
      expect(addQuestResult.result?.questIds).toContain('new_quest');
    });

    test('should remove quests from NPCs', () => {
      const removeQuestResult = manager.removeQuestFromNPC('npc_001' as any, 'quest_tutorial' as any);
      expect(removeQuestResult.status).toBe('ok');
      expect(removeQuestResult.result?.questIds).not.toContain('quest_tutorial');
    });
  });

  describe('Location and Behavior Updates', () => {
    test('should update NPC location', () => {
      const locationResult = manager.updateNPCLocation('npc_001' as any, 20, 30, 5);
      expect(locationResult.status).toBe('ok');
      expect(locationResult.result?.location.x).toBe(20);
      expect(locationResult.result?.location.y).toBe(30);
      expect(locationResult.result?.location.z).toBe(5);
    });

    test('should update NPC behavior', () => {
      const behaviorResult = manager.updateNPCBehavior('npc_001' as any, {
        aggression: 20,
        curiosity: 60
      });
      expect(behaviorResult.status).toBe('ok');
      expect(behaviorResult.result?.behavior.aggression).toBe(20);
      expect(behaviorResult.result?.behavior.curiosity).toBe(60);
    });

    test('should update NPC reputation', () => {
      const repResult = manager.updateNPCReputation('npc_001' as any, 85);
      expect(repResult.status).toBe('ok');
      expect(repResult.result?.reputation).toBe(85);
    });
  });

  describe('NPC Simulation', () => {
    test('should simulate NPC behavior', () => {
      const simResult = manager.simulateNPC('npc_001' as any, 60);
      expect(simResult.status).toBe('ok');
      expect(simResult.result?.duration).toBe(60);
      expect(Array.isArray(simResult.result?.events)).toBe(true);
      expect(Array.isArray(simResult.result?.interactions)).toBe(true);
    });
  });

  describe('Statistics and Analytics', () => {
    test('should provide NPC statistics', () => {
      const statsResult = manager.getNPCStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.total).toBeGreaterThan(0);
      expect(statsResult.result?.byBehavior).toBeDefined();
      expect(statsResult.result?.byFaction).toBeDefined();
      expect(statsResult.result?.withQuests).toBeGreaterThanOrEqual(0);
      expect(statsResult.result?.averageReputation).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Export Functionality', () => {
    test('should export NPCs in different formats', () => {
      // JSON export
      const jsonResult = manager.exportNPCs('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.total).toBeGreaterThan(0);

      // Manifest export
      const manifestResult = manager.exportNPCs('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.npcs.export.v1');

      // Summary export
      const summaryResult = manager.exportNPCs('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Quests export
      const questsResult = manager.exportNPCs('quests');
      expect(questsResult.status).toBe('ok');
      expect(questsResult.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Methods', () => {
    test('should get NPCs with quests', () => {
      const questNPCs = manager.getNPCsWithQuests();
      expect(Array.isArray(questNPCs)).toBe(true);
    });

    test('should get NPCs in zone', () => {
      const zoneNPCs = manager.getNPCsInZone('zone_village' as any);
      expect(Array.isArray(zoneNPCs)).toBe(true);
    });

    test('should get NPCs by faction', () => {
      const factionNPCs = manager.getNPCsByFaction('village_elders');
      expect(Array.isArray(factionNPCs)).toBe(true);
    });
  });

  describe('Reset and Management', () => {
    test('should reset all NPCs', () => {
      const resetResult = manager.resetNPCs();
      expect(resetResult.status).toBe('ok');
      expect(resetResult.result?.message).toBe('All NPCs reset to default state');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid NPC operations', () => {
      const getResult = manager.getNPC('nonexistent' as any);
      expect(getResult.status).toBe('error');
      expect(getResult.issues).toContain('NPC with ID nonexistent not found');

      const updateResult = manager.updateNPC('nonexistent' as any, { name: 'Test' });
      expect(updateResult.status).toBe('error');
      expect(updateResult.issues).toContain('NPC with ID nonexistent not found');
    });

    test('should handle duplicate NPC creation', () => {
      const npc: NPC = {
        id: 'npc_001' as any,
        name: 'Duplicate NPC',
        stats: [{ key: 'health', base: 100 }],
        behavior: { type: 'friendly', aggression: 0, curiosity: 50, loyalty: 50 },
        location: { zoneId: 'test_zone' as any, x: 0, y: 0 },
        questIds: [],
        movementPattern: { type: 'idle', speed: 1 }
      };

      const createResult = manager.createNPC(npc);
      expect(createResult.status).toBe('error');
      expect(createResult.issues).toContain('NPC with ID npc_001 already exists');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete NPC workflow', () => {
      // Create NPC
      const npc: NPC = {
        id: 'workflow_npc' as any,
        name: 'Workflow NPC',
        stats: [{ key: 'health', base: 100 }],
        behavior: { type: 'quest_giver', aggression: 0, curiosity: 80, loyalty: 90 },
        location: { zoneId: 'workflow_zone' as any, x: 0, y: 0 },
        questIds: [],
        movementPattern: { type: 'idle', speed: 1 },
        faction: 'workflow_faction',
        reputation: 50
      };

      const createResult = manager.createNPC(npc);
      expect(createResult.status).toBe('ok');

      // Add quest
      const addQuestResult = manager.addQuestToNPC('workflow_npc' as any, 'workflow_quest' as any);
      expect(addQuestResult.status).toBe('ok');

      // Update location
      const locationResult = manager.updateNPCLocation('workflow_npc' as any, 10, 20);
      expect(locationResult.status).toBe('ok');

      // Simulate
      const simResult = manager.simulateNPC('workflow_npc' as any, 30);
      expect(simResult.status).toBe('ok');

      // Export
      const exportResult = manager.exportNPCs('manifest');
      expect(exportResult.status).toBe('ok');

      // Get stats
      const statsResult = manager.getNPCStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.total).toBeGreaterThan(0);
    });
  });
});