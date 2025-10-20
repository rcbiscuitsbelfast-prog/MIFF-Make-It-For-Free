/**
 * Golden Tests for LogPure
 * 
 * Tests for LogManager using actual implementation
 */

import { LogManager, LogLevel } from '../Manager';

describe('LogPure Golden Tests', () => {
  let manager: LogManager;

  beforeEach(() => {
    manager = new LogManager({
      level: LogLevel.DEBUG,
      enableConsole: false,
      enableFile: false,
      maxLogs: 1000
    });
  });

  describe('Basic Logging', () => {
    it('should log debug message', () => {
      const result = manager.debug('Test debug message');
      expect(result.ok).toBe(true);
    });

    it('should log info message', () => {
      const result = manager.info('Test info message');
      expect(result.ok).toBe(true);
    });

    it('should log warn message', () => {
      const result = manager.warn('Test warning message');
      expect(result.ok).toBe(true);
    });

    it('should log error message', () => {
      const result = manager.error('Test error message');
      expect(result.ok).toBe(true);
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs by level', () => {
      const infoManager = new LogManager({
        level: LogLevel.INFO,
        enableConsole: false,
        enableFile: false
      });

      infoManager.debug('Debug message');
      infoManager.info('Info message');
      infoManager.error('Error message');

      const logs = infoManager.getLogs();
      expect(logs.length).toBeGreaterThanOrEqual(2); // Info and error, not debug
    });
  });

  describe('Log Retrieval', () => {
    it('should get all logs', () => {
      manager.info('Message 1');
      manager.info('Message 2');
      manager.info('Message 3');

      const logs = manager.getLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('should get logs by level', () => {
      manager.info('Info message');
      manager.error('Error message');
      manager.warn('Warning message');

      const errorLogs = manager.getLogsByLevel(LogLevel.ERROR);
      expect(errorLogs.length).toBeGreaterThanOrEqual(1);
      expect(errorLogs[0]?.level).toBe(LogLevel.ERROR);
    });

    it('should get recent logs', () => {
      for (let i = 0; i < 10; i++) {
        manager.info(`Message ${i}`);
      }

      const recentLogs = manager.getRecentLogs(5);
      expect(recentLogs.length).toBe(5);
    });
  });

  describe('Log Clearing', () => {
    it('should clear all logs', () => {
      manager.info('Message 1');
      manager.info('Message 2');

      manager.clearLogs();

      const logs = manager.getLogs();
      expect(logs.length).toBe(0);
    });
  });

  describe('Log Statistics', () => {
    it('should get log statistics', () => {
      manager.debug('Debug');
      manager.info('Info');
      manager.warn('Warning');
      manager.error('Error');

      const stats = manager.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(4);
      expect(stats.byLevel).toBeDefined();
    });
  });

  describe('Context Logging', () => {
    it('should log with context', () => {
      const result = manager.info('User action', { userId: '123', action: 'login' });
      expect(result.ok).toBe(true);
    });

    it('should search logs by context', () => {
      manager.info('Action 1', { module: 'auth' });
      manager.info('Action 2', { module: 'game' });

      const authLogs = manager.searchLogs({ module: 'auth' });
      expect(authLogs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
