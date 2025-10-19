import { describe, it, expect } from '@jest/globals';
import { SurvivalSystemPure } from './index';

describe('SurvivalSystemPure', () => {
  describe('Survival State', () => {
    it('should create survival state', () => {
      const state = SurvivalSystemPure.create({
        hunger: 100,
        thirst: 100,
        health: 100
      });

      expect(state).toBeDefined();
      expect(state.hunger).toBe(100);
      expect(state.thirst).toBe(100);
      expect(state.health).toBe(100);
    });

    it('should decrease hunger over time', () => {
      const state = SurvivalSystemPure.create({ hunger: 100 });
      
      const updated = SurvivalSystemPure.tick(state, 1.0);
      expect(updated.hunger).toBeLessThan(100);
    });
  });

  describe('Resource Consumption', () => {
    it('should consume food to restore hunger', () => {
      const state = SurvivalSystemPure.create({ hunger: 50 });
      
      const fed = SurvivalSystemPure.consumeFood(state, 30);
      expect(fed.hunger).toBe(80);
    });

    it('should consume water to restore thirst', () => {
      const state = SurvivalSystemPure.create({ thirst: 40 });
      
      const hydrated = SurvivalSystemPure.consumeWater(state, 50);
      expect(hydrated.thirst).toBe(90);
    });
  });

  describe('Survival Checks', () => {
    it('should detect starvation', () => {
      const state = SurvivalSystemPure.create({ hunger: 0 });
      
      const isStarving = SurvivalSystemPure.isStarving(state);
      expect(isStarving).toBe(true);
    });

    it('should detect dehydration', () => {
      const state = SurvivalSystemPure.create({ thirst: 0 });
      
      const isDehydrated = SurvivalSystemPure.isDehydrated(state);
      expect(isDehydrated).toBe(true);
    });

    it('should check survival status', () => {
      const state = SurvivalSystemPure.create({ health: 10 });
      
      const isAlive = SurvivalSystemPure.isAlive(state);
      expect(typeof isAlive).toBe('boolean');
    });
  });
});
