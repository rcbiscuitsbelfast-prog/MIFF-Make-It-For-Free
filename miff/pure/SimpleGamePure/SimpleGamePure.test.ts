/**
 * SimpleGamePure.test.ts
 * 
 * Tests for SimpleGamePure using actual SimpleClickerGame class
 */

import { describe, it, expect } from '@jest/globals';
import { SimpleClickerGame, GameType, DifficultyLevel } from './index';

describe('SimpleGamePure', () => {
  describe('SimpleClickerGame', () => {
    let game: SimpleClickerGame;

    beforeEach(() => {
      game = new SimpleClickerGame({
        gameType: GameType.CLICKER,
        title: 'Test Clicker',
        difficulty: DifficultyLevel.EASY,
        startingCurrency: 100,
        enableSaving: false,
        enableAudio: false
      });
    });

    it('should create game instance', () => {
      expect(game).toBeDefined();
    });

    it('should start game', () => {
      game.start();
      // Check internal state via public method
      const stats = game.getStats();
      expect(stats).toBeDefined();
    });

    it('should stop game', () => {
      game.start();
      game.stop();
      expect(true).toBe(true); // Stopped without error
    });

    it('should update game loop', () => {
      game.start();
      game.update(16); // 16ms frame
      expect(true).toBe(true); // Updated without error
    });

    it('should get game stats', () => {
      const stats = game.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.score).toBe('number');
      expect(typeof stats.level).toBe('number');
      expect(typeof stats.currency).toBe('number');
    });

    it('should handle clicks', () => {
      game.start();
      const beforeClick = game.getStats().currency;
      game.click(); // SimpleClickerGame has click() method
      const afterClick = game.getStats().currency;
      expect(afterClick).toBeGreaterThan(beforeClick);
    });

    it('should add currency', () => {
      const before = game.getStats().currency;
      game.addCurrency(50);
      const after = game.getStats().currency;
      expect(after).toBe(before + 50);
    });

    it('should spend currency', () => {
      const result = game.spendCurrency(50);
      expect(result).toBe(true);
      expect(game.getStats().currency).toBe(50); // Started with 100
    });

    it('should fail to spend more currency than available', () => {
      const result = game.spendCurrency(200);
      expect(result).toBe(false);
    });

    it('should upgrade click power', () => {
      const result = game.upgradeClickPower();
      expect(typeof result).toBe('boolean');
    });

    it('should buy auto clicker', () => {
      const result = game.buyAutoClicker();
      expect(typeof result).toBe('boolean');
    });

    it('should get config', () => {
      const config = game.getConfig();
      expect(config.gameType).toBe(GameType.CLICKER);
      expect(config.difficulty).toBe(DifficultyLevel.EASY);
    });
  });
});
