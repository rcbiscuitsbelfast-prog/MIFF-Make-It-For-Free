import { describe, it, expect } from '@jest/globals';
import { CreaturesPure } from './index';

describe('CreaturesPure', () => {
  describe('Creature Creation', () => {
    it('should create creature with basic stats', () => {
      const creature = CreaturesPure.create({
        id: 'goblin',
        name: 'Goblin',
        level: 1,
        stats: {
          hp: 100,
          attack: 10,
          defense: 5
        }
      });

      expect(creature).toBeDefined();
      expect(creature.id).toBe('goblin');
      expect(creature.name).toBe('Goblin');
      expect(creature.stats.hp).toBe(100);
    });

    it('should create creature with default values', () => {
      const creature = CreaturesPure.create({
        id: 'slime',
        name: 'Slime'
      });

      expect(creature).toBeDefined();
      expect(creature.id).toBe('slime');
    });
  });

  describe('Creature Stats', () => {
    it('should calculate effective stats', () => {
      const creature = CreaturesPure.create({
        id: 'warrior',
        name: 'Warrior',
        stats: { hp: 150, attack: 20, defense: 10 }
      });

      const stats = CreaturesPure.getStats(creature);
      expect(stats).toBeDefined();
      expect(stats.hp).toBeGreaterThan(0);
    });

    it('should apply stat modifiers', () => {
      const creature = CreaturesPure.create({
        id: 'mage',
        name: 'Mage',
        stats: { hp: 80, attack: 30, defense: 5 }
      });

      const buffed = CreaturesPure.applyModifier(creature, {
        attack: 10,
        defense: 5
      });

      expect(buffed).toBeDefined();
    });
  });

  describe('Creature Abilities', () => {
    it('should list creature abilities', () => {
      const creature = CreaturesPure.create({
        id: 'dragon',
        name: 'Dragon',
        abilities: ['fire_breath', 'fly']
      });

      const abilities = CreaturesPure.getAbilities(creature);
      expect(abilities).toContain('fire_breath');
      expect(abilities).toContain('fly');
    });
  });

  describe('Creature State', () => {
    it('should track creature health', () => {
      const creature = CreaturesPure.create({
        id: 'test',
        name: 'Test',
        stats: { hp: 100 }
      });

      expect(CreaturesPure.isAlive(creature)).toBe(true);
    });
  });
});
