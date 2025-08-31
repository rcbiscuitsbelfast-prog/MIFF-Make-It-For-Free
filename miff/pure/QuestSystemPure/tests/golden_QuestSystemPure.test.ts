import * as path from 'path';
import * as fs from 'fs';

/**
 * Golden test for QuestSystemPure
 * Tests quest logic, progress tracking, and completion flow
 * 
 * Remix-safe expectations:
 * - Quest processing is deterministic and pure
 * - Progress tracking works correctly
 * - Rewards are granted appropriately
 * - Quest state transitions are consistent
 */
describe('QuestSystemPure golden tests', () => {
  const root = path.resolve(__dirname, '..');
  
  test('golden quest system flow', () => {
    // Test quest progression from start to completion
    const questFixture = path.resolve(root, 'fixtures/quest_events.json');
    
    const out = (global as any).testUtils.runCLI(
      path.resolve(root, 'cliHarness.ts'),
      [questFixture]
    );
    
    const result = JSON.parse(out);
    
    // Verify quest state was updated correctly
    expect(result.questState).toBeDefined();
    expect(result.questState.quests).toBeDefined();
    expect(result.questState.quests.quest_herb_collection).toBeDefined();
    
    const quest = result.questState.quests.quest_herb_collection;
    
    // Verify quest completion
    expect(quest.status).toBe('completed');
    expect(quest.progress).toBe(100);
    expect(quest.currentStep).toBe('step_3');
    
    // Verify all steps are completed
    expect(quest.steps.step_1.completed).toBe(true);
    expect(quest.steps.step_2.completed).toBe(true);
    expect(quest.steps.step_3.completed).toBe(true);
    
    // Verify triggers are completed
    expect(quest.steps.step_1.triggers[0].completed).toBe(true);
    expect(quest.steps.step_2.triggers[0].completed).toBe(true);
    expect(quest.steps.step_3.triggers[0].completed).toBe(true);
    
    // Verify rewards were granted
    expect(result.rewardsGranted).toHaveLength(3);
    expect(result.rewardsGranted).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'xp', amount: 100, granted: true }),
        expect.objectContaining({ type: 'item', id: 'healing_potion', amount: 2, granted: true }),
        expect.objectContaining({ type: 'reputation', id: 'village', amount: 10, granted: true })
      ])
    );
    
    // Verify player stats were updated
    expect(result.questState.playerStats.xp).toBe(100);
    expect(result.questState.playerStats.inventory.healing_potion).toBe(2);
    expect(result.questState.playerStats.reputation.village).toBe(10);
    
    // Verify quest moved to completed list
    expect(result.questState.completedQuests).toContain('quest_herb_collection');
    expect(result.questState.activeQuests).not.toContain('quest_herb_collection');
    
    // Verify events were processed
    expect(result.events).toHaveLength(4);
    expect(result.completedQuests).toContain('quest_herb_collection');
    expect(result.failedQuests).toHaveLength(0);
  });
  
  test('golden quest system - partial progress', () => {
    // Test quest with only partial progress
    const partialFixture = {
      "state": {
        "quests": {
          "quest_herb_collection": {
            "id": "quest_herb_collection",
            "title": "Herb Collection",
            "description": "Collect healing herbs for the village elder",
            "steps": {
              "step_1": {
                "id": "step_1",
                "description": "Talk to the village elder",
                "triggers": [
                  {
                    "type": "talk",
                    "target": "elder",
                    "completed": false
                  }
                ],
                "next": "step_2",
                "completed": false,
                "requiredTriggers": 1
              },
              "step_2": {
                "id": "step_2",
                "description": "Collect 5 healing herbs",
                "triggers": [
                  {
                    "type": "collect",
                    "target": "healing_herb",
                    "amount": 5,
                    "completed": false
                  }
                ],
                "next": "step_3",
                "completed": false,
                "requiredTriggers": 1
              },
              "step_3": {
                "id": "step_3",
                "description": "Return to the elder",
                "triggers": [
                  {
                    "type": "talk",
                    "target": "elder",
                    "completed": false
                  }
                ],
                "completed": false,
                "requiredTriggers": 1
              }
            },
            "start": "step_1",
            "rewards": [
              {
                "type": "xp",
                "amount": 100,
                "granted": false
              }
            ],
            "status": "available",
            "currentStep": "step_1",
            "progress": 0
          }
        },
        "activeQuests": [],
        "completedQuests": [],
        "failedQuests": [],
        "playerStats": {
          "level": 1,
          "xp": 0,
          "inventory": {
            "healing_herb": 0
          },
          "location": { "x": 0, "y": 0 },
          "reputation": {}
        }
      },
      "events": [
        {
          "type": "start",
          "questId": "quest_herb_collection",
          "timestamp": 1000
        },
        {
          "type": "progress",
          "questId": "quest_herb_collection",
          "stepId": "step_1",
          "triggerData": {
            "type": "talk",
            "target": "elder"
          },
          "timestamp": 1100
        }
      ]
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_partial.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(partialFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify quest is active but not complete
      const quest = result.questState.quests.quest_herb_collection;
      expect(quest.status).toBe('active');
      expect(quest.progress).toBe(33); // 1 out of 3 steps
      expect(quest.currentStep).toBe('step_2');
      
      // Verify only first step is completed
      expect(quest.steps.step_1.completed).toBe(true);
      expect(quest.steps.step_2.completed).toBe(false);
      expect(quest.steps.step_3.completed).toBe(false);
      
      // Verify no rewards granted yet
      expect(result.rewardsGranted).toHaveLength(0);
      expect(result.completedQuests).toHaveLength(0);
      
      // Verify quest is in active list
      expect(result.questState.activeQuests).toContain('quest_herb_collection');
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
  
  test('golden quest system - quest failure', () => {
    // Test quest failure scenario
    const failureFixture = {
      "state": {
        "quests": {
          "quest_timed": {
            "id": "quest_timed",
            "title": "Timed Quest",
            "description": "Complete within time limit",
            "steps": {
              "step_1": {
                "id": "step_1",
                "description": "Complete quickly",
                "triggers": [
                  {
                    "type": "timer",
                    "seconds": 10,
                    "completed": false
                  }
                ],
                "completed": false,
                "requiredTriggers": 1
              }
            },
            "start": "step_1",
            "rewards": [
              {
                "type": "xp",
                "amount": 50,
                "granted": false
              }
            ],
            "status": "available",
            "currentStep": "step_1",
            "progress": 0
          }
        },
        "activeQuests": [],
        "completedQuests": [],
        "failedQuests": [],
        "playerStats": {
          "level": 1,
          "xp": 0,
          "inventory": {},
          "location": { "x": 0, "y": 0 },
          "reputation": {}
        }
      },
      "events": [
        {
          "type": "start",
          "questId": "quest_timed",
          "timestamp": 1000
        },
        {
          "type": "fail",
          "questId": "quest_timed",
          "timestamp": 2000
        }
      ]
    };
    
    // Write temporary fixture
    const tempFixturePath = path.resolve(root, 'fixtures/temp_failure.json');
    fs.writeFileSync(tempFixturePath, JSON.stringify(failureFixture, null, 2));
    
    try {
      const out = (global as any).testUtils.runCLI(
        path.resolve(root, 'cliHarness.ts'),
        [tempFixturePath]
      );
      
      const result = JSON.parse(out);
      
      // Verify quest failed
      const quest = result.questState.quests.quest_timed;
      expect(quest.status).toBe('failed');
      
      // Verify quest moved to failed list
      expect(result.questState.failedQuests).toContain('quest_timed');
      expect(result.questState.activeQuests).not.toContain('quest_timed');
      
      // Verify no rewards granted
      expect(result.rewardsGranted).toHaveLength(0);
      expect(result.completedQuests).toHaveLength(0);
      expect(result.failedQuests).toContain('quest_timed');
      
    } finally {
      // Cleanup
      fs.unlinkSync(tempFixturePath);
    }
  });
});