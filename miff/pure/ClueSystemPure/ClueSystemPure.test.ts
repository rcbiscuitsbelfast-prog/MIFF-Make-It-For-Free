import { describe, it, expect } from '@jest/globals';
import { ClueSystemPure } from './index';

describe('ClueSystemPure', () => {
  describe('Clue Management', () => {
    it('should create clue system', () => {
      const system = ClueSystemPure.create();

      expect(system).toBeDefined();
      expect(system.clues).toBeDefined();
    });

    it('should add clue', () => {
      const system = ClueSystemPure.create();
      const clue = {
        id: 'clue1',
        title: 'Mysterious Note',
        description: 'A note with strange symbols',
        discovered: false
      };

      const updated = ClueSystemPure.addClue(system, clue);
      expect(updated.clues.length).toBe(1);
    });

    it('should discover clue', () => {
      const system = ClueSystemPure.create();
      const clue = { id: 'c1', title: 'Note', description: 'Text', discovered: false };

      let updated = ClueSystemPure.addClue(system, clue);
      updated = ClueSystemPure.discoverClue(updated, 'c1');

      const discoveredClue = updated.clues.find(c => c.id === 'c1');
      expect(discoveredClue?.discovered).toBe(true);
    });
  });

  describe('Clue Relationships', () => {
    it('should link related clues', () => {
      const system = ClueSystemPure.create();
      
      const updated = ClueSystemPure.linkClues(system, 'c1', 'c2');
      expect(updated).toBeDefined();
    });

    it('should get related clues', () => {
      const system = ClueSystemPure.create();
      
      const related = ClueSystemPure.getRelatedClues(system, 'c1');
      expect(Array.isArray(related)).toBe(true);
    });
  });

  describe('Discovery Progress', () => {
    it('should calculate discovery percentage', () => {
      const system = ClueSystemPure.create();
      
      const percentage = ClueSystemPure.getDiscoveryPercentage(system);
      expect(typeof percentage).toBe('number');
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
  });
});
