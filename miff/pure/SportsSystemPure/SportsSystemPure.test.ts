import { describe, it, expect } from '@jest/globals';
import { SportsSystemPure } from './index';

describe('SportsSystemPure', () => {
  describe('Match Creation', () => {
    it('should create sports match', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'basketball',
        team1: 'Team A',
        team2: 'Team B'
      });

      expect(match).toBeDefined();
      expect(match.sport).toBe('basketball');
    });

    it('should initialize match with default settings', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'soccer',
        team1: 'Home',
        team2: 'Away'
      });

      expect(match.score).toBeDefined();
    });
  });

  describe('Score Management', () => {
    it('should update match score', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'basketball',
        team1: 'A',
        team2: 'B'
      });

      const updated = SportsSystemPure.updateScore(match, 'A', 2);
      expect(updated).toBeDefined();
    });

    it('should get current score', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'soccer',
        team1: 'A',
        team2: 'B'
      });

      const score = SportsSystemPure.getScore(match);
      expect(score).toBeDefined();
    });
  });

  describe('Match State', () => {
    it('should start match', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'basketball',
        team1: 'A',
        team2: 'B'
      });

      const started = SportsSystemPure.startMatch(match);
      expect(started.status).toBe('playing');
    });

    it('should end match', () => {
      const match = SportsSystemPure.createMatch({
        sport: 'soccer',
        team1: 'A',
        team2: 'B'
      });

      const ended = SportsSystemPure.endMatch(match);
      expect(ended.status).toBe('finished');
    });
  });
});
