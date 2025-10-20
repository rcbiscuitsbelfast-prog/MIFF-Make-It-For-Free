/**
 * DialoguePure.test.ts
 * 
 * Tests for DialoguePure using actual DialogueEngine implementation
 */

import { DialogueEngine, DialogueTree, DialogueNode } from './Manager';

describe('DialoguePure', () => {
  let tree: DialogueTree;
  let engine: DialogueEngine;

  beforeEach(() => {
    const nodes = new Map<string, DialogueNode>();
    
    nodes.set('start', {
      id: 'start',
      type: 'text',
      content: 'Welcome to the game!',
      next: 'question'
    });

    nodes.set('question', {
      id: 'question',
      type: 'choice',
      content: 'What would you like to do?',
      choices: [
        { id: 'explore', text: 'Explore the area', next: 'explore_result' },
        { id: 'rest', text: 'Take a rest', next: 'rest_result' }
      ],
      next: 'end'
    });

    nodes.set('explore_result', {
      id: 'explore_result',
      type: 'text',
      content: 'You found a treasure!',
      next: 'end'
    });

    nodes.set('rest_result', {
      id: 'rest_result',
      type: 'text',
      content: 'You feel refreshed.',
      next: 'end'
    });

    nodes.set('end', {
      id: 'end',
      type: 'end',
      content: 'End of conversation.'
    });

    tree = {
      id: 'test_tree',
      name: 'Test Dialogue',
      version: '1.0',
      nodes,
      variables: new Map(),
      flags: new Set()
    };

    engine = new DialogueEngine(tree);
  });

  describe('Dialogue Initialization', () => {
    it('should create dialogue engine with tree', () => {
      expect(engine).toBeDefined();
    });

    it('should start dialogue at specified node', () => {
      const result = engine.start('start');
      
      expect(result).toBeDefined();
      expect(result?.node.id).toBe('start');
      expect(result?.node.content).toBe('Welcome to the game!');
    });
  });

  describe('Dialogue Flow', () => {
    it('should continue to next node', () => {
      engine.start('start');
      const result = engine.continue();
      
      expect(result).toBeDefined();
      expect(result?.node.id).toBe('question');
    });

    it('should handle choice selection', () => {
      engine.start('start');
      engine.continue();
      
      const result = engine.selectChoice('explore');
      
      expect(result).toBeDefined();
      expect(result?.node.id).toBe('explore_result');
    });

    it('should reach end node', () => {
      engine.start('start');
      engine.continue();
      engine.selectChoice('rest');
      const result = engine.continue();
      
      expect(result?.node.id).toBe('end');
      expect(result?.isEnd).toBe(true);
    });
  });

  describe('Dialogue Context', () => {
    it('should track dialogue history', () => {
      engine.start('start');
      engine.continue();
      
      const context = engine.getContext();
      
      expect(context).toBeDefined();
      expect(Array.isArray(context.history)).toBe(true);
      expect(context.history.length).toBeGreaterThan(0);
    });

    it('should track current node', () => {
      engine.start('start');
      engine.continue();
      
      const context = engine.getContext();
      expect(context.currentNode).toBe('question');
    });
  });

  describe('Dialogue Variables', () => {
    it('should set dialogue variable', () => {
      engine.start('start');
      engine.setVariable('player_name', 'Hero');
      
      const value = engine.getVariable('player_name');
      expect(value).toBe('Hero');
    });

    it('should get undefined for non-existent variable', () => {
      const value = engine.getVariable('non_existent');
      expect(value).toBeUndefined();
    });
  });

  describe('Dialogue Flags', () => {
    it('should set dialogue flag', () => {
      engine.start('start');
      engine.setFlag('quest_started');
      
      expect(engine.hasFlag('quest_started')).toBe(true);
    });

    it('should check non-existent flag as false', () => {
      expect(engine.hasFlag('non_existent_flag')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid node ID gracefully', () => {
      const result = engine.start('invalid_node');
      expect(result).toBeUndefined();
    });

    it('should handle invalid choice ID gracefully', () => {
      engine.start('start');
      engine.continue();
      
      const result = engine.selectChoice('invalid_choice');
      expect(result).toBeUndefined();
    });
  });
});
