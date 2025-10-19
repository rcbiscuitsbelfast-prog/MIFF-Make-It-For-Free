import { describe, it, expect } from '@jest/globals';
import { CharacterGeneratorPure } from './index';

describe('CharacterGeneratorPure', () => {
  describe('Character Generation', () => {
    it('should generate random character', () => {
      const character = CharacterGeneratorPure.generateRandom();

      expect(character).toBeDefined();
      expect(character.name).toBeDefined();
      expect(character.class).toBeDefined();
    });

    it('should generate character with seed', () => {
      const seed = 12345;
      const char1 = CharacterGeneratorPure.generateRandom({ seed });
      const char2 = CharacterGeneratorPure.generateRandom({ seed });

      // Same seed should produce same character
      expect(char1.name).toBe(char2.name);
      expect(char1.class).toBe(char2.class);
    });

    it('should generate character with constraints', () => {
      const character = CharacterGeneratorPure.generateRandom({
        class: 'warrior',
        level: 5
      });

      expect(character.class).toBe('warrior');
      expect(character.level).toBe(5);
    });
  });

  describe('Character Attributes', () => {
    it('should generate balanced stats', () => {
      const character = CharacterGeneratorPure.generateRandom();

      expect(character.stats).toBeDefined();
      expect(character.stats.strength).toBeGreaterThan(0);
      expect(character.stats.intelligence).toBeGreaterThan(0);
    });

    it('should generate appropriate skills for class', () => {
      const warrior = CharacterGeneratorPure.generateRandom({ class: 'warrior' });
      const mage = CharacterGeneratorPure.generateRandom({ class: 'mage' });

      expect(warrior.skills).toBeDefined();
      expect(mage.skills).toBeDefined();
    });
  });

  describe('Name Generation', () => {
    it('should generate unique names', () => {
      const name1 = CharacterGeneratorPure.generateName();
      const name2 = CharacterGeneratorPure.generateName();

      expect(name1).toBeDefined();
      expect(name2).toBeDefined();
      expect(typeof name1).toBe('string');
      expect(typeof name2).toBe('string');
    });
  });
});
