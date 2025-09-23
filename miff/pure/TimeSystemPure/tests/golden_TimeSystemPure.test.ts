/**
 * Golden Tests for TimeSystemPure
 * 
 * Tests time management, timers, cooldowns, scheduled events,
 * and export functionality with comprehensive scenarios.
 * 
 * @module TimeSystemPure/tests/golden_TimeSystemPure.test
 * @version 1.0.0
 * @license MIT
 */

import { TimeManager, Timer, Cooldown, ScheduledEvent, TimeScale } from '../Manager';

describe('TimeSystemPure Golden Tests', () => {
  let manager: TimeManager;

  beforeEach(() => {
    manager = new TimeManager();
  });

  describe('Time Management', () => {
    test('should get current time', () => {
      const nowResult = manager.now();
      expect(nowResult).toBeGreaterThanOrEqual(0);
    });

    test('should set time scale', () => {
      const setScaleResult = manager.setTimeScale(2.0);
      expect(setScaleResult.status).toBe('ok');
      expect(setScaleResult.result).toContain('Time scale set to 2');
    });

    test('should pause and resume time', () => {
      const pauseResult = manager.pause();
      expect(pauseResult.status).toBe('ok');
      expect(pauseResult.result).toBe('Time paused');

      const resumeResult = manager.resume();
      expect(resumeResult.status).toBe('ok');
      expect(resumeResult.result).toBe('Time resumed');
    });

    test('should handle invalid time scale', () => {
      const setScaleResult = manager.setTimeScale(-1.0);
      expect(setScaleResult.status).toBe('ok');
      expect(setScaleResult.result).toContain('Time scale set to 0'); // Should clamp to 0
    });
  });

  describe('Timer Management', () => {
    test('should add and manage timers', () => {
      const timer: Timer = {
        id: 'test_timer',
        duration: 5,
        remaining: 5,
        repeat: false
      };

      const addResult = manager.addTimer(timer);
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.id).toBe('test_timer');
      expect(addResult.result?.duration).toBe(5);
    });

    test('should handle repeating timers', () => {
      const timer: Timer = {
        id: 'repeat_timer',
        duration: 3,
        remaining: 3,
        repeat: true,
        maxRepeats: 2
      };

      const addResult = manager.addTimer(timer);
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.repeat).toBe(true);
    });

    test('should tick timers', () => {
      const timer: Timer = {
        id: 'tick_timer',
        duration: 2,
        remaining: 2,
        repeat: false
      };

      manager.addTimer(timer);
      
      // First tick - timer should not fire yet (1 second remaining)
      const tickResult1 = manager.tick(1);
      expect(tickResult1.status).toBe('ok');
      expect(tickResult1.result?.fired).not.toContain('timer:tick_timer');
      
      // Second tick - timer should fire now (0 seconds remaining)
      const tickResult2 = manager.tick(1);
      expect(tickResult2.status).toBe('ok');
      expect(tickResult2.result?.fired).toContain('timer:tick_timer');
    });

    test('should handle timer callbacks', () => {
      let callbackCalled = false;
      const timer: Timer = {
        id: 'callback_timer',
        duration: 1,
        remaining: 1,
        repeat: false,
        callback: () => { callbackCalled = true; }
      };

      manager.addTimer(timer);
      manager.tick(1.5);
      
      expect(callbackCalled).toBe(true);
    });
  });

  describe('Cooldown Management', () => {
    test('should add and manage cooldowns', () => {
      const addResult = manager.addCooldown('test_cooldown', 5, 'combat');
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.id).toBe('test_cooldown');
      expect(addResult.result?.duration).toBe(5);
    });

    test('should check cooldown status', () => {
      manager.addCooldown('check_cooldown', 3);
      
      const checkResult = manager.isCooldownReady('check_cooldown');
      expect(checkResult.status).toBe('ok');
      expect(checkResult.result?.ready).toBe(false);
      expect(checkResult.result?.remaining).toBe(3);
    });

    test('should handle cooldown completion', () => {
      manager.addCooldown('complete_cooldown', 2);
      
      const tickResult = manager.tick(2.5);
      expect(tickResult.status).toBe('ok');
      expect(tickResult.result?.fired).toContain('cooldown:complete_cooldown');
    });

    test('should handle invalid cooldown checks', () => {
      const checkResult = manager.isCooldownReady('nonexistent');
      expect(checkResult.status).toBe('error');
      expect(checkResult.issues).toContain('Cooldown with ID nonexistent not found');
    });
  });

  describe('Scheduled Events', () => {
    test('should schedule events', () => {
      const scheduleResult = manager.schedule('test_scheduled', 10, { message: 'Test event' });
      expect(scheduleResult.status).toBe('ok');
      expect(scheduleResult.result?.id).toBe('test_scheduled');
      expect(scheduleResult.result?.at).toBe(10);
    });

    test('should fire scheduled events', () => {
      manager.schedule('fire_scheduled', 5, { message: 'Fired event' });
      
      const tickResult = manager.tick(6);
      expect(tickResult.status).toBe('ok');
      expect(tickResult.result?.fired).toContain('scheduled:fire_scheduled');
    });

    test('should handle scheduled event callbacks', () => {
      let callbackCalled = false;
      manager.schedule('callback_scheduled', 2, { message: 'Callback event' }, () => {
        callbackCalled = true;
      });
      
      manager.tick(3);
      expect(callbackCalled).toBe(true);
    });
  });

  describe('Time Scaling', () => {
    test('should add time scales', () => {
      const scale: TimeScale = {
        id: 'test_scale',
        factor: 2.0,
        duration: 5,
        startTime: manager.now()
      };

      const addResult = manager.addTimeScale(scale);
      expect(addResult.status).toBe('ok');
      expect(addResult.result?.id).toBe('test_scale');
    });

    test('should apply time scaling to ticks', () => {
      manager.setTimeScale(2.0);
      
      const tickResult = manager.tick(1);
      expect(tickResult.status).toBe('ok');
      expect(tickResult.result?.dt).toBe(2.0); // Should be scaled
    });
  });

  describe('Cancellation', () => {
    test('should cancel timers', () => {
      const timer: Timer = {
        id: 'cancel_timer',
        duration: 5,
        remaining: 5,
        repeat: false
      };

      manager.addTimer(timer);
      const cancelResult = manager.cancel('cancel_timer');
      expect(cancelResult.status).toBe('ok');
      expect(cancelResult.result).toContain('Cancelled cancel_timer');
    });

    test('should cancel cooldowns', () => {
      manager.addCooldown('cancel_cooldown', 5);
      const cancelResult = manager.cancel('cancel_cooldown');
      expect(cancelResult.status).toBe('ok');
      expect(cancelResult.result).toContain('Cancelled cancel_cooldown');
    });

    test('should cancel scheduled events', () => {
      manager.schedule('cancel_scheduled', 10);
      const cancelResult = manager.cancel('cancel_scheduled');
      expect(cancelResult.status).toBe('ok');
      expect(cancelResult.result).toContain('Cancelled cancel_scheduled');
    });

    test('should handle cancellation of non-existent items', () => {
      const cancelResult = manager.cancel('nonexistent');
      expect(cancelResult.status).toBe('error');
      expect(cancelResult.issues).toContain('No timer, cooldown, or scheduled event found with ID nonexistent');
    });
  });

  describe('Time Filtering', () => {
    test('should filter by type', () => {
      const timer: Timer = {
        id: 'filter_timer',
        duration: 5,
        remaining: 5,
        repeat: false
      };
      manager.addTimer(timer);
      manager.addCooldown('filter_cooldown', 3);

      const listResult = manager.list({ type: 'timer' });
      expect(listResult.status).toBe('ok');
      expect(listResult.result?.timers).toHaveLength(1);
      expect(listResult.result?.cooldowns).toHaveLength(0);
    });

    test('should filter by category', () => {
      manager.addCooldown('combat_cooldown', 5, 'combat');
      manager.addCooldown('magic_cooldown', 3, 'magic');

      const listResult = manager.list({ category: 'combat' });
      expect(listResult.status).toBe('ok');
      expect(listResult.result?.cooldowns).toHaveLength(1);
    });

    test('should filter by duration range', () => {
      const timer: Timer = {
        id: 'short_timer',
        duration: 2,
        remaining: 2,
        repeat: false
      };
      const longTimer: Timer = {
        id: 'long_timer',
        duration: 10,
        remaining: 10,
        repeat: false
      };

      manager.addTimer(timer);
      manager.addTimer(longTimer);

      const listResult = manager.list({ minDuration: 5, maxDuration: 15 });
      expect(listResult.status).toBe('ok');
      expect(listResult.result?.timers).toHaveLength(1);
    });
  });

  describe('Time Statistics', () => {
    test('should provide time statistics', () => {
      const timer: Timer = {
        id: 'stats_timer',
        duration: 5,
        remaining: 5,
        repeat: false
      };
      manager.addTimer(timer);
      manager.addCooldown('stats_cooldown', 3);

      const statsResult = manager.getStats();
      expect(statsResult.status).toBe('ok');
      expect(statsResult.result?.totalTimers).toBe(1);
      expect(statsResult.result?.totalCooldowns).toBe(1);
      expect(statsResult.result?.activeTimers).toBe(1);
      expect(statsResult.result?.activeCooldowns).toBe(1);
    });
  });

  describe('Export Functionality', () => {
    test('should export time data in different formats', () => {
      const timer: Timer = {
        id: 'export_timer',
        duration: 5,
        remaining: 5,
        repeat: false
      };
      manager.addTimer(timer);
      manager.addCooldown('export_cooldown', 3);

      // JSON export
      const jsonResult = manager.exportTime('json');
      expect(jsonResult.status).toBe('ok');
      expect(jsonResult.result?.timers).toBeDefined();
      expect(jsonResult.result?.cooldowns).toBeDefined();

      // Manifest export
      const manifestResult = manager.exportTime('manifest');
      expect(manifestResult.status).toBe('ok');
      expect(manifestResult.result?.schema).toBe('miff.time.export.v1');

      // Summary export
      const summaryResult = manager.exportTime('summary');
      expect(summaryResult.status).toBe('ok');
      expect(summaryResult.result?.summary).toBeDefined();

      // Events export
      const eventsResult = manager.exportTime('events');
      expect(eventsResult.status).toBe('ok');
      expect(eventsResult.result?.scheduled).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid export formats', () => {
      const exportResult = manager.exportTime('invalid' as any);
      expect(exportResult.status).toBe('error');
      expect(exportResult.issues).toContain('Unknown export format: invalid');
    });

    test('should handle get remaining time for non-existent items', () => {
      const getResult = manager.getRemainingTime('nonexistent');
      expect(getResult.status).toBe('error');
      expect(getResult.issues).toContain('No timer or cooldown found with ID nonexistent');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete time workflow', () => {
      // Add various time elements
      const timer: Timer = {
        id: 'workflow_timer',
        duration: 5,
        remaining: 5,
        repeat: true,
        maxRepeats: 2
      };
      manager.addTimer(timer);

      manager.addCooldown('workflow_cooldown', 3, 'combat');
      manager.schedule('workflow_scheduled', 10, { message: 'Workflow event' });

      const scale: TimeScale = {
        id: 'workflow_scale',
        factor: 1.5,
        duration: 8,
        startTime: manager.now()
      };
      manager.addTimeScale(scale);

      // Simulate time passing
      const tickResults = [];
      for (let i = 0; i < 15; i++) {
        const tickResult = manager.tick(1);
        tickResults.push(tickResult);
      }

      // Get statistics
      const statsResult = manager.getStats();
      expect(statsResult.status).toBe('ok');

      // List all items
      const listResult = manager.list();
      expect(listResult.status).toBe('ok');

      // Export data
      const exportResult = manager.exportTime('manifest');
      expect(exportResult.status).toBe('ok');

      // Dump state
      const dumpResult = manager.dump();
      expect(dumpResult.status).toBe('ok');

      // Reset
      const resetResult = manager.resetTime();
      expect(resetResult.status).toBe('ok');
    });
  });
});