/**
 * DialoguePure.test.ts
 * 
 * Tests for DialoguePure module covering dialogue trees, CEL scripting, and narrative flow.
 */

import { 
  DialogueEngine, 
  DialogueTree, 
  DialogueNode, 
  DialogueChoice, 
  DialogueCondition, 
  DialogueAction,
  DialogueParser 
} from './DialoguePure';

describe('DialoguePure', () => {
  let sampleTree: DialogueTree;

  beforeEach(() => {
    // Create a sample dialogue tree for testing
    const nodes = new Map<string, DialogueNode>();
    
    // Start node
    nodes.set('start', {
      id: 'start',
      type: 'text',
      content: 'Hello, traveler! Welcome to our village.',
      next: 'greeting_choice'
    });

    // Choice node
    nodes.set('greeting_choice', {
      id: 'greeting_choice',
      type: 'choice',
      content: 'How would you like to respond?',
      choices: [
        {
          id: 'friendly',
          text: 'Hello! Nice to meet you.',
          next: 'friendly_response'
        },
        {
          id: 'rude',
          text: 'Whatever. Just tell me where the inn is.',
          next: 'rude_response'
        },
        {
          id: 'quest',
          text: 'I\'m looking for work. Any quests available?',
          condition: {
            type: 'flag',
            operator: 'exists',
            target: 'quests_available'
          },
          next: 'quest_offer'
        }
      ]
    });

    // Response nodes
    nodes.set('friendly_response', {
      id: 'friendly_response',
      type: 'text',
      content: 'You seem like a nice person! Let me show you around.',
      actions: [
        {
          type: 'set_flag',
          target: 'friendly_reputation',
          value: true
        }
      ],
      next: 'end'
    });

    nodes.set('rude_response', {
      id: 'rude_response',
      type: 'text',
      content: 'Well, the inn is down the street. Don\'t cause trouble.',
      actions: [
        {
          type: 'set_flag',
          target: 'rude_reputation',
          value: true
        }
      ],
      next: 'end'
    });

    nodes.set('quest_offer', {
      id: 'quest_offer',
      type: 'text',
      content: 'Actually, we do have a problem with wolves in the forest.',
      actions: [
        {
          type: 'start_quest',
          target: 'wolf_hunt'
        }
      ],
      next: 'quest_details'
    });

    nodes.set('quest_details', {
      id: 'quest_details',
      type: 'choice',
      content: 'Would you like to help us?',
      choices: [
        {
          id: 'accept',
          text: 'I\'ll help you with the wolves.',
          next: 'quest_accepted'
        },
        {
          id: 'decline',
          text: 'Sorry, I\'m not interested.',
          next: 'quest_declined'
        }
      ]
    });

    nodes.set('quest_accepted', {
      id: 'quest_accepted',
      type: 'text',
      content: 'Thank you! Here\'s a map to the forest.',
      actions: [
        {
          type: 'add_item',
          target: 'forest_map'
        }
      ],
      next: 'end'
    });

    nodes.set('quest_declined', {
      id: 'quest_declined',
      type: 'text',
      content: 'I understand. Maybe another time.',
      next: 'end'
    });

    // End node
    nodes.set('end', {
      id: 'end',
      type: 'end',
      content: 'Thank you for visiting our village!'
    });

    sampleTree = {
      id: 'village_greeting',
      name: 'Village Greeting',
      version: '1.0.0',
      nodes,
      variables: new Map([['player_name', 'Traveler']]),
      flags: new Set(['quests_available'])
    };
  });

  describe('DialogueParser', () => {
    it('should parse CEL-like scripts', () => {
      const script = 'player_reputation = 10';
      const parsed = (DialogueParser as any).parseCELScript(script);
      
      expect(parsed.type).toBe('assignment');
      expect(parsed.variable).toBe('player_reputation');
      expect(parsed.value).toBe('10');
    });

    it('should parse conditional scripts', () => {
      const script = 'if (player_level > 5) give_sword';
      const parsed = (DialogueParser as any).parseCELScript(script);
      
      expect(parsed.type).toBe('condition');
      expect(parsed.condition).toBe('player_level > 5');
      expect(parsed.action).toBe('give_sword');
    });

    it('should evaluate variable conditions', () => {
      const condition: DialogueCondition = {
        type: 'variable',
        operator: 'equals',
        target: 'player_name',
        value: 'Traveler'
      };

      const result = DialogueParser.parseCondition(condition);
      expect(result).toBe(true);
    });

    it('should evaluate flag conditions', () => {
      const condition: DialogueCondition = {
        type: 'flag',
        operator: 'exists',
        target: 'quests_available'
      };

      const result = DialogueParser.parseCondition(condition);
      expect(result).toBe(true);
    });
  });

  describe('DialogueEngine', () => {
    let engine: DialogueEngine;

    beforeEach(() => {
      engine = new DialogueEngine(sampleTree);
    });

    it('should start dialogue from beginning', () => {
      const result = engine.start();
      
      expect(result).not.toBeNull();
      expect(result?.node.id).toBe('start');
      expect(result?.node.content).toBe('Hello, traveler! Welcome to our village.');
      expect(result?.canContinue).toBe(true);
      expect(result?.isEnd).toBe(false);
    });

    it('should continue to next node', () => {
      engine.start();
      const result = engine.continue();
      
      expect(result).not.toBeNull();
      expect(result?.node.id).toBe('greeting_choice');
      expect(result?.node.type).toBe('choice');
      expect(result?.choices).toHaveLength(3);
    });

    it('should handle choice selection', () => {
      engine.start();
      engine.continue(); // Move to choice node
      
      const result = engine.selectChoice('friendly');
      
      expect(result).not.toBeNull();
      expect(result?.node.id).toBe('friendly_response');
      expect(result?.node.content).toContain('You seem like a nice person');
    });

    it('should execute actions when making choices', () => {
      engine.start();
      engine.continue();
      engine.selectChoice('friendly');
      
      const context = engine.getContext();
      expect(context.flags.has('friendly_reputation')).toBe(true);
    });

    it('should handle conditional choices', () => {
      engine.start();
      engine.continue();
      
      const result = engine.continue();
      expect(result?.choices).toHaveLength(3);
      
      // The quest choice should be available because quests_available flag is set
      const questChoice = result?.choices?.find(c => c.id === 'quest');
      expect(questChoice).toBeDefined();
    });

    it('should filter choices based on conditions', () => {
      // Remove the quests_available flag
      const modifiedTree = {
        ...sampleTree,
        flags: new Set()
      };
      const modifiedEngine = new DialogueEngine(modifiedTree);
      
      modifiedEngine.start();
      modifiedEngine.continue();
      
      const result = modifiedEngine.continue();
      expect(result?.choices).toHaveLength(2); // Should not include quest choice
      
      const questChoice = result?.choices?.find(c => c.id === 'quest');
      expect(questChoice).toBeUndefined();
    });

    it('should handle quest-related actions', () => {
      engine.start();
      engine.continue();
      engine.selectChoice('quest');
      
      const context = engine.getContext();
      const quest = context.quests.get('wolf_hunt');
      expect(quest).toBeDefined();
      expect(quest?.status).toBe('active');
      expect(quest?.progress).toBe(0);
    });

    it('should add items to inventory', () => {
      engine.start();
      engine.continue();
      engine.selectChoice('quest');
      engine.continue();
      engine.selectChoice('accept');
      
      const context = engine.getContext();
      expect(context.inventory.has('forest_map')).toBe(true);
    });

    it('should maintain dialogue history', () => {
      engine.start();
      engine.continue();
      engine.selectChoice('friendly');
      
      const history = engine.getDialogueHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history).toContain('friendly');
    });

    it('should handle context variables', () => {
      engine.setVariable('player_level', 10);
      expect(engine.getVariable('player_level')).toBe(10);
    });

    it('should handle flags', () => {
      engine.setFlag('has_sword', true);
      expect(engine.hasFlag('has_sword')).toBe(true);
      
      engine.setFlag('has_sword', false);
      expect(engine.hasFlag('has_sword')).toBe(false);
    });

    it('should handle inventory', () => {
      engine.addToInventory('health_potion');
      expect(engine.hasItem('health_potion')).toBe(true);
      
      engine.removeFromInventory('health_potion');
      expect(engine.hasItem('health_potion')).toBe(false);
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize dialogue trees', () => {
      const engine = new DialogueEngine(sampleTree);
      const serialized = engine.serialize();
      
      const deserializedTree = DialogueEngine.deserialize(serialized);
      const newEngine = new DialogueEngine(deserializedTree);
      
      const result1 = engine.start();
      const result2 = newEngine.start();
      
      expect(result1?.node.content).toBe(result2?.node.content);
      expect(result1?.canContinue).toBe(result2?.canContinue);
    });

    it('should preserve context during serialization', () => {
      const engine = new DialogueEngine(sampleTree);
      engine.setVariable('test_var', 'test_value');
      engine.setFlag('test_flag', true);
      engine.addToInventory('test_item');
      
      const serialized = engine.serialize();
      const deserializedTree = DialogueEngine.deserialize(serialized);
      const newEngine = new DialogueEngine(deserializedTree);
      
      expect(newEngine.getVariable('test_var')).toBe('test_value');
      expect(newEngine.hasFlag('test_flag')).toBe(true);
      expect(newEngine.hasItem('test_item')).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle branching dialogue paths', () => {
      const engine = new DialogueEngine(sampleTree);
      
      // Take friendly path
      engine.start();
      engine.continue();
      engine.selectChoice('friendly');
      
      const context1 = engine.getContext();
      expect(context1.flags.has('friendly_reputation')).toBe(true);
      expect(context1.flags.has('rude_reputation')).toBe(false);
      
      // Reset and take rude path
      const engine2 = new DialogueEngine(sampleTree);
      engine2.start();
      engine2.continue();
      engine2.selectChoice('rude');
      
      const context2 = engine2.getContext();
      expect(context2.flags.has('friendly_reputation')).toBe(false);
      expect(context2.flags.has('rude_reputation')).toBe(true);
    });

    it('should handle quest progression', () => {
      const engine = new DialogueEngine(sampleTree);
      
      engine.start();
      engine.continue();
      engine.selectChoice('quest');
      engine.continue();
      engine.selectChoice('accept');
      
      const context = engine.getContext();
      const quest = context.quests.get('wolf_hunt');
      expect(quest?.status).toBe('active');
      
      // Simulate quest completion
      engine.setVariable('wolves_defeated', 5);
      if (engine.getVariable('wolves_defeated') >= 5) {
        const questAction: DialogueAction = {
          type: 'complete_quest',
          target: 'wolf_hunt'
        };
        DialogueParser.executeAction(questAction, context);
      }
      
      const updatedQuest = context.quests.get('wolf_hunt');
      expect(updatedQuest?.status).toBe('completed');
      expect(updatedQuest?.progress).toBe(100);
    });
  });
});