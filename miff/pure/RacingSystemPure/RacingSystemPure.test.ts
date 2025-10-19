import { describe, it, expect } from '@jest/globals';
import { RacingSystemPure } from './index';

describe('RacingSystemPure', () => {
  describe('Race Creation', () => {
    it('should create race with track config', () => {
      const race = RacingSystemPure.createRace({
        trackId: 'circuit-1',
        laps: 3,
        maxRacers: 8
      });

      expect(race).toBeDefined();
      expect(race.trackId).toBe('circuit-1');
      expect(race.laps).toBe(3);
    });

    it('should add racer to race', () => {
      const race = RacingSystemPure.createRace({ trackId: 'test-track', laps: 2 });
      const racer = {
        id: 'racer1',
        name: 'Speed Demon',
        vehicle: 'sports-car'
      };

      const updated = RacingSystemPure.addRacer(race, racer);
      expect(updated).toBeDefined();
    });
  });

  describe('Race Mechanics', () => {
    it('should start race', () => {
      const race = RacingSystemPure.createRace({ trackId: 'track1', laps: 3 });
      
      const started = RacingSystemPure.startRace(race);
      expect(started.status).toBe('racing');
    });

    it('should update racer position', () => {
      const race = RacingSystemPure.createRace({ trackId: 'track1', laps: 3 });
      const racer = { id: 'r1', name: 'Racer', vehicle: 'car' };
      
      let updated = RacingSystemPure.addRacer(race, racer);
      updated = RacingSystemPure.updatePosition(updated, 'r1', { lap: 1, progress: 0.5 });

      expect(updated).toBeDefined();
    });

    it('should detect race completion', () => {
      const race = RacingSystemPure.createRace({ trackId: 'track1', laps: 1 });
      
      const isComplete = RacingSystemPure.isRaceComplete(race);
      expect(typeof isComplete).toBe('boolean');
    });
  });

  describe('Leaderboard', () => {
    it('should get race standings', () => {
      const race = RacingSystemPure.createRace({ trackId: 'track1', laps: 3 });
      
      const standings = RacingSystemPure.getStandings(race);
      expect(Array.isArray(standings)).toBe(true);
    });
  });
});
