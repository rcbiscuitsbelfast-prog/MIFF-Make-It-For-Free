/**
 * Golden Tests for QuestsPure
 * 
 * Tests quest management, progression tracking, step validation,
 * and export functionality with comprehensive scenarios.
 * 
 * @module QuestsPure/tests/golden_QuestsPure.test
 * @version 1.0.0
 * @license MIT
 */

import { QuestsManager, Quest } from '../Manager';

describe('QuestsPure Golden Tests', () => {
  let manager: QuestsManager;

  beforeEach(() => {
    manager = new QuestsManager();
  });

  describe('Quest Management', () => {
    test('should create and manage quests', () => {
      const quest: Quest = {
        id: 'test_quest',
        title: 'Test Quest',
        description: 'A test quest for validation',
        status: 'available',
        steps: [
          {
            id: 'step_1',
            type: 'talk',
            description: 'Talk to the NPC',
            target: 'npc_001',
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 100 },
          { type: 'gold', amount: 50 }
        ],
        level: 1,
        category: 'test',
        giver: 'npc_001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createResult = manager.createQuest(quest);
      expect(createResult.status).toBe('ok');
      expect(createResult.result?.id).toBe('test_quest');

      const getResult = manager.getQuest('test_quest');
      expect(getResult.status).toBe('ok');
      expect(getResult.result?.title).toBe('Test Quest');
    });

    test('should handle quest updates', () => {
      const updateResult = manager.updateQuest('tutorial_quest', { 
        title: 'Updated Tutorial Quest',
        level: 2
      });
      expect(updateResult.status).toBe('ok');
      expect(updateResult.result?.title).toBe('Updated Tutorial Quest');
      expect(updateResult.result?.level).toBe(2);
    });

    test('should handle quest deletion', () => {
      const deleteResult = manager.deleteQuest('tutorial_quest');
      expect(deleteResult.status).toBe('ok');

      const getResult = manager.getQuest('tutorial_quest');
      expect(getResult.status).toBe('error');
    });
  });

  describe('Quest Filtering and Queries', () => {
    test('should filter quests by status', () => {
      const listResult = manager.listQuests({ status: 'available' });
      expect(listResult.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });

    test('should filter quests by category', () => {
      const listResult = manager.listQuests({ category: 'tutorial' });
      expect(listResult.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });

    test('should filter quests by level', () => {
      const listResult = manager.listQuests({ level: 1 });
      expect(listResult.status).toBe('ok');
      expect(Array.isArray(listResult.result)).toBe(true);
    });
  });

  describe('Quest Progression', () => {
    test('should start quests', () => {
      const startResult = manager.startQuest('tutorial_quest');
      expect(startResult.status).toBe('ok');
      expect(startResult.result?.status).toBe('active');
    });

    test('should update quest progress', () => {
      // Start quest first
      manager.startQuest('tutorial_quest');
      
      const progressResult = manager.updateQuestProgress('tutorial_quest', 'talk_to_elder', true);
      expect(progressResult.status).toBe('ok');
      expect(progressResult.result?.completedSteps).toBeGreaterThan(0);
    });

    test('should complete quests', () => {
      // Start quest and complete all steps
      manager.startQuest('tutorial_quest');
      manager.updateQuestProgress('tutorial_quest', 'talk_to_elder', true);
      manager.updateQuestProgress('tutorial_quest', 'collect_herbs', true);
      
      const completeResult = manager.completeQuest('tutorial_quest');
      expect(completeResult.status).toBe('ok');
      expect(completeResult.result?.status).toBe('completed');
    });
  });

  describe('Quest Statistics', () => {
    test('should provide quest statistics', () => {
      const statsResult = manager.getQuestStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalQuests).toBeGreaterThan(0);
      expect(statsResult.result?.availableQuests).toBeGreaterThanOrEqual(0);
      expect(statsResult.result?.activeQuests).toBeGreaterThanOrEqual(0);
      expect(statsResult.result?.completedQuests).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Export Functionality', () => {
    test('should export quests in different formats', () => {
      // JSON export
      const jsonResult = manager.exportQuests('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.total).toBeGreaterThan(0);

      // Manifest export
      const manifestResult = manager.exportQuests('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.quests.export.v1');

      // Summary export
      const summaryResult = manager.exportQuests('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Active export
      const activeResult = manager.exportQuests('active');
      expect(activeResult.status).toBe('ok');
      expect(activeResult.result?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid quest operations', () => {
      const getResult = manager.getQuest('nonexistent');
      expect(getResult.status).toBe('error');
      expect(getResult.issues).toContain('Quest nonexistent not found');

      const updateResult = manager.updateQuest('nonexistent', { title: 'Test' });
      expect(updateResult.status).toBe('error');
      expect(updateResult.issues).toContain('Quest nonexistent not found');
    });

    test('should handle duplicate quest creation', () => {
      const quest: Quest = {
        id: 'tutorial_quest',
        title: 'Duplicate Quest',
        description: 'A duplicate quest',
        status: 'available',
        steps: [],
        rewards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createResult = manager.createQuest(quest);
      expect(createResult.status).toBe('error');
      expect(createResult.issues).toContain('Quest tutorial_quest already exists');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete quest workflow', () => {
      // Create quest
      const quest: Quest = {
        id: 'workflow_quest',
        title: 'Workflow Test',
        description: 'A quest for testing workflow',
        status: 'available',
        steps: [
          {
            id: 'step_1',
            type: 'talk',
            description: 'Talk to NPC',
            target: 'npc_001',
            completed: false
          },
          {
            id: 'step_2',
            type: 'collect',
            description: 'Collect item',
            target: 'item_001',
            quantity: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', amount: 200 },
          { type: 'gold', amount: 100 }
        ],
        level: 2,
        category: 'test',
        giver: 'npc_001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createResult = manager.createQuest(quest);
      expect(createResult.status).toBe('ok');

      // Start quest
      const startResult = manager.startQuest('workflow_quest');
      expect(startResult.status).toBe('ok');

      // Update progress
      const progressResult = manager.updateQuestProgress('workflow_quest', 'step_1', true);
      expect(progressResult.status).toBe('ok');

      // Complete quest
      manager.updateQuestProgress('workflow_quest', 'step_2', true);
      const completeResult = manager.completeQuest('workflow_quest');
      expect(completeResult.status).toBe('ok');

      // Export
      const exportResult = manager.exportQuests('manifest');
      expect(exportResult.status).toBe('ok');

      // Get stats
      const statsResult = manager.getQuestStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalQuests).toBeGreaterThan(0);
    });
  });
});