/**
 * DialoguePure.test.ts
 * 
 * Tests for DialoguePure using actual DialogueEngine
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
      content: 'Hello!',
      next: 'end'
    });

    nodes.set('end', {
      id: 'end',
      type: 'end',
      content: 'Goodbye.'
    });

    tree = {
      id: 'test',
      name: 'Test Dialogue',
      version: '1.0',
      nodes,
      variables: new Map(),
      flags: new Set()
    };

    engine = new DialogueEngine(tree);
  });

  describe('Dialogue Flow', () => {
    it('should start dialogue', () => {
      const result = engine.start('start');
      expect(result).toBeDefined();
      expect(result?.node.id).toBe('start');
    });

    it('should continue dialogue', () => {
      engine.start('start');
      const result = engine.continue();
      expect(result?.node.id).toBe('end');
    });

    it('should get context', () => {
      engine.start('start');
      const context = engine.getContext();
      expect(context).toBeDefined();
      expect(Array.isArray(context.history)).toBe(true);
    });
  });

  describe('Variables', () => {
    it('should set and get variables', () => {
      engine.start('start');
      engine.setVariable('name', 'Player');
      expect(engine.getVariable('name')).toBe('Player');
    });
  });

  describe('Flags', () => {
    it('should set and check flags', () => {
      engine.start('start');
      engine.setFlag('quest_started');
      expect(engine.hasFlag('quest_started')).toBe(true);
      expect(engine.hasFlag('other_flag')).toBe(false);
    });
  });
});
