/**
 * StructuredLogger Test Suite
 * Basic test to verify Jest configuration is working
 */

import { StructuredLogger } from './StructuredLogger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    logger = StructuredLogger?.getInstance('test');
  });

  test('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(StructuredLogger);
  });

  test('should have info method', () => {
    expect(typeof logger?.info).toBe('function');
  });

  test('should have warn method', () => {
    expect(typeof logger?.warn).toBe('function');
  });

  test('should have error method', () => {
    expect(typeof logger?.error).toBe('function');
  });

  test('should have debug method', () => {
    expect(typeof logger?.debug).toBe('function');
  });

  test('should log info message', () => {
    const consoleSpy = jest?.spyOn(console, 'log').mockImplementation();
    
    logger?.info('Test message');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy?.mockRestore();
  });

  test('should log warning message', () => {
    const consoleSpy = jest?.spyOn(console, 'warn').mockImplementation();
    
    logger?.warn('Test warning');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy?.mockRestore();
  });

  test('should log error message', () => {
    const consoleSpy = jest?.spyOn(console, 'error').mockImplementation();
    
    logger?.error('Test error');
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy?.mockRestore();
  });
});