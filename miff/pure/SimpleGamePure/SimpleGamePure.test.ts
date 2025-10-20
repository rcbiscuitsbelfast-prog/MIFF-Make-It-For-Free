/**
 * SimpleGamePure.test.ts
 * 
 * Tests for SimpleGamePure using actual SimpleGame abstract class and builders
 */

import { describe, it, expect } from '@jest/globals';
import { SimpleGameBuilder, SimpleClickerGame, GameType } from './index';

describe('SimpleGamePure', () => {
  describe('SimpleGameBuilder', () => {
    it('should create builder with config', () => {
      const builder = new SimpleGameBuilder({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });
      
      expect(builder).toBeDefined();
    });

    it('should build clicker game', () => {
      const builder = new SimpleGameBuilder({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });
      
      const game = builder.build();
      expect(game).toBeDefined();
      expect(game instanceof SimpleClickerGame).toBe(true);
    });
  });

  describe('SimpleClickerGame', () => {
    let game: SimpleClickerGame;

    beforeEach(() => {
      game = new SimpleClickerGame({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });
    });

    it('should initialize game', () => {
      game.initialize();
      expect(game.isInitialized()).toBe(true);
    });

    it('should start and stop game', () => {
      game.initialize();
      game.start();
      expect(game.isRunning()).toBe(true);
      
      game.stop();
      expect(game.isRunning()).toBe(false);
    });

    it('should update game state', () => {
      game.initialize();
      game.start();
      
      const deltaTime = 16; // 16ms frame
      game.update(deltaTime);
      
      expect(true).toBe(true); // Update executed without error
    });

    it('should handle click action', () => {
      game.initialize();
      game.start();
      
      const initialScore = game.getScore();
      game.handleClick();
      
      expect(game.getScore()).toBeGreaterThanOrEqual(initialScore);
    });

    it('should get game stats', () => {
      game.initialize();
      const stats = game.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.score).toBe('number');
      expect(typeof stats.clicks).toBe('number');
    });

    it('should pause and resume', () => {
      game.initialize();
      game.start();
      
      game.pause();
      expect(game.isPaused()).toBe(true);
      
      game.resume();
      expect(game.isPaused()).toBe(false);
    });
  });

  describe('Game Lifecycle', () => {
    it('should follow initialize → start → update → stop lifecycle', () => {
      const game = new SimpleClickerGame({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });

      expect(game.isInitialized()).toBe(false);
      expect(game.isRunning()).toBe(false);

      game.initialize();
      expect(game.isInitialized()).toBe(true);

      game.start();
      expect(game.isRunning()).toBe(true);

      game.update(16);
      expect(game.isRunning()).toBe(true);

      game.stop();
      expect(game.isRunning()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should not start before initialization', () => {
      const game = new SimpleClickerGame({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });

      expect(() => game.start()).toThrow();
    });

    it('should not update before starting', () => {
      const game = new SimpleClickerGame({
        type: GameType.CLICKER,
        difficulty: 'easy',
        maxPlayers: 1
      });

      game.initialize();
      expect(() => game.update(16)).toThrow();
    });
  });
});
