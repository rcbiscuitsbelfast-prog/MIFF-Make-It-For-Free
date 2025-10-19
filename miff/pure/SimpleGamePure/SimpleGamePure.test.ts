import { describe, it, expect } from '@jest/globals';
import { SimpleGame } from './index';

const SimpleGamePure = SimpleGame;

describe('SimpleGamePure', () => {
  describe('Game Creation', () => {
    it('should create simple game with default config', () => {
      const game = SimpleGamePure.create({
        name: 'Test Game',
        initialState: { score: 0, level: 1 }
      });

      expect(game).toBeDefined();
      expect(game.name).toBe('Test Game');
      expect(game.state).toEqual({ score: 0, level: 1 });
    });

    it('should create game with custom config', () => {
      const game = SimpleGamePure.create({
        name: 'Custom Game',
        initialState: { score: 100 },
        maxPlayers: 4
      });

      expect(game.name).toBe('Custom Game');
      expect(game.maxPlayers).toBe(4);
    });
  });

  describe('Game Loop', () => {
    it('should start game', () => {
      const game = SimpleGamePure.create({
        name: 'Test Game',
        initialState: { running: false }
      });

      const started = SimpleGamePure.start(game);
      expect(started.state.running).toBe(true);
    });

    it('should stop game', () => {
      const game = SimpleGamePure.create({
        name: 'Test Game',
        initialState: { running: true }
      });

      const stopped = SimpleGamePure.stop(game);
      expect(stopped.state.running).toBe(false);
    });

    it('should update game state', () => {
      const game = SimpleGamePure.create({
        name: 'Test Game',
        initialState: { score: 0 }
      });

      const updated = SimpleGamePure.update(game, { score: 100 });
      expect(updated.state.score).toBe(100);
    });
  });

  describe('Game Events', () => {
    it('should track achievements', () => {
      const game = SimpleGamePure.create({
        name: 'Test Game',
        initialState: { achievements: [] }
      });

      const withAchievement = SimpleGamePure.unlockAchievement(game, 'first_win');
      expect(withAchievement.state.achievements).toContain('first_win');
    });
  });
});
