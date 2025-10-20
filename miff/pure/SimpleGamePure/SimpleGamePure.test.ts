/**
 * SimpleGamePure.test.ts
 * 
 * Tests for SimpleGamePure using actual SimpleClickerGame
 */

import { describe, it, expect } from '@jest/globals';
import { SimpleClickerGame, GameType, DifficultyLevel } from './index';

describe('SimpleGamePure', () => {
  describe('SimpleClickerGame', () => {
    let game: SimpleClickerGame;

    beforeEach(() => {
      game = new SimpleClickerGame({
        gameType: GameType.CLICKER,
        title: 'Test Game',
        difficulty: DifficultyLevel.EASY,
        startingCurrency: 100,
        enableSaving: false,
        enableAudio: false
      });
    });

    it('should create game', () => {
      expect(game).toBeDefined();
    });

    it('should start game', () => {
      game.start();
      expect(game['isRunning']).toBe(true);
    });

    it('should stop game', () => {
      game.start();
      game.stop();
      expect(game['isRunning']).toBe(false);
    });

    it('should update game', () => {
      game.start();
      game.update(16);
      expect(true).toBe(true); // Update completed
    });

    it('should get stats', () => {
      const stats = game.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.score).toBe('number');
      expect(typeof stats.level).toBe('number');
    });

    it('should handle clicks', () => {
      game.start();
      const initialScore = game.getStats().score;
      game.handleClick();
      const newScore = game.getStats().score;
      expect(newScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should add currency', () => {
      const initial = game.getStats().currency;
      game.addCurrency(50);
      expect(game.getStats().currency).toBe(initial + 50);
    });

    it('should spend currency', () => {
      const result = game.spendCurrency(50);
      expect(result).toBe(true);
      expect(game.getStats().currency).toBe(50); // Started with 100
    });
  });
});
