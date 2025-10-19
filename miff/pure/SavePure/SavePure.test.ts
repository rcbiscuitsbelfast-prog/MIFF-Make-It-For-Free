import { describe, it, expect } from '@jest/globals';
import { SaveSystem } from './index';

const SavePure = SaveSystem;

describe('SavePure', () => {
  describe('Save System', () => {
    it('should create save system with default config', () => {
      const saveSystem = SavePure.create();
      expect(saveSystem).toBeDefined();
      expect(saveSystem.slots).toBeDefined();
    });

    it('should save game state to slot', () => {
      const saveSystem = SavePure.create();
      const gameState = {
        playerId: 'player1',
        level: 5,
        gold: 1000,
        inventory: ['sword', 'potion']
      };

      const result = SavePure.save(saveSystem, 0, gameState);
      expect(result.ok).toBe(true);
      expect(result.slots[0]).toBeDefined();
      expect(result.slots[0]!.data).toEqual(gameState);
    });

    it('should load game state from slot', () => {
      const saveSystem = SavePure.create();
      const gameState = { playerId: 'player1', level: 5 };

      const saved = SavePure.save(saveSystem, 0, gameState);
      const loaded = SavePure.load(saved, 0);

      expect(loaded.ok).toBe(true);
      expect(loaded.data).toEqual(gameState);
    });

    it('should fail to load from empty slot', () => {
      const saveSystem = SavePure.create();
      const result = SavePure.load(saveSystem, 0);

      expect(result.ok).toBe(false);
      expect(result.errors).toContain('No save data in slot 0');
    });

    it('should delete save from slot', () => {
      const saveSystem = SavePure.create();
      const gameState = { playerId: 'player1' };

      const saved = SavePure.save(saveSystem, 0, gameState);
      const deleted = SavePure.deleteSave(saved, 0);

      expect(deleted.ok).toBe(true);
      expect(deleted.slots[0]).toBeUndefined();
    });

    it('should list all saves', () => {
      const saveSystem = SavePure.create();
      
      SavePure.save(saveSystem, 0, { playerId: 'player1' });
      SavePure.save(saveSystem, 1, { playerId: 'player2' });

      const saves = SavePure.listSaves(saveSystem);
      expect(saves.length).toBe(2);
    });

    it('should validate save data integrity', () => {
      const saveSystem = SavePure.create();
      const gameState = { playerId: 'player1', level: 5 };

      const saved = SavePure.save(saveSystem, 0, gameState);
      const isValid = SavePure.validateSave(saved, 0);

      expect(isValid).toBe(true);
    });
  });

  describe('Auto-save', () => {
    it('should support auto-save functionality', () => {
      const saveSystem = SavePure.create({ autoSaveEnabled: true });
      expect(saveSystem.autoSaveEnabled).toBe(true);
    });
  });

  describe('Save Metadata', () => {
    it('should track save timestamps', () => {
      const saveSystem = SavePure.create();
      const gameState = { playerId: 'player1' };

      const saved = SavePure.save(saveSystem, 0, gameState);
      expect(saved.slots[0]!.timestamp).toBeDefined();
      expect(typeof saved.slots[0]!.timestamp).toBe('number');
    });
  });
});
